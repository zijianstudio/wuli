// Copyright 2017-2020, University of Colorado Boulder

/**
 * Given inheritance using inherit, this will give the full prototype chain.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import phetCore from './phetCore.js';

/*
 * @param {*} type - Constructor for the type in question.
 * @returns {Array.<*>}
 */
function inheritance(type) {
  const types = [type];
  let proto = type.prototype;
  while (proto && (proto = Object.getPrototypeOf(proto))) {
    if (proto.constructor) {
      types.push(proto.constructor);
    }
  }
  return types;
}
phetCore.register('inheritance', inheritance);
export default inheritance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsImluaGVyaXRhbmNlIiwidHlwZSIsInR5cGVzIiwicHJvdG8iLCJwcm90b3R5cGUiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsImNvbnN0cnVjdG9yIiwicHVzaCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiaW5oZXJpdGFuY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR2l2ZW4gaW5oZXJpdGFuY2UgdXNpbmcgaW5oZXJpdCwgdGhpcyB3aWxsIGdpdmUgdGhlIGZ1bGwgcHJvdG90eXBlIGNoYWluLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xyXG5cclxuLypcclxuICogQHBhcmFtIHsqfSB0eXBlIC0gQ29uc3RydWN0b3IgZm9yIHRoZSB0eXBlIGluIHF1ZXN0aW9uLlxyXG4gKiBAcmV0dXJucyB7QXJyYXkuPCo+fVxyXG4gKi9cclxuZnVuY3Rpb24gaW5oZXJpdGFuY2UoIHR5cGUgKSB7XHJcbiAgY29uc3QgdHlwZXMgPSBbIHR5cGUgXTtcclxuXHJcbiAgbGV0IHByb3RvID0gdHlwZS5wcm90b3R5cGU7XHJcbiAgd2hpbGUgKCBwcm90byAmJiAoIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKCBwcm90byApICkgKSB7XHJcbiAgICBpZiAoIHByb3RvLmNvbnN0cnVjdG9yICkge1xyXG4gICAgICB0eXBlcy5wdXNoKCBwcm90by5jb25zdHJ1Y3RvciApO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdHlwZXM7XHJcbn1cclxuXHJcbnBoZXRDb3JlLnJlZ2lzdGVyKCAnaW5oZXJpdGFuY2UnLCBpbmhlcml0YW5jZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5oZXJpdGFuY2U7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxlQUFlOztBQUVwQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLFdBQVdBLENBQUVDLElBQUksRUFBRztFQUMzQixNQUFNQyxLQUFLLEdBQUcsQ0FBRUQsSUFBSSxDQUFFO0VBRXRCLElBQUlFLEtBQUssR0FBR0YsSUFBSSxDQUFDRyxTQUFTO0VBQzFCLE9BQVFELEtBQUssS0FBTUEsS0FBSyxHQUFHRSxNQUFNLENBQUNDLGNBQWMsQ0FBRUgsS0FBTSxDQUFDLENBQUUsRUFBRztJQUM1RCxJQUFLQSxLQUFLLENBQUNJLFdBQVcsRUFBRztNQUN2QkwsS0FBSyxDQUFDTSxJQUFJLENBQUVMLEtBQUssQ0FBQ0ksV0FBWSxDQUFDO0lBQ2pDO0VBQ0Y7RUFDQSxPQUFPTCxLQUFLO0FBQ2Q7QUFFQUgsUUFBUSxDQUFDVSxRQUFRLENBQUUsYUFBYSxFQUFFVCxXQUFZLENBQUM7QUFFL0MsZUFBZUEsV0FBVyJ9