// Copyright 2020-2023, University of Colorado Boulder

/**
 * WaveformComboBox is the combo box for choosing a pre-defined waveform in the 'Discrete' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ComboBox from '../../../../sun/js/ComboBox.js';
import FMWComboBox from '../../common/view/FMWComboBox.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FourierMakingWavesStrings from '../../FourierMakingWavesStrings.js';
import Waveform from '../model/Waveform.js';
// This format is specific to FMWComboBox.
const CHOICES = [{
  value: Waveform.SINUSOID,
  stringProperty: FourierMakingWavesStrings.sinusoidStringProperty,
  tandemName: `sinusoid${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
}, {
  value: Waveform.TRIANGLE,
  stringProperty: FourierMakingWavesStrings.triangleStringProperty,
  tandemName: `triangle${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
}, {
  value: Waveform.SQUARE,
  stringProperty: FourierMakingWavesStrings.squareStringProperty,
  tandemName: `square${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
}, {
  value: Waveform.SAWTOOTH,
  stringProperty: FourierMakingWavesStrings.sawtoothStringProperty,
  tandemName: `sawtooth${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
}, {
  value: Waveform.WAVE_PACKET,
  stringProperty: FourierMakingWavesStrings.wavePacketStringProperty,
  tandemName: `wavePacket${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
}, {
  value: Waveform.CUSTOM,
  stringProperty: FourierMakingWavesStrings.customStringProperty,
  tandemName: `custom${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
}];
export default class WaveformComboBox extends FMWComboBox {
  constructor(waveformProperty, popupParent, tandem) {
    super(waveformProperty, CHOICES, popupParent, {
      textOptions: {
        maxWidth: 100 // determined empirically
      },

      tandem: tandem
    });
  }
}
fourierMakingWaves.register('WaveformComboBox', WaveformComboBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb21ib0JveCIsIkZNV0NvbWJvQm94IiwiZm91cmllck1ha2luZ1dhdmVzIiwiRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncyIsIldhdmVmb3JtIiwiQ0hPSUNFUyIsInZhbHVlIiwiU0lOVVNPSUQiLCJzdHJpbmdQcm9wZXJ0eSIsInNpbnVzb2lkU3RyaW5nUHJvcGVydHkiLCJ0YW5kZW1OYW1lIiwiSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVgiLCJUUklBTkdMRSIsInRyaWFuZ2xlU3RyaW5nUHJvcGVydHkiLCJTUVVBUkUiLCJzcXVhcmVTdHJpbmdQcm9wZXJ0eSIsIlNBV1RPT1RIIiwic2F3dG9vdGhTdHJpbmdQcm9wZXJ0eSIsIldBVkVfUEFDS0VUIiwid2F2ZVBhY2tldFN0cmluZ1Byb3BlcnR5IiwiQ1VTVE9NIiwiY3VzdG9tU3RyaW5nUHJvcGVydHkiLCJXYXZlZm9ybUNvbWJvQm94IiwiY29uc3RydWN0b3IiLCJ3YXZlZm9ybVByb3BlcnR5IiwicG9wdXBQYXJlbnQiLCJ0YW5kZW0iLCJ0ZXh0T3B0aW9ucyIsIm1heFdpZHRoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJXYXZlZm9ybUNvbWJvQm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFdhdmVmb3JtQ29tYm9Cb3ggaXMgdGhlIGNvbWJvIGJveCBmb3IgY2hvb3NpbmcgYSBwcmUtZGVmaW5lZCB3YXZlZm9ybSBpbiB0aGUgJ0Rpc2NyZXRlJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDb21ib0JveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ29tYm9Cb3guanMnO1xyXG5pbXBvcnQgRk1XQ29tYm9Cb3gsIHsgRk1XQ29tYm9Cb3hDaG9pY2UgfSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9GTVdDb21ib0JveC5qcyc7XHJcbmltcG9ydCBmb3VyaWVyTWFraW5nV2F2ZXMgZnJvbSAnLi4vLi4vZm91cmllck1ha2luZ1dhdmVzLmpzJztcclxuaW1wb3J0IEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MgZnJvbSAnLi4vLi4vRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBXYXZlZm9ybSBmcm9tICcuLi9tb2RlbC9XYXZlZm9ybS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuXHJcbi8vIFRoaXMgZm9ybWF0IGlzIHNwZWNpZmljIHRvIEZNV0NvbWJvQm94LlxyXG5jb25zdCBDSE9JQ0VTOiBGTVdDb21ib0JveENob2ljZTxXYXZlZm9ybT5bXSA9IFtcclxuICB7XHJcbiAgICB2YWx1ZTogV2F2ZWZvcm0uU0lOVVNPSUQsXHJcbiAgICBzdHJpbmdQcm9wZXJ0eTogRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5zaW51c29pZFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogYHNpbnVzb2lkJHtDb21ib0JveC5JVEVNX1RBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogV2F2ZWZvcm0uVFJJQU5HTEUsXHJcbiAgICBzdHJpbmdQcm9wZXJ0eTogRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy50cmlhbmdsZVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogYHRyaWFuZ2xlJHtDb21ib0JveC5JVEVNX1RBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogV2F2ZWZvcm0uU1FVQVJFLFxyXG4gICAgc3RyaW5nUHJvcGVydHk6IEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3Muc3F1YXJlU3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiBgc3F1YXJlJHtDb21ib0JveC5JVEVNX1RBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogV2F2ZWZvcm0uU0FXVE9PVEgsXHJcbiAgICBzdHJpbmdQcm9wZXJ0eTogRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5zYXd0b290aFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogYHNhd3Rvb3RoJHtDb21ib0JveC5JVEVNX1RBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogV2F2ZWZvcm0uV0FWRV9QQUNLRVQsXHJcbiAgICBzdHJpbmdQcm9wZXJ0eTogRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy53YXZlUGFja2V0U3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiBgd2F2ZVBhY2tldCR7Q29tYm9Cb3guSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVh9YFxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFdhdmVmb3JtLkNVU1RPTSxcclxuICAgIHN0cmluZ1Byb3BlcnR5OiBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLmN1c3RvbVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogYGN1c3RvbSR7Q29tYm9Cb3guSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVh9YFxyXG4gIH1cclxuXTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhdmVmb3JtQ29tYm9Cb3ggZXh0ZW5kcyBGTVdDb21ib0JveDxXYXZlZm9ybT4ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHdhdmVmb3JtUHJvcGVydHk6IFByb3BlcnR5PFdhdmVmb3JtPiwgcG9wdXBQYXJlbnQ6IE5vZGUsIHRhbmRlbTogVGFuZGVtICkge1xyXG4gICAgc3VwZXIoIHdhdmVmb3JtUHJvcGVydHksIENIT0lDRVMsIHBvcHVwUGFyZW50LCB7XHJcbiAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgbWF4V2lkdGg6IDEwMCAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5mb3VyaWVyTWFraW5nV2F2ZXMucmVnaXN0ZXIoICdXYXZlZm9ybUNvbWJvQm94JywgV2F2ZWZvcm1Db21ib0JveCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLFdBQVcsTUFBNkIsa0NBQWtDO0FBQ2pGLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyx5QkFBeUIsTUFBTSxvQ0FBb0M7QUFDMUUsT0FBT0MsUUFBUSxNQUFNLHNCQUFzQjtBQUkzQztBQUNBLE1BQU1DLE9BQXNDLEdBQUcsQ0FDN0M7RUFDRUMsS0FBSyxFQUFFRixRQUFRLENBQUNHLFFBQVE7RUFDeEJDLGNBQWMsRUFBRUwseUJBQXlCLENBQUNNLHNCQUFzQjtFQUNoRUMsVUFBVSxFQUFHLFdBQVVWLFFBQVEsQ0FBQ1csdUJBQXdCO0FBQzFELENBQUMsRUFDRDtFQUNFTCxLQUFLLEVBQUVGLFFBQVEsQ0FBQ1EsUUFBUTtFQUN4QkosY0FBYyxFQUFFTCx5QkFBeUIsQ0FBQ1Usc0JBQXNCO0VBQ2hFSCxVQUFVLEVBQUcsV0FBVVYsUUFBUSxDQUFDVyx1QkFBd0I7QUFDMUQsQ0FBQyxFQUNEO0VBQ0VMLEtBQUssRUFBRUYsUUFBUSxDQUFDVSxNQUFNO0VBQ3RCTixjQUFjLEVBQUVMLHlCQUF5QixDQUFDWSxvQkFBb0I7RUFDOURMLFVBQVUsRUFBRyxTQUFRVixRQUFRLENBQUNXLHVCQUF3QjtBQUN4RCxDQUFDLEVBQ0Q7RUFDRUwsS0FBSyxFQUFFRixRQUFRLENBQUNZLFFBQVE7RUFDeEJSLGNBQWMsRUFBRUwseUJBQXlCLENBQUNjLHNCQUFzQjtFQUNoRVAsVUFBVSxFQUFHLFdBQVVWLFFBQVEsQ0FBQ1csdUJBQXdCO0FBQzFELENBQUMsRUFDRDtFQUNFTCxLQUFLLEVBQUVGLFFBQVEsQ0FBQ2MsV0FBVztFQUMzQlYsY0FBYyxFQUFFTCx5QkFBeUIsQ0FBQ2dCLHdCQUF3QjtFQUNsRVQsVUFBVSxFQUFHLGFBQVlWLFFBQVEsQ0FBQ1csdUJBQXdCO0FBQzVELENBQUMsRUFDRDtFQUNFTCxLQUFLLEVBQUVGLFFBQVEsQ0FBQ2dCLE1BQU07RUFDdEJaLGNBQWMsRUFBRUwseUJBQXlCLENBQUNrQixvQkFBb0I7RUFDOURYLFVBQVUsRUFBRyxTQUFRVixRQUFRLENBQUNXLHVCQUF3QjtBQUN4RCxDQUFDLENBQ0Y7QUFFRCxlQUFlLE1BQU1XLGdCQUFnQixTQUFTckIsV0FBVyxDQUFXO0VBRTNEc0IsV0FBV0EsQ0FBRUMsZ0JBQW9DLEVBQUVDLFdBQWlCLEVBQUVDLE1BQWMsRUFBRztJQUM1RixLQUFLLENBQUVGLGdCQUFnQixFQUFFbkIsT0FBTyxFQUFFb0IsV0FBVyxFQUFFO01BQzdDRSxXQUFXLEVBQUU7UUFDWEMsUUFBUSxFQUFFLEdBQUcsQ0FBQztNQUNoQixDQUFDOztNQUNERixNQUFNLEVBQUVBO0lBQ1YsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBeEIsa0JBQWtCLENBQUMyQixRQUFRLENBQUUsa0JBQWtCLEVBQUVQLGdCQUFpQixDQUFDIn0=