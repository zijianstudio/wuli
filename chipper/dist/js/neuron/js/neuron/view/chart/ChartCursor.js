// Copyright 2014-2022, University of Colorado Boulder

/**
 * This class represents the cursor that the user can grab and move around
 * in order to move the sim back and forth in time.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Utils from '../../../../../dot/js/Utils.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import { Color, Rectangle, SimpleDragHandler } from '../../../../../scenery/js/imports.js';
import neuron from '../../../neuron.js';
import GrippyIndentNode from './GrippyIndentNode.js';

// constants
const WIDTH_PROPORTION = 0.013; // empirically determined
const CURSOR_FILL_COLOR = new Color(50, 50, 200, 0.2);
const CURSOR_STROKE_COLOR = Color.DARK_GRAY;
const CURSOR_STYLE = 'ew-resize';
class ChartCursor extends Rectangle {
  /**
   * @param {MembranePotentialChart} membranePotentialChart
   */
  constructor(membranePotentialChart) {
    const topOfPlotArea = membranePotentialChart.chartMvt.modelToViewPosition(new Vector2(0, membranePotentialChart.range[1]));
    const bottomOfPlotArea = membranePotentialChart.chartMvt.modelToViewPosition(new Vector2(0, membranePotentialChart.range[0]));

    // Set the shape.  The shape is created so that it is centered
    // around an offset of 0 in the x direction and the top edge is
    // at 0 in the y direction.
    const width = membranePotentialChart.chartDimension.width * WIDTH_PROPORTION;
    const height = bottomOfPlotArea.y - topOfPlotArea.y;
    super(-width / 2, 0, width, height, 0, 0, {
      cursor: CURSOR_STYLE,
      fill: CURSOR_FILL_COLOR,
      stroke: CURSOR_STROKE_COLOR,
      lineWidth: 0.4,
      lineDash: [4, 4]
    });

    // Make it easier to grab this cursor by giving it expanded mouse and touch areas.
    this.mouseArea = this.localBounds.dilatedX(12);
    this.touchArea = this.localBounds.dilatedX(12);
    let pressPoint;
    let pressTime;
    const chartCursorDragHandler = new SimpleDragHandler({
      allowTouchSnag: true,
      dragCursor: CURSOR_STYLE,
      start: e => {
        pressPoint = e.currentTarget.globalToParentPoint(e.pointer.point);
        pressTime = membranePotentialChart.chartMvt.viewToModelPosition(new Vector2(this.x, this.y)).x;
        membranePotentialChart.playingWhenDragStarted = membranePotentialChart.clock.playingProperty.get();
        if (membranePotentialChart.playingWhenDragStarted) {
          // The user must be trying to grab the cursor while the sim is running or while recorded content is being
          // played back.  Pause the clock.
          membranePotentialChart.setPlaying(false);
        }
      },
      drag: e => {
        if (!membranePotentialChart.neuronModel.isPlayback()) {
          membranePotentialChart.neuronModel.setPlayback(1); // Set into playback mode.
        }

        const dragPoint = e.currentTarget.globalToParentPoint(e.pointer.point);
        const dx = new Vector2(dragPoint.x - pressPoint.x, dragPoint.y - pressPoint.y);
        const modelDiff = membranePotentialChart.chartMvt.viewToModelPosition(dx);
        let recordingTimeIndex = pressTime + modelDiff.x;
        recordingTimeIndex = Utils.clamp(recordingTimeIndex, 0, membranePotentialChart.getLastTimeValue());
        const compensatedRecordingTimeIndex = recordingTimeIndex / 1000 + membranePotentialChart.neuronModel.getMinRecordedTime();
        membranePotentialChart.neuronModel.setTime(compensatedRecordingTimeIndex);
      },
      end: () => {
        if (membranePotentialChart.playingWhenDragStarted) {
          // The clock was playing when the user grabbed this cursor, so now that they are releasing the cursor we
          // should set the mode back to playing.
          membranePotentialChart.setPlaying(true);
        }
      }
    });
    this.addInputListener(chartCursorDragHandler);

    // Add the indentations that are intended to convey the idea of "gripability".
    const indentSpacing = 0.05 * height;
    const grippyIndent1 = new GrippyIndentNode(width / 2, CURSOR_FILL_COLOR);
    grippyIndent1.translate(0, height / 2 - indentSpacing);
    this.addChild(grippyIndent1);
    const grippyIndent2 = new GrippyIndentNode(width / 2, CURSOR_FILL_COLOR);
    grippyIndent2.translate(0, height / 2);
    this.addChild(grippyIndent2);
    const grippyIndent3 = new GrippyIndentNode(width / 2, CURSOR_FILL_COLOR);
    grippyIndent3.translate(0, height / 2 + indentSpacing);
    this.addChild(grippyIndent3);
  }
}
neuron.register('ChartCursor', ChartCursor);
export default ChartCursor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJDb2xvciIsIlJlY3RhbmdsZSIsIlNpbXBsZURyYWdIYW5kbGVyIiwibmV1cm9uIiwiR3JpcHB5SW5kZW50Tm9kZSIsIldJRFRIX1BST1BPUlRJT04iLCJDVVJTT1JfRklMTF9DT0xPUiIsIkNVUlNPUl9TVFJPS0VfQ09MT1IiLCJEQVJLX0dSQVkiLCJDVVJTT1JfU1RZTEUiLCJDaGFydEN1cnNvciIsImNvbnN0cnVjdG9yIiwibWVtYnJhbmVQb3RlbnRpYWxDaGFydCIsInRvcE9mUGxvdEFyZWEiLCJjaGFydE12dCIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJyYW5nZSIsImJvdHRvbU9mUGxvdEFyZWEiLCJ3aWR0aCIsImNoYXJ0RGltZW5zaW9uIiwiaGVpZ2h0IiwieSIsImN1cnNvciIsImZpbGwiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJsaW5lRGFzaCIsIm1vdXNlQXJlYSIsImxvY2FsQm91bmRzIiwiZGlsYXRlZFgiLCJ0b3VjaEFyZWEiLCJwcmVzc1BvaW50IiwicHJlc3NUaW1lIiwiY2hhcnRDdXJzb3JEcmFnSGFuZGxlciIsImFsbG93VG91Y2hTbmFnIiwiZHJhZ0N1cnNvciIsInN0YXJ0IiwiZSIsImN1cnJlbnRUYXJnZXQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50Iiwidmlld1RvTW9kZWxQb3NpdGlvbiIsIngiLCJwbGF5aW5nV2hlbkRyYWdTdGFydGVkIiwiY2xvY2siLCJwbGF5aW5nUHJvcGVydHkiLCJnZXQiLCJzZXRQbGF5aW5nIiwiZHJhZyIsIm5ldXJvbk1vZGVsIiwiaXNQbGF5YmFjayIsInNldFBsYXliYWNrIiwiZHJhZ1BvaW50IiwiZHgiLCJtb2RlbERpZmYiLCJyZWNvcmRpbmdUaW1lSW5kZXgiLCJjbGFtcCIsImdldExhc3RUaW1lVmFsdWUiLCJjb21wZW5zYXRlZFJlY29yZGluZ1RpbWVJbmRleCIsImdldE1pblJlY29yZGVkVGltZSIsInNldFRpbWUiLCJlbmQiLCJhZGRJbnB1dExpc3RlbmVyIiwiaW5kZW50U3BhY2luZyIsImdyaXBweUluZGVudDEiLCJ0cmFuc2xhdGUiLCJhZGRDaGlsZCIsImdyaXBweUluZGVudDIiLCJncmlwcHlJbmRlbnQzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDaGFydEN1cnNvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGNsYXNzIHJlcHJlc2VudHMgdGhlIGN1cnNvciB0aGF0IHRoZSB1c2VyIGNhbiBncmFiIGFuZCBtb3ZlIGFyb3VuZFxyXG4gKiBpbiBvcmRlciB0byBtb3ZlIHRoZSBzaW0gYmFjayBhbmQgZm9ydGggaW4gdGltZS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmIChmb3IgR2hlbnQgVW5pdmVyc2l0eSlcclxuICovXHJcblxyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgUmVjdGFuZ2xlLCBTaW1wbGVEcmFnSGFuZGxlciB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBuZXVyb24gZnJvbSAnLi4vLi4vLi4vbmV1cm9uLmpzJztcclxuaW1wb3J0IEdyaXBweUluZGVudE5vZGUgZnJvbSAnLi9HcmlwcHlJbmRlbnROb2RlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBXSURUSF9QUk9QT1JUSU9OID0gMC4wMTM7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuY29uc3QgQ1VSU09SX0ZJTExfQ09MT1IgPSBuZXcgQ29sb3IoIDUwLCA1MCwgMjAwLCAwLjIgKTtcclxuY29uc3QgQ1VSU09SX1NUUk9LRV9DT0xPUiA9IENvbG9yLkRBUktfR1JBWTtcclxuY29uc3QgQ1VSU09SX1NUWUxFID0gJ2V3LXJlc2l6ZSc7XHJcblxyXG5jbGFzcyBDaGFydEN1cnNvciBleHRlbmRzIFJlY3RhbmdsZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TWVtYnJhbmVQb3RlbnRpYWxDaGFydH0gbWVtYnJhbmVQb3RlbnRpYWxDaGFydFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtZW1icmFuZVBvdGVudGlhbENoYXJ0ICkge1xyXG5cclxuICAgIGNvbnN0IHRvcE9mUGxvdEFyZWEgPSBtZW1icmFuZVBvdGVudGlhbENoYXJ0LmNoYXJ0TXZ0Lm1vZGVsVG9WaWV3UG9zaXRpb24oIG5ldyBWZWN0b3IyKCAwLCBtZW1icmFuZVBvdGVudGlhbENoYXJ0LnJhbmdlWyAxIF0gKSApO1xyXG4gICAgY29uc3QgYm90dG9tT2ZQbG90QXJlYSA9IG1lbWJyYW5lUG90ZW50aWFsQ2hhcnQuY2hhcnRNdnQubW9kZWxUb1ZpZXdQb3NpdGlvbiggbmV3IFZlY3RvcjIoIDAsIG1lbWJyYW5lUG90ZW50aWFsQ2hhcnQucmFuZ2VbIDAgXSApICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBzaGFwZS4gIFRoZSBzaGFwZSBpcyBjcmVhdGVkIHNvIHRoYXQgaXQgaXMgY2VudGVyZWRcclxuICAgIC8vIGFyb3VuZCBhbiBvZmZzZXQgb2YgMCBpbiB0aGUgeCBkaXJlY3Rpb24gYW5kIHRoZSB0b3AgZWRnZSBpc1xyXG4gICAgLy8gYXQgMCBpbiB0aGUgeSBkaXJlY3Rpb24uXHJcbiAgICBjb25zdCB3aWR0aCA9IG1lbWJyYW5lUG90ZW50aWFsQ2hhcnQuY2hhcnREaW1lbnNpb24ud2lkdGggKiBXSURUSF9QUk9QT1JUSU9OO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gYm90dG9tT2ZQbG90QXJlYS55IC0gdG9wT2ZQbG90QXJlYS55O1xyXG5cclxuICAgIHN1cGVyKCAtd2lkdGggLyAyLCAwLCB3aWR0aCwgaGVpZ2h0LCAwLCAwLCB7XHJcbiAgICAgIGN1cnNvcjogQ1VSU09SX1NUWUxFLFxyXG4gICAgICBmaWxsOiBDVVJTT1JfRklMTF9DT0xPUixcclxuICAgICAgc3Ryb2tlOiBDVVJTT1JfU1RST0tFX0NPTE9SLFxyXG4gICAgICBsaW5lV2lkdGg6IDAuNCxcclxuICAgICAgbGluZURhc2g6IFsgNCwgNCBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gTWFrZSBpdCBlYXNpZXIgdG8gZ3JhYiB0aGlzIGN1cnNvciBieSBnaXZpbmcgaXQgZXhwYW5kZWQgbW91c2UgYW5kIHRvdWNoIGFyZWFzLlxyXG4gICAgdGhpcy5tb3VzZUFyZWEgPSB0aGlzLmxvY2FsQm91bmRzLmRpbGF0ZWRYKCAxMiApO1xyXG4gICAgdGhpcy50b3VjaEFyZWEgPSB0aGlzLmxvY2FsQm91bmRzLmRpbGF0ZWRYKCAxMiApO1xyXG5cclxuICAgIGxldCBwcmVzc1BvaW50O1xyXG4gICAgbGV0IHByZXNzVGltZTtcclxuICAgIGNvbnN0IGNoYXJ0Q3Vyc29yRHJhZ0hhbmRsZXIgPSBuZXcgU2ltcGxlRHJhZ0hhbmRsZXIoIHtcclxuICAgICAgYWxsb3dUb3VjaFNuYWc6IHRydWUsXHJcbiAgICAgIGRyYWdDdXJzb3I6IENVUlNPUl9TVFlMRSxcclxuXHJcbiAgICAgIHN0YXJ0OiBlID0+IHtcclxuICAgICAgICBwcmVzc1BvaW50ID0gZS5jdXJyZW50VGFyZ2V0Lmdsb2JhbFRvUGFyZW50UG9pbnQoIGUucG9pbnRlci5wb2ludCApO1xyXG4gICAgICAgIHByZXNzVGltZSA9IG1lbWJyYW5lUG90ZW50aWFsQ2hhcnQuY2hhcnRNdnQudmlld1RvTW9kZWxQb3NpdGlvbiggbmV3IFZlY3RvcjIoIHRoaXMueCwgdGhpcy55ICkgKS54O1xyXG4gICAgICAgIG1lbWJyYW5lUG90ZW50aWFsQ2hhcnQucGxheWluZ1doZW5EcmFnU3RhcnRlZCA9IG1lbWJyYW5lUG90ZW50aWFsQ2hhcnQuY2xvY2sucGxheWluZ1Byb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIGlmICggbWVtYnJhbmVQb3RlbnRpYWxDaGFydC5wbGF5aW5nV2hlbkRyYWdTdGFydGVkICkge1xyXG4gICAgICAgICAgLy8gVGhlIHVzZXIgbXVzdCBiZSB0cnlpbmcgdG8gZ3JhYiB0aGUgY3Vyc29yIHdoaWxlIHRoZSBzaW0gaXMgcnVubmluZyBvciB3aGlsZSByZWNvcmRlZCBjb250ZW50IGlzIGJlaW5nXHJcbiAgICAgICAgICAvLyBwbGF5ZWQgYmFjay4gIFBhdXNlIHRoZSBjbG9jay5cclxuICAgICAgICAgIG1lbWJyYW5lUG90ZW50aWFsQ2hhcnQuc2V0UGxheWluZyggZmFsc2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBkcmFnOiBlID0+IHtcclxuICAgICAgICBpZiAoICFtZW1icmFuZVBvdGVudGlhbENoYXJ0Lm5ldXJvbk1vZGVsLmlzUGxheWJhY2soKSApIHtcclxuICAgICAgICAgIG1lbWJyYW5lUG90ZW50aWFsQ2hhcnQubmV1cm9uTW9kZWwuc2V0UGxheWJhY2soIDEgKTsgLy8gU2V0IGludG8gcGxheWJhY2sgbW9kZS5cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZHJhZ1BvaW50ID0gZS5jdXJyZW50VGFyZ2V0Lmdsb2JhbFRvUGFyZW50UG9pbnQoIGUucG9pbnRlci5wb2ludCApO1xyXG4gICAgICAgIGNvbnN0IGR4ID0gbmV3IFZlY3RvcjIoIGRyYWdQb2ludC54IC0gcHJlc3NQb2ludC54LCBkcmFnUG9pbnQueSAtIHByZXNzUG9pbnQueSApO1xyXG4gICAgICAgIGNvbnN0IG1vZGVsRGlmZiA9IG1lbWJyYW5lUG90ZW50aWFsQ2hhcnQuY2hhcnRNdnQudmlld1RvTW9kZWxQb3NpdGlvbiggZHggKTtcclxuICAgICAgICBsZXQgcmVjb3JkaW5nVGltZUluZGV4ID0gcHJlc3NUaW1lICsgbW9kZWxEaWZmLng7XHJcbiAgICAgICAgcmVjb3JkaW5nVGltZUluZGV4ID0gVXRpbHMuY2xhbXAoIHJlY29yZGluZ1RpbWVJbmRleCwgMCwgbWVtYnJhbmVQb3RlbnRpYWxDaGFydC5nZXRMYXN0VGltZVZhbHVlKCkgKTtcclxuICAgICAgICBjb25zdCBjb21wZW5zYXRlZFJlY29yZGluZ1RpbWVJbmRleCA9IHJlY29yZGluZ1RpbWVJbmRleCAvIDEwMDAgKyBtZW1icmFuZVBvdGVudGlhbENoYXJ0Lm5ldXJvbk1vZGVsLmdldE1pblJlY29yZGVkVGltZSgpO1xyXG4gICAgICAgIG1lbWJyYW5lUG90ZW50aWFsQ2hhcnQubmV1cm9uTW9kZWwuc2V0VGltZSggY29tcGVuc2F0ZWRSZWNvcmRpbmdUaW1lSW5kZXggKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGVuZDogKCkgPT4ge1xyXG4gICAgICAgIGlmICggbWVtYnJhbmVQb3RlbnRpYWxDaGFydC5wbGF5aW5nV2hlbkRyYWdTdGFydGVkICkge1xyXG4gICAgICAgICAgLy8gVGhlIGNsb2NrIHdhcyBwbGF5aW5nIHdoZW4gdGhlIHVzZXIgZ3JhYmJlZCB0aGlzIGN1cnNvciwgc28gbm93IHRoYXQgdGhleSBhcmUgcmVsZWFzaW5nIHRoZSBjdXJzb3Igd2VcclxuICAgICAgICAgIC8vIHNob3VsZCBzZXQgdGhlIG1vZGUgYmFjayB0byBwbGF5aW5nLlxyXG4gICAgICAgICAgbWVtYnJhbmVQb3RlbnRpYWxDaGFydC5zZXRQbGF5aW5nKCB0cnVlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBjaGFydEN1cnNvckRyYWdIYW5kbGVyICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBpbmRlbnRhdGlvbnMgdGhhdCBhcmUgaW50ZW5kZWQgdG8gY29udmV5IHRoZSBpZGVhIG9mIFwiZ3JpcGFiaWxpdHlcIi5cclxuICAgIGNvbnN0IGluZGVudFNwYWNpbmcgPSAwLjA1ICogaGVpZ2h0O1xyXG4gICAgY29uc3QgZ3JpcHB5SW5kZW50MSA9IG5ldyBHcmlwcHlJbmRlbnROb2RlKCB3aWR0aCAvIDIsIENVUlNPUl9GSUxMX0NPTE9SICk7XHJcbiAgICBncmlwcHlJbmRlbnQxLnRyYW5zbGF0ZSggMCwgaGVpZ2h0IC8gMiAtIGluZGVudFNwYWNpbmcgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGdyaXBweUluZGVudDEgKTtcclxuICAgIGNvbnN0IGdyaXBweUluZGVudDIgPSBuZXcgR3JpcHB5SW5kZW50Tm9kZSggd2lkdGggLyAyLCBDVVJTT1JfRklMTF9DT0xPUiApO1xyXG4gICAgZ3JpcHB5SW5kZW50Mi50cmFuc2xhdGUoIDAsIGhlaWdodCAvIDIgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGdyaXBweUluZGVudDIgKTtcclxuICAgIGNvbnN0IGdyaXBweUluZGVudDMgPSBuZXcgR3JpcHB5SW5kZW50Tm9kZSggd2lkdGggLyAyLCBDVVJTT1JfRklMTF9DT0xPUiApO1xyXG4gICAgZ3JpcHB5SW5kZW50My50cmFuc2xhdGUoIDAsIGhlaWdodCAvIDIgKyBpbmRlbnRTcGFjaW5nICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBncmlwcHlJbmRlbnQzICk7XHJcbiAgfVxyXG59XHJcblxyXG5uZXVyb24ucmVnaXN0ZXIoICdDaGFydEN1cnNvcicsIENoYXJ0Q3Vyc29yICk7XHJcbmV4cG9ydCBkZWZhdWx0IENoYXJ0Q3Vyc29yOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxPQUFPQyxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELFNBQVNDLEtBQUssRUFBRUMsU0FBUyxFQUFFQyxpQkFBaUIsUUFBUSxzQ0FBc0M7QUFDMUYsT0FBT0MsTUFBTSxNQUFNLG9CQUFvQjtBQUN2QyxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7O0FBRXBEO0FBQ0EsTUFBTUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDaEMsTUFBTUMsaUJBQWlCLEdBQUcsSUFBSU4s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