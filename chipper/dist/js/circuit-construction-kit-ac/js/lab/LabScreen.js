// Copyright 2019-2023, University of Colorado Boulder

/**
 * The "Lab" screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import CCKCConstants from '../../../circuit-construction-kit-common/js/CCKCConstants.js';
import CCKCColors from '../../../circuit-construction-kit-common/js/view/CCKCColors.js';
import CircuitConstructionKitModel from '../../../circuit-construction-kit-common/js/model/CircuitConstructionKitModel.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import merge from '../../../phet-core/js/merge.js';
import { Image } from '../../../scenery/js/imports.js';
import screenIconLab_png from '../../images/screenIconLab_png.js';
import circuitConstructionKitAc from '../circuitConstructionKitAc.js';
import CircuitConstructionKitAcStrings from '../CircuitConstructionKitAcStrings.js';
import LabScreenView from './view/LabScreenView.js';
class LabScreen extends Screen {
  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(tandem, options) {
    const homeScreenIcon = new Image(screenIconLab_png);
    options = merge({
      name: CircuitConstructionKitAcStrings.screen.labStringProperty,
      backgroundColorProperty: new Property(CCKCColors.screenBackgroundColorProperty),
      homeScreenIcon: new ScreenIcon(homeScreenIcon, {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      tandem: tandem,
      maxDT: CCKCConstants.MAX_DT,
      labScreenViewOptions: {
        showNoncontactAmmeters: true
      }
    }, options);
    super(() => new CircuitConstructionKitModel(true, true, tandem.createTandem('model')), model => new LabScreenView(model, tandem.createTandem('view'), options.labScreenViewOptions), options);
  }
}
circuitConstructionKitAc.register('LabScreen', LabScreen);
export default LabScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkNDS0NDb25zdGFudHMiLCJDQ0tDQ29sb3JzIiwiQ2lyY3VpdENvbnN0cnVjdGlvbktpdE1vZGVsIiwiU2NyZWVuIiwiU2NyZWVuSWNvbiIsIm1lcmdlIiwiSW1hZ2UiLCJzY3JlZW5JY29uTGFiX3BuZyIsImNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRBYyIsIkNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRBY1N0cmluZ3MiLCJMYWJTY3JlZW5WaWV3IiwiTGFiU2NyZWVuIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJvcHRpb25zIiwiaG9tZVNjcmVlbkljb24iLCJuYW1lIiwic2NyZWVuIiwibGFiU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsInNjcmVlbkJhY2tncm91bmRDb2xvclByb3BlcnR5IiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwibWF4RFQiLCJNQVhfRFQiLCJsYWJTY3JlZW5WaWV3T3B0aW9ucyIsInNob3dOb25jb250YWN0QW1tZXRlcnMiLCJjcmVhdGVUYW5kZW0iLCJtb2RlbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGFiU2NyZWVuLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBcIkxhYlwiIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBDQ0tDQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1jb21tb24vanMvQ0NLQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDQ0tDQ29sb3JzIGZyb20gJy4uLy4uLy4uL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1jb21tb24vanMvdmlldy9DQ0tDQ29sb3JzLmpzJztcclxuaW1wb3J0IENpcmN1aXRDb25zdHJ1Y3Rpb25LaXRNb2RlbCBmcm9tICcuLi8uLi8uLi9jaXJjdWl0LWNvbnN0cnVjdGlvbi1raXQtY29tbW9uL2pzL21vZGVsL0NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRNb2RlbC5qcyc7XHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBzY3JlZW5JY29uTGFiX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvc2NyZWVuSWNvbkxhYl9wbmcuanMnO1xyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdEFjIGZyb20gJy4uL2NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRBYy5qcyc7XHJcbmltcG9ydCBDaXJjdWl0Q29uc3RydWN0aW9uS2l0QWNTdHJpbmdzIGZyb20gJy4uL0NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRBY1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgTGFiU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvTGFiU2NyZWVuVmlldy5qcyc7XHJcblxyXG5jbGFzcyBMYWJTY3JlZW4gZXh0ZW5kcyBTY3JlZW4ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3QgaG9tZVNjcmVlbkljb24gPSBuZXcgSW1hZ2UoIHNjcmVlbkljb25MYWJfcG5nICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIG5hbWU6IENpcmN1aXRDb25zdHJ1Y3Rpb25LaXRBY1N0cmluZ3Muc2NyZWVuLmxhYlN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBDQ0tDQ29sb3JzLnNjcmVlbkJhY2tncm91bmRDb2xvclByb3BlcnR5ICksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBuZXcgU2NyZWVuSWNvbiggaG9tZVNjcmVlbkljb24sIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIG1heERUOiBDQ0tDQ29uc3RhbnRzLk1BWF9EVCxcclxuICAgICAgbGFiU2NyZWVuVmlld09wdGlvbnM6IHtcclxuICAgICAgICBzaG93Tm9uY29udGFjdEFtbWV0ZXJzOiB0cnVlXHJcbiAgICAgIH1cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IENpcmN1aXRDb25zdHJ1Y3Rpb25LaXRNb2RlbCggdHJ1ZSwgdHJ1ZSwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vZGVsJyApICksXHJcbiAgICAgIG1vZGVsID0+IG5ldyBMYWJTY3JlZW5WaWV3KCBtb2RlbCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXcnICksIG9wdGlvbnMubGFiU2NyZWVuVmlld09wdGlvbnMgKSxcclxuICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRBYy5yZWdpc3RlciggJ0xhYlNjcmVlbicsIExhYlNjcmVlbiApO1xyXG5leHBvcnQgZGVmYXVsdCBMYWJTY3JlZW47Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsYUFBYSxNQUFNLDhEQUE4RDtBQUN4RixPQUFPQyxVQUFVLE1BQU0sZ0VBQWdFO0FBQ3ZGLE9BQU9DLDJCQUEyQixNQUFNLGtGQUFrRjtBQUMxSCxPQUFPQyxNQUFNLE1BQU0sNkJBQTZCO0FBQ2hELE9BQU9DLFVBQVUsTUFBTSxpQ0FBaUM7QUFDeEQsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLGlCQUFpQixNQUFNLG1DQUFtQztBQUNqRSxPQUFPQyx3QkFBd0IsTUFBTSxnQ0FBZ0M7QUFDckUsT0FBT0MsK0JBQStCLE1BQU0sdUNBQXVDO0FBQ25GLE9BQU9DLGFBQWEsTUFBTSx5QkFBeUI7QUFFbkQsTUFBTUMsU0FBUyxTQUFTUixNQUFNLENBQUM7RUFFN0I7QUFDRjtBQUNBO0FBQ0E7RUFDRVMsV0FBV0EsQ0FBRUMsTUFBTSxFQUFFQyxPQUFPLEVBQUc7SUFFN0IsTUFBTUMsY0FBYyxHQUFHLElBQUlULEtBQUssQ0FBRUMsaUJBQWtCLENBQUM7SUFFckRPLE9BQU8sR0FBR1QsS0FBSyxDQUFFO01BQ2ZXLElBQUksRUFBRVAsK0JBQStCLENBQUNRLE1BQU0sQ0FBQ0MsaUJBQWlCO01BQzlEQyx1QkFBdUIsRUFBRSxJQUFJcEIsUUFBUSxDQUFFRSxVQUFVLENBQUNtQiw2QkFBOEIsQ0FBQztNQUNqRkwsY0FBYyxFQUFFLElBQUlYLFVBQVUsQ0FBRVcsY0FBYyxFQUFFO1FBQzlDTSxzQkFBc0IsRUFBRSxDQUFDO1FBQ3pCQyx1QkFBdUIsRUFBRTtNQUMzQixDQUFFLENBQUM7TUFDSFQsTUFBTSxFQUFFQSxNQUFNO01BQ2RVLEtBQUssRUFBRXZCLGFBQWEsQ0FBQ3dCLE1BQU07TUFDM0JDLG9CQUFvQixFQUFFO1FBQ3BCQyxzQkFBc0IsRUFBRTtNQUMxQjtJQUNGLENBQUMsRUFBRVosT0FBUSxDQUFDO0lBRVosS0FBSyxDQUNILE1BQU0sSUFBSVosMkJBQTJCLENBQUUsSUFBSSxFQUFFLElBQUksRUFBRVcsTUFBTSxDQUFDYyxZQUFZLENBQUUsT0FBUSxDQUFFLENBQUMsRUFDbkZDLEtBQUssSUFBSSxJQUFJbEIsYUFBYSxDQUFFa0IsS0FBSyxFQUFFZixNQUFNLENBQUNjLFlBQVksQ0FBRSxNQUFPLENBQUMsRUFBRWIsT0FBTyxDQUFDVyxvQkFBcUIsQ0FBQyxFQUNoR1gsT0FDRixDQUFDO0VBQ0g7QUFDRjtBQUVBTix3QkFBd0IsQ0FBQ3FCLFFBQVEsQ0FBRSxXQUFXLEVBQUVsQixTQUFVLENBQUM7QUFDM0QsZUFBZUEsU0FBUyJ9