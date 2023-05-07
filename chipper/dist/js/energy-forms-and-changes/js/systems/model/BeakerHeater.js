// Copyright 2016-2022, University of Colorado Boulder

/**
 * model of a heating element with a beaker on it
 *
 * @author John Blanco
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
import waterIcon_png from '../../../images/waterIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import Beaker from '../../common/model/Beaker.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyContainerCategory from '../../common/model/EnergyContainerCategory.js';
import EnergyType from '../../common/model/EnergyType.js';
import HeatTransferConstants from '../../common/model/HeatTransferConstants.js';
import TemperatureAndColorSensor from '../../common/model/TemperatureAndColorSensor.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergyUser from './EnergyUser.js';

// position and size constants, empirically determined
const BEAKER_WIDTH = 0.075; // In meters.
const BEAKER_HEIGHT = BEAKER_WIDTH * 1.1;
const BEAKER_OFFSET = new Vector2(0, 0.016);
const HEATING_ELEMENT_ENERGY_CHUNK_VELOCITY = 0.0075; // in meters/sec, quite slow
const HEATER_ELEMENT_2D_HEIGHT = 0.027; // height of image
const MAX_HEAT_GENERATION_RATE = 5000; // Joules/sec, not connected to incoming energy
const HEAT_ENERGY_CHANGE_RATE = 0.5; // in proportion per second

// energy chunk path offsets, empirically determined such that they move through the view in a way that looks good
const LEFT_SIDE_OF_WIRE_OFFSET = new Vector2(-0.04, -0.041);
const WIRE_CURVE_POINT_1_OFFSET = new Vector2(-0.02, -0.041);
const WIRE_CURVE_POINT_2_OFFSET = new Vector2(-0.015, -0.04);
const WIRE_CURVE_POINT_3_OFFSET = new Vector2(-0.005, -0.034);
const WIRE_CURVE_POINT_4_OFFSET = new Vector2(-0.001, -0.027);
const WIRE_CURVE_POINT_5_OFFSET = new Vector2(-0.0003, -0.02);
const BOTTOM_OF_CONNECTOR_OFFSET = new Vector2(-0.0003, -0.01);
const CONVERSION_POINT_OFFSET = new Vector2(0, 0.003);
const ELECTRICAL_ENERGY_CHUNK_OFFSETS = [WIRE_CURVE_POINT_1_OFFSET, WIRE_CURVE_POINT_2_OFFSET, WIRE_CURVE_POINT_3_OFFSET, WIRE_CURVE_POINT_4_OFFSET, WIRE_CURVE_POINT_5_OFFSET, BOTTOM_OF_CONNECTOR_OFFSET, CONVERSION_POINT_OFFSET];
class BeakerHeater extends EnergyUser {
  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Object} [options]
   */
  constructor(energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, options) {
    options = merge({
      tandem: Tandem.REQUIRED,
      phetioState: false // no internal fields to convey in state
    }, options);
    super(new Image(waterIcon_png), options);

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.beakerOfWater;

    // @private
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;

    // @public (read-only) {NumberProperty}
    this.heatProportionProperty = new NumberProperty(0, {
      range: new Range(0, 1),
      tandem: options.tandem.createTandem('heatProportionProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'proportion of how much heat the coils have'
    });

    // @private {ObservableArrayDef.<EnergyChunkPathMover>} - arrays that move the energy chunks as they move into, within, and out of the
    // beaker
    this.electricalEnergyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('electricalEnergyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });
    this.heatingElementEnergyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('heatingElementEnergyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });
    this.radiatedEnergyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('radiatedEnergyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });

    // @public (read-only) {ObservableArrayDef} - energy chunks that are radiated by this beaker
    this.radiatedEnergyChunkList = createObservableArray({
      tandem: options.tandem.createTandem('radiatedEnergyChunkList'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunk.EnergyChunkIO))
    });

    // @private {Tandem} - used for instrumenting the water beaker and the thermometer's sensedElementNameProperty
    this.waterBeakerTandem = options.tandem.createTandem('waterBeaker');

    // @public {Beaker} (read-only) - note that the position is absolute, not relative to the "parent" model element
    this.beaker = new Beaker(this.positionProperty.value.plus(BEAKER_OFFSET), BEAKER_WIDTH, BEAKER_HEIGHT, energyChunksVisibleProperty, energyChunkGroup, {
      tandem: this.waterBeakerTandem,
      phetioDocumentation: 'beaker that contains water',
      userControllable: false
    });

    // @public {TemperatureAndColorSensor} (read-only)
    this.thermometer = new TemperatureAndColorSensor(this, new Vector2(BEAKER_WIDTH * 0.45, BEAKER_HEIGHT * 0.6),
    // position is relative, not absolute
    true, {
      tandem: options.tandem.createTandem('thermometer'),
      userControllable: false
    });

    // @private, for convenience
    this.random = dotRandom;

    // move the beaker as the overall position changes
    this.positionProperty.link(position => {
      this.beaker.positionProperty.value = position.plus(BEAKER_OFFSET);
    });
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @param  {Energy} incomingEnergy
   * @public
   * @override
   */
  step(dt, incomingEnergy) {
    if (!this.activeProperty.value) {
      return;
    }

    // this isn't designed to take in anything other than electrical energy, so make sure that's what we've got
    assert && assert(incomingEnergy.type === EnergyType.ELECTRICAL, `unexpected energy type: ${incomingEnergy.type}`);

    // handle any incoming energy chunks
    if (this.incomingEnergyChunks.length > 0) {
      this.incomingEnergyChunks.forEach(chunk => {
        assert && assert(chunk.energyTypeProperty.value === EnergyType.ELECTRICAL, `Energy chunk type should be ELECTRICAL but is ${chunk.energyTypeProperty.value}`);

        // add the energy chunk to the list of those under management
        this.energyChunkList.push(chunk);

        // add a "mover" that will move this energy chunk through the wire to the heating element
        this.electricalEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(chunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.get(), ELECTRICAL_ENERGY_CHUNK_OFFSETS), EFACConstants.ENERGY_CHUNK_VELOCITY));
      });

      // clear incoming chunks array
      this.incomingEnergyChunks.clear();
    }
    this.moveElectricalEnergyChunks(dt);
    this.moveThermalEnergyChunks(dt);

    // set the proportion of max heat being generated by the heater element
    if (this.energyChunksVisibleProperty.value) {
      // Energy chunks are visible, so set the heat level based on the number of them that are on the burner.  This
      // calculation uses a shifted sigmoid function so that it will asymptotically approach one as more energy chunks
      // are present.  It was empirically determined by looking at the incoming energy rate versus the number of energy
      // chunks present when the system has been producing energy steadily for long enough that the energy chunks have
      // propagated all the way through.
      const currentHeatProportion = this.heatProportionProperty.value;
      const targetHeatProportion = 2 / (1 + Math.pow(Math.E, -this.heatingElementEnergyChunkMovers.length)) - 1;
      if (targetHeatProportion > currentHeatProportion) {
        this.heatProportionProperty.set(Math.min(targetHeatProportion, currentHeatProportion + HEAT_ENERGY_CHANGE_RATE * dt));
      } else if (targetHeatProportion < currentHeatProportion) {
        this.heatProportionProperty.set(Math.max(targetHeatProportion, currentHeatProportion - HEAT_ENERGY_CHANGE_RATE * dt));
      }
    } else {
      // set the heat proportion based on the incoming energy amount, but moderate the rate at which it changes
      const energyFraction = incomingEnergy.amount / (EFACConstants.MAX_ENERGY_PRODUCTION_RATE * dt);
      this.heatProportionProperty.set(Math.min(energyFraction, this.heatProportionProperty.value + HEAT_ENERGY_CHANGE_RATE * dt));
    }

    // add energy to the beaker based on heat coming from heat element
    this.beaker.changeEnergy(this.heatProportionProperty.value * MAX_HEAT_GENERATION_RATE * dt);

    // remove energy from the beaker based on loss of heat to the surrounding air
    const temperatureGradient = this.beaker.getTemperature() - EFACConstants.ROOM_TEMPERATURE;
    if (Math.abs(temperatureGradient) > EFACConstants.TEMPERATURES_EQUAL_THRESHOLD) {
      const beakerRect = this.beaker.getUntransformedBounds();
      const thermalContactArea = beakerRect.width * 2 + beakerRect.height * 2 * this.beaker.fluidProportionProperty.value;
      const transferFactor = HeatTransferConstants.getHeatTransferFactor(EnergyContainerCategory.WATER, EnergyContainerCategory.AIR);
      const thermalEnergyLost = temperatureGradient * transferFactor * thermalContactArea * dt;
      this.beaker.changeEnergy(-thermalEnergyLost);
      if (this.beaker.getEnergyBeyondMaxTemperature() > 0) {
        // Prevent the water from going beyond the boiling point.
        this.beaker.changeEnergy(-this.beaker.getEnergyBeyondMaxTemperature());
      }
    }
    this.beaker.step(dt);
    if (this.beaker.getEnergyChunkBalance() > 0) {
      // remove an energy chunk from the beaker and start it floating away, a.k.a. make it "radiate"
      const bounds = this.beaker.getBounds();
      const extractionPoint = new Vector2(bounds.minX + dotRandom.nextDouble() * bounds.width, bounds.maxY);
      const ec = this.beaker.extractEnergyChunkClosestToPoint(extractionPoint);
      if (ec) {
        ec.zPositionProperty.set(0); // move to front of z order
        this.radiatedEnergyChunkList.push(ec);
        this.radiatedEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(ec, EnergyChunkPathMover.createRadiatedPath(ec.positionProperty.value, 0), EFACConstants.ENERGY_CHUNK_VELOCITY));
      }
    }
    this.moveRadiatedEnergyChunks(dt);

    // step sub-elements
    this.thermometer.step();
  }

  /**
   * update the temperature and color at the specified position within the beaker
   *
   * @param {Vector2} position - position to be sensed
   * @param {Property.<number>} sensedTemperatureProperty
   * @param {Property.<Color>} sensedElementColorProperty
   * @public
   */
  updateTemperatureAndColorAndNameAtPosition(position, sensedTemperatureProperty, sensedElementColorProperty, sensedElementNameProperty) {
    // validate that the specified position is inside the beaker, since that's the only supported position
    assert && assert(position.x >= BEAKER_OFFSET.x - BEAKER_WIDTH / 2 && position.x <= BEAKER_OFFSET.x + BEAKER_WIDTH / 2, 'position is not inside of beaker');
    assert && assert(position.y >= BEAKER_OFFSET.y - BEAKER_HEIGHT / 2 && position.y <= BEAKER_OFFSET.y + BEAKER_HEIGHT / 2, 'position is not inside of beaker');
    sensedTemperatureProperty.set(this.beaker.getTemperature());
    sensedElementColorProperty.set(EFACConstants.WATER_COLOR_OPAQUE);
    sensedElementNameProperty.set(this.waterBeakerTandem.phetioID);
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveRadiatedEnergyChunks(dt) {
    const movers = this.radiatedEnergyChunkMovers.slice();
    movers.forEach(mover => {
      mover.moveAlongPath(dt);
      if (mover.pathFullyTraversed) {
        // remove this energy chunk entirely
        this.radiatedEnergyChunkList.remove(mover.energyChunk);
        this.radiatedEnergyChunkMovers.remove(mover);
        this.energyChunkGroup.disposeElement(mover.energyChunk);
        this.energyChunkPathMoverGroup.disposeElement(mover);
      }
    });
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveThermalEnergyChunks(dt) {
    const movers = this.heatingElementEnergyChunkMovers.slice();
    movers.forEach(mover => {
      mover.moveAlongPath(dt);
      if (mover.pathFullyTraversed) {
        // This chunk is ready to move to the beaker.  We remove it from here, and the beaker takes over management of
        // the chunk.
        this.beaker.addEnergyChunk(mover.energyChunk);
        this.energyChunkList.remove(mover.energyChunk);
        this.heatingElementEnergyChunkMovers.remove(mover);
        this.energyChunkPathMoverGroup.disposeElement(mover);
      }
    });
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveElectricalEnergyChunks(dt) {
    const movers = this.electricalEnergyChunkMovers.slice();
    movers.forEach(mover => {
      mover.moveAlongPath(dt);
      if (mover.pathFullyTraversed) {
        // the electrical energy chunk has reached the burner, so it needs to change into thermal energy
        this.electricalEnergyChunkMovers.remove(mover);
        mover.energyChunk.energyTypeProperty.set(EnergyType.THERMAL);

        // have the thermal energy move a little on the element before moving into the beaker
        this.heatingElementEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(mover.energyChunk, this.createHeaterElementEnergyChunkPath(mover.energyChunk.positionProperty.get()), HEATING_ELEMENT_ENERGY_CHUNK_VELOCITY));
        this.energyChunkPathMoverGroup.disposeElement(mover);
      }
    });
  }

  /**
   * @param  {Energy} incomingEnergyRate
   * @public
   * @override
   */
  preloadEnergyChunks(incomingEnergyRate) {
    this.clearEnergyChunks();
    if (incomingEnergyRate.amount === 0 || incomingEnergyRate.type !== EnergyType.ELECTRICAL) {
      // no energy chunk pre-loading needed
      return;
    }
    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;

    // simulate energy chunks moving through the system
    let preloadComplete = false;
    while (!preloadComplete) {
      energySinceLastChunk += incomingEnergyRate.amount * dt;

      // determine if time to add a new chunk
      if (energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK) {
        // create and add a new chunk
        const newEnergyChunk = this.energyChunkGroup.createNextElement(EnergyType.ELECTRICAL, this.positionProperty.get().plus(LEFT_SIDE_OF_WIRE_OFFSET), Vector2.ZERO, this.energyChunksVisibleProperty);
        this.energyChunkList.push(newEnergyChunk);

        // add a "mover" that will move this energy chunk through the wire to the heating element
        this.electricalEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(newEnergyChunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.get(), ELECTRICAL_ENERGY_CHUNK_OFFSETS), EFACConstants.ENERGY_CHUNK_VELOCITY));

        // update energy since last chunk
        energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
      }
      this.moveElectricalEnergyChunks(dt);
      if (this.heatingElementEnergyChunkMovers.length > 0) {
        // an energy chunk has made it to the heating element, which completes the preload
        preloadComplete = true;
      }
    }
  }

  /**
   * @public
   * @override
   */
  deactivate() {
    super.deactivate();
    this.beaker.reset();
    this.beaker.positionProperty.value = this.positionProperty.value.plus(BEAKER_OFFSET);
    this.heatProportionProperty.set(0);

    // step the thermometer so that any temperature changes resulting from the reset are immediately reflected
    this.thermometer.step();
  }

  /**
   * remove all energy chunks
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.electricalEnergyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.electricalEnergyChunkMovers.clear();
    this.heatingElementEnergyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.heatingElementEnergyChunkMovers.clear();
    this.radiatedEnergyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.radiatedEnergyChunkMovers.clear();
    this.radiatedEnergyChunkList.forEach(chunk => this.energyChunkGroup.disposeElement(chunk));
    this.radiatedEnergyChunkList.clear();
  }

  /**
   * @param  {Vector2} startingPoint
   * @returns {Vector2[]}
   * @private
   */
  createHeaterElementEnergyChunkPath(startingPoint) {
    const path = [];

    // The path for the thermal energy chunks is meant to look like it is moving on the burner element.  This must be
    // updated if the burner element image changes.
    const angleSpan = Math.PI * 0.75;
    const angle = Math.PI / 2 + (this.random.nextDouble() - 0.5) * angleSpan;

    // Calculate a travel distance that will move farther to the left and right, less in the middle, to match the
    // elliptical shape of the burner in the view, see https://github.com/phetsims/energy-forms-and-changes/issues/174.
    const travelDistance = (0.6 + Math.abs(Math.cos(angle)) * 0.3) * HEATER_ELEMENT_2D_HEIGHT;
    path.push(startingPoint.plus(new Vector2(travelDistance, 0).rotated(angle)));
    return path;
  }
}
BeakerHeater.HEATER_ELEMENT_2D_HEIGHT = HEATER_ELEMENT_2D_HEIGHT;
energyFormsAndChanges.register('BeakerHeater', BeakerHeater);
export default BeakerHeater;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJOdW1iZXJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlJhbmdlIiwiVmVjdG9yMiIsIm1lcmdlIiwiSW1hZ2UiLCJUYW5kZW0iLCJSZWZlcmVuY2VJTyIsIndhdGVySWNvbl9wbmciLCJFRkFDQ29uc3RhbnRzIiwiQmVha2VyIiwiRW5lcmd5Q2h1bmsiLCJFbmVyZ3lDb250YWluZXJDYXRlZ29yeSIsIkVuZXJneVR5cGUiLCJIZWF0VHJhbnNmZXJDb25zdGFudHMiLCJUZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yIiwiZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIiwiRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncyIsIkVuZXJneUNodW5rUGF0aE1vdmVyIiwiRW5lcmd5VXNlciIsIkJFQUtFUl9XSURUSCIsIkJFQUtFUl9IRUlHSFQiLCJCRUFLRVJfT0ZGU0VUIiwiSEVBVElOR19FTEVNRU5UX0VORVJHWV9DSFVOS19WRUxPQ0lUWSIsIkhFQVRFUl9FTEVNRU5UXzJEX0hFSUdIVCIsIk1BWF9IRUFUX0dFTkVSQVRJT05fUkFURSIsIkhFQVRfRU5FUkdZX0NIQU5HRV9SQVRFIiwiTEVGVF9TSURFX09GX1dJUkVfT0ZGU0VUIiwiV0lSRV9DVVJWRV9QT0lOVF8xX09GRlNFVCIsIldJUkVfQ1VSVkVfUE9JTlRfMl9PRkZTRVQiLCJXSVJFX0NVUlZFX1BPSU5UXzNfT0ZGU0VUIiwiV0lSRV9DVVJWRV9QT0lOVF80X09GRlNFVCIsIldJUkVfQ1VSVkVfUE9JTlRfNV9PRkZTRVQiLCJCT1RUT01fT0ZfQ09OTkVDVE9SX09GRlNFVCIsIkNPTlZFUlNJT05fUE9JTlRfT0ZGU0VUIiwiRUxFQ1RSSUNBTF9FTkVSR1lfQ0hVTktfT0ZGU0VUUyIsIkJlYWtlckhlYXRlciIsImNvbnN0cnVjdG9yIiwiZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5IiwiZW5lcmd5Q2h1bmtHcm91cCIsImVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAiLCJvcHRpb25zIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwaGV0aW9TdGF0ZSIsImExMXlOYW1lIiwiYTExeSIsImJlYWtlck9mV2F0ZXIiLCJoZWF0UHJvcG9ydGlvblByb3BlcnR5IiwicmFuZ2UiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb0hpZ2hGcmVxdWVuY3kiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzIiwicGhldGlvVHlwZSIsIk9ic2VydmFibGVBcnJheUlPIiwiRW5lcmd5Q2h1bmtQYXRoTW92ZXJJTyIsImhlYXRpbmdFbGVtZW50RW5lcmd5Q2h1bmtNb3ZlcnMiLCJyYWRpYXRlZEVuZXJneUNodW5rTW92ZXJzIiwicmFkaWF0ZWRFbmVyZ3lDaHVua0xpc3QiLCJFbmVyZ3lDaHVua0lPIiwid2F0ZXJCZWFrZXJUYW5kZW0iLCJiZWFrZXIiLCJwb3NpdGlvblByb3BlcnR5IiwidmFsdWUiLCJwbHVzIiwidXNlckNvbnRyb2xsYWJsZSIsInRoZXJtb21ldGVyIiwicmFuZG9tIiwibGluayIsInBvc2l0aW9uIiwic3RlcCIsImR0IiwiaW5jb21pbmdFbmVyZ3kiLCJhY3RpdmVQcm9wZXJ0eSIsImFzc2VydCIsInR5cGUiLCJFTEVDVFJJQ0FMIiwiaW5jb21pbmdFbmVyZ3lDaHVua3MiLCJsZW5ndGgiLCJmb3JFYWNoIiwiY2h1bmsiLCJlbmVyZ3lUeXBlUHJvcGVydHkiLCJlbmVyZ3lDaHVua0xpc3QiLCJwdXNoIiwiY3JlYXRlTmV4dEVsZW1lbnQiLCJjcmVhdGVQYXRoRnJvbU9mZnNldHMiLCJnZXQiLCJFTkVSR1lfQ0hVTktfVkVMT0NJVFkiLCJjbGVhciIsIm1vdmVFbGVjdHJpY2FsRW5lcmd5Q2h1bmtzIiwibW92ZVRoZXJtYWxFbmVyZ3lDaHVua3MiLCJjdXJyZW50SGVhdFByb3BvcnRpb24iLCJ0YXJnZXRIZWF0UHJvcG9ydGlvbiIsIk1hdGgiLCJwb3ciLCJFIiwic2V0IiwibWluIiwibWF4IiwiZW5lcmd5RnJhY3Rpb24iLCJhbW91bnQiLCJNQVhfRU5FUkdZX1BST0RVQ1RJT05fUkFURSIsImNoYW5nZUVuZXJneSIsInRlbXBlcmF0dXJlR3JhZGllbnQiLCJnZXRUZW1wZXJhdHVyZSIsIlJPT01fVEVNUEVSQVRVUkUiLCJhYnMiLCJURU1QRVJBVFVSRVNfRVFVQUxfVEhSRVNIT0xEIiwiYmVha2VyUmVjdCIsImdldFVudHJhbnNmb3JtZWRCb3VuZHMiLCJ0aGVybWFsQ29udGFjdEFyZWEiLCJ3aWR0aCIsImhlaWdodCIsImZsdWlkUHJvcG9ydGlvblByb3BlcnR5IiwidHJhbnNmZXJGYWN0b3IiLCJnZXRIZWF0VHJhbnNmZXJGYWN0b3IiLCJXQVRFUiIsIkFJUiIsInRoZXJtYWxFbmVyZ3lMb3N0IiwiZ2V0RW5lcmd5QmV5b25kTWF4VGVtcGVyYXR1cmUiLCJnZXRFbmVyZ3lDaHVua0JhbGFuY2UiLCJib3VuZHMiLCJnZXRCb3VuZHMiLCJleHRyYWN0aW9uUG9pbnQiLCJtaW5YIiwibmV4dERvdWJsZSIsIm1heFkiLCJlYyIsImV4dHJhY3RFbmVyZ3lDaHVua0Nsb3Nlc3RUb1BvaW50IiwielBvc2l0aW9uUHJvcGVydHkiLCJjcmVhdGVSYWRpYXRlZFBhdGgiLCJtb3ZlUmFkaWF0ZWRFbmVyZ3lDaHVua3MiLCJ1cGRhdGVUZW1wZXJhdHVyZUFuZENvbG9yQW5kTmFtZUF0UG9zaXRpb24iLCJzZW5zZWRUZW1wZXJhdHVyZVByb3BlcnR5Iiwic2Vuc2VkRWxlbWVudENvbG9yUHJvcGVydHkiLCJzZW5zZWRFbGVtZW50TmFtZVByb3BlcnR5IiwieCIsInkiLCJXQVRFUl9DT0xPUl9PUEFRVUUiLCJwaGV0aW9JRCIsIm1vdmVycyIsInNsaWNlIiwibW92ZXIiLCJtb3ZlQWxvbmdQYXRoIiwicGF0aEZ1bGx5VHJhdmVyc2VkIiwicmVtb3ZlIiwiZW5lcmd5Q2h1bmsiLCJkaXNwb3NlRWxlbWVudCIsImFkZEVuZXJneUNodW5rIiwiVEhFUk1BTCIsImNyZWF0ZUhlYXRlckVsZW1lbnRFbmVyZ3lDaHVua1BhdGgiLCJwcmVsb2FkRW5lcmd5Q2h1bmtzIiwiaW5jb21pbmdFbmVyZ3lSYXRlIiwiY2xlYXJFbmVyZ3lDaHVua3MiLCJGUkFNRVNfUEVSX1NFQ09ORCIsImVuZXJneVNpbmNlTGFzdENodW5rIiwiRU5FUkdZX1BFUl9DSFVOSyIsInByZWxvYWRDb21wbGV0ZSIsIm5ld0VuZXJneUNodW5rIiwiWkVSTyIsImRlYWN0aXZhdGUiLCJyZXNldCIsInN0YXJ0aW5nUG9pbnQiLCJwYXRoIiwiYW5nbGVTcGFuIiwiUEkiLCJhbmdsZSIsInRyYXZlbERpc3RhbmNlIiwiY29zIiwicm90YXRlZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmVha2VySGVhdGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIG1vZGVsIG9mIGEgaGVhdGluZyBlbGVtZW50IHdpdGggYSBiZWFrZXIgb24gaXRcclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvUmVmZXJlbmNlSU8uanMnO1xyXG5pbXBvcnQgd2F0ZXJJY29uX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvd2F0ZXJJY29uX3BuZy5qcyc7XHJcbmltcG9ydCBFRkFDQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9FRkFDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJlYWtlciBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQmVha2VyLmpzJztcclxuaW1wb3J0IEVuZXJneUNodW5rIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9FbmVyZ3lDaHVuay5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDb250YWluZXJDYXRlZ29yeSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRW5lcmd5Q29udGFpbmVyQ2F0ZWdvcnkuanMnO1xyXG5pbXBvcnQgRW5lcmd5VHlwZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRW5lcmd5VHlwZS5qcyc7XHJcbmltcG9ydCBIZWF0VHJhbnNmZXJDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0hlYXRUcmFuc2ZlckNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBUZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9UZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yLmpzJztcclxuaW1wb3J0IGVuZXJneUZvcm1zQW5kQ2hhbmdlcyBmcm9tICcuLi8uLi9lbmVyZ3lGb3Jtc0FuZENoYW5nZXMuanMnO1xyXG5pbXBvcnQgRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncyBmcm9tICcuLi8uLi9FbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IEVuZXJneUNodW5rUGF0aE1vdmVyIGZyb20gJy4vRW5lcmd5Q2h1bmtQYXRoTW92ZXIuanMnO1xyXG5pbXBvcnQgRW5lcmd5VXNlciBmcm9tICcuL0VuZXJneVVzZXIuanMnO1xyXG5cclxuLy8gcG9zaXRpb24gYW5kIHNpemUgY29uc3RhbnRzLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbmNvbnN0IEJFQUtFUl9XSURUSCA9IDAuMDc1OyAvLyBJbiBtZXRlcnMuXHJcbmNvbnN0IEJFQUtFUl9IRUlHSFQgPSBCRUFLRVJfV0lEVEggKiAxLjE7XHJcbmNvbnN0IEJFQUtFUl9PRkZTRVQgPSBuZXcgVmVjdG9yMiggMCwgMC4wMTYgKTtcclxuY29uc3QgSEVBVElOR19FTEVNRU5UX0VORVJHWV9DSFVOS19WRUxPQ0lUWSA9IDAuMDA3NTsgLy8gaW4gbWV0ZXJzL3NlYywgcXVpdGUgc2xvd1xyXG5jb25zdCBIRUFURVJfRUxFTUVOVF8yRF9IRUlHSFQgPSAwLjAyNzsgLy8gaGVpZ2h0IG9mIGltYWdlXHJcbmNvbnN0IE1BWF9IRUFUX0dFTkVSQVRJT05fUkFURSA9IDUwMDA7IC8vIEpvdWxlcy9zZWMsIG5vdCBjb25uZWN0ZWQgdG8gaW5jb21pbmcgZW5lcmd5XHJcbmNvbnN0IEhFQVRfRU5FUkdZX0NIQU5HRV9SQVRFID0gMC41OyAvLyBpbiBwcm9wb3J0aW9uIHBlciBzZWNvbmRcclxuXHJcbi8vIGVuZXJneSBjaHVuayBwYXRoIG9mZnNldHMsIGVtcGlyaWNhbGx5IGRldGVybWluZWQgc3VjaCB0aGF0IHRoZXkgbW92ZSB0aHJvdWdoIHRoZSB2aWV3IGluIGEgd2F5IHRoYXQgbG9va3MgZ29vZFxyXG5jb25zdCBMRUZUX1NJREVfT0ZfV0lSRV9PRkZTRVQgPSBuZXcgVmVjdG9yMiggLTAuMDQsIC0wLjA0MSApO1xyXG5jb25zdCBXSVJFX0NVUlZFX1BPSU5UXzFfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIC0wLjAyLCAtMC4wNDEgKTtcclxuY29uc3QgV0lSRV9DVVJWRV9QT0lOVF8yX09GRlNFVCA9IG5ldyBWZWN0b3IyKCAtMC4wMTUsIC0wLjA0ICk7XHJcbmNvbnN0IFdJUkVfQ1VSVkVfUE9JTlRfM19PRkZTRVQgPSBuZXcgVmVjdG9yMiggLTAuMDA1LCAtMC4wMzQgKTtcclxuY29uc3QgV0lSRV9DVVJWRV9QT0lOVF80X09GRlNFVCA9IG5ldyBWZWN0b3IyKCAtMC4wMDEsIC0wLjAyNyApO1xyXG5jb25zdCBXSVJFX0NVUlZFX1BPSU5UXzVfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIC0wLjAwMDMsIC0wLjAyICk7XHJcbmNvbnN0IEJPVFRPTV9PRl9DT05ORUNUT1JfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIC0wLjAwMDMsIC0wLjAxICk7XHJcbmNvbnN0IENPTlZFUlNJT05fUE9JTlRfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIDAsIDAuMDAzICk7XHJcbmNvbnN0IEVMRUNUUklDQUxfRU5FUkdZX0NIVU5LX09GRlNFVFMgPSBbXHJcbiAgV0lSRV9DVVJWRV9QT0lOVF8xX09GRlNFVCxcclxuICBXSVJFX0NVUlZFX1BPSU5UXzJfT0ZGU0VULFxyXG4gIFdJUkVfQ1VSVkVfUE9JTlRfM19PRkZTRVQsXHJcbiAgV0lSRV9DVVJWRV9QT0lOVF80X09GRlNFVCxcclxuICBXSVJFX0NVUlZFX1BPSU5UXzVfT0ZGU0VULFxyXG4gIEJPVFRPTV9PRl9DT05ORUNUT1JfT0ZGU0VULFxyXG4gIENPTlZFUlNJT05fUE9JTlRfT0ZGU0VUXHJcbl07XHJcblxyXG5jbGFzcyBCZWFrZXJIZWF0ZXIgZXh0ZW5kcyBFbmVyZ3lVc2VyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCb29sZWFuUHJvcGVydHl9IGVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7RW5lcmd5Q2h1bmtHcm91cH0gZW5lcmd5Q2h1bmtHcm91cFxyXG4gICAqIEBwYXJhbSB7RW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cH0gZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICBlbmVyZ3lDaHVua0dyb3VwLFxyXG4gICAgICAgICAgICAgICBlbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLFxyXG4gICAgICAgICAgICAgICBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlIC8vIG5vIGludGVybmFsIGZpZWxkcyB0byBjb252ZXkgaW4gc3RhdGVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggbmV3IEltYWdlKCB3YXRlckljb25fcG5nICksIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtzdHJpbmd9IC0gYTExeSBuYW1lXHJcbiAgICB0aGlzLmExMXlOYW1lID0gRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncy5hMTF5LmJlYWtlck9mV2F0ZXI7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5ID0gZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5O1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua0dyb3VwID0gZW5lcmd5Q2h1bmtHcm91cDtcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCA9IGVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXA7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7TnVtYmVyUHJvcGVydHl9XHJcbiAgICB0aGlzLmhlYXRQcm9wb3J0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMSApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2hlYXRQcm9wb3J0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAncHJvcG9ydGlvbiBvZiBob3cgbXVjaCBoZWF0IHRoZSBjb2lscyBoYXZlJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtPYnNlcnZhYmxlQXJyYXlEZWYuPEVuZXJneUNodW5rUGF0aE1vdmVyPn0gLSBhcnJheXMgdGhhdCBtb3ZlIHRoZSBlbmVyZ3kgY2h1bmtzIGFzIHRoZXkgbW92ZSBpbnRvLCB3aXRoaW4sIGFuZCBvdXQgb2YgdGhlXHJcbiAgICAvLyBiZWFrZXJcclxuICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5SU8oIFJlZmVyZW5jZUlPKCBFbmVyZ3lDaHVua1BhdGhNb3Zlci5FbmVyZ3lDaHVua1BhdGhNb3ZlcklPICkgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5oZWF0aW5nRWxlbWVudEVuZXJneUNodW5rTW92ZXJzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaGVhdGluZ0VsZW1lbnRFbmVyZ3lDaHVua01vdmVycycgKSxcclxuICAgICAgcGhldGlvVHlwZTogY3JlYXRlT2JzZXJ2YWJsZUFycmF5Lk9ic2VydmFibGVBcnJheUlPKCBSZWZlcmVuY2VJTyggRW5lcmd5Q2h1bmtQYXRoTW92ZXIuRW5lcmd5Q2h1bmtQYXRoTW92ZXJJTyApIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMucmFkaWF0ZWRFbmVyZ3lDaHVua01vdmVycyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JhZGlhdGVkRW5lcmd5Q2h1bmtNb3ZlcnMnICksXHJcbiAgICAgIHBoZXRpb1R5cGU6IGNyZWF0ZU9ic2VydmFibGVBcnJheS5PYnNlcnZhYmxlQXJyYXlJTyggUmVmZXJlbmNlSU8oIEVuZXJneUNodW5rUGF0aE1vdmVyLkVuZXJneUNodW5rUGF0aE1vdmVySU8gKSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7T2JzZXJ2YWJsZUFycmF5RGVmfSAtIGVuZXJneSBjaHVua3MgdGhhdCBhcmUgcmFkaWF0ZWQgYnkgdGhpcyBiZWFrZXJcclxuICAgIHRoaXMucmFkaWF0ZWRFbmVyZ3lDaHVua0xpc3QgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyYWRpYXRlZEVuZXJneUNodW5rTGlzdCcgKSxcclxuICAgICAgcGhldGlvVHlwZTogY3JlYXRlT2JzZXJ2YWJsZUFycmF5Lk9ic2VydmFibGVBcnJheUlPKCBSZWZlcmVuY2VJTyggRW5lcmd5Q2h1bmsuRW5lcmd5Q2h1bmtJTyApIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VGFuZGVtfSAtIHVzZWQgZm9yIGluc3RydW1lbnRpbmcgdGhlIHdhdGVyIGJlYWtlciBhbmQgdGhlIHRoZXJtb21ldGVyJ3Mgc2Vuc2VkRWxlbWVudE5hbWVQcm9wZXJ0eVxyXG4gICAgdGhpcy53YXRlckJlYWtlclRhbmRlbSA9IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3dhdGVyQmVha2VyJyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0JlYWtlcn0gKHJlYWQtb25seSkgLSBub3RlIHRoYXQgdGhlIHBvc2l0aW9uIGlzIGFic29sdXRlLCBub3QgcmVsYXRpdmUgdG8gdGhlIFwicGFyZW50XCIgbW9kZWwgZWxlbWVudFxyXG4gICAgdGhpcy5iZWFrZXIgPSBuZXcgQmVha2VyKFxyXG4gICAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1cyggQkVBS0VSX09GRlNFVCApLFxyXG4gICAgICBCRUFLRVJfV0lEVEgsXHJcbiAgICAgIEJFQUtFUl9IRUlHSFQsXHJcbiAgICAgIGVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgZW5lcmd5Q2h1bmtHcm91cCwge1xyXG4gICAgICAgIHRhbmRlbTogdGhpcy53YXRlckJlYWtlclRhbmRlbSxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnYmVha2VyIHRoYXQgY29udGFpbnMgd2F0ZXInLFxyXG4gICAgICAgIHVzZXJDb250cm9sbGFibGU6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvcn0gKHJlYWQtb25seSlcclxuICAgIHRoaXMudGhlcm1vbWV0ZXIgPSBuZXcgVGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvcihcclxuICAgICAgdGhpcyxcclxuICAgICAgbmV3IFZlY3RvcjIoIEJFQUtFUl9XSURUSCAqIDAuNDUsIEJFQUtFUl9IRUlHSFQgKiAwLjYgKSwgLy8gcG9zaXRpb24gaXMgcmVsYXRpdmUsIG5vdCBhYnNvbHV0ZVxyXG4gICAgICB0cnVlLCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aGVybW9tZXRlcicgKSxcclxuICAgICAgICB1c2VyQ29udHJvbGxhYmxlOiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlLCBmb3IgY29udmVuaWVuY2VcclxuICAgIHRoaXMucmFuZG9tID0gZG90UmFuZG9tO1xyXG5cclxuICAgIC8vIG1vdmUgdGhlIGJlYWtlciBhcyB0aGUgb3ZlcmFsbCBwb3NpdGlvbiBjaGFuZ2VzXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICB0aGlzLmJlYWtlci5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gcG9zaXRpb24ucGx1cyggQkVBS0VSX09GRlNFVCApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEBwYXJhbSAge0VuZXJneX0gaW5jb21pbmdFbmVyZ3lcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgc3RlcCggZHQsIGluY29taW5nRW5lcmd5ICkge1xyXG4gICAgaWYgKCAhdGhpcy5hY3RpdmVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoaXMgaXNuJ3QgZGVzaWduZWQgdG8gdGFrZSBpbiBhbnl0aGluZyBvdGhlciB0aGFuIGVsZWN0cmljYWwgZW5lcmd5LCBzbyBtYWtlIHN1cmUgdGhhdCdzIHdoYXQgd2UndmUgZ290XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmNvbWluZ0VuZXJneS50eXBlID09PSBFbmVyZ3lUeXBlLkVMRUNUUklDQUwsIGB1bmV4cGVjdGVkIGVuZXJneSB0eXBlOiAke2luY29taW5nRW5lcmd5LnR5cGV9YCApO1xyXG5cclxuICAgIC8vIGhhbmRsZSBhbnkgaW5jb21pbmcgZW5lcmd5IGNodW5rc1xyXG4gICAgaWYgKCB0aGlzLmluY29taW5nRW5lcmd5Q2h1bmtzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgIHRoaXMuaW5jb21pbmdFbmVyZ3lDaHVua3MuZm9yRWFjaCggY2h1bmsgPT4ge1xyXG5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICAgICAgY2h1bmsuZW5lcmd5VHlwZVByb3BlcnR5LnZhbHVlID09PSBFbmVyZ3lUeXBlLkVMRUNUUklDQUwsXHJcbiAgICAgICAgICBgRW5lcmd5IGNodW5rIHR5cGUgc2hvdWxkIGJlIEVMRUNUUklDQUwgYnV0IGlzICR7Y2h1bmsuZW5lcmd5VHlwZVByb3BlcnR5LnZhbHVlfWBcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBhZGQgdGhlIGVuZXJneSBjaHVuayB0byB0aGUgbGlzdCBvZiB0aG9zZSB1bmRlciBtYW5hZ2VtZW50XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QucHVzaCggY2h1bmsgKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIGEgXCJtb3ZlclwiIHRoYXQgd2lsbCBtb3ZlIHRoaXMgZW5lcmd5IGNodW5rIHRocm91Z2ggdGhlIHdpcmUgdG8gdGhlIGhlYXRpbmcgZWxlbWVudFxyXG4gICAgICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzLnB1c2goIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggY2h1bmssXHJcbiAgICAgICAgICBFbmVyZ3lDaHVua1BhdGhNb3Zlci5jcmVhdGVQYXRoRnJvbU9mZnNldHMoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSwgRUxFQ1RSSUNBTF9FTkVSR1lfQ0hVTktfT0ZGU0VUUyApLFxyXG4gICAgICAgICAgRUZBQ0NvbnN0YW50cy5FTkVSR1lfQ0hVTktfVkVMT0NJVFkgKSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBjbGVhciBpbmNvbWluZyBjaHVua3MgYXJyYXlcclxuICAgICAgdGhpcy5pbmNvbWluZ0VuZXJneUNodW5rcy5jbGVhcigpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tb3ZlRWxlY3RyaWNhbEVuZXJneUNodW5rcyggZHQgKTtcclxuICAgIHRoaXMubW92ZVRoZXJtYWxFbmVyZ3lDaHVua3MoIGR0ICk7XHJcblxyXG5cclxuICAgIC8vIHNldCB0aGUgcHJvcG9ydGlvbiBvZiBtYXggaGVhdCBiZWluZyBnZW5lcmF0ZWQgYnkgdGhlIGhlYXRlciBlbGVtZW50XHJcbiAgICBpZiAoIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgLy8gRW5lcmd5IGNodW5rcyBhcmUgdmlzaWJsZSwgc28gc2V0IHRoZSBoZWF0IGxldmVsIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgdGhlbSB0aGF0IGFyZSBvbiB0aGUgYnVybmVyLiAgVGhpc1xyXG4gICAgICAvLyBjYWxjdWxhdGlvbiB1c2VzIGEgc2hpZnRlZCBzaWdtb2lkIGZ1bmN0aW9uIHNvIHRoYXQgaXQgd2lsbCBhc3ltcHRvdGljYWxseSBhcHByb2FjaCBvbmUgYXMgbW9yZSBlbmVyZ3kgY2h1bmtzXHJcbiAgICAgIC8vIGFyZSBwcmVzZW50LiAgSXQgd2FzIGVtcGlyaWNhbGx5IGRldGVybWluZWQgYnkgbG9va2luZyBhdCB0aGUgaW5jb21pbmcgZW5lcmd5IHJhdGUgdmVyc3VzIHRoZSBudW1iZXIgb2YgZW5lcmd5XHJcbiAgICAgIC8vIGNodW5rcyBwcmVzZW50IHdoZW4gdGhlIHN5c3RlbSBoYXMgYmVlbiBwcm9kdWNpbmcgZW5lcmd5IHN0ZWFkaWx5IGZvciBsb25nIGVub3VnaCB0aGF0IHRoZSBlbmVyZ3kgY2h1bmtzIGhhdmVcclxuICAgICAgLy8gcHJvcGFnYXRlZCBhbGwgdGhlIHdheSB0aHJvdWdoLlxyXG4gICAgICBjb25zdCBjdXJyZW50SGVhdFByb3BvcnRpb24gPSB0aGlzLmhlYXRQcm9wb3J0aW9uUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIGNvbnN0IHRhcmdldEhlYXRQcm9wb3J0aW9uID0gMiAvICggMSArIE1hdGgucG93KCBNYXRoLkUsIC10aGlzLmhlYXRpbmdFbGVtZW50RW5lcmd5Q2h1bmtNb3ZlcnMubGVuZ3RoICkgKSAtIDE7XHJcbiAgICAgIGlmICggdGFyZ2V0SGVhdFByb3BvcnRpb24gPiBjdXJyZW50SGVhdFByb3BvcnRpb24gKSB7XHJcbiAgICAgICAgdGhpcy5oZWF0UHJvcG9ydGlvblByb3BlcnR5LnNldChcclxuICAgICAgICAgIE1hdGgubWluKCB0YXJnZXRIZWF0UHJvcG9ydGlvbiwgY3VycmVudEhlYXRQcm9wb3J0aW9uICsgSEVBVF9FTkVSR1lfQ0hBTkdFX1JBVEUgKiBkdCApXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGFyZ2V0SGVhdFByb3BvcnRpb24gPCBjdXJyZW50SGVhdFByb3BvcnRpb24gKSB7XHJcbiAgICAgICAgdGhpcy5oZWF0UHJvcG9ydGlvblByb3BlcnR5LnNldChcclxuICAgICAgICAgIE1hdGgubWF4KCB0YXJnZXRIZWF0UHJvcG9ydGlvbiwgY3VycmVudEhlYXRQcm9wb3J0aW9uIC0gSEVBVF9FTkVSR1lfQ0hBTkdFX1JBVEUgKiBkdCApXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBzZXQgdGhlIGhlYXQgcHJvcG9ydGlvbiBiYXNlZCBvbiB0aGUgaW5jb21pbmcgZW5lcmd5IGFtb3VudCwgYnV0IG1vZGVyYXRlIHRoZSByYXRlIGF0IHdoaWNoIGl0IGNoYW5nZXNcclxuICAgICAgY29uc3QgZW5lcmd5RnJhY3Rpb24gPSBpbmNvbWluZ0VuZXJneS5hbW91bnQgLyAoIEVGQUNDb25zdGFudHMuTUFYX0VORVJHWV9QUk9EVUNUSU9OX1JBVEUgKiBkdCApO1xyXG4gICAgICB0aGlzLmhlYXRQcm9wb3J0aW9uUHJvcGVydHkuc2V0KFxyXG4gICAgICAgIE1hdGgubWluKCBlbmVyZ3lGcmFjdGlvbiwgdGhpcy5oZWF0UHJvcG9ydGlvblByb3BlcnR5LnZhbHVlICsgSEVBVF9FTkVSR1lfQ0hBTkdFX1JBVEUgKiBkdCApXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIGVuZXJneSB0byB0aGUgYmVha2VyIGJhc2VkIG9uIGhlYXQgY29taW5nIGZyb20gaGVhdCBlbGVtZW50XHJcbiAgICB0aGlzLmJlYWtlci5jaGFuZ2VFbmVyZ3koIHRoaXMuaGVhdFByb3BvcnRpb25Qcm9wZXJ0eS52YWx1ZSAqIE1BWF9IRUFUX0dFTkVSQVRJT05fUkFURSAqIGR0ICk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGVuZXJneSBmcm9tIHRoZSBiZWFrZXIgYmFzZWQgb24gbG9zcyBvZiBoZWF0IHRvIHRoZSBzdXJyb3VuZGluZyBhaXJcclxuICAgIGNvbnN0IHRlbXBlcmF0dXJlR3JhZGllbnQgPSB0aGlzLmJlYWtlci5nZXRUZW1wZXJhdHVyZSgpIC0gRUZBQ0NvbnN0YW50cy5ST09NX1RFTVBFUkFUVVJFO1xyXG4gICAgaWYgKCBNYXRoLmFicyggdGVtcGVyYXR1cmVHcmFkaWVudCApID4gRUZBQ0NvbnN0YW50cy5URU1QRVJBVFVSRVNfRVFVQUxfVEhSRVNIT0xEICkge1xyXG4gICAgICBjb25zdCBiZWFrZXJSZWN0ID0gdGhpcy5iZWFrZXIuZ2V0VW50cmFuc2Zvcm1lZEJvdW5kcygpO1xyXG4gICAgICBjb25zdCB0aGVybWFsQ29udGFjdEFyZWEgPSAoIGJlYWtlclJlY3Qud2lkdGggKiAyICkgKyAoIGJlYWtlclJlY3QuaGVpZ2h0ICogMiApICogdGhpcy5iZWFrZXIuZmx1aWRQcm9wb3J0aW9uUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIGNvbnN0IHRyYW5zZmVyRmFjdG9yID0gSGVhdFRyYW5zZmVyQ29uc3RhbnRzLmdldEhlYXRUcmFuc2ZlckZhY3RvcihcclxuICAgICAgICBFbmVyZ3lDb250YWluZXJDYXRlZ29yeS5XQVRFUiwgRW5lcmd5Q29udGFpbmVyQ2F0ZWdvcnkuQUlSICk7XHJcbiAgICAgIGNvbnN0IHRoZXJtYWxFbmVyZ3lMb3N0ID0gdGVtcGVyYXR1cmVHcmFkaWVudCAqIHRyYW5zZmVyRmFjdG9yICogdGhlcm1hbENvbnRhY3RBcmVhICogZHQ7XHJcblxyXG4gICAgICB0aGlzLmJlYWtlci5jaGFuZ2VFbmVyZ3koIC10aGVybWFsRW5lcmd5TG9zdCApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLmJlYWtlci5nZXRFbmVyZ3lCZXlvbmRNYXhUZW1wZXJhdHVyZSgpID4gMCApIHtcclxuICAgICAgICAvLyBQcmV2ZW50IHRoZSB3YXRlciBmcm9tIGdvaW5nIGJleW9uZCB0aGUgYm9pbGluZyBwb2ludC5cclxuICAgICAgICB0aGlzLmJlYWtlci5jaGFuZ2VFbmVyZ3koIC10aGlzLmJlYWtlci5nZXRFbmVyZ3lCZXlvbmRNYXhUZW1wZXJhdHVyZSgpICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmJlYWtlci5zdGVwKCBkdCApO1xyXG5cclxuICAgIGlmICggdGhpcy5iZWFrZXIuZ2V0RW5lcmd5Q2h1bmtCYWxhbmNlKCkgPiAwICkge1xyXG5cclxuICAgICAgLy8gcmVtb3ZlIGFuIGVuZXJneSBjaHVuayBmcm9tIHRoZSBiZWFrZXIgYW5kIHN0YXJ0IGl0IGZsb2F0aW5nIGF3YXksIGEuay5hLiBtYWtlIGl0IFwicmFkaWF0ZVwiXHJcbiAgICAgIGNvbnN0IGJvdW5kcyA9IHRoaXMuYmVha2VyLmdldEJvdW5kcygpO1xyXG4gICAgICBjb25zdCBleHRyYWN0aW9uUG9pbnQgPSBuZXcgVmVjdG9yMiggYm91bmRzLm1pblggKyBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogYm91bmRzLndpZHRoLCBib3VuZHMubWF4WSApO1xyXG4gICAgICBjb25zdCBlYyA9IHRoaXMuYmVha2VyLmV4dHJhY3RFbmVyZ3lDaHVua0Nsb3Nlc3RUb1BvaW50KCBleHRyYWN0aW9uUG9pbnQgKTtcclxuXHJcbiAgICAgIGlmICggZWMgKSB7XHJcbiAgICAgICAgZWMuelBvc2l0aW9uUHJvcGVydHkuc2V0KCAwICk7IC8vIG1vdmUgdG8gZnJvbnQgb2YgeiBvcmRlclxyXG4gICAgICAgIHRoaXMucmFkaWF0ZWRFbmVyZ3lDaHVua0xpc3QucHVzaCggZWMgKTtcclxuICAgICAgICB0aGlzLnJhZGlhdGVkRW5lcmd5Q2h1bmtNb3ZlcnMucHVzaChcclxuICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudChcclxuICAgICAgICAgICAgZWMsXHJcbiAgICAgICAgICAgIEVuZXJneUNodW5rUGF0aE1vdmVyLmNyZWF0ZVJhZGlhdGVkUGF0aCggZWMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSwgMCApLFxyXG4gICAgICAgICAgICBFRkFDQ29uc3RhbnRzLkVORVJHWV9DSFVOS19WRUxPQ0lUWVxyXG4gICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1vdmVSYWRpYXRlZEVuZXJneUNodW5rcyggZHQgKTtcclxuXHJcbiAgICAvLyBzdGVwIHN1Yi1lbGVtZW50c1xyXG4gICAgdGhpcy50aGVybW9tZXRlci5zdGVwKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiB1cGRhdGUgdGhlIHRlbXBlcmF0dXJlIGFuZCBjb2xvciBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIHdpdGhpbiB0aGUgYmVha2VyXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uIC0gcG9zaXRpb24gdG8gYmUgc2Vuc2VkXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48bnVtYmVyPn0gc2Vuc2VkVGVtcGVyYXR1cmVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPENvbG9yPn0gc2Vuc2VkRWxlbWVudENvbG9yUHJvcGVydHlcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlVGVtcGVyYXR1cmVBbmRDb2xvckFuZE5hbWVBdFBvc2l0aW9uKFxyXG4gICAgcG9zaXRpb24sXHJcbiAgICBzZW5zZWRUZW1wZXJhdHVyZVByb3BlcnR5LFxyXG4gICAgc2Vuc2VkRWxlbWVudENvbG9yUHJvcGVydHksXHJcbiAgICBzZW5zZWRFbGVtZW50TmFtZVByb3BlcnR5XHJcbiAgKSB7XHJcblxyXG4gICAgLy8gdmFsaWRhdGUgdGhhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIGlzIGluc2lkZSB0aGUgYmVha2VyLCBzaW5jZSB0aGF0J3MgdGhlIG9ubHkgc3VwcG9ydGVkIHBvc2l0aW9uXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgcG9zaXRpb24ueCA+PSBCRUFLRVJfT0ZGU0VULnggLSBCRUFLRVJfV0lEVEggLyAyICYmIHBvc2l0aW9uLnggPD0gQkVBS0VSX09GRlNFVC54ICsgQkVBS0VSX1dJRFRIIC8gMixcclxuICAgICAgJ3Bvc2l0aW9uIGlzIG5vdCBpbnNpZGUgb2YgYmVha2VyJ1xyXG4gICAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICBwb3NpdGlvbi55ID49IEJFQUtFUl9PRkZTRVQueSAtIEJFQUtFUl9IRUlHSFQgLyAyICYmIHBvc2l0aW9uLnkgPD0gQkVBS0VSX09GRlNFVC55ICsgQkVBS0VSX0hFSUdIVCAvIDIsXHJcbiAgICAgICdwb3NpdGlvbiBpcyBub3QgaW5zaWRlIG9mIGJlYWtlcidcclxuICAgICk7XHJcblxyXG4gICAgc2Vuc2VkVGVtcGVyYXR1cmVQcm9wZXJ0eS5zZXQoIHRoaXMuYmVha2VyLmdldFRlbXBlcmF0dXJlKCkgKTtcclxuICAgIHNlbnNlZEVsZW1lbnRDb2xvclByb3BlcnR5LnNldCggRUZBQ0NvbnN0YW50cy5XQVRFUl9DT0xPUl9PUEFRVUUgKTtcclxuICAgIHNlbnNlZEVsZW1lbnROYW1lUHJvcGVydHkuc2V0KCB0aGlzLndhdGVyQmVha2VyVGFuZGVtLnBoZXRpb0lEICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBtb3ZlUmFkaWF0ZWRFbmVyZ3lDaHVua3MoIGR0ICkge1xyXG4gICAgY29uc3QgbW92ZXJzID0gdGhpcy5yYWRpYXRlZEVuZXJneUNodW5rTW92ZXJzLnNsaWNlKCk7XHJcblxyXG4gICAgbW92ZXJzLmZvckVhY2goIG1vdmVyID0+IHtcclxuICAgICAgbW92ZXIubW92ZUFsb25nUGF0aCggZHQgKTtcclxuXHJcbiAgICAgIGlmICggbW92ZXIucGF0aEZ1bGx5VHJhdmVyc2VkICkge1xyXG5cclxuICAgICAgICAvLyByZW1vdmUgdGhpcyBlbmVyZ3kgY2h1bmsgZW50aXJlbHlcclxuICAgICAgICB0aGlzLnJhZGlhdGVkRW5lcmd5Q2h1bmtMaXN0LnJlbW92ZSggbW92ZXIuZW5lcmd5Q2h1bmsgKTtcclxuICAgICAgICB0aGlzLnJhZGlhdGVkRW5lcmd5Q2h1bmtNb3ZlcnMucmVtb3ZlKCBtb3ZlciApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIuZW5lcmd5Q2h1bmsgKTtcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuZGlzcG9zZUVsZW1lbnQoIG1vdmVyICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gZHQgLSB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG1vdmVUaGVybWFsRW5lcmd5Q2h1bmtzKCBkdCApIHtcclxuICAgIGNvbnN0IG1vdmVycyA9IHRoaXMuaGVhdGluZ0VsZW1lbnRFbmVyZ3lDaHVua01vdmVycy5zbGljZSgpO1xyXG5cclxuICAgIG1vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB7XHJcbiAgICAgIG1vdmVyLm1vdmVBbG9uZ1BhdGgoIGR0ICk7XHJcblxyXG4gICAgICBpZiAoIG1vdmVyLnBhdGhGdWxseVRyYXZlcnNlZCApIHtcclxuXHJcbiAgICAgICAgLy8gVGhpcyBjaHVuayBpcyByZWFkeSB0byBtb3ZlIHRvIHRoZSBiZWFrZXIuICBXZSByZW1vdmUgaXQgZnJvbSBoZXJlLCBhbmQgdGhlIGJlYWtlciB0YWtlcyBvdmVyIG1hbmFnZW1lbnQgb2ZcclxuICAgICAgICAvLyB0aGUgY2h1bmsuXHJcbiAgICAgICAgdGhpcy5iZWFrZXIuYWRkRW5lcmd5Q2h1bmsoIG1vdmVyLmVuZXJneUNodW5rICk7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QucmVtb3ZlKCBtb3Zlci5lbmVyZ3lDaHVuayApO1xyXG4gICAgICAgIHRoaXMuaGVhdGluZ0VsZW1lbnRFbmVyZ3lDaHVua01vdmVycy5yZW1vdmUoIG1vdmVyICk7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmRpc3Bvc2VFbGVtZW50KCBtb3ZlciApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBtb3ZlRWxlY3RyaWNhbEVuZXJneUNodW5rcyggZHQgKSB7XHJcbiAgICBjb25zdCBtb3ZlcnMgPSB0aGlzLmVsZWN0cmljYWxFbmVyZ3lDaHVua01vdmVycy5zbGljZSgpO1xyXG5cclxuICAgIG1vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB7XHJcbiAgICAgIG1vdmVyLm1vdmVBbG9uZ1BhdGgoIGR0ICk7XHJcblxyXG4gICAgICBpZiAoIG1vdmVyLnBhdGhGdWxseVRyYXZlcnNlZCApIHtcclxuXHJcbiAgICAgICAgLy8gdGhlIGVsZWN0cmljYWwgZW5lcmd5IGNodW5rIGhhcyByZWFjaGVkIHRoZSBidXJuZXIsIHNvIGl0IG5lZWRzIHRvIGNoYW5nZSBpbnRvIHRoZXJtYWwgZW5lcmd5XHJcbiAgICAgICAgdGhpcy5lbGVjdHJpY2FsRW5lcmd5Q2h1bmtNb3ZlcnMucmVtb3ZlKCBtb3ZlciApO1xyXG4gICAgICAgIG1vdmVyLmVuZXJneUNodW5rLmVuZXJneVR5cGVQcm9wZXJ0eS5zZXQoIEVuZXJneVR5cGUuVEhFUk1BTCApO1xyXG5cclxuICAgICAgICAvLyBoYXZlIHRoZSB0aGVybWFsIGVuZXJneSBtb3ZlIGEgbGl0dGxlIG9uIHRoZSBlbGVtZW50IGJlZm9yZSBtb3ZpbmcgaW50byB0aGUgYmVha2VyXHJcbiAgICAgICAgdGhpcy5oZWF0aW5nRWxlbWVudEVuZXJneUNodW5rTW92ZXJzLnB1c2goIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggbW92ZXIuZW5lcmd5Q2h1bmssXHJcbiAgICAgICAgICB0aGlzLmNyZWF0ZUhlYXRlckVsZW1lbnRFbmVyZ3lDaHVua1BhdGgoIG1vdmVyLmVuZXJneUNodW5rLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSxcclxuICAgICAgICAgIEhFQVRJTkdfRUxFTUVOVF9FTkVSR1lfQ0hVTktfVkVMT0NJVFkgKSApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtICB7RW5lcmd5fSBpbmNvbWluZ0VuZXJneVJhdGVcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgcHJlbG9hZEVuZXJneUNodW5rcyggaW5jb21pbmdFbmVyZ3lSYXRlICkge1xyXG4gICAgdGhpcy5jbGVhckVuZXJneUNodW5rcygpO1xyXG5cclxuICAgIGlmICggaW5jb21pbmdFbmVyZ3lSYXRlLmFtb3VudCA9PT0gMCB8fCBpbmNvbWluZ0VuZXJneVJhdGUudHlwZSAhPT0gRW5lcmd5VHlwZS5FTEVDVFJJQ0FMICkge1xyXG4gICAgICAvLyBubyBlbmVyZ3kgY2h1bmsgcHJlLWxvYWRpbmcgbmVlZGVkXHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkdCA9IDEgLyBFRkFDQ29uc3RhbnRzLkZSQU1FU19QRVJfU0VDT05EO1xyXG4gICAgbGV0IGVuZXJneVNpbmNlTGFzdENodW5rID0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LICogMC45OTtcclxuXHJcbiAgICAvLyBzaW11bGF0ZSBlbmVyZ3kgY2h1bmtzIG1vdmluZyB0aHJvdWdoIHRoZSBzeXN0ZW1cclxuICAgIGxldCBwcmVsb2FkQ29tcGxldGUgPSBmYWxzZTtcclxuICAgIHdoaWxlICggIXByZWxvYWRDb21wbGV0ZSApIHtcclxuICAgICAgZW5lcmd5U2luY2VMYXN0Q2h1bmsgKz0gaW5jb21pbmdFbmVyZ3lSYXRlLmFtb3VudCAqIGR0O1xyXG5cclxuICAgICAgLy8gZGV0ZXJtaW5lIGlmIHRpbWUgdG8gYWRkIGEgbmV3IGNodW5rXHJcbiAgICAgIGlmICggZW5lcmd5U2luY2VMYXN0Q2h1bmsgPj0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LICkge1xyXG5cclxuICAgICAgICAvLyBjcmVhdGUgYW5kIGFkZCBhIG5ldyBjaHVua1xyXG4gICAgICAgIGNvbnN0IG5ld0VuZXJneUNodW5rID0gdGhpcy5lbmVyZ3lDaHVua0dyb3VwLmNyZWF0ZU5leHRFbGVtZW50KFxyXG4gICAgICAgICAgRW5lcmd5VHlwZS5FTEVDVFJJQ0FMLFxyXG4gICAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLnBsdXMoIExFRlRfU0lERV9PRl9XSVJFX09GRlNFVCApLFxyXG4gICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHlcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtMaXN0LnB1c2goIG5ld0VuZXJneUNodW5rICk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBhIFwibW92ZXJcIiB0aGF0IHdpbGwgbW92ZSB0aGlzIGVuZXJneSBjaHVuayB0aHJvdWdoIHRoZSB3aXJlIHRvIHRoZSBoZWF0aW5nIGVsZW1lbnRcclxuICAgICAgICB0aGlzLmVsZWN0cmljYWxFbmVyZ3lDaHVua01vdmVycy5wdXNoKCB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIG5ld0VuZXJneUNodW5rLFxyXG4gICAgICAgICAgRW5lcmd5Q2h1bmtQYXRoTW92ZXIuY3JlYXRlUGF0aEZyb21PZmZzZXRzKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCksIEVMRUNUUklDQUxfRU5FUkdZX0NIVU5LX09GRlNFVFMgKSxcclxuICAgICAgICAgIEVGQUNDb25zdGFudHMuRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIClcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgZW5lcmd5IHNpbmNlIGxhc3QgY2h1bmtcclxuICAgICAgICBlbmVyZ3lTaW5jZUxhc3RDaHVuayAtPSBFRkFDQ29uc3RhbnRzLkVORVJHWV9QRVJfQ0hVTks7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubW92ZUVsZWN0cmljYWxFbmVyZ3lDaHVua3MoIGR0ICk7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuaGVhdGluZ0VsZW1lbnRFbmVyZ3lDaHVua01vdmVycy5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgICAvLyBhbiBlbmVyZ3kgY2h1bmsgaGFzIG1hZGUgaXQgdG8gdGhlIGhlYXRpbmcgZWxlbWVudCwgd2hpY2ggY29tcGxldGVzIHRoZSBwcmVsb2FkXHJcbiAgICAgICAgcHJlbG9hZENvbXBsZXRlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRlYWN0aXZhdGUoKSB7XHJcbiAgICBzdXBlci5kZWFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLmJlYWtlci5yZXNldCgpO1xyXG4gICAgdGhpcy5iZWFrZXIucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBCRUFLRVJfT0ZGU0VUICk7XHJcbiAgICB0aGlzLmhlYXRQcm9wb3J0aW9uUHJvcGVydHkuc2V0KCAwICk7XHJcblxyXG4gICAgLy8gc3RlcCB0aGUgdGhlcm1vbWV0ZXIgc28gdGhhdCBhbnkgdGVtcGVyYXR1cmUgY2hhbmdlcyByZXN1bHRpbmcgZnJvbSB0aGUgcmVzZXQgYXJlIGltbWVkaWF0ZWx5IHJlZmxlY3RlZFxyXG4gICAgdGhpcy50aGVybW9tZXRlci5zdGVwKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZW1vdmUgYWxsIGVuZXJneSBjaHVua3NcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgY2xlYXJFbmVyZ3lDaHVua3MoKSB7XHJcbiAgICBzdXBlci5jbGVhckVuZXJneUNodW5rcygpO1xyXG5cclxuICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzLmZvckVhY2goIG1vdmVyID0+IHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIgKSApO1xyXG4gICAgdGhpcy5lbGVjdHJpY2FsRW5lcmd5Q2h1bmtNb3ZlcnMuY2xlYXIoKTtcclxuICAgIHRoaXMuaGVhdGluZ0VsZW1lbnRFbmVyZ3lDaHVua01vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuZGlzcG9zZUVsZW1lbnQoIG1vdmVyICkgKTtcclxuICAgIHRoaXMuaGVhdGluZ0VsZW1lbnRFbmVyZ3lDaHVua01vdmVycy5jbGVhcigpO1xyXG4gICAgdGhpcy5yYWRpYXRlZEVuZXJneUNodW5rTW92ZXJzLmZvckVhY2goIG1vdmVyID0+IHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5kaXNwb3NlRWxlbWVudCggbW92ZXIgKSApO1xyXG4gICAgdGhpcy5yYWRpYXRlZEVuZXJneUNodW5rTW92ZXJzLmNsZWFyKCk7XHJcbiAgICB0aGlzLnJhZGlhdGVkRW5lcmd5Q2h1bmtMaXN0LmZvckVhY2goIGNodW5rID0+IHRoaXMuZW5lcmd5Q2h1bmtHcm91cC5kaXNwb3NlRWxlbWVudCggY2h1bmsgKSApO1xyXG4gICAgdGhpcy5yYWRpYXRlZEVuZXJneUNodW5rTGlzdC5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtICB7VmVjdG9yMn0gc3RhcnRpbmdQb2ludFxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyW119XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjcmVhdGVIZWF0ZXJFbGVtZW50RW5lcmd5Q2h1bmtQYXRoKCBzdGFydGluZ1BvaW50ICkge1xyXG4gICAgY29uc3QgcGF0aCA9IFtdO1xyXG5cclxuICAgIC8vIFRoZSBwYXRoIGZvciB0aGUgdGhlcm1hbCBlbmVyZ3kgY2h1bmtzIGlzIG1lYW50IHRvIGxvb2sgbGlrZSBpdCBpcyBtb3Zpbmcgb24gdGhlIGJ1cm5lciBlbGVtZW50LiAgVGhpcyBtdXN0IGJlXHJcbiAgICAvLyB1cGRhdGVkIGlmIHRoZSBidXJuZXIgZWxlbWVudCBpbWFnZSBjaGFuZ2VzLlxyXG4gICAgY29uc3QgYW5nbGVTcGFuID0gTWF0aC5QSSAqIDAuNzU7XHJcbiAgICBjb25zdCBhbmdsZSA9IE1hdGguUEkgLyAyICsgKCB0aGlzLnJhbmRvbS5uZXh0RG91YmxlKCkgLSAwLjUgKSAqIGFuZ2xlU3BhbjtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgYSB0cmF2ZWwgZGlzdGFuY2UgdGhhdCB3aWxsIG1vdmUgZmFydGhlciB0byB0aGUgbGVmdCBhbmQgcmlnaHQsIGxlc3MgaW4gdGhlIG1pZGRsZSwgdG8gbWF0Y2ggdGhlXHJcbiAgICAvLyBlbGxpcHRpY2FsIHNoYXBlIG9mIHRoZSBidXJuZXIgaW4gdGhlIHZpZXcsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZW5lcmd5LWZvcm1zLWFuZC1jaGFuZ2VzL2lzc3Vlcy8xNzQuXHJcbiAgICBjb25zdCB0cmF2ZWxEaXN0YW5jZSA9ICggMC42ICsgTWF0aC5hYnMoIE1hdGguY29zKCBhbmdsZSApICkgKiAwLjMgKSAqIEhFQVRFUl9FTEVNRU5UXzJEX0hFSUdIVDtcclxuICAgIHBhdGgucHVzaCggc3RhcnRpbmdQb2ludC5wbHVzKCBuZXcgVmVjdG9yMiggdHJhdmVsRGlzdGFuY2UsIDAgKS5yb3RhdGVkKCBhbmdsZSApICkgKTtcclxuICAgIHJldHVybiBwYXRoO1xyXG4gIH1cclxufVxyXG5cclxuQmVha2VySGVhdGVyLkhFQVRFUl9FTEVNRU5UXzJEX0hFSUdIVCA9IEhFQVRFUl9FTEVNRU5UXzJEX0hFSUdIVDtcclxuXHJcbmVuZXJneUZvcm1zQW5kQ2hhbmdlcy5yZWdpc3RlciggJ0JlYWtlckhlYXRlcicsIEJlYWtlckhlYXRlciApO1xyXG5leHBvcnQgZGVmYXVsdCBCZWFrZXJIZWF0ZXI7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSw4Q0FBOEM7QUFDaEYsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLEtBQUssUUFBUSxtQ0FBbUM7QUFDekQsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLE9BQU9DLGFBQWEsTUFBTSxrQ0FBa0M7QUFDNUQsT0FBT0MsYUFBYSxNQUFNLCtCQUErQjtBQUN6RCxPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0MsdUJBQXVCLE1BQU0sK0NBQStDO0FBQ25GLE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MscUJBQXFCLE1BQU0sNkNBQTZDO0FBQy9FLE9BQU9DLHlCQUF5QixNQUFNLGlEQUFpRDtBQUN2RixPQUFP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