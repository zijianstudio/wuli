// Copyright 2016-2022, University of Colorado Boulder

/**
 * model of a bicycle being pedaled by a rider in order to generate energy
 *
 * @author John Blanco
 * @author Andrew Adare
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
import bicycleIcon_png from '../../../images/bicycleIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Energy from './Energy.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergySource from './EnergySource.js';

// constants
const MAX_ANGULAR_VELOCITY_OF_CRANK = 3 * Math.PI; // In radians/sec.
const ANGULAR_ACCELERATION = Math.PI / 2; // In radians/(sec^2).
const MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR = EFACConstants.MAX_ENERGY_PRODUCTION_RATE; // In joules / sec
const MAX_ENERGY_OUTPUT_WHEN_RUNNING_FREE = MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR / 5; // In joules / sec
const CRANK_TO_REAR_WHEEL_RATIO = 1;
const INITIAL_NUMBER_OF_ENERGY_CHUNKS = 21;
const MECHANICAL_TO_THERMAL_CHUNK_RATIO = 5;
const REAR_WHEEL_RADIUS = 0.021; // In meters, must be worked out with the image.
const NUMBER_OF_LEG_IMAGES = 18; // must match number of leg images in view

// offsets used for creating energy chunk paths and rotating images - these need to be coordinated with the images
const BIKER_BUTTOCKS_OFFSET = new Vector2(0.02, 0.04);
const TOP_TUBE_ABOVE_CRANK_OFFSET = new Vector2(0.007, 0.015);
const BIKE_CRANK_OFFSET = new Vector2(0.0052, -0.002);
const CENTER_OF_GEAR_OFFSET = new Vector2(0.0058, -0.006);
const CENTER_OF_BACK_WHEEL_OFFSET = new Vector2(0.035, -0.01);
const UPPER_CENTER_OF_BACK_WHEEL_OFFSET = new Vector2(0.035, -0.006); // where the top chain meets the back wheel cassette
const TOP_TANGENT_OF_BACK_WHEEL_OFFSET = new Vector2(0.024, 0.007);
const NEXT_ENERGY_SYSTEM_OFFSET = new Vector2(0.107, 0.066);
const CHEMICAL_ENERGY_CHUNK_OFFSETS = [BIKER_BUTTOCKS_OFFSET, TOP_TUBE_ABOVE_CRANK_OFFSET];
class Biker extends EnergySource {
  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {Property.<boolean>} mechanicalPoweredSystemIsNextProperty - is a compatible energy system currently active
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Object} [options]
   */
  constructor(energyChunksVisibleProperty, mechanicalPoweredSystemIsNextProperty, energyChunkGroup, energyChunkPathMoverGroup, options) {
    options = merge({
      tandem: Tandem.REQUIRED
    }, options);
    super(new Image(bicycleIcon_png), options);

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.cyclist;

    // @public (read-only) {NumberProperty}
    this.crankAngleProperty = new NumberProperty(0, {
      range: new Range(0, 2 * Math.PI),
      units: 'radians',
      tandem: options.tandem.createTandem('crankAngleProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'angle of the crank arm on the bike'
    });

    // @public (read-only) {NumberProperty}
    this.rearWheelAngleProperty = new NumberProperty(0, {
      range: new Range(0, 2 * Math.PI),
      units: 'radians',
      tandem: options.tandem.createTandem('rearWheelAngleProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'angle of the rear wheel on the bike'
    });

    // @public {NumberProperty}
    this.energyChunksRemainingProperty = new NumberProperty(INITIAL_NUMBER_OF_ENERGY_CHUNKS, {
      range: new Range(0, INITIAL_NUMBER_OF_ENERGY_CHUNKS),
      tandem: options.tandem.createTandem('energyChunksRemainingProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'number of energy chunks remaining in the biker\'s body'
    });

    // @public (read-only) {NumberProperty}
    this.targetCrankAngularVelocityProperty = new NumberProperty(0, {
      range: new Range(0, MAX_ANGULAR_VELOCITY_OF_CRANK),
      units: 'radians/s',
      tandem: options.tandem.createTandem('targetCrankAngularVelocityProperty'),
      phetioDocumentation: 'target angular velocity of crank'
    });

    // @public (read-only) {NumberProperty}
    this.crankAngularVelocityProperty = new NumberProperty(0, {
      range: new Range(0, MAX_ANGULAR_VELOCITY_OF_CRANK),
      units: 'radians/s',
      tandem: options.tandem.createTandem('crankAngularVelocityProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'angular velocity of crank'
    });

    // @private - internal variables
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.mechanicalPoweredSystemIsNextProperty = mechanicalPoweredSystemIsNextProperty;
    this.energyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('energyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });
    this.energyProducedSinceLastChunkEmitted = EFACConstants.ENERGY_PER_CHUNK * 0.9;
    this.mechanicalChunksSinceLastThermal = 0;

    // @private
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;

    // monitor target rotation rate for validity
    if (assert) {
      this.targetCrankAngularVelocityProperty.link(omega => {
        assert && assert(omega >= 0 && omega <= MAX_ANGULAR_VELOCITY_OF_CRANK, `Angular velocity out of range: ${omega}`);
      });
    }

    // get the crank into a position where animation will start right away
    this.setCrankToPoisedPosition();

    // add a handler for the situation when energy chunks were in transit to the next energy system and that system is
    // swapped out
    this.mechanicalPoweredSystemIsNextProperty.link(() => {
      // While setting PhET-iO state, make sure that if this Property changed, it doesn't cascade to changing the
      // placement of energyChunks/Movers.
      if (phet.joist.sim.isSettingPhetioStateProperty.value) {
        return;
      }
      const movers = this.energyChunkMovers.slice();
      const hubPosition = this.positionProperty.value.plus(CENTER_OF_BACK_WHEEL_OFFSET);
      movers.forEach(mover => {
        const energyChunk = mover.energyChunk;
        if (energyChunk.energyTypeProperty.get() === EnergyType.MECHANICAL) {
          if (energyChunk.positionProperty.get().x > hubPosition.x) {
            // remove this energy chunk
            this.energyChunkMovers.remove(mover);
            this.energyChunkList.remove(energyChunk);
            this.energyChunkGroup.disposeElement(energyChunk);
            this.energyChunkPathMoverGroup.disposeElement(mover);
          } else {
            // make sure that this energy chunk turns into thermal energy
            this.energyChunkMovers.remove(mover);
            this.energyChunkPathMoverGroup.disposeElement(mover);
            this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(energyChunk, createMechanicalToThermalEnergyChunkPath(this.positionProperty.value, energyChunk.positionProperty.get()), EFACConstants.ENERGY_CHUNK_VELOCITY));
          }
        }
      });
    });
  }

  /**
   * step this energy producer forward in time
   * @param  {number} dt - time step in seconds
   * @returns {Energy}
   * @public
   */
  step(dt) {
    if (!this.activeProperty.value) {
      return new Energy(EnergyType.MECHANICAL, 0, -Math.PI / 2);
    }

    // if there is no energy, the target speed is 0, otherwise it is the current set point
    const target = this.energyChunksRemainingProperty.value > 0 ? this.targetCrankAngularVelocityProperty.value : 0;

    // speed up or slow down the angular velocity of the crank
    const previousAngularVelocity = this.crankAngularVelocityProperty.value;
    const dOmega = target - this.crankAngularVelocityProperty.value;
    if (dOmega !== 0) {
      const change = ANGULAR_ACCELERATION * dt;
      if (dOmega > 0) {
        // accelerate
        this.crankAngularVelocityProperty.value = Math.min(this.crankAngularVelocityProperty.value + change, this.targetCrankAngularVelocityProperty.value);
      } else {
        // decelerate
        this.crankAngularVelocityProperty.value = Math.max(this.crankAngularVelocityProperty.value - change, 0);
      }
    }
    const newAngle = (this.crankAngleProperty.value + this.crankAngularVelocityProperty.value * dt) % (2 * Math.PI);
    this.crankAngleProperty.set(newAngle);
    this.rearWheelAngleProperty.set((this.rearWheelAngleProperty.value + this.crankAngularVelocityProperty.value * dt * CRANK_TO_REAR_WHEEL_RATIO) % (2 * Math.PI));
    if (this.crankAngularVelocityProperty.value === 0 && previousAngularVelocity !== 0) {
      // set crank to a good position where animation will start right away when motion is restarted
      this.setCrankToPoisedPosition();
    }
    const fractionalVelocity = this.crankAngularVelocityProperty.value / MAX_ANGULAR_VELOCITY_OF_CRANK;

    // determine how much energy is produced in this time step
    if (this.targetCrankAngularVelocityProperty.value > 0) {
      // less energy is produced if not hooked up to generator
      let maxEnergyProductionRate = MAX_ENERGY_OUTPUT_WHEN_RUNNING_FREE;
      if (this.mechanicalPoweredSystemIsNextProperty.value) {
        maxEnergyProductionRate = MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR;
      }
      this.energyProducedSinceLastChunkEmitted += maxEnergyProductionRate * fractionalVelocity * dt;
    }

    // decide if new chem energy chunk should start on its way
    if (this.energyProducedSinceLastChunkEmitted >= EFACConstants.ENERGY_PER_CHUNK && this.targetCrankAngularVelocityProperty.value > 0) {
      // start a new chunk moving
      const energyChunk = this.findNonMovingEnergyChunk();
      if (energyChunk) {
        this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(energyChunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.value, CHEMICAL_ENERGY_CHUNK_OFFSETS), EFACConstants.ENERGY_CHUNK_VELOCITY));
        this.energyProducedSinceLastChunkEmitted = 0;

        // update by reading how many chunks remain in the biker's body
        this.energyChunksRemainingProperty.set(this.energyChunkList.length - this.energyChunkMovers.length);
      }
    }
    this.moveEnergyChunks(dt);
    const energyAmount = Math.abs(fractionalVelocity * MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR * dt);
    assert && assert(energyAmount >= 0, `energyAmount is ${energyAmount}`);
    return new Energy(EnergyType.MECHANICAL, energyAmount, -Math.PI / 2);
  }

  /**
   * moves energy chunks throughout the biker system and converts them to other energy types as needed
   *
   * @param {number} dt
   * @private
   */
  moveEnergyChunks(dt) {
    // iterate through this copy while the original is mutated
    const movers = this.energyChunkMovers.slice();
    movers.forEach(mover => {
      mover.moveAlongPath(dt);
      if (!mover.pathFullyTraversed) {
        return;
      }
      const chunk = mover.energyChunk;

      // CHEMICAL --> MECHANICAL
      if (chunk.energyTypeProperty.get() === EnergyType.CHEMICAL) {
        // turn this into mechanical energy
        chunk.energyTypeProperty.set(EnergyType.MECHANICAL);
        this.energyChunkMovers.remove(mover);
        this.energyChunkPathMoverGroup.disposeElement(mover);

        // add new mover for the mechanical energy chunk
        if (this.mechanicalChunksSinceLastThermal >= MECHANICAL_TO_THERMAL_CHUNK_RATIO || !this.mechanicalPoweredSystemIsNextProperty.get()) {
          // make this chunk travel to the rear hub, where it will become a chunk of thermal energy
          this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(chunk, createMechanicalToThermalEnergyChunkPath(this.positionProperty.value, chunk.positionProperty.get()), EFACConstants.ENERGY_CHUNK_VELOCITY));
          this.mechanicalChunksSinceLastThermal = 0;
        } else {
          const mechanicalEnergyChunkOffsets = [BIKE_CRANK_OFFSET, UPPER_CENTER_OF_BACK_WHEEL_OFFSET, TOP_TANGENT_OF_BACK_WHEEL_OFFSET, NEXT_ENERGY_SYSTEM_OFFSET];

          // send this chunk to the next energy system
          this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(chunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.get(), mechanicalEnergyChunkOffsets), EFACConstants.ENERGY_CHUNK_VELOCITY));
          this.mechanicalChunksSinceLastThermal++;
        }
      }

      // MECHANICAL --> THERMAL
      else if (chunk.energyTypeProperty.get() === EnergyType.MECHANICAL && chunk.positionProperty.get().distance(this.positionProperty.value.plus(CENTER_OF_BACK_WHEEL_OFFSET)) < 1E-6) {
        // this is a mechanical energy chunk that has traveled to the hub and should now become thermal energy
        this.energyChunkMovers.remove(mover);
        this.energyChunkPathMoverGroup.disposeElement(mover);
        chunk.energyTypeProperty.set(EnergyType.THERMAL);
        this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(chunk, EnergyChunkPathMover.createRadiatedPath(this.positionProperty.value.plus(CENTER_OF_BACK_WHEEL_OFFSET), Math.PI * -0.1), EFACConstants.ENERGY_CHUNK_VELOCITY));
      }

      // THERMAL
      else if (chunk.energyTypeProperty.get() === EnergyType.THERMAL) {
        // this is a radiating thermal energy chunk that has reached the end of its route - delete it
        this.energyChunkMovers.remove(mover);
        this.energyChunkList.remove(chunk);
        this.energyChunkGroup.disposeElement(chunk);
        this.energyChunkPathMoverGroup.disposeElement(mover);
      }

      // MECHANICAL
      else {
        // must be mechanical energy that is being passed to the next energy system element
        this.energyChunkList.remove(chunk);
        this.outgoingEnergyChunks.push(chunk);
        this.energyChunkMovers.remove(mover);
        this.energyChunkPathMoverGroup.disposeElement(mover);
      }
    });
  }

  /**
   * @public
   * @override
   */
  preloadEnergyChunks() {
    // if we're not supposed to have any chunks, clear any existing ones out of the biker. this is needed for stateSet,
    // see https://github.com/phetsims/energy-forms-and-changes/issues/335
    if (this.energyChunksRemainingProperty.value === 0) {
      this.clearEnergyChunks();
    }

    // Return if biker is not pedaling, or is out of energy, or is not hooked up to a compatible system
    if (this.crankAngularVelocityProperty.value === 0 || this.energyChunksRemainingProperty.value === 0 || !this.mechanicalPoweredSystemIsNextProperty.value) {
      return;
    }
    this.replenishBikerEnergyChunks();
    let preloadComplete = false;
    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;
    const fractionalVelocity = this.crankAngularVelocityProperty.value / MAX_ANGULAR_VELOCITY_OF_CRANK;

    // Simulate energy chunks moving through the system.
    while (!preloadComplete) {
      if (this.outgoingEnergyChunks.length > 0) {
        // An energy chunk has traversed to the output of this system, completing the preload. If enough chunks are
        // already in the biker system, then we may not need to preload any, either, so check this condition before
        // adding the first pre-loaded chunk.
        preloadComplete = true;
        break;
      }
      energySinceLastChunk += MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR * fractionalVelocity * dt;

      // decide if new chem energy chunk should start on its way
      if (energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK) {
        // we know the biker is not out of energy, so get one of the remaining chunks
        const energyChunk = this.findNonMovingEnergyChunk();
        this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(energyChunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.value, CHEMICAL_ENERGY_CHUNK_OFFSETS), EFACConstants.ENERGY_CHUNK_VELOCITY));
        energySinceLastChunk = 0;

        // add back what we just took from the biker's energy, since we want to preserve the biker's energy state.
        this.addEnergyChunkToBiker();
      }

      // Update energy chunk positions.
      this.moveEnergyChunks(dt);
    }
  }

  /**
   * @returns {Energy}
   * @public
   * @override
   */
  getEnergyOutputRate() {
    const amount = Math.abs(this.crankAngularVelocityProperty.value / MAX_ANGULAR_VELOCITY_OF_CRANK * MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR);
    return new Energy(EnergyType.MECHANICAL, amount, -Math.PI / 2);
  }

  /**
   * Set the crank to a position where a very small amount of motion will cause a new image to be chosen.  This is
   * generally done when the biker stops so that the animation starts right away the next time the motion starts.
   * @private
   */
  setCrankToPoisedPosition() {
    const currentIndex = this.mapAngleToImageIndex(this.crankAngleProperty.value);
    const radiansPerImage = 2 * Math.PI / NUMBER_OF_LEG_IMAGES;
    this.crankAngleProperty.set(currentIndex % NUMBER_OF_LEG_IMAGES * radiansPerImage + (radiansPerImage - 1E-7));
    assert && assert(this.crankAngleProperty.value >= 0 && this.crankAngleProperty.value <= 2 * Math.PI);
  }

  /**
   * The biker is replenished each time she is reactivated. This was a fairly arbitrary decision, and can be changed
   * if desired.
   * @public
   * @override
   */
  activate() {
    super.activate();
    this.replenishBikerEnergyChunks();
  }

  /**
   * @public
   * @override
   */
  deactivate() {
    super.deactivate();
    this.targetCrankAngularVelocityProperty.reset();
    this.energyChunksRemainingProperty.reset();
    this.rearWheelAngleProperty.reset();
    this.crankAngularVelocityProperty.value = this.targetCrankAngularVelocityProperty.value;
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.energyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.energyChunkMovers.clear();
  }

  /**
   * adds the current number of energy chunks remaining to the biker
   * @param {boolean} [clearEnergyChunks] - whether to clear the existing chunks out of the biker before adding them
   * back.
   * @public
   */
  replenishBikerEnergyChunks(clearEnergyChunks = true) {
    clearEnergyChunks && this.clearEnergyChunks();
    for (let i = 0; i < this.energyChunksRemainingProperty.value; i++) {
      this.addEnergyChunkToBiker();
    }
  }

  /**
   * add one energy chunk to biker
   * @public
   */
  addEnergyChunkToBiker() {
    const nominalInitialOffset = new Vector2(0.019, 0.055);
    const displacement = new Vector2((dotRandom.nextDouble() - 0.5) * 0.02, 0).rotated(Math.PI * 0.7);
    const position = this.positionProperty.value.plus(nominalInitialOffset).plus(displacement);
    const newEnergyChunk = this.energyChunkGroup.createNextElement(EnergyType.CHEMICAL, position, Vector2.ZERO, this.energyChunksVisibleProperty);
    this.energyChunkList.add(newEnergyChunk);
  }

  /**
   * find the image index corresponding to this angle in radians
   * @param  {number} angle
   * @returns {number} - image index
   * @public
   */
  mapAngleToImageIndex(angle) {
    const i = Math.floor(angle % (2 * Math.PI) / (2 * Math.PI / NUMBER_OF_LEG_IMAGES));
    assert && assert(i >= 0 && i < NUMBER_OF_LEG_IMAGES);
    return i;
  }

  /**
   * find a non-moving CHEMICAL energy chunk, returns null if none are found
   * @returns {EnergyChunk}
   * @private
   */
  findNonMovingEnergyChunk() {
    const movingEnergyChunks = [];
    let nonMovingEnergyChunk = null;
    this.energyChunkMovers.forEach(mover => {
      movingEnergyChunks.push(mover.energyChunk);
    });
    this.energyChunkList.forEach(chunk => {
      // only interested in CHEMICAL energy chunks that are not moving
      if (chunk.energyTypeProperty.value === EnergyType.CHEMICAL && movingEnergyChunks.indexOf(chunk) === -1) {
        nonMovingEnergyChunk = chunk;
      }
    });
    return nonMovingEnergyChunk;
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @returns {Object}
   */
  toStateObject() {
    return {
      energyProducedSinceLastChunkEmitted: this.energyProducedSinceLastChunkEmitted,
      mechanicalChunksSinceLastThermal: this.mechanicalChunksSinceLastThermal
    };
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @param {Object} stateObject - see this.toStateObject()
   */
  applyState(stateObject) {
    this.energyProducedSinceLastChunkEmitted = stateObject.energyProducedSinceLastChunkEmitted;
    this.mechanicalChunksSinceLastThermal = stateObject.mechanicalChunksSinceLastThermal;
  }
}

/**
 * creates a path for an energy chunk that will travel to the hub and then become thermal
 *
 * @param  {Vector2} centerPosition
 * @param  {Vector2} currentPosition
 * @returns {Vector2[]}
 * @private
 */
const createMechanicalToThermalEnergyChunkPath = (centerPosition, currentPosition) => {
  const path = [];
  const crankPosition = centerPosition.plus(BIKE_CRANK_OFFSET);
  if (currentPosition.y > crankPosition.y) {
    // only add the crank position if the current position indicates that the chunk hasn't reached the crank yet
    path.push(centerPosition.plus(BIKE_CRANK_OFFSET));
  }
  path.push(centerPosition.plus(CENTER_OF_BACK_WHEEL_OFFSET));
  return path;
};

// statics
Biker.CENTER_OF_GEAR_OFFSET = CENTER_OF_GEAR_OFFSET;
Biker.CENTER_OF_BACK_WHEEL_OFFSET = CENTER_OF_BACK_WHEEL_OFFSET;
Biker.INITIAL_NUMBER_OF_ENERGY_CHUNKS = INITIAL_NUMBER_OF_ENERGY_CHUNKS;
Biker.MAX_ANGULAR_VELOCITY_OF_CRANK = MAX_ANGULAR_VELOCITY_OF_CRANK;
Biker.NUMBER_OF_LEG_IMAGES = NUMBER_OF_LEG_IMAGES;
Biker.REAR_WHEEL_RADIUS = REAR_WHEEL_RADIUS;
energyFormsAndChanges.register('Biker', Biker);
export default Biker;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJOdW1iZXJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlJhbmdlIiwiVmVjdG9yMiIsIm1lcmdlIiwiSW1hZ2UiLCJUYW5kZW0iLCJSZWZlcmVuY2VJTyIsImJpY3ljbGVJY29uX3BuZyIsIkVGQUNDb25zdGFudHMiLCJFbmVyZ3lUeXBlIiwiZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIiwiRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncyIsIkVuZXJneSIsIkVuZXJneUNodW5rUGF0aE1vdmVyIiwiRW5lcmd5U291cmNlIiwiTUFYX0FOR1VMQVJfVkVMT0NJVFlfT0ZfQ1JBTksiLCJNYXRoIiwiUEkiLCJBTkdVTEFSX0FDQ0VMRVJBVElPTiIsIk1BWF9FTkVSR1lfT1VUUFVUX1dIRU5fQ09OTkVDVEVEX1RPX0dFTkVSQVRPUiIsIk1BWF9FTkVSR1lfUFJPRFVDVElPTl9SQVRFIiwiTUFYX0VORVJHWV9PVVRQVVRfV0hFTl9SVU5OSU5HX0ZSRUUiLCJDUkFOS19UT19SRUFSX1dIRUVMX1JBVElPIiwiSU5JVElBTF9OVU1CRVJfT0ZfRU5FUkdZX0NIVU5LUyIsIk1FQ0hBTklDQUxfVE9fVEhFUk1BTF9DSFVOS19SQVRJTyIsIlJFQVJfV0hFRUxfUkFESVVTIiwiTlVNQkVSX09GX0xFR19JTUFHRVMiLCJCSUtFUl9CVVRUT0NLU19PRkZTRVQiLCJUT1BfVFVCRV9BQk9WRV9DUkFOS19PRkZTRVQiLCJCSUtFX0NSQU5LX09GRlNFVCIsIkNFTlRFUl9PRl9HRUFSX09GRlNFVCIsIkNFTlRFUl9PRl9CQUNLX1dIRUVMX09GRlNFVCIsIlVQUEVSX0NFTlRFUl9PRl9CQUNLX1dIRUVMX09GRlNFVCIsIlRPUF9UQU5HRU5UX09GX0JBQ0tfV0hFRUxfT0ZGU0VUIiwiTkVYVF9FTkVSR1lfU1lTVEVNX09GRlNFVCIsIkNIRU1JQ0FMX0VORVJHWV9DSFVOS19PRkZTRVRTIiwiQmlrZXIiLCJjb25zdHJ1Y3RvciIsImVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSIsIm1lY2hhbmljYWxQb3dlcmVkU3lzdGVtSXNOZXh0UHJvcGVydHkiLCJlbmVyZ3lDaHVua0dyb3VwIiwiZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCIsIm9wdGlvbnMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImExMXlOYW1lIiwiYTExeSIsImN5Y2xpc3QiLCJjcmFua0FuZ2xlUHJvcGVydHkiLCJyYW5nZSIsInVuaXRzIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9IaWdoRnJlcXVlbmN5IiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInJlYXJXaGVlbEFuZ2xlUHJvcGVydHkiLCJlbmVyZ3lDaHVua3NSZW1haW5pbmdQcm9wZXJ0eSIsInRhcmdldENyYW5rQW5ndWxhclZlbG9jaXR5UHJvcGVydHkiLCJjcmFua0FuZ3VsYXJWZWxvY2l0eVByb3BlcnR5IiwiZW5lcmd5Q2h1bmtNb3ZlcnMiLCJwaGV0aW9UeXBlIiwiT2JzZXJ2YWJsZUFycmF5SU8iLCJFbmVyZ3lDaHVua1BhdGhNb3ZlcklPIiwiZW5lcmd5UHJvZHVjZWRTaW5jZUxhc3RDaHVua0VtaXR0ZWQiLCJFTkVSR1lfUEVSX0NIVU5LIiwibWVjaGFuaWNhbENodW5rc1NpbmNlTGFzdFRoZXJtYWwiLCJhc3NlcnQiLCJsaW5rIiwib21lZ2EiLCJzZXRDcmFua1RvUG9pc2VkUG9zaXRpb24iLCJwaGV0Iiwiam9pc3QiLCJzaW0iLCJpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IiwidmFsdWUiLCJtb3ZlcnMiLCJzbGljZSIsImh1YlBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsInBsdXMiLCJmb3JFYWNoIiwibW92ZXIiLCJlbmVyZ3lDaHVuayIsImVuZXJneVR5cGVQcm9wZXJ0eSIsImdldCIsIk1FQ0hBTklDQUwiLCJ4IiwicmVtb3ZlIiwiZW5lcmd5Q2h1bmtMaXN0IiwiZGlzcG9zZUVsZW1lbnQiLCJwdXNoIiwiY3JlYXRlTmV4dEVsZW1lbnQiLCJjcmVhdGVNZWNoYW5pY2FsVG9UaGVybWFsRW5lcmd5Q2h1bmtQYXRoIiwiRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIiwic3RlcCIsImR0IiwiYWN0aXZlUHJvcGVydHkiLCJ0YXJnZXQiLCJwcmV2aW91c0FuZ3VsYXJWZWxvY2l0eSIsImRPbWVnYSIsImNoYW5nZSIsIm1pbiIsIm1heCIsIm5ld0FuZ2xlIiwic2V0IiwiZnJhY3Rpb25hbFZlbG9jaXR5IiwibWF4RW5lcmd5UHJvZHVjdGlvblJhdGUiLCJmaW5kTm9uTW92aW5nRW5lcmd5Q2h1bmsiLCJjcmVhdGVQYXRoRnJvbU9mZnNldHMiLCJsZW5ndGgiLCJtb3ZlRW5lcmd5Q2h1bmtzIiwiZW5lcmd5QW1vdW50IiwiYWJzIiwibW92ZUFsb25nUGF0aCIsInBhdGhGdWxseVRyYXZlcnNlZCIsImNodW5rIiwiQ0hFTUlDQUwiLCJtZWNoYW5pY2FsRW5lcmd5Q2h1bmtPZmZzZXRzIiwiZGlzdGFuY2UiLCJUSEVSTUFMIiwiY3JlYXRlUmFkaWF0ZWRQYXRoIiwib3V0Z29pbmdFbmVyZ3lDaHVua3MiLCJwcmVsb2FkRW5lcmd5Q2h1bmtzIiwiY2xlYXJFbmVyZ3lDaHVua3MiLCJyZXBsZW5pc2hCaWtlckVuZXJneUNodW5rcyIsInByZWxvYWRDb21wbGV0ZSIsIkZSQU1FU19QRVJfU0VDT05EIiwiZW5lcmd5U2luY2VMYXN0Q2h1bmsiLCJhZGRFbmVyZ3lDaHVua1RvQmlrZXIiLCJnZXRFbmVyZ3lPdXRwdXRSYXRlIiwiYW1vdW50IiwiY3VycmVudEluZGV4IiwibWFwQW5nbGVUb0ltYWdlSW5kZXgiLCJyYWRpYW5zUGVySW1hZ2UiLCJhY3RpdmF0ZSIsImRlYWN0aXZhdGUiLCJyZXNldCIsImNsZWFyIiwiaSIsIm5vbWluYWxJbml0aWFsT2Zmc2V0IiwiZGlzcGxhY2VtZW50IiwibmV4dERvdWJsZSIsInJvdGF0ZWQiLCJwb3NpdGlvbiIsIm5ld0VuZXJneUNodW5rIiwiWkVSTyIsImFkZCIsImFuZ2xlIiwiZmxvb3IiLCJtb3ZpbmdFbmVyZ3lDaHVua3MiLCJub25Nb3ZpbmdFbmVyZ3lDaHVuayIsImluZGV4T2YiLCJ0b1N0YXRlT2JqZWN0IiwiYXBwbHlTdGF0ZSIsInN0YXRlT2JqZWN0IiwiY2VudGVyUG9zaXRpb24iLCJjdXJyZW50UG9zaXRpb24iLCJwYXRoIiwiY3JhbmtQb3NpdGlvbiIsInkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJpa2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIG1vZGVsIG9mIGEgYmljeWNsZSBiZWluZyBwZWRhbGVkIGJ5IGEgcmlkZXIgaW4gb3JkZXIgdG8gZ2VuZXJhdGUgZW5lcmd5XHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBBbmRyZXcgQWRhcmVcclxuICovXHJcblxyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IGJpY3ljbGVJY29uX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvYmljeWNsZUljb25fcG5nLmpzJztcclxuaW1wb3J0IEVGQUNDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0VGQUNDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRW5lcmd5VHlwZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRW5lcmd5VHlwZS5qcyc7XHJcbmltcG9ydCBlbmVyZ3lGb3Jtc0FuZENoYW5nZXMgZnJvbSAnLi4vLi4vZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLmpzJztcclxuaW1wb3J0IEVuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MgZnJvbSAnLi4vLi4vRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBFbmVyZ3kgZnJvbSAnLi9FbmVyZ3kuanMnO1xyXG5pbXBvcnQgRW5lcmd5Q2h1bmtQYXRoTW92ZXIgZnJvbSAnLi9FbmVyZ3lDaHVua1BhdGhNb3Zlci5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTb3VyY2UgZnJvbSAnLi9FbmVyZ3lTb3VyY2UuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1BWF9BTkdVTEFSX1ZFTE9DSVRZX09GX0NSQU5LID0gMyAqIE1hdGguUEk7IC8vIEluIHJhZGlhbnMvc2VjLlxyXG5jb25zdCBBTkdVTEFSX0FDQ0VMRVJBVElPTiA9IE1hdGguUEkgLyAyOyAvLyBJbiByYWRpYW5zLyhzZWNeMikuXHJcbmNvbnN0IE1BWF9FTkVSR1lfT1VUUFVUX1dIRU5fQ09OTkVDVEVEX1RPX0dFTkVSQVRPUiA9IEVGQUNDb25zdGFudHMuTUFYX0VORVJHWV9QUk9EVUNUSU9OX1JBVEU7IC8vIEluIGpvdWxlcyAvIHNlY1xyXG5jb25zdCBNQVhfRU5FUkdZX09VVFBVVF9XSEVOX1JVTk5JTkdfRlJFRSA9IE1BWF9FTkVSR1lfT1VUUFVUX1dIRU5fQ09OTkVDVEVEX1RPX0dFTkVSQVRPUiAvIDU7IC8vIEluIGpvdWxlcyAvIHNlY1xyXG5jb25zdCBDUkFOS19UT19SRUFSX1dIRUVMX1JBVElPID0gMTtcclxuY29uc3QgSU5JVElBTF9OVU1CRVJfT0ZfRU5FUkdZX0NIVU5LUyA9IDIxO1xyXG5jb25zdCBNRUNIQU5JQ0FMX1RPX1RIRVJNQUxfQ0hVTktfUkFUSU8gPSA1O1xyXG5jb25zdCBSRUFSX1dIRUVMX1JBRElVUyA9IDAuMDIxOyAvLyBJbiBtZXRlcnMsIG11c3QgYmUgd29ya2VkIG91dCB3aXRoIHRoZSBpbWFnZS5cclxuY29uc3QgTlVNQkVSX09GX0xFR19JTUFHRVMgPSAxODsgLy8gbXVzdCBtYXRjaCBudW1iZXIgb2YgbGVnIGltYWdlcyBpbiB2aWV3XHJcblxyXG4vLyBvZmZzZXRzIHVzZWQgZm9yIGNyZWF0aW5nIGVuZXJneSBjaHVuayBwYXRocyBhbmQgcm90YXRpbmcgaW1hZ2VzIC0gdGhlc2UgbmVlZCB0byBiZSBjb29yZGluYXRlZCB3aXRoIHRoZSBpbWFnZXNcclxuY29uc3QgQklLRVJfQlVUVE9DS1NfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIDAuMDIsIDAuMDQgKTtcclxuY29uc3QgVE9QX1RVQkVfQUJPVkVfQ1JBTktfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIDAuMDA3LCAwLjAxNSApO1xyXG5jb25zdCBCSUtFX0NSQU5LX09GRlNFVCA9IG5ldyBWZWN0b3IyKCAwLjAwNTIsIC0wLjAwMiApO1xyXG5jb25zdCBDRU5URVJfT0ZfR0VBUl9PRkZTRVQgPSBuZXcgVmVjdG9yMiggMC4wMDU4LCAtMC4wMDYgKTtcclxuY29uc3QgQ0VOVEVSX09GX0JBQ0tfV0hFRUxfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIDAuMDM1LCAtMC4wMSApO1xyXG5jb25zdCBVUFBFUl9DRU5URVJfT0ZfQkFDS19XSEVFTF9PRkZTRVQgPSBuZXcgVmVjdG9yMiggMC4wMzUsIC0wLjAwNiApOyAvLyB3aGVyZSB0aGUgdG9wIGNoYWluIG1lZXRzIHRoZSBiYWNrIHdoZWVsIGNhc3NldHRlXHJcbmNvbnN0IFRPUF9UQU5HRU5UX09GX0JBQ0tfV0hFRUxfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIDAuMDI0LCAwLjAwNyApO1xyXG5jb25zdCBORVhUX0VORVJHWV9TWVNURU1fT0ZGU0VUID0gbmV3IFZlY3RvcjIoIDAuMTA3LCAwLjA2NiApO1xyXG5jb25zdCBDSEVNSUNBTF9FTkVSR1lfQ0hVTktfT0ZGU0VUUyA9IFsgQklLRVJfQlVUVE9DS1NfT0ZGU0VULCBUT1BfVFVCRV9BQk9WRV9DUkFOS19PRkZTRVQgXTtcclxuXHJcblxyXG5jbGFzcyBCaWtlciBleHRlbmRzIEVuZXJneVNvdXJjZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gbWVjaGFuaWNhbFBvd2VyZWRTeXN0ZW1Jc05leHRQcm9wZXJ0eSAtIGlzIGEgY29tcGF0aWJsZSBlbmVyZ3kgc3lzdGVtIGN1cnJlbnRseSBhY3RpdmVcclxuICAgKiBAcGFyYW0ge0VuZXJneUNodW5rR3JvdXB9IGVuZXJneUNodW5rR3JvdXBcclxuICAgKiBAcGFyYW0ge0VuZXJneUNodW5rUGF0aE1vdmVyR3JvdXB9IGVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXBcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSwgbWVjaGFuaWNhbFBvd2VyZWRTeXN0ZW1Jc05leHRQcm9wZXJ0eSxcclxuICAgICAgICAgICAgICAgZW5lcmd5Q2h1bmtHcm91cCwgZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCxcclxuICAgICAgICAgICAgICAgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggbmV3IEltYWdlKCBiaWN5Y2xlSWNvbl9wbmcgKSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ30gLSBhMTF5IG5hbWVcclxuICAgIHRoaXMuYTExeU5hbWUgPSBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmExMXkuY3ljbGlzdDtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtOdW1iZXJQcm9wZXJ0eX1cclxuICAgIHRoaXMuY3JhbmtBbmdsZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDIgKiBNYXRoLlBJICksXHJcbiAgICAgIHVuaXRzOiAncmFkaWFucycsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY3JhbmtBbmdsZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2FuZ2xlIG9mIHRoZSBjcmFuayBhcm0gb24gdGhlIGJpa2UnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7TnVtYmVyUHJvcGVydHl9XHJcbiAgICB0aGlzLnJlYXJXaGVlbEFuZ2xlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMiAqIE1hdGguUEkgKSxcclxuICAgICAgdW5pdHM6ICdyYWRpYW5zJyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZWFyV2hlZWxBbmdsZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2FuZ2xlIG9mIHRoZSByZWFyIHdoZWVsIG9uIHRoZSBiaWtlJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge051bWJlclByb3BlcnR5fVxyXG4gICAgdGhpcy5lbmVyZ3lDaHVua3NSZW1haW5pbmdQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggSU5JVElBTF9OVU1CRVJfT0ZfRU5FUkdZX0NIVU5LUywge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCBJTklUSUFMX05VTUJFUl9PRl9FTkVSR1lfQ0hVTktTICksXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5Q2h1bmtzUmVtYWluaW5nUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnbnVtYmVyIG9mIGVuZXJneSBjaHVua3MgcmVtYWluaW5nIGluIHRoZSBiaWtlclxcJ3MgYm9keSdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtOdW1iZXJQcm9wZXJ0eX1cclxuICAgIHRoaXMudGFyZ2V0Q3JhbmtBbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCBNQVhfQU5HVUxBUl9WRUxPQ0lUWV9PRl9DUkFOSyApLFxyXG4gICAgICB1bml0czogJ3JhZGlhbnMvcycsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndGFyZ2V0Q3JhbmtBbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RhcmdldCBhbmd1bGFyIHZlbG9jaXR5IG9mIGNyYW5rJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge051bWJlclByb3BlcnR5fVxyXG4gICAgdGhpcy5jcmFua0FuZ3VsYXJWZWxvY2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIE1BWF9BTkdVTEFSX1ZFTE9DSVRZX09GX0NSQU5LICksXHJcbiAgICAgIHVuaXRzOiAncmFkaWFucy9zJyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjcmFua0FuZ3VsYXJWZWxvY2l0eVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2FuZ3VsYXIgdmVsb2NpdHkgb2YgY3JhbmsnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBpbnRlcm5hbCB2YXJpYWJsZXNcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5ID0gZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5O1xyXG4gICAgdGhpcy5tZWNoYW5pY2FsUG93ZXJlZFN5c3RlbUlzTmV4dFByb3BlcnR5ID0gbWVjaGFuaWNhbFBvd2VyZWRTeXN0ZW1Jc05leHRQcm9wZXJ0eTtcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtNb3ZlcnMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbmVyZ3lDaHVua01vdmVycycgKSxcclxuICAgICAgcGhldGlvVHlwZTogY3JlYXRlT2JzZXJ2YWJsZUFycmF5Lk9ic2VydmFibGVBcnJheUlPKCBSZWZlcmVuY2VJTyggRW5lcmd5Q2h1bmtQYXRoTW92ZXIuRW5lcmd5Q2h1bmtQYXRoTW92ZXJJTyApIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmVuZXJneVByb2R1Y2VkU2luY2VMYXN0Q2h1bmtFbWl0dGVkID0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LICogMC45O1xyXG4gICAgdGhpcy5tZWNoYW5pY2FsQ2h1bmtzU2luY2VMYXN0VGhlcm1hbCA9IDA7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cCA9IGVuZXJneUNodW5rR3JvdXA7XHJcbiAgICB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAgPSBlbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwO1xyXG5cclxuICAgIC8vIG1vbml0b3IgdGFyZ2V0IHJvdGF0aW9uIHJhdGUgZm9yIHZhbGlkaXR5XHJcbiAgICBpZiAoIGFzc2VydCApIHtcclxuICAgICAgdGhpcy50YXJnZXRDcmFua0FuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LmxpbmsoIG9tZWdhID0+IHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvbWVnYSA+PSAwICYmIG9tZWdhIDw9IE1BWF9BTkdVTEFSX1ZFTE9DSVRZX09GX0NSQU5LLFxyXG4gICAgICAgICAgYEFuZ3VsYXIgdmVsb2NpdHkgb3V0IG9mIHJhbmdlOiAke29tZWdhfWAgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGdldCB0aGUgY3JhbmsgaW50byBhIHBvc2l0aW9uIHdoZXJlIGFuaW1hdGlvbiB3aWxsIHN0YXJ0IHJpZ2h0IGF3YXlcclxuICAgIHRoaXMuc2V0Q3JhbmtUb1BvaXNlZFBvc2l0aW9uKCk7XHJcblxyXG4gICAgLy8gYWRkIGEgaGFuZGxlciBmb3IgdGhlIHNpdHVhdGlvbiB3aGVuIGVuZXJneSBjaHVua3Mgd2VyZSBpbiB0cmFuc2l0IHRvIHRoZSBuZXh0IGVuZXJneSBzeXN0ZW0gYW5kIHRoYXQgc3lzdGVtIGlzXHJcbiAgICAvLyBzd2FwcGVkIG91dFxyXG4gICAgdGhpcy5tZWNoYW5pY2FsUG93ZXJlZFN5c3RlbUlzTmV4dFByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuXHJcbiAgICAgIC8vIFdoaWxlIHNldHRpbmcgUGhFVC1pTyBzdGF0ZSwgbWFrZSBzdXJlIHRoYXQgaWYgdGhpcyBQcm9wZXJ0eSBjaGFuZ2VkLCBpdCBkb2Vzbid0IGNhc2NhZGUgdG8gY2hhbmdpbmcgdGhlXHJcbiAgICAgIC8vIHBsYWNlbWVudCBvZiBlbmVyZ3lDaHVua3MvTW92ZXJzLlxyXG4gICAgICBpZiAoIHBoZXQuam9pc3Quc2ltLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBtb3ZlcnMgPSB0aGlzLmVuZXJneUNodW5rTW92ZXJzLnNsaWNlKCk7XHJcbiAgICAgIGNvbnN0IGh1YlBvc2l0aW9uID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnBsdXMoIENFTlRFUl9PRl9CQUNLX1dIRUVMX09GRlNFVCApO1xyXG5cclxuICAgICAgbW92ZXJzLmZvckVhY2goIG1vdmVyID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgZW5lcmd5Q2h1bmsgPSBtb3Zlci5lbmVyZ3lDaHVuaztcclxuXHJcbiAgICAgICAgaWYgKCBlbmVyZ3lDaHVuay5lbmVyZ3lUeXBlUHJvcGVydHkuZ2V0KCkgPT09IEVuZXJneVR5cGUuTUVDSEFOSUNBTCApIHtcclxuICAgICAgICAgIGlmICggZW5lcmd5Q2h1bmsucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ID4gaHViUG9zaXRpb24ueCApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aGlzIGVuZXJneSBjaHVua1xyXG4gICAgICAgICAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzLnJlbW92ZSggbW92ZXIgKTtcclxuICAgICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QucmVtb3ZlKCBlbmVyZ3lDaHVuayApO1xyXG4gICAgICAgICAgICB0aGlzLmVuZXJneUNodW5rR3JvdXAuZGlzcG9zZUVsZW1lbnQoIGVuZXJneUNodW5rICk7XHJcbiAgICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhpcyBlbmVyZ3kgY2h1bmsgdHVybnMgaW50byB0aGVybWFsIGVuZXJneVxyXG4gICAgICAgICAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzLnJlbW92ZSggbW92ZXIgKTtcclxuICAgICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmRpc3Bvc2VFbGVtZW50KCBtb3ZlciApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua01vdmVycy5wdXNoKCB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoXHJcbiAgICAgICAgICAgICAgZW5lcmd5Q2h1bmssXHJcbiAgICAgICAgICAgICAgY3JlYXRlTWVjaGFuaWNhbFRvVGhlcm1hbEVuZXJneUNodW5rUGF0aCggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLCBlbmVyZ3lDaHVuay5wb3NpdGlvblByb3BlcnR5LmdldCgpICksXHJcbiAgICAgICAgICAgICAgRUZBQ0NvbnN0YW50cy5FTkVSR1lfQ0hVTktfVkVMT0NJVFlcclxuICAgICAgICAgICAgKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc3RlcCB0aGlzIGVuZXJneSBwcm9kdWNlciBmb3J3YXJkIGluIHRpbWVcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwIGluIHNlY29uZHNcclxuICAgKiBAcmV0dXJucyB7RW5lcmd5fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuXHJcbiAgICBpZiAoICF0aGlzLmFjdGl2ZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICByZXR1cm4gbmV3IEVuZXJneSggRW5lcmd5VHlwZS5NRUNIQU5JQ0FMLCAwLCAtTWF0aC5QSSAvIDIgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiB0aGVyZSBpcyBubyBlbmVyZ3ksIHRoZSB0YXJnZXQgc3BlZWQgaXMgMCwgb3RoZXJ3aXNlIGl0IGlzIHRoZSBjdXJyZW50IHNldCBwb2ludFxyXG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5lbmVyZ3lDaHVua3NSZW1haW5pbmdQcm9wZXJ0eS52YWx1ZSA+IDAgPyB0aGlzLnRhcmdldENyYW5rQW5ndWxhclZlbG9jaXR5UHJvcGVydHkudmFsdWUgOiAwO1xyXG5cclxuICAgIC8vIHNwZWVkIHVwIG9yIHNsb3cgZG93biB0aGUgYW5ndWxhciB2ZWxvY2l0eSBvZiB0aGUgY3JhbmtcclxuICAgIGNvbnN0IHByZXZpb3VzQW5ndWxhclZlbG9jaXR5ID0gdGhpcy5jcmFua0FuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIGNvbnN0IGRPbWVnYSA9IHRhcmdldCAtIHRoaXMuY3JhbmtBbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICBpZiAoIGRPbWVnYSAhPT0gMCApIHtcclxuICAgICAgY29uc3QgY2hhbmdlID0gQU5HVUxBUl9BQ0NFTEVSQVRJT04gKiBkdDtcclxuICAgICAgaWYgKCBkT21lZ2EgPiAwICkge1xyXG5cclxuICAgICAgICAvLyBhY2NlbGVyYXRlXHJcbiAgICAgICAgdGhpcy5jcmFua0FuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlID0gTWF0aC5taW4oXHJcbiAgICAgICAgICB0aGlzLmNyYW5rQW5ndWxhclZlbG9jaXR5UHJvcGVydHkudmFsdWUgKyBjaGFuZ2UsXHJcbiAgICAgICAgICB0aGlzLnRhcmdldENyYW5rQW5ndWxhclZlbG9jaXR5UHJvcGVydHkudmFsdWVcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBkZWNlbGVyYXRlXHJcbiAgICAgICAgdGhpcy5jcmFua0FuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlID0gTWF0aC5tYXgoIHRoaXMuY3JhbmtBbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSAtIGNoYW5nZSwgMCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbmV3QW5nbGUgPSAoIHRoaXMuY3JhbmtBbmdsZVByb3BlcnR5LnZhbHVlICsgdGhpcy5jcmFua0FuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlICogZHQgKSAlICggMiAqIE1hdGguUEkgKTtcclxuICAgIHRoaXMuY3JhbmtBbmdsZVByb3BlcnR5LnNldCggbmV3QW5nbGUgKTtcclxuXHJcbiAgICB0aGlzLnJlYXJXaGVlbEFuZ2xlUHJvcGVydHkuc2V0KFxyXG4gICAgICAoIHRoaXMucmVhcldoZWVsQW5nbGVQcm9wZXJ0eS52YWx1ZSArXHJcbiAgICAgICAgdGhpcy5jcmFua0FuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlICogZHQgKiBDUkFOS19UT19SRUFSX1dIRUVMX1JBVElPICkgJSAoIDIgKiBNYXRoLlBJIClcclxuICAgICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLmNyYW5rQW5ndWxhclZlbG9jaXR5UHJvcGVydHkudmFsdWUgPT09IDAgJiYgcHJldmlvdXNBbmd1bGFyVmVsb2NpdHkgIT09IDAgKSB7XHJcblxyXG4gICAgICAvLyBzZXQgY3JhbmsgdG8gYSBnb29kIHBvc2l0aW9uIHdoZXJlIGFuaW1hdGlvbiB3aWxsIHN0YXJ0IHJpZ2h0IGF3YXkgd2hlbiBtb3Rpb24gaXMgcmVzdGFydGVkXHJcbiAgICAgIHRoaXMuc2V0Q3JhbmtUb1BvaXNlZFBvc2l0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZnJhY3Rpb25hbFZlbG9jaXR5ID0gdGhpcy5jcmFua0FuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlIC8gTUFYX0FOR1VMQVJfVkVMT0NJVFlfT0ZfQ1JBTks7XHJcblxyXG4gICAgLy8gZGV0ZXJtaW5lIGhvdyBtdWNoIGVuZXJneSBpcyBwcm9kdWNlZCBpbiB0aGlzIHRpbWUgc3RlcFxyXG4gICAgaWYgKCB0aGlzLnRhcmdldENyYW5rQW5ndWxhclZlbG9jaXR5UHJvcGVydHkudmFsdWUgPiAwICkge1xyXG5cclxuICAgICAgLy8gbGVzcyBlbmVyZ3kgaXMgcHJvZHVjZWQgaWYgbm90IGhvb2tlZCB1cCB0byBnZW5lcmF0b3JcclxuICAgICAgbGV0IG1heEVuZXJneVByb2R1Y3Rpb25SYXRlID0gTUFYX0VORVJHWV9PVVRQVVRfV0hFTl9SVU5OSU5HX0ZSRUU7XHJcbiAgICAgIGlmICggdGhpcy5tZWNoYW5pY2FsUG93ZXJlZFN5c3RlbUlzTmV4dFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIG1heEVuZXJneVByb2R1Y3Rpb25SYXRlID0gTUFYX0VORVJHWV9PVVRQVVRfV0hFTl9DT05ORUNURURfVE9fR0VORVJBVE9SO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuZW5lcmd5UHJvZHVjZWRTaW5jZUxhc3RDaHVua0VtaXR0ZWQgKz0gbWF4RW5lcmd5UHJvZHVjdGlvblJhdGUgKiBmcmFjdGlvbmFsVmVsb2NpdHkgKiBkdDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkZWNpZGUgaWYgbmV3IGNoZW0gZW5lcmd5IGNodW5rIHNob3VsZCBzdGFydCBvbiBpdHMgd2F5XHJcbiAgICBpZiAoIHRoaXMuZW5lcmd5UHJvZHVjZWRTaW5jZUxhc3RDaHVua0VtaXR0ZWQgPj0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LICYmXHJcbiAgICAgICAgIHRoaXMudGFyZ2V0Q3JhbmtBbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSA+IDAgKSB7XHJcblxyXG4gICAgICAvLyBzdGFydCBhIG5ldyBjaHVuayBtb3ZpbmdcclxuICAgICAgY29uc3QgZW5lcmd5Q2h1bmsgPSB0aGlzLmZpbmROb25Nb3ZpbmdFbmVyZ3lDaHVuaygpO1xyXG4gICAgICBpZiAoIGVuZXJneUNodW5rICkge1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtNb3ZlcnMucHVzaCggdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KFxyXG4gICAgICAgICAgZW5lcmd5Q2h1bmssXHJcbiAgICAgICAgICBFbmVyZ3lDaHVua1BhdGhNb3Zlci5jcmVhdGVQYXRoRnJvbU9mZnNldHMoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSwgQ0hFTUlDQUxfRU5FUkdZX0NIVU5LX09GRlNFVFMgKSxcclxuICAgICAgICAgIEVGQUNDb25zdGFudHMuRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIClcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5UHJvZHVjZWRTaW5jZUxhc3RDaHVua0VtaXR0ZWQgPSAwO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgYnkgcmVhZGluZyBob3cgbWFueSBjaHVua3MgcmVtYWluIGluIHRoZSBiaWtlcidzIGJvZHlcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rc1JlbWFpbmluZ1Byb3BlcnR5LnNldCggdGhpcy5lbmVyZ3lDaHVua0xpc3QubGVuZ3RoIC0gdGhpcy5lbmVyZ3lDaHVua01vdmVycy5sZW5ndGggKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubW92ZUVuZXJneUNodW5rcyggZHQgKTtcclxuXHJcbiAgICBjb25zdCBlbmVyZ3lBbW91bnQgPSBNYXRoLmFicyggZnJhY3Rpb25hbFZlbG9jaXR5ICogTUFYX0VORVJHWV9PVVRQVVRfV0hFTl9DT05ORUNURURfVE9fR0VORVJBVE9SICogZHQgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbmVyZ3lBbW91bnQgPj0gMCwgYGVuZXJneUFtb3VudCBpcyAke2VuZXJneUFtb3VudH1gICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBFbmVyZ3koIEVuZXJneVR5cGUuTUVDSEFOSUNBTCwgZW5lcmd5QW1vdW50LCAtTWF0aC5QSSAvIDIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1vdmVzIGVuZXJneSBjaHVua3MgdGhyb3VnaG91dCB0aGUgYmlrZXIgc3lzdGVtIGFuZCBjb252ZXJ0cyB0aGVtIHRvIG90aGVyIGVuZXJneSB0eXBlcyBhcyBuZWVkZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgbW92ZUVuZXJneUNodW5rcyggZHQgKSB7XHJcblxyXG4gICAgLy8gaXRlcmF0ZSB0aHJvdWdoIHRoaXMgY29weSB3aGlsZSB0aGUgb3JpZ2luYWwgaXMgbXV0YXRlZFxyXG4gICAgY29uc3QgbW92ZXJzID0gdGhpcy5lbmVyZ3lDaHVua01vdmVycy5zbGljZSgpO1xyXG5cclxuICAgIG1vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB7XHJcblxyXG4gICAgICBtb3Zlci5tb3ZlQWxvbmdQYXRoKCBkdCApO1xyXG5cclxuICAgICAgaWYgKCAhbW92ZXIucGF0aEZ1bGx5VHJhdmVyc2VkICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgY2h1bmsgPSBtb3Zlci5lbmVyZ3lDaHVuaztcclxuXHJcbiAgICAgIC8vIENIRU1JQ0FMIC0tPiBNRUNIQU5JQ0FMXHJcbiAgICAgIGlmICggY2h1bmsuZW5lcmd5VHlwZVByb3BlcnR5LmdldCgpID09PSBFbmVyZ3lUeXBlLkNIRU1JQ0FMICkge1xyXG5cclxuICAgICAgICAvLyB0dXJuIHRoaXMgaW50byBtZWNoYW5pY2FsIGVuZXJneVxyXG4gICAgICAgIGNodW5rLmVuZXJneVR5cGVQcm9wZXJ0eS5zZXQoIEVuZXJneVR5cGUuTUVDSEFOSUNBTCApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtNb3ZlcnMucmVtb3ZlKCBtb3ZlciApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIgKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIG5ldyBtb3ZlciBmb3IgdGhlIG1lY2hhbmljYWwgZW5lcmd5IGNodW5rXHJcbiAgICAgICAgaWYgKCB0aGlzLm1lY2hhbmljYWxDaHVua3NTaW5jZUxhc3RUaGVybWFsID49IE1FQ0hBTklDQUxfVE9fVEhFUk1BTF9DSFVOS19SQVRJTyB8fFxyXG4gICAgICAgICAgICAgIXRoaXMubWVjaGFuaWNhbFBvd2VyZWRTeXN0ZW1Jc05leHRQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgICAvLyBtYWtlIHRoaXMgY2h1bmsgdHJhdmVsIHRvIHRoZSByZWFyIGh1Yiwgd2hlcmUgaXQgd2lsbCBiZWNvbWUgYSBjaHVuayBvZiB0aGVybWFsIGVuZXJneVxyXG4gICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua01vdmVycy5wdXNoKCB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIGNodW5rLFxyXG4gICAgICAgICAgICBjcmVhdGVNZWNoYW5pY2FsVG9UaGVybWFsRW5lcmd5Q2h1bmtQYXRoKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUsIGNodW5rLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSxcclxuICAgICAgICAgICAgRUZBQ0NvbnN0YW50cy5FTkVSR1lfQ0hVTktfVkVMT0NJVFkgKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHRoaXMubWVjaGFuaWNhbENodW5rc1NpbmNlTGFzdFRoZXJtYWwgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGNvbnN0IG1lY2hhbmljYWxFbmVyZ3lDaHVua09mZnNldHMgPSBbXHJcbiAgICAgICAgICAgIEJJS0VfQ1JBTktfT0ZGU0VULFxyXG4gICAgICAgICAgICBVUFBFUl9DRU5URVJfT0ZfQkFDS19XSEVFTF9PRkZTRVQsXHJcbiAgICAgICAgICAgIFRPUF9UQU5HRU5UX09GX0JBQ0tfV0hFRUxfT0ZGU0VULFxyXG4gICAgICAgICAgICBORVhUX0VORVJHWV9TWVNURU1fT0ZGU0VUXHJcbiAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgIC8vIHNlbmQgdGhpcyBjaHVuayB0byB0aGUgbmV4dCBlbmVyZ3kgc3lzdGVtXHJcbiAgICAgICAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzLnB1c2goIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggY2h1bmssXHJcbiAgICAgICAgICAgIEVuZXJneUNodW5rUGF0aE1vdmVyLmNyZWF0ZVBhdGhGcm9tT2Zmc2V0cyggdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLCBtZWNoYW5pY2FsRW5lcmd5Q2h1bmtPZmZzZXRzICksXHJcbiAgICAgICAgICAgIEVGQUNDb25zdGFudHMuRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIClcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLm1lY2hhbmljYWxDaHVua3NTaW5jZUxhc3RUaGVybWFsKys7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBNRUNIQU5JQ0FMIC0tPiBUSEVSTUFMXHJcbiAgICAgIGVsc2UgaWYgKCBjaHVuay5lbmVyZ3lUeXBlUHJvcGVydHkuZ2V0KCkgPT09IEVuZXJneVR5cGUuTUVDSEFOSUNBTCAmJlxyXG4gICAgICAgICAgICAgICAgY2h1bmsucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5kaXN0YW5jZSggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnBsdXMoIENFTlRFUl9PRl9CQUNLX1dIRUVMX09GRlNFVCApICkgPCAxRS02ICkge1xyXG5cclxuICAgICAgICAvLyB0aGlzIGlzIGEgbWVjaGFuaWNhbCBlbmVyZ3kgY2h1bmsgdGhhdCBoYXMgdHJhdmVsZWQgdG8gdGhlIGh1YiBhbmQgc2hvdWxkIG5vdyBiZWNvbWUgdGhlcm1hbCBlbmVyZ3lcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzLnJlbW92ZSggbW92ZXIgKTtcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuZGlzcG9zZUVsZW1lbnQoIG1vdmVyICk7XHJcblxyXG4gICAgICAgIGNodW5rLmVuZXJneVR5cGVQcm9wZXJ0eS5zZXQoIEVuZXJneVR5cGUuVEhFUk1BTCApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtNb3ZlcnMucHVzaCggdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCBjaHVuayxcclxuICAgICAgICAgIEVuZXJneUNodW5rUGF0aE1vdmVyLmNyZWF0ZVJhZGlhdGVkUGF0aCggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnBsdXMoIENFTlRFUl9PRl9CQUNLX1dIRUVMX09GRlNFVCApLCBNYXRoLlBJICogLTAuMSApLFxyXG4gICAgICAgICAgRUZBQ0NvbnN0YW50cy5FTkVSR1lfQ0hVTktfVkVMT0NJVFkgKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRIRVJNQUxcclxuICAgICAgZWxzZSBpZiAoIGNodW5rLmVuZXJneVR5cGVQcm9wZXJ0eS5nZXQoKSA9PT0gRW5lcmd5VHlwZS5USEVSTUFMICkge1xyXG5cclxuICAgICAgICAvLyB0aGlzIGlzIGEgcmFkaWF0aW5nIHRoZXJtYWwgZW5lcmd5IGNodW5rIHRoYXQgaGFzIHJlYWNoZWQgdGhlIGVuZCBvZiBpdHMgcm91dGUgLSBkZWxldGUgaXRcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzLnJlbW92ZSggbW92ZXIgKTtcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rTGlzdC5yZW1vdmUoIGNodW5rICk7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0dyb3VwLmRpc3Bvc2VFbGVtZW50KCBjaHVuayApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTUVDSEFOSUNBTFxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gbXVzdCBiZSBtZWNoYW5pY2FsIGVuZXJneSB0aGF0IGlzIGJlaW5nIHBhc3NlZCB0byB0aGUgbmV4dCBlbmVyZ3kgc3lzdGVtIGVsZW1lbnRcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rTGlzdC5yZW1vdmUoIGNodW5rICk7XHJcbiAgICAgICAgdGhpcy5vdXRnb2luZ0VuZXJneUNodW5rcy5wdXNoKCBjaHVuayApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtNb3ZlcnMucmVtb3ZlKCBtb3ZlciApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIHByZWxvYWRFbmVyZ3lDaHVua3MoKSB7XHJcblxyXG4gICAgLy8gaWYgd2UncmUgbm90IHN1cHBvc2VkIHRvIGhhdmUgYW55IGNodW5rcywgY2xlYXIgYW55IGV4aXN0aW5nIG9uZXMgb3V0IG9mIHRoZSBiaWtlci4gdGhpcyBpcyBuZWVkZWQgZm9yIHN0YXRlU2V0LFxyXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lbmVyZ3ktZm9ybXMtYW5kLWNoYW5nZXMvaXNzdWVzLzMzNVxyXG4gICAgaWYgKCB0aGlzLmVuZXJneUNodW5rc1JlbWFpbmluZ1Byb3BlcnR5LnZhbHVlID09PSAwICkge1xyXG4gICAgICB0aGlzLmNsZWFyRW5lcmd5Q2h1bmtzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJuIGlmIGJpa2VyIGlzIG5vdCBwZWRhbGluZywgb3IgaXMgb3V0IG9mIGVuZXJneSwgb3IgaXMgbm90IGhvb2tlZCB1cCB0byBhIGNvbXBhdGlibGUgc3lzdGVtXHJcbiAgICBpZiAoIHRoaXMuY3JhbmtBbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSA9PT0gMCB8fFxyXG4gICAgICAgICB0aGlzLmVuZXJneUNodW5rc1JlbWFpbmluZ1Byb3BlcnR5LnZhbHVlID09PSAwIHx8XHJcbiAgICAgICAgICF0aGlzLm1lY2hhbmljYWxQb3dlcmVkU3lzdGVtSXNOZXh0UHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlcGxlbmlzaEJpa2VyRW5lcmd5Q2h1bmtzKCk7XHJcbiAgICBsZXQgcHJlbG9hZENvbXBsZXRlID0gZmFsc2U7XHJcbiAgICBjb25zdCBkdCA9IDEgLyBFRkFDQ29uc3RhbnRzLkZSQU1FU19QRVJfU0VDT05EO1xyXG4gICAgbGV0IGVuZXJneVNpbmNlTGFzdENodW5rID0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LICogMC45OTtcclxuICAgIGNvbnN0IGZyYWN0aW9uYWxWZWxvY2l0eSA9IHRoaXMuY3JhbmtBbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSAvIE1BWF9BTkdVTEFSX1ZFTE9DSVRZX09GX0NSQU5LO1xyXG5cclxuICAgIC8vIFNpbXVsYXRlIGVuZXJneSBjaHVua3MgbW92aW5nIHRocm91Z2ggdGhlIHN5c3RlbS5cclxuICAgIHdoaWxlICggIXByZWxvYWRDb21wbGV0ZSApIHtcclxuXHJcbiAgICAgIGlmICggdGhpcy5vdXRnb2luZ0VuZXJneUNodW5rcy5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgICAvLyBBbiBlbmVyZ3kgY2h1bmsgaGFzIHRyYXZlcnNlZCB0byB0aGUgb3V0cHV0IG9mIHRoaXMgc3lzdGVtLCBjb21wbGV0aW5nIHRoZSBwcmVsb2FkLiBJZiBlbm91Z2ggY2h1bmtzIGFyZVxyXG4gICAgICAgIC8vIGFscmVhZHkgaW4gdGhlIGJpa2VyIHN5c3RlbSwgdGhlbiB3ZSBtYXkgbm90IG5lZWQgdG8gcHJlbG9hZCBhbnksIGVpdGhlciwgc28gY2hlY2sgdGhpcyBjb25kaXRpb24gYmVmb3JlXHJcbiAgICAgICAgLy8gYWRkaW5nIHRoZSBmaXJzdCBwcmUtbG9hZGVkIGNodW5rLlxyXG4gICAgICAgIHByZWxvYWRDb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGVuZXJneVNpbmNlTGFzdENodW5rICs9IE1BWF9FTkVSR1lfT1VUUFVUX1dIRU5fQ09OTkVDVEVEX1RPX0dFTkVSQVRPUiAqIGZyYWN0aW9uYWxWZWxvY2l0eSAqIGR0O1xyXG5cclxuICAgICAgLy8gZGVjaWRlIGlmIG5ldyBjaGVtIGVuZXJneSBjaHVuayBzaG91bGQgc3RhcnQgb24gaXRzIHdheVxyXG4gICAgICBpZiAoIGVuZXJneVNpbmNlTGFzdENodW5rID49IEVGQUNDb25zdGFudHMuRU5FUkdZX1BFUl9DSFVOSyApIHtcclxuXHJcbiAgICAgICAgLy8gd2Uga25vdyB0aGUgYmlrZXIgaXMgbm90IG91dCBvZiBlbmVyZ3ksIHNvIGdldCBvbmUgb2YgdGhlIHJlbWFpbmluZyBjaHVua3NcclxuICAgICAgICBjb25zdCBlbmVyZ3lDaHVuayA9IHRoaXMuZmluZE5vbk1vdmluZ0VuZXJneUNodW5rKCk7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua01vdmVycy5wdXNoKCB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoXHJcbiAgICAgICAgICBlbmVyZ3lDaHVuayxcclxuICAgICAgICAgIEVuZXJneUNodW5rUGF0aE1vdmVyLmNyZWF0ZVBhdGhGcm9tT2Zmc2V0cyggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLCBDSEVNSUNBTF9FTkVSR1lfQ0hVTktfT0ZGU0VUUyApLFxyXG4gICAgICAgICAgRUZBQ0NvbnN0YW50cy5FTkVSR1lfQ0hVTktfVkVMT0NJVFkgKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgZW5lcmd5U2luY2VMYXN0Q2h1bmsgPSAwO1xyXG5cclxuICAgICAgICAvLyBhZGQgYmFjayB3aGF0IHdlIGp1c3QgdG9vayBmcm9tIHRoZSBiaWtlcidzIGVuZXJneSwgc2luY2Ugd2Ugd2FudCB0byBwcmVzZXJ2ZSB0aGUgYmlrZXIncyBlbmVyZ3kgc3RhdGUuXHJcbiAgICAgICAgdGhpcy5hZGRFbmVyZ3lDaHVua1RvQmlrZXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVXBkYXRlIGVuZXJneSBjaHVuayBwb3NpdGlvbnMuXHJcbiAgICAgIHRoaXMubW92ZUVuZXJneUNodW5rcyggZHQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtFbmVyZ3l9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGdldEVuZXJneU91dHB1dFJhdGUoKSB7XHJcbiAgICBjb25zdCBhbW91bnQgPSBNYXRoLmFicyhcclxuICAgICAgdGhpcy5jcmFua0FuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlIC8gTUFYX0FOR1VMQVJfVkVMT0NJVFlfT0ZfQ1JBTksgKiBNQVhfRU5FUkdZX09VVFBVVF9XSEVOX0NPTk5FQ1RFRF9UT19HRU5FUkFUT1JcclxuICAgICk7XHJcbiAgICByZXR1cm4gbmV3IEVuZXJneSggRW5lcmd5VHlwZS5NRUNIQU5JQ0FMLCBhbW91bnQsIC1NYXRoLlBJIC8gMiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBjcmFuayB0byBhIHBvc2l0aW9uIHdoZXJlIGEgdmVyeSBzbWFsbCBhbW91bnQgb2YgbW90aW9uIHdpbGwgY2F1c2UgYSBuZXcgaW1hZ2UgdG8gYmUgY2hvc2VuLiAgVGhpcyBpc1xyXG4gICAqIGdlbmVyYWxseSBkb25lIHdoZW4gdGhlIGJpa2VyIHN0b3BzIHNvIHRoYXQgdGhlIGFuaW1hdGlvbiBzdGFydHMgcmlnaHQgYXdheSB0aGUgbmV4dCB0aW1lIHRoZSBtb3Rpb24gc3RhcnRzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc2V0Q3JhbmtUb1BvaXNlZFBvc2l0aW9uKCkge1xyXG4gICAgY29uc3QgY3VycmVudEluZGV4ID0gdGhpcy5tYXBBbmdsZVRvSW1hZ2VJbmRleCggdGhpcy5jcmFua0FuZ2xlUHJvcGVydHkudmFsdWUgKTtcclxuICAgIGNvbnN0IHJhZGlhbnNQZXJJbWFnZSA9IDIgKiBNYXRoLlBJIC8gTlVNQkVSX09GX0xFR19JTUFHRVM7XHJcbiAgICB0aGlzLmNyYW5rQW5nbGVQcm9wZXJ0eS5zZXQoICggY3VycmVudEluZGV4ICUgTlVNQkVSX09GX0xFR19JTUFHRVMgKiByYWRpYW5zUGVySW1hZ2UgKyAoIHJhZGlhbnNQZXJJbWFnZSAtIDFFLTcgKSApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNyYW5rQW5nbGVQcm9wZXJ0eS52YWx1ZSA+PSAwICYmIHRoaXMuY3JhbmtBbmdsZVByb3BlcnR5LnZhbHVlIDw9IDIgKiBNYXRoLlBJICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgYmlrZXIgaXMgcmVwbGVuaXNoZWQgZWFjaCB0aW1lIHNoZSBpcyByZWFjdGl2YXRlZC4gVGhpcyB3YXMgYSBmYWlybHkgYXJiaXRyYXJ5IGRlY2lzaW9uLCBhbmQgY2FuIGJlIGNoYW5nZWRcclxuICAgKiBpZiBkZXNpcmVkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBhY3RpdmF0ZSgpIHtcclxuICAgIHN1cGVyLmFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLnJlcGxlbmlzaEJpa2VyRW5lcmd5Q2h1bmtzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGVhY3RpdmF0ZSgpIHtcclxuICAgIHN1cGVyLmRlYWN0aXZhdGUoKTtcclxuICAgIHRoaXMudGFyZ2V0Q3JhbmtBbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua3NSZW1haW5pbmdQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5yZWFyV2hlZWxBbmdsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNyYW5rQW5ndWxhclZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSB0aGlzLnRhcmdldENyYW5rQW5ndWxhclZlbG9jaXR5UHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgY2xlYXJFbmVyZ3lDaHVua3MoKSB7XHJcbiAgICBzdXBlci5jbGVhckVuZXJneUNodW5rcygpO1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua01vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuZGlzcG9zZUVsZW1lbnQoIG1vdmVyICkgKTtcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtNb3ZlcnMuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGFkZHMgdGhlIGN1cnJlbnQgbnVtYmVyIG9mIGVuZXJneSBjaHVua3MgcmVtYWluaW5nIHRvIHRoZSBiaWtlclxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NsZWFyRW5lcmd5Q2h1bmtzXSAtIHdoZXRoZXIgdG8gY2xlYXIgdGhlIGV4aXN0aW5nIGNodW5rcyBvdXQgb2YgdGhlIGJpa2VyIGJlZm9yZSBhZGRpbmcgdGhlbVxyXG4gICAqIGJhY2suXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlcGxlbmlzaEJpa2VyRW5lcmd5Q2h1bmtzKCBjbGVhckVuZXJneUNodW5rcyA9IHRydWUgKSB7XHJcbiAgICBjbGVhckVuZXJneUNodW5rcyAmJiB0aGlzLmNsZWFyRW5lcmd5Q2h1bmtzKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmVuZXJneUNodW5rc1JlbWFpbmluZ1Byb3BlcnR5LnZhbHVlOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuYWRkRW5lcmd5Q2h1bmtUb0Jpa2VyKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBhZGQgb25lIGVuZXJneSBjaHVuayB0byBiaWtlclxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGRFbmVyZ3lDaHVua1RvQmlrZXIoKSB7XHJcbiAgICBjb25zdCBub21pbmFsSW5pdGlhbE9mZnNldCA9IG5ldyBWZWN0b3IyKCAwLjAxOSwgMC4wNTUgKTtcclxuICAgIGNvbnN0IGRpc3BsYWNlbWVudCA9IG5ldyBWZWN0b3IyKCAoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgLSAwLjUgKSAqIDAuMDIsIDAgKS5yb3RhdGVkKCBNYXRoLlBJICogMC43ICk7XHJcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBub21pbmFsSW5pdGlhbE9mZnNldCApLnBsdXMoIGRpc3BsYWNlbWVudCApO1xyXG5cclxuICAgIGNvbnN0IG5ld0VuZXJneUNodW5rID0gdGhpcy5lbmVyZ3lDaHVua0dyb3VwLmNyZWF0ZU5leHRFbGVtZW50KFxyXG4gICAgICBFbmVyZ3lUeXBlLkNIRU1JQ0FMLFxyXG4gICAgICBwb3NpdGlvbixcclxuICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmVuZXJneUNodW5rTGlzdC5hZGQoIG5ld0VuZXJneUNodW5rICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBmaW5kIHRoZSBpbWFnZSBpbmRleCBjb3JyZXNwb25kaW5nIHRvIHRoaXMgYW5nbGUgaW4gcmFkaWFuc1xyXG4gICAqIEBwYXJhbSAge251bWJlcn0gYW5nbGVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIGltYWdlIGluZGV4XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG1hcEFuZ2xlVG9JbWFnZUluZGV4KCBhbmdsZSApIHtcclxuICAgIGNvbnN0IGkgPSBNYXRoLmZsb29yKCAoIGFuZ2xlICUgKCAyICogTWF0aC5QSSApICkgLyAoIDIgKiBNYXRoLlBJIC8gTlVNQkVSX09GX0xFR19JTUFHRVMgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaSA+PSAwICYmIGkgPCBOVU1CRVJfT0ZfTEVHX0lNQUdFUyApO1xyXG4gICAgcmV0dXJuIGk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBmaW5kIGEgbm9uLW1vdmluZyBDSEVNSUNBTCBlbmVyZ3kgY2h1bmssIHJldHVybnMgbnVsbCBpZiBub25lIGFyZSBmb3VuZFxyXG4gICAqIEByZXR1cm5zIHtFbmVyZ3lDaHVua31cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGZpbmROb25Nb3ZpbmdFbmVyZ3lDaHVuaygpIHtcclxuICAgIGNvbnN0IG1vdmluZ0VuZXJneUNodW5rcyA9IFtdO1xyXG4gICAgbGV0IG5vbk1vdmluZ0VuZXJneUNodW5rID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzLmZvckVhY2goIG1vdmVyID0+IHtcclxuICAgICAgbW92aW5nRW5lcmd5Q2h1bmtzLnB1c2goIG1vdmVyLmVuZXJneUNodW5rICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QuZm9yRWFjaCggY2h1bmsgPT4ge1xyXG5cclxuICAgICAgLy8gb25seSBpbnRlcmVzdGVkIGluIENIRU1JQ0FMIGVuZXJneSBjaHVua3MgdGhhdCBhcmUgbm90IG1vdmluZ1xyXG4gICAgICBpZiAoIGNodW5rLmVuZXJneVR5cGVQcm9wZXJ0eS52YWx1ZSA9PT0gRW5lcmd5VHlwZS5DSEVNSUNBTCAmJiBtb3ZpbmdFbmVyZ3lDaHVua3MuaW5kZXhPZiggY2h1bmsgKSA9PT0gLTEgKSB7XHJcbiAgICAgICAgbm9uTW92aW5nRW5lcmd5Q2h1bmsgPSBjaHVuaztcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIG5vbk1vdmluZ0VuZXJneUNodW5rO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpYyAoRW5lcmd5U3lzdGVtRWxlbWVudElPKVxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAgICovXHJcbiAgdG9TdGF0ZU9iamVjdCgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVuZXJneVByb2R1Y2VkU2luY2VMYXN0Q2h1bmtFbWl0dGVkOiB0aGlzLmVuZXJneVByb2R1Y2VkU2luY2VMYXN0Q2h1bmtFbWl0dGVkLFxyXG4gICAgICBtZWNoYW5pY2FsQ2h1bmtzU2luY2VMYXN0VGhlcm1hbDogdGhpcy5tZWNoYW5pY2FsQ2h1bmtzU2luY2VMYXN0VGhlcm1hbFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwdWJsaWMgKEVuZXJneVN5c3RlbUVsZW1lbnRJTylcclxuICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGVPYmplY3QgLSBzZWUgdGhpcy50b1N0YXRlT2JqZWN0KClcclxuICAgKi9cclxuICBhcHBseVN0YXRlKCBzdGF0ZU9iamVjdCApIHtcclxuICAgIHRoaXMuZW5lcmd5UHJvZHVjZWRTaW5jZUxhc3RDaHVua0VtaXR0ZWQgPSBzdGF0ZU9iamVjdC5lbmVyZ3lQcm9kdWNlZFNpbmNlTGFzdENodW5rRW1pdHRlZDtcclxuICAgIHRoaXMubWVjaGFuaWNhbENodW5rc1NpbmNlTGFzdFRoZXJtYWwgPSBzdGF0ZU9iamVjdC5tZWNoYW5pY2FsQ2h1bmtzU2luY2VMYXN0VGhlcm1hbDtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBjcmVhdGVzIGEgcGF0aCBmb3IgYW4gZW5lcmd5IGNodW5rIHRoYXQgd2lsbCB0cmF2ZWwgdG8gdGhlIGh1YiBhbmQgdGhlbiBiZWNvbWUgdGhlcm1hbFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtWZWN0b3IyfSBjZW50ZXJQb3NpdGlvblxyXG4gKiBAcGFyYW0gIHtWZWN0b3IyfSBjdXJyZW50UG9zaXRpb25cclxuICogQHJldHVybnMge1ZlY3RvcjJbXX1cclxuICogQHByaXZhdGVcclxuICovXHJcbmNvbnN0IGNyZWF0ZU1lY2hhbmljYWxUb1RoZXJtYWxFbmVyZ3lDaHVua1BhdGggPSAoIGNlbnRlclBvc2l0aW9uLCBjdXJyZW50UG9zaXRpb24gKSA9PiB7XHJcbiAgY29uc3QgcGF0aCA9IFtdO1xyXG4gIGNvbnN0IGNyYW5rUG9zaXRpb24gPSBjZW50ZXJQb3NpdGlvbi5wbHVzKCBCSUtFX0NSQU5LX09GRlNFVCApO1xyXG4gIGlmICggY3VycmVudFBvc2l0aW9uLnkgPiBjcmFua1Bvc2l0aW9uLnkgKSB7XHJcblxyXG4gICAgLy8gb25seSBhZGQgdGhlIGNyYW5rIHBvc2l0aW9uIGlmIHRoZSBjdXJyZW50IHBvc2l0aW9uIGluZGljYXRlcyB0aGF0IHRoZSBjaHVuayBoYXNuJ3QgcmVhY2hlZCB0aGUgY3JhbmsgeWV0XHJcbiAgICBwYXRoLnB1c2goIGNlbnRlclBvc2l0aW9uLnBsdXMoIEJJS0VfQ1JBTktfT0ZGU0VUICkgKTtcclxuICB9XHJcbiAgcGF0aC5wdXNoKCBjZW50ZXJQb3NpdGlvbi5wbHVzKCBDRU5URVJfT0ZfQkFDS19XSEVFTF9PRkZTRVQgKSApO1xyXG4gIHJldHVybiBwYXRoO1xyXG59O1xyXG5cclxuLy8gc3RhdGljc1xyXG5CaWtlci5DRU5URVJfT0ZfR0VBUl9PRkZTRVQgPSBDRU5URVJfT0ZfR0VBUl9PRkZTRVQ7XHJcbkJpa2VyLkNFTlRFUl9PRl9CQUNLX1dIRUVMX09GRlNFVCA9IENFTlRFUl9PRl9CQUNLX1dIRUVMX09GRlNFVDtcclxuQmlrZXIuSU5JVElBTF9OVU1CRVJfT0ZfRU5FUkdZX0NIVU5LUyA9IElOSVRJQUxfTlVNQkVSX09GX0VORVJHWV9DSFVOS1M7XHJcbkJpa2VyLk1BWF9BTkdVTEFSX1ZFTE9DSVRZX09GX0NSQU5LID0gTUFYX0FOR1VMQVJfVkVMT0NJVFlfT0ZfQ1JBTks7XHJcbkJpa2VyLk5VTUJFUl9PRl9MRUdfSU1BR0VTID0gTlVNQkVSX09GX0xFR19JTUFHRVM7XHJcbkJpa2VyLlJFQVJfV0hFRUxfUkFESVVTID0gUkVBUl9XSEVFTF9SQURJVVM7XHJcblxyXG5lbmVyZ3lGb3Jtc0FuZENoYW5nZXMucmVnaXN0ZXIoICdCaWtlcicsIEJpa2VyICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJpa2VyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0MsS0FBSyxRQUFRLG1DQUFtQztBQUN6RCxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLG9DQUFvQztBQUNoRSxPQUFPQyxhQUFhLE1BQU0sK0JBQStCO0FBQ3pELE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBQ2xFLE9BQU9DLDRCQUE0QixNQUFNLHVDQUF1QztBQUNoRixPQUFPQyxNQUFNLE1BQU0sYUFBYTtBQUNoQyxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjs7QUFFNUM7QUFDQSxNQUFNQyw2QkFBNkIsR0FBRyxDQUFDLEdBQUdDLElBQUksQ0FBQ0MsRUFBRSxDQUFDLENBQUM7QUFDbkQsTUFBTUMsb0JB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