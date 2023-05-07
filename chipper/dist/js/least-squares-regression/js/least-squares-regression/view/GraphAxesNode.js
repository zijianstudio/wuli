// Copyright 2014-2022, University of Colorado Boulder

/**
 * Base type for graphs, displays a 2D grid and axes.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Martin Veillette (Berea College)
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { Line, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';

//----------------------------------------------------------------------------------------
// constants
//----------------------------------------------------------------------------------------

// background
const GRID_BACKGROUND_FILL = 'white';
const GRID_BACKGROUND_LINE_WIDTH = 1; // for the border of graph
const GRID_BACKGROUND_STROKE = 'gray';

// grid
const MAJOR_GRID_LINE_WIDTH = 1;
const MAJOR_GRID_LINE_COLOR = LeastSquaresRegressionConstants.MAJOR_GRID_STROKE_COLOR;
const MINOR_GRID_LINE_WIDTH = 1;
const MINOR_GRID_LINE_COLOR = LeastSquaresRegressionConstants.MINOR_GRID_STROKE_COLOR;

// axes
const AXIS_COLOR = 'black';
const AXIS_EXTENT = 0.0; // how far the line extends past the min/max ticks, in model coordinates

// labels
const AXIS_LABEL_FONT = LeastSquaresRegressionConstants.TEXT_BOLD_FONT;
const AXIS_LABEL_COLOR = 'black'; // space between end of axis and label
const MAX_LABEL_WIDTH = 500; // i18n restriction, empirically determined

// ticks
const MINOR_TICK_LENGTH = 3; // how far a minor tick extends from the axis
const MINOR_TICK_LINE_WIDTH = 1;
const MINOR_TICK_COLOR = 'black';
const MAJOR_TICK_LENGTH = 6; // how far a major tick extends from the axis
const MAJOR_TICK_LINE_WIDTH = 1;
const MAJOR_TICK_COLOR = 'black';
const MAJOR_TICK_FONT = LeastSquaresRegressionConstants.MAJOR_TICK_FONT;
const TICK_LABEL_SPACING = 2;
const MINUS_SIGN_WIDTH = new Text(MathSymbols.MINUS, {
  font: MAJOR_TICK_FONT
}).width;
const SMALL_EPSILON = 0.0000001; // for equalEpsilon check

class GraphAxesNode extends Node {
  /**
   * Function responsible for laying out the ticks of the graph, the axis titles and the grid
   * @param {DataSet} dataSet
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} showGridProperty
   */
  constructor(dataSet, modelViewTransform, showGridProperty) {
    const gridNode = new GridNode(dataSet, modelViewTransform);
    const showGridPropertyObserver = visible => {
      gridNode.visible = visible;
    };
    showGridProperty.link(showGridPropertyObserver);
    super({
      children: [new BackgroundNode(dataSet, modelViewTransform), gridNode, new XAxisNode(dataSet, modelViewTransform), new YAxisNode(dataSet, modelViewTransform), new XLabelNode(dataSet, modelViewTransform), new YLabelNode(dataSet, modelViewTransform)]
    });
    this.disposeGraphAxesNode = () => {
      showGridProperty.unlink(showGridPropertyObserver);
    };
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    this.disposeGraphAxesNode();
    super.dispose();
  }
}
leastSquaresRegression.register('GraphAxesNode', GraphAxesNode);

//----------------------------------------------------------------------------------------
// major tick with label, orientation is vertical or horizontal
//----------------------------------------------------------------------------------------

class MajorTickNode extends Node {
  // Tick is placed at (x,y) and is either vertical or horizontal.
  constructor(x, y, value, isVertical) {
    super();

    // tick line
    const tickLineNode = new Path(isVertical ? Shape.lineSegment(x, y - MAJOR_TICK_LENGTH, x, y + MAJOR_TICK_LENGTH) : Shape.lineSegment(x - MAJOR_TICK_LENGTH, y, x + MAJOR_TICK_LENGTH, y), {
      stroke: MAJOR_TICK_COLOR,
      lineWidth: MAJOR_TICK_LINE_WIDTH
    });
    this.addChild(tickLineNode);

    // tick label
    const tickLabelNode = new Text(value, {
      font: MAJOR_TICK_FONT,
      fill: MAJOR_TICK_COLOR
    });
    this.addChild(tickLabelNode);

    // label position
    if (isVertical) {
      // center label under line, compensate for minus sign
      const signXOffset = value < 0 ? -(MINUS_SIGN_WIDTH / 2) : 0;
      tickLabelNode.left = tickLineNode.centerX - tickLabelNode.width / 2 + signXOffset;
      tickLabelNode.top = tickLineNode.bottom + TICK_LABEL_SPACING;
    } else {
      // center label to left of line
      tickLabelNode.right = tickLineNode.left - TICK_LABEL_SPACING;
      tickLabelNode.centerY = tickLineNode.centerY;
    }
  }
}

//----------------------------------------------------------------------------------------
// minor tick mark, no label, orientation is vertical or horizontal
//----------------------------------------------------------------------------------------

class MinorTickNode extends Path {
  // Tick is placed at (x,y) and is either vertical or horizontal
  constructor(x, y, isVertical) {
    super(isVertical ? Shape.lineSegment(x, y - MINOR_TICK_LENGTH, x, y + MINOR_TICK_LENGTH) : Shape.lineSegment(x - MINOR_TICK_LENGTH, y, x + MINOR_TICK_LENGTH, y), {
      lineWidth: MINOR_TICK_LINE_WIDTH,
      stroke: MINOR_TICK_COLOR
    });
  }
}

//--------------
// Tick Spacing for major and minor ticks
//--------------

/**
 *
 * @param {Range} range
 * @constructor
 */
function tickSpacing(range) {
  const width = range.max - range.min;
  const logOfWidth = Math.log(width) / Math.LN10; // polyfill for Math.log10(width)
  const exponent = Math.floor(logOfWidth); // width = mantissa*10^exponent
  const mantissa = Math.pow(10, logOfWidth - exponent); // mantissa  ranges from 1 to 10;

  let majorBaseMultiple;
  let minorTicksPerMajor;

  // on a graph there should be minimum of 4 major ticks and a maximum of 8.
  // the numbers for the mantissa were chosen empirically
  if (mantissa >= 6.5) {
    majorBaseMultiple = 2;
    minorTicksPerMajor = 4;
  } else if (mantissa >= 3.2) {
    majorBaseMultiple = 1;
    minorTicksPerMajor = 5;
  } else if (mantissa >= 1.55) {
    majorBaseMultiple = 0.5;
    minorTicksPerMajor = 5;
  } else {
    majorBaseMultiple = 0.2;
    minorTicksPerMajor = 4;
  }
  const majorTickSpacing = majorBaseMultiple * Math.pow(10, exponent); // separation between two major ticks
  const minorTickSpacing = majorBaseMultiple * Math.pow(10, exponent) / minorTicksPerMajor; // separation between two minor ticks
  const tickStartPosition = Math.ceil(range.min / minorTickSpacing) * minorTickSpacing; // {number} position of the first tick
  const tickStopPosition = Math.floor(range.max / minorTickSpacing) * minorTickSpacing; // {number} position of the last tick
  const numberOfTicks = (tickStopPosition - tickStartPosition) / minorTickSpacing + 1; // number of ticks
  const decimalPlaces = majorTickSpacing > 1 ? 0 : -1 * Math.log(majorTickSpacing) / Math.LN10 + 1; // the precision of ticks (for text purposes)

  const tickSeparation = {
    majorTickSpacing: majorTickSpacing,
    minorTickSpacing: minorTickSpacing,
    minorTicksPerMajor: minorTicksPerMajor,
    tickStartPosition: tickStartPosition,
    tickStopPosition: tickStopPosition,
    numberOfTicks: numberOfTicks,
    decimalPlaces: decimalPlaces
  };
  return tickSeparation;
}

//----------------------------------------------------------------------------------------
// x-axis (horizontal)
//----------------------------------------------------------------------------------------

class XAxisNode extends Node {
  /**
   * @param {DataSet} dataSet
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(dataSet, modelViewTransform) {
    super();

    // horizontal line
    const tailPosition = new Vector2(modelViewTransform.modelToViewX(dataSet.xRange.min - AXIS_EXTENT), modelViewTransform.modelToViewY(dataSet.yRange.min));
    const tipPosition = new Vector2(modelViewTransform.modelToViewX(dataSet.xRange.max + AXIS_EXTENT), modelViewTransform.modelToViewY(dataSet.yRange.min));
    const lineNode = new Line(tailPosition.x, tailPosition.y, tipPosition.x, tipPosition.y, {
      fill: AXIS_COLOR,
      stroke: 'black'
    });
    this.addChild(lineNode);

    // ticks
    const tickSeparation = tickSpacing(dataSet.xRange);
    const numberOfTicks = tickSeparation.numberOfTicks;
    for (let i = 0; i < numberOfTicks; i++) {
      const modelX = tickSeparation.tickStartPosition + tickSeparation.minorTickSpacing * i;
      const x = modelViewTransform.modelToViewX(modelX);
      const y = modelViewTransform.modelToViewY(dataSet.yRange.min);
      if (Math.abs(modelX / tickSeparation.minorTickSpacing) % tickSeparation.minorTicksPerMajor < SMALL_EPSILON) {
        // major tick
        this.addChild(new MajorTickNode(x, y, Utils.toFixed(modelX, tickSeparation.decimalPlaces), true));
      } else {
        // minor tick
        this.addChild(new MinorTickNode(x, y, true));
      }
    }
  }
}

//----------------------------------------------------------------------------------------
//   y-axis (vertical)
//----------------------------------------------------------------------------------------

class YAxisNode extends Node {
  /***
   * @param {DataSet} dataSet
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(dataSet, modelViewTransform) {
    super();

    // vertical line
    const tailPosition = new Vector2(modelViewTransform.modelToViewX(dataSet.xRange.min), modelViewTransform.modelToViewY(dataSet.yRange.min - AXIS_EXTENT));
    const tipPosition = new Vector2(modelViewTransform.modelToViewX(dataSet.xRange.min), modelViewTransform.modelToViewY(dataSet.yRange.max + AXIS_EXTENT));
    const lineNode = new Line(tailPosition.x, tailPosition.y, tipPosition.x, tipPosition.y, {
      fill: AXIS_COLOR,
      stroke: 'black'
    });
    this.addChild(lineNode);

    // ticks
    const tickSeparation = tickSpacing(dataSet.yRange);
    const numberOfTicks = tickSeparation.numberOfTicks;
    for (let i = 0; i < numberOfTicks; i++) {
      const modelY = tickSeparation.tickStartPosition + tickSeparation.minorTickSpacing * i;
      const x = modelViewTransform.modelToViewX(dataSet.xRange.min);
      const y = modelViewTransform.modelToViewY(modelY);
      if (Math.abs(modelY / tickSeparation.minorTickSpacing) % tickSeparation.minorTicksPerMajor < SMALL_EPSILON) {
        // major tick
        this.addChild(new MajorTickNode(x, y, Utils.toFixed(modelY, tickSeparation.decimalPlaces), false));
      } else {
        // minor tick
        this.addChild(new MinorTickNode(x, y, false));
      }
    }
  }
}

//----------------------------------------------------------------------------------------
//  X label
//----------------------------------------------------------------------------------------

class XLabelNode extends Node {
  /**
   * @param {DataSet} dataSet
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(dataSet, modelViewTransform, options) {
    super(options);
    const centerX = modelViewTransform.modelToViewX((dataSet.xRange.min + dataSet.xRange.max) / 2);
    const bottom = modelViewTransform.modelToViewY(dataSet.yRange.min);
    const xLabelNode = new Text(dataSet.xAxisTitle, {
      font: AXIS_LABEL_FONT,
      fill: AXIS_LABEL_COLOR,
      centerX: centerX,
      bottom: bottom + 50,
      maxWidth: MAX_LABEL_WIDTH
    });
    this.addChild(xLabelNode);
  }
}

//----------------------------------------------------------------------------------------
//  Y label
//----------------------------------------------------------------------------------------

class YLabelNode extends Node {
  /**
   * @param {DataSet} dataSet
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(dataSet, modelViewTransform) {
    super();
    const centerY = modelViewTransform.modelToViewY((dataSet.yRange.min + dataSet.yRange.max) / 2);
    const left = modelViewTransform.modelToViewX(dataSet.xRange.min);
    const yLabelNode = new Text(dataSet.yAxisTitle, {
      font: AXIS_LABEL_FONT,
      fill: AXIS_LABEL_COLOR,
      centerY: centerY,
      left: left - 50,
      maxWidth: MAX_LABEL_WIDTH,
      rotation: -Math.PI / 2
    });
    this.addChild(yLabelNode);
  }
}

//----------------------------------------------------------------------------------------
//  2D Background
//----------------------------------------------------------------------------------------

class BackgroundNode extends Node {
  /**
   * @param {DataSet} dataSet
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(dataSet, modelViewTransform) {
    super();
    const backgroundNode = new Rectangle(modelViewTransform.modelToViewX(dataSet.xRange.min), modelViewTransform.modelToViewY(dataSet.yRange.max), modelViewTransform.modelToViewDeltaX(dataSet.xRange.getLength()), modelViewTransform.modelToViewDeltaY(-dataSet.yRange.getLength()), {
      fill: GRID_BACKGROUND_FILL,
      lineWidth: GRID_BACKGROUND_LINE_WIDTH,
      stroke: GRID_BACKGROUND_STROKE
    });
    this.addChild(backgroundNode);
  }
}

//----------------------------------------------------------------------------------------
//   2D grid
//----------------------------------------------------------------------------------------

class GridNode extends Node {
  /**
   * @param {DataSet} dataSet
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(dataSet, modelViewTransform) {
    super();

    // horizontal grid lines, one line for each unit of grid spacing
    const horizontalGridLinesNode = new Node();
    this.addChild(horizontalGridLinesNode);
    const tickYSeparation = tickSpacing(dataSet.yRange);
    const numberOfHorizontalGridLines = tickYSeparation.numberOfTicks;
    const majorGridLinesShape = new Shape();
    const minorGridLinesShape = new Shape();
    const minX = dataSet.xRange.min;
    const maxX = dataSet.xRange.max;
    for (let i = 0; i < numberOfHorizontalGridLines; i++) {
      const modelY = tickYSeparation.tickStartPosition + tickYSeparation.minorTickSpacing * i;
      if (modelY !== dataSet.yRange.min) {
        // skip origin, x axis will live here
        const yOffset = modelY;
        const isMajorX = Math.abs(modelY / tickYSeparation.minorTickSpacing) % tickYSeparation.minorTicksPerMajor < SMALL_EPSILON;
        if (isMajorX) {
          majorGridLinesShape.moveTo(minX, yOffset).horizontalLineTo(maxX);
        } else {
          minorGridLinesShape.moveTo(minX, yOffset).horizontalLineTo(maxX);
        }
      }
    }

    // vertical grid lines, one line for each unit of grid spacing
    const verticalGridLinesNode = new Node();
    this.addChild(verticalGridLinesNode);
    const tickXSeparation = tickSpacing(dataSet.xRange);
    const numberOfVerticalGridLines = tickXSeparation.numberOfTicks;
    const minY = dataSet.yRange.max; // yes, swap min and max
    const maxY = dataSet.yRange.min;
    for (let j = 0; j < numberOfVerticalGridLines; j++) {
      const modelX = tickXSeparation.tickStartPosition + tickXSeparation.minorTickSpacing * j;
      if (modelX !== dataSet.xRange.min) {
        // skip origin, y axis will live here
        const xOffset = modelX;
        const isMajorY = Math.abs(modelX / tickXSeparation.minorTickSpacing) % tickXSeparation.minorTicksPerMajor < SMALL_EPSILON;
        if (isMajorY) {
          majorGridLinesShape.moveTo(xOffset, minY).verticalLineTo(maxY);
        } else {
          minorGridLinesShape.moveTo(xOffset, minY).verticalLineTo(maxY);
        }
      }
    }
    const majorGridLinesPath = new Path(modelViewTransform.modelToViewShape(majorGridLinesShape), {
      lineWidth: MAJOR_GRID_LINE_WIDTH,
      stroke: MAJOR_GRID_LINE_COLOR
    });
    const minorGridLinesPath = new Path(modelViewTransform.modelToViewShape(minorGridLinesShape), {
      lineWidth: MINOR_GRID_LINE_WIDTH,
      stroke: MINOR_GRID_LINE_COLOR
    });
    this.addChild(majorGridLinesPath);
    this.addChild(minorGridLinesPath);
  }
}

//----------------------------------------------------------------------------------------

export default GraphAxesNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsIk1hdGhTeW1ib2xzIiwiTGluZSIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiVGV4dCIsImxlYXN0U3F1YXJlc1JlZ3Jlc3Npb24iLCJMZWFzdFNxdWFyZXNSZWdyZXNzaW9uQ29uc3RhbnRzIiwiR1JJRF9CQUNLR1JPVU5EX0ZJTEwiLCJHUklEX0JBQ0tHUk9VTkRfTElORV9XSURUSCIsIkdSSURfQkFDS0dST1VORF9TVFJPS0UiLCJNQUpPUl9HUklEX0xJTkVfV0lEVEgiLCJNQUpPUl9HUklEX0xJTkVfQ09MT1IiLCJNQUpPUl9HUklEX1NUUk9LRV9DT0xPUiIsIk1JTk9SX0dSSURfTElORV9XSURUSCIsIk1JTk9SX0dSSURfTElORV9DT0xPUiIsIk1JTk9SX0dSSURfU1RST0tFX0NPTE9SIiwiQVhJU19DT0xPUiIsIkFYSVNfRVhURU5UIiwiQVhJU19MQUJFTF9GT05UIiwiVEVYVF9CT0xEX0ZPTlQiLCJBWElTX0xBQkVMX0NPTE9SIiwiTUFYX0xBQkVMX1dJRFRIIiwiTUlOT1JfVElDS19MRU5HVEgiLCJNSU5PUl9USUNLX0xJTkVfV0lEVEgiLCJNSU5PUl9USUNLX0NPTE9SIiwiTUFKT1JfVElDS19MRU5HVEgiLCJNQUpPUl9USUNLX0xJTkVfV0lEVEgiLCJNQUpPUl9USUNLX0NPTE9SIiwiTUFKT1JfVElDS19GT05UIiwiVElDS19MQUJFTF9TUEFDSU5HIiwiTUlOVVNfU0lHTl9XSURUSCIsIk1JTlVTIiwiZm9udCIsIndpZHRoIiwiU01BTExfRVBTSUxPTiIsIkdyYXBoQXhlc05vZGUiLCJjb25zdHJ1Y3RvciIsImRhdGFTZXQiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJzaG93R3JpZFByb3BlcnR5IiwiZ3JpZE5vZGUiLCJHcmlkTm9kZSIsInNob3dHcmlkUHJvcGVydHlPYnNlcnZlciIsInZpc2libGUiLCJsaW5rIiwiY2hpbGRyZW4iLCJCYWNrZ3JvdW5kTm9kZSIsIlhBeGlzTm9kZSIsIllBeGlzTm9kZSIsIlhMYWJlbE5vZGUiLCJZTGFiZWxOb2RlIiwiZGlzcG9zZUdyYXBoQXhlc05vZGUiLCJ1bmxpbmsiLCJkaXNwb3NlIiwicmVnaXN0ZXIiLCJNYWpvclRpY2tOb2RlIiwieCIsInkiLCJ2YWx1ZSIsImlzVmVydGljYWwiLCJ0aWNrTGluZU5vZGUiLCJsaW5lU2VnbWVudCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImFkZENoaWxkIiwidGlja0xhYmVsTm9kZSIsImZpbGwiLCJzaWduWE9mZnNldCIsImxlZnQiLCJjZW50ZXJYIiwidG9wIiwiYm90dG9tIiwicmlnaHQiLCJjZW50ZXJZIiwiTWlub3JUaWNrTm9kZSIsInRpY2tTcGFjaW5nIiwicmFuZ2UiLCJtYXgiLCJtaW4iLCJsb2dPZldpZHRoIiwiTWF0aCIsImxvZyIsIkxOMTAiLCJleHBvbmVudCIsImZsb29yIiwibWFudGlzc2EiLCJwb3ciLCJtYWpvckJhc2VNdWx0aXBsZSIsIm1pbm9yVGlja3NQZXJNYWpvciIsIm1ham9yVGlja1NwYWNpbmciLCJtaW5vclRpY2tTcGFjaW5nIiwidGlja1N0YXJ0UG9zaXRpb24iLCJjZWlsIiwidGlja1N0b3BQb3NpdGlvbiIsIm51bWJlck9mVGlja3MiLCJkZWNpbWFsUGxhY2VzIiwidGlja1NlcGFyYXRpb24iLCJ0YWlsUG9zaXRpb24iLCJtb2RlbFRvVmlld1giLCJ4UmFuZ2UiLCJtb2RlbFRvVmlld1kiLCJ5UmFuZ2UiLCJ0aXBQb3NpdGlvbiIsImxpbmVOb2RlIiwiaSIsIm1vZGVsWCIsImFicyIsInRvRml4ZWQiLCJtb2RlbFkiLCJvcHRpb25zIiwieExhYmVsTm9kZSIsInhBeGlzVGl0bGUiLCJtYXhXaWR0aCIsInlMYWJlbE5vZGUiLCJ5QXhpc1RpdGxlIiwicm90YXRpb24iLCJQSSIsImJhY2tncm91bmROb2RlIiwibW9kZWxUb1ZpZXdEZWx0YVgiLCJnZXRMZW5ndGgiLCJtb2RlbFRvVmlld0RlbHRhWSIsImhvcml6b250YWxHcmlkTGluZXNOb2RlIiwidGlja1lTZXBhcmF0aW9uIiwibnVtYmVyT2ZIb3Jpem9udGFsR3JpZExpbmVzIiwibWFqb3JHcmlkTGluZXNTaGFwZSIsIm1pbm9yR3JpZExpbmVzU2hhcGUiLCJtaW5YIiwibWF4WCIsInlPZmZzZXQiLCJpc01ham9yWCIsIm1vdmVUbyIsImhvcml6b250YWxMaW5lVG8iLCJ2ZXJ0aWNhbEdyaWRMaW5lc05vZGUiLCJ0aWNrWFNlcGFyYXRpb24iLCJudW1iZXJPZlZlcnRpY2FsR3JpZExpbmVzIiwibWluWSIsIm1heFkiLCJqIiwieE9mZnNldCIsImlzTWFqb3JZIiwidmVydGljYWxMaW5lVG8iLCJtYWpvckdyaWRMaW5lc1BhdGgiLCJtb2RlbFRvVmlld1NoYXBlIiwibWlub3JHcmlkTGluZXNQYXRoIl0sInNvdXJjZXMiOlsiR3JhcGhBeGVzTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNlIHR5cGUgZm9yIGdyYXBocywgZGlzcGxheXMgYSAyRCBncmlkIGFuZCBheGVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGUgKEJlcmVhIENvbGxlZ2UpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IHsgTGluZSwgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGxlYXN0U3F1YXJlc1JlZ3Jlc3Npb24gZnJvbSAnLi4vLi4vbGVhc3RTcXVhcmVzUmVncmVzc2lvbi5qcyc7XHJcbmltcG9ydCBMZWFzdFNxdWFyZXNSZWdyZXNzaW9uQ29uc3RhbnRzIGZyb20gJy4uL0xlYXN0U3F1YXJlc1JlZ3Jlc3Npb25Db25zdGFudHMuanMnO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIGNvbnN0YW50c1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8vIGJhY2tncm91bmRcclxuY29uc3QgR1JJRF9CQUNLR1JPVU5EX0ZJTEwgPSAnd2hpdGUnO1xyXG5jb25zdCBHUklEX0JBQ0tHUk9VTkRfTElORV9XSURUSCA9IDE7IC8vIGZvciB0aGUgYm9yZGVyIG9mIGdyYXBoXHJcbmNvbnN0IEdSSURfQkFDS0dST1VORF9TVFJPS0UgPSAnZ3JheSc7XHJcblxyXG4vLyBncmlkXHJcbmNvbnN0IE1BSk9SX0dSSURfTElORV9XSURUSCA9IDE7XHJcbmNvbnN0IE1BSk9SX0dSSURfTElORV9DT0xPUiA9IExlYXN0U3F1YXJlc1JlZ3Jlc3Npb25Db25zdGFudHMuTUFKT1JfR1JJRF9TVFJPS0VfQ09MT1I7XHJcbmNvbnN0IE1JTk9SX0dSSURfTElORV9XSURUSCA9IDE7XHJcbmNvbnN0IE1JTk9SX0dSSURfTElORV9DT0xPUiA9IExlYXN0U3F1YXJlc1JlZ3Jlc3Npb25Db25zdGFudHMuTUlOT1JfR1JJRF9TVFJPS0VfQ09MT1I7XHJcblxyXG4vLyBheGVzXHJcbmNvbnN0IEFYSVNfQ09MT1IgPSAnYmxhY2snO1xyXG5jb25zdCBBWElTX0VYVEVOVCA9IDAuMDsgLy8gaG93IGZhciB0aGUgbGluZSBleHRlbmRzIHBhc3QgdGhlIG1pbi9tYXggdGlja3MsIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcblxyXG4vLyBsYWJlbHNcclxuY29uc3QgQVhJU19MQUJFTF9GT05UID0gTGVhc3RTcXVhcmVzUmVncmVzc2lvbkNvbnN0YW50cy5URVhUX0JPTERfRk9OVDtcclxuY29uc3QgQVhJU19MQUJFTF9DT0xPUiA9ICdibGFjayc7IC8vIHNwYWNlIGJldHdlZW4gZW5kIG9mIGF4aXMgYW5kIGxhYmVsXHJcbmNvbnN0IE1BWF9MQUJFTF9XSURUSCA9IDUwMDsgLy8gaTE4biByZXN0cmljdGlvbiwgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5cclxuLy8gdGlja3NcclxuY29uc3QgTUlOT1JfVElDS19MRU5HVEggPSAzOyAvLyBob3cgZmFyIGEgbWlub3IgdGljayBleHRlbmRzIGZyb20gdGhlIGF4aXNcclxuY29uc3QgTUlOT1JfVElDS19MSU5FX1dJRFRIID0gMTtcclxuY29uc3QgTUlOT1JfVElDS19DT0xPUiA9ICdibGFjayc7XHJcbmNvbnN0IE1BSk9SX1RJQ0tfTEVOR1RIID0gNjsgLy8gaG93IGZhciBhIG1ham9yIHRpY2sgZXh0ZW5kcyBmcm9tIHRoZSBheGlzXHJcbmNvbnN0IE1BSk9SX1RJQ0tfTElORV9XSURUSCA9IDE7XHJcbmNvbnN0IE1BSk9SX1RJQ0tfQ09MT1IgPSAnYmxhY2snO1xyXG5jb25zdCBNQUpPUl9USUNLX0ZPTlQgPSBMZWFzdFNxdWFyZXNSZWdyZXNzaW9uQ29uc3RhbnRzLk1BSk9SX1RJQ0tfRk9OVDtcclxuY29uc3QgVElDS19MQUJFTF9TUEFDSU5HID0gMjtcclxuY29uc3QgTUlOVVNfU0lHTl9XSURUSCA9IG5ldyBUZXh0KCBNYXRoU3ltYm9scy5NSU5VUywgeyBmb250OiBNQUpPUl9USUNLX0ZPTlQgfSApLndpZHRoO1xyXG5cclxuY29uc3QgU01BTExfRVBTSUxPTiA9IDAuMDAwMDAwMTsgLy8gZm9yIGVxdWFsRXBzaWxvbiBjaGVja1xyXG5cclxuY2xhc3MgR3JhcGhBeGVzTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHJlc3BvbnNpYmxlIGZvciBsYXlpbmcgb3V0IHRoZSB0aWNrcyBvZiB0aGUgZ3JhcGgsIHRoZSBheGlzIHRpdGxlcyBhbmQgdGhlIGdyaWRcclxuICAgKiBAcGFyYW0ge0RhdGFTZXR9IGRhdGFTZXRcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBzaG93R3JpZFByb3BlcnR5XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGRhdGFTZXQsIG1vZGVsVmlld1RyYW5zZm9ybSwgc2hvd0dyaWRQcm9wZXJ0eSApIHtcclxuXHJcbiAgICBjb25zdCBncmlkTm9kZSA9IG5ldyBHcmlkTm9kZSggZGF0YVNldCwgbW9kZWxWaWV3VHJhbnNmb3JtICk7XHJcbiAgICBjb25zdCBzaG93R3JpZFByb3BlcnR5T2JzZXJ2ZXIgPSB2aXNpYmxlID0+IHtcclxuICAgICAgZ3JpZE5vZGUudmlzaWJsZSA9IHZpc2libGU7XHJcbiAgICB9O1xyXG5cclxuICAgIHNob3dHcmlkUHJvcGVydHkubGluayggc2hvd0dyaWRQcm9wZXJ0eU9ic2VydmVyICk7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgQmFja2dyb3VuZE5vZGUoIGRhdGFTZXQsIG1vZGVsVmlld1RyYW5zZm9ybSApLFxyXG4gICAgICAgIGdyaWROb2RlLFxyXG4gICAgICAgIG5ldyBYQXhpc05vZGUoIGRhdGFTZXQsIG1vZGVsVmlld1RyYW5zZm9ybSApLFxyXG4gICAgICAgIG5ldyBZQXhpc05vZGUoIGRhdGFTZXQsIG1vZGVsVmlld1RyYW5zZm9ybSApLFxyXG4gICAgICAgIG5ldyBYTGFiZWxOb2RlKCBkYXRhU2V0LCBtb2RlbFZpZXdUcmFuc2Zvcm0gKSxcclxuICAgICAgICBuZXcgWUxhYmVsTm9kZSggZGF0YVNldCwgbW9kZWxWaWV3VHJhbnNmb3JtIClcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZUdyYXBoQXhlc05vZGUgPSAoKSA9PiB7XHJcbiAgICAgIHNob3dHcmlkUHJvcGVydHkudW5saW5rKCBzaG93R3JpZFByb3BlcnR5T2JzZXJ2ZXIgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VHcmFwaEF4ZXNOb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5sZWFzdFNxdWFyZXNSZWdyZXNzaW9uLnJlZ2lzdGVyKCAnR3JhcGhBeGVzTm9kZScsIEdyYXBoQXhlc05vZGUgKTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBtYWpvciB0aWNrIHdpdGggbGFiZWwsIG9yaWVudGF0aW9uIGlzIHZlcnRpY2FsIG9yIGhvcml6b250YWxcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5jbGFzcyBNYWpvclRpY2tOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLy8gVGljayBpcyBwbGFjZWQgYXQgKHgseSkgYW5kIGlzIGVpdGhlciB2ZXJ0aWNhbCBvciBob3Jpem9udGFsLlxyXG4gIGNvbnN0cnVjdG9yKCB4LCB5LCB2YWx1ZSwgaXNWZXJ0aWNhbCApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIHRpY2sgbGluZVxyXG4gICAgY29uc3QgdGlja0xpbmVOb2RlID0gbmV3IFBhdGgoIGlzVmVydGljYWwgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoYXBlLmxpbmVTZWdtZW50KCB4LCB5IC0gTUFKT1JfVElDS19MRU5HVEgsIHgsIHkgKyBNQUpPUl9USUNLX0xFTkdUSCApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGFwZS5saW5lU2VnbWVudCggeCAtIE1BSk9SX1RJQ0tfTEVOR1RILCB5LCB4ICsgTUFKT1JfVElDS19MRU5HVEgsIHkgKSwge1xyXG4gICAgICBzdHJva2U6IE1BSk9SX1RJQ0tfQ09MT1IsXHJcbiAgICAgIGxpbmVXaWR0aDogTUFKT1JfVElDS19MSU5FX1dJRFRIXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aWNrTGluZU5vZGUgKTtcclxuXHJcbiAgICAvLyB0aWNrIGxhYmVsXHJcbiAgICBjb25zdCB0aWNrTGFiZWxOb2RlID0gbmV3IFRleHQoIHZhbHVlLCB7IGZvbnQ6IE1BSk9SX1RJQ0tfRk9OVCwgZmlsbDogTUFKT1JfVElDS19DT0xPUiB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aWNrTGFiZWxOb2RlICk7XHJcblxyXG4gICAgLy8gbGFiZWwgcG9zaXRpb25cclxuICAgIGlmICggaXNWZXJ0aWNhbCApIHtcclxuICAgICAgLy8gY2VudGVyIGxhYmVsIHVuZGVyIGxpbmUsIGNvbXBlbnNhdGUgZm9yIG1pbnVzIHNpZ25cclxuICAgICAgY29uc3Qgc2lnblhPZmZzZXQgPSAoIHZhbHVlIDwgMCApID8gLSggTUlOVVNfU0lHTl9XSURUSCAvIDIgKSA6IDA7XHJcbiAgICAgIHRpY2tMYWJlbE5vZGUubGVmdCA9IHRpY2tMaW5lTm9kZS5jZW50ZXJYIC0gKCB0aWNrTGFiZWxOb2RlLndpZHRoIC8gMiApICsgc2lnblhPZmZzZXQ7XHJcbiAgICAgIHRpY2tMYWJlbE5vZGUudG9wID0gdGlja0xpbmVOb2RlLmJvdHRvbSArIFRJQ0tfTEFCRUxfU1BBQ0lORztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBjZW50ZXIgbGFiZWwgdG8gbGVmdCBvZiBsaW5lXHJcbiAgICAgIHRpY2tMYWJlbE5vZGUucmlnaHQgPSB0aWNrTGluZU5vZGUubGVmdCAtIFRJQ0tfTEFCRUxfU1BBQ0lORztcclxuICAgICAgdGlja0xhYmVsTm9kZS5jZW50ZXJZID0gdGlja0xpbmVOb2RlLmNlbnRlclk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gbWlub3IgdGljayBtYXJrLCBubyBsYWJlbCwgb3JpZW50YXRpb24gaXMgdmVydGljYWwgb3IgaG9yaXpvbnRhbFxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmNsYXNzIE1pbm9yVGlja05vZGUgZXh0ZW5kcyBQYXRoIHtcclxuICAvLyBUaWNrIGlzIHBsYWNlZCBhdCAoeCx5KSBhbmQgaXMgZWl0aGVyIHZlcnRpY2FsIG9yIGhvcml6b250YWxcclxuICBjb25zdHJ1Y3RvciggeCwgeSwgaXNWZXJ0aWNhbCApIHtcclxuICAgIHN1cGVyKCBpc1ZlcnRpY2FsID9cclxuICAgICAgICAgICBTaGFwZS5saW5lU2VnbWVudCggeCwgeSAtIE1JTk9SX1RJQ0tfTEVOR1RILCB4LCB5ICsgTUlOT1JfVElDS19MRU5HVEggKSA6XHJcbiAgICAgICAgICAgU2hhcGUubGluZVNlZ21lbnQoIHggLSBNSU5PUl9USUNLX0xFTkdUSCwgeSwgeCArIE1JTk9SX1RJQ0tfTEVOR1RILCB5ICksIHtcclxuICAgICAgbGluZVdpZHRoOiBNSU5PUl9USUNLX0xJTkVfV0lEVEgsXHJcbiAgICAgIHN0cm9rZTogTUlOT1JfVElDS19DT0xPUlxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLVxyXG4vLyBUaWNrIFNwYWNpbmcgZm9yIG1ham9yIGFuZCBtaW5vciB0aWNrc1xyXG4vLy0tLS0tLS0tLS0tLS0tXHJcblxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiB0aWNrU3BhY2luZyggcmFuZ2UgKSB7XHJcbiAgY29uc3Qgd2lkdGggPSByYW5nZS5tYXggLSByYW5nZS5taW47XHJcbiAgY29uc3QgbG9nT2ZXaWR0aCA9IE1hdGgubG9nKCB3aWR0aCApIC8gTWF0aC5MTjEwOyAvLyBwb2x5ZmlsbCBmb3IgTWF0aC5sb2cxMCh3aWR0aClcclxuICBjb25zdCBleHBvbmVudCA9IE1hdGguZmxvb3IoIGxvZ09mV2lkdGggKTsgLy8gd2lkdGggPSBtYW50aXNzYSoxMF5leHBvbmVudFxyXG4gIGNvbnN0IG1hbnRpc3NhID0gTWF0aC5wb3coIDEwLCBsb2dPZldpZHRoIC0gZXhwb25lbnQgKTsvLyBtYW50aXNzYSAgcmFuZ2VzIGZyb20gMSB0byAxMDtcclxuXHJcbiAgbGV0IG1ham9yQmFzZU11bHRpcGxlO1xyXG4gIGxldCBtaW5vclRpY2tzUGVyTWFqb3I7XHJcblxyXG4gIC8vIG9uIGEgZ3JhcGggdGhlcmUgc2hvdWxkIGJlIG1pbmltdW0gb2YgNCBtYWpvciB0aWNrcyBhbmQgYSBtYXhpbXVtIG9mIDguXHJcbiAgLy8gdGhlIG51bWJlcnMgZm9yIHRoZSBtYW50aXNzYSB3ZXJlIGNob3NlbiBlbXBpcmljYWxseVxyXG4gIGlmICggbWFudGlzc2EgPj0gNi41ICkge1xyXG4gICAgbWFqb3JCYXNlTXVsdGlwbGUgPSAyO1xyXG4gICAgbWlub3JUaWNrc1Blck1ham9yID0gNDtcclxuICB9XHJcbiAgZWxzZSBpZiAoIG1hbnRpc3NhID49IDMuMiApIHtcclxuICAgIG1ham9yQmFzZU11bHRpcGxlID0gMTtcclxuICAgIG1pbm9yVGlja3NQZXJNYWpvciA9IDU7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBtYW50aXNzYSA+PSAxLjU1ICkge1xyXG4gICAgbWFqb3JCYXNlTXVsdGlwbGUgPSAwLjU7XHJcbiAgICBtaW5vclRpY2tzUGVyTWFqb3IgPSA1O1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIG1ham9yQmFzZU11bHRpcGxlID0gMC4yO1xyXG4gICAgbWlub3JUaWNrc1Blck1ham9yID0gNDtcclxuICB9XHJcblxyXG4gIGNvbnN0IG1ham9yVGlja1NwYWNpbmcgPSBtYWpvckJhc2VNdWx0aXBsZSAqIE1hdGgucG93KCAxMCwgZXhwb25lbnQgKTsgLy8gc2VwYXJhdGlvbiBiZXR3ZWVuIHR3byBtYWpvciB0aWNrc1xyXG4gIGNvbnN0IG1pbm9yVGlja1NwYWNpbmcgPSBtYWpvckJhc2VNdWx0aXBsZSAqIE1hdGgucG93KCAxMCwgZXhwb25lbnQgKSAvIG1pbm9yVGlja3NQZXJNYWpvcjsgLy8gc2VwYXJhdGlvbiBiZXR3ZWVuIHR3byBtaW5vciB0aWNrc1xyXG4gIGNvbnN0IHRpY2tTdGFydFBvc2l0aW9uID0gTWF0aC5jZWlsKCByYW5nZS5taW4gLyBtaW5vclRpY2tTcGFjaW5nICkgKiBtaW5vclRpY2tTcGFjaW5nOyAvLyB7bnVtYmVyfSBwb3NpdGlvbiBvZiB0aGUgZmlyc3QgdGlja1xyXG4gIGNvbnN0IHRpY2tTdG9wUG9zaXRpb24gPSBNYXRoLmZsb29yKCByYW5nZS5tYXggLyBtaW5vclRpY2tTcGFjaW5nICkgKiBtaW5vclRpY2tTcGFjaW5nOyAvLyB7bnVtYmVyfSBwb3NpdGlvbiBvZiB0aGUgbGFzdCB0aWNrXHJcbiAgY29uc3QgbnVtYmVyT2ZUaWNrcyA9ICggdGlja1N0b3BQb3NpdGlvbiAtIHRpY2tTdGFydFBvc2l0aW9uICkgLyBtaW5vclRpY2tTcGFjaW5nICsgMTsgLy8gbnVtYmVyIG9mIHRpY2tzXHJcbiAgY29uc3QgZGVjaW1hbFBsYWNlcyA9IG1ham9yVGlja1NwYWNpbmcgPiAxID8gMCA6IC0xICogTWF0aC5sb2coIG1ham9yVGlja1NwYWNpbmcgKSAvIE1hdGguTE4xMCArIDE7IC8vIHRoZSBwcmVjaXNpb24gb2YgdGlja3MgKGZvciB0ZXh0IHB1cnBvc2VzKVxyXG5cclxuICBjb25zdCB0aWNrU2VwYXJhdGlvbiA9IHtcclxuICAgIG1ham9yVGlja1NwYWNpbmc6IG1ham9yVGlja1NwYWNpbmcsXHJcbiAgICBtaW5vclRpY2tTcGFjaW5nOiBtaW5vclRpY2tTcGFjaW5nLFxyXG4gICAgbWlub3JUaWNrc1Blck1ham9yOiBtaW5vclRpY2tzUGVyTWFqb3IsXHJcbiAgICB0aWNrU3RhcnRQb3NpdGlvbjogdGlja1N0YXJ0UG9zaXRpb24sXHJcbiAgICB0aWNrU3RvcFBvc2l0aW9uOiB0aWNrU3RvcFBvc2l0aW9uLFxyXG4gICAgbnVtYmVyT2ZUaWNrczogbnVtYmVyT2ZUaWNrcyxcclxuICAgIGRlY2ltYWxQbGFjZXM6IGRlY2ltYWxQbGFjZXNcclxuICB9O1xyXG4gIHJldHVybiB0aWNrU2VwYXJhdGlvbjtcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIHgtYXhpcyAoaG9yaXpvbnRhbClcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5jbGFzcyBYQXhpc05vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0RhdGFTZXR9IGRhdGFTZXRcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBkYXRhU2V0LCBtb2RlbFZpZXdUcmFuc2Zvcm0gKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBob3Jpem9udGFsIGxpbmVcclxuICAgIGNvbnN0IHRhaWxQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBkYXRhU2V0LnhSYW5nZS5taW4gLSBBWElTX0VYVEVOVCApLCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBkYXRhU2V0LnlSYW5nZS5taW4gKSApO1xyXG4gICAgY29uc3QgdGlwUG9zaXRpb24gPSBuZXcgVmVjdG9yMiggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggZGF0YVNldC54UmFuZ2UubWF4ICsgQVhJU19FWFRFTlQgKSwgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggZGF0YVNldC55UmFuZ2UubWluICkgKTtcclxuICAgIGNvbnN0IGxpbmVOb2RlID0gbmV3IExpbmUoIHRhaWxQb3NpdGlvbi54LCB0YWlsUG9zaXRpb24ueSwgdGlwUG9zaXRpb24ueCwgdGlwUG9zaXRpb24ueSwge1xyXG4gICAgICBmaWxsOiBBWElTX0NPTE9SLFxyXG4gICAgICBzdHJva2U6ICdibGFjaydcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGxpbmVOb2RlICk7XHJcblxyXG4gICAgLy8gdGlja3NcclxuICAgIGNvbnN0IHRpY2tTZXBhcmF0aW9uID0gdGlja1NwYWNpbmcoIGRhdGFTZXQueFJhbmdlICk7XHJcbiAgICBjb25zdCBudW1iZXJPZlRpY2tzID0gdGlja1NlcGFyYXRpb24ubnVtYmVyT2ZUaWNrcztcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJPZlRpY2tzOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IG1vZGVsWCA9IHRpY2tTZXBhcmF0aW9uLnRpY2tTdGFydFBvc2l0aW9uICsgdGlja1NlcGFyYXRpb24ubWlub3JUaWNrU3BhY2luZyAqIGk7XHJcbiAgICAgIGNvbnN0IHggPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBtb2RlbFggKTtcclxuICAgICAgY29uc3QgeSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIGRhdGFTZXQueVJhbmdlLm1pbiApO1xyXG5cclxuICAgICAgaWYgKCBNYXRoLmFicyggbW9kZWxYIC8gdGlja1NlcGFyYXRpb24ubWlub3JUaWNrU3BhY2luZyApICUgKCB0aWNrU2VwYXJhdGlvbi5taW5vclRpY2tzUGVyTWFqb3IgKSA8IFNNQUxMX0VQU0lMT04gKSB7XHJcbiAgICAgICAgLy8gbWFqb3IgdGlja1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBNYWpvclRpY2tOb2RlKCB4LCB5LCBVdGlscy50b0ZpeGVkKCBtb2RlbFgsIHRpY2tTZXBhcmF0aW9uLmRlY2ltYWxQbGFjZXMgKSwgdHJ1ZSApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gbWlub3IgdGlja1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBNaW5vclRpY2tOb2RlKCB4LCB5LCB0cnVlICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vICAgeS1heGlzICh2ZXJ0aWNhbClcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5jbGFzcyBZQXhpc05vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvKioqXHJcbiAgICogQHBhcmFtIHtEYXRhU2V0fSBkYXRhU2V0XHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZGF0YVNldCwgbW9kZWxWaWV3VHJhbnNmb3JtICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gdmVydGljYWwgbGluZVxyXG4gICAgY29uc3QgdGFpbFBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIGRhdGFTZXQueFJhbmdlLm1pbiApLCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBkYXRhU2V0LnlSYW5nZS5taW4gLSBBWElTX0VYVEVOVCApICk7XHJcbiAgICBjb25zdCB0aXBQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBkYXRhU2V0LnhSYW5nZS5taW4gKSwgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggZGF0YVNldC55UmFuZ2UubWF4ICsgQVhJU19FWFRFTlQgKSApO1xyXG4gICAgY29uc3QgbGluZU5vZGUgPSBuZXcgTGluZSggdGFpbFBvc2l0aW9uLngsIHRhaWxQb3NpdGlvbi55LCB0aXBQb3NpdGlvbi54LCB0aXBQb3NpdGlvbi55LCB7XHJcbiAgICAgIGZpbGw6IEFYSVNfQ09MT1IsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJ1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGluZU5vZGUgKTtcclxuXHJcbiAgICAvLyB0aWNrc1xyXG4gICAgY29uc3QgdGlja1NlcGFyYXRpb24gPSB0aWNrU3BhY2luZyggZGF0YVNldC55UmFuZ2UgKTtcclxuICAgIGNvbnN0IG51bWJlck9mVGlja3MgPSB0aWNrU2VwYXJhdGlvbi5udW1iZXJPZlRpY2tzO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mVGlja3M7IGkrKyApIHtcclxuICAgICAgY29uc3QgbW9kZWxZID0gdGlja1NlcGFyYXRpb24udGlja1N0YXJ0UG9zaXRpb24gKyB0aWNrU2VwYXJhdGlvbi5taW5vclRpY2tTcGFjaW5nICogaTtcclxuXHJcbiAgICAgIGNvbnN0IHggPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBkYXRhU2V0LnhSYW5nZS5taW4gKTtcclxuICAgICAgY29uc3QgeSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIG1vZGVsWSApO1xyXG4gICAgICBpZiAoIE1hdGguYWJzKCBtb2RlbFkgLyB0aWNrU2VwYXJhdGlvbi5taW5vclRpY2tTcGFjaW5nICkgJSAoIHRpY2tTZXBhcmF0aW9uLm1pbm9yVGlja3NQZXJNYWpvciApIDwgU01BTExfRVBTSUxPTiApIHtcclxuICAgICAgICAvLyBtYWpvciB0aWNrXHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IE1ham9yVGlja05vZGUoIHgsIHksIFV0aWxzLnRvRml4ZWQoIG1vZGVsWSwgdGlja1NlcGFyYXRpb24uZGVjaW1hbFBsYWNlcyApLCBmYWxzZSApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gbWlub3IgdGlja1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBNaW5vclRpY2tOb2RlKCB4LCB5LCBmYWxzZSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gIFggbGFiZWxcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5jbGFzcyBYTGFiZWxOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtEYXRhU2V0fSBkYXRhU2V0XHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZGF0YVNldCwgbW9kZWxWaWV3VHJhbnNmb3JtLCBvcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgY2VudGVyWCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goICggZGF0YVNldC54UmFuZ2UubWluICsgZGF0YVNldC54UmFuZ2UubWF4ICkgLyAyICk7XHJcbiAgICBjb25zdCBib3R0b20gPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBkYXRhU2V0LnlSYW5nZS5taW4gKTtcclxuICAgIGNvbnN0IHhMYWJlbE5vZGUgPSBuZXcgVGV4dCggZGF0YVNldC54QXhpc1RpdGxlLCB7XHJcbiAgICAgIGZvbnQ6IEFYSVNfTEFCRUxfRk9OVCxcclxuICAgICAgZmlsbDogQVhJU19MQUJFTF9DT0xPUixcclxuICAgICAgY2VudGVyWDogY2VudGVyWCxcclxuICAgICAgYm90dG9tOiBib3R0b20gKyA1MCxcclxuICAgICAgbWF4V2lkdGg6IE1BWF9MQUJFTF9XSURUSFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggeExhYmVsTm9kZSApO1xyXG4gIH1cclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vICBZIGxhYmVsXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuY2xhc3MgWUxhYmVsTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RGF0YVNldH0gZGF0YVNldFxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGRhdGFTZXQsIG1vZGVsVmlld1RyYW5zZm9ybSApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIGNvbnN0IGNlbnRlclkgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCAoIGRhdGFTZXQueVJhbmdlLm1pbiArIGRhdGFTZXQueVJhbmdlLm1heCApIC8gMiApO1xyXG4gICAgY29uc3QgbGVmdCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIGRhdGFTZXQueFJhbmdlLm1pbiApO1xyXG4gICAgY29uc3QgeUxhYmVsTm9kZSA9IG5ldyBUZXh0KCBkYXRhU2V0LnlBeGlzVGl0bGUsIHtcclxuICAgICAgZm9udDogQVhJU19MQUJFTF9GT05ULFxyXG4gICAgICBmaWxsOiBBWElTX0xBQkVMX0NPTE9SLFxyXG4gICAgICBjZW50ZXJZOiBjZW50ZXJZLFxyXG4gICAgICBsZWZ0OiBsZWZ0IC0gNTAsXHJcbiAgICAgIG1heFdpZHRoOiBNQVhfTEFCRUxfV0lEVEgsXHJcbiAgICAgIHJvdGF0aW9uOiAtTWF0aC5QSSAvIDJcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHlMYWJlbE5vZGUgKTtcclxuXHJcbiAgfVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gIDJEIEJhY2tncm91bmRcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5jbGFzcyBCYWNrZ3JvdW5kTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RGF0YVNldH0gZGF0YVNldFxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGRhdGFTZXQsIG1vZGVsVmlld1RyYW5zZm9ybSApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgUmVjdGFuZ2xlKFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBkYXRhU2V0LnhSYW5nZS5taW4gKSxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggZGF0YVNldC55UmFuZ2UubWF4ICksXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWCggZGF0YVNldC54UmFuZ2UuZ2V0TGVuZ3RoKCkgKSxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFZKCAtZGF0YVNldC55UmFuZ2UuZ2V0TGVuZ3RoKCkgKSxcclxuICAgICAgeyBmaWxsOiBHUklEX0JBQ0tHUk9VTkRfRklMTCwgbGluZVdpZHRoOiBHUklEX0JBQ0tHUk9VTkRfTElORV9XSURUSCwgc3Ryb2tlOiBHUklEX0JBQ0tHUk9VTkRfU1RST0tFIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJhY2tncm91bmROb2RlICk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gICAyRCBncmlkXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuY2xhc3MgR3JpZE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0RhdGFTZXR9IGRhdGFTZXRcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBkYXRhU2V0LCBtb2RlbFZpZXdUcmFuc2Zvcm0gKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIGhvcml6b250YWwgZ3JpZCBsaW5lcywgb25lIGxpbmUgZm9yIGVhY2ggdW5pdCBvZiBncmlkIHNwYWNpbmdcclxuICAgIGNvbnN0IGhvcml6b250YWxHcmlkTGluZXNOb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGhvcml6b250YWxHcmlkTGluZXNOb2RlICk7XHJcbiAgICBjb25zdCB0aWNrWVNlcGFyYXRpb24gPSB0aWNrU3BhY2luZyggZGF0YVNldC55UmFuZ2UgKTtcclxuICAgIGNvbnN0IG51bWJlck9mSG9yaXpvbnRhbEdyaWRMaW5lcyA9IHRpY2tZU2VwYXJhdGlvbi5udW1iZXJPZlRpY2tzO1xyXG5cclxuICAgIGNvbnN0IG1ham9yR3JpZExpbmVzU2hhcGUgPSBuZXcgU2hhcGUoKTtcclxuICAgIGNvbnN0IG1pbm9yR3JpZExpbmVzU2hhcGUgPSBuZXcgU2hhcGUoKTtcclxuXHJcbiAgICBjb25zdCBtaW5YID0gZGF0YVNldC54UmFuZ2UubWluO1xyXG4gICAgY29uc3QgbWF4WCA9IGRhdGFTZXQueFJhbmdlLm1heDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mSG9yaXpvbnRhbEdyaWRMaW5lczsgaSsrICkge1xyXG4gICAgICBjb25zdCBtb2RlbFkgPSB0aWNrWVNlcGFyYXRpb24udGlja1N0YXJ0UG9zaXRpb24gKyB0aWNrWVNlcGFyYXRpb24ubWlub3JUaWNrU3BhY2luZyAqIGk7XHJcbiAgICAgIGlmICggbW9kZWxZICE9PSBkYXRhU2V0LnlSYW5nZS5taW4gKSB7IC8vIHNraXAgb3JpZ2luLCB4IGF4aXMgd2lsbCBsaXZlIGhlcmVcclxuICAgICAgICBjb25zdCB5T2Zmc2V0ID0gbW9kZWxZO1xyXG4gICAgICAgIGNvbnN0IGlzTWFqb3JYID0gTWF0aC5hYnMoIG1vZGVsWSAvIHRpY2tZU2VwYXJhdGlvbi5taW5vclRpY2tTcGFjaW5nICkgJSAoIHRpY2tZU2VwYXJhdGlvbi5taW5vclRpY2tzUGVyTWFqb3IgKSA8IFNNQUxMX0VQU0lMT047XHJcbiAgICAgICAgaWYgKCBpc01ham9yWCApIHtcclxuICAgICAgICAgIG1ham9yR3JpZExpbmVzU2hhcGUubW92ZVRvKCBtaW5YLCB5T2Zmc2V0IClcclxuICAgICAgICAgICAgLmhvcml6b250YWxMaW5lVG8oIG1heFggKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBtaW5vckdyaWRMaW5lc1NoYXBlLm1vdmVUbyggbWluWCwgeU9mZnNldCApXHJcbiAgICAgICAgICAgIC5ob3Jpem9udGFsTGluZVRvKCBtYXhYICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdmVydGljYWwgZ3JpZCBsaW5lcywgb25lIGxpbmUgZm9yIGVhY2ggdW5pdCBvZiBncmlkIHNwYWNpbmdcclxuICAgIGNvbnN0IHZlcnRpY2FsR3JpZExpbmVzTm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB2ZXJ0aWNhbEdyaWRMaW5lc05vZGUgKTtcclxuICAgIGNvbnN0IHRpY2tYU2VwYXJhdGlvbiA9IHRpY2tTcGFjaW5nKCBkYXRhU2V0LnhSYW5nZSApO1xyXG4gICAgY29uc3QgbnVtYmVyT2ZWZXJ0aWNhbEdyaWRMaW5lcyA9IHRpY2tYU2VwYXJhdGlvbi5udW1iZXJPZlRpY2tzO1xyXG4gICAgY29uc3QgbWluWSA9IGRhdGFTZXQueVJhbmdlLm1heDsgLy8geWVzLCBzd2FwIG1pbiBhbmQgbWF4XHJcbiAgICBjb25zdCBtYXhZID0gZGF0YVNldC55UmFuZ2UubWluO1xyXG4gICAgZm9yICggbGV0IGogPSAwOyBqIDwgbnVtYmVyT2ZWZXJ0aWNhbEdyaWRMaW5lczsgaisrICkge1xyXG4gICAgICBjb25zdCBtb2RlbFggPSB0aWNrWFNlcGFyYXRpb24udGlja1N0YXJ0UG9zaXRpb24gKyB0aWNrWFNlcGFyYXRpb24ubWlub3JUaWNrU3BhY2luZyAqIGo7XHJcbiAgICAgIGlmICggbW9kZWxYICE9PSBkYXRhU2V0LnhSYW5nZS5taW4gKSB7IC8vIHNraXAgb3JpZ2luLCB5IGF4aXMgd2lsbCBsaXZlIGhlcmVcclxuICAgICAgICBjb25zdCB4T2Zmc2V0ID0gbW9kZWxYO1xyXG4gICAgICAgIGNvbnN0IGlzTWFqb3JZID0gTWF0aC5hYnMoIG1vZGVsWCAvIHRpY2tYU2VwYXJhdGlvbi5taW5vclRpY2tTcGFjaW5nICkgJSAoIHRpY2tYU2VwYXJhdGlvbi5taW5vclRpY2tzUGVyTWFqb3IgKSA8IFNNQUxMX0VQU0lMT047XHJcbiAgICAgICAgaWYgKCBpc01ham9yWSApIHtcclxuICAgICAgICAgIG1ham9yR3JpZExpbmVzU2hhcGUubW92ZVRvKCB4T2Zmc2V0LCBtaW5ZIClcclxuICAgICAgICAgICAgLnZlcnRpY2FsTGluZVRvKCBtYXhZICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgbWlub3JHcmlkTGluZXNTaGFwZS5tb3ZlVG8oIHhPZmZzZXQsIG1pblkgKVxyXG4gICAgICAgICAgICAudmVydGljYWxMaW5lVG8oIG1heFkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtYWpvckdyaWRMaW5lc1BhdGggPSBuZXcgUGF0aCggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3U2hhcGUoIG1ham9yR3JpZExpbmVzU2hhcGUgKSwge1xyXG4gICAgICBsaW5lV2lkdGg6IE1BSk9SX0dSSURfTElORV9XSURUSCxcclxuICAgICAgc3Ryb2tlOiBNQUpPUl9HUklEX0xJTkVfQ09MT1JcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IG1pbm9yR3JpZExpbmVzUGF0aCA9IG5ldyBQYXRoKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggbWlub3JHcmlkTGluZXNTaGFwZSApLCB7XHJcbiAgICAgIGxpbmVXaWR0aDogTUlOT1JfR1JJRF9MSU5FX1dJRFRILFxyXG4gICAgICBzdHJva2U6IE1JTk9SX0dSSURfTElORV9DT0xPUlxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG1ham9yR3JpZExpbmVzUGF0aCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbWlub3JHcmlkTGluZXNQYXRoICk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdyYXBoQXhlc05vZGU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JGLE9BQU9DLHNCQUFzQixNQUFNLGlDQUFpQztBQUNwRSxPQUFPQywrQkFBK0IsTUFBTSx1Q0FBdUM7O0FBRW5GO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE1BQU1DLG9CQUFvQixHQUFHLE9BQU87QUFDcEMsTUFBTUMsMEJBQTBCLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEMsTUFBTUMsc0JBQXNCLEdBQUcsTUFBTTs7QUFFckM7QUFDQSxNQUFNQyxxQkFBcUIsR0FBRyxDQUFDO0FBQy9CLE1BQU1DLHFC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