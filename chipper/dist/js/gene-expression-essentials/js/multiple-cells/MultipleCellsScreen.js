// Copyright 2016-2022, University of Colorado Boulder

/**
 * main screen view class for the "Multiple Cells" screen
 *
 * @author Aadish Gupta
 * @author John Blanco
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import multipleCellsIcon_png from '../../mipmaps/multipleCellsIcon_png.js';
import GEEConstants from '../common/GEEConstants.js';
import geneExpressionEssentials from '../geneExpressionEssentials.js';
import GeneExpressionEssentialsStrings from '../GeneExpressionEssentialsStrings.js';
import MultipleCellsModel from './model/MultipleCellsModel.js';
import MultipleCellsScreenView from './view/MultipleCellsScreenView.js';
class MultipleCellsScreen extends Screen {
  constructor() {
    const options = {
      name: GeneExpressionEssentialsStrings.screen.multipleCellsStringProperty,
      backgroundColorProperty: new Property('black'),
      homeScreenIcon: new ScreenIcon(new Image(multipleCellsIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      maxDT: GEEConstants.MAX_DT
    };
    super(() => new MultipleCellsModel(), model => new MultipleCellsScreenView(model), options);
  }
}
geneExpressionEssentials.register('MultipleCellsScreen', MultipleCellsScreen);
export default MultipleCellsScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJJbWFnZSIsIm11bHRpcGxlQ2VsbHNJY29uX3BuZyIsIkdFRUNvbnN0YW50cyIsImdlbmVFeHByZXNzaW9uRXNzZW50aWFscyIsIkdlbmVFeHByZXNzaW9uRXNzZW50aWFsc1N0cmluZ3MiLCJNdWx0aXBsZUNlbGxzTW9kZWwiLCJNdWx0aXBsZUNlbGxzU2NyZWVuVmlldyIsIk11bHRpcGxlQ2VsbHNTY3JlZW4iLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJuYW1lIiwic2NyZWVuIiwibXVsdGlwbGVDZWxsc1N0cmluZ1Byb3BlcnR5IiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJob21lU2NyZWVuSWNvbiIsIm1heEljb25XaWR0aFByb3BvcnRpb24iLCJtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbiIsIm1heERUIiwiTUFYX0RUIiwibW9kZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk11bHRpcGxlQ2VsbHNTY3JlZW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogbWFpbiBzY3JlZW4gdmlldyBjbGFzcyBmb3IgdGhlIFwiTXVsdGlwbGUgQ2VsbHNcIiBzY3JlZW5cclxuICpcclxuICogQGF1dGhvciBBYWRpc2ggR3VwdGFcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbXVsdGlwbGVDZWxsc0ljb25fcG5nIGZyb20gJy4uLy4uL21pcG1hcHMvbXVsdGlwbGVDZWxsc0ljb25fcG5nLmpzJztcclxuaW1wb3J0IEdFRUNvbnN0YW50cyBmcm9tICcuLi9jb21tb24vR0VFQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGdlbmVFeHByZXNzaW9uRXNzZW50aWFscyBmcm9tICcuLi9nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMuanMnO1xyXG5pbXBvcnQgR2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzU3RyaW5ncyBmcm9tICcuLi9HZW5lRXhwcmVzc2lvbkVzc2VudGlhbHNTdHJpbmdzLmpzJztcclxuaW1wb3J0IE11bHRpcGxlQ2VsbHNNb2RlbCBmcm9tICcuL21vZGVsL011bHRpcGxlQ2VsbHNNb2RlbC5qcyc7XHJcbmltcG9ydCBNdWx0aXBsZUNlbGxzU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvTXVsdGlwbGVDZWxsc1NjcmVlblZpZXcuanMnO1xyXG5cclxuY2xhc3MgTXVsdGlwbGVDZWxsc1NjcmVlbiBleHRlbmRzIFNjcmVlbiB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIG5hbWU6IEdlbmVFeHByZXNzaW9uRXNzZW50aWFsc1N0cmluZ3Muc2NyZWVuLm11bHRpcGxlQ2VsbHNTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggJ2JsYWNrJyApLFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogbmV3IFNjcmVlbkljb24oIG5ldyBJbWFnZSggbXVsdGlwbGVDZWxsc0ljb25fcG5nICksIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgbWF4RFQ6IEdFRUNvbnN0YW50cy5NQVhfRFRcclxuICAgIH07XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBNdWx0aXBsZUNlbGxzTW9kZWwoKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IE11bHRpcGxlQ2VsbHNTY3JlZW5WaWV3KCBtb2RlbCApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLnJlZ2lzdGVyKCAnTXVsdGlwbGVDZWxsc1NjcmVlbicsIE11bHRpcGxlQ2VsbHNTY3JlZW4gKTtcclxuZXhwb3J0IGRlZmF1bHQgTXVsdGlwbGVDZWxsc1NjcmVlbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSw2QkFBNkI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLHFCQUFxQixNQUFNLHdDQUF3QztBQUMxRSxPQUFPQyxZQUFZLE1BQU0sMkJBQTJCO0FBQ3BELE9BQU9DLHdCQUF3QixNQUFNLGdDQUFnQztBQUNyRSxPQUFPQywrQkFBK0IsTUFBTSx1Q0FBdUM7QUFDbkYsT0FBT0Msa0JBQWtCLE1BQU0sK0JBQStCO0FBQzlELE9BQU9DLHVCQUF1QixNQUFNLG1DQUFtQztBQUV2RSxNQUFNQyxtQkFBbUIsU0FBU1QsTUFBTSxDQUFDO0VBRXZDVSxXQUFXQSxDQUFBLEVBQUc7SUFFWixNQUFNQyxPQUFPLEdBQUc7TUFDZEMsSUFBSSxFQUFFTiwrQkFBK0IsQ0FBQ08sTUFBTSxDQUFDQywyQkFBMkI7TUFDeEVDLHVCQUF1QixFQUFFLElBQUloQixRQUFRLENBQUUsT0FBUSxDQUFDO01BQ2hEaUIsY0FBYyxFQUFFLElBQUlmLFVBQVUsQ0FBRSxJQUFJQyxLQUFLLENBQUVDLHFCQUFzQixDQUFDLEVBQUU7UUFDbEVjLHNCQUFzQixFQUFFLENBQUM7UUFDekJDLHVCQUF1QixFQUFFO01BQzNCLENBQUUsQ0FBQztNQUNIQyxLQUFLLEVBQUVmLFlBQVksQ0FBQ2dCO0lBQ3RCLENBQUM7SUFFRCxLQUFLLENBQ0gsTUFBTSxJQUFJYixrQkFBa0IsQ0FBQyxDQUFDLEVBQzlCYyxLQUFLLElBQUksSUFBSWIsdUJBQXVCLENBQUVhLEtBQU0sQ0FBQyxFQUM3Q1YsT0FDRixDQUFDO0VBQ0g7QUFDRjtBQUVBTix3QkFBd0IsQ0FBQ2lCLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRWIsbUJBQW9CLENBQUM7QUFDL0UsZUFBZUEsbUJBQW1CIn0=