// Copyright 2022-2023, University of Colorado Boulder

/**
 * Node that has a number line with makeshift log-scale values and an arrow that points to a specific number on the
 * number line.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, HBox, Line, Node, RichText, Text } from '../../../../scenery/js/imports.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import TickMarkSet from '../../../../bamboo/js/TickMarkSet.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import TickLabelSet from '../../../../bamboo/js/TickLabelSet.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import BANColors from '../../common/BANColors.js';
import Utils from '../../../../dot/js/Utils.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANConstants from '../../common/BANConstants.js';
import ScientificNotationNode from '../../../../scenery-phet/js/ScientificNotationNode.js';
import InfinityNode from './InfinityNode.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import BANScreenView from '../../common/view/BANScreenView.js';

// types

// constants
const TITLE_FONT = new PhetFont(24);
const NUMBER_LINE_START_EXPONENT = BANConstants.HALF_LIFE_NUMBER_LINE_START_EXPONENT;
const NUMBER_LINE_END_EXPONENT = BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT;
class HalfLifeNumberLineNode extends Node {
  // x position of half-life arrow in model coordinates

  // x position of the halfLifeText in model coordinates

  // the half life display node

  constructor(halfLifeNumberProperty, isStableBooleanProperty, providedOptions) {
    super();
    const options = optionize()({
      halfLifeDisplayScale: 1,
      protonCountProperty: new NumberProperty(0),
      neutronCountProperty: new NumberProperty(0),
      doesNuclideExistBooleanProperty: new BooleanProperty(false),
      unitsLabelFont: new PhetFont(18)
    }, providedOptions);
    this.numberLineLabelFont = options.numberLineLabelFont;
    const createExponentialLabel = value => {
      const numberValue = value === 0 ? 1 : `10<sup>${value}</sup>`;
      return new RichText(numberValue, {
        font: this.numberLineLabelFont,
        supScale: 0.6,
        supYOffset: -1
      });
    };

    // create and add numberLineNode
    const numberLineNode = new Node();
    this.chartTransform = new ChartTransform({
      viewWidth: options.numberLineWidth,
      modelXRange: new Range(NUMBER_LINE_START_EXPONENT, NUMBER_LINE_END_EXPONENT)
    });
    const tickXSpacing = 3;
    this.tickMarkSet = new TickMarkSet(this.chartTransform, Orientation.HORIZONTAL, tickXSpacing, {
      stroke: Color.BLACK,
      extent: options.tickMarkExtent,
      lineWidth: 2
    });
    this.tickMarkSet.centerY = 0;
    numberLineNode.addChild(this.tickMarkSet);
    const tickLabelSet = new TickLabelSet(this.chartTransform, Orientation.HORIZONTAL, tickXSpacing, {
      extent: 0,
      createLabel: value => createExponentialLabel(value)
    });
    tickLabelSet.top = this.tickMarkSet.bottom;
    numberLineNode.addChild(tickLabelSet);
    const numberLine = new Line({
      x1: this.chartTransform.modelToViewX(NUMBER_LINE_START_EXPONENT),
      y1: this.tickMarkSet.centerY,
      x2: this.chartTransform.modelToViewX(NUMBER_LINE_END_EXPONENT),
      y2: this.tickMarkSet.centerY,
      stroke: Color.BLACK
    });
    numberLineNode.addChild(numberLine);
    this.addChild(numberLineNode);

    // create and add the halfLifeArrow
    const arrowNode = new ArrowNode(0, 0, 0, options.halfLifeArrowLength, {
      fill: BANColors.halfLifeColorProperty,
      stroke: null,
      tailWidth: 4,
      headWidth: 12
    });
    const halfLifeArrow = new Node();
    this.addChild(halfLifeArrow);
    halfLifeArrow.addChild(arrowNode);
    this.arrowXPositionProperty = new NumberProperty(0);
    this.arrowXPositionProperty.link(xPosition => {
      halfLifeArrow.translation = new Vector2(this.chartTransform.modelToViewX(xPosition), this.tickMarkSet.centerY - options.halfLifeArrowLength);
    });
    this.arrowXPositionAnimation = null;
    this.arrowRotationAnimation = null;

    // create and add the half life display, which is a parent node used to contain the number readout, the infinity
    // symbol, and the 'Unknown' text.
    this.halfLifeDisplayNode = new Node({
      scale: options.halfLifeDisplayScale,
      excludeInvisibleChildrenFromBounds: true
    });
    this.addChild(this.halfLifeDisplayNode);

    // create and add the text for "Half-life:"
    const halfLifeColonText = new RichText(BuildANucleusStrings.halfLifeColon, {
      font: TITLE_FONT,
      maxWidth: 115
    });
    this.halfLifeDisplayNode.addChild(halfLifeColonText);
    this.halfLifeDisplayNode.left = this.left + BANConstants.INFO_BUTTON_INDENT_DISTANCE + BANConstants.INFO_BUTTON_MAX_HEIGHT + 10;
    this.halfLifeDisplayNode.bottom = halfLifeArrow.top - 8;

    // create and add the "Unknown" text
    const halfLifeUnknownText = new RichText(BuildANucleusStrings.unknown, {
      font: TITLE_FONT,
      maxWidth: 115
    });
    halfLifeUnknownText.left = halfLifeColonText.right + 8;
    halfLifeUnknownText.bottom = halfLifeColonText.bottom;
    this.halfLifeDisplayNode.addChild(halfLifeUnknownText);

    // create and add the infinity node, which represents a math infinity symbol
    const infinityNode = new InfinityNode();
    infinityNode.left = halfLifeUnknownText.left;
    infinityNode.bottom = halfLifeUnknownText.bottom - 5; // offset to match the apparent bottom position of the text
    this.halfLifeDisplayNode.addChild(infinityNode);

    // the half life number in scientific notation with an 's' for seconds at the end
    const halfLifeScientificNotation = new ScientificNotationNode(halfLifeNumberProperty, {
      font: TITLE_FONT
    });
    const halfLifeNumberText = new HBox({
      children: [halfLifeScientificNotation, new Text(BuildANucleusStrings.s, {
        font: TITLE_FONT,
        maxWidth: 30
      })],
      align: 'bottom',
      spacing: 10
    });
    halfLifeNumberText.left = halfLifeUnknownText.left;
    this.halfLifeDisplayNode.addChild(halfLifeNumberText);

    // if the half-life text is a label to the arrow
    if (!options.isHalfLifeLabelFixed) {
      const distanceBetweenElementNameAndHalfLifeText = 4;
      const distanceBetweenHalfLifeTextAndArrow = 14;

      // Create the textual readout for the element name.
      const elementName = new Text('', {
        font: this.numberLineLabelFont,
        fill: Color.RED,
        maxWidth: BANConstants.ELEMENT_NAME_MAX_WIDTH
      });
      elementName.center = this.halfLifeDisplayNode.center.minusXY(0, this.halfLifeDisplayNode.height + 10);
      this.addChild(elementName);

      // Hook up update listeners.
      Multilink.multilink([options.protonCountProperty, options.neutronCountProperty, options.doesNuclideExistBooleanProperty], (protonCount, neutronCount, doesNuclideExist) => BANScreenView.updateElementName(elementName, protonCount, neutronCount, doesNuclideExist, this.halfLifeDisplayNode.centerX, this.halfLifeDisplayNode.centerY - this.halfLifeDisplayNode.height - distanceBetweenElementNameAndHalfLifeText));
      this.halfLifeTextXPositionProperty = new NumberProperty(0);
      this.halfLifeTextXPositionProperty.link(xPosition => {
        this.halfLifeDisplayNode.translation = new Vector2(this.chartTransform.modelToViewX(xPosition) - this.halfLifeDisplayNode.width / 2, halfLifeArrow.top - distanceBetweenHalfLifeTextAndArrow);
        elementName.translation = new Vector2(this.chartTransform.modelToViewX(xPosition) - elementName.width / 2, halfLifeArrow.top - this.halfLifeDisplayNode.height - distanceBetweenHalfLifeTextAndArrow - distanceBetweenElementNameAndHalfLifeText);

        // left-align the text if it goes over the left edge of the numberLineNode
        if (this.halfLifeDisplayNode.left < numberLineNode.left) {
          this.halfLifeDisplayNode.left = numberLineNode.left;
        }
        if (elementName.left < numberLineNode.left) {
          elementName.left = numberLineNode.left;
        }

        // right-align the text if it goes over the right edge of the numberLineNode
        if (this.halfLifeDisplayNode.right > numberLineNode.right) {
          this.halfLifeDisplayNode.right = numberLineNode.right;
        }
        if (elementName.right > numberLineNode.right) {
          elementName.right = numberLineNode.right;
        }
      });
    }
    this.halfLifeArrowRotationProperty = new NumberProperty(0);
    Multilink.multilink([this.halfLifeArrowRotationProperty], rotation => {
      halfLifeArrow.rotation = rotation;
    });

    // function to show or hide the halfLifeArrow
    const showHalfLifeArrow = show => {
      halfLifeArrow.visible = show;
    };

    // link the halfLifeNumberProperty to the half-life arrow indicator and to the half-life number readout
    halfLifeNumberProperty.link(halfLifeNumber => {
      // the nuclide is stable
      if (isStableBooleanProperty.value) {
        showHalfLifeArrow(true);
        infinityNode.visible = true;
        halfLifeUnknownText.visible = false;
        halfLifeNumberText.visible = false;

        // peg the indicator to the right when stable
        this.moveHalfLifePointerSet(halfLifeNumber, options.isHalfLifeLabelFixed);
      }

      // the nuclide is unstable or does not exist
      else {
        infinityNode.visible = false;

        // the nuclide does not exist
        if (halfLifeNumber === 0) {
          showHalfLifeArrow(false);
          halfLifeUnknownText.visible = false;
          halfLifeNumberText.visible = false;
          this.moveHalfLifePointerSet(halfLifeNumber, options.isHalfLifeLabelFixed);
        }

        // the nuclide is unstable but the half-life data is unknown
        else if (halfLifeNumber === -1) {
          showHalfLifeArrow(false);
          halfLifeUnknownText.visible = true;
          halfLifeNumberText.visible = false;
          this.moveHalfLifePointerSet(0, options.isHalfLifeLabelFixed);
        }

        // the nuclide is unstable and the half-life data is known
        else {
          showHalfLifeArrow(true);
          halfLifeUnknownText.visible = false;
          halfLifeNumberText.visible = true;
          halfLifeNumberText.bottom = halfLifeColonText.bottom;

          // peg the indicator to the right when the half-life goes off-scale but still show the accurate half-life readout
          if (halfLifeNumber > Math.pow(10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT)) {
            this.moveHalfLifePointerSet(Math.pow(10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT), options.isHalfLifeLabelFixed);
          } else {
            this.moveHalfLifePointerSet(halfLifeNumber, options.isHalfLifeLabelFixed);
          }
        }
      }
    });

    // create and add the units label on the number line
    const numberLineUnitsLabel = new Text(BuildANucleusStrings.seconds, {
      font: options.unitsLabelFont,
      maxWidth: 150
    });
    numberLineUnitsLabel.centerY = this.bottom + numberLineUnitsLabel.height / 2;
    numberLineUnitsLabel.centerX = this.centerX;
    this.addChild(numberLineUnitsLabel);
  }

  /**
   * Animate the half-life arrow to the new half-life position along the number line. If the half-life text is a label
   * to the half-life arrow, animate it to its new half-life position too.
   */
  moveHalfLifePointerSet(halfLife, isHalfLifeLabelFixed) {
    const newXPosition = HalfLifeNumberLineNode.logScaleNumberToLinearScaleNumber(halfLife);
    const arrowXPositionAnimationDuration = 0.7; // in seconds

    // animate the half-life arrow's x position
    if (this.arrowXPositionAnimation) {
      this.arrowXPositionAnimation.stop();
      this.arrowXPositionAnimation = null;
    }
    if (isHalfLifeLabelFixed) {
      this.arrowXPositionAnimation = new Animation({
        to: newXPosition,
        property: this.arrowXPositionProperty,
        duration: arrowXPositionAnimationDuration,
        easing: Easing.QUADRATIC_IN_OUT
      });
    } else {
      this.arrowXPositionAnimation = new Animation({
        targets: [{
          to: newXPosition,
          property: this.arrowXPositionProperty
        }, {
          to: newXPosition,
          property: this.halfLifeTextXPositionProperty
        }],
        duration: arrowXPositionAnimationDuration,
        easing: Easing.QUADRATIC_IN_OUT
      });
    }
    const arrowRotationAnimationDuration = 0.1; // in seconds

    // if the halfLife number is stable, then animate the arrow's rotation
    if (this.arrowRotationAnimation) {
      this.arrowRotationAnimation.stop();
      this.arrowRotationAnimation = null;
    }
    if (halfLife === Math.pow(10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT)) {
      // rotate arrow horizontally, pointing right
      this.arrowRotationAnimation = new Animation({
        to: -Math.PI / 2,
        property: this.halfLifeArrowRotationProperty,
        duration: arrowRotationAnimationDuration,
        easing: Easing.QUADRATIC_IN_OUT
      });
      this.arrowXPositionAnimation.then(this.arrowRotationAnimation);
      this.arrowXPositionAnimation.start();
      this.arrowRotationAnimation.finishEmitter.addListener(() => {
        this.arrowRotationAnimation = null;
        this.arrowXPositionAnimation = null;
      });
    } else {
      // rotate arrow back vertically, pointing down
      this.arrowRotationAnimation = new Animation({
        to: 0,
        property: this.halfLifeArrowRotationProperty,
        duration: arrowRotationAnimationDuration,
        easing: Easing.QUADRATIC_IN_OUT
      });
      this.arrowRotationAnimation.then(this.arrowXPositionAnimation);
      this.arrowRotationAnimation.start();
      this.arrowXPositionAnimation.finishEmitter.addListener(() => {
        this.arrowXPositionAnimation = null;
        this.arrowRotationAnimation = null;
      });
    }
  }

  /**
   * Add an arrow with a label to the number line.
   */
  addArrowAndLabel(label, halfLife) {
    const xPosition = HalfLifeNumberLineNode.logScaleNumberToLinearScaleNumber(halfLife);
    const arrow = new ArrowNode(this.chartTransform.modelToViewX(xPosition), -17.5, this.chartTransform.modelToViewX(xPosition), this.tickMarkSet.centerY, {
      fill: BANColors.legendArrowColorProperty,
      stroke: null,
      tailWidth: 1.5,
      headWidth: 5
    });
    this.addChild(arrow);
    const numberText = new RichText(label, {
      font: this.numberLineLabelFont,
      maxWidth: 25
    });
    numberText.bottom = arrow.top;
    numberText.centerX = arrow.centerX;
    this.addChild(numberText);
  }

  /**
   * Convert the half-life number (in seconds) to a linear scale number to plot it on the number line.
   */
  static logScaleNumberToLinearScaleNumber(halfLifeNumber) {
    if (halfLifeNumber === 0) {
      return 0;
    }
    return Utils.log10(halfLifeNumber);
  }
}
buildANucleus.register('HalfLifeNumberLineNode', HalfLifeNumberLineNode);
export default HalfLifeNumberLineNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJidWlsZEFOdWNsZXVzIiwiVmVjdG9yMiIsIlJhbmdlIiwiUGhldEZvbnQiLCJDb2xvciIsIkhCb3giLCJMaW5lIiwiTm9kZSIsIlJpY2hUZXh0IiwiVGV4dCIsIkNoYXJ0VHJhbnNmb3JtIiwiVGlja01hcmtTZXQiLCJPcmllbnRhdGlvbiIsIlRpY2tMYWJlbFNldCIsIk51bWJlclByb3BlcnR5IiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwiQXJyb3dOb2RlIiwiQkFOQ29sb3JzIiwiVXRpbHMiLCJCdWlsZEFOdWNsZXVzU3RyaW5ncyIsIm9wdGlvbml6ZSIsIkJBTkNvbnN0YW50cyIsIlNjaWVudGlmaWNOb3RhdGlvbk5vZGUiLCJJbmZpbml0eU5vZGUiLCJCb29sZWFuUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJCQU5TY3JlZW5WaWV3IiwiVElUTEVfRk9OVCIsIk5VTUJFUl9MSU5FX1NUQVJUX0VYUE9ORU5UIiwiSEFMRl9MSUZFX05VTUJFUl9MSU5FX1NUQVJUX0VYUE9ORU5UIiwiTlVNQkVSX0xJTkVfRU5EX0VYUE9ORU5UIiwiSEFMRl9MSUZFX05VTUJFUl9MSU5FX0VORF9FWFBPTkVOVCIsIkhhbGZMaWZlTnVtYmVyTGluZU5vZGUiLCJjb25zdHJ1Y3RvciIsImhhbGZMaWZlTnVtYmVyUHJvcGVydHkiLCJpc1N0YWJsZUJvb2xlYW5Qcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJoYWxmTGlmZURpc3BsYXlTY2FsZSIsInByb3RvbkNvdW50UHJvcGVydHkiLCJuZXV0cm9uQ291bnRQcm9wZXJ0eSIsImRvZXNOdWNsaWRlRXhpc3RCb29sZWFuUHJvcGVydHkiLCJ1bml0c0xhYmVsRm9udCIsIm51bWJlckxpbmVMYWJlbEZvbnQiLCJjcmVhdGVFeHBvbmVudGlhbExhYmVsIiwidmFsdWUiLCJudW1iZXJWYWx1ZSIsImZvbnQiLCJzdXBTY2FsZSIsInN1cFlPZmZzZXQiLCJudW1iZXJMaW5lTm9kZSIsImNoYXJ0VHJhbnNmb3JtIiwidmlld1dpZHRoIiwibnVtYmVyTGluZVdpZHRoIiwibW9kZWxYUmFuZ2UiLCJ0aWNrWFNwYWNpbmciLCJ0aWNrTWFya1NldCIsIkhPUklaT05UQUwiLCJzdHJva2UiLCJCTEFDSyIsImV4dGVudCIsInRpY2tNYXJrRXh0ZW50IiwibGluZVdpZHRoIiwiY2VudGVyWSIsImFkZENoaWxkIiwidGlja0xhYmVsU2V0IiwiY3JlYXRlTGFiZWwiLCJ0b3AiLCJib3R0b20iLCJudW1iZXJMaW5lIiwieDEiLCJtb2RlbFRvVmlld1giLCJ5MSIsIngyIiwieTIiLCJhcnJvd05vZGUiLCJoYWxmTGlmZUFycm93TGVuZ3RoIiwiZmlsbCIsImhhbGZMaWZlQ29sb3JQcm9wZXJ0eSIsInRhaWxXaWR0aCIsImhlYWRXaWR0aCIsImhhbGZMaWZlQXJyb3ciLCJhcnJvd1hQb3NpdGlvblByb3BlcnR5IiwibGluayIsInhQb3NpdGlvbiIsInRyYW5zbGF0aW9uIiwiYXJyb3dYUG9zaXRpb25BbmltYXRpb24iLCJhcnJvd1JvdGF0aW9uQW5pbWF0aW9uIiwiaGFsZkxpZmVEaXNwbGF5Tm9kZSIsInNjYWxlIiwiZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyIsImhhbGZMaWZlQ29sb25UZXh0IiwiaGFsZkxpZmVDb2xvbiIsIm1heFdpZHRoIiwibGVmdCIsIklORk9fQlVUVE9OX0lOREVOVF9ESVNUQU5DRSIsIklORk9fQlVUVE9OX01BWF9IRUlHSFQiLCJoYWxmTGlmZVVua25vd25UZXh0IiwidW5rbm93biIsInJpZ2h0IiwiaW5maW5pdHlOb2RlIiwiaGFsZkxpZmVTY2llbnRpZmljTm90YXRpb24iLCJoYWxmTGlmZU51bWJlclRleHQiLCJjaGlsZHJlbiIsInMiLCJhbGlnbiIsInNwYWNpbmciLCJpc0hhbGZMaWZlTGFiZWxGaXhlZCIsImRpc3RhbmNlQmV0d2VlbkVsZW1lbnROYW1lQW5kSGFsZkxpZmVUZXh0IiwiZGlzdGFuY2VCZXR3ZWVuSGFsZkxpZmVUZXh0QW5kQXJyb3ciLCJlbGVtZW50TmFtZSIsIlJFRCIsIkVMRU1FTlRfTkFNRV9NQVhfV0lEVEgiLCJjZW50ZXIiLCJtaW51c1hZIiwiaGVpZ2h0IiwibXVsdGlsaW5rIiwicHJvdG9uQ291bnQiLCJuZXV0cm9uQ291bnQiLCJkb2VzTnVjbGlkZUV4aXN0IiwidXBkYXRlRWxlbWVudE5hbWUiLCJjZW50ZXJYIiwiaGFsZkxpZmVUZXh0WFBvc2l0aW9uUHJvcGVydHkiLCJ3aWR0aCIsImhhbGZMaWZlQXJyb3dSb3RhdGlvblByb3BlcnR5Iiwicm90YXRpb24iLCJzaG93SGFsZkxpZmVBcnJvdyIsInNob3ciLCJ2aXNpYmxlIiwiaGFsZkxpZmVOdW1iZXIiLCJtb3ZlSGFsZkxpZmVQb2ludGVyU2V0IiwiTWF0aCIsInBvdyIsIm51bWJlckxpbmVVbml0c0xhYmVsIiwic2Vjb25kcyIsImhhbGZMaWZlIiwibmV3WFBvc2l0aW9uIiwibG9nU2NhbGVOdW1iZXJUb0xpbmVhclNjYWxlTnVtYmVyIiwiYXJyb3dYUG9zaXRpb25BbmltYXRpb25EdXJhdGlvbiIsInN0b3AiLCJ0byIsInByb3BlcnR5IiwiZHVyYXRpb24iLCJlYXNpbmciLCJRVUFEUkFUSUNfSU5fT1VUIiwidGFyZ2V0cyIsImFycm93Um90YXRpb25BbmltYXRpb25EdXJhdGlvbiIsIlBJIiwidGhlbiIsInN0YXJ0IiwiZmluaXNoRW1pdHRlciIsImFkZExpc3RlbmVyIiwiYWRkQXJyb3dBbmRMYWJlbCIsImxhYmVsIiwiYXJyb3ciLCJsZWdlbmRBcnJvd0NvbG9yUHJvcGVydHkiLCJudW1iZXJUZXh0IiwibG9nMTAiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkhhbGZMaWZlTnVtYmVyTGluZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTm9kZSB0aGF0IGhhcyBhIG51bWJlciBsaW5lIHdpdGggbWFrZXNoaWZ0IGxvZy1zY2FsZSB2YWx1ZXMgYW5kIGFuIGFycm93IHRoYXQgcG9pbnRzIHRvIGEgc3BlY2lmaWMgbnVtYmVyIG9uIHRoZVxyXG4gKiBudW1iZXIgbGluZS5cclxuICpcclxuICogQGF1dGhvciBMdWlzYSBWYXJnYXNcclxuICovXHJcblxyXG5pbXBvcnQgYnVpbGRBTnVjbGV1cyBmcm9tICcuLi8uLi9idWlsZEFOdWNsZXVzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBIQm94LCBMaW5lLCBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCwgUmljaFRleHQsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ2hhcnRUcmFuc2Zvcm0gZnJvbSAnLi4vLi4vLi4vLi4vYmFtYm9vL2pzL0NoYXJ0VHJhbnNmb3JtLmpzJztcclxuaW1wb3J0IFRpY2tNYXJrU2V0IGZyb20gJy4uLy4uLy4uLy4uL2JhbWJvby9qcy9UaWNrTWFya1NldC5qcyc7XHJcbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xyXG5pbXBvcnQgVGlja0xhYmVsU2V0IGZyb20gJy4uLy4uLy4uLy4uL2JhbWJvby9qcy9UaWNrTGFiZWxTZXQuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBBbmltYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvQW5pbWF0aW9uLmpzJztcclxuaW1wb3J0IEVhc2luZyBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9FYXNpbmcuanMnO1xyXG5pbXBvcnQgQXJyb3dOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9BcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgQkFOQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9CQU5Db2xvcnMuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IEJ1aWxkQU51Y2xldXNTdHJpbmdzIGZyb20gJy4uLy4uL0J1aWxkQU51Y2xldXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IEJBTkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQkFOQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFNjaWVudGlmaWNOb3RhdGlvbk5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1NjaWVudGlmaWNOb3RhdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBJbmZpbml0eU5vZGUgZnJvbSAnLi9JbmZpbml0eU5vZGUuanMnO1xyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQkFOU2NyZWVuVmlldyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9CQU5TY3JlZW5WaWV3LmpzJztcclxuXHJcbi8vIHR5cGVzXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgbnVtYmVyTGluZVdpZHRoOiBudW1iZXI7XHJcbiAgdGlja01hcmtFeHRlbnQ6IG51bWJlcjtcclxuICBudW1iZXJMaW5lTGFiZWxGb250OiBQaGV0Rm9udDtcclxuICBoYWxmTGlmZUFycm93TGVuZ3RoOiBudW1iZXI7XHJcblxyXG4gIC8vIHNjYWxlIGZvciB0aGUgaGFsZkxpZmVEaXNwbGF5Tm9kZVxyXG4gIGhhbGZMaWZlRGlzcGxheVNjYWxlPzogbnVtYmVyO1xyXG5cclxuICBpc0hhbGZMaWZlTGFiZWxGaXhlZDogYm9vbGVhbjsgLy8gaWYgdGhlIGhhbGYtbGlmZSBsYWJlbCBpcyBmaXhlZCwgcGxhY2UgaXQgY2VudGVyZWQgYWJvdmUgdGhlIG51bWJlciBsaW5lLCBvdGhlcndpc2UsXHJcbiAgLy8gYW5pbWF0ZSBpdHMgcG9zaXRpb24gd2l0aCB0aGUgaGFsZi1saWZlIGFycm93XHJcblxyXG4gIHByb3RvbkNvdW50UHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+O1xyXG4gIG5ldXRyb25Db3VudFByb3BlcnR5PzogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcclxuICBkb2VzTnVjbGlkZUV4aXN0Qm9vbGVhblByb3BlcnR5PzogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIHVuaXRzTGFiZWxGb250PzogUGhldEZvbnQ7XHJcbn07XHJcbmV4cG9ydCB0eXBlIEhhbGZMaWZlTnVtYmVyTGluZU5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBUSVRMRV9GT05UID0gbmV3IFBoZXRGb250KCAyNCApO1xyXG5jb25zdCBOVU1CRVJfTElORV9TVEFSVF9FWFBPTkVOVCA9IEJBTkNvbnN0YW50cy5IQUxGX0xJRkVfTlVNQkVSX0xJTkVfU1RBUlRfRVhQT05FTlQ7XHJcbmNvbnN0IE5VTUJFUl9MSU5FX0VORF9FWFBPTkVOVCA9IEJBTkNvbnN0YW50cy5IQUxGX0xJRkVfTlVNQkVSX0xJTkVfRU5EX0VYUE9ORU5UO1xyXG5cclxuY2xhc3MgSGFsZkxpZmVOdW1iZXJMaW5lTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IG51bWJlckxpbmVMYWJlbEZvbnQ6IFBoZXRGb250IHwgdW5kZWZpbmVkO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY2hhcnRUcmFuc2Zvcm06IENoYXJ0VHJhbnNmb3JtO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdGlja01hcmtTZXQ6IFBhdGg7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBoYWxmTGlmZUFycm93Um90YXRpb25Qcm9wZXJ0eTogVFByb3BlcnR5PG51bWJlcj47XHJcbiAgcHJpdmF0ZSBhcnJvd1hQb3NpdGlvbkFuaW1hdGlvbjogbnVsbCB8IEFuaW1hdGlvbjtcclxuICBwcml2YXRlIGFycm93Um90YXRpb25BbmltYXRpb246IG51bGwgfCBBbmltYXRpb247XHJcblxyXG4gIC8vIHggcG9zaXRpb24gb2YgaGFsZi1saWZlIGFycm93IGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBhcnJvd1hQb3NpdGlvblByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPjtcclxuXHJcbiAgLy8geCBwb3NpdGlvbiBvZiB0aGUgaGFsZkxpZmVUZXh0IGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBoYWxmTGlmZVRleHRYUG9zaXRpb25Qcm9wZXJ0eTogVFByb3BlcnR5PG51bWJlcj4gfCB1bmRlZmluZWQ7XHJcblxyXG4gIC8vIHRoZSBoYWxmIGxpZmUgZGlzcGxheSBub2RlXHJcbiAgcHVibGljIHJlYWRvbmx5IGhhbGZMaWZlRGlzcGxheU5vZGU6IE5vZGU7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaGFsZkxpZmVOdW1iZXJQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIGlzU3RhYmxlQm9vbGVhblByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogSGFsZkxpZmVOdW1iZXJMaW5lTm9kZU9wdGlvbnMgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SGFsZkxpZmVOdW1iZXJMaW5lTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG4gICAgICBoYWxmTGlmZURpc3BsYXlTY2FsZTogMSxcclxuICAgICAgcHJvdG9uQ291bnRQcm9wZXJ0eTogbmV3IE51bWJlclByb3BlcnR5KCAwICksXHJcbiAgICAgIG5ldXRyb25Db3VudFByb3BlcnR5OiBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKSxcclxuICAgICAgZG9lc051Y2xpZGVFeGlzdEJvb2xlYW5Qcm9wZXJ0eTogbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKSxcclxuICAgICAgdW5pdHNMYWJlbEZvbnQ6IG5ldyBQaGV0Rm9udCggMTggKVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5udW1iZXJMaW5lTGFiZWxGb250ID0gb3B0aW9ucy5udW1iZXJMaW5lTGFiZWxGb250O1xyXG5cclxuICAgIGNvbnN0IGNyZWF0ZUV4cG9uZW50aWFsTGFiZWwgPSAoIHZhbHVlOiBudW1iZXIgKTogTm9kZSA9PiB7XHJcbiAgICAgIGNvbnN0IG51bWJlclZhbHVlID0gdmFsdWUgPT09IDAgPyAxIDogYDEwPHN1cD4ke3ZhbHVlfTwvc3VwPmA7XHJcbiAgICAgIHJldHVybiBuZXcgUmljaFRleHQoIG51bWJlclZhbHVlLCB7XHJcbiAgICAgICAgZm9udDogdGhpcy5udW1iZXJMaW5lTGFiZWxGb250LFxyXG4gICAgICAgIHN1cFNjYWxlOiAwLjYsXHJcbiAgICAgICAgc3VwWU9mZnNldDogLTFcclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCBudW1iZXJMaW5lTm9kZVxyXG4gICAgY29uc3QgbnVtYmVyTGluZU5vZGUgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIHRoaXMuY2hhcnRUcmFuc2Zvcm0gPSBuZXcgQ2hhcnRUcmFuc2Zvcm0oIHtcclxuICAgICAgdmlld1dpZHRoOiBvcHRpb25zLm51bWJlckxpbmVXaWR0aCxcclxuICAgICAgbW9kZWxYUmFuZ2U6IG5ldyBSYW5nZSggTlVNQkVSX0xJTkVfU1RBUlRfRVhQT05FTlQsIE5VTUJFUl9MSU5FX0VORF9FWFBPTkVOVCApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgdGlja1hTcGFjaW5nID0gMztcclxuICAgIHRoaXMudGlja01hcmtTZXQgPSBuZXcgVGlja01hcmtTZXQoIHRoaXMuY2hhcnRUcmFuc2Zvcm0sIE9yaWVudGF0aW9uLkhPUklaT05UQUwsIHRpY2tYU3BhY2luZywge1xyXG4gICAgICBzdHJva2U6IENvbG9yLkJMQUNLLFxyXG4gICAgICBleHRlbnQ6IG9wdGlvbnMudGlja01hcmtFeHRlbnQsXHJcbiAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgfSApO1xyXG4gICAgdGhpcy50aWNrTWFya1NldC5jZW50ZXJZID0gMDtcclxuICAgIG51bWJlckxpbmVOb2RlLmFkZENoaWxkKCB0aGlzLnRpY2tNYXJrU2V0ICk7XHJcbiAgICBjb25zdCB0aWNrTGFiZWxTZXQgPSBuZXcgVGlja0xhYmVsU2V0KCB0aGlzLmNoYXJ0VHJhbnNmb3JtLCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLCB0aWNrWFNwYWNpbmcsIHtcclxuICAgICAgZXh0ZW50OiAwLFxyXG4gICAgICBjcmVhdGVMYWJlbDogKCB2YWx1ZTogbnVtYmVyICkgPT4gY3JlYXRlRXhwb25lbnRpYWxMYWJlbCggdmFsdWUgKVxyXG4gICAgfSApO1xyXG4gICAgdGlja0xhYmVsU2V0LnRvcCA9IHRoaXMudGlja01hcmtTZXQuYm90dG9tO1xyXG4gICAgbnVtYmVyTGluZU5vZGUuYWRkQ2hpbGQoIHRpY2tMYWJlbFNldCApO1xyXG4gICAgY29uc3QgbnVtYmVyTGluZSA9IG5ldyBMaW5lKCB7XHJcbiAgICAgIHgxOiB0aGlzLmNoYXJ0VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggTlVNQkVSX0xJTkVfU1RBUlRfRVhQT05FTlQgKSwgeTE6IHRoaXMudGlja01hcmtTZXQuY2VudGVyWSxcclxuICAgICAgeDI6IHRoaXMuY2hhcnRUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBOVU1CRVJfTElORV9FTkRfRVhQT05FTlQgKSwgeTI6IHRoaXMudGlja01hcmtTZXQuY2VudGVyWSxcclxuICAgICAgc3Ryb2tlOiBDb2xvci5CTEFDS1xyXG4gICAgfSApO1xyXG4gICAgbnVtYmVyTGluZU5vZGUuYWRkQ2hpbGQoIG51bWJlckxpbmUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG51bWJlckxpbmVOb2RlICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgdGhlIGhhbGZMaWZlQXJyb3dcclxuICAgIGNvbnN0IGFycm93Tm9kZSA9IG5ldyBBcnJvd05vZGUoIDAsIDAsIDAsIG9wdGlvbnMuaGFsZkxpZmVBcnJvd0xlbmd0aCwge1xyXG4gICAgICBmaWxsOiBCQU5Db2xvcnMuaGFsZkxpZmVDb2xvclByb3BlcnR5LFxyXG4gICAgICBzdHJva2U6IG51bGwsXHJcbiAgICAgIHRhaWxXaWR0aDogNCxcclxuICAgICAgaGVhZFdpZHRoOiAxMlxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgaGFsZkxpZmVBcnJvdyA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBoYWxmTGlmZUFycm93ICk7XHJcbiAgICBoYWxmTGlmZUFycm93LmFkZENoaWxkKCBhcnJvd05vZGUgKTtcclxuXHJcbiAgICB0aGlzLmFycm93WFBvc2l0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuICAgIHRoaXMuYXJyb3dYUG9zaXRpb25Qcm9wZXJ0eS5saW5rKCB4UG9zaXRpb24gPT4ge1xyXG4gICAgICBoYWxmTGlmZUFycm93LnRyYW5zbGF0aW9uID0gbmV3IFZlY3RvcjIoIHRoaXMuY2hhcnRUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCB4UG9zaXRpb24gKSxcclxuICAgICAgICB0aGlzLnRpY2tNYXJrU2V0LmNlbnRlclkgLSBvcHRpb25zLmhhbGZMaWZlQXJyb3dMZW5ndGggKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYXJyb3dYUG9zaXRpb25BbmltYXRpb24gPSBudWxsO1xyXG4gICAgdGhpcy5hcnJvd1JvdGF0aW9uQW5pbWF0aW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgaGFsZiBsaWZlIGRpc3BsYXksIHdoaWNoIGlzIGEgcGFyZW50IG5vZGUgdXNlZCB0byBjb250YWluIHRoZSBudW1iZXIgcmVhZG91dCwgdGhlIGluZmluaXR5XHJcbiAgICAvLyBzeW1ib2wsIGFuZCB0aGUgJ1Vua25vd24nIHRleHQuXHJcbiAgICB0aGlzLmhhbGZMaWZlRGlzcGxheU5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICBzY2FsZTogb3B0aW9ucy5oYWxmTGlmZURpc3BsYXlTY2FsZSxcclxuICAgICAgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogdHJ1ZVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5oYWxmTGlmZURpc3BsYXlOb2RlICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgdGhlIHRleHQgZm9yIFwiSGFsZi1saWZlOlwiXHJcbiAgICBjb25zdCBoYWxmTGlmZUNvbG9uVGV4dCA9IG5ldyBSaWNoVGV4dCggQnVpbGRBTnVjbGV1c1N0cmluZ3MuaGFsZkxpZmVDb2xvbiwge1xyXG4gICAgICBmb250OiBUSVRMRV9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogMTE1XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmhhbGZMaWZlRGlzcGxheU5vZGUuYWRkQ2hpbGQoIGhhbGZMaWZlQ29sb25UZXh0ICk7XHJcbiAgICB0aGlzLmhhbGZMaWZlRGlzcGxheU5vZGUubGVmdCA9IHRoaXMubGVmdCArIEJBTkNvbnN0YW50cy5JTkZPX0JVVFRPTl9JTkRFTlRfRElTVEFOQ0UgKyBCQU5Db25zdGFudHMuSU5GT19CVVRUT05fTUFYX0hFSUdIVCArIDEwO1xyXG4gICAgdGhpcy5oYWxmTGlmZURpc3BsYXlOb2RlLmJvdHRvbSA9IGhhbGZMaWZlQXJyb3cudG9wIC0gODtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgXCJVbmtub3duXCIgdGV4dFxyXG4gICAgY29uc3QgaGFsZkxpZmVVbmtub3duVGV4dCA9IG5ldyBSaWNoVGV4dCggQnVpbGRBTnVjbGV1c1N0cmluZ3MudW5rbm93biwge1xyXG4gICAgICBmb250OiBUSVRMRV9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogMTE1XHJcbiAgICB9ICk7XHJcbiAgICBoYWxmTGlmZVVua25vd25UZXh0LmxlZnQgPSBoYWxmTGlmZUNvbG9uVGV4dC5yaWdodCArIDg7XHJcbiAgICBoYWxmTGlmZVVua25vd25UZXh0LmJvdHRvbSA9IGhhbGZMaWZlQ29sb25UZXh0LmJvdHRvbTtcclxuICAgIHRoaXMuaGFsZkxpZmVEaXNwbGF5Tm9kZS5hZGRDaGlsZCggaGFsZkxpZmVVbmtub3duVGV4dCApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSBpbmZpbml0eSBub2RlLCB3aGljaCByZXByZXNlbnRzIGEgbWF0aCBpbmZpbml0eSBzeW1ib2xcclxuICAgIGNvbnN0IGluZmluaXR5Tm9kZSA9IG5ldyBJbmZpbml0eU5vZGUoKTtcclxuICAgIGluZmluaXR5Tm9kZS5sZWZ0ID0gaGFsZkxpZmVVbmtub3duVGV4dC5sZWZ0O1xyXG4gICAgaW5maW5pdHlOb2RlLmJvdHRvbSA9IGhhbGZMaWZlVW5rbm93blRleHQuYm90dG9tIC0gNTsgLy8gb2Zmc2V0IHRvIG1hdGNoIHRoZSBhcHBhcmVudCBib3R0b20gcG9zaXRpb24gb2YgdGhlIHRleHRcclxuICAgIHRoaXMuaGFsZkxpZmVEaXNwbGF5Tm9kZS5hZGRDaGlsZCggaW5maW5pdHlOb2RlICk7XHJcblxyXG4gICAgLy8gdGhlIGhhbGYgbGlmZSBudW1iZXIgaW4gc2NpZW50aWZpYyBub3RhdGlvbiB3aXRoIGFuICdzJyBmb3Igc2Vjb25kcyBhdCB0aGUgZW5kXHJcbiAgICBjb25zdCBoYWxmTGlmZVNjaWVudGlmaWNOb3RhdGlvbiA9IG5ldyBTY2llbnRpZmljTm90YXRpb25Ob2RlKCBoYWxmTGlmZU51bWJlclByb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IFRJVExFX0ZPTlRcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGhhbGZMaWZlTnVtYmVyVGV4dCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgaGFsZkxpZmVTY2llbnRpZmljTm90YXRpb24sXHJcbiAgICAgICAgbmV3IFRleHQoIEJ1aWxkQU51Y2xldXNTdHJpbmdzLnMsIHsgZm9udDogVElUTEVfRk9OVCwgbWF4V2lkdGg6IDMwIH0gKVxyXG4gICAgICBdLFxyXG4gICAgICBhbGlnbjogJ2JvdHRvbScsXHJcbiAgICAgIHNwYWNpbmc6IDEwXHJcbiAgICB9ICk7XHJcbiAgICBoYWxmTGlmZU51bWJlclRleHQubGVmdCA9IGhhbGZMaWZlVW5rbm93blRleHQubGVmdDtcclxuICAgIHRoaXMuaGFsZkxpZmVEaXNwbGF5Tm9kZS5hZGRDaGlsZCggaGFsZkxpZmVOdW1iZXJUZXh0ICk7XHJcblxyXG4gICAgLy8gaWYgdGhlIGhhbGYtbGlmZSB0ZXh0IGlzIGEgbGFiZWwgdG8gdGhlIGFycm93XHJcbiAgICBpZiAoICFvcHRpb25zLmlzSGFsZkxpZmVMYWJlbEZpeGVkICkge1xyXG5cclxuICAgICAgY29uc3QgZGlzdGFuY2VCZXR3ZWVuRWxlbWVudE5hbWVBbmRIYWxmTGlmZVRleHQgPSA0O1xyXG4gICAgICBjb25zdCBkaXN0YW5jZUJldHdlZW5IYWxmTGlmZVRleHRBbmRBcnJvdyA9IDE0O1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIHRoZSB0ZXh0dWFsIHJlYWRvdXQgZm9yIHRoZSBlbGVtZW50IG5hbWUuXHJcbiAgICAgIGNvbnN0IGVsZW1lbnROYW1lID0gbmV3IFRleHQoICcnLCB7XHJcbiAgICAgICAgZm9udDogdGhpcy5udW1iZXJMaW5lTGFiZWxGb250LFxyXG4gICAgICAgIGZpbGw6IENvbG9yLlJFRCxcclxuICAgICAgICBtYXhXaWR0aDogQkFOQ29uc3RhbnRzLkVMRU1FTlRfTkFNRV9NQVhfV0lEVEhcclxuICAgICAgfSApO1xyXG4gICAgICBlbGVtZW50TmFtZS5jZW50ZXIgPSB0aGlzLmhhbGZMaWZlRGlzcGxheU5vZGUuY2VudGVyLm1pbnVzWFkoIDAsIHRoaXMuaGFsZkxpZmVEaXNwbGF5Tm9kZS5oZWlnaHQgKyAxMCApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBlbGVtZW50TmFtZSApO1xyXG5cclxuICAgICAgLy8gSG9vayB1cCB1cGRhdGUgbGlzdGVuZXJzLlxyXG4gICAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG9wdGlvbnMucHJvdG9uQ291bnRQcm9wZXJ0eSwgb3B0aW9ucy5uZXV0cm9uQ291bnRQcm9wZXJ0eSwgb3B0aW9ucy5kb2VzTnVjbGlkZUV4aXN0Qm9vbGVhblByb3BlcnR5IF0sXHJcbiAgICAgICAgKCBwcm90b25Db3VudCwgbmV1dHJvbkNvdW50LCBkb2VzTnVjbGlkZUV4aXN0ICkgPT5cclxuICAgICAgICAgIEJBTlNjcmVlblZpZXcudXBkYXRlRWxlbWVudE5hbWUoIGVsZW1lbnROYW1lLCBwcm90b25Db3VudCwgbmV1dHJvbkNvdW50LCBkb2VzTnVjbGlkZUV4aXN0LFxyXG4gICAgICAgICAgICB0aGlzLmhhbGZMaWZlRGlzcGxheU5vZGUuY2VudGVyWCxcclxuICAgICAgICAgICAgdGhpcy5oYWxmTGlmZURpc3BsYXlOb2RlLmNlbnRlclkgLSB0aGlzLmhhbGZMaWZlRGlzcGxheU5vZGUuaGVpZ2h0IC0gZGlzdGFuY2VCZXR3ZWVuRWxlbWVudE5hbWVBbmRIYWxmTGlmZVRleHQgKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgdGhpcy5oYWxmTGlmZVRleHRYUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG4gICAgICB0aGlzLmhhbGZMaWZlVGV4dFhQb3NpdGlvblByb3BlcnR5LmxpbmsoIHhQb3NpdGlvbiA9PiB7XHJcblxyXG4gICAgICAgIHRoaXMuaGFsZkxpZmVEaXNwbGF5Tm9kZS50cmFuc2xhdGlvbiA9XHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggdGhpcy5jaGFydFRyYW5zZm9ybS5tb2RlbFRvVmlld1goIHhQb3NpdGlvbiApIC0gdGhpcy5oYWxmTGlmZURpc3BsYXlOb2RlLndpZHRoIC8gMixcclxuICAgICAgICAgICAgaGFsZkxpZmVBcnJvdy50b3AgLSBkaXN0YW5jZUJldHdlZW5IYWxmTGlmZVRleHRBbmRBcnJvdyApO1xyXG5cclxuICAgICAgICBlbGVtZW50TmFtZS50cmFuc2xhdGlvbiA9XHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggdGhpcy5jaGFydFRyYW5zZm9ybS5tb2RlbFRvVmlld1goIHhQb3NpdGlvbiApIC0gZWxlbWVudE5hbWUud2lkdGggLyAyLFxyXG4gICAgICAgICAgICBoYWxmTGlmZUFycm93LnRvcCAtIHRoaXMuaGFsZkxpZmVEaXNwbGF5Tm9kZS5oZWlnaHQgLSBkaXN0YW5jZUJldHdlZW5IYWxmTGlmZVRleHRBbmRBcnJvd1xyXG4gICAgICAgICAgICAtIGRpc3RhbmNlQmV0d2VlbkVsZW1lbnROYW1lQW5kSGFsZkxpZmVUZXh0ICk7XHJcblxyXG4gICAgICAgIC8vIGxlZnQtYWxpZ24gdGhlIHRleHQgaWYgaXQgZ29lcyBvdmVyIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIG51bWJlckxpbmVOb2RlXHJcbiAgICAgICAgaWYgKCB0aGlzLmhhbGZMaWZlRGlzcGxheU5vZGUubGVmdCA8IG51bWJlckxpbmVOb2RlLmxlZnQgKSB7XHJcbiAgICAgICAgICB0aGlzLmhhbGZMaWZlRGlzcGxheU5vZGUubGVmdCA9IG51bWJlckxpbmVOb2RlLmxlZnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggZWxlbWVudE5hbWUubGVmdCA8IG51bWJlckxpbmVOb2RlLmxlZnQgKSB7XHJcbiAgICAgICAgICBlbGVtZW50TmFtZS5sZWZ0ID0gbnVtYmVyTGluZU5vZGUubGVmdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJpZ2h0LWFsaWduIHRoZSB0ZXh0IGlmIGl0IGdvZXMgb3ZlciB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgbnVtYmVyTGluZU5vZGVcclxuICAgICAgICBpZiAoIHRoaXMuaGFsZkxpZmVEaXNwbGF5Tm9kZS5yaWdodCA+IG51bWJlckxpbmVOb2RlLnJpZ2h0ICkge1xyXG4gICAgICAgICAgdGhpcy5oYWxmTGlmZURpc3BsYXlOb2RlLnJpZ2h0ID0gbnVtYmVyTGluZU5vZGUucmlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggZWxlbWVudE5hbWUucmlnaHQgPiBudW1iZXJMaW5lTm9kZS5yaWdodCApIHtcclxuICAgICAgICAgIGVsZW1lbnROYW1lLnJpZ2h0ID0gbnVtYmVyTGluZU5vZGUucmlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5oYWxmTGlmZUFycm93Um90YXRpb25Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyB0aGlzLmhhbGZMaWZlQXJyb3dSb3RhdGlvblByb3BlcnR5IF0sIHJvdGF0aW9uID0+IHtcclxuICAgICAgaGFsZkxpZmVBcnJvdy5yb3RhdGlvbiA9IHJvdGF0aW9uO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGZ1bmN0aW9uIHRvIHNob3cgb3IgaGlkZSB0aGUgaGFsZkxpZmVBcnJvd1xyXG4gICAgY29uc3Qgc2hvd0hhbGZMaWZlQXJyb3cgPSAoIHNob3c6IGJvb2xlYW4gKSA9PiB7XHJcbiAgICAgIGhhbGZMaWZlQXJyb3cudmlzaWJsZSA9IHNob3c7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGxpbmsgdGhlIGhhbGZMaWZlTnVtYmVyUHJvcGVydHkgdG8gdGhlIGhhbGYtbGlmZSBhcnJvdyBpbmRpY2F0b3IgYW5kIHRvIHRoZSBoYWxmLWxpZmUgbnVtYmVyIHJlYWRvdXRcclxuICAgIGhhbGZMaWZlTnVtYmVyUHJvcGVydHkubGluayggaGFsZkxpZmVOdW1iZXIgPT4ge1xyXG5cclxuICAgICAgLy8gdGhlIG51Y2xpZGUgaXMgc3RhYmxlXHJcbiAgICAgIGlmICggaXNTdGFibGVCb29sZWFuUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgc2hvd0hhbGZMaWZlQXJyb3coIHRydWUgKTtcclxuXHJcbiAgICAgICAgaW5maW5pdHlOb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIGhhbGZMaWZlVW5rbm93blRleHQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIGhhbGZMaWZlTnVtYmVyVGV4dC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIHBlZyB0aGUgaW5kaWNhdG9yIHRvIHRoZSByaWdodCB3aGVuIHN0YWJsZVxyXG4gICAgICAgIHRoaXMubW92ZUhhbGZMaWZlUG9pbnRlclNldCggaGFsZkxpZmVOdW1iZXIsIG9wdGlvbnMuaXNIYWxmTGlmZUxhYmVsRml4ZWQgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdGhlIG51Y2xpZGUgaXMgdW5zdGFibGUgb3IgZG9lcyBub3QgZXhpc3RcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgaW5maW5pdHlOb2RlLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gdGhlIG51Y2xpZGUgZG9lcyBub3QgZXhpc3RcclxuICAgICAgICBpZiAoIGhhbGZMaWZlTnVtYmVyID09PSAwICkge1xyXG4gICAgICAgICAgc2hvd0hhbGZMaWZlQXJyb3coIGZhbHNlICk7XHJcblxyXG4gICAgICAgICAgaGFsZkxpZmVVbmtub3duVGV4dC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICBoYWxmTGlmZU51bWJlclRleHQudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIHRoaXMubW92ZUhhbGZMaWZlUG9pbnRlclNldCggaGFsZkxpZmVOdW1iZXIsIG9wdGlvbnMuaXNIYWxmTGlmZUxhYmVsRml4ZWQgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHRoZSBudWNsaWRlIGlzIHVuc3RhYmxlIGJ1dCB0aGUgaGFsZi1saWZlIGRhdGEgaXMgdW5rbm93blxyXG4gICAgICAgIGVsc2UgaWYgKCBoYWxmTGlmZU51bWJlciA9PT0gLTEgKSB7XHJcbiAgICAgICAgICBzaG93SGFsZkxpZmVBcnJvdyggZmFsc2UgKTtcclxuXHJcbiAgICAgICAgICBoYWxmTGlmZVVua25vd25UZXh0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgaGFsZkxpZmVOdW1iZXJUZXh0LnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICB0aGlzLm1vdmVIYWxmTGlmZVBvaW50ZXJTZXQoIDAsIG9wdGlvbnMuaXNIYWxmTGlmZUxhYmVsRml4ZWQgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHRoZSBudWNsaWRlIGlzIHVuc3RhYmxlIGFuZCB0aGUgaGFsZi1saWZlIGRhdGEgaXMga25vd25cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHNob3dIYWxmTGlmZUFycm93KCB0cnVlICk7XHJcblxyXG4gICAgICAgICAgaGFsZkxpZmVVbmtub3duVGV4dC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICBoYWxmTGlmZU51bWJlclRleHQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICBoYWxmTGlmZU51bWJlclRleHQuYm90dG9tID0gaGFsZkxpZmVDb2xvblRleHQuYm90dG9tO1xyXG5cclxuICAgICAgICAgIC8vIHBlZyB0aGUgaW5kaWNhdG9yIHRvIHRoZSByaWdodCB3aGVuIHRoZSBoYWxmLWxpZmUgZ29lcyBvZmYtc2NhbGUgYnV0IHN0aWxsIHNob3cgdGhlIGFjY3VyYXRlIGhhbGYtbGlmZSByZWFkb3V0XHJcbiAgICAgICAgICBpZiAoIGhhbGZMaWZlTnVtYmVyID4gTWF0aC5wb3coIDEwLCBCQU5Db25zdGFudHMuSEFMRl9MSUZFX05VTUJFUl9MSU5FX0VORF9FWFBPTkVOVCApICkge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVIYWxmTGlmZVBvaW50ZXJTZXQoIE1hdGgucG93KCAxMCwgQkFOQ29uc3RhbnRzLkhBTEZfTElGRV9OVU1CRVJfTElORV9FTkRfRVhQT05FTlQgKSxcclxuICAgICAgICAgICAgICBvcHRpb25zLmlzSGFsZkxpZmVMYWJlbEZpeGVkICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlSGFsZkxpZmVQb2ludGVyU2V0KCBoYWxmTGlmZU51bWJlciwgb3B0aW9ucy5pc0hhbGZMaWZlTGFiZWxGaXhlZCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSB1bml0cyBsYWJlbCBvbiB0aGUgbnVtYmVyIGxpbmVcclxuICAgIGNvbnN0IG51bWJlckxpbmVVbml0c0xhYmVsID0gbmV3IFRleHQoIEJ1aWxkQU51Y2xldXNTdHJpbmdzLnNlY29uZHMsIHtcclxuICAgICAgZm9udDogb3B0aW9ucy51bml0c0xhYmVsRm9udCxcclxuICAgICAgbWF4V2lkdGg6IDE1MFxyXG4gICAgfSApO1xyXG4gICAgbnVtYmVyTGluZVVuaXRzTGFiZWwuY2VudGVyWSA9IHRoaXMuYm90dG9tICsgbnVtYmVyTGluZVVuaXRzTGFiZWwuaGVpZ2h0IC8gMjtcclxuICAgIG51bWJlckxpbmVVbml0c0xhYmVsLmNlbnRlclggPSB0aGlzLmNlbnRlclg7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBudW1iZXJMaW5lVW5pdHNMYWJlbCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQW5pbWF0ZSB0aGUgaGFsZi1saWZlIGFycm93IHRvIHRoZSBuZXcgaGFsZi1saWZlIHBvc2l0aW9uIGFsb25nIHRoZSBudW1iZXIgbGluZS4gSWYgdGhlIGhhbGYtbGlmZSB0ZXh0IGlzIGEgbGFiZWxcclxuICAgKiB0byB0aGUgaGFsZi1saWZlIGFycm93LCBhbmltYXRlIGl0IHRvIGl0cyBuZXcgaGFsZi1saWZlIHBvc2l0aW9uIHRvby5cclxuICAgKi9cclxuICBwcml2YXRlIG1vdmVIYWxmTGlmZVBvaW50ZXJTZXQoIGhhbGZMaWZlOiBudW1iZXIsIGlzSGFsZkxpZmVMYWJlbEZpeGVkOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgY29uc3QgbmV3WFBvc2l0aW9uID0gSGFsZkxpZmVOdW1iZXJMaW5lTm9kZS5sb2dTY2FsZU51bWJlclRvTGluZWFyU2NhbGVOdW1iZXIoIGhhbGZMaWZlICk7XHJcblxyXG4gICAgY29uc3QgYXJyb3dYUG9zaXRpb25BbmltYXRpb25EdXJhdGlvbiA9IDAuNzsgLy8gaW4gc2Vjb25kc1xyXG5cclxuICAgIC8vIGFuaW1hdGUgdGhlIGhhbGYtbGlmZSBhcnJvdydzIHggcG9zaXRpb25cclxuICAgIGlmICggdGhpcy5hcnJvd1hQb3NpdGlvbkFuaW1hdGlvbiApIHtcclxuICAgICAgdGhpcy5hcnJvd1hQb3NpdGlvbkFuaW1hdGlvbi5zdG9wKCk7XHJcbiAgICAgIHRoaXMuYXJyb3dYUG9zaXRpb25BbmltYXRpb24gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggaXNIYWxmTGlmZUxhYmVsRml4ZWQgKSB7XHJcbiAgICAgIHRoaXMuYXJyb3dYUG9zaXRpb25BbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgdG86IG5ld1hQb3NpdGlvbixcclxuICAgICAgICBwcm9wZXJ0eTogdGhpcy5hcnJvd1hQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICAgIGR1cmF0aW9uOiBhcnJvd1hQb3NpdGlvbkFuaW1hdGlvbkR1cmF0aW9uLFxyXG4gICAgICAgIGVhc2luZzogRWFzaW5nLlFVQURSQVRJQ19JTl9PVVRcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuYXJyb3dYUG9zaXRpb25BbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgdGFyZ2V0czogWyB7XHJcbiAgICAgICAgICB0bzogbmV3WFBvc2l0aW9uLFxyXG4gICAgICAgICAgcHJvcGVydHk6IHRoaXMuYXJyb3dYUG9zaXRpb25Qcm9wZXJ0eVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgIHRvOiBuZXdYUG9zaXRpb24sXHJcbiAgICAgICAgICBwcm9wZXJ0eTogdGhpcy5oYWxmTGlmZVRleHRYUG9zaXRpb25Qcm9wZXJ0eVxyXG4gICAgICAgIH0gXSxcclxuICAgICAgICBkdXJhdGlvbjogYXJyb3dYUG9zaXRpb25BbmltYXRpb25EdXJhdGlvbixcclxuICAgICAgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VUXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhcnJvd1JvdGF0aW9uQW5pbWF0aW9uRHVyYXRpb24gPSAwLjE7IC8vIGluIHNlY29uZHNcclxuXHJcbiAgICAvLyBpZiB0aGUgaGFsZkxpZmUgbnVtYmVyIGlzIHN0YWJsZSwgdGhlbiBhbmltYXRlIHRoZSBhcnJvdydzIHJvdGF0aW9uXHJcbiAgICBpZiAoIHRoaXMuYXJyb3dSb3RhdGlvbkFuaW1hdGlvbiApIHtcclxuICAgICAgdGhpcy5hcnJvd1JvdGF0aW9uQW5pbWF0aW9uLnN0b3AoKTtcclxuICAgICAgdGhpcy5hcnJvd1JvdGF0aW9uQW5pbWF0aW9uID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGhhbGZMaWZlID09PSBNYXRoLnBvdyggMTAsIEJBTkNvbnN0YW50cy5IQUxGX0xJRkVfTlVNQkVSX0xJTkVfRU5EX0VYUE9ORU5UICkgKSB7XHJcblxyXG4gICAgICAvLyByb3RhdGUgYXJyb3cgaG9yaXpvbnRhbGx5LCBwb2ludGluZyByaWdodFxyXG4gICAgICB0aGlzLmFycm93Um90YXRpb25BbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgdG86IC1NYXRoLlBJIC8gMixcclxuICAgICAgICBwcm9wZXJ0eTogdGhpcy5oYWxmTGlmZUFycm93Um90YXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICBkdXJhdGlvbjogYXJyb3dSb3RhdGlvbkFuaW1hdGlvbkR1cmF0aW9uLFxyXG4gICAgICAgIGVhc2luZzogRWFzaW5nLlFVQURSQVRJQ19JTl9PVVRcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgdGhpcy5hcnJvd1hQb3NpdGlvbkFuaW1hdGlvbi50aGVuKCB0aGlzLmFycm93Um90YXRpb25BbmltYXRpb24gKTtcclxuICAgICAgdGhpcy5hcnJvd1hQb3NpdGlvbkFuaW1hdGlvbi5zdGFydCgpO1xyXG5cclxuICAgICAgdGhpcy5hcnJvd1JvdGF0aW9uQW5pbWF0aW9uLmZpbmlzaEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgICB0aGlzLmFycm93Um90YXRpb25BbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYXJyb3dYUG9zaXRpb25BbmltYXRpb24gPSBudWxsO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIHJvdGF0ZSBhcnJvdyBiYWNrIHZlcnRpY2FsbHksIHBvaW50aW5nIGRvd25cclxuICAgICAgdGhpcy5hcnJvd1JvdGF0aW9uQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICAgIHRvOiAwLFxyXG4gICAgICAgIHByb3BlcnR5OiB0aGlzLmhhbGZMaWZlQXJyb3dSb3RhdGlvblByb3BlcnR5LFxyXG4gICAgICAgIGR1cmF0aW9uOiBhcnJvd1JvdGF0aW9uQW5pbWF0aW9uRHVyYXRpb24sXHJcbiAgICAgICAgZWFzaW5nOiBFYXNpbmcuUVVBRFJBVElDX0lOX09VVFxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB0aGlzLmFycm93Um90YXRpb25BbmltYXRpb24udGhlbiggdGhpcy5hcnJvd1hQb3NpdGlvbkFuaW1hdGlvbiApO1xyXG4gICAgICB0aGlzLmFycm93Um90YXRpb25BbmltYXRpb24uc3RhcnQoKTtcclxuXHJcbiAgICAgIHRoaXMuYXJyb3dYUG9zaXRpb25BbmltYXRpb24uZmluaXNoRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXJyb3dYUG9zaXRpb25BbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYXJyb3dSb3RhdGlvbkFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhbiBhcnJvdyB3aXRoIGEgbGFiZWwgdG8gdGhlIG51bWJlciBsaW5lLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRBcnJvd0FuZExhYmVsKCBsYWJlbDogc3RyaW5nLCBoYWxmTGlmZTogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgY29uc3QgeFBvc2l0aW9uID0gSGFsZkxpZmVOdW1iZXJMaW5lTm9kZS5sb2dTY2FsZU51bWJlclRvTGluZWFyU2NhbGVOdW1iZXIoIGhhbGZMaWZlICk7XHJcbiAgICBjb25zdCBhcnJvdyA9IG5ldyBBcnJvd05vZGUoIHRoaXMuY2hhcnRUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCB4UG9zaXRpb24gKSwgLTE3LjUsXHJcbiAgICAgIHRoaXMuY2hhcnRUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCB4UG9zaXRpb24gKSwgdGhpcy50aWNrTWFya1NldC5jZW50ZXJZLCB7XHJcbiAgICAgICAgZmlsbDogQkFOQ29sb3JzLmxlZ2VuZEFycm93Q29sb3JQcm9wZXJ0eSxcclxuICAgICAgICBzdHJva2U6IG51bGwsXHJcbiAgICAgICAgdGFpbFdpZHRoOiAxLjUsXHJcbiAgICAgICAgaGVhZFdpZHRoOiA1XHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGFycm93ICk7XHJcbiAgICBjb25zdCBudW1iZXJUZXh0ID0gbmV3IFJpY2hUZXh0KCBsYWJlbCwgeyBmb250OiB0aGlzLm51bWJlckxpbmVMYWJlbEZvbnQsIG1heFdpZHRoOiAyNSB9ICk7XHJcbiAgICBudW1iZXJUZXh0LmJvdHRvbSA9IGFycm93LnRvcDtcclxuICAgIG51bWJlclRleHQuY2VudGVyWCA9IGFycm93LmNlbnRlclg7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBudW1iZXJUZXh0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0IHRoZSBoYWxmLWxpZmUgbnVtYmVyIChpbiBzZWNvbmRzKSB0byBhIGxpbmVhciBzY2FsZSBudW1iZXIgdG8gcGxvdCBpdCBvbiB0aGUgbnVtYmVyIGxpbmUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgbG9nU2NhbGVOdW1iZXJUb0xpbmVhclNjYWxlTnVtYmVyKCBoYWxmTGlmZU51bWJlcjogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBpZiAoIGhhbGZMaWZlTnVtYmVyID09PSAwICkge1xyXG4gICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIHJldHVybiBVdGlscy5sb2cxMCggaGFsZkxpZmVOdW1iZXIgKTtcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQU51Y2xldXMucmVnaXN0ZXIoICdIYWxmTGlmZU51bWJlckxpbmVOb2RlJywgSGFsZkxpZmVOdW1iZXJMaW5lTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBIYWxmTGlmZU51bWJlckxpbmVOb2RlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLE9BQU8sTUFB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