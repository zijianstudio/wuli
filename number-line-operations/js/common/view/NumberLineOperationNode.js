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
const RelativePosition = EnumerationDeprecated.byKeys( [ 'ABOVE_NUMBER_LINE', 'BELOW_NUMBER_LINE' ] );
const DISTANCE_BETWEEN_LABELS = 3; // in screen coordinates
const OPERATION_OFF_SCALE_LABEL_FONT = new PhetFont( 14 );
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
  constructor( operation, showLabelProperty, showDescriptionProperty, numberLine, options ) {

    // Make sure the number line is in the horizontal orientation.  While it wouldn't be too difficult to generalize
    // this class to handle the vertical orientation, to date it hasn't been needed, so it hasn't been done.
    assert && assert( numberLine.isHorizontal, 'this class is not generalized to handle vertical number lines ' );

    options = merge( {
      relativePosition: RelativePosition.ABOVE_NUMBER_LINE,
      operationLabelFont: new PhetFont( 18 ),
      operationDescriptionFont: new PhetFont( 18 ),

      // {boolean} - animate the drawing of the arrow when it transitions from inactive to active
      animateOnActive: true,

      // {boolean} - fade in the description when the operation becomes active
      operationDescriptionsFadeIn: false,

      // {boolean} - Controls whether financial terminology, such as "remove asset of $100", is used for the operation
      // descriptions versus more generic phrases like "remove positive 100".
      useFinancialDescriptions: false
    }, options );

    super( options );

    // @private
    this.numberLine = numberLine;
    this.operation = operation;

    const operationNumber = numberLine.operations.indexOf( operation );

    // @private - point from which this operation starts
    const originPoint = operationNumber === 0 ? numberLine.startingPoint : numberLine.endpoints[ operationNumber - 1 ];

    // convenience var
    const aboveNumberLine = options.relativePosition === RelativePosition.ABOVE_NUMBER_LINE;

    // operation label
    const operationLabelTextNode = new Text( '', {
      font: options.operationLabelFont,
      maxWidth: 150 // empirically determined
    } );
    const operationLabel = new BackgroundNode( operationLabelTextNode, NLCConstants.LABEL_BACKGROUND_OPTIONS );
    this.addChild( operationLabel );

    // operation description
    const operationDescriptionTextNode = new Text( '', {
      font: options.operationDescriptionFont
    } );
    const operationDescription = new BackgroundNode(
      operationDescriptionTextNode,
      merge(
        {},
        NLCConstants.LABEL_BACKGROUND_OPTIONS,
        { maxWidth: 225 } // empirically determined so as to never end up partially outside the dev bounds
      )
    );
    this.addChild( operationDescription );

    // variables used to position the operation description, since it needs to move based on whether the label is visible
    let descriptionCenterYWhenLabelVisible = 0;
    let descriptionCenterYWhenLabelNotVisible = 0;

    // animation that is used to fade in the operation description
    let operationDescriptionFadeInAnimation = null;

    // Update the description as the isActive state changes.  No unlink is needed.
    operation.isActiveProperty.lazyLink( isActive => {

      if ( isActive && options.operationDescriptionsFadeIn ) {

        if ( operationDescriptionFadeInAnimation ) {
          operationDescriptionFadeInAnimation.stop();
        }

        // Create an animation to fade in the operation description by adjusting its opacity.  The "visible" property is
        // handled elsewhere.
        const fadeInDuration = OPERATION_DESCRIPTION_PRE_FADE_DELAY + OPERATION_DESCRIPTION_FADE_IN_TIME;
        operationDescriptionFadeInAnimation = new Animation( {
          duration: fadeInDuration,
          from: 0,
          to: fadeInDuration,
          easing: Easing.CUBIC_IN,
          setValue: time => {
            if ( time <= OPERATION_DESCRIPTION_PRE_FADE_DELAY ) {
              operationDescription.opacity = 0;
            }
            else {
              operationDescription.opacity = Math.min(
                ( time - OPERATION_DESCRIPTION_PRE_FADE_DELAY ) / OPERATION_DESCRIPTION_FADE_IN_TIME,
                1
              );
            }
          }
        } );
        operationDescriptionFadeInAnimation.start();
        operationDescriptionFadeInAnimation.endedEmitter.addListener( () => {

          // Remove the reference to the animation.
          operationDescriptionFadeInAnimation = null;
        } );
      }
    } );

    // arrow that represents the start and end of the operation
    this.addChild( new OperationArrowNode(
      numberLine,
      operation,
      {
        relativePosition: options.relativePosition,
        animateOnActive: options.animateOnActive
      }
    ) );

    // Update the labels and label positions as the attributes of the operation and number line change.
    const updateMultilink = Multilink.multilink(
      [
        operation.isActiveProperty,
        originPoint.valueProperty,
        showLabelProperty,
        showDescriptionProperty,
        operation.operationTypeProperty,
        operation.amountProperty,
        numberLine.displayedRangeProperty,
        numberLine.centerPositionProperty
      ],
      ( isActive, operationStartValue, showLabel, showDescription ) => {

        const operationEndValue = numberLine.getOperationResult( operation );

        if ( isActive ) {
          this.visible = true;
          const startPosition = numberLine.valueToModelPosition( operationStartValue );
          const endPosition = numberLine.valueToModelPosition( operationEndValue );

          // Update the operation label text and background.
          if ( numberLine.isOperationCompletelyOutOfDisplayedRange( operation ) ||
               ( numberLine.isOperationAtEdgeOfDisplayedRange( operation ) && operation.amountProperty.value !== 0 ) ) {

            // The depiction of the arrow portion of the operation is either at the very edge of the number line or
            // completely off of it, so use a special label that indicates this.
            operationLabelTextNode.string = NumberLineOperationsStrings.operationOffScale;

            // Use a different (generally smaller) font in this case.
            operationLabelTextNode.font = OPERATION_OFF_SCALE_LABEL_FONT;

            // Make the label stroked in this case.
            operationLabel.background.stroke = Color.BLACK;
          }
          else {
            const operationChar = operation.operationTypeProperty.value === Operation.ADDITION ?
                                  MathSymbols.UNARY_PLUS :
                                  MathSymbols.MINUS;
            const signChar = operation.amountProperty.value < 0 ?
                             MathSymbols.MINUS :
                             operation.amountProperty.value > 0 ?
                             MathSymbols.UNARY_PLUS :
                             '';
            operationLabelTextNode.string = `${operationChar
            } ${
              signChar
            }${Math.abs( operation.amountProperty.value ).toString( 10 )}`;
            operationLabelTextNode.font = options.operationLabelFont;

            // no stroke in this case
            operationLabel.background.stroke = null;
          }

          // Position the operation label.
          if ( aboveNumberLine ) {
            operationLabel.bottom = startPosition.y - DISTANCE_NUMBER_LINE_TO_LABELS;
          }
          else {
            operationLabel.top = startPosition.y + DISTANCE_NUMBER_LINE_TO_LABELS;
          }

          // Update the operation description.
          operationDescriptionTextNode.string = NumberLineOperationNode.getOperationDescriptionString(
            operation,
            options.useFinancialDescriptions
          );

          descriptionCenterYWhenLabelVisible = aboveNumberLine ?
                                               operationLabel.top - operationDescription.height / 2 - DISTANCE_BETWEEN_LABELS :
                                               operationLabel.bottom + operationDescription.height / 2 + DISTANCE_BETWEEN_LABELS;
          descriptionCenterYWhenLabelNotVisible = operationLabel.centerY;
          operationDescription.centerY = showLabel ?
                                         descriptionCenterYWhenLabelVisible :
                                         descriptionCenterYWhenLabelNotVisible;

          // Set the X position of the labels such that they are at the center of the operation unless doing so would
          // put the center of the label past the edge of the number line.  In that case, limit the X position to the
          // max value of the number line.
          const labelsCenterX = Utils.clamp(
            ( startPosition.x + endPosition.x ) / 2,
            numberLine.valueToModelPosition( numberLine.displayedRangeProperty.value.min ).x,
            numberLine.valueToModelPosition( numberLine.displayedRangeProperty.value.max ).x
          );
          operationLabel.centerX = labelsCenterX;
          operationDescription.centerX = labelsCenterX;

          // Determine whether the points on the number line are all above or below the displayed range, since that is
          // factored in to the visibility of the label.
          const displayedRange = numberLine.displayedRangeProperty.value;
          const allPointsAboveDisplayRange = numberLine.residentPoints.reduce(
            ( allPointsAboveMax, point ) => allPointsAboveMax && point.valueProperty.value > displayedRange.max,
            true
          );
          const allPointsBelowDisplayRange = numberLine.residentPoints.reduce(
            ( allPointsAboveMax, point ) => allPointsAboveMax && point.valueProperty.value < displayedRange.min,
            true
          );

          // Set the visibility of the label and description.  This is controlled by a combination of the user's
          // settings and the position of the operation and number line points.
          operationLabel.visible = showLabel && !( allPointsAboveDisplayRange || allPointsBelowDisplayRange );
          operationDescription.visible = showDescription &&
                                         ( !numberLine.isOperationAtEdgeOfDisplayedRange( operation ) &&
                                         !this.numberLine.isOperationCompletelyOutOfDisplayedRange( operation ) );
        }
        else {
          this.visible = false;
        }
      }
    );

    // Update the position of the operation description based on the visibility of the operation label.  An animation is
    // used to make this look cool.  No unlink is needed.
    let descriptionMovementAnimation = null;
    const commonAnimationOptions = {
      duration: 0.25,
      easing: Easing.LINEAR,
      setValue: value => { operationDescription.centerY = value; }
    };
    showLabelProperty.lazyLink( labelVisible => {

      // Stop any in-progress animation of the label position.
      descriptionMovementAnimation && descriptionMovementAnimation.stop();

      if ( labelVisible && operationDescription.centerY !== descriptionCenterYWhenLabelVisible ) {
        descriptionMovementAnimation = new Animation( merge( {
          from: operationDescription.centerY,
          to: descriptionCenterYWhenLabelVisible
        }, commonAnimationOptions ) );
        descriptionMovementAnimation.start();
      }
      else if ( !labelVisible && operationDescription.centerY !== descriptionCenterYWhenLabelNotVisible ) {
        descriptionMovementAnimation = new Animation( merge( {
          from: operationDescription.centerY,
          to: descriptionCenterYWhenLabelNotVisible
        }, commonAnimationOptions ) );
        descriptionMovementAnimation.start();
      }
      descriptionMovementAnimation && descriptionMovementAnimation.endedEmitter.addListener( () => {
        descriptionMovementAnimation = null;
      } );
    } );

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
  static getOperationDescriptionString( operation, useFinancialDescriptions ) {

    const addOrRemoveString = operation.operationTypeProperty.value === Operation.ADDITION ?
                              NumberLineOperationsStrings.add :
                              NumberLineOperationsStrings.remove;
    let operationDescriptionString;
    if ( useFinancialDescriptions ) {
      if ( operation.amountProperty.value === 0 ) {
        operationDescriptionString = StringUtils.fillIn( NumberLineOperationsStrings.addRemoveZeroCurrencyPattern, {
          addOrRemove: addOrRemoveString,
          currencyUnits: NumberLineOperationsStrings.currencyUnits
        } );
      }
      else {
        operationDescriptionString = StringUtils.fillIn( NumberLineOperationsStrings.addRemoveAssetDebtPattern, {
          addOrRemove: addOrRemoveString,
          assetOrDebt: operation.amountProperty.value > 0 ?
                       NumberLineOperationsStrings.asset :
                       NumberLineOperationsStrings.debt,
          currencyUnits: NumberLineOperationsStrings.currencyUnits,
          value: Math.abs( operation.amountProperty.value )
        } );
      }
    }
    else {
      if ( operation.amountProperty.value === 0 ) {
        operationDescriptionString = StringUtils.fillIn( NumberLineOperationsStrings.addRemoveZeroPattern, {
          addOrRemove: addOrRemoveString
        } );
      }
      else {
        operationDescriptionString = StringUtils.fillIn( NumberLineOperationsStrings.addRemovePositiveNegativePattern, {
          addOrRemove: addOrRemoveString,
          positiveOrNegative: operation.amountProperty.value > 0 ?
                              NumberLineOperationsStrings.positive :
                              NumberLineOperationsStrings.negative,
          value: Math.abs( operation.amountProperty.value )
        } );
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

numberLineOperations.register( 'NumberLineOperationNode', NumberLineOperationNode );
export default NumberLineOperationNode;