// Copyright 2019-2022, University of Colorado Boulder

/**
 * PressureModel is a sub-model of IdealGasModel. It is responsible for the P (pressure) component of the
 * Ideal Gas Law (PV = NkT) and for the pressure gauge.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesConstants from '../GasPropertiesConstants.js';
import GasPropertiesQueryParameters from '../GasPropertiesQueryParameters.js';
import PressureGauge from './PressureGauge.js';
// Maximum pressure, in kPa. When exceeded, the lid blows off of the container.
const MAX_PRESSURE = GasPropertiesQueryParameters.maxPressure;
export default class PressureModel {
  // P, pressure in the container, in kPa

  // gauge that display pressureProperty with a choice of units

  // whether to update pressure

  constructor(holdConstantProperty, numberOfParticlesProperty, volumeProperty, temperatureProperty, blowLidOff, tandem) {
    this.holdConstantProperty = holdConstantProperty;
    this.numberOfParticlesProperty = numberOfParticlesProperty;
    this.volumeProperty = volumeProperty;
    this.temperatureProperty = temperatureProperty;
    this.blowLidOff = blowLidOff;
    this.pressureProperty = new NumberProperty(0, {
      units: 'kPa',
      isValidValue: value => value >= 0,
      tandem: tandem.createTandem('pressureProperty'),
      phetioReadOnly: true,
      // value is derived from state of particle system,
      phetioDocumentation: 'pressure in K, with no noise'
    });
    this.pressureGauge = new PressureGauge(this.pressureProperty, temperatureProperty, holdConstantProperty, tandem.createTandem('pressureGauge'));
    this.updatePressureEnabled = false;

    // If the container is empty, set pressure to zero and disable pressure updates.
    // Updates will be enabled when 1 particle has collided with the container.
    this.numberOfParticlesProperty.link(numberOfParticles => {
      if (numberOfParticles === 0) {
        this.pressureProperty.value = 0;
        this.updatePressureEnabled = false;
      }
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
  reset() {
    this.pressureProperty.reset();
    this.pressureGauge.reset();
    this.updatePressureEnabled = false;
  }

  /**
   * Updates this model.
   * @param dtPressureGauge - time delta used to step the pressure gauge, in ps
   * @param numberOfCollisions - number of collisions on the most recent time step
   */
  update(dtPressureGauge, numberOfCollisions) {
    // When adding particles to empty container, don't compute pressure until 1 particle has collided with container
    if (!this.updatePressureEnabled && numberOfCollisions > 0) {
      this.updatePressureEnabled = true;
    }

    // Compute pressure
    if (this.updatePressureEnabled) {
      // Compute the actual pressure, based on the state of the particle system
      this.pressureProperty.value = this.computePressure();

      // Step the gauge regardless of whether pressure has changed, since the gauge updates on a sample period.
      this.pressureGauge.step(dtPressureGauge);

      // If pressure exceeds the maximum, blow the lid off of the container.
      if (this.pressureProperty.value > MAX_PRESSURE) {
        this.blowLidOff();
      }
    }
  }

  /**
   * Computes pressure in kPa, using the Ideal Gas Law, P = NkT/V
   */
  computePressure() {
    const N = this.numberOfParticlesProperty.value;
    const k = GasPropertiesConstants.BOLTZMANN; // (pm^2 * AMU)/(ps^2 * K)
    const T = this.temperatureProperty.value || 0; // in K, assumes temperatureProperty has been updated
    const V = this.volumeProperty.value; // pm^3
    const P = N * k * T / V;

    // converted to kPa
    return P * GasPropertiesConstants.PRESSURE_CONVERSION_SCALE;
  }
}
gasProperties.register('PressureModel', PressureModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsImdhc1Byb3BlcnRpZXMiLCJHYXNQcm9wZXJ0aWVzQ29uc3RhbnRzIiwiR2FzUHJvcGVydGllc1F1ZXJ5UGFyYW1ldGVycyIsIlByZXNzdXJlR2F1Z2UiLCJNQVhfUFJFU1NVUkUiLCJtYXhQcmVzc3VyZSIsIlByZXNzdXJlTW9kZWwiLCJjb25zdHJ1Y3RvciIsImhvbGRDb25zdGFudFByb3BlcnR5IiwibnVtYmVyT2ZQYXJ0aWNsZXNQcm9wZXJ0eSIsInZvbHVtZVByb3BlcnR5IiwidGVtcGVyYXR1cmVQcm9wZXJ0eSIsImJsb3dMaWRPZmYiLCJ0YW5kZW0iLCJwcmVzc3VyZVByb3BlcnR5IiwidW5pdHMiLCJpc1ZhbGlkVmFsdWUiLCJ2YWx1ZSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInByZXNzdXJlR2F1Z2UiLCJ1cGRhdGVQcmVzc3VyZUVuYWJsZWQiLCJsaW5rIiwibnVtYmVyT2ZQYXJ0aWNsZXMiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVzZXQiLCJ1cGRhdGUiLCJkdFByZXNzdXJlR2F1Z2UiLCJudW1iZXJPZkNvbGxpc2lvbnMiLCJjb21wdXRlUHJlc3N1cmUiLCJzdGVwIiwiTiIsImsiLCJCT0xUWk1BTk4iLCJUIiwiViIsIlAiLCJQUkVTU1VSRV9DT05WRVJTSU9OX1NDQUxFIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQcmVzc3VyZU1vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFByZXNzdXJlTW9kZWwgaXMgYSBzdWItbW9kZWwgb2YgSWRlYWxHYXNNb2RlbC4gSXQgaXMgcmVzcG9uc2libGUgZm9yIHRoZSBQIChwcmVzc3VyZSkgY29tcG9uZW50IG9mIHRoZVxyXG4gKiBJZGVhbCBHYXMgTGF3IChQViA9IE5rVCkgYW5kIGZvciB0aGUgcHJlc3N1cmUgZ2F1Z2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBnYXNQcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2dhc1Byb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgR2FzUHJvcGVydGllc0NvbnN0YW50cyBmcm9tICcuLi9HYXNQcm9wZXJ0aWVzQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vR2FzUHJvcGVydGllc1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBQcmVzc3VyZUdhdWdlIGZyb20gJy4vUHJlc3N1cmVHYXVnZS5qcyc7XHJcbmltcG9ydCB7IEhvbGRDb25zdGFudCB9IGZyb20gJy4vSG9sZENvbnN0YW50LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgU3RyaW5nVW5pb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1N0cmluZ1VuaW9uUHJvcGVydHkuanMnO1xyXG5cclxuLy8gTWF4aW11bSBwcmVzc3VyZSwgaW4ga1BhLiBXaGVuIGV4Y2VlZGVkLCB0aGUgbGlkIGJsb3dzIG9mZiBvZiB0aGUgY29udGFpbmVyLlxyXG5jb25zdCBNQVhfUFJFU1NVUkUgPSBHYXNQcm9wZXJ0aWVzUXVlcnlQYXJhbWV0ZXJzLm1heFByZXNzdXJlO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJlc3N1cmVNb2RlbCB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgaG9sZENvbnN0YW50UHJvcGVydHk6IFN0cmluZ1VuaW9uUHJvcGVydHk8SG9sZENvbnN0YW50PjtcclxuICBwcml2YXRlIHJlYWRvbmx5IG51bWJlck9mUGFydGljbGVzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj47XHJcbiAgcHJpdmF0ZSByZWFkb25seSB2b2x1bWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHRlbXBlcmF0dXJlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlciB8IG51bGw+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYmxvd0xpZE9mZjogKCkgPT4gdm9pZDtcclxuXHJcbiAgLy8gUCwgcHJlc3N1cmUgaW4gdGhlIGNvbnRhaW5lciwgaW4ga1BhXHJcbiAgcHVibGljIHJlYWRvbmx5IHByZXNzdXJlUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIC8vIGdhdWdlIHRoYXQgZGlzcGxheSBwcmVzc3VyZVByb3BlcnR5IHdpdGggYSBjaG9pY2Ugb2YgdW5pdHNcclxuICBwdWJsaWMgcmVhZG9ubHkgcHJlc3N1cmVHYXVnZTogUHJlc3N1cmVHYXVnZTtcclxuXHJcbiAgLy8gd2hldGhlciB0byB1cGRhdGUgcHJlc3N1cmVcclxuICBwcml2YXRlIHVwZGF0ZVByZXNzdXJlRW5hYmxlZDogYm9vbGVhbjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBob2xkQ29uc3RhbnRQcm9wZXJ0eTogU3RyaW5nVW5pb25Qcm9wZXJ0eTxIb2xkQ29uc3RhbnQ+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgbnVtYmVyT2ZQYXJ0aWNsZXNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIHZvbHVtZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgdGVtcGVyYXR1cmVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyIHwgbnVsbD4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBibG93TGlkT2ZmOiAoKSA9PiB2b2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgdGhpcy5ob2xkQ29uc3RhbnRQcm9wZXJ0eSA9IGhvbGRDb25zdGFudFByb3BlcnR5O1xyXG4gICAgdGhpcy5udW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5ID0gbnVtYmVyT2ZQYXJ0aWNsZXNQcm9wZXJ0eTtcclxuICAgIHRoaXMudm9sdW1lUHJvcGVydHkgPSB2b2x1bWVQcm9wZXJ0eTtcclxuICAgIHRoaXMudGVtcGVyYXR1cmVQcm9wZXJ0eSA9IHRlbXBlcmF0dXJlUHJvcGVydHk7XHJcbiAgICB0aGlzLmJsb3dMaWRPZmYgPSBibG93TGlkT2ZmO1xyXG5cclxuICAgIHRoaXMucHJlc3N1cmVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB1bml0czogJ2tQYScsXHJcbiAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gKCB2YWx1ZSA+PSAwICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZXNzdXJlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLCAvLyB2YWx1ZSBpcyBkZXJpdmVkIGZyb20gc3RhdGUgb2YgcGFydGljbGUgc3lzdGVtLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAncHJlc3N1cmUgaW4gSywgd2l0aCBubyBub2lzZSdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnByZXNzdXJlR2F1Z2UgPSBuZXcgUHJlc3N1cmVHYXVnZSggdGhpcy5wcmVzc3VyZVByb3BlcnR5LCB0ZW1wZXJhdHVyZVByb3BlcnR5LCBob2xkQ29uc3RhbnRQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZXNzdXJlR2F1Z2UnICkgKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZVByZXNzdXJlRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIElmIHRoZSBjb250YWluZXIgaXMgZW1wdHksIHNldCBwcmVzc3VyZSB0byB6ZXJvIGFuZCBkaXNhYmxlIHByZXNzdXJlIHVwZGF0ZXMuXHJcbiAgICAvLyBVcGRhdGVzIHdpbGwgYmUgZW5hYmxlZCB3aGVuIDEgcGFydGljbGUgaGFzIGNvbGxpZGVkIHdpdGggdGhlIGNvbnRhaW5lci5cclxuICAgIHRoaXMubnVtYmVyT2ZQYXJ0aWNsZXNQcm9wZXJ0eS5saW5rKCBudW1iZXJPZlBhcnRpY2xlcyA9PiB7XHJcbiAgICAgIGlmICggbnVtYmVyT2ZQYXJ0aWNsZXMgPT09IDAgKSB7XHJcbiAgICAgICAgdGhpcy5wcmVzc3VyZVByb3BlcnR5LnZhbHVlID0gMDtcclxuICAgICAgICB0aGlzLnVwZGF0ZVByZXNzdXJlRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5wcmVzc3VyZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnByZXNzdXJlR2F1Z2UucmVzZXQoKTtcclxuICAgIHRoaXMudXBkYXRlUHJlc3N1cmVFbmFibGVkID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoaXMgbW9kZWwuXHJcbiAgICogQHBhcmFtIGR0UHJlc3N1cmVHYXVnZSAtIHRpbWUgZGVsdGEgdXNlZCB0byBzdGVwIHRoZSBwcmVzc3VyZSBnYXVnZSwgaW4gcHNcclxuICAgKiBAcGFyYW0gbnVtYmVyT2ZDb2xsaXNpb25zIC0gbnVtYmVyIG9mIGNvbGxpc2lvbnMgb24gdGhlIG1vc3QgcmVjZW50IHRpbWUgc3RlcFxyXG4gICAqL1xyXG4gIHB1YmxpYyB1cGRhdGUoIGR0UHJlc3N1cmVHYXVnZTogbnVtYmVyLCBudW1iZXJPZkNvbGxpc2lvbnM6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBXaGVuIGFkZGluZyBwYXJ0aWNsZXMgdG8gZW1wdHkgY29udGFpbmVyLCBkb24ndCBjb21wdXRlIHByZXNzdXJlIHVudGlsIDEgcGFydGljbGUgaGFzIGNvbGxpZGVkIHdpdGggY29udGFpbmVyXHJcbiAgICBpZiAoICF0aGlzLnVwZGF0ZVByZXNzdXJlRW5hYmxlZCAmJiBudW1iZXJPZkNvbGxpc2lvbnMgPiAwICkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVByZXNzdXJlRW5hYmxlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ29tcHV0ZSBwcmVzc3VyZVxyXG4gICAgaWYgKCB0aGlzLnVwZGF0ZVByZXNzdXJlRW5hYmxlZCApIHtcclxuXHJcbiAgICAgIC8vIENvbXB1dGUgdGhlIGFjdHVhbCBwcmVzc3VyZSwgYmFzZWQgb24gdGhlIHN0YXRlIG9mIHRoZSBwYXJ0aWNsZSBzeXN0ZW1cclxuICAgICAgdGhpcy5wcmVzc3VyZVByb3BlcnR5LnZhbHVlID0gdGhpcy5jb21wdXRlUHJlc3N1cmUoKTtcclxuXHJcbiAgICAgIC8vIFN0ZXAgdGhlIGdhdWdlIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciBwcmVzc3VyZSBoYXMgY2hhbmdlZCwgc2luY2UgdGhlIGdhdWdlIHVwZGF0ZXMgb24gYSBzYW1wbGUgcGVyaW9kLlxyXG4gICAgICB0aGlzLnByZXNzdXJlR2F1Z2Uuc3RlcCggZHRQcmVzc3VyZUdhdWdlICk7XHJcblxyXG4gICAgICAvLyBJZiBwcmVzc3VyZSBleGNlZWRzIHRoZSBtYXhpbXVtLCBibG93IHRoZSBsaWQgb2ZmIG9mIHRoZSBjb250YWluZXIuXHJcbiAgICAgIGlmICggdGhpcy5wcmVzc3VyZVByb3BlcnR5LnZhbHVlID4gTUFYX1BSRVNTVVJFICkge1xyXG4gICAgICAgIHRoaXMuYmxvd0xpZE9mZigpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlcyBwcmVzc3VyZSBpbiBrUGEsIHVzaW5nIHRoZSBJZGVhbCBHYXMgTGF3LCBQID0gTmtUL1ZcclxuICAgKi9cclxuICBwcml2YXRlIGNvbXB1dGVQcmVzc3VyZSgpOiBudW1iZXIge1xyXG5cclxuICAgIGNvbnN0IE4gPSB0aGlzLm51bWJlck9mUGFydGljbGVzUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBrID0gR2FzUHJvcGVydGllc0NvbnN0YW50cy5CT0xUWk1BTk47IC8vIChwbV4yICogQU1VKS8ocHNeMiAqIEspXHJcbiAgICBjb25zdCBUID0gdGhpcy50ZW1wZXJhdHVyZVByb3BlcnR5LnZhbHVlIHx8IDA7IC8vIGluIEssIGFzc3VtZXMgdGVtcGVyYXR1cmVQcm9wZXJ0eSBoYXMgYmVlbiB1cGRhdGVkXHJcbiAgICBjb25zdCBWID0gdGhpcy52b2x1bWVQcm9wZXJ0eS52YWx1ZTsgLy8gcG1eM1xyXG4gICAgY29uc3QgUCA9ICggTiAqIGsgKiBUIC8gViApO1xyXG5cclxuICAgIC8vIGNvbnZlcnRlZCB0byBrUGFcclxuICAgIHJldHVybiBQICogR2FzUHJvcGVydGllc0NvbnN0YW50cy5QUkVTU1VSRV9DT05WRVJTSU9OX1NDQUxFO1xyXG4gIH1cclxufVxyXG5cclxuZ2FzUHJvcGVydGllcy5yZWdpc3RlciggJ1ByZXNzdXJlTW9kZWwnLCBQcmVzc3VyZU1vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUVs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