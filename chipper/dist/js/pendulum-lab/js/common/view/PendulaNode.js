// Copyright 2014-2022, University of Colorado Boulder

/**
 * Pendulum node in 'Pendulum Lab' simulation.
 * Contains pendula and threads. Pendula always above threads.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Color, Line, LinearGradient, Node, Rectangle, SimpleDragHandler, Text } from '../../../../scenery/js/imports.js';
import pendulumLab from '../../pendulumLab.js';
import Pendulum from '../model/Pendulum.js';
import PendulumLabConstants from '../PendulumLabConstants.js';

// constants
const ARROW_HEAD_WIDTH = 12;
const ARROW_TAIL_WIDTH = 6;
const ARROW_SIZE_DEFAULT = 25;
const RECT_SIZE = new Dimension2(73, 98);
class PendulaNode extends Node {
  /**
   * @param {Array.<Pendulum>} pendula - Array of pendulum models.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor(pendula, modelViewTransform, options) {
    options = merge({
      preventFit: true
    }, options);
    super(options);
    const viewOriginPosition = modelViewTransform.modelToViewPosition(Vector2.ZERO);

    // @public {startDrag: {function}, computeDistance: {function}} - To identify how close a draggable object is.
    this.draggableItems = [];
    const pendulumNodes = [];
    const velocityArrows = [];
    const accelerationArrows = [];
    pendula.forEach((pendulum, pendulumIndex) => {
      const massToScale = mass => 0.3 + 0.4 * Math.sqrt(mass / 1.5);

      // create the visual representation of a rod that joins the fulcrum point to the bob
      // initially set to be vertical
      const solidLine = new Line(0, 0, 0, modelViewTransform.modelToViewDeltaY(pendulum.lengthProperty.value), {
        stroke: 'black',
        pickable: false
      });

      // create the visual representation of a pendulum bob (a rectangle with a string and a line across the rectangle)
      const pendulumRect = new Node({
        children: [new Rectangle(-RECT_SIZE.width / 2, -RECT_SIZE.height / 2, RECT_SIZE.width, RECT_SIZE.height, {
          fill: new LinearGradient(-RECT_SIZE.width / 2, 0, RECT_SIZE.width / 2, 0).addColorStop(0, Color.toColor(pendulum.color).colorUtilsBrighter(0.4)).addColorStop(0.2, Color.toColor(pendulum.color).colorUtilsBrighter(0.9)).addColorStop(0.7, pendulum.color)
        }), new Text((pendulumIndex + 1).toString(), {
          font: PendulumLabConstants.PENDULUM_LABEL_FONT,
          fill: 'white',
          centerY: RECT_SIZE.height / 4,
          centerX: 0,
          pickable: false
        }), new Line(-RECT_SIZE.width / 2, 0, RECT_SIZE.width / 2, 0, {
          stroke: 'black',
          lineCap: 'butt',
          pickable: false
        })]
      });

      // create the visual representation of a pendulum (bob + rod)
      const pendulumNode = new Node({
        cursor: 'pointer',
        children: [solidLine, pendulumRect]
      });

      // add velocity arrows if necessary
      if (options.isVelocityVisibleProperty) {
        const velocityArrow = new ArrowNode(0, 0, 0, 0, {
          pickable: false,
          fill: PendulumLabConstants.VELOCITY_ARROW_COLOR,
          tailWidth: ARROW_TAIL_WIDTH,
          headWidth: ARROW_HEAD_WIDTH
        });
        velocityArrows.push(velocityArrow);

        // no need to unlink, present for the lifetime of the sim
        Multilink.multilink([pendulum.isVisibleProperty, options.isVelocityVisibleProperty, pendulum.velocityProperty], (pendulumVisible, velocityVisible, velocity) => {
          velocityArrow.visible = pendulumVisible && velocityVisible;
          // update the size of the arrow
          if (velocityArrow.visible) {
            const position = modelViewTransform.modelToViewPosition(pendulum.positionProperty.value);
            velocityArrow.setTailAndTip(position.x, position.y, position.x + ARROW_SIZE_DEFAULT * velocity.x, position.y - ARROW_SIZE_DEFAULT * velocity.y);
          }
        });
      }

      // add acceleration arrows if necessary
      if (options.isAccelerationVisibleProperty) {
        // create acceleration arrow
        const accelerationArrow = new ArrowNode(0, 0, 0, 0, {
          pickable: false,
          fill: PendulumLabConstants.ACCELERATION_ARROW_COLOR,
          tailWidth: ARROW_TAIL_WIDTH,
          headWidth: ARROW_HEAD_WIDTH
        });
        accelerationArrows.push(accelerationArrow);

        // no need to unlink, present for the lifetime of the sim
        Multilink.multilink([pendulum.isVisibleProperty, options.isAccelerationVisibleProperty, pendulum.accelerationProperty], (pendulumVisible, accelerationVisible, acceleration) => {
          accelerationArrow.visible = pendulumVisible && accelerationVisible;
          if (accelerationArrow.visible) {
            const position = modelViewTransform.modelToViewPosition(pendulum.positionProperty.value);
            accelerationArrow.setTailAndTip(position.x, position.y, position.x + ARROW_SIZE_DEFAULT * acceleration.x, position.y - ARROW_SIZE_DEFAULT * acceleration.y);
          }
        });
      }
      pendulumNodes.push(pendulumNode);

      // add drag events
      let angleOffset;
      const dragListener = new SimpleDragHandler({
        allowTouchSnag: true,
        // determine the position of where the pendulum is dragged.
        start: event => {
          const dragAngle = modelViewTransform.viewToModelPosition(this.globalToLocalPoint(event.pointer.point)).angle + Math.PI / 2;
          angleOffset = pendulum.angleProperty.value - dragAngle;
          pendulum.isUserControlledProperty.value = true;
        },
        // set the angle of the pendulum depending on where it is dragged to.
        drag: event => {
          const dragAngle = modelViewTransform.viewToModelPosition(this.globalToLocalPoint(event.pointer.point)).angle + Math.PI / 2;
          const continuousAngle = Pendulum.modAngle(angleOffset + dragAngle);

          // Round angles to nearest degree, see https://github.com/phetsims/pendulum-lab/issues/195
          let roundedAngleDegrees = Utils.roundSymmetric(Utils.toDegrees(continuousAngle));

          // Don't allow snapping to 180, see https://github.com/phetsims/pendulum-lab/issues/195
          if (Math.abs(roundedAngleDegrees) === 180) {
            roundedAngleDegrees = Math.sign(roundedAngleDegrees) * 179;
          }
          const roundedAngle = Utils.toRadians(roundedAngleDegrees);
          pendulum.angleProperty.value = roundedAngle;
        },
        // release user control
        end: () => {
          pendulum.isUserControlledProperty.value = false;
        }
      });

      // add a drag listener
      pendulumRect.addInputListener(dragListener);
      this.draggableItems.push({
        startDrag: dragListener.startDrag.bind(dragListener),
        computeDistance: globalPoint => {
          if (pendulum.isUserControlledProperty.value || !pendulum.isVisibleProperty.value) {
            return Number.POSITIVE_INFINITY;
          } else {
            const cursorModelPosition = modelViewTransform.viewToModelPosition(this.globalToLocalPoint(globalPoint));
            cursorModelPosition.rotate(-pendulum.angleProperty.value).add(new Vector2(0, pendulum.lengthProperty.value)); // rotate/length so (0,0) would be mass center
            const massViewWidth = modelViewTransform.viewToModelDeltaX(RECT_SIZE.width * massToScale(pendulum.massProperty.value));
            const massViewHeight = modelViewTransform.viewToModelDeltaX(RECT_SIZE.height * massToScale(pendulum.massProperty.value));
            const massBounds = new Bounds2(-massViewWidth / 2, -massViewHeight / 2, massViewWidth / 2, massViewHeight / 2);
            return Math.sqrt(massBounds.minimumDistanceToPointSquared(cursorModelPosition));
          }
        }
      });

      // update pendulum rotation, pendulum.angleProperty.value is radians
      // we are using an inverted modelViewTransform, hence we multiply the view angle by minus one
      pendulum.angleProperty.link(angle => {
        pendulumNode.rotation = -angle;
        pendulumNode.translation = viewOriginPosition;
      });

      // update pendulum components position
      pendulum.lengthProperty.link(length => {
        const viewPendulumLength = modelViewTransform.modelToViewDeltaX(length);
        pendulumRect.setY(viewPendulumLength);
        solidLine.setY2(viewPendulumLength);
      });

      // update rectangle size
      pendulum.massProperty.link(mass => {
        pendulumRect.setScaleMagnitude(massToScale(mass));
      });

      // update visibility
      pendulum.isVisibleProperty.linkAttribute(pendulumNode, 'visible');
    });
    this.children = pendulumNodes.concat(velocityArrows).concat(accelerationArrows);
  }
}
pendulumLab.register('PendulaNode', PendulaNode);
export default PendulaNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIlV0aWxzIiwiVmVjdG9yMiIsIm1lcmdlIiwiQXJyb3dOb2RlIiwiQ29sb3IiLCJMaW5lIiwiTGluZWFyR3JhZGllbnQiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiU2ltcGxlRHJhZ0hhbmRsZXIiLCJUZXh0IiwicGVuZHVsdW1MYWIiLCJQZW5kdWx1bSIsIlBlbmR1bHVtTGFiQ29uc3RhbnRzIiwiQVJST1dfSEVBRF9XSURUSCIsIkFSUk9XX1RBSUxfV0lEVEgiLCJBUlJPV19TSVpFX0RFRkFVTFQiLCJSRUNUX1NJWkUiLCJQZW5kdWxhTm9kZSIsImNvbnN0cnVjdG9yIiwicGVuZHVsYSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIm9wdGlvbnMiLCJwcmV2ZW50Rml0Iiwidmlld09yaWdpblBvc2l0aW9uIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsIlpFUk8iLCJkcmFnZ2FibGVJdGVtcyIsInBlbmR1bHVtTm9kZXMiLCJ2ZWxvY2l0eUFycm93cyIsImFjY2VsZXJhdGlvbkFycm93cyIsImZvckVhY2giLCJwZW5kdWx1bSIsInBlbmR1bHVtSW5kZXgiLCJtYXNzVG9TY2FsZSIsIm1hc3MiLCJNYXRoIiwic3FydCIsInNvbGlkTGluZSIsIm1vZGVsVG9WaWV3RGVsdGFZIiwibGVuZ3RoUHJvcGVydHkiLCJ2YWx1ZSIsInN0cm9rZSIsInBpY2thYmxlIiwicGVuZHVsdW1SZWN0IiwiY2hpbGRyZW4iLCJ3aWR0aCIsImhlaWdodCIsImZpbGwiLCJhZGRDb2xvclN0b3AiLCJ0b0NvbG9yIiwiY29sb3IiLCJjb2xvclV0aWxzQnJpZ2h0ZXIiLCJ0b1N0cmluZyIsImZvbnQiLCJQRU5EVUxVTV9MQUJFTF9GT05UIiwiY2VudGVyWSIsImNlbnRlclgiLCJsaW5lQ2FwIiwicGVuZHVsdW1Ob2RlIiwiY3Vyc29yIiwiaXNWZWxvY2l0eVZpc2libGVQcm9wZXJ0eSIsInZlbG9jaXR5QXJyb3ciLCJWRUxPQ0lUWV9BUlJPV19DT0xPUiIsInRhaWxXaWR0aCIsImhlYWRXaWR0aCIsInB1c2giLCJtdWx0aWxpbmsiLCJpc1Zpc2libGVQcm9wZXJ0eSIsInZlbG9jaXR5UHJvcGVydHkiLCJwZW5kdWx1bVZpc2libGUiLCJ2ZWxvY2l0eVZpc2libGUiLCJ2ZWxvY2l0eSIsInZpc2libGUiLCJwb3NpdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJzZXRUYWlsQW5kVGlwIiwieCIsInkiLCJpc0FjY2VsZXJhdGlvblZpc2libGVQcm9wZXJ0eSIsImFjY2VsZXJhdGlvbkFycm93IiwiQUNDRUxFUkFUSU9OX0FSUk9XX0NPTE9SIiwiYWNjZWxlcmF0aW9uUHJvcGVydHkiLCJhY2NlbGVyYXRpb25WaXNpYmxlIiwiYWNjZWxlcmF0aW9uIiwiYW5nbGVPZmZzZXQiLCJkcmFnTGlzdGVuZXIiLCJhbGxvd1RvdWNoU25hZyIsInN0YXJ0IiwiZXZlbnQiLCJkcmFnQW5nbGUiLCJ2aWV3VG9Nb2RlbFBvc2l0aW9uIiwiZ2xvYmFsVG9Mb2NhbFBvaW50IiwicG9pbnRlciIsInBvaW50IiwiYW5nbGUiLCJQSSIsImFuZ2xlUHJvcGVydHkiLCJpc1VzZXJDb250cm9sbGVkUHJvcGVydHkiLCJkcmFnIiwiY29udGludW91c0FuZ2xlIiwibW9kQW5nbGUiLCJyb3VuZGVkQW5nbGVEZWdyZWVzIiwicm91bmRTeW1tZXRyaWMiLCJ0b0RlZ3JlZXMiLCJhYnMiLCJzaWduIiwicm91bmRlZEFuZ2xlIiwidG9SYWRpYW5zIiwiZW5kIiwiYWRkSW5wdXRMaXN0ZW5lciIsInN0YXJ0RHJhZyIsImJpbmQiLCJjb21wdXRlRGlzdGFuY2UiLCJnbG9iYWxQb2ludCIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiY3Vyc29yTW9kZWxQb3NpdGlvbiIsInJvdGF0ZSIsImFkZCIsIm1hc3NWaWV3V2lkdGgiLCJ2aWV3VG9Nb2RlbERlbHRhWCIsIm1hc3NQcm9wZXJ0eSIsIm1hc3NWaWV3SGVpZ2h0IiwibWFzc0JvdW5kcyIsIm1pbmltdW1EaXN0YW5jZVRvUG9pbnRTcXVhcmVkIiwibGluayIsInJvdGF0aW9uIiwidHJhbnNsYXRpb24iLCJsZW5ndGgiLCJ2aWV3UGVuZHVsdW1MZW5ndGgiLCJtb2RlbFRvVmlld0RlbHRhWCIsInNldFkiLCJzZXRZMiIsInNldFNjYWxlTWFnbml0dWRlIiwibGlua0F0dHJpYnV0ZSIsImNvbmNhdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGVuZHVsYU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUGVuZHVsdW0gbm9kZSBpbiAnUGVuZHVsdW0gTGFiJyBzaW11bGF0aW9uLlxyXG4gKiBDb250YWlucyBwZW5kdWxhIGFuZCB0aHJlYWRzLiBQZW5kdWxhIGFsd2F5cyBhYm92ZSB0aHJlYWRzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFuZHJleSBaZWxlbmtvdiAoTWxlYXJuZXIpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIExpbmUsIExpbmVhckdyYWRpZW50LCBOb2RlLCBSZWN0YW5nbGUsIFNpbXBsZURyYWdIYW5kbGVyLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHBlbmR1bHVtTGFiIGZyb20gJy4uLy4uL3BlbmR1bHVtTGFiLmpzJztcclxuaW1wb3J0IFBlbmR1bHVtIGZyb20gJy4uL21vZGVsL1BlbmR1bHVtLmpzJztcclxuaW1wb3J0IFBlbmR1bHVtTGFiQ29uc3RhbnRzIGZyb20gJy4uL1BlbmR1bHVtTGFiQ29uc3RhbnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBBUlJPV19IRUFEX1dJRFRIID0gMTI7XHJcbmNvbnN0IEFSUk9XX1RBSUxfV0lEVEggPSA2O1xyXG5jb25zdCBBUlJPV19TSVpFX0RFRkFVTFQgPSAyNTtcclxuY29uc3QgUkVDVF9TSVpFID0gbmV3IERpbWVuc2lvbjIoIDczLCA5OCApO1xyXG5cclxuY2xhc3MgUGVuZHVsYU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0FycmF5LjxQZW5kdWx1bT59IHBlbmR1bGEgLSBBcnJheSBvZiBwZW5kdWx1bSBtb2RlbHMuXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHBlbmR1bGEsIG1vZGVsVmlld1RyYW5zZm9ybSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgcHJldmVudEZpdDogdHJ1ZVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3Qgdmlld09yaWdpblBvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIFZlY3RvcjIuWkVSTyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0YXJ0RHJhZzoge2Z1bmN0aW9ufSwgY29tcHV0ZURpc3RhbmNlOiB7ZnVuY3Rpb259fSAtIFRvIGlkZW50aWZ5IGhvdyBjbG9zZSBhIGRyYWdnYWJsZSBvYmplY3QgaXMuXHJcbiAgICB0aGlzLmRyYWdnYWJsZUl0ZW1zID0gW107XHJcblxyXG4gICAgY29uc3QgcGVuZHVsdW1Ob2RlcyA9IFtdO1xyXG4gICAgY29uc3QgdmVsb2NpdHlBcnJvd3MgPSBbXTtcclxuICAgIGNvbnN0IGFjY2VsZXJhdGlvbkFycm93cyA9IFtdO1xyXG5cclxuICAgIHBlbmR1bGEuZm9yRWFjaCggKCBwZW5kdWx1bSwgcGVuZHVsdW1JbmRleCApID0+IHtcclxuICAgICAgY29uc3QgbWFzc1RvU2NhbGUgPSBtYXNzID0+IDAuMyArIDAuNCAqIE1hdGguc3FydCggbWFzcyAvIDEuNSApO1xyXG5cclxuICAgICAgLy8gY3JlYXRlIHRoZSB2aXN1YWwgcmVwcmVzZW50YXRpb24gb2YgYSByb2QgdGhhdCBqb2lucyB0aGUgZnVsY3J1bSBwb2ludCB0byB0aGUgYm9iXHJcbiAgICAgIC8vIGluaXRpYWxseSBzZXQgdG8gYmUgdmVydGljYWxcclxuICAgICAgY29uc3Qgc29saWRMaW5lID0gbmV3IExpbmUoIDAsIDAsIDAsIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWSggcGVuZHVsdW0ubGVuZ3RoUHJvcGVydHkudmFsdWUgKSwge1xyXG4gICAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gY3JlYXRlIHRoZSB2aXN1YWwgcmVwcmVzZW50YXRpb24gb2YgYSBwZW5kdWx1bSBib2IgKGEgcmVjdGFuZ2xlIHdpdGggYSBzdHJpbmcgYW5kIGEgbGluZSBhY3Jvc3MgdGhlIHJlY3RhbmdsZSlcclxuICAgICAgY29uc3QgcGVuZHVsdW1SZWN0ID0gbmV3IE5vZGUoIHtcclxuICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgbmV3IFJlY3RhbmdsZSggLVJFQ1RfU0laRS53aWR0aCAvIDIsIC1SRUNUX1NJWkUuaGVpZ2h0IC8gMiwgUkVDVF9TSVpFLndpZHRoLCBSRUNUX1NJWkUuaGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGZpbGw6IG5ldyBMaW5lYXJHcmFkaWVudCggLVJFQ1RfU0laRS53aWR0aCAvIDIsIDAsIFJFQ1RfU0laRS53aWR0aCAvIDIsIDAgKS5hZGRDb2xvclN0b3AoIDAsIENvbG9yLnRvQ29sb3IoIHBlbmR1bHVtLmNvbG9yICkuY29sb3JVdGlsc0JyaWdodGVyKCAwLjQgKSApXHJcbiAgICAgICAgICAgICAgLmFkZENvbG9yU3RvcCggMC4yLCBDb2xvci50b0NvbG9yKCBwZW5kdWx1bS5jb2xvciApLmNvbG9yVXRpbHNCcmlnaHRlciggMC45ICkgKVxyXG4gICAgICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDAuNywgcGVuZHVsdW0uY29sb3IgKVxyXG4gICAgICAgICAgfSApLFxyXG4gICAgICAgICAgbmV3IFRleHQoICggcGVuZHVsdW1JbmRleCArIDEgKS50b1N0cmluZygpLCB7XHJcbiAgICAgICAgICAgIGZvbnQ6IFBlbmR1bHVtTGFiQ29uc3RhbnRzLlBFTkRVTFVNX0xBQkVMX0ZPTlQsXHJcbiAgICAgICAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgIGNlbnRlclk6IFJFQ1RfU0laRS5oZWlnaHQgLyA0LFxyXG4gICAgICAgICAgICBjZW50ZXJYOiAwLFxyXG4gICAgICAgICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgICAgICAgIH0gKSxcclxuICAgICAgICAgIG5ldyBMaW5lKCAtUkVDVF9TSVpFLndpZHRoIC8gMiwgMCwgUkVDVF9TSVpFLndpZHRoIC8gMiwgMCwge1xyXG4gICAgICAgICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgICAgICAgIGxpbmVDYXA6ICdidXR0JyxcclxuICAgICAgICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICAgICAgICB9IClcclxuICAgICAgICBdXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGNyZWF0ZSB0aGUgdmlzdWFsIHJlcHJlc2VudGF0aW9uIG9mIGEgcGVuZHVsdW0gKGJvYiArIHJvZClcclxuICAgICAgY29uc3QgcGVuZHVsdW1Ob2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgc29saWRMaW5lLFxyXG4gICAgICAgICAgcGVuZHVsdW1SZWN0XHJcbiAgICAgICAgXVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBhZGQgdmVsb2NpdHkgYXJyb3dzIGlmIG5lY2Vzc2FyeVxyXG4gICAgICBpZiAoIG9wdGlvbnMuaXNWZWxvY2l0eVZpc2libGVQcm9wZXJ0eSApIHtcclxuICAgICAgICBjb25zdCB2ZWxvY2l0eUFycm93ID0gbmV3IEFycm93Tm9kZSggMCwgMCwgMCwgMCwge1xyXG4gICAgICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICAgICAgZmlsbDogUGVuZHVsdW1MYWJDb25zdGFudHMuVkVMT0NJVFlfQVJST1dfQ09MT1IsXHJcbiAgICAgICAgICB0YWlsV2lkdGg6IEFSUk9XX1RBSUxfV0lEVEgsXHJcbiAgICAgICAgICBoZWFkV2lkdGg6IEFSUk9XX0hFQURfV0lEVEhcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgdmVsb2NpdHlBcnJvd3MucHVzaCggdmVsb2NpdHlBcnJvdyApO1xyXG5cclxuICAgICAgICAvLyBubyBuZWVkIHRvIHVubGluaywgcHJlc2VudCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgICAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHBlbmR1bHVtLmlzVmlzaWJsZVByb3BlcnR5LCBvcHRpb25zLmlzVmVsb2NpdHlWaXNpYmxlUHJvcGVydHksIHBlbmR1bHVtLnZlbG9jaXR5UHJvcGVydHkgXSwgKCBwZW5kdWx1bVZpc2libGUsIHZlbG9jaXR5VmlzaWJsZSwgdmVsb2NpdHkgKSA9PiB7XHJcbiAgICAgICAgICB2ZWxvY2l0eUFycm93LnZpc2libGUgPSBwZW5kdWx1bVZpc2libGUgJiYgdmVsb2NpdHlWaXNpYmxlO1xyXG4gICAgICAgICAgLy8gdXBkYXRlIHRoZSBzaXplIG9mIHRoZSBhcnJvd1xyXG4gICAgICAgICAgaWYgKCB2ZWxvY2l0eUFycm93LnZpc2libGUgKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBlbmR1bHVtLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICAgICAgdmVsb2NpdHlBcnJvdy5zZXRUYWlsQW5kVGlwKCBwb3NpdGlvbi54LFxyXG4gICAgICAgICAgICAgIHBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgICAgcG9zaXRpb24ueCArIEFSUk9XX1NJWkVfREVGQVVMVCAqIHZlbG9jaXR5LngsXHJcbiAgICAgICAgICAgICAgcG9zaXRpb24ueSAtIEFSUk9XX1NJWkVfREVGQVVMVCAqIHZlbG9jaXR5LnkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgICAvLyBhZGQgYWNjZWxlcmF0aW9uIGFycm93cyBpZiBuZWNlc3NhcnlcclxuICAgICAgaWYgKCBvcHRpb25zLmlzQWNjZWxlcmF0aW9uVmlzaWJsZVByb3BlcnR5ICkge1xyXG4gICAgICAgIC8vIGNyZWF0ZSBhY2NlbGVyYXRpb24gYXJyb3dcclxuICAgICAgICBjb25zdCBhY2NlbGVyYXRpb25BcnJvdyA9IG5ldyBBcnJvd05vZGUoIDAsIDAsIDAsIDAsIHtcclxuICAgICAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgICAgIGZpbGw6IFBlbmR1bHVtTGFiQ29uc3RhbnRzLkFDQ0VMRVJBVElPTl9BUlJPV19DT0xPUixcclxuICAgICAgICAgIHRhaWxXaWR0aDogQVJST1dfVEFJTF9XSURUSCxcclxuICAgICAgICAgIGhlYWRXaWR0aDogQVJST1dfSEVBRF9XSURUSFxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBhY2NlbGVyYXRpb25BcnJvd3MucHVzaCggYWNjZWxlcmF0aW9uQXJyb3cgKTtcclxuXHJcbiAgICAgICAgLy8gbm8gbmVlZCB0byB1bmxpbmssIHByZXNlbnQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICAgICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBwZW5kdWx1bS5pc1Zpc2libGVQcm9wZXJ0eSwgb3B0aW9ucy5pc0FjY2VsZXJhdGlvblZpc2libGVQcm9wZXJ0eSwgcGVuZHVsdW0uYWNjZWxlcmF0aW9uUHJvcGVydHkgXSwgKCBwZW5kdWx1bVZpc2libGUsIGFjY2VsZXJhdGlvblZpc2libGUsIGFjY2VsZXJhdGlvbiApID0+IHtcclxuICAgICAgICAgIGFjY2VsZXJhdGlvbkFycm93LnZpc2libGUgPSBwZW5kdWx1bVZpc2libGUgJiYgYWNjZWxlcmF0aW9uVmlzaWJsZTtcclxuICAgICAgICAgIGlmICggYWNjZWxlcmF0aW9uQXJyb3cudmlzaWJsZSApIHtcclxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggcGVuZHVsdW0ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICAgICAgICBhY2NlbGVyYXRpb25BcnJvdy5zZXRUYWlsQW5kVGlwKCBwb3NpdGlvbi54LFxyXG4gICAgICAgICAgICAgIHBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgICAgcG9zaXRpb24ueCArIEFSUk9XX1NJWkVfREVGQVVMVCAqIGFjY2VsZXJhdGlvbi54LFxyXG4gICAgICAgICAgICAgIHBvc2l0aW9uLnkgLSBBUlJPV19TSVpFX0RFRkFVTFQgKiBhY2NlbGVyYXRpb24ueSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGVuZHVsdW1Ob2Rlcy5wdXNoKCBwZW5kdWx1bU5vZGUgKTtcclxuXHJcbiAgICAgIC8vIGFkZCBkcmFnIGV2ZW50c1xyXG4gICAgICBsZXQgYW5nbGVPZmZzZXQ7XHJcbiAgICAgIGNvbnN0IGRyYWdMaXN0ZW5lciA9IG5ldyBTaW1wbGVEcmFnSGFuZGxlcigge1xyXG4gICAgICAgIGFsbG93VG91Y2hTbmFnOiB0cnVlLFxyXG5cclxuICAgICAgICAvLyBkZXRlcm1pbmUgdGhlIHBvc2l0aW9uIG9mIHdoZXJlIHRoZSBwZW5kdWx1bSBpcyBkcmFnZ2VkLlxyXG4gICAgICAgIHN0YXJ0OiBldmVudCA9PiB7XHJcbiAgICAgICAgICBjb25zdCBkcmFnQW5nbGUgPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxQb3NpdGlvbiggdGhpcy5nbG9iYWxUb0xvY2FsUG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKSApLmFuZ2xlICsgTWF0aC5QSSAvIDI7XHJcbiAgICAgICAgICBhbmdsZU9mZnNldCA9IHBlbmR1bHVtLmFuZ2xlUHJvcGVydHkudmFsdWUgLSBkcmFnQW5nbGU7XHJcblxyXG4gICAgICAgICAgcGVuZHVsdW0uaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvLyBzZXQgdGhlIGFuZ2xlIG9mIHRoZSBwZW5kdWx1bSBkZXBlbmRpbmcgb24gd2hlcmUgaXQgaXMgZHJhZ2dlZCB0by5cclxuICAgICAgICBkcmFnOiBldmVudCA9PiB7XHJcbiAgICAgICAgICBjb25zdCBkcmFnQW5nbGUgPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxQb3NpdGlvbiggdGhpcy5nbG9iYWxUb0xvY2FsUG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKSApLmFuZ2xlICsgTWF0aC5QSSAvIDI7XHJcbiAgICAgICAgICBjb25zdCBjb250aW51b3VzQW5nbGUgPSBQZW5kdWx1bS5tb2RBbmdsZSggYW5nbGVPZmZzZXQgKyBkcmFnQW5nbGUgKTtcclxuXHJcbiAgICAgICAgICAvLyBSb3VuZCBhbmdsZXMgdG8gbmVhcmVzdCBkZWdyZWUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGVuZHVsdW0tbGFiL2lzc3Vlcy8xOTVcclxuICAgICAgICAgIGxldCByb3VuZGVkQW5nbGVEZWdyZWVzID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIFV0aWxzLnRvRGVncmVlcyggY29udGludW91c0FuZ2xlICkgKTtcclxuXHJcbiAgICAgICAgICAvLyBEb24ndCBhbGxvdyBzbmFwcGluZyB0byAxODAsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGVuZHVsdW0tbGFiL2lzc3Vlcy8xOTVcclxuICAgICAgICAgIGlmICggTWF0aC5hYnMoIHJvdW5kZWRBbmdsZURlZ3JlZXMgKSA9PT0gMTgwICkge1xyXG4gICAgICAgICAgICByb3VuZGVkQW5nbGVEZWdyZWVzID0gTWF0aC5zaWduKCByb3VuZGVkQW5nbGVEZWdyZWVzICkgKiAxNzk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3Qgcm91bmRlZEFuZ2xlID0gVXRpbHMudG9SYWRpYW5zKCByb3VuZGVkQW5nbGVEZWdyZWVzICk7XHJcbiAgICAgICAgICBwZW5kdWx1bS5hbmdsZVByb3BlcnR5LnZhbHVlID0gcm91bmRlZEFuZ2xlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vIHJlbGVhc2UgdXNlciBjb250cm9sXHJcbiAgICAgICAgZW5kOiAoKSA9PiB7XHJcbiAgICAgICAgICBwZW5kdWx1bS5pc1VzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGFkZCBhIGRyYWcgbGlzdGVuZXJcclxuICAgICAgcGVuZHVsdW1SZWN0LmFkZElucHV0TGlzdGVuZXIoIGRyYWdMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLmRyYWdnYWJsZUl0ZW1zLnB1c2goIHtcclxuICAgICAgICBzdGFydERyYWc6IGRyYWdMaXN0ZW5lci5zdGFydERyYWcuYmluZCggZHJhZ0xpc3RlbmVyICksXHJcbiAgICAgICAgY29tcHV0ZURpc3RhbmNlOiBnbG9iYWxQb2ludCA9PiB7XHJcbiAgICAgICAgICBpZiAoIHBlbmR1bHVtLmlzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSB8fCAhcGVuZHVsdW0uaXNWaXNpYmxlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgY3Vyc29yTW9kZWxQb3NpdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbFBvc2l0aW9uKCB0aGlzLmdsb2JhbFRvTG9jYWxQb2ludCggZ2xvYmFsUG9pbnQgKSApO1xyXG4gICAgICAgICAgICBjdXJzb3JNb2RlbFBvc2l0aW9uLnJvdGF0ZSggLXBlbmR1bHVtLmFuZ2xlUHJvcGVydHkudmFsdWUgKS5hZGQoIG5ldyBWZWN0b3IyKCAwLCBwZW5kdWx1bS5sZW5ndGhQcm9wZXJ0eS52YWx1ZSApICk7IC8vIHJvdGF0ZS9sZW5ndGggc28gKDAsMCkgd291bGQgYmUgbWFzcyBjZW50ZXJcclxuICAgICAgICAgICAgY29uc3QgbWFzc1ZpZXdXaWR0aCA9IG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbERlbHRhWCggUkVDVF9TSVpFLndpZHRoICogbWFzc1RvU2NhbGUoIHBlbmR1bHVtLm1hc3NQcm9wZXJ0eS52YWx1ZSApICk7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hc3NWaWV3SGVpZ2h0ID0gbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsRGVsdGFYKCBSRUNUX1NJWkUuaGVpZ2h0ICogbWFzc1RvU2NhbGUoIHBlbmR1bHVtLm1hc3NQcm9wZXJ0eS52YWx1ZSApICk7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hc3NCb3VuZHMgPSBuZXcgQm91bmRzMiggLW1hc3NWaWV3V2lkdGggLyAyLCAtbWFzc1ZpZXdIZWlnaHQgLyAyLCBtYXNzVmlld1dpZHRoIC8gMiwgbWFzc1ZpZXdIZWlnaHQgLyAyICk7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQoIG1hc3NCb3VuZHMubWluaW11bURpc3RhbmNlVG9Qb2ludFNxdWFyZWQoIGN1cnNvck1vZGVsUG9zaXRpb24gKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHBlbmR1bHVtIHJvdGF0aW9uLCBwZW5kdWx1bS5hbmdsZVByb3BlcnR5LnZhbHVlIGlzIHJhZGlhbnNcclxuICAgICAgLy8gd2UgYXJlIHVzaW5nIGFuIGludmVydGVkIG1vZGVsVmlld1RyYW5zZm9ybSwgaGVuY2Ugd2UgbXVsdGlwbHkgdGhlIHZpZXcgYW5nbGUgYnkgbWludXMgb25lXHJcbiAgICAgIHBlbmR1bHVtLmFuZ2xlUHJvcGVydHkubGluayggYW5nbGUgPT4ge1xyXG4gICAgICAgIHBlbmR1bHVtTm9kZS5yb3RhdGlvbiA9IC1hbmdsZTtcclxuICAgICAgICBwZW5kdWx1bU5vZGUudHJhbnNsYXRpb24gPSB2aWV3T3JpZ2luUG9zaXRpb247XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSBwZW5kdWx1bSBjb21wb25lbnRzIHBvc2l0aW9uXHJcbiAgICAgIHBlbmR1bHVtLmxlbmd0aFByb3BlcnR5LmxpbmsoIGxlbmd0aCA9PiB7XHJcbiAgICAgICAgY29uc3Qgdmlld1BlbmR1bHVtTGVuZ3RoID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBsZW5ndGggKTtcclxuXHJcbiAgICAgICAgcGVuZHVsdW1SZWN0LnNldFkoIHZpZXdQZW5kdWx1bUxlbmd0aCApO1xyXG4gICAgICAgIHNvbGlkTGluZS5zZXRZMiggdmlld1BlbmR1bHVtTGVuZ3RoICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSByZWN0YW5nbGUgc2l6ZVxyXG4gICAgICBwZW5kdWx1bS5tYXNzUHJvcGVydHkubGluayggbWFzcyA9PiB7XHJcbiAgICAgICAgcGVuZHVsdW1SZWN0LnNldFNjYWxlTWFnbml0dWRlKCBtYXNzVG9TY2FsZSggbWFzcyApICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB2aXNpYmlsaXR5XHJcbiAgICAgIHBlbmR1bHVtLmlzVmlzaWJsZVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHBlbmR1bHVtTm9kZSwgJ3Zpc2libGUnICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IHBlbmR1bHVtTm9kZXMuY29uY2F0KCB2ZWxvY2l0eUFycm93cyApLmNvbmNhdCggYWNjZWxlcmF0aW9uQXJyb3dzICk7XHJcbiAgfVxyXG59XHJcblxyXG5wZW5kdWx1bUxhYi5yZWdpc3RlciggJ1BlbmR1bGFOb2RlJywgUGVuZHVsYU5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBlbmR1bGFOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLGNBQWMsRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLGlCQUFpQixFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3pILE9BQU9D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