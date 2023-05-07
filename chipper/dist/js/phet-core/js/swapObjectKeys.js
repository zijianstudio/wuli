// Copyright 2019-2020, University of Colorado Boulder

/**
 * Swap the values of two keys on an object, but only if the value is defined
 *
 * @example
 * swapObjectKeys( { x: 4,y: 3 }, 'x', 'y' ) -> { x: 4, y:3 }
 * swapObjectKeys( { x: 4 }, 'x', 'y' ) -> { y:4 }
 * swapObjectKeys( { x: 4, y: undefined }, 'x', 'y' ) -> { x: undefined, y:4 }
 * swapObjectKeys( { otherStuff: 'hi' }, 'x', 'y' ) -> { otherStuff: 'hi' }
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import phetCore from './phetCore.js';

// Get a unique object reference to compare against. This is preferable to comparing against `undefined` because
// that doesn't differentiate between and object with a key that has a value of undefined, `{x:undefined}` verses
// `{}` in which `x === undefined` also.
const placeholderObject = {};

/**
 * @param {Object} object
 * @param {string} keyName1
 * @param {string} keyName2
 * @returns {Object} the passed in object
 */
const swapObjectKeys = (object, keyName1, keyName2) => {
  // store both values into temp vars before trying to overwrite onto the object
  let value1 = placeholderObject;
  let value2 = placeholderObject;
  if (object.hasOwnProperty(keyName1)) {
    value1 = object[keyName1];
  }
  if (object.hasOwnProperty(keyName2)) {
    value2 = object[keyName2];
  }

  // If the value changed, then swap the keys
  if (value1 !== placeholderObject) {
    object[keyName2] = value1;
  } else {
    // if not defined, then make sure it is removed
    delete object[keyName2];
  }

  // If the value changed, then swap the keys
  if (value2 !== placeholderObject) {
    object[keyName1] = value2;
  } else {
    // if not defined, then make sure it is removed
    delete object[keyName1];
  }
  return object; // for chaining
};

phetCore.register('swapObjectKeys', swapObjectKeys);
export default swapObjectKeys;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsInBsYWNlaG9sZGVyT2JqZWN0Iiwic3dhcE9iamVjdEtleXMiLCJvYmplY3QiLCJrZXlOYW1lMSIsImtleU5hbWUyIiwidmFsdWUxIiwidmFsdWUyIiwiaGFzT3duUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbInN3YXBPYmplY3RLZXlzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFN3YXAgdGhlIHZhbHVlcyBvZiB0d28ga2V5cyBvbiBhbiBvYmplY3QsIGJ1dCBvbmx5IGlmIHRoZSB2YWx1ZSBpcyBkZWZpbmVkXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIHN3YXBPYmplY3RLZXlzKCB7IHg6IDQseTogMyB9LCAneCcsICd5JyApIC0+IHsgeDogNCwgeTozIH1cclxuICogc3dhcE9iamVjdEtleXMoIHsgeDogNCB9LCAneCcsICd5JyApIC0+IHsgeTo0IH1cclxuICogc3dhcE9iamVjdEtleXMoIHsgeDogNCwgeTogdW5kZWZpbmVkIH0sICd4JywgJ3knICkgLT4geyB4OiB1bmRlZmluZWQsIHk6NCB9XHJcbiAqIHN3YXBPYmplY3RLZXlzKCB7IG90aGVyU3R1ZmY6ICdoaScgfSwgJ3gnLCAneScgKSAtPiB7IG90aGVyU3R1ZmY6ICdoaScgfVxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xyXG5cclxuLy8gR2V0IGEgdW5pcXVlIG9iamVjdCByZWZlcmVuY2UgdG8gY29tcGFyZSBhZ2FpbnN0LiBUaGlzIGlzIHByZWZlcmFibGUgdG8gY29tcGFyaW5nIGFnYWluc3QgYHVuZGVmaW5lZGAgYmVjYXVzZVxyXG4vLyB0aGF0IGRvZXNuJ3QgZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGFuZCBvYmplY3Qgd2l0aCBhIGtleSB0aGF0IGhhcyBhIHZhbHVlIG9mIHVuZGVmaW5lZCwgYHt4OnVuZGVmaW5lZH1gIHZlcnNlc1xyXG4vLyBge31gIGluIHdoaWNoIGB4ID09PSB1bmRlZmluZWRgIGFsc28uXHJcbmNvbnN0IHBsYWNlaG9sZGVyT2JqZWN0ID0ge307XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxyXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5TmFtZTFcclxuICogQHBhcmFtIHtzdHJpbmd9IGtleU5hbWUyXHJcbiAqIEByZXR1cm5zIHtPYmplY3R9IHRoZSBwYXNzZWQgaW4gb2JqZWN0XHJcbiAqL1xyXG5jb25zdCBzd2FwT2JqZWN0S2V5cyA9ICggb2JqZWN0LCBrZXlOYW1lMSwga2V5TmFtZTIgKSA9PiB7XHJcblxyXG4gIC8vIHN0b3JlIGJvdGggdmFsdWVzIGludG8gdGVtcCB2YXJzIGJlZm9yZSB0cnlpbmcgdG8gb3ZlcndyaXRlIG9udG8gdGhlIG9iamVjdFxyXG4gIGxldCB2YWx1ZTEgPSBwbGFjZWhvbGRlck9iamVjdDtcclxuICBsZXQgdmFsdWUyID0gcGxhY2Vob2xkZXJPYmplY3Q7XHJcbiAgaWYgKCBvYmplY3QuaGFzT3duUHJvcGVydHkoIGtleU5hbWUxICkgKSB7XHJcbiAgICB2YWx1ZTEgPSBvYmplY3RbIGtleU5hbWUxIF07XHJcbiAgfVxyXG4gIGlmICggb2JqZWN0Lmhhc093blByb3BlcnR5KCBrZXlOYW1lMiApICkge1xyXG4gICAgdmFsdWUyID0gb2JqZWN0WyBrZXlOYW1lMiBdO1xyXG4gIH1cclxuXHJcbiAgLy8gSWYgdGhlIHZhbHVlIGNoYW5nZWQsIHRoZW4gc3dhcCB0aGUga2V5c1xyXG4gIGlmICggdmFsdWUxICE9PSBwbGFjZWhvbGRlck9iamVjdCApIHtcclxuICAgIG9iamVjdFsga2V5TmFtZTIgXSA9IHZhbHVlMTtcclxuICB9XHJcbiAgZWxzZSB7XHJcblxyXG4gICAgLy8gaWYgbm90IGRlZmluZWQsIHRoZW4gbWFrZSBzdXJlIGl0IGlzIHJlbW92ZWRcclxuICAgIGRlbGV0ZSBvYmplY3RbIGtleU5hbWUyIF07XHJcbiAgfVxyXG5cclxuICAvLyBJZiB0aGUgdmFsdWUgY2hhbmdlZCwgdGhlbiBzd2FwIHRoZSBrZXlzXHJcbiAgaWYgKCB2YWx1ZTIgIT09IHBsYWNlaG9sZGVyT2JqZWN0ICkge1xyXG4gICAgb2JqZWN0WyBrZXlOYW1lMSBdID0gdmFsdWUyO1xyXG4gIH1cclxuICBlbHNlIHtcclxuXHJcbiAgICAvLyBpZiBub3QgZGVmaW5lZCwgdGhlbiBtYWtlIHN1cmUgaXQgaXMgcmVtb3ZlZFxyXG4gICAgZGVsZXRlIG9iamVjdFsga2V5TmFtZTEgXTtcclxuICB9XHJcbiAgcmV0dXJuIG9iamVjdDsgLy8gZm9yIGNoYWluaW5nXHJcbn07XHJcblxyXG5waGV0Q29yZS5yZWdpc3RlciggJ3N3YXBPYmplY3RLZXlzJywgc3dhcE9iamVjdEtleXMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHN3YXBPYmplY3RLZXlzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sZUFBZTs7QUFFcEM7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDOztBQUU1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxjQUFjLEdBQUdBLENBQUVDLE1BQU0sRUFBRUMsUUFBUSxFQUFFQyxRQUFRLEtBQU07RUFFdkQ7RUFDQSxJQUFJQyxNQUFNLEdBQUdMLGlCQUFpQjtFQUM5QixJQUFJTSxNQUFNLEdBQUdOLGlCQUFpQjtFQUM5QixJQUFLRSxNQUFNLENBQUNLLGNBQWMsQ0FBRUosUUFBUyxDQUFDLEVBQUc7SUFDdkNFLE1BQU0sR0FBR0gsTUFBTSxDQUFFQyxRQUFRLENBQUU7RUFDN0I7RUFDQSxJQUFLRCxNQUFNLENBQUNLLGNBQWMsQ0FBRUgsUUFBUyxDQUFDLEVBQUc7SUFDdkNFLE1BQU0sR0FBR0osTUFBTSxDQUFFRSxRQUFRLENBQUU7RUFDN0I7O0VBRUE7RUFDQSxJQUFLQyxNQUFNLEtBQUtMLGlCQUFpQixFQUFHO0lBQ2xDRSxNQUFNLENBQUVFLFFBQVEsQ0FBRSxHQUFHQyxNQUFNO0VBQzdCLENBQUMsTUFDSTtJQUVIO0lBQ0EsT0FBT0gsTUFBTSxDQUFFRSxRQUFRLENBQUU7RUFDM0I7O0VBRUE7RUFDQSxJQUFLRSxNQUFNLEtBQUtOLGlCQUFpQixFQUFHO0lBQ2xDRSxNQUFNLENBQUVDLFFBQVEsQ0FBRSxHQUFHRyxNQUFNO0VBQzdCLENBQUMsTUFDSTtJQUVIO0lBQ0EsT0FBT0osTUFBTSxDQUFFQyxRQUFRLENBQUU7RUFDM0I7RUFDQSxPQUFPRCxNQUFNLENBQUMsQ0FBQztBQUNqQixDQUFDOztBQUVESCxRQUFRLENBQUNTLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRVAsY0FBZSxDQUFDO0FBRXJELGVBQWVBLGNBQWMifQ==