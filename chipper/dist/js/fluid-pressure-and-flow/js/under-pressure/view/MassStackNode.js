// Copyright 2013-2022, University of Colorado Boulder

/**
 * View for mass stack on top of water. Masses don't stack on ground.
 *
 * @author Vasily Shakhov (Mlearner)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
class MassStackNode extends Node {
  /**
   * @param {ChamberPoolModel} chamberPoolModel
   * @param {ModelViewTransform2} modelViewTransform for transforming between model and view co-ordinates
   */
  constructor(chamberPoolModel, modelViewTransform) {
    super({
      x: modelViewTransform.modelToViewX(chamberPoolModel.poolDimensions.leftOpening.x1)
    });
    this.chamberPoolModel = chamberPoolModel;
    this.totalHeight = 0; //height of all masses

    const placementRectWidth = modelViewTransform.modelToViewX(chamberPoolModel.poolDimensions.leftOpening.x2 - chamberPoolModel.poolDimensions.leftOpening.x1);
    const placementRect = new Rectangle(0, 0, placementRectWidth, 0);
    const placementRectBorder = new Path(new Shape(), {
      stroke: '#000',
      lineWidth: 2,
      lineDash: [10, 5],
      fill: '#ffdcf0'
    });
    this.addChild(placementRect);
    this.addChild(placementRectBorder);
    chamberPoolModel.leftDisplacementProperty.link(displacement => {
      this.bottom = modelViewTransform.modelToViewY(chamberPoolModel.poolDimensions.leftOpening.y2 + chamberPoolModel.leftWaterHeight - displacement);
    });

    // If a mass is being dragged by the user, show the dotted line drop region where it can be placed in the chamber pool.
    chamberPoolModel.masses.forEach(massModel => {
      massModel.isDraggingProperty.link(isDragging => {
        if (isDragging) {
          const placementRectHeight = Math.abs(modelViewTransform.modelToViewDeltaY(massModel.height));
          const placementRectY1 = -placementRectHeight + modelViewTransform.modelToViewDeltaY(this.totalHeight);
          placementRectBorder.shape = new Shape().moveTo(0, placementRectY1).lineTo(0, placementRectY1 + placementRectHeight).lineTo(placementRectWidth, placementRectY1 + placementRectHeight).lineTo(placementRectWidth, placementRectY1).lineTo(0, placementRectY1);
          placementRectBorder.visible = true;
        } else {
          placementRectBorder.visible = false;
        }
      });
    });
    chamberPoolModel.stack.addItemAddedListener(() => {
      this.updateMassStack();
    });
    chamberPoolModel.stack.addItemRemovedListener(() => {
      this.updateMassStack();
    });
  }

  /**
   * @public
   */
  updateMassPositions() {
    let dy = 0;
    const chamberPoolModel = this.chamberPoolModel;
    chamberPoolModel.stack.forEach(massModel => {
      massModel.positionProperty.value = new Vector2(chamberPoolModel.poolDimensions.leftOpening.x1 + massModel.width / 2, chamberPoolModel.poolDimensions.leftOpening.y2 + chamberPoolModel.leftWaterHeight - chamberPoolModel.leftDisplacementProperty.value + dy + massModel.height / 2);
      dy += massModel.height;
    });
  }

  /**
   * @public
   */
  updateMassStack() {
    let totHeight = 0;
    this.chamberPoolModel.stack.forEach(massModel => {
      if (massModel) {
        totHeight += massModel.height;
      }
    });
    this.totalHeight = totHeight;
    this.updateMassPositions();
  }
}
fluidPressureAndFlow.register('MassStackNode', MassStackNode);
export default MassStackNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2hhcGUiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsImZsdWlkUHJlc3N1cmVBbmRGbG93IiwiTWFzc1N0YWNrTm9kZSIsImNvbnN0cnVjdG9yIiwiY2hhbWJlclBvb2xNb2RlbCIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIngiLCJtb2RlbFRvVmlld1giLCJwb29sRGltZW5zaW9ucyIsImxlZnRPcGVuaW5nIiwieDEiLCJ0b3RhbEhlaWdodCIsInBsYWNlbWVudFJlY3RXaWR0aCIsIngyIiwicGxhY2VtZW50UmVjdCIsInBsYWNlbWVudFJlY3RCb3JkZXIiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJsaW5lRGFzaCIsImZpbGwiLCJhZGRDaGlsZCIsImxlZnREaXNwbGFjZW1lbnRQcm9wZXJ0eSIsImxpbmsiLCJkaXNwbGFjZW1lbnQiLCJib3R0b20iLCJtb2RlbFRvVmlld1kiLCJ5MiIsImxlZnRXYXRlckhlaWdodCIsIm1hc3NlcyIsImZvckVhY2giLCJtYXNzTW9kZWwiLCJpc0RyYWdnaW5nUHJvcGVydHkiLCJpc0RyYWdnaW5nIiwicGxhY2VtZW50UmVjdEhlaWdodCIsIk1hdGgiLCJhYnMiLCJtb2RlbFRvVmlld0RlbHRhWSIsImhlaWdodCIsInBsYWNlbWVudFJlY3RZMSIsInNoYXBlIiwibW92ZVRvIiwibGluZVRvIiwidmlzaWJsZSIsInN0YWNrIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJ1cGRhdGVNYXNzU3RhY2siLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwidXBkYXRlTWFzc1Bvc2l0aW9ucyIsImR5IiwicG9zaXRpb25Qcm9wZXJ0eSIsInZhbHVlIiwid2lkdGgiLCJ0b3RIZWlnaHQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1hc3NTdGFja05vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBmb3IgbWFzcyBzdGFjayBvbiB0b3Agb2Ygd2F0ZXIuIE1hc3NlcyBkb24ndCBzdGFjayBvbiBncm91bmQuXHJcbiAqXHJcbiAqIEBhdXRob3IgVmFzaWx5IFNoYWtob3YgKE1sZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBQYXRoLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZmx1aWRQcmVzc3VyZUFuZEZsb3cgZnJvbSAnLi4vLi4vZmx1aWRQcmVzc3VyZUFuZEZsb3cuanMnO1xyXG5cclxuY2xhc3MgTWFzc1N0YWNrTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0NoYW1iZXJQb29sTW9kZWx9IGNoYW1iZXJQb29sTW9kZWxcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybSBmb3IgdHJhbnNmb3JtaW5nIGJldHdlZW4gbW9kZWwgYW5kIHZpZXcgY28tb3JkaW5hdGVzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNoYW1iZXJQb29sTW9kZWwsIG1vZGVsVmlld1RyYW5zZm9ybSApIHtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICB4OiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBjaGFtYmVyUG9vbE1vZGVsLnBvb2xEaW1lbnNpb25zLmxlZnRPcGVuaW5nLngxIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNoYW1iZXJQb29sTW9kZWwgPSBjaGFtYmVyUG9vbE1vZGVsO1xyXG5cclxuICAgIHRoaXMudG90YWxIZWlnaHQgPSAwOyAvL2hlaWdodCBvZiBhbGwgbWFzc2VzXHJcblxyXG4gICAgY29uc3QgcGxhY2VtZW50UmVjdFdpZHRoID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggY2hhbWJlclBvb2xNb2RlbC5wb29sRGltZW5zaW9ucy5sZWZ0T3BlbmluZy54MiAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFtYmVyUG9vbE1vZGVsLnBvb2xEaW1lbnNpb25zLmxlZnRPcGVuaW5nLngxICk7XHJcblxyXG4gICAgY29uc3QgcGxhY2VtZW50UmVjdCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIHBsYWNlbWVudFJlY3RXaWR0aCwgMCApO1xyXG4gICAgY29uc3QgcGxhY2VtZW50UmVjdEJvcmRlciA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKSxcclxuICAgICAgeyBzdHJva2U6ICcjMDAwJywgbGluZVdpZHRoOiAyLCBsaW5lRGFzaDogWyAxMCwgNSBdLCBmaWxsOiAnI2ZmZGNmMCcgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBsYWNlbWVudFJlY3QgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBsYWNlbWVudFJlY3RCb3JkZXIgKTtcclxuXHJcbiAgICBjaGFtYmVyUG9vbE1vZGVsLmxlZnREaXNwbGFjZW1lbnRQcm9wZXJ0eS5saW5rKCBkaXNwbGFjZW1lbnQgPT4ge1xyXG4gICAgICB0aGlzLmJvdHRvbSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIGNoYW1iZXJQb29sTW9kZWwucG9vbERpbWVuc2lvbnMubGVmdE9wZW5pbmcueTIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW1iZXJQb29sTW9kZWwubGVmdFdhdGVySGVpZ2h0IC0gZGlzcGxhY2VtZW50ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSWYgYSBtYXNzIGlzIGJlaW5nIGRyYWdnZWQgYnkgdGhlIHVzZXIsIHNob3cgdGhlIGRvdHRlZCBsaW5lIGRyb3AgcmVnaW9uIHdoZXJlIGl0IGNhbiBiZSBwbGFjZWQgaW4gdGhlIGNoYW1iZXIgcG9vbC5cclxuICAgIGNoYW1iZXJQb29sTW9kZWwubWFzc2VzLmZvckVhY2goIG1hc3NNb2RlbCA9PiB7XHJcbiAgICAgIG1hc3NNb2RlbC5pc0RyYWdnaW5nUHJvcGVydHkubGluayggaXNEcmFnZ2luZyA9PiB7XHJcbiAgICAgICAgaWYgKCBpc0RyYWdnaW5nICkge1xyXG4gICAgICAgICAgY29uc3QgcGxhY2VtZW50UmVjdEhlaWdodCA9IE1hdGguYWJzKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIG1hc3NNb2RlbC5oZWlnaHQgKSApO1xyXG4gICAgICAgICAgY29uc3QgcGxhY2VtZW50UmVjdFkxID0gLXBsYWNlbWVudFJlY3RIZWlnaHQgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFZKCB0aGlzLnRvdGFsSGVpZ2h0ICk7XHJcblxyXG4gICAgICAgICAgcGxhY2VtZW50UmVjdEJvcmRlci5zaGFwZSA9IG5ldyBTaGFwZSgpLm1vdmVUbyggMCwgcGxhY2VtZW50UmVjdFkxIClcclxuICAgICAgICAgICAgLmxpbmVUbyggMCwgcGxhY2VtZW50UmVjdFkxICsgcGxhY2VtZW50UmVjdEhlaWdodCApXHJcbiAgICAgICAgICAgIC5saW5lVG8oIHBsYWNlbWVudFJlY3RXaWR0aCwgcGxhY2VtZW50UmVjdFkxICsgcGxhY2VtZW50UmVjdEhlaWdodCApXHJcbiAgICAgICAgICAgIC5saW5lVG8oIHBsYWNlbWVudFJlY3RXaWR0aCwgcGxhY2VtZW50UmVjdFkxIClcclxuICAgICAgICAgICAgLmxpbmVUbyggMCwgcGxhY2VtZW50UmVjdFkxICk7XHJcblxyXG4gICAgICAgICAgcGxhY2VtZW50UmVjdEJvcmRlci52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBwbGFjZW1lbnRSZWN0Qm9yZGVyLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjaGFtYmVyUG9vbE1vZGVsLnN0YWNrLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMudXBkYXRlTWFzc1N0YWNrKCk7XHJcbiAgICB9ICk7XHJcbiAgICBjaGFtYmVyUG9vbE1vZGVsLnN0YWNrLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgdGhpcy51cGRhdGVNYXNzU3RhY2soKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB1cGRhdGVNYXNzUG9zaXRpb25zKCkge1xyXG4gICAgbGV0IGR5ID0gMDtcclxuICAgIGNvbnN0IGNoYW1iZXJQb29sTW9kZWwgPSB0aGlzLmNoYW1iZXJQb29sTW9kZWw7XHJcbiAgICBjaGFtYmVyUG9vbE1vZGVsLnN0YWNrLmZvckVhY2goIG1hc3NNb2RlbCA9PiB7XHJcbiAgICAgIG1hc3NNb2RlbC5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIGNoYW1iZXJQb29sTW9kZWwucG9vbERpbWVuc2lvbnMubGVmdE9wZW5pbmcueDEgKyBtYXNzTW9kZWwud2lkdGggLyAyLFxyXG4gICAgICAgIGNoYW1iZXJQb29sTW9kZWwucG9vbERpbWVuc2lvbnMubGVmdE9wZW5pbmcueTIgKyBjaGFtYmVyUG9vbE1vZGVsLmxlZnRXYXRlckhlaWdodCAtXHJcbiAgICAgICAgY2hhbWJlclBvb2xNb2RlbC5sZWZ0RGlzcGxhY2VtZW50UHJvcGVydHkudmFsdWUgKyBkeSArIG1hc3NNb2RlbC5oZWlnaHQgLyAyICk7XHJcbiAgICAgIGR5ICs9IG1hc3NNb2RlbC5oZWlnaHQ7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlTWFzc1N0YWNrKCkge1xyXG4gICAgbGV0IHRvdEhlaWdodCA9IDA7XHJcblxyXG4gICAgdGhpcy5jaGFtYmVyUG9vbE1vZGVsLnN0YWNrLmZvckVhY2goIG1hc3NNb2RlbCA9PiB7XHJcbiAgICAgIGlmICggbWFzc01vZGVsICkge1xyXG4gICAgICAgIHRvdEhlaWdodCArPSBtYXNzTW9kZWwuaGVpZ2h0O1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnRvdGFsSGVpZ2h0ID0gdG90SGVpZ2h0O1xyXG4gICAgdGhpcy51cGRhdGVNYXNzUG9zaXRpb25zKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mbHVpZFByZXNzdXJlQW5kRmxvdy5yZWdpc3RlciggJ01hc3NTdGFja05vZGUnLCBNYXNzU3RhY2tOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IE1hc3NTdGFja05vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsU0FBUyxRQUFRLG1DQUFtQztBQUN6RSxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFFaEUsTUFBTUMsYUFBYSxTQUFTSixJQUFJLENBQUM7RUFFL0I7QUFDRjtBQUNBO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsZ0JBQWdCLEVBQUVDLGtCQUFrQixFQUFHO0lBRWxELEtBQUssQ0FBRTtNQUNMQyxDQUFDLEVBQUVELGtCQUFrQixDQUFDRSxZQUFZLENBQUVILGdCQUFnQixDQUFDSSxjQUFjLENBQUNDLFdBQVcsQ0FBQ0MsRUFBRztJQUNyRixDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNOLGdCQUFnQixHQUFHQSxnQkFBZ0I7SUFFeEMsSUFBSSxDQUFDTyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENB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