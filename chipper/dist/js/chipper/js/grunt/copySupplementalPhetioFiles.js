// Copyright 2016-2023, University of Colorado Boulder

/**
 * Copies all supporting PhET-iO files, including wrappers, indices, lib files, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Matt Pennington (PhET Interactive Simulations)
 */

// modules
const _ = require('lodash');
const assert = require('assert');
const archiver = require('archiver');
const ChipperStringUtils = require('../common/ChipperStringUtils');
const copyDirectory = require('../grunt/copyDirectory');
const execute = require('../../../perennial-alias/js/common/execute');
const fs = require('fs');
const grunt = require('grunt');
const generatePhetioMacroAPI = require('../phet-io/generatePhetioMacroAPI');
const formatPhetioAPI = require('../phet-io/formatPhetioAPI');
const buildStandalone = require('../grunt/buildStandalone');
const minify = require('../grunt/minify');
const marked = require('marked');
const tsc = require('./tsc');
const reportTscResults = require('./reportTscResults');
const getPhetLibs = require('./getPhetLibs');
const path = require('path');
const webpack = require('webpack');

// constants
const DEDICATED_REPO_WRAPPER_PREFIX = 'phet-io-wrapper-';
const WRAPPER_COMMON_FOLDER = 'phet-io-wrappers/common';
const WRAPPERS_FOLDER = 'wrappers/'; // The wrapper index assumes this constant, please see phet-io-wrappers/index/index.js before changing

// For Client Guides
const PHET_IO_SIM_SPECIFIC = '../phet-io-sim-specific';
const GUIDES_COMMON_DIR = 'client-guide-common/client-guide';
const EXAMPLES_FILENAME = 'examples';
const PHET_IO_GUIDE_FILENAME = 'phet-io-guide';
const LIB_OUTPUT_FILE = 'phet-io.js';

// These files are bundled into the lib/phet-io.js file before PhET's phet-io code, and can be used by any wrapper
const THIRD_PARTY_LIB_PRELOADS = ['../sherpa/lib/react-18.1.0.production.min.js', '../sherpa/lib/react-dom-18.1.0.production.min.js', '../sherpa/lib/pako-2.0.3.min.js', '../sherpa/lib/lodash-4.17.4.min.js'];

// phet-io internal files to be consolidated into 1 file and publicly served as a minified phet-io library.
// Make sure to add new files to the jsdoc generation list below also
const PHET_IO_LIB_PRELOADS = ['../query-string-machine/js/QueryStringMachine.js',
// must be first, other types use this
'../assert/js/assert.js', '../chipper/js/phet-io/phetioCompareAPIs.js', '../tandem/js/PhetioIDUtils.js', '../perennial-alias/js/common/SimVersion.js'];
const LIB_PRELOADS = THIRD_PARTY_LIB_PRELOADS.concat(PHET_IO_LIB_PRELOADS);

// Additional libraries and third party files that are used by some phet-io wrappers, copied to a contrib/ directory.
// These are not bundled with the lib file to reduce the size of the central dependency of PhET-iO wrappers.
const CONTRIB_FILES = ['../sherpa/lib/ua-parser-0.7.21.min.js', '../sherpa/lib/bootstrap-2.2.2.js', '../sherpa/lib/font-awesome-4.5.0', '../sherpa/lib/jquery-2.1.0.min.js', '../sherpa/lib/jquery-ui-1.8.24.min.js', '../sherpa/lib/d3-4.2.2.js', '../sherpa/lib/jsondiffpatch-v0.3.11.umd.js', '../sherpa/lib/jsondiffpatch-v0.3.11-annotated.css', '../sherpa/lib/jsondiffpatch-v0.3.11-html.css', '../sherpa/lib/prism-1.23.0.js', '../sherpa/lib/prism-okaidia-1.23.0.css', '../sherpa/lib/clarinet-0.12.4.js'];

// This path is used for jsdoc. Transpilation happens before we get to this point. SR and MK recognize that this feels
// a bit risky, even though comments are currently preserved in the babel transpile step. See https://stackoverflow.com/questions/51720894/is-there-any-way-to-use-jsdoc-with-ts-files-maybe-transpile-with-babel-the
const transpiledClientPath = `../chipper/dist/js/${WRAPPER_COMMON_FOLDER}/js/Client.js`;

// List of files to run jsdoc generation with. This list is manual to keep files from sneaking into the public documentation.
const JSDOC_FILES = [transpiledClientPath, '../tandem/js/PhetioIDUtils.js', '../phet-io/js/phet-io-initialize-globals.js', '../chipper/js/initialize-globals.js'];
const JSDOC_README_FILE = '../phet-io/doc/wrapper/phet-io-documentation_README.md';
const STUDIO_BUILT_FILENAME = 'studio.min.js';

/**
 * @param {string} repo
 * @param {string} version
 * @param {string} simulationDisplayName
 * @param {Object} packageObject
 * @param {Object} buildLocal
 * @param {boolean} [generateMacroAPIFile]
 */
module.exports = async (repo, version, simulationDisplayName, packageObject, buildLocal, generateMacroAPIFile = false) => {
  const repoPhetLibs = getPhetLibs(repo, 'phet-io');
  assert(_.every(getPhetLibs('phet-io-wrappers'), repo => repoPhetLibs.includes(repo)), 'every dependency of phet-io-wrappers is not included in phetLibs of ' + repo + ' ' + repoPhetLibs + ' ' + getPhetLibs('phet-io-wrappers'));
  assert(_.every(getPhetLibs('studio'), repo => repoPhetLibs.includes(repo)), 'every dependency of studio is not included in phetLibs of ' + repo + ' ' + repoPhetLibs + ' ' + getPhetLibs('studio'));

  // This must be checked after copySupplementalPhetioFiles is called, since all the imports and outer code is run in
  // every brand. Developers without phet-io checked out still need to be able to build.
  assert(fs.readFileSync(transpiledClientPath).toString().indexOf('/**') >= 0, 'babel should not strip comments from transpiling');
  const simRepoSHA = (await execute('git', ['rev-parse', 'HEAD'], `../${repo}`)).trim();
  const buildDir = `../${repo}/build/phet-io/`;
  const wrappersLocation = `${buildDir}${WRAPPERS_FOLDER}`;

  // This regex was copied from perennial's `SimVersion.parse()` consult that code before changing things here.
  const matches = version.match(/^(\d+)\.(\d+)\.(\d+)(-(([^.-]+)\.(\d+)))?(-([^.-]+))?$/);
  if (!matches) {
    throw new Error(`could not parse version: ${version}`);
  }
  const major = Number(matches[1]);
  const minor = Number(matches[2]);
  const latestVersion = `${major}.${minor}`;
  const standardPhetioWrapperTemplateSkeleton = fs.readFileSync('../phet-io-wrappers/common/html/standardPhetioWrapperTemplateSkeleton.html', 'utf8');
  const customPhetioWrapperTemplateSkeleton = fs.readFileSync('../phet-io-wrappers/common/html/customPhetioWrapperTemplateSkeleton.html', 'utf8');
  assert(!standardPhetioWrapperTemplateSkeleton.includes('`'), 'The templates cannot contain backticks due to how the templates are passed through below');
  assert(!customPhetioWrapperTemplateSkeleton.includes('`'), 'The templates cannot contain backticks due to how the templates are passed through below');

  // The filter that we run every phet-io wrapper file through to transform dev content into built content. This mainly
  // involves lots of hard coded copy replace of template strings and marker values.
  const filterWrapper = (absPath, contents) => {
    const originalContents = `${contents}`;
    const isWrapperIndex = absPath.indexOf('index/index.html') >= 0;

    // For info about LIB_OUTPUT_FILE, see handleLib()
    const pathToLib = `lib/${LIB_OUTPUT_FILE}`;
    if (absPath.indexOf('.html') >= 0) {
      // change the paths of sherpa files to point to the contrib/ folder
      CONTRIB_FILES.forEach(filePath => {
        // No need to do this is this file doesn't have this contrib import in it.
        if (contents.indexOf(filePath) >= 0) {
          const filePathParts = filePath.split('/');

          // If the file is in a dedicated wrapper repo, then it is one level higher in the dir tree, and needs 1 less set of dots.
          // see https://github.com/phetsims/phet-io-wrappers/issues/17 for more info. This is hopefully a temporary workaround
          const needsExtraDots = absPath.indexOf(DEDICATED_REPO_WRAPPER_PREFIX) >= 0;
          const fileName = filePathParts[filePathParts.length - 1];
          const contribFileName = `contrib/${fileName}`;
          let pathToContrib = needsExtraDots ? `../../${contribFileName}` : `../${contribFileName}`;

          // The wrapper index is a different case because it is placed at the top level of the build dir.
          if (isWrapperIndex) {
            pathToContrib = contribFileName;
            filePath = `../${filePath}`; // filePath has one less set of relative than are actually in the index.html file.
          }

          contents = ChipperStringUtils.replaceAll(contents, filePath, pathToContrib);
        }
      });
      const includesElement = (line, array) => !!array.find(element => line.includes(element));

      // Remove files listed as preloads to the phet-io lib file.
      contents = contents.split(/\r?\n/).filter(line => !includesElement(line, LIB_PRELOADS)).join('\n');

      // Delete the imports the phet-io-wrappers-main, as it will be bundled with the phet-io.js lib file.
      // MUST GO BEFORE BELOW REPLACE: 'phet-io-wrappers/' -> '/'
      contents = contents.replace(/<script type="module" src="(..\/)+chipper\/dist\/js\/phet-io-wrappers\/js\/phet-io-wrappers-main.js"><\/script>/g,
      // '.*' is to support `data-client-name` in wrappers like "multi"
      '');

      // Support wrappers that use code from phet-io-wrappers
      contents = ChipperStringUtils.replaceAll(contents, '/phet-io-wrappers/', '/');

      // Don't use ChipperStringUtils because we want to capture the relative path and transfer it to the new script.
      // This is to support providing the relative path through the build instead of just hard coding it.
      contents = contents.replace(/<!--(<script src="[./]*\{\{PATH_TO_LIB_FILE}}".*><\/script>)-->/g,
      // '.*' is to support `data-client-name` in wrappers like "multi"
      '$1' // just uncomment, don't fill it in yet
      );

      contents = ChipperStringUtils.replaceAll(contents, '<!--{{GOOGLE_ANALYTICS.js}}-->', '<script src="/assets/js/phet-io-ga.js"></script>');
      contents = ChipperStringUtils.replaceAll(contents, '<!--{{FAVICON.ico}}-->', '<link rel="shortcut icon" href="/assets/favicon.ico"/>');

      // There should not be any imports of Client directly except using the "multi-wrapper" functionality of
      // providing a ?clientName, for unbuilt only, so we remove it here.
      contents = contents.replace(/^.*\/common\/js\/Client.js.*$/mg, '');
    }
    if (absPath.indexOf('.js') >= 0 || absPath.indexOf('.html') >= 0) {
      // Fill these in first so the following lines will also hit the content in these template vars
      contents = ChipperStringUtils.replaceAll(contents, '{{CUSTOM_WRAPPER_SKELETON}}', customPhetioWrapperTemplateSkeleton);
      contents = ChipperStringUtils.replaceAll(contents, '{{STANDARD_WRAPPER_SKELETON}}', standardPhetioWrapperTemplateSkeleton);

      // The rest
      contents = ChipperStringUtils.replaceAll(contents, '{{PATH_TO_LIB_FILE}}', pathToLib); // This must be after the script replacement that uses this variable above.
      contents = ChipperStringUtils.replaceAll(contents, '{{SIMULATION_NAME}}', repo);
      contents = ChipperStringUtils.replaceAll(contents, '{{SIMULATION_DISPLAY_NAME}}', simulationDisplayName);
      contents = ChipperStringUtils.replaceAll(contents, '{{SIMULATION_DISPLAY_NAME_ESCAPED}}', simulationDisplayName.replace(/'/g, '\\\''));
      contents = ChipperStringUtils.replaceAll(contents, '{{SIMULATION_VERSION}}', version);
      contents = ChipperStringUtils.replaceAll(contents, '{{SIMULATION_LATEST_VERSION}}', latestVersion);
      contents = ChipperStringUtils.replaceAll(contents, '{{SIMULATION_IS_BUILT}}', 'true');
      contents = ChipperStringUtils.replaceAll(contents, '{{PHET_IO_LIB_RELATIVE_PATH}}', pathToLib);
      contents = ChipperStringUtils.replaceAll(contents, '{{Built API Docs not available in unbuilt mode}}', 'API Docs');

      // phet-io-wrappers/common will be in the top level of wrappers/ in the build directory
      contents = ChipperStringUtils.replaceAll(contents, `${WRAPPER_COMMON_FOLDER}/`, 'common/');
    }
    if (isWrapperIndex) {
      const getGuideRowText = (fileName, linkText, description) => {
        return `<tr>
        <td><a href="doc/guides/${fileName}.html">${linkText}</a>
        </td>
        <td>${description}</td>
      </tr>`;
      };

      // The phet-io-guide is not sim-specific, so always create it.
      contents = ChipperStringUtils.replaceAll(contents, '{{PHET_IO_GUIDE_ROW}}', getGuideRowText(PHET_IO_GUIDE_FILENAME, 'PhET-iO Guide', 'Documentation for instructional designers about best practices for simulation customization with PhET-iO Studio.'));
      const exampleRowContents = fs.existsSync(`${PHET_IO_SIM_SPECIFIC}/repos/${repo}/${EXAMPLES_FILENAME}.md`) ? getGuideRowText(EXAMPLES_FILENAME, 'Examples', 'Provides instructions and the specific phetioIDs for customizing the simulation.') : '';
      contents = ChipperStringUtils.replaceAll(contents, '{{EXAMPLES_ROW}}', exampleRowContents);
    }

    // Special handling for studio paths since it is not nested under phet-io-wrappers
    if (absPath.indexOf('studio/index.html') >= 0) {
      contents = ChipperStringUtils.replaceAll(contents, '<script src="../contrib/', '<script src="../../contrib/');
      contents = ChipperStringUtils.replaceAll(contents, '<script type="module" src="../chipper/dist/js/studio/js/studio-main.js"></script>', `<script src="./${STUDIO_BUILT_FILENAME}"></script>`);
      contents = ChipperStringUtils.replaceAll(contents, '{{PHET_IO_GUIDE_LINK}}', `../../doc/guides/${PHET_IO_GUIDE_FILENAME}.html`);
      contents = ChipperStringUtils.replaceAll(contents, '{{EXAMPLES_LINK}}', `../../doc/guides/${EXAMPLES_FILENAME}.html`);
    }

    // Collapse >1 blank lines in html files.  This helps as a postprocessing step after removing lines with <script> tags
    if (absPath.endsWith('.html')) {
      const lines = contents.split(/\r?\n/);
      const pruned = [];
      for (let i = 0; i < lines.length; i++) {
        if (i >= 1 && lines[i - 1].trim().length === 0 && lines[i].trim().length === 0) {

          // skip redundant blank line
        } else {
          pruned.push(lines[i]);
        }
      }
      contents = pruned.join('\n');
    }
    if (contents !== originalContents) {
      return contents;
    } else {
      return null; // signify no change (helps for images)
    }
  };

  // a list of the phet-io wrappers that are built with the phet-io sim
  const wrappers = fs.readFileSync('../perennial-alias/data/wrappers', 'utf-8').trim().split('\n').map(wrappers => wrappers.trim());

  // Files and directories from wrapper folders that we don't want to copy
  const wrappersUnallowed = ['.git', 'README.md', '.gitignore', 'node_modules', 'package.json', 'build'];
  const libFileNames = PHET_IO_LIB_PRELOADS.map(filePath => {
    const parts = filePath.split('/');
    return parts[parts.length - 1];
  });

  // Don't copy over the files that are in the lib file, this way we can catch wrapper bugs that are not pointing to the lib.
  const fullUnallowedList = wrappersUnallowed.concat(libFileNames);

  // wrapping function for copying the wrappers to the build dir
  const copyWrapper = (src, dest, wrapper, wrapperName) => {
    const wrapperFilterWithNameFilter = (absPath, contents) => {
      const result = filterWrapper(absPath, contents);

      // Support loading relative-path resources, like
      //{ url: '../phet-io-wrapper-hookes-law-energy/sounds/precipitate-chimes-v1-shorter.mp3' }
      // -->
      //{ url: 'wrappers/hookes-law-energy/sounds/precipitate-chimes-v1-shorter.mp3' }
      if (wrapper && wrapperName && result) {
        return ChipperStringUtils.replaceAll(result, `../${wrapper}/`, `wrappers/${wrapperName}/`);
      }
      return result;
    };
    copyDirectory(src, dest, wrapperFilterWithNameFilter, {
      exclude: fullUnallowedList,
      minifyJS: true,
      minifyOptions: {
        stripAssertions: false
      }
    });
  };

  // Make sure to copy the phet-io-wrappers common wrapper code too.
  wrappers.push(WRAPPER_COMMON_FOLDER);

  // Add sim-specific wrappers
  let simSpecificWrappers;
  try {
    simSpecificWrappers = fs.readdirSync(`../phet-io-sim-specific/repos/${repo}/wrappers/`, {
      withFileTypes: true
    }).filter(dirent => dirent.isDirectory()).map(dirent => `phet-io-sim-specific/repos/${repo}/wrappers/${dirent.name}`);
  } catch (e) {
    simSpecificWrappers = [];
  }
  wrappers.push(...simSpecificWrappers);
  const additionalWrappers = packageObject.phet && packageObject.phet['phet-io'] && packageObject.phet['phet-io'].wrappers ? packageObject.phet['phet-io'].wrappers : [];
  wrappers.push(...additionalWrappers);
  wrappers.forEach(wrapper => {
    const wrapperParts = wrapper.split('/');

    // either take the last path part, or take the first (repo name) and remove the wrapper prefix
    const wrapperName = wrapperParts.length > 1 ? wrapperParts[wrapperParts.length - 1] : wrapperParts[0].replace(DEDICATED_REPO_WRAPPER_PREFIX, '');

    // Copy the wrapper into the build dir /wrappers/, exclude the excluded list
    copyWrapper(`../${wrapper}`, `${wrappersLocation}${wrapperName}`, wrapper, wrapperName);
  });

  // Copy the wrapper index into the top level of the build dir, exclude the excluded list
  copyWrapper('../phet-io-wrappers/index', `${buildDir}`, null, null);

  // Create the lib file that is minified and publicly available under the /lib folder of the build
  await handleLib(repo, buildDir, filterWrapper);

  // Create the zipped file that holds all needed items to run PhET-iO offline. NOTE: this must happen after copying wrapper
  await handleOfflineArtifact(buildDir, repo, version);

  // Create the contrib folder and add to it third party libraries used by wrappers.
  handleContrib(buildDir);

  // Create the rendered jsdoc in the `doc` folder
  await handleJSDOC(buildDir);

  // create the client guides
  handleClientGuides(repo, simulationDisplayName, buildDir, version, simRepoSHA);
  await handleStudio(repo, wrappersLocation);
  if (generateMacroAPIFile) {
    const fullAPI = (await generatePhetioMacroAPI([repo], {
      fromBuiltVersion: true
    }))[repo];
    assert(fullAPI, 'Full API expected but not created from puppeteer step, likely caused by https://github.com/phetsims/chipper/issues/1022.');
    grunt.file.write(`${buildDir}${repo}-phet-io-api.json`, formatPhetioAPI(fullAPI));
  }

  // The nested index wrapper will be broken on build, so get rid of it for clarity
  fs.rmSync(`${wrappersLocation}index/`, {
    recursive: true
  });
};

/**
 * Given the list of lib files, apply a filter function to them. Then minify them and consolidate into a single string.
 * Finally, write them to the build dir with a license prepended. See https://github.com/phetsims/phet-io/issues/353

 * @param {string} repo
 * @param {string} buildDir
 * @param {Function} filter - the filter function used when copying over wrapper files to fix relative paths and such.
 *                            Has arguments like "function(absPath, contents)"
 */
const handleLib = async (repo, buildDir, filter) => {
  grunt.log.debug('Creating phet-io lib file from: ', PHET_IO_LIB_PRELOADS);
  grunt.file.mkdir(`${buildDir}lib`);

  // phet-written preloads
  const phetioLibCode = PHET_IO_LIB_PRELOADS.map(libFile => {
    const contents = grunt.file.read(libFile);
    const filteredContents = filter(libFile, contents);

    // The filter returns null if nothing changes
    return filteredContents || contents;
  }).join('');
  const migrationRulesCode = await getCompiledMigrationRules(repo, buildDir);
  const minifiedPhetioCode = minify(`${phetioLibCode}\n${migrationRulesCode}`, {
    stripAssertions: false
  });
  const results = await tsc('../phet-io-wrappers');
  reportTscResults(results, grunt);
  let wrappersMain = await buildStandalone('phet-io-wrappers', {
    stripAssertions: false,
    stripLogging: false,
    tempOutputDir: repo,
    // Avoid getting a 2nd copy of the files that are already bundled into the lib file
    omitPreloads: THIRD_PARTY_LIB_PRELOADS
  });

  // In loadWrapperTemplate in unbuilt mode, it uses readFile to dynamically load the templates at runtime.
  // In built mode, we must inline the templates into the build artifact. See loadWrapperTemplate.js
  assert(wrappersMain.includes('"{{STANDARD_WRAPPER_SKELETON}}"') || wrappersMain.includes('\'{{STANDARD_WRAPPER_SKELETON}}\''), 'Template variable is missing: STANDARD_WRAPPER_SKELETON');
  assert(wrappersMain.includes('"{{CUSTOM_WRAPPER_SKELETON}}"') || wrappersMain.includes('\'{{CUSTOM_WRAPPER_SKELETON}}\''), 'Template variable is missing: CUSTOM_WRAPPER_SKELETON');

  // Robustly handle double or single quotes.  At the moment it is double quotes.
  // buildStandalone will mangle a template string into "" because it hasn't been filled in yet, bring it back here (with
  // support for it changing in the future from double to single quotes).
  wrappersMain = wrappersMain.replace('"{{STANDARD_WRAPPER_SKELETON}}"', '`{{STANDARD_WRAPPER_SKELETON}}`');
  wrappersMain = wrappersMain.replace('\'{{STANDARD_WRAPPER_SKELETON}}\'', '`{{STANDARD_WRAPPER_SKELETON}}`');
  wrappersMain = wrappersMain.replace('"{{CUSTOM_WRAPPER_SKELETON}}"', '`{{CUSTOM_WRAPPER_SKELETON}}`');
  wrappersMain = wrappersMain.replace('\'{{CUSTOM_WRAPPER_SKELETON}}\'', '`{{CUSTOM_WRAPPER_SKELETON}}`');
  const filteredMain = filter(LIB_OUTPUT_FILE, wrappersMain);
  const mainCopyright = `// Copyright 2002-${new Date().getFullYear()}, University of Colorado Boulder
// This PhET-iO file requires a license
// USE WITHOUT A LICENSE AGREEMENT IS STRICTLY PROHIBITED.
// For licensing, please contact phethelp@colorado.edu`;
  grunt.file.write(`${buildDir}lib/${LIB_OUTPUT_FILE}`, `${mainCopyright}
// 
// Contains additional code under the specified licenses:

${THIRD_PARTY_LIB_PRELOADS.map(contribFile => grunt.file.read(contribFile)).join('\n\n')}

${mainCopyright}

${minifiedPhetioCode}\n${filteredMain}`);
};

/**
 * Copy all the third party libraries from sherpa to the build directory under the 'contrib' folder.
 * @param {string} buildDir
 */
const handleContrib = buildDir => {
  grunt.log.debug('Creating phet-io contrib folder');
  CONTRIB_FILES.forEach(filePath => {
    const filePathParts = filePath.split('/');
    const filename = filePathParts[filePathParts.length - 1];
    grunt.file.copy(filePath, `${buildDir}contrib/${filename}`);
  });
};

/**
 * Combine the files necessary to run and host PhET-iO locally into a zip that can be easily downloaded by the client.
 * This does not include any documentation, or wrapper suite wrapper examples.
 * @param {string} buildDir
 * @param {string} repo
 * @param {string} version
 * @returns {Promise.<void>}
 */
const handleOfflineArtifact = async (buildDir, repo, version) => {
  const output = fs.createWriteStream(`${buildDir}${repo}-phet-io-${version}.zip`);
  const archive = archiver('zip');
  archive.on('error', err => grunt.fail.fatal(`error creating archive: ${err}`));
  archive.pipe(output);

  // copy over the lib directory and its contents, and an index to test. Note that these use the files from the buildDir
  // because they have been post-processed and contain filled in template vars.
  archive.directory(`${buildDir}lib`, 'lib');

  // Take from build directory so that it has been filtered/mapped to correct paths.
  archive.file(`${buildDir}${WRAPPERS_FOLDER}/common/html/offline-example.html`, {
    name: 'index.html'
  });

  // get the all html and the debug version too, use `cwd` so that they are at the top level of the zip.
  archive.glob(`${repo}*all*.html`, {
    cwd: `${buildDir}`
  });
  archive.finalize();
  return new Promise(resolve => output.on('close', resolve));
};

/**
 * Generate jsdoc and put it in "build/phet-io/doc"
 * @param {string} buildDir
 * @returns {Promise.<void>}
 */
const handleJSDOC = async buildDir => {
  // Make sure each file exists
  for (let i = 0; i < JSDOC_FILES.length; i++) {
    if (!fs.existsSync(JSDOC_FILES[i])) {
      throw new Error(`file doesnt exist: ${JSDOC_FILES[i]}`);
    }
  }
  const getArgs = explain => ['../chipper/node_modules/jsdoc/jsdoc.js', ...(explain ? ['-X'] : []), ...JSDOC_FILES, '-c', '../phet-io/doc/wrapper/jsdoc-config.json', '-d', `${buildDir}doc/api`, '-t', '../chipper/node_modules/docdash', '--readme', JSDOC_README_FILE];

  // First we tried to run the jsdoc binary as the cmd, but that wasn't working, and was quite finicky. Then @samreid
  // found https://stackoverflow.com/questions/33664843/how-to-use-jsdoc-with-gulp which recommends the following method
  // (node executable with jsdoc js file)
  await execute('node', getArgs(false), process.cwd(), {
    shell: true
  });

  // Running with explanation -X appears to not output the files, so we have to run it twice.
  const explanation = (await execute('node', getArgs(true), process.cwd(), {
    shell: true
  })).trim();

  // Copy the logo file
  const imageDir = `${buildDir}doc/images`;
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
  }
  fs.copyFileSync('../brand/phet-io/images/logoOnWhite.png', `${imageDir}/logo.png`);
  const json = explanation.substring(explanation.indexOf('['), explanation.lastIndexOf(']') + 1);

  // basic sanity checks
  assert(json.length > 5000, 'JSON seems odd');
  try {
    JSON.parse(json);
  } catch (e) {
    assert(false, 'JSON parsing failed');
  }
  fs.writeFileSync(`${buildDir}doc/jsdoc-explanation.json`, json);
};

/**
 * Generates the phet-io client guides and puts them in `build/phet-io/doc/guides/`
 * @param {string} repoName
 * @param {string} simulationDisplayName
 * @param {string} buildDir
 * @param {string} version
 * @param {string} simRepoSHA
 */
const handleClientGuides = (repoName, simulationDisplayName, buildDir, version, simRepoSHA) => {
  const builtClientGuidesOutputDir = `${buildDir}doc/guides/`;
  const clientGuidesSourceRoot = `${PHET_IO_SIM_SPECIFIC}/repos/${repoName}/`;
  const commonDir = `${PHET_IO_SIM_SPECIFIC}/${GUIDES_COMMON_DIR}`;

  // copy over common images and styles
  copyDirectory(commonDir, `${builtClientGuidesOutputDir}`);

  // handle generating and writing the html file for each client guide
  generateAndWriteClientGuide(repoName, `${simulationDisplayName} PhET-iO Guide`, simulationDisplayName, `${commonDir}/${PHET_IO_GUIDE_FILENAME}.md`, `${builtClientGuidesOutputDir}${PHET_IO_GUIDE_FILENAME}.html`, version, simRepoSHA);
  generateAndWriteClientGuide(repoName, `${simulationDisplayName} Examples`, simulationDisplayName, `${clientGuidesSourceRoot}${EXAMPLES_FILENAME}.md`, `${builtClientGuidesOutputDir}${EXAMPLES_FILENAME}.html`, version, simRepoSHA);
};

/**
 * Takes a markdown client guides, fills in the links, and then generates and writes it as html
 * @param {string} repoName
 * @param {string} title
 * @param {string} simulationDisplayName
 * @param {string} mdFilePath - to get the source md file
 * @param {string} destinationPath - to write to
 * @param {string} version
 * @param {string} simRepoSHA
 */
const generateAndWriteClientGuide = (repoName, title, simulationDisplayName, mdFilePath, destinationPath, version, simRepoSHA) => {
  // make sure the source markdown file exists
  if (!fs.existsSync(mdFilePath)) {
    grunt.log.warn(`no client guide found at ${mdFilePath}, no guide being built.`);
    return;
  }
  const simCamelCaseName = _.camelCase(repoName);
  let modelDocumentationLine = '';
  if (fs.existsSync(`../${repoName}/doc/model.md`)) {
    modelDocumentationLine = `* [Model Documentation](https://github.com/phetsims/${repoName}/blob/${simRepoSHA}/doc/model.md)`;
  }

  // fill in links
  let clientGuideSource = grunt.file.read(mdFilePath);

  ///////////////////////////////////////////
  // DO NOT UPDATE OR ADD TO THESE WITHOUT ALSO UPDATING THE LIST IN phet-io-sim-specific/client-guide-common/README.md
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{WRAPPER_INDEX_PATH}}', '../../');
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{SIMULATION_DISPLAY_NAME}}', simulationDisplayName);
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{SIM_PATH}}', `../../${repoName}_all_phet-io.html?postMessageOnError&phetioStandalone`);
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{STUDIO_PATH}}', '../../wrappers/studio/');
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{PHET_IO_GUIDE_PATH}}', `./${PHET_IO_GUIDE_FILENAME}.html`);
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{DATE}}', new Date().toString());
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{simCamelCaseName}}', simCamelCaseName);
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{simKebabName}}', repoName);
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{SIMULATION_VERSION}}', version);
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, '{{MODEL_DOCUMENTATION_LINE}}', modelDocumentationLine);
  ///////////////////////////////////////////

  // support relative and absolute paths for unbuilt common image previews by replacing them with the correct relative path. Order matters!
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, `../../../${GUIDES_COMMON_DIR}`, '');
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, `../../${GUIDES_COMMON_DIR}`, '');
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, `../${GUIDES_COMMON_DIR}`, '');
  clientGuideSource = ChipperStringUtils.replaceAll(clientGuideSource, `/${GUIDES_COMMON_DIR}`, '');
  const renderedClientGuide = marked.parse(clientGuideSource);

  // link a stylesheet
  const clientGuideHTML = `<head>
                   <link rel='stylesheet' href='css/github-markdown.css' type='text/css'>
                   <title>${title}</title>
                 </head>
                 <body>
                 <div class="markdown-body">
                   ${renderedClientGuide}
                 </div>
                 </body>`;

  // write the output to the build directory
  grunt.file.write(destinationPath, clientGuideHTML);
};

/**
 * Support building studio. This compiles the studio modules into a runnable, and copies that over to the expected spot
 * on build.
 * @param {string} repo
 * @param {string} wrappersLocation
 * @returns {Promise.<void>}
 */
const handleStudio = async (repo, wrappersLocation) => {
  grunt.log.debug('building studio');
  const results = await tsc('../studio');
  reportTscResults(results, grunt);
  fs.writeFileSync(`${wrappersLocation}studio/${STUDIO_BUILT_FILENAME}`, await buildStandalone('studio', {
    stripAssertions: false,
    stripLogging: false,
    tempOutputDir: repo
  }));
};

/**
 * Use webpack to bundle the migration rules into a compiled code string, for use in phet-io lib file.
 * @param {string} repo
 * @param {string} buildDir
 * @returns {Promise.<string>}
 */
const getCompiledMigrationRules = async (repo, buildDir) => {
  return new Promise((resolve, reject) => {
    const migrationRulesFilename = `${repo}-migration-rules.js`;
    const entryPointFilename = `../chipper/dist/js/phet-io-sim-specific/repos/${repo}/js/${migrationRulesFilename}`;
    if (!fs.existsSync(entryPointFilename)) {
      console.log(`No migration rules found at ${entryPointFilename}, no rules to be bundled with ${LIB_OUTPUT_FILE}.`);
      resolve(''); // blank string because there are no rules to add.
    } else {
      // output dir must be an absolute path
      const outputDir = path.resolve(__dirname, `../../${repo}/${buildDir}`);
      const compiler = webpack({
        // We uglify as a step after this, with many custom rules. So we do NOT optimize or uglify in this step.
        optimization: {
          minimize: false
        },
        // Simulations or runnables will have a single entry point
        entry: {
          repo: entryPointFilename
        },
        // We output our builds to the following dir
        output: {
          path: outputDir,
          filename: migrationRulesFilename
        }
      });
      compiler.run((err, stats) => {
        if (err || stats.hasErrors()) {
          console.error('Migration rules webpack build errors:', stats.compilation.errors);
          reject(err || stats.compilation.errors[0]);
        } else {
          const jsFile = `${outputDir}/${migrationRulesFilename}`;
          const js = fs.readFileSync(jsFile, 'utf-8');
          fs.unlinkSync(jsFile);
          resolve(js);
        }
      });
    }
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsImFzc2VydCIsImFyY2hpdmVyIiwiQ2hpcHBlclN0cmluZ1V0aWxzIiwiY29weURpcmVjdG9yeSIsImV4ZWN1dGUiLCJmcyIsImdydW50IiwiZ2VuZXJhdGVQaGV0aW9NYWNyb0FQSSIsImZvcm1hdFBoZXRpb0FQSSIsImJ1aWxkU3RhbmRhbG9uZSIsIm1pbmlmeSIsIm1hcmtlZCIsInRzYyIsInJlcG9ydFRzY1Jlc3VsdHMiLCJnZXRQaGV0TGlicyIsInBhdGgiLCJ3ZWJwYWNrIiwiREVESUNBVEVEX1JFUE9fV1JBUFBFUl9QUkVGSVgiLCJXUkFQUEVSX0NPTU1PTl9GT0xERVIiLCJXUkFQUEVSU19GT0xERVIiLCJQSEVUX0lPX1NJTV9TUEVDSUZJQyIsIkdVSURFU19DT01NT05fRElSIiwiRVhBTVBMRVNfRklMRU5BTUUiLCJQSEVUX0lPX0dVSURFX0ZJTEVOQU1FIiwiTElCX09VVFBVVF9GSUxFIiwiVEhJUkRfUEFSVFlfTElCX1BSRUxPQURTIiwiUEhFVF9JT19MSUJfUFJFTE9BRFMiLCJMSUJfUFJFTE9BRFMiLCJjb25jYXQiLCJDT05UUklCX0ZJTEVTIiwidHJhbnNwaWxlZENsaWVudFBhdGgiLCJKU0RPQ19GSUxFUyIsIkpTRE9DX1JFQURNRV9GSUxFIiwiU1RVRElPX0JVSUxUX0ZJTEVOQU1FIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJ2ZXJzaW9uIiwic2ltdWxhdGlvbkRpc3BsYXlOYW1lIiwicGFja2FnZU9iamVjdCIsImJ1aWxkTG9jYWwiLCJnZW5lcmF0ZU1hY3JvQVBJRmlsZSIsInJlcG9QaGV0TGlicyIsImV2ZXJ5IiwiaW5jbHVkZXMiLCJyZWFkRmlsZVN5bmMiLCJ0b1N0cmluZyIsImluZGV4T2YiLCJzaW1SZXBvU0hBIiwidHJpbSIsImJ1aWxkRGlyIiwid3JhcHBlcnNMb2NhdGlvbiIsIm1hdGNoZXMiLCJtYXRjaCIsIkVycm9yIiwibWFqb3IiLCJOdW1iZXIiLCJtaW5vciIsImxhdGVzdFZlcnNpb24iLCJzdGFuZGFyZFBoZXRpb1dyYXBwZXJUZW1wbGF0ZVNrZWxldG9uIiwiY3VzdG9tUGhldGlvV3JhcHBlclRlbXBsYXRlU2tlbGV0b24iLCJmaWx0ZXJXcmFwcGVyIiwiYWJzUGF0aCIsImNvbnRlbnRzIiwib3JpZ2luYWxDb250ZW50cyIsImlzV3JhcHBlckluZGV4IiwicGF0aFRvTGliIiwiZm9yRWFjaCIsImZpbGVQYXRoIiwiZmlsZVBhdGhQYXJ0cyIsInNwbGl0IiwibmVlZHNFeHRyYURvdHMiLCJmaWxlTmFtZSIsImxlbmd0aCIsImNvbnRyaWJGaWxlTmFtZSIsInBhdGhUb0NvbnRyaWIiLCJyZXBsYWNlQWxsIiwiaW5jbHVkZXNFbGVtZW50IiwibGluZSIsImFycmF5IiwiZmluZCIsImVsZW1lbnQiLCJmaWx0ZXIiLCJqb2luIiwicmVwbGFjZSIsImdldEd1aWRlUm93VGV4dCIsImxpbmtUZXh0IiwiZGVzY3JpcHRpb24iLCJleGFtcGxlUm93Q29udGVudHMiLCJleGlzdHNTeW5jIiwiZW5kc1dpdGgiLCJsaW5lcyIsInBydW5lZCIsImkiLCJwdXNoIiwid3JhcHBlcnMiLCJtYXAiLCJ3cmFwcGVyc1VuYWxsb3dlZCIsImxpYkZpbGVOYW1lcyIsInBhcnRzIiwiZnVsbFVuYWxsb3dlZExpc3QiLCJjb3B5V3JhcHBlciIsInNyYyIsImRlc3QiLCJ3cmFwcGVyIiwid3JhcHBlck5hbWUiLCJ3cmFwcGVyRmlsdGVyV2l0aE5hbWVGaWx0ZXIiLCJyZXN1bHQiLCJleGNsdWRlIiwibWluaWZ5SlMiLCJtaW5pZnlPcHRpb25zIiwic3RyaXBBc3NlcnRpb25zIiwic2ltU3BlY2lmaWNXcmFwcGVycyIsInJlYWRkaXJTeW5jIiwid2l0aEZpbGVUeXBlcyIsImRpcmVudCIsImlzRGlyZWN0b3J5IiwibmFtZSIsImUiLCJhZGRpdGlvbmFsV3JhcHBlcnMiLCJwaGV0Iiwid3JhcHBlclBhcnRzIiwiaGFuZGxlTGliIiwiaGFuZGxlT2ZmbGluZUFydGlmYWN0IiwiaGFuZGxlQ29udHJpYiIsImhhbmRsZUpTRE9DIiwiaGFuZGxlQ2xpZW50R3VpZGVzIiwiaGFuZGxlU3R1ZGlvIiwiZnVsbEFQSSIsImZyb21CdWlsdFZlcnNpb24iLCJmaWxlIiwid3JpdGUiLCJybVN5bmMiLCJyZWN1cnNpdmUiLCJsb2ciLCJkZWJ1ZyIsIm1rZGlyIiwicGhldGlvTGliQ29kZSIsImxpYkZpbGUiLCJyZWFkIiwiZmlsdGVyZWRDb250ZW50cyIsIm1pZ3JhdGlvblJ1bGVzQ29kZSIsImdldENvbXBpbGVkTWlncmF0aW9uUnVsZXMiLCJtaW5pZmllZFBoZXRpb0NvZGUiLCJyZXN1bHRzIiwid3JhcHBlcnNNYWluIiwic3RyaXBMb2dnaW5nIiwidGVtcE91dHB1dERpciIsIm9taXRQcmVsb2FkcyIsImZpbHRlcmVkTWFpbiIsIm1haW5Db3B5cmlnaHQiLCJEYXRlIiwiZ2V0RnVsbFllYXIiLCJjb250cmliRmlsZSIsImZpbGVuYW1lIiwiY29weSIsIm91dHB1dCIsImNyZWF0ZVdyaXRlU3RyZWFtIiwiYXJjaGl2ZSIsIm9uIiwiZXJyIiwiZmFpbCIsImZhdGFsIiwicGlwZSIsImRpcmVjdG9yeSIsImdsb2IiLCJjd2QiLCJmaW5hbGl6ZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiZ2V0QXJncyIsImV4cGxhaW4iLCJwcm9jZXNzIiwic2hlbGwiLCJleHBsYW5hdGlvbiIsImltYWdlRGlyIiwibWtkaXJTeW5jIiwiY29weUZpbGVTeW5jIiwianNvbiIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiSlNPTiIsInBhcnNlIiwid3JpdGVGaWxlU3luYyIsInJlcG9OYW1lIiwiYnVpbHRDbGllbnRHdWlkZXNPdXRwdXREaXIiLCJjbGllbnRHdWlkZXNTb3VyY2VSb290IiwiY29tbW9uRGlyIiwiZ2VuZXJhdGVBbmRXcml0ZUNsaWVudEd1aWRlIiwidGl0bGUiLCJtZEZpbGVQYXRoIiwiZGVzdGluYXRpb25QYXRoIiwid2FybiIsInNpbUNhbWVsQ2FzZU5hbWUiLCJjYW1lbENhc2UiLCJtb2RlbERvY3VtZW50YXRpb25MaW5lIiwiY2xpZW50R3VpZGVTb3VyY2UiLCJyZW5kZXJlZENsaWVudEd1aWRlIiwiY2xpZW50R3VpZGVIVE1MIiwicmVqZWN0IiwibWlncmF0aW9uUnVsZXNGaWxlbmFtZSIsImVudHJ5UG9pbnRGaWxlbmFtZSIsImNvbnNvbGUiLCJvdXRwdXREaXIiLCJfX2Rpcm5hbWUiLCJjb21waWxlciIsIm9wdGltaXphdGlvbiIsIm1pbmltaXplIiwiZW50cnkiLCJydW4iLCJzdGF0cyIsImhhc0Vycm9ycyIsImVycm9yIiwiY29tcGlsYXRpb24iLCJlcnJvcnMiLCJqc0ZpbGUiLCJqcyIsInVubGlua1N5bmMiXSwic291cmNlcyI6WyJjb3B5U3VwcGxlbWVudGFsUGhldGlvRmlsZXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29waWVzIGFsbCBzdXBwb3J0aW5nIFBoRVQtaU8gZmlsZXMsIGluY2x1ZGluZyB3cmFwcGVycywgaW5kaWNlcywgbGliIGZpbGVzLCBldGMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNYXR0IFBlbm5pbmd0b24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuXHJcbi8vIG1vZHVsZXNcclxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XHJcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XHJcbmNvbnN0IGFyY2hpdmVyID0gcmVxdWlyZSggJ2FyY2hpdmVyJyApO1xyXG5jb25zdCBDaGlwcGVyU3RyaW5nVXRpbHMgPSByZXF1aXJlKCAnLi4vY29tbW9uL0NoaXBwZXJTdHJpbmdVdGlscycgKTtcclxuY29uc3QgY29weURpcmVjdG9yeSA9IHJlcXVpcmUoICcuLi9ncnVudC9jb3B5RGlyZWN0b3J5JyApO1xyXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZXhlY3V0ZScgKTtcclxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XHJcbmNvbnN0IGdydW50ID0gcmVxdWlyZSggJ2dydW50JyApO1xyXG5jb25zdCBnZW5lcmF0ZVBoZXRpb01hY3JvQVBJID0gcmVxdWlyZSggJy4uL3BoZXQtaW8vZ2VuZXJhdGVQaGV0aW9NYWNyb0FQSScgKTtcclxuY29uc3QgZm9ybWF0UGhldGlvQVBJID0gcmVxdWlyZSggJy4uL3BoZXQtaW8vZm9ybWF0UGhldGlvQVBJJyApO1xyXG5jb25zdCBidWlsZFN0YW5kYWxvbmUgPSByZXF1aXJlKCAnLi4vZ3J1bnQvYnVpbGRTdGFuZGFsb25lJyApO1xyXG5jb25zdCBtaW5pZnkgPSByZXF1aXJlKCAnLi4vZ3J1bnQvbWluaWZ5JyApO1xyXG5jb25zdCBtYXJrZWQgPSByZXF1aXJlKCAnbWFya2VkJyApO1xyXG5jb25zdCB0c2MgPSByZXF1aXJlKCAnLi90c2MnICk7XHJcbmNvbnN0IHJlcG9ydFRzY1Jlc3VsdHMgPSByZXF1aXJlKCAnLi9yZXBvcnRUc2NSZXN1bHRzJyApO1xyXG5jb25zdCBnZXRQaGV0TGlicyA9IHJlcXVpcmUoICcuL2dldFBoZXRMaWJzJyApO1xyXG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XHJcbmNvbnN0IHdlYnBhY2sgPSByZXF1aXJlKCAnd2VicGFjaycgKTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBERURJQ0FURURfUkVQT19XUkFQUEVSX1BSRUZJWCA9ICdwaGV0LWlvLXdyYXBwZXItJztcclxuY29uc3QgV1JBUFBFUl9DT01NT05fRk9MREVSID0gJ3BoZXQtaW8td3JhcHBlcnMvY29tbW9uJztcclxuY29uc3QgV1JBUFBFUlNfRk9MREVSID0gJ3dyYXBwZXJzLyc7IC8vIFRoZSB3cmFwcGVyIGluZGV4IGFzc3VtZXMgdGhpcyBjb25zdGFudCwgcGxlYXNlIHNlZSBwaGV0LWlvLXdyYXBwZXJzL2luZGV4L2luZGV4LmpzIGJlZm9yZSBjaGFuZ2luZ1xyXG5cclxuLy8gRm9yIENsaWVudCBHdWlkZXNcclxuY29uc3QgUEhFVF9JT19TSU1fU1BFQ0lGSUMgPSAnLi4vcGhldC1pby1zaW0tc3BlY2lmaWMnO1xyXG5jb25zdCBHVUlERVNfQ09NTU9OX0RJUiA9ICdjbGllbnQtZ3VpZGUtY29tbW9uL2NsaWVudC1ndWlkZSc7XHJcblxyXG5jb25zdCBFWEFNUExFU19GSUxFTkFNRSA9ICdleGFtcGxlcyc7XHJcbmNvbnN0IFBIRVRfSU9fR1VJREVfRklMRU5BTUUgPSAncGhldC1pby1ndWlkZSc7XHJcblxyXG5jb25zdCBMSUJfT1VUUFVUX0ZJTEUgPSAncGhldC1pby5qcyc7XHJcblxyXG4vLyBUaGVzZSBmaWxlcyBhcmUgYnVuZGxlZCBpbnRvIHRoZSBsaWIvcGhldC1pby5qcyBmaWxlIGJlZm9yZSBQaEVUJ3MgcGhldC1pbyBjb2RlLCBhbmQgY2FuIGJlIHVzZWQgYnkgYW55IHdyYXBwZXJcclxuY29uc3QgVEhJUkRfUEFSVFlfTElCX1BSRUxPQURTID0gW1xyXG4gICcuLi9zaGVycGEvbGliL3JlYWN0LTE4LjEuMC5wcm9kdWN0aW9uLm1pbi5qcycsXHJcbiAgJy4uL3NoZXJwYS9saWIvcmVhY3QtZG9tLTE4LjEuMC5wcm9kdWN0aW9uLm1pbi5qcycsXHJcbiAgJy4uL3NoZXJwYS9saWIvcGFrby0yLjAuMy5taW4uanMnLFxyXG4gICcuLi9zaGVycGEvbGliL2xvZGFzaC00LjE3LjQubWluLmpzJ1xyXG5dO1xyXG5cclxuLy8gcGhldC1pbyBpbnRlcm5hbCBmaWxlcyB0byBiZSBjb25zb2xpZGF0ZWQgaW50byAxIGZpbGUgYW5kIHB1YmxpY2x5IHNlcnZlZCBhcyBhIG1pbmlmaWVkIHBoZXQtaW8gbGlicmFyeS5cclxuLy8gTWFrZSBzdXJlIHRvIGFkZCBuZXcgZmlsZXMgdG8gdGhlIGpzZG9jIGdlbmVyYXRpb24gbGlzdCBiZWxvdyBhbHNvXHJcbmNvbnN0IFBIRVRfSU9fTElCX1BSRUxPQURTID0gW1xyXG4gICcuLi9xdWVyeS1zdHJpbmctbWFjaGluZS9qcy9RdWVyeVN0cmluZ01hY2hpbmUuanMnLCAvLyBtdXN0IGJlIGZpcnN0LCBvdGhlciB0eXBlcyB1c2UgdGhpc1xyXG4gICcuLi9hc3NlcnQvanMvYXNzZXJ0LmpzJyxcclxuICAnLi4vY2hpcHBlci9qcy9waGV0LWlvL3BoZXRpb0NvbXBhcmVBUElzLmpzJyxcclxuICAnLi4vdGFuZGVtL2pzL1BoZXRpb0lEVXRpbHMuanMnLFxyXG4gICcuLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL1NpbVZlcnNpb24uanMnXHJcbl07XHJcblxyXG5jb25zdCBMSUJfUFJFTE9BRFMgPSBUSElSRF9QQVJUWV9MSUJfUFJFTE9BRFMuY29uY2F0KCBQSEVUX0lPX0xJQl9QUkVMT0FEUyApO1xyXG5cclxuLy8gQWRkaXRpb25hbCBsaWJyYXJpZXMgYW5kIHRoaXJkIHBhcnR5IGZpbGVzIHRoYXQgYXJlIHVzZWQgYnkgc29tZSBwaGV0LWlvIHdyYXBwZXJzLCBjb3BpZWQgdG8gYSBjb250cmliLyBkaXJlY3RvcnkuXHJcbi8vIFRoZXNlIGFyZSBub3QgYnVuZGxlZCB3aXRoIHRoZSBsaWIgZmlsZSB0byByZWR1Y2UgdGhlIHNpemUgb2YgdGhlIGNlbnRyYWwgZGVwZW5kZW5jeSBvZiBQaEVULWlPIHdyYXBwZXJzLlxyXG5jb25zdCBDT05UUklCX0ZJTEVTID0gW1xyXG4gICcuLi9zaGVycGEvbGliL3VhLXBhcnNlci0wLjcuMjEubWluLmpzJyxcclxuICAnLi4vc2hlcnBhL2xpYi9ib290c3RyYXAtMi4yLjIuanMnLFxyXG4gICcuLi9zaGVycGEvbGliL2ZvbnQtYXdlc29tZS00LjUuMCcsXHJcbiAgJy4uL3NoZXJwYS9saWIvanF1ZXJ5LTIuMS4wLm1pbi5qcycsXHJcbiAgJy4uL3NoZXJwYS9saWIvanF1ZXJ5LXVpLTEuOC4yNC5taW4uanMnLFxyXG4gICcuLi9zaGVycGEvbGliL2QzLTQuMi4yLmpzJyxcclxuICAnLi4vc2hlcnBhL2xpYi9qc29uZGlmZnBhdGNoLXYwLjMuMTEudW1kLmpzJyxcclxuICAnLi4vc2hlcnBhL2xpYi9qc29uZGlmZnBhdGNoLXYwLjMuMTEtYW5ub3RhdGVkLmNzcycsXHJcbiAgJy4uL3NoZXJwYS9saWIvanNvbmRpZmZwYXRjaC12MC4zLjExLWh0bWwuY3NzJyxcclxuICAnLi4vc2hlcnBhL2xpYi9wcmlzbS0xLjIzLjAuanMnLFxyXG4gICcuLi9zaGVycGEvbGliL3ByaXNtLW9rYWlkaWEtMS4yMy4wLmNzcycsXHJcbiAgJy4uL3NoZXJwYS9saWIvY2xhcmluZXQtMC4xMi40LmpzJ1xyXG5dO1xyXG5cclxuLy8gVGhpcyBwYXRoIGlzIHVzZWQgZm9yIGpzZG9jLiBUcmFuc3BpbGF0aW9uIGhhcHBlbnMgYmVmb3JlIHdlIGdldCB0byB0aGlzIHBvaW50LiBTUiBhbmQgTUsgcmVjb2duaXplIHRoYXQgdGhpcyBmZWVsc1xyXG4vLyBhIGJpdCByaXNreSwgZXZlbiB0aG91Z2ggY29tbWVudHMgYXJlIGN1cnJlbnRseSBwcmVzZXJ2ZWQgaW4gdGhlIGJhYmVsIHRyYW5zcGlsZSBzdGVwLiBTZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTE3MjA4OTQvaXMtdGhlcmUtYW55LXdheS10by11c2UtanNkb2Mtd2l0aC10cy1maWxlcy1tYXliZS10cmFuc3BpbGUtd2l0aC1iYWJlbC10aGVcclxuY29uc3QgdHJhbnNwaWxlZENsaWVudFBhdGggPSBgLi4vY2hpcHBlci9kaXN0L2pzLyR7V1JBUFBFUl9DT01NT05fRk9MREVSfS9qcy9DbGllbnQuanNgO1xyXG5cclxuLy8gTGlzdCBvZiBmaWxlcyB0byBydW4ganNkb2MgZ2VuZXJhdGlvbiB3aXRoLiBUaGlzIGxpc3QgaXMgbWFudWFsIHRvIGtlZXAgZmlsZXMgZnJvbSBzbmVha2luZyBpbnRvIHRoZSBwdWJsaWMgZG9jdW1lbnRhdGlvbi5cclxuY29uc3QgSlNET0NfRklMRVMgPSBbXHJcbiAgdHJhbnNwaWxlZENsaWVudFBhdGgsXHJcbiAgJy4uL3RhbmRlbS9qcy9QaGV0aW9JRFV0aWxzLmpzJyxcclxuICAnLi4vcGhldC1pby9qcy9waGV0LWlvLWluaXRpYWxpemUtZ2xvYmFscy5qcycsXHJcbiAgJy4uL2NoaXBwZXIvanMvaW5pdGlhbGl6ZS1nbG9iYWxzLmpzJ1xyXG5dO1xyXG5jb25zdCBKU0RPQ19SRUFETUVfRklMRSA9ICcuLi9waGV0LWlvL2RvYy93cmFwcGVyL3BoZXQtaW8tZG9jdW1lbnRhdGlvbl9SRUFETUUubWQnO1xyXG5cclxuY29uc3QgU1RVRElPX0JVSUxUX0ZJTEVOQU1FID0gJ3N0dWRpby5taW4uanMnO1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzaW11bGF0aW9uRGlzcGxheU5hbWVcclxuICogQHBhcmFtIHtPYmplY3R9IHBhY2thZ2VPYmplY3RcclxuICogQHBhcmFtIHtPYmplY3R9IGJ1aWxkTG9jYWxcclxuICogQHBhcmFtIHtib29sZWFufSBbZ2VuZXJhdGVNYWNyb0FQSUZpbGVdXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jICggcmVwbywgdmVyc2lvbiwgc2ltdWxhdGlvbkRpc3BsYXlOYW1lLCBwYWNrYWdlT2JqZWN0LCBidWlsZExvY2FsLCBnZW5lcmF0ZU1hY3JvQVBJRmlsZSA9IGZhbHNlICkgPT4ge1xyXG5cclxuICBjb25zdCByZXBvUGhldExpYnMgPSBnZXRQaGV0TGlicyggcmVwbywgJ3BoZXQtaW8nICk7XHJcbiAgYXNzZXJ0KCBfLmV2ZXJ5KCBnZXRQaGV0TGlicyggJ3BoZXQtaW8td3JhcHBlcnMnICksIHJlcG8gPT4gcmVwb1BoZXRMaWJzLmluY2x1ZGVzKCByZXBvICkgKSxcclxuICAgICdldmVyeSBkZXBlbmRlbmN5IG9mIHBoZXQtaW8td3JhcHBlcnMgaXMgbm90IGluY2x1ZGVkIGluIHBoZXRMaWJzIG9mICcgKyByZXBvICsgJyAnICsgcmVwb1BoZXRMaWJzICsgJyAnICsgZ2V0UGhldExpYnMoICdwaGV0LWlvLXdyYXBwZXJzJyApICk7XHJcbiAgYXNzZXJ0KCBfLmV2ZXJ5KCBnZXRQaGV0TGlicyggJ3N0dWRpbycgKSwgcmVwbyA9PiByZXBvUGhldExpYnMuaW5jbHVkZXMoIHJlcG8gKSApLFxyXG4gICAgJ2V2ZXJ5IGRlcGVuZGVuY3kgb2Ygc3R1ZGlvIGlzIG5vdCBpbmNsdWRlZCBpbiBwaGV0TGlicyBvZiAnICsgcmVwbyArICcgJyArIHJlcG9QaGV0TGlicyArICcgJyArIGdldFBoZXRMaWJzKCAnc3R1ZGlvJyApICk7XHJcblxyXG4gIC8vIFRoaXMgbXVzdCBiZSBjaGVja2VkIGFmdGVyIGNvcHlTdXBwbGVtZW50YWxQaGV0aW9GaWxlcyBpcyBjYWxsZWQsIHNpbmNlIGFsbCB0aGUgaW1wb3J0cyBhbmQgb3V0ZXIgY29kZSBpcyBydW4gaW5cclxuICAvLyBldmVyeSBicmFuZC4gRGV2ZWxvcGVycyB3aXRob3V0IHBoZXQtaW8gY2hlY2tlZCBvdXQgc3RpbGwgbmVlZCB0byBiZSBhYmxlIHRvIGJ1aWxkLlxyXG4gIGFzc2VydCggZnMucmVhZEZpbGVTeW5jKCB0cmFuc3BpbGVkQ2xpZW50UGF0aCApLnRvU3RyaW5nKCkuaW5kZXhPZiggJy8qKicgKSA+PSAwLCAnYmFiZWwgc2hvdWxkIG5vdCBzdHJpcCBjb21tZW50cyBmcm9tIHRyYW5zcGlsaW5nJyApO1xyXG5cclxuICBjb25zdCBzaW1SZXBvU0hBID0gKCBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAncmV2LXBhcnNlJywgJ0hFQUQnIF0sIGAuLi8ke3JlcG99YCApICkudHJpbSgpO1xyXG5cclxuICBjb25zdCBidWlsZERpciA9IGAuLi8ke3JlcG99L2J1aWxkL3BoZXQtaW8vYDtcclxuICBjb25zdCB3cmFwcGVyc0xvY2F0aW9uID0gYCR7YnVpbGREaXJ9JHtXUkFQUEVSU19GT0xERVJ9YDtcclxuXHJcbiAgLy8gVGhpcyByZWdleCB3YXMgY29waWVkIGZyb20gcGVyZW5uaWFsJ3MgYFNpbVZlcnNpb24ucGFyc2UoKWAgY29uc3VsdCB0aGF0IGNvZGUgYmVmb3JlIGNoYW5naW5nIHRoaW5ncyBoZXJlLlxyXG4gIGNvbnN0IG1hdGNoZXMgPSB2ZXJzaW9uLm1hdGNoKCAvXihcXGQrKVxcLihcXGQrKVxcLihcXGQrKSgtKChbXi4tXSspXFwuKFxcZCspKSk/KC0oW14uLV0rKSk/JC8gKTtcclxuICBpZiAoICFtYXRjaGVzICkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCBgY291bGQgbm90IHBhcnNlIHZlcnNpb246ICR7dmVyc2lvbn1gICk7XHJcbiAgfVxyXG4gIGNvbnN0IG1ham9yID0gTnVtYmVyKCBtYXRjaGVzWyAxIF0gKTtcclxuICBjb25zdCBtaW5vciA9IE51bWJlciggbWF0Y2hlc1sgMiBdICk7XHJcbiAgY29uc3QgbGF0ZXN0VmVyc2lvbiA9IGAke21ham9yfS4ke21pbm9yfWA7XHJcblxyXG4gIGNvbnN0IHN0YW5kYXJkUGhldGlvV3JhcHBlclRlbXBsYXRlU2tlbGV0b24gPSBmcy5yZWFkRmlsZVN5bmMoICcuLi9waGV0LWlvLXdyYXBwZXJzL2NvbW1vbi9odG1sL3N0YW5kYXJkUGhldGlvV3JhcHBlclRlbXBsYXRlU2tlbGV0b24uaHRtbCcsICd1dGY4JyApO1xyXG4gIGNvbnN0IGN1c3RvbVBoZXRpb1dyYXBwZXJUZW1wbGF0ZVNrZWxldG9uID0gZnMucmVhZEZpbGVTeW5jKCAnLi4vcGhldC1pby13cmFwcGVycy9jb21tb24vaHRtbC9jdXN0b21QaGV0aW9XcmFwcGVyVGVtcGxhdGVTa2VsZXRvbi5odG1sJywgJ3V0ZjgnICk7XHJcblxyXG4gIGFzc2VydCggIXN0YW5kYXJkUGhldGlvV3JhcHBlclRlbXBsYXRlU2tlbGV0b24uaW5jbHVkZXMoICdgJyApLCAnVGhlIHRlbXBsYXRlcyBjYW5ub3QgY29udGFpbiBiYWNrdGlja3MgZHVlIHRvIGhvdyB0aGUgdGVtcGxhdGVzIGFyZSBwYXNzZWQgdGhyb3VnaCBiZWxvdycgKTtcclxuICBhc3NlcnQoICFjdXN0b21QaGV0aW9XcmFwcGVyVGVtcGxhdGVTa2VsZXRvbi5pbmNsdWRlcyggJ2AnICksICdUaGUgdGVtcGxhdGVzIGNhbm5vdCBjb250YWluIGJhY2t0aWNrcyBkdWUgdG8gaG93IHRoZSB0ZW1wbGF0ZXMgYXJlIHBhc3NlZCB0aHJvdWdoIGJlbG93JyApO1xyXG5cclxuICAvLyBUaGUgZmlsdGVyIHRoYXQgd2UgcnVuIGV2ZXJ5IHBoZXQtaW8gd3JhcHBlciBmaWxlIHRocm91Z2ggdG8gdHJhbnNmb3JtIGRldiBjb250ZW50IGludG8gYnVpbHQgY29udGVudC4gVGhpcyBtYWlubHlcclxuICAvLyBpbnZvbHZlcyBsb3RzIG9mIGhhcmQgY29kZWQgY29weSByZXBsYWNlIG9mIHRlbXBsYXRlIHN0cmluZ3MgYW5kIG1hcmtlciB2YWx1ZXMuXHJcbiAgY29uc3QgZmlsdGVyV3JhcHBlciA9ICggYWJzUGF0aCwgY29udGVudHMgKSA9PiB7XHJcbiAgICBjb25zdCBvcmlnaW5hbENvbnRlbnRzID0gYCR7Y29udGVudHN9YDtcclxuXHJcbiAgICBjb25zdCBpc1dyYXBwZXJJbmRleCA9IGFic1BhdGguaW5kZXhPZiggJ2luZGV4L2luZGV4Lmh0bWwnICkgPj0gMDtcclxuXHJcbiAgICAvLyBGb3IgaW5mbyBhYm91dCBMSUJfT1VUUFVUX0ZJTEUsIHNlZSBoYW5kbGVMaWIoKVxyXG4gICAgY29uc3QgcGF0aFRvTGliID0gYGxpYi8ke0xJQl9PVVRQVVRfRklMRX1gO1xyXG5cclxuICAgIGlmICggYWJzUGF0aC5pbmRleE9mKCAnLmh0bWwnICkgPj0gMCApIHtcclxuXHJcbiAgICAgIC8vIGNoYW5nZSB0aGUgcGF0aHMgb2Ygc2hlcnBhIGZpbGVzIHRvIHBvaW50IHRvIHRoZSBjb250cmliLyBmb2xkZXJcclxuICAgICAgQ09OVFJJQl9GSUxFUy5mb3JFYWNoKCBmaWxlUGF0aCA9PiB7XHJcblxyXG4gICAgICAgIC8vIE5vIG5lZWQgdG8gZG8gdGhpcyBpcyB0aGlzIGZpbGUgZG9lc24ndCBoYXZlIHRoaXMgY29udHJpYiBpbXBvcnQgaW4gaXQuXHJcbiAgICAgICAgaWYgKCBjb250ZW50cy5pbmRleE9mKCBmaWxlUGF0aCApID49IDAgKSB7XHJcblxyXG4gICAgICAgICAgY29uc3QgZmlsZVBhdGhQYXJ0cyA9IGZpbGVQYXRoLnNwbGl0KCAnLycgKTtcclxuXHJcbiAgICAgICAgICAvLyBJZiB0aGUgZmlsZSBpcyBpbiBhIGRlZGljYXRlZCB3cmFwcGVyIHJlcG8sIHRoZW4gaXQgaXMgb25lIGxldmVsIGhpZ2hlciBpbiB0aGUgZGlyIHRyZWUsIGFuZCBuZWVkcyAxIGxlc3Mgc2V0IG9mIGRvdHMuXHJcbiAgICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8td3JhcHBlcnMvaXNzdWVzLzE3IGZvciBtb3JlIGluZm8uIFRoaXMgaXMgaG9wZWZ1bGx5IGEgdGVtcG9yYXJ5IHdvcmthcm91bmRcclxuICAgICAgICAgIGNvbnN0IG5lZWRzRXh0cmFEb3RzID0gYWJzUGF0aC5pbmRleE9mKCBERURJQ0FURURfUkVQT19XUkFQUEVSX1BSRUZJWCApID49IDA7XHJcbiAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IGZpbGVQYXRoUGFydHNbIGZpbGVQYXRoUGFydHMubGVuZ3RoIC0gMSBdO1xyXG4gICAgICAgICAgY29uc3QgY29udHJpYkZpbGVOYW1lID0gYGNvbnRyaWIvJHtmaWxlTmFtZX1gO1xyXG4gICAgICAgICAgbGV0IHBhdGhUb0NvbnRyaWIgPSBuZWVkc0V4dHJhRG90cyA/IGAuLi8uLi8ke2NvbnRyaWJGaWxlTmFtZX1gIDogYC4uLyR7Y29udHJpYkZpbGVOYW1lfWA7XHJcblxyXG4gICAgICAgICAgLy8gVGhlIHdyYXBwZXIgaW5kZXggaXMgYSBkaWZmZXJlbnQgY2FzZSBiZWNhdXNlIGl0IGlzIHBsYWNlZCBhdCB0aGUgdG9wIGxldmVsIG9mIHRoZSBidWlsZCBkaXIuXHJcbiAgICAgICAgICBpZiAoIGlzV3JhcHBlckluZGV4ICkge1xyXG5cclxuICAgICAgICAgICAgcGF0aFRvQ29udHJpYiA9IGNvbnRyaWJGaWxlTmFtZTtcclxuICAgICAgICAgICAgZmlsZVBhdGggPSBgLi4vJHtmaWxlUGF0aH1gOyAvLyBmaWxlUGF0aCBoYXMgb25lIGxlc3Mgc2V0IG9mIHJlbGF0aXZlIHRoYW4gYXJlIGFjdHVhbGx5IGluIHRoZSBpbmRleC5odG1sIGZpbGUuXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgZmlsZVBhdGgsIHBhdGhUb0NvbnRyaWIgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbnN0IGluY2x1ZGVzRWxlbWVudCA9ICggbGluZSwgYXJyYXkgKSA9PiAhIWFycmF5LmZpbmQoIGVsZW1lbnQgPT4gbGluZS5pbmNsdWRlcyggZWxlbWVudCApICk7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgZmlsZXMgbGlzdGVkIGFzIHByZWxvYWRzIHRvIHRoZSBwaGV0LWlvIGxpYiBmaWxlLlxyXG4gICAgICBjb250ZW50cyA9IGNvbnRlbnRzLnNwbGl0KCAvXFxyP1xcbi8gKS5maWx0ZXIoIGxpbmUgPT4gIWluY2x1ZGVzRWxlbWVudCggbGluZSwgTElCX1BSRUxPQURTICkgKS5qb2luKCAnXFxuJyApO1xyXG5cclxuICAgICAgLy8gRGVsZXRlIHRoZSBpbXBvcnRzIHRoZSBwaGV0LWlvLXdyYXBwZXJzLW1haW4sIGFzIGl0IHdpbGwgYmUgYnVuZGxlZCB3aXRoIHRoZSBwaGV0LWlvLmpzIGxpYiBmaWxlLlxyXG4gICAgICAvLyBNVVNUIEdPIEJFRk9SRSBCRUxPVyBSRVBMQUNFOiAncGhldC1pby13cmFwcGVycy8nIC0+ICcvJ1xyXG4gICAgICBjb250ZW50cyA9IGNvbnRlbnRzLnJlcGxhY2UoXHJcbiAgICAgICAgLzxzY3JpcHQgdHlwZT1cIm1vZHVsZVwiIHNyYz1cIiguLlxcLykrY2hpcHBlclxcL2Rpc3RcXC9qc1xcL3BoZXQtaW8td3JhcHBlcnNcXC9qc1xcL3BoZXQtaW8td3JhcHBlcnMtbWFpbi5qc1wiPjxcXC9zY3JpcHQ+L2csIC8vICcuKicgaXMgdG8gc3VwcG9ydCBgZGF0YS1jbGllbnQtbmFtZWAgaW4gd3JhcHBlcnMgbGlrZSBcIm11bHRpXCJcclxuICAgICAgICAnJyApO1xyXG5cclxuICAgICAgLy8gU3VwcG9ydCB3cmFwcGVycyB0aGF0IHVzZSBjb2RlIGZyb20gcGhldC1pby13cmFwcGVyc1xyXG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgJy9waGV0LWlvLXdyYXBwZXJzLycsICcvJyApO1xyXG5cclxuICAgICAgLy8gRG9uJ3QgdXNlIENoaXBwZXJTdHJpbmdVdGlscyBiZWNhdXNlIHdlIHdhbnQgdG8gY2FwdHVyZSB0aGUgcmVsYXRpdmUgcGF0aCBhbmQgdHJhbnNmZXIgaXQgdG8gdGhlIG5ldyBzY3JpcHQuXHJcbiAgICAgIC8vIFRoaXMgaXMgdG8gc3VwcG9ydCBwcm92aWRpbmcgdGhlIHJlbGF0aXZlIHBhdGggdGhyb3VnaCB0aGUgYnVpbGQgaW5zdGVhZCBvZiBqdXN0IGhhcmQgY29kaW5nIGl0LlxyXG4gICAgICBjb250ZW50cyA9IGNvbnRlbnRzLnJlcGxhY2UoXHJcbiAgICAgICAgLzwhLS0oPHNjcmlwdCBzcmM9XCJbLi9dKlxce1xce1BBVEhfVE9fTElCX0ZJTEV9fVwiLio+PFxcL3NjcmlwdD4pLS0+L2csIC8vICcuKicgaXMgdG8gc3VwcG9ydCBgZGF0YS1jbGllbnQtbmFtZWAgaW4gd3JhcHBlcnMgbGlrZSBcIm11bHRpXCJcclxuICAgICAgICAnJDEnIC8vIGp1c3QgdW5jb21tZW50LCBkb24ndCBmaWxsIGl0IGluIHlldFxyXG4gICAgICApO1xyXG5cclxuICAgICAgY29udGVudHMgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY29udGVudHMsXHJcbiAgICAgICAgJzwhLS17e0dPT0dMRV9BTkFMWVRJQ1MuanN9fS0tPicsXHJcbiAgICAgICAgJzxzY3JpcHQgc3JjPVwiL2Fzc2V0cy9qcy9waGV0LWlvLWdhLmpzXCI+PC9zY3JpcHQ+J1xyXG4gICAgICApO1xyXG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cyxcclxuICAgICAgICAnPCEtLXt7RkFWSUNPTi5pY299fS0tPicsXHJcbiAgICAgICAgJzxsaW5rIHJlbD1cInNob3J0Y3V0IGljb25cIiBocmVmPVwiL2Fzc2V0cy9mYXZpY29uLmljb1wiLz4nXHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyBUaGVyZSBzaG91bGQgbm90IGJlIGFueSBpbXBvcnRzIG9mIENsaWVudCBkaXJlY3RseSBleGNlcHQgdXNpbmcgdGhlIFwibXVsdGktd3JhcHBlclwiIGZ1bmN0aW9uYWxpdHkgb2ZcclxuICAgICAgLy8gcHJvdmlkaW5nIGEgP2NsaWVudE5hbWUsIGZvciB1bmJ1aWx0IG9ubHksIHNvIHdlIHJlbW92ZSBpdCBoZXJlLlxyXG4gICAgICBjb250ZW50cyA9IGNvbnRlbnRzLnJlcGxhY2UoXHJcbiAgICAgICAgL14uKlxcL2NvbW1vblxcL2pzXFwvQ2xpZW50LmpzLiokL21nLFxyXG4gICAgICAgICcnXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIGFic1BhdGguaW5kZXhPZiggJy5qcycgKSA+PSAwIHx8IGFic1BhdGguaW5kZXhPZiggJy5odG1sJyApID49IDAgKSB7XHJcblxyXG4gICAgICAvLyBGaWxsIHRoZXNlIGluIGZpcnN0IHNvIHRoZSBmb2xsb3dpbmcgbGluZXMgd2lsbCBhbHNvIGhpdCB0aGUgY29udGVudCBpbiB0aGVzZSB0ZW1wbGF0ZSB2YXJzXHJcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tDVVNUT01fV1JBUFBFUl9TS0VMRVRPTn19JywgY3VzdG9tUGhldGlvV3JhcHBlclRlbXBsYXRlU2tlbGV0b24gKTtcclxuICAgICAgY29udGVudHMgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY29udGVudHMsICd7e1NUQU5EQVJEX1dSQVBQRVJfU0tFTEVUT059fScsIHN0YW5kYXJkUGhldGlvV3JhcHBlclRlbXBsYXRlU2tlbGV0b24gKTtcclxuXHJcbiAgICAgIC8vIFRoZSByZXN0XHJcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tQQVRIX1RPX0xJQl9GSUxFfX0nLCBwYXRoVG9MaWIgKTsgLy8gVGhpcyBtdXN0IGJlIGFmdGVyIHRoZSBzY3JpcHQgcmVwbGFjZW1lbnQgdGhhdCB1c2VzIHRoaXMgdmFyaWFibGUgYWJvdmUuXHJcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tTSU1VTEFUSU9OX05BTUV9fScsIHJlcG8gKTtcclxuICAgICAgY29udGVudHMgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY29udGVudHMsICd7e1NJTVVMQVRJT05fRElTUExBWV9OQU1FfX0nLCBzaW11bGF0aW9uRGlzcGxheU5hbWUgKTtcclxuICAgICAgY29udGVudHMgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY29udGVudHMsICd7e1NJTVVMQVRJT05fRElTUExBWV9OQU1FX0VTQ0FQRUR9fScsIHNpbXVsYXRpb25EaXNwbGF5TmFtZS5yZXBsYWNlKCAvJy9nLCAnXFxcXFxcJycgKSApO1xyXG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgJ3t7U0lNVUxBVElPTl9WRVJTSU9OfX0nLCB2ZXJzaW9uICk7XHJcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tTSU1VTEFUSU9OX0xBVEVTVF9WRVJTSU9OfX0nLCBsYXRlc3RWZXJzaW9uICk7XHJcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tTSU1VTEFUSU9OX0lTX0JVSUxUfX0nLCAndHJ1ZScgKTtcclxuICAgICAgY29udGVudHMgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY29udGVudHMsICd7e1BIRVRfSU9fTElCX1JFTEFUSVZFX1BBVEh9fScsIHBhdGhUb0xpYiApO1xyXG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgJ3t7QnVpbHQgQVBJIERvY3Mgbm90IGF2YWlsYWJsZSBpbiB1bmJ1aWx0IG1vZGV9fScsICdBUEkgRG9jcycgKTtcclxuXHJcbiAgICAgIC8vIHBoZXQtaW8td3JhcHBlcnMvY29tbW9uIHdpbGwgYmUgaW4gdGhlIHRvcCBsZXZlbCBvZiB3cmFwcGVycy8gaW4gdGhlIGJ1aWxkIGRpcmVjdG9yeVxyXG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgYCR7V1JBUFBFUl9DT01NT05fRk9MREVSfS9gLCAnY29tbW9uLycgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGlzV3JhcHBlckluZGV4ICkge1xyXG4gICAgICBjb25zdCBnZXRHdWlkZVJvd1RleHQgPSAoIGZpbGVOYW1lLCBsaW5rVGV4dCwgZGVzY3JpcHRpb24gKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGA8dHI+XHJcbiAgICAgICAgPHRkPjxhIGhyZWY9XCJkb2MvZ3VpZGVzLyR7ZmlsZU5hbWV9Lmh0bWxcIj4ke2xpbmtUZXh0fTwvYT5cclxuICAgICAgICA8L3RkPlxyXG4gICAgICAgIDx0ZD4ke2Rlc2NyaXB0aW9ufTwvdGQ+XHJcbiAgICAgIDwvdHI+YDtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIFRoZSBwaGV0LWlvLWd1aWRlIGlzIG5vdCBzaW0tc3BlY2lmaWMsIHNvIGFsd2F5cyBjcmVhdGUgaXQuXHJcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAne3tQSEVUX0lPX0dVSURFX1JPV319JyxcclxuICAgICAgICBnZXRHdWlkZVJvd1RleHQoIFBIRVRfSU9fR1VJREVfRklMRU5BTUUsICdQaEVULWlPIEd1aWRlJyxcclxuICAgICAgICAgICdEb2N1bWVudGF0aW9uIGZvciBpbnN0cnVjdGlvbmFsIGRlc2lnbmVycyBhYm91dCBiZXN0IHByYWN0aWNlcyBmb3Igc2ltdWxhdGlvbiBjdXN0b21pemF0aW9uIHdpdGggUGhFVC1pTyBTdHVkaW8uJyApICk7XHJcblxyXG5cclxuICAgICAgY29uc3QgZXhhbXBsZVJvd0NvbnRlbnRzID0gZnMuZXhpc3RzU3luYyggYCR7UEhFVF9JT19TSU1fU1BFQ0lGSUN9L3JlcG9zLyR7cmVwb30vJHtFWEFNUExFU19GSUxFTkFNRX0ubWRgICkgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRHdWlkZVJvd1RleHQoIEVYQU1QTEVTX0ZJTEVOQU1FLCAnRXhhbXBsZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQcm92aWRlcyBpbnN0cnVjdGlvbnMgYW5kIHRoZSBzcGVjaWZpYyBwaGV0aW9JRHMgZm9yIGN1c3RvbWl6aW5nIHRoZSBzaW11bGF0aW9uLicgKSA6ICcnO1xyXG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgJ3t7RVhBTVBMRVNfUk9XfX0nLCBleGFtcGxlUm93Q29udGVudHMgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTcGVjaWFsIGhhbmRsaW5nIGZvciBzdHVkaW8gcGF0aHMgc2luY2UgaXQgaXMgbm90IG5lc3RlZCB1bmRlciBwaGV0LWlvLXdyYXBwZXJzXHJcbiAgICBpZiAoIGFic1BhdGguaW5kZXhPZiggJ3N0dWRpby9pbmRleC5odG1sJyApID49IDAgKSB7XHJcbiAgICAgIGNvbnRlbnRzID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNvbnRlbnRzLCAnPHNjcmlwdCBzcmM9XCIuLi9jb250cmliLycsICc8c2NyaXB0IHNyYz1cIi4uLy4uL2NvbnRyaWIvJyApO1xyXG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgJzxzY3JpcHQgdHlwZT1cIm1vZHVsZVwiIHNyYz1cIi4uL2NoaXBwZXIvZGlzdC9qcy9zdHVkaW8vanMvc3R1ZGlvLW1haW4uanNcIj48L3NjcmlwdD4nLFxyXG4gICAgICAgIGA8c2NyaXB0IHNyYz1cIi4vJHtTVFVESU9fQlVJTFRfRklMRU5BTUV9XCI+PC9zY3JpcHQ+YCApO1xyXG5cclxuICAgICAgY29udGVudHMgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY29udGVudHMsICd7e1BIRVRfSU9fR1VJREVfTElOS319JywgYC4uLy4uL2RvYy9ndWlkZXMvJHtQSEVUX0lPX0dVSURFX0ZJTEVOQU1FfS5odG1sYCApO1xyXG4gICAgICBjb250ZW50cyA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjb250ZW50cywgJ3t7RVhBTVBMRVNfTElOS319JywgYC4uLy4uL2RvYy9ndWlkZXMvJHtFWEFNUExFU19GSUxFTkFNRX0uaHRtbGAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDb2xsYXBzZSA+MSBibGFuayBsaW5lcyBpbiBodG1sIGZpbGVzLiAgVGhpcyBoZWxwcyBhcyBhIHBvc3Rwcm9jZXNzaW5nIHN0ZXAgYWZ0ZXIgcmVtb3ZpbmcgbGluZXMgd2l0aCA8c2NyaXB0PiB0YWdzXHJcbiAgICBpZiAoIGFic1BhdGguZW5kc1dpdGgoICcuaHRtbCcgKSApIHtcclxuICAgICAgY29uc3QgbGluZXMgPSBjb250ZW50cy5zcGxpdCggL1xccj9cXG4vICk7XHJcbiAgICAgIGNvbnN0IHBydW5lZCA9IFtdO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBpZiAoIGkgPj0gMSAmJlxyXG4gICAgICAgICAgICAgbGluZXNbIGkgLSAxIF0udHJpbSgpLmxlbmd0aCA9PT0gMCAmJlxyXG4gICAgICAgICAgICAgbGluZXNbIGkgXS50cmltKCkubGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgICAgIC8vIHNraXAgcmVkdW5kYW50IGJsYW5rIGxpbmVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBwcnVuZWQucHVzaCggbGluZXNbIGkgXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjb250ZW50cyA9IHBydW5lZC5qb2luKCAnXFxuJyApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggY29udGVudHMgIT09IG9yaWdpbmFsQ29udGVudHMgKSB7XHJcbiAgICAgIHJldHVybiBjb250ZW50cztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gbnVsbDsgLy8gc2lnbmlmeSBubyBjaGFuZ2UgKGhlbHBzIGZvciBpbWFnZXMpXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLy8gYSBsaXN0IG9mIHRoZSBwaGV0LWlvIHdyYXBwZXJzIHRoYXQgYXJlIGJ1aWx0IHdpdGggdGhlIHBoZXQtaW8gc2ltXHJcbiAgY29uc3Qgd3JhcHBlcnMgPSBmcy5yZWFkRmlsZVN5bmMoICcuLi9wZXJlbm5pYWwtYWxpYXMvZGF0YS93cmFwcGVycycsICd1dGYtOCcgKS50cmltKCkuc3BsaXQoICdcXG4nICkubWFwKCB3cmFwcGVycyA9PiB3cmFwcGVycy50cmltKCkgKTtcclxuXHJcbiAgLy8gRmlsZXMgYW5kIGRpcmVjdG9yaWVzIGZyb20gd3JhcHBlciBmb2xkZXJzIHRoYXQgd2UgZG9uJ3Qgd2FudCB0byBjb3B5XHJcbiAgY29uc3Qgd3JhcHBlcnNVbmFsbG93ZWQgPSBbICcuZ2l0JywgJ1JFQURNRS5tZCcsICcuZ2l0aWdub3JlJywgJ25vZGVfbW9kdWxlcycsICdwYWNrYWdlLmpzb24nLCAnYnVpbGQnIF07XHJcblxyXG4gIGNvbnN0IGxpYkZpbGVOYW1lcyA9IFBIRVRfSU9fTElCX1BSRUxPQURTLm1hcCggZmlsZVBhdGggPT4ge1xyXG4gICAgY29uc3QgcGFydHMgPSBmaWxlUGF0aC5zcGxpdCggJy8nICk7XHJcbiAgICByZXR1cm4gcGFydHNbIHBhcnRzLmxlbmd0aCAtIDEgXTtcclxuICB9ICk7XHJcblxyXG4gIC8vIERvbid0IGNvcHkgb3ZlciB0aGUgZmlsZXMgdGhhdCBhcmUgaW4gdGhlIGxpYiBmaWxlLCB0aGlzIHdheSB3ZSBjYW4gY2F0Y2ggd3JhcHBlciBidWdzIHRoYXQgYXJlIG5vdCBwb2ludGluZyB0byB0aGUgbGliLlxyXG4gIGNvbnN0IGZ1bGxVbmFsbG93ZWRMaXN0ID0gd3JhcHBlcnNVbmFsbG93ZWQuY29uY2F0KCBsaWJGaWxlTmFtZXMgKTtcclxuXHJcbiAgLy8gd3JhcHBpbmcgZnVuY3Rpb24gZm9yIGNvcHlpbmcgdGhlIHdyYXBwZXJzIHRvIHRoZSBidWlsZCBkaXJcclxuICBjb25zdCBjb3B5V3JhcHBlciA9ICggc3JjLCBkZXN0LCB3cmFwcGVyLCB3cmFwcGVyTmFtZSApID0+IHtcclxuXHJcbiAgICBjb25zdCB3cmFwcGVyRmlsdGVyV2l0aE5hbWVGaWx0ZXIgPSAoIGFic1BhdGgsIGNvbnRlbnRzICkgPT4ge1xyXG4gICAgICBjb25zdCByZXN1bHQgPSBmaWx0ZXJXcmFwcGVyKCBhYnNQYXRoLCBjb250ZW50cyApO1xyXG5cclxuICAgICAgLy8gU3VwcG9ydCBsb2FkaW5nIHJlbGF0aXZlLXBhdGggcmVzb3VyY2VzLCBsaWtlXHJcbiAgICAgIC8veyB1cmw6ICcuLi9waGV0LWlvLXdyYXBwZXItaG9va2VzLWxhdy1lbmVyZ3kvc291bmRzL3ByZWNpcGl0YXRlLWNoaW1lcy12MS1zaG9ydGVyLm1wMycgfVxyXG4gICAgICAvLyAtLT5cclxuICAgICAgLy97IHVybDogJ3dyYXBwZXJzL2hvb2tlcy1sYXctZW5lcmd5L3NvdW5kcy9wcmVjaXBpdGF0ZS1jaGltZXMtdjEtc2hvcnRlci5tcDMnIH1cclxuICAgICAgaWYgKCB3cmFwcGVyICYmIHdyYXBwZXJOYW1lICYmIHJlc3VsdCApIHtcclxuICAgICAgICByZXR1cm4gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIHJlc3VsdCwgYC4uLyR7d3JhcHBlcn0vYCwgYHdyYXBwZXJzLyR7d3JhcHBlck5hbWV9L2AgKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIGNvcHlEaXJlY3RvcnkoIHNyYywgZGVzdCwgd3JhcHBlckZpbHRlcldpdGhOYW1lRmlsdGVyLCB7XHJcbiAgICAgIGV4Y2x1ZGU6IGZ1bGxVbmFsbG93ZWRMaXN0LFxyXG4gICAgICBtaW5pZnlKUzogdHJ1ZSxcclxuICAgICAgbWluaWZ5T3B0aW9uczoge1xyXG4gICAgICAgIHN0cmlwQXNzZXJ0aW9uczogZmFsc2VcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH07XHJcblxyXG4gIC8vIE1ha2Ugc3VyZSB0byBjb3B5IHRoZSBwaGV0LWlvLXdyYXBwZXJzIGNvbW1vbiB3cmFwcGVyIGNvZGUgdG9vLlxyXG4gIHdyYXBwZXJzLnB1c2goIFdSQVBQRVJfQ09NTU9OX0ZPTERFUiApO1xyXG5cclxuICAvLyBBZGQgc2ltLXNwZWNpZmljIHdyYXBwZXJzXHJcbiAgbGV0IHNpbVNwZWNpZmljV3JhcHBlcnM7XHJcbiAgdHJ5IHtcclxuICAgIHNpbVNwZWNpZmljV3JhcHBlcnMgPSBmcy5yZWFkZGlyU3luYyggYC4uL3BoZXQtaW8tc2ltLXNwZWNpZmljL3JlcG9zLyR7cmVwb30vd3JhcHBlcnMvYCwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0gKVxyXG4gICAgICAuZmlsdGVyKCBkaXJlbnQgPT4gZGlyZW50LmlzRGlyZWN0b3J5KCkgKVxyXG4gICAgICAubWFwKCBkaXJlbnQgPT4gYHBoZXQtaW8tc2ltLXNwZWNpZmljL3JlcG9zLyR7cmVwb30vd3JhcHBlcnMvJHtkaXJlbnQubmFtZX1gICk7XHJcbiAgfVxyXG4gIGNhdGNoKCBlICkge1xyXG4gICAgc2ltU3BlY2lmaWNXcmFwcGVycyA9IFtdO1xyXG4gIH1cclxuXHJcbiAgd3JhcHBlcnMucHVzaCggLi4uc2ltU3BlY2lmaWNXcmFwcGVycyApO1xyXG5cclxuXHJcbiAgY29uc3QgYWRkaXRpb25hbFdyYXBwZXJzID0gcGFja2FnZU9iamVjdC5waGV0ICYmIHBhY2thZ2VPYmplY3QucGhldFsgJ3BoZXQtaW8nIF0gJiYgcGFja2FnZU9iamVjdC5waGV0WyAncGhldC1pbycgXS53cmFwcGVycyA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VPYmplY3QucGhldFsgJ3BoZXQtaW8nIF0ud3JhcHBlcnMgOiBbXTtcclxuXHJcbiAgd3JhcHBlcnMucHVzaCggLi4uYWRkaXRpb25hbFdyYXBwZXJzICk7XHJcblxyXG4gIHdyYXBwZXJzLmZvckVhY2goIHdyYXBwZXIgPT4ge1xyXG5cclxuICAgIGNvbnN0IHdyYXBwZXJQYXJ0cyA9IHdyYXBwZXIuc3BsaXQoICcvJyApO1xyXG5cclxuICAgIC8vIGVpdGhlciB0YWtlIHRoZSBsYXN0IHBhdGggcGFydCwgb3IgdGFrZSB0aGUgZmlyc3QgKHJlcG8gbmFtZSkgYW5kIHJlbW92ZSB0aGUgd3JhcHBlciBwcmVmaXhcclxuICAgIGNvbnN0IHdyYXBwZXJOYW1lID0gd3JhcHBlclBhcnRzLmxlbmd0aCA+IDEgPyB3cmFwcGVyUGFydHNbIHdyYXBwZXJQYXJ0cy5sZW5ndGggLSAxIF0gOiB3cmFwcGVyUGFydHNbIDAgXS5yZXBsYWNlKCBERURJQ0FURURfUkVQT19XUkFQUEVSX1BSRUZJWCwgJycgKTtcclxuXHJcbiAgICAvLyBDb3B5IHRoZSB3cmFwcGVyIGludG8gdGhlIGJ1aWxkIGRpciAvd3JhcHBlcnMvLCBleGNsdWRlIHRoZSBleGNsdWRlZCBsaXN0XHJcbiAgICBjb3B5V3JhcHBlciggYC4uLyR7d3JhcHBlcn1gLCBgJHt3cmFwcGVyc0xvY2F0aW9ufSR7d3JhcHBlck5hbWV9YCwgd3JhcHBlciwgd3JhcHBlck5hbWUgKTtcclxuICB9ICk7XHJcblxyXG4gIC8vIENvcHkgdGhlIHdyYXBwZXIgaW5kZXggaW50byB0aGUgdG9wIGxldmVsIG9mIHRoZSBidWlsZCBkaXIsIGV4Y2x1ZGUgdGhlIGV4Y2x1ZGVkIGxpc3RcclxuICBjb3B5V3JhcHBlciggJy4uL3BoZXQtaW8td3JhcHBlcnMvaW5kZXgnLCBgJHtidWlsZERpcn1gLCBudWxsLCBudWxsICk7XHJcblxyXG4gIC8vIENyZWF0ZSB0aGUgbGliIGZpbGUgdGhhdCBpcyBtaW5pZmllZCBhbmQgcHVibGljbHkgYXZhaWxhYmxlIHVuZGVyIHRoZSAvbGliIGZvbGRlciBvZiB0aGUgYnVpbGRcclxuICBhd2FpdCBoYW5kbGVMaWIoIHJlcG8sIGJ1aWxkRGlyLCBmaWx0ZXJXcmFwcGVyICk7XHJcblxyXG4gIC8vIENyZWF0ZSB0aGUgemlwcGVkIGZpbGUgdGhhdCBob2xkcyBhbGwgbmVlZGVkIGl0ZW1zIHRvIHJ1biBQaEVULWlPIG9mZmxpbmUuIE5PVEU6IHRoaXMgbXVzdCBoYXBwZW4gYWZ0ZXIgY29weWluZyB3cmFwcGVyXHJcbiAgYXdhaXQgaGFuZGxlT2ZmbGluZUFydGlmYWN0KCBidWlsZERpciwgcmVwbywgdmVyc2lvbiApO1xyXG5cclxuICAvLyBDcmVhdGUgdGhlIGNvbnRyaWIgZm9sZGVyIGFuZCBhZGQgdG8gaXQgdGhpcmQgcGFydHkgbGlicmFyaWVzIHVzZWQgYnkgd3JhcHBlcnMuXHJcbiAgaGFuZGxlQ29udHJpYiggYnVpbGREaXIgKTtcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSByZW5kZXJlZCBqc2RvYyBpbiB0aGUgYGRvY2AgZm9sZGVyXHJcbiAgYXdhaXQgaGFuZGxlSlNET0MoIGJ1aWxkRGlyICk7XHJcblxyXG4gIC8vIGNyZWF0ZSB0aGUgY2xpZW50IGd1aWRlc1xyXG4gIGhhbmRsZUNsaWVudEd1aWRlcyggcmVwbywgc2ltdWxhdGlvbkRpc3BsYXlOYW1lLCBidWlsZERpciwgdmVyc2lvbiwgc2ltUmVwb1NIQSApO1xyXG5cclxuICBhd2FpdCBoYW5kbGVTdHVkaW8oIHJlcG8sIHdyYXBwZXJzTG9jYXRpb24gKTtcclxuXHJcbiAgaWYgKCBnZW5lcmF0ZU1hY3JvQVBJRmlsZSApIHtcclxuICAgIGNvbnN0IGZ1bGxBUEkgPSAoIGF3YWl0IGdlbmVyYXRlUGhldGlvTWFjcm9BUEkoIFsgcmVwbyBdLCB7XHJcbiAgICAgIGZyb21CdWlsdFZlcnNpb246IHRydWVcclxuICAgIH0gKSApWyByZXBvIF07XHJcbiAgICBhc3NlcnQoIGZ1bGxBUEksICdGdWxsIEFQSSBleHBlY3RlZCBidXQgbm90IGNyZWF0ZWQgZnJvbSBwdXBwZXRlZXIgc3RlcCwgbGlrZWx5IGNhdXNlZCBieSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTAyMi4nICk7XHJcbiAgICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn0ke3JlcG99LXBoZXQtaW8tYXBpLmpzb25gLCBmb3JtYXRQaGV0aW9BUEkoIGZ1bGxBUEkgKSApO1xyXG4gIH1cclxuXHJcbiAgLy8gVGhlIG5lc3RlZCBpbmRleCB3cmFwcGVyIHdpbGwgYmUgYnJva2VuIG9uIGJ1aWxkLCBzbyBnZXQgcmlkIG9mIGl0IGZvciBjbGFyaXR5XHJcbiAgZnMucm1TeW5jKCBgJHt3cmFwcGVyc0xvY2F0aW9ufWluZGV4L2AsIHsgcmVjdXJzaXZlOiB0cnVlIH0gKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHaXZlbiB0aGUgbGlzdCBvZiBsaWIgZmlsZXMsIGFwcGx5IGEgZmlsdGVyIGZ1bmN0aW9uIHRvIHRoZW0uIFRoZW4gbWluaWZ5IHRoZW0gYW5kIGNvbnNvbGlkYXRlIGludG8gYSBzaW5nbGUgc3RyaW5nLlxyXG4gKiBGaW5hbGx5LCB3cml0ZSB0aGVtIHRvIHRoZSBidWlsZCBkaXIgd2l0aCBhIGxpY2Vuc2UgcHJlcGVuZGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzM1M1xyXG5cclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cclxuICogQHBhcmFtIHtzdHJpbmd9IGJ1aWxkRGlyXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZpbHRlciAtIHRoZSBmaWx0ZXIgZnVuY3Rpb24gdXNlZCB3aGVuIGNvcHlpbmcgb3ZlciB3cmFwcGVyIGZpbGVzIHRvIGZpeCByZWxhdGl2ZSBwYXRocyBhbmQgc3VjaC5cclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgSGFzIGFyZ3VtZW50cyBsaWtlIFwiZnVuY3Rpb24oYWJzUGF0aCwgY29udGVudHMpXCJcclxuICovXHJcbmNvbnN0IGhhbmRsZUxpYiA9IGFzeW5jICggcmVwbywgYnVpbGREaXIsIGZpbHRlciApID0+IHtcclxuICBncnVudC5sb2cuZGVidWcoICdDcmVhdGluZyBwaGV0LWlvIGxpYiBmaWxlIGZyb206ICcsIFBIRVRfSU9fTElCX1BSRUxPQURTICk7XHJcbiAgZ3J1bnQuZmlsZS5ta2RpciggYCR7YnVpbGREaXJ9bGliYCApO1xyXG5cclxuICAvLyBwaGV0LXdyaXR0ZW4gcHJlbG9hZHNcclxuICBjb25zdCBwaGV0aW9MaWJDb2RlID0gUEhFVF9JT19MSUJfUFJFTE9BRFMubWFwKCBsaWJGaWxlID0+IHtcclxuICAgIGNvbnN0IGNvbnRlbnRzID0gZ3J1bnQuZmlsZS5yZWFkKCBsaWJGaWxlICk7XHJcbiAgICBjb25zdCBmaWx0ZXJlZENvbnRlbnRzID0gZmlsdGVyKCBsaWJGaWxlLCBjb250ZW50cyApO1xyXG5cclxuICAgIC8vIFRoZSBmaWx0ZXIgcmV0dXJucyBudWxsIGlmIG5vdGhpbmcgY2hhbmdlc1xyXG4gICAgcmV0dXJuIGZpbHRlcmVkQ29udGVudHMgfHwgY29udGVudHM7XHJcbiAgfSApLmpvaW4oICcnICk7XHJcblxyXG4gIGNvbnN0IG1pZ3JhdGlvblJ1bGVzQ29kZSA9IGF3YWl0IGdldENvbXBpbGVkTWlncmF0aW9uUnVsZXMoIHJlcG8sIGJ1aWxkRGlyICk7XHJcbiAgY29uc3QgbWluaWZpZWRQaGV0aW9Db2RlID0gbWluaWZ5KCBgJHtwaGV0aW9MaWJDb2RlfVxcbiR7bWlncmF0aW9uUnVsZXNDb2RlfWAsIHsgc3RyaXBBc3NlcnRpb25zOiBmYWxzZSB9ICk7XHJcblxyXG4gIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0c2MoICcuLi9waGV0LWlvLXdyYXBwZXJzJyApO1xyXG4gIHJlcG9ydFRzY1Jlc3VsdHMoIHJlc3VsdHMsIGdydW50ICk7XHJcblxyXG4gIGxldCB3cmFwcGVyc01haW4gPSBhd2FpdCBidWlsZFN0YW5kYWxvbmUoICdwaGV0LWlvLXdyYXBwZXJzJywge1xyXG4gICAgc3RyaXBBc3NlcnRpb25zOiBmYWxzZSxcclxuICAgIHN0cmlwTG9nZ2luZzogZmFsc2UsXHJcbiAgICB0ZW1wT3V0cHV0RGlyOiByZXBvLFxyXG5cclxuICAgIC8vIEF2b2lkIGdldHRpbmcgYSAybmQgY29weSBvZiB0aGUgZmlsZXMgdGhhdCBhcmUgYWxyZWFkeSBidW5kbGVkIGludG8gdGhlIGxpYiBmaWxlXHJcbiAgICBvbWl0UHJlbG9hZHM6IFRISVJEX1BBUlRZX0xJQl9QUkVMT0FEU1xyXG4gIH0gKTtcclxuXHJcbiAgLy8gSW4gbG9hZFdyYXBwZXJUZW1wbGF0ZSBpbiB1bmJ1aWx0IG1vZGUsIGl0IHVzZXMgcmVhZEZpbGUgdG8gZHluYW1pY2FsbHkgbG9hZCB0aGUgdGVtcGxhdGVzIGF0IHJ1bnRpbWUuXHJcbiAgLy8gSW4gYnVpbHQgbW9kZSwgd2UgbXVzdCBpbmxpbmUgdGhlIHRlbXBsYXRlcyBpbnRvIHRoZSBidWlsZCBhcnRpZmFjdC4gU2VlIGxvYWRXcmFwcGVyVGVtcGxhdGUuanNcclxuICBhc3NlcnQoIHdyYXBwZXJzTWFpbi5pbmNsdWRlcyggJ1wie3tTVEFOREFSRF9XUkFQUEVSX1NLRUxFVE9OfX1cIicgKSB8fCB3cmFwcGVyc01haW4uaW5jbHVkZXMoICdcXCd7e1NUQU5EQVJEX1dSQVBQRVJfU0tFTEVUT059fVxcJycgKSwgJ1RlbXBsYXRlIHZhcmlhYmxlIGlzIG1pc3Npbmc6IFNUQU5EQVJEX1dSQVBQRVJfU0tFTEVUT04nICk7XHJcbiAgYXNzZXJ0KCB3cmFwcGVyc01haW4uaW5jbHVkZXMoICdcInt7Q1VTVE9NX1dSQVBQRVJfU0tFTEVUT059fVwiJyApIHx8IHdyYXBwZXJzTWFpbi5pbmNsdWRlcyggJ1xcJ3t7Q1VTVE9NX1dSQVBQRVJfU0tFTEVUT059fVxcJycgKSwgJ1RlbXBsYXRlIHZhcmlhYmxlIGlzIG1pc3Npbmc6IENVU1RPTV9XUkFQUEVSX1NLRUxFVE9OJyApO1xyXG5cclxuICAvLyBSb2J1c3RseSBoYW5kbGUgZG91YmxlIG9yIHNpbmdsZSBxdW90ZXMuICBBdCB0aGUgbW9tZW50IGl0IGlzIGRvdWJsZSBxdW90ZXMuXHJcbiAgLy8gYnVpbGRTdGFuZGFsb25lIHdpbGwgbWFuZ2xlIGEgdGVtcGxhdGUgc3RyaW5nIGludG8gXCJcIiBiZWNhdXNlIGl0IGhhc24ndCBiZWVuIGZpbGxlZCBpbiB5ZXQsIGJyaW5nIGl0IGJhY2sgaGVyZSAod2l0aFxyXG4gIC8vIHN1cHBvcnQgZm9yIGl0IGNoYW5naW5nIGluIHRoZSBmdXR1cmUgZnJvbSBkb3VibGUgdG8gc2luZ2xlIHF1b3RlcykuXHJcbiAgd3JhcHBlcnNNYWluID0gd3JhcHBlcnNNYWluLnJlcGxhY2UoICdcInt7U1RBTkRBUkRfV1JBUFBFUl9TS0VMRVRPTn19XCInLCAnYHt7U1RBTkRBUkRfV1JBUFBFUl9TS0VMRVRPTn19YCcgKTtcclxuICB3cmFwcGVyc01haW4gPSB3cmFwcGVyc01haW4ucmVwbGFjZSggJ1xcJ3t7U1RBTkRBUkRfV1JBUFBFUl9TS0VMRVRPTn19XFwnJywgJ2B7e1NUQU5EQVJEX1dSQVBQRVJfU0tFTEVUT059fWAnICk7XHJcbiAgd3JhcHBlcnNNYWluID0gd3JhcHBlcnNNYWluLnJlcGxhY2UoICdcInt7Q1VTVE9NX1dSQVBQRVJfU0tFTEVUT059fVwiJywgJ2B7e0NVU1RPTV9XUkFQUEVSX1NLRUxFVE9OfX1gJyApO1xyXG4gIHdyYXBwZXJzTWFpbiA9IHdyYXBwZXJzTWFpbi5yZXBsYWNlKCAnXFwne3tDVVNUT01fV1JBUFBFUl9TS0VMRVRPTn19XFwnJywgJ2B7e0NVU1RPTV9XUkFQUEVSX1NLRUxFVE9OfX1gJyApO1xyXG5cclxuICBjb25zdCBmaWx0ZXJlZE1haW4gPSBmaWx0ZXIoIExJQl9PVVRQVVRfRklMRSwgd3JhcHBlcnNNYWluICk7XHJcblxyXG4gIGNvbnN0IG1haW5Db3B5cmlnaHQgPSBgLy8gQ29weXJpZ2h0IDIwMDItJHtuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCl9LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuLy8gVGhpcyBQaEVULWlPIGZpbGUgcmVxdWlyZXMgYSBsaWNlbnNlXHJcbi8vIFVTRSBXSVRIT1VUIEEgTElDRU5TRSBBR1JFRU1FTlQgSVMgU1RSSUNUTFkgUFJPSElCSVRFRC5cclxuLy8gRm9yIGxpY2Vuc2luZywgcGxlYXNlIGNvbnRhY3QgcGhldGhlbHBAY29sb3JhZG8uZWR1YDtcclxuXHJcbiAgZ3J1bnQuZmlsZS53cml0ZSggYCR7YnVpbGREaXJ9bGliLyR7TElCX09VVFBVVF9GSUxFfWAsXHJcbiAgICBgJHttYWluQ29weXJpZ2h0fVxyXG4vLyBcclxuLy8gQ29udGFpbnMgYWRkaXRpb25hbCBjb2RlIHVuZGVyIHRoZSBzcGVjaWZpZWQgbGljZW5zZXM6XHJcblxyXG4ke1RISVJEX1BBUlRZX0xJQl9QUkVMT0FEUy5tYXAoIGNvbnRyaWJGaWxlID0+IGdydW50LmZpbGUucmVhZCggY29udHJpYkZpbGUgKSApLmpvaW4oICdcXG5cXG4nICl9XHJcblxyXG4ke21haW5Db3B5cmlnaHR9XHJcblxyXG4ke21pbmlmaWVkUGhldGlvQ29kZX1cXG4ke2ZpbHRlcmVkTWFpbn1gICk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ29weSBhbGwgdGhlIHRoaXJkIHBhcnR5IGxpYnJhcmllcyBmcm9tIHNoZXJwYSB0byB0aGUgYnVpbGQgZGlyZWN0b3J5IHVuZGVyIHRoZSAnY29udHJpYicgZm9sZGVyLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYnVpbGREaXJcclxuICovXHJcbmNvbnN0IGhhbmRsZUNvbnRyaWIgPSBidWlsZERpciA9PiB7XHJcbiAgZ3J1bnQubG9nLmRlYnVnKCAnQ3JlYXRpbmcgcGhldC1pbyBjb250cmliIGZvbGRlcicgKTtcclxuXHJcbiAgQ09OVFJJQl9GSUxFUy5mb3JFYWNoKCBmaWxlUGF0aCA9PiB7XHJcbiAgICBjb25zdCBmaWxlUGF0aFBhcnRzID0gZmlsZVBhdGguc3BsaXQoICcvJyApO1xyXG4gICAgY29uc3QgZmlsZW5hbWUgPSBmaWxlUGF0aFBhcnRzWyBmaWxlUGF0aFBhcnRzLmxlbmd0aCAtIDEgXTtcclxuXHJcbiAgICBncnVudC5maWxlLmNvcHkoIGZpbGVQYXRoLCBgJHtidWlsZERpcn1jb250cmliLyR7ZmlsZW5hbWV9YCApO1xyXG4gIH0gKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDb21iaW5lIHRoZSBmaWxlcyBuZWNlc3NhcnkgdG8gcnVuIGFuZCBob3N0IFBoRVQtaU8gbG9jYWxseSBpbnRvIGEgemlwIHRoYXQgY2FuIGJlIGVhc2lseSBkb3dubG9hZGVkIGJ5IHRoZSBjbGllbnQuXHJcbiAqIFRoaXMgZG9lcyBub3QgaW5jbHVkZSBhbnkgZG9jdW1lbnRhdGlvbiwgb3Igd3JhcHBlciBzdWl0ZSB3cmFwcGVyIGV4YW1wbGVzLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYnVpbGREaXJcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cclxuICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb25cclxuICogQHJldHVybnMge1Byb21pc2UuPHZvaWQ+fVxyXG4gKi9cclxuY29uc3QgaGFuZGxlT2ZmbGluZUFydGlmYWN0ID0gYXN5bmMgKCBidWlsZERpciwgcmVwbywgdmVyc2lvbiApID0+IHtcclxuXHJcbiAgY29uc3Qgb3V0cHV0ID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oIGAke2J1aWxkRGlyfSR7cmVwb30tcGhldC1pby0ke3ZlcnNpb259LnppcGAgKTtcclxuICBjb25zdCBhcmNoaXZlID0gYXJjaGl2ZXIoICd6aXAnICk7XHJcblxyXG4gIGFyY2hpdmUub24oICdlcnJvcicsIGVyciA9PiBncnVudC5mYWlsLmZhdGFsKCBgZXJyb3IgY3JlYXRpbmcgYXJjaGl2ZTogJHtlcnJ9YCApICk7XHJcblxyXG4gIGFyY2hpdmUucGlwZSggb3V0cHV0ICk7XHJcblxyXG4gIC8vIGNvcHkgb3ZlciB0aGUgbGliIGRpcmVjdG9yeSBhbmQgaXRzIGNvbnRlbnRzLCBhbmQgYW4gaW5kZXggdG8gdGVzdC4gTm90ZSB0aGF0IHRoZXNlIHVzZSB0aGUgZmlsZXMgZnJvbSB0aGUgYnVpbGREaXJcclxuICAvLyBiZWNhdXNlIHRoZXkgaGF2ZSBiZWVuIHBvc3QtcHJvY2Vzc2VkIGFuZCBjb250YWluIGZpbGxlZCBpbiB0ZW1wbGF0ZSB2YXJzLlxyXG4gIGFyY2hpdmUuZGlyZWN0b3J5KCBgJHtidWlsZERpcn1saWJgLCAnbGliJyApO1xyXG5cclxuICAvLyBUYWtlIGZyb20gYnVpbGQgZGlyZWN0b3J5IHNvIHRoYXQgaXQgaGFzIGJlZW4gZmlsdGVyZWQvbWFwcGVkIHRvIGNvcnJlY3QgcGF0aHMuXHJcbiAgYXJjaGl2ZS5maWxlKCBgJHtidWlsZERpcn0ke1dSQVBQRVJTX0ZPTERFUn0vY29tbW9uL2h0bWwvb2ZmbGluZS1leGFtcGxlLmh0bWxgLCB7IG5hbWU6ICdpbmRleC5odG1sJyB9ICk7XHJcblxyXG4gIC8vIGdldCB0aGUgYWxsIGh0bWwgYW5kIHRoZSBkZWJ1ZyB2ZXJzaW9uIHRvbywgdXNlIGBjd2RgIHNvIHRoYXQgdGhleSBhcmUgYXQgdGhlIHRvcCBsZXZlbCBvZiB0aGUgemlwLlxyXG4gIGFyY2hpdmUuZ2xvYiggYCR7cmVwb30qYWxsKi5odG1sYCwgeyBjd2Q6IGAke2J1aWxkRGlyfWAgfSApO1xyXG4gIGFyY2hpdmUuZmluYWxpemUoKTtcclxuXHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IG91dHB1dC5vbiggJ2Nsb3NlJywgcmVzb2x2ZSApICk7XHJcbn07XHJcblxyXG4vKipcclxuICogR2VuZXJhdGUganNkb2MgYW5kIHB1dCBpdCBpbiBcImJ1aWxkL3BoZXQtaW8vZG9jXCJcclxuICogQHBhcmFtIHtzdHJpbmd9IGJ1aWxkRGlyXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlLjx2b2lkPn1cclxuICovXHJcbmNvbnN0IGhhbmRsZUpTRE9DID0gYXN5bmMgYnVpbGREaXIgPT4ge1xyXG5cclxuICAvLyBNYWtlIHN1cmUgZWFjaCBmaWxlIGV4aXN0c1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IEpTRE9DX0ZJTEVTLmxlbmd0aDsgaSsrICkge1xyXG4gICAgaWYgKCAhZnMuZXhpc3RzU3luYyggSlNET0NfRklMRVNbIGkgXSApICkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBmaWxlIGRvZXNudCBleGlzdDogJHtKU0RPQ19GSUxFU1sgaSBdfWAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IGdldEFyZ3MgPSBleHBsYWluID0+IFtcclxuICAgICcuLi9jaGlwcGVyL25vZGVfbW9kdWxlcy9qc2RvYy9qc2RvYy5qcycsXHJcbiAgICAuLi4oIGV4cGxhaW4gPyBbICctWCcgXSA6IFtdICksXHJcbiAgICAuLi5KU0RPQ19GSUxFUyxcclxuICAgICctYycsICcuLi9waGV0LWlvL2RvYy93cmFwcGVyL2pzZG9jLWNvbmZpZy5qc29uJyxcclxuICAgICctZCcsIGAke2J1aWxkRGlyfWRvYy9hcGlgLFxyXG4gICAgJy10JywgJy4uL2NoaXBwZXIvbm9kZV9tb2R1bGVzL2RvY2Rhc2gnLFxyXG4gICAgJy0tcmVhZG1lJywgSlNET0NfUkVBRE1FX0ZJTEVcclxuICBdO1xyXG5cclxuICAvLyBGaXJzdCB3ZSB0cmllZCB0byBydW4gdGhlIGpzZG9jIGJpbmFyeSBhcyB0aGUgY21kLCBidXQgdGhhdCB3YXNuJ3Qgd29ya2luZywgYW5kIHdhcyBxdWl0ZSBmaW5pY2t5LiBUaGVuIEBzYW1yZWlkXHJcbiAgLy8gZm91bmQgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzM2NjQ4NDMvaG93LXRvLXVzZS1qc2RvYy13aXRoLWd1bHAgd2hpY2ggcmVjb21tZW5kcyB0aGUgZm9sbG93aW5nIG1ldGhvZFxyXG4gIC8vIChub2RlIGV4ZWN1dGFibGUgd2l0aCBqc2RvYyBqcyBmaWxlKVxyXG4gIGF3YWl0IGV4ZWN1dGUoICdub2RlJywgZ2V0QXJncyggZmFsc2UgKSwgcHJvY2Vzcy5jd2QoKSwge1xyXG4gICAgc2hlbGw6IHRydWVcclxuICB9ICk7XHJcblxyXG4gIC8vIFJ1bm5pbmcgd2l0aCBleHBsYW5hdGlvbiAtWCBhcHBlYXJzIHRvIG5vdCBvdXRwdXQgdGhlIGZpbGVzLCBzbyB3ZSBoYXZlIHRvIHJ1biBpdCB0d2ljZS5cclxuICBjb25zdCBleHBsYW5hdGlvbiA9ICggYXdhaXQgZXhlY3V0ZSggJ25vZGUnLCBnZXRBcmdzKCB0cnVlICksIHByb2Nlc3MuY3dkKCksIHtcclxuICAgIHNoZWxsOiB0cnVlXHJcbiAgfSApICkudHJpbSgpO1xyXG5cclxuICAvLyBDb3B5IHRoZSBsb2dvIGZpbGVcclxuICBjb25zdCBpbWFnZURpciA9IGAke2J1aWxkRGlyfWRvYy9pbWFnZXNgO1xyXG4gIGlmICggIWZzLmV4aXN0c1N5bmMoIGltYWdlRGlyICkgKSB7XHJcbiAgICBmcy5ta2RpclN5bmMoIGltYWdlRGlyICk7XHJcbiAgfVxyXG4gIGZzLmNvcHlGaWxlU3luYyggJy4uL2JyYW5kL3BoZXQtaW8vaW1hZ2VzL2xvZ29PbldoaXRlLnBuZycsIGAke2ltYWdlRGlyfS9sb2dvLnBuZ2AgKTtcclxuXHJcbiAgY29uc3QganNvbiA9IGV4cGxhbmF0aW9uLnN1YnN0cmluZyggZXhwbGFuYXRpb24uaW5kZXhPZiggJ1snICksIGV4cGxhbmF0aW9uLmxhc3RJbmRleE9mKCAnXScgKSArIDEgKTtcclxuXHJcbiAgLy8gYmFzaWMgc2FuaXR5IGNoZWNrc1xyXG4gIGFzc2VydCgganNvbi5sZW5ndGggPiA1MDAwLCAnSlNPTiBzZWVtcyBvZGQnICk7XHJcbiAgdHJ5IHtcclxuICAgIEpTT04ucGFyc2UoIGpzb24gKTtcclxuICB9XHJcbiAgY2F0Y2goIGUgKSB7XHJcbiAgICBhc3NlcnQoIGZhbHNlLCAnSlNPTiBwYXJzaW5nIGZhaWxlZCcgKTtcclxuICB9XHJcblxyXG4gIGZzLndyaXRlRmlsZVN5bmMoIGAke2J1aWxkRGlyfWRvYy9qc2RvYy1leHBsYW5hdGlvbi5qc29uYCwganNvbiApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyB0aGUgcGhldC1pbyBjbGllbnQgZ3VpZGVzIGFuZCBwdXRzIHRoZW0gaW4gYGJ1aWxkL3BoZXQtaW8vZG9jL2d1aWRlcy9gXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvTmFtZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc2ltdWxhdGlvbkRpc3BsYXlOYW1lXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBidWlsZERpclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdmVyc2lvblxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc2ltUmVwb1NIQVxyXG4gKi9cclxuY29uc3QgaGFuZGxlQ2xpZW50R3VpZGVzID0gKCByZXBvTmFtZSwgc2ltdWxhdGlvbkRpc3BsYXlOYW1lLCBidWlsZERpciwgdmVyc2lvbiwgc2ltUmVwb1NIQSApID0+IHtcclxuICBjb25zdCBidWlsdENsaWVudEd1aWRlc091dHB1dERpciA9IGAke2J1aWxkRGlyfWRvYy9ndWlkZXMvYDtcclxuICBjb25zdCBjbGllbnRHdWlkZXNTb3VyY2VSb290ID0gYCR7UEhFVF9JT19TSU1fU1BFQ0lGSUN9L3JlcG9zLyR7cmVwb05hbWV9L2A7XHJcbiAgY29uc3QgY29tbW9uRGlyID0gYCR7UEhFVF9JT19TSU1fU1BFQ0lGSUN9LyR7R1VJREVTX0NPTU1PTl9ESVJ9YDtcclxuXHJcbiAgLy8gY29weSBvdmVyIGNvbW1vbiBpbWFnZXMgYW5kIHN0eWxlc1xyXG4gIGNvcHlEaXJlY3RvcnkoIGNvbW1vbkRpciwgYCR7YnVpbHRDbGllbnRHdWlkZXNPdXRwdXREaXJ9YCApO1xyXG5cclxuICAvLyBoYW5kbGUgZ2VuZXJhdGluZyBhbmQgd3JpdGluZyB0aGUgaHRtbCBmaWxlIGZvciBlYWNoIGNsaWVudCBndWlkZVxyXG4gIGdlbmVyYXRlQW5kV3JpdGVDbGllbnRHdWlkZSggcmVwb05hbWUsXHJcbiAgICBgJHtzaW11bGF0aW9uRGlzcGxheU5hbWV9IFBoRVQtaU8gR3VpZGVgLFxyXG4gICAgc2ltdWxhdGlvbkRpc3BsYXlOYW1lLFxyXG4gICAgYCR7Y29tbW9uRGlyfS8ke1BIRVRfSU9fR1VJREVfRklMRU5BTUV9Lm1kYCxcclxuICAgIGAke2J1aWx0Q2xpZW50R3VpZGVzT3V0cHV0RGlyfSR7UEhFVF9JT19HVUlERV9GSUxFTkFNRX0uaHRtbGAsXHJcbiAgICB2ZXJzaW9uLCBzaW1SZXBvU0hBICk7XHJcbiAgZ2VuZXJhdGVBbmRXcml0ZUNsaWVudEd1aWRlKCByZXBvTmFtZSxcclxuICAgIGAke3NpbXVsYXRpb25EaXNwbGF5TmFtZX0gRXhhbXBsZXNgLFxyXG4gICAgc2ltdWxhdGlvbkRpc3BsYXlOYW1lLFxyXG4gICAgYCR7Y2xpZW50R3VpZGVzU291cmNlUm9vdH0ke0VYQU1QTEVTX0ZJTEVOQU1FfS5tZGAsXHJcbiAgICBgJHtidWlsdENsaWVudEd1aWRlc091dHB1dERpcn0ke0VYQU1QTEVTX0ZJTEVOQU1FfS5odG1sYCxcclxuICAgIHZlcnNpb24sIHNpbVJlcG9TSEEgKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUYWtlcyBhIG1hcmtkb3duIGNsaWVudCBndWlkZXMsIGZpbGxzIGluIHRoZSBsaW5rcywgYW5kIHRoZW4gZ2VuZXJhdGVzIGFuZCB3cml0ZXMgaXQgYXMgaHRtbFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb05hbWVcclxuICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzaW11bGF0aW9uRGlzcGxheU5hbWVcclxuICogQHBhcmFtIHtzdHJpbmd9IG1kRmlsZVBhdGggLSB0byBnZXQgdGhlIHNvdXJjZSBtZCBmaWxlXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBkZXN0aW5hdGlvblBhdGggLSB0byB3cml0ZSB0b1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gdmVyc2lvblxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc2ltUmVwb1NIQVxyXG4gKi9cclxuY29uc3QgZ2VuZXJhdGVBbmRXcml0ZUNsaWVudEd1aWRlID0gKCByZXBvTmFtZSwgdGl0bGUsIHNpbXVsYXRpb25EaXNwbGF5TmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZEZpbGVQYXRoLCBkZXN0aW5hdGlvblBhdGgsIHZlcnNpb24sIHNpbVJlcG9TSEEgKSA9PiB7XHJcblxyXG4gIC8vIG1ha2Ugc3VyZSB0aGUgc291cmNlIG1hcmtkb3duIGZpbGUgZXhpc3RzXHJcbiAgaWYgKCAhZnMuZXhpc3RzU3luYyggbWRGaWxlUGF0aCApICkge1xyXG4gICAgZ3J1bnQubG9nLndhcm4oIGBubyBjbGllbnQgZ3VpZGUgZm91bmQgYXQgJHttZEZpbGVQYXRofSwgbm8gZ3VpZGUgYmVpbmcgYnVpbHQuYCApO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc2ltQ2FtZWxDYXNlTmFtZSA9IF8uY2FtZWxDYXNlKCByZXBvTmFtZSApO1xyXG5cclxuICBsZXQgbW9kZWxEb2N1bWVudGF0aW9uTGluZSA9ICcnO1xyXG5cclxuICBpZiAoIGZzLmV4aXN0c1N5bmMoIGAuLi8ke3JlcG9OYW1lfS9kb2MvbW9kZWwubWRgICkgKSB7XHJcbiAgICBtb2RlbERvY3VtZW50YXRpb25MaW5lID0gYCogW01vZGVsIERvY3VtZW50YXRpb25dKGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy8ke3JlcG9OYW1lfS9ibG9iLyR7c2ltUmVwb1NIQX0vZG9jL21vZGVsLm1kKWA7XHJcbiAgfVxyXG5cclxuICAvLyBmaWxsIGluIGxpbmtzXHJcbiAgbGV0IGNsaWVudEd1aWRlU291cmNlID0gZ3J1bnQuZmlsZS5yZWFkKCBtZEZpbGVQYXRoICk7XHJcblxyXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAvLyBETyBOT1QgVVBEQVRFIE9SIEFERCBUTyBUSEVTRSBXSVRIT1VUIEFMU08gVVBEQVRJTkcgVEhFIExJU1QgSU4gcGhldC1pby1zaW0tc3BlY2lmaWMvY2xpZW50LWd1aWRlLWNvbW1vbi9SRUFETUUubWRcclxuICBjbGllbnRHdWlkZVNvdXJjZSA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjbGllbnRHdWlkZVNvdXJjZSwgJ3t7V1JBUFBFUl9JTkRFWF9QQVRIfX0nLCAnLi4vLi4vJyApO1xyXG4gIGNsaWVudEd1aWRlU291cmNlID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNsaWVudEd1aWRlU291cmNlLCAne3tTSU1VTEFUSU9OX0RJU1BMQVlfTkFNRX19Jywgc2ltdWxhdGlvbkRpc3BsYXlOYW1lICk7XHJcbiAgY2xpZW50R3VpZGVTb3VyY2UgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY2xpZW50R3VpZGVTb3VyY2UsICd7e1NJTV9QQVRIfX0nLCBgLi4vLi4vJHtyZXBvTmFtZX1fYWxsX3BoZXQtaW8uaHRtbD9wb3N0TWVzc2FnZU9uRXJyb3ImcGhldGlvU3RhbmRhbG9uZWAgKTtcclxuICBjbGllbnRHdWlkZVNvdXJjZSA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjbGllbnRHdWlkZVNvdXJjZSwgJ3t7U1RVRElPX1BBVEh9fScsICcuLi8uLi93cmFwcGVycy9zdHVkaW8vJyApO1xyXG4gIGNsaWVudEd1aWRlU291cmNlID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNsaWVudEd1aWRlU291cmNlLCAne3tQSEVUX0lPX0dVSURFX1BBVEh9fScsIGAuLyR7UEhFVF9JT19HVUlERV9GSUxFTkFNRX0uaHRtbGAgKTtcclxuICBjbGllbnRHdWlkZVNvdXJjZSA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjbGllbnRHdWlkZVNvdXJjZSwgJ3t7REFURX19JywgbmV3IERhdGUoKS50b1N0cmluZygpICk7XHJcbiAgY2xpZW50R3VpZGVTb3VyY2UgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggY2xpZW50R3VpZGVTb3VyY2UsICd7e3NpbUNhbWVsQ2FzZU5hbWV9fScsIHNpbUNhbWVsQ2FzZU5hbWUgKTtcclxuICBjbGllbnRHdWlkZVNvdXJjZSA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjbGllbnRHdWlkZVNvdXJjZSwgJ3t7c2ltS2ViYWJOYW1lfX0nLCByZXBvTmFtZSApO1xyXG4gIGNsaWVudEd1aWRlU291cmNlID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNsaWVudEd1aWRlU291cmNlLCAne3tTSU1VTEFUSU9OX1ZFUlNJT059fScsIHZlcnNpb24gKTtcclxuICBjbGllbnRHdWlkZVNvdXJjZSA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBjbGllbnRHdWlkZVNvdXJjZSwgJ3t7TU9ERUxfRE9DVU1FTlRBVElPTl9MSU5FfX0nLCBtb2RlbERvY3VtZW50YXRpb25MaW5lICk7XHJcbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG5cclxuICAvLyBzdXBwb3J0IHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBwYXRocyBmb3IgdW5idWlsdCBjb21tb24gaW1hZ2UgcHJldmlld3MgYnkgcmVwbGFjaW5nIHRoZW0gd2l0aCB0aGUgY29ycmVjdCByZWxhdGl2ZSBwYXRoLiBPcmRlciBtYXR0ZXJzIVxyXG4gIGNsaWVudEd1aWRlU291cmNlID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNsaWVudEd1aWRlU291cmNlLCBgLi4vLi4vLi4vJHtHVUlERVNfQ09NTU9OX0RJUn1gLCAnJyApO1xyXG4gIGNsaWVudEd1aWRlU291cmNlID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNsaWVudEd1aWRlU291cmNlLCBgLi4vLi4vJHtHVUlERVNfQ09NTU9OX0RJUn1gLCAnJyApO1xyXG4gIGNsaWVudEd1aWRlU291cmNlID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNsaWVudEd1aWRlU291cmNlLCBgLi4vJHtHVUlERVNfQ09NTU9OX0RJUn1gLCAnJyApO1xyXG4gIGNsaWVudEd1aWRlU291cmNlID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGNsaWVudEd1aWRlU291cmNlLCBgLyR7R1VJREVTX0NPTU1PTl9ESVJ9YCwgJycgKTtcclxuICBjb25zdCByZW5kZXJlZENsaWVudEd1aWRlID0gbWFya2VkLnBhcnNlKCBjbGllbnRHdWlkZVNvdXJjZSApO1xyXG5cclxuICAvLyBsaW5rIGEgc3R5bGVzaGVldFxyXG4gIGNvbnN0IGNsaWVudEd1aWRlSFRNTCA9IGA8aGVhZD5cclxuICAgICAgICAgICAgICAgICAgIDxsaW5rIHJlbD0nc3R5bGVzaGVldCcgaHJlZj0nY3NzL2dpdGh1Yi1tYXJrZG93bi5jc3MnIHR5cGU9J3RleHQvY3NzJz5cclxuICAgICAgICAgICAgICAgICAgIDx0aXRsZT4ke3RpdGxlfTwvdGl0bGU+XHJcbiAgICAgICAgICAgICAgICAgPC9oZWFkPlxyXG4gICAgICAgICAgICAgICAgIDxib2R5PlxyXG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXJrZG93bi1ib2R5XCI+XHJcbiAgICAgICAgICAgICAgICAgICAke3JlbmRlcmVkQ2xpZW50R3VpZGV9XHJcbiAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgPC9ib2R5PmA7XHJcblxyXG4gIC8vIHdyaXRlIHRoZSBvdXRwdXQgdG8gdGhlIGJ1aWxkIGRpcmVjdG9yeVxyXG4gIGdydW50LmZpbGUud3JpdGUoIGRlc3RpbmF0aW9uUGF0aCwgY2xpZW50R3VpZGVIVE1MICk7XHJcbn07XHJcblxyXG4vKipcclxuICogU3VwcG9ydCBidWlsZGluZyBzdHVkaW8uIFRoaXMgY29tcGlsZXMgdGhlIHN0dWRpbyBtb2R1bGVzIGludG8gYSBydW5uYWJsZSwgYW5kIGNvcGllcyB0aGF0IG92ZXIgdG8gdGhlIGV4cGVjdGVkIHNwb3RcclxuICogb24gYnVpbGQuXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB3cmFwcGVyc0xvY2F0aW9uXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlLjx2b2lkPn1cclxuICovXHJcbmNvbnN0IGhhbmRsZVN0dWRpbyA9IGFzeW5jICggcmVwbywgd3JhcHBlcnNMb2NhdGlvbiApID0+IHtcclxuXHJcbiAgZ3J1bnQubG9nLmRlYnVnKCAnYnVpbGRpbmcgc3R1ZGlvJyApO1xyXG5cclxuICBjb25zdCByZXN1bHRzID0gYXdhaXQgdHNjKCAnLi4vc3R1ZGlvJyApO1xyXG4gIHJlcG9ydFRzY1Jlc3VsdHMoIHJlc3VsdHMsIGdydW50ICk7XHJcblxyXG4gIGZzLndyaXRlRmlsZVN5bmMoIGAke3dyYXBwZXJzTG9jYXRpb259c3R1ZGlvLyR7U1RVRElPX0JVSUxUX0ZJTEVOQU1FfWAsIGF3YWl0IGJ1aWxkU3RhbmRhbG9uZSggJ3N0dWRpbycsIHtcclxuICAgIHN0cmlwQXNzZXJ0aW9uczogZmFsc2UsXHJcbiAgICBzdHJpcExvZ2dpbmc6IGZhbHNlLFxyXG4gICAgdGVtcE91dHB1dERpcjogcmVwb1xyXG4gIH0gKSApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVzZSB3ZWJwYWNrIHRvIGJ1bmRsZSB0aGUgbWlncmF0aW9uIHJ1bGVzIGludG8gYSBjb21waWxlZCBjb2RlIHN0cmluZywgZm9yIHVzZSBpbiBwaGV0LWlvIGxpYiBmaWxlLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gYnVpbGREaXJcclxuICogQHJldHVybnMge1Byb21pc2UuPHN0cmluZz59XHJcbiAqL1xyXG5jb25zdCBnZXRDb21waWxlZE1pZ3JhdGlvblJ1bGVzID0gYXN5bmMgKCByZXBvLCBidWlsZERpciApID0+IHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xyXG5cclxuICAgIGNvbnN0IG1pZ3JhdGlvblJ1bGVzRmlsZW5hbWUgPSBgJHtyZXBvfS1taWdyYXRpb24tcnVsZXMuanNgO1xyXG4gICAgY29uc3QgZW50cnlQb2ludEZpbGVuYW1lID0gYC4uL2NoaXBwZXIvZGlzdC9qcy9waGV0LWlvLXNpbS1zcGVjaWZpYy9yZXBvcy8ke3JlcG99L2pzLyR7bWlncmF0aW9uUnVsZXNGaWxlbmFtZX1gO1xyXG4gICAgaWYgKCAhZnMuZXhpc3RzU3luYyggZW50cnlQb2ludEZpbGVuYW1lICkgKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCBgTm8gbWlncmF0aW9uIHJ1bGVzIGZvdW5kIGF0ICR7ZW50cnlQb2ludEZpbGVuYW1lfSwgbm8gcnVsZXMgdG8gYmUgYnVuZGxlZCB3aXRoICR7TElCX09VVFBVVF9GSUxFfS5gICk7XHJcbiAgICAgIHJlc29sdmUoICcnICk7IC8vIGJsYW5rIHN0cmluZyBiZWNhdXNlIHRoZXJlIGFyZSBubyBydWxlcyB0byBhZGQuXHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIG91dHB1dCBkaXIgbXVzdCBiZSBhbiBhYnNvbHV0ZSBwYXRoXHJcbiAgICAgIGNvbnN0IG91dHB1dERpciA9IHBhdGgucmVzb2x2ZSggX19kaXJuYW1lLCBgLi4vLi4vJHtyZXBvfS8ke2J1aWxkRGlyfWAgKTtcclxuXHJcbiAgICAgIGNvbnN0IGNvbXBpbGVyID0gd2VicGFjaygge1xyXG5cclxuICAgICAgICAvLyBXZSB1Z2xpZnkgYXMgYSBzdGVwIGFmdGVyIHRoaXMsIHdpdGggbWFueSBjdXN0b20gcnVsZXMuIFNvIHdlIGRvIE5PVCBvcHRpbWl6ZSBvciB1Z2xpZnkgaW4gdGhpcyBzdGVwLlxyXG4gICAgICAgIG9wdGltaXphdGlvbjoge1xyXG4gICAgICAgICAgbWluaW1pemU6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy8gU2ltdWxhdGlvbnMgb3IgcnVubmFibGVzIHdpbGwgaGF2ZSBhIHNpbmdsZSBlbnRyeSBwb2ludFxyXG4gICAgICAgIGVudHJ5OiB7XHJcbiAgICAgICAgICByZXBvOiBlbnRyeVBvaW50RmlsZW5hbWVcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvLyBXZSBvdXRwdXQgb3VyIGJ1aWxkcyB0byB0aGUgZm9sbG93aW5nIGRpclxyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgcGF0aDogb3V0cHV0RGlyLFxyXG4gICAgICAgICAgZmlsZW5hbWU6IG1pZ3JhdGlvblJ1bGVzRmlsZW5hbWVcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbXBpbGVyLnJ1biggKCBlcnIsIHN0YXRzICkgPT4ge1xyXG4gICAgICAgIGlmICggZXJyIHx8IHN0YXRzLmhhc0Vycm9ycygpICkge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvciggJ01pZ3JhdGlvbiBydWxlcyB3ZWJwYWNrIGJ1aWxkIGVycm9yczonLCBzdGF0cy5jb21waWxhdGlvbi5lcnJvcnMgKTtcclxuICAgICAgICAgIHJlamVjdCggZXJyIHx8IHN0YXRzLmNvbXBpbGF0aW9uLmVycm9yc1sgMCBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgY29uc3QganNGaWxlID0gYCR7b3V0cHV0RGlyfS8ke21pZ3JhdGlvblJ1bGVzRmlsZW5hbWV9YDtcclxuICAgICAgICAgIGNvbnN0IGpzID0gZnMucmVhZEZpbGVTeW5jKCBqc0ZpbGUsICd1dGYtOCcgKTtcclxuXHJcbiAgICAgICAgICBmcy51bmxpbmtTeW5jKCBqc0ZpbGUgKTtcclxuXHJcbiAgICAgICAgICByZXNvbHZlKCBqcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH0gKTtcclxufTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBO0FBQ0EsTUFBTUEsQ0FBQyxHQUFHQyxPQUFPLENBQUUsUUFBUyxDQUFDO0FBQzdCLE1BQU1DLE1BQU0sR0FBR0QsT0FBTyxDQUFFLFFBQVMsQ0FBQztBQUNsQyxNQUFNRSxRQUFRLEdBQUdGLE9BQU8sQ0FBRSxVQUFXLENBQUM7QUFDdEMsTUFBTUcsa0JBQWtCLEdBQUdILE9BQU8sQ0FBRSw4QkFBK0IsQ0FBQztBQUNwRSxNQUFNSSxhQUFhLEdBQUdKLE9BQU8sQ0FBRSx3QkFBeUIsQ0FBQztBQUN6RCxNQUFNSyxPQUFPLEdBQUdMLE9BQU8sQ0FBRSw0Q0FBNkMsQ0FBQztBQUN2RSxNQUFNTSxFQUFFLEdBQUdOLE9BQU8sQ0FBRSxJQUFLLENBQUM7QUFDMUIsTUFBTU8sS0FBSyxHQUFHUCxPQUFPLENBQUUsT0FBUSxDQUFDO0FBQ2hDLE1BQU1RLHNCQUFzQixHQUFHUixPQUFPLENBQUUsbUNBQW9DLENBQUM7QUFDN0UsTUFBTVMsZUFBZSxHQUFHVCxPQUFPLENBQUUsNEJBQTZCLENBQUM7QUFDL0QsTUFBTVUsZUFBZSxHQUFHVixPQUFPLENBQUUsMEJBQTJCLENBQUM7QUFDN0QsTUFBTVcsTUFBTSxHQUFHWCxPQUFPLENBQUUsaUJBQWtCLENBQUM7QUFDM0MsTUFBTVksTUFBTSxHQUFHWixPQUFPLENBQUUsUUFBUyxDQUFDO0FBQ2xDLE1BQU1hLEdBQUcsR0FBR2IsT0FBTyxDQUFFLE9BQVEsQ0FBQztBQUM5QixNQUFNYyxnQkFBZ0IsR0FBR2QsT0FBTyxDQUFFLG9CQUFxQixDQUFDO0FBQ3hELE1BQU1lLFdBQVcsR0FBR2YsT0FBTyxDQUFFLGVBQWdCLENBQUM7QUFDOUMsTUFBTWdCLElBQUksR0FBR2hCLE9BQU8sQ0FBRSxNQUFPLENBQUM7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