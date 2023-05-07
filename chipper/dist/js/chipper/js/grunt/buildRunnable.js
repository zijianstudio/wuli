// Copyright 2017-2023, University of Colorado Boulder

/**
 * Builds a runnable (something that builds like a simulation)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

// modules
const _ = require('lodash');
const assert = require('assert');
const ChipperConstants = require('../common/ChipperConstants');
const ChipperStringUtils = require('../common/ChipperStringUtils');
const getLicenseEntry = require('../common/getLicenseEntry');
const copyDirectory = require('./copyDirectory');
const copySupplementalPhetioFiles = require('./copySupplementalPhetioFiles');
const generateThumbnails = require('./generateThumbnails');
const generateTwitterCard = require('./generateTwitterCard');
const getA11yViewHTMLFromTemplate = require('./getA11yViewHTMLFromTemplate');
const getAllThirdPartyEntries = require('./getAllThirdPartyEntries');
const getDependencies = require('./getDependencies');
const getInitializationScript = require('./getInitializationScript');
const getLocalesFromRepository = require('./getLocalesFromRepository');
const getPhetLibs = require('./getPhetLibs');
const getPreloads = require('./getPreloads');
const getStringMap = require('./getStringMap');
const getTitleStringKey = require('./getTitleStringKey');
const grunt = require('grunt');
const path = require('path');
const jimp = require('jimp');
const loadFileAsDataURI = require('../common/loadFileAsDataURI');
const minify = require('./minify');
const nodeHTMLEncoder = require('node-html-encoder'); // eslint-disable-line require-statement-match
const packageRunnable = require('./packageRunnable');
const packageXHTML = require('./packageXHTML');
const reportUnusedMedia = require('./reportUnusedMedia');
const reportUnusedStrings = require('./reportUnusedStrings');
const webpackBuild = require('./webpackBuild');
const zlib = require('zlib');
const phetTimingLog = require('../../../perennial-alias/js/common/phetTimingLog');
const recordTime = async (name, asyncCallback, timeCallback) => {
  const beforeTime = Date.now();
  const result = await phetTimingLog.startAsync(name, async () => {
    const result = await asyncCallback();
    return result;
  });
  const afterTime = Date.now();
  timeCallback(afterTime - beforeTime, result);
  return result;
};

/**
 * Builds a runnable (e.g. a simulation).
 * @public
 *
 * @param {string} repo
 * @param {Object} minifyOptions - see minify.js
 * @param {boolean} allHTML - If the _all.html file should be generated
 * @param {string} brand
 * @param {string} localesOption - e.g,. '*', 'en,es', etc.
 * @param {boolean} buildLocal
 * @returns {Promise} - Does not resolve a value
 */
module.exports = async function (repo, minifyOptions, allHTML, brand, localesOption, buildLocal) {
  assert(typeof repo === 'string');
  assert(typeof minifyOptions === 'object');
  if (brand === 'phet-io') {
    assert(grunt.file.exists('../phet-io'), 'Aborting the build of phet-io brand since proprietary repositories are not checked out.\nPlease use --brands=={{BRAND}} in the future to avoid this.');
  }
  const packageObject = grunt.file.readJSON(`../${repo}/package.json`);
  const encoder = new nodeHTMLEncoder.Encoder('entity');

  // All html files share the same build timestamp
  let timestamp = new Date().toISOString().split('T').join(' ');
  timestamp = `${timestamp.substring(0, timestamp.indexOf('.'))} UTC`;

  // Start running webpack
  const webpackResult = await recordTime('webpack', async () => webpackBuild(repo, brand), time => {
    grunt.log.ok(`Webpack build complete: ${time}ms`);
  });

  // NOTE: This build currently (due to the string/mipmap plugins) modifies globals. Some operations need to be done after this.
  const webpackJS = `phet.chipper.runWebpack = function() {${webpackResult.js}};`;

  // Debug version is independent of passed in minifyOptions.  PhET-iO brand is minified, but leaves assertions & logging.
  const debugMinifyOptions = brand === 'phet-io' ? {
    stripAssertions: false,
    stripLogging: false
  } : {
    minify: false
  };

  // If turning off minification for the main build, don't minify the debug version also
  if (minifyOptions.minify === false) {
    debugMinifyOptions.minify = false;
  }
  const usedModules = webpackResult.usedModules;
  reportUnusedMedia(repo, usedModules);
  const licenseEntries = {};
  ChipperConstants.MEDIA_TYPES.forEach(mediaType => {
    licenseEntries[mediaType] = {};
  });
  usedModules.forEach(module => {
    ChipperConstants.MEDIA_TYPES.forEach(mediaType => {
      if (module.split('/')[1] === mediaType) {
        // The file suffix is stripped and restored to its non-js extension. This is because getLicenseEntry doesn't
        // handle modulified media files.
        const index = module.lastIndexOf('_');
        const path = `${module.slice(0, index)}.${module.slice(index + 1, -3)}`;
        licenseEntries[mediaType][module] = getLicenseEntry(`../${path}`);
      }
    });
  });
  const phetLibs = getPhetLibs(repo, brand);
  const allLocales = [ChipperConstants.FALLBACK_LOCALE, ...getLocalesFromRepository(repo)];
  const locales = localesOption === '*' ? allLocales : localesOption.split(',');
  const dependencies = await getDependencies(repo);
  webpackResult.usedModules.forEach(moduleDependency => {
    // The first part of the path is the repo.  Or if no directory is specified, the file is in the sim repo.
    const pathSeparatorIndex = moduleDependency.indexOf(path.sep);
    const moduleRepo = pathSeparatorIndex >= 0 ? moduleDependency.slice(0, pathSeparatorIndex) : repo;
    assert(Object.keys(dependencies).includes(moduleRepo), `repo ${moduleRepo} missing from package.json's phetLibs for ${moduleDependency}`);
  });
  const version = packageObject.version; // Include the one-off name in the version
  const thirdPartyEntries = getAllThirdPartyEntries(repo, brand, licenseEntries);
  const simTitleStringKey = getTitleStringKey(repo);
  const {
    stringMap,
    stringMetadata
  } = getStringMap(repo, allLocales, phetLibs, webpackResult.usedModules);

  // After our string map is constructed, report which of the translatable strings are unused.
  reportUnusedStrings(repo, packageObject.phet.requirejsNamespace, stringMap[ChipperConstants.FALLBACK_LOCALE]);

  // If we have NO strings for a given locale that we want, we'll need to fill it in with all English strings, see
  // https://github.com/phetsims/perennial/issues/83
  for (const locale of locales) {
    if (!stringMap[locale]) {
      stringMap[locale] = stringMap[ChipperConstants.FALLBACK_LOCALE];
    }
  }
  const englishTitle = stringMap[ChipperConstants.FALLBACK_LOCALE][simTitleStringKey];
  assert(englishTitle, `missing entry for sim title, key = ${simTitleStringKey}`);

  // Select the HTML comment header based on the brand, see https://github.com/phetsims/chipper/issues/156
  let htmlHeader;
  if (brand === 'phet-io') {
    // License text provided by @kathy-phet in https://github.com/phetsims/chipper/issues/148#issuecomment-112584773
    htmlHeader = `${englishTitle} ${version}\n` + `Copyright 2002-${grunt.template.today('yyyy')}, Regents of the University of Colorado\n` + 'PhET Interactive Simulations, University of Colorado Boulder\n' + '\n' + 'This Interoperable PhET Simulation file requires a license.\n' + 'USE WITHOUT A LICENSE AGREEMENT IS STRICTLY PROHIBITED.\n' + 'Contact phethelp@colorado.edu regarding licensing.\n' + 'https://phet.colorado.edu/en/licensing';
  } else {
    htmlHeader = `${englishTitle} ${version}\n` + `Copyright 2002-${grunt.template.today('yyyy')}, Regents of the University of Colorado\n` + 'PhET Interactive Simulations, University of Colorado Boulder\n' + '\n' + 'This file is licensed under Creative Commons Attribution 4.0\n' + 'For alternate source code licensing, see https://github.com/phetsims\n' + 'For licenses for third-party software used by this simulation, see below\n' + 'For more information, see https://phet.colorado.edu/en/licensing/html\n' + '\n' + 'The PhET name and PhET logo are registered trademarks of The Regents of the\n' + 'University of Colorado. Permission is granted to use the PhET name and PhET logo\n' + 'only for attribution purposes. Use of the PhET name and/or PhET logo for promotional,\n' + 'marketing, or advertising purposes requires a separate license agreement from the\n' + 'University of Colorado. Contact phethelp@colorado.edu regarding licensing.';
  }

  // Scripts that are run before our main minifiable content
  const startupScripts = [
  // Splash image
  `window.PHET_SPLASH_DATA_URI="${loadFileAsDataURI(`../brand/${brand}/images/splash.svg`)}";`];
  const minifiableScripts = [
  // Preloads
  ...getPreloads(repo, brand, true).map(filename => grunt.file.read(filename)),
  // Our main module content, wrapped in a function called in the startup below
  webpackJS,
  // Main startup
  grunt.file.read('../chipper/templates/chipper-startup.js')];
  const productionScripts = await recordTime('minify-production', async () => {
    return [...startupScripts, ...minifiableScripts.map(js => minify(js, minifyOptions))];
  }, (time, scripts) => {
    grunt.log.ok(`Production minification complete: ${time}ms (${_.sum(scripts.map(js => js.length))} bytes)`);
  });
  const debugScripts = await recordTime('minify-debug', async () => {
    return [...startupScripts, ...minifiableScripts.map(js => minify(js, debugMinifyOptions))];
  }, (time, scripts) => {
    grunt.log.ok(`Debug minification complete: ${time}ms (${_.sum(scripts.map(js => js.length))} bytes)`);
  });
  const commonInitializationOptions = {
    brand: brand,
    repo: repo,
    stringMap: stringMap,
    stringMetadata: stringMetadata,
    dependencies: dependencies,
    timestamp: timestamp,
    version: version,
    thirdPartyEntries: thirdPartyEntries,
    packageObject: packageObject,
    allowLocaleSwitching: false
  };

  // Create the build-specific directory
  const buildDir = `../${repo}/build/${brand}`;
  grunt.file.mkdir(buildDir);

  // {{locale}}.html
  if (brand !== 'phet-io') {
    for (const locale of locales) {
      const initializationScript = getInitializationScript(_.assignIn({
        locale: locale,
        includeAllLocales: false,
        isDebugBuild: false
      }, commonInitializationOptions));
      grunt.file.write(`${buildDir}/${repo}_${locale}_${brand}.html`, packageRunnable({
        repo: repo,
        stringMap: stringMap,
        htmlHeader: htmlHeader,
        locale: locale,
        scripts: [initializationScript, ...productionScripts]
      }));
    }
  }

  // _all.html (forced for phet-io)
  if (allHTML || brand === 'phet-io') {
    const initializationScript = getInitializationScript(_.assignIn({
      locale: ChipperConstants.FALLBACK_LOCALE,
      includeAllLocales: true,
      isDebugBuild: false
    }, commonInitializationOptions, {
      allowLocaleSwitching: true
    }));
    const allHTMLFilename = `${buildDir}/${repo}_all_${brand}.html`;
    const allHTMLContents = packageRunnable({
      repo: repo,
      stringMap: stringMap,
      htmlHeader: htmlHeader,
      locale: ChipperConstants.FALLBACK_LOCALE,
      scripts: [initializationScript, ...productionScripts]
    });
    grunt.file.write(allHTMLFilename, allHTMLContents);

    // Add a compressed file to improve performance in the iOS app, see https://github.com/phetsims/chipper/issues/746
    grunt.file.write(`${allHTMLFilename}.gz`, zlib.gzipSync(allHTMLContents));
  }

  // Debug build (always included)
  const debugInitializationScript = getInitializationScript(_.assignIn({
    locale: ChipperConstants.FALLBACK_LOCALE,
    includeAllLocales: true,
    isDebugBuild: true
  }, commonInitializationOptions, {
    allowLocaleSwitching: true
  }));
  grunt.file.write(`${buildDir}/${repo}_all_${brand}_debug.html`, packageRunnable({
    repo: repo,
    stringMap: stringMap,
    htmlHeader: htmlHeader,
    locale: ChipperConstants.FALLBACK_LOCALE,
    scripts: [debugInitializationScript, ...debugScripts]
  }));

  // XHTML build (ePub compatibility, etc.)
  const xhtmlDir = `${buildDir}/xhtml`;
  grunt.file.mkdir(xhtmlDir);
  const xhtmlInitializationScript = getInitializationScript(_.assignIn({
    locale: ChipperConstants.FALLBACK_LOCALE,
    includeAllLocales: true,
    isDebugBuild: false
  }, commonInitializationOptions, {
    allowLocaleSwitching: true
  }));
  packageXHTML(xhtmlDir, {
    repo: repo,
    brand: brand,
    stringMap: stringMap,
    htmlHeader: htmlHeader,
    initializationScript: xhtmlInitializationScript,
    scripts: productionScripts
  });

  // dependencies.json
  grunt.file.write(`${buildDir}/dependencies.json`, JSON.stringify(dependencies, null, 2));

  // -iframe.html (English is assumed as the locale).
  if (_.includes(locales, ChipperConstants.FALLBACK_LOCALE) && brand === 'phet') {
    const englishTitle = stringMap[ChipperConstants.FALLBACK_LOCALE][getTitleStringKey(repo)];
    grunt.log.debug('Constructing HTML for iframe testing from template');
    let iframeTestHtml = grunt.file.read('../chipper/templates/sim-iframe.html');
    iframeTestHtml = ChipperStringUtils.replaceFirst(iframeTestHtml, '{{PHET_SIM_TITLE}}', encoder.htmlEncode(`${englishTitle} iframe test`));
    iframeTestHtml = ChipperStringUtils.replaceFirst(iframeTestHtml, '{{PHET_REPOSITORY}}', repo);
    const iframeLocales = ['en'].concat(allHTML ? ['all'] : []);
    iframeLocales.forEach(locale => {
      const iframeHtml = ChipperStringUtils.replaceFirst(iframeTestHtml, '{{PHET_LOCALE}}', locale);
      grunt.file.write(`${buildDir}/${repo}_${locale}_iframe_phet.html`, iframeHtml);
    });
  }

  // If the sim is a11y outfitted, then add the a11y pdom viewer to the build dir. NOTE: Not for phet-io builds.
  if (packageObject.phet.simFeatures && packageObject.phet.simFeatures.supportsInteractiveDescription && brand === 'phet') {
    // (a11y) Create the a11y-view HTML file for PDOM viewing.
    let a11yHTML = getA11yViewHTMLFromTemplate(repo);

    // this replaceAll is outside of the getA11yViewHTMLFromTemplate because we only want it filled in during the build
    a11yHTML = ChipperStringUtils.replaceAll(a11yHTML, '{{IS_BUILT}}', 'true');
    grunt.file.write(`${buildDir}/${repo}${ChipperConstants.A11Y_VIEW_HTML_SUFFIX}`, a11yHTML);
  }

  // copy over supplemental files or dirs to package with the build. Only supported in phet brand
  if (packageObject.phet && packageObject.phet.packageWithBuild) {
    assert(Array.isArray(packageObject.phet.packageWithBuild));
    packageObject.phet.packageWithBuild.forEach(path => {
      assert(typeof path === 'string', 'path should be a string');
      assert(grunt.file.exists(path), `path does not exist: ${path}`);
      if (grunt.file.isDir(path)) {
        copyDirectory(path, `${buildDir}/${path}`);
      } else {
        grunt.file.copy(path, `${buildDir}/${path}`);
      }
    });
  }
  if (brand === 'phet-io') {
    await copySupplementalPhetioFiles(repo, version, englishTitle, packageObject, buildLocal, true);
  }

  // Thumbnails and twitter card
  if (grunt.file.exists(`../${repo}/assets/${repo}-screenshot.png`)) {
    const thumbnailSizes = [{
      width: 128,
      height: 84
    }, {
      width: 600,
      height: 394
    }];
    for (const size of thumbnailSizes) {
      grunt.file.write(`${buildDir}/${repo}-${size.width}.png`, await generateThumbnails(repo, size.width, size.height, 100, jimp.MIME_PNG));
    }
    if (brand === 'phet') {
      grunt.file.write(`${buildDir}/${repo}-ios.png`, await generateThumbnails(repo, 420, 276, 90, jimp.MIME_JPEG));
      grunt.file.write(`${buildDir}/${repo}-twitter-card.png`, await generateTwitterCard(repo));
    }
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsImFzc2VydCIsIkNoaXBwZXJDb25zdGFudHMiLCJDaGlwcGVyU3RyaW5nVXRpbHMiLCJnZXRMaWNlbnNlRW50cnkiLCJjb3B5RGlyZWN0b3J5IiwiY29weVN1cHBsZW1lbnRhbFBoZXRpb0ZpbGVzIiwiZ2VuZXJhdGVUaHVtYm5haWxzIiwiZ2VuZXJhdGVUd2l0dGVyQ2FyZCIsImdldEExMXlWaWV3SFRNTEZyb21UZW1wbGF0ZSIsImdldEFsbFRoaXJkUGFydHlFbnRyaWVzIiwiZ2V0RGVwZW5kZW5jaWVzIiwiZ2V0SW5pdGlhbGl6YXRpb25TY3JpcHQiLCJnZXRMb2NhbGVzRnJvbVJlcG9zaXRvcnkiLCJnZXRQaGV0TGlicyIsImdldFByZWxvYWRzIiwiZ2V0U3RyaW5nTWFwIiwiZ2V0VGl0bGVTdHJpbmdLZXkiLCJncnVudCIsInBhdGgiLCJqaW1wIiwibG9hZEZpbGVBc0RhdGFVUkkiLCJtaW5pZnkiLCJub2RlSFRNTEVuY29kZXIiLCJwYWNrYWdlUnVubmFibGUiLCJwYWNrYWdlWEhUTUwiLCJyZXBvcnRVbnVzZWRNZWRpYSIsInJlcG9ydFVudXNlZFN0cmluZ3MiLCJ3ZWJwYWNrQnVpbGQiLCJ6bGliIiwicGhldFRpbWluZ0xvZyIsInJlY29yZFRpbWUiLCJuYW1lIiwiYXN5bmNDYWxsYmFjayIsInRpbWVDYWxsYmFjayIsImJlZm9yZVRpbWUiLCJEYXRlIiwibm93IiwicmVzdWx0Iiwic3RhcnRBc3luYyIsImFmdGVyVGltZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwibWluaWZ5T3B0aW9ucyIsImFsbEhUTUwiLCJicmFuZCIsImxvY2FsZXNPcHRpb24iLCJidWlsZExvY2FsIiwiZmlsZSIsImV4aXN0cyIsInBhY2thZ2VPYmplY3QiLCJyZWFkSlNPTiIsImVuY29kZXIiLCJFbmNvZGVyIiwidGltZXN0YW1wIiwidG9JU09TdHJpbmciLCJzcGxpdCIsImpvaW4iLCJzdWJzdHJpbmciLCJpbmRleE9mIiwid2VicGFja1Jlc3VsdCIsInRpbWUiLCJsb2ciLCJvayIsIndlYnBhY2tKUyIsImpzIiwiZGVidWdNaW5pZnlPcHRpb25zIiwic3RyaXBBc3NlcnRpb25zIiwic3RyaXBMb2dnaW5nIiwidXNlZE1vZHVsZXMiLCJsaWNlbnNlRW50cmllcyIsIk1FRElBX1RZUEVTIiwiZm9yRWFjaCIsIm1lZGlhVHlwZSIsImluZGV4IiwibGFzdEluZGV4T2YiLCJzbGljZSIsInBoZXRMaWJzIiwiYWxsTG9jYWxlcyIsIkZBTExCQUNLX0xPQ0FMRSIsImxvY2FsZXMiLCJkZXBlbmRlbmNpZXMiLCJtb2R1bGVEZXBlbmRlbmN5IiwicGF0aFNlcGFyYXRvckluZGV4Iiwic2VwIiwibW9kdWxlUmVwbyIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInZlcnNpb24iLCJ0aGlyZFBhcnR5RW50cmllcyIsInNpbVRpdGxlU3RyaW5nS2V5Iiwic3RyaW5nTWFwIiwic3RyaW5nTWV0YWRhdGEiLCJwaGV0IiwicmVxdWlyZWpzTmFtZXNwYWNlIiwibG9jYWxlIiwiZW5nbGlzaFRpdGxlIiwiaHRtbEhlYWRlciIsInRlbXBsYXRlIiwidG9kYXkiLCJzdGFydHVwU2NyaXB0cyIsIm1pbmlmaWFibGVTY3JpcHRzIiwibWFwIiwiZmlsZW5hbWUiLCJyZWFkIiwicHJvZHVjdGlvblNjcmlwdHMiLCJzY3JpcHRzIiwic3VtIiwibGVuZ3RoIiwiZGVidWdTY3JpcHRzIiwiY29tbW9uSW5pdGlhbGl6YXRpb25PcHRpb25zIiwiYWxsb3dMb2NhbGVTd2l0Y2hpbmciLCJidWlsZERpciIsIm1rZGlyIiwiaW5pdGlhbGl6YXRpb25TY3JpcHQiLCJhc3NpZ25JbiIsImluY2x1ZGVBbGxMb2NhbGVzIiwiaXNEZWJ1Z0J1aWxkIiwid3JpdGUiLCJhbGxIVE1MRmlsZW5hbWUiLCJhbGxIVE1MQ29udGVudHMiLCJnemlwU3luYyIsImRlYnVnSW5pdGlhbGl6YXRpb25TY3JpcHQiLCJ4aHRtbERpciIsInhodG1sSW5pdGlhbGl6YXRpb25TY3JpcHQiLCJKU09OIiwic3RyaW5naWZ5IiwiZGVidWciLCJpZnJhbWVUZXN0SHRtbCIsInJlcGxhY2VGaXJzdCIsImh0bWxFbmNvZGUiLCJpZnJhbWVMb2NhbGVzIiwiY29uY2F0IiwiaWZyYW1lSHRtbCIsInNpbUZlYXR1cmVzIiwic3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uIiwiYTExeUhUTUwiLCJyZXBsYWNlQWxsIiwiQTExWV9WSUVXX0hUTUxfU1VGRklYIiwicGFja2FnZVdpdGhCdWlsZCIsIkFycmF5IiwiaXNBcnJheSIsImlzRGlyIiwiY29weSIsInRodW1ibmFpbFNpemVzIiwid2lkdGgiLCJoZWlnaHQiLCJzaXplIiwiTUlNRV9QTkciLCJNSU1FX0pQRUciXSwic291cmNlcyI6WyJidWlsZFJ1bm5hYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJ1aWxkcyBhIHJ1bm5hYmxlIChzb21ldGhpbmcgdGhhdCBidWlsZHMgbGlrZSBhIHNpbXVsYXRpb24pXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5cclxuLy8gbW9kdWxlc1xyXG5jb25zdCBfID0gcmVxdWlyZSggJ2xvZGFzaCcgKTtcclxuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcclxuY29uc3QgQ2hpcHBlckNvbnN0YW50cyA9IHJlcXVpcmUoICcuLi9jb21tb24vQ2hpcHBlckNvbnN0YW50cycgKTtcclxuY29uc3QgQ2hpcHBlclN0cmluZ1V0aWxzID0gcmVxdWlyZSggJy4uL2NvbW1vbi9DaGlwcGVyU3RyaW5nVXRpbHMnICk7XHJcbmNvbnN0IGdldExpY2Vuc2VFbnRyeSA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2V0TGljZW5zZUVudHJ5JyApO1xyXG5jb25zdCBjb3B5RGlyZWN0b3J5ID0gcmVxdWlyZSggJy4vY29weURpcmVjdG9yeScgKTtcclxuY29uc3QgY29weVN1cHBsZW1lbnRhbFBoZXRpb0ZpbGVzID0gcmVxdWlyZSggJy4vY29weVN1cHBsZW1lbnRhbFBoZXRpb0ZpbGVzJyApO1xyXG5jb25zdCBnZW5lcmF0ZVRodW1ibmFpbHMgPSByZXF1aXJlKCAnLi9nZW5lcmF0ZVRodW1ibmFpbHMnICk7XHJcbmNvbnN0IGdlbmVyYXRlVHdpdHRlckNhcmQgPSByZXF1aXJlKCAnLi9nZW5lcmF0ZVR3aXR0ZXJDYXJkJyApO1xyXG5jb25zdCBnZXRBMTF5Vmlld0hUTUxGcm9tVGVtcGxhdGUgPSByZXF1aXJlKCAnLi9nZXRBMTF5Vmlld0hUTUxGcm9tVGVtcGxhdGUnICk7XHJcbmNvbnN0IGdldEFsbFRoaXJkUGFydHlFbnRyaWVzID0gcmVxdWlyZSggJy4vZ2V0QWxsVGhpcmRQYXJ0eUVudHJpZXMnICk7XHJcbmNvbnN0IGdldERlcGVuZGVuY2llcyA9IHJlcXVpcmUoICcuL2dldERlcGVuZGVuY2llcycgKTtcclxuY29uc3QgZ2V0SW5pdGlhbGl6YXRpb25TY3JpcHQgPSByZXF1aXJlKCAnLi9nZXRJbml0aWFsaXphdGlvblNjcmlwdCcgKTtcclxuY29uc3QgZ2V0TG9jYWxlc0Zyb21SZXBvc2l0b3J5ID0gcmVxdWlyZSggJy4vZ2V0TG9jYWxlc0Zyb21SZXBvc2l0b3J5JyApO1xyXG5jb25zdCBnZXRQaGV0TGlicyA9IHJlcXVpcmUoICcuL2dldFBoZXRMaWJzJyApO1xyXG5jb25zdCBnZXRQcmVsb2FkcyA9IHJlcXVpcmUoICcuL2dldFByZWxvYWRzJyApO1xyXG5jb25zdCBnZXRTdHJpbmdNYXAgPSByZXF1aXJlKCAnLi9nZXRTdHJpbmdNYXAnICk7XHJcbmNvbnN0IGdldFRpdGxlU3RyaW5nS2V5ID0gcmVxdWlyZSggJy4vZ2V0VGl0bGVTdHJpbmdLZXknICk7XHJcbmNvbnN0IGdydW50ID0gcmVxdWlyZSggJ2dydW50JyApO1xyXG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XHJcbmNvbnN0IGppbXAgPSByZXF1aXJlKCAnamltcCcgKTtcclxuY29uc3QgbG9hZEZpbGVBc0RhdGFVUkkgPSByZXF1aXJlKCAnLi4vY29tbW9uL2xvYWRGaWxlQXNEYXRhVVJJJyApO1xyXG5jb25zdCBtaW5pZnkgPSByZXF1aXJlKCAnLi9taW5pZnknICk7XHJcbmNvbnN0IG5vZGVIVE1MRW5jb2RlciA9IHJlcXVpcmUoICdub2RlLWh0bWwtZW5jb2RlcicgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZXF1aXJlLXN0YXRlbWVudC1tYXRjaFxyXG5jb25zdCBwYWNrYWdlUnVubmFibGUgPSByZXF1aXJlKCAnLi9wYWNrYWdlUnVubmFibGUnICk7XHJcbmNvbnN0IHBhY2thZ2VYSFRNTCA9IHJlcXVpcmUoICcuL3BhY2thZ2VYSFRNTCcgKTtcclxuY29uc3QgcmVwb3J0VW51c2VkTWVkaWEgPSByZXF1aXJlKCAnLi9yZXBvcnRVbnVzZWRNZWRpYScgKTtcclxuY29uc3QgcmVwb3J0VW51c2VkU3RyaW5ncyA9IHJlcXVpcmUoICcuL3JlcG9ydFVudXNlZFN0cmluZ3MnICk7XHJcbmNvbnN0IHdlYnBhY2tCdWlsZCA9IHJlcXVpcmUoICcuL3dlYnBhY2tCdWlsZCcgKTtcclxuY29uc3QgemxpYiA9IHJlcXVpcmUoICd6bGliJyApO1xyXG5jb25zdCBwaGV0VGltaW5nTG9nID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vcGhldFRpbWluZ0xvZycgKTtcclxuXHJcbmNvbnN0IHJlY29yZFRpbWUgPSBhc3luYyAoIG5hbWUsIGFzeW5jQ2FsbGJhY2ssIHRpbWVDYWxsYmFjayApID0+IHtcclxuICBjb25zdCBiZWZvcmVUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGhldFRpbWluZ0xvZy5zdGFydEFzeW5jKCBuYW1lLCBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhc3luY0NhbGxiYWNrKCk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgYWZ0ZXJUaW1lID0gRGF0ZS5ub3coKTtcclxuICB0aW1lQ2FsbGJhY2soIGFmdGVyVGltZSAtIGJlZm9yZVRpbWUsIHJlc3VsdCApO1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG4vKipcclxuICogQnVpbGRzIGEgcnVubmFibGUgKGUuZy4gYSBzaW11bGF0aW9uKS5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xyXG4gKiBAcGFyYW0ge09iamVjdH0gbWluaWZ5T3B0aW9ucyAtIHNlZSBtaW5pZnkuanNcclxuICogQHBhcmFtIHtib29sZWFufSBhbGxIVE1MIC0gSWYgdGhlIF9hbGwuaHRtbCBmaWxlIHNob3VsZCBiZSBnZW5lcmF0ZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IGJyYW5kXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhbGVzT3B0aW9uIC0gZS5nLC4gJyonLCAnZW4sZXMnLCBldGMuXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYnVpbGRMb2NhbFxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBEb2VzIG5vdCByZXNvbHZlIGEgdmFsdWVcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8sIG1pbmlmeU9wdGlvbnMsIGFsbEhUTUwsIGJyYW5kLCBsb2NhbGVzT3B0aW9uLCBidWlsZExvY2FsICkge1xyXG4gIGFzc2VydCggdHlwZW9mIHJlcG8gPT09ICdzdHJpbmcnICk7XHJcbiAgYXNzZXJ0KCB0eXBlb2YgbWluaWZ5T3B0aW9ucyA9PT0gJ29iamVjdCcgKTtcclxuXHJcbiAgaWYgKCBicmFuZCA9PT0gJ3BoZXQtaW8nICkge1xyXG4gICAgYXNzZXJ0KCBncnVudC5maWxlLmV4aXN0cyggJy4uL3BoZXQtaW8nICksICdBYm9ydGluZyB0aGUgYnVpbGQgb2YgcGhldC1pbyBicmFuZCBzaW5jZSBwcm9wcmlldGFyeSByZXBvc2l0b3JpZXMgYXJlIG5vdCBjaGVja2VkIG91dC5cXG5QbGVhc2UgdXNlIC0tYnJhbmRzPT17e0JSQU5EfX0gaW4gdGhlIGZ1dHVyZSB0byBhdm9pZCB0aGlzLicgKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHBhY2thZ2VPYmplY3QgPSBncnVudC5maWxlLnJlYWRKU09OKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gICk7XHJcbiAgY29uc3QgZW5jb2RlciA9IG5ldyBub2RlSFRNTEVuY29kZXIuRW5jb2RlciggJ2VudGl0eScgKTtcclxuXHJcbiAgLy8gQWxsIGh0bWwgZmlsZXMgc2hhcmUgdGhlIHNhbWUgYnVpbGQgdGltZXN0YW1wXHJcbiAgbGV0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCggJ1QnICkuam9pbiggJyAnICk7XHJcbiAgdGltZXN0YW1wID0gYCR7dGltZXN0YW1wLnN1YnN0cmluZyggMCwgdGltZXN0YW1wLmluZGV4T2YoICcuJyApICl9IFVUQ2A7XHJcblxyXG4gIC8vIFN0YXJ0IHJ1bm5pbmcgd2VicGFja1xyXG4gIGNvbnN0IHdlYnBhY2tSZXN1bHQgPSBhd2FpdCByZWNvcmRUaW1lKCAnd2VicGFjaycsIGFzeW5jICgpID0+IHdlYnBhY2tCdWlsZCggcmVwbywgYnJhbmQgKSwgdGltZSA9PiB7XHJcbiAgICBncnVudC5sb2cub2soIGBXZWJwYWNrIGJ1aWxkIGNvbXBsZXRlOiAke3RpbWV9bXNgICk7XHJcbiAgfSApO1xyXG5cclxuICAvLyBOT1RFOiBUaGlzIGJ1aWxkIGN1cnJlbnRseSAoZHVlIHRvIHRoZSBzdHJpbmcvbWlwbWFwIHBsdWdpbnMpIG1vZGlmaWVzIGdsb2JhbHMuIFNvbWUgb3BlcmF0aW9ucyBuZWVkIHRvIGJlIGRvbmUgYWZ0ZXIgdGhpcy5cclxuICBjb25zdCB3ZWJwYWNrSlMgPSBgcGhldC5jaGlwcGVyLnJ1bldlYnBhY2sgPSBmdW5jdGlvbigpIHske3dlYnBhY2tSZXN1bHQuanN9fTtgO1xyXG5cclxuICAvLyBEZWJ1ZyB2ZXJzaW9uIGlzIGluZGVwZW5kZW50IG9mIHBhc3NlZCBpbiBtaW5pZnlPcHRpb25zLiAgUGhFVC1pTyBicmFuZCBpcyBtaW5pZmllZCwgYnV0IGxlYXZlcyBhc3NlcnRpb25zICYgbG9nZ2luZy5cclxuICBjb25zdCBkZWJ1Z01pbmlmeU9wdGlvbnMgPSBicmFuZCA9PT0gJ3BoZXQtaW8nID8ge1xyXG4gICAgc3RyaXBBc3NlcnRpb25zOiBmYWxzZSxcclxuICAgIHN0cmlwTG9nZ2luZzogZmFsc2VcclxuICB9IDoge1xyXG4gICAgbWluaWZ5OiBmYWxzZVxyXG4gIH07XHJcblxyXG4gIC8vIElmIHR1cm5pbmcgb2ZmIG1pbmlmaWNhdGlvbiBmb3IgdGhlIG1haW4gYnVpbGQsIGRvbid0IG1pbmlmeSB0aGUgZGVidWcgdmVyc2lvbiBhbHNvXHJcbiAgaWYgKCBtaW5pZnlPcHRpb25zLm1pbmlmeSA9PT0gZmFsc2UgKSB7XHJcbiAgICBkZWJ1Z01pbmlmeU9wdGlvbnMubWluaWZ5ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBjb25zdCB1c2VkTW9kdWxlcyA9IHdlYnBhY2tSZXN1bHQudXNlZE1vZHVsZXM7XHJcbiAgcmVwb3J0VW51c2VkTWVkaWEoIHJlcG8sIHVzZWRNb2R1bGVzICk7XHJcblxyXG4gIGNvbnN0IGxpY2Vuc2VFbnRyaWVzID0ge307XHJcbiAgQ2hpcHBlckNvbnN0YW50cy5NRURJQV9UWVBFUy5mb3JFYWNoKCBtZWRpYVR5cGUgPT4ge1xyXG4gICAgbGljZW5zZUVudHJpZXNbIG1lZGlhVHlwZSBdID0ge307XHJcbiAgfSApO1xyXG5cclxuICB1c2VkTW9kdWxlcy5mb3JFYWNoKCBtb2R1bGUgPT4ge1xyXG4gICAgQ2hpcHBlckNvbnN0YW50cy5NRURJQV9UWVBFUy5mb3JFYWNoKCBtZWRpYVR5cGUgPT4ge1xyXG4gICAgICBpZiAoIG1vZHVsZS5zcGxpdCggJy8nIClbIDEgXSA9PT0gbWVkaWFUeXBlICkge1xyXG5cclxuICAgICAgICAvLyBUaGUgZmlsZSBzdWZmaXggaXMgc3RyaXBwZWQgYW5kIHJlc3RvcmVkIHRvIGl0cyBub24tanMgZXh0ZW5zaW9uLiBUaGlzIGlzIGJlY2F1c2UgZ2V0TGljZW5zZUVudHJ5IGRvZXNuJ3RcclxuICAgICAgICAvLyBoYW5kbGUgbW9kdWxpZmllZCBtZWRpYSBmaWxlcy5cclxuICAgICAgICBjb25zdCBpbmRleCA9IG1vZHVsZS5sYXN0SW5kZXhPZiggJ18nICk7XHJcbiAgICAgICAgY29uc3QgcGF0aCA9IGAke21vZHVsZS5zbGljZSggMCwgaW5kZXggKX0uJHttb2R1bGUuc2xpY2UoIGluZGV4ICsgMSwgLTMgKX1gO1xyXG4gICAgICAgIGxpY2Vuc2VFbnRyaWVzWyBtZWRpYVR5cGUgXVsgbW9kdWxlIF0gPSBnZXRMaWNlbnNlRW50cnkoIGAuLi8ke3BhdGh9YCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBwaGV0TGlicyA9IGdldFBoZXRMaWJzKCByZXBvLCBicmFuZCApO1xyXG4gIGNvbnN0IGFsbExvY2FsZXMgPSBbIENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFLCAuLi5nZXRMb2NhbGVzRnJvbVJlcG9zaXRvcnkoIHJlcG8gKSBdO1xyXG4gIGNvbnN0IGxvY2FsZXMgPSBsb2NhbGVzT3B0aW9uID09PSAnKicgPyBhbGxMb2NhbGVzIDogbG9jYWxlc09wdGlvbi5zcGxpdCggJywnICk7XHJcbiAgY29uc3QgZGVwZW5kZW5jaWVzID0gYXdhaXQgZ2V0RGVwZW5kZW5jaWVzKCByZXBvICk7XHJcblxyXG4gIHdlYnBhY2tSZXN1bHQudXNlZE1vZHVsZXMuZm9yRWFjaCggbW9kdWxlRGVwZW5kZW5jeSA9PiB7XHJcblxyXG4gICAgLy8gVGhlIGZpcnN0IHBhcnQgb2YgdGhlIHBhdGggaXMgdGhlIHJlcG8uICBPciBpZiBubyBkaXJlY3RvcnkgaXMgc3BlY2lmaWVkLCB0aGUgZmlsZSBpcyBpbiB0aGUgc2ltIHJlcG8uXHJcbiAgICBjb25zdCBwYXRoU2VwYXJhdG9ySW5kZXggPSBtb2R1bGVEZXBlbmRlbmN5LmluZGV4T2YoIHBhdGguc2VwICk7XHJcbiAgICBjb25zdCBtb2R1bGVSZXBvID0gcGF0aFNlcGFyYXRvckluZGV4ID49IDAgPyBtb2R1bGVEZXBlbmRlbmN5LnNsaWNlKCAwLCBwYXRoU2VwYXJhdG9ySW5kZXggKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgcmVwbztcclxuICAgIGFzc2VydCggT2JqZWN0LmtleXMoIGRlcGVuZGVuY2llcyApLmluY2x1ZGVzKCBtb2R1bGVSZXBvICksIGByZXBvICR7bW9kdWxlUmVwb30gbWlzc2luZyBmcm9tIHBhY2thZ2UuanNvbidzIHBoZXRMaWJzIGZvciAke21vZHVsZURlcGVuZGVuY3l9YCApO1xyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgdmVyc2lvbiA9IHBhY2thZ2VPYmplY3QudmVyc2lvbjsgLy8gSW5jbHVkZSB0aGUgb25lLW9mZiBuYW1lIGluIHRoZSB2ZXJzaW9uXHJcbiAgY29uc3QgdGhpcmRQYXJ0eUVudHJpZXMgPSBnZXRBbGxUaGlyZFBhcnR5RW50cmllcyggcmVwbywgYnJhbmQsIGxpY2Vuc2VFbnRyaWVzICk7XHJcbiAgY29uc3Qgc2ltVGl0bGVTdHJpbmdLZXkgPSBnZXRUaXRsZVN0cmluZ0tleSggcmVwbyApO1xyXG5cclxuICBjb25zdCB7IHN0cmluZ01hcCwgc3RyaW5nTWV0YWRhdGEgfSA9IGdldFN0cmluZ01hcCggcmVwbywgYWxsTG9jYWxlcywgcGhldExpYnMsIHdlYnBhY2tSZXN1bHQudXNlZE1vZHVsZXMgKTtcclxuXHJcbiAgLy8gQWZ0ZXIgb3VyIHN0cmluZyBtYXAgaXMgY29uc3RydWN0ZWQsIHJlcG9ydCB3aGljaCBvZiB0aGUgdHJhbnNsYXRhYmxlIHN0cmluZ3MgYXJlIHVudXNlZC5cclxuICByZXBvcnRVbnVzZWRTdHJpbmdzKCByZXBvLCBwYWNrYWdlT2JqZWN0LnBoZXQucmVxdWlyZWpzTmFtZXNwYWNlLCBzdHJpbmdNYXBbIENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFIF0gKTtcclxuXHJcbiAgLy8gSWYgd2UgaGF2ZSBOTyBzdHJpbmdzIGZvciBhIGdpdmVuIGxvY2FsZSB0aGF0IHdlIHdhbnQsIHdlJ2xsIG5lZWQgdG8gZmlsbCBpdCBpbiB3aXRoIGFsbCBFbmdsaXNoIHN0cmluZ3MsIHNlZVxyXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZXJlbm5pYWwvaXNzdWVzLzgzXHJcbiAgZm9yICggY29uc3QgbG9jYWxlIG9mIGxvY2FsZXMgKSB7XHJcbiAgICBpZiAoICFzdHJpbmdNYXBbIGxvY2FsZSBdICkge1xyXG4gICAgICBzdHJpbmdNYXBbIGxvY2FsZSBdID0gc3RyaW5nTWFwWyBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSBdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgZW5nbGlzaFRpdGxlID0gc3RyaW5nTWFwWyBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSBdWyBzaW1UaXRsZVN0cmluZ0tleSBdO1xyXG4gIGFzc2VydCggZW5nbGlzaFRpdGxlLCBgbWlzc2luZyBlbnRyeSBmb3Igc2ltIHRpdGxlLCBrZXkgPSAke3NpbVRpdGxlU3RyaW5nS2V5fWAgKTtcclxuXHJcbiAgLy8gU2VsZWN0IHRoZSBIVE1MIGNvbW1lbnQgaGVhZGVyIGJhc2VkIG9uIHRoZSBicmFuZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xNTZcclxuICBsZXQgaHRtbEhlYWRlcjtcclxuICBpZiAoIGJyYW5kID09PSAncGhldC1pbycgKSB7XHJcblxyXG4gICAgLy8gTGljZW5zZSB0ZXh0IHByb3ZpZGVkIGJ5IEBrYXRoeS1waGV0IGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xNDgjaXNzdWVjb21tZW50LTExMjU4NDc3M1xyXG4gICAgaHRtbEhlYWRlciA9IGAke2VuZ2xpc2hUaXRsZX0gJHt2ZXJzaW9ufVxcbmAgK1xyXG4gICAgICAgICAgICAgICAgIGBDb3B5cmlnaHQgMjAwMi0ke2dydW50LnRlbXBsYXRlLnRvZGF5KCAneXl5eScgKX0sIFJlZ2VudHMgb2YgdGhlIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG9cXG5gICtcclxuICAgICAgICAgICAgICAgICAnUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXFxuJyArXHJcbiAgICAgICAgICAgICAgICAgJ1xcbicgK1xyXG4gICAgICAgICAgICAgICAgICdUaGlzIEludGVyb3BlcmFibGUgUGhFVCBTaW11bGF0aW9uIGZpbGUgcmVxdWlyZXMgYSBsaWNlbnNlLlxcbicgK1xyXG4gICAgICAgICAgICAgICAgICdVU0UgV0lUSE9VVCBBIExJQ0VOU0UgQUdSRUVNRU5UIElTIFNUUklDVExZIFBST0hJQklURUQuXFxuJyArXHJcbiAgICAgICAgICAgICAgICAgJ0NvbnRhY3QgcGhldGhlbHBAY29sb3JhZG8uZWR1IHJlZ2FyZGluZyBsaWNlbnNpbmcuXFxuJyArXHJcbiAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vcGhldC5jb2xvcmFkby5lZHUvZW4vbGljZW5zaW5nJztcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBodG1sSGVhZGVyID0gYCR7ZW5nbGlzaFRpdGxlfSAke3ZlcnNpb259XFxuYCArXHJcbiAgICAgICAgICAgICAgICAgYENvcHlyaWdodCAyMDAyLSR7Z3J1bnQudGVtcGxhdGUudG9kYXkoICd5eXl5JyApfSwgUmVnZW50cyBvZiB0aGUgVW5pdmVyc2l0eSBvZiBDb2xvcmFkb1xcbmAgK1xyXG4gICAgICAgICAgICAgICAgICdQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcXG4nICtcclxuICAgICAgICAgICAgICAgICAnXFxuJyArXHJcbiAgICAgICAgICAgICAgICAgJ1RoaXMgZmlsZSBpcyBsaWNlbnNlZCB1bmRlciBDcmVhdGl2ZSBDb21tb25zIEF0dHJpYnV0aW9uIDQuMFxcbicgK1xyXG4gICAgICAgICAgICAgICAgICdGb3IgYWx0ZXJuYXRlIHNvdXJjZSBjb2RlIGxpY2Vuc2luZywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltc1xcbicgK1xyXG4gICAgICAgICAgICAgICAgICdGb3IgbGljZW5zZXMgZm9yIHRoaXJkLXBhcnR5IHNvZnR3YXJlIHVzZWQgYnkgdGhpcyBzaW11bGF0aW9uLCBzZWUgYmVsb3dcXG4nICtcclxuICAgICAgICAgICAgICAgICAnRm9yIG1vcmUgaW5mb3JtYXRpb24sIHNlZSBodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L2VuL2xpY2Vuc2luZy9odG1sXFxuJyArXHJcbiAgICAgICAgICAgICAgICAgJ1xcbicgK1xyXG4gICAgICAgICAgICAgICAgICdUaGUgUGhFVCBuYW1lIGFuZCBQaEVUIGxvZ28gYXJlIHJlZ2lzdGVyZWQgdHJhZGVtYXJrcyBvZiBUaGUgUmVnZW50cyBvZiB0aGVcXG4nICtcclxuICAgICAgICAgICAgICAgICAnVW5pdmVyc2l0eSBvZiBDb2xvcmFkby4gUGVybWlzc2lvbiBpcyBncmFudGVkIHRvIHVzZSB0aGUgUGhFVCBuYW1lIGFuZCBQaEVUIGxvZ29cXG4nICtcclxuICAgICAgICAgICAgICAgICAnb25seSBmb3IgYXR0cmlidXRpb24gcHVycG9zZXMuIFVzZSBvZiB0aGUgUGhFVCBuYW1lIGFuZC9vciBQaEVUIGxvZ28gZm9yIHByb21vdGlvbmFsLFxcbicgK1xyXG4gICAgICAgICAgICAgICAgICdtYXJrZXRpbmcsIG9yIGFkdmVydGlzaW5nIHB1cnBvc2VzIHJlcXVpcmVzIGEgc2VwYXJhdGUgbGljZW5zZSBhZ3JlZW1lbnQgZnJvbSB0aGVcXG4nICtcclxuICAgICAgICAgICAgICAgICAnVW5pdmVyc2l0eSBvZiBDb2xvcmFkby4gQ29udGFjdCBwaGV0aGVscEBjb2xvcmFkby5lZHUgcmVnYXJkaW5nIGxpY2Vuc2luZy4nO1xyXG4gIH1cclxuXHJcbiAgLy8gU2NyaXB0cyB0aGF0IGFyZSBydW4gYmVmb3JlIG91ciBtYWluIG1pbmlmaWFibGUgY29udGVudFxyXG4gIGNvbnN0IHN0YXJ0dXBTY3JpcHRzID0gW1xyXG4gICAgLy8gU3BsYXNoIGltYWdlXHJcbiAgICBgd2luZG93LlBIRVRfU1BMQVNIX0RBVEFfVVJJPVwiJHtsb2FkRmlsZUFzRGF0YVVSSSggYC4uL2JyYW5kLyR7YnJhbmR9L2ltYWdlcy9zcGxhc2guc3ZnYCApfVwiO2BcclxuICBdO1xyXG5cclxuICBjb25zdCBtaW5pZmlhYmxlU2NyaXB0cyA9IFtcclxuICAgIC8vIFByZWxvYWRzXHJcbiAgICAuLi5nZXRQcmVsb2FkcyggcmVwbywgYnJhbmQsIHRydWUgKS5tYXAoIGZpbGVuYW1lID0+IGdydW50LmZpbGUucmVhZCggZmlsZW5hbWUgKSApLFxyXG5cclxuICAgIC8vIE91ciBtYWluIG1vZHVsZSBjb250ZW50LCB3cmFwcGVkIGluIGEgZnVuY3Rpb24gY2FsbGVkIGluIHRoZSBzdGFydHVwIGJlbG93XHJcbiAgICB3ZWJwYWNrSlMsXHJcblxyXG4gICAgLy8gTWFpbiBzdGFydHVwXHJcbiAgICBncnVudC5maWxlLnJlYWQoICcuLi9jaGlwcGVyL3RlbXBsYXRlcy9jaGlwcGVyLXN0YXJ0dXAuanMnIClcclxuICBdO1xyXG5cclxuICBjb25zdCBwcm9kdWN0aW9uU2NyaXB0cyA9IGF3YWl0IHJlY29yZFRpbWUoICdtaW5pZnktcHJvZHVjdGlvbicsIGFzeW5jICgpID0+IHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgIC4uLnN0YXJ0dXBTY3JpcHRzLFxyXG4gICAgICAuLi5taW5pZmlhYmxlU2NyaXB0cy5tYXAoIGpzID0+IG1pbmlmeSgganMsIG1pbmlmeU9wdGlvbnMgKSApXHJcbiAgICBdO1xyXG4gIH0sICggdGltZSwgc2NyaXB0cyApID0+IHtcclxuICAgIGdydW50LmxvZy5vayggYFByb2R1Y3Rpb24gbWluaWZpY2F0aW9uIGNvbXBsZXRlOiAke3RpbWV9bXMgKCR7Xy5zdW0oIHNjcmlwdHMubWFwKCBqcyA9PiBqcy5sZW5ndGggKSApfSBieXRlcylgICk7XHJcbiAgfSApO1xyXG4gIGNvbnN0IGRlYnVnU2NyaXB0cyA9IGF3YWl0IHJlY29yZFRpbWUoICdtaW5pZnktZGVidWcnLCBhc3luYyAoKSA9PiB7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAuLi5zdGFydHVwU2NyaXB0cyxcclxuICAgICAgLi4ubWluaWZpYWJsZVNjcmlwdHMubWFwKCBqcyA9PiBtaW5pZnkoIGpzLCBkZWJ1Z01pbmlmeU9wdGlvbnMgKSApXHJcbiAgICBdO1xyXG4gIH0sICggdGltZSwgc2NyaXB0cyApID0+IHtcclxuICAgIGdydW50LmxvZy5vayggYERlYnVnIG1pbmlmaWNhdGlvbiBjb21wbGV0ZTogJHt0aW1lfW1zICgke18uc3VtKCBzY3JpcHRzLm1hcCgganMgPT4ganMubGVuZ3RoICkgKX0gYnl0ZXMpYCApO1xyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgY29tbW9uSW5pdGlhbGl6YXRpb25PcHRpb25zID0ge1xyXG4gICAgYnJhbmQ6IGJyYW5kLFxyXG4gICAgcmVwbzogcmVwbyxcclxuICAgIHN0cmluZ01hcDogc3RyaW5nTWFwLFxyXG4gICAgc3RyaW5nTWV0YWRhdGE6IHN0cmluZ01ldGFkYXRhLFxyXG4gICAgZGVwZW5kZW5jaWVzOiBkZXBlbmRlbmNpZXMsXHJcbiAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcCxcclxuICAgIHZlcnNpb246IHZlcnNpb24sXHJcbiAgICB0aGlyZFBhcnR5RW50cmllczogdGhpcmRQYXJ0eUVudHJpZXMsXHJcbiAgICBwYWNrYWdlT2JqZWN0OiBwYWNrYWdlT2JqZWN0LFxyXG4gICAgYWxsb3dMb2NhbGVTd2l0Y2hpbmc6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSBidWlsZC1zcGVjaWZpYyBkaXJlY3RvcnlcclxuICBjb25zdCBidWlsZERpciA9IGAuLi8ke3JlcG99L2J1aWxkLyR7YnJhbmR9YDtcclxuICBncnVudC5maWxlLm1rZGlyKCBidWlsZERpciApO1xyXG5cclxuICAvLyB7e2xvY2FsZX19Lmh0bWxcclxuICBpZiAoIGJyYW5kICE9PSAncGhldC1pbycgKSB7XHJcbiAgICBmb3IgKCBjb25zdCBsb2NhbGUgb2YgbG9jYWxlcyApIHtcclxuICAgICAgY29uc3QgaW5pdGlhbGl6YXRpb25TY3JpcHQgPSBnZXRJbml0aWFsaXphdGlvblNjcmlwdCggXy5hc3NpZ25Jbigge1xyXG4gICAgICAgIGxvY2FsZTogbG9jYWxlLFxyXG4gICAgICAgIGluY2x1ZGVBbGxMb2NhbGVzOiBmYWxzZSxcclxuICAgICAgICBpc0RlYnVnQnVpbGQ6IGZhbHNlXHJcbiAgICAgIH0sIGNvbW1vbkluaXRpYWxpemF0aW9uT3B0aW9ucyApICk7XHJcblxyXG4gICAgICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn0vJHtyZXBvfV8ke2xvY2FsZX1fJHticmFuZH0uaHRtbGAsIHBhY2thZ2VSdW5uYWJsZSgge1xyXG4gICAgICAgIHJlcG86IHJlcG8sXHJcbiAgICAgICAgc3RyaW5nTWFwOiBzdHJpbmdNYXAsXHJcbiAgICAgICAgaHRtbEhlYWRlcjogaHRtbEhlYWRlcixcclxuICAgICAgICBsb2NhbGU6IGxvY2FsZSxcclxuICAgICAgICBzY3JpcHRzOiBbIGluaXRpYWxpemF0aW9uU2NyaXB0LCAuLi5wcm9kdWN0aW9uU2NyaXB0cyBdXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gX2FsbC5odG1sIChmb3JjZWQgZm9yIHBoZXQtaW8pXHJcbiAgaWYgKCBhbGxIVE1MIHx8IGJyYW5kID09PSAncGhldC1pbycgKSB7XHJcbiAgICBjb25zdCBpbml0aWFsaXphdGlvblNjcmlwdCA9IGdldEluaXRpYWxpemF0aW9uU2NyaXB0KCBfLmFzc2lnbkluKCB7XHJcbiAgICAgIGxvY2FsZTogQ2hpcHBlckNvbnN0YW50cy5GQUxMQkFDS19MT0NBTEUsXHJcbiAgICAgIGluY2x1ZGVBbGxMb2NhbGVzOiB0cnVlLFxyXG4gICAgICBpc0RlYnVnQnVpbGQ6IGZhbHNlXHJcbiAgICB9LCBjb21tb25Jbml0aWFsaXphdGlvbk9wdGlvbnMsIHtcclxuICAgICAgYWxsb3dMb2NhbGVTd2l0Y2hpbmc6IHRydWVcclxuICAgIH0gKSApO1xyXG5cclxuICAgIGNvbnN0IGFsbEhUTUxGaWxlbmFtZSA9IGAke2J1aWxkRGlyfS8ke3JlcG99X2FsbF8ke2JyYW5kfS5odG1sYDtcclxuICAgIGNvbnN0IGFsbEhUTUxDb250ZW50cyA9IHBhY2thZ2VSdW5uYWJsZSgge1xyXG4gICAgICByZXBvOiByZXBvLFxyXG4gICAgICBzdHJpbmdNYXA6IHN0cmluZ01hcCxcclxuICAgICAgaHRtbEhlYWRlcjogaHRtbEhlYWRlcixcclxuICAgICAgbG9jYWxlOiBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSxcclxuICAgICAgc2NyaXB0czogWyBpbml0aWFsaXphdGlvblNjcmlwdCwgLi4ucHJvZHVjdGlvblNjcmlwdHMgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIGdydW50LmZpbGUud3JpdGUoIGFsbEhUTUxGaWxlbmFtZSwgYWxsSFRNTENvbnRlbnRzICk7XHJcblxyXG4gICAgLy8gQWRkIGEgY29tcHJlc3NlZCBmaWxlIHRvIGltcHJvdmUgcGVyZm9ybWFuY2UgaW4gdGhlIGlPUyBhcHAsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvNzQ2XHJcbiAgICBncnVudC5maWxlLndyaXRlKCBgJHthbGxIVE1MRmlsZW5hbWV9Lmd6YCwgemxpYi5nemlwU3luYyggYWxsSFRNTENvbnRlbnRzICkgKTtcclxuICB9XHJcblxyXG4gIC8vIERlYnVnIGJ1aWxkIChhbHdheXMgaW5jbHVkZWQpXHJcbiAgY29uc3QgZGVidWdJbml0aWFsaXphdGlvblNjcmlwdCA9IGdldEluaXRpYWxpemF0aW9uU2NyaXB0KCBfLmFzc2lnbkluKCB7XHJcbiAgICBsb2NhbGU6IENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFLFxyXG4gICAgaW5jbHVkZUFsbExvY2FsZXM6IHRydWUsXHJcbiAgICBpc0RlYnVnQnVpbGQ6IHRydWVcclxuICB9LCBjb21tb25Jbml0aWFsaXphdGlvbk9wdGlvbnMsIHtcclxuICAgIGFsbG93TG9jYWxlU3dpdGNoaW5nOiB0cnVlXHJcbiAgfSApICk7XHJcblxyXG4gIGdydW50LmZpbGUud3JpdGUoIGAke2J1aWxkRGlyfS8ke3JlcG99X2FsbF8ke2JyYW5kfV9kZWJ1Zy5odG1sYCwgcGFja2FnZVJ1bm5hYmxlKCB7XHJcbiAgICByZXBvOiByZXBvLFxyXG4gICAgc3RyaW5nTWFwOiBzdHJpbmdNYXAsXHJcbiAgICBodG1sSGVhZGVyOiBodG1sSGVhZGVyLFxyXG4gICAgbG9jYWxlOiBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSxcclxuICAgIHNjcmlwdHM6IFsgZGVidWdJbml0aWFsaXphdGlvblNjcmlwdCwgLi4uZGVidWdTY3JpcHRzIF1cclxuICB9ICkgKTtcclxuXHJcbiAgLy8gWEhUTUwgYnVpbGQgKGVQdWIgY29tcGF0aWJpbGl0eSwgZXRjLilcclxuICBjb25zdCB4aHRtbERpciA9IGAke2J1aWxkRGlyfS94aHRtbGA7XHJcbiAgZ3J1bnQuZmlsZS5ta2RpciggeGh0bWxEaXIgKTtcclxuICBjb25zdCB4aHRtbEluaXRpYWxpemF0aW9uU2NyaXB0ID0gZ2V0SW5pdGlhbGl6YXRpb25TY3JpcHQoIF8uYXNzaWduSW4oIHtcclxuICAgIGxvY2FsZTogQ2hpcHBlckNvbnN0YW50cy5GQUxMQkFDS19MT0NBTEUsXHJcbiAgICBpbmNsdWRlQWxsTG9jYWxlczogdHJ1ZSxcclxuICAgIGlzRGVidWdCdWlsZDogZmFsc2VcclxuICB9LCBjb21tb25Jbml0aWFsaXphdGlvbk9wdGlvbnMsIHtcclxuICAgIGFsbG93TG9jYWxlU3dpdGNoaW5nOiB0cnVlXHJcbiAgfSApICk7XHJcblxyXG4gIHBhY2thZ2VYSFRNTCggeGh0bWxEaXIsIHtcclxuICAgIHJlcG86IHJlcG8sXHJcbiAgICBicmFuZDogYnJhbmQsXHJcbiAgICBzdHJpbmdNYXA6IHN0cmluZ01hcCxcclxuICAgIGh0bWxIZWFkZXI6IGh0bWxIZWFkZXIsXHJcbiAgICBpbml0aWFsaXphdGlvblNjcmlwdDogeGh0bWxJbml0aWFsaXphdGlvblNjcmlwdCxcclxuICAgIHNjcmlwdHM6IHByb2R1Y3Rpb25TY3JpcHRzXHJcbiAgfSApO1xyXG5cclxuICAvLyBkZXBlbmRlbmNpZXMuanNvblxyXG4gIGdydW50LmZpbGUud3JpdGUoIGAke2J1aWxkRGlyfS9kZXBlbmRlbmNpZXMuanNvbmAsIEpTT04uc3RyaW5naWZ5KCBkZXBlbmRlbmNpZXMsIG51bGwsIDIgKSApO1xyXG5cclxuICAvLyAtaWZyYW1lLmh0bWwgKEVuZ2xpc2ggaXMgYXNzdW1lZCBhcyB0aGUgbG9jYWxlKS5cclxuICBpZiAoIF8uaW5jbHVkZXMoIGxvY2FsZXMsIENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFICkgJiYgYnJhbmQgPT09ICdwaGV0JyApIHtcclxuICAgIGNvbnN0IGVuZ2xpc2hUaXRsZSA9IHN0cmluZ01hcFsgQ2hpcHBlckNvbnN0YW50cy5GQUxMQkFDS19MT0NBTEUgXVsgZ2V0VGl0bGVTdHJpbmdLZXkoIHJlcG8gKSBdO1xyXG5cclxuICAgIGdydW50LmxvZy5kZWJ1ZyggJ0NvbnN0cnVjdGluZyBIVE1MIGZvciBpZnJhbWUgdGVzdGluZyBmcm9tIHRlbXBsYXRlJyApO1xyXG4gICAgbGV0IGlmcmFtZVRlc3RIdG1sID0gZ3J1bnQuZmlsZS5yZWFkKCAnLi4vY2hpcHBlci90ZW1wbGF0ZXMvc2ltLWlmcmFtZS5odG1sJyApO1xyXG4gICAgaWZyYW1lVGVzdEh0bWwgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUZpcnN0KCBpZnJhbWVUZXN0SHRtbCwgJ3t7UEhFVF9TSU1fVElUTEV9fScsIGVuY29kZXIuaHRtbEVuY29kZSggYCR7ZW5nbGlzaFRpdGxlfSBpZnJhbWUgdGVzdGAgKSApO1xyXG4gICAgaWZyYW1lVGVzdEh0bWwgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUZpcnN0KCBpZnJhbWVUZXN0SHRtbCwgJ3t7UEhFVF9SRVBPU0lUT1JZfX0nLCByZXBvICk7XHJcblxyXG4gICAgY29uc3QgaWZyYW1lTG9jYWxlcyA9IFsgJ2VuJyBdLmNvbmNhdCggYWxsSFRNTCA/IFsgJ2FsbCcgXSA6IFtdICk7XHJcbiAgICBpZnJhbWVMb2NhbGVzLmZvckVhY2goIGxvY2FsZSA9PiB7XHJcbiAgICAgIGNvbnN0IGlmcmFtZUh0bWwgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUZpcnN0KCBpZnJhbWVUZXN0SHRtbCwgJ3t7UEhFVF9MT0NBTEV9fScsIGxvY2FsZSApO1xyXG4gICAgICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn0vJHtyZXBvfV8ke2xvY2FsZX1faWZyYW1lX3BoZXQuaHRtbGAsIGlmcmFtZUh0bWwgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8vIElmIHRoZSBzaW0gaXMgYTExeSBvdXRmaXR0ZWQsIHRoZW4gYWRkIHRoZSBhMTF5IHBkb20gdmlld2VyIHRvIHRoZSBidWlsZCBkaXIuIE5PVEU6IE5vdCBmb3IgcGhldC1pbyBidWlsZHMuXHJcbiAgaWYgKCBwYWNrYWdlT2JqZWN0LnBoZXQuc2ltRmVhdHVyZXMgJiYgcGFja2FnZU9iamVjdC5waGV0LnNpbUZlYXR1cmVzLnN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbiAmJiBicmFuZCA9PT0gJ3BoZXQnICkge1xyXG4gICAgLy8gKGExMXkpIENyZWF0ZSB0aGUgYTExeS12aWV3IEhUTUwgZmlsZSBmb3IgUERPTSB2aWV3aW5nLlxyXG4gICAgbGV0IGExMXlIVE1MID0gZ2V0QTExeVZpZXdIVE1MRnJvbVRlbXBsYXRlKCByZXBvICk7XHJcblxyXG4gICAgLy8gdGhpcyByZXBsYWNlQWxsIGlzIG91dHNpZGUgb2YgdGhlIGdldEExMXlWaWV3SFRNTEZyb21UZW1wbGF0ZSBiZWNhdXNlIHdlIG9ubHkgd2FudCBpdCBmaWxsZWQgaW4gZHVyaW5nIHRoZSBidWlsZFxyXG4gICAgYTExeUhUTUwgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggYTExeUhUTUwsICd7e0lTX0JVSUxUfX0nLCAndHJ1ZScgKTtcclxuXHJcbiAgICBncnVudC5maWxlLndyaXRlKCBgJHtidWlsZERpcn0vJHtyZXBvfSR7Q2hpcHBlckNvbnN0YW50cy5BMTFZX1ZJRVdfSFRNTF9TVUZGSVh9YCwgYTExeUhUTUwgKTtcclxuICB9XHJcblxyXG4gIC8vIGNvcHkgb3ZlciBzdXBwbGVtZW50YWwgZmlsZXMgb3IgZGlycyB0byBwYWNrYWdlIHdpdGggdGhlIGJ1aWxkLiBPbmx5IHN1cHBvcnRlZCBpbiBwaGV0IGJyYW5kXHJcbiAgaWYgKCBwYWNrYWdlT2JqZWN0LnBoZXQgJiYgcGFja2FnZU9iamVjdC5waGV0LnBhY2thZ2VXaXRoQnVpbGQgKSB7XHJcblxyXG4gICAgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBwYWNrYWdlT2JqZWN0LnBoZXQucGFja2FnZVdpdGhCdWlsZCApICk7XHJcbiAgICBwYWNrYWdlT2JqZWN0LnBoZXQucGFja2FnZVdpdGhCdWlsZC5mb3JFYWNoKCBwYXRoID0+IHtcclxuXHJcbiAgICAgIGFzc2VydCggdHlwZW9mIHBhdGggPT09ICdzdHJpbmcnLCAncGF0aCBzaG91bGQgYmUgYSBzdHJpbmcnICk7XHJcbiAgICAgIGFzc2VydCggZ3J1bnQuZmlsZS5leGlzdHMoIHBhdGggKSwgYHBhdGggZG9lcyBub3QgZXhpc3Q6ICR7cGF0aH1gICk7XHJcbiAgICAgIGlmICggZ3J1bnQuZmlsZS5pc0RpciggcGF0aCApICkge1xyXG4gICAgICAgIGNvcHlEaXJlY3RvcnkoIHBhdGgsIGAke2J1aWxkRGlyfS8ke3BhdGh9YCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGdydW50LmZpbGUuY29weSggcGF0aCwgYCR7YnVpbGREaXJ9LyR7cGF0aH1gICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIGlmICggYnJhbmQgPT09ICdwaGV0LWlvJyApIHtcclxuICAgIGF3YWl0IGNvcHlTdXBwbGVtZW50YWxQaGV0aW9GaWxlcyggcmVwbywgdmVyc2lvbiwgZW5nbGlzaFRpdGxlLCBwYWNrYWdlT2JqZWN0LCBidWlsZExvY2FsLCB0cnVlICk7XHJcbiAgfVxyXG5cclxuICAvLyBUaHVtYm5haWxzIGFuZCB0d2l0dGVyIGNhcmRcclxuICBpZiAoIGdydW50LmZpbGUuZXhpc3RzKCBgLi4vJHtyZXBvfS9hc3NldHMvJHtyZXBvfS1zY3JlZW5zaG90LnBuZ2AgKSApIHtcclxuICAgIGNvbnN0IHRodW1ibmFpbFNpemVzID0gW1xyXG4gICAgICB7IHdpZHRoOiAxMjgsIGhlaWdodDogODQgfSxcclxuICAgICAgeyB3aWR0aDogNjAwLCBoZWlnaHQ6IDM5NCB9XHJcbiAgICBdO1xyXG4gICAgZm9yICggY29uc3Qgc2l6ZSBvZiB0aHVtYm5haWxTaXplcyApIHtcclxuICAgICAgZ3J1bnQuZmlsZS53cml0ZSggYCR7YnVpbGREaXJ9LyR7cmVwb30tJHtzaXplLndpZHRofS5wbmdgLCBhd2FpdCBnZW5lcmF0ZVRodW1ibmFpbHMoIHJlcG8sIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0LCAxMDAsIGppbXAuTUlNRV9QTkcgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggYnJhbmQgPT09ICdwaGV0JyApIHtcclxuICAgICAgZ3J1bnQuZmlsZS53cml0ZSggYCR7YnVpbGREaXJ9LyR7cmVwb30taW9zLnBuZ2AsIGF3YWl0IGdlbmVyYXRlVGh1bWJuYWlscyggcmVwbywgNDIwLCAyNzYsIDkwLCBqaW1wLk1JTUVfSlBFRyApICk7XHJcbiAgICAgIGdydW50LmZpbGUud3JpdGUoIGAke2J1aWxkRGlyfS8ke3JlcG99LXR3aXR0ZXItY2FyZC5wbmdgLCBhd2FpdCBnZW5lcmF0ZVR3aXR0ZXJDYXJkKCByZXBvICkgKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJc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