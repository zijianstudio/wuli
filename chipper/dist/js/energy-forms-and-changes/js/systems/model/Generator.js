// Copyright 2016-2022, University of Colorado Boulder

/**
 * a type that models an electrical generator in an energy system
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import generatorIcon_png from '../../../images/generatorIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyType from '../../common/model/EnergyType.js';
import EnergyChunkNode from '../../common/view/EnergyChunkNode.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Energy from './Energy.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergyConverter from './EnergyConverter.js';

// constants

// attributes of the wheel and generator
const WHEEL_MOMENT_OF_INERTIA = 5; // In kg.
const RESISTANCE_CONSTANT = 3; // Controls max speed and rate of slow down, empirically determined.
const MAX_ROTATIONAL_VELOCITY = Math.PI / 2; // In radians/sec, empirically determined.
const WHEEL_RADIUS = 0.039; // half the width of the wheel image, need this precision for proper visual
const WHEEL_CENTER_OFFSET = new Vector2(0, 0.03);
const LEFT_SIDE_OF_WHEEL_OFFSET = new Vector2(-0.03, 0.03);

// offsets used to create the paths followed by the energy chunks
const START_OF_WIRE_CURVE_OFFSET = WHEEL_CENTER_OFFSET.plusXY(0.011, -0.050);
const WIRE_CURVE_POINT_1_OFFSET = WHEEL_CENTER_OFFSET.plusXY(0.012, -0.055);
const WIRE_CURVE_POINT_2_OFFSET = WHEEL_CENTER_OFFSET.plusXY(0.015, -0.061);
const WIRE_CURVE_POINT_3_OFFSET = WHEEL_CENTER_OFFSET.plusXY(0.021, -0.066);
const WIRE_CURVE_POINT_4_OFFSET = WHEEL_CENTER_OFFSET.plusXY(0.024, -0.068);
const WIRE_CURVE_POINT_5_OFFSET = WHEEL_CENTER_OFFSET.plusXY(0.030, -0.0705);
const CENTER_OF_CONNECTOR_OFFSET = WHEEL_CENTER_OFFSET.plusXY(0.057, -0.071);
class Generator extends EnergyConverter {
  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Object} [options]
   */
  constructor(energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, options) {
    options = merge({
      tandem: Tandem.REQUIRED,
      phetioState: false // no internal fields to convey in state
    }, options);
    super(new Image(generatorIcon_png), options);

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.electricalGenerator;

    // @private {BooleanProperty}
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;

    // @public (read-only) {NumberProperty}
    this.wheelRotationalAngleProperty = new NumberProperty(0, {
      range: new Range(0, 2 * Math.PI),
      units: 'radians',
      tandem: options.tandem.createTandem('wheelRotationalAngleProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the angle of the wheel'
    });

    // @public {BooleanProperty}
    this.directCouplingModeProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('directCouplingModeProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'whether the wheel is in "direct coupling mode", meaning the generator wheel turns at a ' + 'rate that is directly proportional to the incoming energy, with no rotational inertia. ' + 'true when the generator is paired with the biker.'
    });

    // @private
    this.wheelRotationalVelocityProperty = new NumberProperty(0, {
      units: 'radians/s',
      tandem: options.tandem.createTandem('wheelRotationalVelocityProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the angular velocity of the wheel'
    });
    this.energyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('energyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });

    // @public (read-only) {ObservableArrayDef.<EnergyChunk} - The electrical energy chunks are kept on a separate list to
    // support placing them on a different layer in the view.
    this.electricalEnergyChunks = createObservableArray({
      tandem: options.tandem.createTandem('electricalEnergyChunks'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunk.EnergyChunkIO))
    });

    // // @public (read-only) {ObservableArrayDef.<EnergyChunk} - the "hidden" energy chunks are kept on a separate list
    // mainly for code clarity
    this.hiddenEnergyChunks = createObservableArray({
      tandem: options.tandem.createTandem('hiddenEnergyChunks'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunk.EnergyChunkIO))
    });
  }

  /**
   * Factored from this.step
   * @param {number} dt time step in seconds
   * @param {Energy} incomingEnergy
   * @private
   */
  spinGeneratorWheel(dt, incomingEnergy) {
    if (!this.activeProperty.value) {
      return;
    }

    // positive is counter clockwise
    const sign = Math.sin(incomingEnergy.direction) > 0 ? -1 : 1;

    // handle different wheel rotation modes
    if (this.directCouplingModeProperty.value) {
      // treat the wheel as though it is directly coupled to the energy source, e.g. through a belt or drive shaft
      if (incomingEnergy.type === EnergyType.MECHANICAL) {
        const energyFraction = incomingEnergy.amount / dt / EFACConstants.MAX_ENERGY_PRODUCTION_RATE;
        this.wheelRotationalVelocityProperty.value = energyFraction * MAX_ROTATIONAL_VELOCITY * sign;
        this.wheelRotationalAngleProperty.set(calculateWheelAngle(this.wheelRotationalAngleProperty.value, this.wheelRotationalVelocityProperty.value, dt));
      }
    } else {
      // treat the wheel like it is being moved from an external energy, such as water, and has inertia
      let torqueFromIncomingEnergy = 0;

      // empirically determined to reach max energy after a second or two
      const energyToTorqueConstant = 0.5;
      if (incomingEnergy.type === EnergyType.MECHANICAL) {
        torqueFromIncomingEnergy = incomingEnergy.amount * WHEEL_RADIUS * energyToTorqueConstant * sign;
      }
      const torqueFromResistance = -this.wheelRotationalVelocityProperty.value * RESISTANCE_CONSTANT;
      const angularAcceleration = (torqueFromIncomingEnergy + torqueFromResistance) / WHEEL_MOMENT_OF_INERTIA;
      const newAngularVelocity = this.wheelRotationalVelocityProperty.value + angularAcceleration * dt;
      this.wheelRotationalVelocityProperty.value = Utils.clamp(newAngularVelocity, -MAX_ROTATIONAL_VELOCITY, MAX_ROTATIONAL_VELOCITY);
      if (Math.abs(this.wheelRotationalVelocityProperty.value) < 1E-3) {
        // prevent the wheel from moving forever
        this.wheelRotationalVelocityProperty.value = 0;
      }
      this.wheelRotationalAngleProperty.set(calculateWheelAngle(this.wheelRotationalAngleProperty.value, this.wheelRotationalVelocityProperty.value, dt));
    }
  }

  /**
   * step this model element in time
   * @param {number} dt time step
   * @param {Energy} incomingEnergy
   * @returns {Energy}
   * @public
   */
  step(dt, incomingEnergy) {
    if (this.activeProperty.value) {
      this.spinGeneratorWheel(dt, incomingEnergy);

      // handle any incoming energy chunks
      if (this.incomingEnergyChunks.length > 0) {
        this.incomingEnergyChunks.forEach(chunk => {
          // validate energy type
          assert && assert(chunk.energyTypeProperty.get() === EnergyType.MECHANICAL, `EnergyType of incoming chunk expected to be of type MECHANICAL, but has type ${chunk.energyTypeProperty.get()}`);

          // transfer chunk from incoming list to current list
          this.energyChunkList.push(chunk);

          // add a "mover" that will move this energy chunk to the center of the wheel
          this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(chunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.value, [WHEEL_CENTER_OFFSET]), EFACConstants.ENERGY_CHUNK_VELOCITY));
        });
        this.incomingEnergyChunks.clear();
      }

      // move the energy chunks and update their state
      this.updateEnergyChunkPositions(dt);
    } // this.active

    // produce the appropriate amount of energy
    const speedFraction = this.wheelRotationalVelocityProperty.value / MAX_ROTATIONAL_VELOCITY;
    const energy = Math.abs(speedFraction * EFACConstants.MAX_ENERGY_PRODUCTION_RATE) * dt;
    return new Energy(EnergyType.ELECTRICAL, energy, 0);
  }

  /**
   * @param {number} dt - time step, in seconds
   * @returns {Energy}
   * @private
   */
  updateEnergyChunkPositions(dt) {
    const chunkMovers = this.energyChunkMovers.slice();
    chunkMovers.forEach(mover => {
      mover.moveAlongPath(dt);
      if (!mover.pathFullyTraversed) {
        return;
      }
      const chunk = mover.energyChunk;
      switch (chunk.energyTypeProperty.get()) {
        case EnergyType.MECHANICAL:
          {
            const electricalEnergyChunkOffsets = [START_OF_WIRE_CURVE_OFFSET, WIRE_CURVE_POINT_1_OFFSET, WIRE_CURVE_POINT_2_OFFSET, WIRE_CURVE_POINT_3_OFFSET, WIRE_CURVE_POINT_4_OFFSET, WIRE_CURVE_POINT_5_OFFSET, CENTER_OF_CONNECTOR_OFFSET];

            // This mechanical energy chunk has traveled to the end of its path, so change it to electrical and send it
            // on its way.  Also add a "hidden" chunk so that the movement through the generator can be seen by the
            // user.
            this.energyChunkList.remove(chunk);
            this.energyChunkMovers.remove(mover);
            chunk.energyTypeProperty.set(EnergyType.ELECTRICAL);
            this.electricalEnergyChunks.push(chunk);
            this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(mover.energyChunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.value, electricalEnergyChunkOffsets), EFACConstants.ENERGY_CHUNK_VELOCITY));
            const hiddenChunk = this.energyChunkGroup.createNextElement(EnergyType.HIDDEN, chunk.positionProperty.get(), Vector2.ZERO, this.energyChunksVisibleProperty);
            hiddenChunk.zPositionProperty.set(-EnergyChunkNode.Z_DISTANCE_WHERE_FULLY_FADED / 2);
            this.hiddenEnergyChunks.push(hiddenChunk);
            const hiddenEnergyChunkOffsets = [START_OF_WIRE_CURVE_OFFSET, WIRE_CURVE_POINT_1_OFFSET];
            this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(hiddenChunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.value, hiddenEnergyChunkOffsets), EFACConstants.ENERGY_CHUNK_VELOCITY));
            this.energyChunkPathMoverGroup.disposeElement(mover);
            break;
          }
        case EnergyType.ELECTRICAL:
          // This electrical energy chunk has traveled to the end of its path, so transfer it to the next energy
          // system.
          this.energyChunkMovers.remove(mover);
          this.electricalEnergyChunks.remove(chunk);
          this.outgoingEnergyChunks.push(chunk);
          this.energyChunkPathMoverGroup.disposeElement(mover);
          break;
        case EnergyType.HIDDEN:
          // This hidden energy chunk has traveled to the end of its path, so just remove it, because the electrical
          // energy chunk to which is corresponds should now be visible to the user.
          this.hiddenEnergyChunks.remove(chunk);
          this.energyChunkMovers.remove(mover);
          this.energyChunkGroup.disposeElement(chunk);
          this.energyChunkPathMoverGroup.disposeElement(mover);
          break;
        default:
          assert && assert(false, 'Unrecognized EnergyType: ', chunk.energyTypeProperty.get());
      }
    });
  }

  /**
   * @param {Energy} incomingEnergy
   * @public
   * @override
   */
  preloadEnergyChunks(incomingEnergy) {
    // in most system elements, we clear energy chunks before checking if incomingEnergy.amount === 0, but since the
    // generator wheel has rotational inertia, we leave the remaining chunks on their way, which looks more accurate.
    if (incomingEnergy.amount === 0 || incomingEnergy.type !== EnergyType.MECHANICAL) {
      // no energy chunk pre-loading needed
      return;
    }
    this.clearEnergyChunks();
    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;
    let preloadComplete = false;

    // skip every other visual chunk to match the usual rate of chunks flowing through the generator. this is needed
    // because there is visual energy chunk loss (e.g. every other chunks from the faucet comes into the generator,
    // but the actual incoming energy is constant so that the generator wheel spins at a constant speed). so, since
    // more energy is being converted than visually shown, we need to stay consistent with that practice here and only
    // preload chunks for half as much energy that is incoming
    let skipThisChunk = true;

    // simulate energy chunks moving through the system
    while (!preloadComplete) {
      energySinceLastChunk += incomingEnergy.amount * dt;

      // determine if time to add a new chunk
      if (energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK && !skipThisChunk) {
        const newChunk = this.energyChunkGroup.createNextElement(EnergyType.MECHANICAL, this.positionProperty.value.plus(LEFT_SIDE_OF_WHEEL_OFFSET), Vector2.ZERO, this.energyChunksVisibleProperty);
        this.energyChunkList.push(newChunk);

        // add a 'mover' for this energy chunk
        this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(newChunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.value, [WHEEL_CENTER_OFFSET]), EFACConstants.ENERGY_CHUNK_VELOCITY));

        // update energy since last chunk
        energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        skipThisChunk = true;
      } else if (energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK) {
        energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        skipThisChunk = false;
      }
      this.updateEnergyChunkPositions(dt);
      if (this.outgoingEnergyChunks.length > 0) {
        // an energy chunk has made it all the way through the system
        preloadComplete = true;
      }
    }
  }

  /**
   * @returns {Energy}
   * @public
   * @override
   */
  getEnergyOutputRate() {
    const speedFraction = this.wheelRotationalVelocityProperty.value / MAX_ROTATIONAL_VELOCITY;
    const energy = Math.abs(speedFraction * EFACConstants.MAX_ENERGY_PRODUCTION_RATE);
    return new Energy(EnergyType.ELECTRICAL, energy, 0);
  }

  /**
   * deactivate the generator
   * @public
   * @override
   */
  deactivate() {
    super.deactivate();
    this.wheelRotationalVelocityProperty.reset();
    this.wheelRotationalAngleProperty.reset();
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.electricalEnergyChunks.forEach(chunk => this.energyChunkGroup.disposeElement(chunk));
    this.electricalEnergyChunks.clear();
    this.hiddenEnergyChunks.forEach(chunk => this.energyChunkGroup.disposeElement(chunk));
    this.hiddenEnergyChunks.clear();
    this.energyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.energyChunkMovers.clear();
  }

  /**
   * @public
   * @override
   */
  extractOutgoingEnergyChunks() {
    const chunks = this.outgoingEnergyChunks.slice();
    const chunksToRemove = chunks.filter(energyChunk => this.electricalEnergyChunks.includes(energyChunk));

    // Remove outgoing chunks from electrical energy chunks list
    this.electricalEnergyChunks.removeAll(chunksToRemove);
    this.outgoingEnergyChunks.clear();
    return chunks;
  }
}

/**
 * calculates the angle of the wheel for the current time step. this supports both positive and negative velocity, so
 * that regardless of which direction the wheel is spinning, its angle values are constrained between 0 and 2pi.
 *
 * @param wheelRotationalAngle
 * @param wheelRotationalVelocity
 * @param dt
 * @returns {number}
 */
const calculateWheelAngle = (wheelRotationalAngle, wheelRotationalVelocity, dt) => {
  const twoPi = 2 * Math.PI;
  const newAngle = (wheelRotationalAngle + wheelRotationalVelocity * dt) % twoPi;
  return newAngle < 0 ? twoPi + newAngle : newAngle;
};

// statics
Generator.WHEEL_CENTER_OFFSET = WHEEL_CENTER_OFFSET;
Generator.WHEEL_RADIUS = WHEEL_RADIUS;
energyFormsAndChanges.register('Generator', Generator);
export default Generator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwibWVyZ2UiLCJJbWFnZSIsIlRhbmRlbSIsIlJlZmVyZW5jZUlPIiwiZ2VuZXJhdG9ySWNvbl9wbmciLCJFRkFDQ29uc3RhbnRzIiwiRW5lcmd5Q2h1bmsiLCJFbmVyZ3lUeXBlIiwiRW5lcmd5Q2h1bmtOb2RlIiwiZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIiwiRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncyIsIkVuZXJneSIsIkVuZXJneUNodW5rUGF0aE1vdmVyIiwiRW5lcmd5Q29udmVydGVyIiwiV0hFRUxfTU9NRU5UX09GX0lORVJUSUEiLCJSRVNJU1RBTkNFX0NPTlNUQU5UIiwiTUFYX1JPVEFUSU9OQUxfVkVMT0NJVFkiLCJNYXRoIiwiUEkiLCJXSEVFTF9SQURJVVMiLCJXSEVFTF9DRU5URVJfT0ZGU0VUIiwiTEVGVF9TSURFX09GX1dIRUVMX09GRlNFVCIsIlNUQVJUX09GX1dJUkVfQ1VSVkVfT0ZGU0VUIiwicGx1c1hZIiwiV0lSRV9DVVJWRV9QT0lOVF8xX09GRlNFVCIsIldJUkVfQ1VSVkVfUE9JTlRfMl9PRkZTRVQiLCJXSVJFX0NVUlZFX1BPSU5UXzNfT0ZGU0VUIiwiV0lSRV9DVVJWRV9QT0lOVF80X09GRlNFVCIsIldJUkVfQ1VSVkVfUE9JTlRfNV9PRkZTRVQiLCJDRU5URVJfT0ZfQ09OTkVDVE9SX09GRlNFVCIsIkdlbmVyYXRvciIsImNvbnN0cnVjdG9yIiwiZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5IiwiZW5lcmd5Q2h1bmtHcm91cCIsImVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAiLCJvcHRpb25zIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwaGV0aW9TdGF0ZSIsImExMXlOYW1lIiwiYTExeSIsImVsZWN0cmljYWxHZW5lcmF0b3IiLCJ3aGVlbFJvdGF0aW9uYWxBbmdsZVByb3BlcnR5IiwicmFuZ2UiLCJ1bml0cyIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvSGlnaEZyZXF1ZW5jeSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJkaXJlY3RDb3VwbGluZ01vZGVQcm9wZXJ0eSIsIndoZWVsUm90YXRpb25hbFZlbG9jaXR5UHJvcGVydHkiLCJlbmVyZ3lDaHVua01vdmVycyIsInBoZXRpb1R5cGUiLCJPYnNlcnZhYmxlQXJyYXlJTyIsIkVuZXJneUNodW5rUGF0aE1vdmVySU8iLCJlbGVjdHJpY2FsRW5lcmd5Q2h1bmtzIiwiRW5lcmd5Q2h1bmtJTyIsImhpZGRlbkVuZXJneUNodW5rcyIsInNwaW5HZW5lcmF0b3JXaGVlbCIsImR0IiwiaW5jb21pbmdFbmVyZ3kiLCJhY3RpdmVQcm9wZXJ0eSIsInZhbHVlIiwic2lnbiIsInNpbiIsImRpcmVjdGlvbiIsInR5cGUiLCJNRUNIQU5JQ0FMIiwiZW5lcmd5RnJhY3Rpb24iLCJhbW91bnQiLCJNQVhfRU5FUkdZX1BST0RVQ1RJT05fUkFURSIsInNldCIsImNhbGN1bGF0ZVdoZWVsQW5nbGUiLCJ0b3JxdWVGcm9tSW5jb21pbmdFbmVyZ3kiLCJlbmVyZ3lUb1RvcnF1ZUNvbnN0YW50IiwidG9ycXVlRnJvbVJlc2lzdGFuY2UiLCJhbmd1bGFyQWNjZWxlcmF0aW9uIiwibmV3QW5ndWxhclZlbG9jaXR5IiwiY2xhbXAiLCJhYnMiLCJzdGVwIiwiaW5jb21pbmdFbmVyZ3lDaHVua3MiLCJsZW5ndGgiLCJmb3JFYWNoIiwiY2h1bmsiLCJhc3NlcnQiLCJlbmVyZ3lUeXBlUHJvcGVydHkiLCJnZXQiLCJlbmVyZ3lDaHVua0xpc3QiLCJwdXNoIiwiY3JlYXRlTmV4dEVsZW1lbnQiLCJjcmVhdGVQYXRoRnJvbU9mZnNldHMiLCJwb3NpdGlvblByb3BlcnR5IiwiRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIiwiY2xlYXIiLCJ1cGRhdGVFbmVyZ3lDaHVua1Bvc2l0aW9ucyIsInNwZWVkRnJhY3Rpb24iLCJlbmVyZ3kiLCJFTEVDVFJJQ0FMIiwiY2h1bmtNb3ZlcnMiLCJzbGljZSIsIm1vdmVyIiwibW92ZUFsb25nUGF0aCIsInBhdGhGdWxseVRyYXZlcnNlZCIsImVuZXJneUNodW5rIiwiZWxlY3RyaWNhbEVuZXJneUNodW5rT2Zmc2V0cyIsInJlbW92ZSIsImhpZGRlbkNodW5rIiwiSElEREVOIiwiWkVSTyIsInpQb3NpdGlvblByb3BlcnR5IiwiWl9ESVNUQU5DRV9XSEVSRV9GVUxMWV9GQURFRCIsImhpZGRlbkVuZXJneUNodW5rT2Zmc2V0cyIsImRpc3Bvc2VFbGVtZW50Iiwib3V0Z29pbmdFbmVyZ3lDaHVua3MiLCJwcmVsb2FkRW5lcmd5Q2h1bmtzIiwiY2xlYXJFbmVyZ3lDaHVua3MiLCJGUkFNRVNfUEVSX1NFQ09ORCIsImVuZXJneVNpbmNlTGFzdENodW5rIiwiRU5FUkdZX1BFUl9DSFVOSyIsInByZWxvYWRDb21wbGV0ZSIsInNraXBUaGlzQ2h1bmsiLCJuZXdDaHVuayIsInBsdXMiLCJnZXRFbmVyZ3lPdXRwdXRSYXRlIiwiZGVhY3RpdmF0ZSIsInJlc2V0IiwiZXh0cmFjdE91dGdvaW5nRW5lcmd5Q2h1bmtzIiwiY2h1bmtzIiwiY2h1bmtzVG9SZW1vdmUiLCJmaWx0ZXIiLCJpbmNsdWRlcyIsInJlbW92ZUFsbCIsIndoZWVsUm90YXRpb25hbEFuZ2xlIiwid2hlZWxSb3RhdGlvbmFsVmVsb2NpdHkiLCJ0d29QaSIsIm5ld0FuZ2xlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHZW5lcmF0b3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogYSB0eXBlIHRoYXQgbW9kZWxzIGFuIGVsZWN0cmljYWwgZ2VuZXJhdG9yIGluIGFuIGVuZXJneSBzeXN0ZW1cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFJlZmVyZW5jZUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9SZWZlcmVuY2VJTy5qcyc7XHJcbmltcG9ydCBnZW5lcmF0b3JJY29uX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvZ2VuZXJhdG9ySWNvbl9wbmcuanMnO1xyXG5pbXBvcnQgRUZBQ0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRUZBQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDaHVuayBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRW5lcmd5Q2h1bmsuanMnO1xyXG5pbXBvcnQgRW5lcmd5VHlwZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRW5lcmd5VHlwZS5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDaHVua05vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRW5lcmd5Q2h1bmtOb2RlLmpzJztcclxuaW1wb3J0IGVuZXJneUZvcm1zQW5kQ2hhbmdlcyBmcm9tICcuLi8uLi9lbmVyZ3lGb3Jtc0FuZENoYW5nZXMuanMnO1xyXG5pbXBvcnQgRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncyBmcm9tICcuLi8uLi9FbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IEVuZXJneSBmcm9tICcuL0VuZXJneS5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDaHVua1BhdGhNb3ZlciBmcm9tICcuL0VuZXJneUNodW5rUGF0aE1vdmVyLmpzJztcclxuaW1wb3J0IEVuZXJneUNvbnZlcnRlciBmcm9tICcuL0VuZXJneUNvbnZlcnRlci5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuXHJcbi8vIGF0dHJpYnV0ZXMgb2YgdGhlIHdoZWVsIGFuZCBnZW5lcmF0b3JcclxuY29uc3QgV0hFRUxfTU9NRU5UX09GX0lORVJUSUEgPSA1OyAvLyBJbiBrZy5cclxuY29uc3QgUkVTSVNUQU5DRV9DT05TVEFOVCA9IDM7IC8vIENvbnRyb2xzIG1heCBzcGVlZCBhbmQgcmF0ZSBvZiBzbG93IGRvd24sIGVtcGlyaWNhbGx5IGRldGVybWluZWQuXHJcbmNvbnN0IE1BWF9ST1RBVElPTkFMX1ZFTE9DSVRZID0gTWF0aC5QSSAvIDI7IC8vIEluIHJhZGlhbnMvc2VjLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkLlxyXG5jb25zdCBXSEVFTF9SQURJVVMgPSAwLjAzOTsgLy8gaGFsZiB0aGUgd2lkdGggb2YgdGhlIHdoZWVsIGltYWdlLCBuZWVkIHRoaXMgcHJlY2lzaW9uIGZvciBwcm9wZXIgdmlzdWFsXHJcbmNvbnN0IFdIRUVMX0NFTlRFUl9PRkZTRVQgPSBuZXcgVmVjdG9yMiggMCwgMC4wMyApO1xyXG5jb25zdCBMRUZUX1NJREVfT0ZfV0hFRUxfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIC0wLjAzLCAwLjAzICk7XHJcblxyXG4vLyBvZmZzZXRzIHVzZWQgdG8gY3JlYXRlIHRoZSBwYXRocyBmb2xsb3dlZCBieSB0aGUgZW5lcmd5IGNodW5rc1xyXG5jb25zdCBTVEFSVF9PRl9XSVJFX0NVUlZFX09GRlNFVCA9IFdIRUVMX0NFTlRFUl9PRkZTRVQucGx1c1hZKCAwLjAxMSwgLTAuMDUwICk7XHJcbmNvbnN0IFdJUkVfQ1VSVkVfUE9JTlRfMV9PRkZTRVQgPSBXSEVFTF9DRU5URVJfT0ZGU0VULnBsdXNYWSggMC4wMTIsIC0wLjA1NSApO1xyXG5jb25zdCBXSVJFX0NVUlZFX1BPSU5UXzJfT0ZGU0VUID0gV0hFRUxfQ0VOVEVSX09GRlNFVC5wbHVzWFkoIDAuMDE1LCAtMC4wNjEgKTtcclxuY29uc3QgV0lSRV9DVVJWRV9QT0lOVF8zX09GRlNFVCA9IFdIRUVMX0NFTlRFUl9PRkZTRVQucGx1c1hZKCAwLjAyMSwgLTAuMDY2ICk7XHJcbmNvbnN0IFdJUkVfQ1VSVkVfUE9JTlRfNF9PRkZTRVQgPSBXSEVFTF9DRU5URVJfT0ZGU0VULnBsdXNYWSggMC4wMjQsIC0wLjA2OCApO1xyXG5jb25zdCBXSVJFX0NVUlZFX1BPSU5UXzVfT0ZGU0VUID0gV0hFRUxfQ0VOVEVSX09GRlNFVC5wbHVzWFkoIDAuMDMwLCAtMC4wNzA1ICk7XHJcbmNvbnN0IENFTlRFUl9PRl9DT05ORUNUT1JfT0ZGU0VUID0gV0hFRUxfQ0VOVEVSX09GRlNFVC5wbHVzWFkoIDAuMDU3LCAtMC4wNzEgKTtcclxuXHJcbmNsYXNzIEdlbmVyYXRvciBleHRlbmRzIEVuZXJneUNvbnZlcnRlciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge0VuZXJneUNodW5rR3JvdXB9IGVuZXJneUNodW5rR3JvdXBcclxuICAgKiBAcGFyYW0ge0VuZXJneUNodW5rUGF0aE1vdmVyR3JvdXB9IGVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXBcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSwgZW5lcmd5Q2h1bmtHcm91cCwgZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCwgb3B0aW9ucyApIHtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlIC8vIG5vIGludGVybmFsIGZpZWxkcyB0byBjb252ZXkgaW4gc3RhdGVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggbmV3IEltYWdlKCBnZW5lcmF0b3JJY29uX3BuZyApLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7c3RyaW5nfSAtIGExMXkgbmFtZVxyXG4gICAgdGhpcy5hMTF5TmFtZSA9IEVuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MuYTExeS5lbGVjdHJpY2FsR2VuZXJhdG9yO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtCb29sZWFuUHJvcGVydHl9XHJcbiAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSA9IGVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eTtcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cCA9IGVuZXJneUNodW5rR3JvdXA7XHJcbiAgICB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAgPSBlbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge051bWJlclByb3BlcnR5fVxyXG4gICAgdGhpcy53aGVlbFJvdGF0aW9uYWxBbmdsZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDIgKiBNYXRoLlBJICksXHJcbiAgICAgIHVuaXRzOiAncmFkaWFucycsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnd2hlZWxSb3RhdGlvbmFsQW5nbGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgYW5nbGUgb2YgdGhlIHdoZWVsJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Jvb2xlYW5Qcm9wZXJ0eX1cclxuICAgIHRoaXMuZGlyZWN0Q291cGxpbmdNb2RlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RpcmVjdENvdXBsaW5nTW9kZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doZXRoZXIgdGhlIHdoZWVsIGlzIGluIFwiZGlyZWN0IGNvdXBsaW5nIG1vZGVcIiwgbWVhbmluZyB0aGUgZ2VuZXJhdG9yIHdoZWVsIHR1cm5zIGF0IGEgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdyYXRlIHRoYXQgaXMgZGlyZWN0bHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBpbmNvbWluZyBlbmVyZ3ksIHdpdGggbm8gcm90YXRpb25hbCBpbmVydGlhLiAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RydWUgd2hlbiB0aGUgZ2VuZXJhdG9yIGlzIHBhaXJlZCB3aXRoIHRoZSBiaWtlci4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMud2hlZWxSb3RhdGlvbmFsVmVsb2NpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB1bml0czogJ3JhZGlhbnMvcycsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnd2hlZWxSb3RhdGlvbmFsVmVsb2NpdHlQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgYW5ndWxhciB2ZWxvY2l0eSBvZiB0aGUgd2hlZWwnXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5Q2h1bmtNb3ZlcnMnICksXHJcbiAgICAgIHBoZXRpb1R5cGU6IGNyZWF0ZU9ic2VydmFibGVBcnJheS5PYnNlcnZhYmxlQXJyYXlJTyggUmVmZXJlbmNlSU8oIEVuZXJneUNodW5rUGF0aE1vdmVyLkVuZXJneUNodW5rUGF0aE1vdmVySU8gKSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7T2JzZXJ2YWJsZUFycmF5RGVmLjxFbmVyZ3lDaHVua30gLSBUaGUgZWxlY3RyaWNhbCBlbmVyZ3kgY2h1bmtzIGFyZSBrZXB0IG9uIGEgc2VwYXJhdGUgbGlzdCB0b1xyXG4gICAgLy8gc3VwcG9ydCBwbGFjaW5nIHRoZW0gb24gYSBkaWZmZXJlbnQgbGF5ZXIgaW4gdGhlIHZpZXcuXHJcbiAgICB0aGlzLmVsZWN0cmljYWxFbmVyZ3lDaHVua3MgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJpY2FsRW5lcmd5Q2h1bmtzJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5SU8oIFJlZmVyZW5jZUlPKCBFbmVyZ3lDaHVuay5FbmVyZ3lDaHVua0lPICkgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge09ic2VydmFibGVBcnJheURlZi48RW5lcmd5Q2h1bmt9IC0gdGhlIFwiaGlkZGVuXCIgZW5lcmd5IGNodW5rcyBhcmUga2VwdCBvbiBhIHNlcGFyYXRlIGxpc3RcclxuICAgIC8vIG1haW5seSBmb3IgY29kZSBjbGFyaXR5XHJcbiAgICB0aGlzLmhpZGRlbkVuZXJneUNodW5rcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2hpZGRlbkVuZXJneUNodW5rcycgKSxcclxuICAgICAgcGhldGlvVHlwZTogY3JlYXRlT2JzZXJ2YWJsZUFycmF5Lk9ic2VydmFibGVBcnJheUlPKCBSZWZlcmVuY2VJTyggRW5lcmd5Q2h1bmsuRW5lcmd5Q2h1bmtJTyApIClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZhY3RvcmVkIGZyb20gdGhpcy5zdGVwXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IHRpbWUgc3RlcCBpbiBzZWNvbmRzXHJcbiAgICogQHBhcmFtIHtFbmVyZ3l9IGluY29taW5nRW5lcmd5XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzcGluR2VuZXJhdG9yV2hlZWwoIGR0LCBpbmNvbWluZ0VuZXJneSApIHtcclxuICAgIGlmICggIXRoaXMuYWN0aXZlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBwb3NpdGl2ZSBpcyBjb3VudGVyIGNsb2Nrd2lzZVxyXG4gICAgY29uc3Qgc2lnbiA9IE1hdGguc2luKCBpbmNvbWluZ0VuZXJneS5kaXJlY3Rpb24gKSA+IDAgPyAtMSA6IDE7XHJcblxyXG4gICAgLy8gaGFuZGxlIGRpZmZlcmVudCB3aGVlbCByb3RhdGlvbiBtb2Rlc1xyXG4gICAgaWYgKCB0aGlzLmRpcmVjdENvdXBsaW5nTW9kZVByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgLy8gdHJlYXQgdGhlIHdoZWVsIGFzIHRob3VnaCBpdCBpcyBkaXJlY3RseSBjb3VwbGVkIHRvIHRoZSBlbmVyZ3kgc291cmNlLCBlLmcuIHRocm91Z2ggYSBiZWx0IG9yIGRyaXZlIHNoYWZ0XHJcbiAgICAgIGlmICggaW5jb21pbmdFbmVyZ3kudHlwZSA9PT0gRW5lcmd5VHlwZS5NRUNIQU5JQ0FMICkge1xyXG4gICAgICAgIGNvbnN0IGVuZXJneUZyYWN0aW9uID0gKCBpbmNvbWluZ0VuZXJneS5hbW91bnQgLyBkdCApIC8gRUZBQ0NvbnN0YW50cy5NQVhfRU5FUkdZX1BST0RVQ1RJT05fUkFURTtcclxuICAgICAgICB0aGlzLndoZWVsUm90YXRpb25hbFZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSBlbmVyZ3lGcmFjdGlvbiAqIE1BWF9ST1RBVElPTkFMX1ZFTE9DSVRZICogc2lnbjtcclxuICAgICAgICB0aGlzLndoZWVsUm90YXRpb25hbEFuZ2xlUHJvcGVydHkuc2V0KFxyXG4gICAgICAgICAgY2FsY3VsYXRlV2hlZWxBbmdsZSggdGhpcy53aGVlbFJvdGF0aW9uYWxBbmdsZVByb3BlcnR5LnZhbHVlLCB0aGlzLndoZWVsUm90YXRpb25hbFZlbG9jaXR5UHJvcGVydHkudmFsdWUsIGR0IClcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyB0cmVhdCB0aGUgd2hlZWwgbGlrZSBpdCBpcyBiZWluZyBtb3ZlZCBmcm9tIGFuIGV4dGVybmFsIGVuZXJneSwgc3VjaCBhcyB3YXRlciwgYW5kIGhhcyBpbmVydGlhXHJcbiAgICAgIGxldCB0b3JxdWVGcm9tSW5jb21pbmdFbmVyZ3kgPSAwO1xyXG5cclxuICAgICAgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byByZWFjaCBtYXggZW5lcmd5IGFmdGVyIGEgc2Vjb25kIG9yIHR3b1xyXG4gICAgICBjb25zdCBlbmVyZ3lUb1RvcnF1ZUNvbnN0YW50ID0gMC41O1xyXG5cclxuICAgICAgaWYgKCBpbmNvbWluZ0VuZXJneS50eXBlID09PSBFbmVyZ3lUeXBlLk1FQ0hBTklDQUwgKSB7XHJcbiAgICAgICAgdG9ycXVlRnJvbUluY29taW5nRW5lcmd5ID0gaW5jb21pbmdFbmVyZ3kuYW1vdW50ICogV0hFRUxfUkFESVVTICogZW5lcmd5VG9Ub3JxdWVDb25zdGFudCAqIHNpZ247XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHRvcnF1ZUZyb21SZXNpc3RhbmNlID0gLXRoaXMud2hlZWxSb3RhdGlvbmFsVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSAqIFJFU0lTVEFOQ0VfQ09OU1RBTlQ7XHJcbiAgICAgIGNvbnN0IGFuZ3VsYXJBY2NlbGVyYXRpb24gPSAoIHRvcnF1ZUZyb21JbmNvbWluZ0VuZXJneSArIHRvcnF1ZUZyb21SZXNpc3RhbmNlICkgLyBXSEVFTF9NT01FTlRfT0ZfSU5FUlRJQTtcclxuICAgICAgY29uc3QgbmV3QW5ndWxhclZlbG9jaXR5ID0gdGhpcy53aGVlbFJvdGF0aW9uYWxWZWxvY2l0eVByb3BlcnR5LnZhbHVlICsgKCBhbmd1bGFyQWNjZWxlcmF0aW9uICogZHQgKTtcclxuICAgICAgdGhpcy53aGVlbFJvdGF0aW9uYWxWZWxvY2l0eVByb3BlcnR5LnZhbHVlID0gVXRpbHMuY2xhbXAoXHJcbiAgICAgICAgbmV3QW5ndWxhclZlbG9jaXR5LFxyXG4gICAgICAgIC1NQVhfUk9UQVRJT05BTF9WRUxPQ0lUWSxcclxuICAgICAgICBNQVhfUk9UQVRJT05BTF9WRUxPQ0lUWVxyXG4gICAgICApO1xyXG5cclxuICAgICAgaWYgKCBNYXRoLmFicyggdGhpcy53aGVlbFJvdGF0aW9uYWxWZWxvY2l0eVByb3BlcnR5LnZhbHVlICkgPCAxRS0zICkge1xyXG5cclxuICAgICAgICAvLyBwcmV2ZW50IHRoZSB3aGVlbCBmcm9tIG1vdmluZyBmb3JldmVyXHJcbiAgICAgICAgdGhpcy53aGVlbFJvdGF0aW9uYWxWZWxvY2l0eVByb3BlcnR5LnZhbHVlID0gMDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLndoZWVsUm90YXRpb25hbEFuZ2xlUHJvcGVydHkuc2V0KFxyXG4gICAgICAgIGNhbGN1bGF0ZVdoZWVsQW5nbGUoIHRoaXMud2hlZWxSb3RhdGlvbmFsQW5nbGVQcm9wZXJ0eS52YWx1ZSwgdGhpcy53aGVlbFJvdGF0aW9uYWxWZWxvY2l0eVByb3BlcnR5LnZhbHVlLCBkdCApXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzdGVwIHRoaXMgbW9kZWwgZWxlbWVudCBpbiB0aW1lXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IHRpbWUgc3RlcFxyXG4gICAqIEBwYXJhbSB7RW5lcmd5fSBpbmNvbWluZ0VuZXJneVxyXG4gICAqIEByZXR1cm5zIHtFbmVyZ3l9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0LCBpbmNvbWluZ0VuZXJneSApIHtcclxuICAgIGlmICggdGhpcy5hY3RpdmVQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgIHRoaXMuc3BpbkdlbmVyYXRvcldoZWVsKCBkdCwgaW5jb21pbmdFbmVyZ3kgKTtcclxuXHJcbiAgICAgIC8vIGhhbmRsZSBhbnkgaW5jb21pbmcgZW5lcmd5IGNodW5rc1xyXG4gICAgICBpZiAoIHRoaXMuaW5jb21pbmdFbmVyZ3lDaHVua3MubGVuZ3RoID4gMCApIHtcclxuICAgICAgICB0aGlzLmluY29taW5nRW5lcmd5Q2h1bmtzLmZvckVhY2goIGNodW5rID0+IHtcclxuXHJcbiAgICAgICAgICAvLyB2YWxpZGF0ZSBlbmVyZ3kgdHlwZVxyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY2h1bmsuZW5lcmd5VHlwZVByb3BlcnR5LmdldCgpID09PSBFbmVyZ3lUeXBlLk1FQ0hBTklDQUwsXHJcbiAgICAgICAgICAgIGBFbmVyZ3lUeXBlIG9mIGluY29taW5nIGNodW5rIGV4cGVjdGVkIHRvIGJlIG9mIHR5cGUgTUVDSEFOSUNBTCwgYnV0IGhhcyB0eXBlICR7Y2h1bmsuZW5lcmd5VHlwZVByb3BlcnR5LmdldCgpfWBcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgLy8gdHJhbnNmZXIgY2h1bmsgZnJvbSBpbmNvbWluZyBsaXN0IHRvIGN1cnJlbnQgbGlzdFxyXG4gICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QucHVzaCggY2h1bmsgKTtcclxuXHJcbiAgICAgICAgICAvLyBhZGQgYSBcIm1vdmVyXCIgdGhhdCB3aWxsIG1vdmUgdGhpcyBlbmVyZ3kgY2h1bmsgdG8gdGhlIGNlbnRlciBvZiB0aGUgd2hlZWxcclxuICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtNb3ZlcnMucHVzaCggdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCBjaHVuayxcclxuICAgICAgICAgICAgRW5lcmd5Q2h1bmtQYXRoTW92ZXIuY3JlYXRlUGF0aEZyb21PZmZzZXRzKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUsIFsgV0hFRUxfQ0VOVEVSX09GRlNFVCBdICksXHJcbiAgICAgICAgICAgIEVGQUNDb25zdGFudHMuRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIClcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICB0aGlzLmluY29taW5nRW5lcmd5Q2h1bmtzLmNsZWFyKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG1vdmUgdGhlIGVuZXJneSBjaHVua3MgYW5kIHVwZGF0ZSB0aGVpciBzdGF0ZVxyXG4gICAgICB0aGlzLnVwZGF0ZUVuZXJneUNodW5rUG9zaXRpb25zKCBkdCApO1xyXG5cclxuICAgIH0gLy8gdGhpcy5hY3RpdmVcclxuXHJcbiAgICAvLyBwcm9kdWNlIHRoZSBhcHByb3ByaWF0ZSBhbW91bnQgb2YgZW5lcmd5XHJcbiAgICBjb25zdCBzcGVlZEZyYWN0aW9uID0gdGhpcy53aGVlbFJvdGF0aW9uYWxWZWxvY2l0eVByb3BlcnR5LnZhbHVlIC8gTUFYX1JPVEFUSU9OQUxfVkVMT0NJVFk7XHJcbiAgICBjb25zdCBlbmVyZ3kgPSBNYXRoLmFicyggc3BlZWRGcmFjdGlvbiAqIEVGQUNDb25zdGFudHMuTUFYX0VORVJHWV9QUk9EVUNUSU9OX1JBVEUgKSAqIGR0O1xyXG4gICAgcmV0dXJuIG5ldyBFbmVyZ3koIEVuZXJneVR5cGUuRUxFQ1RSSUNBTCwgZW5lcmd5LCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKiBAcmV0dXJucyB7RW5lcmd5fVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlRW5lcmd5Q2h1bmtQb3NpdGlvbnMoIGR0ICkge1xyXG4gICAgY29uc3QgY2h1bmtNb3ZlcnMgPSB0aGlzLmVuZXJneUNodW5rTW92ZXJzLnNsaWNlKCk7XHJcblxyXG4gICAgY2h1bmtNb3ZlcnMuZm9yRWFjaCggbW92ZXIgPT4ge1xyXG5cclxuICAgICAgbW92ZXIubW92ZUFsb25nUGF0aCggZHQgKTtcclxuXHJcbiAgICAgIGlmICggIW1vdmVyLnBhdGhGdWxseVRyYXZlcnNlZCApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGNodW5rID0gbW92ZXIuZW5lcmd5Q2h1bms7XHJcbiAgICAgIHN3aXRjaCggY2h1bmsuZW5lcmd5VHlwZVByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgIGNhc2UgRW5lcmd5VHlwZS5NRUNIQU5JQ0FMOiB7XHJcblxyXG4gICAgICAgICAgY29uc3QgZWxlY3RyaWNhbEVuZXJneUNodW5rT2Zmc2V0cyA9IFtcclxuICAgICAgICAgICAgU1RBUlRfT0ZfV0lSRV9DVVJWRV9PRkZTRVQsXHJcbiAgICAgICAgICAgIFdJUkVfQ1VSVkVfUE9JTlRfMV9PRkZTRVQsXHJcbiAgICAgICAgICAgIFdJUkVfQ1VSVkVfUE9JTlRfMl9PRkZTRVQsXHJcbiAgICAgICAgICAgIFdJUkVfQ1VSVkVfUE9JTlRfM19PRkZTRVQsXHJcbiAgICAgICAgICAgIFdJUkVfQ1VSVkVfUE9JTlRfNF9PRkZTRVQsXHJcbiAgICAgICAgICAgIFdJUkVfQ1VSVkVfUE9JTlRfNV9PRkZTRVQsXHJcbiAgICAgICAgICAgIENFTlRFUl9PRl9DT05ORUNUT1JfT0ZGU0VUXHJcbiAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgIC8vIFRoaXMgbWVjaGFuaWNhbCBlbmVyZ3kgY2h1bmsgaGFzIHRyYXZlbGVkIHRvIHRoZSBlbmQgb2YgaXRzIHBhdGgsIHNvIGNoYW5nZSBpdCB0byBlbGVjdHJpY2FsIGFuZCBzZW5kIGl0XHJcbiAgICAgICAgICAvLyBvbiBpdHMgd2F5LiAgQWxzbyBhZGQgYSBcImhpZGRlblwiIGNodW5rIHNvIHRoYXQgdGhlIG1vdmVtZW50IHRocm91Z2ggdGhlIGdlbmVyYXRvciBjYW4gYmUgc2VlbiBieSB0aGVcclxuICAgICAgICAgIC8vIHVzZXIuXHJcbiAgICAgICAgICB0aGlzLmVuZXJneUNodW5rTGlzdC5yZW1vdmUoIGNodW5rICk7XHJcbiAgICAgICAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzLnJlbW92ZSggbW92ZXIgKTtcclxuXHJcbiAgICAgICAgICBjaHVuay5lbmVyZ3lUeXBlUHJvcGVydHkuc2V0KCBFbmVyZ3lUeXBlLkVMRUNUUklDQUwgKTtcclxuICAgICAgICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rcy5wdXNoKCBjaHVuayApO1xyXG4gICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua01vdmVycy5wdXNoKCB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIG1vdmVyLmVuZXJneUNodW5rLFxyXG4gICAgICAgICAgICBFbmVyZ3lDaHVua1BhdGhNb3Zlci5jcmVhdGVQYXRoRnJvbU9mZnNldHMoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSwgZWxlY3RyaWNhbEVuZXJneUNodW5rT2Zmc2V0cyApLFxyXG4gICAgICAgICAgICBFRkFDQ29uc3RhbnRzLkVORVJHWV9DSFVOS19WRUxPQ0lUWSApXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgY29uc3QgaGlkZGVuQ2h1bmsgPSB0aGlzLmVuZXJneUNodW5rR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoXHJcbiAgICAgICAgICAgIEVuZXJneVR5cGUuSElEREVOLFxyXG4gICAgICAgICAgICBjaHVuay5wb3NpdGlvblByb3BlcnR5LmdldCgpLFxyXG4gICAgICAgICAgICBWZWN0b3IyLlpFUk8sXHJcbiAgICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5XHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgaGlkZGVuQ2h1bmsuelBvc2l0aW9uUHJvcGVydHkuc2V0KCAtRW5lcmd5Q2h1bmtOb2RlLlpfRElTVEFOQ0VfV0hFUkVfRlVMTFlfRkFERUQgLyAyICk7XHJcbiAgICAgICAgICB0aGlzLmhpZGRlbkVuZXJneUNodW5rcy5wdXNoKCBoaWRkZW5DaHVuayApO1xyXG4gICAgICAgICAgY29uc3QgaGlkZGVuRW5lcmd5Q2h1bmtPZmZzZXRzID0gWyBTVEFSVF9PRl9XSVJFX0NVUlZFX09GRlNFVCwgV0lSRV9DVVJWRV9QT0lOVF8xX09GRlNFVCBdO1xyXG4gICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua01vdmVycy5wdXNoKCB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIGhpZGRlbkNodW5rLFxyXG4gICAgICAgICAgICBFbmVyZ3lDaHVua1BhdGhNb3Zlci5jcmVhdGVQYXRoRnJvbU9mZnNldHMoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSwgaGlkZGVuRW5lcmd5Q2h1bmtPZmZzZXRzICksXHJcbiAgICAgICAgICAgIEVGQUNDb25zdGFudHMuRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIClcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmRpc3Bvc2VFbGVtZW50KCBtb3ZlciApO1xyXG5cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIEVuZXJneVR5cGUuRUxFQ1RSSUNBTDpcclxuXHJcbiAgICAgICAgICAvLyBUaGlzIGVsZWN0cmljYWwgZW5lcmd5IGNodW5rIGhhcyB0cmF2ZWxlZCB0byB0aGUgZW5kIG9mIGl0cyBwYXRoLCBzbyB0cmFuc2ZlciBpdCB0byB0aGUgbmV4dCBlbmVyZ3lcclxuICAgICAgICAgIC8vIHN5c3RlbS5cclxuICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtNb3ZlcnMucmVtb3ZlKCBtb3ZlciApO1xyXG4gICAgICAgICAgdGhpcy5lbGVjdHJpY2FsRW5lcmd5Q2h1bmtzLnJlbW92ZSggY2h1bmsgKTtcclxuICAgICAgICAgIHRoaXMub3V0Z29pbmdFbmVyZ3lDaHVua3MucHVzaCggY2h1bmsgKTtcclxuICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIgKTtcclxuXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEVuZXJneVR5cGUuSElEREVOOlxyXG5cclxuICAgICAgICAgIC8vIFRoaXMgaGlkZGVuIGVuZXJneSBjaHVuayBoYXMgdHJhdmVsZWQgdG8gdGhlIGVuZCBvZiBpdHMgcGF0aCwgc28ganVzdCByZW1vdmUgaXQsIGJlY2F1c2UgdGhlIGVsZWN0cmljYWxcclxuICAgICAgICAgIC8vIGVuZXJneSBjaHVuayB0byB3aGljaCBpcyBjb3JyZXNwb25kcyBzaG91bGQgbm93IGJlIHZpc2libGUgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICB0aGlzLmhpZGRlbkVuZXJneUNodW5rcy5yZW1vdmUoIGNodW5rICk7XHJcbiAgICAgICAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzLnJlbW92ZSggbW92ZXIgKTtcclxuICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cC5kaXNwb3NlRWxlbWVudCggY2h1bmsgKTtcclxuICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIgKTtcclxuXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdVbnJlY29nbml6ZWQgRW5lcmd5VHlwZTogJywgY2h1bmsuZW5lcmd5VHlwZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW5lcmd5fSBpbmNvbWluZ0VuZXJneVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBwcmVsb2FkRW5lcmd5Q2h1bmtzKCBpbmNvbWluZ0VuZXJneSApIHtcclxuXHJcbiAgICAvLyBpbiBtb3N0IHN5c3RlbSBlbGVtZW50cywgd2UgY2xlYXIgZW5lcmd5IGNodW5rcyBiZWZvcmUgY2hlY2tpbmcgaWYgaW5jb21pbmdFbmVyZ3kuYW1vdW50ID09PSAwLCBidXQgc2luY2UgdGhlXHJcbiAgICAvLyBnZW5lcmF0b3Igd2hlZWwgaGFzIHJvdGF0aW9uYWwgaW5lcnRpYSwgd2UgbGVhdmUgdGhlIHJlbWFpbmluZyBjaHVua3Mgb24gdGhlaXIgd2F5LCB3aGljaCBsb29rcyBtb3JlIGFjY3VyYXRlLlxyXG4gICAgaWYgKCBpbmNvbWluZ0VuZXJneS5hbW91bnQgPT09IDAgfHwgaW5jb21pbmdFbmVyZ3kudHlwZSAhPT0gRW5lcmd5VHlwZS5NRUNIQU5JQ0FMICkge1xyXG5cclxuICAgICAgLy8gbm8gZW5lcmd5IGNodW5rIHByZS1sb2FkaW5nIG5lZWRlZFxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmNsZWFyRW5lcmd5Q2h1bmtzKCk7XHJcblxyXG4gICAgY29uc3QgZHQgPSAxIC8gRUZBQ0NvbnN0YW50cy5GUkFNRVNfUEVSX1NFQ09ORDtcclxuICAgIGxldCBlbmVyZ3lTaW5jZUxhc3RDaHVuayA9IEVGQUNDb25zdGFudHMuRU5FUkdZX1BFUl9DSFVOSyAqIDAuOTk7XHJcbiAgICBsZXQgcHJlbG9hZENvbXBsZXRlID0gZmFsc2U7XHJcblxyXG4gICAgLy8gc2tpcCBldmVyeSBvdGhlciB2aXN1YWwgY2h1bmsgdG8gbWF0Y2ggdGhlIHVzdWFsIHJhdGUgb2YgY2h1bmtzIGZsb3dpbmcgdGhyb3VnaCB0aGUgZ2VuZXJhdG9yLiB0aGlzIGlzIG5lZWRlZFxyXG4gICAgLy8gYmVjYXVzZSB0aGVyZSBpcyB2aXN1YWwgZW5lcmd5IGNodW5rIGxvc3MgKGUuZy4gZXZlcnkgb3RoZXIgY2h1bmtzIGZyb20gdGhlIGZhdWNldCBjb21lcyBpbnRvIHRoZSBnZW5lcmF0b3IsXHJcbiAgICAvLyBidXQgdGhlIGFjdHVhbCBpbmNvbWluZyBlbmVyZ3kgaXMgY29uc3RhbnQgc28gdGhhdCB0aGUgZ2VuZXJhdG9yIHdoZWVsIHNwaW5zIGF0IGEgY29uc3RhbnQgc3BlZWQpLiBzbywgc2luY2VcclxuICAgIC8vIG1vcmUgZW5lcmd5IGlzIGJlaW5nIGNvbnZlcnRlZCB0aGFuIHZpc3VhbGx5IHNob3duLCB3ZSBuZWVkIHRvIHN0YXkgY29uc2lzdGVudCB3aXRoIHRoYXQgcHJhY3RpY2UgaGVyZSBhbmQgb25seVxyXG4gICAgLy8gcHJlbG9hZCBjaHVua3MgZm9yIGhhbGYgYXMgbXVjaCBlbmVyZ3kgdGhhdCBpcyBpbmNvbWluZ1xyXG4gICAgbGV0IHNraXBUaGlzQ2h1bmsgPSB0cnVlO1xyXG5cclxuICAgIC8vIHNpbXVsYXRlIGVuZXJneSBjaHVua3MgbW92aW5nIHRocm91Z2ggdGhlIHN5c3RlbVxyXG4gICAgd2hpbGUgKCAhcHJlbG9hZENvbXBsZXRlICkge1xyXG4gICAgICBlbmVyZ3lTaW5jZUxhc3RDaHVuayArPSBpbmNvbWluZ0VuZXJneS5hbW91bnQgKiBkdDtcclxuXHJcbiAgICAgIC8vIGRldGVybWluZSBpZiB0aW1lIHRvIGFkZCBhIG5ldyBjaHVua1xyXG4gICAgICBpZiAoIGVuZXJneVNpbmNlTGFzdENodW5rID49IEVGQUNDb25zdGFudHMuRU5FUkdZX1BFUl9DSFVOSyAmJiAhc2tpcFRoaXNDaHVuayApIHtcclxuICAgICAgICBjb25zdCBuZXdDaHVuayA9IHRoaXMuZW5lcmd5Q2h1bmtHcm91cC5jcmVhdGVOZXh0RWxlbWVudChcclxuICAgICAgICAgIEVuZXJneVR5cGUuTUVDSEFOSUNBTCxcclxuICAgICAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBMRUZUX1NJREVfT0ZfV0hFRUxfT0ZGU0VUICksXHJcbiAgICAgICAgICBWZWN0b3IyLlpFUk8sXHJcbiAgICAgICAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtMaXN0LnB1c2goIG5ld0NodW5rICk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBhICdtb3ZlcicgZm9yIHRoaXMgZW5lcmd5IGNodW5rXHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua01vdmVycy5wdXNoKCB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIG5ld0NodW5rLFxyXG4gICAgICAgICAgRW5lcmd5Q2h1bmtQYXRoTW92ZXIuY3JlYXRlUGF0aEZyb21PZmZzZXRzKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUsIFsgV0hFRUxfQ0VOVEVSX09GRlNFVCBdICksXHJcbiAgICAgICAgICBFRkFDQ29uc3RhbnRzLkVORVJHWV9DSFVOS19WRUxPQ0lUWSApXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGVuZXJneSBzaW5jZSBsYXN0IGNodW5rXHJcbiAgICAgICAgZW5lcmd5U2luY2VMYXN0Q2h1bmsgPSBlbmVyZ3lTaW5jZUxhc3RDaHVuayAtIEVGQUNDb25zdGFudHMuRU5FUkdZX1BFUl9DSFVOSztcclxuICAgICAgICBza2lwVGhpc0NodW5rID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggZW5lcmd5U2luY2VMYXN0Q2h1bmsgPj0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LICkge1xyXG4gICAgICAgIGVuZXJneVNpbmNlTGFzdENodW5rID0gZW5lcmd5U2luY2VMYXN0Q2h1bmsgLSBFRkFDQ29uc3RhbnRzLkVORVJHWV9QRVJfQ0hVTks7XHJcbiAgICAgICAgc2tpcFRoaXNDaHVuayA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZUVuZXJneUNodW5rUG9zaXRpb25zKCBkdCApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLm91dGdvaW5nRW5lcmd5Q2h1bmtzLmxlbmd0aCA+IDAgKSB7XHJcblxyXG4gICAgICAgIC8vIGFuIGVuZXJneSBjaHVuayBoYXMgbWFkZSBpdCBhbGwgdGhlIHdheSB0aHJvdWdoIHRoZSBzeXN0ZW1cclxuICAgICAgICBwcmVsb2FkQ29tcGxldGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7RW5lcmd5fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBnZXRFbmVyZ3lPdXRwdXRSYXRlKCkge1xyXG4gICAgY29uc3Qgc3BlZWRGcmFjdGlvbiA9IHRoaXMud2hlZWxSb3RhdGlvbmFsVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSAvIE1BWF9ST1RBVElPTkFMX1ZFTE9DSVRZO1xyXG4gICAgY29uc3QgZW5lcmd5ID0gTWF0aC5hYnMoIHNwZWVkRnJhY3Rpb24gKiBFRkFDQ29uc3RhbnRzLk1BWF9FTkVSR1lfUFJPRFVDVElPTl9SQVRFICk7XHJcbiAgICByZXR1cm4gbmV3IEVuZXJneSggRW5lcmd5VHlwZS5FTEVDVFJJQ0FMLCBlbmVyZ3ksIDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGRlYWN0aXZhdGUgdGhlIGdlbmVyYXRvclxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkZWFjdGl2YXRlKCkge1xyXG4gICAgc3VwZXIuZGVhY3RpdmF0ZSgpO1xyXG4gICAgdGhpcy53aGVlbFJvdGF0aW9uYWxWZWxvY2l0eVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLndoZWVsUm90YXRpb25hbEFuZ2xlUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBjbGVhckVuZXJneUNodW5rcygpIHtcclxuICAgIHN1cGVyLmNsZWFyRW5lcmd5Q2h1bmtzKCk7XHJcbiAgICB0aGlzLmVsZWN0cmljYWxFbmVyZ3lDaHVua3MuZm9yRWFjaCggY2h1bmsgPT4gdGhpcy5lbmVyZ3lDaHVua0dyb3VwLmRpc3Bvc2VFbGVtZW50KCBjaHVuayApICk7XHJcbiAgICB0aGlzLmVsZWN0cmljYWxFbmVyZ3lDaHVua3MuY2xlYXIoKTtcclxuICAgIHRoaXMuaGlkZGVuRW5lcmd5Q2h1bmtzLmZvckVhY2goIGNodW5rID0+IHRoaXMuZW5lcmd5Q2h1bmtHcm91cC5kaXNwb3NlRWxlbWVudCggY2h1bmsgKSApO1xyXG4gICAgdGhpcy5oaWRkZW5FbmVyZ3lDaHVua3MuY2xlYXIoKTtcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtNb3ZlcnMuZm9yRWFjaCggbW92ZXIgPT4gdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmRpc3Bvc2VFbGVtZW50KCBtb3ZlciApICk7XHJcbiAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZXh0cmFjdE91dGdvaW5nRW5lcmd5Q2h1bmtzKCkge1xyXG4gICAgY29uc3QgY2h1bmtzID0gdGhpcy5vdXRnb2luZ0VuZXJneUNodW5rcy5zbGljZSgpO1xyXG5cclxuICAgIGNvbnN0IGNodW5rc1RvUmVtb3ZlID0gY2h1bmtzLmZpbHRlciggZW5lcmd5Q2h1bmsgPT4gdGhpcy5lbGVjdHJpY2FsRW5lcmd5Q2h1bmtzLmluY2x1ZGVzKCBlbmVyZ3lDaHVuayApICk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIG91dGdvaW5nIGNodW5rcyBmcm9tIGVsZWN0cmljYWwgZW5lcmd5IGNodW5rcyBsaXN0XHJcbiAgICB0aGlzLmVsZWN0cmljYWxFbmVyZ3lDaHVua3MucmVtb3ZlQWxsKCBjaHVua3NUb1JlbW92ZSApO1xyXG4gICAgdGhpcy5vdXRnb2luZ0VuZXJneUNodW5rcy5jbGVhcigpO1xyXG5cclxuICAgIHJldHVybiBjaHVua3M7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogY2FsY3VsYXRlcyB0aGUgYW5nbGUgb2YgdGhlIHdoZWVsIGZvciB0aGUgY3VycmVudCB0aW1lIHN0ZXAuIHRoaXMgc3VwcG9ydHMgYm90aCBwb3NpdGl2ZSBhbmQgbmVnYXRpdmUgdmVsb2NpdHksIHNvXHJcbiAqIHRoYXQgcmVnYXJkbGVzcyBvZiB3aGljaCBkaXJlY3Rpb24gdGhlIHdoZWVsIGlzIHNwaW5uaW5nLCBpdHMgYW5nbGUgdmFsdWVzIGFyZSBjb25zdHJhaW5lZCBiZXR3ZWVuIDAgYW5kIDJwaS5cclxuICpcclxuICogQHBhcmFtIHdoZWVsUm90YXRpb25hbEFuZ2xlXHJcbiAqIEBwYXJhbSB3aGVlbFJvdGF0aW9uYWxWZWxvY2l0eVxyXG4gKiBAcGFyYW0gZHRcclxuICogQHJldHVybnMge251bWJlcn1cclxuICovXHJcbmNvbnN0IGNhbGN1bGF0ZVdoZWVsQW5nbGUgPSAoIHdoZWVsUm90YXRpb25hbEFuZ2xlLCB3aGVlbFJvdGF0aW9uYWxWZWxvY2l0eSwgZHQgKSA9PiB7XHJcbiAgY29uc3QgdHdvUGkgPSAyICogTWF0aC5QSTtcclxuICBjb25zdCBuZXdBbmdsZSA9ICggd2hlZWxSb3RhdGlvbmFsQW5nbGUgKyB3aGVlbFJvdGF0aW9uYWxWZWxvY2l0eSAqIGR0ICkgJSB0d29QaTtcclxuICByZXR1cm4gbmV3QW5nbGUgPCAwID8gdHdvUGkgKyBuZXdBbmdsZSA6IG5ld0FuZ2xlO1xyXG59O1xyXG5cclxuLy8gc3RhdGljc1xyXG5HZW5lcmF0b3IuV0hFRUxfQ0VOVEVSX09GRlNFVCA9IFdIRUVMX0NFTlRFUl9PRkZTRVQ7XHJcbkdlbmVyYXRvci5XSEVFTF9SQURJVVMgPSBXSEVFTF9SQURJVVM7XHJcblxyXG5lbmVyZ3lGb3Jtc0FuZENoYW5nZXMucmVnaXN0ZXIoICdHZW5lcmF0b3InLCBHZW5lcmF0b3IgKTtcclxuZXhwb3J0IGRlZmF1bHQgR2VuZXJhdG9yOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MscUJBQXFCLE1BQU0sOENBQThDO0FBQ2hGLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxpQkFBaUIsTUFBTSxzQ0FBc0M7QUFDcEUsT0FBT0MsYUFBYSxNQUFNLCtCQUErQjtBQUN6RCxPQUFPQyxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsZUFBZSxNQUFNLHNDQUFzQztBQUNsRSxPQUFP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