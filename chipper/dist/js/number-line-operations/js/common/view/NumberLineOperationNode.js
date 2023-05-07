// Copyright 2020-2023, University of Colorado Boulder

/**
 * NumberLineOperationNode is used to depict an operation on a number line.  It looks like a curved arrow with a label
 * and a textual description that can be optionally shown. This node updates itself as the attributes of the underlying
 * operation or anything else that can affect the appearance changes.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Utils from '../../../../dot/js/Utils.js';
import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Node, Text } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';
import Operation from '../model/Operation.js';
import OperationArrowNode from './OperationArrowNode.js';

// constants
const RelativePosition = EnumerationDeprecated.byKeys(['ABOVE_NUMBER_LINE', 'BELOW_NUMBER_LINE']);
const DISTANCE_BETWEEN_LABELS = 3; // in screen coordinates
const OPERATION_OFF_SCALE_LABEL_FONT = new PhetFont(14);
const OPERATION_DESCRIPTION_PRE_FADE_DELAY = 0.7; // in seconds
const OPERATION_DESCRIPTION_FADE_IN_TIME = 0.4; // in seconds
const DISTANCE_NUMBER_LINE_TO_LABELS = 45; // in screen coordinates, empirically chosen to look good

class NumberLineOperationNode extends Node {
  /**
   * @param {NumberLineOperation} operation
   * @param {BooleanProperty} showLabelProperty
   * @param {BooleanProperty} showDescriptionProperty
   * @param {OperationTrackingNumberLine} numberLine
   * @param {Object} [options]
   */
  constructor(operation, showLabelProperty, showDescriptionProperty, numberLine, options) {
    // Make sure the number line is in the horizontal orientation.  While it wouldn't be too difficult to generalize
    // this class to handle the vertical orientation, to date it hasn't been needed, so it hasn't been done.
    assert && assert(numberLine.isHorizontal, 'this class is not generalized to handle vertical number lines ');
    options = merge({
      relativePosition: RelativePosition.ABOVE_NUMBER_LINE,
      operationLabelFont: new PhetFont(18),
      operationDescriptionFont: new PhetFont(18),
      // {boolean} - animate the drawing of the arrow when it transitions from inactive to active
      animateOnActive: true,
      // {boolean} - fade in the description when the operation becomes active
      operationDescriptionsFadeIn: false,
      // {boolean} - Controls whether financial terminology, such as "remove asset of $100", is used for the operation
      // descriptions versus more generic phrases like "remove positive 100".
      useFinancialDescriptions: false
    }, options);
    super(options);

    // @private
    this.numberLine = numberLine;
    this.operation = operation;
    const operationNumber = numberLine.operations.indexOf(operation);

    // @private - point from which this operation starts
    const originPoint = operationNumber === 0 ? numberLine.startingPoint : numberLine.endpoints[operationNumber - 1];

    // convenience var
    const aboveNumberLine = options.relativePosition === RelativePosition.ABOVE_NUMBER_LINE;

    // operation label
    const operationLabelTextNode = new Text('', {
      font: options.operationLabelFont,
      maxWidth: 150 // empirically determined
    });

    const operationLabel = new BackgroundNode(operationLabelTextNode, NLCConstants.LABEL_BACKGROUND_OPTIONS);
    this.addChild(operationLabel);

    // operation description
    const operationDescriptionTextNode = new Text('', {
      font: options.operationDescriptionFont
    });
    const operationDescription = new BackgroundNode(operationDescriptionTextNode, merge({}, NLCConstants.LABEL_BACKGROUND_OPTIONS, {
      maxWidth: 225
    } // empirically determined so as to never end up partially outside the dev bounds
    ));

    this.addChild(operationDescription);

    // variables used to position the operation description, since it needs to move based on whether the label is visible
    let descriptionCenterYWhenLabelVisible = 0;
    let descriptionCenterYWhenLabelNotVisible = 0;

    // animation that is used to fade in the operation description
    let operationDescriptionFadeInAnimation = null;

    // Update the description as the isActive state changes.  No unlink is needed.
    operation.isActiveProperty.lazyLink(isActive => {
      if (isActive && options.operationDescriptionsFadeIn) {
        if (operationDescriptionFadeInAnimation) {
          operationDescriptionFadeInAnimation.stop();
        }

        // Create an animation to fade in the operation description by adjusting its opacity.  The "visible" property is
        // handled elsewhere.
        const fadeInDuration = OPERATION_DESCRIPTION_PRE_FADE_DELAY + OPERATION_DESCRIPTION_FADE_IN_TIME;
        operationDescriptionFadeInAnimation = new Animation({
          duration: fadeInDuration,
          from: 0,
          to: fadeInDuration,
          easing: Easing.CUBIC_IN,
          setValue: time => {
            if (time <= OPERATION_DESCRIPTION_PRE_FADE_DELAY) {
              operationDescription.opacity = 0;
            } else {
              operationDescription.opacity = Math.min((time - OPERATION_DESCRIPTION_PRE_FADE_DELAY) / OPERATION_DESCRIPTION_FADE_IN_TIME, 1);
            }
          }
        });
        operationDescriptionFadeInAnimation.start();
        operationDescriptionFadeInAnimation.endedEmitter.addListener(() => {
          // Remove the reference to the animation.
          operationDescriptionFadeInAnimation = null;
        });
      }
    });

    // arrow that represents the start and end of the operation
    this.addChild(new OperationArrowNode(numberLine, operation, {
      relativePosition: options.relativePosition,
      animateOnActive: options.animateOnActive
    }));

    // Update the labels and label positions as the attributes of the operation and number line change.
    const updateMultilink = Multilink.multilink([operation.isActiveProperty, originPoint.valueProperty, showLabelProperty, showDescriptionProperty, operation.operationTypeProperty, operation.amountProperty, numberLine.displayedRangeProperty, numberLine.centerPositionProperty], (isActive, operationStartValue, showLabel, showDescription) => {
      const operationEndValue = numberLine.getOperationResult(operation);
      if (isActive) {
        this.visible = true;
        const startPosition = numberLine.valueToModelPosition(operationStartValue);
        const endPosition = numberLine.valueToModelPosition(operationEndValue);

        // Update the operation label text and background.
        if (numberLine.isOperationCompletelyOutOfDisplayedRange(operation) || numberLine.isOperationAtEdgeOfDisplayedRange(operation) && operation.amountProperty.value !== 0) {
          // The depiction of the arrow portion of the operation is either at the very edge of the number line or
          // completely off of it, so use a special label that indicates this.
          operationLabelTextNode.string = NumberLineOperationsStrings.operationOffScale;

          // Use a different (generally smaller) font in this case.
          operationLabelTextNode.font = OPERATION_OFF_SCALE_LABEL_FONT;

          // Make the label stroked in this case.
          operationLabel.background.stroke = Color.BLACK;
        } else {
          const operationChar = operation.operationTypeProperty.value === Operation.ADDITION ? MathSymbols.UNARY_PLUS : MathSymbols.MINUS;
          const signChar = operation.amountProperty.value < 0 ? MathSymbols.MINUS : operation.amountProperty.value > 0 ? MathSymbols.UNARY_PLUS : '';
          operationLabelTextNode.string = `${operationChar} ${signChar}${Math.abs(operation.amountProperty.value).toString(10)}`;
          operationLabelTextNode.font = options.operationLabelFont;

          // no stroke in this case
          operationLabel.background.stroke = null;
        }

        // Position the operation label.
        if (aboveNumberLine) {
          operationLabel.bottom = startPosition.y - DISTANCE_NUMBER_LINE_TO_LABELS;
        } else {
          operationLabel.top = startPosition.y + DISTANCE_NUMBER_LINE_TO_LABELS;
        }

        // Update the operation description.
        operationDescriptionTextNode.string = NumberLineOperationNode.getOperationDescriptionString(operation, options.useFinancialDescriptions);
        descriptionCenterYWhenLabelVisible = aboveNumberLine ? operationLabel.top - operationDescription.height / 2 - DISTANCE_BETWEEN_LABELS : operationLabel.bottom + operationDescription.height / 2 + DISTANCE_BETWEEN_LABELS;
        descriptionCenterYWhenLabelNotVisible = operationLabel.centerY;
        operationDescription.centerY = showLabel ? descriptionCenterYWhenLabelVisible : descriptionCenterYWhenLabelNotVisible;

        // Set the X position of the labels such that they are at the center of the operation unless doing so would
        // put the center of the label past the edge of the number line.  In that case, limit the X position to the
        // max value of the number line.
        const labelsCenterX = Utils.clamp((startPosition.x + endPosition.x) / 2, numberLine.valueToModelPosition(numberLine.displayedRangeProperty.value.min).x, numberLine.valueToModelPosition(numberLine.displayedRangeProperty.value.max).x);
        operationLabel.centerX = labelsCenterX;
        operationDescription.centerX = labelsCenterX;

        // Determine whether the points on the number line are all above or below the displayed range, since that is
        // factored in to the visibility of the label.
        const displayedRange = numberLine.displayedRangeProperty.value;
        const allPointsAboveDisplayRange = numberLine.residentPoints.reduce((allPointsAboveMax, point) => allPointsAboveMax && point.valueProperty.value > displayedRange.max, true);
        const allPointsBelowDisplayRange = numberLine.residentPoints.reduce((allPointsAboveMax, point) => allPointsAboveMax && point.valueProperty.value < displayedRange.min, true);

        // Set the visibility of the label and description.  This is controlled by a combination of the user's
        // settings and the position of the operation and number line points.
        operationLabel.visible = showLabel && !(allPointsAboveDisplayRange || allPointsBelowDisplayRange);
        operationDescription.visible = showDescription && !numberLine.isOperationAtEdgeOfDisplayedRange(operation) && !this.numberLine.isOperationCompletelyOutOfDisplayedRange(operation);
      } else {
        this.visible = false;
      }
    });

    // Update the position of the operation description based on the visibility of the operation label.  An animation is
    // used to make this look cool.  No unlink is needed.
    let descriptionMovementAnimation = null;
    const commonAnimationOptions = {
      duration: 0.25,
      easing: Easing.LINEAR,
      setValue: value => {
        operationDescription.centerY = value;
      }
    };
    showLabelProperty.lazyLink(labelVisible => {
      // Stop any in-progress animation of the label position.
      descriptionMovementAnimation && descriptionMovementAnimation.stop();
      if (labelVisible && operationDescription.centerY !== descriptionCenterYWhenLabelVisible) {
        descriptionMovementAnimation = new Animation(merge({
          from: operationDescription.centerY,
          to: descriptionCenterYWhenLabelVisible
        }, commonAnimationOptions));
        descriptionMovementAnimation.start();
      } else if (!labelVisible && operationDescription.centerY !== descriptionCenterYWhenLabelNotVisible) {
        descriptionMovementAnimation = new Animation(merge({
          from: operationDescription.centerY,
          to: descriptionCenterYWhenLabelNotVisible
        }, commonAnimationOptions));
        descriptionMovementAnimation.start();
      }
      descriptionMovementAnimation && descriptionMovementAnimation.endedEmitter.addListener(() => {
        descriptionMovementAnimation = null;
      });
    });

    // @private - dispose function
    this.disposeNumberLineOperationNode = () => {
      updateMultilink.dispose();
    };
  }

  /**
   * Create a string that describes this operation.
   * @param {NumberLineOperation} operation
   * @param {boolean} useFinancialDescriptions - Controls whether to use financial terms like "asset" or more generic
   * terminology in the descriptions.
   * @returns {string}
   * @private
   */
  static getOperationDescriptionString(operation, useFinancialDescriptions) {
    const addOrRemoveString = operation.operationTypeProperty.value === Operation.ADDITION ? NumberLineOperationsStrings.add : NumberLineOperationsStrings.remove;
    let operationDescriptionString;
    if (useFinancialDescriptions) {
      if (operation.amountProperty.value === 0) {
        operationDescriptionString = StringUtils.fillIn(NumberLineOperationsStrings.addRemoveZeroCurrencyPattern, {
          addOrRemove: addOrRemoveString,
          currencyUnits: NumberLineOperationsStrings.currencyUnits
        });
      } else {
        operationDescriptionString = StringUtils.fillIn(NumberLineOperationsStrings.addRemoveAssetDebtPattern, {
          addOrRemove: addOrRemoveString,
          assetOrDebt: operation.amountProperty.value > 0 ? NumberLineOperationsStrings.asset : NumberLineOperationsStrings.debt,
          currencyUnits: NumberLineOperationsStrings.currencyUnits,
          value: Math.abs(operation.amountProperty.value)
        });
      }
    } else {
      if (operation.amountProperty.value === 0) {
        operationDescriptionString = StringUtils.fillIn(NumberLineOperationsStrings.addRemoveZeroPattern, {
          addOrRemove: addOrRemoveString
        });
      } else {
        operationDescriptionString = StringUtils.fillIn(NumberLineOperationsStrings.addRemovePositiveNegativePattern, {
          addOrRemove: addOrRemoveString,
          positiveOrNegative: operation.amountProperty.value > 0 ? NumberLineOperationsStrings.positive : NumberLineOperationsStrings.negative,
          value: Math.abs(operation.amountProperty.value)
        });
      }
    }
    return operationDescriptionString;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeNumberLineOperationNode();
    super.dispose();
  }
}

// statics
NumberLineOperationNode.RelativePosition = RelativePosition;
numberLineOperations.register('NumberLineOperationNode', NumberLineOperationNode);
export default NumberLineOperationNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJVdGlscyIsIk5MQ0NvbnN0YW50cyIsIkVudW1lcmF0aW9uRGVwcmVjYXRlZCIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJCYWNrZ3JvdW5kTm9kZSIsIk1hdGhTeW1ib2xzIiwiUGhldEZvbnQiLCJDb2xvciIsIk5vZGUiLCJUZXh0IiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwibnVtYmVyTGluZU9wZXJhdGlvbnMiLCJOdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MiLCJPcGVyYXRpb24iLCJPcGVyYXRpb25BcnJvd05vZGUiLCJSZWxhdGl2ZVBvc2l0aW9uIiwiYnlLZXlzIiwiRElTVEFOQ0VfQkVUV0VFTl9MQUJFTFMiLCJPUEVSQVRJT05fT0ZGX1NDQUxFX0xBQkVMX0ZPTlQiLCJPUEVSQVRJT05fREVTQ1JJUFRJT05fUFJFX0ZBREVfREVMQVkiLCJPUEVSQVRJT05fREVTQ1JJUFRJT05fRkFERV9JTl9USU1FIiwiRElTVEFOQ0VfTlVNQkVSX0xJTkVfVE9fTEFCRUxTIiwiTnVtYmVyTGluZU9wZXJhdGlvbk5vZGUiLCJjb25zdHJ1Y3RvciIsIm9wZXJhdGlvbiIsInNob3dMYWJlbFByb3BlcnR5Iiwic2hvd0Rlc2NyaXB0aW9uUHJvcGVydHkiLCJudW1iZXJMaW5lIiwib3B0aW9ucyIsImFzc2VydCIsImlzSG9yaXpvbnRhbCIsInJlbGF0aXZlUG9zaXRpb24iLCJBQk9WRV9OVU1CRVJfTElORSIsIm9wZXJhdGlvbkxhYmVsRm9udCIsIm9wZXJhdGlvbkRlc2NyaXB0aW9uRm9udCIsImFuaW1hdGVPbkFjdGl2ZSIsIm9wZXJhdGlvbkRlc2NyaXB0aW9uc0ZhZGVJbiIsInVzZUZpbmFuY2lhbERlc2NyaXB0aW9ucyIsIm9wZXJhdGlvbk51bWJlciIsIm9wZXJhdGlvbnMiLCJpbmRleE9mIiwib3JpZ2luUG9pbnQiLCJzdGFydGluZ1BvaW50IiwiZW5kcG9pbnRzIiwiYWJvdmVOdW1iZXJMaW5lIiwib3BlcmF0aW9uTGFiZWxUZXh0Tm9kZSIsImZvbnQiLCJtYXhXaWR0aCIsIm9wZXJhdGlvbkxhYmVsIiwiTEFCRUxfQkFDS0dST1VORF9PUFRJT05TIiwiYWRkQ2hpbGQiLCJvcGVyYXRpb25EZXNjcmlwdGlvblRleHROb2RlIiwib3BlcmF0aW9uRGVzY3JpcHRpb24iLCJkZXNjcmlwdGlvbkNlbnRlcllXaGVuTGFiZWxWaXNpYmxlIiwiZGVzY3JpcHRpb25DZW50ZXJZV2hlbkxhYmVsTm90VmlzaWJsZSIsIm9wZXJhdGlvbkRlc2NyaXB0aW9uRmFkZUluQW5pbWF0aW9uIiwiaXNBY3RpdmVQcm9wZXJ0eSIsImxhenlMaW5rIiwiaXNBY3RpdmUiLCJzdG9wIiwiZmFkZUluRHVyYXRpb24iLCJkdXJhdGlvbiIsImZyb20iLCJ0byIsImVhc2luZyIsIkNVQklDX0lOIiwic2V0VmFsdWUiLCJ0aW1lIiwib3BhY2l0eSIsIk1hdGgiLCJtaW4iLCJzdGFydCIsImVuZGVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwidXBkYXRlTXVsdGlsaW5rIiwibXVsdGlsaW5rIiwidmFsdWVQcm9wZXJ0eSIsIm9wZXJhdGlvblR5cGVQcm9wZXJ0eSIsImFtb3VudFByb3BlcnR5IiwiZGlzcGxheWVkUmFuZ2VQcm9wZXJ0eSIsImNlbnRlclBvc2l0aW9uUHJvcGVydHkiLCJvcGVyYXRpb25TdGFydFZhbHVlIiwic2hvd0xhYmVsIiwic2hvd0Rlc2NyaXB0aW9uIiwib3BlcmF0aW9uRW5kVmFsdWUiLCJnZXRPcGVyYXRpb25SZXN1bHQiLCJ2aXNpYmxlIiwic3RhcnRQb3NpdGlvbiIsInZhbHVlVG9Nb2RlbFBvc2l0aW9uIiwiZW5kUG9zaXRpb24iLCJpc09wZXJhdGlvbkNvbXBsZXRlbHlPdXRPZkRpc3BsYXllZFJhbmdlIiwiaXNPcGVyYXRpb25BdEVkZ2VPZkRpc3BsYXllZFJhbmdlIiwidmFsdWUiLCJzdHJpbmciLCJvcGVyYXRpb25PZmZTY2FsZSIsImJhY2tncm91bmQiLCJzdHJva2UiLCJCTEFDSyIsIm9wZXJhdGlvbkNoYXIiLCJBRERJVElPTiIsIlVOQVJZX1BMVVMiLCJNSU5VUyIsInNpZ25DaGFyIiwiYWJzIiwidG9TdHJpbmciLCJib3R0b20iLCJ5IiwidG9wIiwiZ2V0T3BlcmF0aW9uRGVzY3JpcHRpb25TdHJpbmciLCJoZWlnaHQiLCJjZW50ZXJZIiwibGFiZWxzQ2VudGVyWCIsImNsYW1wIiwieCIsIm1heCIsImNlbnRlclgiLCJkaXNwbGF5ZWRSYW5nZSIsImFsbFBvaW50c0Fib3ZlRGlzcGxheVJhbmdlIiwicmVzaWRlbnRQb2ludHMiLCJyZWR1Y2UiLCJhbGxQb2ludHNBYm92ZU1heCIsInBvaW50IiwiYWxsUG9pbnRzQmVsb3dEaXNwbGF5UmFuZ2UiLCJkZXNjcmlwdGlvbk1vdmVtZW50QW5pbWF0aW9uIiwiY29tbW9uQW5pbWF0aW9uT3B0aW9ucyIsIkxJTkVBUiIsImxhYmVsVmlzaWJsZSIsImRpc3Bvc2VOdW1iZXJMaW5lT3BlcmF0aW9uTm9kZSIsImRpc3Bvc2UiLCJhZGRPclJlbW92ZVN0cmluZyIsImFkZCIsInJlbW92ZSIsIm9wZXJhdGlvbkRlc2NyaXB0aW9uU3RyaW5nIiwiZmlsbEluIiwiYWRkUmVtb3ZlWmVyb0N1cnJlbmN5UGF0dGVybiIsImFkZE9yUmVtb3ZlIiwiY3VycmVuY3lVbml0cyIsImFkZFJlbW92ZUFzc2V0RGVidFBhdHRlcm4iLCJhc3NldE9yRGVidCIsImFzc2V0IiwiZGVidCIsImFkZFJlbW92ZVplcm9QYXR0ZXJuIiwiYWRkUmVtb3ZlUG9zaXRpdmVOZWdhdGl2ZVBhdHRlcm4iLCJwb3NpdGl2ZU9yTmVnYXRpdmUiLCJwb3NpdGl2ZSIsIm5lZ2F0aXZlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOdW1iZXJMaW5lT3BlcmF0aW9uTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBOdW1iZXJMaW5lT3BlcmF0aW9uTm9kZSBpcyB1c2VkIHRvIGRlcGljdCBhbiBvcGVyYXRpb24gb24gYSBudW1iZXIgbGluZS4gIEl0IGxvb2tzIGxpa2UgYSBjdXJ2ZWQgYXJyb3cgd2l0aCBhIGxhYmVsXHJcbiAqIGFuZCBhIHRleHR1YWwgZGVzY3JpcHRpb24gdGhhdCBjYW4gYmUgb3B0aW9uYWxseSBzaG93bi4gVGhpcyBub2RlIHVwZGF0ZXMgaXRzZWxmIGFzIHRoZSBhdHRyaWJ1dGVzIG9mIHRoZSB1bmRlcmx5aW5nXHJcbiAqIG9wZXJhdGlvbiBvciBhbnl0aGluZyBlbHNlIHRoYXQgY2FuIGFmZmVjdCB0aGUgYXBwZWFyYW5jZSBjaGFuZ2VzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IE5MQ0NvbnN0YW50cyBmcm9tICcuLi8uLi8uLi8uLi9udW1iZXItbGluZS1jb21tb24vanMvY29tbW9uL05MQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZC5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IEJhY2tncm91bmROb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9CYWNrZ3JvdW5kTm9kZS5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvbi5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IG51bWJlckxpbmVPcGVyYXRpb25zIGZyb20gJy4uLy4uL251bWJlckxpbmVPcGVyYXRpb25zLmpzJztcclxuaW1wb3J0IE51bWJlckxpbmVPcGVyYXRpb25zU3RyaW5ncyBmcm9tICcuLi8uLi9OdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgT3BlcmF0aW9uIGZyb20gJy4uL21vZGVsL09wZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBPcGVyYXRpb25BcnJvd05vZGUgZnJvbSAnLi9PcGVyYXRpb25BcnJvd05vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFJlbGF0aXZlUG9zaXRpb24gPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlLZXlzKCBbICdBQk9WRV9OVU1CRVJfTElORScsICdCRUxPV19OVU1CRVJfTElORScgXSApO1xyXG5jb25zdCBESVNUQU5DRV9CRVRXRUVOX0xBQkVMUyA9IDM7IC8vIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG5jb25zdCBPUEVSQVRJT05fT0ZGX1NDQUxFX0xBQkVMX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE0ICk7XHJcbmNvbnN0IE9QRVJBVElPTl9ERVNDUklQVElPTl9QUkVfRkFERV9ERUxBWSA9IDAuNzsgLy8gaW4gc2Vjb25kc1xyXG5jb25zdCBPUEVSQVRJT05fREVTQ1JJUFRJT05fRkFERV9JTl9USU1FID0gMC40OyAvLyBpbiBzZWNvbmRzXHJcbmNvbnN0IERJU1RBTkNFX05VTUJFUl9MSU5FX1RPX0xBQkVMUyA9IDQ1OyAvLyBpbiBzY3JlZW4gY29vcmRpbmF0ZXMsIGVtcGlyaWNhbGx5IGNob3NlbiB0byBsb29rIGdvb2RcclxuXHJcbmNsYXNzIE51bWJlckxpbmVPcGVyYXRpb25Ob2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyTGluZU9wZXJhdGlvbn0gb3BlcmF0aW9uXHJcbiAgICogQHBhcmFtIHtCb29sZWFuUHJvcGVydHl9IHNob3dMYWJlbFByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtCb29sZWFuUHJvcGVydHl9IHNob3dEZXNjcmlwdGlvblByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPcGVyYXRpb25UcmFja2luZ051bWJlckxpbmV9IG51bWJlckxpbmVcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wZXJhdGlvbiwgc2hvd0xhYmVsUHJvcGVydHksIHNob3dEZXNjcmlwdGlvblByb3BlcnR5LCBudW1iZXJMaW5lLCBvcHRpb25zICkge1xyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgbnVtYmVyIGxpbmUgaXMgaW4gdGhlIGhvcml6b250YWwgb3JpZW50YXRpb24uICBXaGlsZSBpdCB3b3VsZG4ndCBiZSB0b28gZGlmZmljdWx0IHRvIGdlbmVyYWxpemVcclxuICAgIC8vIHRoaXMgY2xhc3MgdG8gaGFuZGxlIHRoZSB2ZXJ0aWNhbCBvcmllbnRhdGlvbiwgdG8gZGF0ZSBpdCBoYXNuJ3QgYmVlbiBuZWVkZWQsIHNvIGl0IGhhc24ndCBiZWVuIGRvbmUuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1iZXJMaW5lLmlzSG9yaXpvbnRhbCwgJ3RoaXMgY2xhc3MgaXMgbm90IGdlbmVyYWxpemVkIHRvIGhhbmRsZSB2ZXJ0aWNhbCBudW1iZXIgbGluZXMgJyApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICByZWxhdGl2ZVBvc2l0aW9uOiBSZWxhdGl2ZVBvc2l0aW9uLkFCT1ZFX05VTUJFUl9MSU5FLFxyXG4gICAgICBvcGVyYXRpb25MYWJlbEZvbnQ6IG5ldyBQaGV0Rm9udCggMTggKSxcclxuICAgICAgb3BlcmF0aW9uRGVzY3JpcHRpb25Gb250OiBuZXcgUGhldEZvbnQoIDE4ICksXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBhbmltYXRlIHRoZSBkcmF3aW5nIG9mIHRoZSBhcnJvdyB3aGVuIGl0IHRyYW5zaXRpb25zIGZyb20gaW5hY3RpdmUgdG8gYWN0aXZlXHJcbiAgICAgIGFuaW1hdGVPbkFjdGl2ZTogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIGZhZGUgaW4gdGhlIGRlc2NyaXB0aW9uIHdoZW4gdGhlIG9wZXJhdGlvbiBiZWNvbWVzIGFjdGl2ZVxyXG4gICAgICBvcGVyYXRpb25EZXNjcmlwdGlvbnNGYWRlSW46IGZhbHNlLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gQ29udHJvbHMgd2hldGhlciBmaW5hbmNpYWwgdGVybWlub2xvZ3ksIHN1Y2ggYXMgXCJyZW1vdmUgYXNzZXQgb2YgJDEwMFwiLCBpcyB1c2VkIGZvciB0aGUgb3BlcmF0aW9uXHJcbiAgICAgIC8vIGRlc2NyaXB0aW9ucyB2ZXJzdXMgbW9yZSBnZW5lcmljIHBocmFzZXMgbGlrZSBcInJlbW92ZSBwb3NpdGl2ZSAxMDBcIi5cclxuICAgICAgdXNlRmluYW5jaWFsRGVzY3JpcHRpb25zOiBmYWxzZVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMubnVtYmVyTGluZSA9IG51bWJlckxpbmU7XHJcbiAgICB0aGlzLm9wZXJhdGlvbiA9IG9wZXJhdGlvbjtcclxuXHJcbiAgICBjb25zdCBvcGVyYXRpb25OdW1iZXIgPSBudW1iZXJMaW5lLm9wZXJhdGlvbnMuaW5kZXhPZiggb3BlcmF0aW9uICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBwb2ludCBmcm9tIHdoaWNoIHRoaXMgb3BlcmF0aW9uIHN0YXJ0c1xyXG4gICAgY29uc3Qgb3JpZ2luUG9pbnQgPSBvcGVyYXRpb25OdW1iZXIgPT09IDAgPyBudW1iZXJMaW5lLnN0YXJ0aW5nUG9pbnQgOiBudW1iZXJMaW5lLmVuZHBvaW50c1sgb3BlcmF0aW9uTnVtYmVyIC0gMSBdO1xyXG5cclxuICAgIC8vIGNvbnZlbmllbmNlIHZhclxyXG4gICAgY29uc3QgYWJvdmVOdW1iZXJMaW5lID0gb3B0aW9ucy5yZWxhdGl2ZVBvc2l0aW9uID09PSBSZWxhdGl2ZVBvc2l0aW9uLkFCT1ZFX05VTUJFUl9MSU5FO1xyXG5cclxuICAgIC8vIG9wZXJhdGlvbiBsYWJlbFxyXG4gICAgY29uc3Qgb3BlcmF0aW9uTGFiZWxUZXh0Tm9kZSA9IG5ldyBUZXh0KCAnJywge1xyXG4gICAgICBmb250OiBvcHRpb25zLm9wZXJhdGlvbkxhYmVsRm9udCxcclxuICAgICAgbWF4V2lkdGg6IDE1MCAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBvcGVyYXRpb25MYWJlbCA9IG5ldyBCYWNrZ3JvdW5kTm9kZSggb3BlcmF0aW9uTGFiZWxUZXh0Tm9kZSwgTkxDQ29uc3RhbnRzLkxBQkVMX0JBQ0tHUk9VTkRfT1BUSU9OUyApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggb3BlcmF0aW9uTGFiZWwgKTtcclxuXHJcbiAgICAvLyBvcGVyYXRpb24gZGVzY3JpcHRpb25cclxuICAgIGNvbnN0IG9wZXJhdGlvbkRlc2NyaXB0aW9uVGV4dE5vZGUgPSBuZXcgVGV4dCggJycsIHtcclxuICAgICAgZm9udDogb3B0aW9ucy5vcGVyYXRpb25EZXNjcmlwdGlvbkZvbnRcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IG9wZXJhdGlvbkRlc2NyaXB0aW9uID0gbmV3IEJhY2tncm91bmROb2RlKFxyXG4gICAgICBvcGVyYXRpb25EZXNjcmlwdGlvblRleHROb2RlLFxyXG4gICAgICBtZXJnZShcclxuICAgICAgICB7fSxcclxuICAgICAgICBOTENDb25zdGFudHMuTEFCRUxfQkFDS0dST1VORF9PUFRJT05TLFxyXG4gICAgICAgIHsgbWF4V2lkdGg6IDIyNSB9IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQgc28gYXMgdG8gbmV2ZXIgZW5kIHVwIHBhcnRpYWxseSBvdXRzaWRlIHRoZSBkZXYgYm91bmRzXHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBvcGVyYXRpb25EZXNjcmlwdGlvbiApO1xyXG5cclxuICAgIC8vIHZhcmlhYmxlcyB1c2VkIHRvIHBvc2l0aW9uIHRoZSBvcGVyYXRpb24gZGVzY3JpcHRpb24sIHNpbmNlIGl0IG5lZWRzIHRvIG1vdmUgYmFzZWQgb24gd2hldGhlciB0aGUgbGFiZWwgaXMgdmlzaWJsZVxyXG4gICAgbGV0IGRlc2NyaXB0aW9uQ2VudGVyWVdoZW5MYWJlbFZpc2libGUgPSAwO1xyXG4gICAgbGV0IGRlc2NyaXB0aW9uQ2VudGVyWVdoZW5MYWJlbE5vdFZpc2libGUgPSAwO1xyXG5cclxuICAgIC8vIGFuaW1hdGlvbiB0aGF0IGlzIHVzZWQgdG8gZmFkZSBpbiB0aGUgb3BlcmF0aW9uIGRlc2NyaXB0aW9uXHJcbiAgICBsZXQgb3BlcmF0aW9uRGVzY3JpcHRpb25GYWRlSW5BbmltYXRpb24gPSBudWxsO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgZGVzY3JpcHRpb24gYXMgdGhlIGlzQWN0aXZlIHN0YXRlIGNoYW5nZXMuICBObyB1bmxpbmsgaXMgbmVlZGVkLlxyXG4gICAgb3BlcmF0aW9uLmlzQWN0aXZlUHJvcGVydHkubGF6eUxpbmsoIGlzQWN0aXZlID0+IHtcclxuXHJcbiAgICAgIGlmICggaXNBY3RpdmUgJiYgb3B0aW9ucy5vcGVyYXRpb25EZXNjcmlwdGlvbnNGYWRlSW4gKSB7XHJcblxyXG4gICAgICAgIGlmICggb3BlcmF0aW9uRGVzY3JpcHRpb25GYWRlSW5BbmltYXRpb24gKSB7XHJcbiAgICAgICAgICBvcGVyYXRpb25EZXNjcmlwdGlvbkZhZGVJbkFuaW1hdGlvbi5zdG9wKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDcmVhdGUgYW4gYW5pbWF0aW9uIHRvIGZhZGUgaW4gdGhlIG9wZXJhdGlvbiBkZXNjcmlwdGlvbiBieSBhZGp1c3RpbmcgaXRzIG9wYWNpdHkuICBUaGUgXCJ2aXNpYmxlXCIgcHJvcGVydHkgaXNcclxuICAgICAgICAvLyBoYW5kbGVkIGVsc2V3aGVyZS5cclxuICAgICAgICBjb25zdCBmYWRlSW5EdXJhdGlvbiA9IE9QRVJBVElPTl9ERVNDUklQVElPTl9QUkVfRkFERV9ERUxBWSArIE9QRVJBVElPTl9ERVNDUklQVElPTl9GQURFX0lOX1RJTUU7XHJcbiAgICAgICAgb3BlcmF0aW9uRGVzY3JpcHRpb25GYWRlSW5BbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgICBkdXJhdGlvbjogZmFkZUluRHVyYXRpb24sXHJcbiAgICAgICAgICBmcm9tOiAwLFxyXG4gICAgICAgICAgdG86IGZhZGVJbkR1cmF0aW9uLFxyXG4gICAgICAgICAgZWFzaW5nOiBFYXNpbmcuQ1VCSUNfSU4sXHJcbiAgICAgICAgICBzZXRWYWx1ZTogdGltZSA9PiB7XHJcbiAgICAgICAgICAgIGlmICggdGltZSA8PSBPUEVSQVRJT05fREVTQ1JJUFRJT05fUFJFX0ZBREVfREVMQVkgKSB7XHJcbiAgICAgICAgICAgICAgb3BlcmF0aW9uRGVzY3JpcHRpb24ub3BhY2l0eSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgb3BlcmF0aW9uRGVzY3JpcHRpb24ub3BhY2l0eSA9IE1hdGgubWluKFxyXG4gICAgICAgICAgICAgICAgKCB0aW1lIC0gT1BFUkFUSU9OX0RFU0NSSVBUSU9OX1BSRV9GQURFX0RFTEFZICkgLyBPUEVSQVRJT05fREVTQ1JJUFRJT05fRkFERV9JTl9USU1FLFxyXG4gICAgICAgICAgICAgICAgMVxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgb3BlcmF0aW9uRGVzY3JpcHRpb25GYWRlSW5BbmltYXRpb24uc3RhcnQoKTtcclxuICAgICAgICBvcGVyYXRpb25EZXNjcmlwdGlvbkZhZGVJbkFuaW1hdGlvbi5lbmRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuXHJcbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIHJlZmVyZW5jZSB0byB0aGUgYW5pbWF0aW9uLlxyXG4gICAgICAgICAgb3BlcmF0aW9uRGVzY3JpcHRpb25GYWRlSW5BbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFycm93IHRoYXQgcmVwcmVzZW50cyB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0aGUgb3BlcmF0aW9uXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgT3BlcmF0aW9uQXJyb3dOb2RlKFxyXG4gICAgICBudW1iZXJMaW5lLFxyXG4gICAgICBvcGVyYXRpb24sXHJcbiAgICAgIHtcclxuICAgICAgICByZWxhdGl2ZVBvc2l0aW9uOiBvcHRpb25zLnJlbGF0aXZlUG9zaXRpb24sXHJcbiAgICAgICAgYW5pbWF0ZU9uQWN0aXZlOiBvcHRpb25zLmFuaW1hdGVPbkFjdGl2ZVxyXG4gICAgICB9XHJcbiAgICApICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBsYWJlbHMgYW5kIGxhYmVsIHBvc2l0aW9ucyBhcyB0aGUgYXR0cmlidXRlcyBvZiB0aGUgb3BlcmF0aW9uIGFuZCBudW1iZXIgbGluZSBjaGFuZ2UuXHJcbiAgICBjb25zdCB1cGRhdGVNdWx0aWxpbmsgPSBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbXHJcbiAgICAgICAgb3BlcmF0aW9uLmlzQWN0aXZlUHJvcGVydHksXHJcbiAgICAgICAgb3JpZ2luUG9pbnQudmFsdWVQcm9wZXJ0eSxcclxuICAgICAgICBzaG93TGFiZWxQcm9wZXJ0eSxcclxuICAgICAgICBzaG93RGVzY3JpcHRpb25Qcm9wZXJ0eSxcclxuICAgICAgICBvcGVyYXRpb24ub3BlcmF0aW9uVHlwZVByb3BlcnR5LFxyXG4gICAgICAgIG9wZXJhdGlvbi5hbW91bnRQcm9wZXJ0eSxcclxuICAgICAgICBudW1iZXJMaW5lLmRpc3BsYXllZFJhbmdlUHJvcGVydHksXHJcbiAgICAgICAgbnVtYmVyTGluZS5jZW50ZXJQb3NpdGlvblByb3BlcnR5XHJcbiAgICAgIF0sXHJcbiAgICAgICggaXNBY3RpdmUsIG9wZXJhdGlvblN0YXJ0VmFsdWUsIHNob3dMYWJlbCwgc2hvd0Rlc2NyaXB0aW9uICkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBvcGVyYXRpb25FbmRWYWx1ZSA9IG51bWJlckxpbmUuZ2V0T3BlcmF0aW9uUmVzdWx0KCBvcGVyYXRpb24gKTtcclxuXHJcbiAgICAgICAgaWYgKCBpc0FjdGl2ZSApIHtcclxuICAgICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICBjb25zdCBzdGFydFBvc2l0aW9uID0gbnVtYmVyTGluZS52YWx1ZVRvTW9kZWxQb3NpdGlvbiggb3BlcmF0aW9uU3RhcnRWYWx1ZSApO1xyXG4gICAgICAgICAgY29uc3QgZW5kUG9zaXRpb24gPSBudW1iZXJMaW5lLnZhbHVlVG9Nb2RlbFBvc2l0aW9uKCBvcGVyYXRpb25FbmRWYWx1ZSApO1xyXG5cclxuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgb3BlcmF0aW9uIGxhYmVsIHRleHQgYW5kIGJhY2tncm91bmQuXHJcbiAgICAgICAgICBpZiAoIG51bWJlckxpbmUuaXNPcGVyYXRpb25Db21wbGV0ZWx5T3V0T2ZEaXNwbGF5ZWRSYW5nZSggb3BlcmF0aW9uICkgfHxcclxuICAgICAgICAgICAgICAgKCBudW1iZXJMaW5lLmlzT3BlcmF0aW9uQXRFZGdlT2ZEaXNwbGF5ZWRSYW5nZSggb3BlcmF0aW9uICkgJiYgb3BlcmF0aW9uLmFtb3VudFByb3BlcnR5LnZhbHVlICE9PSAwICkgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgZGVwaWN0aW9uIG9mIHRoZSBhcnJvdyBwb3J0aW9uIG9mIHRoZSBvcGVyYXRpb24gaXMgZWl0aGVyIGF0IHRoZSB2ZXJ5IGVkZ2Ugb2YgdGhlIG51bWJlciBsaW5lIG9yXHJcbiAgICAgICAgICAgIC8vIGNvbXBsZXRlbHkgb2ZmIG9mIGl0LCBzbyB1c2UgYSBzcGVjaWFsIGxhYmVsIHRoYXQgaW5kaWNhdGVzIHRoaXMuXHJcbiAgICAgICAgICAgIG9wZXJhdGlvbkxhYmVsVGV4dE5vZGUuc3RyaW5nID0gTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLm9wZXJhdGlvbk9mZlNjYWxlO1xyXG5cclxuICAgICAgICAgICAgLy8gVXNlIGEgZGlmZmVyZW50IChnZW5lcmFsbHkgc21hbGxlcikgZm9udCBpbiB0aGlzIGNhc2UuXHJcbiAgICAgICAgICAgIG9wZXJhdGlvbkxhYmVsVGV4dE5vZGUuZm9udCA9IE9QRVJBVElPTl9PRkZfU0NBTEVfTEFCRUxfRk9OVDtcclxuXHJcbiAgICAgICAgICAgIC8vIE1ha2UgdGhlIGxhYmVsIHN0cm9rZWQgaW4gdGhpcyBjYXNlLlxyXG4gICAgICAgICAgICBvcGVyYXRpb25MYWJlbC5iYWNrZ3JvdW5kLnN0cm9rZSA9IENvbG9yLkJMQUNLO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbkNoYXIgPSBvcGVyYXRpb24ub3BlcmF0aW9uVHlwZVByb3BlcnR5LnZhbHVlID09PSBPcGVyYXRpb24uQURESVRJT04gP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aFN5bWJvbHMuVU5BUllfUExVUyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoU3ltYm9scy5NSU5VUztcclxuICAgICAgICAgICAgY29uc3Qgc2lnbkNoYXIgPSBvcGVyYXRpb24uYW1vdW50UHJvcGVydHkudmFsdWUgPCAwID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoU3ltYm9scy5NSU5VUyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uLmFtb3VudFByb3BlcnR5LnZhbHVlID4gMCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aFN5bWJvbHMuVU5BUllfUExVUyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyc7XHJcbiAgICAgICAgICAgIG9wZXJhdGlvbkxhYmVsVGV4dE5vZGUuc3RyaW5nID0gYCR7b3BlcmF0aW9uQ2hhclxyXG4gICAgICAgICAgICB9ICR7XHJcbiAgICAgICAgICAgICAgc2lnbkNoYXJcclxuICAgICAgICAgICAgfSR7TWF0aC5hYnMoIG9wZXJhdGlvbi5hbW91bnRQcm9wZXJ0eS52YWx1ZSApLnRvU3RyaW5nKCAxMCApfWA7XHJcbiAgICAgICAgICAgIG9wZXJhdGlvbkxhYmVsVGV4dE5vZGUuZm9udCA9IG9wdGlvbnMub3BlcmF0aW9uTGFiZWxGb250O1xyXG5cclxuICAgICAgICAgICAgLy8gbm8gc3Ryb2tlIGluIHRoaXMgY2FzZVxyXG4gICAgICAgICAgICBvcGVyYXRpb25MYWJlbC5iYWNrZ3JvdW5kLnN0cm9rZSA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUG9zaXRpb24gdGhlIG9wZXJhdGlvbiBsYWJlbC5cclxuICAgICAgICAgIGlmICggYWJvdmVOdW1iZXJMaW5lICkge1xyXG4gICAgICAgICAgICBvcGVyYXRpb25MYWJlbC5ib3R0b20gPSBzdGFydFBvc2l0aW9uLnkgLSBESVNUQU5DRV9OVU1CRVJfTElORV9UT19MQUJFTFM7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgb3BlcmF0aW9uTGFiZWwudG9wID0gc3RhcnRQb3NpdGlvbi55ICsgRElTVEFOQ0VfTlVNQkVSX0xJTkVfVE9fTEFCRUxTO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgb3BlcmF0aW9uIGRlc2NyaXB0aW9uLlxyXG4gICAgICAgICAgb3BlcmF0aW9uRGVzY3JpcHRpb25UZXh0Tm9kZS5zdHJpbmcgPSBOdW1iZXJMaW5lT3BlcmF0aW9uTm9kZS5nZXRPcGVyYXRpb25EZXNjcmlwdGlvblN0cmluZyhcclxuICAgICAgICAgICAgb3BlcmF0aW9uLFxyXG4gICAgICAgICAgICBvcHRpb25zLnVzZUZpbmFuY2lhbERlc2NyaXB0aW9uc1xyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbkNlbnRlcllXaGVuTGFiZWxWaXNpYmxlID0gYWJvdmVOdW1iZXJMaW5lID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25MYWJlbC50b3AgLSBvcGVyYXRpb25EZXNjcmlwdGlvbi5oZWlnaHQgLyAyIC0gRElTVEFOQ0VfQkVUV0VFTl9MQUJFTFMgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbkxhYmVsLmJvdHRvbSArIG9wZXJhdGlvbkRlc2NyaXB0aW9uLmhlaWdodCAvIDIgKyBESVNUQU5DRV9CRVRXRUVOX0xBQkVMUztcclxuICAgICAgICAgIGRlc2NyaXB0aW9uQ2VudGVyWVdoZW5MYWJlbE5vdFZpc2libGUgPSBvcGVyYXRpb25MYWJlbC5jZW50ZXJZO1xyXG4gICAgICAgICAgb3BlcmF0aW9uRGVzY3JpcHRpb24uY2VudGVyWSA9IHNob3dMYWJlbCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25DZW50ZXJZV2hlbkxhYmVsVmlzaWJsZSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25DZW50ZXJZV2hlbkxhYmVsTm90VmlzaWJsZTtcclxuXHJcbiAgICAgICAgICAvLyBTZXQgdGhlIFggcG9zaXRpb24gb2YgdGhlIGxhYmVscyBzdWNoIHRoYXQgdGhleSBhcmUgYXQgdGhlIGNlbnRlciBvZiB0aGUgb3BlcmF0aW9uIHVubGVzcyBkb2luZyBzbyB3b3VsZFxyXG4gICAgICAgICAgLy8gcHV0IHRoZSBjZW50ZXIgb2YgdGhlIGxhYmVsIHBhc3QgdGhlIGVkZ2Ugb2YgdGhlIG51bWJlciBsaW5lLiAgSW4gdGhhdCBjYXNlLCBsaW1pdCB0aGUgWCBwb3NpdGlvbiB0byB0aGVcclxuICAgICAgICAgIC8vIG1heCB2YWx1ZSBvZiB0aGUgbnVtYmVyIGxpbmUuXHJcbiAgICAgICAgICBjb25zdCBsYWJlbHNDZW50ZXJYID0gVXRpbHMuY2xhbXAoXHJcbiAgICAgICAgICAgICggc3RhcnRQb3NpdGlvbi54ICsgZW5kUG9zaXRpb24ueCApIC8gMixcclxuICAgICAgICAgICAgbnVtYmVyTGluZS52YWx1ZVRvTW9kZWxQb3NpdGlvbiggbnVtYmVyTGluZS5kaXNwbGF5ZWRSYW5nZVByb3BlcnR5LnZhbHVlLm1pbiApLngsXHJcbiAgICAgICAgICAgIG51bWJlckxpbmUudmFsdWVUb01vZGVsUG9zaXRpb24oIG51bWJlckxpbmUuZGlzcGxheWVkUmFuZ2VQcm9wZXJ0eS52YWx1ZS5tYXggKS54XHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgb3BlcmF0aW9uTGFiZWwuY2VudGVyWCA9IGxhYmVsc0NlbnRlclg7XHJcbiAgICAgICAgICBvcGVyYXRpb25EZXNjcmlwdGlvbi5jZW50ZXJYID0gbGFiZWxzQ2VudGVyWDtcclxuXHJcbiAgICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0aGUgcG9pbnRzIG9uIHRoZSBudW1iZXIgbGluZSBhcmUgYWxsIGFib3ZlIG9yIGJlbG93IHRoZSBkaXNwbGF5ZWQgcmFuZ2UsIHNpbmNlIHRoYXQgaXNcclxuICAgICAgICAgIC8vIGZhY3RvcmVkIGluIHRvIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBsYWJlbC5cclxuICAgICAgICAgIGNvbnN0IGRpc3BsYXllZFJhbmdlID0gbnVtYmVyTGluZS5kaXNwbGF5ZWRSYW5nZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgICAgY29uc3QgYWxsUG9pbnRzQWJvdmVEaXNwbGF5UmFuZ2UgPSBudW1iZXJMaW5lLnJlc2lkZW50UG9pbnRzLnJlZHVjZShcclxuICAgICAgICAgICAgKCBhbGxQb2ludHNBYm92ZU1heCwgcG9pbnQgKSA9PiBhbGxQb2ludHNBYm92ZU1heCAmJiBwb2ludC52YWx1ZVByb3BlcnR5LnZhbHVlID4gZGlzcGxheWVkUmFuZ2UubWF4LFxyXG4gICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgY29uc3QgYWxsUG9pbnRzQmVsb3dEaXNwbGF5UmFuZ2UgPSBudW1iZXJMaW5lLnJlc2lkZW50UG9pbnRzLnJlZHVjZShcclxuICAgICAgICAgICAgKCBhbGxQb2ludHNBYm92ZU1heCwgcG9pbnQgKSA9PiBhbGxQb2ludHNBYm92ZU1heCAmJiBwb2ludC52YWx1ZVByb3BlcnR5LnZhbHVlIDwgZGlzcGxheWVkUmFuZ2UubWluLFxyXG4gICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgIC8vIFNldCB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgbGFiZWwgYW5kIGRlc2NyaXB0aW9uLiAgVGhpcyBpcyBjb250cm9sbGVkIGJ5IGEgY29tYmluYXRpb24gb2YgdGhlIHVzZXInc1xyXG4gICAgICAgICAgLy8gc2V0dGluZ3MgYW5kIHRoZSBwb3NpdGlvbiBvZiB0aGUgb3BlcmF0aW9uIGFuZCBudW1iZXIgbGluZSBwb2ludHMuXHJcbiAgICAgICAgICBvcGVyYXRpb25MYWJlbC52aXNpYmxlID0gc2hvd0xhYmVsICYmICEoIGFsbFBvaW50c0Fib3ZlRGlzcGxheVJhbmdlIHx8IGFsbFBvaW50c0JlbG93RGlzcGxheVJhbmdlICk7XHJcbiAgICAgICAgICBvcGVyYXRpb25EZXNjcmlwdGlvbi52aXNpYmxlID0gc2hvd0Rlc2NyaXB0aW9uICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCAhbnVtYmVyTGluZS5pc09wZXJhdGlvbkF0RWRnZU9mRGlzcGxheWVkUmFuZ2UoIG9wZXJhdGlvbiApICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXRoaXMubnVtYmVyTGluZS5pc09wZXJhdGlvbkNvbXBsZXRlbHlPdXRPZkRpc3BsYXllZFJhbmdlKCBvcGVyYXRpb24gKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHBvc2l0aW9uIG9mIHRoZSBvcGVyYXRpb24gZGVzY3JpcHRpb24gYmFzZWQgb24gdGhlIHZpc2liaWxpdHkgb2YgdGhlIG9wZXJhdGlvbiBsYWJlbC4gIEFuIGFuaW1hdGlvbiBpc1xyXG4gICAgLy8gdXNlZCB0byBtYWtlIHRoaXMgbG9vayBjb29sLiAgTm8gdW5saW5rIGlzIG5lZWRlZC5cclxuICAgIGxldCBkZXNjcmlwdGlvbk1vdmVtZW50QW5pbWF0aW9uID0gbnVsbDtcclxuICAgIGNvbnN0IGNvbW1vbkFuaW1hdGlvbk9wdGlvbnMgPSB7XHJcbiAgICAgIGR1cmF0aW9uOiAwLjI1LFxyXG4gICAgICBlYXNpbmc6IEVhc2luZy5MSU5FQVIsXHJcbiAgICAgIHNldFZhbHVlOiB2YWx1ZSA9PiB7IG9wZXJhdGlvbkRlc2NyaXB0aW9uLmNlbnRlclkgPSB2YWx1ZTsgfVxyXG4gICAgfTtcclxuICAgIHNob3dMYWJlbFByb3BlcnR5LmxhenlMaW5rKCBsYWJlbFZpc2libGUgPT4ge1xyXG5cclxuICAgICAgLy8gU3RvcCBhbnkgaW4tcHJvZ3Jlc3MgYW5pbWF0aW9uIG9mIHRoZSBsYWJlbCBwb3NpdGlvbi5cclxuICAgICAgZGVzY3JpcHRpb25Nb3ZlbWVudEFuaW1hdGlvbiAmJiBkZXNjcmlwdGlvbk1vdmVtZW50QW5pbWF0aW9uLnN0b3AoKTtcclxuXHJcbiAgICAgIGlmICggbGFiZWxWaXNpYmxlICYmIG9wZXJhdGlvbkRlc2NyaXB0aW9uLmNlbnRlclkgIT09IGRlc2NyaXB0aW9uQ2VudGVyWVdoZW5MYWJlbFZpc2libGUgKSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb25Nb3ZlbWVudEFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIG1lcmdlKCB7XHJcbiAgICAgICAgICBmcm9tOiBvcGVyYXRpb25EZXNjcmlwdGlvbi5jZW50ZXJZLFxyXG4gICAgICAgICAgdG86IGRlc2NyaXB0aW9uQ2VudGVyWVdoZW5MYWJlbFZpc2libGVcclxuICAgICAgICB9LCBjb21tb25BbmltYXRpb25PcHRpb25zICkgKTtcclxuICAgICAgICBkZXNjcmlwdGlvbk1vdmVtZW50QW5pbWF0aW9uLnN0YXJ0KCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoICFsYWJlbFZpc2libGUgJiYgb3BlcmF0aW9uRGVzY3JpcHRpb24uY2VudGVyWSAhPT0gZGVzY3JpcHRpb25DZW50ZXJZV2hlbkxhYmVsTm90VmlzaWJsZSApIHtcclxuICAgICAgICBkZXNjcmlwdGlvbk1vdmVtZW50QW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbiggbWVyZ2UoIHtcclxuICAgICAgICAgIGZyb206IG9wZXJhdGlvbkRlc2NyaXB0aW9uLmNlbnRlclksXHJcbiAgICAgICAgICB0bzogZGVzY3JpcHRpb25DZW50ZXJZV2hlbkxhYmVsTm90VmlzaWJsZVxyXG4gICAgICAgIH0sIGNvbW1vbkFuaW1hdGlvbk9wdGlvbnMgKSApO1xyXG4gICAgICAgIGRlc2NyaXB0aW9uTW92ZW1lbnRBbmltYXRpb24uc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgICBkZXNjcmlwdGlvbk1vdmVtZW50QW5pbWF0aW9uICYmIGRlc2NyaXB0aW9uTW92ZW1lbnRBbmltYXRpb24uZW5kZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgZGVzY3JpcHRpb25Nb3ZlbWVudEFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGRpc3Bvc2UgZnVuY3Rpb25cclxuICAgIHRoaXMuZGlzcG9zZU51bWJlckxpbmVPcGVyYXRpb25Ob2RlID0gKCkgPT4ge1xyXG4gICAgICB1cGRhdGVNdWx0aWxpbmsuZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIHN0cmluZyB0aGF0IGRlc2NyaWJlcyB0aGlzIG9wZXJhdGlvbi5cclxuICAgKiBAcGFyYW0ge051bWJlckxpbmVPcGVyYXRpb259IG9wZXJhdGlvblxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlRmluYW5jaWFsRGVzY3JpcHRpb25zIC0gQ29udHJvbHMgd2hldGhlciB0byB1c2UgZmluYW5jaWFsIHRlcm1zIGxpa2UgXCJhc3NldFwiIG9yIG1vcmUgZ2VuZXJpY1xyXG4gICAqIHRlcm1pbm9sb2d5IGluIHRoZSBkZXNjcmlwdGlvbnMuXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRPcGVyYXRpb25EZXNjcmlwdGlvblN0cmluZyggb3BlcmF0aW9uLCB1c2VGaW5hbmNpYWxEZXNjcmlwdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3QgYWRkT3JSZW1vdmVTdHJpbmcgPSBvcGVyYXRpb24ub3BlcmF0aW9uVHlwZVByb3BlcnR5LnZhbHVlID09PSBPcGVyYXRpb24uQURESVRJT04gP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MuYWRkIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLnJlbW92ZTtcclxuICAgIGxldCBvcGVyYXRpb25EZXNjcmlwdGlvblN0cmluZztcclxuICAgIGlmICggdXNlRmluYW5jaWFsRGVzY3JpcHRpb25zICkge1xyXG4gICAgICBpZiAoIG9wZXJhdGlvbi5hbW91bnRQcm9wZXJ0eS52YWx1ZSA9PT0gMCApIHtcclxuICAgICAgICBvcGVyYXRpb25EZXNjcmlwdGlvblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLmFkZFJlbW92ZVplcm9DdXJyZW5jeVBhdHRlcm4sIHtcclxuICAgICAgICAgIGFkZE9yUmVtb3ZlOiBhZGRPclJlbW92ZVN0cmluZyxcclxuICAgICAgICAgIGN1cnJlbmN5VW5pdHM6IE51bWJlckxpbmVPcGVyYXRpb25zU3RyaW5ncy5jdXJyZW5jeVVuaXRzXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIG9wZXJhdGlvbkRlc2NyaXB0aW9uU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBOdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MuYWRkUmVtb3ZlQXNzZXREZWJ0UGF0dGVybiwge1xyXG4gICAgICAgICAgYWRkT3JSZW1vdmU6IGFkZE9yUmVtb3ZlU3RyaW5nLFxyXG4gICAgICAgICAgYXNzZXRPckRlYnQ6IG9wZXJhdGlvbi5hbW91bnRQcm9wZXJ0eS52YWx1ZSA+IDAgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgIE51bWJlckxpbmVPcGVyYXRpb25zU3RyaW5ncy5hc3NldCA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLmRlYnQsXHJcbiAgICAgICAgICBjdXJyZW5jeVVuaXRzOiBOdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MuY3VycmVuY3lVbml0cyxcclxuICAgICAgICAgIHZhbHVlOiBNYXRoLmFicyggb3BlcmF0aW9uLmFtb3VudFByb3BlcnR5LnZhbHVlIClcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAoIG9wZXJhdGlvbi5hbW91bnRQcm9wZXJ0eS52YWx1ZSA9PT0gMCApIHtcclxuICAgICAgICBvcGVyYXRpb25EZXNjcmlwdGlvblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLmFkZFJlbW92ZVplcm9QYXR0ZXJuLCB7XHJcbiAgICAgICAgICBhZGRPclJlbW92ZTogYWRkT3JSZW1vdmVTdHJpbmdcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgb3BlcmF0aW9uRGVzY3JpcHRpb25TdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIE51bWJlckxpbmVPcGVyYXRpb25zU3RyaW5ncy5hZGRSZW1vdmVQb3NpdGl2ZU5lZ2F0aXZlUGF0dGVybiwge1xyXG4gICAgICAgICAgYWRkT3JSZW1vdmU6IGFkZE9yUmVtb3ZlU3RyaW5nLFxyXG4gICAgICAgICAgcG9zaXRpdmVPck5lZ2F0aXZlOiBvcGVyYXRpb24uYW1vdW50UHJvcGVydHkudmFsdWUgPiAwID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLnBvc2l0aXZlIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLm5lZ2F0aXZlLFxyXG4gICAgICAgICAgdmFsdWU6IE1hdGguYWJzKCBvcGVyYXRpb24uYW1vdW50UHJvcGVydHkudmFsdWUgKVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvcGVyYXRpb25EZXNjcmlwdGlvblN0cmluZztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kaXNwb3NlTnVtYmVyTGluZU9wZXJhdGlvbk5vZGUoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIHN0YXRpY3NcclxuTnVtYmVyTGluZU9wZXJhdGlvbk5vZGUuUmVsYXRpdmVQb3NpdGlvbiA9IFJlbGF0aXZlUG9zaXRpb247XHJcblxyXG5udW1iZXJMaW5lT3BlcmF0aW9ucy5yZWdpc3RlciggJ051bWJlckxpbmVPcGVyYXRpb25Ob2RlJywgTnVtYmVyTGluZU9wZXJhdGlvbk5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgTnVtYmVyTGluZU9wZXJhdGlvbk5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsWUFBWSxNQUFNLDBEQUEwRDtBQUNuRixPQUFPQyxxQkFBcUIsTUFBTSxtREFBbUQ7QUFDckYsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLE9BQU9DLGNBQWMsTUFBTSwrQ0FBK0M7QUFDMUUsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JFLE9BQU9DLFNBQVMsTUFBTSxtQ0FBbUM7QUFDekQsT0FBT0MsTUFBTSxNQUFNLGdDQUFnQztBQUNuRCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0MsMkJBQTJCLE1BQU0sc0NBQXNDO0FBQzlFLE9BQU9DLFNBQVMsTUFB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