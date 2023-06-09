// Copyright 2017-2022, University of Colorado Boulder

/**
 * The 'Basics' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';
import EqualityExplorerScreen from '../common/EqualityExplorerScreen.js';
import equalityExplorer from '../equalityExplorer.js';
import EqualityExplorerStrings from '../EqualityExplorerStrings.js';
import BasicsModel from './model/BasicsModel.js';
import BasicsScreenView from './view/BasicsScreenView.js';
import appleBig_png from '../../images/appleBig_png.js';
import orangeBig_png from '../../images/orangeBig_png.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { HBox, Image, Text, VBox } from '../../../scenery/js/imports.js';
import EqualityExplorerColors from '../common/EqualityExplorerColors.js';
export default class BasicsScreen extends EqualityExplorerScreen {
  constructor(providedOptions) {
    const options = optionize()({
      // EqualityExplorerScreenOptions
      name: EqualityExplorerStrings.screen.basicsStringProperty,
      backgroundColorProperty: new Property(EqualityExplorerColors.BASICS_SCREEN_BACKGROUND),
      homeScreenIcon: createScreenIcon()
    }, providedOptions);
    super(() => new BasicsModel(options.tandem.createTandem('model')), model => new BasicsScreenView(model, options.tandem.createTandem('view')), options);
  }
}

/**
 * Creates the icon for this screen: apples > oranges
 */
function createScreenIcon() {
  // apples on left side of the equation
  const appleNode1 = new Image(appleBig_png);
  const appleNode2 = new Image(appleBig_png, {
    left: appleNode1.left - 10,
    top: appleNode1.bottom + 5
  });
  const appleGroupNode = new VBox({
    spacing: 2,
    children: [appleNode1, appleNode2]
  });

  // >
  const greaterThanText = new Text(MathSymbols.GREATER_THAN, {
    font: new PhetFont(140)
  });

  // an orange on right side of the equation
  const orangeNode = new Image(orangeBig_png);
  const iconNode = new HBox({
    spacing: 15,
    children: [appleGroupNode, greaterThanText, orangeNode]
  });
  return new ScreenIcon(iconNode, {
    maxIconHeightProportion: 0.8,
    fill: EqualityExplorerColors.BASICS_SCREEN_BACKGROUND
  });
}
equalityExplorer.register('BasicsScreen', BasicsScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsIkVxdWFsaXR5RXhwbG9yZXJTY3JlZW4iLCJlcXVhbGl0eUV4cGxvcmVyIiwiRXF1YWxpdHlFeHBsb3JlclN0cmluZ3MiLCJCYXNpY3NNb2RlbCIsIkJhc2ljc1NjcmVlblZpZXciLCJhcHBsZUJpZ19wbmciLCJvcmFuZ2VCaWdfcG5nIiwiU2NyZWVuSWNvbiIsIk1hdGhTeW1ib2xzIiwiUGhldEZvbnQiLCJIQm94IiwiSW1hZ2UiLCJUZXh0IiwiVkJveCIsIkVxdWFsaXR5RXhwbG9yZXJDb2xvcnMiLCJCYXNpY3NTY3JlZW4iLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJuYW1lIiwic2NyZWVuIiwiYmFzaWNzU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsIkJBU0lDU19TQ1JFRU5fQkFDS0dST1VORCIsImhvbWVTY3JlZW5JY29uIiwiY3JlYXRlU2NyZWVuSWNvbiIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsIm1vZGVsIiwiYXBwbGVOb2RlMSIsImFwcGxlTm9kZTIiLCJsZWZ0IiwidG9wIiwiYm90dG9tIiwiYXBwbGVHcm91cE5vZGUiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJncmVhdGVyVGhhblRleHQiLCJHUkVBVEVSX1RIQU4iLCJmb250Iiwib3JhbmdlTm9kZSIsImljb25Ob2RlIiwibWF4SWNvbkhlaWdodFByb3BvcnRpb24iLCJmaWxsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYXNpY3NTY3JlZW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlICdCYXNpY3MnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgRXF1YWxpdHlFeHBsb3JlclNjcmVlbiwgeyBFcXVhbGl0eUV4cGxvcmVyU2NyZWVuT3B0aW9ucyB9IGZyb20gJy4uL2NvbW1vbi9FcXVhbGl0eUV4cGxvcmVyU2NyZWVuLmpzJztcclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXIgZnJvbSAnLi4vZXF1YWxpdHlFeHBsb3Jlci5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyU3RyaW5ncyBmcm9tICcuLi9FcXVhbGl0eUV4cGxvcmVyU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBCYXNpY3NNb2RlbCBmcm9tICcuL21vZGVsL0Jhc2ljc01vZGVsLmpzJztcclxuaW1wb3J0IEJhc2ljc1NjcmVlblZpZXcgZnJvbSAnLi92aWV3L0Jhc2ljc1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgYXBwbGVCaWdfcG5nIGZyb20gJy4uLy4uL2ltYWdlcy9hcHBsZUJpZ19wbmcuanMnO1xyXG5pbXBvcnQgb3JhbmdlQmlnX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvb3JhbmdlQmlnX3BuZy5qcyc7XHJcbmltcG9ydCBTY3JlZW5JY29uIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbkljb24uanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIEltYWdlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJDb2xvcnMgZnJvbSAnLi4vY29tbW9uL0VxdWFsaXR5RXhwbG9yZXJDb2xvcnMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEJhc2ljc1NjcmVlbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxFcXVhbGl0eUV4cGxvcmVyU2NyZWVuT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzaWNzU2NyZWVuIGV4dGVuZHMgRXF1YWxpdHlFeHBsb3JlclNjcmVlbjxCYXNpY3NNb2RlbCwgQmFzaWNzU2NyZWVuVmlldz4ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogQmFzaWNzU2NyZWVuT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEJhc2ljc1NjcmVlbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBFcXVhbGl0eUV4cGxvcmVyU2NyZWVuT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gRXF1YWxpdHlFeHBsb3JlclNjcmVlbk9wdGlvbnNcclxuICAgICAgbmFtZTogRXF1YWxpdHlFeHBsb3JlclN0cmluZ3Muc2NyZWVuLmJhc2ljc1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBFcXVhbGl0eUV4cGxvcmVyQ29sb3JzLkJBU0lDU19TQ1JFRU5fQkFDS0dST1VORCApLFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogY3JlYXRlU2NyZWVuSWNvbigpXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IEJhc2ljc01vZGVsKCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSApLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgQmFzaWNzU2NyZWVuVmlldyggbW9kZWwsIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXcnICkgKSxcclxuICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIHRoZSBpY29uIGZvciB0aGlzIHNjcmVlbjogYXBwbGVzID4gb3Jhbmdlc1xyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlU2NyZWVuSWNvbigpOiBTY3JlZW5JY29uIHtcclxuXHJcbiAgLy8gYXBwbGVzIG9uIGxlZnQgc2lkZSBvZiB0aGUgZXF1YXRpb25cclxuICBjb25zdCBhcHBsZU5vZGUxID0gbmV3IEltYWdlKCBhcHBsZUJpZ19wbmcgKTtcclxuICBjb25zdCBhcHBsZU5vZGUyID0gbmV3IEltYWdlKCBhcHBsZUJpZ19wbmcsIHtcclxuICAgIGxlZnQ6IGFwcGxlTm9kZTEubGVmdCAtIDEwLFxyXG4gICAgdG9wOiBhcHBsZU5vZGUxLmJvdHRvbSArIDVcclxuICB9ICk7XHJcbiAgY29uc3QgYXBwbGVHcm91cE5vZGUgPSBuZXcgVkJveCgge1xyXG4gICAgc3BhY2luZzogMixcclxuICAgIGNoaWxkcmVuOiBbIGFwcGxlTm9kZTEsIGFwcGxlTm9kZTIgXVxyXG4gIH0gKTtcclxuXHJcbiAgLy8gPlxyXG4gIGNvbnN0IGdyZWF0ZXJUaGFuVGV4dCA9IG5ldyBUZXh0KCBNYXRoU3ltYm9scy5HUkVBVEVSX1RIQU4sIHtcclxuICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTQwIClcclxuICB9ICk7XHJcblxyXG4gIC8vIGFuIG9yYW5nZSBvbiByaWdodCBzaWRlIG9mIHRoZSBlcXVhdGlvblxyXG4gIGNvbnN0IG9yYW5nZU5vZGUgPSBuZXcgSW1hZ2UoIG9yYW5nZUJpZ19wbmcgKTtcclxuXHJcbiAgY29uc3QgaWNvbk5vZGUgPSBuZXcgSEJveCgge1xyXG4gICAgc3BhY2luZzogMTUsXHJcbiAgICBjaGlsZHJlbjogWyBhcHBsZUdyb3VwTm9kZSwgZ3JlYXRlclRoYW5UZXh0LCBvcmFuZ2VOb2RlIF1cclxuICB9ICk7XHJcblxyXG4gIHJldHVybiBuZXcgU2NyZWVuSWNvbiggaWNvbk5vZGUsIHtcclxuICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAwLjgsXHJcbiAgICBmaWxsOiBFcXVhbGl0eUV4cGxvcmVyQ29sb3JzLkJBU0lDU19TQ1JFRU5fQkFDS0dST1VORFxyXG4gIH0gKTtcclxufVxyXG5cclxuZXF1YWxpdHlFeHBsb3Jlci5yZWdpc3RlciggJ0Jhc2ljc1NjcmVlbicsIEJhc2ljc1NjcmVlbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLFNBQVMsTUFBNEIsb0NBQW9DO0FBRWhGLE9BQU9DLHNCQUFzQixNQUF5QyxxQ0FBcUM7QUFDM0csT0FBT0MsZ0JBQWdCLE1BQU0sd0JBQXdCO0FBQ3JELE9BQU9DLHVCQUF1QixNQUFNLCtCQUErQjtBQUNuRSxPQUFPQyxXQUFXLE1BQU0sd0JBQXdCO0FBQ2hELE9BQU9DLGdCQUFnQixNQUFNLDRCQUE0QjtBQUN6RCxPQUFPQyxZQUFZLE1BQU0sOEJBQThCO0FBQ3ZELE9BQU9DLGFBQWEsTUFBTSwrQkFBK0I7QUFDekQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsU0FBU0MsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLGdDQUFnQztBQUN4RSxPQUFPQyxzQkFBc0IsTUFBTSxxQ0FBcUM7QUFNeEUsZUFBZSxNQUFNQyxZQUFZLFNBQVNmLHNCQUFzQixDQUFnQztFQUV2RmdCLFdBQVdBLENBQUVDLGVBQW9DLEVBQUc7SUFFekQsTUFBTUMsT0FBTyxHQUFHbkIsU0FBUyxDQUFrRSxDQUFDLENBQUU7TUFFNUY7TUFDQW9CLElBQUksRUFBRWpCLHVCQUF1QixDQUFDa0IsTUFBTSxDQUFDQyxvQkFBb0I7TUFDekRDLHVCQUF1QixFQUFFLElBQUl4QixRQUFRLENBQUVnQixzQkFBc0IsQ0FBQ1Msd0JBQXlCLENBQUM7TUFDeEZDLGNBQWMsRUFBRUMsZ0JBQWdCLENBQUM7SUFDbkMsQ0FBQyxFQUFFUixlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FDSCxNQUFNLElBQUlkLFdBQVcsQ0FBRWUsT0FBTyxDQUFDUSxNQUFNLENBQUNDLFlBQVksQ0FBRSxPQUFRLENBQUUsQ0FBQyxFQUMvREMsS0FBSyxJQUFJLElBQUl4QixnQkFBZ0IsQ0FBRXdCLEtBQUssRUFBRVYsT0FBTyxDQUFDUSxNQUFNLENBQUNDLFlBQVksQ0FBRSxNQUFPLENBQUUsQ0FBQyxFQUM3RVQsT0FDRixDQUFDO0VBQ0g7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTTyxnQkFBZ0JBLENBQUEsRUFBZTtFQUV0QztFQUNBLE1BQU1JLFVBQVUsR0FBRyxJQUFJbEIsS0FBSyxDQUFFTixZQUFhLENBQUM7RUFDNUMsTUFBTXlCLFVBQVUsR0FBRyxJQUFJbkIsS0FBSyxDQUFFTixZQUFZLEVBQUU7SUFDMUMwQixJQUFJLEVBQUVGLFVBQVUsQ0FBQ0UsSUFBSSxHQUFHLEVBQUU7SUFDMUJDLEdBQUcsRUFBRUgsVUFBVSxDQUFDSSxNQUFNLEdBQUc7RUFDM0IsQ0FBRSxDQUFDO0VBQ0gsTUFBTUMsY0FBYyxHQUFHLElBQUlyQixJQUFJLENBQUU7SUFDL0JzQixPQUFPLEVBQUUsQ0FBQztJQUNWQyxRQUFRLEVBQUUsQ0FBRVAsVUFBVSxFQUFFQyxVQUFVO0VBQ3BDLENBQUUsQ0FBQzs7RUFFSDtFQUNBLE1BQU1PLGVBQWUsR0FBRyxJQUFJekIsSUFBSSxDQUFFSixXQUFXLENBQUM4QixZQUFZLEVBQUU7SUFDMURDLElBQUksRUFBRSxJQUFJOUIsUUFBUSxDQUFFLEdBQUk7RUFDMUIsQ0FBRSxDQUFDOztFQUVIO0VBQ0EsTUFBTStCLFVBQVUsR0FBRyxJQUFJN0IsS0FBSyxDQUFFTCxhQUFjLENBQUM7RUFFN0MsTUFBTW1DLFFBQVEsR0FBRyxJQUFJL0IsSUFBSSxDQUFFO0lBQ3pCeUIsT0FBTyxFQUFFLEVBQUU7SUFDWEMsUUFBUSxFQUFFLENBQUVGLGNBQWMsRUFBRUcsZUFBZSxFQUFFRyxVQUFVO0VBQ3pELENBQUUsQ0FBQztFQUVILE9BQU8sSUFBSWpDLFVBQVUsQ0FBRWtDLFFBQVEsRUFBRTtJQUMvQkMsdUJBQXVCLEVBQUUsR0FBRztJQUM1QkMsSUFBSSxFQUFFN0Isc0JBQXNCLENBQUNTO0VBQy9CLENBQUUsQ0FBQztBQUNMO0FBRUF0QixnQkFBZ0IsQ0FBQzJDLFFBQVEsQ0FBRSxjQUFjLEVBQUU3QixZQUFhLENBQUMifQ==