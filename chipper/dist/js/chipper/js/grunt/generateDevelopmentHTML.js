// Copyright 2015-2023, University of Colorado Boulder

/**
 * Generates the top-level main HTML file for simulations (or runnables) using phet-brand splash and loading phet-io
 * preloads when brand=phet-io is specified.
 *
 * See https://github.com/phetsims/chipper/issues/63
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

// modules
const _ = require('lodash');
const ChipperStringUtils = require('../common/ChipperStringUtils');
const fixEOL = require('./fixEOL');
const getPreloads = require('./getPreloads');
const getStringRepos = require('./getStringRepos');
const writeFileAndGitAdd = require('../../../perennial-alias/js/common/writeFileAndGitAdd');
const grunt = require('grunt');

/**
 * @param {string} repo
 * @param {Object} [options]
 *
 * @returns {Promise}
 */
module.exports = async function (repo, options) {
  const {
    stylesheets = '',
    bodystyle = ' style="background-color:black;"',
    // note the preceding ' ' which is essential
    outputFile = `${repo}_en.html`,
    bodystart = '',
    addedPreloads = [],
    // none to add
    stripPreloads = [],
    // none to add
    mainFile = `../chipper/dist/js/${repo}/js/${repo}-main.js`,
    forSim = true // is this html used for a sim, or something else like tests.
  } = options || {};
  const packageObject = grunt.file.readJSON(`../${repo}/package.json`);
  const brand = 'phet';
  const splashURL = `../brand/${brand}/images/splash.svg`;
  let html = grunt.file.read('../chipper/templates/sim-development.html'); // the template file

  // Formatting is very specific to the template file. Each preload is placed on separate line,
  // with an indentation that is specific indentation to the template. See chipper#462
  function stringifyArray(arr, indentation) {
    return `[\n${arr.map(string => `${indentation}    '${string.replace(/'/g, '\\\'')}'`).join(',\n')}\n${indentation}  ]`;
  }
  function isPreloadExcluded(preload) {
    return preload.includes('google-analytics') || stripPreloads.includes(preload);
  }
  const indentLines = string => {
    return string.split('\n').join('\n    ');
  };
  const preloads = getPreloads(repo, brand, forSim).filter(preload => {
    return !isPreloadExcluded(preload);
  }).concat(addedPreloads);
  const phetioPreloads = getPreloads(repo, 'phet-io', forSim).filter(preload => {
    return !isPreloadExcluded(preload) && !_.includes(preloads, preload);
  });
  const stringRepos = await getStringRepos(repo);

  // Replace placeholders in the template.
  html = ChipperStringUtils.replaceAll(html, '{{BODYSTYLE}}', bodystyle);
  html = ChipperStringUtils.replaceAll(html, '{{BODYSTART}}', bodystart);
  html = ChipperStringUtils.replaceAll(html, '{{STYLESHEETS}}', stylesheets);
  html = ChipperStringUtils.replaceAll(html, '{{REPOSITORY}}', repo);
  html = ChipperStringUtils.replaceAll(html, '{{BRAND}}', brand);
  html = ChipperStringUtils.replaceAll(html, '{{SPLASH_URL}}', splashURL);
  html = ChipperStringUtils.replaceAll(html, '{{MAIN_FILE}}', mainFile);
  html = ChipperStringUtils.replaceAll(html, '{{PHET_IO_PRELOADS}}', stringifyArray(phetioPreloads, '  '));
  html = ChipperStringUtils.replaceAll(html, '{{PRELOADS}}', stringifyArray(preloads, ''));
  html = ChipperStringUtils.replaceAll(html, '{{PACKAGE_OBJECT}}', indentLines(JSON.stringify(packageObject, null, 2)));
  html = ChipperStringUtils.replaceAll(html, '{{STRING_REPOS}}', indentLines(JSON.stringify(stringRepos, null, 2)));

  // Use the repository name for the browser window title, because getting the sim's title
  // requires running the string plugin in build mode, which is too heavy-weight for this task.
  // See https://github.com/phetsims/chipper/issues/510
  html = ChipperStringUtils.replaceAll(html, '{{BROWSER_WINDOW_TITLE}}', repo);

  // Write to the repository's root directory.
  await writeFileAndGitAdd(repo, outputFile, fixEOL(html));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsIkNoaXBwZXJTdHJpbmdVdGlscyIsImZpeEVPTCIsImdldFByZWxvYWRzIiwiZ2V0U3RyaW5nUmVwb3MiLCJ3cml0ZUZpbGVBbmRHaXRBZGQiLCJncnVudCIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwib3B0aW9ucyIsInN0eWxlc2hlZXRzIiwiYm9keXN0eWxlIiwib3V0cHV0RmlsZSIsImJvZHlzdGFydCIsImFkZGVkUHJlbG9hZHMiLCJzdHJpcFByZWxvYWRzIiwibWFpbkZpbGUiLCJmb3JTaW0iLCJwYWNrYWdlT2JqZWN0IiwiZmlsZSIsInJlYWRKU09OIiwiYnJhbmQiLCJzcGxhc2hVUkwiLCJodG1sIiwicmVhZCIsInN0cmluZ2lmeUFycmF5IiwiYXJyIiwiaW5kZW50YXRpb24iLCJtYXAiLCJzdHJpbmciLCJyZXBsYWNlIiwiam9pbiIsImlzUHJlbG9hZEV4Y2x1ZGVkIiwicHJlbG9hZCIsImluY2x1ZGVzIiwiaW5kZW50TGluZXMiLCJzcGxpdCIsInByZWxvYWRzIiwiZmlsdGVyIiwiY29uY2F0IiwicGhldGlvUHJlbG9hZHMiLCJzdHJpbmdSZXBvcyIsInJlcGxhY2VBbGwiLCJKU09OIiwic3RyaW5naWZ5Il0sInNvdXJjZXMiOlsiZ2VuZXJhdGVEZXZlbG9wbWVudEhUTUwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIHRoZSB0b3AtbGV2ZWwgbWFpbiBIVE1MIGZpbGUgZm9yIHNpbXVsYXRpb25zIChvciBydW5uYWJsZXMpIHVzaW5nIHBoZXQtYnJhbmQgc3BsYXNoIGFuZCBsb2FkaW5nIHBoZXQtaW9cclxuICogcHJlbG9hZHMgd2hlbiBicmFuZD1waGV0LWlvIGlzIHNwZWNpZmllZC5cclxuICpcclxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy82M1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuXHJcbi8vIG1vZHVsZXNcclxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XHJcbmNvbnN0IENoaXBwZXJTdHJpbmdVdGlscyA9IHJlcXVpcmUoICcuLi9jb21tb24vQ2hpcHBlclN0cmluZ1V0aWxzJyApO1xyXG5jb25zdCBmaXhFT0wgPSByZXF1aXJlKCAnLi9maXhFT0wnICk7XHJcbmNvbnN0IGdldFByZWxvYWRzID0gcmVxdWlyZSggJy4vZ2V0UHJlbG9hZHMnICk7XHJcbmNvbnN0IGdldFN0cmluZ1JlcG9zID0gcmVxdWlyZSggJy4vZ2V0U3RyaW5nUmVwb3MnICk7XHJcbmNvbnN0IHdyaXRlRmlsZUFuZEdpdEFkZCA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL3dyaXRlRmlsZUFuZEdpdEFkZCcgKTtcclxuY29uc3QgZ3J1bnQgPSByZXF1aXJlKCAnZ3J1bnQnICk7XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gKlxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8sIG9wdGlvbnMgKSB7XHJcblxyXG4gIGNvbnN0IHtcclxuICAgIHN0eWxlc2hlZXRzID0gJycsXHJcbiAgICBib2R5c3R5bGUgPSAnIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjpibGFjaztcIicsIC8vIG5vdGUgdGhlIHByZWNlZGluZyAnICcgd2hpY2ggaXMgZXNzZW50aWFsXHJcbiAgICBvdXRwdXRGaWxlID0gYCR7cmVwb31fZW4uaHRtbGAsXHJcbiAgICBib2R5c3RhcnQgPSAnJyxcclxuICAgIGFkZGVkUHJlbG9hZHMgPSBbXSwgLy8gbm9uZSB0byBhZGRcclxuICAgIHN0cmlwUHJlbG9hZHMgPSBbXSwgLy8gbm9uZSB0byBhZGRcclxuICAgIG1haW5GaWxlID0gYC4uL2NoaXBwZXIvZGlzdC9qcy8ke3JlcG99L2pzLyR7cmVwb30tbWFpbi5qc2AsXHJcbiAgICBmb3JTaW0gPSB0cnVlIC8vIGlzIHRoaXMgaHRtbCB1c2VkIGZvciBhIHNpbSwgb3Igc29tZXRoaW5nIGVsc2UgbGlrZSB0ZXN0cy5cclxuICB9ID0gb3B0aW9ucyB8fCB7fTtcclxuXHJcbiAgY29uc3QgcGFja2FnZU9iamVjdCA9IGdydW50LmZpbGUucmVhZEpTT04oIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAgKTtcclxuXHJcbiAgY29uc3QgYnJhbmQgPSAncGhldCc7XHJcblxyXG4gIGNvbnN0IHNwbGFzaFVSTCA9IGAuLi9icmFuZC8ke2JyYW5kfS9pbWFnZXMvc3BsYXNoLnN2Z2A7XHJcbiAgbGV0IGh0bWwgPSBncnVudC5maWxlLnJlYWQoICcuLi9jaGlwcGVyL3RlbXBsYXRlcy9zaW0tZGV2ZWxvcG1lbnQuaHRtbCcgKTsgLy8gdGhlIHRlbXBsYXRlIGZpbGVcclxuXHJcbiAgLy8gRm9ybWF0dGluZyBpcyB2ZXJ5IHNwZWNpZmljIHRvIHRoZSB0ZW1wbGF0ZSBmaWxlLiBFYWNoIHByZWxvYWQgaXMgcGxhY2VkIG9uIHNlcGFyYXRlIGxpbmUsXHJcbiAgLy8gd2l0aCBhbiBpbmRlbnRhdGlvbiB0aGF0IGlzIHNwZWNpZmljIGluZGVudGF0aW9uIHRvIHRoZSB0ZW1wbGF0ZS4gU2VlIGNoaXBwZXIjNDYyXHJcbiAgZnVuY3Rpb24gc3RyaW5naWZ5QXJyYXkoIGFyciwgaW5kZW50YXRpb24gKSB7XHJcbiAgICByZXR1cm4gYFtcXG4ke1xyXG4gICAgICBhcnIubWFwKCBzdHJpbmcgPT4gYCR7aW5kZW50YXRpb259ICAgICcke3N0cmluZy5yZXBsYWNlKCAvJy9nLCAnXFxcXFxcJycgKX0nYCApLmpvaW4oICcsXFxuJyApXHJcbiAgICB9XFxuJHtpbmRlbnRhdGlvbn0gIF1gO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaXNQcmVsb2FkRXhjbHVkZWQoIHByZWxvYWQgKSB7XHJcbiAgICByZXR1cm4gcHJlbG9hZC5pbmNsdWRlcyggJ2dvb2dsZS1hbmFseXRpY3MnICkgfHwgc3RyaXBQcmVsb2Fkcy5pbmNsdWRlcyggcHJlbG9hZCApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgaW5kZW50TGluZXMgPSBzdHJpbmcgPT4ge1xyXG4gICAgcmV0dXJuIHN0cmluZy5zcGxpdCggJ1xcbicgKS5qb2luKCAnXFxuICAgICcgKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBwcmVsb2FkcyA9IGdldFByZWxvYWRzKCByZXBvLCBicmFuZCwgZm9yU2ltICkuZmlsdGVyKCBwcmVsb2FkID0+IHtcclxuICAgIHJldHVybiAhaXNQcmVsb2FkRXhjbHVkZWQoIHByZWxvYWQgKTtcclxuICB9ICkuY29uY2F0KCBhZGRlZFByZWxvYWRzICk7XHJcbiAgY29uc3QgcGhldGlvUHJlbG9hZHMgPSBnZXRQcmVsb2FkcyggcmVwbywgJ3BoZXQtaW8nLCBmb3JTaW0gKS5maWx0ZXIoIHByZWxvYWQgPT4ge1xyXG4gICAgcmV0dXJuICFpc1ByZWxvYWRFeGNsdWRlZCggcHJlbG9hZCApICYmICFfLmluY2x1ZGVzKCBwcmVsb2FkcywgcHJlbG9hZCApO1xyXG4gIH0gKTtcclxuXHJcbiAgY29uc3Qgc3RyaW5nUmVwb3MgPSBhd2FpdCBnZXRTdHJpbmdSZXBvcyggcmVwbyApO1xyXG5cclxuICAvLyBSZXBsYWNlIHBsYWNlaG9sZGVycyBpbiB0aGUgdGVtcGxhdGUuXHJcbiAgaHRtbCA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBodG1sLCAne3tCT0RZU1RZTEV9fScsIGJvZHlzdHlsZSApO1xyXG4gIGh0bWwgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggaHRtbCwgJ3t7Qk9EWVNUQVJUfX0nLCBib2R5c3RhcnQgKTtcclxuICBodG1sID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGh0bWwsICd7e1NUWUxFU0hFRVRTfX0nLCBzdHlsZXNoZWV0cyApO1xyXG4gIGh0bWwgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggaHRtbCwgJ3t7UkVQT1NJVE9SWX19JywgcmVwbyApO1xyXG4gIGh0bWwgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggaHRtbCwgJ3t7QlJBTkR9fScsIGJyYW5kICk7XHJcbiAgaHRtbCA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBodG1sLCAne3tTUExBU0hfVVJMfX0nLCBzcGxhc2hVUkwgKTtcclxuICBodG1sID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGh0bWwsICd7e01BSU5fRklMRX19JywgbWFpbkZpbGUgKTtcclxuICBodG1sID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGh0bWwsICd7e1BIRVRfSU9fUFJFTE9BRFN9fScsIHN0cmluZ2lmeUFycmF5KCBwaGV0aW9QcmVsb2FkcywgJyAgJyApICk7XHJcbiAgaHRtbCA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBodG1sLCAne3tQUkVMT0FEU319Jywgc3RyaW5naWZ5QXJyYXkoIHByZWxvYWRzLCAnJyApICk7XHJcbiAgaHRtbCA9IENoaXBwZXJTdHJpbmdVdGlscy5yZXBsYWNlQWxsKCBodG1sLCAne3tQQUNLQUdFX09CSkVDVH19JywgaW5kZW50TGluZXMoIEpTT04uc3RyaW5naWZ5KCBwYWNrYWdlT2JqZWN0LCBudWxsLCAyICkgKSApO1xyXG4gIGh0bWwgPSBDaGlwcGVyU3RyaW5nVXRpbHMucmVwbGFjZUFsbCggaHRtbCwgJ3t7U1RSSU5HX1JFUE9TfX0nLCBpbmRlbnRMaW5lcyggSlNPTi5zdHJpbmdpZnkoIHN0cmluZ1JlcG9zLCBudWxsLCAyICkgKSApO1xyXG5cclxuICAvLyBVc2UgdGhlIHJlcG9zaXRvcnkgbmFtZSBmb3IgdGhlIGJyb3dzZXIgd2luZG93IHRpdGxlLCBiZWNhdXNlIGdldHRpbmcgdGhlIHNpbSdzIHRpdGxlXHJcbiAgLy8gcmVxdWlyZXMgcnVubmluZyB0aGUgc3RyaW5nIHBsdWdpbiBpbiBidWlsZCBtb2RlLCB3aGljaCBpcyB0b28gaGVhdnktd2VpZ2h0IGZvciB0aGlzIHRhc2suXHJcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy81MTBcclxuICBodG1sID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VBbGwoIGh0bWwsICd7e0JST1dTRVJfV0lORE9XX1RJVExFfX0nLCByZXBvICk7XHJcblxyXG4gIC8vIFdyaXRlIHRvIHRoZSByZXBvc2l0b3J5J3Mgcm9vdCBkaXJlY3RvcnkuXHJcbiAgYXdhaXQgd3JpdGVGaWxlQW5kR2l0QWRkKCByZXBvLCBvdXRwdXRGaWxlLCBmaXhFT0woIGh0bWwgKSApO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0E7QUFDQSxNQUFNQSxDQUFDLEdBQUdDLE9BQU8sQ0FBRSxRQUFTLENBQUM7QUFDN0IsTUFBTUMsa0JBQWtCLEdBQUdELE9BQU8sQ0FBRSw4QkFBK0IsQ0FBQztBQUNwRSxNQUFNRSxNQUFNLEdBQUdGLE9BQU8sQ0FBRSxVQUFXLENBQUM7QUFDcEMsTUFBTUcsV0FBVyxHQUFHSCxPQUFPLENBQUUsZUFBZ0IsQ0FBQztBQUM5QyxNQUFNSSxjQUFjLEdBQUdKLE9BQU8sQ0FBRSxrQkFBbUIsQ0FBQztBQUNwRCxNQUFNSyxrQkFBa0IsR0FBR0wsT0FBTyxDQUFFLHVEQUF3RCxDQUFDO0FBQzdGLE1BQU1NLEtBQUssR0FBR04sT0FBTyxDQUFFLE9BQVEsQ0FBQzs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FPLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLGdCQUFnQkMsSUFBSSxFQUFFQyxPQUFPLEVBQUc7RUFFL0MsTUFBTTtJQUNKQyxXQUFXLEdBQUcsRUFBRTtJQUNo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