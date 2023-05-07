// Copyright 2014-2022, University of Colorado Boulder

/**
 * The 'Intro' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import introIcon_png from '../../images/introIcon_png.js';
import introIconSmall_png from '../../images/introIconSmall_png.js';
import balancingAct from '../balancingAct.js';
import BalancingActStrings from '../BalancingActStrings.js';
import BAIntroModel from './model/BAIntroModel.js';
import BAIntroView from './view/BAIntroView.js';
class BAIntroScreen extends Screen {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    const options = {
      name: BalancingActStrings.introStringProperty,
      homeScreenIcon: new ScreenIcon(new Image(introIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      navigationBarIcon: new ScreenIcon(new Image(introIconSmall_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      tandem: tandem
    };
    super(() => new BAIntroModel(tandem.createTandem('model')), model => new BAIntroView(model, tandem.createTandem('view')), options);
  }
}
balancingAct.register('BAIntroScreen', BAIntroScreen);
export default BAIntroScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJTY3JlZW5JY29uIiwiSW1hZ2UiLCJpbnRyb0ljb25fcG5nIiwiaW50cm9JY29uU21hbGxfcG5nIiwiYmFsYW5jaW5nQWN0IiwiQmFsYW5jaW5nQWN0U3RyaW5ncyIsIkJBSW50cm9Nb2RlbCIsIkJBSW50cm9WaWV3IiwiQkFJbnRyb1NjcmVlbiIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwib3B0aW9ucyIsIm5hbWUiLCJpbnRyb1N0cmluZ1Byb3BlcnR5IiwiaG9tZVNjcmVlbkljb24iLCJtYXhJY29uV2lkdGhQcm9wb3J0aW9uIiwibWF4SWNvbkhlaWdodFByb3BvcnRpb24iLCJuYXZpZ2F0aW9uQmFySWNvbiIsImNyZWF0ZVRhbmRlbSIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCQUludHJvU2NyZWVuLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSAnSW50cm8nIHNjcmVlbi4gQ29uZm9ybXMgdG8gdGhlIGNvbnRyYWN0IHNwZWNpZmllZCBpbiBqb2lzdC9TY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBTY3JlZW5JY29uIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbkljb24uanMnO1xyXG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBpbnRyb0ljb25fcG5nIGZyb20gJy4uLy4uL2ltYWdlcy9pbnRyb0ljb25fcG5nLmpzJztcclxuaW1wb3J0IGludHJvSWNvblNtYWxsX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvaW50cm9JY29uU21hbGxfcG5nLmpzJztcclxuaW1wb3J0IGJhbGFuY2luZ0FjdCBmcm9tICcuLi9iYWxhbmNpbmdBY3QuanMnO1xyXG5pbXBvcnQgQmFsYW5jaW5nQWN0U3RyaW5ncyBmcm9tICcuLi9CYWxhbmNpbmdBY3RTdHJpbmdzLmpzJztcclxuaW1wb3J0IEJBSW50cm9Nb2RlbCBmcm9tICcuL21vZGVsL0JBSW50cm9Nb2RlbC5qcyc7XHJcbmltcG9ydCBCQUludHJvVmlldyBmcm9tICcuL3ZpZXcvQkFJbnRyb1ZpZXcuanMnO1xyXG5cclxuY2xhc3MgQkFJbnRyb1NjcmVlbiBleHRlbmRzIFNjcmVlbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIG5hbWU6IEJhbGFuY2luZ0FjdFN0cmluZ3MuaW50cm9TdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgaG9tZVNjcmVlbkljb246IG5ldyBTY3JlZW5JY29uKCBuZXcgSW1hZ2UoIGludHJvSWNvbl9wbmcgKSwge1xyXG4gICAgICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgICAgfSApLFxyXG4gICAgICBuYXZpZ2F0aW9uQmFySWNvbjogbmV3IFNjcmVlbkljb24oIG5ldyBJbWFnZSggaW50cm9JY29uU21hbGxfcG5nICksIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH07XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBCQUludHJvTW9kZWwoIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSApLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgQkFJbnRyb1ZpZXcoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuYmFsYW5jaW5nQWN0LnJlZ2lzdGVyKCAnQkFJbnRyb1NjcmVlbicsIEJBSW50cm9TY3JlZW4gKTtcclxuZXhwb3J0IGRlZmF1bHQgQkFJbnRyb1NjcmVlbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLDZCQUE2QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsYUFBYSxNQUFNLCtCQUErQjtBQUN6RCxPQUFPQyxrQkFBa0IsTUFBTSxvQ0FBb0M7QUFDbkUsT0FBT0MsWUFBWSxNQUFNLG9CQUFvQjtBQUM3QyxPQUFPQyxtQkFBbUIsTUFBTSwyQkFBMkI7QUFDM0QsT0FBT0MsWUFBWSxNQUFNLHlCQUF5QjtBQUNsRCxPQUFPQyxXQUFXLE1BQU0sdUJBQXVCO0FBRS9DLE1BQU1DLGFBQWEsU0FBU1QsTUFBTSxDQUFDO0VBRWpDO0FBQ0Y7QUFDQTtFQUNFVSxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFFcEIsTUFBTUMsT0FBTyxHQUFHO01BQ2RDLElBQUksRUFBRVAsbUJBQW1CLENBQUNRLG1CQUFtQjtNQUM3Q0MsY0FBYyxFQUFFLElBQUlkLFVBQVUsQ0FBRSxJQUFJQyxLQUFLLENBQUVDLGFBQWMsQ0FBQyxFQUFFO1FBQzFEYSxzQkFBc0IsRUFBRSxDQUFDO1FBQ3pCQyx1QkFBdUIsRUFBRTtNQUMzQixDQUFFLENBQUM7TUFDSEMsaUJBQWlCLEVBQUUsSUFBSWpCLFVBQVUsQ0FBRSxJQUFJQyxLQUFLLENBQUVFLGtCQUFtQixDQUFDLEVBQUU7UUFDbEVZLHNCQUFzQixFQUFFLENBQUM7UUFDekJDLHVCQUF1QixFQUFFO01BQzNCLENBQUUsQ0FBQztNQUNITixNQUFNLEVBQUVBO0lBQ1YsQ0FBQztJQUVELEtBQUssQ0FDSCxNQUFNLElBQUlKLFlBQVksQ0FBRUksTUFBTSxDQUFDUSxZQUFZLENBQUUsT0FBUSxDQUFFLENBQUMsRUFDeERDLEtBQUssSUFBSSxJQUFJWixXQUFXLENBQUVZLEtBQUssRUFBRVQsTUFBTSxDQUFDUSxZQUFZLENBQUUsTUFBTyxDQUFFLENBQUMsRUFDaEVQLE9BQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQVAsWUFBWSxDQUFDZ0IsUUFBUSxDQUFFLGVBQWUsRUFBRVosYUFBYyxDQUFDO0FBQ3ZELGVBQWVBLGFBQWEifQ==