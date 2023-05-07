// Copyright 2016-2023, University of Colorado Boulder

/**
 * XY graph for the 'Equations' screen.
 *
 * The graph has a fixed scale for the x & y axis; zoom in/out is not supported.
 * By default (and after many design discussions) the axes have different scales.
 * This was deemed preferable to the usability and implementation issues introduced by adding zoom support.
 *
 * Since changing the graph is relatively inexpensive, this node updates even when it's not visible.
 * Updating only while visible doesn't have significant performance gains, and is not worth the additional
 * code complexity.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import merge from '../../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../../scenery-phet/js/ArrowNode.js';
import MathSymbolFont from '../../../../../scenery-phet/js/MathSymbolFont.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Circle, Line, Node, Path, Rectangle, Text } from '../../../../../scenery/js/imports.js';
import functionBuilder from '../../../functionBuilder.js';
import FBConstants from '../../FBConstants.js';
import FBSymbols from '../../FBSymbols.js';
import RationalNumber from '../../model/RationalNumber.js';

// constants
const AXIS_OPTIONS = {
  doubleHead: true,
  headWidth: 8,
  headHeight: 8,
  tailWidth: 1,
  fill: 'black',
  stroke: null
};
export default class XYGraphNode extends Node {
  /**
   * @param {Builder} builder
   * @param {Object} [options]
   */
  constructor(builder, options) {
    options = merge({
      size: FBConstants.GRAPH_DRAWER_SIZE,
      // {Dimension2} dimensions of the graph, in view coordinates
      cornerRadius: 0,
      background: 'white',
      // {Color|string} background color of the graph
      xRange: FBConstants.GRAPH_X_RANGE,
      // {Range} of the x axis, in model coordinates
      yRange: FBConstants.GRAPH_Y_RANGE,
      // {Range} of the y axis, in model coordinates

      // grid
      xGridSpacing: 1,
      // {number} spacing of vertical grid lines, in model coordinates
      yGridSpacing: 10,
      // {number} spacing of horizontal grid lines, in model coordinates
      gridStroke: 'rgb( 200, 200, 200 )',
      // {Color|string} color of the grid
      gridLineWidth: 0.5,
      // {number} lineWidth of the grid

      // axis labels
      axisLabelFont: new MathSymbolFont(16),
      axisLabelColor: 'rgb( 100, 100, 100 )',
      // ticks
      xTickSpacing: 5,
      // {number} spacing of x-axis tick marks, in model coordinates
      yTickSpacing: 50,
      // {number} spacing of y-axis tick marks, in model coordinates
      tickLength: 5,
      // {number} length of tick lines, in view coordinates
      tickFont: new PhetFont(12),
      // {Font} font for tick labels
      tickLabelSpace: 2,
      // {number} space between tick label and line, in view coordinates
      tickStroke: 'black',
      // {Color|string}
      tickLineWidth: 1,
      // {number}

      // points
      pointFill: 'magenta',
      // {Color|string} point color
      pointRadius: 3,
      // {number} point radius, in view coordinates

      // plotted line
      lineStroke: 'magenta',
      // {Color|string} color of the plotted line
      lineWidth: 1 // {number} lineWidth of the plotted line
    }, options);

    // model-view transform
    const xOffset = (1 - options.xRange.max / options.xRange.getLength()) * options.size.width;
    const yOffset = (1 - options.yRange.max / options.yRange.getLength()) * options.size.height;
    const xScale = options.size.width / options.xRange.getLength();
    const yScale = -options.size.height / options.yRange.getLength(); // inverted
    const modelViewTransform = ModelViewTransform2.createOffsetXYScaleMapping(new Vector2(xOffset, yOffset), xScale, yScale);

    // Perform transforms of common points once
    const viewOrigin = modelViewTransform.modelToViewXY(0, 0);
    const viewMinX = modelViewTransform.modelToViewX(options.xRange.min);
    const viewMaxX = modelViewTransform.modelToViewX(options.xRange.max);
    const viewMinY = modelViewTransform.modelToViewY(options.yRange.min);
    const viewMaxY = modelViewTransform.modelToViewY(options.yRange.max);
    const backgroundNode = new Rectangle(viewMinX, viewMaxY, modelViewTransform.modelToViewDeltaX(options.xRange.getLength()), -modelViewTransform.modelToViewDeltaY(options.yRange.getLength()), {
      cornerRadius: options.cornerRadius,
      fill: options.background
    });

    // grid, drawn using one Shape
    const gridShape = new Shape();

    // vertical lines
    const xMinGridLine = options.xRange.min - options.xRange.min % options.xGridSpacing;
    for (let modelGridX = xMinGridLine; modelGridX <= options.xRange.max;) {
      const viewGridX = modelViewTransform.modelToViewX(modelGridX);
      gridShape.moveTo(viewGridX, viewMinY);
      gridShape.lineTo(viewGridX, viewMaxY);
      modelGridX += options.xGridSpacing;
    }

    // horizontal lines
    const yMinGridLine = options.yRange.min - options.yRange.min % options.yGridSpacing;
    for (let modelGridY = yMinGridLine; modelGridY <= options.yRange.max;) {
      const viewGridY = modelViewTransform.modelToViewY(modelGridY);
      gridShape.moveTo(viewMinX, viewGridY);
      gridShape.lineTo(viewMaxX, viewGridY);
      modelGridY += options.yGridSpacing;
    }
    const gridNode = new Path(gridShape, {
      stroke: options.gridStroke,
      lineWidth: options.gridLineWidth
    });

    // x axis
    const xAxisNode = new ArrowNode(viewMinX, viewOrigin.y, viewMaxX, viewOrigin.y, AXIS_OPTIONS);
    const xAxisLabelNode = new Text(FBSymbols.X, {
      maxWidth: 0.3 * options.size.width,
      font: options.axisLabelFont,
      fill: options.axisLabelColor,
      right: xAxisNode.right - 4,
      bottom: xAxisNode.top - 2
    });

    // y axis
    const yAxisNode = new ArrowNode(viewOrigin.x, viewMinY, viewOrigin.x, viewMaxY, AXIS_OPTIONS);
    const yAxisLabelNode = new Text(FBSymbols.Y, {
      maxWidth: 0.3 * options.size.width,
      font: options.axisLabelFont,
      fill: options.axisLabelColor,
      left: yAxisNode.right + 2,
      top: yAxisNode.top + 1
    });

    // tick lines & labels
    const tickLinesShape = new Shape(); // tick lines are drawn using one Shape
    const tickLabelsParent = new Node();

    // x tick marks
    let xMinTick = options.xRange.min - options.xRange.min % options.xTickSpacing;
    if (xMinTick === options.xRange.min) {
      xMinTick = xMinTick + options.xTickSpacing;
    }
    for (let modelTickX = xMinTick; modelTickX < options.xRange.max;) {
      if (modelTickX !== 0) {
        const viewTickX = modelViewTransform.modelToViewX(modelTickX);

        // line
        tickLinesShape.moveTo(viewTickX, viewOrigin.y);
        tickLinesShape.lineTo(viewTickX, viewOrigin.y + options.tickLength);

        // label
        const xTickLabelNode = new Text(modelTickX, {
          font: options.tickFont,
          centerX: viewTickX,
          top: viewOrigin.y + options.tickLength + options.tickLabelSpace
        });
        tickLabelsParent.addChild(xTickLabelNode);
      }
      modelTickX += options.xTickSpacing;
    }

    // y tick marks
    let yMinTick = options.yRange.min - options.yRange.min % options.yTickSpacing;
    if (yMinTick === options.yRange.min) {
      yMinTick = yMinTick + options.yTickSpacing;
    }
    for (let modelTickY = yMinTick; modelTickY < options.yRange.max;) {
      if (modelTickY !== 0) {
        const viewTickY = modelViewTransform.modelToViewY(modelTickY);

        // line
        tickLinesShape.moveTo(viewOrigin.x, viewTickY);
        tickLinesShape.lineTo(viewOrigin.x - options.tickLength, viewTickY);

        // label
        const yTickLabelNode = new Text(modelTickY, {
          font: options.tickFont,
          right: viewOrigin.x - options.tickLength - options.tickLabelSpace,
          centerY: viewTickY
        });
        tickLabelsParent.addChild(yTickLabelNode);
      }
      modelTickY += options.yTickSpacing;
    }
    const tickLinesNode = new Path(tickLinesShape, {
      stroke: options.tickStroke,
      lineWidth: options.tickLineWidth
    });

    // @private parent for all points
    const pointsParent = new Node();

    // @private line that corresponds to the function in the builder
    const lineNode = new Line(0, 0, 1, 0, {
      stroke: options.lineStroke,
      lineWidth: options.lineWidth,
      visible: false
    });
    assert && assert(!options.children, 'decoration not supported');
    options.children = [backgroundNode, gridNode, tickLinesNode, tickLabelsParent, xAxisNode, xAxisLabelNode, yAxisNode, yAxisLabelNode, lineNode, pointsParent];
    super(options);

    // @private property definitions
    this.builder = builder;
    this.xRange = options.xRange;
    this.yRange = options.yRange;
    this.pointFill = options.pointFill;
    this.pointRadius = options.pointRadius;
    this.xCoordinates = []; // {RationalNumber[]} x coordinates (inputs) that are plotted
    this.modelViewTransform = modelViewTransform;
    this.pointsParent = pointsParent;
    this.lineNode = lineNode;

    // Update the graph when the builder functions change.
    // removeListener unnecessary, instances exist for lifetime of the sim
    builder.functionChangedEmitter.addListener(this.update.bind(this));
    this.update();
  }

  // @private updates plotted elements
  update() {
    this.updatePoints();
    if (this.lineNode.visible) {
      this.updateLine();
    }
  }

  // @private updates points
  updatePoints() {
    const xCoordinates = this.xCoordinates.slice(0); // copy
    this.xCoordinates = [];
    this.pointsParent.removeAllChildren();
    for (let i = 0; i < xCoordinates.length; i++) {
      this.addPointAt(xCoordinates[i]);
    }
  }

  // @private updates the line
  updateLine() {
    const yLeft = this.builder.applyAllFunctions(RationalNumber.withInteger(this.xRange.min));
    const yRight = this.builder.applyAllFunctions(RationalNumber.withInteger(this.xRange.max));
    this.lineNode.setLine(this.modelViewTransform.modelToViewX(this.xRange.min), this.modelViewTransform.modelToViewY(yLeft), this.modelViewTransform.modelToViewX(this.xRange.max), this.modelViewTransform.modelToViewY(yRight));
  }

  /**
   * Adds a point to the graph.
   *
   * @param {RationalNumber} x
   * @public
   */
  addPointAt(x) {
    assert && assert(x instanceof RationalNumber);
    assert && assert(this.xCoordinates.indexOf(x) === -1, `x is already plotted: ${x}`);

    // add x to list
    this.xCoordinates.push(x);

    // {RationalNumber} compute y based on what is in the builder
    const y = this.builder.applyAllFunctions(x).valueOf();

    // verify that the point is in range
    const point = new Vector2(x.valueOf(), y.valueOf());
    assert && assert(this.xRange.contains(point.x) && this.yRange.contains(point.y), `graphed point out of range: ${point.toString()}`);

    // create the PointNode
    this.pointsParent.addChild(new PointNode(point, this.modelViewTransform, {
      radius: this.pointRadius,
      fill: this.pointFill
    }));
  }

  /**
   * Removes a point from the graph.
   *
   * @param {RationalNumber} x
   * @public
   */
  removePointAt(x) {
    assert && assert(x instanceof RationalNumber);
    assert && assert(this.xCoordinates.indexOf(x) !== -1, `x is not plotted: ${x}`);

    // remove x from list
    this.xCoordinates.splice(this.xCoordinates.indexOf(x), 1);

    // remove associated PointNode
    let removed = false;
    for (let i = 0; i < this.pointsParent.getChildrenCount() && !removed; i++) {
      const pointNode = this.pointsParent.getChildAt(i);
      assert && assert(pointNode instanceof PointNode);
      if (pointNode.point.x.valueOf() === x.valueOf()) {
        this.pointsParent.removeChild(pointNode);
        removed = true;
      }
    }
    assert && assert(removed, `x not found: ${x.valueOf()}`);
  }

  /**
   * Shows the line that corresponds to the function in the builder.
   *
   * @param {boolean} visible
   * @public
   */
  setLineVisible(visible) {
    // update the line when it becomes visible
    if (visible && this.lineNode.visible !== visible) {
      this.updateLine();
    }
    this.lineNode.visible = visible;
  }
}
class PointNode extends Circle {
  /**
   * @param {Vector2} point
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   * @private
   */
  constructor(point, modelViewTransform, options) {
    options = merge({
      radius: 1,
      fill: 'white',
      stroke: 'black',
      lineWidth: 0.25
    }, options);
    super(options.radius, options);

    // @public
    this.point = point;
    this.center = modelViewTransform.modelToViewPosition(point);
  }
}
functionBuilder.register('XYGraphNode', XYGraphNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2hhcGUiLCJtZXJnZSIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJBcnJvd05vZGUiLCJNYXRoU3ltYm9sRm9udCIsIlBoZXRGb250IiwiQ2lyY2xlIiwiTGluZSIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiVGV4dCIsImZ1bmN0aW9uQnVpbGRlciIsIkZCQ29uc3RhbnRzIiwiRkJTeW1ib2xzIiwiUmF0aW9uYWxOdW1iZXIiLCJBWElTX09QVElPTlMiLCJkb3VibGVIZWFkIiwiaGVhZFdpZHRoIiwiaGVhZEhlaWdodCIsInRhaWxXaWR0aCIsImZpbGwiLCJzdHJva2UiLCJYWUdyYXBoTm9kZSIsImNvbnN0cnVjdG9yIiwiYnVpbGRlciIsIm9wdGlvbnMiLCJzaXplIiwiR1JBUEhfRFJBV0VSX1NJWkUiLCJjb3JuZXJSYWRpdXMiLCJiYWNrZ3JvdW5kIiwieFJhbmdlIiwiR1JBUEhfWF9SQU5HRSIsInlSYW5nZSIsIkdSQVBIX1lfUkFOR0UiLCJ4R3JpZFNwYWNpbmciLCJ5R3JpZFNwYWNpbmciLCJncmlkU3Ryb2tlIiwiZ3JpZExpbmVXaWR0aCIsImF4aXNMYWJlbEZvbnQiLCJheGlzTGFiZWxDb2xvciIsInhUaWNrU3BhY2luZyIsInlUaWNrU3BhY2luZyIsInRpY2tMZW5ndGgiLCJ0aWNrRm9udCIsInRpY2tMYWJlbFNwYWNlIiwidGlja1N0cm9rZSIsInRpY2tMaW5lV2lkdGgiLCJwb2ludEZpbGwiLCJwb2ludFJhZGl1cyIsImxpbmVTdHJva2UiLCJsaW5lV2lkdGgiLCJ4T2Zmc2V0IiwibWF4IiwiZ2V0TGVuZ3RoIiwid2lkdGgiLCJ5T2Zmc2V0IiwiaGVpZ2h0IiwieFNjYWxlIiwieVNjYWxlIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY3JlYXRlT2Zmc2V0WFlTY2FsZU1hcHBpbmciLCJ2aWV3T3JpZ2luIiwibW9kZWxUb1ZpZXdYWSIsInZpZXdNaW5YIiwibW9kZWxUb1ZpZXdYIiwibWluIiwidmlld01heFgiLCJ2aWV3TWluWSIsIm1vZGVsVG9WaWV3WSIsInZpZXdNYXhZIiwiYmFja2dyb3VuZE5vZGUiLCJtb2RlbFRvVmlld0RlbHRhWCIsIm1vZGVsVG9WaWV3RGVsdGFZIiwiZ3JpZFNoYXBlIiwieE1pbkdyaWRMaW5lIiwibW9kZWxHcmlkWCIsInZpZXdHcmlkWCIsIm1vdmVUbyIsImxpbmVUbyIsInlNaW5HcmlkTGluZSIsIm1vZGVsR3JpZFkiLCJ2aWV3R3JpZFkiLCJncmlkTm9kZSIsInhBeGlzTm9kZSIsInkiLCJ4QXhpc0xhYmVsTm9kZSIsIlgiLCJtYXhXaWR0aCIsImZvbnQiLCJyaWdodCIsImJvdHRvbSIsInRvcCIsInlBeGlzTm9kZSIsIngiLCJ5QXhpc0xhYmVsTm9kZSIsIlkiLCJsZWZ0IiwidGlja0xpbmVzU2hhcGUiLCJ0aWNrTGFiZWxzUGFyZW50IiwieE1pblRpY2siLCJtb2RlbFRpY2tYIiwidmlld1RpY2tYIiwieFRpY2tMYWJlbE5vZGUiLCJjZW50ZXJYIiwiYWRkQ2hpbGQiLCJ5TWluVGljayIsIm1vZGVsVGlja1kiLCJ2aWV3VGlja1kiLCJ5VGlja0xhYmVsTm9kZSIsImNlbnRlclkiLCJ0aWNrTGluZXNOb2RlIiwicG9pbnRzUGFyZW50IiwibGluZU5vZGUiLCJ2aXNpYmxlIiwiYXNzZXJ0IiwiY2hpbGRyZW4iLCJ4Q29vcmRpbmF0ZXMiLCJmdW5jdGlvbkNoYW5nZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJ1cGRhdGUiLCJiaW5kIiwidXBkYXRlUG9pbnRzIiwidXBkYXRlTGluZSIsInNsaWNlIiwicmVtb3ZlQWxsQ2hpbGRyZW4iLCJpIiwibGVuZ3RoIiwiYWRkUG9pbnRBdCIsInlMZWZ0IiwiYXBwbHlBbGxGdW5jdGlvbnMiLCJ3aXRoSW50ZWdlciIsInlSaWdodCIsInNldExpbmUiLCJpbmRleE9mIiwicHVzaCIsInZhbHVlT2YiLCJwb2ludCIsImNvbnRhaW5zIiwidG9TdHJpbmciLCJQb2ludE5vZGUiLCJyYWRpdXMiLCJyZW1vdmVQb2ludEF0Iiwic3BsaWNlIiwicmVtb3ZlZCIsImdldENoaWxkcmVuQ291bnQiLCJwb2ludE5vZGUiLCJnZXRDaGlsZEF0IiwicmVtb3ZlQ2hpbGQiLCJzZXRMaW5lVmlzaWJsZSIsImNlbnRlciIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlhZR3JhcGhOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFhZIGdyYXBoIGZvciB0aGUgJ0VxdWF0aW9ucycgc2NyZWVuLlxyXG4gKlxyXG4gKiBUaGUgZ3JhcGggaGFzIGEgZml4ZWQgc2NhbGUgZm9yIHRoZSB4ICYgeSBheGlzOyB6b29tIGluL291dCBpcyBub3Qgc3VwcG9ydGVkLlxyXG4gKiBCeSBkZWZhdWx0IChhbmQgYWZ0ZXIgbWFueSBkZXNpZ24gZGlzY3Vzc2lvbnMpIHRoZSBheGVzIGhhdmUgZGlmZmVyZW50IHNjYWxlcy5cclxuICogVGhpcyB3YXMgZGVlbWVkIHByZWZlcmFibGUgdG8gdGhlIHVzYWJpbGl0eSBhbmQgaW1wbGVtZW50YXRpb24gaXNzdWVzIGludHJvZHVjZWQgYnkgYWRkaW5nIHpvb20gc3VwcG9ydC5cclxuICpcclxuICogU2luY2UgY2hhbmdpbmcgdGhlIGdyYXBoIGlzIHJlbGF0aXZlbHkgaW5leHBlbnNpdmUsIHRoaXMgbm9kZSB1cGRhdGVzIGV2ZW4gd2hlbiBpdCdzIG5vdCB2aXNpYmxlLlxyXG4gKiBVcGRhdGluZyBvbmx5IHdoaWxlIHZpc2libGUgZG9lc24ndCBoYXZlIHNpZ25pZmljYW50IHBlcmZvcm1hbmNlIGdhaW5zLCBhbmQgaXMgbm90IHdvcnRoIHRoZSBhZGRpdGlvbmFsXHJcbiAqIGNvZGUgY29tcGxleGl0eS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xGb250IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9sRm9udC5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIExpbmUsIE5vZGUsIFBhdGgsIFJlY3RhbmdsZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBmdW5jdGlvbkJ1aWxkZXIgZnJvbSAnLi4vLi4vLi4vZnVuY3Rpb25CdWlsZGVyLmpzJztcclxuaW1wb3J0IEZCQ29uc3RhbnRzIGZyb20gJy4uLy4uL0ZCQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEZCU3ltYm9scyBmcm9tICcuLi8uLi9GQlN5bWJvbHMuanMnO1xyXG5pbXBvcnQgUmF0aW9uYWxOdW1iZXIgZnJvbSAnLi4vLi4vbW9kZWwvUmF0aW9uYWxOdW1iZXIuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEFYSVNfT1BUSU9OUyA9IHtcclxuICBkb3VibGVIZWFkOiB0cnVlLFxyXG4gIGhlYWRXaWR0aDogOCxcclxuICBoZWFkSGVpZ2h0OiA4LFxyXG4gIHRhaWxXaWR0aDogMSxcclxuICBmaWxsOiAnYmxhY2snLFxyXG4gIHN0cm9rZTogbnVsbFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWFlHcmFwaE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCdWlsZGVyfSBidWlsZGVyXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBidWlsZGVyLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgc2l6ZTogRkJDb25zdGFudHMuR1JBUEhfRFJBV0VSX1NJWkUsIC8vIHtEaW1lbnNpb24yfSBkaW1lbnNpb25zIG9mIHRoZSBncmFwaCwgaW4gdmlldyBjb29yZGluYXRlc1xyXG4gICAgICBjb3JuZXJSYWRpdXM6IDAsXHJcbiAgICAgIGJhY2tncm91bmQ6ICd3aGl0ZScsIC8vIHtDb2xvcnxzdHJpbmd9IGJhY2tncm91bmQgY29sb3Igb2YgdGhlIGdyYXBoXHJcbiAgICAgIHhSYW5nZTogRkJDb25zdGFudHMuR1JBUEhfWF9SQU5HRSwgLy8ge1JhbmdlfSBvZiB0aGUgeCBheGlzLCBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAgICB5UmFuZ2U6IEZCQ29uc3RhbnRzLkdSQVBIX1lfUkFOR0UsIC8vIHtSYW5nZX0gb2YgdGhlIHkgYXhpcywgaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuXHJcbiAgICAgIC8vIGdyaWRcclxuICAgICAgeEdyaWRTcGFjaW5nOiAxLCAvLyB7bnVtYmVyfSBzcGFjaW5nIG9mIHZlcnRpY2FsIGdyaWQgbGluZXMsIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgICAgIHlHcmlkU3BhY2luZzogMTAsIC8vIHtudW1iZXJ9IHNwYWNpbmcgb2YgaG9yaXpvbnRhbCBncmlkIGxpbmVzLCBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAgICBncmlkU3Ryb2tlOiAncmdiKCAyMDAsIDIwMCwgMjAwICknLCAvLyB7Q29sb3J8c3RyaW5nfSBjb2xvciBvZiB0aGUgZ3JpZFxyXG4gICAgICBncmlkTGluZVdpZHRoOiAwLjUsIC8vIHtudW1iZXJ9IGxpbmVXaWR0aCBvZiB0aGUgZ3JpZFxyXG5cclxuICAgICAgLy8gYXhpcyBsYWJlbHNcclxuICAgICAgYXhpc0xhYmVsRm9udDogbmV3IE1hdGhTeW1ib2xGb250KCAxNiApLFxyXG4gICAgICBheGlzTGFiZWxDb2xvcjogJ3JnYiggMTAwLCAxMDAsIDEwMCApJyxcclxuXHJcbiAgICAgIC8vIHRpY2tzXHJcbiAgICAgIHhUaWNrU3BhY2luZzogNSwgLy8ge251bWJlcn0gc3BhY2luZyBvZiB4LWF4aXMgdGljayBtYXJrcywgaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgICAgeVRpY2tTcGFjaW5nOiA1MCwgLy8ge251bWJlcn0gc3BhY2luZyBvZiB5LWF4aXMgdGljayBtYXJrcywgaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgICAgdGlja0xlbmd0aDogNSwgLy8ge251bWJlcn0gbGVuZ3RoIG9mIHRpY2sgbGluZXMsIGluIHZpZXcgY29vcmRpbmF0ZXNcclxuICAgICAgdGlja0ZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSwgLy8ge0ZvbnR9IGZvbnQgZm9yIHRpY2sgbGFiZWxzXHJcbiAgICAgIHRpY2tMYWJlbFNwYWNlOiAyLCAvLyB7bnVtYmVyfSBzcGFjZSBiZXR3ZWVuIHRpY2sgbGFiZWwgYW5kIGxpbmUsIGluIHZpZXcgY29vcmRpbmF0ZXNcclxuICAgICAgdGlja1N0cm9rZTogJ2JsYWNrJywgLy8ge0NvbG9yfHN0cmluZ31cclxuICAgICAgdGlja0xpbmVXaWR0aDogMSwgLy8ge251bWJlcn1cclxuXHJcbiAgICAgIC8vIHBvaW50c1xyXG4gICAgICBwb2ludEZpbGw6ICdtYWdlbnRhJywgLy8ge0NvbG9yfHN0cmluZ30gcG9pbnQgY29sb3JcclxuICAgICAgcG9pbnRSYWRpdXM6IDMsIC8vIHtudW1iZXJ9IHBvaW50IHJhZGl1cywgaW4gdmlldyBjb29yZGluYXRlc1xyXG5cclxuICAgICAgLy8gcGxvdHRlZCBsaW5lXHJcbiAgICAgIGxpbmVTdHJva2U6ICdtYWdlbnRhJywgLy8ge0NvbG9yfHN0cmluZ30gY29sb3Igb2YgdGhlIHBsb3R0ZWQgbGluZVxyXG4gICAgICBsaW5lV2lkdGg6IDEgLy8ge251bWJlcn0gbGluZVdpZHRoIG9mIHRoZSBwbG90dGVkIGxpbmVcclxuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gbW9kZWwtdmlldyB0cmFuc2Zvcm1cclxuICAgIGNvbnN0IHhPZmZzZXQgPSAoIDEgLSBvcHRpb25zLnhSYW5nZS5tYXggLyBvcHRpb25zLnhSYW5nZS5nZXRMZW5ndGgoKSApICogb3B0aW9ucy5zaXplLndpZHRoO1xyXG4gICAgY29uc3QgeU9mZnNldCA9ICggMSAtIG9wdGlvbnMueVJhbmdlLm1heCAvIG9wdGlvbnMueVJhbmdlLmdldExlbmd0aCgpICkgKiBvcHRpb25zLnNpemUuaGVpZ2h0O1xyXG4gICAgY29uc3QgeFNjYWxlID0gb3B0aW9ucy5zaXplLndpZHRoIC8gb3B0aW9ucy54UmFuZ2UuZ2V0TGVuZ3RoKCk7XHJcbiAgICBjb25zdCB5U2NhbGUgPSAtb3B0aW9ucy5zaXplLmhlaWdodCAvIG9wdGlvbnMueVJhbmdlLmdldExlbmd0aCgpOyAvLyBpbnZlcnRlZFxyXG4gICAgY29uc3QgbW9kZWxWaWV3VHJhbnNmb3JtID0gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVPZmZzZXRYWVNjYWxlTWFwcGluZyggbmV3IFZlY3RvcjIoIHhPZmZzZXQsIHlPZmZzZXQgKSwgeFNjYWxlLCB5U2NhbGUgKTtcclxuXHJcbiAgICAvLyBQZXJmb3JtIHRyYW5zZm9ybXMgb2YgY29tbW9uIHBvaW50cyBvbmNlXHJcbiAgICBjb25zdCB2aWV3T3JpZ2luID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WFkoIDAsIDAgKTtcclxuICAgIGNvbnN0IHZpZXdNaW5YID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggb3B0aW9ucy54UmFuZ2UubWluICk7XHJcbiAgICBjb25zdCB2aWV3TWF4WCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIG9wdGlvbnMueFJhbmdlLm1heCApO1xyXG4gICAgY29uc3Qgdmlld01pblkgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBvcHRpb25zLnlSYW5nZS5taW4gKTtcclxuICAgIGNvbnN0IHZpZXdNYXhZID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggb3B0aW9ucy55UmFuZ2UubWF4ICk7XHJcblxyXG4gICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCB2aWV3TWluWCwgdmlld01heFksXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWCggb3B0aW9ucy54UmFuZ2UuZ2V0TGVuZ3RoKCkgKSxcclxuICAgICAgLW1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWSggb3B0aW9ucy55UmFuZ2UuZ2V0TGVuZ3RoKCkgKSwge1xyXG4gICAgICAgIGNvcm5lclJhZGl1czogb3B0aW9ucy5jb3JuZXJSYWRpdXMsXHJcbiAgICAgICAgZmlsbDogb3B0aW9ucy5iYWNrZ3JvdW5kXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBncmlkLCBkcmF3biB1c2luZyBvbmUgU2hhcGVcclxuICAgIGNvbnN0IGdyaWRTaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICAgIC8vIHZlcnRpY2FsIGxpbmVzXHJcbiAgICBjb25zdCB4TWluR3JpZExpbmUgPSBvcHRpb25zLnhSYW5nZS5taW4gLSAoIG9wdGlvbnMueFJhbmdlLm1pbiAlIG9wdGlvbnMueEdyaWRTcGFjaW5nICk7XHJcbiAgICBmb3IgKCBsZXQgbW9kZWxHcmlkWCA9IHhNaW5HcmlkTGluZTsgbW9kZWxHcmlkWCA8PSBvcHRpb25zLnhSYW5nZS5tYXg7ICkge1xyXG4gICAgICBjb25zdCB2aWV3R3JpZFggPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBtb2RlbEdyaWRYICk7XHJcbiAgICAgIGdyaWRTaGFwZS5tb3ZlVG8oIHZpZXdHcmlkWCwgdmlld01pblkgKTtcclxuICAgICAgZ3JpZFNoYXBlLmxpbmVUbyggdmlld0dyaWRYLCB2aWV3TWF4WSApO1xyXG4gICAgICBtb2RlbEdyaWRYICs9IG9wdGlvbnMueEdyaWRTcGFjaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGhvcml6b250YWwgbGluZXNcclxuICAgIGNvbnN0IHlNaW5HcmlkTGluZSA9IG9wdGlvbnMueVJhbmdlLm1pbiAtICggb3B0aW9ucy55UmFuZ2UubWluICUgb3B0aW9ucy55R3JpZFNwYWNpbmcgKTtcclxuICAgIGZvciAoIGxldCBtb2RlbEdyaWRZID0geU1pbkdyaWRMaW5lOyBtb2RlbEdyaWRZIDw9IG9wdGlvbnMueVJhbmdlLm1heDsgKSB7XHJcbiAgICAgIGNvbnN0IHZpZXdHcmlkWSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIG1vZGVsR3JpZFkgKTtcclxuICAgICAgZ3JpZFNoYXBlLm1vdmVUbyggdmlld01pblgsIHZpZXdHcmlkWSApO1xyXG4gICAgICBncmlkU2hhcGUubGluZVRvKCB2aWV3TWF4WCwgdmlld0dyaWRZICk7XHJcbiAgICAgIG1vZGVsR3JpZFkgKz0gb3B0aW9ucy55R3JpZFNwYWNpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZ3JpZE5vZGUgPSBuZXcgUGF0aCggZ3JpZFNoYXBlLCB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5ncmlkU3Ryb2tlLFxyXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMuZ3JpZExpbmVXaWR0aFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHggYXhpc1xyXG4gICAgY29uc3QgeEF4aXNOb2RlID0gbmV3IEFycm93Tm9kZSggdmlld01pblgsIHZpZXdPcmlnaW4ueSwgdmlld01heFgsIHZpZXdPcmlnaW4ueSwgQVhJU19PUFRJT05TICk7XHJcblxyXG4gICAgY29uc3QgeEF4aXNMYWJlbE5vZGUgPSBuZXcgVGV4dCggRkJTeW1ib2xzLlgsIHtcclxuICAgICAgbWF4V2lkdGg6IDAuMyAqIG9wdGlvbnMuc2l6ZS53aWR0aCxcclxuICAgICAgZm9udDogb3B0aW9ucy5heGlzTGFiZWxGb250LFxyXG4gICAgICBmaWxsOiBvcHRpb25zLmF4aXNMYWJlbENvbG9yLFxyXG4gICAgICByaWdodDogeEF4aXNOb2RlLnJpZ2h0IC0gNCxcclxuICAgICAgYm90dG9tOiB4QXhpc05vZGUudG9wIC0gMlxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHkgYXhpc1xyXG4gICAgY29uc3QgeUF4aXNOb2RlID0gbmV3IEFycm93Tm9kZSggdmlld09yaWdpbi54LCB2aWV3TWluWSwgdmlld09yaWdpbi54LCB2aWV3TWF4WSwgQVhJU19PUFRJT05TICk7XHJcblxyXG4gICAgY29uc3QgeUF4aXNMYWJlbE5vZGUgPSBuZXcgVGV4dCggRkJTeW1ib2xzLlksIHtcclxuICAgICAgbWF4V2lkdGg6IDAuMyAqIG9wdGlvbnMuc2l6ZS53aWR0aCxcclxuICAgICAgZm9udDogb3B0aW9ucy5heGlzTGFiZWxGb250LFxyXG4gICAgICBmaWxsOiBvcHRpb25zLmF4aXNMYWJlbENvbG9yLFxyXG4gICAgICBsZWZ0OiB5QXhpc05vZGUucmlnaHQgKyAyLFxyXG4gICAgICB0b3A6IHlBeGlzTm9kZS50b3AgKyAxXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdGljayBsaW5lcyAmIGxhYmVsc1xyXG4gICAgY29uc3QgdGlja0xpbmVzU2hhcGUgPSBuZXcgU2hhcGUoKTsgLy8gdGljayBsaW5lcyBhcmUgZHJhd24gdXNpbmcgb25lIFNoYXBlXHJcbiAgICBjb25zdCB0aWNrTGFiZWxzUGFyZW50ID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAvLyB4IHRpY2sgbWFya3NcclxuICAgIGxldCB4TWluVGljayA9IG9wdGlvbnMueFJhbmdlLm1pbiAtICggb3B0aW9ucy54UmFuZ2UubWluICUgb3B0aW9ucy54VGlja1NwYWNpbmcgKTtcclxuICAgIGlmICggeE1pblRpY2sgPT09IG9wdGlvbnMueFJhbmdlLm1pbiApIHtcclxuICAgICAgeE1pblRpY2sgPSB4TWluVGljayArIG9wdGlvbnMueFRpY2tTcGFjaW5nO1xyXG4gICAgfVxyXG4gICAgZm9yICggbGV0IG1vZGVsVGlja1ggPSB4TWluVGljazsgbW9kZWxUaWNrWCA8IG9wdGlvbnMueFJhbmdlLm1heDsgKSB7XHJcblxyXG4gICAgICBpZiAoIG1vZGVsVGlja1ggIT09IDAgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdUaWNrWCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIG1vZGVsVGlja1ggKTtcclxuXHJcbiAgICAgICAgLy8gbGluZVxyXG4gICAgICAgIHRpY2tMaW5lc1NoYXBlLm1vdmVUbyggdmlld1RpY2tYLCB2aWV3T3JpZ2luLnkgKTtcclxuICAgICAgICB0aWNrTGluZXNTaGFwZS5saW5lVG8oIHZpZXdUaWNrWCwgdmlld09yaWdpbi55ICsgb3B0aW9ucy50aWNrTGVuZ3RoICk7XHJcblxyXG4gICAgICAgIC8vIGxhYmVsXHJcbiAgICAgICAgY29uc3QgeFRpY2tMYWJlbE5vZGUgPSBuZXcgVGV4dCggbW9kZWxUaWNrWCwge1xyXG4gICAgICAgICAgZm9udDogb3B0aW9ucy50aWNrRm9udCxcclxuICAgICAgICAgIGNlbnRlclg6IHZpZXdUaWNrWCxcclxuICAgICAgICAgIHRvcDogdmlld09yaWdpbi55ICsgb3B0aW9ucy50aWNrTGVuZ3RoICsgb3B0aW9ucy50aWNrTGFiZWxTcGFjZVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICB0aWNrTGFiZWxzUGFyZW50LmFkZENoaWxkKCB4VGlja0xhYmVsTm9kZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBtb2RlbFRpY2tYICs9IG9wdGlvbnMueFRpY2tTcGFjaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHkgdGljayBtYXJrc1xyXG4gICAgbGV0IHlNaW5UaWNrID0gb3B0aW9ucy55UmFuZ2UubWluIC0gKCBvcHRpb25zLnlSYW5nZS5taW4gJSBvcHRpb25zLnlUaWNrU3BhY2luZyApO1xyXG4gICAgaWYgKCB5TWluVGljayA9PT0gb3B0aW9ucy55UmFuZ2UubWluICkge1xyXG4gICAgICB5TWluVGljayA9IHlNaW5UaWNrICsgb3B0aW9ucy55VGlja1NwYWNpbmc7XHJcbiAgICB9XHJcbiAgICBmb3IgKCBsZXQgbW9kZWxUaWNrWSA9IHlNaW5UaWNrOyBtb2RlbFRpY2tZIDwgb3B0aW9ucy55UmFuZ2UubWF4OyApIHtcclxuXHJcbiAgICAgIGlmICggbW9kZWxUaWNrWSAhPT0gMCApIHtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld1RpY2tZID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggbW9kZWxUaWNrWSApO1xyXG5cclxuICAgICAgICAvLyBsaW5lXHJcbiAgICAgICAgdGlja0xpbmVzU2hhcGUubW92ZVRvKCB2aWV3T3JpZ2luLngsIHZpZXdUaWNrWSApO1xyXG4gICAgICAgIHRpY2tMaW5lc1NoYXBlLmxpbmVUbyggdmlld09yaWdpbi54IC0gb3B0aW9ucy50aWNrTGVuZ3RoLCB2aWV3VGlja1kgKTtcclxuXHJcbiAgICAgICAgLy8gbGFiZWxcclxuICAgICAgICBjb25zdCB5VGlja0xhYmVsTm9kZSA9IG5ldyBUZXh0KCBtb2RlbFRpY2tZLCB7XHJcbiAgICAgICAgICBmb250OiBvcHRpb25zLnRpY2tGb250LFxyXG4gICAgICAgICAgcmlnaHQ6IHZpZXdPcmlnaW4ueCAtIG9wdGlvbnMudGlja0xlbmd0aCAtIG9wdGlvbnMudGlja0xhYmVsU3BhY2UsXHJcbiAgICAgICAgICBjZW50ZXJZOiB2aWV3VGlja1lcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgdGlja0xhYmVsc1BhcmVudC5hZGRDaGlsZCggeVRpY2tMYWJlbE5vZGUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbW9kZWxUaWNrWSArPSBvcHRpb25zLnlUaWNrU3BhY2luZztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0aWNrTGluZXNOb2RlID0gbmV3IFBhdGgoIHRpY2tMaW5lc1NoYXBlLCB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy50aWNrU3Ryb2tlLFxyXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMudGlja0xpbmVXaWR0aFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHBhcmVudCBmb3IgYWxsIHBvaW50c1xyXG4gICAgY29uc3QgcG9pbnRzUGFyZW50ID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSBsaW5lIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIGZ1bmN0aW9uIGluIHRoZSBidWlsZGVyXHJcbiAgICBjb25zdCBsaW5lTm9kZSA9IG5ldyBMaW5lKCAwLCAwLCAxLCAwLCB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5saW5lU3Ryb2tlLFxyXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMubGluZVdpZHRoLFxyXG4gICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmNoaWxkcmVuLCAnZGVjb3JhdGlvbiBub3Qgc3VwcG9ydGVkJyApO1xyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgYmFja2dyb3VuZE5vZGUsIGdyaWROb2RlLCB0aWNrTGluZXNOb2RlLCB0aWNrTGFiZWxzUGFyZW50LFxyXG4gICAgICB4QXhpc05vZGUsIHhBeGlzTGFiZWxOb2RlLCB5QXhpc05vZGUsIHlBeGlzTGFiZWxOb2RlLCBsaW5lTm9kZSwgcG9pbnRzUGFyZW50IF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSBwcm9wZXJ0eSBkZWZpbml0aW9uc1xyXG4gICAgdGhpcy5idWlsZGVyID0gYnVpbGRlcjtcclxuICAgIHRoaXMueFJhbmdlID0gb3B0aW9ucy54UmFuZ2U7XHJcbiAgICB0aGlzLnlSYW5nZSA9IG9wdGlvbnMueVJhbmdlO1xyXG4gICAgdGhpcy5wb2ludEZpbGwgPSBvcHRpb25zLnBvaW50RmlsbDtcclxuICAgIHRoaXMucG9pbnRSYWRpdXMgPSBvcHRpb25zLnBvaW50UmFkaXVzO1xyXG4gICAgdGhpcy54Q29vcmRpbmF0ZXMgPSBbXTsgLy8ge1JhdGlvbmFsTnVtYmVyW119IHggY29vcmRpbmF0ZXMgKGlucHV0cykgdGhhdCBhcmUgcGxvdHRlZFxyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBtb2RlbFZpZXdUcmFuc2Zvcm07XHJcbiAgICB0aGlzLnBvaW50c1BhcmVudCA9IHBvaW50c1BhcmVudDtcclxuICAgIHRoaXMubGluZU5vZGUgPSBsaW5lTm9kZTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIGdyYXBoIHdoZW4gdGhlIGJ1aWxkZXIgZnVuY3Rpb25zIGNoYW5nZS5cclxuICAgIC8vIHJlbW92ZUxpc3RlbmVyIHVubmVjZXNzYXJ5LCBpbnN0YW5jZXMgZXhpc3QgZm9yIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgIGJ1aWxkZXIuZnVuY3Rpb25DaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy51cGRhdGUuYmluZCggdGhpcyApICk7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGUgdXBkYXRlcyBwbG90dGVkIGVsZW1lbnRzXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgdGhpcy51cGRhdGVQb2ludHMoKTtcclxuICAgIGlmICggdGhpcy5saW5lTm9kZS52aXNpYmxlICkge1xyXG4gICAgICB0aGlzLnVwZGF0ZUxpbmUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlIHVwZGF0ZXMgcG9pbnRzXHJcbiAgdXBkYXRlUG9pbnRzKCkge1xyXG4gICAgY29uc3QgeENvb3JkaW5hdGVzID0gdGhpcy54Q29vcmRpbmF0ZXMuc2xpY2UoIDAgKTsgLy8gY29weVxyXG4gICAgdGhpcy54Q29vcmRpbmF0ZXMgPSBbXTtcclxuICAgIHRoaXMucG9pbnRzUGFyZW50LnJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB4Q29vcmRpbmF0ZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuYWRkUG9pbnRBdCggeENvb3JkaW5hdGVzWyBpIF0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlIHVwZGF0ZXMgdGhlIGxpbmVcclxuICB1cGRhdGVMaW5lKCkge1xyXG4gICAgY29uc3QgeUxlZnQgPSB0aGlzLmJ1aWxkZXIuYXBwbHlBbGxGdW5jdGlvbnMoIFJhdGlvbmFsTnVtYmVyLndpdGhJbnRlZ2VyKCB0aGlzLnhSYW5nZS5taW4gKSApO1xyXG4gICAgY29uc3QgeVJpZ2h0ID0gdGhpcy5idWlsZGVyLmFwcGx5QWxsRnVuY3Rpb25zKCBSYXRpb25hbE51bWJlci53aXRoSW50ZWdlciggdGhpcy54UmFuZ2UubWF4ICkgKTtcclxuICAgIHRoaXMubGluZU5vZGUuc2V0TGluZShcclxuICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCB0aGlzLnhSYW5nZS5taW4gKSxcclxuICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCB5TGVmdCApLFxyXG4gICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHRoaXMueFJhbmdlLm1heCApLFxyXG4gICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIHlSaWdodCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgcG9pbnQgdG8gdGhlIGdyYXBoLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtSYXRpb25hbE51bWJlcn0geFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGRQb2ludEF0KCB4ICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHggaW5zdGFuY2VvZiBSYXRpb25hbE51bWJlciApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy54Q29vcmRpbmF0ZXMuaW5kZXhPZiggeCApID09PSAtMSwgYHggaXMgYWxyZWFkeSBwbG90dGVkOiAke3h9YCApO1xyXG5cclxuICAgIC8vIGFkZCB4IHRvIGxpc3RcclxuICAgIHRoaXMueENvb3JkaW5hdGVzLnB1c2goIHggKTtcclxuXHJcbiAgICAvLyB7UmF0aW9uYWxOdW1iZXJ9IGNvbXB1dGUgeSBiYXNlZCBvbiB3aGF0IGlzIGluIHRoZSBidWlsZGVyXHJcbiAgICBjb25zdCB5ID0gdGhpcy5idWlsZGVyLmFwcGx5QWxsRnVuY3Rpb25zKCB4ICkudmFsdWVPZigpO1xyXG5cclxuICAgIC8vIHZlcmlmeSB0aGF0IHRoZSBwb2ludCBpcyBpbiByYW5nZVxyXG4gICAgY29uc3QgcG9pbnQgPSBuZXcgVmVjdG9yMiggeC52YWx1ZU9mKCksIHkudmFsdWVPZigpICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnhSYW5nZS5jb250YWlucyggcG9pbnQueCApICYmIHRoaXMueVJhbmdlLmNvbnRhaW5zKCBwb2ludC55ICksXHJcbiAgICAgIGBncmFwaGVkIHBvaW50IG91dCBvZiByYW5nZTogJHtwb2ludC50b1N0cmluZygpfWAgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIFBvaW50Tm9kZVxyXG4gICAgdGhpcy5wb2ludHNQYXJlbnQuYWRkQ2hpbGQoIG5ldyBQb2ludE5vZGUoIHBvaW50LCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICByYWRpdXM6IHRoaXMucG9pbnRSYWRpdXMsXHJcbiAgICAgIGZpbGw6IHRoaXMucG9pbnRGaWxsXHJcbiAgICB9ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBwb2ludCBmcm9tIHRoZSBncmFwaC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UmF0aW9uYWxOdW1iZXJ9IHhcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVtb3ZlUG9pbnRBdCggeCApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB4IGluc3RhbmNlb2YgUmF0aW9uYWxOdW1iZXIgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMueENvb3JkaW5hdGVzLmluZGV4T2YoIHggKSAhPT0gLTEsIGB4IGlzIG5vdCBwbG90dGVkOiAke3h9YCApO1xyXG5cclxuICAgIC8vIHJlbW92ZSB4IGZyb20gbGlzdFxyXG4gICAgdGhpcy54Q29vcmRpbmF0ZXMuc3BsaWNlKCB0aGlzLnhDb29yZGluYXRlcy5pbmRleE9mKCB4ICksIDEgKTtcclxuXHJcbiAgICAvLyByZW1vdmUgYXNzb2NpYXRlZCBQb2ludE5vZGVcclxuICAgIGxldCByZW1vdmVkID0gZmFsc2U7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnBvaW50c1BhcmVudC5nZXRDaGlsZHJlbkNvdW50KCkgJiYgIXJlbW92ZWQ7IGkrKyApIHtcclxuXHJcbiAgICAgIGNvbnN0IHBvaW50Tm9kZSA9IHRoaXMucG9pbnRzUGFyZW50LmdldENoaWxkQXQoIGkgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcG9pbnROb2RlIGluc3RhbmNlb2YgUG9pbnROb2RlICk7XHJcblxyXG4gICAgICBpZiAoIHBvaW50Tm9kZS5wb2ludC54LnZhbHVlT2YoKSA9PT0geC52YWx1ZU9mKCkgKSB7XHJcbiAgICAgICAgdGhpcy5wb2ludHNQYXJlbnQucmVtb3ZlQ2hpbGQoIHBvaW50Tm9kZSApO1xyXG4gICAgICAgIHJlbW92ZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZW1vdmVkLCBgeCBub3QgZm91bmQ6ICR7eC52YWx1ZU9mKCl9YCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hvd3MgdGhlIGxpbmUgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgZnVuY3Rpb24gaW4gdGhlIGJ1aWxkZXIuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZpc2libGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0TGluZVZpc2libGUoIHZpc2libGUgKSB7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBsaW5lIHdoZW4gaXQgYmVjb21lcyB2aXNpYmxlXHJcbiAgICBpZiAoIHZpc2libGUgJiYgKCB0aGlzLmxpbmVOb2RlLnZpc2libGUgIT09IHZpc2libGUgKSApIHtcclxuICAgICAgdGhpcy51cGRhdGVMaW5lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5saW5lTm9kZS52aXNpYmxlID0gdmlzaWJsZTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFBvaW50Tm9kZSBleHRlbmRzIENpcmNsZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9pbnRcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwb2ludCwgbW9kZWxWaWV3VHJhbnNmb3JtLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICByYWRpdXM6IDEsXHJcbiAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZVdpZHRoOiAwLjI1XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMucmFkaXVzLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5wb2ludCA9IHBvaW50O1xyXG5cclxuICAgIHRoaXMuY2VudGVyID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBvaW50ICk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbkJ1aWxkZXIucmVnaXN0ZXIoICdYWUdyYXBoTm9kZScsIFhZR3JhcGhOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELFNBQVNDLEtBQUssUUFBUSxtQ0FBbUM7QUFDekQsT0FBT0MsS0FBSyxNQUFNLHNDQUFzQztBQUN4RCxPQUFPQyxtQkFBbUIsTUFBTSwwREFBMEQ7QUFDMUYsT0FBT0MsU0FBUyxNQUFNLDZDQUE2QztBQUNuRSxPQUFPQyxjQUFjLE1BQU0sa0RBQWtEO0FBQzdFLE9BQU9DLFFBQVEsTUFBTSw0Q0FBNEM7QUFDakUsU0FBU0MsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSxzQ0FBc0M7QUFDaEcsT0FBT0MsZUFBZSxNQUFNLDZCQUE2QjtBQUN6RCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLFNBQVMsTUFBTSxvQkFBb0I7QUFDMUMsT0FBT0MsY0FBYyxNQUFNLCtCQUErQjs7QUFFMUQ7QUFDQSxNQUFNQyxZQUFZLEdBQUc7RUFDbkJDLFVBQVUsRUFBRSxJQUFJO0VBQ2hCQyxTQUFTLEVBQUUsQ0FBQztFQUNaQyxVQUFVLEVBQUUsQ0FBQztFQUNiQyxTQUFTLEVBQUUsQ0FBQztFQUNaQyxJQUFJLEVBQUUsT0FBTztFQUNiQyxNQUFNLEVBQUU7QUFDVixDQUFDO0FBRUQsZUFBZSxNQUFNQyxXQUFXLFNBQVNmLElBQUksQ0FBQztFQUU1QztBQUNGO0FBQ0E7QUFDQTtFQUNFZ0IsV0FBV0EsQ0FBRUMsT0FBTyxFQUFFQyxPQUFPLEVBQUc7SUFFOUJBLE9BQU8sR0FBR3pCLEtBQUssQ0FBRTtNQUVmMEIsSUFBSSxF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