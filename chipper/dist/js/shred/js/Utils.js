// Copyright 2014-2020, University of Colorado Boulder

/**
 * Collection of utility functions used in multiple places within the sim.
 *
 * @author John Blanco
 */

import shred from './shred.js';
const Utils = {
  /**
   * Determine if two values are equal within a tolerance.
   *
   * @param {number} value1
   * @param {number} value2
   * @param {number} tolerance
   * @public
   */
  roughlyEqual: function (value1, value2, tolerance) {
    return Math.abs(value1 - value2) < tolerance;
  }
};
shred.register('Utils', Utils);
export default Utils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzaHJlZCIsIlV0aWxzIiwicm91Z2hseUVxdWFsIiwidmFsdWUxIiwidmFsdWUyIiwidG9sZXJhbmNlIiwiTWF0aCIsImFicyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVXRpbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29sbGVjdGlvbiBvZiB1dGlsaXR5IGZ1bmN0aW9ucyB1c2VkIGluIG11bHRpcGxlIHBsYWNlcyB3aXRoaW4gdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBzaHJlZCBmcm9tICcuL3NocmVkLmpzJztcclxuXHJcbmNvbnN0IFV0aWxzID0ge1xyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSBpZiB0d28gdmFsdWVzIGFyZSBlcXVhbCB3aXRoaW4gYSB0b2xlcmFuY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUxXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlMlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0b2xlcmFuY2VcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcm91Z2hseUVxdWFsOiBmdW5jdGlvbiggdmFsdWUxLCB2YWx1ZTIsIHRvbGVyYW5jZSApIHtcclxuICAgIHJldHVybiBNYXRoLmFicyggdmFsdWUxIC0gdmFsdWUyICkgPCB0b2xlcmFuY2U7XHJcbiAgfVxyXG59O1xyXG5zaHJlZC5yZWdpc3RlciggJ1V0aWxzJywgVXRpbHMgKTtcclxuZXhwb3J0IGRlZmF1bHQgVXRpbHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxZQUFZO0FBRTlCLE1BQU1DLEtBQUssR0FBRztFQUNaO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsWUFBWSxFQUFFLFNBQUFBLENBQVVDLE1BQU0sRUFBRUMsTUFBTSxFQUFFQyxTQUFTLEVBQUc7SUFDbEQsT0FBT0MsSUFBSSxDQUFDQyxHQUFHLENBQUVKLE1BQU0sR0FBR0MsTUFBTyxDQUFDLEdBQUdDLFNBQVM7RUFDaEQ7QUFDRixDQUFDO0FBQ0RMLEtBQUssQ0FBQ1EsUUFBUSxDQUFFLE9BQU8sRUFBRVAsS0FBTSxDQUFDO0FBQ2hDLGVBQWVBLEtBQUsifQ==