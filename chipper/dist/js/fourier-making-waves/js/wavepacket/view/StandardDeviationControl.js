// Copyright 2021-2023, University of Colorado Boulder

/**
 * StandardDeviationControl controls the standard deviation, a measure of the wave packet's width.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { RichText } from '../../../../scenery/js/imports.js';
import FMWConstants from '../../common/FMWConstants.js';
import FMWSymbols from '../../common/FMWSymbols.js';
import Domain from '../../common/model/Domain.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FourierMakingWavesStrings from '../../FourierMakingWavesStrings.js';
import WavePacketNumberControl from './WavePacketNumberControl.js';

// constants
const DELTA = 0.01;
const DECIMALS = Utils.numberOfDecimalPlaces(DELTA);
const TEXT_OPTIONS = {
  font: FMWConstants.TICK_LABEL_FONT
};
export default class StandardDeviationControl extends WavePacketNumberControl {
  /**
   * @param {NumberProperty} standardDeviationProperty
   * @param {EnumerationProperty.<Domain>} domainProperty
   * @param {Object} [options]
   */
  constructor(standardDeviationProperty, domainProperty, options) {
    assert && assert(standardDeviationProperty instanceof NumberProperty);
    assert && assert(domainProperty instanceof EnumerationProperty);
    options = merge({
      // NumberDisplay options
      delta: DELTA,
      // Slider options
      sliderOptions: {
        // Add symbolic tick marks. This is more hard-coded than I'd prefer, but is clear and straightforward.
        // It was easy to change during development, and is supported by the assertions below.
        majorTicks: [{
          value: Math.PI,
          label: new RichText(`${FMWSymbols.pi}`, TEXT_OPTIONS)
        }, {
          value: 2 * Math.PI,
          label: new RichText(`2${FMWSymbols.pi}`, TEXT_OPTIONS)
        }, {
          value: 3 * Math.PI,
          label: new RichText(`3${FMWSymbols.pi}`, TEXT_OPTIONS)
        }, {
          value: 4 * Math.PI,
          label: new RichText(`4${FMWSymbols.pi}`, TEXT_OPTIONS)
        }],
        // pdom options
        keyboardStep: Math.PI / 4,
        // shiftKeyboardStep is set to options.delta by NumberControl
        pageKeyboardStep: Math.PI / 2
      }
    }, options);
    assert && assert(_.every(options.sliderOptions.majorTicks, tick => standardDeviationProperty.range.contains(tick.value)), 'a tick mark is out of range');
    assert && assert(options.sliderOptions.majorTicks[0].value === standardDeviationProperty.range.min, 'first tick must me range.min');
    assert && assert(options.sliderOptions.majorTicks[options.sliderOptions.majorTicks.length - 1].value === standardDeviationProperty.range.max, 'last tick must be range.max');
    super(standardDeviationProperty, domainProperty, options);

    // Set the numberFormatter for this control's NumberDisplay.
    // In addition to the domain, this is dependent on a number of localized string Properties.
    Multilink.multilink([domainProperty, FMWSymbols.sigmaStringProperty, FMWSymbols.kStringProperty, FMWSymbols.omegaStringProperty, FourierMakingWavesStrings.units.radiansPerMeterStringProperty, FourierMakingWavesStrings.units.radiansPerMillisecondStringProperty, FourierMakingWavesStrings.symbolValueUnitsStringProperty], (domain, sigma, k, omega, radiansPerMeter, radiansPerMillisecond, symbolValueUnits) => {
      assert && assert(domain === Domain.SPACE || domain === Domain.TIME);
      this.setNumberFormatter(standardDeviation => {
        const symbol = StringUtils.fillIn('{{symbol}}<sub>{{subscript}}</sub>', {
          symbol: sigma,
          subscript: domain === Domain.SPACE ? k : omega
        });

        // Using toFixedNumber removes trailing zeros.
        const value = Utils.toFixedNumber(standardDeviation, DECIMALS);
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
fourierMakingWaves.register('StandardDeviationControl', StandardDeviationControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwiTXVsdGlsaW5rIiwiTnVtYmVyUHJvcGVydHkiLCJVdGlscyIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJSaWNoVGV4dCIsIkZNV0NvbnN0YW50cyIsIkZNV1N5bWJvbHMiLCJEb21haW4iLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzIiwiV2F2ZVBhY2tldE51bWJlckNvbnRyb2wiLCJERUxUQSIsIkRFQ0lNQUxTIiwibnVtYmVyT2ZEZWNpbWFsUGxhY2VzIiwiVEVYVF9PUFRJT05TIiwiZm9udCIsIlRJQ0tfTEFCRUxfRk9OVCIsIlN0YW5kYXJkRGV2aWF0aW9uQ29udHJvbCIsImNvbnN0cnVjdG9yIiwic3RhbmRhcmREZXZpYXRpb25Qcm9wZXJ0eSIsImRvbWFpblByb3BlcnR5Iiwib3B0aW9ucyIsImFzc2VydCIsImRlbHRhIiwic2xpZGVyT3B0aW9ucyIsIm1ham9yVGlja3MiLCJ2YWx1ZSIsIk1hdGgiLCJQSSIsImxhYmVsIiwicGkiLCJrZXlib2FyZFN0ZXAiLCJwYWdlS2V5Ym9hcmRTdGVwIiwiXyIsImV2ZXJ5IiwidGljayIsInJhbmdlIiwiY29udGFpbnMiLCJtaW4iLCJsZW5ndGgiLCJtYXgiLCJtdWx0aWxpbmsiLCJzaWdtYVN0cmluZ1Byb3BlcnR5Iiwia1N0cmluZ1Byb3BlcnR5Iiwib21lZ2FTdHJpbmdQcm9wZXJ0eSIsInVuaXRzIiwicmFkaWFuc1Blck1ldGVyU3RyaW5nUHJvcGVydHkiLCJyYWRpYW5zUGVyTWlsbGlzZWNvbmRTdHJpbmdQcm9wZXJ0eSIsInN5bWJvbFZhbHVlVW5pdHNTdHJpbmdQcm9wZXJ0eSIsImRvbWFpbiIsInNpZ21hIiwiayIsIm9tZWdhIiwicmFkaWFuc1Blck1ldGVyIiwicmFkaWFuc1Blck1pbGxpc2Vjb25kIiwic3ltYm9sVmFsdWVVbml0cyIsIlNQQUNFIiwiVElNRSIsInNldE51bWJlckZvcm1hdHRlciIsInN0YW5kYXJkRGV2aWF0aW9uIiwic3ltYm9sIiwiZmlsbEluIiwic3Vic2NyaXB0IiwidG9GaXhlZE51bWJlciIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN0YW5kYXJkRGV2aWF0aW9uQ29udHJvbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTdGFuZGFyZERldmlhdGlvbkNvbnRyb2wgY29udHJvbHMgdGhlIHN0YW5kYXJkIGRldmlhdGlvbiwgYSBtZWFzdXJlIG9mIHRoZSB3YXZlIHBhY2tldCdzIHdpZHRoLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCB7IFJpY2hUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEZNV0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRk1XQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEZNV1N5bWJvbHMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV1N5bWJvbHMuanMnO1xyXG5pbXBvcnQgRG9tYWluIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Eb21haW4uanMnO1xyXG5pbXBvcnQgZm91cmllck1ha2luZ1dhdmVzIGZyb20gJy4uLy4uL2ZvdXJpZXJNYWtpbmdXYXZlcy5qcyc7XHJcbmltcG9ydCBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzIGZyb20gJy4uLy4uL0ZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgV2F2ZVBhY2tldE51bWJlckNvbnRyb2wgZnJvbSAnLi9XYXZlUGFja2V0TnVtYmVyQ29udHJvbC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgREVMVEEgPSAwLjAxO1xyXG5jb25zdCBERUNJTUFMUyA9IFV0aWxzLm51bWJlck9mRGVjaW1hbFBsYWNlcyggREVMVEEgKTtcclxuY29uc3QgVEVYVF9PUFRJT05TID0geyBmb250OiBGTVdDb25zdGFudHMuVElDS19MQUJFTF9GT05UIH07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFuZGFyZERldmlhdGlvbkNvbnRyb2wgZXh0ZW5kcyBXYXZlUGFja2V0TnVtYmVyQ29udHJvbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyUHJvcGVydHl9IHN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge0VudW1lcmF0aW9uUHJvcGVydHkuPERvbWFpbj59IGRvbWFpblByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzdGFuZGFyZERldmlhdGlvblByb3BlcnR5LCBkb21haW5Qcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdGFuZGFyZERldmlhdGlvblByb3BlcnR5IGluc3RhbmNlb2YgTnVtYmVyUHJvcGVydHkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvbWFpblByb3BlcnR5IGluc3RhbmNlb2YgRW51bWVyYXRpb25Qcm9wZXJ0eSApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8gTnVtYmVyRGlzcGxheSBvcHRpb25zXHJcbiAgICAgIGRlbHRhOiBERUxUQSxcclxuXHJcbiAgICAgIC8vIFNsaWRlciBvcHRpb25zXHJcbiAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuXHJcbiAgICAgICAgLy8gQWRkIHN5bWJvbGljIHRpY2sgbWFya3MuIFRoaXMgaXMgbW9yZSBoYXJkLWNvZGVkIHRoYW4gSSdkIHByZWZlciwgYnV0IGlzIGNsZWFyIGFuZCBzdHJhaWdodGZvcndhcmQuXHJcbiAgICAgICAgLy8gSXQgd2FzIGVhc3kgdG8gY2hhbmdlIGR1cmluZyBkZXZlbG9wbWVudCwgYW5kIGlzIHN1cHBvcnRlZCBieSB0aGUgYXNzZXJ0aW9ucyBiZWxvdy5cclxuICAgICAgICBtYWpvclRpY2tzOiBbXHJcbiAgICAgICAgICB7IHZhbHVlOiBNYXRoLlBJLCBsYWJlbDogbmV3IFJpY2hUZXh0KCBgJHtGTVdTeW1ib2xzLnBpfWAsIFRFWFRfT1BUSU9OUyApIH0sXHJcbiAgICAgICAgICB7IHZhbHVlOiAyICogTWF0aC5QSSwgbGFiZWw6IG5ldyBSaWNoVGV4dCggYDIke0ZNV1N5bWJvbHMucGl9YCwgVEVYVF9PUFRJT05TICkgfSxcclxuICAgICAgICAgIHsgdmFsdWU6IDMgKiBNYXRoLlBJLCBsYWJlbDogbmV3IFJpY2hUZXh0KCBgMyR7Rk1XU3ltYm9scy5waX1gLCBURVhUX09QVElPTlMgKSB9LFxyXG4gICAgICAgICAgeyB2YWx1ZTogNCAqIE1hdGguUEksIGxhYmVsOiBuZXcgUmljaFRleHQoIGA0JHtGTVdTeW1ib2xzLnBpfWAsIFRFWFRfT1BUSU9OUyApIH1cclxuICAgICAgICBdLFxyXG5cclxuICAgICAgICAvLyBwZG9tIG9wdGlvbnNcclxuICAgICAgICBrZXlib2FyZFN0ZXA6IE1hdGguUEkgLyA0LFxyXG4gICAgICAgIC8vIHNoaWZ0S2V5Ym9hcmRTdGVwIGlzIHNldCB0byBvcHRpb25zLmRlbHRhIGJ5IE51bWJlckNvbnRyb2xcclxuICAgICAgICBwYWdlS2V5Ym9hcmRTdGVwOiBNYXRoLlBJIC8gMlxyXG4gICAgICB9XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggb3B0aW9ucy5zbGlkZXJPcHRpb25zLm1ham9yVGlja3MsIHRpY2sgPT4gc3RhbmRhcmREZXZpYXRpb25Qcm9wZXJ0eS5yYW5nZS5jb250YWlucyggdGljay52YWx1ZSApICksXHJcbiAgICAgICdhIHRpY2sgbWFyayBpcyBvdXQgb2YgcmFuZ2UnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnNsaWRlck9wdGlvbnMubWFqb3JUaWNrc1sgMCBdLnZhbHVlID09PSBzdGFuZGFyZERldmlhdGlvblByb3BlcnR5LnJhbmdlLm1pbixcclxuICAgICAgJ2ZpcnN0IHRpY2sgbXVzdCBtZSByYW5nZS5taW4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnNsaWRlck9wdGlvbnMubWFqb3JUaWNrc1sgb3B0aW9ucy5zbGlkZXJPcHRpb25zLm1ham9yVGlja3MubGVuZ3RoIC0gMSBdLnZhbHVlID09PSBzdGFuZGFyZERldmlhdGlvblByb3BlcnR5LnJhbmdlLm1heCxcclxuICAgICAgJ2xhc3QgdGljayBtdXN0IGJlIHJhbmdlLm1heCcgKTtcclxuXHJcbiAgICBzdXBlciggc3RhbmRhcmREZXZpYXRpb25Qcm9wZXJ0eSwgZG9tYWluUHJvcGVydHksIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIG51bWJlckZvcm1hdHRlciBmb3IgdGhpcyBjb250cm9sJ3MgTnVtYmVyRGlzcGxheS5cclxuICAgIC8vIEluIGFkZGl0aW9uIHRvIHRoZSBkb21haW4sIHRoaXMgaXMgZGVwZW5kZW50IG9uIGEgbnVtYmVyIG9mIGxvY2FsaXplZCBzdHJpbmcgUHJvcGVydGllcy5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFtcclxuICAgICAgICBkb21haW5Qcm9wZXJ0eSxcclxuICAgICAgICBGTVdTeW1ib2xzLnNpZ21hU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgRk1XU3ltYm9scy5rU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgRk1XU3ltYm9scy5vbWVnYVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgIEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MudW5pdHMucmFkaWFuc1Blck1ldGVyU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy51bml0cy5yYWRpYW5zUGVyTWlsbGlzZWNvbmRTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLnN5bWJvbFZhbHVlVW5pdHNTdHJpbmdQcm9wZXJ0eVxyXG4gICAgICBdLFxyXG4gICAgICAoIGRvbWFpbiwgc2lnbWEsIGssIG9tZWdhLCByYWRpYW5zUGVyTWV0ZXIsIHJhZGlhbnNQZXJNaWxsaXNlY29uZCwgc3ltYm9sVmFsdWVVbml0cyApID0+IHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb21haW4gPT09IERvbWFpbi5TUEFDRSB8fCBkb21haW4gPT09IERvbWFpbi5USU1FICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0TnVtYmVyRm9ybWF0dGVyKCBzdGFuZGFyZERldmlhdGlvbiA9PiB7XHJcblxyXG4gICAgICAgICAgY29uc3Qgc3ltYm9sID0gU3RyaW5nVXRpbHMuZmlsbEluKCAne3tzeW1ib2x9fTxzdWI+e3tzdWJzY3JpcHR9fTwvc3ViPicsIHtcclxuICAgICAgICAgICAgc3ltYm9sOiBzaWdtYSxcclxuICAgICAgICAgICAgc3Vic2NyaXB0OiAoIGRvbWFpbiA9PT0gRG9tYWluLlNQQUNFICkgPyBrIDogb21lZ2FcclxuICAgICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgICAvLyBVc2luZyB0b0ZpeGVkTnVtYmVyIHJlbW92ZXMgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IFV0aWxzLnRvRml4ZWROdW1iZXIoIHN0YW5kYXJkRGV2aWF0aW9uLCBERUNJTUFMUyApO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHVuaXRzID0gKCBkb21haW4gPT09IERvbWFpbi5TUEFDRSApID8gcmFkaWFuc1Blck1ldGVyIDogcmFkaWFuc1Blck1pbGxpc2Vjb25kO1xyXG5cclxuICAgICAgICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHN5bWJvbFZhbHVlVW5pdHMsIHtcclxuICAgICAgICAgICAgc3ltYm9sOiBzeW1ib2wsXHJcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgdW5pdHM6IHVuaXRzXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZm91cmllck1ha2luZ1dhdmVzLnJlZ2lzdGVyKCAnU3RhbmRhcmREZXZpYXRpb25Db250cm9sJywgU3RhbmRhcmREZXZpYXRpb25Db250cm9sICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLG1CQUFtQixNQUFNLDRDQUE0QztBQUM1RSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsU0FBU0MsUUFBUSxRQUFRLG1DQUFtQztBQUM1RCxPQUFPQyxZQUFZLE1BQU0sOEJBQThCO0FBQ3ZELE9BQU9DLFVBQVUsTUFBTSw0QkFBNEI7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MseUJBQXlCLE1BQU0sb0NBQW9DO0FBQzFFLE9BQU9DLHVCQUF1QixNQUFNLDhCQUE4Qjs7QUFFbEU7QUFDQSxNQUFNQyxLQUFLLEdBQUcsSUFBSTtBQUNsQixNQUFNQyxRQUFRLEdBQUdYLEtBQUssQ0FBQ1kscUJBQXFCLENBQUVGLEtBQU0sQ0FBQztBQUNyRCxNQUFNRyxZQUFZLEdBQUc7RUFBRUMsSUFBSSxFQUFFVixZQUFZLENBQUNXO0FBQWdCLENBQUM7QUFFM0QsZUFBZSxNQUFNQyx3QkFBd0IsU0FBU1AsdUJBQXVCLENBQUM7RUFFNUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFUSxXQUFXQSxDQUFFQyx5QkFBeUIsRUFBRUMsY0FBYyxFQUFFQyxPQUFPLEVBQUc7SUFFaEVDLE1BQU0sSUFBSUEsTUFBTSxDQUFFSCx5QkFBeUIsWUFBWW5CLGNBQWUsQ0FBQztJQUN2RXNCLE1BQU0sSUFBSUEsTUFBTSxDQUFFRixjQUFjLFlBQVl0QixtQkFBb0IsQ0FBQztJQUVqRXVCLE9BQU8sR0FBR25CLEtBQUssQ0FBRTtNQUVmO01BQ0FxQixLQUFLLEVBQUVaLEtBQUs7TUFFWjtNQUNBYSxhQUFhLEVBQUU7UUFFYjtRQUNBO1FBQ0FDLFVBQVUsRUFBRSxDQUNWO1VBQUVDLEtBQUssRUFBRUMsSUFBSSxDQUFDQyxFQUFFO1VBQUVDLEtBQUssRUFBRSxJQUFJekIsUUFBUSxDQUFHLEdBQUVFLFVBQVUsQ0FBQ3dCLEVBQUcsRUFBQyxFQUFFaEIsWUFBYTtRQUFFLENBQUMsRUFDM0U7VUFBRVksS0FBSyxFQUFFLENBQUMsR0FBR0MsSUFBSSxDQUFDQyxFQUFFO1VBQUVDLEtBQUssRUFBRSxJQUFJekIsUUFBUSxDQUFHLElBQUdFLFVBQVUsQ0FBQ3dCLEVBQUcsRUFBQyxFQUFFaEIsWUFBYTtRQUFFLENBQUMsRUFDaEY7VUFBRVksS0FBSyxFQUFFLENBQUMsR0FBR0MsSUFBSSxDQUFDQyxFQUFFO1VBQUVDLEtBQUssRUFBRSxJQUFJekIsUUFBUSxDQUFHLElBQUdFLFVBQVUsQ0FBQ3dCLEVBQUcsRUFBQyxFQUFFaEIsWUFBYTtRQUFFLENBQUMsRUFDaEY7VUFBRVksS0FBSyxFQUFFLENBQUMsR0FBR0MsSUFBSSxDQUFDQyxFQUFFO1VBQUVDLEtBQUssRUFBRSxJQUFJekIsUUFBUSxDQUFHLElBQUdFLFVBQVUsQ0FBQ3dCLEVBQUcsRUFBQyxFQUFFaEIsWUFBYTtRQUFFLENBQUMsQ0FDakY7UUFFRDtRQUNBaUIsWUFBWSxFQUFFSixJQUFJLENBQUNDLEVBQUUsR0FBRyxDQUFDO1FBQ3pCO1FBQ0FJLGdCQUFnQixFQUFFTCxJQUFJLENBQUNDLEVBQUUsR0FBRztNQUM5QjtJQUNGLENBQUMsRUFBRVAsT0FBUSxDQUFDO0lBRVpDLE1BQU0sSUFBSUEsTUFBTSxDQUFFVyxDQUFDLENBQUNDLEtBQUssQ0FBRWIsT0FBTyxDQUFDRyxhQUFhLENBQUNDLFVBQVUsRUFBRVUsSUFBSSxJQUFJaEIseUJBQXlCLENBQUNpQixLQUFLLENBQUNDLFFBQVEsQ0FBRUYsSUFBSSxDQUFDVCxLQUFNLENBQUUsQ0FBQyxFQUMzSCw2QkFBOEIsQ0FBQztJQUNqQ0osTUFBTSxJQUFJQSxNQUFNLENBQUVELE9BQU8sQ0FBQ0csYUFBYSxDQUFDQyxVQUFVLENBQUUsQ0FBQyxDQUFFLENBQUNDLEtBQUssS0FBS1AseUJBQXlCLENBQUNpQixLQUFLLENBQUNFLEdBQUcsRUFDbkcsOEJBQStCLENBQUM7SUFDbENoQixNQUFNLElBQUlBLE1BQU0sQ0FBRUQsT0FBTyxDQUFDRyxhQUFhLENBQUNDLFVBQVUsQ0FBRUosT0FBTyxDQUFDRyxhQUFhLENBQUNDLFVBQVUsQ0FBQ2MsTUFBTSxHQUFHLENBQUMsQ0FBRSxDQUFDYixLQUFLLEtBQUtQLHlCQUF5QixDQUFDaUIsS0FBSyxDQUFDSSxHQUFHLEVBQzdJLDZCQUE4QixDQUFDO0lBRWpDLEtBQUssQ0FBRXJCLHlCQUF5QixFQUFFQyxjQUFjLEVBQUVDLE9BQVEsQ0FBQzs7SUFFM0Q7SUFDQTtJQUNBdEIsU0FBUyxDQUFDMEMsU0FBUyxDQUFFLENBQ2pCckIsY0FBYyxFQUNkZCxVQUFVLENBQUNvQyxtQkFBbUIsRUFDOUJwQyxVQUFVLENBQUNxQyxlQUFlLEVBQzFCckMsVUFBVSxDQUFDc0MsbUJBQW1CLEVBQzlCbkMseUJBQXlCLENBQUNvQyxLQUFLLENBQUNDLDZCQUE2QixFQUM3RHJDLHlCQUF5QixDQUFDb0MsS0FBSyxDQUFDRSxtQ0FBbUMsRUFDbkV0Qyx5QkFBeUIsQ0FBQ3VDLDhCQUE4QixDQUN6RCxFQUNELENBQUVDLE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxDQUFDLEVBQUVDLEtBQUssRUFBRUMsZUFBZSxFQUFFQyxxQkFBcUIsRUFBRUMsZ0JBQWdCLEtBQU07TUFDdkZqQyxNQUFNLElBQUlBLE1BQU0sQ0FBRTJCLE1BQU0sS0FBSzFDLE1BQU0sQ0FBQ2lELEtBQUssSUFBSVAsTUFBTSxLQUFLMUMsTUFBTSxDQUFDa0QsSUFBSyxDQUFDO01BRXJFLElBQUksQ0FBQ0Msa0JBQWtCLENBQUVDLGlCQUFpQixJQUFJO1FBRTVDLE1BQU1DLE1BQU0sR0FBR3pELFdBQVcsQ0FBQzBELE1BQU0sQ0FBRSxvQ0FBb0MsRUFBRTtVQUN2RUQsTUFBTSxFQUFFVixLQUFLO1VBQ2JZLFNBQVMsRUFBSWIsTUFBTSxLQUFLMUMsTUFBTSxDQUFDaUQsS0FBSyxHQUFLTCxDQUFDLEdBQUdDO1FBQy9DLENBQUUsQ0FBQzs7UUFFSDtRQUNBLE1BQU0xQixLQUFLLEdBQUd6QixLQUFLLENBQUM4RCxhQUFhLENBQUVKLGlCQUFpQixFQUFFL0MsUUFBUyxDQUFDO1FBRWhFLE1BQU1pQyxLQUFLLEdBQUtJLE1BQU0sS0FBSzFDLE1BQU0sQ0FBQ2lELEtBQUssR0FBS0gsZUFBZSxHQUFHQyxxQkFBcUI7UUFFbkYsT0FBT25ELFdBQVcsQ0FBQzBELE1BQU0sQ0FBRU4sZ0JBQWdCLEVBQUU7VUFDM0NLLE1BQU0sRUFBRUEsTUFBTTtVQUNkbEMsS0FBSyxFQUFFQSxLQUFLO1VBQ1ptQixLQUFLLEVBQUVBO1FBQ1QsQ0FBRSxDQUFDO01BQ0wsQ0FBRSxDQUFDO0lBQ0wsQ0FBRSxDQUFDO0VBQ1A7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRW1CLE9BQU9BLENBQUEsRUFBRztJQUNSMUMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQzBDLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQXhELGtCQUFrQixDQUFDeUQsUUFBUSxDQUFFLDBCQUEwQixFQUFFaEQsd0JBQXlCLENBQUMifQ==