// Copyright 2021-2022, University of Colorado Boulder

/**
 * Checkbox that controls whether the surface temperature is displayed in the sim.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { LinearGradient, Rectangle } from '../../../../scenery/js/imports.js';
import GreenhouseEffectCheckbox from '../../common/view/GreenhouseEffectCheckbox.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import TemperatureDescriber from '../../common/view/describers/TemperatureDescriber.js';
class SurfaceTemperatureCheckbox extends GreenhouseEffectCheckbox {
  constructor(property, model, tandem) {
    const iconWidth = 15;

    // temporary icon, something else will eventually be added
    const iconNode = new Rectangle(0, 0, iconWidth, iconWidth, {
      fill: new LinearGradient(0, 0, 0, iconWidth).addColorStop(0.1, PhetColorScheme.RED_COLORBLIND).addColorStop(0.7, '#22CC00').addColorStop(1, '#1A9900')
    });
    const checkedUtterance = new Utterance();
    model.surfaceTemperatureKelvinProperty.link(temperatureKelvin => {
      checkedUtterance.alert = TemperatureDescriber.getQualitativeSurfaceTemperatureDescriptionString(temperatureKelvin, model.concentrationControlModeProperty.value, model.dateProperty.value);
    });
    super(property, GreenhouseEffectStrings.showSurfaceTemperatureStringProperty, {
      iconNode: iconNode,
      // pdom
      helpText: GreenhouseEffectStrings.a11y.showSurfaceTemperature.helpTextStringProperty,
      checkedContextResponse: checkedUtterance,
      uncheckedContextResponse: 'Surface glow hidden.',
      // phetio
      tandem: tandem
    });
  }
}
greenhouseEffect.register('SurfaceTemperatureCheckbox', SurfaceTemperatureCheckbox);
export default SurfaceTemperatureCheckbox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Q29sb3JTY2hlbWUiLCJMaW5lYXJHcmFkaWVudCIsIlJlY3RhbmdsZSIsIkdyZWVuaG91c2VFZmZlY3RDaGVja2JveCIsImdyZWVuaG91c2VFZmZlY3QiLCJHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncyIsIlV0dGVyYW5jZSIsIlRlbXBlcmF0dXJlRGVzY3JpYmVyIiwiU3VyZmFjZVRlbXBlcmF0dXJlQ2hlY2tib3giLCJjb25zdHJ1Y3RvciIsInByb3BlcnR5IiwibW9kZWwiLCJ0YW5kZW0iLCJpY29uV2lkdGgiLCJpY29uTm9kZSIsImZpbGwiLCJhZGRDb2xvclN0b3AiLCJSRURfQ09MT1JCTElORCIsImNoZWNrZWRVdHRlcmFuY2UiLCJzdXJmYWNlVGVtcGVyYXR1cmVLZWx2aW5Qcm9wZXJ0eSIsImxpbmsiLCJ0ZW1wZXJhdHVyZUtlbHZpbiIsImFsZXJ0IiwiZ2V0UXVhbGl0YXRpdmVTdXJmYWNlVGVtcGVyYXR1cmVEZXNjcmlwdGlvblN0cmluZyIsImNvbmNlbnRyYXRpb25Db250cm9sTW9kZVByb3BlcnR5IiwidmFsdWUiLCJkYXRlUHJvcGVydHkiLCJzaG93U3VyZmFjZVRlbXBlcmF0dXJlU3RyaW5nUHJvcGVydHkiLCJoZWxwVGV4dCIsImExMXkiLCJzaG93U3VyZmFjZVRlbXBlcmF0dXJlIiwiaGVscFRleHRTdHJpbmdQcm9wZXJ0eSIsImNoZWNrZWRDb250ZXh0UmVzcG9uc2UiLCJ1bmNoZWNrZWRDb250ZXh0UmVzcG9uc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN1cmZhY2VUZW1wZXJhdHVyZUNoZWNrYm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENoZWNrYm94IHRoYXQgY29udHJvbHMgd2hldGhlciB0aGUgc3VyZmFjZSB0ZW1wZXJhdHVyZSBpcyBkaXNwbGF5ZWQgaW4gdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFBoZXRDb2xvclNjaGVtZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldENvbG9yU2NoZW1lLmpzJztcclxuaW1wb3J0IHsgTGluZWFyR3JhZGllbnQsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0Q2hlY2tib3ggZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvR3JlZW5ob3VzZUVmZmVjdENoZWNrYm94LmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncyBmcm9tICcuLi8uLi9HcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFV0dGVyYW5jZSBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcclxuaW1wb3J0IFRlbXBlcmF0dXJlRGVzY3JpYmVyIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L2Rlc2NyaWJlcnMvVGVtcGVyYXR1cmVEZXNjcmliZXIuanMnO1xyXG5pbXBvcnQgQ29uY2VudHJhdGlvbk1vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Db25jZW50cmF0aW9uTW9kZWwuanMnO1xyXG5cclxuY2xhc3MgU3VyZmFjZVRlbXBlcmF0dXJlQ2hlY2tib3ggZXh0ZW5kcyBHcmVlbmhvdXNlRWZmZWN0Q2hlY2tib3gge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCBtb2RlbDogQ29uY2VudHJhdGlvbk1vZGVsLCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCBpY29uV2lkdGggPSAxNTtcclxuXHJcbiAgICAvLyB0ZW1wb3JhcnkgaWNvbiwgc29tZXRoaW5nIGVsc2Ugd2lsbCBldmVudHVhbGx5IGJlIGFkZGVkXHJcbiAgICBjb25zdCBpY29uTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIGljb25XaWR0aCwgaWNvbldpZHRoLCB7XHJcbiAgICAgIGZpbGw6IG5ldyBMaW5lYXJHcmFkaWVudCggMCwgMCwgMCwgaWNvbldpZHRoIClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjEsIFBoZXRDb2xvclNjaGVtZS5SRURfQ09MT1JCTElORCApXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMC43LCAnIzIyQ0MwMCcgKVxyXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDEsICcjMUE5OTAwJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY2hlY2tlZFV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoKTtcclxuICAgIG1vZGVsLnN1cmZhY2VUZW1wZXJhdHVyZUtlbHZpblByb3BlcnR5LmxpbmsoIHRlbXBlcmF0dXJlS2VsdmluID0+IHtcclxuICAgICAgY2hlY2tlZFV0dGVyYW5jZS5hbGVydCA9IFRlbXBlcmF0dXJlRGVzY3JpYmVyLmdldFF1YWxpdGF0aXZlU3VyZmFjZVRlbXBlcmF0dXJlRGVzY3JpcHRpb25TdHJpbmcoXHJcbiAgICAgICAgdGVtcGVyYXR1cmVLZWx2aW4sXHJcbiAgICAgICAgbW9kZWwuY29uY2VudHJhdGlvbkNvbnRyb2xNb2RlUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgbW9kZWwuZGF0ZVByb3BlcnR5LnZhbHVlXHJcbiAgICAgICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIHByb3BlcnR5LCBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5zaG93U3VyZmFjZVRlbXBlcmF0dXJlU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgaWNvbk5vZGU6IGljb25Ob2RlLFxyXG5cclxuICAgICAgLy8gcGRvbVxyXG4gICAgICBoZWxwVGV4dDogR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zaG93U3VyZmFjZVRlbXBlcmF0dXJlLmhlbHBUZXh0U3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGNoZWNrZWRDb250ZXh0UmVzcG9uc2U6IGNoZWNrZWRVdHRlcmFuY2UsXHJcbiAgICAgIHVuY2hlY2tlZENvbnRleHRSZXNwb25zZTogJ1N1cmZhY2UgZ2xvdyBoaWRkZW4uJyxcclxuXHJcbiAgICAgIC8vIHBoZXRpb1xyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ1N1cmZhY2VUZW1wZXJhdHVyZUNoZWNrYm94JywgU3VyZmFjZVRlbXBlcmF0dXJlQ2hlY2tib3ggKTtcclxuZXhwb3J0IGRlZmF1bHQgU3VyZmFjZVRlbXBlcmF0dXJlQ2hlY2tib3g7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLFNBQVNDLGNBQWMsRUFBRUMsU0FBUyxRQUFRLG1DQUFtQztBQUM3RSxPQUFPQyx3QkFBd0IsTUFBTSwrQ0FBK0M7QUFDcEYsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUd0RSxPQUFPQyxTQUFTLE1BQU0sNkNBQTZDO0FBQ25FLE9BQU9DLG9CQUFvQixNQUFNLHNEQUFzRDtBQUd2RixNQUFNQywwQkFBMEIsU0FBU0wsd0JBQXdCLENBQUM7RUFDekRNLFdBQVdBLENBQUVDLFFBQTJCLEVBQUVDLEtBQXlCLEVBQUVDLE1BQWMsRUFBRztJQUUzRixNQUFNQyxTQUFTLEdBQUcsRUFBRTs7SUFFcEI7SUFDQSxNQUFNQyxRQUFRLEdBQUcsSUFBSVosU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVXLFNBQVMsRUFBRUEsU0FBUyxFQUFFO01BQzFERSxJQUFJLEVBQUUsSUFBSWQsY0FBYyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFWSxTQUFVLENBQUMsQ0FDM0NHLFlBQVksQ0FBRSxHQUFHLEVBQUVoQixlQUFlLENBQUNpQixjQUFlLENBQUMsQ0FDbkRELFlBQVksQ0FBRSxHQUFHLEVBQUUsU0FBVSxDQUFDLENBQzlCQSxZQUFZLENBQUUsQ0FBQyxFQUFFLFNBQVU7SUFDaEMsQ0FBRSxDQUFDO0lBRUgsTUFBTUUsZ0JBQWdCLEdBQUcsSUFBSVosU0FBUyxDQUFDLENBQUM7SUFDeENLLEtBQUssQ0FBQ1EsZ0NBQWdDLENBQUNDLElBQUksQ0FBRUMsaUJBQWlCLElBQUk7TUFDaEVILGdCQUFnQixDQUFDSSxLQUFLLEdBQUdmLG9CQUFvQixDQUFDZ0IsaURBQWlELENBQzdGRixpQkFBaUIsRUFDakJWLEtBQUssQ0FBQ2EsZ0NBQWdDLENBQUNDLEtBQUssRUFDNUNkLEtBQUssQ0FBQ2UsWUFBWSxDQUFDRCxLQUNyQixDQUFDO0lBQ0gsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFZixRQUFRLEVBQUVMLHVCQUF1QixDQUFDc0Isb0NBQW9DLEVBQUU7TUFDN0ViLFFBQVEsRUFBRUEsUUFBUTtNQUVsQjtNQUNBYyxRQUFRLEVBQUV2Qix1QkFBdUIsQ0FBQ3dCLElBQUksQ0FBQ0Msc0JBQXNCLENBQUNDLHNCQUFzQjtNQUNwRkMsc0JBQXNCLEVBQUVkLGdCQUFnQjtNQUN4Q2Usd0JBQXdCLEVBQUUsc0JBQXNCO01BRWhEO01BQ0FyQixNQUFNLEVBQUVBO0lBQ1YsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBUixnQkFBZ0IsQ0FBQzhCLFFBQVEsQ0FBRSw0QkFBNEIsRUFBRTFCLDBCQUEyQixDQUFDO0FBQ3JGLGVBQWVBLDBCQUEwQiJ9