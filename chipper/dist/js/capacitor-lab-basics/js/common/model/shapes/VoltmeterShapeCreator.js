// Copyright 2015-2022, University of Colorado Boulder

/**
 * Creates 2D projections of shapes that are related to the 3D voltmeter model.
 * Shapes are in the global view coordinate frame.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Matrix3 from '../../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import { Shape } from '../../../../../kite/js/imports.js';
import capacitorLabBasics from '../../../capacitorLabBasics.js';

// var PROBE_TIP_OFFSET = new Vector3( 0.00045, 0, 0 );
const PROBE_TIP_OFFSET = new Vector3(0.00018, 0.00025, 0);
class VoltmeterShapeCreator {
  /**
   * @param {Voltmeter} voltmeter
   * @param {YawPitchModelViewTransform3} modelViewTransform
   */
  constructor(voltmeter, modelViewTransform) {
    // @private {Voltmeter}
    this.voltmeter = voltmeter;

    // @private {YawPitchModelViewTransform3}
    this.modelViewTransform = modelViewTransform;
  }

  /**
   * Gets the shape of the positive probe's tip in the world coordinate frame.
   * @public
   *
   * @returns {Shape}
   */
  getPositiveProbeTipShape() {
    const origin = this.voltmeter.positiveProbePositionProperty.value.plus(PROBE_TIP_OFFSET);
    return this.getProbeTipShape(origin, -this.modelViewTransform.yaw);
  }

  /**
   * Gets the shape of the negative probe's tip in the world coordinate frame.
   * @public
   *
   * @returns {Shape}
   */
  getNegativeProbeTipShape() {
    const origin = this.voltmeter.negativeProbePositionProperty.value.plus(PROBE_TIP_OFFSET);
    return this.getProbeTipShape(origin, -this.modelViewTransform.yaw);
  }

  /**
   * Get the shape of a probe tip relative to some specified origin.
   * @public
   *
   * @param {Vector2|Vector3} origin
   * @param {number} theta - rotation of modelViewTransform for 3D perspective
   * @returns {Shape}
   */
  getProbeTipShape(origin, theta) {
    assert && assert(typeof theta === 'number');
    const size = this.voltmeter.probeTipSizeReference;
    const width = size.width;
    const height = size.height;
    const x = origin.x;
    const y = origin.y;
    const t = Matrix3.rotationAround(theta, x, y);
    const midRatio = 0.5;
    return Shape.polygon([this.modelViewTransform.modelToViewPosition(t.timesVector2(new Vector2(x + width / 2, y)).toVector3()), this.modelViewTransform.modelToViewPosition(t.timesVector2(new Vector2(x + width, y + height * midRatio)).toVector3()), this.modelViewTransform.modelToViewPosition(t.timesVector2(new Vector2(x + width, y + height)).toVector3()), this.modelViewTransform.modelToViewPosition(t.timesVector2(new Vector2(x, y + height)).toVector3()), this.modelViewTransform.modelToViewPosition(t.timesVector2(new Vector2(x, y + height * midRatio)).toVector3())]);
  }
}
capacitorLabBasics.register('VoltmeterShapeCreator', VoltmeterShapeCreator);
export default VoltmeterShapeCreator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiVmVjdG9yMiIsIlZlY3RvcjMiLCJTaGFwZSIsImNhcGFjaXRvckxhYkJhc2ljcyIsIlBST0JFX1RJUF9PRkZTRVQiLCJWb2x0bWV0ZXJTaGFwZUNyZWF0b3IiLCJjb25zdHJ1Y3RvciIsInZvbHRtZXRlciIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImdldFBvc2l0aXZlUHJvYmVUaXBTaGFwZSIsIm9yaWdpbiIsInBvc2l0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5IiwidmFsdWUiLCJwbHVzIiwiZ2V0UHJvYmVUaXBTaGFwZSIsInlhdyIsImdldE5lZ2F0aXZlUHJvYmVUaXBTaGFwZSIsIm5lZ2F0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5IiwidGhldGEiLCJhc3NlcnQiLCJzaXplIiwicHJvYmVUaXBTaXplUmVmZXJlbmNlIiwid2lkdGgiLCJoZWlnaHQiLCJ4IiwieSIsInQiLCJyb3RhdGlvbkFyb3VuZCIsIm1pZFJhdGlvIiwicG9seWdvbiIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJ0aW1lc1ZlY3RvcjIiLCJ0b1ZlY3RvcjMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZvbHRtZXRlclNoYXBlQ3JlYXRvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIDJEIHByb2plY3Rpb25zIG9mIHNoYXBlcyB0aGF0IGFyZSByZWxhdGVkIHRvIHRoZSAzRCB2b2x0bWV0ZXIgbW9kZWwuXHJcbiAqIFNoYXBlcyBhcmUgaW4gdGhlIGdsb2JhbCB2aWV3IGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZSAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjMuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBjYXBhY2l0b3JMYWJCYXNpY3MgZnJvbSAnLi4vLi4vLi4vY2FwYWNpdG9yTGFiQmFzaWNzLmpzJztcclxuXHJcbi8vIHZhciBQUk9CRV9USVBfT0ZGU0VUID0gbmV3IFZlY3RvcjMoIDAuMDAwNDUsIDAsIDAgKTtcclxuY29uc3QgUFJPQkVfVElQX09GRlNFVCA9IG5ldyBWZWN0b3IzKCAwLjAwMDE4LCAwLjAwMDI1LCAwICk7XHJcblxyXG5jbGFzcyBWb2x0bWV0ZXJTaGFwZUNyZWF0b3Ige1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Vm9sdG1ldGVyfSB2b2x0bWV0ZXJcclxuICAgKiBAcGFyYW0ge1lhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtM30gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHZvbHRtZXRlciwgbW9kZWxWaWV3VHJhbnNmb3JtICkge1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtWb2x0bWV0ZXJ9XHJcbiAgICB0aGlzLnZvbHRtZXRlciA9IHZvbHRtZXRlcjtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7WWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zfVxyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBtb2RlbFZpZXdUcmFuc2Zvcm07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBzaGFwZSBvZiB0aGUgcG9zaXRpdmUgcHJvYmUncyB0aXAgaW4gdGhlIHdvcmxkIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIGdldFBvc2l0aXZlUHJvYmVUaXBTaGFwZSgpIHtcclxuICAgIGNvbnN0IG9yaWdpbiA9IHRoaXMudm9sdG1ldGVyLnBvc2l0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LnZhbHVlLnBsdXMoIFBST0JFX1RJUF9PRkZTRVQgKTtcclxuICAgIHJldHVybiB0aGlzLmdldFByb2JlVGlwU2hhcGUoIG9yaWdpbiwgLXRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLnlhdyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgc2hhcGUgb2YgdGhlIG5lZ2F0aXZlIHByb2JlJ3MgdGlwIGluIHRoZSB3b3JsZCBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBnZXROZWdhdGl2ZVByb2JlVGlwU2hhcGUoKSB7XHJcbiAgICBjb25zdCBvcmlnaW4gPSB0aGlzLnZvbHRtZXRlci5uZWdhdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBQUk9CRV9USVBfT0ZGU0VUICk7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9iZVRpcFNoYXBlKCBvcmlnaW4sIC10aGlzLm1vZGVsVmlld1RyYW5zZm9ybS55YXcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgc2hhcGUgb2YgYSBwcm9iZSB0aXAgcmVsYXRpdmUgdG8gc29tZSBzcGVjaWZpZWQgb3JpZ2luLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMnxWZWN0b3IzfSBvcmlnaW5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gdGhldGEgLSByb3RhdGlvbiBvZiBtb2RlbFZpZXdUcmFuc2Zvcm0gZm9yIDNEIHBlcnNwZWN0aXZlXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIGdldFByb2JlVGlwU2hhcGUoIG9yaWdpbiwgdGhldGEgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGhldGEgPT09ICdudW1iZXInICk7XHJcblxyXG4gICAgY29uc3Qgc2l6ZSA9IHRoaXMudm9sdG1ldGVyLnByb2JlVGlwU2l6ZVJlZmVyZW5jZTtcclxuICAgIGNvbnN0IHdpZHRoID0gc2l6ZS53aWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IHNpemUuaGVpZ2h0O1xyXG4gICAgY29uc3QgeCA9IG9yaWdpbi54O1xyXG4gICAgY29uc3QgeSA9IG9yaWdpbi55O1xyXG4gICAgY29uc3QgdCA9IE1hdHJpeDMucm90YXRpb25Bcm91bmQoIHRoZXRhLCB4LCB5ICk7XHJcbiAgICBjb25zdCBtaWRSYXRpbyA9IDAuNTtcclxuXHJcbiAgICByZXR1cm4gU2hhcGUucG9seWdvbiggW1xyXG4gICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCB0LnRpbWVzVmVjdG9yMiggbmV3IFZlY3RvcjIoIHggKyB3aWR0aCAvIDIsIHkgKSApLnRvVmVjdG9yMygpICksXHJcbiAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHQudGltZXNWZWN0b3IyKCBuZXcgVmVjdG9yMiggeCArIHdpZHRoLCB5ICsgaGVpZ2h0ICogbWlkUmF0aW8gKSApLnRvVmVjdG9yMygpICksXHJcbiAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHQudGltZXNWZWN0b3IyKCBuZXcgVmVjdG9yMiggeCArIHdpZHRoLCB5ICsgaGVpZ2h0ICkgKS50b1ZlY3RvcjMoKSApLFxyXG4gICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCB0LnRpbWVzVmVjdG9yMiggbmV3IFZlY3RvcjIoIHgsIHkgKyBoZWlnaHQgKSApLnRvVmVjdG9yMygpICksXHJcbiAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHQudGltZXNWZWN0b3IyKCBuZXcgVmVjdG9yMiggeCwgeSArIGhlaWdodCAqIG1pZFJhdGlvICkgKS50b1ZlY3RvcjMoKSApXHJcbiAgICBdICk7XHJcbiAgfVxyXG59XHJcblxyXG5jYXBhY2l0b3JMYWJCYXNpY3MucmVnaXN0ZXIoICdWb2x0bWV0ZXJTaGFwZUNyZWF0b3InLCBWb2x0bWV0ZXJTaGFwZUNyZWF0b3IgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZvbHRtZXRlclNoYXBlQ3JlYXRvcjtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSxrQ0FBa0M7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLGtDQUFrQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELFNBQVNDLEtBQUssUUFBUSxtQ0FBbUM7QUFDekQsT0FBT0Msa0JBQWtCLE1BQU0sZ0NBQWdDOztBQUUvRDtBQUNBLE1BQU1DLGdCQUFnQixHQUFHLElBQUlILE9BQU8sQ0FBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUUsQ0FBQztBQUUzRCxNQUFNSSxxQkFBcUIsQ0FBQztFQUMxQjtBQUNGO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxTQUFTLEVBQUVDLGtCQUFrQixFQUFHO0lBRTNDO0lBQ0EsSUFBSSxDQUFDRCxTQUFTLEdBQUdBLFNBQVM7O0lBRTFCO0lBQ0EsSUFBSSxDQUFDQyxrQkFBa0IsR0FBR0Esa0JBQWtCO0VBQzlDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyx3QkFBd0JBLENBQUEsRUFBRztJQUN6QixNQUFNQyxNQUFNLEdBQUcsSUFB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