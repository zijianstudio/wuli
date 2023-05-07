// Copyright 2016-2022, University of Colorado Boulder

/**
 * a type representing the steam-generating tea kettle in the model.
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
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
import teaKettleIcon_png from '../../../images/teaKettleIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Energy from './Energy.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergySource from './EnergySource.js';

// constants

// Offsets and other constants used for energy paths.  These are mostly
// empirically determined and coordinated with the image.
const SPOUT_BOTTOM_OFFSET = new Vector2(0.03, 0.02);
const SPOUT_EXIT_ANGLE = 0.876; // in radians
const WATER_SURFACE_HEIGHT_OFFSET = 0; // From tea kettle position, in meters.
const THERMAL_ENERGY_CHUNK_Y_ORIGIN = -0.05; // Meters. Coordinated with heater position.
const THERMAL_ENERGY_CHUNK_X_ORIGIN_RANGE = new Range(-0.015, 0.015); // Meters. Coordinated with heater position.

// Miscellaneous other constants.
const MAX_ENERGY_CHANGE_RATE = EFACConstants.MAX_ENERGY_PRODUCTION_RATE / 5; // In joules/second
const COOLING_CONSTANT = 0.1; // Controls rate at which tea kettle cools down, empirically determined.
const COOL_DOWN_COMPLETE_THRESHOLD = 30; // In joules/second
const ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE = new Range(0.12, 0.15);
const ENERGY_CHUNK_WATER_TO_SPOUT_TIME = 0.7; // Used to keep chunks evenly spaced.

class TeaKettle extends EnergySource {
  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {Property.<boolean>} steamPowerableElementInPlaceProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Object} [options]
   */
  constructor(energyChunksVisibleProperty, steamPowerableElementInPlaceProperty, energyChunkGroup, energyChunkPathMoverGroup, options) {
    options = merge({
      tandem: Tandem.REQUIRED
    }, options);
    super(new Image(teaKettleIcon_png), options);

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.teaKettle;

    // @public {NumberProperty}
    this.heatProportionProperty = new NumberProperty(0, {
      range: new Range(0, 1),
      tandem: options.tandem.createTandem('heatProportionProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'proportion of heat coming from the heater'
    });

    // @public (read-only) {NumberProperty}
    this.energyProductionRateProperty = new NumberProperty(0, {
      range: new Range(0, EFACConstants.MAX_ENERGY_PRODUCTION_RATE),
      tandem: options.tandem.createTandem('energyProductionRateProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true
    });

    // @public
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @private
    this.steamPowerableElementInPlaceProperty = steamPowerableElementInPlaceProperty;
    this.heatEnergyProducedSinceLastChunk = EFACConstants.ENERGY_PER_CHUNK / 2;
    this.energyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('energyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;

    // @private - List of chunks that are not being transferred to the next energy system
    // element.
    this.exemptFromTransferEnergyChunks = createObservableArray({
      tandem: options.tandem.createTandem('exemptFromTransferEnergyChunks'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunk.EnergyChunkIO))
    });
    assert && this.outgoingEnergyChunks.addItemAddedListener(chunk => {
      assert && assert(!this.exemptFromTransferEnergyChunks.includes(chunk), 'Exempt means it should not go onto outgoing list');
    });

    // Flag for whether next chunk should be transferred or kept, used to
    // alternate transfer with non-transfer.
    this.transferNextAvailableChunk = true;
  }

  /**
   * Animation for tea kettle and energy chunks
   *
   * @param {number} dt
   * @returns {Energy}
   * @public
   */
  step(dt) {
    if (this.activeProperty.value) {
      if (this.heatProportionProperty.value > 0 || this.energyProductionRateProperty.value > COOL_DOWN_COMPLETE_THRESHOLD) {
        // Calculate the energy production rate.

        // Analogous to acceleration.
        const increase = this.heatProportionProperty.value * MAX_ENERGY_CHANGE_RATE;

        // Analogous to friction.
        const decrease = this.energyProductionRateProperty.value * COOLING_CONSTANT;

        // Analogous to velocity.
        let rate = this.energyProductionRateProperty.value + increase * dt - decrease * dt;
        rate = Math.min(rate, EFACConstants.MAX_ENERGY_PRODUCTION_RATE);
        this.energyProductionRateProperty.set(rate);
      } else {
        // Clamp the energy production rate to zero so that it doesn't
        // trickle on forever.
        this.energyProductionRateProperty.set(0);
      }

      // See if it's time to emit a new energy chunk from the heater.
      this.heatEnergyProducedSinceLastChunk += Math.max(this.heatProportionProperty.value, 0) * EFACConstants.MAX_ENERGY_PRODUCTION_RATE * dt;
      if (this.heatEnergyProducedSinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK) {
        // Emit a new thermal energy chunk.
        const xRange = THERMAL_ENERGY_CHUNK_X_ORIGIN_RANGE;
        const x0 = this.positionProperty.value.x + xRange.min + dotRandom.nextDouble() * xRange.getLength();
        const y0 = this.positionProperty.value.y + THERMAL_ENERGY_CHUNK_Y_ORIGIN;
        const initialPosition = new Vector2(x0, y0);
        const energyChunk = this.energyChunkGroup.createNextElement(EnergyType.THERMAL, initialPosition, Vector2.ZERO, this.energyChunksVisibleProperty);
        this.energyChunkList.push(energyChunk);
        this.heatEnergyProducedSinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
        this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(energyChunk, createThermalEnergyChunkPath(initialPosition, this.positionProperty.value), EFACConstants.ENERGY_CHUNK_VELOCITY));
      }

      // Move all energy chunks that are under this element's control.
      this.moveEnergyChunks(dt);
    }
    return new Energy(EnergyType.MECHANICAL, this.energyProductionRateProperty.value * dt, Math.PI / 2);
  }

  /**
   * @param  {number} dt time step
   * @private
   */
  moveEnergyChunks(dt) {
    const chunkMovers = this.energyChunkMovers.slice();
    chunkMovers.forEach(mover => {
      mover.moveAlongPath(dt);
      const chunk = mover.energyChunk;
      if (mover.pathFullyTraversed) {
        this.energyChunkMovers.remove(mover);
        this.energyChunkPathMoverGroup.disposeElement(mover);

        // This is a thermal chunk that is coming out of the water.
        if (chunk.energyTypeProperty.get() === EnergyType.THERMAL && chunk.positionProperty.get().y === this.positionProperty.value.y + WATER_SURFACE_HEIGHT_OFFSET) {
          if (dotRandom.nextDouble() > 0.2) {
            // Turn the chunk into mechanical energy.
            chunk.energyTypeProperty.set(EnergyType.MECHANICAL);
          }

          // Set this chunk on a path to the base of the spout.
          const travelDistance = chunk.positionProperty.get().distance(this.positionProperty.value.plus(SPOUT_BOTTOM_OFFSET));

          // create path mover to spout bottom
          this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(chunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.value, [SPOUT_BOTTOM_OFFSET]), travelDistance / ENERGY_CHUNK_WATER_TO_SPOUT_TIME));
        }

        // This chunk is moving out of the spout.
        else if (chunk.positionProperty.get().equals(this.positionProperty.value.plus(SPOUT_BOTTOM_OFFSET))) {
          this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(chunk, EnergyChunkPathMover.createStraightPath(this.positionProperty.value, SPOUT_EXIT_ANGLE), EFACConstants.ENERGY_CHUNK_VELOCITY /* This is a speed (scalar) */));
        }

        // This chunk is out of view, and we are done with it.
        else {
          this.energyChunkList.remove(chunk);
          this.exemptFromTransferEnergyChunks.remove(chunk);
          this.energyChunkGroup.disposeElement(chunk);
        }
      }

      // Path not fully traversed
      else {
        // See if this energy chunks should be transferred to the
        // next energy system.
        if (chunk.energyTypeProperty.get() === EnergyType.MECHANICAL && this.steamPowerableElementInPlaceProperty.get() && ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE.contains(this.positionProperty.value.distance(chunk.positionProperty.get())) && !this.exemptFromTransferEnergyChunks.includes(chunk)) {
          // Send this chunk to the next energy system.
          if (this.transferNextAvailableChunk) {
            this.energyChunkList.remove(chunk);
            this.outgoingEnergyChunks.push(chunk);
            this.energyChunkMovers.remove(mover);
            this.energyChunkPathMoverGroup.disposeElement(mover);

            // Alternate sending or keeping chunks.
            this.transferNextAvailableChunk = false;
          }

          // Don't transfer this chunk.
          // Set up to transfer the next one.
          else {
            this.exemptFromTransferEnergyChunks.push(chunk);
            this.transferNextAvailableChunk = true;
          }
        }

        // if a chunk has reached the position where it should transfer to the next system, but no steam powerable
        // element is in place, add the chunk to the list of non transfers
        else if (!this.steamPowerableElementInPlaceProperty.get() && ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE.contains(this.positionProperty.value.distance(chunk.positionProperty.get())) && !this.exemptFromTransferEnergyChunks.includes(chunk)) {
          this.exemptFromTransferEnergyChunks.push(chunk);
        }
      }
    });
  }

  /**
   * @public
   * @override
   */
  preloadEnergyChunks() {
    this.clearEnergyChunks();

    // Return if no chunks to add.
    if (this.energyProductionRateProperty.get() === 0) {
      return;
    }
    let preloadComplete = false;
    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;

    // Simulate energy chunks moving through the system.
    while (!preloadComplete) {
      if (this.heatProportionProperty.value > 0) {
        // if the heater is on, determine the rate of chunk release by its level
        energySinceLastChunk += this.heatProportionProperty.value * EFACConstants.MAX_ENERGY_PRODUCTION_RATE * dt;
      } else {
        // otherwise, determine by the existing energy in the kettle
        energySinceLastChunk += this.energyProductionRateProperty.get() * dt;
      }
      if (energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK) {
        let initialPosition;
        const xRange = THERMAL_ENERGY_CHUNK_X_ORIGIN_RANGE;
        if (this.heatProportionProperty.value > 0) {
          // Create a thermal chunk inside the burner.
          initialPosition = new Vector2(this.positionProperty.value.x + xRange.min + dotRandom.nextDouble() * xRange.getLength(), this.positionProperty.value.y + THERMAL_ENERGY_CHUNK_Y_ORIGIN);
        } else {
          // Create a thermal chunk inside the tea kettle.
          initialPosition = new Vector2(this.positionProperty.value.x, this.positionProperty.value.y);
        }
        const energyChunk = this.energyChunkGroup.createNextElement(EnergyType.THERMAL, initialPosition, Vector2.ZERO, this.energyChunksVisibleProperty);
        this.energyChunkList.push(energyChunk);
        this.energyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(energyChunk, createThermalEnergyChunkPath(initialPosition, this.positionProperty.value), EFACConstants.ENERGY_CHUNK_VELOCITY));
        energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
      }

      // Update energy chunk positions.
      this.moveEnergyChunks(dt);
      if (this.outgoingEnergyChunks.length > 0 || this.exemptFromTransferEnergyChunks.length > 0) {
        // An energy chunk has traversed to the output of this system, or passed the point of moving to the next system.
        preloadComplete = true;

        // a chunk was recently released from the burner because of preloading, so reset the heat energy level
        this.heatEnergyProducedSinceLastChunk = 0;
      }
    }
  }

  /**
   * @returns {Energy}
   * @public
   * @override
   */
  getEnergyOutputRate() {
    return new Energy(EnergyType.MECHANICAL, this.energyProductionRateProperty.value, Math.PI / 2);
  }

  /**
   * Deactivate the tea kettle
   * @public
   * @override
   */
  deactivate() {
    super.deactivate();
    this.heatProportionProperty.reset();
    this.energyProductionRateProperty.reset();
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.exemptFromTransferEnergyChunks.clear(); // Disposal is done when energyChunkList is cleared
    this.energyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.energyChunkMovers.clear();
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @returns {Object}
   */
  toStateObject() {
    return {
      heatEnergyProducedSinceLastChunk: this.heatEnergyProducedSinceLastChunk,
      transferNextAvailableChunk: this.transferNextAvailableChunk
    };
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @param {Object} stateObject - see this.toStateObject()
   */
  applyState(stateObject) {
    this.heatEnergyProducedSinceLastChunk = stateObject.heatEnergyProducedSinceLastChunk;
    this.transferNextAvailableChunk = stateObject.transferNextAvailableChunk;
  }
}

/**
 * @param {Vector2} startPosition
 * @param {Vector2} teaKettlePosition
 * @returns {Vector2[]}
 * @private
 */
const createThermalEnergyChunkPath = (startPosition, teaKettlePosition) => {
  const path = [];
  path.push(new Vector2(startPosition.x, teaKettlePosition.y + WATER_SURFACE_HEIGHT_OFFSET));
  return path;
};

// statics
TeaKettle.SPOUT_EXIT_ANGLE = SPOUT_EXIT_ANGLE;
energyFormsAndChanges.register('TeaKettle', TeaKettle);
export default TeaKettle;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJOdW1iZXJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlJhbmdlIiwiVmVjdG9yMiIsIm1lcmdlIiwiSW1hZ2UiLCJUYW5kZW0iLCJSZWZlcmVuY2VJTyIsInRlYUtldHRsZUljb25fcG5nIiwiRUZBQ0NvbnN0YW50cyIsIkVuZXJneUNodW5rIiwiRW5lcmd5VHlwZSIsImVuZXJneUZvcm1zQW5kQ2hhbmdlcyIsIkVuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MiLCJFbmVyZ3kiLCJFbmVyZ3lDaHVua1BhdGhNb3ZlciIsIkVuZXJneVNvdXJjZSIsIlNQT1VUX0JPVFRPTV9PRkZTRVQiLCJTUE9VVF9FWElUX0FOR0xFIiwiV0FURVJfU1VSRkFDRV9IRUlHSFRfT0ZGU0VUIiwiVEhFUk1BTF9FTkVSR1lfQ0hVTktfWV9PUklHSU4iLCJUSEVSTUFMX0VORVJHWV9DSFVOS19YX09SSUdJTl9SQU5HRSIsIk1BWF9FTkVSR1lfQ0hBTkdFX1JBVEUiLCJNQVhfRU5FUkdZX1BST0RVQ1RJT05fUkFURSIsIkNPT0xJTkdfQ09OU1RBTlQiLCJDT09MX0RPV05fQ09NUExFVEVfVEhSRVNIT0xEIiwiRU5FUkdZX0NIVU5LX1RSQU5TRkVSX0RJU1RBTkNFX1JBTkdFIiwiRU5FUkdZX0NIVU5LX1dBVEVSX1RPX1NQT1VUX1RJTUUiLCJUZWFLZXR0bGUiLCJjb25zdHJ1Y3RvciIsImVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSIsInN0ZWFtUG93ZXJhYmxlRWxlbWVudEluUGxhY2VQcm9wZXJ0eSIsImVuZXJneUNodW5rR3JvdXAiLCJlbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwIiwib3B0aW9ucyIsInRhbmRlbSIsIlJFUVVJUkVEIiwiYTExeU5hbWUiLCJhMTF5IiwidGVhS2V0dGxlIiwiaGVhdFByb3BvcnRpb25Qcm9wZXJ0eSIsInJhbmdlIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9IaWdoRnJlcXVlbmN5IiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImVuZXJneVByb2R1Y3Rpb25SYXRlUHJvcGVydHkiLCJoZWF0RW5lcmd5UHJvZHVjZWRTaW5jZUxhc3RDaHVuayIsIkVORVJHWV9QRVJfQ0hVTksiLCJlbmVyZ3lDaHVua01vdmVycyIsInBoZXRpb1R5cGUiLCJPYnNlcnZhYmxlQXJyYXlJTyIsIkVuZXJneUNodW5rUGF0aE1vdmVySU8iLCJleGVtcHRGcm9tVHJhbnNmZXJFbmVyZ3lDaHVua3MiLCJFbmVyZ3lDaHVua0lPIiwiYXNzZXJ0Iiwib3V0Z29pbmdFbmVyZ3lDaHVua3MiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsImNodW5rIiwiaW5jbHVkZXMiLCJ0cmFuc2Zlck5leHRBdmFpbGFibGVDaHVuayIsInN0ZXAiLCJkdCIsImFjdGl2ZVByb3BlcnR5IiwidmFsdWUiLCJpbmNyZWFzZSIsImRlY3JlYXNlIiwicmF0ZSIsIk1hdGgiLCJtaW4iLCJzZXQiLCJtYXgiLCJ4UmFuZ2UiLCJ4MCIsInBvc2l0aW9uUHJvcGVydHkiLCJ4IiwibmV4dERvdWJsZSIsImdldExlbmd0aCIsInkwIiwieSIsImluaXRpYWxQb3NpdGlvbiIsImVuZXJneUNodW5rIiwiY3JlYXRlTmV4dEVsZW1lbnQiLCJUSEVSTUFMIiwiWkVSTyIsImVuZXJneUNodW5rTGlzdCIsInB1c2giLCJjcmVhdGVUaGVybWFsRW5lcmd5Q2h1bmtQYXRoIiwiRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIiwibW92ZUVuZXJneUNodW5rcyIsIk1FQ0hBTklDQUwiLCJQSSIsImNodW5rTW92ZXJzIiwic2xpY2UiLCJmb3JFYWNoIiwibW92ZXIiLCJtb3ZlQWxvbmdQYXRoIiwicGF0aEZ1bGx5VHJhdmVyc2VkIiwicmVtb3ZlIiwiZGlzcG9zZUVsZW1lbnQiLCJlbmVyZ3lUeXBlUHJvcGVydHkiLCJnZXQiLCJ0cmF2ZWxEaXN0YW5jZSIsImRpc3RhbmNlIiwicGx1cyIsImNyZWF0ZVBhdGhGcm9tT2Zmc2V0cyIsImVxdWFscyIsImNyZWF0ZVN0cmFpZ2h0UGF0aCIsImNvbnRhaW5zIiwicHJlbG9hZEVuZXJneUNodW5rcyIsImNsZWFyRW5lcmd5Q2h1bmtzIiwicHJlbG9hZENvbXBsZXRlIiwiRlJBTUVTX1BFUl9TRUNPTkQiLCJlbmVyZ3lTaW5jZUxhc3RDaHVuayIsImxlbmd0aCIsImdldEVuZXJneU91dHB1dFJhdGUiLCJkZWFjdGl2YXRlIiwicmVzZXQiLCJjbGVhciIsInRvU3RhdGVPYmplY3QiLCJhcHBseVN0YXRlIiwic3RhdGVPYmplY3QiLCJzdGFydFBvc2l0aW9uIiwidGVhS2V0dGxlUG9zaXRpb24iLCJwYXRoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUZWFLZXR0bGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogYSB0eXBlIHJlcHJlc2VudGluZyB0aGUgc3RlYW0tZ2VuZXJhdGluZyB0ZWEga2V0dGxlIGluIHRoZSBtb2RlbC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZVxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFJlZmVyZW5jZUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9SZWZlcmVuY2VJTy5qcyc7XHJcbmltcG9ydCB0ZWFLZXR0bGVJY29uX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvdGVhS2V0dGxlSWNvbl9wbmcuanMnO1xyXG5pbXBvcnQgRUZBQ0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRUZBQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDaHVuayBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRW5lcmd5Q2h1bmsuanMnO1xyXG5pbXBvcnQgRW5lcmd5VHlwZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRW5lcmd5VHlwZS5qcyc7XHJcbmltcG9ydCBlbmVyZ3lGb3Jtc0FuZENoYW5nZXMgZnJvbSAnLi4vLi4vZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLmpzJztcclxuaW1wb3J0IEVuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MgZnJvbSAnLi4vLi4vRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBFbmVyZ3kgZnJvbSAnLi9FbmVyZ3kuanMnO1xyXG5pbXBvcnQgRW5lcmd5Q2h1bmtQYXRoTW92ZXIgZnJvbSAnLi9FbmVyZ3lDaHVua1BhdGhNb3Zlci5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTb3VyY2UgZnJvbSAnLi9FbmVyZ3lTb3VyY2UuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcblxyXG4vLyBPZmZzZXRzIGFuZCBvdGhlciBjb25zdGFudHMgdXNlZCBmb3IgZW5lcmd5IHBhdGhzLiAgVGhlc2UgYXJlIG1vc3RseVxyXG4vLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIGFuZCBjb29yZGluYXRlZCB3aXRoIHRoZSBpbWFnZS5cclxuY29uc3QgU1BPVVRfQk9UVE9NX09GRlNFVCA9IG5ldyBWZWN0b3IyKCAwLjAzLCAwLjAyICk7XHJcbmNvbnN0IFNQT1VUX0VYSVRfQU5HTEUgPSAwLjg3NjsgLy8gaW4gcmFkaWFuc1xyXG5jb25zdCBXQVRFUl9TVVJGQUNFX0hFSUdIVF9PRkZTRVQgPSAwOyAvLyBGcm9tIHRlYSBrZXR0bGUgcG9zaXRpb24sIGluIG1ldGVycy5cclxuY29uc3QgVEhFUk1BTF9FTkVSR1lfQ0hVTktfWV9PUklHSU4gPSAtMC4wNTsgLy8gTWV0ZXJzLiBDb29yZGluYXRlZCB3aXRoIGhlYXRlciBwb3NpdGlvbi5cclxuY29uc3QgVEhFUk1BTF9FTkVSR1lfQ0hVTktfWF9PUklHSU5fUkFOR0UgPSBuZXcgUmFuZ2UoIC0wLjAxNSwgMC4wMTUgKTsgLy8gTWV0ZXJzLiBDb29yZGluYXRlZCB3aXRoIGhlYXRlciBwb3NpdGlvbi5cclxuXHJcbi8vIE1pc2NlbGxhbmVvdXMgb3RoZXIgY29uc3RhbnRzLlxyXG5jb25zdCBNQVhfRU5FUkdZX0NIQU5HRV9SQVRFID0gRUZBQ0NvbnN0YW50cy5NQVhfRU5FUkdZX1BST0RVQ1RJT05fUkFURSAvIDU7IC8vIEluIGpvdWxlcy9zZWNvbmRcclxuY29uc3QgQ09PTElOR19DT05TVEFOVCA9IDAuMTsgLy8gQ29udHJvbHMgcmF0ZSBhdCB3aGljaCB0ZWEga2V0dGxlIGNvb2xzIGRvd24sIGVtcGlyaWNhbGx5IGRldGVybWluZWQuXHJcbmNvbnN0IENPT0xfRE9XTl9DT01QTEVURV9USFJFU0hPTEQgPSAzMDsgLy8gSW4gam91bGVzL3NlY29uZFxyXG5jb25zdCBFTkVSR1lfQ0hVTktfVFJBTlNGRVJfRElTVEFOQ0VfUkFOR0UgPSBuZXcgUmFuZ2UoIDAuMTIsIDAuMTUgKTtcclxuY29uc3QgRU5FUkdZX0NIVU5LX1dBVEVSX1RPX1NQT1VUX1RJTUUgPSAwLjc7IC8vIFVzZWQgdG8ga2VlcCBjaHVua3MgZXZlbmx5IHNwYWNlZC5cclxuXHJcbmNsYXNzIFRlYUtldHRsZSBleHRlbmRzIEVuZXJneVNvdXJjZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gc3RlYW1Qb3dlcmFibGVFbGVtZW50SW5QbGFjZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtFbmVyZ3lDaHVua0dyb3VwfSBlbmVyZ3lDaHVua0dyb3VwXHJcbiAgICogQHBhcmFtIHtFbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwfSBlbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHksIHN0ZWFtUG93ZXJhYmxlRWxlbWVudEluUGxhY2VQcm9wZXJ0eSwgZW5lcmd5Q2h1bmtHcm91cCwgZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggbmV3IEltYWdlKCB0ZWFLZXR0bGVJY29uX3BuZyApLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7c3RyaW5nfSAtIGExMXkgbmFtZVxyXG4gICAgdGhpcy5hMTF5TmFtZSA9IEVuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MuYTExeS50ZWFLZXR0bGU7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7TnVtYmVyUHJvcGVydHl9XHJcbiAgICB0aGlzLmhlYXRQcm9wb3J0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMSApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2hlYXRQcm9wb3J0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAncHJvcG9ydGlvbiBvZiBoZWF0IGNvbWluZyBmcm9tIHRoZSBoZWF0ZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7TnVtYmVyUHJvcGVydHl9XHJcbiAgICB0aGlzLmVuZXJneVByb2R1Y3Rpb25SYXRlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgRUZBQ0NvbnN0YW50cy5NQVhfRU5FUkdZX1BST0RVQ1RJT05fUkFURSApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZXJneVByb2R1Y3Rpb25SYXRlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHkgPSBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuc3RlYW1Qb3dlcmFibGVFbGVtZW50SW5QbGFjZVByb3BlcnR5ID0gc3RlYW1Qb3dlcmFibGVFbGVtZW50SW5QbGFjZVByb3BlcnR5O1xyXG4gICAgdGhpcy5oZWF0RW5lcmd5UHJvZHVjZWRTaW5jZUxhc3RDaHVuayA9IEVGQUNDb25zdGFudHMuRU5FUkdZX1BFUl9DSFVOSyAvIDI7XHJcbiAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5Q2h1bmtNb3ZlcnMnICksXHJcbiAgICAgIHBoZXRpb1R5cGU6IGNyZWF0ZU9ic2VydmFibGVBcnJheS5PYnNlcnZhYmxlQXJyYXlJTyggUmVmZXJlbmNlSU8oIEVuZXJneUNodW5rUGF0aE1vdmVyLkVuZXJneUNodW5rUGF0aE1vdmVySU8gKSApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmVuZXJneUNodW5rR3JvdXAgPSBlbmVyZ3lDaHVua0dyb3VwO1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwID0gZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIExpc3Qgb2YgY2h1bmtzIHRoYXQgYXJlIG5vdCBiZWluZyB0cmFuc2ZlcnJlZCB0byB0aGUgbmV4dCBlbmVyZ3kgc3lzdGVtXHJcbiAgICAvLyBlbGVtZW50LlxyXG4gICAgdGhpcy5leGVtcHRGcm9tVHJhbnNmZXJFbmVyZ3lDaHVua3MgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdleGVtcHRGcm9tVHJhbnNmZXJFbmVyZ3lDaHVua3MnICksXHJcbiAgICAgIHBoZXRpb1R5cGU6IGNyZWF0ZU9ic2VydmFibGVBcnJheS5PYnNlcnZhYmxlQXJyYXlJTyggUmVmZXJlbmNlSU8oIEVuZXJneUNodW5rLkVuZXJneUNodW5rSU8gKSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIHRoaXMub3V0Z29pbmdFbmVyZ3lDaHVua3MuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIGNodW5rID0+IHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuZXhlbXB0RnJvbVRyYW5zZmVyRW5lcmd5Q2h1bmtzLmluY2x1ZGVzKCBjaHVuayApLCAnRXhlbXB0IG1lYW5zIGl0IHNob3VsZCBub3QgZ28gb250byBvdXRnb2luZyBsaXN0JyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEZsYWcgZm9yIHdoZXRoZXIgbmV4dCBjaHVuayBzaG91bGQgYmUgdHJhbnNmZXJyZWQgb3Iga2VwdCwgdXNlZCB0b1xyXG4gICAgLy8gYWx0ZXJuYXRlIHRyYW5zZmVyIHdpdGggbm9uLXRyYW5zZmVyLlxyXG4gICAgdGhpcy50cmFuc2Zlck5leHRBdmFpbGFibGVDaHVuayA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbmltYXRpb24gZm9yIHRlYSBrZXR0bGUgYW5kIGVuZXJneSBjaHVua3NcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEByZXR1cm5zIHtFbmVyZ3l9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG5cclxuICAgIGlmICggdGhpcy5hY3RpdmVQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgIGlmICggdGhpcy5oZWF0UHJvcG9ydGlvblByb3BlcnR5LnZhbHVlID4gMCB8fCB0aGlzLmVuZXJneVByb2R1Y3Rpb25SYXRlUHJvcGVydHkudmFsdWUgPiBDT09MX0RPV05fQ09NUExFVEVfVEhSRVNIT0xEICkge1xyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGVuZXJneSBwcm9kdWN0aW9uIHJhdGUuXHJcblxyXG4gICAgICAgIC8vIEFuYWxvZ291cyB0byBhY2NlbGVyYXRpb24uXHJcbiAgICAgICAgY29uc3QgaW5jcmVhc2UgPSB0aGlzLmhlYXRQcm9wb3J0aW9uUHJvcGVydHkudmFsdWUgKiBNQVhfRU5FUkdZX0NIQU5HRV9SQVRFO1xyXG5cclxuICAgICAgICAvLyBBbmFsb2dvdXMgdG8gZnJpY3Rpb24uXHJcbiAgICAgICAgY29uc3QgZGVjcmVhc2UgPSB0aGlzLmVuZXJneVByb2R1Y3Rpb25SYXRlUHJvcGVydHkudmFsdWUgKiBDT09MSU5HX0NPTlNUQU5UO1xyXG5cclxuICAgICAgICAvLyBBbmFsb2dvdXMgdG8gdmVsb2NpdHkuXHJcbiAgICAgICAgbGV0IHJhdGUgPSB0aGlzLmVuZXJneVByb2R1Y3Rpb25SYXRlUHJvcGVydHkudmFsdWUgKyBpbmNyZWFzZSAqIGR0IC0gZGVjcmVhc2UgKiBkdDtcclxuICAgICAgICByYXRlID0gTWF0aC5taW4oIHJhdGUsIEVGQUNDb25zdGFudHMuTUFYX0VORVJHWV9QUk9EVUNUSU9OX1JBVEUgKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbmVyZ3lQcm9kdWN0aW9uUmF0ZVByb3BlcnR5LnNldCggcmF0ZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIENsYW1wIHRoZSBlbmVyZ3kgcHJvZHVjdGlvbiByYXRlIHRvIHplcm8gc28gdGhhdCBpdCBkb2Vzbid0XHJcbiAgICAgICAgLy8gdHJpY2tsZSBvbiBmb3JldmVyLlxyXG4gICAgICAgIHRoaXMuZW5lcmd5UHJvZHVjdGlvblJhdGVQcm9wZXJ0eS5zZXQoIDAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2VlIGlmIGl0J3MgdGltZSB0byBlbWl0IGEgbmV3IGVuZXJneSBjaHVuayBmcm9tIHRoZSBoZWF0ZXIuXHJcbiAgICAgIHRoaXMuaGVhdEVuZXJneVByb2R1Y2VkU2luY2VMYXN0Q2h1bmsgKz1cclxuICAgICAgICBNYXRoLm1heCggdGhpcy5oZWF0UHJvcG9ydGlvblByb3BlcnR5LnZhbHVlLCAwICkgKiBFRkFDQ29uc3RhbnRzLk1BWF9FTkVSR1lfUFJPRFVDVElPTl9SQVRFICogZHQ7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuaGVhdEVuZXJneVByb2R1Y2VkU2luY2VMYXN0Q2h1bmsgPj0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LICkge1xyXG5cclxuICAgICAgICAvLyBFbWl0IGEgbmV3IHRoZXJtYWwgZW5lcmd5IGNodW5rLlxyXG4gICAgICAgIGNvbnN0IHhSYW5nZSA9IFRIRVJNQUxfRU5FUkdZX0NIVU5LX1hfT1JJR0lOX1JBTkdFO1xyXG4gICAgICAgIGNvbnN0IHgwID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnggKyB4UmFuZ2UubWluICsgZG90UmFuZG9tLm5leHREb3VibGUoKSAqIHhSYW5nZS5nZXRMZW5ndGgoKTtcclxuICAgICAgICBjb25zdCB5MCA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICsgVEhFUk1BTF9FTkVSR1lfQ0hVTktfWV9PUklHSU47XHJcbiAgICAgICAgY29uc3QgaW5pdGlhbFBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIHgwLCB5MCApO1xyXG5cclxuICAgICAgICBjb25zdCBlbmVyZ3lDaHVuayA9IHRoaXMuZW5lcmd5Q2h1bmtHcm91cC5jcmVhdGVOZXh0RWxlbWVudChcclxuICAgICAgICAgIEVuZXJneVR5cGUuVEhFUk1BTCxcclxuICAgICAgICAgIGluaXRpYWxQb3NpdGlvbixcclxuICAgICAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QucHVzaCggZW5lcmd5Q2h1bmsgKTtcclxuXHJcbiAgICAgICAgdGhpcy5oZWF0RW5lcmd5UHJvZHVjZWRTaW5jZUxhc3RDaHVuayAtPSBFRkFDQ29uc3RhbnRzLkVORVJHWV9QRVJfQ0hVTks7XHJcblxyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtNb3ZlcnMucHVzaCggdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCBlbmVyZ3lDaHVuayxcclxuICAgICAgICAgIGNyZWF0ZVRoZXJtYWxFbmVyZ3lDaHVua1BhdGgoIGluaXRpYWxQb3NpdGlvbiwgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlICksXHJcbiAgICAgICAgICBFRkFDQ29uc3RhbnRzLkVORVJHWV9DSFVOS19WRUxPQ0lUWSApICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE1vdmUgYWxsIGVuZXJneSBjaHVua3MgdGhhdCBhcmUgdW5kZXIgdGhpcyBlbGVtZW50J3MgY29udHJvbC5cclxuICAgICAgdGhpcy5tb3ZlRW5lcmd5Q2h1bmtzKCBkdCApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBFbmVyZ3koIEVuZXJneVR5cGUuTUVDSEFOSUNBTCwgdGhpcy5lbmVyZ3lQcm9kdWN0aW9uUmF0ZVByb3BlcnR5LnZhbHVlICogZHQsIE1hdGguUEkgLyAyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGR0IHRpbWUgc3RlcFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgbW92ZUVuZXJneUNodW5rcyggZHQgKSB7XHJcbiAgICBjb25zdCBjaHVua01vdmVycyA9IHRoaXMuZW5lcmd5Q2h1bmtNb3ZlcnMuc2xpY2UoKTtcclxuXHJcbiAgICBjaHVua01vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB7XHJcbiAgICAgIG1vdmVyLm1vdmVBbG9uZ1BhdGgoIGR0ICk7XHJcbiAgICAgIGNvbnN0IGNodW5rID0gbW92ZXIuZW5lcmd5Q2h1bms7XHJcblxyXG4gICAgICBpZiAoIG1vdmVyLnBhdGhGdWxseVRyYXZlcnNlZCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua01vdmVycy5yZW1vdmUoIG1vdmVyICk7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmRpc3Bvc2VFbGVtZW50KCBtb3ZlciApO1xyXG5cclxuICAgICAgICAvLyBUaGlzIGlzIGEgdGhlcm1hbCBjaHVuayB0aGF0IGlzIGNvbWluZyBvdXQgb2YgdGhlIHdhdGVyLlxyXG4gICAgICAgIGlmICggY2h1bmsuZW5lcmd5VHlwZVByb3BlcnR5LmdldCgpID09PSBFbmVyZ3lUeXBlLlRIRVJNQUwgJiZcclxuICAgICAgICAgICAgIGNodW5rLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSA9PT0gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKyBXQVRFUl9TVVJGQUNFX0hFSUdIVF9PRkZTRVQgKSB7XHJcbiAgICAgICAgICBpZiAoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgPiAwLjIgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBUdXJuIHRoZSBjaHVuayBpbnRvIG1lY2hhbmljYWwgZW5lcmd5LlxyXG4gICAgICAgICAgICBjaHVuay5lbmVyZ3lUeXBlUHJvcGVydHkuc2V0KCBFbmVyZ3lUeXBlLk1FQ0hBTklDQUwgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBTZXQgdGhpcyBjaHVuayBvbiBhIHBhdGggdG8gdGhlIGJhc2Ugb2YgdGhlIHNwb3V0LlxyXG4gICAgICAgICAgY29uc3QgdHJhdmVsRGlzdGFuY2UgPSBjaHVuay5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1cyggU1BPVVRfQk9UVE9NX09GRlNFVCApICk7XHJcblxyXG4gICAgICAgICAgLy8gY3JlYXRlIHBhdGggbW92ZXIgdG8gc3BvdXQgYm90dG9tXHJcbiAgICAgICAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzLnB1c2goIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggY2h1bmssXHJcbiAgICAgICAgICAgIEVuZXJneUNodW5rUGF0aE1vdmVyLmNyZWF0ZVBhdGhGcm9tT2Zmc2V0cyggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLCBbIFNQT1VUX0JPVFRPTV9PRkZTRVQgXSApLFxyXG4gICAgICAgICAgICB0cmF2ZWxEaXN0YW5jZSAvIEVORVJHWV9DSFVOS19XQVRFUl9UT19TUE9VVF9USU1FICkgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRoaXMgY2h1bmsgaXMgbW92aW5nIG91dCBvZiB0aGUgc3BvdXQuXHJcbiAgICAgICAgZWxzZSBpZiAoIGNodW5rLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZXF1YWxzKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1cyggU1BPVVRfQk9UVE9NX09GRlNFVCApICkgKSB7XHJcbiAgICAgICAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzLnB1c2goIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggY2h1bmssXHJcbiAgICAgICAgICAgIEVuZXJneUNodW5rUGF0aE1vdmVyLmNyZWF0ZVN0cmFpZ2h0UGF0aCggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLCBTUE9VVF9FWElUX0FOR0xFICksXHJcbiAgICAgICAgICAgIEVGQUNDb25zdGFudHMuRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIC8qIFRoaXMgaXMgYSBzcGVlZCAoc2NhbGFyKSAqLyApICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUaGlzIGNodW5rIGlzIG91dCBvZiB2aWV3LCBhbmQgd2UgYXJlIGRvbmUgd2l0aCBpdC5cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtMaXN0LnJlbW92ZSggY2h1bmsgKTtcclxuICAgICAgICAgIHRoaXMuZXhlbXB0RnJvbVRyYW5zZmVyRW5lcmd5Q2h1bmtzLnJlbW92ZSggY2h1bmsgKTtcclxuICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cC5kaXNwb3NlRWxlbWVudCggY2h1bmsgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBhdGggbm90IGZ1bGx5IHRyYXZlcnNlZFxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gU2VlIGlmIHRoaXMgZW5lcmd5IGNodW5rcyBzaG91bGQgYmUgdHJhbnNmZXJyZWQgdG8gdGhlXHJcbiAgICAgICAgLy8gbmV4dCBlbmVyZ3kgc3lzdGVtLlxyXG4gICAgICAgIGlmICggY2h1bmsuZW5lcmd5VHlwZVByb3BlcnR5LmdldCgpID09PSBFbmVyZ3lUeXBlLk1FQ0hBTklDQUwgJiZcclxuICAgICAgICAgICAgIHRoaXMuc3RlYW1Qb3dlcmFibGVFbGVtZW50SW5QbGFjZVByb3BlcnR5LmdldCgpICYmXHJcbiAgICAgICAgICAgICBFTkVSR1lfQ0hVTktfVFJBTlNGRVJfRElTVEFOQ0VfUkFOR0UuY29udGFpbnMoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5kaXN0YW5jZSggY2h1bmsucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApICkgJiZcclxuICAgICAgICAgICAgICF0aGlzLmV4ZW1wdEZyb21UcmFuc2ZlckVuZXJneUNodW5rcy5pbmNsdWRlcyggY2h1bmsgKSApIHtcclxuXHJcbiAgICAgICAgICAvLyBTZW5kIHRoaXMgY2h1bmsgdG8gdGhlIG5leHQgZW5lcmd5IHN5c3RlbS5cclxuICAgICAgICAgIGlmICggdGhpcy50cmFuc2Zlck5leHRBdmFpbGFibGVDaHVuayApIHtcclxuICAgICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QucmVtb3ZlKCBjaHVuayApO1xyXG4gICAgICAgICAgICB0aGlzLm91dGdvaW5nRW5lcmd5Q2h1bmtzLnB1c2goIGNodW5rICk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzLnJlbW92ZSggbW92ZXIgKTtcclxuICAgICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmRpc3Bvc2VFbGVtZW50KCBtb3ZlciApO1xyXG5cclxuICAgICAgICAgICAgLy8gQWx0ZXJuYXRlIHNlbmRpbmcgb3Iga2VlcGluZyBjaHVua3MuXHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNmZXJOZXh0QXZhaWxhYmxlQ2h1bmsgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIERvbid0IHRyYW5zZmVyIHRoaXMgY2h1bmsuXHJcbiAgICAgICAgICAvLyBTZXQgdXAgdG8gdHJhbnNmZXIgdGhlIG5leHQgb25lLlxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhlbXB0RnJvbVRyYW5zZmVyRW5lcmd5Q2h1bmtzLnB1c2goIGNodW5rICk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRyYW5zZmVyTmV4dEF2YWlsYWJsZUNodW5rID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gaWYgYSBjaHVuayBoYXMgcmVhY2hlZCB0aGUgcG9zaXRpb24gd2hlcmUgaXQgc2hvdWxkIHRyYW5zZmVyIHRvIHRoZSBuZXh0IHN5c3RlbSwgYnV0IG5vIHN0ZWFtIHBvd2VyYWJsZVxyXG4gICAgICAgIC8vIGVsZW1lbnQgaXMgaW4gcGxhY2UsIGFkZCB0aGUgY2h1bmsgdG8gdGhlIGxpc3Qgb2Ygbm9uIHRyYW5zZmVyc1xyXG4gICAgICAgIGVsc2UgaWYgKCAhdGhpcy5zdGVhbVBvd2VyYWJsZUVsZW1lbnRJblBsYWNlUHJvcGVydHkuZ2V0KCkgJiZcclxuICAgICAgICAgICAgICAgICAgRU5FUkdZX0NIVU5LX1RSQU5TRkVSX0RJU1RBTkNFX1JBTkdFLmNvbnRhaW5zKFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5kaXN0YW5jZSggY2h1bmsucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApXHJcbiAgICAgICAgICAgICAgICAgICkgJiZcclxuICAgICAgICAgICAgICAgICAgIXRoaXMuZXhlbXB0RnJvbVRyYW5zZmVyRW5lcmd5Q2h1bmtzLmluY2x1ZGVzKCBjaHVuayApICkge1xyXG4gICAgICAgICAgdGhpcy5leGVtcHRGcm9tVHJhbnNmZXJFbmVyZ3lDaHVua3MucHVzaCggY2h1bmsgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgcHJlbG9hZEVuZXJneUNodW5rcygpIHtcclxuICAgIHRoaXMuY2xlYXJFbmVyZ3lDaHVua3MoKTtcclxuXHJcbiAgICAvLyBSZXR1cm4gaWYgbm8gY2h1bmtzIHRvIGFkZC5cclxuICAgIGlmICggdGhpcy5lbmVyZ3lQcm9kdWN0aW9uUmF0ZVByb3BlcnR5LmdldCgpID09PSAwICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHByZWxvYWRDb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgY29uc3QgZHQgPSAxIC8gRUZBQ0NvbnN0YW50cy5GUkFNRVNfUEVSX1NFQ09ORDtcclxuICAgIGxldCBlbmVyZ3lTaW5jZUxhc3RDaHVuayA9IEVGQUNDb25zdGFudHMuRU5FUkdZX1BFUl9DSFVOSyAqIDAuOTk7XHJcblxyXG4gICAgLy8gU2ltdWxhdGUgZW5lcmd5IGNodW5rcyBtb3ZpbmcgdGhyb3VnaCB0aGUgc3lzdGVtLlxyXG4gICAgd2hpbGUgKCAhcHJlbG9hZENvbXBsZXRlICkge1xyXG4gICAgICBpZiAoIHRoaXMuaGVhdFByb3BvcnRpb25Qcm9wZXJ0eS52YWx1ZSA+IDAgKSB7XHJcbiAgICAgICAgLy8gaWYgdGhlIGhlYXRlciBpcyBvbiwgZGV0ZXJtaW5lIHRoZSByYXRlIG9mIGNodW5rIHJlbGVhc2UgYnkgaXRzIGxldmVsXHJcbiAgICAgICAgZW5lcmd5U2luY2VMYXN0Q2h1bmsgKz0gdGhpcy5oZWF0UHJvcG9ydGlvblByb3BlcnR5LnZhbHVlICogRUZBQ0NvbnN0YW50cy5NQVhfRU5FUkdZX1BST0RVQ1RJT05fUkFURSAqIGR0O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIG90aGVyd2lzZSwgZGV0ZXJtaW5lIGJ5IHRoZSBleGlzdGluZyBlbmVyZ3kgaW4gdGhlIGtldHRsZVxyXG4gICAgICAgIGVuZXJneVNpbmNlTGFzdENodW5rICs9IHRoaXMuZW5lcmd5UHJvZHVjdGlvblJhdGVQcm9wZXJ0eS5nZXQoKSAqIGR0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIGVuZXJneVNpbmNlTGFzdENodW5rID49IEVGQUNDb25zdGFudHMuRU5FUkdZX1BFUl9DSFVOSyApIHtcclxuICAgICAgICBsZXQgaW5pdGlhbFBvc2l0aW9uO1xyXG4gICAgICAgIGNvbnN0IHhSYW5nZSA9IFRIRVJNQUxfRU5FUkdZX0NIVU5LX1hfT1JJR0lOX1JBTkdFO1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMuaGVhdFByb3BvcnRpb25Qcm9wZXJ0eS52YWx1ZSA+IDAgKSB7XHJcblxyXG4gICAgICAgICAgLy8gQ3JlYXRlIGEgdGhlcm1hbCBjaHVuayBpbnNpZGUgdGhlIGJ1cm5lci5cclxuICAgICAgICAgIGluaXRpYWxQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCArIHhSYW5nZS5taW4gKyBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogeFJhbmdlLmdldExlbmd0aCgpLFxyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSArIFRIRVJNQUxfRU5FUkdZX0NIVU5LX1lfT1JJR0lOXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBDcmVhdGUgYSB0aGVybWFsIGNodW5rIGluc2lkZSB0aGUgdGVhIGtldHRsZS5cclxuICAgICAgICAgIGluaXRpYWxQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCwgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGVuZXJneUNodW5rID0gdGhpcy5lbmVyZ3lDaHVua0dyb3VwLmNyZWF0ZU5leHRFbGVtZW50KFxyXG4gICAgICAgICAgRW5lcmd5VHlwZS5USEVSTUFMLFxyXG4gICAgICAgICAgaW5pdGlhbFBvc2l0aW9uLFxyXG4gICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHlcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtMaXN0LnB1c2goIGVuZXJneUNodW5rICk7XHJcblxyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtNb3ZlcnMucHVzaCggdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCBlbmVyZ3lDaHVuayxcclxuICAgICAgICAgIGNyZWF0ZVRoZXJtYWxFbmVyZ3lDaHVua1BhdGgoIGluaXRpYWxQb3NpdGlvbiwgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlICksXHJcbiAgICAgICAgICBFRkFDQ29uc3RhbnRzLkVORVJHWV9DSFVOS19WRUxPQ0lUWVxyXG4gICAgICAgICkgKTtcclxuXHJcbiAgICAgICAgZW5lcmd5U2luY2VMYXN0Q2h1bmsgLT0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVcGRhdGUgZW5lcmd5IGNodW5rIHBvc2l0aW9ucy5cclxuICAgICAgdGhpcy5tb3ZlRW5lcmd5Q2h1bmtzKCBkdCApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLm91dGdvaW5nRW5lcmd5Q2h1bmtzLmxlbmd0aCA+IDAgfHwgdGhpcy5leGVtcHRGcm9tVHJhbnNmZXJFbmVyZ3lDaHVua3MubGVuZ3RoID4gMCApIHtcclxuXHJcbiAgICAgICAgLy8gQW4gZW5lcmd5IGNodW5rIGhhcyB0cmF2ZXJzZWQgdG8gdGhlIG91dHB1dCBvZiB0aGlzIHN5c3RlbSwgb3IgcGFzc2VkIHRoZSBwb2ludCBvZiBtb3ZpbmcgdG8gdGhlIG5leHQgc3lzdGVtLlxyXG4gICAgICAgIHByZWxvYWRDb21wbGV0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIGEgY2h1bmsgd2FzIHJlY2VudGx5IHJlbGVhc2VkIGZyb20gdGhlIGJ1cm5lciBiZWNhdXNlIG9mIHByZWxvYWRpbmcsIHNvIHJlc2V0IHRoZSBoZWF0IGVuZXJneSBsZXZlbFxyXG4gICAgICAgIHRoaXMuaGVhdEVuZXJneVByb2R1Y2VkU2luY2VMYXN0Q2h1bmsgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7RW5lcmd5fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBnZXRFbmVyZ3lPdXRwdXRSYXRlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBFbmVyZ3koIEVuZXJneVR5cGUuTUVDSEFOSUNBTCwgdGhpcy5lbmVyZ3lQcm9kdWN0aW9uUmF0ZVByb3BlcnR5LnZhbHVlLCBNYXRoLlBJIC8gMiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGVhY3RpdmF0ZSB0aGUgdGVhIGtldHRsZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkZWFjdGl2YXRlKCkge1xyXG4gICAgc3VwZXIuZGVhY3RpdmF0ZSgpO1xyXG4gICAgdGhpcy5oZWF0UHJvcG9ydGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmVuZXJneVByb2R1Y3Rpb25SYXRlUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBjbGVhckVuZXJneUNodW5rcygpIHtcclxuICAgIHN1cGVyLmNsZWFyRW5lcmd5Q2h1bmtzKCk7XHJcbiAgICB0aGlzLmV4ZW1wdEZyb21UcmFuc2ZlckVuZXJneUNodW5rcy5jbGVhcigpOyAvLyBEaXNwb3NhbCBpcyBkb25lIHdoZW4gZW5lcmd5Q2h1bmtMaXN0IGlzIGNsZWFyZWRcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtNb3ZlcnMuZm9yRWFjaCggbW92ZXIgPT4gdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmRpc3Bvc2VFbGVtZW50KCBtb3ZlciApICk7XHJcbiAgICB0aGlzLmVuZXJneUNodW5rTW92ZXJzLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljIChFbmVyZ3lTeXN0ZW1FbGVtZW50SU8pXHJcbiAgICogQHJldHVybnMge09iamVjdH1cclxuICAgKi9cclxuICB0b1N0YXRlT2JqZWN0KCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaGVhdEVuZXJneVByb2R1Y2VkU2luY2VMYXN0Q2h1bms6IHRoaXMuaGVhdEVuZXJneVByb2R1Y2VkU2luY2VMYXN0Q2h1bmssXHJcbiAgICAgIHRyYW5zZmVyTmV4dEF2YWlsYWJsZUNodW5rOiB0aGlzLnRyYW5zZmVyTmV4dEF2YWlsYWJsZUNodW5rXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpYyAoRW5lcmd5U3lzdGVtRWxlbWVudElPKVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZU9iamVjdCAtIHNlZSB0aGlzLnRvU3RhdGVPYmplY3QoKVxyXG4gICAqL1xyXG4gIGFwcGx5U3RhdGUoIHN0YXRlT2JqZWN0ICkge1xyXG4gICAgdGhpcy5oZWF0RW5lcmd5UHJvZHVjZWRTaW5jZUxhc3RDaHVuayA9IHN0YXRlT2JqZWN0LmhlYXRFbmVyZ3lQcm9kdWNlZFNpbmNlTGFzdENodW5rO1xyXG4gICAgdGhpcy50cmFuc2Zlck5leHRBdmFpbGFibGVDaHVuayA9IHN0YXRlT2JqZWN0LnRyYW5zZmVyTmV4dEF2YWlsYWJsZUNodW5rO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7VmVjdG9yMn0gc3RhcnRQb3NpdGlvblxyXG4gKiBAcGFyYW0ge1ZlY3RvcjJ9IHRlYUtldHRsZVBvc2l0aW9uXHJcbiAqIEByZXR1cm5zIHtWZWN0b3IyW119XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5jb25zdCBjcmVhdGVUaGVybWFsRW5lcmd5Q2h1bmtQYXRoID0gKCBzdGFydFBvc2l0aW9uLCB0ZWFLZXR0bGVQb3NpdGlvbiApID0+IHtcclxuICBjb25zdCBwYXRoID0gW107XHJcblxyXG4gIHBhdGgucHVzaCggbmV3IFZlY3RvcjIoIHN0YXJ0UG9zaXRpb24ueCwgdGVhS2V0dGxlUG9zaXRpb24ueSArIFdBVEVSX1NVUkZBQ0VfSEVJR0hUX09GRlNFVCApICk7XHJcblxyXG4gIHJldHVybiBwYXRoO1xyXG59O1xyXG5cclxuLy8gc3RhdGljc1xyXG5UZWFLZXR0bGUuU1BPVVRfRVhJVF9BTkdMRSA9IFNQT1VUX0VYSVRfQU5HTEU7XHJcblxyXG5lbmVyZ3lGb3Jtc0FuZENoYW5nZXMucmVnaXN0ZXIoICdUZWFLZXR0bGUnLCBUZWFLZXR0bGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgVGVhS2V0dGxlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sOENBQThDO0FBQ2hGLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxpQkFBaUIsTUFBTSxzQ0FBc0M7QUFDcEUsT0FBT0MsYUFBYSxNQUFNLCtCQUErQjtBQUN6RCxPQUFPQyxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MscUJBQXFCLE1BQU0s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