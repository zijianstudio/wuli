// Copyright 2018-2020, University of Colorado Boulder

/**
 * Returns a copy of an array, with generated elements interleaved (inserted in-between) every element. For example, if
 * you call `interleave( [ a, b, c ], Math.random )`, it will result in the equivalent:
 * `[ a, Math.random(), b, Math.random(), c ]`.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import phetCore from './phetCore.js';

/*
 * @public
 * @param {Array.<*>} arr - The array in which to interleave elements
 * @param {function} generator - function( index: {number} ):{*} - 0-based index for which "separator" it is for. e.g.
 *                               [ _, f(0), _, f(1), _, f(2), ..., _ ]
 * @returns {Array.<*>}
 */
function interleave(arr, generator) {
  assert && assert(Array.isArray(arr));
  assert && assert(typeof generator === 'function');
  const result = [];
  const finalLength = arr.length * 2 - 1;
  for (let i = 0; i < finalLength; i++) {
    if (i % 2 === 0) {
      result.push(arr[i / 2]);
    } else {
      result.push(generator((i - 1) / 2));
    }
  }
  return result;
}
phetCore.register('interleave', interleave);
export default interleave;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsImludGVybGVhdmUiLCJhcnIiLCJnZW5lcmF0b3IiLCJhc3NlcnQiLCJBcnJheSIsImlzQXJyYXkiLCJyZXN1bHQiLCJmaW5hbExlbmd0aCIsImxlbmd0aCIsImkiLCJwdXNoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJpbnRlcmxlYXZlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBjb3B5IG9mIGFuIGFycmF5LCB3aXRoIGdlbmVyYXRlZCBlbGVtZW50cyBpbnRlcmxlYXZlZCAoaW5zZXJ0ZWQgaW4tYmV0d2VlbikgZXZlcnkgZWxlbWVudC4gRm9yIGV4YW1wbGUsIGlmXHJcbiAqIHlvdSBjYWxsIGBpbnRlcmxlYXZlKCBbIGEsIGIsIGMgXSwgTWF0aC5yYW5kb20gKWAsIGl0IHdpbGwgcmVzdWx0IGluIHRoZSBlcXVpdmFsZW50OlxyXG4gKiBgWyBhLCBNYXRoLnJhbmRvbSgpLCBiLCBNYXRoLnJhbmRvbSgpLCBjIF1gLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xyXG5cclxuLypcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge0FycmF5LjwqPn0gYXJyIC0gVGhlIGFycmF5IGluIHdoaWNoIHRvIGludGVybGVhdmUgZWxlbWVudHNcclxuICogQHBhcmFtIHtmdW5jdGlvbn0gZ2VuZXJhdG9yIC0gZnVuY3Rpb24oIGluZGV4OiB7bnVtYmVyfSApOnsqfSAtIDAtYmFzZWQgaW5kZXggZm9yIHdoaWNoIFwic2VwYXJhdG9yXCIgaXQgaXMgZm9yLiBlLmcuXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsgXywgZigwKSwgXywgZigxKSwgXywgZigyKSwgLi4uLCBfIF1cclxuICogQHJldHVybnMge0FycmF5LjwqPn1cclxuICovXHJcbmZ1bmN0aW9uIGludGVybGVhdmUoIGFyciwgZ2VuZXJhdG9yICkge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGFyciApICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGdlbmVyYXRvciA9PT0gJ2Z1bmN0aW9uJyApO1xyXG5cclxuICBjb25zdCByZXN1bHQgPSBbXTtcclxuICBjb25zdCBmaW5hbExlbmd0aCA9IGFyci5sZW5ndGggKiAyIC0gMTtcclxuXHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgZmluYWxMZW5ndGg7IGkrKyApIHtcclxuICAgIGlmICggaSAlIDIgPT09IDAgKSB7XHJcbiAgICAgIHJlc3VsdC5wdXNoKCBhcnJbIGkgLyAyIF0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXN1bHQucHVzaCggZ2VuZXJhdG9yKCAoIGkgLSAxICkgLyAyICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbnBoZXRDb3JlLnJlZ2lzdGVyKCAnaW50ZXJsZWF2ZScsIGludGVybGVhdmUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGludGVybGVhdmU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sZUFBZTs7QUFFcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTQyxVQUFVQSxDQUFFQyxHQUFHLEVBQUVDLFNBQVMsRUFBRztFQUNwQ0MsTUFBTSxJQUFJQSxNQUFNLENBQUVDLEtBQUssQ0FBQ0MsT0FBTyxDQUFFSixHQUFJLENBQUUsQ0FBQztFQUN4Q0UsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT0QsU0FBUyxLQUFLLFVBQVcsQ0FBQztFQUVuRCxNQUFNSSxNQUFNLEdBQUcsRUFBRTtFQUNqQixNQUFNQyxXQUFXLEdBQUdOLEdBQUcsQ0FBQ08sTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDO0VBRXRDLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRixXQUFXLEVBQUVFLENBQUMsRUFBRSxFQUFHO0lBQ3RDLElBQUtBLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFHO01BQ2pCSCxNQUFNLENBQUNJLElBQUksQ0FBRVQsR0FBRyxDQUFFUSxDQUFDLEdBQUcsQ0FBQyxDQUFHLENBQUM7SUFDN0IsQ0FBQyxNQUNJO01BQ0hILE1BQU0sQ0FBQ0ksSUFBSSxDQUFFUixTQUFTLENBQUUsQ0FBRU8sQ0FBQyxHQUFHLENBQUMsSUFBSyxDQUFFLENBQUUsQ0FBQztJQUMzQztFQUNGO0VBRUEsT0FBT0gsTUFBTTtBQUNmO0FBRUFQLFFBQVEsQ0FBQ1ksUUFBUSxDQUFFLFlBQVksRUFBRVgsVUFBVyxDQUFDO0FBRTdDLGVBQWVBLFVBQVUifQ==