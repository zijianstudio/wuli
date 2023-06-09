// Copyright 2017-2023, University of Colorado Boulder

/**
 * Shows radio buttons that allow selecting between different ways of showing area computations (or none).
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { AlignBox, Path, Rectangle, VBox } from '../../../../scenery/js/imports.js';
import eyeSlashSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSlashSolidShape.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaCalculationChoice from '../model/AreaCalculationChoice.js';
import AreaModelCommonColors from './AreaModelCommonColors.js';
import AreaModelCommonRadioButtonGroup from './AreaModelCommonRadioButtonGroup.js';
class AreaCalculationRadioButtonGroup extends AreaModelCommonRadioButtonGroup {
  /**
   * @param {Property.<AreaCalculationChoice>} areaCalculationChoiceProperty
   * @param {AlignGroup} selectionButtonAlignGroup
   */
  constructor(areaCalculationChoiceProperty, selectionButtonAlignGroup) {
    const darkColorProperty = AreaModelCommonColors.calculationIconDarkProperty;
    const lightColorProperty = AreaModelCommonColors.calculationIconLightProperty;
    super(areaCalculationChoiceProperty, [{
      value: AreaCalculationChoice.HIDDEN,
      createNode: () => new AlignBox(new Path(eyeSlashSolidShape, {
        scale: 0.05249946193736533,
        fill: 'black'
      }), {
        group: selectionButtonAlignGroup
      })
    }, {
      value: AreaCalculationChoice.LINE_BY_LINE,
      createNode: () => new AlignBox(createCalculationIcon(darkColorProperty, lightColorProperty), {
        group: selectionButtonAlignGroup
      })
    }, {
      value: AreaCalculationChoice.SHOW_ALL_LINES,
      createNode: () => new AlignBox(createCalculationIcon(darkColorProperty, darkColorProperty), {
        group: selectionButtonAlignGroup
      })
    }]);
  }
}

/**
 * Creates a calculation icon with two fills.
 * @private
 *
 * @param {Property.<Color>} topColorProperty - Fill for the top line
 * @param {Property.<Color>} bottomColorProperty - Fill for the bottom-most three lines
 * @returns {Node}
 */
function createCalculationIcon(topColorProperty, bottomColorProperty) {
  const height = 5;
  const fullWidth = 30;
  const partialWidth = 20;
  return new VBox({
    children: [new Rectangle(0, 0, partialWidth, height, {
      fill: topColorProperty
    }), new Rectangle(0, 0, fullWidth, height, {
      fill: bottomColorProperty
    }), new Rectangle(0, 0, partialWidth, height, {
      fill: bottomColorProperty
    }), new Rectangle(0, 0, fullWidth, height, {
      fill: bottomColorProperty
    })],
    align: 'left',
    spacing: 2
  });
}
areaModelCommon.register('AreaCalculationRadioButtonGroup', AreaCalculationRadioButtonGroup);
export default AreaCalculationRadioButtonGroup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbGlnbkJveCIsIlBhdGgiLCJSZWN0YW5nbGUiLCJWQm94IiwiZXllU2xhc2hTb2xpZFNoYXBlIiwiYXJlYU1vZGVsQ29tbW9uIiwiQXJlYUNhbGN1bGF0aW9uQ2hvaWNlIiwiQXJlYU1vZGVsQ29tbW9uQ29sb3JzIiwiQXJlYU1vZGVsQ29tbW9uUmFkaW9CdXR0b25Hcm91cCIsIkFyZWFDYWxjdWxhdGlvblJhZGlvQnV0dG9uR3JvdXAiLCJjb25zdHJ1Y3RvciIsImFyZWFDYWxjdWxhdGlvbkNob2ljZVByb3BlcnR5Iiwic2VsZWN0aW9uQnV0dG9uQWxpZ25Hcm91cCIsImRhcmtDb2xvclByb3BlcnR5IiwiY2FsY3VsYXRpb25JY29uRGFya1Byb3BlcnR5IiwibGlnaHRDb2xvclByb3BlcnR5IiwiY2FsY3VsYXRpb25JY29uTGlnaHRQcm9wZXJ0eSIsInZhbHVlIiwiSElEREVOIiwiY3JlYXRlTm9kZSIsInNjYWxlIiwiZmlsbCIsImdyb3VwIiwiTElORV9CWV9MSU5FIiwiY3JlYXRlQ2FsY3VsYXRpb25JY29uIiwiU0hPV19BTExfTElORVMiLCJ0b3BDb2xvclByb3BlcnR5IiwiYm90dG9tQ29sb3JQcm9wZXJ0eSIsImhlaWdodCIsImZ1bGxXaWR0aCIsInBhcnRpYWxXaWR0aCIsImNoaWxkcmVuIiwiYWxpZ24iLCJzcGFjaW5nIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBcmVhQ2FsY3VsYXRpb25SYWRpb0J1dHRvbkdyb3VwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNob3dzIHJhZGlvIGJ1dHRvbnMgdGhhdCBhbGxvdyBzZWxlY3RpbmcgYmV0d2VlbiBkaWZmZXJlbnQgd2F5cyBvZiBzaG93aW5nIGFyZWEgY29tcHV0YXRpb25zIChvciBub25lKS5cclxuICpcclxuICogTk9URTogVGhpcyB0eXBlIGlzIGRlc2lnbmVkIHRvIGJlIHBlcnNpc3RlbnQsIGFuZCB3aWxsIG5vdCBuZWVkIHRvIHJlbGVhc2UgcmVmZXJlbmNlcyB0byBhdm9pZCBtZW1vcnkgbGVha3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgeyBBbGlnbkJveCwgUGF0aCwgUmVjdGFuZ2xlLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGV5ZVNsYXNoU29saWRTaGFwZSBmcm9tICcuLi8uLi8uLi8uLi9zaGVycGEvanMvZm9udGF3ZXNvbWUtNS9leWVTbGFzaFNvbGlkU2hhcGUuanMnO1xyXG5pbXBvcnQgYXJlYU1vZGVsQ29tbW9uIGZyb20gJy4uLy4uL2FyZWFNb2RlbENvbW1vbi5qcyc7XHJcbmltcG9ydCBBcmVhQ2FsY3VsYXRpb25DaG9pY2UgZnJvbSAnLi4vbW9kZWwvQXJlYUNhbGN1bGF0aW9uQ2hvaWNlLmpzJztcclxuaW1wb3J0IEFyZWFNb2RlbENvbW1vbkNvbG9ycyBmcm9tICcuL0FyZWFNb2RlbENvbW1vbkNvbG9ycy5qcyc7XHJcbmltcG9ydCBBcmVhTW9kZWxDb21tb25SYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4vQXJlYU1vZGVsQ29tbW9uUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcblxyXG5jbGFzcyBBcmVhQ2FsY3VsYXRpb25SYWRpb0J1dHRvbkdyb3VwIGV4dGVuZHMgQXJlYU1vZGVsQ29tbW9uUmFkaW9CdXR0b25Hcm91cCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPEFyZWFDYWxjdWxhdGlvbkNob2ljZT59IGFyZWFDYWxjdWxhdGlvbkNob2ljZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtBbGlnbkdyb3VwfSBzZWxlY3Rpb25CdXR0b25BbGlnbkdyb3VwXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGFyZWFDYWxjdWxhdGlvbkNob2ljZVByb3BlcnR5LCBzZWxlY3Rpb25CdXR0b25BbGlnbkdyb3VwICkge1xyXG5cclxuICAgIGNvbnN0IGRhcmtDb2xvclByb3BlcnR5ID0gQXJlYU1vZGVsQ29tbW9uQ29sb3JzLmNhbGN1bGF0aW9uSWNvbkRhcmtQcm9wZXJ0eTtcclxuICAgIGNvbnN0IGxpZ2h0Q29sb3JQcm9wZXJ0eSA9IEFyZWFNb2RlbENvbW1vbkNvbG9ycy5jYWxjdWxhdGlvbkljb25MaWdodFByb3BlcnR5O1xyXG5cclxuICAgIHN1cGVyKCBhcmVhQ2FsY3VsYXRpb25DaG9pY2VQcm9wZXJ0eSwgWyB7XHJcbiAgICAgIHZhbHVlOiBBcmVhQ2FsY3VsYXRpb25DaG9pY2UuSElEREVOLFxyXG4gICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgQWxpZ25Cb3goIG5ldyBQYXRoKCBleWVTbGFzaFNvbGlkU2hhcGUsIHsgc2NhbGU6IDAuMDUyNDk5NDYxOTM3MzY1MzMsIGZpbGw6ICdibGFjaycgfSApLCB7IGdyb3VwOiBzZWxlY3Rpb25CdXR0b25BbGlnbkdyb3VwIH0gKVxyXG4gICAgfSwge1xyXG4gICAgICB2YWx1ZTogQXJlYUNhbGN1bGF0aW9uQ2hvaWNlLkxJTkVfQllfTElORSxcclxuICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IEFsaWduQm94KCBjcmVhdGVDYWxjdWxhdGlvbkljb24oIGRhcmtDb2xvclByb3BlcnR5LCBsaWdodENvbG9yUHJvcGVydHkgKSwgeyBncm91cDogc2VsZWN0aW9uQnV0dG9uQWxpZ25Hcm91cCB9IClcclxuICAgIH0sIHtcclxuICAgICAgdmFsdWU6IEFyZWFDYWxjdWxhdGlvbkNob2ljZS5TSE9XX0FMTF9MSU5FUyxcclxuICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IEFsaWduQm94KCBjcmVhdGVDYWxjdWxhdGlvbkljb24oIGRhcmtDb2xvclByb3BlcnR5LCBkYXJrQ29sb3JQcm9wZXJ0eSApLCB7IGdyb3VwOiBzZWxlY3Rpb25CdXR0b25BbGlnbkdyb3VwIH0gKVxyXG4gICAgfSBdICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIGNhbGN1bGF0aW9uIGljb24gd2l0aCB0d28gZmlsbHMuXHJcbiAqIEBwcml2YXRlXHJcbiAqXHJcbiAqIEBwYXJhbSB7UHJvcGVydHkuPENvbG9yPn0gdG9wQ29sb3JQcm9wZXJ0eSAtIEZpbGwgZm9yIHRoZSB0b3AgbGluZVxyXG4gKiBAcGFyYW0ge1Byb3BlcnR5LjxDb2xvcj59IGJvdHRvbUNvbG9yUHJvcGVydHkgLSBGaWxsIGZvciB0aGUgYm90dG9tLW1vc3QgdGhyZWUgbGluZXNcclxuICogQHJldHVybnMge05vZGV9XHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVDYWxjdWxhdGlvbkljb24oIHRvcENvbG9yUHJvcGVydHksIGJvdHRvbUNvbG9yUHJvcGVydHkgKSB7XHJcbiAgY29uc3QgaGVpZ2h0ID0gNTtcclxuICBjb25zdCBmdWxsV2lkdGggPSAzMDtcclxuICBjb25zdCBwYXJ0aWFsV2lkdGggPSAyMDtcclxuICByZXR1cm4gbmV3IFZCb3goIHtcclxuICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgIG5ldyBSZWN0YW5nbGUoIDAsIDAsIHBhcnRpYWxXaWR0aCwgaGVpZ2h0LCB7IGZpbGw6IHRvcENvbG9yUHJvcGVydHkgfSApLFxyXG4gICAgICBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBmdWxsV2lkdGgsIGhlaWdodCwgeyBmaWxsOiBib3R0b21Db2xvclByb3BlcnR5IH0gKSxcclxuICAgICAgbmV3IFJlY3RhbmdsZSggMCwgMCwgcGFydGlhbFdpZHRoLCBoZWlnaHQsIHsgZmlsbDogYm90dG9tQ29sb3JQcm9wZXJ0eSB9ICksXHJcbiAgICAgIG5ldyBSZWN0YW5nbGUoIDAsIDAsIGZ1bGxXaWR0aCwgaGVpZ2h0LCB7IGZpbGw6IGJvdHRvbUNvbG9yUHJvcGVydHkgfSApXHJcbiAgICBdLFxyXG4gICAgYWxpZ246ICdsZWZ0JyxcclxuICAgIHNwYWNpbmc6IDJcclxuICB9ICk7XHJcbn1cclxuXHJcbmFyZWFNb2RlbENvbW1vbi5yZWdpc3RlciggJ0FyZWFDYWxjdWxhdGlvblJhZGlvQnV0dG9uR3JvdXAnLCBBcmVhQ2FsY3VsYXRpb25SYWRpb0J1dHRvbkdyb3VwICk7XHJcbmV4cG9ydCBkZWZhdWx0IEFyZWFDYWxjdWxhdGlvblJhZGlvQnV0dG9uR3JvdXA7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxRQUFRLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ25GLE9BQU9DLGtCQUFrQixNQUFNLDJEQUEyRDtBQUMxRixPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLHFCQUFxQixNQUFNLG1DQUFtQztBQUNyRSxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7QUFDOUQsT0FBT0MsK0JBQStCLE1BQU0sc0NBQXNDO0FBRWxGLE1BQU1DLCtCQUErQixTQUFTRCwrQkFBK0IsQ0FBQztFQUU1RTtBQUNGO0FBQ0E7QUFDQTtFQUNFRSxXQUFXQSxDQUFFQyw2QkFBNkIsRUFBRUMseUJBQXlCLEVBQUc7SUFFdEUsTUFBTUMsaUJBQWlCLEdBQUdOLHFCQUFxQixDQUFDTywyQkFBMkI7SUFDM0UsTUFBTUMsa0JBQWtCLEdBQUdSLHFCQUFxQixDQUFDUyw0QkFBNEI7SUFFN0UsS0FBSyxDQUFFTCw2QkFBNkIsRUFBRSxDQUFFO01BQ3RDTSxLQUFLLEVBQUVYLHFCQUFxQixDQUFDWSxNQUFNO01BQ25DQyxVQUFVLEVBQUVBLENBQUEsS0FBTSxJQUFJbkIsUUFBUSxDQUFFLElBQUlDLElBQUksQ0FBRUcsa0JBQWtCLEVBQUU7UUFBRWdCLEtBQUssRUFBRSxtQkFBbUI7UUFBRUMsSUFBSSxFQUFFO01BQVEsQ0FBRSxDQUFDLEVBQUU7UUFBRUMsS0FBSyxFQUFFVjtNQUEwQixDQUFFO0lBQ3RKLENBQUMsRUFBRTtNQUNESyxLQUFLLEVBQUVYLHFCQUFxQixDQUFDaUIsWUFBWTtNQUN6Q0osVUFBVSxFQUFFQSxDQUFBLEtBQU0sSUFBSW5CLFFBQVEsQ0FBRXdCLHFCQUFxQixDQUFFWCxpQkFBaUIsRUFBRUUsa0JBQW1CLENBQUMsRUFBRTtRQUFFTyxLQUFLLEVBQUVWO01BQTBCLENBQUU7SUFDdkksQ0FBQyxFQUFFO01BQ0RLLEtBQUssRUFBRVgscUJBQXFCLENBQUNtQixjQUFjO01BQzNDTixVQUFVLEVBQUVBLENBQUEsS0FBTSxJQUFJbkIsUUFBUSxDQUFFd0IscUJBQXFCLENBQUVYLGlCQUFpQixFQUFFQSxpQkFBa0IsQ0FBQyxFQUFFO1FBQUVTLEtBQUssRUFBRVY7TUFBMEIsQ0FBRTtJQUN0SSxDQUFDLENBQUcsQ0FBQztFQUNQO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNZLHFCQUFxQkEsQ0FBRUUsZ0JBQWdCLEVBQUVDLG1CQUFtQixFQUFHO0VBQ3RFLE1BQU1DLE1BQU0sR0FBRyxDQUFDO0VBQ2hCLE1BQU1DLFNBQVMsR0FBRyxFQUFFO0VBQ3BCLE1BQU1DLFlBQVksR0FBRyxFQUFFO0VBQ3ZCLE9BQU8sSUFBSTNCLElBQUksQ0FBRTtJQUNmNEIsUUFBUSxFQUFFLENBQ1IsSUFBSTdCLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFNEIsWUFBWSxFQUFFRixNQUFNLEVBQUU7TUFBRVAsSUFBSSxFQUFFSztJQUFpQixDQUFFLENBQUMsRUFDdkUsSUFBSXhCLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFMkIsU0FBUyxFQUFFRCxNQUFNLEVBQUU7TUFBRVAsSUFBSSxFQUFFTTtJQUFvQixDQUFFLENBQUMsRUFDdkUsSUFBSXpCLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFNEIsWUFBWSxFQUFFRixNQUFNLEVBQUU7TUFBRVAsSUFBSSxFQUFFTTtJQUFvQixDQUFFLENBQUMsRUFDMUUsSUFBSXpCLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFMkIsU0FBUyxFQUFFRCxNQUFNLEVBQUU7TUFBRVAsSUFBSSxFQUFFTTtJQUFvQixDQUFFLENBQUMsQ0FDeEU7SUFDREssS0FBSyxFQUFFLE1BQU07SUFDYkMsT0FBTyxFQUFFO0VBQ1gsQ0FBRSxDQUFDO0FBQ0w7QUFFQTVCLGVBQWUsQ0FBQzZCLFFBQVEsQ0FBRSxpQ0FBaUMsRUFBRXpCLCtCQUFnQyxDQUFDO0FBQzlGLGVBQWVBLCtCQUErQiJ9