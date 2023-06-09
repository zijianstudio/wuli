// Copyright 2017-2023, University of Colorado Boulder

/**
 * The panel that appears in the bottom left which can be used to zoom in and out on the circuit. Exists for the life
 * of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { combineOptions } from '../../../phet-core/js/optionize.js';
import MagnifyingGlassZoomButtonGroup from '../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import RectangularButton from '../../../sun/js/buttons/RectangularButton.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const BUTTON_SPACING = 20;
export default class CCKCZoomButtonGroup extends MagnifyingGlassZoomButtonGroup {
  constructor(selectedZoomProperty, providedOptions) {
    providedOptions = combineOptions({
      spacing: BUTTON_SPACING,
      buttonOptions: {
        buttonAppearanceStrategy: RectangularButton.ThreeDAppearanceStrategy,
        baseColor: PhetColorScheme.BUTTON_YELLOW,
        phetioReadOnly: true
      },
      magnifyingGlassNodeOptions: {
        scale: 0.7
      },
      touchAreaXDilation: 9,
      touchAreaYDilation: 10
    }, providedOptions);
    super(selectedZoomProperty, providedOptions);
  }
}
circuitConstructionKitCommon.register('CCKCZoomButtonGroup', CCKCZoomButtonGroup);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb21iaW5lT3B0aW9ucyIsIk1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cCIsIlBoZXRDb2xvclNjaGVtZSIsIlJlY3Rhbmd1bGFyQnV0dG9uIiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiIsIkJVVFRPTl9TUEFDSU5HIiwiQ0NLQ1pvb21CdXR0b25Hcm91cCIsImNvbnN0cnVjdG9yIiwic2VsZWN0ZWRab29tUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJzcGFjaW5nIiwiYnV0dG9uT3B0aW9ucyIsImJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneSIsIlRocmVlREFwcGVhcmFuY2VTdHJhdGVneSIsImJhc2VDb2xvciIsIkJVVFRPTl9ZRUxMT1ciLCJwaGV0aW9SZWFkT25seSIsIm1hZ25pZnlpbmdHbGFzc05vZGVPcHRpb25zIiwic2NhbGUiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNDS0Nab29tQnV0dG9uR3JvdXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIHBhbmVsIHRoYXQgYXBwZWFycyBpbiB0aGUgYm90dG9tIGxlZnQgd2hpY2ggY2FuIGJlIHVzZWQgdG8gem9vbSBpbiBhbmQgb3V0IG9uIHRoZSBjaXJjdWl0LiBFeGlzdHMgZm9yIHRoZSBsaWZlXHJcbiAqIG9mIHRoZSBzaW0gYW5kIGhlbmNlIGRvZXMgbm90IHJlcXVpcmUgYSBkaXNwb3NlIGltcGxlbWVudGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IE1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cCwgeyBNYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXBPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhckJ1dHRvbiBmcm9tICcuLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhckJ1dHRvbi5qcyc7XHJcbmltcG9ydCBjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIGZyb20gJy4uL2NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEJVVFRPTl9TUEFDSU5HID0gMjA7XHJcblxyXG50eXBlIFpvb21CdXR0b25Hcm91cE9wdGlvbnMgPSBNYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXBPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ0NLQ1pvb21CdXR0b25Hcm91cCBleHRlbmRzIE1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2VsZWN0ZWRab29tUHJvcGVydHk6IE51bWJlclByb3BlcnR5LCBwcm92aWRlZE9wdGlvbnM/OiBab29tQnV0dG9uR3JvdXBPcHRpb25zICkge1xyXG4gICAgcHJvdmlkZWRPcHRpb25zID0gY29tYmluZU9wdGlvbnM8Wm9vbUJ1dHRvbkdyb3VwT3B0aW9ucz4oIHtcclxuICAgICAgc3BhY2luZzogQlVUVE9OX1NQQUNJTkcsXHJcbiAgICAgIGJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3k6IFJlY3Rhbmd1bGFyQnV0dG9uLlRocmVlREFwcGVhcmFuY2VTdHJhdGVneSxcclxuICAgICAgICBiYXNlQ29sb3I6IFBoZXRDb2xvclNjaGVtZS5CVVRUT05fWUVMTE9XLFxyXG4gICAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICAgIH0sXHJcbiAgICAgIG1hZ25pZnlpbmdHbGFzc05vZGVPcHRpb25zOiB7XHJcbiAgICAgICAgc2NhbGU6IDAuN1xyXG4gICAgICB9LFxyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDksXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMTBcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gICAgc3VwZXIoIHNlbGVjdGVkWm9vbVByb3BlcnR5LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24ucmVnaXN0ZXIoICdDQ0tDWm9vbUJ1dHRvbkdyb3VwJywgQ0NLQ1pvb21CdXR0b25Hcm91cCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLFNBQVNBLGNBQWMsUUFBUSxvQ0FBb0M7QUFDbkUsT0FBT0MsOEJBQThCLE1BQWlELDREQUE0RDtBQUNsSixPQUFPQyxlQUFlLE1BQU0sNkNBQTZDO0FBQ3pFLE9BQU9DLGlCQUFpQixNQUFNLDhDQUE4QztBQUM1RSxPQUFPQyw0QkFBNEIsTUFBTSxvQ0FBb0M7O0FBRTdFO0FBQ0EsTUFBTUMsY0FBYyxHQUFHLEVBQUU7QUFJekIsZUFBZSxNQUFNQyxtQkFBbUIsU0FBU0wsOEJBQThCLENBQUM7RUFFdkVNLFdBQVdBLENBQUVDLG9CQUFvQyxFQUFFQyxlQUF3QyxFQUFHO0lBQ25HQSxlQUFlLEdBQUdULGNBQWMsQ0FBMEI7TUFDeERVLE9BQU8sRUFBRUwsY0FBYztNQUN2Qk0sYUFBYSxFQUFFO1FBQ2JDLHdCQUF3QixFQUFFVCxpQkFBaUIsQ0FBQ1Usd0JBQXdCO1FBQ3BFQyxTQUFTLEVBQUVaLGVBQWUsQ0FBQ2EsYUFBYTtRQUN4Q0MsY0FBYyxFQUFFO01BQ2xCLENBQUM7TUFDREMsMEJBQTBCLEVBQUU7UUFDMUJDLEtBQUssRUFBRTtNQUNULENBQUM7TUFDREMsa0JBQWtCLEVBQUUsQ0FBQztNQUNyQkMsa0JBQWtCLEVBQUU7SUFDdEIsQ0FBQyxFQUFFWCxlQUFnQixDQUFDO0lBQ3BCLEtBQUssQ0FBRUQsb0JBQW9CLEVBQUVDLGVBQWdCLENBQUM7RUFDaEQ7QUFDRjtBQUVBTCw0QkFBNEIsQ0FBQ2lCLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRWYsbUJBQW9CLENBQUMifQ==