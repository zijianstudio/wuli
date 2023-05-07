// Copyright 2015-2022, University of Colorado Boulder

/**
 * Unit Circle View. Has a grabbable radial arm called a rotor.
 *
 * @author Michael Dubson (PhET developer) on 6/2/2015.
 */

import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Circle, Line, Node, Path, Rectangle, SimpleDragHandler, Text } from '../../../../scenery/js/imports.js';
import trigTour from '../../trigTour.js';
import TrigTourStrings from '../../TrigTourStrings.js';
import TrigTourModel from '../model/TrigTourModel.js';
import SpecialAngles from '../SpecialAngles.js';
import TrigTourMathStrings from '../TrigTourMathStrings.js';
import TrigIndicatorArrowNode from './TrigIndicatorArrowNode.js';
import TrigTourColors from './TrigTourColors.js';
import TrigTourSpiralNode from './TrigTourSpiralNode.js';
const xString = TrigTourStrings.x;
const yString = TrigTourStrings.y;

// constants
const DISPLAY_FONT = new PhetFont(20);
const DISPLAY_FONT_LARGE = new PhetFont(22);
const DISPLAY_FONT_SMALL = new PhetFont(18);
const DISPLAY_FONT_ITALIC = new PhetFont({
  size: 20,
  style: 'italic'
});
const LINE_COLOR = TrigTourColors.LINE_COLOR;
const TEXT_COLOR = TrigTourColors.TEXT_COLOR;
const TEXT_COLOR_GRAY = TrigTourColors.TEXT_COLOR_GRAY;
const COS_COLOR = TrigTourColors.COS_COLOR;
const SIN_COLOR = TrigTourColors.SIN_COLOR;
const VIEW_BACKGROUND_COLOR = TrigTourColors.VIEW_BACKGROUND_COLOR;
const ARROW_HEAD_WIDTH = 8;
const MAX_LABEL_WIDTH = ARROW_HEAD_WIDTH * 3;
class UnitCircleView extends Node {
  /**
   * Constructor for the UnitCircleView.
   *
   * @param {TrigTourModel} trigTourModel - the main model of the sim
   * @param {Rectangle} backgroundRectangle - Bounds for the background rectangle of the unit circle
   * @param {number} backgroundOffset - Offset of the background rectangle behind the unit circle view
   * @param {ViewProperties} viewProperties - collection of properties handling visibility of elements on screen
   */
  constructor(trigTourModel, backgroundRectangle, backgroundOffset, viewProperties) {
    super();

    // Draw Unit Circle
    const radius = 160; //radius of unit circle in view coordinates
    const circleGraphic = new Circle(radius, {
      stroke: LINE_COLOR,
      lineWidth: 3
    });

    // Draw 'special angle' positions on unit circle
    // special angles are at 0, 30, 45, 60, 90, 120, 135, 150, 180, -30, ...
    const specialAnglesNode = new Node();
    const angles = SpecialAngles.SPECIAL_ANGLES;

    //x and y coordinates of special angle on unit circle
    let xPos;
    let yPos;
    for (let i = 0; i < angles.length; i++) {
      xPos = radius * Math.cos(Utils.toRadians(angles[i]));
      yPos = radius * Math.sin(Utils.toRadians(angles[i]));
      specialAnglesNode.addChild(new Circle(5, {
        stroke: LINE_COLOR,
        fill: 'white',
        lineWidth: 1,
        x: xPos,
        y: yPos
      }));
    }

    // draw background, a slightly transparent rectangle placed over the unit circle so that the tangent
    // curves do not occlude this node.
    const backgroundLineWidth = backgroundRectangle.lineWidth;
    const backgroundWidth = backgroundRectangle.width;
    const bHeight = backgroundRectangle.height;
    const arcRadius = backgroundRectangle.cornerRadius;
    this.backgroundRectangle = new Rectangle(-backgroundWidth / 2 + backgroundLineWidth + backgroundOffset / 2, -bHeight / 2 + backgroundLineWidth, backgroundWidth - 3 * backgroundLineWidth, bHeight - 3 * backgroundLineWidth, arcRadius, arcRadius, {
      fill: VIEW_BACKGROUND_COLOR,
      opacity: 0.7
    });

    // Draw x-, y-axes with x and y labels
    const arrowOptions = {
      tailWidth: 0.3,
      headHeight: 12,
      headWidth: ARROW_HEAD_WIDTH
    };
    const yAxis = new ArrowNode(0, 1.18 * radius, 0, -1.2 * radius, arrowOptions);
    const xAxis = new ArrowNode(-1.2 * radius, 0, 1.2 * radius, 0, arrowOptions);

    // Draw and position x-, y-axis labels
    let fontInfo = {
      font: DISPLAY_FONT,
      fill: TEXT_COLOR,
      maxWidth: MAX_LABEL_WIDTH
    };
    const xAxisText = new Text(xString, fontInfo);
    const yAxisText = new Text(yString, fontInfo);
    xAxisText.left = 1.2 * radius + 5;
    xAxisText.centerY = yAxis.centerY;
    yAxisText.right = -12;
    yAxisText.top = -1.2 * radius - 2;

    // Draw Grid, simple square grid, visibility set by Control Panel;
    const gridShape = new Shape();
    gridShape.moveTo(-radius, -radius);
    gridShape.lineTo(radius, -radius).lineTo(radius, radius).lineTo(-radius, radius).lineTo(-radius, -radius);
    gridShape.moveTo(-radius, -radius / 2).lineTo(radius, -radius / 2).moveTo(-radius, radius / 2).lineTo(radius, radius / 2);
    gridShape.moveTo(-radius / 2, -radius).lineTo(-radius / 2, radius).moveTo(radius / 2, -radius).lineTo(radius / 2, radius);
    const grid = new Path(gridShape, {
      lineWidth: 2,
      stroke: TEXT_COLOR_GRAY
    });
    grid.visible = false;

    // draw vertical (sine) line on rotor triangle
    // displayed line is either simple Line (no arrow head) or TrigIndicatorArrowNode (with arrow head)
    const verticalLine = new Line(0, 0, 0, -radius, {
      lineWidth: 4,
      stroke: 'black'
    });
    const verticalIndicatorArrow = new TrigIndicatorArrowNode(radius, 'vertical', {
      tailWidth: 5,
      lineWidth: 1,
      fill: SIN_COLOR,
      stroke: SIN_COLOR
    });

    // draw horizontal (cosine) line on rotor triangle
    const horizontalLine = new Line(0, 0, radius, 0, {
      lineWidth: 4,
      stroke: 'black'
    });
    const horizontalIndicatorArrow = new TrigIndicatorArrowNode(radius, 'horizontal', {
      tailWidth: 5,
      lineWidth: 1,
      fill: COS_COLOR,
      stroke: COS_COLOR
    });

    // Draw rotor arm with draggable red pin at end
    const rotorArm = new Line(0, 0, radius, 0, {
      lineWidth: 4,
      stroke: TrigTourColors.LINE_COLOR
    });
    const rotorPin = new Circle(7, {
      stroke: LINE_COLOR,
      fill: 'red',
      cursor: 'pointer'
    });
    const hitBound = 25;
    rotorPin.mouseArea = rotorPin.bounds.dilated(hitBound);
    rotorPin.touchArea = rotorPin.mouseArea;

    // Draw x, y, and '1' labels on the xyR triangle
    const labelCanvas = new Node();
    fontInfo = {
      font: DISPLAY_FONT_LARGE,
      fill: TEXT_COLOR,
      maxWidth: MAX_LABEL_WIDTH
    };
    const oneText = new Text(TrigTourMathStrings.ONE_STRING, fontInfo);
    const xLabelText = new Text(xString, fontInfo);
    const yLabelText = new Text(yString, fontInfo);
    fontInfo = {
      font: DISPLAY_FONT_ITALIC,
      fill: TEXT_COLOR,
      maxWidth: MAX_LABEL_WIDTH
    };
    const thetaText = new Text(MathSymbols.THETA, fontInfo);
    // +1, -1 labels on axes
    fontInfo = {
      font: DISPLAY_FONT_SMALL,
      fill: TEXT_COLOR_GRAY,
      maxWidth: MAX_LABEL_WIDTH
    };
    const oneXText = new Text(TrigTourMathStrings.ONE_STRING, fontInfo);
    const minusOneXText = new Text(TrigTourMathStrings.MINUS_ONE_STRING, fontInfo);
    const oneYText = new Text(TrigTourMathStrings.ONE_STRING, fontInfo);
    const minusOneYText = new Text(TrigTourMathStrings.MINUS_ONE_STRING, fontInfo);

    // position +1/-1 labels on xy axes
    const xOffset = 5;
    const yOffset = 7;
    oneXText.left = grid.right + xOffset;
    oneXText.top = yOffset;
    minusOneXText.right = grid.left - xOffset;
    minusOneXText.top = yOffset;
    oneYText.bottom = grid.top;
    oneYText.left = xOffset;
    minusOneYText.top = grid.bottom;
    minusOneYText.right = -xOffset;
    labelCanvas.children = [oneText, xLabelText, yLabelText, thetaText, oneXText, minusOneXText, oneYText, minusOneYText];
    rotorPin.addInputListener(new SimpleDragHandler({
      // When dragging across it in a mobile device, pick it up
      allowTouchSnag: true,
      drag: e => {
        const v1 = rotorPin.globalToParentPoint(e.pointer.point);
        const smallAngle = -v1.angle; // model angle is negative of xy screen coordinates angle

        // make sure the full angle does not exceed max allowed angle
        trigTourModel.checkMaxAngleExceeded();
        const setFullAngle = dragAngle => {
          if (!viewProperties.specialAnglesVisibleProperty.value) {
            trigTourModel.setFullAngleWithSmallAngle(smallAngle);
          } else {
            trigTourModel.setSpecialAngleWithSmallAngle(smallAngle);
          }
        };
        if (!trigTourModel.maxAngleExceededProperty.value) {
          setFullAngle(smallAngle);
        } else {
          // maximum angle exceeded, only update full angle if abs val of small angle is decreasing
          if (Math.abs(smallAngle) < Math.abs(trigTourModel.previousAngle)) {
            // if the difference between angles is too large, rotor was dragged across Math.PI and small angle
            // changed signs. Immediately return because this can allow the user to drag to far.
            if (Math.abs(smallAngle - trigTourModel.previousAngle) > Math.PI / 2) {
              return;
            }
            setFullAngle(smallAngle);
          }
        }
      }
    }));

    // create the spiral nodes
    const initialSpiralRadius = 0.2 * radius;
    const counterClockWiseSpiralNode = new TrigTourSpiralNode(trigTourModel, initialSpiralRadius, TrigTourModel.MAX_ANGLE_LIMIT + Math.PI);
    const clockWiseSpiralNode = new TrigTourSpiralNode(trigTourModel, initialSpiralRadius, -TrigTourModel.MAX_ANGLE_LIMIT - Math.PI);

    // function to update which spiral is visible
    const updateVisibleSpiral = angle => {
      counterClockWiseSpiralNode.visible = angle > 0;
      clockWiseSpiralNode.visible = !counterClockWiseSpiralNode.visible;
    };
    const setLabelVisibility = isVisible => {
      positionLabels();
      labelCanvas.visible = isVisible;
    };

    // position the x, y, '1', and theta labels on the xyR triangle of the unit circle
    const positionLabels = () => {
      const smallAngle = trigTourModel.getSmallAngleInRadians();
      const totalAngle = trigTourModel.getFullAngleInRadians();
      const pi = Math.PI;

      // set visibility of the labels, dependent on angle magnitude to avoid occlusion
      thetaText.visible = !(Math.abs(totalAngle) < Utils.toRadians(40));
      const sAngle = Math.abs(Utils.toDegrees(smallAngle)); //small angle in degrees
      yLabelText.visible = !(sAngle < 10 || 180 - sAngle < 10);
      xLabelText.visible = !(Math.abs(90 - sAngle) < 5);

      // position one-label
      const angleOffset = Utils.toRadians(9);
      let sign = 1; // if sign = +1, one-label is to right of radius, if sign = -1 then to the left
      if (smallAngle > pi / 2 && smallAngle <= pi || smallAngle >= -pi / 2 && smallAngle < 0) {
        sign = -1;
      }
      const xInPix = radius * Math.cos(smallAngle + sign * angleOffset);
      const yInPix = radius * Math.sin(smallAngle + sign * angleOffset);
      oneText.centerX = 0.6 * xInPix;
      oneText.centerY = -0.6 * yInPix;

      // position x-label
      let xPos = 0.5 * radius * Math.cos(totalAngle);
      let yPos = 0.6 * xLabelText.height;
      if (smallAngle < 0) {
        yPos = -0.6 * xLabelText.height;
      }
      xLabelText.centerX = xPos;
      xLabelText.centerY = yPos;

      // position y-label
      sign = 1;
      if (smallAngle > pi / 2 && smallAngle < pi || smallAngle > -pi && smallAngle < -pi / 2) {
        sign = -1;
      }
      xPos = radius * Math.cos(totalAngle) + sign * xLabelText.width;
      yPos = -0.5 * radius * Math.sin(totalAngle);
      yLabelText.centerX = xPos;
      yLabelText.centerY = yPos;

      // show and position theta-label on angle arc if arc is greater than 20 degs
      const thetaPositionRadius = counterClockWiseSpiralNode.endPointRadius;
      xPos = (thetaPositionRadius + 10) * Math.cos(totalAngle / 2);
      yPos = -(thetaPositionRadius + 10) * Math.sin(totalAngle / 2);
      thetaText.centerX = xPos;
      thetaText.centerY = yPos;
    };

    // add the children to parent node
    this.children = [this.backgroundRectangle, grid, circleGraphic, xAxis, yAxis, xAxisText, yAxisText, counterClockWiseSpiralNode, clockWiseSpiralNode, horizontalIndicatorArrow, horizontalLine, verticalIndicatorArrow, verticalLine, specialAnglesNode, rotorArm, rotorPin, labelCanvas];

    // Register for synchronization with model.
    trigTourModel.fullAngleProperty.link(angle => {
      // convenience refactor
      const newX = radius * Math.cos(angle);
      const newY = -radius * Math.sin(angle);

      // transform the rotor, model angle is negative of xy screen coords angle
      rotorPin.resetTransform();
      rotorPin.translate(newX, newY);
      rotorArm.rotation = -angle;

      // transform the vertical and horizontal lines
      verticalLine.x = newX;
      verticalLine.setPoint2(0, newY);
      horizontalLine.setPoint2(newX, 0);
      verticalIndicatorArrow.x = newX;
      verticalIndicatorArrow.setEndPoint(-newY);
      horizontalIndicatorArrow.setEndPoint(newX);

      // update the visible spiral and set position of the labels
      updateVisibleSpiral(angle);
      positionLabels();
    });
    viewProperties.graphProperty.link(graph => {
      horizontalIndicatorArrow.visible = graph === 'cos' || graph === 'tan';
      horizontalLine.visible = graph === 'sin';
      verticalIndicatorArrow.visible = graph === 'sin' || graph === 'tan';
      verticalLine.visible = graph === 'cos';
    });
    viewProperties.labelsVisibleProperty.link(isVisible => {
      setLabelVisibility(isVisible);
    });
    viewProperties.gridVisibleProperty.link(isVisible => {
      grid.visible = isVisible;
    });
    viewProperties.specialAnglesVisibleProperty.link(specialAnglesVisible => {
      specialAnglesNode.visible = specialAnglesVisible;
    });
  }
}
trigTour.register('UnitCircleView', UnitCircleView);
export default UnitCircleView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlNoYXBlIiwiQXJyb3dOb2RlIiwiTWF0aFN5bWJvbHMiLCJQaGV0Rm9udCIsIkNpcmNsZSIsIkxpbmUiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlNpbXBsZURyYWdIYW5kbGVyIiwiVGV4dCIsInRyaWdUb3VyIiwiVHJpZ1RvdXJTdHJpbmdzIiwiVHJpZ1RvdXJNb2RlbCIsIlNwZWNpYWxBbmdsZXMiLCJUcmlnVG91ck1hdGhTdHJpbmdzIiwiVHJpZ0luZGljYXRvckFycm93Tm9kZSIsIlRyaWdUb3VyQ29sb3JzIiwiVHJpZ1RvdXJTcGlyYWxOb2RlIiwieFN0cmluZyIsIngiLCJ5U3RyaW5nIiwieSIsIkRJU1BMQVlfRk9OVCIsIkRJU1BMQVlfRk9OVF9MQVJHRSIsIkRJU1BMQVlfRk9OVF9TTUFMTCIsIkRJU1BMQVlfRk9OVF9JVEFMSUMiLCJzaXplIiwic3R5bGUiLCJMSU5FX0NPTE9SIiwiVEVYVF9DT0xPUiIsIlRFWFRfQ09MT1JfR1JBWSIsIkNPU19DT0xPUiIsIlNJTl9DT0xPUiIsIlZJRVdfQkFDS0dST1VORF9DT0xPUiIsIkFSUk9XX0hFQURfV0lEVEgiLCJNQVhfTEFCRUxfV0lEVEgiLCJVbml0Q2lyY2xlVmlldyIsImNvbnN0cnVjdG9yIiwidHJpZ1RvdXJNb2RlbCIsImJhY2tncm91bmRSZWN0YW5nbGUiLCJiYWNrZ3JvdW5kT2Zmc2V0Iiwidmlld1Byb3BlcnRpZXMiLCJyYWRpdXMiLCJjaXJjbGVHcmFwaGljIiwic3Ryb2tlIiwibGluZVdpZHRoIiwic3BlY2lhbEFuZ2xlc05vZGUiLCJhbmdsZXMiLCJTUEVDSUFMX0FOR0xFUyIsInhQb3MiLCJ5UG9zIiwiaSIsImxlbmd0aCIsIk1hdGgiLCJjb3MiLCJ0b1JhZGlhbnMiLCJzaW4iLCJhZGRDaGlsZCIsImZpbGwiLCJiYWNrZ3JvdW5kTGluZVdpZHRoIiwiYmFja2dyb3VuZFdpZHRoIiwid2lkdGgiLCJiSGVpZ2h0IiwiaGVpZ2h0IiwiYXJjUmFkaXVzIiwiY29ybmVyUmFkaXVzIiwib3BhY2l0eSIsImFycm93T3B0aW9ucyIsInRhaWxXaWR0aCIsImhlYWRIZWlnaHQiLCJoZWFkV2lkdGgiLCJ5QXhpcyIsInhBeGlzIiwiZm9udEluZm8iLCJmb250IiwibWF4V2lkdGgiLCJ4QXhpc1RleHQiLCJ5QXhpc1RleHQiLCJsZWZ0IiwiY2VudGVyWSIsInJpZ2h0IiwidG9wIiwiZ3JpZFNoYXBlIiwibW92ZVRvIiwibGluZVRvIiwiZ3JpZCIsInZpc2libGUiLCJ2ZXJ0aWNhbExpbmUiLCJ2ZXJ0aWNhbEluZGljYXRvckFycm93IiwiaG9yaXpvbnRhbExpbmUiLCJob3Jpem9udGFsSW5kaWNhdG9yQXJyb3ciLCJyb3RvckFybSIsInJvdG9yUGluIiwiY3Vyc29yIiwiaGl0Qm91bmQiLCJtb3VzZUFyZWEiLCJib3VuZHMiLCJkaWxhdGVkIiwidG91Y2hBcmVhIiwibGFiZWxDYW52YXMiLCJvbmVUZXh0IiwiT05FX1NUUklORyIsInhMYWJlbFRleHQiLCJ5TGFiZWxUZXh0IiwidGhldGFUZXh0IiwiVEhFVEEiLCJvbmVYVGV4dCIsIm1pbnVzT25lWFRleHQiLCJNSU5VU19PTkVfU1RSSU5HIiwib25lWVRleHQiLCJtaW51c09uZVlUZXh0IiwieE9mZnNldCIsInlPZmZzZXQiLCJib3R0b20iLCJjaGlsZHJlbiIsImFkZElucHV0TGlzdGVuZXIiLCJhbGxvd1RvdWNoU25hZyIsImRyYWciLCJlIiwidjEiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50Iiwic21hbGxBbmdsZSIsImFuZ2xlIiwiY2hlY2tNYXhBbmdsZUV4Y2VlZGVkIiwic2V0RnVsbEFuZ2xlIiwiZHJhZ0FuZ2xlIiwic3BlY2lhbEFuZ2xlc1Zpc2libGVQcm9wZXJ0eSIsInZhbHVlIiwic2V0RnVsbEFuZ2xlV2l0aFNtYWxsQW5nbGUiLCJzZXRTcGVjaWFsQW5nbGVXaXRoU21hbGxBbmdsZSIsIm1heEFuZ2xlRXhjZWVkZWRQcm9wZXJ0eSIsImFicyIsInByZXZpb3VzQW5nbGUiLCJQSSIsImluaXRpYWxTcGlyYWxSYWRpdXMiLCJjb3VudGVyQ2xvY2tXaXNlU3BpcmFsTm9kZSIsIk1BWF9BTkdMRV9MSU1JVCIsImNsb2NrV2lzZVNwaXJhbE5vZGUiLCJ1cGRhdGVWaXNpYmxlU3BpcmFsIiwic2V0TGFiZWxWaXNpYmlsaXR5IiwiaXNWaXNpYmxlIiwicG9zaXRpb25MYWJlbHMiLCJnZXRTbWFsbEFuZ2xlSW5SYWRpYW5zIiwidG90YWxBbmdsZSIsImdldEZ1bGxBbmdsZUluUmFkaWFucyIsInBpIiwic0FuZ2xlIiwidG9EZWdyZWVzIiwiYW5nbGVPZmZzZXQiLCJzaWduIiwieEluUGl4IiwieUluUGl4IiwiY2VudGVyWCIsInRoZXRhUG9zaXRpb25SYWRpdXMiLCJlbmRQb2ludFJhZGl1cyIsImZ1bGxBbmdsZVByb3BlcnR5IiwibGluayIsIm5ld1giLCJuZXdZIiwicmVzZXRUcmFuc2Zvcm0iLCJ0cmFuc2xhdGUiLCJyb3RhdGlvbiIsInNldFBvaW50MiIsInNldEVuZFBvaW50IiwiZ3JhcGhQcm9wZXJ0eSIsImdyYXBoIiwibGFiZWxzVmlzaWJsZVByb3BlcnR5IiwiZ3JpZFZpc2libGVQcm9wZXJ0eSIsInNwZWNpYWxBbmdsZXNWaXNpYmxlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJVbml0Q2lyY2xlVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBVbml0IENpcmNsZSBWaWV3LiBIYXMgYSBncmFiYmFibGUgcmFkaWFsIGFybSBjYWxsZWQgYSByb3Rvci5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIER1YnNvbiAoUGhFVCBkZXZlbG9wZXIpIG9uIDYvMi8yMDE1LlxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBMaW5lLCBOb2RlLCBQYXRoLCBSZWN0YW5nbGUsIFNpbXBsZURyYWdIYW5kbGVyLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHRyaWdUb3VyIGZyb20gJy4uLy4uL3RyaWdUb3VyLmpzJztcclxuaW1wb3J0IFRyaWdUb3VyU3RyaW5ncyBmcm9tICcuLi8uLi9UcmlnVG91clN0cmluZ3MuanMnO1xyXG5pbXBvcnQgVHJpZ1RvdXJNb2RlbCBmcm9tICcuLi9tb2RlbC9UcmlnVG91ck1vZGVsLmpzJztcclxuaW1wb3J0IFNwZWNpYWxBbmdsZXMgZnJvbSAnLi4vU3BlY2lhbEFuZ2xlcy5qcyc7XHJcbmltcG9ydCBUcmlnVG91ck1hdGhTdHJpbmdzIGZyb20gJy4uL1RyaWdUb3VyTWF0aFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgVHJpZ0luZGljYXRvckFycm93Tm9kZSBmcm9tICcuL1RyaWdJbmRpY2F0b3JBcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgVHJpZ1RvdXJDb2xvcnMgZnJvbSAnLi9UcmlnVG91ckNvbG9ycy5qcyc7XHJcbmltcG9ydCBUcmlnVG91clNwaXJhbE5vZGUgZnJvbSAnLi9UcmlnVG91clNwaXJhbE5vZGUuanMnO1xyXG5cclxuY29uc3QgeFN0cmluZyA9IFRyaWdUb3VyU3RyaW5ncy54O1xyXG5jb25zdCB5U3RyaW5nID0gVHJpZ1RvdXJTdHJpbmdzLnk7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRElTUExBWV9GT05UID0gbmV3IFBoZXRGb250KCAyMCApO1xyXG5jb25zdCBESVNQTEFZX0ZPTlRfTEFSR0UgPSBuZXcgUGhldEZvbnQoIDIyICk7XHJcbmNvbnN0IERJU1BMQVlfRk9OVF9TTUFMTCA9IG5ldyBQaGV0Rm9udCggMTggKTtcclxuY29uc3QgRElTUExBWV9GT05UX0lUQUxJQyA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyMCwgc3R5bGU6ICdpdGFsaWMnIH0gKTtcclxuY29uc3QgTElORV9DT0xPUiA9IFRyaWdUb3VyQ29sb3JzLkxJTkVfQ09MT1I7XHJcbmNvbnN0IFRFWFRfQ09MT1IgPSBUcmlnVG91ckNvbG9ycy5URVhUX0NPTE9SO1xyXG5jb25zdCBURVhUX0NPTE9SX0dSQVkgPSBUcmlnVG91ckNvbG9ycy5URVhUX0NPTE9SX0dSQVk7XHJcbmNvbnN0IENPU19DT0xPUiA9IFRyaWdUb3VyQ29sb3JzLkNPU19DT0xPUjtcclxuY29uc3QgU0lOX0NPTE9SID0gVHJpZ1RvdXJDb2xvcnMuU0lOX0NPTE9SO1xyXG5jb25zdCBWSUVXX0JBQ0tHUk9VTkRfQ09MT1IgPSBUcmlnVG91ckNvbG9ycy5WSUVXX0JBQ0tHUk9VTkRfQ09MT1I7XHJcbmNvbnN0IEFSUk9XX0hFQURfV0lEVEggPSA4O1xyXG5jb25zdCBNQVhfTEFCRUxfV0lEVEggPSBBUlJPV19IRUFEX1dJRFRIICogMztcclxuXHJcbmNsYXNzIFVuaXRDaXJjbGVWaWV3IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciB0aGUgVW5pdENpcmNsZVZpZXcuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyaWdUb3VyTW9kZWx9IHRyaWdUb3VyTW9kZWwgLSB0aGUgbWFpbiBtb2RlbCBvZiB0aGUgc2ltXHJcbiAgICogQHBhcmFtIHtSZWN0YW5nbGV9IGJhY2tncm91bmRSZWN0YW5nbGUgLSBCb3VuZHMgZm9yIHRoZSBiYWNrZ3JvdW5kIHJlY3RhbmdsZSBvZiB0aGUgdW5pdCBjaXJjbGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYmFja2dyb3VuZE9mZnNldCAtIE9mZnNldCBvZiB0aGUgYmFja2dyb3VuZCByZWN0YW5nbGUgYmVoaW5kIHRoZSB1bml0IGNpcmNsZSB2aWV3XHJcbiAgICogQHBhcmFtIHtWaWV3UHJvcGVydGllc30gdmlld1Byb3BlcnRpZXMgLSBjb2xsZWN0aW9uIG9mIHByb3BlcnRpZXMgaGFuZGxpbmcgdmlzaWJpbGl0eSBvZiBlbGVtZW50cyBvbiBzY3JlZW5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdHJpZ1RvdXJNb2RlbCwgYmFja2dyb3VuZFJlY3RhbmdsZSwgYmFja2dyb3VuZE9mZnNldCwgdmlld1Byb3BlcnRpZXMgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIERyYXcgVW5pdCBDaXJjbGVcclxuICAgIGNvbnN0IHJhZGl1cyA9IDE2MDsgLy9yYWRpdXMgb2YgdW5pdCBjaXJjbGUgaW4gdmlldyBjb29yZGluYXRlc1xyXG4gICAgY29uc3QgY2lyY2xlR3JhcGhpYyA9IG5ldyBDaXJjbGUoIHJhZGl1cywgeyBzdHJva2U6IExJTkVfQ09MT1IsIGxpbmVXaWR0aDogMyB9ICk7XHJcblxyXG4gICAgLy8gRHJhdyAnc3BlY2lhbCBhbmdsZScgcG9zaXRpb25zIG9uIHVuaXQgY2lyY2xlXHJcbiAgICAvLyBzcGVjaWFsIGFuZ2xlcyBhcmUgYXQgMCwgMzAsIDQ1LCA2MCwgOTAsIDEyMCwgMTM1LCAxNTAsIDE4MCwgLTMwLCAuLi5cclxuICAgIGNvbnN0IHNwZWNpYWxBbmdsZXNOb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIGNvbnN0IGFuZ2xlcyA9IFNwZWNpYWxBbmdsZXMuU1BFQ0lBTF9BTkdMRVM7XHJcblxyXG4gICAgLy94IGFuZCB5IGNvb3JkaW5hdGVzIG9mIHNwZWNpYWwgYW5nbGUgb24gdW5pdCBjaXJjbGVcclxuICAgIGxldCB4UG9zO1xyXG4gICAgbGV0IHlQb3M7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhbmdsZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHhQb3MgPSByYWRpdXMgKiBNYXRoLmNvcyggVXRpbHMudG9SYWRpYW5zKCBhbmdsZXNbIGkgXSApICk7XHJcbiAgICAgIHlQb3MgPSByYWRpdXMgKiBNYXRoLnNpbiggVXRpbHMudG9SYWRpYW5zKCBhbmdsZXNbIGkgXSApICk7XHJcbiAgICAgIHNwZWNpYWxBbmdsZXNOb2RlLmFkZENoaWxkKCBuZXcgQ2lyY2xlKFxyXG4gICAgICAgIDUsXHJcbiAgICAgICAgeyBzdHJva2U6IExJTkVfQ09MT1IsIGZpbGw6ICd3aGl0ZScsIGxpbmVXaWR0aDogMSwgeDogeFBvcywgeTogeVBvcyB9XHJcbiAgICAgICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkcmF3IGJhY2tncm91bmQsIGEgc2xpZ2h0bHkgdHJhbnNwYXJlbnQgcmVjdGFuZ2xlIHBsYWNlZCBvdmVyIHRoZSB1bml0IGNpcmNsZSBzbyB0aGF0IHRoZSB0YW5nZW50XHJcbiAgICAvLyBjdXJ2ZXMgZG8gbm90IG9jY2x1ZGUgdGhpcyBub2RlLlxyXG4gICAgY29uc3QgYmFja2dyb3VuZExpbmVXaWR0aCA9IGJhY2tncm91bmRSZWN0YW5nbGUubGluZVdpZHRoO1xyXG4gICAgY29uc3QgYmFja2dyb3VuZFdpZHRoID0gYmFja2dyb3VuZFJlY3RhbmdsZS53aWR0aDtcclxuICAgIGNvbnN0IGJIZWlnaHQgPSBiYWNrZ3JvdW5kUmVjdGFuZ2xlLmhlaWdodDtcclxuICAgIGNvbnN0IGFyY1JhZGl1cyA9IGJhY2tncm91bmRSZWN0YW5nbGUuY29ybmVyUmFkaXVzO1xyXG4gICAgdGhpcy5iYWNrZ3JvdW5kUmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZShcclxuICAgICAgLWJhY2tncm91bmRXaWR0aCAvIDIgKyBiYWNrZ3JvdW5kTGluZVdpZHRoICsgYmFja2dyb3VuZE9mZnNldCAvIDIsXHJcbiAgICAgIC1iSGVpZ2h0IC8gMiArIGJhY2tncm91bmRMaW5lV2lkdGgsXHJcbiAgICAgIGJhY2tncm91bmRXaWR0aCAtIDMgKiBiYWNrZ3JvdW5kTGluZVdpZHRoLFxyXG4gICAgICBiSGVpZ2h0IC0gMyAqIGJhY2tncm91bmRMaW5lV2lkdGgsXHJcbiAgICAgIGFyY1JhZGl1cyxcclxuICAgICAgYXJjUmFkaXVzLFxyXG4gICAgICB7IGZpbGw6IFZJRVdfQkFDS0dST1VORF9DT0xPUiwgb3BhY2l0eTogMC43IH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gRHJhdyB4LSwgeS1heGVzIHdpdGggeCBhbmQgeSBsYWJlbHNcclxuICAgIGNvbnN0IGFycm93T3B0aW9ucyA9IHsgdGFpbFdpZHRoOiAwLjMsIGhlYWRIZWlnaHQ6IDEyLCBoZWFkV2lkdGg6IEFSUk9XX0hFQURfV0lEVEggfTtcclxuICAgIGNvbnN0IHlBeGlzID0gbmV3IEFycm93Tm9kZSggMCwgMS4xOCAqIHJhZGl1cywgMCwgLTEuMiAqIHJhZGl1cywgYXJyb3dPcHRpb25zICk7XHJcbiAgICBjb25zdCB4QXhpcyA9IG5ldyBBcnJvd05vZGUoIC0xLjIgKiByYWRpdXMsIDAsIDEuMiAqIHJhZGl1cywgMCwgYXJyb3dPcHRpb25zICk7XHJcblxyXG4gICAgLy8gRHJhdyBhbmQgcG9zaXRpb24geC0sIHktYXhpcyBsYWJlbHNcclxuICAgIGxldCBmb250SW5mbyA9IHsgZm9udDogRElTUExBWV9GT05ULCBmaWxsOiBURVhUX0NPTE9SLCBtYXhXaWR0aDogTUFYX0xBQkVMX1dJRFRIIH07XHJcbiAgICBjb25zdCB4QXhpc1RleHQgPSBuZXcgVGV4dCggeFN0cmluZywgZm9udEluZm8gKTtcclxuICAgIGNvbnN0IHlBeGlzVGV4dCA9IG5ldyBUZXh0KCB5U3RyaW5nLCBmb250SW5mbyApO1xyXG4gICAgeEF4aXNUZXh0LmxlZnQgPSAxLjIgKiByYWRpdXMgKyA1O1xyXG4gICAgeEF4aXNUZXh0LmNlbnRlclkgPSB5QXhpcy5jZW50ZXJZO1xyXG4gICAgeUF4aXNUZXh0LnJpZ2h0ID0gLTEyO1xyXG4gICAgeUF4aXNUZXh0LnRvcCA9IC0xLjIgKiByYWRpdXMgLSAyO1xyXG5cclxuICAgIC8vIERyYXcgR3JpZCwgc2ltcGxlIHNxdWFyZSBncmlkLCB2aXNpYmlsaXR5IHNldCBieSBDb250cm9sIFBhbmVsO1xyXG4gICAgY29uc3QgZ3JpZFNoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICBncmlkU2hhcGUubW92ZVRvKCAtcmFkaXVzLCAtcmFkaXVzICk7XHJcbiAgICBncmlkU2hhcGUubGluZVRvKCByYWRpdXMsIC1yYWRpdXMgKS5saW5lVG8oIHJhZGl1cywgcmFkaXVzICkubGluZVRvKCAtcmFkaXVzLCByYWRpdXMgKS5saW5lVG8oIC1yYWRpdXMsIC1yYWRpdXMgKTtcclxuICAgIGdyaWRTaGFwZS5tb3ZlVG8oIC1yYWRpdXMsIC1yYWRpdXMgLyAyICkubGluZVRvKCByYWRpdXMsIC1yYWRpdXMgLyAyICkubW92ZVRvKCAtcmFkaXVzLCByYWRpdXMgLyAyICkubGluZVRvKCByYWRpdXMsIHJhZGl1cyAvIDIgKTtcclxuICAgIGdyaWRTaGFwZS5tb3ZlVG8oIC1yYWRpdXMgLyAyLCAtcmFkaXVzICkubGluZVRvKCAtcmFkaXVzIC8gMiwgcmFkaXVzICkubW92ZVRvKCByYWRpdXMgLyAyLCAtcmFkaXVzICkubGluZVRvKCByYWRpdXMgLyAyLCByYWRpdXMgKTtcclxuICAgIGNvbnN0IGdyaWQgPSBuZXcgUGF0aCggZ3JpZFNoYXBlLCB7IGxpbmVXaWR0aDogMiwgc3Ryb2tlOiBURVhUX0NPTE9SX0dSQVkgfSApO1xyXG4gICAgZ3JpZC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgLy8gZHJhdyB2ZXJ0aWNhbCAoc2luZSkgbGluZSBvbiByb3RvciB0cmlhbmdsZVxyXG4gICAgLy8gZGlzcGxheWVkIGxpbmUgaXMgZWl0aGVyIHNpbXBsZSBMaW5lIChubyBhcnJvdyBoZWFkKSBvciBUcmlnSW5kaWNhdG9yQXJyb3dOb2RlICh3aXRoIGFycm93IGhlYWQpXHJcbiAgICBjb25zdCB2ZXJ0aWNhbExpbmUgPSBuZXcgTGluZSggMCwgMCwgMCwgLXJhZGl1cywgeyBsaW5lV2lkdGg6IDQsIHN0cm9rZTogJ2JsYWNrJyB9ICk7XHJcbiAgICBjb25zdCB2ZXJ0aWNhbEluZGljYXRvckFycm93ID0gbmV3IFRyaWdJbmRpY2F0b3JBcnJvd05vZGUoIHJhZGl1cywgJ3ZlcnRpY2FsJywge1xyXG4gICAgICB0YWlsV2lkdGg6IDUsXHJcbiAgICAgIGxpbmVXaWR0aDogMSxcclxuICAgICAgZmlsbDogU0lOX0NPTE9SLFxyXG4gICAgICBzdHJva2U6IFNJTl9DT0xPUlxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGRyYXcgaG9yaXpvbnRhbCAoY29zaW5lKSBsaW5lIG9uIHJvdG9yIHRyaWFuZ2xlXHJcbiAgICBjb25zdCBob3Jpem9udGFsTGluZSA9IG5ldyBMaW5lKCAwLCAwLCByYWRpdXMsIDAsIHsgbGluZVdpZHRoOiA0LCBzdHJva2U6ICdibGFjaycgfSApO1xyXG4gICAgY29uc3QgaG9yaXpvbnRhbEluZGljYXRvckFycm93ID0gbmV3IFRyaWdJbmRpY2F0b3JBcnJvd05vZGUoIHJhZGl1cywgJ2hvcml6b250YWwnLCB7XHJcbiAgICAgIHRhaWxXaWR0aDogNSxcclxuICAgICAgbGluZVdpZHRoOiAxLFxyXG4gICAgICBmaWxsOiBDT1NfQ09MT1IsXHJcbiAgICAgIHN0cm9rZTogQ09TX0NPTE9SXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRHJhdyByb3RvciBhcm0gd2l0aCBkcmFnZ2FibGUgcmVkIHBpbiBhdCBlbmRcclxuICAgIGNvbnN0IHJvdG9yQXJtID0gbmV3IExpbmUoIDAsIDAsIHJhZGl1cywgMCwgeyBsaW5lV2lkdGg6IDQsIHN0cm9rZTogVHJpZ1RvdXJDb2xvcnMuTElORV9DT0xPUiB9ICk7XHJcbiAgICBjb25zdCByb3RvclBpbiA9IG5ldyBDaXJjbGUoIDcsIHsgc3Ryb2tlOiBMSU5FX0NPTE9SLCBmaWxsOiAncmVkJywgY3Vyc29yOiAncG9pbnRlcicgfSApO1xyXG4gICAgY29uc3QgaGl0Qm91bmQgPSAyNTtcclxuICAgIHJvdG9yUGluLm1vdXNlQXJlYSA9IHJvdG9yUGluLmJvdW5kcy5kaWxhdGVkKCBoaXRCb3VuZCApO1xyXG4gICAgcm90b3JQaW4udG91Y2hBcmVhID0gcm90b3JQaW4ubW91c2VBcmVhO1xyXG5cclxuICAgIC8vIERyYXcgeCwgeSwgYW5kICcxJyBsYWJlbHMgb24gdGhlIHh5UiB0cmlhbmdsZVxyXG4gICAgY29uc3QgbGFiZWxDYW52YXMgPSBuZXcgTm9kZSgpO1xyXG4gICAgZm9udEluZm8gPSB7IGZvbnQ6IERJU1BMQVlfRk9OVF9MQVJHRSwgZmlsbDogVEVYVF9DT0xPUiwgbWF4V2lkdGg6IE1BWF9MQUJFTF9XSURUSCB9O1xyXG4gICAgY29uc3Qgb25lVGV4dCA9IG5ldyBUZXh0KCBUcmlnVG91ck1hdGhTdHJpbmdzLk9ORV9TVFJJTkcsIGZvbnRJbmZvICk7XHJcbiAgICBjb25zdCB4TGFiZWxUZXh0ID0gbmV3IFRleHQoIHhTdHJpbmcsIGZvbnRJbmZvICk7XHJcbiAgICBjb25zdCB5TGFiZWxUZXh0ID0gbmV3IFRleHQoIHlTdHJpbmcsIGZvbnRJbmZvICk7XHJcbiAgICBmb250SW5mbyA9IHsgZm9udDogRElTUExBWV9GT05UX0lUQUxJQywgZmlsbDogVEVYVF9DT0xPUiwgbWF4V2lkdGg6IE1BWF9MQUJFTF9XSURUSCB9O1xyXG4gICAgY29uc3QgdGhldGFUZXh0ID0gbmV3IFRleHQoIE1hdGhTeW1ib2xzLlRIRVRBLCBmb250SW5mbyApO1xyXG4gICAgLy8gKzEsIC0xIGxhYmVscyBvbiBheGVzXHJcbiAgICBmb250SW5mbyA9IHsgZm9udDogRElTUExBWV9GT05UX1NNQUxMLCBmaWxsOiBURVhUX0NPTE9SX0dSQVksIG1heFdpZHRoOiBNQVhfTEFCRUxfV0lEVEggfTtcclxuICAgIGNvbnN0IG9uZVhUZXh0ID0gbmV3IFRleHQoIFRyaWdUb3VyTWF0aFN0cmluZ3MuT05FX1NUUklORywgZm9udEluZm8gKTtcclxuICAgIGNvbnN0IG1pbnVzT25lWFRleHQgPSBuZXcgVGV4dCggVHJpZ1RvdXJNYXRoU3RyaW5ncy5NSU5VU19PTkVfU1RSSU5HLCBmb250SW5mbyApO1xyXG4gICAgY29uc3Qgb25lWVRleHQgPSBuZXcgVGV4dCggVHJpZ1RvdXJNYXRoU3RyaW5ncy5PTkVfU1RSSU5HLCBmb250SW5mbyApO1xyXG4gICAgY29uc3QgbWludXNPbmVZVGV4dCA9IG5ldyBUZXh0KCBUcmlnVG91ck1hdGhTdHJpbmdzLk1JTlVTX09ORV9TVFJJTkcsIGZvbnRJbmZvICk7XHJcblxyXG4gICAgLy8gcG9zaXRpb24gKzEvLTEgbGFiZWxzIG9uIHh5IGF4ZXNcclxuICAgIGNvbnN0IHhPZmZzZXQgPSA1O1xyXG4gICAgY29uc3QgeU9mZnNldCA9IDc7XHJcbiAgICBvbmVYVGV4dC5sZWZ0ID0gZ3JpZC5yaWdodCArIHhPZmZzZXQ7XHJcbiAgICBvbmVYVGV4dC50b3AgPSB5T2Zmc2V0O1xyXG4gICAgbWludXNPbmVYVGV4dC5yaWdodCA9IGdyaWQubGVmdCAtIHhPZmZzZXQ7XHJcbiAgICBtaW51c09uZVhUZXh0LnRvcCA9IHlPZmZzZXQ7XHJcbiAgICBvbmVZVGV4dC5ib3R0b20gPSBncmlkLnRvcDtcclxuICAgIG9uZVlUZXh0LmxlZnQgPSB4T2Zmc2V0O1xyXG4gICAgbWludXNPbmVZVGV4dC50b3AgPSBncmlkLmJvdHRvbTtcclxuICAgIG1pbnVzT25lWVRleHQucmlnaHQgPSAteE9mZnNldDtcclxuXHJcbiAgICBsYWJlbENhbnZhcy5jaGlsZHJlbiA9IFsgb25lVGV4dCwgeExhYmVsVGV4dCwgeUxhYmVsVGV4dCwgdGhldGFUZXh0LCBvbmVYVGV4dCwgbWludXNPbmVYVGV4dCwgb25lWVRleHQsIG1pbnVzT25lWVRleHQgXTtcclxuXHJcbiAgICByb3RvclBpbi5hZGRJbnB1dExpc3RlbmVyKCBuZXcgU2ltcGxlRHJhZ0hhbmRsZXIoXHJcbiAgICAgIHtcclxuICAgICAgICAvLyBXaGVuIGRyYWdnaW5nIGFjcm9zcyBpdCBpbiBhIG1vYmlsZSBkZXZpY2UsIHBpY2sgaXQgdXBcclxuICAgICAgICBhbGxvd1RvdWNoU25hZzogdHJ1ZSxcclxuXHJcbiAgICAgICAgZHJhZzogZSA9PiB7XHJcbiAgICAgICAgICBjb25zdCB2MSA9IHJvdG9yUGluLmdsb2JhbFRvUGFyZW50UG9pbnQoIGUucG9pbnRlci5wb2ludCApO1xyXG4gICAgICAgICAgY29uc3Qgc21hbGxBbmdsZSA9IC12MS5hbmdsZTsgLy8gbW9kZWwgYW5nbGUgaXMgbmVnYXRpdmUgb2YgeHkgc2NyZWVuIGNvb3JkaW5hdGVzIGFuZ2xlXHJcblxyXG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSBmdWxsIGFuZ2xlIGRvZXMgbm90IGV4Y2VlZCBtYXggYWxsb3dlZCBhbmdsZVxyXG4gICAgICAgICAgdHJpZ1RvdXJNb2RlbC5jaGVja01heEFuZ2xlRXhjZWVkZWQoKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBzZXRGdWxsQW5nbGUgPSBkcmFnQW5nbGUgPT4ge1xyXG4gICAgICAgICAgICBpZiAoICF2aWV3UHJvcGVydGllcy5zcGVjaWFsQW5nbGVzVmlzaWJsZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgICAgIHRyaWdUb3VyTW9kZWwuc2V0RnVsbEFuZ2xlV2l0aFNtYWxsQW5nbGUoIHNtYWxsQW5nbGUgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICB0cmlnVG91ck1vZGVsLnNldFNwZWNpYWxBbmdsZVdpdGhTbWFsbEFuZ2xlKCBzbWFsbEFuZ2xlICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgaWYgKCAhdHJpZ1RvdXJNb2RlbC5tYXhBbmdsZUV4Y2VlZGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICAgIHNldEZ1bGxBbmdsZSggc21hbGxBbmdsZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIG1heGltdW0gYW5nbGUgZXhjZWVkZWQsIG9ubHkgdXBkYXRlIGZ1bGwgYW5nbGUgaWYgYWJzIHZhbCBvZiBzbWFsbCBhbmdsZSBpcyBkZWNyZWFzaW5nXHJcbiAgICAgICAgICAgIGlmICggTWF0aC5hYnMoIHNtYWxsQW5nbGUgKSA8IE1hdGguYWJzKCB0cmlnVG91ck1vZGVsLnByZXZpb3VzQW5nbGUgKSApIHtcclxuICAgICAgICAgICAgICAvLyBpZiB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIGFuZ2xlcyBpcyB0b28gbGFyZ2UsIHJvdG9yIHdhcyBkcmFnZ2VkIGFjcm9zcyBNYXRoLlBJIGFuZCBzbWFsbCBhbmdsZVxyXG4gICAgICAgICAgICAgIC8vIGNoYW5nZWQgc2lnbnMuIEltbWVkaWF0ZWx5IHJldHVybiBiZWNhdXNlIHRoaXMgY2FuIGFsbG93IHRoZSB1c2VyIHRvIGRyYWcgdG8gZmFyLlxyXG4gICAgICAgICAgICAgIGlmICggTWF0aC5hYnMoIHNtYWxsQW5nbGUgLSB0cmlnVG91ck1vZGVsLnByZXZpb3VzQW5nbGUgKSA+IE1hdGguUEkgLyAyICkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBzZXRGdWxsQW5nbGUoIHNtYWxsQW5nbGUgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBzcGlyYWwgbm9kZXNcclxuICAgIGNvbnN0IGluaXRpYWxTcGlyYWxSYWRpdXMgPSAwLjIgKiByYWRpdXM7XHJcbiAgICBjb25zdCBjb3VudGVyQ2xvY2tXaXNlU3BpcmFsTm9kZSA9IG5ldyBUcmlnVG91clNwaXJhbE5vZGUoIHRyaWdUb3VyTW9kZWwsIGluaXRpYWxTcGlyYWxSYWRpdXMsIFRyaWdUb3VyTW9kZWwuTUFYX0FOR0xFX0xJTUlUICsgTWF0aC5QSSApO1xyXG4gICAgY29uc3QgY2xvY2tXaXNlU3BpcmFsTm9kZSA9IG5ldyBUcmlnVG91clNwaXJhbE5vZGUoIHRyaWdUb3VyTW9kZWwsIGluaXRpYWxTcGlyYWxSYWRpdXMsIC1UcmlnVG91ck1vZGVsLk1BWF9BTkdMRV9MSU1JVCAtIE1hdGguUEkgKTtcclxuXHJcbiAgICAvLyBmdW5jdGlvbiB0byB1cGRhdGUgd2hpY2ggc3BpcmFsIGlzIHZpc2libGVcclxuICAgIGNvbnN0IHVwZGF0ZVZpc2libGVTcGlyYWwgPSBhbmdsZSA9PiB7XHJcbiAgICAgIGNvdW50ZXJDbG9ja1dpc2VTcGlyYWxOb2RlLnZpc2libGUgPSBhbmdsZSA+IDA7XHJcbiAgICAgIGNsb2NrV2lzZVNwaXJhbE5vZGUudmlzaWJsZSA9ICFjb3VudGVyQ2xvY2tXaXNlU3BpcmFsTm9kZS52aXNpYmxlO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBzZXRMYWJlbFZpc2liaWxpdHkgPSBpc1Zpc2libGUgPT4ge1xyXG4gICAgICBwb3NpdGlvbkxhYmVscygpO1xyXG4gICAgICBsYWJlbENhbnZhcy52aXNpYmxlID0gaXNWaXNpYmxlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBwb3NpdGlvbiB0aGUgeCwgeSwgJzEnLCBhbmQgdGhldGEgbGFiZWxzIG9uIHRoZSB4eVIgdHJpYW5nbGUgb2YgdGhlIHVuaXQgY2lyY2xlXHJcbiAgICBjb25zdCBwb3NpdGlvbkxhYmVscyA9ICgpID0+IHtcclxuICAgICAgY29uc3Qgc21hbGxBbmdsZSA9IHRyaWdUb3VyTW9kZWwuZ2V0U21hbGxBbmdsZUluUmFkaWFucygpO1xyXG4gICAgICBjb25zdCB0b3RhbEFuZ2xlID0gdHJpZ1RvdXJNb2RlbC5nZXRGdWxsQW5nbGVJblJhZGlhbnMoKTtcclxuICAgICAgY29uc3QgcGkgPSBNYXRoLlBJO1xyXG5cclxuICAgICAgLy8gc2V0IHZpc2liaWxpdHkgb2YgdGhlIGxhYmVscywgZGVwZW5kZW50IG9uIGFuZ2xlIG1hZ25pdHVkZSB0byBhdm9pZCBvY2NsdXNpb25cclxuICAgICAgdGhldGFUZXh0LnZpc2libGUgPSAhKCBNYXRoLmFicyggdG90YWxBbmdsZSApIDwgVXRpbHMudG9SYWRpYW5zKCA0MCApICk7XHJcbiAgICAgIGNvbnN0IHNBbmdsZSA9IE1hdGguYWJzKCBVdGlscy50b0RlZ3JlZXMoIHNtYWxsQW5nbGUgKSApOyAgLy9zbWFsbCBhbmdsZSBpbiBkZWdyZWVzXHJcbiAgICAgIHlMYWJlbFRleHQudmlzaWJsZSA9ICEoIHNBbmdsZSA8IDEwIHx8ICggMTgwIC0gc0FuZ2xlICkgPCAxMCApO1xyXG4gICAgICB4TGFiZWxUZXh0LnZpc2libGUgPSAhKCBNYXRoLmFicyggOTAgLSBzQW5nbGUgKSA8IDUgKTtcclxuXHJcbiAgICAgIC8vIHBvc2l0aW9uIG9uZS1sYWJlbFxyXG4gICAgICBjb25zdCBhbmdsZU9mZnNldCA9IFV0aWxzLnRvUmFkaWFucyggOSApO1xyXG4gICAgICBsZXQgc2lnbiA9IDE7IC8vIGlmIHNpZ24gPSArMSwgb25lLWxhYmVsIGlzIHRvIHJpZ2h0IG9mIHJhZGl1cywgaWYgc2lnbiA9IC0xIHRoZW4gdG8gdGhlIGxlZnRcclxuICAgICAgaWYgKCAoIHNtYWxsQW5nbGUgPiBwaSAvIDIgJiYgc21hbGxBbmdsZSA8PSBwaSApIHx8ICggc21hbGxBbmdsZSA+PSAtcGkgLyAyICYmIHNtYWxsQW5nbGUgPCAwICkgKSB7XHJcbiAgICAgICAgc2lnbiA9IC0xO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHhJblBpeCA9IHJhZGl1cyAqIE1hdGguY29zKCBzbWFsbEFuZ2xlICsgc2lnbiAqIGFuZ2xlT2Zmc2V0ICk7XHJcbiAgICAgIGNvbnN0IHlJblBpeCA9IHJhZGl1cyAqIE1hdGguc2luKCBzbWFsbEFuZ2xlICsgc2lnbiAqIGFuZ2xlT2Zmc2V0ICk7XHJcbiAgICAgIG9uZVRleHQuY2VudGVyWCA9IDAuNiAqIHhJblBpeDtcclxuICAgICAgb25lVGV4dC5jZW50ZXJZID0gLTAuNiAqIHlJblBpeDtcclxuXHJcbiAgICAgIC8vIHBvc2l0aW9uIHgtbGFiZWxcclxuICAgICAgbGV0IHhQb3MgPSAwLjUgKiByYWRpdXMgKiBNYXRoLmNvcyggdG90YWxBbmdsZSApO1xyXG4gICAgICBsZXQgeVBvcyA9IDAuNiAqIHhMYWJlbFRleHQuaGVpZ2h0O1xyXG4gICAgICBpZiAoIHNtYWxsQW5nbGUgPCAwICkgeyB5UG9zID0gLTAuNiAqIHhMYWJlbFRleHQuaGVpZ2h0OyB9XHJcbiAgICAgIHhMYWJlbFRleHQuY2VudGVyWCA9IHhQb3M7XHJcbiAgICAgIHhMYWJlbFRleHQuY2VudGVyWSA9IHlQb3M7XHJcblxyXG4gICAgICAvLyBwb3NpdGlvbiB5LWxhYmVsXHJcbiAgICAgIHNpZ24gPSAxO1xyXG4gICAgICBpZiAoICggc21hbGxBbmdsZSA+IHBpIC8gMiAmJiBzbWFsbEFuZ2xlIDwgcGkgKSB8fCAoIHNtYWxsQW5nbGUgPiAtcGkgJiYgc21hbGxBbmdsZSA8IC1waSAvIDIgKSApIHtcclxuICAgICAgICBzaWduID0gLTE7XHJcbiAgICAgIH1cclxuICAgICAgeFBvcyA9IHJhZGl1cyAqIE1hdGguY29zKCB0b3RhbEFuZ2xlICkgKyBzaWduICogeExhYmVsVGV4dC53aWR0aDtcclxuICAgICAgeVBvcyA9IC0wLjUgKiByYWRpdXMgKiBNYXRoLnNpbiggdG90YWxBbmdsZSApO1xyXG4gICAgICB5TGFiZWxUZXh0LmNlbnRlclggPSB4UG9zO1xyXG4gICAgICB5TGFiZWxUZXh0LmNlbnRlclkgPSB5UG9zO1xyXG5cclxuICAgICAgLy8gc2hvdyBhbmQgcG9zaXRpb24gdGhldGEtbGFiZWwgb24gYW5nbGUgYXJjIGlmIGFyYyBpcyBncmVhdGVyIHRoYW4gMjAgZGVnc1xyXG4gICAgICBjb25zdCB0aGV0YVBvc2l0aW9uUmFkaXVzID0gY291bnRlckNsb2NrV2lzZVNwaXJhbE5vZGUuZW5kUG9pbnRSYWRpdXM7XHJcbiAgICAgIHhQb3MgPSAoIHRoZXRhUG9zaXRpb25SYWRpdXMgKyAxMCApICogTWF0aC5jb3MoIHRvdGFsQW5nbGUgLyAyICk7XHJcbiAgICAgIHlQb3MgPSAtKCB0aGV0YVBvc2l0aW9uUmFkaXVzICsgMTAgKSAqIE1hdGguc2luKCB0b3RhbEFuZ2xlIC8gMiApO1xyXG4gICAgICB0aGV0YVRleHQuY2VudGVyWCA9IHhQb3M7XHJcbiAgICAgIHRoZXRhVGV4dC5jZW50ZXJZID0geVBvcztcclxuICAgIH07XHJcblxyXG4gICAgLy8gYWRkIHRoZSBjaGlsZHJlbiB0byBwYXJlbnQgbm9kZVxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IFtcclxuICAgICAgdGhpcy5iYWNrZ3JvdW5kUmVjdGFuZ2xlLFxyXG4gICAgICBncmlkLFxyXG4gICAgICBjaXJjbGVHcmFwaGljLFxyXG4gICAgICB4QXhpcyxcclxuICAgICAgeUF4aXMsXHJcbiAgICAgIHhBeGlzVGV4dCxcclxuICAgICAgeUF4aXNUZXh0LFxyXG4gICAgICBjb3VudGVyQ2xvY2tXaXNlU3BpcmFsTm9kZSxcclxuICAgICAgY2xvY2tXaXNlU3BpcmFsTm9kZSxcclxuICAgICAgaG9yaXpvbnRhbEluZGljYXRvckFycm93LFxyXG4gICAgICBob3Jpem9udGFsTGluZSxcclxuICAgICAgdmVydGljYWxJbmRpY2F0b3JBcnJvdyxcclxuICAgICAgdmVydGljYWxMaW5lLFxyXG4gICAgICBzcGVjaWFsQW5nbGVzTm9kZSxcclxuICAgICAgcm90b3JBcm0sXHJcbiAgICAgIHJvdG9yUGluLFxyXG4gICAgICBsYWJlbENhbnZhc1xyXG4gICAgXTtcclxuXHJcbiAgICAvLyBSZWdpc3RlciBmb3Igc3luY2hyb25pemF0aW9uIHdpdGggbW9kZWwuXHJcbiAgICB0cmlnVG91ck1vZGVsLmZ1bGxBbmdsZVByb3BlcnR5LmxpbmsoIGFuZ2xlID0+IHtcclxuXHJcbiAgICAgIC8vIGNvbnZlbmllbmNlIHJlZmFjdG9yXHJcbiAgICAgIGNvbnN0IG5ld1ggPSByYWRpdXMgKiBNYXRoLmNvcyggYW5nbGUgKTtcclxuICAgICAgY29uc3QgbmV3WSA9IC1yYWRpdXMgKiBNYXRoLnNpbiggYW5nbGUgKTtcclxuXHJcbiAgICAgIC8vIHRyYW5zZm9ybSB0aGUgcm90b3IsIG1vZGVsIGFuZ2xlIGlzIG5lZ2F0aXZlIG9mIHh5IHNjcmVlbiBjb29yZHMgYW5nbGVcclxuICAgICAgcm90b3JQaW4ucmVzZXRUcmFuc2Zvcm0oKTtcclxuICAgICAgcm90b3JQaW4udHJhbnNsYXRlKCBuZXdYLCBuZXdZICk7XHJcbiAgICAgIHJvdG9yQXJtLnJvdGF0aW9uID0gLWFuZ2xlO1xyXG5cclxuICAgICAgLy8gdHJhbnNmb3JtIHRoZSB2ZXJ0aWNhbCBhbmQgaG9yaXpvbnRhbCBsaW5lc1xyXG4gICAgICB2ZXJ0aWNhbExpbmUueCA9IG5ld1g7XHJcbiAgICAgIHZlcnRpY2FsTGluZS5zZXRQb2ludDIoIDAsIG5ld1kgKTtcclxuICAgICAgaG9yaXpvbnRhbExpbmUuc2V0UG9pbnQyKCBuZXdYLCAwICk7XHJcbiAgICAgIHZlcnRpY2FsSW5kaWNhdG9yQXJyb3cueCA9IG5ld1g7XHJcbiAgICAgIHZlcnRpY2FsSW5kaWNhdG9yQXJyb3cuc2V0RW5kUG9pbnQoIC1uZXdZICk7XHJcbiAgICAgIGhvcml6b250YWxJbmRpY2F0b3JBcnJvdy5zZXRFbmRQb2ludCggbmV3WCApO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHRoZSB2aXNpYmxlIHNwaXJhbCBhbmQgc2V0IHBvc2l0aW9uIG9mIHRoZSBsYWJlbHNcclxuICAgICAgdXBkYXRlVmlzaWJsZVNwaXJhbCggYW5nbGUgKTtcclxuICAgICAgcG9zaXRpb25MYWJlbHMoKTtcclxuXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdmlld1Byb3BlcnRpZXMuZ3JhcGhQcm9wZXJ0eS5saW5rKCBncmFwaCA9PiB7XHJcbiAgICAgIGhvcml6b250YWxJbmRpY2F0b3JBcnJvdy52aXNpYmxlID0gKCBncmFwaCA9PT0gJ2NvcycgfHwgZ3JhcGggPT09ICd0YW4nICk7XHJcbiAgICAgIGhvcml6b250YWxMaW5lLnZpc2libGUgPSAoIGdyYXBoID09PSAnc2luJyApO1xyXG4gICAgICB2ZXJ0aWNhbEluZGljYXRvckFycm93LnZpc2libGUgPSAoIGdyYXBoID09PSAnc2luJyB8fCBncmFwaCA9PT0gJ3RhbicgKTtcclxuICAgICAgdmVydGljYWxMaW5lLnZpc2libGUgPSAoIGdyYXBoID09PSAnY29zJyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHZpZXdQcm9wZXJ0aWVzLmxhYmVsc1Zpc2libGVQcm9wZXJ0eS5saW5rKCBpc1Zpc2libGUgPT4ge1xyXG4gICAgICBzZXRMYWJlbFZpc2liaWxpdHkoIGlzVmlzaWJsZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHZpZXdQcm9wZXJ0aWVzLmdyaWRWaXNpYmxlUHJvcGVydHkubGluayggaXNWaXNpYmxlID0+IHtcclxuICAgICAgZ3JpZC52aXNpYmxlID0gaXNWaXNpYmxlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHZpZXdQcm9wZXJ0aWVzLnNwZWNpYWxBbmdsZXNWaXNpYmxlUHJvcGVydHkubGluayggc3BlY2lhbEFuZ2xlc1Zpc2libGUgPT4ge1xyXG4gICAgICBzcGVjaWFsQW5nbGVzTm9kZS52aXNpYmxlID0gc3BlY2lhbEFuZ2xlc1Zpc2libGU7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG50cmlnVG91ci5yZWdpc3RlciggJ1VuaXRDaXJjbGVWaWV3JywgVW5pdENpcmNsZVZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgVW5pdENpcmNsZVZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxTQUFTLE1BQU0sMENBQTBDO0FBQ2hFLE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsaUJBQWlCLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDaEgs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