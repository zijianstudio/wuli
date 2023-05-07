// Copyright 2019-2022, University of Colorado Boulder

/**
 * Compare screen for Density
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DensityBuoyancyCommonQueryParameters from '../../../density-buoyancy-common/js/common/DensityBuoyancyCommonQueryParameters.js';
import DensityBuoyancyCommonColors from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyCommonColors.js';
import DensityBuoyancyScreenView from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyScreenView.js';
import DensityCompareModel from '../../../density-buoyancy-common/js/density/model/DensityCompareModel.js';
import DensityCompareScreenView from '../../../density-buoyancy-common/js/density/view/DensityCompareScreenView.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import compare_screen_icon_png from '../../mipmaps/compare_screen_icon_png.js';
import density from '../density.js';
import DensityStrings from '../DensityStrings.js';
export default class CompareScreen extends Screen {
  constructor(tandem) {
    const icon = DensityBuoyancyCommonQueryParameters.generateIconImages ? DensityBuoyancyScreenView.getDensityCompareIcon() : new Image(compare_screen_icon_png);
    super(() => new DensityCompareModel({
      tandem: tandem.createTandem('model')
    }), model => new DensityCompareScreenView(model, {
      tandem: tandem.createTandem('view')
    }), {
      name: DensityStrings.screen.compareStringProperty,
      backgroundColorProperty: DensityBuoyancyCommonColors.skyBottomProperty,
      homeScreenIcon: new ScreenIcon(icon, {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      tandem: tandem
    });
  }
}
density.register('CompareScreen', CompareScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZW5zaXR5QnVveWFuY3lDb21tb25RdWVyeVBhcmFtZXRlcnMiLCJEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMiLCJEZW5zaXR5QnVveWFuY3lTY3JlZW5WaWV3IiwiRGVuc2l0eUNvbXBhcmVNb2RlbCIsIkRlbnNpdHlDb21wYXJlU2NyZWVuVmlldyIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJJbWFnZSIsImNvbXBhcmVfc2NyZWVuX2ljb25fcG5nIiwiZGVuc2l0eSIsIkRlbnNpdHlTdHJpbmdzIiwiQ29tcGFyZVNjcmVlbiIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwiaWNvbiIsImdlbmVyYXRlSWNvbkltYWdlcyIsImdldERlbnNpdHlDb21wYXJlSWNvbiIsImNyZWF0ZVRhbmRlbSIsIm1vZGVsIiwibmFtZSIsInNjcmVlbiIsImNvbXBhcmVTdHJpbmdQcm9wZXJ0eSIsImJhY2tncm91bmRDb2xvclByb3BlcnR5Iiwic2t5Qm90dG9tUHJvcGVydHkiLCJob21lU2NyZWVuSWNvbiIsIm1heEljb25XaWR0aFByb3BvcnRpb24iLCJtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29tcGFyZVNjcmVlbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb21wYXJlIHNjcmVlbiBmb3IgRGVuc2l0eVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IERlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi8uLi8uLi9kZW5zaXR5LWJ1b3lhbmN5LWNvbW1vbi9qcy9jb21tb24vRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycyBmcm9tICcuLi8uLi8uLi9kZW5zaXR5LWJ1b3lhbmN5LWNvbW1vbi9qcy9jb21tb24vdmlldy9EZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMuanMnO1xyXG5pbXBvcnQgRGVuc2l0eUJ1b3lhbmN5U2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi9kZW5zaXR5LWJ1b3lhbmN5LWNvbW1vbi9qcy9jb21tb24vdmlldy9EZW5zaXR5QnVveWFuY3lTY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IERlbnNpdHlDb21wYXJlTW9kZWwgZnJvbSAnLi4vLi4vLi4vZGVuc2l0eS1idW95YW5jeS1jb21tb24vanMvZGVuc2l0eS9tb2RlbC9EZW5zaXR5Q29tcGFyZU1vZGVsLmpzJztcclxuaW1wb3J0IERlbnNpdHlDb21wYXJlU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi9kZW5zaXR5LWJ1b3lhbmN5LWNvbW1vbi9qcy9kZW5zaXR5L3ZpZXcvRGVuc2l0eUNvbXBhcmVTY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgY29tcGFyZV9zY3JlZW5faWNvbl9wbmcgZnJvbSAnLi4vLi4vbWlwbWFwcy9jb21wYXJlX3NjcmVlbl9pY29uX3BuZy5qcyc7XHJcbmltcG9ydCBkZW5zaXR5IGZyb20gJy4uL2RlbnNpdHkuanMnO1xyXG5pbXBvcnQgRGVuc2l0eVN0cmluZ3MgZnJvbSAnLi4vRGVuc2l0eVN0cmluZ3MuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcGFyZVNjcmVlbiBleHRlbmRzIFNjcmVlbjxEZW5zaXR5Q29tcGFyZU1vZGVsLCBEZW5zaXR5Q29tcGFyZVNjcmVlblZpZXc+IHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xyXG4gICAgY29uc3QgaWNvbiA9IERlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycy5nZW5lcmF0ZUljb25JbWFnZXMgPyBEZW5zaXR5QnVveWFuY3lTY3JlZW5WaWV3LmdldERlbnNpdHlDb21wYXJlSWNvbigpIDogbmV3IEltYWdlKCBjb21wYXJlX3NjcmVlbl9pY29uX3BuZyApO1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgRGVuc2l0eUNvbXBhcmVNb2RlbCgge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vZGVsJyApXHJcbiAgICAgIH0gKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IERlbnNpdHlDb21wYXJlU2NyZWVuVmlldyggbW9kZWwsIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3JyApXHJcbiAgICAgIH0gKSxcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6IERlbnNpdHlTdHJpbmdzLnNjcmVlbi5jb21wYXJlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5za3lCb3R0b21Qcm9wZXJ0eSxcclxuICAgICAgICBob21lU2NyZWVuSWNvbjogbmV3IFNjcmVlbkljb24oIGljb24sIHtcclxuICAgICAgICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgICAgICAgICBtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbjogMVxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuZGVuc2l0eS5yZWdpc3RlciggJ0NvbXBhcmVTY3JlZW4nLCBDb21wYXJlU2NyZWVuICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxvQ0FBb0MsTUFBTSxvRkFBb0Y7QUFDckksT0FBT0MsMkJBQTJCLE1BQU0sZ0ZBQWdGO0FBQ3hILE9BQU9DLHlCQUF5QixNQUFNLDhFQUE4RTtBQUNwSCxPQUFPQyxtQkFBbUIsTUFBTSwwRUFBMEU7QUFDMUcsT0FBT0Msd0JBQXdCLE1BQU0sOEVBQThFO0FBQ25ILE9BQU9DLE1BQU0sTUFBTSw2QkFBNkI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBRXRELE9BQU9DLHVCQUF1QixNQUFNLDBDQUEwQztBQUM5RSxPQUFPQyxPQUFPLE1BQU0sZUFBZTtBQUNuQyxPQUFPQyxjQUFjLE1BQU0sc0JBQXNCO0FBRWpELGVBQWUsTUFBTUMsYUFBYSxTQUFTTixNQUFNLENBQWdEO0VBQ3hGTyxXQUFXQSxDQUFFQyxNQUFjLEVBQUc7SUFDbkMsTUFBTUMsSUFBSSxHQUFHZCxvQ0FBb0MsQ0FBQ2Usa0JBQWtCLEdBQUdiLHlCQUF5QixDQUFDYyxxQkFBcUIsQ0FBQyxDQUFDLEdBQUcsSUFBSVQsS0FBSyxDQUFFQyx1QkFBd0IsQ0FBQztJQUUvSixLQUFLLENBQ0gsTUFBTSxJQUFJTCxtQkFBbUIsQ0FBRTtNQUM3QlUsTUFBTSxFQUFFQSxNQUFNLENBQUNJLFlBQVksQ0FBRSxPQUFRO0lBQ3ZDLENBQUUsQ0FBQyxFQUNIQyxLQUFLLElBQUksSUFBSWQsd0JBQXdCLENBQUVjLEtBQUssRUFBRTtNQUM1Q0wsTUFBTSxFQUFFQSxNQUFNLENBQUNJLFlBQVksQ0FBRSxNQUFPO0lBQ3RDLENBQUUsQ0FBQyxFQUNIO01BQ0VFLElBQUksRUFBRVQsY0FBYyxDQUFDVSxNQUFNLENBQUNDLHFCQUFxQjtNQUNqREMsdUJBQXVCLEVBQUVyQiwyQkFBMkIsQ0FBQ3NCLGlCQUFpQjtNQUN0RUMsY0FBYyxFQUFFLElBQUlsQixVQUFVLENBQUVRLElBQUksRUFBRTtRQUNwQ1csc0JBQXNCLEVBQUUsQ0FBQztRQUN6QkMsdUJBQXVCLEVBQUU7TUFDM0IsQ0FBRSxDQUFDO01BQ0hiLE1BQU0sRUFBRUE7SUFDVixDQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFKLE9BQU8sQ0FBQ2tCLFFBQVEsQ0FBRSxlQUFlLEVBQUVoQixhQUFjLENBQUMifQ==