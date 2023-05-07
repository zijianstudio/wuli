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
const NORMALIZED_ARROWHEAD_SHAPE = new Shape().lineTo(-0.4, 1.14).lineTo(0, 1).lineTo(0.4, 1.14).lineTo(0, 0);
class OperationArrowNode extends Node {
  /**
   * @param {OperationTrackingNumberLine} numberLine
   * @param {NumberLineOperation} operation
   * @param {Object} [options] - specific to this class, not passed to superclass
   */
  constructor(numberLine, operation, options) {
    // Make sure the number line is in the horizontal orientation, since vertical isn't supported.
    assert && assert(numberLine.isHorizontal, 'vertical orientation of number line not supported');
    options = merge({
      relativePosition: NumberLineOperationNode.RelativePosition.ABOVE_NUMBER_LINE
    }, options);
    super();

    // @private - make these available to methods
    this.numberLine = numberLine;
    this.operation = operation;

    // @private {Path} - the Node that makes up the curved line portion of the arrow, updated when the operation changes
    this.curvedLineNode = new Path(null, CURVED_LINE_OPTIONS);
    this.addChild(this.curvedLineNode);

    // @private {ArrowHeadNode} - head of the arrow, position will be updated later
    this.arrowheadNode = new ArrowheadNode(ARROWHEAD_LENGTH, 0, Vector2.ZERO);
    this.addChild(this.arrowheadNode);

    // convenience var
    const aboveNumberLine = options.relativePosition === NumberLineOperationNode.RelativePosition.ABOVE_NUMBER_LINE;

    // Indicates whether this is armed for animation, meaning that the next inactive-to-active change should be animated
    // rather than drawn immediately.
    let armedForAnimation = false;

    // Arm the grow animation if appropriate.  No unlink is needed.
    operation.isActiveProperty.lazyLink(isActive => {
      // Set a flag that is referenced elsewhere and is used kick off an animation to grow the arrow.
      if (isActive && options.animateOnActive) {
        armedForAnimation = true;
      }
    });
    const operationNumber = numberLine.operations.indexOf(operation);

    // @private - point from which this operation starts
    const originPoint = operationNumber === 0 ? numberLine.startingPoint : numberLine.endpoints[operationNumber - 1];

    // {Animation|null} - animation that grows the arrow
    let growArrowAnimation = null;

    // Update the appearance as the things that can affect it change.
    Multilink.multilink([operation.isActiveProperty, operation.operationTypeProperty, operation.amountProperty, originPoint.valueProperty, numberLine.centerPositionProperty, numberLine.displayedRangeProperty], isActive => {
      this.visible = isActive;
      if (isActive) {
        const startPosition = numberLine.valueToModelPosition(numberLine.getOperationStartValue(operation));
        const endPosition = numberLine.valueToModelPosition(numberLine.getOperationResult(operation));

        // Stop any animation that was in progress.
        if (growArrowAnimation) {
          growArrowAnimation.stop();
          growArrowAnimation = null;
        }
        if (armedForAnimation && startPosition.distance(endPosition) > 0) {
          // Create an animation to make the change.
          growArrowAnimation = new Animation({
            duration: 0.75,
            // in seconds, empirically determined
            from: 0,
            to: 1,
            easing: Easing.CUBIC_OUT,
            setValue: proportionToDraw => {
              this.updateArrow(aboveNumberLine, proportionToDraw);
            }
          });
          growArrowAnimation.start();
          growArrowAnimation.finishEmitter.addListener(() => {
            growArrowAnimation = null;
          });

          // Clear the flag until another transition occurs.
          armedForAnimation = false;
        } else {
          // Make the change instantaneously.
          this.updateArrow(aboveNumberLine, 1);
        }
      }
    });
  }

  /**
   * @param {boolean} aboveNumberLine
   * @param {number} proportion - proportion to draw, from 0 to 1, used for animation and partial drawing
   * @private
   */
  updateArrow(aboveNumberLine, proportion) {
    // convenience constants
    const operation = this.operation;
    const numberLine = this.numberLine;

    // variables that describe the nature of the arrow line and arrowhead
    let lineShape;
    let arrowheadAngle;

    // Calculate the start and end points of the curved line.
    const sign = operation.operationTypeProperty.value === Operation.SUBTRACTION ? -1 : 1;
    const deltaX = (numberLine.valueToModelPosition(operation.amountProperty.value).x - numberLine.valueToModelPosition(0).x) * sign;
    const startPoint = numberLine.valueToModelPosition(numberLine.getOperationStartValue(operation));
    const endPoint = numberLine.valueToModelPosition(numberLine.getOperationResult(operation));
    if (Math.abs(deltaX / 2) >= APEX_DISTANCE_FROM_NUMBER_LINE) {
      // For this case, a circle is used for the underlying shape.  Calculate the radius and center position of the
      // circle such that the apex will be at the needed height and the circle will intersect the number line at the
      // start and end points.  I (jbphet) derived this myself because I couldn't easily find a description online, and
      // it seems to work.
      const radiusOfCircle = Math.pow(startPoint.distance(endPoint), 2) / (8 * APEX_DISTANCE_FROM_NUMBER_LINE) + APEX_DISTANCE_FROM_NUMBER_LINE / 2;

      // Calculate the center Y position of the circle.  For the angle calculations to work, the center of the circle
      // must always be a little above the number line when the line is above and below when below, hence the min and
      // max operations.
      const circleYPosition = aboveNumberLine ? startPoint.y - APEX_DISTANCE_FROM_NUMBER_LINE + radiusOfCircle : startPoint.y + APEX_DISTANCE_FROM_NUMBER_LINE - radiusOfCircle;
      const centerOfCircle = new Vector2((startPoint.x + endPoint.x) / 2, circleYPosition);
      const startAngle = startPoint.minus(centerOfCircle).getAngle();
      const completeArcEndAngle = endPoint.minus(centerOfCircle).getAngle();
      const endAngle = startAngle + (completeArcEndAngle - startAngle) * proportion;
      let drawArcAnticlockwise;
      if (aboveNumberLine) {
        drawArcAnticlockwise = startPoint.x > endPoint.x;
      } else {
        drawArcAnticlockwise = endPoint.x > startPoint.x;
      }

      // Create the arc.
      lineShape = Shape.arc(centerOfCircle.x, centerOfCircle.y, radiusOfCircle, startAngle, endAngle, drawArcAnticlockwise);

      // Calculate the angle of the arrowhead.  This is calculated by using the angle at the starting point and then
      // moving back a bit along the circle to the head of the arrow.
      const compensationAngle = ARROWHEAD_LENGTH / (2 * radiusOfCircle);
      if (aboveNumberLine) {
        if (deltaX < 0) {
          arrowheadAngle = Math.PI - startAngle + compensationAngle;
        } else {
          arrowheadAngle = Math.PI + completeArcEndAngle - compensationAngle;
        }
      } else {
        if (deltaX < 0) {
          arrowheadAngle = -startAngle - compensationAngle;
        } else {
          arrowheadAngle = completeArcEndAngle + compensationAngle;
        }
      }
    } else if (Math.abs(deltaX) > 0) {
      // In this case, the distance between the start and end points is less than the intended apex of the curve, so an
      // elliptical arc is used rather than a circular one.

      // parameters of the elliptical arc
      const radiusX = Math.abs(deltaX / 2);
      const radiusY = APEX_DISTANCE_FROM_NUMBER_LINE;
      let startAngle;
      let endAngle;
      let anticlockwise;

      // adjustment angle for the arrowhead - This formula was empirically determined, though a true derivation may be
      // possible.  I (jbphet) tried for about 1/2, then tried this and it worked, so it was left at this.
      const arrowheadAngleFromPerpendicular = radiusX / radiusY * Math.PI * 0.1;
      if (aboveNumberLine) {
        if (deltaX > 0) {
          startAngle = -Math.PI;
          endAngle = startAngle + proportion * Math.PI;
          anticlockwise = false;
          arrowheadAngle = Math.PI - arrowheadAngleFromPerpendicular;
        } else {
          startAngle = 0;
          endAngle = -proportion * Math.PI;
          anticlockwise = true;
          arrowheadAngle = Math.PI + arrowheadAngleFromPerpendicular;
        }
      } else {
        if (deltaX > 0) {
          startAngle = Math.PI;
          endAngle = startAngle - proportion * Math.PI;
          anticlockwise = true;
          arrowheadAngle = arrowheadAngleFromPerpendicular;
        } else {
          startAngle = 0;
          endAngle = proportion * Math.PI;
          anticlockwise = false;
          arrowheadAngle = -arrowheadAngleFromPerpendicular;
        }
      }
      lineShape = new Shape().ellipticalArc(startPoint.x + deltaX / 2, startPoint.y, radiusX, radiusY, 0, startAngle, endAngle, anticlockwise);
    } else {
      // The amount of the operation is zero, so the curved line will be a loop that starts and ends at the same point.
      const loopStartAndEndPoint = startPoint;
      const yAddFactor = APEX_DISTANCE_FROM_NUMBER_LINE * (aboveNumberLine ? -1.5 : 1.5); // empirical for desired height
      const controlPointHeightMultiplier = 0.6; // empirically determined to get the desired loop width
      const controlPoint1 = new Vector2(loopStartAndEndPoint.x - controlPointHeightMultiplier * APEX_DISTANCE_FROM_NUMBER_LINE, loopStartAndEndPoint.y + yAddFactor);
      const controlPoint2 = new Vector2(loopStartAndEndPoint.x + controlPointHeightMultiplier * APEX_DISTANCE_FROM_NUMBER_LINE, loopStartAndEndPoint.y + yAddFactor);
      lineShape = new Shape().moveToPoint(loopStartAndEndPoint).cubicCurveToPoint(controlPoint1, controlPoint2, loopStartAndEndPoint);

      // The formula for the arrowhead angle was determined through trial and error, which isn't a great way to do it
      // because it may not work if significant changes are made to the shape of the loop, but evaluating the Bezier
      // curve for this short distance proved difficult.  This may require adjustment if the size or orientations of the
      // loop changes.
      const multiplier = 0.025;
      const loopWidth = lineShape.bounds.width;
      if (operation.operationTypeProperty.value === Operation.ADDITION) {
        if (aboveNumberLine) {
          arrowheadAngle = Math.PI + loopWidth * multiplier;
        } else {
          arrowheadAngle = -loopWidth * multiplier;
        }
      } else {
        if (aboveNumberLine) {
          arrowheadAngle = Math.PI - loopWidth * multiplier;
        } else {
          arrowheadAngle = loopWidth * multiplier;
        }
      }
    }

    // Update the shapes for the line and the arrowhead.  Shapes with translations are used so that the clip area will
    // work without tricky translations.
    this.curvedLineNode.shape = lineShape;
    this.arrowheadNode.updateShape(arrowheadAngle, endPoint);

    // Only show the arrowhead for full or nearly full depictions of the operation.
    this.arrowheadNode.visible = proportion > 0.9;

    // If necessary, set a clip area for the line and the arrowhead so that they don't extend beyond the edges of the
    // number line.
    let clipArea = null;
    if (numberLine.isOperationCompletelyOutOfDisplayedRange(operation) || numberLine.isOperationPartiallyInDisplayedRange(operation) && operation.amountProperty.value !== 0) {
      const displayedRange = numberLine.displayedRangeProperty.value;
      const clipAreaMinXPosition = numberLine.valueToModelPosition(displayedRange.min).x;
      const clipAreaMaxXPosition = numberLine.valueToModelPosition(displayedRange.max).x;
      clipArea = Shape.rect(clipAreaMinXPosition, startPoint.y - APEX_DISTANCE_FROM_NUMBER_LINE * 5, clipAreaMaxXPosition - clipAreaMinXPosition, APEX_DISTANCE_FROM_NUMBER_LINE * 10);
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
  constructor(length, rotation, position, options) {
    options = merge({
      lineJoin: 'round',
      fill: COLOR
    }, options);
    super(null, options);

    // @private {number}
    this.length = length;
    this.updateShape(rotation, position);
  }

  /**
   * update the shape to have the original length but a new rotation and position
   * @param {number} rotation - in radians
   * @param {Vector2} position
   * @public
   */
  updateShape(rotation, position) {
    this.setShape(NORMALIZED_ARROWHEAD_SHAPE.transformed(Matrix3.scale(this.length)).transformed(Matrix3.rotationAround(rotation, 0, 0)).transformed(Matrix3.translationFromVector(position)));
  }
}
numberLineOperations.register('OperationArrowNode', OperationArrowNode);
export default OperationArrowNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJNYXRyaXgzIiwiVmVjdG9yMiIsIlNoYXBlIiwibWVyZ2UiLCJDb2xvciIsIk5vZGUiLCJQYXRoIiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwibnVtYmVyTGluZU9wZXJhdGlvbnMiLCJPcGVyYXRpb24iLCJOdW1iZXJMaW5lT3BlcmF0aW9uTm9kZSIsIkNPTE9SIiwiQkxBQ0siLCJDVVJWRURfTElORV9PUFRJT05TIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiQVJST1dIRUFEX0xFTkdUSCIsIkFQRVhfRElTVEFOQ0VfRlJPTV9OVU1CRVJfTElORSIsIk5PUk1BTElaRURfQVJST1dIRUFEX1NIQVBFIiwibGluZVRvIiwiT3BlcmF0aW9uQXJyb3dOb2RlIiwiY29uc3RydWN0b3IiLCJudW1iZXJMaW5lIiwib3BlcmF0aW9uIiwib3B0aW9ucyIsImFzc2VydCIsImlzSG9yaXpvbnRhbCIsInJlbGF0aXZlUG9zaXRpb24iLCJSZWxhdGl2ZVBvc2l0aW9uIiwiQUJPVkVfTlVNQkVSX0xJTkUiLCJjdXJ2ZWRMaW5lTm9kZSIsImFkZENoaWxkIiwiYXJyb3doZWFkTm9kZSIsIkFycm93aGVhZE5vZGUiLCJaRVJPIiwiYWJvdmVOdW1iZXJMaW5lIiwiYXJtZWRGb3JBbmltYXRpb24iLCJpc0FjdGl2ZVByb3BlcnR5IiwibGF6eUxpbmsiLCJpc0FjdGl2ZSIsImFuaW1hdGVPbkFjdGl2ZSIsIm9wZXJhdGlvbk51bWJlciIsIm9wZXJhdGlvbnMiLCJpbmRleE9mIiwib3JpZ2luUG9pbnQiLCJzdGFydGluZ1BvaW50IiwiZW5kcG9pbnRzIiwiZ3Jvd0Fycm93QW5pbWF0aW9uIiwibXVsdGlsaW5rIiwib3BlcmF0aW9uVHlwZVByb3BlcnR5IiwiYW1vdW50UHJvcGVydHkiLCJ2YWx1ZVByb3BlcnR5IiwiY2VudGVyUG9zaXRpb25Qcm9wZXJ0eSIsImRpc3BsYXllZFJhbmdlUHJvcGVydHkiLCJ2aXNpYmxlIiwic3RhcnRQb3NpdGlvbiIsInZhbHVlVG9Nb2RlbFBvc2l0aW9uIiwiZ2V0T3BlcmF0aW9uU3RhcnRWYWx1ZSIsImVuZFBvc2l0aW9uIiwiZ2V0T3BlcmF0aW9uUmVzdWx0Iiwic3RvcCIsImRpc3RhbmNlIiwiZHVyYXRpb24iLCJmcm9tIiwidG8iLCJlYXNpbmciLCJDVUJJQ19PVVQiLCJzZXRWYWx1ZSIsInByb3BvcnRpb25Ub0RyYXciLCJ1cGRhdGVBcnJvdyIsInN0YXJ0IiwiZmluaXNoRW1pdHRlciIsImFkZExpc3RlbmVyIiwicHJvcG9ydGlvbiIsImxpbmVTaGFwZSIsImFycm93aGVhZEFuZ2xlIiwic2lnbiIsInZhbHVlIiwiU1VCVFJBQ1RJT04iLCJkZWx0YVgiLCJ4Iiwic3RhcnRQb2ludCIsImVuZFBvaW50IiwiTWF0aCIsImFicyIsInJhZGl1c09mQ2lyY2xlIiwicG93IiwiY2lyY2xlWVBvc2l0aW9uIiwieSIsImNlbnRlck9mQ2lyY2xlIiwic3RhcnRBbmdsZSIsIm1pbnVzIiwiZ2V0QW5nbGUiLCJjb21wbGV0ZUFyY0VuZEFuZ2xlIiwiZW5kQW5nbGUiLCJkcmF3QXJjQW50aWNsb2Nrd2lzZSIsImFyYyIsImNvbXBlbnNhdGlvbkFuZ2xlIiwiUEkiLCJyYWRpdXNYIiwicmFkaXVzWSIsImFudGljbG9ja3dpc2UiLCJhcnJvd2hlYWRBbmdsZUZyb21QZXJwZW5kaWN1bGFyIiwiZWxsaXB0aWNhbEFyYyIsImxvb3BTdGFydEFuZEVuZFBvaW50IiwieUFkZEZhY3RvciIsImNvbnRyb2xQb2ludEhlaWdodE11bHRpcGxpZXIiLCJjb250cm9sUG9pbnQxIiwiY29udHJvbFBvaW50MiIsIm1vdmVUb1BvaW50IiwiY3ViaWNDdXJ2ZVRvUG9pbnQiLCJtdWx0aXBsaWVyIiwibG9vcFdpZHRoIiwiYm91bmRzIiwid2lkdGgiLCJBRERJVElPTiIsInNoYXBlIiwidXBkYXRlU2hhcGUiLCJjbGlwQXJlYSIsImlzT3BlcmF0aW9uQ29tcGxldGVseU91dE9mRGlzcGxheWVkUmFuZ2UiLCJpc09wZXJhdGlvblBhcnRpYWxseUluRGlzcGxheWVkUmFuZ2UiLCJkaXNwbGF5ZWRSYW5nZSIsImNsaXBBcmVhTWluWFBvc2l0aW9uIiwibWluIiwiY2xpcEFyZWFNYXhYUG9zaXRpb24iLCJtYXgiLCJyZWN0IiwibGVuZ3RoIiwicm90YXRpb24iLCJwb3NpdGlvbiIsImxpbmVKb2luIiwiZmlsbCIsInNldFNoYXBlIiwidHJhbnNmb3JtZWQiLCJzY2FsZSIsInJvdGF0aW9uQXJvdW5kIiwidHJhbnNsYXRpb25Gcm9tVmVjdG9yIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPcGVyYXRpb25BcnJvd05vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogT3BlcmF0aW9uQXJyb3dOb2RlICh3aGljaCwgYnkgdGhlIHdheSwgdG90YWxseSBzb3VuZHMgbGlrZSBhIG1vdmllIHRpdGxlKSBpcyBhIFNjZW5lcnkgbm9kZSB0aGF0IGRlcGljdHMgYW4gb3BlcmF0aW9uXHJcbiAqIG9uIGEgbnVtYmVyIGxpbmUgYXMgYSBjdXJ2ZWQgYXJyb3cgdGhhdCBpcyBlaXRoZXIgYWJvdmUgb3IgYmVsb3cgdGhlIG51bWJlciBsaW5lLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvbi5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IG51bWJlckxpbmVPcGVyYXRpb25zIGZyb20gJy4uLy4uL251bWJlckxpbmVPcGVyYXRpb25zLmpzJztcclxuaW1wb3J0IE9wZXJhdGlvbiBmcm9tICcuLi9tb2RlbC9PcGVyYXRpb24uanMnO1xyXG5pbXBvcnQgTnVtYmVyTGluZU9wZXJhdGlvbk5vZGUgZnJvbSAnLi9OdW1iZXJMaW5lT3BlcmF0aW9uTm9kZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQ09MT1IgPSBDb2xvci5CTEFDSztcclxuY29uc3QgQ1VSVkVEX0xJTkVfT1BUSU9OUyA9IHtcclxuICBzdHJva2U6IENPTE9SLFxyXG4gIGxpbmVXaWR0aDogMlxyXG59O1xyXG5jb25zdCBBUlJPV0hFQURfTEVOR1RIID0gMTU7IC8vIGluIHNjcmVlbiBjb29yZGluYXRlcywgZW1waXJpY2FsbHkgY2hvc2VuXHJcbmNvbnN0IEFQRVhfRElTVEFOQ0VfRlJPTV9OVU1CRVJfTElORSA9IDI1OyAvLyBpbiBzY3JlZW4gY29vcmRpbmF0ZXMsIGVtcGlyaWNhbGx5IGNob3NlbiB0byBsb29rIGdvb2RcclxuXHJcbi8vIGFuIHVuc2NhbGVkIHZlcnNpb24gb2YgdGhlIGFycm93aGVhZCBzaGFwZSwgcG9pbnRpbmcgc3RyYWlnaHQgdXAsIHRpcCBhdCAwLDAsIGhlaWdodCBub3JtYWxpemVkIHRvIDFcclxuY29uc3QgTk9STUFMSVpFRF9BUlJPV0hFQURfU0hBUEUgPSBuZXcgU2hhcGUoKVxyXG4gIC5saW5lVG8oIC0wLjQsIDEuMTQgKVxyXG4gIC5saW5lVG8oIDAsIDEgKVxyXG4gIC5saW5lVG8oIDAuNCwgMS4xNCApXHJcbiAgLmxpbmVUbyggMCwgMCApO1xyXG5cclxuY2xhc3MgT3BlcmF0aW9uQXJyb3dOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T3BlcmF0aW9uVHJhY2tpbmdOdW1iZXJMaW5lfSBudW1iZXJMaW5lXHJcbiAgICogQHBhcmFtIHtOdW1iZXJMaW5lT3BlcmF0aW9ufSBvcGVyYXRpb25cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gc3BlY2lmaWMgdG8gdGhpcyBjbGFzcywgbm90IHBhc3NlZCB0byBzdXBlcmNsYXNzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG51bWJlckxpbmUsIG9wZXJhdGlvbiwgb3B0aW9ucyApIHtcclxuXHJcbiAgICAvLyBNYWtlIHN1cmUgdGhlIG51bWJlciBsaW5lIGlzIGluIHRoZSBob3Jpem9udGFsIG9yaWVudGF0aW9uLCBzaW5jZSB2ZXJ0aWNhbCBpc24ndCBzdXBwb3J0ZWQuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1iZXJMaW5lLmlzSG9yaXpvbnRhbCwgJ3ZlcnRpY2FsIG9yaWVudGF0aW9uIG9mIG51bWJlciBsaW5lIG5vdCBzdXBwb3J0ZWQnICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7IHJlbGF0aXZlUG9zaXRpb246IE51bWJlckxpbmVPcGVyYXRpb25Ob2RlLlJlbGF0aXZlUG9zaXRpb24uQUJPVkVfTlVNQkVSX0xJTkUgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBtYWtlIHRoZXNlIGF2YWlsYWJsZSB0byBtZXRob2RzXHJcbiAgICB0aGlzLm51bWJlckxpbmUgPSBudW1iZXJMaW5lO1xyXG4gICAgdGhpcy5vcGVyYXRpb24gPSBvcGVyYXRpb247XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1BhdGh9IC0gdGhlIE5vZGUgdGhhdCBtYWtlcyB1cCB0aGUgY3VydmVkIGxpbmUgcG9ydGlvbiBvZiB0aGUgYXJyb3csIHVwZGF0ZWQgd2hlbiB0aGUgb3BlcmF0aW9uIGNoYW5nZXNcclxuICAgIHRoaXMuY3VydmVkTGluZU5vZGUgPSBuZXcgUGF0aCggbnVsbCwgQ1VSVkVEX0xJTkVfT1BUSU9OUyApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5jdXJ2ZWRMaW5lTm9kZSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJvd0hlYWROb2RlfSAtIGhlYWQgb2YgdGhlIGFycm93LCBwb3NpdGlvbiB3aWxsIGJlIHVwZGF0ZWQgbGF0ZXJcclxuICAgIHRoaXMuYXJyb3doZWFkTm9kZSA9IG5ldyBBcnJvd2hlYWROb2RlKCBBUlJPV0hFQURfTEVOR1RILCAwLCBWZWN0b3IyLlpFUk8gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuYXJyb3doZWFkTm9kZSApO1xyXG5cclxuICAgIC8vIGNvbnZlbmllbmNlIHZhclxyXG4gICAgY29uc3QgYWJvdmVOdW1iZXJMaW5lID0gb3B0aW9ucy5yZWxhdGl2ZVBvc2l0aW9uID09PSBOdW1iZXJMaW5lT3BlcmF0aW9uTm9kZS5SZWxhdGl2ZVBvc2l0aW9uLkFCT1ZFX05VTUJFUl9MSU5FO1xyXG5cclxuICAgIC8vIEluZGljYXRlcyB3aGV0aGVyIHRoaXMgaXMgYXJtZWQgZm9yIGFuaW1hdGlvbiwgbWVhbmluZyB0aGF0IHRoZSBuZXh0IGluYWN0aXZlLXRvLWFjdGl2ZSBjaGFuZ2Ugc2hvdWxkIGJlIGFuaW1hdGVkXHJcbiAgICAvLyByYXRoZXIgdGhhbiBkcmF3biBpbW1lZGlhdGVseS5cclxuICAgIGxldCBhcm1lZEZvckFuaW1hdGlvbiA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEFybSB0aGUgZ3JvdyBhbmltYXRpb24gaWYgYXBwcm9wcmlhdGUuICBObyB1bmxpbmsgaXMgbmVlZGVkLlxyXG4gICAgb3BlcmF0aW9uLmlzQWN0aXZlUHJvcGVydHkubGF6eUxpbmsoIGlzQWN0aXZlID0+IHtcclxuXHJcbiAgICAgIC8vIFNldCBhIGZsYWcgdGhhdCBpcyByZWZlcmVuY2VkIGVsc2V3aGVyZSBhbmQgaXMgdXNlZCBraWNrIG9mZiBhbiBhbmltYXRpb24gdG8gZ3JvdyB0aGUgYXJyb3cuXHJcbiAgICAgIGlmICggaXNBY3RpdmUgJiYgb3B0aW9ucy5hbmltYXRlT25BY3RpdmUgKSB7XHJcbiAgICAgICAgYXJtZWRGb3JBbmltYXRpb24gPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgb3BlcmF0aW9uTnVtYmVyID0gbnVtYmVyTGluZS5vcGVyYXRpb25zLmluZGV4T2YoIG9wZXJhdGlvbiApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gcG9pbnQgZnJvbSB3aGljaCB0aGlzIG9wZXJhdGlvbiBzdGFydHNcclxuICAgIGNvbnN0IG9yaWdpblBvaW50ID0gb3BlcmF0aW9uTnVtYmVyID09PSAwID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyTGluZS5zdGFydGluZ1BvaW50IDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyTGluZS5lbmRwb2ludHNbIG9wZXJhdGlvbk51bWJlciAtIDEgXTtcclxuXHJcbiAgICAvLyB7QW5pbWF0aW9ufG51bGx9IC0gYW5pbWF0aW9uIHRoYXQgZ3Jvd3MgdGhlIGFycm93XHJcbiAgICBsZXQgZ3Jvd0Fycm93QW5pbWF0aW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIGFwcGVhcmFuY2UgYXMgdGhlIHRoaW5ncyB0aGF0IGNhbiBhZmZlY3QgaXQgY2hhbmdlLlxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgW1xyXG4gICAgICAgIG9wZXJhdGlvbi5pc0FjdGl2ZVByb3BlcnR5LFxyXG4gICAgICAgIG9wZXJhdGlvbi5vcGVyYXRpb25UeXBlUHJvcGVydHksXHJcbiAgICAgICAgb3BlcmF0aW9uLmFtb3VudFByb3BlcnR5LFxyXG4gICAgICAgIG9yaWdpblBvaW50LnZhbHVlUHJvcGVydHksXHJcbiAgICAgICAgbnVtYmVyTGluZS5jZW50ZXJQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICAgIG51bWJlckxpbmUuZGlzcGxheWVkUmFuZ2VQcm9wZXJ0eVxyXG4gICAgICBdLFxyXG4gICAgICBpc0FjdGl2ZSA9PiB7XHJcblxyXG4gICAgICAgIHRoaXMudmlzaWJsZSA9IGlzQWN0aXZlO1xyXG5cclxuICAgICAgICBpZiAoIGlzQWN0aXZlICkge1xyXG4gICAgICAgICAgY29uc3Qgc3RhcnRQb3NpdGlvbiA9IG51bWJlckxpbmUudmFsdWVUb01vZGVsUG9zaXRpb24oIG51bWJlckxpbmUuZ2V0T3BlcmF0aW9uU3RhcnRWYWx1ZSggb3BlcmF0aW9uICkgKTtcclxuICAgICAgICAgIGNvbnN0IGVuZFBvc2l0aW9uID0gbnVtYmVyTGluZS52YWx1ZVRvTW9kZWxQb3NpdGlvbiggbnVtYmVyTGluZS5nZXRPcGVyYXRpb25SZXN1bHQoIG9wZXJhdGlvbiApICk7XHJcblxyXG4gICAgICAgICAgLy8gU3RvcCBhbnkgYW5pbWF0aW9uIHRoYXQgd2FzIGluIHByb2dyZXNzLlxyXG4gICAgICAgICAgaWYgKCBncm93QXJyb3dBbmltYXRpb24gKSB7XHJcbiAgICAgICAgICAgIGdyb3dBcnJvd0FuaW1hdGlvbi5zdG9wKCk7XHJcbiAgICAgICAgICAgIGdyb3dBcnJvd0FuaW1hdGlvbiA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCBhcm1lZEZvckFuaW1hdGlvbiAmJiBzdGFydFBvc2l0aW9uLmRpc3RhbmNlKCBlbmRQb3NpdGlvbiApID4gMCApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhbiBhbmltYXRpb24gdG8gbWFrZSB0aGUgY2hhbmdlLlxyXG4gICAgICAgICAgICBncm93QXJyb3dBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgICAgICAgZHVyYXRpb246IDAuNzUsIC8vIGluIHNlY29uZHMsIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgICAgICAgICAgICBmcm9tOiAwLFxyXG4gICAgICAgICAgICAgIHRvOiAxLFxyXG4gICAgICAgICAgICAgIGVhc2luZzogRWFzaW5nLkNVQklDX09VVCxcclxuICAgICAgICAgICAgICBzZXRWYWx1ZTogcHJvcG9ydGlvblRvRHJhdyA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUFycm93KCBhYm92ZU51bWJlckxpbmUsIHByb3BvcnRpb25Ub0RyYXcgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gKTtcclxuICAgICAgICAgICAgZ3Jvd0Fycm93QW5pbWF0aW9uLnN0YXJ0KCk7XHJcbiAgICAgICAgICAgIGdyb3dBcnJvd0FuaW1hdGlvbi5maW5pc2hFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7IGdyb3dBcnJvd0FuaW1hdGlvbiA9IG51bGw7IH0gKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENsZWFyIHRoZSBmbGFnIHVudGlsIGFub3RoZXIgdHJhbnNpdGlvbiBvY2N1cnMuXHJcbiAgICAgICAgICAgIGFybWVkRm9yQW5pbWF0aW9uID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIE1ha2UgdGhlIGNoYW5nZSBpbnN0YW50YW5lb3VzbHkuXHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQXJyb3coIGFib3ZlTnVtYmVyTGluZSwgMSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWJvdmVOdW1iZXJMaW5lXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByb3BvcnRpb24gLSBwcm9wb3J0aW9uIHRvIGRyYXcsIGZyb20gMCB0byAxLCB1c2VkIGZvciBhbmltYXRpb24gYW5kIHBhcnRpYWwgZHJhd2luZ1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlQXJyb3coIGFib3ZlTnVtYmVyTGluZSwgcHJvcG9ydGlvbiApIHtcclxuXHJcbiAgICAvLyBjb252ZW5pZW5jZSBjb25zdGFudHNcclxuICAgIGNvbnN0IG9wZXJhdGlvbiA9IHRoaXMub3BlcmF0aW9uO1xyXG4gICAgY29uc3QgbnVtYmVyTGluZSA9IHRoaXMubnVtYmVyTGluZTtcclxuXHJcbiAgICAvLyB2YXJpYWJsZXMgdGhhdCBkZXNjcmliZSB0aGUgbmF0dXJlIG9mIHRoZSBhcnJvdyBsaW5lIGFuZCBhcnJvd2hlYWRcclxuICAgIGxldCBsaW5lU2hhcGU7XHJcbiAgICBsZXQgYXJyb3doZWFkQW5nbGU7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBzdGFydCBhbmQgZW5kIHBvaW50cyBvZiB0aGUgY3VydmVkIGxpbmUuXHJcbiAgICBjb25zdCBzaWduID0gb3BlcmF0aW9uLm9wZXJhdGlvblR5cGVQcm9wZXJ0eS52YWx1ZSA9PT0gT3BlcmF0aW9uLlNVQlRSQUNUSU9OID8gLTEgOiAxO1xyXG4gICAgY29uc3QgZGVsdGFYID0gKCBudW1iZXJMaW5lLnZhbHVlVG9Nb2RlbFBvc2l0aW9uKCBvcGVyYXRpb24uYW1vdW50UHJvcGVydHkudmFsdWUgKS54IC1cclxuICAgICAgICAgICAgICAgICAgICAgbnVtYmVyTGluZS52YWx1ZVRvTW9kZWxQb3NpdGlvbiggMCApLnggKSAqIHNpZ247XHJcblxyXG4gICAgY29uc3Qgc3RhcnRQb2ludCA9IG51bWJlckxpbmUudmFsdWVUb01vZGVsUG9zaXRpb24oIG51bWJlckxpbmUuZ2V0T3BlcmF0aW9uU3RhcnRWYWx1ZSggb3BlcmF0aW9uICkgKTtcclxuICAgIGNvbnN0IGVuZFBvaW50ID0gbnVtYmVyTGluZS52YWx1ZVRvTW9kZWxQb3NpdGlvbiggbnVtYmVyTGluZS5nZXRPcGVyYXRpb25SZXN1bHQoIG9wZXJhdGlvbiApICk7XHJcblxyXG4gICAgaWYgKCBNYXRoLmFicyggZGVsdGFYIC8gMiApID49IEFQRVhfRElTVEFOQ0VfRlJPTV9OVU1CRVJfTElORSApIHtcclxuXHJcbiAgICAgIC8vIEZvciB0aGlzIGNhc2UsIGEgY2lyY2xlIGlzIHVzZWQgZm9yIHRoZSB1bmRlcmx5aW5nIHNoYXBlLiAgQ2FsY3VsYXRlIHRoZSByYWRpdXMgYW5kIGNlbnRlciBwb3NpdGlvbiBvZiB0aGVcclxuICAgICAgLy8gY2lyY2xlIHN1Y2ggdGhhdCB0aGUgYXBleCB3aWxsIGJlIGF0IHRoZSBuZWVkZWQgaGVpZ2h0IGFuZCB0aGUgY2lyY2xlIHdpbGwgaW50ZXJzZWN0IHRoZSBudW1iZXIgbGluZSBhdCB0aGVcclxuICAgICAgLy8gc3RhcnQgYW5kIGVuZCBwb2ludHMuICBJIChqYnBoZXQpIGRlcml2ZWQgdGhpcyBteXNlbGYgYmVjYXVzZSBJIGNvdWxkbid0IGVhc2lseSBmaW5kIGEgZGVzY3JpcHRpb24gb25saW5lLCBhbmRcclxuICAgICAgLy8gaXQgc2VlbXMgdG8gd29yay5cclxuICAgICAgY29uc3QgcmFkaXVzT2ZDaXJjbGUgPSBNYXRoLnBvdyggc3RhcnRQb2ludC5kaXN0YW5jZSggZW5kUG9pbnQgKSwgMiApIC9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIDggKiBBUEVYX0RJU1RBTkNFX0ZST01fTlVNQkVSX0xJTkUgKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQVBFWF9ESVNUQU5DRV9GUk9NX05VTUJFUl9MSU5FIC8gMjtcclxuXHJcbiAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY2VudGVyIFkgcG9zaXRpb24gb2YgdGhlIGNpcmNsZS4gIEZvciB0aGUgYW5nbGUgY2FsY3VsYXRpb25zIHRvIHdvcmssIHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZVxyXG4gICAgICAvLyBtdXN0IGFsd2F5cyBiZSBhIGxpdHRsZSBhYm92ZSB0aGUgbnVtYmVyIGxpbmUgd2hlbiB0aGUgbGluZSBpcyBhYm92ZSBhbmQgYmVsb3cgd2hlbiBiZWxvdywgaGVuY2UgdGhlIG1pbiBhbmRcclxuICAgICAgLy8gbWF4IG9wZXJhdGlvbnMuXHJcbiAgICAgIGNvbnN0IGNpcmNsZVlQb3NpdGlvbiA9IGFib3ZlTnVtYmVyTGluZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0UG9pbnQueSAtIEFQRVhfRElTVEFOQ0VfRlJPTV9OVU1CRVJfTElORSArIHJhZGl1c09mQ2lyY2xlIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRQb2ludC55ICsgQVBFWF9ESVNUQU5DRV9GUk9NX05VTUJFUl9MSU5FIC0gcmFkaXVzT2ZDaXJjbGU7XHJcbiAgICAgIGNvbnN0IGNlbnRlck9mQ2lyY2xlID0gbmV3IFZlY3RvcjIoICggc3RhcnRQb2ludC54ICsgZW5kUG9pbnQueCApIC8gMiwgY2lyY2xlWVBvc2l0aW9uICk7XHJcblxyXG4gICAgICBjb25zdCBzdGFydEFuZ2xlID0gc3RhcnRQb2ludC5taW51cyggY2VudGVyT2ZDaXJjbGUgKS5nZXRBbmdsZSgpO1xyXG4gICAgICBjb25zdCBjb21wbGV0ZUFyY0VuZEFuZ2xlID0gZW5kUG9pbnQubWludXMoIGNlbnRlck9mQ2lyY2xlICkuZ2V0QW5nbGUoKTtcclxuICAgICAgY29uc3QgZW5kQW5nbGUgPSBzdGFydEFuZ2xlICsgKCBjb21wbGV0ZUFyY0VuZEFuZ2xlIC0gc3RhcnRBbmdsZSApICogcHJvcG9ydGlvbjtcclxuXHJcbiAgICAgIGxldCBkcmF3QXJjQW50aWNsb2Nrd2lzZTtcclxuICAgICAgaWYgKCBhYm92ZU51bWJlckxpbmUgKSB7XHJcbiAgICAgICAgZHJhd0FyY0FudGljbG9ja3dpc2UgPSBzdGFydFBvaW50LnggPiBlbmRQb2ludC54O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGRyYXdBcmNBbnRpY2xvY2t3aXNlID0gZW5kUG9pbnQueCA+IHN0YXJ0UG9pbnQueDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ3JlYXRlIHRoZSBhcmMuXHJcbiAgICAgIGxpbmVTaGFwZSA9IFNoYXBlLmFyYyhcclxuICAgICAgICBjZW50ZXJPZkNpcmNsZS54LFxyXG4gICAgICAgIGNlbnRlck9mQ2lyY2xlLnksXHJcbiAgICAgICAgcmFkaXVzT2ZDaXJjbGUsXHJcbiAgICAgICAgc3RhcnRBbmdsZSxcclxuICAgICAgICBlbmRBbmdsZSxcclxuICAgICAgICBkcmF3QXJjQW50aWNsb2Nrd2lzZVxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBhbmdsZSBvZiB0aGUgYXJyb3doZWFkLiAgVGhpcyBpcyBjYWxjdWxhdGVkIGJ5IHVzaW5nIHRoZSBhbmdsZSBhdCB0aGUgc3RhcnRpbmcgcG9pbnQgYW5kIHRoZW5cclxuICAgICAgLy8gbW92aW5nIGJhY2sgYSBiaXQgYWxvbmcgdGhlIGNpcmNsZSB0byB0aGUgaGVhZCBvZiB0aGUgYXJyb3cuXHJcbiAgICAgIGNvbnN0IGNvbXBlbnNhdGlvbkFuZ2xlID0gQVJST1dIRUFEX0xFTkdUSCAvICggMiAqIHJhZGl1c09mQ2lyY2xlICk7XHJcbiAgICAgIGlmICggYWJvdmVOdW1iZXJMaW5lICkge1xyXG4gICAgICAgIGlmICggZGVsdGFYIDwgMCApIHtcclxuICAgICAgICAgIGFycm93aGVhZEFuZ2xlID0gTWF0aC5QSSAtIHN0YXJ0QW5nbGUgKyBjb21wZW5zYXRpb25BbmdsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBhcnJvd2hlYWRBbmdsZSA9IE1hdGguUEkgKyBjb21wbGV0ZUFyY0VuZEFuZ2xlIC0gY29tcGVuc2F0aW9uQW5nbGU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICggZGVsdGFYIDwgMCApIHtcclxuICAgICAgICAgIGFycm93aGVhZEFuZ2xlID0gLXN0YXJ0QW5nbGUgLSBjb21wZW5zYXRpb25BbmdsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBhcnJvd2hlYWRBbmdsZSA9IGNvbXBsZXRlQXJjRW5kQW5nbGUgKyBjb21wZW5zYXRpb25BbmdsZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBNYXRoLmFicyggZGVsdGFYICkgPiAwICkge1xyXG5cclxuICAgICAgLy8gSW4gdGhpcyBjYXNlLCB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgc3RhcnQgYW5kIGVuZCBwb2ludHMgaXMgbGVzcyB0aGFuIHRoZSBpbnRlbmRlZCBhcGV4IG9mIHRoZSBjdXJ2ZSwgc28gYW5cclxuICAgICAgLy8gZWxsaXB0aWNhbCBhcmMgaXMgdXNlZCByYXRoZXIgdGhhbiBhIGNpcmN1bGFyIG9uZS5cclxuXHJcbiAgICAgIC8vIHBhcmFtZXRlcnMgb2YgdGhlIGVsbGlwdGljYWwgYXJjXHJcbiAgICAgIGNvbnN0IHJhZGl1c1ggPSBNYXRoLmFicyggZGVsdGFYIC8gMiApO1xyXG4gICAgICBjb25zdCByYWRpdXNZID0gQVBFWF9ESVNUQU5DRV9GUk9NX05VTUJFUl9MSU5FO1xyXG4gICAgICBsZXQgc3RhcnRBbmdsZTtcclxuICAgICAgbGV0IGVuZEFuZ2xlO1xyXG4gICAgICBsZXQgYW50aWNsb2Nrd2lzZTtcclxuXHJcbiAgICAgIC8vIGFkanVzdG1lbnQgYW5nbGUgZm9yIHRoZSBhcnJvd2hlYWQgLSBUaGlzIGZvcm11bGEgd2FzIGVtcGlyaWNhbGx5IGRldGVybWluZWQsIHRob3VnaCBhIHRydWUgZGVyaXZhdGlvbiBtYXkgYmVcclxuICAgICAgLy8gcG9zc2libGUuICBJIChqYnBoZXQpIHRyaWVkIGZvciBhYm91dCAxLzIsIHRoZW4gdHJpZWQgdGhpcyBhbmQgaXQgd29ya2VkLCBzbyBpdCB3YXMgbGVmdCBhdCB0aGlzLlxyXG4gICAgICBjb25zdCBhcnJvd2hlYWRBbmdsZUZyb21QZXJwZW5kaWN1bGFyID0gcmFkaXVzWCAvIHJhZGl1c1kgKiBNYXRoLlBJICogMC4xO1xyXG4gICAgICBpZiAoIGFib3ZlTnVtYmVyTGluZSApIHtcclxuICAgICAgICBpZiAoIGRlbHRhWCA+IDAgKSB7XHJcbiAgICAgICAgICBzdGFydEFuZ2xlID0gLU1hdGguUEk7XHJcbiAgICAgICAgICBlbmRBbmdsZSA9IHN0YXJ0QW5nbGUgKyAoIHByb3BvcnRpb24gKiBNYXRoLlBJICk7XHJcbiAgICAgICAgICBhbnRpY2xvY2t3aXNlID0gZmFsc2U7XHJcbiAgICAgICAgICBhcnJvd2hlYWRBbmdsZSA9IE1hdGguUEkgLSBhcnJvd2hlYWRBbmdsZUZyb21QZXJwZW5kaWN1bGFyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHN0YXJ0QW5nbGUgPSAwO1xyXG4gICAgICAgICAgZW5kQW5nbGUgPSAtcHJvcG9ydGlvbiAqIE1hdGguUEk7XHJcbiAgICAgICAgICBhbnRpY2xvY2t3aXNlID0gdHJ1ZTtcclxuICAgICAgICAgIGFycm93aGVhZEFuZ2xlID0gTWF0aC5QSSArIGFycm93aGVhZEFuZ2xlRnJvbVBlcnBlbmRpY3VsYXI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICggZGVsdGFYID4gMCApIHtcclxuICAgICAgICAgIHN0YXJ0QW5nbGUgPSBNYXRoLlBJO1xyXG4gICAgICAgICAgZW5kQW5nbGUgPSBzdGFydEFuZ2xlIC0gKCBwcm9wb3J0aW9uICogTWF0aC5QSSApO1xyXG4gICAgICAgICAgYW50aWNsb2Nrd2lzZSA9IHRydWU7XHJcbiAgICAgICAgICBhcnJvd2hlYWRBbmdsZSA9IGFycm93aGVhZEFuZ2xlRnJvbVBlcnBlbmRpY3VsYXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgc3RhcnRBbmdsZSA9IDA7XHJcbiAgICAgICAgICBlbmRBbmdsZSA9IHByb3BvcnRpb24gKiBNYXRoLlBJO1xyXG4gICAgICAgICAgYW50aWNsb2Nrd2lzZSA9IGZhbHNlO1xyXG4gICAgICAgICAgYXJyb3doZWFkQW5nbGUgPSAtYXJyb3doZWFkQW5nbGVGcm9tUGVycGVuZGljdWxhcjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxpbmVTaGFwZSA9IG5ldyBTaGFwZSgpLmVsbGlwdGljYWxBcmMoXHJcbiAgICAgICAgc3RhcnRQb2ludC54ICsgZGVsdGFYIC8gMixcclxuICAgICAgICBzdGFydFBvaW50LnksXHJcbiAgICAgICAgcmFkaXVzWCxcclxuICAgICAgICByYWRpdXNZLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgc3RhcnRBbmdsZSxcclxuICAgICAgICBlbmRBbmdsZSxcclxuICAgICAgICBhbnRpY2xvY2t3aXNlXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFRoZSBhbW91bnQgb2YgdGhlIG9wZXJhdGlvbiBpcyB6ZXJvLCBzbyB0aGUgY3VydmVkIGxpbmUgd2lsbCBiZSBhIGxvb3AgdGhhdCBzdGFydHMgYW5kIGVuZHMgYXQgdGhlIHNhbWUgcG9pbnQuXHJcbiAgICAgIGNvbnN0IGxvb3BTdGFydEFuZEVuZFBvaW50ID0gc3RhcnRQb2ludDtcclxuICAgICAgY29uc3QgeUFkZEZhY3RvciA9IEFQRVhfRElTVEFOQ0VfRlJPTV9OVU1CRVJfTElORSAqICggYWJvdmVOdW1iZXJMaW5lID8gLTEuNSA6IDEuNSApOyAvLyBlbXBpcmljYWwgZm9yIGRlc2lyZWQgaGVpZ2h0XHJcbiAgICAgIGNvbnN0IGNvbnRyb2xQb2ludEhlaWdodE11bHRpcGxpZXIgPSAwLjY7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gZ2V0IHRoZSBkZXNpcmVkIGxvb3Agd2lkdGhcclxuICAgICAgY29uc3QgY29udHJvbFBvaW50MSA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgIGxvb3BTdGFydEFuZEVuZFBvaW50LnggLSBjb250cm9sUG9pbnRIZWlnaHRNdWx0aXBsaWVyICogQVBFWF9ESVNUQU5DRV9GUk9NX05VTUJFUl9MSU5FLFxyXG4gICAgICAgIGxvb3BTdGFydEFuZEVuZFBvaW50LnkgKyB5QWRkRmFjdG9yXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IGNvbnRyb2xQb2ludDIgPSBuZXcgVmVjdG9yMihcclxuICAgICAgICBsb29wU3RhcnRBbmRFbmRQb2ludC54ICsgY29udHJvbFBvaW50SGVpZ2h0TXVsdGlwbGllciAqIEFQRVhfRElTVEFOQ0VfRlJPTV9OVU1CRVJfTElORSxcclxuICAgICAgICBsb29wU3RhcnRBbmRFbmRQb2ludC55ICsgeUFkZEZhY3RvclxyXG4gICAgICApO1xyXG4gICAgICBsaW5lU2hhcGUgPSBuZXcgU2hhcGUoKVxyXG4gICAgICAgIC5tb3ZlVG9Qb2ludCggbG9vcFN0YXJ0QW5kRW5kUG9pbnQgKVxyXG4gICAgICAgIC5jdWJpY0N1cnZlVG9Qb2ludCggY29udHJvbFBvaW50MSwgY29udHJvbFBvaW50MiwgbG9vcFN0YXJ0QW5kRW5kUG9pbnQgKTtcclxuXHJcbiAgICAgIC8vIFRoZSBmb3JtdWxhIGZvciB0aGUgYXJyb3doZWFkIGFuZ2xlIHdhcyBkZXRlcm1pbmVkIHRocm91Z2ggdHJpYWwgYW5kIGVycm9yLCB3aGljaCBpc24ndCBhIGdyZWF0IHdheSB0byBkbyBpdFxyXG4gICAgICAvLyBiZWNhdXNlIGl0IG1heSBub3Qgd29yayBpZiBzaWduaWZpY2FudCBjaGFuZ2VzIGFyZSBtYWRlIHRvIHRoZSBzaGFwZSBvZiB0aGUgbG9vcCwgYnV0IGV2YWx1YXRpbmcgdGhlIEJlemllclxyXG4gICAgICAvLyBjdXJ2ZSBmb3IgdGhpcyBzaG9ydCBkaXN0YW5jZSBwcm92ZWQgZGlmZmljdWx0LiAgVGhpcyBtYXkgcmVxdWlyZSBhZGp1c3RtZW50IGlmIHRoZSBzaXplIG9yIG9yaWVudGF0aW9ucyBvZiB0aGVcclxuICAgICAgLy8gbG9vcCBjaGFuZ2VzLlxyXG4gICAgICBjb25zdCBtdWx0aXBsaWVyID0gMC4wMjU7XHJcbiAgICAgIGNvbnN0IGxvb3BXaWR0aCA9IGxpbmVTaGFwZS5ib3VuZHMud2lkdGg7XHJcbiAgICAgIGlmICggb3BlcmF0aW9uLm9wZXJhdGlvblR5cGVQcm9wZXJ0eS52YWx1ZSA9PT0gT3BlcmF0aW9uLkFERElUSU9OICkge1xyXG4gICAgICAgIGlmICggYWJvdmVOdW1iZXJMaW5lICkge1xyXG4gICAgICAgICAgYXJyb3doZWFkQW5nbGUgPSBNYXRoLlBJICsgbG9vcFdpZHRoICogbXVsdGlwbGllcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBhcnJvd2hlYWRBbmdsZSA9IC1sb29wV2lkdGggKiBtdWx0aXBsaWVyO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBpZiAoIGFib3ZlTnVtYmVyTGluZSApIHtcclxuICAgICAgICAgIGFycm93aGVhZEFuZ2xlID0gTWF0aC5QSSAtIGxvb3BXaWR0aCAqIG11bHRpcGxpZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgYXJyb3doZWFkQW5nbGUgPSBsb29wV2lkdGggKiBtdWx0aXBsaWVyO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgc2hhcGVzIGZvciB0aGUgbGluZSBhbmQgdGhlIGFycm93aGVhZC4gIFNoYXBlcyB3aXRoIHRyYW5zbGF0aW9ucyBhcmUgdXNlZCBzbyB0aGF0IHRoZSBjbGlwIGFyZWEgd2lsbFxyXG4gICAgLy8gd29yayB3aXRob3V0IHRyaWNreSB0cmFuc2xhdGlvbnMuXHJcbiAgICB0aGlzLmN1cnZlZExpbmVOb2RlLnNoYXBlID0gbGluZVNoYXBlO1xyXG4gICAgdGhpcy5hcnJvd2hlYWROb2RlLnVwZGF0ZVNoYXBlKCBhcnJvd2hlYWRBbmdsZSwgZW5kUG9pbnQgKTtcclxuXHJcbiAgICAvLyBPbmx5IHNob3cgdGhlIGFycm93aGVhZCBmb3IgZnVsbCBvciBuZWFybHkgZnVsbCBkZXBpY3Rpb25zIG9mIHRoZSBvcGVyYXRpb24uXHJcbiAgICB0aGlzLmFycm93aGVhZE5vZGUudmlzaWJsZSA9IHByb3BvcnRpb24gPiAwLjk7XHJcblxyXG4gICAgLy8gSWYgbmVjZXNzYXJ5LCBzZXQgYSBjbGlwIGFyZWEgZm9yIHRoZSBsaW5lIGFuZCB0aGUgYXJyb3doZWFkIHNvIHRoYXQgdGhleSBkb24ndCBleHRlbmQgYmV5b25kIHRoZSBlZGdlcyBvZiB0aGVcclxuICAgIC8vIG51bWJlciBsaW5lLlxyXG4gICAgbGV0IGNsaXBBcmVhID0gbnVsbDtcclxuICAgIGlmICggbnVtYmVyTGluZS5pc09wZXJhdGlvbkNvbXBsZXRlbHlPdXRPZkRpc3BsYXllZFJhbmdlKCBvcGVyYXRpb24gKSB8fFxyXG4gICAgICAgICAoIG51bWJlckxpbmUuaXNPcGVyYXRpb25QYXJ0aWFsbHlJbkRpc3BsYXllZFJhbmdlKCBvcGVyYXRpb24gKSAmJiBvcGVyYXRpb24uYW1vdW50UHJvcGVydHkudmFsdWUgIT09IDAgKSApIHtcclxuXHJcbiAgICAgIGNvbnN0IGRpc3BsYXllZFJhbmdlID0gbnVtYmVyTGluZS5kaXNwbGF5ZWRSYW5nZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICBjb25zdCBjbGlwQXJlYU1pblhQb3NpdGlvbiA9IG51bWJlckxpbmUudmFsdWVUb01vZGVsUG9zaXRpb24oIGRpc3BsYXllZFJhbmdlLm1pbiApLng7XHJcbiAgICAgIGNvbnN0IGNsaXBBcmVhTWF4WFBvc2l0aW9uID0gbnVtYmVyTGluZS52YWx1ZVRvTW9kZWxQb3NpdGlvbiggZGlzcGxheWVkUmFuZ2UubWF4ICkueDtcclxuICAgICAgY2xpcEFyZWEgPSBTaGFwZS5yZWN0KFxyXG4gICAgICAgIGNsaXBBcmVhTWluWFBvc2l0aW9uLFxyXG4gICAgICAgIHN0YXJ0UG9pbnQueSAtIEFQRVhfRElTVEFOQ0VfRlJPTV9OVU1CRVJfTElORSAqIDUsXHJcbiAgICAgICAgY2xpcEFyZWFNYXhYUG9zaXRpb24gLSBjbGlwQXJlYU1pblhQb3NpdGlvbixcclxuICAgICAgICBBUEVYX0RJU1RBTkNFX0ZST01fTlVNQkVSX0xJTkUgKiAxMFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jdXJ2ZWRMaW5lTm9kZS5jbGlwQXJlYSA9IGNsaXBBcmVhO1xyXG4gICAgdGhpcy5hcnJvd2hlYWROb2RlLmNsaXBBcmVhID0gY2xpcEFyZWE7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogSW5uZXIgY2xhc3MgZm9yIGNyZWF0aW5nIHRoZSB0eXBlIG9mIGFycm93aGVhZCBuZWVkZWQgZm9yIHRoZSBvcGVyYXRpb25zIGxpbmVzLiAgUG9zaXRpb24gdGhlIHBvaW50IG9mIHRoZSBhcnJvd2hlYWRcclxuICogYnkgc3BlY2lmeWluZyB0aGUgeCBhbmQgeSBwb3NpdGlvbiBvZiB0aGUgbm9kZS5cclxuICovXHJcbmNsYXNzIEFycm93aGVhZE5vZGUgZXh0ZW5kcyBQYXRoIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByb3RhdGlvblxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGxlbmd0aCwgcm90YXRpb24sIHBvc2l0aW9uLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBsaW5lSm9pbjogJ3JvdW5kJyxcclxuICAgICAgZmlsbDogQ09MT1JcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggbnVsbCwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9XHJcbiAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZVNoYXBlKCByb3RhdGlvbiwgcG9zaXRpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHVwZGF0ZSB0aGUgc2hhcGUgdG8gaGF2ZSB0aGUgb3JpZ2luYWwgbGVuZ3RoIGJ1dCBhIG5ldyByb3RhdGlvbiBhbmQgcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0gcm90YXRpb24gLSBpbiByYWRpYW5zXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb3NpdGlvblxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB1cGRhdGVTaGFwZSggcm90YXRpb24sIHBvc2l0aW9uICkge1xyXG4gICAgdGhpcy5zZXRTaGFwZSggTk9STUFMSVpFRF9BUlJPV0hFQURfU0hBUEVcclxuICAgICAgLnRyYW5zZm9ybWVkKCBNYXRyaXgzLnNjYWxlKCB0aGlzLmxlbmd0aCApIClcclxuICAgICAgLnRyYW5zZm9ybWVkKCBNYXRyaXgzLnJvdGF0aW9uQXJvdW5kKCByb3RhdGlvbiwgMCwgMCApIClcclxuICAgICAgLnRyYW5zZm9ybWVkKCBNYXRyaXgzLnRyYW5zbGF0aW9uRnJvbVZlY3RvciggcG9zaXRpb24gKSApXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyTGluZU9wZXJhdGlvbnMucmVnaXN0ZXIoICdPcGVyYXRpb25BcnJvd05vZGUnLCBPcGVyYXRpb25BcnJvd05vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgT3BlcmF0aW9uQXJyb3dOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNyRSxPQUFPQyxTQUFTLE1BQU0sbUNBQW1DO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSxnQ0FBZ0M7QUFDbkQsT0FBT0Ms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