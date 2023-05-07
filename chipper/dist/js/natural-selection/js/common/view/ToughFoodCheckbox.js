// Copyright 2019-2022, University of Colorado Boulder

/**
 * ToughFoodCheckbox is a checkbox for enabling the 'Tough Food' environmental factor.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { HBox, Image, Text } from '../../../../scenery/js/imports.js';
import toughShrub3_png from '../../../images/toughShrub3_png.js';
import naturalSelection from '../../naturalSelection.js';
import NaturalSelectionStrings from '../../NaturalSelectionStrings.js';
import NaturalSelectionColors from '../NaturalSelectionColors.js';
import NaturalSelectionConstants from '../NaturalSelectionConstants.js';
import EnvironmentalFactorCheckbox from './EnvironmentalFactorCheckbox.js';
import optionize from '../../../../phet-core/js/optionize.js';
export default class ToughFoodCheckbox extends EnvironmentalFactorCheckbox {
  constructor(isToughProperty, alignGroup, providedOptions) {
    const options = optionize()({
      // EnvironmentalFactorCheckboxOptions
      clockSliceRange: NaturalSelectionConstants.CLOCK_FOOD_RANGE,
      clockSliceColor: NaturalSelectionColors.CLOCK_FOOD_SLICE_COLOR
    }, providedOptions);
    const labelText = new Text(NaturalSelectionStrings.toughFoodStringProperty, {
      font: NaturalSelectionConstants.CHECKBOX_FONT,
      maxWidth: 90,
      // determined empirically
      tandem: options.tandem.createTandem('labelText')
    });
    const icon = new Image(toughShrub3_png, {
      scale: 0.2 // determined empirically
    });

    const labelNode = new HBox({
      children: [labelText, icon],
      spacing: NaturalSelectionConstants.CHECKBOX_X_SPACING
    });
    super(isToughProperty, labelNode, alignGroup, options);
  }
}
naturalSelection.register('ToughFoodCheckbox', ToughFoodCheckbox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIQm94IiwiSW1hZ2UiLCJUZXh0IiwidG91Z2hTaHJ1YjNfcG5nIiwibmF0dXJhbFNlbGVjdGlvbiIsIk5hdHVyYWxTZWxlY3Rpb25TdHJpbmdzIiwiTmF0dXJhbFNlbGVjdGlvbkNvbG9ycyIsIk5hdHVyYWxTZWxlY3Rpb25Db25zdGFudHMiLCJFbnZpcm9ubWVudGFsRmFjdG9yQ2hlY2tib3giLCJvcHRpb25pemUiLCJUb3VnaEZvb2RDaGVja2JveCIsImNvbnN0cnVjdG9yIiwiaXNUb3VnaFByb3BlcnR5IiwiYWxpZ25Hcm91cCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJjbG9ja1NsaWNlUmFuZ2UiLCJDTE9DS19GT09EX1JBTkdFIiwiY2xvY2tTbGljZUNvbG9yIiwiQ0xPQ0tfRk9PRF9TTElDRV9DT0xPUiIsImxhYmVsVGV4dCIsInRvdWdoRm9vZFN0cmluZ1Byb3BlcnR5IiwiZm9udCIsIkNIRUNLQk9YX0ZPTlQiLCJtYXhXaWR0aCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImljb24iLCJzY2FsZSIsImxhYmVsTm9kZSIsImNoaWxkcmVuIiwic3BhY2luZyIsIkNIRUNLQk9YX1hfU1BBQ0lORyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVG91Z2hGb29kQ2hlY2tib3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVG91Z2hGb29kQ2hlY2tib3ggaXMgYSBjaGVja2JveCBmb3IgZW5hYmxpbmcgdGhlICdUb3VnaCBGb29kJyBlbnZpcm9ubWVudGFsIGZhY3Rvci5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBBbGlnbkdyb3VwLCBIQm94LCBJbWFnZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB0b3VnaFNocnViM19wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3RvdWdoU2hydWIzX3BuZy5qcyc7XHJcbmltcG9ydCBuYXR1cmFsU2VsZWN0aW9uIGZyb20gJy4uLy4uL25hdHVyYWxTZWxlY3Rpb24uanMnO1xyXG5pbXBvcnQgTmF0dXJhbFNlbGVjdGlvblN0cmluZ3MgZnJvbSAnLi4vLi4vTmF0dXJhbFNlbGVjdGlvblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgTmF0dXJhbFNlbGVjdGlvbkNvbG9ycyBmcm9tICcuLi9OYXR1cmFsU2VsZWN0aW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IE5hdHVyYWxTZWxlY3Rpb25Db25zdGFudHMgZnJvbSAnLi4vTmF0dXJhbFNlbGVjdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBFbnZpcm9ubWVudGFsRmFjdG9yQ2hlY2tib3gsIHsgRW52aXJvbm1lbnRhbEZhY3RvckNoZWNrYm94T3B0aW9ucyB9IGZyb20gJy4vRW52aXJvbm1lbnRhbEZhY3RvckNoZWNrYm94LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBUb3VnaEZvb2RDaGVja2JveE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEVudmlyb25tZW50YWxGYWN0b3JDaGVja2JveE9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb3VnaEZvb2RDaGVja2JveCBleHRlbmRzIEVudmlyb25tZW50YWxGYWN0b3JDaGVja2JveCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaXNUb3VnaFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgYWxpZ25Hcm91cDogQWxpZ25Hcm91cCwgcHJvdmlkZWRPcHRpb25zOiBUb3VnaEZvb2RDaGVja2JveE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxUb3VnaEZvb2RDaGVja2JveE9wdGlvbnMsIFNlbGZPcHRpb25zLCBFbnZpcm9ubWVudGFsRmFjdG9yQ2hlY2tib3hPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBFbnZpcm9ubWVudGFsRmFjdG9yQ2hlY2tib3hPcHRpb25zXHJcbiAgICAgIGNsb2NrU2xpY2VSYW5nZTogTmF0dXJhbFNlbGVjdGlvbkNvbnN0YW50cy5DTE9DS19GT09EX1JBTkdFLFxyXG4gICAgICBjbG9ja1NsaWNlQ29sb3I6IE5hdHVyYWxTZWxlY3Rpb25Db2xvcnMuQ0xPQ0tfRk9PRF9TTElDRV9DT0xPUlxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgbGFiZWxUZXh0ID0gbmV3IFRleHQoIE5hdHVyYWxTZWxlY3Rpb25TdHJpbmdzLnRvdWdoRm9vZFN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IE5hdHVyYWxTZWxlY3Rpb25Db25zdGFudHMuQ0hFQ0tCT1hfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDkwLCAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGFiZWxUZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgaWNvbiA9IG5ldyBJbWFnZSggdG91Z2hTaHJ1YjNfcG5nLCB7XHJcbiAgICAgIHNjYWxlOiAwLjIgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGxhYmVsTm9kZSA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGxhYmVsVGV4dCwgaWNvbiBdLFxyXG4gICAgICBzcGFjaW5nOiBOYXR1cmFsU2VsZWN0aW9uQ29uc3RhbnRzLkNIRUNLQk9YX1hfU1BBQ0lOR1xyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBpc1RvdWdoUHJvcGVydHksIGxhYmVsTm9kZSwgYWxpZ25Hcm91cCwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxubmF0dXJhbFNlbGVjdGlvbi5yZWdpc3RlciggJ1RvdWdoRm9vZENoZWNrYm94JywgVG91Z2hGb29kQ2hlY2tib3ggKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBcUJBLElBQUksRUFBRUMsS0FBSyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ2pGLE9BQU9DLGVBQWUsTUFBTSxvQ0FBb0M7QUFDaEUsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyxzQkFBc0IsTUFBTSw4QkFBOEI7QUFDakUsT0FBT0MseUJBQXlCLE1BQU0saUNBQWlDO0FBQ3ZFLE9BQU9DLDJCQUEyQixNQUE4QyxrQ0FBa0M7QUFFbEgsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFNbkYsZUFBZSxNQUFNQyxpQkFBaUIsU0FBU0YsMkJBQTJCLENBQUM7RUFFbEVHLFdBQVdBLENBQUVDLGVBQWtDLEVBQUVDLFVBQXNCLEVBQUVDLGVBQXlDLEVBQUc7SUFFMUgsTUFBTUMsT0FBTyxHQUFHTixTQUFTLENBQTRFLENBQUMsQ0FBRTtNQUV0RztNQUNBTyxlQUFlLEVBQUVULHlCQUF5QixDQUFDVSxnQkFBZ0I7TUFDM0RDLGVBQWUsRUFBRVosc0JBQXNCLENBQUNhO0lBQzFDLENBQUMsRUFBRUwsZUFBZ0IsQ0FBQztJQUVwQixNQUFNTSxTQUFTLEdBQUcsSUFBSWxCLElBQUksQ0FBRUcsdUJBQXVCLENBQUNnQix1QkFBdUIsRUFBRTtNQUMzRUMsSUFBSSxFQUFFZix5QkFBeUIsQ0FBQ2dCLGFBQWE7TUFDN0NDLFFBQVEsRUFBRSxFQUFFO01BQUU7TUFDZEMsTUFBTSxFQUFFVixPQUFPLENBQUNVLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLFdBQVk7SUFDbkQsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsSUFBSSxHQUFHLElBQUkxQixLQUFLLENBQUVFLGVBQWUsRUFBRTtNQUN2Q3lCLEtBQUssRUFBRSxHQUFHLENBQUM7SUFDYixDQUFFLENBQUM7O0lBRUgsTUFBTUMsU0FBUyxHQUFHLElBQUk3QixJQUFJLENBQUU7TUFDMUI4QixRQUFRLEVBQUUsQ0FBRVYsU0FBUyxFQUFFTyxJQUFJLENBQUU7TUFDN0JJLE9BQU8sRUFBRXhCLHlCQUF5QixDQUFDeUI7SUFDckMsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFcEIsZUFBZSxFQUFFaUIsU0FBUyxFQUFFaEIsVUFBVSxFQUFFRSxPQUFRLENBQUM7RUFDMUQ7QUFDRjtBQUVBWCxnQkFBZ0IsQ0FBQzZCLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRXZCLGlCQUFrQixDQUFDIn0=