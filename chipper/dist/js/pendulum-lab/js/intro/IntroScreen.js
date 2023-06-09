// Copyright 2014-2022, University of Colorado Boulder

/**
 * Intro screen.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import introNavbarIcon_png from '../../mipmaps/introNavbarIcon_png.js';
import introScreenIcon_png from '../../mipmaps/introScreenIcon_png.js';
import PendulumLabModel from '../common/model/PendulumLabModel.js';
import PendulumLabConstants from '../common/PendulumLabConstants.js';
import PendulumLabScreenView from '../common/view/PendulumLabScreenView.js';
import pendulumLab from '../pendulumLab.js';
import PendulumLabStrings from '../PendulumLabStrings.js';
class IntroScreen extends Screen {
  constructor() {
    const options = {
      name: PendulumLabStrings.screen.introStringProperty,
      backgroundColorProperty: new Property(PendulumLabConstants.BACKGROUND_COLOR),
      homeScreenIcon: new ScreenIcon(new Image(introScreenIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      navigationBarIcon: new ScreenIcon(new Image(introNavbarIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      })
    };
    super(() => new PendulumLabModel(), model => new PendulumLabScreenView(model), options);
  }
}
pendulumLab.register('IntroScreen', IntroScreen);
export default IntroScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJJbWFnZSIsImludHJvTmF2YmFySWNvbl9wbmciLCJpbnRyb1NjcmVlbkljb25fcG5nIiwiUGVuZHVsdW1MYWJNb2RlbCIsIlBlbmR1bHVtTGFiQ29uc3RhbnRzIiwiUGVuZHVsdW1MYWJTY3JlZW5WaWV3IiwicGVuZHVsdW1MYWIiLCJQZW5kdWx1bUxhYlN0cmluZ3MiLCJJbnRyb1NjcmVlbiIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIm5hbWUiLCJzY3JlZW4iLCJpbnRyb1N0cmluZ1Byb3BlcnR5IiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJCQUNLR1JPVU5EX0NPTE9SIiwiaG9tZVNjcmVlbkljb24iLCJtYXhJY29uV2lkdGhQcm9wb3J0aW9uIiwibWF4SWNvbkhlaWdodFByb3BvcnRpb24iLCJuYXZpZ2F0aW9uQmFySWNvbiIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbnRyb1NjcmVlbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBJbnRybyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNbGVhcm5lcilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGludHJvTmF2YmFySWNvbl9wbmcgZnJvbSAnLi4vLi4vbWlwbWFwcy9pbnRyb05hdmJhckljb25fcG5nLmpzJztcclxuaW1wb3J0IGludHJvU2NyZWVuSWNvbl9wbmcgZnJvbSAnLi4vLi4vbWlwbWFwcy9pbnRyb1NjcmVlbkljb25fcG5nLmpzJztcclxuaW1wb3J0IFBlbmR1bHVtTGFiTW9kZWwgZnJvbSAnLi4vY29tbW9uL21vZGVsL1BlbmR1bHVtTGFiTW9kZWwuanMnO1xyXG5pbXBvcnQgUGVuZHVsdW1MYWJDb25zdGFudHMgZnJvbSAnLi4vY29tbW9uL1BlbmR1bHVtTGFiQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFBlbmR1bHVtTGFiU2NyZWVuVmlldyBmcm9tICcuLi9jb21tb24vdmlldy9QZW5kdWx1bUxhYlNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgcGVuZHVsdW1MYWIgZnJvbSAnLi4vcGVuZHVsdW1MYWIuanMnO1xyXG5pbXBvcnQgUGVuZHVsdW1MYWJTdHJpbmdzIGZyb20gJy4uL1BlbmR1bHVtTGFiU3RyaW5ncy5qcyc7XHJcblxyXG5jbGFzcyBJbnRyb1NjcmVlbiBleHRlbmRzIFNjcmVlbiB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgICAgbmFtZTogUGVuZHVsdW1MYWJTdHJpbmdzLnNjcmVlbi5pbnRyb1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBQZW5kdWx1bUxhYkNvbnN0YW50cy5CQUNLR1JPVU5EX0NPTE9SICksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBuZXcgU2NyZWVuSWNvbiggbmV3IEltYWdlKCBpbnRyb1NjcmVlbkljb25fcG5nICksIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgbmF2aWdhdGlvbkJhckljb246IG5ldyBTY3JlZW5JY29uKCBuZXcgSW1hZ2UoIGludHJvTmF2YmFySWNvbl9wbmcgKSwge1xyXG4gICAgICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgICAgfSApXHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgUGVuZHVsdW1MYWJNb2RlbCgpLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgUGVuZHVsdW1MYWJTY3JlZW5WaWV3KCBtb2RlbCApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxucGVuZHVsdW1MYWIucmVnaXN0ZXIoICdJbnRyb1NjcmVlbicsIEludHJvU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IEludHJvU2NyZWVuOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSw2QkFBNkI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLG1CQUFtQixNQUFNLHNDQUFzQztBQUN0RSxPQUFPQyxtQkFBbUIsTUFBTSxzQ0FBc0M7QUFDdEUsT0FBT0MsZ0JBQWdCLE1BQU0scUNBQXFDO0FBQ2xFLE9BQU9DLG9CQUFvQixNQUFNLG1DQUFtQztBQUNwRSxPQUFPQyxxQkFBcUIsTUFBTSx5Q0FBeUM7QUFDM0UsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQUMzQyxPQUFPQyxrQkFBa0IsTUFBTSwwQkFBMEI7QUFFekQsTUFBTUMsV0FBVyxTQUFTVixNQUFNLENBQUM7RUFDL0JXLFdBQVdBLENBQUEsRUFBRztJQUVaLE1BQU1DLE9BQU8sR0FBRztNQUNkQyxJQUFJLEVBQUVKLGtCQUFrQixDQUFDSyxNQUFNLENBQUNDLG1CQUFtQjtNQUNuREMsdUJBQXVCLEVBQUUsSUFBSWpCLFFBQVEsQ0FBRU8sb0JBQW9CLENBQUNXLGdCQUFpQixDQUFDO01BQzlFQyxjQUFjLEVBQUUsSUFBSWpCLFVBQVUsQ0FBRSxJQUFJQyxLQUFLLENBQUVFLG1CQUFvQixDQUFDLEVBQUU7UUFDaEVlLHNCQUFzQixFQUFFLENBQUM7UUFDekJDLHVCQUF1QixFQUFFO01BQzNCLENBQUUsQ0FBQztNQUNIQyxpQkFBaUIsRUFBRSxJQUFJcEIsVUFBVSxDQUFFLElBQUlDLEtBQUssQ0FBRUMsbUJBQW9CLENBQUMsRUFBRTtRQUNuRWdCLHNCQUFzQixFQUFFLENBQUM7UUFDekJDLHVCQUF1QixFQUFFO01BQzNCLENBQUU7SUFDSixDQUFDO0lBRUQsS0FBSyxDQUNILE1BQU0sSUFBSWYsZ0JBQWdCLENBQUMsQ0FBQyxFQUM1QmlCLEtBQUssSUFBSSxJQUFJZixxQkFBcUIsQ0FBRWUsS0FBTSxDQUFDLEVBQzNDVixPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFKLFdBQVcsQ0FBQ2UsUUFBUSxDQUFFLGFBQWEsRUFBRWIsV0FBWSxDQUFDO0FBQ2xELGVBQWVBLFdBQVcifQ==