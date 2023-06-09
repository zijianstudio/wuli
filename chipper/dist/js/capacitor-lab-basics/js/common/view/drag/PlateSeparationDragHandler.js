// Copyright 2015-2021, University of Colorado Boulder

/**
 * Drag handle for changing the plate separation.
 * Origin is at the end of the dashed line that is farthest from the arrow.
 * Attached to the top capacitor plate, in the center of the plate's top face.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Utils from '../../../../../dot/js/Utils.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import { DragListener } from '../../../../../scenery/js/imports.js';
import capacitorLabBasics from '../../../capacitorLabBasics.js';
class PlateSeparationDragHandler extends DragListener {
  /**
   * This is the drag handler for the capacitor plate separation
   * property. Plate separation is a vertical quantity, so we're dragging along the y axis. Other axes are ignored.
   *
   * @param {Capacitor} capacitor
   * @param {YawPitchModelViewTransform3} modelViewTransform
   * @param {Range} valueRange
   * @param {Tandem} tandem
   */
  constructor(capacitor, modelViewTransform, valueRange, tandem) {
    // @private {Vector2}
    let clickYOffset = new Vector2(0, 0);
    super({
      allowTouchSnag: false,
      tandem: tandem,
      start: event => {
        const pMouse = event.pointer.point;
        const pOrigin = modelViewTransform.modelToViewXYZ(0, -(capacitor.plateSeparationProperty.value / 2), 0);
        clickYOffset = pMouse.y - pOrigin.y;
      },
      drag: event => {
        const pMouse = event.pointer.point;
        const yView = pMouse.y - clickYOffset;
        const separation = Utils.clamp(2 * modelViewTransform.viewToModelDeltaXY(0, -yView).y, valueRange.min, valueRange.max);

        // Discretize the plate separation to integral values by scaling m -> mm, rounding, and un-scaling.
        capacitor.plateSeparationProperty.value = Utils.roundSymmetric(5e3 * separation) / 5e3;
      }
    });
  }
}
capacitorLabBasics.register('PlateSeparationDragHandler', PlateSeparationDragHandler);
export default PlateSeparationDragHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJEcmFnTGlzdGVuZXIiLCJjYXBhY2l0b3JMYWJCYXNpY3MiLCJQbGF0ZVNlcGFyYXRpb25EcmFnSGFuZGxlciIsImNvbnN0cnVjdG9yIiwiY2FwYWNpdG9yIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwidmFsdWVSYW5nZSIsInRhbmRlbSIsImNsaWNrWU9mZnNldCIsImFsbG93VG91Y2hTbmFnIiwic3RhcnQiLCJldmVudCIsInBNb3VzZSIsInBvaW50ZXIiLCJwb2ludCIsInBPcmlnaW4iLCJtb2RlbFRvVmlld1hZWiIsInBsYXRlU2VwYXJhdGlvblByb3BlcnR5IiwidmFsdWUiLCJ5IiwiZHJhZyIsInlWaWV3Iiwic2VwYXJhdGlvbiIsImNsYW1wIiwidmlld1RvTW9kZWxEZWx0YVhZIiwibWluIiwibWF4Iiwicm91bmRTeW1tZXRyaWMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBsYXRlU2VwYXJhdGlvbkRyYWdIYW5kbGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERyYWcgaGFuZGxlIGZvciBjaGFuZ2luZyB0aGUgcGxhdGUgc2VwYXJhdGlvbi5cclxuICogT3JpZ2luIGlzIGF0IHRoZSBlbmQgb2YgdGhlIGRhc2hlZCBsaW5lIHRoYXQgaXMgZmFydGhlc3QgZnJvbSB0aGUgYXJyb3cuXHJcbiAqIEF0dGFjaGVkIHRvIHRoZSB0b3AgY2FwYWNpdG9yIHBsYXRlLCBpbiB0aGUgY2VudGVyIG9mIHRoZSBwbGF0ZSdzIHRvcCBmYWNlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBEcmFnTGlzdGVuZXIgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2FwYWNpdG9yTGFiQmFzaWNzIGZyb20gJy4uLy4uLy4uL2NhcGFjaXRvckxhYkJhc2ljcy5qcyc7XHJcblxyXG5jbGFzcyBQbGF0ZVNlcGFyYXRpb25EcmFnSGFuZGxlciBleHRlbmRzIERyYWdMaXN0ZW5lciB7XHJcbiAgLyoqXHJcbiAgICogVGhpcyBpcyB0aGUgZHJhZyBoYW5kbGVyIGZvciB0aGUgY2FwYWNpdG9yIHBsYXRlIHNlcGFyYXRpb25cclxuICAgKiBwcm9wZXJ0eS4gUGxhdGUgc2VwYXJhdGlvbiBpcyBhIHZlcnRpY2FsIHF1YW50aXR5LCBzbyB3ZSdyZSBkcmFnZ2luZyBhbG9uZyB0aGUgeSBheGlzLiBPdGhlciBheGVzIGFyZSBpZ25vcmVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDYXBhY2l0b3J9IGNhcGFjaXRvclxyXG4gICAqIEBwYXJhbSB7WWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge1JhbmdlfSB2YWx1ZVJhbmdlXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjYXBhY2l0b3IsIG1vZGVsVmlld1RyYW5zZm9ybSwgdmFsdWVSYW5nZSwgdGFuZGVtICkge1xyXG4gICAgLy8gQHByaXZhdGUge1ZlY3RvcjJ9XHJcbiAgICBsZXQgY2xpY2tZT2Zmc2V0ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBhbGxvd1RvdWNoU25hZzogZmFsc2UsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLFxyXG4gICAgICBzdGFydDogZXZlbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBNb3VzZSA9IGV2ZW50LnBvaW50ZXIucG9pbnQ7XHJcbiAgICAgICAgY29uc3QgcE9yaWdpbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1hZWiggMCwgLSggY2FwYWNpdG9yLnBsYXRlU2VwYXJhdGlvblByb3BlcnR5LnZhbHVlIC8gMiApLCAwICk7XHJcbiAgICAgICAgY2xpY2tZT2Zmc2V0ID0gcE1vdXNlLnkgLSBwT3JpZ2luLnk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGRyYWc6IGV2ZW50ID0+IHtcclxuICAgICAgICBjb25zdCBwTW91c2UgPSBldmVudC5wb2ludGVyLnBvaW50O1xyXG4gICAgICAgIGNvbnN0IHlWaWV3ID0gcE1vdXNlLnkgLSBjbGlja1lPZmZzZXQ7XHJcblxyXG4gICAgICAgIGNvbnN0IHNlcGFyYXRpb24gPSBVdGlscy5jbGFtcCggMiAqIG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbERlbHRhWFkoIDAsIC15VmlldyApLnksXHJcbiAgICAgICAgICB2YWx1ZVJhbmdlLm1pbiwgdmFsdWVSYW5nZS5tYXggKTtcclxuXHJcbiAgICAgICAgLy8gRGlzY3JldGl6ZSB0aGUgcGxhdGUgc2VwYXJhdGlvbiB0byBpbnRlZ3JhbCB2YWx1ZXMgYnkgc2NhbGluZyBtIC0+IG1tLCByb3VuZGluZywgYW5kIHVuLXNjYWxpbmcuXHJcbiAgICAgICAgY2FwYWNpdG9yLnBsYXRlU2VwYXJhdGlvblByb3BlcnR5LnZhbHVlID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIDVlMyAqIHNlcGFyYXRpb24gKSAvIDVlMztcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuY2FwYWNpdG9yTGFiQmFzaWNzLnJlZ2lzdGVyKCAnUGxhdGVTZXBhcmF0aW9uRHJhZ0hhbmRsZXInLCBQbGF0ZVNlcGFyYXRpb25EcmFnSGFuZGxlciApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGxhdGVTZXBhcmF0aW9uRHJhZ0hhbmRsZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsT0FBTyxNQUFNLGtDQUFrQztBQUN0RCxTQUFTQyxZQUFZLFFBQVEsc0NBQXNDO0FBQ25FLE9BQU9DLGtCQUFrQixNQUFNLGdDQUFnQztBQUUvRCxNQUFNQywwQkFBMEIsU0FBU0YsWUFBWSxDQUFDO0VBQ3BEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxTQUFTLEVBQUVDLGtCQUFrQixFQUFFQyxVQUFVLEVBQUVDLE1BQU0sRUFBRztJQUMvRDtJQUNBLElBQUlDLFlBQVksR0FBRyxJQUFJVCxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztJQUV0QyxLQUFLLENBQUU7TUFDTFUsY0FBYyxFQUFFLEtBQUs7TUFDckJGLE1BQU0sRUFBRUEsTUFBTTtNQUNkRyxLQUFLLEVBQUVDLEtBQUssSUFBSTtRQUNkLE1BQU1DLE1BQU0sR0FBR0QsS0FBSyxDQUFDRSxPQUFPLENBQUNDLEtBQUs7UUFDbEMsTUFBTUMsT0FBTyxHQUFHVixrQkFBa0IsQ0FBQ1csY0FBYyxDQUFFLENBQUMsRUFBRSxFQUFHWixTQUFTLENBQUNhLHVCQUF1QixDQUFDQyxLQUFLLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxDQUFDO1FBQzNHVixZQUFZLEdBQUdJLE1BQU0sQ0FBQ08sQ0FBQyxHQUFHSixPQUFPLENBQUNJLENBQUM7TUFDckMsQ0FBQztNQUNEQyxJQUFJLEVBQUVULEtBQUssSUFBSTtRQUNiLE1BQU1DLE1BQU0sR0FBR0QsS0FBSyxDQUFDRSxPQUFPLENBQUNDLEtBQUs7UUFDbEMsTUFBTU8sS0FBSyxHQUFHVCxNQUFNLENBQUNPLENBQUMsR0FBR1gsWUFBWTtRQUVyQyxNQUFNYyxVQUFVLEdBQUd4QixLQUFLLENBQUN5QixLQUFLLENBQUUsQ0FBQyxHQUFHbEIsa0JBQWtCLENBQUNtQixrQkFBa0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQ0gsS0FBTSxDQUFDLENBQUNGLENBQUMsRUFDdEZiLFVBQVUsQ0FBQ21CLEdBQUcsRUFBRW5CLFVBQVUsQ0FBQ29CLEdBQUksQ0FBQzs7UUFFbEM7UUFDQXRCLFNBQVMsQ0FBQ2EsdUJBQXVCLENBQUNDLEtBQUssR0FBR3BCLEtBQUssQ0FBQzZCLGNBQWMsQ0FBRSxHQUFHLEdBQUdMLFVBQVcsQ0FBQyxHQUFHLEdBQUc7TUFDMUY7SUFDRixDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFyQixrQkFBa0IsQ0FBQzJCLFFBQVEsQ0FBRSw0QkFBNEIsRUFBRTFCLDBCQUEyQixDQUFDO0FBRXZGLGVBQWVBLDBCQUEwQiJ9