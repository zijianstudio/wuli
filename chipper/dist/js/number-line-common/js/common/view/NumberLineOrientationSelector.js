// Copyright 2020-2023, University of Colorado Boulder

/**
 * A node that controls a number line's orientation
 *
 * @author Saurabh Totey
 */

import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import numberLineCommon from '../../numberLineCommon.js';
const ARROW_ICON_LENGTH = 40;
const ORIENTATION_BUTTON_DILATION = 2;
class NumberLineOrientationSelector extends RectangularRadioButtonGroup {
  /**
   * @param {Property.<Orientation>} orientationProperty
   * @param {Object} [options]
   */
  constructor(orientationProperty, options) {
    const arrowIconOptions = {
      doubleHead: true,
      tailWidth: 1
    };

    // Map the orientation icons to their enum values.
    const orientationButtonsContent = [{
      value: Orientation.HORIZONTAL,
      createNode: () => new ArrowNode(-ARROW_ICON_LENGTH / 2, 0, ARROW_ICON_LENGTH / 2, 0, arrowIconOptions)
    }, {
      value: Orientation.VERTICAL,
      createNode: () => new ArrowNode(0, -ARROW_ICON_LENGTH / 2, 0, ARROW_ICON_LENGTH / 2, arrowIconOptions)
    }];

    // orientation radio buttons
    super(orientationProperty, orientationButtonsContent, merge({
      orientation: 'horizontal',
      spacing: 12,
      touchAreaXDilation: ORIENTATION_BUTTON_DILATION,
      touchAreaYDilation: ORIENTATION_BUTTON_DILATION,
      radioButtonOptions: {
        xMargin: 5,
        yMargin: 5,
        baseColor: 'white',
        buttonAppearanceStrategyOptions: {
          selectedLineWidth: 2,
          deselectedLineWidth: 0.5,
          deselectedButtonOpacity: 0.25
        }
      }
    }, options));
  }
}
numberLineCommon.register('NumberLineOrientationSelector', NumberLineOrientationSelector);
export default NumberLineOrientationSelector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIk9yaWVudGF0aW9uIiwiQXJyb3dOb2RlIiwiUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwIiwibnVtYmVyTGluZUNvbW1vbiIsIkFSUk9XX0lDT05fTEVOR1RIIiwiT1JJRU5UQVRJT05fQlVUVE9OX0RJTEFUSU9OIiwiTnVtYmVyTGluZU9yaWVudGF0aW9uU2VsZWN0b3IiLCJjb25zdHJ1Y3RvciIsIm9yaWVudGF0aW9uUHJvcGVydHkiLCJvcHRpb25zIiwiYXJyb3dJY29uT3B0aW9ucyIsImRvdWJsZUhlYWQiLCJ0YWlsV2lkdGgiLCJvcmllbnRhdGlvbkJ1dHRvbnNDb250ZW50IiwidmFsdWUiLCJIT1JJWk9OVEFMIiwiY3JlYXRlTm9kZSIsIlZFUlRJQ0FMIiwib3JpZW50YXRpb24iLCJzcGFjaW5nIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwicmFkaW9CdXR0b25PcHRpb25zIiwieE1hcmdpbiIsInlNYXJnaW4iLCJiYXNlQ29sb3IiLCJidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zIiwic2VsZWN0ZWRMaW5lV2lkdGgiLCJkZXNlbGVjdGVkTGluZVdpZHRoIiwiZGVzZWxlY3RlZEJ1dHRvbk9wYWNpdHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk51bWJlckxpbmVPcmllbnRhdGlvblNlbGVjdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbm9kZSB0aGF0IGNvbnRyb2xzIGEgbnVtYmVyIGxpbmUncyBvcmllbnRhdGlvblxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhdXJhYmggVG90ZXlcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE9yaWVudGF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvbi5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IG51bWJlckxpbmVDb21tb24gZnJvbSAnLi4vLi4vbnVtYmVyTGluZUNvbW1vbi5qcyc7XHJcblxyXG5jb25zdCBBUlJPV19JQ09OX0xFTkdUSCA9IDQwO1xyXG5jb25zdCBPUklFTlRBVElPTl9CVVRUT05fRElMQVRJT04gPSAyO1xyXG5cclxuY2xhc3MgTnVtYmVyTGluZU9yaWVudGF0aW9uU2VsZWN0b3IgZXh0ZW5kcyBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxPcmllbnRhdGlvbj59IG9yaWVudGF0aW9uUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9yaWVudGF0aW9uUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCBhcnJvd0ljb25PcHRpb25zID0ge1xyXG4gICAgICBkb3VibGVIZWFkOiB0cnVlLFxyXG4gICAgICB0YWlsV2lkdGg6IDFcclxuICAgIH07XHJcblxyXG4gICAgLy8gTWFwIHRoZSBvcmllbnRhdGlvbiBpY29ucyB0byB0aGVpciBlbnVtIHZhbHVlcy5cclxuICAgIGNvbnN0IG9yaWVudGF0aW9uQnV0dG9uc0NvbnRlbnQgPSBbXHJcbiAgICAgIHtcclxuICAgICAgICB2YWx1ZTogT3JpZW50YXRpb24uSE9SSVpPTlRBTCxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgQXJyb3dOb2RlKCAtQVJST1dfSUNPTl9MRU5HVEggLyAyLCAwLCBBUlJPV19JQ09OX0xFTkdUSCAvIDIsIDAsIGFycm93SWNvbk9wdGlvbnMgKVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdmFsdWU6IE9yaWVudGF0aW9uLlZFUlRJQ0FMLFxyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBBcnJvd05vZGUoIDAsIC1BUlJPV19JQ09OX0xFTkdUSCAvIDIsIDAsIEFSUk9XX0lDT05fTEVOR1RIIC8gMiwgYXJyb3dJY29uT3B0aW9ucyApXHJcbiAgICAgIH1cclxuICAgIF07XHJcblxyXG4gICAgLy8gb3JpZW50YXRpb24gcmFkaW8gYnV0dG9uc1xyXG4gICAgc3VwZXIoXHJcbiAgICAgIG9yaWVudGF0aW9uUHJvcGVydHksXHJcbiAgICAgIG9yaWVudGF0aW9uQnV0dG9uc0NvbnRlbnQsXHJcbiAgICAgIG1lcmdlKCB7XHJcbiAgICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcclxuICAgICAgICBzcGFjaW5nOiAxMixcclxuICAgICAgICB0b3VjaEFyZWFYRGlsYXRpb246IE9SSUVOVEFUSU9OX0JVVFRPTl9ESUxBVElPTixcclxuICAgICAgICB0b3VjaEFyZWFZRGlsYXRpb246IE9SSUVOVEFUSU9OX0JVVFRPTl9ESUxBVElPTixcclxuICAgICAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICAgIHhNYXJnaW46IDUsXHJcbiAgICAgICAgICB5TWFyZ2luOiA1LFxyXG4gICAgICAgICAgYmFzZUNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9uczoge1xyXG4gICAgICAgICAgICBzZWxlY3RlZExpbmVXaWR0aDogMixcclxuICAgICAgICAgICAgZGVzZWxlY3RlZExpbmVXaWR0aDogMC41LFxyXG4gICAgICAgICAgICBkZXNlbGVjdGVkQnV0dG9uT3BhY2l0eTogMC4yNVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSwgb3B0aW9ucyApICk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxubnVtYmVyTGluZUNvbW1vbi5yZWdpc3RlciggJ051bWJlckxpbmVPcmllbnRhdGlvblNlbGVjdG9yJywgTnVtYmVyTGluZU9yaWVudGF0aW9uU2VsZWN0b3IgKTtcclxuZXhwb3J0IGRlZmF1bHQgTnVtYmVyTGluZU9yaWVudGF0aW9uU2VsZWN0b3I7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxPQUFPQywyQkFBMkIsTUFBTSwyREFBMkQ7QUFDbkcsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBRXhELE1BQU1DLGlCQUFpQixHQUFHLEVBQUU7QUFDNUIsTUFBTUMsMkJBQTJCLEdBQUcsQ0FBQztBQUVyQyxNQUFNQyw2QkFBNkIsU0FBU0osMkJBQTJCLENBQUM7RUFFdEU7QUFDRjtBQUNBO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsbUJBQW1CLEVBQUVDLE9BQU8sRUFBRztJQUMxQyxNQUFNQyxnQkFBZ0IsR0FBRztNQUN2QkMsVUFBVSxFQUFFLElBQUk7TUFDaEJDLFNBQVMsRUFBRTtJQUNiLENBQUM7O0lBRUQ7SUFDQSxNQUFNQyx5QkFBeUIsR0FBRyxDQUNoQztNQUNFQyxLQUFLLEVBQUVkLFdBQVcsQ0FBQ2UsVUFBVTtNQUM3QkMsVUFBVSxFQUFFQSxDQUFBLEtBQU0sSUFBSWYsU0FBUyxDQUFFLENBQUNHLGlCQUFpQixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUVBLGlCQUFpQixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUVNLGdCQUFpQjtJQUN6RyxDQUFDLEVBQ0Q7TUFDRUksS0FBSyxFQUFFZCxXQUFXLENBQUNpQixRQUFRO01BQzNCRCxVQUFVLEVBQUVBLENBQUEsS0FBTSxJQUFJZixTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUNHLGlCQUFpQixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUVBLGlCQUFpQixHQUFHLENBQUMsRUFBRU0sZ0JBQWlCO0lBQ3pHLENBQUMsQ0FDRjs7SUFFRDtJQUNBLEtBQUssQ0FDSEYsbUJBQW1CLEVBQ25CSyx5QkFBeUIsRUFDekJkLEtBQUssQ0FBRTtNQUNMbUIsV0FBVyxFQUFFLFlBQVk7TUFDekJDLE9BQU8sRUFBRSxFQUFFO01BQ1hDLGtCQUFrQixFQUFFZiwyQkFBMkI7TUFDL0NnQixrQkFBa0IsRUFBRWhCLDJCQUEyQjtNQUMvQ2lCLGtCQUFrQixFQUFFO1FBQ2xCQyxPQUFPLEVBQUUsQ0FBQztRQUNWQyxPQUFPLEVBQUUsQ0FBQztRQUNWQyxTQUFTLEVBQUUsT0FBTztRQUNsQkMsK0JBQStCLEVBQUU7VUFDL0JDLGlCQUFpQixFQUFFLENBQUM7VUFDcEJDLG1CQUFtQixFQUFFLEdBQUc7VUFDeEJDLHVCQUF1QixFQUFFO1FBQzNCO01BQ0Y7SUFDRixDQUFDLEVBQUVwQixPQUFRLENBQUUsQ0FBQztFQUNsQjtBQUVGO0FBRUFOLGdCQUFnQixDQUFDMkIsUUFBUSxDQUFFLCtCQUErQixFQUFFeEIsNkJBQThCLENBQUM7QUFDM0YsZUFBZUEsNkJBQTZCIn0=