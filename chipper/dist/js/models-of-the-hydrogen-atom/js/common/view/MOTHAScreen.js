// Copyright 2019-2022, University of Colorado Boulder

/**
 * MOTHAScreen is the base class for all Screens in this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Screen from '../../../../joist/js/Screen.js';
import optionize from '../../../../phet-core/js/optionize.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import MOTHAColors from '../MOTHAColors.js';
export default class MOTHAScreen extends Screen {
  constructor(createModel, createView, providedOptions) {
    const options = optionize()({
      // MOTHAScreenOptions
      backgroundColorProperty: MOTHAColors.screenBackgroundColorProperty,
      showUnselectedHomeScreenIconFrame: true,
      showScreenIconFrameForNavigationBarFill: 'black'
    }, providedOptions);
    super(createModel, createView, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
modelsOfTheHydrogenAtom.register('MOTHAScreen', MOTHAScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJvcHRpb25pemUiLCJtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSIsIk1PVEhBQ29sb3JzIiwiTU9USEFTY3JlZW4iLCJjb25zdHJ1Y3RvciIsImNyZWF0ZU1vZGVsIiwiY3JlYXRlVmlldyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsInNjcmVlbkJhY2tncm91bmRDb2xvclByb3BlcnR5Iiwic2hvd1Vuc2VsZWN0ZWRIb21lU2NyZWVuSWNvbkZyYW1lIiwic2hvd1NjcmVlbkljb25GcmFtZUZvck5hdmlnYXRpb25CYXJGaWxsIiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTU9USEFTY3JlZW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTU9USEFTY3JlZW4gaXMgdGhlIGJhc2UgY2xhc3MgZm9yIGFsbCBTY3JlZW5zIGluIHRoaXMgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUTW9kZWwgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvVE1vZGVsLmpzJztcclxuaW1wb3J0IFNjcmVlbiwgeyBTY3JlZW5PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20gZnJvbSAnLi4vLi4vbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20uanMnO1xyXG5pbXBvcnQgTU9USEFDb2xvcnMgZnJvbSAnLi4vTU9USEFDb2xvcnMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG5leHBvcnQgdHlwZSBNT1RIQVNjcmVlbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFNjcmVlbk9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNT1RIQVNjcmVlbjxNIGV4dGVuZHMgVE1vZGVsLCBWIGV4dGVuZHMgU2NyZWVuVmlldz4gZXh0ZW5kcyBTY3JlZW48TSwgVj4ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNyZWF0ZU1vZGVsOiAoKSA9PiBNLCBjcmVhdGVWaWV3OiAoIG1vZGVsOiBNICkgPT4gViwgcHJvdmlkZWRPcHRpb25zOiBNT1RIQVNjcmVlbk9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNT1RIQVNjcmVlbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBTY3JlZW5PcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBNT1RIQVNjcmVlbk9wdGlvbnNcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IE1PVEhBQ29sb3JzLnNjcmVlbkJhY2tncm91bmRDb2xvclByb3BlcnR5LFxyXG4gICAgICBzaG93VW5zZWxlY3RlZEhvbWVTY3JlZW5JY29uRnJhbWU6IHRydWUsXHJcbiAgICAgIHNob3dTY3JlZW5JY29uRnJhbWVGb3JOYXZpZ2F0aW9uQmFyRmlsbDogJ2JsYWNrJ1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIGNyZWF0ZU1vZGVsLCBjcmVhdGVWaWV3LCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxubW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20ucmVnaXN0ZXIoICdNT1RIQVNjcmVlbicsIE1PVEhBU2NyZWVuICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLE1BQU0sTUFBeUIsZ0NBQWdDO0FBRXRFLE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBQ25GLE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyxXQUFXLE1BQU0sbUJBQW1CO0FBTTNDLGVBQWUsTUFBTUMsV0FBVyxTQUFpREosTUFBTSxDQUFPO0VBRXJGSyxXQUFXQSxDQUFFQyxXQUFvQixFQUFFQyxVQUE2QixFQUFFQyxlQUFtQyxFQUFHO0lBRTdHLE1BQU1DLE9BQU8sR0FBR1IsU0FBUyxDQUFpRCxDQUFDLENBQUU7TUFFM0U7TUFDQVMsdUJBQXVCLEVBQUVQLFdBQVcsQ0FBQ1EsNkJBQTZCO01BQ2xFQyxpQ0FBaUMsRUFBRSxJQUFJO01BQ3ZDQyx1Q0FBdUMsRUFBRTtJQUMzQyxDQUFDLEVBQUVMLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFRixXQUFXLEVBQUVDLFVBQVUsRUFBRUUsT0FBUSxDQUFDO0VBQzNDO0VBRWdCSyxPQUFPQSxDQUFBLEVBQVM7SUFDOUJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztJQUN6RixLQUFLLENBQUNELE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQVosdUJBQXVCLENBQUNjLFFBQVEsQ0FBRSxhQUFhLEVBQUVaLFdBQVksQ0FBQyJ9