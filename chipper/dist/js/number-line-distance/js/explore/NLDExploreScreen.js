// Copyright 2020-2022, University of Colorado Boulder

/**
 * the 'Explore' screen in the Number Line: Distance simulation
 *
 * @author Saurabh Totey
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import exploreHomeIcon_png from '../../images/exploreHomeIcon_png.js';
import exploreNavbarIcon_png from '../../images/exploreNavbarIcon_png.js';
import NLDColors from '../common/NLDColors.js';
import numberLineDistance from '../numberLineDistance.js';
import NumberLineDistanceStrings from '../NumberLineDistanceStrings.js';
import NLDExploreModel from './model/NLDExploreModel.js';
import NLDExploreScreenView from './view/NLDExploreScreenView.js';
class NLDExploreScreen extends Screen {
  /**
   * @param {Tandem} tandem
   * @public
   */
  constructor(tandem) {
    const options = {
      name: NumberLineDistanceStrings.screen.exploreStringProperty,
      backgroundColorProperty: NLDColors.exploreScreenBackgroundColorProperty,
      homeScreenIcon: new ScreenIcon(new Image(exploreHomeIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      navigationBarIcon: new ScreenIcon(new Image(exploreNavbarIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      tandem: tandem
    };
    super(() => new NLDExploreModel(tandem.createTandem('model')), model => new NLDExploreScreenView(model, tandem.createTandem('view')), options);
  }
}
numberLineDistance.register('NLDExploreScreen', NLDExploreScreen);
export default NLDExploreScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJTY3JlZW5JY29uIiwiSW1hZ2UiLCJleHBsb3JlSG9tZUljb25fcG5nIiwiZXhwbG9yZU5hdmJhckljb25fcG5nIiwiTkxEQ29sb3JzIiwibnVtYmVyTGluZURpc3RhbmNlIiwiTnVtYmVyTGluZURpc3RhbmNlU3RyaW5ncyIsIk5MREV4cGxvcmVNb2RlbCIsIk5MREV4cGxvcmVTY3JlZW5WaWV3IiwiTkxERXhwbG9yZVNjcmVlbiIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwib3B0aW9ucyIsIm5hbWUiLCJzY3JlZW4iLCJleHBsb3JlU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImV4cGxvcmVTY3JlZW5CYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImhvbWVTY3JlZW5JY29uIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwibmF2aWdhdGlvbkJhckljb24iLCJjcmVhdGVUYW5kZW0iLCJtb2RlbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTkxERXhwbG9yZVNjcmVlbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiB0aGUgJ0V4cGxvcmUnIHNjcmVlbiBpbiB0aGUgTnVtYmVyIExpbmU6IERpc3RhbmNlIHNpbXVsYXRpb25cclxuICpcclxuICogQGF1dGhvciBTYXVyYWJoIFRvdGV5XHJcbiAqL1xyXG5cclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZXhwbG9yZUhvbWVJY29uX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvZXhwbG9yZUhvbWVJY29uX3BuZy5qcyc7XHJcbmltcG9ydCBleHBsb3JlTmF2YmFySWNvbl9wbmcgZnJvbSAnLi4vLi4vaW1hZ2VzL2V4cGxvcmVOYXZiYXJJY29uX3BuZy5qcyc7XHJcbmltcG9ydCBOTERDb2xvcnMgZnJvbSAnLi4vY29tbW9uL05MRENvbG9ycy5qcyc7XHJcbmltcG9ydCBudW1iZXJMaW5lRGlzdGFuY2UgZnJvbSAnLi4vbnVtYmVyTGluZURpc3RhbmNlLmpzJztcclxuaW1wb3J0IE51bWJlckxpbmVEaXN0YW5jZVN0cmluZ3MgZnJvbSAnLi4vTnVtYmVyTGluZURpc3RhbmNlU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBOTERFeHBsb3JlTW9kZWwgZnJvbSAnLi9tb2RlbC9OTERFeHBsb3JlTW9kZWwuanMnO1xyXG5pbXBvcnQgTkxERXhwbG9yZVNjcmVlblZpZXcgZnJvbSAnLi92aWV3L05MREV4cGxvcmVTY3JlZW5WaWV3LmpzJztcclxuXHJcbmNsYXNzIE5MREV4cGxvcmVTY3JlZW4gZXh0ZW5kcyBTY3JlZW4ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0YW5kZW0gKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICBuYW1lOiBOdW1iZXJMaW5lRGlzdGFuY2VTdHJpbmdzLnNjcmVlbi5leHBsb3JlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBOTERDb2xvcnMuZXhwbG9yZVNjcmVlbkJhY2tncm91bmRDb2xvclByb3BlcnR5LFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogbmV3IFNjcmVlbkljb24oIG5ldyBJbWFnZSggZXhwbG9yZUhvbWVJY29uX3BuZyApLCB7XHJcbiAgICAgICAgbWF4SWNvbldpZHRoUHJvcG9ydGlvbjogMSxcclxuICAgICAgICBtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbjogMVxyXG4gICAgICB9ICksXHJcbiAgICAgIG5hdmlnYXRpb25CYXJJY29uOiBuZXcgU2NyZWVuSWNvbiggbmV3IEltYWdlKCBleHBsb3JlTmF2YmFySWNvbl9wbmcgKSwge1xyXG4gICAgICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgICAgfSApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IE5MREV4cGxvcmVNb2RlbCggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vZGVsJyApICksXHJcbiAgICAgIG1vZGVsID0+IG5ldyBOTERFeHBsb3JlU2NyZWVuVmlldyggbW9kZWwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3JyApICksXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxubnVtYmVyTGluZURpc3RhbmNlLnJlZ2lzdGVyKCAnTkxERXhwbG9yZVNjcmVlbicsIE5MREV4cGxvcmVTY3JlZW4gKTtcclxuZXhwb3J0IGRlZmF1bHQgTkxERXhwbG9yZVNjcmVlbjtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE1BQU0sTUFBTSw2QkFBNkI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLG1CQUFtQixNQUFNLHFDQUFxQztBQUNyRSxPQUFPQyxxQkFBcUIsTUFBTSx1Q0FBdUM7QUFDekUsT0FBT0MsU0FBUyxNQUFNLHdCQUF3QjtBQUM5QyxPQUFPQyxrQkFBa0IsTUFBTSwwQkFBMEI7QUFDekQsT0FBT0MseUJBQXlCLE1BQU0saUNBQWlDO0FBQ3ZFLE9BQU9DLGVBQWUsTUFBTSw0QkFBNEI7QUFDeEQsT0FBT0Msb0JBQW9CLE1BQU0sZ0NBQWdDO0FBRWpFLE1BQU1DLGdCQUFnQixTQUFTVixNQUFNLENBQUM7RUFFcEM7QUFDRjtBQUNBO0FBQ0E7RUFDRVcsV0FBV0EsQ0FBRUMsTUFBTSxFQUFHO0lBQ3BCLE1BQU1DLE9BQU8sR0FBRztNQUNkQyxJQUFJLEVBQUVQLHlCQUF5QixDQUFDUSxNQUFNLENBQUNDLHFCQUFxQjtNQUM1REMsdUJBQXVCLEVBQUVaLFNBQVMsQ0FBQ2Esb0NBQW9DO01BQ3ZFQyxjQUFjLEVBQUUsSUFBSWxCLFVBQVUsQ0FBRSxJQUFJQyxLQUFLLENBQUVDLG1CQUFvQixDQUFDLEVBQUU7UUFDaEVpQixzQkFBc0IsRUFBRSxDQUFDO1FBQ3pCQyx1QkFBdUIsRUFBRTtNQUMzQixDQUFFLENBQUM7TUFDSEMsaUJBQWlCLEVBQUUsSUFBSXJCLFVBQVUsQ0FBRSxJQUFJQyxLQUFLLENBQUVFLHFCQUFzQixDQUFDLEVBQUU7UUFDckVnQixzQkFBc0IsRUFBRSxDQUFDO1FBQ3pCQyx1QkFBdUIsRUFBRTtNQUMzQixDQUFFLENBQUM7TUFDSFQsTUFBTSxFQUFFQTtJQUNWLENBQUM7SUFFRCxLQUFLLENBQ0gsTUFBTSxJQUFJSixlQUFlLENBQUVJLE1BQU0sQ0FBQ1csWUFBWSxDQUFFLE9BQVEsQ0FBRSxDQUFDLEVBQzNEQyxLQUFLLElBQUksSUFBSWYsb0JBQW9CLENBQUVlLEtBQUssRUFBRVosTUFBTSxDQUFDVyxZQUFZLENBQUUsTUFBTyxDQUFFLENBQUMsRUFDekVWLE9BQ0YsQ0FBQztFQUNIO0FBRUY7QUFFQVAsa0JBQWtCLENBQUNtQixRQUFRLENBQUUsa0JBQWtCLEVBQUVmLGdCQUFpQixDQUFDO0FBQ25FLGVBQWVBLGdCQUFnQiJ9