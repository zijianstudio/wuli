// Copyright 2020-2022, University of Colorado Boulder

/**
 * SpatializedNumberLineNode is a Scenery Node that presents a number line that is mapped into 2D space.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, HBox, Line, Node, RichText, Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import numberLineCommon from '../../numberLineCommon.js';
import NumberLineCommonStrings from '../../NumberLineCommonStrings.js';
import NLCConstants from '../NLCConstants.js';
import AbsoluteValueSpanNode from './AbsoluteValueSpanNode.js';
import PointNode from './PointNode.js';
import PointsOffScaleCondition from './PointsOffScaleCondition.js';
const pointsOffScaleString = NumberLineCommonStrings.pointsOffScale;

// constants
const TICK_MARK_LABEL_DISTANCE = 5;
const ABSOLUTE_VALUE_MIN_LINE_WIDTH = 2;
const ABSOLUTE_VALUE_LINE_EXPANSION_FACTOR = 3;
const ABSOLUTE_VALUE_SPAN_NL_DISTANCE_Y = 55;
const ABSOLUTE_VALUE_SPAN_SPACING_Y = 40;
const ABSOLUTE_VALUE_SPAN_NL_DISTANCE_X = 105;
const ABSOLUTE_VALUE_SPAN_SPACING_X = 95;
const OFF_SCALE_INDICATOR_FONT = new PhetFont(14);
const COMMON_OFF_SCALE_PANEL_OPTIONS = {
  fill: Color.WHITE,
  stroke: Color.BLACK,
  cornerRadius: NLCConstants.LABEL_BACKGROUND_CORNER_RADIUS
};
const OFF_SCALE_HBOX_SPACING = 5;
const OFF_SCALE_ARROW_LENGTH = 25;
const OFF_SCALE_ARROW_OPTIONS = {
  tailWidth: 2
};
const OFF_SCALE_INDICATOR_INSET = 25;
const OFF_SCALE_TEXT_MAX_WIDTH = 100;

// convenience function to calculate distance of an absolute value span node from the number line
const getIndicatorDistanceFromNL = (numberLine, count) => {
  return numberLine.isHorizontal ? ABSOLUTE_VALUE_SPAN_NL_DISTANCE_Y + count * ABSOLUTE_VALUE_SPAN_SPACING_Y : ABSOLUTE_VALUE_SPAN_NL_DISTANCE_X + count * ABSOLUTE_VALUE_SPAN_SPACING_X;
};
class SpatializedNumberLineNode extends Node {
  /**
   * {NumberLine} numberLine - model of a number line
   * {Object} [options] - Options that control the appearance of the number line.  These are specific to this class, and
   * are not propagated to the superclass.
   * @public
   */
  constructor(numberLine, options) {
    options = merge({
      numberLineWidth: 1,
      tickMarkLineWidth: 1,
      tickMarkLength: 10,
      zeroTickMarkLineWidth: 2,
      zeroTickMarkLength: 16,
      tickMarkLabelOptions: {
        font: new PhetFont(16),
        maxWidth: 75
      },
      tickMarkLabelPositionWhenVertical: 'right',
      // valid values are 'right' and 'left'
      tickMarkLabelPositionWhenHorizontal: 'below',
      // valid values are 'above' and 'below'
      color: 'black',
      pointRadius: 10,
      numericalLabelTemplate: '{{value}}',
      // {boolean} - controls whether the absolute value span indicators, which are a little ways away from the number
      // line itself, are portrayed
      showAbsoluteValueSpans: false,
      // {number} - the distance between the edge of the display bounds and the ends of the displayed range, in model
      // coordinates
      displayedRangeInset: 25,
      // {number} - the width and the height of the arrows at the endpoints of the number line
      arrowSize: 10,
      // options for the point nodes
      pointNodeOptions: {
        usePointColorForLabelText: true,
        colorizeLabelBackground: false
      },
      // {PointsOffScaleCondition} when to show the points off scale indicator
      pointsOffScaleCondition: PointsOffScaleCondition.NEVER,
      // {number} - how far off from the number line the off scale indicator is
      // a negative number will go below or to the left of the number line
      // horizontal offset applies when the numberline is vertical (because the offset is horizontal) and vice-versa
      offScaleIndicatorHorizontalOffset: 50,
      offScaleIndicatorVerticalOffset: 50,
      // {string} a string that represents the units of the number line
      unitsString: ''
    }, options);

    // Since the position is set based on the model, don't pass options through to parent class.
    super();

    // @public (readonly) {Object} - make options visible to methods
    this.options = _.cloneDeep(options);

    // @private {NumberLine} - make the number line model available to methods
    this.numberLine = numberLine;

    // Assemble the options that control the appearance of the main number into one place.
    const numberLineNodeOptions = {
      doubleHead: true,
      lineWidth: options.numberLineWidth,
      tailWidth: options.numberLineWidth,
      headHeight: options.arrowSize,
      headWidth: options.arrowSize,
      stroke: options.color,
      fill: options.color
    };

    // Create the layer where everything that moves if the number line's center position changes will reside.  This
    // will be the parent node for most sub-nodes, but will exclude things like points, which are responsible for
    // positioning themselves in space.  Everything on this node will be added as though the number line is centered at
    // the local point (0,0), and then it will be translated into the right position.
    const numberLineRootNode = new Node();
    this.addChild(numberLineRootNode);

    // Add the number line, and update it if the orientation changes.
    const numberLineNode = new Node();
    numberLineRootNode.addChild(numberLineNode);
    numberLine.orientationProperty.link(orientation => {
      const minValueProjected = numberLine.getScaledOffsetFromZero(numberLine.displayedRangeProperty.value.min);
      const maxValueProjected = numberLine.getScaledOffsetFromZero(numberLine.displayedRangeProperty.value.max);

      // Remove the previous representation.
      numberLineNode.removeAllChildren();
      if (orientation === Orientation.HORIZONTAL) {
        // Add the arrow node that represents the number line.
        numberLineNode.addChild(new ArrowNode(minValueProjected - options.displayedRangeInset, 0, maxValueProjected + options.displayedRangeInset, 0, numberLineNodeOptions));
      } else {
        // Add the arrow node that represents the number line.
        numberLineNode.addChild(new ArrowNode(0, maxValueProjected - options.displayedRangeInset, 0, minValueProjected + options.displayedRangeInset, numberLineNodeOptions));
      }

      // Add the tick mark for the 0 position, which is always visible.
      this.addTickMark(numberLineNode, 0, true);
    });

    // Handle the tick marks at the ends of the display range.
    const endTickMarksRootNode = new Node();
    numberLineRootNode.addChild(endTickMarksRootNode);

    // Add the root node for the tick marks that exist between the middle and the end.
    const middleTickMarksRootNode = new Node();
    numberLine.showTickMarksProperty.linkAttribute(middleTickMarksRootNode, 'visible');
    numberLineRootNode.addChild(middleTickMarksRootNode);

    // Add the layer where the lines that are used to indicate the absolute value of a point will be displayed.
    const absoluteValueLineLayer = new Node();
    this.addChild(absoluteValueLineLayer);
    numberLine.showAbsoluteValuesProperty.linkAttribute(absoluteValueLineLayer, 'visible');

    // Add the layer where opposite points on the number line will be displayed.
    const oppositePointDisplayLayer = new Node();
    this.addChild(oppositePointDisplayLayer);

    // Add the layer where the normal (non-opposite) points on the number line will be displayed.
    const pointDisplayLayer = new Node();
    this.addChild(pointDisplayLayer);

    // closure that updates the absolute value indicators
    const absoluteValueLines = []; // {Line[]}
    const updateAbsoluteValueIndicators = (doAnimation = false) => {
      // If there aren't enough absolute value indicator lines available, add new ones until there are enough.
      while (absoluteValueLines.length < numberLine.residentPoints.length) {
        const absoluteValueLine = new Line(0, 0, 1, 1); // position and size are arbitrary, will be updated below
        absoluteValueLines.push(absoluteValueLine);
        absoluteValueLineLayer.addChild(absoluteValueLine);
      }

      // If there are too many absolute value indicator lines, remove them until we have the right amount.
      while (absoluteValueLines.length > numberLine.residentPoints.length) {
        const absoluteValueLine = absoluteValueLines.pop();
        absoluteValueLineLayer.removeChild(absoluteValueLine);
      }

      // Create a list of the resident points on the number line sorted by absolute value.
      const pointsSortedByValue = this.getPointsSortedByAbsoluteValue();

      // Update the position, color, thickness, and layering of each of the lines and the spacing of the spans.
      let pointsAboveZeroCount = 0;
      let pointsBelowZeroCount = 0;
      const zeroPosition = numberLine.centerPositionProperty.value;
      pointsSortedByValue.forEach((point, index) => {
        // Get a line that will display the absolute value on the number line itself.
        const lineOnNumberLine = absoluteValueLines[index];

        // Get the span indicator that is associated with this point.
        const pointValue = point.valueProperty.value;
        if (pointValue === 0) {
          // Hide the line entirely in this case, and position it so that it doesn't mess with the overall bounds.
          lineOnNumberLine.visible = false;
          lineOnNumberLine.setLine(zeroPosition.x, zeroPosition.y, zeroPosition.x, zeroPosition.y);
        } else {
          lineOnNumberLine.visible = true;
          lineOnNumberLine.moveToBack(); // the last line processed will end up at the back of the layering
          lineOnNumberLine.stroke = point.colorProperty.value;
          const pointPosition = point.getPositionInModelSpace();
          lineOnNumberLine.setLine(zeroPosition.x, zeroPosition.y, pointPosition.x, pointPosition.y);
          if (pointValue > 0) {
            pointsAboveZeroCount++;
            lineOnNumberLine.lineWidth = ABSOLUTE_VALUE_MIN_LINE_WIDTH + pointsAboveZeroCount * ABSOLUTE_VALUE_LINE_EXPANSION_FACTOR;
          } else {
            pointsBelowZeroCount++;
            lineOnNumberLine.lineWidth = ABSOLUTE_VALUE_MIN_LINE_WIDTH + pointsBelowZeroCount * ABSOLUTE_VALUE_LINE_EXPANSION_FACTOR;
          }
        }
      });

      // Create a list of the absolute value span indicators sorted by their distance from the number line.
      const sortedAbsoluteValueSpanNodes = _.sortBy(absoluteValueSpanNodes, absoluteValueSpanNode => {
        return absoluteValueSpanNode.distanceFromNumberLineProperty.value;
      });

      // Make sure the absolute value span indicators are at the correct distances - this is mostly done to handle
      // changes in the number line orientation.
      sortedAbsoluteValueSpanNodes.forEach((absoluteValueSpanNode, index) => {
        absoluteValueSpanNode.setDistanceFromNumberLine(getIndicatorDistanceFromNL(numberLine, index), doAnimation);
      });
    };

    // Update the color of the lines separately to avoid race conditions between point value and color.
    const updateAbsoluteValueIndicatorColors = () => {
      // Create a list of the resident points on the number line sorted by absolute value.
      const pointsSortedByValue = this.getPointsSortedByAbsoluteValue();
      pointsSortedByValue.forEach((point, index) => {
        // Get a line that will display the absolute value on the number line itself.
        const lineOnNumberLine = absoluteValueLines[index];

        // Update color of line if it exists.
        if (point.valueProperty.value !== 0) {
          lineOnNumberLine.stroke = point.colorProperty.value;
        }
      });
    };

    // {AbsoluteValueSpanNode[]} array where absolute value span nodes are tracked if displayed for this number line node
    let absoluteValueSpanNodes = [];

    // handler for number line points that are added to the number line
    const handlePointAdded = point => {
      // Add the node that will represent the point on the number line.
      const pointNode = new PointNode(point, numberLine, merge({
        labelTemplate: options.numericalLabelTemplate
      }, options.pointNodeOptions));
      pointDisplayLayer.addChild(pointNode);

      // Add the point that will represent the opposite point.
      const oppositePointNode = new PointNode(point, numberLine, {
        isDoppelganger: true,
        labelTemplate: options.numericalLabelTemplate
      });
      oppositePointDisplayLayer.addChild(oppositePointNode);

      // If enabled, add an absolute value "span indicator", which depicts the absolute value at some distance from
      // the number line.
      let absoluteValueSpanNode = null;
      if (options.showAbsoluteValueSpans) {
        const absoluteValueSpanNodeDistance = getIndicatorDistanceFromNL(numberLine, absoluteValueSpanNodes.length);
        absoluteValueSpanNode = new AbsoluteValueSpanNode(numberLine, point, absoluteValueSpanNodeDistance);
        absoluteValueSpanNodes.push(absoluteValueSpanNode);
        this.addChild(absoluteValueSpanNode);
      }

      // Add a listeners that will update the absolute value indicators.
      point.valueProperty.link(updateAbsoluteValueIndicators);
      point.colorProperty.link(updateAbsoluteValueIndicatorColors);

      // Add a listener that will unhook everything if and when this point is removed.
      const removeItemListener = removedPoint => {
        if (removedPoint === point) {
          pointDisplayLayer.removeChild(pointNode);
          pointNode.dispose();
          oppositePointDisplayLayer.removeChild(oppositePointNode);
          oppositePointNode.dispose();
          if (absoluteValueSpanNode) {
            this.removeChild(absoluteValueSpanNode);
            absoluteValueSpanNode.dispose();
            absoluteValueSpanNodes = _.without(absoluteValueSpanNodes, absoluteValueSpanNode);
          }
          updateAbsoluteValueIndicators(true);
          point.valueProperty.unlink(updateAbsoluteValueIndicators);
          point.colorProperty.unlink(updateAbsoluteValueIndicatorColors);
          numberLine.residentPoints.removeItemRemovedListener(removeItemListener);
        }
      };
      numberLine.residentPoints.addItemRemovedListener(removeItemListener);
    };

    // Add nodes for any points that are initially on the number line.
    numberLine.residentPoints.forEach(handlePointAdded);

    // Handle comings and goings of number line points.
    numberLine.residentPoints.addItemAddedListener(handlePointAdded);
    const unitsText = new Text(options.unitsString, options.tickMarkLabelOptions);
    this.addChild(unitsText);

    // Update portions of the representation that change if the displayed range or orientation changes.
    Multilink.multilink([numberLine.displayedRangeProperty, numberLine.orientationProperty], (displayedRange, orientation) => {
      assert && assert(orientation === Orientation.HORIZONTAL || orientation === Orientation.VERTICAL, `Invalid orientation: ${orientation}`);

      // Remove previous middle and end tickmarks.
      middleTickMarksRootNode.removeAllChildren();
      endTickMarksRootNode.removeAllChildren();

      // Derive the tick mark spacing from the range.  This mapping was taken from the various Number Line Suite
      // design specs, and could be made into a optional mapping function if more flexibility is needed.
      let tickMarkSpacing;
      switch (numberLine.displayedRangeProperty.value.getLength()) {
        case 20:
          tickMarkSpacing = 1;
          break;
        case 30:
        case 40:
        case 60:
          tickMarkSpacing = 5;
          break;
        case 100:
          tickMarkSpacing = 10;
          break;
        case 200:
          tickMarkSpacing = 25;
          break;
        case 2000:
          tickMarkSpacing = 100;
          break;
        default:
          tickMarkSpacing = 1;
          break;
      }

      // Derive the tick mark label spacing from the range.  As with the tick mark spacing, this mapping was taken
      // from the various Number Line Suite design specs, and could be made into a optional mapping function if more
      // flexibility is needed.
      // tickMarkSpacing is for how far apart ticks are whereas tickMarkLabelSpacing is how far apart
      // labels for the ticks are; labels only appear at the specified spacing if there is a tick mark there
      let tickMarkLabelSpacing;
      switch (numberLine.displayedRangeProperty.value.getLength()) {
        case 20:
          tickMarkLabelSpacing = 1;
          break;
        case 40:
        case 60:
          tickMarkLabelSpacing = 5;
          break;
        case 100:
          tickMarkLabelSpacing = 10;
          break;
        case 200:
          tickMarkLabelSpacing = 25;
          break;
        case 2000:
          tickMarkLabelSpacing = 500;
          break;
        default:
          tickMarkLabelSpacing = 1;
          break;
      }

      // Draw the tick marks.  These could be optimized to be a single Path node for the ticks if a performance
      // improvement is ever needed.
      const minTickMarkValue = numberLine.displayedRangeProperty.value.min + tickMarkSpacing;
      const maxTickMarkValue = numberLine.displayedRangeProperty.value.max - tickMarkSpacing;
      this.addTickMark(endTickMarksRootNode, displayedRange.min, true);
      this.addTickMark(endTickMarksRootNode, displayedRange.max, true);
      for (let tmValue = minTickMarkValue; tmValue <= maxTickMarkValue; tmValue += tickMarkSpacing) {
        if (tmValue !== 0) {
          this.addTickMark(middleTickMarksRootNode, tmValue, tmValue % tickMarkLabelSpacing === 0);
        }
      }

      // Update absolute value representations.
      updateAbsoluteValueIndicators();

      // positions the units text
      if (orientation === Orientation.HORIZONTAL) {
        const positionOfLastValue = this.numberLine.valueToModelPosition(displayedRange.max);
        unitsText.left = positionOfLastValue.x + 18;
        unitsText.top = positionOfLastValue.y + options.tickMarkLength + 5;
      } else {
        const positionOfFirstValue = this.numberLine.valueToModelPosition(displayedRange.min);
        unitsText.top = positionOfFirstValue.y + 10;
        unitsText.left = positionOfFirstValue.x + options.tickMarkLength + 13;
      }
    });

    // Monitor the center position of the spatialized number line model and make the necessary transformations when
    // changes occur.
    numberLine.centerPositionProperty.link(centerPosition => {
      numberLineRootNode.translation = centerPosition;
    });

    // Adds points off scale panels if necessary
    if (options.pointsOffScaleCondition !== PointsOffScaleCondition.NEVER) {
      // indicators for when all points are off the scale
      const offScaleToRightText = new RichText(pointsOffScaleString, {
        font: OFF_SCALE_INDICATOR_FONT,
        maxWidth: OFF_SCALE_TEXT_MAX_WIDTH,
        align: 'left'
      });
      const offScaleToRightArrow = new ArrowNode(0, 0, OFF_SCALE_ARROW_LENGTH, 0, OFF_SCALE_ARROW_OPTIONS);
      const pointsOffScaleToRightIndicator = new Panel(new HBox({
        children: [offScaleToRightText, offScaleToRightArrow],
        spacing: OFF_SCALE_HBOX_SPACING
      }), merge({}, COMMON_OFF_SCALE_PANEL_OPTIONS));
      this.addChild(pointsOffScaleToRightIndicator);
      const offScaleToLeftText = new RichText(pointsOffScaleString, {
        font: OFF_SCALE_INDICATOR_FONT,
        maxWidth: OFF_SCALE_TEXT_MAX_WIDTH,
        align: 'right'
      });
      const offScaleToLeftArrow = new ArrowNode(0, 0, -OFF_SCALE_ARROW_LENGTH, 0, OFF_SCALE_ARROW_OPTIONS);
      const pointsOffScaleToLeftIndicator = new Panel(new HBox({
        children: [offScaleToLeftArrow, offScaleToLeftText],
        spacing: OFF_SCALE_HBOX_SPACING
      }), merge({}, COMMON_OFF_SCALE_PANEL_OPTIONS));
      this.addChild(pointsOffScaleToLeftIndicator);
      const offScaleToTopText = new RichText(pointsOffScaleString, {
        font: OFF_SCALE_INDICATOR_FONT,
        maxWidth: OFF_SCALE_TEXT_MAX_WIDTH,
        align: 'center'
      });
      const offScaleToTopArrow = new ArrowNode(0, 0, 0, -OFF_SCALE_ARROW_LENGTH, OFF_SCALE_ARROW_OPTIONS);
      const pointsOffScaleToTopIndicator = new Panel(new HBox({
        children: [offScaleToTopArrow, offScaleToTopText],
        spacing: OFF_SCALE_HBOX_SPACING
      }), merge({}, COMMON_OFF_SCALE_PANEL_OPTIONS));
      this.addChild(pointsOffScaleToTopIndicator);
      const offScaleToBottomText = new RichText(pointsOffScaleString, {
        font: OFF_SCALE_INDICATOR_FONT,
        maxWidth: OFF_SCALE_TEXT_MAX_WIDTH,
        align: 'center'
      });
      const offScaleToBottomArrow = new ArrowNode(0, 0, 0, OFF_SCALE_ARROW_LENGTH, OFF_SCALE_ARROW_OPTIONS);
      const pointsOffScaleToBottomIndicator = new Panel(new HBox({
        children: [offScaleToBottomArrow, offScaleToBottomText],
        spacing: OFF_SCALE_HBOX_SPACING
      }), merge({}, COMMON_OFF_SCALE_PANEL_OPTIONS));
      this.addChild(pointsOffScaleToBottomIndicator);

      // function closure to update the position and visibility of each of the points-off-scale indicators
      const updatePointsOffScaleIndicators = () => {
        const displayedRange = numberLine.displayedRangeProperty.value;

        // positions
        pointsOffScaleToLeftIndicator.left = numberLine.valueToModelPosition(displayedRange.min).x - OFF_SCALE_INDICATOR_INSET;
        pointsOffScaleToLeftIndicator.centerY = numberLine.centerPositionProperty.value.y - options.offScaleIndicatorVerticalOffset;
        pointsOffScaleToRightIndicator.right = numberLine.valueToModelPosition(displayedRange.max).x + OFF_SCALE_INDICATOR_INSET;
        pointsOffScaleToRightIndicator.centerY = pointsOffScaleToLeftIndicator.centerY;
        pointsOffScaleToTopIndicator.centerX = numberLine.centerPositionProperty.value.x - options.offScaleIndicatorHorizontalOffset;
        pointsOffScaleToTopIndicator.top = numberLine.valueToModelPosition(displayedRange.max).y - OFF_SCALE_INDICATOR_INSET;
        pointsOffScaleToBottomIndicator.centerX = pointsOffScaleToTopIndicator.centerX;
        pointsOffScaleToBottomIndicator.bottom = numberLine.valueToModelPosition(displayedRange.min).y + OFF_SCALE_INDICATOR_INSET;

        // visibility
        if (options.pointsOffScaleCondition === PointsOffScaleCondition.ALL) {
          const areAllPointsBelow = !numberLine.residentPoints.some(point => point.valueProperty.value >= displayedRange.min);
          const areAllPointsAbove = !numberLine.residentPoints.some(point => point.valueProperty.value <= displayedRange.max);
          pointsOffScaleToLeftIndicator.visible = numberLine.residentPoints.length > 0 && areAllPointsBelow && numberLine.orientationProperty.value === Orientation.HORIZONTAL;
          pointsOffScaleToRightIndicator.visible = numberLine.residentPoints.length > 0 && areAllPointsAbove && numberLine.orientationProperty.value === Orientation.HORIZONTAL;
          pointsOffScaleToTopIndicator.visible = numberLine.residentPoints.length > 0 && areAllPointsAbove && numberLine.orientationProperty.value === Orientation.VERTICAL;
          pointsOffScaleToBottomIndicator.visible = numberLine.residentPoints.length > 0 && areAllPointsBelow && numberLine.orientationProperty.value === Orientation.VERTICAL;
        } else {
          const isPointBelow = numberLine.residentPoints.some(point => point.valueProperty.value < displayedRange.min);
          const isPointAbove = numberLine.residentPoints.some(point => point.valueProperty.value > displayedRange.max);
          pointsOffScaleToLeftIndicator.visible = isPointBelow && numberLine.orientationProperty.value === Orientation.HORIZONTAL;
          pointsOffScaleToRightIndicator.visible = isPointAbove && numberLine.orientationProperty.value === Orientation.HORIZONTAL;
          pointsOffScaleToTopIndicator.visible = isPointAbove && numberLine.orientationProperty.value === Orientation.VERTICAL;
          pointsOffScaleToBottomIndicator.visible = isPointBelow && numberLine.orientationProperty.value === Orientation.VERTICAL;
        }
      };

      // Hook up the listener that will update the points-off-scale indicators.
      Multilink.multilink([numberLine.displayedRangeProperty, numberLine.centerPositionProperty, numberLine.orientationProperty], updatePointsOffScaleIndicators);
      numberLine.residentPoints.addItemAddedListener(addedPoint => {
        addedPoint.valueProperty.link(updatePointsOffScaleIndicators);
      });
      numberLine.residentPoints.addItemRemovedListener(removedPoint => {
        if (removedPoint.valueProperty.hasListener(updatePointsOffScaleIndicators)) {
          updatePointsOffScaleIndicators();
          removedPoint.valueProperty.unlink(updatePointsOffScaleIndicators);
        }
      });
    }
  }

  /**
   * Method to add a tick mark, which consists of a short line and a numerical label, to the provided parent node for
   * the provided value.
   * @param {Node} parentNode
   * @param {number} value
   * @param {boolean} addLabel
   * @private
   */
  addTickMark(parentNode, value, addLabel) {
    // The value for zero is a special case, and uses a longer and thicker tick mark.
    const length = value === 0 ? this.options.zeroTickMarkLength : this.options.tickMarkLength;
    const lineWidth = value === 0 ? this.options.zeroTickMarkLineWidth : this.options.tickMarkLineWidth;
    const tickMarkOptions = {
      stroke: this.options.color,
      lineWidth: lineWidth
    };

    // Calculate the center position of the tick mark, scaled but not translated.
    const tmCenter = this.numberLine.valueToModelPosition(value).minus(this.numberLine.centerPositionProperty.value);

    // create label
    let labelNode;
    if (addLabel) {
      labelNode = StringUtils.fillIn(this.options.numericalLabelTemplate, {
        value: Math.abs(value)
      });
      if (value < 0) {
        labelNode = MathSymbols.UNARY_MINUS + labelNode;
      }
    }
    let tickMark;
    let tickLabelOptions;
    if (this.numberLine.isHorizontal) {
      tickMark = new Line(tmCenter.x, tmCenter.y - length, tmCenter.x, tmCenter.y + length, tickMarkOptions);
      if (this.options.tickMarkLabelPositionWhenHorizontal === 'above') {
        tickLabelOptions = {
          centerX: tickMark.centerX,
          bottom: tickMark.top - TICK_MARK_LABEL_DISTANCE
        };
      } else {
        tickLabelOptions = {
          centerX: tickMark.centerX,
          top: tickMark.bottom + TICK_MARK_LABEL_DISTANCE
        };
      }
    } else {
      tickMark = new Line(tmCenter.x - length, tmCenter.y, tmCenter.x + length, tmCenter.y, tickMarkOptions);
      if (this.options.tickMarkLabelPositionWhenVertical === 'left') {
        tickLabelOptions = {
          right: tickMark.left - 5,
          centerY: tickMark.centerY
        };
      } else {
        tickLabelOptions = {
          left: tickMark.right + 5,
          centerY: tickMark.centerY
        };
      }
    }
    parentNode.addChild(tickMark);
    labelNode && parentNode.addChild(new Text(labelNode, merge(tickLabelOptions, this.options.tickMarkLabelOptions)));
  }

  /**
   * Get a list of the resident points on the number line sorted by value.
   * @returns {NumberLinePoint[]}
   * @private
   */
  getPointsSortedByAbsoluteValue() {
    return _.sortBy(this.numberLine.residentPoints, point => Math.abs(point.valueProperty.value));
  }
}
numberLineCommon.register('SpatializedNumberLineNode', SpatializedNumberLineNode);
export default SpatializedNumberLineNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJtZXJnZSIsIk9yaWVudGF0aW9uIiwiU3RyaW5nVXRpbHMiLCJBcnJvd05vZGUiLCJNYXRoU3ltYm9scyIsIlBoZXRGb250IiwiQ29sb3IiLCJIQm94IiwiTGluZSIsIk5vZGUiLCJSaWNoVGV4dCIsIlRleHQiLCJQYW5lbCIsIm51bWJlckxpbmVDb21tb24iLCJOdW1iZXJMaW5lQ29tbW9uU3RyaW5ncyIsIk5MQ0NvbnN0YW50cyIsIkFic29sdXRlVmFsdWVTcGFuTm9kZSIsIlBvaW50Tm9kZSIsIlBvaW50c09mZlNjYWxlQ29uZGl0aW9uIiwicG9pbnRzT2ZmU2NhbGVTdHJpbmciLCJwb2ludHNPZmZTY2FsZSIsIlRJQ0tfTUFSS19MQUJFTF9ESVNUQU5DRSIsIkFCU09MVVRFX1ZBTFVFX01JTl9MSU5FX1dJRFRIIiwiQUJTT0xVVEVfVkFMVUVfTElORV9FWFBBTlNJT05fRkFDVE9SIiwiQUJTT0xVVEVfVkFMVUVfU1BBTl9OTF9ESVNUQU5DRV9ZIiwiQUJTT0xVVEVfVkFMVUVfU1BBTl9TUEFDSU5HX1kiLCJBQlNPTFVURV9WQUxVRV9TUEFOX05MX0RJU1RBTkNFX1giLCJBQlNPTFVURV9WQUxVRV9TUEFOX1NQQUNJTkdfWCIsIk9GRl9TQ0FMRV9JTkRJQ0FUT1JfRk9OVCIsIkNPTU1PTl9PRkZfU0NBTEVfUEFORUxfT1BUSU9OUyIsImZpbGwiLCJXSElURSIsInN0cm9rZSIsIkJMQUNLIiwiY29ybmVyUmFkaXVzIiwiTEFCRUxfQkFDS0dST1VORF9DT1JORVJfUkFESVVTIiwiT0ZGX1NDQUxFX0hCT1hfU1BBQ0lORyIsIk9GRl9TQ0FMRV9BUlJPV19MRU5HVEgiLCJPRkZfU0NBTEVfQVJST1dfT1BUSU9OUyIsInRhaWxXaWR0aCIsIk9GRl9TQ0FMRV9JTkRJQ0FUT1JfSU5TRVQiLCJPRkZfU0NBTEVfVEVYVF9NQVhfV0lEVEgiLCJnZXRJbmRpY2F0b3JEaXN0YW5jZUZyb21OTCIsIm51bWJlckxpbmUiLCJjb3VudCIsImlzSG9yaXpvbnRhbCIsIlNwYXRpYWxpemVkTnVtYmVyTGluZU5vZGUiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJudW1iZXJMaW5lV2lkdGgiLCJ0aWNrTWFya0xpbmVXaWR0aCIsInRpY2tNYXJrTGVuZ3RoIiwiemVyb1RpY2tNYXJrTGluZVdpZHRoIiwiemVyb1RpY2tNYXJrTGVuZ3RoIiwidGlja01hcmtMYWJlbE9wdGlvbnMiLCJmb250IiwibWF4V2lkdGgiLCJ0aWNrTWFya0xhYmVsUG9zaXRpb25XaGVuVmVydGljYWwiLCJ0aWNrTWFya0xhYmVsUG9zaXRpb25XaGVuSG9yaXpvbnRhbCIsImNvbG9yIiwicG9pbnRSYWRpdXMiLCJudW1lcmljYWxMYWJlbFRlbXBsYXRlIiwic2hvd0Fic29sdXRlVmFsdWVTcGFucyIsImRpc3BsYXllZFJhbmdlSW5zZXQiLCJhcnJvd1NpemUiLCJwb2ludE5vZGVPcHRpb25zIiwidXNlUG9pbnRDb2xvckZvckxhYmVsVGV4dCIsImNvbG9yaXplTGFiZWxCYWNrZ3JvdW5kIiwicG9pbnRzT2ZmU2NhbGVDb25kaXRpb24iLCJORVZFUiIsIm9mZlNjYWxlSW5kaWNhdG9ySG9yaXpvbnRhbE9mZnNldCIsIm9mZlNjYWxlSW5kaWNhdG9yVmVydGljYWxPZmZzZXQiLCJ1bml0c1N0cmluZyIsIl8iLCJjbG9uZURlZXAiLCJudW1iZXJMaW5lTm9kZU9wdGlvbnMiLCJkb3VibGVIZWFkIiwibGluZVdpZHRoIiwiaGVhZEhlaWdodCIsImhlYWRXaWR0aCIsIm51bWJlckxpbmVSb290Tm9kZSIsImFkZENoaWxkIiwibnVtYmVyTGluZU5vZGUiLCJvcmllbnRhdGlvblByb3BlcnR5IiwibGluayIsIm9yaWVudGF0aW9uIiwibWluVmFsdWVQcm9qZWN0ZWQiLCJnZXRTY2FsZWRPZmZzZXRGcm9tWmVybyIsImRpc3BsYXllZFJhbmdlUHJvcGVydHkiLCJ2YWx1ZSIsIm1pbiIsIm1heFZhbHVlUHJvamVjdGVkIiwibWF4IiwicmVtb3ZlQWxsQ2hpbGRyZW4iLCJIT1JJWk9OVEFMIiwiYWRkVGlja01hcmsiLCJlbmRUaWNrTWFya3NSb290Tm9kZSIsIm1pZGRsZVRpY2tNYXJrc1Jvb3ROb2RlIiwic2hvd1RpY2tNYXJrc1Byb3BlcnR5IiwibGlua0F0dHJpYnV0ZSIsImFic29sdXRlVmFsdWVMaW5lTGF5ZXIiLCJzaG93QWJzb2x1dGVWYWx1ZXNQcm9wZXJ0eSIsIm9wcG9zaXRlUG9pbnREaXNwbGF5TGF5ZXIiLCJwb2ludERpc3BsYXlMYXllciIsImFic29sdXRlVmFsdWVMaW5lcyIsInVwZGF0ZUFic29sdXRlVmFsdWVJbmRpY2F0b3JzIiwiZG9BbmltYXRpb24iLCJsZW5ndGgiLCJyZXNpZGVudFBvaW50cyIsImFic29sdXRlVmFsdWVMaW5lIiwicHVzaCIsInBvcCIsInJlbW92ZUNoaWxkIiwicG9pbnRzU29ydGVkQnlWYWx1ZSIsImdldFBvaW50c1NvcnRlZEJ5QWJzb2x1dGVWYWx1ZSIsInBvaW50c0Fib3ZlWmVyb0NvdW50IiwicG9pbnRzQmVsb3daZXJvQ291bnQiLCJ6ZXJvUG9zaXRpb24iLCJjZW50ZXJQb3NpdGlvblByb3BlcnR5IiwiZm9yRWFjaCIsInBvaW50IiwiaW5kZXgiLCJsaW5lT25OdW1iZXJMaW5lIiwicG9pbnRWYWx1ZSIsInZhbHVlUHJvcGVydHkiLCJ2aXNpYmxlIiwic2V0TGluZSIsIngiLCJ5IiwibW92ZVRvQmFjayIsImNvbG9yUHJvcGVydHkiLCJwb2ludFBvc2l0aW9uIiwiZ2V0UG9zaXRpb25Jbk1vZGVsU3BhY2UiLCJzb3J0ZWRBYnNvbHV0ZVZhbHVlU3Bhbk5vZGVzIiwic29ydEJ5IiwiYWJzb2x1dGVWYWx1ZVNwYW5Ob2RlcyIsImFic29sdXRlVmFsdWVTcGFuTm9kZSIsImRpc3RhbmNlRnJvbU51bWJlckxpbmVQcm9wZXJ0eSIsInNldERpc3RhbmNlRnJvbU51bWJlckxpbmUiLCJ1cGRhdGVBYnNvbHV0ZVZhbHVlSW5kaWNhdG9yQ29sb3JzIiwiaGFuZGxlUG9pbnRBZGRlZCIsInBvaW50Tm9kZSIsImxhYmVsVGVtcGxhdGUiLCJvcHBvc2l0ZVBvaW50Tm9kZSIsImlzRG9wcGVsZ2FuZ2VyIiwiYWJzb2x1dGVWYWx1ZVNwYW5Ob2RlRGlzdGFuY2UiLCJyZW1vdmVJdGVtTGlzdGVuZXIiLCJyZW1vdmVkUG9pbnQiLCJkaXNwb3NlIiwid2l0aG91dCIsInVubGluayIsInJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJ1bml0c1RleHQiLCJtdWx0aWxpbmsiLCJkaXNwbGF5ZWRSYW5nZSIsImFzc2VydCIsIlZFUlRJQ0FMIiwidGlja01hcmtTcGFjaW5nIiwiZ2V0TGVuZ3RoIiwidGlja01hcmtMYWJlbFNwYWNpbmciLCJtaW5UaWNrTWFya1ZhbHVlIiwibWF4VGlja01hcmtWYWx1ZSIsInRtVmFsdWUiLCJwb3NpdGlvbk9mTGFzdFZhbHVlIiwidmFsdWVUb01vZGVsUG9zaXRpb24iLCJsZWZ0IiwidG9wIiwicG9zaXRpb25PZkZpcnN0VmFsdWUiLCJjZW50ZXJQb3NpdGlvbiIsInRyYW5zbGF0aW9uIiwib2ZmU2NhbGVUb1JpZ2h0VGV4dCIsImFsaWduIiwib2ZmU2NhbGVUb1JpZ2h0QXJyb3ciLCJwb2ludHNPZmZTY2FsZVRvUmlnaHRJbmRpY2F0b3IiLCJjaGlsZHJlbiIsInNwYWNpbmciLCJvZmZTY2FsZVRvTGVmdFRleHQiLCJvZmZTY2FsZVRvTGVmdEFycm93IiwicG9pbnRzT2ZmU2NhbGVUb0xlZnRJbmRpY2F0b3IiLCJvZmZTY2FsZVRvVG9wVGV4dCIsIm9mZlNjYWxlVG9Ub3BBcnJvdyIsInBvaW50c09mZlNjYWxlVG9Ub3BJbmRpY2F0b3IiLCJvZmZTY2FsZVRvQm90dG9tVGV4dCIsIm9mZlNjYWxlVG9Cb3R0b21BcnJvdyIsInBvaW50c09mZlNjYWxlVG9Cb3R0b21JbmRpY2F0b3IiLCJ1cGRhdGVQb2ludHNPZmZTY2FsZUluZGljYXRvcnMiLCJjZW50ZXJZIiwicmlnaHQiLCJjZW50ZXJYIiwiYm90dG9tIiwiQUxMIiwiYXJlQWxsUG9pbnRzQmVsb3ciLCJzb21lIiwiYXJlQWxsUG9pbnRzQWJvdmUiLCJpc1BvaW50QmVsb3ciLCJpc1BvaW50QWJvdmUiLCJhZGRlZFBvaW50IiwiaGFzTGlzdGVuZXIiLCJwYXJlbnROb2RlIiwiYWRkTGFiZWwiLCJ0aWNrTWFya09wdGlvbnMiLCJ0bUNlbnRlciIsIm1pbnVzIiwibGFiZWxOb2RlIiwiZmlsbEluIiwiTWF0aCIsImFicyIsIlVOQVJZX01JTlVTIiwidGlja01hcmsiLCJ0aWNrTGFiZWxPcHRpb25zIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTcGF0aWFsaXplZE51bWJlckxpbmVOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNwYXRpYWxpemVkTnVtYmVyTGluZU5vZGUgaXMgYSBTY2VuZXJ5IE5vZGUgdGhhdCBwcmVzZW50cyBhIG51bWJlciBsaW5lIHRoYXQgaXMgbWFwcGVkIGludG8gMkQgc3BhY2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIEhCb3gsIExpbmUsIE5vZGUsIFJpY2hUZXh0LCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBudW1iZXJMaW5lQ29tbW9uIGZyb20gJy4uLy4uL251bWJlckxpbmVDb21tb24uanMnO1xyXG5pbXBvcnQgTnVtYmVyTGluZUNvbW1vblN0cmluZ3MgZnJvbSAnLi4vLi4vTnVtYmVyTGluZUNvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgTkxDQ29uc3RhbnRzIGZyb20gJy4uL05MQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBBYnNvbHV0ZVZhbHVlU3Bhbk5vZGUgZnJvbSAnLi9BYnNvbHV0ZVZhbHVlU3Bhbk5vZGUuanMnO1xyXG5pbXBvcnQgUG9pbnROb2RlIGZyb20gJy4vUG9pbnROb2RlLmpzJztcclxuaW1wb3J0IFBvaW50c09mZlNjYWxlQ29uZGl0aW9uIGZyb20gJy4vUG9pbnRzT2ZmU2NhbGVDb25kaXRpb24uanMnO1xyXG5cclxuY29uc3QgcG9pbnRzT2ZmU2NhbGVTdHJpbmcgPSBOdW1iZXJMaW5lQ29tbW9uU3RyaW5ncy5wb2ludHNPZmZTY2FsZTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBUSUNLX01BUktfTEFCRUxfRElTVEFOQ0UgPSA1O1xyXG5jb25zdCBBQlNPTFVURV9WQUxVRV9NSU5fTElORV9XSURUSCA9IDI7XHJcbmNvbnN0IEFCU09MVVRFX1ZBTFVFX0xJTkVfRVhQQU5TSU9OX0ZBQ1RPUiA9IDM7XHJcbmNvbnN0IEFCU09MVVRFX1ZBTFVFX1NQQU5fTkxfRElTVEFOQ0VfWSA9IDU1O1xyXG5jb25zdCBBQlNPTFVURV9WQUxVRV9TUEFOX1NQQUNJTkdfWSA9IDQwO1xyXG5jb25zdCBBQlNPTFVURV9WQUxVRV9TUEFOX05MX0RJU1RBTkNFX1ggPSAxMDU7XHJcbmNvbnN0IEFCU09MVVRFX1ZBTFVFX1NQQU5fU1BBQ0lOR19YID0gOTU7XHJcbmNvbnN0IE9GRl9TQ0FMRV9JTkRJQ0FUT1JfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTQgKTtcclxuY29uc3QgQ09NTU9OX09GRl9TQ0FMRV9QQU5FTF9PUFRJT05TID0ge1xyXG4gIGZpbGw6IENvbG9yLldISVRFLFxyXG4gIHN0cm9rZTogQ29sb3IuQkxBQ0ssXHJcbiAgY29ybmVyUmFkaXVzOiBOTENDb25zdGFudHMuTEFCRUxfQkFDS0dST1VORF9DT1JORVJfUkFESVVTXHJcbn07XHJcbmNvbnN0IE9GRl9TQ0FMRV9IQk9YX1NQQUNJTkcgPSA1O1xyXG5jb25zdCBPRkZfU0NBTEVfQVJST1dfTEVOR1RIID0gMjU7XHJcbmNvbnN0IE9GRl9TQ0FMRV9BUlJPV19PUFRJT05TID0ge1xyXG4gIHRhaWxXaWR0aDogMlxyXG59O1xyXG5jb25zdCBPRkZfU0NBTEVfSU5ESUNBVE9SX0lOU0VUID0gMjU7XHJcbmNvbnN0IE9GRl9TQ0FMRV9URVhUX01BWF9XSURUSCA9IDEwMDtcclxuXHJcbi8vIGNvbnZlbmllbmNlIGZ1bmN0aW9uIHRvIGNhbGN1bGF0ZSBkaXN0YW5jZSBvZiBhbiBhYnNvbHV0ZSB2YWx1ZSBzcGFuIG5vZGUgZnJvbSB0aGUgbnVtYmVyIGxpbmVcclxuY29uc3QgZ2V0SW5kaWNhdG9yRGlzdGFuY2VGcm9tTkwgPSAoIG51bWJlckxpbmUsIGNvdW50ICkgPT4ge1xyXG4gIHJldHVybiBudW1iZXJMaW5lLmlzSG9yaXpvbnRhbCA/XHJcbiAgICAgICAgIEFCU09MVVRFX1ZBTFVFX1NQQU5fTkxfRElTVEFOQ0VfWSArIGNvdW50ICogQUJTT0xVVEVfVkFMVUVfU1BBTl9TUEFDSU5HX1kgOlxyXG4gICAgICAgICBBQlNPTFVURV9WQUxVRV9TUEFOX05MX0RJU1RBTkNFX1ggKyBjb3VudCAqIEFCU09MVVRFX1ZBTFVFX1NQQU5fU1BBQ0lOR19YO1xyXG59O1xyXG5cclxuY2xhc3MgU3BhdGlhbGl6ZWROdW1iZXJMaW5lTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiB7TnVtYmVyTGluZX0gbnVtYmVyTGluZSAtIG1vZGVsIG9mIGEgbnVtYmVyIGxpbmVcclxuICAgKiB7T2JqZWN0fSBbb3B0aW9uc10gLSBPcHRpb25zIHRoYXQgY29udHJvbCB0aGUgYXBwZWFyYW5jZSBvZiB0aGUgbnVtYmVyIGxpbmUuICBUaGVzZSBhcmUgc3BlY2lmaWMgdG8gdGhpcyBjbGFzcywgYW5kXHJcbiAgICogYXJlIG5vdCBwcm9wYWdhdGVkIHRvIHRoZSBzdXBlcmNsYXNzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbnVtYmVyTGluZSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIG51bWJlckxpbmVXaWR0aDogMSxcclxuICAgICAgdGlja01hcmtMaW5lV2lkdGg6IDEsXHJcbiAgICAgIHRpY2tNYXJrTGVuZ3RoOiAxMCxcclxuICAgICAgemVyb1RpY2tNYXJrTGluZVdpZHRoOiAyLFxyXG4gICAgICB6ZXJvVGlja01hcmtMZW5ndGg6IDE2LFxyXG4gICAgICB0aWNrTWFya0xhYmVsT3B0aW9uczogeyBmb250OiBuZXcgUGhldEZvbnQoIDE2ICksIG1heFdpZHRoOiA3NSB9LFxyXG4gICAgICB0aWNrTWFya0xhYmVsUG9zaXRpb25XaGVuVmVydGljYWw6ICdyaWdodCcsIC8vIHZhbGlkIHZhbHVlcyBhcmUgJ3JpZ2h0JyBhbmQgJ2xlZnQnXHJcbiAgICAgIHRpY2tNYXJrTGFiZWxQb3NpdGlvbldoZW5Ib3Jpem9udGFsOiAnYmVsb3cnLCAvLyB2YWxpZCB2YWx1ZXMgYXJlICdhYm92ZScgYW5kICdiZWxvdydcclxuICAgICAgY29sb3I6ICdibGFjaycsXHJcbiAgICAgIHBvaW50UmFkaXVzOiAxMCxcclxuICAgICAgbnVtZXJpY2FsTGFiZWxUZW1wbGF0ZTogJ3t7dmFsdWV9fScsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBjb250cm9scyB3aGV0aGVyIHRoZSBhYnNvbHV0ZSB2YWx1ZSBzcGFuIGluZGljYXRvcnMsIHdoaWNoIGFyZSBhIGxpdHRsZSB3YXlzIGF3YXkgZnJvbSB0aGUgbnVtYmVyXHJcbiAgICAgIC8vIGxpbmUgaXRzZWxmLCBhcmUgcG9ydHJheWVkXHJcbiAgICAgIHNob3dBYnNvbHV0ZVZhbHVlU3BhbnM6IGZhbHNlLFxyXG5cclxuICAgICAgLy8ge251bWJlcn0gLSB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgZWRnZSBvZiB0aGUgZGlzcGxheSBib3VuZHMgYW5kIHRoZSBlbmRzIG9mIHRoZSBkaXNwbGF5ZWQgcmFuZ2UsIGluIG1vZGVsXHJcbiAgICAgIC8vIGNvb3JkaW5hdGVzXHJcbiAgICAgIGRpc3BsYXllZFJhbmdlSW5zZXQ6IDI1LFxyXG5cclxuICAgICAgLy8ge251bWJlcn0gLSB0aGUgd2lkdGggYW5kIHRoZSBoZWlnaHQgb2YgdGhlIGFycm93cyBhdCB0aGUgZW5kcG9pbnRzIG9mIHRoZSBudW1iZXIgbGluZVxyXG4gICAgICBhcnJvd1NpemU6IDEwLFxyXG5cclxuICAgICAgLy8gb3B0aW9ucyBmb3IgdGhlIHBvaW50IG5vZGVzXHJcbiAgICAgIHBvaW50Tm9kZU9wdGlvbnM6IHtcclxuICAgICAgICB1c2VQb2ludENvbG9yRm9yTGFiZWxUZXh0OiB0cnVlLFxyXG4gICAgICAgIGNvbG9yaXplTGFiZWxCYWNrZ3JvdW5kOiBmYWxzZVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8ge1BvaW50c09mZlNjYWxlQ29uZGl0aW9ufSB3aGVuIHRvIHNob3cgdGhlIHBvaW50cyBvZmYgc2NhbGUgaW5kaWNhdG9yXHJcbiAgICAgIHBvaW50c09mZlNjYWxlQ29uZGl0aW9uOiBQb2ludHNPZmZTY2FsZUNvbmRpdGlvbi5ORVZFUixcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gaG93IGZhciBvZmYgZnJvbSB0aGUgbnVtYmVyIGxpbmUgdGhlIG9mZiBzY2FsZSBpbmRpY2F0b3IgaXNcclxuICAgICAgLy8gYSBuZWdhdGl2ZSBudW1iZXIgd2lsbCBnbyBiZWxvdyBvciB0byB0aGUgbGVmdCBvZiB0aGUgbnVtYmVyIGxpbmVcclxuICAgICAgLy8gaG9yaXpvbnRhbCBvZmZzZXQgYXBwbGllcyB3aGVuIHRoZSBudW1iZXJsaW5lIGlzIHZlcnRpY2FsIChiZWNhdXNlIHRoZSBvZmZzZXQgaXMgaG9yaXpvbnRhbCkgYW5kIHZpY2UtdmVyc2FcclxuICAgICAgb2ZmU2NhbGVJbmRpY2F0b3JIb3Jpem9udGFsT2Zmc2V0OiA1MCxcclxuICAgICAgb2ZmU2NhbGVJbmRpY2F0b3JWZXJ0aWNhbE9mZnNldDogNTAsXHJcblxyXG4gICAgICAvLyB7c3RyaW5nfSBhIHN0cmluZyB0aGF0IHJlcHJlc2VudHMgdGhlIHVuaXRzIG9mIHRoZSBudW1iZXIgbGluZVxyXG4gICAgICB1bml0c1N0cmluZzogJydcclxuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gU2luY2UgdGhlIHBvc2l0aW9uIGlzIHNldCBiYXNlZCBvbiB0aGUgbW9kZWwsIGRvbid0IHBhc3Mgb3B0aW9ucyB0aHJvdWdoIHRvIHBhcmVudCBjbGFzcy5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZG9ubHkpIHtPYmplY3R9IC0gbWFrZSBvcHRpb25zIHZpc2libGUgdG8gbWV0aG9kc1xyXG4gICAgdGhpcy5vcHRpb25zID0gXy5jbG9uZURlZXAoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7TnVtYmVyTGluZX0gLSBtYWtlIHRoZSBudW1iZXIgbGluZSBtb2RlbCBhdmFpbGFibGUgdG8gbWV0aG9kc1xyXG4gICAgdGhpcy5udW1iZXJMaW5lID0gbnVtYmVyTGluZTtcclxuXHJcbiAgICAvLyBBc3NlbWJsZSB0aGUgb3B0aW9ucyB0aGF0IGNvbnRyb2wgdGhlIGFwcGVhcmFuY2Ugb2YgdGhlIG1haW4gbnVtYmVyIGludG8gb25lIHBsYWNlLlxyXG4gICAgY29uc3QgbnVtYmVyTGluZU5vZGVPcHRpb25zID0ge1xyXG4gICAgICBkb3VibGVIZWFkOiB0cnVlLFxyXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMubnVtYmVyTGluZVdpZHRoLFxyXG4gICAgICB0YWlsV2lkdGg6IG9wdGlvbnMubnVtYmVyTGluZVdpZHRoLFxyXG4gICAgICBoZWFkSGVpZ2h0OiBvcHRpb25zLmFycm93U2l6ZSxcclxuICAgICAgaGVhZFdpZHRoOiBvcHRpb25zLmFycm93U2l6ZSxcclxuICAgICAgc3Ryb2tlOiBvcHRpb25zLmNvbG9yLFxyXG4gICAgICBmaWxsOiBvcHRpb25zLmNvbG9yXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgbGF5ZXIgd2hlcmUgZXZlcnl0aGluZyB0aGF0IG1vdmVzIGlmIHRoZSBudW1iZXIgbGluZSdzIGNlbnRlciBwb3NpdGlvbiBjaGFuZ2VzIHdpbGwgcmVzaWRlLiAgVGhpc1xyXG4gICAgLy8gd2lsbCBiZSB0aGUgcGFyZW50IG5vZGUgZm9yIG1vc3Qgc3ViLW5vZGVzLCBidXQgd2lsbCBleGNsdWRlIHRoaW5ncyBsaWtlIHBvaW50cywgd2hpY2ggYXJlIHJlc3BvbnNpYmxlIGZvclxyXG4gICAgLy8gcG9zaXRpb25pbmcgdGhlbXNlbHZlcyBpbiBzcGFjZS4gIEV2ZXJ5dGhpbmcgb24gdGhpcyBub2RlIHdpbGwgYmUgYWRkZWQgYXMgdGhvdWdoIHRoZSBudW1iZXIgbGluZSBpcyBjZW50ZXJlZCBhdFxyXG4gICAgLy8gdGhlIGxvY2FsIHBvaW50ICgwLDApLCBhbmQgdGhlbiBpdCB3aWxsIGJlIHRyYW5zbGF0ZWQgaW50byB0aGUgcmlnaHQgcG9zaXRpb24uXHJcbiAgICBjb25zdCBudW1iZXJMaW5lUm9vdE5vZGUgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbnVtYmVyTGluZVJvb3ROb2RlICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBudW1iZXIgbGluZSwgYW5kIHVwZGF0ZSBpdCBpZiB0aGUgb3JpZW50YXRpb24gY2hhbmdlcy5cclxuICAgIGNvbnN0IG51bWJlckxpbmVOb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIG51bWJlckxpbmVSb290Tm9kZS5hZGRDaGlsZCggbnVtYmVyTGluZU5vZGUgKTtcclxuICAgIG51bWJlckxpbmUub3JpZW50YXRpb25Qcm9wZXJ0eS5saW5rKCBvcmllbnRhdGlvbiA9PiB7XHJcblxyXG4gICAgICBjb25zdCBtaW5WYWx1ZVByb2plY3RlZCA9IG51bWJlckxpbmUuZ2V0U2NhbGVkT2Zmc2V0RnJvbVplcm8oIG51bWJlckxpbmUuZGlzcGxheWVkUmFuZ2VQcm9wZXJ0eS52YWx1ZS5taW4gKTtcclxuICAgICAgY29uc3QgbWF4VmFsdWVQcm9qZWN0ZWQgPSBudW1iZXJMaW5lLmdldFNjYWxlZE9mZnNldEZyb21aZXJvKCBudW1iZXJMaW5lLmRpc3BsYXllZFJhbmdlUHJvcGVydHkudmFsdWUubWF4ICk7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgdGhlIHByZXZpb3VzIHJlcHJlc2VudGF0aW9uLlxyXG4gICAgICBudW1iZXJMaW5lTm9kZS5yZW1vdmVBbGxDaGlsZHJlbigpO1xyXG5cclxuICAgICAgaWYgKCBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCApIHtcclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSBhcnJvdyBub2RlIHRoYXQgcmVwcmVzZW50cyB0aGUgbnVtYmVyIGxpbmUuXHJcbiAgICAgICAgbnVtYmVyTGluZU5vZGUuYWRkQ2hpbGQoIG5ldyBBcnJvd05vZGUoXHJcbiAgICAgICAgICBtaW5WYWx1ZVByb2plY3RlZCAtIG9wdGlvbnMuZGlzcGxheWVkUmFuZ2VJbnNldCxcclxuICAgICAgICAgIDAsXHJcbiAgICAgICAgICBtYXhWYWx1ZVByb2plY3RlZCArIG9wdGlvbnMuZGlzcGxheWVkUmFuZ2VJbnNldCxcclxuICAgICAgICAgIDAsXHJcbiAgICAgICAgICBudW1iZXJMaW5lTm9kZU9wdGlvbnNcclxuICAgICAgICApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGUgYXJyb3cgbm9kZSB0aGF0IHJlcHJlc2VudHMgdGhlIG51bWJlciBsaW5lLlxyXG4gICAgICAgIG51bWJlckxpbmVOb2RlLmFkZENoaWxkKCBuZXcgQXJyb3dOb2RlKFxyXG4gICAgICAgICAgMCxcclxuICAgICAgICAgIG1heFZhbHVlUHJvamVjdGVkIC0gb3B0aW9ucy5kaXNwbGF5ZWRSYW5nZUluc2V0LFxyXG4gICAgICAgICAgMCxcclxuICAgICAgICAgIG1pblZhbHVlUHJvamVjdGVkICsgb3B0aW9ucy5kaXNwbGF5ZWRSYW5nZUluc2V0LFxyXG4gICAgICAgICAgbnVtYmVyTGluZU5vZGVPcHRpb25zXHJcbiAgICAgICAgKSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIHRpY2sgbWFyayBmb3IgdGhlIDAgcG9zaXRpb24sIHdoaWNoIGlzIGFsd2F5cyB2aXNpYmxlLlxyXG4gICAgICB0aGlzLmFkZFRpY2tNYXJrKCBudW1iZXJMaW5lTm9kZSwgMCwgdHJ1ZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgdGljayBtYXJrcyBhdCB0aGUgZW5kcyBvZiB0aGUgZGlzcGxheSByYW5nZS5cclxuICAgIGNvbnN0IGVuZFRpY2tNYXJrc1Jvb3ROb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIG51bWJlckxpbmVSb290Tm9kZS5hZGRDaGlsZCggZW5kVGlja01hcmtzUm9vdE5vZGUgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHJvb3Qgbm9kZSBmb3IgdGhlIHRpY2sgbWFya3MgdGhhdCBleGlzdCBiZXR3ZWVuIHRoZSBtaWRkbGUgYW5kIHRoZSBlbmQuXHJcbiAgICBjb25zdCBtaWRkbGVUaWNrTWFya3NSb290Tm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgICBudW1iZXJMaW5lLnNob3dUaWNrTWFya3NQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBtaWRkbGVUaWNrTWFya3NSb290Tm9kZSwgJ3Zpc2libGUnICk7XHJcbiAgICBudW1iZXJMaW5lUm9vdE5vZGUuYWRkQ2hpbGQoIG1pZGRsZVRpY2tNYXJrc1Jvb3ROb2RlICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBsYXllciB3aGVyZSB0aGUgbGluZXMgdGhhdCBhcmUgdXNlZCB0byBpbmRpY2F0ZSB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgYSBwb2ludCB3aWxsIGJlIGRpc3BsYXllZC5cclxuICAgIGNvbnN0IGFic29sdXRlVmFsdWVMaW5lTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYWJzb2x1dGVWYWx1ZUxpbmVMYXllciApO1xyXG4gICAgbnVtYmVyTGluZS5zaG93QWJzb2x1dGVWYWx1ZXNQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBhYnNvbHV0ZVZhbHVlTGluZUxheWVyLCAndmlzaWJsZScgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGxheWVyIHdoZXJlIG9wcG9zaXRlIHBvaW50cyBvbiB0aGUgbnVtYmVyIGxpbmUgd2lsbCBiZSBkaXNwbGF5ZWQuXHJcbiAgICBjb25zdCBvcHBvc2l0ZVBvaW50RGlzcGxheUxheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG9wcG9zaXRlUG9pbnREaXNwbGF5TGF5ZXIgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGxheWVyIHdoZXJlIHRoZSBub3JtYWwgKG5vbi1vcHBvc2l0ZSkgcG9pbnRzIG9uIHRoZSBudW1iZXIgbGluZSB3aWxsIGJlIGRpc3BsYXllZC5cclxuICAgIGNvbnN0IHBvaW50RGlzcGxheUxheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBvaW50RGlzcGxheUxheWVyICk7XHJcblxyXG4gICAgLy8gY2xvc3VyZSB0aGF0IHVwZGF0ZXMgdGhlIGFic29sdXRlIHZhbHVlIGluZGljYXRvcnNcclxuICAgIGNvbnN0IGFic29sdXRlVmFsdWVMaW5lcyA9IFtdOyAvLyB7TGluZVtdfVxyXG4gICAgY29uc3QgdXBkYXRlQWJzb2x1dGVWYWx1ZUluZGljYXRvcnMgPSAoIGRvQW5pbWF0aW9uID0gZmFsc2UgKSA9PiB7XHJcblxyXG4gICAgICAvLyBJZiB0aGVyZSBhcmVuJ3QgZW5vdWdoIGFic29sdXRlIHZhbHVlIGluZGljYXRvciBsaW5lcyBhdmFpbGFibGUsIGFkZCBuZXcgb25lcyB1bnRpbCB0aGVyZSBhcmUgZW5vdWdoLlxyXG4gICAgICB3aGlsZSAoIGFic29sdXRlVmFsdWVMaW5lcy5sZW5ndGggPCBudW1iZXJMaW5lLnJlc2lkZW50UG9pbnRzLmxlbmd0aCApIHtcclxuICAgICAgICBjb25zdCBhYnNvbHV0ZVZhbHVlTGluZSA9IG5ldyBMaW5lKCAwLCAwLCAxLCAxICk7IC8vIHBvc2l0aW9uIGFuZCBzaXplIGFyZSBhcmJpdHJhcnksIHdpbGwgYmUgdXBkYXRlZCBiZWxvd1xyXG4gICAgICAgIGFic29sdXRlVmFsdWVMaW5lcy5wdXNoKCBhYnNvbHV0ZVZhbHVlTGluZSApO1xyXG4gICAgICAgIGFic29sdXRlVmFsdWVMaW5lTGF5ZXIuYWRkQ2hpbGQoIGFic29sdXRlVmFsdWVMaW5lICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIHRoZXJlIGFyZSB0b28gbWFueSBhYnNvbHV0ZSB2YWx1ZSBpbmRpY2F0b3IgbGluZXMsIHJlbW92ZSB0aGVtIHVudGlsIHdlIGhhdmUgdGhlIHJpZ2h0IGFtb3VudC5cclxuICAgICAgd2hpbGUgKCBhYnNvbHV0ZVZhbHVlTGluZXMubGVuZ3RoID4gbnVtYmVyTGluZS5yZXNpZGVudFBvaW50cy5sZW5ndGggKSB7XHJcbiAgICAgICAgY29uc3QgYWJzb2x1dGVWYWx1ZUxpbmUgPSBhYnNvbHV0ZVZhbHVlTGluZXMucG9wKCk7XHJcbiAgICAgICAgYWJzb2x1dGVWYWx1ZUxpbmVMYXllci5yZW1vdmVDaGlsZCggYWJzb2x1dGVWYWx1ZUxpbmUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ3JlYXRlIGEgbGlzdCBvZiB0aGUgcmVzaWRlbnQgcG9pbnRzIG9uIHRoZSBudW1iZXIgbGluZSBzb3J0ZWQgYnkgYWJzb2x1dGUgdmFsdWUuXHJcbiAgICAgIGNvbnN0IHBvaW50c1NvcnRlZEJ5VmFsdWUgPSB0aGlzLmdldFBvaW50c1NvcnRlZEJ5QWJzb2x1dGVWYWx1ZSgpO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIHRoZSBwb3NpdGlvbiwgY29sb3IsIHRoaWNrbmVzcywgYW5kIGxheWVyaW5nIG9mIGVhY2ggb2YgdGhlIGxpbmVzIGFuZCB0aGUgc3BhY2luZyBvZiB0aGUgc3BhbnMuXHJcbiAgICAgIGxldCBwb2ludHNBYm92ZVplcm9Db3VudCA9IDA7XHJcbiAgICAgIGxldCBwb2ludHNCZWxvd1plcm9Db3VudCA9IDA7XHJcbiAgICAgIGNvbnN0IHplcm9Qb3NpdGlvbiA9IG51bWJlckxpbmUuY2VudGVyUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgcG9pbnRzU29ydGVkQnlWYWx1ZS5mb3JFYWNoKCAoIHBvaW50LCBpbmRleCApID0+IHtcclxuXHJcbiAgICAgICAgLy8gR2V0IGEgbGluZSB0aGF0IHdpbGwgZGlzcGxheSB0aGUgYWJzb2x1dGUgdmFsdWUgb24gdGhlIG51bWJlciBsaW5lIGl0c2VsZi5cclxuICAgICAgICBjb25zdCBsaW5lT25OdW1iZXJMaW5lID0gYWJzb2x1dGVWYWx1ZUxpbmVzWyBpbmRleCBdO1xyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIHNwYW4gaW5kaWNhdG9yIHRoYXQgaXMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgcG9pbnQuXHJcbiAgICAgICAgY29uc3QgcG9pbnRWYWx1ZSA9IHBvaW50LnZhbHVlUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgaWYgKCBwb2ludFZhbHVlID09PSAwICkge1xyXG5cclxuICAgICAgICAgIC8vIEhpZGUgdGhlIGxpbmUgZW50aXJlbHkgaW4gdGhpcyBjYXNlLCBhbmQgcG9zaXRpb24gaXQgc28gdGhhdCBpdCBkb2Vzbid0IG1lc3Mgd2l0aCB0aGUgb3ZlcmFsbCBib3VuZHMuXHJcbiAgICAgICAgICBsaW5lT25OdW1iZXJMaW5lLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgIGxpbmVPbk51bWJlckxpbmUuc2V0TGluZSggemVyb1Bvc2l0aW9uLngsIHplcm9Qb3NpdGlvbi55LCB6ZXJvUG9zaXRpb24ueCwgemVyb1Bvc2l0aW9uLnkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBsaW5lT25OdW1iZXJMaW5lLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgbGluZU9uTnVtYmVyTGluZS5tb3ZlVG9CYWNrKCk7IC8vIHRoZSBsYXN0IGxpbmUgcHJvY2Vzc2VkIHdpbGwgZW5kIHVwIGF0IHRoZSBiYWNrIG9mIHRoZSBsYXllcmluZ1xyXG4gICAgICAgICAgbGluZU9uTnVtYmVyTGluZS5zdHJva2UgPSBwb2ludC5jb2xvclByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgICAgY29uc3QgcG9pbnRQb3NpdGlvbiA9IHBvaW50LmdldFBvc2l0aW9uSW5Nb2RlbFNwYWNlKCk7XHJcbiAgICAgICAgICBsaW5lT25OdW1iZXJMaW5lLnNldExpbmUoIHplcm9Qb3NpdGlvbi54LCB6ZXJvUG9zaXRpb24ueSwgcG9pbnRQb3NpdGlvbi54LCBwb2ludFBvc2l0aW9uLnkgKTtcclxuICAgICAgICAgIGlmICggcG9pbnRWYWx1ZSA+IDAgKSB7XHJcbiAgICAgICAgICAgIHBvaW50c0Fib3ZlWmVyb0NvdW50Kys7XHJcbiAgICAgICAgICAgIGxpbmVPbk51bWJlckxpbmUubGluZVdpZHRoID0gQUJTT0xVVEVfVkFMVUVfTUlOX0xJTkVfV0lEVEggKyBwb2ludHNBYm92ZVplcm9Db3VudCAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQUJTT0xVVEVfVkFMVUVfTElORV9FWFBBTlNJT05fRkFDVE9SO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHBvaW50c0JlbG93WmVyb0NvdW50Kys7XHJcbiAgICAgICAgICAgIGxpbmVPbk51bWJlckxpbmUubGluZVdpZHRoID0gQUJTT0xVVEVfVkFMVUVfTUlOX0xJTkVfV0lEVEggKyBwb2ludHNCZWxvd1plcm9Db3VudCAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQUJTT0xVVEVfVkFMVUVfTElORV9FWFBBTlNJT05fRkFDVE9SO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIGEgbGlzdCBvZiB0aGUgYWJzb2x1dGUgdmFsdWUgc3BhbiBpbmRpY2F0b3JzIHNvcnRlZCBieSB0aGVpciBkaXN0YW5jZSBmcm9tIHRoZSBudW1iZXIgbGluZS5cclxuICAgICAgY29uc3Qgc29ydGVkQWJzb2x1dGVWYWx1ZVNwYW5Ob2RlcyA9IF8uc29ydEJ5KCBhYnNvbHV0ZVZhbHVlU3Bhbk5vZGVzLCBhYnNvbHV0ZVZhbHVlU3Bhbk5vZGUgPT4ge1xyXG4gICAgICAgIHJldHVybiBhYnNvbHV0ZVZhbHVlU3Bhbk5vZGUuZGlzdGFuY2VGcm9tTnVtYmVyTGluZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBNYWtlIHN1cmUgdGhlIGFic29sdXRlIHZhbHVlIHNwYW4gaW5kaWNhdG9ycyBhcmUgYXQgdGhlIGNvcnJlY3QgZGlzdGFuY2VzIC0gdGhpcyBpcyBtb3N0bHkgZG9uZSB0byBoYW5kbGVcclxuICAgICAgLy8gY2hhbmdlcyBpbiB0aGUgbnVtYmVyIGxpbmUgb3JpZW50YXRpb24uXHJcbiAgICAgIHNvcnRlZEFic29sdXRlVmFsdWVTcGFuTm9kZXMuZm9yRWFjaCggKCBhYnNvbHV0ZVZhbHVlU3Bhbk5vZGUsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgIGFic29sdXRlVmFsdWVTcGFuTm9kZS5zZXREaXN0YW5jZUZyb21OdW1iZXJMaW5lKFxyXG4gICAgICAgICAgZ2V0SW5kaWNhdG9yRGlzdGFuY2VGcm9tTkwoIG51bWJlckxpbmUsIGluZGV4ICksXHJcbiAgICAgICAgICBkb0FuaW1hdGlvblxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBjb2xvciBvZiB0aGUgbGluZXMgc2VwYXJhdGVseSB0byBhdm9pZCByYWNlIGNvbmRpdGlvbnMgYmV0d2VlbiBwb2ludCB2YWx1ZSBhbmQgY29sb3IuXHJcbiAgICBjb25zdCB1cGRhdGVBYnNvbHV0ZVZhbHVlSW5kaWNhdG9yQ29sb3JzID0gKCkgPT4ge1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIGEgbGlzdCBvZiB0aGUgcmVzaWRlbnQgcG9pbnRzIG9uIHRoZSBudW1iZXIgbGluZSBzb3J0ZWQgYnkgYWJzb2x1dGUgdmFsdWUuXHJcbiAgICAgIGNvbnN0IHBvaW50c1NvcnRlZEJ5VmFsdWUgPSB0aGlzLmdldFBvaW50c1NvcnRlZEJ5QWJzb2x1dGVWYWx1ZSgpO1xyXG5cclxuICAgICAgcG9pbnRzU29ydGVkQnlWYWx1ZS5mb3JFYWNoKCAoIHBvaW50LCBpbmRleCApID0+IHtcclxuXHJcbiAgICAgICAgLy8gR2V0IGEgbGluZSB0aGF0IHdpbGwgZGlzcGxheSB0aGUgYWJzb2x1dGUgdmFsdWUgb24gdGhlIG51bWJlciBsaW5lIGl0c2VsZi5cclxuICAgICAgICBjb25zdCBsaW5lT25OdW1iZXJMaW5lID0gYWJzb2x1dGVWYWx1ZUxpbmVzWyBpbmRleCBdO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgY29sb3Igb2YgbGluZSBpZiBpdCBleGlzdHMuXHJcbiAgICAgICAgaWYgKCBwb2ludC52YWx1ZVByb3BlcnR5LnZhbHVlICE9PSAwICkge1xyXG4gICAgICAgICAgbGluZU9uTnVtYmVyTGluZS5zdHJva2UgPSBwb2ludC5jb2xvclByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyB7QWJzb2x1dGVWYWx1ZVNwYW5Ob2RlW119IGFycmF5IHdoZXJlIGFic29sdXRlIHZhbHVlIHNwYW4gbm9kZXMgYXJlIHRyYWNrZWQgaWYgZGlzcGxheWVkIGZvciB0aGlzIG51bWJlciBsaW5lIG5vZGVcclxuICAgIGxldCBhYnNvbHV0ZVZhbHVlU3Bhbk5vZGVzID0gW107XHJcblxyXG4gICAgLy8gaGFuZGxlciBmb3IgbnVtYmVyIGxpbmUgcG9pbnRzIHRoYXQgYXJlIGFkZGVkIHRvIHRoZSBudW1iZXIgbGluZVxyXG4gICAgY29uc3QgaGFuZGxlUG9pbnRBZGRlZCA9IHBvaW50ID0+IHtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgbm9kZSB0aGF0IHdpbGwgcmVwcmVzZW50IHRoZSBwb2ludCBvbiB0aGUgbnVtYmVyIGxpbmUuXHJcbiAgICAgIGNvbnN0IHBvaW50Tm9kZSA9IG5ldyBQb2ludE5vZGUoIHBvaW50LCBudW1iZXJMaW5lLCBtZXJnZSgge1xyXG4gICAgICAgIGxhYmVsVGVtcGxhdGU6IG9wdGlvbnMubnVtZXJpY2FsTGFiZWxUZW1wbGF0ZVxyXG4gICAgICB9LCBvcHRpb25zLnBvaW50Tm9kZU9wdGlvbnMgKSApO1xyXG4gICAgICBwb2ludERpc3BsYXlMYXllci5hZGRDaGlsZCggcG9pbnROb2RlICk7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIHBvaW50IHRoYXQgd2lsbCByZXByZXNlbnQgdGhlIG9wcG9zaXRlIHBvaW50LlxyXG4gICAgICBjb25zdCBvcHBvc2l0ZVBvaW50Tm9kZSA9IG5ldyBQb2ludE5vZGUoIHBvaW50LCBudW1iZXJMaW5lLCB7XHJcbiAgICAgICAgaXNEb3BwZWxnYW5nZXI6IHRydWUsXHJcbiAgICAgICAgbGFiZWxUZW1wbGF0ZTogb3B0aW9ucy5udW1lcmljYWxMYWJlbFRlbXBsYXRlXHJcbiAgICAgIH0gKTtcclxuICAgICAgb3Bwb3NpdGVQb2ludERpc3BsYXlMYXllci5hZGRDaGlsZCggb3Bwb3NpdGVQb2ludE5vZGUgKTtcclxuXHJcbiAgICAgIC8vIElmIGVuYWJsZWQsIGFkZCBhbiBhYnNvbHV0ZSB2YWx1ZSBcInNwYW4gaW5kaWNhdG9yXCIsIHdoaWNoIGRlcGljdHMgdGhlIGFic29sdXRlIHZhbHVlIGF0IHNvbWUgZGlzdGFuY2UgZnJvbVxyXG4gICAgICAvLyB0aGUgbnVtYmVyIGxpbmUuXHJcbiAgICAgIGxldCBhYnNvbHV0ZVZhbHVlU3Bhbk5vZGUgPSBudWxsO1xyXG4gICAgICBpZiAoIG9wdGlvbnMuc2hvd0Fic29sdXRlVmFsdWVTcGFucyApIHtcclxuICAgICAgICBjb25zdCBhYnNvbHV0ZVZhbHVlU3Bhbk5vZGVEaXN0YW5jZSA9IGdldEluZGljYXRvckRpc3RhbmNlRnJvbU5MKCBudW1iZXJMaW5lLCBhYnNvbHV0ZVZhbHVlU3Bhbk5vZGVzLmxlbmd0aCApO1xyXG4gICAgICAgIGFic29sdXRlVmFsdWVTcGFuTm9kZSA9IG5ldyBBYnNvbHV0ZVZhbHVlU3Bhbk5vZGUoIG51bWJlckxpbmUsIHBvaW50LCBhYnNvbHV0ZVZhbHVlU3Bhbk5vZGVEaXN0YW5jZSApO1xyXG4gICAgICAgIGFic29sdXRlVmFsdWVTcGFuTm9kZXMucHVzaCggYWJzb2x1dGVWYWx1ZVNwYW5Ob2RlICk7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZCggYWJzb2x1dGVWYWx1ZVNwYW5Ob2RlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFkZCBhIGxpc3RlbmVycyB0aGF0IHdpbGwgdXBkYXRlIHRoZSBhYnNvbHV0ZSB2YWx1ZSBpbmRpY2F0b3JzLlxyXG4gICAgICBwb2ludC52YWx1ZVByb3BlcnR5LmxpbmsoIHVwZGF0ZUFic29sdXRlVmFsdWVJbmRpY2F0b3JzICk7XHJcbiAgICAgIHBvaW50LmNvbG9yUHJvcGVydHkubGluayggdXBkYXRlQWJzb2x1dGVWYWx1ZUluZGljYXRvckNvbG9ycyApO1xyXG5cclxuICAgICAgLy8gQWRkIGEgbGlzdGVuZXIgdGhhdCB3aWxsIHVuaG9vayBldmVyeXRoaW5nIGlmIGFuZCB3aGVuIHRoaXMgcG9pbnQgaXMgcmVtb3ZlZC5cclxuICAgICAgY29uc3QgcmVtb3ZlSXRlbUxpc3RlbmVyID0gcmVtb3ZlZFBvaW50ID0+IHtcclxuICAgICAgICBpZiAoIHJlbW92ZWRQb2ludCA9PT0gcG9pbnQgKSB7XHJcbiAgICAgICAgICBwb2ludERpc3BsYXlMYXllci5yZW1vdmVDaGlsZCggcG9pbnROb2RlICk7XHJcbiAgICAgICAgICBwb2ludE5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgb3Bwb3NpdGVQb2ludERpc3BsYXlMYXllci5yZW1vdmVDaGlsZCggb3Bwb3NpdGVQb2ludE5vZGUgKTtcclxuICAgICAgICAgIG9wcG9zaXRlUG9pbnROb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgIGlmICggYWJzb2x1dGVWYWx1ZVNwYW5Ob2RlICkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNoaWxkKCBhYnNvbHV0ZVZhbHVlU3Bhbk5vZGUgKTtcclxuICAgICAgICAgICAgYWJzb2x1dGVWYWx1ZVNwYW5Ob2RlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgYWJzb2x1dGVWYWx1ZVNwYW5Ob2RlcyA9IF8ud2l0aG91dCggYWJzb2x1dGVWYWx1ZVNwYW5Ob2RlcywgYWJzb2x1dGVWYWx1ZVNwYW5Ob2RlICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB1cGRhdGVBYnNvbHV0ZVZhbHVlSW5kaWNhdG9ycyggdHJ1ZSApO1xyXG4gICAgICAgICAgcG9pbnQudmFsdWVQcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZUFic29sdXRlVmFsdWVJbmRpY2F0b3JzICk7XHJcbiAgICAgICAgICBwb2ludC5jb2xvclByb3BlcnR5LnVubGluayggdXBkYXRlQWJzb2x1dGVWYWx1ZUluZGljYXRvckNvbG9ycyApO1xyXG4gICAgICAgICAgbnVtYmVyTGluZS5yZXNpZGVudFBvaW50cy5yZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyKCByZW1vdmVJdGVtTGlzdGVuZXIgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIG51bWJlckxpbmUucmVzaWRlbnRQb2ludHMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggcmVtb3ZlSXRlbUxpc3RlbmVyICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEFkZCBub2RlcyBmb3IgYW55IHBvaW50cyB0aGF0IGFyZSBpbml0aWFsbHkgb24gdGhlIG51bWJlciBsaW5lLlxyXG4gICAgbnVtYmVyTGluZS5yZXNpZGVudFBvaW50cy5mb3JFYWNoKCBoYW5kbGVQb2ludEFkZGVkICk7XHJcblxyXG4gICAgLy8gSGFuZGxlIGNvbWluZ3MgYW5kIGdvaW5ncyBvZiBudW1iZXIgbGluZSBwb2ludHMuXHJcbiAgICBudW1iZXJMaW5lLnJlc2lkZW50UG9pbnRzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBoYW5kbGVQb2ludEFkZGVkICk7XHJcblxyXG4gICAgY29uc3QgdW5pdHNUZXh0ID0gbmV3IFRleHQoIG9wdGlvbnMudW5pdHNTdHJpbmcsIG9wdGlvbnMudGlja01hcmtMYWJlbE9wdGlvbnMgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHVuaXRzVGV4dCApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBwb3J0aW9ucyBvZiB0aGUgcmVwcmVzZW50YXRpb24gdGhhdCBjaGFuZ2UgaWYgdGhlIGRpc3BsYXllZCByYW5nZSBvciBvcmllbnRhdGlvbiBjaGFuZ2VzLlxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgWyBudW1iZXJMaW5lLmRpc3BsYXllZFJhbmdlUHJvcGVydHksIG51bWJlckxpbmUub3JpZW50YXRpb25Qcm9wZXJ0eSBdLFxyXG4gICAgICAoIGRpc3BsYXllZFJhbmdlLCBvcmllbnRhdGlvbiApID0+IHtcclxuXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgICAgIG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMIHx8IG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5WRVJUSUNBTCxcclxuICAgICAgICAgIGBJbnZhbGlkIG9yaWVudGF0aW9uOiAke29yaWVudGF0aW9ufWBcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgcHJldmlvdXMgbWlkZGxlIGFuZCBlbmQgdGlja21hcmtzLlxyXG4gICAgICAgIG1pZGRsZVRpY2tNYXJrc1Jvb3ROb2RlLnJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICAgICAgZW5kVGlja01hcmtzUm9vdE5vZGUucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuXHJcbiAgICAgICAgLy8gRGVyaXZlIHRoZSB0aWNrIG1hcmsgc3BhY2luZyBmcm9tIHRoZSByYW5nZS4gIFRoaXMgbWFwcGluZyB3YXMgdGFrZW4gZnJvbSB0aGUgdmFyaW91cyBOdW1iZXIgTGluZSBTdWl0ZVxyXG4gICAgICAgIC8vIGRlc2lnbiBzcGVjcywgYW5kIGNvdWxkIGJlIG1hZGUgaW50byBhIG9wdGlvbmFsIG1hcHBpbmcgZnVuY3Rpb24gaWYgbW9yZSBmbGV4aWJpbGl0eSBpcyBuZWVkZWQuXHJcbiAgICAgICAgbGV0IHRpY2tNYXJrU3BhY2luZztcclxuICAgICAgICBzd2l0Y2goIG51bWJlckxpbmUuZGlzcGxheWVkUmFuZ2VQcm9wZXJ0eS52YWx1ZS5nZXRMZW5ndGgoKSApIHtcclxuICAgICAgICAgIGNhc2UgMjA6XHJcbiAgICAgICAgICAgIHRpY2tNYXJrU3BhY2luZyA9IDE7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAzMDpcclxuICAgICAgICAgIGNhc2UgNDA6XHJcbiAgICAgICAgICBjYXNlIDYwOlxyXG4gICAgICAgICAgICB0aWNrTWFya1NwYWNpbmcgPSA1O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgMTAwOlxyXG4gICAgICAgICAgICB0aWNrTWFya1NwYWNpbmcgPSAxMDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIDIwMDpcclxuICAgICAgICAgICAgdGlja01hcmtTcGFjaW5nID0gMjU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAyMDAwOlxyXG4gICAgICAgICAgICB0aWNrTWFya1NwYWNpbmcgPSAxMDA7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGlja01hcmtTcGFjaW5nID0gMTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXJpdmUgdGhlIHRpY2sgbWFyayBsYWJlbCBzcGFjaW5nIGZyb20gdGhlIHJhbmdlLiAgQXMgd2l0aCB0aGUgdGljayBtYXJrIHNwYWNpbmcsIHRoaXMgbWFwcGluZyB3YXMgdGFrZW5cclxuICAgICAgICAvLyBmcm9tIHRoZSB2YXJpb3VzIE51bWJlciBMaW5lIFN1aXRlIGRlc2lnbiBzcGVjcywgYW5kIGNvdWxkIGJlIG1hZGUgaW50byBhIG9wdGlvbmFsIG1hcHBpbmcgZnVuY3Rpb24gaWYgbW9yZVxyXG4gICAgICAgIC8vIGZsZXhpYmlsaXR5IGlzIG5lZWRlZC5cclxuICAgICAgICAvLyB0aWNrTWFya1NwYWNpbmcgaXMgZm9yIGhvdyBmYXIgYXBhcnQgdGlja3MgYXJlIHdoZXJlYXMgdGlja01hcmtMYWJlbFNwYWNpbmcgaXMgaG93IGZhciBhcGFydFxyXG4gICAgICAgIC8vIGxhYmVscyBmb3IgdGhlIHRpY2tzIGFyZTsgbGFiZWxzIG9ubHkgYXBwZWFyIGF0IHRoZSBzcGVjaWZpZWQgc3BhY2luZyBpZiB0aGVyZSBpcyBhIHRpY2sgbWFyayB0aGVyZVxyXG4gICAgICAgIGxldCB0aWNrTWFya0xhYmVsU3BhY2luZztcclxuICAgICAgICBzd2l0Y2goIG51bWJlckxpbmUuZGlzcGxheWVkUmFuZ2VQcm9wZXJ0eS52YWx1ZS5nZXRMZW5ndGgoKSApIHtcclxuICAgICAgICAgIGNhc2UgMjA6XHJcbiAgICAgICAgICAgIHRpY2tNYXJrTGFiZWxTcGFjaW5nID0gMTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIDQwOlxyXG4gICAgICAgICAgY2FzZSA2MDpcclxuICAgICAgICAgICAgdGlja01hcmtMYWJlbFNwYWNpbmcgPSA1O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgMTAwOlxyXG4gICAgICAgICAgICB0aWNrTWFya0xhYmVsU3BhY2luZyA9IDEwO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgMjAwOlxyXG4gICAgICAgICAgICB0aWNrTWFya0xhYmVsU3BhY2luZyA9IDI1O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgMjAwMDpcclxuICAgICAgICAgICAgdGlja01hcmtMYWJlbFNwYWNpbmcgPSA1MDA7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGlja01hcmtMYWJlbFNwYWNpbmcgPSAxO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERyYXcgdGhlIHRpY2sgbWFya3MuICBUaGVzZSBjb3VsZCBiZSBvcHRpbWl6ZWQgdG8gYmUgYSBzaW5nbGUgUGF0aCBub2RlIGZvciB0aGUgdGlja3MgaWYgYSBwZXJmb3JtYW5jZVxyXG4gICAgICAgIC8vIGltcHJvdmVtZW50IGlzIGV2ZXIgbmVlZGVkLlxyXG4gICAgICAgIGNvbnN0IG1pblRpY2tNYXJrVmFsdWUgPSBudW1iZXJMaW5lLmRpc3BsYXllZFJhbmdlUHJvcGVydHkudmFsdWUubWluICsgdGlja01hcmtTcGFjaW5nO1xyXG4gICAgICAgIGNvbnN0IG1heFRpY2tNYXJrVmFsdWUgPSBudW1iZXJMaW5lLmRpc3BsYXllZFJhbmdlUHJvcGVydHkudmFsdWUubWF4IC0gdGlja01hcmtTcGFjaW5nO1xyXG5cclxuICAgICAgICB0aGlzLmFkZFRpY2tNYXJrKCBlbmRUaWNrTWFya3NSb290Tm9kZSwgZGlzcGxheWVkUmFuZ2UubWluLCB0cnVlICk7XHJcbiAgICAgICAgdGhpcy5hZGRUaWNrTWFyayggZW5kVGlja01hcmtzUm9vdE5vZGUsIGRpc3BsYXllZFJhbmdlLm1heCwgdHJ1ZSApO1xyXG5cclxuICAgICAgICBmb3IgKCBsZXQgdG1WYWx1ZSA9IG1pblRpY2tNYXJrVmFsdWU7IHRtVmFsdWUgPD0gbWF4VGlja01hcmtWYWx1ZTsgdG1WYWx1ZSArPSB0aWNrTWFya1NwYWNpbmcgKSB7XHJcbiAgICAgICAgICBpZiAoIHRtVmFsdWUgIT09IDAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkVGlja01hcmsoIG1pZGRsZVRpY2tNYXJrc1Jvb3ROb2RlLCB0bVZhbHVlLCB0bVZhbHVlICUgdGlja01hcmtMYWJlbFNwYWNpbmcgPT09IDAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBhYnNvbHV0ZSB2YWx1ZSByZXByZXNlbnRhdGlvbnMuXHJcbiAgICAgICAgdXBkYXRlQWJzb2x1dGVWYWx1ZUluZGljYXRvcnMoKTtcclxuXHJcbiAgICAgICAgLy8gcG9zaXRpb25zIHRoZSB1bml0cyB0ZXh0XHJcbiAgICAgICAgaWYgKCBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCApIHtcclxuICAgICAgICAgIGNvbnN0IHBvc2l0aW9uT2ZMYXN0VmFsdWUgPSB0aGlzLm51bWJlckxpbmUudmFsdWVUb01vZGVsUG9zaXRpb24oIGRpc3BsYXllZFJhbmdlLm1heCApO1xyXG4gICAgICAgICAgdW5pdHNUZXh0LmxlZnQgPSBwb3NpdGlvbk9mTGFzdFZhbHVlLnggKyAxODtcclxuICAgICAgICAgIHVuaXRzVGV4dC50b3AgPSBwb3NpdGlvbk9mTGFzdFZhbHVlLnkgKyBvcHRpb25zLnRpY2tNYXJrTGVuZ3RoICsgNTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBjb25zdCBwb3NpdGlvbk9mRmlyc3RWYWx1ZSA9IHRoaXMubnVtYmVyTGluZS52YWx1ZVRvTW9kZWxQb3NpdGlvbiggZGlzcGxheWVkUmFuZ2UubWluICk7XHJcbiAgICAgICAgICB1bml0c1RleHQudG9wID0gcG9zaXRpb25PZkZpcnN0VmFsdWUueSArIDEwO1xyXG4gICAgICAgICAgdW5pdHNUZXh0LmxlZnQgPSBwb3NpdGlvbk9mRmlyc3RWYWx1ZS54ICsgb3B0aW9ucy50aWNrTWFya0xlbmd0aCArIDEzO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBNb25pdG9yIHRoZSBjZW50ZXIgcG9zaXRpb24gb2YgdGhlIHNwYXRpYWxpemVkIG51bWJlciBsaW5lIG1vZGVsIGFuZCBtYWtlIHRoZSBuZWNlc3NhcnkgdHJhbnNmb3JtYXRpb25zIHdoZW5cclxuICAgIC8vIGNoYW5nZXMgb2NjdXIuXHJcbiAgICBudW1iZXJMaW5lLmNlbnRlclBvc2l0aW9uUHJvcGVydHkubGluayggY2VudGVyUG9zaXRpb24gPT4ge1xyXG4gICAgICBudW1iZXJMaW5lUm9vdE5vZGUudHJhbnNsYXRpb24gPSBjZW50ZXJQb3NpdGlvbjtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGRzIHBvaW50cyBvZmYgc2NhbGUgcGFuZWxzIGlmIG5lY2Vzc2FyeVxyXG4gICAgaWYgKCBvcHRpb25zLnBvaW50c09mZlNjYWxlQ29uZGl0aW9uICE9PSBQb2ludHNPZmZTY2FsZUNvbmRpdGlvbi5ORVZFUiApIHtcclxuXHJcbiAgICAgIC8vIGluZGljYXRvcnMgZm9yIHdoZW4gYWxsIHBvaW50cyBhcmUgb2ZmIHRoZSBzY2FsZVxyXG4gICAgICBjb25zdCBvZmZTY2FsZVRvUmlnaHRUZXh0ID0gbmV3IFJpY2hUZXh0KCBwb2ludHNPZmZTY2FsZVN0cmluZywge1xyXG4gICAgICAgIGZvbnQ6IE9GRl9TQ0FMRV9JTkRJQ0FUT1JfRk9OVCxcclxuICAgICAgICBtYXhXaWR0aDogT0ZGX1NDQUxFX1RFWFRfTUFYX1dJRFRILFxyXG4gICAgICAgIGFsaWduOiAnbGVmdCdcclxuICAgICAgfSApO1xyXG4gICAgICBjb25zdCBvZmZTY2FsZVRvUmlnaHRBcnJvdyA9IG5ldyBBcnJvd05vZGUoIDAsIDAsIE9GRl9TQ0FMRV9BUlJPV19MRU5HVEgsIDAsIE9GRl9TQ0FMRV9BUlJPV19PUFRJT05TICk7XHJcbiAgICAgIGNvbnN0IHBvaW50c09mZlNjYWxlVG9SaWdodEluZGljYXRvciA9IG5ldyBQYW5lbChcclxuICAgICAgICBuZXcgSEJveCgge1xyXG4gICAgICAgICAgY2hpbGRyZW46IFsgb2ZmU2NhbGVUb1JpZ2h0VGV4dCwgb2ZmU2NhbGVUb1JpZ2h0QXJyb3cgXSxcclxuICAgICAgICAgIHNwYWNpbmc6IE9GRl9TQ0FMRV9IQk9YX1NQQUNJTkdcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgbWVyZ2UoIHt9LCBDT01NT05fT0ZGX1NDQUxFX1BBTkVMX09QVElPTlMgKVxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBwb2ludHNPZmZTY2FsZVRvUmlnaHRJbmRpY2F0b3IgKTtcclxuXHJcbiAgICAgIGNvbnN0IG9mZlNjYWxlVG9MZWZ0VGV4dCA9IG5ldyBSaWNoVGV4dCggcG9pbnRzT2ZmU2NhbGVTdHJpbmcsIHtcclxuICAgICAgICBmb250OiBPRkZfU0NBTEVfSU5ESUNBVE9SX0ZPTlQsXHJcbiAgICAgICAgbWF4V2lkdGg6IE9GRl9TQ0FMRV9URVhUX01BWF9XSURUSCxcclxuICAgICAgICBhbGlnbjogJ3JpZ2h0J1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnN0IG9mZlNjYWxlVG9MZWZ0QXJyb3cgPSBuZXcgQXJyb3dOb2RlKCAwLCAwLCAtT0ZGX1NDQUxFX0FSUk9XX0xFTkdUSCwgMCwgT0ZGX1NDQUxFX0FSUk9XX09QVElPTlMgKTtcclxuICAgICAgY29uc3QgcG9pbnRzT2ZmU2NhbGVUb0xlZnRJbmRpY2F0b3IgPSBuZXcgUGFuZWwoXHJcbiAgICAgICAgbmV3IEhCb3goIHtcclxuICAgICAgICAgIGNoaWxkcmVuOiBbIG9mZlNjYWxlVG9MZWZ0QXJyb3csIG9mZlNjYWxlVG9MZWZ0VGV4dCBdLFxyXG4gICAgICAgICAgc3BhY2luZzogT0ZGX1NDQUxFX0hCT1hfU1BBQ0lOR1xyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBtZXJnZSgge30sIENPTU1PTl9PRkZfU0NBTEVfUEFORUxfT1BUSU9OUyApXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHBvaW50c09mZlNjYWxlVG9MZWZ0SW5kaWNhdG9yICk7XHJcblxyXG4gICAgICBjb25zdCBvZmZTY2FsZVRvVG9wVGV4dCA9IG5ldyBSaWNoVGV4dCggcG9pbnRzT2ZmU2NhbGVTdHJpbmcsIHtcclxuICAgICAgICBmb250OiBPRkZfU0NBTEVfSU5ESUNBVE9SX0ZPTlQsXHJcbiAgICAgICAgbWF4V2lkdGg6IE9GRl9TQ0FMRV9URVhUX01BWF9XSURUSCxcclxuICAgICAgICBhbGlnbjogJ2NlbnRlcidcclxuICAgICAgfSApO1xyXG4gICAgICBjb25zdCBvZmZTY2FsZVRvVG9wQXJyb3cgPSBuZXcgQXJyb3dOb2RlKCAwLCAwLCAwLCAtT0ZGX1NDQUxFX0FSUk9XX0xFTkdUSCwgT0ZGX1NDQUxFX0FSUk9XX09QVElPTlMgKTtcclxuICAgICAgY29uc3QgcG9pbnRzT2ZmU2NhbGVUb1RvcEluZGljYXRvciA9IG5ldyBQYW5lbChcclxuICAgICAgICBuZXcgSEJveCgge1xyXG4gICAgICAgICAgY2hpbGRyZW46IFsgb2ZmU2NhbGVUb1RvcEFycm93LCBvZmZTY2FsZVRvVG9wVGV4dCBdLFxyXG4gICAgICAgICAgc3BhY2luZzogT0ZGX1NDQUxFX0hCT1hfU1BBQ0lOR1xyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBtZXJnZSgge30sIENPTU1PTl9PRkZfU0NBTEVfUEFORUxfT1BUSU9OUyApXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHBvaW50c09mZlNjYWxlVG9Ub3BJbmRpY2F0b3IgKTtcclxuXHJcbiAgICAgIGNvbnN0IG9mZlNjYWxlVG9Cb3R0b21UZXh0ID0gbmV3IFJpY2hUZXh0KCBwb2ludHNPZmZTY2FsZVN0cmluZywge1xyXG4gICAgICAgIGZvbnQ6IE9GRl9TQ0FMRV9JTkRJQ0FUT1JfRk9OVCxcclxuICAgICAgICBtYXhXaWR0aDogT0ZGX1NDQUxFX1RFWFRfTUFYX1dJRFRILFxyXG4gICAgICAgIGFsaWduOiAnY2VudGVyJ1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnN0IG9mZlNjYWxlVG9Cb3R0b21BcnJvdyA9IG5ldyBBcnJvd05vZGUoIDAsIDAsIDAsIE9GRl9TQ0FMRV9BUlJPV19MRU5HVEgsIE9GRl9TQ0FMRV9BUlJPV19PUFRJT05TICk7XHJcbiAgICAgIGNvbnN0IHBvaW50c09mZlNjYWxlVG9Cb3R0b21JbmRpY2F0b3IgPSBuZXcgUGFuZWwoXHJcbiAgICAgICAgbmV3IEhCb3goIHtcclxuICAgICAgICAgIGNoaWxkcmVuOiBbIG9mZlNjYWxlVG9Cb3R0b21BcnJvdywgb2ZmU2NhbGVUb0JvdHRvbVRleHQgXSxcclxuICAgICAgICAgIHNwYWNpbmc6IE9GRl9TQ0FMRV9IQk9YX1NQQUNJTkdcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgbWVyZ2UoIHt9LCBDT01NT05fT0ZGX1NDQUxFX1BBTkVMX09QVElPTlMgKVxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBwb2ludHNPZmZTY2FsZVRvQm90dG9tSW5kaWNhdG9yICk7XHJcblxyXG4gICAgICAvLyBmdW5jdGlvbiBjbG9zdXJlIHRvIHVwZGF0ZSB0aGUgcG9zaXRpb24gYW5kIHZpc2liaWxpdHkgb2YgZWFjaCBvZiB0aGUgcG9pbnRzLW9mZi1zY2FsZSBpbmRpY2F0b3JzXHJcbiAgICAgIGNvbnN0IHVwZGF0ZVBvaW50c09mZlNjYWxlSW5kaWNhdG9ycyA9ICgpID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgZGlzcGxheWVkUmFuZ2UgPSBudW1iZXJMaW5lLmRpc3BsYXllZFJhbmdlUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICAgIC8vIHBvc2l0aW9uc1xyXG4gICAgICAgIHBvaW50c09mZlNjYWxlVG9MZWZ0SW5kaWNhdG9yLmxlZnQgPSBudW1iZXJMaW5lLnZhbHVlVG9Nb2RlbFBvc2l0aW9uKCBkaXNwbGF5ZWRSYW5nZS5taW4gKS54IC0gT0ZGX1NDQUxFX0lORElDQVRPUl9JTlNFVDtcclxuICAgICAgICBwb2ludHNPZmZTY2FsZVRvTGVmdEluZGljYXRvci5jZW50ZXJZID0gbnVtYmVyTGluZS5jZW50ZXJQb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgLSBvcHRpb25zLm9mZlNjYWxlSW5kaWNhdG9yVmVydGljYWxPZmZzZXQ7XHJcbiAgICAgICAgcG9pbnRzT2ZmU2NhbGVUb1JpZ2h0SW5kaWNhdG9yLnJpZ2h0ID0gbnVtYmVyTGluZS52YWx1ZVRvTW9kZWxQb3NpdGlvbiggZGlzcGxheWVkUmFuZ2UubWF4ICkueCArIE9GRl9TQ0FMRV9JTkRJQ0FUT1JfSU5TRVQ7XHJcbiAgICAgICAgcG9pbnRzT2ZmU2NhbGVUb1JpZ2h0SW5kaWNhdG9yLmNlbnRlclkgPSBwb2ludHNPZmZTY2FsZVRvTGVmdEluZGljYXRvci5jZW50ZXJZO1xyXG4gICAgICAgIHBvaW50c09mZlNjYWxlVG9Ub3BJbmRpY2F0b3IuY2VudGVyWCA9IG51bWJlckxpbmUuY2VudGVyUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54IC0gb3B0aW9ucy5vZmZTY2FsZUluZGljYXRvckhvcml6b250YWxPZmZzZXQ7XHJcbiAgICAgICAgcG9pbnRzT2ZmU2NhbGVUb1RvcEluZGljYXRvci50b3AgPSBudW1iZXJMaW5lLnZhbHVlVG9Nb2RlbFBvc2l0aW9uKCBkaXNwbGF5ZWRSYW5nZS5tYXggKS55IC0gT0ZGX1NDQUxFX0lORElDQVRPUl9JTlNFVDtcclxuICAgICAgICBwb2ludHNPZmZTY2FsZVRvQm90dG9tSW5kaWNhdG9yLmNlbnRlclggPSBwb2ludHNPZmZTY2FsZVRvVG9wSW5kaWNhdG9yLmNlbnRlclg7XHJcbiAgICAgICAgcG9pbnRzT2ZmU2NhbGVUb0JvdHRvbUluZGljYXRvci5ib3R0b20gPSBudW1iZXJMaW5lLnZhbHVlVG9Nb2RlbFBvc2l0aW9uKCBkaXNwbGF5ZWRSYW5nZS5taW4gKS55ICsgT0ZGX1NDQUxFX0lORElDQVRPUl9JTlNFVDtcclxuXHJcblxyXG4gICAgICAgIC8vIHZpc2liaWxpdHlcclxuICAgICAgICBpZiAoIG9wdGlvbnMucG9pbnRzT2ZmU2NhbGVDb25kaXRpb24gPT09IFBvaW50c09mZlNjYWxlQ29uZGl0aW9uLkFMTCApIHtcclxuICAgICAgICAgIGNvbnN0IGFyZUFsbFBvaW50c0JlbG93ID0gIW51bWJlckxpbmUucmVzaWRlbnRQb2ludHMuc29tZShcclxuICAgICAgICAgICAgcG9pbnQgPT4gcG9pbnQudmFsdWVQcm9wZXJ0eS52YWx1ZSA+PSBkaXNwbGF5ZWRSYW5nZS5taW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zdCBhcmVBbGxQb2ludHNBYm92ZSA9ICFudW1iZXJMaW5lLnJlc2lkZW50UG9pbnRzLnNvbWUoXHJcbiAgICAgICAgICAgIHBvaW50ID0+IHBvaW50LnZhbHVlUHJvcGVydHkudmFsdWUgPD0gZGlzcGxheWVkUmFuZ2UubWF4XHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgcG9pbnRzT2ZmU2NhbGVUb0xlZnRJbmRpY2F0b3IudmlzaWJsZSA9IG51bWJlckxpbmUucmVzaWRlbnRQb2ludHMubGVuZ3RoID4gMCAmJiBhcmVBbGxQb2ludHNCZWxvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIG51bWJlckxpbmUub3JpZW50YXRpb25Qcm9wZXJ0eS52YWx1ZSA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTDtcclxuICAgICAgICAgIHBvaW50c09mZlNjYWxlVG9SaWdodEluZGljYXRvci52aXNpYmxlID0gbnVtYmVyTGluZS5yZXNpZGVudFBvaW50cy5sZW5ndGggPiAwICYmIGFyZUFsbFBvaW50c0Fib3ZlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIG51bWJlckxpbmUub3JpZW50YXRpb25Qcm9wZXJ0eS52YWx1ZSA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTDtcclxuICAgICAgICAgIHBvaW50c09mZlNjYWxlVG9Ub3BJbmRpY2F0b3IudmlzaWJsZSA9IG51bWJlckxpbmUucmVzaWRlbnRQb2ludHMubGVuZ3RoID4gMCAmJiBhcmVBbGxQb2ludHNBYm92ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgbnVtYmVyTGluZS5vcmllbnRhdGlvblByb3BlcnR5LnZhbHVlID09PSBPcmllbnRhdGlvbi5WRVJUSUNBTDtcclxuICAgICAgICAgIHBvaW50c09mZlNjYWxlVG9Cb3R0b21JbmRpY2F0b3IudmlzaWJsZSA9IG51bWJlckxpbmUucmVzaWRlbnRQb2ludHMubGVuZ3RoID4gMCAmJiBhcmVBbGxQb2ludHNCZWxvd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgbnVtYmVyTGluZS5vcmllbnRhdGlvblByb3BlcnR5LnZhbHVlID09PSBPcmllbnRhdGlvbi5WRVJUSUNBTDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBjb25zdCBpc1BvaW50QmVsb3cgPSBudW1iZXJMaW5lLnJlc2lkZW50UG9pbnRzLnNvbWUoXHJcbiAgICAgICAgICAgIHBvaW50ID0+IHBvaW50LnZhbHVlUHJvcGVydHkudmFsdWUgPCBkaXNwbGF5ZWRSYW5nZS5taW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zdCBpc1BvaW50QWJvdmUgPSBudW1iZXJMaW5lLnJlc2lkZW50UG9pbnRzLnNvbWUoXHJcbiAgICAgICAgICAgIHBvaW50ID0+IHBvaW50LnZhbHVlUHJvcGVydHkudmFsdWUgPiBkaXNwbGF5ZWRSYW5nZS5tYXhcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBwb2ludHNPZmZTY2FsZVRvTGVmdEluZGljYXRvci52aXNpYmxlID0gaXNQb2ludEJlbG93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgbnVtYmVyTGluZS5vcmllbnRhdGlvblByb3BlcnR5LnZhbHVlID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMO1xyXG4gICAgICAgICAgcG9pbnRzT2ZmU2NhbGVUb1JpZ2h0SW5kaWNhdG9yLnZpc2libGUgPSBpc1BvaW50QWJvdmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgbnVtYmVyTGluZS5vcmllbnRhdGlvblByb3BlcnR5LnZhbHVlID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMO1xyXG4gICAgICAgICAgcG9pbnRzT2ZmU2NhbGVUb1RvcEluZGljYXRvci52aXNpYmxlID0gaXNQb2ludEFib3ZlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBudW1iZXJMaW5lLm9yaWVudGF0aW9uUHJvcGVydHkudmFsdWUgPT09IE9yaWVudGF0aW9uLlZFUlRJQ0FMO1xyXG4gICAgICAgICAgcG9pbnRzT2ZmU2NhbGVUb0JvdHRvbUluZGljYXRvci52aXNpYmxlID0gaXNQb2ludEJlbG93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBudW1iZXJMaW5lLm9yaWVudGF0aW9uUHJvcGVydHkudmFsdWUgPT09IE9yaWVudGF0aW9uLlZFUlRJQ0FMO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIEhvb2sgdXAgdGhlIGxpc3RlbmVyIHRoYXQgd2lsbCB1cGRhdGUgdGhlIHBvaW50cy1vZmYtc2NhbGUgaW5kaWNhdG9ycy5cclxuICAgICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgICBbIG51bWJlckxpbmUuZGlzcGxheWVkUmFuZ2VQcm9wZXJ0eSwgbnVtYmVyTGluZS5jZW50ZXJQb3NpdGlvblByb3BlcnR5LCBudW1iZXJMaW5lLm9yaWVudGF0aW9uUHJvcGVydHkgXSxcclxuICAgICAgICB1cGRhdGVQb2ludHNPZmZTY2FsZUluZGljYXRvcnNcclxuICAgICAgKTtcclxuXHJcbiAgICAgIG51bWJlckxpbmUucmVzaWRlbnRQb2ludHMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIGFkZGVkUG9pbnQgPT4ge1xyXG4gICAgICAgIGFkZGVkUG9pbnQudmFsdWVQcm9wZXJ0eS5saW5rKCB1cGRhdGVQb2ludHNPZmZTY2FsZUluZGljYXRvcnMgKTtcclxuICAgICAgfSApO1xyXG4gICAgICBudW1iZXJMaW5lLnJlc2lkZW50UG9pbnRzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIHJlbW92ZWRQb2ludCA9PiB7XHJcbiAgICAgICAgaWYgKCByZW1vdmVkUG9pbnQudmFsdWVQcm9wZXJ0eS5oYXNMaXN0ZW5lciggdXBkYXRlUG9pbnRzT2ZmU2NhbGVJbmRpY2F0b3JzICkgKSB7XHJcbiAgICAgICAgICB1cGRhdGVQb2ludHNPZmZTY2FsZUluZGljYXRvcnMoKTtcclxuICAgICAgICAgIHJlbW92ZWRQb2ludC52YWx1ZVByb3BlcnR5LnVubGluayggdXBkYXRlUG9pbnRzT2ZmU2NhbGVJbmRpY2F0b3JzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNZXRob2QgdG8gYWRkIGEgdGljayBtYXJrLCB3aGljaCBjb25zaXN0cyBvZiBhIHNob3J0IGxpbmUgYW5kIGEgbnVtZXJpY2FsIGxhYmVsLCB0byB0aGUgcHJvdmlkZWQgcGFyZW50IG5vZGUgZm9yXHJcbiAgICogdGhlIHByb3ZpZGVkIHZhbHVlLlxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gcGFyZW50Tm9kZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWRkTGFiZWxcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFkZFRpY2tNYXJrKCBwYXJlbnROb2RlLCB2YWx1ZSwgYWRkTGFiZWwgKSB7XHJcblxyXG4gICAgLy8gVGhlIHZhbHVlIGZvciB6ZXJvIGlzIGEgc3BlY2lhbCBjYXNlLCBhbmQgdXNlcyBhIGxvbmdlciBhbmQgdGhpY2tlciB0aWNrIG1hcmsuXHJcbiAgICBjb25zdCBsZW5ndGggPSB2YWx1ZSA9PT0gMCA/IHRoaXMub3B0aW9ucy56ZXJvVGlja01hcmtMZW5ndGggOiB0aGlzLm9wdGlvbnMudGlja01hcmtMZW5ndGg7XHJcbiAgICBjb25zdCBsaW5lV2lkdGggPSB2YWx1ZSA9PT0gMCA/IHRoaXMub3B0aW9ucy56ZXJvVGlja01hcmtMaW5lV2lkdGggOiB0aGlzLm9wdGlvbnMudGlja01hcmtMaW5lV2lkdGg7XHJcbiAgICBjb25zdCB0aWNrTWFya09wdGlvbnMgPSB7XHJcbiAgICAgIHN0cm9rZTogdGhpcy5vcHRpb25zLmNvbG9yLFxyXG4gICAgICBsaW5lV2lkdGg6IGxpbmVXaWR0aFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgdGhlIGNlbnRlciBwb3NpdGlvbiBvZiB0aGUgdGljayBtYXJrLCBzY2FsZWQgYnV0IG5vdCB0cmFuc2xhdGVkLlxyXG4gICAgY29uc3QgdG1DZW50ZXIgPSB0aGlzLm51bWJlckxpbmUudmFsdWVUb01vZGVsUG9zaXRpb24oIHZhbHVlICkubWludXMoIHRoaXMubnVtYmVyTGluZS5jZW50ZXJQb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGxhYmVsXHJcbiAgICBsZXQgbGFiZWxOb2RlO1xyXG4gICAgaWYgKCBhZGRMYWJlbCApIHtcclxuICAgICAgbGFiZWxOb2RlID0gU3RyaW5nVXRpbHMuZmlsbEluKCB0aGlzLm9wdGlvbnMubnVtZXJpY2FsTGFiZWxUZW1wbGF0ZSwgeyB2YWx1ZTogTWF0aC5hYnMoIHZhbHVlICkgfSApO1xyXG4gICAgICBpZiAoIHZhbHVlIDwgMCApIHtcclxuICAgICAgICBsYWJlbE5vZGUgPSBNYXRoU3ltYm9scy5VTkFSWV9NSU5VUyArIGxhYmVsTm9kZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCB0aWNrTWFyaztcclxuICAgIGxldCB0aWNrTGFiZWxPcHRpb25zO1xyXG4gICAgaWYgKCB0aGlzLm51bWJlckxpbmUuaXNIb3Jpem9udGFsICkge1xyXG4gICAgICB0aWNrTWFyayA9IG5ldyBMaW5lKCB0bUNlbnRlci54LCB0bUNlbnRlci55IC0gbGVuZ3RoLCB0bUNlbnRlci54LCB0bUNlbnRlci55ICsgbGVuZ3RoLCB0aWNrTWFya09wdGlvbnMgKTtcclxuICAgICAgaWYgKCB0aGlzLm9wdGlvbnMudGlja01hcmtMYWJlbFBvc2l0aW9uV2hlbkhvcml6b250YWwgPT09ICdhYm92ZScgKSB7XHJcbiAgICAgICAgdGlja0xhYmVsT3B0aW9ucyA9IHtcclxuICAgICAgICAgIGNlbnRlclg6IHRpY2tNYXJrLmNlbnRlclgsXHJcbiAgICAgICAgICBib3R0b206IHRpY2tNYXJrLnRvcCAtIFRJQ0tfTUFSS19MQUJFTF9ESVNUQU5DRVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGlja0xhYmVsT3B0aW9ucyA9IHtcclxuICAgICAgICAgIGNlbnRlclg6IHRpY2tNYXJrLmNlbnRlclgsXHJcbiAgICAgICAgICB0b3A6IHRpY2tNYXJrLmJvdHRvbSArIFRJQ0tfTUFSS19MQUJFTF9ESVNUQU5DRVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aWNrTWFyayA9IG5ldyBMaW5lKCB0bUNlbnRlci54IC0gbGVuZ3RoLCB0bUNlbnRlci55LCB0bUNlbnRlci54ICsgbGVuZ3RoLCB0bUNlbnRlci55LCB0aWNrTWFya09wdGlvbnMgKTtcclxuICAgICAgaWYgKCB0aGlzLm9wdGlvbnMudGlja01hcmtMYWJlbFBvc2l0aW9uV2hlblZlcnRpY2FsID09PSAnbGVmdCcgKSB7XHJcbiAgICAgICAgdGlja0xhYmVsT3B0aW9ucyA9IHtcclxuICAgICAgICAgIHJpZ2h0OiB0aWNrTWFyay5sZWZ0IC0gNSxcclxuICAgICAgICAgIGNlbnRlclk6IHRpY2tNYXJrLmNlbnRlcllcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRpY2tMYWJlbE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICBsZWZ0OiB0aWNrTWFyay5yaWdodCArIDUsXHJcbiAgICAgICAgICBjZW50ZXJZOiB0aWNrTWFyay5jZW50ZXJZXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcGFyZW50Tm9kZS5hZGRDaGlsZCggdGlja01hcmsgKTtcclxuICAgIGxhYmVsTm9kZSAmJiBwYXJlbnROb2RlLmFkZENoaWxkKCBuZXcgVGV4dChcclxuICAgICAgbGFiZWxOb2RlLFxyXG4gICAgICBtZXJnZSggdGlja0xhYmVsT3B0aW9ucywgdGhpcy5vcHRpb25zLnRpY2tNYXJrTGFiZWxPcHRpb25zIClcclxuICAgICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGxpc3Qgb2YgdGhlIHJlc2lkZW50IHBvaW50cyBvbiB0aGUgbnVtYmVyIGxpbmUgc29ydGVkIGJ5IHZhbHVlLlxyXG4gICAqIEByZXR1cm5zIHtOdW1iZXJMaW5lUG9pbnRbXX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldFBvaW50c1NvcnRlZEJ5QWJzb2x1dGVWYWx1ZSgpIHtcclxuICAgIHJldHVybiBfLnNvcnRCeSggdGhpcy5udW1iZXJMaW5lLnJlc2lkZW50UG9pbnRzLCBwb2ludCA9PiBNYXRoLmFicyggcG9pbnQudmFsdWVQcm9wZXJ0eS52YWx1ZSApICk7XHJcbiAgfVxyXG59XHJcblxyXG5udW1iZXJMaW5lQ29tbW9uLnJlZ2lzdGVyKCAnU3BhdGlhbGl6ZWROdW1iZXJMaW5lTm9kZScsIFNwYXRpYWxpemVkTnVtYmVyTGluZU5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgU3BhdGlhbGl6ZWROdW1iZXJMaW5lTm9kZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxRQUFRLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDM0YsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsdUJBQXVCLE1BQU0sa0NBQWtDO0FBQ3RFLE9BQU9DLFlBQVksTUFBTSxvQkFBb0I7QUFDN0MsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCO0FBQzlELE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFDdEMsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThCO0FBRWxFLE1BQU1DLG9CQUFvQixHQUFHTCx1QkFBdUIsQ0FBQ00sY0FBYzs7QUFFbkU7QUFDQSxNQUFNQyx3QkFBd0IsR0FBRyxDQUFDO0FBQ2xDLE1BQU1DLDZCQUE2QixHQUFHLENBQUM7QUFDdkMsTUFBTUMsb0NBQW9D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