// Copyright 2013-2022, University of Colorado Boulder

/**
 * Visual representation of day counter.
 * Contains clear button and numeric counter.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import { Node, Text, VBox } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import gravityAndOrbits from '../../gravityAndOrbits.js';
import GravityAndOrbitsStrings from '../../GravityAndOrbitsStrings.js';
import GravityAndOrbitsColors from '../GravityAndOrbitsColors.js';
// constants
const FONT_SIZE = 22;
class TimeCounter extends Node {
  /**
   * @param timeFormatter
   * @param clock
   * @param tandem
   * @param [providedOptions]
   */
  constructor(timeFormatter, clock, tandem, providedOptions) {
    super();

    // day text counter
    const dayText = new Text(timeFormatter(clock.timeProperty, tandem.createTandem('formattedTimeProperty')), {
      font: new PhetFont({
        family: StopwatchNode.NUMBER_FONT_FAMILY,
        size: FONT_SIZE
      }),
      fill: GravityAndOrbitsColors.foregroundProperty,
      maxWidth: 200
    });
    const isTimeNonZeroProperty = new DerivedProperty([clock.timeProperty], time => time !== 0);
    const clearButton = new TextPushButton(GravityAndOrbitsStrings.clearStringProperty, {
      font: new PhetFont(FONT_SIZE),
      listener: () => clock.setSimulationTime(0),
      maxTextWidth: 200,
      tandem: tandem.createTandem('clearButton'),
      enabledProperty: isTimeNonZeroProperty
    });
    this.addChild(new VBox({
      align: 'right',
      spacing: 4,
      children: [dayText, clearButton]
    }));
    this.mutate(merge({
      tandem: tandem
    }, providedOptions));
  }
}
gravityAndOrbits.register('TimeCounter', TimeCounter);
export default TimeCounter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJtZXJnZSIsIlBoZXRGb250IiwiU3RvcHdhdGNoTm9kZSIsIk5vZGUiLCJUZXh0IiwiVkJveCIsIlRleHRQdXNoQnV0dG9uIiwiZ3Jhdml0eUFuZE9yYml0cyIsIkdyYXZpdHlBbmRPcmJpdHNTdHJpbmdzIiwiR3Jhdml0eUFuZE9yYml0c0NvbG9ycyIsIkZPTlRfU0laRSIsIlRpbWVDb3VudGVyIiwiY29uc3RydWN0b3IiLCJ0aW1lRm9ybWF0dGVyIiwiY2xvY2siLCJ0YW5kZW0iLCJwcm92aWRlZE9wdGlvbnMiLCJkYXlUZXh0IiwidGltZVByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwiZm9udCIsImZhbWlseSIsIk5VTUJFUl9GT05UX0ZBTUlMWSIsInNpemUiLCJmaWxsIiwiZm9yZWdyb3VuZFByb3BlcnR5IiwibWF4V2lkdGgiLCJpc1RpbWVOb25aZXJvUHJvcGVydHkiLCJ0aW1lIiwiY2xlYXJCdXR0b24iLCJjbGVhclN0cmluZ1Byb3BlcnR5IiwibGlzdGVuZXIiLCJzZXRTaW11bGF0aW9uVGltZSIsIm1heFRleHRXaWR0aCIsImVuYWJsZWRQcm9wZXJ0eSIsImFkZENoaWxkIiwiYWxpZ24iLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRpbWVDb3VudGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpc3VhbCByZXByZXNlbnRhdGlvbiBvZiBkYXkgY291bnRlci5cclxuICogQ29udGFpbnMgY2xlYXIgYnV0dG9uIGFuZCBudW1lcmljIGNvdW50ZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNbGVhcm5lcilcclxuICogQGF1dGhvciBBYXJvbiBEYXZpcyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgU3RvcHdhdGNoTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3RvcHdhdGNoTm9kZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRleHRQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1RleHRQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGdyYXZpdHlBbmRPcmJpdHMgZnJvbSAnLi4vLi4vZ3Jhdml0eUFuZE9yYml0cy5qcyc7XHJcbmltcG9ydCBHcmF2aXR5QW5kT3JiaXRzU3RyaW5ncyBmcm9tICcuLi8uLi9HcmF2aXR5QW5kT3JiaXRzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBHcmF2aXR5QW5kT3JiaXRzQ29sb3JzIGZyb20gJy4uL0dyYXZpdHlBbmRPcmJpdHNDb2xvcnMuanMnO1xyXG5pbXBvcnQgR3Jhdml0eUFuZE9yYml0c0Nsb2NrIGZyb20gJy4uL21vZGVsL0dyYXZpdHlBbmRPcmJpdHNDbG9jay5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRk9OVF9TSVpFID0gMjI7XHJcblxyXG5jbGFzcyBUaW1lQ291bnRlciBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gdGltZUZvcm1hdHRlclxyXG4gICAqIEBwYXJhbSBjbG9ja1xyXG4gICAqIEBwYXJhbSB0YW5kZW1cclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRpbWVGb3JtYXR0ZXI6ICggdGltZVByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPiwgdGFuZGVtOiBUYW5kZW0gKSA9PiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBjbG9jazogR3Jhdml0eUFuZE9yYml0c0Nsb2NrLCB0YW5kZW06IFRhbmRlbSwgcHJvdmlkZWRPcHRpb25zPzogTm9kZU9wdGlvbnMgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIGRheSB0ZXh0IGNvdW50ZXJcclxuICAgIGNvbnN0IGRheVRleHQgPSBuZXcgVGV4dCggdGltZUZvcm1hdHRlciggY2xvY2sudGltZVByb3BlcnR5LCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZm9ybWF0dGVkVGltZVByb3BlcnR5JyApICksIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7XHJcbiAgICAgICAgZmFtaWx5OiBTdG9wd2F0Y2hOb2RlLk5VTUJFUl9GT05UX0ZBTUlMWSxcclxuICAgICAgICBzaXplOiBGT05UX1NJWkVcclxuICAgICAgfSApLFxyXG4gICAgICBmaWxsOiBHcmF2aXR5QW5kT3JiaXRzQ29sb3JzLmZvcmVncm91bmRQcm9wZXJ0eSxcclxuICAgICAgbWF4V2lkdGg6IDIwMFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGlzVGltZU5vblplcm9Qcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgY2xvY2sudGltZVByb3BlcnR5IF0sIHRpbWUgPT4gdGltZSAhPT0gMCApO1xyXG5cclxuICAgIGNvbnN0IGNsZWFyQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCBHcmF2aXR5QW5kT3JiaXRzU3RyaW5ncy5jbGVhclN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggRk9OVF9TSVpFICksXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiBjbG9jay5zZXRTaW11bGF0aW9uVGltZSggMCApLFxyXG4gICAgICBtYXhUZXh0V2lkdGg6IDIwMCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2xlYXJCdXR0b24nICksXHJcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogaXNUaW1lTm9uWmVyb1Byb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBWQm94KCB7XHJcbiAgICAgIGFsaWduOiAncmlnaHQnLFxyXG5cclxuICAgICAgc3BhY2luZzogNCxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBkYXlUZXh0LFxyXG4gICAgICAgIGNsZWFyQnV0dG9uXHJcbiAgICAgIF1cclxuICAgIH0gKSApO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBtZXJnZSggeyB0YW5kZW06IHRhbmRlbSB9LCBwcm92aWRlZE9wdGlvbnMgKSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3Jhdml0eUFuZE9yYml0cy5yZWdpc3RlciggJ1RpbWVDb3VudGVyJywgVGltZUNvdW50ZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgVGltZUNvdW50ZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBR3BFLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxhQUFhLE1BQU0sOENBQThDO0FBQ3hFLFNBQVNDLElBQUksRUFBZUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ2pGLE9BQU9DLGNBQWMsTUFBTSw4Q0FBOEM7QUFFekUsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyxzQkFBc0IsTUFBTSw4QkFBOEI7QUFHakU7QUFDQSxNQUFNQyxTQUFTLEdBQUcsRUFBRTtBQUVwQixNQUFNQyxXQUFXLFNBQVNSLElBQUksQ0FBQztFQUU3QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU1MsV0FBV0EsQ0FBRUMsYUFBK0YsRUFBRUMsS0FBNEIsRUFBRUMsTUFBYyxFQUFFQyxlQUE2QixFQUFHO0lBQ2pNLEtBQUssQ0FBQyxDQUFDOztJQUVQO0lBQ0EsTUFBTUMsT0FBTyxHQUFHLElBQUliLElBQUksQ0FBRVMsYUFBYSxDQUFFQyxLQUFLLENBQUNJLFlBQVksRUFBRUgsTUFBTSxDQUFDSSxZQUFZLENBQUUsdUJBQXdCLENBQUUsQ0FBQyxFQUFFO01BQzdHQyxJQUFJLEVBQUUsSUFBSW5CLFFBQVEsQ0FBRTtRQUNsQm9CLE1BQU0sRUFBRW5CLGFBQWEsQ0FBQ29CLGtCQUFrQjtRQUN4Q0MsSUFBSSxFQUFFYjtNQUNSLENBQUUsQ0FBQztNQUNIYyxJQUFJLEVBQUVmLHNCQUFzQixDQUFDZ0Isa0JBQWtCO01BQy9DQyxRQUFRLEVBQUU7SUFDWixDQUFFLENBQUM7SUFFSCxNQUFNQyxxQkFBcUIsR0FBRyxJQUFJNUIsZUFBZSxDQUFFLENBQUVlLEtBQUssQ0FBQ0ksWUFBWSxDQUFFLEVBQUVVLElBQUksSUFBSUEsSUFBSSxLQUFLLENBQUUsQ0FBQztJQUUvRixNQUFNQyxXQUFXLEdBQUcsSUFBSXZCLGNBQWMsQ0FBRUUsdUJBQXVCLENBQUNzQixtQkFBbUIsRUFBRTtNQUNuRlYsSUFBSSxFQUFFLElBQUluQixRQUFRLENBQUVTLFNBQVUsQ0FBQztNQUMvQnFCLFFBQVEsRUFBRUEsQ0FBQSxLQUFNakIsS0FBSyxDQUFDa0IsaUJBQWlCLENBQUUsQ0FBRSxDQUFDO01BQzVDQyxZQUFZLEVBQUUsR0FBRztNQUNqQmxCLE1BQU0sRUFBRUEsTUFBTSxDQUFDSSxZQUFZLENBQUUsYUFBYyxDQUFDO01BQzVDZSxlQUFlLEVBQUVQO0lBQ25CLENBQUUsQ0FBQztJQUdILElBQUksQ0FBQ1EsUUFBUSxDQUFFLElBQUk5QixJQUFJLENBQUU7TUFDdkIrQixLQUFLLEVBQUUsT0FBTztNQUVkQyxPQUFPLEVBQUUsQ0FBQztNQUNWQyxRQUFRLEVBQUUsQ0FDUnJCLE9BQU8sRUFDUFksV0FBVztJQUVmLENBQUUsQ0FBRSxDQUFDO0lBRUwsSUFBSSxDQUFDVSxNQUFNLENBQUV2QyxLQUFLLENBQUU7TUFBRWUsTUFBTSxFQUFFQTtJQUFPLENBQUMsRUFBRUMsZUFBZ0IsQ0FBRSxDQUFDO0VBQzdEO0FBQ0Y7QUFFQVQsZ0JBQWdCLENBQUNpQyxRQUFRLENBQUUsYUFBYSxFQUFFN0IsV0FBWSxDQUFDO0FBQ3ZELGVBQWVBLFdBQVcifQ==