// Copyright 2018-2022, University of Colorado Boulder

/**
 * XYChartNode is a chart that supports "scrolling" of model data with a ModelViewTransform2 so you can display
 * different ranges of data.
 *
 * Please see the demo in http://localhost/griddle/griddle_en.html
 *
 * Moved from wave-interference repo to griddle repo on Wed, Aug 29, 2018.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Emitter from '../../axon/js/Emitter.js';
import Property from '../../axon/js/Property.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import merge from '../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../phetcommon/js/view/ModelViewTransform2.js';
import { Node, Rectangle, Text } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import DynamicSeriesNode from './DynamicSeriesNode.js';
import griddle from './griddle.js';
import GridNode from './GridNode.js';

// constants
const LABEL_GRAPH_MARGIN = 3;
const HORIZONTAL_AXIS_LABEL_MARGIN = 4;
const VERTICAL_AXIS_LABEL_MARGIN = 8;

/**
 * @deprecated - please use BAMBOO/GridLineSet
 */
class XYChartNode extends Node {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    assert && deprecationWarning('Please use bamboo');
    super();
    options = merge({
      // dimensions for the chart, in view coordinates
      width: 500,
      height: 300,
      // {Property.<ModelViewTransform> - model-view transform for the data, null because default transform
      // is determined by default optional ranges defaultModelXRange and defaultModelYRange. Plot data is
      // in model coordinates and you can scale or translate the chart by modifying this Property. See
      // createRectangularModelViewTransform for typical and default chart transform.
      modelViewTransformProperty: null,
      // Default ranges in model coordinates for the model-view transform - the chart will display
      // these ranges of data within the view dimensions of width and height specified above.
      // These have no impact if you provide your own modelViewTransformProperty.
      defaultModelXRange: new Range(0, 4),
      defaultModelYRange: new Range(-1, 1),
      // corner radius for the panel containing the chart
      cornerRadius: 5,
      // {Node} - label for the vertical axis, should already be rotated if necessary
      verticalAxisLabelNode: null,
      // {Node} - label for the horizontal axis
      horizontalAxisLabelNode: null,
      // {PlotStyle} - Changes how the DynamicSeries data is drawn on the chart
      plotStyle: DynamicSeriesNode.PlotStyle.LINE,
      // {Object|null} - Options for the Rectangle that contains chart content, including GridNode and
      // DynamicSeriesNodes.
      chartPanelOptions: null,
      // filled in below because some defaults are based on other options

      // {boolean} - whether or not labels indicating numeric value of major grid lines are shown
      showVerticalGridLabels: true,
      showHorizontalGridLabels: true,
      // {number} - number of decimal places for the labels along grid lines
      verticalGridLabelNumberOfDecimalPlaces: 0,
      horizontalGridLabelNumberOfDecimalPlaces: 0,
      // options passed to both vertical and horizontal label text
      gridLabelOptions: {},
      // line spacing, in model coordinates
      majorVerticalLineSpacing: 1,
      majorHorizontalLineSpacing: 1,
      // options passed to GridNode
      gridNodeOptions: {
        majorLineOptions: {
          stroke: 'lightGray',
          lineWidth: 0.8
        }
      },
      tandem: Tandem.OPTIONAL
    }, options);

    // @public (read-only)
    this.chartWidth = options.width;
    this.chartHeight = options.height;

    // @private
    this.showVerticalGridLabels = options.showVerticalGridLabels;
    this.showHorizontalGridLabels = options.showHorizontalGridLabels;
    this.verticalGridLabelNumberOfDecimalPlaces = options.verticalGridLabelNumberOfDecimalPlaces;
    this.horizontalGridLabelNumberOfDecimalPlaces = options.horizontalGridLabelNumberOfDecimalPlaces;
    this.majorHorizontalLineSpacing = options.majorHorizontalLineSpacing;
    this.majorVerticalLineSpacing = options.majorVerticalLineSpacing;
    this.plotStyle = options.plotStyle;
    this.gridLabelOptions = options.gridLabelOptions;

    // default options to be passed into the chartPanel Rectangle
    options.chartPanelOptions = merge({
      fill: 'white',
      lineWidth: 1,
      // This stroke is covered by the front panel stroke, only included here to make sure the bounds align
      stroke: 'black',
      right: this.chartWidth,
      pickable: false
    }, options.chartPanelOptions);

    // White panel with gridlines that shows the data
    options.chartPanelOptions = merge({
      // Prevent data from being plotted outside the chart
      clipArea: Shape.roundedRectangleWithRadii(0, 0, this.chartWidth, this.chartHeight, {
        topLeft: options.cornerRadius,
        topRight: options.cornerRadius,
        bottomLeft: options.cornerRadius,
        bottomRight: options.cornerRadius
      })
    }, options.chartPanelOptions);
    const chartPanel = new Rectangle(0, 0, this.chartWidth, this.chartHeight, options.cornerRadius, options.cornerRadius, options.chartPanelOptions);

    // @public {Property.<ModelViewTransform2} - Observable model-view transformation for the data, set to
    // transform the chart (zoom or pan data). Default transform puts origin at bottom left of the chart with
    // x ranging from 0-4 and y ranging from -1 to 1
    this.modelViewTransformProperty = options.modelViewTransformProperty || new Property(this.createRectangularModelViewTransform(options.defaultModelXRange, options.defaultModelYRange));
    const gridNodeOptions = merge({
      majorHorizontalLineSpacing: this.majorHorizontalLineSpacing,
      majorVerticalLineSpacing: this.majorVerticalLineSpacing,
      modelViewTransformProperty: this.modelViewTransformProperty
    }, options.gridNodeOptions);

    // @protected
    this.gridNode = new GridNode(this.chartWidth, this.chartHeight, gridNodeOptions);
    chartPanel.addChild(this.gridNode);

    // @private {Node} - layers for each of the vertical and horizontal labels along grid lines
    this.verticalGridLabelLayer = new Node();
    this.horizontalGridLabelLayer = new Node();
    this.addChild(this.verticalGridLabelLayer);
    this.addChild(this.horizontalGridLabelLayer);
    const chartWidthWithMargin = this.chartWidth;

    // @private Map.<DynamicSeries,DynamicSeriesNode> maps a series the Node that displays it
    this.dynamicSeriesMap = new Map();
    this.addChild(chartPanel);

    // @public for adding addition components and doing relative layout
    this.chartPanel = chartPanel;
    this.redrawLabels();

    /**
     * Redraw the horizontal and vertical labels if the transform changes in such a way
     * that each set of labels needs to be redrawn.
     *
     * @param {Transform3} transform
     * @param {Transform3} oldTransform
     */
    const transformListener = (transform, oldTransform) => {
      const differenceMatrix = transform.matrix.minus(oldTransform.matrix);
      const scaleVector = differenceMatrix.scaleVector;
      const translationVector = differenceMatrix.translation;
      const horizontalDirty = scaleVector.x !== 0 || translationVector.x !== 0;
      const verticalDirty = scaleVector.y !== 0 || translationVector.y !== 0;
      if (verticalDirty) {
        this.redrawVerticalLabels();
      }
      if (horizontalDirty) {
        this.redrawHorizontalLabels();
      }
    };

    // linked lazily because listener needs old transform to determine changes
    this.modelViewTransformProperty.lazyLink(transformListener);

    // @private - for disposal
    this.scrollingChartNodeDisposeEmitter = new Emitter();

    // Stroke on front panel is on top, so that when the curves go to the edges they do not overlap the border stroke,
    // and so the GridNode appears below the panel stroke as well.
    chartPanel.addChild(new Rectangle(0, 0, this.chartWidth, this.chartHeight, options.cornerRadius, options.cornerRadius, {
      stroke: chartPanel.stroke,
      lineWidth: chartPanel.lineWidth,
      pickable: false
    }));

    /* -------------------------------------------
     * Optional decorations
     * -------------------------------------------*/

    // Position the vertical axis title node
    if (options.verticalAxisLabelNode) {
      options.verticalAxisLabelNode.mutate({
        maxHeight: chartPanel.height,
        right: this.bounds.minX - VERTICAL_AXIS_LABEL_MARGIN,
        // whether or not there are vertical axis labels, position to the left
        centerY: chartPanel.centerY
      });
      this.addChild(options.verticalAxisLabelNode);
    }

    // add and position the horizontal axis label
    if (options.horizontalAxisLabelNode) {
      this.addChild(options.horizontalAxisLabelNode);

      // For i18n, “Time” will expand symmetrically L/R until it gets too close to the scale bar. Then, the string will
      // expand to the R only, until it reaches the point it must be scaled down in size.
      options.horizontalAxisLabelNode.maxWidth = chartPanel.right - 2 * HORIZONTAL_AXIS_LABEL_MARGIN;

      // Position the horizontal axis title node after its maxWidth is specified
      const labelTop = this.showHorizontalGridLabels ? this.horizontalGridLabelLayer.bottom + LABEL_GRAPH_MARGIN : chartPanel.bottom + LABEL_GRAPH_MARGIN;
      options.horizontalAxisLabelNode.mutate({
        top: labelTop,
        centerX: chartWidthWithMargin / 2 + chartPanel.bounds.minX
      });
      if (options.horizontalAxisLabelNode.left < HORIZONTAL_AXIS_LABEL_MARGIN) {
        options.horizontalAxisLabelNode.left = HORIZONTAL_AXIS_LABEL_MARGIN;
      }
    }
    this.mutate(options);

    // @private - for dispose
    this.disposeScrollingChartNode = () => {
      this.scrollingChartNodeDisposeEmitter.emit();
      this.scrollingChartNodeDisposeEmitter.dispose();
      this.modelViewTransformProperty.unlink(transformListener);
    };
  }

  /**
   * @public
   * @param {number} verticalGridLabelNumberOfDecimalPlaces
   */
  setVerticalGridLabelNumberOfDecimalPlaces(verticalGridLabelNumberOfDecimalPlaces) {
    this.verticalGridLabelNumberOfDecimalPlaces = verticalGridLabelNumberOfDecimalPlaces;
    this.redrawVerticalLabels();
  }

  /**
   * @public
   * @param {number} horizontalGridLabelNumberOfDecimalPlaces
   */
  setHorizontalGridLabelNumberOfDecimalPlaces(horizontalGridLabelNumberOfDecimalPlaces) {
    this.horizontalGridLabelNumberOfDecimalPlaces = horizontalGridLabelNumberOfDecimalPlaces;
    this.redrawHorizontalLabels();
  }

  /**
   * Adds a DynamicSeriesNode to this XYChartNode.
   * @public
   *
   * @param {DynamicSeries} dynamicSeries
   */
  addDynamicSeries(dynamicSeries) {
    const dynamicSeriesNode = new DynamicSeriesNode(dynamicSeries, this.chartWidth, new Bounds2(0, 0, this.chartWidth, this.chartHeight), this.modelViewTransformProperty);
    this.dynamicSeriesMap.set(dynamicSeries, dynamicSeriesNode);
    this.chartPanel.addChild(dynamicSeriesNode);
    this.scrollingChartNodeDisposeEmitter.addListener(() => dynamicSeriesNode.dispose());
  }

  /**
   * Adds serveral DynamicSeries at once, for convenience.
   * @public
   *
   * @param {DynamicSeries[]} dynamicSeriesArray
   */
  addDynamicSeriesArray(dynamicSeriesArray) {
    dynamicSeriesArray.forEach(this.addDynamicSeries.bind(this));
  }

  /**
   * Remove a DynamicSeries (and its DynamicSeriesNode)_from this chart.
   * @public
   *
   * @param {DynamicSeries} dynamicSeries
   */
  removeDynamicSeries(dynamicSeries) {
    assert && assert(this.dynamicSeriesMap.has(dynamicSeries), 'trying to remove DynamicSeriesNode when one does not exist.');
    this.chartPanel.removeChild(this.dynamicSeriesMap.get(dynamicSeries));
    this.dynamicSeriesMap.delete(dynamicSeries);
  }

  /**
   * Set line spacings for the grid and labels.
   * @public
   *
   * @param {Object} config
   */
  setLineSpacings(config) {
    config = merge({
      // @param {number|null} - at least one spacing is required and values must
      // conform to requirements of line spacings in GridNode
      majorVerticalLineSpacing: null,
      majorHorizontalLineSpacing: null,
      minorVerticalLineSpacing: null,
      minorHorizontalLineSpacing: null
    }, config);
    this.majorHorizontalLineSpacing = config.majorHorizontalLineSpacing;
    this.majorVerticalLineSpacing = config.majorVerticalLineSpacing;
    this.gridNode.setLineSpacings(config);
    this.redrawLabels();
  }

  /**
   * Redraw labels along the vertical lines.
   * @protected
   */
  redrawVerticalLabels() {
    if (this.showVerticalGridLabels) {
      const verticalLabelChildren = [];
      const yPositions = this.gridNode.getLinePositionsInGrid(this.majorHorizontalLineSpacing, GridNode.LineType.MAJOR_HORIZONTAL);
      yPositions.forEach(yPosition => {
        const viewY = this.modelViewTransformProperty.get().modelToViewY(yPosition);
        const labelPoint = this.chartPanel.localToParentPoint(new Vector2(this.gridNode.bounds.left, viewY));
        const labelText = new Text(Utils.toFixed(yPosition, this.verticalGridLabelNumberOfDecimalPlaces), merge({
          rightCenter: labelPoint.plusXY(-3, 0)
        }, this.gridLabelOptions));
        verticalLabelChildren.push(labelText);
      });
      this.verticalGridLabelLayer.children = verticalLabelChildren;
    }
  }

  /**
   * Redraw labels along the horizontal grid lines.
   * @protected
   */
  redrawHorizontalLabels() {
    if (this.showHorizontalGridLabels) {
      // draw labels along the horizontal lines
      const horizontalLabelChildren = [];
      const xPositions = this.gridNode.getLinePositionsInGrid(this.majorVerticalLineSpacing, GridNode.LineType.MAJOR_VERTICAL);
      xPositions.forEach(xPosition => {
        const viewX = this.modelViewTransformProperty.get().modelToViewX(xPosition);
        const labelPoint = this.chartPanel.localToParentPoint(new Vector2(viewX, this.gridNode.bounds.bottom));
        const labelText = new Text(Utils.toFixed(xPosition, this.horizontalGridLabelNumberOfDecimalPlaces), merge({
          centerTop: labelPoint.plusXY(0, 3)
        }, this.gridLabelOptions));
        horizontalLabelChildren.push(labelText);
      });
      this.horizontalGridLabelLayer.children = horizontalLabelChildren;
    }
  }

  /**
   * Redraws labels for when line spacing or transform changes. Labels are only drawn along the major
   * grid lines.
   *
   * @protected
   */
  redrawLabels() {
    this.redrawVerticalLabels();
    this.redrawHorizontalLabels();
  }

  /**
   * Sets the plot style for the chart.
   *
   * @param {DynamicSeriesNode.PlotStyle} plotStyle - one of plotStyle
   * @public
   */
  setPlotStyle(plotStyle) {
    this.plotStyle = plotStyle;
    this.dynamicSeriesMap.forEach(dynamicSeriesNode => {
      dynamicSeriesNode.setPlotStyle(plotStyle);
    });
  }

  /**
   * Create a typical ModelViewTransform2 for the chart that spans the widthRange and heightRange in model coordinates
   * so that those ranges are contained within and fill the XYChartNode view bounds. Also inverts y so that
   * +y points up on the chart. Other transformms may be used, but this is the most common.
   * @public
   *
   * @param {Range} widthRange - in model coordinates
   * @param {Range} heightRange - in model coordinates
   * @returns {ModelViewTransform2}
   */
  createRectangularModelViewTransform(widthRange, heightRange) {
    return ModelViewTransform2.createRectangleInvertedYMapping(new Bounds2(widthRange.min, heightRange.min, widthRange.max, heightRange.max), new Bounds2(0, 0, this.chartWidth, this.chartHeight));
  }

  /**
   * Releases resources when no longer used.
   * @public
   * @override
   */
  dispose() {
    this.disposeScrollingChartNode();
    super.dispose();
  }
}
griddle.register('XYChartNode', XYChartNode);
export default XYChartNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiUHJvcGVydHkiLCJCb3VuZHMyIiwiUmFuZ2UiLCJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsImRlcHJlY2F0aW9uV2FybmluZyIsIm1lcmdlIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiVGFuZGVtIiwiRHluYW1pY1Nlcmllc05vZGUiLCJncmlkZGxlIiwiR3JpZE5vZGUiLCJMQUJFTF9HUkFQSF9NQVJHSU4iLCJIT1JJWk9OVEFMX0FYSVNfTEFCRUxfTUFSR0lOIiwiVkVSVElDQUxfQVhJU19MQUJFTF9NQVJHSU4iLCJYWUNoYXJ0Tm9kZSIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImFzc2VydCIsIndpZHRoIiwiaGVpZ2h0IiwibW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkiLCJkZWZhdWx0TW9kZWxYUmFuZ2UiLCJkZWZhdWx0TW9kZWxZUmFuZ2UiLCJjb3JuZXJSYWRpdXMiLCJ2ZXJ0aWNhbEF4aXNMYWJlbE5vZGUiLCJob3Jpem9udGFsQXhpc0xhYmVsTm9kZSIsInBsb3RTdHlsZSIsIlBsb3RTdHlsZSIsIkxJTkUiLCJjaGFydFBhbmVsT3B0aW9ucyIsInNob3dWZXJ0aWNhbEdyaWRMYWJlbHMiLCJzaG93SG9yaXpvbnRhbEdyaWRMYWJlbHMiLCJ2ZXJ0aWNhbEdyaWRMYWJlbE51bWJlck9mRGVjaW1hbFBsYWNlcyIsImhvcml6b250YWxHcmlkTGFiZWxOdW1iZXJPZkRlY2ltYWxQbGFjZXMiLCJncmlkTGFiZWxPcHRpb25zIiwibWFqb3JWZXJ0aWNhbExpbmVTcGFjaW5nIiwibWFqb3JIb3Jpem9udGFsTGluZVNwYWNpbmciLCJncmlkTm9kZU9wdGlvbnMiLCJtYWpvckxpbmVPcHRpb25zIiwic3Ryb2tlIiwibGluZVdpZHRoIiwidGFuZGVtIiwiT1BUSU9OQUwiLCJjaGFydFdpZHRoIiwiY2hhcnRIZWlnaHQiLCJmaWxsIiwicmlnaHQiLCJwaWNrYWJsZSIsImNsaXBBcmVhIiwicm91bmRlZFJlY3RhbmdsZVdpdGhSYWRpaSIsInRvcExlZnQiLCJ0b3BSaWdodCIsImJvdHRvbUxlZnQiLCJib3R0b21SaWdodCIsImNoYXJ0UGFuZWwiLCJjcmVhdGVSZWN0YW5ndWxhck1vZGVsVmlld1RyYW5zZm9ybSIsImdyaWROb2RlIiwiYWRkQ2hpbGQiLCJ2ZXJ0aWNhbEdyaWRMYWJlbExheWVyIiwiaG9yaXpvbnRhbEdyaWRMYWJlbExheWVyIiwiY2hhcnRXaWR0aFdpdGhNYXJnaW4iLCJkeW5hbWljU2VyaWVzTWFwIiwiTWFwIiwicmVkcmF3TGFiZWxzIiwidHJhbnNmb3JtTGlzdGVuZXIiLCJ0cmFuc2Zvcm0iLCJvbGRUcmFuc2Zvcm0iLCJkaWZmZXJlbmNlTWF0cml4IiwibWF0cml4IiwibWludXMiLCJzY2FsZVZlY3RvciIsInRyYW5zbGF0aW9uVmVjdG9yIiwidHJhbnNsYXRpb24iLCJob3Jpem9udGFsRGlydHkiLCJ4IiwidmVydGljYWxEaXJ0eSIsInkiLCJyZWRyYXdWZXJ0aWNhbExhYmVscyIsInJlZHJhd0hvcml6b250YWxMYWJlbHMiLCJsYXp5TGluayIsInNjcm9sbGluZ0NoYXJ0Tm9kZURpc3Bvc2VFbWl0dGVyIiwibXV0YXRlIiwibWF4SGVpZ2h0IiwiYm91bmRzIiwibWluWCIsImNlbnRlclkiLCJtYXhXaWR0aCIsImxhYmVsVG9wIiwiYm90dG9tIiwidG9wIiwiY2VudGVyWCIsImxlZnQiLCJkaXNwb3NlU2Nyb2xsaW5nQ2hhcnROb2RlIiwiZW1pdCIsImRpc3Bvc2UiLCJ1bmxpbmsiLCJzZXRWZXJ0aWNhbEdyaWRMYWJlbE51bWJlck9mRGVjaW1hbFBsYWNlcyIsInNldEhvcml6b250YWxHcmlkTGFiZWxOdW1iZXJPZkRlY2ltYWxQbGFjZXMiLCJhZGREeW5hbWljU2VyaWVzIiwiZHluYW1pY1NlcmllcyIsImR5bmFtaWNTZXJpZXNOb2RlIiwic2V0IiwiYWRkTGlzdGVuZXIiLCJhZGREeW5hbWljU2VyaWVzQXJyYXkiLCJkeW5hbWljU2VyaWVzQXJyYXkiLCJmb3JFYWNoIiwiYmluZCIsInJlbW92ZUR5bmFtaWNTZXJpZXMiLCJoYXMiLCJyZW1vdmVDaGlsZCIsImdldCIsImRlbGV0ZSIsInNldExpbmVTcGFjaW5ncyIsImNvbmZpZyIsIm1pbm9yVmVydGljYWxMaW5lU3BhY2luZyIsIm1pbm9ySG9yaXpvbnRhbExpbmVTcGFjaW5nIiwidmVydGljYWxMYWJlbENoaWxkcmVuIiwieVBvc2l0aW9ucyIsImdldExpbmVQb3NpdGlvbnNJbkdyaWQiLCJMaW5lVHlwZSIsIk1BSk9SX0hPUklaT05UQUwiLCJ5UG9zaXRpb24iLCJ2aWV3WSIsIm1vZGVsVG9WaWV3WSIsImxhYmVsUG9pbnQiLCJsb2NhbFRvUGFyZW50UG9pbnQiLCJsYWJlbFRleHQiLCJ0b0ZpeGVkIiwicmlnaHRDZW50ZXIiLCJwbHVzWFkiLCJwdXNoIiwiY2hpbGRyZW4iLCJob3Jpem9udGFsTGFiZWxDaGlsZHJlbiIsInhQb3NpdGlvbnMiLCJNQUpPUl9WRVJUSUNBTCIsInhQb3NpdGlvbiIsInZpZXdYIiwibW9kZWxUb1ZpZXdYIiwiY2VudGVyVG9wIiwic2V0UGxvdFN0eWxlIiwid2lkdGhSYW5nZSIsImhlaWdodFJhbmdlIiwiY3JlYXRlUmVjdGFuZ2xlSW52ZXJ0ZWRZTWFwcGluZyIsIm1pbiIsIm1heCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiWFlDaGFydE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogWFlDaGFydE5vZGUgaXMgYSBjaGFydCB0aGF0IHN1cHBvcnRzIFwic2Nyb2xsaW5nXCIgb2YgbW9kZWwgZGF0YSB3aXRoIGEgTW9kZWxWaWV3VHJhbnNmb3JtMiBzbyB5b3UgY2FuIGRpc3BsYXlcclxuICogZGlmZmVyZW50IHJhbmdlcyBvZiBkYXRhLlxyXG4gKlxyXG4gKiBQbGVhc2Ugc2VlIHRoZSBkZW1vIGluIGh0dHA6Ly9sb2NhbGhvc3QvZ3JpZGRsZS9ncmlkZGxlX2VuLmh0bWxcclxuICpcclxuICogTW92ZWQgZnJvbSB3YXZlLWludGVyZmVyZW5jZSByZXBvIHRvIGdyaWRkbGUgcmVwbyBvbiBXZWQsIEF1ZyAyOSwgMjAxOC5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBkZXByZWNhdGlvbldhcm5pbmcgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RlcHJlY2F0aW9uV2FybmluZy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFJlY3RhbmdsZSwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBEeW5hbWljU2VyaWVzTm9kZSBmcm9tICcuL0R5bmFtaWNTZXJpZXNOb2RlLmpzJztcclxuaW1wb3J0IGdyaWRkbGUgZnJvbSAnLi9ncmlkZGxlLmpzJztcclxuaW1wb3J0IEdyaWROb2RlIGZyb20gJy4vR3JpZE5vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IExBQkVMX0dSQVBIX01BUkdJTiA9IDM7XHJcbmNvbnN0IEhPUklaT05UQUxfQVhJU19MQUJFTF9NQVJHSU4gPSA0O1xyXG5jb25zdCBWRVJUSUNBTF9BWElTX0xBQkVMX01BUkdJTiA9IDg7XHJcblxyXG4vKipcclxuICogQGRlcHJlY2F0ZWQgLSBwbGVhc2UgdXNlIEJBTUJPTy9HcmlkTGluZVNldFxyXG4gKi9cclxuY2xhc3MgWFlDaGFydE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGRlcHJlY2F0aW9uV2FybmluZyggJ1BsZWFzZSB1c2UgYmFtYm9vJyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBkaW1lbnNpb25zIGZvciB0aGUgY2hhcnQsIGluIHZpZXcgY29vcmRpbmF0ZXNcclxuICAgICAgd2lkdGg6IDUwMCxcclxuICAgICAgaGVpZ2h0OiAzMDAsXHJcblxyXG4gICAgICAvLyB7UHJvcGVydHkuPE1vZGVsVmlld1RyYW5zZm9ybT4gLSBtb2RlbC12aWV3IHRyYW5zZm9ybSBmb3IgdGhlIGRhdGEsIG51bGwgYmVjYXVzZSBkZWZhdWx0IHRyYW5zZm9ybVxyXG4gICAgICAvLyBpcyBkZXRlcm1pbmVkIGJ5IGRlZmF1bHQgb3B0aW9uYWwgcmFuZ2VzIGRlZmF1bHRNb2RlbFhSYW5nZSBhbmQgZGVmYXVsdE1vZGVsWVJhbmdlLiBQbG90IGRhdGEgaXNcclxuICAgICAgLy8gaW4gbW9kZWwgY29vcmRpbmF0ZXMgYW5kIHlvdSBjYW4gc2NhbGUgb3IgdHJhbnNsYXRlIHRoZSBjaGFydCBieSBtb2RpZnlpbmcgdGhpcyBQcm9wZXJ0eS4gU2VlXHJcbiAgICAgIC8vIGNyZWF0ZVJlY3Rhbmd1bGFyTW9kZWxWaWV3VHJhbnNmb3JtIGZvciB0eXBpY2FsIGFuZCBkZWZhdWx0IGNoYXJ0IHRyYW5zZm9ybS5cclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHk6IG51bGwsXHJcblxyXG4gICAgICAvLyBEZWZhdWx0IHJhbmdlcyBpbiBtb2RlbCBjb29yZGluYXRlcyBmb3IgdGhlIG1vZGVsLXZpZXcgdHJhbnNmb3JtIC0gdGhlIGNoYXJ0IHdpbGwgZGlzcGxheVxyXG4gICAgICAvLyB0aGVzZSByYW5nZXMgb2YgZGF0YSB3aXRoaW4gdGhlIHZpZXcgZGltZW5zaW9ucyBvZiB3aWR0aCBhbmQgaGVpZ2h0IHNwZWNpZmllZCBhYm92ZS5cclxuICAgICAgLy8gVGhlc2UgaGF2ZSBubyBpbXBhY3QgaWYgeW91IHByb3ZpZGUgeW91ciBvd24gbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkuXHJcbiAgICAgIGRlZmF1bHRNb2RlbFhSYW5nZTogbmV3IFJhbmdlKCAwLCA0ICksXHJcbiAgICAgIGRlZmF1bHRNb2RlbFlSYW5nZTogbmV3IFJhbmdlKCAtMSwgMSApLFxyXG5cclxuICAgICAgLy8gY29ybmVyIHJhZGl1cyBmb3IgdGhlIHBhbmVsIGNvbnRhaW5pbmcgdGhlIGNoYXJ0XHJcbiAgICAgIGNvcm5lclJhZGl1czogNSxcclxuXHJcbiAgICAgIC8vIHtOb2RlfSAtIGxhYmVsIGZvciB0aGUgdmVydGljYWwgYXhpcywgc2hvdWxkIGFscmVhZHkgYmUgcm90YXRlZCBpZiBuZWNlc3NhcnlcclxuICAgICAgdmVydGljYWxBeGlzTGFiZWxOb2RlOiBudWxsLFxyXG5cclxuICAgICAgLy8ge05vZGV9IC0gbGFiZWwgZm9yIHRoZSBob3Jpem9udGFsIGF4aXNcclxuICAgICAgaG9yaXpvbnRhbEF4aXNMYWJlbE5vZGU6IG51bGwsXHJcblxyXG4gICAgICAvLyB7UGxvdFN0eWxlfSAtIENoYW5nZXMgaG93IHRoZSBEeW5hbWljU2VyaWVzIGRhdGEgaXMgZHJhd24gb24gdGhlIGNoYXJ0XHJcbiAgICAgIHBsb3RTdHlsZTogRHluYW1pY1Nlcmllc05vZGUuUGxvdFN0eWxlLkxJTkUsXHJcblxyXG4gICAgICAvLyB7T2JqZWN0fG51bGx9IC0gT3B0aW9ucyBmb3IgdGhlIFJlY3RhbmdsZSB0aGF0IGNvbnRhaW5zIGNoYXJ0IGNvbnRlbnQsIGluY2x1ZGluZyBHcmlkTm9kZSBhbmRcclxuICAgICAgLy8gRHluYW1pY1Nlcmllc05vZGVzLlxyXG4gICAgICBjaGFydFBhbmVsT3B0aW9uczogbnVsbCwgLy8gZmlsbGVkIGluIGJlbG93IGJlY2F1c2Ugc29tZSBkZWZhdWx0cyBhcmUgYmFzZWQgb24gb3RoZXIgb3B0aW9uc1xyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3QgbGFiZWxzIGluZGljYXRpbmcgbnVtZXJpYyB2YWx1ZSBvZiBtYWpvciBncmlkIGxpbmVzIGFyZSBzaG93blxyXG4gICAgICBzaG93VmVydGljYWxHcmlkTGFiZWxzOiB0cnVlLFxyXG4gICAgICBzaG93SG9yaXpvbnRhbEdyaWRMYWJlbHM6IHRydWUsXHJcblxyXG4gICAgICAvLyB7bnVtYmVyfSAtIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBmb3IgdGhlIGxhYmVscyBhbG9uZyBncmlkIGxpbmVzXHJcbiAgICAgIHZlcnRpY2FsR3JpZExhYmVsTnVtYmVyT2ZEZWNpbWFsUGxhY2VzOiAwLFxyXG4gICAgICBob3Jpem9udGFsR3JpZExhYmVsTnVtYmVyT2ZEZWNpbWFsUGxhY2VzOiAwLFxyXG5cclxuICAgICAgLy8gb3B0aW9ucyBwYXNzZWQgdG8gYm90aCB2ZXJ0aWNhbCBhbmQgaG9yaXpvbnRhbCBsYWJlbCB0ZXh0XHJcbiAgICAgIGdyaWRMYWJlbE9wdGlvbnM6IHt9LFxyXG5cclxuICAgICAgLy8gbGluZSBzcGFjaW5nLCBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAgICBtYWpvclZlcnRpY2FsTGluZVNwYWNpbmc6IDEsXHJcbiAgICAgIG1ham9ySG9yaXpvbnRhbExpbmVTcGFjaW5nOiAxLFxyXG5cclxuICAgICAgLy8gb3B0aW9ucyBwYXNzZWQgdG8gR3JpZE5vZGVcclxuICAgICAgZ3JpZE5vZGVPcHRpb25zOiB7XHJcbiAgICAgICAgbWFqb3JMaW5lT3B0aW9uczoge1xyXG4gICAgICAgICAgc3Ryb2tlOiAnbGlnaHRHcmF5JyxcclxuICAgICAgICAgIGxpbmVXaWR0aDogMC44XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUSU9OQUxcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLmNoYXJ0V2lkdGggPSBvcHRpb25zLndpZHRoO1xyXG4gICAgdGhpcy5jaGFydEhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0O1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnNob3dWZXJ0aWNhbEdyaWRMYWJlbHMgPSBvcHRpb25zLnNob3dWZXJ0aWNhbEdyaWRMYWJlbHM7XHJcbiAgICB0aGlzLnNob3dIb3Jpem9udGFsR3JpZExhYmVscyA9IG9wdGlvbnMuc2hvd0hvcml6b250YWxHcmlkTGFiZWxzO1xyXG4gICAgdGhpcy52ZXJ0aWNhbEdyaWRMYWJlbE51bWJlck9mRGVjaW1hbFBsYWNlcyA9IG9wdGlvbnMudmVydGljYWxHcmlkTGFiZWxOdW1iZXJPZkRlY2ltYWxQbGFjZXM7XHJcbiAgICB0aGlzLmhvcml6b250YWxHcmlkTGFiZWxOdW1iZXJPZkRlY2ltYWxQbGFjZXMgPSBvcHRpb25zLmhvcml6b250YWxHcmlkTGFiZWxOdW1iZXJPZkRlY2ltYWxQbGFjZXM7XHJcbiAgICB0aGlzLm1ham9ySG9yaXpvbnRhbExpbmVTcGFjaW5nID0gb3B0aW9ucy5tYWpvckhvcml6b250YWxMaW5lU3BhY2luZztcclxuICAgIHRoaXMubWFqb3JWZXJ0aWNhbExpbmVTcGFjaW5nID0gb3B0aW9ucy5tYWpvclZlcnRpY2FsTGluZVNwYWNpbmc7XHJcbiAgICB0aGlzLnBsb3RTdHlsZSA9IG9wdGlvbnMucGxvdFN0eWxlO1xyXG4gICAgdGhpcy5ncmlkTGFiZWxPcHRpb25zID0gb3B0aW9ucy5ncmlkTGFiZWxPcHRpb25zO1xyXG5cclxuICAgIC8vIGRlZmF1bHQgb3B0aW9ucyB0byBiZSBwYXNzZWQgaW50byB0aGUgY2hhcnRQYW5lbCBSZWN0YW5nbGVcclxuICAgIG9wdGlvbnMuY2hhcnRQYW5lbE9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcblxyXG4gICAgICAvLyBUaGlzIHN0cm9rZSBpcyBjb3ZlcmVkIGJ5IHRoZSBmcm9udCBwYW5lbCBzdHJva2UsIG9ubHkgaW5jbHVkZWQgaGVyZSB0byBtYWtlIHN1cmUgdGhlIGJvdW5kcyBhbGlnblxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmNoYXJ0V2lkdGgsXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgfSwgb3B0aW9ucy5jaGFydFBhbmVsT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFdoaXRlIHBhbmVsIHdpdGggZ3JpZGxpbmVzIHRoYXQgc2hvd3MgdGhlIGRhdGFcclxuICAgIG9wdGlvbnMuY2hhcnRQYW5lbE9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8gUHJldmVudCBkYXRhIGZyb20gYmVpbmcgcGxvdHRlZCBvdXRzaWRlIHRoZSBjaGFydFxyXG4gICAgICBjbGlwQXJlYTogU2hhcGUucm91bmRlZFJlY3RhbmdsZVdpdGhSYWRpaSggMCwgMCwgdGhpcy5jaGFydFdpZHRoLCB0aGlzLmNoYXJ0SGVpZ2h0LCB7XHJcbiAgICAgICAgdG9wTGVmdDogb3B0aW9ucy5jb3JuZXJSYWRpdXMsXHJcbiAgICAgICAgdG9wUmlnaHQ6IG9wdGlvbnMuY29ybmVyUmFkaXVzLFxyXG4gICAgICAgIGJvdHRvbUxlZnQ6IG9wdGlvbnMuY29ybmVyUmFkaXVzLFxyXG4gICAgICAgIGJvdHRvbVJpZ2h0OiBvcHRpb25zLmNvcm5lclJhZGl1c1xyXG4gICAgICB9IClcclxuICAgIH0sIG9wdGlvbnMuY2hhcnRQYW5lbE9wdGlvbnMgKTtcclxuICAgIGNvbnN0IGNoYXJ0UGFuZWwgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCB0aGlzLmNoYXJ0V2lkdGgsIHRoaXMuY2hhcnRIZWlnaHQsIG9wdGlvbnMuY29ybmVyUmFkaXVzLCBvcHRpb25zLmNvcm5lclJhZGl1cyxcclxuICAgICAgb3B0aW9ucy5jaGFydFBhbmVsT3B0aW9uc1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48TW9kZWxWaWV3VHJhbnNmb3JtMn0gLSBPYnNlcnZhYmxlIG1vZGVsLXZpZXcgdHJhbnNmb3JtYXRpb24gZm9yIHRoZSBkYXRhLCBzZXQgdG9cclxuICAgIC8vIHRyYW5zZm9ybSB0aGUgY2hhcnQgKHpvb20gb3IgcGFuIGRhdGEpLiBEZWZhdWx0IHRyYW5zZm9ybSBwdXRzIG9yaWdpbiBhdCBib3R0b20gbGVmdCBvZiB0aGUgY2hhcnQgd2l0aFxyXG4gICAgLy8geCByYW5naW5nIGZyb20gMC00IGFuZCB5IHJhbmdpbmcgZnJvbSAtMSB0byAxXHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5ID0gb3B0aW9ucy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSB8fCBuZXcgUHJvcGVydHkoIHRoaXMuY3JlYXRlUmVjdGFuZ3VsYXJNb2RlbFZpZXdUcmFuc2Zvcm0oIG9wdGlvbnMuZGVmYXVsdE1vZGVsWFJhbmdlLCBvcHRpb25zLmRlZmF1bHRNb2RlbFlSYW5nZSApICk7XHJcblxyXG4gICAgY29uc3QgZ3JpZE5vZGVPcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgbWFqb3JIb3Jpem9udGFsTGluZVNwYWNpbmc6IHRoaXMubWFqb3JIb3Jpem9udGFsTGluZVNwYWNpbmcsXHJcbiAgICAgIG1ham9yVmVydGljYWxMaW5lU3BhY2luZzogdGhpcy5tYWpvclZlcnRpY2FsTGluZVNwYWNpbmcsXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5OiB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5XHJcbiAgICB9LCBvcHRpb25zLmdyaWROb2RlT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWRcclxuICAgIHRoaXMuZ3JpZE5vZGUgPSBuZXcgR3JpZE5vZGUoIHRoaXMuY2hhcnRXaWR0aCwgdGhpcy5jaGFydEhlaWdodCwgZ3JpZE5vZGVPcHRpb25zICk7XHJcblxyXG4gICAgY2hhcnRQYW5lbC5hZGRDaGlsZCggdGhpcy5ncmlkTm9kZSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOb2RlfSAtIGxheWVycyBmb3IgZWFjaCBvZiB0aGUgdmVydGljYWwgYW5kIGhvcml6b250YWwgbGFiZWxzIGFsb25nIGdyaWQgbGluZXNcclxuICAgIHRoaXMudmVydGljYWxHcmlkTGFiZWxMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmhvcml6b250YWxHcmlkTGFiZWxMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnZlcnRpY2FsR3JpZExhYmVsTGF5ZXIgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuaG9yaXpvbnRhbEdyaWRMYWJlbExheWVyICk7XHJcblxyXG4gICAgY29uc3QgY2hhcnRXaWR0aFdpdGhNYXJnaW4gPSB0aGlzLmNoYXJ0V2lkdGg7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgTWFwLjxEeW5hbWljU2VyaWVzLER5bmFtaWNTZXJpZXNOb2RlPiBtYXBzIGEgc2VyaWVzIHRoZSBOb2RlIHRoYXQgZGlzcGxheXMgaXRcclxuICAgIHRoaXMuZHluYW1pY1Nlcmllc01hcCA9IG5ldyBNYXAoKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBjaGFydFBhbmVsICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyBmb3IgYWRkaW5nIGFkZGl0aW9uIGNvbXBvbmVudHMgYW5kIGRvaW5nIHJlbGF0aXZlIGxheW91dFxyXG4gICAgdGhpcy5jaGFydFBhbmVsID0gY2hhcnRQYW5lbDtcclxuXHJcbiAgICB0aGlzLnJlZHJhd0xhYmVscygpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVkcmF3IHRoZSBob3Jpem9udGFsIGFuZCB2ZXJ0aWNhbCBsYWJlbHMgaWYgdGhlIHRyYW5zZm9ybSBjaGFuZ2VzIGluIHN1Y2ggYSB3YXlcclxuICAgICAqIHRoYXQgZWFjaCBzZXQgb2YgbGFiZWxzIG5lZWRzIHRvIGJlIHJlZHJhd24uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtUcmFuc2Zvcm0zfSB0cmFuc2Zvcm1cclxuICAgICAqIEBwYXJhbSB7VHJhbnNmb3JtM30gb2xkVHJhbnNmb3JtXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHRyYW5zZm9ybUxpc3RlbmVyID0gKCB0cmFuc2Zvcm0sIG9sZFRyYW5zZm9ybSApID0+IHtcclxuICAgICAgY29uc3QgZGlmZmVyZW5jZU1hdHJpeCA9IHRyYW5zZm9ybS5tYXRyaXgubWludXMoIG9sZFRyYW5zZm9ybS5tYXRyaXggKTtcclxuXHJcbiAgICAgIGNvbnN0IHNjYWxlVmVjdG9yID0gZGlmZmVyZW5jZU1hdHJpeC5zY2FsZVZlY3RvcjtcclxuICAgICAgY29uc3QgdHJhbnNsYXRpb25WZWN0b3IgPSBkaWZmZXJlbmNlTWF0cml4LnRyYW5zbGF0aW9uO1xyXG5cclxuICAgICAgY29uc3QgaG9yaXpvbnRhbERpcnR5ID0gc2NhbGVWZWN0b3IueCAhPT0gMCB8fCB0cmFuc2xhdGlvblZlY3Rvci54ICE9PSAwO1xyXG4gICAgICBjb25zdCB2ZXJ0aWNhbERpcnR5ID0gc2NhbGVWZWN0b3IueSAhPT0gMCB8fCB0cmFuc2xhdGlvblZlY3Rvci55ICE9PSAwO1xyXG5cclxuICAgICAgaWYgKCB2ZXJ0aWNhbERpcnR5ICkge1xyXG4gICAgICAgIHRoaXMucmVkcmF3VmVydGljYWxMYWJlbHMoKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGhvcml6b250YWxEaXJ0eSApIHtcclxuICAgICAgICB0aGlzLnJlZHJhd0hvcml6b250YWxMYWJlbHMoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBsaW5rZWQgbGF6aWx5IGJlY2F1c2UgbGlzdGVuZXIgbmVlZHMgb2xkIHRyYW5zZm9ybSB0byBkZXRlcm1pbmUgY2hhbmdlc1xyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS5sYXp5TGluayggdHJhbnNmb3JtTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGZvciBkaXNwb3NhbFxyXG4gICAgdGhpcy5zY3JvbGxpbmdDaGFydE5vZGVEaXNwb3NlRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gU3Ryb2tlIG9uIGZyb250IHBhbmVsIGlzIG9uIHRvcCwgc28gdGhhdCB3aGVuIHRoZSBjdXJ2ZXMgZ28gdG8gdGhlIGVkZ2VzIHRoZXkgZG8gbm90IG92ZXJsYXAgdGhlIGJvcmRlciBzdHJva2UsXHJcbiAgICAvLyBhbmQgc28gdGhlIEdyaWROb2RlIGFwcGVhcnMgYmVsb3cgdGhlIHBhbmVsIHN0cm9rZSBhcyB3ZWxsLlxyXG4gICAgY2hhcnRQYW5lbC5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggMCwgMCwgdGhpcy5jaGFydFdpZHRoLCB0aGlzLmNoYXJ0SGVpZ2h0LCBvcHRpb25zLmNvcm5lclJhZGl1cywgb3B0aW9ucy5jb3JuZXJSYWRpdXMsIHtcclxuICAgICAgc3Ryb2tlOiBjaGFydFBhbmVsLnN0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiBjaGFydFBhbmVsLmxpbmVXaWR0aCxcclxuICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgKiBPcHRpb25hbCBkZWNvcmF0aW9uc1xyXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gICAgLy8gUG9zaXRpb24gdGhlIHZlcnRpY2FsIGF4aXMgdGl0bGUgbm9kZVxyXG4gICAgaWYgKCBvcHRpb25zLnZlcnRpY2FsQXhpc0xhYmVsTm9kZSApIHtcclxuICAgICAgb3B0aW9ucy52ZXJ0aWNhbEF4aXNMYWJlbE5vZGUubXV0YXRlKCB7XHJcbiAgICAgICAgbWF4SGVpZ2h0OiBjaGFydFBhbmVsLmhlaWdodCxcclxuICAgICAgICByaWdodDogdGhpcy5ib3VuZHMubWluWCAtIFZFUlRJQ0FMX0FYSVNfTEFCRUxfTUFSR0lOLCAvLyB3aGV0aGVyIG9yIG5vdCB0aGVyZSBhcmUgdmVydGljYWwgYXhpcyBsYWJlbHMsIHBvc2l0aW9uIHRvIHRoZSBsZWZ0XHJcbiAgICAgICAgY2VudGVyWTogY2hhcnRQYW5lbC5jZW50ZXJZXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggb3B0aW9ucy52ZXJ0aWNhbEF4aXNMYWJlbE5vZGUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhZGQgYW5kIHBvc2l0aW9uIHRoZSBob3Jpem9udGFsIGF4aXMgbGFiZWxcclxuICAgIGlmICggb3B0aW9ucy5ob3Jpem9udGFsQXhpc0xhYmVsTm9kZSApIHtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggb3B0aW9ucy5ob3Jpem9udGFsQXhpc0xhYmVsTm9kZSApO1xyXG5cclxuICAgICAgLy8gRm9yIGkxOG4sIOKAnFRpbWXigJ0gd2lsbCBleHBhbmQgc3ltbWV0cmljYWxseSBML1IgdW50aWwgaXQgZ2V0cyB0b28gY2xvc2UgdG8gdGhlIHNjYWxlIGJhci4gVGhlbiwgdGhlIHN0cmluZyB3aWxsXHJcbiAgICAgIC8vIGV4cGFuZCB0byB0aGUgUiBvbmx5LCB1bnRpbCBpdCByZWFjaGVzIHRoZSBwb2ludCBpdCBtdXN0IGJlIHNjYWxlZCBkb3duIGluIHNpemUuXHJcbiAgICAgIG9wdGlvbnMuaG9yaXpvbnRhbEF4aXNMYWJlbE5vZGUubWF4V2lkdGggPSBjaGFydFBhbmVsLnJpZ2h0IC0gMiAqIEhPUklaT05UQUxfQVhJU19MQUJFTF9NQVJHSU47XHJcblxyXG4gICAgICAvLyBQb3NpdGlvbiB0aGUgaG9yaXpvbnRhbCBheGlzIHRpdGxlIG5vZGUgYWZ0ZXIgaXRzIG1heFdpZHRoIGlzIHNwZWNpZmllZFxyXG4gICAgICBjb25zdCBsYWJlbFRvcCA9IHRoaXMuc2hvd0hvcml6b250YWxHcmlkTGFiZWxzID8gdGhpcy5ob3Jpem9udGFsR3JpZExhYmVsTGF5ZXIuYm90dG9tICsgTEFCRUxfR1JBUEhfTUFSR0lOIDogY2hhcnRQYW5lbC5ib3R0b20gKyBMQUJFTF9HUkFQSF9NQVJHSU47XHJcbiAgICAgIG9wdGlvbnMuaG9yaXpvbnRhbEF4aXNMYWJlbE5vZGUubXV0YXRlKCB7XHJcbiAgICAgICAgdG9wOiBsYWJlbFRvcCxcclxuICAgICAgICBjZW50ZXJYOiBjaGFydFdpZHRoV2l0aE1hcmdpbiAvIDIgKyBjaGFydFBhbmVsLmJvdW5kcy5taW5YXHJcbiAgICAgIH0gKTtcclxuICAgICAgaWYgKCBvcHRpb25zLmhvcml6b250YWxBeGlzTGFiZWxOb2RlLmxlZnQgPCBIT1JJWk9OVEFMX0FYSVNfTEFCRUxfTUFSR0lOICkge1xyXG4gICAgICAgIG9wdGlvbnMuaG9yaXpvbnRhbEF4aXNMYWJlbE5vZGUubGVmdCA9IEhPUklaT05UQUxfQVhJU19MQUJFTF9NQVJHSU47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gZm9yIGRpc3Bvc2VcclxuICAgIHRoaXMuZGlzcG9zZVNjcm9sbGluZ0NoYXJ0Tm9kZSA9ICgpID0+IHtcclxuICAgICAgdGhpcy5zY3JvbGxpbmdDaGFydE5vZGVEaXNwb3NlRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgIHRoaXMuc2Nyb2xsaW5nQ2hhcnROb2RlRGlzcG9zZUVtaXR0ZXIuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LnVubGluayggdHJhbnNmb3JtTGlzdGVuZXIgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZlcnRpY2FsR3JpZExhYmVsTnVtYmVyT2ZEZWNpbWFsUGxhY2VzXHJcbiAgICovXHJcbiAgc2V0VmVydGljYWxHcmlkTGFiZWxOdW1iZXJPZkRlY2ltYWxQbGFjZXMoIHZlcnRpY2FsR3JpZExhYmVsTnVtYmVyT2ZEZWNpbWFsUGxhY2VzICkge1xyXG4gICAgdGhpcy52ZXJ0aWNhbEdyaWRMYWJlbE51bWJlck9mRGVjaW1hbFBsYWNlcyA9IHZlcnRpY2FsR3JpZExhYmVsTnVtYmVyT2ZEZWNpbWFsUGxhY2VzO1xyXG4gICAgdGhpcy5yZWRyYXdWZXJ0aWNhbExhYmVscygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBob3Jpem9udGFsR3JpZExhYmVsTnVtYmVyT2ZEZWNpbWFsUGxhY2VzXHJcbiAgICovXHJcbiAgc2V0SG9yaXpvbnRhbEdyaWRMYWJlbE51bWJlck9mRGVjaW1hbFBsYWNlcyggaG9yaXpvbnRhbEdyaWRMYWJlbE51bWJlck9mRGVjaW1hbFBsYWNlcyApIHtcclxuICAgIHRoaXMuaG9yaXpvbnRhbEdyaWRMYWJlbE51bWJlck9mRGVjaW1hbFBsYWNlcyA9IGhvcml6b250YWxHcmlkTGFiZWxOdW1iZXJPZkRlY2ltYWxQbGFjZXM7XHJcbiAgICB0aGlzLnJlZHJhd0hvcml6b250YWxMYWJlbHMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBEeW5hbWljU2VyaWVzTm9kZSB0byB0aGlzIFhZQ2hhcnROb2RlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHluYW1pY1Nlcmllc30gZHluYW1pY1Nlcmllc1xyXG4gICAqL1xyXG4gIGFkZER5bmFtaWNTZXJpZXMoIGR5bmFtaWNTZXJpZXMgKSB7XHJcbiAgICBjb25zdCBkeW5hbWljU2VyaWVzTm9kZSA9IG5ldyBEeW5hbWljU2VyaWVzTm9kZShcclxuICAgICAgZHluYW1pY1NlcmllcyxcclxuICAgICAgdGhpcy5jaGFydFdpZHRoLFxyXG4gICAgICBuZXcgQm91bmRzMiggMCwgMCwgdGhpcy5jaGFydFdpZHRoLCB0aGlzLmNoYXJ0SGVpZ2h0ICksXHJcbiAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHlcclxuICAgICk7XHJcbiAgICB0aGlzLmR5bmFtaWNTZXJpZXNNYXAuc2V0KCBkeW5hbWljU2VyaWVzLCBkeW5hbWljU2VyaWVzTm9kZSApO1xyXG4gICAgdGhpcy5jaGFydFBhbmVsLmFkZENoaWxkKCBkeW5hbWljU2VyaWVzTm9kZSApO1xyXG4gICAgdGhpcy5zY3JvbGxpbmdDaGFydE5vZGVEaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gZHluYW1pY1Nlcmllc05vZGUuZGlzcG9zZSgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIHNlcnZlcmFsIER5bmFtaWNTZXJpZXMgYXQgb25jZSwgZm9yIGNvbnZlbmllbmNlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHluYW1pY1Nlcmllc1tdfSBkeW5hbWljU2VyaWVzQXJyYXlcclxuICAgKi9cclxuICBhZGREeW5hbWljU2VyaWVzQXJyYXkoIGR5bmFtaWNTZXJpZXNBcnJheSApIHtcclxuICAgIGR5bmFtaWNTZXJpZXNBcnJheS5mb3JFYWNoKCB0aGlzLmFkZER5bmFtaWNTZXJpZXMuYmluZCggdGhpcyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYSBEeW5hbWljU2VyaWVzIChhbmQgaXRzIER5bmFtaWNTZXJpZXNOb2RlKV9mcm9tIHRoaXMgY2hhcnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEeW5hbWljU2VyaWVzfSBkeW5hbWljU2VyaWVzXHJcbiAgICovXHJcbiAgcmVtb3ZlRHluYW1pY1NlcmllcyggZHluYW1pY1NlcmllcyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZHluYW1pY1Nlcmllc01hcC5oYXMoIGR5bmFtaWNTZXJpZXMgKSwgJ3RyeWluZyB0byByZW1vdmUgRHluYW1pY1Nlcmllc05vZGUgd2hlbiBvbmUgZG9lcyBub3QgZXhpc3QuJyApO1xyXG4gICAgdGhpcy5jaGFydFBhbmVsLnJlbW92ZUNoaWxkKCB0aGlzLmR5bmFtaWNTZXJpZXNNYXAuZ2V0KCBkeW5hbWljU2VyaWVzICkgKTtcclxuICAgIHRoaXMuZHluYW1pY1Nlcmllc01hcC5kZWxldGUoIGR5bmFtaWNTZXJpZXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBsaW5lIHNwYWNpbmdzIGZvciB0aGUgZ3JpZCBhbmQgbGFiZWxzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWdcclxuICAgKi9cclxuICBzZXRMaW5lU3BhY2luZ3MoIGNvbmZpZyApIHtcclxuXHJcbiAgICBjb25maWcgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8gQHBhcmFtIHtudW1iZXJ8bnVsbH0gLSBhdCBsZWFzdCBvbmUgc3BhY2luZyBpcyByZXF1aXJlZCBhbmQgdmFsdWVzIG11c3RcclxuICAgICAgLy8gY29uZm9ybSB0byByZXF1aXJlbWVudHMgb2YgbGluZSBzcGFjaW5ncyBpbiBHcmlkTm9kZVxyXG4gICAgICBtYWpvclZlcnRpY2FsTGluZVNwYWNpbmc6IG51bGwsXHJcbiAgICAgIG1ham9ySG9yaXpvbnRhbExpbmVTcGFjaW5nOiBudWxsLFxyXG4gICAgICBtaW5vclZlcnRpY2FsTGluZVNwYWNpbmc6IG51bGwsXHJcbiAgICAgIG1pbm9ySG9yaXpvbnRhbExpbmVTcGFjaW5nOiBudWxsXHJcbiAgICB9LCBjb25maWcgKTtcclxuXHJcbiAgICB0aGlzLm1ham9ySG9yaXpvbnRhbExpbmVTcGFjaW5nID0gY29uZmlnLm1ham9ySG9yaXpvbnRhbExpbmVTcGFjaW5nO1xyXG4gICAgdGhpcy5tYWpvclZlcnRpY2FsTGluZVNwYWNpbmcgPSBjb25maWcubWFqb3JWZXJ0aWNhbExpbmVTcGFjaW5nO1xyXG5cclxuICAgIHRoaXMuZ3JpZE5vZGUuc2V0TGluZVNwYWNpbmdzKCBjb25maWcgKTtcclxuICAgIHRoaXMucmVkcmF3TGFiZWxzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWRyYXcgbGFiZWxzIGFsb25nIHRoZSB2ZXJ0aWNhbCBsaW5lcy5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgcmVkcmF3VmVydGljYWxMYWJlbHMoKSB7XHJcbiAgICBpZiAoIHRoaXMuc2hvd1ZlcnRpY2FsR3JpZExhYmVscyApIHtcclxuICAgICAgY29uc3QgdmVydGljYWxMYWJlbENoaWxkcmVuID0gW107XHJcbiAgICAgIGNvbnN0IHlQb3NpdGlvbnMgPSB0aGlzLmdyaWROb2RlLmdldExpbmVQb3NpdGlvbnNJbkdyaWQoIHRoaXMubWFqb3JIb3Jpem9udGFsTGluZVNwYWNpbmcsIEdyaWROb2RlLkxpbmVUeXBlLk1BSk9SX0hPUklaT05UQUwgKTtcclxuICAgICAgeVBvc2l0aW9ucy5mb3JFYWNoKCB5UG9zaXRpb24gPT4ge1xyXG4gICAgICAgIGNvbnN0IHZpZXdZID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS5nZXQoKS5tb2RlbFRvVmlld1koIHlQb3NpdGlvbiApO1xyXG4gICAgICAgIGNvbnN0IGxhYmVsUG9pbnQgPSB0aGlzLmNoYXJ0UGFuZWwubG9jYWxUb1BhcmVudFBvaW50KCBuZXcgVmVjdG9yMiggdGhpcy5ncmlkTm9kZS5ib3VuZHMubGVmdCwgdmlld1kgKSApO1xyXG5cclxuICAgICAgICBjb25zdCBsYWJlbFRleHQgPSBuZXcgVGV4dCggVXRpbHMudG9GaXhlZCggeVBvc2l0aW9uLCB0aGlzLnZlcnRpY2FsR3JpZExhYmVsTnVtYmVyT2ZEZWNpbWFsUGxhY2VzICksIG1lcmdlKCB7XHJcbiAgICAgICAgICByaWdodENlbnRlcjogbGFiZWxQb2ludC5wbHVzWFkoIC0zLCAwIClcclxuICAgICAgICB9LCB0aGlzLmdyaWRMYWJlbE9wdGlvbnMgKSApO1xyXG5cclxuICAgICAgICB2ZXJ0aWNhbExhYmVsQ2hpbGRyZW4ucHVzaCggbGFiZWxUZXh0ICk7XHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy52ZXJ0aWNhbEdyaWRMYWJlbExheWVyLmNoaWxkcmVuID0gdmVydGljYWxMYWJlbENoaWxkcmVuO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVkcmF3IGxhYmVscyBhbG9uZyB0aGUgaG9yaXpvbnRhbCBncmlkIGxpbmVzLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICByZWRyYXdIb3Jpem9udGFsTGFiZWxzKCkge1xyXG4gICAgaWYgKCB0aGlzLnNob3dIb3Jpem9udGFsR3JpZExhYmVscyApIHtcclxuXHJcbiAgICAgIC8vIGRyYXcgbGFiZWxzIGFsb25nIHRoZSBob3Jpem9udGFsIGxpbmVzXHJcbiAgICAgIGNvbnN0IGhvcml6b250YWxMYWJlbENoaWxkcmVuID0gW107XHJcbiAgICAgIGNvbnN0IHhQb3NpdGlvbnMgPSB0aGlzLmdyaWROb2RlLmdldExpbmVQb3NpdGlvbnNJbkdyaWQoIHRoaXMubWFqb3JWZXJ0aWNhbExpbmVTcGFjaW5nLCBHcmlkTm9kZS5MaW5lVHlwZS5NQUpPUl9WRVJUSUNBTCApO1xyXG4gICAgICB4UG9zaXRpb25zLmZvckVhY2goIHhQb3NpdGlvbiA9PiB7XHJcbiAgICAgICAgY29uc3Qgdmlld1ggPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LmdldCgpLm1vZGVsVG9WaWV3WCggeFBvc2l0aW9uICk7XHJcbiAgICAgICAgY29uc3QgbGFiZWxQb2ludCA9IHRoaXMuY2hhcnRQYW5lbC5sb2NhbFRvUGFyZW50UG9pbnQoIG5ldyBWZWN0b3IyKCB2aWV3WCwgdGhpcy5ncmlkTm9kZS5ib3VuZHMuYm90dG9tICkgKTtcclxuXHJcbiAgICAgICAgY29uc3QgbGFiZWxUZXh0ID0gbmV3IFRleHQoIFV0aWxzLnRvRml4ZWQoIHhQb3NpdGlvbiwgdGhpcy5ob3Jpem9udGFsR3JpZExhYmVsTnVtYmVyT2ZEZWNpbWFsUGxhY2VzICksIG1lcmdlKCB7XHJcbiAgICAgICAgICBjZW50ZXJUb3A6IGxhYmVsUG9pbnQucGx1c1hZKCAwLCAzIClcclxuICAgICAgICB9LCB0aGlzLmdyaWRMYWJlbE9wdGlvbnMgKSApO1xyXG5cclxuICAgICAgICBob3Jpem9udGFsTGFiZWxDaGlsZHJlbi5wdXNoKCBsYWJlbFRleHQgKTtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmhvcml6b250YWxHcmlkTGFiZWxMYXllci5jaGlsZHJlbiA9IGhvcml6b250YWxMYWJlbENoaWxkcmVuO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVkcmF3cyBsYWJlbHMgZm9yIHdoZW4gbGluZSBzcGFjaW5nIG9yIHRyYW5zZm9ybSBjaGFuZ2VzLiBMYWJlbHMgYXJlIG9ubHkgZHJhd24gYWxvbmcgdGhlIG1ham9yXHJcbiAgICogZ3JpZCBsaW5lcy5cclxuICAgKlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICByZWRyYXdMYWJlbHMoKSB7XHJcbiAgICB0aGlzLnJlZHJhd1ZlcnRpY2FsTGFiZWxzKCk7XHJcbiAgICB0aGlzLnJlZHJhd0hvcml6b250YWxMYWJlbHMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHBsb3Qgc3R5bGUgZm9yIHRoZSBjaGFydC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHluYW1pY1Nlcmllc05vZGUuUGxvdFN0eWxlfSBwbG90U3R5bGUgLSBvbmUgb2YgcGxvdFN0eWxlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFBsb3RTdHlsZSggcGxvdFN0eWxlICkge1xyXG4gICAgdGhpcy5wbG90U3R5bGUgPSBwbG90U3R5bGU7XHJcblxyXG4gICAgdGhpcy5keW5hbWljU2VyaWVzTWFwLmZvckVhY2goIGR5bmFtaWNTZXJpZXNOb2RlID0+IHtcclxuICAgICAgZHluYW1pY1Nlcmllc05vZGUuc2V0UGxvdFN0eWxlKCBwbG90U3R5bGUgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIHR5cGljYWwgTW9kZWxWaWV3VHJhbnNmb3JtMiBmb3IgdGhlIGNoYXJ0IHRoYXQgc3BhbnMgdGhlIHdpZHRoUmFuZ2UgYW5kIGhlaWdodFJhbmdlIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgICogc28gdGhhdCB0aG9zZSByYW5nZXMgYXJlIGNvbnRhaW5lZCB3aXRoaW4gYW5kIGZpbGwgdGhlIFhZQ2hhcnROb2RlIHZpZXcgYm91bmRzLiBBbHNvIGludmVydHMgeSBzbyB0aGF0XHJcbiAgICogK3kgcG9pbnRzIHVwIG9uIHRoZSBjaGFydC4gT3RoZXIgdHJhbnNmb3JtbXMgbWF5IGJlIHVzZWQsIGJ1dCB0aGlzIGlzIHRoZSBtb3N0IGNvbW1vbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1JhbmdlfSB3aWR0aFJhbmdlIC0gaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0ge1JhbmdlfSBoZWlnaHRSYW5nZSAtIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgICogQHJldHVybnMge01vZGVsVmlld1RyYW5zZm9ybTJ9XHJcbiAgICovXHJcbiAgY3JlYXRlUmVjdGFuZ3VsYXJNb2RlbFZpZXdUcmFuc2Zvcm0oIHdpZHRoUmFuZ2UsIGhlaWdodFJhbmdlICkge1xyXG4gICAgcmV0dXJuIE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlUmVjdGFuZ2xlSW52ZXJ0ZWRZTWFwcGluZyhcclxuICAgICAgbmV3IEJvdW5kczIoIHdpZHRoUmFuZ2UubWluLCBoZWlnaHRSYW5nZS5taW4sIHdpZHRoUmFuZ2UubWF4LCBoZWlnaHRSYW5nZS5tYXggKSxcclxuICAgICAgbmV3IEJvdW5kczIoIDAsIDAsIHRoaXMuY2hhcnRXaWR0aCwgdGhpcy5jaGFydEhlaWdodCApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZXMgcmVzb3VyY2VzIHdoZW4gbm8gbG9uZ2VyIHVzZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VTY3JvbGxpbmdDaGFydE5vZGUoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmdyaWRkbGUucmVnaXN0ZXIoICdYWUNoYXJ0Tm9kZScsIFhZQ2hhcnROb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFhZQ2hhcnROb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sMEJBQTBCO0FBQzlDLE9BQU9DLFFBQVEsTUFBTSwyQkFBMkI7QUFDaEQsT0FBT0MsT0FBTyxNQUFNLHlCQUF5QjtBQUM3QyxPQUFPQyxLQUFLLE1BQU0sdUJBQXVCO0FBQ3pDLE9BQU9DLEtBQUssTUFBTSx1QkFBdUI7QUFDekMsT0FBT0MsT0FBTyxNQUFNLHlCQUF5QjtBQUM3QyxTQUFTQyxLQUFLLFFBQVEsMEJBQTBCO0FBQ2hELE9BQU9DLGtCQUFrQixNQUFNLDBDQUEwQztBQUN6RSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9D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