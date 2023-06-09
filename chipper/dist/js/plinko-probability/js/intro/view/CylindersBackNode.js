// Copyright 2015-2022, University of Colorado Boulder

/**
 * View representation of the top portion of the row of cylinders
 * it is the back portion of the cylinder from the viewpoint of the z-layer
 * used within the Plinko Probability Simulation
 *
 * @author Martin Veillette (Berea College)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import PlinkoProbabilityConstants from '../../common/PlinkoProbabilityConstants.js';
import plinkoProbability from '../../plinkoProbability.js';

// constants
const BOUNDS = PlinkoProbabilityConstants.HISTOGRAM_BOUNDS;
class CylindersBackNode extends Node {
  /**
   * @param {Property.<number>} numberOfRowsProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} cylinderInfo - Contains cylinder info: height, width, offset, ellipseHeight
   */
  constructor(numberOfRowsProperty, modelViewTransform, cylinderInfo) {
    super();

    // convenience variables
    const ellipseWidth = modelViewTransform.modelToViewDeltaX(cylinderInfo.cylinderWidth);
    const ellipseHeight = Math.abs(modelViewTransform.modelToViewDeltaY(cylinderInfo.ellipseHeight));
    const verticalOffset = -modelViewTransform.modelToViewDeltaY(cylinderInfo.verticalOffset);

    // create the shape for the top of the cylinder
    const topShape = Shape.ellipse(0, 0, ellipseWidth / 2, ellipseHeight / 2);

    // link present for the lifetime of the sim, no need to dispose
    numberOfRowsProperty.link(numberOfRows => {
      assert && assert(Number.isInteger(numberOfRows), 'numberOfRows must be an integer');
      const numberOfCylinders = numberOfRows + 1;
      for (let i = 0; i < numberOfCylinders; i++) {
        // create and add the top of the cylinders containers
        const binCenterX = this.getBinCenterX(i, numberOfCylinders);
        const x = modelViewTransform.modelToViewX(binCenterX); // x-coordinate of bin in model units
        const y = modelViewTransform.modelToViewY(cylinderInfo.top); // y-coordinate of bin in model units
        const top = new Path(topShape, {
          fill: PlinkoProbabilityConstants.TOP_CYLINDER_FILL_COLOR,
          stroke: PlinkoProbabilityConstants.TOP_CYLINDER_STROKE_COLOR,
          centerX: x,
          top: y + verticalOffset
        });
        this.addChild(top);
      }
    });
  }

  /**
   * Function that returns the center x coordinate of a bin with index binIndex
   *
   * @param {number} binIndex - index associated with the bin, the index may range from 0 to numberOfBins-1
   * @param {number} numberOfBins - the number of bins on the screen
   * @returns {number}
   * @public (read-only)
   */
  getBinCenterX(binIndex, numberOfBins) {
    // We consider numberOfBins-1 because we consider the most left bin the first bin out of the total number of bins
    assert && assert(binIndex <= numberOfBins - 1);
    return (binIndex + 1 / 2) / numberOfBins * BOUNDS.width + BOUNDS.minX;
  }
}
plinkoProbability.register('CylindersBackNode', CylindersBackNode);
export default CylindersBackNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIk5vZGUiLCJQYXRoIiwiUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMiLCJwbGlua29Qcm9iYWJpbGl0eSIsIkJPVU5EUyIsIkhJU1RPR1JBTV9CT1VORFMiLCJDeWxpbmRlcnNCYWNrTm9kZSIsImNvbnN0cnVjdG9yIiwibnVtYmVyT2ZSb3dzUHJvcGVydHkiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJjeWxpbmRlckluZm8iLCJlbGxpcHNlV2lkdGgiLCJtb2RlbFRvVmlld0RlbHRhWCIsImN5bGluZGVyV2lkdGgiLCJlbGxpcHNlSGVpZ2h0IiwiTWF0aCIsImFicyIsIm1vZGVsVG9WaWV3RGVsdGFZIiwidmVydGljYWxPZmZzZXQiLCJ0b3BTaGFwZSIsImVsbGlwc2UiLCJsaW5rIiwibnVtYmVyT2ZSb3dzIiwiYXNzZXJ0IiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwibnVtYmVyT2ZDeWxpbmRlcnMiLCJpIiwiYmluQ2VudGVyWCIsImdldEJpbkNlbnRlclgiLCJ4IiwibW9kZWxUb1ZpZXdYIiwieSIsIm1vZGVsVG9WaWV3WSIsInRvcCIsImZpbGwiLCJUT1BfQ1lMSU5ERVJfRklMTF9DT0xPUiIsInN0cm9rZSIsIlRPUF9DWUxJTkRFUl9TVFJPS0VfQ09MT1IiLCJjZW50ZXJYIiwiYWRkQ2hpbGQiLCJiaW5JbmRleCIsIm51bWJlck9mQmlucyIsIndpZHRoIiwibWluWCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ3lsaW5kZXJzQmFja05vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdG9wIHBvcnRpb24gb2YgdGhlIHJvdyBvZiBjeWxpbmRlcnNcclxuICogaXQgaXMgdGhlIGJhY2sgcG9ydGlvbiBvZiB0aGUgY3lsaW5kZXIgZnJvbSB0aGUgdmlld3BvaW50IG9mIHRoZSB6LWxheWVyXHJcbiAqIHVzZWQgd2l0aGluIHRoZSBQbGlua28gUHJvYmFiaWxpdHkgU2ltdWxhdGlvblxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGUgKEJlcmVhIENvbGxlZ2UpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9QbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBwbGlua29Qcm9iYWJpbGl0eSBmcm9tICcuLi8uLi9wbGlua29Qcm9iYWJpbGl0eS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQk9VTkRTID0gUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuSElTVE9HUkFNX0JPVU5EUztcclxuXHJcbmNsYXNzIEN5bGluZGVyc0JhY2tOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48bnVtYmVyPn0gbnVtYmVyT2ZSb3dzUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjeWxpbmRlckluZm8gLSBDb250YWlucyBjeWxpbmRlciBpbmZvOiBoZWlnaHQsIHdpZHRoLCBvZmZzZXQsIGVsbGlwc2VIZWlnaHRcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbnVtYmVyT2ZSb3dzUHJvcGVydHksIG1vZGVsVmlld1RyYW5zZm9ybSwgY3lsaW5kZXJJbmZvICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG5cclxuICAgIC8vIGNvbnZlbmllbmNlIHZhcmlhYmxlc1xyXG4gICAgY29uc3QgZWxsaXBzZVdpZHRoID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBjeWxpbmRlckluZm8uY3lsaW5kZXJXaWR0aCApO1xyXG4gICAgY29uc3QgZWxsaXBzZUhlaWdodCA9IE1hdGguYWJzKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIGN5bGluZGVySW5mby5lbGxpcHNlSGVpZ2h0ICkgKTtcclxuICAgIGNvbnN0IHZlcnRpY2FsT2Zmc2V0ID0gLW1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWSggY3lsaW5kZXJJbmZvLnZlcnRpY2FsT2Zmc2V0ICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBzaGFwZSBmb3IgdGhlIHRvcCBvZiB0aGUgY3lsaW5kZXJcclxuICAgIGNvbnN0IHRvcFNoYXBlID0gU2hhcGUuZWxsaXBzZSggMCwgMCwgZWxsaXBzZVdpZHRoIC8gMiwgZWxsaXBzZUhlaWdodCAvIDIgKTtcclxuXHJcbiAgICAvLyBsaW5rIHByZXNlbnQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLCBubyBuZWVkIHRvIGRpc3Bvc2VcclxuICAgIG51bWJlck9mUm93c1Byb3BlcnR5LmxpbmsoIG51bWJlck9mUm93cyA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG51bWJlck9mUm93cyApLCAnbnVtYmVyT2ZSb3dzIG11c3QgYmUgYW4gaW50ZWdlcicgKTtcclxuXHJcbiAgICAgIGNvbnN0IG51bWJlck9mQ3lsaW5kZXJzID0gbnVtYmVyT2ZSb3dzICsgMTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZDeWxpbmRlcnM7IGkrKyApIHtcclxuICAgICAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgdG9wIG9mIHRoZSBjeWxpbmRlcnMgY29udGFpbmVyc1xyXG4gICAgICAgIGNvbnN0IGJpbkNlbnRlclggPSB0aGlzLmdldEJpbkNlbnRlclgoIGksIG51bWJlck9mQ3lsaW5kZXJzICk7XHJcbiAgICAgICAgY29uc3QgeCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIGJpbkNlbnRlclggKTsgICAgICAgICAgLy8geC1jb29yZGluYXRlIG9mIGJpbiBpbiBtb2RlbCB1bml0c1xyXG4gICAgICAgIGNvbnN0IHkgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBjeWxpbmRlckluZm8udG9wICk7ICAgIC8vIHktY29vcmRpbmF0ZSBvZiBiaW4gaW4gbW9kZWwgdW5pdHNcclxuICAgICAgICBjb25zdCB0b3AgPSBuZXcgUGF0aCggdG9wU2hhcGUsIHtcclxuICAgICAgICAgIGZpbGw6IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLlRPUF9DWUxJTkRFUl9GSUxMX0NPTE9SLFxyXG4gICAgICAgICAgc3Ryb2tlOiBQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cy5UT1BfQ1lMSU5ERVJfU1RST0tFX0NPTE9SLFxyXG4gICAgICAgICAgY2VudGVyWDogeCxcclxuICAgICAgICAgIHRvcDogeSArIHZlcnRpY2FsT2Zmc2V0XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoIHRvcCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBjZW50ZXIgeCBjb29yZGluYXRlIG9mIGEgYmluIHdpdGggaW5kZXggYmluSW5kZXhcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiaW5JbmRleCAtIGluZGV4IGFzc29jaWF0ZWQgd2l0aCB0aGUgYmluLCB0aGUgaW5kZXggbWF5IHJhbmdlIGZyb20gMCB0byBudW1iZXJPZkJpbnMtMVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXJPZkJpbnMgLSB0aGUgbnVtYmVyIG9mIGJpbnMgb24gdGhlIHNjcmVlblxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpYyAocmVhZC1vbmx5KVxyXG4gICAqL1xyXG4gIGdldEJpbkNlbnRlclgoIGJpbkluZGV4LCBudW1iZXJPZkJpbnMgKSB7XHJcbiAgICAvLyBXZSBjb25zaWRlciBudW1iZXJPZkJpbnMtMSBiZWNhdXNlIHdlIGNvbnNpZGVyIHRoZSBtb3N0IGxlZnQgYmluIHRoZSBmaXJzdCBiaW4gb3V0IG9mIHRoZSB0b3RhbCBudW1iZXIgb2YgYmluc1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmluSW5kZXggPD0gbnVtYmVyT2ZCaW5zIC0gMSApO1xyXG4gICAgcmV0dXJuICggKCBiaW5JbmRleCArIDEgLyAyICkgLyBudW1iZXJPZkJpbnMgKSAqIEJPVU5EUy53aWR0aCArIEJPVU5EUy5taW5YO1xyXG4gIH1cclxufVxyXG5cclxucGxpbmtvUHJvYmFiaWxpdHkucmVnaXN0ZXIoICdDeWxpbmRlcnNCYWNrTm9kZScsIEN5bGluZGVyc0JhY2tOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDeWxpbmRlcnNCYWNrTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLDBCQUEwQixNQUFNLDRDQUE0QztBQUNuRixPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7O0FBRTFEO0FBQ0EsTUFBTUMsTUFBTSxHQUFHRiwwQkFBMEIsQ0FBQ0csZ0JBQWdCO0FBRTFELE1BQU1DLGlCQUFpQixTQUFTTixJQUFJLENBQUM7RUFDbkM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFTyxXQUFXQSxDQUFFQyxvQkFBb0IsRUFBRUMsa0JBQWtCLEVBQUVDLFlBQVksRUFBRztJQUVwRSxLQUFLLENBQUMsQ0FBQzs7SUFHUDtJQUNBLE1BQU1DLFlBQVksR0FBR0Ysa0JBQWtCLENBQUNHLGlCQUFpQixDQUFFRixZQUFZLENBQUNHLGFBQWMsQ0FBQztJQUN2RixNQUFNQyxhQUFhLEdBQUdDLElBQUksQ0FBQ0MsR0FBRyxDQUFFUCxrQkFBa0IsQ0FBQ1EsaUJBQWlCLENBQUVQLFlBQVksQ0FBQ0ksYUFBYyxDQUFFLENBQUM7SUFDcEcsTUFBTUksY0FBYyxHQUFHLENBQUNULGtCQUFrQixDQUFDUSxpQkFBaUIsQ0FBRVAsWUFBWSxDQUFDUSxjQUFlLENBQUM7O0lBRTNGO0lBQ0EsTUFBTUMsUUFBUSxHQUFHcEIsS0FBSyxDQUFDcUIsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVULFlBQVksR0FBRyxDQUFDLEVBQUVHLGFBQWEsR0FBRyxDQUFFLENBQUM7O0lBRTNFO0lBQ0FOLG9CQUFvQixDQUFDYSxJQUFJLENBQUVDLFlBQVksSUFBSTtNQUN6Q0MsTUFBTSxJQUFJQSxNQUFNLENBQUVDLE1BQU0sQ0FBQ0MsU0FBUyxDQUFFSCxZQUFhLENBQUMsRUFBRSxpQ0FBa0MsQ0FBQztNQUV2RixNQUFNSSxpQkFBaUIsR0FBR0osWUFBWSxHQUFHLENBQUM7TUFDMUMsS0FBTSxJQUFJSyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdELGlCQUFpQixFQUFFQyxDQUFDLEVBQUUsRUFBRztRQUM1QztRQUNBLE1BQU1DLFVBQVUsR0FBRyxJQUFJLENBQUNDLGFBQWEsQ0FBRUYsQ0FBQyxFQUFFRCxpQkFBa0IsQ0FBQztRQUM3RCxNQUFNSSxDQUFDLEdBQUdyQixrQkFBa0IsQ0FBQ3NCLFlBQVksQ0FBRUgsVUFBVyxDQUFDLENBQUMsQ0FBVTtRQUNsRSxNQUFNSSxDQUFDLEdBQUd2QixrQkFBa0IsQ0FBQ3dCLFlBQVksQ0FBRXZCLFlBQVksQ0FBQ3dCLEdBQUksQ0FBQyxDQUFDLENBQUk7UUFDbEUsTUFBTUEsR0FBRyxHQUFHLElBQUlqQyxJQUFJLENBQUVrQixRQUFRLEVBQUU7VUFDOUJnQixJQUFJLEVBQUVqQywwQkFBMEIsQ0FBQ2tDLHVCQUF1QjtVQUN4REMsTUFBTSxFQUFFbkMsMEJBQTBCLENBQUNvQyx5QkFBeUI7VUFDNURDLE9BQU8sRUFBRVQsQ0FBQztVQUNWSSxHQUFHLEVBQUVGLENBQUMsR0FBR2Q7UUFDWCxDQUFFLENBQUM7UUFDSCxJQUFJLENBQUNzQixRQUFRLENBQUVOLEdBQUksQ0FBQztNQUN0QjtJQUNGLENBQUUsQ0FBQztFQUNMOztFQUdBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUwsYUFBYUEsQ0FBRVksUUFBUSxFQUFFQyxZQUFZLEVBQUc7SUFDdEM7SUFDQW5CLE1BQU0sSUFBSUEsTUFBTSxDQUFFa0IsUUFBUSxJQUFJQyxZQUFZLEdBQUcsQ0FBRSxDQUFDO0lBQ2hELE9BQVMsQ0FBRUQsUUFBUSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUtDLFlBQVksR0FBS3RDLE1BQU0sQ0FBQ3VDLEtBQUssR0FBR3ZDLE1BQU0sQ0FBQ3dDLElBQUk7RUFDN0U7QUFDRjtBQUVBekMsaUJBQWlCLENBQUMwQyxRQUFRLENBQUUsbUJBQW1CLEVBQUV2QyxpQkFBa0IsQ0FBQztBQUVwRSxlQUFlQSxpQkFBaUIifQ==