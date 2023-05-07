// Copyright 2018-2021, University of Colorado Boulder

/**
 * Map for multidimensional arrays.
 *
 * e.g. dimensionMap( 1, array, callback ) is equivalent to array.map( callback )
 * e.g. dimensionMap( 2, [ [ 1, 2 ], [ 3, 4 ] ], f ) will return
 *      [ [ f(1), f(2) ], [ f(3), f(4) ] ]
 *   OR more accurately (since it includes indices indicating how to reach that element:
 *      [ [ f(1,0,0), f(2,0,1) ], [ f(3,1,0), f(3,1,1) ] ]
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
 * @param {function} map - function( element: {*}, indices...: {Array.<number>} ): {*}. Called for each individual
 *   element. The indices are provided as the 2nd, 3rd, etc. parameters to the function (continues depending on the
 *   dimension). This is a generalization of the normal `map` function, which only provides the first index. Thus:
 *   array[ indices[ 0 ] ]...[ indices[ dimension - 1 ] ] === element
 * @returns {MultidimensionalArray.<*>} - A multidimensional array of the same dimension as our input, but with the
 *   values replaced with the return value of the map() calls for each element.
 */
function dimensionMap(dimension, array, map) {
  // Will get indices pushed when we go deeper into the multidimensional array, and popped when we go back, so that
  // this essentially represents our "position" in the multidimensional array during iteration.
  const indices = [];

  /**
   * Responsible for mapping a multidimensional array of the given dimension, while accumulating
   * indices.
   *
   * @param {number} dim
   * @param {MultidimensionalArray.<*>} arr
   * @returns {MultidimensionalArray.<*>}
   */
  function recur(dim, arr) {
    return arr.map((element, index) => {
      // To process this element, we need to record our index (in case it is an array that we iterate through).
      indices.push(index);

      // If our dimension is 1, it's our base case (apply the normal map function), otherwise continue recursively.
      const result = dim === 1 ? map(...[element].concat(indices)) : recur(dim - 1, element);

      // We are done with iteration
      indices.pop();
      return result;
    });
  }
  return recur(dimension, array);
}
phetCore.register('dimensionMap', dimensionMap);
export default dimensionMap;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsImRpbWVuc2lvbk1hcCIsImRpbWVuc2lvbiIsImFycmF5IiwibWFwIiwiaW5kaWNlcyIsInJlY3VyIiwiZGltIiwiYXJyIiwiZWxlbWVudCIsImluZGV4IiwicHVzaCIsInJlc3VsdCIsImNvbmNhdCIsInBvcCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiZGltZW5zaW9uTWFwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1hcCBmb3IgbXVsdGlkaW1lbnNpb25hbCBhcnJheXMuXHJcbiAqXHJcbiAqIGUuZy4gZGltZW5zaW9uTWFwKCAxLCBhcnJheSwgY2FsbGJhY2sgKSBpcyBlcXVpdmFsZW50IHRvIGFycmF5Lm1hcCggY2FsbGJhY2sgKVxyXG4gKiBlLmcuIGRpbWVuc2lvbk1hcCggMiwgWyBbIDEsIDIgXSwgWyAzLCA0IF0gXSwgZiApIHdpbGwgcmV0dXJuXHJcbiAqICAgICAgWyBbIGYoMSksIGYoMikgXSwgWyBmKDMpLCBmKDQpIF0gXVxyXG4gKiAgIE9SIG1vcmUgYWNjdXJhdGVseSAoc2luY2UgaXQgaW5jbHVkZXMgaW5kaWNlcyBpbmRpY2F0aW5nIGhvdyB0byByZWFjaCB0aGF0IGVsZW1lbnQ6XHJcbiAqICAgICAgWyBbIGYoMSwwLDApLCBmKDIsMCwxKSBdLCBbIGYoMywxLDApLCBmKDMsMSwxKSBdIF1cclxuICogICBOb3RhYmx5LCBmKDIsMCwxKSBpcyBjYWxsZWQgZm9yIHRoZSBlbGVtZW50IDMgQkVDQVVTRSBvcmlnaW5hbFsgMCBdWyAxIF0gaXMgdGhlIGVsZW1lbnQgMlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xyXG5cclxuLyoqXHJcbiAqIEB0eXBlZGVmIHtBcnJheS48TXVsdGlkaW1lbnNpb25hbEFycmF5LjwqPnwqPn0gTXVsdGlkaW1lbnNpb25hbEFycmF5LjwqPlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gZGltZW5zaW9uIC0gVGhlIGRpbWVuc2lvbiBvZiB0aGUgYXJyYXkgKGhvdyBtYW55IGxldmVscyBvZiBuZXN0ZWQgYXJyYXlzIHRoZXJlIGFyZSkuIEZvciBpbnN0YW5jZSxcclxuICogICBbICdhJyBdIGlzIGEgMS1kaW1lbnNpb25hbCBhcnJheSwgWyBbICdiJyBdIF0gaXMgYSAyLWRpbWVuc2lvbmFsIGFycmF5LCBldGMuXHJcbiAqIEBwYXJhbSB7TXVsdGlkaW1lbnNpb25hbEFycmF5LjwqPn0gYXJyYXkgLSBBIG11bHRpZGltZW5zaW9uYWwgYXJyYXkgb2YgdGhlIHNwZWNpZmllZCBkaW1lbnNpb25cclxuICogQHBhcmFtIHtmdW5jdGlvbn0gbWFwIC0gZnVuY3Rpb24oIGVsZW1lbnQ6IHsqfSwgaW5kaWNlcy4uLjoge0FycmF5LjxudW1iZXI+fSApOiB7Kn0uIENhbGxlZCBmb3IgZWFjaCBpbmRpdmlkdWFsXHJcbiAqICAgZWxlbWVudC4gVGhlIGluZGljZXMgYXJlIHByb3ZpZGVkIGFzIHRoZSAybmQsIDNyZCwgZXRjLiBwYXJhbWV0ZXJzIHRvIHRoZSBmdW5jdGlvbiAoY29udGludWVzIGRlcGVuZGluZyBvbiB0aGVcclxuICogICBkaW1lbnNpb24pLiBUaGlzIGlzIGEgZ2VuZXJhbGl6YXRpb24gb2YgdGhlIG5vcm1hbCBgbWFwYCBmdW5jdGlvbiwgd2hpY2ggb25seSBwcm92aWRlcyB0aGUgZmlyc3QgaW5kZXguIFRodXM6XHJcbiAqICAgYXJyYXlbIGluZGljZXNbIDAgXSBdLi4uWyBpbmRpY2VzWyBkaW1lbnNpb24gLSAxIF0gXSA9PT0gZWxlbWVudFxyXG4gKiBAcmV0dXJucyB7TXVsdGlkaW1lbnNpb25hbEFycmF5LjwqPn0gLSBBIG11bHRpZGltZW5zaW9uYWwgYXJyYXkgb2YgdGhlIHNhbWUgZGltZW5zaW9uIGFzIG91ciBpbnB1dCwgYnV0IHdpdGggdGhlXHJcbiAqICAgdmFsdWVzIHJlcGxhY2VkIHdpdGggdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgbWFwKCkgY2FsbHMgZm9yIGVhY2ggZWxlbWVudC5cclxuICovXHJcbmZ1bmN0aW9uIGRpbWVuc2lvbk1hcCggZGltZW5zaW9uLCBhcnJheSwgbWFwICkge1xyXG5cclxuICAvLyBXaWxsIGdldCBpbmRpY2VzIHB1c2hlZCB3aGVuIHdlIGdvIGRlZXBlciBpbnRvIHRoZSBtdWx0aWRpbWVuc2lvbmFsIGFycmF5LCBhbmQgcG9wcGVkIHdoZW4gd2UgZ28gYmFjaywgc28gdGhhdFxyXG4gIC8vIHRoaXMgZXNzZW50aWFsbHkgcmVwcmVzZW50cyBvdXIgXCJwb3NpdGlvblwiIGluIHRoZSBtdWx0aWRpbWVuc2lvbmFsIGFycmF5IGR1cmluZyBpdGVyYXRpb24uXHJcbiAgY29uc3QgaW5kaWNlcyA9IFtdO1xyXG5cclxuICAvKipcclxuICAgKiBSZXNwb25zaWJsZSBmb3IgbWFwcGluZyBhIG11bHRpZGltZW5zaW9uYWwgYXJyYXkgb2YgdGhlIGdpdmVuIGRpbWVuc2lvbiwgd2hpbGUgYWNjdW11bGF0aW5nXHJcbiAgICogaW5kaWNlcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkaW1cclxuICAgKiBAcGFyYW0ge011bHRpZGltZW5zaW9uYWxBcnJheS48Kj59IGFyclxyXG4gICAqIEByZXR1cm5zIHtNdWx0aWRpbWVuc2lvbmFsQXJyYXkuPCo+fVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHJlY3VyKCBkaW0sIGFyciApIHtcclxuICAgIHJldHVybiBhcnIubWFwKCAoIGVsZW1lbnQsIGluZGV4ICkgPT4ge1xyXG5cclxuICAgICAgLy8gVG8gcHJvY2VzcyB0aGlzIGVsZW1lbnQsIHdlIG5lZWQgdG8gcmVjb3JkIG91ciBpbmRleCAoaW4gY2FzZSBpdCBpcyBhbiBhcnJheSB0aGF0IHdlIGl0ZXJhdGUgdGhyb3VnaCkuXHJcbiAgICAgIGluZGljZXMucHVzaCggaW5kZXggKTtcclxuXHJcbiAgICAgIC8vIElmIG91ciBkaW1lbnNpb24gaXMgMSwgaXQncyBvdXIgYmFzZSBjYXNlIChhcHBseSB0aGUgbm9ybWFsIG1hcCBmdW5jdGlvbiksIG90aGVyd2lzZSBjb250aW51ZSByZWN1cnNpdmVseS5cclxuICAgICAgY29uc3QgcmVzdWx0ID0gZGltID09PSAxID8gbWFwKCAuLi5bIGVsZW1lbnQgXS5jb25jYXQoIGluZGljZXMgKSApIDogcmVjdXIoIGRpbSAtIDEsIGVsZW1lbnQgKTtcclxuXHJcbiAgICAgIC8vIFdlIGFyZSBkb25lIHdpdGggaXRlcmF0aW9uXHJcbiAgICAgIGluZGljZXMucG9wKCk7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVjdXIoIGRpbWVuc2lvbiwgYXJyYXkgKTtcclxufVxyXG5cclxucGhldENvcmUucmVnaXN0ZXIoICdkaW1lbnNpb25NYXAnLCBkaW1lbnNpb25NYXAgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRpbWVuc2lvbk1hcDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sZUFBZTs7QUFFcEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTQyxZQUFZQSxDQUFFQyxTQUFTLEVBQUVDLEtBQUssRUFBRUMsR0FBRyxFQUFHO0VBRTdDO0VBQ0E7RUFDQSxNQUFNQyxPQUFPLEdBQUcsRUFBRTs7RUFFbEI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLFNBQVNDLEtBQUtBLENBQUVDLEdBQUcsRUFBRUMsR0FBRyxFQUFHO0lBQ3pCLE9BQU9BLEdBQUcsQ0FBQ0osR0FBRyxDQUFFLENBQUVLLE9BQU8sRUFBRUMsS0FBSyxLQUFNO01BRXBDO01BQ0FMLE9BQU8sQ0FBQ00sSUFBSSxDQUFFRCxLQUFNLENBQUM7O01BRXJCO01BQ0EsTUFBTUUsTUFBTSxHQUFHTCxHQUFHLEtBQUssQ0FBQyxHQUFHSCxHQUFHLENBQUUsR0FBRyxDQUFFSyxPQUFPLENBQUUsQ0FBQ0ksTUFBTSxDQUFFUixPQUFRLENBQUUsQ0FBQyxHQUFHQyxLQUFLLENBQUVDLEdBQUcsR0FBRyxDQUFDLEVBQUVFLE9BQVEsQ0FBQzs7TUFFOUY7TUFDQUosT0FBTyxDQUFDUyxHQUFHLENBQUMsQ0FBQztNQUNiLE9BQU9GLE1BQU07SUFDZixDQUFFLENBQUM7RUFDTDtFQUVBLE9BQU9OLEtBQUssQ0FBRUosU0FBUyxFQUFFQyxLQUFNLENBQUM7QUFDbEM7QUFFQUgsUUFBUSxDQUFDZSxRQUFRLENBQUUsY0FBYyxFQUFFZCxZQUFhLENBQUM7QUFFakQsZUFBZUEsWUFBWSJ9