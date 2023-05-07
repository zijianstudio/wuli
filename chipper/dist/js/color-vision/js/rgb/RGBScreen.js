// Copyright 2014-2022, University of Colorado Boulder

/**
 * The 'RGB' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import colorVision from '../colorVision.js';
import ColorVisionStrings from '../ColorVisionStrings.js';
import ColorVisionConstants from '../common/ColorVisionConstants.js';
import RGBModel from './model/RGBModel.js';
import RGBIconNode from './view/RGBIconNode.js';
import RGBScreenView from './view/RGBScreenView.js';
class RGBScreen extends Screen {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    const options = {
      name: ColorVisionStrings.RgbBulbsModule.titleStringProperty,
      backgroundColorProperty: new Property('black'),
      homeScreenIcon: new ScreenIcon(new RGBIconNode(ColorVisionConstants.HOME_SCREEN_ICON_OPTIONS), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      navigationBarIcon: new ScreenIcon(new RGBIconNode(ColorVisionConstants.HOME_SCREEN_ICON_OPTIONS), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      showUnselectedHomeScreenIconFrame: true,
      tandem: tandem
    };
    super(() => new RGBModel(tandem.createTandem('model')), model => new RGBScreenView(model, tandem.createTandem('view')), options);
  }
}
colorVision.register('RGBScreen', RGBScreen);
export default RGBScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJjb2xvclZpc2lvbiIsIkNvbG9yVmlzaW9uU3RyaW5ncyIsIkNvbG9yVmlzaW9uQ29uc3RhbnRzIiwiUkdCTW9kZWwiLCJSR0JJY29uTm9kZSIsIlJHQlNjcmVlblZpZXciLCJSR0JTY3JlZW4iLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsIm9wdGlvbnMiLCJuYW1lIiwiUmdiQnVsYnNNb2R1bGUiLCJ0aXRsZVN0cmluZ1Byb3BlcnR5IiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJob21lU2NyZWVuSWNvbiIsIkhPTUVfU0NSRUVOX0lDT05fT1BUSU9OUyIsIm1heEljb25XaWR0aFByb3BvcnRpb24iLCJtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbiIsIm5hdmlnYXRpb25CYXJJY29uIiwic2hvd1Vuc2VsZWN0ZWRIb21lU2NyZWVuSWNvbkZyYW1lIiwiY3JlYXRlVGFuZGVtIiwibW9kZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJHQlNjcmVlbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgJ1JHQicgc2NyZWVuLiBDb25mb3JtcyB0byB0aGUgY29udHJhY3Qgc3BlY2lmaWVkIGluIGpvaXN0L1NjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCBjb2xvclZpc2lvbiBmcm9tICcuLi9jb2xvclZpc2lvbi5qcyc7XHJcbmltcG9ydCBDb2xvclZpc2lvblN0cmluZ3MgZnJvbSAnLi4vQ29sb3JWaXNpb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IENvbG9yVmlzaW9uQ29uc3RhbnRzIGZyb20gJy4uL2NvbW1vbi9Db2xvclZpc2lvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBSR0JNb2RlbCBmcm9tICcuL21vZGVsL1JHQk1vZGVsLmpzJztcclxuaW1wb3J0IFJHQkljb25Ob2RlIGZyb20gJy4vdmlldy9SR0JJY29uTm9kZS5qcyc7XHJcbmltcG9ydCBSR0JTY3JlZW5WaWV3IGZyb20gJy4vdmlldy9SR0JTY3JlZW5WaWV3LmpzJztcclxuXHJcbmNsYXNzIFJHQlNjcmVlbiBleHRlbmRzIFNjcmVlbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIG5hbWU6IENvbG9yVmlzaW9uU3RyaW5ncy5SZ2JCdWxic01vZHVsZS50aXRsZVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCAnYmxhY2snICksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBuZXcgU2NyZWVuSWNvbiggbmV3IFJHQkljb25Ob2RlKCBDb2xvclZpc2lvbkNvbnN0YW50cy5IT01FX1NDUkVFTl9JQ09OX09QVElPTlMgKSwge1xyXG4gICAgICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgICAgfSApLFxyXG4gICAgICBuYXZpZ2F0aW9uQmFySWNvbjogbmV3IFNjcmVlbkljb24oIG5ldyBSR0JJY29uTm9kZSggQ29sb3JWaXNpb25Db25zdGFudHMuSE9NRV9TQ1JFRU5fSUNPTl9PUFRJT05TICksIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgc2hvd1Vuc2VsZWN0ZWRIb21lU2NyZWVuSWNvbkZyYW1lOiB0cnVlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IFJHQk1vZGVsKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9kZWwnICkgKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IFJHQlNjcmVlblZpZXcoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuY29sb3JWaXNpb24ucmVnaXN0ZXIoICdSR0JTY3JlZW4nLCBSR0JTY3JlZW4gKTtcclxuZXhwb3J0IGRlZmF1bHQgUkdCU2NyZWVuOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSw2QkFBNkI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxXQUFXLE1BQU0sbUJBQW1CO0FBQzNDLE9BQU9DLGtCQUFrQixNQUFNLDBCQUEwQjtBQUN6RCxPQUFPQyxvQkFBb0IsTUFBTSxtQ0FBbUM7QUFDcEUsT0FBT0MsUUFBUSxNQUFNLHFCQUFxQjtBQUMxQyxPQUFPQyxXQUFXLE1BQU0sdUJBQXVCO0FBQy9DLE9BQU9DLGFBQWEsTUFBTSx5QkFBeUI7QUFFbkQsTUFBTUMsU0FBUyxTQUFTUixNQUFNLENBQUM7RUFFN0I7QUFDRjtBQUNBO0VBQ0VTLFdBQVdBLENBQUVDLE1BQU0sRUFBRztJQUVwQixNQUFNQyxPQUFPLEdBQUc7TUFDZEMsSUFBSSxFQUFFVCxrQkFBa0IsQ0FBQ1UsY0FBYyxDQUFDQyxtQkFBbUI7TUFDM0RDLHVCQUF1QixFQUFFLElBQUloQixRQUFRLENBQUUsT0FBUSxDQUFDO01BQ2hEaUIsY0FBYyxFQUFFLElBQUlmLFVBQVUsQ0FBRSxJQUFJSyxXQUFXLENBQUVGLG9CQUFvQixDQUFDYSx3QkFBeUIsQ0FBQyxFQUFFO1FBQ2hHQyxzQkFBc0IsRUFBRSxDQUFDO1FBQ3pCQyx1QkFBdUIsRUFBRTtNQUMzQixDQUFFLENBQUM7TUFDSEMsaUJBQWlCLEVBQUUsSUFBSW5CLFVBQVUsQ0FBRSxJQUFJSyxXQUFXLENBQUVGLG9CQUFvQixDQUFDYSx3QkFBeUIsQ0FBQyxFQUFFO1FBQ25HQyxzQkFBc0IsRUFBRSxDQUFDO1FBQ3pCQyx1QkFBdUIsRUFBRTtNQUMzQixDQUFFLENBQUM7TUFDSEUsaUNBQWlDLEVBQUUsSUFBSTtNQUN2Q1gsTUFBTSxFQUFFQTtJQUNWLENBQUM7SUFFRCxLQUFLLENBQ0gsTUFBTSxJQUFJTCxRQUFRLENBQUVLLE1BQU0sQ0FBQ1ksWUFBWSxDQUFFLE9BQVEsQ0FBRSxDQUFDLEVBQ3BEQyxLQUFLLElBQUksSUFBSWhCLGFBQWEsQ0FBRWdCLEtBQUssRUFBRWIsTUFBTSxDQUFDWSxZQUFZLENBQUUsTUFBTyxDQUFFLENBQUMsRUFDbEVYLE9BQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQVQsV0FBVyxDQUFDc0IsUUFBUSxDQUFFLFdBQVcsRUFBRWhCLFNBQVUsQ0FBQztBQUM5QyxlQUFlQSxTQUFTIn0=