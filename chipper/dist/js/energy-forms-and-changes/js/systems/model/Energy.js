// Copyright 2016-2021, University of Colorado Boulder

/**
 * a convenience type that collects together several things often needed about a unit of energy that is being produced
 * or consumed by one of the elements in an energy system
 *
 * @author  John Blanco
 * @author  Andrew Adare
 */

import merge from '../../../../phet-core/js/merge.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
class Energy {
  /**
   * @param {EnergyType} type - energy type
   * @param {number} amount - amount of energy, in joules
   * @param {number} direction - direction of energy, in radians.  Not meaningful for all energy types.  Zero indicates
   * to the right, PI/2 is up, and so forth.
   * @param {Object} [options]
   */
  constructor(type, amount, direction, options) {
    options = merge({
      creationTime: null
    }, options);

    // @public (read-only) {EnergyType}
    this.type = type;

    // @public (read-only) {number}
    this.amount = amount;

    // @public (read-only) {number}
    this.direction = direction;

    // @public (read-only) {number}
    this.creationTime = options.creationTime;
  }
}
energyFormsAndChanges.register('Energy', Energy);
export default Energy;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsImVuZXJneUZvcm1zQW5kQ2hhbmdlcyIsIkVuZXJneSIsImNvbnN0cnVjdG9yIiwidHlwZSIsImFtb3VudCIsImRpcmVjdGlvbiIsIm9wdGlvbnMiLCJjcmVhdGlvblRpbWUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVuZXJneS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBhIGNvbnZlbmllbmNlIHR5cGUgdGhhdCBjb2xsZWN0cyB0b2dldGhlciBzZXZlcmFsIHRoaW5ncyBvZnRlbiBuZWVkZWQgYWJvdXQgYSB1bml0IG9mIGVuZXJneSB0aGF0IGlzIGJlaW5nIHByb2R1Y2VkXHJcbiAqIG9yIGNvbnN1bWVkIGJ5IG9uZSBvZiB0aGUgZWxlbWVudHMgaW4gYW4gZW5lcmd5IHN5c3RlbVxyXG4gKlxyXG4gKiBAYXV0aG9yICBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yICBBbmRyZXcgQWRhcmVcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IGVuZXJneUZvcm1zQW5kQ2hhbmdlcyBmcm9tICcuLi8uLi9lbmVyZ3lGb3Jtc0FuZENoYW5nZXMuanMnO1xyXG5cclxuY2xhc3MgRW5lcmd5IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtFbmVyZ3lUeXBlfSB0eXBlIC0gZW5lcmd5IHR5cGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYW1vdW50IC0gYW1vdW50IG9mIGVuZXJneSwgaW4gam91bGVzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRpcmVjdGlvbiAtIGRpcmVjdGlvbiBvZiBlbmVyZ3ksIGluIHJhZGlhbnMuICBOb3QgbWVhbmluZ2Z1bCBmb3IgYWxsIGVuZXJneSB0eXBlcy4gIFplcm8gaW5kaWNhdGVzXHJcbiAgICogdG8gdGhlIHJpZ2h0LCBQSS8yIGlzIHVwLCBhbmQgc28gZm9ydGguXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0eXBlLCBhbW91bnQsIGRpcmVjdGlvbiwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgY3JlYXRpb25UaW1lOiBudWxsXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7RW5lcmd5VHlwZX1cclxuICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7bnVtYmVyfVxyXG4gICAgdGhpcy5hbW91bnQgPSBhbW91bnQ7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7bnVtYmVyfVxyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7bnVtYmVyfVxyXG4gICAgdGhpcy5jcmVhdGlvblRpbWUgPSBvcHRpb25zLmNyZWF0aW9uVGltZTtcclxuICB9XHJcbn1cclxuXHJcbmVuZXJneUZvcm1zQW5kQ2hhbmdlcy5yZWdpc3RlciggJ0VuZXJneScsIEVuZXJneSApO1xyXG5leHBvcnQgZGVmYXVsdCBFbmVyZ3k7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUVsRSxNQUFNQyxNQUFNLENBQUM7RUFFWDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxJQUFJLEVBQUVDLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxPQUFPLEVBQUc7SUFFOUNBLE9BQU8sR0FBR1AsS0FBSyxDQUFFO01BQ2ZRLFlBQVksRUFBRTtJQUNoQixDQUFDLEVBQUVELE9BQVEsQ0FBQzs7SUFFWjtJQUNBLElBQUksQ0FBQ0gsSUFBSSxHQUFHQSxJQUFJOztJQUVoQjtJQUNBLElBQUksQ0FBQ0MsTUFBTSxHQUFHQSxNQUFNOztJQUVwQjtJQUNBLElBQUksQ0FBQ0MsU0FBUyxHQUFHQSxTQUFTOztJQUUxQjtJQUNBLElBQUksQ0FBQ0UsWUFBWSxHQUFHRCxPQUFPLENBQUNDLFlBQVk7RUFDMUM7QUFDRjtBQUVBUCxxQkFBcUIsQ0FBQ1EsUUFBUSxDQUFFLFFBQVEsRUFBRVAsTUFBTyxDQUFDO0FBQ2xELGVBQWVBLE1BQU0ifQ==