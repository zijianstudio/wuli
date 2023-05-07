// Copyright 2022-2023, University of Colorado Boulder

/**
 * VariableControl is the control in the Preferences dialog for selecting the variable used in functions.
 * It is a labeled group of radio buttons.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { RichText, Text } from '../../../../../scenery/js/imports.js';
import AquaRadioButtonGroup from '../../../../../sun/js/AquaRadioButtonGroup.js';
import calculusGrapher from '../../../calculusGrapher.js';
import CalculusGrapherStrings from '../../../CalculusGrapherStrings.js';
import AquaRadioButton from '../../../../../sun/js/AquaRadioButton.js';
import PreferencesDialog from '../../../../../joist/js/preferences/PreferencesDialog.js';
import CalculusGrapherSymbols from '../../CalculusGrapherSymbols.js';
import CalculusGrapherConstants from '../../CalculusGrapherConstants.js';
import PreferencesControl from '../../../../../joist/js/preferences/PreferencesControl.js';
export default class VariableControl extends PreferencesControl {
  constructor(functionVariableProperty, tandem) {
    const labelText = new Text(CalculusGrapherStrings.variableStringProperty, {
      font: CalculusGrapherConstants.PREFERENCES_LABEL_FONT,
      maxWidth: CalculusGrapherConstants.PREFERENCES_LABEL_MAX_WIDTH,
      tandem: tandem.createTandem('labelText')
    });
    const radioButtonGroup = new VariableRadioButtonGroup(functionVariableProperty, tandem.createTandem('radioButtonGroup'));
    super({
      labelNode: labelText,
      controlNode: radioButtonGroup,
      labelSpacing: 20,
      tandem: tandem,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    });
    this.disposeVariableControl = () => {
      labelText.dispose();
      radioButtonGroup.dispose();
    };
  }
  dispose() {
    this.disposeVariableControl();
    super.dispose();
  }
}

/**
 * The radio button group for this control.
 */
class VariableRadioButtonGroup extends AquaRadioButtonGroup {
  constructor(functionVariableProperty, tandem) {
    const items = [{
      value: 'x',
      createNode: radioButtonTandem => new VariableRadioButtonText(CalculusGrapherSymbols.xStringProperty, radioButtonTandem),
      tandemName: `x${AquaRadioButton.TANDEM_NAME_SUFFIX}`
    }, {
      value: 't',
      createNode: radioButtonTandem => new VariableRadioButtonText(CalculusGrapherSymbols.tStringProperty, radioButtonTandem),
      tandemName: `t${AquaRadioButton.TANDEM_NAME_SUFFIX}`
    }];
    super(functionVariableProperty, items, {
      orientation: 'horizontal',
      spacing: 20,
      radioButtonOptions: {
        phetioVisiblePropertyInstrumented: false
      },
      phetioVisiblePropertyInstrumented: false,
      tandem: tandem
    });
  }
}

/**
 * Labels for the radio buttons.
 */
class VariableRadioButtonText extends RichText {
  constructor(functionVariableStringProperty, radioButtonTandem) {
    super(functionVariableStringProperty, {
      font: PreferencesDialog.CONTENT_FONT,
      maxWidth: 100,
      tandem: radioButtonTandem.createTandem('text')
    });
  }
}
calculusGrapher.register('VariableControl', VariableControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSaWNoVGV4dCIsIlRleHQiLCJBcXVhUmFkaW9CdXR0b25Hcm91cCIsImNhbGN1bHVzR3JhcGhlciIsIkNhbGN1bHVzR3JhcGhlclN0cmluZ3MiLCJBcXVhUmFkaW9CdXR0b24iLCJQcmVmZXJlbmNlc0RpYWxvZyIsIkNhbGN1bHVzR3JhcGhlclN5bWJvbHMiLCJDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMiLCJQcmVmZXJlbmNlc0NvbnRyb2wiLCJWYXJpYWJsZUNvbnRyb2wiLCJjb25zdHJ1Y3RvciIsImZ1bmN0aW9uVmFyaWFibGVQcm9wZXJ0eSIsInRhbmRlbSIsImxhYmVsVGV4dCIsInZhcmlhYmxlU3RyaW5nUHJvcGVydHkiLCJmb250IiwiUFJFRkVSRU5DRVNfTEFCRUxfRk9OVCIsIm1heFdpZHRoIiwiUFJFRkVSRU5DRVNfTEFCRUxfTUFYX1dJRFRIIiwiY3JlYXRlVGFuZGVtIiwicmFkaW9CdXR0b25Hcm91cCIsIlZhcmlhYmxlUmFkaW9CdXR0b25Hcm91cCIsImxhYmVsTm9kZSIsImNvbnRyb2xOb2RlIiwibGFiZWxTcGFjaW5nIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwiZGlzcG9zZVZhcmlhYmxlQ29udHJvbCIsImRpc3Bvc2UiLCJpdGVtcyIsInZhbHVlIiwiY3JlYXRlTm9kZSIsInJhZGlvQnV0dG9uVGFuZGVtIiwiVmFyaWFibGVSYWRpb0J1dHRvblRleHQiLCJ4U3RyaW5nUHJvcGVydHkiLCJ0YW5kZW1OYW1lIiwiVEFOREVNX05BTUVfU1VGRklYIiwidFN0cmluZ1Byb3BlcnR5Iiwib3JpZW50YXRpb24iLCJzcGFjaW5nIiwicmFkaW9CdXR0b25PcHRpb25zIiwicGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkIiwiZnVuY3Rpb25WYXJpYWJsZVN0cmluZ1Byb3BlcnR5IiwiQ09OVEVOVF9GT05UIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJWYXJpYWJsZUNvbnRyb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmFyaWFibGVDb250cm9sIGlzIHRoZSBjb250cm9sIGluIHRoZSBQcmVmZXJlbmNlcyBkaWFsb2cgZm9yIHNlbGVjdGluZyB0aGUgdmFyaWFibGUgdXNlZCBpbiBmdW5jdGlvbnMuXHJcbiAqIEl0IGlzIGEgbGFiZWxlZCBncm91cCBvZiByYWRpbyBidXR0b25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFJpY2hUZXh0LCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFxdWFSYWRpb0J1dHRvbkdyb3VwLCB7IEFxdWFSYWRpb0J1dHRvbkdyb3VwSXRlbSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9BcXVhUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBjYWxjdWx1c0dyYXBoZXIgZnJvbSAnLi4vLi4vLi4vY2FsY3VsdXNHcmFwaGVyLmpzJztcclxuaW1wb3J0IENhbGN1bHVzR3JhcGhlclN0cmluZ3MgZnJvbSAnLi4vLi4vLi4vQ2FsY3VsdXNHcmFwaGVyU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBTdHJpbmdVbmlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvU3RyaW5nVW5pb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBBcXVhUmFkaW9CdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL0FxdWFSYWRpb0J1dHRvbi5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByZWZlcmVuY2VzRGlhbG9nIGZyb20gJy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3ByZWZlcmVuY2VzL1ByZWZlcmVuY2VzRGlhbG9nLmpzJztcclxuaW1wb3J0IENhbGN1bHVzR3JhcGhlclN5bWJvbHMgZnJvbSAnLi4vLi4vQ2FsY3VsdXNHcmFwaGVyU3ltYm9scy5qcyc7XHJcbmltcG9ydCB7IEZ1bmN0aW9uVmFyaWFibGUgfSBmcm9tICcuLi8uLi9DYWxjdWx1c0dyYXBoZXJRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzIGZyb20gJy4uLy4uL0NhbGN1bHVzR3JhcGhlckNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc0NvbnRyb2wgZnJvbSAnLi4vLi4vLi4vLi4vLi4vam9pc3QvanMvcHJlZmVyZW5jZXMvUHJlZmVyZW5jZXNDb250cm9sLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZhcmlhYmxlQ29udHJvbCBleHRlbmRzIFByZWZlcmVuY2VzQ29udHJvbCB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVZhcmlhYmxlQ29udHJvbDogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBmdW5jdGlvblZhcmlhYmxlUHJvcGVydHk6IFN0cmluZ1VuaW9uUHJvcGVydHk8RnVuY3Rpb25WYXJpYWJsZT4sIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IGxhYmVsVGV4dCA9IG5ldyBUZXh0KCBDYWxjdWx1c0dyYXBoZXJTdHJpbmdzLnZhcmlhYmxlU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzLlBSRUZFUkVOQ0VTX0xBQkVMX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuUFJFRkVSRU5DRVNfTEFCRUxfTUFYX1dJRFRILFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbFRleHQnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCByYWRpb0J1dHRvbkdyb3VwID0gbmV3IFZhcmlhYmxlUmFkaW9CdXR0b25Hcm91cCggZnVuY3Rpb25WYXJpYWJsZVByb3BlcnR5LFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmFkaW9CdXR0b25Hcm91cCcgKSApO1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIGxhYmVsTm9kZTogbGFiZWxUZXh0LFxyXG4gICAgICBjb250cm9sTm9kZTogcmFkaW9CdXR0b25Hcm91cCxcclxuICAgICAgbGFiZWxTcGFjaW5nOiAyMCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHtcclxuICAgICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlVmFyaWFibGVDb250cm9sID0gKCkgPT4ge1xyXG4gICAgICBsYWJlbFRleHQuZGlzcG9zZSgpO1xyXG4gICAgICByYWRpb0J1dHRvbkdyb3VwLmRpc3Bvc2UoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZVZhcmlhYmxlQ29udHJvbCgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSByYWRpbyBidXR0b24gZ3JvdXAgZm9yIHRoaXMgY29udHJvbC5cclxuICovXHJcbmNsYXNzIFZhcmlhYmxlUmFkaW9CdXR0b25Hcm91cCBleHRlbmRzIEFxdWFSYWRpb0J1dHRvbkdyb3VwPEZ1bmN0aW9uVmFyaWFibGU+IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBmdW5jdGlvblZhcmlhYmxlUHJvcGVydHk6IFN0cmluZ1VuaW9uUHJvcGVydHk8RnVuY3Rpb25WYXJpYWJsZT4sIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IGl0ZW1zOiBBcXVhUmFkaW9CdXR0b25Hcm91cEl0ZW08RnVuY3Rpb25WYXJpYWJsZT5bXSA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiAneCcsXHJcbiAgICAgICAgY3JlYXRlTm9kZTogcmFkaW9CdXR0b25UYW5kZW0gPT4gbmV3IFZhcmlhYmxlUmFkaW9CdXR0b25UZXh0KCBDYWxjdWx1c0dyYXBoZXJTeW1ib2xzLnhTdHJpbmdQcm9wZXJ0eSwgcmFkaW9CdXR0b25UYW5kZW0gKSxcclxuICAgICAgICB0YW5kZW1OYW1lOiBgeCR7QXF1YVJhZGlvQnV0dG9uLlRBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB2YWx1ZTogJ3QnLFxyXG4gICAgICAgIGNyZWF0ZU5vZGU6IHJhZGlvQnV0dG9uVGFuZGVtID0+IG5ldyBWYXJpYWJsZVJhZGlvQnV0dG9uVGV4dCggQ2FsY3VsdXNHcmFwaGVyU3ltYm9scy50U3RyaW5nUHJvcGVydHksIHJhZGlvQnV0dG9uVGFuZGVtICksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogYHQke0FxdWFSYWRpb0J1dHRvbi5UQU5ERU1fTkFNRV9TVUZGSVh9YFxyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuICAgIHN1cGVyKCBmdW5jdGlvblZhcmlhYmxlUHJvcGVydHksIGl0ZW1zLCB7XHJcbiAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXHJcbiAgICAgIHNwYWNpbmc6IDIwLFxyXG4gICAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICBwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQ6IGZhbHNlXHJcbiAgICAgIH0sXHJcbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2UsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogTGFiZWxzIGZvciB0aGUgcmFkaW8gYnV0dG9ucy5cclxuICovXHJcbmNsYXNzIFZhcmlhYmxlUmFkaW9CdXR0b25UZXh0IGV4dGVuZHMgUmljaFRleHQge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGZ1bmN0aW9uVmFyaWFibGVTdHJpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgcmFkaW9CdXR0b25UYW5kZW06IFRhbmRlbSApIHtcclxuICAgIHN1cGVyKCBmdW5jdGlvblZhcmlhYmxlU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogUHJlZmVyZW5jZXNEaWFsb2cuQ09OVEVOVF9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogMTAwLFxyXG4gICAgICB0YW5kZW06IHJhZGlvQnV0dG9uVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RleHQnIClcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmNhbGN1bHVzR3JhcGhlci5yZWdpc3RlciggJ1ZhcmlhYmxlQ29udHJvbCcsIFZhcmlhYmxlQ29udHJvbCApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxRQUFRLEVBQUVDLElBQUksUUFBUSxzQ0FBc0M7QUFDckUsT0FBT0Msb0JBQW9CLE1BQW9DLCtDQUErQztBQUM5RyxPQUFPQyxlQUFlLE1BQU0sNkJBQTZCO0FBQ3pELE9BQU9DLHNCQUFzQixNQUFNLG9DQUFvQztBQUV2RSxPQUFPQyxlQUFlLE1BQU0sMENBQTBDO0FBRXRFLE9BQU9DLGlCQUFpQixNQUFNLDBEQUEwRDtBQUN4RixPQUFPQyxzQkFBc0IsTUFBTSxpQ0FBaUM7QUFHcEUsT0FBT0Msd0JBQXdCLE1BQU0sbUNBQW1DO0FBQ3hFLE9BQU9DLGtCQUFrQixNQUFNLDJEQUEyRDtBQUUxRixlQUFlLE1BQU1DLGVBQWUsU0FB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