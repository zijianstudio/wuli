// Copyright 2019-2022, University of Colorado Boulder

/**
 * TemperatureModel is a sub-model of IdealGasModel. It is responsible for the T (temperature) component of
 * the Ideal Gas Law (PV = NkT) and for the thermometer.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesConstants from '../GasPropertiesConstants.js';
import Thermometer from './Thermometer.js';

// constants

// temperature used to compute the initial speed for particles, in K
const INITIAL_TEMPERATURE_RANGE = new RangeWithValue(50, 1000, 300);
export default class TemperatureModel {
  // T, temperature in the container, in K, null when the container is empty

  // whether initial temperature is controlled by the user

  // initial temperature of particles added to the container, in K. Ignored if !controlTemperatureEnabledProperty.value

  // thermometer that displays temperatureProperty with a choice of units

  constructor(numberOfParticlesProperty, getAverageKineticEnergy, tandem) {
    this.numberOfParticlesProperty = numberOfParticlesProperty;
    this.getAverageKineticEnergy = getAverageKineticEnergy;
    this.temperatureProperty = new Property(null, {
      units: 'K',
      isValidValue: value => value === null || value >= 0,
      phetioValueType: NullableIO(NumberIO),
      tandem: tandem.createTandem('temperatureProperty'),
      phetioReadOnly: true,
      // value is derived from state of particle system
      phetioDocumentation: 'temperature in K'
    });
    this.controlTemperatureEnabledProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('controlTemperatureEnabledProperty'),
      phetioDocumentation: 'indicates whether initial temperature is controlled by the user'
    });
    this.initialTemperatureProperty = new NumberProperty(INITIAL_TEMPERATURE_RANGE.defaultValue, {
      range: INITIAL_TEMPERATURE_RANGE,
      units: 'K',
      tandem: tandem.createTandem('initialTemperatureProperty'),
      phetioDocumentation: 'temperature used to determine the initial speed of particles when controlled by the user'
    });
    this.thermometer = new Thermometer(this.temperatureProperty, {
      tandem: tandem.createTandem('thermometer')
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
  reset() {
    this.temperatureProperty.reset();
    this.controlTemperatureEnabledProperty.reset();
    this.initialTemperatureProperty.reset();
    this.thermometer.reset();
  }

  /**
   * Updates the model to match the state of the system.
   */
  update() {
    this.temperatureProperty.value = this.computeTemperature();
  }

  /**
   * Gets the temperature that will be used to compute initial velocity magnitude.
   */
  getInitialTemperature() {
    let initialTemperature = null;
    if (this.controlTemperatureEnabledProperty.value) {
      // User's setting
      initialTemperature = this.initialTemperatureProperty.value;
    } else if (this.temperatureProperty.value !== null) {
      // Current temperature in the container
      initialTemperature = this.temperatureProperty.value;
    } else {
      // Default for empty container
      initialTemperature = INITIAL_TEMPERATURE_RANGE.defaultValue;
    }
    assert && assert(initialTemperature >= 0, `bad initialTemperature: ${initialTemperature}`);
    return initialTemperature;
  }

  /**
   * Computes the actual temperature, which is a measure of the kinetic energy of the particles in the container.
   * Returns actual temperature in K, null if the container is empty.
   */
  computeTemperature() {
    let temperature = null;
    const n = this.numberOfParticlesProperty.value;
    if (n > 0) {
      const averageKineticEnergy = this.getAverageKineticEnergy(); // AMU * pm^2 / ps^2
      const k = GasPropertiesConstants.BOLTZMANN; // (pm^2 * AMU)/(ps^2 * K)

      // T = (2/3)KE/k
      temperature = 2 / 3 * averageKineticEnergy / k; // K
    }

    return temperature;
  }
}
gasProperties.register('TemperatureModel', TemperatureModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiUmFuZ2VXaXRoVmFsdWUiLCJOdWxsYWJsZUlPIiwiTnVtYmVySU8iLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc0NvbnN0YW50cyIsIlRoZXJtb21ldGVyIiwiSU5JVElBTF9URU1QRVJBVFVSRV9SQU5HRSIsIlRlbXBlcmF0dXJlTW9kZWwiLCJjb25zdHJ1Y3RvciIsIm51bWJlck9mUGFydGljbGVzUHJvcGVydHkiLCJnZXRBdmVyYWdlS2luZXRpY0VuZXJneSIsInRhbmRlbSIsInRlbXBlcmF0dXJlUHJvcGVydHkiLCJ1bml0cyIsImlzVmFsaWRWYWx1ZSIsInZhbHVlIiwicGhldGlvVmFsdWVUeXBlIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiY29udHJvbFRlbXBlcmF0dXJlRW5hYmxlZFByb3BlcnR5IiwiaW5pdGlhbFRlbXBlcmF0dXJlUHJvcGVydHkiLCJkZWZhdWx0VmFsdWUiLCJyYW5nZSIsInRoZXJtb21ldGVyIiwiZGlzcG9zZSIsImFzc2VydCIsInJlc2V0IiwidXBkYXRlIiwiY29tcHV0ZVRlbXBlcmF0dXJlIiwiZ2V0SW5pdGlhbFRlbXBlcmF0dXJlIiwiaW5pdGlhbFRlbXBlcmF0dXJlIiwidGVtcGVyYXR1cmUiLCJuIiwiYXZlcmFnZUtpbmV0aWNFbmVyZ3kiLCJrIiwiQk9MVFpNQU5OIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUZW1wZXJhdHVyZU1vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRlbXBlcmF0dXJlTW9kZWwgaXMgYSBzdWItbW9kZWwgb2YgSWRlYWxHYXNNb2RlbC4gSXQgaXMgcmVzcG9uc2libGUgZm9yIHRoZSBUICh0ZW1wZXJhdHVyZSkgY29tcG9uZW50IG9mXHJcbiAqIHRoZSBJZGVhbCBHYXMgTGF3IChQViA9IE5rVCkgYW5kIGZvciB0aGUgdGhlcm1vbWV0ZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZVdpdGhWYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2VXaXRoVmFsdWUuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XHJcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVtYmVySU8uanMnO1xyXG5pbXBvcnQgZ2FzUHJvcGVydGllcyBmcm9tICcuLi8uLi9nYXNQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNDb25zdGFudHMgZnJvbSAnLi4vR2FzUHJvcGVydGllc0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBUaGVybW9tZXRlciBmcm9tICcuL1RoZXJtb21ldGVyLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5cclxuLy8gdGVtcGVyYXR1cmUgdXNlZCB0byBjb21wdXRlIHRoZSBpbml0aWFsIHNwZWVkIGZvciBwYXJ0aWNsZXMsIGluIEtcclxuY29uc3QgSU5JVElBTF9URU1QRVJBVFVSRV9SQU5HRSA9IG5ldyBSYW5nZVdpdGhWYWx1ZSggNTAsIDEwMDAsIDMwMCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVtcGVyYXR1cmVNb2RlbCB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbnVtYmVyT2ZQYXJ0aWNsZXNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGdldEF2ZXJhZ2VLaW5ldGljRW5lcmd5OiAoKSA9PiBudW1iZXI7XHJcblxyXG4gIC8vIFQsIHRlbXBlcmF0dXJlIGluIHRoZSBjb250YWluZXIsIGluIEssIG51bGwgd2hlbiB0aGUgY29udGFpbmVyIGlzIGVtcHR5XHJcbiAgcHVibGljIHJlYWRvbmx5IHRlbXBlcmF0dXJlUHJvcGVydHk6IFByb3BlcnR5PG51bWJlciB8IG51bGw+O1xyXG5cclxuICAvLyB3aGV0aGVyIGluaXRpYWwgdGVtcGVyYXR1cmUgaXMgY29udHJvbGxlZCBieSB0aGUgdXNlclxyXG4gIHB1YmxpYyByZWFkb25seSBjb250cm9sVGVtcGVyYXR1cmVFbmFibGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyBpbml0aWFsIHRlbXBlcmF0dXJlIG9mIHBhcnRpY2xlcyBhZGRlZCB0byB0aGUgY29udGFpbmVyLCBpbiBLLiBJZ25vcmVkIGlmICFjb250cm9sVGVtcGVyYXR1cmVFbmFibGVkUHJvcGVydHkudmFsdWVcclxuICBwdWJsaWMgcmVhZG9ubHkgaW5pdGlhbFRlbXBlcmF0dXJlUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICAvLyB0aGVybW9tZXRlciB0aGF0IGRpc3BsYXlzIHRlbXBlcmF0dXJlUHJvcGVydHkgd2l0aCBhIGNob2ljZSBvZiB1bml0c1xyXG4gIHB1YmxpYyByZWFkb25seSB0aGVybW9tZXRlcjogVGhlcm1vbWV0ZXI7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbnVtYmVyT2ZQYXJ0aWNsZXNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIGdldEF2ZXJhZ2VLaW5ldGljRW5lcmd5OiAoKSA9PiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICB0aGlzLm51bWJlck9mUGFydGljbGVzUHJvcGVydHkgPSBudW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5O1xyXG4gICAgdGhpcy5nZXRBdmVyYWdlS2luZXRpY0VuZXJneSA9IGdldEF2ZXJhZ2VLaW5ldGljRW5lcmd5O1xyXG5cclxuICAgIHRoaXMudGVtcGVyYXR1cmVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxudW1iZXIgfCBudWxsPiggbnVsbCwge1xyXG4gICAgICB1bml0czogJ0snLFxyXG4gICAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+ICggdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPj0gMCApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bGxhYmxlSU8oIE51bWJlcklPICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RlbXBlcmF0dXJlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLCAvLyB2YWx1ZSBpcyBkZXJpdmVkIGZyb20gc3RhdGUgb2YgcGFydGljbGUgc3lzdGVtXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0ZW1wZXJhdHVyZSBpbiBLJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY29udHJvbFRlbXBlcmF0dXJlRW5hYmxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29udHJvbFRlbXBlcmF0dXJlRW5hYmxlZFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnaW5kaWNhdGVzIHdoZXRoZXIgaW5pdGlhbCB0ZW1wZXJhdHVyZSBpcyBjb250cm9sbGVkIGJ5IHRoZSB1c2VyJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaW5pdGlhbFRlbXBlcmF0dXJlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIElOSVRJQUxfVEVNUEVSQVRVUkVfUkFOR0UuZGVmYXVsdFZhbHVlLCB7XHJcbiAgICAgIHJhbmdlOiBJTklUSUFMX1RFTVBFUkFUVVJFX1JBTkdFLFxyXG4gICAgICB1bml0czogJ0snLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbml0aWFsVGVtcGVyYXR1cmVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RlbXBlcmF0dXJlIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBpbml0aWFsIHNwZWVkIG9mIHBhcnRpY2xlcyB3aGVuIGNvbnRyb2xsZWQgYnkgdGhlIHVzZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50aGVybW9tZXRlciA9IG5ldyBUaGVybW9tZXRlciggdGhpcy50ZW1wZXJhdHVyZVByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RoZXJtb21ldGVyJyApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy50ZW1wZXJhdHVyZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNvbnRyb2xUZW1wZXJhdHVyZUVuYWJsZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pbml0aWFsVGVtcGVyYXR1cmVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50aGVybW9tZXRlci5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgbW9kZWwgdG8gbWF0Y2ggdGhlIHN0YXRlIG9mIHRoZSBzeXN0ZW0uXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcclxuICAgIHRoaXMudGVtcGVyYXR1cmVQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuY29tcHV0ZVRlbXBlcmF0dXJlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB0ZW1wZXJhdHVyZSB0aGF0IHdpbGwgYmUgdXNlZCB0byBjb21wdXRlIGluaXRpYWwgdmVsb2NpdHkgbWFnbml0dWRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRJbml0aWFsVGVtcGVyYXR1cmUoKTogbnVtYmVyIHtcclxuXHJcbiAgICBsZXQgaW5pdGlhbFRlbXBlcmF0dXJlID0gbnVsbDtcclxuXHJcbiAgICBpZiAoIHRoaXMuY29udHJvbFRlbXBlcmF0dXJlRW5hYmxlZFByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgLy8gVXNlcidzIHNldHRpbmdcclxuICAgICAgaW5pdGlhbFRlbXBlcmF0dXJlID0gdGhpcy5pbml0aWFsVGVtcGVyYXR1cmVQcm9wZXJ0eS52YWx1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnRlbXBlcmF0dXJlUHJvcGVydHkudmFsdWUgIT09IG51bGwgKSB7XHJcblxyXG4gICAgICAvLyBDdXJyZW50IHRlbXBlcmF0dXJlIGluIHRoZSBjb250YWluZXJcclxuICAgICAgaW5pdGlhbFRlbXBlcmF0dXJlID0gdGhpcy50ZW1wZXJhdHVyZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBEZWZhdWx0IGZvciBlbXB0eSBjb250YWluZXJcclxuICAgICAgaW5pdGlhbFRlbXBlcmF0dXJlID0gSU5JVElBTF9URU1QRVJBVFVSRV9SQU5HRS5kZWZhdWx0VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5pdGlhbFRlbXBlcmF0dXJlID49IDAsIGBiYWQgaW5pdGlhbFRlbXBlcmF0dXJlOiAke2luaXRpYWxUZW1wZXJhdHVyZX1gICk7XHJcbiAgICByZXR1cm4gaW5pdGlhbFRlbXBlcmF0dXJlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZXMgdGhlIGFjdHVhbCB0ZW1wZXJhdHVyZSwgd2hpY2ggaXMgYSBtZWFzdXJlIG9mIHRoZSBraW5ldGljIGVuZXJneSBvZiB0aGUgcGFydGljbGVzIGluIHRoZSBjb250YWluZXIuXHJcbiAgICogUmV0dXJucyBhY3R1YWwgdGVtcGVyYXR1cmUgaW4gSywgbnVsbCBpZiB0aGUgY29udGFpbmVyIGlzIGVtcHR5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb21wdXRlVGVtcGVyYXR1cmUoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICBsZXQgdGVtcGVyYXR1cmUgPSBudWxsO1xyXG4gICAgY29uc3QgbiA9IHRoaXMubnVtYmVyT2ZQYXJ0aWNsZXNQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGlmICggbiA+IDAgKSB7XHJcbiAgICAgIGNvbnN0IGF2ZXJhZ2VLaW5ldGljRW5lcmd5ID0gdGhpcy5nZXRBdmVyYWdlS2luZXRpY0VuZXJneSgpOyAvLyBBTVUgKiBwbV4yIC8gcHNeMlxyXG4gICAgICBjb25zdCBrID0gR2FzUHJvcGVydGllc0NvbnN0YW50cy5CT0xUWk1BTk47IC8vIChwbV4yICogQU1VKS8ocHNeMiAqIEspXHJcblxyXG4gICAgICAvLyBUID0gKDIvMylLRS9rXHJcbiAgICAgIHRlbXBlcmF0dXJlID0gKCAyIC8gMyApICogYXZlcmFnZUtpbmV0aWNFbmVyZ3kgLyBrOyAvLyBLXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGVtcGVyYXR1cmU7XHJcbiAgfVxyXG59XHJcblxyXG5nYXNQcm9wZXJ0aWVzLnJlZ2lzdGVyKCAnVGVtcGVyYXR1cmVNb2RlbCcsIFRlbXBlcmF0dXJlTW9kZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUV0RCxPQUFPQyxjQUFjLE1BQU0sc0NBQXNDO0FBRWpFLE9BQU9DLFVBQVUsTUFBTSwyQ0FBMkM7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLHNCQUFzQixNQUFNLDhCQUE4QjtBQUNqRSxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCOztBQUUxQzs7QUFFQTtBQUNBLE1BQU1DLHlCQUF5QixHQUFHLElBQUlOLGNBQWMsQ0FBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUksQ0FBQztBQUVyRSxlQUFlLE1BQU1PLGdCQUFnQixDQUFDO0VBS3BDOztFQUdBOztFQUdBOztFQUdBOztFQUdPQyxXQUFXQSxDQUFFQyx5QkFBb0QsRUFDcERDLHVCQUFxQyxFQUNyQ0MsTUFBYyxFQUFHO0lBRW5DLElBQUksQ0FBQ0YseUJBQXlCLEdBQUdBLHlCQUF5QjtJQUMxRCxJQUFJLENBQUNDLHVCQUF1QixHQUFHQSx1QkFBdUI7SUFFdEQsSUFBSSxDQUFDRSxtQkFBbUIsR0FBRyxJQUFJYixRQUFRLENBQWlCLElBQUksRUFBRTtNQUM1RGMsS0FBSyxFQUFFLEdBQUc7TUFDVkMsWUFBWSxFQUFFQyxLQUFLLElBQU1BLEtBQUssS0FBSyxJQUFJLElBQUlBLEtBQUssSUFBSSxDQUFHO01BQ3ZEQyxlQUFlLEVBQUVmLFVBQVUsQ0FBRUMsUUFBUyxDQUFDO01BQ3ZDUyxNQUFNLEVBQUVBLE1BQU0sQ0FBQ00sWUFBWSxDQUFFLHFCQUFzQixDQUFD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