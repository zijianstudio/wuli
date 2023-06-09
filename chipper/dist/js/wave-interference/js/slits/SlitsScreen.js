// Copyright 2017-2023, University of Colorado Boulder

/**
 * "Slits" screen in the Wave Interference simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import slits_screen_icon_png from '../../images/slits_screen_icon_png.js';
import waveInterference from '../waveInterference.js';
import WaveInterferenceStrings from '../WaveInterferenceStrings.js';
import SlitsModel from './model/SlitsModel.js';
import SlitsScreenView from './view/SlitsScreenView.js';
class SlitsScreen extends Screen {
  /**
   * @param alignGroup - for aligning the control panels on the right side of the lattice
   */
  constructor(alignGroup) {
    const options = {
      backgroundColorProperty: new Property('white'),
      name: WaveInterferenceStrings.screen.slitsStringProperty,
      homeScreenIcon: new ScreenIcon(new Image(slits_screen_icon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      showUnselectedHomeScreenIconFrame: true,
      showScreenIconFrameForNavigationBarFill: 'black',
      tandem: Tandem.OPT_OUT
    };
    super(() => new SlitsModel(), model => new SlitsScreenView(model, alignGroup), options);
  }
}
waveInterference.register('SlitsScreen', SlitsScreen);
export default SlitsScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJJbWFnZSIsIlRhbmRlbSIsInNsaXRzX3NjcmVlbl9pY29uX3BuZyIsIndhdmVJbnRlcmZlcmVuY2UiLCJXYXZlSW50ZXJmZXJlbmNlU3RyaW5ncyIsIlNsaXRzTW9kZWwiLCJTbGl0c1NjcmVlblZpZXciLCJTbGl0c1NjcmVlbiIsImNvbnN0cnVjdG9yIiwiYWxpZ25Hcm91cCIsIm9wdGlvbnMiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsIm5hbWUiLCJzY3JlZW4iLCJzbGl0c1N0cmluZ1Byb3BlcnR5IiwiaG9tZVNjcmVlbkljb24iLCJtYXhJY29uV2lkdGhQcm9wb3J0aW9uIiwibWF4SWNvbkhlaWdodFByb3BvcnRpb24iLCJzaG93VW5zZWxlY3RlZEhvbWVTY3JlZW5JY29uRnJhbWUiLCJzaG93U2NyZWVuSWNvbkZyYW1lRm9yTmF2aWdhdGlvbkJhckZpbGwiLCJ0YW5kZW0iLCJPUFRfT1VUIiwibW9kZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNsaXRzU2NyZWVuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFwiU2xpdHNcIiBzY3JlZW4gaW4gdGhlIFdhdmUgSW50ZXJmZXJlbmNlIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBTY3JlZW5JY29uIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbkljb24uanMnO1xyXG5pbXBvcnQgeyBBbGlnbkdyb3VwLCBJbWFnZSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBzbGl0c19zY3JlZW5faWNvbl9wbmcgZnJvbSAnLi4vLi4vaW1hZ2VzL3NsaXRzX3NjcmVlbl9pY29uX3BuZy5qcyc7XHJcbmltcG9ydCB3YXZlSW50ZXJmZXJlbmNlIGZyb20gJy4uL3dhdmVJbnRlcmZlcmVuY2UuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MgZnJvbSAnLi4vV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgU2xpdHNNb2RlbCBmcm9tICcuL21vZGVsL1NsaXRzTW9kZWwuanMnO1xyXG5pbXBvcnQgU2xpdHNTY3JlZW5WaWV3IGZyb20gJy4vdmlldy9TbGl0c1NjcmVlblZpZXcuanMnO1xyXG5cclxuY2xhc3MgU2xpdHNTY3JlZW4gZXh0ZW5kcyBTY3JlZW48U2xpdHNNb2RlbCwgU2xpdHNTY3JlZW5WaWV3PiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBhbGlnbkdyb3VwIC0gZm9yIGFsaWduaW5nIHRoZSBjb250cm9sIHBhbmVscyBvbiB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgbGF0dGljZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYWxpZ25Hcm91cDogQWxpZ25Hcm91cCApIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvcGVydHkoICd3aGl0ZScgKSxcclxuICAgICAgbmFtZTogV2F2ZUludGVyZmVyZW5jZVN0cmluZ3Muc2NyZWVuLnNsaXRzU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBuZXcgU2NyZWVuSWNvbiggbmV3IEltYWdlKCBzbGl0c19zY3JlZW5faWNvbl9wbmcgKSwge1xyXG4gICAgICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgICAgfSApLFxyXG4gICAgICBzaG93VW5zZWxlY3RlZEhvbWVTY3JlZW5JY29uRnJhbWU6IHRydWUsXHJcbiAgICAgIHNob3dTY3JlZW5JY29uRnJhbWVGb3JOYXZpZ2F0aW9uQmFyRmlsbDogJ2JsYWNrJyxcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfTtcclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgU2xpdHNNb2RlbCgpLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgU2xpdHNTY3JlZW5WaWV3KCBtb2RlbCwgYWxpZ25Hcm91cCApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxud2F2ZUludGVyZmVyZW5jZS5yZWdpc3RlciggJ1NsaXRzU2NyZWVuJywgU2xpdHNTY3JlZW4gKTtcclxuZXhwb3J0IGRlZmF1bHQgU2xpdHNTY3JlZW47Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLDZCQUE2QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELFNBQXFCQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ2xFLE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsT0FBT0MscUJBQXFCLE1BQU0sdUNBQXVDO0FBQ3pFLE9BQU9DLGdCQUFnQixNQUFNLHdCQUF3QjtBQUNyRCxPQUFPQyx1QkFBdUIsTUFBTSwrQkFBK0I7QUFDbkUsT0FBT0MsVUFBVSxNQUFNLHVCQUF1QjtBQUM5QyxPQUFPQyxlQUFlLE1BQU0sMkJBQTJCO0FBRXZELE1BQU1DLFdBQVcsU0FBU1QsTUFBTSxDQUE4QjtFQUU1RDtBQUNGO0FBQ0E7RUFDU1UsV0FBV0EsQ0FBRUMsVUFBc0IsRUFBRztJQUMzQyxNQUFNQyxPQUFPLEdBQUc7TUFDZEMsdUJBQXVCLEVBQUUsSUFBSWQsUUFBUSxDQUFFLE9BQVEsQ0FBQztNQUNoRGUsSUFBSSxFQUFFUix1QkFBdUIsQ0FBQ1MsTUFBTSxDQUFDQyxtQkFBbUI7TUFDeERDLGNBQWMsRUFBRSxJQUFJaEIsVUFBVSxDQUFFLElBQUlDLEtBQUssQ0FBRUUscUJBQXNCLENBQUMsRUFBRTtRQUNsRWMsc0JBQXNCLEVBQUUsQ0FBQztRQUN6QkMsdUJBQXVCLEVBQUU7TUFDM0IsQ0FBRSxDQUFDO01BQ0hDLGlDQUFpQyxFQUFFLElBQUk7TUFDdkNDLHVDQUF1QyxFQUFFLE9BQU87TUFDaERDLE1BQU0sRUFBRW5CLE1BQU0sQ0FBQ29CO0lBQ2pCLENBQUM7SUFDRCxLQUFLLENBQ0gsTUFBTSxJQUFJaEIsVUFBVSxDQUFDLENBQUMsRUFDdEJpQixLQUFLLElBQUksSUFBSWhCLGVBQWUsQ0FBRWdCLEtBQUssRUFBRWIsVUFBVyxDQUFDLEVBQ2pEQyxPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFQLGdCQUFnQixDQUFDb0IsUUFBUSxDQUFFLGFBQWEsRUFBRWhCLFdBQVksQ0FBQztBQUN2RCxlQUFlQSxXQUFXIn0=