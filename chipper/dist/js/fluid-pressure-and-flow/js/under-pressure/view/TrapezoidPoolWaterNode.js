// Copyright 2013-2022, University of Colorado Boulder

/**
 * View for water in trapezoid pool
 *
 * @author Vasily Shakhov (Mlearner)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
class TrapezoidPoolWaterNode extends Node {
  /**
   * @param {TrapezoidPoolModel} trapezoidPoolModel
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
   */
  constructor(trapezoidPoolModel, modelViewTransform) {
    super();
    const waterPath = new Path(null);
    const yMax = Math.abs(modelViewTransform.modelToViewY(trapezoidPoolModel.poolDimensions.leftChamber.y - trapezoidPoolModel.poolDimensions.leftChamber.height)); //bottom y coord of pool, px
    const x1 = modelViewTransform.modelToViewX(trapezoidPoolModel.verticles.x1bottom); //bottom left corner of the pool
    const x4 = modelViewTransform.modelToViewX(trapezoidPoolModel.verticles.x4bottom); //bottom right corner of the pool

    trapezoidPoolModel.underPressureModel.fluidColorModel.colorProperty.linkAttribute(waterPath, 'fill');
    trapezoidPoolModel.volumeProperty.link(() => {
      const viewHeight = trapezoidPoolModel.maxHeight * trapezoidPoolModel.volumeProperty.value / trapezoidPoolModel.maxVolume; //height of water
      const topY = yMax + modelViewTransform.modelToViewDeltaY(viewHeight); //y coord for top of the water
      const h = Math.min(viewHeight, trapezoidPoolModel.poolDimensions.bottomChamber.y1 - trapezoidPoolModel.poolDimensions.bottomChamber.y2); //height in bottom passage

      waterPath.shape = new Shape().moveTo(modelViewTransform.modelToViewX(trapezoidPoolModel.poolDimensions.leftChamber.leftBorderFunction.evaluate(viewHeight)), topY).lineTo(x1, yMax).lineTo(x4, yMax).lineTo(modelViewTransform.modelToViewX(trapezoidPoolModel.poolDimensions.rightChamber.rightBorderFunction.evaluate(viewHeight)), topY).lineTo(modelViewTransform.modelToViewX(trapezoidPoolModel.poolDimensions.rightChamber.leftBorderFunction.evaluate(viewHeight)), topY).lineTo(modelViewTransform.modelToViewX(trapezoidPoolModel.poolDimensions.rightChamber.leftBorderFunction.evaluate(h)), yMax + modelViewTransform.modelToViewDeltaY(h)).lineTo(modelViewTransform.modelToViewX(trapezoidPoolModel.poolDimensions.leftChamber.rightBorderFunction.evaluate(h)), yMax + modelViewTransform.modelToViewDeltaY(h)).lineTo(modelViewTransform.modelToViewX(trapezoidPoolModel.poolDimensions.leftChamber.rightBorderFunction.evaluate(viewHeight)), topY);
    });
    this.addChild(waterPath);
  }
}
fluidPressureAndFlow.register('TrapezoidPoolWaterNode', TrapezoidPoolWaterNode);
export default TrapezoidPoolWaterNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIk5vZGUiLCJQYXRoIiwiZmx1aWRQcmVzc3VyZUFuZEZsb3ciLCJUcmFwZXpvaWRQb29sV2F0ZXJOb2RlIiwiY29uc3RydWN0b3IiLCJ0cmFwZXpvaWRQb29sTW9kZWwiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJ3YXRlclBhdGgiLCJ5TWF4IiwiTWF0aCIsImFicyIsIm1vZGVsVG9WaWV3WSIsInBvb2xEaW1lbnNpb25zIiwibGVmdENoYW1iZXIiLCJ5IiwiaGVpZ2h0IiwieDEiLCJtb2RlbFRvVmlld1giLCJ2ZXJ0aWNsZXMiLCJ4MWJvdHRvbSIsIng0IiwieDRib3R0b20iLCJ1bmRlclByZXNzdXJlTW9kZWwiLCJmbHVpZENvbG9yTW9kZWwiLCJjb2xvclByb3BlcnR5IiwibGlua0F0dHJpYnV0ZSIsInZvbHVtZVByb3BlcnR5IiwibGluayIsInZpZXdIZWlnaHQiLCJtYXhIZWlnaHQiLCJ2YWx1ZSIsIm1heFZvbHVtZSIsInRvcFkiLCJtb2RlbFRvVmlld0RlbHRhWSIsImgiLCJtaW4iLCJib3R0b21DaGFtYmVyIiwieTEiLCJ5MiIsInNoYXBlIiwibW92ZVRvIiwibGVmdEJvcmRlckZ1bmN0aW9uIiwiZXZhbHVhdGUiLCJsaW5lVG8iLCJyaWdodENoYW1iZXIiLCJyaWdodEJvcmRlckZ1bmN0aW9uIiwiYWRkQ2hpbGQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRyYXBlem9pZFBvb2xXYXRlck5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBmb3Igd2F0ZXIgaW4gdHJhcGV6b2lkIHBvb2xcclxuICpcclxuICogQGF1dGhvciBWYXNpbHkgU2hha2hvdiAoTWxlYXJuZXIpXHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZmx1aWRQcmVzc3VyZUFuZEZsb3cgZnJvbSAnLi4vLi4vZmx1aWRQcmVzc3VyZUFuZEZsb3cuanMnO1xyXG5cclxuY2xhc3MgVHJhcGV6b2lkUG9vbFdhdGVyTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VHJhcGV6b2lkUG9vbE1vZGVsfSB0cmFwZXpvaWRQb29sTW9kZWxcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybSB0byBjb252ZXJ0IGJldHdlZW4gbW9kZWwgYW5kIHZpZXcgY28tb3JkaW5hdGVzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRyYXBlem9pZFBvb2xNb2RlbCwgbW9kZWxWaWV3VHJhbnNmb3JtICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3Qgd2F0ZXJQYXRoID0gbmV3IFBhdGgoIG51bGwgKTtcclxuXHJcbiAgICBjb25zdCB5TWF4ID0gTWF0aC5hYnMoIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIHRyYXBlem9pZFBvb2xNb2RlbC5wb29sRGltZW5zaW9ucy5sZWZ0Q2hhbWJlci55IC1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhcGV6b2lkUG9vbE1vZGVsLnBvb2xEaW1lbnNpb25zLmxlZnRDaGFtYmVyLmhlaWdodCApICk7Ly9ib3R0b20geSBjb29yZCBvZiBwb29sLCBweFxyXG4gICAgY29uc3QgeDEgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCB0cmFwZXpvaWRQb29sTW9kZWwudmVydGljbGVzLngxYm90dG9tICk7IC8vYm90dG9tIGxlZnQgY29ybmVyIG9mIHRoZSBwb29sXHJcbiAgICBjb25zdCB4NCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHRyYXBlem9pZFBvb2xNb2RlbC52ZXJ0aWNsZXMueDRib3R0b20gKTsgLy9ib3R0b20gcmlnaHQgY29ybmVyIG9mIHRoZSBwb29sXHJcblxyXG4gICAgdHJhcGV6b2lkUG9vbE1vZGVsLnVuZGVyUHJlc3N1cmVNb2RlbC5mbHVpZENvbG9yTW9kZWwuY29sb3JQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCB3YXRlclBhdGgsICdmaWxsJyApO1xyXG5cclxuICAgIHRyYXBlem9pZFBvb2xNb2RlbC52b2x1bWVQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHZpZXdIZWlnaHQgPSB0cmFwZXpvaWRQb29sTW9kZWwubWF4SGVpZ2h0ICogdHJhcGV6b2lkUG9vbE1vZGVsLnZvbHVtZVByb3BlcnR5LnZhbHVlIC8gdHJhcGV6b2lkUG9vbE1vZGVsLm1heFZvbHVtZTsgLy9oZWlnaHQgb2Ygd2F0ZXJcclxuICAgICAgY29uc3QgdG9wWSA9IHlNYXggKyBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIHZpZXdIZWlnaHQgKTsgLy95IGNvb3JkIGZvciB0b3Agb2YgdGhlIHdhdGVyXHJcbiAgICAgIGNvbnN0IGggPSBNYXRoLm1pbiggdmlld0hlaWdodCwgdHJhcGV6b2lkUG9vbE1vZGVsLnBvb2xEaW1lbnNpb25zLmJvdHRvbUNoYW1iZXIueTEgLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYXBlem9pZFBvb2xNb2RlbC5wb29sRGltZW5zaW9ucy5ib3R0b21DaGFtYmVyLnkyICk7IC8vaGVpZ2h0IGluIGJvdHRvbSBwYXNzYWdlXHJcblxyXG4gICAgICB3YXRlclBhdGguc2hhcGUgPSBuZXcgU2hhcGUoKVxyXG4gICAgICAgIC5tb3ZlVG8oIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHRyYXBlem9pZFBvb2xNb2RlbC5wb29sRGltZW5zaW9ucy5sZWZ0Q2hhbWJlci5sZWZ0Qm9yZGVyRnVuY3Rpb24uZXZhbHVhdGUoIHZpZXdIZWlnaHQgKSApLFxyXG4gICAgICAgICAgdG9wWSApXHJcbiAgICAgICAgLmxpbmVUbyggeDEsIHlNYXggKVxyXG4gICAgICAgIC5saW5lVG8oIHg0LCB5TWF4IClcclxuICAgICAgICAubGluZVRvKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCB0cmFwZXpvaWRQb29sTW9kZWwucG9vbERpbWVuc2lvbnMucmlnaHRDaGFtYmVyLnJpZ2h0Qm9yZGVyRnVuY3Rpb24uZXZhbHVhdGUoIHZpZXdIZWlnaHQgKSApLFxyXG4gICAgICAgICAgdG9wWSApXHJcbiAgICAgICAgLmxpbmVUbyggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggdHJhcGV6b2lkUG9vbE1vZGVsLnBvb2xEaW1lbnNpb25zLnJpZ2h0Q2hhbWJlci5sZWZ0Qm9yZGVyRnVuY3Rpb24uZXZhbHVhdGUoIHZpZXdIZWlnaHQgKSApLFxyXG4gICAgICAgICAgdG9wWSApXHJcbiAgICAgICAgLmxpbmVUbyggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggdHJhcGV6b2lkUG9vbE1vZGVsLnBvb2xEaW1lbnNpb25zLnJpZ2h0Q2hhbWJlci5sZWZ0Qm9yZGVyRnVuY3Rpb24uZXZhbHVhdGUoIGggKSApLFxyXG4gICAgICAgICAgeU1heCArIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWSggaCApIClcclxuICAgICAgICAubGluZVRvKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCB0cmFwZXpvaWRQb29sTW9kZWwucG9vbERpbWVuc2lvbnMubGVmdENoYW1iZXIucmlnaHRCb3JkZXJGdW5jdGlvbi5ldmFsdWF0ZSggaCApICksXHJcbiAgICAgICAgICB5TWF4ICsgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFZKCBoICkgKVxyXG4gICAgICAgIC5saW5lVG8oIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHRyYXBlem9pZFBvb2xNb2RlbC5wb29sRGltZW5zaW9ucy5sZWZ0Q2hhbWJlci5yaWdodEJvcmRlckZ1bmN0aW9uLmV2YWx1YXRlKCB2aWV3SGVpZ2h0ICkgKSxcclxuICAgICAgICAgIHRvcFkgKTtcclxuXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggd2F0ZXJQYXRoICk7XHJcbiAgfVxyXG59XHJcblxyXG5mbHVpZFByZXNzdXJlQW5kRmxvdy5yZWdpc3RlciggJ1RyYXBlem9pZFBvb2xXYXRlck5vZGUnLCBUcmFwZXpvaWRQb29sV2F0ZXJOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFRyYXBlem9pZFBvb2xXYXRlck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDOUQsT0FBT0Msb0JBQW9CLE1BQU0sK0JBQStCO0FBRWhFLE1BQU1DLHNCQUFzQixTQUFTSCxJQUFJLENBQUM7RUFDeEM7QUFDRjtBQUNBO0FBQ0E7RUFDRUksV0FBV0EsQ0FBRUMsa0JBQWtCLEVBQUVDLGtCQUFrQixFQUFHO0lBRXBELEtBQUssQ0FBQyxDQUFDO0lBRVAsTUFBTUMsU0FBUyxHQUFHLElBQUlOLElBQUksQ0FBRSxJQUFLLENBQUM7SUFFbEMsTUFBTU8sSUFBSSxHQUFHQyxJQUFJLENBQUNDLEdBQUcsQ0FBRUosa0JBQWtCLENBQUNLLFlBQVksQ0FBRU4sa0JBQWtCLENBQUNPLGNBQWMsQ0FBQ0MsV0FBVyxDQUFDQyxDQUFDLEdBQy9DVCxrQkFBa0IsQ0FBQ08sY0FBYyxDQUFDQyxXQUFXLENBQUNFLE1BQU8sQ0FBRSxDQUFDLENBQUM7SUFDakgsTUFBTUMsRUFBRSxHQUFHVixrQkFBa0IsQ0FB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