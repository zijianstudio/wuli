// Copyright 2023, University of Colorado Boulder

/**
 * SecondLanguageControl is the 'Second Language' control in the Preferences dialog.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import { allowLinksProperty, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PreferencesControl from '../../../../joist/js/preferences/PreferencesControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ToggleSwitch from '../../../../sun/js/ToggleSwitch.js';
import PreferencesDialogConstants from '../../../../joist/js/preferences/PreferencesDialogConstants.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { availableRuntimeLocales } from '../../../../joist/js/i18n/localeProperty.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import LanguageAndVoiceControl from './LanguageAndVoiceControl.js';
import PreferencesDialog from '../../../../joist/js/preferences/PreferencesDialog.js';
export default class SecondLanguageControl extends VBox {
  constructor(preferences, utteranceQueue, providedOptions) {
    const options = optionize()({
      // VBoxOptions
      excludeInvisibleChildrenFromBounds: false,
      align: 'left',
      spacing: NumberSuiteCommonConstants.PREFERENCES_VBOX_SPACING
    }, providedOptions);
    const labelText = new Text(NumberSuiteCommonStrings.secondLanguageStringProperty, PreferencesDialogConstants.CONTROL_LABEL_OPTIONS);
    const descriptionText = new Text(NumberSuiteCommonStrings.secondLanguageDescriptionStringProperty, PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS);
    const toggleSwitch = new ToggleSwitch(preferences.showSecondLocaleProperty, false, true, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS);

    // Control for showing or hiding the languageAndVoiceControl
    const preferencesControl = new PreferencesControl({
      labelNode: labelText,
      descriptionNode: descriptionText,
      controlNode: toggleSwitch,
      enabled: availableRuntimeLocales.length > 1,
      // disabled if we do not have multiple locales available
      ySpacing: NumberSuiteCommonConstants.PREFERENCES_DESCRIPTION_Y_SPACING
    });

    // Additional description that is visible when the Second Language control is disabled.
    const additionalDescriptionNode = new AdditionalDescriptionNode(!preferencesControl.enabled, preferences.allUrl);

    // Control for choosing a second language and associated voice
    const languageAndVoiceControl = new LanguageAndVoiceControl(preferences.secondLocaleProperty, preferences.secondVoiceProperty, utteranceQueue, {
      visibleProperty: preferences.showSecondLocaleProperty
    });
    options.children = [new VBox({
      children: [preferencesControl, additionalDescriptionNode],
      spacing: NumberSuiteCommonConstants.PREFERENCES_DESCRIPTION_Y_SPACING,
      align: 'left'
    }), languageAndVoiceControl];
    super(options);

    // If we turn off the secondLocale, switch back to the primary locale.
    preferences.showSecondLocaleProperty.lazyLink(showSecondLocale => {
      if (!showSecondLocale) {
        preferences.isPrimaryLocaleProperty.value = true;

        // When we turn off the second locale and switch back to the primary locale, if autoHear is on, the speechData
        // is spoken in NumberCompare because it changed from a language change. For consistency with Number Play,
        // cancel the speech instead.
        utteranceQueue.cancelSpeechDataSpeaking();
      }
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}

/**
 * Additional description that is displayed below the 'Second Language' toggle switch when we do not have
 * multiple locales. It instructs the user how to run the version of the sim that supports multiple locales.
 * If allowLinks is true, a hyperlink to the 'all' version of the sim is included.
 */
class AdditionalDescriptionNode extends VBox {
  constructor(visible, allUrl) {
    const toDisplayASecondLanguageText = new RichText(NumberSuiteCommonStrings.toDisplayASecondLanguageDescriptionStringProperty, {
      font: new PhetFont(12),
      maxWidth: PreferencesDialog.CONTENT_MAX_WIDTH
    });

    // If links are not allowed, show the URL as plain text.
    const urlStringProperty = new DerivedProperty([allowLinksProperty], allowLinks => allowLinks ? `<a href="{{url}}">${allUrl}</a>` : allUrl);
    const urlText = new RichText(urlStringProperty, {
      links: {
        url: allUrl
      },
      font: new PhetFont(12),
      maxWidth: PreferencesDialog.CONTENT_MAX_WIDTH
    });

    // Additional description that is visible when the Second Language control is disabled.
    super({
      visible: visible,
      children: [toDisplayASecondLanguageText, urlText],
      spacing: NumberSuiteCommonConstants.PREFERENCES_DESCRIPTION_Y_SPACING,
      align: 'left'
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
numberSuiteCommon.register('SecondLanguageControl', SecondLanguageControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJTdWl0ZUNvbW1vblN0cmluZ3MiLCJudW1iZXJTdWl0ZUNvbW1vbiIsImFsbG93TGlua3NQcm9wZXJ0eSIsIlJpY2hUZXh0IiwiVGV4dCIsIlZCb3giLCJvcHRpb25pemUiLCJQcmVmZXJlbmNlc0NvbnRyb2wiLCJQaGV0Rm9udCIsIlRvZ2dsZVN3aXRjaCIsIlByZWZlcmVuY2VzRGlhbG9nQ29uc3RhbnRzIiwiRGVyaXZlZFByb3BlcnR5IiwiYXZhaWxhYmxlUnVudGltZUxvY2FsZXMiLCJOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cyIsIkxhbmd1YWdlQW5kVm9pY2VDb250cm9sIiwiUHJlZmVyZW5jZXNEaWFsb2ciLCJTZWNvbmRMYW5ndWFnZUNvbnRyb2wiLCJjb25zdHJ1Y3RvciIsInByZWZlcmVuY2VzIiwidXR0ZXJhbmNlUXVldWUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyIsImFsaWduIiwic3BhY2luZyIsIlBSRUZFUkVOQ0VTX1ZCT1hfU1BBQ0lORyIsImxhYmVsVGV4dCIsInNlY29uZExhbmd1YWdlU3RyaW5nUHJvcGVydHkiLCJDT05UUk9MX0xBQkVMX09QVElPTlMiLCJkZXNjcmlwdGlvblRleHQiLCJzZWNvbmRMYW5ndWFnZURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJDT05UUk9MX0RFU0NSSVBUSU9OX09QVElPTlMiLCJ0b2dnbGVTd2l0Y2giLCJzaG93U2Vjb25kTG9jYWxlUHJvcGVydHkiLCJUT0dHTEVfU1dJVENIX09QVElPTlMiLCJwcmVmZXJlbmNlc0NvbnRyb2wiLCJsYWJlbE5vZGUiLCJkZXNjcmlwdGlvbk5vZGUiLCJjb250cm9sTm9kZSIsImVuYWJsZWQiLCJsZW5ndGgiLCJ5U3BhY2luZyIsIlBSRUZFUkVOQ0VTX0RFU0NSSVBUSU9OX1lfU1BBQ0lORyIsImFkZGl0aW9uYWxEZXNjcmlwdGlvbk5vZGUiLCJBZGRpdGlvbmFsRGVzY3JpcHRpb25Ob2RlIiwiYWxsVXJsIiwibGFuZ3VhZ2VBbmRWb2ljZUNvbnRyb2wiLCJzZWNvbmRMb2NhbGVQcm9wZXJ0eSIsInNlY29uZFZvaWNlUHJvcGVydHkiLCJ2aXNpYmxlUHJvcGVydHkiLCJjaGlsZHJlbiIsImxhenlMaW5rIiwic2hvd1NlY29uZExvY2FsZSIsImlzUHJpbWFyeUxvY2FsZVByb3BlcnR5IiwidmFsdWUiLCJjYW5jZWxTcGVlY2hEYXRhU3BlYWtpbmciLCJkaXNwb3NlIiwiYXNzZXJ0IiwidmlzaWJsZSIsInRvRGlzcGxheUFTZWNvbmRMYW5ndWFnZVRleHQiLCJ0b0Rpc3BsYXlBU2Vjb25kTGFuZ3VhZ2VEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IiwiZm9udCIsIm1heFdpZHRoIiwiQ09OVEVOVF9NQVhfV0lEVEgiLCJ1cmxTdHJpbmdQcm9wZXJ0eSIsImFsbG93TGlua3MiLCJ1cmxUZXh0IiwibGlua3MiLCJ1cmwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNlY29uZExhbmd1YWdlQ29udHJvbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2Vjb25kTGFuZ3VhZ2VDb250cm9sIGlzIHRoZSAnU2Vjb25kIExhbmd1YWdlJyBjb250cm9sIGluIHRoZSBQcmVmZXJlbmNlcyBkaWFsb2cuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyU3VpdGVDb21tb25TdHJpbmdzIGZyb20gJy4uLy4uL051bWJlclN1aXRlQ29tbW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBudW1iZXJTdWl0ZUNvbW1vbiBmcm9tICcuLi8uLi9udW1iZXJTdWl0ZUNvbW1vbi5qcyc7XHJcbmltcG9ydCB7IGFsbG93TGlua3NQcm9wZXJ0eSwgUmljaFRleHQsIFRleHQsIFZCb3gsIFZCb3hPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc0NvbnRyb2wgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvcHJlZmVyZW5jZXMvUHJlZmVyZW5jZXNDb250cm9sLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBUb2dnbGVTd2l0Y2ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1RvZ2dsZVN3aXRjaC5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9wcmVmZXJlbmNlcy9QcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBhdmFpbGFibGVSdW50aW1lTG9jYWxlcyB9IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL2kxOG4vbG9jYWxlUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cyBmcm9tICcuLi9OdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBMYW5ndWFnZUFuZFZvaWNlQ29udHJvbCBmcm9tICcuL0xhbmd1YWdlQW5kVm9pY2VDb250cm9sLmpzJztcclxuaW1wb3J0IE51bWJlclN1aXRlQ29tbW9uVXR0ZXJhbmNlUXVldWUgZnJvbSAnLi9OdW1iZXJTdWl0ZUNvbW1vblV0dGVyYW5jZVF1ZXVlLmpzJztcclxuaW1wb3J0IE51bWJlclN1aXRlQ29tbW9uUHJlZmVyZW5jZXMgZnJvbSAnLi4vbW9kZWwvTnVtYmVyU3VpdGVDb21tb25QcmVmZXJlbmNlcy5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc0RpYWxvZyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9wcmVmZXJlbmNlcy9QcmVmZXJlbmNlc0RpYWxvZy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxudHlwZSBTZWNvbmRMYW5ndWFnZUNvbnRyb2xPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFZCb3hPcHRpb25zLCAnY2hpbGRyZW4nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlY29uZExhbmd1YWdlQ29udHJvbCBleHRlbmRzIFZCb3gge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByZWZlcmVuY2VzOiBOdW1iZXJTdWl0ZUNvbW1vblByZWZlcmVuY2VzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgdXR0ZXJhbmNlUXVldWU6IE51bWJlclN1aXRlQ29tbW9uVXR0ZXJhbmNlUXVldWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBTZWNvbmRMYW5ndWFnZUNvbnRyb2xPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U2Vjb25kTGFuZ3VhZ2VDb250cm9sT3B0aW9ucywgU2VsZk9wdGlvbnMsIFZCb3hPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBWQm94T3B0aW9uc1xyXG4gICAgICBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiBmYWxzZSxcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMuUFJFRkVSRU5DRVNfVkJPWF9TUEFDSU5HXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBsYWJlbFRleHQgPSBuZXcgVGV4dCggTnVtYmVyU3VpdGVDb21tb25TdHJpbmdzLnNlY29uZExhbmd1YWdlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIFByZWZlcmVuY2VzRGlhbG9nQ29uc3RhbnRzLkNPTlRST0xfTEFCRUxfT1BUSU9OUyApO1xyXG5cclxuICAgIGNvbnN0IGRlc2NyaXB0aW9uVGV4dCA9IG5ldyBUZXh0KCBOdW1iZXJTdWl0ZUNvbW1vblN0cmluZ3Muc2Vjb25kTGFuZ3VhZ2VEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cy5DT05UUk9MX0RFU0NSSVBUSU9OX09QVElPTlMgKTtcclxuXHJcbiAgICBjb25zdCB0b2dnbGVTd2l0Y2ggPSBuZXcgVG9nZ2xlU3dpdGNoKCBwcmVmZXJlbmNlcy5zaG93U2Vjb25kTG9jYWxlUHJvcGVydHksIGZhbHNlLCB0cnVlLFxyXG4gICAgICBQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cy5UT0dHTEVfU1dJVENIX09QVElPTlMgKTtcclxuXHJcbiAgICAvLyBDb250cm9sIGZvciBzaG93aW5nIG9yIGhpZGluZyB0aGUgbGFuZ3VhZ2VBbmRWb2ljZUNvbnRyb2xcclxuICAgIGNvbnN0IHByZWZlcmVuY2VzQ29udHJvbCA9IG5ldyBQcmVmZXJlbmNlc0NvbnRyb2woIHtcclxuICAgICAgbGFiZWxOb2RlOiBsYWJlbFRleHQsXHJcbiAgICAgIGRlc2NyaXB0aW9uTm9kZTogZGVzY3JpcHRpb25UZXh0LFxyXG4gICAgICBjb250cm9sTm9kZTogdG9nZ2xlU3dpdGNoLFxyXG4gICAgICBlbmFibGVkOiAoIGF2YWlsYWJsZVJ1bnRpbWVMb2NhbGVzLmxlbmd0aCA+IDEgKSwgLy8gZGlzYWJsZWQgaWYgd2UgZG8gbm90IGhhdmUgbXVsdGlwbGUgbG9jYWxlcyBhdmFpbGFibGVcclxuICAgICAgeVNwYWNpbmc6IE51bWJlclN1aXRlQ29tbW9uQ29uc3RhbnRzLlBSRUZFUkVOQ0VTX0RFU0NSSVBUSU9OX1lfU1BBQ0lOR1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkZGl0aW9uYWwgZGVzY3JpcHRpb24gdGhhdCBpcyB2aXNpYmxlIHdoZW4gdGhlIFNlY29uZCBMYW5ndWFnZSBjb250cm9sIGlzIGRpc2FibGVkLlxyXG4gICAgY29uc3QgYWRkaXRpb25hbERlc2NyaXB0aW9uTm9kZSA9IG5ldyBBZGRpdGlvbmFsRGVzY3JpcHRpb25Ob2RlKCAhcHJlZmVyZW5jZXNDb250cm9sLmVuYWJsZWQsIHByZWZlcmVuY2VzLmFsbFVybCApO1xyXG5cclxuICAgIC8vIENvbnRyb2wgZm9yIGNob29zaW5nIGEgc2Vjb25kIGxhbmd1YWdlIGFuZCBhc3NvY2lhdGVkIHZvaWNlXHJcbiAgICBjb25zdCBsYW5ndWFnZUFuZFZvaWNlQ29udHJvbCA9IG5ldyBMYW5ndWFnZUFuZFZvaWNlQ29udHJvbChcclxuICAgICAgcHJlZmVyZW5jZXMuc2Vjb25kTG9jYWxlUHJvcGVydHksXHJcbiAgICAgIHByZWZlcmVuY2VzLnNlY29uZFZvaWNlUHJvcGVydHksXHJcbiAgICAgIHV0dGVyYW5jZVF1ZXVlLCB7XHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5OiBwcmVmZXJlbmNlcy5zaG93U2Vjb25kTG9jYWxlUHJvcGVydHlcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gW1xyXG4gICAgICBuZXcgVkJveCgge1xyXG4gICAgICAgIGNoaWxkcmVuOiBbIHByZWZlcmVuY2VzQ29udHJvbCwgYWRkaXRpb25hbERlc2NyaXB0aW9uTm9kZSBdLFxyXG4gICAgICAgIHNwYWNpbmc6IE51bWJlclN1aXRlQ29tbW9uQ29uc3RhbnRzLlBSRUZFUkVOQ0VTX0RFU0NSSVBUSU9OX1lfU1BBQ0lORyxcclxuICAgICAgICBhbGlnbjogJ2xlZnQnXHJcbiAgICAgIH0gKSxcclxuICAgICAgbGFuZ3VhZ2VBbmRWb2ljZUNvbnRyb2xcclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBJZiB3ZSB0dXJuIG9mZiB0aGUgc2Vjb25kTG9jYWxlLCBzd2l0Y2ggYmFjayB0byB0aGUgcHJpbWFyeSBsb2NhbGUuXHJcbiAgICBwcmVmZXJlbmNlcy5zaG93U2Vjb25kTG9jYWxlUHJvcGVydHkubGF6eUxpbmsoIHNob3dTZWNvbmRMb2NhbGUgPT4ge1xyXG4gICAgICBpZiAoICFzaG93U2Vjb25kTG9jYWxlICkge1xyXG4gICAgICAgIHByZWZlcmVuY2VzLmlzUHJpbWFyeUxvY2FsZVByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gV2hlbiB3ZSB0dXJuIG9mZiB0aGUgc2Vjb25kIGxvY2FsZSBhbmQgc3dpdGNoIGJhY2sgdG8gdGhlIHByaW1hcnkgbG9jYWxlLCBpZiBhdXRvSGVhciBpcyBvbiwgdGhlIHNwZWVjaERhdGFcclxuICAgICAgICAvLyBpcyBzcG9rZW4gaW4gTnVtYmVyQ29tcGFyZSBiZWNhdXNlIGl0IGNoYW5nZWQgZnJvbSBhIGxhbmd1YWdlIGNoYW5nZS4gRm9yIGNvbnNpc3RlbmN5IHdpdGggTnVtYmVyIFBsYXksXHJcbiAgICAgICAgLy8gY2FuY2VsIHRoZSBzcGVlY2ggaW5zdGVhZC5cclxuICAgICAgICB1dHRlcmFuY2VRdWV1ZS5jYW5jZWxTcGVlY2hEYXRhU3BlYWtpbmcoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGRpdGlvbmFsIGRlc2NyaXB0aW9uIHRoYXQgaXMgZGlzcGxheWVkIGJlbG93IHRoZSAnU2Vjb25kIExhbmd1YWdlJyB0b2dnbGUgc3dpdGNoIHdoZW4gd2UgZG8gbm90IGhhdmVcclxuICogbXVsdGlwbGUgbG9jYWxlcy4gSXQgaW5zdHJ1Y3RzIHRoZSB1c2VyIGhvdyB0byBydW4gdGhlIHZlcnNpb24gb2YgdGhlIHNpbSB0aGF0IHN1cHBvcnRzIG11bHRpcGxlIGxvY2FsZXMuXHJcbiAqIElmIGFsbG93TGlua3MgaXMgdHJ1ZSwgYSBoeXBlcmxpbmsgdG8gdGhlICdhbGwnIHZlcnNpb24gb2YgdGhlIHNpbSBpcyBpbmNsdWRlZC5cclxuICovXHJcbmNsYXNzIEFkZGl0aW9uYWxEZXNjcmlwdGlvbk5vZGUgZXh0ZW5kcyBWQm94IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2aXNpYmxlOiBib29sZWFuLCBhbGxVcmw6IHN0cmluZyApIHtcclxuXHJcbiAgICBjb25zdCB0b0Rpc3BsYXlBU2Vjb25kTGFuZ3VhZ2VUZXh0ID0gbmV3IFJpY2hUZXh0KCBOdW1iZXJTdWl0ZUNvbW1vblN0cmluZ3MudG9EaXNwbGF5QVNlY29uZExhbmd1YWdlRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDEyICksXHJcbiAgICAgIG1heFdpZHRoOiBQcmVmZXJlbmNlc0RpYWxvZy5DT05URU5UX01BWF9XSURUSFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIElmIGxpbmtzIGFyZSBub3QgYWxsb3dlZCwgc2hvdyB0aGUgVVJMIGFzIHBsYWluIHRleHQuXHJcbiAgICBjb25zdCB1cmxTdHJpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgYWxsb3dMaW5rc1Byb3BlcnR5IF0sXHJcbiAgICAgIGFsbG93TGlua3MgPT4gYWxsb3dMaW5rcyA/IGA8YSBocmVmPVwie3t1cmx9fVwiPiR7YWxsVXJsfTwvYT5gIDogYWxsVXJsXHJcbiAgICApO1xyXG4gICAgY29uc3QgdXJsVGV4dCA9IG5ldyBSaWNoVGV4dCggdXJsU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgbGlua3M6IHsgdXJsOiBhbGxVcmwgfSxcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApLFxyXG4gICAgICBtYXhXaWR0aDogUHJlZmVyZW5jZXNEaWFsb2cuQ09OVEVOVF9NQVhfV0lEVEhcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGRpdGlvbmFsIGRlc2NyaXB0aW9uIHRoYXQgaXMgdmlzaWJsZSB3aGVuIHRoZSBTZWNvbmQgTGFuZ3VhZ2UgY29udHJvbCBpcyBkaXNhYmxlZC5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHZpc2libGU6IHZpc2libGUsXHJcbiAgICAgIGNoaWxkcmVuOiBbIHRvRGlzcGxheUFTZWNvbmRMYW5ndWFnZVRleHQsIHVybFRleHQgXSxcclxuICAgICAgc3BhY2luZzogTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMuUFJFRkVSRU5DRVNfREVTQ1JJUFRJT05fWV9TUEFDSU5HLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyU3VpdGVDb21tb24ucmVnaXN0ZXIoICdTZWNvbmRMYW5ndWFnZUNvbnRyb2wnLCBTZWNvbmRMYW5ndWFnZUNvbnRyb2wgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0Esd0JB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