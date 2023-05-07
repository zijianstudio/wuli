// Copyright 2021-2023, University of Colorado Boulder

/**
 * A checkbox that is linked to a count of the number of active clouds, and sets the number of clouds to either 0 or 1
 * based on the state of the checkbox.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Color, Path } from '../../../../scenery/js/imports.js';
import CloudNode from '../../common/view/CloudNode.js';
import GreenhouseEffectCheckbox from '../../common/view/GreenhouseEffectCheckbox.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
// constants
const CLOUD_ICON_WIDTH = 40;
class CloudCheckbox extends GreenhouseEffectCheckbox {
  constructor(cloudEnabledProperty, isShiningProperty, providedOptions) {
    // Create a shape to use for the cloud icon.  The shape generation seems to only work well for some ratios of width
    // to height, so change with caution.
    const unscaledCloudShape = CloudNode.createCloudShape(Vector2.ZERO, 170, 50);
    const cloudShapeScale = CLOUD_ICON_WIDTH / unscaledCloudShape.bounds.width;
    const scaledCloudShape = unscaledCloudShape.transformed(Matrix3.scale(cloudShapeScale, cloudShapeScale));
    const iconNode = new Path(scaledCloudShape, {
      stroke: Color.BLACK,
      fill: Color.WHITE
    });
    const options = optionize()({
      iconNode: iconNode,
      maxLabelTextWidth: 120,
      helpText: GreenhouseEffectStrings.a11y.cloudCheckboxHelpTextStringProperty
    }, providedOptions);
    super(cloudEnabledProperty, GreenhouseEffectStrings.cloudStringProperty, options);
  }
}
greenhouseEffect.register('CloudCheckbox', CloudCheckbox);
export default CloudCheckbox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiVmVjdG9yMiIsIm9wdGlvbml6ZSIsIkNvbG9yIiwiUGF0aCIsIkNsb3VkTm9kZSIsIkdyZWVuaG91c2VFZmZlY3RDaGVja2JveCIsImdyZWVuaG91c2VFZmZlY3QiLCJHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncyIsIkNMT1VEX0lDT05fV0lEVEgiLCJDbG91ZENoZWNrYm94IiwiY29uc3RydWN0b3IiLCJjbG91ZEVuYWJsZWRQcm9wZXJ0eSIsImlzU2hpbmluZ1Byb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwidW5zY2FsZWRDbG91ZFNoYXBlIiwiY3JlYXRlQ2xvdWRTaGFwZSIsIlpFUk8iLCJjbG91ZFNoYXBlU2NhbGUiLCJib3VuZHMiLCJ3aWR0aCIsInNjYWxlZENsb3VkU2hhcGUiLCJ0cmFuc2Zvcm1lZCIsInNjYWxlIiwiaWNvbk5vZGUiLCJzdHJva2UiLCJCTEFDSyIsImZpbGwiLCJXSElURSIsIm9wdGlvbnMiLCJtYXhMYWJlbFRleHRXaWR0aCIsImhlbHBUZXh0IiwiYTExeSIsImNsb3VkQ2hlY2tib3hIZWxwVGV4dFN0cmluZ1Byb3BlcnR5IiwiY2xvdWRTdHJpbmdQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2xvdWRDaGVja2JveC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGNoZWNrYm94IHRoYXQgaXMgbGlua2VkIHRvIGEgY291bnQgb2YgdGhlIG51bWJlciBvZiBhY3RpdmUgY2xvdWRzLCBhbmQgc2V0cyB0aGUgbnVtYmVyIG9mIGNsb3VkcyB0byBlaXRoZXIgMCBvciAxXHJcbiAqIGJhc2VkIG9uIHRoZSBzdGF0ZSBvZiB0aGUgY2hlY2tib3guXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDbG91ZE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQ2xvdWROb2RlLmpzJztcclxuaW1wb3J0IEdyZWVuaG91c2VFZmZlY3RDaGVja2JveCwgeyBHcmVlbmhvdXNlRWZmZWN0Q2hlY2tib3hPcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvR3JlZW5ob3VzZUVmZmVjdENoZWNrYm94LmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncyBmcm9tICcuLi8uLi9HcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuZXhwb3J0IHR5cGUgQ2xvdWRDaGVja2JveE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEdyZWVuaG91c2VFZmZlY3RDaGVja2JveE9wdGlvbnM7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQ0xPVURfSUNPTl9XSURUSCA9IDQwO1xyXG5cclxuY2xhc3MgQ2xvdWRDaGVja2JveCBleHRlbmRzIEdyZWVuaG91c2VFZmZlY3RDaGVja2JveCB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjbG91ZEVuYWJsZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBpc1NoaW5pbmdQcm9wZXJ0eTogQm9vbGVhblByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogR3JlZW5ob3VzZUVmZmVjdENoZWNrYm94T3B0aW9ucyApIHtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBzaGFwZSB0byB1c2UgZm9yIHRoZSBjbG91ZCBpY29uLiAgVGhlIHNoYXBlIGdlbmVyYXRpb24gc2VlbXMgdG8gb25seSB3b3JrIHdlbGwgZm9yIHNvbWUgcmF0aW9zIG9mIHdpZHRoXHJcbiAgICAvLyB0byBoZWlnaHQsIHNvIGNoYW5nZSB3aXRoIGNhdXRpb24uXHJcbiAgICBjb25zdCB1bnNjYWxlZENsb3VkU2hhcGU6IFNoYXBlID0gQ2xvdWROb2RlLmNyZWF0ZUNsb3VkU2hhcGUoIFZlY3RvcjIuWkVSTywgMTcwLCA1MCApO1xyXG4gICAgY29uc3QgY2xvdWRTaGFwZVNjYWxlOiBudW1iZXIgPSBDTE9VRF9JQ09OX1dJRFRIIC8gdW5zY2FsZWRDbG91ZFNoYXBlLmJvdW5kcy53aWR0aDtcclxuICAgIGNvbnN0IHNjYWxlZENsb3VkU2hhcGU6IFNoYXBlID0gdW5zY2FsZWRDbG91ZFNoYXBlLnRyYW5zZm9ybWVkKCBNYXRyaXgzLnNjYWxlKCBjbG91ZFNoYXBlU2NhbGUsIGNsb3VkU2hhcGVTY2FsZSApICk7XHJcbiAgICBjb25zdCBpY29uTm9kZTogUGF0aCA9IG5ldyBQYXRoKCBzY2FsZWRDbG91ZFNoYXBlLCB7XHJcbiAgICAgIHN0cm9rZTogQ29sb3IuQkxBQ0ssXHJcbiAgICAgIGZpbGw6IENvbG9yLldISVRFXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDbG91ZENoZWNrYm94T3B0aW9ucywgU2VsZk9wdGlvbnMsIEdyZWVuaG91c2VFZmZlY3RDaGVja2JveE9wdGlvbnM+KCkoIHtcclxuICAgICAgaWNvbk5vZGU6IGljb25Ob2RlLFxyXG4gICAgICBtYXhMYWJlbFRleHRXaWR0aDogMTIwLFxyXG4gICAgICBoZWxwVGV4dDogR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5jbG91ZENoZWNrYm94SGVscFRleHRTdHJpbmdQcm9wZXJ0eVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIGNsb3VkRW5hYmxlZFByb3BlcnR5LCBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5jbG91ZFN0cmluZ1Byb3BlcnR5LCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmVlbmhvdXNlRWZmZWN0LnJlZ2lzdGVyKCAnQ2xvdWRDaGVja2JveCcsIENsb3VkQ2hlY2tib3ggKTtcclxuZXhwb3J0IGRlZmF1bHQgQ2xvdWRDaGVja2JveDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFJQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFFbkQsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFDbkYsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQy9ELE9BQU9DLFNBQVMsTUFBTSxnQ0FBZ0M7QUFDdEQsT0FBT0Msd0JBQXdCLE1BQTJDLCtDQUErQztBQUN6SCxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsdUJBQXVCLE1BQU0sa0NBQWtDO0FBS3RFO0FBQ0EsTUFBTUMsZ0JBQWdCLEdBQUcsRUFBRTtBQUUzQixNQUFNQyxhQUFhLFNBQVNKLHdCQUF3QixDQUFDO0VBQzVDSyxXQUFXQSxDQUFFQyxvQkFBdUMsRUFDdkNDLGlCQUFrQyxFQUNsQ0MsZUFBaUQsRUFBRztJQUV0RTtJQUNBO0lBQ0EsTUFBTUMsa0JBQXlCLEdBQUdWLFNBQVMsQ0FBQ1csZ0JBQWdCLENBQUVmLE9BQU8sQ0FBQ2dCLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRyxDQUFDO0lBQ3JGLE1BQU1DLGVBQXVCLEdBQUdULGdCQUFnQixHQUFHTSxrQkFBa0IsQ0FBQ0ksTUFBTSxDQUFDQyxLQUFLO0lBQ2xGLE1BQU1DLGdCQUF1QixHQUFHTixrQkFBa0IsQ0FBQ08sV0FBVyxDQUFFdEIsT0FBTyxDQUFDdUIsS0FBSyxDQUFFTCxlQUFlLEVBQUVBLGVBQWdCLENBQUUsQ0FBQztJQUNuSCxNQUFNTSxRQUFjLEdBQUcsSUFBSXBCLElBQUksQ0FBRWlCLGdCQUFnQixFQUFFO01BQ2pESSxNQUFNLEVBQUV0QixLQUFLLENBQUN1QixLQUFLO01BQ25CQyxJQUFJLEVBQUV4QixLQUFLLENBQUN5QjtJQUNkLENBQUUsQ0FBQztJQUVILE1BQU1DLE9BQU8sR0FBRzNCLFNBQVMsQ0FBcUUsQ0FBQyxDQUFFO01BQy9Gc0IsUUFBUSxFQUFFQSxRQUFRO01BQ2xCTSxpQkFBaUIsRUFBRSxHQUFHO01BQ3RCQyxRQUFRLEVBQUV2Qix1QkFBdUIsQ0FBQ3dCLElBQUksQ0FBQ0M7SUFDekMsQ0FBQyxFQUFFbkIsZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUVGLG9CQUFvQixFQUFFSix1QkFBdUIsQ0FBQzBCLG1CQUFtQixFQUFFTCxPQUFRLENBQUM7RUFDckY7QUFDRjtBQUVBdEIsZ0JBQWdCLENBQUM0QixRQUFRLENBQUUsZUFBZSxFQUFFekIsYUFBYyxDQUFDO0FBQzNELGVBQWVBLGFBQWEifQ==