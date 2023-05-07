// Copyright 2022, University of Colorado Boulder

/**
 * PressureNoiseCheckbox is the checkbox labeled 'Pressure Noise' that appears in the Preferences dialog.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Text } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesStrings from '../../GasPropertiesStrings.js';
import GasPropertiesConstants from '../GasPropertiesConstants.js';
export class PressureNoiseCheckbox extends Checkbox {
  constructor(pressureNoiseProperty, providedOptions) {
    const options = providedOptions;
    const pressureNoiseText = new Text(GasPropertiesStrings.pressureNoiseStringProperty, {
      font: GasPropertiesConstants.CONTROL_FONT,
      maxWidth: 350,
      // set empirically
      tandem: options.tandem.createTandem('pressureNoiseText')
    });
    super(pressureNoiseProperty, pressureNoiseText, options);
    this.disposePressureNoiseCheckbox = () => {
      pressureNoiseText.dispose();
    };
  }
  dispose() {
    this.disposePressureNoiseCheckbox();
    super.dispose();
  }
}
gasProperties.register('PressureNoiseCheckbox', PressureNoiseCheckbox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXh0IiwiQ2hlY2tib3giLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc1N0cmluZ3MiLCJHYXNQcm9wZXJ0aWVzQ29uc3RhbnRzIiwiUHJlc3N1cmVOb2lzZUNoZWNrYm94IiwiY29uc3RydWN0b3IiLCJwcmVzc3VyZU5vaXNlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicHJlc3N1cmVOb2lzZVRleHQiLCJwcmVzc3VyZU5vaXNlU3RyaW5nUHJvcGVydHkiLCJmb250IiwiQ09OVFJPTF9GT05UIiwibWF4V2lkdGgiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJkaXNwb3NlUHJlc3N1cmVOb2lzZUNoZWNrYm94IiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUHJlc3N1cmVOb2lzZUNoZWNrYm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQcmVzc3VyZU5vaXNlQ2hlY2tib3ggaXMgdGhlIGNoZWNrYm94IGxhYmVsZWQgJ1ByZXNzdXJlIE5vaXNlJyB0aGF0IGFwcGVhcnMgaW4gdGhlIFByZWZlcmVuY2VzIGRpYWxvZy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IHsgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDaGVja2JveCwgeyBDaGVja2JveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgZ2FzUHJvcGVydGllcyBmcm9tICcuLi8uLi9nYXNQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNTdHJpbmdzIGZyb20gJy4uLy4uL0dhc1Byb3BlcnRpZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNDb25zdGFudHMgZnJvbSAnLi4vR2FzUHJvcGVydGllc0NvbnN0YW50cy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgUHJlc3N1cmVOb2lzZUNoZWNrYm94T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPENoZWNrYm94T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGNsYXNzIFByZXNzdXJlTm9pc2VDaGVja2JveCBleHRlbmRzIENoZWNrYm94IHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlUHJlc3N1cmVOb2lzZUNoZWNrYm94OiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByZXNzdXJlTm9pc2VQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIHByb3ZpZGVkT3B0aW9uczogUHJlc3N1cmVOb2lzZUNoZWNrYm94T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gcHJvdmlkZWRPcHRpb25zO1xyXG5cclxuICAgIGNvbnN0IHByZXNzdXJlTm9pc2VUZXh0ID0gbmV3IFRleHQoIEdhc1Byb3BlcnRpZXNTdHJpbmdzLnByZXNzdXJlTm9pc2VTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBHYXNQcm9wZXJ0aWVzQ29uc3RhbnRzLkNPTlRST0xfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDM1MCwgLy8gc2V0IGVtcGlyaWNhbGx5XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJlc3N1cmVOb2lzZVRleHQnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggcHJlc3N1cmVOb2lzZVByb3BlcnR5LCBwcmVzc3VyZU5vaXNlVGV4dCwgb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVByZXNzdXJlTm9pc2VDaGVja2JveCA9ICgpID0+IHtcclxuICAgICAgcHJlc3N1cmVOb2lzZVRleHQuZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlUHJlc3N1cmVOb2lzZUNoZWNrYm94KCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5nYXNQcm9wZXJ0aWVzLnJlZ2lzdGVyKCAnUHJlc3N1cmVOb2lzZUNoZWNrYm94JywgUHJlc3N1cmVOb2lzZUNoZWNrYm94ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUtBLFNBQVNBLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0MsUUFBUSxNQUEyQixnQ0FBZ0M7QUFDMUUsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0Msc0JBQXNCLE1BQU0sOEJBQThCO0FBTWpFLE9BQU8sTUFBTUMscUJBQXFCLFNBQVNKLFFBQVEsQ0FBQztFQUkzQ0ssV0FBV0EsQ0FBRUMscUJBQXdDLEVBQUVDLGVBQTZDLEVBQUc7SUFFNUcsTUFBTUMsT0FBTyxHQUFHRCxlQUFlO0lBRS9CLE1BQU1FLGlCQUFpQixHQUFHLElBQUlWLElBQUksQ0FBRUcsb0JBQW9CLENBQUNRLDJCQUEyQixFQUFFO01BQ3BGQyxJQUFJLEVBQUVSLHNCQUFzQixDQUFDUyxZQUFZO01BQ3pDQyxRQUFRLEVBQUUsR0FBRztNQUFFO01BQ2ZDLE1BQU0sRUFBRU4sT0FBTyxDQUFDTSxNQUFNLENBQUNDLFlBQVksQ0FBRSxtQkFBb0I7SUFDM0QsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFVCxxQkFBcUIsRUFBRUcsaUJBQWlCLEVBQUVELE9BQVEsQ0FBQztJQUUxRCxJQUFJLENBQUNRLDRCQUE0QixHQUFHLE1BQU07TUFDeENQLGlCQUFpQixDQUFDUSxPQUFPLENBQUMsQ0FBQztJQUM3QixDQUFDO0VBQ0g7RUFFZ0JBLE9BQU9BLENBQUEsRUFBUztJQUM5QixJQUFJLENBQUNELDRCQUE0QixDQUFDLENBQUM7SUFDbkMsS0FBSyxDQUFDQyxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUFoQixhQUFhLENBQUNpQixRQUFRLENBQUUsdUJBQXVCLEVBQUVkLHFCQUFzQixDQUFDIn0=