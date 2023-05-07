// Copyright 2017-2023, University of Colorado Boulder

/**
 * Base class for WavesScreen and MediumScreen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import optionize from '../../../phet-core/js/optionize.js';
import waveInterference from '../waveInterference.js';
import WavesModel from '../waves/model/WavesModel.js';
import WavesScreenView from '../waves/view/WavesScreenView.js';
class BaseScreen extends Screen {
  /**
   * @param alignGroup - for aligning the control panels on the right side of the lattice
   * @param [providedOptions]
   */
  constructor(alignGroup, providedOptions) {
    const options = optionize()({
      backgroundColorProperty: new Property('white'),
      showUnselectedHomeScreenIconFrame: true,
      showScreenIconFrameForNavigationBarFill: 'black',
      showSceneRadioButtons: true,
      showPlaySoundControl: true,
      audioEnabled: true
    }, providedOptions);
    super(() => new WavesModel(options.scenes ? {
      scenes: options.scenes
    } : {}), model => new WavesScreenView(model, alignGroup, {
      audioEnabled: options.audioEnabled,
      showViewpointRadioButtonGroup: true,
      piecewiseLinearBrightness: true,
      lightScreenAveragingWindowSize: 40,
      controlPanelOptions: {
        // The intensity checkbox is not available on BaseScreen instances because it distracts from the other
        // learning goals of the screen
        showIntensityCheckbox: false,
        showSceneRadioButtons: options.showSceneRadioButtons,
        showPlaySoundControl: options.showPlaySoundControl
      }
    }), options);
  }
}
waveInterference.register('BaseScreen', BaseScreen);
export default BaseScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIm9wdGlvbml6ZSIsIndhdmVJbnRlcmZlcmVuY2UiLCJXYXZlc01vZGVsIiwiV2F2ZXNTY3JlZW5WaWV3IiwiQmFzZVNjcmVlbiIsImNvbnN0cnVjdG9yIiwiYWxpZ25Hcm91cCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsInNob3dVbnNlbGVjdGVkSG9tZVNjcmVlbkljb25GcmFtZSIsInNob3dTY3JlZW5JY29uRnJhbWVGb3JOYXZpZ2F0aW9uQmFyRmlsbCIsInNob3dTY2VuZVJhZGlvQnV0dG9ucyIsInNob3dQbGF5U291bmRDb250cm9sIiwiYXVkaW9FbmFibGVkIiwic2NlbmVzIiwibW9kZWwiLCJzaG93Vmlld3BvaW50UmFkaW9CdXR0b25Hcm91cCIsInBpZWNld2lzZUxpbmVhckJyaWdodG5lc3MiLCJsaWdodFNjcmVlbkF2ZXJhZ2luZ1dpbmRvd1NpemUiLCJjb250cm9sUGFuZWxPcHRpb25zIiwic2hvd0ludGVuc2l0eUNoZWNrYm94IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYXNlU2NyZWVuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2UgY2xhc3MgZm9yIFdhdmVzU2NyZWVuIGFuZCBNZWRpdW1TY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU2NyZWVuLCB7IFNjcmVlbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkdyb3VwIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHdhdmVJbnRlcmZlcmVuY2UgZnJvbSAnLi4vd2F2ZUludGVyZmVyZW5jZS5qcyc7XHJcbmltcG9ydCBXYXZlc01vZGVsIGZyb20gJy4uL3dhdmVzL21vZGVsL1dhdmVzTW9kZWwuanMnO1xyXG5pbXBvcnQgV2F2ZXNTY3JlZW5WaWV3IGZyb20gJy4uL3dhdmVzL3ZpZXcvV2F2ZXNTY3JlZW5WaWV3LmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgc2hvd1NjZW5lUmFkaW9CdXR0b25zPzogYm9vbGVhbjtcclxuICBzaG93UGxheVNvdW5kQ29udHJvbD86IGJvb2xlYW47XHJcbiAgYXVkaW9FbmFibGVkPzogYm9vbGVhbjtcclxuICBzY2VuZXM6ICggJ3dhdGVyU2NlbmUnIHwgJ3NvdW5kU2NlbmUnIHwgJ2xpZ2h0U2NlbmUnIClbXTtcclxufTtcclxuZXhwb3J0IHR5cGUgQmFzZVNjcmVlbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFNjcmVlbk9wdGlvbnM7XHJcblxyXG5jbGFzcyBCYXNlU2NyZWVuIGV4dGVuZHMgU2NyZWVuPFdhdmVzTW9kZWwsIFdhdmVzU2NyZWVuVmlldz4ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gYWxpZ25Hcm91cCAtIGZvciBhbGlnbmluZyB0aGUgY29udHJvbCBwYW5lbHMgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGxhdHRpY2VcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGFsaWduR3JvdXA6IEFsaWduR3JvdXAsIHByb3ZpZGVkT3B0aW9ucz86IEJhc2VTY3JlZW5PcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8QmFzZVNjcmVlbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBTY3JlZW5PcHRpb25zPigpKCB7XHJcbiAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvcGVydHkoICd3aGl0ZScgKSxcclxuICAgICAgc2hvd1Vuc2VsZWN0ZWRIb21lU2NyZWVuSWNvbkZyYW1lOiB0cnVlLFxyXG4gICAgICBzaG93U2NyZWVuSWNvbkZyYW1lRm9yTmF2aWdhdGlvbkJhckZpbGw6ICdibGFjaycsXHJcbiAgICAgIHNob3dTY2VuZVJhZGlvQnV0dG9uczogdHJ1ZSxcclxuICAgICAgc2hvd1BsYXlTb3VuZENvbnRyb2w6IHRydWUsXHJcbiAgICAgIGF1ZGlvRW5hYmxlZDogdHJ1ZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBXYXZlc01vZGVsKCBvcHRpb25zLnNjZW5lcyA/IHsgc2NlbmVzOiBvcHRpb25zLnNjZW5lcyB9IDoge30gKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IFdhdmVzU2NyZWVuVmlldyggbW9kZWwsIGFsaWduR3JvdXAsIHtcclxuICAgICAgICBhdWRpb0VuYWJsZWQ6IG9wdGlvbnMuYXVkaW9FbmFibGVkLFxyXG4gICAgICAgIHNob3dWaWV3cG9pbnRSYWRpb0J1dHRvbkdyb3VwOiB0cnVlLFxyXG4gICAgICAgIHBpZWNld2lzZUxpbmVhckJyaWdodG5lc3M6IHRydWUsXHJcbiAgICAgICAgbGlnaHRTY3JlZW5BdmVyYWdpbmdXaW5kb3dTaXplOiA0MCxcclxuXHJcbiAgICAgICAgY29udHJvbFBhbmVsT3B0aW9uczoge1xyXG5cclxuICAgICAgICAgIC8vIFRoZSBpbnRlbnNpdHkgY2hlY2tib3ggaXMgbm90IGF2YWlsYWJsZSBvbiBCYXNlU2NyZWVuIGluc3RhbmNlcyBiZWNhdXNlIGl0IGRpc3RyYWN0cyBmcm9tIHRoZSBvdGhlclxyXG4gICAgICAgICAgLy8gbGVhcm5pbmcgZ29hbHMgb2YgdGhlIHNjcmVlblxyXG4gICAgICAgICAgc2hvd0ludGVuc2l0eUNoZWNrYm94OiBmYWxzZSxcclxuICAgICAgICAgIHNob3dTY2VuZVJhZGlvQnV0dG9uczogb3B0aW9ucy5zaG93U2NlbmVSYWRpb0J1dHRvbnMsXHJcbiAgICAgICAgICBzaG93UGxheVNvdW5kQ29udHJvbDogb3B0aW9ucy5zaG93UGxheVNvdW5kQ29udHJvbFxyXG4gICAgICAgIH1cclxuICAgICAgfSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxud2F2ZUludGVyZmVyZW5jZS5yZWdpc3RlciggJ0Jhc2VTY3JlZW4nLCBCYXNlU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJhc2VTY3JlZW47Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsTUFBTSxNQUF5Qiw2QkFBNkI7QUFDbkUsT0FBT0MsU0FBUyxNQUFNLG9DQUFvQztBQUUxRCxPQUFPQyxnQkFBZ0IsTUFBTSx3QkFBd0I7QUFDckQsT0FBT0MsVUFBVSxNQUFNLDhCQUE4QjtBQUNyRCxPQUFPQyxlQUFlLE1BQU0sa0NBQWtDO0FBVTlELE1BQU1DLFVBQVUsU0FBU0wsTUFBTSxDQUE4QjtFQUUzRDtBQUNGO0FBQ0E7QUFDQTtFQUNTTSxXQUFXQSxDQUFFQyxVQUFzQixFQUFFQyxlQUFtQyxFQUFHO0lBRWhGLE1BQU1DLE9BQU8sR0FBR1IsU0FBUyxDQUFnRCxDQUFDLENBQUU7TUFDMUVTLHVCQUF1QixFQUFFLElBQUlYLFFBQVEsQ0FBRSxPQUFRLENBQUM7TUFDaERZLGlDQUFpQyxFQUFFLElBQUk7TUFDdkNDLHVDQUF1QyxFQUFFLE9BQU87TUFDaERDLHFCQUFxQixFQUFFLElBQUk7TUFDM0JDLG9CQUFvQixFQUFFLElBQUk7TUFDMUJDLFlBQVksRUFBRTtJQUNoQixDQUFDLEVBQUVQLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUNILE1BQU0sSUFBSUwsVUFBVSxDQUFFTSxPQUFPLENBQUNPLE1BQU0sR0FBRztNQUFFQSxNQUFNLEVBQUVQLE9BQU8sQ0FBQ087SUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUMsRUFDeEVDLEtBQUssSUFBSSxJQUFJYixlQUFlLENBQUVhLEtBQUssRUFBRVYsVUFBVSxFQUFFO01BQy9DUSxZQUFZLEVBQUVOLE9BQU8sQ0FBQ00sWUFBWTtNQUNsQ0csNkJBQTZCLEVBQUUsSUFBSTtNQUNuQ0MseUJBQXlCLEVBQUUsSUFBSTtNQUMvQkMsOEJBQThCLEVBQUUsRUFBRTtNQUVsQ0MsbUJBQW1CLEVBQUU7UUFFbkI7UUFDQTtRQUNBQyxxQkFBcUIsRUFBRSxLQUFLO1FBQzVCVCxxQkFBcUIsRUFBRUosT0FBTyxDQUFDSSxxQkFBcUI7UUFDcERDLG9CQUFvQixFQUFFTCxPQUFPLENBQUNLO01BQ2hDO0lBQ0YsQ0FBRSxDQUFDLEVBQ0hMLE9BQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQVAsZ0JBQWdCLENBQUNxQixRQUFRLENBQUUsWUFBWSxFQUFFbEIsVUFBVyxDQUFDO0FBQ3JELGVBQWVBLFVBQVUifQ==