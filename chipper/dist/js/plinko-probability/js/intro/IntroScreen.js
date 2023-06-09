// Copyright 2015-2022, University of Colorado Boulder

/**
 * The 'Intro' screen
 *
 * @author Martin Veillette (Berea College)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import introHomescreen_png from '../../images/introHomescreen_png.js';
import introNavbar_png from '../../images/introNavbar_png.js';
import PlinkoProbabilityConstants from '../common/PlinkoProbabilityConstants.js';
import PlinkoProbabilityKeyboardHelpContent from '../common/view/PlinkoProbabilityKeyboardHelpContent.js';
import plinkoProbability from '../plinkoProbability.js';
import PlinkoProbabilityStrings from '../PlinkoProbabilityStrings.js';
import IntroModel from './model/IntroModel.js';
import IntroScreenView from './view/IntroScreenView.js';
class IntroScreen extends Screen {
  constructor() {
    const options = {
      name: PlinkoProbabilityStrings.screen.introStringProperty,
      backgroundColorProperty: new Property(PlinkoProbabilityConstants.BACKGROUND_COLOR),
      homeScreenIcon: new ScreenIcon(new Image(introHomescreen_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      navigationBarIcon: new ScreenIcon(new Image(introNavbar_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      createKeyboardHelpNode: () => new PlinkoProbabilityKeyboardHelpContent()
    };
    super(() => new IntroModel(), model => new IntroScreenView(model), options);
  }
}
plinkoProbability.register('IntroScreen', IntroScreen);
export default IntroScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJJbWFnZSIsImludHJvSG9tZXNjcmVlbl9wbmciLCJpbnRyb05hdmJhcl9wbmciLCJQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cyIsIlBsaW5rb1Byb2JhYmlsaXR5S2V5Ym9hcmRIZWxwQ29udGVudCIsInBsaW5rb1Byb2JhYmlsaXR5IiwiUGxpbmtvUHJvYmFiaWxpdHlTdHJpbmdzIiwiSW50cm9Nb2RlbCIsIkludHJvU2NyZWVuVmlldyIsIkludHJvU2NyZWVuIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibmFtZSIsInNjcmVlbiIsImludHJvU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsIkJBQ0tHUk9VTkRfQ09MT1IiLCJob21lU2NyZWVuSWNvbiIsIm1heEljb25XaWR0aFByb3BvcnRpb24iLCJtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbiIsIm5hdmlnYXRpb25CYXJJY29uIiwiY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZSIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbnRyb1NjcmVlbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgJ0ludHJvJyBzY3JlZW5cclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgaW50cm9Ib21lc2NyZWVuX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvaW50cm9Ib21lc2NyZWVuX3BuZy5qcyc7XHJcbmltcG9ydCBpbnRyb05hdmJhcl9wbmcgZnJvbSAnLi4vLi4vaW1hZ2VzL2ludHJvTmF2YmFyX3BuZy5qcyc7XHJcbmltcG9ydCBQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cyBmcm9tICcuLi9jb21tb24vUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgUGxpbmtvUHJvYmFiaWxpdHlLZXlib2FyZEhlbHBDb250ZW50IGZyb20gJy4uL2NvbW1vbi92aWV3L1BsaW5rb1Byb2JhYmlsaXR5S2V5Ym9hcmRIZWxwQ29udGVudC5qcyc7XHJcbmltcG9ydCBwbGlua29Qcm9iYWJpbGl0eSBmcm9tICcuLi9wbGlua29Qcm9iYWJpbGl0eS5qcyc7XHJcbmltcG9ydCBQbGlua29Qcm9iYWJpbGl0eVN0cmluZ3MgZnJvbSAnLi4vUGxpbmtvUHJvYmFiaWxpdHlTdHJpbmdzLmpzJztcclxuaW1wb3J0IEludHJvTW9kZWwgZnJvbSAnLi9tb2RlbC9JbnRyb01vZGVsLmpzJztcclxuaW1wb3J0IEludHJvU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvSW50cm9TY3JlZW5WaWV3LmpzJztcclxuXHJcbmNsYXNzIEludHJvU2NyZWVuIGV4dGVuZHMgU2NyZWVuIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICBuYW1lOiBQbGlua29Qcm9iYWJpbGl0eVN0cmluZ3Muc2NyZWVuLmludHJvU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvcGVydHkoIFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLkJBQ0tHUk9VTkRfQ09MT1IgKSxcclxuICAgICAgaG9tZVNjcmVlbkljb246IG5ldyBTY3JlZW5JY29uKCBuZXcgSW1hZ2UoIGludHJvSG9tZXNjcmVlbl9wbmcgKSwge1xyXG4gICAgICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgICAgfSApLFxyXG4gICAgICBuYXZpZ2F0aW9uQmFySWNvbjogbmV3IFNjcmVlbkljb24oIG5ldyBJbWFnZSggaW50cm9OYXZiYXJfcG5nICksIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZTogKCkgPT4gbmV3IFBsaW5rb1Byb2JhYmlsaXR5S2V5Ym9hcmRIZWxwQ29udGVudCgpXHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgSW50cm9Nb2RlbCgpLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgSW50cm9TY3JlZW5WaWV3KCBtb2RlbCApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxucGxpbmtvUHJvYmFiaWxpdHkucmVnaXN0ZXIoICdJbnRyb1NjcmVlbicsIEludHJvU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IEludHJvU2NyZWVuOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSw2QkFBNkI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLG1CQUFtQixNQUFNLHFDQUFxQztBQUNyRSxPQUFPQyxlQUFlLE1BQU0saUNBQWlDO0FBQzdELE9BQU9DLDBCQUEwQixNQUFNLHlDQUF5QztBQUNoRixPQUFPQyxvQ0FBb0MsTUFBTSx3REFBd0Q7QUFDekcsT0FBT0MsaUJBQWlCLE1BQU0seUJBQXlCO0FBQ3ZELE9BQU9DLHdCQUF3QixNQUFNLGdDQUFnQztBQUNyRSxPQUFPQyxVQUFVLE1BQU0sdUJBQXVCO0FBQzlDLE9BQU9DLGVBQWUsTUFBTSwyQkFBMkI7QUFFdkQsTUFBTUMsV0FBVyxTQUFTWCxNQUFNLENBQUM7RUFDL0JZLFdBQVdBLENBQUEsRUFBRztJQUVaLE1BQU1DLE9BQU8sR0FBRztNQUNkQyxJQUFJLEVBQUVOLHdCQUF3QixDQUFDTyxNQUFNLENBQUNDLG1CQUFtQjtNQUN6REMsdUJBQXVCLEVBQUUsSUFBSWxCLFFBQVEsQ0FBRU0sMEJBQTBCLENBQUNhLGdCQUFpQixDQUFDO01BQ3BGQyxjQUFjLEVBQUUsSUFBSWxCLFVBQVUsQ0FBRSxJQUFJQyxLQUFLLENBQUVDLG1CQUFvQixDQUFDLEVBQUU7UUFDaEVpQixzQkFBc0IsRUFBRSxDQUFDO1FBQ3pCQyx1QkFBdUIsRUFBRTtNQUMzQixDQUFFLENBQUM7TUFDSEMsaUJBQWlCLEVBQUUsSUFBSXJCLFVBQVUsQ0FBRSxJQUFJQyxLQUFLLENBQUVFLGVBQWdCLENBQUMsRUFBRTtRQUMvRGdCLHNCQUFzQixFQUFFLENBQUM7UUFDekJDLHVCQUF1QixFQUFFO01BQzNCLENBQUUsQ0FBQztNQUNIRSxzQkFBc0IsRUFBRUEsQ0FBQSxLQUFNLElBQUlqQixvQ0FBb0MsQ0FBQztJQUN6RSxDQUFDO0lBRUQsS0FBSyxDQUNILE1BQU0sSUFBSUcsVUFBVSxDQUFDLENBQUMsRUFDdEJlLEtBQUssSUFBSSxJQUFJZCxlQUFlLENBQUVjLEtBQU0sQ0FBQyxFQUNyQ1gsT0FDRixDQUFDO0VBQ0g7QUFDRjtBQUVBTixpQkFBaUIsQ0FBQ2tCLFFBQVEsQ0FBRSxhQUFhLEVBQUVkLFdBQVksQ0FBQztBQUN4RCxlQUFlQSxXQUFXIn0=