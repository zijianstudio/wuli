// Copyright 2018-2022, University of Colorado Boulder

/**
 * Represents a data series that has a color and associated data points which may change.  The change is signified with
 * an Emitter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Emitter from '../../axon/js/Emitter.js';
import Vector2 from '../../dot/js/Vector2.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import merge from '../../phet-core/js/merge.js';
import { Color, ColorDef } from '../../scenery/js/imports.js';
import griddle from './griddle.js';

/**
 * @deprecated - please use bamboo
 */
class DynamicSeries {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    assert && deprecationWarning('Please use bamboo');

    // @private {Vector2[]} - the data points in the series.  A NaN "y" value indicates there is no sample at that
    // point in time
    this.data = [];

    // @private {Emitter} -  sends notification when the data series changes
    this.emitter = new Emitter();
    options = merge({
      // {ColorDef} - color for the visualization of the DynamicSeries
      color: new Color('black'),
      // options for visualization of the data when plot style is DynamicSeriesNode.PlotStyle.LINE
      lineWidth: 1,
      // {number}
      lineJoin: 'miter',
      // {string} - one of the CanvasRenderingContext2D.lineJoin values

      // options for visualization of the data when plot style is DynamicSeriesNode.PlotStyle.SCATTER
      radius: 2,
      // {BooleanProperty} - controls visibility of the visualization for the DynamicSeries
      visibleProperty: new BooleanProperty(true)
    }, options);
    assert && assert(ColorDef.isColorDef(options.color));

    // @public (read-only) {Color}
    this.color = options.color;

    // @public (read-only) {number}
    this.lineWidth = options.lineWidth;
    this.lineJoin = options.lineJoin;

    // @public (read-only) {number}
    this.radius = options.radius;

    // @public (read-only) {BooleanProperty} - controls whether or not this DynamicSeries will be visible on its
    // chart
    this.visibleProperty = options.visibleProperty;
  }

  /**
   * Removes the first data point
   * @public
   */
  shiftData() {
    this.data.shift();
    this.emitter.emit();
  }

  /**
   * Returns the number of points in the data series.
   * @returns {number}
   * @public
   */
  getLength() {
    return this.data.length;
  }

  /**
   * Adds a listener when the data series changes.
   * @param {function} listener
   * @public
   */
  addDynamicSeriesListener(listener) {
    this.emitter.addListener(listener);
  }

  /**
   * Removes a listener when the data series changes.
   * @param {function} listener
   * @public
   */
  removeDynamicSeriesListener(listener) {
    this.emitter.removeListener(listener);
  }

  /**
   * Remove all data from the DynamicSeries
   * @public
   */
  clear() {
    this.data.length = 0;
    this.emitter.emit();
  }

  /**
   * Adds an (x,y) point
   * @param {number} x
   * @param {number} y
   * @public
   */
  addXYDataPoint(x, y) {
    this.addDataPoint(new Vector2(x, y));
  }

  /**
   * Adds a Vector2 data point
   * @param {Vector2} dataPoint
   * @public
   */
  addDataPoint(dataPoint) {
    this.data.push(dataPoint);
    this.emitter.emit();
  }

  /**
   * Returns the data point at the specified index.
   * @param {number} index
   * @returns {Vector2}
   * @public
   */
  getDataPoint(index) {
    return this.data[index];
  }

  /**
   * Returns true if there are any data points.
   * @returns {boolean}
   * @public
   */
  hasData() {
    return this.data.length > 0;
  }

  /**
   * Remove many data points of the DynamicSeries at once without notifying listeners, then notify
   * listeners once all have been removed (or performance).
   * @public
   *
   * @param {Vector2[]} dataPoints
   */
  removeDataPoints(dataPoints) {
    dataPoints.forEach(pointToRemove => {
      this.data.slice().forEach((dataPoint, index) => {
        if (pointToRemove.equals(dataPoint)) {
          this.data.splice(index, 1);
        }
      });
    });

    // notify to listeners that data has changed
    this.emitter.emit();
  }

  /**
   * Remove a set of data points, removing one at each provided x value. You may have access
   * to the independent variable but not to the y value in the series, this lets you
   * remove many points at once without getting the y values.
   * @public
   *
   * @param {number[]} xValues
   */
  removeDataPointsAtX(xValues) {
    xValues.forEach(xValueToRemove => {
      this.data.slice().forEach((dataPoint, index) => {
        if (xValueToRemove === dataPoint.x) {
          this.data.splice(index, 1);
        }
      });
    });

    // notify to listeners that data has changed
    this.emitter.emit();
  }
}
griddle.register('DynamicSeries', DynamicSeries);
export default DynamicSeries;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiVmVjdG9yMiIsImRlcHJlY2F0aW9uV2FybmluZyIsIm1lcmdlIiwiQ29sb3IiLCJDb2xvckRlZiIsImdyaWRkbGUiLCJEeW5hbWljU2VyaWVzIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiYXNzZXJ0IiwiZGF0YSIsImVtaXR0ZXIiLCJjb2xvciIsImxpbmVXaWR0aCIsImxpbmVKb2luIiwicmFkaXVzIiwidmlzaWJsZVByb3BlcnR5IiwiaXNDb2xvckRlZiIsInNoaWZ0RGF0YSIsInNoaWZ0IiwiZW1pdCIsImdldExlbmd0aCIsImxlbmd0aCIsImFkZER5bmFtaWNTZXJpZXNMaXN0ZW5lciIsImxpc3RlbmVyIiwiYWRkTGlzdGVuZXIiLCJyZW1vdmVEeW5hbWljU2VyaWVzTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsImNsZWFyIiwiYWRkWFlEYXRhUG9pbnQiLCJ4IiwieSIsImFkZERhdGFQb2ludCIsImRhdGFQb2ludCIsInB1c2giLCJnZXREYXRhUG9pbnQiLCJpbmRleCIsImhhc0RhdGEiLCJyZW1vdmVEYXRhUG9pbnRzIiwiZGF0YVBvaW50cyIsImZvckVhY2giLCJwb2ludFRvUmVtb3ZlIiwic2xpY2UiLCJlcXVhbHMiLCJzcGxpY2UiLCJyZW1vdmVEYXRhUG9pbnRzQXRYIiwieFZhbHVlcyIsInhWYWx1ZVRvUmVtb3ZlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEeW5hbWljU2VyaWVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBkYXRhIHNlcmllcyB0aGF0IGhhcyBhIGNvbG9yIGFuZCBhc3NvY2lhdGVkIGRhdGEgcG9pbnRzIHdoaWNoIG1heSBjaGFuZ2UuICBUaGUgY2hhbmdlIGlzIHNpZ25pZmllZCB3aXRoXHJcbiAqIGFuIEVtaXR0ZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGRlcHJlY2F0aW9uV2FybmluZyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBDb2xvckRlZiB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBncmlkZGxlIGZyb20gJy4vZ3JpZGRsZS5qcyc7XHJcblxyXG4vKipcclxuICogQGRlcHJlY2F0ZWQgLSBwbGVhc2UgdXNlIGJhbWJvb1xyXG4gKi9cclxuY2xhc3MgRHluYW1pY1NlcmllcyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBkZXByZWNhdGlvbldhcm5pbmcoICdQbGVhc2UgdXNlIGJhbWJvbycgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yMltdfSAtIHRoZSBkYXRhIHBvaW50cyBpbiB0aGUgc2VyaWVzLiAgQSBOYU4gXCJ5XCIgdmFsdWUgaW5kaWNhdGVzIHRoZXJlIGlzIG5vIHNhbXBsZSBhdCB0aGF0XHJcbiAgICAvLyBwb2ludCBpbiB0aW1lXHJcbiAgICB0aGlzLmRhdGEgPSBbXTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7RW1pdHRlcn0gLSAgc2VuZHMgbm90aWZpY2F0aW9uIHdoZW4gdGhlIGRhdGEgc2VyaWVzIGNoYW5nZXNcclxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7Q29sb3JEZWZ9IC0gY29sb3IgZm9yIHRoZSB2aXN1YWxpemF0aW9uIG9mIHRoZSBEeW5hbWljU2VyaWVzXHJcbiAgICAgIGNvbG9yOiBuZXcgQ29sb3IoICdibGFjaycgKSxcclxuXHJcbiAgICAgIC8vIG9wdGlvbnMgZm9yIHZpc3VhbGl6YXRpb24gb2YgdGhlIGRhdGEgd2hlbiBwbG90IHN0eWxlIGlzIER5bmFtaWNTZXJpZXNOb2RlLlBsb3RTdHlsZS5MSU5FXHJcbiAgICAgIGxpbmVXaWR0aDogMSwgLy8ge251bWJlcn1cclxuICAgICAgbGluZUpvaW46ICdtaXRlcicsIC8vIHtzdHJpbmd9IC0gb25lIG9mIHRoZSBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQubGluZUpvaW4gdmFsdWVzXHJcblxyXG4gICAgICAvLyBvcHRpb25zIGZvciB2aXN1YWxpemF0aW9uIG9mIHRoZSBkYXRhIHdoZW4gcGxvdCBzdHlsZSBpcyBEeW5hbWljU2VyaWVzTm9kZS5QbG90U3R5bGUuU0NBVFRFUlxyXG4gICAgICByYWRpdXM6IDIsXHJcblxyXG4gICAgICAvLyB7Qm9vbGVhblByb3BlcnR5fSAtIGNvbnRyb2xzIHZpc2liaWxpdHkgb2YgdGhlIHZpc3VhbGl6YXRpb24gZm9yIHRoZSBEeW5hbWljU2VyaWVzXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApXHJcbiAgICB9LCBvcHRpb25zICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBDb2xvckRlZi5pc0NvbG9yRGVmKCBvcHRpb25zLmNvbG9yICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtDb2xvcn1cclxuICAgIHRoaXMuY29sb3IgPSBvcHRpb25zLmNvbG9yO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn1cclxuICAgIHRoaXMubGluZVdpZHRoID0gb3B0aW9ucy5saW5lV2lkdGg7XHJcbiAgICB0aGlzLmxpbmVKb2luID0gb3B0aW9ucy5saW5lSm9pbjtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtudW1iZXJ9XHJcbiAgICB0aGlzLnJhZGl1cyA9IG9wdGlvbnMucmFkaXVzO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0Jvb2xlYW5Qcm9wZXJ0eX0gLSBjb250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGlzIER5bmFtaWNTZXJpZXMgd2lsbCBiZSB2aXNpYmxlIG9uIGl0c1xyXG4gICAgLy8gY2hhcnRcclxuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5ID0gb3B0aW9ucy52aXNpYmxlUHJvcGVydHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIHRoZSBmaXJzdCBkYXRhIHBvaW50XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNoaWZ0RGF0YSgpIHtcclxuICAgIHRoaXMuZGF0YS5zaGlmdCgpO1xyXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBwb2ludHMgaW4gdGhlIGRhdGEgc2VyaWVzLlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldExlbmd0aCgpIHtcclxuICAgIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIGxpc3RlbmVyIHdoZW4gdGhlIGRhdGEgc2VyaWVzIGNoYW5nZXMuXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXJcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkRHluYW1pY1Nlcmllc0xpc3RlbmVyKCBsaXN0ZW5lciApIHtcclxuICAgIHRoaXMuZW1pdHRlci5hZGRMaXN0ZW5lciggbGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBsaXN0ZW5lciB3aGVuIHRoZSBkYXRhIHNlcmllcyBjaGFuZ2VzLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlbW92ZUR5bmFtaWNTZXJpZXNMaXN0ZW5lciggbGlzdGVuZXIgKSB7XHJcbiAgICB0aGlzLmVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIGxpc3RlbmVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYWxsIGRhdGEgZnJvbSB0aGUgRHluYW1pY1Nlcmllc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjbGVhcigpIHtcclxuICAgIHRoaXMuZGF0YS5sZW5ndGggPSAwO1xyXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYW4gKHgseSkgcG9pbnRcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZFhZRGF0YVBvaW50KCB4LCB5ICkge1xyXG4gICAgdGhpcy5hZGREYXRhUG9pbnQoIG5ldyBWZWN0b3IyKCB4LCB5ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBWZWN0b3IyIGRhdGEgcG9pbnRcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGRhdGFQb2ludFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGREYXRhUG9pbnQoIGRhdGFQb2ludCApIHtcclxuICAgIHRoaXMuZGF0YS5wdXNoKCBkYXRhUG9pbnQgKTtcclxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBkYXRhIHBvaW50IGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldERhdGFQb2ludCggaW5kZXggKSB7XHJcbiAgICByZXR1cm4gdGhpcy5kYXRhWyBpbmRleCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZXJlIGFyZSBhbnkgZGF0YSBwb2ludHMuXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGhhc0RhdGEoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aCA+IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgbWFueSBkYXRhIHBvaW50cyBvZiB0aGUgRHluYW1pY1NlcmllcyBhdCBvbmNlIHdpdGhvdXQgbm90aWZ5aW5nIGxpc3RlbmVycywgdGhlbiBub3RpZnlcclxuICAgKiBsaXN0ZW5lcnMgb25jZSBhbGwgaGF2ZSBiZWVuIHJlbW92ZWQgKG9yIHBlcmZvcm1hbmNlKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJbXX0gZGF0YVBvaW50c1xyXG4gICAqL1xyXG4gIHJlbW92ZURhdGFQb2ludHMoIGRhdGFQb2ludHMgKSB7XHJcbiAgICBkYXRhUG9pbnRzLmZvckVhY2goIHBvaW50VG9SZW1vdmUgPT4ge1xyXG4gICAgICB0aGlzLmRhdGEuc2xpY2UoKS5mb3JFYWNoKCAoIGRhdGFQb2ludCwgaW5kZXggKSA9PiB7XHJcbiAgICAgICAgaWYgKCBwb2ludFRvUmVtb3ZlLmVxdWFscyggZGF0YVBvaW50ICkgKSB7XHJcbiAgICAgICAgICB0aGlzLmRhdGEuc3BsaWNlKCBpbmRleCwgMSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG5vdGlmeSB0byBsaXN0ZW5lcnMgdGhhdCBkYXRhIGhhcyBjaGFuZ2VkXHJcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGEgc2V0IG9mIGRhdGEgcG9pbnRzLCByZW1vdmluZyBvbmUgYXQgZWFjaCBwcm92aWRlZCB4IHZhbHVlLiBZb3UgbWF5IGhhdmUgYWNjZXNzXHJcbiAgICogdG8gdGhlIGluZGVwZW5kZW50IHZhcmlhYmxlIGJ1dCBub3QgdG8gdGhlIHkgdmFsdWUgaW4gdGhlIHNlcmllcywgdGhpcyBsZXRzIHlvdVxyXG4gICAqIHJlbW92ZSBtYW55IHBvaW50cyBhdCBvbmNlIHdpdGhvdXQgZ2V0dGluZyB0aGUgeSB2YWx1ZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJbXX0geFZhbHVlc1xyXG4gICAqL1xyXG4gIHJlbW92ZURhdGFQb2ludHNBdFgoIHhWYWx1ZXMgKSB7XHJcbiAgICB4VmFsdWVzLmZvckVhY2goIHhWYWx1ZVRvUmVtb3ZlID0+IHtcclxuICAgICAgdGhpcy5kYXRhLnNsaWNlKCkuZm9yRWFjaCggKCBkYXRhUG9pbnQsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgIGlmICggeFZhbHVlVG9SZW1vdmUgPT09IGRhdGFQb2ludC54ICkge1xyXG4gICAgICAgICAgdGhpcy5kYXRhLnNwbGljZSggaW5kZXgsIDEgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBub3RpZnkgdG8gbGlzdGVuZXJzIHRoYXQgZGF0YSBoYXMgY2hhbmdlZFxyXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcbn1cclxuXHJcbmdyaWRkbGUucmVnaXN0ZXIoICdEeW5hbWljU2VyaWVzJywgRHluYW1pY1NlcmllcyApO1xyXG5leHBvcnQgZGVmYXVsdCBEeW5hbWlj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