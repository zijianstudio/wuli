// Copyright 2018-2021, University of Colorado Boulder

/**
 * ForEach for multidimensional arrays.
 *
 * e.g. dimensionForEach( 1, array, callback ) is equivalent to array.forEach( callback )
 * e.g. dimensionForEach( 2, [ [ 1, 2 ], [ 3, 4 ] ], f ) will call:
 *      f(1), f(2), f(3), f(4)
 *   OR more accurately (since it includes indices indicating how to reach that element:
 *      f(1,0,0), f(2,0,1), f(3,1,0), f(4,1,1)
 *   Notably, f(2,0,1) is called for the element 3 BECAUSE original[ 0 ][ 1 ] is the element 2
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import phetCore from './phetCore.js';

/**
 * @typedef {Array.<MultidimensionalArray.<*>|*>} MultidimensionalArray.<*>
 */

/**
 * @param {number} dimension - The dimension of the array (how many levels of nested arrays there are). For instance,
 *   [ 'a' ] is a 1-dimensional array, [ [ 'b' ] ] is a 2-dimensional array, etc.
 * @param {MultidimensionalArray.<*>} array - A multidimensional array of the specified dimension
 * @param {function} forEach - function( element: {*}, indices...: {Array.<number>} ). Called for each individual
 *   element. The indices are provided as the 2nd, 3rd, etc. parameters to the function (continues depending on the
 *   dimension). This is a generalization of the normal `forEach` function, which only provides the first index. Thus:
 *   array[ indices[ 0 ] ]...[ indices[ dimension - 1 ] ] === element
 */
function dimensionForEach(dimension, array, forEach) {
  // Will get indices pushed when we go deeper into the multidimensional array, and popped when we go back, so that
  // this essentially represents our "position" in the multidimensional array during iteration.
  const indices = [];

  /**
   * Responsible for iterating through a multidimensional array of the given dimension, while accumulating
   * indices.
   *
   * @param {number} dim
   * @param {MultidimensionalArray.<*>} arr
   */
  function recur(dim, arr) {
    return arr.forEach((element, index) => {
      // To process this element, we need to record our index (in case it is an array that we iterate through).
      indices.push(index);

      // Our base case, where recur was passed a 1-dimensional array
      if (dim === 1) {
        forEach(...[element].concat(indices));
      }
      // We have more dimensions
      else {
        recur(dim - 1, element);
      }

      // We are done with iteration
      indices.pop();
    });
  }
  return recur(dimension, array);
}
phetCore.register('dimensionForEach', dimensionForEach);
export default dimensionForEach;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsImRpbWVuc2lvbkZvckVhY2giLCJkaW1lbnNpb24iLCJhcnJheSIsImZvckVhY2giLCJpbmRpY2VzIiwicmVjdXIiLCJkaW0iLCJhcnIiLCJlbGVtZW50IiwiaW5kZXgiLCJwdXNoIiwiY29uY2F0IiwicG9wIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJkaW1lbnNpb25Gb3JFYWNoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEZvckVhY2ggZm9yIG11bHRpZGltZW5zaW9uYWwgYXJyYXlzLlxyXG4gKlxyXG4gKiBlLmcuIGRpbWVuc2lvbkZvckVhY2goIDEsIGFycmF5LCBjYWxsYmFjayApIGlzIGVxdWl2YWxlbnQgdG8gYXJyYXkuZm9yRWFjaCggY2FsbGJhY2sgKVxyXG4gKiBlLmcuIGRpbWVuc2lvbkZvckVhY2goIDIsIFsgWyAxLCAyIF0sIFsgMywgNCBdIF0sIGYgKSB3aWxsIGNhbGw6XHJcbiAqICAgICAgZigxKSwgZigyKSwgZigzKSwgZig0KVxyXG4gKiAgIE9SIG1vcmUgYWNjdXJhdGVseSAoc2luY2UgaXQgaW5jbHVkZXMgaW5kaWNlcyBpbmRpY2F0aW5nIGhvdyB0byByZWFjaCB0aGF0IGVsZW1lbnQ6XHJcbiAqICAgICAgZigxLDAsMCksIGYoMiwwLDEpLCBmKDMsMSwwKSwgZig0LDEsMSlcclxuICogICBOb3RhYmx5LCBmKDIsMCwxKSBpcyBjYWxsZWQgZm9yIHRoZSBlbGVtZW50IDMgQkVDQVVTRSBvcmlnaW5hbFsgMCBdWyAxIF0gaXMgdGhlIGVsZW1lbnQgMlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xyXG5cclxuLyoqXHJcbiAqIEB0eXBlZGVmIHtBcnJheS48TXVsdGlkaW1lbnNpb25hbEFycmF5LjwqPnwqPn0gTXVsdGlkaW1lbnNpb25hbEFycmF5LjwqPlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gZGltZW5zaW9uIC0gVGhlIGRpbWVuc2lvbiBvZiB0aGUgYXJyYXkgKGhvdyBtYW55IGxldmVscyBvZiBuZXN0ZWQgYXJyYXlzIHRoZXJlIGFyZSkuIEZvciBpbnN0YW5jZSxcclxuICogICBbICdhJyBdIGlzIGEgMS1kaW1lbnNpb25hbCBhcnJheSwgWyBbICdiJyBdIF0gaXMgYSAyLWRpbWVuc2lvbmFsIGFycmF5LCBldGMuXHJcbiAqIEBwYXJhbSB7TXVsdGlkaW1lbnNpb25hbEFycmF5LjwqPn0gYXJyYXkgLSBBIG11bHRpZGltZW5zaW9uYWwgYXJyYXkgb2YgdGhlIHNwZWNpZmllZCBkaW1lbnNpb25cclxuICogQHBhcmFtIHtmdW5jdGlvbn0gZm9yRWFjaCAtIGZ1bmN0aW9uKCBlbGVtZW50OiB7Kn0sIGluZGljZXMuLi46IHtBcnJheS48bnVtYmVyPn0gKS4gQ2FsbGVkIGZvciBlYWNoIGluZGl2aWR1YWxcclxuICogICBlbGVtZW50LiBUaGUgaW5kaWNlcyBhcmUgcHJvdmlkZWQgYXMgdGhlIDJuZCwgM3JkLCBldGMuIHBhcmFtZXRlcnMgdG8gdGhlIGZ1bmN0aW9uIChjb250aW51ZXMgZGVwZW5kaW5nIG9uIHRoZVxyXG4gKiAgIGRpbWVuc2lvbikuIFRoaXMgaXMgYSBnZW5lcmFsaXphdGlvbiBvZiB0aGUgbm9ybWFsIGBmb3JFYWNoYCBmdW5jdGlvbiwgd2hpY2ggb25seSBwcm92aWRlcyB0aGUgZmlyc3QgaW5kZXguIFRodXM6XHJcbiAqICAgYXJyYXlbIGluZGljZXNbIDAgXSBdLi4uWyBpbmRpY2VzWyBkaW1lbnNpb24gLSAxIF0gXSA9PT0gZWxlbWVudFxyXG4gKi9cclxuZnVuY3Rpb24gZGltZW5zaW9uRm9yRWFjaCggZGltZW5zaW9uLCBhcnJheSwgZm9yRWFjaCApIHtcclxuXHJcbiAgLy8gV2lsbCBnZXQgaW5kaWNlcyBwdXNoZWQgd2hlbiB3ZSBnbyBkZWVwZXIgaW50byB0aGUgbXVsdGlkaW1lbnNpb25hbCBhcnJheSwgYW5kIHBvcHBlZCB3aGVuIHdlIGdvIGJhY2ssIHNvIHRoYXRcclxuICAvLyB0aGlzIGVzc2VudGlhbGx5IHJlcHJlc2VudHMgb3VyIFwicG9zaXRpb25cIiBpbiB0aGUgbXVsdGlkaW1lbnNpb25hbCBhcnJheSBkdXJpbmcgaXRlcmF0aW9uLlxyXG4gIGNvbnN0IGluZGljZXMgPSBbXTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmVzcG9uc2libGUgZm9yIGl0ZXJhdGluZyB0aHJvdWdoIGEgbXVsdGlkaW1lbnNpb25hbCBhcnJheSBvZiB0aGUgZ2l2ZW4gZGltZW5zaW9uLCB3aGlsZSBhY2N1bXVsYXRpbmdcclxuICAgKiBpbmRpY2VzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRpbVxyXG4gICAqIEBwYXJhbSB7TXVsdGlkaW1lbnNpb25hbEFycmF5LjwqPn0gYXJyXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gcmVjdXIoIGRpbSwgYXJyICkge1xyXG4gICAgcmV0dXJuIGFyci5mb3JFYWNoKCAoIGVsZW1lbnQsIGluZGV4ICkgPT4ge1xyXG5cclxuICAgICAgLy8gVG8gcHJvY2VzcyB0aGlzIGVsZW1lbnQsIHdlIG5lZWQgdG8gcmVjb3JkIG91ciBpbmRleCAoaW4gY2FzZSBpdCBpcyBhbiBhcnJheSB0aGF0IHdlIGl0ZXJhdGUgdGhyb3VnaCkuXHJcbiAgICAgIGluZGljZXMucHVzaCggaW5kZXggKTtcclxuXHJcbiAgICAgIC8vIE91ciBiYXNlIGNhc2UsIHdoZXJlIHJlY3VyIHdhcyBwYXNzZWQgYSAxLWRpbWVuc2lvbmFsIGFycmF5XHJcbiAgICAgIGlmICggZGltID09PSAxICkge1xyXG4gICAgICAgIGZvckVhY2goIC4uLlsgZWxlbWVudCBdLmNvbmNhdCggaW5kaWNlcyApICk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gV2UgaGF2ZSBtb3JlIGRpbWVuc2lvbnNcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmVjdXIoIGRpbSAtIDEsIGVsZW1lbnQgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gV2UgYXJlIGRvbmUgd2l0aCBpdGVyYXRpb25cclxuICAgICAgaW5kaWNlcy5wb3AoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHJldHVybiByZWN1ciggZGltZW5zaW9uLCBhcnJheSApO1xyXG59XHJcblxyXG5waGV0Q29yZS5yZWdpc3RlciggJ2RpbWVuc2lvbkZvckVhY2gnLCBkaW1lbnNpb25Gb3JFYWNoICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkaW1lbnNpb25Gb3JFYWNoOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxlQUFlOztBQUVwQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0MsZ0JBQWdCQSxDQUFFQyxTQUFTLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxFQUFHO0VBRXJEO0VBQ0E7RUFDQSxNQUFNQyxPQUFPLEdBQUcsRUFBRTs7RUFFbEI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxTQUFTQyxLQUFLQSxDQUFFQyxHQUFHLEVBQUVDLEdBQUcsRUFBRztJQUN6QixPQUFPQSxHQUFHLENBQUNKLE9BQU8sQ0FBRSxDQUFFSyxPQUFPLEVBQUVDLEtBQUssS0FBTTtNQUV4QztNQUNBTCxPQUFPLENBQUNNLElBQUksQ0FBRUQsS0FBTSxDQUFDOztNQUVyQjtNQUNBLElBQUtILEdBQUcsS0FBSyxDQUFDLEVBQUc7UUFDZkgsT0FBTyxDQUFFLEdBQUcsQ0FBRUssT0FBTyxDQUFFLENBQUNHLE1BQU0sQ0FBRVAsT0FBUSxDQUFFLENBQUM7TUFDN0M7TUFDQTtNQUFBLEtBQ0s7UUFDSEMsS0FBSyxDQUFFQyxHQUFHLEdBQUcsQ0FBQyxFQUFFRSxPQUFRLENBQUM7TUFDM0I7O01BRUE7TUFDQUosT0FBTyxDQUFDUSxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUUsQ0FBQztFQUNMO0VBRUEsT0FBT1AsS0FBSyxDQUFFSixTQUFTLEVBQUVDLEtBQU0sQ0FBQztBQUNsQztBQUVBSCxRQUFRLENBQUNjLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRWIsZ0JBQWlCLENBQUM7QUFFekQsZUFBZUEsZ0JBQWdCIn0=