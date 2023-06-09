// Copyright 2020-2023, University of Colorado Boulder

/**
 * SeriesTypeRadioButtonGroup is used to switch between sine series and cosine series.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { RichText } from '../../../../scenery/js/imports.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import HorizontalAquaRadioButtonGroup from '../../../../sun/js/HorizontalAquaRadioButtonGroup.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FMWConstants from '../FMWConstants.js';
import FMWSymbols from '../FMWSymbols.js';
import SeriesType from '../model/SeriesType.js';
export default class SeriesTypeRadioButtonGroup extends HorizontalAquaRadioButtonGroup {
  /**
   * @param {EnumerationProperty.<SeriesType>} seriesTypeProperty
   * @param {Object} [options]
   */
  constructor(seriesTypeProperty, options) {
    options = merge({
      // HorizontalAquaRadioButtonGroup options
      spacing: 12,
      touchAreaYDilation: 6,
      radioButtonOptions: {
        xSpacing: 6
      }
    }, options);
    assert && assert(seriesTypeProperty instanceof EnumerationProperty);
    const textOptions = {
      // Make this font a bit larger, see https://github.com/phetsims/fourier-making-waves/issues/138
      font: new PhetFont(FMWConstants.MATH_CONTROL_FONT.numericSize + 2),
      maxWidth: 40 // determined empirically
    };

    const items = [{
      value: SeriesType.SIN,
      createNode: () => new RichText(FMWSymbols.sinStringProperty, textOptions),
      tandemName: `sin${AquaRadioButton.TANDEM_NAME_SUFFIX}`
    }, {
      value: SeriesType.COS,
      createNode: () => new RichText(FMWSymbols.cosStringProperty, textOptions),
      tandemName: `cos${AquaRadioButton.TANDEM_NAME_SUFFIX}`
    }];
    super(seriesTypeProperty, items, options);
  }
}
fourierMakingWaves.register('SeriesTypeRadioButtonGroup', SeriesTypeRadioButtonGroup);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwibWVyZ2UiLCJQaGV0Rm9udCIsIlJpY2hUZXh0IiwiQXF1YVJhZGlvQnV0dG9uIiwiSG9yaXpvbnRhbEFxdWFSYWRpb0J1dHRvbkdyb3VwIiwiZm91cmllck1ha2luZ1dhdmVzIiwiRk1XQ29uc3RhbnRzIiwiRk1XU3ltYm9scyIsIlNlcmllc1R5cGUiLCJTZXJpZXNUeXBlUmFkaW9CdXR0b25Hcm91cCIsImNvbnN0cnVjdG9yIiwic2VyaWVzVHlwZVByb3BlcnR5Iiwib3B0aW9ucyIsInNwYWNpbmciLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJyYWRpb0J1dHRvbk9wdGlvbnMiLCJ4U3BhY2luZyIsImFzc2VydCIsInRleHRPcHRpb25zIiwiZm9udCIsIk1BVEhfQ09OVFJPTF9GT05UIiwibnVtZXJpY1NpemUiLCJtYXhXaWR0aCIsIml0ZW1zIiwidmFsdWUiLCJTSU4iLCJjcmVhdGVOb2RlIiwic2luU3RyaW5nUHJvcGVydHkiLCJ0YW5kZW1OYW1lIiwiVEFOREVNX05BTUVfU1VGRklYIiwiQ09TIiwiY29zU3RyaW5nUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNlcmllc1R5cGVSYWRpb0J1dHRvbkdyb3VwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNlcmllc1R5cGVSYWRpb0J1dHRvbkdyb3VwIGlzIHVzZWQgdG8gc3dpdGNoIGJldHdlZW4gc2luZSBzZXJpZXMgYW5kIGNvc2luZSBzZXJpZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBSaWNoVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBcXVhUmFkaW9CdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FxdWFSYWRpb0J1dHRvbi5qcyc7XHJcbmltcG9ydCBIb3Jpem9udGFsQXF1YVJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0hvcml6b250YWxBcXVhUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBmb3VyaWVyTWFraW5nV2F2ZXMgZnJvbSAnLi4vLi4vZm91cmllck1ha2luZ1dhdmVzLmpzJztcclxuaW1wb3J0IEZNV0NvbnN0YW50cyBmcm9tICcuLi9GTVdDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRk1XU3ltYm9scyBmcm9tICcuLi9GTVdTeW1ib2xzLmpzJztcclxuaW1wb3J0IFNlcmllc1R5cGUgZnJvbSAnLi4vbW9kZWwvU2VyaWVzVHlwZS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJpZXNUeXBlUmFkaW9CdXR0b25Hcm91cCBleHRlbmRzIEhvcml6b250YWxBcXVhUmFkaW9CdXR0b25Hcm91cCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25Qcm9wZXJ0eS48U2VyaWVzVHlwZT59IHNlcmllc1R5cGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2VyaWVzVHlwZVByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8gSG9yaXpvbnRhbEFxdWFSYWRpb0J1dHRvbkdyb3VwIG9wdGlvbnNcclxuICAgICAgc3BhY2luZzogMTIsXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogNixcclxuICAgICAgcmFkaW9CdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgeFNwYWNpbmc6IDZcclxuICAgICAgfVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlcmllc1R5cGVQcm9wZXJ0eSBpbnN0YW5jZW9mIEVudW1lcmF0aW9uUHJvcGVydHkgKTtcclxuXHJcbiAgICBjb25zdCB0ZXh0T3B0aW9ucyA9IHtcclxuXHJcbiAgICAgIC8vIE1ha2UgdGhpcyBmb250IGEgYml0IGxhcmdlciwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3VyaWVyLW1ha2luZy13YXZlcy9pc3N1ZXMvMTM4XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggRk1XQ29uc3RhbnRzLk1BVEhfQ09OVFJPTF9GT05ULm51bWVyaWNTaXplICsgMiApLFxyXG4gICAgICBtYXhXaWR0aDogNDAgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBpdGVtcyA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiBTZXJpZXNUeXBlLlNJTixcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgUmljaFRleHQoIEZNV1N5bWJvbHMuc2luU3RyaW5nUHJvcGVydHksIHRleHRPcHRpb25zICksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogYHNpbiR7QXF1YVJhZGlvQnV0dG9uLlRBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB2YWx1ZTogU2VyaWVzVHlwZS5DT1MsXHJcbiAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFJpY2hUZXh0KCBGTVdTeW1ib2xzLmNvc1N0cmluZ1Byb3BlcnR5LCB0ZXh0T3B0aW9ucyApLFxyXG4gICAgICAgIHRhbmRlbU5hbWU6IGBjb3Mke0FxdWFSYWRpb0J1dHRvbi5UQU5ERU1fTkFNRV9TVUZGSVh9YFxyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuICAgIHN1cGVyKCBzZXJpZXNUeXBlUHJvcGVydHksIGl0ZW1zLCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5mb3VyaWVyTWFraW5nV2F2ZXMucmVnaXN0ZXIoICdTZXJpZXNUeXBlUmFkaW9CdXR0b25Hcm91cCcsIFNlcmllc1R5cGVSYWRpb0J1dHRvbkdyb3VwICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLG1CQUFtQixNQUFNLDRDQUE0QztBQUM1RSxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsUUFBUSxRQUFRLG1DQUFtQztBQUM1RCxPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLE9BQU9DLDhCQUE4QixNQUFNLHNEQUFzRDtBQUNqRyxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsWUFBWSxNQUFNLG9CQUFvQjtBQUM3QyxPQUFPQyxVQUFVLE1BQU0sa0JBQWtCO0FBQ3pDLE9BQU9DLFVBQVUsTUFBTSx3QkFBd0I7QUFFL0MsZUFBZSxNQUFNQywwQkFBMEIsU0FBU0wsOEJBQThCLENBQUM7RUFFckY7QUFDRjtBQUNBO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsa0JBQWtCLEVBQUVDLE9BQU8sRUFBRztJQUV6Q0EsT0FBTyxHQUFHWixLQUFLLENBQUU7TUFFZjtNQUNBYSxPQUFPLEVBQUUsRUFBRTtNQUNYQyxrQkFBa0IsRUFBRSxDQUFDO01BQ3JCQyxrQkFBa0IsRUFBRTtRQUNsQkMsUUFBUSxFQUFFO01BQ1o7SUFDRixDQUFDLEVBQUVKLE9BQVEsQ0FBQztJQUVaSyxNQUFNLElBQUlBLE1BQU0sQ0FBRU4sa0JBQWtCLFlBQVlaLG1CQUFvQixDQUFDO0lBRXJFLE1BQU1tQixXQUFXLEdBQUc7TUFFbEI7TUFDQUMsSUFBSSxFQUFFLElBQUlsQixRQUFRLENBQUVLLFlBQVksQ0FBQ2MsaUJBQWlCLENBQUNDLFdBQVcsR0FBRyxDQUFFLENBQUM7TUFDcEVDLFFBQVEsRUFBRSxFQUFFLENBQUM7SUFDZixDQUFDOztJQUVELE1BQU1DLEtBQUssR0FBRyxDQUNaO01BQ0VDLEtBQUssRUFBRWhCLFVBQVUsQ0FBQ2lCLEdBQUc7TUFDckJDLFVBQVUsRUFBRUEsQ0FBQSxLQUFNLElBQUl4QixRQUFRLENBQUVLLFVBQVUsQ0FBQ29CLGlCQUFpQixFQUFFVCxXQUFZLENBQUM7TUFDM0VVLFVBQVUsRUFBRyxNQUFLekIsZUFBZSxDQUFDMEIsa0JBQW1CO0lBQ3ZELENBQUMsRUFDRDtNQUNFTCxLQUFLLEVBQUVoQixVQUFVLENBQUNzQixHQUFHO01BQ3JCSixVQUFVLEVBQUVBLENBQUEsS0FBTSxJQUFJeEIsUUFBUSxDQUFFSyxVQUFVLENBQUN3QixpQkFBaUIsRUFBRWIsV0FBWSxDQUFDO01BQzNFVSxVQUFVLEVBQUcsTUFBS3pCLGVBQWUsQ0FBQzBCLGtCQUFtQjtJQUN2RCxDQUFDLENBQ0Y7SUFFRCxLQUFLLENBQUVsQixrQkFBa0IsRUFBRVksS0FBSyxFQUFFWCxPQUFRLENBQUM7RUFDN0M7QUFDRjtBQUVBUCxrQkFBa0IsQ0FBQzJCLFFBQVEsQ0FBRSw0QkFBNEIsRUFBRXZCLDBCQUEyQixDQUFDIn0=