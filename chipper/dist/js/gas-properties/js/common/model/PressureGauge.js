// Copyright 2018-2022, University of Colorado Boulder

/**
 * PressureGauge is the model of the pressure gauge. It is responsible for determining what units will be used to
 * present the pressure, and for deriving pressure in those units. Optionally adds a bit of noise to the displayed
 * values, to make the gauge look more realistic.
 *
 * NOTE: In #111 (code review), it was noted that this class has "a fair likelihood of being reused". If you do
 * reuse this class, you will need to add support for dispose.  It is not included here because instances of this
 * class persist for the lifetime of the sim, as noted in implementation-notes.md.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Range from '../../../../dot/js/Range.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesConstants from '../GasPropertiesConstants.js';
import GasPropertiesQueryParameters from '../GasPropertiesQueryParameters.js';
import GasPropertiesPreferences from './GasPropertiesPreferences.js';
import { PressureUnitsValues } from './PressureUnits.js';

// constants
const MAX_PRESSURE = GasPropertiesQueryParameters.maxPressure; // kPa
const MIN_NOISE = 0; // minimum amount of noise, in kPa
const MAX_NOISE = 50; // maximum amount of noise, in kPa
assert && assert(MIN_NOISE < MAX_NOISE, 'MIN_NOISE must be < MAX_NOISE');
export default class PressureGauge {
  // pressure in the container, in kPa

  // temperature in the container, in K, null if empty container

  // quantity to be held constant, influences noise

  // pressure in kPa, with noise added

  // pressure in atmospheres (atm), with noise added

  // pressure range in kPa

  // amount of noise in kPa is inversely proportional to pressure, so more noise at lower pressure

  // map from temperature (K) to noise scale factor, so that noise falls off at low temperatures

  // pressure units displayed by the pressure gauge

  // The display is refreshed at this interval, in ps
  static REFRESH_PERIOD = 0.75;
  constructor(pressureProperty, temperatureProperty, holdConstantProperty, tandem) {
    this.pressureProperty = pressureProperty;
    this.temperatureProperty = temperatureProperty;
    this.holdConstantProperty = holdConstantProperty;

    // This is not derived from pressureProperty, because it needs to add noise on step, not when pressureProperty changes.
    this.pressureKilopascalsProperty = new NumberProperty(pressureProperty.value, {
      units: 'kPa',
      isValidValue: value => value >= 0,
      tandem: tandem.createTandem('pressureKilopascalsProperty'),
      phetioReadOnly: true,
      // value is derived from pressureProperty on step, with noise added
      phetioDocumentation: 'pressure in K, with optional noise added'
    });

    // When pressure goes to zero, update the gauge immediately.
    pressureProperty.link(pressure => {
      if (pressure === 0) {
        this.pressureKilopascalsProperty.value = 0;
      }
    });
    this.pressureAtmospheresProperty = new DerivedProperty([this.pressureKilopascalsProperty], pressureKilopascals => pressureKilopascals * GasPropertiesConstants.ATM_PER_KPA, {
      units: 'atm',
      isValidValue: value => value >= 0,
      valueType: 'number',
      phetioValueType: NumberIO,
      tandem: tandem.createTandem('pressureAtmospheresProperty'),
      phetioDocumentation: 'pressure in atm, with optional noise added'
    });
    this.pressureRange = new Range(0, MAX_PRESSURE);
    this.pressureNoiseFunction = new LinearFunction(0, this.pressureRange.max, MAX_NOISE, MIN_NOISE, true);
    this.scaleNoiseFunction = new LinearFunction(5, 50, 0, 1, true /* clamp */);

    this.unitsProperty = new StringUnionProperty('atmospheres', {
      validValues: PressureUnitsValues,
      tandem: tandem.createTandem('unitsProperty'),
      phetioDocumentation: 'units displayed by the pressure gauge'
    });
    this.dtAccumulator = 0;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
  reset() {
    this.unitsProperty.reset();
    this.dtAccumulator = 0;
  }

  /**
   * Steps the pressure gauge.
   * @param dt - time step, in ps
   */
  step(dt) {
    assert && assert(dt > 0, `invalid dt: ${dt}`);
    this.dtAccumulator += dt;
    if (this.dtAccumulator >= PressureGauge.REFRESH_PERIOD) {
      // Are we in a mode that holds pressure constant?
      const constantPressure = this.holdConstantProperty.value === 'pressureT' || this.holdConstantProperty.value === 'pressureV';

      // Disable noise when pressure is held constant, or via global options.
      const noiseEnabled = !constantPressure && GasPropertiesPreferences.pressureNoiseProperty.value;

      // Add noise (kPa) to the displayed value
      let noise = 0;
      if (noiseEnabled) {
        // compute noise
        noise = this.pressureNoiseFunction.evaluate(this.pressureProperty.value) * this.scaleNoiseFunction.evaluate(this.temperatureProperty.value || 0) * dotRandom.nextDouble();

        // randomly apply a sign if doing so doesn't make the pressure become <= 0
        if (noise < this.pressureProperty.value) {
          noise *= dotRandom.nextBoolean() ? 1 : -1;
        }
      }
      this.pressureKilopascalsProperty.value = this.pressureProperty.value + noise;
      this.dtAccumulator = 0;
    }
  }
}
gasProperties.register('PressureGauge', PressureGauge);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlN0cmluZ1VuaW9uUHJvcGVydHkiLCJkb3RSYW5kb20iLCJMaW5lYXJGdW5jdGlvbiIsIlJhbmdlIiwiTnVtYmVySU8iLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc0NvbnN0YW50cyIsIkdhc1Byb3BlcnRpZXNRdWVyeVBhcmFtZXRlcnMiLCJHYXNQcm9wZXJ0aWVzUHJlZmVyZW5jZXMiLCJQcmVzc3VyZVVuaXRzVmFsdWVzIiwiTUFYX1BSRVNTVVJFIiwibWF4UHJlc3N1cmUiLCJNSU5fTk9JU0UiLCJNQVhfTk9JU0UiLCJhc3NlcnQiLCJQcmVzc3VyZUdhdWdlIiwiUkVGUkVTSF9QRVJJT0QiLCJjb25zdHJ1Y3RvciIsInByZXNzdXJlUHJvcGVydHkiLCJ0ZW1wZXJhdHVyZVByb3BlcnR5IiwiaG9sZENvbnN0YW50UHJvcGVydHkiLCJ0YW5kZW0iLCJwcmVzc3VyZUtpbG9wYXNjYWxzUHJvcGVydHkiLCJ2YWx1ZSIsInVuaXRzIiwiaXNWYWxpZFZhbHVlIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwibGluayIsInByZXNzdXJlIiwicHJlc3N1cmVBdG1vc3BoZXJlc1Byb3BlcnR5IiwicHJlc3N1cmVLaWxvcGFzY2FscyIsIkFUTV9QRVJfS1BBIiwidmFsdWVUeXBlIiwicGhldGlvVmFsdWVUeXBlIiwicHJlc3N1cmVSYW5nZSIsInByZXNzdXJlTm9pc2VGdW5jdGlvbiIsIm1heCIsInNjYWxlTm9pc2VGdW5jdGlvbiIsInVuaXRzUHJvcGVydHkiLCJ2YWxpZFZhbHVlcyIsImR0QWNjdW11bGF0b3IiLCJkaXNwb3NlIiwicmVzZXQiLCJzdGVwIiwiZHQiLCJjb25zdGFudFByZXNzdXJlIiwibm9pc2VFbmFibGVkIiwicHJlc3N1cmVOb2lzZVByb3BlcnR5Iiwibm9pc2UiLCJldmFsdWF0ZSIsIm5leHREb3VibGUiLCJuZXh0Qm9vbGVhbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUHJlc3N1cmVHYXVnZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQcmVzc3VyZUdhdWdlIGlzIHRoZSBtb2RlbCBvZiB0aGUgcHJlc3N1cmUgZ2F1Z2UuIEl0IGlzIHJlc3BvbnNpYmxlIGZvciBkZXRlcm1pbmluZyB3aGF0IHVuaXRzIHdpbGwgYmUgdXNlZCB0b1xyXG4gKiBwcmVzZW50IHRoZSBwcmVzc3VyZSwgYW5kIGZvciBkZXJpdmluZyBwcmVzc3VyZSBpbiB0aG9zZSB1bml0cy4gT3B0aW9uYWxseSBhZGRzIGEgYml0IG9mIG5vaXNlIHRvIHRoZSBkaXNwbGF5ZWRcclxuICogdmFsdWVzLCB0byBtYWtlIHRoZSBnYXVnZSBsb29rIG1vcmUgcmVhbGlzdGljLlxyXG4gKlxyXG4gKiBOT1RFOiBJbiAjMTExIChjb2RlIHJldmlldyksIGl0IHdhcyBub3RlZCB0aGF0IHRoaXMgY2xhc3MgaGFzIFwiYSBmYWlyIGxpa2VsaWhvb2Qgb2YgYmVpbmcgcmV1c2VkXCIuIElmIHlvdSBkb1xyXG4gKiByZXVzZSB0aGlzIGNsYXNzLCB5b3Ugd2lsbCBuZWVkIHRvIGFkZCBzdXBwb3J0IGZvciBkaXNwb3NlLiAgSXQgaXMgbm90IGluY2x1ZGVkIGhlcmUgYmVjYXVzZSBpbnN0YW5jZXMgb2YgdGhpc1xyXG4gKiBjbGFzcyBwZXJzaXN0IGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbSwgYXMgbm90ZWQgaW4gaW1wbGVtZW50YXRpb24tbm90ZXMubWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaW5nVW5pb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1N0cmluZ1VuaW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBMaW5lYXJGdW5jdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTGluZWFyRnVuY3Rpb24uanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBnYXNQcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2dhc1Byb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgR2FzUHJvcGVydGllc0NvbnN0YW50cyBmcm9tICcuLi9HYXNQcm9wZXJ0aWVzQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vR2FzUHJvcGVydGllc1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzUHJlZmVyZW5jZXMgZnJvbSAnLi9HYXNQcm9wZXJ0aWVzUHJlZmVyZW5jZXMuanMnO1xyXG5pbXBvcnQgeyBIb2xkQ29uc3RhbnQgfSBmcm9tICcuL0hvbGRDb25zdGFudC5qcyc7XHJcbmltcG9ydCB7IFByZXNzdXJlVW5pdHMsIFByZXNzdXJlVW5pdHNWYWx1ZXMgfSBmcm9tICcuL1ByZXNzdXJlVW5pdHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1BWF9QUkVTU1VSRSA9IEdhc1Byb3BlcnRpZXNRdWVyeVBhcmFtZXRlcnMubWF4UHJlc3N1cmU7IC8vIGtQYVxyXG5jb25zdCBNSU5fTk9JU0UgPSAwOyAvLyBtaW5pbXVtIGFtb3VudCBvZiBub2lzZSwgaW4ga1BhXHJcbmNvbnN0IE1BWF9OT0lTRSA9IDUwOyAvLyBtYXhpbXVtIGFtb3VudCBvZiBub2lzZSwgaW4ga1BhXHJcbmFzc2VydCAmJiBhc3NlcnQoIE1JTl9OT0lTRSA8IE1BWF9OT0lTRSwgJ01JTl9OT0lTRSBtdXN0IGJlIDwgTUFYX05PSVNFJyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJlc3N1cmVHYXVnZSB7XHJcblxyXG4gIC8vIHByZXNzdXJlIGluIHRoZSBjb250YWluZXIsIGluIGtQYVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcHJlc3N1cmVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcclxuXHJcbiAgLy8gdGVtcGVyYXR1cmUgaW4gdGhlIGNvbnRhaW5lciwgaW4gSywgbnVsbCBpZiBlbXB0eSBjb250YWluZXJcclxuICBwcml2YXRlIHJlYWRvbmx5IHRlbXBlcmF0dXJlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlciB8IG51bGw+O1xyXG5cclxuICAvLyBxdWFudGl0eSB0byBiZSBoZWxkIGNvbnN0YW50LCBpbmZsdWVuY2VzIG5vaXNlXHJcbiAgcHJpdmF0ZSByZWFkb25seSBob2xkQ29uc3RhbnRQcm9wZXJ0eTogU3RyaW5nVW5pb25Qcm9wZXJ0eTxIb2xkQ29uc3RhbnQ+O1xyXG5cclxuICAvLyBwcmVzc3VyZSBpbiBrUGEsIHdpdGggbm9pc2UgYWRkZWRcclxuICBwdWJsaWMgcmVhZG9ubHkgcHJlc3N1cmVLaWxvcGFzY2Fsc1Byb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG5cclxuICAvLyBwcmVzc3VyZSBpbiBhdG1vc3BoZXJlcyAoYXRtKSwgd2l0aCBub2lzZSBhZGRlZFxyXG4gIHB1YmxpYyByZWFkb25seSBwcmVzc3VyZUF0bW9zcGhlcmVzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIC8vIHByZXNzdXJlIHJhbmdlIGluIGtQYVxyXG4gIHB1YmxpYyByZWFkb25seSBwcmVzc3VyZVJhbmdlOiBSYW5nZTtcclxuXHJcbiAgLy8gYW1vdW50IG9mIG5vaXNlIGluIGtQYSBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHByZXNzdXJlLCBzbyBtb3JlIG5vaXNlIGF0IGxvd2VyIHByZXNzdXJlXHJcbiAgcHJpdmF0ZSByZWFkb25seSBwcmVzc3VyZU5vaXNlRnVuY3Rpb246IExpbmVhckZ1bmN0aW9uO1xyXG5cclxuICAvLyBtYXAgZnJvbSB0ZW1wZXJhdHVyZSAoSykgdG8gbm9pc2Ugc2NhbGUgZmFjdG9yLCBzbyB0aGF0IG5vaXNlIGZhbGxzIG9mZiBhdCBsb3cgdGVtcGVyYXR1cmVzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBzY2FsZU5vaXNlRnVuY3Rpb246IExpbmVhckZ1bmN0aW9uO1xyXG5cclxuICAvLyBwcmVzc3VyZSB1bml0cyBkaXNwbGF5ZWQgYnkgdGhlIHByZXNzdXJlIGdhdWdlXHJcbiAgcHVibGljIHJlYWRvbmx5IHVuaXRzUHJvcGVydHk6IFN0cmluZ1VuaW9uUHJvcGVydHk8UHJlc3N1cmVVbml0cz47XHJcblxyXG4gIHByaXZhdGUgZHRBY2N1bXVsYXRvcjogbnVtYmVyO1xyXG5cclxuICAvLyBUaGUgZGlzcGxheSBpcyByZWZyZXNoZWQgYXQgdGhpcyBpbnRlcnZhbCwgaW4gcHNcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFJFRlJFU0hfUEVSSU9EID0gMC43NTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcmVzc3VyZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgdGVtcGVyYXR1cmVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyIHwgbnVsbD4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBob2xkQ29uc3RhbnRQcm9wZXJ0eTogU3RyaW5nVW5pb25Qcm9wZXJ0eTxIb2xkQ29uc3RhbnQ+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgdGhpcy5wcmVzc3VyZVByb3BlcnR5ID0gcHJlc3N1cmVQcm9wZXJ0eTtcclxuICAgIHRoaXMudGVtcGVyYXR1cmVQcm9wZXJ0eSA9IHRlbXBlcmF0dXJlUHJvcGVydHk7XHJcbiAgICB0aGlzLmhvbGRDb25zdGFudFByb3BlcnR5ID0gaG9sZENvbnN0YW50UHJvcGVydHk7XHJcblxyXG4gICAgLy8gVGhpcyBpcyBub3QgZGVyaXZlZCBmcm9tIHByZXNzdXJlUHJvcGVydHksIGJlY2F1c2UgaXQgbmVlZHMgdG8gYWRkIG5vaXNlIG9uIHN0ZXAsIG5vdCB3aGVuIHByZXNzdXJlUHJvcGVydHkgY2hhbmdlcy5cclxuICAgIHRoaXMucHJlc3N1cmVLaWxvcGFzY2Fsc1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBwcmVzc3VyZVByb3BlcnR5LnZhbHVlLCB7XHJcbiAgICAgIHVuaXRzOiAna1BhJyxcclxuICAgICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiAoIHZhbHVlID49IDAgKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJlc3N1cmVLaWxvcGFzY2Fsc1Byb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSwgLy8gdmFsdWUgaXMgZGVyaXZlZCBmcm9tIHByZXNzdXJlUHJvcGVydHkgb24gc3RlcCwgd2l0aCBub2lzZSBhZGRlZFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAncHJlc3N1cmUgaW4gSywgd2l0aCBvcHRpb25hbCBub2lzZSBhZGRlZCdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBXaGVuIHByZXNzdXJlIGdvZXMgdG8gemVybywgdXBkYXRlIHRoZSBnYXVnZSBpbW1lZGlhdGVseS5cclxuICAgIHByZXNzdXJlUHJvcGVydHkubGluayggcHJlc3N1cmUgPT4ge1xyXG4gICAgICBpZiAoIHByZXNzdXJlID09PSAwICkge1xyXG4gICAgICAgIHRoaXMucHJlc3N1cmVLaWxvcGFzY2Fsc1Byb3BlcnR5LnZhbHVlID0gMDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucHJlc3N1cmVBdG1vc3BoZXJlc1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnByZXNzdXJlS2lsb3Bhc2NhbHNQcm9wZXJ0eSBdLFxyXG4gICAgICBwcmVzc3VyZUtpbG9wYXNjYWxzID0+IHByZXNzdXJlS2lsb3Bhc2NhbHMgKiBHYXNQcm9wZXJ0aWVzQ29uc3RhbnRzLkFUTV9QRVJfS1BBLCB7XHJcbiAgICAgICAgdW5pdHM6ICdhdG0nLFxyXG4gICAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gKCB2YWx1ZSA+PSAwICksXHJcbiAgICAgICAgdmFsdWVUeXBlOiAnbnVtYmVyJyxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bWJlcklPLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZXNzdXJlQXRtb3NwaGVyZXNQcm9wZXJ0eScgKSxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAncHJlc3N1cmUgaW4gYXRtLCB3aXRoIG9wdGlvbmFsIG5vaXNlIGFkZGVkJ1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5wcmVzc3VyZVJhbmdlID0gbmV3IFJhbmdlKCAwLCBNQVhfUFJFU1NVUkUgKTtcclxuXHJcbiAgICB0aGlzLnByZXNzdXJlTm9pc2VGdW5jdGlvbiA9IG5ldyBMaW5lYXJGdW5jdGlvbiggMCwgdGhpcy5wcmVzc3VyZVJhbmdlLm1heCwgTUFYX05PSVNFLCBNSU5fTk9JU0UsIHRydWUgKTtcclxuXHJcbiAgICB0aGlzLnNjYWxlTm9pc2VGdW5jdGlvbiA9IG5ldyBMaW5lYXJGdW5jdGlvbiggNSwgNTAsIDAsIDEsIHRydWUgLyogY2xhbXAgKi8gKTtcclxuXHJcbiAgICB0aGlzLnVuaXRzUHJvcGVydHkgPSBuZXcgU3RyaW5nVW5pb25Qcm9wZXJ0eTxQcmVzc3VyZVVuaXRzPiggJ2F0bW9zcGhlcmVzJywge1xyXG4gICAgICB2YWxpZFZhbHVlczogUHJlc3N1cmVVbml0c1ZhbHVlcyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndW5pdHNQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3VuaXRzIGRpc3BsYXllZCBieSB0aGUgcHJlc3N1cmUgZ2F1Z2UnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5kdEFjY3VtdWxhdG9yID0gMDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnVuaXRzUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZHRBY2N1bXVsYXRvciA9IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwcyB0aGUgcHJlc3N1cmUgZ2F1Z2UuXHJcbiAgICogQHBhcmFtIGR0IC0gdGltZSBzdGVwLCBpbiBwc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHQgPiAwLCBgaW52YWxpZCBkdDogJHtkdH1gICk7XHJcblxyXG4gICAgdGhpcy5kdEFjY3VtdWxhdG9yICs9IGR0O1xyXG5cclxuICAgIGlmICggdGhpcy5kdEFjY3VtdWxhdG9yID49IFByZXNzdXJlR2F1Z2UuUkVGUkVTSF9QRVJJT0QgKSB7XHJcblxyXG4gICAgICAvLyBBcmUgd2UgaW4gYSBtb2RlIHRoYXQgaG9sZHMgcHJlc3N1cmUgY29uc3RhbnQ/XHJcbiAgICAgIGNvbnN0IGNvbnN0YW50UHJlc3N1cmUgPSAoIHRoaXMuaG9sZENvbnN0YW50UHJvcGVydHkudmFsdWUgPT09ICdwcmVzc3VyZVQnIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9sZENvbnN0YW50UHJvcGVydHkudmFsdWUgPT09ICdwcmVzc3VyZVYnICk7XHJcblxyXG4gICAgICAvLyBEaXNhYmxlIG5vaXNlIHdoZW4gcHJlc3N1cmUgaXMgaGVsZCBjb25zdGFudCwgb3IgdmlhIGdsb2JhbCBvcHRpb25zLlxyXG4gICAgICBjb25zdCBub2lzZUVuYWJsZWQgPSAoICFjb25zdGFudFByZXNzdXJlICYmIEdhc1Byb3BlcnRpZXNQcmVmZXJlbmNlcy5wcmVzc3VyZU5vaXNlUHJvcGVydHkudmFsdWUgKTtcclxuXHJcbiAgICAgIC8vIEFkZCBub2lzZSAoa1BhKSB0byB0aGUgZGlzcGxheWVkIHZhbHVlXHJcbiAgICAgIGxldCBub2lzZSA9IDA7XHJcbiAgICAgIGlmICggbm9pc2VFbmFibGVkICkge1xyXG5cclxuICAgICAgICAvLyBjb21wdXRlIG5vaXNlXHJcbiAgICAgICAgbm9pc2UgPSB0aGlzLnByZXNzdXJlTm9pc2VGdW5jdGlvbi5ldmFsdWF0ZSggdGhpcy5wcmVzc3VyZVByb3BlcnR5LnZhbHVlICkgKlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2FsZU5vaXNlRnVuY3Rpb24uZXZhbHVhdGUoIHRoaXMudGVtcGVyYXR1cmVQcm9wZXJ0eS52YWx1ZSB8fCAwICkgKlxyXG4gICAgICAgICAgICAgICAgZG90UmFuZG9tLm5leHREb3VibGUoKTtcclxuXHJcbiAgICAgICAgLy8gcmFuZG9tbHkgYXBwbHkgYSBzaWduIGlmIGRvaW5nIHNvIGRvZXNuJ3QgbWFrZSB0aGUgcHJlc3N1cmUgYmVjb21lIDw9IDBcclxuICAgICAgICBpZiAoIG5vaXNlIDwgdGhpcy5wcmVzc3VyZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgbm9pc2UgKj0gKCBkb3RSYW5kb20ubmV4dEJvb2xlYW4oKSA/IDEgOiAtMSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5wcmVzc3VyZUtpbG9wYXNjYWxzUHJvcGVydHkudmFsdWUgPSB0aGlzLnByZXNzdXJlUHJvcGVydHkudmFsdWUgKyBub2lzZTtcclxuICAgICAgdGhpcy5kdEFjY3VtdWxhdG9yID0gMDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmdhc1Byb3BlcnRpZXMucmVnaXN0ZXIoICdQcmVzc3VyZUdhdWdlJywgUHJlc3N1cmVHYXVnZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFFbEUsT0FBT0MsbUJBQW1CLE1BQU0sNENBQTRDO0FBRTVFLE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsY0FBYyxNQUFNLHNDQUFzQztBQUNqRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBRS9DLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxzQkFBc0IsTUFBTSw4QkFBOEI7QUFDakUsT0FBT0MsNEJBQTRCLE1BQU0sb0NBQW9DO0FBQzdFLE9BQU9DLHdCQUF3QixNQUFNLCtCQUErQjtBQUVwRSxTQUF3QkMsbUJBQW1CLFFBQVEsb0JBQW9COztBQUV2RTtBQUNBLE1BQU1DLFlBQVks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