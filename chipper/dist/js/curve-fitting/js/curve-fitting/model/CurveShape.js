// Copyright 2017-2022, University of Colorado Boulder

/**
 * Model of the shape of a polynomial curve.
 * Uses linear interpolation to make lines between points.
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 */

import { Shape } from '../../../../kite/js/imports.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';

// constants
// how many segments: more segments means a finer/more accurate curve
const NUMBER_STEPS = 220;
class CurveShape extends Shape {
  /**
   * @param {function(number): number} getYValueAt - a function that gets a Y value for the given X coordinate
   */
  constructor(getYValueAt) {
    super();

    // model bounds of the graph area
    const graphBounds = CurveFittingConstants.GRAPH_NODE_MODEL_BOUNDS;

    // convenience variables
    const xMin = graphBounds.minX; // minimum value of the x range
    const xMax = graphBounds.maxX; // maximum value of the x range

    // separation between adjacent x coordinates
    const interval = (xMax - xMin) / NUMBER_STEPS;

    // move shape to initial position
    this.moveTo(xMin, getYValueAt(xMin));

    // create lines connecting each point
    for (let x = xMin + interval; x <= xMax; x += interval) {
      const y = getYValueAt(x);
      this.lineTo(x, y);
    }
  }
}
curveFitting.register('CurveShape', CurveShape);
export default CurveShape;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsImN1cnZlRml0dGluZyIsIkN1cnZlRml0dGluZ0NvbnN0YW50cyIsIk5VTUJFUl9TVEVQUyIsIkN1cnZlU2hhcGUiLCJjb25zdHJ1Y3RvciIsImdldFlWYWx1ZUF0IiwiZ3JhcGhCb3VuZHMiLCJHUkFQSF9OT0RFX01PREVMX0JPVU5EUyIsInhNaW4iLCJtaW5YIiwieE1heCIsIm1heFgiLCJpbnRlcnZhbCIsIm1vdmVUbyIsIngiLCJ5IiwibGluZVRvIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDdXJ2ZVNoYXBlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIG9mIHRoZSBzaGFwZSBvZiBhIHBvbHlub21pYWwgY3VydmUuXHJcbiAqIFVzZXMgbGluZWFyIGludGVycG9sYXRpb24gdG8gbWFrZSBsaW5lcyBiZXR3ZWVuIHBvaW50cy5cclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxyXG4gKiBAYXV0aG9yIFNhdXJhYmggVG90ZXlcclxuICovXHJcblxyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBjdXJ2ZUZpdHRpbmcgZnJvbSAnLi4vLi4vY3VydmVGaXR0aW5nLmpzJztcclxuaW1wb3J0IEN1cnZlRml0dGluZ0NvbnN0YW50cyBmcm9tICcuLi9DdXJ2ZUZpdHRpbmdDb25zdGFudHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIGhvdyBtYW55IHNlZ21lbnRzOiBtb3JlIHNlZ21lbnRzIG1lYW5zIGEgZmluZXIvbW9yZSBhY2N1cmF0ZSBjdXJ2ZVxyXG5jb25zdCBOVU1CRVJfU1RFUFMgPSAyMjA7XHJcblxyXG5jbGFzcyBDdXJ2ZVNoYXBlIGV4dGVuZHMgU2hhcGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKG51bWJlcik6IG51bWJlcn0gZ2V0WVZhbHVlQXQgLSBhIGZ1bmN0aW9uIHRoYXQgZ2V0cyBhIFkgdmFsdWUgZm9yIHRoZSBnaXZlbiBYIGNvb3JkaW5hdGVcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZ2V0WVZhbHVlQXQgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBtb2RlbCBib3VuZHMgb2YgdGhlIGdyYXBoIGFyZWFcclxuICAgIGNvbnN0IGdyYXBoQm91bmRzID0gQ3VydmVGaXR0aW5nQ29uc3RhbnRzLkdSQVBIX05PREVfTU9ERUxfQk9VTkRTO1xyXG5cclxuICAgIC8vIGNvbnZlbmllbmNlIHZhcmlhYmxlc1xyXG4gICAgY29uc3QgeE1pbiA9IGdyYXBoQm91bmRzLm1pblg7IC8vIG1pbmltdW0gdmFsdWUgb2YgdGhlIHggcmFuZ2VcclxuICAgIGNvbnN0IHhNYXggPSBncmFwaEJvdW5kcy5tYXhYOyAvLyBtYXhpbXVtIHZhbHVlIG9mIHRoZSB4IHJhbmdlXHJcblxyXG4gICAgLy8gc2VwYXJhdGlvbiBiZXR3ZWVuIGFkamFjZW50IHggY29vcmRpbmF0ZXNcclxuICAgIGNvbnN0IGludGVydmFsID0gKCB4TWF4IC0geE1pbiApIC8gTlVNQkVSX1NURVBTO1xyXG5cclxuICAgIC8vIG1vdmUgc2hhcGUgdG8gaW5pdGlhbCBwb3NpdGlvblxyXG4gICAgdGhpcy5tb3ZlVG8oIHhNaW4sIGdldFlWYWx1ZUF0KCB4TWluICkgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgbGluZXMgY29ubmVjdGluZyBlYWNoIHBvaW50XHJcbiAgICBmb3IgKCBsZXQgeCA9IHhNaW4gKyBpbnRlcnZhbDsgeCA8PSB4TWF4OyB4ICs9IGludGVydmFsICkge1xyXG4gICAgICBjb25zdCB5ID0gZ2V0WVZhbHVlQXQoIHggKTtcclxuICAgICAgdGhpcy5saW5lVG8oIHgsIHkgKTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufVxyXG5cclxuY3VydmVGaXR0aW5nLnJlZ2lzdGVyKCAnQ3VydmVTaGFwZScsIEN1cnZlU2hhcGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgQ3VydmVTaGFwZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MscUJBQXFCLE1BQU0sNkJBQTZCOztBQUUvRDtBQUNBO0FBQ0EsTUFBTUMsWUFBWSxHQUFHLEdBQUc7QUFFeEIsTUFBTUMsVUFBVSxTQUFTSixLQUFLLENBQUM7RUFFN0I7QUFDRjtBQUNBO0VBQ0VLLFdBQVdBLENBQUVDLFdBQVcsRUFBRztJQUV6QixLQUFLLENBQUMsQ0FBQzs7SUFFUDtJQUNBLE1BQU1DLFdBQVcsR0FBR0wscUJBQXFCLENBQUNNLHVCQUF1Qjs7SUFFakU7SUFDQSxNQUFNQyxJQUFJLEdBQUdGLFdBQVcsQ0FBQ0csSUFBSSxDQUFDLENBQUM7SUFDL0IsTUFBTUMsSUFBSSxHQUFHSixXQUFXLENBQUNLLElBQUksQ0FBQyxDQUFDOztJQUUvQjtJQUNBLE1BQU1DLFFBQVEsR0FBRyxDQUFFRixJQUFJLEdBQUdGLElBQUksSUFBS04sWUFBWTs7SUFFL0M7SUFDQSxJQUFJLENBQUNXLE1BQU0sQ0FBRUwsSUFBSSxFQUFFSCxXQUFXLENBQUVHLElBQUssQ0FBRSxDQUFDOztJQUV4QztJQUNBLEtBQU0sSUFBSU0sQ0FBQyxHQUFHTixJQUFJLEdBQUdJLFFBQVEsRUFBRUUsQ0FBQyxJQUFJSixJQUFJLEVBQUVJLENBQUMsSUFBSUYsUUFBUSxFQUFHO01BQ3hELE1BQU1HLENBQUMsR0FBR1YsV0FBVyxDQUFFUyxDQUFFLENBQUM7TUFDMUIsSUFBSSxDQUFDRSxNQUFNLENBQUVGLENBQUMsRUFBRUMsQ0FBRSxDQUFDO0lBQ3JCO0VBRUY7QUFFRjtBQUVBZixZQUFZLENBQUNpQixRQUFRLENBQUUsWUFBWSxFQUFFZCxVQUFXLENBQUM7QUFDakQsZUFBZUEsVUFBVSJ9