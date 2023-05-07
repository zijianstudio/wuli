// Copyright 2013-2023, University of Colorado Boulder

/**
 * Grunt configuration file for PhET projects. In general when possible, modules are imported lazily in their task
 * declaration to save on overall load time of this file. The pattern is to require all modules needed at the top of the
 * grunt task registration. If a module is used in multiple tasks, it is best to lazily require in each
 * task.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

///////////////////////////
// NOTE: to improve performance, the vast majority of modules are lazily imported in task registrations. Even duplicating
// require statements improves the load time of this file noticeably. For details, see https://github.com/phetsims/chipper/issues/1107
const assert = require('assert');
require('./checkNodeVersion');
///////////////////////////

// Allow other Gruntfiles to potentially handle exiting and errors differently`
if (!global.processEventOptOut) {
  // See https://medium.com/@dtinth/making-unhandled-promise-rejections-crash-the-node-js-process-ffc27cfcc9dd for how
  // to get unhandled promise rejections to fail out the node process.
  // Relevant for https://github.com/phetsims/wave-interference/issues/491
  process.on('unhandledRejection', up => {
    throw up;
  });

  // Exit on Ctrl + C case
  process.on('SIGINT', () => {
    console.log('\n\nCaught interrupt signal, exiting');
    process.exit();
  });
}
const Transpiler = require('../common/Transpiler');
const transpiler = new Transpiler({
  silent: true
});

// On the build server, or if a developer wants to run a build without running a transpile watch process,
// we have to transpile any dependencies run through wrapPhetBuildScript
// TODO: What if TypeScript code imports other repos? See https://github.com/phetsims/chipper/issues/1272
transpiler.transpileRepo('chipper');
transpiler.transpileRepo('phet-core');
module.exports = function (grunt) {
  const packageObject = grunt.file.readJSON('package.json');

  // Handle the lack of build.json
  let buildLocal;
  try {
    buildLocal = grunt.file.readJSON(`${process.env.HOME}/.phet/build-local.json`);
  } catch (e) {
    buildLocal = {};
  }
  const repo = grunt.option('repo') || packageObject.name;
  assert(typeof repo === 'string' && /^[a-z]+(-[a-z]+)*$/u.test(repo), 'repo name should be composed of lower-case characters, optionally with dashes used as separators');

  /**
   * Wraps a promise's completion with grunt's asynchronous handling, with added helpful failure messages (including
   * stack traces, regardless of whether --stack was provided).
   * @public
   *
   * @param {Promise} promise
   */
  async function wrap(promise) {
    const done = grunt.task.current.async();
    try {
      await promise;
    } catch (e) {
      if (e.stack) {
        grunt.fail.fatal(`Perennial task failed:\n${e.stack}\nFull Error details:\n${e}`);
      }

      // The toString check handles a weird case found from an Error object from puppeteer that doesn't stringify with
      // JSON or have a stack, JSON.stringifies to "{}", but has a `toString` method
      else if (typeof e === 'string' || JSON.stringify(e).length === 2 && e.toString) {
        grunt.fail.fatal(`Perennial task failed: ${e}`);
      } else {
        grunt.fail.fatal(`Perennial task failed with unknown error: ${JSON.stringify(e, null, 2)}`);
      }
    }
    done();
  }

  /**
   * Wraps an async function for a grunt task. Will run the async function when the task should be executed. Will
   * properly handle grunt's async handling, and provides improved error reporting.
   * @public
   *
   * @param {async function} asyncTaskFunction
   */
  function wrapTask(asyncTaskFunction) {
    return () => {
      wrap(asyncTaskFunction());
    };
  }
  grunt.registerTask('default', 'Builds the repository', [...(grunt.option('lint') === false ? [] : ['lint-all']), ...(grunt.option('report-media') === false ? [] : ['report-media']), 'clean', 'build']);
  const wrapPhetBuildScript = string => {
    const args = string.split(' ');
    const child_process = require('child_process');
    return () => {
      const done = grunt.task.current.async();
      const p = child_process.spawn('node', ['../chipper/dist/js/chipper/js/phet-build-script/phet-build-script.mjs', ...args], {
        cwd: process.cwd()
      });
      p.on('error', error => {
        grunt.fail.fatal(`Perennial task failed: ${error}`);
        done();
      });
      p.stderr.on('data', data => console.log(String(data)));
      p.stdout.on('data', data => console.log(String(data)));
      p.on('close', code => {
        if (code !== 0) {
          grunt.fail.fatal(`Perennial task failed with code: ${code}`);
        }
        done();
      });
    };
  };
  grunt.registerTask('clean', 'Erases the build/ directory and all its contents, and recreates the build/ directory', wrapPhetBuildScript(`clean --repo=${repo}`));
  grunt.registerTask('build-images', 'Build images only', wrapTask(async () => {
    const jimp = require('jimp');
    const generateThumbnails = require('./generateThumbnails');
    const generateTwitterCard = require('./generateTwitterCard');
    const brand = 'phet';
    grunt.log.writeln(`Building images for brand: ${brand}`);
    const buildDir = `../${repo}/build/${brand}`;
    // Thumbnails and twitter card
    if (grunt.file.exists(`../${repo}/assets/${repo}-screenshot.png`)) {
      const thumbnailSizes = [{
        width: 900,
        height: 591
      }, {
        width: 600,
        height: 394
      }, {
        width: 420,
        height: 276
      }, {
        width: 128,
        height: 84
      }, {
        width: 15,
        height: 10
      }];
      for (const size of thumbnailSizes) {
        grunt.file.write(`${buildDir}/${repo}-${size.width}.png`, await generateThumbnails(repo, size.width, size.height, 100, jimp.MIME_PNG));
      }
      const altScreenshots = grunt.file.expand({
        filter: 'isFile',
        cwd: `../${repo}/assets`
      }, [`./${repo}-screenshot-alt[0123456789].png`]);
      for (const altScreenshot of altScreenshots) {
        const imageNumber = Number(altScreenshot.substr(`./${repo}-screenshot-alt`.length, 1));
        grunt.file.write(`${buildDir}/${repo}-${600}-alt${imageNumber}.png`, await generateThumbnails(repo, 600, 394, 100, jimp.MIME_PNG, `-alt${imageNumber}`));
        grunt.file.write(`${buildDir}/${repo}-${900}-alt${imageNumber}.png`, await generateThumbnails(repo, 900, 591, 100, jimp.MIME_PNG, `-alt${imageNumber}`));
      }
      if (brand === 'phet') {
        grunt.file.write(`${buildDir}/${repo}-ios.png`, await generateThumbnails(repo, 420, 276, 90, jimp.MIME_JPEG));
        grunt.file.write(`${buildDir}/${repo}-twitter-card.png`, await generateTwitterCard(repo));
      }
    }
  }));
  grunt.registerTask('output-js', 'Outputs JS just for the specified repo', wrapTask(async () => {
    transpiler.transpileRepo(repo);
  }));
  grunt.registerTask('output-js-project', 'Outputs JS for the specified repo and its dependencies', wrapTask(async () => {
    const getPhetLibs = require('./getPhetLibs');
    transpiler.transpileRepos(getPhetLibs(repo));
  }));
  grunt.registerTask('output-js-all', 'Outputs JS for all repos', wrapTask(async () => {
    transpiler.transpileAll();
  }));
  grunt.registerTask('build', `Builds the repository. Depending on the repository type (runnable/wrapper/standalone), the result may vary.
 --minify.babelTranspile=false - Disables babel transpilation phase.
 --minify.uglify=false - Disables uglification, so the built file will include (essentially) concatenated source files.
 --minify.mangle=false - During uglification, it will not "mangle" variable names (where they get renamed to short constants to reduce file size.)
 --minify.beautify=true - After uglification, the source code will be syntax formatted nicely
 --minify.stripAssertions=false - During uglification, it will strip assertions.
 --minify.stripLogging=false - During uglification, it will not strip logging statements.
 Runnable build options:
 --report-media - Will iterate over all of the license.json files and reports any media files
 --brands={{BRANDS} - Can be * (build all supported brands), or a comma-separated list of brand names. Will fall back to using
                      build-local.json's brands (or adapted-from-phet if that does not exist)
 --allHTML - If provided, will include the _all.html file (if it would not otherwise be built, e.g. phet brand)
 --XHTML - Includes an xhtml/ directory in the build output that contains a runnable XHTML form of the sim (with
           a separated-out JS file).
 --locales={{LOCALES}} - Can be * (build all available locales, "en" and everything in babel), or a comma-separated list of locales`, wrapTask(async () => {
    const buildStandalone = require('./buildStandalone');
    const buildRunnable = require('./buildRunnable');
    const minify = require('./minify');
    const tsc = require('./tsc');
    const reportTscResults = require('./reportTscResults');
    const path = require('path');
    const fs = require('fs');
    const getPhetLibs = require('./getPhetLibs');
    const phetTimingLog = require('../../../perennial-alias/js/common/phetTimingLog');
    await phetTimingLog.startAsync('grunt-build', async () => {
      // Parse minification keys
      const minifyKeys = Object.keys(minify.MINIFY_DEFAULTS);
      const minifyOptions = {};
      minifyKeys.forEach(minifyKey => {
        const option = grunt.option(`minify.${minifyKey}`);
        if (option === true || option === false) {
          minifyOptions[minifyKey] = option;
        }
      });
      const repoPackageObject = grunt.file.readJSON(`../${repo}/package.json`);

      // Run the type checker first.
      const brands = getBrands(grunt, repo, buildLocal);
      await phetTimingLog.startAsync('tsc', async () => {
        // We must have phet-io code checked out to type check, since simLauncher imports phetioEngine
        if (brands.includes('phet-io') || brands.includes('phet')) {
          const results = await tsc(`../${repo}`);
          reportTscResults(results, grunt);
        } else {
          grunt.log.writeln('skipping type checking');
        }
      });
      await phetTimingLog.startAsync('transpile', () => {
        // If that succeeds, then convert the code to JS
        transpiler.transpileRepos(getPhetLibs(repo));
      });

      // standalone
      if (repoPackageObject.phet.buildStandalone) {
        grunt.log.writeln('Building standalone repository');
        const parentDir = `../${repo}/build/`;
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir);
        }
        fs.writeFileSync(`${parentDir}/${repo}.min.js`, await buildStandalone(repo, minifyOptions));

        // Build a debug version
        minifyOptions.minify = false;
        minifyOptions.babelTranspile = false;
        minifyOptions.uglify = false;
        minifyOptions.isDebug = true;
        fs.writeFileSync(`${parentDir}/${repo}.debug.js`, await buildStandalone(repo, minifyOptions, true));
        if (repoPackageObject.phet.standaloneTranspiles) {
          for (const file of repoPackageObject.phet.standaloneTranspiles) {
            fs.writeFileSync(`../${repo}/build/${path.basename(file)}`, minify(grunt.file.read(file)));
          }
        }
      } else {
        const localPackageObject = grunt.file.readJSON(`../${repo}/package.json`);
        assert(localPackageObject.phet.runnable, `${repo} does not appear to be runnable`);
        grunt.log.writeln(`Building runnable repository (${repo}, brands: ${brands.join(', ')})`);

        // Other options
        const allHTML = !!grunt.option('allHTML');
        const localesOption = grunt.option('locales') || 'en'; // Default back to English for now

        for (const brand of brands) {
          grunt.log.writeln(`Building brand: ${brand}`);
          await phetTimingLog.startAsync('build-brand-' + brand, async () => {
            await buildRunnable(repo, minifyOptions, allHTML, brand, localesOption, buildLocal);
          });
        }
      }
    });
  }));
  grunt.registerTask('generate-used-strings-file', 'Writes used strings to phet-io-sim-specific/ so that PhET-iO sims only output relevant strings to the API in unbuilt mode', wrapTask(async () => {
    const getPhetLibs = require('./getPhetLibs');
    const fs = require('fs');
    const webpackBuild = require('./webpackBuild');
    const ChipperConstants = require('../common/ChipperConstants');
    const getLocalesFromRepository = require('./getLocalesFromRepository');
    const getStringMap = require('./getStringMap');
    transpiler.transpileRepos(getPhetLibs(repo));
    const webpackResult = await webpackBuild(repo, 'phet');
    const phetLibs = getPhetLibs(repo, 'phet');
    const allLocales = [ChipperConstants.FALLBACK_LOCALE, ...getLocalesFromRepository(repo)];
    const {
      stringMap
    } = getStringMap(repo, allLocales, phetLibs, webpackResult.usedModules);

    // TODO: https://github.com/phetsims/phet-io/issues/1877 This is only pertinent for phet-io, so I'm outputting
    // it to phet-io-sim-specific.  But none of intrinsic data is phet-io-specific.
    // Do we want a different path for it?
    // TODO: https://github.com/phetsims/phet-io/issues/1877 How do we indicate that it is a build artifact, and
    // should not be manually updated?
    fs.writeFileSync(`../phet-io-sim-specific/repos/${repo}/used-strings_en.json`, JSON.stringify(stringMap.en, null, 2));
  }));
  grunt.registerTask('build-for-server', 'meant for use by build-server only', ['build']);
  grunt.registerTask('lint', `lint js files. Options:
--disable-eslint-cache: cache will not be read or written
--fix: autofixable changes will be written to disk
--format: Append an additional set of rules for formatting
--chip-away: output a list of responsible devs for each repo with lint problems
--disable-with-comment: add an es-lint disable with comment to lint errors
--repos: comma separated list of repos to lint in addition to the repo from running`, wrapTask(async () => {
    const lint = require('./lint');

    // --disable-eslint-cache disables the cache, useful for developing rules
    const cache = !grunt.option('disable-eslint-cache');
    const fix = grunt.option('fix');
    const format = grunt.option('format');
    const chipAway = grunt.option('chip-away');
    const disableWithComment = grunt.option('disable-with-comment');
    const extraRepos = grunt.option('repos') ? grunt.option('repos').split(',') : [];
    const lintReturnValue = await lint([repo, ...extraRepos], {
      cache: cache,
      fix: fix,
      format: format,
      chipAway: chipAway,
      disableWithComment: disableWithComment
    });
    if (!lintReturnValue.ok) {
      grunt.fail.fatal('Lint failed');
    }
  }));
  grunt.registerTask('lint-all', 'lint all js files that are required to build this repository (for the specified brands)', wrapTask(async () => {
    const lint = require('./lint');

    // --disable-eslint-cache disables the cache, useful for developing rules
    const cache = !grunt.option('disable-eslint-cache');
    const fix = grunt.option('fix');
    const format = grunt.option('format');
    const chipAway = grunt.option('chip-away');
    const disableWithComment = grunt.option('disable-with-comment');
    assert && assert(!grunt.option('patterns'), 'patterns not support for lint-all');
    const getPhetLibs = require('./getPhetLibs');
    const brands = getBrands(grunt, repo, buildLocal);
    const lintReturnValue = await lint(getPhetLibs(repo, brands), {
      cache: cache,
      fix: fix,
      format: format,
      chipAway: chipAway,
      disableWithComment: disableWithComment
    });

    // Output results on errors.
    if (!lintReturnValue.ok) {
      grunt.fail.fatal('Lint failed');
    }
  }));
  grunt.registerTask('generate-development-html', 'Generates top-level SIM_en.html file based on the preloads in package.json.', wrapTask(async () => {
    const generateDevelopmentHTML = require('./generateDevelopmentHTML');
    await generateDevelopmentHTML(repo);
  }));
  grunt.registerTask('generate-test-html', 'Generates top-level SIM-tests.html file based on the preloads in package.json.  See https://github.com/phetsims/aqua/blob/master/doc/adding-unit-tests.md ' + 'for more information on automated testing. Usually you should ' + 'set the "generatedUnitTests":true flag in the sim package.json and run `grunt update` instead of manually generating this.', wrapTask(async () => {
    const generateTestHTML = require('./generateTestHTML');
    await generateTestHTML(repo);
  }));
  grunt.registerTask('generate-a11y-view-html', 'Generates top-level SIM-a11y-view.html file used for visualizing accessible content. Usually you should ' + 'set the "phet.simFeatures.supportsInteractiveDescription":true flag in the sim package.json and run `grunt update` ' + 'instead of manually generating this.', wrapTask(async () => {
    const generateA11yViewHTML = require('./generateA11yViewHTML');
    await generateA11yViewHTML(repo);
  }));
  grunt.registerTask('update', `
Updates the normal automatically-generated files for this repository. Includes:
  * runnables: generate-development-html and modulify
  * accessible runnables: generate-a11y-view-html
  * unit tests: generate-test-html
  * simulations: generateREADME()
  * phet-io simulations: generate overrides file if needed
  * create the conglomerate string files for unbuilt mode, for this repo and its dependencies`, wrapTask(async () => {
    const generateREADME = require('./generateREADME');
    const fs = require('fs');

    // support repos that don't have a phet object
    if (!packageObject.phet) {
      return;
    }

    // modulify is graceful if there are no files that need modulifying.
    grunt.task.run('modulify');
    if (packageObject.phet.runnable) {
      grunt.task.run('generate-development-html');
      if (packageObject.phet.simFeatures && packageObject.phet.simFeatures.supportsInteractiveDescription) {
        grunt.task.run('generate-a11y-view-html');
      }
    }
    if (packageObject.phet.generatedUnitTests) {
      grunt.task.run('generate-test-html');
    }

    // update README.md only for simulations
    if (packageObject.phet.simulation && !packageObject.phet.readmeCreatedManually) {
      await generateREADME(repo, !!packageObject.phet.published);
    }
    if (packageObject.phet.supportedBrands && packageObject.phet.supportedBrands.includes('phet-io')) {
      // Copied from build.json and used as a preload for phet-io brand
      const overridesFile = `js/${repo}-phet-io-overrides.js`;

      // If there is already an overrides file, don't overwrite it with an empty one
      if (!fs.existsSync(`../${repo}/${overridesFile}`)) {
        const writeFileAndGitAdd = require('../../../perennial-alias/js/common/writeFileAndGitAdd');
        const overridesContent = '/* eslint-disable */\nwindow.phet.preloads.phetio.phetioElementsOverrides = {};';
        await writeFileAndGitAdd(repo, overridesFile, overridesContent);
      }
    }
  }));

  // This is not run in grunt update because it affects dependencies and outputs files outside of the repo.
  grunt.registerTask('generate-development-strings', 'To support locales=* in unbuilt mode, generate a conglomerate JSON file for each repo with translations in babel. Run on all repos via:\n' + '* for-each.sh perennial-alias/data/active-repos npm install\n' + '* for-each.sh perennial-alias/data/active-repos grunt generate-development-strings', wrapTask(async () => {
    const generateDevelopmentStrings = require('../scripts/generateDevelopmentStrings');
    const fs = require('fs');
    if (fs.existsSync(`../${repo}/${repo}-strings_en.json`)) {
      generateDevelopmentStrings(repo);
    }
  }));
  grunt.registerTask('published-README', 'Generates README.md file for a published simulation.', wrapTask(async () => {
    const generateREADME = require('./generateREADME'); // used by multiple tasks
    await generateREADME(repo, true /* published */);
  }));

  grunt.registerTask('unpublished-README', 'Generates README.md file for an unpublished simulation.', wrapTask(async () => {
    const generateREADME = require('./generateREADME'); // used by multiple tasks
    await generateREADME(repo, false /* published */);
  }));

  grunt.registerTask('sort-imports', 'Sort the import statements for a single file (if --file={{FILE}} is provided), or does so for all JS files if not specified', wrapTask(async () => {
    const sortImports = require('./sortImports');
    const file = grunt.option('file');
    if (file) {
      sortImports(file);
    } else {
      grunt.file.recurse(`../${repo}/js`, absfile => sortImports(absfile));
    }
  }));
  grunt.registerTask('commits-since', 'Shows commits since a specified date. Use --date=<date> to specify the date.', wrapTask(async () => {
    const dateString = grunt.option('date');
    assert(dateString, 'missing required option: --date={{DATE}}');
    const commitsSince = require('./commitsSince');
    await commitsSince(repo, dateString);
  }));

  // See reportMedia.js
  grunt.registerTask('report-media', '(project-wide) Report on license.json files throughout all working copies. ' + 'Reports any media (such as images or sound) files that have any of the following problems:\n' + '(1) incompatible-license (resource license not approved)\n' + '(2) not-annotated (license.json missing or entry missing from license.json)\n' + '(3) missing-file (entry in the license.json but not on the file system)', wrapTask(async () => {
    const reportMedia = require('./reportMedia');
    await reportMedia(repo);
  }));

  // see reportThirdParty.js
  grunt.registerTask('report-third-party', 'Creates a report of third-party resources (code, images, sound, etc) used in the published PhET simulations by ' + 'reading the license information in published HTML files on the PhET website. This task must be run from master.  ' + 'After running this task, you must push sherpa/third-party-licenses.md.', wrapTask(async () => {
    const reportThirdParty = require('./reportThirdParty');
    await reportThirdParty();
  }));
  grunt.registerTask('modulify', 'Creates *.js modules for all images/strings/audio/etc in a repo', wrapTask(async () => {
    const modulify = require('./modulify');
    const generateDevelopmentStrings = require('../scripts/generateDevelopmentStrings');
    const fs = require('fs');
    await modulify(repo);
    if (fs.existsSync(`../${repo}/${repo}-strings_en.json`)) {
      generateDevelopmentStrings(repo);
    }
  }));

  // Grunt task that determines created and last modified dates from git, and
  // updates copyright statements accordingly, see #403
  grunt.registerTask('update-copyright-dates', 'Update the copyright dates in JS source files based on Github dates', wrapTask(async () => {
    const updateCopyrightDates = require('./updateCopyrightDates');
    await updateCopyrightDates(repo);
  }));
  grunt.registerTask('webpack-dev-server', `Runs a webpack server for a given list of simulations.
--repos=REPOS for a comma-separated list of repos (defaults to current repo)
--port=9000 to adjust the running port
--devtool=string value for sourcemap generation specified at https://webpack.js.org/configuration/devtool or undefined for (none)
--chrome: open the sims in Chrome tabs (Mac)`, () => {
    // We don't finish! Don't tell grunt this...
    grunt.task.current.async();
    const repos = grunt.option('repos') ? grunt.option('repos').split(',') : [repo];
    const port = grunt.option('port') || 9000;
    let devtool = grunt.option('devtool') || 'inline-source-map';
    if (devtool === 'none' || devtool === 'undefined') {
      devtool = undefined;
    }
    const openChrome = grunt.option('chrome') || false;
    const webpackDevServer = require('./webpackDevServer');

    // NOTE: We don't care about the promise that is returned here, because we are going to keep this task running
    // until the user manually kills it.
    webpackDevServer(repos, port, devtool, openChrome);
  });
  grunt.registerTask('generate-phet-io-api', 'Output the PhET-iO API as JSON to phet-io-sim-specific/api.\n' + 'Options\n:' + '--sims=... a list of sims to compare (defaults to the sim in the current dir)\n' + '--simList=... a file with a list of sims to compare (defaults to the sim in the current dir)\n' + '--stable - regenerate for all "stable sims" (see perennial/data/phet-io-api-stable/)\n' + '--temporary - outputs to the temporary directory', wrapTask(async () => {
    const formatPhetioAPI = require('../phet-io/formatPhetioAPI');
    const getSimList = require('../common/getSimList');
    const generatePhetioMacroAPI = require('../phet-io/generatePhetioMacroAPI');
    const fs = require('fs');
    const sims = getSimList().length === 0 ? [repo] : getSimList();
    transpiler.transpileAll();
    const results = await generatePhetioMacroAPI(sims, {
      showProgressBar: sims.length > 1
    });
    sims.forEach(sim => {
      const dir = `../phet-io-sim-specific/repos/${sim}`;
      try {
        fs.mkdirSync(dir);
      } catch (e) {
        // Directory exists
      }
      const filePath = `${dir}/${sim}-phet-io-api${grunt.option('temporary') ? '-temporary' : ''}.json`;
      const api = results[sim];
      fs.writeFileSync(filePath, formatPhetioAPI(api));
    });
  }));
  grunt.registerTask('compare-phet-io-api', 'Compares the phet-io-api against the reference version(s) if this sim\'s package.json marks compareDesignedAPIChanges.  ' + 'This will by default compare designed changes only. Options:\n' + '--sims=... a list of sims to compare (defaults to the sim in the current dir)\n' + '--simList=... a file with a list of sims to compare (defaults to the sim in the current dir)\n' + '--stable, generate the phet-io-apis for each phet-io sim considered to have a stable api (see perennial-alias/data/phet-io-api-stable)\n' + '--delta, by default a breaking-compatibility comparison is done, but --delta shows all changes\n' + '--temporary, compares API files in the temporary directory (otherwise compares to freshly generated APIs)\n' + '--compareBreakingAPIChanges - add this flag to compare breaking changes in addition to designed changes', wrapTask(async () => {
    const getSimList = require('../common/getSimList');
    const generatePhetioMacroAPI = require('../phet-io/generatePhetioMacroAPI');
    const fs = require('fs');
    const sims = getSimList().length === 0 ? [repo] : getSimList();
    const temporary = grunt.option('temporary');
    let proposedAPIs = null;
    if (temporary) {
      proposedAPIs = {};
      sims.forEach(sim => {
        proposedAPIs[sim] = JSON.parse(fs.readFileSync(`../phet-io-sim-specific/repos/${repo}/${repo}-phet-io-api-temporary.json`, 'utf8'));
      });
    } else {
      proposedAPIs = await generatePhetioMacroAPI(sims, {
        showProgressBar: true,
        showMessagesFromSim: false
      });
    }

    // Don't add to options object if values are `undefined` (as _.extend will keep those entries and not mix in defaults
    const options = {};
    if (grunt.option('delta')) {
      options.delta = grunt.option('delta');
    }
    if (grunt.option('compareBreakingAPIChanges')) {
      options.compareBreakingAPIChanges = grunt.option('compareBreakingAPIChanges');
    }
    await require('../phet-io/phetioCompareAPISets')(sims, proposedAPIs, options);
  }));

  /**
   * Creates grunt tasks that effectively get forwarded to perennial. It will execute a grunt process running from
   * perennial's directory with the same options (but with --repo={{REPO}} added, so that perennial is aware of what
   * repository is the target).
   * @public
   *
   * @param {string} task - The name of the task
   */
  function forwardToPerennialGrunt(task) {
    grunt.registerTask(task, 'Run grunt --help in perennial to see documentation', () => {
      grunt.log.writeln('(Forwarding task to perennial)');
      const child_process = require('child_process');
      const done = grunt.task.current.async();

      // Include the --repo flag
      const args = [`--repo=${repo}`, ...process.argv.slice(2)];
      const argsString = args.map(arg => `"${arg}"`).join(' ');
      const spawned = child_process.spawn(/^win/.test(process.platform) ? 'grunt.cmd' : 'grunt', args, {
        cwd: '../perennial'
      });
      grunt.log.debug(`running grunt ${argsString} in ../${repo}`);
      spawned.stderr.on('data', data => grunt.log.error(data.toString()));
      spawned.stdout.on('data', data => grunt.log.write(data.toString()));
      process.stdin.pipe(spawned.stdin);
      spawned.on('close', code => {
        if (code !== 0) {
          throw new Error(`perennial grunt ${argsString} failed with code ${code}`);
        } else {
          done();
        }
      });
    });
  }
  ['checkout-shas', 'checkout-target', 'checkout-release', 'checkout-master', 'checkout-master-all', 'create-one-off', 'sha-check', 'sim-list', 'npm-update', 'create-release', 'cherry-pick', 'wrapper', 'dev', 'one-off', 'rc', 'production', 'prototype', 'create-sim', 'insert-require-statement', 'lint-everything', 'generate-data', 'pdom-comparison', 'release-branch-list'].forEach(forwardToPerennialGrunt);
};
const getBrands = (grunt, repo, buildLocal) => {
  // Determine what brands we want to build
  assert(!grunt.option('brand'), 'Use --brands={{BRANDS}} instead of brand');
  const localPackageObject = grunt.file.readJSON(`../${repo}/package.json`);
  const supportedBrands = localPackageObject.phet.supportedBrands || [];
  let brands;
  if (grunt.option('brands')) {
    if (grunt.option('brands') === '*') {
      brands = supportedBrands;
    } else {
      brands = grunt.option('brands').split(',');
    }
  } else if (buildLocal.brands) {
    // Extra check, see https://github.com/phetsims/chipper/issues/640
    assert(Array.isArray(buildLocal.brands), 'If brands exists in build-local.json, it should be an array');
    brands = buildLocal.brands.filter(brand => supportedBrands.includes(brand));
  } else {
    brands = ['adapted-from-phet'];
  }

  // Ensure all listed brands are valid
  brands.forEach(brand => assert(supportedBrands.includes(brand), `Unsupported brand: ${brand}`));
  return brands;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3NlcnQiLCJyZXF1aXJlIiwiZ2xvYmFsIiwicHJvY2Vzc0V2ZW50T3B0T3V0IiwicHJvY2VzcyIsIm9uIiwidXAiLCJjb25zb2xlIiwibG9nIiwiZXhpdCIsIlRyYW5zcGlsZXIiLCJ0cmFuc3BpbGVyIiwic2lsZW50IiwidHJhbnNwaWxlUmVwbyIsIm1vZHVsZSIsImV4cG9ydHMiLCJncnVudCIsInBhY2thZ2VPYmplY3QiLCJmaWxlIiwicmVhZEpTT04iLCJidWlsZExvY2FsIiwiZW52IiwiSE9NRSIsImUiLCJyZXBvIiwib3B0aW9uIiwibmFtZSIsInRlc3QiLCJ3cmFwIiwicHJvbWlzZSIsImRvbmUiLCJ0YXNrIiwiY3VycmVudCIsImFzeW5jIiwic3RhY2siLCJmYWlsIiwiZmF0YWwiLCJKU09OIiwic3RyaW5naWZ5IiwibGVuZ3RoIiwidG9TdHJpbmciLCJ3cmFwVGFzayIsImFzeW5jVGFza0Z1bmN0aW9uIiwicmVnaXN0ZXJUYXNrIiwid3JhcFBoZXRCdWlsZFNjcmlwdCIsInN0cmluZyIsImFyZ3MiLCJzcGxpdCIsImNoaWxkX3Byb2Nlc3MiLCJwIiwic3Bhd24iLCJjd2QiLCJlcnJvciIsInN0ZGVyciIsImRhdGEiLCJTdHJpbmciLCJzdGRvdXQiLCJjb2RlIiwiamltcCIsImdlbmVyYXRlVGh1bWJuYWlscyIsImdlbmVyYXRlVHdpdHRlckNhcmQiLCJicmFuZCIsIndyaXRlbG4iLCJidWlsZERpciIsImV4aXN0cyIsInRodW1ibmFpbFNpemVzIiwid2lkdGgiLCJoZWlnaHQiLCJzaXplIiwid3JpdGUiLCJNSU1FX1BORyIsImFsdFNjcmVlbnNob3RzIiwiZXhwYW5kIiwiZmlsdGVyIiwiYWx0U2NyZWVuc2hvdCIsImltYWdlTnVtYmVyIiwiTnVtYmVyIiwic3Vic3RyIiwiTUlNRV9KUEVHIiwiZ2V0UGhldExpYnMiLCJ0cmFuc3BpbGVSZXBvcyIsInRyYW5zcGlsZUFsbCIsImJ1aWxkU3RhbmRhbG9uZSIsImJ1aWxkUnVubmFibGUiLCJtaW5pZnkiLCJ0c2MiLCJyZXBvcnRUc2NSZXN1bHRzIiwicGF0aCIsImZzIiwicGhldFRpbWluZ0xvZyIsInN0YXJ0QXN5bmMiLCJtaW5pZnlLZXlzIiwiT2JqZWN0Iiwia2V5cyIsIk1JTklGWV9ERUZBVUxUUyIsIm1pbmlmeU9wdGlvbnMiLCJmb3JFYWNoIiwibWluaWZ5S2V5IiwicmVwb1BhY2thZ2VPYmplY3QiLCJicmFuZHMiLCJnZXRCcmFuZHMiLCJpbmNsdWRlcyIsInJlc3VsdHMiLCJwaGV0IiwicGFyZW50RGlyIiwiZXhpc3RzU3luYyIsIm1rZGlyU3luYyIsIndyaXRlRmlsZVN5bmMiLCJiYWJlbFRyYW5zcGlsZSIsInVnbGlmeSIsImlzRGVidWciLCJzdGFuZGFsb25lVHJhbnNwaWxlcyIsImJhc2VuYW1lIiwicmVhZCIsImxvY2FsUGFja2FnZU9iamVjdCIsInJ1bm5hYmxlIiwiam9pbiIsImFsbEhUTUwiLCJsb2NhbGVzT3B0aW9uIiwid2VicGFja0J1aWxkIiwiQ2hpcHBlckNvbnN0YW50cyIsImdldExvY2FsZXNGcm9tUmVwb3NpdG9yeSIsImdldFN0cmluZ01hcCIsIndlYnBhY2tSZXN1bHQiLCJwaGV0TGlicyIsImFsbExvY2FsZXMiLCJGQUxMQkFDS19MT0NBTEUiLCJzdHJpbmdNYXAiLCJ1c2VkTW9kdWxlcyIsImVuIiwibGludCIsImNhY2hlIiwiZml4IiwiZm9ybWF0IiwiY2hpcEF3YXkiLCJkaXNhYmxlV2l0aENvbW1lbnQiLCJleHRyYVJlcG9zIiwibGludFJldHVyblZhbHVlIiwib2siLCJnZW5lcmF0ZURldmVsb3BtZW50SFRNTCIsImdlbmVyYXRlVGVzdEhUTUwiLCJnZW5lcmF0ZUExMXlWaWV3SFRNTCIsImdlbmVyYXRlUkVBRE1FIiwicnVuIiwic2ltRmVhdHVyZXMiLCJzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb24iLCJnZW5lcmF0ZWRVbml0VGVzdHMiLCJzaW11bGF0aW9uIiwicmVhZG1lQ3JlYXRlZE1hbnVhbGx5IiwicHVibGlzaGVkIiwic3VwcG9ydGVkQnJhbmRzIiwib3ZlcnJpZGVzRmlsZSIsIndyaXRlRmlsZUFuZEdpdEFkZCIsIm92ZXJyaWRlc0NvbnRlbnQiLCJnZW5lcmF0ZURldmVsb3BtZW50U3RyaW5ncyIsInNvcnRJbXBvcnRzIiwicmVjdXJzZSIsImFic2ZpbGUiLCJkYXRlU3RyaW5nIiwiY29tbWl0c1NpbmNlIiwicmVwb3J0TWVkaWEiLCJyZXBvcnRUaGlyZFBhcnR5IiwibW9kdWxpZnkiLCJ1cGRhdGVDb3B5cmlnaHREYXRlcyIsInJlcG9zIiwicG9ydCIsImRldnRvb2wiLCJ1bmRlZmluZWQiLCJvcGVuQ2hyb21lIiwid2VicGFja0RldlNlcnZlciIsImZvcm1hdFBoZXRpb0FQSSIsImdldFNpbUxpc3QiLCJnZW5lcmF0ZVBoZXRpb01hY3JvQVBJIiwic2ltcyIsInNob3dQcm9ncmVzc0JhciIsInNpbSIsImRpciIsImZpbGVQYXRoIiwiYXBpIiwidGVtcG9yYXJ5IiwicHJvcG9zZWRBUElzIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJzaG93TWVzc2FnZXNGcm9tU2ltIiwib3B0aW9ucyIsImRlbHRhIiwiY29tcGFyZUJyZWFraW5nQVBJQ2hhbmdlcyIsImZvcndhcmRUb1BlcmVubmlhbEdydW50IiwiYXJndiIsInNsaWNlIiwiYXJnc1N0cmluZyIsIm1hcCIsImFyZyIsInNwYXduZWQiLCJwbGF0Zm9ybSIsImRlYnVnIiwic3RkaW4iLCJwaXBlIiwiRXJyb3IiLCJBcnJheSIsImlzQXJyYXkiXSwic291cmNlcyI6WyJHcnVudGZpbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR3J1bnQgY29uZmlndXJhdGlvbiBmaWxlIGZvciBQaEVUIHByb2plY3RzLiBJbiBnZW5lcmFsIHdoZW4gcG9zc2libGUsIG1vZHVsZXMgYXJlIGltcG9ydGVkIGxhemlseSBpbiB0aGVpciB0YXNrXHJcbiAqIGRlY2xhcmF0aW9uIHRvIHNhdmUgb24gb3ZlcmFsbCBsb2FkIHRpbWUgb2YgdGhpcyBmaWxlLiBUaGUgcGF0dGVybiBpcyB0byByZXF1aXJlIGFsbCBtb2R1bGVzIG5lZWRlZCBhdCB0aGUgdG9wIG9mIHRoZVxyXG4gKiBncnVudCB0YXNrIHJlZ2lzdHJhdGlvbi4gSWYgYSBtb2R1bGUgaXMgdXNlZCBpbiBtdWx0aXBsZSB0YXNrcywgaXQgaXMgYmVzdCB0byBsYXppbHkgcmVxdWlyZSBpbiBlYWNoXHJcbiAqIHRhc2suXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8gTk9URTogdG8gaW1wcm92ZSBwZXJmb3JtYW5jZSwgdGhlIHZhc3QgbWFqb3JpdHkgb2YgbW9kdWxlcyBhcmUgbGF6aWx5IGltcG9ydGVkIGluIHRhc2sgcmVnaXN0cmF0aW9ucy4gRXZlbiBkdXBsaWNhdGluZ1xyXG4vLyByZXF1aXJlIHN0YXRlbWVudHMgaW1wcm92ZXMgdGhlIGxvYWQgdGltZSBvZiB0aGlzIGZpbGUgbm90aWNlYWJseS4gRm9yIGRldGFpbHMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTEwN1xyXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xyXG5yZXF1aXJlKCAnLi9jaGVja05vZGVWZXJzaW9uJyApO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbi8vIEFsbG93IG90aGVyIEdydW50ZmlsZXMgdG8gcG90ZW50aWFsbHkgaGFuZGxlIGV4aXRpbmcgYW5kIGVycm9ycyBkaWZmZXJlbnRseWBcclxuaWYgKCAhZ2xvYmFsLnByb2Nlc3NFdmVudE9wdE91dCApIHtcclxuXHJcbi8vIFNlZSBodHRwczovL21lZGl1bS5jb20vQGR0aW50aC9tYWtpbmctdW5oYW5kbGVkLXByb21pc2UtcmVqZWN0aW9ucy1jcmFzaC10aGUtbm9kZS1qcy1wcm9jZXNzLWZmYzI3Y2ZjYzlkZCBmb3IgaG93XHJcbi8vIHRvIGdldCB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb25zIHRvIGZhaWwgb3V0IHRoZSBub2RlIHByb2Nlc3MuXHJcbi8vIFJlbGV2YW50IGZvciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvd2F2ZS1pbnRlcmZlcmVuY2UvaXNzdWVzLzQ5MVxyXG4gIHByb2Nlc3Mub24oICd1bmhhbmRsZWRSZWplY3Rpb24nLCB1cCA9PiB7IHRocm93IHVwOyB9ICk7XHJcblxyXG4vLyBFeGl0IG9uIEN0cmwgKyBDIGNhc2VcclxuICBwcm9jZXNzLm9uKCAnU0lHSU5UJywgKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coICdcXG5cXG5DYXVnaHQgaW50ZXJydXB0IHNpZ25hbCwgZXhpdGluZycgKTtcclxuICAgIHByb2Nlc3MuZXhpdCgpO1xyXG4gIH0gKTtcclxufVxyXG5cclxuY29uc3QgVHJhbnNwaWxlciA9IHJlcXVpcmUoICcuLi9jb21tb24vVHJhbnNwaWxlcicgKTtcclxuY29uc3QgdHJhbnNwaWxlciA9IG5ldyBUcmFuc3BpbGVyKCB7IHNpbGVudDogdHJ1ZSB9ICk7XHJcblxyXG4vLyBPbiB0aGUgYnVpbGQgc2VydmVyLCBvciBpZiBhIGRldmVsb3BlciB3YW50cyB0byBydW4gYSBidWlsZCB3aXRob3V0IHJ1bm5pbmcgYSB0cmFuc3BpbGUgd2F0Y2ggcHJvY2VzcyxcclxuLy8gd2UgaGF2ZSB0byB0cmFuc3BpbGUgYW55IGRlcGVuZGVuY2llcyBydW4gdGhyb3VnaCB3cmFwUGhldEJ1aWxkU2NyaXB0XHJcbi8vIFRPRE86IFdoYXQgaWYgVHlwZVNjcmlwdCBjb2RlIGltcG9ydHMgb3RoZXIgcmVwb3M/IFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTI3MlxyXG50cmFuc3BpbGVyLnRyYW5zcGlsZVJlcG8oICdjaGlwcGVyJyApO1xyXG50cmFuc3BpbGVyLnRyYW5zcGlsZVJlcG8oICdwaGV0LWNvcmUnICk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBncnVudCApIHtcclxuICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gZ3J1bnQuZmlsZS5yZWFkSlNPTiggJ3BhY2thZ2UuanNvbicgKTtcclxuXHJcbiAgLy8gSGFuZGxlIHRoZSBsYWNrIG9mIGJ1aWxkLmpzb25cclxuICBsZXQgYnVpbGRMb2NhbDtcclxuICB0cnkge1xyXG4gICAgYnVpbGRMb2NhbCA9IGdydW50LmZpbGUucmVhZEpTT04oIGAke3Byb2Nlc3MuZW52LkhPTUV9Ly5waGV0L2J1aWxkLWxvY2FsLmpzb25gICk7XHJcbiAgfVxyXG4gIGNhdGNoKCBlICkge1xyXG4gICAgYnVpbGRMb2NhbCA9IHt9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcmVwbyA9IGdydW50Lm9wdGlvbiggJ3JlcG8nICkgfHwgcGFja2FnZU9iamVjdC5uYW1lO1xyXG4gIGFzc2VydCggdHlwZW9mIHJlcG8gPT09ICdzdHJpbmcnICYmIC9eW2Etel0rKC1bYS16XSspKiQvdS50ZXN0KCByZXBvICksICdyZXBvIG5hbWUgc2hvdWxkIGJlIGNvbXBvc2VkIG9mIGxvd2VyLWNhc2UgY2hhcmFjdGVycywgb3B0aW9uYWxseSB3aXRoIGRhc2hlcyB1c2VkIGFzIHNlcGFyYXRvcnMnICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFdyYXBzIGEgcHJvbWlzZSdzIGNvbXBsZXRpb24gd2l0aCBncnVudCdzIGFzeW5jaHJvbm91cyBoYW5kbGluZywgd2l0aCBhZGRlZCBoZWxwZnVsIGZhaWx1cmUgbWVzc2FnZXMgKGluY2x1ZGluZ1xyXG4gICAqIHN0YWNrIHRyYWNlcywgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIC0tc3RhY2sgd2FzIHByb3ZpZGVkKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1Byb21pc2V9IHByb21pc2VcclxuICAgKi9cclxuICBhc3luYyBmdW5jdGlvbiB3cmFwKCBwcm9taXNlICkge1xyXG4gICAgY29uc3QgZG9uZSA9IGdydW50LnRhc2suY3VycmVudC5hc3luYygpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IHByb21pc2U7XHJcbiAgICB9XHJcbiAgICBjYXRjaCggZSApIHtcclxuICAgICAgaWYgKCBlLnN0YWNrICkge1xyXG4gICAgICAgIGdydW50LmZhaWwuZmF0YWwoIGBQZXJlbm5pYWwgdGFzayBmYWlsZWQ6XFxuJHtlLnN0YWNrfVxcbkZ1bGwgRXJyb3IgZGV0YWlsczpcXG4ke2V9YCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRoZSB0b1N0cmluZyBjaGVjayBoYW5kbGVzIGEgd2VpcmQgY2FzZSBmb3VuZCBmcm9tIGFuIEVycm9yIG9iamVjdCBmcm9tIHB1cHBldGVlciB0aGF0IGRvZXNuJ3Qgc3RyaW5naWZ5IHdpdGhcclxuICAgICAgLy8gSlNPTiBvciBoYXZlIGEgc3RhY2ssIEpTT04uc3RyaW5naWZpZXMgdG8gXCJ7fVwiLCBidXQgaGFzIGEgYHRvU3RyaW5nYCBtZXRob2RcclxuICAgICAgZWxzZSBpZiAoIHR5cGVvZiBlID09PSAnc3RyaW5nJyB8fCAoIEpTT04uc3RyaW5naWZ5KCBlICkubGVuZ3RoID09PSAyICYmIGUudG9TdHJpbmcgKSApIHtcclxuICAgICAgICBncnVudC5mYWlsLmZhdGFsKCBgUGVyZW5uaWFsIHRhc2sgZmFpbGVkOiAke2V9YCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGdydW50LmZhaWwuZmF0YWwoIGBQZXJlbm5pYWwgdGFzayBmYWlsZWQgd2l0aCB1bmtub3duIGVycm9yOiAke0pTT04uc3RyaW5naWZ5KCBlLCBudWxsLCAyICl9YCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG9uZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV3JhcHMgYW4gYXN5bmMgZnVuY3Rpb24gZm9yIGEgZ3J1bnQgdGFzay4gV2lsbCBydW4gdGhlIGFzeW5jIGZ1bmN0aW9uIHdoZW4gdGhlIHRhc2sgc2hvdWxkIGJlIGV4ZWN1dGVkLiBXaWxsXHJcbiAgICogcHJvcGVybHkgaGFuZGxlIGdydW50J3MgYXN5bmMgaGFuZGxpbmcsIGFuZCBwcm92aWRlcyBpbXByb3ZlZCBlcnJvciByZXBvcnRpbmcuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHthc3luYyBmdW5jdGlvbn0gYXN5bmNUYXNrRnVuY3Rpb25cclxuICAgKi9cclxuICBmdW5jdGlvbiB3cmFwVGFzayggYXN5bmNUYXNrRnVuY3Rpb24gKSB7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICB3cmFwKCBhc3luY1Rhc2tGdW5jdGlvbigpICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZ3J1bnQucmVnaXN0ZXJUYXNrKCAnZGVmYXVsdCcsICdCdWlsZHMgdGhlIHJlcG9zaXRvcnknLCBbXHJcbiAgICAuLi4oIGdydW50Lm9wdGlvbiggJ2xpbnQnICkgPT09IGZhbHNlID8gW10gOiBbICdsaW50LWFsbCcgXSApLFxyXG4gICAgLi4uKCBncnVudC5vcHRpb24oICdyZXBvcnQtbWVkaWEnICkgPT09IGZhbHNlID8gW10gOiBbICdyZXBvcnQtbWVkaWEnIF0gKSxcclxuICAgICdjbGVhbicsXHJcbiAgICAnYnVpbGQnXHJcbiAgXSApO1xyXG5cclxuICBjb25zdCB3cmFwUGhldEJ1aWxkU2NyaXB0ID0gc3RyaW5nID0+IHtcclxuICAgIGNvbnN0IGFyZ3MgPSBzdHJpbmcuc3BsaXQoICcgJyApO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkX3Byb2Nlc3MgPSByZXF1aXJlKCAnY2hpbGRfcHJvY2VzcycgKTtcclxuXHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBjb25zdCBkb25lID0gZ3J1bnQudGFzay5jdXJyZW50LmFzeW5jKCk7XHJcblxyXG4gICAgICBjb25zdCBwID0gY2hpbGRfcHJvY2Vzcy5zcGF3biggJ25vZGUnLCBbICcuLi9jaGlwcGVyL2Rpc3QvanMvY2hpcHBlci9qcy9waGV0LWJ1aWxkLXNjcmlwdC9waGV0LWJ1aWxkLXNjcmlwdC5tanMnLCAuLi5hcmdzIF0sIHtcclxuICAgICAgICBjd2Q6IHByb2Nlc3MuY3dkKClcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgcC5vbiggJ2Vycm9yJywgZXJyb3IgPT4ge1xyXG4gICAgICAgIGdydW50LmZhaWwuZmF0YWwoIGBQZXJlbm5pYWwgdGFzayBmYWlsZWQ6ICR7ZXJyb3J9YCApO1xyXG4gICAgICAgIGRvbmUoKTtcclxuICAgICAgfSApO1xyXG4gICAgICBwLnN0ZGVyci5vbiggJ2RhdGEnLCBkYXRhID0+IGNvbnNvbGUubG9nKCBTdHJpbmcoIGRhdGEgKSApICk7XHJcbiAgICAgIHAuc3Rkb3V0Lm9uKCAnZGF0YScsIGRhdGEgPT4gY29uc29sZS5sb2coIFN0cmluZyggZGF0YSApICkgKTtcclxuICAgICAgcC5vbiggJ2Nsb3NlJywgY29kZSA9PiB7XHJcbiAgICAgICAgaWYgKCBjb2RlICE9PSAwICkge1xyXG4gICAgICAgICAgZ3J1bnQuZmFpbC5mYXRhbCggYFBlcmVubmlhbCB0YXNrIGZhaWxlZCB3aXRoIGNvZGU6ICR7Y29kZX1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvbmUoKTtcclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICBncnVudC5yZWdpc3RlclRhc2soICdjbGVhbicsXHJcbiAgICAnRXJhc2VzIHRoZSBidWlsZC8gZGlyZWN0b3J5IGFuZCBhbGwgaXRzIGNvbnRlbnRzLCBhbmQgcmVjcmVhdGVzIHRoZSBidWlsZC8gZGlyZWN0b3J5JyxcclxuICAgIHdyYXBQaGV0QnVpbGRTY3JpcHQoIGBjbGVhbiAtLXJlcG89JHtyZXBvfWAgKVxyXG4gICk7XHJcblxyXG4gIGdydW50LnJlZ2lzdGVyVGFzayggJ2J1aWxkLWltYWdlcycsXHJcbiAgICAnQnVpbGQgaW1hZ2VzIG9ubHknLFxyXG4gICAgd3JhcFRhc2soIGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgamltcCA9IHJlcXVpcmUoICdqaW1wJyApO1xyXG4gICAgICBjb25zdCBnZW5lcmF0ZVRodW1ibmFpbHMgPSByZXF1aXJlKCAnLi9nZW5lcmF0ZVRodW1ibmFpbHMnICk7XHJcbiAgICAgIGNvbnN0IGdlbmVyYXRlVHdpdHRlckNhcmQgPSByZXF1aXJlKCAnLi9nZW5lcmF0ZVR3aXR0ZXJDYXJkJyApO1xyXG5cclxuICAgICAgY29uc3QgYnJhbmQgPSAncGhldCc7XHJcbiAgICAgIGdydW50LmxvZy53cml0ZWxuKCBgQnVpbGRpbmcgaW1hZ2VzIGZvciBicmFuZDogJHticmFuZH1gICk7XHJcblxyXG4gICAgICBjb25zdCBidWlsZERpciA9IGAuLi8ke3JlcG99L2J1aWxkLyR7YnJhbmR9YDtcclxuICAgICAgLy8gVGh1bWJuYWlscyBhbmQgdHdpdHRlciBjYXJkXHJcbiAgICAgIGlmICggZ3J1bnQuZmlsZS5leGlzdHMoIGAuLi8ke3JlcG99L2Fzc2V0cy8ke3JlcG99LXNjcmVlbnNob3QucG5nYCApICkge1xyXG4gICAgICAgIGNvbnN0IHRodW1ibmFpbFNpemVzID0gW1xyXG4gICAgICAgICAgeyB3aWR0aDogOTAwLCBoZWlnaHQ6IDU5MSB9LFxyXG4gICAgICAgICAgeyB3aWR0aDogNjAwLCBoZWlnaHQ6IDM5NCB9LFxyXG4gICAgICAgICAgeyB3aWR0aDogNDIwLCBoZWlnaHQ6IDI3NiB9LFxyXG4gICAgICAgICAgeyB3aWR0aDogMTI4LCBoZWlnaHQ6IDg0IH0sXHJcbiAgICAgICAgICB7IHdpZHRoOiAxNSwgaGVpZ2h0OiAxMCB9XHJcbiAgICAgICAgXTtcclxuICAgICAgICBmb3IgKCBjb25zdCBzaXplIG9mIHRodW1ibmFpbFNpemVzICkge1xyXG4gICAgICAgICAgZ3J1bnQuZmlsZS53cml0ZSggYCR7YnVpbGREaXJ9LyR7cmVwb30tJHtzaXplLndpZHRofS5wbmdgLCBhd2FpdCBnZW5lcmF0ZVRodW1ibmFpbHMoIHJlcG8sIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0LCAxMDAsIGppbXAuTUlNRV9QTkcgKSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYWx0U2NyZWVuc2hvdHMgPSBncnVudC5maWxlLmV4cGFuZCggeyBmaWx0ZXI6ICdpc0ZpbGUnLCBjd2Q6IGAuLi8ke3JlcG99L2Fzc2V0c2AgfSwgWyBgLi8ke3JlcG99LXNjcmVlbnNob3QtYWx0WzAxMjM0NTY3ODldLnBuZ2AgXSApO1xyXG4gICAgICAgIGZvciAoIGNvbnN0IGFsdFNjcmVlbnNob3Qgb2YgYWx0U2NyZWVuc2hvdHMgKSB7XHJcbiAgICAgICAgICBjb25zdCBpbWFnZU51bWJlciA9IE51bWJlciggYWx0U2NyZWVuc2hvdC5zdWJzdHIoIGAuLyR7cmVwb30tc2NyZWVuc2hvdC1hbHRgLmxlbmd0aCwgMSApICk7XHJcbiAgICAgICAgICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn0vJHtyZXBvfS0kezYwMH0tYWx0JHtpbWFnZU51bWJlcn0ucG5nYCwgYXdhaXQgZ2VuZXJhdGVUaHVtYm5haWxzKCByZXBvLCA2MDAsIDM5NCwgMTAwLCBqaW1wLk1JTUVfUE5HLCBgLWFsdCR7aW1hZ2VOdW1iZXJ9YCApICk7XHJcbiAgICAgICAgICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn0vJHtyZXBvfS0kezkwMH0tYWx0JHtpbWFnZU51bWJlcn0ucG5nYCwgYXdhaXQgZ2VuZXJhdGVUaHVtYm5haWxzKCByZXBvLCA5MDAsIDU5MSwgMTAwLCBqaW1wLk1JTUVfUE5HLCBgLWFsdCR7aW1hZ2VOdW1iZXJ9YCApICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIGJyYW5kID09PSAncGhldCcgKSB7XHJcbiAgICAgICAgICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn0vJHtyZXBvfS1pb3MucG5nYCwgYXdhaXQgZ2VuZXJhdGVUaHVtYm5haWxzKCByZXBvLCA0MjAsIDI3NiwgOTAsIGppbXAuTUlNRV9KUEVHICkgKTtcclxuICAgICAgICAgIGdydW50LmZpbGUud3JpdGUoIGAke2J1aWxkRGlyfS8ke3JlcG99LXR3aXR0ZXItY2FyZC5wbmdgLCBhd2FpdCBnZW5lcmF0ZVR3aXR0ZXJDYXJkKCByZXBvICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKSApO1xyXG5cclxuICBncnVudC5yZWdpc3RlclRhc2soICdvdXRwdXQtanMnLCAnT3V0cHV0cyBKUyBqdXN0IGZvciB0aGUgc3BlY2lmaWVkIHJlcG8nLFxyXG4gICAgd3JhcFRhc2soIGFzeW5jICgpID0+IHtcclxuICAgICAgdHJhbnNwaWxlci50cmFuc3BpbGVSZXBvKCByZXBvICk7XHJcbiAgICB9IClcclxuICApO1xyXG4gIGdydW50LnJlZ2lzdGVyVGFzayggJ291dHB1dC1qcy1wcm9qZWN0JywgJ091dHB1dHMgSlMgZm9yIHRoZSBzcGVjaWZpZWQgcmVwbyBhbmQgaXRzIGRlcGVuZGVuY2llcycsXHJcbiAgICB3cmFwVGFzayggYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBnZXRQaGV0TGlicyA9IHJlcXVpcmUoICcuL2dldFBoZXRMaWJzJyApO1xyXG5cclxuICAgICAgdHJhbnNwaWxlci50cmFuc3BpbGVSZXBvcyggZ2V0UGhldExpYnMoIHJlcG8gKSApO1xyXG4gICAgfSApXHJcbiAgKTtcclxuXHJcbiAgZ3J1bnQucmVnaXN0ZXJUYXNrKCAnb3V0cHV0LWpzLWFsbCcsICdPdXRwdXRzIEpTIGZvciBhbGwgcmVwb3MnLFxyXG4gICAgd3JhcFRhc2soIGFzeW5jICgpID0+IHtcclxuICAgICAgdHJhbnNwaWxlci50cmFuc3BpbGVBbGwoKTtcclxuICAgIH0gKVxyXG4gICk7XHJcblxyXG4gIGdydW50LnJlZ2lzdGVyVGFzayggJ2J1aWxkJyxcclxuICAgIGBCdWlsZHMgdGhlIHJlcG9zaXRvcnkuIERlcGVuZGluZyBvbiB0aGUgcmVwb3NpdG9yeSB0eXBlIChydW5uYWJsZS93cmFwcGVyL3N0YW5kYWxvbmUpLCB0aGUgcmVzdWx0IG1heSB2YXJ5LlxyXG4gLS1taW5pZnkuYmFiZWxUcmFuc3BpbGU9ZmFsc2UgLSBEaXNhYmxlcyBiYWJlbCB0cmFuc3BpbGF0aW9uIHBoYXNlLlxyXG4gLS1taW5pZnkudWdsaWZ5PWZhbHNlIC0gRGlzYWJsZXMgdWdsaWZpY2F0aW9uLCBzbyB0aGUgYnVpbHQgZmlsZSB3aWxsIGluY2x1ZGUgKGVzc2VudGlhbGx5KSBjb25jYXRlbmF0ZWQgc291cmNlIGZpbGVzLlxyXG4gLS1taW5pZnkubWFuZ2xlPWZhbHNlIC0gRHVyaW5nIHVnbGlmaWNhdGlvbiwgaXQgd2lsbCBub3QgXCJtYW5nbGVcIiB2YXJpYWJsZSBuYW1lcyAod2hlcmUgdGhleSBnZXQgcmVuYW1lZCB0byBzaG9ydCBjb25zdGFudHMgdG8gcmVkdWNlIGZpbGUgc2l6ZS4pXHJcbiAtLW1pbmlmeS5iZWF1dGlmeT10cnVlIC0gQWZ0ZXIgdWdsaWZpY2F0aW9uLCB0aGUgc291cmNlIGNvZGUgd2lsbCBiZSBzeW50YXggZm9ybWF0dGVkIG5pY2VseVxyXG4gLS1taW5pZnkuc3RyaXBBc3NlcnRpb25zPWZhbHNlIC0gRHVyaW5nIHVnbGlmaWNhdGlvbiwgaXQgd2lsbCBzdHJpcCBhc3NlcnRpb25zLlxyXG4gLS1taW5pZnkuc3RyaXBMb2dnaW5nPWZhbHNlIC0gRHVyaW5nIHVnbGlmaWNhdGlvbiwgaXQgd2lsbCBub3Qgc3RyaXAgbG9nZ2luZyBzdGF0ZW1lbnRzLlxyXG4gUnVubmFibGUgYnVpbGQgb3B0aW9uczpcclxuIC0tcmVwb3J0LW1lZGlhIC0gV2lsbCBpdGVyYXRlIG92ZXIgYWxsIG9mIHRoZSBsaWNlbnNlLmpzb24gZmlsZXMgYW5kIHJlcG9ydHMgYW55IG1lZGlhIGZpbGVzXHJcbiAtLWJyYW5kcz17e0JSQU5EU30gLSBDYW4gYmUgKiAoYnVpbGQgYWxsIHN1cHBvcnRlZCBicmFuZHMpLCBvciBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIGJyYW5kIG5hbWVzLiBXaWxsIGZhbGwgYmFjayB0byB1c2luZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgYnVpbGQtbG9jYWwuanNvbidzIGJyYW5kcyAob3IgYWRhcHRlZC1mcm9tLXBoZXQgaWYgdGhhdCBkb2VzIG5vdCBleGlzdClcclxuIC0tYWxsSFRNTCAtIElmIHByb3ZpZGVkLCB3aWxsIGluY2x1ZGUgdGhlIF9hbGwuaHRtbCBmaWxlIChpZiBpdCB3b3VsZCBub3Qgb3RoZXJ3aXNlIGJlIGJ1aWx0LCBlLmcuIHBoZXQgYnJhbmQpXHJcbiAtLVhIVE1MIC0gSW5jbHVkZXMgYW4geGh0bWwvIGRpcmVjdG9yeSBpbiB0aGUgYnVpbGQgb3V0cHV0IHRoYXQgY29udGFpbnMgYSBydW5uYWJsZSBYSFRNTCBmb3JtIG9mIHRoZSBzaW0gKHdpdGhcclxuICAgICAgICAgICBhIHNlcGFyYXRlZC1vdXQgSlMgZmlsZSkuXHJcbiAtLWxvY2FsZXM9e3tMT0NBTEVTfX0gLSBDYW4gYmUgKiAoYnVpbGQgYWxsIGF2YWlsYWJsZSBsb2NhbGVzLCBcImVuXCIgYW5kIGV2ZXJ5dGhpbmcgaW4gYmFiZWwpLCBvciBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIGxvY2FsZXNgLFxyXG4gICAgd3JhcFRhc2soIGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgYnVpbGRTdGFuZGFsb25lID0gcmVxdWlyZSggJy4vYnVpbGRTdGFuZGFsb25lJyApO1xyXG4gICAgICBjb25zdCBidWlsZFJ1bm5hYmxlID0gcmVxdWlyZSggJy4vYnVpbGRSdW5uYWJsZScgKTtcclxuICAgICAgY29uc3QgbWluaWZ5ID0gcmVxdWlyZSggJy4vbWluaWZ5JyApO1xyXG4gICAgICBjb25zdCB0c2MgPSByZXF1aXJlKCAnLi90c2MnICk7XHJcbiAgICAgIGNvbnN0IHJlcG9ydFRzY1Jlc3VsdHMgPSByZXF1aXJlKCAnLi9yZXBvcnRUc2NSZXN1bHRzJyApO1xyXG4gICAgICBjb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XHJcbiAgICAgIGNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xyXG4gICAgICBjb25zdCBnZXRQaGV0TGlicyA9IHJlcXVpcmUoICcuL2dldFBoZXRMaWJzJyApO1xyXG4gICAgICBjb25zdCBwaGV0VGltaW5nTG9nID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vcGhldFRpbWluZ0xvZycgKTtcclxuXHJcbiAgICAgIGF3YWl0IHBoZXRUaW1pbmdMb2cuc3RhcnRBc3luYyggJ2dydW50LWJ1aWxkJywgYXN5bmMgKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBQYXJzZSBtaW5pZmljYXRpb24ga2V5c1xyXG4gICAgICAgIGNvbnN0IG1pbmlmeUtleXMgPSBPYmplY3Qua2V5cyggbWluaWZ5Lk1JTklGWV9ERUZBVUxUUyApO1xyXG4gICAgICAgIGNvbnN0IG1pbmlmeU9wdGlvbnMgPSB7fTtcclxuICAgICAgICBtaW5pZnlLZXlzLmZvckVhY2goIG1pbmlmeUtleSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBvcHRpb24gPSBncnVudC5vcHRpb24oIGBtaW5pZnkuJHttaW5pZnlLZXl9YCApO1xyXG4gICAgICAgICAgaWYgKCBvcHRpb24gPT09IHRydWUgfHwgb3B0aW9uID09PSBmYWxzZSApIHtcclxuICAgICAgICAgICAgbWluaWZ5T3B0aW9uc1sgbWluaWZ5S2V5IF0gPSBvcHRpb247XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBjb25zdCByZXBvUGFja2FnZU9iamVjdCA9IGdydW50LmZpbGUucmVhZEpTT04oIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAgKTtcclxuXHJcbiAgICAgICAgLy8gUnVuIHRoZSB0eXBlIGNoZWNrZXIgZmlyc3QuXHJcbiAgICAgICAgY29uc3QgYnJhbmRzID0gZ2V0QnJhbmRzKCBncnVudCwgcmVwbywgYnVpbGRMb2NhbCApO1xyXG5cclxuICAgICAgICBhd2FpdCBwaGV0VGltaW5nTG9nLnN0YXJ0QXN5bmMoICd0c2MnLCBhc3luYyAoKSA9PiB7XHJcblxyXG4gICAgICAgICAgLy8gV2UgbXVzdCBoYXZlIHBoZXQtaW8gY29kZSBjaGVja2VkIG91dCB0byB0eXBlIGNoZWNrLCBzaW5jZSBzaW1MYXVuY2hlciBpbXBvcnRzIHBoZXRpb0VuZ2luZVxyXG4gICAgICAgICAgaWYgKCBicmFuZHMuaW5jbHVkZXMoICdwaGV0LWlvJyApIHx8IGJyYW5kcy5pbmNsdWRlcyggJ3BoZXQnICkgKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0c2MoIGAuLi8ke3JlcG99YCApO1xyXG4gICAgICAgICAgICByZXBvcnRUc2NSZXN1bHRzKCByZXN1bHRzLCBncnVudCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGdydW50LmxvZy53cml0ZWxuKCAnc2tpcHBpbmcgdHlwZSBjaGVja2luZycgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIGF3YWl0IHBoZXRUaW1pbmdMb2cuc3RhcnRBc3luYyggJ3RyYW5zcGlsZScsICgpID0+IHtcclxuXHJcbiAgICAgICAgICAvLyBJZiB0aGF0IHN1Y2NlZWRzLCB0aGVuIGNvbnZlcnQgdGhlIGNvZGUgdG8gSlNcclxuICAgICAgICAgIHRyYW5zcGlsZXIudHJhbnNwaWxlUmVwb3MoIGdldFBoZXRMaWJzKCByZXBvICkgKTtcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIHN0YW5kYWxvbmVcclxuICAgICAgICBpZiAoIHJlcG9QYWNrYWdlT2JqZWN0LnBoZXQuYnVpbGRTdGFuZGFsb25lICkge1xyXG4gICAgICAgICAgZ3J1bnQubG9nLndyaXRlbG4oICdCdWlsZGluZyBzdGFuZGFsb25lIHJlcG9zaXRvcnknICk7XHJcblxyXG4gICAgICAgICAgY29uc3QgcGFyZW50RGlyID0gYC4uLyR7cmVwb30vYnVpbGQvYDtcclxuICAgICAgICAgIGlmICggIWZzLmV4aXN0c1N5bmMoIHBhcmVudERpciApICkge1xyXG4gICAgICAgICAgICBmcy5ta2RpclN5bmMoIHBhcmVudERpciApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoIGAke3BhcmVudERpcn0vJHtyZXBvfS5taW4uanNgLCBhd2FpdCBidWlsZFN0YW5kYWxvbmUoIHJlcG8sIG1pbmlmeU9wdGlvbnMgKSApO1xyXG5cclxuICAgICAgICAgIC8vIEJ1aWxkIGEgZGVidWcgdmVyc2lvblxyXG4gICAgICAgICAgbWluaWZ5T3B0aW9ucy5taW5pZnkgPSBmYWxzZTtcclxuICAgICAgICAgIG1pbmlmeU9wdGlvbnMuYmFiZWxUcmFuc3BpbGUgPSBmYWxzZTtcclxuICAgICAgICAgIG1pbmlmeU9wdGlvbnMudWdsaWZ5ID0gZmFsc2U7XHJcbiAgICAgICAgICBtaW5pZnlPcHRpb25zLmlzRGVidWcgPSB0cnVlO1xyXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyggYCR7cGFyZW50RGlyfS8ke3JlcG99LmRlYnVnLmpzYCwgYXdhaXQgYnVpbGRTdGFuZGFsb25lKCByZXBvLCBtaW5pZnlPcHRpb25zLCB0cnVlICkgKTtcclxuXHJcbiAgICAgICAgICBpZiAoIHJlcG9QYWNrYWdlT2JqZWN0LnBoZXQuc3RhbmRhbG9uZVRyYW5zcGlsZXMgKSB7XHJcbiAgICAgICAgICAgIGZvciAoIGNvbnN0IGZpbGUgb2YgcmVwb1BhY2thZ2VPYmplY3QucGhldC5zdGFuZGFsb25lVHJhbnNwaWxlcyApIHtcclxuICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKCBgLi4vJHtyZXBvfS9idWlsZC8ke3BhdGguYmFzZW5hbWUoIGZpbGUgKX1gLCBtaW5pZnkoIGdydW50LmZpbGUucmVhZCggZmlsZSApICkgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICBjb25zdCBsb2NhbFBhY2thZ2VPYmplY3QgPSBncnVudC5maWxlLnJlYWRKU09OKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gICk7XHJcbiAgICAgICAgICBhc3NlcnQoIGxvY2FsUGFja2FnZU9iamVjdC5waGV0LnJ1bm5hYmxlLCBgJHtyZXBvfSBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgcnVubmFibGVgICk7XHJcbiAgICAgICAgICBncnVudC5sb2cud3JpdGVsbiggYEJ1aWxkaW5nIHJ1bm5hYmxlIHJlcG9zaXRvcnkgKCR7cmVwb30sIGJyYW5kczogJHticmFuZHMuam9pbiggJywgJyApfSlgICk7XHJcblxyXG4gICAgICAgICAgLy8gT3RoZXIgb3B0aW9uc1xyXG4gICAgICAgICAgY29uc3QgYWxsSFRNTCA9ICEhZ3J1bnQub3B0aW9uKCAnYWxsSFRNTCcgKTtcclxuICAgICAgICAgIGNvbnN0IGxvY2FsZXNPcHRpb24gPSBncnVudC5vcHRpb24oICdsb2NhbGVzJyApIHx8ICdlbic7IC8vIERlZmF1bHQgYmFjayB0byBFbmdsaXNoIGZvciBub3dcclxuXHJcbiAgICAgICAgICBmb3IgKCBjb25zdCBicmFuZCBvZiBicmFuZHMgKSB7XHJcbiAgICAgICAgICAgIGdydW50LmxvZy53cml0ZWxuKCBgQnVpbGRpbmcgYnJhbmQ6ICR7YnJhbmR9YCApO1xyXG5cclxuICAgICAgICAgICAgYXdhaXQgcGhldFRpbWluZ0xvZy5zdGFydEFzeW5jKCAnYnVpbGQtYnJhbmQtJyArIGJyYW5kLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgYXdhaXQgYnVpbGRSdW5uYWJsZSggcmVwbywgbWluaWZ5T3B0aW9ucywgYWxsSFRNTCwgYnJhbmQsIGxvY2FsZXNPcHRpb24sIGJ1aWxkTG9jYWwgKTtcclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApXHJcbiAgKTtcclxuXHJcbiAgZ3J1bnQucmVnaXN0ZXJUYXNrKCAnZ2VuZXJhdGUtdXNlZC1zdHJpbmdzLWZpbGUnLFxyXG4gICAgJ1dyaXRlcyB1c2VkIHN0cmluZ3MgdG8gcGhldC1pby1zaW0tc3BlY2lmaWMvIHNvIHRoYXQgUGhFVC1pTyBzaW1zIG9ubHkgb3V0cHV0IHJlbGV2YW50IHN0cmluZ3MgdG8gdGhlIEFQSSBpbiB1bmJ1aWx0IG1vZGUnLFxyXG4gICAgd3JhcFRhc2soIGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgZ2V0UGhldExpYnMgPSByZXF1aXJlKCAnLi9nZXRQaGV0TGlicycgKTtcclxuICAgICAgY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XHJcbiAgICAgIGNvbnN0IHdlYnBhY2tCdWlsZCA9IHJlcXVpcmUoICcuL3dlYnBhY2tCdWlsZCcgKTtcclxuICAgICAgY29uc3QgQ2hpcHBlckNvbnN0YW50cyA9IHJlcXVpcmUoICcuLi9jb21tb24vQ2hpcHBlckNvbnN0YW50cycgKTtcclxuICAgICAgY29uc3QgZ2V0TG9jYWxlc0Zyb21SZXBvc2l0b3J5ID0gcmVxdWlyZSggJy4vZ2V0TG9jYWxlc0Zyb21SZXBvc2l0b3J5JyApO1xyXG4gICAgICBjb25zdCBnZXRTdHJpbmdNYXAgPSByZXF1aXJlKCAnLi9nZXRTdHJpbmdNYXAnICk7XHJcblxyXG4gICAgICB0cmFuc3BpbGVyLnRyYW5zcGlsZVJlcG9zKCBnZXRQaGV0TGlicyggcmVwbyApICk7XHJcbiAgICAgIGNvbnN0IHdlYnBhY2tSZXN1bHQgPSBhd2FpdCB3ZWJwYWNrQnVpbGQoIHJlcG8sICdwaGV0JyApO1xyXG5cclxuICAgICAgY29uc3QgcGhldExpYnMgPSBnZXRQaGV0TGlicyggcmVwbywgJ3BoZXQnICk7XHJcbiAgICAgIGNvbnN0IGFsbExvY2FsZXMgPSBbIENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFLCAuLi5nZXRMb2NhbGVzRnJvbVJlcG9zaXRvcnkoIHJlcG8gKSBdO1xyXG4gICAgICBjb25zdCB7IHN0cmluZ01hcCB9ID0gZ2V0U3RyaW5nTWFwKCByZXBvLCBhbGxMb2NhbGVzLCBwaGV0TGlicywgd2VicGFja1Jlc3VsdC51c2VkTW9kdWxlcyApO1xyXG5cclxuICAgICAgLy8gVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE4NzcgVGhpcyBpcyBvbmx5IHBlcnRpbmVudCBmb3IgcGhldC1pbywgc28gSSdtIG91dHB1dHRpbmdcclxuICAgICAgLy8gaXQgdG8gcGhldC1pby1zaW0tc3BlY2lmaWMuICBCdXQgbm9uZSBvZiBpbnRyaW5zaWMgZGF0YSBpcyBwaGV0LWlvLXNwZWNpZmljLlxyXG4gICAgICAvLyBEbyB3ZSB3YW50IGEgZGlmZmVyZW50IHBhdGggZm9yIGl0P1xyXG4gICAgICAvLyBUT0RPOiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTg3NyBIb3cgZG8gd2UgaW5kaWNhdGUgdGhhdCBpdCBpcyBhIGJ1aWxkIGFydGlmYWN0LCBhbmRcclxuICAgICAgLy8gc2hvdWxkIG5vdCBiZSBtYW51YWxseSB1cGRhdGVkP1xyXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKCBgLi4vcGhldC1pby1zaW0tc3BlY2lmaWMvcmVwb3MvJHtyZXBvfS91c2VkLXN0cmluZ3NfZW4uanNvbmAsIEpTT04uc3RyaW5naWZ5KCBzdHJpbmdNYXAuZW4sIG51bGwsIDIgKSApO1xyXG4gICAgfSApXHJcbiAgKTtcclxuXHJcbiAgZ3J1bnQucmVnaXN0ZXJUYXNrKCAnYnVpbGQtZm9yLXNlcnZlcicsICdtZWFudCBmb3IgdXNlIGJ5IGJ1aWxkLXNlcnZlciBvbmx5JyxcclxuICAgIFsgJ2J1aWxkJyBdXHJcbiAgKTtcclxuXHJcbiAgZ3J1bnQucmVnaXN0ZXJUYXNrKCAnbGludCcsXHJcbiAgICBgbGludCBqcyBmaWxlcy4gT3B0aW9uczpcclxuLS1kaXNhYmxlLWVzbGludC1jYWNoZTogY2FjaGUgd2lsbCBub3QgYmUgcmVhZCBvciB3cml0dGVuXHJcbi0tZml4OiBhdXRvZml4YWJsZSBjaGFuZ2VzIHdpbGwgYmUgd3JpdHRlbiB0byBkaXNrXHJcbi0tZm9ybWF0OiBBcHBlbmQgYW4gYWRkaXRpb25hbCBzZXQgb2YgcnVsZXMgZm9yIGZvcm1hdHRpbmdcclxuLS1jaGlwLWF3YXk6IG91dHB1dCBhIGxpc3Qgb2YgcmVzcG9uc2libGUgZGV2cyBmb3IgZWFjaCByZXBvIHdpdGggbGludCBwcm9ibGVtc1xyXG4tLWRpc2FibGUtd2l0aC1jb21tZW50OiBhZGQgYW4gZXMtbGludCBkaXNhYmxlIHdpdGggY29tbWVudCB0byBsaW50IGVycm9yc1xyXG4tLXJlcG9zOiBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiByZXBvcyB0byBsaW50IGluIGFkZGl0aW9uIHRvIHRoZSByZXBvIGZyb20gcnVubmluZ2AsXHJcbiAgICB3cmFwVGFzayggYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBsaW50ID0gcmVxdWlyZSggJy4vbGludCcgKTtcclxuXHJcbiAgICAgIC8vIC0tZGlzYWJsZS1lc2xpbnQtY2FjaGUgZGlzYWJsZXMgdGhlIGNhY2hlLCB1c2VmdWwgZm9yIGRldmVsb3BpbmcgcnVsZXNcclxuICAgICAgY29uc3QgY2FjaGUgPSAhZ3J1bnQub3B0aW9uKCAnZGlzYWJsZS1lc2xpbnQtY2FjaGUnICk7XHJcbiAgICAgIGNvbnN0IGZpeCA9IGdydW50Lm9wdGlvbiggJ2ZpeCcgKTtcclxuICAgICAgY29uc3QgZm9ybWF0ID0gZ3J1bnQub3B0aW9uKCAnZm9ybWF0JyApO1xyXG4gICAgICBjb25zdCBjaGlwQXdheSA9IGdydW50Lm9wdGlvbiggJ2NoaXAtYXdheScgKTtcclxuICAgICAgY29uc3QgZGlzYWJsZVdpdGhDb21tZW50ID0gZ3J1bnQub3B0aW9uKCAnZGlzYWJsZS13aXRoLWNvbW1lbnQnICk7XHJcblxyXG4gICAgICBjb25zdCBleHRyYVJlcG9zID0gZ3J1bnQub3B0aW9uKCAncmVwb3MnICkgPyBncnVudC5vcHRpb24oICdyZXBvcycgKS5zcGxpdCggJywnICkgOiBbXTtcclxuXHJcbiAgICAgIGNvbnN0IGxpbnRSZXR1cm5WYWx1ZSA9IGF3YWl0IGxpbnQoIFsgcmVwbywgLi4uZXh0cmFSZXBvcyBdLCB7XHJcbiAgICAgICAgY2FjaGU6IGNhY2hlLFxyXG4gICAgICAgIGZpeDogZml4LFxyXG4gICAgICAgIGZvcm1hdDogZm9ybWF0LFxyXG4gICAgICAgIGNoaXBBd2F5OiBjaGlwQXdheSxcclxuICAgICAgICBkaXNhYmxlV2l0aENvbW1lbnQ6IGRpc2FibGVXaXRoQ29tbWVudFxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBpZiAoICFsaW50UmV0dXJuVmFsdWUub2sgKSB7XHJcbiAgICAgICAgZ3J1bnQuZmFpbC5mYXRhbCggJ0xpbnQgZmFpbGVkJyApO1xyXG4gICAgICB9XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgZ3J1bnQucmVnaXN0ZXJUYXNrKCAnbGludC1hbGwnLCAnbGludCBhbGwganMgZmlsZXMgdGhhdCBhcmUgcmVxdWlyZWQgdG8gYnVpbGQgdGhpcyByZXBvc2l0b3J5IChmb3IgdGhlIHNwZWNpZmllZCBicmFuZHMpJywgd3JhcFRhc2soIGFzeW5jICgpID0+IHtcclxuICAgIGNvbnN0IGxpbnQgPSByZXF1aXJlKCAnLi9saW50JyApO1xyXG5cclxuICAgIC8vIC0tZGlzYWJsZS1lc2xpbnQtY2FjaGUgZGlzYWJsZXMgdGhlIGNhY2hlLCB1c2VmdWwgZm9yIGRldmVsb3BpbmcgcnVsZXNcclxuICAgIGNvbnN0IGNhY2hlID0gIWdydW50Lm9wdGlvbiggJ2Rpc2FibGUtZXNsaW50LWNhY2hlJyApO1xyXG4gICAgY29uc3QgZml4ID0gZ3J1bnQub3B0aW9uKCAnZml4JyApO1xyXG4gICAgY29uc3QgZm9ybWF0ID0gZ3J1bnQub3B0aW9uKCAnZm9ybWF0JyApO1xyXG4gICAgY29uc3QgY2hpcEF3YXkgPSBncnVudC5vcHRpb24oICdjaGlwLWF3YXknICk7XHJcbiAgICBjb25zdCBkaXNhYmxlV2l0aENvbW1lbnQgPSBncnVudC5vcHRpb24oICdkaXNhYmxlLXdpdGgtY29tbWVudCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFncnVudC5vcHRpb24oICdwYXR0ZXJucycgKSwgJ3BhdHRlcm5zIG5vdCBzdXBwb3J0IGZvciBsaW50LWFsbCcgKTtcclxuXHJcbiAgICBjb25zdCBnZXRQaGV0TGlicyA9IHJlcXVpcmUoICcuL2dldFBoZXRMaWJzJyApO1xyXG5cclxuICAgIGNvbnN0IGJyYW5kcyA9IGdldEJyYW5kcyggZ3J1bnQsIHJlcG8sIGJ1aWxkTG9jYWwgKTtcclxuXHJcbiAgICBjb25zdCBsaW50UmV0dXJuVmFsdWUgPSBhd2FpdCBsaW50KCBnZXRQaGV0TGlicyggcmVwbywgYnJhbmRzICksIHtcclxuICAgICAgY2FjaGU6IGNhY2hlLFxyXG4gICAgICBmaXg6IGZpeCxcclxuICAgICAgZm9ybWF0OiBmb3JtYXQsXHJcbiAgICAgIGNoaXBBd2F5OiBjaGlwQXdheSxcclxuICAgICAgZGlzYWJsZVdpdGhDb21tZW50OiBkaXNhYmxlV2l0aENvbW1lbnRcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBPdXRwdXQgcmVzdWx0cyBvbiBlcnJvcnMuXHJcbiAgICBpZiAoICFsaW50UmV0dXJuVmFsdWUub2sgKSB7XHJcbiAgICAgIGdydW50LmZhaWwuZmF0YWwoICdMaW50IGZhaWxlZCcgKTtcclxuICAgIH1cclxuICB9ICkgKTtcclxuXHJcbiAgZ3J1bnQucmVnaXN0ZXJUYXNrKCAnZ2VuZXJhdGUtZGV2ZWxvcG1lbnQtaHRtbCcsXHJcbiAgICAnR2VuZXJhdGVzIHRvcC1sZXZlbCBTSU1fZW4uaHRtbCBmaWxlIGJhc2VkIG9uIHRoZSBwcmVsb2FkcyBpbiBwYWNrYWdlLmpzb24uJyxcclxuICAgIHdyYXBUYXNrKCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGdlbmVyYXRlRGV2ZWxvcG1lbnRIVE1MID0gcmVxdWlyZSggJy4vZ2VuZXJhdGVEZXZlbG9wbWVudEhUTUwnICk7XHJcblxyXG4gICAgICBhd2FpdCBnZW5lcmF0ZURldmVsb3BtZW50SFRNTCggcmVwbyApO1xyXG4gICAgfSApICk7XHJcblxyXG4gIGdydW50LnJlZ2lzdGVyVGFzayggJ2dlbmVyYXRlLXRlc3QtaHRtbCcsXHJcbiAgICAnR2VuZXJhdGVzIHRvcC1sZXZlbCBTSU0tdGVzdHMuaHRtbCBmaWxlIGJhc2VkIG9uIHRoZSBwcmVsb2FkcyBpbiBwYWNrYWdlLmpzb24uICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FxdWEvYmxvYi9tYXN0ZXIvZG9jL2FkZGluZy11bml0LXRlc3RzLm1kICcgK1xyXG4gICAgJ2ZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGF1dG9tYXRlZCB0ZXN0aW5nLiBVc3VhbGx5IHlvdSBzaG91bGQgJyArXHJcbiAgICAnc2V0IHRoZSBcImdlbmVyYXRlZFVuaXRUZXN0c1wiOnRydWUgZmxhZyBpbiB0aGUgc2ltIHBhY2thZ2UuanNvbiBhbmQgcnVuIGBncnVudCB1cGRhdGVgIGluc3RlYWQgb2YgbWFudWFsbHkgZ2VuZXJhdGluZyB0aGlzLicsXHJcbiAgICB3cmFwVGFzayggYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBnZW5lcmF0ZVRlc3RIVE1MID0gcmVxdWlyZSggJy4vZ2VuZXJhdGVUZXN0SFRNTCcgKTtcclxuXHJcbiAgICAgIGF3YWl0IGdlbmVyYXRlVGVzdEhUTUwoIHJlcG8gKTtcclxuICAgIH0gKSApO1xyXG5cclxuICBncnVudC5yZWdpc3RlclRhc2soICdnZW5lcmF0ZS1hMTF5LXZpZXctaHRtbCcsXHJcbiAgICAnR2VuZXJhdGVzIHRvcC1sZXZlbCBTSU0tYTExeS12aWV3Lmh0bWwgZmlsZSB1c2VkIGZvciB2aXN1YWxpemluZyBhY2Nlc3NpYmxlIGNvbnRlbnQuIFVzdWFsbHkgeW91IHNob3VsZCAnICtcclxuICAgICdzZXQgdGhlIFwicGhldC5zaW1GZWF0dXJlcy5zdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb25cIjp0cnVlIGZsYWcgaW4gdGhlIHNpbSBwYWNrYWdlLmpzb24gYW5kIHJ1biBgZ3J1bnQgdXBkYXRlYCAnICtcclxuICAgICdpbnN0ZWFkIG9mIG1hbnVhbGx5IGdlbmVyYXRpbmcgdGhpcy4nLFxyXG4gICAgd3JhcFRhc2soIGFzeW5jICgpID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IGdlbmVyYXRlQTExeVZpZXdIVE1MID0gcmVxdWlyZSggJy4vZ2VuZXJhdGVBMTF5Vmlld0hUTUwnICk7XHJcbiAgICAgIGF3YWl0IGdlbmVyYXRlQTExeVZpZXdIVE1MKCByZXBvICk7XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgZ3J1bnQucmVnaXN0ZXJUYXNrKCAndXBkYXRlJywgYFxyXG5VcGRhdGVzIHRoZSBub3JtYWwgYXV0b21hdGljYWxseS1nZW5lcmF0ZWQgZmlsZXMgZm9yIHRoaXMgcmVwb3NpdG9yeS4gSW5jbHVkZXM6XHJcbiAgKiBydW5uYWJsZXM6IGdlbmVyYXRlLWRldmVsb3BtZW50LWh0bWwgYW5kIG1vZHVsaWZ5XHJcbiAgKiBhY2Nlc3NpYmxlIHJ1bm5hYmxlczogZ2VuZXJhdGUtYTExeS12aWV3LWh0bWxcclxuICAqIHVuaXQgdGVzdHM6IGdlbmVyYXRlLXRlc3QtaHRtbFxyXG4gICogc2ltdWxhdGlvbnM6IGdlbmVyYXRlUkVBRE1FKClcclxuICAqIHBoZXQtaW8gc2ltdWxhdGlvbnM6IGdlbmVyYXRlIG92ZXJyaWRlcyBmaWxlIGlmIG5lZWRlZFxyXG4gICogY3JlYXRlIHRoZSBjb25nbG9tZXJhdGUgc3RyaW5nIGZpbGVzIGZvciB1bmJ1aWx0IG1vZGUsIGZvciB0aGlzIHJlcG8gYW5kIGl0cyBkZXBlbmRlbmNpZXNgLFxyXG4gICAgd3JhcFRhc2soIGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgZ2VuZXJhdGVSRUFETUUgPSByZXF1aXJlKCAnLi9nZW5lcmF0ZVJFQURNRScgKTtcclxuICAgICAgY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XHJcblxyXG4gICAgICAvLyBzdXBwb3J0IHJlcG9zIHRoYXQgZG9uJ3QgaGF2ZSBhIHBoZXQgb2JqZWN0XHJcbiAgICAgIGlmICggIXBhY2thZ2VPYmplY3QucGhldCApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG1vZHVsaWZ5IGlzIGdyYWNlZnVsIGlmIHRoZXJlIGFyZSBubyBmaWxlcyB0aGF0IG5lZWQgbW9kdWxpZnlpbmcuXHJcbiAgICAgIGdydW50LnRhc2sucnVuKCAnbW9kdWxpZnknICk7XHJcblxyXG4gICAgICBpZiAoIHBhY2thZ2VPYmplY3QucGhldC5ydW5uYWJsZSApIHtcclxuICAgICAgICBncnVudC50YXNrLnJ1biggJ2dlbmVyYXRlLWRldmVsb3BtZW50LWh0bWwnICk7XHJcblxyXG4gICAgICAgIGlmICggcGFja2FnZU9iamVjdC5waGV0LnNpbUZlYXR1cmVzICYmIHBhY2thZ2VPYmplY3QucGhldC5zaW1GZWF0dXJlcy5zdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb24gKSB7XHJcbiAgICAgICAgICBncnVudC50YXNrLnJ1biggJ2dlbmVyYXRlLWExMXktdmlldy1odG1sJyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBwYWNrYWdlT2JqZWN0LnBoZXQuZ2VuZXJhdGVkVW5pdFRlc3RzICkge1xyXG4gICAgICAgIGdydW50LnRhc2sucnVuKCAnZ2VuZXJhdGUtdGVzdC1odG1sJyApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB1cGRhdGUgUkVBRE1FLm1kIG9ubHkgZm9yIHNpbXVsYXRpb25zXHJcbiAgICAgIGlmICggcGFja2FnZU9iamVjdC5waGV0LnNpbXVsYXRpb24gJiYgIXBhY2thZ2VPYmplY3QucGhldC5yZWFkbWVDcmVhdGVkTWFudWFsbHkgKSB7XHJcbiAgICAgICAgYXdhaXQgZ2VuZXJhdGVSRUFETUUoIHJlcG8sICEhcGFja2FnZU9iamVjdC5waGV0LnB1Ymxpc2hlZCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIHBhY2thZ2VPYmplY3QucGhldC5zdXBwb3J0ZWRCcmFuZHMgJiYgcGFja2FnZU9iamVjdC5waGV0LnN1cHBvcnRlZEJyYW5kcy5pbmNsdWRlcyggJ3BoZXQtaW8nICkgKSB7XHJcblxyXG4gICAgICAgIC8vIENvcGllZCBmcm9tIGJ1aWxkLmpzb24gYW5kIHVzZWQgYXMgYSBwcmVsb2FkIGZvciBwaGV0LWlvIGJyYW5kXHJcbiAgICAgICAgY29uc3Qgb3ZlcnJpZGVzRmlsZSA9IGBqcy8ke3JlcG99LXBoZXQtaW8tb3ZlcnJpZGVzLmpzYDtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhbiBvdmVycmlkZXMgZmlsZSwgZG9uJ3Qgb3ZlcndyaXRlIGl0IHdpdGggYW4gZW1wdHkgb25lXHJcbiAgICAgICAgaWYgKCAhZnMuZXhpc3RzU3luYyggYC4uLyR7cmVwb30vJHtvdmVycmlkZXNGaWxlfWAgKSApIHtcclxuICAgICAgICAgIGNvbnN0IHdyaXRlRmlsZUFuZEdpdEFkZCA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL3dyaXRlRmlsZUFuZEdpdEFkZCcgKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBvdmVycmlkZXNDb250ZW50ID0gJy8qIGVzbGludC1kaXNhYmxlICovXFxud2luZG93LnBoZXQucHJlbG9hZHMucGhldGlvLnBoZXRpb0VsZW1lbnRzT3ZlcnJpZGVzID0ge307JztcclxuICAgICAgICAgIGF3YWl0IHdyaXRlRmlsZUFuZEdpdEFkZCggcmVwbywgb3ZlcnJpZGVzRmlsZSwgb3ZlcnJpZGVzQ29udGVudCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApICk7XHJcblxyXG4gIC8vIFRoaXMgaXMgbm90IHJ1biBpbiBncnVudCB1cGRhdGUgYmVjYXVzZSBpdCBhZmZlY3RzIGRlcGVuZGVuY2llcyBhbmQgb3V0cHV0cyBmaWxlcyBvdXRzaWRlIG9mIHRoZSByZXBvLlxyXG4gIGdydW50LnJlZ2lzdGVyVGFzayggJ2dlbmVyYXRlLWRldmVsb3BtZW50LXN0cmluZ3MnLFxyXG4gICAgJ1RvIHN1cHBvcnQgbG9jYWxlcz0qIGluIHVuYnVpbHQgbW9kZSwgZ2VuZXJhdGUgYSBjb25nbG9tZXJhdGUgSlNPTiBmaWxlIGZvciBlYWNoIHJlcG8gd2l0aCB0cmFuc2xhdGlvbnMgaW4gYmFiZWwuIFJ1biBvbiBhbGwgcmVwb3MgdmlhOlxcbicgK1xyXG4gICAgJyogZm9yLWVhY2guc2ggcGVyZW5uaWFsLWFsaWFzL2RhdGEvYWN0aXZlLXJlcG9zIG5wbSBpbnN0YWxsXFxuJyArXHJcbiAgICAnKiBmb3ItZWFjaC5zaCBwZXJlbm5pYWwtYWxpYXMvZGF0YS9hY3RpdmUtcmVwb3MgZ3J1bnQgZ2VuZXJhdGUtZGV2ZWxvcG1lbnQtc3RyaW5ncycsXHJcbiAgICB3cmFwVGFzayggYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBnZW5lcmF0ZURldmVsb3BtZW50U3RyaW5ncyA9IHJlcXVpcmUoICcuLi9zY3JpcHRzL2dlbmVyYXRlRGV2ZWxvcG1lbnRTdHJpbmdzJyApO1xyXG4gICAgICBjb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcclxuXHJcbiAgICAgIGlmICggZnMuZXhpc3RzU3luYyggYC4uLyR7cmVwb30vJHtyZXBvfS1zdHJpbmdzX2VuLmpzb25gICkgKSB7XHJcbiAgICAgICAgZ2VuZXJhdGVEZXZlbG9wbWVudFN0cmluZ3MoIHJlcG8gKTtcclxuICAgICAgfVxyXG4gICAgfSApXHJcbiAgKTtcclxuXHJcbiAgZ3J1bnQucmVnaXN0ZXJUYXNrKCAncHVibGlzaGVkLVJFQURNRScsXHJcbiAgICAnR2VuZXJhdGVzIFJFQURNRS5tZCBmaWxlIGZvciBhIHB1Ymxpc2hlZCBzaW11bGF0aW9uLicsXHJcbiAgICB3cmFwVGFzayggYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBnZW5lcmF0ZVJFQURNRSA9IHJlcXVpcmUoICcuL2dlbmVyYXRlUkVBRE1FJyApOyAvLyB1c2VkIGJ5IG11bHRpcGxlIHRhc2tzXHJcbiAgICAgIGF3YWl0IGdlbmVyYXRlUkVBRE1FKCByZXBvLCB0cnVlIC8qIHB1Ymxpc2hlZCAqLyApO1xyXG4gICAgfSApICk7XHJcblxyXG4gIGdydW50LnJlZ2lzdGVyVGFzayggJ3VucHVibGlzaGVkLVJFQURNRScsXHJcbiAgICAnR2VuZXJhdGVzIFJFQURNRS5tZCBmaWxlIGZvciBhbiB1bnB1Ymxpc2hlZCBzaW11bGF0aW9uLicsXHJcbiAgICB3cmFwVGFzayggYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBnZW5lcmF0ZVJFQURNRSA9IHJlcXVpcmUoICcuL2dlbmVyYXRlUkVBRE1FJyApOyAvLyB1c2VkIGJ5IG11bHRpcGxlIHRhc2tzXHJcbiAgICAgIGF3YWl0IGdlbmVyYXRlUkVBRE1FKCByZXBvLCBmYWxzZSAvKiBwdWJsaXNoZWQgKi8gKTtcclxuICAgIH0gKSApO1xyXG5cclxuICBncnVudC5yZWdpc3RlclRhc2soICdzb3J0LWltcG9ydHMnLCAnU29ydCB0aGUgaW1wb3J0IHN0YXRlbWVudHMgZm9yIGEgc2luZ2xlIGZpbGUgKGlmIC0tZmlsZT17e0ZJTEV9fSBpcyBwcm92aWRlZCksIG9yIGRvZXMgc28gZm9yIGFsbCBKUyBmaWxlcyBpZiBub3Qgc3BlY2lmaWVkJywgd3JhcFRhc2soIGFzeW5jICgpID0+IHtcclxuICAgIGNvbnN0IHNvcnRJbXBvcnRzID0gcmVxdWlyZSggJy4vc29ydEltcG9ydHMnICk7XHJcblxyXG4gICAgY29uc3QgZmlsZSA9IGdydW50Lm9wdGlvbiggJ2ZpbGUnICk7XHJcblxyXG4gICAgaWYgKCBmaWxlICkge1xyXG4gICAgICBzb3J0SW1wb3J0cyggZmlsZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGdydW50LmZpbGUucmVjdXJzZSggYC4uLyR7cmVwb30vanNgLCBhYnNmaWxlID0+IHNvcnRJbXBvcnRzKCBhYnNmaWxlICkgKTtcclxuICAgIH1cclxuICB9ICkgKTtcclxuXHJcbiAgZ3J1bnQucmVnaXN0ZXJUYXNrKCAnY29tbWl0cy1zaW5jZScsXHJcbiAgICAnU2hvd3MgY29tbWl0cyBzaW5jZSBhIHNwZWNpZmllZCBkYXRlLiBVc2UgLS1kYXRlPTxkYXRlPiB0byBzcGVjaWZ5IHRoZSBkYXRlLicsXHJcbiAgICB3cmFwVGFzayggYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBkYXRlU3RyaW5nID0gZ3J1bnQub3B0aW9uKCAnZGF0ZScgKTtcclxuICAgICAgYXNzZXJ0KCBkYXRlU3RyaW5nLCAnbWlzc2luZyByZXF1aXJlZCBvcHRpb246IC0tZGF0ZT17e0RBVEV9fScgKTtcclxuXHJcbiAgICAgIGNvbnN0IGNvbW1pdHNTaW5jZSA9IHJlcXVpcmUoICcuL2NvbW1pdHNTaW5jZScgKTtcclxuXHJcbiAgICAgIGF3YWl0IGNvbW1pdHNTaW5jZSggcmVwbywgZGF0ZVN0cmluZyApO1xyXG4gICAgfSApICk7XHJcblxyXG4gIC8vIFNlZSByZXBvcnRNZWRpYS5qc1xyXG4gIGdydW50LnJlZ2lzdGVyVGFzayggJ3JlcG9ydC1tZWRpYScsXHJcbiAgICAnKHByb2plY3Qtd2lkZSkgUmVwb3J0IG9uIGxpY2Vuc2UuanNvbiBmaWxlcyB0aHJvdWdob3V0IGFsbCB3b3JraW5nIGNvcGllcy4gJyArXHJcbiAgICAnUmVwb3J0cyBhbnkgbWVkaWEgKHN1Y2ggYXMgaW1hZ2VzIG9yIHNvdW5kKSBmaWxlcyB0aGF0IGhhdmUgYW55IG9mIHRoZSBmb2xsb3dpbmcgcHJvYmxlbXM6XFxuJyArXHJcbiAgICAnKDEpIGluY29tcGF0aWJsZS1saWNlbnNlIChyZXNvdXJjZSBsaWNlbnNlIG5vdCBhcHByb3ZlZClcXG4nICtcclxuICAgICcoMikgbm90LWFubm90YXRlZCAobGljZW5zZS5qc29uIG1pc3Npbmcgb3IgZW50cnkgbWlzc2luZyBmcm9tIGxpY2Vuc2UuanNvbilcXG4nICtcclxuICAgICcoMykgbWlzc2luZy1maWxlIChlbnRyeSBpbiB0aGUgbGljZW5zZS5qc29uIGJ1dCBub3Qgb24gdGhlIGZpbGUgc3lzdGVtKScsXHJcbiAgICB3cmFwVGFzayggYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCByZXBvcnRNZWRpYSA9IHJlcXVpcmUoICcuL3JlcG9ydE1lZGlhJyApO1xyXG5cclxuICAgICAgYXdhaXQgcmVwb3J0TWVkaWEoIHJlcG8gKTtcclxuICAgIH0gKSApO1xyXG5cclxuICAvLyBzZWUgcmVwb3J0VGhpcmRQYXJ0eS5qc1xyXG4gIGdydW50LnJlZ2lzdGVyVGFzayggJ3JlcG9ydC10aGlyZC1wYXJ0eScsXHJcbiAgICAnQ3JlYXRlcyBhIHJlcG9ydCBvZiB0aGlyZC1wYXJ0eSByZXNvdXJjZXMgKGNvZGUsIGltYWdlcywgc291bmQsIGV0YykgdXNlZCBpbiB0aGUgcHVibGlzaGVkIFBoRVQgc2ltdWxhdGlvbnMgYnkgJyArXHJcbiAgICAncmVhZGluZyB0aGUgbGljZW5zZSBpbmZvcm1hdGlvbiBpbiBwdWJsaXNoZWQgSFRNTCBmaWxlcyBvbiB0aGUgUGhFVCB3ZWJzaXRlLiBUaGlzIHRhc2sgbXVzdCBiZSBydW4gZnJvbSBtYXN0ZXIuICAnICtcclxuICAgICdBZnRlciBydW5uaW5nIHRoaXMgdGFzaywgeW91IG11c3QgcHVzaCBzaGVycGEvdGhpcmQtcGFydHktbGljZW5zZXMubWQuJyxcclxuICAgIHdyYXBUYXNrKCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHJlcG9ydFRoaXJkUGFydHkgPSByZXF1aXJlKCAnLi9yZXBvcnRUaGlyZFBhcnR5JyApO1xyXG5cclxuICAgICAgYXdhaXQgcmVwb3J0VGhpcmRQYXJ0eSgpO1xyXG4gICAgfSApICk7XHJcblxyXG4gIGdydW50LnJlZ2lzdGVyVGFzayggJ21vZHVsaWZ5JywgJ0NyZWF0ZXMgKi5qcyBtb2R1bGVzIGZvciBhbGwgaW1hZ2VzL3N0cmluZ3MvYXVkaW8vZXRjIGluIGEgcmVwbycsIHdyYXBUYXNrKCBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCBtb2R1bGlmeSA9IHJlcXVpcmUoICcuL21vZHVsaWZ5JyApO1xyXG4gICAgY29uc3QgZ2VuZXJhdGVEZXZlbG9wbWVudFN0cmluZ3MgPSByZXF1aXJlKCAnLi4vc2NyaXB0cy9nZW5lcmF0ZURldmVsb3BtZW50U3RyaW5ncycgKTtcclxuICAgIGNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xyXG5cclxuICAgIGF3YWl0IG1vZHVsaWZ5KCByZXBvICk7XHJcblxyXG4gICAgaWYgKCBmcy5leGlzdHNTeW5jKCBgLi4vJHtyZXBvfS8ke3JlcG99LXN0cmluZ3NfZW4uanNvbmAgKSApIHtcclxuICAgICAgZ2VuZXJhdGVEZXZlbG9wbWVudFN0cmluZ3MoIHJlcG8gKTtcclxuICAgIH1cclxuICB9ICkgKTtcclxuXHJcbiAgLy8gR3J1bnQgdGFzayB0aGF0IGRldGVybWluZXMgY3JlYXRlZCBhbmQgbGFzdCBtb2RpZmllZCBkYXRlcyBmcm9tIGdpdCwgYW5kXHJcbiAgLy8gdXBkYXRlcyBjb3B5cmlnaHQgc3RhdGVtZW50cyBhY2NvcmRpbmdseSwgc2VlICM0MDNcclxuICBncnVudC5yZWdpc3RlclRhc2soXHJcbiAgICAndXBkYXRlLWNvcHlyaWdodC1kYXRlcycsXHJcbiAgICAnVXBkYXRlIHRoZSBjb3B5cmlnaHQgZGF0ZXMgaW4gSlMgc291cmNlIGZpbGVzIGJhc2VkIG9uIEdpdGh1YiBkYXRlcycsXHJcbiAgICB3cmFwVGFzayggYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCB1cGRhdGVDb3B5cmlnaHREYXRlcyA9IHJlcXVpcmUoICcuL3VwZGF0ZUNvcHlyaWdodERhdGVzJyApO1xyXG5cclxuICAgICAgYXdhaXQgdXBkYXRlQ29weXJpZ2h0RGF0ZXMoIHJlcG8gKTtcclxuICAgIH0gKVxyXG4gICk7XHJcblxyXG4gIGdydW50LnJlZ2lzdGVyVGFzayhcclxuICAgICd3ZWJwYWNrLWRldi1zZXJ2ZXInLCBgUnVucyBhIHdlYnBhY2sgc2VydmVyIGZvciBhIGdpdmVuIGxpc3Qgb2Ygc2ltdWxhdGlvbnMuXHJcbi0tcmVwb3M9UkVQT1MgZm9yIGEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgcmVwb3MgKGRlZmF1bHRzIHRvIGN1cnJlbnQgcmVwbylcclxuLS1wb3J0PTkwMDAgdG8gYWRqdXN0IHRoZSBydW5uaW5nIHBvcnRcclxuLS1kZXZ0b29sPXN0cmluZyB2YWx1ZSBmb3Igc291cmNlbWFwIGdlbmVyYXRpb24gc3BlY2lmaWVkIGF0IGh0dHBzOi8vd2VicGFjay5qcy5vcmcvY29uZmlndXJhdGlvbi9kZXZ0b29sIG9yIHVuZGVmaW5lZCBmb3IgKG5vbmUpXHJcbi0tY2hyb21lOiBvcGVuIHRoZSBzaW1zIGluIENocm9tZSB0YWJzIChNYWMpYCxcclxuICAgICgpID0+IHtcclxuICAgICAgLy8gV2UgZG9uJ3QgZmluaXNoISBEb24ndCB0ZWxsIGdydW50IHRoaXMuLi5cclxuICAgICAgZ3J1bnQudGFzay5jdXJyZW50LmFzeW5jKCk7XHJcblxyXG4gICAgICBjb25zdCByZXBvcyA9IGdydW50Lm9wdGlvbiggJ3JlcG9zJyApID8gZ3J1bnQub3B0aW9uKCAncmVwb3MnICkuc3BsaXQoICcsJyApIDogWyByZXBvIF07XHJcbiAgICAgIGNvbnN0IHBvcnQgPSBncnVudC5vcHRpb24oICdwb3J0JyApIHx8IDkwMDA7XHJcbiAgICAgIGxldCBkZXZ0b29sID0gZ3J1bnQub3B0aW9uKCAnZGV2dG9vbCcgKSB8fCAnaW5saW5lLXNvdXJjZS1tYXAnO1xyXG4gICAgICBpZiAoIGRldnRvb2wgPT09ICdub25lJyB8fCBkZXZ0b29sID09PSAndW5kZWZpbmVkJyApIHtcclxuICAgICAgICBkZXZ0b29sID0gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IG9wZW5DaHJvbWUgPSBncnVudC5vcHRpb24oICdjaHJvbWUnICkgfHwgZmFsc2U7XHJcblxyXG4gICAgICBjb25zdCB3ZWJwYWNrRGV2U2VydmVyID0gcmVxdWlyZSggJy4vd2VicGFja0RldlNlcnZlcicgKTtcclxuXHJcbiAgICAgIC8vIE5PVEU6IFdlIGRvbid0IGNhcmUgYWJvdXQgdGhlIHByb21pc2UgdGhhdCBpcyByZXR1cm5lZCBoZXJlLCBiZWNhdXNlIHdlIGFyZSBnb2luZyB0byBrZWVwIHRoaXMgdGFzayBydW5uaW5nXHJcbiAgICAgIC8vIHVudGlsIHRoZSB1c2VyIG1hbnVhbGx5IGtpbGxzIGl0LlxyXG4gICAgICB3ZWJwYWNrRGV2U2VydmVyKCByZXBvcywgcG9ydCwgZGV2dG9vbCwgb3BlbkNocm9tZSApO1xyXG4gICAgfVxyXG4gICk7XHJcblxyXG4gIGdydW50LnJlZ2lzdGVyVGFzayhcclxuICAgICdnZW5lcmF0ZS1waGV0LWlvLWFwaScsXHJcbiAgICAnT3V0cHV0IHRoZSBQaEVULWlPIEFQSSBhcyBKU09OIHRvIHBoZXQtaW8tc2ltLXNwZWNpZmljL2FwaS5cXG4nICtcclxuICAgICdPcHRpb25zXFxuOicgK1xyXG4gICAgJy0tc2ltcz0uLi4gYSBsaXN0IG9mIHNpbXMgdG8gY29tcGFyZSAoZGVmYXVsdHMgdG8gdGhlIHNpbSBpbiB0aGUgY3VycmVudCBkaXIpXFxuJyArXHJcbiAgICAnLS1zaW1MaXN0PS4uLiBhIGZpbGUgd2l0aCBhIGxpc3Qgb2Ygc2ltcyB0byBjb21wYXJlIChkZWZhdWx0cyB0byB0aGUgc2ltIGluIHRoZSBjdXJyZW50IGRpcilcXG4nICtcclxuICAgICctLXN0YWJsZSAtIHJlZ2VuZXJhdGUgZm9yIGFsbCBcInN0YWJsZSBzaW1zXCIgKHNlZSBwZXJlbm5pYWwvZGF0YS9waGV0LWlvLWFwaS1zdGFibGUvKVxcbicgK1xyXG4gICAgJy0tdGVtcG9yYXJ5IC0gb3V0cHV0cyB0byB0aGUgdGVtcG9yYXJ5IGRpcmVjdG9yeScsXHJcbiAgICB3cmFwVGFzayggYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBmb3JtYXRQaGV0aW9BUEkgPSByZXF1aXJlKCAnLi4vcGhldC1pby9mb3JtYXRQaGV0aW9BUEknICk7XHJcbiAgICAgIGNvbnN0IGdldFNpbUxpc3QgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dldFNpbUxpc3QnICk7XHJcbiAgICAgIGNvbnN0IGdlbmVyYXRlUGhldGlvTWFjcm9BUEkgPSByZXF1aXJlKCAnLi4vcGhldC1pby9nZW5lcmF0ZVBoZXRpb01hY3JvQVBJJyApO1xyXG4gICAgICBjb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcclxuXHJcbiAgICAgIGNvbnN0IHNpbXMgPSBnZXRTaW1MaXN0KCkubGVuZ3RoID09PSAwID8gWyByZXBvIF0gOiBnZXRTaW1MaXN0KCk7XHJcblxyXG4gICAgICB0cmFuc3BpbGVyLnRyYW5zcGlsZUFsbCgpO1xyXG5cclxuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IGdlbmVyYXRlUGhldGlvTWFjcm9BUEkoIHNpbXMsIHtcclxuICAgICAgICBzaG93UHJvZ3Jlc3NCYXI6IHNpbXMubGVuZ3RoID4gMVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHNpbXMuZm9yRWFjaCggc2ltID0+IHtcclxuICAgICAgICBjb25zdCBkaXIgPSBgLi4vcGhldC1pby1zaW0tc3BlY2lmaWMvcmVwb3MvJHtzaW19YDtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgZnMubWtkaXJTeW5jKCBkaXIgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgICAgICAvLyBEaXJlY3RvcnkgZXhpc3RzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gYCR7ZGlyfS8ke3NpbX0tcGhldC1pby1hcGkke2dydW50Lm9wdGlvbiggJ3RlbXBvcmFyeScgKSA/ICctdGVtcG9yYXJ5JyA6ICcnfS5qc29uYDtcclxuICAgICAgICBjb25zdCBhcGkgPSByZXN1bHRzWyBzaW0gXTtcclxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKCBmaWxlUGF0aCwgZm9ybWF0UGhldGlvQVBJKCBhcGkgKSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9IClcclxuICApO1xyXG5cclxuICBncnVudC5yZWdpc3RlclRhc2soXHJcbiAgICAnY29tcGFyZS1waGV0LWlvLWFwaScsXHJcbiAgICAnQ29tcGFyZXMgdGhlIHBoZXQtaW8tYXBpIGFnYWluc3QgdGhlIHJlZmVyZW5jZSB2ZXJzaW9uKHMpIGlmIHRoaXMgc2ltXFwncyBwYWNrYWdlLmpzb24gbWFya3MgY29tcGFyZURlc2lnbmVkQVBJQ2hhbmdlcy4gICcgK1xyXG4gICAgJ1RoaXMgd2lsbCBieSBkZWZhdWx0IGNvbXBhcmUgZGVzaWduZWQgY2hhbmdlcyBvbmx5LiBPcHRpb25zOlxcbicgK1xyXG4gICAgJy0tc2ltcz0uLi4gYSBsaXN0IG9mIHNpbXMgdG8gY29tcGFyZSAoZGVmYXVsdHMgdG8gdGhlIHNpbSBpbiB0aGUgY3VycmVudCBkaXIpXFxuJyArXHJcbiAgICAnLS1zaW1MaXN0PS4uLiBhIGZpbGUgd2l0aCBhIGxpc3Qgb2Ygc2ltcyB0byBjb21wYXJlIChkZWZhdWx0cyB0byB0aGUgc2ltIGluIHRoZSBjdXJyZW50IGRpcilcXG4nICtcclxuICAgICctLXN0YWJsZSwgZ2VuZXJhdGUgdGhlIHBoZXQtaW8tYXBpcyBmb3IgZWFjaCBwaGV0LWlvIHNpbSBjb25zaWRlcmVkIHRvIGhhdmUgYSBzdGFibGUgYXBpIChzZWUgcGVyZW5uaWFsLWFsaWFzL2RhdGEvcGhldC1pby1hcGktc3RhYmxlKVxcbicgK1xyXG4gICAgJy0tZGVsdGEsIGJ5IGRlZmF1bHQgYSBicmVha2luZy1jb21wYXRpYmlsaXR5IGNvbXBhcmlzb24gaXMgZG9uZSwgYnV0IC0tZGVsdGEgc2hvd3MgYWxsIGNoYW5nZXNcXG4nICtcclxuICAgICctLXRlbXBvcmFyeSwgY29tcGFyZXMgQVBJIGZpbGVzIGluIHRoZSB0ZW1wb3JhcnkgZGlyZWN0b3J5IChvdGhlcndpc2UgY29tcGFyZXMgdG8gZnJlc2hseSBnZW5lcmF0ZWQgQVBJcylcXG4nICtcclxuICAgICctLWNvbXBhcmVCcmVha2luZ0FQSUNoYW5nZXMgLSBhZGQgdGhpcyBmbGFnIHRvIGNvbXBhcmUgYnJlYWtpbmcgY2hhbmdlcyBpbiBhZGRpdGlvbiB0byBkZXNpZ25lZCBjaGFuZ2VzJyxcclxuICAgIHdyYXBUYXNrKCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGdldFNpbUxpc3QgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dldFNpbUxpc3QnICk7XHJcbiAgICAgIGNvbnN0IGdlbmVyYXRlUGhldGlvTWFjcm9BUEkgPSByZXF1aXJlKCAnLi4vcGhldC1pby9nZW5lcmF0ZVBoZXRpb01hY3JvQVBJJyApO1xyXG4gICAgICBjb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcclxuXHJcbiAgICAgIGNvbnN0IHNpbXMgPSBnZXRTaW1MaXN0KCkubGVuZ3RoID09PSAwID8gWyByZXBvIF0gOiBnZXRTaW1MaXN0KCk7XHJcbiAgICAgIGNvbnN0IHRlbXBvcmFyeSA9IGdydW50Lm9wdGlvbiggJ3RlbXBvcmFyeScgKTtcclxuICAgICAgbGV0IHByb3Bvc2VkQVBJcyA9IG51bGw7XHJcbiAgICAgIGlmICggdGVtcG9yYXJ5ICkge1xyXG4gICAgICAgIHByb3Bvc2VkQVBJcyA9IHt9O1xyXG4gICAgICAgIHNpbXMuZm9yRWFjaCggc2ltID0+IHtcclxuICAgICAgICAgIHByb3Bvc2VkQVBJc1sgc2ltIF0gPSBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoIGAuLi9waGV0LWlvLXNpbS1zcGVjaWZpYy9yZXBvcy8ke3JlcG99LyR7cmVwb30tcGhldC1pby1hcGktdGVtcG9yYXJ5Lmpzb25gLCAndXRmOCcgKSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBwcm9wb3NlZEFQSXMgPSBhd2FpdCBnZW5lcmF0ZVBoZXRpb01hY3JvQVBJKCBzaW1zLCB7XHJcbiAgICAgICAgICBzaG93UHJvZ3Jlc3NCYXI6IHRydWUsXHJcbiAgICAgICAgICBzaG93TWVzc2FnZXNGcm9tU2ltOiBmYWxzZVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRG9uJ3QgYWRkIHRvIG9wdGlvbnMgb2JqZWN0IGlmIHZhbHVlcyBhcmUgYHVuZGVmaW5lZGAgKGFzIF8uZXh0ZW5kIHdpbGwga2VlcCB0aG9zZSBlbnRyaWVzIGFuZCBub3QgbWl4IGluIGRlZmF1bHRzXHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7fTtcclxuICAgICAgaWYgKCBncnVudC5vcHRpb24oICdkZWx0YScgKSApIHtcclxuICAgICAgICBvcHRpb25zLmRlbHRhID0gZ3J1bnQub3B0aW9uKCAnZGVsdGEnICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBncnVudC5vcHRpb24oICdjb21wYXJlQnJlYWtpbmdBUElDaGFuZ2VzJyApICkge1xyXG4gICAgICAgIG9wdGlvbnMuY29tcGFyZUJyZWFraW5nQVBJQ2hhbmdlcyA9IGdydW50Lm9wdGlvbiggJ2NvbXBhcmVCcmVha2luZ0FQSUNoYW5nZXMnICk7XHJcbiAgICAgIH1cclxuICAgICAgYXdhaXQgcmVxdWlyZSggJy4uL3BoZXQtaW8vcGhldGlvQ29tcGFyZUFQSVNldHMnICkoIHNpbXMsIHByb3Bvc2VkQVBJcywgb3B0aW9ucyApO1xyXG4gICAgfSApXHJcbiAgKTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBncnVudCB0YXNrcyB0aGF0IGVmZmVjdGl2ZWx5IGdldCBmb3J3YXJkZWQgdG8gcGVyZW5uaWFsLiBJdCB3aWxsIGV4ZWN1dGUgYSBncnVudCBwcm9jZXNzIHJ1bm5pbmcgZnJvbVxyXG4gICAqIHBlcmVubmlhbCdzIGRpcmVjdG9yeSB3aXRoIHRoZSBzYW1lIG9wdGlvbnMgKGJ1dCB3aXRoIC0tcmVwbz17e1JFUE99fSBhZGRlZCwgc28gdGhhdCBwZXJlbm5pYWwgaXMgYXdhcmUgb2Ygd2hhdFxyXG4gICAqIHJlcG9zaXRvcnkgaXMgdGhlIHRhcmdldCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhc2sgLSBUaGUgbmFtZSBvZiB0aGUgdGFza1xyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGZvcndhcmRUb1BlcmVubmlhbEdydW50KCB0YXNrICkge1xyXG4gICAgZ3J1bnQucmVnaXN0ZXJUYXNrKCB0YXNrLCAnUnVuIGdydW50IC0taGVscCBpbiBwZXJlbm5pYWwgdG8gc2VlIGRvY3VtZW50YXRpb24nLCAoKSA9PiB7XHJcbiAgICAgIGdydW50LmxvZy53cml0ZWxuKCAnKEZvcndhcmRpbmcgdGFzayB0byBwZXJlbm5pYWwpJyApO1xyXG5cclxuICAgICAgY29uc3QgY2hpbGRfcHJvY2VzcyA9IHJlcXVpcmUoICdjaGlsZF9wcm9jZXNzJyApO1xyXG5cclxuXHJcbiAgICAgIGNvbnN0IGRvbmUgPSBncnVudC50YXNrLmN1cnJlbnQuYXN5bmMoKTtcclxuXHJcbiAgICAgIC8vIEluY2x1ZGUgdGhlIC0tcmVwbyBmbGFnXHJcbiAgICAgIGNvbnN0IGFyZ3MgPSBbIGAtLXJlcG89JHtyZXBvfWAsIC4uLnByb2Nlc3MuYXJndi5zbGljZSggMiApIF07XHJcbiAgICAgIGNvbnN0IGFyZ3NTdHJpbmcgPSBhcmdzLm1hcCggYXJnID0+IGBcIiR7YXJnfVwiYCApLmpvaW4oICcgJyApO1xyXG4gICAgICBjb25zdCBzcGF3bmVkID0gY2hpbGRfcHJvY2Vzcy5zcGF3biggL153aW4vLnRlc3QoIHByb2Nlc3MucGxhdGZvcm0gKSA/ICdncnVudC5jbWQnIDogJ2dydW50JywgYXJncywge1xyXG4gICAgICAgIGN3ZDogJy4uL3BlcmVubmlhbCdcclxuICAgICAgfSApO1xyXG4gICAgICBncnVudC5sb2cuZGVidWcoIGBydW5uaW5nIGdydW50ICR7YXJnc1N0cmluZ30gaW4gLi4vJHtyZXBvfWAgKTtcclxuXHJcbiAgICAgIHNwYXduZWQuc3RkZXJyLm9uKCAnZGF0YScsIGRhdGEgPT4gZ3J1bnQubG9nLmVycm9yKCBkYXRhLnRvU3RyaW5nKCkgKSApO1xyXG4gICAgICBzcGF3bmVkLnN0ZG91dC5vbiggJ2RhdGEnLCBkYXRhID0+IGdydW50LmxvZy53cml0ZSggZGF0YS50b1N0cmluZygpICkgKTtcclxuICAgICAgcHJvY2Vzcy5zdGRpbi5waXBlKCBzcGF3bmVkLnN0ZGluICk7XHJcblxyXG4gICAgICBzcGF3bmVkLm9uKCAnY2xvc2UnLCBjb2RlID0+IHtcclxuICAgICAgICBpZiAoIGNvZGUgIT09IDAgKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBwZXJlbm5pYWwgZ3J1bnQgJHthcmdzU3RyaW5nfSBmYWlsZWQgd2l0aCBjb2RlICR7Y29kZX1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgW1xyXG4gICAgJ2NoZWNrb3V0LXNoYXMnLFxyXG4gICAgJ2NoZWNrb3V0LXRhcmdldCcsXHJcbiAgICAnY2hlY2tvdXQtcmVsZWFzZScsXHJcbiAgICAnY2hlY2tvdXQtbWFzdGVyJyxcclxuICAgICdjaGVja291dC1tYXN0ZXItYWxsJyxcclxuICAgICdjcmVhdGUtb25lLW9mZicsXHJcbiAgICAnc2hhLWNoZWNrJyxcclxuICAgICdzaW0tbGlzdCcsXHJcbiAgICAnbnBtLXVwZGF0ZScsXHJcbiAgICAnY3JlYXRlLXJlbGVhc2UnLFxyXG4gICAgJ2NoZXJyeS1waWNrJyxcclxuICAgICd3cmFwcGVyJyxcclxuICAgICdkZXYnLFxyXG4gICAgJ29uZS1vZmYnLFxyXG4gICAgJ3JjJyxcclxuICAgICdwcm9kdWN0aW9uJyxcclxuICAgICdwcm90b3R5cGUnLFxyXG4gICAgJ2NyZWF0ZS1zaW0nLFxyXG4gICAgJ2luc2VydC1yZXF1aXJlLXN0YXRlbWVudCcsXHJcbiAgICAnbGludC1ldmVyeXRoaW5nJyxcclxuICAgICdnZW5lcmF0ZS1kYXRhJyxcclxuICAgICdwZG9tLWNvbXBhcmlzb24nLFxyXG4gICAgJ3JlbGVhc2UtYnJhbmNoLWxpc3QnXHJcbiAgXS5mb3JFYWNoKCBmb3J3YXJkVG9QZXJlbm5pYWxHcnVudCApO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0QnJhbmRzID0gKCBncnVudCwgcmVwbywgYnVpbGRMb2NhbCApID0+IHtcclxuXHJcbiAgLy8gRGV0ZXJtaW5lIHdoYXQgYnJhbmRzIHdlIHdhbnQgdG8gYnVpbGRcclxuICBhc3NlcnQoICFncnVudC5vcHRpb24oICdicmFuZCcgKSwgJ1VzZSAtLWJyYW5kcz17e0JSQU5EU319IGluc3RlYWQgb2YgYnJhbmQnICk7XHJcblxyXG4gIGNvbnN0IGxvY2FsUGFja2FnZU9iamVjdCA9IGdydW50LmZpbGUucmVhZEpTT04oIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAgKTtcclxuICBjb25zdCBzdXBwb3J0ZWRCcmFuZHMgPSBsb2NhbFBhY2thZ2VPYmplY3QucGhldC5zdXBwb3J0ZWRCcmFuZHMgfHwgW107XHJcblxyXG4gIGxldCBicmFuZHM7XHJcbiAgaWYgKCBncnVudC5vcHRpb24oICdicmFuZHMnICkgKSB7XHJcbiAgICBpZiAoIGdydW50Lm9wdGlvbiggJ2JyYW5kcycgKSA9PT0gJyonICkge1xyXG4gICAgICBicmFuZHMgPSBzdXBwb3J0ZWRCcmFuZHM7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgYnJhbmRzID0gZ3J1bnQub3B0aW9uKCAnYnJhbmRzJyApLnNwbGl0KCAnLCcgKTtcclxuICAgIH1cclxuICB9XHJcbiAgZWxzZSBpZiAoIGJ1aWxkTG9jYWwuYnJhbmRzICkge1xyXG4gICAgLy8gRXh0cmEgY2hlY2ssIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvNjQwXHJcbiAgICBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGJ1aWxkTG9jYWwuYnJhbmRzICksICdJZiBicmFuZHMgZXhpc3RzIGluIGJ1aWxkLWxvY2FsLmpzb24sIGl0IHNob3VsZCBiZSBhbiBhcnJheScgKTtcclxuICAgIGJyYW5kcyA9IGJ1aWxkTG9jYWwuYnJhbmRzLmZpbHRlciggYnJhbmQgPT4gc3VwcG9ydGVkQnJhbmRzLmluY2x1ZGVzKCBicmFuZCApICk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgYnJhbmRzID0gWyAnYWRhcHRlZC1mcm9tLXBoZXQnIF07XHJcbiAgfVxyXG5cclxuICAvLyBFbnN1cmUgYWxsIGxpc3RlZCBicmFuZHMgYXJlIHZhbGlkXHJcbiAgYnJhbmRzLmZvckVhY2goIGJyYW5kID0+IGFzc2VydCggc3VwcG9ydGVkQnJhbmRzLmluY2x1ZGVzKCBicmFuZCApLCBgVW5zdXBwb3J0ZWQgYnJhbmQ6ICR7YnJhbmR9YCApICk7XHJcblxyXG4gIHJldHVybiBicmFuZHM7XHJcbn07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLE1BQU0sR0FBR0MsT0FBTyxDQUFFLFFBQVMsQ0FBQztBQUNsQ0EsT0FBTyxDQUFFLG9CQUFxQixDQUFDO0FBQy9COztBQUVBO0FBQ0EsSUFBSyxDQUFDQyxNQUFNLENBQUNDLGtCQUFrQixFQUFHO0VBRWxDO0VBQ0E7RUFDQTtFQUNFQyxPQUFPLENBQUNDLEVBQUUsQ0FBRSxvQkFBb0IsRUFBRUMsRUFBRSxJQUFJO0lBQUUsTUFBTUEsRUFBRTtFQUFFLENBQUUsQ0FBQzs7RUFFekQ7RUFDRUYsT0FBTyxDQUFDQyxFQUFFLENBQUUsUUFBUSxFQUFFLE1BQU07SUFDMUJFLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFLHNDQUF1QyxDQUFDO0lBQ3JESixPQUFPLENBQUNLLElBQUksQ0FBQyxDQUFDO0VBQ2hCLENBQUUsQ0FBQztBQUNMO0FBRUEsTUFBTUMsVUFBVSxHQUFHVCxPQUFPLENBQUUsc0JBQXVCLENBQUM7QUFDcEQsTUFBTVUsVUFBVSxHQUFHLElBQUlELFVBQVUsQ0FBRTtFQUFFRSxNQUFNLEVBQUU7QUFBSyxDQUFFLENBQUM7O0FBRXJEO0FBQ0E7QUFDQTtBQUNBRCxVQUFVLENBQUNFLGFBQWEsQ0FBRSxTQUFVLENBQUM7QUFDckNGLFVBQVUsQ0FBQ0UsYUFBYSxDQUFFLFdBQVksQ0FBQztBQUV2Q0MsTUFBTSxDQUFDQyxPQUFPLEdBQUcsVUFBVUMsS0FBSyxFQUFHO0VBQ2pDLE1BQU1DLGFBQWEsR0FBR0QsS0FBSyxDQUFDRSxJQUFJLENBQUNDLFFBQVEsQ0FBRSxjQUFlLENBQUM7O0VBRTNEO0VBQ0EsSUFBSUMsVUFBVTtFQUNkLElBQUk7SUFDRkEsVUFBVSxHQUFHSixLQUFLLENB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