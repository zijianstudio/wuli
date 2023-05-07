// Copyright 2016-2023, University of Colorado Boulder

/*
 * Page for quickly launching phet-related tasks, such as simulations, automated/unit tests, or other utilities.
 *
 * Displays three columns:
 *
 * - Repositories: A list of repositories to select from, each one of which has a number of modes.
 * - Modes: Based on the repository selected. Decides what type of URL is loaded when "Launch" or the enter key is
 *          pressed.
 * - Query Parameters: If available, controls what optional query parameters will be added to the end of the URL.
 *
 * Mode has the format:
 * {
 *   name: {string} - Internal unique value (for looking up which option was chosen),
 *   text: {string} - Shown in the mode list,
 *   group: {string} - The optgroup that this mode belongs to
 *   description: {string} - Shown when hovering over the mode in the list,
 *   url: {string} - The base URL to visit (without added query parameters) when the mode is chosen,
 *   queryParameters: {Array.<QueryParameter>}
 * }
 *
 * QueryParameter has the format:
 * {
 *   value: {string} - The actual query parameter included in the URL,
 *   text: {string} - Shown in the query parameter list,
 *   [type]: {'boolean'} - if boolean, then it will add "=true" or "=false" to the checkbox value
 *   [default]: {boolean} - If true, the query parameter will be true by default
 * }
 */

(function () {
  // Query parameters used for the following modes: requirejs, compiled, production
  const simQueryParameters = [{
    value: 'audio=disabled',
    text: 'Mute'
  }, {
    value: 'fuzz',
    text: 'Fuzz',
    dependentQueryParameters: [{
      value: 'fuzzPointers=2',
      text: 'Multitouch-fuzz'
    }]
  }, {
    value: 'fuzzBoard',
    text: 'Keyboard Fuzz'
  }, {
    value: 'debugger',
    text: 'Debugger',
    default: true
  }, {
    value: 'deprecationWarnings',
    text: 'Deprecation Warnings'
  }, {
    value: 'dev',
    text: 'Dev'
  }, {
    value: 'profiler',
    text: 'Profiler'
  }, {
    value: 'showPointers',
    text: 'Pointers'
  }, {
    value: 'showPointerAreas',
    text: 'Pointer Areas'
  }, {
    value: 'showFittedBlockBounds',
    text: 'Fitted Block Bounds'
  }, {
    value: 'showCanvasNodeBounds',
    text: 'CanvasNode Bounds'
  }, {
    value: 'supportsInteractiveDescription',
    text: 'Supports Interactive Description',
    default: false,
    type: 'boolean'
  }, {
    value: 'supportsSound',
    text: 'Supports Sound',
    default: false,
    type: 'boolean'
  }, {
    value: 'supportsExtraSound',
    text: 'Supports Extra Sound',
    default: false,
    type: 'boolean'
  }, {
    value: 'extraSoundInitiallyEnabled',
    text: 'Extra Sound on by default'
  }, {
    value: 'supportsPanAndZoom',
    text: 'Supports Pan and Zoom',
    default: true,
    type: 'boolean'
  }, {
    value: 'supportsVoicing',
    text: 'Supports Voicing',
    default: false,
    type: 'boolean'
  }, {
    value: 'voicingInitiallyEnabled',
    text: 'Voicing on by default'
  }, {
    value: 'printVoicingResponses',
    text: 'console.log() voicing responses'
  }, {
    value: 'interactiveHighlightsInitiallyEnabled',
    text: 'Interactive Highlights on by default'
  }, {
    value: 'preferencesStorage',
    text: 'Remember previous values of preferences from localStorage.'
  }, {
    value: 'webgl=false',
    text: 'No WebGL'
  }, {
    value: 'listenerOrder=random',
    text: 'Randomize listener order'
  }, {
    value: 'locales=*',
    text: 'Load all locales',
    dependentQueryParameters: [{
      value: 'keyboardLocaleSwitcher',
      text: 'ctrl + u/i to cycle locales'
    }]
  }];
  const eaObject = {
    value: 'ea',
    text: 'Assertions',
    default: true
  };

  // Query parameters used for requirejs and PhET-iO wrappers
  const devSimQueryParameters = [{
    value: 'brand=phet',
    text: 'PhET Brand',
    default: true
  }, eaObject, {
    value: 'eall',
    text: 'All Assertions'
  }];
  const phetioBaseParameters = [{
    value: 'phetioEmitHighFrequencyEvents',
    default: true,
    type: 'boolean',
    text: 'Emit events that occur often'
  }, {
    value: 'phetioEmitStates',
    default: false,
    type: 'boolean',
    text: 'Emit states to the data stream'
  }, {
    value: 'phetioCompareAPI&randomSeed=332211',
    // NOTE: DUPLICATION ALERT: random seed must match that of API generation, see generatePhetioMacroAPI.js
    text: 'Compare with reference API'
  }, {
    value: 'phetioPrintMissingTandems',
    default: false,
    text: 'Print tandems that have not yet been added'
  }, {
    value: 'phetioPrintAPIProblems',
    default: false,
    text: 'Print problems found by phetioAPIValidation to the console instead of asserting each item.'
  }, {
    value: 'locales=*',
    text: 'Loads all the translated versions',
    default: true
  }, {
    value: 'keyboardLocaleSwitcher',
    text: 'Enables keybard cycling through the locales',
    default: true
  }];

  // See perennial-alias/data/wrappers for format
  const nonPublishedPhetioWrappersToAddToPhetmarks = ['phet-io-wrappers/mirror-inputs'];
  const phetioDebugTrueParameter = {
    value: 'phetioDebug=true',
    text: 'Enable assertions for the sim inside a wrapper, basically the phet-io version of ?ea',
    default: true
  };

  // Query parameters for the PhET-iO wrappers (including iframe tests)
  const phetioWrapperQueryParameters = phetioBaseParameters.concat([phetioDebugTrueParameter, {
    value: 'phetioWrapperDebug=true',
    text: 'Enable assertions for wrapper-code, like assertions in Studio, State, or Client',
    default: true
  }]);

  // For phetio sim frame links
  const phetioSimQueryParameters = phetioBaseParameters.concat([eaObject,
  // this needs to be first in this list
  {
    value: 'brand=phet-io&phetioStandalone&phetioConsoleLog=colorized',
    text: 'Formatted PhET-IO Console Output'
  }, {
    value: 'phetioPrintMissingTandems',
    default: false,
    text: 'Print tandems that have not yet been added'
  }, {
    value: 'phetioPrintAPIProblems',
    default: false,
    text: 'Print problems found by phetioAPIValidation to the console instead of asserting each item.'
  }, {
    value: 'phetioPrintAPI',
    default: false,
    text: 'Print the API to the console'
  }]);

  /**
   * Returns a local-storage key that has additional information included, to prevent collision with other applications (or in the future, previous
   * versions of phetmarks).
   * @public
   *
   * @param {string} key
   * @returns {string}
   */
  function storageKey(key) {
    return `phetmarks-${key}`;
  }

  /**
   * From the wrapper path in perennial-alias/data/wrappers, get the name of the wrapper.
   * @param {string} wrapper
   * @returns {string} - the name of the wrapper
   */
  const getWrapperName = function (wrapper) {
    // If the wrapper has its own individual repo, then get the name 'classroom-activity' from 'phet-io-wrapper-classroom-activity'
    // Maintain compatibility for wrappers in 'phet-io-wrappers-'
    const wrapperParts = wrapper.split('phet-io-wrapper-');
    const wrapperName = wrapperParts.length === 1 ? wrapperParts[0] : wrapperParts[1];

    // If the wrapper still has slashes in it, then it looks like 'phet-io-wrappers/active'
    const splitOnSlash = wrapperName.split('/');
    return splitOnSlash[splitOnSlash.length - 1];
  };

  // Track whether 'shift' key is pressed, so that we can change how windows are opened.  If shift is pressed, the
  // page is launched in a separate tab.
  let shiftPressed = false;
  window.addEventListener('keydown', event => {
    shiftPressed = event.shiftKey;
  });
  window.addEventListener('keyup', event => {
    shiftPressed = event.shiftKey;
  });
  function openURL(url) {
    if (shiftPressed) {
      window.open(url, '_blank');
    } else {
      window.location = url;
    }
  }

  /**
   * Fills out the modeData map with information about repositories, modes and query parameters. Parameters are largely
   * repo lists from perennial-alias/data files.
   *
   * @param {Array.<string>} activeRunnables - from active-runnables
   * @param {Array.<string>} activeRepos - from active-repos
   * @param {Array.<string>} phetioSims - from phet-io
   * @param {Array.<string>} interactiveDescriptionSims - from interactive-description
   * @param {Array.<string>} wrappers - from wrappers
   * @param {Array.<string>} unitTestsRepos - Has unit tests
   * @returns {Object} - Maps from {string} repository name => {Mode}
   */
  function populate(activeRunnables, activeRepos, phetioSims, interactiveDescriptionSims, wrappers, unitTestsRepos) {
    const modeData = {};
    activeRepos.forEach(repo => {
      const modes = [];
      modeData[repo] = modes;
      const isPhetio = _.includes(phetioSims, repo);
      const hasUnitTests = _.includes(unitTestsRepos, repo);
      const isRunnable = _.includes(activeRunnables, repo);
      const supportsInteractiveDescription = _.includes(interactiveDescriptionSims, repo);
      if (isRunnable) {
        modes.push({
          name: 'requirejs',
          text: 'Unbuilt',
          description: 'Runs the simulation from the top-level development HTML in unbuilt mode',
          url: `../${repo}/${repo}_en.html`,
          queryParameters: devSimQueryParameters.concat(simQueryParameters)
        });
        modes.push({
          name: 'compiled',
          text: 'Compiled',
          description: 'Runs the English simulation from the build/phet/ directory (built from chipper)',
          url: `../${repo}/build/phet/${repo}_en_phet.html`,
          queryParameters: simQueryParameters
        });
        modes.push({
          name: 'compiledXHTML',
          text: 'Compiled XHTML',
          description: 'Runs the English simulation from the build/phet/xhtml directory (built from chipper)',
          url: `../${repo}/build/phet/xhtml/${repo}_all.xhtml`,
          queryParameters: simQueryParameters
        });
        modes.push({
          name: 'production',
          text: 'Production',
          description: 'Runs the latest English simulation from the production server',
          url: `https://phet.colorado.edu/sims/html/${repo}/latest/${repo}_all.html`,
          queryParameters: simQueryParameters
        });
        modes.push({
          name: 'spot',
          text: 'Dev (spot)',
          description: 'Loads the location on phet-dev.colorado.edu with versions for each dev deploy',
          url: `https://phet-dev.colorado.edu/html/${repo}`
        });
      }

      // Color picker UI
      if (isRunnable) {
        modes.push({
          name: 'colors',
          text: 'Color Editor',
          description: 'Runs the top-level -colors.html file (allows editing/viewing different profile colors)',
          url: `color-editor.html?sim=${repo}&brand=phet`
        });
      }
      if (repo === 'scenery') {
        modes.push({
          name: 'inspector',
          text: 'Inspector',
          description: 'Displays saved Scenery snapshots',
          url: `../${repo}/tests/inspector.html`
        });
      }
      if (hasUnitTests) {
        modes.push({
          name: 'unitTestsRequirejs',
          text: 'Unit Tests (unbuilt)',
          description: 'Runs unit tests in unbuilt mode',
          url: `../${repo}/${repo}-tests.html`,
          queryParameters: [{
            value: 'ea',
            text: 'Assertions',
            default: true
          }, ...(repo === 'phet-io-wrappers' ? [{
            value: 'sim=gravity-and-orbits',
            text: 'addSim',
            default: true
          }] : [])]
        });
      }
      if (repo === 'scenery' || repo === 'kite' || repo === 'dot' || repo === 'phet-io') {
        modes.push({
          name: 'documentation',
          text: 'Documentation',
          description: 'Browse HTML documentation',
          url: `../${repo}/doc/`
        });
      }
      if (repo === 'scenery') {
        modes.push({
          name: 'layout-documentation',
          text: 'Layout Documentation',
          description: 'Browse HTML layout documentation',
          url: `../${repo}/doc/layout.html`
        });
      }
      if (repo === 'scenery' || repo === 'kite' || repo === 'dot') {
        modes.push({
          name: 'examples',
          text: 'Examples',
          description: 'Browse Examples',
          url: `../${repo}/examples/`
        });
      }
      if (repo === 'scenery' || repo === 'kite' || repo === 'dot' || repo === 'phet-core') {
        modes.push({
          name: 'playground',
          text: 'Playground',
          description: `Loads ${repo} and dependencies in the tab, and allows quick testing`,
          url: `../${repo}/tests/playground.html`
        });
      }
      if (repo === 'scenery') {
        modes.push({
          name: 'sandbox',
          text: 'Sandbox',
          description: 'Allows quick testing of Scenery features',
          url: `../${repo}/tests/sandbox.html`
        });
      }
      if (repo === 'chipper' || repo === 'aqua') {
        const generalTestParams = 'ea&audio=disabled&testDuration=10000&testConcurrentBuilds=4';
        const fuzzTestParameter = [{
          value: `${generalTestParams}&brand=phet&fuzz`,
          text: 'Test PhET sims',
          default: true
        }, {
          value: 'randomize',
          text: 'Randomize sim list'
        }];
        modes.push({
          name: 'test-phet-sims',
          text: 'Fuzz Test PhET Sims (Fast Build)',
          description: 'Runs automated testing with fuzzing, 10 second timer, and 4 concurrent builds',
          url: '../aqua/test-server/test-sims.html',
          queryParameters: fuzzTestParameter
        });
        modes.push({
          name: 'test-phet-io-sims',
          text: 'Fuzz Test PhET-iO Sims (Fast Build)',
          description: 'Runs automated testing with fuzzing, 10 second timer, and 4 concurrent builds',
          url: '../aqua/test-server/test-sims.html',
          queryParameters: [{
            value: `${generalTestParams}&brand=phet-io&fuzz&phetioStandalone&testSims=${phetioSims.join(',')}`,
            text: 'Fuzz Test PhET-IO sims',
            default: true
          }, {
            value: 'randomize',
            text: 'Randomize sim list'
          }]
        });
        modes.push({
          name: 'test-interactive-description-sims',
          text: 'Fuzz Test Interactive Description Sims (Fast Build)',
          description: 'Runs automated testing with fuzzing, 10 second timer, and 4 concurrent builds',
          url: '../aqua/test-server/test-sims.html',
          queryParameters: [{
            value: `${generalTestParams}&brand=phet&fuzzBoard&supportsInteractiveDescription=true`,
            text: 'Keyboard Fuzz Test sims',
            default: true
          }, {
            value: `${generalTestParams}&brand=phet&fuzz&supportsInteractiveDescription=true`,
            text: 'Normal Fuzz Test sims',
            default: false
          }, {
            value: `testSims=${interactiveDescriptionSims.join(',')}`,
            text: 'Test only A11y sims',
            default: true
          }, {
            value: 'randomize',
            text: 'Randomize sim list'
          }]
        });
        modes.push({
          name: 'test-sims-load-only',
          text: 'Test Sims (Load Only)',
          description: 'Runs automated testing that just loads sims (without fuzzing or building)',
          url: '../aqua/test-server/test-sims.html',
          queryParameters: [{
            value: 'ea&brand=phet&audio=disabled&testTask=false&testBuilt=false',
            text: 'Test Sims (Load Only)',
            default: true
          }]
        });
        modes.push({
          name: 'continuous-testing',
          text: 'Continuous Testing',
          description: 'Link to the continuous testing on Bayes.',
          url: 'https://bayes.colorado.edu/continuous-testing/aqua/html/continuous-report.html'
        });
        modes.push({
          name: 'snapshot-comparison',
          text: 'Snapshot Comparison',
          description: 'Sets up snapshot screenshot comparison that can be run on different SHAs',
          url: '../aqua/html/snapshot-comparison.html'
        });
        modes.push({
          name: 'multi-snapshot-comparison',
          text: 'Multi-snapshot Comparison',
          description: 'Sets up snapshot screenshot comparison for two different checkouts',
          url: '../aqua/html/multi-snapshot-comparison.html'
        });
      }
      if (repo === 'yotta') {
        modes.push({
          name: 'yotta-statistics',
          text: 'Statistics page',
          description: 'Goes to the yotta report page, credentials in the Google Doc',
          url: 'https://bayes.colorado.edu/statistics/yotta/'
        });
      }
      if (repo === 'skiffle') {
        modes.push({
          name: 'sound-board',
          text: 'Sound Board',
          description: 'Interactive HTML page for exploring existing sounds in sims and common code',
          url: '../skiffle/html/sound-board.html'
        });
      }
      if (repo === 'quake') {
        modes.push({
          name: 'quake-built',
          text: 'Haptics Playground (built for browser)',
          description: 'Built browser version of the Haptics Playground app',
          url: '../quake/platforms/browser/www/haptics-playground.html'
        });
      }
      if (supportsInteractiveDescription) {
        modes.push({
          name: 'a11y-view',
          text: 'A11y View',
          description: 'Runs the simulation in an iframe next to a copy of the PDOM tot easily inspect accessible content.',
          url: `../${repo}/${repo}_a11y_view.html`,
          queryParameters: devSimQueryParameters.concat(simQueryParameters)
        });
      }
      if (repo === 'interaction-dashboard') {
        modes.push({
          name: 'preprocessor',
          text: 'Preprocessor',
          description: 'Load the preprocessor for parsing data logs down to a size that can be used by the simulation.',
          url: `../${repo}/preprocessor.html`,
          queryParameters: [{
            value: 'ea',
            text: 'Enable Assertions',
            default: true
          }, {
            value: 'parseX=10',
            text: 'Test only 10 sessions',
            default: false
          }, {
            value: 'forSpreadsheet',
            text: 'Create output for a spreadsheet.',
            default: false
          }]
        });
      }
      modes.push({
        name: 'github',
        text: 'GitHub',
        description: 'Opens to the repository\'s GitHub main page',
        url: `https://github.com/phetsims/${repo}`
      });
      modes.push({
        name: 'issues',
        text: 'Issues',
        description: 'Opens to the repository\'s GitHub issues page',
        url: `https://github.com/phetsims/${repo}/issues`
      });

      // if a phet-io sim, then add the wrappers to them
      if (isPhetio) {
        // Add the console logging, not a wrapper but nice to have
        modes.push({
          name: 'one-sim-wrapper-tests',
          text: 'Wrapper Unit Tests',
          group: 'PhET-iO',
          description: 'Test the PhET-iO API for this sim.',
          url: `../phet-io-wrappers/phet-io-wrappers-tests.html?sim=${repo}`,
          queryParameters: phetioWrapperQueryParameters
        });

        // Add a link to the compiled wrapper index;
        modes.push({
          name: 'compiled-index',
          text: 'Compiled Index',
          group: 'PhET-iO',
          description: 'Runs the PhET-iO wrapper index from build/ directory (built from chipper)',
          url: `../${repo}/build/phet-io/`,
          queryParameters: phetioWrapperQueryParameters
        });
        modes.push({
          name: 'standalone',
          text: 'Standalone',
          group: 'PhET-iO',
          description: 'Runs the sim in phet-io brand with the standalone query parameter',
          url: `../${repo}/${repo}_en.html?brand=phet-io&phetioStandalone`,
          queryParameters: phetioSimQueryParameters.concat(simQueryParameters)
        });

        // phet-io wrappers
        wrappers.concat(nonPublishedPhetioWrappersToAddToPhetmarks).sort().forEach(wrapper => {
          const wrapperName = getWrapperName(wrapper);
          let url = '';

          // Process for dedicated wrapper repos
          if (wrapper.indexOf('phet-io-wrapper-') === 0) {
            // Special use case for the sonification wrapper
            url = wrapperName === 'sonification' ? `../phet-io-wrapper-${wrapperName}/${repo}-sonification.html?sim=${repo}` : `../${wrapper}/?sim=${repo}`;
          }
          // Load the wrapper urls for the phet-io-wrappers/
          else {
            url = `../${wrapper}/?sim=${repo}`;
          }

          // add recording to the console by default
          if (wrapper === 'phet-io-wrappers/record') {
            url += '&console';
          }
          let queryParameters = [];
          if (wrapperName === 'studio') {
            const studioQueryParameters = [...phetioWrapperQueryParameters];

            // Studio defaults to phetioDebug=true, so this parameter doesn't make sense
            _.remove(studioQueryParameters, item => item === phetioDebugTrueParameter);
            queryParameters = studioQueryParameters.concat([{
              value: 'phetioDebug=false',
              text: 'Disable assertions for the sim inside Studio. Studio defaults to phetioDebug=true',
              default: false
            }, {
              value: 'phetioElementsDisplay=all',
              text: 'Show all elements',
              default: true
            }]);
          } else if (wrapperName === 'playback') {
            queryParameters = [];
          } else {
            queryParameters = phetioWrapperQueryParameters;
          }
          modes.push({
            name: wrapperName,
            text: wrapperName,
            group: 'PhET-iO',
            description: `Runs the phet-io wrapper ${wrapperName}`,
            url: url,
            queryParameters: queryParameters
          });
        });

        // Add the console logging, not a wrapper but nice to have
        modes.push({
          name: 'colorized',
          text: 'Data: colorized',
          group: 'PhET-iO',
          description: 'Show the colorized event log in the console of the stand alone sim.',
          url: `../${repo}/${repo}_en.html?brand=phet-io&phetioConsoleLog=colorized&phetioStandalone&phetioEmitHighFrequencyEvents=false`,
          queryParameters: phetioSimQueryParameters.concat(simQueryParameters)
        });
      }
    });
    return modeData;
  }
  function clearChildren(element) {
    while (element.childNodes.length) {
      element.removeChild(element.childNodes[0]);
    }
  }

  /**
   * @param {Array.<string>} repositories - All repository names
   * @returns { element: {HTMLSelectElement}, get value(): {string} }
   */
  function createRepositorySelector(repositories) {
    const select = document.createElement('select');
    select.autofocus = true;
    repositories.forEach(repo => {
      const option = document.createElement('option');
      option.value = option.label = option.innerHTML = repo;
      select.appendChild(option);
    });

    // IE or no-scrollIntoView will need to be height-limited
    if (select.scrollIntoView && navigator.userAgent.indexOf('Trident/') < 0) {
      select.setAttribute('size', repositories.length);
    } else {
      select.setAttribute('size', '30');
    }

    // Select a repository if it's been stored in localStorage before
    const repoKey = storageKey('repo');
    if (localStorage.getItem(repoKey)) {
      select.value = localStorage.getItem(repoKey);
    }
    select.focus();

    // Scroll to the selected element
    function tryScroll() {
      const element = select.childNodes[select.selectedIndex];
      if (element.scrollIntoViewIfNeeded) {
        element.scrollIntoViewIfNeeded();
      } else if (element.scrollIntoView) {
        element.scrollIntoView();
      }
    }
    select.addEventListener('change', tryScroll);
    // We need to wait for things to load fully before scrolling (in Chrome).
    // See https://github.com/phetsims/phetmarks/issues/13
    setTimeout(tryScroll, 0);
    return {
      element: select,
      get value() {
        return select.childNodes[select.selectedIndex].value;
      }
    };
  }

  /**
   * @param {Object} modeData - Maps from {string} repository name => {Mode}
   * @param {Object} repositorySelector
   * @returns { element: {HTMLSelectElement},
   *            get value(): {string},
   *            get mode(): {Mode},
   *            update: function() }
   */
  function createModeSelector(modeData, repositorySelector) {
    const select = document.createElement('select');
    const selector = {
      element: select,
      get value() {
        return select.value;
      },
      get mode() {
        const currentModeName = selector.value;
        return _.filter(modeData[repositorySelector.value], mode => {
          return mode.name === currentModeName;
        })[0];
      },
      update: function () {
        localStorage.setItem(storageKey('repo'), repositorySelector.value);
        clearChildren(select);
        const groups = {};
        modeData[repositorySelector.value].forEach(choice => {
          const choiceOption = document.createElement('option');
          choiceOption.value = choice.name;
          choiceOption.label = choice.text;
          choiceOption.title = choice.description;
          choiceOption.innerHTML = choice.text;

          // add to an `optgroup` instead of having all modes on the `select`
          choice.group = choice.group || 'General';

          // create if the group doesn't exist
          if (!groups[choice.group]) {
            const optGroup = document.createElement('optgroup');
            optGroup.label = choice.group;
            groups[choice.group] = optGroup;
            select.appendChild(optGroup);
          }

          // add the choice to the propert group
          groups[choice.group].appendChild(choiceOption);
        });
        select.setAttribute('size', modeData[repositorySelector.value].length + Object.keys(groups).length);
        if (select.selectedIndex < 0) {
          select.selectedIndex = 0;
        }
      }
    };
    return selector;
  }
  function createScreenSelector() {
    const div = document.createElement('div');
    function createScreenRadioButton(name, value, text) {
      const label = document.createElement('label');
      label.className = 'screenLabel';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = name;
      radio.value = value;
      radio.checked = value === 'all';
      label.appendChild(radio);
      label.appendChild(document.createTextNode(text));
      return label;
    }
    div.appendChild(createScreenRadioButton('screens', 'all', 'All screens'));
    for (let i = 1; i <= 6; i++) {
      div.appendChild(createScreenRadioButton('screens', `${i}`, `${i}`));
    }
    return {
      element: div,
      get value() {
        return $('input[name=screens]:checked').val();
      },
      reset: function () {
        $('input[name=screens]')[0].checked = true;
      }
    };
  }
  function createPhetioValidationSelector() {
    const div = document.createElement('div');
    function createValidationRadioButton(name, value, text) {
      const label = document.createElement('label');
      label.className = 'validationLabel'; // https://github.com/phetsims/tandem/issues/191
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = name;
      radio.value = value;
      radio.checked = value === 'simulation-default';
      label.appendChild(radio);
      label.appendChild(document.createTextNode(text));
      return label;
    }
    const span = document.createElement('span');
    span.textContent = 'phetioValidation=';
    div.appendChild(span);
    div.appendChild(createValidationRadioButton('validation', 'true', 'true'));
    div.appendChild(createValidationRadioButton('validation', 'false', 'false'));
    div.appendChild(createValidationRadioButton('validation', 'simulation-default', 'Simulation Default'));
    return {
      element: div,
      get value() {
        return $('input[name=validation]:checked').val();
      },
      reset: function () {
        $('input[name=validation]')[0].checked = true;
      }
    };
  }

  /**
   * @param {Object} modeSelector
   * @returns { element: {HTMLSelectElement}, get value(): {string} }
   */
  function createQueryParameterSelector(modeSelector) {
    const screenSelector = createScreenSelector();
    const phetioValidationSelector = createPhetioValidationSelector();
    const customTextBox = document.createElement('input');
    customTextBox.type = 'text';
    const toggleContainer = document.createElement('div');

    // get the ID for a checkbox that is "dependent" on another value
    const getDependentParameterControlId = value => `dependent-checkbox-${value}`;
    const selector = {
      screenElement: screenSelector.element,
      phetioValidationElement: phetioValidationSelector.element,
      toggleElement: toggleContainer,
      customElement: customTextBox,
      get value() {
        const screensValue = screenSelector.value;
        const checkboxes = $(toggleContainer).find(':checkbox');
        const usefulCheckboxes = _.filter(checkboxes, checkbox => {
          // if a checkbox isn't checked, then we only care if it has been changed and is a boolean
          if (checkbox.dataset.queryParameterType === 'boolean') {
            return checkbox.dataset.changed === 'true';
          } else {
            return checkbox.checked;
          }
        });
        const checkboxQueryParameters = _.map(usefulCheckboxes, checkbox => {
          // support boolean parameters
          if (checkbox.dataset.queryParameterType === 'boolean') {
            return `${checkbox.name}=${checkbox.checked}`;
          }
          return checkbox.name;
        });
        const customQueryParameters = customTextBox.value.length ? [customTextBox.value] : [];
        const screenQueryParameters = screensValue === 'all' ? [] : [`screens=${screensValue}`];
        const phetioValidationQueryParameters = phetioValidationSelector.value === 'simulation-default' ? [] : phetioValidationSelector.value === 'true' ? ['phetioValidation=true'] : phetioValidationSelector.value === 'false' ? ['phetioValidation=false'] : 'error';
        if (phetioValidationQueryParameters === 'error') {
          throw new Error('bad value for phetioValidation');
        }
        return checkboxQueryParameters.concat(customQueryParameters).concat(screenQueryParameters).concat(phetioValidationQueryParameters).join('&');
      },
      update: function () {
        clearChildren(toggleContainer);
        const queryParameters = modeSelector.mode.queryParameters || [];
        queryParameters.forEach(parameter => {
          const label = document.createElement('label');
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = parameter.value;
          label.appendChild(checkbox);
          let queryParameterDisplay = parameter.value;

          // should the "=true" if boolean
          if (parameter.type === 'boolean') {
            queryParameterDisplay += `=${parameter.default}`;
          }
          label.appendChild(document.createTextNode(`${parameter.text} (${queryParameterDisplay})`));
          toggleContainer.appendChild(label);
          toggleContainer.appendChild(document.createElement('br'));
          checkbox.checked = !!parameter.default;
          if (parameter.dependentQueryParameters) {
            /**
             * Creates a checkbox whose value is dependent on another checkbox, it is only used if the parent
             * checkbox is checked.
             * @param {string} label
             * @param {string} value
             * @param {boolean} checked - initial checked state
             * @returns {HTMLDivElement}
             */
            const createDependentCheckbox = (label, value, checked) => {
              const dependentQueryParametersContainer = document.createElement('div');
              const dependentCheckbox = document.createElement('input');
              dependentCheckbox.id = getDependentParameterControlId(value);
              dependentCheckbox.type = 'checkbox';
              dependentCheckbox.name = value;
              dependentCheckbox.style.marginLeft = '40px';
              dependentCheckbox.checked = checked;
              const labelElement = document.createElement('label');
              labelElement.appendChild(document.createTextNode(label));
              labelElement.htmlFor = dependentCheckbox.id;
              dependentQueryParametersContainer.appendChild(dependentCheckbox);
              dependentQueryParametersContainer.appendChild(labelElement);

              // checkbox becomes unchecked and disabled if dependency checkbox is unchecked
              const enableButton = () => {
                dependentCheckbox.disabled = !checkbox.checked;
                if (!checkbox.checked) {
                  dependentCheckbox.checked = false;
                }
              };
              checkbox.addEventListener('change', enableButton);
              enableButton();
              return dependentQueryParametersContainer;
            };
            const containerDiv = document.createElement('div');
            parameter.dependentQueryParameters.forEach(relatedParameter => {
              const dependentCheckbox = createDependentCheckbox(`${relatedParameter.text} (${relatedParameter.value})`, relatedParameter.value, !!relatedParameter.default);
              containerDiv.appendChild(dependentCheckbox);
            });
            toggleContainer.appendChild(containerDiv);
          }

          // mark changed events for boolean parameter support
          checkbox.addEventListener('change', () => {
            checkbox.dataset.changed = 'true';
          });
          checkbox.dataset.queryParameterType = parameter.type;
        });
      },
      reset: function () {
        screenSelector.reset();
        phetioValidationSelector.reset();
        customTextBox.value = '';

        // For each checkbox, set it to its default
        _.forEach($(toggleContainer).find(':checkbox'), checkbox => {
          // Grab the parameter object
          const parameter = _.filter(modeSelector.mode.queryParameters, param => param.value === checkbox.name)[0];
          if (parameter) {
            // Handle when the default isn't defined (it would be false)
            checkbox.checked = !!parameter.default;

            // dependent parameter controls only enabled if parent checkbox is checked
            if (parameter.dependentQueryParameters) {
              parameter.dependentQueryParameters.forEach(relatedParam => {
                const dependentCheckbox = document.getElementById(getDependentParameterControlId(relatedParam.value));
                dependentCheckbox.disabled = !checkbox.checked;
                dependentCheckbox.checked = !!relatedParam.default;
              });
            }
          }
        });
      }
    };
    return selector;
  }

  /**
   * Create the view and hook everything up.
   *
   * @param {Object} modeData - Maps from {string} repository name => {Mode}
   */
  function render(modeData) {
    const repositorySelector = createRepositorySelector(Object.keys(modeData));
    const modeSelector = createModeSelector(modeData, repositorySelector);
    const queryParameterSelector = createQueryParameterSelector(modeSelector);
    function getCurrentURL() {
      const queryParameters = queryParameterSelector.value;
      const url = modeSelector.mode.url;
      const separator = url.indexOf('?') < 0 ? '?' : '&';
      return url + (queryParameters.length ? separator + queryParameters : '');
    }
    const launchButton = document.createElement('button');
    launchButton.id = 'launchButton';
    launchButton.name = 'launch';
    launchButton.innerHTML = 'Launch';
    const resetButton = document.createElement('button');
    resetButton.name = 'reset';
    resetButton.innerHTML = 'Reset Query Parameters';
    function header(str) {
      const head = document.createElement('h3');
      head.appendChild(document.createTextNode(str));
      return head;
    }

    // Divs for our three columns
    const repoDiv = document.createElement('div');
    repoDiv.id = 'repositories';
    const modeDiv = document.createElement('div');
    modeDiv.id = 'choices';
    const queryParametersDiv = document.createElement('div');
    queryParametersDiv.id = 'queryParameters';

    // Layout of all of the major elements
    repoDiv.appendChild(header('Repositories'));
    repoDiv.appendChild(repositorySelector.element);
    modeDiv.appendChild(header('Modes'));
    modeDiv.appendChild(modeSelector.element);
    modeDiv.appendChild(document.createElement('br'));
    modeDiv.appendChild(document.createElement('br'));
    modeDiv.appendChild(launchButton);
    queryParametersDiv.appendChild(header('Query Parameters'));
    queryParametersDiv.appendChild(queryParameterSelector.toggleElement);
    queryParametersDiv.appendChild(queryParameterSelector.phetioValidationElement);
    queryParametersDiv.appendChild(queryParameterSelector.screenElement);
    queryParametersDiv.appendChild(document.createTextNode('Query Parameters: '));
    queryParametersDiv.appendChild(queryParameterSelector.customElement);
    queryParametersDiv.appendChild(document.createElement('br'));
    queryParametersDiv.appendChild(resetButton);
    document.body.appendChild(repoDiv);
    document.body.appendChild(modeDiv);
    document.body.appendChild(queryParametersDiv);
    function updateQueryParameterVisibility() {
      queryParametersDiv.style.visibility = modeSelector.mode.queryParameters ? 'inherit' : 'hidden';
    }

    // Align panels based on width
    function layout() {
      modeDiv.style.left = `${repositorySelector.element.clientWidth + 20}px`;
      queryParametersDiv.style.left = `${repositorySelector.element.clientWidth + +modeDiv.clientWidth + 40}px`;
    }
    window.addEventListener('resize', layout);

    // Hook updates to change listeners
    function onRepositoryChanged() {
      modeSelector.update();
      onModeChanged();
    }
    function onModeChanged() {
      queryParameterSelector.update();
      updateQueryParameterVisibility();
      layout();
    }
    repositorySelector.element.addEventListener('change', onRepositoryChanged);
    modeSelector.element.addEventListener('change', onModeChanged);
    onRepositoryChanged();

    // Clicking 'Launch' or pressing 'enter' opens the URL
    function openCurrentURL() {
      openURL(getCurrentURL());
    }
    window.addEventListener('keydown', event => {
      // Check for enter key
      if (event.which === 13) {
        openCurrentURL();
      }
    }, false);
    launchButton.addEventListener('click', openCurrentURL);

    // Reset
    resetButton.addEventListener('click', queryParameterSelector.reset);
  }

  // Splits file strings (such as perennial-alias/data/active-runnables) into a list of entries, ignoring blank lines.
  function whiteSplitAndSort(str) {
    return str.split('\n').map(line => {
      return line.replace('\r', '');
    }).filter(line => {
      return line.length > 0;
    }).sort();
  }

  // Load files serially, populate then render
  $.ajax({
    url: '../perennial-alias/data/active-runnables'
  }).done(activeRunnablesString => {
    const activeRunnables = whiteSplitAndSort(activeRunnablesString);
    $.ajax({
      url: '../perennial-alias/data/active-repos'
    }).done(activeReposString => {
      const activeRepos = whiteSplitAndSort(activeReposString);
      $.ajax({
        url: '../perennial-alias/data/phet-io'
      }).done(testPhetioString => {
        const phetioSims = whiteSplitAndSort(testPhetioString);
        $.ajax({
          url: '../perennial-alias/data/interactive-description'
        }).done(accessibleSimsString => {
          const interactiveDescriptionSims = whiteSplitAndSort(accessibleSimsString);
          $.ajax({
            url: '../perennial-alias/data/wrappers'
          }).done(wrappersString => {
            const wrappers = whiteSplitAndSort(wrappersString).sort();
            $.ajax({
              url: '../perennial-alias/data/unit-tests'
            }).done(unitTestsStrings => {
              const unitTestsRepos = whiteSplitAndSort(unitTestsStrings).sort();
              render(populate(activeRunnables, activeRepos, phetioSims, interactiveDescriptionSims, wrappers, unitTestsRepos));
            });
          });
        });
      });
    });
  });
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzaW1RdWVyeVBhcmFtZXRlcnMiLCJ2YWx1ZSIsInRleHQiLCJkZXBlbmRlbnRRdWVyeVBhcmFtZXRlcnMiLCJkZWZhdWx0IiwidHlwZSIsImVhT2JqZWN0IiwiZGV2U2ltUXVlcnlQYXJhbWV0ZXJzIiwicGhldGlvQmFzZVBhcmFtZXRlcnMiLCJub25QdWJsaXNoZWRQaGV0aW9XcmFwcGVyc1RvQWRkVG9QaGV0bWFya3MiLCJwaGV0aW9EZWJ1Z1RydWVQYXJhbWV0ZXIiLCJwaGV0aW9XcmFwcGVyUXVlcnlQYXJhbWV0ZXJzIiwiY29uY2F0IiwicGhldGlvU2ltUXVlcnlQYXJhbWV0ZXJzIiwic3RvcmFnZUtleSIsImtleSIsImdldFdyYXBwZXJOYW1lIiwid3JhcHBlciIsIndyYXBwZXJQYXJ0cyIsInNwbGl0Iiwid3JhcHBlck5hbWUiLCJsZW5ndGgiLCJzcGxpdE9uU2xhc2giLCJzaGlmdFByZXNzZWQiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJzaGlmdEtleSIsIm9wZW5VUkwiLCJ1cmwiLCJvcGVuIiwibG9jYXRpb24iLCJwb3B1bGF0ZSIsImFjdGl2ZVJ1bm5hYmxlcyIsImFjdGl2ZVJlcG9zIiwicGhldGlvU2ltcyIsImludGVyYWN0aXZlRGVzY3JpcHRpb25TaW1zIiwid3JhcHBlcnMiLCJ1bml0VGVzdHNSZXBvcyIsIm1vZGVEYXRhIiwiZm9yRWFjaCIsInJlcG8iLCJtb2RlcyIsImlzUGhldGlvIiwiXyIsImluY2x1ZGVzIiwiaGFzVW5pdFRlc3RzIiwiaXNSdW5uYWJsZSIsInN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbiIsInB1c2giLCJuYW1lIiwiZGVzY3JpcHRpb24iLCJxdWVyeVBhcmFtZXRlcnMiLCJnZW5lcmFsVGVzdFBhcmFtcyIsImZ1enpUZXN0UGFyYW1ldGVyIiwiam9pbiIsImdyb3VwIiwic29ydCIsImluZGV4T2YiLCJzdHVkaW9RdWVyeVBhcmFtZXRlcnMiLCJyZW1vdmUiLCJpdGVtIiwiY2xlYXJDaGlsZHJlbiIsImVsZW1lbnQiLCJjaGlsZE5vZGVzIiwicmVtb3ZlQ2hpbGQiLCJjcmVhdGVSZXBvc2l0b3J5U2VsZWN0b3IiLCJyZXBvc2l0b3JpZXMiLCJzZWxlY3QiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJhdXRvZm9jdXMiLCJvcHRpb24iLCJsYWJlbCIsImlubmVySFRNTCIsImFwcGVuZENoaWxkIiwic2Nyb2xsSW50b1ZpZXciLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJzZXRBdHRyaWJ1dGUiLCJyZXBvS2V5IiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsImZvY3VzIiwidHJ5U2Nyb2xsIiwic2VsZWN0ZWRJbmRleCIsInNjcm9sbEludG9WaWV3SWZOZWVkZWQiLCJzZXRUaW1lb3V0IiwiY3JlYXRlTW9kZVNlbGVjdG9yIiwicmVwb3NpdG9yeVNlbGVjdG9yIiwic2VsZWN0b3IiLCJtb2RlIiwiY3VycmVudE1vZGVOYW1lIiwiZmlsdGVyIiwidXBkYXRlIiwic2V0SXRlbSIsImdyb3VwcyIsImNob2ljZSIsImNob2ljZU9wdGlvbiIsInRpdGxlIiwib3B0R3JvdXAiLCJPYmplY3QiLCJrZXlzIiwiY3JlYXRlU2NyZWVuU2VsZWN0b3IiLCJkaXYiLCJjcmVhdGVTY3JlZW5SYWRpb0J1dHRvbiIsImNsYXNzTmFtZSIsInJhZGlvIiwiY2hlY2tlZCIsImNyZWF0ZVRleHROb2RlIiwiaSIsIiQiLCJ2YWwiLCJyZXNldCIsImNyZWF0ZVBoZXRpb1ZhbGlkYXRpb25TZWxlY3RvciIsImNyZWF0ZVZhbGlkYXRpb25SYWRpb0J1dHRvbiIsInNwYW4iLCJ0ZXh0Q29udGVudCIsImNyZWF0ZVF1ZXJ5UGFyYW1ldGVyU2VsZWN0b3IiLCJtb2RlU2VsZWN0b3IiLCJzY3JlZW5TZWxlY3RvciIsInBoZXRpb1ZhbGlkYXRpb25TZWxlY3RvciIsImN1c3RvbVRleHRCb3giLCJ0b2dnbGVDb250YWluZXIiLCJnZXREZXBlbmRlbnRQYXJhbWV0ZXJDb250cm9sSWQiLCJzY3JlZW5FbGVtZW50IiwicGhldGlvVmFsaWRhdGlvbkVsZW1lbnQiLCJ0b2dnbGVFbGVtZW50IiwiY3VzdG9tRWxlbWVudCIsInNjcmVlbnNWYWx1ZSIsImNoZWNrYm94ZXMiLCJmaW5kIiwidXNlZnVsQ2hlY2tib3hlcyIsImNoZWNrYm94IiwiZGF0YXNldCIsInF1ZXJ5UGFyYW1ldGVyVHlwZSIsImNoYW5nZWQiLCJjaGVja2JveFF1ZXJ5UGFyYW1ldGVycyIsIm1hcCIsImN1c3RvbVF1ZXJ5UGFyYW1ldGVycyIsInNjcmVlblF1ZXJ5UGFyYW1ldGVycyIsInBoZXRpb1ZhbGlkYXRpb25RdWVyeVBhcmFtZXRlcnMiLCJFcnJvciIsInBhcmFtZXRlciIsInF1ZXJ5UGFyYW1ldGVyRGlzcGxheSIsImNyZWF0ZURlcGVuZGVudENoZWNrYm94IiwiZGVwZW5kZW50UXVlcnlQYXJhbWV0ZXJzQ29udGFpbmVyIiwiZGVwZW5kZW50Q2hlY2tib3giLCJpZCIsInN0eWxlIiwibWFyZ2luTGVmdCIsImxhYmVsRWxlbWVudCIsImh0bWxGb3IiLCJlbmFibGVCdXR0b24iLCJkaXNhYmxlZCIsImNvbnRhaW5lckRpdiIsInJlbGF0ZWRQYXJhbWV0ZXIiLCJwYXJhbSIsInJlbGF0ZWRQYXJhbSIsImdldEVsZW1lbnRCeUlkIiwicmVuZGVyIiwicXVlcnlQYXJhbWV0ZXJTZWxlY3RvciIsImdldEN1cnJlbnRVUkwiLCJzZXBhcmF0b3IiLCJsYXVuY2hCdXR0b24iLCJyZXNldEJ1dHRvbiIsImhlYWRlciIsInN0ciIsImhlYWQiLCJyZXBvRGl2IiwibW9kZURpdiIsInF1ZXJ5UGFyYW1ldGVyc0RpdiIsImJvZHkiLCJ1cGRhdGVRdWVyeVBhcmFtZXRlclZpc2liaWxpdHkiLCJ2aXNpYmlsaXR5IiwibGF5b3V0IiwibGVmdCIsImNsaWVudFdpZHRoIiwib25SZXBvc2l0b3J5Q2hhbmdlZCIsIm9uTW9kZUNoYW5nZWQiLCJvcGVuQ3VycmVudFVSTCIsIndoaWNoIiwid2hpdGVTcGxpdEFuZFNvcnQiLCJsaW5lIiwicmVwbGFjZSIsImFqYXgiLCJkb25lIiwiYWN0aXZlUnVubmFibGVzU3RyaW5nIiwiYWN0aXZlUmVwb3NTdHJpbmciLCJ0ZXN0UGhldGlvU3RyaW5nIiwiYWNjZXNzaWJsZVNpbXNTdHJpbmciLCJ3cmFwcGVyc1N0cmluZyIsInVuaXRUZXN0c1N0cmluZ3MiXSwic291cmNlcyI6WyJwaGV0bWFya3MuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKlxyXG4gKiBQYWdlIGZvciBxdWlja2x5IGxhdW5jaGluZyBwaGV0LXJlbGF0ZWQgdGFza3MsIHN1Y2ggYXMgc2ltdWxhdGlvbnMsIGF1dG9tYXRlZC91bml0IHRlc3RzLCBvciBvdGhlciB1dGlsaXRpZXMuXHJcbiAqXHJcbiAqIERpc3BsYXlzIHRocmVlIGNvbHVtbnM6XHJcbiAqXHJcbiAqIC0gUmVwb3NpdG9yaWVzOiBBIGxpc3Qgb2YgcmVwb3NpdG9yaWVzIHRvIHNlbGVjdCBmcm9tLCBlYWNoIG9uZSBvZiB3aGljaCBoYXMgYSBudW1iZXIgb2YgbW9kZXMuXHJcbiAqIC0gTW9kZXM6IEJhc2VkIG9uIHRoZSByZXBvc2l0b3J5IHNlbGVjdGVkLiBEZWNpZGVzIHdoYXQgdHlwZSBvZiBVUkwgaXMgbG9hZGVkIHdoZW4gXCJMYXVuY2hcIiBvciB0aGUgZW50ZXIga2V5IGlzXHJcbiAqICAgICAgICAgIHByZXNzZWQuXHJcbiAqIC0gUXVlcnkgUGFyYW1ldGVyczogSWYgYXZhaWxhYmxlLCBjb250cm9scyB3aGF0IG9wdGlvbmFsIHF1ZXJ5IHBhcmFtZXRlcnMgd2lsbCBiZSBhZGRlZCB0byB0aGUgZW5kIG9mIHRoZSBVUkwuXHJcbiAqXHJcbiAqIE1vZGUgaGFzIHRoZSBmb3JtYXQ6XHJcbiAqIHtcclxuICogICBuYW1lOiB7c3RyaW5nfSAtIEludGVybmFsIHVuaXF1ZSB2YWx1ZSAoZm9yIGxvb2tpbmcgdXAgd2hpY2ggb3B0aW9uIHdhcyBjaG9zZW4pLFxyXG4gKiAgIHRleHQ6IHtzdHJpbmd9IC0gU2hvd24gaW4gdGhlIG1vZGUgbGlzdCxcclxuICogICBncm91cDoge3N0cmluZ30gLSBUaGUgb3B0Z3JvdXAgdGhhdCB0aGlzIG1vZGUgYmVsb25ncyB0b1xyXG4gKiAgIGRlc2NyaXB0aW9uOiB7c3RyaW5nfSAtIFNob3duIHdoZW4gaG92ZXJpbmcgb3ZlciB0aGUgbW9kZSBpbiB0aGUgbGlzdCxcclxuICogICB1cmw6IHtzdHJpbmd9IC0gVGhlIGJhc2UgVVJMIHRvIHZpc2l0ICh3aXRob3V0IGFkZGVkIHF1ZXJ5IHBhcmFtZXRlcnMpIHdoZW4gdGhlIG1vZGUgaXMgY2hvc2VuLFxyXG4gKiAgIHF1ZXJ5UGFyYW1ldGVyczoge0FycmF5LjxRdWVyeVBhcmFtZXRlcj59XHJcbiAqIH1cclxuICpcclxuICogUXVlcnlQYXJhbWV0ZXIgaGFzIHRoZSBmb3JtYXQ6XHJcbiAqIHtcclxuICogICB2YWx1ZToge3N0cmluZ30gLSBUaGUgYWN0dWFsIHF1ZXJ5IHBhcmFtZXRlciBpbmNsdWRlZCBpbiB0aGUgVVJMLFxyXG4gKiAgIHRleHQ6IHtzdHJpbmd9IC0gU2hvd24gaW4gdGhlIHF1ZXJ5IHBhcmFtZXRlciBsaXN0LFxyXG4gKiAgIFt0eXBlXTogeydib29sZWFuJ30gLSBpZiBib29sZWFuLCB0aGVuIGl0IHdpbGwgYWRkIFwiPXRydWVcIiBvciBcIj1mYWxzZVwiIHRvIHRoZSBjaGVja2JveCB2YWx1ZVxyXG4gKiAgIFtkZWZhdWx0XToge2Jvb2xlYW59IC0gSWYgdHJ1ZSwgdGhlIHF1ZXJ5IHBhcmFtZXRlciB3aWxsIGJlIHRydWUgYnkgZGVmYXVsdFxyXG4gKiB9XHJcbiAqL1xyXG5cclxuKCBmdW5jdGlvbigpIHtcclxuXHJcblxyXG4gIC8vIFF1ZXJ5IHBhcmFtZXRlcnMgdXNlZCBmb3IgdGhlIGZvbGxvd2luZyBtb2RlczogcmVxdWlyZWpzLCBjb21waWxlZCwgcHJvZHVjdGlvblxyXG4gIGNvbnN0IHNpbVF1ZXJ5UGFyYW1ldGVycyA9IFtcclxuICAgIHsgdmFsdWU6ICdhdWRpbz1kaXNhYmxlZCcsIHRleHQ6ICdNdXRlJyB9LFxyXG4gICAge1xyXG4gICAgICB2YWx1ZTogJ2Z1enonLCB0ZXh0OiAnRnV6eicsIGRlcGVuZGVudFF1ZXJ5UGFyYW1ldGVyczogW1xyXG4gICAgICAgIHsgdmFsdWU6ICdmdXp6UG9pbnRlcnM9MicsIHRleHQ6ICdNdWx0aXRvdWNoLWZ1enonIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHsgdmFsdWU6ICdmdXp6Qm9hcmQnLCB0ZXh0OiAnS2V5Ym9hcmQgRnV6eicgfSxcclxuICAgIHsgdmFsdWU6ICdkZWJ1Z2dlcicsIHRleHQ6ICdEZWJ1Z2dlcicsIGRlZmF1bHQ6IHRydWUgfSxcclxuICAgIHsgdmFsdWU6ICdkZXByZWNhdGlvbldhcm5pbmdzJywgdGV4dDogJ0RlcHJlY2F0aW9uIFdhcm5pbmdzJyB9LFxyXG4gICAgeyB2YWx1ZTogJ2RldicsIHRleHQ6ICdEZXYnIH0sXHJcbiAgICB7IHZhbHVlOiAncHJvZmlsZXInLCB0ZXh0OiAnUHJvZmlsZXInIH0sXHJcbiAgICB7IHZhbHVlOiAnc2hvd1BvaW50ZXJzJywgdGV4dDogJ1BvaW50ZXJzJyB9LFxyXG4gICAgeyB2YWx1ZTogJ3Nob3dQb2ludGVyQXJlYXMnLCB0ZXh0OiAnUG9pbnRlciBBcmVhcycgfSxcclxuICAgIHsgdmFsdWU6ICdzaG93Rml0dGVkQmxvY2tCb3VuZHMnLCB0ZXh0OiAnRml0dGVkIEJsb2NrIEJvdW5kcycgfSxcclxuICAgIHsgdmFsdWU6ICdzaG93Q2FudmFzTm9kZUJvdW5kcycsIHRleHQ6ICdDYW52YXNOb2RlIEJvdW5kcycgfSxcclxuICAgIHsgdmFsdWU6ICdzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb24nLCB0ZXh0OiAnU3VwcG9ydHMgSW50ZXJhY3RpdmUgRGVzY3JpcHRpb24nLCBkZWZhdWx0OiBmYWxzZSwgdHlwZTogJ2Jvb2xlYW4nIH0sXHJcbiAgICB7IHZhbHVlOiAnc3VwcG9ydHNTb3VuZCcsIHRleHQ6ICdTdXBwb3J0cyBTb3VuZCcsIGRlZmF1bHQ6IGZhbHNlLCB0eXBlOiAnYm9vbGVhbicgfSxcclxuICAgIHsgdmFsdWU6ICdzdXBwb3J0c0V4dHJhU291bmQnLCB0ZXh0OiAnU3VwcG9ydHMgRXh0cmEgU291bmQnLCBkZWZhdWx0OiBmYWxzZSwgdHlwZTogJ2Jvb2xlYW4nIH0sXHJcbiAgICB7IHZhbHVlOiAnZXh0cmFTb3VuZEluaXRpYWxseUVuYWJsZWQnLCB0ZXh0OiAnRXh0cmEgU291bmQgb24gYnkgZGVmYXVsdCcgfSxcclxuICAgIHsgdmFsdWU6ICdzdXBwb3J0c1BhbkFuZFpvb20nLCB0ZXh0OiAnU3VwcG9ydHMgUGFuIGFuZCBab29tJywgZGVmYXVsdDogdHJ1ZSwgdHlwZTogJ2Jvb2xlYW4nIH0sXHJcbiAgICB7IHZhbHVlOiAnc3VwcG9ydHNWb2ljaW5nJywgdGV4dDogJ1N1cHBvcnRzIFZvaWNpbmcnLCBkZWZhdWx0OiBmYWxzZSwgdHlwZTogJ2Jvb2xlYW4nIH0sXHJcbiAgICB7IHZhbHVlOiAndm9pY2luZ0luaXRpYWxseUVuYWJsZWQnLCB0ZXh0OiAnVm9pY2luZyBvbiBieSBkZWZhdWx0JyB9LFxyXG4gICAgeyB2YWx1ZTogJ3ByaW50Vm9pY2luZ1Jlc3BvbnNlcycsIHRleHQ6ICdjb25zb2xlLmxvZygpIHZvaWNpbmcgcmVzcG9uc2VzJyB9LFxyXG4gICAgeyB2YWx1ZTogJ2ludGVyYWN0aXZlSGlnaGxpZ2h0c0luaXRpYWxseUVuYWJsZWQnLCB0ZXh0OiAnSW50ZXJhY3RpdmUgSGlnaGxpZ2h0cyBvbiBieSBkZWZhdWx0JyB9LFxyXG4gICAgeyB2YWx1ZTogJ3ByZWZlcmVuY2VzU3RvcmFnZScsIHRleHQ6ICdSZW1lbWJlciBwcmV2aW91cyB2YWx1ZXMgb2YgcHJlZmVyZW5jZXMgZnJvbSBsb2NhbFN0b3JhZ2UuJyB9LFxyXG4gICAgeyB2YWx1ZTogJ3dlYmdsPWZhbHNlJywgdGV4dDogJ05vIFdlYkdMJyB9LFxyXG4gICAgeyB2YWx1ZTogJ2xpc3RlbmVyT3JkZXI9cmFuZG9tJywgdGV4dDogJ1JhbmRvbWl6ZSBsaXN0ZW5lciBvcmRlcicgfSxcclxuICAgIHtcclxuICAgICAgdmFsdWU6ICdsb2NhbGVzPSonLCB0ZXh0OiAnTG9hZCBhbGwgbG9jYWxlcycsIGRlcGVuZGVudFF1ZXJ5UGFyYW1ldGVyczogW1xyXG4gICAgICAgIHsgdmFsdWU6ICdrZXlib2FyZExvY2FsZVN3aXRjaGVyJywgdGV4dDogJ2N0cmwgKyB1L2kgdG8gY3ljbGUgbG9jYWxlcycgfVxyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgXTtcclxuXHJcbiAgY29uc3QgZWFPYmplY3QgPSB7IHZhbHVlOiAnZWEnLCB0ZXh0OiAnQXNzZXJ0aW9ucycsIGRlZmF1bHQ6IHRydWUgfTtcclxuXHJcbiAgLy8gUXVlcnkgcGFyYW1ldGVycyB1c2VkIGZvciByZXF1aXJlanMgYW5kIFBoRVQtaU8gd3JhcHBlcnNcclxuICBjb25zdCBkZXZTaW1RdWVyeVBhcmFtZXRlcnMgPSBbXHJcbiAgICB7IHZhbHVlOiAnYnJhbmQ9cGhldCcsIHRleHQ6ICdQaEVUIEJyYW5kJywgZGVmYXVsdDogdHJ1ZSB9LFxyXG4gICAgZWFPYmplY3QsXHJcbiAgICB7IHZhbHVlOiAnZWFsbCcsIHRleHQ6ICdBbGwgQXNzZXJ0aW9ucycgfVxyXG4gIF07XHJcblxyXG4gIGNvbnN0IHBoZXRpb0Jhc2VQYXJhbWV0ZXJzID0gWyB7XHJcbiAgICB2YWx1ZTogJ3BoZXRpb0VtaXRIaWdoRnJlcXVlbmN5RXZlbnRzJyxcclxuICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICB0ZXh0OiAnRW1pdCBldmVudHMgdGhhdCBvY2N1ciBvZnRlbidcclxuICB9LCB7XHJcbiAgICB2YWx1ZTogJ3BoZXRpb0VtaXRTdGF0ZXMnLFxyXG4gICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICB0ZXh0OiAnRW1pdCBzdGF0ZXMgdG8gdGhlIGRhdGEgc3RyZWFtJ1xyXG4gIH0sIHtcclxuICAgIHZhbHVlOiAncGhldGlvQ29tcGFyZUFQSSZyYW5kb21TZWVkPTMzMjIxMScsIC8vIE5PVEU6IERVUExJQ0FUSU9OIEFMRVJUOiByYW5kb20gc2VlZCBtdXN0IG1hdGNoIHRoYXQgb2YgQVBJIGdlbmVyYXRpb24sIHNlZSBnZW5lcmF0ZVBoZXRpb01hY3JvQVBJLmpzXHJcbiAgICB0ZXh0OiAnQ29tcGFyZSB3aXRoIHJlZmVyZW5jZSBBUEknXHJcbiAgfSwge1xyXG4gICAgdmFsdWU6ICdwaGV0aW9QcmludE1pc3NpbmdUYW5kZW1zJyxcclxuICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgdGV4dDogJ1ByaW50IHRhbmRlbXMgdGhhdCBoYXZlIG5vdCB5ZXQgYmVlbiBhZGRlZCdcclxuICB9LCB7XHJcbiAgICB2YWx1ZTogJ3BoZXRpb1ByaW50QVBJUHJvYmxlbXMnLFxyXG4gICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICB0ZXh0OiAnUHJpbnQgcHJvYmxlbXMgZm91bmQgYnkgcGhldGlvQVBJVmFsaWRhdGlvbiB0byB0aGUgY29uc29sZSBpbnN0ZWFkIG9mIGFzc2VydGluZyBlYWNoIGl0ZW0uJ1xyXG4gIH0sIHtcclxuICAgIHZhbHVlOiAnbG9jYWxlcz0qJyxcclxuICAgIHRleHQ6ICdMb2FkcyBhbGwgdGhlIHRyYW5zbGF0ZWQgdmVyc2lvbnMnLFxyXG4gICAgZGVmYXVsdDogdHJ1ZVxyXG4gIH0sIHtcclxuICAgIHZhbHVlOiAna2V5Ym9hcmRMb2NhbGVTd2l0Y2hlcicsXHJcbiAgICB0ZXh0OiAnRW5hYmxlcyBrZXliYXJkIGN5Y2xpbmcgdGhyb3VnaCB0aGUgbG9jYWxlcycsXHJcbiAgICBkZWZhdWx0OiB0cnVlXHJcbiAgfSBdO1xyXG5cclxuICAvLyBTZWUgcGVyZW5uaWFsLWFsaWFzL2RhdGEvd3JhcHBlcnMgZm9yIGZvcm1hdFxyXG4gIGNvbnN0IG5vblB1Ymxpc2hlZFBoZXRpb1dyYXBwZXJzVG9BZGRUb1BoZXRtYXJrcyA9IFsgJ3BoZXQtaW8td3JhcHBlcnMvbWlycm9yLWlucHV0cycgXTtcclxuXHJcbiAgY29uc3QgcGhldGlvRGVidWdUcnVlUGFyYW1ldGVyID0ge1xyXG4gICAgdmFsdWU6ICdwaGV0aW9EZWJ1Zz10cnVlJyxcclxuICAgIHRleHQ6ICdFbmFibGUgYXNzZXJ0aW9ucyBmb3IgdGhlIHNpbSBpbnNpZGUgYSB3cmFwcGVyLCBiYXNpY2FsbHkgdGhlIHBoZXQtaW8gdmVyc2lvbiBvZiA/ZWEnLFxyXG4gICAgZGVmYXVsdDogdHJ1ZVxyXG4gIH07XHJcblxyXG4gIC8vIFF1ZXJ5IHBhcmFtZXRlcnMgZm9yIHRoZSBQaEVULWlPIHdyYXBwZXJzIChpbmNsdWRpbmcgaWZyYW1lIHRlc3RzKVxyXG4gIGNvbnN0IHBoZXRpb1dyYXBwZXJRdWVyeVBhcmFtZXRlcnMgPSBwaGV0aW9CYXNlUGFyYW1ldGVycy5jb25jYXQoIFsgcGhldGlvRGVidWdUcnVlUGFyYW1ldGVyLCB7XHJcbiAgICB2YWx1ZTogJ3BoZXRpb1dyYXBwZXJEZWJ1Zz10cnVlJyxcclxuICAgIHRleHQ6ICdFbmFibGUgYXNzZXJ0aW9ucyBmb3Igd3JhcHBlci1jb2RlLCBsaWtlIGFzc2VydGlvbnMgaW4gU3R1ZGlvLCBTdGF0ZSwgb3IgQ2xpZW50JyxcclxuICAgIGRlZmF1bHQ6IHRydWVcclxuICB9IF0gKTtcclxuXHJcbiAgLy8gRm9yIHBoZXRpbyBzaW0gZnJhbWUgbGlua3NcclxuICBjb25zdCBwaGV0aW9TaW1RdWVyeVBhcmFtZXRlcnMgPSBwaGV0aW9CYXNlUGFyYW1ldGVycy5jb25jYXQoIFtcclxuICAgIGVhT2JqZWN0LCAvLyB0aGlzIG5lZWRzIHRvIGJlIGZpcnN0IGluIHRoaXMgbGlzdFxyXG4gICAgeyB2YWx1ZTogJ2JyYW5kPXBoZXQtaW8mcGhldGlvU3RhbmRhbG9uZSZwaGV0aW9Db25zb2xlTG9nPWNvbG9yaXplZCcsIHRleHQ6ICdGb3JtYXR0ZWQgUGhFVC1JTyBDb25zb2xlIE91dHB1dCcgfSwge1xyXG4gICAgICB2YWx1ZTogJ3BoZXRpb1ByaW50TWlzc2luZ1RhbmRlbXMnLFxyXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgdGV4dDogJ1ByaW50IHRhbmRlbXMgdGhhdCBoYXZlIG5vdCB5ZXQgYmVlbiBhZGRlZCdcclxuICAgIH0sIHtcclxuICAgICAgdmFsdWU6ICdwaGV0aW9QcmludEFQSVByb2JsZW1zJyxcclxuICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgIHRleHQ6ICdQcmludCBwcm9ibGVtcyBmb3VuZCBieSBwaGV0aW9BUElWYWxpZGF0aW9uIHRvIHRoZSBjb25zb2xlIGluc3RlYWQgb2YgYXNzZXJ0aW5nIGVhY2ggaXRlbS4nXHJcbiAgICB9LCB7XHJcbiAgICAgIHZhbHVlOiAncGhldGlvUHJpbnRBUEknLFxyXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgdGV4dDogJ1ByaW50IHRoZSBBUEkgdG8gdGhlIGNvbnNvbGUnXHJcbiAgICB9XHJcbiAgXSApO1xyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbG9jYWwtc3RvcmFnZSBrZXkgdGhhdCBoYXMgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiBpbmNsdWRlZCwgdG8gcHJldmVudCBjb2xsaXNpb24gd2l0aCBvdGhlciBhcHBsaWNhdGlvbnMgKG9yIGluIHRoZSBmdXR1cmUsIHByZXZpb3VzXHJcbiAgICogdmVyc2lvbnMgb2YgcGhldG1hcmtzKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBmdW5jdGlvbiBzdG9yYWdlS2V5KCBrZXkgKSB7XHJcbiAgICByZXR1cm4gYHBoZXRtYXJrcy0ke2tleX1gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnJvbSB0aGUgd3JhcHBlciBwYXRoIGluIHBlcmVubmlhbC1hbGlhcy9kYXRhL3dyYXBwZXJzLCBnZXQgdGhlIG5hbWUgb2YgdGhlIHdyYXBwZXIuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHdyYXBwZXJcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIHRoZSBuYW1lIG9mIHRoZSB3cmFwcGVyXHJcbiAgICovXHJcbiAgY29uc3QgZ2V0V3JhcHBlck5hbWUgPSBmdW5jdGlvbiggd3JhcHBlciApIHtcclxuXHJcbiAgICAvLyBJZiB0aGUgd3JhcHBlciBoYXMgaXRzIG93biBpbmRpdmlkdWFsIHJlcG8sIHRoZW4gZ2V0IHRoZSBuYW1lICdjbGFzc3Jvb20tYWN0aXZpdHknIGZyb20gJ3BoZXQtaW8td3JhcHBlci1jbGFzc3Jvb20tYWN0aXZpdHknXHJcbiAgICAvLyBNYWludGFpbiBjb21wYXRpYmlsaXR5IGZvciB3cmFwcGVycyBpbiAncGhldC1pby13cmFwcGVycy0nXHJcbiAgICBjb25zdCB3cmFwcGVyUGFydHMgPSB3cmFwcGVyLnNwbGl0KCAncGhldC1pby13cmFwcGVyLScgKTtcclxuICAgIGNvbnN0IHdyYXBwZXJOYW1lID0gd3JhcHBlclBhcnRzLmxlbmd0aCA9PT0gMSA/IHdyYXBwZXJQYXJ0c1sgMCBdIDogd3JhcHBlclBhcnRzWyAxIF07XHJcblxyXG4gICAgLy8gSWYgdGhlIHdyYXBwZXIgc3RpbGwgaGFzIHNsYXNoZXMgaW4gaXQsIHRoZW4gaXQgbG9va3MgbGlrZSAncGhldC1pby13cmFwcGVycy9hY3RpdmUnXHJcbiAgICBjb25zdCBzcGxpdE9uU2xhc2ggPSB3cmFwcGVyTmFtZS5zcGxpdCggJy8nICk7XHJcbiAgICByZXR1cm4gc3BsaXRPblNsYXNoWyBzcGxpdE9uU2xhc2gubGVuZ3RoIC0gMSBdO1xyXG4gIH07XHJcblxyXG4gIC8vIFRyYWNrIHdoZXRoZXIgJ3NoaWZ0JyBrZXkgaXMgcHJlc3NlZCwgc28gdGhhdCB3ZSBjYW4gY2hhbmdlIGhvdyB3aW5kb3dzIGFyZSBvcGVuZWQuICBJZiBzaGlmdCBpcyBwcmVzc2VkLCB0aGVcclxuICAvLyBwYWdlIGlzIGxhdW5jaGVkIGluIGEgc2VwYXJhdGUgdGFiLlxyXG4gIGxldCBzaGlmdFByZXNzZWQgPSBmYWxzZTtcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBldmVudCA9PiB7XHJcbiAgICBzaGlmdFByZXNzZWQgPSBldmVudC5zaGlmdEtleTtcclxuICB9ICk7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIGV2ZW50ID0+IHtcclxuICAgIHNoaWZ0UHJlc3NlZCA9IGV2ZW50LnNoaWZ0S2V5O1xyXG4gIH0gKTtcclxuXHJcbiAgZnVuY3Rpb24gb3BlblVSTCggdXJsICkge1xyXG4gICAgaWYgKCBzaGlmdFByZXNzZWQgKSB7XHJcbiAgICAgIHdpbmRvdy5vcGVuKCB1cmwsICdfYmxhbmsnICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgd2luZG93LmxvY2F0aW9uID0gdXJsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmlsbHMgb3V0IHRoZSBtb2RlRGF0YSBtYXAgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCByZXBvc2l0b3JpZXMsIG1vZGVzIGFuZCBxdWVyeSBwYXJhbWV0ZXJzLiBQYXJhbWV0ZXJzIGFyZSBsYXJnZWx5XHJcbiAgICogcmVwbyBsaXN0cyBmcm9tIHBlcmVubmlhbC1hbGlhcy9kYXRhIGZpbGVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gYWN0aXZlUnVubmFibGVzIC0gZnJvbSBhY3RpdmUtcnVubmFibGVzXHJcbiAgICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gYWN0aXZlUmVwb3MgLSBmcm9tIGFjdGl2ZS1yZXBvc1xyXG4gICAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBoZXRpb1NpbXMgLSBmcm9tIHBoZXQtaW9cclxuICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBpbnRlcmFjdGl2ZURlc2NyaXB0aW9uU2ltcyAtIGZyb20gaW50ZXJhY3RpdmUtZGVzY3JpcHRpb25cclxuICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSB3cmFwcGVycyAtIGZyb20gd3JhcHBlcnNcclxuICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSB1bml0VGVzdHNSZXBvcyAtIEhhcyB1bml0IHRlc3RzXHJcbiAgICogQHJldHVybnMge09iamVjdH0gLSBNYXBzIGZyb20ge3N0cmluZ30gcmVwb3NpdG9yeSBuYW1lID0+IHtNb2RlfVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHBvcHVsYXRlKCBhY3RpdmVSdW5uYWJsZXMsIGFjdGl2ZVJlcG9zLCBwaGV0aW9TaW1zLCBpbnRlcmFjdGl2ZURlc2NyaXB0aW9uU2ltcywgd3JhcHBlcnMsIHVuaXRUZXN0c1JlcG9zICkge1xyXG4gICAgY29uc3QgbW9kZURhdGEgPSB7fTtcclxuXHJcbiAgICBhY3RpdmVSZXBvcy5mb3JFYWNoKCByZXBvID0+IHtcclxuICAgICAgY29uc3QgbW9kZXMgPSBbXTtcclxuICAgICAgbW9kZURhdGFbIHJlcG8gXSA9IG1vZGVzO1xyXG5cclxuICAgICAgY29uc3QgaXNQaGV0aW8gPSBfLmluY2x1ZGVzKCBwaGV0aW9TaW1zLCByZXBvICk7XHJcbiAgICAgIGNvbnN0IGhhc1VuaXRUZXN0cyA9IF8uaW5jbHVkZXMoIHVuaXRUZXN0c1JlcG9zLCByZXBvICk7XHJcbiAgICAgIGNvbnN0IGlzUnVubmFibGUgPSBfLmluY2x1ZGVzKCBhY3RpdmVSdW5uYWJsZXMsIHJlcG8gKTtcclxuICAgICAgY29uc3Qgc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uID0gXy5pbmNsdWRlcyggaW50ZXJhY3RpdmVEZXNjcmlwdGlvblNpbXMsIHJlcG8gKTtcclxuXHJcbiAgICAgIGlmICggaXNSdW5uYWJsZSApIHtcclxuICAgICAgICBtb2Rlcy5wdXNoKCB7XHJcbiAgICAgICAgICBuYW1lOiAncmVxdWlyZWpzJyxcclxuICAgICAgICAgIHRleHQ6ICdVbmJ1aWx0JyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyB0aGUgc2ltdWxhdGlvbiBmcm9tIHRoZSB0b3AtbGV2ZWwgZGV2ZWxvcG1lbnQgSFRNTCBpbiB1bmJ1aWx0IG1vZGUnLFxyXG4gICAgICAgICAgdXJsOiBgLi4vJHtyZXBvfS8ke3JlcG99X2VuLmh0bWxgLFxyXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBkZXZTaW1RdWVyeVBhcmFtZXRlcnMuY29uY2F0KCBzaW1RdWVyeVBhcmFtZXRlcnMgKVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBtb2Rlcy5wdXNoKCB7XHJcbiAgICAgICAgICBuYW1lOiAnY29tcGlsZWQnLFxyXG4gICAgICAgICAgdGV4dDogJ0NvbXBpbGVkJyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyB0aGUgRW5nbGlzaCBzaW11bGF0aW9uIGZyb20gdGhlIGJ1aWxkL3BoZXQvIGRpcmVjdG9yeSAoYnVpbHQgZnJvbSBjaGlwcGVyKScsXHJcbiAgICAgICAgICB1cmw6IGAuLi8ke3JlcG99L2J1aWxkL3BoZXQvJHtyZXBvfV9lbl9waGV0Lmh0bWxgLFxyXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBzaW1RdWVyeVBhcmFtZXRlcnNcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ2NvbXBpbGVkWEhUTUwnLFxyXG4gICAgICAgICAgdGV4dDogJ0NvbXBpbGVkIFhIVE1MJyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyB0aGUgRW5nbGlzaCBzaW11bGF0aW9uIGZyb20gdGhlIGJ1aWxkL3BoZXQveGh0bWwgZGlyZWN0b3J5IChidWlsdCBmcm9tIGNoaXBwZXIpJyxcclxuICAgICAgICAgIHVybDogYC4uLyR7cmVwb30vYnVpbGQvcGhldC94aHRtbC8ke3JlcG99X2FsbC54aHRtbGAsXHJcbiAgICAgICAgICBxdWVyeVBhcmFtZXRlcnM6IHNpbVF1ZXJ5UGFyYW1ldGVyc1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBtb2Rlcy5wdXNoKCB7XHJcbiAgICAgICAgICBuYW1lOiAncHJvZHVjdGlvbicsXHJcbiAgICAgICAgICB0ZXh0OiAnUHJvZHVjdGlvbicsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1J1bnMgdGhlIGxhdGVzdCBFbmdsaXNoIHNpbXVsYXRpb24gZnJvbSB0aGUgcHJvZHVjdGlvbiBzZXJ2ZXInLFxyXG4gICAgICAgICAgdXJsOiBgaHR0cHM6Ly9waGV0LmNvbG9yYWRvLmVkdS9zaW1zL2h0bWwvJHtyZXBvfS9sYXRlc3QvJHtyZXBvfV9hbGwuaHRtbGAsXHJcbiAgICAgICAgICBxdWVyeVBhcmFtZXRlcnM6IHNpbVF1ZXJ5UGFyYW1ldGVyc1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBtb2Rlcy5wdXNoKCB7XHJcbiAgICAgICAgICBuYW1lOiAnc3BvdCcsXHJcbiAgICAgICAgICB0ZXh0OiAnRGV2IChzcG90KScsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0xvYWRzIHRoZSBsb2NhdGlvbiBvbiBwaGV0LWRldi5jb2xvcmFkby5lZHUgd2l0aCB2ZXJzaW9ucyBmb3IgZWFjaCBkZXYgZGVwbG95JyxcclxuICAgICAgICAgIHVybDogYGh0dHBzOi8vcGhldC1kZXYuY29sb3JhZG8uZWR1L2h0bWwvJHtyZXBvfWBcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENvbG9yIHBpY2tlciBVSVxyXG4gICAgICBpZiAoIGlzUnVubmFibGUgKSB7XHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ2NvbG9ycycsXHJcbiAgICAgICAgICB0ZXh0OiAnQ29sb3IgRWRpdG9yJyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyB0aGUgdG9wLWxldmVsIC1jb2xvcnMuaHRtbCBmaWxlIChhbGxvd3MgZWRpdGluZy92aWV3aW5nIGRpZmZlcmVudCBwcm9maWxlIGNvbG9ycyknLFxyXG4gICAgICAgICAgdXJsOiBgY29sb3ItZWRpdG9yLmh0bWw/c2ltPSR7cmVwb30mYnJhbmQ9cGhldGBcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggcmVwbyA9PT0gJ3NjZW5lcnknICkge1xyXG4gICAgICAgIG1vZGVzLnB1c2goIHtcclxuICAgICAgICAgIG5hbWU6ICdpbnNwZWN0b3InLFxyXG4gICAgICAgICAgdGV4dDogJ0luc3BlY3RvcicsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc3BsYXlzIHNhdmVkIFNjZW5lcnkgc25hcHNob3RzJyxcclxuICAgICAgICAgIHVybDogYC4uLyR7cmVwb30vdGVzdHMvaW5zcGVjdG9yLmh0bWxgXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIGhhc1VuaXRUZXN0cyApIHtcclxuICAgICAgICBtb2Rlcy5wdXNoKCB7XHJcbiAgICAgICAgICBuYW1lOiAndW5pdFRlc3RzUmVxdWlyZWpzJyxcclxuICAgICAgICAgIHRleHQ6ICdVbml0IFRlc3RzICh1bmJ1aWx0KScsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1J1bnMgdW5pdCB0ZXN0cyBpbiB1bmJ1aWx0IG1vZGUnLFxyXG4gICAgICAgICAgdXJsOiBgLi4vJHtyZXBvfS8ke3JlcG99LXRlc3RzLmh0bWxgLFxyXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBbXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICdlYScsIHRleHQ6ICdBc3NlcnRpb25zJywgZGVmYXVsdDogdHJ1ZSB9LFxyXG4gICAgICAgICAgICAuLi4oIHJlcG8gPT09ICdwaGV0LWlvLXdyYXBwZXJzJyA/IFsgeyB2YWx1ZTogJ3NpbT1ncmF2aXR5LWFuZC1vcmJpdHMnLCB0ZXh0OiAnYWRkU2ltJywgZGVmYXVsdDogdHJ1ZSB9IF0gOiBbXSApXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggcmVwbyA9PT0gJ3NjZW5lcnknIHx8IHJlcG8gPT09ICdraXRlJyB8fCByZXBvID09PSAnZG90JyB8fCByZXBvID09PSAncGhldC1pbycgKSB7XHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ2RvY3VtZW50YXRpb24nLFxyXG4gICAgICAgICAgdGV4dDogJ0RvY3VtZW50YXRpb24nLFxyXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdCcm93c2UgSFRNTCBkb2N1bWVudGF0aW9uJyxcclxuICAgICAgICAgIHVybDogYC4uLyR7cmVwb30vZG9jL2BcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCByZXBvID09PSAnc2NlbmVyeScgKSB7XHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ2xheW91dC1kb2N1bWVudGF0aW9uJyxcclxuICAgICAgICAgIHRleHQ6ICdMYXlvdXQgRG9jdW1lbnRhdGlvbicsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Jyb3dzZSBIVE1MIGxheW91dCBkb2N1bWVudGF0aW9uJyxcclxuICAgICAgICAgIHVybDogYC4uLyR7cmVwb30vZG9jL2xheW91dC5odG1sYFxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHJlcG8gPT09ICdzY2VuZXJ5JyB8fCByZXBvID09PSAna2l0ZScgfHwgcmVwbyA9PT0gJ2RvdCcgKSB7XHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ2V4YW1wbGVzJyxcclxuICAgICAgICAgIHRleHQ6ICdFeGFtcGxlcycsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Jyb3dzZSBFeGFtcGxlcycsXHJcbiAgICAgICAgICB1cmw6IGAuLi8ke3JlcG99L2V4YW1wbGVzL2BcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCByZXBvID09PSAnc2NlbmVyeScgfHwgcmVwbyA9PT0gJ2tpdGUnIHx8IHJlcG8gPT09ICdkb3QnIHx8IHJlcG8gPT09ICdwaGV0LWNvcmUnICkge1xyXG4gICAgICAgIG1vZGVzLnB1c2goIHtcclxuICAgICAgICAgIG5hbWU6ICdwbGF5Z3JvdW5kJyxcclxuICAgICAgICAgIHRleHQ6ICdQbGF5Z3JvdW5kJyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBgTG9hZHMgJHtyZXBvfSBhbmQgZGVwZW5kZW5jaWVzIGluIHRoZSB0YWIsIGFuZCBhbGxvd3MgcXVpY2sgdGVzdGluZ2AsXHJcbiAgICAgICAgICB1cmw6IGAuLi8ke3JlcG99L3Rlc3RzL3BsYXlncm91bmQuaHRtbGBcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCByZXBvID09PSAnc2NlbmVyeScgKSB7XHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ3NhbmRib3gnLFxyXG4gICAgICAgICAgdGV4dDogJ1NhbmRib3gnLFxyXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdBbGxvd3MgcXVpY2sgdGVzdGluZyBvZiBTY2VuZXJ5IGZlYXR1cmVzJyxcclxuICAgICAgICAgIHVybDogYC4uLyR7cmVwb30vdGVzdHMvc2FuZGJveC5odG1sYFxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHJlcG8gPT09ICdjaGlwcGVyJyB8fCByZXBvID09PSAnYXF1YScgKSB7XHJcbiAgICAgICAgY29uc3QgZ2VuZXJhbFRlc3RQYXJhbXMgPSAnZWEmYXVkaW89ZGlzYWJsZWQmdGVzdER1cmF0aW9uPTEwMDAwJnRlc3RDb25jdXJyZW50QnVpbGRzPTQnO1xyXG4gICAgICAgIGNvbnN0IGZ1enpUZXN0UGFyYW1ldGVyID0gWyB7XHJcbiAgICAgICAgICB2YWx1ZTogYCR7Z2VuZXJhbFRlc3RQYXJhbXN9JmJyYW5kPXBoZXQmZnV6emAsXHJcbiAgICAgICAgICB0ZXh0OiAnVGVzdCBQaEVUIHNpbXMnLFxyXG4gICAgICAgICAgZGVmYXVsdDogdHJ1ZVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgIHZhbHVlOiAncmFuZG9taXplJyxcclxuICAgICAgICAgIHRleHQ6ICdSYW5kb21pemUgc2ltIGxpc3QnXHJcbiAgICAgICAgfSBdO1xyXG5cclxuICAgICAgICBtb2Rlcy5wdXNoKCB7XHJcbiAgICAgICAgICBuYW1lOiAndGVzdC1waGV0LXNpbXMnLFxyXG4gICAgICAgICAgdGV4dDogJ0Z1enogVGVzdCBQaEVUIFNpbXMgKEZhc3QgQnVpbGQpJyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyBhdXRvbWF0ZWQgdGVzdGluZyB3aXRoIGZ1enppbmcsIDEwIHNlY29uZCB0aW1lciwgYW5kIDQgY29uY3VycmVudCBidWlsZHMnLFxyXG4gICAgICAgICAgdXJsOiAnLi4vYXF1YS90ZXN0LXNlcnZlci90ZXN0LXNpbXMuaHRtbCcsXHJcbiAgICAgICAgICBxdWVyeVBhcmFtZXRlcnM6IGZ1enpUZXN0UGFyYW1ldGVyXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIG1vZGVzLnB1c2goIHtcclxuICAgICAgICAgIG5hbWU6ICd0ZXN0LXBoZXQtaW8tc2ltcycsXHJcbiAgICAgICAgICB0ZXh0OiAnRnV6eiBUZXN0IFBoRVQtaU8gU2ltcyAoRmFzdCBCdWlsZCknLFxyXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdSdW5zIGF1dG9tYXRlZCB0ZXN0aW5nIHdpdGggZnV6emluZywgMTAgc2Vjb25kIHRpbWVyLCBhbmQgNCBjb25jdXJyZW50IGJ1aWxkcycsXHJcbiAgICAgICAgICB1cmw6ICcuLi9hcXVhL3Rlc3Qtc2VydmVyL3Rlc3Qtc2ltcy5odG1sJyxcclxuICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVyczogWyB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBgJHtnZW5lcmFsVGVzdFBhcmFtc30mYnJhbmQ9cGhldC1pbyZmdXp6JnBoZXRpb1N0YW5kYWxvbmUmdGVzdFNpbXM9JHtwaGV0aW9TaW1zLmpvaW4oICcsJyApfWAsXHJcbiAgICAgICAgICAgIHRleHQ6ICdGdXp6IFRlc3QgUGhFVC1JTyBzaW1zJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxyXG4gICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICB2YWx1ZTogJ3JhbmRvbWl6ZScsXHJcbiAgICAgICAgICAgIHRleHQ6ICdSYW5kb21pemUgc2ltIGxpc3QnXHJcbiAgICAgICAgICB9IF1cclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ3Rlc3QtaW50ZXJhY3RpdmUtZGVzY3JpcHRpb24tc2ltcycsXHJcbiAgICAgICAgICB0ZXh0OiAnRnV6eiBUZXN0IEludGVyYWN0aXZlIERlc2NyaXB0aW9uIFNpbXMgKEZhc3QgQnVpbGQpJyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyBhdXRvbWF0ZWQgdGVzdGluZyB3aXRoIGZ1enppbmcsIDEwIHNlY29uZCB0aW1lciwgYW5kIDQgY29uY3VycmVudCBidWlsZHMnLFxyXG4gICAgICAgICAgdXJsOiAnLi4vYXF1YS90ZXN0LXNlcnZlci90ZXN0LXNpbXMuaHRtbCcsXHJcbiAgICAgICAgICBxdWVyeVBhcmFtZXRlcnM6IFsge1xyXG4gICAgICAgICAgICB2YWx1ZTogYCR7Z2VuZXJhbFRlc3RQYXJhbXN9JmJyYW5kPXBoZXQmZnV6ekJvYXJkJnN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbj10cnVlYCxcclxuICAgICAgICAgICAgdGV4dDogJ0tleWJvYXJkIEZ1enogVGVzdCBzaW1zJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxyXG4gICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICB2YWx1ZTogYCR7Z2VuZXJhbFRlc3RQYXJhbXN9JmJyYW5kPXBoZXQmZnV6eiZzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb249dHJ1ZWAsXHJcbiAgICAgICAgICAgIHRleHQ6ICdOb3JtYWwgRnV6eiBUZXN0IHNpbXMnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICB2YWx1ZTogYHRlc3RTaW1zPSR7aW50ZXJhY3RpdmVEZXNjcmlwdGlvblNpbXMuam9pbiggJywnICl9YCxcclxuICAgICAgICAgICAgdGV4dDogJ1Rlc3Qgb25seSBBMTF5IHNpbXMnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlXHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAncmFuZG9taXplJyxcclxuICAgICAgICAgICAgdGV4dDogJ1JhbmRvbWl6ZSBzaW0gbGlzdCdcclxuICAgICAgICAgIH0gXVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBtb2Rlcy5wdXNoKCB7XHJcbiAgICAgICAgICBuYW1lOiAndGVzdC1zaW1zLWxvYWQtb25seScsXHJcbiAgICAgICAgICB0ZXh0OiAnVGVzdCBTaW1zIChMb2FkIE9ubHkpJyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyBhdXRvbWF0ZWQgdGVzdGluZyB0aGF0IGp1c3QgbG9hZHMgc2ltcyAod2l0aG91dCBmdXp6aW5nIG9yIGJ1aWxkaW5nKScsXHJcbiAgICAgICAgICB1cmw6ICcuLi9hcXVhL3Rlc3Qtc2VydmVyL3Rlc3Qtc2ltcy5odG1sJyxcclxuICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVyczogWyB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAnZWEmYnJhbmQ9cGhldCZhdWRpbz1kaXNhYmxlZCZ0ZXN0VGFzaz1mYWxzZSZ0ZXN0QnVpbHQ9ZmFsc2UnLFxyXG4gICAgICAgICAgICB0ZXh0OiAnVGVzdCBTaW1zIChMb2FkIE9ubHkpJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxyXG4gICAgICAgICAgfSBdXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIG1vZGVzLnB1c2goIHtcclxuICAgICAgICAgIG5hbWU6ICdjb250aW51b3VzLXRlc3RpbmcnLFxyXG4gICAgICAgICAgdGV4dDogJ0NvbnRpbnVvdXMgVGVzdGluZycsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0xpbmsgdG8gdGhlIGNvbnRpbnVvdXMgdGVzdGluZyBvbiBCYXllcy4nLFxyXG4gICAgICAgICAgdXJsOiAnaHR0cHM6Ly9iYXllcy5jb2xvcmFkby5lZHUvY29udGludW91cy10ZXN0aW5nL2FxdWEvaHRtbC9jb250aW51b3VzLXJlcG9ydC5odG1sJ1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBtb2Rlcy5wdXNoKCB7XHJcbiAgICAgICAgICBuYW1lOiAnc25hcHNob3QtY29tcGFyaXNvbicsXHJcbiAgICAgICAgICB0ZXh0OiAnU25hcHNob3QgQ29tcGFyaXNvbicsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NldHMgdXAgc25hcHNob3Qgc2NyZWVuc2hvdCBjb21wYXJpc29uIHRoYXQgY2FuIGJlIHJ1biBvbiBkaWZmZXJlbnQgU0hBcycsXHJcbiAgICAgICAgICB1cmw6ICcuLi9hcXVhL2h0bWwvc25hcHNob3QtY29tcGFyaXNvbi5odG1sJ1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBtb2Rlcy5wdXNoKCB7XHJcbiAgICAgICAgICBuYW1lOiAnbXVsdGktc25hcHNob3QtY29tcGFyaXNvbicsXHJcbiAgICAgICAgICB0ZXh0OiAnTXVsdGktc25hcHNob3QgQ29tcGFyaXNvbicsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NldHMgdXAgc25hcHNob3Qgc2NyZWVuc2hvdCBjb21wYXJpc29uIGZvciB0d28gZGlmZmVyZW50IGNoZWNrb3V0cycsXHJcbiAgICAgICAgICB1cmw6ICcuLi9hcXVhL2h0bWwvbXVsdGktc25hcHNob3QtY29tcGFyaXNvbi5odG1sJ1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHJlcG8gPT09ICd5b3R0YScgKSB7XHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ3lvdHRhLXN0YXRpc3RpY3MnLFxyXG4gICAgICAgICAgdGV4dDogJ1N0YXRpc3RpY3MgcGFnZScsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0dvZXMgdG8gdGhlIHlvdHRhIHJlcG9ydCBwYWdlLCBjcmVkZW50aWFscyBpbiB0aGUgR29vZ2xlIERvYycsXHJcbiAgICAgICAgICB1cmw6ICdodHRwczovL2JheWVzLmNvbG9yYWRvLmVkdS9zdGF0aXN0aWNzL3lvdHRhLydcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCByZXBvID09PSAnc2tpZmZsZScgKSB7XHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ3NvdW5kLWJvYXJkJyxcclxuICAgICAgICAgIHRleHQ6ICdTb3VuZCBCb2FyZCcsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0ludGVyYWN0aXZlIEhUTUwgcGFnZSBmb3IgZXhwbG9yaW5nIGV4aXN0aW5nIHNvdW5kcyBpbiBzaW1zIGFuZCBjb21tb24gY29kZScsXHJcbiAgICAgICAgICB1cmw6ICcuLi9za2lmZmxlL2h0bWwvc291bmQtYm9hcmQuaHRtbCdcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCByZXBvID09PSAncXVha2UnICkge1xyXG4gICAgICAgIG1vZGVzLnB1c2goIHtcclxuICAgICAgICAgIG5hbWU6ICdxdWFrZS1idWlsdCcsXHJcbiAgICAgICAgICB0ZXh0OiAnSGFwdGljcyBQbGF5Z3JvdW5kIChidWlsdCBmb3IgYnJvd3NlciknLFxyXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdCdWlsdCBicm93c2VyIHZlcnNpb24gb2YgdGhlIEhhcHRpY3MgUGxheWdyb3VuZCBhcHAnLFxyXG4gICAgICAgICAgdXJsOiAnLi4vcXVha2UvcGxhdGZvcm1zL2Jyb3dzZXIvd3d3L2hhcHRpY3MtcGxheWdyb3VuZC5odG1sJ1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb24gKSB7XHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ2ExMXktdmlldycsXHJcbiAgICAgICAgICB0ZXh0OiAnQTExeSBWaWV3JyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyB0aGUgc2ltdWxhdGlvbiBpbiBhbiBpZnJhbWUgbmV4dCB0byBhIGNvcHkgb2YgdGhlIFBET00gdG90IGVhc2lseSBpbnNwZWN0IGFjY2Vzc2libGUgY29udGVudC4nLFxyXG4gICAgICAgICAgdXJsOiBgLi4vJHtyZXBvfS8ke3JlcG99X2ExMXlfdmlldy5odG1sYCxcclxuICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVyczogZGV2U2ltUXVlcnlQYXJhbWV0ZXJzLmNvbmNhdCggc2ltUXVlcnlQYXJhbWV0ZXJzIClcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggcmVwbyA9PT0gJ2ludGVyYWN0aW9uLWRhc2hib2FyZCcgKSB7XHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ3ByZXByb2Nlc3NvcicsXHJcbiAgICAgICAgICB0ZXh0OiAnUHJlcHJvY2Vzc29yJyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTG9hZCB0aGUgcHJlcHJvY2Vzc29yIGZvciBwYXJzaW5nIGRhdGEgbG9ncyBkb3duIHRvIGEgc2l6ZSB0aGF0IGNhbiBiZSB1c2VkIGJ5IHRoZSBzaW11bGF0aW9uLicsXHJcbiAgICAgICAgICB1cmw6IGAuLi8ke3JlcG99L3ByZXByb2Nlc3Nvci5odG1sYCxcclxuICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVyczogWyB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAnZWEnLFxyXG4gICAgICAgICAgICB0ZXh0OiAnRW5hYmxlIEFzc2VydGlvbnMnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlXHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAncGFyc2VYPTEwJyxcclxuICAgICAgICAgICAgdGV4dDogJ1Rlc3Qgb25seSAxMCBzZXNzaW9ucycsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAnZm9yU3ByZWFkc2hlZXQnLFxyXG4gICAgICAgICAgICB0ZXh0OiAnQ3JlYXRlIG91dHB1dCBmb3IgYSBzcHJlYWRzaGVldC4nLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICAgICAgfSBdXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBtb2Rlcy5wdXNoKCB7XHJcbiAgICAgICAgbmFtZTogJ2dpdGh1YicsXHJcbiAgICAgICAgdGV4dDogJ0dpdEh1YicsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdPcGVucyB0byB0aGUgcmVwb3NpdG9yeVxcJ3MgR2l0SHViIG1haW4gcGFnZScsXHJcbiAgICAgICAgdXJsOiBgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zLyR7cmVwb31gXHJcbiAgICAgIH0gKTtcclxuICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgIG5hbWU6ICdpc3N1ZXMnLFxyXG4gICAgICAgIHRleHQ6ICdJc3N1ZXMnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnT3BlbnMgdG8gdGhlIHJlcG9zaXRvcnlcXCdzIEdpdEh1YiBpc3N1ZXMgcGFnZScsXHJcbiAgICAgICAgdXJsOiBgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zLyR7cmVwb30vaXNzdWVzYFxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBpZiBhIHBoZXQtaW8gc2ltLCB0aGVuIGFkZCB0aGUgd3JhcHBlcnMgdG8gdGhlbVxyXG4gICAgICBpZiAoIGlzUGhldGlvICkge1xyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIGNvbnNvbGUgbG9nZ2luZywgbm90IGEgd3JhcHBlciBidXQgbmljZSB0byBoYXZlXHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ29uZS1zaW0td3JhcHBlci10ZXN0cycsXHJcbiAgICAgICAgICB0ZXh0OiAnV3JhcHBlciBVbml0IFRlc3RzJyxcclxuICAgICAgICAgIGdyb3VwOiAnUGhFVC1pTycsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1Rlc3QgdGhlIFBoRVQtaU8gQVBJIGZvciB0aGlzIHNpbS4nLFxyXG4gICAgICAgICAgdXJsOiBgLi4vcGhldC1pby13cmFwcGVycy9waGV0LWlvLXdyYXBwZXJzLXRlc3RzLmh0bWw/c2ltPSR7cmVwb31gLFxyXG4gICAgICAgICAgcXVlcnlQYXJhbWV0ZXJzOiBwaGV0aW9XcmFwcGVyUXVlcnlQYXJhbWV0ZXJzXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAvLyBBZGQgYSBsaW5rIHRvIHRoZSBjb21waWxlZCB3cmFwcGVyIGluZGV4O1xyXG4gICAgICAgIG1vZGVzLnB1c2goIHtcclxuICAgICAgICAgIG5hbWU6ICdjb21waWxlZC1pbmRleCcsXHJcbiAgICAgICAgICB0ZXh0OiAnQ29tcGlsZWQgSW5kZXgnLFxyXG4gICAgICAgICAgZ3JvdXA6ICdQaEVULWlPJyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyB0aGUgUGhFVC1pTyB3cmFwcGVyIGluZGV4IGZyb20gYnVpbGQvIGRpcmVjdG9yeSAoYnVpbHQgZnJvbSBjaGlwcGVyKScsXHJcbiAgICAgICAgICB1cmw6IGAuLi8ke3JlcG99L2J1aWxkL3BoZXQtaW8vYCxcclxuICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVyczogcGhldGlvV3JhcHBlclF1ZXJ5UGFyYW1ldGVyc1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ3N0YW5kYWxvbmUnLFxyXG4gICAgICAgICAgdGV4dDogJ1N0YW5kYWxvbmUnLFxyXG4gICAgICAgICAgZ3JvdXA6ICdQaEVULWlPJyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyB0aGUgc2ltIGluIHBoZXQtaW8gYnJhbmQgd2l0aCB0aGUgc3RhbmRhbG9uZSBxdWVyeSBwYXJhbWV0ZXInLFxyXG4gICAgICAgICAgdXJsOiBgLi4vJHtyZXBvfS8ke3JlcG99X2VuLmh0bWw/YnJhbmQ9cGhldC1pbyZwaGV0aW9TdGFuZGFsb25lYCxcclxuICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVyczogcGhldGlvU2ltUXVlcnlQYXJhbWV0ZXJzLmNvbmNhdCggc2ltUXVlcnlQYXJhbWV0ZXJzIClcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIHBoZXQtaW8gd3JhcHBlcnNcclxuICAgICAgICB3cmFwcGVycy5jb25jYXQoIG5vblB1Ymxpc2hlZFBoZXRpb1dyYXBwZXJzVG9BZGRUb1BoZXRtYXJrcyApLnNvcnQoKS5mb3JFYWNoKCB3cmFwcGVyID0+IHtcclxuXHJcbiAgICAgICAgICBjb25zdCB3cmFwcGVyTmFtZSA9IGdldFdyYXBwZXJOYW1lKCB3cmFwcGVyICk7XHJcblxyXG4gICAgICAgICAgbGV0IHVybCA9ICcnO1xyXG5cclxuICAgICAgICAgIC8vIFByb2Nlc3MgZm9yIGRlZGljYXRlZCB3cmFwcGVyIHJlcG9zXHJcbiAgICAgICAgICBpZiAoIHdyYXBwZXIuaW5kZXhPZiggJ3BoZXQtaW8td3JhcHBlci0nICkgPT09IDAgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBTcGVjaWFsIHVzZSBjYXNlIGZvciB0aGUgc29uaWZpY2F0aW9uIHdyYXBwZXJcclxuICAgICAgICAgICAgdXJsID0gd3JhcHBlck5hbWUgPT09ICdzb25pZmljYXRpb24nID8gYC4uL3BoZXQtaW8td3JhcHBlci0ke3dyYXBwZXJOYW1lfS8ke3JlcG99LXNvbmlmaWNhdGlvbi5odG1sP3NpbT0ke3JlcG99YCA6XHJcbiAgICAgICAgICAgICAgICAgIGAuLi8ke3dyYXBwZXJ9Lz9zaW09JHtyZXBvfWA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBMb2FkIHRoZSB3cmFwcGVyIHVybHMgZm9yIHRoZSBwaGV0LWlvLXdyYXBwZXJzL1xyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHVybCA9IGAuLi8ke3dyYXBwZXJ9Lz9zaW09JHtyZXBvfWA7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gYWRkIHJlY29yZGluZyB0byB0aGUgY29uc29sZSBieSBkZWZhdWx0XHJcbiAgICAgICAgICBpZiAoIHdyYXBwZXIgPT09ICdwaGV0LWlvLXdyYXBwZXJzL3JlY29yZCcgKSB7XHJcbiAgICAgICAgICAgIHVybCArPSAnJmNvbnNvbGUnO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGxldCBxdWVyeVBhcmFtZXRlcnMgPSBbXTtcclxuICAgICAgICAgIGlmICggd3JhcHBlck5hbWUgPT09ICdzdHVkaW8nICkge1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc3R1ZGlvUXVlcnlQYXJhbWV0ZXJzID0gWyAuLi5waGV0aW9XcmFwcGVyUXVlcnlQYXJhbWV0ZXJzIF07XHJcblxyXG4gICAgICAgICAgICAvLyBTdHVkaW8gZGVmYXVsdHMgdG8gcGhldGlvRGVidWc9dHJ1ZSwgc28gdGhpcyBwYXJhbWV0ZXIgZG9lc24ndCBtYWtlIHNlbnNlXHJcbiAgICAgICAgICAgIF8ucmVtb3ZlKCBzdHVkaW9RdWVyeVBhcmFtZXRlcnMsIGl0ZW0gPT4gaXRlbSA9PT0gcGhldGlvRGVidWdUcnVlUGFyYW1ldGVyICk7XHJcblxyXG4gICAgICAgICAgICBxdWVyeVBhcmFtZXRlcnMgPSBzdHVkaW9RdWVyeVBhcmFtZXRlcnMuY29uY2F0KCBbIHtcclxuICAgICAgICAgICAgICB2YWx1ZTogJ3BoZXRpb0RlYnVnPWZhbHNlJyxcclxuICAgICAgICAgICAgICB0ZXh0OiAnRGlzYWJsZSBhc3NlcnRpb25zIGZvciB0aGUgc2ltIGluc2lkZSBTdHVkaW8uIFN0dWRpbyBkZWZhdWx0cyB0byBwaGV0aW9EZWJ1Zz10cnVlJyxcclxuICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6ICdwaGV0aW9FbGVtZW50c0Rpc3BsYXk9YWxsJyxcclxuICAgICAgICAgICAgICB0ZXh0OiAnU2hvdyBhbGwgZWxlbWVudHMnLFxyXG4gICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcclxuICAgICAgICAgICAgfSBdICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggd3JhcHBlck5hbWUgPT09ICdwbGF5YmFjaycgKSB7XHJcbiAgICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVycyA9IFtdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVycyA9IHBoZXRpb1dyYXBwZXJRdWVyeVBhcmFtZXRlcnM7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgICBuYW1lOiB3cmFwcGVyTmFtZSxcclxuICAgICAgICAgICAgdGV4dDogd3JhcHBlck5hbWUsXHJcbiAgICAgICAgICAgIGdyb3VwOiAnUGhFVC1pTycsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgUnVucyB0aGUgcGhldC1pbyB3cmFwcGVyICR7d3JhcHBlck5hbWV9YCxcclxuICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVyczogcXVlcnlQYXJhbWV0ZXJzXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIGNvbnNvbGUgbG9nZ2luZywgbm90IGEgd3JhcHBlciBidXQgbmljZSB0byBoYXZlXHJcbiAgICAgICAgbW9kZXMucHVzaCgge1xyXG4gICAgICAgICAgbmFtZTogJ2NvbG9yaXplZCcsXHJcbiAgICAgICAgICB0ZXh0OiAnRGF0YTogY29sb3JpemVkJyxcclxuICAgICAgICAgIGdyb3VwOiAnUGhFVC1pTycsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1Nob3cgdGhlIGNvbG9yaXplZCBldmVudCBsb2cgaW4gdGhlIGNvbnNvbGUgb2YgdGhlIHN0YW5kIGFsb25lIHNpbS4nLFxyXG4gICAgICAgICAgdXJsOiBgLi4vJHtyZXBvfS8ke3JlcG99X2VuLmh0bWw/YnJhbmQ9cGhldC1pbyZwaGV0aW9Db25zb2xlTG9nPWNvbG9yaXplZCZwaGV0aW9TdGFuZGFsb25lJnBoZXRpb0VtaXRIaWdoRnJlcXVlbmN5RXZlbnRzPWZhbHNlYCxcclxuICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVyczogcGhldGlvU2ltUXVlcnlQYXJhbWV0ZXJzLmNvbmNhdCggc2ltUXVlcnlQYXJhbWV0ZXJzIClcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZURhdGE7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbGVhckNoaWxkcmVuKCBlbGVtZW50ICkge1xyXG4gICAgd2hpbGUgKCBlbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoICkgeyBlbGVtZW50LnJlbW92ZUNoaWxkKCBlbGVtZW50LmNoaWxkTm9kZXNbIDAgXSApOyB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSByZXBvc2l0b3JpZXMgLSBBbGwgcmVwb3NpdG9yeSBuYW1lc1xyXG4gICAqIEByZXR1cm5zIHsgZWxlbWVudDoge0hUTUxTZWxlY3RFbGVtZW50fSwgZ2V0IHZhbHVlKCk6IHtzdHJpbmd9IH1cclxuICAgKi9cclxuICBmdW5jdGlvbiBjcmVhdGVSZXBvc2l0b3J5U2VsZWN0b3IoIHJlcG9zaXRvcmllcyApIHtcclxuICAgIGNvbnN0IHNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzZWxlY3QnICk7XHJcbiAgICBzZWxlY3QuYXV0b2ZvY3VzID0gdHJ1ZTtcclxuICAgIHJlcG9zaXRvcmllcy5mb3JFYWNoKCByZXBvID0+IHtcclxuICAgICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ29wdGlvbicgKTtcclxuICAgICAgb3B0aW9uLnZhbHVlID0gb3B0aW9uLmxhYmVsID0gb3B0aW9uLmlubmVySFRNTCA9IHJlcG87XHJcbiAgICAgIHNlbGVjdC5hcHBlbmRDaGlsZCggb3B0aW9uICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSUUgb3Igbm8tc2Nyb2xsSW50b1ZpZXcgd2lsbCBuZWVkIHRvIGJlIGhlaWdodC1saW1pdGVkXHJcbiAgICBpZiAoIHNlbGVjdC5zY3JvbGxJbnRvVmlldyAmJiBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoICdUcmlkZW50LycgKSA8IDAgKSB7XHJcbiAgICAgIHNlbGVjdC5zZXRBdHRyaWJ1dGUoICdzaXplJywgcmVwb3NpdG9yaWVzLmxlbmd0aCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHNlbGVjdC5zZXRBdHRyaWJ1dGUoICdzaXplJywgJzMwJyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNlbGVjdCBhIHJlcG9zaXRvcnkgaWYgaXQncyBiZWVuIHN0b3JlZCBpbiBsb2NhbFN0b3JhZ2UgYmVmb3JlXHJcbiAgICBjb25zdCByZXBvS2V5ID0gc3RvcmFnZUtleSggJ3JlcG8nICk7XHJcbiAgICBpZiAoIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCByZXBvS2V5ICkgKSB7XHJcbiAgICAgIHNlbGVjdC52YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCByZXBvS2V5ICk7XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0LmZvY3VzKCk7XHJcblxyXG4gICAgLy8gU2Nyb2xsIHRvIHRoZSBzZWxlY3RlZCBlbGVtZW50XHJcbiAgICBmdW5jdGlvbiB0cnlTY3JvbGwoKSB7XHJcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBzZWxlY3QuY2hpbGROb2Rlc1sgc2VsZWN0LnNlbGVjdGVkSW5kZXggXTtcclxuICAgICAgaWYgKCBlbGVtZW50LnNjcm9sbEludG9WaWV3SWZOZWVkZWQgKSB7XHJcbiAgICAgICAgZWxlbWVudC5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGVsZW1lbnQuc2Nyb2xsSW50b1ZpZXcgKSB7XHJcbiAgICAgICAgZWxlbWVudC5zY3JvbGxJbnRvVmlldygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCB0cnlTY3JvbGwgKTtcclxuICAgIC8vIFdlIG5lZWQgdG8gd2FpdCBmb3IgdGhpbmdzIHRvIGxvYWQgZnVsbHkgYmVmb3JlIHNjcm9sbGluZyAoaW4gQ2hyb21lKS5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldG1hcmtzL2lzc3Vlcy8xM1xyXG4gICAgc2V0VGltZW91dCggdHJ5U2Nyb2xsLCAwICk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZWxlbWVudDogc2VsZWN0LFxyXG4gICAgICBnZXQgdmFsdWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHNlbGVjdC5jaGlsZE5vZGVzWyBzZWxlY3Quc2VsZWN0ZWRJbmRleCBdLnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVEYXRhIC0gTWFwcyBmcm9tIHtzdHJpbmd9IHJlcG9zaXRvcnkgbmFtZSA9PiB7TW9kZX1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVwb3NpdG9yeVNlbGVjdG9yXHJcbiAgICogQHJldHVybnMgeyBlbGVtZW50OiB7SFRNTFNlbGVjdEVsZW1lbnR9LFxyXG4gICAqICAgICAgICAgICAgZ2V0IHZhbHVlKCk6IHtzdHJpbmd9LFxyXG4gICAqICAgICAgICAgICAgZ2V0IG1vZGUoKToge01vZGV9LFxyXG4gICAqICAgICAgICAgICAgdXBkYXRlOiBmdW5jdGlvbigpIH1cclxuICAgKi9cclxuICBmdW5jdGlvbiBjcmVhdGVNb2RlU2VsZWN0b3IoIG1vZGVEYXRhLCByZXBvc2l0b3J5U2VsZWN0b3IgKSB7XHJcbiAgICBjb25zdCBzZWxlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc2VsZWN0JyApO1xyXG5cclxuICAgIGNvbnN0IHNlbGVjdG9yID0ge1xyXG4gICAgICBlbGVtZW50OiBzZWxlY3QsXHJcbiAgICAgIGdldCB2YWx1ZSgpIHtcclxuICAgICAgICByZXR1cm4gc2VsZWN0LnZhbHVlO1xyXG4gICAgICB9LFxyXG4gICAgICBnZXQgbW9kZSgpIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50TW9kZU5hbWUgPSBzZWxlY3Rvci52YWx1ZTtcclxuICAgICAgICByZXR1cm4gXy5maWx0ZXIoIG1vZGVEYXRhWyByZXBvc2l0b3J5U2VsZWN0b3IudmFsdWUgXSwgbW9kZSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gbW9kZS5uYW1lID09PSBjdXJyZW50TW9kZU5hbWU7XHJcbiAgICAgICAgfSApWyAwIF07XHJcbiAgICAgIH0sXHJcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oIHN0b3JhZ2VLZXkoICdyZXBvJyApLCByZXBvc2l0b3J5U2VsZWN0b3IudmFsdWUgKTtcclxuXHJcbiAgICAgICAgY2xlYXJDaGlsZHJlbiggc2VsZWN0ICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGdyb3VwcyA9IHt9O1xyXG4gICAgICAgIG1vZGVEYXRhWyByZXBvc2l0b3J5U2VsZWN0b3IudmFsdWUgXS5mb3JFYWNoKCBjaG9pY2UgPT4ge1xyXG4gICAgICAgICAgY29uc3QgY2hvaWNlT3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ29wdGlvbicgKTtcclxuICAgICAgICAgIGNob2ljZU9wdGlvbi52YWx1ZSA9IGNob2ljZS5uYW1lO1xyXG4gICAgICAgICAgY2hvaWNlT3B0aW9uLmxhYmVsID0gY2hvaWNlLnRleHQ7XHJcbiAgICAgICAgICBjaG9pY2VPcHRpb24udGl0bGUgPSBjaG9pY2UuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICBjaG9pY2VPcHRpb24uaW5uZXJIVE1MID0gY2hvaWNlLnRleHQ7XHJcblxyXG4gICAgICAgICAgLy8gYWRkIHRvIGFuIGBvcHRncm91cGAgaW5zdGVhZCBvZiBoYXZpbmcgYWxsIG1vZGVzIG9uIHRoZSBgc2VsZWN0YFxyXG4gICAgICAgICAgY2hvaWNlLmdyb3VwID0gY2hvaWNlLmdyb3VwIHx8ICdHZW5lcmFsJztcclxuXHJcbiAgICAgICAgICAvLyBjcmVhdGUgaWYgdGhlIGdyb3VwIGRvZXNuJ3QgZXhpc3RcclxuICAgICAgICAgIGlmICggIWdyb3Vwc1sgY2hvaWNlLmdyb3VwIF0gKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9wdEdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ29wdGdyb3VwJyApO1xyXG4gICAgICAgICAgICBvcHRHcm91cC5sYWJlbCA9IGNob2ljZS5ncm91cDtcclxuICAgICAgICAgICAgZ3JvdXBzWyBjaG9pY2UuZ3JvdXAgXSA9IG9wdEdyb3VwO1xyXG4gICAgICAgICAgICBzZWxlY3QuYXBwZW5kQ2hpbGQoIG9wdEdyb3VwICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gYWRkIHRoZSBjaG9pY2UgdG8gdGhlIHByb3BlcnQgZ3JvdXBcclxuICAgICAgICAgIGdyb3Vwc1sgY2hvaWNlLmdyb3VwIF0uYXBwZW5kQ2hpbGQoIGNob2ljZU9wdGlvbiApO1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgc2VsZWN0LnNldEF0dHJpYnV0ZSggJ3NpemUnLCBtb2RlRGF0YVsgcmVwb3NpdG9yeVNlbGVjdG9yLnZhbHVlIF0ubGVuZ3RoICsgT2JqZWN0LmtleXMoIGdyb3VwcyApLmxlbmd0aCApO1xyXG4gICAgICAgIGlmICggc2VsZWN0LnNlbGVjdGVkSW5kZXggPCAwICkge1xyXG4gICAgICAgICAgc2VsZWN0LnNlbGVjdGVkSW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gc2VsZWN0b3I7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjcmVhdGVTY3JlZW5TZWxlY3RvcigpIHtcclxuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlU2NyZWVuUmFkaW9CdXR0b24oIG5hbWUsIHZhbHVlLCB0ZXh0ICkge1xyXG4gICAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdsYWJlbCcgKTtcclxuICAgICAgbGFiZWwuY2xhc3NOYW1lID0gJ3NjcmVlbkxhYmVsJztcclxuICAgICAgY29uc3QgcmFkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW5wdXQnICk7XHJcbiAgICAgIHJhZGlvLnR5cGUgPSAncmFkaW8nO1xyXG4gICAgICByYWRpby5uYW1lID0gbmFtZTtcclxuICAgICAgcmFkaW8udmFsdWUgPSB2YWx1ZTtcclxuICAgICAgcmFkaW8uY2hlY2tlZCA9IHZhbHVlID09PSAnYWxsJztcclxuICAgICAgbGFiZWwuYXBwZW5kQ2hpbGQoIHJhZGlvICk7XHJcbiAgICAgIGxhYmVsLmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSggdGV4dCApICk7XHJcbiAgICAgIHJldHVybiBsYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBkaXYuYXBwZW5kQ2hpbGQoIGNyZWF0ZVNjcmVlblJhZGlvQnV0dG9uKCAnc2NyZWVucycsICdhbGwnLCAnQWxsIHNjcmVlbnMnICkgKTtcclxuICAgIGZvciAoIGxldCBpID0gMTsgaSA8PSA2OyBpKysgKSB7XHJcbiAgICAgIGRpdi5hcHBlbmRDaGlsZCggY3JlYXRlU2NyZWVuUmFkaW9CdXR0b24oICdzY3JlZW5zJywgYCR7aX1gLCBgJHtpfWAgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVsZW1lbnQ6IGRpdixcclxuICAgICAgZ2V0IHZhbHVlKCkge1xyXG4gICAgICAgIHJldHVybiAkKCAnaW5wdXRbbmFtZT1zY3JlZW5zXTpjaGVja2VkJyApLnZhbCgpO1xyXG4gICAgICB9LFxyXG4gICAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCggJ2lucHV0W25hbWU9c2NyZWVuc10nIClbIDAgXS5jaGVja2VkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNyZWF0ZVBoZXRpb1ZhbGlkYXRpb25TZWxlY3RvcigpIHtcclxuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlVmFsaWRhdGlvblJhZGlvQnV0dG9uKCBuYW1lLCB2YWx1ZSwgdGV4dCApIHtcclxuICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnbGFiZWwnICk7XHJcbiAgICAgIGxhYmVsLmNsYXNzTmFtZSA9ICd2YWxpZGF0aW9uTGFiZWwnOyAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFuZGVtL2lzc3Vlcy8xOTFcclxuICAgICAgY29uc3QgcmFkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW5wdXQnICk7XHJcbiAgICAgIHJhZGlvLnR5cGUgPSAncmFkaW8nO1xyXG4gICAgICByYWRpby5uYW1lID0gbmFtZTtcclxuICAgICAgcmFkaW8udmFsdWUgPSB2YWx1ZTtcclxuICAgICAgcmFkaW8uY2hlY2tlZCA9IHZhbHVlID09PSAnc2ltdWxhdGlvbi1kZWZhdWx0JztcclxuICAgICAgbGFiZWwuYXBwZW5kQ2hpbGQoIHJhZGlvICk7XHJcbiAgICAgIGxhYmVsLmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSggdGV4dCApICk7XHJcbiAgICAgIHJldHVybiBsYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NwYW4nICk7XHJcbiAgICBzcGFuLnRleHRDb250ZW50ID0gJ3BoZXRpb1ZhbGlkYXRpb249JztcclxuICAgIGRpdi5hcHBlbmRDaGlsZCggc3BhbiApO1xyXG4gICAgZGl2LmFwcGVuZENoaWxkKCBjcmVhdGVWYWxpZGF0aW9uUmFkaW9CdXR0b24oICd2YWxpZGF0aW9uJywgJ3RydWUnLCAndHJ1ZScgKSApO1xyXG4gICAgZGl2LmFwcGVuZENoaWxkKCBjcmVhdGVWYWxpZGF0aW9uUmFkaW9CdXR0b24oICd2YWxpZGF0aW9uJywgJ2ZhbHNlJywgJ2ZhbHNlJyApICk7XHJcbiAgICBkaXYuYXBwZW5kQ2hpbGQoIGNyZWF0ZVZhbGlkYXRpb25SYWRpb0J1dHRvbiggJ3ZhbGlkYXRpb24nLCAnc2ltdWxhdGlvbi1kZWZhdWx0JywgJ1NpbXVsYXRpb24gRGVmYXVsdCcgKSApO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVsZW1lbnQ6IGRpdixcclxuICAgICAgZ2V0IHZhbHVlKCkge1xyXG4gICAgICAgIHJldHVybiAkKCAnaW5wdXRbbmFtZT12YWxpZGF0aW9uXTpjaGVja2VkJyApLnZhbCgpO1xyXG4gICAgICB9LFxyXG4gICAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCggJ2lucHV0W25hbWU9dmFsaWRhdGlvbl0nIClbIDAgXS5jaGVja2VkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZVNlbGVjdG9yXHJcbiAgICogQHJldHVybnMgeyBlbGVtZW50OiB7SFRNTFNlbGVjdEVsZW1lbnR9LCBnZXQgdmFsdWUoKToge3N0cmluZ30gfVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGNyZWF0ZVF1ZXJ5UGFyYW1ldGVyU2VsZWN0b3IoIG1vZGVTZWxlY3RvciApIHtcclxuICAgIGNvbnN0IHNjcmVlblNlbGVjdG9yID0gY3JlYXRlU2NyZWVuU2VsZWN0b3IoKTtcclxuICAgIGNvbnN0IHBoZXRpb1ZhbGlkYXRpb25TZWxlY3RvciA9IGNyZWF0ZVBoZXRpb1ZhbGlkYXRpb25TZWxlY3RvcigpO1xyXG5cclxuICAgIGNvbnN0IGN1c3RvbVRleHRCb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW5wdXQnICk7XHJcbiAgICBjdXN0b21UZXh0Qm94LnR5cGUgPSAndGV4dCc7XHJcblxyXG4gICAgY29uc3QgdG9nZ2xlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcclxuXHJcbiAgICAvLyBnZXQgdGhlIElEIGZvciBhIGNoZWNrYm94IHRoYXQgaXMgXCJkZXBlbmRlbnRcIiBvbiBhbm90aGVyIHZhbHVlXHJcbiAgICBjb25zdCBnZXREZXBlbmRlbnRQYXJhbWV0ZXJDb250cm9sSWQgPSB2YWx1ZSA9PiBgZGVwZW5kZW50LWNoZWNrYm94LSR7dmFsdWV9YDtcclxuXHJcbiAgICBjb25zdCBzZWxlY3RvciA9IHtcclxuICAgICAgc2NyZWVuRWxlbWVudDogc2NyZWVuU2VsZWN0b3IuZWxlbWVudCxcclxuICAgICAgcGhldGlvVmFsaWRhdGlvbkVsZW1lbnQ6IHBoZXRpb1ZhbGlkYXRpb25TZWxlY3Rvci5lbGVtZW50LFxyXG4gICAgICB0b2dnbGVFbGVtZW50OiB0b2dnbGVDb250YWluZXIsXHJcbiAgICAgIGN1c3RvbUVsZW1lbnQ6IGN1c3RvbVRleHRCb3gsXHJcbiAgICAgIGdldCB2YWx1ZSgpIHtcclxuICAgICAgICBjb25zdCBzY3JlZW5zVmFsdWUgPSBzY3JlZW5TZWxlY3Rvci52YWx1ZTtcclxuICAgICAgICBjb25zdCBjaGVja2JveGVzID0gJCggdG9nZ2xlQ29udGFpbmVyICkuZmluZCggJzpjaGVja2JveCcgKTtcclxuICAgICAgICBjb25zdCB1c2VmdWxDaGVja2JveGVzID0gXy5maWx0ZXIoIGNoZWNrYm94ZXMsIGNoZWNrYm94ID0+IHtcclxuXHJcbiAgICAgICAgICAvLyBpZiBhIGNoZWNrYm94IGlzbid0IGNoZWNrZWQsIHRoZW4gd2Ugb25seSBjYXJlIGlmIGl0IGhhcyBiZWVuIGNoYW5nZWQgYW5kIGlzIGEgYm9vbGVhblxyXG4gICAgICAgICAgaWYgKCBjaGVja2JveC5kYXRhc2V0LnF1ZXJ5UGFyYW1ldGVyVHlwZSA9PT0gJ2Jvb2xlYW4nICkge1xyXG4gICAgICAgICAgICByZXR1cm4gY2hlY2tib3guZGF0YXNldC5jaGFuZ2VkID09PSAndHJ1ZSc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNoZWNrYm94LmNoZWNrZWQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIGNvbnN0IGNoZWNrYm94UXVlcnlQYXJhbWV0ZXJzID0gXy5tYXAoIHVzZWZ1bENoZWNrYm94ZXMsIGNoZWNrYm94ID0+IHtcclxuXHJcbiAgICAgICAgICAvLyBzdXBwb3J0IGJvb2xlYW4gcGFyYW1ldGVyc1xyXG4gICAgICAgICAgaWYgKCBjaGVja2JveC5kYXRhc2V0LnF1ZXJ5UGFyYW1ldGVyVHlwZSA9PT0gJ2Jvb2xlYW4nICkge1xyXG4gICAgICAgICAgICByZXR1cm4gYCR7Y2hlY2tib3gubmFtZX09JHtjaGVja2JveC5jaGVja2VkfWA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gY2hlY2tib3gubmFtZTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgY29uc3QgY3VzdG9tUXVlcnlQYXJhbWV0ZXJzID0gY3VzdG9tVGV4dEJveC52YWx1ZS5sZW5ndGggPyBbIGN1c3RvbVRleHRCb3gudmFsdWUgXSA6IFtdO1xyXG4gICAgICAgIGNvbnN0IHNjcmVlblF1ZXJ5UGFyYW1ldGVycyA9IHNjcmVlbnNWYWx1ZSA9PT0gJ2FsbCcgPyBbXSA6IFsgYHNjcmVlbnM9JHtzY3JlZW5zVmFsdWV9YCBdO1xyXG4gICAgICAgIGNvbnN0IHBoZXRpb1ZhbGlkYXRpb25RdWVyeVBhcmFtZXRlcnMgPSBwaGV0aW9WYWxpZGF0aW9uU2VsZWN0b3IudmFsdWUgPT09ICdzaW11bGF0aW9uLWRlZmF1bHQnID8gW10gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaGV0aW9WYWxpZGF0aW9uU2VsZWN0b3IudmFsdWUgPT09ICd0cnVlJyA/IFsgJ3BoZXRpb1ZhbGlkYXRpb249dHJ1ZScgXSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBoZXRpb1ZhbGlkYXRpb25TZWxlY3Rvci52YWx1ZSA9PT0gJ2ZhbHNlJyA/IFsgJ3BoZXRpb1ZhbGlkYXRpb249ZmFsc2UnIF0gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZXJyb3InO1xyXG4gICAgICAgIGlmICggcGhldGlvVmFsaWRhdGlvblF1ZXJ5UGFyYW1ldGVycyA9PT0gJ2Vycm9yJyApIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ2JhZCB2YWx1ZSBmb3IgcGhldGlvVmFsaWRhdGlvbicgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNoZWNrYm94UXVlcnlQYXJhbWV0ZXJzLmNvbmNhdCggY3VzdG9tUXVlcnlQYXJhbWV0ZXJzICkuY29uY2F0KCBzY3JlZW5RdWVyeVBhcmFtZXRlcnMgKS5jb25jYXQoIHBoZXRpb1ZhbGlkYXRpb25RdWVyeVBhcmFtZXRlcnMgKS5qb2luKCAnJicgKTtcclxuICAgICAgfSxcclxuICAgICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBjbGVhckNoaWxkcmVuKCB0b2dnbGVDb250YWluZXIgKTtcclxuXHJcbiAgICAgICAgY29uc3QgcXVlcnlQYXJhbWV0ZXJzID0gbW9kZVNlbGVjdG9yLm1vZGUucXVlcnlQYXJhbWV0ZXJzIHx8IFtdO1xyXG4gICAgICAgIHF1ZXJ5UGFyYW1ldGVycy5mb3JFYWNoKCBwYXJhbWV0ZXIgPT4ge1xyXG4gICAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnbGFiZWwnICk7XHJcbiAgICAgICAgICBjb25zdCBjaGVja2JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbnB1dCcgKTtcclxuICAgICAgICAgIGNoZWNrYm94LnR5cGUgPSAnY2hlY2tib3gnO1xyXG4gICAgICAgICAgY2hlY2tib3gubmFtZSA9IHBhcmFtZXRlci52YWx1ZTtcclxuICAgICAgICAgIGxhYmVsLmFwcGVuZENoaWxkKCBjaGVja2JveCApO1xyXG5cclxuICAgICAgICAgIGxldCBxdWVyeVBhcmFtZXRlckRpc3BsYXkgPSBwYXJhbWV0ZXIudmFsdWU7XHJcblxyXG4gICAgICAgICAgLy8gc2hvdWxkIHRoZSBcIj10cnVlXCIgaWYgYm9vbGVhblxyXG4gICAgICAgICAgaWYgKCBwYXJhbWV0ZXIudHlwZSA9PT0gJ2Jvb2xlYW4nICkge1xyXG4gICAgICAgICAgICBxdWVyeVBhcmFtZXRlckRpc3BsYXkgKz0gYD0ke3BhcmFtZXRlci5kZWZhdWx0fWA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBsYWJlbC5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoIGAke3BhcmFtZXRlci50ZXh0fSAoJHtxdWVyeVBhcmFtZXRlckRpc3BsYXl9KWAgKSApO1xyXG4gICAgICAgICAgdG9nZ2xlQ29udGFpbmVyLmFwcGVuZENoaWxkKCBsYWJlbCApO1xyXG4gICAgICAgICAgdG9nZ2xlQ29udGFpbmVyLmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnYnInICkgKTtcclxuICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSAhIXBhcmFtZXRlci5kZWZhdWx0O1xyXG5cclxuICAgICAgICAgIGlmICggcGFyYW1ldGVyLmRlcGVuZGVudFF1ZXJ5UGFyYW1ldGVycyApIHtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBDcmVhdGVzIGEgY2hlY2tib3ggd2hvc2UgdmFsdWUgaXMgZGVwZW5kZW50IG9uIGFub3RoZXIgY2hlY2tib3gsIGl0IGlzIG9ubHkgdXNlZCBpZiB0aGUgcGFyZW50XHJcbiAgICAgICAgICAgICAqIGNoZWNrYm94IGlzIGNoZWNrZWQuXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbFxyXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcclxuICAgICAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBjaGVja2VkIC0gaW5pdGlhbCBjaGVja2VkIHN0YXRlXHJcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtIVE1MRGl2RWxlbWVudH1cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZURlcGVuZGVudENoZWNrYm94ID0gKCBsYWJlbCwgdmFsdWUsIGNoZWNrZWQgKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgZGVwZW5kZW50UXVlcnlQYXJhbWV0ZXJzQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcclxuXHJcbiAgICAgICAgICAgICAgY29uc3QgZGVwZW5kZW50Q2hlY2tib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW5wdXQnICk7XHJcbiAgICAgICAgICAgICAgZGVwZW5kZW50Q2hlY2tib3guaWQgPSBnZXREZXBlbmRlbnRQYXJhbWV0ZXJDb250cm9sSWQoIHZhbHVlICk7XHJcbiAgICAgICAgICAgICAgZGVwZW5kZW50Q2hlY2tib3gudHlwZSA9ICdjaGVja2JveCc7XHJcbiAgICAgICAgICAgICAgZGVwZW5kZW50Q2hlY2tib3gubmFtZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgIGRlcGVuZGVudENoZWNrYm94LnN0eWxlLm1hcmdpbkxlZnQgPSAnNDBweCc7XHJcbiAgICAgICAgICAgICAgZGVwZW5kZW50Q2hlY2tib3guY2hlY2tlZCA9IGNoZWNrZWQ7XHJcbiAgICAgICAgICAgICAgY29uc3QgbGFiZWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2xhYmVsJyApO1xyXG4gICAgICAgICAgICAgIGxhYmVsRWxlbWVudC5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoIGxhYmVsICkgKTtcclxuICAgICAgICAgICAgICBsYWJlbEVsZW1lbnQuaHRtbEZvciA9IGRlcGVuZGVudENoZWNrYm94LmlkO1xyXG5cclxuICAgICAgICAgICAgICBkZXBlbmRlbnRRdWVyeVBhcmFtZXRlcnNDb250YWluZXIuYXBwZW5kQ2hpbGQoIGRlcGVuZGVudENoZWNrYm94ICk7XHJcbiAgICAgICAgICAgICAgZGVwZW5kZW50UXVlcnlQYXJhbWV0ZXJzQ29udGFpbmVyLmFwcGVuZENoaWxkKCBsYWJlbEVsZW1lbnQgKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gY2hlY2tib3ggYmVjb21lcyB1bmNoZWNrZWQgYW5kIGRpc2FibGVkIGlmIGRlcGVuZGVuY3kgY2hlY2tib3ggaXMgdW5jaGVja2VkXHJcbiAgICAgICAgICAgICAgY29uc3QgZW5hYmxlQnV0dG9uID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZGVwZW5kZW50Q2hlY2tib3guZGlzYWJsZWQgPSAhY2hlY2tib3guY2hlY2tlZDtcclxuICAgICAgICAgICAgICAgIGlmICggIWNoZWNrYm94LmNoZWNrZWQgKSB7XHJcbiAgICAgICAgICAgICAgICAgIGRlcGVuZGVudENoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCBlbmFibGVCdXR0b24gKTtcclxuICAgICAgICAgICAgICBlbmFibGVCdXR0b24oKTtcclxuXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRlcGVuZGVudFF1ZXJ5UGFyYW1ldGVyc0NvbnRhaW5lcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnRhaW5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XHJcbiAgICAgICAgICAgIHBhcmFtZXRlci5kZXBlbmRlbnRRdWVyeVBhcmFtZXRlcnMuZm9yRWFjaCggcmVsYXRlZFBhcmFtZXRlciA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgZGVwZW5kZW50Q2hlY2tib3ggPSBjcmVhdGVEZXBlbmRlbnRDaGVja2JveCggYCR7cmVsYXRlZFBhcmFtZXRlci50ZXh0fSAoJHtyZWxhdGVkUGFyYW1ldGVyLnZhbHVlfSlgLCByZWxhdGVkUGFyYW1ldGVyLnZhbHVlLCAhIXJlbGF0ZWRQYXJhbWV0ZXIuZGVmYXVsdCApO1xyXG4gICAgICAgICAgICAgIGNvbnRhaW5lckRpdi5hcHBlbmRDaGlsZCggZGVwZW5kZW50Q2hlY2tib3ggKTtcclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgICB0b2dnbGVDb250YWluZXIuYXBwZW5kQ2hpbGQoIGNvbnRhaW5lckRpdiApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIG1hcmsgY2hhbmdlZCBldmVudHMgZm9yIGJvb2xlYW4gcGFyYW1ldGVyIHN1cHBvcnRcclxuICAgICAgICAgIGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNoZWNrYm94LmRhdGFzZXQuY2hhbmdlZCA9ICd0cnVlJztcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIGNoZWNrYm94LmRhdGFzZXQucXVlcnlQYXJhbWV0ZXJUeXBlID0gcGFyYW1ldGVyLnR5cGU7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9LFxyXG4gICAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgc2NyZWVuU2VsZWN0b3IucmVzZXQoKTtcclxuICAgICAgICBwaGV0aW9WYWxpZGF0aW9uU2VsZWN0b3IucmVzZXQoKTtcclxuXHJcbiAgICAgICAgY3VzdG9tVGV4dEJveC52YWx1ZSA9ICcnO1xyXG5cclxuICAgICAgICAvLyBGb3IgZWFjaCBjaGVja2JveCwgc2V0IGl0IHRvIGl0cyBkZWZhdWx0XHJcbiAgICAgICAgXy5mb3JFYWNoKCAkKCB0b2dnbGVDb250YWluZXIgKS5maW5kKCAnOmNoZWNrYm94JyApLCBjaGVja2JveCA9PiB7XHJcblxyXG4gICAgICAgICAgLy8gR3JhYiB0aGUgcGFyYW1ldGVyIG9iamVjdFxyXG4gICAgICAgICAgY29uc3QgcGFyYW1ldGVyID0gXy5maWx0ZXIoIG1vZGVTZWxlY3Rvci5tb2RlLnF1ZXJ5UGFyYW1ldGVycywgcGFyYW0gPT4gcGFyYW0udmFsdWUgPT09IGNoZWNrYm94Lm5hbWUgKVsgMCBdO1xyXG5cclxuICAgICAgICAgIGlmICggcGFyYW1ldGVyICkge1xyXG5cclxuICAgICAgICAgICAgLy8gSGFuZGxlIHdoZW4gdGhlIGRlZmF1bHQgaXNuJ3QgZGVmaW5lZCAoaXQgd291bGQgYmUgZmFsc2UpXHJcbiAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSAhIXBhcmFtZXRlci5kZWZhdWx0O1xyXG5cclxuICAgICAgICAgICAgLy8gZGVwZW5kZW50IHBhcmFtZXRlciBjb250cm9scyBvbmx5IGVuYWJsZWQgaWYgcGFyZW50IGNoZWNrYm94IGlzIGNoZWNrZWRcclxuICAgICAgICAgICAgaWYgKCBwYXJhbWV0ZXIuZGVwZW5kZW50UXVlcnlQYXJhbWV0ZXJzICkge1xyXG4gICAgICAgICAgICAgIHBhcmFtZXRlci5kZXBlbmRlbnRRdWVyeVBhcmFtZXRlcnMuZm9yRWFjaCggcmVsYXRlZFBhcmFtID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRlcGVuZGVudENoZWNrYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGdldERlcGVuZGVudFBhcmFtZXRlckNvbnRyb2xJZCggcmVsYXRlZFBhcmFtLnZhbHVlICkgKTtcclxuICAgICAgICAgICAgICAgIGRlcGVuZGVudENoZWNrYm94LmRpc2FibGVkID0gIWNoZWNrYm94LmNoZWNrZWQ7XHJcbiAgICAgICAgICAgICAgICBkZXBlbmRlbnRDaGVja2JveC5jaGVja2VkID0gISFyZWxhdGVkUGFyYW0uZGVmYXVsdDtcclxuICAgICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHNlbGVjdG9yO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIHRoZSB2aWV3IGFuZCBob29rIGV2ZXJ5dGhpbmcgdXAuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZURhdGEgLSBNYXBzIGZyb20ge3N0cmluZ30gcmVwb3NpdG9yeSBuYW1lID0+IHtNb2RlfVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHJlbmRlciggbW9kZURhdGEgKSB7XHJcbiAgICBjb25zdCByZXBvc2l0b3J5U2VsZWN0b3IgPSBjcmVhdGVSZXBvc2l0b3J5U2VsZWN0b3IoIE9iamVjdC5rZXlzKCBtb2RlRGF0YSApICk7XHJcbiAgICBjb25zdCBtb2RlU2VsZWN0b3IgPSBjcmVhdGVNb2RlU2VsZWN0b3IoIG1vZGVEYXRhLCByZXBvc2l0b3J5U2VsZWN0b3IgKTtcclxuICAgIGNvbnN0IHF1ZXJ5UGFyYW1ldGVyU2VsZWN0b3IgPSBjcmVhdGVRdWVyeVBhcmFtZXRlclNlbGVjdG9yKCBtb2RlU2VsZWN0b3IgKTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50VVJMKCkge1xyXG4gICAgICBjb25zdCBxdWVyeVBhcmFtZXRlcnMgPSBxdWVyeVBhcmFtZXRlclNlbGVjdG9yLnZhbHVlO1xyXG4gICAgICBjb25zdCB1cmwgPSBtb2RlU2VsZWN0b3IubW9kZS51cmw7XHJcbiAgICAgIGNvbnN0IHNlcGFyYXRvciA9IHVybC5pbmRleE9mKCAnPycgKSA8IDAgPyAnPycgOiAnJic7XHJcbiAgICAgIHJldHVybiB1cmwgKyAoIHF1ZXJ5UGFyYW1ldGVycy5sZW5ndGggPyBzZXBhcmF0b3IgKyBxdWVyeVBhcmFtZXRlcnMgOiAnJyApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxhdW5jaEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdidXR0b24nICk7XHJcbiAgICBsYXVuY2hCdXR0b24uaWQgPSAnbGF1bmNoQnV0dG9uJztcclxuICAgIGxhdW5jaEJ1dHRvbi5uYW1lID0gJ2xhdW5jaCc7XHJcbiAgICBsYXVuY2hCdXR0b24uaW5uZXJIVE1MID0gJ0xhdW5jaCc7XHJcblxyXG4gICAgY29uc3QgcmVzZXRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnYnV0dG9uJyApO1xyXG4gICAgcmVzZXRCdXR0b24ubmFtZSA9ICdyZXNldCc7XHJcbiAgICByZXNldEJ1dHRvbi5pbm5lckhUTUwgPSAnUmVzZXQgUXVlcnkgUGFyYW1ldGVycyc7XHJcblxyXG4gICAgZnVuY3Rpb24gaGVhZGVyKCBzdHIgKSB7XHJcbiAgICAgIGNvbnN0IGhlYWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaDMnICk7XHJcbiAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCBzdHIgKSApO1xyXG4gICAgICByZXR1cm4gaGVhZDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEaXZzIGZvciBvdXIgdGhyZWUgY29sdW1uc1xyXG4gICAgY29uc3QgcmVwb0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XHJcbiAgICByZXBvRGl2LmlkID0gJ3JlcG9zaXRvcmllcyc7XHJcbiAgICBjb25zdCBtb2RlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcclxuICAgIG1vZGVEaXYuaWQgPSAnY2hvaWNlcyc7XHJcbiAgICBjb25zdCBxdWVyeVBhcmFtZXRlcnNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xyXG4gICAgcXVlcnlQYXJhbWV0ZXJzRGl2LmlkID0gJ3F1ZXJ5UGFyYW1ldGVycyc7XHJcblxyXG4gICAgLy8gTGF5b3V0IG9mIGFsbCBvZiB0aGUgbWFqb3IgZWxlbWVudHNcclxuICAgIHJlcG9EaXYuYXBwZW5kQ2hpbGQoIGhlYWRlciggJ1JlcG9zaXRvcmllcycgKSApO1xyXG4gICAgcmVwb0Rpdi5hcHBlbmRDaGlsZCggcmVwb3NpdG9yeVNlbGVjdG9yLmVsZW1lbnQgKTtcclxuICAgIG1vZGVEaXYuYXBwZW5kQ2hpbGQoIGhlYWRlciggJ01vZGVzJyApICk7XHJcbiAgICBtb2RlRGl2LmFwcGVuZENoaWxkKCBtb2RlU2VsZWN0b3IuZWxlbWVudCApO1xyXG4gICAgbW9kZURpdi5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2JyJyApICk7XHJcbiAgICBtb2RlRGl2LmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnYnInICkgKTtcclxuICAgIG1vZGVEaXYuYXBwZW5kQ2hpbGQoIGxhdW5jaEJ1dHRvbiApO1xyXG4gICAgcXVlcnlQYXJhbWV0ZXJzRGl2LmFwcGVuZENoaWxkKCBoZWFkZXIoICdRdWVyeSBQYXJhbWV0ZXJzJyApICk7XHJcbiAgICBxdWVyeVBhcmFtZXRlcnNEaXYuYXBwZW5kQ2hpbGQoIHF1ZXJ5UGFyYW1ldGVyU2VsZWN0b3IudG9nZ2xlRWxlbWVudCApO1xyXG4gICAgcXVlcnlQYXJhbWV0ZXJzRGl2LmFwcGVuZENoaWxkKCBxdWVyeVBhcmFtZXRlclNlbGVjdG9yLnBoZXRpb1ZhbGlkYXRpb25FbGVtZW50ICk7XHJcbiAgICBxdWVyeVBhcmFtZXRlcnNEaXYuYXBwZW5kQ2hpbGQoIHF1ZXJ5UGFyYW1ldGVyU2VsZWN0b3Iuc2NyZWVuRWxlbWVudCApO1xyXG4gICAgcXVlcnlQYXJhbWV0ZXJzRGl2LmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSggJ1F1ZXJ5IFBhcmFtZXRlcnM6ICcgKSApO1xyXG4gICAgcXVlcnlQYXJhbWV0ZXJzRGl2LmFwcGVuZENoaWxkKCBxdWVyeVBhcmFtZXRlclNlbGVjdG9yLmN1c3RvbUVsZW1lbnQgKTtcclxuICAgIHF1ZXJ5UGFyYW1ldGVyc0Rpdi5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2JyJyApICk7XHJcbiAgICBxdWVyeVBhcmFtZXRlcnNEaXYuYXBwZW5kQ2hpbGQoIHJlc2V0QnV0dG9uICk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCByZXBvRGl2ICk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBtb2RlRGl2ICk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBxdWVyeVBhcmFtZXRlcnNEaXYgKTtcclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVRdWVyeVBhcmFtZXRlclZpc2liaWxpdHkoKSB7XHJcbiAgICAgIHF1ZXJ5UGFyYW1ldGVyc0Rpdi5zdHlsZS52aXNpYmlsaXR5ID0gbW9kZVNlbGVjdG9yLm1vZGUucXVlcnlQYXJhbWV0ZXJzID8gJ2luaGVyaXQnIDogJ2hpZGRlbic7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWxpZ24gcGFuZWxzIGJhc2VkIG9uIHdpZHRoXHJcbiAgICBmdW5jdGlvbiBsYXlvdXQoKSB7XHJcbiAgICAgIG1vZGVEaXYuc3R5bGUubGVmdCA9IGAke3JlcG9zaXRvcnlTZWxlY3Rvci5lbGVtZW50LmNsaWVudFdpZHRoICsgMjB9cHhgO1xyXG4gICAgICBxdWVyeVBhcmFtZXRlcnNEaXYuc3R5bGUubGVmdCA9IGAke3JlcG9zaXRvcnlTZWxlY3Rvci5lbGVtZW50LmNsaWVudFdpZHRoICsgK21vZGVEaXYuY2xpZW50V2lkdGggKyA0MH1weGA7XHJcbiAgICB9XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCBsYXlvdXQgKTtcclxuXHJcbiAgICAvLyBIb29rIHVwZGF0ZXMgdG8gY2hhbmdlIGxpc3RlbmVyc1xyXG4gICAgZnVuY3Rpb24gb25SZXBvc2l0b3J5Q2hhbmdlZCgpIHtcclxuICAgICAgbW9kZVNlbGVjdG9yLnVwZGF0ZSgpO1xyXG4gICAgICBvbk1vZGVDaGFuZ2VkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb25Nb2RlQ2hhbmdlZCgpIHtcclxuICAgICAgcXVlcnlQYXJhbWV0ZXJTZWxlY3Rvci51cGRhdGUoKTtcclxuICAgICAgdXBkYXRlUXVlcnlQYXJhbWV0ZXJWaXNpYmlsaXR5KCk7XHJcbiAgICAgIGxheW91dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcG9zaXRvcnlTZWxlY3Rvci5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCBvblJlcG9zaXRvcnlDaGFuZ2VkICk7XHJcbiAgICBtb2RlU2VsZWN0b3IuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2hhbmdlJywgb25Nb2RlQ2hhbmdlZCApO1xyXG4gICAgb25SZXBvc2l0b3J5Q2hhbmdlZCgpO1xyXG5cclxuICAgIC8vIENsaWNraW5nICdMYXVuY2gnIG9yIHByZXNzaW5nICdlbnRlcicgb3BlbnMgdGhlIFVSTFxyXG4gICAgZnVuY3Rpb24gb3BlbkN1cnJlbnRVUkwoKSB7XHJcbiAgICAgIG9wZW5VUkwoIGdldEN1cnJlbnRVUkwoKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGV2ZW50ID0+IHtcclxuICAgICAgLy8gQ2hlY2sgZm9yIGVudGVyIGtleVxyXG4gICAgICBpZiAoIGV2ZW50LndoaWNoID09PSAxMyApIHtcclxuICAgICAgICBvcGVuQ3VycmVudFVSTCgpO1xyXG4gICAgICB9XHJcbiAgICB9LCBmYWxzZSApO1xyXG4gICAgbGF1bmNoQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIG9wZW5DdXJyZW50VVJMICk7XHJcblxyXG4gICAgLy8gUmVzZXRcclxuICAgIHJlc2V0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIHF1ZXJ5UGFyYW1ldGVyU2VsZWN0b3IucmVzZXQgKTtcclxuICB9XHJcblxyXG4gIC8vIFNwbGl0cyBmaWxlIHN0cmluZ3MgKHN1Y2ggYXMgcGVyZW5uaWFsLWFsaWFzL2RhdGEvYWN0aXZlLXJ1bm5hYmxlcykgaW50byBhIGxpc3Qgb2YgZW50cmllcywgaWdub3JpbmcgYmxhbmsgbGluZXMuXHJcbiAgZnVuY3Rpb24gd2hpdGVTcGxpdEFuZFNvcnQoIHN0ciApIHtcclxuICAgIHJldHVybiBzdHIuc3BsaXQoICdcXG4nICkubWFwKCBsaW5lID0+IHtcclxuICAgICAgcmV0dXJuIGxpbmUucmVwbGFjZSggJ1xccicsICcnICk7XHJcbiAgICB9ICkuZmlsdGVyKCBsaW5lID0+IHtcclxuICAgICAgcmV0dXJuIGxpbmUubGVuZ3RoID4gMDtcclxuICAgIH0gKS5zb3J0KCk7XHJcbiAgfVxyXG5cclxuICAvLyBMb2FkIGZpbGVzIHNlcmlhbGx5LCBwb3B1bGF0ZSB0aGVuIHJlbmRlclxyXG4gICQuYWpheCgge1xyXG4gICAgdXJsOiAnLi4vcGVyZW5uaWFsLWFsaWFzL2RhdGEvYWN0aXZlLXJ1bm5hYmxlcydcclxuICB9ICkuZG9uZSggYWN0aXZlUnVubmFibGVzU3RyaW5nID0+IHtcclxuICAgIGNvbnN0IGFjdGl2ZVJ1bm5hYmxlcyA9IHdoaXRlU3BsaXRBbmRTb3J0KCBhY3RpdmVSdW5uYWJsZXNTdHJpbmcgKTtcclxuXHJcbiAgICAkLmFqYXgoIHtcclxuICAgICAgdXJsOiAnLi4vcGVyZW5uaWFsLWFsaWFzL2RhdGEvYWN0aXZlLXJlcG9zJ1xyXG4gICAgfSApLmRvbmUoIGFjdGl2ZVJlcG9zU3RyaW5nID0+IHtcclxuICAgICAgY29uc3QgYWN0aXZlUmVwb3MgPSB3aGl0ZVNwbGl0QW5kU29ydCggYWN0aXZlUmVwb3NTdHJpbmcgKTtcclxuXHJcbiAgICAgICQuYWpheCgge1xyXG4gICAgICAgIHVybDogJy4uL3BlcmVubmlhbC1hbGlhcy9kYXRhL3BoZXQtaW8nXHJcbiAgICAgIH0gKS5kb25lKCB0ZXN0UGhldGlvU3RyaW5nID0+IHtcclxuICAgICAgICBjb25zdCBwaGV0aW9TaW1zID0gd2hpdGVTcGxpdEFuZFNvcnQoIHRlc3RQaGV0aW9TdHJpbmcgKTtcclxuXHJcbiAgICAgICAgJC5hamF4KCB7XHJcbiAgICAgICAgICB1cmw6ICcuLi9wZXJlbm5pYWwtYWxpYXMvZGF0YS9pbnRlcmFjdGl2ZS1kZXNjcmlwdGlvbidcclxuICAgICAgICB9ICkuZG9uZSggYWNjZXNzaWJsZVNpbXNTdHJpbmcgPT4ge1xyXG4gICAgICAgICAgY29uc3QgaW50ZXJhY3RpdmVEZXNjcmlwdGlvblNpbXMgPSB3aGl0ZVNwbGl0QW5kU29ydCggYWNjZXNzaWJsZVNpbXNTdHJpbmcgKTtcclxuXHJcbiAgICAgICAgICAkLmFqYXgoIHtcclxuICAgICAgICAgICAgdXJsOiAnLi4vcGVyZW5uaWFsLWFsaWFzL2RhdGEvd3JhcHBlcnMnXHJcbiAgICAgICAgICB9ICkuZG9uZSggd3JhcHBlcnNTdHJpbmcgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB3cmFwcGVycyA9IHdoaXRlU3BsaXRBbmRTb3J0KCB3cmFwcGVyc1N0cmluZyApLnNvcnQoKTtcclxuXHJcbiAgICAgICAgICAgICQuYWpheCgge1xyXG4gICAgICAgICAgICAgIHVybDogJy4uL3BlcmVubmlhbC1hbGlhcy9kYXRhL3VuaXQtdGVzdHMnXHJcbiAgICAgICAgICAgIH0gKS5kb25lKCB1bml0VGVzdHNTdHJpbmdzID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCB1bml0VGVzdHNSZXBvcyA9IHdoaXRlU3BsaXRBbmRTb3J0KCB1bml0VGVzdHNTdHJpbmdzICkuc29ydCgpO1xyXG5cclxuICAgICAgICAgICAgICByZW5kZXIoIHBvcHVsYXRlKCBhY3RpdmVSdW5uYWJsZXMsIGFjdGl2ZVJlcG9zLCBwaGV0aW9TaW1zLCBpbnRlcmFjdGl2ZURlc2NyaXB0aW9uU2ltcywgd3JhcHBlcnMsIHVuaXRUZXN0c1JlcG9zICkgKTtcclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH0gKTtc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