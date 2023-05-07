// Copyright 2022-2023, University of Colorado Boulder

/**
 * ConcentrationMeterUnitsControl is the Preferences dialog control for setting the units for the concentration meter.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { HBox, Text } from '../../../../scenery/js/imports.js';
import AquaRadioButtonGroup from '../../../../sun/js/AquaRadioButtonGroup.js';
import beersLawLab from '../../beersLawLab.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import BeersLawLabStrings from '../../BeersLawLabStrings.js';
import PreferencesDialog from '../../../../joist/js/preferences/PreferencesDialog.js';
export default class ConcentrationMeterUnitsControl extends HBox {
  constructor(beakerUnitsProperty, providedOptions) {
    const options = optionize()({
      // HBoxOptions
      spacing: 15
    }, providedOptions);
    const labelText = new Text(BeersLawLabStrings.concentrationMeterUnitsStringProperty, {
      font: PreferencesDialog.CONTENT_FONT,
      tandem: options.tandem.createTandem('labelText')
    });
    const radioButtonGroup = new ConcentrationMeterUnitsRadioButtonGroup(beakerUnitsProperty, {
      tandem: options.tandem.createTandem('radioButtonGroup')
    });
    options.children = [labelText, radioButtonGroup];
    super(options);
    this.addLinkedElement(beakerUnitsProperty, {
      tandem: options.tandem.createTandem(beakerUnitsProperty.tandem.name)
    });
    this.disposeConcentrationMeterUnitsControl = () => {
      labelText.dispose();
      radioButtonGroup.dispose();
    };
  }
  dispose() {
    super.dispose();
    this.disposeConcentrationMeterUnitsControl();
  }
}
class ConcentrationMeterUnitsRadioButtonGroup extends AquaRadioButtonGroup {
  constructor(beakerUnitsProperty, providedOptions) {
    const options = optionize()({
      // AquaRadioButtonGroupOptions
      orientation: 'horizontal',
      spacing: 15
    }, providedOptions);
    const items = [createItem('molesPerLiter', BeersLawLabStrings.units.molesPerLiterStringProperty), createItem('percent', BeersLawLabStrings.units.percentStringProperty)];
    super(beakerUnitsProperty, items, options);
  }
}
function createItem(value, stringProperty) {
  return {
    value: value,
    createNode: tandem => new Text(stringProperty, {
      font: PreferencesDialog.CONTENT_FONT,
      maxWidth: 200,
      tandem: tandem.createTandem('text')
    }),
    tandemName: `${value}${AquaRadioButton.TANDEM_NAME_SUFFIX}`
  };
}
beersLawLab.register('ConcentrationMeterUnitsControl', ConcentrationMeterUnitsControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJIQm94IiwiVGV4dCIsIkFxdWFSYWRpb0J1dHRvbkdyb3VwIiwiYmVlcnNMYXdMYWIiLCJBcXVhUmFkaW9CdXR0b24iLCJCZWVyc0xhd0xhYlN0cmluZ3MiLCJQcmVmZXJlbmNlc0RpYWxvZyIsIkNvbmNlbnRyYXRpb25NZXRlclVuaXRzQ29udHJvbCIsImNvbnN0cnVjdG9yIiwiYmVha2VyVW5pdHNQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzcGFjaW5nIiwibGFiZWxUZXh0IiwiY29uY2VudHJhdGlvbk1ldGVyVW5pdHNTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJDT05URU5UX0ZPTlQiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJyYWRpb0J1dHRvbkdyb3VwIiwiQ29uY2VudHJhdGlvbk1ldGVyVW5pdHNSYWRpb0J1dHRvbkdyb3VwIiwiY2hpbGRyZW4iLCJhZGRMaW5rZWRFbGVtZW50IiwibmFtZSIsImRpc3Bvc2VDb25jZW50cmF0aW9uTWV0ZXJVbml0c0NvbnRyb2wiLCJkaXNwb3NlIiwib3JpZW50YXRpb24iLCJpdGVtcyIsImNyZWF0ZUl0ZW0iLCJ1bml0cyIsIm1vbGVzUGVyTGl0ZXJTdHJpbmdQcm9wZXJ0eSIsInBlcmNlbnRTdHJpbmdQcm9wZXJ0eSIsInZhbHVlIiwic3RyaW5nUHJvcGVydHkiLCJjcmVhdGVOb2RlIiwibWF4V2lkdGgiLCJ0YW5kZW1OYW1lIiwiVEFOREVNX05BTUVfU1VGRklYIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb25jZW50cmF0aW9uTWV0ZXJVbml0c0NvbnRyb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29uY2VudHJhdGlvbk1ldGVyVW5pdHNDb250cm9sIGlzIHRoZSBQcmVmZXJlbmNlcyBkaWFsb2cgY29udHJvbCBmb3Igc2V0dGluZyB0aGUgdW5pdHMgZm9yIHRoZSBjb25jZW50cmF0aW9uIG1ldGVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIEhCb3hPcHRpb25zLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IEFxdWFSYWRpb0J1dHRvbkdyb3VwLCB7IEFxdWFSYWRpb0J1dHRvbkdyb3VwSXRlbSwgQXF1YVJhZGlvQnV0dG9uR3JvdXBPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FxdWFSYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IHsgQ29uY2VudHJhdGlvbk1ldGVyVW5pdHMgfSBmcm9tICcuLi9CTExRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgYmVlcnNMYXdMYWIgZnJvbSAnLi4vLi4vYmVlcnNMYXdMYWIuanMnO1xyXG5pbXBvcnQgQXF1YVJhZGlvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BcXVhUmFkaW9CdXR0b24uanMnO1xyXG5pbXBvcnQgQmVlcnNMYXdMYWJTdHJpbmdzIGZyb20gJy4uLy4uL0JlZXJzTGF3TGFiU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc0RpYWxvZyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9wcmVmZXJlbmNlcy9QcmVmZXJlbmNlc0RpYWxvZy5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBDb25jZW50cmF0aW9uTWV0ZXJVbml0c0NvbnRyb2xPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8SEJveE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmNlbnRyYXRpb25NZXRlclVuaXRzQ29udHJvbCBleHRlbmRzIEhCb3gge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VDb25jZW50cmF0aW9uTWV0ZXJVbml0c0NvbnRyb2w6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYmVha2VyVW5pdHNQcm9wZXJ0eTogUHJvcGVydHk8Q29uY2VudHJhdGlvbk1ldGVyVW5pdHM+LCBwcm92aWRlZE9wdGlvbnM6IENvbmNlbnRyYXRpb25NZXRlclVuaXRzQ29udHJvbE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDb25jZW50cmF0aW9uTWV0ZXJVbml0c0NvbnRyb2xPcHRpb25zLCBTZWxmT3B0aW9ucywgSEJveE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEhCb3hPcHRpb25zXHJcbiAgICAgIHNwYWNpbmc6IDE1XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBsYWJlbFRleHQgPSBuZXcgVGV4dCggQmVlcnNMYXdMYWJTdHJpbmdzLmNvbmNlbnRyYXRpb25NZXRlclVuaXRzU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogUHJlZmVyZW5jZXNEaWFsb2cuQ09OVEVOVF9GT05ULFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYmVsVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgQ29uY2VudHJhdGlvbk1ldGVyVW5pdHNSYWRpb0J1dHRvbkdyb3VwKCBiZWFrZXJVbml0c1Byb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncmFkaW9CdXR0b25Hcm91cCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIGxhYmVsVGV4dCwgcmFkaW9CdXR0b25Hcm91cCBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBiZWFrZXJVbml0c1Byb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCBiZWFrZXJVbml0c1Byb3BlcnR5LnRhbmRlbS5uYW1lIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VDb25jZW50cmF0aW9uTWV0ZXJVbml0c0NvbnRyb2wgPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgIGxhYmVsVGV4dC5kaXNwb3NlKCk7XHJcbiAgICAgIHJhZGlvQnV0dG9uR3JvdXAuZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5kaXNwb3NlQ29uY2VudHJhdGlvbk1ldGVyVW5pdHNDb250cm9sKCk7XHJcbiAgfVxyXG59XHJcblxyXG50eXBlIENvbmNlbnRyYXRpb25NZXRlclVuaXRzUmFkaW9CdXR0b25Hcm91cFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgQ29uY2VudHJhdGlvbk1ldGVyVW5pdHNSYWRpb0J1dHRvbkdyb3VwT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPEFxdWFSYWRpb0J1dHRvbkdyb3VwT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuY2xhc3MgQ29uY2VudHJhdGlvbk1ldGVyVW5pdHNSYWRpb0J1dHRvbkdyb3VwIGV4dGVuZHMgQXF1YVJhZGlvQnV0dG9uR3JvdXA8Q29uY2VudHJhdGlvbk1ldGVyVW5pdHM+IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBiZWFrZXJVbml0c1Byb3BlcnR5OiBQcm9wZXJ0eTxDb25jZW50cmF0aW9uTWV0ZXJVbml0cz4sIHByb3ZpZGVkT3B0aW9uczogQ29uY2VudHJhdGlvbk1ldGVyVW5pdHNSYWRpb0J1dHRvbkdyb3VwT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPENvbmNlbnRyYXRpb25NZXRlclVuaXRzUmFkaW9CdXR0b25Hcm91cE9wdGlvbnMsIENvbmNlbnRyYXRpb25NZXRlclVuaXRzUmFkaW9CdXR0b25Hcm91cFNlbGZPcHRpb25zLCBBcXVhUmFkaW9CdXR0b25Hcm91cE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEFxdWFSYWRpb0J1dHRvbkdyb3VwT3B0aW9uc1xyXG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxyXG4gICAgICBzcGFjaW5nOiAxNVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgaXRlbXM6IEFxdWFSYWRpb0J1dHRvbkdyb3VwSXRlbTxDb25jZW50cmF0aW9uTWV0ZXJVbml0cz5bXSA9IFtcclxuICAgICAgY3JlYXRlSXRlbSggJ21vbGVzUGVyTGl0ZXInLCBCZWVyc0xhd0xhYlN0cmluZ3MudW5pdHMubW9sZXNQZXJMaXRlclN0cmluZ1Byb3BlcnR5ICksXHJcbiAgICAgIGNyZWF0ZUl0ZW0oICdwZXJjZW50JywgQmVlcnNMYXdMYWJTdHJpbmdzLnVuaXRzLnBlcmNlbnRTdHJpbmdQcm9wZXJ0eSApXHJcbiAgICBdO1xyXG5cclxuICAgIHN1cGVyKCBiZWFrZXJVbml0c1Byb3BlcnR5LCBpdGVtcywgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlSXRlbSggdmFsdWU6IENvbmNlbnRyYXRpb25NZXRlclVuaXRzLCBzdHJpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiApOiBBcXVhUmFkaW9CdXR0b25Hcm91cEl0ZW08Q29uY2VudHJhdGlvbk1ldGVyVW5pdHM+IHtcclxuICByZXR1cm4ge1xyXG4gICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgY3JlYXRlTm9kZTogdGFuZGVtID0+IG5ldyBUZXh0KCBzdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBQcmVmZXJlbmNlc0RpYWxvZy5DT05URU5UX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiAyMDAsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RleHQnIClcclxuICAgIH0gKSxcclxuICAgIHRhbmRlbU5hbWU6IGAke3ZhbHVlfSR7QXF1YVJhZGlvQnV0dG9uLlRBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgfTtcclxufVxyXG5cclxuYmVlcnNMYXdMYWIucmVnaXN0ZXIoICdDb25jZW50cmF0aW9uTWV0ZXJVbml0c0NvbnRyb2wnLCBDb25jZW50cmF0aW9uTWV0ZXJVbml0c0NvbnRyb2wgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsU0FBUyxNQUE0Qix1Q0FBdUM7QUFDbkYsU0FBU0MsSUFBSSxFQUFlQyxJQUFJLFFBQVEsbUNBQW1DO0FBRTNFLE9BQU9DLG9CQUFvQixNQUFpRSw0Q0FBNEM7QUFFeEksT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyxpQkFBaUIsTUFBTSx1REFBdUQ7QUFPckYsZUFBZSxNQUFNQyw4QkFBOEIsU0FBU1AsSUFBSSxDQUFDO0VBSXhEUSxXQUFXQSxDQUFFQyxtQkFBc0QsRUFBRUMsZUFBc0QsRUFBRztJQUVuSSxNQUFNQyxPQUFPLEdBQUdaLFNBQVMsQ0FBa0UsQ0FBQyxDQUFFO01BRTVGO01BQ0FhLE9BQU8sRUFBRTtJQUNYLENBQUMsRUFBRUYsZUFBZ0IsQ0FBQztJQUVwQixNQUFNRyxTQUFTLEdBQUcsSUFBSVosSUFBSSxDQUFFSSxrQkFBa0IsQ0FBQ1MscUNBQXFDLEVBQUU7TUFDcEZDLElBQUksRUFBRVQsaUJBQWlCLENBQUNVLFlBQVk7TUFDcENDLE1BQU0sRUFBRU4sT0FBTyxDQUFDTSxNQUFNLENBQUNDLFlBQVksQ0FBRSxXQUFZO0lBQ25ELENBQUUsQ0FBQztJQUVILE1BQU1DLGdCQUFnQixHQUFHLElBQUlDLHVDQUF1QyxDQUFFWCxtQkFBbUIsRUFBRTtNQUN6RlEsTUFBTSxFQUFFTixPQUFPLENBQUNNLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGtCQUFtQjtJQUMxRCxDQUFFLENBQUM7SUFFSFAsT0FBTyxDQUFDVSxRQUFRLEdBQUcsQ0FBRVIsU0FBUyxFQUFFTSxnQkFBZ0IsQ0FBRTtJQUVsRCxLQUFLLENBQUVSLE9BQVEsQ0FBQztJQUVoQixJQUFJLENBQUNXLGdCQUFnQixDQUFFYixtQkFBbUIsRUFBRTtNQUMxQ1EsTUFBTSxFQUFFTixPQUFPLENBQUNNLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFVCxtQkFBbUIsQ0FBQ1EsTUFBTSxDQUFDTSxJQUFLO0lBQ3ZFLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0MscUNBQXFDLEdBQUcsTUFBWTtNQUN2RFgsU0FBUyxDQUFDWSxPQUFPLENBQUMsQ0FBQztNQUNuQk4sZ0JBQWdCLENBQUNNLE9BQU8sQ0FBQyxDQUFDO0lBQzVCLENBQUM7RUFDSDtFQUVnQkEsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCLEtBQUssQ0FBQ0EsT0FBTyxDQUFDLENBQUM7SUFDZixJQUFJLENBQUNELHFDQUFxQyxDQUFDLENBQUM7RUFDOUM7QUFDRjtBQU1BLE1BQU1KLHVDQUF1QyxTQUFTbEIsb0JBQW9CLENBQTBCO0VBRTNGTSxXQUFXQSxDQUFFQyxtQkFBc0QsRUFBRUMsZUFBK0QsRUFBRztJQUU1SSxNQUFNQyxPQUFPLEdBQUdaLFNBQVMsQ0FBa0ksQ0FBQyxDQUFFO01BRTVKO01BQ0EyQixXQUFXLEVBQUUsWUFBWTtNQUN6QmQsT0FBTyxFQUFFO0lBQ1gsQ0FBQyxFQUFFRixlQUFnQixDQUFDO0lBRXBCLE1BQU1pQixLQUEwRCxHQUFHLENBQ2pFQyxVQUFVLENBQUUsZUFBZSxFQUFFdkIsa0JBQWtCLENBQUN3QixLQUFLLENBQUNDLDJCQUE0QixDQUFDLEVBQ25GRixVQUFVLENBQUUsU0FBUyxFQUFFdkIsa0JBQWtCLENBQUN3QixLQUFLLENBQUNFLHFCQUFzQixDQUFDLENBQ3hFO0lBRUQsS0FBSyxDQUFFdEIsbUJBQW1CLEVBQUVrQixLQUFLLEVBQUVoQixPQUFRLENBQUM7RUFDOUM7QUFDRjtBQUVBLFNBQVNpQixVQUFVQSxDQUFFSSxLQUE4QixFQUFFQyxjQUF5QyxFQUFzRDtFQUNsSixPQUFPO0lBQ0xELEtBQUssRUFBRUEsS0FBSztJQUNaRSxVQUFVLEVBQUVqQixNQUFNLElBQUksSUFBSWhCLElBQUksQ0FBRWdDLGNBQWMsRUFBRTtNQUM5Q2xCLElBQUksRUFBRVQsaUJBQWlCLENBQUNVLFlBQVk7TUFDcENtQixRQUFRLEVBQUUsR0FBRztNQUNibEIsTUFBTSxFQUFFQSxNQUFNLENBQUNDLFlBQVksQ0FBRSxNQUFPO0lBQ3RDLENBQUUsQ0FBQztJQUNIa0IsVUFBVSxFQUFHLEdBQUVKLEtBQU0sR0FBRTVCLGVBQWUsQ0FBQ2lDLGtCQUFtQjtFQUM1RCxDQUFDO0FBQ0g7QUFFQWxDLFdBQVcsQ0FBQ21DLFFBQVEsQ0FBRSxnQ0FBZ0MsRUFBRS9CLDhCQUErQixDQUFDIn0=