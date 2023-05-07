// Copyright 2020-2023, University of Colorado Boulder

/**
 * GraphNode is the view representation of a Graph, which includes a curve, a chart (grid and axes) and zoom buttons.
 * The origin (0,0) is the upper-left corner of the ChartRectangle, this.chartRectangle.leftTop.
 *
 * Primary responsibilities are:
 * - Create an associated CurveNode
 * - Create an optional zoomButtonGroup with an associated property
 * - Create an eye toggle button that controls the visibility of curve
 * - Create AxisLines, GridLines and Rectangle Chart
 * - Create a Chart Transform
 * - Updating the model y Range of the graph based on the zoom level
 * - Toggling the visibility of the gridlines
 * - Set the height of the graph
 *
 * @author Martin Veillette
 * @author Brandon Li
 * @author Chris Malley (PixelZoom, Inc.)
 */

import AxisArrowNode from '../../../../bamboo/js/AxisArrowNode.js';
import ChartRectangle from '../../../../bamboo/js/ChartRectangle.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import GridLineSet from '../../../../bamboo/js/GridLineSet.js';
import TickLabelSet from '../../../../bamboo/js/TickLabelSet.js';
import TickMarkSet from '../../../../bamboo/js/TickMarkSet.js';
import Range from '../../../../dot/js/Range.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import calculusGrapher from '../../calculusGrapher.js';
import CalculusGrapherConstants from '../../common/CalculusGrapherConstants.js';
import CurveNode from './CurveNode.js';
import optionize from '../../../../phet-core/js/optionize.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import PlusMinusZoomButtonGroup from '../../../../scenery-phet/js/PlusMinusZoomButtonGroup.js';
import EyeToggleButton from '../../../../scenery-phet/js/buttons/EyeToggleButton.js';
import CalculusGrapherColors from '../CalculusGrapherColors.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import CalculusGrapherPreferences from '../model/CalculusGrapherPreferences.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PlottedPoint from './PlottedPoint.js';
import GraphType from '../model/GraphType.js';
import GraphTypeLabelNode from './GraphTypeLabelNode.js';
const MAJOR_GRID_LINE_SPACING = 1;
const MINOR_GRID_LINE_SPACING = 0.25;
const MAJOR_GRID_LINE_OPTIONS = {
  stroke: CalculusGrapherColors.majorGridlinesStrokeProperty
};
const MINOR_GRID_LINE_OPTIONS = {
  stroke: CalculusGrapherColors.minorGridlinesStrokeProperty,
  lineWidth: 0.5
};
const BUTTON_SPACING = 14; // space between buttons and tick labels or chartRectangle

// Lookup table for zoomLevelProperty
const Y_ZOOM_INFO = [{
  max: 20,
  tickSpacing: 10
}, {
  max: 10,
  tickSpacing: 5
}, {
  max: 4,
  tickSpacing: 2
}, {
  max: 2,
  tickSpacing: 1
}, {
  max: 1,
  tickSpacing: 0.5
}, {
  max: 0.5,
  tickSpacing: 0.25
}];
assert && assert(_.every(Y_ZOOM_INFO, zoomInfo => zoomInfo.tickSpacing <= zoomInfo.max), 'tickSpacing must be <= max');
assert && assert(_.every(Y_ZOOM_INFO, (zoomInfo, index, Y_ZOOM_INFO) => index === 0 || Y_ZOOM_INFO[index - 1].max > zoomInfo.max), 'must be sorted by descending max');
const DEFAULT_ZOOM_LEVEL = 3; // default value for yZoomLevelProperty
const DEFAULT_MAX_Y = Y_ZOOM_INFO[DEFAULT_ZOOM_LEVEL].max; // default y-range (symmetrical) of the ChartTransform

export default class GraphNode extends Node {
  // The type of graph that this GraphNode renders

  // bamboo model-view transform

  // Outer rectangle of the chart

  // The model curve to be plotted

  // Optional Node that plots the provided Curve, see SelfOptions.createCurveNode

  // Layer that contains the plots for any curves, optional tangent line and point (for Derivative screen),
  // and optional area-under-curve plot and point (for Integral screen).
  // Visibility of curveLayer
  // Optional Property for zooming the y-axis
  constructor(graphType, curve, gridVisibleProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      createCurveNode: true,
      chartRectangleOptions: {
        fill: CalculusGrapherColors.defaultChartBackgroundFillProperty,
        stroke: CalculusGrapherColors.defaultChartBackgroundStrokeProperty
      },
      // NodeOptions
      phetioVisiblePropertyInstrumented: false
    }, providedOptions);

    // If labelNode was not provided, create the default.
    const labelNode = options.labelNode || new GraphTypeLabelNode(graphType, {
      pickable: false,
      tandem: options.tandem.createTandem('labelNode')
    });
    super(options);
    this.graphType = graphType;
    this.curve = curve;

    // The original graph does not have the zoom feature for the y-axis. If you'd like to add the zoom feature
    // to the original graph in the future, remove the if-statement that surrounds this block.
    if (graphType !== GraphType.ORIGINAL) {
      this.yZoomLevelProperty = new NumberProperty(DEFAULT_ZOOM_LEVEL, {
        range: new Range(0, Y_ZOOM_INFO.length - 1),
        tandem: options.tandem.createTandem('yZoomLevelProperty')
      });
    }

    // chart transform for the graph
    this.chartTransform = new ChartTransform({
      viewWidth: CalculusGrapherConstants.CHART_RECTANGLE_WIDTH,
      viewHeight: options.chartRectangleHeight,
      modelXRange: CalculusGrapherConstants.CURVE_X_RANGE,
      modelYRange: new Range(-DEFAULT_MAX_Y, DEFAULT_MAX_Y)
    });
    this.chartRectangle = new ChartRectangle(this.chartTransform, options.chartRectangleOptions);

    // Create CurveNode for the provided Curve.
    if (options.createCurveNode) {
      this.curveNode = new CurveNode(curve, this.chartTransform, {
        stroke: graphType.strokeProperty,
        discontinuousPointsFill: options.chartRectangleOptions.fill,
        plotBoundsMethod: CalculusGrapherConstants.PLOT_BOUNDS_METHOD,
        // see https://github.com/phetsims/calculus-grapher/issues/210
        plotBounds: this.getChartRectangleBounds(),
        // see https://github.com/phetsims/calculus-grapher/issues/259
        tandem: providedOptions.tandem.createTandem('curveNode')
      });
    }
    this.curveLayerVisibleProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('curveLayerVisibleProperty'),
      phetioFeatured: true,
      phetioDocumentation: 'Controls whether the graph\'s curve layer is visible. The curve layer contains the plots ' + 'for any curves, optional tangent line and point, and optional area-under-curve plot and point. ' + 'The value of this Property can be toggled by pressing eyeToggleButton.'
    });
    const curveLayerChildren = [];
    this.curveNode && curveLayerChildren.push(this.curveNode);
    this.curveLayer = new Node({
      children: curveLayerChildren,
      clipArea: this.chartRectangle.getShape(),
      visibleProperty: this.curveLayerVisibleProperty,
      pickable: false // optimization, https://github.com/phetsims/calculus-grapher/issues/210
    });

    // Major and minor grid lines, minor behind major.
    const xMajorGridLines = new GridLineSet(this.chartTransform, Orientation.HORIZONTAL, MAJOR_GRID_LINE_SPACING, MAJOR_GRID_LINE_OPTIONS);
    const yMajorGridLines = new GridLineSet(this.chartTransform, Orientation.VERTICAL, MAJOR_GRID_LINE_SPACING, MAJOR_GRID_LINE_OPTIONS);
    const xMinorGridLines = new GridLineSet(this.chartTransform, Orientation.HORIZONTAL, MINOR_GRID_LINE_SPACING, MINOR_GRID_LINE_OPTIONS);
    const yMinorGridLines = new GridLineSet(this.chartTransform, Orientation.VERTICAL, MINOR_GRID_LINE_SPACING, MINOR_GRID_LINE_OPTIONS);
    const gridNode = new Node({
      children: [xMinorGridLines, yMinorGridLines, xMajorGridLines, yMajorGridLines],
      visibleProperty: gridVisibleProperty,
      pickable: false // optimization, https://github.com/phetsims/calculus-grapher/issues/210
    });

    // Axes with arrow heads pointing in the positive direction only.
    // See https://github.com/phetsims/calculus-grapher/issues/253
    const axisArrowNodeOptions = {
      doubleHead: false,
      extension: 0,
      stroke: null
    };
    const xAxis = new AxisArrowNode(this.chartTransform, Orientation.HORIZONTAL, axisArrowNodeOptions);
    const yAxis = new AxisArrowNode(this.chartTransform, Orientation.VERTICAL, axisArrowNodeOptions);
    const axesParent = new Node({
      children: [xAxis, yAxis],
      pickable: false // optimization, https://github.com/phetsims/calculus-grapher/issues/210
    });

    // x-axis tick marks and labels
    const xSkipCoordinates = [0];
    const xTickMarkSet = new TickMarkSet(this.chartTransform, Orientation.HORIZONTAL, MAJOR_GRID_LINE_SPACING, {
      skipCoordinates: xSkipCoordinates
    });
    const xTickLabelSet = new TickLabelSet(this.chartTransform, Orientation.HORIZONTAL, MAJOR_GRID_LINE_SPACING, {
      skipCoordinates: xSkipCoordinates,
      createLabel: value => new Text(Utils.toFixed(value, 0), {
        font: CalculusGrapherConstants.TICK_LABEL_FONT
        // No PhET-iO instrumentation is desired.
      })
    });

    // y-axis tick marks and labels
    const yTickMarkSet = new TickMarkSet(this.chartTransform, Orientation.VERTICAL, MAJOR_GRID_LINE_SPACING);
    let yTickLabelSet = createYTickLabelSet(MAJOR_GRID_LINE_SPACING, this.chartTransform);
    const ticksParent = new Node({
      children: [xTickLabelSet, xTickMarkSet, yTickMarkSet, yTickLabelSet],
      visibleProperty: CalculusGrapherPreferences.valuesVisibleProperty,
      pickable: false // optimization, see https://github.com/phetsims/calculus-grapher/issues/210
    });

    // Create toggle button that controls the visibility of this.curveLayer.
    this.eyeToggleButton = new EyeToggleButton(this.curveLayerVisibleProperty, {
      scale: 0.5,
      baseColor: new DerivedProperty([this.curveLayerVisibleProperty], visible => visible ? 'white' : PhetColorScheme.BUTTON_YELLOW),
      touchAreaXDilation: 8,
      touchAreaYDilation: 8,
      tandem: options.tandem.createTandem('eyeToggleButton')
    });

    // Create yZoomButtonGroup if we have a yZoomLevelProperty.
    const yZoomButtonGroup = this.yZoomLevelProperty ? new PlusMinusZoomButtonGroup(this.yZoomLevelProperty, {
      orientation: 'vertical',
      buttonOptions: {
        stroke: 'black'
      },
      touchAreaXDilation: 6,
      touchAreaYDilation: 3,
      tandem: options.tandem.createTandem('yZoomButtonGroup'),
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }) : null;

    // labelNode in left-top corner of chartRectangle
    labelNode.boundsProperty.link(() => {
      labelNode.leftTop = this.chartRectangle.leftTop.addXY(CalculusGrapherConstants.GRAPH_X_MARGIN, CalculusGrapherConstants.GRAPH_Y_MARGIN);
    });

    // Adjust button positions when the visibility of ticks changes.
    ticksParent.visibleProperty.link(ticksParentVisible => {
      const rightNode = ticksParentVisible ? ticksParent : this.chartRectangle;

      // EyeToggleButton at bottom-left of chart rectangle
      this.eyeToggleButton.right = rightNode.left - BUTTON_SPACING;
      this.eyeToggleButton.bottom = this.chartRectangle.bottom;

      // yZoomButtonGroup at left-center of chart rectangle
      if (yZoomButtonGroup) {
        yZoomButtonGroup.right = rightNode.left - BUTTON_SPACING;
        yZoomButtonGroup.centerY = this.chartRectangle.centerY;
      }
    });
    const children = [this.chartRectangle, gridNode, axesParent, ticksParent, labelNode, this.curveLayer, this.eyeToggleButton];
    yZoomButtonGroup && children.push(yZoomButtonGroup);
    this.children = children;

    // If we have a yZoomLevelProperty, respond to changes.
    this.yZoomLevelProperty && this.yZoomLevelProperty.link(zoomLevel => {
      // Remove previous yTickLabelSet and dispose of it
      ticksParent.removeChild(yTickLabelSet);
      yTickLabelSet.dispose();

      // Look up the new y-axis range and tick spacing.
      const maxY = Y_ZOOM_INFO[zoomLevel].max;
      const tickSpacing = Y_ZOOM_INFO[zoomLevel].tickSpacing;

      // Adjust the chartTransform
      this.chartTransform.setModelYRange(new Range(-maxY, maxY));

      // Change the vertical spacing of the tick marks and labels.
      yTickMarkSet.setSpacing(tickSpacing);
      yTickLabelSet = createYTickLabelSet(tickSpacing, this.chartTransform);
      ticksParent.addChild(yTickLabelSet);

      // Hide the y-axis minor grid lines if they get too close together.
      yMinorGridLines.visible = Math.abs(this.chartTransform.modelToViewDeltaY(MINOR_GRID_LINE_SPACING)) > 5;
    });
  }

  /**
   * Resets all
   */
  reset() {
    this.yZoomLevelProperty && this.yZoomLevelProperty.reset();
    this.curveLayerVisibleProperty.reset();
    this.curveNode && this.curveNode.reset();
  }

  /**
   * Adds a PlottedPoint to this GraphNode.
   */
  addPlottedPoint(curvePointProperty, fill, visibleProperty, tandemName) {
    const plottedPoint = new PlottedPoint(curvePointProperty, this.chartTransform, {
      visibleProperty: visibleProperty,
      fill: fill,
      tandem: this.tandem.createTandem(tandemName)
    });
    this.curveLayer.addChild(plottedPoint);
    return plottedPoint;
  }

  /**
   * Gets the offset of the EyeToggleButton from the left edge of the ChartRectangle. This is used for dynamic layout.
   */
  getEyeToggleButtonXOffset() {
    return this.eyeToggleButton.x - this.x;
  }
  getChartRectangleBounds() {
    return this.chartRectangle.getShape().bounds;
  }
}

/**
 * Creates a TickLabelSet for the y-axis.
 */
function createYTickLabelSet(spacing, chartTransform) {
  // No more than three decimal places
  const decimalPlaces = Math.min(3, Utils.numberOfDecimalPlaces(spacing));
  return new TickLabelSet(chartTransform, Orientation.VERTICAL, spacing, {
    // Display zero without decimal places.
    createLabel: value => {
      const valueString = value === 0 ? '0' : Utils.toFixed(value, decimalPlaces);
      return new Text(valueString, {
        font: CalculusGrapherConstants.TICK_LABEL_FONT
        // No PhET-iO instrumentation is desired.
      });
    },

    // Position the label to left of its associated tick mark, with a bit of space.
    positionLabel: (label, tickBounds) => {
      label.rightCenter = tickBounds.leftCenter.minusXY(1, 0);
      return label;
    }
  });
}
calculusGrapher.register('GraphNode', GraphNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBeGlzQXJyb3dOb2RlIiwiQ2hhcnRSZWN0YW5nbGUiLCJDaGFydFRyYW5zZm9ybSIsIkdyaWRMaW5lU2V0IiwiVGlja0xhYmVsU2V0IiwiVGlja01hcmtTZXQiLCJSYW5nZSIsIk9yaWVudGF0aW9uIiwiTm9kZSIsIlRleHQiLCJjYWxjdWx1c0dyYXBoZXIiLCJDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMiLCJDdXJ2ZU5vZGUiLCJvcHRpb25pemUiLCJOdW1iZXJQcm9wZXJ0eSIsIlBsdXNNaW51c1pvb21CdXR0b25Hcm91cCIsIkV5ZVRvZ2dsZUJ1dHRvbiIsIkNhbGN1bHVzR3JhcGhlckNvbG9ycyIsIkJvb2xlYW5Qcm9wZXJ0eSIsIlV0aWxzIiwiUGhldENvbG9yU2NoZW1lIiwiQ2FsY3VsdXNHcmFwaGVyUHJlZmVyZW5jZXMiLCJEZXJpdmVkUHJvcGVydHkiLCJQbG90dGVkUG9pbnQiLCJHcmFwaFR5cGUiLCJHcmFwaFR5cGVMYWJlbE5vZGUiLCJNQUpPUl9HUklEX0xJTkVfU1BBQ0lORyIsIk1JTk9SX0dSSURfTElORV9TUEFDSU5HIiwiTUFKT1JfR1JJRF9MSU5FX09QVElPTlMiLCJzdHJva2UiLCJtYWpvckdyaWRsaW5lc1N0cm9rZVByb3BlcnR5IiwiTUlOT1JfR1JJRF9MSU5FX09QVElPTlMiLCJtaW5vckdyaWRsaW5lc1N0cm9rZVByb3BlcnR5IiwibGluZVdpZHRoIiwiQlVUVE9OX1NQQUNJTkciLCJZX1pPT01fSU5GTyIsIm1heCIsInRpY2tTcGFjaW5nIiwiYXNzZXJ0IiwiXyIsImV2ZXJ5Iiwiem9vbUluZm8iLCJpbmRleCIsIkRFRkFVTFRfWk9PTV9MRVZFTCIsIkRFRkFVTFRfTUFYX1kiLCJHcmFwaE5vZGUiLCJjb25zdHJ1Y3RvciIsImdyYXBoVHlwZSIsImN1cnZlIiwiZ3JpZFZpc2libGVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJjcmVhdGVDdXJ2ZU5vZGUiLCJjaGFydFJlY3RhbmdsZU9wdGlvbnMiLCJmaWxsIiwiZGVmYXVsdENoYXJ0QmFja2dyb3VuZEZpbGxQcm9wZXJ0eSIsImRlZmF1bHRDaGFydEJhY2tncm91bmRTdHJva2VQcm9wZXJ0eSIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsImxhYmVsTm9kZSIsInBpY2thYmxlIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiT1JJR0lOQUwiLCJ5Wm9vbUxldmVsUHJvcGVydHkiLCJyYW5nZSIsImxlbmd0aCIsImNoYXJ0VHJhbnNmb3JtIiwidmlld1dpZHRoIiwiQ0hBUlRfUkVDVEFOR0xFX1dJRFRIIiwidmlld0hlaWdodCIsImNoYXJ0UmVjdGFuZ2xlSGVpZ2h0IiwibW9kZWxYUmFuZ2UiLCJDVVJWRV9YX1JBTkdFIiwibW9kZWxZUmFuZ2UiLCJjaGFydFJlY3RhbmdsZSIsImN1cnZlTm9kZSIsInN0cm9rZVByb3BlcnR5IiwiZGlzY29udGludW91c1BvaW50c0ZpbGwiLCJwbG90Qm91bmRzTWV0aG9kIiwiUExPVF9CT1VORFNfTUVUSE9EIiwicGxvdEJvdW5kcyIsImdldENoYXJ0UmVjdGFuZ2xlQm91bmRzIiwiY3VydmVMYXllclZpc2libGVQcm9wZXJ0eSIsInBoZXRpb0ZlYXR1cmVkIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImN1cnZlTGF5ZXJDaGlsZHJlbiIsInB1c2giLCJjdXJ2ZUxheWVyIiwiY2hpbGRyZW4iLCJjbGlwQXJlYSIsImdldFNoYXBlIiwidmlzaWJsZVByb3BlcnR5IiwieE1ham9yR3JpZExpbmVzIiwiSE9SSVpPTlRBTCIsInlNYWpvckdyaWRMaW5lcyIsIlZFUlRJQ0FMIiwieE1pbm9yR3JpZExpbmVzIiwieU1pbm9yR3JpZExpbmVzIiwiZ3JpZE5vZGUiLCJheGlzQXJyb3dOb2RlT3B0aW9ucyIsImRvdWJsZUhlYWQiLCJleHRlbnNpb24iLCJ4QXhpcyIsInlBeGlzIiwiYXhlc1BhcmVudCIsInhTa2lwQ29vcmRpbmF0ZXMiLCJ4VGlja01hcmtTZXQiLCJza2lwQ29vcmRpbmF0ZXMiLCJ4VGlja0xhYmVsU2V0IiwiY3JlYXRlTGFiZWwiLCJ2YWx1ZSIsInRvRml4ZWQiLCJmb250IiwiVElDS19MQUJFTF9GT05UIiwieVRpY2tNYXJrU2V0IiwieVRpY2tMYWJlbFNldCIsImNyZWF0ZVlUaWNrTGFiZWxTZXQiLCJ0aWNrc1BhcmVudCIsInZhbHVlc1Zpc2libGVQcm9wZXJ0eSIsImV5ZVRvZ2dsZUJ1dHRvbiIsInNjYWxlIiwiYmFzZUNvbG9yIiwidmlzaWJsZSIsIkJVVFRPTl9ZRUxMT1ciLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJ5Wm9vbUJ1dHRvbkdyb3VwIiwib3JpZW50YXRpb24iLCJidXR0b25PcHRpb25zIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsImxlZnRUb3AiLCJhZGRYWSIsIkdSQVBIX1hfTUFSR0lOIiwiR1JBUEhfWV9NQVJHSU4iLCJ0aWNrc1BhcmVudFZpc2libGUiLCJyaWdodE5vZGUiLCJyaWdodCIsImxlZnQiLCJib3R0b20iLCJjZW50ZXJZIiwiem9vbUxldmVsIiwicmVtb3ZlQ2hpbGQiLCJkaXNwb3NlIiwibWF4WSIsInNldE1vZGVsWVJhbmdlIiwic2V0U3BhY2luZyIsImFkZENoaWxkIiwiTWF0aCIsImFicyIsIm1vZGVsVG9WaWV3RGVsdGFZIiwicmVzZXQiLCJhZGRQbG90dGVkUG9pbnQiLCJjdXJ2ZVBvaW50UHJvcGVydHkiLCJ0YW5kZW1OYW1lIiwicGxvdHRlZFBvaW50IiwiZ2V0RXllVG9nZ2xlQnV0dG9uWE9mZnNldCIsIngiLCJib3VuZHMiLCJzcGFjaW5nIiwiZGVjaW1hbFBsYWNlcyIsIm1pbiIsIm51bWJlck9mRGVjaW1hbFBsYWNlcyIsInZhbHVlU3RyaW5nIiwicG9zaXRpb25MYWJlbCIsImxhYmVsIiwidGlja0JvdW5kcyIsInJpZ2h0Q2VudGVyIiwibGVmdENlbnRlciIsIm1pbnVzWFkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdyYXBoTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBHcmFwaE5vZGUgaXMgdGhlIHZpZXcgcmVwcmVzZW50YXRpb24gb2YgYSBHcmFwaCwgd2hpY2ggaW5jbHVkZXMgYSBjdXJ2ZSwgYSBjaGFydCAoZ3JpZCBhbmQgYXhlcykgYW5kIHpvb20gYnV0dG9ucy5cclxuICogVGhlIG9yaWdpbiAoMCwwKSBpcyB0aGUgdXBwZXItbGVmdCBjb3JuZXIgb2YgdGhlIENoYXJ0UmVjdGFuZ2xlLCB0aGlzLmNoYXJ0UmVjdGFuZ2xlLmxlZnRUb3AuXHJcbiAqXHJcbiAqIFByaW1hcnkgcmVzcG9uc2liaWxpdGllcyBhcmU6XHJcbiAqIC0gQ3JlYXRlIGFuIGFzc29jaWF0ZWQgQ3VydmVOb2RlXHJcbiAqIC0gQ3JlYXRlIGFuIG9wdGlvbmFsIHpvb21CdXR0b25Hcm91cCB3aXRoIGFuIGFzc29jaWF0ZWQgcHJvcGVydHlcclxuICogLSBDcmVhdGUgYW4gZXllIHRvZ2dsZSBidXR0b24gdGhhdCBjb250cm9scyB0aGUgdmlzaWJpbGl0eSBvZiBjdXJ2ZVxyXG4gKiAtIENyZWF0ZSBBeGlzTGluZXMsIEdyaWRMaW5lcyBhbmQgUmVjdGFuZ2xlIENoYXJ0XHJcbiAqIC0gQ3JlYXRlIGEgQ2hhcnQgVHJhbnNmb3JtXHJcbiAqIC0gVXBkYXRpbmcgdGhlIG1vZGVsIHkgUmFuZ2Ugb2YgdGhlIGdyYXBoIGJhc2VkIG9uIHRoZSB6b29tIGxldmVsXHJcbiAqIC0gVG9nZ2xpbmcgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGdyaWRsaW5lc1xyXG4gKiAtIFNldCB0aGUgaGVpZ2h0IG9mIHRoZSBncmFwaFxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEF4aXNBcnJvd05vZGUsIHsgQXhpc0Fycm93Tm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9iYW1ib28vanMvQXhpc0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBDaGFydFJlY3RhbmdsZSwgeyBDaGFydFJlY3RhbmdsZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9iYW1ib28vanMvQ2hhcnRSZWN0YW5nbGUuanMnO1xyXG5pbXBvcnQgQ2hhcnRUcmFuc2Zvcm0gZnJvbSAnLi4vLi4vLi4vLi4vYmFtYm9vL2pzL0NoYXJ0VHJhbnNmb3JtLmpzJztcclxuaW1wb3J0IEdyaWRMaW5lU2V0IGZyb20gJy4uLy4uLy4uLy4uL2JhbWJvby9qcy9HcmlkTGluZVNldC5qcyc7XHJcbmltcG9ydCBUaWNrTGFiZWxTZXQgZnJvbSAnLi4vLi4vLi4vLi4vYmFtYm9vL2pzL1RpY2tMYWJlbFNldC5qcyc7XHJcbmltcG9ydCBUaWNrTWFya1NldCBmcm9tICcuLi8uLi8uLi8uLi9iYW1ib28vanMvVGlja01hcmtTZXQuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IE9yaWVudGF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvbi5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBUQ29sb3IsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2FsY3VsdXNHcmFwaGVyIGZyb20gJy4uLy4uL2NhbGN1bHVzR3JhcGhlci5qcyc7XHJcbmltcG9ydCBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0NhbGN1bHVzR3JhcGhlckNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDdXJ2ZU5vZGUgZnJvbSAnLi9DdXJ2ZU5vZGUuanMnO1xyXG5pbXBvcnQgQ3VydmUgZnJvbSAnLi4vbW9kZWwvQ3VydmUuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQbHVzTWludXNab29tQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BsdXNNaW51c1pvb21CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBFeWVUb2dnbGVCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvRXllVG9nZ2xlQnV0dG9uLmpzJztcclxuaW1wb3J0IENhbGN1bHVzR3JhcGhlckNvbG9ycyBmcm9tICcuLi9DYWxjdWx1c0dyYXBoZXJDb2xvcnMuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgQ2FsY3VsdXNHcmFwaGVyUHJlZmVyZW5jZXMgZnJvbSAnLi4vbW9kZWwvQ2FsY3VsdXNHcmFwaGVyUHJlZmVyZW5jZXMuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFBsb3R0ZWRQb2ludCBmcm9tICcuL1Bsb3R0ZWRQb2ludC5qcyc7XHJcbmltcG9ydCBHcmFwaFR5cGUgZnJvbSAnLi4vbW9kZWwvR3JhcGhUeXBlLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgR3JhcGhUeXBlTGFiZWxOb2RlIGZyb20gJy4vR3JhcGhUeXBlTGFiZWxOb2RlLmpzJztcclxuaW1wb3J0IFBpY2tPcHRpb25hbCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja09wdGlvbmFsLmpzJztcclxuaW1wb3J0IEN1cnZlUG9pbnQgZnJvbSAnLi4vbW9kZWwvQ3VydmVQb2ludC5qcyc7XHJcblxyXG5jb25zdCBNQUpPUl9HUklEX0xJTkVfU1BBQ0lORyA9IDE7XHJcbmNvbnN0IE1JTk9SX0dSSURfTElORV9TUEFDSU5HID0gMC4yNTtcclxuY29uc3QgTUFKT1JfR1JJRF9MSU5FX09QVElPTlMgPSB7XHJcbiAgc3Ryb2tlOiBDYWxjdWx1c0dyYXBoZXJDb2xvcnMubWFqb3JHcmlkbGluZXNTdHJva2VQcm9wZXJ0eVxyXG59O1xyXG5jb25zdCBNSU5PUl9HUklEX0xJTkVfT1BUSU9OUyA9IHtcclxuICBzdHJva2U6IENhbGN1bHVzR3JhcGhlckNvbG9ycy5taW5vckdyaWRsaW5lc1N0cm9rZVByb3BlcnR5LFxyXG4gIGxpbmVXaWR0aDogMC41XHJcbn07XHJcbmNvbnN0IEJVVFRPTl9TUEFDSU5HID0gMTQ7IC8vIHNwYWNlIGJldHdlZW4gYnV0dG9ucyBhbmQgdGljayBsYWJlbHMgb3IgY2hhcnRSZWN0YW5nbGVcclxuXHJcbi8vIExvb2t1cCB0YWJsZSBmb3Igem9vbUxldmVsUHJvcGVydHlcclxudHlwZSBab29tSW5mbyA9IHtcclxuICBtYXg6IG51bWJlcjsgLy8gYXhpcyByYW5nZSB3aWxsIGJlIFstbWF4LG1heF0sIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgdGlja1NwYWNpbmc6IG51bWJlcjsgLy8gdGljayBzcGFjaW5nIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbn07XHJcbmNvbnN0IFlfWk9PTV9JTkZPOiBab29tSW5mb1tdID0gW1xyXG4gIHsgbWF4OiAyMCwgdGlja1NwYWNpbmc6IDEwIH0sXHJcbiAgeyBtYXg6IDEwLCB0aWNrU3BhY2luZzogNSB9LFxyXG4gIHsgbWF4OiA0LCB0aWNrU3BhY2luZzogMiB9LFxyXG4gIHsgbWF4OiAyLCB0aWNrU3BhY2luZzogMSB9LFxyXG4gIHsgbWF4OiAxLCB0aWNrU3BhY2luZzogMC41IH0sXHJcbiAgeyBtYXg6IDAuNSwgdGlja1NwYWNpbmc6IDAuMjUgfVxyXG5dO1xyXG5hc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCBZX1pPT01fSU5GTywgem9vbUluZm8gPT4gem9vbUluZm8udGlja1NwYWNpbmcgPD0gem9vbUluZm8ubWF4ICksXHJcbiAgJ3RpY2tTcGFjaW5nIG11c3QgYmUgPD0gbWF4JyApO1xyXG5hc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCBZX1pPT01fSU5GTywgKCB6b29tSW5mbywgaW5kZXgsIFlfWk9PTV9JTkZPICkgPT5cclxuICAoIGluZGV4ID09PSAwIHx8IFlfWk9PTV9JTkZPWyBpbmRleCAtIDEgXS5tYXggPiB6b29tSW5mby5tYXggKSApLCAnbXVzdCBiZSBzb3J0ZWQgYnkgZGVzY2VuZGluZyBtYXgnICk7XHJcblxyXG5jb25zdCBERUZBVUxUX1pPT01fTEVWRUwgPSAzOyAvLyBkZWZhdWx0IHZhbHVlIGZvciB5Wm9vbUxldmVsUHJvcGVydHlcclxuY29uc3QgREVGQVVMVF9NQVhfWSA9IFlfWk9PTV9JTkZPWyBERUZBVUxUX1pPT01fTEVWRUwgXS5tYXg7IC8vIGRlZmF1bHQgeS1yYW5nZSAoc3ltbWV0cmljYWwpIG9mIHRoZSBDaGFydFRyYW5zZm9ybVxyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gaGVpZ2h0IG9mIHRoZSBDaGFydFJlY3RhbmdsZSwgaW4gdmlldyBjb29yZGluYXRlc1xyXG4gIGNoYXJ0UmVjdGFuZ2xlSGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gIC8vIG9wdGlvbnMgdG8gdGhlIGJhbWJvbyBDaGFydFJlY3RhbmdsZVxyXG4gIGNoYXJ0UmVjdGFuZ2xlT3B0aW9ucz86IFBpY2tPcHRpb25hbDxDaGFydFJlY3RhbmdsZU9wdGlvbnMsICdmaWxsJyB8ICdzdHJva2UnPjtcclxuXHJcbiAgLy8gV2hldGhlciB0byBjcmVhdGUgYSBDdXJ2ZU5vZGUgZm9yIHRoZSBwcm92aWRlZCBDdXJ2ZS5cclxuICBjcmVhdGVDdXJ2ZU5vZGU/OiBib29sZWFuO1xyXG5cclxuICAvLyBsYWJlbCB0aGF0IGFwcGVhcnMgaW4gdGhlIHVwcGVyLWxlZnQgY29ybmVyIG9mIHRoZSBncmFwaFxyXG4gIGxhYmVsTm9kZT86IE5vZGU7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBHcmFwaE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJlxyXG4gIFBpY2tPcHRpb25hbDxOb2RlT3B0aW9ucywgJ2lucHV0RW5hYmxlZFByb3BlcnR5Jz4gJlxyXG4gIFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JhcGhOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8vIFRoZSB0eXBlIG9mIGdyYXBoIHRoYXQgdGhpcyBHcmFwaE5vZGUgcmVuZGVyc1xyXG4gIHB1YmxpYyByZWFkb25seSBncmFwaFR5cGU6IEdyYXBoVHlwZTtcclxuXHJcbiAgLy8gYmFtYm9vIG1vZGVsLXZpZXcgdHJhbnNmb3JtXHJcbiAgcHVibGljIHJlYWRvbmx5IGNoYXJ0VHJhbnNmb3JtOiBDaGFydFRyYW5zZm9ybTtcclxuXHJcbiAgLy8gT3V0ZXIgcmVjdGFuZ2xlIG9mIHRoZSBjaGFydFxyXG4gIHByb3RlY3RlZCByZWFkb25seSBjaGFydFJlY3RhbmdsZTogQ2hhcnRSZWN0YW5nbGU7XHJcblxyXG4gIC8vIFRoZSBtb2RlbCBjdXJ2ZSB0byBiZSBwbG90dGVkXHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGN1cnZlOiBDdXJ2ZTtcclxuXHJcbiAgLy8gT3B0aW9uYWwgTm9kZSB0aGF0IHBsb3RzIHRoZSBwcm92aWRlZCBDdXJ2ZSwgc2VlIFNlbGZPcHRpb25zLmNyZWF0ZUN1cnZlTm9kZVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgY3VydmVOb2RlPzogQ3VydmVOb2RlO1xyXG5cclxuICAvLyBMYXllciB0aGF0IGNvbnRhaW5zIHRoZSBwbG90cyBmb3IgYW55IGN1cnZlcywgb3B0aW9uYWwgdGFuZ2VudCBsaW5lIGFuZCBwb2ludCAoZm9yIERlcml2YXRpdmUgc2NyZWVuKSxcclxuICAvLyBhbmQgb3B0aW9uYWwgYXJlYS11bmRlci1jdXJ2ZSBwbG90IGFuZCBwb2ludCAoZm9yIEludGVncmFsIHNjcmVlbikuXHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGN1cnZlTGF5ZXI6IE5vZGU7XHJcblxyXG4gIC8vIFZpc2liaWxpdHkgb2YgY3VydmVMYXllclxyXG4gIHByb3RlY3RlZCByZWFkb25seSBjdXJ2ZUxheWVyVmlzaWJsZVByb3BlcnR5OiBCb29sZWFuUHJvcGVydHk7XHJcblxyXG4gIC8vIE9wdGlvbmFsIFByb3BlcnR5IGZvciB6b29taW5nIHRoZSB5LWF4aXNcclxuICBwcml2YXRlIHJlYWRvbmx5IHlab29tTGV2ZWxQcm9wZXJ0eT86IE51bWJlclByb3BlcnR5O1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGV5ZVRvZ2dsZUJ1dHRvbjogTm9kZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBncmFwaFR5cGU6IEdyYXBoVHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgIGN1cnZlOiBDdXJ2ZSxcclxuICAgICAgICAgICAgICAgICAgICAgIGdyaWRWaXNpYmxlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBHcmFwaE5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8R3JhcGhOb2RlT3B0aW9ucywgU3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ2xhYmVsTm9kZSc+LCBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgY3JlYXRlQ3VydmVOb2RlOiB0cnVlLFxyXG4gICAgICBjaGFydFJlY3RhbmdsZU9wdGlvbnM6IHtcclxuICAgICAgICBmaWxsOiBDYWxjdWx1c0dyYXBoZXJDb2xvcnMuZGVmYXVsdENoYXJ0QmFja2dyb3VuZEZpbGxQcm9wZXJ0eSxcclxuICAgICAgICBzdHJva2U6IENhbGN1bHVzR3JhcGhlckNvbG9ycy5kZWZhdWx0Q2hhcnRCYWNrZ3JvdW5kU3Ryb2tlUHJvcGVydHlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIE5vZGVPcHRpb25zXHJcbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2VcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIElmIGxhYmVsTm9kZSB3YXMgbm90IHByb3ZpZGVkLCBjcmVhdGUgdGhlIGRlZmF1bHQuXHJcbiAgICBjb25zdCBsYWJlbE5vZGUgPSBvcHRpb25zLmxhYmVsTm9kZSB8fCBuZXcgR3JhcGhUeXBlTGFiZWxOb2RlKCBncmFwaFR5cGUsIHtcclxuICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYmVsTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5ncmFwaFR5cGUgPSBncmFwaFR5cGU7XHJcbiAgICB0aGlzLmN1cnZlID0gY3VydmU7XHJcblxyXG4gICAgLy8gVGhlIG9yaWdpbmFsIGdyYXBoIGRvZXMgbm90IGhhdmUgdGhlIHpvb20gZmVhdHVyZSBmb3IgdGhlIHktYXhpcy4gSWYgeW91J2QgbGlrZSB0byBhZGQgdGhlIHpvb20gZmVhdHVyZVxyXG4gICAgLy8gdG8gdGhlIG9yaWdpbmFsIGdyYXBoIGluIHRoZSBmdXR1cmUsIHJlbW92ZSB0aGUgaWYtc3RhdGVtZW50IHRoYXQgc3Vycm91bmRzIHRoaXMgYmxvY2suXHJcbiAgICBpZiAoIGdyYXBoVHlwZSAhPT0gR3JhcGhUeXBlLk9SSUdJTkFMICkge1xyXG4gICAgICB0aGlzLnlab29tTGV2ZWxQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggREVGQVVMVF9aT09NX0xFVkVMLCB7XHJcbiAgICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgWV9aT09NX0lORk8ubGVuZ3RoIC0gMSApLFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAneVpvb21MZXZlbFByb3BlcnR5JyApXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGFydCB0cmFuc2Zvcm0gZm9yIHRoZSBncmFwaFxyXG4gICAgdGhpcy5jaGFydFRyYW5zZm9ybSA9IG5ldyBDaGFydFRyYW5zZm9ybSgge1xyXG4gICAgICB2aWV3V2lkdGg6IENhbGN1bHVzR3JhcGhlckNvbnN0YW50cy5DSEFSVF9SRUNUQU5HTEVfV0lEVEgsXHJcbiAgICAgIHZpZXdIZWlnaHQ6IG9wdGlvbnMuY2hhcnRSZWN0YW5nbGVIZWlnaHQsXHJcbiAgICAgIG1vZGVsWFJhbmdlOiBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuQ1VSVkVfWF9SQU5HRSxcclxuICAgICAgbW9kZWxZUmFuZ2U6IG5ldyBSYW5nZSggLURFRkFVTFRfTUFYX1ksIERFRkFVTFRfTUFYX1kgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY2hhcnRSZWN0YW5nbGUgPSBuZXcgQ2hhcnRSZWN0YW5nbGUoIHRoaXMuY2hhcnRUcmFuc2Zvcm0sIG9wdGlvbnMuY2hhcnRSZWN0YW5nbGVPcHRpb25zICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIEN1cnZlTm9kZSBmb3IgdGhlIHByb3ZpZGVkIEN1cnZlLlxyXG4gICAgaWYgKCBvcHRpb25zLmNyZWF0ZUN1cnZlTm9kZSApIHtcclxuICAgICAgdGhpcy5jdXJ2ZU5vZGUgPSBuZXcgQ3VydmVOb2RlKCBjdXJ2ZSwgdGhpcy5jaGFydFRyYW5zZm9ybSwge1xyXG4gICAgICAgIHN0cm9rZTogZ3JhcGhUeXBlLnN0cm9rZVByb3BlcnR5LFxyXG4gICAgICAgIGRpc2NvbnRpbnVvdXNQb2ludHNGaWxsOiBvcHRpb25zLmNoYXJ0UmVjdGFuZ2xlT3B0aW9ucy5maWxsISxcclxuICAgICAgICBwbG90Qm91bmRzTWV0aG9kOiBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuUExPVF9CT1VORFNfTUVUSE9ELCAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhbGN1bHVzLWdyYXBoZXIvaXNzdWVzLzIxMFxyXG4gICAgICAgIHBsb3RCb3VuZHM6IHRoaXMuZ2V0Q2hhcnRSZWN0YW5nbGVCb3VuZHMoKSwgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jYWxjdWx1cy1ncmFwaGVyL2lzc3Vlcy8yNTlcclxuICAgICAgICB0YW5kZW06IHByb3ZpZGVkT3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY3VydmVOb2RlJyApXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmN1cnZlTGF5ZXJWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY3VydmVMYXllclZpc2libGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdDb250cm9scyB3aGV0aGVyIHRoZSBncmFwaFxcJ3MgY3VydmUgbGF5ZXIgaXMgdmlzaWJsZS4gVGhlIGN1cnZlIGxheWVyIGNvbnRhaW5zIHRoZSBwbG90cyAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ZvciBhbnkgY3VydmVzLCBvcHRpb25hbCB0YW5nZW50IGxpbmUgYW5kIHBvaW50LCBhbmQgb3B0aW9uYWwgYXJlYS11bmRlci1jdXJ2ZSBwbG90IGFuZCBwb2ludC4gJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdUaGUgdmFsdWUgb2YgdGhpcyBQcm9wZXJ0eSBjYW4gYmUgdG9nZ2xlZCBieSBwcmVzc2luZyBleWVUb2dnbGVCdXR0b24uJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGN1cnZlTGF5ZXJDaGlsZHJlbiA9IFtdO1xyXG4gICAgdGhpcy5jdXJ2ZU5vZGUgJiYgY3VydmVMYXllckNoaWxkcmVuLnB1c2goIHRoaXMuY3VydmVOb2RlICk7XHJcbiAgICB0aGlzLmN1cnZlTGF5ZXIgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogY3VydmVMYXllckNoaWxkcmVuLFxyXG4gICAgICBjbGlwQXJlYTogdGhpcy5jaGFydFJlY3RhbmdsZS5nZXRTaGFwZSgpLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMuY3VydmVMYXllclZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgcGlja2FibGU6IGZhbHNlIC8vIG9wdGltaXphdGlvbiwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhbGN1bHVzLWdyYXBoZXIvaXNzdWVzLzIxMFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE1ham9yIGFuZCBtaW5vciBncmlkIGxpbmVzLCBtaW5vciBiZWhpbmQgbWFqb3IuXHJcbiAgICBjb25zdCB4TWFqb3JHcmlkTGluZXMgPSBuZXcgR3JpZExpbmVTZXQoIHRoaXMuY2hhcnRUcmFuc2Zvcm0sIE9yaWVudGF0aW9uLkhPUklaT05UQUwsIE1BSk9SX0dSSURfTElORV9TUEFDSU5HLCBNQUpPUl9HUklEX0xJTkVfT1BUSU9OUyApO1xyXG4gICAgY29uc3QgeU1ham9yR3JpZExpbmVzID0gbmV3IEdyaWRMaW5lU2V0KCB0aGlzLmNoYXJ0VHJhbnNmb3JtLCBPcmllbnRhdGlvbi5WRVJUSUNBTCwgTUFKT1JfR1JJRF9MSU5FX1NQQUNJTkcsIE1BSk9SX0dSSURfTElORV9PUFRJT05TICk7XHJcbiAgICBjb25zdCB4TWlub3JHcmlkTGluZXMgPSBuZXcgR3JpZExpbmVTZXQoIHRoaXMuY2hhcnRUcmFuc2Zvcm0sIE9yaWVudGF0aW9uLkhPUklaT05UQUwsIE1JTk9SX0dSSURfTElORV9TUEFDSU5HLCBNSU5PUl9HUklEX0xJTkVfT1BUSU9OUyApO1xyXG4gICAgY29uc3QgeU1pbm9yR3JpZExpbmVzID0gbmV3IEdyaWRMaW5lU2V0KCB0aGlzLmNoYXJ0VHJhbnNmb3JtLCBPcmllbnRhdGlvbi5WRVJUSUNBTCwgTUlOT1JfR1JJRF9MSU5FX1NQQUNJTkcsIE1JTk9SX0dSSURfTElORV9PUFRJT05TICk7XHJcbiAgICBjb25zdCBncmlkTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHhNaW5vckdyaWRMaW5lcywgeU1pbm9yR3JpZExpbmVzLCB4TWFqb3JHcmlkTGluZXMsIHlNYWpvckdyaWRMaW5lcyBdLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IGdyaWRWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSAvLyBvcHRpbWl6YXRpb24sIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jYWxjdWx1cy1ncmFwaGVyL2lzc3Vlcy8yMTBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBeGVzIHdpdGggYXJyb3cgaGVhZHMgcG9pbnRpbmcgaW4gdGhlIHBvc2l0aXZlIGRpcmVjdGlvbiBvbmx5LlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jYWxjdWx1cy1ncmFwaGVyL2lzc3Vlcy8yNTNcclxuICAgIGNvbnN0IGF4aXNBcnJvd05vZGVPcHRpb25zOiBBeGlzQXJyb3dOb2RlT3B0aW9ucyA9IHtcclxuICAgICAgZG91YmxlSGVhZDogZmFsc2UsXHJcbiAgICAgIGV4dGVuc2lvbjogMCxcclxuICAgICAgc3Ryb2tlOiBudWxsXHJcbiAgICB9O1xyXG4gICAgY29uc3QgeEF4aXMgPSBuZXcgQXhpc0Fycm93Tm9kZSggdGhpcy5jaGFydFRyYW5zZm9ybSwgT3JpZW50YXRpb24uSE9SSVpPTlRBTCwgYXhpc0Fycm93Tm9kZU9wdGlvbnMgKTtcclxuICAgIGNvbnN0IHlBeGlzID0gbmV3IEF4aXNBcnJvd05vZGUoIHRoaXMuY2hhcnRUcmFuc2Zvcm0sIE9yaWVudGF0aW9uLlZFUlRJQ0FMLCBheGlzQXJyb3dOb2RlT3B0aW9ucyApO1xyXG4gICAgY29uc3QgYXhlc1BhcmVudCA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHhBeGlzLCB5QXhpcyBdLFxyXG4gICAgICBwaWNrYWJsZTogZmFsc2UgLy8gb3B0aW1pemF0aW9uLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2FsY3VsdXMtZ3JhcGhlci9pc3N1ZXMvMjEwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8geC1heGlzIHRpY2sgbWFya3MgYW5kIGxhYmVsc1xyXG4gICAgY29uc3QgeFNraXBDb29yZGluYXRlcyA9IFsgMCBdO1xyXG4gICAgY29uc3QgeFRpY2tNYXJrU2V0ID0gbmV3IFRpY2tNYXJrU2V0KCB0aGlzLmNoYXJ0VHJhbnNmb3JtLCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLCBNQUpPUl9HUklEX0xJTkVfU1BBQ0lORywge1xyXG4gICAgICBza2lwQ29vcmRpbmF0ZXM6IHhTa2lwQ29vcmRpbmF0ZXNcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHhUaWNrTGFiZWxTZXQgPSBuZXcgVGlja0xhYmVsU2V0KCB0aGlzLmNoYXJ0VHJhbnNmb3JtLCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLCBNQUpPUl9HUklEX0xJTkVfU1BBQ0lORywge1xyXG4gICAgICBza2lwQ29vcmRpbmF0ZXM6IHhTa2lwQ29vcmRpbmF0ZXMsXHJcbiAgICAgIGNyZWF0ZUxhYmVsOiAoIHZhbHVlOiBudW1iZXIgKSA9PiBuZXcgVGV4dCggVXRpbHMudG9GaXhlZCggdmFsdWUsIDAgKSwge1xyXG4gICAgICAgIGZvbnQ6IENhbGN1bHVzR3JhcGhlckNvbnN0YW50cy5USUNLX0xBQkVMX0ZPTlRcclxuICAgICAgICAvLyBObyBQaEVULWlPIGluc3RydW1lbnRhdGlvbiBpcyBkZXNpcmVkLlxyXG4gICAgICB9IClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB5LWF4aXMgdGljayBtYXJrcyBhbmQgbGFiZWxzXHJcbiAgICBjb25zdCB5VGlja01hcmtTZXQgPSBuZXcgVGlja01hcmtTZXQoIHRoaXMuY2hhcnRUcmFuc2Zvcm0sIE9yaWVudGF0aW9uLlZFUlRJQ0FMLCBNQUpPUl9HUklEX0xJTkVfU1BBQ0lORyApO1xyXG4gICAgbGV0IHlUaWNrTGFiZWxTZXQgPSBjcmVhdGVZVGlja0xhYmVsU2V0KCBNQUpPUl9HUklEX0xJTkVfU1BBQ0lORywgdGhpcy5jaGFydFRyYW5zZm9ybSApO1xyXG5cclxuICAgIGNvbnN0IHRpY2tzUGFyZW50ID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgeFRpY2tMYWJlbFNldCwgeFRpY2tNYXJrU2V0LCB5VGlja01hcmtTZXQsIHlUaWNrTGFiZWxTZXQgXSxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBDYWxjdWx1c0dyYXBoZXJQcmVmZXJlbmNlcy52YWx1ZXNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSAvLyBvcHRpbWl6YXRpb24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2FsY3VsdXMtZ3JhcGhlci9pc3N1ZXMvMjEwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRvZ2dsZSBidXR0b24gdGhhdCBjb250cm9scyB0aGUgdmlzaWJpbGl0eSBvZiB0aGlzLmN1cnZlTGF5ZXIuXHJcbiAgICB0aGlzLmV5ZVRvZ2dsZUJ1dHRvbiA9IG5ldyBFeWVUb2dnbGVCdXR0b24oIHRoaXMuY3VydmVMYXllclZpc2libGVQcm9wZXJ0eSwge1xyXG4gICAgICBzY2FsZTogMC41LFxyXG4gICAgICBiYXNlQ29sb3I6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5jdXJ2ZUxheWVyVmlzaWJsZVByb3BlcnR5IF0sXHJcbiAgICAgICAgdmlzaWJsZSA9PiB2aXNpYmxlID8gJ3doaXRlJyA6IFBoZXRDb2xvclNjaGVtZS5CVVRUT05fWUVMTE9XICksXHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogOCxcclxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiA4LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2V5ZVRvZ2dsZUJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB5Wm9vbUJ1dHRvbkdyb3VwIGlmIHdlIGhhdmUgYSB5Wm9vbUxldmVsUHJvcGVydHkuXHJcbiAgICBjb25zdCB5Wm9vbUJ1dHRvbkdyb3VwID0gdGhpcy55Wm9vbUxldmVsUHJvcGVydHkgPyBuZXcgUGx1c01pbnVzWm9vbUJ1dHRvbkdyb3VwKCB0aGlzLnlab29tTGV2ZWxQcm9wZXJ0eSwge1xyXG4gICAgICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJyxcclxuICAgICAgYnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIHN0cm9rZTogJ2JsYWNrJ1xyXG4gICAgICB9LFxyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDYsXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd5Wm9vbUJ1dHRvbkdyb3VwJyApLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7XHJcbiAgICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWVcclxuICAgICAgfVxyXG4gICAgfSApIDogbnVsbDtcclxuXHJcbiAgICAvLyBsYWJlbE5vZGUgaW4gbGVmdC10b3AgY29ybmVyIG9mIGNoYXJ0UmVjdGFuZ2xlXHJcbiAgICBsYWJlbE5vZGUuYm91bmRzUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICBsYWJlbE5vZGUubGVmdFRvcCA9IHRoaXMuY2hhcnRSZWN0YW5nbGUubGVmdFRvcC5hZGRYWSggQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzLkdSQVBIX1hfTUFSR0lOLCBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuR1JBUEhfWV9NQVJHSU4gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGp1c3QgYnV0dG9uIHBvc2l0aW9ucyB3aGVuIHRoZSB2aXNpYmlsaXR5IG9mIHRpY2tzIGNoYW5nZXMuXHJcbiAgICB0aWNrc1BhcmVudC52aXNpYmxlUHJvcGVydHkubGluayggdGlja3NQYXJlbnRWaXNpYmxlID0+IHtcclxuICAgICAgY29uc3QgcmlnaHROb2RlID0gdGlja3NQYXJlbnRWaXNpYmxlID8gdGlja3NQYXJlbnQgOiB0aGlzLmNoYXJ0UmVjdGFuZ2xlO1xyXG5cclxuICAgICAgLy8gRXllVG9nZ2xlQnV0dG9uIGF0IGJvdHRvbS1sZWZ0IG9mIGNoYXJ0IHJlY3RhbmdsZVxyXG4gICAgICB0aGlzLmV5ZVRvZ2dsZUJ1dHRvbi5yaWdodCA9IHJpZ2h0Tm9kZS5sZWZ0IC0gQlVUVE9OX1NQQUNJTkc7XHJcbiAgICAgIHRoaXMuZXllVG9nZ2xlQnV0dG9uLmJvdHRvbSA9IHRoaXMuY2hhcnRSZWN0YW5nbGUuYm90dG9tO1xyXG5cclxuICAgICAgLy8geVpvb21CdXR0b25Hcm91cCBhdCBsZWZ0LWNlbnRlciBvZiBjaGFydCByZWN0YW5nbGVcclxuICAgICAgaWYgKCB5Wm9vbUJ1dHRvbkdyb3VwICkge1xyXG4gICAgICAgIHlab29tQnV0dG9uR3JvdXAucmlnaHQgPSByaWdodE5vZGUubGVmdCAtIEJVVFRPTl9TUEFDSU5HO1xyXG4gICAgICAgIHlab29tQnV0dG9uR3JvdXAuY2VudGVyWSA9IHRoaXMuY2hhcnRSZWN0YW5nbGUuY2VudGVyWTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuID0gW1xyXG4gICAgICB0aGlzLmNoYXJ0UmVjdGFuZ2xlLFxyXG4gICAgICBncmlkTm9kZSxcclxuICAgICAgYXhlc1BhcmVudCxcclxuICAgICAgdGlja3NQYXJlbnQsXHJcbiAgICAgIGxhYmVsTm9kZSxcclxuICAgICAgdGhpcy5jdXJ2ZUxheWVyLFxyXG4gICAgICB0aGlzLmV5ZVRvZ2dsZUJ1dHRvblxyXG4gICAgXTtcclxuICAgIHlab29tQnV0dG9uR3JvdXAgJiYgY2hpbGRyZW4ucHVzaCggeVpvb21CdXR0b25Hcm91cCApO1xyXG4gICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG5cclxuICAgIC8vIElmIHdlIGhhdmUgYSB5Wm9vbUxldmVsUHJvcGVydHksIHJlc3BvbmQgdG8gY2hhbmdlcy5cclxuICAgIHRoaXMueVpvb21MZXZlbFByb3BlcnR5ICYmIHRoaXMueVpvb21MZXZlbFByb3BlcnR5LmxpbmsoIHpvb21MZXZlbCA9PiB7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgcHJldmlvdXMgeVRpY2tMYWJlbFNldCBhbmQgZGlzcG9zZSBvZiBpdFxyXG4gICAgICB0aWNrc1BhcmVudC5yZW1vdmVDaGlsZCggeVRpY2tMYWJlbFNldCApO1xyXG4gICAgICB5VGlja0xhYmVsU2V0LmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgIC8vIExvb2sgdXAgdGhlIG5ldyB5LWF4aXMgcmFuZ2UgYW5kIHRpY2sgc3BhY2luZy5cclxuICAgICAgY29uc3QgbWF4WSA9IFlfWk9PTV9JTkZPWyB6b29tTGV2ZWwgXS5tYXg7XHJcbiAgICAgIGNvbnN0IHRpY2tTcGFjaW5nID0gWV9aT09NX0lORk9bIHpvb21MZXZlbCBdLnRpY2tTcGFjaW5nO1xyXG5cclxuICAgICAgLy8gQWRqdXN0IHRoZSBjaGFydFRyYW5zZm9ybVxyXG4gICAgICB0aGlzLmNoYXJ0VHJhbnNmb3JtLnNldE1vZGVsWVJhbmdlKCBuZXcgUmFuZ2UoIC1tYXhZLCBtYXhZICkgKTtcclxuXHJcbiAgICAgIC8vIENoYW5nZSB0aGUgdmVydGljYWwgc3BhY2luZyBvZiB0aGUgdGljayBtYXJrcyBhbmQgbGFiZWxzLlxyXG4gICAgICB5VGlja01hcmtTZXQuc2V0U3BhY2luZyggdGlja1NwYWNpbmcgKTtcclxuICAgICAgeVRpY2tMYWJlbFNldCA9IGNyZWF0ZVlUaWNrTGFiZWxTZXQoIHRpY2tTcGFjaW5nLCB0aGlzLmNoYXJ0VHJhbnNmb3JtICk7XHJcbiAgICAgIHRpY2tzUGFyZW50LmFkZENoaWxkKCB5VGlja0xhYmVsU2V0ICk7XHJcblxyXG4gICAgICAvLyBIaWRlIHRoZSB5LWF4aXMgbWlub3IgZ3JpZCBsaW5lcyBpZiB0aGV5IGdldCB0b28gY2xvc2UgdG9nZXRoZXIuXHJcbiAgICAgIHlNaW5vckdyaWRMaW5lcy52aXNpYmxlID0gKCBNYXRoLmFicyggdGhpcy5jaGFydFRyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWSggTUlOT1JfR1JJRF9MSU5FX1NQQUNJTkcgKSApID4gNSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIGFsbFxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMueVpvb21MZXZlbFByb3BlcnR5ICYmIHRoaXMueVpvb21MZXZlbFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmN1cnZlTGF5ZXJWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY3VydmVOb2RlICYmIHRoaXMuY3VydmVOb2RlLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgUGxvdHRlZFBvaW50IHRvIHRoaXMgR3JhcGhOb2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRQbG90dGVkUG9pbnQoIGN1cnZlUG9pbnRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Q3VydmVQb2ludD4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogVENvbG9yLCB2aXNpYmxlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhbmRlbU5hbWU6IHN0cmluZyApOiBQbG90dGVkUG9pbnQge1xyXG4gICAgY29uc3QgcGxvdHRlZFBvaW50ID0gbmV3IFBsb3R0ZWRQb2ludCggY3VydmVQb2ludFByb3BlcnR5LCB0aGlzLmNoYXJ0VHJhbnNmb3JtLCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBmaWxsOiBmaWxsLFxyXG4gICAgICB0YW5kZW06IHRoaXMudGFuZGVtLmNyZWF0ZVRhbmRlbSggdGFuZGVtTmFtZSApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmN1cnZlTGF5ZXIuYWRkQ2hpbGQoIHBsb3R0ZWRQb2ludCApO1xyXG4gICAgcmV0dXJuIHBsb3R0ZWRQb2ludDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG9mZnNldCBvZiB0aGUgRXllVG9nZ2xlQnV0dG9uIGZyb20gdGhlIGxlZnQgZWRnZSBvZiB0aGUgQ2hhcnRSZWN0YW5nbGUuIFRoaXMgaXMgdXNlZCBmb3IgZHluYW1pYyBsYXlvdXQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEV5ZVRvZ2dsZUJ1dHRvblhPZmZzZXQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmV5ZVRvZ2dsZUJ1dHRvbi54IC0gdGhpcy54O1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGdldENoYXJ0UmVjdGFuZ2xlQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuY2hhcnRSZWN0YW5nbGUuZ2V0U2hhcGUoKS5ib3VuZHM7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIFRpY2tMYWJlbFNldCBmb3IgdGhlIHktYXhpcy5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZVlUaWNrTGFiZWxTZXQoIHNwYWNpbmc6IG51bWJlciwgY2hhcnRUcmFuc2Zvcm06IENoYXJ0VHJhbnNmb3JtICk6IFRpY2tMYWJlbFNldCB7XHJcblxyXG4gIC8vIE5vIG1vcmUgdGhhbiB0aHJlZSBkZWNpbWFsIHBsYWNlc1xyXG4gIGNvbnN0IGRlY2ltYWxQbGFjZXMgPSBNYXRoLm1pbiggMywgVXRpbHMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCBzcGFjaW5nICkgKTtcclxuXHJcbiAgcmV0dXJuIG5ldyBUaWNrTGFiZWxTZXQoIGNoYXJ0VHJhbnNmb3JtLCBPcmllbnRhdGlvbi5WRVJUSUNBTCwgc3BhY2luZywge1xyXG5cclxuICAgIC8vIERpc3BsYXkgemVybyB3aXRob3V0IGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgY3JlYXRlTGFiZWw6ICggdmFsdWU6IG51bWJlciApID0+IHtcclxuICAgICAgY29uc3QgdmFsdWVTdHJpbmcgPSAoIHZhbHVlID09PSAwICkgPyAnMCcgOiBVdGlscy50b0ZpeGVkKCB2YWx1ZSwgZGVjaW1hbFBsYWNlcyApO1xyXG4gICAgICByZXR1cm4gbmV3IFRleHQoIHZhbHVlU3RyaW5nLCB7XHJcbiAgICAgICAgZm9udDogQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzLlRJQ0tfTEFCRUxfRk9OVFxyXG4gICAgICAgIC8vIE5vIFBoRVQtaU8gaW5zdHJ1bWVudGF0aW9uIGlzIGRlc2lyZWQuXHJcbiAgICAgIH0gKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gUG9zaXRpb24gdGhlIGxhYmVsIHRvIGxlZnQgb2YgaXRzIGFzc29jaWF0ZWQgdGljayBtYXJrLCB3aXRoIGEgYml0IG9mIHNwYWNlLlxyXG4gICAgcG9zaXRpb25MYWJlbDogKCBsYWJlbDogTm9kZSwgdGlja0JvdW5kczogQm91bmRzMiApID0+IHtcclxuICAgICAgbGFiZWwucmlnaHRDZW50ZXIgPSB0aWNrQm91bmRzLmxlZnRDZW50ZXIubWludXNYWSggMSwgMCApO1xyXG4gICAgICByZXR1cm4gbGFiZWw7XHJcbiAgICB9XHJcbiAgfSApO1xyXG59XHJcblxyXG5jYWxjdWx1c0dyYXBoZXIucmVnaXN0ZXIoICdHcmFwaE5vZGUnLCBHcmFwaE5vZGUgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsYUFBYSxNQUFnQyx3Q0FBd0M7QUFDNUYsT0FBT0MsY0FBYyxNQUFpQyx5Q0FBeUM7QUFDL0YsT0FBT0MsY0FBYyxNQUFNLHlDQUF5QztBQUNwRSxPQUFPQyxXQUFXLE1BQU0sc0NBQXNDO0FBQzlELE9BQU9DLFlBQVksTUFBTSx1Q0FBdUM7QUFDaEUsT0FBT0MsV0FBVyxNQUFNLHNDQUFzQztBQUM5RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsU0FBU0MsSUFBSSxFQUF1QkMsSUFBSSxRQUFRLG1DQUFtQztBQUNuRixPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLHdCQUF3QixNQUFNLDBDQUEwQztBQUMvRSxPQUFPQyxTQUFTLE1BQU0sZ0JBQWdCO0FBRXRDLE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyx3QkFBd0IsTUFBTSx5REFBeUQ7QUFDOUYsT0FBT0MsZUFBZSxNQUFNLHdEQUF3RDtBQUNwRixPQUFPQyxxQkFBcUIsTUFBTSw2QkFBNkI7QUFHL0QsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBRS9DLE9BQU9DLGVBQWUsTUFBTSxnREFBZ0Q7QUFD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