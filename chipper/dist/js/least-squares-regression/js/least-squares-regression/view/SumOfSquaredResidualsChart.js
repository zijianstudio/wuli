// Copyright 2014-2022, University of Colorado Boulder

/**
 * A Scenery Node that represents a barometer chart of the sum of square residuals .
 *
 * @author Martin Veillette (Berea College)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Line, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionStrings from '../../LeastSquaresRegressionStrings.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';
const sumString = LeastSquaresRegressionStrings.sum;

// constants
const ARROW_LENGTH = 175;
const ARROW_HEAD_WIDTH = 4;
const ARROW_HEAD_HEIGHT = 6;
const RECTANGLE_BAROMETER_HEIGHT = 10;
const LINE_WIDTH = 1;
const LINE_COLOR = 'black';
const FONT = LeastSquaresRegressionConstants.SUM_RESIDUALS_FONT;
class SumOfSquaredResidualsChart extends Node {
  /**
   * @param {Graph} graph - model of a graph
   * @param {Function} getSumOfSquaredResiduals
   * @param {Emitter} dataPointsAddedEmitter
   * @param {Color} fillColor
   * @param {Property.<boolean>} visibleProperty
   * @param {Object} [Options]
   */
  constructor(graph, getSumOfSquaredResiduals, dataPointsAddedEmitter, fillColor, visibleProperty, options) {
    options = merge({
      maxLabelWidth: 150
    }, options);
    super(options);

    // The barometer chart is on its side, set width to 1 , will update it momentarily
    const rectangleBarometer = new Rectangle(0, 0, 1, RECTANGLE_BAROMETER_HEIGHT, {
      fill: fillColor,
      bottom: -LINE_WIDTH,
      left: LINE_WIDTH / 2
    });

    // Create the chart
    const horizontalArrow = new ArrowNode(0, 0, ARROW_LENGTH, 0, {
      tailWidth: LINE_WIDTH,
      headWidth: ARROW_HEAD_WIDTH,
      headHeight: ARROW_HEAD_HEIGHT
    });
    const verticalLine = new Line(0, 0, 0, -2 * RECTANGLE_BAROMETER_HEIGHT, {
      lineWidth: LINE_WIDTH,
      stroke: LINE_COLOR
    });

    // Text for the chart
    const label = new Text(sumString, {
      font: FONT,
      centerX: horizontalArrow.centerX,
      top: horizontalArrow.bottom + 5,
      maxWidth: options.maxLabelWidth
    });
    const zeroLabel = new Text('0', {
      font: FONT,
      centerX: horizontalArrow.left,
      top: horizontalArrow.bottom + 5
    });

    /**
     * For an input value ranging from 0 to infinity, the tanh function will return a value ranging between 0 and 1
     * @param {number} x
     * @returns {number}
     */
    function tanh(x) {
      // this (particular) definition of hyperbolic tan function will work well for large positive x values
      return (1 - Math.exp(-2 * x)) / (1 + Math.exp(-2 * x));
    }

    /**
     * Update the width of the rectangular Barometer
     */
    function updateWidth() {
      // the width of the barometer is a non-linear. we use the tanh function to map an infinite range to a finite range
      // Note that tanh(0.5)=0.46. i.e  approximately 1/2;
      // We want that a sum of squared residuals of 1/8 the area of the visible graph yields a width that reaches
      // half the maximum value hence the value 4=8*1/2 .
      rectangleBarometer.rectWidth = ARROW_LENGTH * tanh(4 * getSumOfSquaredResiduals());
    }

    // The barometer width is adjustable
    // the square of the residuals vary if the position of the point change, points are added/subtracted to the graph and if the line change position
    Multilink.multilink([graph.angleProperty, graph.interceptProperty], (angle, intercept) => {
      updateWidth();
    });

    // Trigger an update after all the points have been added in bulk to the model
    dataPointsAddedEmitter.addListener(updateWidth);

    // Controls the visibility of this node
    // no need to unlink since the chart is present for the lifetime of the sim
    visibleProperty.linkAttribute(this, 'visible');

    // Add all the nodes
    this.addChild(rectangleBarometer);
    this.addChild(verticalLine);
    this.addChild(horizontalArrow);
    this.addChild(zeroLabel);
    this.addChild(label);
    this.updateWidth = updateWidth;
  }

  /**
   * Resets values to their original state
   * @public
   */
  reset() {
    this.updateWidth();
  }
}
leastSquaresRegression.register('SumOfSquaredResidualsChart', SumOfSquaredResidualsChart);
export default SumOfSquaredResidualsChart;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJtZXJnZSIsIkFycm93Tm9kZSIsIkxpbmUiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiVGV4dCIsImxlYXN0U3F1YXJlc1JlZ3Jlc3Npb24iLCJMZWFzdFNxdWFyZXNSZWdyZXNzaW9uU3RyaW5ncyIsIkxlYXN0U3F1YXJlc1JlZ3Jlc3Npb25Db25zdGFudHMiLCJzdW1TdHJpbmciLCJzdW0iLCJBUlJPV19MRU5HVEgiLCJBUlJPV19IRUFEX1dJRFRIIiwiQVJST1dfSEVBRF9IRUlHSFQiLCJSRUNUQU5HTEVfQkFST01FVEVSX0hFSUdIVCIsIkxJTkVfV0lEVEgiLCJMSU5FX0NPTE9SIiwiRk9OVCIsIlNVTV9SRVNJRFVBTFNfRk9OVCIsIlN1bU9mU3F1YXJlZFJlc2lkdWFsc0NoYXJ0IiwiY29uc3RydWN0b3IiLCJncmFwaCIsImdldFN1bU9mU3F1YXJlZFJlc2lkdWFscyIsImRhdGFQb2ludHNBZGRlZEVtaXR0ZXIiLCJmaWxsQ29sb3IiLCJ2aXNpYmxlUHJvcGVydHkiLCJvcHRpb25zIiwibWF4TGFiZWxXaWR0aCIsInJlY3RhbmdsZUJhcm9tZXRlciIsImZpbGwiLCJib3R0b20iLCJsZWZ0IiwiaG9yaXpvbnRhbEFycm93IiwidGFpbFdpZHRoIiwiaGVhZFdpZHRoIiwiaGVhZEhlaWdodCIsInZlcnRpY2FsTGluZSIsImxpbmVXaWR0aCIsInN0cm9rZSIsImxhYmVsIiwiZm9udCIsImNlbnRlclgiLCJ0b3AiLCJtYXhXaWR0aCIsInplcm9MYWJlbCIsInRhbmgiLCJ4IiwiTWF0aCIsImV4cCIsInVwZGF0ZVdpZHRoIiwicmVjdFdpZHRoIiwibXVsdGlsaW5rIiwiYW5nbGVQcm9wZXJ0eSIsImludGVyY2VwdFByb3BlcnR5IiwiYW5nbGUiLCJpbnRlcmNlcHQiLCJhZGRMaXN0ZW5lciIsImxpbmtBdHRyaWJ1dGUiLCJhZGRDaGlsZCIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTdW1PZlNxdWFyZWRSZXNpZHVhbHNDaGFydC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIFNjZW5lcnkgTm9kZSB0aGF0IHJlcHJlc2VudHMgYSBiYXJvbWV0ZXIgY2hhcnQgb2YgdGhlIHN1bSBvZiBzcXVhcmUgcmVzaWR1YWxzIC5cclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IHsgTGluZSwgTm9kZSwgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGxlYXN0U3F1YXJlc1JlZ3Jlc3Npb24gZnJvbSAnLi4vLi4vbGVhc3RTcXVhcmVzUmVncmVzc2lvbi5qcyc7XHJcbmltcG9ydCBMZWFzdFNxdWFyZXNSZWdyZXNzaW9uU3RyaW5ncyBmcm9tICcuLi8uLi9MZWFzdFNxdWFyZXNSZWdyZXNzaW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBMZWFzdFNxdWFyZXNSZWdyZXNzaW9uQ29uc3RhbnRzIGZyb20gJy4uL0xlYXN0U3F1YXJlc1JlZ3Jlc3Npb25Db25zdGFudHMuanMnO1xyXG5cclxuY29uc3Qgc3VtU3RyaW5nID0gTGVhc3RTcXVhcmVzUmVncmVzc2lvblN0cmluZ3Muc3VtO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEFSUk9XX0xFTkdUSCA9IDE3NTtcclxuY29uc3QgQVJST1dfSEVBRF9XSURUSCA9IDQ7XHJcbmNvbnN0IEFSUk9XX0hFQURfSEVJR0hUID0gNjtcclxuY29uc3QgUkVDVEFOR0xFX0JBUk9NRVRFUl9IRUlHSFQgPSAxMDtcclxuY29uc3QgTElORV9XSURUSCA9IDE7XHJcbmNvbnN0IExJTkVfQ09MT1IgPSAnYmxhY2snO1xyXG5jb25zdCBGT05UID0gTGVhc3RTcXVhcmVzUmVncmVzc2lvbkNvbnN0YW50cy5TVU1fUkVTSURVQUxTX0ZPTlQ7XHJcblxyXG5jbGFzcyBTdW1PZlNxdWFyZWRSZXNpZHVhbHNDaGFydCBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7R3JhcGh9IGdyYXBoIC0gbW9kZWwgb2YgYSBncmFwaFxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFN1bU9mU3F1YXJlZFJlc2lkdWFsc1xyXG4gICAqIEBwYXJhbSB7RW1pdHRlcn0gZGF0YVBvaW50c0FkZGVkRW1pdHRlclxyXG4gICAqIEBwYXJhbSB7Q29sb3J9IGZpbGxDb2xvclxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSB2aXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW09wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGdyYXBoLCBnZXRTdW1PZlNxdWFyZWRSZXNpZHVhbHMsIGRhdGFQb2ludHNBZGRlZEVtaXR0ZXIsIGZpbGxDb2xvciwgdmlzaWJsZVByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBtYXhMYWJlbFdpZHRoOiAxNTBcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFRoZSBiYXJvbWV0ZXIgY2hhcnQgaXMgb24gaXRzIHNpZGUsIHNldCB3aWR0aCB0byAxICwgd2lsbCB1cGRhdGUgaXQgbW9tZW50YXJpbHlcclxuICAgIGNvbnN0IHJlY3RhbmdsZUJhcm9tZXRlciA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEsIFJFQ1RBTkdMRV9CQVJPTUVURVJfSEVJR0hULCB7XHJcbiAgICAgIGZpbGw6IGZpbGxDb2xvcixcclxuICAgICAgYm90dG9tOiAtTElORV9XSURUSCxcclxuICAgICAgbGVmdDogTElORV9XSURUSCAvIDJcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGNoYXJ0XHJcbiAgICBjb25zdCBob3Jpem9udGFsQXJyb3cgPSBuZXcgQXJyb3dOb2RlKCAwLCAwLCBBUlJPV19MRU5HVEgsIDAsIHtcclxuICAgICAgdGFpbFdpZHRoOiBMSU5FX1dJRFRILFxyXG4gICAgICBoZWFkV2lkdGg6IEFSUk9XX0hFQURfV0lEVEgsXHJcbiAgICAgIGhlYWRIZWlnaHQ6IEFSUk9XX0hFQURfSEVJR0hUXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCB2ZXJ0aWNhbExpbmUgPSBuZXcgTGluZSggMCwgMCwgMCwgLTIgKiBSRUNUQU5HTEVfQkFST01FVEVSX0hFSUdIVCwge1xyXG4gICAgICBsaW5lV2lkdGg6IExJTkVfV0lEVEgsXHJcbiAgICAgIHN0cm9rZTogTElORV9DT0xPUlxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRleHQgZm9yIHRoZSBjaGFydFxyXG4gICAgY29uc3QgbGFiZWwgPSBuZXcgVGV4dCggc3VtU3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IEZPTlQsXHJcbiAgICAgIGNlbnRlclg6IGhvcml6b250YWxBcnJvdy5jZW50ZXJYLFxyXG4gICAgICB0b3A6IGhvcml6b250YWxBcnJvdy5ib3R0b20gKyA1LFxyXG4gICAgICBtYXhXaWR0aDogb3B0aW9ucy5tYXhMYWJlbFdpZHRoXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCB6ZXJvTGFiZWwgPSBuZXcgVGV4dCggJzAnLCB7IGZvbnQ6IEZPTlQsIGNlbnRlclg6IGhvcml6b250YWxBcnJvdy5sZWZ0LCB0b3A6IGhvcml6b250YWxBcnJvdy5ib3R0b20gKyA1IH0gKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZvciBhbiBpbnB1dCB2YWx1ZSByYW5naW5nIGZyb20gMCB0byBpbmZpbml0eSwgdGhlIHRhbmggZnVuY3Rpb24gd2lsbCByZXR1cm4gYSB2YWx1ZSByYW5naW5nIGJldHdlZW4gMCBhbmQgMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHRhbmgoIHggKSB7XHJcbiAgICAgIC8vIHRoaXMgKHBhcnRpY3VsYXIpIGRlZmluaXRpb24gb2YgaHlwZXJib2xpYyB0YW4gZnVuY3Rpb24gd2lsbCB3b3JrIHdlbGwgZm9yIGxhcmdlIHBvc2l0aXZlIHggdmFsdWVzXHJcbiAgICAgIHJldHVybiAoIDEgLSBNYXRoLmV4cCggLTIgKiB4ICkgKSAvICggMSArIE1hdGguZXhwKCAtMiAqIHggKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIHRoZSB3aWR0aCBvZiB0aGUgcmVjdGFuZ3VsYXIgQmFyb21ldGVyXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZVdpZHRoKCkge1xyXG4gICAgICAvLyB0aGUgd2lkdGggb2YgdGhlIGJhcm9tZXRlciBpcyBhIG5vbi1saW5lYXIuIHdlIHVzZSB0aGUgdGFuaCBmdW5jdGlvbiB0byBtYXAgYW4gaW5maW5pdGUgcmFuZ2UgdG8gYSBmaW5pdGUgcmFuZ2VcclxuICAgICAgLy8gTm90ZSB0aGF0IHRhbmgoMC41KT0wLjQ2LiBpLmUgIGFwcHJveGltYXRlbHkgMS8yO1xyXG4gICAgICAvLyBXZSB3YW50IHRoYXQgYSBzdW0gb2Ygc3F1YXJlZCByZXNpZHVhbHMgb2YgMS84IHRoZSBhcmVhIG9mIHRoZSB2aXNpYmxlIGdyYXBoIHlpZWxkcyBhIHdpZHRoIHRoYXQgcmVhY2hlc1xyXG4gICAgICAvLyBoYWxmIHRoZSBtYXhpbXVtIHZhbHVlIGhlbmNlIHRoZSB2YWx1ZSA0PTgqMS8yIC5cclxuICAgICAgcmVjdGFuZ2xlQmFyb21ldGVyLnJlY3RXaWR0aCA9IEFSUk9XX0xFTkdUSCAqIHRhbmgoIDQgKiBnZXRTdW1PZlNxdWFyZWRSZXNpZHVhbHMoKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoZSBiYXJvbWV0ZXIgd2lkdGggaXMgYWRqdXN0YWJsZVxyXG4gICAgLy8gdGhlIHNxdWFyZSBvZiB0aGUgcmVzaWR1YWxzIHZhcnkgaWYgdGhlIHBvc2l0aW9uIG9mIHRoZSBwb2ludCBjaGFuZ2UsIHBvaW50cyBhcmUgYWRkZWQvc3VidHJhY3RlZCB0byB0aGUgZ3JhcGggYW5kIGlmIHRoZSBsaW5lIGNoYW5nZSBwb3NpdGlvblxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBncmFwaC5hbmdsZVByb3BlcnR5LCBncmFwaC5pbnRlcmNlcHRQcm9wZXJ0eSBdLCAoIGFuZ2xlLCBpbnRlcmNlcHQgKSA9PiB7XHJcbiAgICAgIHVwZGF0ZVdpZHRoKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVHJpZ2dlciBhbiB1cGRhdGUgYWZ0ZXIgYWxsIHRoZSBwb2ludHMgaGF2ZSBiZWVuIGFkZGVkIGluIGJ1bGsgdG8gdGhlIG1vZGVsXHJcbiAgICBkYXRhUG9pbnRzQWRkZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB1cGRhdGVXaWR0aCApO1xyXG5cclxuICAgIC8vIENvbnRyb2xzIHRoZSB2aXNpYmlsaXR5IG9mIHRoaXMgbm9kZVxyXG4gICAgLy8gbm8gbmVlZCB0byB1bmxpbmsgc2luY2UgdGhlIGNoYXJ0IGlzIHByZXNlbnQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICB2aXNpYmxlUHJvcGVydHkubGlua0F0dHJpYnV0ZSggdGhpcywgJ3Zpc2libGUnICk7XHJcblxyXG4gICAgLy8gQWRkIGFsbCB0aGUgbm9kZXNcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlY3RhbmdsZUJhcm9tZXRlciApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdmVydGljYWxMaW5lICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBob3Jpem9udGFsQXJyb3cgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHplcm9MYWJlbCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGFiZWwgKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZVdpZHRoID0gdXBkYXRlV2lkdGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdmFsdWVzIHRvIHRoZWlyIG9yaWdpbmFsIHN0YXRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy51cGRhdGVXaWR0aCgpO1xyXG4gIH1cclxufVxyXG5cclxubGVhc3RTcXVhcmVzUmVncmVzc2lvbi5yZWdpc3RlciggJ1N1bU9mU3F1YXJlZFJlc2lkdWFsc0NoYXJ0JywgU3VtT2ZTcXVhcmVkUmVzaWR1YWxzQ2hhcnQgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFN1bU9mU3F1YXJlZFJlc2lkdWFsc0NoYXJ0OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQy9FLE9BQU9DLHNCQUFzQixNQUFNLGlDQUFpQztBQUNwRSxPQUFPQyw2QkFBNkIsTUFBTSx3Q0FBd0M7QUFDbEYsT0FBT0MsK0JBQStCLE1BQU0sdUNBQXVDO0FBRW5GLE1BQU1DLFNBQVMsR0FBR0YsNkJBQTZCLENBQUNHLEdBQUc7O0FBRW5EO0FBQ0EsTUFBTUMsWUFBWSxHQUFHLEdBQUc7QUFDeEIsTUFBTUMsZ0JBQWdCLEdBQUcsQ0FBQztBQUMxQixNQUFNQyxpQkFBaUIsR0FBRyxDQUFDO0FBQzNCLE1BQU1DLDBCQUEwQixHQUFHLEVBQUU7QUFDckMsTUFBTUMsVUFBVSxHQUFHLENBQUM7QUFDcEIs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