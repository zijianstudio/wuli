// Copyright 2022, University of Colorado Boulder
/**
 * View for the two source screen.
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
import SpeakerNode from '../common/view/SpeakerNode.js';
import sound from '../sound.js';
import SoundScreenView from '../common/view/SoundScreenView.js';
export default class TwoSourceView extends SoundScreenView {
  constructor(model) {
    super(model);

    // Second speaker
    const bounds = new Bounds2(model.speaker1Position.x, 0, 1, model.getWaveAreaBounds().height);
    const speaker = new SpeakerNode(model.oscillatorProperty);
    this.speakerNode2 = new MovableNode(model.speaker2PositionProperty, bounds, model.modelViewTransform, speaker);
    speaker.setRightCenter(new Vector2(SoundConstants.SPEAKER_OFFSET, 0));
    this.addChild(this.speakerNode2);

    // Listener
    const child = new Image(girl_png, {
      center: new Vector2(0, 0)
    });
    const listenerBounds = new Bounds2(SoundConstants.LISTENER_BOUNDS_X.min, child.height, SoundConstants.LISTENER_BOUNDS_X.max, model.getWaveAreaBounds().height - child.bottom);
    this.listener = new MovableNode(model.listenerPositionProperty, listenerBounds, model.modelViewTransform, child);
    this.addChild(this.listener);
    model.speaker2PositionProperty.link(value => {
      this.canvasNode.source2PositionY = model.modelToLatticeTransform.modelToViewY(value.y);
    });
  }
}
sound.register('TwoSourceView', TwoSourceView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsIkltYWdlIiwiZ2lybF9wbmciLCJTb3VuZENvbnN0YW50cyIsIk1vdmFibGVOb2RlIiwiU3BlYWtlck5vZGUiLCJzb3VuZCIsIlNvdW5kU2NyZWVuVmlldyIsIlR3b1NvdXJjZVZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwiYm91bmRzIiwic3BlYWtlcjFQb3NpdGlvbiIsIngiLCJnZXRXYXZlQXJlYUJvdW5kcyIsImhlaWdodCIsInNwZWFrZXIiLCJvc2NpbGxhdG9yUHJvcGVydHkiLCJzcGVha2VyTm9kZTIiLCJzcGVha2VyMlBvc2l0aW9uUHJvcGVydHkiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJzZXRSaWdodENlbnRlciIsIlNQRUFLRVJfT0ZGU0VUIiwiYWRkQ2hpbGQiLCJjaGlsZCIsImNlbnRlciIsImxpc3RlbmVyQm91bmRzIiwiTElTVEVORVJfQk9VTkRTX1giLCJtaW4iLCJtYXgiLCJib3R0b20iLCJsaXN0ZW5lciIsImxpc3RlbmVyUG9zaXRpb25Qcm9wZXJ0eSIsImxpbmsiLCJ2YWx1ZSIsImNhbnZhc05vZGUiLCJzb3VyY2UyUG9zaXRpb25ZIiwibW9kZWxUb0xhdHRpY2VUcmFuc2Zvcm0iLCJtb2RlbFRvVmlld1kiLCJ5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUd29Tb3VyY2VWaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuLyoqXHJcbiAqIFZpZXcgZm9yIHRoZSB0d28gc291cmNlIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBQaWV0IEdvcmlzIChVbml2ZXJzaXR5IG9mIExldXZlbilcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZ2lybF9wbmcgZnJvbSAnLi4vLi4vaW1hZ2VzL2dpcmxfcG5nLmpzJztcclxuaW1wb3J0IFNvdW5kQ29uc3RhbnRzIGZyb20gJy4uL2NvbW1vbi9Tb3VuZENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBNb3ZhYmxlTm9kZSBmcm9tICcuLi9jb21tb24vdmlldy9Nb3ZhYmxlTm9kZS5qcyc7XHJcbmltcG9ydCBTcGVha2VyTm9kZSBmcm9tICcuLi9jb21tb24vdmlldy9TcGVha2VyTm9kZS5qcyc7XHJcbmltcG9ydCBzb3VuZCBmcm9tICcuLi9zb3VuZC5qcyc7XHJcbmltcG9ydCBUd29Tb3VyY2VNb2RlbCBmcm9tICcuLi90d28tc291cmNlcy9Ud29Tb3VyY2VNb2RlbC5qcyc7XHJcbmltcG9ydCBTb3VuZFNjcmVlblZpZXcgZnJvbSAnLi4vY29tbW9uL3ZpZXcvU291bmRTY3JlZW5WaWV3LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR3b1NvdXJjZVZpZXcgZXh0ZW5kcyBTb3VuZFNjcmVlblZpZXcge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbGlzdGVuZXI6IE1vdmFibGVOb2RlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc3BlYWtlck5vZGUyOiBNb3ZhYmxlTm9kZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogVHdvU291cmNlTW9kZWwgKSB7XHJcbiAgICBzdXBlciggbW9kZWwgKTtcclxuXHJcbiAgICAvLyBTZWNvbmQgc3BlYWtlclxyXG4gICAgY29uc3QgYm91bmRzID0gbmV3IEJvdW5kczIoIG1vZGVsLnNwZWFrZXIxUG9zaXRpb24ueCwgMCwgMSwgbW9kZWwuZ2V0V2F2ZUFyZWFCb3VuZHMoKS5oZWlnaHQgKTtcclxuICAgIGNvbnN0IHNwZWFrZXIgPSBuZXcgU3BlYWtlck5vZGUoIG1vZGVsLm9zY2lsbGF0b3JQcm9wZXJ0eSApO1xyXG4gICAgdGhpcy5zcGVha2VyTm9kZTIgPSBuZXcgTW92YWJsZU5vZGUoIG1vZGVsLnNwZWFrZXIyUG9zaXRpb25Qcm9wZXJ0eSwgYm91bmRzLCBtb2RlbC5tb2RlbFZpZXdUcmFuc2Zvcm0hLCBzcGVha2VyICk7XHJcbiAgICBzcGVha2VyLnNldFJpZ2h0Q2VudGVyKCBuZXcgVmVjdG9yMiggU291bmRDb25zdGFudHMuU1BFQUtFUl9PRkZTRVQsIDAgKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5zcGVha2VyTm9kZTIgKTtcclxuXHJcbiAgICAvLyBMaXN0ZW5lclxyXG4gICAgY29uc3QgY2hpbGQgPSBuZXcgSW1hZ2UoIGdpcmxfcG5nLCB7XHJcbiAgICAgIGNlbnRlcjogbmV3IFZlY3RvcjIoIDAsIDAgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgbGlzdGVuZXJCb3VuZHMgPSBuZXcgQm91bmRzMiggU291bmRDb25zdGFudHMuTElTVEVORVJfQk9VTkRTX1gubWluLCBjaGlsZC5oZWlnaHQsIFNvdW5kQ29uc3RhbnRzLkxJU1RFTkVSX0JPVU5EU19YLm1heCwgbW9kZWwuZ2V0V2F2ZUFyZWFCb3VuZHMoKS5oZWlnaHQgLSBjaGlsZC5ib3R0b20gKTtcclxuICAgIHRoaXMubGlzdGVuZXIgPSBuZXcgTW92YWJsZU5vZGUoIG1vZGVsLmxpc3RlbmVyUG9zaXRpb25Qcm9wZXJ0eSwgbGlzdGVuZXJCb3VuZHMsIG1vZGVsLm1vZGVsVmlld1RyYW5zZm9ybSEsIGNoaWxkICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmxpc3RlbmVyICk7XHJcblxyXG4gICAgbW9kZWwuc3BlYWtlcjJQb3NpdGlvblByb3BlcnR5LmxpbmsoIHZhbHVlID0+IHtcclxuICAgICAgdGhpcy5jYW52YXNOb2RlLnNvdXJjZTJQb3NpdGlvblkgPSBtb2RlbC5tb2RlbFRvTGF0dGljZVRyYW5zZm9ybS5tb2RlbFRvVmlld1koIHZhbHVlLnkgKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbnNvdW5kLnJlZ2lzdGVyKCAnVHdvU291cmNlVmlldycsIFR3b1NvdXJjZVZpZXcgKTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFFBQVEsTUFBTSwwQkFBMEI7QUFDL0MsT0FBT0MsY0FBYyxNQUFNLDZCQUE2QjtBQUN4RCxPQUFPQyxXQUFXLE1BQU0sK0JBQStCO0FBQ3ZELE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsS0FBSyxNQUFNLGFBQWE7QUFFL0IsT0FBT0MsZUFBZSxNQUFNLG1DQUFtQztBQUUvRCxlQUFlLE1BQU1DLGFBQWEsU0FBU0QsZUFBZSxDQUFDO0VBSWxERSxXQUFXQSxDQUFFQyxLQUFxQixFQUFHO0lBQzFDLEtBQUssQ0FBRUEsS0FBTSxDQUFDOztJQUVkO0lBQ0EsTUFBTUMsTUFBTSxHQUFHLElBQUlaLE9BQU8sQ0FBRVcsS0FBSyxDQUFDRSxnQkFBZ0IsQ0FBQ0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVILEtBQUssQ0FBQ0ksaUJBQWlCLENBQUMsQ0FBQyxDQUFDQyxNQUFPLENBQUM7SUFDOUYsTUFBTUMsT0FBTyxHQUFHLElBQUlYLFdBQVcsQ0FBRUssS0FBSyxDQUFDTyxrQkFBbUIsQ0FBQztJQUMzRCxJQUFJLENBQUNDLFlBQVksR0FBRyxJQUFJZCxXQUFXLENBQUVNLEtBQUssQ0FBQ1Msd0JBQXdCLEVBQUVSLE1BQU0sRUFBRUQsS0FBSyxDQUFDVSxrQkFBa0IsRUFBR0osT0FBUSxDQUFDO0lBQ2pIQSxPQUFPLENBQUNLLGNBQWMsQ0FBRSxJQUFJckIsT0FBTyxDQUFFRyxjQUFjLENBQUNtQixjQUFjLEVBQUUsQ0FBRSxDQUFFLENBQUM7SUFDekUsSUFBSSxDQUFDQyxRQUFRLENBQUUsSUFBSSxDQUFDTCxZQUFhLENBQUM7O0lBRWxDO0lBQ0EsTUFBTU0sS0FBSyxHQUFHLElBQUl2QixLQUFLLENBQUVDLFFBQVEsRUFBRTtNQUNqQ3VCLE1BQU0sRUFBRSxJQUFJekIsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFO0lBQzVCLENBQUUsQ0FBQztJQUNILE1BQU0wQixjQUFjLEdBQUcsSUFBSTNCLE9BQU8sQ0FBRUksY0FBYyxDQUFDd0IsaUJBQWlCLENBQUNDLEdBQUcsRUFBRUosS0FBSyxDQUFDVCxNQUFNLEVBQUVaLGNBQWMsQ0FBQ3dCLGlCQUFpQixDQUFDRSxHQUFHLEVBQUVuQixLQUFLLENBQUNJLGlCQUFpQixDQUFDLENBQUMsQ0FBQ0MsTUFBTSxHQUFHUyxLQUFLLENBQUNNLE1BQU8sQ0FBQztJQUMvSyxJQUFJLENBQUNDLFFBQVEsR0FBRyxJQUFJM0IsV0FBVyxDQUFFTSxLQUFLLENBQUNzQix3QkFBd0IsRUFBRU4sY0FBYyxFQUFFaEIsS0FBSyxDQUFDVSxrQkFBa0IsRUFBR0ksS0FBTSxDQUFDO0lBQ25ILElBQUksQ0FBQ0QsUUFBUSxDQUFFLElBQUksQ0FBQ1EsUUFBUyxDQUFDO0lBRTlCckIsS0FBSyxDQUFDUyx3QkFBd0IsQ0FBQ2MsSUFBSSxDQUFFQyxLQUFLLElBQUk7TUFDNUMsSUFBSSxDQUFDQyxVQUFVLENBQUNDLGdCQUFnQixHQUFHMUIsS0FBSyxDQUFDMkIsdUJBQXVCLENBQUNDLFlBQVksQ0FBRUosS0FBSyxDQUFDSyxDQUFFLENBQUM7SUFDMUYsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBakMsS0FBSyxDQUFDa0MsUUFBUSxDQUFFLGVBQWUsRUFBRWhDLGFBQWMsQ0FBQyJ9