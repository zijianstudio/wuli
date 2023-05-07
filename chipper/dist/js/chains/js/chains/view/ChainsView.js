// Copyright 2015-2022, University of Colorado Boulder

/**
 * View for the 'Chains' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SceneryPhetStrings from '../../../../scenery-phet/js/SceneryPhetStrings.js';
import { RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import chains from '../../chains.js';
import ChainsStrings from '../../ChainsStrings.js';

// constants
const FONT = new PhetFont(36);
class ChainsView extends ScreenView {
  /**
   * @param {*} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      tandem: tandem
    });
    const sizeStringProperty = new DerivedProperty([ChainsStrings.patternStringStringProperty, ChainsStrings.sizeStringProperty, SceneryPhetStrings.units_nmStringProperty], (pattern, sizeString, unitsString) => StringUtils.format(pattern, sizeString, 8, unitsString));
    this.addChild(new VBox({
      align: 'left',
      spacing: 25,
      children: [new Text(ChainsStrings.plainStringStringProperty, {
        font: FONT,
        fill: 'green',
        tandem: tandem.createTandem('plainStringText')
      }), new RichText(ChainsStrings.multilineStringStringProperty, {
        font: FONT,
        align: 'left',
        tandem: tandem.createTandem('multiLineStringText')
      }), new RichText(ChainsStrings.htmlStringStringProperty, {
        font: FONT,
        tandem: tandem.createTandem('htmlStringText')
      }), new Text(sizeStringProperty, {
        font: FONT,
        tandem: tandem.createTandem('patternStringText')
      }), new Text(new PatternStringProperty(ChainsStrings.namedPlaceholdersStringStringProperty, {
        name: 'Alice',
        speed: '100'
      }), {
        font: FONT,
        fill: '#990000',
        tandem: tandem.createTandem('namedPlaceholdersStringText')
      })],
      center: this.layoutBounds.center
    }));

    // Reset All button
    const resetAllButton = new ResetAllButton({
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
      tandem: tandem.createTandem('resetAllButton')
    });
    this.addChild(resetAllButton);
  }
}
chains.register('ChainsView', ChainsView);
export default ChainsView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJTY3JlZW5WaWV3IiwiU3RyaW5nVXRpbHMiLCJSZXNldEFsbEJ1dHRvbiIsIlBoZXRGb250IiwiU2NlbmVyeVBoZXRTdHJpbmdzIiwiUmljaFRleHQiLCJUZXh0IiwiVkJveCIsImNoYWlucyIsIkNoYWluc1N0cmluZ3MiLCJGT05UIiwiQ2hhaW5zVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJzaXplU3RyaW5nUHJvcGVydHkiLCJwYXR0ZXJuU3RyaW5nU3RyaW5nUHJvcGVydHkiLCJ1bml0c19ubVN0cmluZ1Byb3BlcnR5IiwicGF0dGVybiIsInNpemVTdHJpbmciLCJ1bml0c1N0cmluZyIsImZvcm1hdCIsImFkZENoaWxkIiwiYWxpZ24iLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJwbGFpblN0cmluZ1N0cmluZ1Byb3BlcnR5IiwiZm9udCIsImZpbGwiLCJjcmVhdGVUYW5kZW0iLCJtdWx0aWxpbmVTdHJpbmdTdHJpbmdQcm9wZXJ0eSIsImh0bWxTdHJpbmdTdHJpbmdQcm9wZXJ0eSIsIm5hbWVkUGxhY2Vob2xkZXJzU3RyaW5nU3RyaW5nUHJvcGVydHkiLCJuYW1lIiwic3BlZWQiLCJjZW50ZXIiLCJsYXlvdXRCb3VuZHMiLCJyZXNldEFsbEJ1dHRvbiIsInJpZ2h0IiwibWF4WCIsImJvdHRvbSIsIm1heFkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNoYWluc1ZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBmb3IgdGhlICdDaGFpbnMnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBTY2VuZXJ5UGhldFN0cmluZ3MgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1NjZW5lcnlQaGV0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCB7IFJpY2hUZXh0LCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGNoYWlucyBmcm9tICcuLi8uLi9jaGFpbnMuanMnO1xyXG5pbXBvcnQgQ2hhaW5zU3RyaW5ncyBmcm9tICcuLi8uLi9DaGFpbnNTdHJpbmdzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBGT05UID0gbmV3IFBoZXRGb250KCAzNiApO1xyXG5cclxuY2xhc3MgQ2hhaW5zVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0geyp9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2l6ZVN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyBDaGFpbnNTdHJpbmdzLnBhdHRlcm5TdHJpbmdTdHJpbmdQcm9wZXJ0eSwgQ2hhaW5zU3RyaW5ncy5zaXplU3RyaW5nUHJvcGVydHksIFNjZW5lcnlQaGV0U3RyaW5ncy51bml0c19ubVN0cmluZ1Byb3BlcnR5IF0sXHJcbiAgICAgICggcGF0dGVybiwgc2l6ZVN0cmluZywgdW5pdHNTdHJpbmcgKSA9PiBTdHJpbmdVdGlscy5mb3JtYXQoIHBhdHRlcm4sIHNpemVTdHJpbmcsIDgsIHVuaXRzU3RyaW5nIClcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFZCb3goIHtcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogMjUsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFRleHQoIENoYWluc1N0cmluZ3MucGxhaW5TdHJpbmdTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgZm9udDogRk9OVCxcclxuICAgICAgICAgIGZpbGw6ICdncmVlbicsXHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwbGFpblN0cmluZ1RleHQnIClcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgbmV3IFJpY2hUZXh0KCBDaGFpbnNTdHJpbmdzLm11bHRpbGluZVN0cmluZ1N0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgICBmb250OiBGT05ULFxyXG4gICAgICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ211bHRpTGluZVN0cmluZ1RleHQnIClcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgbmV3IFJpY2hUZXh0KCBDaGFpbnNTdHJpbmdzLmh0bWxTdHJpbmdTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgZm9udDogRk9OVCxcclxuICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2h0bWxTdHJpbmdUZXh0JyApXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBUZXh0KCBzaXplU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICAgIGZvbnQ6IEZPTlQsXHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwYXR0ZXJuU3RyaW5nVGV4dCcgKVxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBuZXcgVGV4dCggbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggQ2hhaW5zU3RyaW5ncy5uYW1lZFBsYWNlaG9sZGVyc1N0cmluZ1N0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgICBuYW1lOiAnQWxpY2UnLFxyXG4gICAgICAgICAgc3BlZWQ6ICcxMDAnXHJcbiAgICAgICAgfSApLCB7XHJcbiAgICAgICAgICBmb250OiBGT05ULFxyXG4gICAgICAgICAgZmlsbDogJyM5OTAwMDAnLFxyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbmFtZWRQbGFjZWhvbGRlcnNTdHJpbmdUZXh0JyApXHJcbiAgICAgICAgfSApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNlbnRlcjogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBSZXNldCBBbGwgYnV0dG9uXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIDEwLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSAxMCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVzZXRBbGxCdXR0b24nIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XHJcbiAgfVxyXG59XHJcblxyXG5jaGFpbnMucmVnaXN0ZXIoICdDaGFpbnNWaWV3JywgQ2hhaW5zVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBDaGFpbnNWaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsY0FBYyxNQUFNLHVEQUF1RDtBQUNsRixPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLGtCQUFrQixNQUFNLG1EQUFtRDtBQUNsRixTQUFTQyxRQUFRLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUN4RSxPQUFPQyxNQUFNLE1BQU0saUJBQWlCO0FBQ3BDLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7O0FBRWxEO0FBQ0EsTUFBTUMsSUFBSSxHQUFHLElBQUlQLFFBQVEsQ0FBRSxFQUFHLENBQUM7QUFFL0IsTUFBTVEsVUFBVSxTQUFTWCxVQUFVLENBQUM7RUFFbEM7QUFDRjtBQUNBO0FBQ0E7RUFDRVksV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxNQUFNLEVBQUc7SUFFM0IsS0FBSyxDQUFFO01BQ0xBLE1BQU0sRUFBRUE7SUFDVixDQUFFLENBQUM7SUFFSCxNQUFNQyxrQkFBa0IsR0FBRyxJQUFJakIsZUFBZSxDQUM1QyxDQUFFVyxhQUFhLENBQUNPLDJCQUEyQixFQUFFUCxhQUFhLENBQUNNLGtCQUFrQixFQUFFWCxrQkFBa0IsQ0FBQ2Esc0JBQXNCLENBQUUsRUFDMUgsQ0FBRUMsT0FBTyxFQUFFQyxVQUFVLEVBQUVDLFdBQVcsS0FBTW5CLFdBQVcsQ0FBQ29CLE1BQU0sQ0FBRUgsT0FBTyxFQUFFQyxVQUFVLEVBQUUsQ0FBQyxFQUFFQyxXQUFZLENBQ2xHLENBQUM7SUFFRCxJQUFJLENBQUNFLFFBQVEsQ0FBRSxJQUFJZixJQUFJLENBQUU7TUFDdkJnQixLQUFLLEVBQUUsTUFBTTtNQUNiQyxPQUFPLEVBQUUsRUFBRTtNQUNYQyxRQUFRLEVBQUUsQ0FDUixJQUFJbkIsSUFBSSxDQUFFRyxhQUFhLENBQUNpQix5QkFBeUIsRUFBRTtRQUNqREMsSUFBSSxFQUFFakIsSUFBSTtRQUNWa0IsSUFBSSxFQUFFLE9BQU87UUFDYmQsTUFBTSxFQUFFQSxNQUFNLENBQUNlLFlBQVksQ0FBRSxpQkFBa0I7TUFDakQsQ0FBRSxDQUFDLEVBQ0gsSUFBSXhCLFFBQVEsQ0FBRUksYUFBYSxDQUFDcUIsNkJBQTZCLEVBQUU7UUFDekRILElBQUksRUFBRWpCLElBQUk7UUFDVmEsS0FBSyxFQUFFLE1BQU07UUFDYlQsTUFBTSxFQUFFQSxNQUFNLENBQUNlLFlBQVksQ0FBRSxxQkFBc0I7TUFDckQsQ0FBRSxDQUFDLEVBQ0gsSUFBSXhCLFFBQVEsQ0FBRUksYUFBYSxDQUFDc0Isd0JBQXdCLEVBQUU7UUFDcERKLElBQUksRUFBRWpCLElBQUk7UUFDVkksTUFBTSxFQUFFQSxNQUFNLENBQUNlLFlBQVksQ0FBRSxnQkFBaUI7TUFDaEQsQ0FBRSxDQUFDLEVBQ0gsSUFBSXZCLElBQUksQ0FBRVMsa0JBQWtCLEVBQUU7UUFDNUJZLElBQUksRUFBRWpCLElBQUk7UUFDVkksTUFBTSxFQUFFQSxNQUFNLENBQUNlLFlBQVksQ0FBRSxtQkFBb0I7TUFDbkQsQ0FBRSxDQUFDLEVBQ0gsSUFBSXZCLElBQUksQ0FBRSxJQUFJUCxxQkFBcUIsQ0FBRVUsYUFBYSxDQUFDdUIscUNBQXFDLEVBQUU7UUFDeEZDLElBQUksRUFBRSxPQUFPO1FBQ2JDLEtBQUssRUFBRTtNQUNULENBQUUsQ0FBQyxFQUFFO1FBQ0hQLElBQUksRUFBRWpCLElBQUk7UUFDVmtCLElBQUksRUFBRSxTQUFTO1FBQ2ZkLE1BQU0sRUFBRUEsTUFBTSxDQUFDZSxZQUFZLENBQUUsNkJBQThCO01BQzdELENBQUUsQ0FBQyxDQUNKO01BQ0RNLE1BQU0sRUFBRSxJQUFJLENBQUNDLFlBQVksQ0FBQ0Q7SUFDNUIsQ0FBRSxDQUFFLENBQUM7O0lBRUw7SUFDQSxNQUFNRSxjQUFjLEdBQUcsSUFBSW5DLGNBQWMsQ0FBRTtNQUN6Q29DLEtBQUssRUFBRSxJQUFJLENBQUNGLFlBQVksQ0FBQ0csSUFBSSxHQUFHLEVBQUU7TUFDbENDLE1BQU0sRUFBRSxJQUFJLENBQUNKLFlBQVksQ0FBQ0ssSUFBSSxHQUFHLEVBQUU7TUFDbkMzQixNQUFNLEVBQUVBLE1BQU0sQ0FBQ2UsWUFBWSxDQUFFLGdCQUFpQjtJQUNoRCxDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNQLFFBQVEsQ0FBRWUsY0FBZSxDQUFDO0VBQ2pDO0FBQ0Y7QUFFQTdCLE1BQU0sQ0FBQ2tDLFFBQVEsQ0FBRSxZQUFZLEVBQUUvQixVQUFXLENBQUM7QUFDM0MsZUFBZUEsVUFBVSJ9