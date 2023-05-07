// Copyright 2013-2022, University of Colorado Boulder

/**
 * TODO docs
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Drawable, scenery } from '../imports.js';
class InlineCanvasCacheDrawable extends Drawable {
  /**
   * @param {number} renderer
   * @param {Instance} instance
   */
  constructor(renderer, instance) {
    super();
    this.initialize(renderer, instance);
  }

  /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */
  initialize(renderer, instance) {
    super.initialize(renderer);

    // TODO: NOTE: may have to separate into separate drawables for separate group renderers

    // @public {Instance}
    this.instance = instance; // will need this so we can get bounds for layer fitting
  }

  // TODO: support Canvas/SVG/DOM

  /**
   * @public
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   * @param {ChangeInterval} firstChangeInterval
   * @param {ChangeInterval} lastChangeInterval
   */
  stitch(firstDrawable, lastDrawable, firstChangeInterval, lastChangeInterval) {
    //OHTWO TODO: called when we have a change in our drawables
  }
}
scenery.register('InlineCanvasCacheDrawable', InlineCanvasCacheDrawable);
export default InlineCanvasCacheDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEcmF3YWJsZSIsInNjZW5lcnkiLCJJbmxpbmVDYW52YXNDYWNoZURyYXdhYmxlIiwiY29uc3RydWN0b3IiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiaW5pdGlhbGl6ZSIsInN0aXRjaCIsImZpcnN0RHJhd2FibGUiLCJsYXN0RHJhd2FibGUiLCJmaXJzdENoYW5nZUludGVydmFsIiwibGFzdENoYW5nZUludGVydmFsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbmxpbmVDYW52YXNDYWNoZURyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRPRE8gZG9jc1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgRHJhd2FibGUsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbmNsYXNzIElubGluZUNhbnZhc0NhY2hlRHJhd2FibGUgZXh0ZW5kcyBEcmF3YWJsZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXHJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcmVuZGVyZXIsIGluc3RhbmNlICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXHJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcclxuICAgKi9cclxuICBpbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UgKSB7XHJcbiAgICBzdXBlci5pbml0aWFsaXplKCByZW5kZXJlciApO1xyXG5cclxuICAgIC8vIFRPRE86IE5PVEU6IG1heSBoYXZlIHRvIHNlcGFyYXRlIGludG8gc2VwYXJhdGUgZHJhd2FibGVzIGZvciBzZXBhcmF0ZSBncm91cCByZW5kZXJlcnNcclxuXHJcbiAgICAvLyBAcHVibGljIHtJbnN0YW5jZX1cclxuICAgIHRoaXMuaW5zdGFuY2UgPSBpbnN0YW5jZTsgLy8gd2lsbCBuZWVkIHRoaXMgc28gd2UgY2FuIGdldCBib3VuZHMgZm9yIGxheWVyIGZpdHRpbmdcclxuICB9XHJcblxyXG4gIC8vIFRPRE86IHN1cHBvcnQgQ2FudmFzL1NWRy9ET01cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZmlyc3REcmF3YWJsZVxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGxhc3REcmF3YWJsZVxyXG4gICAqIEBwYXJhbSB7Q2hhbmdlSW50ZXJ2YWx9IGZpcnN0Q2hhbmdlSW50ZXJ2YWxcclxuICAgKiBAcGFyYW0ge0NoYW5nZUludGVydmFsfSBsYXN0Q2hhbmdlSW50ZXJ2YWxcclxuICAgKi9cclxuICBzdGl0Y2goIGZpcnN0RHJhd2FibGUsIGxhc3REcmF3YWJsZSwgZmlyc3RDaGFuZ2VJbnRlcnZhbCwgbGFzdENoYW5nZUludGVydmFsICkge1xyXG4gICAgLy9PSFRXTyBUT0RPOiBjYWxsZWQgd2hlbiB3ZSBoYXZlIGEgY2hhbmdlIGluIG91ciBkcmF3YWJsZXNcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdJbmxpbmVDYW52YXNDYWNoZURyYXdhYmxlJywgSW5saW5lQ2FudmFzQ2FjaGVEcmF3YWJsZSApO1xyXG5leHBvcnQgZGVmYXVsdCBJbmxpbmVDYW52YXNDYWNoZURyYXdhYmxlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxRQUFRLEVBQUVDLE9BQU8sUUFBUSxlQUFlO0FBRWpELE1BQU1DLHlCQUF5QixTQUFTRixRQUFRLENBQUM7RUFDL0M7QUFDRjtBQUNBO0FBQ0E7RUFDRUcsV0FBV0EsQ0FBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUc7SUFDaEMsS0FBSyxDQUFDLENBQUM7SUFFUCxJQUFJLENBQUNDLFVBQVUsQ0FBRUYsUUFBUSxFQUFFQyxRQUFTLENBQUM7RUFDdkM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsVUFBVUEsQ0FBRUYsUUFBUSxFQUFFQyxRQUFRLEVBQUc7SUFDL0IsS0FBSyxDQUFDQyxVQUFVLENBQUVGLFFBQVMsQ0FBQzs7SUFFNUI7O0lBRUE7SUFDQSxJQUFJLENBQUNDLFFBQVEsR0FBR0EsUUFBUSxDQUFDLENBQUM7RUFDNUI7O0VBRUE7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxNQUFNQSxDQUFFQyxhQUFhLEVBQUVDLFlBQVksRUFBRUMsbUJBQW1CLEVBQUVDLGtCQUFrQixFQUFHO0lBQzdFO0VBQUE7QUFFSjtBQUVBVixPQUFPLENBQUNXLFFBQVEsQ0FBRSwyQkFBMkIsRUFBRVYseUJBQTBCLENBQUM7QUFDMUUsZUFBZUEseUJBQXlCIn0=