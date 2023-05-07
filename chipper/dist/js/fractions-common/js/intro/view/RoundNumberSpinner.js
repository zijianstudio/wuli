// Copyright 2018-2022, University of Colorado Boulder

/**
 * Displays an up/down control for incrementing/decrementing a Property
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { VBox } from '../../../../scenery/js/imports.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import RoundArrowButton from '../../common/view/RoundArrowButton.js';
import fractionsCommon from '../../fractionsCommon.js';
class RoundNumberSpinner extends VBox {
  /**
   * @param {Property.<number>} numberProperty
   * @param {ReadOnlyProperty.<boolean>} increaseEnabledProperty
   * @param {ReadOnlyProperty.<boolean>} decreaseEnabledProperty
   * @param {Object} [options]
   */
  constructor(numberProperty, increaseEnabledProperty, decreaseEnabledProperty, options) {
    assert && assert(numberProperty instanceof Property);
    assert && assert(increaseEnabledProperty instanceof ReadOnlyProperty);
    assert && assert(decreaseEnabledProperty instanceof ReadOnlyProperty);
    options = merge({
      baseColor: FractionsCommonColors.yellowRoundArrowButtonProperty,
      rotation: 0,
      spacing: 3,
      longTouchDilation: 12,
      sideTouchDilation: 12,
      touchRadius: 10
    }, options);
    super(options);

    // @private {RoundArrowButton}
    this.increaseButton = new RoundArrowButton({
      rotation: -options.rotation,
      baseColor: options.baseColor,
      arrowRotation: options.rotation,
      enabledProperty: increaseEnabledProperty,
      listener: () => {
        if (increaseEnabledProperty.value) {
          numberProperty.value++;
        }
      }
    });

    // @private {RoundArrowButton}
    this.decreaseButton = new RoundArrowButton({
      rotation: -options.rotation,
      baseColor: options.baseColor,
      arrowRotation: Math.PI + options.rotation,
      enabledProperty: decreaseEnabledProperty,
      listener: () => {
        if (decreaseEnabledProperty.value) {
          numberProperty.value--;
        }
      }
    });
    const rotationMatrix = Matrix3.rotation2(options.rotation);
    this.increaseButton.touchArea = Shape.boundsOffsetWithRadii(this.increaseButton.localBounds, {
      left: options.sideTouchDilation,
      right: options.sideTouchDilation,
      top: options.longTouchDilation,
      bottom: options.spacing / 2
    }, {
      topLeft: options.touchRadius,
      topRight: options.touchRadius
    }).transformed(rotationMatrix);
    this.decreaseButton.touchArea = Shape.boundsOffsetWithRadii(this.decreaseButton.localBounds, {
      left: options.sideTouchDilation,
      right: options.sideTouchDilation,
      top: options.spacing / 2,
      bottom: options.longTouchDilation
    }, {
      bottomLeft: options.touchRadius,
      bottomRight: options.touchRadius
    }).transformed(rotationMatrix);
    this.children = [this.increaseButton, this.decreaseButton];
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.increaseButton.dispose();
    this.decreaseButton.dispose();
    super.dispose();
  }
}
fractionsCommon.register('RoundNumberSpinner', RoundNumberSpinner);
export default RoundNumberSpinner;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlJlYWRPbmx5UHJvcGVydHkiLCJNYXRyaXgzIiwiU2hhcGUiLCJtZXJnZSIsIlZCb3giLCJGcmFjdGlvbnNDb21tb25Db2xvcnMiLCJSb3VuZEFycm93QnV0dG9uIiwiZnJhY3Rpb25zQ29tbW9uIiwiUm91bmROdW1iZXJTcGlubmVyIiwiY29uc3RydWN0b3IiLCJudW1iZXJQcm9wZXJ0eSIsImluY3JlYXNlRW5hYmxlZFByb3BlcnR5IiwiZGVjcmVhc2VFbmFibGVkUHJvcGVydHkiLCJvcHRpb25zIiwiYXNzZXJ0IiwiYmFzZUNvbG9yIiwieWVsbG93Um91bmRBcnJvd0J1dHRvblByb3BlcnR5Iiwicm90YXRpb24iLCJzcGFjaW5nIiwibG9uZ1RvdWNoRGlsYXRpb24iLCJzaWRlVG91Y2hEaWxhdGlvbiIsInRvdWNoUmFkaXVzIiwiaW5jcmVhc2VCdXR0b24iLCJhcnJvd1JvdGF0aW9uIiwiZW5hYmxlZFByb3BlcnR5IiwibGlzdGVuZXIiLCJ2YWx1ZSIsImRlY3JlYXNlQnV0dG9uIiwiTWF0aCIsIlBJIiwicm90YXRpb25NYXRyaXgiLCJyb3RhdGlvbjIiLCJ0b3VjaEFyZWEiLCJib3VuZHNPZmZzZXRXaXRoUmFkaWkiLCJsb2NhbEJvdW5kcyIsImxlZnQiLCJyaWdodCIsInRvcCIsImJvdHRvbSIsInRvcExlZnQiLCJ0b3BSaWdodCIsInRyYW5zZm9ybWVkIiwiYm90dG9tTGVmdCIsImJvdHRvbVJpZ2h0IiwiY2hpbGRyZW4iLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSb3VuZE51bWJlclNwaW5uZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGlzcGxheXMgYW4gdXAvZG93biBjb250cm9sIGZvciBpbmNyZW1lbnRpbmcvZGVjcmVtZW50aW5nIGEgUHJvcGVydHlcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9GcmFjdGlvbnNDb21tb25Db2xvcnMuanMnO1xyXG5pbXBvcnQgUm91bmRBcnJvd0J1dHRvbiBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Sb3VuZEFycm93QnV0dG9uLmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0NvbW1vbiBmcm9tICcuLi8uLi9mcmFjdGlvbnNDb21tb24uanMnO1xyXG5cclxuY2xhc3MgUm91bmROdW1iZXJTcGlubmVyIGV4dGVuZHMgVkJveCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48bnVtYmVyPn0gbnVtYmVyUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1JlYWRPbmx5UHJvcGVydHkuPGJvb2xlYW4+fSBpbmNyZWFzZUVuYWJsZWRQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UmVhZE9ubHlQcm9wZXJ0eS48Ym9vbGVhbj59IGRlY3JlYXNlRW5hYmxlZFByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBudW1iZXJQcm9wZXJ0eSwgaW5jcmVhc2VFbmFibGVkUHJvcGVydHksIGRlY3JlYXNlRW5hYmxlZFByb3BlcnR5LCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbnVtYmVyUHJvcGVydHkgaW5zdGFuY2VvZiBQcm9wZXJ0eSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5jcmVhc2VFbmFibGVkUHJvcGVydHkgaW5zdGFuY2VvZiBSZWFkT25seVByb3BlcnR5ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkZWNyZWFzZUVuYWJsZWRQcm9wZXJ0eSBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgYmFzZUNvbG9yOiBGcmFjdGlvbnNDb21tb25Db2xvcnMueWVsbG93Um91bmRBcnJvd0J1dHRvblByb3BlcnR5LFxyXG4gICAgICByb3RhdGlvbjogMCxcclxuICAgICAgc3BhY2luZzogMyxcclxuICAgICAgbG9uZ1RvdWNoRGlsYXRpb246IDEyLFxyXG4gICAgICBzaWRlVG91Y2hEaWxhdGlvbjogMTIsXHJcbiAgICAgIHRvdWNoUmFkaXVzOiAxMFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1JvdW5kQXJyb3dCdXR0b259XHJcbiAgICB0aGlzLmluY3JlYXNlQnV0dG9uID0gbmV3IFJvdW5kQXJyb3dCdXR0b24oIHtcclxuICAgICAgcm90YXRpb246IC1vcHRpb25zLnJvdGF0aW9uLFxyXG4gICAgICBiYXNlQ29sb3I6IG9wdGlvbnMuYmFzZUNvbG9yLFxyXG4gICAgICBhcnJvd1JvdGF0aW9uOiBvcHRpb25zLnJvdGF0aW9uLFxyXG4gICAgICBlbmFibGVkUHJvcGVydHk6IGluY3JlYXNlRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIGlmICggaW5jcmVhc2VFbmFibGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICBudW1iZXJQcm9wZXJ0eS52YWx1ZSsrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtSb3VuZEFycm93QnV0dG9ufVxyXG4gICAgdGhpcy5kZWNyZWFzZUJ1dHRvbiA9IG5ldyBSb3VuZEFycm93QnV0dG9uKCB7XHJcbiAgICAgIHJvdGF0aW9uOiAtb3B0aW9ucy5yb3RhdGlvbixcclxuICAgICAgYmFzZUNvbG9yOiBvcHRpb25zLmJhc2VDb2xvcixcclxuICAgICAgYXJyb3dSb3RhdGlvbjogTWF0aC5QSSArIG9wdGlvbnMucm90YXRpb24sXHJcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogZGVjcmVhc2VFbmFibGVkUHJvcGVydHksXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCBkZWNyZWFzZUVuYWJsZWRQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgIG51bWJlclByb3BlcnR5LnZhbHVlLS07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgcm90YXRpb25NYXRyaXggPSBNYXRyaXgzLnJvdGF0aW9uMiggb3B0aW9ucy5yb3RhdGlvbiApO1xyXG5cclxuICAgIHRoaXMuaW5jcmVhc2VCdXR0b24udG91Y2hBcmVhID0gU2hhcGUuYm91bmRzT2Zmc2V0V2l0aFJhZGlpKCB0aGlzLmluY3JlYXNlQnV0dG9uLmxvY2FsQm91bmRzLCB7XHJcbiAgICAgIGxlZnQ6IG9wdGlvbnMuc2lkZVRvdWNoRGlsYXRpb24sXHJcbiAgICAgIHJpZ2h0OiBvcHRpb25zLnNpZGVUb3VjaERpbGF0aW9uLFxyXG4gICAgICB0b3A6IG9wdGlvbnMubG9uZ1RvdWNoRGlsYXRpb24sXHJcbiAgICAgIGJvdHRvbTogb3B0aW9ucy5zcGFjaW5nIC8gMlxyXG4gICAgfSwge1xyXG4gICAgICB0b3BMZWZ0OiBvcHRpb25zLnRvdWNoUmFkaXVzLFxyXG4gICAgICB0b3BSaWdodDogb3B0aW9ucy50b3VjaFJhZGl1c1xyXG4gICAgfSApLnRyYW5zZm9ybWVkKCByb3RhdGlvbk1hdHJpeCApO1xyXG5cclxuICAgIHRoaXMuZGVjcmVhc2VCdXR0b24udG91Y2hBcmVhID0gU2hhcGUuYm91bmRzT2Zmc2V0V2l0aFJhZGlpKCB0aGlzLmRlY3JlYXNlQnV0dG9uLmxvY2FsQm91bmRzLCB7XHJcbiAgICAgIGxlZnQ6IG9wdGlvbnMuc2lkZVRvdWNoRGlsYXRpb24sXHJcbiAgICAgIHJpZ2h0OiBvcHRpb25zLnNpZGVUb3VjaERpbGF0aW9uLFxyXG4gICAgICB0b3A6IG9wdGlvbnMuc3BhY2luZyAvIDIsXHJcbiAgICAgIGJvdHRvbTogb3B0aW9ucy5sb25nVG91Y2hEaWxhdGlvblxyXG4gICAgfSwge1xyXG4gICAgICBib3R0b21MZWZ0OiBvcHRpb25zLnRvdWNoUmFkaXVzLFxyXG4gICAgICBib3R0b21SaWdodDogb3B0aW9ucy50b3VjaFJhZGl1c1xyXG4gICAgfSApLnRyYW5zZm9ybWVkKCByb3RhdGlvbk1hdHJpeCApO1xyXG5cclxuICAgIHRoaXMuY2hpbGRyZW4gPSBbXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VCdXR0b24sXHJcbiAgICAgIHRoaXMuZGVjcmVhc2VCdXR0b25cclxuICAgIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5pbmNyZWFzZUJ1dHRvbi5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmRlY3JlYXNlQnV0dG9uLmRpc3Bvc2UoKTtcclxuXHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdSb3VuZE51bWJlclNwaW5uZXInLCBSb3VuZE51bWJlclNwaW5uZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgUm91bmROdW1iZXJTcGlubmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLGdCQUFnQixNQUFNLHlDQUF5QztBQUN0RSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLHFCQUFxQixNQUFNLDRDQUE0QztBQUM5RSxPQUFPQyxnQkFBZ0IsTUFBTSx1Q0FBdUM7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUV0RCxNQUFNQyxrQkFBa0IsU0FBU0osSUFBSSxDQUFDO0VBQ3BDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSyxXQUFXQSxDQUFFQyxjQUFjLEVBQUVDLHVCQUF1QixFQUFFQyx1QkFBdUIsRUFBRUMsT0FBTyxFQUFHO0lBQ3ZGQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUosY0FBYyxZQUFZWCxRQUFTLENBQUM7SUFDdERlLE1BQU0sSUFBSUEsTUFBTSxDQUFFSCx1QkFBdUIsWUFBWVgsZ0JBQWlCLENBQUM7SUFDdkVjLE1BQU0sSUFBSUEsTUFBTSxDQUFFRix1QkFBdUIsWUFBWVosZ0JBQWlCLENBQUM7SUFFdkVhLE9BQU8sR0FBR1YsS0FBSyxDQUFFO01BQ2ZZLFNBQVMsRUFBRVYscUJBQXFCLENBQUNXLDhCQUE4QjtNQUMvREMsUUFBUSxFQUFFLENBQUM7TUFDWEMsT0FBTyxFQUFFLENBQUM7TUFDVkMsaUJBQWlCLEVBQUUsRUFBRTtNQUNyQkMsaUJBQWlCLEVBQUUsRUFBRTtNQUNyQkMsV0FBVyxFQUFFO0lBQ2YsQ0FBQyxFQUFFUixPQUFRLENBQUM7SUFFWixLQUFLLENBQUVBLE9BQVEsQ0FBQzs7SUFFaEI7SUFDQSxJQUFJLENBQUNTLGNBQWMsR0FBRyxJQUFJaEIsZ0JBQWdCLENBQUU7TUFDMUNXLFFBQVEsRUFBRSxDQUFDSixPQUFPLENBQUNJLFFBQVE7TUFDM0JGLFNBQVMsRUFBRUYsT0FBTyxDQUFDRSxTQUFTO01BQzVCUSxhQUFhLEVBQUVWLE9BQU8sQ0FBQ0ksUUFBUTtNQUMvQk8sZUFBZSxFQUFFYix1QkFBdUI7TUFDeENjLFFBQVEsRUFBRUEsQ0FBQSxLQUFNO1FBQ2QsSUFBS2QsdUJBQXVCLENBQUNlLEtBQUssRUFBRztVQUNuQ2hCLGNBQWMsQ0FBQ2dCLEtBQUssRUFBRTtRQUN4QjtNQUNGO0lBQ0YsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDQyxjQUFjLEdBQUcsSUFBSXJCLGdCQUFnQixDQUFFO01BQzFDVyxRQUFRLEVBQUUsQ0FBQ0osT0FBTyxDQUFDSSxRQUFRO01BQzNCRixTQUFTLEVBQUVGLE9BQU8sQ0FBQ0UsU0FBUztNQUM1QlEsYUFBYSxFQUFFSyxJQUFJLENBQUNDLEVBQUUsR0FBR2hCLE9BQU8sQ0FBQ0ksUUFBUTtNQUN6Q08sZUFBZSxFQUFFWix1QkFBdUI7TUFDeENhLFFBQVEsRUFBRUEsQ0FBQSxLQUFNO1FBQ2QsSUFBS2IsdUJBQXVCLENBQUNjLEtBQUssRUFBRztVQUNuQ2hCLGNBQWMsQ0FBQ2dCLEtBQUssRUFBRTtRQUN4QjtNQUNGO0lBQ0YsQ0FBRSxDQUFDO0lBRUgsTUFBTUksY0FBYyxHQUFHN0IsT0FBTyxDQUFDOEIsU0FBUyxDQUFFbEIsT0FBTyxDQUFDSSxRQUFTLENBQUM7SUFFNUQsSUFBSSxDQUFDSyxjQUFjLENBQUNVLFNBQVMsR0FBRzlCLEtBQUssQ0FBQytCLHFCQUFxQixDQUFFLElBQUksQ0FBQ1gsY0FBYyxDQUFDWSxXQUFXLEVBQUU7TUFDNUZDLElBQUksRUFBRXRCLE9BQU8sQ0FBQ08saUJBQWlCO01BQy9CZ0IsS0FBSyxFQUFFdkIsT0FBTyxDQUFDTyxpQkFBaUI7TUFDaENpQixHQUFHLEVBQUV4QixPQUFPLENBQUNNLGlCQUFpQjtNQUM5Qm1CLE1BQU0sRUFBRXpCLE9BQU8sQ0FBQ0ssT0FBTyxHQUFHO0lBQzVCLENBQUMsRUFBRTtNQUNEcUIsT0FBTyxFQUFFMUIsT0FBTyxDQUFDUSxXQUFXO01BQzVCbUIsUUFBUSxFQUFFM0IsT0FBTyxDQUFDUTtJQUNwQixDQUFFLENBQUMsQ0FBQ29CLFdBQVcsQ0FBRVgsY0FBZSxDQUFDO0lBRWpDLElBQUksQ0FBQ0gsY0FBYyxDQUFDSyxTQUFTLEdBQUc5QixLQUFLLENBQUMrQixxQkFBcUIsQ0FBRSxJQUFJLENBQUNOLGNBQWMsQ0FBQ08sV0FBVyxFQUFFO01BQzVGQyxJQUFJLEVBQUV0QixPQUFPLENBQUNPLGlCQUFpQjtNQUMvQmdCLEtBQUssRUFBRXZCLE9BQU8sQ0FBQ08saUJBQWlCO01BQ2hDaUIsR0FBRyxFQUFFeEIsT0FBTyxDQUFDSyxPQUFPLEdBQUcsQ0FBQztNQUN4Qm9CLE1BQU0sRUFBRXpCLE9BQU8sQ0FBQ007SUFDbEIsQ0FBQyxFQUFFO01BQ0R1QixVQUFVLEVBQUU3QixPQUFPLENBQUNRLFdBQVc7TUFDL0JzQixXQUFXLEVBQUU5QixPQUFPLENBQUNRO0lBQ3ZCLENBQUUsQ0FBQyxDQUFDb0IsV0FBVyxDQUFFWCxjQUFlLENBQUM7SUFFakMsSUFBSSxDQUFDYyxRQUFRLEdBQUcsQ0FDZCxJQUFJLENBQUN0QixjQUFjLEVBQ25CLElBQUksQ0FBQ0ssY0FBYyxDQUNwQjtFQUNIOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRWtCLE9BQU9BLENBQUEsRUFBRztJQUNSLElBQUksQ0FBQ3ZCLGNBQWMsQ0FBQ3VCLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLElBQUksQ0FBQ2xCLGNBQWMsQ0FBQ2tCLE9BQU8sQ0FBQyxDQUFDO0lBRTdCLEtBQUssQ0FBQ0EsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBdEMsZUFBZSxDQUFDdUMsUUFBUSxDQUFFLG9CQUFvQixFQUFFdEMsa0JBQW1CLENBQUM7QUFDcEUsZUFBZUEsa0JBQWtCIn0=