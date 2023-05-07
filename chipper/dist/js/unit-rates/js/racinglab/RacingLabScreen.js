// Copyright 2016-2023, University of Colorado Boulder

/**
 * The 'Racing Lab' screen
 *
 * @author Dave Schmitz (Schmitzware)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import merge from '../../../phet-core/js/merge.js';
import { Image } from '../../../scenery/js/imports.js';
import racingLabScreenIcon_png from '../../images/racingLabScreenIcon_png.js';
import URColors from '../common/URColors.js';
import unitRates from '../unitRates.js';
import UnitRatesStrings from '../UnitRatesStrings.js';
import RacingLabModel from './model/RacingLabModel.js';
import RacingLabScreenView from './view/RacingLabScreenView.js';
export default class RacingLabScreen extends Screen {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      name: UnitRatesStrings.screen.racingLabStringProperty,
      backgroundColorProperty: new Property(URColors.racingLabScreenBackground),
      homeScreenIcon: new ScreenIcon(new Image(racingLabScreenIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      })
    }, options);
    super(() => new RacingLabModel(), model => new RacingLabScreenView(model), options);
  }
}
unitRates.register('RacingLabScreen', RacingLabScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJtZXJnZSIsIkltYWdlIiwicmFjaW5nTGFiU2NyZWVuSWNvbl9wbmciLCJVUkNvbG9ycyIsInVuaXRSYXRlcyIsIlVuaXRSYXRlc1N0cmluZ3MiLCJSYWNpbmdMYWJNb2RlbCIsIlJhY2luZ0xhYlNjcmVlblZpZXciLCJSYWNpbmdMYWJTY3JlZW4iLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJuYW1lIiwic2NyZWVuIiwicmFjaW5nTGFiU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsInJhY2luZ0xhYlNjcmVlbkJhY2tncm91bmQiLCJob21lU2NyZWVuSWNvbiIsIm1heEljb25XaWR0aFByb3BvcnRpb24iLCJtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbiIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSYWNpbmdMYWJTY3JlZW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlICdSYWNpbmcgTGFiJyBzY3JlZW5cclxuICpcclxuICogQGF1dGhvciBEYXZlIFNjaG1pdHogKFNjaG1pdHp3YXJlKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHJhY2luZ0xhYlNjcmVlbkljb25fcG5nIGZyb20gJy4uLy4uL2ltYWdlcy9yYWNpbmdMYWJTY3JlZW5JY29uX3BuZy5qcyc7XHJcbmltcG9ydCBVUkNvbG9ycyBmcm9tICcuLi9jb21tb24vVVJDb2xvcnMuanMnO1xyXG5pbXBvcnQgdW5pdFJhdGVzIGZyb20gJy4uL3VuaXRSYXRlcy5qcyc7XHJcbmltcG9ydCBVbml0UmF0ZXNTdHJpbmdzIGZyb20gJy4uL1VuaXRSYXRlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgUmFjaW5nTGFiTW9kZWwgZnJvbSAnLi9tb2RlbC9SYWNpbmdMYWJNb2RlbC5qcyc7XHJcbmltcG9ydCBSYWNpbmdMYWJTY3JlZW5WaWV3IGZyb20gJy4vdmlldy9SYWNpbmdMYWJTY3JlZW5WaWV3LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJhY2luZ0xhYlNjcmVlbiBleHRlbmRzIFNjcmVlbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgbmFtZTogVW5pdFJhdGVzU3RyaW5ncy5zY3JlZW4ucmFjaW5nTGFiU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvcGVydHkoIFVSQ29sb3JzLnJhY2luZ0xhYlNjcmVlbkJhY2tncm91bmQgKSxcclxuICAgICAgaG9tZVNjcmVlbkljb246IG5ldyBTY3JlZW5JY29uKCBuZXcgSW1hZ2UoIHJhY2luZ0xhYlNjcmVlbkljb25fcG5nICksIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgUmFjaW5nTGFiTW9kZWwoKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IFJhY2luZ0xhYlNjcmVlblZpZXcoIG1vZGVsICksXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG51bml0UmF0ZXMucmVnaXN0ZXIoICdSYWNpbmdMYWJTY3JlZW4nLCBSYWNpbmdMYWJTY3JlZW4gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSw2QkFBNkI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxLQUFLLE1BQU0sZ0NBQWdDO0FBQ2xELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsdUJBQXVCLE1BQU0seUNBQXlDO0FBQzdFLE9BQU9DLFFBQVEsTUFBTSx1QkFBdUI7QUFDNUMsT0FBT0MsU0FBUyxNQUFNLGlCQUFpQjtBQUN2QyxPQUFPQyxnQkFBZ0IsTUFBTSx3QkFBd0I7QUFDckQsT0FBT0MsY0FBYyxNQUFNLDJCQUEyQjtBQUN0RCxPQUFPQyxtQkFBbUIsTUFBTSwrQkFBK0I7QUFFL0QsZUFBZSxNQUFNQyxlQUFlLFNBQVNWLE1BQU0sQ0FBQztFQUVsRDtBQUNGO0FBQ0E7RUFDRVcsV0FBV0EsQ0FBRUMsT0FBTyxFQUFHO0lBRXJCQSxPQUFPLEdBQUdWLEtBQUssQ0FBRTtNQUNmVyxJQUFJLEVBQUVOLGdCQUFnQixDQUFDTyxNQUFNLENBQUNDLHVCQUF1QjtNQUNyREMsdUJBQXVCLEVBQUUsSUFBSWpCLFFBQVEsQ0FBRU0sUUFBUSxDQUFDWSx5QkFBMEIsQ0FBQztNQUMzRUMsY0FBYyxFQUFFLElBQUlqQixVQUFVLENBQUUsSUFBSUUsS0FBSyxDQUFFQyx1QkFBd0IsQ0FBQyxFQUFFO1FBQ3BFZSxzQkFBc0IsRUFBRSxDQUFDO1FBQ3pCQyx1QkFBdUIsRUFBRTtNQUMzQixDQUFFO0lBQ0osQ0FBQyxFQUFFUixPQUFRLENBQUM7SUFFWixLQUFLLENBQ0gsTUFBTSxJQUFJSixjQUFjLENBQUMsQ0FBQyxFQUMxQmEsS0FBSyxJQUFJLElBQUlaLG1CQUFtQixDQUFFWSxLQUFNLENBQUMsRUFDekNULE9BQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQU4sU0FBUyxDQUFDZ0IsUUFBUSxDQUFFLGlCQUFpQixFQUFFWixlQUFnQixDQUFDIn0=