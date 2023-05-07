// Copyright 2016-2022, University of Colorado Boulder

/**
 * a type that represents a faucet that can be turned on to provide mechanical energy to other energy system elements
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import faucetIcon_png from '../../../images/faucetIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Energy from './Energy.js';
import EnergySource from './EnergySource.js';
import WaterDrop from './WaterDrop.js';

// constants
const FALLING_ENERGY_CHUNK_VELOCITY = 0.09; // in meters/second
const MAX_WATER_WIDTH = 0.014; // in meters
const MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER = 0.5; // in meters
const WATER_DROPS_PER_SECOND = 30;
const WATER_DROP_CREATION_PERIOD = 1 / WATER_DROPS_PER_SECOND; // in seconds
const ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE = new Range(0.07, 0.08);
const FALLING_WATER_DELAY = 0.4; // time to pass before wheel starts turning after faucet starts, in seconds
const DT = 1 / EFACConstants.FRAMES_PER_SECOND; // artificial time step, in seconds

// where the water and energy chunks originate inside the faucet head, not where they emerge from the faucet
const OFFSET_FROM_CENTER_TO_WATER_ORIGIN = new Vector2(0.069, 0.105);

// center-x, bottom-y of the faucet head - where the water and energy chunks emerge from
const OFFSET_FROM_CENTER_TO_FAUCET_HEAD = OFFSET_FROM_CENTER_TO_WATER_ORIGIN.plusXY(0, -0.022);

// The following acceleration constant defines the rate at which the water flows from the faucet.  The value used is
// not the actual value in Earth's gravitational field - it has been tweaked for optimal visual effect.
const ACCELERATION_DUE_TO_GRAVITY = new Vector2(0, -0.15);
class FaucetAndWater extends EnergySource {
  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {BooleanProperty} waterPowerableElementInPlaceProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {Object} [options]
   */
  constructor(energyChunksVisibleProperty, waterPowerableElementInPlaceProperty, energyChunkGroup, options) {
    options = merge({
      tandem: Tandem.REQUIRED
    }, options);
    super(new Image(faucetIcon_png), options);

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.waterFaucet;

    // @private
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @private {BooleanProperty} - a flag that is used to decide whether to pass energy chunks to the next energy
    // system element
    this.waterPowerableElementInPlaceProperty = waterPowerableElementInPlaceProperty;

    // @public {NumberProperty}
    this.flowProportionProperty = new NumberProperty(0, {
      range: new Range(0, 1),
      tandem: options.tandem.createTandem('flowProportionProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'proportion of water flowing from the faucet'
    });

    // @public {read-only) {WaterDrop[]} - water drops that comprise the stream of water
    this.waterDrops = [];

    // @private {EnergyChunks[]} - list of chunks that are exempt from being transferred to the next energy system element
    this.exemptFromTransferEnergyChunks = createObservableArray({
      tandem: options.tandem.createTandem('exemptFromTransferEnergyChunks'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunk.EnergyChunkIO))
    });
    assert && this.outgoingEnergyChunks.addItemAddedListener(chunk => {
      assert && assert(!this.exemptFromTransferEnergyChunks.includes(chunk), 'Exempt means it should not go onto outgoing list');
    });

    // @private {Energy[]} - list of Energy to be sent after a delay has passed
    this.flowEnergyDelay = [];

    // @private {number}
    this.energySinceLastChunk = 0;

    // @private {number}
    this.timeSinceLastDropCreation = 0;

    // @private {boolean} - flag for whether next chunk should be transferred or kept, used to alternate transfer with
    // non-transfer
    this.transferNextAvailableChunk = true;

    // @private {boolean} - flag for whether the water drops have been fully preloaded
    this.waterDropsPreloaded = true;

    // @private {EnergyChunkGroup}
    this.energyChunkGroup = energyChunkGroup;
    this.flowProportionProperty.lazyLink((newFlowRate, oldFlowRate) => {
      // Prime the pump when the flow goes from zero to above zero so that water starts flowing right away.
      if (oldFlowRate === 0 && newFlowRate > 0) {
        this.timeSinceLastDropCreation = WATER_DROP_CREATION_PERIOD;
      }
    });

    // Preload falling water animation after state has been set
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.addListener(() => {
      this.preloadWaterDrops();
    });
  }

  /**
   * create a new energy chunk with the appropriate attributes for falling water
   * @returns {EnergyChunk}
   * @private
   */
  createNewChunk() {
    // random x value within water column for "watery" appearance
    const x = (dotRandom.nextDouble() - 0.5) * this.flowProportionProperty.value * MAX_WATER_WIDTH / 2;
    const initialPosition = this.positionProperty.value.plus(OFFSET_FROM_CENTER_TO_WATER_ORIGIN).plus(new Vector2(x, 0));
    const velocity = new Vector2(0, -FALLING_ENERGY_CHUNK_VELOCITY);
    return this.energyChunkGroup.createNextElement(EnergyType.MECHANICAL, initialPosition, velocity, this.energyChunksVisibleProperty);
  }

  /**
   * if enough energy has been produced since the last energy chunk was emitted, release another one into the system
   *
   * @private
   */
  addChunkIfEnoughEnergy() {
    if (this.energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK) {
      const chunk = this.createNewChunk();
      this.energyChunkList.push(chunk);
      this.energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
    }
  }

  /**
   * step in time
   * @param  {number} dt time step, in seconds
   * @returns {Energy}
   * @public
   */
  step(dt) {
    if (!this.activeProperty.value) {
      return new Energy(EnergyType.MECHANICAL, 0, -Math.PI / 2);
    }
    this.stepWaterDrops(dt);

    // check if time to emit an energy chunk and, if so, do it
    this.energySinceLastChunk += EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportionProperty.value * dt;
    this.addChunkIfEnoughEnergy();

    // update energy chunk positions
    this.energyChunkList.forEach(chunk => {
      // make the chunk fall
      chunk.translateBasedOnVelocity(dt);

      // see if chunk is in the position where it can be transferred to the next energy system
      const yPosition = this.positionProperty.get().plus(OFFSET_FROM_CENTER_TO_WATER_ORIGIN).y - chunk.positionProperty.value.y;
      const chunkInRange = ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE.contains(yPosition);
      const chunkExempt = this.exemptFromTransferEnergyChunks.indexOf(chunk) >= 0;
      if (this.waterPowerableElementInPlaceProperty.value && chunkInRange && !chunkExempt) {
        if (this.transferNextAvailableChunk) {
          // send this chunk to the next energy system
          this.energyChunkList.remove(chunk);
          this.outgoingEnergyChunks.push(chunk);

          // alternate sending or keeping chunks
          this.transferNextAvailableChunk = false;
        } else {
          // don't transfer this chunk
          this.exemptFromTransferEnergyChunks.push(chunk);

          // set up to transfer the next one
          this.transferNextAvailableChunk = true;
        }
      }

      // remove the energy chunk if it is out of visible range
      const chunkDistance = this.positionProperty.get().plus(OFFSET_FROM_CENTER_TO_WATER_ORIGIN).distance(chunk.positionProperty.value);
      if (chunkDistance > MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER) {
        this.energyChunkList.remove(chunk);
        this.exemptFromTransferEnergyChunks.remove(chunk);
        this.energyChunkGroup.disposeElement(chunk);
      }
    });

    // generate the appropriate amount of energy
    const energyAmount = EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportionProperty.value * dt;

    // add incoming energy to delay queue
    this.flowEnergyDelay.push(new Energy(EnergyType.MECHANICAL, energyAmount, -Math.PI / 2, {
      creationTime: new Date().getTime()
    }));

    // send along saved energy values if enough time has passed
    if (this.flowEnergyDelay[0].creationTime + FALLING_WATER_DELAY * 1000 <= new Date().getTime()) {
      return this.flowEnergyDelay.shift();
    } else {
      return new Energy(EnergyType.MECHANICAL, 0, -Math.PI / 2);
    }
  }

  /**
   * steps only the water drops
   * @param {number} dt
   * @private
   */
  stepWaterDrops(dt) {
    // make the existing water droplets fall
    this.waterDrops.forEach(drop => {
      const v = drop.velocityProperty.value;
      drop.velocityProperty.set(v.plus(ACCELERATION_DUE_TO_GRAVITY.times(dt)));
      drop.position.set(drop.position.plus(v.times(dt)));
    });

    // add new water droplets as needed based on flow rate
    if (this.flowProportionProperty.value > 0) {
      this.timeSinceLastDropCreation += dt;
      while (this.timeSinceLastDropCreation >= WATER_DROP_CREATION_PERIOD) {
        const dropTime = this.timeSinceLastDropCreation - WATER_DROP_CREATION_PERIOD;

        // Create a new water drop of somewhat random size and position it based on the time since the last one.
        const initialPosition = new Vector2(0, 0.5 * ACCELERATION_DUE_TO_GRAVITY.y * dropTime * dropTime);
        const initialWidth = this.flowProportionProperty.value * MAX_WATER_WIDTH * (1 + (dotRandom.nextDouble() - 0.5) * 0.2);
        const initialSize = new Dimension2(initialWidth, initialWidth);
        this.waterDrops.push(new WaterDrop(initialPosition, new Vector2(0, ACCELERATION_DUE_TO_GRAVITY.y * dropTime), initialSize));
        this.timeSinceLastDropCreation -= WATER_DROP_CREATION_PERIOD;
      }
    } else {
      this.waterDropsPreloaded = true;
    }

    // remove drops that have run their course
    const waterDropsCopy = this.waterDrops;
    waterDropsCopy.forEach(drop => {
      if (drop.position.distance(this.positionProperty.value) > MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER) {
        const index = this.waterDrops.indexOf(drop);
        if (index !== -1) {
          this.waterDrops.splice(index, 1);
          this.waterDropsPreloaded = true;
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

    // define translation function here to avoid creating anonymous function inside loop
    const translateChunks = (chunks, dt) => {
      chunks.forEach(chunk => {
        chunk.translateBasedOnVelocity(dt);
      });
    };
    let preloadTime = 3; // In seconds, empirically determined.

    let tempEnergyChunkList = [];
    if (this.getEnergyOutputRate().amount > 0) {
      // preload energy chunks into the system
      while (preloadTime > 0) {
        this.energySinceLastChunk += this.getEnergyOutputRate().amount * DT;
        if (this.energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK) {
          tempEnergyChunkList.push(this.createNewChunk());
          this.energySinceLastChunk = this.energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        }

        // make the chunks fall
        translateChunks(tempEnergyChunkList, DT);
        preloadTime -= DT;
      }

      // Now that the new chunks are in place, make sure that there is actually water falling where the chunks ended up
      // and, if not, remove them.  This is a rare but possible case that can occur when preloading right after turning
      // on the faucet.  For more on this, please see https://github.com/phetsims/energy-forms-and-changes/issues/347.
      tempEnergyChunkList = tempEnergyChunkList.filter(ec => {
        const yOffsetForWaterDrops = this.positionProperty.value.y + OFFSET_FROM_CENTER_TO_WATER_ORIGIN.y;
        let verticalDistanceToNearestWaterDrop = Number.POSITIVE_INFINITY;
        this.waterDrops.forEach(waterDrop => {
          const verticalDistanceToWaterDrop = Math.abs(waterDrop.position.y + yOffsetForWaterDrops - ec.positionProperty.value.y);
          if (verticalDistanceToWaterDrop < verticalDistanceToNearestWaterDrop) {
            verticalDistanceToNearestWaterDrop = verticalDistanceToWaterDrop;
          }
        });
        return verticalDistanceToNearestWaterDrop < 0.01; // distance threshold empirically determined
      });
    } else if (this.waterDrops.length > 0) {
      // The faucet is off, but water is present, so we must be preloading energy chunks just after the faucet was
      // turned off, which means we need to add energy chunks to the following water.  This is a rare but possible
      // condition.  For more info as to why this is needed, see
      // https://github.com/phetsims/energy-forms-and-changes/issues/347.

      // the top of the water column will be where the last drop is
      const topWaterDrop = this.waterDrops[this.waterDrops.length - 1];

      // the bottom drop is the first one
      const bottomWaterDrop = this.waterDrops[0];

      // Figure out how many energy chunks to add based on the size of the stream of water droplets.  This calculation
      // was empirically determined so that the number of energy chunks roughly matches what there are when the faucet
      // is running at full output.
      const waterColumnDistanceSpan = topWaterDrop.position.y - bottomWaterDrop.position.y;
      const numberOfChunksToAdd = Utils.roundSymmetric(waterColumnDistanceSpan / 0.05);
      const distanceBetweenChunks = waterColumnDistanceSpan / numberOfChunksToAdd;

      // add the energy chunks and position them along the stream of water droplets
      _.times(numberOfChunksToAdd, index => {
        // create a new energy chunk
        const ec = this.createNewChunk();
        tempEnergyChunkList.push(ec);

        // position the new energy chunk on the water stream
        ec.positionProperty.set(ec.positionProperty.value.plusXY(0, topWaterDrop.position.y - distanceBetweenChunks * index));
      });
    }

    // now that they are positioned, add these to the 'real' list of energy chunks
    tempEnergyChunkList.forEach(ec => {
      this.energyChunkList.push(ec);
    });
  }

  /**
   * Preloads the falling water animation to be in
   * @public
   */
  preloadWaterDrops() {
    this.waterDropsPreloaded = false;
    while (!this.waterDropsPreloaded) {
      this.stepWaterDrops(DT);
    }
  }

  /**
   * @returns {Energy}
   * @public
   * @override
   */
  getEnergyOutputRate() {
    const energyAmount = EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportionProperty.value;
    assert && assert(energyAmount >= 0, `EnergyAmount is ${energyAmount}`);
    return new Energy(EnergyType.MECHANICAL, energyAmount, -Math.PI / 2);
  }

  /**
   * @public
   * @override
   */
  deactivate() {
    this.flowProportionProperty.reset();
    this.waterDrops.length = 0;
    this.flowEnergyDelay.length = 0;
    super.deactivate();
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.exemptFromTransferEnergyChunks.clear(); // Disposal is done when energyChunkList is cleared
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @returns {Object}
   */
  toStateObject() {
    return {
      waterDropsPreloaded: this.waterDropsPreloaded,
      transferNextAvailableChunk: this.transferNextAvailableChunk,
      energySinceLastChunk: this.energySinceLastChunk
    };
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @param {Object} stateObject - see this.toStateObject()
   */
  applyState(stateObject) {
    this.waterDropsPreloaded = stateObject.waterDropsPreloaded;
    this.transferNextAvailableChunk = stateObject.transferNextAvailableChunk;
    this.energySinceLastChunk = stateObject.energySinceLastChunk;
  }
}

// statics
FaucetAndWater.OFFSET_FROM_CENTER_TO_WATER_ORIGIN = OFFSET_FROM_CENTER_TO_WATER_ORIGIN;
FaucetAndWater.OFFSET_FROM_CENTER_TO_FAUCET_HEAD = OFFSET_FROM_CENTER_TO_FAUCET_HEAD;
FaucetAndWater.MAX_WATER_WIDTH = MAX_WATER_WIDTH;
energyFormsAndChanges.register('FaucetAndWater', FaucetAndWater);
export default FaucetAndWater;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJOdW1iZXJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJkb3RSYW5kb20iLCJSYW5nZSIsIlV0aWxzIiwiVmVjdG9yMiIsIm1lcmdlIiwiSW1hZ2UiLCJUYW5kZW0iLCJSZWZlcmVuY2VJTyIsImZhdWNldEljb25fcG5nIiwiRUZBQ0NvbnN0YW50cyIsIkVuZXJneUNodW5rIiwiRW5lcmd5VHlwZSIsImVuZXJneUZvcm1zQW5kQ2hhbmdlcyIsIkVuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MiLCJFbmVyZ3kiLCJFbmVyZ3lTb3VyY2UiLCJXYXRlckRyb3AiLCJGQUxMSU5HX0VORVJHWV9DSFVOS19WRUxPQ0lUWSIsIk1BWF9XQVRFUl9XSURUSCIsIk1BWF9ESVNUQU5DRV9GUk9NX0ZBVUNFVF9UT19CT1RUT01fT0ZfV0FURVIiLCJXQVRFUl9EUk9QU19QRVJfU0VDT05EIiwiV0FURVJfRFJPUF9DUkVBVElPTl9QRVJJT0QiLCJFTkVSR1lfQ0hVTktfVFJBTlNGRVJfRElTVEFOQ0VfUkFOR0UiLCJGQUxMSU5HX1dBVEVSX0RFTEFZIiwiRFQiLCJGUkFNRVNfUEVSX1NFQ09ORCIsIk9GRlNFVF9GUk9NX0NFTlRFUl9UT19XQVRFUl9PUklHSU4iLCJPRkZTRVRfRlJPTV9DRU5URVJfVE9fRkFVQ0VUX0hFQUQiLCJwbHVzWFkiLCJBQ0NFTEVSQVRJT05fRFVFX1RPX0dSQVZJVFkiLCJGYXVjZXRBbmRXYXRlciIsImNvbnN0cnVjdG9yIiwiZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5Iiwid2F0ZXJQb3dlcmFibGVFbGVtZW50SW5QbGFjZVByb3BlcnR5IiwiZW5lcmd5Q2h1bmtHcm91cCIsIm9wdGlvbnMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImExMXlOYW1lIiwiYTExeSIsIndhdGVyRmF1Y2V0IiwiZmxvd1Byb3BvcnRpb25Qcm9wZXJ0eSIsInJhbmdlIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9IaWdoRnJlcXVlbmN5IiwicGhldGlvRG9jdW1lbnRhdGlvbiIsIndhdGVyRHJvcHMiLCJleGVtcHRGcm9tVHJhbnNmZXJFbmVyZ3lDaHVua3MiLCJwaGV0aW9UeXBlIiwiT2JzZXJ2YWJsZUFycmF5SU8iLCJFbmVyZ3lDaHVua0lPIiwiYXNzZXJ0Iiwib3V0Z29pbmdFbmVyZ3lDaHVua3MiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsImNodW5rIiwiaW5jbHVkZXMiLCJmbG93RW5lcmd5RGVsYXkiLCJlbmVyZ3lTaW5jZUxhc3RDaHVuayIsInRpbWVTaW5jZUxhc3REcm9wQ3JlYXRpb24iLCJ0cmFuc2Zlck5leHRBdmFpbGFibGVDaHVuayIsIndhdGVyRHJvcHNQcmVsb2FkZWQiLCJsYXp5TGluayIsIm5ld0Zsb3dSYXRlIiwib2xkRmxvd1JhdGUiLCJQSEVUX0lPX0VOQUJMRUQiLCJwaGV0IiwicGhldGlvIiwicGhldGlvRW5naW5lIiwicGhldGlvU3RhdGVFbmdpbmUiLCJzdGF0ZVNldEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInByZWxvYWRXYXRlckRyb3BzIiwiY3JlYXRlTmV3Q2h1bmsiLCJ4IiwibmV4dERvdWJsZSIsInZhbHVlIiwiaW5pdGlhbFBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsInBsdXMiLCJ2ZWxvY2l0eSIsImNyZWF0ZU5leHRFbGVtZW50IiwiTUVDSEFOSUNBTCIsImFkZENodW5rSWZFbm91Z2hFbmVyZ3kiLCJFTkVSR1lfUEVSX0NIVU5LIiwiZW5lcmd5Q2h1bmtMaXN0IiwicHVzaCIsInN0ZXAiLCJkdCIsImFjdGl2ZVByb3BlcnR5IiwiTWF0aCIsIlBJIiwic3RlcFdhdGVyRHJvcHMiLCJNQVhfRU5FUkdZX1BST0RVQ1RJT05fUkFURSIsImZvckVhY2giLCJ0cmFuc2xhdGVCYXNlZE9uVmVsb2NpdHkiLCJ5UG9zaXRpb24iLCJnZXQiLCJ5IiwiY2h1bmtJblJhbmdlIiwiY29udGFpbnMiLCJjaHVua0V4ZW1wdCIsImluZGV4T2YiLCJyZW1vdmUiLCJjaHVua0Rpc3RhbmNlIiwiZGlzdGFuY2UiLCJkaXNwb3NlRWxlbWVudCIsImVuZXJneUFtb3VudCIsImNyZWF0aW9uVGltZSIsIkRhdGUiLCJnZXRUaW1lIiwic2hpZnQiLCJkcm9wIiwidiIsInZlbG9jaXR5UHJvcGVydHkiLCJzZXQiLCJ0aW1lcyIsInBvc2l0aW9uIiwiZHJvcFRpbWUiLCJpbml0aWFsV2lkdGgiLCJpbml0aWFsU2l6ZSIsIndhdGVyRHJvcHNDb3B5IiwiaW5kZXgiLCJzcGxpY2UiLCJwcmVsb2FkRW5lcmd5Q2h1bmtzIiwiY2xlYXJFbmVyZ3lDaHVua3MiLCJ0cmFuc2xhdGVDaHVua3MiLCJjaHVua3MiLCJwcmVsb2FkVGltZSIsInRlbXBFbmVyZ3lDaHVua0xpc3QiLCJnZXRFbmVyZ3lPdXRwdXRSYXRlIiwiYW1vdW50IiwiZmlsdGVyIiwiZWMiLCJ5T2Zmc2V0Rm9yV2F0ZXJEcm9wcyIsInZlcnRpY2FsRGlzdGFuY2VUb05lYXJlc3RXYXRlckRyb3AiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIndhdGVyRHJvcCIsInZlcnRpY2FsRGlzdGFuY2VUb1dhdGVyRHJvcCIsImFicyIsImxlbmd0aCIsInRvcFdhdGVyRHJvcCIsImJvdHRvbVdhdGVyRHJvcCIsIndhdGVyQ29sdW1uRGlzdGFuY2VTcGFuIiwibnVtYmVyT2ZDaHVua3NUb0FkZCIsInJvdW5kU3ltbWV0cmljIiwiZGlzdGFuY2VCZXR3ZWVuQ2h1bmtzIiwiXyIsImRlYWN0aXZhdGUiLCJyZXNldCIsImNsZWFyIiwidG9TdGF0ZU9iamVjdCIsImFwcGx5U3RhdGUiLCJzdGF0ZU9iamVjdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmF1Y2V0QW5kV2F0ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogYSB0eXBlIHRoYXQgcmVwcmVzZW50cyBhIGZhdWNldCB0aGF0IGNhbiBiZSB0dXJuZWQgb24gdG8gcHJvdmlkZSBtZWNoYW5pY2FsIGVuZXJneSB0byBvdGhlciBlbmVyZ3kgc3lzdGVtIGVsZW1lbnRzXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBBbmRyZXcgQWRhcmVcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvUmVmZXJlbmNlSU8uanMnO1xyXG5pbXBvcnQgZmF1Y2V0SWNvbl9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2ZhdWNldEljb25fcG5nLmpzJztcclxuaW1wb3J0IEVGQUNDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0VGQUNDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRW5lcmd5Q2h1bmsgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0VuZXJneUNodW5rLmpzJztcclxuaW1wb3J0IEVuZXJneVR5cGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0VuZXJneVR5cGUuanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzIGZyb20gJy4uLy4uL0VuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgRW5lcmd5IGZyb20gJy4vRW5lcmd5LmpzJztcclxuaW1wb3J0IEVuZXJneVNvdXJjZSBmcm9tICcuL0VuZXJneVNvdXJjZS5qcyc7XHJcbmltcG9ydCBXYXRlckRyb3AgZnJvbSAnLi9XYXRlckRyb3AuanMnO1xyXG5cclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBGQUxMSU5HX0VORVJHWV9DSFVOS19WRUxPQ0lUWSA9IDAuMDk7IC8vIGluIG1ldGVycy9zZWNvbmRcclxuY29uc3QgTUFYX1dBVEVSX1dJRFRIID0gMC4wMTQ7IC8vIGluIG1ldGVyc1xyXG5jb25zdCBNQVhfRElTVEFOQ0VfRlJPTV9GQVVDRVRfVE9fQk9UVE9NX09GX1dBVEVSID0gMC41OyAvLyBpbiBtZXRlcnNcclxuY29uc3QgV0FURVJfRFJPUFNfUEVSX1NFQ09ORCA9IDMwO1xyXG5jb25zdCBXQVRFUl9EUk9QX0NSRUFUSU9OX1BFUklPRCA9IDEgLyBXQVRFUl9EUk9QU19QRVJfU0VDT05EOyAvLyBpbiBzZWNvbmRzXHJcbmNvbnN0IEVORVJHWV9DSFVOS19UUkFOU0ZFUl9ESVNUQU5DRV9SQU5HRSA9IG5ldyBSYW5nZSggMC4wNywgMC4wOCApO1xyXG5jb25zdCBGQUxMSU5HX1dBVEVSX0RFTEFZID0gMC40OyAvLyB0aW1lIHRvIHBhc3MgYmVmb3JlIHdoZWVsIHN0YXJ0cyB0dXJuaW5nIGFmdGVyIGZhdWNldCBzdGFydHMsIGluIHNlY29uZHNcclxuY29uc3QgRFQgPSAxIC8gRUZBQ0NvbnN0YW50cy5GUkFNRVNfUEVSX1NFQ09ORDsgLy8gYXJ0aWZpY2lhbCB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuXHJcbi8vIHdoZXJlIHRoZSB3YXRlciBhbmQgZW5lcmd5IGNodW5rcyBvcmlnaW5hdGUgaW5zaWRlIHRoZSBmYXVjZXQgaGVhZCwgbm90IHdoZXJlIHRoZXkgZW1lcmdlIGZyb20gdGhlIGZhdWNldFxyXG5jb25zdCBPRkZTRVRfRlJPTV9DRU5URVJfVE9fV0FURVJfT1JJR0lOID0gbmV3IFZlY3RvcjIoIDAuMDY5LCAwLjEwNSApO1xyXG5cclxuLy8gY2VudGVyLXgsIGJvdHRvbS15IG9mIHRoZSBmYXVjZXQgaGVhZCAtIHdoZXJlIHRoZSB3YXRlciBhbmQgZW5lcmd5IGNodW5rcyBlbWVyZ2UgZnJvbVxyXG5jb25zdCBPRkZTRVRfRlJPTV9DRU5URVJfVE9fRkFVQ0VUX0hFQUQgPSBPRkZTRVRfRlJPTV9DRU5URVJfVE9fV0FURVJfT1JJR0lOLnBsdXNYWSggMCwgLTAuMDIyICk7XHJcblxyXG4vLyBUaGUgZm9sbG93aW5nIGFjY2VsZXJhdGlvbiBjb25zdGFudCBkZWZpbmVzIHRoZSByYXRlIGF0IHdoaWNoIHRoZSB3YXRlciBmbG93cyBmcm9tIHRoZSBmYXVjZXQuICBUaGUgdmFsdWUgdXNlZCBpc1xyXG4vLyBub3QgdGhlIGFjdHVhbCB2YWx1ZSBpbiBFYXJ0aCdzIGdyYXZpdGF0aW9uYWwgZmllbGQgLSBpdCBoYXMgYmVlbiB0d2Vha2VkIGZvciBvcHRpbWFsIHZpc3VhbCBlZmZlY3QuXHJcbmNvbnN0IEFDQ0VMRVJBVElPTl9EVUVfVE9fR1JBVklUWSA9IG5ldyBWZWN0b3IyKCAwLCAtMC4xNSApO1xyXG5cclxuY2xhc3MgRmF1Y2V0QW5kV2F0ZXIgZXh0ZW5kcyBFbmVyZ3lTb3VyY2Uge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW5Qcm9wZXJ0eX0gZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtCb29sZWFuUHJvcGVydHl9IHdhdGVyUG93ZXJhYmxlRWxlbWVudEluUGxhY2VQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7RW5lcmd5Q2h1bmtHcm91cH0gZW5lcmd5Q2h1bmtHcm91cFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LCB3YXRlclBvd2VyYWJsZUVsZW1lbnRJblBsYWNlUHJvcGVydHksIGVuZXJneUNodW5rR3JvdXAsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG5ldyBJbWFnZSggZmF1Y2V0SWNvbl9wbmcgKSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ30gLSBhMTF5IG5hbWVcclxuICAgIHRoaXMuYTExeU5hbWUgPSBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmExMXkud2F0ZXJGYXVjZXQ7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5ID0gZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtCb29sZWFuUHJvcGVydHl9IC0gYSBmbGFnIHRoYXQgaXMgdXNlZCB0byBkZWNpZGUgd2hldGhlciB0byBwYXNzIGVuZXJneSBjaHVua3MgdG8gdGhlIG5leHQgZW5lcmd5XHJcbiAgICAvLyBzeXN0ZW0gZWxlbWVudFxyXG4gICAgdGhpcy53YXRlclBvd2VyYWJsZUVsZW1lbnRJblBsYWNlUHJvcGVydHkgPSB3YXRlclBvd2VyYWJsZUVsZW1lbnRJblBsYWNlUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7TnVtYmVyUHJvcGVydHl9XHJcbiAgICB0aGlzLmZsb3dQcm9wb3J0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMSApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Zsb3dQcm9wb3J0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAncHJvcG9ydGlvbiBvZiB3YXRlciBmbG93aW5nIGZyb20gdGhlIGZhdWNldCdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtyZWFkLW9ubHkpIHtXYXRlckRyb3BbXX0gLSB3YXRlciBkcm9wcyB0aGF0IGNvbXByaXNlIHRoZSBzdHJlYW0gb2Ygd2F0ZXJcclxuICAgIHRoaXMud2F0ZXJEcm9wcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtFbmVyZ3lDaHVua3NbXX0gLSBsaXN0IG9mIGNodW5rcyB0aGF0IGFyZSBleGVtcHQgZnJvbSBiZWluZyB0cmFuc2ZlcnJlZCB0byB0aGUgbmV4dCBlbmVyZ3kgc3lzdGVtIGVsZW1lbnRcclxuICAgIHRoaXMuZXhlbXB0RnJvbVRyYW5zZmVyRW5lcmd5Q2h1bmtzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZXhlbXB0RnJvbVRyYW5zZmVyRW5lcmd5Q2h1bmtzJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5SU8oIFJlZmVyZW5jZUlPKCBFbmVyZ3lDaHVuay5FbmVyZ3lDaHVua0lPICkgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGFzc2VydCAmJiB0aGlzLm91dGdvaW5nRW5lcmd5Q2h1bmtzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBjaHVuayA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmV4ZW1wdEZyb21UcmFuc2ZlckVuZXJneUNodW5rcy5pbmNsdWRlcyggY2h1bmsgKSwgJ0V4ZW1wdCBtZWFucyBpdCBzaG91bGQgbm90IGdvIG9udG8gb3V0Z29pbmcgbGlzdCcgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7RW5lcmd5W119IC0gbGlzdCBvZiBFbmVyZ3kgdG8gYmUgc2VudCBhZnRlciBhIGRlbGF5IGhhcyBwYXNzZWRcclxuICAgIHRoaXMuZmxvd0VuZXJneURlbGF5ID0gW107XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn1cclxuICAgIHRoaXMuZW5lcmd5U2luY2VMYXN0Q2h1bmsgPSAwO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9XHJcbiAgICB0aGlzLnRpbWVTaW5jZUxhc3REcm9wQ3JlYXRpb24gPSAwO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIGZsYWcgZm9yIHdoZXRoZXIgbmV4dCBjaHVuayBzaG91bGQgYmUgdHJhbnNmZXJyZWQgb3Iga2VwdCwgdXNlZCB0byBhbHRlcm5hdGUgdHJhbnNmZXIgd2l0aFxyXG4gICAgLy8gbm9uLXRyYW5zZmVyXHJcbiAgICB0aGlzLnRyYW5zZmVyTmV4dEF2YWlsYWJsZUNodW5rID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBmbGFnIGZvciB3aGV0aGVyIHRoZSB3YXRlciBkcm9wcyBoYXZlIGJlZW4gZnVsbHkgcHJlbG9hZGVkXHJcbiAgICB0aGlzLndhdGVyRHJvcHNQcmVsb2FkZWQgPSB0cnVlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtFbmVyZ3lDaHVua0dyb3VwfVxyXG4gICAgdGhpcy5lbmVyZ3lDaHVua0dyb3VwID0gZW5lcmd5Q2h1bmtHcm91cDtcclxuXHJcbiAgICB0aGlzLmZsb3dQcm9wb3J0aW9uUHJvcGVydHkubGF6eUxpbmsoICggbmV3Rmxvd1JhdGUsIG9sZEZsb3dSYXRlICkgPT4ge1xyXG5cclxuICAgICAgLy8gUHJpbWUgdGhlIHB1bXAgd2hlbiB0aGUgZmxvdyBnb2VzIGZyb20gemVybyB0byBhYm92ZSB6ZXJvIHNvIHRoYXQgd2F0ZXIgc3RhcnRzIGZsb3dpbmcgcmlnaHQgYXdheS5cclxuICAgICAgaWYgKCBvbGRGbG93UmF0ZSA9PT0gMCAmJiBuZXdGbG93UmF0ZSA+IDAgKSB7XHJcbiAgICAgICAgdGhpcy50aW1lU2luY2VMYXN0RHJvcENyZWF0aW9uID0gV0FURVJfRFJPUF9DUkVBVElPTl9QRVJJT0Q7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBQcmVsb2FkIGZhbGxpbmcgd2F0ZXIgYW5pbWF0aW9uIGFmdGVyIHN0YXRlIGhhcyBiZWVuIHNldFxyXG4gICAgVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUucGhldGlvU3RhdGVFbmdpbmUuc3RhdGVTZXRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucHJlbG9hZFdhdGVyRHJvcHMoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGNyZWF0ZSBhIG5ldyBlbmVyZ3kgY2h1bmsgd2l0aCB0aGUgYXBwcm9wcmlhdGUgYXR0cmlidXRlcyBmb3IgZmFsbGluZyB3YXRlclxyXG4gICAqIEByZXR1cm5zIHtFbmVyZ3lDaHVua31cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGNyZWF0ZU5ld0NodW5rKCkge1xyXG5cclxuICAgIC8vIHJhbmRvbSB4IHZhbHVlIHdpdGhpbiB3YXRlciBjb2x1bW4gZm9yIFwid2F0ZXJ5XCIgYXBwZWFyYW5jZVxyXG4gICAgY29uc3QgeCA9ICggZG90UmFuZG9tLm5leHREb3VibGUoKSAtIDAuNSApICogdGhpcy5mbG93UHJvcG9ydGlvblByb3BlcnR5LnZhbHVlICogTUFYX1dBVEVSX1dJRFRIIC8gMjtcclxuXHJcbiAgICBjb25zdCBpbml0aWFsUG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWVcclxuICAgICAgLnBsdXMoIE9GRlNFVF9GUk9NX0NFTlRFUl9UT19XQVRFUl9PUklHSU4gKVxyXG4gICAgICAucGx1cyggbmV3IFZlY3RvcjIoIHgsIDAgKSApO1xyXG5cclxuICAgIGNvbnN0IHZlbG9jaXR5ID0gbmV3IFZlY3RvcjIoIDAsIC1GQUxMSU5HX0VORVJHWV9DSFVOS19WRUxPQ0lUWSApO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmVuZXJneUNodW5rR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIEVuZXJneVR5cGUuTUVDSEFOSUNBTCwgaW5pdGlhbFBvc2l0aW9uLCB2ZWxvY2l0eSwgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGlmIGVub3VnaCBlbmVyZ3kgaGFzIGJlZW4gcHJvZHVjZWQgc2luY2UgdGhlIGxhc3QgZW5lcmd5IGNodW5rIHdhcyBlbWl0dGVkLCByZWxlYXNlIGFub3RoZXIgb25lIGludG8gdGhlIHN5c3RlbVxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBhZGRDaHVua0lmRW5vdWdoRW5lcmd5KCkge1xyXG4gICAgaWYgKCB0aGlzLmVuZXJneVNpbmNlTGFzdENodW5rID49IEVGQUNDb25zdGFudHMuRU5FUkdZX1BFUl9DSFVOSyApIHtcclxuICAgICAgY29uc3QgY2h1bmsgPSB0aGlzLmNyZWF0ZU5ld0NodW5rKCk7XHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtMaXN0LnB1c2goIGNodW5rICk7XHJcbiAgICAgIHRoaXMuZW5lcmd5U2luY2VMYXN0Q2h1bmsgLT0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc3RlcCBpbiB0aW1lXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBkdCB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKiBAcmV0dXJucyB7RW5lcmd5fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuXHJcbiAgICBpZiAoICF0aGlzLmFjdGl2ZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICByZXR1cm4gbmV3IEVuZXJneSggRW5lcmd5VHlwZS5NRUNIQU5JQ0FMLCAwLCAtTWF0aC5QSSAvIDIgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnN0ZXBXYXRlckRyb3BzKCBkdCApO1xyXG5cclxuICAgIC8vIGNoZWNrIGlmIHRpbWUgdG8gZW1pdCBhbiBlbmVyZ3kgY2h1bmsgYW5kLCBpZiBzbywgZG8gaXRcclxuICAgIHRoaXMuZW5lcmd5U2luY2VMYXN0Q2h1bmsgKz0gRUZBQ0NvbnN0YW50cy5NQVhfRU5FUkdZX1BST0RVQ1RJT05fUkFURSAqIHRoaXMuZmxvd1Byb3BvcnRpb25Qcm9wZXJ0eS52YWx1ZSAqIGR0O1xyXG4gICAgdGhpcy5hZGRDaHVua0lmRW5vdWdoRW5lcmd5KCk7XHJcblxyXG4gICAgLy8gdXBkYXRlIGVuZXJneSBjaHVuayBwb3NpdGlvbnNcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtMaXN0LmZvckVhY2goIGNodW5rID0+IHtcclxuXHJcbiAgICAgIC8vIG1ha2UgdGhlIGNodW5rIGZhbGxcclxuICAgICAgY2h1bmsudHJhbnNsYXRlQmFzZWRPblZlbG9jaXR5KCBkdCApO1xyXG5cclxuICAgICAgLy8gc2VlIGlmIGNodW5rIGlzIGluIHRoZSBwb3NpdGlvbiB3aGVyZSBpdCBjYW4gYmUgdHJhbnNmZXJyZWQgdG8gdGhlIG5leHQgZW5lcmd5IHN5c3RlbVxyXG4gICAgICBjb25zdCB5UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkucGx1cyggT0ZGU0VUX0ZST01fQ0VOVEVSX1RPX1dBVEVSX09SSUdJTiApLnkgLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVuay5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnk7XHJcbiAgICAgIGNvbnN0IGNodW5rSW5SYW5nZSA9IEVORVJHWV9DSFVOS19UUkFOU0ZFUl9ESVNUQU5DRV9SQU5HRS5jb250YWlucyggeVBvc2l0aW9uICk7XHJcbiAgICAgIGNvbnN0IGNodW5rRXhlbXB0ID0gdGhpcy5leGVtcHRGcm9tVHJhbnNmZXJFbmVyZ3lDaHVua3MuaW5kZXhPZiggY2h1bmsgKSA+PSAwO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLndhdGVyUG93ZXJhYmxlRWxlbWVudEluUGxhY2VQcm9wZXJ0eS52YWx1ZSAmJiBjaHVua0luUmFuZ2UgJiYgIWNodW5rRXhlbXB0ICkge1xyXG4gICAgICAgIGlmICggdGhpcy50cmFuc2Zlck5leHRBdmFpbGFibGVDaHVuayApIHtcclxuXHJcbiAgICAgICAgICAvLyBzZW5kIHRoaXMgY2h1bmsgdG8gdGhlIG5leHQgZW5lcmd5IHN5c3RlbVxyXG4gICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QucmVtb3ZlKCBjaHVuayApO1xyXG4gICAgICAgICAgdGhpcy5vdXRnb2luZ0VuZXJneUNodW5rcy5wdXNoKCBjaHVuayApO1xyXG5cclxuICAgICAgICAgIC8vIGFsdGVybmF0ZSBzZW5kaW5nIG9yIGtlZXBpbmcgY2h1bmtzXHJcbiAgICAgICAgICB0aGlzLnRyYW5zZmVyTmV4dEF2YWlsYWJsZUNodW5rID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIGRvbid0IHRyYW5zZmVyIHRoaXMgY2h1bmtcclxuICAgICAgICAgIHRoaXMuZXhlbXB0RnJvbVRyYW5zZmVyRW5lcmd5Q2h1bmtzLnB1c2goIGNodW5rICk7XHJcblxyXG4gICAgICAgICAgLy8gc2V0IHVwIHRvIHRyYW5zZmVyIHRoZSBuZXh0IG9uZVxyXG4gICAgICAgICAgdGhpcy50cmFuc2Zlck5leHRBdmFpbGFibGVDaHVuayA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZW1vdmUgdGhlIGVuZXJneSBjaHVuayBpZiBpdCBpcyBvdXQgb2YgdmlzaWJsZSByYW5nZVxyXG4gICAgICBjb25zdCBjaHVua0Rpc3RhbmNlID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpXHJcbiAgICAgICAgLnBsdXMoIE9GRlNFVF9GUk9NX0NFTlRFUl9UT19XQVRFUl9PUklHSU4gKS5kaXN0YW5jZSggY2h1bmsucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICBpZiAoIGNodW5rRGlzdGFuY2UgPiBNQVhfRElTVEFOQ0VfRlJPTV9GQVVDRVRfVE9fQk9UVE9NX09GX1dBVEVSICkge1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtMaXN0LnJlbW92ZSggY2h1bmsgKTtcclxuICAgICAgICB0aGlzLmV4ZW1wdEZyb21UcmFuc2ZlckVuZXJneUNodW5rcy5yZW1vdmUoIGNodW5rICk7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0dyb3VwLmRpc3Bvc2VFbGVtZW50KCBjaHVuayApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gZ2VuZXJhdGUgdGhlIGFwcHJvcHJpYXRlIGFtb3VudCBvZiBlbmVyZ3lcclxuICAgIGNvbnN0IGVuZXJneUFtb3VudCA9IEVGQUNDb25zdGFudHMuTUFYX0VORVJHWV9QUk9EVUNUSU9OX1JBVEUgKiB0aGlzLmZsb3dQcm9wb3J0aW9uUHJvcGVydHkudmFsdWUgKiBkdDtcclxuXHJcbiAgICAvLyBhZGQgaW5jb21pbmcgZW5lcmd5IHRvIGRlbGF5IHF1ZXVlXHJcbiAgICB0aGlzLmZsb3dFbmVyZ3lEZWxheS5wdXNoKCBuZXcgRW5lcmd5KFxyXG4gICAgICBFbmVyZ3lUeXBlLk1FQ0hBTklDQUwsXHJcbiAgICAgIGVuZXJneUFtb3VudCxcclxuICAgICAgLU1hdGguUEkgLyAyLFxyXG4gICAgICB7IGNyZWF0aW9uVGltZTogbmV3IERhdGUoKS5nZXRUaW1lKCkgfSApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIHNlbmQgYWxvbmcgc2F2ZWQgZW5lcmd5IHZhbHVlcyBpZiBlbm91Z2ggdGltZSBoYXMgcGFzc2VkXHJcbiAgICBpZiAoIHRoaXMuZmxvd0VuZXJneURlbGF5WyAwIF0uY3JlYXRpb25UaW1lICsgRkFMTElOR19XQVRFUl9ERUxBWSAqIDEwMDAgPD0gbmV3IERhdGUoKS5nZXRUaW1lKCkgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmZsb3dFbmVyZ3lEZWxheS5zaGlmdCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBuZXcgRW5lcmd5KCBFbmVyZ3lUeXBlLk1FQ0hBTklDQUwsIDAsIC1NYXRoLlBJIC8gMiApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc3RlcHMgb25seSB0aGUgd2F0ZXIgZHJvcHNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHN0ZXBXYXRlckRyb3BzKCBkdCApIHtcclxuXHJcbiAgICAvLyBtYWtlIHRoZSBleGlzdGluZyB3YXRlciBkcm9wbGV0cyBmYWxsXHJcbiAgICB0aGlzLndhdGVyRHJvcHMuZm9yRWFjaCggZHJvcCA9PiB7XHJcbiAgICAgIGNvbnN0IHYgPSBkcm9wLnZlbG9jaXR5UHJvcGVydHkudmFsdWU7XHJcbiAgICAgIGRyb3AudmVsb2NpdHlQcm9wZXJ0eS5zZXQoIHYucGx1cyggQUNDRUxFUkFUSU9OX0RVRV9UT19HUkFWSVRZLnRpbWVzKCBkdCApICkgKTtcclxuICAgICAgZHJvcC5wb3NpdGlvbi5zZXQoIGRyb3AucG9zaXRpb24ucGx1cyggdi50aW1lcyggZHQgKSApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIG5ldyB3YXRlciBkcm9wbGV0cyBhcyBuZWVkZWQgYmFzZWQgb24gZmxvdyByYXRlXHJcbiAgICBpZiAoIHRoaXMuZmxvd1Byb3BvcnRpb25Qcm9wZXJ0eS52YWx1ZSA+IDAgKSB7XHJcblxyXG4gICAgICB0aGlzLnRpbWVTaW5jZUxhc3REcm9wQ3JlYXRpb24gKz0gZHQ7XHJcblxyXG4gICAgICB3aGlsZSAoIHRoaXMudGltZVNpbmNlTGFzdERyb3BDcmVhdGlvbiA+PSBXQVRFUl9EUk9QX0NSRUFUSU9OX1BFUklPRCApIHtcclxuXHJcbiAgICAgICAgY29uc3QgZHJvcFRpbWUgPSB0aGlzLnRpbWVTaW5jZUxhc3REcm9wQ3JlYXRpb24gLSBXQVRFUl9EUk9QX0NSRUFUSU9OX1BFUklPRDtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IHdhdGVyIGRyb3Agb2Ygc29tZXdoYXQgcmFuZG9tIHNpemUgYW5kIHBvc2l0aW9uIGl0IGJhc2VkIG9uIHRoZSB0aW1lIHNpbmNlIHRoZSBsYXN0IG9uZS5cclxuICAgICAgICBjb25zdCBpbml0aWFsUG9zaXRpb24gPSBuZXcgVmVjdG9yMihcclxuICAgICAgICAgIDAsXHJcbiAgICAgICAgICAwLjUgKiBBQ0NFTEVSQVRJT05fRFVFX1RPX0dSQVZJVFkueSAqIGRyb3BUaW1lICogZHJvcFRpbWVcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGluaXRpYWxXaWR0aCA9IHRoaXMuZmxvd1Byb3BvcnRpb25Qcm9wZXJ0eS52YWx1ZSAqIE1BWF9XQVRFUl9XSURUSCAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCAxICsgKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpIC0gMC41ICkgKiAwLjIgKTtcclxuICAgICAgICBjb25zdCBpbml0aWFsU2l6ZSA9IG5ldyBEaW1lbnNpb24yKCBpbml0aWFsV2lkdGgsIGluaXRpYWxXaWR0aCApO1xyXG4gICAgICAgIHRoaXMud2F0ZXJEcm9wcy5wdXNoKCBuZXcgV2F0ZXJEcm9wKFxyXG4gICAgICAgICAgaW5pdGlhbFBvc2l0aW9uLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDAsIEFDQ0VMRVJBVElPTl9EVUVfVE9fR1JBVklUWS55ICogZHJvcFRpbWUgKSxcclxuICAgICAgICAgIGluaXRpYWxTaXplXHJcbiAgICAgICAgKSApO1xyXG5cclxuICAgICAgICB0aGlzLnRpbWVTaW5jZUxhc3REcm9wQ3JlYXRpb24gLT0gV0FURVJfRFJPUF9DUkVBVElPTl9QRVJJT0Q7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLndhdGVyRHJvcHNQcmVsb2FkZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbW92ZSBkcm9wcyB0aGF0IGhhdmUgcnVuIHRoZWlyIGNvdXJzZVxyXG4gICAgY29uc3Qgd2F0ZXJEcm9wc0NvcHkgPSB0aGlzLndhdGVyRHJvcHM7XHJcbiAgICB3YXRlckRyb3BzQ29weS5mb3JFYWNoKCBkcm9wID0+IHtcclxuICAgICAgaWYgKCBkcm9wLnBvc2l0aW9uLmRpc3RhbmNlKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKSA+IE1BWF9ESVNUQU5DRV9GUk9NX0ZBVUNFVF9UT19CT1RUT01fT0ZfV0FURVIgKSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLndhdGVyRHJvcHMuaW5kZXhPZiggZHJvcCApO1xyXG4gICAgICAgIGlmICggaW5kZXggIT09IC0xICkge1xyXG4gICAgICAgICAgdGhpcy53YXRlckRyb3BzLnNwbGljZSggaW5kZXgsIDEgKTtcclxuICAgICAgICAgIHRoaXMud2F0ZXJEcm9wc1ByZWxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgcHJlbG9hZEVuZXJneUNodW5rcygpIHtcclxuICAgIHRoaXMuY2xlYXJFbmVyZ3lDaHVua3MoKTtcclxuXHJcbiAgICAvLyBkZWZpbmUgdHJhbnNsYXRpb24gZnVuY3Rpb24gaGVyZSB0byBhdm9pZCBjcmVhdGluZyBhbm9ueW1vdXMgZnVuY3Rpb24gaW5zaWRlIGxvb3BcclxuICAgIGNvbnN0IHRyYW5zbGF0ZUNodW5rcyA9ICggY2h1bmtzLCBkdCApID0+IHtcclxuICAgICAgY2h1bmtzLmZvckVhY2goIGNodW5rID0+IHtcclxuICAgICAgICBjaHVuay50cmFuc2xhdGVCYXNlZE9uVmVsb2NpdHkoIGR0ICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgbGV0IHByZWxvYWRUaW1lID0gMzsgLy8gSW4gc2Vjb25kcywgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZC5cclxuXHJcbiAgICBsZXQgdGVtcEVuZXJneUNodW5rTGlzdCA9IFtdO1xyXG5cclxuICAgIGlmICggdGhpcy5nZXRFbmVyZ3lPdXRwdXRSYXRlKCkuYW1vdW50ID4gMCApIHtcclxuXHJcbiAgICAgIC8vIHByZWxvYWQgZW5lcmd5IGNodW5rcyBpbnRvIHRoZSBzeXN0ZW1cclxuICAgICAgd2hpbGUgKCBwcmVsb2FkVGltZSA+IDAgKSB7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lTaW5jZUxhc3RDaHVuayArPSB0aGlzLmdldEVuZXJneU91dHB1dFJhdGUoKS5hbW91bnQgKiBEVDtcclxuICAgICAgICBpZiAoIHRoaXMuZW5lcmd5U2luY2VMYXN0Q2h1bmsgPj0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LICkge1xyXG4gICAgICAgICAgdGVtcEVuZXJneUNodW5rTGlzdC5wdXNoKCB0aGlzLmNyZWF0ZU5ld0NodW5rKCkgKTtcclxuICAgICAgICAgIHRoaXMuZW5lcmd5U2luY2VMYXN0Q2h1bmsgPSB0aGlzLmVuZXJneVNpbmNlTGFzdENodW5rIC0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbWFrZSB0aGUgY2h1bmtzIGZhbGxcclxuICAgICAgICB0cmFuc2xhdGVDaHVua3MoIHRlbXBFbmVyZ3lDaHVua0xpc3QsIERUICk7XHJcblxyXG4gICAgICAgIHByZWxvYWRUaW1lIC09IERUO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBOb3cgdGhhdCB0aGUgbmV3IGNodW5rcyBhcmUgaW4gcGxhY2UsIG1ha2Ugc3VyZSB0aGF0IHRoZXJlIGlzIGFjdHVhbGx5IHdhdGVyIGZhbGxpbmcgd2hlcmUgdGhlIGNodW5rcyBlbmRlZCB1cFxyXG4gICAgICAvLyBhbmQsIGlmIG5vdCwgcmVtb3ZlIHRoZW0uICBUaGlzIGlzIGEgcmFyZSBidXQgcG9zc2libGUgY2FzZSB0aGF0IGNhbiBvY2N1ciB3aGVuIHByZWxvYWRpbmcgcmlnaHQgYWZ0ZXIgdHVybmluZ1xyXG4gICAgICAvLyBvbiB0aGUgZmF1Y2V0LiAgRm9yIG1vcmUgb24gdGhpcywgcGxlYXNlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZW5lcmd5LWZvcm1zLWFuZC1jaGFuZ2VzL2lzc3Vlcy8zNDcuXHJcbiAgICAgIHRlbXBFbmVyZ3lDaHVua0xpc3QgPSB0ZW1wRW5lcmd5Q2h1bmtMaXN0LmZpbHRlciggZWMgPT4ge1xyXG4gICAgICAgIGNvbnN0IHlPZmZzZXRGb3JXYXRlckRyb3BzID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKyBPRkZTRVRfRlJPTV9DRU5URVJfVE9fV0FURVJfT1JJR0lOLnk7XHJcbiAgICAgICAgbGV0IHZlcnRpY2FsRGlzdGFuY2VUb05lYXJlc3RXYXRlckRyb3AgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICAgICAgdGhpcy53YXRlckRyb3BzLmZvckVhY2goIHdhdGVyRHJvcCA9PiB7XHJcbiAgICAgICAgICBjb25zdCB2ZXJ0aWNhbERpc3RhbmNlVG9XYXRlckRyb3AgPVxyXG4gICAgICAgICAgICBNYXRoLmFicyggKCB3YXRlckRyb3AucG9zaXRpb24ueSArIHlPZmZzZXRGb3JXYXRlckRyb3BzICkgLSBlYy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKTtcclxuICAgICAgICAgIGlmICggdmVydGljYWxEaXN0YW5jZVRvV2F0ZXJEcm9wIDwgdmVydGljYWxEaXN0YW5jZVRvTmVhcmVzdFdhdGVyRHJvcCApIHtcclxuICAgICAgICAgICAgdmVydGljYWxEaXN0YW5jZVRvTmVhcmVzdFdhdGVyRHJvcCA9IHZlcnRpY2FsRGlzdGFuY2VUb1dhdGVyRHJvcDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgcmV0dXJuIHZlcnRpY2FsRGlzdGFuY2VUb05lYXJlc3RXYXRlckRyb3AgPCAwLjAxOyAvLyBkaXN0YW5jZSB0aHJlc2hvbGQgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy53YXRlckRyb3BzLmxlbmd0aCA+IDAgKSB7XHJcblxyXG4gICAgICAvLyBUaGUgZmF1Y2V0IGlzIG9mZiwgYnV0IHdhdGVyIGlzIHByZXNlbnQsIHNvIHdlIG11c3QgYmUgcHJlbG9hZGluZyBlbmVyZ3kgY2h1bmtzIGp1c3QgYWZ0ZXIgdGhlIGZhdWNldCB3YXNcclxuICAgICAgLy8gdHVybmVkIG9mZiwgd2hpY2ggbWVhbnMgd2UgbmVlZCB0byBhZGQgZW5lcmd5IGNodW5rcyB0byB0aGUgZm9sbG93aW5nIHdhdGVyLiAgVGhpcyBpcyBhIHJhcmUgYnV0IHBvc3NpYmxlXHJcbiAgICAgIC8vIGNvbmRpdGlvbi4gIEZvciBtb3JlIGluZm8gYXMgdG8gd2h5IHRoaXMgaXMgbmVlZGVkLCBzZWVcclxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1mb3Jtcy1hbmQtY2hhbmdlcy9pc3N1ZXMvMzQ3LlxyXG5cclxuICAgICAgLy8gdGhlIHRvcCBvZiB0aGUgd2F0ZXIgY29sdW1uIHdpbGwgYmUgd2hlcmUgdGhlIGxhc3QgZHJvcCBpc1xyXG4gICAgICBjb25zdCB0b3BXYXRlckRyb3AgPSB0aGlzLndhdGVyRHJvcHNbIHRoaXMud2F0ZXJEcm9wcy5sZW5ndGggLSAxIF07XHJcblxyXG4gICAgICAvLyB0aGUgYm90dG9tIGRyb3AgaXMgdGhlIGZpcnN0IG9uZVxyXG4gICAgICBjb25zdCBib3R0b21XYXRlckRyb3AgPSB0aGlzLndhdGVyRHJvcHNbIDAgXTtcclxuXHJcbiAgICAgIC8vIEZpZ3VyZSBvdXQgaG93IG1hbnkgZW5lcmd5IGNodW5rcyB0byBhZGQgYmFzZWQgb24gdGhlIHNpemUgb2YgdGhlIHN0cmVhbSBvZiB3YXRlciBkcm9wbGV0cy4gIFRoaXMgY2FsY3VsYXRpb25cclxuICAgICAgLy8gd2FzIGVtcGlyaWNhbGx5IGRldGVybWluZWQgc28gdGhhdCB0aGUgbnVtYmVyIG9mIGVuZXJneSBjaHVua3Mgcm91Z2hseSBtYXRjaGVzIHdoYXQgdGhlcmUgYXJlIHdoZW4gdGhlIGZhdWNldFxyXG4gICAgICAvLyBpcyBydW5uaW5nIGF0IGZ1bGwgb3V0cHV0LlxyXG4gICAgICBjb25zdCB3YXRlckNvbHVtbkRpc3RhbmNlU3BhbiA9IHRvcFdhdGVyRHJvcC5wb3NpdGlvbi55IC0gYm90dG9tV2F0ZXJEcm9wLnBvc2l0aW9uLnk7XHJcbiAgICAgIGNvbnN0IG51bWJlck9mQ2h1bmtzVG9BZGQgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggd2F0ZXJDb2x1bW5EaXN0YW5jZVNwYW4gLyAwLjA1ICk7XHJcbiAgICAgIGNvbnN0IGRpc3RhbmNlQmV0d2VlbkNodW5rcyA9IHdhdGVyQ29sdW1uRGlzdGFuY2VTcGFuIC8gbnVtYmVyT2ZDaHVua3NUb0FkZDtcclxuXHJcbiAgICAgIC8vIGFkZCB0aGUgZW5lcmd5IGNodW5rcyBhbmQgcG9zaXRpb24gdGhlbSBhbG9uZyB0aGUgc3RyZWFtIG9mIHdhdGVyIGRyb3BsZXRzXHJcbiAgICAgIF8udGltZXMoIG51bWJlck9mQ2h1bmtzVG9BZGQsIGluZGV4ID0+IHtcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIGEgbmV3IGVuZXJneSBjaHVua1xyXG4gICAgICAgIGNvbnN0IGVjID0gdGhpcy5jcmVhdGVOZXdDaHVuaygpO1xyXG4gICAgICAgIHRlbXBFbmVyZ3lDaHVua0xpc3QucHVzaCggZWMgKTtcclxuXHJcbiAgICAgICAgLy8gcG9zaXRpb24gdGhlIG5ldyBlbmVyZ3kgY2h1bmsgb24gdGhlIHdhdGVyIHN0cmVhbVxyXG4gICAgICAgIGVjLnBvc2l0aW9uUHJvcGVydHkuc2V0KFxyXG4gICAgICAgICAgZWMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzWFkoIDAsIHRvcFdhdGVyRHJvcC5wb3NpdGlvbi55IC0gZGlzdGFuY2VCZXR3ZWVuQ2h1bmtzICogaW5kZXggKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBub3cgdGhhdCB0aGV5IGFyZSBwb3NpdGlvbmVkLCBhZGQgdGhlc2UgdG8gdGhlICdyZWFsJyBsaXN0IG9mIGVuZXJneSBjaHVua3NcclxuICAgIHRlbXBFbmVyZ3lDaHVua0xpc3QuZm9yRWFjaCggZWMgPT4ge1xyXG4gICAgICB0aGlzLmVuZXJneUNodW5rTGlzdC5wdXNoKCBlYyApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJlbG9hZHMgdGhlIGZhbGxpbmcgd2F0ZXIgYW5pbWF0aW9uIHRvIGJlIGluXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHByZWxvYWRXYXRlckRyb3BzKCkge1xyXG4gICAgdGhpcy53YXRlckRyb3BzUHJlbG9hZGVkID0gZmFsc2U7XHJcbiAgICB3aGlsZSAoICF0aGlzLndhdGVyRHJvcHNQcmVsb2FkZWQgKSB7XHJcbiAgICAgIHRoaXMuc3RlcFdhdGVyRHJvcHMoIERUICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7RW5lcmd5fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBnZXRFbmVyZ3lPdXRwdXRSYXRlKCkge1xyXG4gICAgY29uc3QgZW5lcmd5QW1vdW50ID0gRUZBQ0NvbnN0YW50cy5NQVhfRU5FUkdZX1BST0RVQ1RJT05fUkFURSAqIHRoaXMuZmxvd1Byb3BvcnRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVuZXJneUFtb3VudCA+PSAwLCBgRW5lcmd5QW1vdW50IGlzICR7ZW5lcmd5QW1vdW50fWAgKTtcclxuICAgIHJldHVybiBuZXcgRW5lcmd5KCBFbmVyZ3lUeXBlLk1FQ0hBTklDQUwsIGVuZXJneUFtb3VudCwgLU1hdGguUEkgLyAyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGVhY3RpdmF0ZSgpIHtcclxuICAgIHRoaXMuZmxvd1Byb3BvcnRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy53YXRlckRyb3BzLmxlbmd0aCA9IDA7XHJcbiAgICB0aGlzLmZsb3dFbmVyZ3lEZWxheS5sZW5ndGggPSAwO1xyXG4gICAgc3VwZXIuZGVhY3RpdmF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGNsZWFyRW5lcmd5Q2h1bmtzKCkge1xyXG4gICAgc3VwZXIuY2xlYXJFbmVyZ3lDaHVua3MoKTtcclxuICAgIHRoaXMuZXhlbXB0RnJvbVRyYW5zZmVyRW5lcmd5Q2h1bmtzLmNsZWFyKCk7IC8vIERpc3Bvc2FsIGlzIGRvbmUgd2hlbiBlbmVyZ3lDaHVua0xpc3QgaXMgY2xlYXJlZFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpYyAoRW5lcmd5U3lzdGVtRWxlbWVudElPKVxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAgICovXHJcbiAgdG9TdGF0ZU9iamVjdCgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHdhdGVyRHJvcHNQcmVsb2FkZWQ6IHRoaXMud2F0ZXJEcm9wc1ByZWxvYWRlZCxcclxuICAgICAgdHJhbnNmZXJOZXh0QXZhaWxhYmxlQ2h1bms6IHRoaXMudHJhbnNmZXJOZXh0QXZhaWxhYmxlQ2h1bmssXHJcbiAgICAgIGVuZXJneVNpbmNlTGFzdENodW5rOiB0aGlzLmVuZXJneVNpbmNlTGFzdENodW5rXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpYyAoRW5lcmd5U3lzdGVtRWxlbWVudElPKVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZU9iamVjdCAtIHNlZSB0aGlzLnRvU3RhdGVPYmplY3QoKVxyXG4gICAqL1xyXG4gIGFwcGx5U3RhdGUoIHN0YXRlT2JqZWN0ICkge1xyXG4gICAgdGhpcy53YXRlckRyb3BzUHJlbG9hZGVkID0gc3RhdGVPYmplY3Qud2F0ZXJEcm9wc1ByZWxvYWRlZDtcclxuICAgIHRoaXMudHJhbnNmZXJOZXh0QXZhaWxhYmxlQ2h1bmsgPSBzdGF0ZU9iamVjdC50cmFuc2Zlck5leHRBdmFpbGFibGVDaHVuaztcclxuICAgIHRoaXMuZW5lcmd5U2luY2VMYXN0Q2h1bmsgPSBzdGF0ZU9iamVjdC5lbmVyZ3lTaW5jZUxhc3RDaHVuaztcclxuICB9XHJcbn1cclxuXHJcbi8vIHN0YXRpY3NcclxuRmF1Y2V0QW5kV2F0ZXIuT0ZGU0VUX0ZST01fQ0VOVEVSX1RPX1dBVEVSX09SSUdJTiA9IE9GRlNFVF9GUk9NX0NFTlRFUl9UT19XQVRFUl9PUklHSU47XHJcbkZhdWNldEFuZFdhdGVyLk9GRlNFVF9GUk9NX0NFTlRFUl9UT19GQVVDRVRfSEVBRCA9IE9GRlNFVF9GUk9NX0NFTlRFUl9UT19GQVVDRVRfSEVBRDtcclxuRmF1Y2V0QW5kV2F0ZXIuTUFYX1dBVEVSX1dJRFRIID0gTUFYX1dBVEVSX1dJRFRIO1xyXG5cclxuZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLnJlZ2lzdGVyKCAnRmF1Y2V0QW5kV2F0ZXInLCBGYXVjZXRBbmRXYXRlciApO1xyXG5leHBvcnQgZGVmYXVsdCBGYXVjZXRBbmRXYXRlcjtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSw4Q0FBOEM7QUFDaEYsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxjQUFjLE1BQU0sbUNBQW1DO0FBQzlELE9BQU9DLGFBQWEsTUFBTSwrQkFBK0I7QUFDekQsT0FBT0MsV0FBVyxNQUFNLG1DQUFtQztBQUMzRCxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUNsRSxPQUFPQyw0QkFBNEIsTUFBTSx1Q0FBdUM7QUFDaEYsT0FBT0MsTUFBTSxNQUFNLGFBQWE7QUFDaEMsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUM1QyxPQUFPQyxTQUFTLE1BQU0sZ0JBQWdCOztBQUd0QztBQUNBLE1BQU1DLDZCQUE2QixHQUFHLElBQUksQ0FBQyxDQUFDO0FBQzVDLE1BQU1DLGVBQWUsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUMvQixNQUFNQywyQ0FBMkMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUN6RCxNQUFNQyxzQkFBc0IsR0FBRyxFQUFFO0FBQ2pDLE1BQU1DLDBCQUEwQixHQUFHLENBQUMsR0FB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