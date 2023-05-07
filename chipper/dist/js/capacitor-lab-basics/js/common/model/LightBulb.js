// Copyright 2015-2021, University of Colorado Boulder

/**
 * Model of a lightBulb, used in the Capacitor Lab: Basics sim. In order for the current to decay at a rate slow
 * enough for visibility, the internal resistance of the light bulb must be extremely large.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import capacitorLabBasics from '../../capacitorLabBasics.js';
import CLBConstants from '../CLBConstants.js';
import LightBulbShapeCreator from './shapes/LightBulbShapeCreator.js';

// constants
const BULB_BASE_SIZE = new Dimension2(0.0050, 0.0035);
class LightBulb {
  /**
   * @param {Vector3} position
   * @param {CLModelViewTransform3D} modelViewTransform
   */
  constructor(position, modelViewTransform) {
    // @public {Vector3} (read-only)
    this.position = position;

    // @public {number} (read-only)
    this.resistance = CLBConstants.LIGHT_BULB_RESISTANCE;

    // @public {LightBulbShapeCreator}
    this.shapeCreator = new LightBulbShapeCreator(this, modelViewTransform);
  }

  /**
   * Does the base shape intersect the top shape of the bulb base?
   * @public
   *
   * @param {Shape} shape
   * @returns {boolean}
   */
  intersectsBulbTopBase(shape) {
    const bulbBaseShape = this.shapeCreator.createTopBaseShape();
    return shape.bounds.intersectsBounds(bulbBaseShape.bounds) && shape.shapeIntersection(bulbBaseShape).getNonoverlappingArea() > 0;
  }

  /**
   * Does the base shape intersect the bottom shape of the bulb base?
   * @public
   *
   * @param {Shape} shape
   * @returns {boolean}
   */
  intersectsBulbBottomBase(shape) {
    const bulbBaseShape = this.shapeCreator.createBottomBaseShape();
    return shape.bounds.intersectsBounds(bulbBaseShape.bounds) && shape.shapeIntersection(bulbBaseShape).getNonoverlappingArea() > 0;
  }

  /**
   * The top connection point is the top center of light bulb
   * @public
   *
   * @returns {Vector3}
   */
  getTopConnectionPoint() {
    return this.position.copy();
  }

  /**
   * The bottom tip of the light bulb base is its leftmost point, since the bulb
   * is rotated 90 degrees clockwise from vertical.
   * @public
   *
   * @returns {Vector3}
   */
  getBottomConnectionPoint() {
    return new Vector3(this.position.x - BULB_BASE_SIZE.width * 3 / 5, this.position.y, this.position.z);
  }

  /**
   * Calculate the current flowing through this lightbulb using Ohm's Law, V = I R
   * @public
   *
   * @param {number} voltage - voltage across the resistor
   * @returns {number}
   */
  getCurrent(voltage) {
    return voltage / this.resistance;
  }
}
capacitorLabBasics.register('LightBulb', LightBulb);
export default LightBulb;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVmVjdG9yMyIsImNhcGFjaXRvckxhYkJhc2ljcyIsIkNMQkNvbnN0YW50cyIsIkxpZ2h0QnVsYlNoYXBlQ3JlYXRvciIsIkJVTEJfQkFTRV9TSVpFIiwiTGlnaHRCdWxiIiwiY29uc3RydWN0b3IiLCJwb3NpdGlvbiIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInJlc2lzdGFuY2UiLCJMSUdIVF9CVUxCX1JFU0lTVEFOQ0UiLCJzaGFwZUNyZWF0b3IiLCJpbnRlcnNlY3RzQnVsYlRvcEJhc2UiLCJzaGFwZSIsImJ1bGJCYXNlU2hhcGUiLCJjcmVhdGVUb3BCYXNlU2hhcGUiLCJib3VuZHMiLCJpbnRlcnNlY3RzQm91bmRzIiwic2hhcGVJbnRlcnNlY3Rpb24iLCJnZXROb25vdmVybGFwcGluZ0FyZWEiLCJpbnRlcnNlY3RzQnVsYkJvdHRvbUJhc2UiLCJjcmVhdGVCb3R0b21CYXNlU2hhcGUiLCJnZXRUb3BDb25uZWN0aW9uUG9pbnQiLCJjb3B5IiwiZ2V0Qm90dG9tQ29ubmVjdGlvblBvaW50IiwieCIsIndpZHRoIiwieSIsInoiLCJnZXRDdXJyZW50Iiwidm9sdGFnZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGlnaHRCdWxiLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIG9mIGEgbGlnaHRCdWxiLCB1c2VkIGluIHRoZSBDYXBhY2l0b3IgTGFiOiBCYXNpY3Mgc2ltLiBJbiBvcmRlciBmb3IgdGhlIGN1cnJlbnQgdG8gZGVjYXkgYXQgYSByYXRlIHNsb3dcclxuICogZW5vdWdoIGZvciB2aXNpYmlsaXR5LCB0aGUgaW50ZXJuYWwgcmVzaXN0YW5jZSBvZiB0aGUgbGlnaHQgYnVsYiBtdXN0IGJlIGV4dHJlbWVseSBsYXJnZS5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQW5kcmV3IEFkYXJlIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjMuanMnO1xyXG5pbXBvcnQgY2FwYWNpdG9yTGFiQmFzaWNzIGZyb20gJy4uLy4uL2NhcGFjaXRvckxhYkJhc2ljcy5qcyc7XHJcbmltcG9ydCBDTEJDb25zdGFudHMgZnJvbSAnLi4vQ0xCQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IExpZ2h0QnVsYlNoYXBlQ3JlYXRvciBmcm9tICcuL3NoYXBlcy9MaWdodEJ1bGJTaGFwZUNyZWF0b3IuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEJVTEJfQkFTRV9TSVpFID0gbmV3IERpbWVuc2lvbjIoIDAuMDA1MCwgMC4wMDM1ICk7XHJcblxyXG5jbGFzcyBMaWdodEJ1bGIge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge0NMTW9kZWxWaWV3VHJhbnNmb3JtM0R9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwb3NpdGlvbiwgbW9kZWxWaWV3VHJhbnNmb3JtICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1ZlY3RvcjN9IChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy5yZXNpc3RhbmNlID0gQ0xCQ29uc3RhbnRzLkxJR0hUX0JVTEJfUkVTSVNUQU5DRTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtMaWdodEJ1bGJTaGFwZUNyZWF0b3J9XHJcbiAgICB0aGlzLnNoYXBlQ3JlYXRvciA9IG5ldyBMaWdodEJ1bGJTaGFwZUNyZWF0b3IoIHRoaXMsIG1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIERvZXMgdGhlIGJhc2Ugc2hhcGUgaW50ZXJzZWN0IHRoZSB0b3Agc2hhcGUgb2YgdGhlIGJ1bGIgYmFzZT9cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGludGVyc2VjdHNCdWxiVG9wQmFzZSggc2hhcGUgKSB7XHJcbiAgICBjb25zdCBidWxiQmFzZVNoYXBlID0gdGhpcy5zaGFwZUNyZWF0b3IuY3JlYXRlVG9wQmFzZVNoYXBlKCk7XHJcbiAgICByZXR1cm4gc2hhcGUuYm91bmRzLmludGVyc2VjdHNCb3VuZHMoIGJ1bGJCYXNlU2hhcGUuYm91bmRzICkgJiZcclxuICAgICAgICAgICBzaGFwZS5zaGFwZUludGVyc2VjdGlvbiggYnVsYkJhc2VTaGFwZSApLmdldE5vbm92ZXJsYXBwaW5nQXJlYSgpID4gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERvZXMgdGhlIGJhc2Ugc2hhcGUgaW50ZXJzZWN0IHRoZSBib3R0b20gc2hhcGUgb2YgdGhlIGJ1bGIgYmFzZT9cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGludGVyc2VjdHNCdWxiQm90dG9tQmFzZSggc2hhcGUgKSB7XHJcbiAgICBjb25zdCBidWxiQmFzZVNoYXBlID0gdGhpcy5zaGFwZUNyZWF0b3IuY3JlYXRlQm90dG9tQmFzZVNoYXBlKCk7XHJcbiAgICByZXR1cm4gc2hhcGUuYm91bmRzLmludGVyc2VjdHNCb3VuZHMoIGJ1bGJCYXNlU2hhcGUuYm91bmRzICkgJiZcclxuICAgICAgICAgICBzaGFwZS5zaGFwZUludGVyc2VjdGlvbiggYnVsYkJhc2VTaGFwZSApLmdldE5vbm92ZXJsYXBwaW5nQXJlYSgpID4gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSB0b3AgY29ubmVjdGlvbiBwb2ludCBpcyB0aGUgdG9wIGNlbnRlciBvZiBsaWdodCBidWxiXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XHJcbiAgICovXHJcbiAgZ2V0VG9wQ29ubmVjdGlvblBvaW50KCkge1xyXG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24uY29weSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGJvdHRvbSB0aXAgb2YgdGhlIGxpZ2h0IGJ1bGIgYmFzZSBpcyBpdHMgbGVmdG1vc3QgcG9pbnQsIHNpbmNlIHRoZSBidWxiXHJcbiAgICogaXMgcm90YXRlZCA5MCBkZWdyZWVzIGNsb2Nrd2lzZSBmcm9tIHZlcnRpY2FsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxyXG4gICAqL1xyXG4gIGdldEJvdHRvbUNvbm5lY3Rpb25Qb2ludCgpIHtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMyggdGhpcy5wb3NpdGlvbi54IC0gQlVMQl9CQVNFX1NJWkUud2lkdGggKiAzIC8gNSwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLnBvc2l0aW9uLnogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGN1bGF0ZSB0aGUgY3VycmVudCBmbG93aW5nIHRocm91Z2ggdGhpcyBsaWdodGJ1bGIgdXNpbmcgT2htJ3MgTGF3LCBWID0gSSBSXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZvbHRhZ2UgLSB2b2x0YWdlIGFjcm9zcyB0aGUgcmVzaXN0b3JcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEN1cnJlbnQoIHZvbHRhZ2UgKSB7XHJcbiAgICByZXR1cm4gdm9sdGFnZSAvIHRoaXMucmVzaXN0YW5jZTtcclxuICB9XHJcbn1cclxuXHJcbmNhcGFjaXRvckxhYkJhc2ljcy5yZWdpc3RlciggJ0xpZ2h0QnVsYicsIExpZ2h0QnVsYiApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTGlnaHRCdWxiO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsWUFBWSxNQUFNLG9CQUFvQjtBQUM3QyxPQUFPQyxxQkFBcUIsTUFBTSxtQ0FBbUM7O0FBRXJFO0FBQ0EsTUFBTUMsY0FBYyxHQUFHLElBQUlMLFVBQVUsQ0FBRSxNQUFNLEVBQUUsTUFBTyxDQUFDO0FBRXZELE1BQU1NLFNBQVMsQ0FBQztFQUNkO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLFFBQVEsRUFBRUMsa0JBQWtCLEVBQUc7SUFFMUM7SUFDQSxJQUFJLENBQUNELFFBQVEsR0FBR0EsUUFBUTs7SUFFeEI7SUFDQSxJQUFJLENBQUNFLFVBQVUsR0FBR1AsWUFBWSxDQUFDUSxxQkFBcUI7O0lBRXBEO0lBQ0EsSUFBSSxDQUFDQyxZQUFZLEdBQUcsSUFBSVIscUJBQXFCLENBQUUsSUFBSSxFQUFFSyxrQkFBbUIsQ0FBQztFQUMzRTs7RUFHQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxxQkFBcUJBLENBQUVDLEtBQUssRUFBRztJQUM3QixNQUFNQyxhQUFhLEdBQUcsSUFBSSxDQUFDSCxZQUFZLENBQUNJLGtCQUFrQixDQUFDLENBQUM7SUFDNUQsT0FBT0YsS0FBSyxDQUFDRyxNQUFNLENBQUNDLGdCQUFnQixDQUFFSCxhQUFhLENBQUNFLE1BQU8sQ0FBQyxJQUNyREgsS0FBSyxDQUFDSyxpQkFBaUIsQ0FBRUosYUFBYyxDQUFDLENBQUNLLHFCQUFxQixDQUFDLENBQUMsR0FBRyxDQUFDO0VBQzdFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLHdCQUF3QkEsQ0FBRVAsS0FBSyxFQUFHO0lBQ2hDLE1BQU1DLGFBQWEsR0FBRyxJQUFJLENBQUNILFlBQVksQ0FBQ1UscUJBQXFCLENBQUMsQ0FBQztJQUMvRCxPQUFPUixLQUFLLENBQUNHLE1BQU0sQ0FBQ0MsZ0JBQWdCLENBQUVILGFBQWEsQ0FBQ0UsTUFBTyxDQUFDLElBQ3JESCxLQUFLLENBQUNLLGlCQUFpQixDQUFFSixhQUFjLENBQUMsQ0FBQ0sscUJBQXFCLENBQUMsQ0FBQyxHQUFHLENBQUM7RUFDN0U7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLHFCQUFxQkEsQ0FBQSxFQUFHO0lBQ3RCLE9BQU8sSUFBSSxDQUFDZixRQUFRLENBQUNnQixJQUFJLENBQUMsQ0FBQztFQUM3Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyx3QkFBd0JBLENBQUEsRUFBRztJQUN6QixPQUFPLElBQUl4QixPQUFPLENBQUUsSUFBSSxDQUFDTyxRQUFRLENBQUNrQixDQUFDLEdBQUdyQixjQUFjLENBQUNzQixLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUNuQixRQUFRLENBQUNvQixDQUFDLEVBQUUsSUFBSSxDQUFDcEIsUUFBUSxDQUFDcUIsQ0FBRSxDQUFDO0VBQ3hHOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFVBQVVBLENBQUVDLE9BQU8sRUFBRztJQUNwQixPQUFPQSxPQUFPLEdBQUcsSUFBSSxDQUFDckIsVUFBVTtFQUNsQztBQUNGO0FBRUFSLGtCQUFrQixDQUFDOEIsUUFBUSxDQUFFLFdBQVcsRUFBRTFCLFNBQVUsQ0FBQztBQUVyRCxlQUFlQSxTQUFTIn0=