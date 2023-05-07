// Copyright 2018-2022, University of Colorado Boulder

/**
 * A class for the fan, which is an energy user
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import fanIcon_png from '../../../images/fanIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergyUser from './EnergyUser.js';

// constants
const ANGULAR_ACCELERATION = Math.PI * 4; // In radians/(sec^2).
const MINIMUM_TARGET_VELOCITY = 4; // In radians/sec. Any speed lower than this looks choppy, so this is the cutoff
const INCOMING_ENERGY_VELOCITY_COEFFICIENT = 0.0051; // empirically determined. used to map incoming energy to a target velocity
const MAX_INTERNAL_ENERGY = EFACConstants.ENERGY_PER_CHUNK * 4;
const ENERGY_LOST_PROPORTION = 0.30; // used to remove some energy from internal energy when a target velocity is set

// empirically determined. used to map internal energy to a target velocity. the value is so specific because the speed
// of the fan when using internal energy should closely match its speed when using incoming energy
const INTERNAL_ENERGY_VELOCITY_COEFFICIENT = 0.00255;

// constants for temperature
const ROOM_TEMPERATURE = 22; // in Celsius
const TEMPERATURE_GAIN_PER_ENERGY_CHUNK = 1.5; // in Celsius
const THERMAL_RELEASE_TEMPERATURE = 38; // in Celsius
const COOLING_RATE = 0.5; // in degrees Celsius per second

// energy chunk path vars
const WIRE_START_OFFSET = new Vector2(-0.055, -0.0435);
const WIRE_CURVE_POINT_1_OFFSET = new Vector2(-0.0425, -0.0405);
const WIRE_CURVE_POINT_2_OFFSET = new Vector2(-0.0385, -0.039);
const WIRE_CURVE_POINT_3_OFFSET = new Vector2(-0.0345, -0.0365);
const WIRE_CURVE_POINT_4_OFFSET = new Vector2(-0.0305, -0.033);
const WIRE_CURVE_POINT_5_OFFSET = new Vector2(-0.0265, -0.024);
const FAN_MOTOR_INTERIOR_OFFSET = new Vector2(-0.0265, 0.019);
const INSIDE_FAN_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.05; // in meters
const BLOWN_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.3; // in meters
const ELECTRICAL_ENERGY_CHUNK_OFFSETS = [WIRE_START_OFFSET, WIRE_CURVE_POINT_1_OFFSET, WIRE_CURVE_POINT_2_OFFSET, WIRE_CURVE_POINT_3_OFFSET, WIRE_CURVE_POINT_4_OFFSET, WIRE_CURVE_POINT_5_OFFSET, FAN_MOTOR_INTERIOR_OFFSET];
class Fan extends EnergyUser {
  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Object} [options]
   */
  constructor(energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, options) {
    options = merge({
      tandem: Tandem.REQUIRED
    }, options);
    super(new Image(fanIcon_png), options);

    // @public (read-only) {NumberProperty}
    this.bladePositionProperty = new NumberProperty(0, {
      range: new Range(0, 2 * Math.PI),
      units: 'radians',
      tandem: options.tandem.createTandem('bladePositionProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the angle of the blade'
    });

    // @private - movers that control how the energy chunks move towards and through the fan
    this.electricalEnergyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('electricalEnergyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });
    this.mechanicalEnergyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('mechanicalEnergyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });
    this.radiatedEnergyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('radiatedEnergyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });

    // @private
    this.angularVelocityProperty = new NumberProperty(0, {
      units: 'radians/s',
      tandem: options.tandem.createTandem('angularVelocityProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the angular velocity of the blade'
    });

    // @private
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;

    // @private {number} - the internal energy of the fan, which is only used by energy chunks, not incomingEnergy.
    // incoming chunks add their energy values to this, which is then used to determine a target velocity for the fan.
    this.internalEnergyFromEnergyChunksProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('internalEnergyFromEnergyChunksProperty'),
      phetioReadOnly: true
    });

    // @private {number} - a temperature value used to decide when to release thermal energy chunks, very roughly in
    // degrees Celsius
    this.internalTemperature = ROOM_TEMPERATURE;
    this.targetVelocityProperty = new NumberProperty(0, {
      units: 'radians/s',
      tandem: options.tandem.createTandem('targetVelocityProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the target velocity of the blade'
    });
  }

  /**
   * @param {number} dt - time step, in seconds
   * @param {Energy} incomingEnergy
   * @public
   */
  step(dt, incomingEnergy) {
    if (!this.activeProperty.value) {
      return;
    }

    // handle any incoming energy chunks
    if (this.incomingEnergyChunks.length > 0) {
      this.incomingEnergyChunks.forEach(chunk => {
        assert && assert(chunk.energyTypeProperty.value === EnergyType.ELECTRICAL, `Energy chunk type should be ELECTRICAL but is ${chunk.energyTypeProperty.value}`);

        // add the energy chunk to the list of those under management
        this.energyChunkList.push(chunk);

        // add a "mover" that will move this energy chunk through the wire to the motor
        this.electricalEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(chunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.value, ELECTRICAL_ENERGY_CHUNK_OFFSETS), EFACConstants.ENERGY_CHUNK_VELOCITY));
      });

      // clear incoming chunks array
      this.incomingEnergyChunks.clear();
    }

    // move all energy chunks that are currently owned by this element
    this.moveElectricalEnergyChunks(dt);
    this.moveRadiatedEnergyChunks(dt);
    this.moveBlownEnergyChunks(dt);

    // Cool down a bit on each step.  If the fan doesn't cool off fast enough, thermal energy will be released.  The
    // cooling is linear rather than differential, which isn't very realistic, but works for our purposes here.
    this.internalTemperature = Math.max(this.internalTemperature - dt * COOLING_RATE, ROOM_TEMPERATURE);

    // set the target velocity of the fan
    if (this.energyChunksVisibleProperty.get()) {
      // cap the internal energy
      this.internalEnergyFromEnergyChunksProperty.value = Math.min(this.internalEnergyFromEnergyChunksProperty.value, MAX_INTERNAL_ENERGY);

      // when chunks are on, use internal energy of the fan to determine the target velocity
      this.targetVelocityProperty.value = this.internalEnergyFromEnergyChunksProperty.value * INTERNAL_ENERGY_VELOCITY_COEFFICIENT;

      // lose a proportion of the energy
      this.internalEnergyFromEnergyChunksProperty.value = Math.max(this.internalEnergyFromEnergyChunksProperty.value - this.internalEnergyFromEnergyChunksProperty.value * ENERGY_LOST_PROPORTION * dt, 0);
    } else {
      // when chunks are off, get a smooth target velocity from incoming energy by using dt
      this.targetVelocityProperty.value = incomingEnergy.amount * INCOMING_ENERGY_VELOCITY_COEFFICIENT / dt;
    }
    this.targetVelocityProperty.value = this.targetVelocityProperty.value < MINIMUM_TARGET_VELOCITY ? 0 : this.targetVelocityProperty.value;

    // dump any internal energy that was left around from when chunks were on
    this.internalEnergyFromEnergyChunksProperty.value = this.targetVelocityProperty.value === 0 ? 0 : this.internalEnergyFromEnergyChunksProperty.value;
    const dOmega = this.targetVelocityProperty.value - this.angularVelocityProperty.value;
    if (dOmega !== 0) {
      const change = ANGULAR_ACCELERATION * dt;
      if (dOmega > 0) {
        // accelerate
        this.angularVelocityProperty.value = Math.min(this.angularVelocityProperty.value + change, this.targetVelocityProperty.value);
      } else {
        // decelerate
        this.angularVelocityProperty.value = Math.max(this.angularVelocityProperty.value - change, 0);
      }
    }
    const newAngle = (this.bladePositionProperty.value + this.angularVelocityProperty.value * dt) % (2 * Math.PI);
    this.bladePositionProperty.set(newAngle);
  }

  /**
   * move electrical energy chunks through the fan's wire
   *
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveElectricalEnergyChunks(dt) {
    const movers = this.electricalEnergyChunkMovers.slice();
    movers.forEach(mover => {
      mover.moveAlongPath(dt);
      if (mover.pathFullyTraversed) {
        const chunk = mover.energyChunk;

        // the electrical energy chunk has reached the motor, so it needs to change into mechanical or thermal energy
        this.electricalEnergyChunkMovers.remove(mover);
        this.energyChunkPathMoverGroup.disposeElement(mover);
        this.hasEnergy = true;
        if (this.internalTemperature < THERMAL_RELEASE_TEMPERATURE) {
          // increase the temperature a little, since this energy chunk is going to move the fan
          this.internalTemperature += TEMPERATURE_GAIN_PER_ENERGY_CHUNK;

          // add the energy from this chunk to the fan's internal energy
          this.internalEnergyFromEnergyChunksProperty.value += EFACConstants.ENERGY_PER_CHUNK;
          chunk.energyTypeProperty.set(EnergyType.MECHANICAL);

          // release the energy chunk as mechanical to blow away
          this.mechanicalEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(chunk, createBlownEnergyChunkPath(chunk.positionProperty.get()), EFACConstants.ENERGY_CHUNK_VELOCITY));
        } else {
          chunk.energyTypeProperty.set(EnergyType.THERMAL);

          // release the energy chunk as thermal to radiate away
          this.radiatedEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(chunk, EnergyChunkPathMover.createRadiatedPath(chunk.positionProperty.get(), 0), EFACConstants.ENERGY_CHUNK_VELOCITY));

          // cool back to room temperature, since some thermal energy was released
          this.internalTemperature = ROOM_TEMPERATURE;
        }
      }
    });
  }

  /**
   * move thermal energy chunks up and away from the fan
   *
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveRadiatedEnergyChunks(dt) {
    const movers = this.radiatedEnergyChunkMovers.slice();
    movers.forEach(mover => {
      mover.moveAlongPath(dt);

      // remove this energy chunk entirely
      if (mover.pathFullyTraversed) {
        this.energyChunkList.remove(mover.energyChunk);
        this.radiatedEnergyChunkMovers.remove(mover);
        this.energyChunkGroup.disposeElement(mover.energyChunk);
        this.energyChunkPathMoverGroup.disposeElement(mover);
      }
    });
  }

  /**
   * move mechanical energy chunks out of the motor and away from the blades as wind
   *
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveBlownEnergyChunks(dt) {
    const movers = this.mechanicalEnergyChunkMovers.slice();
    movers.forEach(mover => {
      mover.moveAlongPath(dt);

      // remove this energy chunk entirely
      if (mover.pathFullyTraversed) {
        this.energyChunkList.remove(mover.energyChunk);
        this.mechanicalEnergyChunkMovers.remove(mover);
        this.energyChunkGroup.disposeElement(mover.energyChunk);
        this.energyChunkPathMoverGroup.disposeElement(mover);
      }
    });
  }

  /**
   * deactivate this energy system element
   * @public
   * @override
   */
  deactivate() {
    super.deactivate();
    this.bladePositionProperty.reset();
    this.angularVelocityProperty.reset();
    this.targetVelocityProperty.reset();
    this.internalEnergyFromEnergyChunksProperty.reset();
    this.internalTemperature = ROOM_TEMPERATURE;
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.electricalEnergyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.electricalEnergyChunkMovers.clear();
    this.radiatedEnergyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.radiatedEnergyChunkMovers.clear();
    this.mechanicalEnergyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.mechanicalEnergyChunkMovers.clear();
  }

  /**
   * @param {Energy} incomingEnergy
   * @public
   * @override
   */
  preloadEnergyChunks(incomingEnergy) {
    this.clearEnergyChunks();
    if (this.targetVelocityProperty.value < MINIMUM_TARGET_VELOCITY || incomingEnergy.type !== EnergyType.ELECTRICAL) {
      // no energy chunk pre-loading needed
      return;
    }
    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99; // prime the pump
    let timeSimulated = 0; // in seconds

    // simulate energy chunks moving through the system, have a time limit to prevent infinite loops
    let preloadComplete = false;
    while (!preloadComplete && timeSimulated < 10) {
      energySinceLastChunk += incomingEnergy.amount * dt;
      timeSimulated += dt;

      // determine if time to add a new chunk
      if (energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK) {
        const newEnergyChunk = this.energyChunkGroup.createNextElement(EnergyType.ELECTRICAL, this.positionProperty.value.plus(WIRE_START_OFFSET), Vector2.ZERO, this.energyChunksVisibleProperty);
        this.energyChunkList.push(newEnergyChunk);

        // add a "mover" that will move this energy chunk through the wire to the heating element
        this.electricalEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(newEnergyChunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.value, ELECTRICAL_ENERGY_CHUNK_OFFSETS), EFACConstants.ENERGY_CHUNK_VELOCITY));

        // update energy since last chunk, and do so by taking "every other" chunk as the generator approximately does.
        // this way, the spread of the preloaded energy chunks better matches what the actual spread would be, instead
        // of being at a higher concentration than normal.
        energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK * 2;
      }
      this.moveElectricalEnergyChunks(dt);
      this.moveRadiatedEnergyChunks(dt);
      this.moveBlownEnergyChunks(dt);
      if (this.mechanicalEnergyChunkMovers.length >= 3) {
        // a few mechanical energy chunks are moving away from the fan, which completes the preload
        preloadComplete = true;
      }
    }
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @returns {Object}
   */
  toStateObject() {
    return {
      internalTemperature: this.internalTemperature
    };
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @param {Object} stateObject - see this.toStateObject()
   */
  applyState(stateObject) {
    this.internalTemperature = stateObject.internalTemperature;
  }
}

/**
 * Create a path for chunks to follow when blown out of the fan.
 * @param  {Vector2} startingPoint
 * @returns {Vector2[]}
 * @private
 */
const createBlownEnergyChunkPath = startingPoint => {
  const path = [];
  const numberOfDirectionChanges = 20; // empirically determined
  const nominalTravelVector = new Vector2(BLOWN_ENERGY_CHUNK_TRAVEL_DISTANCE / numberOfDirectionChanges, 0);

  // The first point is straight right the starting point.  This is done because it makes the chunk
  // move straight out of the fan center cone.
  let currentPosition = startingPoint.plus(new Vector2(INSIDE_FAN_ENERGY_CHUNK_TRAVEL_DISTANCE, 0));
  path.push(currentPosition);

  // add the remaining points in the path
  for (let i = 0; i < numberOfDirectionChanges - 1; i++) {
    const movement = nominalTravelVector.rotated((dotRandom.nextDouble() - 0.5) * Math.PI / 4);
    currentPosition = currentPosition.plus(movement);
    path.push(currentPosition);
  }
  return path;
};
energyFormsAndChanges.register('Fan', Fan);
export default Fan;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJOdW1iZXJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlJhbmdlIiwiVmVjdG9yMiIsIm1lcmdlIiwiSW1hZ2UiLCJUYW5kZW0iLCJSZWZlcmVuY2VJTyIsImZhbkljb25fcG5nIiwiRUZBQ0NvbnN0YW50cyIsIkVuZXJneVR5cGUiLCJlbmVyZ3lGb3Jtc0FuZENoYW5nZXMiLCJFbmVyZ3lDaHVua1BhdGhNb3ZlciIsIkVuZXJneVVzZXIiLCJBTkdVTEFSX0FDQ0VMRVJBVElPTiIsIk1hdGgiLCJQSSIsIk1JTklNVU1fVEFSR0VUX1ZFTE9DSVRZIiwiSU5DT01JTkdfRU5FUkdZX1ZFTE9DSVRZX0NPRUZGSUNJRU5UIiwiTUFYX0lOVEVSTkFMX0VORVJHWSIsIkVORVJHWV9QRVJfQ0hVTksiLCJFTkVSR1lfTE9TVF9QUk9QT1JUSU9OIiwiSU5URVJOQUxfRU5FUkdZX1ZFTE9DSVRZX0NPRUZGSUNJRU5UIiwiUk9PTV9URU1QRVJBVFVSRSIsIlRFTVBFUkFUVVJFX0dBSU5fUEVSX0VORVJHWV9DSFVOSyIsIlRIRVJNQUxfUkVMRUFTRV9URU1QRVJBVFVSRSIsIkNPT0xJTkdfUkFURSIsIldJUkVfU1RBUlRfT0ZGU0VUIiwiV0lSRV9DVVJWRV9QT0lOVF8xX09GRlNFVCIsIldJUkVfQ1VSVkVfUE9JTlRfMl9PRkZTRVQiLCJXSVJFX0NVUlZFX1BPSU5UXzNfT0ZGU0VUIiwiV0lSRV9DVVJWRV9QT0lOVF80X09GRlNFVCIsIldJUkVfQ1VSVkVfUE9JTlRfNV9PRkZTRVQiLCJGQU5fTU9UT1JfSU5URVJJT1JfT0ZGU0VUIiwiSU5TSURFX0ZBTl9FTkVSR1lfQ0hVTktfVFJBVkVMX0RJU1RBTkNFIiwiQkxPV05fRU5FUkdZX0NIVU5LX1RSQVZFTF9ESVNUQU5DRSIsIkVMRUNUUklDQUxfRU5FUkdZX0NIVU5LX09GRlNFVFMiLCJGYW4iLCJjb25zdHJ1Y3RvciIsImVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSIsImVuZXJneUNodW5rR3JvdXAiLCJlbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwIiwib3B0aW9ucyIsInRhbmRlbSIsIlJFUVVJUkVEIiwiYmxhZGVQb3NpdGlvblByb3BlcnR5IiwicmFuZ2UiLCJ1bml0cyIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvSGlnaEZyZXF1ZW5jeSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJlbGVjdHJpY2FsRW5lcmd5Q2h1bmtNb3ZlcnMiLCJwaGV0aW9UeXBlIiwiT2JzZXJ2YWJsZUFycmF5SU8iLCJFbmVyZ3lDaHVua1BhdGhNb3ZlcklPIiwibWVjaGFuaWNhbEVuZXJneUNodW5rTW92ZXJzIiwicmFkaWF0ZWRFbmVyZ3lDaHVua01vdmVycyIsImFuZ3VsYXJWZWxvY2l0eVByb3BlcnR5IiwiaW50ZXJuYWxFbmVyZ3lGcm9tRW5lcmd5Q2h1bmtzUHJvcGVydHkiLCJpbnRlcm5hbFRlbXBlcmF0dXJlIiwidGFyZ2V0VmVsb2NpdHlQcm9wZXJ0eSIsInN0ZXAiLCJkdCIsImluY29taW5nRW5lcmd5IiwiYWN0aXZlUHJvcGVydHkiLCJ2YWx1ZSIsImluY29taW5nRW5lcmd5Q2h1bmtzIiwibGVuZ3RoIiwiZm9yRWFjaCIsImNodW5rIiwiYXNzZXJ0IiwiZW5lcmd5VHlwZVByb3BlcnR5IiwiRUxFQ1RSSUNBTCIsImVuZXJneUNodW5rTGlzdCIsInB1c2giLCJjcmVhdGVOZXh0RWxlbWVudCIsImNyZWF0ZVBhdGhGcm9tT2Zmc2V0cyIsInBvc2l0aW9uUHJvcGVydHkiLCJFTkVSR1lfQ0hVTktfVkVMT0NJVFkiLCJjbGVhciIsIm1vdmVFbGVjdHJpY2FsRW5lcmd5Q2h1bmtzIiwibW92ZVJhZGlhdGVkRW5lcmd5Q2h1bmtzIiwibW92ZUJsb3duRW5lcmd5Q2h1bmtzIiwibWF4IiwiZ2V0IiwibWluIiwiYW1vdW50IiwiZE9tZWdhIiwiY2hhbmdlIiwibmV3QW5nbGUiLCJzZXQiLCJtb3ZlcnMiLCJzbGljZSIsIm1vdmVyIiwibW92ZUFsb25nUGF0aCIsInBhdGhGdWxseVRyYXZlcnNlZCIsImVuZXJneUNodW5rIiwicmVtb3ZlIiwiZGlzcG9zZUVsZW1lbnQiLCJoYXNFbmVyZ3kiLCJNRUNIQU5JQ0FMIiwiY3JlYXRlQmxvd25FbmVyZ3lDaHVua1BhdGgiLCJUSEVSTUFMIiwiY3JlYXRlUmFkaWF0ZWRQYXRoIiwiZGVhY3RpdmF0ZSIsInJlc2V0IiwiY2xlYXJFbmVyZ3lDaHVua3MiLCJwcmVsb2FkRW5lcmd5Q2h1bmtzIiwidHlwZSIsIkZSQU1FU19QRVJfU0VDT05EIiwiZW5lcmd5U2luY2VMYXN0Q2h1bmsiLCJ0aW1lU2ltdWxhdGVkIiwicHJlbG9hZENvbXBsZXRlIiwibmV3RW5lcmd5Q2h1bmsiLCJwbHVzIiwiWkVSTyIsInRvU3RhdGVPYmplY3QiLCJhcHBseVN0YXRlIiwic3RhdGVPYmplY3QiLCJzdGFydGluZ1BvaW50IiwicGF0aCIsIm51bWJlck9mRGlyZWN0aW9uQ2hhbmdlcyIsIm5vbWluYWxUcmF2ZWxWZWN0b3IiLCJjdXJyZW50UG9zaXRpb24iLCJpIiwibW92ZW1lbnQiLCJyb3RhdGVkIiwibmV4dERvdWJsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmFuLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgY2xhc3MgZm9yIHRoZSBmYW4sIHdoaWNoIGlzIGFuIGVuZXJneSB1c2VyXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IGZhbkljb25fcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9mYW5JY29uX3BuZy5qcyc7XHJcbmltcG9ydCBFRkFDQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9FRkFDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEVuZXJneVR5cGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0VuZXJneVR5cGUuanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDaHVua1BhdGhNb3ZlciBmcm9tICcuL0VuZXJneUNodW5rUGF0aE1vdmVyLmpzJztcclxuaW1wb3J0IEVuZXJneVVzZXIgZnJvbSAnLi9FbmVyZ3lVc2VyLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBBTkdVTEFSX0FDQ0VMRVJBVElPTiA9IE1hdGguUEkgKiA0OyAvLyBJbiByYWRpYW5zLyhzZWNeMikuXHJcbmNvbnN0IE1JTklNVU1fVEFSR0VUX1ZFTE9DSVRZID0gNDsgLy8gSW4gcmFkaWFucy9zZWMuIEFueSBzcGVlZCBsb3dlciB0aGFuIHRoaXMgbG9va3MgY2hvcHB5LCBzbyB0aGlzIGlzIHRoZSBjdXRvZmZcclxuY29uc3QgSU5DT01JTkdfRU5FUkdZX1ZFTE9DSVRZX0NPRUZGSUNJRU5UID0gMC4wMDUxOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkLiB1c2VkIHRvIG1hcCBpbmNvbWluZyBlbmVyZ3kgdG8gYSB0YXJnZXQgdmVsb2NpdHlcclxuY29uc3QgTUFYX0lOVEVSTkFMX0VORVJHWSA9IEVGQUNDb25zdGFudHMuRU5FUkdZX1BFUl9DSFVOSyAqIDQ7XHJcbmNvbnN0IEVORVJHWV9MT1NUX1BST1BPUlRJT04gPSAwLjMwOyAvLyB1c2VkIHRvIHJlbW92ZSBzb21lIGVuZXJneSBmcm9tIGludGVybmFsIGVuZXJneSB3aGVuIGEgdGFyZ2V0IHZlbG9jaXR5IGlzIHNldFxyXG5cclxuLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZC4gdXNlZCB0byBtYXAgaW50ZXJuYWwgZW5lcmd5IHRvIGEgdGFyZ2V0IHZlbG9jaXR5LiB0aGUgdmFsdWUgaXMgc28gc3BlY2lmaWMgYmVjYXVzZSB0aGUgc3BlZWRcclxuLy8gb2YgdGhlIGZhbiB3aGVuIHVzaW5nIGludGVybmFsIGVuZXJneSBzaG91bGQgY2xvc2VseSBtYXRjaCBpdHMgc3BlZWQgd2hlbiB1c2luZyBpbmNvbWluZyBlbmVyZ3lcclxuY29uc3QgSU5URVJOQUxfRU5FUkdZX1ZFTE9DSVRZX0NPRUZGSUNJRU5UID0gMC4wMDI1NTtcclxuXHJcbi8vIGNvbnN0YW50cyBmb3IgdGVtcGVyYXR1cmVcclxuY29uc3QgUk9PTV9URU1QRVJBVFVSRSA9IDIyOyAvLyBpbiBDZWxzaXVzXHJcbmNvbnN0IFRFTVBFUkFUVVJFX0dBSU5fUEVSX0VORVJHWV9DSFVOSyA9IDEuNTsgLy8gaW4gQ2Vsc2l1c1xyXG5jb25zdCBUSEVSTUFMX1JFTEVBU0VfVEVNUEVSQVRVUkUgPSAzODsgLy8gaW4gQ2Vsc2l1c1xyXG5jb25zdCBDT09MSU5HX1JBVEUgPSAwLjU7IC8vIGluIGRlZ3JlZXMgQ2Vsc2l1cyBwZXIgc2Vjb25kXHJcblxyXG4vLyBlbmVyZ3kgY2h1bmsgcGF0aCB2YXJzXHJcbmNvbnN0IFdJUkVfU1RBUlRfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIC0wLjA1NSwgLTAuMDQzNSApO1xyXG5jb25zdCBXSVJFX0NVUlZFX1BPSU5UXzFfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIC0wLjA0MjUsIC0wLjA0MDUgKTtcclxuY29uc3QgV0lSRV9DVVJWRV9QT0lOVF8yX09GRlNFVCA9IG5ldyBWZWN0b3IyKCAtMC4wMzg1LCAtMC4wMzkgKTtcclxuY29uc3QgV0lSRV9DVVJWRV9QT0lOVF8zX09GRlNFVCA9IG5ldyBWZWN0b3IyKCAtMC4wMzQ1LCAtMC4wMzY1ICk7XHJcbmNvbnN0IFdJUkVfQ1VSVkVfUE9JTlRfNF9PRkZTRVQgPSBuZXcgVmVjdG9yMiggLTAuMDMwNSwgLTAuMDMzICk7XHJcbmNvbnN0IFdJUkVfQ1VSVkVfUE9JTlRfNV9PRkZTRVQgPSBuZXcgVmVjdG9yMiggLTAuMDI2NSwgLTAuMDI0ICk7XHJcbmNvbnN0IEZBTl9NT1RPUl9JTlRFUklPUl9PRkZTRVQgPSBuZXcgVmVjdG9yMiggLTAuMDI2NSwgMC4wMTkgKTtcclxuY29uc3QgSU5TSURFX0ZBTl9FTkVSR1lfQ0hVTktfVFJBVkVMX0RJU1RBTkNFID0gMC4wNTsgLy8gaW4gbWV0ZXJzXHJcbmNvbnN0IEJMT1dOX0VORVJHWV9DSFVOS19UUkFWRUxfRElTVEFOQ0UgPSAwLjM7IC8vIGluIG1ldGVyc1xyXG5jb25zdCBFTEVDVFJJQ0FMX0VORVJHWV9DSFVOS19PRkZTRVRTID0gW1xyXG4gIFdJUkVfU1RBUlRfT0ZGU0VULFxyXG4gIFdJUkVfQ1VSVkVfUE9JTlRfMV9PRkZTRVQsXHJcbiAgV0lSRV9DVVJWRV9QT0lOVF8yX09GRlNFVCxcclxuICBXSVJFX0NVUlZFX1BPSU5UXzNfT0ZGU0VULFxyXG4gIFdJUkVfQ1VSVkVfUE9JTlRfNF9PRkZTRVQsXHJcbiAgV0lSRV9DVVJWRV9QT0lOVF81X09GRlNFVCxcclxuICBGQU5fTU9UT1JfSU5URVJJT1JfT0ZGU0VUXHJcbl07XHJcblxyXG5cclxuY2xhc3MgRmFuIGV4dGVuZHMgRW5lcmd5VXNlciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge0VuZXJneUNodW5rR3JvdXB9IGVuZXJneUNodW5rR3JvdXBcclxuICAgKiBAcGFyYW0ge0VuZXJneUNodW5rUGF0aE1vdmVyR3JvdXB9IGVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXBcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSwgZW5lcmd5Q2h1bmtHcm91cCwgZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggbmV3IEltYWdlKCBmYW5JY29uX3BuZyApLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7TnVtYmVyUHJvcGVydHl9XHJcbiAgICB0aGlzLmJsYWRlUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAyICogTWF0aC5QSSApLFxyXG4gICAgICB1bml0czogJ3JhZGlhbnMnLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JsYWRlUG9zaXRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgYW5nbGUgb2YgdGhlIGJsYWRlJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gbW92ZXJzIHRoYXQgY29udHJvbCBob3cgdGhlIGVuZXJneSBjaHVua3MgbW92ZSB0b3dhcmRzIGFuZCB0aHJvdWdoIHRoZSBmYW5cclxuICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5SU8oIFJlZmVyZW5jZUlPKCBFbmVyZ3lDaHVua1BhdGhNb3Zlci5FbmVyZ3lDaHVua1BhdGhNb3ZlcklPICkgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5tZWNoYW5pY2FsRW5lcmd5Q2h1bmtNb3ZlcnMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtZWNoYW5pY2FsRW5lcmd5Q2h1bmtNb3ZlcnMnICksXHJcbiAgICAgIHBoZXRpb1R5cGU6IGNyZWF0ZU9ic2VydmFibGVBcnJheS5PYnNlcnZhYmxlQXJyYXlJTyggUmVmZXJlbmNlSU8oIEVuZXJneUNodW5rUGF0aE1vdmVyLkVuZXJneUNodW5rUGF0aE1vdmVySU8gKSApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnJhZGlhdGVkRW5lcmd5Q2h1bmtNb3ZlcnMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyYWRpYXRlZEVuZXJneUNodW5rTW92ZXJzJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5SU8oIFJlZmVyZW5jZUlPKCBFbmVyZ3lDaHVua1BhdGhNb3Zlci5FbmVyZ3lDaHVua1BhdGhNb3ZlcklPICkgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHVuaXRzOiAncmFkaWFucy9zJyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdhbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgYW5ndWxhciB2ZWxvY2l0eSBvZiB0aGUgYmxhZGUnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5ID0gZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5O1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua0dyb3VwID0gZW5lcmd5Q2h1bmtHcm91cDtcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCA9IGVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXA7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSB0aGUgaW50ZXJuYWwgZW5lcmd5IG9mIHRoZSBmYW4sIHdoaWNoIGlzIG9ubHkgdXNlZCBieSBlbmVyZ3kgY2h1bmtzLCBub3QgaW5jb21pbmdFbmVyZ3kuXHJcbiAgICAvLyBpbmNvbWluZyBjaHVua3MgYWRkIHRoZWlyIGVuZXJneSB2YWx1ZXMgdG8gdGhpcywgd2hpY2ggaXMgdGhlbiB1c2VkIHRvIGRldGVybWluZSBhIHRhcmdldCB2ZWxvY2l0eSBmb3IgdGhlIGZhbi5cclxuICAgIHRoaXMuaW50ZXJuYWxFbmVyZ3lGcm9tRW5lcmd5Q2h1bmtzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbnRlcm5hbEVuZXJneUZyb21FbmVyZ3lDaHVua3NQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIGEgdGVtcGVyYXR1cmUgdmFsdWUgdXNlZCB0byBkZWNpZGUgd2hlbiB0byByZWxlYXNlIHRoZXJtYWwgZW5lcmd5IGNodW5rcywgdmVyeSByb3VnaGx5IGluXHJcbiAgICAvLyBkZWdyZWVzIENlbHNpdXNcclxuICAgIHRoaXMuaW50ZXJuYWxUZW1wZXJhdHVyZSA9IFJPT01fVEVNUEVSQVRVUkU7XHJcblxyXG4gICAgdGhpcy50YXJnZXRWZWxvY2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHVuaXRzOiAncmFkaWFucy9zJyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0YXJnZXRWZWxvY2l0eVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSB0YXJnZXQgdmVsb2NpdHkgb2YgdGhlIGJsYWRlJ1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHBhcmFtIHtFbmVyZ3l9IGluY29taW5nRW5lcmd5XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0LCBpbmNvbWluZ0VuZXJneSApIHtcclxuICAgIGlmICggIXRoaXMuYWN0aXZlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBoYW5kbGUgYW55IGluY29taW5nIGVuZXJneSBjaHVua3NcclxuICAgIGlmICggdGhpcy5pbmNvbWluZ0VuZXJneUNodW5rcy5sZW5ndGggPiAwICkge1xyXG4gICAgICB0aGlzLmluY29taW5nRW5lcmd5Q2h1bmtzLmZvckVhY2goIGNodW5rID0+IHtcclxuXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgICAgIGNodW5rLmVuZXJneVR5cGVQcm9wZXJ0eS52YWx1ZSA9PT0gRW5lcmd5VHlwZS5FTEVDVFJJQ0FMLFxyXG4gICAgICAgICAgYEVuZXJneSBjaHVuayB0eXBlIHNob3VsZCBiZSBFTEVDVFJJQ0FMIGJ1dCBpcyAke2NodW5rLmVuZXJneVR5cGVQcm9wZXJ0eS52YWx1ZX1gXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIHRoZSBlbmVyZ3kgY2h1bmsgdG8gdGhlIGxpc3Qgb2YgdGhvc2UgdW5kZXIgbWFuYWdlbWVudFxyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtMaXN0LnB1c2goIGNodW5rICk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBhIFwibW92ZXJcIiB0aGF0IHdpbGwgbW92ZSB0aGlzIGVuZXJneSBjaHVuayB0aHJvdWdoIHRoZSB3aXJlIHRvIHRoZSBtb3RvclxyXG4gICAgICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzLnB1c2goIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggY2h1bmssXHJcbiAgICAgICAgICBFbmVyZ3lDaHVua1BhdGhNb3Zlci5jcmVhdGVQYXRoRnJvbU9mZnNldHMoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSwgRUxFQ1RSSUNBTF9FTkVSR1lfQ0hVTktfT0ZGU0VUUyApLFxyXG4gICAgICAgICAgRUZBQ0NvbnN0YW50cy5FTkVSR1lfQ0hVTktfVkVMT0NJVFkgKSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBjbGVhciBpbmNvbWluZyBjaHVua3MgYXJyYXlcclxuICAgICAgdGhpcy5pbmNvbWluZ0VuZXJneUNodW5rcy5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1vdmUgYWxsIGVuZXJneSBjaHVua3MgdGhhdCBhcmUgY3VycmVudGx5IG93bmVkIGJ5IHRoaXMgZWxlbWVudFxyXG4gICAgdGhpcy5tb3ZlRWxlY3RyaWNhbEVuZXJneUNodW5rcyggZHQgKTtcclxuICAgIHRoaXMubW92ZVJhZGlhdGVkRW5lcmd5Q2h1bmtzKCBkdCApO1xyXG4gICAgdGhpcy5tb3ZlQmxvd25FbmVyZ3lDaHVua3MoIGR0ICk7XHJcblxyXG4gICAgLy8gQ29vbCBkb3duIGEgYml0IG9uIGVhY2ggc3RlcC4gIElmIHRoZSBmYW4gZG9lc24ndCBjb29sIG9mZiBmYXN0IGVub3VnaCwgdGhlcm1hbCBlbmVyZ3kgd2lsbCBiZSByZWxlYXNlZC4gIFRoZVxyXG4gICAgLy8gY29vbGluZyBpcyBsaW5lYXIgcmF0aGVyIHRoYW4gZGlmZmVyZW50aWFsLCB3aGljaCBpc24ndCB2ZXJ5IHJlYWxpc3RpYywgYnV0IHdvcmtzIGZvciBvdXIgcHVycG9zZXMgaGVyZS5cclxuICAgIHRoaXMuaW50ZXJuYWxUZW1wZXJhdHVyZSA9IE1hdGgubWF4KCB0aGlzLmludGVybmFsVGVtcGVyYXR1cmUgLSBkdCAqIENPT0xJTkdfUkFURSwgUk9PTV9URU1QRVJBVFVSRSApO1xyXG5cclxuICAgIC8vIHNldCB0aGUgdGFyZ2V0IHZlbG9jaXR5IG9mIHRoZSBmYW5cclxuICAgIGlmICggdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAvLyBjYXAgdGhlIGludGVybmFsIGVuZXJneVxyXG4gICAgICB0aGlzLmludGVybmFsRW5lcmd5RnJvbUVuZXJneUNodW5rc1Byb3BlcnR5LnZhbHVlID1cclxuICAgICAgICBNYXRoLm1pbiggdGhpcy5pbnRlcm5hbEVuZXJneUZyb21FbmVyZ3lDaHVua3NQcm9wZXJ0eS52YWx1ZSwgTUFYX0lOVEVSTkFMX0VORVJHWSApO1xyXG5cclxuICAgICAgLy8gd2hlbiBjaHVua3MgYXJlIG9uLCB1c2UgaW50ZXJuYWwgZW5lcmd5IG9mIHRoZSBmYW4gdG8gZGV0ZXJtaW5lIHRoZSB0YXJnZXQgdmVsb2NpdHlcclxuICAgICAgdGhpcy50YXJnZXRWZWxvY2l0eVByb3BlcnR5LnZhbHVlID0gdGhpcy5pbnRlcm5hbEVuZXJneUZyb21FbmVyZ3lDaHVua3NQcm9wZXJ0eS52YWx1ZSAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIElOVEVSTkFMX0VORVJHWV9WRUxPQ0lUWV9DT0VGRklDSUVOVDtcclxuXHJcbiAgICAgIC8vIGxvc2UgYSBwcm9wb3J0aW9uIG9mIHRoZSBlbmVyZ3lcclxuICAgICAgdGhpcy5pbnRlcm5hbEVuZXJneUZyb21FbmVyZ3lDaHVua3NQcm9wZXJ0eS52YWx1ZSA9IE1hdGgubWF4KFxyXG4gICAgICAgIHRoaXMuaW50ZXJuYWxFbmVyZ3lGcm9tRW5lcmd5Q2h1bmtzUHJvcGVydHkudmFsdWUgLSB0aGlzLmludGVybmFsRW5lcmd5RnJvbUVuZXJneUNodW5rc1Byb3BlcnR5LnZhbHVlICogRU5FUkdZX0xPU1RfUFJPUE9SVElPTiAqIGR0LFxyXG4gICAgICAgIDBcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gd2hlbiBjaHVua3MgYXJlIG9mZiwgZ2V0IGEgc21vb3RoIHRhcmdldCB2ZWxvY2l0eSBmcm9tIGluY29taW5nIGVuZXJneSBieSB1c2luZyBkdFxyXG4gICAgICB0aGlzLnRhcmdldFZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSBpbmNvbWluZ0VuZXJneS5hbW91bnQgKiBJTkNPTUlOR19FTkVSR1lfVkVMT0NJVFlfQ09FRkZJQ0lFTlQgLyBkdDtcclxuICAgIH1cclxuICAgIHRoaXMudGFyZ2V0VmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSA9IHRoaXMudGFyZ2V0VmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSA8IE1JTklNVU1fVEFSR0VUX1ZFTE9DSVRZID8gMCA6IHRoaXMudGFyZ2V0VmVsb2NpdHlQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyBkdW1wIGFueSBpbnRlcm5hbCBlbmVyZ3kgdGhhdCB3YXMgbGVmdCBhcm91bmQgZnJvbSB3aGVuIGNodW5rcyB3ZXJlIG9uXHJcbiAgICB0aGlzLmludGVybmFsRW5lcmd5RnJvbUVuZXJneUNodW5rc1Byb3BlcnR5LnZhbHVlID0gdGhpcy50YXJnZXRWZWxvY2l0eVByb3BlcnR5LnZhbHVlID09PSAwID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmludGVybmFsRW5lcmd5RnJvbUVuZXJneUNodW5rc1Byb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIGNvbnN0IGRPbWVnYSA9IHRoaXMudGFyZ2V0VmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSAtIHRoaXMuYW5ndWxhclZlbG9jaXR5UHJvcGVydHkudmFsdWU7XHJcbiAgICBpZiAoIGRPbWVnYSAhPT0gMCApIHtcclxuICAgICAgY29uc3QgY2hhbmdlID0gQU5HVUxBUl9BQ0NFTEVSQVRJT04gKiBkdDtcclxuICAgICAgaWYgKCBkT21lZ2EgPiAwICkge1xyXG5cclxuICAgICAgICAvLyBhY2NlbGVyYXRlXHJcbiAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSA9IE1hdGgubWluKFxyXG4gICAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSArIGNoYW5nZSxcclxuICAgICAgICAgIHRoaXMudGFyZ2V0VmVsb2NpdHlQcm9wZXJ0eS52YWx1ZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIGRlY2VsZXJhdGVcclxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlID0gTWF0aC5tYXgoIHRoaXMuYW5ndWxhclZlbG9jaXR5UHJvcGVydHkudmFsdWUgLSBjaGFuZ2UsIDAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc3QgbmV3QW5nbGUgPSAoIHRoaXMuYmxhZGVQb3NpdGlvblByb3BlcnR5LnZhbHVlICsgdGhpcy5hbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSAqIGR0ICkgJSAoIDIgKiBNYXRoLlBJICk7XHJcbiAgICB0aGlzLmJsYWRlUG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ld0FuZ2xlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtb3ZlIGVsZWN0cmljYWwgZW5lcmd5IGNodW5rcyB0aHJvdWdoIHRoZSBmYW4ncyB3aXJlXHJcbiAgICpcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBtb3ZlRWxlY3RyaWNhbEVuZXJneUNodW5rcyggZHQgKSB7XHJcbiAgICBjb25zdCBtb3ZlcnMgPSB0aGlzLmVsZWN0cmljYWxFbmVyZ3lDaHVua01vdmVycy5zbGljZSgpO1xyXG5cclxuICAgIG1vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB7XHJcbiAgICAgIG1vdmVyLm1vdmVBbG9uZ1BhdGgoIGR0ICk7XHJcblxyXG4gICAgICBpZiAoIG1vdmVyLnBhdGhGdWxseVRyYXZlcnNlZCApIHtcclxuXHJcbiAgICAgICAgY29uc3QgY2h1bmsgPSBtb3Zlci5lbmVyZ3lDaHVuaztcclxuXHJcbiAgICAgICAgLy8gdGhlIGVsZWN0cmljYWwgZW5lcmd5IGNodW5rIGhhcyByZWFjaGVkIHRoZSBtb3Rvciwgc28gaXQgbmVlZHMgdG8gY2hhbmdlIGludG8gbWVjaGFuaWNhbCBvciB0aGVybWFsIGVuZXJneVxyXG4gICAgICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzLnJlbW92ZSggbW92ZXIgKTtcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuZGlzcG9zZUVsZW1lbnQoIG1vdmVyICk7XHJcblxyXG4gICAgICAgIHRoaXMuaGFzRW5lcmd5ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLmludGVybmFsVGVtcGVyYXR1cmUgPCBUSEVSTUFMX1JFTEVBU0VfVEVNUEVSQVRVUkUgKSB7XHJcblxyXG4gICAgICAgICAgLy8gaW5jcmVhc2UgdGhlIHRlbXBlcmF0dXJlIGEgbGl0dGxlLCBzaW5jZSB0aGlzIGVuZXJneSBjaHVuayBpcyBnb2luZyB0byBtb3ZlIHRoZSBmYW5cclxuICAgICAgICAgIHRoaXMuaW50ZXJuYWxUZW1wZXJhdHVyZSArPSBURU1QRVJBVFVSRV9HQUlOX1BFUl9FTkVSR1lfQ0hVTks7XHJcblxyXG4gICAgICAgICAgLy8gYWRkIHRoZSBlbmVyZ3kgZnJvbSB0aGlzIGNodW5rIHRvIHRoZSBmYW4ncyBpbnRlcm5hbCBlbmVyZ3lcclxuICAgICAgICAgIHRoaXMuaW50ZXJuYWxFbmVyZ3lGcm9tRW5lcmd5Q2h1bmtzUHJvcGVydHkudmFsdWUgKz0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LO1xyXG5cclxuICAgICAgICAgIGNodW5rLmVuZXJneVR5cGVQcm9wZXJ0eS5zZXQoIEVuZXJneVR5cGUuTUVDSEFOSUNBTCApO1xyXG5cclxuICAgICAgICAgIC8vIHJlbGVhc2UgdGhlIGVuZXJneSBjaHVuayBhcyBtZWNoYW5pY2FsIHRvIGJsb3cgYXdheVxyXG4gICAgICAgICAgdGhpcy5tZWNoYW5pY2FsRW5lcmd5Q2h1bmtNb3ZlcnMucHVzaCggdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCBjaHVuayxcclxuICAgICAgICAgICAgY3JlYXRlQmxvd25FbmVyZ3lDaHVua1BhdGgoIGNodW5rLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSxcclxuICAgICAgICAgICAgRUZBQ0NvbnN0YW50cy5FTkVSR1lfQ0hVTktfVkVMT0NJVFkgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGNodW5rLmVuZXJneVR5cGVQcm9wZXJ0eS5zZXQoIEVuZXJneVR5cGUuVEhFUk1BTCApO1xyXG5cclxuICAgICAgICAgIC8vIHJlbGVhc2UgdGhlIGVuZXJneSBjaHVuayBhcyB0aGVybWFsIHRvIHJhZGlhdGUgYXdheVxyXG4gICAgICAgICAgdGhpcy5yYWRpYXRlZEVuZXJneUNodW5rTW92ZXJzLnB1c2goIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudChcclxuICAgICAgICAgICAgY2h1bmssXHJcbiAgICAgICAgICAgIEVuZXJneUNodW5rUGF0aE1vdmVyLmNyZWF0ZVJhZGlhdGVkUGF0aCggY2h1bmsucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSwgMCApLFxyXG4gICAgICAgICAgICBFRkFDQ29uc3RhbnRzLkVORVJHWV9DSFVOS19WRUxPQ0lUWVxyXG4gICAgICAgICAgKSApO1xyXG5cclxuICAgICAgICAgIC8vIGNvb2wgYmFjayB0byByb29tIHRlbXBlcmF0dXJlLCBzaW5jZSBzb21lIHRoZXJtYWwgZW5lcmd5IHdhcyByZWxlYXNlZFxyXG4gICAgICAgICAgdGhpcy5pbnRlcm5hbFRlbXBlcmF0dXJlID0gUk9PTV9URU1QRVJBVFVSRTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1vdmUgdGhlcm1hbCBlbmVyZ3kgY2h1bmtzIHVwIGFuZCBhd2F5IGZyb20gdGhlIGZhblxyXG4gICAqXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgbW92ZVJhZGlhdGVkRW5lcmd5Q2h1bmtzKCBkdCApIHtcclxuICAgIGNvbnN0IG1vdmVycyA9IHRoaXMucmFkaWF0ZWRFbmVyZ3lDaHVua01vdmVycy5zbGljZSgpO1xyXG5cclxuICAgIG1vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB7XHJcbiAgICAgIG1vdmVyLm1vdmVBbG9uZ1BhdGgoIGR0ICk7XHJcblxyXG4gICAgICAvLyByZW1vdmUgdGhpcyBlbmVyZ3kgY2h1bmsgZW50aXJlbHlcclxuICAgICAgaWYgKCBtb3Zlci5wYXRoRnVsbHlUcmF2ZXJzZWQgKSB7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QucmVtb3ZlKCBtb3Zlci5lbmVyZ3lDaHVuayApO1xyXG4gICAgICAgIHRoaXMucmFkaWF0ZWRFbmVyZ3lDaHVua01vdmVycy5yZW1vdmUoIG1vdmVyICk7XHJcblxyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIuZW5lcmd5Q2h1bmsgKTtcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuZGlzcG9zZUVsZW1lbnQoIG1vdmVyICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1vdmUgbWVjaGFuaWNhbCBlbmVyZ3kgY2h1bmtzIG91dCBvZiB0aGUgbW90b3IgYW5kIGF3YXkgZnJvbSB0aGUgYmxhZGVzIGFzIHdpbmRcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gZHQgLSB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG1vdmVCbG93bkVuZXJneUNodW5rcyggZHQgKSB7XHJcbiAgICBjb25zdCBtb3ZlcnMgPSB0aGlzLm1lY2hhbmljYWxFbmVyZ3lDaHVua01vdmVycy5zbGljZSgpO1xyXG5cclxuICAgIG1vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB7XHJcbiAgICAgIG1vdmVyLm1vdmVBbG9uZ1BhdGgoIGR0ICk7XHJcblxyXG4gICAgICAvLyByZW1vdmUgdGhpcyBlbmVyZ3kgY2h1bmsgZW50aXJlbHlcclxuICAgICAgaWYgKCBtb3Zlci5wYXRoRnVsbHlUcmF2ZXJzZWQgKSB7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QucmVtb3ZlKCBtb3Zlci5lbmVyZ3lDaHVuayApO1xyXG4gICAgICAgIHRoaXMubWVjaGFuaWNhbEVuZXJneUNodW5rTW92ZXJzLnJlbW92ZSggbW92ZXIgKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0dyb3VwLmRpc3Bvc2VFbGVtZW50KCBtb3Zlci5lbmVyZ3lDaHVuayApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZGVhY3RpdmF0ZSB0aGlzIGVuZXJneSBzeXN0ZW0gZWxlbWVudFxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkZWFjdGl2YXRlKCkge1xyXG4gICAgc3VwZXIuZGVhY3RpdmF0ZSgpO1xyXG4gICAgdGhpcy5ibGFkZVBvc2l0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudGFyZ2V0VmVsb2NpdHlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pbnRlcm5hbEVuZXJneUZyb21FbmVyZ3lDaHVua3NQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pbnRlcm5hbFRlbXBlcmF0dXJlID0gUk9PTV9URU1QRVJBVFVSRTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBjbGVhckVuZXJneUNodW5rcygpIHtcclxuICAgIHN1cGVyLmNsZWFyRW5lcmd5Q2h1bmtzKCk7XHJcbiAgICB0aGlzLmVsZWN0cmljYWxFbmVyZ3lDaHVua01vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuZGlzcG9zZUVsZW1lbnQoIG1vdmVyICkgKTtcclxuICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzLmNsZWFyKCk7XHJcbiAgICB0aGlzLnJhZGlhdGVkRW5lcmd5Q2h1bmtNb3ZlcnMuZm9yRWFjaCggbW92ZXIgPT4gdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmRpc3Bvc2VFbGVtZW50KCBtb3ZlciApICk7XHJcbiAgICB0aGlzLnJhZGlhdGVkRW5lcmd5Q2h1bmtNb3ZlcnMuY2xlYXIoKTtcclxuICAgIHRoaXMubWVjaGFuaWNhbEVuZXJneUNodW5rTW92ZXJzLmZvckVhY2goIG1vdmVyID0+IHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIgKSApO1xyXG4gICAgdGhpcy5tZWNoYW5pY2FsRW5lcmd5Q2h1bmtNb3ZlcnMuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW5lcmd5fSBpbmNvbWluZ0VuZXJneVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBwcmVsb2FkRW5lcmd5Q2h1bmtzKCBpbmNvbWluZ0VuZXJneSApIHtcclxuXHJcbiAgICB0aGlzLmNsZWFyRW5lcmd5Q2h1bmtzKCk7XHJcblxyXG4gICAgaWYgKCB0aGlzLnRhcmdldFZlbG9jaXR5UHJvcGVydHkudmFsdWUgPCBNSU5JTVVNX1RBUkdFVF9WRUxPQ0lUWSB8fFxyXG4gICAgICAgICBpbmNvbWluZ0VuZXJneS50eXBlICE9PSBFbmVyZ3lUeXBlLkVMRUNUUklDQUwgKSB7XHJcblxyXG4gICAgICAvLyBubyBlbmVyZ3kgY2h1bmsgcHJlLWxvYWRpbmcgbmVlZGVkXHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkdCA9IDEgLyBFRkFDQ29uc3RhbnRzLkZSQU1FU19QRVJfU0VDT05EO1xyXG4gICAgbGV0IGVuZXJneVNpbmNlTGFzdENodW5rID0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LICogMC45OTsgLy8gcHJpbWUgdGhlIHB1bXBcclxuICAgIGxldCB0aW1lU2ltdWxhdGVkID0gMDsgLy8gaW4gc2Vjb25kc1xyXG5cclxuICAgIC8vIHNpbXVsYXRlIGVuZXJneSBjaHVua3MgbW92aW5nIHRocm91Z2ggdGhlIHN5c3RlbSwgaGF2ZSBhIHRpbWUgbGltaXQgdG8gcHJldmVudCBpbmZpbml0ZSBsb29wc1xyXG4gICAgbGV0IHByZWxvYWRDb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgd2hpbGUgKCAhcHJlbG9hZENvbXBsZXRlICYmIHRpbWVTaW11bGF0ZWQgPCAxMCApIHtcclxuXHJcbiAgICAgIGVuZXJneVNpbmNlTGFzdENodW5rICs9IGluY29taW5nRW5lcmd5LmFtb3VudCAqIGR0O1xyXG4gICAgICB0aW1lU2ltdWxhdGVkICs9IGR0O1xyXG5cclxuICAgICAgLy8gZGV0ZXJtaW5lIGlmIHRpbWUgdG8gYWRkIGEgbmV3IGNodW5rXHJcbiAgICAgIGlmICggZW5lcmd5U2luY2VMYXN0Q2h1bmsgPj0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LICkge1xyXG4gICAgICAgIGNvbnN0IG5ld0VuZXJneUNodW5rID0gdGhpcy5lbmVyZ3lDaHVua0dyb3VwLmNyZWF0ZU5leHRFbGVtZW50KFxyXG4gICAgICAgICAgRW5lcmd5VHlwZS5FTEVDVFJJQ0FMLFxyXG4gICAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnBsdXMoIFdJUkVfU1RBUlRfT0ZGU0VUICksXHJcbiAgICAgICAgICBWZWN0b3IyLlpFUk8sXHJcbiAgICAgICAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtMaXN0LnB1c2goIG5ld0VuZXJneUNodW5rICk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBhIFwibW92ZXJcIiB0aGF0IHdpbGwgbW92ZSB0aGlzIGVuZXJneSBjaHVuayB0aHJvdWdoIHRoZSB3aXJlIHRvIHRoZSBoZWF0aW5nIGVsZW1lbnRcclxuICAgICAgICB0aGlzLmVsZWN0cmljYWxFbmVyZ3lDaHVua01vdmVycy5wdXNoKCB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoXHJcbiAgICAgICAgICBuZXdFbmVyZ3lDaHVuayxcclxuICAgICAgICAgIEVuZXJneUNodW5rUGF0aE1vdmVyLmNyZWF0ZVBhdGhGcm9tT2Zmc2V0cyggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLCBFTEVDVFJJQ0FMX0VORVJHWV9DSFVOS19PRkZTRVRTICksXHJcbiAgICAgICAgICBFRkFDQ29uc3RhbnRzLkVORVJHWV9DSFVOS19WRUxPQ0lUWVxyXG4gICAgICAgICkgKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGVuZXJneSBzaW5jZSBsYXN0IGNodW5rLCBhbmQgZG8gc28gYnkgdGFraW5nIFwiZXZlcnkgb3RoZXJcIiBjaHVuayBhcyB0aGUgZ2VuZXJhdG9yIGFwcHJveGltYXRlbHkgZG9lcy5cclxuICAgICAgICAvLyB0aGlzIHdheSwgdGhlIHNwcmVhZCBvZiB0aGUgcHJlbG9hZGVkIGVuZXJneSBjaHVua3MgYmV0dGVyIG1hdGNoZXMgd2hhdCB0aGUgYWN0dWFsIHNwcmVhZCB3b3VsZCBiZSwgaW5zdGVhZFxyXG4gICAgICAgIC8vIG9mIGJlaW5nIGF0IGEgaGlnaGVyIGNvbmNlbnRyYXRpb24gdGhhbiBub3JtYWwuXHJcbiAgICAgICAgZW5lcmd5U2luY2VMYXN0Q2h1bmsgPSBlbmVyZ3lTaW5jZUxhc3RDaHVuayAtIEVGQUNDb25zdGFudHMuRU5FUkdZX1BFUl9DSFVOSyAqIDI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubW92ZUVsZWN0cmljYWxFbmVyZ3lDaHVua3MoIGR0ICk7XHJcbiAgICAgIHRoaXMubW92ZVJhZGlhdGVkRW5lcmd5Q2h1bmtzKCBkdCApO1xyXG4gICAgICB0aGlzLm1vdmVCbG93bkVuZXJneUNodW5rcyggZHQgKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5tZWNoYW5pY2FsRW5lcmd5Q2h1bmtNb3ZlcnMubGVuZ3RoID49IDMgKSB7XHJcblxyXG4gICAgICAgIC8vIGEgZmV3IG1lY2hhbmljYWwgZW5lcmd5IGNodW5rcyBhcmUgbW92aW5nIGF3YXkgZnJvbSB0aGUgZmFuLCB3aGljaCBjb21wbGV0ZXMgdGhlIHByZWxvYWRcclxuICAgICAgICBwcmVsb2FkQ29tcGxldGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljIChFbmVyZ3lTeXN0ZW1FbGVtZW50SU8pXHJcbiAgICogQHJldHVybnMge09iamVjdH1cclxuICAgKi9cclxuICB0b1N0YXRlT2JqZWN0KCkge1xyXG4gICAgcmV0dXJuIHsgaW50ZXJuYWxUZW1wZXJhdHVyZTogdGhpcy5pbnRlcm5hbFRlbXBlcmF0dXJlIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljIChFbmVyZ3lTeXN0ZW1FbGVtZW50SU8pXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlT2JqZWN0IC0gc2VlIHRoaXMudG9TdGF0ZU9iamVjdCgpXHJcbiAgICovXHJcbiAgYXBwbHlTdGF0ZSggc3RhdGVPYmplY3QgKSB7XHJcbiAgICB0aGlzLmludGVybmFsVGVtcGVyYXR1cmUgPSBzdGF0ZU9iamVjdC5pbnRlcm5hbFRlbXBlcmF0dXJlO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIHBhdGggZm9yIGNodW5rcyB0byBmb2xsb3cgd2hlbiBibG93biBvdXQgb2YgdGhlIGZhbi5cclxuICogQHBhcmFtICB7VmVjdG9yMn0gc3RhcnRpbmdQb2ludFxyXG4gKiBAcmV0dXJucyB7VmVjdG9yMltdfVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuY29uc3QgY3JlYXRlQmxvd25FbmVyZ3lDaHVua1BhdGggPSBzdGFydGluZ1BvaW50ID0+IHtcclxuICBjb25zdCBwYXRoID0gW107XHJcbiAgY29uc3QgbnVtYmVyT2ZEaXJlY3Rpb25DaGFuZ2VzID0gMjA7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICBjb25zdCBub21pbmFsVHJhdmVsVmVjdG9yID0gbmV3IFZlY3RvcjIoIEJMT1dOX0VORVJHWV9DSFVOS19UUkFWRUxfRElTVEFOQ0UgLyBudW1iZXJPZkRpcmVjdGlvbkNoYW5nZXMsIDAgKTtcclxuXHJcbiAgLy8gVGhlIGZpcnN0IHBvaW50IGlzIHN0cmFpZ2h0IHJpZ2h0IHRoZSBzdGFydGluZyBwb2ludC4gIFRoaXMgaXMgZG9uZSBiZWNhdXNlIGl0IG1ha2VzIHRoZSBjaHVua1xyXG4gIC8vIG1vdmUgc3RyYWlnaHQgb3V0IG9mIHRoZSBmYW4gY2VudGVyIGNvbmUuXHJcbiAgbGV0IGN1cnJlbnRQb3NpdGlvbiA9IHN0YXJ0aW5nUG9pbnQucGx1cyggbmV3IFZlY3RvcjIoIElOU0lERV9GQU5fRU5FUkdZX0NIVU5LX1RSQVZFTF9ESVNUQU5DRSwgMCApICk7XHJcbiAgcGF0aC5wdXNoKCBjdXJyZW50UG9zaXRpb24gKTtcclxuXHJcbiAgLy8gYWRkIHRoZSByZW1haW5pbmcgcG9pbnRzIGluIHRoZSBwYXRoXHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZEaXJlY3Rpb25DaGFuZ2VzIC0gMTsgaSsrICkge1xyXG4gICAgY29uc3QgbW92ZW1lbnQgPSBub21pbmFsVHJhdmVsVmVjdG9yLnJvdGF0ZWQoICggZG90UmFuZG9tLm5leHREb3VibGUoKSAtIDAuNSApICogTWF0aC5QSSAvIDQgKTtcclxuICAgIGN1cnJlbnRQb3NpdGlvbiA9IGN1cnJlbnRQb3NpdGlvbi5wbHVzKCBtb3ZlbWVudCApO1xyXG4gICAgcGF0aC5wdXNoKCBjdXJyZW50UG9zaXRpb24gKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBwYXRoO1xyXG59O1xyXG5cclxuZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLnJlZ2lzdGVyKCAnRmFuJywgRmFuICk7XHJcbmV4cG9ydCBkZWZhdWx0IEZhbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSw4Q0FBOEM7QUFDaEYsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLEtBQUssUUFBUSxtQ0FBbUM7QUFDekQsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLE9BQU9DLFdBQVcsTUFBTSxnQ0FBZ0M7QUFDeEQsT0FBT0MsYUFBYSxNQUFNLCtCQUErQjtBQUN6RCxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUNsRSxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjs7QUFFeEM7QUFDQSxNQUFNQyxvQkFBb0IsR0FBR0MsSUFBSSxDQUFDQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDMUMsTUFBTUMsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkMsTUFBTUMsb0NBQW9D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