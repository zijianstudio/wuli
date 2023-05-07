// Copyright 2020-2023, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Brandon Li
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import calculusGrapher from '../calculusGrapher.js';
import logGlobal from '../../../phet-core/js/logGlobal.js';
import CalculusGrapherConstants from './CalculusGrapherConstants.js';
export const ConnectDiscontinuitiesValues = ['noLine', 'dashedLine'];
export const DerivativeNotationValues = ['lagrange', 'leibniz'];
export const FunctionVariableValues = ['x', 't'];
const CalculusGrapherQueryParameters = QueryStringMachine.getAll({
  //====================================================================================================================
  // public
  //====================================================================================================================

  // Initial value of the 'Variable' preference.
  // The function variable to be used throughout the simulation
  functionVariable: {
    type: 'string',
    defaultValue: 'x',
    validValues: FunctionVariableValues,
    public: true
  },
  // Initial value of the 'Notation' preference.
  // The derivative notation to be used throughout the simulation
  derivativeNotation: {
    type: 'string',
    defaultValue: 'lagrange',
    validValues: DerivativeNotationValues,
    public: true
  },
  // Initial value of the 'Discontinuities' preference.
  // Whether to connect discontinuities with nothing or a dashed line
  connectDiscontinuities: {
    type: 'string',
    defaultValue: 'noLine',
    validValues: ConnectDiscontinuitiesValues,
    public: true
  },
  // Initial value of the 'Values' preference.
  // Shows numerical values wherever they appear in the sim: tick labels, tangent-line slope, etc.
  valuesVisible: {
    type: 'boolean',
    defaultValue: false,
    public: true
  },
  // Initial value of the 'Predict' preference.
  // Determines whether features related to the predict curve are shown in the UI.
  predict: {
    type: 'boolean',
    defaultValue: false,
    public: true
  },
  // Whether the 'Show f(x)' checkbox will be shown when in 'Predict' mode.
  hasShowOriginalCurveCheckbox: {
    type: 'boolean',
    defaultValue: true,
    public: true
  },
  //====================================================================================================================
  // private - for internal use only
  //====================================================================================================================

  /**
   * The Curves for 'Calculus Grapher' are discretized into equally spaced points. The higher the numberOfPoints
   * the more faithful is the reproduction of a curve. For values less than 400 points, oddities
   * are apparent for the underTheCurveTool and tangentTool (see https://github.com/phetsims/calculus-grapher/issues/176)
   */
  numberOfPoints: {
    type: 'number',
    isValidValue: value => value > 0,
    defaultValue: 1251
  },
  /**
   * The smooth algorithm for 'Calculus Grapher' uses a procedure described in https://en.wikipedia.org/wiki/Kernel_smoother.
   * using a Gaussian kernel. The value below is the standard deviation of the Gaussian function kernel.
   * The larger the standard deviation is, the smoother the function.
   */
  smoothingStandardDeviation: {
    type: 'number',
    isValidValue: value => value > 0,
    defaultValue: 0.005 * CalculusGrapherConstants.CURVE_X_RANGE.getLength()
  },
  /**
   * The pedestal mode creates a smooth and continuous trapezoidal-shaped curve with rounded corners.
   * The rounded corners are set by a constant called edgeSlopeFactor.
   * A larger value creates a wider edge.
   * https://github.com/phetsims/calculus-grapher/issues/75
   */
  edgeSlopeFactor: {
    type: 'number',
    isValidValue: value => value >= 0,
    defaultValue: 0.04 * CalculusGrapherConstants.CURVE_X_RANGE.getLength()
  },
  /**
   * The maximum tilting (slope) of curves relative to the horizontal. Used for Tilt in Curve Manipulation Mode
   * See https://github.com/phetsims/calculus-grapher/issues/26
   */
  maxTilt: {
    type: 'number',
    isValidValue: value => value > 0,
    defaultValue: 3
  },
  // Shows all the curve points as circles in a scatter plot.
  allPoints: {
    type: 'boolean',
    defaultValue: false
  },
  // Shows the cusp points on a curve as circles in a scatter plot
  cuspPoints: {
    type: 'boolean',
    defaultValue: false
  },
  // For debugging, to make all LabeledLine instances initially visible.
  labeledLinesVisible: {
    type: 'boolean',
    defaultValue: false
  },
  // For debugging, to make all LabeledPoint instances initially visible.
  labeledPointsVisible: {
    type: 'boolean',
    defaultValue: false
  },
  // Alpha for CalculusGrapherColors.integralPositiveFillProperty, so that PhET designer can fine-tune
  // See https://github.com/phetsims/calculus-grapher/issues/166
  positiveAlpha: {
    type: 'number',
    isValidValue: alpha => alpha > 0 && alpha <= 1,
    defaultValue: 0.25
  },
  // Alpha for CalculusGrapherColors.integralPositiveFillProperty, so that PhET designer can fine-tune
  // See https://github.com/phetsims/calculus-grapher/issues/166
  negativeAlpha: {
    type: 'number',
    isValidValue: alpha => alpha > 0 && alpha <= 1,
    defaultValue: 0.55
  }
});
calculusGrapher.register('CalculusGrapherQueryParameters', CalculusGrapherQueryParameters);

// Log query parameters
logGlobal('phet.chipper.queryParameters');
logGlobal('phet.preloads.phetio.queryParameters');
logGlobal('phet.calculusGrapher.CalculusGrapherQueryParameters');
export default CalculusGrapherQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjYWxjdWx1c0dyYXBoZXIiLCJsb2dHbG9iYWwiLCJDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMiLCJDb25uZWN0RGlzY29udGludWl0aWVzVmFsdWVzIiwiRGVyaXZhdGl2ZU5vdGF0aW9uVmFsdWVzIiwiRnVuY3Rpb25WYXJpYWJsZVZhbHVlcyIsIkNhbGN1bHVzR3JhcGhlclF1ZXJ5UGFyYW1ldGVycyIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImdldEFsbCIsImZ1bmN0aW9uVmFyaWFibGUiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwidmFsaWRWYWx1ZXMiLCJwdWJsaWMiLCJkZXJpdmF0aXZlTm90YXRpb24iLCJjb25uZWN0RGlzY29udGludWl0aWVzIiwidmFsdWVzVmlzaWJsZSIsInByZWRpY3QiLCJoYXNTaG93T3JpZ2luYWxDdXJ2ZUNoZWNrYm94IiwibnVtYmVyT2ZQb2ludHMiLCJpc1ZhbGlkVmFsdWUiLCJ2YWx1ZSIsInNtb290aGluZ1N0YW5kYXJkRGV2aWF0aW9uIiwiQ1VSVkVfWF9SQU5HRSIsImdldExlbmd0aCIsImVkZ2VTbG9wZUZhY3RvciIsIm1heFRpbHQiLCJhbGxQb2ludHMiLCJjdXNwUG9pbnRzIiwibGFiZWxlZExpbmVzVmlzaWJsZSIsImxhYmVsZWRQb2ludHNWaXNpYmxlIiwicG9zaXRpdmVBbHBoYSIsImFscGhhIiwibmVnYXRpdmVBbHBoYSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2FsY3VsdXNHcmFwaGVyUXVlcnlQYXJhbWV0ZXJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFF1ZXJ5IHBhcmFtZXRlcnMgc3VwcG9ydGVkIGJ5IHRoaXMgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBjYWxjdWx1c0dyYXBoZXIgZnJvbSAnLi4vY2FsY3VsdXNHcmFwaGVyLmpzJztcclxuaW1wb3J0IGxvZ0dsb2JhbCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbG9nR2xvYmFsLmpzJztcclxuaW1wb3J0IENhbGN1bHVzR3JhcGhlckNvbnN0YW50cyBmcm9tICcuL0NhbGN1bHVzR3JhcGhlckNvbnN0YW50cy5qcyc7XHJcblxyXG5leHBvcnQgY29uc3QgQ29ubmVjdERpc2NvbnRpbnVpdGllc1ZhbHVlcyA9IFsgJ25vTGluZScsICdkYXNoZWRMaW5lJyBdO1xyXG5leHBvcnQgdHlwZSBDb25uZWN0RGlzY29udGludWl0aWVzID0gKCB0eXBlb2YgQ29ubmVjdERpc2NvbnRpbnVpdGllc1ZhbHVlcyApWyBudW1iZXIgXTtcclxuXHJcbmV4cG9ydCBjb25zdCBEZXJpdmF0aXZlTm90YXRpb25WYWx1ZXMgPSBbICdsYWdyYW5nZScsICdsZWlibml6JyBdIGFzIGNvbnN0O1xyXG5leHBvcnQgdHlwZSBEZXJpdmF0aXZlTm90YXRpb24gPSAoIHR5cGVvZiBEZXJpdmF0aXZlTm90YXRpb25WYWx1ZXMgKVtudW1iZXJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IEZ1bmN0aW9uVmFyaWFibGVWYWx1ZXMgPSBbICd4JywgJ3QnIF0gYXMgY29uc3Q7XHJcbmV4cG9ydCB0eXBlIEZ1bmN0aW9uVmFyaWFibGUgPSAoIHR5cGVvZiBGdW5jdGlvblZhcmlhYmxlVmFsdWVzIClbbnVtYmVyXTtcclxuXHJcbmNvbnN0IENhbGN1bHVzR3JhcGhlclF1ZXJ5UGFyYW1ldGVycyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGwoIHtcclxuXHJcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIHB1YmxpY1xyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLy8gSW5pdGlhbCB2YWx1ZSBvZiB0aGUgJ1ZhcmlhYmxlJyBwcmVmZXJlbmNlLlxyXG4gIC8vIFRoZSBmdW5jdGlvbiB2YXJpYWJsZSB0byBiZSB1c2VkIHRocm91Z2hvdXQgdGhlIHNpbXVsYXRpb25cclxuICBmdW5jdGlvblZhcmlhYmxlOiB7XHJcbiAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogJ3gnLFxyXG4gICAgdmFsaWRWYWx1ZXM6IEZ1bmN0aW9uVmFyaWFibGVWYWx1ZXMsXHJcbiAgICBwdWJsaWM6IHRydWVcclxuICB9LFxyXG5cclxuICAvLyBJbml0aWFsIHZhbHVlIG9mIHRoZSAnTm90YXRpb24nIHByZWZlcmVuY2UuXHJcbiAgLy8gVGhlIGRlcml2YXRpdmUgbm90YXRpb24gdG8gYmUgdXNlZCB0aHJvdWdob3V0IHRoZSBzaW11bGF0aW9uXHJcbiAgZGVyaXZhdGl2ZU5vdGF0aW9uOiB7XHJcbiAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogJ2xhZ3JhbmdlJyxcclxuICAgIHZhbGlkVmFsdWVzOiBEZXJpdmF0aXZlTm90YXRpb25WYWx1ZXMsXHJcbiAgICBwdWJsaWM6IHRydWVcclxuICB9LFxyXG5cclxuICAvLyBJbml0aWFsIHZhbHVlIG9mIHRoZSAnRGlzY29udGludWl0aWVzJyBwcmVmZXJlbmNlLlxyXG4gIC8vIFdoZXRoZXIgdG8gY29ubmVjdCBkaXNjb250aW51aXRpZXMgd2l0aCBub3RoaW5nIG9yIGEgZGFzaGVkIGxpbmVcclxuICBjb25uZWN0RGlzY29udGludWl0aWVzOiB7XHJcbiAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogJ25vTGluZScsXHJcbiAgICB2YWxpZFZhbHVlczogQ29ubmVjdERpc2NvbnRpbnVpdGllc1ZhbHVlcyxcclxuICAgIHB1YmxpYzogdHJ1ZVxyXG4gIH0sXHJcblxyXG4gIC8vIEluaXRpYWwgdmFsdWUgb2YgdGhlICdWYWx1ZXMnIHByZWZlcmVuY2UuXHJcbiAgLy8gU2hvd3MgbnVtZXJpY2FsIHZhbHVlcyB3aGVyZXZlciB0aGV5IGFwcGVhciBpbiB0aGUgc2ltOiB0aWNrIGxhYmVscywgdGFuZ2VudC1saW5lIHNsb3BlLCBldGMuXHJcbiAgdmFsdWVzVmlzaWJsZToge1xyXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcclxuICAgIHB1YmxpYzogdHJ1ZVxyXG4gIH0sXHJcblxyXG4gIC8vIEluaXRpYWwgdmFsdWUgb2YgdGhlICdQcmVkaWN0JyBwcmVmZXJlbmNlLlxyXG4gIC8vIERldGVybWluZXMgd2hldGhlciBmZWF0dXJlcyByZWxhdGVkIHRvIHRoZSBwcmVkaWN0IGN1cnZlIGFyZSBzaG93biBpbiB0aGUgVUkuXHJcbiAgcHJlZGljdDoge1xyXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcclxuICAgIHB1YmxpYzogdHJ1ZVxyXG4gIH0sXHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlICdTaG93IGYoeCknIGNoZWNrYm94IHdpbGwgYmUgc2hvd24gd2hlbiBpbiAnUHJlZGljdCcgbW9kZS5cclxuICBoYXNTaG93T3JpZ2luYWxDdXJ2ZUNoZWNrYm94OiB7XHJcbiAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IHRydWUsXHJcbiAgICBwdWJsaWM6IHRydWVcclxuICB9LFxyXG5cclxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gcHJpdmF0ZSAtIGZvciBpbnRlcm5hbCB1c2Ugb25seVxyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIEN1cnZlcyBmb3IgJ0NhbGN1bHVzIEdyYXBoZXInIGFyZSBkaXNjcmV0aXplZCBpbnRvIGVxdWFsbHkgc3BhY2VkIHBvaW50cy4gVGhlIGhpZ2hlciB0aGUgbnVtYmVyT2ZQb2ludHNcclxuICAgKiB0aGUgbW9yZSBmYWl0aGZ1bCBpcyB0aGUgcmVwcm9kdWN0aW9uIG9mIGEgY3VydmUuIEZvciB2YWx1ZXMgbGVzcyB0aGFuIDQwMCBwb2ludHMsIG9kZGl0aWVzXHJcbiAgICogYXJlIGFwcGFyZW50IGZvciB0aGUgdW5kZXJUaGVDdXJ2ZVRvb2wgYW5kIHRhbmdlbnRUb29sIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhbGN1bHVzLWdyYXBoZXIvaXNzdWVzLzE3NilcclxuICAgKi9cclxuICBudW1iZXJPZlBvaW50czoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHZhbHVlID4gMCxcclxuICAgIGRlZmF1bHRWYWx1ZTogMTI1MVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBzbW9vdGggYWxnb3JpdGhtIGZvciAnQ2FsY3VsdXMgR3JhcGhlcicgdXNlcyBhIHByb2NlZHVyZSBkZXNjcmliZWQgaW4gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvS2VybmVsX3Ntb290aGVyLlxyXG4gICAqIHVzaW5nIGEgR2F1c3NpYW4ga2VybmVsLiBUaGUgdmFsdWUgYmVsb3cgaXMgdGhlIHN0YW5kYXJkIGRldmlhdGlvbiBvZiB0aGUgR2F1c3NpYW4gZnVuY3Rpb24ga2VybmVsLlxyXG4gICAqIFRoZSBsYXJnZXIgdGhlIHN0YW5kYXJkIGRldmlhdGlvbiBpcywgdGhlIHNtb290aGVyIHRoZSBmdW5jdGlvbi5cclxuICAgKi9cclxuICBzbW9vdGhpbmdTdGFuZGFyZERldmlhdGlvbjoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHZhbHVlID4gMCxcclxuICAgIGRlZmF1bHRWYWx1ZTogMC4wMDUgKiBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuQ1VSVkVfWF9SQU5HRS5nZXRMZW5ndGgoKVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBwZWRlc3RhbCBtb2RlIGNyZWF0ZXMgYSBzbW9vdGggYW5kIGNvbnRpbnVvdXMgdHJhcGV6b2lkYWwtc2hhcGVkIGN1cnZlIHdpdGggcm91bmRlZCBjb3JuZXJzLlxyXG4gICAqIFRoZSByb3VuZGVkIGNvcm5lcnMgYXJlIHNldCBieSBhIGNvbnN0YW50IGNhbGxlZCBlZGdlU2xvcGVGYWN0b3IuXHJcbiAgICogQSBsYXJnZXIgdmFsdWUgY3JlYXRlcyBhIHdpZGVyIGVkZ2UuXHJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhbGN1bHVzLWdyYXBoZXIvaXNzdWVzLzc1XHJcbiAgICovXHJcbiAgZWRnZVNsb3BlRmFjdG9yOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdmFsdWUgPj0gMCxcclxuICAgIGRlZmF1bHRWYWx1ZTogMC4wNCAqIENhbGN1bHVzR3JhcGhlckNvbnN0YW50cy5DVVJWRV9YX1JBTkdFLmdldExlbmd0aCgpXHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIG1heGltdW0gdGlsdGluZyAoc2xvcGUpIG9mIGN1cnZlcyByZWxhdGl2ZSB0byB0aGUgaG9yaXpvbnRhbC4gVXNlZCBmb3IgVGlsdCBpbiBDdXJ2ZSBNYW5pcHVsYXRpb24gTW9kZVxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2FsY3VsdXMtZ3JhcGhlci9pc3N1ZXMvMjZcclxuICAgKi9cclxuICBtYXhUaWx0OiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdmFsdWUgPiAwLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAzXHJcbiAgfSxcclxuXHJcbiAgLy8gU2hvd3MgYWxsIHRoZSBjdXJ2ZSBwb2ludHMgYXMgY2lyY2xlcyBpbiBhIHNjYXR0ZXIgcGxvdC5cclxuICBhbGxQb2ludHM6IHtcclxuICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogZmFsc2VcclxuICB9LFxyXG5cclxuICAvLyBTaG93cyB0aGUgY3VzcCBwb2ludHMgb24gYSBjdXJ2ZSBhcyBjaXJjbGVzIGluIGEgc2NhdHRlciBwbG90XHJcbiAgY3VzcFBvaW50czoge1xyXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgZGVmYXVsdFZhbHVlOiBmYWxzZVxyXG4gIH0sXHJcblxyXG4gIC8vIEZvciBkZWJ1Z2dpbmcsIHRvIG1ha2UgYWxsIExhYmVsZWRMaW5lIGluc3RhbmNlcyBpbml0aWFsbHkgdmlzaWJsZS5cclxuICBsYWJlbGVkTGluZXNWaXNpYmxlOiB7XHJcbiAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IGZhbHNlXHJcbiAgfSxcclxuXHJcbiAgLy8gRm9yIGRlYnVnZ2luZywgdG8gbWFrZSBhbGwgTGFiZWxlZFBvaW50IGluc3RhbmNlcyBpbml0aWFsbHkgdmlzaWJsZS5cclxuICBsYWJlbGVkUG9pbnRzVmlzaWJsZToge1xyXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgZGVmYXVsdFZhbHVlOiBmYWxzZVxyXG4gIH0sXHJcblxyXG4gIC8vIEFscGhhIGZvciBDYWxjdWx1c0dyYXBoZXJDb2xvcnMuaW50ZWdyYWxQb3NpdGl2ZUZpbGxQcm9wZXJ0eSwgc28gdGhhdCBQaEVUIGRlc2lnbmVyIGNhbiBmaW5lLXR1bmVcclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhbGN1bHVzLWdyYXBoZXIvaXNzdWVzLzE2NlxyXG4gIHBvc2l0aXZlQWxwaGE6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgaXNWYWxpZFZhbHVlOiBhbHBoYSA9PiAoIGFscGhhID4gMCAmJiBhbHBoYSA8PSAxICksXHJcbiAgICBkZWZhdWx0VmFsdWU6IDAuMjVcclxuICB9LFxyXG5cclxuICAvLyBBbHBoYSBmb3IgQ2FsY3VsdXNHcmFwaGVyQ29sb3JzLmludGVncmFsUG9zaXRpdmVGaWxsUHJvcGVydHksIHNvIHRoYXQgUGhFVCBkZXNpZ25lciBjYW4gZmluZS10dW5lXHJcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jYWxjdWx1cy1ncmFwaGVyL2lzc3Vlcy8xNjZcclxuICBuZWdhdGl2ZUFscGhhOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGlzVmFsaWRWYWx1ZTogYWxwaGEgPT4gKCBhbHBoYSA+IDAgJiYgYWxwaGEgPD0gMSApLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAwLjU1XHJcbiAgfVxyXG59ICk7XHJcblxyXG5jYWxjdWx1c0dyYXBoZXIucmVnaXN0ZXIoICdDYWxjdWx1c0dyYXBoZXJRdWVyeVBhcmFtZXRlcnMnLCBDYWxjdWx1c0dyYXBoZXJRdWVyeVBhcmFtZXRlcnMgKTtcclxuXHJcbi8vIExvZyBxdWVyeSBwYXJhbWV0ZXJzXHJcbmxvZ0dsb2JhbCggJ3BoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMnICk7XHJcbmxvZ0dsb2JhbCggJ3BoZXQucHJlbG9hZHMucGhldGlvLnF1ZXJ5UGFyYW1ldGVycycgKTtcclxubG9nR2xvYmFsKCAncGhldC5jYWxjdWx1c0dyYXBoZXIuQ2FsY3VsdXNHcmFwaGVyUXVlcnlQYXJhbWV0ZXJzJyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2Fs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