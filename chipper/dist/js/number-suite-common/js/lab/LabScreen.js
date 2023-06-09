// Copyright 2019-2023, University of Colorado Boulder

/**
 * The 'Lab' screen. Used in both 'Number Compare' and 'Number Play' simulations.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import labScreenIcon_png from '../../images/labScreenIcon_png.js';
import NumberSuiteCommonColors from '../common/NumberSuiteCommonColors.js';
import numberSuiteCommon from '../numberSuiteCommon.js';
import NumberSuiteCommonStrings from '../NumberSuiteCommonStrings.js';
import LabModel from './model/LabModel.js';
import LabScreenView from './view/LabScreenView.js';
class LabScreen extends Screen {
  constructor(symbolTypes, preferences, tandem) {
    const options = {
      name: NumberSuiteCommonStrings.screen.labStringProperty,
      backgroundColorProperty: NumberSuiteCommonColors.lightPurpleBackgroundColorProperty,
      homeScreenIcon: new ScreenIcon(new Image(labScreenIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      tandem: tandem
    };
    super(() => new LabModel(tandem.createTandem('model')), model => new LabScreenView(model, symbolTypes, preferences, tandem.createTandem('view')), options);
  }
}
numberSuiteCommon.register('LabScreen', LabScreen);
export default LabScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJTY3JlZW5JY29uIiwiSW1hZ2UiLCJsYWJTY3JlZW5JY29uX3BuZyIsIk51bWJlclN1aXRlQ29tbW9uQ29sb3JzIiwibnVtYmVyU3VpdGVDb21tb24iLCJOdW1iZXJTdWl0ZUNvbW1vblN0cmluZ3MiLCJMYWJNb2RlbCIsIkxhYlNjcmVlblZpZXciLCJMYWJTY3JlZW4iLCJjb25zdHJ1Y3RvciIsInN5bWJvbFR5cGVzIiwicHJlZmVyZW5jZXMiLCJ0YW5kZW0iLCJvcHRpb25zIiwibmFtZSIsInNjcmVlbiIsImxhYlN0cmluZ1Byb3BlcnR5IiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJsaWdodFB1cnBsZUJhY2tncm91bmRDb2xvclByb3BlcnR5IiwiaG9tZVNjcmVlbkljb24iLCJtYXhJY29uV2lkdGhQcm9wb3J0aW9uIiwibWF4SWNvbkhlaWdodFByb3BvcnRpb24iLCJjcmVhdGVUYW5kZW0iLCJtb2RlbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGFiU2NyZWVuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSAnTGFiJyBzY3JlZW4uIFVzZWQgaW4gYm90aCAnTnVtYmVyIENvbXBhcmUnIGFuZCAnTnVtYmVyIFBsYXknIHNpbXVsYXRpb25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgbGFiU2NyZWVuSWNvbl9wbmcgZnJvbSAnLi4vLi4vaW1hZ2VzL2xhYlNjcmVlbkljb25fcG5nLmpzJztcclxuaW1wb3J0IE51bWJlclN1aXRlQ29tbW9uQ29sb3JzIGZyb20gJy4uL2NvbW1vbi9OdW1iZXJTdWl0ZUNvbW1vbkNvbG9ycy5qcyc7XHJcbmltcG9ydCBudW1iZXJTdWl0ZUNvbW1vbiBmcm9tICcuLi9udW1iZXJTdWl0ZUNvbW1vbi5qcyc7XHJcbmltcG9ydCBOdW1iZXJTdWl0ZUNvbW1vblN0cmluZ3MgZnJvbSAnLi4vTnVtYmVyU3VpdGVDb21tb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IExhYk1vZGVsIGZyb20gJy4vbW9kZWwvTGFiTW9kZWwuanMnO1xyXG5pbXBvcnQgTGFiU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvTGFiU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBOdW1iZXJTdWl0ZUNvbW1vblByZWZlcmVuY2VzIGZyb20gJy4uL2NvbW1vbi9tb2RlbC9OdW1iZXJTdWl0ZUNvbW1vblByZWZlcmVuY2VzLmpzJztcclxuaW1wb3J0IHR5cGUgU3ltYm9sVHlwZSBmcm9tICcuL3ZpZXcvU3ltYm9sVHlwZS5qcyc7XHJcblxyXG5jbGFzcyBMYWJTY3JlZW48VCBleHRlbmRzIE51bWJlclN1aXRlQ29tbW9uUHJlZmVyZW5jZXM+IGV4dGVuZHMgU2NyZWVuPExhYk1vZGVsLCBMYWJTY3JlZW5WaWV3PE51bWJlclN1aXRlQ29tbW9uUHJlZmVyZW5jZXM+PiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3ltYm9sVHlwZXM6IFN5bWJvbFR5cGVbXSwgcHJlZmVyZW5jZXM6IFQsIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIG5hbWU6IE51bWJlclN1aXRlQ29tbW9uU3RyaW5ncy5zY3JlZW4ubGFiU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBOdW1iZXJTdWl0ZUNvbW1vbkNvbG9ycy5saWdodFB1cnBsZUJhY2tncm91bmRDb2xvclByb3BlcnR5LFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogbmV3IFNjcmVlbkljb24oIG5ldyBJbWFnZSggbGFiU2NyZWVuSWNvbl9wbmcgKSwge1xyXG4gICAgICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgICAgfSApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IExhYk1vZGVsKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9kZWwnICkgKSxcclxuICAgICAgKCBtb2RlbDogTGFiTW9kZWwgKSA9PiBuZXcgTGFiU2NyZWVuVmlldyggbW9kZWwsIHN5bWJvbFR5cGVzLCBwcmVmZXJlbmNlcywgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXcnICkgKSxcclxuICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbm51bWJlclN1aXRlQ29tbW9uLnJlZ2lzdGVyKCAnTGFiU2NyZWVuJywgTGFiU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IExhYlNjcmVlbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLDZCQUE2QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFFdEQsT0FBT0MsaUJBQWlCLE1BQU0sbUNBQW1DO0FBQ2pFLE9BQU9DLHVCQUF1QixNQUFNLHNDQUFzQztBQUMxRSxPQUFPQyxpQkFBaUIsTUFBTSx5QkFBeUI7QUFDdkQsT0FBT0Msd0JBQXdCLE1BQU0sZ0NBQWdDO0FBQ3JFLE9BQU9DLFFBQVEsTUFBTSxxQkFBcUI7QUFDMUMsT0FBT0MsYUFBYSxNQUFNLHlCQUF5QjtBQUluRCxNQUFNQyxTQUFTLFNBQWlEVCxNQUFNLENBQXdEO0VBRXJIVSxXQUFXQSxDQUFFQyxXQUF5QixFQUFFQyxXQUFjLEVBQUVDLE1BQWMsRUFBRztJQUU5RSxNQUFNQyxPQUFPLEdBQUc7TUFDZEMsSUFBSSxFQUFFVCx3QkFBd0IsQ0FBQ1UsTUFBTSxDQUFDQyxpQkFBaUI7TUFDdkRDLHVCQUF1QixFQUFFZCx1QkFBdUIsQ0FBQ2Usa0NBQWtDO01BQ25GQyxjQUFjLEVBQUUsSUFBSW5CLFVBQVUsQ0FBRSxJQUFJQyxLQUFLLENBQUVDLGlCQUFrQixDQUFDLEVBQUU7UUFDOURrQixzQkFBc0IsRUFBRSxDQUFDO1FBQ3pCQyx1QkFBdUIsRUFBRTtNQUMzQixDQUFFLENBQUM7TUFDSFQsTUFBTSxFQUFFQTtJQUNWLENBQUM7SUFFRCxLQUFLLENBQ0gsTUFBTSxJQUFJTixRQUFRLENBQUVNLE1BQU0sQ0FBQ1UsWUFBWSxDQUFFLE9BQVEsQ0FBRSxDQUFDLEVBQ2xEQyxLQUFlLElBQU0sSUFBSWhCLGFBQWEsQ0FBRWdCLEtBQUssRUFBRWIsV0FBVyxFQUFFQyxXQUFXLEVBQUVDLE1BQU0sQ0FBQ1UsWUFBWSxDQUFFLE1BQU8sQ0FBRSxDQUFDLEVBQzFHVCxPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFULGlCQUFpQixDQUFDb0IsUUFBUSxDQUFFLFdBQVcsRUFBRWhCLFNBQVUsQ0FBQztBQUNwRCxlQUFlQSxTQUFTIn0=