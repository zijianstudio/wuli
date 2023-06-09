// Copyright 2017, University of Colorado Boulder

/**
 * Returns a list of simulation repositories actively handled by tooling for PhET
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const getRepoList = require('./getRepoList');

/**
 * Returns a list of simulation repositories actively handled by tooling for PhET
 * @public
 *
 * @returns {Array.<string>}
 */
module.exports = function () {
  return getRepoList('active-sims');
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRSZXBvTGlzdCIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIl0sInNvdXJjZXMiOlsiZ2V0QWN0aXZlU2ltcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmV0dXJucyBhIGxpc3Qgb2Ygc2ltdWxhdGlvbiByZXBvc2l0b3JpZXMgYWN0aXZlbHkgaGFuZGxlZCBieSB0b29saW5nIGZvciBQaEVUXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5jb25zdCBnZXRSZXBvTGlzdCA9IHJlcXVpcmUoICcuL2dldFJlcG9MaXN0JyApO1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBsaXN0IG9mIHNpbXVsYXRpb24gcmVwb3NpdG9yaWVzIGFjdGl2ZWx5IGhhbmRsZWQgYnkgdG9vbGluZyBmb3IgUGhFVFxyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtBcnJheS48c3RyaW5nPn1cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIGdldFJlcG9MaXN0KCAnYWN0aXZlLXNpbXMnICk7XHJcbn07XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQSxXQUFXLEdBQUdDLE9BQU8sQ0FBRSxlQUFnQixDQUFDOztBQUU5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUMsTUFBTSxDQUFDQyxPQUFPLEdBQUcsWUFBVztFQUMxQixPQUFPSCxXQUFXLENBQUUsYUFBYyxDQUFDO0FBQ3JDLENBQUMifQ==