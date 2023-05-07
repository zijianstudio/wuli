// Copyright 2014-2022, University of Colorado Boulder

/**
 * Lab screen.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import labNavbarIcon_png from '../../mipmaps/labNavbarIcon_png.js';
import labScreenIcon_png from '../../mipmaps/labScreenIcon_png.js';
import PendulumLabConstants from '../common/PendulumLabConstants.js';
import pendulumLab from '../pendulumLab.js';
import PendulumLabStrings from '../PendulumLabStrings.js';
import LabModel from './model/LabModel.js';
import LabScreenView from './view/LabScreenView.js';
class LabScreen extends Screen {
  constructor() {
    const options = {
      name: PendulumLabStrings.screen.labStringProperty,
      backgroundColorProperty: new Property(PendulumLabConstants.BACKGROUND_COLOR),
      homeScreenIcon: new ScreenIcon(new Image(labScreenIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      navigationBarIcon: new ScreenIcon(new Image(labNavbarIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      })
    };
    super(() => new LabModel(), model => new LabScreenView(model), options);
  }
}
pendulumLab.register('LabScreen', LabScreen);
export default LabScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJJbWFnZSIsImxhYk5hdmJhckljb25fcG5nIiwibGFiU2NyZWVuSWNvbl9wbmciLCJQZW5kdWx1bUxhYkNvbnN0YW50cyIsInBlbmR1bHVtTGFiIiwiUGVuZHVsdW1MYWJTdHJpbmdzIiwiTGFiTW9kZWwiLCJMYWJTY3JlZW5WaWV3IiwiTGFiU2NyZWVuIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibmFtZSIsInNjcmVlbiIsImxhYlN0cmluZ1Byb3BlcnR5IiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJCQUNLR1JPVU5EX0NPTE9SIiwiaG9tZVNjcmVlbkljb24iLCJtYXhJY29uV2lkdGhQcm9wb3J0aW9uIiwibWF4SWNvbkhlaWdodFByb3BvcnRpb24iLCJuYXZpZ2F0aW9uQmFySWNvbiIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMYWJTY3JlZW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTGFiIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbGFiTmF2YmFySWNvbl9wbmcgZnJvbSAnLi4vLi4vbWlwbWFwcy9sYWJOYXZiYXJJY29uX3BuZy5qcyc7XHJcbmltcG9ydCBsYWJTY3JlZW5JY29uX3BuZyBmcm9tICcuLi8uLi9taXBtYXBzL2xhYlNjcmVlbkljb25fcG5nLmpzJztcclxuaW1wb3J0IFBlbmR1bHVtTGFiQ29uc3RhbnRzIGZyb20gJy4uL2NvbW1vbi9QZW5kdWx1bUxhYkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBwZW5kdWx1bUxhYiBmcm9tICcuLi9wZW5kdWx1bUxhYi5qcyc7XHJcbmltcG9ydCBQZW5kdWx1bUxhYlN0cmluZ3MgZnJvbSAnLi4vUGVuZHVsdW1MYWJTdHJpbmdzLmpzJztcclxuaW1wb3J0IExhYk1vZGVsIGZyb20gJy4vbW9kZWwvTGFiTW9kZWwuanMnO1xyXG5pbXBvcnQgTGFiU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvTGFiU2NyZWVuVmlldy5qcyc7XHJcblxyXG5jbGFzcyBMYWJTY3JlZW4gZXh0ZW5kcyBTY3JlZW4ge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIG5hbWU6IFBlbmR1bHVtTGFiU3RyaW5ncy5zY3JlZW4ubGFiU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvcGVydHkoIFBlbmR1bHVtTGFiQ29uc3RhbnRzLkJBQ0tHUk9VTkRfQ09MT1IgKSxcclxuICAgICAgaG9tZVNjcmVlbkljb246IG5ldyBTY3JlZW5JY29uKCBuZXcgSW1hZ2UoIGxhYlNjcmVlbkljb25fcG5nICksIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgbmF2aWdhdGlvbkJhckljb246IG5ldyBTY3JlZW5JY29uKCBuZXcgSW1hZ2UoIGxhYk5hdmJhckljb25fcG5nICksIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKVxyXG4gICAgfTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IExhYk1vZGVsKCksXHJcbiAgICAgIG1vZGVsID0+IG5ldyBMYWJTY3JlZW5WaWV3KCBtb2RlbCApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxucGVuZHVsdW1MYWIucmVnaXN0ZXIoICdMYWJTY3JlZW4nLCBMYWJTY3JlZW4gKTtcclxuZXhwb3J0IGRlZmF1bHQgTGFiU2NyZWVuOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSw2QkFBNkI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLGlCQUFpQixNQUFNLG9DQUFvQztBQUNsRSxPQUFPQyxpQkFBaUIsTUFBTSxvQ0FBb0M7QUFDbEUsT0FBT0Msb0JBQW9CLE1BQU0sbUNBQW1DO0FBQ3BFLE9BQU9DLFdBQVcsTUFBTSxtQkFBbUI7QUFDM0MsT0FBT0Msa0JBQWtCLE1BQU0sMEJBQTBCO0FBQ3pELE9BQU9DLFFBQVEsTUFBTSxxQkFBcUI7QUFDMUMsT0FBT0MsYUFBYSxNQUFNLHlCQUF5QjtBQUVuRCxNQUFNQyxTQUFTLFNBQVNWLE1BQU0sQ0FBQztFQUM3QlcsV0FBV0EsQ0FBQSxFQUFHO0lBRVosTUFBTUMsT0FBTyxHQUFHO01BQ2RDLElBQUksRUFBRU4sa0JBQWtCLENBQUNPLE1BQU0sQ0FBQ0MsaUJBQWlCO01BQ2pEQyx1QkFBdUIsRUFBRSxJQUFJakIsUUFBUSxDQUFFTSxvQkFBb0IsQ0FBQ1ksZ0JBQWlCLENBQUM7TUFDOUVDLGNBQWMsRUFBRSxJQUFJakIsVUFBVSxDQUFFLElBQUlDLEtBQUssQ0FBRUUsaUJBQWtCLENBQUMsRUFBRTtRQUM5RGUsc0JBQXNCLEVBQUUsQ0FBQztRQUN6QkMsdUJBQXVCLEVBQUU7TUFDM0IsQ0FBRSxDQUFDO01BQ0hDLGlCQUFpQixFQUFFLElBQUlwQixVQUFVLENBQUUsSUFBSUMsS0FBSyxDQUFFQyxpQkFBa0IsQ0FBQyxFQUFFO1FBQ2pFZ0Isc0JBQXNCLEVBQUUsQ0FBQztRQUN6QkMsdUJBQXVCLEVBQUU7TUFDM0IsQ0FBRTtJQUNKLENBQUM7SUFFRCxLQUFLLENBQ0gsTUFBTSxJQUFJWixRQUFRLENBQUMsQ0FBQyxFQUNwQmMsS0FBSyxJQUFJLElBQUliLGFBQWEsQ0FBRWEsS0FBTSxDQUFDLEVBQ25DVixPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFOLFdBQVcsQ0FBQ2lCLFFBQVEsQ0FBRSxXQUFXLEVBQUViLFNBQVUsQ0FBQztBQUM5QyxlQUFlQSxTQUFTIn0=