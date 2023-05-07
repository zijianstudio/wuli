// Copyright 2020, University of Colorado Boulder

/**
 * This prints out (in JSON form) the tests and operations requested for continuous testing for whatever is in master
 * at this point.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const getActiveRepos = require('./common/getActiveRepos');
const getRepoList = require('./common/getRepoList');
const fs = require('fs');
const repos = getActiveRepos();
const phetioRepos = getRepoList('phet-io');
const phetioAPIStableRepos = getRepoList('phet-io-api-stable');
const runnableRepos = getRepoList('active-runnables');
const interactiveDescriptionRepos = getRepoList('interactive-description');
const phetioNoState = getRepoList('phet-io-state-unsupported');
const unitTestRepos = getRepoList('unit-tests');
const voicingRepos = getRepoList('voicing');

/**
 * {Array.<Object>} test
 * {string} type
 * {string} [url]
 * {string} [repo]
 * {string} [queryParameters]
 * {string} [testQueryParameters]
 * {boolean} [es5]
 * {string} [brand]
 * {number} [priority=1] - higher priorities are tested more eagerly
 * {Array.<string>} buildDependencies
 */
const tests = [];
tests.push({
  test: ['perennial', 'lint-everything'],
  type: 'lint-everything',
  priority: 100
});

// phet and phet-io brand builds
[...runnableRepos, 'scenery', 'kite', 'dot'].forEach(repo => {
  tests.push({
    test: [repo, 'build'],
    type: 'build',
    brands: phetioRepos.includes(repo) ? ['phet', 'phet-io'] : ['phet'],
    repo: repo,
    priority: 1
  });
});

// lints
repos.forEach(repo => {
  // Rosetta specifies the lint task a bit differently, see https://github.com/phetsims/rosetta/issues/366
  if (fs.existsSync(`../${repo}/Gruntfile.js`) || repo === 'rosetta') {
    tests.push({
      test: [repo, 'lint'],
      type: 'lint',
      repo: repo,
      priority: 8
    });
  }
});
runnableRepos.forEach(repo => {
  tests.push({
    test: [repo, 'fuzz', 'unbuilt'],
    type: 'sim-test',
    url: `${repo}/${repo}_en.html`,
    queryParameters: 'brand=phet&ea&fuzz',
    testQueryParameters: 'duration=90000' // This is the most important test, let's get some good coverage!
  });

  tests.push({
    test: [repo, 'xss-fuzz'],
    type: 'sim-test',
    url: `${repo}/${repo}_en.html`,
    queryParameters: 'brand=phet&ea&fuzz&stringTest=xss',
    testQueryParameters: 'duration=10000',
    priority: 0.3
  });
  tests.push({
    test: [repo, 'fuzz', 'unbuilt', 'assertSlow'],
    type: 'sim-test',
    url: `${repo}/${repo}_en.html`,
    queryParameters: 'brand=phet&eall&fuzz',
    priority: 0.001
  });
  tests.push({
    test: [repo, 'fuzz', 'unbuilt', 'listenerOrderRandom'],
    type: 'sim-test',
    url: `${repo}/${repo}_en.html`,
    queryParameters: 'brand=phet&ea&fuzz&listenerOrder=random',
    priority: 0.3
  });
  tests.push({
    test: [repo, 'multitouch-fuzz', 'unbuilt'],
    type: 'sim-test',
    url: `${repo}/${repo}_en.html`,
    queryParameters: 'brand=phet&ea&fuzz&fuzzPointers=2&supportsPanAndZoom=false'
  });
  tests.push({
    test: [repo, 'pan-and-zoom-fuzz', 'unbuilt'],
    type: 'sim-test',
    url: `${repo}/${repo}_en.html`,
    queryParameters: 'brand=phet&ea&fuzz&fuzzPointers=2&supportsPanAndZoom=true',
    priority: 0.5 // test this when there isn't other work to be done
  });

  tests.push({
    test: [repo, 'fuzz', 'built'],
    type: 'sim-test',
    url: `${repo}/build/phet/${repo}_en_phet.html`,
    queryParameters: 'fuzz',
    testQueryParameters: 'duration=80000',
    // We want to elevate the priority so that we get a more even balance (we can't test these until they are built,
    // which doesn't happen always)
    priority: 2,
    brand: 'phet',
    buildDependencies: [repo],
    es5: true
  });
  if (phetioRepos.includes(repo)) {
    tests.push({
      test: [repo, 'fuzz', 'built-phet-io'],
      type: 'sim-test',
      url: `${repo}/build/phet-io/${repo}_all_phet-io.html`,
      queryParameters: 'fuzz&phetioStandalone',
      testQueryParameters: 'duration=80000',
      brand: 'phet-io',
      buildDependencies: [repo],
      es5: true
    });
  }
});
phetioRepos.forEach(repo => {
  tests.push({
    test: [repo, 'phet-io-fuzz', 'unbuilt'],
    type: 'sim-test',
    url: `${repo}/${repo}_en.html`,
    queryParameters: 'ea&brand=phet-io&phetioStandalone&fuzz'
  });

  // Test for API compatibility, for sims that support it
  phetioAPIStableRepos.includes(repo) && tests.push({
    test: [repo, 'phet-io-api-compatibility', 'unbuilt'],
    type: 'sim-test',
    url: `${repo}/${repo}_en.html`,
    queryParameters: 'ea&brand=phet-io&phetioStandalone&phetioCompareAPI&randomSeed=332211&locales=*',
    // NOTE: DUPLICATION ALERT: random seed must match that of API generation, see generatePhetioMacroAPI.js
    priority: 1.5 // more often than the average test
  });

  // fuzz test important wrappers
  tests.push({
    test: [repo, 'phet-io-studio-fuzz', 'unbuilt'],
    type: 'wrapper-test',
    url: `studio/?sim=${repo}&phetioWrapperDebug=true&fuzz`
  });

  // only test state on phet-io sims that support it
  phetioNoState.indexOf(repo) === -1 && tests.push({
    test: [repo, 'phet-io-state-fuzz', 'unbuilt'],
    type: 'wrapper-test',
    url: `phet-io-wrappers/state/?sim=${repo}&phetioDebug=true&phetioWrapperDebug=true&fuzz`
  });

  // phet-io wrappers tests for each PhET-iO Sim
  [false, true].forEach(useAssert => {
    tests.push({
      test: [repo, 'phet-io-wrappers-tests', useAssert ? 'assert' : 'no-assert'],
      type: 'qunit-test',
      url: `phet-io-wrappers/phet-io-wrappers-tests.html?sim=${repo}${useAssert ? '&phetioDebug=true&phetioWrapperDebug=true' : ''}`
    });
  });
});
interactiveDescriptionRepos.forEach(repo => {
  tests.push({
    test: [repo, 'interactive-description-fuzz', 'unbuilt'],
    type: 'sim-test',
    url: `${repo}/${repo}_en.html`,
    queryParameters: 'brand=phet&ea&fuzz&supportsInteractiveDescription=true',
    testQueryParameters: 'duration=40000'
  });
  tests.push({
    test: [repo, 'interactive-description-fuzz-fuzzBoard-combo', 'unbuilt'],
    type: 'sim-test',
    url: `${repo}/${repo}_en.html`,
    queryParameters: 'brand=phet&ea&supportsInteractiveDescription=true&fuzz&fuzzBoard',
    testQueryParameters: 'duration=40000'
  });
  tests.push({
    test: [repo, 'interactive-description-fuzzBoard', 'unbuilt'],
    type: 'sim-test',
    url: `${repo}/${repo}_en.html`,
    queryParameters: 'brand=phet&ea&fuzzBoard&supportsInteractiveDescription=true',
    testQueryParameters: 'duration=40000'
  });
  tests.push({
    test: [repo, 'interactive-description-fuzz', 'built'],
    type: 'sim-test',
    url: `${repo}/build/phet/${repo}_en_phet.html`,
    queryParameters: 'fuzz&supportsInteractiveDescription=true',
    testQueryParameters: 'duration=40000',
    brand: 'phet',
    buildDependencies: [repo],
    es5: true
  });
  tests.push({
    test: [repo, 'interactive-description-fuzzBoard', 'built'],
    type: 'sim-test',
    url: `${repo}/build/phet/${repo}_en_phet.html`,
    queryParameters: 'fuzzBoard&supportsInteractiveDescription=true',
    testQueryParameters: 'duration=40000',
    brand: 'phet',
    buildDependencies: [repo],
    es5: true
  });
});
voicingRepos.forEach(repo => {
  tests.push({
    test: [repo, 'voicing-fuzz', 'unbuilt'],
    type: 'sim-test',
    url: `${repo}/${repo}_en.html`,
    queryParameters: 'brand=phet&ea&fuzz&voicingInitiallyEnabled',
    testQueryParameters: 'duration=40000'
  });
  tests.push({
    test: [repo, 'voicing-fuzzBoard', 'unbuilt'],
    type: 'sim-test',
    url: `${repo}/${repo}_en.html`,
    queryParameters: 'brand=phet&ea&fuzzBoard&voicingInitiallyEnabled',
    testQueryParameters: 'duration=40000'
  });
});

// repo-specific Unit tests (unbuilt mode) from `grunt generate-test-harness`
unitTestRepos.forEach(repo => {
  // Skip phet-io-wrappers unit tests here, we run it with multiple repos above
  if (repo === 'phet-io-wrappers') {
    return;
  }

  // All tests should work with no query parameters, with assertions enabled, and should support PhET-iO also, so test
  // with brand=phet-io
  const queryParameters = ['', '?ea', '?brand=phet-io', '?ea&brand=phet-io'];
  queryParameters.forEach(queryString => {
    // Don't test phet-io or tandem unit tests in phet brand, they are meant for phet-io brand
    if ((repo === 'phet-io' || repo === 'tandem') && !queryString.includes('phet-io')) {
      return;
    }
    tests.push({
      test: [repo, 'top-level-unit-tests', `unbuilt${queryString}`],
      type: 'qunit-test',
      url: `${repo}/${repo}-tests.html${queryString}`
    });
  });
});

// Page-load tests (non-built)
[{
  repo: 'dot',
  urls: ['',
  // the root URL
  'doc/', 'examples/', 'examples/convex-hull-2.html', 'tests/', 'tests/playground.html']
}, {
  repo: 'kite',
  urls: ['',
  // the root URL
  'doc/', 'examples/', 'tests/', 'tests/playground.html', 'tests/visual-shape-test.html']
}, {
  repo: 'scenery',
  urls: ['',
  // the root URL
  'doc/', 'doc/a-tour-of-scenery.html', 'doc/accessibility/accessibility.html', 'doc/implementation-notes.html', 'doc/user-input.html', 'doc/layout.html', 'doc/accessibility/voicing.html', 'examples/', 'examples/cursors.html', 'examples/hello-world.html', 'examples/input-multiple-displays.html', 'examples/input.html', 'examples/mouse-wheel.html', 'examples/multi-touch.html', 'examples/nodes.html', 'examples/shapes.html', 'examples/sprites.html', 'examples/accessibility-shapes.html', 'examples/accessibility-button.html', 'examples/accessibility-animation.html', 'examples/accessibility-listeners.html', 'examples/accessibility-updating-pdom.html', 'examples/accessibility-slider.html',
  // 'examples/webglnode.html', // currently disabled, since it fails without webgl
  'tests/', 'tests/playground.html', 'tests/renderer-comparison.html?renderers=canvas,svg,dom', 'tests/sandbox.html', 'tests/text-bounds-comparison.html', 'tests/text-quality-test.html']
}, {
  repo: 'phet-lib',
  urls: ['doc/layout-exemplars.html']
}].forEach(({
  repo,
  urls
}) => {
  urls.forEach(pageloadRelativeURL => {
    tests.push({
      test: [repo, 'pageload', `/${pageloadRelativeURL}`],
      type: 'pageload-test',
      url: `${repo}/${pageloadRelativeURL}`,
      priority: 4 // Fast to test, so test them more
    });
  });
});

// // Page-load tests (built)
// [
//
// ].forEach( ( { repo, urls } ) => {
//   urls.forEach( pageloadRelativeURL => {
//     tests.push( {
//       test: [ repo, 'pageload', `/${pageloadRelativeURL}` ],
//       type: 'pageload-test',
//       url: `${repo}/${pageloadRelativeURL}`,
//       priority: 5, // When these are built, it should be really quick to test
//
//       brand: 'phet',
//       es5: true
//     } );
//   } );
// } );

//----------------------------------------------------------------------------------------------------------------------
// Public query parameter tests
//----------------------------------------------------------------------------------------------------------------------

// test non-default public query parameter values to make sure there are no obvious problems.
const commonQueryParameters = {
  allowLinksFalse: 'brand=phet&fuzz&ea&allowLinks=false',
  screens1: 'brand=phet&fuzz&ea&screens=1',
  screens21: 'brand=phet&fuzz&ea&screens=2,1',
  screens21NoHome: 'brand=phet&fuzz&ea&screens=2,1&homeScreen=false',
  initialScreen2NoHome: 'brand=phet&fuzz&ea&initialScreen=2&homeScreen=false',
  initialScreen2: 'brand=phet&fuzz&ea&initialScreen=2',
  // Purposefully use incorrect syntax to make sure it is caught correctly without crashing
  screensVerbose: 'brand=phet&fuzz&ea&screens=Screen1,Screen2',
  screensOther: 'brand=phet&fuzz&ea&screens=1.1,Screen2'
};
Object.keys(commonQueryParameters).forEach(name => {
  const queryString = commonQueryParameters[name];

  // randomly picked multi-screen sim to test query parameters (hence calling it a joist test)
  tests.push({
    test: ['joist', 'fuzz', 'unbuilt', 'query-parameters', name],
    type: 'sim-test',
    url: 'acid-base-solutions/acid-base-solutions_en.html',
    queryParameters: queryString
  });
});

//----------------------------------------------------------------------------------------------------------------------
// Additional sim-specific tests
//----------------------------------------------------------------------------------------------------------------------

// beers-law-lab: test various query parameters
tests.push({
  test: ['beers-law-lab', 'fuzz', 'unbuilt', 'query-parameters'],
  type: 'sim-test',
  url: 'beers-law-lab/beers-law-lab_en.html',
  queryParameters: 'brand=phet&ea&fuzz&showSoluteAmount&concentrationMeterUnits=percent&beakerUnits=milliliters'
});

// circuit-construction-kit-ac: test various query parameters
tests.push({
  test: ['circuit-construction-kit-ac', 'fuzz', 'unbuilt', 'query-parameters'],
  type: 'sim-test',
  url: 'circuit-construction-kit-ac/circuit-construction-kit-ac_en.html',
  // Public query parameters that cannot be triggered from options within the sim
  queryParameters: 'brand=phet&ea&fuzz&showCurrent&addRealBulbs&moreWires&moreInductors'
});

// energy forms and changes: four blocks and one burner
tests.push({
  test: ['energy-forms-and-changes', 'fuzz', 'unbuilt', 'query-parameters'],
  type: 'sim-test',
  url: 'energy-forms-and-changes/energy-forms-and-changes_en.html',
  queryParameters: 'brand=phet&ea&fuzz&screens=1&elements=iron,brick,iron,brick&burners=1'
});

// energy forms and changes: two beakers and 2 burners
tests.push({
  test: ['energy-forms-and-changes', 'fuzz', 'unbuilt', 'query-parameters-2'],
  type: 'sim-test',
  url: 'energy-forms-and-changes/energy-forms-and-changes_en.html',
  queryParameters: 'brand=phet&ea&fuzz&screens=1&&elements=oliveOil,water&burners=2'
});

// gas-properties: test pressureNoise query parameter
tests.push({
  test: ['gas-properties', 'fuzz', 'unbuilt', 'query-parameters'],
  type: 'sim-test',
  url: 'gas-properties/gas-properties_en.html',
  queryParameters: 'brand=phet&ea&fuzz&pressureNoise=false'
});

// natural-selection: test various query parameters
tests.push({
  test: ['natural-selection', 'fuzz', 'unbuilt', 'query-parameters'],
  type: 'sim-test',
  url: 'natural-selection/natural-selection_en.html',
  queryParameters: 'brand=phet&ea&fuzz&allelesVisible=false&introMutations=F&introPopulation=10Ff&labMutations=FeT&labPopulation=2FFeett,2ffEEtt,2ffeeTT'
});

// natural-selection: run the generation clock faster, so that more things are liable to happen
tests.push({
  test: ['natural-selection', 'fuzz', 'unbuilt', 'secondsPerGeneration'],
  type: 'sim-test',
  url: 'natural-selection/natural-selection_en.html',
  queryParameters: 'brand=phet&ea&fuzz&secondsPerGeneration=1'
});

// ph-scale: test the autofill query parameter
tests.push({
  test: ['ph-scale', 'autofill-fuzz', 'unbuilt', 'query-parameters'],
  type: 'sim-test',
  url: 'ph-scale/ph-scale_en.html',
  queryParameters: 'brand=phet&ea&fuzz&autoFill=false'
});

// number-play: test the second language preference
tests.push({
  test: ['number-play', 'second-language-fuzz', 'unbuilt', 'query-parameters'],
  type: 'sim-test',
  url: 'number-play/number-play_en.html',
  queryParameters: 'brand=phet&ea&fuzz&locales=*&secondLocale=es'
});

// number-compare: test the second language preference
tests.push({
  test: ['number-compare', 'second-language-fuzz', 'unbuilt', 'query-parameters'],
  type: 'sim-test',
  url: 'number-compare/number-compare_en.html',
  queryParameters: 'brand=phet&ea&fuzz&locales=*&secondLocale=es'
});
console.log(JSON.stringify(tests, null, 2));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRBY3RpdmVSZXBvcyIsInJlcXVpcmUiLCJnZXRSZXBvTGlzdCIsImZzIiwicmVwb3MiLCJwaGV0aW9SZXBvcyIsInBoZXRpb0FQSVN0YWJsZVJlcG9zIiwicnVubmFibGVSZXBvcyIsImludGVyYWN0aXZlRGVzY3JpcHRpb25SZXBvcyIsInBoZXRpb05vU3RhdGUiLCJ1bml0VGVzdFJlcG9zIiwidm9pY2luZ1JlcG9zIiwidGVzdHMiLCJwdXNoIiwidGVzdCIsInR5cGUiLCJwcmlvcml0eSIsImZvckVhY2giLCJyZXBvIiwiYnJhbmRzIiwiaW5jbHVkZXMiLCJleGlzdHNTeW5jIiwidXJsIiwicXVlcnlQYXJhbWV0ZXJzIiwidGVzdFF1ZXJ5UGFyYW1ldGVycyIsImJyYW5kIiwiYnVpbGREZXBlbmRlbmNpZXMiLCJlczUiLCJpbmRleE9mIiwidXNlQXNzZXJ0IiwicXVlcnlTdHJpbmciLCJ1cmxzIiwicGFnZWxvYWRSZWxhdGl2ZVVSTCIsImNvbW1vblF1ZXJ5UGFyYW1ldGVycyIsImFsbG93TGlua3NGYWxzZSIsInNjcmVlbnMxIiwic2NyZWVuczIxIiwic2NyZWVuczIxTm9Ib21lIiwiaW5pdGlhbFNjcmVlbjJOb0hvbWUiLCJpbml0aWFsU2NyZWVuMiIsInNjcmVlbnNWZXJib3NlIiwic2NyZWVuc090aGVyIiwiT2JqZWN0Iiwia2V5cyIsIm5hbWUiLCJjb25zb2xlIiwibG9nIiwiSlNPTiIsInN0cmluZ2lmeSJdLCJzb3VyY2VzIjpbImxpc3RDb250aW51b3VzVGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgcHJpbnRzIG91dCAoaW4gSlNPTiBmb3JtKSB0aGUgdGVzdHMgYW5kIG9wZXJhdGlvbnMgcmVxdWVzdGVkIGZvciBjb250aW51b3VzIHRlc3RpbmcgZm9yIHdoYXRldmVyIGlzIGluIG1hc3RlclxyXG4gKiBhdCB0aGlzIHBvaW50LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuY29uc3QgZ2V0QWN0aXZlUmVwb3MgPSByZXF1aXJlKCAnLi9jb21tb24vZ2V0QWN0aXZlUmVwb3MnICk7XHJcbmNvbnN0IGdldFJlcG9MaXN0ID0gcmVxdWlyZSggJy4vY29tbW9uL2dldFJlcG9MaXN0JyApO1xyXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcclxuXHJcbmNvbnN0IHJlcG9zID0gZ2V0QWN0aXZlUmVwb3MoKTtcclxuY29uc3QgcGhldGlvUmVwb3MgPSBnZXRSZXBvTGlzdCggJ3BoZXQtaW8nICk7XHJcbmNvbnN0IHBoZXRpb0FQSVN0YWJsZVJlcG9zID0gZ2V0UmVwb0xpc3QoICdwaGV0LWlvLWFwaS1zdGFibGUnICk7XHJcbmNvbnN0IHJ1bm5hYmxlUmVwb3MgPSBnZXRSZXBvTGlzdCggJ2FjdGl2ZS1ydW5uYWJsZXMnICk7XHJcbmNvbnN0IGludGVyYWN0aXZlRGVzY3JpcHRpb25SZXBvcyA9IGdldFJlcG9MaXN0KCAnaW50ZXJhY3RpdmUtZGVzY3JpcHRpb24nICk7XHJcbmNvbnN0IHBoZXRpb05vU3RhdGUgPSBnZXRSZXBvTGlzdCggJ3BoZXQtaW8tc3RhdGUtdW5zdXBwb3J0ZWQnICk7XHJcbmNvbnN0IHVuaXRUZXN0UmVwb3MgPSBnZXRSZXBvTGlzdCggJ3VuaXQtdGVzdHMnICk7XHJcbmNvbnN0IHZvaWNpbmdSZXBvcyA9IGdldFJlcG9MaXN0KCAndm9pY2luZycgKTtcclxuXHJcbi8qKlxyXG4gKiB7QXJyYXkuPE9iamVjdD59IHRlc3RcclxuICoge3N0cmluZ30gdHlwZVxyXG4gKiB7c3RyaW5nfSBbdXJsXVxyXG4gKiB7c3RyaW5nfSBbcmVwb11cclxuICoge3N0cmluZ30gW3F1ZXJ5UGFyYW1ldGVyc11cclxuICoge3N0cmluZ30gW3Rlc3RRdWVyeVBhcmFtZXRlcnNdXHJcbiAqIHtib29sZWFufSBbZXM1XVxyXG4gKiB7c3RyaW5nfSBbYnJhbmRdXHJcbiAqIHtudW1iZXJ9IFtwcmlvcml0eT0xXSAtIGhpZ2hlciBwcmlvcml0aWVzIGFyZSB0ZXN0ZWQgbW9yZSBlYWdlcmx5XHJcbiAqIHtBcnJheS48c3RyaW5nPn0gYnVpbGREZXBlbmRlbmNpZXNcclxuICovXHJcbmNvbnN0IHRlc3RzID0gW107XHJcblxyXG50ZXN0cy5wdXNoKCB7XHJcbiAgdGVzdDogWyAncGVyZW5uaWFsJywgJ2xpbnQtZXZlcnl0aGluZycgXSxcclxuICB0eXBlOiAnbGludC1ldmVyeXRoaW5nJyxcclxuICBwcmlvcml0eTogMTAwXHJcbn0gKTtcclxuXHJcbi8vIHBoZXQgYW5kIHBoZXQtaW8gYnJhbmQgYnVpbGRzXHJcbltcclxuICAuLi5ydW5uYWJsZVJlcG9zLFxyXG4gICdzY2VuZXJ5JyxcclxuICAna2l0ZScsXHJcbiAgJ2RvdCdcclxuXS5mb3JFYWNoKCByZXBvID0+IHtcclxuICB0ZXN0cy5wdXNoKCB7XHJcbiAgICB0ZXN0OiBbIHJlcG8sICdidWlsZCcgXSxcclxuICAgIHR5cGU6ICdidWlsZCcsXHJcbiAgICBicmFuZHM6IHBoZXRpb1JlcG9zLmluY2x1ZGVzKCByZXBvICkgPyBbICdwaGV0JywgJ3BoZXQtaW8nIF0gOiBbICdwaGV0JyBdLFxyXG4gICAgcmVwbzogcmVwbyxcclxuICAgIHByaW9yaXR5OiAxXHJcbiAgfSApO1xyXG59ICk7XHJcblxyXG4vLyBsaW50c1xyXG5yZXBvcy5mb3JFYWNoKCByZXBvID0+IHtcclxuICAvLyBSb3NldHRhIHNwZWNpZmllcyB0aGUgbGludCB0YXNrIGEgYml0IGRpZmZlcmVudGx5LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Jvc2V0dGEvaXNzdWVzLzM2NlxyXG4gIGlmICggZnMuZXhpc3RzU3luYyggYC4uLyR7cmVwb30vR3J1bnRmaWxlLmpzYCApIHx8IHJlcG8gPT09ICdyb3NldHRhJyApIHtcclxuICAgIHRlc3RzLnB1c2goIHtcclxuICAgICAgdGVzdDogWyByZXBvLCAnbGludCcgXSxcclxuICAgICAgdHlwZTogJ2xpbnQnLFxyXG4gICAgICByZXBvOiByZXBvLFxyXG4gICAgICBwcmlvcml0eTogOFxyXG4gICAgfSApO1xyXG4gIH1cclxufSApO1xyXG5cclxucnVubmFibGVSZXBvcy5mb3JFYWNoKCByZXBvID0+IHtcclxuICB0ZXN0cy5wdXNoKCB7XHJcbiAgICB0ZXN0OiBbIHJlcG8sICdmdXp6JywgJ3VuYnVpbHQnIF0sXHJcbiAgICB0eXBlOiAnc2ltLXRlc3QnLFxyXG4gICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxyXG4gICAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JyxcclxuICAgIHRlc3RRdWVyeVBhcmFtZXRlcnM6ICdkdXJhdGlvbj05MDAwMCcgLy8gVGhpcyBpcyB0aGUgbW9zdCBpbXBvcnRhbnQgdGVzdCwgbGV0J3MgZ2V0IHNvbWUgZ29vZCBjb3ZlcmFnZSFcclxuICB9ICk7XHJcblxyXG4gIHRlc3RzLnB1c2goIHtcclxuICAgIHRlc3Q6IFsgcmVwbywgJ3hzcy1mdXp6JyBdLFxyXG4gICAgdHlwZTogJ3NpbS10ZXN0JyxcclxuICAgIHVybDogYCR7cmVwb30vJHtyZXBvfV9lbi5odG1sYCxcclxuICAgIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmZnV6eiZzdHJpbmdUZXN0PXhzcycsXHJcbiAgICB0ZXN0UXVlcnlQYXJhbWV0ZXJzOiAnZHVyYXRpb249MTAwMDAnLFxyXG4gICAgcHJpb3JpdHk6IDAuM1xyXG4gIH0gKTtcclxuXHJcbiAgdGVzdHMucHVzaCgge1xyXG4gICAgdGVzdDogWyByZXBvLCAnZnV6eicsICd1bmJ1aWx0JywgJ2Fzc2VydFNsb3cnIF0sXHJcbiAgICB0eXBlOiAnc2ltLXRlc3QnLFxyXG4gICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxyXG4gICAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYWxsJmZ1enonLFxyXG4gICAgcHJpb3JpdHk6IDAuMDAxXHJcbiAgfSApO1xyXG5cclxuICB0ZXN0cy5wdXNoKCB7XHJcbiAgICB0ZXN0OiBbIHJlcG8sICdmdXp6JywgJ3VuYnVpbHQnLCAnbGlzdGVuZXJPcmRlclJhbmRvbScgXSxcclxuICAgIHR5cGU6ICdzaW0tdGVzdCcsXHJcbiAgICB1cmw6IGAke3JlcG99LyR7cmVwb31fZW4uaHRtbGAsXHJcbiAgICBxdWVyeVBhcmFtZXRlcnM6ICdicmFuZD1waGV0JmVhJmZ1enombGlzdGVuZXJPcmRlcj1yYW5kb20nLFxyXG4gICAgcHJpb3JpdHk6IDAuM1xyXG4gIH0gKTtcclxuXHJcbiAgdGVzdHMucHVzaCgge1xyXG4gICAgdGVzdDogWyByZXBvLCAnbXVsdGl0b3VjaC1mdXp6JywgJ3VuYnVpbHQnIF0sXHJcbiAgICB0eXBlOiAnc2ltLXRlc3QnLFxyXG4gICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxyXG4gICAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JmZ1enpQb2ludGVycz0yJnN1cHBvcnRzUGFuQW5kWm9vbT1mYWxzZSdcclxuICB9ICk7XHJcblxyXG4gIHRlc3RzLnB1c2goIHtcclxuICAgIHRlc3Q6IFsgcmVwbywgJ3Bhbi1hbmQtem9vbS1mdXp6JywgJ3VuYnVpbHQnIF0sXHJcbiAgICB0eXBlOiAnc2ltLXRlc3QnLFxyXG4gICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxyXG4gICAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JmZ1enpQb2ludGVycz0yJnN1cHBvcnRzUGFuQW5kWm9vbT10cnVlJyxcclxuICAgIHByaW9yaXR5OiAwLjUgLy8gdGVzdCB0aGlzIHdoZW4gdGhlcmUgaXNuJ3Qgb3RoZXIgd29yayB0byBiZSBkb25lXHJcbiAgfSApO1xyXG5cclxuICB0ZXN0cy5wdXNoKCB7XHJcbiAgICB0ZXN0OiBbIHJlcG8sICdmdXp6JywgJ2J1aWx0JyBdLFxyXG4gICAgdHlwZTogJ3NpbS10ZXN0JyxcclxuICAgIHVybDogYCR7cmVwb30vYnVpbGQvcGhldC8ke3JlcG99X2VuX3BoZXQuaHRtbGAsXHJcbiAgICBxdWVyeVBhcmFtZXRlcnM6ICdmdXp6JyxcclxuICAgIHRlc3RRdWVyeVBhcmFtZXRlcnM6ICdkdXJhdGlvbj04MDAwMCcsXHJcblxyXG4gICAgLy8gV2Ugd2FudCB0byBlbGV2YXRlIHRoZSBwcmlvcml0eSBzbyB0aGF0IHdlIGdldCBhIG1vcmUgZXZlbiBiYWxhbmNlICh3ZSBjYW4ndCB0ZXN0IHRoZXNlIHVudGlsIHRoZXkgYXJlIGJ1aWx0LFxyXG4gICAgLy8gd2hpY2ggZG9lc24ndCBoYXBwZW4gYWx3YXlzKVxyXG4gICAgcHJpb3JpdHk6IDIsXHJcblxyXG4gICAgYnJhbmQ6ICdwaGV0JyxcclxuICAgIGJ1aWxkRGVwZW5kZW5jaWVzOiBbIHJlcG8gXSxcclxuICAgIGVzNTogdHJ1ZVxyXG4gIH0gKTtcclxuXHJcbiAgaWYgKCBwaGV0aW9SZXBvcy5pbmNsdWRlcyggcmVwbyApICkge1xyXG4gICAgdGVzdHMucHVzaCgge1xyXG4gICAgICB0ZXN0OiBbIHJlcG8sICdmdXp6JywgJ2J1aWx0LXBoZXQtaW8nIF0sXHJcbiAgICAgIHR5cGU6ICdzaW0tdGVzdCcsXHJcbiAgICAgIHVybDogYCR7cmVwb30vYnVpbGQvcGhldC1pby8ke3JlcG99X2FsbF9waGV0LWlvLmh0bWxgLFxyXG4gICAgICBxdWVyeVBhcmFtZXRlcnM6ICdmdXp6JnBoZXRpb1N0YW5kYWxvbmUnLFxyXG4gICAgICB0ZXN0UXVlcnlQYXJhbWV0ZXJzOiAnZHVyYXRpb249ODAwMDAnLFxyXG5cclxuICAgICAgYnJhbmQ6ICdwaGV0LWlvJyxcclxuICAgICAgYnVpbGREZXBlbmRlbmNpZXM6IFsgcmVwbyBdLFxyXG4gICAgICBlczU6IHRydWVcclxuICAgIH0gKTtcclxuICB9XHJcbn0gKTtcclxuXHJcbnBoZXRpb1JlcG9zLmZvckVhY2goIHJlcG8gPT4ge1xyXG5cclxuICB0ZXN0cy5wdXNoKCB7XHJcbiAgICB0ZXN0OiBbIHJlcG8sICdwaGV0LWlvLWZ1enonLCAndW5idWlsdCcgXSxcclxuICAgIHR5cGU6ICdzaW0tdGVzdCcsXHJcbiAgICB1cmw6IGAke3JlcG99LyR7cmVwb31fZW4uaHRtbGAsXHJcbiAgICBxdWVyeVBhcmFtZXRlcnM6ICdlYSZicmFuZD1waGV0LWlvJnBoZXRpb1N0YW5kYWxvbmUmZnV6eidcclxuICB9ICk7XHJcblxyXG4gIC8vIFRlc3QgZm9yIEFQSSBjb21wYXRpYmlsaXR5LCBmb3Igc2ltcyB0aGF0IHN1cHBvcnQgaXRcclxuICBwaGV0aW9BUElTdGFibGVSZXBvcy5pbmNsdWRlcyggcmVwbyApICYmIHRlc3RzLnB1c2goIHtcclxuICAgIHRlc3Q6IFsgcmVwbywgJ3BoZXQtaW8tYXBpLWNvbXBhdGliaWxpdHknLCAndW5idWlsdCcgXSxcclxuICAgIHR5cGU6ICdzaW0tdGVzdCcsXHJcbiAgICB1cmw6IGAke3JlcG99LyR7cmVwb31fZW4uaHRtbGAsXHJcbiAgICBxdWVyeVBhcmFtZXRlcnM6ICdlYSZicmFuZD1waGV0LWlvJnBoZXRpb1N0YW5kYWxvbmUmcGhldGlvQ29tcGFyZUFQSSZyYW5kb21TZWVkPTMzMjIxMSZsb2NhbGVzPSonLCAvLyBOT1RFOiBEVVBMSUNBVElPTiBBTEVSVDogcmFuZG9tIHNlZWQgbXVzdCBtYXRjaCB0aGF0IG9mIEFQSSBnZW5lcmF0aW9uLCBzZWUgZ2VuZXJhdGVQaGV0aW9NYWNyb0FQSS5qc1xyXG4gICAgcHJpb3JpdHk6IDEuNSAvLyBtb3JlIG9mdGVuIHRoYW4gdGhlIGF2ZXJhZ2UgdGVzdFxyXG4gIH0gKTtcclxuXHJcbiAgLy8gZnV6eiB0ZXN0IGltcG9ydGFudCB3cmFwcGVyc1xyXG4gIHRlc3RzLnB1c2goIHtcclxuICAgIHRlc3Q6IFsgcmVwbywgJ3BoZXQtaW8tc3R1ZGlvLWZ1enonLCAndW5idWlsdCcgXSxcclxuICAgIHR5cGU6ICd3cmFwcGVyLXRlc3QnLFxyXG4gICAgdXJsOiBgc3R1ZGlvLz9zaW09JHtyZXBvfSZwaGV0aW9XcmFwcGVyRGVidWc9dHJ1ZSZmdXp6YFxyXG4gIH0gKTtcclxuXHJcbiAgLy8gb25seSB0ZXN0IHN0YXRlIG9uIHBoZXQtaW8gc2ltcyB0aGF0IHN1cHBvcnQgaXRcclxuICBwaGV0aW9Ob1N0YXRlLmluZGV4T2YoIHJlcG8gKSA9PT0gLTEgJiYgdGVzdHMucHVzaCgge1xyXG4gICAgdGVzdDogWyByZXBvLCAncGhldC1pby1zdGF0ZS1mdXp6JywgJ3VuYnVpbHQnIF0sXHJcbiAgICB0eXBlOiAnd3JhcHBlci10ZXN0JyxcclxuICAgIHVybDogYHBoZXQtaW8td3JhcHBlcnMvc3RhdGUvP3NpbT0ke3JlcG99JnBoZXRpb0RlYnVnPXRydWUmcGhldGlvV3JhcHBlckRlYnVnPXRydWUmZnV6emBcclxuICB9ICk7XHJcblxyXG4gIC8vIHBoZXQtaW8gd3JhcHBlcnMgdGVzdHMgZm9yIGVhY2ggUGhFVC1pTyBTaW1cclxuICBbIGZhbHNlLCB0cnVlIF0uZm9yRWFjaCggdXNlQXNzZXJ0ID0+IHtcclxuICAgIHRlc3RzLnB1c2goIHtcclxuICAgICAgdGVzdDogWyByZXBvLCAncGhldC1pby13cmFwcGVycy10ZXN0cycsIHVzZUFzc2VydCA/ICdhc3NlcnQnIDogJ25vLWFzc2VydCcgXSxcclxuICAgICAgdHlwZTogJ3F1bml0LXRlc3QnLFxyXG4gICAgICB1cmw6IGBwaGV0LWlvLXdyYXBwZXJzL3BoZXQtaW8td3JhcHBlcnMtdGVzdHMuaHRtbD9zaW09JHtyZXBvfSR7dXNlQXNzZXJ0ID8gJyZwaGV0aW9EZWJ1Zz10cnVlJnBoZXRpb1dyYXBwZXJEZWJ1Zz10cnVlJyA6ICcnfWBcclxuICAgIH0gKTtcclxuICB9ICk7XHJcbn0gKTtcclxuXHJcbmludGVyYWN0aXZlRGVzY3JpcHRpb25SZXBvcy5mb3JFYWNoKCByZXBvID0+IHtcclxuICB0ZXN0cy5wdXNoKCB7XHJcbiAgICB0ZXN0OiBbIHJlcG8sICdpbnRlcmFjdGl2ZS1kZXNjcmlwdGlvbi1mdXp6JywgJ3VuYnVpbHQnIF0sXHJcbiAgICB0eXBlOiAnc2ltLXRlc3QnLFxyXG4gICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxyXG4gICAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JnN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbj10cnVlJyxcclxuICAgIHRlc3RRdWVyeVBhcmFtZXRlcnM6ICdkdXJhdGlvbj00MDAwMCdcclxuICB9ICk7XHJcblxyXG4gIHRlc3RzLnB1c2goIHtcclxuICAgIHRlc3Q6IFsgcmVwbywgJ2ludGVyYWN0aXZlLWRlc2NyaXB0aW9uLWZ1enotZnV6ekJvYXJkLWNvbWJvJywgJ3VuYnVpbHQnIF0sXHJcbiAgICB0eXBlOiAnc2ltLXRlc3QnLFxyXG4gICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxyXG4gICAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb249dHJ1ZSZmdXp6JmZ1enpCb2FyZCcsXHJcbiAgICB0ZXN0UXVlcnlQYXJhbWV0ZXJzOiAnZHVyYXRpb249NDAwMDAnXHJcbiAgfSApO1xyXG5cclxuICB0ZXN0cy5wdXNoKCB7XHJcbiAgICB0ZXN0OiBbIHJlcG8sICdpbnRlcmFjdGl2ZS1kZXNjcmlwdGlvbi1mdXp6Qm9hcmQnLCAndW5idWlsdCcgXSxcclxuICAgIHR5cGU6ICdzaW0tdGVzdCcsXHJcbiAgICB1cmw6IGAke3JlcG99LyR7cmVwb31fZW4uaHRtbGAsXHJcbiAgICBxdWVyeVBhcmFtZXRlcnM6ICdicmFuZD1waGV0JmVhJmZ1enpCb2FyZCZzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb249dHJ1ZScsXHJcbiAgICB0ZXN0UXVlcnlQYXJhbWV0ZXJzOiAnZHVyYXRpb249NDAwMDAnXHJcbiAgfSApO1xyXG5cclxuICB0ZXN0cy5wdXNoKCB7XHJcbiAgICB0ZXN0OiBbIHJlcG8sICdpbnRlcmFjdGl2ZS1kZXNjcmlwdGlvbi1mdXp6JywgJ2J1aWx0JyBdLFxyXG4gICAgdHlwZTogJ3NpbS10ZXN0JyxcclxuICAgIHVybDogYCR7cmVwb30vYnVpbGQvcGhldC8ke3JlcG99X2VuX3BoZXQuaHRtbGAsXHJcbiAgICBxdWVyeVBhcmFtZXRlcnM6ICdmdXp6JnN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbj10cnVlJyxcclxuICAgIHRlc3RRdWVyeVBhcmFtZXRlcnM6ICdkdXJhdGlvbj00MDAwMCcsXHJcblxyXG4gICAgYnJhbmQ6ICdwaGV0JyxcclxuICAgIGJ1aWxkRGVwZW5kZW5jaWVzOiBbIHJlcG8gXSxcclxuICAgIGVzNTogdHJ1ZVxyXG4gIH0gKTtcclxuXHJcbiAgdGVzdHMucHVzaCgge1xyXG4gICAgdGVzdDogWyByZXBvLCAnaW50ZXJhY3RpdmUtZGVzY3JpcHRpb24tZnV6ekJvYXJkJywgJ2J1aWx0JyBdLFxyXG4gICAgdHlwZTogJ3NpbS10ZXN0JyxcclxuICAgIHVybDogYCR7cmVwb30vYnVpbGQvcGhldC8ke3JlcG99X2VuX3BoZXQuaHRtbGAsXHJcbiAgICBxdWVyeVBhcmFtZXRlcnM6ICdmdXp6Qm9hcmQmc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uPXRydWUnLFxyXG4gICAgdGVzdFF1ZXJ5UGFyYW1ldGVyczogJ2R1cmF0aW9uPTQwMDAwJyxcclxuXHJcbiAgICBicmFuZDogJ3BoZXQnLFxyXG4gICAgYnVpbGREZXBlbmRlbmNpZXM6IFsgcmVwbyBdLFxyXG4gICAgZXM1OiB0cnVlXHJcbiAgfSApO1xyXG59ICk7XHJcblxyXG52b2ljaW5nUmVwb3MuZm9yRWFjaCggcmVwbyA9PiB7XHJcbiAgdGVzdHMucHVzaCgge1xyXG4gICAgdGVzdDogWyByZXBvLCAndm9pY2luZy1mdXp6JywgJ3VuYnVpbHQnIF0sXHJcbiAgICB0eXBlOiAnc2ltLXRlc3QnLFxyXG4gICAgdXJsOiBgJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxyXG4gICAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JnZvaWNpbmdJbml0aWFsbHlFbmFibGVkJyxcclxuICAgIHRlc3RRdWVyeVBhcmFtZXRlcnM6ICdkdXJhdGlvbj00MDAwMCdcclxuICB9ICk7XHJcbiAgdGVzdHMucHVzaCgge1xyXG4gICAgdGVzdDogWyByZXBvLCAndm9pY2luZy1mdXp6Qm9hcmQnLCAndW5idWlsdCcgXSxcclxuICAgIHR5cGU6ICdzaW0tdGVzdCcsXHJcbiAgICB1cmw6IGAke3JlcG99LyR7cmVwb31fZW4uaHRtbGAsXHJcbiAgICBxdWVyeVBhcmFtZXRlcnM6ICdicmFuZD1waGV0JmVhJmZ1enpCb2FyZCZ2b2ljaW5nSW5pdGlhbGx5RW5hYmxlZCcsXHJcbiAgICB0ZXN0UXVlcnlQYXJhbWV0ZXJzOiAnZHVyYXRpb249NDAwMDAnXHJcbiAgfSApO1xyXG59ICk7XHJcblxyXG4vLyByZXBvLXNwZWNpZmljIFVuaXQgdGVzdHMgKHVuYnVpbHQgbW9kZSkgZnJvbSBgZ3J1bnQgZ2VuZXJhdGUtdGVzdC1oYXJuZXNzYFxyXG51bml0VGVzdFJlcG9zLmZvckVhY2goIHJlcG8gPT4ge1xyXG4gIC8vIFNraXAgcGhldC1pby13cmFwcGVycyB1bml0IHRlc3RzIGhlcmUsIHdlIHJ1biBpdCB3aXRoIG11bHRpcGxlIHJlcG9zIGFib3ZlXHJcbiAgaWYgKCByZXBvID09PSAncGhldC1pby13cmFwcGVycycgKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBBbGwgdGVzdHMgc2hvdWxkIHdvcmsgd2l0aCBubyBxdWVyeSBwYXJhbWV0ZXJzLCB3aXRoIGFzc2VydGlvbnMgZW5hYmxlZCwgYW5kIHNob3VsZCBzdXBwb3J0IFBoRVQtaU8gYWxzbywgc28gdGVzdFxyXG4gIC8vIHdpdGggYnJhbmQ9cGhldC1pb1xyXG4gIGNvbnN0IHF1ZXJ5UGFyYW1ldGVycyA9IFsgJycsICc/ZWEnLCAnP2JyYW5kPXBoZXQtaW8nLCAnP2VhJmJyYW5kPXBoZXQtaW8nIF07XHJcbiAgcXVlcnlQYXJhbWV0ZXJzLmZvckVhY2goIHF1ZXJ5U3RyaW5nID0+IHtcclxuXHJcbiAgICAvLyBEb24ndCB0ZXN0IHBoZXQtaW8gb3IgdGFuZGVtIHVuaXQgdGVzdHMgaW4gcGhldCBicmFuZCwgdGhleSBhcmUgbWVhbnQgZm9yIHBoZXQtaW8gYnJhbmRcclxuICAgIGlmICggKCByZXBvID09PSAncGhldC1pbycgfHwgcmVwbyA9PT0gJ3RhbmRlbScgKSAmJiAhcXVlcnlTdHJpbmcuaW5jbHVkZXMoICdwaGV0LWlvJyApICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0ZXN0cy5wdXNoKCB7XHJcbiAgICAgIHRlc3Q6IFsgcmVwbywgJ3RvcC1sZXZlbC11bml0LXRlc3RzJywgYHVuYnVpbHQke3F1ZXJ5U3RyaW5nfWAgXSxcclxuICAgICAgdHlwZTogJ3F1bml0LXRlc3QnLFxyXG4gICAgICB1cmw6IGAke3JlcG99LyR7cmVwb30tdGVzdHMuaHRtbCR7cXVlcnlTdHJpbmd9YFxyXG4gICAgfSApO1xyXG4gIH0gKTtcclxufSApO1xyXG5cclxuLy8gUGFnZS1sb2FkIHRlc3RzIChub24tYnVpbHQpXHJcbltcclxuICB7XHJcbiAgICByZXBvOiAnZG90JyxcclxuICAgIHVybHM6IFtcclxuICAgICAgJycsIC8vIHRoZSByb290IFVSTFxyXG4gICAgICAnZG9jLycsXHJcbiAgICAgICdleGFtcGxlcy8nLFxyXG4gICAgICAnZXhhbXBsZXMvY29udmV4LWh1bGwtMi5odG1sJyxcclxuICAgICAgJ3Rlc3RzLycsXHJcbiAgICAgICd0ZXN0cy9wbGF5Z3JvdW5kLmh0bWwnXHJcbiAgICBdXHJcbiAgfSxcclxuICB7XHJcbiAgICByZXBvOiAna2l0ZScsXHJcbiAgICB1cmxzOiBbXHJcbiAgICAgICcnLCAvLyB0aGUgcm9vdCBVUkxcclxuICAgICAgJ2RvYy8nLFxyXG4gICAgICAnZXhhbXBsZXMvJyxcclxuICAgICAgJ3Rlc3RzLycsXHJcbiAgICAgICd0ZXN0cy9wbGF5Z3JvdW5kLmh0bWwnLFxyXG4gICAgICAndGVzdHMvdmlzdWFsLXNoYXBlLXRlc3QuaHRtbCdcclxuICAgIF1cclxuICB9LFxyXG4gIHtcclxuICAgIHJlcG86ICdzY2VuZXJ5JyxcclxuICAgIHVybHM6IFtcclxuICAgICAgJycsIC8vIHRoZSByb290IFVSTFxyXG4gICAgICAnZG9jLycsXHJcbiAgICAgICdkb2MvYS10b3VyLW9mLXNjZW5lcnkuaHRtbCcsXHJcbiAgICAgICdkb2MvYWNjZXNzaWJpbGl0eS9hY2Nlc3NpYmlsaXR5Lmh0bWwnLFxyXG4gICAgICAnZG9jL2ltcGxlbWVudGF0aW9uLW5vdGVzLmh0bWwnLFxyXG4gICAgICAnZG9jL3VzZXItaW5wdXQuaHRtbCcsXHJcbiAgICAgICdkb2MvbGF5b3V0Lmh0bWwnLFxyXG4gICAgICAnZG9jL2FjY2Vzc2liaWxpdHkvdm9pY2luZy5odG1sJyxcclxuICAgICAgJ2V4YW1wbGVzLycsXHJcbiAgICAgICdleGFtcGxlcy9jdXJzb3JzLmh0bWwnLFxyXG4gICAgICAnZXhhbXBsZXMvaGVsbG8td29ybGQuaHRtbCcsXHJcbiAgICAgICdleGFtcGxlcy9pbnB1dC1tdWx0aXBsZS1kaXNwbGF5cy5odG1sJyxcclxuICAgICAgJ2V4YW1wbGVzL2lucHV0Lmh0bWwnLFxyXG4gICAgICAnZXhhbXBsZXMvbW91c2Utd2hlZWwuaHRtbCcsXHJcbiAgICAgICdleGFtcGxlcy9tdWx0aS10b3VjaC5odG1sJyxcclxuICAgICAgJ2V4YW1wbGVzL25vZGVzLmh0bWwnLFxyXG4gICAgICAnZXhhbXBsZXMvc2hhcGVzLmh0bWwnLFxyXG4gICAgICAnZXhhbXBsZXMvc3ByaXRlcy5odG1sJyxcclxuICAgICAgJ2V4YW1wbGVzL2FjY2Vzc2liaWxpdHktc2hhcGVzLmh0bWwnLFxyXG4gICAgICAnZXhhbXBsZXMvYWNjZXNzaWJpbGl0eS1idXR0b24uaHRtbCcsXHJcbiAgICAgICdleGFtcGxlcy9hY2Nlc3NpYmlsaXR5LWFuaW1hdGlvbi5odG1sJyxcclxuICAgICAgJ2V4YW1wbGVzL2FjY2Vzc2liaWxpdHktbGlzdGVuZXJzLmh0bWwnLFxyXG4gICAgICAnZXhhbXBsZXMvYWNjZXNzaWJpbGl0eS11cGRhdGluZy1wZG9tLmh0bWwnLFxyXG4gICAgICAnZXhhbXBsZXMvYWNjZXNzaWJpbGl0eS1zbGlkZXIuaHRtbCcsXHJcbiAgICAgIC8vICdleGFtcGxlcy93ZWJnbG5vZGUuaHRtbCcsIC8vIGN1cnJlbnRseSBkaXNhYmxlZCwgc2luY2UgaXQgZmFpbHMgd2l0aG91dCB3ZWJnbFxyXG4gICAgICAndGVzdHMvJyxcclxuICAgICAgJ3Rlc3RzL3BsYXlncm91bmQuaHRtbCcsXHJcbiAgICAgICd0ZXN0cy9yZW5kZXJlci1jb21wYXJpc29uLmh0bWw/cmVuZGVyZXJzPWNhbnZhcyxzdmcsZG9tJyxcclxuICAgICAgJ3Rlc3RzL3NhbmRib3guaHRtbCcsXHJcbiAgICAgICd0ZXN0cy90ZXh0LWJvdW5kcy1jb21wYXJpc29uLmh0bWwnLFxyXG4gICAgICAndGVzdHMvdGV4dC1xdWFsaXR5LXRlc3QuaHRtbCdcclxuICAgIF1cclxuICB9LFxyXG4gIHtcclxuICAgIHJlcG86ICdwaGV0LWxpYicsXHJcbiAgICB1cmxzOiBbXHJcbiAgICAgICdkb2MvbGF5b3V0LWV4ZW1wbGFycy5odG1sJ1xyXG4gICAgXVxyXG4gIH1cclxuXS5mb3JFYWNoKCAoIHsgcmVwbywgdXJscyB9ICkgPT4ge1xyXG4gIHVybHMuZm9yRWFjaCggcGFnZWxvYWRSZWxhdGl2ZVVSTCA9PiB7XHJcbiAgICB0ZXN0cy5wdXNoKCB7XHJcbiAgICAgIHRlc3Q6IFsgcmVwbywgJ3BhZ2Vsb2FkJywgYC8ke3BhZ2Vsb2FkUmVsYXRpdmVVUkx9YCBdLFxyXG4gICAgICB0eXBlOiAncGFnZWxvYWQtdGVzdCcsXHJcbiAgICAgIHVybDogYCR7cmVwb30vJHtwYWdlbG9hZFJlbGF0aXZlVVJMfWAsXHJcbiAgICAgIHByaW9yaXR5OiA0IC8vIEZhc3QgdG8gdGVzdCwgc28gdGVzdCB0aGVtIG1vcmVcclxuICAgIH0gKTtcclxuICB9ICk7XHJcbn0gKTtcclxuXHJcbi8vIC8vIFBhZ2UtbG9hZCB0ZXN0cyAoYnVpbHQpXHJcbi8vIFtcclxuLy9cclxuLy8gXS5mb3JFYWNoKCAoIHsgcmVwbywgdXJscyB9ICkgPT4ge1xyXG4vLyAgIHVybHMuZm9yRWFjaCggcGFnZWxvYWRSZWxhdGl2ZVVSTCA9PiB7XHJcbi8vICAgICB0ZXN0cy5wdXNoKCB7XHJcbi8vICAgICAgIHRlc3Q6IFsgcmVwbywgJ3BhZ2Vsb2FkJywgYC8ke3BhZ2Vsb2FkUmVsYXRpdmVVUkx9YCBdLFxyXG4vLyAgICAgICB0eXBlOiAncGFnZWxvYWQtdGVzdCcsXHJcbi8vICAgICAgIHVybDogYCR7cmVwb30vJHtwYWdlbG9hZFJlbGF0aXZlVVJMfWAsXHJcbi8vICAgICAgIHByaW9yaXR5OiA1LCAvLyBXaGVuIHRoZXNlIGFyZSBidWlsdCwgaXQgc2hvdWxkIGJlIHJlYWxseSBxdWljayB0byB0ZXN0XHJcbi8vXHJcbi8vICAgICAgIGJyYW5kOiAncGhldCcsXHJcbi8vICAgICAgIGVzNTogdHJ1ZVxyXG4vLyAgICAgfSApO1xyXG4vLyAgIH0gKTtcclxuLy8gfSApO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIFB1YmxpYyBxdWVyeSBwYXJhbWV0ZXIgdGVzdHNcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vLyB0ZXN0IG5vbi1kZWZhdWx0IHB1YmxpYyBxdWVyeSBwYXJhbWV0ZXIgdmFsdWVzIHRvIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gb2J2aW91cyBwcm9ibGVtcy5cclxuY29uc3QgY29tbW9uUXVlcnlQYXJhbWV0ZXJzID0ge1xyXG4gIGFsbG93TGlua3NGYWxzZTogJ2JyYW5kPXBoZXQmZnV6eiZlYSZhbGxvd0xpbmtzPWZhbHNlJyxcclxuICBzY3JlZW5zMTogJ2JyYW5kPXBoZXQmZnV6eiZlYSZzY3JlZW5zPTEnLFxyXG4gIHNjcmVlbnMyMTogJ2JyYW5kPXBoZXQmZnV6eiZlYSZzY3JlZW5zPTIsMScsXHJcbiAgc2NyZWVuczIxTm9Ib21lOiAnYnJhbmQ9cGhldCZmdXp6JmVhJnNjcmVlbnM9MiwxJmhvbWVTY3JlZW49ZmFsc2UnLFxyXG4gIGluaXRpYWxTY3JlZW4yTm9Ib21lOiAnYnJhbmQ9cGhldCZmdXp6JmVhJmluaXRpYWxTY3JlZW49MiZob21lU2NyZWVuPWZhbHNlJyxcclxuICBpbml0aWFsU2NyZWVuMjogJ2JyYW5kPXBoZXQmZnV6eiZlYSZpbml0aWFsU2NyZWVuPTInLFxyXG5cclxuICAvLyBQdXJwb3NlZnVsbHkgdXNlIGluY29ycmVjdCBzeW50YXggdG8gbWFrZSBzdXJlIGl0IGlzIGNhdWdodCBjb3JyZWN0bHkgd2l0aG91dCBjcmFzaGluZ1xyXG4gIHNjcmVlbnNWZXJib3NlOiAnYnJhbmQ9cGhldCZmdXp6JmVhJnNjcmVlbnM9U2NyZWVuMSxTY3JlZW4yJyxcclxuICBzY3JlZW5zT3RoZXI6ICdicmFuZD1waGV0JmZ1enomZWEmc2NyZWVucz0xLjEsU2NyZWVuMidcclxufTtcclxuT2JqZWN0LmtleXMoIGNvbW1vblF1ZXJ5UGFyYW1ldGVycyApLmZvckVhY2goIG5hbWUgPT4ge1xyXG4gIGNvbnN0IHF1ZXJ5U3RyaW5nID0gY29tbW9uUXVlcnlQYXJhbWV0ZXJzWyBuYW1lIF07XHJcblxyXG4gIC8vIHJhbmRvbWx5IHBpY2tlZCBtdWx0aS1zY3JlZW4gc2ltIHRvIHRlc3QgcXVlcnkgcGFyYW1ldGVycyAoaGVuY2UgY2FsbGluZyBpdCBhIGpvaXN0IHRlc3QpXHJcbiAgdGVzdHMucHVzaCgge1xyXG4gICAgdGVzdDogWyAnam9pc3QnLCAnZnV6eicsICd1bmJ1aWx0JywgJ3F1ZXJ5LXBhcmFtZXRlcnMnLCBuYW1lIF0sXHJcbiAgICB0eXBlOiAnc2ltLXRlc3QnLFxyXG4gICAgdXJsOiAnYWNpZC1iYXNlLXNvbHV0aW9ucy9hY2lkLWJhc2Utc29sdXRpb25zX2VuLmh0bWwnLFxyXG4gICAgcXVlcnlQYXJhbWV0ZXJzOiBxdWVyeVN0cmluZ1xyXG4gIH0gKTtcclxufSApO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIEFkZGl0aW9uYWwgc2ltLXNwZWNpZmljIHRlc3RzXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuLy8gYmVlcnMtbGF3LWxhYjogdGVzdCB2YXJpb3VzIHF1ZXJ5IHBhcmFtZXRlcnNcclxudGVzdHMucHVzaCgge1xyXG4gIHRlc3Q6IFsgJ2JlZXJzLWxhdy1sYWInLCAnZnV6eicsICd1bmJ1aWx0JywgJ3F1ZXJ5LXBhcmFtZXRlcnMnIF0sXHJcbiAgdHlwZTogJ3NpbS10ZXN0JyxcclxuICB1cmw6ICdiZWVycy1sYXctbGFiL2JlZXJzLWxhdy1sYWJfZW4uaHRtbCcsXHJcbiAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JnNob3dTb2x1dGVBbW91bnQmY29uY2VudHJhdGlvbk1ldGVyVW5pdHM9cGVyY2VudCZiZWFrZXJVbml0cz1taWxsaWxpdGVycydcclxufSApO1xyXG5cclxuLy8gY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWFjOiB0ZXN0IHZhcmlvdXMgcXVlcnkgcGFyYW1ldGVyc1xyXG50ZXN0cy5wdXNoKCB7XHJcbiAgdGVzdDogWyAnY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWFjJywgJ2Z1enonLCAndW5idWlsdCcsICdxdWVyeS1wYXJhbWV0ZXJzJyBdLFxyXG4gIHR5cGU6ICdzaW0tdGVzdCcsXHJcbiAgdXJsOiAnY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWFjL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1hY19lbi5odG1sJyxcclxuXHJcbiAgLy8gUHVibGljIHF1ZXJ5IHBhcmFtZXRlcnMgdGhhdCBjYW5ub3QgYmUgdHJpZ2dlcmVkIGZyb20gb3B0aW9ucyB3aXRoaW4gdGhlIHNpbVxyXG4gIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmZnV6eiZzaG93Q3VycmVudCZhZGRSZWFsQnVsYnMmbW9yZVdpcmVzJm1vcmVJbmR1Y3RvcnMnXHJcbn0gKTtcclxuXHJcbi8vIGVuZXJneSBmb3JtcyBhbmQgY2hhbmdlczogZm91ciBibG9ja3MgYW5kIG9uZSBidXJuZXJcclxudGVzdHMucHVzaCgge1xyXG4gIHRlc3Q6IFsgJ2VuZXJneS1mb3Jtcy1hbmQtY2hhbmdlcycsICdmdXp6JywgJ3VuYnVpbHQnLCAncXVlcnktcGFyYW1ldGVycycgXSxcclxuICB0eXBlOiAnc2ltLXRlc3QnLFxyXG4gIHVybDogJ2VuZXJneS1mb3Jtcy1hbmQtY2hhbmdlcy9lbmVyZ3ktZm9ybXMtYW5kLWNoYW5nZXNfZW4uaHRtbCcsXHJcbiAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JnNjcmVlbnM9MSZlbGVtZW50cz1pcm9uLGJyaWNrLGlyb24sYnJpY2smYnVybmVycz0xJ1xyXG59ICk7XHJcblxyXG4vLyBlbmVyZ3kgZm9ybXMgYW5kIGNoYW5nZXM6IHR3byBiZWFrZXJzIGFuZCAyIGJ1cm5lcnNcclxudGVzdHMucHVzaCgge1xyXG4gIHRlc3Q6IFsgJ2VuZXJneS1mb3Jtcy1hbmQtY2hhbmdlcycsICdmdXp6JywgJ3VuYnVpbHQnLCAncXVlcnktcGFyYW1ldGVycy0yJyBdLFxyXG4gIHR5cGU6ICdzaW0tdGVzdCcsXHJcbiAgdXJsOiAnZW5lcmd5LWZvcm1zLWFuZC1jaGFuZ2VzL2VuZXJneS1mb3Jtcy1hbmQtY2hhbmdlc19lbi5odG1sJyxcclxuICBxdWVyeVBhcmFtZXRlcnM6ICdicmFuZD1waGV0JmVhJmZ1enomc2NyZWVucz0xJiZlbGVtZW50cz1vbGl2ZU9pbCx3YXRlciZidXJuZXJzPTInXHJcbn0gKTtcclxuXHJcbi8vIGdhcy1wcm9wZXJ0aWVzOiB0ZXN0IHByZXNzdXJlTm9pc2UgcXVlcnkgcGFyYW1ldGVyXHJcbnRlc3RzLnB1c2goIHtcclxuICB0ZXN0OiBbICdnYXMtcHJvcGVydGllcycsICdmdXp6JywgJ3VuYnVpbHQnLCAncXVlcnktcGFyYW1ldGVycycgXSxcclxuICB0eXBlOiAnc2ltLXRlc3QnLFxyXG4gIHVybDogJ2dhcy1wcm9wZXJ0aWVzL2dhcy1wcm9wZXJ0aWVzX2VuLmh0bWwnLFxyXG4gIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmZnV6eiZwcmVzc3VyZU5vaXNlPWZhbHNlJ1xyXG59ICk7XHJcblxyXG4vLyBuYXR1cmFsLXNlbGVjdGlvbjogdGVzdCB2YXJpb3VzIHF1ZXJ5IHBhcmFtZXRlcnNcclxudGVzdHMucHVzaCgge1xyXG4gIHRlc3Q6IFsgJ25hdHVyYWwtc2VsZWN0aW9uJywgJ2Z1enonLCAndW5idWlsdCcsICdxdWVyeS1wYXJhbWV0ZXJzJyBdLFxyXG4gIHR5cGU6ICdzaW0tdGVzdCcsXHJcbiAgdXJsOiAnbmF0dXJhbC1zZWxlY3Rpb24vbmF0dXJhbC1zZWxlY3Rpb25fZW4uaHRtbCcsXHJcbiAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JmFsbGVsZXNWaXNpYmxlPWZhbHNlJmludHJvTXV0YXRpb25zPUYmaW50cm9Qb3B1bGF0aW9uPTEwRmYmbGFiTXV0YXRpb25zPUZlVCZsYWJQb3B1bGF0aW9uPTJGRmVldHQsMmZmRUV0dCwyZmZlZVRUJ1xyXG59ICk7XHJcblxyXG4vLyBuYXR1cmFsLXNlbGVjdGlvbjogcnVuIHRoZSBnZW5lcmF0aW9uIGNsb2NrIGZhc3Rlciwgc28gdGhhdCBtb3JlIHRoaW5ncyBhcmUgbGlhYmxlIHRvIGhhcHBlblxyXG50ZXN0cy5wdXNoKCB7XHJcbiAgdGVzdDogWyAnbmF0dXJhbC1zZWxlY3Rpb24nLCAnZnV6eicsICd1bmJ1aWx0JywgJ3NlY29uZHNQZXJHZW5lcmF0aW9uJyBdLFxyXG4gIHR5cGU6ICdzaW0tdGVzdCcsXHJcbiAgdXJsOiAnbmF0dXJhbC1zZWxlY3Rpb24vbmF0dXJhbC1zZWxlY3Rpb25fZW4uaHRtbCcsXHJcbiAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JnNlY29uZHNQZXJHZW5lcmF0aW9uPTEnXHJcbn0gKTtcclxuXHJcbi8vIHBoLXNjYWxlOiB0ZXN0IHRoZSBhdXRvZmlsbCBxdWVyeSBwYXJhbWV0ZXJcclxudGVzdHMucHVzaCgge1xyXG4gIHRlc3Q6IFsgJ3BoLXNjYWxlJywgJ2F1dG9maWxsLWZ1enonLCAndW5idWlsdCcsICdxdWVyeS1wYXJhbWV0ZXJzJyBdLFxyXG4gIHR5cGU6ICdzaW0tdGVzdCcsXHJcbiAgdXJsOiAncGgtc2NhbGUvcGgtc2NhbGVfZW4uaHRtbCcsXHJcbiAgcXVlcnlQYXJhbWV0ZXJzOiAnYnJhbmQ9cGhldCZlYSZmdXp6JmF1dG9GaWxsPWZhbHNlJ1xyXG59ICk7XHJcblxyXG4vLyBudW1iZXItcGxheTogdGVzdCB0aGUgc2Vjb25kIGxhbmd1YWdlIHByZWZlcmVuY2VcclxudGVzdHMucHVzaCgge1xyXG4gIHRlc3Q6IFsgJ251bWJlci1wbGF5JywgJ3NlY29uZC1sYW5ndWFnZS1mdXp6JywgJ3VuYnVpbHQnLCAncXVlcnktcGFyYW1ldGVycycgXSxcclxuICB0eXBlOiAnc2ltLXRlc3QnLFxyXG4gIHVybDogJ251bWJlci1wbGF5L251bWJlci1wbGF5X2VuLmh0bWwnLFxyXG4gIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmZnV6eiZsb2NhbGVzPSomc2Vjb25kTG9jYWxlPWVzJ1xyXG59ICk7XHJcblxyXG4vLyBudW1iZXItY29tcGFyZTogdGVzdCB0aGUgc2Vjb25kIGxhbmd1YWdlIHByZWZlcmVuY2VcclxudGVzdHMucHVzaCgge1xyXG4gIHRlc3Q6IFsgJ251bWJlci1jb21wYXJlJywgJ3NlY29uZC1sYW5ndWFnZS1mdXp6JywgJ3VuYnVpbHQnLCAncXVlcnktcGFyYW1ldGVycycgXSxcclxuICB0eXBlOiAnc2ltLXRlc3QnLFxyXG4gIHVybDogJ251bWJlci1jb21wYXJlL251bWJlci1jb21wYXJlX2VuLmh0bWwnLFxyXG4gIHF1ZXJ5UGFyYW1ldGVyczogJ2JyYW5kPXBoZXQmZWEmZnV6eiZsb2NhbGVzPSomc2Vjb25kTG9jYWxlPWVzJ1xyXG59ICk7XHJcblxyXG5jb25zb2xlLmxvZyggSlNPTi5zdHJpbmdpZnkoIHRlc3RzLCBudWxsLCAyICkgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTUEsY0FBYyxHQUFHQyxPQUFPLENBQUUseUJBQTBCLENBQUM7QUFDM0QsTUFBTUMsV0FBVyxHQUFHRCxPQUFPLENBQUUsc0JBQXVCLENBQUM7QUFDckQsTUFBTUUsRUFBRSxHQUFHRixPQUFPLENBQUUsSUFBSyxDQUFDO0FBRTFCLE1BQU1HLEtBQUssR0FBR0osY0FBYyxDQUFDLENBQUM7QUFDOUIsTUFBTUssV0FBVyxHQUFHSCxXQUFXLENBQUUsU0FBVSxDQUFDO0FBQzVDLE1BQU1JLG9CQUFvQixHQUFHSixXQUFXLENBQUUsb0JBQXFCLENBQUM7QUFDaEUsTUFBTUssYUFBYSxHQUFHTCxXQUFXLENBQUUsa0JBQW1CLENBQUM7QUFDdkQsTUFBTU0sMkJBQTJCLEdBQUdOLFdBQVcsQ0FBRSx5QkFBMEIsQ0FBQztBQUM1RSxNQUFNTyxhQUFhLEdBQUdQLFdBQVcsQ0FBRSwyQkFBNEIsQ0FBQztBQUNoRSxNQUFNUSxhQUFhLEdBQUdSLFdBQVcsQ0FBRSxZQUFhLENBQUM7QUFDakQsTUFBTVMsWUFBWSxHQUFHVCxXQUFXLENBQUUsU0FBVSxDQUFDOztBQUU3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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