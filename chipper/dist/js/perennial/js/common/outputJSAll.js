// Copyright 2017, University of Colorado Boulder

/**
 * Runs `grunt output-js-all`
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 */

const chipperSupportsOutputJSGruntTasks = require('./chipperSupportsOutputJSGruntTasks');
const execute = require('./execute');
const gruntCommand = require('./gruntCommand');
const winston = require('winston');

/**
 * Outputs JS for a directory
 * @public
 *
 * @returns {Promise}
 */
module.exports = async function () {
  winston.info('running outputJSAll');
  let ranOutputJS = false;

  // Not every version of chipper has the output-js task family.  Only proceed if it exists in this version of chipper.
  if (chipperSupportsOutputJSGruntTasks()) {
    // Not every repo supports the output-js task, only proceed if it is supported
    winston.info('running grunt output-js');
    await execute(gruntCommand, ['output-js-all'], '../chipper');
    ranOutputJS = true;
  }
  if (!ranOutputJS) {
    winston.info('outputJS not detected, skipping...');
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3MiLCJyZXF1aXJlIiwiZXhlY3V0ZSIsImdydW50Q29tbWFuZCIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwiaW5mbyIsInJhbk91dHB1dEpTIl0sInNvdXJjZXMiOlsib3V0cHV0SlNBbGwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJ1bnMgYGdydW50IG91dHB1dC1qcy1hbGxgXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5jb25zdCBjaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3MgPSByZXF1aXJlKCAnLi9jaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3MnICk7XHJcbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi9leGVjdXRlJyApO1xyXG5jb25zdCBncnVudENvbW1hbmQgPSByZXF1aXJlKCAnLi9ncnVudENvbW1hbmQnICk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcclxuXHJcbi8qKlxyXG4gKiBPdXRwdXRzIEpTIGZvciBhIGRpcmVjdG9yeVxyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbigpIHtcclxuXHJcbiAgd2luc3Rvbi5pbmZvKCAncnVubmluZyBvdXRwdXRKU0FsbCcgKTtcclxuXHJcbiAgbGV0IHJhbk91dHB1dEpTID0gZmFsc2U7XHJcblxyXG4gIC8vIE5vdCBldmVyeSB2ZXJzaW9uIG9mIGNoaXBwZXIgaGFzIHRoZSBvdXRwdXQtanMgdGFzayBmYW1pbHkuICBPbmx5IHByb2NlZWQgaWYgaXQgZXhpc3RzIGluIHRoaXMgdmVyc2lvbiBvZiBjaGlwcGVyLlxyXG4gIGlmICggY2hpcHBlclN1cHBvcnRzT3V0cHV0SlNHcnVudFRhc2tzKCkgKSB7XHJcblxyXG4gICAgLy8gTm90IGV2ZXJ5IHJlcG8gc3VwcG9ydHMgdGhlIG91dHB1dC1qcyB0YXNrLCBvbmx5IHByb2NlZWQgaWYgaXQgaXMgc3VwcG9ydGVkXHJcbiAgICB3aW5zdG9uLmluZm8oICdydW5uaW5nIGdydW50IG91dHB1dC1qcycgKTtcclxuICAgIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAnb3V0cHV0LWpzLWFsbCcgXSwgJy4uL2NoaXBwZXInICk7XHJcbiAgICByYW5PdXRwdXRKUyA9IHRydWU7XHJcbiAgfVxyXG4gIGlmICggIXJhbk91dHB1dEpTICkge1xyXG4gICAgd2luc3Rvbi5pbmZvKCAnb3V0cHV0SlMgbm90IGRldGVjdGVkLCBza2lwcGluZy4uLicgKTtcclxuICB9XHJcbn07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTUEsaUNBQWlDLEdBQUdDLE9BQU8sQ0FBRSxxQ0FBc0MsQ0FBQztBQUMxRixNQUFNQyxPQUFPLEdBQUdELE9BQU8sQ0FBRSxXQUFZLENBQUM7QUFDdEMsTUFBTUUsWUFBWSxHQUFHRixPQUFPLENBQUUsZ0JBQWlCLENBQUM7QUFDaEQsTUFBTUcsT0FBTyxHQUFHSCxPQUFPLENBQUUsU0FBVSxDQUFDOztBQUVwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUksTUFBTSxDQUFDQyxPQUFPLEdBQUcsa0JBQWlCO0VBRWhDRixPQUFPLENBQUNHLElBQUksQ0FBRSxxQkFBc0IsQ0FBQztFQUVyQyxJQUFJQyxXQUFXLEdBQUcsS0FBSzs7RUFFdkI7RUFDQSxJQUFLUixpQ0FBaUMsQ0FBQyxDQUFDLEVBQUc7SUFFekM7SUFDQUksT0FBTyxDQUFDRyxJQUFJLENBQUUseUJBQTBCLENBQUM7SUFDekMsTUFBTUwsT0FBTyxDQUFFQyxZQUFZLEVBQUUsQ0FBRSxlQUFlLENBQUUsRUFBRSxZQUFhLENBQUM7SUFDaEVLLFdBQVcsR0FBRyxJQUFJO0VBQ3BCO0VBQ0EsSUFBSyxDQUFDQSxXQUFXLEVBQUc7SUFDbEJKLE9BQU8sQ0FBQ0csSUFBSSxDQUFFLG9DQUFxQyxDQUFDO0VBQ3REO0FBQ0YsQ0FBQyJ9