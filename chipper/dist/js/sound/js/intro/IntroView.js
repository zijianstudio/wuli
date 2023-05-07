// Copyright 2022, University of Colorado Boulder
/**
 * View for the single source view.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Image } from '../../../scenery/js/imports.js';
import girl_png from '../../images/girl_png.js';
import SoundConstants from '../common/SoundConstants.js';
import MovableNode from '../common/view/MovableNode.js';
import sound from '../sound.js';
import SoundScreenView from '../common/view/SoundScreenView.js';
export default class IntroView extends SoundScreenView {
  constructor(model) {
    super(model);

    // Listener
    const bounds = new Bounds2(SoundConstants.LISTENER_BOUNDS_X.min, model.listenerPositionProperty.value.y, SoundConstants.LISTENER_BOUNDS_X.max, 1);
    const child = new Image(girl_png, {
      center: new Vector2(0, 0)
    });
    this.addChild(new MovableNode(model.listenerPositionProperty, bounds, model.modelViewTransform, child));
  }
}
sound.register('IntroView', IntroView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsIkltYWdlIiwiZ2lybF9wbmciLCJTb3VuZENvbnN0YW50cyIsIk1vdmFibGVOb2RlIiwic291bmQiLCJTb3VuZFNjcmVlblZpZXciLCJJbnRyb1ZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwiYm91bmRzIiwiTElTVEVORVJfQk9VTkRTX1giLCJtaW4iLCJsaXN0ZW5lclBvc2l0aW9uUHJvcGVydHkiLCJ2YWx1ZSIsInkiLCJtYXgiLCJjaGlsZCIsImNlbnRlciIsImFkZENoaWxkIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbnRyb1ZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogVmlldyBmb3IgdGhlIHNpbmdsZSBzb3VyY2Ugdmlldy5cclxuICpcclxuICogQGF1dGhvciBQaWV0IEdvcmlzIChVbml2ZXJzaXR5IG9mIExldXZlbilcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZ2lybF9wbmcgZnJvbSAnLi4vLi4vaW1hZ2VzL2dpcmxfcG5nLmpzJztcclxuaW1wb3J0IFNvdW5kQ29uc3RhbnRzIGZyb20gJy4uL2NvbW1vbi9Tb3VuZENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBNb3ZhYmxlTm9kZSBmcm9tICcuLi9jb21tb24vdmlldy9Nb3ZhYmxlTm9kZS5qcyc7XHJcbmltcG9ydCBzb3VuZCBmcm9tICcuLi9zb3VuZC5qcyc7XHJcbmltcG9ydCBJbnRyb01vZGVsIGZyb20gJy4vSW50cm9Nb2RlbC5qcyc7XHJcbmltcG9ydCBTb3VuZFNjcmVlblZpZXcgZnJvbSAnLi4vY29tbW9uL3ZpZXcvU291bmRTY3JlZW5WaWV3LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludHJvVmlldyBleHRlbmRzIFNvdW5kU2NyZWVuVmlldyB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogSW50cm9Nb2RlbCApIHtcclxuICAgIHN1cGVyKCBtb2RlbCApO1xyXG5cclxuICAgIC8vIExpc3RlbmVyXHJcbiAgICBjb25zdCBib3VuZHMgPSBuZXcgQm91bmRzMiggU291bmRDb25zdGFudHMuTElTVEVORVJfQk9VTkRTX1gubWluLCBtb2RlbC5saXN0ZW5lclBvc2l0aW9uUHJvcGVydHkudmFsdWUueSwgU291bmRDb25zdGFudHMuTElTVEVORVJfQk9VTkRTX1gubWF4LCAxICk7XHJcbiAgICBjb25zdCBjaGlsZCA9IG5ldyBJbWFnZSggZ2lybF9wbmcsIHtcclxuICAgICAgY2VudGVyOiBuZXcgVmVjdG9yMiggMCwgMCApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgTW92YWJsZU5vZGUoIG1vZGVsLmxpc3RlbmVyUG9zaXRpb25Qcm9wZXJ0eSwgYm91bmRzLCBtb2RlbC5tb2RlbFZpZXdUcmFuc2Zvcm0hLCBjaGlsZCApICk7XHJcbiAgfVxyXG59XHJcblxyXG5zb3VuZC5yZWdpc3RlciggJ0ludHJvVmlldycsIEludHJvVmlldyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsUUFBUSxNQUFNLDBCQUEwQjtBQUMvQyxPQUFPQyxjQUFjLE1BQU0sNkJBQTZCO0FBQ3hELE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsS0FBSyxNQUFNLGFBQWE7QUFFL0IsT0FBT0MsZUFBZSxNQUFNLG1DQUFtQztBQUUvRCxlQUFlLE1BQU1DLFNBQVMsU0FBU0QsZUFBZSxDQUFDO0VBQzlDRSxXQUFXQSxDQUFFQyxLQUFpQixFQUFHO0lBQ3RDLEtBQUssQ0FBRUEsS0FBTSxDQUFDOztJQUVkO0lBQ0EsTUFBTUMsTUFBTSxHQUFHLElBQUlYLE9BQU8sQ0FBRUksY0FBYyxDQUFDUSxpQkFBaUIsQ0FBQ0MsR0FBRyxFQUFFSCxLQUFLLENBQUNJLHdCQUF3QixDQUFDQyxLQUFLLENBQUNDLENBQUMsRUFBRVosY0FBYyxDQUFDUSxpQkFBaUIsQ0FBQ0ssR0FBRyxFQUFFLENBQUUsQ0FBQztJQUNuSixNQUFNQyxLQUFLLEdBQUcsSUFBSWhCLEtBQUssQ0FBRUMsUUFBUSxFQUFFO01BQ2pDZ0IsTUFBTSxFQUFFLElBQUlsQixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUU7SUFDNUIsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDbUIsUUFBUSxDQUFFLElBQUlmLFdBQVcsQ0FBRUssS0FBSyxDQUFDSSx3QkFBd0IsRUFBRUgsTUFBTSxFQUFFRCxLQUFLLENBQUNXLGtCQUFrQixFQUFHSCxLQUFNLENBQUUsQ0FBQztFQUM5RztBQUNGO0FBRUFaLEtBQUssQ0FBQ2dCLFFBQVEsQ0FBRSxXQUFXLEVBQUVkLFNBQVUsQ0FBQyJ9