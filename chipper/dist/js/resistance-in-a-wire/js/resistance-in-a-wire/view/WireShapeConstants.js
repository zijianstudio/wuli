// Copyright 2018-2020, University of Colorado Boulder

/**
 * Collection of constants and functions that determine the visual shape of the Wire.
 *
 * @author Jesse Greenberg
 */

import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Range from '../../../../dot/js/Range.js';
import resistanceInAWire from '../../resistanceInAWire.js';
import ResistanceInAWireConstants from '../ResistanceInAWireConstants.js';

// constants
const WIRE_VIEW_WIDTH_RANGE = new Range(15, 500); // in screen coordinates
const WIRE_VIEW_HEIGHT_RANGE = new Range(3, 180); // in screen coordinates
const WIRE_DIAMETER_MAX = Math.sqrt(ResistanceInAWireConstants.AREA_RANGE.max / Math.PI) * 2;
const WireShapeConstants = {
  // Multiplier that controls the width of the ellipses on the ends of the wire.
  PERSPECTIVE_FACTOR: 0.4,
  // Used to calculate the size of the wire in screen coordinates from the model values
  WIRE_DIAMETER_MAX: WIRE_DIAMETER_MAX,
  WIRE_VIEW_WIDTH_RANGE: WIRE_VIEW_WIDTH_RANGE,
  WIRE_VIEW_HEIGHT_RANGE: WIRE_VIEW_HEIGHT_RANGE,
  // used when drawing dots in the wire
  DOT_RADIUS: 2,
  // Linear mapping transform
  lengthToWidth: new LinearFunction(ResistanceInAWireConstants.LENGTH_RANGE.min, ResistanceInAWireConstants.LENGTH_RANGE.max, WIRE_VIEW_WIDTH_RANGE.min, WIRE_VIEW_WIDTH_RANGE.max, true),
  /**
   * Transform to map the area to the height of the wire.
   * @param {number} area
   * @returns {number} - the height in screen coordinates
   * @public
   */
  areaToHeight(area) {
    const radius_squared = area / Math.PI;
    const diameter = Math.sqrt(radius_squared) * 2; // radius to diameter
    return WIRE_VIEW_HEIGHT_RANGE.max / WIRE_DIAMETER_MAX * diameter;
  }
};
resistanceInAWire.register('WireShapeConstants', WireShapeConstants);
export default WireShapeConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lYXJGdW5jdGlvbiIsIlJhbmdlIiwicmVzaXN0YW5jZUluQVdpcmUiLCJSZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cyIsIldJUkVfVklFV19XSURUSF9SQU5HRSIsIldJUkVfVklFV19IRUlHSFRfUkFOR0UiLCJXSVJFX0RJQU1FVEVSX01BWCIsIk1hdGgiLCJzcXJ0IiwiQVJFQV9SQU5HRSIsIm1heCIsIlBJIiwiV2lyZVNoYXBlQ29uc3RhbnRzIiwiUEVSU1BFQ1RJVkVfRkFDVE9SIiwiRE9UX1JBRElVUyIsImxlbmd0aFRvV2lkdGgiLCJMRU5HVEhfUkFOR0UiLCJtaW4iLCJhcmVhVG9IZWlnaHQiLCJhcmVhIiwicmFkaXVzX3NxdWFyZWQiLCJkaWFtZXRlciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2lyZVNoYXBlQ29uc3RhbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbGxlY3Rpb24gb2YgY29uc3RhbnRzIGFuZCBmdW5jdGlvbnMgdGhhdCBkZXRlcm1pbmUgdGhlIHZpc3VhbCBzaGFwZSBvZiB0aGUgV2lyZS5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICovXHJcblxyXG5pbXBvcnQgTGluZWFyRnVuY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0xpbmVhckZ1bmN0aW9uLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCByZXNpc3RhbmNlSW5BV2lyZSBmcm9tICcuLi8uLi9yZXNpc3RhbmNlSW5BV2lyZS5qcyc7XHJcbmltcG9ydCBSZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cyBmcm9tICcuLi9SZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgV0lSRV9WSUVXX1dJRFRIX1JBTkdFID0gbmV3IFJhbmdlKCAxNSwgNTAwICk7IC8vIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG5jb25zdCBXSVJFX1ZJRVdfSEVJR0hUX1JBTkdFID0gbmV3IFJhbmdlKCAzLCAxODAgKTsgLy8gaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcbmNvbnN0IFdJUkVfRElBTUVURVJfTUFYID0gTWF0aC5zcXJ0KCBSZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cy5BUkVBX1JBTkdFLm1heCAvIE1hdGguUEkgKSAqIDI7XHJcblxyXG5jb25zdCBXaXJlU2hhcGVDb25zdGFudHMgPSB7XHJcblxyXG4gIC8vIE11bHRpcGxpZXIgdGhhdCBjb250cm9scyB0aGUgd2lkdGggb2YgdGhlIGVsbGlwc2VzIG9uIHRoZSBlbmRzIG9mIHRoZSB3aXJlLlxyXG4gIFBFUlNQRUNUSVZFX0ZBQ1RPUjogMC40LFxyXG5cclxuICAvLyBVc2VkIHRvIGNhbGN1bGF0ZSB0aGUgc2l6ZSBvZiB0aGUgd2lyZSBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgZnJvbSB0aGUgbW9kZWwgdmFsdWVzXHJcbiAgV0lSRV9ESUFNRVRFUl9NQVg6IFdJUkVfRElBTUVURVJfTUFYLFxyXG4gIFdJUkVfVklFV19XSURUSF9SQU5HRTogV0lSRV9WSUVXX1dJRFRIX1JBTkdFLFxyXG4gIFdJUkVfVklFV19IRUlHSFRfUkFOR0U6IFdJUkVfVklFV19IRUlHSFRfUkFOR0UsXHJcblxyXG4gIC8vIHVzZWQgd2hlbiBkcmF3aW5nIGRvdHMgaW4gdGhlIHdpcmVcclxuICBET1RfUkFESVVTOiAyLFxyXG5cclxuICAvLyBMaW5lYXIgbWFwcGluZyB0cmFuc2Zvcm1cclxuICBsZW5ndGhUb1dpZHRoOiBuZXcgTGluZWFyRnVuY3Rpb24oXHJcbiAgICBSZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cy5MRU5HVEhfUkFOR0UubWluLFxyXG4gICAgUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuTEVOR1RIX1JBTkdFLm1heCxcclxuICAgIFdJUkVfVklFV19XSURUSF9SQU5HRS5taW4sXHJcbiAgICBXSVJFX1ZJRVdfV0lEVEhfUkFOR0UubWF4LFxyXG4gICAgdHJ1ZVxyXG4gICksXHJcblxyXG4gIC8qKlxyXG4gICAqIFRyYW5zZm9ybSB0byBtYXAgdGhlIGFyZWEgdG8gdGhlIGhlaWdodCBvZiB0aGUgd2lyZS5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gYXJlYVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gdGhlIGhlaWdodCBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYXJlYVRvSGVpZ2h0KCBhcmVhICkge1xyXG4gICAgY29uc3QgcmFkaXVzX3NxdWFyZWQgPSBhcmVhIC8gTWF0aC5QSTtcclxuICAgIGNvbnN0IGRpYW1ldGVyID0gTWF0aC5zcXJ0KCByYWRpdXNfc3F1YXJlZCApICogMjsgLy8gcmFkaXVzIHRvIGRpYW1ldGVyXHJcbiAgICByZXR1cm4gV0lSRV9WSUVXX0hFSUdIVF9SQU5HRS5tYXggLyBXSVJFX0RJQU1FVEVSX01BWCAqIGRpYW1ldGVyO1xyXG4gIH1cclxufTtcclxuXHJcbnJlc2lzdGFuY2VJbkFXaXJlLnJlZ2lzdGVyKCAnV2lyZVNoYXBlQ29uc3RhbnRzJywgV2lyZVNoYXBlQ29uc3RhbnRzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBXaXJlU2hhcGVDb25zdGFudHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSxzQ0FBc0M7QUFDakUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7QUFDMUQsT0FBT0MsMEJBQTBCLE1BQU0sa0NBQWtDOztBQUV6RTtBQUNBLE1BQU1DLHFCQUFxQixHQUFHLElBQUlILEtBQUssQ0FBRSxFQUFFLEVBQUUsR0FBSSxDQUFDLENBQUMsQ0FBQztBQUNwRCxNQUFNSSxzQkFBc0IsR0FBRyxJQUFJSixLQUFLLENBQUUsQ0FBQyxFQUFFLEdBQUksQ0FBQyxDQUFDLENBQUM7QUFDcEQsTUFBTUssaUJBQWlCLEdBQUdDLElBQUksQ0FBQ0MsSUFBSSxDQUFFTCwwQkFBMEIsQ0FBQ00sVUFBVSxDQUFDQyxHQUFHLEdBQUdILElBQUksQ0FBQ0ksRUFBRyxDQUFDLEdBQUcsQ0FBQztBQUU5RixNQUFNQyxrQkFBa0IsR0FBRztFQUV6QjtFQUNBQyxrQkFBa0IsRUFBRSxHQUFHO0VBRXZCO0VBQ0FQLGlCQUFpQixFQUFFQSxpQkFBaUI7RUFDcENGLHFCQUFxQixFQUFFQSxxQkFBcUI7RUFDNUNDLHNCQUFzQixFQUFFQSxzQkFBc0I7RUFFOUM7RUFDQVMsVUFBVSxFQUFFLENBQUM7RUFFYjtFQUNBQyxhQUFhLEVBQUUsSUFBSWYsY0FBYyxDQUMvQkcsMEJBQTBCLENBQUNhLFlBQVksQ0FBQ0MsR0FBRyxFQUMzQ2QsMEJBQTBCLENBQUNhLFlBQVksQ0FBQ04sR0FBRyxFQUMzQ04scUJBQXFCLENBQUNhLEdBQUcsRUFDekJiLHFCQUFxQixDQUFDTSxHQUFHLEVBQ3pCLElBQ0YsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFUSxZQUFZQSxDQUFFQyxJQUFJLEVBQUc7SUFDbkIsTUFBTUMsY0FBYyxHQUFHRCxJQUFJLEdBQUdaLElBQUksQ0FBQ0ksRUFBRTtJQUNyQyxNQUFNVSxRQUFRLEdBQUdkLElBQUksQ0FBQ0MsSUFBSSxDQUFFWSxjQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNsRCxPQUFPZixzQkFBc0IsQ0FBQ0ssR0FBRyxHQUFHSixpQkFBaUIsR0FBR2UsUUFBUTtFQUNsRTtBQUNGLENBQUM7QUFFRG5CLGlCQUFpQixDQUFDb0IsUUFBUSxDQUFFLG9CQUFvQixFQUFFVixrQkFBbUIsQ0FBQztBQUV0RSxlQUFlQSxrQkFBa0IifQ==