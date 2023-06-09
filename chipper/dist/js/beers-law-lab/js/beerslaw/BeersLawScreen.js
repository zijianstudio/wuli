// Copyright 2013-2022, University of Colorado Boulder

/**
 * The 'Beer's Law' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import { Image } from '../../../scenery/js/imports.js';
import beersLawScreenIcon_jpg from '../../images/beersLawScreenIcon_jpg.js';
import beersLawLab from '../beersLawLab.js';
import BeersLawLabStrings from '../BeersLawLabStrings.js';
import BeersLawModel from './model/BeersLawModel.js';
import BeersLawScreenView from './view/BeersLawScreenView.js';
export default class BeersLawScreen extends Screen {
  constructor(tandem) {
    const options = {
      // ScreenOptions
      name: BeersLawLabStrings.screen.beersLawStringProperty,
      homeScreenIcon: createScreenIcon(),
      tandem: tandem
    };

    // No offset, scale 125x when going from model to view (1cm == 125 pixels)
    const modelViewTransform = ModelViewTransform2.createOffsetScaleMapping(new Vector2(0, 0), 125);
    super(() => new BeersLawModel(modelViewTransform, options.tandem.createTandem('model')), model => new BeersLawScreenView(model, modelViewTransform, options.tandem.createTandem('view')), options);
  }
}
function createScreenIcon() {
  return new ScreenIcon(new Image(beersLawScreenIcon_jpg), {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1
  });
}
beersLawLab.register('BeersLawScreen', BeersLawScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2NyZWVuIiwiU2NyZWVuSWNvbiIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJJbWFnZSIsImJlZXJzTGF3U2NyZWVuSWNvbl9qcGciLCJiZWVyc0xhd0xhYiIsIkJlZXJzTGF3TGFiU3RyaW5ncyIsIkJlZXJzTGF3TW9kZWwiLCJCZWVyc0xhd1NjcmVlblZpZXciLCJCZWVyc0xhd1NjcmVlbiIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwib3B0aW9ucyIsIm5hbWUiLCJzY3JlZW4iLCJiZWVyc0xhd1N0cmluZ1Byb3BlcnR5IiwiaG9tZVNjcmVlbkljb24iLCJjcmVhdGVTY3JlZW5JY29uIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY3JlYXRlT2Zmc2V0U2NhbGVNYXBwaW5nIiwiY3JlYXRlVGFuZGVtIiwibW9kZWwiLCJtYXhJY29uV2lkdGhQcm9wb3J0aW9uIiwibWF4SWNvbkhlaWdodFByb3BvcnRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJlZXJzTGF3U2NyZWVuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSAnQmVlcidzIExhdycgc2NyZWVuLiBDb25mb3JtcyB0byB0aGUgY29udHJhY3Qgc3BlY2lmaWVkIGluIGpvaXN0L1NjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgYmVlcnNMYXdTY3JlZW5JY29uX2pwZyBmcm9tICcuLi8uLi9pbWFnZXMvYmVlcnNMYXdTY3JlZW5JY29uX2pwZy5qcyc7XHJcbmltcG9ydCBiZWVyc0xhd0xhYiBmcm9tICcuLi9iZWVyc0xhd0xhYi5qcyc7XHJcbmltcG9ydCBCZWVyc0xhd0xhYlN0cmluZ3MgZnJvbSAnLi4vQmVlcnNMYXdMYWJTdHJpbmdzLmpzJztcclxuaW1wb3J0IEJlZXJzTGF3TW9kZWwgZnJvbSAnLi9tb2RlbC9CZWVyc0xhd01vZGVsLmpzJztcclxuaW1wb3J0IEJlZXJzTGF3U2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvQmVlcnNMYXdTY3JlZW5WaWV3LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJlZXJzTGF3U2NyZWVuIGV4dGVuZHMgU2NyZWVuPEJlZXJzTGF3TW9kZWwsIEJlZXJzTGF3U2NyZWVuVmlldz4ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcblxyXG4gICAgICAvLyBTY3JlZW5PcHRpb25zXHJcbiAgICAgIG5hbWU6IEJlZXJzTGF3TGFiU3RyaW5ncy5zY3JlZW4uYmVlcnNMYXdTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgaG9tZVNjcmVlbkljb246IGNyZWF0ZVNjcmVlbkljb24oKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH07XHJcblxyXG4gICAgLy8gTm8gb2Zmc2V0LCBzY2FsZSAxMjV4IHdoZW4gZ29pbmcgZnJvbSBtb2RlbCB0byB2aWV3ICgxY20gPT0gMTI1IHBpeGVscylcclxuICAgIGNvbnN0IG1vZGVsVmlld1RyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlT2Zmc2V0U2NhbGVNYXBwaW5nKCBuZXcgVmVjdG9yMiggMCwgMCApLCAxMjUgKTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IEJlZXJzTGF3TW9kZWwoIG1vZGVsVmlld1RyYW5zZm9ybSwgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9kZWwnICkgKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IEJlZXJzTGF3U2NyZWVuVmlldyggbW9kZWwsIG1vZGVsVmlld1RyYW5zZm9ybSwgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlU2NyZWVuSWNvbigpOiBTY3JlZW5JY29uIHtcclxuICByZXR1cm4gbmV3IFNjcmVlbkljb24oIG5ldyBJbWFnZSggYmVlcnNMYXdTY3JlZW5JY29uX2pwZyApLCB7XHJcbiAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICB9ICk7XHJcbn1cclxuXHJcbmJlZXJzTGF3TGFiLnJlZ2lzdGVyKCAnQmVlcnNMYXdTY3JlZW4nLCBCZWVyc0xhd1NjcmVlbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLE1BQU0sTUFBTSw2QkFBNkI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxtQkFBbUIsTUFBTSxvREFBb0Q7QUFDcEYsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUV0RCxPQUFPQyxzQkFBc0IsTUFBTSx3Q0FBd0M7QUFDM0UsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQUMzQyxPQUFPQyxrQkFBa0IsTUFBTSwwQkFBMEI7QUFDekQsT0FBT0MsYUFBYSxNQUFNLDBCQUEwQjtBQUNwRCxPQUFPQyxrQkFBa0IsTUFBTSw4QkFBOEI7QUFFN0QsZUFBZSxNQUFNQyxjQUFjLFNBQVNULE1BQU0sQ0FBb0M7RUFFN0VVLFdBQVdBLENBQUVDLE1BQWMsRUFBRztJQUVuQyxNQUFNQyxPQUFPLEdBQUc7TUFFZDtNQUNBQyxJQUFJLEVBQUVQLGtCQUFrQixDQUFDUSxNQUFNLENBQUNDLHNCQUFzQjtNQUN0REMsY0FBYyxFQUFFQyxnQkFBZ0IsQ0FBQyxDQUFDO01BQ2xDTixNQUFNLEVBQUVBO0lBQ1YsQ0FBQzs7SUFFRDtJQUNBLE1BQU1PLGtCQUFrQixHQUFHaEIsbUJBQW1CLENBQUNpQix3QkFBd0IsQ0FBRSxJQUFJcEIsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFBRSxHQUFJLENBQUM7SUFFbkcsS0FBSyxDQUNILE1BQU0sSUFBSVEsYUFBYSxDQUFFVyxrQkFBa0IsRUFBRU4sT0FBTyxDQUFDRCxNQUFNLENBQUNTLFlBQVksQ0FBRSxPQUFRLENBQUUsQ0FBQyxFQUNyRkMsS0FBSyxJQUFJLElBQUliLGtCQUFrQixDQUFFYSxLQUFLLEVBQUVILGtCQUFrQixFQUFFTixPQUFPLENBQUNELE1BQU0sQ0FBQ1MsWUFBWSxDQUFFLE1BQU8sQ0FBRSxDQUFDLEVBQ25HUixPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUEsU0FBU0ssZ0JBQWdCQSxDQUFBLEVBQWU7RUFDdEMsT0FBTyxJQUFJaEIsVUFBVSxDQUFFLElBQUlFLEtBQUssQ0FBRUMsc0JBQXVCLENBQUMsRUFBRTtJQUMxRGtCLHNCQUFzQixFQUFFLENBQUM7SUFDekJDLHVCQUF1QixFQUFFO0VBQzNCLENBQUUsQ0FBQztBQUNMO0FBRUFsQixXQUFXLENBQUNtQixRQUFRLENBQUUsZ0JBQWdCLEVBQUVmLGNBQWUsQ0FBQyJ9