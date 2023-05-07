// Copyright 2021-2022, University of Colorado Boulder

/**
 * OperationArrowNode (which, by the way, totally sounds like a movie title) is a Scenery node that depicts an operation
 * on a number line as a curved arrow that is either above or below the number line.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import numberLineOperations from '../../numberLineOperations.js';
import Operation from '../model/Operation.js';
import NumberLineOperationNode from './NumberLineOperationNode.js';

// constants
const COLOR = Color.BLACK;
const CURVED_LINE_OPTIONS = {
  stroke: COLOR,
  lineWidth: 2
};
const ARROWHEAD_LENGTH = 15; // in screen coordinates, empirically chosen
const APEX_DISTANCE_FROM_NUMBER_LINE = 25; // in screen coordinates, empirically chosen to look good

// an unscaled version of the arrowhead shape, pointing straight up, tip at 0,0, height normalized to 1
const NORMALIZED_ARROWHEAD_SHAPE = new Shape()
  .lineTo( -0.4, 1.14 )
  .lineTo( 0, 1 )
  .lineTo( 0.4, 1.14 )
  .lineTo( 0, 0 );

class OperationArrowNode extends Node {

  /**
   * @param {OperationTrackingNumberLine} numberLine
   * @param {NumberLineOperation} operation
   * @param {Object} [options] - specific to this class, not passed to superclass
   */
  constructor( numberLine, operation, options ) {

    // Make sure the number line is in the horizontal orientation, since vertical isn't supported.
    assert && assert( numberLine.isHorizontal, 'vertical orientation of number line not supported' );

    options = merge( { relativePosition: NumberLineOperationNode.RelativePosition.ABOVE_NUMBER_LINE }, options );

    super();

    // @private - make these available to methods
    this.numberLine = numberLine;
    this.operation = operation;

    // @private {Path} - the Node that makes up the curved line portion of the arrow, updated when the operation changes
    this.curvedLineNode = new Path( null, CURVED_LINE_OPTIONS );
    this.addChild( this.curvedLineNode );

    // @private {ArrowHeadNode} - head of the arrow, position will be updated later
    this.arrowheadNode = new ArrowheadNode( ARROWHEAD_LENGTH, 0, Vector2.ZERO );
    this.addChild( this.arrowheadNode );

    // convenience var
    const aboveNumberLine = options.relativePosition === NumberLineOperationNode.RelativePosition.ABOVE_NUMBER_LINE;

    // Indicates whether this is armed for animation, meaning that the next inactive-to-active change should be animated
    // rather than drawn immediately.
    let armedForAnimation = false;

    // Arm the grow animation if appropriate.  No unlink is needed.
    operation.isActiveProperty.lazyLink( isActive => {

      // Set a flag that is referenced elsewhere and is used kick off an animation to grow the arrow.
      if ( isActive && options.animateOnActive ) {
        armedForAnimation = true;
      }
    } );

    const operationNumber = numberLine.operations.indexOf( operation );

    // @private - point from which this operation starts
    const originPoint = operationNumber === 0 ?
                        numberLine.startingPoint :
                        numberLine.endpoints[ operationNumber - 1 ];

    // {Animation|null} - animation that grows the arrow
    let growArrowAnimation = null;

    // Update the appearance as the things that can affect it change.
    Multilink.multilink(
      [
        operation.isActiveProperty,
        operation.operationTypeProperty,
        operation.amountProperty,
        originPoint.valueProperty,
        numberLine.centerPositionProperty,
        numberLine.displayedRangeProperty
      ],
      isActive => {

        this.visible = isActive;

        if ( isActive ) {
          const startPosition = numberLine.valueToModelPosition( numberLine.getOperationStartValue( operation ) );
          const endPosition = numberLine.valueToModelPosition( numberLine.getOperationResult( operation ) );

          // Stop any animation that was in progress.
          if ( growArrowAnimation ) {
            growArrowAnimation.stop();
            growArrowAnimation = null;
          }

          if ( armedForAnimation && startPosition.distance( endPosition ) > 0 ) {

            // Create an animation to make the change.
            growArrowAnimation = new Animation( {
              duration: 0.75, // in seconds, empirically determined
              from: 0,
              to: 1,
              easing: Easing.CUBIC_OUT,
              setValue: proportionToDraw => {
                this.updateArrow( aboveNumberLine, proportionToDraw );
              }
            } );
            growArrowAnimation.start();
            growArrowAnimation.finishEmitter.addListener( () => { growArrowAnimation = null; } );

            // Clear the flag until another transition occurs.
            armedForAnimation = false;
          }
          else {

            // Make the change instantaneously.
            this.updateArrow( aboveNumberLine, 1 );
          }
        }
      }
    );
  }

  /**
   * @param {boolean} aboveNumberLine
   * @param {number} proportion - proportion to draw, from 0 to 1, used for animation and partial drawing
   * @private
   */
  updateArrow( aboveNumberLine, proportion ) {

    // convenience constants
    const operation = this.operation;
    const numberLine = this.numberLine;

    // variables that describe the nature of the arrow line and arrowhead
    let lineShape;
    let arrowheadAngle;

    // Calculate the start and end points of the curved line.
    const sign = operation.operationTypeProperty.value === Operation.SUBTRACTION ? -1 : 1;
    const deltaX = ( numberLine.valueToModelPosition( operation.amountProperty.value ).x -
                     numberLine.valueToModelPosition( 0 ).x ) * sign;

    const startPoint = numberLine.valueToModelPosition( numberLine.getOperationStartValue( operation ) );
    const endPoint = numberLine.valueToModelPosition( numberLine.getOperationResult( operation ) );

    if ( Math.abs( deltaX / 2 ) >= APEX_DISTANCE_FROM_NUMBER_LINE ) {

      // For this case, a circle is used for the underlying shape.  Calculate the radius and center position of the
      // circle such that the apex will be at the needed height and the circle will intersect the number line at the
      // start and end points.  I (jbphet) derived this myself because I couldn't easily find a description online, and
      // it seems to work.
      const radiusOfCircle = Math.pow( startPoint.distance( endPoint ), 2 ) /
                             ( 8 * APEX_DISTANCE_FROM_NUMBER_LINE ) +
                             APEX_DISTANCE_FROM_NUMBER_LINE / 2;

      // Calculate the center Y position of the circle.  For the angle calculations to work, the center of the circle
      // must always be a little above the number line when the line is above and below when below, hence the min and
      // max operations.
      const circleYPosition = aboveNumberLine ?
                              startPoint.y - APEX_DISTANCE_FROM_NUMBER_LINE + radiusOfCircle :
                              startPoint.y + APEX_DISTANCE_FROM_NUMBER_LINE - radiusOfCircle;
      const centerOfCircle = new Vector2( ( startPoint.x + endPoint.x ) / 2, circleYPosition );

      const startAngle = startPoint.minus( centerOfCircle ).getAngle();
      const completeArcEndAngle = endPoint.minus( centerOfCircle ).getAngle();
      const endAngle = startAngle + ( completeArcEndAngle - startAngle ) * proportion;

      let drawArcAnticlockwise;
      if ( aboveNumberLine ) {
        drawArcAnticlockwise = startPoint.x > endPoint.x;
      }
      else {
        drawArcAnticlockwise = endPoint.x > startPoint.x;
      }

      // Create the arc.
      lineShape = Shape.arc(
        centerOfCircle.x,
        centerOfCircle.y,
        radiusOfCircle,
        startAngle,
        endAngle,
        drawArcAnticlockwise
      );

      // Calculate the angle of the arrowhead.  This is calculated by using the angle at the starting point and then
      // moving back a bit along the circle to the head of the arrow.
      const compensationAngle = ARROWHEAD_LENGTH / ( 2 * radiusOfCircle );
      if ( aboveNumberLine ) {
        if ( deltaX < 0 ) {
          arrowheadAngle = Math.PI - startAngle + compensationAngle;
        }
        else {
          arrowheadAngle = Math.PI + completeArcEndAngle - compensationAngle;
        }
      }
      else {
        if ( deltaX < 0 ) {
          arrowheadAngle = -startAngle - compensationAngle;
        }
        else {
          arrowheadAngle = completeArcEndAngle + compensationAngle;
        }
      }
    }
    else if ( Math.abs( deltaX ) > 0 ) {

      // In this case, the distance between the start and end points is less than the intended apex of the curve, so an
      // elliptical arc is used rather than a circular one.

      // parameters of the elliptical arc
      const radiusX = Math.abs( deltaX / 2 );
      const radiusY = APEX_DISTANCE_FROM_NUMBER_LINE;
      let startAngle;
      let endAngle;
      let anticlockwise;

      // adjustment angle for the arrowhead - This formula was empirically determined, though a true derivation may be
      // possible.  I (jbphet) tried for about 1/2, then tried this and it worked, so it was left at this.
      const arrowheadAngleFromPerpendicular = radiusX / radiusY * Math.PI * 0.1;
      if ( aboveNumberLine ) {
        if ( deltaX > 0 ) {
          startAngle = -Math.PI;
          endAngle = startAngle + ( proportion * Math.PI );
          anticlockwise = false;
          arrowheadAngle = Math.PI - arrowheadAngleFromPerpendicular;
        }
        else {
          startAngle = 0;
          endAngle = -proportion * Math.PI;
          anticlockwise = true;
          arrowheadAngle = Math.PI + arrowheadAngleFromPerpendicular;
        }
      }
      else {
        if ( deltaX > 0 ) {
          startAngle = Math.PI;
          endAngle = startAngle - ( proportion * Math.PI );
          anticlockwise = true;
          arrowheadAngle = arrowheadAngleFromPerpendicular;
        }
        else {
          startAngle = 0;
          endAngle = proportion * Math.PI;
          anticlockwise = false;
          arrowheadAngle = -arrowheadAngleFromPerpendicular;
        }
      }

      lineShape = new Shape().ellipticalArc(
        startPoint.x + deltaX / 2,
        startPoint.y,
        radiusX,
        radiusY,
        0,
        startAngle,
        endAngle,
        anticlockwise
      );
    }
    else {

      // The amount of the operation is zero, so the curved line will be a loop that starts and ends at the same point.
      const loopStartAndEndPoint = startPoint;
      const yAddFactor = APEX_DISTANCE_FROM_NUMBER_LINE * ( aboveNumberLine ? -1.5 : 1.5 ); // empirical for desired height
      const controlPointHeightMultiplier = 0.6; // empirically determined to get the desired loop width
      const controlPoint1 = new Vector2(
        loopStartAndEndPoint.x - controlPointHeightMultiplier * APEX_DISTANCE_FROM_NUMBER_LINE,
        loopStartAndEndPoint.y + yAddFactor
      );
      const controlPoint2 = new Vector2(
        loopStartAndEndPoint.x + controlPointHeightMultiplier * APEX_DISTANCE_FROM_NUMBER_LINE,
        loopStartAndEndPoint.y + yAddFactor
      );
      lineShape = new Shape()
        .moveToPoint( loopStartAndEndPoint )
        .cubicCurveToPoint( controlPoint1, controlPoint2, loopStartAndEndPoint );

      // The formula for the arrowhead angle was determined through trial and error, which isn't a great way to do it
      // because it may not work if significant changes are made to the shape of the loop, but evaluating the Bezier
      // curve for this short distance proved difficult.  This may require adjustment if the size or orientations of the
      // loop changes.
      const multiplier = 0.025;
      const loopWidth = lineShape.bounds.width;
      if ( operation.operationTypeProperty.value === Operation.ADDITION ) {
        if ( aboveNumberLine ) {
          arrowheadAngle = Math.PI + loopWidth * multiplier;
        }
        else {
          arrowheadAngle = -loopWidth * multiplier;
        }
      }
      else {
        if ( aboveNumberLine ) {
          arrowheadAngle = Math.PI - loopWidth * multiplier;
        }
        else {
          arrowheadAngle = loopWidth * multiplier;
        }
      }
    }

    // Update the shapes for the line and the arrowhead.  Shapes with translations are used so that the clip area will
    // work without tricky translations.
    this.curvedLineNode.shape = lineShape;
    this.arrowheadNode.updateShape( arrowheadAngle, endPoint );

    // Only show the arrowhead for full or nearly full depictions of the operation.
    this.arrowheadNode.visible = proportion > 0.9;

    // If necessary, set a clip area for the line and the arrowhead so that they don't extend beyond the edges of the
    // number line.
    let clipArea = null;
    if ( numberLine.isOperationCompletelyOutOfDisplayedRange( operation ) ||
         ( numberLine.isOperationPartiallyInDisplayedRange( operation ) && operation.amountProperty.value !== 0 ) ) {

      const displayedRange = numberLine.displayedRangeProperty.value;
      const clipAreaMinXPosition = numberLine.valueToModelPosition( displayedRange.min ).x;
      const clipAreaMaxXPosition = numberLine.valueToModelPosition( displayedRange.max ).x;
      clipArea = Shape.rect(
        clipAreaMinXPosition,
        startPoint.y - APEX_DISTANCE_FROM_NUMBER_LINE * 5,
        clipAreaMaxXPosition - clipAreaMinXPosition,
        APEX_DISTANCE_FROM_NUMBER_LINE * 10
      );
    }
    this.curvedLineNode.clipArea = clipArea;
    this.arrowheadNode.clipArea = clipArea;
  }
}

/**
 * Inner class for creating the type of arrowhead needed for the operations lines.  Position the point of the arrowhead
 * by specifying the x and y position of the node.
 */
class ArrowheadNode extends Path {

  /**
   * @param {number} length
   * @param {number} rotation
   * @param {Vector2} position
   * @param {Object} [options]
   */
  constructor( length, rotation, position, options ) {

    options = merge( {
      lineJoin: 'round',
      fill: COLOR
    }, options );

    super( null, options );

    // @private {number}
    this.length = length;

    this.updateShape( rotation, position );
  }

  /**
   * update the shape to have the original length but a new rotation and position
   * @param {number} rotation - in radians
   * @param {Vector2} position
   * @public
   */
  updateShape( rotation, position ) {
    this.setShape( NORMALIZED_ARROWHEAD_SHAPE
      .transformed( Matrix3.scale( this.length ) )
      .transformed( Matrix3.rotationAround( rotation, 0, 0 ) )
      .transformed( Matrix3.translationFromVector( position ) )
    );
  }
}

numberLineOperations.register( 'OperationArrowNode', OperationArrowNode );
export default OperationArrowNode;