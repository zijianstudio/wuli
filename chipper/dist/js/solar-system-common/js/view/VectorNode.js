// Copyright 2023, University of Colorado Boulder

/**
 * Draws a vector for a Body, such as a force vector or velocity vector.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';
import optionize from '../../../phet-core/js/optionize.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import solarSystemCommon from '../solarSystemCommon.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
// Determines if the vector exceeds the min or max values, used only if constrainSize is true
class OversizeType extends EnumerationValue {
  static NONE = new OversizeType();
  static BIGGER = new OversizeType();
  static SMALLER = new OversizeType();
  static enumeration = new Enumeration(OversizeType);
}
export default class VectorNode extends ArrowNode {
  oversizeType = OversizeType.NONE;
  constructor(body, transformProperty, visibleProperty, vectorProperty, forceScaleProperty, providedOptions) {
    const options = optionize()({
      // Self options
      constrainSize: false,
      headHeight: 15,
      headWidth: 15,
      tailWidth: 5,
      stroke: '#404040',
      boundsMethod: 'none',
      isHeadDynamic: true,
      scaleTailToo: true,
      visibleProperty: visibleProperty
    }, providedOptions);
    super(0, 0, 0, 0, options);
    this.tailProperty = new DerivedProperty([body.positionProperty, transformProperty], (bodyPosition, transform) => {
      return transform.modelToViewPosition(bodyPosition);
    });
    this.tipProperty = new DerivedProperty([this.tailProperty, vectorProperty, transformProperty, forceScaleProperty], (tail, vector, transform, forceScale) => {
      // forceScale currently goes from -2 to 8, where -2 is scaling down for big vectors ~100 units of force
      // and 8 is scaling up for small vectors ~1/100000000 units of force
      const magnitudeLog = vector.magnitude ? Math.log10(vector.magnitude / 500) : -forceScale;
      if (magnitudeLog > -forceScale + 1.5) {
        this.oversizeType = OversizeType.BIGGER;
        // body.forceOffscaleProperty.value = true;
      } else if (magnitudeLog < -forceScale - 0.4) {
        this.oversizeType = OversizeType.SMALLER;
        body.forceOffscaleProperty.value = true;
      } else {
        this.oversizeType = OversizeType.NONE;
        body.forceOffscaleProperty.value = false;
      }
      const finalTip = vector.times(0.05 * Math.pow(10, forceScale));
      if (finalTip.magnitude > 1e4) {
        finalTip.setMagnitude(1e4);
        body.forceOffscaleProperty.value = false;
      }
      const finalPosition = transform.modelToViewDelta(finalTip).plus(tail);
      return finalPosition;
    });
    Multilink.multilink([this.tailProperty, this.tipProperty], (tail, tip) => {
      this.setTailAndTip(tail.x, tail.y, tip.x, tip.y);
      this.localBounds = Bounds2.point(tail).addPoint(tip).dilated(10); // must set because boundsMethod: 'none'.
    });
  }

  dispose() {
    this.tailProperty.dispose();
    this.tipProperty.dispose();
    super.dispose();
  }
}
solarSystemCommon.register('VectorNode', VectorNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiQXJyb3dOb2RlIiwib3B0aW9uaXplIiwiRGVyaXZlZFByb3BlcnR5IiwiTXVsdGlsaW5rIiwic29sYXJTeXN0ZW1Db21tb24iLCJFbnVtZXJhdGlvblZhbHVlIiwiRW51bWVyYXRpb24iLCJPdmVyc2l6ZVR5cGUiLCJOT05FIiwiQklHR0VSIiwiU01BTExFUiIsImVudW1lcmF0aW9uIiwiVmVjdG9yTm9kZSIsIm92ZXJzaXplVHlwZSIsImNvbnN0cnVjdG9yIiwiYm9keSIsInRyYW5zZm9ybVByb3BlcnR5IiwidmlzaWJsZVByb3BlcnR5IiwidmVjdG9yUHJvcGVydHkiLCJmb3JjZVNjYWxlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiY29uc3RyYWluU2l6ZSIsImhlYWRIZWlnaHQiLCJoZWFkV2lkdGgiLCJ0YWlsV2lkdGgiLCJzdHJva2UiLCJib3VuZHNNZXRob2QiLCJpc0hlYWREeW5hbWljIiwic2NhbGVUYWlsVG9vIiwidGFpbFByb3BlcnR5IiwicG9zaXRpb25Qcm9wZXJ0eSIsImJvZHlQb3NpdGlvbiIsInRyYW5zZm9ybSIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJ0aXBQcm9wZXJ0eSIsInRhaWwiLCJ2ZWN0b3IiLCJmb3JjZVNjYWxlIiwibWFnbml0dWRlTG9nIiwibWFnbml0dWRlIiwiTWF0aCIsImxvZzEwIiwiZm9yY2VPZmZzY2FsZVByb3BlcnR5IiwidmFsdWUiLCJmaW5hbFRpcCIsInRpbWVzIiwicG93Iiwic2V0TWFnbml0dWRlIiwiZmluYWxQb3NpdGlvbiIsIm1vZGVsVG9WaWV3RGVsdGEiLCJwbHVzIiwibXVsdGlsaW5rIiwidGlwIiwic2V0VGFpbEFuZFRpcCIsIngiLCJ5IiwibG9jYWxCb3VuZHMiLCJwb2ludCIsImFkZFBvaW50IiwiZGlsYXRlZCIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZlY3Rvck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERyYXdzIGEgdmVjdG9yIGZvciBhIEJvZHksIHN1Y2ggYXMgYSBmb3JjZSB2ZWN0b3Igb3IgdmVsb2NpdHkgdmVjdG9yLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFndXN0w61uIFZhbGxlam8gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvZHkgZnJvbSAnLi4vbW9kZWwvQm9keS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUsIHsgQXJyb3dOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9BcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IHNvbGFyU3lzdGVtQ29tbW9uIGZyb20gJy4uL3NvbGFyU3lzdGVtQ29tbW9uLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgY29uc3RyYWluU2l6ZT86IGJvb2xlYW47XHJcbn07XHJcblxyXG4vLyBEZXRlcm1pbmVzIGlmIHRoZSB2ZWN0b3IgZXhjZWVkcyB0aGUgbWluIG9yIG1heCB2YWx1ZXMsIHVzZWQgb25seSBpZiBjb25zdHJhaW5TaXplIGlzIHRydWVcclxuY2xhc3MgT3ZlcnNpemVUeXBlIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBOT05FID0gbmV3IE92ZXJzaXplVHlwZSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQklHR0VSID0gbmV3IE92ZXJzaXplVHlwZSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU01BTExFUiA9IG5ldyBPdmVyc2l6ZVR5cGUoKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggT3ZlcnNpemVUeXBlICk7XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIFZlY3Rvck5vZGVPcHRpb25zID0gQXJyb3dOb2RlT3B0aW9ucyAmIFNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVjdG9yTm9kZSBleHRlbmRzIEFycm93Tm9kZSB7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHRpcFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxWZWN0b3IyPjtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgdGFpbFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxWZWN0b3IyPjtcclxuICBwcml2YXRlIG92ZXJzaXplVHlwZTogT3ZlcnNpemVUeXBlID0gT3ZlcnNpemVUeXBlLk5PTkU7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgIGJvZHk6IEJvZHksXHJcbiAgICB0cmFuc2Zvcm1Qcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8TW9kZWxWaWV3VHJhbnNmb3JtMj4sXHJcbiAgICB2aXNpYmxlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgdmVjdG9yUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFZlY3RvcjI+LFxyXG4gICAgZm9yY2VTY2FsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgcHJvdmlkZWRPcHRpb25zPzogVmVjdG9yTm9kZU9wdGlvbnNcclxuICApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFZlY3Rvck5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgQXJyb3dOb2RlT3B0aW9ucz4oKSgge1xyXG4gICAgICAvLyBTZWxmIG9wdGlvbnNcclxuICAgICAgY29uc3RyYWluU2l6ZTogZmFsc2UsXHJcblxyXG4gICAgICBoZWFkSGVpZ2h0OiAxNSxcclxuICAgICAgaGVhZFdpZHRoOiAxNSxcclxuICAgICAgdGFpbFdpZHRoOiA1LFxyXG4gICAgICBzdHJva2U6ICcjNDA0MDQwJyxcclxuICAgICAgYm91bmRzTWV0aG9kOiAnbm9uZScsXHJcbiAgICAgIGlzSGVhZER5bmFtaWM6IHRydWUsXHJcbiAgICAgIHNjYWxlVGFpbFRvbzogdHJ1ZSxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiB2aXNpYmxlUHJvcGVydHlcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCAwLCAwLCAwLCAwLCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy50YWlsUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGJvZHkucG9zaXRpb25Qcm9wZXJ0eSwgdHJhbnNmb3JtUHJvcGVydHkgXSxcclxuICAgICAgKCBib2R5UG9zaXRpb24sIHRyYW5zZm9ybSApID0+IHtcclxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIGJvZHlQb3NpdGlvbiApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50aXBQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy50YWlsUHJvcGVydHksIHZlY3RvclByb3BlcnR5LCB0cmFuc2Zvcm1Qcm9wZXJ0eSwgZm9yY2VTY2FsZVByb3BlcnR5IF0sXHJcbiAgICAgICggdGFpbCwgdmVjdG9yLCB0cmFuc2Zvcm0sIGZvcmNlU2NhbGUgKSA9PiB7XHJcbiAgICAgICAgLy8gZm9yY2VTY2FsZSBjdXJyZW50bHkgZ29lcyBmcm9tIC0yIHRvIDgsIHdoZXJlIC0yIGlzIHNjYWxpbmcgZG93biBmb3IgYmlnIHZlY3RvcnMgfjEwMCB1bml0cyBvZiBmb3JjZVxyXG4gICAgICAgIC8vIGFuZCA4IGlzIHNjYWxpbmcgdXAgZm9yIHNtYWxsIHZlY3RvcnMgfjEvMTAwMDAwMDAwIHVuaXRzIG9mIGZvcmNlXHJcbiAgICAgICAgY29uc3QgbWFnbml0dWRlTG9nID0gdmVjdG9yLm1hZ25pdHVkZSA/IE1hdGgubG9nMTAoIHZlY3Rvci5tYWduaXR1ZGUgLyA1MDAgKSA6IC1mb3JjZVNjYWxlO1xyXG4gICAgICAgIGlmICggbWFnbml0dWRlTG9nID4gLWZvcmNlU2NhbGUgKyAxLjUgKSB7XHJcbiAgICAgICAgICB0aGlzLm92ZXJzaXplVHlwZSA9IE92ZXJzaXplVHlwZS5CSUdHRVI7XHJcbiAgICAgICAgICAvLyBib2R5LmZvcmNlT2Zmc2NhbGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBtYWduaXR1ZGVMb2cgPCAtZm9yY2VTY2FsZSAtIDAuNCApIHtcclxuICAgICAgICAgIHRoaXMub3ZlcnNpemVUeXBlID0gT3ZlcnNpemVUeXBlLlNNQUxMRVI7XHJcbiAgICAgICAgICBib2R5LmZvcmNlT2Zmc2NhbGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5vdmVyc2l6ZVR5cGUgPSBPdmVyc2l6ZVR5cGUuTk9ORTtcclxuICAgICAgICAgIGJvZHkuZm9yY2VPZmZzY2FsZVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGZpbmFsVGlwID0gdmVjdG9yLnRpbWVzKCAwLjA1ICogTWF0aC5wb3coIDEwLCBmb3JjZVNjYWxlICkgKTtcclxuICAgICAgICBpZiAoIGZpbmFsVGlwLm1hZ25pdHVkZSA+IDFlNCApIHtcclxuICAgICAgICAgIGZpbmFsVGlwLnNldE1hZ25pdHVkZSggMWU0ICk7XHJcbiAgICAgICAgICBib2R5LmZvcmNlT2Zmc2NhbGVQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBmaW5hbFBvc2l0aW9uID0gdHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGEoIGZpbmFsVGlwICkucGx1cyggdGFpbCApO1xyXG4gICAgICAgIHJldHVybiBmaW5hbFBvc2l0aW9uO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyB0aGlzLnRhaWxQcm9wZXJ0eSwgdGhpcy50aXBQcm9wZXJ0eSBdLCAoIHRhaWwsIHRpcCApID0+IHtcclxuICAgICAgdGhpcy5zZXRUYWlsQW5kVGlwKCB0YWlsLngsIHRhaWwueSwgdGlwLngsIHRpcC55ICk7XHJcbiAgICAgIHRoaXMubG9jYWxCb3VuZHMgPSBCb3VuZHMyLnBvaW50KCB0YWlsICkuYWRkUG9pbnQoIHRpcCApLmRpbGF0ZWQoIDEwICk7IC8vIG11c3Qgc2V0IGJlY2F1c2UgYm91bmRzTWV0aG9kOiAnbm9uZScuXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMudGFpbFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMudGlwUHJvcGVydHkuZGlzcG9zZSgpO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbnNvbGFyU3lzdGVtQ29tbW9uLnJlZ2lzdGVyKCAnVmVjdG9yTm9kZScsIFZlY3Rvck5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsT0FBTyxNQUFNLDRCQUE0QjtBQUdoRCxPQUFPQyxTQUFTLE1BQTRCLHVDQUF1QztBQUVuRixPQUFPQyxTQUFTLE1BQU0sb0NBQW9DO0FBQzFELE9BQU9DLGVBQWUsTUFBTSxxQ0FBcUM7QUFDakUsT0FBT0MsU0FBUyxNQUFNLCtCQUErQjtBQUNyRCxPQUFPQyxpQkFBaUIsTUFBTSx5QkFBeUI7QUFDdkQsT0FBT0MsZ0JBQWdCLE1BQU0sMkNBQTJDO0FBQ3hFLE9BQU9DLFdBQVcsTUFBTSxzQ0FBc0M7QUFNOUQ7QUFDQSxNQUFNQyxZQUFZLFNBQVNGLGdCQUFnQixDQUFDO0VBQzFDLE9BQXVCRyxJQUFJLEdBQUcsSUFBSUQsWUFBWSxDQUFDLENBQUM7RUFDaEQsT0FBdUJFLE1BQU0sR0FBRyxJQUFJRixZQUFZLENBQUMsQ0FBQztFQUNsRCxPQUF1QkcsT0FBTyxHQUFHLElBQUlILFlBQVksQ0FBQyxDQUFDO0VBRW5ELE9BQXVCSSxXQUFXLEdBQUcsSUFBSUwsV0FBVyxDQUFFQyxZQUFhLENBQUM7QUFDdEU7QUFJQSxlQUFlLE1BQU1LLFVBQVUsU0FBU1osU0FBUyxDQUFDO0VBR3hDYSxZQUFZLEdBQWlCTixZQUFZLENBQUNDLElBQUk7RUFFL0NNLFdBQVdBLENBQ2hCQyxJQUFVLEVBQ1ZDLGlCQUF5RCxFQUN6REMsZUFBMkMsRUFDM0NDLGNBQTBDLEVBQzFDQyxrQkFBNkMsRUFDN0NDLGVBQW1DLEVBQ25DO0lBRUEsTUFBTUMsT0FBTyxHQUFHcEIsU0FBUyxDQUFtRCxDQUFDLENBQUU7TUFDN0U7TUFDQXFCLGFBQWEsRUFBRSxLQUFLO01BRXBCQyxV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