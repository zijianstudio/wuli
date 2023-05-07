// Copyright 2019-2023, University of Colorado Boulder

/**
 * Provides simulation-specific values and customizations to display time-series data in a chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import CanvasLinePlot from '../../../bamboo/js/CanvasLinePlot.js';
import ChartCanvasNode from '../../../bamboo/js/ChartCanvasNode.js';
import ChartRectangle from '../../../bamboo/js/ChartRectangle.js';
import ChartTransform from '../../../bamboo/js/ChartTransform.js';
import CanvasGridLineSet from '../../../bamboo/js/CanvasGridLineSet.js';
import TickLabelSet from '../../../bamboo/js/TickLabelSet.js';
import ScatterPlot from '../../../bamboo/js/ScatterPlot.js';
import SpanNode from '../../../bamboo/js/SpanNode.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import MagnifyingGlassZoomButtonGroup from '../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import ShadedRectangle from '../../../scenery-phet/js/ShadedRectangle.js';
import WireNode from '../../../scenery-phet/js/WireNode.js';
import { DragListener, Node, Text } from '../../../scenery/js/imports.js';
import ButtonNode from '../../../sun/js/buttons/ButtonNode.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import Meter from '../model/Meter.js';
import CCKCProbeNode from './CCKCProbeNode.js';
import Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';
const oneSecondStringProperty = CircuitConstructionKitCommonStrings.oneSecondStringProperty;
const timeStringProperty = CircuitConstructionKitCommonStrings.timeStringProperty;

// constants
const AXIS_LABEL_FILL = 'white';
const LABEL_FONT_SIZE = 14;

// For the wires
const NORMAL_DISTANCE = 25;
const WIRE_LINE_WIDTH = 3;
const MAX_AXIS_LABEL_WIDTH = 120;
export default class CCKCChartNode extends Node {
  // emits when the probes should be put in standard relative position to the body

  // emits when the CCKCChartNode has been dropped

  /**
   * @param circuitNode
   * @param timeProperty
   * @param visibleBoundsProperty
   * @param series
   * @param verticalAxisLabel
   * @param [providedOptions]
   */
  constructor(circuitNode, timeProperty, visibleBoundsProperty, series, verticalAxisLabel, providedOptions) {
    const options = optionize()({
      defaultZoomLevel: new Range(-2, 2),
      // Prevent adjustment of the control panel rendering while dragging,
      // see https://github.com/phetsims/wave-interference/issues/212
      preventFit: true
    }, providedOptions);
    const backgroundNode = new Node({
      cursor: 'pointer'
    });
    super();
    const tandem = options.tandem;
    this.meter = new Meter(tandem.createTandem('meter'), 0);
    this.series = series;
    this.circuitNode = circuitNode;
    this.timeProperty = timeProperty;
    this.visibleBoundsProperty = visibleBoundsProperty;

    // shows the background for the chart.  Any attached probes or other
    // supplemental nodes should not be children of the backgroundNode if they need to translate independently.
    this.backgroundNode = backgroundNode;

    // set in initializeBodyDragListener
    this.backgroundDragListener = null;
    this.addChild(this.backgroundNode);

    // Mutate after backgroundNode is added as a child
    this.mutate(options);
    this.alignProbesEmitter = new Emitter();

    // These do not need to be disposed because there is no connection to the "outside world"
    const leftBottomProperty = new DerivedProperty([backgroundNode.boundsProperty], bounds => bounds.leftBottom);
    this.droppedEmitter = new Emitter();

    // for attaching probes
    this.aboveBottomLeft1Property = new DerivedProperty([leftBottomProperty], position => position.isFinite() ? position.plusXY(0, -20) : Vector2.ZERO);

    // for attaching probes
    this.aboveBottomLeft2Property = new DerivedProperty([leftBottomProperty], position => position.isFinite() ? position.plusXY(0, -10) : Vector2.ZERO);
    const chartTransform = new ChartTransform({
      viewWidth: 150,
      viewHeight: 100,
      modelXRange: new Range(0, 4.25),
      modelYRange: new Range(-2, 2)
    });
    const chartBackground = new ChartRectangle(chartTransform, {
      fill: 'white',
      cornerXRadius: 6,
      cornerYRadius: 6
    });
    const horizontalAxisTitleNode = new Text(timeStringProperty, {
      fontSize: LABEL_FONT_SIZE,
      fill: AXIS_LABEL_FILL,
      centerTop: chartBackground.centerBottom.plusXY(0, 5),
      maxWidth: MAX_AXIS_LABEL_WIDTH
    });
    const scaleIndicatorText = new Text(oneSecondStringProperty, {
      fontSize: 11,
      fill: 'white'
    });
    const zoomRanges = [new Range(-1200, 1200), new Range(-1000, 1000), new Range(-800, 800), new Range(-600, 600), new Range(-400, 400), new Range(-200, 200), new Range(-150, 150), new Range(-100, 100), new Range(-50, 50), new Range(-20, 20), new Range(-10, 10), new Range(-2, 2), new Range(-0.4, 0.4)];
    const initialZoomIndex = zoomRanges.findIndex(e => e.equals(options.defaultZoomLevel));
    this.zoomLevelProperty = new NumberProperty(initialZoomIndex, {
      range: new Range(0, zoomRanges.length - 1),
      tandem: tandem.createTandem('zoomLevelProperty')
    });
    const gridLineOptions = {
      stroke: 'lightGray',
      lineDash: [5, 5],
      lineWidth: 0.8,
      lineDashOffset: 5 / 2
    };
    const horizontalGridLineSet = new CanvasGridLineSet(chartTransform, Orientation.HORIZONTAL, 1, gridLineOptions);
    const verticalGridLineSet = new CanvasGridLineSet(chartTransform, Orientation.VERTICAL, 1, gridLineOptions);
    const verticalLabelSet = new TickLabelSet(chartTransform, Orientation.VERTICAL, 1, {
      edge: 'min',
      extent: 1.5,
      createLabel: value => new Text(Utils.toFixed(value, this.zoomLevelProperty.value === zoomRanges.length - 1 ? 1 : 0), {
        fontSize: 10,
        fill: 'white'
      })
    });
    const zoomButtonGroup = new MagnifyingGlassZoomButtonGroup(this.zoomLevelProperty, {
      orientation: 'vertical',
      left: chartBackground.right + 2,
      top: chartBackground.top,
      touchAreaXDilation: 6,
      touchAreaYDilation: 6,
      magnifyingGlassNodeOptions: {
        glassRadius: 10,
        maxWidth: 15
      },
      buttonOptions: {
        baseColor: 'white',
        buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
        cornerRadius: 0,
        xMargin: 3,
        yMargin: 3
      },
      tandem: tandem.createTandem('zoomButtonGroup')
    });
    this.zoomLevelProperty.link(zoomLevel => {
      chartTransform.setModelYRange(zoomRanges[zoomLevel]);
      verticalGridLineSet.setSpacing(zoomRanges[zoomLevel].max / 2);
      verticalLabelSet.setSpacing(zoomRanges[zoomLevel].max / 2);
    });
    const penData = [new Vector2(0, 0)];
    const pen = new ScatterPlot(chartTransform, penData, {
      fill: '#717274',
      stroke: '#717274',
      radius: 4
    });
    this.updatePen = () => {
      penData[0].x = timeProperty.value;
      const length = series.length;
      if (length > 0) {
        const point = series[length - 1];
        penData[0].y = point === null ? 0 : point.y;
      } else {
        penData[0].y = 0;
      }
      pen.update();
    };
    timeProperty.link(time => {
      // Show 4 seconds, plus a lead time of 0.25 sec
      chartTransform.setModelXRange(new Range(time - 4, time + 0.25));
      verticalGridLineSet.setLineDashOffset(time * chartTransform.modelToViewDelta(Orientation.HORIZONTAL, 1));
      this.updatePen();
    });
    const linePlot = new ChartCanvasNode(chartTransform, [horizontalGridLineSet, verticalGridLineSet, new CanvasLinePlot(chartTransform, series, {
      stroke: '#717274',
      lineWidth: 1.5
    })]);

    // Show a text message when there is data, but none of the data is in range.
    const dataOutOfRangeMessage = new Text(CircuitConstructionKitCommonStrings.dataOutOfRangeStringProperty, {
      fill: 'red',
      centerX: linePlot.centerX,
      centerY: linePlot.centerY,
      fontSize: 13,
      maxWidth: chartTransform.viewWidth - 20
    });
    const updateDataOutOfRangeMessage = () => {
      let showOutOfRangeMessage = true;

      // If any point is in the displayed range, we don't want to show the data out of range message
      series.forEach(point => {
        if (point && chartTransform.modelXRange.contains(point.x) && chartTransform.modelYRange.contains(point.y)) {
          showOutOfRangeMessage = false;
        }
      });

      // This is the same as the logic in updatePen.  If the pen is shown at 0, then we don't want to display the
      // data out of range message
      const lastPointIsNull = series.length > 0 && series[series.length - 1] === null;
      if (lastPointIsNull || series.length === 0) {
        showOutOfRangeMessage = false;
      }
      dataOutOfRangeMessage.setVisible(showOutOfRangeMessage);
    };
    updateDataOutOfRangeMessage();
    series.addItemAddedListener(() => {
      linePlot.update();
      this.updatePen();
      updateDataOutOfRangeMessage();
    });
    series.addItemRemovedListener(() => {
      linePlot.update();
      this.updatePen();
      updateDataOutOfRangeMessage();
    });

    // Anything you want clipped goes in here
    const chartClip = new Node({
      clipArea: chartBackground.getShape(),
      children: [linePlot, dataOutOfRangeMessage, pen]
    });
    const verticalAxisTitleNode = new Text(verticalAxisLabel, {
      rotation: -Math.PI / 2,
      fontSize: LABEL_FONT_SIZE,
      fill: AXIS_LABEL_FILL,
      rightCenter: verticalLabelSet.leftCenter.plusXY(-10, 0),
      maxWidth: MAX_AXIS_LABEL_WIDTH
    });
    const spanNode = new SpanNode(chartTransform, Orientation.HORIZONTAL, 1, scaleIndicatorText, {
      color: 'white',
      left: chartBackground.left,
      top: chartBackground.bottom + 3
    });
    const chartNode = new Node({
      children: [chartBackground, chartClip, zoomButtonGroup, verticalAxisTitleNode, horizontalAxisTitleNode, verticalLabelSet, spanNode]
    });

    // Forbid overlap between the horizontal axis label and the span node
    const padding = 5;
    if (horizontalAxisTitleNode.left < spanNode.right + padding) {
      horizontalAxisTitleNode.left = spanNode.right + padding;
    }
    const shadedRectangle = new ShadedRectangle(chartNode.bounds.dilated(7), {
      baseColor: '#327198'
    });
    shadedRectangle.addChild(chartNode);
    backgroundNode.addChild(shadedRectangle);
    this.meter.isActiveProperty.link(isActive => this.setVisible(isActive));
    this.meter.bodyPositionProperty.link(bodyPosition => backgroundNode.setCenter(bodyPosition));
  }

  /**
   * @param color
   * @param wireColor
   * @param dx - initial relative x coordinate for the probe
   * @param dy - initial relative y coordinate for the probe
   * @param connectionProperty
   * @param tandem
   */
  addProbeNode(color, wireColor, dx, dy, connectionProperty, tandem) {
    const probeNode = new CCKCProbeNode(this, this.visibleBoundsProperty, {
      color: color,
      tandem: tandem
    });

    // Add the wire behind the probe.
    this.addChild(new WireNode(connectionProperty, new Vector2Property(new Vector2(-NORMAL_DISTANCE, 0)), new DerivedProperty([probeNode.boundsProperty], bounds => bounds.centerBottom), new Vector2Property(new Vector2(0, NORMAL_DISTANCE)), {
      lineWidth: WIRE_LINE_WIDTH,
      stroke: wireColor
    }));
    this.addChild(probeNode);

    // Standard position in toolbox and when dragging out of toolbox.
    const alignProbes = () => {
      probeNode.mutate({
        right: this.backgroundNode.left - dx,
        top: this.backgroundNode.top + dy
      });

      // Prevent the probes from going out of the visible bounds when tagging along with the dragged CCKCChartNode
      probeNode.translation = this.visibleBoundsProperty.value.closestPointTo(probeNode.translation);
    };
    this.visibleProperty.link(alignProbes);
    this.alignProbesEmitter.addListener(alignProbes);
    return probeNode;
  }

  /**
   * Clear the data from the chart.
   */
  reset() {
    this.series.clear();
    this.meter.reset();
    this.zoomLevelProperty.reset();
  }

  /**
   * Gets the region of the background in global coordinates.  This can be used to determine if the chart
   * should be dropped back in a toolbox.
   */
  getBackgroundNodeGlobalBounds() {
    return this.localToGlobalBounds(this.backgroundNode.bounds);
  }

  /**
   * Forward an event from the toolbox to start dragging the node in the play area.  This triggers the probes (if any)
   * to drag together with the chart.  This is accomplished by calling this.alignProbes() at each drag event.
   */
  startDrag(event) {
    // Forward the event to the drag listener
    this.backgroundDragListener && this.backgroundDragListener.press(event);
  }

  /**
   * For a CCKCChartNode that is not an icon, add a listener that
   * (1) drags the body
   * (2) constrains the drag to the screenView bounds
   * (3) drops back into the toolbox
   */
  initializeBodyDragListener(screenView) {
    // Since this will be shown from the toolbox, make the play area icon invisible and prepare to drag with probes
    this.meter.isActiveProperty.value = false;
    this.meter.isDraggingProbesWithBodyProperty.value = true;
    const dragBoundsProperty = new Property(null);
    const dragListener = new DragListener({
      allowTouchSnag: false,
      // allow the zoom buttons to be pressed with the mouse
      positionProperty: this.meter.bodyPositionProperty,
      useParentOffset: true,
      dragBoundsProperty: dragBoundsProperty,
      // adds support for zoomed coordinate frame, see
      // https://github.com/phetsims/circuit-construction-kit-common/issues/301
      targetNode: this,
      tandem: this.tandem.createTandem('dragListener'),
      start: () => {
        this.moveToFront();
        if (this.meter.isDraggingProbesWithBodyProperty.value) {
          // Align the probes each time the chart translates, so they will stay in sync
          this.alignProbesEmitter.emit();
        }
      },
      drag: () => {
        if (this.meter.isDraggingProbesWithBodyProperty.value) {
          // Align the probes each time the chart translates, so they will stay in sync
          this.alignProbesEmitter.emit();
        }
      },
      end: () => {
        // Drop in the toolbox if the center of the chart is within the sensor toolbox bounds
        if (screenView.sensorToolbox.globalBounds.containsPoint(this.getBackgroundNodeGlobalBounds().center)) {
          this.alignProbesEmitter.emit();
          this.reset();
        }

        // Move probes to center line (if water side view model)
        this.droppedEmitter.emit();
        this.meter.isDraggingProbesWithBodyProperty.value = false;
      }
    });
    const update = () => {
      const bounds = screenView.visibleBoundsProperty.value.eroded(CCKCConstants.DRAG_BOUNDS_EROSION);
      const globalBounds = screenView.localToGlobalBounds(bounds);
      dragBoundsProperty.value = this.globalToParentBounds(globalBounds);
      this.meter.bodyPositionProperty.value = dragBoundsProperty.value.closestPointTo(this.meter.bodyPositionProperty.value);
    };
    screenView.visibleBoundsProperty.link(update);
    this.circuitNode.transformEmitter.addListener(update);
    this.backgroundDragListener = dragListener;
    this.backgroundNode.addInputListener(dragListener);
  }
}
circuitConstructionKitCommon.register('CCKCChartNode', CCKCChartNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJDYW52YXNMaW5lUGxvdCIsIkNoYXJ0Q2FudmFzTm9kZSIsIkNoYXJ0UmVjdGFuZ2xlIiwiQ2hhcnRUcmFuc2Zvcm0iLCJDYW52YXNHcmlkTGluZVNldCIsIlRpY2tMYWJlbFNldCIsIlNjYXR0ZXJQbG90IiwiU3Bhbk5vZGUiLCJSYW5nZSIsIlV0aWxzIiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIk9yaWVudGF0aW9uIiwiTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwIiwiU2hhZGVkUmVjdGFuZ2xlIiwiV2lyZU5vZGUiLCJEcmFnTGlzdGVuZXIiLCJOb2RlIiwiVGV4dCIsIkJ1dHRvbk5vZGUiLCJDQ0tDQ29uc3RhbnRzIiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiIsIkNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb25TdHJpbmdzIiwiTWV0ZXIiLCJDQ0tDUHJvYmVOb2RlIiwiUHJvcGVydHkiLCJvcHRpb25pemUiLCJvbmVTZWNvbmRTdHJpbmdQcm9wZXJ0eSIsInRpbWVTdHJpbmdQcm9wZXJ0eSIsIkFYSVNfTEFCRUxfRklMTCIsIkxBQkVMX0ZPTlRfU0laRSIsIk5PUk1BTF9ESVNUQU5DRSIsIldJUkVfTElORV9XSURUSCIsIk1BWF9BWElTX0xBQkVMX1dJRFRIIiwiQ0NLQ0NoYXJ0Tm9kZSIsImNvbnN0cnVjdG9yIiwiY2lyY3VpdE5vZGUiLCJ0aW1lUHJvcGVydHkiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJzZXJpZXMiLCJ2ZXJ0aWNhbEF4aXNMYWJlbCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJkZWZhdWx0Wm9vbUxldmVsIiwicHJldmVudEZpdCIsImJhY2tncm91bmROb2RlIiwiY3Vyc29yIiwidGFuZGVtIiwibWV0ZXIiLCJjcmVhdGVUYW5kZW0iLCJiYWNrZ3JvdW5kRHJhZ0xpc3RlbmVyIiwiYWRkQ2hpbGQiLCJtdXRhdGUiLCJhbGlnblByb2Jlc0VtaXR0ZXIiLCJsZWZ0Qm90dG9tUHJvcGVydHkiLCJib3VuZHNQcm9wZXJ0eSIsImJvdW5kcyIsImxlZnRCb3R0b20iLCJkcm9wcGVkRW1pdHRlciIsImFib3ZlQm90dG9tTGVmdDFQcm9wZXJ0eSIsInBvc2l0aW9uIiwiaXNGaW5pdGUiLCJwbHVzWFkiLCJaRVJPIiwiYWJvdmVCb3R0b21MZWZ0MlByb3BlcnR5IiwiY2hhcnRUcmFuc2Zvcm0iLCJ2aWV3V2lkdGgiLCJ2aWV3SGVpZ2h0IiwibW9kZWxYUmFuZ2UiLCJtb2RlbFlSYW5nZSIsImNoYXJ0QmFja2dyb3VuZCIsImZpbGwiLCJjb3JuZXJYUmFkaXVzIiwiY29ybmVyWVJhZGl1cyIsImhvcml6b250YWxBeGlzVGl0bGVOb2RlIiwiZm9udFNpemUiLCJjZW50ZXJUb3AiLCJjZW50ZXJCb3R0b20iLCJtYXhXaWR0aCIsInNjYWxlSW5kaWNhdG9yVGV4dCIsInpvb21SYW5nZXMiLCJpbml0aWFsWm9vbUluZGV4IiwiZmluZEluZGV4IiwiZSIsImVxdWFscyIsInpvb21MZXZlbFByb3BlcnR5IiwicmFuZ2UiLCJsZW5ndGgiLCJncmlkTGluZU9wdGlvbnMiLCJzdHJva2UiLCJsaW5lRGFzaCIsImxpbmVXaWR0aCIsImxpbmVEYXNoT2Zmc2V0IiwiaG9yaXpvbnRhbEdyaWRMaW5lU2V0IiwiSE9SSVpPTlRBTCIsInZlcnRpY2FsR3JpZExpbmVTZXQiLCJWRVJUSUNBTCIsInZlcnRpY2FsTGFiZWxTZXQiLCJlZGdlIiwiZXh0ZW50IiwiY3JlYXRlTGFiZWwiLCJ2YWx1ZSIsInRvRml4ZWQiLCJ6b29tQnV0dG9uR3JvdXAiLCJvcmllbnRhdGlvbiIsImxlZnQiLCJyaWdodCIsInRvcCIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsIm1hZ25pZnlpbmdHbGFzc05vZGVPcHRpb25zIiwiZ2xhc3NSYWRpdXMiLCJidXR0b25PcHRpb25zIiwiYmFzZUNvbG9yIiwiYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5IiwiRmxhdEFwcGVhcmFuY2VTdHJhdGVneSIsImNvcm5lclJhZGl1cyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwibGluayIsInpvb21MZXZlbCIsInNldE1vZGVsWVJhbmdlIiwic2V0U3BhY2luZyIsIm1heCIsInBlbkRhdGEiLCJwZW4iLCJyYWRpdXMiLCJ1cGRhdGVQZW4iLCJ4IiwicG9pbnQiLCJ5IiwidXBkYXRlIiwidGltZSIsInNldE1vZGVsWFJhbmdlIiwic2V0TGluZURhc2hPZmZzZXQiLCJtb2RlbFRvVmlld0RlbHRhIiwibGluZVBsb3QiLCJkYXRhT3V0T2ZSYW5nZU1lc3NhZ2UiLCJkYXRhT3V0T2ZSYW5nZVN0cmluZ1Byb3BlcnR5IiwiY2VudGVyWCIsImNlbnRlclkiLCJ1cGRhdGVEYXRhT3V0T2ZSYW5nZU1lc3NhZ2UiLCJzaG93T3V0T2ZSYW5nZU1lc3NhZ2UiLCJmb3JFYWNoIiwiY29udGFpbnMiLCJsYXN0UG9pbnRJc051bGwiLCJzZXRWaXNpYmxlIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwiY2hhcnRDbGlwIiwiY2xpcEFyZWEiLCJnZXRTaGFwZSIsImNoaWxkcmVuIiwidmVydGljYWxBeGlzVGl0bGVOb2RlIiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJyaWdodENlbnRlciIsImxlZnRDZW50ZXIiLCJzcGFuTm9kZSIsImNvbG9yIiwiYm90dG9tIiwiY2hhcnROb2RlIiwicGFkZGluZyIsInNoYWRlZFJlY3RhbmdsZSIsImRpbGF0ZWQiLCJpc0FjdGl2ZVByb3BlcnR5IiwiaXNBY3RpdmUiLCJib2R5UG9zaXRpb25Qcm9wZXJ0eSIsImJvZHlQb3NpdGlvbiIsInNldENlbnRlciIsImFkZFByb2JlTm9kZSIsIndpcmVDb2xvciIsImR4IiwiZHkiLCJjb25uZWN0aW9uUHJvcGVydHkiLCJwcm9iZU5vZGUiLCJhbGlnblByb2JlcyIsInRyYW5zbGF0aW9uIiwiY2xvc2VzdFBvaW50VG8iLCJ2aXNpYmxlUHJvcGVydHkiLCJhZGRMaXN0ZW5lciIsInJlc2V0IiwiY2xlYXIiLCJnZXRCYWNrZ3JvdW5kTm9kZUdsb2JhbEJvdW5kcyIsImxvY2FsVG9HbG9iYWxCb3VuZHMiLCJzdGFydERyYWciLCJldmVudCIsInByZXNzIiwiaW5pdGlhbGl6ZUJvZHlEcmFnTGlzdGVuZXIiLCJzY3JlZW5WaWV3IiwiaXNEcmFnZ2luZ1Byb2Jlc1dpdGhCb2R5UHJvcGVydHkiLCJkcmFnQm91bmRzUHJvcGVydHkiLCJkcmFnTGlzdGVuZXIiLCJhbGxvd1RvdWNoU25hZyIsInBvc2l0aW9uUHJvcGVydHkiLCJ1c2VQYXJlbnRPZmZzZXQiLCJ0YXJnZXROb2RlIiwic3RhcnQiLCJtb3ZlVG9Gcm9udCIsImVtaXQiLCJkcmFnIiwiZW5kIiwic2Vuc29yVG9vbGJveCIsImdsb2JhbEJvdW5kcyIsImNvbnRhaW5zUG9pbnQiLCJjZW50ZXIiLCJlcm9kZWQiLCJEUkFHX0JPVU5EU19FUk9TSU9OIiwiZ2xvYmFsVG9QYXJlbnRCb3VuZHMiLCJ0cmFuc2Zvcm1FbWl0dGVyIiwiYWRkSW5wdXRMaXN0ZW5lciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ0NLQ0NoYXJ0Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQcm92aWRlcyBzaW11bGF0aW9uLXNwZWNpZmljIHZhbHVlcyBhbmQgY3VzdG9taXphdGlvbnMgdG8gZGlzcGxheSB0aW1lLXNlcmllcyBkYXRhIGluIGEgY2hhcnQuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IENhbnZhc0xpbmVQbG90IGZyb20gJy4uLy4uLy4uL2JhbWJvby9qcy9DYW52YXNMaW5lUGxvdC5qcyc7XHJcbmltcG9ydCBDaGFydENhbnZhc05vZGUgZnJvbSAnLi4vLi4vLi4vYmFtYm9vL2pzL0NoYXJ0Q2FudmFzTm9kZS5qcyc7XHJcbmltcG9ydCBDaGFydFJlY3RhbmdsZSBmcm9tICcuLi8uLi8uLi9iYW1ib28vanMvQ2hhcnRSZWN0YW5nbGUuanMnO1xyXG5pbXBvcnQgQ2hhcnRUcmFuc2Zvcm0gZnJvbSAnLi4vLi4vLi4vYmFtYm9vL2pzL0NoYXJ0VHJhbnNmb3JtLmpzJztcclxuaW1wb3J0IENhbnZhc0dyaWRMaW5lU2V0IGZyb20gJy4uLy4uLy4uL2JhbWJvby9qcy9DYW52YXNHcmlkTGluZVNldC5qcyc7XHJcbmltcG9ydCBUaWNrTGFiZWxTZXQgZnJvbSAnLi4vLi4vLi4vYmFtYm9vL2pzL1RpY2tMYWJlbFNldC5qcyc7XHJcbmltcG9ydCBTY2F0dGVyUGxvdCBmcm9tICcuLi8uLi8uLi9iYW1ib28vanMvU2NhdHRlclBsb3QuanMnO1xyXG5pbXBvcnQgU3Bhbk5vZGUgZnJvbSAnLi4vLi4vLi4vYmFtYm9vL2pzL1NwYW5Ob2RlLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xyXG5pbXBvcnQgTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgU2hhZGVkUmVjdGFuZ2xlIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TaGFkZWRSZWN0YW5nbGUuanMnO1xyXG5pbXBvcnQgV2lyZU5vZGUgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1dpcmVOb2RlLmpzJztcclxuaW1wb3J0IHsgRHJhZ0xpc3RlbmVyLCBOb2RlLCBOb2RlT3B0aW9ucywgUHJlc3NMaXN0ZW5lckV2ZW50LCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEJ1dHRvbk5vZGUgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvQnV0dG9uTm9kZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBDQ0tDQ29uc3RhbnRzIGZyb20gJy4uL0NDS0NDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiBmcm9tICcuLi9jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLmpzJztcclxuaW1wb3J0IENpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb25TdHJpbmdzIGZyb20gJy4uL0NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IE1ldGVyIGZyb20gJy4uL21vZGVsL01ldGVyLmpzJztcclxuaW1wb3J0IENDS0NQcm9iZU5vZGUgZnJvbSAnLi9DQ0tDUHJvYmVOb2RlLmpzJztcclxuaW1wb3J0IENpcmN1aXROb2RlIGZyb20gJy4vQ2lyY3VpdE5vZGUuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IENDS0NTY3JlZW5WaWV3IGZyb20gJy4vQ0NLQ1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xyXG5cclxuY29uc3Qgb25lU2Vjb25kU3RyaW5nUHJvcGVydHkgPSBDaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncy5vbmVTZWNvbmRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgdGltZVN0cmluZ1Byb3BlcnR5ID0gQ2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vblN0cmluZ3MudGltZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEFYSVNfTEFCRUxfRklMTCA9ICd3aGl0ZSc7XHJcbmNvbnN0IExBQkVMX0ZPTlRfU0laRSA9IDE0O1xyXG5cclxuLy8gRm9yIHRoZSB3aXJlc1xyXG5jb25zdCBOT1JNQUxfRElTVEFOQ0UgPSAyNTtcclxuY29uc3QgV0lSRV9MSU5FX1dJRFRIID0gMztcclxuXHJcbmNvbnN0IE1BWF9BWElTX0xBQkVMX1dJRFRIID0gMTIwO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBkZWZhdWx0Wm9vbUxldmVsPzogUmFuZ2U7XHJcbn07XHJcbmV4cG9ydCB0eXBlIENDS0NDaGFydE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ0NLQ0NoYXJ0Tm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIHB1YmxpYyByZWFkb25seSBtZXRlcjogTWV0ZXI7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHNlcmllczogT2JzZXJ2YWJsZUFycmF5PFZlY3RvcjIgfCBudWxsPjtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgY2lyY3VpdE5vZGU6IENpcmN1aXROb2RlO1xyXG4gIHByb3RlY3RlZCByZWFkb25seSB0aW1lUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47XHJcbiAgcHJpdmF0ZSByZWFkb25seSB2aXNpYmxlQm91bmRzUHJvcGVydHk6IFByb3BlcnR5PEJvdW5kczI+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYmFja2dyb3VuZE5vZGU6IE5vZGU7XHJcbiAgcHJpdmF0ZSBiYWNrZ3JvdW5kRHJhZ0xpc3RlbmVyOiBEcmFnTGlzdGVuZXIgfCBudWxsO1xyXG5cclxuICAvLyBlbWl0cyB3aGVuIHRoZSBwcm9iZXMgc2hvdWxkIGJlIHB1dCBpbiBzdGFuZGFyZCByZWxhdGl2ZSBwb3NpdGlvbiB0byB0aGUgYm9keVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgYWxpZ25Qcm9iZXNFbWl0dGVyOiBURW1pdHRlcjtcclxuXHJcbiAgLy8gZW1pdHMgd2hlbiB0aGUgQ0NLQ0NoYXJ0Tm9kZSBoYXMgYmVlbiBkcm9wcGVkXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkcm9wcGVkRW1pdHRlcjogVEVtaXR0ZXI7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGFib3ZlQm90dG9tTGVmdDFQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8VmVjdG9yMj47XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGFib3ZlQm90dG9tTGVmdDJQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8VmVjdG9yMj47XHJcbiAgcHJpdmF0ZSByZWFkb25seSB6b29tTGV2ZWxQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHVwZGF0ZVBlbjogKCkgPT4gdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGNpcmN1aXROb2RlXHJcbiAgICogQHBhcmFtIHRpbWVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB2aXNpYmxlQm91bmRzUHJvcGVydHlcclxuICAgKiBAcGFyYW0gc2VyaWVzXHJcbiAgICogQHBhcmFtIHZlcnRpY2FsQXhpc0xhYmVsXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjaXJjdWl0Tm9kZTogQ2lyY3VpdE5vZGUsIHRpbWVQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPiwgdmlzaWJsZUJvdW5kc1Byb3BlcnR5OiBQcm9wZXJ0eTxCb3VuZHMyPixcclxuICAgICAgICAgICAgICAgICAgICAgIHNlcmllczogT2JzZXJ2YWJsZUFycmF5PFZlY3RvcjIgfCBudWxsPiwgdmVydGljYWxBeGlzTGFiZWw6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4sIHByb3ZpZGVkT3B0aW9ucz86IENDS0NDaGFydE5vZGVPcHRpb25zICkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDQ0tDQ2hhcnROb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcbiAgICAgIGRlZmF1bHRab29tTGV2ZWw6IG5ldyBSYW5nZSggLTIsIDIgKSxcclxuXHJcbiAgICAgIC8vIFByZXZlbnQgYWRqdXN0bWVudCBvZiB0aGUgY29udHJvbCBwYW5lbCByZW5kZXJpbmcgd2hpbGUgZHJhZ2dpbmcsXHJcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvd2F2ZS1pbnRlcmZlcmVuY2UvaXNzdWVzLzIxMlxyXG4gICAgICBwcmV2ZW50Rml0OiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKSBhcyBDQ0tDQ2hhcnROb2RlT3B0aW9ucztcclxuICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0gbmV3IE5vZGUoIHsgY3Vyc29yOiAncG9pbnRlcicgfSApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3QgdGFuZGVtID0gb3B0aW9ucy50YW5kZW07XHJcblxyXG4gICAgdGhpcy5tZXRlciA9IG5ldyBNZXRlciggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21ldGVyJyApLCAwICk7XHJcbiAgICB0aGlzLnNlcmllcyA9IHNlcmllcztcclxuICAgIHRoaXMuY2lyY3VpdE5vZGUgPSBjaXJjdWl0Tm9kZTtcclxuICAgIHRoaXMudGltZVByb3BlcnR5ID0gdGltZVByb3BlcnR5O1xyXG4gICAgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkgPSB2aXNpYmxlQm91bmRzUHJvcGVydHk7XHJcblxyXG4gICAgLy8gc2hvd3MgdGhlIGJhY2tncm91bmQgZm9yIHRoZSBjaGFydC4gIEFueSBhdHRhY2hlZCBwcm9iZXMgb3Igb3RoZXJcclxuICAgIC8vIHN1cHBsZW1lbnRhbCBub2RlcyBzaG91bGQgbm90IGJlIGNoaWxkcmVuIG9mIHRoZSBiYWNrZ3JvdW5kTm9kZSBpZiB0aGV5IG5lZWQgdG8gdHJhbnNsYXRlIGluZGVwZW5kZW50bHkuXHJcbiAgICB0aGlzLmJhY2tncm91bmROb2RlID0gYmFja2dyb3VuZE5vZGU7XHJcblxyXG4gICAgLy8gc2V0IGluIGluaXRpYWxpemVCb2R5RHJhZ0xpc3RlbmVyXHJcbiAgICB0aGlzLmJhY2tncm91bmREcmFnTGlzdGVuZXIgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuYmFja2dyb3VuZE5vZGUgKTtcclxuXHJcbiAgICAvLyBNdXRhdGUgYWZ0ZXIgYmFja2dyb3VuZE5vZGUgaXMgYWRkZWQgYXMgYSBjaGlsZFxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmFsaWduUHJvYmVzRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gVGhlc2UgZG8gbm90IG5lZWQgdG8gYmUgZGlzcG9zZWQgYmVjYXVzZSB0aGVyZSBpcyBubyBjb25uZWN0aW9uIHRvIHRoZSBcIm91dHNpZGUgd29ybGRcIlxyXG4gICAgY29uc3QgbGVmdEJvdHRvbVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBiYWNrZ3JvdW5kTm9kZS5ib3VuZHNQcm9wZXJ0eSBdLCBib3VuZHMgPT4gYm91bmRzLmxlZnRCb3R0b20gKTtcclxuXHJcbiAgICB0aGlzLmRyb3BwZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyBmb3IgYXR0YWNoaW5nIHByb2Jlc1xyXG4gICAgdGhpcy5hYm92ZUJvdHRvbUxlZnQxUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIGxlZnRCb3R0b21Qcm9wZXJ0eSBdLFxyXG4gICAgICAoIHBvc2l0aW9uOiBWZWN0b3IyICkgPT4gcG9zaXRpb24uaXNGaW5pdGUoKSA/IHBvc2l0aW9uLnBsdXNYWSggMCwgLTIwICkgOiBWZWN0b3IyLlpFUk9cclxuICAgICk7XHJcblxyXG4gICAgLy8gZm9yIGF0dGFjaGluZyBwcm9iZXNcclxuICAgIHRoaXMuYWJvdmVCb3R0b21MZWZ0MlByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyBsZWZ0Qm90dG9tUHJvcGVydHkgXSxcclxuICAgICAgKCBwb3NpdGlvbjogVmVjdG9yMiApID0+IHBvc2l0aW9uLmlzRmluaXRlKCkgPyBwb3NpdGlvbi5wbHVzWFkoIDAsIC0xMCApIDogVmVjdG9yMi5aRVJPXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGNoYXJ0VHJhbnNmb3JtID0gbmV3IENoYXJ0VHJhbnNmb3JtKCB7XHJcbiAgICAgIHZpZXdXaWR0aDogMTUwLFxyXG4gICAgICB2aWV3SGVpZ2h0OiAxMDAsXHJcbiAgICAgIG1vZGVsWFJhbmdlOiBuZXcgUmFuZ2UoIDAsIDQuMjUgKSxcclxuICAgICAgbW9kZWxZUmFuZ2U6IG5ldyBSYW5nZSggLTIsIDIgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgY2hhcnRCYWNrZ3JvdW5kID0gbmV3IENoYXJ0UmVjdGFuZ2xlKCBjaGFydFRyYW5zZm9ybSwge1xyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBjb3JuZXJYUmFkaXVzOiA2LFxyXG4gICAgICBjb3JuZXJZUmFkaXVzOiA2XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgaG9yaXpvbnRhbEF4aXNUaXRsZU5vZGUgPSBuZXcgVGV4dCggdGltZVN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnRTaXplOiBMQUJFTF9GT05UX1NJWkUsXHJcbiAgICAgIGZpbGw6IEFYSVNfTEFCRUxfRklMTCxcclxuICAgICAgY2VudGVyVG9wOiBjaGFydEJhY2tncm91bmQuY2VudGVyQm90dG9tLnBsdXNYWSggMCwgNSApLFxyXG4gICAgICBtYXhXaWR0aDogTUFYX0FYSVNfTEFCRUxfV0lEVEhcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHNjYWxlSW5kaWNhdG9yVGV4dCA9IG5ldyBUZXh0KCBvbmVTZWNvbmRTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250U2l6ZTogMTEsXHJcbiAgICAgIGZpbGw6ICd3aGl0ZSdcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB6b29tUmFuZ2VzID0gW1xyXG4gICAgICBuZXcgUmFuZ2UoIC0xMjAwLCAxMjAwICksXHJcbiAgICAgIG5ldyBSYW5nZSggLTEwMDAsIDEwMDAgKSxcclxuICAgICAgbmV3IFJhbmdlKCAtODAwLCA4MDAgKSxcclxuICAgICAgbmV3IFJhbmdlKCAtNjAwLCA2MDAgKSxcclxuICAgICAgbmV3IFJhbmdlKCAtNDAwLCA0MDAgKSxcclxuICAgICAgbmV3IFJhbmdlKCAtMjAwLCAyMDAgKSxcclxuICAgICAgbmV3IFJhbmdlKCAtMTUwLCAxNTAgKSxcclxuICAgICAgbmV3IFJhbmdlKCAtMTAwLCAxMDAgKSxcclxuICAgICAgbmV3IFJhbmdlKCAtNTAsIDUwICksXHJcbiAgICAgIG5ldyBSYW5nZSggLTIwLCAyMCApLFxyXG4gICAgICBuZXcgUmFuZ2UoIC0xMCwgMTAgKSxcclxuICAgICAgbmV3IFJhbmdlKCAtMiwgMiApLFxyXG4gICAgICBuZXcgUmFuZ2UoIC0wLjQsIDAuNCApXHJcbiAgICBdO1xyXG4gICAgY29uc3QgaW5pdGlhbFpvb21JbmRleCA9IHpvb21SYW5nZXMuZmluZEluZGV4KCBlID0+IGUuZXF1YWxzKCBvcHRpb25zLmRlZmF1bHRab29tTGV2ZWwgKSApO1xyXG5cclxuICAgIHRoaXMuem9vbUxldmVsUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGluaXRpYWxab29tSW5kZXgsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgem9vbVJhbmdlcy5sZW5ndGggLSAxICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3pvb21MZXZlbFByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZ3JpZExpbmVPcHRpb25zID0ge1xyXG4gICAgICBzdHJva2U6ICdsaWdodEdyYXknLFxyXG4gICAgICBsaW5lRGFzaDogWyA1LCA1IF0sXHJcbiAgICAgIGxpbmVXaWR0aDogMC44LFxyXG4gICAgICBsaW5lRGFzaE9mZnNldDogNSAvIDJcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgaG9yaXpvbnRhbEdyaWRMaW5lU2V0ID0gbmV3IENhbnZhc0dyaWRMaW5lU2V0KCBjaGFydFRyYW5zZm9ybSwgT3JpZW50YXRpb24uSE9SSVpPTlRBTCwgMSwgZ3JpZExpbmVPcHRpb25zICk7XHJcbiAgICBjb25zdCB2ZXJ0aWNhbEdyaWRMaW5lU2V0ID0gbmV3IENhbnZhc0dyaWRMaW5lU2V0KCBjaGFydFRyYW5zZm9ybSwgT3JpZW50YXRpb24uVkVSVElDQUwsIDEsIGdyaWRMaW5lT3B0aW9ucyApO1xyXG4gICAgY29uc3QgdmVydGljYWxMYWJlbFNldCA9IG5ldyBUaWNrTGFiZWxTZXQoIGNoYXJ0VHJhbnNmb3JtLCBPcmllbnRhdGlvbi5WRVJUSUNBTCwgMSwge1xyXG4gICAgICBlZGdlOiAnbWluJyxcclxuICAgICAgZXh0ZW50OiAxLjUsXHJcbiAgICAgIGNyZWF0ZUxhYmVsOiAoIHZhbHVlOiBudW1iZXIgKSA9PiBuZXcgVGV4dCggVXRpbHMudG9GaXhlZCggdmFsdWUsIHRoaXMuem9vbUxldmVsUHJvcGVydHkudmFsdWUgPT09IHpvb21SYW5nZXMubGVuZ3RoIC0gMSA/IDEgOiAwICksIHtcclxuICAgICAgICBmb250U2l6ZTogMTAsXHJcbiAgICAgICAgZmlsbDogJ3doaXRlJ1xyXG4gICAgICB9IClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB6b29tQnV0dG9uR3JvdXAgPSBuZXcgTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwKCB0aGlzLnpvb21MZXZlbFByb3BlcnR5LCB7XHJcbiAgICAgIG9yaWVudGF0aW9uOiAndmVydGljYWwnLFxyXG4gICAgICBsZWZ0OiBjaGFydEJhY2tncm91bmQucmlnaHQgKyAyLFxyXG4gICAgICB0b3A6IGNoYXJ0QmFja2dyb3VuZC50b3AsXHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogNixcclxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiA2LFxyXG4gICAgICBtYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9uczoge1xyXG4gICAgICAgIGdsYXNzUmFkaXVzOiAxMCxcclxuICAgICAgICBtYXhXaWR0aDogMTVcclxuICAgICAgfSxcclxuICAgICAgYnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIGJhc2VDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3k6IEJ1dHRvbk5vZGUuRmxhdEFwcGVhcmFuY2VTdHJhdGVneSxcclxuICAgICAgICBjb3JuZXJSYWRpdXM6IDAsXHJcbiAgICAgICAgeE1hcmdpbjogMyxcclxuICAgICAgICB5TWFyZ2luOiAzXHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3pvb21CdXR0b25Hcm91cCcgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy56b29tTGV2ZWxQcm9wZXJ0eS5saW5rKCB6b29tTGV2ZWwgPT4ge1xyXG4gICAgICBjaGFydFRyYW5zZm9ybS5zZXRNb2RlbFlSYW5nZSggem9vbVJhbmdlc1sgem9vbUxldmVsIF0gKTtcclxuICAgICAgdmVydGljYWxHcmlkTGluZVNldC5zZXRTcGFjaW5nKCB6b29tUmFuZ2VzWyB6b29tTGV2ZWwgXS5tYXggLyAyICk7XHJcbiAgICAgIHZlcnRpY2FsTGFiZWxTZXQuc2V0U3BhY2luZyggem9vbVJhbmdlc1sgem9vbUxldmVsIF0ubWF4IC8gMiApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBlbkRhdGEgPSBbIG5ldyBWZWN0b3IyKCAwLCAwICkgXTtcclxuXHJcbiAgICBjb25zdCBwZW4gPSBuZXcgU2NhdHRlclBsb3QoIGNoYXJ0VHJhbnNmb3JtLCBwZW5EYXRhLCB7XHJcbiAgICAgIGZpbGw6ICcjNzE3Mjc0JyxcclxuICAgICAgc3Ryb2tlOiAnIzcxNzI3NCcsXHJcbiAgICAgIHJhZGl1czogNFxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudXBkYXRlUGVuID0gKCkgPT4ge1xyXG4gICAgICBwZW5EYXRhWyAwIF0ueCA9IHRpbWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgY29uc3QgbGVuZ3RoID0gc2VyaWVzLmxlbmd0aDtcclxuICAgICAgaWYgKCBsZW5ndGggPiAwICkge1xyXG4gICAgICAgIGNvbnN0IHBvaW50ID0gc2VyaWVzWyBsZW5ndGggLSAxIF07XHJcbiAgICAgICAgcGVuRGF0YVsgMCBdLnkgPSBwb2ludCA9PT0gbnVsbCA/IDAgOiBwb2ludC55O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHBlbkRhdGFbIDAgXS55ID0gMDtcclxuICAgICAgfVxyXG4gICAgICBwZW4udXBkYXRlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRpbWVQcm9wZXJ0eS5saW5rKCB0aW1lID0+IHtcclxuXHJcbiAgICAgIC8vIFNob3cgNCBzZWNvbmRzLCBwbHVzIGEgbGVhZCB0aW1lIG9mIDAuMjUgc2VjXHJcbiAgICAgIGNoYXJ0VHJhbnNmb3JtLnNldE1vZGVsWFJhbmdlKCBuZXcgUmFuZ2UoIHRpbWUgLSA0LCB0aW1lICsgMC4yNSApICk7XHJcblxyXG4gICAgICB2ZXJ0aWNhbEdyaWRMaW5lU2V0LnNldExpbmVEYXNoT2Zmc2V0KCB0aW1lICogY2hhcnRUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YSggT3JpZW50YXRpb24uSE9SSVpPTlRBTCwgMSApICk7XHJcbiAgICAgIHRoaXMudXBkYXRlUGVuKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbGluZVBsb3QgPSBuZXcgQ2hhcnRDYW52YXNOb2RlKCBjaGFydFRyYW5zZm9ybSwgW1xyXG5cclxuICAgICAgaG9yaXpvbnRhbEdyaWRMaW5lU2V0LFxyXG4gICAgICB2ZXJ0aWNhbEdyaWRMaW5lU2V0LFxyXG5cclxuICAgICAgbmV3IENhbnZhc0xpbmVQbG90KCBjaGFydFRyYW5zZm9ybSwgc2VyaWVzLCB7XHJcbiAgICAgICAgc3Ryb2tlOiAnIzcxNzI3NCcsXHJcbiAgICAgICAgbGluZVdpZHRoOiAxLjVcclxuICAgICAgfSApIF0gKTtcclxuXHJcbiAgICAvLyBTaG93IGEgdGV4dCBtZXNzYWdlIHdoZW4gdGhlcmUgaXMgZGF0YSwgYnV0IG5vbmUgb2YgdGhlIGRhdGEgaXMgaW4gcmFuZ2UuXHJcbiAgICBjb25zdCBkYXRhT3V0T2ZSYW5nZU1lc3NhZ2UgPSBuZXcgVGV4dCggQ2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vblN0cmluZ3MuZGF0YU91dE9mUmFuZ2VTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmaWxsOiAncmVkJyxcclxuICAgICAgY2VudGVyWDogbGluZVBsb3QuY2VudGVyWCxcclxuICAgICAgY2VudGVyWTogbGluZVBsb3QuY2VudGVyWSxcclxuICAgICAgZm9udFNpemU6IDEzLFxyXG4gICAgICBtYXhXaWR0aDogY2hhcnRUcmFuc2Zvcm0udmlld1dpZHRoIC0gMjBcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB1cGRhdGVEYXRhT3V0T2ZSYW5nZU1lc3NhZ2UgPSAoKSA9PiB7XHJcbiAgICAgIGxldCBzaG93T3V0T2ZSYW5nZU1lc3NhZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gSWYgYW55IHBvaW50IGlzIGluIHRoZSBkaXNwbGF5ZWQgcmFuZ2UsIHdlIGRvbid0IHdhbnQgdG8gc2hvdyB0aGUgZGF0YSBvdXQgb2YgcmFuZ2UgbWVzc2FnZVxyXG4gICAgICBzZXJpZXMuZm9yRWFjaCggcG9pbnQgPT4ge1xyXG4gICAgICAgIGlmICggcG9pbnQgJiYgY2hhcnRUcmFuc2Zvcm0ubW9kZWxYUmFuZ2UuY29udGFpbnMoIHBvaW50LnggKSAmJiBjaGFydFRyYW5zZm9ybS5tb2RlbFlSYW5nZS5jb250YWlucyggcG9pbnQueSApICkge1xyXG4gICAgICAgICAgc2hvd091dE9mUmFuZ2VNZXNzYWdlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBUaGlzIGlzIHRoZSBzYW1lIGFzIHRoZSBsb2dpYyBpbiB1cGRhdGVQZW4uICBJZiB0aGUgcGVuIGlzIHNob3duIGF0IDAsIHRoZW4gd2UgZG9uJ3Qgd2FudCB0byBkaXNwbGF5IHRoZVxyXG4gICAgICAvLyBkYXRhIG91dCBvZiByYW5nZSBtZXNzYWdlXHJcbiAgICAgIGNvbnN0IGxhc3RQb2ludElzTnVsbCA9IHNlcmllcy5sZW5ndGggPiAwICYmIHNlcmllc1sgc2VyaWVzLmxlbmd0aCAtIDEgXSA9PT0gbnVsbDtcclxuICAgICAgaWYgKCBsYXN0UG9pbnRJc051bGwgfHwgc2VyaWVzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgICBzaG93T3V0T2ZSYW5nZU1lc3NhZ2UgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBkYXRhT3V0T2ZSYW5nZU1lc3NhZ2Uuc2V0VmlzaWJsZSggc2hvd091dE9mUmFuZ2VNZXNzYWdlICk7XHJcbiAgICB9O1xyXG4gICAgdXBkYXRlRGF0YU91dE9mUmFuZ2VNZXNzYWdlKCk7XHJcbiAgICBzZXJpZXMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgbGluZVBsb3QudXBkYXRlKCk7XHJcbiAgICAgIHRoaXMudXBkYXRlUGVuKCk7XHJcbiAgICAgIHVwZGF0ZURhdGFPdXRPZlJhbmdlTWVzc2FnZSgpO1xyXG4gICAgfSApO1xyXG4gICAgc2VyaWVzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgbGluZVBsb3QudXBkYXRlKCk7XHJcbiAgICAgIHRoaXMudXBkYXRlUGVuKCk7XHJcbiAgICAgIHVwZGF0ZURhdGFPdXRPZlJhbmdlTWVzc2FnZSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFueXRoaW5nIHlvdSB3YW50IGNsaXBwZWQgZ29lcyBpbiBoZXJlXHJcbiAgICBjb25zdCBjaGFydENsaXAgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjbGlwQXJlYTogY2hhcnRCYWNrZ3JvdW5kLmdldFNoYXBlKCksXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbGluZVBsb3QsXHJcbiAgICAgICAgZGF0YU91dE9mUmFuZ2VNZXNzYWdlLFxyXG4gICAgICAgIHBlblxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgdmVydGljYWxBeGlzVGl0bGVOb2RlID0gbmV3IFRleHQoIHZlcnRpY2FsQXhpc0xhYmVsLCB7XHJcbiAgICAgIHJvdGF0aW9uOiAtTWF0aC5QSSAvIDIsXHJcbiAgICAgIGZvbnRTaXplOiBMQUJFTF9GT05UX1NJWkUsXHJcbiAgICAgIGZpbGw6IEFYSVNfTEFCRUxfRklMTCxcclxuICAgICAgcmlnaHRDZW50ZXI6IHZlcnRpY2FsTGFiZWxTZXQubGVmdENlbnRlci5wbHVzWFkoIC0xMCwgMCApLFxyXG4gICAgICBtYXhXaWR0aDogTUFYX0FYSVNfTEFCRUxfV0lEVEhcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzcGFuTm9kZSA9IG5ldyBTcGFuTm9kZSggY2hhcnRUcmFuc2Zvcm0sIE9yaWVudGF0aW9uLkhPUklaT05UQUwsIDEsIHNjYWxlSW5kaWNhdG9yVGV4dCwge1xyXG4gICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgbGVmdDogY2hhcnRCYWNrZ3JvdW5kLmxlZnQsXHJcbiAgICAgIHRvcDogY2hhcnRCYWNrZ3JvdW5kLmJvdHRvbSArIDNcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGNoYXJ0Tm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgY2hhcnRCYWNrZ3JvdW5kLFxyXG4gICAgICAgIGNoYXJ0Q2xpcCxcclxuICAgICAgICB6b29tQnV0dG9uR3JvdXAsXHJcbiAgICAgICAgdmVydGljYWxBeGlzVGl0bGVOb2RlLFxyXG4gICAgICAgIGhvcml6b250YWxBeGlzVGl0bGVOb2RlLFxyXG4gICAgICAgIHZlcnRpY2FsTGFiZWxTZXQsXHJcbiAgICAgICAgc3Bhbk5vZGVcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEZvcmJpZCBvdmVybGFwIGJldHdlZW4gdGhlIGhvcml6b250YWwgYXhpcyBsYWJlbCBhbmQgdGhlIHNwYW4gbm9kZVxyXG4gICAgY29uc3QgcGFkZGluZyA9IDU7XHJcbiAgICBpZiAoIGhvcml6b250YWxBeGlzVGl0bGVOb2RlLmxlZnQgPCBzcGFuTm9kZS5yaWdodCArIHBhZGRpbmcgKSB7XHJcbiAgICAgIGhvcml6b250YWxBeGlzVGl0bGVOb2RlLmxlZnQgPSBzcGFuTm9kZS5yaWdodCArIHBhZGRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2hhZGVkUmVjdGFuZ2xlID0gbmV3IFNoYWRlZFJlY3RhbmdsZSggY2hhcnROb2RlLmJvdW5kcy5kaWxhdGVkKCA3ICksIHtcclxuICAgICAgYmFzZUNvbG9yOiAnIzMyNzE5OCdcclxuICAgIH0gKTtcclxuICAgIHNoYWRlZFJlY3RhbmdsZS5hZGRDaGlsZCggY2hhcnROb2RlICk7XHJcbiAgICBiYWNrZ3JvdW5kTm9kZS5hZGRDaGlsZCggc2hhZGVkUmVjdGFuZ2xlICk7XHJcblxyXG4gICAgdGhpcy5tZXRlci5pc0FjdGl2ZVByb3BlcnR5LmxpbmsoIGlzQWN0aXZlID0+IHRoaXMuc2V0VmlzaWJsZSggaXNBY3RpdmUgKSApO1xyXG4gICAgdGhpcy5tZXRlci5ib2R5UG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBib2R5UG9zaXRpb24gPT4gYmFja2dyb3VuZE5vZGUuc2V0Q2VudGVyKCBib2R5UG9zaXRpb24gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGNvbG9yXHJcbiAgICogQHBhcmFtIHdpcmVDb2xvclxyXG4gICAqIEBwYXJhbSBkeCAtIGluaXRpYWwgcmVsYXRpdmUgeCBjb29yZGluYXRlIGZvciB0aGUgcHJvYmVcclxuICAgKiBAcGFyYW0gZHkgLSBpbml0aWFsIHJlbGF0aXZlIHkgY29vcmRpbmF0ZSBmb3IgdGhlIHByb2JlXHJcbiAgICogQHBhcmFtIGNvbm5lY3Rpb25Qcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB0YW5kZW1cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgYWRkUHJvYmVOb2RlKCBjb2xvcjogc3RyaW5nLCB3aXJlQ29sb3I6IHN0cmluZywgZHg6IG51bWJlciwgZHk6IG51bWJlciwgY29ubmVjdGlvblByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxWZWN0b3IyPiwgdGFuZGVtOiBUYW5kZW0gKTogQ0NLQ1Byb2JlTm9kZSB7XHJcbiAgICBjb25zdCBwcm9iZU5vZGUgPSBuZXcgQ0NLQ1Byb2JlTm9kZSggdGhpcywgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksIHsgY29sb3I6IGNvbG9yLCB0YW5kZW06IHRhbmRlbSB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSB3aXJlIGJlaGluZCB0aGUgcHJvYmUuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgV2lyZU5vZGUoIGNvbm5lY3Rpb25Qcm9wZXJ0eSwgbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIC1OT1JNQUxfRElTVEFOQ0UsIDAgKSApLFxyXG4gICAgICBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHByb2JlTm9kZS5ib3VuZHNQcm9wZXJ0eSBdLCBib3VuZHMgPT4gYm91bmRzLmNlbnRlckJvdHRvbSApLCBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggMCwgTk9STUFMX0RJU1RBTkNFICkgKSwge1xyXG4gICAgICAgIGxpbmVXaWR0aDogV0lSRV9MSU5FX1dJRFRILFxyXG4gICAgICAgIHN0cm9rZTogd2lyZUNvbG9yXHJcbiAgICAgIH1cclxuICAgICkgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHByb2JlTm9kZSApO1xyXG5cclxuICAgIC8vIFN0YW5kYXJkIHBvc2l0aW9uIGluIHRvb2xib3ggYW5kIHdoZW4gZHJhZ2dpbmcgb3V0IG9mIHRvb2xib3guXHJcbiAgICBjb25zdCBhbGlnblByb2JlcyA9ICgpID0+IHtcclxuICAgICAgcHJvYmVOb2RlLm11dGF0ZSgge1xyXG4gICAgICAgIHJpZ2h0OiB0aGlzLmJhY2tncm91bmROb2RlLmxlZnQgLSBkeCxcclxuICAgICAgICB0b3A6IHRoaXMuYmFja2dyb3VuZE5vZGUudG9wICsgZHlcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gUHJldmVudCB0aGUgcHJvYmVzIGZyb20gZ29pbmcgb3V0IG9mIHRoZSB2aXNpYmxlIGJvdW5kcyB3aGVuIHRhZ2dpbmcgYWxvbmcgd2l0aCB0aGUgZHJhZ2dlZCBDQ0tDQ2hhcnROb2RlXHJcbiAgICAgIHByb2JlTm9kZS50cmFuc2xhdGlvbiA9IHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LnZhbHVlLmNsb3Nlc3RQb2ludFRvKCBwcm9iZU5vZGUudHJhbnNsYXRpb24gKTtcclxuICAgIH07XHJcbiAgICB0aGlzLnZpc2libGVQcm9wZXJ0eS5saW5rKCBhbGlnblByb2JlcyApO1xyXG4gICAgdGhpcy5hbGlnblByb2Jlc0VtaXR0ZXIuYWRkTGlzdGVuZXIoIGFsaWduUHJvYmVzICk7XHJcbiAgICByZXR1cm4gcHJvYmVOb2RlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXIgdGhlIGRhdGEgZnJvbSB0aGUgY2hhcnQuXHJcbiAgICovXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXJpZXMuY2xlYXIoKTtcclxuICAgIHRoaXMubWV0ZXIucmVzZXQoKTtcclxuICAgIHRoaXMuem9vbUxldmVsUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHJlZ2lvbiBvZiB0aGUgYmFja2dyb3VuZCBpbiBnbG9iYWwgY29vcmRpbmF0ZXMuICBUaGlzIGNhbiBiZSB1c2VkIHRvIGRldGVybWluZSBpZiB0aGUgY2hhcnRcclxuICAgKiBzaG91bGQgYmUgZHJvcHBlZCBiYWNrIGluIGEgdG9vbGJveC5cclxuICAgKi9cclxuICBwcml2YXRlIGdldEJhY2tncm91bmROb2RlR2xvYmFsQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMubG9jYWxUb0dsb2JhbEJvdW5kcyggdGhpcy5iYWNrZ3JvdW5kTm9kZS5ib3VuZHMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvcndhcmQgYW4gZXZlbnQgZnJvbSB0aGUgdG9vbGJveCB0byBzdGFydCBkcmFnZ2luZyB0aGUgbm9kZSBpbiB0aGUgcGxheSBhcmVhLiAgVGhpcyB0cmlnZ2VycyB0aGUgcHJvYmVzIChpZiBhbnkpXHJcbiAgICogdG8gZHJhZyB0b2dldGhlciB3aXRoIHRoZSBjaGFydC4gIFRoaXMgaXMgYWNjb21wbGlzaGVkIGJ5IGNhbGxpbmcgdGhpcy5hbGlnblByb2JlcygpIGF0IGVhY2ggZHJhZyBldmVudC5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhcnREcmFnKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xyXG5cclxuICAgIC8vIEZvcndhcmQgdGhlIGV2ZW50IHRvIHRoZSBkcmFnIGxpc3RlbmVyXHJcbiAgICB0aGlzLmJhY2tncm91bmREcmFnTGlzdGVuZXIgJiYgdGhpcy5iYWNrZ3JvdW5kRHJhZ0xpc3RlbmVyLnByZXNzKCBldmVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRm9yIGEgQ0NLQ0NoYXJ0Tm9kZSB0aGF0IGlzIG5vdCBhbiBpY29uLCBhZGQgYSBsaXN0ZW5lciB0aGF0XHJcbiAgICogKDEpIGRyYWdzIHRoZSBib2R5XHJcbiAgICogKDIpIGNvbnN0cmFpbnMgdGhlIGRyYWcgdG8gdGhlIHNjcmVlblZpZXcgYm91bmRzXHJcbiAgICogKDMpIGRyb3BzIGJhY2sgaW50byB0aGUgdG9vbGJveFxyXG4gICAqL1xyXG4gIHB1YmxpYyBpbml0aWFsaXplQm9keURyYWdMaXN0ZW5lciggc2NyZWVuVmlldzogQ0NLQ1NjcmVlblZpZXcgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gU2luY2UgdGhpcyB3aWxsIGJlIHNob3duIGZyb20gdGhlIHRvb2xib3gsIG1ha2UgdGhlIHBsYXkgYXJlYSBpY29uIGludmlzaWJsZSBhbmQgcHJlcGFyZSB0byBkcmFnIHdpdGggcHJvYmVzXHJcbiAgICB0aGlzLm1ldGVyLmlzQWN0aXZlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgIHRoaXMubWV0ZXIuaXNEcmFnZ2luZ1Byb2Jlc1dpdGhCb2R5UHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0IGRyYWdCb3VuZHNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxCb3VuZHMyIHwgbnVsbD4oIG51bGwgKTtcclxuXHJcbiAgICBjb25zdCBkcmFnTGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIGFsbG93VG91Y2hTbmFnOiBmYWxzZSwgLy8gYWxsb3cgdGhlIHpvb20gYnV0dG9ucyB0byBiZSBwcmVzc2VkIHdpdGggdGhlIG1vdXNlXHJcbiAgICAgIHBvc2l0aW9uUHJvcGVydHk6IHRoaXMubWV0ZXIuYm9keVBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIHVzZVBhcmVudE9mZnNldDogdHJ1ZSxcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBkcmFnQm91bmRzUHJvcGVydHksXHJcblxyXG4gICAgICAvLyBhZGRzIHN1cHBvcnQgZm9yIHpvb21lZCBjb29yZGluYXRlIGZyYW1lLCBzZWVcclxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1jb21tb24vaXNzdWVzLzMwMVxyXG4gICAgICB0YXJnZXROb2RlOiB0aGlzLFxyXG4gICAgICB0YW5kZW06IHRoaXMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdMaXN0ZW5lcicgKSxcclxuICAgICAgc3RhcnQ6ICgpID0+IHtcclxuICAgICAgICB0aGlzLm1vdmVUb0Zyb250KCk7XHJcbiAgICAgICAgaWYgKCB0aGlzLm1ldGVyLmlzRHJhZ2dpbmdQcm9iZXNXaXRoQm9keVByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgICAgIC8vIEFsaWduIHRoZSBwcm9iZXMgZWFjaCB0aW1lIHRoZSBjaGFydCB0cmFuc2xhdGVzLCBzbyB0aGV5IHdpbGwgc3RheSBpbiBzeW5jXHJcbiAgICAgICAgICB0aGlzLmFsaWduUHJvYmVzRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBkcmFnOiAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCB0aGlzLm1ldGVyLmlzRHJhZ2dpbmdQcm9iZXNXaXRoQm9keVByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgICAgIC8vIEFsaWduIHRoZSBwcm9iZXMgZWFjaCB0aW1lIHRoZSBjaGFydCB0cmFuc2xhdGVzLCBzbyB0aGV5IHdpbGwgc3RheSBpbiBzeW5jXHJcbiAgICAgICAgICB0aGlzLmFsaWduUHJvYmVzRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBlbmQ6ICgpID0+IHtcclxuXHJcbiAgICAgICAgLy8gRHJvcCBpbiB0aGUgdG9vbGJveCBpZiB0aGUgY2VudGVyIG9mIHRoZSBjaGFydCBpcyB3aXRoaW4gdGhlIHNlbnNvciB0b29sYm94IGJvdW5kc1xyXG4gICAgICAgIGlmICggc2NyZWVuVmlldy5zZW5zb3JUb29sYm94Lmdsb2JhbEJvdW5kcy5jb250YWluc1BvaW50KCB0aGlzLmdldEJhY2tncm91bmROb2RlR2xvYmFsQm91bmRzKCkuY2VudGVyICkgKSB7XHJcbiAgICAgICAgICB0aGlzLmFsaWduUHJvYmVzRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBNb3ZlIHByb2JlcyB0byBjZW50ZXIgbGluZSAoaWYgd2F0ZXIgc2lkZSB2aWV3IG1vZGVsKVxyXG4gICAgICAgIHRoaXMuZHJvcHBlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICAgIHRoaXMubWV0ZXIuaXNEcmFnZ2luZ1Byb2Jlc1dpdGhCb2R5UHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IHtcclxuICAgICAgY29uc3QgYm91bmRzID0gc2NyZWVuVmlldy52aXNpYmxlQm91bmRzUHJvcGVydHkudmFsdWUuZXJvZGVkKCBDQ0tDQ29uc3RhbnRzLkRSQUdfQk9VTkRTX0VST1NJT04gKTtcclxuICAgICAgY29uc3QgZ2xvYmFsQm91bmRzID0gc2NyZWVuVmlldy5sb2NhbFRvR2xvYmFsQm91bmRzKCBib3VuZHMgKTtcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlID0gdGhpcy5nbG9iYWxUb1BhcmVudEJvdW5kcyggZ2xvYmFsQm91bmRzICk7XHJcbiAgICAgIHRoaXMubWV0ZXIuYm9keVBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBkcmFnQm91bmRzUHJvcGVydHkudmFsdWUuY2xvc2VzdFBvaW50VG8oIHRoaXMubWV0ZXIuYm9keVBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgIH07XHJcbiAgICBzY3JlZW5WaWV3LnZpc2libGVCb3VuZHNQcm9wZXJ0eS5saW5rKCB1cGRhdGUgKTtcclxuXHJcbiAgICB0aGlzLmNpcmN1aXROb2RlLnRyYW5zZm9ybUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHVwZGF0ZSApO1xyXG4gICAgdGhpcy5iYWNrZ3JvdW5kRHJhZ0xpc3RlbmVyID0gZHJhZ0xpc3RlbmVyO1xyXG4gICAgdGhpcy5iYWNrZ3JvdW5kTm9kZS5hZGRJbnB1dExpc3RlbmVyKCBkcmFnTGlzdGVuZXIgKTtcclxuICB9XHJcbn1cclxuXHJcbmNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24ucmVnaXN0ZXIoICdDQ0tDQ2hhcnROb2RlJywgQ0NLQ0NoYXJ0Tm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0scUNBQXFDO0FBQ2pFLE9BQU9DLE9BQU8sTUFBTSw2QkFBNkI7QUFDakQsT0FBT0MsY0FBYyxNQUFNLG9DQUFvQztBQUMvRCxPQUFPQyxjQUFjLE1BQU0sc0NBQXNDO0FBQ2pFLE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsY0FBYyxNQUFNLHNDQUFzQztBQUNqRSxPQUFPQyxjQUFjLE1BQU0sc0NBQXNDO0FBQ2pFLE9BQU9DLGlCQUFpQixNQUFNLHlDQUF5QztBQUN2RSxPQUFPQyxZQUFZLE1BQU0sb0NBQW9DO0FBQzdE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