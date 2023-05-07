// Copyright 2019-2022, University of Colorado Boulder

/**
 * An XYChartNode that includes a draggable cursor that allows the user to scrub or play back through the data.
 *
 * @author Jesse Greenberg
 */

import Utils from '../../dot/js/Utils.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import merge from '../../phet-core/js/merge.js';
import ArrowNode from '../../scenery-phet/js/ArrowNode.js';
import { Circle, Color, DragListener, Node, Rectangle } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import griddle from './griddle.js';
import XYChartNode from './XYChartNode.js';

// constants
const WIDTH_PROPORTION = 0.013; // empirically determined
const CURSOR_FILL_COLOR = new Color(50, 50, 200, 0.2);
const CURSOR_STROKE_COLOR = Color.DARK_GRAY;
const ARROW_CUE_FILL_COLOR = new Color(180, 180, 230);
const ARROW_CUE_STROKE_COLOR = Color.DARK_GRAY;

/**
 * @deprecated - please use BAMBOO/GridLineSet
 */
class XYCursorChartNode extends XYChartNode {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    assert && deprecationWarning('Please use bamboo');
    options = merge({
      // options passed on to the cursor, see ChartCursor
      cursorOptions: null,
      chartPanelOptions: {
        // so that the cursor is draggable
        pickable: true
      },
      // phet-io
      tandem: Tandem.OPTIONAL
    }, options);
    super(options);

    // @private {boolean|null} - if set with setCursorVisible, then this will indicate visibility of the cursor
    this._cursorVisibleOverride = null;

    // @private {number} - value for the cursor, determines cursor positioning
    this.cursorValue = 0;

    // @public (read-only) - minimum and maximum recorded value, required by the cursor to limit dragging
    this.minRecordedXValue = 0;
    this.maxRecordedXValue = 0;

    // @private Map.<DynamicSeries,function> Keep track of the listener for each series, so the listener can be removed
    // when a series is removed.
    this.dynamicSeriesListenerMap = new Map();

    // @protected (read-only) {DynamicSeries[]}
    this.dynamicSeriesArray = [];

    // @private {ChartCursor} - draggable Node that shows the cursor value
    this.chartCursor = new ChartCursor(this, this.modelViewTransformProperty, options.cursorOptions);
    this.chartPanel.addChild(this.chartCursor);

    // initialize position and visibility of the cursor
    this.updateCursor();
  }

  /**
   * Adds a DynamicSeries to the XYCursorChartNode.
   * @override
   * @public
   *
   * @param {DynamicSeries} dynamicSeries
   */
  addDynamicSeries(dynamicSeries) {
    super.addDynamicSeries(dynamicSeries);
    this.dynamicSeriesArray.push(dynamicSeries);

    // when a point is added, update the min and max recorded values
    const dynamicSeriesListener = () => {
      // update the
      this.updateMinMaxRecordedValues();

      // if all data has been removed from the chart, update cursor visibility
      this.updateCursor();
    };

    // save to map so that listener can be found again for disposal
    this.dynamicSeriesListenerMap.set(dynamicSeries, dynamicSeriesListener);
    dynamicSeries.addDynamicSeriesListener(dynamicSeriesListener);
  }

  /**
   * Removes a DynamicSeries from the chart and disposes of its listener.
   * @override
   * @public
   *
   * @param {DynamicSeries} dynamicSeries - to remove
   */
  removeDynamicSeries(dynamicSeries) {
    super.removeDynamicSeries(dynamicSeries);
    const seriesIndex = this.dynamicSeriesArray.indexOf(dynamicSeries);
    this.dynamicSeriesArray.splice(seriesIndex, 1);
    dynamicSeries.removeDynamicSeriesListener(this.dynamicSeriesListenerMap.get(dynamicSeries));
    this.dynamicSeriesListenerMap.delete(dynamicSeries);
  }

  /**
   * Sets the cursor value. The value of the cursor is constrained to be within chart bounds.
   * @public
   *
   * @param {number} value
   */
  setCursorValue(value) {
    const modelViewTransform = this.modelViewTransformProperty.get();
    const minX = modelViewTransform.viewToModelX(0);
    const maxX = modelViewTransform.viewToModelX(this.chartWidth + this.chartCursor.width / 2);
    this.cursorValue = Utils.clamp(value, minX, maxX);
    this.updateCursor();
  }

  /**
   * Gets the value currently under the cursor.
   * @public
   *
   * @returns {number}
   */
  getCursorValue() {
    return this.cursorValue;
  }

  /**
   * Resets the cursor.
   * @public
   */
  resetCursor() {
    this.chartCursor.reset();
  }

  /**
   * Overrides the default behavior for setting cursor visibility. If set to null, cursor visibility will behave as
   * described in updateCursorVisibility. Otherwise, visibility will equal the boolean value set here.
   * @param {boolean|null} visible
   * @public
   */
  setCursorVisibleOverride(visible) {
    assert && assert(typeof visible === 'boolean' || visible === null, 'visible must be boolean or null');
    this._cursorVisibleOverride = visible;
    this.updateCursorVisibility();
  }

  /**
   * Updates the cursor visibility and position.
   * @private
   */
  updateCursor() {
    this.updateCursorVisibility();
    if (this.chartCursor.isVisible()) {
      this.updateCursorPosition();
    }
  }

  /**
   * Updates the cursor position.
   * @private
   */
  updateCursorPosition() {
    this.moveCursorToValue(this.cursorValue);
  }

  /**
   * Updates the cursor visibility. The cursor should be visible any time the cursor value is within
   * the recorded value range.
   * @private
   */
  updateCursorVisibility() {
    const wasVisible = this.chartCursor.visible;
    if (typeof this._cursorVisibleOverride === 'boolean') {
      this.chartCursor.setVisible(this._cursorVisibleOverride);
    } else {
      const maxX = this.modelViewTransformProperty.get().viewToModelX(this.chartWidth + this.chartCursor.width / 2);
      const minX = this.modelViewTransformProperty.get().viewToModelX(0);
      const isCurrentValueOnChart = this.cursorValue >= minX && this.cursorValue <= maxX;
      const hasData = this.hasData();
      const chartCursorVisible = isCurrentValueOnChart && hasData;
      this.chartCursor.setVisible(chartCursorVisible);
    }

    // if the cursor just became invisible, interrupt any active dragging
    if (!this.chartCursor.visible && wasVisible) {
      this.chartCursor.interruptDrag();
    }
  }

  /**
   * Returns true if any DynamicSeries associated with this chart has data.
   * @returns {boolean}
   * @public
   */
  hasData() {
    return _.some(this.dynamicSeriesArray, dynamicSeries => dynamicSeries.hasData());
  }

  /**
   * Moves the cursor to the specified value.
   * @private
   *
   * @param {number} value
   */
  moveCursorToValue(value) {
    const viewPosition = this.modelViewTransformProperty.get().modelToViewX(value);

    // keep the cursor within the grid bounds
    this.chartCursor.centerX = Utils.clamp(viewPosition, 0, this.chartWidth);
    this.chartCursor.centerY = this.gridNode.centerY;
  }

  /**
   * From the existing data, update the min and max recorded X values from all of the dynamicSeries of this chart,
   * so that the cursor can be limited to the recorded data.
   * @private
   */
  updateMinMaxRecordedValues() {
    let minValue = Number.POSITIVE_INFINITY;
    let maxValue = Number.NEGATIVE_INFINITY;
    this.dynamicSeriesArray.forEach(dynamicSeries => {
      if (dynamicSeries.getLength() > 0) {
        const seriesMinValue = dynamicSeries.getDataPoint(0).x;
        const seriesMaxValue = dynamicSeries.getDataPoint(dynamicSeries.getLength() - 1).x;
        if (seriesMinValue < minValue) {
          minValue = seriesMinValue;
        }
        if (seriesMaxValue > maxValue) {
          maxValue = seriesMaxValue;
        }
      }
    });
    this.minRecordedXValue = minValue;
    this.maxRecordedXValue = maxValue;
  }
}

/**
 * ChartCursor is a rectangular cursor that indicates the current or selected value on the chart.
 */
class ChartCursor extends Rectangle {
  /**
   * @param {XYCursorChartNode} chart
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   * @param {Object} [options]
   */
  constructor(chart, modelViewTransformProperty, options) {
    options = merge({
      startDrag: () => {},
      endDrag: () => {},
      drag: () => {},
      // {boolean} - if true, a double headed arrow will be shown to indicate
      // that the cursor is draggable - becomes invisible after first
      // drag
      includeDragCue: false,
      // phet-io
      tandem: Tandem.OPTIONAL
    }, options);
    const width = chart.chartWidth * WIDTH_PROPORTION;
    const height = chart.chartHeight;

    // Set the shape. Origin is at the center top of the rectangle.
    super(0, -height, width, height, 0, 0, {
      cursor: 'ew-resize',
      fill: CURSOR_FILL_COLOR,
      stroke: CURSOR_STROKE_COLOR,
      lineWidth: 0.4,
      lineDash: [4, 4]
    });

    // @private
    this.chart = chart;

    // @public
    this.modelViewTransformProperty = modelViewTransformProperty;

    // Make it easier to grab this cursor by giving it expanded mouse and touch areas.
    this.mouseArea = this.localBounds.dilatedX(12);
    this.touchArea = this.localBounds.dilatedX(12);

    // @private
    this.includeDragCue = options.includeDragCue;
    if (this.includeDragCue) {
      // @private - indicates to the user that the cursor is draggable, only created
      // and added if necessary
      this.dragCueArrowNode = new ArrowNode(-width * 2, 0, width * 2, 0, {
        doubleHead: true,
        headWidth: 12,
        headHeight: 10,
        fill: ARROW_CUE_FILL_COLOR,
        stroke: ARROW_CUE_STROKE_COLOR,
        center: this.center.plusXY(0, height * 0.4)
      });
      this.addChild(this.dragCueArrowNode);
    }

    // Add the indentations that are intended to convey the idea of "gripability".
    const grippyNode = new Node();
    const indentSpacing = height * 0.05;
    for (let i = 0; i < 3; i++) {
      const indentNode = new GrippyIndentNode(width / 2, CURSOR_FILL_COLOR);
      indentNode.top = i * (indentNode.height + indentSpacing);
      grippyNode.addChild(indentNode);
    }
    grippyNode.center = this.center;
    this.addChild(grippyNode);

    // @private - so that we can interrupt the DragListener if necessary
    this.dragListener = new DragListener({
      start: (event, listener) => {
        assert && assert(this.chart.hasData(), 'chart should have data for the cursor to be draggable');
        options.startDrag();
      },
      drag: (event, listener) => {
        const parentX = listener.parentPoint.x;
        let newValue = this.modelViewTransformProperty.get().viewToModelX(parentX);

        // limit cursor to the domain of recorded values
        newValue = Utils.clamp(newValue, this.chart.minRecordedXValue, this.chart.maxRecordedXValue);
        this.chart.setCursorValue(newValue);
        options.drag();
      },
      end: () => {
        options.endDrag();

        // no need to show arrow after user successfully drags the cursor
        if (this.includeDragCue) {
          this.dragCueArrowNode.visible = false;
        }
      },
      tandem: options.tandem.createTandem('dragListener')
    });
    this.addInputListener(this.dragListener);
  }

  /**
   * Interrupts dragging of the cursor, useful when ChartCursor visibility changes.
   * @public
   */
  interruptDrag() {
    this.dragListener.interrupt();
  }

  /**
   * Resets the ChartCursor to its initial state. Note that this does not modify data
   * or the cursor position (cursorValue), only aspects of the view for the cursor itself.
   * @public
   */
  reset() {
    if (this.includeDragCue) {
      this.dragCueArrowNode.visible = true;
    }
  }
}

/**
 * GrippyIndentNode is a small round indentation on a surface.  This is a modern user interface paradigm that
 * is intended to convey the concept of "gripability", i.e. something that the user can grab.  This is meant to
 * look somewhat 3D, much like etched borders do.
 */
class GrippyIndentNode extends Circle {
  /**
   * @param {number} diameter
   * @param {Color} baseColor
   * @param {Object} [options]
   */
  constructor(diameter, baseColor, options) {
    options = merge({
      lineWidth: 0.5
    }, options);
    const baseDarkerColor = baseColor.darkerColor(0.9);
    const translucentDarkerColor = new Color(baseDarkerColor.getRed(), baseDarkerColor.getGreen(), baseDarkerColor.getBlue(), baseColor.getAlpha());
    const baseLighterColor = baseColor.brighterColor(0.9);
    const translucentBrighterColor = new Color(baseLighterColor.getRed(), baseLighterColor.getGreen(), baseLighterColor.getBlue(), baseColor.getAlpha());
    const radius = diameter / 2 - options.lineWidth;
    super(radius, {
      fill: translucentDarkerColor,
      stroke: translucentBrighterColor,
      lineWidth: options.lineWidth
    });
  }
}
griddle.register('XYCursorChartNode', XYCursorChartNode);
export default XYCursorChartNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsImRlcHJlY2F0aW9uV2FybmluZyIsIm1lcmdlIiwiQXJyb3dOb2RlIiwiQ2lyY2xlIiwiQ29sb3IiLCJEcmFnTGlzdGVuZXIiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiVGFuZGVtIiwiZ3JpZGRsZSIsIlhZQ2hhcnROb2RlIiwiV0lEVEhfUFJPUE9SVElPTiIsIkNVUlNPUl9GSUxMX0NPTE9SIiwiQ1VSU09SX1NUUk9LRV9DT0xPUiIsIkRBUktfR1JBWSIsIkFSUk9XX0NVRV9GSUxMX0NPTE9SIiwiQVJST1dfQ1VFX1NUUk9LRV9DT0xPUiIsIlhZQ3Vyc29yQ2hhcnROb2RlIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiYXNzZXJ0IiwiY3Vyc29yT3B0aW9ucyIsImNoYXJ0UGFuZWxPcHRpb25zIiwicGlja2FibGUiLCJ0YW5kZW0iLCJPUFRJT05BTCIsIl9jdXJzb3JWaXNpYmxlT3ZlcnJpZGUiLCJjdXJzb3JWYWx1ZSIsIm1pblJlY29yZGVkWFZhbHVlIiwibWF4UmVjb3JkZWRYVmFsdWUiLCJkeW5hbWljU2VyaWVzTGlzdGVuZXJNYXAiLCJNYXAiLCJkeW5hbWljU2VyaWVzQXJyYXkiLCJjaGFydEN1cnNvciIsIkNoYXJ0Q3Vyc29yIiwibW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkiLCJjaGFydFBhbmVsIiwiYWRkQ2hpbGQiLCJ1cGRhdGVDdXJzb3IiLCJhZGREeW5hbWljU2VyaWVzIiwiZHluYW1pY1NlcmllcyIsInB1c2giLCJkeW5hbWljU2VyaWVzTGlzdGVuZXIiLCJ1cGRhdGVNaW5NYXhSZWNvcmRlZFZhbHVlcyIsInNldCIsImFkZER5bmFtaWNTZXJpZXNMaXN0ZW5lciIsInJlbW92ZUR5bmFtaWNTZXJpZXMiLCJzZXJpZXNJbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJyZW1vdmVEeW5hbWljU2VyaWVzTGlzdGVuZXIiLCJnZXQiLCJkZWxldGUiLCJzZXRDdXJzb3JWYWx1ZSIsInZhbHVlIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwibWluWCIsInZpZXdUb01vZGVsWCIsIm1heFgiLCJjaGFydFdpZHRoIiwid2lkdGgiLCJjbGFtcCIsImdldEN1cnNvclZhbHVlIiwicmVzZXRDdXJzb3IiLCJyZXNldCIsInNldEN1cnNvclZpc2libGVPdmVycmlkZSIsInZpc2libGUiLCJ1cGRhdGVDdXJzb3JWaXNpYmlsaXR5IiwiaXNWaXNpYmxlIiwidXBkYXRlQ3Vyc29yUG9zaXRpb24iLCJtb3ZlQ3Vyc29yVG9WYWx1ZSIsIndhc1Zpc2libGUiLCJzZXRWaXNpYmxlIiwiaXNDdXJyZW50VmFsdWVPbkNoYXJ0IiwiaGFzRGF0YSIsImNoYXJ0Q3Vyc29yVmlzaWJsZSIsImludGVycnVwdERyYWciLCJfIiwic29tZSIsInZpZXdQb3NpdGlvbiIsIm1vZGVsVG9WaWV3WCIsImNlbnRlclgiLCJjZW50ZXJZIiwiZ3JpZE5vZGUiLCJtaW5WYWx1ZSIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwibWF4VmFsdWUiLCJORUdBVElWRV9JTkZJTklUWSIsImZvckVhY2giLCJnZXRMZW5ndGgiLCJzZXJpZXNNaW5WYWx1ZSIsImdldERhdGFQb2ludCIsIngiLCJzZXJpZXNNYXhWYWx1ZSIsImNoYXJ0Iiwic3RhcnREcmFnIiwiZW5kRHJhZyIsImRyYWciLCJpbmNsdWRlRHJhZ0N1ZSIsImhlaWdodCIsImNoYXJ0SGVpZ2h0IiwiY3Vyc29yIiwiZmlsbCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImxpbmVEYXNoIiwibW91c2VBcmVhIiwibG9jYWxCb3VuZHMiLCJkaWxhdGVkWCIsInRvdWNoQXJlYSIsImRyYWdDdWVBcnJvd05vZGUiLCJkb3VibGVIZWFkIiwiaGVhZFdpZHRoIiwiaGVhZEhlaWdodCIsImNlbnRlciIsInBsdXNYWSIsImdyaXBweU5vZGUiLCJpbmRlbnRTcGFjaW5nIiwiaSIsImluZGVudE5vZGUiLCJHcmlwcHlJbmRlbnROb2RlIiwidG9wIiwiZHJhZ0xpc3RlbmVyIiwic3RhcnQiLCJldmVudCIsImxpc3RlbmVyIiwicGFyZW50WCIsInBhcmVudFBvaW50IiwibmV3VmFsdWUiLCJlbmQiLCJjcmVhdGVUYW5kZW0iLCJhZGRJbnB1dExpc3RlbmVyIiwiaW50ZXJydXB0IiwiZGlhbWV0ZXIiLCJiYXNlQ29sb3IiLCJiYXNlRGFya2VyQ29sb3IiLCJkYXJrZXJDb2xvciIsInRyYW5zbHVjZW50RGFya2VyQ29sb3IiLCJnZXRSZWQiLCJnZXRHcmVlbiIsImdldEJsdWUiLCJnZXRBbHBoYSIsImJhc2VMaWdodGVyQ29sb3IiLCJicmlnaHRlckNvbG9yIiwidHJhbnNsdWNlbnRCcmlnaHRlckNvbG9yIiwicmFkaXVzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJYWUN1cnNvckNoYXJ0Tm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBbiBYWUNoYXJ0Tm9kZSB0aGF0IGluY2x1ZGVzIGEgZHJhZ2dhYmxlIGN1cnNvciB0aGF0IGFsbG93cyB0aGUgdXNlciB0byBzY3J1YiBvciBwbGF5IGJhY2sgdGhyb3VnaCB0aGUgZGF0YS5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICovXHJcblxyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IGRlcHJlY2F0aW9uV2FybmluZyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgQ29sb3IsIERyYWdMaXN0ZW5lciwgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGdyaWRkbGUgZnJvbSAnLi9ncmlkZGxlLmpzJztcclxuaW1wb3J0IFhZQ2hhcnROb2RlIGZyb20gJy4vWFlDaGFydE5vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFdJRFRIX1BST1BPUlRJT04gPSAwLjAxMzsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5jb25zdCBDVVJTT1JfRklMTF9DT0xPUiA9IG5ldyBDb2xvciggNTAsIDUwLCAyMDAsIDAuMiApO1xyXG5jb25zdCBDVVJTT1JfU1RST0tFX0NPTE9SID0gQ29sb3IuREFSS19HUkFZO1xyXG5jb25zdCBBUlJPV19DVUVfRklMTF9DT0xPUiA9IG5ldyBDb2xvciggMTgwLCAxODAsIDIzMCApO1xyXG5jb25zdCBBUlJPV19DVUVfU1RST0tFX0NPTE9SID0gQ29sb3IuREFSS19HUkFZO1xyXG5cclxuLyoqXHJcbiAqIEBkZXByZWNhdGVkIC0gcGxlYXNlIHVzZSBCQU1CT08vR3JpZExpbmVTZXRcclxuICovXHJcbmNsYXNzIFhZQ3Vyc29yQ2hhcnROb2RlIGV4dGVuZHMgWFlDaGFydE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgZGVwcmVjYXRpb25XYXJuaW5nKCAnUGxlYXNlIHVzZSBiYW1ib28nICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBvcHRpb25zIHBhc3NlZCBvbiB0byB0aGUgY3Vyc29yLCBzZWUgQ2hhcnRDdXJzb3JcclxuICAgICAgY3Vyc29yT3B0aW9uczogbnVsbCxcclxuXHJcbiAgICAgIGNoYXJ0UGFuZWxPcHRpb25zOiB7XHJcblxyXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGN1cnNvciBpcyBkcmFnZ2FibGVcclxuICAgICAgICBwaWNrYWJsZTogdHJ1ZVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW58bnVsbH0gLSBpZiBzZXQgd2l0aCBzZXRDdXJzb3JWaXNpYmxlLCB0aGVuIHRoaXMgd2lsbCBpbmRpY2F0ZSB2aXNpYmlsaXR5IG9mIHRoZSBjdXJzb3JcclxuICAgIHRoaXMuX2N1cnNvclZpc2libGVPdmVycmlkZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSB2YWx1ZSBmb3IgdGhlIGN1cnNvciwgZGV0ZXJtaW5lcyBjdXJzb3IgcG9zaXRpb25pbmdcclxuICAgIHRoaXMuY3Vyc29yVmFsdWUgPSAwO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgLSBtaW5pbXVtIGFuZCBtYXhpbXVtIHJlY29yZGVkIHZhbHVlLCByZXF1aXJlZCBieSB0aGUgY3Vyc29yIHRvIGxpbWl0IGRyYWdnaW5nXHJcbiAgICB0aGlzLm1pblJlY29yZGVkWFZhbHVlID0gMDtcclxuICAgIHRoaXMubWF4UmVjb3JkZWRYVmFsdWUgPSAwO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIE1hcC48RHluYW1pY1NlcmllcyxmdW5jdGlvbj4gS2VlcCB0cmFjayBvZiB0aGUgbGlzdGVuZXIgZm9yIGVhY2ggc2VyaWVzLCBzbyB0aGUgbGlzdGVuZXIgY2FuIGJlIHJlbW92ZWRcclxuICAgIC8vIHdoZW4gYSBzZXJpZXMgaXMgcmVtb3ZlZC5cclxuICAgIHRoaXMuZHluYW1pY1Nlcmllc0xpc3RlbmVyTWFwID0gbmV3IE1hcCgpO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQgKHJlYWQtb25seSkge0R5bmFtaWNTZXJpZXNbXX1cclxuICAgIHRoaXMuZHluYW1pY1Nlcmllc0FycmF5ID0gW107XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0NoYXJ0Q3Vyc29yfSAtIGRyYWdnYWJsZSBOb2RlIHRoYXQgc2hvd3MgdGhlIGN1cnNvciB2YWx1ZVxyXG4gICAgdGhpcy5jaGFydEN1cnNvciA9IG5ldyBDaGFydEN1cnNvciggdGhpcywgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSwgb3B0aW9ucy5jdXJzb3JPcHRpb25zICk7XHJcbiAgICB0aGlzLmNoYXJ0UGFuZWwuYWRkQ2hpbGQoIHRoaXMuY2hhcnRDdXJzb3IgKTtcclxuXHJcbiAgICAvLyBpbml0aWFsaXplIHBvc2l0aW9uIGFuZCB2aXNpYmlsaXR5IG9mIHRoZSBjdXJzb3JcclxuICAgIHRoaXMudXBkYXRlQ3Vyc29yKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgRHluYW1pY1NlcmllcyB0byB0aGUgWFlDdXJzb3JDaGFydE5vZGUuXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEeW5hbWljU2VyaWVzfSBkeW5hbWljU2VyaWVzXHJcbiAgICovXHJcbiAgYWRkRHluYW1pY1NlcmllcyggZHluYW1pY1NlcmllcyApIHtcclxuICAgIHN1cGVyLmFkZER5bmFtaWNTZXJpZXMoIGR5bmFtaWNTZXJpZXMgKTtcclxuXHJcbiAgICB0aGlzLmR5bmFtaWNTZXJpZXNBcnJheS5wdXNoKCBkeW5hbWljU2VyaWVzICk7XHJcblxyXG4gICAgLy8gd2hlbiBhIHBvaW50IGlzIGFkZGVkLCB1cGRhdGUgdGhlIG1pbiBhbmQgbWF4IHJlY29yZGVkIHZhbHVlc1xyXG4gICAgY29uc3QgZHluYW1pY1Nlcmllc0xpc3RlbmVyID0gKCkgPT4ge1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHRoZVxyXG4gICAgICB0aGlzLnVwZGF0ZU1pbk1heFJlY29yZGVkVmFsdWVzKCk7XHJcblxyXG4gICAgICAvLyBpZiBhbGwgZGF0YSBoYXMgYmVlbiByZW1vdmVkIGZyb20gdGhlIGNoYXJ0LCB1cGRhdGUgY3Vyc29yIHZpc2liaWxpdHlcclxuICAgICAgdGhpcy51cGRhdGVDdXJzb3IoKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gc2F2ZSB0byBtYXAgc28gdGhhdCBsaXN0ZW5lciBjYW4gYmUgZm91bmQgYWdhaW4gZm9yIGRpc3Bvc2FsXHJcbiAgICB0aGlzLmR5bmFtaWNTZXJpZXNMaXN0ZW5lck1hcC5zZXQoIGR5bmFtaWNTZXJpZXMsIGR5bmFtaWNTZXJpZXNMaXN0ZW5lciApO1xyXG4gICAgZHluYW1pY1Nlcmllcy5hZGREeW5hbWljU2VyaWVzTGlzdGVuZXIoIGR5bmFtaWNTZXJpZXNMaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhIER5bmFtaWNTZXJpZXMgZnJvbSB0aGUgY2hhcnQgYW5kIGRpc3Bvc2VzIG9mIGl0cyBsaXN0ZW5lci5cclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0R5bmFtaWNTZXJpZXN9IGR5bmFtaWNTZXJpZXMgLSB0byByZW1vdmVcclxuICAgKi9cclxuICByZW1vdmVEeW5hbWljU2VyaWVzKCBkeW5hbWljU2VyaWVzICkge1xyXG4gICAgc3VwZXIucmVtb3ZlRHluYW1pY1NlcmllcyggZHluYW1pY1NlcmllcyApO1xyXG5cclxuICAgIGNvbnN0IHNlcmllc0luZGV4ID0gdGhpcy5keW5hbWljU2VyaWVzQXJyYXkuaW5kZXhPZiggZHluYW1pY1NlcmllcyApO1xyXG4gICAgdGhpcy5keW5hbWljU2VyaWVzQXJyYXkuc3BsaWNlKCBzZXJpZXNJbmRleCwgMSApO1xyXG5cclxuICAgIGR5bmFtaWNTZXJpZXMucmVtb3ZlRHluYW1pY1Nlcmllc0xpc3RlbmVyKCB0aGlzLmR5bmFtaWNTZXJpZXNMaXN0ZW5lck1hcC5nZXQoIGR5bmFtaWNTZXJpZXMgKSApO1xyXG4gICAgdGhpcy5keW5hbWljU2VyaWVzTGlzdGVuZXJNYXAuZGVsZXRlKCBkeW5hbWljU2VyaWVzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBjdXJzb3IgdmFsdWUuIFRoZSB2YWx1ZSBvZiB0aGUgY3Vyc29yIGlzIGNvbnN0cmFpbmVkIHRvIGJlIHdpdGhpbiBjaGFydCBib3VuZHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXHJcbiAgICovXHJcbiAgc2V0Q3Vyc29yVmFsdWUoIHZhbHVlICkge1xyXG4gICAgY29uc3QgbW9kZWxWaWV3VHJhbnNmb3JtID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IG1pblggPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxYKCAwICk7XHJcbiAgICBjb25zdCBtYXhYID0gbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsWCggdGhpcy5jaGFydFdpZHRoICsgdGhpcy5jaGFydEN1cnNvci53aWR0aCAvIDIgKTtcclxuICAgIHRoaXMuY3Vyc29yVmFsdWUgPSBVdGlscy5jbGFtcCggdmFsdWUsIG1pblgsIG1heFggKTtcclxuICAgIHRoaXMudXBkYXRlQ3Vyc29yKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB2YWx1ZSBjdXJyZW50bHkgdW5kZXIgdGhlIGN1cnNvci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEN1cnNvclZhbHVlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY3Vyc29yVmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIGN1cnNvci5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXRDdXJzb3IoKSB7XHJcbiAgICB0aGlzLmNoYXJ0Q3Vyc29yLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPdmVycmlkZXMgdGhlIGRlZmF1bHQgYmVoYXZpb3IgZm9yIHNldHRpbmcgY3Vyc29yIHZpc2liaWxpdHkuIElmIHNldCB0byBudWxsLCBjdXJzb3IgdmlzaWJpbGl0eSB3aWxsIGJlaGF2ZSBhc1xyXG4gICAqIGRlc2NyaWJlZCBpbiB1cGRhdGVDdXJzb3JWaXNpYmlsaXR5LiBPdGhlcndpc2UsIHZpc2liaWxpdHkgd2lsbCBlcXVhbCB0aGUgYm9vbGVhbiB2YWx1ZSBzZXQgaGVyZS5cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW58bnVsbH0gdmlzaWJsZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRDdXJzb3JWaXNpYmxlT3ZlcnJpZGUoIHZpc2libGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdmlzaWJsZSA9PT0gJ2Jvb2xlYW4nIHx8IHZpc2libGUgPT09IG51bGwsICd2aXNpYmxlIG11c3QgYmUgYm9vbGVhbiBvciBudWxsJyApO1xyXG4gICAgdGhpcy5fY3Vyc29yVmlzaWJsZU92ZXJyaWRlID0gdmlzaWJsZTtcclxuICAgIHRoaXMudXBkYXRlQ3Vyc29yVmlzaWJpbGl0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgY3Vyc29yIHZpc2liaWxpdHkgYW5kIHBvc2l0aW9uLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlQ3Vyc29yKCkge1xyXG4gICAgdGhpcy51cGRhdGVDdXJzb3JWaXNpYmlsaXR5KCk7XHJcbiAgICBpZiAoIHRoaXMuY2hhcnRDdXJzb3IuaXNWaXNpYmxlKCkgKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlQ3Vyc29yUG9zaXRpb24oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIGN1cnNvciBwb3NpdGlvbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUN1cnNvclBvc2l0aW9uKCkge1xyXG4gICAgdGhpcy5tb3ZlQ3Vyc29yVG9WYWx1ZSggdGhpcy5jdXJzb3JWYWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgY3Vyc29yIHZpc2liaWxpdHkuIFRoZSBjdXJzb3Igc2hvdWxkIGJlIHZpc2libGUgYW55IHRpbWUgdGhlIGN1cnNvciB2YWx1ZSBpcyB3aXRoaW5cclxuICAgKiB0aGUgcmVjb3JkZWQgdmFsdWUgcmFuZ2UuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVDdXJzb3JWaXNpYmlsaXR5KCkge1xyXG5cclxuICAgIGNvbnN0IHdhc1Zpc2libGUgPSB0aGlzLmNoYXJ0Q3Vyc29yLnZpc2libGU7XHJcbiAgICBpZiAoIHR5cGVvZiB0aGlzLl9jdXJzb3JWaXNpYmxlT3ZlcnJpZGUgPT09ICdib29sZWFuJyApIHtcclxuICAgICAgdGhpcy5jaGFydEN1cnNvci5zZXRWaXNpYmxlKCB0aGlzLl9jdXJzb3JWaXNpYmxlT3ZlcnJpZGUgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgY29uc3QgbWF4WCA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkuZ2V0KCkudmlld1RvTW9kZWxYKCB0aGlzLmNoYXJ0V2lkdGggKyB0aGlzLmNoYXJ0Q3Vyc29yLndpZHRoIC8gMiApO1xyXG4gICAgICBjb25zdCBtaW5YID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS5nZXQoKS52aWV3VG9Nb2RlbFgoIDAgKTtcclxuXHJcbiAgICAgIGNvbnN0IGlzQ3VycmVudFZhbHVlT25DaGFydCA9ICggdGhpcy5jdXJzb3JWYWx1ZSA+PSBtaW5YICkgJiYgKCB0aGlzLmN1cnNvclZhbHVlIDw9IG1heFggKTtcclxuICAgICAgY29uc3QgaGFzRGF0YSA9IHRoaXMuaGFzRGF0YSgpO1xyXG4gICAgICBjb25zdCBjaGFydEN1cnNvclZpc2libGUgPSBpc0N1cnJlbnRWYWx1ZU9uQ2hhcnQgJiYgaGFzRGF0YTtcclxuXHJcbiAgICAgIHRoaXMuY2hhcnRDdXJzb3Iuc2V0VmlzaWJsZSggY2hhcnRDdXJzb3JWaXNpYmxlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgdGhlIGN1cnNvciBqdXN0IGJlY2FtZSBpbnZpc2libGUsIGludGVycnVwdCBhbnkgYWN0aXZlIGRyYWdnaW5nXHJcbiAgICBpZiAoICF0aGlzLmNoYXJ0Q3Vyc29yLnZpc2libGUgJiYgd2FzVmlzaWJsZSApIHtcclxuICAgICAgdGhpcy5jaGFydEN1cnNvci5pbnRlcnJ1cHREcmFnKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgYW55IER5bmFtaWNTZXJpZXMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY2hhcnQgaGFzIGRhdGEuXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGhhc0RhdGEoKSB7XHJcbiAgICByZXR1cm4gXy5zb21lKCB0aGlzLmR5bmFtaWNTZXJpZXNBcnJheSwgZHluYW1pY1NlcmllcyA9PiBkeW5hbWljU2VyaWVzLmhhc0RhdGEoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZXMgdGhlIGN1cnNvciB0byB0aGUgc3BlY2lmaWVkIHZhbHVlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcclxuICAgKi9cclxuICBtb3ZlQ3Vyc29yVG9WYWx1ZSggdmFsdWUgKSB7XHJcbiAgICBjb25zdCB2aWV3UG9zaXRpb24gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LmdldCgpLm1vZGVsVG9WaWV3WCggdmFsdWUgKTtcclxuXHJcbiAgICAvLyBrZWVwIHRoZSBjdXJzb3Igd2l0aGluIHRoZSBncmlkIGJvdW5kc1xyXG4gICAgdGhpcy5jaGFydEN1cnNvci5jZW50ZXJYID0gVXRpbHMuY2xhbXAoIHZpZXdQb3NpdGlvbiwgMCwgdGhpcy5jaGFydFdpZHRoICk7XHJcbiAgICB0aGlzLmNoYXJ0Q3Vyc29yLmNlbnRlclkgPSB0aGlzLmdyaWROb2RlLmNlbnRlclk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGcm9tIHRoZSBleGlzdGluZyBkYXRhLCB1cGRhdGUgdGhlIG1pbiBhbmQgbWF4IHJlY29yZGVkIFggdmFsdWVzIGZyb20gYWxsIG9mIHRoZSBkeW5hbWljU2VyaWVzIG9mIHRoaXMgY2hhcnQsXHJcbiAgICogc28gdGhhdCB0aGUgY3Vyc29yIGNhbiBiZSBsaW1pdGVkIHRvIHRoZSByZWNvcmRlZCBkYXRhLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlTWluTWF4UmVjb3JkZWRWYWx1ZXMoKSB7XHJcbiAgICBsZXQgbWluVmFsdWUgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICBsZXQgbWF4VmFsdWUgPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XHJcbiAgICB0aGlzLmR5bmFtaWNTZXJpZXNBcnJheS5mb3JFYWNoKCBkeW5hbWljU2VyaWVzID0+IHtcclxuICAgICAgaWYgKCBkeW5hbWljU2VyaWVzLmdldExlbmd0aCgpID4gMCApIHtcclxuICAgICAgICBjb25zdCBzZXJpZXNNaW5WYWx1ZSA9IGR5bmFtaWNTZXJpZXMuZ2V0RGF0YVBvaW50KCAwICkueDtcclxuICAgICAgICBjb25zdCBzZXJpZXNNYXhWYWx1ZSA9IGR5bmFtaWNTZXJpZXMuZ2V0RGF0YVBvaW50KCBkeW5hbWljU2VyaWVzLmdldExlbmd0aCgpIC0gMSApLng7XHJcbiAgICAgICAgaWYgKCBzZXJpZXNNaW5WYWx1ZSA8IG1pblZhbHVlICkge1xyXG4gICAgICAgICAgbWluVmFsdWUgPSBzZXJpZXNNaW5WYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBzZXJpZXNNYXhWYWx1ZSA+IG1heFZhbHVlICkge1xyXG4gICAgICAgICAgbWF4VmFsdWUgPSBzZXJpZXNNYXhWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm1pblJlY29yZGVkWFZhbHVlID0gbWluVmFsdWU7XHJcbiAgICB0aGlzLm1heFJlY29yZGVkWFZhbHVlID0gbWF4VmFsdWU7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIENoYXJ0Q3Vyc29yIGlzIGEgcmVjdGFuZ3VsYXIgY3Vyc29yIHRoYXQgaW5kaWNhdGVzIHRoZSBjdXJyZW50IG9yIHNlbGVjdGVkIHZhbHVlIG9uIHRoZSBjaGFydC5cclxuICovXHJcbmNsYXNzIENoYXJ0Q3Vyc29yIGV4dGVuZHMgUmVjdGFuZ2xlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtYWUN1cnNvckNoYXJ0Tm9kZX0gY2hhcnRcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxNb2RlbFZpZXdUcmFuc2Zvcm0yPn0gbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNoYXJ0LCBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgc3RhcnREcmFnOiAoKSA9PiB7fSxcclxuICAgICAgZW5kRHJhZzogKCkgPT4ge30sXHJcbiAgICAgIGRyYWc6ICgpID0+IHt9LFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gaWYgdHJ1ZSwgYSBkb3VibGUgaGVhZGVkIGFycm93IHdpbGwgYmUgc2hvd24gdG8gaW5kaWNhdGVcclxuICAgICAgLy8gdGhhdCB0aGUgY3Vyc29yIGlzIGRyYWdnYWJsZSAtIGJlY29tZXMgaW52aXNpYmxlIGFmdGVyIGZpcnN0XHJcbiAgICAgIC8vIGRyYWdcclxuICAgICAgaW5jbHVkZURyYWdDdWU6IGZhbHNlLFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHdpZHRoID0gY2hhcnQuY2hhcnRXaWR0aCAqIFdJRFRIX1BST1BPUlRJT047XHJcbiAgICBjb25zdCBoZWlnaHQgPSBjaGFydC5jaGFydEhlaWdodDtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHNoYXBlLiBPcmlnaW4gaXMgYXQgdGhlIGNlbnRlciB0b3Agb2YgdGhlIHJlY3RhbmdsZS5cclxuICAgIHN1cGVyKCAwLCAtaGVpZ2h0LCB3aWR0aCwgaGVpZ2h0LCAwLCAwLCB7XHJcbiAgICAgIGN1cnNvcjogJ2V3LXJlc2l6ZScsXHJcbiAgICAgIGZpbGw6IENVUlNPUl9GSUxMX0NPTE9SLFxyXG4gICAgICBzdHJva2U6IENVUlNPUl9TVFJPS0VfQ09MT1IsXHJcbiAgICAgIGxpbmVXaWR0aDogMC40LFxyXG4gICAgICBsaW5lRGFzaDogWyA0LCA0IF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5jaGFydCA9IGNoYXJ0O1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkgPSBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBNYWtlIGl0IGVhc2llciB0byBncmFiIHRoaXMgY3Vyc29yIGJ5IGdpdmluZyBpdCBleHBhbmRlZCBtb3VzZSBhbmQgdG91Y2ggYXJlYXMuXHJcbiAgICB0aGlzLm1vdXNlQXJlYSA9IHRoaXMubG9jYWxCb3VuZHMuZGlsYXRlZFgoIDEyICk7XHJcbiAgICB0aGlzLnRvdWNoQXJlYSA9IHRoaXMubG9jYWxCb3VuZHMuZGlsYXRlZFgoIDEyICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuaW5jbHVkZURyYWdDdWUgPSBvcHRpb25zLmluY2x1ZGVEcmFnQ3VlO1xyXG5cclxuICAgIGlmICggdGhpcy5pbmNsdWRlRHJhZ0N1ZSApIHtcclxuXHJcbiAgICAgIC8vIEBwcml2YXRlIC0gaW5kaWNhdGVzIHRvIHRoZSB1c2VyIHRoYXQgdGhlIGN1cnNvciBpcyBkcmFnZ2FibGUsIG9ubHkgY3JlYXRlZFxyXG4gICAgICAvLyBhbmQgYWRkZWQgaWYgbmVjZXNzYXJ5XHJcbiAgICAgIHRoaXMuZHJhZ0N1ZUFycm93Tm9kZSA9IG5ldyBBcnJvd05vZGUoIC13aWR0aCAqIDIsIDAsIHdpZHRoICogMiwgMCwge1xyXG4gICAgICAgIGRvdWJsZUhlYWQ6IHRydWUsXHJcbiAgICAgICAgaGVhZFdpZHRoOiAxMixcclxuICAgICAgICBoZWFkSGVpZ2h0OiAxMCxcclxuICAgICAgICBmaWxsOiBBUlJPV19DVUVfRklMTF9DT0xPUixcclxuICAgICAgICBzdHJva2U6IEFSUk9XX0NVRV9TVFJPS0VfQ09MT1IsXHJcbiAgICAgICAgY2VudGVyOiB0aGlzLmNlbnRlci5wbHVzWFkoIDAsIGhlaWdodCAqIDAuNCApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZHJhZ0N1ZUFycm93Tm9kZSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCB0aGUgaW5kZW50YXRpb25zIHRoYXQgYXJlIGludGVuZGVkIHRvIGNvbnZleSB0aGUgaWRlYSBvZiBcImdyaXBhYmlsaXR5XCIuXHJcbiAgICBjb25zdCBncmlwcHlOb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIGNvbnN0IGluZGVudFNwYWNpbmcgPSBoZWlnaHQgKiAwLjA1O1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgMzsgaSsrICkge1xyXG4gICAgICBjb25zdCBpbmRlbnROb2RlID0gbmV3IEdyaXBweUluZGVudE5vZGUoIHdpZHRoIC8gMiwgQ1VSU09SX0ZJTExfQ09MT1IgKTtcclxuICAgICAgaW5kZW50Tm9kZS50b3AgPSBpICogKCBpbmRlbnROb2RlLmhlaWdodCArIGluZGVudFNwYWNpbmcgKTtcclxuICAgICAgZ3JpcHB5Tm9kZS5hZGRDaGlsZCggaW5kZW50Tm9kZSApO1xyXG4gICAgfVxyXG4gICAgZ3JpcHB5Tm9kZS5jZW50ZXIgPSB0aGlzLmNlbnRlcjtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGdyaXBweU5vZGUgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHNvIHRoYXQgd2UgY2FuIGludGVycnVwdCB0aGUgRHJhZ0xpc3RlbmVyIGlmIG5lY2Vzc2FyeVxyXG4gICAgdGhpcy5kcmFnTGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIHN0YXJ0OiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNoYXJ0Lmhhc0RhdGEoKSwgJ2NoYXJ0IHNob3VsZCBoYXZlIGRhdGEgZm9yIHRoZSBjdXJzb3IgdG8gYmUgZHJhZ2dhYmxlJyApO1xyXG4gICAgICAgIG9wdGlvbnMuc3RhcnREcmFnKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGRyYWc6ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBhcmVudFggPSBsaXN0ZW5lci5wYXJlbnRQb2ludC54O1xyXG4gICAgICAgIGxldCBuZXdWYWx1ZSA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkuZ2V0KCkudmlld1RvTW9kZWxYKCBwYXJlbnRYICk7XHJcblxyXG4gICAgICAgIC8vIGxpbWl0IGN1cnNvciB0byB0aGUgZG9tYWluIG9mIHJlY29yZGVkIHZhbHVlc1xyXG4gICAgICAgIG5ld1ZhbHVlID0gVXRpbHMuY2xhbXAoIG5ld1ZhbHVlLCB0aGlzLmNoYXJ0Lm1pblJlY29yZGVkWFZhbHVlLCB0aGlzLmNoYXJ0Lm1heFJlY29yZGVkWFZhbHVlICk7XHJcbiAgICAgICAgdGhpcy5jaGFydC5zZXRDdXJzb3JWYWx1ZSggbmV3VmFsdWUgKTtcclxuXHJcbiAgICAgICAgb3B0aW9ucy5kcmFnKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGVuZDogKCkgPT4ge1xyXG4gICAgICAgIG9wdGlvbnMuZW5kRHJhZygpO1xyXG5cclxuICAgICAgICAvLyBubyBuZWVkIHRvIHNob3cgYXJyb3cgYWZ0ZXIgdXNlciBzdWNjZXNzZnVsbHkgZHJhZ3MgdGhlIGN1cnNvclxyXG4gICAgICAgIGlmICggdGhpcy5pbmNsdWRlRHJhZ0N1ZSApIHtcclxuICAgICAgICAgIHRoaXMuZHJhZ0N1ZUFycm93Tm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdMaXN0ZW5lcicgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLmRyYWdMaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJydXB0cyBkcmFnZ2luZyBvZiB0aGUgY3Vyc29yLCB1c2VmdWwgd2hlbiBDaGFydEN1cnNvciB2aXNpYmlsaXR5IGNoYW5nZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGludGVycnVwdERyYWcoKSB7XHJcbiAgICB0aGlzLmRyYWdMaXN0ZW5lci5pbnRlcnJ1cHQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgQ2hhcnRDdXJzb3IgdG8gaXRzIGluaXRpYWwgc3RhdGUuIE5vdGUgdGhhdCB0aGlzIGRvZXMgbm90IG1vZGlmeSBkYXRhXHJcbiAgICogb3IgdGhlIGN1cnNvciBwb3NpdGlvbiAoY3Vyc29yVmFsdWUpLCBvbmx5IGFzcGVjdHMgb2YgdGhlIHZpZXcgZm9yIHRoZSBjdXJzb3IgaXRzZWxmLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIGlmICggdGhpcy5pbmNsdWRlRHJhZ0N1ZSApIHtcclxuICAgICAgdGhpcy5kcmFnQ3VlQXJyb3dOb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdyaXBweUluZGVudE5vZGUgaXMgYSBzbWFsbCByb3VuZCBpbmRlbnRhdGlvbiBvbiBhIHN1cmZhY2UuICBUaGlzIGlzIGEgbW9kZXJuIHVzZXIgaW50ZXJmYWNlIHBhcmFkaWdtIHRoYXRcclxuICogaXMgaW50ZW5kZWQgdG8gY29udmV5IHRoZSBjb25jZXB0IG9mIFwiZ3JpcGFiaWxpdHlcIiwgaS5lLiBzb21ldGhpbmcgdGhhdCB0aGUgdXNlciBjYW4gZ3JhYi4gIFRoaXMgaXMgbWVhbnQgdG9cclxuICogbG9vayBzb21ld2hhdCAzRCwgbXVjaCBsaWtlIGV0Y2hlZCBib3JkZXJzIGRvLlxyXG4gKi9cclxuY2xhc3MgR3JpcHB5SW5kZW50Tm9kZSBleHRlbmRzIENpcmNsZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkaWFtZXRlclxyXG4gICAqIEBwYXJhbSB7Q29sb3J9IGJhc2VDb2xvclxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZGlhbWV0ZXIsIGJhc2VDb2xvciwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgbGluZVdpZHRoOiAwLjVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBiYXNlRGFya2VyQ29sb3IgPSBiYXNlQ29sb3IuZGFya2VyQ29sb3IoIDAuOSApO1xyXG4gICAgY29uc3QgdHJhbnNsdWNlbnREYXJrZXJDb2xvciA9IG5ldyBDb2xvciggYmFzZURhcmtlckNvbG9yLmdldFJlZCgpLCBiYXNlRGFya2VyQ29sb3IuZ2V0R3JlZW4oKSxcclxuICAgICAgYmFzZURhcmtlckNvbG9yLmdldEJsdWUoKSwgYmFzZUNvbG9yLmdldEFscGhhKCkgKTtcclxuICAgIGNvbnN0IGJhc2VMaWdodGVyQ29sb3IgPSBiYXNlQ29sb3IuYnJpZ2h0ZXJDb2xvciggMC45ICk7XHJcbiAgICBjb25zdCB0cmFuc2x1Y2VudEJyaWdodGVyQ29sb3IgPSBuZXcgQ29sb3IoIGJhc2VMaWdodGVyQ29sb3IuZ2V0UmVkKCksIGJhc2VMaWdodGVyQ29sb3IuZ2V0R3JlZW4oKSxcclxuICAgICAgYmFzZUxpZ2h0ZXJDb2xvci5nZXRCbHVlKCksIGJhc2VDb2xvci5nZXRBbHBoYSgpICk7XHJcbiAgICBjb25zdCByYWRpdXMgPSBkaWFtZXRlciAvIDIgLSBvcHRpb25zLmxpbmVXaWR0aDtcclxuXHJcbiAgICBzdXBlciggcmFkaXVzLCB7XHJcbiAgICAgIGZpbGw6IHRyYW5zbHVjZW50RGFya2VyQ29sb3IsXHJcbiAgICAgIHN0cm9rZTogdHJhbnNsdWNlbnRCcmlnaHRlckNvbG9yLFxyXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMubGluZVdpZHRoXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmlkZGxlLnJlZ2lzdGVyKCAnWFlDdXJzb3JDaGFydE5vZGUnLCBYWUN1cnNvckNoYXJ0Tm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBYWUN1cnNvckNoYXJ0Tm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLHVCQUF1QjtBQUN6QyxPQUFPQyxrQkFBa0IsTUFBTSwwQ0FBMEM7QUFDekUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxTQUFTLE1BQU0sb0NBQW9DO0FBQzFELFNBQVNDLE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxZQUFZLEVBQUVDLElBQUksRUFBRUMsU0FBUyxRQUFRLDZCQUE2QjtBQUMxRixPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBQ2xDLE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7O0FBRTFDO0FBQ0EsTUFBTUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDaEMsTUFBTUMsaUJBQWlCLEdBQUcsSUFBSVIsS0FBSyxDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztBQUN2RCxNQUFNUyxtQkFBbUIsR0FBR1QsS0FBSyxDQUFD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