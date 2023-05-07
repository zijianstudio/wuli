// Copyright 2017-2022, University of Colorado Boulder

/**
 * Lab screen for Fractions: Intro
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import FractionsCommonColors from '../../../fractions-common/js/common/view/FractionsCommonColors.js';
import BuildingLabModel from '../../../fractions-common/js/lab/model/BuildingLabModel.js';
import BuildingLabScreenView from '../../../fractions-common/js/lab/view/BuildingLabScreenView.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import fractionsIntro from '../fractionsIntro.js';
import FractionsIntroStrings from '../FractionsIntroStrings.js';
class LabScreen extends Screen {
  constructor() {
    super(() => new BuildingLabModel(false), model => new BuildingLabScreenView(model), {
      name: FractionsIntroStrings.screen.labStringProperty,
      backgroundColorProperty: FractionsCommonColors.otherScreenBackgroundProperty,
      homeScreenIcon: new ScreenIcon(BuildingLabScreenView.createUnmixedScreenIcon(), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      })
    });
  }
}
fractionsIntro.register('LabScreen', LabScreen);
export default LabScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGcmFjdGlvbnNDb21tb25Db2xvcnMiLCJCdWlsZGluZ0xhYk1vZGVsIiwiQnVpbGRpbmdMYWJTY3JlZW5WaWV3IiwiU2NyZWVuIiwiU2NyZWVuSWNvbiIsImZyYWN0aW9uc0ludHJvIiwiRnJhY3Rpb25zSW50cm9TdHJpbmdzIiwiTGFiU2NyZWVuIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIm5hbWUiLCJzY3JlZW4iLCJsYWJTdHJpbmdQcm9wZXJ0eSIsImJhY2tncm91bmRDb2xvclByb3BlcnR5Iiwib3RoZXJTY3JlZW5CYWNrZ3JvdW5kUHJvcGVydHkiLCJob21lU2NyZWVuSWNvbiIsImNyZWF0ZVVubWl4ZWRTY3JlZW5JY29uIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMYWJTY3JlZW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTGFiIHNjcmVlbiBmb3IgRnJhY3Rpb25zOiBJbnRyb1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbG9ycyBmcm9tICcuLi8uLi8uLi9mcmFjdGlvbnMtY29tbW9uL2pzL2NvbW1vbi92aWV3L0ZyYWN0aW9uc0NvbW1vbkNvbG9ycy5qcyc7XHJcbmltcG9ydCBCdWlsZGluZ0xhYk1vZGVsIGZyb20gJy4uLy4uLy4uL2ZyYWN0aW9ucy1jb21tb24vanMvbGFiL21vZGVsL0J1aWxkaW5nTGFiTW9kZWwuanMnO1xyXG5pbXBvcnQgQnVpbGRpbmdMYWJTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uL2ZyYWN0aW9ucy1jb21tb24vanMvbGFiL3ZpZXcvQnVpbGRpbmdMYWJTY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0ludHJvIGZyb20gJy4uL2ZyYWN0aW9uc0ludHJvLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0ludHJvU3RyaW5ncyBmcm9tICcuLi9GcmFjdGlvbnNJbnRyb1N0cmluZ3MuanMnO1xyXG5cclxuY2xhc3MgTGFiU2NyZWVuIGV4dGVuZHMgU2NyZWVuIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgQnVpbGRpbmdMYWJNb2RlbCggZmFsc2UgKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IEJ1aWxkaW5nTGFiU2NyZWVuVmlldyggbW9kZWwgKSxcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6IEZyYWN0aW9uc0ludHJvU3RyaW5ncy5zY3JlZW4ubGFiU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5vdGhlclNjcmVlbkJhY2tncm91bmRQcm9wZXJ0eSxcclxuICAgICAgICBob21lU2NyZWVuSWNvbjogbmV3IFNjcmVlbkljb24oIEJ1aWxkaW5nTGFiU2NyZWVuVmlldy5jcmVhdGVVbm1peGVkU2NyZWVuSWNvbigpLCB7XHJcbiAgICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgICAgICB9IClcclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmZyYWN0aW9uc0ludHJvLnJlZ2lzdGVyKCAnTGFiU2NyZWVuJywgTGFiU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IExhYlNjcmVlbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sbUVBQW1FO0FBQ3JHLE9BQU9DLGdCQUFnQixNQUFNLDREQUE0RDtBQUN6RixPQUFPQyxxQkFBcUIsTUFBTSxnRUFBZ0U7QUFDbEcsT0FBT0MsTUFBTSxNQUFNLDZCQUE2QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSxzQkFBc0I7QUFDakQsT0FBT0MscUJBQXFCLE1BQU0sNkJBQTZCO0FBRS9ELE1BQU1DLFNBQVMsU0FBU0osTUFBTSxDQUFDO0VBQzdCSyxXQUFXQSxDQUFBLEVBQUc7SUFDWixLQUFLLENBQ0gsTUFBTSxJQUFJUCxnQkFBZ0IsQ0FBRSxLQUFNLENBQUMsRUFDbkNRLEtBQUssSUFBSSxJQUFJUCxxQkFBcUIsQ0FBRU8sS0FBTSxDQUFDLEVBQzNDO01BQ0VDLElBQUksRUFBRUoscUJBQXFCLENBQUNLLE1BQU0sQ0FBQ0MsaUJBQWlCO01BQ3BEQyx1QkFBdUIsRUFBRWIscUJBQXFCLENBQUNjLDZCQUE2QjtNQUM1RUMsY0FBYyxFQUFFLElBQUlYLFVBQVUsQ0FBRUYscUJBQXFCLENBQUNjLHVCQUF1QixDQUFDLENBQUMsRUFBRTtRQUMvRUMsc0JBQXNCLEVBQUUsQ0FBQztRQUN6QkMsdUJBQXVCLEVBQUU7TUFDM0IsQ0FBRTtJQUNKLENBQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQWIsY0FBYyxDQUFDYyxRQUFRLENBQUUsV0FBVyxFQUFFWixTQUFVLENBQUM7QUFDakQsZUFBZUEsU0FBUyJ9