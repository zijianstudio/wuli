// Copyright 2022-2023, University of Colorado Boulder

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import AquaRadioButtonGroup from '../../../../sun/js/AquaRadioButtonGroup.js';
import TemperatureUnits from '../../common/model/TemperatureUnits.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
const LABEL_FONT = new PhetFont(14);
const UNITS_LABEL_MAX_WIDTH = 50;

/**
 * TemperatureUnitsSelector is a UI component that allows a user to select between Kelvin, degrees Celsius, or degrees
 * Fahrenheit, using a horizontal set of radio buttons.  This was originally developed for the "Layer Model" screen of
 * the "Greenhouse Effect" simulation, but may be applicable to other situations in the future.
 */

class TemperatureUnitsSelector extends VBox {
  constructor(temperatureUnitsProperty, tandem) {
    // Create the label that sits above the radio button selectors.
    const label = new Text(GreenhouseEffectStrings.temperatureUnitsStringProperty, {
      font: LABEL_FONT,
      maxWidth: 200,
      tandem: tandem.createTandem('labelText')
    });

    // Create the radio buttons.
    const temperatureUnitsRadioButtonGroup = new AquaRadioButtonGroup(temperatureUnitsProperty, [{
      createNode: tandem => new Text(GreenhouseEffectStrings.temperature.units.kelvinStringProperty, {
        font: LABEL_FONT,
        maxWidth: UNITS_LABEL_MAX_WIDTH,
        tandem: tandem.createTandem('text')
      }),
      value: TemperatureUnits.KELVIN,
      tandemName: 'kelvinRadioButton'
    }, {
      createNode: tandem => new Text(GreenhouseEffectStrings.temperature.units.celsiusStringProperty, {
        font: LABEL_FONT,
        maxWidth: UNITS_LABEL_MAX_WIDTH,
        tandem: tandem.createTandem('text')
      }),
      value: TemperatureUnits.CELSIUS,
      tandemName: 'celsiusRadioButton'
    }, {
      createNode: tandem => new Text(GreenhouseEffectStrings.temperature.units.fahrenheitStringProperty, {
        font: LABEL_FONT,
        maxWidth: UNITS_LABEL_MAX_WIDTH,
        tandem: tandem.createTandem('text')
      }),
      value: TemperatureUnits.FAHRENHEIT,
      tandemName: 'fahrenheitRadioButton'
    }], {
      orientation: 'horizontal',
      spacing: 15,
      radioButtonOptions: {
        radius: 6
      },
      tandem: tandem.createTandem('temperatureUnitsRadioButtonGroup')
    });

    // Put the label and radio buttons together in the VBox.
    super({
      tandem: tandem,
      children: [label, temperatureUnitsRadioButtonGroup],
      align: 'left',
      spacing: 3
    });
  }
}
greenhouseEffect.register('TemperatureUnitsSelector', TemperatureUnitsSelector);
export default TemperatureUnitsSelector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Rm9udCIsIlRleHQiLCJWQm94IiwiQXF1YVJhZGlvQnV0dG9uR3JvdXAiLCJUZW1wZXJhdHVyZVVuaXRzIiwiZ3JlZW5ob3VzZUVmZmVjdCIsIkdyZWVuaG91c2VFZmZlY3RTdHJpbmdzIiwiTEFCRUxfRk9OVCIsIlVOSVRTX0xBQkVMX01BWF9XSURUSCIsIlRlbXBlcmF0dXJlVW5pdHNTZWxlY3RvciIsImNvbnN0cnVjdG9yIiwidGVtcGVyYXR1cmVVbml0c1Byb3BlcnR5IiwidGFuZGVtIiwibGFiZWwiLCJ0ZW1wZXJhdHVyZVVuaXRzU3RyaW5nUHJvcGVydHkiLCJmb250IiwibWF4V2lkdGgiLCJjcmVhdGVUYW5kZW0iLCJ0ZW1wZXJhdHVyZVVuaXRzUmFkaW9CdXR0b25Hcm91cCIsImNyZWF0ZU5vZGUiLCJ0ZW1wZXJhdHVyZSIsInVuaXRzIiwia2VsdmluU3RyaW5nUHJvcGVydHkiLCJ2YWx1ZSIsIktFTFZJTiIsInRhbmRlbU5hbWUiLCJjZWxzaXVzU3RyaW5nUHJvcGVydHkiLCJDRUxTSVVTIiwiZmFocmVuaGVpdFN0cmluZ1Byb3BlcnR5IiwiRkFIUkVOSEVJVCIsIm9yaWVudGF0aW9uIiwic3BhY2luZyIsInJhZGlvQnV0dG9uT3B0aW9ucyIsInJhZGl1cyIsImNoaWxkcmVuIiwiYWxpZ24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRlbXBlcmF0dXJlVW5pdHNTZWxlY3Rvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQXF1YVJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FxdWFSYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFRlbXBlcmF0dXJlVW5pdHMgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1RlbXBlcmF0dXJlVW5pdHMuanMnO1xyXG5pbXBvcnQgZ3JlZW5ob3VzZUVmZmVjdCBmcm9tICcuLi8uLi9ncmVlbmhvdXNlRWZmZWN0LmpzJztcclxuaW1wb3J0IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzIGZyb20gJy4uLy4uL0dyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmpzJztcclxuXHJcbmNvbnN0IExBQkVMX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE0ICk7XHJcbmNvbnN0IFVOSVRTX0xBQkVMX01BWF9XSURUSCA9IDUwO1xyXG5cclxuLyoqXHJcbiAqIFRlbXBlcmF0dXJlVW5pdHNTZWxlY3RvciBpcyBhIFVJIGNvbXBvbmVudCB0aGF0IGFsbG93cyBhIHVzZXIgdG8gc2VsZWN0IGJldHdlZW4gS2VsdmluLCBkZWdyZWVzIENlbHNpdXMsIG9yIGRlZ3JlZXNcclxuICogRmFocmVuaGVpdCwgdXNpbmcgYSBob3Jpem9udGFsIHNldCBvZiByYWRpbyBidXR0b25zLiAgVGhpcyB3YXMgb3JpZ2luYWxseSBkZXZlbG9wZWQgZm9yIHRoZSBcIkxheWVyIE1vZGVsXCIgc2NyZWVuIG9mXHJcbiAqIHRoZSBcIkdyZWVuaG91c2UgRWZmZWN0XCIgc2ltdWxhdGlvbiwgYnV0IG1heSBiZSBhcHBsaWNhYmxlIHRvIG90aGVyIHNpdHVhdGlvbnMgaW4gdGhlIGZ1dHVyZS5cclxuICovXHJcblxyXG5jbGFzcyBUZW1wZXJhdHVyZVVuaXRzU2VsZWN0b3IgZXh0ZW5kcyBWQm94IHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRlbXBlcmF0dXJlVW5pdHNQcm9wZXJ0eTogUHJvcGVydHk8VGVtcGVyYXR1cmVVbml0cz4sIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgbGFiZWwgdGhhdCBzaXRzIGFib3ZlIHRoZSByYWRpbyBidXR0b24gc2VsZWN0b3JzLlxyXG4gICAgY29uc3QgbGFiZWwgPSBuZXcgVGV4dCggR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MudGVtcGVyYXR1cmVVbml0c1N0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IExBQkVMX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiAyMDAsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYmVsVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgcmFkaW8gYnV0dG9ucy5cclxuICAgIGNvbnN0IHRlbXBlcmF0dXJlVW5pdHNSYWRpb0J1dHRvbkdyb3VwID0gbmV3IEFxdWFSYWRpb0J1dHRvbkdyb3VwKFxyXG4gICAgICB0ZW1wZXJhdHVyZVVuaXRzUHJvcGVydHksXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gbmV3IFRleHQoIEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLnRlbXBlcmF0dXJlLnVuaXRzLmtlbHZpblN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgICAgIGZvbnQ6IExBQkVMX0ZPTlQsXHJcbiAgICAgICAgICAgIG1heFdpZHRoOiBVTklUU19MQUJFTF9NQVhfV0lEVEgsXHJcbiAgICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RleHQnIClcclxuICAgICAgICAgIH0gKSxcclxuICAgICAgICAgIHZhbHVlOiBUZW1wZXJhdHVyZVVuaXRzLktFTFZJTixcclxuICAgICAgICAgIHRhbmRlbU5hbWU6ICdrZWx2aW5SYWRpb0J1dHRvbidcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6IHRhbmRlbSA9PiBuZXcgVGV4dCggR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MudGVtcGVyYXR1cmUudW5pdHMuY2Vsc2l1c1N0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgICAgIGZvbnQ6IExBQkVMX0ZPTlQsXHJcbiAgICAgICAgICAgIG1heFdpZHRoOiBVTklUU19MQUJFTF9NQVhfV0lEVEgsXHJcbiAgICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RleHQnIClcclxuICAgICAgICAgIH0gKSxcclxuICAgICAgICAgIHZhbHVlOiBUZW1wZXJhdHVyZVVuaXRzLkNFTFNJVVMsXHJcbiAgICAgICAgICB0YW5kZW1OYW1lOiAnY2Vsc2l1c1JhZGlvQnV0dG9uJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY3JlYXRlTm9kZTogdGFuZGVtID0+IG5ldyBUZXh0KCBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy50ZW1wZXJhdHVyZS51bml0cy5mYWhyZW5oZWl0U3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICAgICAgZm9udDogTEFCRUxfRk9OVCxcclxuICAgICAgICAgICAgbWF4V2lkdGg6IFVOSVRTX0xBQkVMX01BWF9XSURUSCxcclxuICAgICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGV4dCcgKVxyXG4gICAgICAgICAgfSApLFxyXG4gICAgICAgICAgdmFsdWU6IFRlbXBlcmF0dXJlVW5pdHMuRkFIUkVOSEVJVCxcclxuICAgICAgICAgIHRhbmRlbU5hbWU6ICdmYWhyZW5oZWl0UmFkaW9CdXR0b24nXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICB7XHJcbiAgICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcclxuICAgICAgICBzcGFjaW5nOiAxNSxcclxuICAgICAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICAgIHJhZGl1czogNlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGVtcGVyYXR1cmVVbml0c1JhZGlvQnV0dG9uR3JvdXAnIClcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBQdXQgdGhlIGxhYmVsIGFuZCByYWRpbyBidXR0b25zIHRvZ2V0aGVyIGluIHRoZSBWQm94LlxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIGNoaWxkcmVuOiBbIGxhYmVsLCB0ZW1wZXJhdHVyZVVuaXRzUmFkaW9CdXR0b25Hcm91cCBdLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBzcGFjaW5nOiAzXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmVlbmhvdXNlRWZmZWN0LnJlZ2lzdGVyKCAnVGVtcGVyYXR1cmVVbml0c1NlbGVjdG9yJywgVGVtcGVyYXR1cmVVbml0c1NlbGVjdG9yICk7XHJcbmV4cG9ydCBkZWZhdWx0IFRlbXBlcmF0dXJlVW5pdHNTZWxlY3RvcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUdBLE9BQU9BLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLG9CQUFvQixNQUFNLDRDQUE0QztBQUU3RSxPQUFPQyxnQkFBZ0IsTUFBTSx3Q0FBd0M7QUFDckUsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUV0RSxNQUFNQyxVQUFVLEdBQUcsSUFBSVAsUUFBUSxDQUFFLEVBQUcsQ0FBQztBQUNyQyxNQUFNUSxxQkFBcUIsR0FBRyxFQUFFOztBQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1DLHdCQUF3QixTQUFTUCxJQUFJLENBQUM7RUFDbkNRLFdBQVdBLENBQUVDLHdCQUFvRCxFQUFFQyxNQUFjLEVBQUc7SUFFekY7SUFDQSxNQUFNQyxLQUFLLEdBQUcsSUFBSVosSUFBSSxDQUFFSyx1QkFBdUIsQ0FBQ1EsOEJBQThCLEVBQUU7TUFDOUVDLElBQUksRUFBRVIsVUFBVTtNQUNoQlMsUUFBUSxFQUFFLEdBQUc7TUFDYkosTUFBTSxFQUFFQSxNQUFNLENBQUNLLFlBQVksQ0FBRSxXQUFZO0lBQzNDLENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1DLGdDQUFnQyxHQUFHLElBQUlmLG9CQUFvQixDQUMvRFEsd0JBQXdCLEVBQ3hCLENBQ0U7TUFDRVEsVUFBVSxFQUFFUCxNQUFNLElBQUksSUFBSVgsSUFBSSxDQUFFSyx1QkFBdUIsQ0FBQ2MsV0FBVyxDQUFDQyxLQUFLLENBQUNDLG9CQUFvQixFQUFFO1FBQzlGUCxJQUFJLEVBQUVSLFVBQVU7UUFDaEJTLFFBQVEsRUFBRVIscUJBQXFCO1FBQy9CSSxNQUFNLEVBQUVBLE1BQU0sQ0FBQ0ssWUFBWSxDQUFFLE1BQU87TUFDdEMsQ0FBRSxDQUFDO01BQ0hNLEtBQUssRUFBRW5CLGdCQUFnQixDQUFDb0IsTUFBTTtNQUM5QkMsVUFBVSxFQUFFO0lBQ2QsQ0FBQyxFQUNEO01BQ0VOLFVBQVUsRUFBRVAsTUFBTSxJQUFJLElBQUlYLElBQUksQ0FBRUssdUJBQXVCLENBQUNjLFdBQVcsQ0FBQ0MsS0FBSyxDQUFDSyxxQkFBcUIsRUFBRTtRQUMvRlgsSUFBSSxFQUFFUixVQUFVO1FBQ2hCUyxRQUFRLEVBQUVSLHFCQUFxQjtRQUMvQkksTUFBTSxFQUFFQSxNQUFNLENBQUNLLFlBQVksQ0FBRSxNQUFPO01BQ3RDLENBQUUsQ0FBQztNQUNITSxLQUFLLEVBQUVuQixnQkFBZ0IsQ0FBQ3VCLE9BQU87TUFDL0JGLFVBQVUsRUFBRTtJQUNkLENBQUMsRUFDRDtNQUNFTixVQUFVLEVBQUVQLE1BQU0sSUFBSSxJQUFJWCxJQUFJLENBQUVLLHVCQUF1QixDQUFDYyxXQUFXLENBQUNDLEtBQUssQ0FBQ08sd0JBQXdCLEVBQUU7UUFDbEdiLElBQUksRUFBRVIsVUFBVTtRQUNoQlMsUUFBUSxFQUFFUixxQkFBcUI7UUFDL0JJLE1BQU0sRUFBRUEsTUFBTSxDQUFDSyxZQUFZLENBQUUsTUFBTztNQUN0QyxDQUFFLENBQUM7TUFDSE0sS0FBSyxFQUFFbkIsZ0JBQWdCLENBQUN5QixVQUFVO01BQ2xDSixVQUFVLEVBQUU7SUFDZCxDQUFDLENBQ0YsRUFDRDtNQUNFSyxXQUFXLEVBQUUsWUFBWTtNQUN6QkMsT0FBTyxFQUFFLEVBQUU7TUFDWEMsa0JBQWtCLEVBQUU7UUFDbEJDLE1BQU0sRUFBRTtNQUNWLENBQUM7TUFDRHJCLE1BQU0sRUFBRUEsTUFBTSxDQUFDSyxZQUFZLENBQUUsa0NBQW1DO0lBQ2xFLENBQ0YsQ0FBQzs7SUFFRDtJQUNBLEtBQUssQ0FBRTtNQUNMTCxNQUFNLEVBQUVBLE1BQU07TUFDZHNCLFFBQVEsRUFBRSxDQUFFckIsS0FBSyxFQUFFSyxnQ0FBZ0MsQ0FBRTtNQUNyRGlCLEtBQUssRUFBRSxNQUFNO01BQ2JKLE9BQU8sRUFBRTtJQUNYLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQTFCLGdCQUFnQixDQUFDK0IsUUFBUSxDQUFFLDBCQUEwQixFQUFFM0Isd0JBQXlCLENBQUM7QUFDakYsZUFBZUEsd0JBQXdCIn0=