// Copyright 2020-2023, University of Colorado Boulder

/**
 * Grunt configuration file for unit tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const _ = require('lodash');
const generateDevelopmentHTML = require('./generateDevelopmentHTML');

/**
 * @param {string} repo
 * @param {Object} [options]
 * @returns {Promise.<undefined>}
 */
module.exports = async (repo, options) => {
  await generateDevelopmentHTML(repo, _.merge({
    // Include QUnit CSS
    stylesheets: '  <link rel="stylesheet" href="../sherpa/lib/qunit-2.10.0.css">',
    // Note the preceding whitespace which makes the formatting match IDEA formatting

    // Leave the background the default color white
    bodystyle: '',
    // Output to a test file
    outputFile: `${repo}-tests.html`,
    // Add the QUnit divs (and Scenery display div if relevant)
    bodystart: `<div id="qunit"></div>\n<div id="qunit-fixture"></div>${repo === 'scenery' ? '<div id="display"></div>' : ''}`,
    // Add QUnit JS
    addedPreloads: ['../sherpa/lib/qunit-2.10.0.js', '../chipper/js/sim-tests/qunit-connector.js'],
    // Do not show the splash screen
    stripPreloads: ['../joist/js/splash.js'],
    mainFile: `../chipper/dist/js/${repo}/js/${repo}-tests.js`,
    // Specify to use test config
    qualifier: 'test-',
    // Unit tests do not include the phet-io baseline and overrides files
    forSim: false
  }, options));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsImdlbmVyYXRlRGV2ZWxvcG1lbnRIVE1MIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJvcHRpb25zIiwibWVyZ2UiLCJzdHlsZXNoZWV0cyIsImJvZHlzdHlsZSIsIm91dHB1dEZpbGUiLCJib2R5c3RhcnQiLCJhZGRlZFByZWxvYWRzIiwic3RyaXBQcmVsb2FkcyIsIm1haW5GaWxlIiwicXVhbGlmaWVyIiwiZm9yU2ltIl0sInNvdXJjZXMiOlsiZ2VuZXJhdGVUZXN0SFRNTC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBHcnVudCBjb25maWd1cmF0aW9uIGZpbGUgZm9yIHVuaXQgdGVzdHNcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcblxyXG5jb25zdCBfID0gcmVxdWlyZSggJ2xvZGFzaCcgKTtcclxuY29uc3QgZ2VuZXJhdGVEZXZlbG9wbWVudEhUTUwgPSByZXF1aXJlKCAnLi9nZW5lcmF0ZURldmVsb3BtZW50SFRNTCcgKTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xyXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlLjx1bmRlZmluZWQ+fVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBhc3luYyAoIHJlcG8sIG9wdGlvbnMgKSA9PiB7XHJcbiAgYXdhaXQgZ2VuZXJhdGVEZXZlbG9wbWVudEhUTUwoIHJlcG8sIF8ubWVyZ2UoIHtcclxuXHJcbiAgICAvLyBJbmNsdWRlIFFVbml0IENTU1xyXG4gICAgc3R5bGVzaGVldHM6ICcgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi4vc2hlcnBhL2xpYi9xdW5pdC0yLjEwLjAuY3NzXCI+JywgLy8gTm90ZSB0aGUgcHJlY2VkaW5nIHdoaXRlc3BhY2Ugd2hpY2ggbWFrZXMgdGhlIGZvcm1hdHRpbmcgbWF0Y2ggSURFQSBmb3JtYXR0aW5nXHJcblxyXG4gICAgLy8gTGVhdmUgdGhlIGJhY2tncm91bmQgdGhlIGRlZmF1bHQgY29sb3Igd2hpdGVcclxuICAgIGJvZHlzdHlsZTogJycsXHJcblxyXG4gICAgLy8gT3V0cHV0IHRvIGEgdGVzdCBmaWxlXHJcbiAgICBvdXRwdXRGaWxlOiBgJHtyZXBvfS10ZXN0cy5odG1sYCxcclxuXHJcbiAgICAvLyBBZGQgdGhlIFFVbml0IGRpdnMgKGFuZCBTY2VuZXJ5IGRpc3BsYXkgZGl2IGlmIHJlbGV2YW50KVxyXG4gICAgYm9keXN0YXJ0OiBgPGRpdiBpZD1cInF1bml0XCI+PC9kaXY+XFxuPGRpdiBpZD1cInF1bml0LWZpeHR1cmVcIj48L2Rpdj4ke3JlcG8gPT09ICdzY2VuZXJ5JyA/ICc8ZGl2IGlkPVwiZGlzcGxheVwiPjwvZGl2PicgOiAnJ31gLFxyXG5cclxuICAgIC8vIEFkZCBRVW5pdCBKU1xyXG4gICAgYWRkZWRQcmVsb2FkczogWyAnLi4vc2hlcnBhL2xpYi9xdW5pdC0yLjEwLjAuanMnLCAnLi4vY2hpcHBlci9qcy9zaW0tdGVzdHMvcXVuaXQtY29ubmVjdG9yLmpzJyBdLFxyXG5cclxuICAgIC8vIERvIG5vdCBzaG93IHRoZSBzcGxhc2ggc2NyZWVuXHJcbiAgICBzdHJpcFByZWxvYWRzOiBbICcuLi9qb2lzdC9qcy9zcGxhc2guanMnIF0sXHJcblxyXG4gICAgbWFpbkZpbGU6IGAuLi9jaGlwcGVyL2Rpc3QvanMvJHtyZXBvfS9qcy8ke3JlcG99LXRlc3RzLmpzYCxcclxuXHJcbiAgICAvLyBTcGVjaWZ5IHRvIHVzZSB0ZXN0IGNvbmZpZ1xyXG4gICAgcXVhbGlmaWVyOiAndGVzdC0nLFxyXG5cclxuICAgIC8vIFVuaXQgdGVzdHMgZG8gbm90IGluY2x1ZGUgdGhlIHBoZXQtaW8gYmFzZWxpbmUgYW5kIG92ZXJyaWRlcyBmaWxlc1xyXG4gICAgZm9yU2ltOiBmYWxzZVxyXG4gIH0sIG9wdGlvbnMgKSApO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsTUFBTUEsQ0FBQyxHQUFHQyxPQUFPLENBQUUsUUFBUyxDQUFDO0FBQzdCLE1BQU1DLHVCQUF1QixHQUFHRCxPQUFPLENBQUUsMkJBQTRCLENBQUM7O0FBRXRFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUUsTUFBTSxDQUFDQyxPQUFPLEdBQUcsT0FBUUMsSUFBSSxFQUFFQyxPQUFPLEtBQU07RUFDMUMsTUFBTUosdUJBQXVCLENBQUVHLElBQUksRUFBRUwsQ0FBQyxDQUFDTyxLQUFLLENBQUU7SUFFNUM7SUFDQUMsV0FBVyxFQUFFLGlFQUFpRTtJQUFFOztJQUVoRjtJQUNBQyxTQUFTLEVBQUUsRUFBRTtJQUViO0lBQ0FDLFVBQVUsRUFBRyxHQUFFTCxJQUFLLGFBQVk7SUFFaEM7SUFDQU0sU0FBUyxFQUFHLHlEQUF3RE4sSUFBSSxLQUFLLFNBQVMsR0FBRywwQkFBMEIsR0FBRyxFQUFHLEVBQUM7SUFFMUg7SUFDQU8sYUFBYSxFQUFFLENBQUUsK0JBQStCLEVBQUUsNENBQTRDLENBQUU7SUFFaEc7SUFDQUMsYUFBYSxFQUFFLENBQUUsdUJBQXVCLENBQUU7SUFFMUNDLFFBQVEsRUFBRyxzQkFBcUJULElBQUssT0FBTUEsSUFBSyxXQUFVO0lBRTFEO0lBQ0FVLFNBQVMsRUFBRSxPQUFPO0lBRWxCO0lBQ0FDLE1BQU0sRUFBRTtFQUNWLENBQUMsRUFBRVYsT0FBUSxDQUFFLENBQUM7QUFDaEIsQ0FBQyJ9