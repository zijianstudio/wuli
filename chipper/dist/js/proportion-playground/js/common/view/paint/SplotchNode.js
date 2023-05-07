// Copyright 2016-2022, University of Colorado Boulder

/**
 * Mutable node that shows a single paint splatter "splotch"
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../../axon/js/Multilink.js';
import Matrix3 from '../../../../../dot/js/Matrix3.js';
import Utils from '../../../../../dot/js/Utils.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import merge from '../../../../../phet-core/js/merge.js';
import { Color, Path } from '../../../../../scenery/js/imports.js';
import proportionPlayground from '../../../proportionPlayground.js';
import PaintChoice from '../../model/paint/PaintChoice.js';
import ProportionPlaygroundConstants from '../../ProportionPlaygroundConstants.js';
import ProportionPlaygroundColors from '../ProportionPlaygroundColors.js';
import SceneRatioNode from '../SceneRatioNode.js';

// {Shape} SVG declaration for the splotch shape. Generated from AI file => cut shape => save svg => cut newlines.
let splotchShape = new Shape('M175.548,87.46c-2.652,3.387-4.599,8.469-0.975,12.482c3.643,4.034,8.46,1.764,11.977-0.388c6.346-3.881,1.241-0.534,7.13-5.117c7.318-5.694,13.795-4.323,17.793,4.046c2.696,5.641,1.031,8.84-5.098,10.066c-6.174,1.236-12.324,2.588-18.477,3.935c-0.798,0.175-1.777,0.417-2.26,0.981c-1.729,2.027-3.28,4.207-4.898,6.33c2.099,1.585,4.006,4.091,6.334,4.576c6.167,1.285,12.523,1.639,18.786,2.495c1.69,0.231,3.316,0.935,4.972,1.421c0.018,0.477,0.036,0.953,0.055,1.43c-1.242,0.352-2.479,0.725-3.727,1.053c-3.848,1.006-7.85,1.619-11.514,3.084c-4.927,1.969-5.336,4.534-1.449,8.096c9.553,8.754,20.298,14.904,33.725,15.479c3.374,0.144,7.044,1.089,9.9,2.798c1.76,1.053,3.432,4.554,2.963,6.399c-0.497,1.952-3.533,4.455-5.549,4.537c-2.844,0.115-6.529-0.992-8.533-2.938c-9.734-9.449-22.449-11.273-34.711-14.006c-3.004-0.67-6.744,1.183-9.9,2.475c-0.93,0.381-1.852,3.283-1.329,4.232c1.58,2.871,3.353,6.677,5.991,7.706c5.505,2.147,9.01,5.718,10.932,10.843c0.675,1.799-0.443,4.27-0.743,6.434c-2.123-0.378-4.853-0.062-6.239-1.279c-2.684-2.356-4.887-5.404-6.782-8.479c-2.231-3.619-7.937-7.49-11.847-6.582c-5.605,1.302-8.945,3.139-7.575,9.9c0.354,1.75,0.649,3.512,1.175,6.381c-3.296-1.469-5.717-2.611-8.188-3.635c-5.258-2.176-7.522-0.95-7.273,4.535c0.434,9.541,1.814,18.908,7.496,27.066c1.612,2.316,3.164,4.744,4.277,7.321c1.496,3.46,1.539,6.931-2.195,9.223c-3.411,2.094-8.797,1.282-10.66-2.12c-1.455-2.655-2.158-5.877-2.545-8.929c-0.604-4.769,0.077-9.815-1.2-14.345c-0.864-3.066-3.776-6.97-6.483-7.645c-2.082-0.518-6.139,2.859-7.804,5.471c-4.624,7.252-7.462,15.103-5.544,24.145c1.307,6.163-1.352,11.809-5.5,13.854c-4.072,2.008-7.643,0.488-8.096-4.001c-0.308-3.047,0.1-6.363,1.014-9.302c5.025-16.164,4.215-19.184-8.766-29.479c-8.654-6.865-24.182,0.414-33.848,5.763c-0.835,0.461-1.717,0.839-3.248,1.582c0-2.451-0.023-4.336,0.004-6.221c0.084-5.889,3.645-18.248-1.932-20.153c-10.764-3.676-32.707,8.215-43.582,10.267c-1.518,0.286-2.9,2.368-3.939,3.896c-2.844,4.176-7.365,6.137-11.648,4.33c-4.013-1.691-6.356-4.798-5.973-9.4c0.537-6.442,6.281-9.333,12.01-5.535c3.11,2.061,5.361,1.895,8.045-0.062c6.568-4.791,24.639-20.029,30.617-25.468c9.883-8.991,8.709-16.622-2.848-23.353c-2.664-1.551-5.586-2.66-9.576-4.529c2.318-1.109,3.485-1.908,4.771-2.235c3.28-0.832,6.855-2.278,6.137-5.911c-0.542-2.737-3.165-6.37-5.646-7.168c-7.207-2.32-14.805-3.434-22.258-4.98c-3.084-0.639-6.297-0.85-9.259-1.834c-5.11-1.698-6.97-5.312-5.415-9.525c1.588-4.305,5.395-6.268,10.192-4.203c5.632,2.423,10.903,5.688,16.313,8.621c2.339,1.268,4.578,2.728,6.955,3.918c8.732,4.373,11.553,3.791,17.592-3.453c5.058-6.068,5.144-11.299,0.123-18.111c-2.117-2.872-4.467-5.572-6.116-9.473c2.448,0.549,5.005,0.814,7.329,1.692c13.615,5.146,6.604-17.941,4.469-26.97c-0.414-1.751-1.07-4.021-2.15-5.748c-0.941-1.504-3.145-2.355-3.745-3.9c-0.89-2.289-1.644-5.191-0.951-7.349c0.513-1.599,3.644-3.62,5.21-3.325c2.442,0.458,5.031,2.332,6.634,4.344c1.169,1.467,0.438,4.23,1.197,6.244c1.607,4.263,7.323,10.848,8.907,12.201c5.684,4.858,18.543,11.651,23.102,11.607c3.336-0.033,7.303-4.781,6.898-9.233c-0.535-5.883-2.037-11.71-3.5-17.465c-0.938-3.69-2.674-7.169-3.814-10.817c-0.534-1.713-0.792-3.619-0.677-5.406c0.349-5.422,4.169-9.926,8.329-9.66c5.32,0.34,6.951,4.461,7.093,8.758c0.186,5.613-0.306,11.281-0.899,16.884c-0.822,7.767,0.078,14.958,5.357,21.13c2.654,3.102,6.229,5.846,9.891,4.038c2.776-1.371,5.768-5.224,6.043-8.213c0.927-10.071,0.71-20.249,0.875-30.387c0.072-4.454,0.012-8.911,0.012-13.993c0,0,1.56-5.787,9.365-8.598c9.375-3.375,9.625,8.47,9.625,8.47s-0.082,0.642-1.079,4.55c-1.801,7.057-5.226,13.684-7.333,20.683c-2.335,7.757-4.174,15.687-5.741,23.636c-0.446,2.262,0.81,4.858,1.285,7.301c0.784,0.396,1.504,1.409,2.354,1.188c4.289-1.117,13.07-9.568,13.74-9.106c0,1.343-5.031,10.494-4.715,13.927c0.681,7.389,20.323-3.229,30.99-5.562L175.548,87.46z');

// {number} - The approximate desired Shape area before scaling is applied
const TARGET_SHAPE_AREA = 12300;

// {number} - The area of splotchShape, computed with getApproximateArea()
const RAW_SHAPE_AREA = 21426.8;

// {number} - The position of the centroid of splotchShape (the 'center' of all of its included areas),
//            computed by Shape.getApproximateCentroid()
const SPLOTCH_CENTROID = new Vector2(117.37949080493232, 126.91260432847004);

// Remap the shape so that it has the target area, has its centroid at the origin, and has the desired rotation.
splotchShape = splotchShape.transformed(Matrix3.scaling(Math.sqrt(TARGET_SHAPE_AREA / RAW_SHAPE_AREA)).timesMatrix(Matrix3.rotation2(0.7)).timesMatrix(Matrix3.translation(-SPLOTCH_CENTROID.x, -SPLOTCH_CENTROID.y)));

// {Color} - Because {Property.<null>} is not supported as a fill.
const TRANSPARENT_COLOR = new Color('transparent');
class SplotchNode extends SceneRatioNode {
  /**
   * @param {Splotch} splotch - Our model
   * @param {Property.<PaintChoice>} paintChoiceProperty - Holds our current paint choice
   * @param {Object} [options] - node options
   */
  constructor(splotch, paintChoiceProperty, options) {
    super(splotch);

    // @public {Splotch}
    this.splotch = splotch;
    options = merge({
      useVisibleAmounts: false
    }, options);

    // Use different properties based on whether we are viewing visible amounts
    const leftColorProperty = options.useVisibleAmounts ? splotch.visibleLeftColorProperty : splotch.leftColorCountProperty;
    const rightColorProperty = options.useVisibleAmounts ? splotch.visibleRightColorProperty : splotch.rightColorCountProperty;
    const watchedProperties = [leftColorProperty, rightColorProperty, paintChoiceProperty].concat(PaintChoice.COLORS);
    const colorProperty = new DerivedProperty(watchedProperties, (leftColorAmount, rightColorAmount, paintChoice) => {
      const total = leftColorAmount + rightColorAmount;
      if (total > 0) {
        return paintChoice.getBlendedColor(Utils.clamp(rightColorAmount / total, 0, 1));
      } else {
        return TRANSPARENT_COLOR;
      }
    });
    const splotchPath = new Path(splotchShape, {
      stroke: ProportionPlaygroundColors.paintStrokeProperty,
      lineWidth: 0.7,
      fill: colorProperty
    });
    this.addChild(splotchPath);

    // When the color amounts change, update the size and color of the splotch.
    Multilink.multilink([leftColorProperty, rightColorProperty], (leftColor, rightColor) => {
      const total = leftColor + rightColor;

      // Don't fully zero our transform
      if (total > 0) {
        splotchPath.setScaleMagnitude(SplotchNode.colorTotalToSplotchScale(total));
      }
      splotchPath.visible = total > 0;
    });
    this.mutate(options);
  }

  /**
   * Converts the total amount of paint to the scale of our splotch. Increasing scale increases the area
   * quadratically, so we use sqrt().
   * @private
   *
   * @param {number} totalPaint
   * @returns {number} - Scale
   */
  static colorTotalToSplotchScale(totalPaint) {
    const maxScale = 1.6;
    // Scale is square-root of count, since the area is proportional to scale squared. Assume two full paint counts.
    return maxScale * Math.sqrt(totalPaint) / Math.sqrt(2 * ProportionPlaygroundConstants.PAINT_COUNT_RANGE.max);
  }

  /**
   * Returns the view area taken up by a splotch with only one unit of paint (as we'll want balloons and drips to
   * have this same area).
   * @public
   *
   * @returns {number}
   */
  static getSingleSplotchArea() {
    const scale = SplotchNode.colorTotalToSplotchScale(1);
    return scale * scale * TARGET_SHAPE_AREA; // Area proportional to scale squared
  }
}

proportionPlayground.register('SplotchNode', SplotchNode);
export default SplotchNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJNYXRyaXgzIiwiVXRpbHMiLCJWZWN0b3IyIiwiU2hhcGUiLCJtZXJnZSIsIkNvbG9yIiwiUGF0aCIsInByb3BvcnRpb25QbGF5Z3JvdW5kIiwiUGFpbnRDaG9pY2UiLCJQcm9wb3J0aW9uUGxheWdyb3VuZENvbnN0YW50cyIsIlByb3BvcnRpb25QbGF5Z3JvdW5kQ29sb3JzIiwiU2NlbmVSYXRpb05vZGUiLCJzcGxvdGNoU2hhcGUiLCJUQVJHRVRfU0hBUEVfQVJFQSIsIlJBV19TSEFQRV9BUkVBIiwiU1BMT1RDSF9DRU5UUk9JRCIsInRyYW5zZm9ybWVkIiwic2NhbGluZyIsIk1hdGgiLCJzcXJ0IiwidGltZXNNYXRyaXgiLCJyb3RhdGlvbjIiLCJ0cmFuc2xhdGlvbiIsIngiLCJ5IiwiVFJBTlNQQVJFTlRfQ09MT1IiLCJTcGxvdGNoTm9kZSIsImNvbnN0cnVjdG9yIiwic3Bsb3RjaCIsInBhaW50Q2hvaWNlUHJvcGVydHkiLCJvcHRpb25zIiwidXNlVmlzaWJsZUFtb3VudHMiLCJsZWZ0Q29sb3JQcm9wZXJ0eSIsInZpc2libGVMZWZ0Q29sb3JQcm9wZXJ0eSIsImxlZnRDb2xvckNvdW50UHJvcGVydHkiLCJyaWdodENvbG9yUHJvcGVydHkiLCJ2aXNpYmxlUmlnaHRDb2xvclByb3BlcnR5IiwicmlnaHRDb2xvckNvdW50UHJvcGVydHkiLCJ3YXRjaGVkUHJvcGVydGllcyIsImNvbmNhdCIsIkNPTE9SUyIsImNvbG9yUHJvcGVydHkiLCJsZWZ0Q29sb3JBbW91bnQiLCJyaWdodENvbG9yQW1vdW50IiwicGFpbnRDaG9pY2UiLCJ0b3RhbCIsImdldEJsZW5kZWRDb2xvciIsImNsYW1wIiwic3Bsb3RjaFBhdGgiLCJzdHJva2UiLCJwYWludFN0cm9rZVByb3BlcnR5IiwibGluZVdpZHRoIiwiZmlsbCIsImFkZENoaWxkIiwibXVsdGlsaW5rIiwibGVmdENvbG9yIiwicmlnaHRDb2xvciIsInNldFNjYWxlTWFnbml0dWRlIiwiY29sb3JUb3RhbFRvU3Bsb3RjaFNjYWxlIiwidmlzaWJsZSIsIm11dGF0ZSIsInRvdGFsUGFpbnQiLCJtYXhTY2FsZSIsIlBBSU5UX0NPVU5UX1JBTkdFIiwibWF4IiwiZ2V0U2luZ2xlU3Bsb3RjaEFyZWEiLCJzY2FsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3Bsb3RjaE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTXV0YWJsZSBub2RlIHRoYXQgc2hvd3MgYSBzaW5nbGUgcGFpbnQgc3BsYXR0ZXIgXCJzcGxvdGNoXCJcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgcHJvcG9ydGlvblBsYXlncm91bmQgZnJvbSAnLi4vLi4vLi4vcHJvcG9ydGlvblBsYXlncm91bmQuanMnO1xyXG5pbXBvcnQgUGFpbnRDaG9pY2UgZnJvbSAnLi4vLi4vbW9kZWwvcGFpbnQvUGFpbnRDaG9pY2UuanMnO1xyXG5pbXBvcnQgUHJvcG9ydGlvblBsYXlncm91bmRDb25zdGFudHMgZnJvbSAnLi4vLi4vUHJvcG9ydGlvblBsYXlncm91bmRDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgUHJvcG9ydGlvblBsYXlncm91bmRDb2xvcnMgZnJvbSAnLi4vUHJvcG9ydGlvblBsYXlncm91bmRDb2xvcnMuanMnO1xyXG5pbXBvcnQgU2NlbmVSYXRpb05vZGUgZnJvbSAnLi4vU2NlbmVSYXRpb05vZGUuanMnO1xyXG5cclxuLy8ge1NoYXBlfSBTVkcgZGVjbGFyYXRpb24gZm9yIHRoZSBzcGxvdGNoIHNoYXBlLiBHZW5lcmF0ZWQgZnJvbSBBSSBmaWxlID0+IGN1dCBzaGFwZSA9PiBzYXZlIHN2ZyA9PiBjdXQgbmV3bGluZXMuXHJcbmxldCBzcGxvdGNoU2hhcGUgPSBuZXcgU2hhcGUoICdNMTc1LjU0OCw4Ny40NmMtMi42NTIsMy4zODctNC41OTksOC40NjktMC45NzUsMTIuNDgyYzMuNjQzLDQuMDM0LDguNDYsMS43NjQsMTEuOTc3LTAuMzg4YzYuMzQ2LTMuODgxLDEuMjQxLTAuNTM0LDcuMTMtNS4xMTdjNy4zMTgtNS42OTQsMTMuNzk1LTQuMzIzLDE3Ljc5Myw0LjA0NmMyLjY5Niw1LjY0MSwxLjAzMSw4Ljg0LTUuMDk4LDEwLjA2NmMtNi4xNzQsMS4yMzYtMTIuMzI0LDIuNTg4LTE4LjQ3NywzLjkzNWMtMC43OTgsMC4xNzUtMS43NzcsMC40MTctMi4yNiwwLjk4MWMtMS43MjksMi4wMjctMy4yOCw0LjIwNy00Ljg5OCw2LjMzYzIuMDk5LDEuNTg1LDQuMDA2LDQuMDkxLDYuMzM0LDQuNTc2YzYuMTY3LDEuMjg1LDEyLjUyMywxLjYzOSwxOC43ODYsMi40OTVjMS42OSwwLjIzMSwzLjMxNiwwLjkzNSw0Ljk3MiwxLjQyMWMwLjAxOCwwLjQ3NywwLjAzNiwwLjk1MywwLjA1NSwxLjQzYy0xLjI0MiwwLjM1Mi0yLjQ3OSwwLjcyNS0zLjcyNywxLjA1M2MtMy44NDgsMS4wMDYtNy44NSwxLjYxOS0xMS41MTQsMy4wODRjLTQuOTI3LDEuOTY5LTUuMzM2LDQuNTM0LTEuNDQ5LDguMDk2YzkuNTUzLDguNzU0LDIwLjI5OCwxNC45MDQsMzMuNzI1LDE1LjQ3OWMzLjM3NCwwLjE0NCw3LjA0NCwxLjA4OSw5LjksMi43OThjMS43NiwxLjA1MywzLjQzMiw0LjU1NCwyLjk2Myw2LjM5OWMtMC40OTcsMS45NTItMy41MzMsNC40NTUtNS41NDksNC41MzdjLTIuODQ0LDAuMTE1LTYuNTI5LTAuOTkyLTguNTMzLTIuOTM4Yy05LjczNC05LjQ0OS0yMi40NDktMTEuMjczLTM0LjcxMS0xNC4wMDZjLTMuMDA0LTAuNjctNi43NDQsMS4xODMtOS45LDIuNDc1Yy0wLjkzLDAuMzgxLTEuODUyLDMuMjgzLTEuMzI5LDQuMjMyYzEuNTgsMi44NzEsMy4zNTMsNi42NzcsNS45OTEsNy43MDZjNS41MDUsMi4xNDcsOS4wMSw1LjcxOCwxMC45MzIsMTAuODQzYzAuNjc1LDEuNzk5LTAuNDQzLDQuMjctMC43NDMsNi40MzRjLTIuMTIzLTAuMzc4LTQuODUzLTAuMDYyLTYuMjM5LTEuMjc5Yy0yLjY4NC0yLjM1Ni00Ljg4Ny01LjQwNC02Ljc4Mi04LjQ3OWMtMi4yMzEtMy42MTktNy45MzctNy40OS0xMS44NDctNi41ODJjLTUuNjA1LDEuMzAyLTguOTQ1LDMuMTM5LTcuNTc1LDkuOWMwLjM1NCwxLjc1LDAuNjQ5LDMuNTEyLDEuMTc1LDYuMzgxYy0zLjI5Ni0xLjQ2OS01LjcxNy0yLjYxMS04LjE4OC0zLjYzNWMtNS4yNTgtMi4xNzYtNy41MjItMC45NS03LjI3Myw0LjUzNWMwLjQzNCw5LjU0MSwxLjgxNCwxOC45MDgsNy40OTYsMjcuMDY2YzEuNjEyLDIuMzE2LDMuMTY0LDQuNzQ0LDQuMjc3LDcuMzIxYzEuNDk2LDMuNDYsMS41MzksNi45MzEtMi4xOTUsOS4yMjNjLTMuNDExLDIuMDk0LTguNzk3LDEuMjgyLTEwLjY2LTIuMTJjLTEuNDU1LTIuNjU1LTIuMTU4LTUuODc3LTIuNTQ1LTguOTI5Yy0wLjYwNC00Ljc2OSwwLjA3Ny05LjgxNS0xLjItMTQuMzQ1Yy0wLjg2NC0zLjA2Ni0zLjc3Ni02Ljk3LTYuNDgzLTcuNjQ1Yy0yLjA4Mi0wLjUxOC02LjEzOSwyLjg1OS03LjgwNCw1LjQ3MWMtNC42MjQsNy4yNTItNy40NjIsMTUuMTAzLTUuNTQ0LDI0LjE0NWMxLjMwNyw2LjE2My0xLjM1MiwxMS44MDktNS41LDEzLjg1NGMtNC4wNzIsMi4wMDgtNy42NDMsMC40ODgtOC4wOTYtNC4wMDFjLTAuMzA4LTMuMDQ3LDAuMS02LjM2MywxLjAxNC05LjMwMmM1LjAyNS0xNi4xNjQsNC4yMTUtMTkuMTg0LTguNzY2LTI5LjQ3OWMtOC42NTQtNi44NjUtMjQuMTgyLDAuNDE0LTMzLjg0OCw1Ljc2M2MtMC44MzUsMC40NjEtMS43MTcsMC44MzktMy4yNDgsMS41ODJjMC0yLjQ1MS0wLjAyMy00LjMzNiwwLjAwNC02LjIyMWMwLjA4NC01Ljg4OSwzLjY0NS0xOC4yNDgtMS45MzItMjAuMTUzYy0xMC43NjQtMy42NzYtMzIuNzA3LDguMjE1LTQzLjU4MiwxMC4yNjdjLTEuNTE4LDAuMjg2LTIuOSwyLjM2OC0zLjkzOSwzLjg5NmMtMi44NDQsNC4xNzYtNy4zNjUsNi4xMzctMTEuNjQ4LDQuMzNjLTQuMDEzLTEuNjkxLTYuMzU2LTQuNzk4LTUuOTczLTkuNGMwLjUzNy02LjQ0Miw2LjI4MS05LjMzMywxMi4wMS01LjUzNWMzLjExLDIuMDYxLDUuMzYxLDEuODk1LDguMDQ1LTAuMDYyYzYuNTY4LTQuNzkxLDI0LjYzOS0yMC4wMjksMzAuNjE3LTI1LjQ2OGM5Ljg4My04Ljk5MSw4LjcwOS0xNi42MjItMi44NDgtMjMuMzUzYy0yLjY2NC0xLjU1MS01LjU4Ni0yLjY2LTkuNTc2LTQuNTI5YzIuMzE4LTEuMTA5LDMuNDg1LTEuOTA4LDQuNzcxLTIuMjM1YzMuMjgtMC44MzIsNi44NTUtMi4yNzgsNi4xMzctNS45MTFjLTAuNTQyLTIuNzM3LTMuMTY1LTYuMzctNS42NDYtNy4xNjhjLTcuMjA3LTIuMzItMTQuODA1LTMuNDM0LTIyLjI1OC00Ljk4Yy0zLjA4NC0wLjYzOS02LjI5Ny0wLjg1LTkuMjU5LTEuODM0Yy01LjExLTEuNjk4LTYuOTctNS4zMTItNS40MTUtOS41MjVjMS41ODgtNC4zMDUsNS4zOTUtNi4yNjgsMTAuMTkyLTQuMjAzYzUuNjMyLDIuNDIzLDEwLjkwMyw1LjY4OCwxNi4zMTMsOC42MjFjMi4zMzksMS4yNjgsNC41NzgsMi43MjgsNi45NTUsMy45MThjOC43MzIsNC4zNzMsMTEuNTUzLDMuNzkxLDE3LjU5Mi0zLjQ1M2M1LjA1OC02LjA2OCw1LjE0NC0xMS4yOTksMC4xMjMtMTguMTExYy0yLjExNy0yLjg3Mi00LjQ2Ny01LjU3Mi02LjExNi05LjQ3M2MyLjQ0OCwwLjU0OSw1LjAwNSwwLjgxNCw3LjMyOSwxLjY5MmMxMy42MTUsNS4xNDYsNi42MDQtMTcuOTQxLDQuNDY5LTI2Ljk3Yy0wLjQxNC0xLjc1MS0xLjA3LTQuMDIxLTIuMTUtNS43NDhjLTAuOTQxLTEuNTA0LTMuMTQ1LTIuMzU1LTMuNzQ1LTMuOWMtMC44OS0yLjI4OS0xLjY0NC01LjE5MS0wLjk1MS03LjM0OWMwLjUxMy0xLjU5OSwzLjY0NC0zLjYyLDUuMjEtMy4zMjVjMi40NDIsMC40NTgsNS4wMzEsMi4zMzIsNi42MzQsNC4zNDRjMS4xNjksMS40NjcsMC40MzgsNC4yMywxLjE5Nyw2LjI0NGMxLjYwNyw0LjI2Myw3LjMyMywxMC44NDgsOC45MDcsMTIuMjAxYzUuNjg0LDQuODU4LDE4LjU0MywxMS42NTEsMjMuMTAyLDExLjYwN2MzLjMzNi0wLjAzMyw3LjMwMy00Ljc4MSw2Ljg5OC05LjIzM2MtMC41MzUtNS44ODMtMi4wMzctMTEuNzEtMy41LTE3LjQ2NWMtMC45MzgtMy42OS0yLjY3NC03LjE2OS0zLjgxNC0xMC44MTdjLTAuNTM0LTEuNzEzLTAuNzkyLTMuNjE5LTAuNjc3LTUuNDA2YzAuMzQ5LTUuNDIyLDQuMTY5LTkuOTI2LDguMzI5LTkuNjZjNS4zMiwwLjM0LDYuOTUxLDQuNDYxLDcuMDkzLDguNzU4YzAuMTg2LDUuNjEzLTAuMzA2LDExLjI4MS0wLjg5OSwxNi44ODRjLTAuODIyLDcuNzY3LDAuMDc4LDE0Ljk1OCw1LjM1NywyMS4xM2MyLjY1NCwzLjEwMiw2LjIyOSw1Ljg0Niw5Ljg5MSw0LjAzOGMyLjc3Ni0xLjM3MSw1Ljc2OC01LjIyNCw2LjA0My04LjIxM2MwLjkyNy0xMC4wNzEsMC43MS0yMC4yNDksMC44NzUtMzAuMzg3YzAuMDcyLTQuNDU0LDAuMDEyLTguOTExLDAuMDEyLTEzLjk5M2MwLDAsMS41Ni01Ljc4Nyw5LjM2NS04LjU5OGM5LjM3NS0zLjM3NSw5LjYyNSw4LjQ3LDkuNjI1LDguNDdzLTAuMDgyLDAuNjQyLTEuMDc5LDQuNTVjLTEuODAxLDcuMDU3LTUuMjI2LDEzLjY4NC03LjMzMywyMC42ODNjLTIuMzM1LDcuNzU3LTQuMTc0LDE1LjY4Ny01Ljc0MSwyMy42MzZjLTAuNDQ2LDIuMjYyLDAuODEsNC44NTgsMS4yODUsNy4zMDFjMC43ODQsMC4zOTYsMS41MDQsMS40MDksMi4zNTQsMS4xODhjNC4yODktMS4xMTcsMTMuMDctOS41NjgsMTMuNzQtOS4xMDZjMCwxLjM0My01LjAzMSwxMC40OTQtNC43MTUsMTMuOTI3YzAuNjgxLDcuMzg5LDIwLjMyMy0zLjIyOSwzMC45OS01LjU2MkwxNzUuNTQ4LDg3LjQ2eicgKTtcclxuXHJcbi8vIHtudW1iZXJ9IC0gVGhlIGFwcHJveGltYXRlIGRlc2lyZWQgU2hhcGUgYXJlYSBiZWZvcmUgc2NhbGluZyBpcyBhcHBsaWVkXHJcbmNvbnN0IFRBUkdFVF9TSEFQRV9BUkVBID0gMTIzMDA7XHJcblxyXG4vLyB7bnVtYmVyfSAtIFRoZSBhcmVhIG9mIHNwbG90Y2hTaGFwZSwgY29tcHV0ZWQgd2l0aCBnZXRBcHByb3hpbWF0ZUFyZWEoKVxyXG5jb25zdCBSQVdfU0hBUEVfQVJFQSA9IDIxNDI2Ljg7XHJcblxyXG4vLyB7bnVtYmVyfSAtIFRoZSBwb3NpdGlvbiBvZiB0aGUgY2VudHJvaWQgb2Ygc3Bsb3RjaFNoYXBlICh0aGUgJ2NlbnRlcicgb2YgYWxsIG9mIGl0cyBpbmNsdWRlZCBhcmVhcyksXHJcbi8vICAgICAgICAgICAgY29tcHV0ZWQgYnkgU2hhcGUuZ2V0QXBwcm94aW1hdGVDZW50cm9pZCgpXHJcbmNvbnN0IFNQTE9UQ0hfQ0VOVFJPSUQgPSBuZXcgVmVjdG9yMiggMTE3LjM3OTQ5MDgwNDkzMjMyLCAxMjYuOTEyNjA0MzI4NDcwMDQgKTtcclxuXHJcbi8vIFJlbWFwIHRoZSBzaGFwZSBzbyB0aGF0IGl0IGhhcyB0aGUgdGFyZ2V0IGFyZWEsIGhhcyBpdHMgY2VudHJvaWQgYXQgdGhlIG9yaWdpbiwgYW5kIGhhcyB0aGUgZGVzaXJlZCByb3RhdGlvbi5cclxuc3Bsb3RjaFNoYXBlID0gc3Bsb3RjaFNoYXBlLnRyYW5zZm9ybWVkKCBNYXRyaXgzLnNjYWxpbmcoIE1hdGguc3FydCggVEFSR0VUX1NIQVBFX0FSRUEgLyBSQVdfU0hBUEVfQVJFQSApIClcclxuICAudGltZXNNYXRyaXgoIE1hdHJpeDMucm90YXRpb24yKCAwLjcgKSApXHJcbiAgLnRpbWVzTWF0cml4KCBNYXRyaXgzLnRyYW5zbGF0aW9uKCAtU1BMT1RDSF9DRU5UUk9JRC54LCAtU1BMT1RDSF9DRU5UUk9JRC55ICkgKSApO1xyXG5cclxuLy8ge0NvbG9yfSAtIEJlY2F1c2Uge1Byb3BlcnR5LjxudWxsPn0gaXMgbm90IHN1cHBvcnRlZCBhcyBhIGZpbGwuXHJcbmNvbnN0IFRSQU5TUEFSRU5UX0NPTE9SID0gbmV3IENvbG9yKCAndHJhbnNwYXJlbnQnICk7XHJcblxyXG5jbGFzcyBTcGxvdGNoTm9kZSBleHRlbmRzIFNjZW5lUmF0aW9Ob2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1NwbG90Y2h9IHNwbG90Y2ggLSBPdXIgbW9kZWxcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxQYWludENob2ljZT59IHBhaW50Q2hvaWNlUHJvcGVydHkgLSBIb2xkcyBvdXIgY3VycmVudCBwYWludCBjaG9pY2VcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gbm9kZSBvcHRpb25zXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHNwbG90Y2gsIHBhaW50Q2hvaWNlUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcbiAgICBzdXBlciggc3Bsb3RjaCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1NwbG90Y2h9XHJcbiAgICB0aGlzLnNwbG90Y2ggPSBzcGxvdGNoO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB1c2VWaXNpYmxlQW1vdW50czogZmFsc2VcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBVc2UgZGlmZmVyZW50IHByb3BlcnRpZXMgYmFzZWQgb24gd2hldGhlciB3ZSBhcmUgdmlld2luZyB2aXNpYmxlIGFtb3VudHNcclxuICAgIGNvbnN0IGxlZnRDb2xvclByb3BlcnR5ID0gb3B0aW9ucy51c2VWaXNpYmxlQW1vdW50cyA/IHNwbG90Y2gudmlzaWJsZUxlZnRDb2xvclByb3BlcnR5IDogc3Bsb3RjaC5sZWZ0Q29sb3JDb3VudFByb3BlcnR5O1xyXG4gICAgY29uc3QgcmlnaHRDb2xvclByb3BlcnR5ID0gb3B0aW9ucy51c2VWaXNpYmxlQW1vdW50cyA/IHNwbG90Y2gudmlzaWJsZVJpZ2h0Q29sb3JQcm9wZXJ0eSA6IHNwbG90Y2gucmlnaHRDb2xvckNvdW50UHJvcGVydHk7XHJcblxyXG4gICAgY29uc3Qgd2F0Y2hlZFByb3BlcnRpZXMgPSBbIGxlZnRDb2xvclByb3BlcnR5LCByaWdodENvbG9yUHJvcGVydHksIHBhaW50Q2hvaWNlUHJvcGVydHkgXS5jb25jYXQoIFBhaW50Q2hvaWNlLkNPTE9SUyApO1xyXG4gICAgY29uc3QgY29sb3JQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIHdhdGNoZWRQcm9wZXJ0aWVzLCAoIGxlZnRDb2xvckFtb3VudCwgcmlnaHRDb2xvckFtb3VudCwgcGFpbnRDaG9pY2UgKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRvdGFsID0gbGVmdENvbG9yQW1vdW50ICsgcmlnaHRDb2xvckFtb3VudDtcclxuICAgICAgaWYgKCB0b3RhbCA+IDAgKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhaW50Q2hvaWNlLmdldEJsZW5kZWRDb2xvciggVXRpbHMuY2xhbXAoIHJpZ2h0Q29sb3JBbW91bnQgLyB0b3RhbCwgMCwgMSApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFRSQU5TUEFSRU5UX0NPTE9SO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc3Bsb3RjaFBhdGggPSBuZXcgUGF0aCggc3Bsb3RjaFNoYXBlLCB7XHJcbiAgICAgIHN0cm9rZTogUHJvcG9ydGlvblBsYXlncm91bmRDb2xvcnMucGFpbnRTdHJva2VQcm9wZXJ0eSxcclxuICAgICAgbGluZVdpZHRoOiAwLjcsXHJcbiAgICAgIGZpbGw6IGNvbG9yUHJvcGVydHlcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNwbG90Y2hQYXRoICk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgY29sb3IgYW1vdW50cyBjaGFuZ2UsIHVwZGF0ZSB0aGUgc2l6ZSBhbmQgY29sb3Igb2YgdGhlIHNwbG90Y2guXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIGxlZnRDb2xvclByb3BlcnR5LCByaWdodENvbG9yUHJvcGVydHkgXSwgKCBsZWZ0Q29sb3IsIHJpZ2h0Q29sb3IgKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRvdGFsID0gbGVmdENvbG9yICsgcmlnaHRDb2xvcjtcclxuXHJcbiAgICAgIC8vIERvbid0IGZ1bGx5IHplcm8gb3VyIHRyYW5zZm9ybVxyXG4gICAgICBpZiAoIHRvdGFsID4gMCApIHtcclxuICAgICAgICBzcGxvdGNoUGF0aC5zZXRTY2FsZU1hZ25pdHVkZSggU3Bsb3RjaE5vZGUuY29sb3JUb3RhbFRvU3Bsb3RjaFNjYWxlKCB0b3RhbCApICk7XHJcbiAgICAgIH1cclxuICAgICAgc3Bsb3RjaFBhdGgudmlzaWJsZSA9IHRvdGFsID4gMDtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIHRoZSB0b3RhbCBhbW91bnQgb2YgcGFpbnQgdG8gdGhlIHNjYWxlIG9mIG91ciBzcGxvdGNoLiBJbmNyZWFzaW5nIHNjYWxlIGluY3JlYXNlcyB0aGUgYXJlYVxyXG4gICAqIHF1YWRyYXRpY2FsbHksIHNvIHdlIHVzZSBzcXJ0KCkuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0b3RhbFBhaW50XHJcbiAgICogQHJldHVybnMge251bWJlcn0gLSBTY2FsZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjb2xvclRvdGFsVG9TcGxvdGNoU2NhbGUoIHRvdGFsUGFpbnQgKSB7XHJcbiAgICBjb25zdCBtYXhTY2FsZSA9IDEuNjtcclxuICAgIC8vIFNjYWxlIGlzIHNxdWFyZS1yb290IG9mIGNvdW50LCBzaW5jZSB0aGUgYXJlYSBpcyBwcm9wb3J0aW9uYWwgdG8gc2NhbGUgc3F1YXJlZC4gQXNzdW1lIHR3byBmdWxsIHBhaW50IGNvdW50cy5cclxuICAgIHJldHVybiBtYXhTY2FsZSAqIE1hdGguc3FydCggdG90YWxQYWludCApIC8gTWF0aC5zcXJ0KCAyICogUHJvcG9ydGlvblBsYXlncm91bmRDb25zdGFudHMuUEFJTlRfQ09VTlRfUkFOR0UubWF4ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB2aWV3IGFyZWEgdGFrZW4gdXAgYnkgYSBzcGxvdGNoIHdpdGggb25seSBvbmUgdW5pdCBvZiBwYWludCAoYXMgd2UnbGwgd2FudCBiYWxsb29ucyBhbmQgZHJpcHMgdG9cclxuICAgKiBoYXZlIHRoaXMgc2FtZSBhcmVhKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRTaW5nbGVTcGxvdGNoQXJlYSgpIHtcclxuICAgIGNvbnN0IHNjYWxlID0gU3Bsb3RjaE5vZGUuY29sb3JUb3RhbFRvU3Bsb3RjaFNjYWxlKCAxICk7XHJcbiAgICByZXR1cm4gc2NhbGUgKiBzY2FsZSAqIFRBUkdFVF9TSEFQRV9BUkVBOyAvLyBBcmVhIHByb3BvcnRpb25hbCB0byBzY2FsZSBzcXVhcmVkXHJcbiAgfVxyXG59XHJcblxyXG5wcm9wb3J0aW9uUGxheWdyb3VuZC5yZWdpc3RlciggJ1NwbG90Y2hOb2RlJywgU3Bsb3RjaE5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNwbG90Y2hOb2RlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLDJDQUEyQztBQUN2RSxPQUFPQyxTQUFTLE1BQU0scUNBQXFDO0FBQzNELE9BQU9DLE9BQU8sTUFBTSxrQ0FBa0M7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxPQUFPQyxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELFNBQVNDLEtBQUssUUFBUSxtQ0FBbUM7QUFDekQsT0FBT0MsS0FBSyxNQUFNLHNDQUFzQztBQUN4RCxTQUFTQyxLQUFLLEVBQUVDLElBQUksUUFBUSxzQ0FBc0M7QUFDbEUsT0FBT0Msb0JBQW9CLE1BQU0sa0NBQWtDO0FBQ25FLE9BQU9DLFdBQVcsTUFBTSxrQ0FBa0M7QUFDMUQsT0FBT0MsNkJBQTZCLE1BQU0sd0NBQXdDO0FBQ2xGLE9BQU9DLDBCQUEwQixNQUFNLGtDQUFrQztBQUN6RSxPQUFPQyxjQUFjLE1BQU0sc0JBQXNCOztBQUVqRDtBQUNBLElBQUlDLFlBQVksR0FBRyxJQUFJVCxLQUFLLENBQUUsNHJIQUE2ckgsQ0FBQzs7QUFFNXRI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