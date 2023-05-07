// Copyright 2015-2023, University of Colorado Boulder

/**
 * Barometer for X^2 (chi square) deviation.
 * Linear dependence in [ 0; 1 ] interval,
 * Logarithmic dependence in ( 1; 100 ] interval.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { ColorDef } from '../../../../scenery/js/imports.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';
import BarometerNode from './BarometerNode.js';

// constants
const ARROW_OFFSET = 6;
const ARROW_HEAD_HEIGHT = 12;
const ARROW_HEAD_WIDTH = 8;
const ARROW_TAIL_WIDTH = 0.5;
const BAROMETER_HEIGHT = CurveFittingConstants.BAROMETER_AXIS_HEIGHT - ARROW_HEAD_HEIGHT - ARROW_OFFSET;
const BAROMETER_TICK_WIDTH = 10;
const MAX_CHI_SQUARED_VALUE = 100;

// arrays necessary for calculating chi value bounds while getting barometer color
const LOWER_LIMIT_ARRAY = [0.004, 0.052, 0.118, 0.178, 0.23, 0.273, 0.31, 0.342, 0.369, 0.394, 0.545, 0.695, 0.779, 0.927];
const UPPER_LIMIT_ARRAY = [3.8, 3, 2.6, 2.37, 2.21, 2.1, 2.01, 1.94, 1.88, 1.83, 1.57, 1.35, 1.24, 1.07];
class BarometerX2Node extends BarometerNode {
  /**
   * @param {Points} points
   * @param {Property.<number>} chiSquaredProperty - Property that represents x squared deviation.
   * @param {Property.<boolean>} curveVisibleProperty
   */
  constructor(points, chiSquaredProperty, curveVisibleProperty) {
    // sets up a map of position along barometer (a ratio from 0 to 1) to chi squared value (0, 0.5, 1, 2, 3, 10, 30, 100)
    const tickPositionsToLabels = {
      0: '0'
    };
    [0.5, 1, 2, 3, 10, 30, 100].forEach(chiSquaredValue => {
      const chiSquaredPosition = chiSquaredValueToRatio(chiSquaredValue);
      tickPositionsToLabels[chiSquaredPosition] = chiSquaredValue;
    });

    // links up listeners to properties that map chi squared values to fill ratios and colors
    // dispose unnecessary because BarometerX2 is present for the lifetime of the simulation
    const fillProportionProperty = new DerivedProperty([chiSquaredProperty], chiSquaredValueToRatio, {
      valueType: 'number'
    });
    const fillColorProperty = new DerivedProperty([chiSquaredProperty], chiSquaredValue => getFillColorFromChiSquaredValue(chiSquaredValue, points.length), {
      isValidValue: value => ColorDef.isColorDef(value)
    });

    // calls the superclass's constructor that initializes BarometerX2Node as a BarometerNode
    super(fillProportionProperty, curveVisibleProperty, tickPositionsToLabels, {
      fill: fillColorProperty,
      axisHeight: BAROMETER_HEIGHT,
      tickWidth: BAROMETER_TICK_WIDTH
    });

    // adds the arrow to the top of this BarometerX2Node to show that the values can extend past 100
    const topArrow = new ArrowNode(0, 0, 0, -BAROMETER_HEIGHT - ARROW_HEAD_HEIGHT * 1.5, {
      headHeight: ARROW_HEAD_HEIGHT,
      headWidth: ARROW_HEAD_WIDTH,
      tailWidth: ARROW_TAIL_WIDTH
    });
    this.addChild(topArrow);
  }
}

/**
 * Convert X^2 values into barometer color depending on number of points.
 * This algorithm was copied directly from Flash simulation.
 *
 * @param {number} chiSquaredValue - X^2 value.
 * @param {number} numberOfPoints - Number of points on Graph.
 * @returns {string} rgb color string
 */
function getFillColorFromChiSquaredValue(chiSquaredValue, numberOfPoints) {
  let red;
  let green;
  let blue;
  let lowerBound;
  let upperBound;
  if (numberOfPoints >= 1 && numberOfPoints < 11) {
    lowerBound = LOWER_LIMIT_ARRAY[numberOfPoints - 1];
    upperBound = UPPER_LIMIT_ARRAY[numberOfPoints - 1];
  } else if (numberOfPoints >= 11 || numberOfPoints < 20) {
    lowerBound = (LOWER_LIMIT_ARRAY[9] + LOWER_LIMIT_ARRAY[10]) / 2;
    upperBound = (UPPER_LIMIT_ARRAY[9] + UPPER_LIMIT_ARRAY[10]) / 2;
  } else if (numberOfPoints >= 20 || numberOfPoints < 50) {
    lowerBound = (LOWER_LIMIT_ARRAY[10] + LOWER_LIMIT_ARRAY[11]) / 2;
    upperBound = (UPPER_LIMIT_ARRAY[10] + UPPER_LIMIT_ARRAY[11]) / 2;
  } else if (numberOfPoints >= 50) {
    lowerBound = LOWER_LIMIT_ARRAY[12];
    upperBound = UPPER_LIMIT_ARRAY[12];
  }
  const step1 = (1 + upperBound) / 2;
  const step2 = (lowerBound + 1) / 2;
  const step3 = (upperBound + step1) / 2;
  const step4 = (lowerBound + step2) / 2;
  if (chiSquaredValue < lowerBound) {
    red = 0;
    green = 0;
    blue = 1;
  } else if (chiSquaredValue >= lowerBound && chiSquaredValue < step4) {
    red = 0;
    green = (chiSquaredValue - lowerBound) / (step4 - lowerBound);
    blue = 1;
  } else if (chiSquaredValue >= step4 && chiSquaredValue < step2) {
    blue = (step2 - chiSquaredValue) / (step2 - step4);
    green = 1;
    red = 0;
  } else if (chiSquaredValue >= step2 && chiSquaredValue <= step1) {
    red = 0;
    green = 1;
    blue = 0;
  } else if (chiSquaredValue > step1 && chiSquaredValue < step3) {
    red = (chiSquaredValue - step1) / (step3 - step1);
    green = 1;
    blue = 0;
  } else if (chiSquaredValue >= step3 && chiSquaredValue < upperBound) {
    red = 1;
    green = (upperBound - chiSquaredValue) / (upperBound - step3);
    blue = 0;
  } else if (chiSquaredValue >= upperBound) {
    red = 1;
    green = 0;
    blue = 0;
  }
  red *= 255;
  blue *= 255;
  green *= 255;
  return `rgb( ${Utils.roundSymmetric(red)}, ${Utils.roundSymmetric(green)}, ${Utils.roundSymmetric(blue)} )`;
}

/**
 * Convert X^2 value to a corresponding fill ratio
 * X^2 scales linearly when less than 1, and logarithmically afterwards
 *
 * @param {number} value - Barometer's X^2 value.
 * @returns {number} ratio between 0 and 1 for how much the barometer should be filled
 */
function chiSquaredValueToRatio(value) {
  if (value <= 1) {
    return value / (1 + Math.log(MAX_CHI_SQUARED_VALUE));
  } else {
    // logarithmic scaling for X^2 values greater than 1, but returned ratio is capped at 1.023
    // 1.023 is cap because bar can extend past top of barometer (see #136)
    // 1.023 was empirically determined to line up with arrow base
    return Math.min(1.023, (1 + Math.log(value)) / (1 + Math.log(MAX_CHI_SQUARED_VALUE)));
  }
}
curveFitting.register('BarometerX2Node', BarometerX2Node);
export default BarometerX2Node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJVdGlscyIsIkFycm93Tm9kZSIsIkNvbG9yRGVmIiwiY3VydmVGaXR0aW5nIiwiQ3VydmVGaXR0aW5nQ29uc3RhbnRzIiwiQmFyb21ldGVyTm9kZSIsIkFSUk9XX09GRlNFVCIsIkFSUk9XX0hFQURfSEVJR0hUIiwiQVJST1dfSEVBRF9XSURUSCIsIkFSUk9XX1RBSUxfV0lEVEgiLCJCQVJPTUVURVJfSEVJR0hUIiwiQkFST01FVEVSX0FYSVNfSEVJR0hUIiwiQkFST01FVEVSX1RJQ0tfV0lEVEgiLCJNQVhfQ0hJX1NRVUFSRURfVkFMVUUiLCJMT1dFUl9MSU1JVF9BUlJBWSIsIlVQUEVSX0xJTUlUX0FSUkFZIiwiQmFyb21ldGVyWDJOb2RlIiwiY29uc3RydWN0b3IiLCJwb2ludHMiLCJjaGlTcXVhcmVkUHJvcGVydHkiLCJjdXJ2ZVZpc2libGVQcm9wZXJ0eSIsInRpY2tQb3NpdGlvbnNUb0xhYmVscyIsImZvckVhY2giLCJjaGlTcXVhcmVkVmFsdWUiLCJjaGlTcXVhcmVkUG9zaXRpb24iLCJjaGlTcXVhcmVkVmFsdWVUb1JhdGlvIiwiZmlsbFByb3BvcnRpb25Qcm9wZXJ0eSIsInZhbHVlVHlwZSIsImZpbGxDb2xvclByb3BlcnR5IiwiZ2V0RmlsbENvbG9yRnJvbUNoaVNxdWFyZWRWYWx1ZSIsImxlbmd0aCIsImlzVmFsaWRWYWx1ZSIsInZhbHVlIiwiaXNDb2xvckRlZiIsImZpbGwiLCJheGlzSGVpZ2h0IiwidGlja1dpZHRoIiwidG9wQXJyb3ciLCJoZWFkSGVpZ2h0IiwiaGVhZFdpZHRoIiwidGFpbFdpZHRoIiwiYWRkQ2hpbGQiLCJudW1iZXJPZlBvaW50cyIsInJlZCIsImdyZWVuIiwiYmx1ZSIsImxvd2VyQm91bmQiLCJ1cHBlckJvdW5kIiwic3RlcDEiLCJzdGVwMiIsInN0ZXAzIiwic3RlcDQiLCJyb3VuZFN5bW1ldHJpYyIsIk1hdGgiLCJsb2ciLCJtaW4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJhcm9tZXRlclgyTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXJvbWV0ZXIgZm9yIFheMiAoY2hpIHNxdWFyZSkgZGV2aWF0aW9uLlxyXG4gKiBMaW5lYXIgZGVwZW5kZW5jZSBpbiBbIDA7IDEgXSBpbnRlcnZhbCxcclxuICogTG9nYXJpdGhtaWMgZGVwZW5kZW5jZSBpbiAoIDE7IDEwMCBdIGludGVydmFsLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFuZHJleSBaZWxlbmtvdiAoTWxlYXJuZXIpXHJcbiAqIEBhdXRob3IgU2F1cmFiaCBUb3RleVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IHsgQ29sb3JEZWYgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY3VydmVGaXR0aW5nIGZyb20gJy4uLy4uL2N1cnZlRml0dGluZy5qcyc7XHJcbmltcG9ydCBDdXJ2ZUZpdHRpbmdDb25zdGFudHMgZnJvbSAnLi4vQ3VydmVGaXR0aW5nQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJhcm9tZXRlck5vZGUgZnJvbSAnLi9CYXJvbWV0ZXJOb2RlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBBUlJPV19PRkZTRVQgPSA2O1xyXG5jb25zdCBBUlJPV19IRUFEX0hFSUdIVCA9IDEyO1xyXG5jb25zdCBBUlJPV19IRUFEX1dJRFRIID0gODtcclxuY29uc3QgQVJST1dfVEFJTF9XSURUSCA9IDAuNTtcclxuY29uc3QgQkFST01FVEVSX0hFSUdIVCA9IEN1cnZlRml0dGluZ0NvbnN0YW50cy5CQVJPTUVURVJfQVhJU19IRUlHSFQgLSBBUlJPV19IRUFEX0hFSUdIVCAtIEFSUk9XX09GRlNFVDtcclxuY29uc3QgQkFST01FVEVSX1RJQ0tfV0lEVEggPSAxMDtcclxuY29uc3QgTUFYX0NISV9TUVVBUkVEX1ZBTFVFID0gMTAwO1xyXG5cclxuLy8gYXJyYXlzIG5lY2Vzc2FyeSBmb3IgY2FsY3VsYXRpbmcgY2hpIHZhbHVlIGJvdW5kcyB3aGlsZSBnZXR0aW5nIGJhcm9tZXRlciBjb2xvclxyXG5jb25zdCBMT1dFUl9MSU1JVF9BUlJBWSA9IFsgMC4wMDQsIDAuMDUyLCAwLjExOCwgMC4xNzgsIDAuMjMsIDAuMjczLCAwLjMxLCAwLjM0MiwgMC4zNjksIDAuMzk0LCAwLjU0NSwgMC42OTUsIDAuNzc5LCAwLjkyNyBdO1xyXG5jb25zdCBVUFBFUl9MSU1JVF9BUlJBWSA9IFsgMy44LCAzLCAyLjYsIDIuMzcsIDIuMjEsIDIuMSwgMi4wMSwgMS45NCwgMS44OCwgMS44MywgMS41NywgMS4zNSwgMS4yNCwgMS4wNyBdO1xyXG5cclxuY2xhc3MgQmFyb21ldGVyWDJOb2RlIGV4dGVuZHMgQmFyb21ldGVyTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UG9pbnRzfSBwb2ludHNcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSBjaGlTcXVhcmVkUHJvcGVydHkgLSBQcm9wZXJ0eSB0aGF0IHJlcHJlc2VudHMgeCBzcXVhcmVkIGRldmlhdGlvbi5cclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gY3VydmVWaXNpYmxlUHJvcGVydHlcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcG9pbnRzLCBjaGlTcXVhcmVkUHJvcGVydHksIGN1cnZlVmlzaWJsZVByb3BlcnR5ICkge1xyXG5cclxuICAgIC8vIHNldHMgdXAgYSBtYXAgb2YgcG9zaXRpb24gYWxvbmcgYmFyb21ldGVyIChhIHJhdGlvIGZyb20gMCB0byAxKSB0byBjaGkgc3F1YXJlZCB2YWx1ZSAoMCwgMC41LCAxLCAyLCAzLCAxMCwgMzAsIDEwMClcclxuICAgIGNvbnN0IHRpY2tQb3NpdGlvbnNUb0xhYmVscyA9IHsgMDogJzAnIH07XHJcbiAgICBbIDAuNSwgMSwgMiwgMywgMTAsIDMwLCAxMDAgXS5mb3JFYWNoKCBjaGlTcXVhcmVkVmFsdWUgPT4ge1xyXG4gICAgICBjb25zdCBjaGlTcXVhcmVkUG9zaXRpb24gPSBjaGlTcXVhcmVkVmFsdWVUb1JhdGlvKCBjaGlTcXVhcmVkVmFsdWUgKTtcclxuICAgICAgdGlja1Bvc2l0aW9uc1RvTGFiZWxzWyBjaGlTcXVhcmVkUG9zaXRpb24gXSA9IGNoaVNxdWFyZWRWYWx1ZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBsaW5rcyB1cCBsaXN0ZW5lcnMgdG8gcHJvcGVydGllcyB0aGF0IG1hcCBjaGkgc3F1YXJlZCB2YWx1ZXMgdG8gZmlsbCByYXRpb3MgYW5kIGNvbG9yc1xyXG4gICAgLy8gZGlzcG9zZSB1bm5lY2Vzc2FyeSBiZWNhdXNlIEJhcm9tZXRlclgyIGlzIHByZXNlbnQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltdWxhdGlvblxyXG4gICAgY29uc3QgZmlsbFByb3BvcnRpb25Qcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgY2hpU3F1YXJlZFByb3BlcnR5IF0sIGNoaVNxdWFyZWRWYWx1ZVRvUmF0aW8sIHsgdmFsdWVUeXBlOiAnbnVtYmVyJyB9ICk7XHJcbiAgICBjb25zdCBmaWxsQ29sb3JQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgY2hpU3F1YXJlZFByb3BlcnR5IF0sXHJcbiAgICAgIGNoaVNxdWFyZWRWYWx1ZSA9PiBnZXRGaWxsQ29sb3JGcm9tQ2hpU3F1YXJlZFZhbHVlKCBjaGlTcXVhcmVkVmFsdWUsIHBvaW50cy5sZW5ndGggKSxcclxuICAgICAgeyBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IENvbG9yRGVmLmlzQ29sb3JEZWYoIHZhbHVlICkgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBjYWxscyB0aGUgc3VwZXJjbGFzcydzIGNvbnN0cnVjdG9yIHRoYXQgaW5pdGlhbGl6ZXMgQmFyb21ldGVyWDJOb2RlIGFzIGEgQmFyb21ldGVyTm9kZVxyXG4gICAgc3VwZXIoIGZpbGxQcm9wb3J0aW9uUHJvcGVydHksIGN1cnZlVmlzaWJsZVByb3BlcnR5LCB0aWNrUG9zaXRpb25zVG9MYWJlbHMsIHtcclxuICAgICAgZmlsbDogZmlsbENvbG9yUHJvcGVydHksXHJcbiAgICAgIGF4aXNIZWlnaHQ6IEJBUk9NRVRFUl9IRUlHSFQsXHJcbiAgICAgIHRpY2tXaWR0aDogQkFST01FVEVSX1RJQ0tfV0lEVEhcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhZGRzIHRoZSBhcnJvdyB0byB0aGUgdG9wIG9mIHRoaXMgQmFyb21ldGVyWDJOb2RlIHRvIHNob3cgdGhhdCB0aGUgdmFsdWVzIGNhbiBleHRlbmQgcGFzdCAxMDBcclxuICAgIGNvbnN0IHRvcEFycm93ID0gbmV3IEFycm93Tm9kZSggMCwgMCwgMCwgLUJBUk9NRVRFUl9IRUlHSFQgLSBBUlJPV19IRUFEX0hFSUdIVCAqIDEuNSwge1xyXG4gICAgICBoZWFkSGVpZ2h0OiBBUlJPV19IRUFEX0hFSUdIVCxcclxuICAgICAgaGVhZFdpZHRoOiBBUlJPV19IRUFEX1dJRFRILFxyXG4gICAgICB0YWlsV2lkdGg6IEFSUk9XX1RBSUxfV0lEVEhcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRvcEFycm93ICk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgWF4yIHZhbHVlcyBpbnRvIGJhcm9tZXRlciBjb2xvciBkZXBlbmRpbmcgb24gbnVtYmVyIG9mIHBvaW50cy5cclxuICogVGhpcyBhbGdvcml0aG0gd2FzIGNvcGllZCBkaXJlY3RseSBmcm9tIEZsYXNoIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBjaGlTcXVhcmVkVmFsdWUgLSBYXjIgdmFsdWUuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXJPZlBvaW50cyAtIE51bWJlciBvZiBwb2ludHMgb24gR3JhcGguXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHJnYiBjb2xvciBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIGdldEZpbGxDb2xvckZyb21DaGlTcXVhcmVkVmFsdWUoIGNoaVNxdWFyZWRWYWx1ZSwgbnVtYmVyT2ZQb2ludHMgKSB7XHJcblxyXG4gIGxldCByZWQ7XHJcbiAgbGV0IGdyZWVuO1xyXG4gIGxldCBibHVlO1xyXG4gIGxldCBsb3dlckJvdW5kO1xyXG4gIGxldCB1cHBlckJvdW5kO1xyXG5cclxuICBpZiAoIG51bWJlck9mUG9pbnRzID49IDEgJiYgbnVtYmVyT2ZQb2ludHMgPCAxMSApIHtcclxuICAgIGxvd2VyQm91bmQgPSBMT1dFUl9MSU1JVF9BUlJBWVsgbnVtYmVyT2ZQb2ludHMgLSAxIF07XHJcbiAgICB1cHBlckJvdW5kID0gVVBQRVJfTElNSVRfQVJSQVlbIG51bWJlck9mUG9pbnRzIC0gMSBdO1xyXG4gIH1cclxuICBlbHNlIGlmICggbnVtYmVyT2ZQb2ludHMgPj0gMTEgfHwgbnVtYmVyT2ZQb2ludHMgPCAyMCApIHtcclxuICAgIGxvd2VyQm91bmQgPSAoIExPV0VSX0xJTUlUX0FSUkFZWyA5IF0gKyBMT1dFUl9MSU1JVF9BUlJBWVsgMTAgXSApIC8gMjtcclxuICAgIHVwcGVyQm91bmQgPSAoIFVQUEVSX0xJTUlUX0FSUkFZWyA5IF0gKyBVUFBFUl9MSU1JVF9BUlJBWVsgMTAgXSApIC8gMjtcclxuICB9XHJcbiAgZWxzZSBpZiAoIG51bWJlck9mUG9pbnRzID49IDIwIHx8IG51bWJlck9mUG9pbnRzIDwgNTAgKSB7XHJcbiAgICBsb3dlckJvdW5kID0gKCBMT1dFUl9MSU1JVF9BUlJBWVsgMTAgXSArIExPV0VSX0xJTUlUX0FSUkFZWyAxMSBdICkgLyAyO1xyXG4gICAgdXBwZXJCb3VuZCA9ICggVVBQRVJfTElNSVRfQVJSQVlbIDEwIF0gKyBVUFBFUl9MSU1JVF9BUlJBWVsgMTEgXSApIC8gMjtcclxuICB9XHJcbiAgZWxzZSBpZiAoIG51bWJlck9mUG9pbnRzID49IDUwICkge1xyXG4gICAgbG93ZXJCb3VuZCA9IExPV0VSX0xJTUlUX0FSUkFZWyAxMiBdO1xyXG4gICAgdXBwZXJCb3VuZCA9IFVQUEVSX0xJTUlUX0FSUkFZWyAxMiBdO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc3RlcDEgPSAoIDEgKyB1cHBlckJvdW5kICkgLyAyO1xyXG4gIGNvbnN0IHN0ZXAyID0gKCBsb3dlckJvdW5kICsgMSApIC8gMjtcclxuICBjb25zdCBzdGVwMyA9ICggdXBwZXJCb3VuZCArIHN0ZXAxICkgLyAyO1xyXG4gIGNvbnN0IHN0ZXA0ID0gKCBsb3dlckJvdW5kICsgc3RlcDIgKSAvIDI7XHJcblxyXG4gIGlmICggY2hpU3F1YXJlZFZhbHVlIDwgbG93ZXJCb3VuZCApIHtcclxuICAgIHJlZCA9IDA7XHJcbiAgICBncmVlbiA9IDA7XHJcbiAgICBibHVlID0gMTtcclxuICB9XHJcbiAgZWxzZSBpZiAoIGNoaVNxdWFyZWRWYWx1ZSA+PSBsb3dlckJvdW5kICYmIGNoaVNxdWFyZWRWYWx1ZSA8IHN0ZXA0ICkge1xyXG4gICAgcmVkID0gMDtcclxuICAgIGdyZWVuID0gKCBjaGlTcXVhcmVkVmFsdWUgLSBsb3dlckJvdW5kICkgLyAoIHN0ZXA0IC0gbG93ZXJCb3VuZCApO1xyXG4gICAgYmx1ZSA9IDE7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBjaGlTcXVhcmVkVmFsdWUgPj0gc3RlcDQgJiYgY2hpU3F1YXJlZFZhbHVlIDwgc3RlcDIgKSB7XHJcbiAgICBibHVlID0gKCBzdGVwMiAtIGNoaVNxdWFyZWRWYWx1ZSApIC8gKCBzdGVwMiAtIHN0ZXA0ICk7XHJcbiAgICBncmVlbiA9IDE7XHJcbiAgICByZWQgPSAwO1xyXG4gIH1cclxuICBlbHNlIGlmICggY2hpU3F1YXJlZFZhbHVlID49IHN0ZXAyICYmIGNoaVNxdWFyZWRWYWx1ZSA8PSBzdGVwMSApIHtcclxuICAgIHJlZCA9IDA7XHJcbiAgICBncmVlbiA9IDE7XHJcbiAgICBibHVlID0gMDtcclxuICB9XHJcbiAgZWxzZSBpZiAoIGNoaVNxdWFyZWRWYWx1ZSA+IHN0ZXAxICYmIGNoaVNxdWFyZWRWYWx1ZSA8IHN0ZXAzICkge1xyXG4gICAgcmVkID0gKCBjaGlTcXVhcmVkVmFsdWUgLSBzdGVwMSApIC8gKCBzdGVwMyAtIHN0ZXAxICk7XHJcbiAgICBncmVlbiA9IDE7XHJcbiAgICBibHVlID0gMDtcclxuICB9XHJcbiAgZWxzZSBpZiAoIGNoaVNxdWFyZWRWYWx1ZSA+PSBzdGVwMyAmJiBjaGlTcXVhcmVkVmFsdWUgPCB1cHBlckJvdW5kICkge1xyXG4gICAgcmVkID0gMTtcclxuICAgIGdyZWVuID0gKCB1cHBlckJvdW5kIC0gY2hpU3F1YXJlZFZhbHVlICkgLyAoIHVwcGVyQm91bmQgLSBzdGVwMyApO1xyXG4gICAgYmx1ZSA9IDA7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBjaGlTcXVhcmVkVmFsdWUgPj0gdXBwZXJCb3VuZCApIHtcclxuICAgIHJlZCA9IDE7XHJcbiAgICBncmVlbiA9IDA7XHJcbiAgICBibHVlID0gMDtcclxuICB9XHJcblxyXG4gIHJlZCAqPSAyNTU7XHJcbiAgYmx1ZSAqPSAyNTU7XHJcbiAgZ3JlZW4gKj0gMjU1O1xyXG5cclxuICByZXR1cm4gYHJnYiggJHtVdGlscy5yb3VuZFN5bW1ldHJpYyggcmVkICl9LCAke1V0aWxzLnJvdW5kU3ltbWV0cmljKCBncmVlbiApfSwgJHtVdGlscy5yb3VuZFN5bW1ldHJpYyggYmx1ZSApfSApYDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgWF4yIHZhbHVlIHRvIGEgY29ycmVzcG9uZGluZyBmaWxsIHJhdGlvXHJcbiAqIFheMiBzY2FsZXMgbGluZWFybHkgd2hlbiBsZXNzIHRoYW4gMSwgYW5kIGxvZ2FyaXRobWljYWxseSBhZnRlcndhcmRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIEJhcm9tZXRlcidzIFheMiB2YWx1ZS5cclxuICogQHJldHVybnMge251bWJlcn0gcmF0aW8gYmV0d2VlbiAwIGFuZCAxIGZvciBob3cgbXVjaCB0aGUgYmFyb21ldGVyIHNob3VsZCBiZSBmaWxsZWRcclxuICovXHJcbmZ1bmN0aW9uIGNoaVNxdWFyZWRWYWx1ZVRvUmF0aW8oIHZhbHVlICkge1xyXG4gIGlmICggdmFsdWUgPD0gMSApIHtcclxuICAgIHJldHVybiB2YWx1ZSAvICggMSArIE1hdGgubG9nKCBNQVhfQ0hJX1NRVUFSRURfVkFMVUUgKSApO1xyXG4gIH1cclxuICBlbHNlIHtcclxuXHJcbiAgICAvLyBsb2dhcml0aG1pYyBzY2FsaW5nIGZvciBYXjIgdmFsdWVzIGdyZWF0ZXIgdGhhbiAxLCBidXQgcmV0dXJuZWQgcmF0aW8gaXMgY2FwcGVkIGF0IDEuMDIzXHJcbiAgICAvLyAxLjAyMyBpcyBjYXAgYmVjYXVzZSBiYXIgY2FuIGV4dGVuZCBwYXN0IHRvcCBvZiBiYXJvbWV0ZXIgKHNlZSAjMTM2KVxyXG4gICAgLy8gMS4wMjMgd2FzIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gbGluZSB1cCB3aXRoIGFycm93IGJhc2VcclxuICAgIHJldHVybiBNYXRoLm1pbiggMS4wMjMsICggMSArIE1hdGgubG9nKCB2YWx1ZSApICkgLyAoIDEgKyBNYXRoLmxvZyggTUFYX0NISV9TUVVBUkVEX1ZBTFVFICkgKSApO1xyXG4gIH1cclxufVxyXG5cclxuY3VydmVGaXR0aW5nLnJlZ2lzdGVyKCAnQmFyb21ldGVyWDJOb2RlJywgQmFyb21ldGVyWDJOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJhcm9tZXRlclgyTm9kZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsS0FBSyxNQUFN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