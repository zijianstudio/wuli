// Copyright 2018-2023, University of Colorado Boulder
// @ts-nocheck
/**
 * Shows the "pulse" vs "continuous" radio buttons.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import waveInterference from '../../waveInterference.js';
import Scene from '../model/Scene.js';
import DisturbanceTypeIconNode from './DisturbanceTypeIconNode.js';
class DisturbanceTypeRadioButtonGroup extends RectangularRadioButtonGroup {
  constructor(disturbanceTypeProperty, options) {
    super(disturbanceTypeProperty, [{
      value: Scene.DisturbanceType.CONTINUOUS,
      createNode: () => new DisturbanceTypeIconNode(Scene.DisturbanceType.CONTINUOUS)
    }, {
      value: Scene.DisturbanceType.PULSE,
      createNode: () => new DisturbanceTypeIconNode(Scene.DisturbanceType.PULSE)
    }], merge({
      orientation: 'vertical',
      radioButtonOptions: {
        baseColor: 'white',
        xMargin: 1,
        yMargin: 8,
        buttonAppearanceStrategyOptions: {
          selectedLineWidth: 2,
          selectedStroke: 'blue',
          deselectedContentOpacity: 0.4
        }
      }
    }, options));
  }
}
waveInterference.register('DisturbanceTypeRadioButtonGroup', DisturbanceTypeRadioButtonGroup);
export default DisturbanceTypeRadioButtonGroup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCIsIndhdmVJbnRlcmZlcmVuY2UiLCJTY2VuZSIsIkRpc3R1cmJhbmNlVHlwZUljb25Ob2RlIiwiRGlzdHVyYmFuY2VUeXBlUmFkaW9CdXR0b25Hcm91cCIsImNvbnN0cnVjdG9yIiwiZGlzdHVyYmFuY2VUeXBlUHJvcGVydHkiLCJvcHRpb25zIiwidmFsdWUiLCJEaXN0dXJiYW5jZVR5cGUiLCJDT05USU5VT1VTIiwiY3JlYXRlTm9kZSIsIlBVTFNFIiwib3JpZW50YXRpb24iLCJyYWRpb0J1dHRvbk9wdGlvbnMiLCJiYXNlQ29sb3IiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnMiLCJzZWxlY3RlZExpbmVXaWR0aCIsInNlbGVjdGVkU3Ryb2tlIiwiZGVzZWxlY3RlZENvbnRlbnRPcGFjaXR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEaXN0dXJiYW5jZVR5cGVSYWRpb0J1dHRvbkdyb3VwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vLyBAdHMtbm9jaGVja1xyXG4vKipcclxuICogU2hvd3MgdGhlIFwicHVsc2VcIiB2cyBcImNvbnRpbnVvdXNcIiByYWRpbyBidXR0b25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCB3YXZlSW50ZXJmZXJlbmNlIGZyb20gJy4uLy4uL3dhdmVJbnRlcmZlcmVuY2UuanMnO1xyXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vbW9kZWwvU2NlbmUuanMnO1xyXG5pbXBvcnQgRGlzdHVyYmFuY2VUeXBlSWNvbk5vZGUgZnJvbSAnLi9EaXN0dXJiYW5jZVR5cGVJY29uTm9kZS5qcyc7XHJcblxyXG5jbGFzcyBEaXN0dXJiYW5jZVR5cGVSYWRpb0J1dHRvbkdyb3VwIGV4dGVuZHMgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkaXN0dXJiYW5jZVR5cGVQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCBkaXN0dXJiYW5jZVR5cGVQcm9wZXJ0eSwgWyB7XHJcbiAgICAgIHZhbHVlOiBTY2VuZS5EaXN0dXJiYW5jZVR5cGUuQ09OVElOVU9VUyxcclxuICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IERpc3R1cmJhbmNlVHlwZUljb25Ob2RlKCBTY2VuZS5EaXN0dXJiYW5jZVR5cGUuQ09OVElOVU9VUyApXHJcbiAgICB9LCB7XHJcbiAgICAgIHZhbHVlOiBTY2VuZS5EaXN0dXJiYW5jZVR5cGUuUFVMU0UsXHJcbiAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBEaXN0dXJiYW5jZVR5cGVJY29uTm9kZSggU2NlbmUuRGlzdHVyYmFuY2VUeXBlLlBVTFNFIClcclxuICAgIH0gXSwgbWVyZ2UoIHtcclxuICAgICAgb3JpZW50YXRpb246ICd2ZXJ0aWNhbCcsXHJcbiAgICAgIHJhZGlvQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIGJhc2VDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICB4TWFyZ2luOiAxLFxyXG4gICAgICAgIHlNYXJnaW46IDgsXHJcbiAgICAgICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9uczoge1xyXG4gICAgICAgICAgc2VsZWN0ZWRMaW5lV2lkdGg6IDIsXHJcbiAgICAgICAgICBzZWxlY3RlZFN0cm9rZTogJ2JsdWUnLFxyXG4gICAgICAgICAgZGVzZWxlY3RlZENvbnRlbnRPcGFjaXR5OiAwLjRcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIG9wdGlvbnMgKSApO1xyXG4gIH1cclxufVxyXG5cclxud2F2ZUludGVyZmVyZW5jZS5yZWdpc3RlciggJ0Rpc3R1cmJhbmNlVHlwZVJhZGlvQnV0dG9uR3JvdXAnLCBEaXN0dXJiYW5jZVR5cGVSYWRpb0J1dHRvbkdyb3VwICk7XHJcbmV4cG9ydCBkZWZhdWx0IERpc3R1cmJhbmNlVHlwZVJhZGlvQnV0dG9uR3JvdXA7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLDJCQUEyQixNQUFNLDJEQUEyRDtBQUNuRyxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsS0FBSyxNQUFNLG1CQUFtQjtBQUNyQyxPQUFPQyx1QkFBdUIsTUFBTSw4QkFBOEI7QUFFbEUsTUFBTUMsK0JBQStCLFNBQVNKLDJCQUEyQixDQUFDO0VBRWpFSyxXQUFXQSxDQUFFQyx1QkFBdUIsRUFBRUMsT0FBTyxFQUFHO0lBQ3JELEtBQUssQ0FBRUQsdUJBQXVCLEVBQUUsQ0FBRTtNQUNoQ0UsS0FBSyxFQUFFTixLQUFLLENBQUNPLGVBQWUsQ0FBQ0MsVUFBVTtNQUN2Q0MsVUFBVSxFQUFFQSxDQUFBLEtBQU0sSUFBSVIsdUJBQXVCLENBQUVELEtBQUssQ0FBQ08sZUFBZSxDQUFDQyxVQUFXO0lBQ2xGLENBQUMsRUFBRTtNQUNERixLQUFLLEVBQUVOLEtBQUssQ0FBQ08sZUFBZSxDQUFDRyxLQUFLO01BQ2xDRCxVQUFVLEVBQUVBLENBQUEsS0FBTSxJQUFJUix1QkFBdUIsQ0FBRUQsS0FBSyxDQUFDTyxlQUFlLENBQUNHLEtBQU07SUFDN0UsQ0FBQyxDQUFFLEVBQUViLEtBQUssQ0FBRTtNQUNWYyxXQUFXLEVBQUUsVUFBVTtNQUN2QkMsa0JBQWtCLEVBQUU7UUFDbEJDLFNBQVMsRUFBRSxPQUFPO1FBQ2xCQyxPQUFPLEVBQUUsQ0FBQztRQUNWQyxPQUFPLEVBQUUsQ0FBQztRQUNWQywrQkFBK0IsRUFBRTtVQUMvQkMsaUJBQWlCLEVBQUUsQ0FBQztVQUNwQkMsY0FBYyxFQUFFLE1BQU07VUFDdEJDLHdCQUF3QixFQUFFO1FBQzVCO01BQ0Y7SUFDRixDQUFDLEVBQUVkLE9BQVEsQ0FBRSxDQUFDO0VBQ2hCO0FBQ0Y7QUFFQU4sZ0JBQWdCLENBQUNxQixRQUFRLENBQUUsaUNBQWlDLEVBQUVsQiwrQkFBZ0MsQ0FBQztBQUMvRixlQUFlQSwrQkFBK0IifQ==