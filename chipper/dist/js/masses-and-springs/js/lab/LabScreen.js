// Copyright 2016-2022, University of Colorado Boulder

/**
 *  main file for the "Lab" screen
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import labScreenIcon_png from '../../images/labScreenIcon_png.js';
import MassesAndSpringsColors from '../common/view/MassesAndSpringsColors.js';
import massesAndSprings from '../massesAndSprings.js';
import MassesAndSpringsStrings from '../MassesAndSpringsStrings.js';
import LabModel from './model/LabModel.js';
import LabScreenView from './view/LabScreenView.js';
class LabScreen extends Screen {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    const options = {
      name: MassesAndSpringsStrings.screen.labStringProperty,
      backgroundColorProperty: MassesAndSpringsColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon(new Image(labScreenIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      tandem: tandem
    };
    super(() => new LabModel(tandem.createTandem('model'), false), model => new LabScreenView(model, tandem.createTandem('view')), options);
  }
}
massesAndSprings.register('LabScreen', LabScreen);
export default LabScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJTY3JlZW5JY29uIiwiSW1hZ2UiLCJsYWJTY3JlZW5JY29uX3BuZyIsIk1hc3Nlc0FuZFNwcmluZ3NDb2xvcnMiLCJtYXNzZXNBbmRTcHJpbmdzIiwiTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MiLCJMYWJNb2RlbCIsIkxhYlNjcmVlblZpZXciLCJMYWJTY3JlZW4iLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsIm9wdGlvbnMiLCJuYW1lIiwic2NyZWVuIiwibGFiU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImJhY2tncm91bmRQcm9wZXJ0eSIsImhvbWVTY3JlZW5JY29uIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwiY3JlYXRlVGFuZGVtIiwibW9kZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxhYlNjcmVlbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiAgbWFpbiBmaWxlIGZvciB0aGUgXCJMYWJcIiBzY3JlZW5cclxuICpcclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbGFiU2NyZWVuSWNvbl9wbmcgZnJvbSAnLi4vLi4vaW1hZ2VzL2xhYlNjcmVlbkljb25fcG5nLmpzJztcclxuaW1wb3J0IE1hc3Nlc0FuZFNwcmluZ3NDb2xvcnMgZnJvbSAnLi4vY29tbW9uL3ZpZXcvTWFzc2VzQW5kU3ByaW5nc0NvbG9ycy5qcyc7XHJcbmltcG9ydCBtYXNzZXNBbmRTcHJpbmdzIGZyb20gJy4uL21hc3Nlc0FuZFNwcmluZ3MuanMnO1xyXG5pbXBvcnQgTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MgZnJvbSAnLi4vTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgTGFiTW9kZWwgZnJvbSAnLi9tb2RlbC9MYWJNb2RlbC5qcyc7XHJcbmltcG9ydCBMYWJTY3JlZW5WaWV3IGZyb20gJy4vdmlldy9MYWJTY3JlZW5WaWV3LmpzJztcclxuXHJcbmNsYXNzIExhYlNjcmVlbiBleHRlbmRzIFNjcmVlbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIG5hbWU6IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzLnNjcmVlbi5sYWJTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IE1hc3Nlc0FuZFNwcmluZ3NDb2xvcnMuYmFja2dyb3VuZFByb3BlcnR5LFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogbmV3IFNjcmVlbkljb24oIG5ldyBJbWFnZSggbGFiU2NyZWVuSWNvbl9wbmcgKSwge1xyXG4gICAgICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgICAgfSApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IExhYk1vZGVsKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9kZWwnICksIGZhbHNlICksXHJcbiAgICAgIG1vZGVsID0+IG5ldyBMYWJTY3JlZW5WaWV3KCBtb2RlbCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXcnICkgKSxcclxuICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbm1hc3Nlc0FuZFNwcmluZ3MucmVnaXN0ZXIoICdMYWJTY3JlZW4nLCBMYWJTY3JlZW4gKTtcclxuZXhwb3J0IGRlZmF1bHQgTGFiU2NyZWVuOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0sNkJBQTZCO0FBQ2hELE9BQU9DLFVBQVUsTUFBTSxpQ0FBaUM7QUFDeEQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxpQkFBaUIsTUFBTSxtQ0FBbUM7QUFDakUsT0FBT0Msc0JBQXNCLE1BQU0sMENBQTBDO0FBQzdFLE9BQU9DLGdCQUFnQixNQUFNLHdCQUF3QjtBQUNyRCxPQUFPQyx1QkFBdUIsTUFBTSwrQkFBK0I7QUFDbkUsT0FBT0MsUUFBUSxNQUFNLHFCQUFxQjtBQUMxQyxPQUFPQyxhQUFhLE1BQU0seUJBQXlCO0FBRW5ELE1BQU1DLFNBQVMsU0FBU1QsTUFBTSxDQUFDO0VBRTdCO0FBQ0Y7QUFDQTtFQUNFVSxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFFcEIsTUFBTUMsT0FBTyxHQUFHO01BQ2RDLElBQUksRUFBRVAsdUJBQXVCLENBQUNRLE1BQU0sQ0FBQ0MsaUJBQWlCO01BQ3REQyx1QkFBdUIsRUFBRVosc0JBQXNCLENBQUNhLGtCQUFrQjtNQUNsRUMsY0FBYyxFQUFFLElBQUlqQixVQUFVLENBQUUsSUFBSUMsS0FBSyxDQUFFQyxpQkFBa0IsQ0FBQyxFQUFFO1FBQzlEZ0Isc0JBQXNCLEVBQUUsQ0FBQztRQUN6QkMsdUJBQXVCLEVBQUU7TUFDM0IsQ0FBRSxDQUFDO01BQ0hULE1BQU0sRUFBRUE7SUFDVixDQUFDO0lBRUQsS0FBSyxDQUNILE1BQU0sSUFBSUosUUFBUSxDQUFFSSxNQUFNLENBQUNVLFlBQVksQ0FBRSxPQUFRLENBQUMsRUFBRSxLQUFNLENBQUMsRUFDM0RDLEtBQUssSUFBSSxJQUFJZCxhQUFhLENBQUVjLEtBQUssRUFBRVgsTUFBTSxDQUFDVSxZQUFZLENBQUUsTUFBTyxDQUFFLENBQUMsRUFDbEVULE9BQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQVAsZ0JBQWdCLENBQUNrQixRQUFRLENBQUUsV0FBVyxFQUFFZCxTQUFVLENBQUM7QUFDbkQsZUFBZUEsU0FBUyJ9