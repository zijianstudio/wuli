// Copyright 2021-2023, University of Colorado Boulder

/**
 * ComponentSpacingControl controls the value of Fourier component spacing (k1 or omega1).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { RichText } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import FMWConstants from '../../common/FMWConstants.js';
import FMWSymbols from '../../common/FMWSymbols.js';
import Domain from '../../common/model/Domain.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FourierMakingWavesStrings from '../../FourierMakingWavesStrings.js';
import WavePacketNumberControl from './WavePacketNumberControl.js';

// constants
const TEXT_OPTIONS = {
  font: FMWConstants.TICK_LABEL_FONT
};
const DECIMALS = 2;
export default class ComponentSpacingControl extends WavePacketNumberControl {
  /**
   * @param {NumberProperty} componentSpacingProperty
   * @param {EnumerationProperty.<Domain>} domainProperty
   * @param {Object} [options]
   */
  constructor(componentSpacingProperty, domainProperty, options) {
    assert && assert(componentSpacingProperty instanceof NumberProperty);
    assert && assert(componentSpacingProperty.validValues);
    assert && assert(domainProperty instanceof EnumerationProperty);
    options = merge({
      // NumberDisplay options
      delta: 1,
      // because the control is setting an index

      // Slider options
      sliderOptions: {
        constrainValue: value => Utils.roundSymmetric(value),
        // Add symbolic tick marks. This is more hard-coded than I'd prefer, but is clear and straightforward.
        // It was easy to change during development, and is supported by assertions below.
        majorTicks: [{
          value: 0,
          label: new RichText('0', TEXT_OPTIONS)
        }, {
          value: 1,
          label: new RichText(`${FMWSymbols.pi}/4`, TEXT_OPTIONS)
        }, {
          value: 2,
          label: new RichText(`${FMWSymbols.pi}/2`, TEXT_OPTIONS)
        }, {
          value: 3,
          label: new RichText(`${FMWSymbols.pi}`, TEXT_OPTIONS)
        }],
        // pdom options
        keyboardStep: 1,
        // This is selecting an index, not the actual value.
        // shiftKeyboardStep is set to options.delta by NumberControl
        pageKeyboardStep: 1
      },
      // phet-io options
      tandem: Tandem.REQUIRED
    }, options);

    // componentSpacingProperty has a small set of valid values. Only those values are to be settable via this Slider,
    // and they are to be distributed at equally-space tick marks on the Slider. So we create an index into this set
    // of values, and control that index with the Slider.
    const validValues = componentSpacingProperty.validValues;
    const defaultIndex = validValues.indexOf(componentSpacingProperty.value);
    const componentSpacingIndexProperty = new NumberProperty(defaultIndex, {
      numberType: 'Integer',
      range: new Range(0, validValues.length - 1)
    });
    assert && assert(options.sliderOptions.majorTicks.length === validValues.length, 'a tick is required for each value in validValues');

    // Keep componentSpacing and componentSpacingIndex in sync
    componentSpacingProperty.link(componentSpacing => {
      componentSpacingIndexProperty.value = validValues.indexOf(componentSpacing);
    });
    componentSpacingIndexProperty.link(componentSpacingIndex => {
      componentSpacingProperty.value = validValues[componentSpacingIndex];
    });
    super(componentSpacingIndexProperty, domainProperty, options);

    // Set the numberFormatter for this control's NumberDisplay.
    // In addition to the domain, this is dependent on a number of localized string Properties.
    Multilink.multilink([domainProperty, FMWSymbols.kStringProperty, FMWSymbols.omegaStringProperty, FourierMakingWavesStrings.units.radiansPerMeterStringProperty, FourierMakingWavesStrings.units.radiansPerMillisecondStringProperty, FourierMakingWavesStrings.symbolValueUnitsStringProperty], (domain, k, omega, radiansPerMeter, radiansPerMillisecond, symbolValueUnits) => {
      assert && assert(domain === Domain.SPACE || domain === Domain.TIME);
      this.setNumberFormatter(componentSpacingIndex => {
        const componentSpacing = componentSpacingProperty.validValues[componentSpacingIndex];
        const symbol = StringUtils.fillIn('{{symbol}}<sub>1</sub>', {
          symbol: domain === Domain.SPACE ? k : omega
        });

        // Using toFixedNumber removes trailing zeros.
        const value = Utils.toFixedNumber(componentSpacing, DECIMALS);
        const units = domain === Domain.SPACE ? radiansPerMeter : radiansPerMillisecond;
        return StringUtils.fillIn(symbolValueUnits, {
          symbol: symbol,
          value: value,
          units: units
        });
      });
    });
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
fourierMakingWaves.register('ComponentSpacingControl', ComponentSpacingControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwiTXVsdGlsaW5rIiwiTnVtYmVyUHJvcGVydHkiLCJSYW5nZSIsIlV0aWxzIiwibWVyZ2UiLCJTdHJpbmdVdGlscyIsIlJpY2hUZXh0IiwiVGFuZGVtIiwiRk1XQ29uc3RhbnRzIiwiRk1XU3ltYm9scyIsIkRvbWFpbiIsImZvdXJpZXJNYWtpbmdXYXZlcyIsIkZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MiLCJXYXZlUGFja2V0TnVtYmVyQ29udHJvbCIsIlRFWFRfT1BUSU9OUyIsImZvbnQiLCJUSUNLX0xBQkVMX0ZPTlQiLCJERUNJTUFMUyIsIkNvbXBvbmVudFNwYWNpbmdDb250cm9sIiwiY29uc3RydWN0b3IiLCJjb21wb25lbnRTcGFjaW5nUHJvcGVydHkiLCJkb21haW5Qcm9wZXJ0eSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJ2YWxpZFZhbHVlcyIsImRlbHRhIiwic2xpZGVyT3B0aW9ucyIsImNvbnN0cmFpblZhbHVlIiwidmFsdWUiLCJyb3VuZFN5bW1ldHJpYyIsIm1ham9yVGlja3MiLCJsYWJlbCIsInBpIiwia2V5Ym9hcmRTdGVwIiwicGFnZUtleWJvYXJkU3RlcCIsInRhbmRlbSIsIlJFUVVJUkVEIiwiZGVmYXVsdEluZGV4IiwiaW5kZXhPZiIsImNvbXBvbmVudFNwYWNpbmdJbmRleFByb3BlcnR5IiwibnVtYmVyVHlwZSIsInJhbmdlIiwibGVuZ3RoIiwibGluayIsImNvbXBvbmVudFNwYWNpbmciLCJjb21wb25lbnRTcGFjaW5nSW5kZXgiLCJtdWx0aWxpbmsiLCJrU3RyaW5nUHJvcGVydHkiLCJvbWVnYVN0cmluZ1Byb3BlcnR5IiwidW5pdHMiLCJyYWRpYW5zUGVyTWV0ZXJTdHJpbmdQcm9wZXJ0eSIsInJhZGlhbnNQZXJNaWxsaXNlY29uZFN0cmluZ1Byb3BlcnR5Iiwic3ltYm9sVmFsdWVVbml0c1N0cmluZ1Byb3BlcnR5IiwiZG9tYWluIiwiayIsIm9tZWdhIiwicmFkaWFuc1Blck1ldGVyIiwicmFkaWFuc1Blck1pbGxpc2Vjb25kIiwic3ltYm9sVmFsdWVVbml0cyIsIlNQQUNFIiwiVElNRSIsInNldE51bWJlckZvcm1hdHRlciIsInN5bWJvbCIsImZpbGxJbiIsInRvRml4ZWROdW1iZXIiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb21wb25lbnRTcGFjaW5nQ29udHJvbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb21wb25lbnRTcGFjaW5nQ29udHJvbCBjb250cm9scyB0aGUgdmFsdWUgb2YgRm91cmllciBjb21wb25lbnQgc3BhY2luZyAoazEgb3Igb21lZ2ExKS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IHsgUmljaFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgRk1XQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9GTVdDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRk1XU3ltYm9scyBmcm9tICcuLi8uLi9jb21tb24vRk1XU3ltYm9scy5qcyc7XHJcbmltcG9ydCBEb21haW4gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0RvbWFpbi5qcyc7XHJcbmltcG9ydCBmb3VyaWVyTWFraW5nV2F2ZXMgZnJvbSAnLi4vLi4vZm91cmllck1ha2luZ1dhdmVzLmpzJztcclxuaW1wb3J0IEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MgZnJvbSAnLi4vLi4vRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBXYXZlUGFja2V0TnVtYmVyQ29udHJvbCBmcm9tICcuL1dhdmVQYWNrZXROdW1iZXJDb250cm9sLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBURVhUX09QVElPTlMgPSB7IGZvbnQ6IEZNV0NvbnN0YW50cy5USUNLX0xBQkVMX0ZPTlQgfTtcclxuY29uc3QgREVDSU1BTFMgPSAyO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcG9uZW50U3BhY2luZ0NvbnRyb2wgZXh0ZW5kcyBXYXZlUGFja2V0TnVtYmVyQ29udHJvbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyUHJvcGVydHl9IGNvbXBvbmVudFNwYWNpbmdQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25Qcm9wZXJ0eS48RG9tYWluPn0gZG9tYWluUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNvbXBvbmVudFNwYWNpbmdQcm9wZXJ0eSwgZG9tYWluUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29tcG9uZW50U3BhY2luZ1Byb3BlcnR5IGluc3RhbmNlb2YgTnVtYmVyUHJvcGVydHkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbXBvbmVudFNwYWNpbmdQcm9wZXJ0eS52YWxpZFZhbHVlcyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZG9tYWluUHJvcGVydHkgaW5zdGFuY2VvZiBFbnVtZXJhdGlvblByb3BlcnR5ICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBOdW1iZXJEaXNwbGF5IG9wdGlvbnNcclxuICAgICAgZGVsdGE6IDEsIC8vIGJlY2F1c2UgdGhlIGNvbnRyb2wgaXMgc2V0dGluZyBhbiBpbmRleFxyXG5cclxuICAgICAgLy8gU2xpZGVyIG9wdGlvbnNcclxuICAgICAgc2xpZGVyT3B0aW9uczoge1xyXG4gICAgICAgIGNvbnN0cmFpblZhbHVlOiB2YWx1ZSA9PiBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmFsdWUgKSxcclxuXHJcbiAgICAgICAgLy8gQWRkIHN5bWJvbGljIHRpY2sgbWFya3MuIFRoaXMgaXMgbW9yZSBoYXJkLWNvZGVkIHRoYW4gSSdkIHByZWZlciwgYnV0IGlzIGNsZWFyIGFuZCBzdHJhaWdodGZvcndhcmQuXHJcbiAgICAgICAgLy8gSXQgd2FzIGVhc3kgdG8gY2hhbmdlIGR1cmluZyBkZXZlbG9wbWVudCwgYW5kIGlzIHN1cHBvcnRlZCBieSBhc3NlcnRpb25zIGJlbG93LlxyXG4gICAgICAgIG1ham9yVGlja3M6IFtcclxuICAgICAgICAgIHsgdmFsdWU6IDAsIGxhYmVsOiBuZXcgUmljaFRleHQoICcwJywgVEVYVF9PUFRJT05TICkgfSxcclxuICAgICAgICAgIHsgdmFsdWU6IDEsIGxhYmVsOiBuZXcgUmljaFRleHQoIGAke0ZNV1N5bWJvbHMucGl9LzRgLCBURVhUX09QVElPTlMgKSB9LFxyXG4gICAgICAgICAgeyB2YWx1ZTogMiwgbGFiZWw6IG5ldyBSaWNoVGV4dCggYCR7Rk1XU3ltYm9scy5waX0vMmAsIFRFWFRfT1BUSU9OUyApIH0sXHJcbiAgICAgICAgICB7IHZhbHVlOiAzLCBsYWJlbDogbmV3IFJpY2hUZXh0KCBgJHtGTVdTeW1ib2xzLnBpfWAsIFRFWFRfT1BUSU9OUyApIH1cclxuICAgICAgICBdLFxyXG5cclxuICAgICAgICAvLyBwZG9tIG9wdGlvbnNcclxuICAgICAgICBrZXlib2FyZFN0ZXA6IDEsIC8vIFRoaXMgaXMgc2VsZWN0aW5nIGFuIGluZGV4LCBub3QgdGhlIGFjdHVhbCB2YWx1ZS5cclxuICAgICAgICAvLyBzaGlmdEtleWJvYXJkU3RlcCBpcyBzZXQgdG8gb3B0aW9ucy5kZWx0YSBieSBOdW1iZXJDb250cm9sXHJcbiAgICAgICAgcGFnZUtleWJvYXJkU3RlcDogMVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gcGhldC1pbyBvcHRpb25zXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gY29tcG9uZW50U3BhY2luZ1Byb3BlcnR5IGhhcyBhIHNtYWxsIHNldCBvZiB2YWxpZCB2YWx1ZXMuIE9ubHkgdGhvc2UgdmFsdWVzIGFyZSB0byBiZSBzZXR0YWJsZSB2aWEgdGhpcyBTbGlkZXIsXHJcbiAgICAvLyBhbmQgdGhleSBhcmUgdG8gYmUgZGlzdHJpYnV0ZWQgYXQgZXF1YWxseS1zcGFjZSB0aWNrIG1hcmtzIG9uIHRoZSBTbGlkZXIuIFNvIHdlIGNyZWF0ZSBhbiBpbmRleCBpbnRvIHRoaXMgc2V0XHJcbiAgICAvLyBvZiB2YWx1ZXMsIGFuZCBjb250cm9sIHRoYXQgaW5kZXggd2l0aCB0aGUgU2xpZGVyLlxyXG4gICAgY29uc3QgdmFsaWRWYWx1ZXMgPSBjb21wb25lbnRTcGFjaW5nUHJvcGVydHkudmFsaWRWYWx1ZXM7XHJcbiAgICBjb25zdCBkZWZhdWx0SW5kZXggPSB2YWxpZFZhbHVlcy5pbmRleE9mKCBjb21wb25lbnRTcGFjaW5nUHJvcGVydHkudmFsdWUgKTtcclxuICAgIGNvbnN0IGNvbXBvbmVudFNwYWNpbmdJbmRleFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBkZWZhdWx0SW5kZXgsIHtcclxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInLFxyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCB2YWxpZFZhbHVlcy5sZW5ndGggLSAxIClcclxuICAgIH0gKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuc2xpZGVyT3B0aW9ucy5tYWpvclRpY2tzLmxlbmd0aCA9PT0gdmFsaWRWYWx1ZXMubGVuZ3RoLFxyXG4gICAgICAnYSB0aWNrIGlzIHJlcXVpcmVkIGZvciBlYWNoIHZhbHVlIGluIHZhbGlkVmFsdWVzJyApO1xyXG5cclxuICAgIC8vIEtlZXAgY29tcG9uZW50U3BhY2luZyBhbmQgY29tcG9uZW50U3BhY2luZ0luZGV4IGluIHN5bmNcclxuICAgIGNvbXBvbmVudFNwYWNpbmdQcm9wZXJ0eS5saW5rKCBjb21wb25lbnRTcGFjaW5nID0+IHtcclxuICAgICAgY29tcG9uZW50U3BhY2luZ0luZGV4UHJvcGVydHkudmFsdWUgPSB2YWxpZFZhbHVlcy5pbmRleE9mKCBjb21wb25lbnRTcGFjaW5nICk7XHJcbiAgICB9ICk7XHJcbiAgICBjb21wb25lbnRTcGFjaW5nSW5kZXhQcm9wZXJ0eS5saW5rKCBjb21wb25lbnRTcGFjaW5nSW5kZXggPT4ge1xyXG4gICAgICBjb21wb25lbnRTcGFjaW5nUHJvcGVydHkudmFsdWUgPSB2YWxpZFZhbHVlc1sgY29tcG9uZW50U3BhY2luZ0luZGV4IF07XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbXBvbmVudFNwYWNpbmdJbmRleFByb3BlcnR5LCBkb21haW5Qcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFNldCB0aGUgbnVtYmVyRm9ybWF0dGVyIGZvciB0aGlzIGNvbnRyb2wncyBOdW1iZXJEaXNwbGF5LlxyXG4gICAgLy8gSW4gYWRkaXRpb24gdG8gdGhlIGRvbWFpbiwgdGhpcyBpcyBkZXBlbmRlbnQgb24gYSBudW1iZXIgb2YgbG9jYWxpemVkIHN0cmluZyBQcm9wZXJ0aWVzLlxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggW1xyXG4gICAgICAgIGRvbWFpblByb3BlcnR5LFxyXG4gICAgICAgIEZNV1N5bWJvbHMua1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgIEZNV1N5bWJvbHMub21lZ2FTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLnVuaXRzLnJhZGlhbnNQZXJNZXRlclN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgIEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MudW5pdHMucmFkaWFuc1Blck1pbGxpc2Vjb25kU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5zeW1ib2xWYWx1ZVVuaXRzU3RyaW5nUHJvcGVydHlcclxuICAgICAgXSxcclxuICAgICAgKCBkb21haW4sIGssIG9tZWdhLCByYWRpYW5zUGVyTWV0ZXIsIHJhZGlhbnNQZXJNaWxsaXNlY29uZCwgc3ltYm9sVmFsdWVVbml0cyApID0+IHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb21haW4gPT09IERvbWFpbi5TUEFDRSB8fCBkb21haW4gPT09IERvbWFpbi5USU1FICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0TnVtYmVyRm9ybWF0dGVyKCBjb21wb25lbnRTcGFjaW5nSW5kZXggPT4ge1xyXG5cclxuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudFNwYWNpbmcgPSBjb21wb25lbnRTcGFjaW5nUHJvcGVydHkudmFsaWRWYWx1ZXNbIGNvbXBvbmVudFNwYWNpbmdJbmRleCBdO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHN5bWJvbCA9IFN0cmluZ1V0aWxzLmZpbGxJbiggJ3t7c3ltYm9sfX08c3ViPjE8L3N1Yj4nLCB7XHJcbiAgICAgICAgICAgIHN5bWJvbDogKCBkb21haW4gPT09IERvbWFpbi5TUEFDRSApID8gayA6IG9tZWdhXHJcbiAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgLy8gVXNpbmcgdG9GaXhlZE51bWJlciByZW1vdmVzIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBVdGlscy50b0ZpeGVkTnVtYmVyKCBjb21wb25lbnRTcGFjaW5nLCBERUNJTUFMUyApO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHVuaXRzID0gKCBkb21haW4gPT09IERvbWFpbi5TUEFDRSApID8gcmFkaWFuc1Blck1ldGVyIDogcmFkaWFuc1Blck1pbGxpc2Vjb25kO1xyXG5cclxuICAgICAgICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHN5bWJvbFZhbHVlVW5pdHMsIHtcclxuICAgICAgICAgICAgc3ltYm9sOiBzeW1ib2wsXHJcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgdW5pdHM6IHVuaXRzXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZm91cmllck1ha2luZ1dhdmVzLnJlZ2lzdGVyKCAnQ29tcG9uZW50U3BhY2luZ0NvbnRyb2wnLCBDb21wb25lbnRTcGFjaW5nQ29udHJvbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxtQkFBbUIsTUFBTSw0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