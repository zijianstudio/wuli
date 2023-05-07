// Copyright 2018-2022, University of Colorado Boulder

/**
 * PlayResetButton is a button that toggles between 'play' and 'reset' icons. It is used for the Collision Counter.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PlayIconShape from '../../../../scenery-phet/js/PlayIconShape.js';
import UTurnArrowShape from '../../../../scenery-phet/js/UTurnArrowShape.js';
import { Path } from '../../../../scenery/js/imports.js';
import BooleanRectangularToggleButton from '../../../../sun/js/buttons/BooleanRectangularToggleButton.js';
import gasProperties from '../../gasProperties.js';
export default class PlayResetButton extends BooleanRectangularToggleButton {
  constructor(isPlayingProperty, providedOptions) {
    const options = optionize()({
      // BooleanRectangularToggleButtonOptions
      baseColor: '#DFE0E1'
    }, providedOptions);
    const iconOptions = {
      stroke: 'black',
      lineWidth: 0.5
    };

    // reset icon
    const resetIconNode = new Path(new UTurnArrowShape(10), combineOptions({}, iconOptions, {
      fill: PhetColorScheme.RED_COLORBLIND
    }));

    // play icon
    const playIconNode = new Path(new PlayIconShape(0.8 * resetIconNode.height, resetIconNode.height), combineOptions({}, iconOptions, {
      fill: 'rgb( 0, 179, 0 )'
    }));
    super(isPlayingProperty, resetIconNode, playIconNode, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
gasProperties.register('PlayResetButton', PlayResetButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlBoZXRDb2xvclNjaGVtZSIsIlBsYXlJY29uU2hhcGUiLCJVVHVybkFycm93U2hhcGUiLCJQYXRoIiwiQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uIiwiZ2FzUHJvcGVydGllcyIsIlBsYXlSZXNldEJ1dHRvbiIsImNvbnN0cnVjdG9yIiwiaXNQbGF5aW5nUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYmFzZUNvbG9yIiwiaWNvbk9wdGlvbnMiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJyZXNldEljb25Ob2RlIiwiZmlsbCIsIlJFRF9DT0xPUkJMSU5EIiwicGxheUljb25Ob2RlIiwiaGVpZ2h0IiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGxheVJlc2V0QnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBsYXlSZXNldEJ1dHRvbiBpcyBhIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgYmV0d2VlbiAncGxheScgYW5kICdyZXNldCcgaWNvbnMuIEl0IGlzIHVzZWQgZm9yIHRoZSBDb2xsaXNpb24gQ291bnRlci5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFBoZXRDb2xvclNjaGVtZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldENvbG9yU2NoZW1lLmpzJztcclxuaW1wb3J0IFBsYXlJY29uU2hhcGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BsYXlJY29uU2hhcGUuanMnO1xyXG5pbXBvcnQgVVR1cm5BcnJvd1NoYXBlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9VVHVybkFycm93U2hhcGUuanMnO1xyXG5pbXBvcnQgeyBQYXRoLCBQYXRoT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBCb29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b24sIHsgQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL0Jvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCBnYXNQcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2dhc1Byb3BlcnRpZXMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIFBsYXlSZXNldEJ1dHRvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxCb29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b25PcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5UmVzZXRCdXR0b24gZXh0ZW5kcyBCb29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b24ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGlzUGxheWluZ1Byb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgcHJvdmlkZWRPcHRpb25zOiBQbGF5UmVzZXRCdXR0b25PcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UGxheVJlc2V0QnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIEJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbk9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbk9wdGlvbnNcclxuICAgICAgYmFzZUNvbG9yOiAnI0RGRTBFMSdcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGljb25PcHRpb25zOiBQYXRoT3B0aW9ucyA9IHtcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lV2lkdGg6IDAuNVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyByZXNldCBpY29uXHJcbiAgICBjb25zdCByZXNldEljb25Ob2RlID0gbmV3IFBhdGgoIG5ldyBVVHVybkFycm93U2hhcGUoIDEwICksXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPFBhdGhPcHRpb25zPigge30sIGljb25PcHRpb25zLCB7XHJcbiAgICAgICAgZmlsbDogUGhldENvbG9yU2NoZW1lLlJFRF9DT0xPUkJMSU5EXHJcbiAgICAgIH0gKSApO1xyXG5cclxuICAgIC8vIHBsYXkgaWNvblxyXG4gICAgY29uc3QgcGxheUljb25Ob2RlID0gbmV3IFBhdGgoIG5ldyBQbGF5SWNvblNoYXBlKCAwLjggKiByZXNldEljb25Ob2RlLmhlaWdodCwgcmVzZXRJY29uTm9kZS5oZWlnaHQgKSxcclxuICAgICAgY29tYmluZU9wdGlvbnM8UGF0aE9wdGlvbnM+KCB7fSwgaWNvbk9wdGlvbnMsIHtcclxuICAgICAgICBmaWxsOiAncmdiKCAwLCAxNzksIDAgKSdcclxuICAgICAgfSApXHJcbiAgICApO1xyXG5cclxuICAgIHN1cGVyKCBpc1BsYXlpbmdQcm9wZXJ0eSwgcmVzZXRJY29uTm9kZSwgcGxheUljb25Ob2RlLCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZ2FzUHJvcGVydGllcy5yZWdpc3RlciggJ1BsYXlSZXNldEJ1dHRvbicsIFBsYXlSZXNldEJ1dHRvbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxTQUFTLElBQUlDLGNBQWMsUUFBMEIsdUNBQXVDO0FBRW5HLE9BQU9DLGVBQWUsTUFBTSxnREFBZ0Q7QUFDNUUsT0FBT0MsYUFBYSxNQUFNLDhDQUE4QztBQUN4RSxPQUFPQyxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLFNBQVNDLElBQUksUUFBcUIsbUNBQW1DO0FBQ3JFLE9BQU9DLDhCQUE4QixNQUFpRCw4REFBOEQ7QUFDcEosT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQU1sRCxlQUFlLE1BQU1DLGVBQWUsU0FBU0YsOEJBQThCLENBQUM7RUFFbkVHLFdBQVdBLENBQUVDLGlCQUFvQyxFQUFFQyxlQUF1QyxFQUFHO0lBRWxHLE1BQU1DLE9BQU8sR0FBR1osU0FBUyxDQUE2RSxDQUFDLENBQUU7TUFFdkc7TUFDQWEsU0FBUyxFQUFFO0lBQ2IsQ0FBQyxFQUFFRixlQUFnQixDQUFDO0lBRXBCLE1BQU1HLFdBQXdCLEdBQUc7TUFDL0JDLE1BQU0sRUFBRSxPQUFPO01BQ2ZDLFNBQVMsRUFBRTtJQUNiLENBQUM7O0lBRUQ7SUFDQSxNQUFNQyxhQUFhLEdBQUcsSUFBSVosSUFBSSxDQUFFLElBQUlELGVBQWUsQ0FBRSxFQUFHLENBQUMsRUFDdkRILGNBQWMsQ0FBZSxDQUFDLENBQUMsRUFBRWEsV0FBVyxFQUFFO01BQzVDSSxJQUFJLEVBQUVoQixlQUFlLENBQUNpQjtJQUN4QixDQUFFLENBQUUsQ0FBQzs7SUFFUDtJQUNBLE1BQU1DLFlBQVksR0FBRyxJQUFJZixJQUFJLENBQUUsSUFBSUYsYUFBYSxDQUFFLEdBQUcsR0FBR2MsYUFBYSxDQUFDSSxNQUFNLEVBQUVKLGFBQWEsQ0FBQ0ksTUFBTyxDQUFDLEVBQ2xHcEIsY0FBYyxDQUFlLENBQUMsQ0FBQyxFQUFFYSxXQUFXLEVBQUU7TUFDNUNJLElBQUksRUFBRTtJQUNSLENBQUUsQ0FDSixDQUFDO0lBRUQsS0FBSyxDQUFFUixpQkFBaUIsRUFBRU8sYUFBYSxFQUFFRyxZQUFZLEVBQUVSLE9BQVEsQ0FBQztFQUNsRTtFQUVnQlUsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUFmLGFBQWEsQ0FBQ2lCLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRWhCLGVBQWdCLENBQUMifQ==