// Copyright 2020-2022, University of Colorado Boulder

/**
 * a Scenery node that represents the span of an absolute value separated from the number line
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { Shape } from '../../../../kite/js/imports.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import numberLineCommon from '../../numberLineCommon.js';
import NLCConstants from '../NLCConstants.js';
import AbsoluteValueLine from './AbsoluteValueLine.js';

// constants
const CAP_LENGTH = 10; // the "cap" is the end portion of the span, value is in screen coords
const ANIMATION_SPEED = 160; // in screen coords per second
const MAX_ANIMATION_DURATION = 0.5; // in seconds
const EQUATION_NUMBER_FONT = new PhetFont( 18 );
const EXAMPLE_EQUATION_NUMBER_NODE = new Text( 8, { font: EQUATION_NUMBER_FONT } );
const ABSOLUTE_VALUE_LINE_SPACING = 1;
const EQUALS_SIGN_SPACING = 4;

class AbsoluteValueSpanNode extends Node {

  /**
   * @param {NumberLine} numberLine - the number line for which this will be displayed
   * @param {NumberLinePoint} numberLinePoint
   * @param {number} initialDistanceFromNumberLine
   * @public
   */
  constructor( numberLine, numberLinePoint, initialDistanceFromNumberLine ) {

    super();

    // Control the visibility of this node.
    const visibilityUpdater = showAbsoluteValues => { this.visible = showAbsoluteValues; };
    numberLine.showAbsoluteValuesProperty.link( visibilityUpdater );

    // @public {number} - the distance in model/view coordinates of the line portion of the span from the number line
    this.distanceFromNumberLineProperty = new NumberProperty( initialDistanceFromNumberLine );

    // @public (read-only) {NumberLinePoint} - point whose absolute value is being displayed by this span
    this.numberLinePoint = numberLinePoint;

    // @private {null|Animation} - null when this span node is not animating
    this.translateAnimation = null;

    // Add the equation text.
    const equationNode = new Node();
    const equationBackground = new BackgroundNode( equationNode, NLCConstants.LABEL_BACKGROUND_OPTIONS );
    this.addChild( equationBackground );

    // Add the span indicator shape.
    const spanIndicatorNode = new Path( null, {
      stroke: numberLinePoint.colorProperty,
      lineWidth: 2
    } );
    this.addChild( spanIndicatorNode );

    // Define a function to update the span shape.
    const updateSpanShape = () => {
      const spanIndicatorShape = new Shape();
      const distanceFromNumberLine = this.distanceFromNumberLineProperty.value;
      const pointPosition = numberLinePoint.getPositionInModelSpace();
      if ( numberLine.isHorizontal ) {
        spanIndicatorShape.moveTo(
          numberLine.centerPositionProperty.value.x,
          numberLine.centerPositionProperty.value.y - distanceFromNumberLine - CAP_LENGTH / 2
        );
        spanIndicatorShape.lineTo(
          numberLine.centerPositionProperty.value.x,
          numberLine.centerPositionProperty.value.y - distanceFromNumberLine + CAP_LENGTH / 2
        );
        spanIndicatorShape.moveTo(
          numberLine.centerPositionProperty.value.x,
          numberLine.centerPositionProperty.value.y - distanceFromNumberLine
        );
        spanIndicatorShape.lineTo( pointPosition.x, pointPosition.y - distanceFromNumberLine );
        spanIndicatorShape.moveTo(
          pointPosition.x,
          numberLine.centerPositionProperty.value.y - distanceFromNumberLine - CAP_LENGTH / 2
        );
        spanIndicatorShape.lineTo(
          pointPosition.x,
          numberLine.centerPositionProperty.value.y - distanceFromNumberLine + CAP_LENGTH / 2
        );
      }
      else {
        spanIndicatorShape.moveTo(
          numberLine.centerPositionProperty.value.x - distanceFromNumberLine - CAP_LENGTH / 2,
          numberLine.centerPositionProperty.value.y
        );
        spanIndicatorShape.lineTo(
          numberLine.centerPositionProperty.value.x - distanceFromNumberLine + CAP_LENGTH / 2,
          numberLine.centerPositionProperty.value.y
        );
        spanIndicatorShape.moveTo( numberLine.centerPositionProperty.value.x - distanceFromNumberLine, numberLine.centerPositionProperty.value.y );
        spanIndicatorShape.lineTo( pointPosition.x - distanceFromNumberLine, pointPosition.y );
        spanIndicatorShape.moveTo(
          pointPosition.x - distanceFromNumberLine - CAP_LENGTH / 2,
          pointPosition.y
        );
        spanIndicatorShape.lineTo(
          pointPosition.x - distanceFromNumberLine + CAP_LENGTH / 2,
          pointPosition.y
        );
      }
      spanIndicatorNode.shape = spanIndicatorShape;
    };

    // Define a function to update the text label.
    const updateEquation = () => {
      const value = numberLinePoint.valueProperty.value;
      equationNode.removeAllChildren();
      equationNode.addChild( new AbsoluteValueLine( EXAMPLE_EQUATION_NUMBER_NODE ) );
      equationNode.addChild( new Text( value, {
        font: EQUATION_NUMBER_FONT,
        left: equationNode.width + ABSOLUTE_VALUE_LINE_SPACING
      } ) );
      equationNode.addChild( new AbsoluteValueLine( EXAMPLE_EQUATION_NUMBER_NODE, {
        left: equationNode.width + ABSOLUTE_VALUE_LINE_SPACING
      } ) );
      equationNode.addChild( new Text( '=', {
        font: EQUATION_NUMBER_FONT,
        left: equationNode.width + EQUALS_SIGN_SPACING
      } ) );
      equationNode.addChild( new Text( Math.abs( value ), {
        font: EQUATION_NUMBER_FONT,
        left: equationNode.width + EQUALS_SIGN_SPACING
      } ) );

      const distanceFromNumberLine = this.distanceFromNumberLineProperty.value;
      const pointPosition = numberLinePoint.getPositionInModelSpace();
      if ( numberLine.isHorizontal ) {
        equationBackground.centerX = ( numberLine.centerPositionProperty.value.x + pointPosition.x ) / 2;
        equationBackground.bottom = numberLine.centerPositionProperty.value.y - distanceFromNumberLine - CAP_LENGTH / 2;
      }
      else {
        equationBackground.centerX = pointPosition.x - distanceFromNumberLine;
        if ( value > 0 ) {
          equationBackground.bottom = pointPosition.y - 5;
        }
        else {
          equationBackground.top = pointPosition.y + 5;
        }
      }
    };

    // Update when the point value changes.
    numberLinePoint.valueProperty.link( () => {
      updateSpanShape();
      updateEquation();
    } );

    // Update position when the orientation or displayed range of the number line changes.
    const positionAndShapeMultilink = Multilink.multilink(
      [ numberLine.orientationProperty, numberLine.displayedRangeProperty, this.distanceFromNumberLineProperty ],
      () => {
        updateSpanShape();
        updateEquation();
      }
    );

    // @private
    this.disposeAbsoluteValueSpanNode = () => {
      positionAndShapeMultilink.dispose();
      numberLine.showAbsoluteValuesProperty.unlink( visibilityUpdater );
    };
  }

  /**
   * @param {number} distance
   * @param {boolean} doAnimation
   * @public
   */
  setDistanceFromNumberLine( distance, doAnimation ) {
    const currentDistanceFromNumberLine = this.distanceFromNumberLineProperty.value;
    if ( distance === currentDistanceFromNumberLine ) {
      return;
    }

    if ( doAnimation ) {
      const animationDuration = Math.min(
        Math.abs( currentDistanceFromNumberLine - distance ) / ANIMATION_SPEED,
        MAX_ANIMATION_DURATION
      );
      const animationOptions = {
        property: this.distanceFromNumberLineProperty,
        to: distance,
        duration: animationDuration,
        easing: Easing.CUBIC_IN_OUT
      };

      // If an animation is in progress, stop it.
      if ( this.translateAnimation ) {
        this.translateAnimation.stop();
      }

      // Create and start a new animation.
      this.translateAnimation = new Animation( animationOptions );
      this.translateAnimation.start();

      // Set the current animation to null once it finishes (or is stopped).
      this.translateAnimation.endedEmitter.addListener( () => {
        this.translateAnimation = null;
      } );
    }
    else {
      this.distanceFromNumberLineProperty.value = distance;
    }
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeAbsoluteValueSpanNode();
    super.dispose();
  }
}

numberLineCommon.register( 'AbsoluteValueSpanNode', AbsoluteValueSpanNode );
export default AbsoluteValueSpanNode;
