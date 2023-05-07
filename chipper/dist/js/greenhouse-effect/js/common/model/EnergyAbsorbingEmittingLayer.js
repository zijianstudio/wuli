// Copyright 2021-2023, University of Colorado Boulder

/**
 * A model of a horizontal layer of a material that absorbs energy, heats up, and then radiates energy as a black body.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectConstants from '../GreenhouseEffectConstants.js';
import GreenhouseEffectQueryParameters from '../GreenhouseEffectQueryParameters.js';
import EMEnergyPacket from './EMEnergyPacket.js';
import EnergyDirection from './EnergyDirection.js';

// constants
const AT_EQUILIBRIUM_THRESHOLD = GreenhouseEffectQueryParameters.atEquilibriumThreshold; // in Watts per square meter, empirically determined

// This constant defines the amount of time that the incoming and outgoing energies have to be equal (within a
// threshold) before deciding that the layer is at thermal equilibrium.  This is in seconds, and was empirically
// determined.
const EQUILIBRATION_TIME = GreenhouseEffectQueryParameters.atEquilibriumTime;

// The various substances that this layer can model.
class Substance extends EnumerationValue {
  // In kg/m^3

  // In J/kg°K

  constructor(density, specificHeatCapacity, radiationDirections) {
    super();
    this.density = density;
    this.specificHeatCapacity = specificHeatCapacity;
    this.radiationDirections = radiationDirections;
  }
  static GLASS = new Substance(2500, 840, [EnergyDirection.UP, EnergyDirection.DOWN]);
  static EARTH = new Substance(1250, 1250, [EnergyDirection.UP]);
  static enumeration = new Enumeration(Substance);
}

// The size of the energy absorbing layers are all the same in the Greenhouse Effect sim and are not parameterized.
// The layer is modeled as a 1-meter wide strip that spans the width of the simulated sunlight.  Picture it like a
// sidewalk.  The dimensions are in meters.
const SURFACE_DIMENSIONS = GreenhouseEffectConstants.SUNLIGHT_SPAN;
const SURFACE_AREA = SURFACE_DIMENSIONS.width * SURFACE_DIMENSIONS.height;

// The thickness of the layer is primarily used in volume calculations which are then used in the specific heat formula.
// The value used here is in meters, and it is ridiculously small.  This is done so that the layers change temperature
// very quickly in response to incoming energy.  This is the main place where adjustments should be made to increase or
// decrease the rates at which temperatures change in the sim.
const LAYER_THICKNESS = 0.0000003;
const VOLUME = SURFACE_DIMENSIONS.width * SURFACE_DIMENSIONS.height * LAYER_THICKNESS;
class EnergyAbsorbingEmittingLayer extends PhetioObject {
  // The altitude in meters where this layer exists,

  // The temperature of this layer in degrees Kelvin.  We model it at absolute zero by default so that it isn't
  // radiating anything, and produce a compensated temperature that produces values more reasonable to the surface of
  // the Earth and its atmosphere.
  // The proportion of energy coming into this layer that is absorbed and thus contributes to an increase in
  // temperature.  Non-absorbed energy is simply passed from the input to the output.
  // Other fields whose meaning should be reasonably obvious.
  constructor(altitude, providedOptions) {
    const options = optionize()({
      // default to glass
      substance: Substance.GLASS,
      // initial setting for the absorption proportion, must be from 0 to 1 inclusive
      initialEnergyAbsorptionProportion: 1,
      // The minimum temperature that this layer can get to, in degrees Kelvin.  This will also be the temperature at
      // which it is originally set to.  When at this temperature, the layer will radiate no energy.
      // TODO: Decide whether this is really worth keeping.  It's tricky, and may not be what we really ultimately want.
      minimumTemperature: 0,
      // phet-io
      phetioReadOnly: true,
      phetioState: false
    }, providedOptions);
    super(options);
    this.altitude = altitude;
    this.temperatureProperty = new NumberProperty(options.minimumTemperature, {
      units: 'K',
      tandem: options.tandem.createTandem('temperatureProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true
    });
    this.energyAbsorptionProportionProperty = new NumberProperty(options.initialEnergyAbsorptionProportion, {
      range: new Range(0, 1),
      tandem: options.tandem.createTandem('energyAbsorptionProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'Proportion, from 0 to 1, of light energy absorbed for interacting wavelengths.'
    });

    // A property that is true when this layer is in equilibrium, meaning that the amount of energy coming in is equal
    // to or at least very close to the amount of energy going out.
    this.atEquilibriumProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('atEquilibriumProperty'),
      phetioReadOnly: true
    });
    this.substance = options.substance;
    this.mass = VOLUME * options.substance.density;
    this.specificHeatCapacity = options.substance.specificHeatCapacity;
    this.minimumTemperature = options.minimumTemperature;
    this.atEquilibriumTime = 0;
  }

  /**
   * Interact with the provided energy packets.  This behavior varies depending on the nature of the layer, and must
   * therefore be overridden in descendant classes.
   */
  interactWithEnergyPackets(emEnergyPackets) {
    assert && assert(false, 'this method must be overridden in descendant classes');
    return 0;
  }

  /**
   * Returns true if the provided energy packet crossed over this layer during its latest step.
   */
  energyPacketCrossedThisLayer(energyPacket) {
    const altitude = this.altitude;
    return energyPacket.previousAltitude > altitude && energyPacket.altitude <= altitude || energyPacket.previousAltitude < altitude && energyPacket.altitude >= altitude;
  }

  /**
   * Interact with the provided energy.  Energy may be reflected, absorbed, or ignored.
   */
  interactWithEnergy(emEnergyPackets, dt) {
    // Interact with the individual energy packets and figure out how much energy to absorb from them.  The energy
    // packets can be updated, and often are, during this step.
    const absorbedEnergy = this.interactWithEnergyPackets(emEnergyPackets);

    // Remove any energy packets that were fully absorbed.
    _.remove(emEnergyPackets, emEnergyPacket => emEnergyPacket.energy === 0);

    // Calculate the temperature change that would occur due to the incoming energy using the specific heat formula.
    const temperatureChangeDueToIncomingEnergy = absorbedEnergy / (this.mass * this.specificHeatCapacity);

    // Calculate the amount of energy that this layer will radiate per unit area at its current temperature using the
    // Stefan-Boltzmann equation.  This calculation doesn't allow the energy to radiate if it is below the initial
    // temperature, which is not real physics, but is needed for the desired behavior of the sim.
    const radiatedEnergyPerUnitSurfaceArea = Math.pow(this.temperatureProperty.value, 4) * GreenhouseEffectConstants.STEFAN_BOLTZMANN_CONSTANT * dt;

    // The total radiated energy depends on whether this layer is radiating in one direction or two.
    const numberOfRadiatingSurfaces = this.substance.radiationDirections.length;
    assert && assert(numberOfRadiatingSurfaces === 1 || numberOfRadiatingSurfaces === 2);
    let totalRadiatedEnergyThisStep = radiatedEnergyPerUnitSurfaceArea * SURFACE_AREA * numberOfRadiatingSurfaces;

    // Calculate the temperature change that would occur due to the radiated energy.
    const temperatureChangeDueToRadiatedEnergy = -totalRadiatedEnergyThisStep / (this.mass * this.specificHeatCapacity);

    // Total the two temperature change values.
    let netTemperatureChange = temperatureChangeDueToIncomingEnergy + temperatureChangeDueToRadiatedEnergy;

    // Check whether the calculated temperature changes would cause this layer's temperature to go below its minimum
    // value.  If so, limit the radiated energy so that this doesn't happen.  THIS IS NON-PHYSICAL, but is necessary so
    // that the layer doesn't fall below the minimum temperature.  In a real system, it would radiate until it reached
    // absolute zero.
    if (this.temperatureProperty.value + netTemperatureChange < this.minimumTemperature) {
      // Reduce the magnitude of the temperature change such that it will not take the temperature below the min value.
      netTemperatureChange = this.minimumTemperature - this.temperatureProperty.value;

      // Sanity check - this all only makes sense if the net change is negative.
      assert && assert(netTemperatureChange <= 0, 'unexpected negative or zero temperature change');

      // Reduce the amount of radiated energy to match this temperature change.
      totalRadiatedEnergyThisStep = -netTemperatureChange * this.mass * this.specificHeatCapacity;
    }

    // Calculate the new temperature using the previous temperature and the changes due to energy absorption and
    // emission.
    this.temperatureProperty.set(this.temperatureProperty.value + netTemperatureChange);

    // Update the state of the at-equilibrium indicator.  Being at equilibrium in this model requires that the incoming
    // and outgoing energy values are equal for a certain amount of time.
    if (Math.abs(absorbedEnergy - totalRadiatedEnergyThisStep) / SURFACE_AREA / dt < AT_EQUILIBRIUM_THRESHOLD) {
      this.atEquilibriumTime = Math.min(this.atEquilibriumTime + dt, EQUILIBRATION_TIME);
      if (this.atEquilibriumTime >= EQUILIBRATION_TIME && !this.atEquilibriumProperty.value) {
        this.atEquilibriumProperty.set(true);
      }
    } else {
      this.atEquilibriumTime = 0;
      if (this.atEquilibriumProperty.value) {
        this.atEquilibriumProperty.set(false);
      }
    }

    // Send out the radiated energy by adding new EM energy packets.
    if (totalRadiatedEnergyThisStep > 0) {
      if (this.substance.radiationDirections.includes(EnergyDirection.DOWN)) {
        emEnergyPackets.push(new EMEnergyPacket(GreenhouseEffectConstants.INFRARED_WAVELENGTH, totalRadiatedEnergyThisStep / numberOfRadiatingSurfaces, this.altitude, EnergyDirection.DOWN));
      }
      if (this.substance.radiationDirections.includes(EnergyDirection.UP)) {
        emEnergyPackets.push(new EMEnergyPacket(GreenhouseEffectConstants.INFRARED_WAVELENGTH, totalRadiatedEnergyThisStep / numberOfRadiatingSurfaces, this.altitude, EnergyDirection.UP));
      }
    }
  }

  /**
   * restore initial state
   */
  reset() {
    this.temperatureProperty.reset();
    this.atEquilibriumProperty.reset();
  }

  // statics
  static WIDTH = SURFACE_DIMENSIONS.width;
  static SURFACE_AREA = SURFACE_AREA;
  static Substance = Substance;
}
greenhouseEffect.register('EnergyAbsorbingEmittingLayer', EnergyAbsorbingEmittingLayer);
export default EnergyAbsorbingEmittingLayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiRW51bWVyYXRpb24iLCJFbnVtZXJhdGlvblZhbHVlIiwib3B0aW9uaXplIiwiUGhldGlvT2JqZWN0IiwiZ3JlZW5ob3VzZUVmZmVjdCIsIkdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMiLCJHcmVlbmhvdXNlRWZmZWN0UXVlcnlQYXJhbWV0ZXJzIiwiRU1FbmVyZ3lQYWNrZXQiLCJFbmVyZ3lEaXJlY3Rpb24iLCJBVF9FUVVJTElCUklVTV9USFJFU0hPTEQiLCJhdEVxdWlsaWJyaXVtVGhyZXNob2xkIiwiRVFVSUxJQlJBVElPTl9USU1FIiwiYXRFcXVpbGlicml1bVRpbWUiLCJTdWJzdGFuY2UiLCJjb25zdHJ1Y3RvciIsImRlbnNpdHkiLCJzcGVjaWZpY0hlYXRDYXBhY2l0eSIsInJhZGlhdGlvbkRpcmVjdGlvbnMiLCJHTEFTUyIsIlVQIiwiRE9XTiIsIkVBUlRIIiwiZW51bWVyYXRpb24iLCJTVVJGQUNFX0RJTUVOU0lPTlMiLCJTVU5MSUdIVF9TUEFOIiwiU1VSRkFDRV9BUkVBIiwid2lkdGgiLCJoZWlnaHQiLCJMQVlFUl9USElDS05FU1MiLCJWT0xVTUUiLCJFbmVyZ3lBYnNvcmJpbmdFbWl0dGluZ0xheWVyIiwiYWx0aXR1ZGUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwic3Vic3RhbmNlIiwiaW5pdGlhbEVuZXJneUFic29ycHRpb25Qcm9wb3J0aW9uIiwibWluaW11bVRlbXBlcmF0dXJlIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9TdGF0ZSIsInRlbXBlcmF0dXJlUHJvcGVydHkiLCJ1bml0cyIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0hpZ2hGcmVxdWVuY3kiLCJlbmVyZ3lBYnNvcnB0aW9uUHJvcG9ydGlvblByb3BlcnR5IiwicmFuZ2UiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiYXRFcXVpbGlicml1bVByb3BlcnR5IiwibWFzcyIsImludGVyYWN0V2l0aEVuZXJneVBhY2tldHMiLCJlbUVuZXJneVBhY2tldHMiLCJhc3NlcnQiLCJlbmVyZ3lQYWNrZXRDcm9zc2VkVGhpc0xheWVyIiwiZW5lcmd5UGFja2V0IiwicHJldmlvdXNBbHRpdHVkZSIsImludGVyYWN0V2l0aEVuZXJneSIsImR0IiwiYWJzb3JiZWRFbmVyZ3kiLCJfIiwicmVtb3ZlIiwiZW1FbmVyZ3lQYWNrZXQiLCJlbmVyZ3kiLCJ0ZW1wZXJhdHVyZUNoYW5nZUR1ZVRvSW5jb21pbmdFbmVyZ3kiLCJyYWRpYXRlZEVuZXJneVBlclVuaXRTdXJmYWNlQXJlYSIsIk1hdGgiLCJwb3ciLCJ2YWx1ZSIsIlNURUZBTl9CT0xUWk1BTk5fQ09OU1RBTlQiLCJudW1iZXJPZlJhZGlhdGluZ1N1cmZhY2VzIiwibGVuZ3RoIiwidG90YWxSYWRpYXRlZEVuZXJneVRoaXNTdGVwIiwidGVtcGVyYXR1cmVDaGFuZ2VEdWVUb1JhZGlhdGVkRW5lcmd5IiwibmV0VGVtcGVyYXR1cmVDaGFuZ2UiLCJzZXQiLCJhYnMiLCJtaW4iLCJpbmNsdWRlcyIsInB1c2giLCJJTkZSQVJFRF9XQVZFTEVOR1RIIiwicmVzZXQiLCJXSURUSCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRW5lcmd5QWJzb3JiaW5nRW1pdHRpbmdMYXllci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIG1vZGVsIG9mIGEgaG9yaXpvbnRhbCBsYXllciBvZiBhIG1hdGVyaWFsIHRoYXQgYWJzb3JicyBlbmVyZ3ksIGhlYXRzIHVwLCBhbmQgdGhlbiByYWRpYXRlcyBlbmVyZ3kgYXMgYSBibGFjayBib2R5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzIGZyb20gJy4uL0dyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdFF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9HcmVlbmhvdXNlRWZmZWN0UXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IEVNRW5lcmd5UGFja2V0IGZyb20gJy4vRU1FbmVyZ3lQYWNrZXQuanMnO1xyXG5pbXBvcnQgRW5lcmd5RGlyZWN0aW9uIGZyb20gJy4vRW5lcmd5RGlyZWN0aW9uLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBBVF9FUVVJTElCUklVTV9USFJFU0hPTEQgPSBHcmVlbmhvdXNlRWZmZWN0UXVlcnlQYXJhbWV0ZXJzLmF0RXF1aWxpYnJpdW1UaHJlc2hvbGQ7IC8vIGluIFdhdHRzIHBlciBzcXVhcmUgbWV0ZXIsIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuXHJcbi8vIFRoaXMgY29uc3RhbnQgZGVmaW5lcyB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCB0aGUgaW5jb21pbmcgYW5kIG91dGdvaW5nIGVuZXJnaWVzIGhhdmUgdG8gYmUgZXF1YWwgKHdpdGhpbiBhXHJcbi8vIHRocmVzaG9sZCkgYmVmb3JlIGRlY2lkaW5nIHRoYXQgdGhlIGxheWVyIGlzIGF0IHRoZXJtYWwgZXF1aWxpYnJpdW0uICBUaGlzIGlzIGluIHNlY29uZHMsIGFuZCB3YXMgZW1waXJpY2FsbHlcclxuLy8gZGV0ZXJtaW5lZC5cclxuY29uc3QgRVFVSUxJQlJBVElPTl9USU1FID0gR3JlZW5ob3VzZUVmZmVjdFF1ZXJ5UGFyYW1ldGVycy5hdEVxdWlsaWJyaXVtVGltZTtcclxuXHJcbi8vIFRoZSB2YXJpb3VzIHN1YnN0YW5jZXMgdGhhdCB0aGlzIGxheWVyIGNhbiBtb2RlbC5cclxuY2xhc3MgU3Vic3RhbmNlIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XHJcblxyXG4gIC8vIEluIGtnL21eM1xyXG4gIHB1YmxpYyByZWFkb25seSBkZW5zaXR5OiBudW1iZXI7XHJcblxyXG4gIC8vIEluIEova2fCsEtcclxuICBwdWJsaWMgcmVhZG9ubHkgc3BlY2lmaWNIZWF0Q2FwYWNpdHk6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHJhZGlhdGlvbkRpcmVjdGlvbnM6IEVuZXJneURpcmVjdGlvbltdO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGRlbnNpdHk6IG51bWJlciwgc3BlY2lmaWNIZWF0Q2FwYWNpdHk6IG51bWJlciwgcmFkaWF0aW9uRGlyZWN0aW9uczogRW5lcmd5RGlyZWN0aW9uW10gKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIHRoaXMuZGVuc2l0eSA9IGRlbnNpdHk7XHJcbiAgICB0aGlzLnNwZWNpZmljSGVhdENhcGFjaXR5ID0gc3BlY2lmaWNIZWF0Q2FwYWNpdHk7XHJcbiAgICB0aGlzLnJhZGlhdGlvbkRpcmVjdGlvbnMgPSByYWRpYXRpb25EaXJlY3Rpb25zO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBHTEFTUyA9IG5ldyBTdWJzdGFuY2UoIDI1MDAsIDg0MCwgWyBFbmVyZ3lEaXJlY3Rpb24uVVAsIEVuZXJneURpcmVjdGlvbi5ET1dOIF0gKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEVBUlRIID0gbmV3IFN1YnN0YW5jZSggMTI1MCwgMTI1MCwgWyBFbmVyZ3lEaXJlY3Rpb24uVVAgXSApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGVudW1lcmF0aW9uID0gbmV3IEVudW1lcmF0aW9uKCBTdWJzdGFuY2UgKTtcclxufVxyXG5cclxuLy8gVGhlIHNpemUgb2YgdGhlIGVuZXJneSBhYnNvcmJpbmcgbGF5ZXJzIGFyZSBhbGwgdGhlIHNhbWUgaW4gdGhlIEdyZWVuaG91c2UgRWZmZWN0IHNpbSBhbmQgYXJlIG5vdCBwYXJhbWV0ZXJpemVkLlxyXG4vLyBUaGUgbGF5ZXIgaXMgbW9kZWxlZCBhcyBhIDEtbWV0ZXIgd2lkZSBzdHJpcCB0aGF0IHNwYW5zIHRoZSB3aWR0aCBvZiB0aGUgc2ltdWxhdGVkIHN1bmxpZ2h0LiAgUGljdHVyZSBpdCBsaWtlIGFcclxuLy8gc2lkZXdhbGsuICBUaGUgZGltZW5zaW9ucyBhcmUgaW4gbWV0ZXJzLlxyXG5jb25zdCBTVVJGQUNFX0RJTUVOU0lPTlMgPSBHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLlNVTkxJR0hUX1NQQU47XHJcbmNvbnN0IFNVUkZBQ0VfQVJFQSA9IFNVUkZBQ0VfRElNRU5TSU9OUy53aWR0aCAqIFNVUkZBQ0VfRElNRU5TSU9OUy5oZWlnaHQ7XHJcblxyXG4vLyBUaGUgdGhpY2tuZXNzIG9mIHRoZSBsYXllciBpcyBwcmltYXJpbHkgdXNlZCBpbiB2b2x1bWUgY2FsY3VsYXRpb25zIHdoaWNoIGFyZSB0aGVuIHVzZWQgaW4gdGhlIHNwZWNpZmljIGhlYXQgZm9ybXVsYS5cclxuLy8gVGhlIHZhbHVlIHVzZWQgaGVyZSBpcyBpbiBtZXRlcnMsIGFuZCBpdCBpcyByaWRpY3Vsb3VzbHkgc21hbGwuICBUaGlzIGlzIGRvbmUgc28gdGhhdCB0aGUgbGF5ZXJzIGNoYW5nZSB0ZW1wZXJhdHVyZVxyXG4vLyB2ZXJ5IHF1aWNrbHkgaW4gcmVzcG9uc2UgdG8gaW5jb21pbmcgZW5lcmd5LiAgVGhpcyBpcyB0aGUgbWFpbiBwbGFjZSB3aGVyZSBhZGp1c3RtZW50cyBzaG91bGQgYmUgbWFkZSB0byBpbmNyZWFzZSBvclxyXG4vLyBkZWNyZWFzZSB0aGUgcmF0ZXMgYXQgd2hpY2ggdGVtcGVyYXR1cmVzIGNoYW5nZSBpbiB0aGUgc2ltLlxyXG5jb25zdCBMQVlFUl9USElDS05FU1MgPSAwLjAwMDAwMDM7XHJcblxyXG5jb25zdCBWT0xVTUUgPSBTVVJGQUNFX0RJTUVOU0lPTlMud2lkdGggKiBTVVJGQUNFX0RJTUVOU0lPTlMuaGVpZ2h0ICogTEFZRVJfVEhJQ0tORVNTO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBzdWJzdGFuY2U/OiBTdWJzdGFuY2U7XHJcbiAgaW5pdGlhbEVuZXJneUFic29ycHRpb25Qcm9wb3J0aW9uPzogbnVtYmVyO1xyXG4gIG1pbmltdW1UZW1wZXJhdHVyZT86IG51bWJlcjtcclxufTtcclxuZXhwb3J0IHR5cGUgRW5lcmd5QWJzb3JiaW5nRW1pdHRpbmdMYXllck9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBoZXRpb09iamVjdE9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8UGhldGlvT2JqZWN0T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuY2xhc3MgRW5lcmd5QWJzb3JiaW5nRW1pdHRpbmdMYXllciBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIC8vIFRoZSBhbHRpdHVkZSBpbiBtZXRlcnMgd2hlcmUgdGhpcyBsYXllciBleGlzdHMsXHJcbiAgcHVibGljIHJlYWRvbmx5IGFsdGl0dWRlOiBudW1iZXI7XHJcblxyXG4gIC8vIFRoZSB0ZW1wZXJhdHVyZSBvZiB0aGlzIGxheWVyIGluIGRlZ3JlZXMgS2VsdmluLiAgV2UgbW9kZWwgaXQgYXQgYWJzb2x1dGUgemVybyBieSBkZWZhdWx0IHNvIHRoYXQgaXQgaXNuJ3RcclxuICAvLyByYWRpYXRpbmcgYW55dGhpbmcsIGFuZCBwcm9kdWNlIGEgY29tcGVuc2F0ZWQgdGVtcGVyYXR1cmUgdGhhdCBwcm9kdWNlcyB2YWx1ZXMgbW9yZSByZWFzb25hYmxlIHRvIHRoZSBzdXJmYWNlIG9mXHJcbiAgLy8gdGhlIEVhcnRoIGFuZCBpdHMgYXRtb3NwaGVyZS5cclxuICBwdWJsaWMgcmVhZG9ubHkgdGVtcGVyYXR1cmVQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcblxyXG4gIC8vIFRoZSBwcm9wb3J0aW9uIG9mIGVuZXJneSBjb21pbmcgaW50byB0aGlzIGxheWVyIHRoYXQgaXMgYWJzb3JiZWQgYW5kIHRodXMgY29udHJpYnV0ZXMgdG8gYW4gaW5jcmVhc2UgaW5cclxuICAvLyB0ZW1wZXJhdHVyZS4gIE5vbi1hYnNvcmJlZCBlbmVyZ3kgaXMgc2ltcGx5IHBhc3NlZCBmcm9tIHRoZSBpbnB1dCB0byB0aGUgb3V0cHV0LlxyXG4gIHB1YmxpYyByZWFkb25seSBlbmVyZ3lBYnNvcnB0aW9uUHJvcG9ydGlvblByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuXHJcbiAgLy8gT3RoZXIgZmllbGRzIHdob3NlIG1lYW5pbmcgc2hvdWxkIGJlIHJlYXNvbmFibHkgb2J2aW91cy5cclxuICBwcml2YXRlIHJlYWRvbmx5IHN1YnN0YW5jZTogU3Vic3RhbmNlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWFzczogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc3BlY2lmaWNIZWF0Q2FwYWNpdHk6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbWluaW11bVRlbXBlcmF0dXJlOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGF0RXF1aWxpYnJpdW1Qcm9wZXJ0eTogQm9vbGVhblByb3BlcnR5O1xyXG4gIHByaXZhdGUgYXRFcXVpbGlicml1bVRpbWU6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhbHRpdHVkZTogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM/OiBFbmVyZ3lBYnNvcmJpbmdFbWl0dGluZ0xheWVyT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEVuZXJneUFic29yYmluZ0VtaXR0aW5nTGF5ZXJPcHRpb25zLCBTZWxmT3B0aW9ucywgUGhldGlvT2JqZWN0T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gZGVmYXVsdCB0byBnbGFzc1xyXG4gICAgICBzdWJzdGFuY2U6IFN1YnN0YW5jZS5HTEFTUyxcclxuXHJcbiAgICAgIC8vIGluaXRpYWwgc2V0dGluZyBmb3IgdGhlIGFic29ycHRpb24gcHJvcG9ydGlvbiwgbXVzdCBiZSBmcm9tIDAgdG8gMSBpbmNsdXNpdmVcclxuICAgICAgaW5pdGlhbEVuZXJneUFic29ycHRpb25Qcm9wb3J0aW9uOiAxLFxyXG5cclxuICAgICAgLy8gVGhlIG1pbmltdW0gdGVtcGVyYXR1cmUgdGhhdCB0aGlzIGxheWVyIGNhbiBnZXQgdG8sIGluIGRlZ3JlZXMgS2VsdmluLiAgVGhpcyB3aWxsIGFsc28gYmUgdGhlIHRlbXBlcmF0dXJlIGF0XHJcbiAgICAgIC8vIHdoaWNoIGl0IGlzIG9yaWdpbmFsbHkgc2V0IHRvLiAgV2hlbiBhdCB0aGlzIHRlbXBlcmF0dXJlLCB0aGUgbGF5ZXIgd2lsbCByYWRpYXRlIG5vIGVuZXJneS5cclxuICAgICAgLy8gVE9ETzogRGVjaWRlIHdoZXRoZXIgdGhpcyBpcyByZWFsbHkgd29ydGgga2VlcGluZy4gIEl0J3MgdHJpY2t5LCBhbmQgbWF5IG5vdCBiZSB3aGF0IHdlIHJlYWxseSB1bHRpbWF0ZWx5IHdhbnQuXHJcbiAgICAgIG1pbmltdW1UZW1wZXJhdHVyZTogMCxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZVxyXG5cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5hbHRpdHVkZSA9IGFsdGl0dWRlO1xyXG5cclxuICAgIHRoaXMudGVtcGVyYXR1cmVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggb3B0aW9ucy5taW5pbXVtVGVtcGVyYXR1cmUsIHtcclxuICAgICAgdW5pdHM6ICdLJyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0ZW1wZXJhdHVyZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZW5lcmd5QWJzb3JwdGlvblByb3BvcnRpb25Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggb3B0aW9ucy5pbml0aWFsRW5lcmd5QWJzb3JwdGlvblByb3BvcnRpb24sIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMSApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZXJneUFic29ycHRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdQcm9wb3J0aW9uLCBmcm9tIDAgdG8gMSwgb2YgbGlnaHQgZW5lcmd5IGFic29yYmVkIGZvciBpbnRlcmFjdGluZyB3YXZlbGVuZ3Rocy4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQSBwcm9wZXJ0eSB0aGF0IGlzIHRydWUgd2hlbiB0aGlzIGxheWVyIGlzIGluIGVxdWlsaWJyaXVtLCBtZWFuaW5nIHRoYXQgdGhlIGFtb3VudCBvZiBlbmVyZ3kgY29taW5nIGluIGlzIGVxdWFsXHJcbiAgICAvLyB0byBvciBhdCBsZWFzdCB2ZXJ5IGNsb3NlIHRvIHRoZSBhbW91bnQgb2YgZW5lcmd5IGdvaW5nIG91dC5cclxuICAgIHRoaXMuYXRFcXVpbGlicml1bVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2F0RXF1aWxpYnJpdW1Qcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnN1YnN0YW5jZSA9IG9wdGlvbnMuc3Vic3RhbmNlO1xyXG4gICAgdGhpcy5tYXNzID0gVk9MVU1FICogb3B0aW9ucy5zdWJzdGFuY2UuZGVuc2l0eTtcclxuICAgIHRoaXMuc3BlY2lmaWNIZWF0Q2FwYWNpdHkgPSBvcHRpb25zLnN1YnN0YW5jZS5zcGVjaWZpY0hlYXRDYXBhY2l0eTtcclxuICAgIHRoaXMubWluaW11bVRlbXBlcmF0dXJlID0gb3B0aW9ucy5taW5pbXVtVGVtcGVyYXR1cmUhO1xyXG4gICAgdGhpcy5hdEVxdWlsaWJyaXVtVGltZSA9IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnRlcmFjdCB3aXRoIHRoZSBwcm92aWRlZCBlbmVyZ3kgcGFja2V0cy4gIFRoaXMgYmVoYXZpb3IgdmFyaWVzIGRlcGVuZGluZyBvbiB0aGUgbmF0dXJlIG9mIHRoZSBsYXllciwgYW5kIG11c3RcclxuICAgKiB0aGVyZWZvcmUgYmUgb3ZlcnJpZGRlbiBpbiBkZXNjZW5kYW50IGNsYXNzZXMuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGludGVyYWN0V2l0aEVuZXJneVBhY2tldHMoIGVtRW5lcmd5UGFja2V0czogRU1FbmVyZ3lQYWNrZXRbXSApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICd0aGlzIG1ldGhvZCBtdXN0IGJlIG92ZXJyaWRkZW4gaW4gZGVzY2VuZGFudCBjbGFzc2VzJyApO1xyXG4gICAgcmV0dXJuIDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHByb3ZpZGVkIGVuZXJneSBwYWNrZXQgY3Jvc3NlZCBvdmVyIHRoaXMgbGF5ZXIgZHVyaW5nIGl0cyBsYXRlc3Qgc3RlcC5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgZW5lcmd5UGFja2V0Q3Jvc3NlZFRoaXNMYXllciggZW5lcmd5UGFja2V0OiBFTUVuZXJneVBhY2tldCApOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGFsdGl0dWRlID0gdGhpcy5hbHRpdHVkZTtcclxuICAgIHJldHVybiAoIGVuZXJneVBhY2tldC5wcmV2aW91c0FsdGl0dWRlID4gYWx0aXR1ZGUgJiYgZW5lcmd5UGFja2V0LmFsdGl0dWRlIDw9IGFsdGl0dWRlICkgfHxcclxuICAgICAgICAgICAoIGVuZXJneVBhY2tldC5wcmV2aW91c0FsdGl0dWRlIDwgYWx0aXR1ZGUgJiYgZW5lcmd5UGFja2V0LmFsdGl0dWRlID49IGFsdGl0dWRlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnRlcmFjdCB3aXRoIHRoZSBwcm92aWRlZCBlbmVyZ3kuICBFbmVyZ3kgbWF5IGJlIHJlZmxlY3RlZCwgYWJzb3JiZWQsIG9yIGlnbm9yZWQuXHJcbiAgICovXHJcbiAgcHVibGljIGludGVyYWN0V2l0aEVuZXJneSggZW1FbmVyZ3lQYWNrZXRzOiBFTUVuZXJneVBhY2tldFtdLCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIC8vIEludGVyYWN0IHdpdGggdGhlIGluZGl2aWR1YWwgZW5lcmd5IHBhY2tldHMgYW5kIGZpZ3VyZSBvdXQgaG93IG11Y2ggZW5lcmd5IHRvIGFic29yYiBmcm9tIHRoZW0uICBUaGUgZW5lcmd5XHJcbiAgICAvLyBwYWNrZXRzIGNhbiBiZSB1cGRhdGVkLCBhbmQgb2Z0ZW4gYXJlLCBkdXJpbmcgdGhpcyBzdGVwLlxyXG4gICAgY29uc3QgYWJzb3JiZWRFbmVyZ3k6IG51bWJlciA9IHRoaXMuaW50ZXJhY3RXaXRoRW5lcmd5UGFja2V0cyggZW1FbmVyZ3lQYWNrZXRzICk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIGFueSBlbmVyZ3kgcGFja2V0cyB0aGF0IHdlcmUgZnVsbHkgYWJzb3JiZWQuXHJcbiAgICBfLnJlbW92ZSggZW1FbmVyZ3lQYWNrZXRzLCBlbUVuZXJneVBhY2tldCA9PiBlbUVuZXJneVBhY2tldC5lbmVyZ3kgPT09IDAgKTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgdGhlIHRlbXBlcmF0dXJlIGNoYW5nZSB0aGF0IHdvdWxkIG9jY3VyIGR1ZSB0byB0aGUgaW5jb21pbmcgZW5lcmd5IHVzaW5nIHRoZSBzcGVjaWZpYyBoZWF0IGZvcm11bGEuXHJcbiAgICBjb25zdCB0ZW1wZXJhdHVyZUNoYW5nZUR1ZVRvSW5jb21pbmdFbmVyZ3kgPSBhYnNvcmJlZEVuZXJneSAvICggdGhpcy5tYXNzICogdGhpcy5zcGVjaWZpY0hlYXRDYXBhY2l0eSApO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSB0aGUgYW1vdW50IG9mIGVuZXJneSB0aGF0IHRoaXMgbGF5ZXIgd2lsbCByYWRpYXRlIHBlciB1bml0IGFyZWEgYXQgaXRzIGN1cnJlbnQgdGVtcGVyYXR1cmUgdXNpbmcgdGhlXHJcbiAgICAvLyBTdGVmYW4tQm9sdHptYW5uIGVxdWF0aW9uLiAgVGhpcyBjYWxjdWxhdGlvbiBkb2Vzbid0IGFsbG93IHRoZSBlbmVyZ3kgdG8gcmFkaWF0ZSBpZiBpdCBpcyBiZWxvdyB0aGUgaW5pdGlhbFxyXG4gICAgLy8gdGVtcGVyYXR1cmUsIHdoaWNoIGlzIG5vdCByZWFsIHBoeXNpY3MsIGJ1dCBpcyBuZWVkZWQgZm9yIHRoZSBkZXNpcmVkIGJlaGF2aW9yIG9mIHRoZSBzaW0uXHJcbiAgICBjb25zdCByYWRpYXRlZEVuZXJneVBlclVuaXRTdXJmYWNlQXJlYSA9IE1hdGgucG93KCB0aGlzLnRlbXBlcmF0dXJlUHJvcGVydHkudmFsdWUsIDQgKSAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuU1RFRkFOX0JPTFRaTUFOTl9DT05TVEFOVCAqIGR0O1xyXG5cclxuICAgIC8vIFRoZSB0b3RhbCByYWRpYXRlZCBlbmVyZ3kgZGVwZW5kcyBvbiB3aGV0aGVyIHRoaXMgbGF5ZXIgaXMgcmFkaWF0aW5nIGluIG9uZSBkaXJlY3Rpb24gb3IgdHdvLlxyXG4gICAgY29uc3QgbnVtYmVyT2ZSYWRpYXRpbmdTdXJmYWNlcyA9IHRoaXMuc3Vic3RhbmNlLnJhZGlhdGlvbkRpcmVjdGlvbnMubGVuZ3RoO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbnVtYmVyT2ZSYWRpYXRpbmdTdXJmYWNlcyA9PT0gMSB8fCBudW1iZXJPZlJhZGlhdGluZ1N1cmZhY2VzID09PSAyICk7XHJcbiAgICBsZXQgdG90YWxSYWRpYXRlZEVuZXJneVRoaXNTdGVwID0gcmFkaWF0ZWRFbmVyZ3lQZXJVbml0U3VyZmFjZUFyZWEgKiBTVVJGQUNFX0FSRUEgKiBudW1iZXJPZlJhZGlhdGluZ1N1cmZhY2VzO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSB0aGUgdGVtcGVyYXR1cmUgY2hhbmdlIHRoYXQgd291bGQgb2NjdXIgZHVlIHRvIHRoZSByYWRpYXRlZCBlbmVyZ3kuXHJcbiAgICBjb25zdCB0ZW1wZXJhdHVyZUNoYW5nZUR1ZVRvUmFkaWF0ZWRFbmVyZ3kgPSAtdG90YWxSYWRpYXRlZEVuZXJneVRoaXNTdGVwIC8gKCB0aGlzLm1hc3MgKiB0aGlzLnNwZWNpZmljSGVhdENhcGFjaXR5ICk7XHJcblxyXG4gICAgLy8gVG90YWwgdGhlIHR3byB0ZW1wZXJhdHVyZSBjaGFuZ2UgdmFsdWVzLlxyXG4gICAgbGV0IG5ldFRlbXBlcmF0dXJlQ2hhbmdlID0gdGVtcGVyYXR1cmVDaGFuZ2VEdWVUb0luY29taW5nRW5lcmd5ICsgdGVtcGVyYXR1cmVDaGFuZ2VEdWVUb1JhZGlhdGVkRW5lcmd5O1xyXG5cclxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGNhbGN1bGF0ZWQgdGVtcGVyYXR1cmUgY2hhbmdlcyB3b3VsZCBjYXVzZSB0aGlzIGxheWVyJ3MgdGVtcGVyYXR1cmUgdG8gZ28gYmVsb3cgaXRzIG1pbmltdW1cclxuICAgIC8vIHZhbHVlLiAgSWYgc28sIGxpbWl0IHRoZSByYWRpYXRlZCBlbmVyZ3kgc28gdGhhdCB0aGlzIGRvZXNuJ3QgaGFwcGVuLiAgVEhJUyBJUyBOT04tUEhZU0lDQUwsIGJ1dCBpcyBuZWNlc3Nhcnkgc29cclxuICAgIC8vIHRoYXQgdGhlIGxheWVyIGRvZXNuJ3QgZmFsbCBiZWxvdyB0aGUgbWluaW11bSB0ZW1wZXJhdHVyZS4gIEluIGEgcmVhbCBzeXN0ZW0sIGl0IHdvdWxkIHJhZGlhdGUgdW50aWwgaXQgcmVhY2hlZFxyXG4gICAgLy8gYWJzb2x1dGUgemVyby5cclxuICAgIGlmICggdGhpcy50ZW1wZXJhdHVyZVByb3BlcnR5LnZhbHVlICsgbmV0VGVtcGVyYXR1cmVDaGFuZ2UgPCB0aGlzLm1pbmltdW1UZW1wZXJhdHVyZSApIHtcclxuXHJcbiAgICAgIC8vIFJlZHVjZSB0aGUgbWFnbml0dWRlIG9mIHRoZSB0ZW1wZXJhdHVyZSBjaGFuZ2Ugc3VjaCB0aGF0IGl0IHdpbGwgbm90IHRha2UgdGhlIHRlbXBlcmF0dXJlIGJlbG93IHRoZSBtaW4gdmFsdWUuXHJcbiAgICAgIG5ldFRlbXBlcmF0dXJlQ2hhbmdlID0gdGhpcy5taW5pbXVtVGVtcGVyYXR1cmUgLSB0aGlzLnRlbXBlcmF0dXJlUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICAvLyBTYW5pdHkgY2hlY2sgLSB0aGlzIGFsbCBvbmx5IG1ha2VzIHNlbnNlIGlmIHRoZSBuZXQgY2hhbmdlIGlzIG5lZ2F0aXZlLlxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZXRUZW1wZXJhdHVyZUNoYW5nZSA8PSAwLCAndW5leHBlY3RlZCBuZWdhdGl2ZSBvciB6ZXJvIHRlbXBlcmF0dXJlIGNoYW5nZScgKTtcclxuXHJcbiAgICAgIC8vIFJlZHVjZSB0aGUgYW1vdW50IG9mIHJhZGlhdGVkIGVuZXJneSB0byBtYXRjaCB0aGlzIHRlbXBlcmF0dXJlIGNoYW5nZS5cclxuICAgICAgdG90YWxSYWRpYXRlZEVuZXJneVRoaXNTdGVwID0gLW5ldFRlbXBlcmF0dXJlQ2hhbmdlICogdGhpcy5tYXNzICogdGhpcy5zcGVjaWZpY0hlYXRDYXBhY2l0eTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgdGhlIG5ldyB0ZW1wZXJhdHVyZSB1c2luZyB0aGUgcHJldmlvdXMgdGVtcGVyYXR1cmUgYW5kIHRoZSBjaGFuZ2VzIGR1ZSB0byBlbmVyZ3kgYWJzb3JwdGlvbiBhbmRcclxuICAgIC8vIGVtaXNzaW9uLlxyXG4gICAgdGhpcy50ZW1wZXJhdHVyZVByb3BlcnR5LnNldCggdGhpcy50ZW1wZXJhdHVyZVByb3BlcnR5LnZhbHVlICsgbmV0VGVtcGVyYXR1cmVDaGFuZ2UgKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHN0YXRlIG9mIHRoZSBhdC1lcXVpbGlicml1bSBpbmRpY2F0b3IuICBCZWluZyBhdCBlcXVpbGlicml1bSBpbiB0aGlzIG1vZGVsIHJlcXVpcmVzIHRoYXQgdGhlIGluY29taW5nXHJcbiAgICAvLyBhbmQgb3V0Z29pbmcgZW5lcmd5IHZhbHVlcyBhcmUgZXF1YWwgZm9yIGEgY2VydGFpbiBhbW91bnQgb2YgdGltZS5cclxuICAgIGlmICggTWF0aC5hYnMoIGFic29yYmVkRW5lcmd5IC0gdG90YWxSYWRpYXRlZEVuZXJneVRoaXNTdGVwICkgLyBTVVJGQUNFX0FSRUEgLyBkdCA8IEFUX0VRVUlMSUJSSVVNX1RIUkVTSE9MRCApIHtcclxuICAgICAgdGhpcy5hdEVxdWlsaWJyaXVtVGltZSA9IE1hdGgubWluKCB0aGlzLmF0RXF1aWxpYnJpdW1UaW1lICsgZHQsIEVRVUlMSUJSQVRJT05fVElNRSApO1xyXG4gICAgICBpZiAoIHRoaXMuYXRFcXVpbGlicml1bVRpbWUgPj0gRVFVSUxJQlJBVElPTl9USU1FICYmICF0aGlzLmF0RXF1aWxpYnJpdW1Qcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLmF0RXF1aWxpYnJpdW1Qcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuYXRFcXVpbGlicml1bVRpbWUgPSAwO1xyXG4gICAgICBpZiAoIHRoaXMuYXRFcXVpbGlicml1bVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHRoaXMuYXRFcXVpbGlicml1bVByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNlbmQgb3V0IHRoZSByYWRpYXRlZCBlbmVyZ3kgYnkgYWRkaW5nIG5ldyBFTSBlbmVyZ3kgcGFja2V0cy5cclxuICAgIGlmICggdG90YWxSYWRpYXRlZEVuZXJneVRoaXNTdGVwID4gMCApIHtcclxuICAgICAgaWYgKCB0aGlzLnN1YnN0YW5jZS5yYWRpYXRpb25EaXJlY3Rpb25zLmluY2x1ZGVzKCBFbmVyZ3lEaXJlY3Rpb24uRE9XTiApICkge1xyXG4gICAgICAgIGVtRW5lcmd5UGFja2V0cy5wdXNoKCBuZXcgRU1FbmVyZ3lQYWNrZXQoXHJcbiAgICAgICAgICBHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLklORlJBUkVEX1dBVkVMRU5HVEgsXHJcbiAgICAgICAgICB0b3RhbFJhZGlhdGVkRW5lcmd5VGhpc1N0ZXAgLyBudW1iZXJPZlJhZGlhdGluZ1N1cmZhY2VzLFxyXG4gICAgICAgICAgdGhpcy5hbHRpdHVkZSxcclxuICAgICAgICAgIEVuZXJneURpcmVjdGlvbi5ET1dOXHJcbiAgICAgICAgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdGhpcy5zdWJzdGFuY2UucmFkaWF0aW9uRGlyZWN0aW9ucy5pbmNsdWRlcyggRW5lcmd5RGlyZWN0aW9uLlVQICkgKSB7XHJcbiAgICAgICAgZW1FbmVyZ3lQYWNrZXRzLnB1c2goIG5ldyBFTUVuZXJneVBhY2tldChcclxuICAgICAgICAgIEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuSU5GUkFSRURfV0FWRUxFTkdUSCxcclxuICAgICAgICAgIHRvdGFsUmFkaWF0ZWRFbmVyZ3lUaGlzU3RlcCAvIG51bWJlck9mUmFkaWF0aW5nU3VyZmFjZXMsXHJcbiAgICAgICAgICB0aGlzLmFsdGl0dWRlLFxyXG4gICAgICAgICAgRW5lcmd5RGlyZWN0aW9uLlVQXHJcbiAgICAgICAgKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZXN0b3JlIGluaXRpYWwgc3RhdGVcclxuICAgKi9cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnRlbXBlcmF0dXJlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYXRFcXVpbGlicml1bVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvLyBzdGF0aWNzXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBXSURUSCA9IFNVUkZBQ0VfRElNRU5TSU9OUy53aWR0aDtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFNVUkZBQ0VfQVJFQSA9IFNVUkZBQ0VfQVJFQTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFN1YnN0YW5jZSA9IFN1YnN0YW5jZTtcclxufVxyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ0VuZXJneUFic29yYmluZ0VtaXR0aW5nTGF5ZXInLCBFbmVyZ3lBYnNvcmJpbmdFbWl0dGluZ0xheWVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IEVuZXJneUFic29yYmluZ0VtaXR0aW5nTGF5ZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFF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