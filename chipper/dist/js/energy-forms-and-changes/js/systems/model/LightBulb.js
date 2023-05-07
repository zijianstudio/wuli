// Copyright 2016-2022, University of Colorado Boulder

/**
 * base class for light bulbs in the model
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergyUser from './EnergyUser.js';

// constants
const THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT = new Range(2, 2.5);
const ENERGY_TO_FULLY_LIGHT = EFACConstants.MAX_ENERGY_PRODUCTION_RATE;
const LIGHT_CHUNK_LIT_BULB_RADIUS = 0.1; // In meters.
const LIGHT_CHANGE_RATE = 0.5; // In proportion per second.

// energy chunk path offsets
const LEFT_SIDE_OF_WIRE_OFFSET = new Vector2(-0.04, -0.041);
const WIRE_CURVE_POINT_1_OFFSET = new Vector2(-0.02, -0.041);
const WIRE_CURVE_POINT_2_OFFSET = new Vector2(-0.015, -0.04);
const WIRE_CURVE_POINT_3_OFFSET = new Vector2(-0.006, -0.034);
const WIRE_CURVE_POINT_4_OFFSET = new Vector2(-0.001, -0.026);
const WIRE_CURVE_POINT_5_OFFSET = new Vector2(-0.0003, -0.02);
const BOTTOM_OF_CONNECTOR_OFFSET = new Vector2(0.0002, -0.01);
const RADIATE_POINT_OFFSET = new Vector2(0.0002, 0.066);
const ELECTRICAL_ENERGY_CHUNK_OFFSETS = [WIRE_CURVE_POINT_1_OFFSET, WIRE_CURVE_POINT_2_OFFSET, WIRE_CURVE_POINT_3_OFFSET, WIRE_CURVE_POINT_4_OFFSET, WIRE_CURVE_POINT_5_OFFSET, BOTTOM_OF_CONNECTOR_OFFSET, RADIATE_POINT_OFFSET];
class LightBulb extends EnergyUser {
  /**
   * @param {Image} iconImage
   * @param {boolean} hasFilament
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Object} [options]
   */
  constructor(iconImage, hasFilament, energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, options) {
    options = merge({
      tandem: Tandem.REQUIRED
    }, options);
    super(iconImage, options);

    // @public (read-only) {NumberProperty}
    this.litProportionProperty = new NumberProperty(0, {
      range: new Range(0, 1),
      tandem: options.tandem.createTandem('litProportionProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'proportion of brightness from the bulb'
    });

    // @private
    this.hasFilament = hasFilament;
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;

    // @private {number} - fewer thermal energy chunks are radiated for bulbs without a filament
    this.proportionOfThermalChunksRadiated = hasFilament ? 0.35 : 0.2;

    // @private - movers and flags that control how the energy chunks move through the light bulb
    this.electricalEnergyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('electricalEnergyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });
    this.filamentEnergyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('filamentEnergyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });
    this.radiatedEnergyChunkMovers = createObservableArray({
      tandem: options.tandem.createTandem('radiatedEnergyChunkMovers'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunkPathMover.EnergyChunkPathMoverIO))
    });
    this.goRightNextTime = true;
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @param  {Energy} incomingEnergy
   * @public
   */
  step(dt, incomingEnergy) {
    if (this.activeProperty.value) {
      // handle any incoming energy chunks
      if (this.incomingEnergyChunks.length > 0) {
        this.incomingEnergyChunks.forEach(incomingChunk => {
          if (incomingChunk.energyTypeProperty.get() === EnergyType.ELECTRICAL) {
            // add the energy chunk to the list of those under management
            this.energyChunkList.push(incomingChunk);

            // add a "mover" that will move this energy chunk through the wire to the bulb
            this.electricalEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(incomingChunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.value, ELECTRICAL_ENERGY_CHUNK_OFFSETS), EFACConstants.ENERGY_CHUNK_VELOCITY));
          }

          // by design, this shouldn't happen, so warn if it does
          else {
            assert && assert(false, `Encountered energy chunk with unexpected type: ${this.incomingEnergyChunk.energyTypeProperty.get()}`);
          }
        });
        this.incomingEnergyChunks.clear();
      }

      // move all of the energy chunks
      this.moveElectricalEnergyChunks(dt);
      this.moveFilamentEnergyChunks(dt);
      this.moveRadiatedEnergyChunks(dt);

      // set how lit the bulb is
      if (this.energyChunksVisibleProperty.get()) {
        // energy chunks are visible, so the lit proportion is dependent upon whether light energy chunks are present
        let lightChunksInLitRadius = 0;
        this.radiatedEnergyChunkMovers.forEach(mover => {
          const distance = mover.energyChunk.positionProperty.value.distance(this.positionProperty.value.plus(RADIATE_POINT_OFFSET));
          if (distance < LIGHT_CHUNK_LIT_BULB_RADIUS) {
            lightChunksInLitRadius++;
          }
        });
        if (lightChunksInLitRadius > 0) {
          // light is on - empirically determined max to match the max from most energy sources when chunks are off
          this.litProportionProperty.set(Math.min(0.7, this.litProportionProperty.get() + LIGHT_CHANGE_RATE * dt));
        } else {
          // light is off
          this.litProportionProperty.set(Math.max(0, this.litProportionProperty.get() - LIGHT_CHANGE_RATE * dt));
        }
      }

      // energy chunks not currently visible
      else {
        if (this.activeProperty.value && incomingEnergy.type === EnergyType.ELECTRICAL) {
          this.litProportionProperty.set(Utils.clamp(incomingEnergy.amount / (ENERGY_TO_FULLY_LIGHT * dt), 0, 1));
        } else {
          this.litProportionProperty.set(0.0);
        }
      }
    }
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveRadiatedEnergyChunks(dt) {
    // iterate over a copy to mutate original without problems
    const movers = this.radiatedEnergyChunkMovers.slice();
    movers.forEach(mover => {
      mover.moveAlongPath(dt);

      // remove the chunk and its mover
      if (mover.pathFullyTraversed) {
        this.energyChunkList.remove(mover.energyChunk);
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
  moveFilamentEnergyChunks(dt) {
    // iterate over a copy to mutate original without problems
    const movers = this.filamentEnergyChunkMovers.slice();
    movers.forEach(mover => {
      mover.moveAlongPath(dt);

      // cause this energy chunk to be radiated from the bulb
      if (mover.pathFullyTraversed) {
        this.filamentEnergyChunkMovers.remove(mover);
        this.radiateEnergyChunk(mover.energyChunk);
        this.energyChunkPathMoverGroup.disposeElement(mover);
      }
    });
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveElectricalEnergyChunks(dt) {
    // iterate over a copy to mutate original without problems
    const movers = this.electricalEnergyChunkMovers.slice();
    movers.forEach(mover => {
      mover.moveAlongPath(dt);
      if (mover.pathFullyTraversed) {
        this.electricalEnergyChunkMovers.remove(mover);
        this.energyChunkPathMoverGroup.disposeElement(mover);

        // turn this energy chunk into thermal energy on the filament
        if (this.hasFilament) {
          mover.energyChunk.energyTypeProperty.set(EnergyType.THERMAL);
          const path = this.createPathOnFilament(mover.energyChunk.positionProperty.value);
          const speed = getTotalPathLength(mover.energyChunk.positionProperty.value, path) / generateThermalChunkTimeOnFilament();
          this.filamentEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(mover.energyChunk, path, speed));
        } else {
          // there is no filament, so just radiate the chunk
          this.radiateEnergyChunk(mover.energyChunk);
        }
      }
    });
  }

  /**
   * @param  {Energy} incomingEnergy
   * @public
   * @override
   */
  preloadEnergyChunks(incomingEnergy) {
    this.clearEnergyChunks();
    if (incomingEnergy.amount < EFACConstants.MAX_ENERGY_PRODUCTION_RATE / 10 || incomingEnergy.type !== EnergyType.ELECTRICAL) {
      // no energy chunk pre-loading needed
      return;
    }
    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99; // prime the pump

    // simulate energy chunks moving through the system
    let preloadComplete = false;
    while (!preloadComplete) {
      energySinceLastChunk += incomingEnergy.amount * dt;

      // determine if time to add a new chunk
      if (energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK) {
        const newEnergyChunk = this.energyChunkGroup.createNextElement(EnergyType.ELECTRICAL, this.positionProperty.value.plus(LEFT_SIDE_OF_WIRE_OFFSET), Vector2.ZERO, this.energyChunksVisibleProperty);
        this.energyChunkList.push(newEnergyChunk);

        // add a "mover" that will move this energy chunk through the wire to the heating element
        this.electricalEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(newEnergyChunk, EnergyChunkPathMover.createPathFromOffsets(this.positionProperty.value, ELECTRICAL_ENERGY_CHUNK_OFFSETS), EFACConstants.ENERGY_CHUNK_VELOCITY));

        // update energy since last chunk
        energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
      }
      this.moveElectricalEnergyChunks(dt);
      this.moveFilamentEnergyChunks(dt);
      if (this.radiatedEnergyChunkMovers.length > 1) {
        // a couple of chunks are radiating, which completes the pre-load
        preloadComplete = true;
      }
    }
  }

  /**
   * @param  {EnergyChunk} energyChunk
   * @private
   */
  radiateEnergyChunk(energyChunk) {
    if (dotRandom.nextDouble() > this.proportionOfThermalChunksRadiated) {
      energyChunk.energyTypeProperty.set(EnergyType.LIGHT);
    } else {
      energyChunk.energyTypeProperty.set(EnergyType.THERMAL);
    }
    this.radiatedEnergyChunkMovers.push(this.energyChunkPathMoverGroup.createNextElement(energyChunk, EnergyChunkPathMover.createRandomStraightPath(this.positionProperty.value, new Range(Math.PI / 3, Math.PI / 3 * 2)), EFACConstants.ENERGY_CHUNK_VELOCITY));
  }

  /**
   * @param  {Vector2} startingPoint
   * @returns {Vector2[]}
   * @private
   */
  createPathOnFilament(startingPoint) {
    const path = [];
    const filamentWidth = 0.03;
    const x = (0.5 + dotRandom.nextDouble() / 2) * filamentWidth / 2 * (this.goRightNextTime ? 1 : -1);
    path.push(startingPoint.plus(new Vector2(x, 0)));
    this.goRightNextTime = !this.goRightNextTime;
    return path;
  }

  /**
   * deactivate the light bulb
   * @public
   * @override
   */
  deactivate() {
    super.deactivate();
    this.litProportionProperty.set(0);
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.electricalEnergyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.electricalEnergyChunkMovers.clear();
    this.filamentEnergyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.filamentEnergyChunkMovers.clear();
    this.radiatedEnergyChunkMovers.forEach(mover => this.energyChunkPathMoverGroup.disposeElement(mover));
    this.radiatedEnergyChunkMovers.clear();
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @returns {Object}
   */
  toStateObject() {
    return {
      goRightNextTime: this.goRightNextTime,
      hasFilament: this.hasFilament,
      proportionOfThermalChunksRadiated: this.proportionOfThermalChunksRadiated
    };
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @param {Object} stateObject - see this.toStateObject()
   */
  applyState(stateObject) {
    this.goRightNextTime = stateObject.goRightNextTime;
    this.hasFilament = stateObject.hasFilament;
    this.proportionOfThermalChunksRadiated = stateObject.proportionOfThermalChunksRadiated;
  }
}

/**
 * @returns {number} time
 * @private
 */
const generateThermalChunkTimeOnFilament = () => {
  return THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT.min + dotRandom.nextDouble() * THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT.getLength();
};

/**
 * @param {Vector2} startingPosition
 * @param {Vector2[]} pathPoints
 * @returns {number}
 * @private
 */
const getTotalPathLength = (startingPosition, pathPoints) => {
  if (pathPoints.length === 0) {
    return 0;
  }
  let pathLength = startingPosition.distance(pathPoints[0]);
  for (let i = 0; i < pathPoints.length - 1; i++) {
    pathLength += pathPoints[i].distance(pathPoints[i + 1]);
  }
  return pathLength;
};
energyFormsAndChanges.register('LightBulb', LightBulb);
export default LightBulb;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJOdW1iZXJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwibWVyZ2UiLCJUYW5kZW0iLCJSZWZlcmVuY2VJTyIsIkVGQUNDb25zdGFudHMiLCJFbmVyZ3lUeXBlIiwiZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIiwiRW5lcmd5Q2h1bmtQYXRoTW92ZXIiLCJFbmVyZ3lVc2VyIiwiVEhFUk1BTF9FTkVSR1lfQ0hVTktfVElNRV9PTl9GSUxBTUVOVCIsIkVORVJHWV9UT19GVUxMWV9MSUdIVCIsIk1BWF9FTkVSR1lfUFJPRFVDVElPTl9SQVRFIiwiTElHSFRfQ0hVTktfTElUX0JVTEJfUkFESVVTIiwiTElHSFRfQ0hBTkdFX1JBVEUiLCJMRUZUX1NJREVfT0ZfV0lSRV9PRkZTRVQiLCJXSVJFX0NVUlZFX1BPSU5UXzFfT0ZGU0VUIiwiV0lSRV9DVVJWRV9QT0lOVF8yX09GRlNFVCIsIldJUkVfQ1VSVkVfUE9JTlRfM19PRkZTRVQiLCJXSVJFX0NVUlZFX1BPSU5UXzRfT0ZGU0VUIiwiV0lSRV9DVVJWRV9QT0lOVF81X09GRlNFVCIsIkJPVFRPTV9PRl9DT05ORUNUT1JfT0ZGU0VUIiwiUkFESUFURV9QT0lOVF9PRkZTRVQiLCJFTEVDVFJJQ0FMX0VORVJHWV9DSFVOS19PRkZTRVRTIiwiTGlnaHRCdWxiIiwiY29uc3RydWN0b3IiLCJpY29uSW1hZ2UiLCJoYXNGaWxhbWVudCIsImVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSIsImVuZXJneUNodW5rR3JvdXAiLCJlbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwIiwib3B0aW9ucyIsInRhbmRlbSIsIlJFUVVJUkVEIiwibGl0UHJvcG9ydGlvblByb3BlcnR5IiwicmFuZ2UiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb0hpZ2hGcmVxdWVuY3kiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicHJvcG9ydGlvbk9mVGhlcm1hbENodW5rc1JhZGlhdGVkIiwiZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzIiwicGhldGlvVHlwZSIsIk9ic2VydmFibGVBcnJheUlPIiwiRW5lcmd5Q2h1bmtQYXRoTW92ZXJJTyIsImZpbGFtZW50RW5lcmd5Q2h1bmtNb3ZlcnMiLCJyYWRpYXRlZEVuZXJneUNodW5rTW92ZXJzIiwiZ29SaWdodE5leHRUaW1lIiwic3RlcCIsImR0IiwiaW5jb21pbmdFbmVyZ3kiLCJhY3RpdmVQcm9wZXJ0eSIsInZhbHVlIiwiaW5jb21pbmdFbmVyZ3lDaHVua3MiLCJsZW5ndGgiLCJmb3JFYWNoIiwiaW5jb21pbmdDaHVuayIsImVuZXJneVR5cGVQcm9wZXJ0eSIsImdldCIsIkVMRUNUUklDQUwiLCJlbmVyZ3lDaHVua0xpc3QiLCJwdXNoIiwiY3JlYXRlTmV4dEVsZW1lbnQiLCJjcmVhdGVQYXRoRnJvbU9mZnNldHMiLCJwb3NpdGlvblByb3BlcnR5IiwiRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIiwiYXNzZXJ0IiwiaW5jb21pbmdFbmVyZ3lDaHVuayIsImNsZWFyIiwibW92ZUVsZWN0cmljYWxFbmVyZ3lDaHVua3MiLCJtb3ZlRmlsYW1lbnRFbmVyZ3lDaHVua3MiLCJtb3ZlUmFkaWF0ZWRFbmVyZ3lDaHVua3MiLCJsaWdodENodW5rc0luTGl0UmFkaXVzIiwibW92ZXIiLCJkaXN0YW5jZSIsImVuZXJneUNodW5rIiwicGx1cyIsInNldCIsIk1hdGgiLCJtaW4iLCJtYXgiLCJ0eXBlIiwiY2xhbXAiLCJhbW91bnQiLCJtb3ZlcnMiLCJzbGljZSIsIm1vdmVBbG9uZ1BhdGgiLCJwYXRoRnVsbHlUcmF2ZXJzZWQiLCJyZW1vdmUiLCJkaXNwb3NlRWxlbWVudCIsInJhZGlhdGVFbmVyZ3lDaHVuayIsIlRIRVJNQUwiLCJwYXRoIiwiY3JlYXRlUGF0aE9uRmlsYW1lbnQiLCJzcGVlZCIsImdldFRvdGFsUGF0aExlbmd0aCIsImdlbmVyYXRlVGhlcm1hbENodW5rVGltZU9uRmlsYW1lbnQiLCJwcmVsb2FkRW5lcmd5Q2h1bmtzIiwiY2xlYXJFbmVyZ3lDaHVua3MiLCJGUkFNRVNfUEVSX1NFQ09ORCIsImVuZXJneVNpbmNlTGFzdENodW5rIiwiRU5FUkdZX1BFUl9DSFVOSyIsInByZWxvYWRDb21wbGV0ZSIsIm5ld0VuZXJneUNodW5rIiwiWkVSTyIsIm5leHREb3VibGUiLCJMSUdIVCIsImNyZWF0ZVJhbmRvbVN0cmFpZ2h0UGF0aCIsIlBJIiwic3RhcnRpbmdQb2ludCIsImZpbGFtZW50V2lkdGgiLCJ4IiwiZGVhY3RpdmF0ZSIsInRvU3RhdGVPYmplY3QiLCJhcHBseVN0YXRlIiwic3RhdGVPYmplY3QiLCJnZXRMZW5ndGgiLCJzdGFydGluZ1Bvc2l0aW9uIiwicGF0aFBvaW50cyIsInBhdGhMZW5ndGgiLCJpIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMaWdodEJ1bGIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogYmFzZSBjbGFzcyBmb3IgbGlnaHQgYnVsYnMgaW4gdGhlIG1vZGVsXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBBbmRyZXcgQWRhcmVcclxuICovXHJcblxyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvUmVmZXJlbmNlSU8uanMnO1xyXG5pbXBvcnQgRUZBQ0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRUZBQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lUeXBlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9FbmVyZ3lUeXBlLmpzJztcclxuaW1wb3J0IGVuZXJneUZvcm1zQW5kQ2hhbmdlcyBmcm9tICcuLi8uLi9lbmVyZ3lGb3Jtc0FuZENoYW5nZXMuanMnO1xyXG5pbXBvcnQgRW5lcmd5Q2h1bmtQYXRoTW92ZXIgZnJvbSAnLi9FbmVyZ3lDaHVua1BhdGhNb3Zlci5qcyc7XHJcbmltcG9ydCBFbmVyZ3lVc2VyIGZyb20gJy4vRW5lcmd5VXNlci5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVEhFUk1BTF9FTkVSR1lfQ0hVTktfVElNRV9PTl9GSUxBTUVOVCA9IG5ldyBSYW5nZSggMiwgMi41ICk7XHJcbmNvbnN0IEVORVJHWV9UT19GVUxMWV9MSUdIVCA9IEVGQUNDb25zdGFudHMuTUFYX0VORVJHWV9QUk9EVUNUSU9OX1JBVEU7XHJcbmNvbnN0IExJR0hUX0NIVU5LX0xJVF9CVUxCX1JBRElVUyA9IDAuMTsgLy8gSW4gbWV0ZXJzLlxyXG5jb25zdCBMSUdIVF9DSEFOR0VfUkFURSA9IDAuNTsgLy8gSW4gcHJvcG9ydGlvbiBwZXIgc2Vjb25kLlxyXG5cclxuLy8gZW5lcmd5IGNodW5rIHBhdGggb2Zmc2V0c1xyXG5jb25zdCBMRUZUX1NJREVfT0ZfV0lSRV9PRkZTRVQgPSBuZXcgVmVjdG9yMiggLTAuMDQsIC0wLjA0MSApO1xyXG5jb25zdCBXSVJFX0NVUlZFX1BPSU5UXzFfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIC0wLjAyLCAtMC4wNDEgKTtcclxuY29uc3QgV0lSRV9DVVJWRV9QT0lOVF8yX09GRlNFVCA9IG5ldyBWZWN0b3IyKCAtMC4wMTUsIC0wLjA0ICk7XHJcbmNvbnN0IFdJUkVfQ1VSVkVfUE9JTlRfM19PRkZTRVQgPSBuZXcgVmVjdG9yMiggLTAuMDA2LCAtMC4wMzQgKTtcclxuY29uc3QgV0lSRV9DVVJWRV9QT0lOVF80X09GRlNFVCA9IG5ldyBWZWN0b3IyKCAtMC4wMDEsIC0wLjAyNiApO1xyXG5jb25zdCBXSVJFX0NVUlZFX1BPSU5UXzVfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIC0wLjAwMDMsIC0wLjAyICk7XHJcbmNvbnN0IEJPVFRPTV9PRl9DT05ORUNUT1JfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIDAuMDAwMiwgLTAuMDEgKTtcclxuY29uc3QgUkFESUFURV9QT0lOVF9PRkZTRVQgPSBuZXcgVmVjdG9yMiggMC4wMDAyLCAwLjA2NiApO1xyXG5jb25zdCBFTEVDVFJJQ0FMX0VORVJHWV9DSFVOS19PRkZTRVRTID0gW1xyXG4gIFdJUkVfQ1VSVkVfUE9JTlRfMV9PRkZTRVQsXHJcbiAgV0lSRV9DVVJWRV9QT0lOVF8yX09GRlNFVCxcclxuICBXSVJFX0NVUlZFX1BPSU5UXzNfT0ZGU0VULFxyXG4gIFdJUkVfQ1VSVkVfUE9JTlRfNF9PRkZTRVQsXHJcbiAgV0lSRV9DVVJWRV9QT0lOVF81X09GRlNFVCxcclxuICBCT1RUT01fT0ZfQ09OTkVDVE9SX09GRlNFVCxcclxuICBSQURJQVRFX1BPSU5UX09GRlNFVFxyXG5dO1xyXG5cclxuY2xhc3MgTGlnaHRCdWxiIGV4dGVuZHMgRW5lcmd5VXNlciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7SW1hZ2V9IGljb25JbWFnZVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGFzRmlsYW1lbnRcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtFbmVyZ3lDaHVua0dyb3VwfSBlbmVyZ3lDaHVua0dyb3VwXHJcbiAgICogQHBhcmFtIHtFbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwfSBlbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBpY29uSW1hZ2UsIGhhc0ZpbGFtZW50LCBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHksIGVuZXJneUNodW5rR3JvdXAsIGVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIGljb25JbWFnZSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge051bWJlclByb3BlcnR5fVxyXG4gICAgdGhpcy5saXRQcm9wb3J0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMSApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xpdFByb3BvcnRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdwcm9wb3J0aW9uIG9mIGJyaWdodG5lc3MgZnJvbSB0aGUgYnVsYidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5oYXNGaWxhbWVudCA9IGhhc0ZpbGFtZW50O1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHkgPSBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHk7XHJcbiAgICB0aGlzLmVuZXJneUNodW5rR3JvdXAgPSBlbmVyZ3lDaHVua0dyb3VwO1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwID0gZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIGZld2VyIHRoZXJtYWwgZW5lcmd5IGNodW5rcyBhcmUgcmFkaWF0ZWQgZm9yIGJ1bGJzIHdpdGhvdXQgYSBmaWxhbWVudFxyXG4gICAgdGhpcy5wcm9wb3J0aW9uT2ZUaGVybWFsQ2h1bmtzUmFkaWF0ZWQgPSBoYXNGaWxhbWVudCA/IDAuMzUgOiAwLjI7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBtb3ZlcnMgYW5kIGZsYWdzIHRoYXQgY29udHJvbCBob3cgdGhlIGVuZXJneSBjaHVua3MgbW92ZSB0aHJvdWdoIHRoZSBsaWdodCBidWxiXHJcbiAgICB0aGlzLmVsZWN0cmljYWxFbmVyZ3lDaHVua01vdmVycyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VsZWN0cmljYWxFbmVyZ3lDaHVua01vdmVycycgKSxcclxuICAgICAgcGhldGlvVHlwZTogY3JlYXRlT2JzZXJ2YWJsZUFycmF5Lk9ic2VydmFibGVBcnJheUlPKCBSZWZlcmVuY2VJTyggRW5lcmd5Q2h1bmtQYXRoTW92ZXIuRW5lcmd5Q2h1bmtQYXRoTW92ZXJJTyApIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuZmlsYW1lbnRFbmVyZ3lDaHVua01vdmVycyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZpbGFtZW50RW5lcmd5Q2h1bmtNb3ZlcnMnICksXHJcbiAgICAgIHBoZXRpb1R5cGU6IGNyZWF0ZU9ic2VydmFibGVBcnJheS5PYnNlcnZhYmxlQXJyYXlJTyggUmVmZXJlbmNlSU8oIEVuZXJneUNodW5rUGF0aE1vdmVyLkVuZXJneUNodW5rUGF0aE1vdmVySU8gKSApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnJhZGlhdGVkRW5lcmd5Q2h1bmtNb3ZlcnMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyYWRpYXRlZEVuZXJneUNodW5rTW92ZXJzJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5SU8oIFJlZmVyZW5jZUlPKCBFbmVyZ3lDaHVua1BhdGhNb3Zlci5FbmVyZ3lDaHVua1BhdGhNb3ZlcklPICkgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5nb1JpZ2h0TmV4dFRpbWUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEBwYXJhbSAge0VuZXJneX0gaW5jb21pbmdFbmVyZ3lcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZHQsIGluY29taW5nRW5lcmd5ICkge1xyXG4gICAgaWYgKCB0aGlzLmFjdGl2ZVByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgLy8gaGFuZGxlIGFueSBpbmNvbWluZyBlbmVyZ3kgY2h1bmtzXHJcbiAgICAgIGlmICggdGhpcy5pbmNvbWluZ0VuZXJneUNodW5rcy5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgICB0aGlzLmluY29taW5nRW5lcmd5Q2h1bmtzLmZvckVhY2goIGluY29taW5nQ2h1bmsgPT4ge1xyXG5cclxuICAgICAgICAgIGlmICggaW5jb21pbmdDaHVuay5lbmVyZ3lUeXBlUHJvcGVydHkuZ2V0KCkgPT09IEVuZXJneVR5cGUuRUxFQ1RSSUNBTCApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCB0aGUgZW5lcmd5IGNodW5rIHRvIHRoZSBsaXN0IG9mIHRob3NlIHVuZGVyIG1hbmFnZW1lbnRcclxuICAgICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QucHVzaCggaW5jb21pbmdDaHVuayApO1xyXG5cclxuICAgICAgICAgICAgLy8gYWRkIGEgXCJtb3ZlclwiIHRoYXQgd2lsbCBtb3ZlIHRoaXMgZW5lcmd5IGNodW5rIHRocm91Z2ggdGhlIHdpcmUgdG8gdGhlIGJ1bGJcclxuICAgICAgICAgICAgdGhpcy5lbGVjdHJpY2FsRW5lcmd5Q2h1bmtNb3ZlcnMucHVzaChcclxuICAgICAgICAgICAgICB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoXHJcbiAgICAgICAgICAgICAgICBpbmNvbWluZ0NodW5rLFxyXG4gICAgICAgICAgICAgICAgRW5lcmd5Q2h1bmtQYXRoTW92ZXIuY3JlYXRlUGF0aEZyb21PZmZzZXRzKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUsIEVMRUNUUklDQUxfRU5FUkdZX0NIVU5LX09GRlNFVFMgKSxcclxuICAgICAgICAgICAgICAgIEVGQUNDb25zdGFudHMuRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIClcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBieSBkZXNpZ24sIHRoaXMgc2hvdWxkbid0IGhhcHBlbiwgc28gd2FybiBpZiBpdCBkb2VzXHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgICBgRW5jb3VudGVyZWQgZW5lcmd5IGNodW5rIHdpdGggdW5leHBlY3RlZCB0eXBlOiAke3RoaXMuaW5jb21pbmdFbmVyZ3lDaHVuay5lbmVyZ3lUeXBlUHJvcGVydHkuZ2V0KCl9YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbmNvbWluZ0VuZXJneUNodW5rcy5jbGVhcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBtb3ZlIGFsbCBvZiB0aGUgZW5lcmd5IGNodW5rc1xyXG4gICAgICB0aGlzLm1vdmVFbGVjdHJpY2FsRW5lcmd5Q2h1bmtzKCBkdCApO1xyXG4gICAgICB0aGlzLm1vdmVGaWxhbWVudEVuZXJneUNodW5rcyggZHQgKTtcclxuICAgICAgdGhpcy5tb3ZlUmFkaWF0ZWRFbmVyZ3lDaHVua3MoIGR0ICk7XHJcblxyXG4gICAgICAvLyBzZXQgaG93IGxpdCB0aGUgYnVsYiBpc1xyXG4gICAgICBpZiAoIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgICAvLyBlbmVyZ3kgY2h1bmtzIGFyZSB2aXNpYmxlLCBzbyB0aGUgbGl0IHByb3BvcnRpb24gaXMgZGVwZW5kZW50IHVwb24gd2hldGhlciBsaWdodCBlbmVyZ3kgY2h1bmtzIGFyZSBwcmVzZW50XHJcbiAgICAgICAgbGV0IGxpZ2h0Q2h1bmtzSW5MaXRSYWRpdXMgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGlhdGVkRW5lcmd5Q2h1bmtNb3ZlcnMuZm9yRWFjaCggbW92ZXIgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBtb3Zlci5lbmVyZ3lDaHVuay5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmRpc3RhbmNlKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1cyggUkFESUFURV9QT0lOVF9PRkZTRVQgKSApO1xyXG4gICAgICAgICAgaWYgKCBkaXN0YW5jZSA8IExJR0hUX0NIVU5LX0xJVF9CVUxCX1JBRElVUyApIHtcclxuICAgICAgICAgICAgbGlnaHRDaHVua3NJbkxpdFJhZGl1cysrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgaWYgKCBsaWdodENodW5rc0luTGl0UmFkaXVzID4gMCApIHtcclxuXHJcbiAgICAgICAgICAvLyBsaWdodCBpcyBvbiAtIGVtcGlyaWNhbGx5IGRldGVybWluZWQgbWF4IHRvIG1hdGNoIHRoZSBtYXggZnJvbSBtb3N0IGVuZXJneSBzb3VyY2VzIHdoZW4gY2h1bmtzIGFyZSBvZmZcclxuICAgICAgICAgIHRoaXMubGl0UHJvcG9ydGlvblByb3BlcnR5LnNldCggTWF0aC5taW4oIDAuNywgdGhpcy5saXRQcm9wb3J0aW9uUHJvcGVydHkuZ2V0KCkgKyBMSUdIVF9DSEFOR0VfUkFURSAqIGR0ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gbGlnaHQgaXMgb2ZmXHJcbiAgICAgICAgICB0aGlzLmxpdFByb3BvcnRpb25Qcm9wZXJ0eS5zZXQoIE1hdGgubWF4KCAwLCB0aGlzLmxpdFByb3BvcnRpb25Qcm9wZXJ0eS5nZXQoKSAtIExJR0hUX0NIQU5HRV9SQVRFICogZHQgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZW5lcmd5IGNodW5rcyBub3QgY3VycmVudGx5IHZpc2libGVcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLmFjdGl2ZVByb3BlcnR5LnZhbHVlICYmIGluY29taW5nRW5lcmd5LnR5cGUgPT09IEVuZXJneVR5cGUuRUxFQ1RSSUNBTCApIHtcclxuICAgICAgICAgIHRoaXMubGl0UHJvcG9ydGlvblByb3BlcnR5LnNldCggVXRpbHMuY2xhbXAoIGluY29taW5nRW5lcmd5LmFtb3VudCAvICggRU5FUkdZX1RPX0ZVTExZX0xJR0hUICogZHQgKSwgMCwgMSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5saXRQcm9wb3J0aW9uUHJvcGVydHkuc2V0KCAwLjAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gZHQgLSB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG1vdmVSYWRpYXRlZEVuZXJneUNodW5rcyggZHQgKSB7XHJcblxyXG4gICAgLy8gaXRlcmF0ZSBvdmVyIGEgY29weSB0byBtdXRhdGUgb3JpZ2luYWwgd2l0aG91dCBwcm9ibGVtc1xyXG4gICAgY29uc3QgbW92ZXJzID0gdGhpcy5yYWRpYXRlZEVuZXJneUNodW5rTW92ZXJzLnNsaWNlKCk7XHJcblxyXG4gICAgbW92ZXJzLmZvckVhY2goIG1vdmVyID0+IHtcclxuICAgICAgbW92ZXIubW92ZUFsb25nUGF0aCggZHQgKTtcclxuXHJcbiAgICAgIC8vIHJlbW92ZSB0aGUgY2h1bmsgYW5kIGl0cyBtb3ZlclxyXG4gICAgICBpZiAoIG1vdmVyLnBhdGhGdWxseVRyYXZlcnNlZCApIHtcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rTGlzdC5yZW1vdmUoIG1vdmVyLmVuZXJneUNodW5rICk7XHJcbiAgICAgICAgdGhpcy5yYWRpYXRlZEVuZXJneUNodW5rTW92ZXJzLnJlbW92ZSggbW92ZXIgKTtcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rR3JvdXAuZGlzcG9zZUVsZW1lbnQoIG1vdmVyLmVuZXJneUNodW5rICk7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmRpc3Bvc2VFbGVtZW50KCBtb3ZlciApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBtb3ZlRmlsYW1lbnRFbmVyZ3lDaHVua3MoIGR0ICkge1xyXG5cclxuICAgIC8vIGl0ZXJhdGUgb3ZlciBhIGNvcHkgdG8gbXV0YXRlIG9yaWdpbmFsIHdpdGhvdXQgcHJvYmxlbXNcclxuICAgIGNvbnN0IG1vdmVycyA9IHRoaXMuZmlsYW1lbnRFbmVyZ3lDaHVua01vdmVycy5zbGljZSgpO1xyXG5cclxuICAgIG1vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB7XHJcbiAgICAgIG1vdmVyLm1vdmVBbG9uZ1BhdGgoIGR0ICk7XHJcblxyXG4gICAgICAvLyBjYXVzZSB0aGlzIGVuZXJneSBjaHVuayB0byBiZSByYWRpYXRlZCBmcm9tIHRoZSBidWxiXHJcbiAgICAgIGlmICggbW92ZXIucGF0aEZ1bGx5VHJhdmVyc2VkICkge1xyXG4gICAgICAgIHRoaXMuZmlsYW1lbnRFbmVyZ3lDaHVua01vdmVycy5yZW1vdmUoIG1vdmVyICk7XHJcbiAgICAgICAgdGhpcy5yYWRpYXRlRW5lcmd5Q2h1bmsoIG1vdmVyLmVuZXJneUNodW5rICk7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmRpc3Bvc2VFbGVtZW50KCBtb3ZlciApO1xyXG5cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgbW92ZUVsZWN0cmljYWxFbmVyZ3lDaHVua3MoIGR0ICkge1xyXG5cclxuICAgIC8vIGl0ZXJhdGUgb3ZlciBhIGNvcHkgdG8gbXV0YXRlIG9yaWdpbmFsIHdpdGhvdXQgcHJvYmxlbXNcclxuICAgIGNvbnN0IG1vdmVycyA9IHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzLnNsaWNlKCk7XHJcblxyXG4gICAgbW92ZXJzLmZvckVhY2goIG1vdmVyID0+IHtcclxuICAgICAgbW92ZXIubW92ZUFsb25nUGF0aCggZHQgKTtcclxuXHJcbiAgICAgIGlmICggbW92ZXIucGF0aEZ1bGx5VHJhdmVyc2VkICkge1xyXG4gICAgICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzLnJlbW92ZSggbW92ZXIgKTtcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuZGlzcG9zZUVsZW1lbnQoIG1vdmVyICk7XHJcblxyXG4gICAgICAgIC8vIHR1cm4gdGhpcyBlbmVyZ3kgY2h1bmsgaW50byB0aGVybWFsIGVuZXJneSBvbiB0aGUgZmlsYW1lbnRcclxuICAgICAgICBpZiAoIHRoaXMuaGFzRmlsYW1lbnQgKSB7XHJcbiAgICAgICAgICBtb3Zlci5lbmVyZ3lDaHVuay5lbmVyZ3lUeXBlUHJvcGVydHkuc2V0KCBFbmVyZ3lUeXBlLlRIRVJNQUwgKTtcclxuICAgICAgICAgIGNvbnN0IHBhdGggPSB0aGlzLmNyZWF0ZVBhdGhPbkZpbGFtZW50KCBtb3Zlci5lbmVyZ3lDaHVuay5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgICAgICBjb25zdCBzcGVlZCA9IGdldFRvdGFsUGF0aExlbmd0aCggbW92ZXIuZW5lcmd5Q2h1bmsucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSwgcGF0aCApIC9cclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVUaGVybWFsQ2h1bmtUaW1lT25GaWxhbWVudCgpO1xyXG4gICAgICAgICAgdGhpcy5maWxhbWVudEVuZXJneUNodW5rTW92ZXJzLnB1c2goIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggbW92ZXIuZW5lcmd5Q2h1bmssIHBhdGgsIHNwZWVkICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gdGhlcmUgaXMgbm8gZmlsYW1lbnQsIHNvIGp1c3QgcmFkaWF0ZSB0aGUgY2h1bmtcclxuICAgICAgICAgIHRoaXMucmFkaWF0ZUVuZXJneUNodW5rKCBtb3Zlci5lbmVyZ3lDaHVuayApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtICB7RW5lcmd5fSBpbmNvbWluZ0VuZXJneVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBwcmVsb2FkRW5lcmd5Q2h1bmtzKCBpbmNvbWluZ0VuZXJneSApIHtcclxuXHJcbiAgICB0aGlzLmNsZWFyRW5lcmd5Q2h1bmtzKCk7XHJcblxyXG4gICAgaWYgKCBpbmNvbWluZ0VuZXJneS5hbW91bnQgPCBFRkFDQ29uc3RhbnRzLk1BWF9FTkVSR1lfUFJPRFVDVElPTl9SQVRFIC8gMTAgfHxcclxuICAgICAgICAgaW5jb21pbmdFbmVyZ3kudHlwZSAhPT0gRW5lcmd5VHlwZS5FTEVDVFJJQ0FMICkge1xyXG5cclxuICAgICAgLy8gbm8gZW5lcmd5IGNodW5rIHByZS1sb2FkaW5nIG5lZWRlZFxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZHQgPSAxIC8gRUZBQ0NvbnN0YW50cy5GUkFNRVNfUEVSX1NFQ09ORDtcclxuICAgIGxldCBlbmVyZ3lTaW5jZUxhc3RDaHVuayA9IEVGQUNDb25zdGFudHMuRU5FUkdZX1BFUl9DSFVOSyAqIDAuOTk7IC8vIHByaW1lIHRoZSBwdW1wXHJcblxyXG4gICAgLy8gc2ltdWxhdGUgZW5lcmd5IGNodW5rcyBtb3ZpbmcgdGhyb3VnaCB0aGUgc3lzdGVtXHJcbiAgICBsZXQgcHJlbG9hZENvbXBsZXRlID0gZmFsc2U7XHJcbiAgICB3aGlsZSAoICFwcmVsb2FkQ29tcGxldGUgKSB7XHJcbiAgICAgIGVuZXJneVNpbmNlTGFzdENodW5rICs9IGluY29taW5nRW5lcmd5LmFtb3VudCAqIGR0O1xyXG5cclxuICAgICAgLy8gZGV0ZXJtaW5lIGlmIHRpbWUgdG8gYWRkIGEgbmV3IGNodW5rXHJcbiAgICAgIGlmICggZW5lcmd5U2luY2VMYXN0Q2h1bmsgPj0gRUZBQ0NvbnN0YW50cy5FTkVSR1lfUEVSX0NIVU5LICkge1xyXG4gICAgICAgIGNvbnN0IG5ld0VuZXJneUNodW5rID0gdGhpcy5lbmVyZ3lDaHVua0dyb3VwLmNyZWF0ZU5leHRFbGVtZW50KFxyXG4gICAgICAgICAgRW5lcmd5VHlwZS5FTEVDVFJJQ0FMLFxyXG4gICAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnBsdXMoIExFRlRfU0lERV9PRl9XSVJFX09GRlNFVCApLFxyXG4gICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rTGlzdC5wdXNoKCBuZXdFbmVyZ3lDaHVuayApO1xyXG5cclxuICAgICAgICAvLyBhZGQgYSBcIm1vdmVyXCIgdGhhdCB3aWxsIG1vdmUgdGhpcyBlbmVyZ3kgY2h1bmsgdGhyb3VnaCB0aGUgd2lyZSB0byB0aGUgaGVhdGluZyBlbGVtZW50XHJcbiAgICAgICAgdGhpcy5lbGVjdHJpY2FsRW5lcmd5Q2h1bmtNb3ZlcnMucHVzaCggdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KFxyXG4gICAgICAgICAgbmV3RW5lcmd5Q2h1bmssXHJcbiAgICAgICAgICBFbmVyZ3lDaHVua1BhdGhNb3Zlci5jcmVhdGVQYXRoRnJvbU9mZnNldHMoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSwgRUxFQ1RSSUNBTF9FTkVSR1lfQ0hVTktfT0ZGU0VUUyApLFxyXG4gICAgICAgICAgRUZBQ0NvbnN0YW50cy5FTkVSR1lfQ0hVTktfVkVMT0NJVFlcclxuICAgICAgICApICk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBlbmVyZ3kgc2luY2UgbGFzdCBjaHVua1xyXG4gICAgICAgIGVuZXJneVNpbmNlTGFzdENodW5rID0gZW5lcmd5U2luY2VMYXN0Q2h1bmsgLSBFRkFDQ29uc3RhbnRzLkVORVJHWV9QRVJfQ0hVTks7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubW92ZUVsZWN0cmljYWxFbmVyZ3lDaHVua3MoIGR0ICk7XHJcbiAgICAgIHRoaXMubW92ZUZpbGFtZW50RW5lcmd5Q2h1bmtzKCBkdCApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLnJhZGlhdGVkRW5lcmd5Q2h1bmtNb3ZlcnMubGVuZ3RoID4gMSApIHtcclxuXHJcbiAgICAgICAgLy8gYSBjb3VwbGUgb2YgY2h1bmtzIGFyZSByYWRpYXRpbmcsIHdoaWNoIGNvbXBsZXRlcyB0aGUgcHJlLWxvYWRcclxuICAgICAgICBwcmVsb2FkQ29tcGxldGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gIHtFbmVyZ3lDaHVua30gZW5lcmd5Q2h1bmtcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJhZGlhdGVFbmVyZ3lDaHVuayggZW5lcmd5Q2h1bmsgKSB7XHJcbiAgICBpZiAoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgPiB0aGlzLnByb3BvcnRpb25PZlRoZXJtYWxDaHVua3NSYWRpYXRlZCApIHtcclxuICAgICAgZW5lcmd5Q2h1bmsuZW5lcmd5VHlwZVByb3BlcnR5LnNldCggRW5lcmd5VHlwZS5MSUdIVCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGVuZXJneUNodW5rLmVuZXJneVR5cGVQcm9wZXJ0eS5zZXQoIEVuZXJneVR5cGUuVEhFUk1BTCApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmFkaWF0ZWRFbmVyZ3lDaHVua01vdmVycy5wdXNoKCB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoXHJcbiAgICAgIGVuZXJneUNodW5rLFxyXG4gICAgICBFbmVyZ3lDaHVua1BhdGhNb3Zlci5jcmVhdGVSYW5kb21TdHJhaWdodFBhdGgoXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgIG5ldyBSYW5nZSggTWF0aC5QSSAvIDMsIE1hdGguUEkgLyAzICogMiApICksXHJcbiAgICAgIEVGQUNDb25zdGFudHMuRU5FUkdZX0NIVU5LX1ZFTE9DSVRZIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gIHtWZWN0b3IyfSBzdGFydGluZ1BvaW50XHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJbXX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGNyZWF0ZVBhdGhPbkZpbGFtZW50KCBzdGFydGluZ1BvaW50ICkge1xyXG4gICAgY29uc3QgcGF0aCA9IFtdO1xyXG4gICAgY29uc3QgZmlsYW1lbnRXaWR0aCA9IDAuMDM7XHJcbiAgICBjb25zdCB4ID0gKCAwLjUgKyBkb3RSYW5kb20ubmV4dERvdWJsZSgpIC8gMiApICogZmlsYW1lbnRXaWR0aCAvIDIgKiAoIHRoaXMuZ29SaWdodE5leHRUaW1lID8gMSA6IC0xICk7XHJcblxyXG4gICAgcGF0aC5wdXNoKCBzdGFydGluZ1BvaW50LnBsdXMoIG5ldyBWZWN0b3IyKCB4LCAwICkgKSApO1xyXG4gICAgdGhpcy5nb1JpZ2h0TmV4dFRpbWUgPSAhdGhpcy5nb1JpZ2h0TmV4dFRpbWU7XHJcblxyXG4gICAgcmV0dXJuIHBhdGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBkZWFjdGl2YXRlIHRoZSBsaWdodCBidWxiXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRlYWN0aXZhdGUoKSB7XHJcbiAgICBzdXBlci5kZWFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLmxpdFByb3BvcnRpb25Qcm9wZXJ0eS5zZXQoIDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBjbGVhckVuZXJneUNodW5rcygpIHtcclxuICAgIHN1cGVyLmNsZWFyRW5lcmd5Q2h1bmtzKCk7XHJcbiAgICB0aGlzLmVsZWN0cmljYWxFbmVyZ3lDaHVua01vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuZGlzcG9zZUVsZW1lbnQoIG1vdmVyICkgKTtcclxuICAgIHRoaXMuZWxlY3RyaWNhbEVuZXJneUNodW5rTW92ZXJzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmZpbGFtZW50RW5lcmd5Q2h1bmtNb3ZlcnMuZm9yRWFjaCggbW92ZXIgPT4gdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLmRpc3Bvc2VFbGVtZW50KCBtb3ZlciApICk7XHJcbiAgICB0aGlzLmZpbGFtZW50RW5lcmd5Q2h1bmtNb3ZlcnMuY2xlYXIoKTtcclxuICAgIHRoaXMucmFkaWF0ZWRFbmVyZ3lDaHVua01vdmVycy5mb3JFYWNoKCBtb3ZlciA9PiB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAuZGlzcG9zZUVsZW1lbnQoIG1vdmVyICkgKTtcclxuICAgIHRoaXMucmFkaWF0ZWRFbmVyZ3lDaHVua01vdmVycy5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpYyAoRW5lcmd5U3lzdGVtRWxlbWVudElPKVxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAgICovXHJcbiAgdG9TdGF0ZU9iamVjdCgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGdvUmlnaHROZXh0VGltZTogdGhpcy5nb1JpZ2h0TmV4dFRpbWUsXHJcbiAgICAgIGhhc0ZpbGFtZW50OiB0aGlzLmhhc0ZpbGFtZW50LFxyXG4gICAgICBwcm9wb3J0aW9uT2ZUaGVybWFsQ2h1bmtzUmFkaWF0ZWQ6IHRoaXMucHJvcG9ydGlvbk9mVGhlcm1hbENodW5rc1JhZGlhdGVkXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpYyAoRW5lcmd5U3lzdGVtRWxlbWVudElPKVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZU9iamVjdCAtIHNlZSB0aGlzLnRvU3RhdGVPYmplY3QoKVxyXG4gICAqL1xyXG4gIGFwcGx5U3RhdGUoIHN0YXRlT2JqZWN0ICkge1xyXG4gICAgdGhpcy5nb1JpZ2h0TmV4dFRpbWUgPSBzdGF0ZU9iamVjdC5nb1JpZ2h0TmV4dFRpbWU7XHJcbiAgICB0aGlzLmhhc0ZpbGFtZW50ID0gc3RhdGVPYmplY3QuaGFzRmlsYW1lbnQ7XHJcbiAgICB0aGlzLnByb3BvcnRpb25PZlRoZXJtYWxDaHVua3NSYWRpYXRlZCA9IHN0YXRlT2JqZWN0LnByb3BvcnRpb25PZlRoZXJtYWxDaHVua3NSYWRpYXRlZDtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSB0aW1lXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5jb25zdCBnZW5lcmF0ZVRoZXJtYWxDaHVua1RpbWVPbkZpbGFtZW50ID0gKCkgPT4ge1xyXG4gIHJldHVybiBUSEVSTUFMX0VORVJHWV9DSFVOS19USU1FX09OX0ZJTEFNRU5ULm1pbiArXHJcbiAgICAgICAgIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiBUSEVSTUFMX0VORVJHWV9DSFVOS19USU1FX09OX0ZJTEFNRU5ULmdldExlbmd0aCgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7VmVjdG9yMn0gc3RhcnRpbmdQb3NpdGlvblxyXG4gKiBAcGFyYW0ge1ZlY3RvcjJbXX0gcGF0aFBvaW50c1xyXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuY29uc3QgZ2V0VG90YWxQYXRoTGVuZ3RoID0gKCBzdGFydGluZ1Bvc2l0aW9uLCBwYXRoUG9pbnRzICkgPT4ge1xyXG4gIGlmICggcGF0aFBvaW50cy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcblxyXG4gIGxldCBwYXRoTGVuZ3RoID0gc3RhcnRpbmdQb3NpdGlvbi5kaXN0YW5jZSggcGF0aFBvaW50c1sgMCBdICk7XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGF0aFBvaW50cy5sZW5ndGggLSAxOyBpKysgKSB7XHJcbiAgICBwYXRoTGVuZ3RoICs9IHBhdGhQb2ludHNbIGkgXS5kaXN0YW5jZSggcGF0aFBvaW50c1sgaSArIDEgXSApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHBhdGhMZW5ndGg7XHJcbn07XHJcblxyXG5lbmVyZ3lGb3Jtc0FuZENoYW5nZXMucmVnaXN0ZXIoICdMaWdodEJ1bGInLCBMaWdodEJ1bGIgKTtcclxuZXhwb3J0IGRlZmF1bHQgTGlnaHRCdWxiO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSw4Q0FBOEM7QUFDaEYsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLE9BQU9DLGFBQWEsTUFBTSwrQkFBK0I7QUFDekQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxxQkFBcUIsTUFBTSxnQ0FBZ0M7QUFDbEUsT0FBT0Msb0JBQW9CLE1BQU0sMkJBQTJCO0FBQzVELE9BQU9DLFVBQVUsTUFBTSxpQkFBaUI7O0FBRXhDO0FBQ0EsTUFBTUMscUNBQXFDLEdBQUcsSUFBSVgsS0FBSyxDQUFFLENBQUMsRUFBRSxHQUFJLENBQUM7QUFDakUsTUFBTVkscUJBQXFCLEdBQUdOLGFBQWEsQ0FBQ08sMEJBQTBCO0FBQ3RFLE1BQU1DLDJCQUEyQixHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3pDLE1BQU1DLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxDQUFDOztBQUUvQjtBQUNBLE1BQU1DLHdCQUF3QixHQUFHLElBQUlkLE9BQU8sQ0FBRSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQU0sQ0FBQztBQUM3RCxNQUFNZSx5QkFBeUIsR0FBRyxJQUFJZixPQUFPLENBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFNLENBQUM7QUFDOUQsTUFBTWdCLHlCQUF5QixHQUFHLElBQUloQixPQUFPLENBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFLLENBQUM7QUFDOUQsTUFBTWlCLHlCQUF5QixHQUFHLElBQUlqQixPQUFPLENBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFNLENBQUM7QUFDL0QsTUFBTWtCLHlCQUF5QixHQUFHLElBQUlsQixPQUFPLENBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFNLENBQUM7QUFDL0QsTUFBTW1CLHlCQUF5QixHQUFHLElBQUluQixPQUFPLENBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFLLENBQUM7QUFDL0QsTUFBTW9CLDBCQUEwQixHQUFHLElBQUlwQixPQUFPLENBQUUsTUFBTSxFQUFFLENBQUMsSUFBSyxDQUFDO0FBQy9ELE1BQU1xQixvQkFBb0IsR0FBRyxJQUFJckIsT0FBTyxDQUFFLE1BQU0sRUFBRSxLQUFNLENBQUM7QUFDekQsTUFBTXNCLCtCQUErQixHQUFHLENBQ3RDUCx5QkFBeUIsRUFDekJDLHlCQUF5QixFQUN6QkMseUJBQXlCLEVBQ3pCQyx5QkFBeUIsRUFDekJDLHlCQUF5QixFQUN6QkMsMEJBQTBCLEVBQzFCQyxvQkFBb0IsQ0FDckI7QUFFRCxNQUFNRSxTQUFTLFNBQVNmLFVBQVUsQ0FBQztFQUVqQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VnQixXQUFXQSxDQUFFQyxTQUFTLEVBQUVDLFdBQVcsRUFBRUMsMkJBQTJCLEVBQUVDLGdCQUFnQixFQUFFQyx5QkFBeUIsRUFBRUMsT0FBTyxFQUFHO0lBRXZIQSxPQUFPLEdBQUc3QixLQUFLLENBQUU7TUFDZjhCLE1BQU0sRUFBRTdCLE1BQU0sQ0FBQzhCO0lBQ2pCLENBQUMsRUFBRUYsT0FBUSxDQUFDO0lBRVosS0FBSyxDQUFFTCxTQUFTLEVBQUVLLE9BQVEsQ0FBQzs7SUFFM0I7SUFDQSxJQUFJLENBQUNHLHFCQUFxQixHQUFHLElBQUlyQyxjQUFjLENBQUUsQ0FBQyxFQUFFO01BQ2xEc0MsS0FBSyxFQUFFLElBQUlwQyxLQUFLLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztNQUN4QmlDLE1BQU0sRUFBRUQsT0FBTyxDQUFDQyxNQUFNLENBQUNJLFlBQVksQ0FBRSx1QkFBd0IsQ0FBQztNQUM5REMsY0FBYyxFQUFFLElBQUk7TUFDcEJDLG1CQUFtQixFQUFFLElBQUk7TUFDekJDLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ1osV0FBVyxHQUFHQSxXQUFXO0lBQzlCLElBQUksQ0FBQ0MsMkJBQTJCLEdBQUdBLDJCQUEyQjtJQUM5RCxJQUFJLENBQUNDLGdCQUFnQixHQUFHQSxnQkFBZ0I7SUFDeEMsSUFBSSxDQUFDQyx5QkFBeUIsR0FBR0EseUJBQXlCOztJQUUxRDtJQUNBLElBQUksQ0FBQ1UsaUNBQWlDLEdBQUdiLFdBQVcsR0FBRyxJQUFJLEdBQUcsR0FBRzs7SUFFakU7SUFDQSxJQUFJLENBQUNjLDJCQUEyQixHQUFHN0MscUJBQXFCLENBQUU7TUFDeERvQyxNQUFNLEVBQUVELE9BQU8sQ0FBQ0MsTUFBTSxDQUFDSSxZQUFZLENBQUUsNkJBQThCLENBQUM7TUFDcEVNLFVBQVUsRUFBRTlDLHFCQUFxQixDQUFDK0MsaUJBQWlCLENBQUV2QyxXQUFXLENBQUVJLG9CQUFvQixDQUFDb0Msc0JBQXVCLENBQUU7SUFDbEgsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDQyx5QkFBeUIsR0FBR2pELHFCQUFxQixDQUFFO01BQ3REb0MsTUFBTSxFQUFFRCxPQUFPLENBQUNDLE1BQU0sQ0FBQ0ksWUFBWSxDQUFFLDJCQUE0QixDQUFDO01BQ2xFTSxVQUFVLEVBQUU5QyxxQkFBcUIsQ0FBQytDLGlCQUFpQixDQUFFdkMsV0FBVyxDQUFFSSxvQkFBb0IsQ0FBQ29DLHNCQUF1QixDQUFFO0lBQ2xILENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0UseUJBQXlCLEdBQUdsRCxxQkFBcUIsQ0FBRTtNQUN0RG9DLE1BQU0sRUFBRUQsT0FBTyxDQUFDQyxNQUFNLENBQUNJLFlBQVksQ0FBRSwyQkFBNEIsQ0FBQztNQUNsRU0sVUFBVSxFQUFFOUMscUJBQXFCLENBQUMrQyxpQkFBaUIsQ0FBRXZDLFdBQVcsQ0FBRUksb0JBQW9CLENBQUNvQyxzQkFBdUIsQ0FBRTtJQUNsSCxDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNHLGVBQWUsR0FBRyxJQUFJO0VBQzdCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsSUFBSUEsQ0FBRUMsRUFBRSxFQUFFQyxjQUFjLEVBQUc7SUFDekIsSUFBSyxJQUFJLENBQUNDLGNBQWMsQ0FBQ0MsS0FBSyxFQUFHO01BRS9CO01BQ0EsSUFBSyxJQUFJLENBQUNDLG9CQUFvQixDQUFDQyxNQUFNLEdBQUcsQ0FBQyxFQUFHO1FBRTFDLElBQUksQ0FBQ0Qsb0JBQW9CLENBQUNFLE9BQU8sQ0FBRUMsYUFBYSxJQUFJO1VBRWxELElBQUtBLGFBQWEsQ0FBQ0Msa0JBQWtCLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEtBQUtwRCxVQUFVLENBQUNxRCxVQUFVLEVBQUc7WUFFdEU7WUFDQSxJQUFJLENBQUNDLGVBQWUsQ0FBQ0MsSUFBSSxDQUFFTCxhQUFjLENBQUM7O1lBRTFDO1lBQ0EsSUFBSSxDQUFDZiwyQkFBMkIsQ0FBQ29CLElBQUksQ0FDbkMsSUFBSSxDQUFDL0IseUJBQXlCLENBQUNnQyxpQkFBaUIsQ0FDOUNOLGFBQWEsRUFDYmhELG9CQUFvQixDQUFDdUQscUJBQXFCLENBQUUsSUFBSSxDQUFDQyxnQkFBZ0IsQ0FBQ1osS0FBSyxFQUFFN0IsK0JBQWdDLENBQUMsRUFDMUdsQixhQUFhLENBQUM0RCxxQkFBc0IsQ0FDeEMsQ0FBQztVQUNIOztVQUVBO1VBQUEsS0FDSztZQUNIQyxNQUFNLElBQUlBLE1BQU0sQ0FDZCxLQUFLLEVBQ0osa0RBQWlELElBQUksQ0FBQ0MsbUJBQW1CLENBQUNWLGtCQUFrQixDQUFDQyxHQUFHLENBQUMsQ0FBRSxFQUN0RyxDQUFDO1VBQ0g7UUFDRixDQUFFLENBQUM7UUFFSCxJQUFJLENBQUNMLG9CQUFvQixDQUFDZSxLQUFLLENBQUMsQ0FBQztNQUNuQzs7TUFFQTtNQUNBLElBQUksQ0FBQ0MsMEJBQTBCLENBQUVwQixFQUFHLENBQUM7TUFDckMsSUFBSSxDQUFDcUIsd0JBQXdCLENBQUVyQixFQUFHLENBQUM7TUFDbkMsSUFBSSxDQUFDc0Isd0JBQXdCLENBQUV0QixFQUFHLENBQUM7O01BRW5DO01BQ0EsSUFBSyxJQUFJLENBQUNyQiwyQkFBMkIsQ0FBQzhCLEdBQUcsQ0FBQyxDQUFDLEVBQUc7UUFFNUM7UUFDQSxJQUFJYyxzQkFBc0IsR0FBRyxDQUFDO1FBRTlCLElBQUksQ0FBQzFCLHlCQUF5QixDQUFDUyxPQUFPLENBQUVrQixLQUFLLElBQUk7VUFDL0MsTUFBTUMsUUFBUSxHQUFHRCxLQUFLLENBQUNFLFdBQVcsQ0FBQ1gsZ0JBQWdCLENBQUNaLEtBQUssQ0FBQ3NCLFFBQVEsQ0FBRSxJQUFJLENBQUNWLGdCQUFnQixDQUFDWixLQUFLLENBQUN3QixJQUFJLENBQUV0RCxvQkFBcUIsQ0FBRSxDQUFDO1VBQzlILElBQUtvRCxRQUFRLEdBQUc3RCwyQkFBMkIsRUFBRztZQUM1QzJELHNCQUFzQixFQUFFO1VBQzFCO1FBQ0YsQ0FBRSxDQUFDO1FBRUgsSUFBS0Esc0JBQXNCLEdBQUcsQ0FBQyxFQUFHO1VBRWhDO1VBQ0EsSUFBSSxDQUFDdEMscUJBQXFCLENBQUMyQyxHQUFHLENBQUVDLElBQUksQ0FBQ0MsR0FBRyxDQUFFLEdBQUcsRUFBRSxJQUFJLENBQUM3QyxxQkFBcUIsQ0FBQ3dCLEdBQUcsQ0FBQyxDQUFDLEdBQUc1QyxpQkFBaUIsR0FBR21DLEVBQUcsQ0FBRSxDQUFDO1FBQzlHLENBQUMsTUFDSTtVQUVIO1VBQ0EsSUFBSSxDQUFDZixxQkFBcUIsQ0FBQzJDLEdBQUcsQ0FBRUMsSUFBSSxDQUFDRSxHQUFHLENBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQzlDLHFCQUFxQixDQUFDd0IsR0FBRyxDQUFDLENBQUMsR0FBRzVDLGlCQUFpQixHQUFHbUMsRUFBRyxDQUFFLENBQUM7UUFDNUc7TUFDRjs7TUFFQTtNQUFBLEtBQ0s7UUFDSCxJQUFLLElBQUksQ0FBQ0UsY0FBYyxDQUFDQyxLQUFLLElBQUlGLGNBQWMsQ0FBQytCLElBQUksS0FBSzNFLFVBQVUsQ0FBQ3FELFVBQVUsRUFBRztVQUNoRixJQUFJLENBQUN6QixxQkFBcUIsQ0FBQzJDLEdBQUcsQ0FBRTdFLEtBQUssQ0FBQ2tGLEtBQUssQ0FBRWhDLGNBQWMsQ0FBQ2lDLE1BQU0sSUFBS3hFLHFCQUFxQixHQUFHc0MsRUFBRSxDQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBRSxDQUFDO1FBQy9HLENBQUMsTUFDSTtVQUNILElBQUksQ0FBQ2YscUJBQXFCLENBQUMyQyxHQUFHLENBQUUsR0FBSSxDQUFDO1FBQ3ZDO01BQ0Y7SUFDRjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VOLHdCQUF3QkEsQ0FBRXRCLEVBQUUsRUFBRztJQUU3QjtJQUNBLE1BQU1tQyxNQUFNLEdBQUcsSUFBSSxDQUFDdEMseUJBQXlCLENBQUN1QyxLQUFLLENBQUMsQ0FBQztJQUVyREQsTUFBTSxDQUFDN0IsT0FBTyxDQUFFa0IsS0FBSyxJQUFJO01BQ3ZCQSxLQUFLLENBQUNhLGFBQWEsQ0FBRXJDLEVBQUcsQ0FBQzs7TUFFekI7TUFDQSxJQUFLd0IsS0FBSyxDQUFDYyxrQkFBa0IsRUFBRztRQUM5QixJQUFJLENBQUMzQixlQUFlLENBQUM0QixNQUFNLENBQUVmLEtBQUssQ0FBQ0UsV0FBWSxDQUFDO1FBQ2hELElBQUksQ0FBQzdCLHlCQUF5QixDQUFDMEMsTUFBTSxDQUFFZixLQUFNLENBQUM7UUFDOUMsSUFBSSxDQUFDNUMsZ0JBQWdCLENBQUM0RCxjQUFjLENBQUVoQixLQUFLLENBQUNFLFdBQVksQ0FBQztRQUN6RCxJQUFJLENBQUM3Qyx5QkFBeUIsQ0FBQzJELGNBQWMsQ0FBRWhCLEtBQU0sQ0FBQztNQUN4RDtJQUNGLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VILHdCQUF3QkEsQ0FBRXJCLEVBQUUsRUFBRztJQUU3QjtJQUNBLE1BQU1tQyxNQUFNLEdBQUcsSUFBSSxDQUFDdkMseUJBQXlCLENBQUN3QyxLQUFLLENBQUMsQ0FBQztJQUVyREQsTUFBTSxDQUFDN0IsT0FBTyxDQUFFa0IsS0FBSyxJQUFJO01BQ3ZCQSxLQUFLLENBQUNhLGFBQWEsQ0FBRXJDLEVBQUcsQ0FBQzs7TUFFekI7TUFDQSxJQUFLd0IsS0FBSyxDQUFDYyxrQkFBa0IsRUFBRztRQUM5QixJQUFJLENBQUMxQyx5QkFBeUIsQ0FBQzJDLE1BQU0sQ0FBRWYsS0FBTSxDQUFDO1FBQzlDLElBQUksQ0FBQ2lCLGtCQUFrQixDQUFFakIsS0FBSyxDQUFDRSxXQUFZLENBQUM7UUFDNUMsSUFBSSxDQUFDN0MseUJBQXlCLENBQUMyRCxjQUFjLENBQUVoQixLQUFNLENBQUM7TUFFeEQ7SUFDRixDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFSiwwQkFBMEJBLENBQUVwQixFQUFFLEVBQUc7SUFFL0I7SUFDQSxNQUFNbUMsTUFBTSxHQUFHLElBQUksQ0FBQzNDLDJCQUEyQixDQUFDNEMsS0FBSyxDQUFDLENBQUM7SUFFdkRELE1BQU0sQ0FBQzdCLE9BQU8sQ0FBRWtCLEtBQUssSUFBSTtNQUN2QkEsS0FBSyxDQUFDYSxhQUFhLENBQUVyQyxFQUFHLENBQUM7TUFFekIsSUFBS3dCLEtBQUssQ0FBQ2Msa0JBQWtCLEVBQUc7UUFDOUIsSUFBSSxDQUFDOUMsMkJBQTJCLENBQUMrQyxNQUFNLENBQUVmLEtBQU0sQ0FBQztRQUNoRCxJQUFJLENBQUMzQyx5QkFBeUIsQ0FBQzJELGNBQWMsQ0FBRWhCLEtBQU0sQ0FBQzs7UUFFdEQ7UUFDQSxJQUFLLElBQUksQ0FBQzlDLFdBQVcsRUFBRztVQUN0QjhDLEtBQUssQ0FBQ0UsV0FBVyxDQUFDbEIsa0JBQWtCLENBQUNvQixHQUFHLENBQUV2RSxVQUFVLENBQUNxRixPQUFRLENBQUM7VUFDOUQsTUFBTUMsSUFBSSxHQUFHLElBQUksQ0FBQ0Msb0JBQW9CLENBQUVwQixLQUFLLENBQUNFLFdBQVcsQ0FBQ1gsZ0JBQWdCLENBQUNaLEtBQU0sQ0FBQztVQUNsRixNQUFNMEMsS0FBSyxHQUFHQyxrQkFBa0IsQ0FBRXRCLEtBQUssQ0FBQ0UsV0FBVyxDQUFDWCxnQkFBZ0IsQ0FBQ1osS0FBSyxFQUFFd0MsSUFBSyxDQUFDLEdBQ3BFSSxrQ0FBa0MsQ0FBQyxDQUFDO1VBQ2xELElBQUksQ0FBQ25ELHlCQUF5QixDQUFDZ0IsSUFBSSxDQUFFLElBQUksQ0FBQy9CLHlCQUF5QixDQUFDZ0MsaUJBQWlCLENBQUVXLEtBQUssQ0FBQ0UsV0FBVyxFQUFFaUIsSUFBSSxFQUFFRSxLQUFNLENBQUUsQ0FBQztRQUMzSCxDQUFDLE1BQ0k7VUFFSDtVQUNBLElBQUksQ0FBQ0osa0JBQWtCLENBQUVqQixLQUFLLENBQUNFLFdBQVksQ0FBQztRQUM5QztNQUNGO0lBQ0YsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFc0IsbUJBQW1CQSxDQUFFL0MsY0FBYyxFQUFHO0lBRXBDLElBQUksQ0FBQ2dELGlCQUFpQixDQUFDLENBQUM7SUFFeEIsSUFBS2hELGNBQWMsQ0FBQ2lDLE1BQU0sR0FBRzlFLGFBQWEsQ0FBQ08sMEJBQTBCLEdBQUcsRUFBRSxJQUNyRXNDLGNBQWMsQ0FBQytCLElBQUksS0FBSzNFLFVBQVUsQ0FBQ3FELFVBQVUsRUFBRztNQUVuRDtNQUNBO0lBQ0Y7SUFFQSxNQUFNVixFQUFFLEdBQUcsQ0FBQyxHQUFHNUMsYUFBYSxDQUFDOEYsaUJBQWlCO0lBQzlDLElBQUlDLG9CQUFvQixHQUFHL0YsYUFBYSxDQUFDZ0csZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLENBQUM7O0lBRWxFO0lBQ0EsSUFBSUMsZUFBZSxHQUFHLEtBQUs7SUFDM0IsT0FBUSxDQUFDQSxlQUFlLEVBQUc7TUFDekJGLG9CQUFvQixJQUFJbEQsY0FBYyxDQUFDaUMsTUFBTSxHQUFHbEMsRUFBRTs7TUFFbEQ7TUFDQSxJQUFLbUQsb0JBQW9CLElBQUkvRixhQUFhLENBQUNnRyxnQkFBZ0IsRUFBRztRQUM1RCxNQUFNRSxjQUFjLEdBQUcsSUFBSSxDQUFDMUUsZ0JBQWdCLENBQUNpQyxpQkFBaUIsQ0FDNUR4RCxVQUFVLENBQUNxRCxVQUFVLEVBQ3JCLElBQUksQ0FBQ0ssZ0JBQWdCLENBQUNaLEtBQUssQ0FBQ3dCLElBQUksQ0FBRTdELHdCQUF5QixDQUFDLEVBQzVEZCxPQUFPLENBQUN1RyxJQUFJLEVBQ1osSUFBSSxDQUFDNUUsMkJBQ1AsQ0FBQztRQUVELElBQUksQ0FBQ2dDLGVBQWUsQ0FBQ0MsSUFBSSxDQUFFMEMsY0FBZSxDQUFDOztRQUUzQztRQUNBLElBQUksQ0FBQzlELDJCQUEyQixDQUFDb0IsSUFBSSxDQUFFLElBQUksQ0FBQy9CLHlCQUF5QixDQUFDZ0MsaUJBQWlCLENBQ3JGeUMsY0FBYyxFQUNkL0Ysb0JBQW9CLENBQUN1RCxxQkFBcUIsQ0FBRSxJQUFJLENBQUNDLGdCQUFnQixDQUFDWixLQUFLLEVBQUU3QiwrQkFBZ0MsQ0FBQyxFQUMxR2xCLGFBQWEsQ0FBQzRELHFCQUNoQixDQUFFLENBQUM7O1FBRUg7UUFDQW1DLG9CQUFvQixHQUFHQSxvQkFBb0IsR0FBRy9GLGFBQWEsQ0FBQ2dHLGdCQUFnQjtNQUM5RTtNQUVBLElBQUksQ0FBQ2hDLDBCQUEwQixDQUFFcEIsRUFBRyxDQUFDO01BQ3JDLElBQUksQ0FBQ3FCLHdCQUF3QixDQUFFckIsRUFBRyxDQUFDO01BRW5DLElBQUssSUFBSSxDQUFDSCx5QkFBeUIsQ0FBQ1EsTUFBTSxHQUFHLENBQUMsRUFBRztRQUUvQztRQUNBZ0QsZUFBZSxHQUFHLElBQUk7TUFDeEI7SUFDRjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VaLGtCQUFrQkEsQ0FBRWYsV0FBVyxFQUFHO0lBQ2hDLElBQUs3RSxTQUFTLENBQUMyRyxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ2pFLGlDQUFpQyxFQUFHO01BQ3JFbUMsV0FBVyxDQUFDbEIsa0JBQWtCLENBQUNvQixHQUFHLENBQUV2RSxVQUFVLENBQUNvRyxLQUFNLENBQUM7SUFDeEQsQ0FBQyxNQUNJO01BQ0gvQixXQUFXLENBQUNsQixrQkFBa0IsQ0FBQ29CLEdBQUcsQ0FBRXZFLFVBQVUsQ0FBQ3FGLE9BQVEsQ0FBQztJQUMxRDtJQUVBLElBQUksQ0FBQzdDLHlCQUF5QixDQUFDZSxJQUFJLENBQUUsSUFBSSxDQUFDL0IseUJBQXlCLENBQUNnQyxpQkFBaUIsQ0FDbkZhLFdBQVcsRUFDWG5FLG9CQUFvQixDQUFDbUcsd0JBQXdCLENBQzNDLElBQUksQ0FBQzNDLGdCQUFnQixDQUFDWixLQUFLLEVBQzNCLElBQUlyRCxLQUFLLENBQUUrRSxJQUFJLENBQUM4QixFQUFFLEdBQUcsQ0FBQyxFQUFFOUIsSUFBSSxDQUFDOEIsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUUsQ0FBQyxFQUM3Q3ZHLGFBQWEsQ0FBQzRELHFCQUFzQixDQUN0QyxDQUFDO0VBQ0g7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFNEIsb0JBQW9CQSxDQUFFZ0IsYUFBYSxFQUFHO0lBQ3BDLE1BQU1qQixJQUFJLEdBQUcsRUFBRTtJQUNmLE1BQU1rQixhQUFhLEdBQUcsSUFBSTtJQUMxQixNQUFNQyxDQUFDLEdBQUcsQ0FBRSxHQUFHLEdBQUdqSCxTQUFTLENBQUMyRyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBS0ssYUFBYSxHQUFHLENBQUMsSUFBSyxJQUFJLENBQUMvRCxlQUFlLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFFO0lBRXRHNkMsSUFBSSxDQUFDL0IsSUFBSSxDQUFFZ0QsYUFBYSxDQUFDakMsSUFBSSxDQUFFLElBQUkzRSxPQUFPLENBQUU4RyxDQUFDLEVBQUUsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUN0RCxJQUFJLENBQUNoRSxlQUFlLEdBQUcsQ0FBQyxJQUFJLENBQUNBLGVBQWU7SUFFNUMsT0FBTzZDLElBQUk7RUFDYjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VvQixVQUFVQSxDQUFBLEVBQUc7SUFDWCxLQUFLLENBQUNBLFVBQVUsQ0FBQyxDQUFDO0lBQ2xCLElBQUksQ0FBQzlFLHFCQUFxQixDQUFDMkMsR0FBRyxDQUFFLENBQUUsQ0FBQztFQUNyQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFcUIsaUJBQWlCQSxDQUFBLEVBQUc7SUFDbEIsS0FBSyxDQUFDQSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3pCLElBQUksQ0FBQ3pELDJCQUEyQixDQUFDYyxPQUFPLENBQUVrQixLQUFLLElBQUksSUFBSSxDQUFDM0MseUJBQXlCLENBQUMyRCxjQUFjLENBQUVoQixLQUFNLENBQUUsQ0FBQztJQUMzRyxJQUFJLENBQUNoQywyQkFBMkIsQ0FBQzJCLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLElBQUksQ0FBQ3ZCLHlCQUF5QixDQUFDVSxPQUFPLENBQUVrQixLQUFLLElBQUksSUFBSSxDQUFDM0MseUJBQXlCLENBQUMyRCxjQUFjLENBQUVoQixLQUFNLENBQUUsQ0FBQztJQUN6RyxJQUFJLENBQUM1Qix5QkFBeUIsQ0FBQ3VCLEtBQUssQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQ3RCLHlCQUF5QixDQUFDUyxPQUFPLENBQUVrQixLQUFLLElBQUksSUFBSSxDQUFDM0MseUJBQXlCLENBQUMyRCxjQUFjLENBQUVoQixLQUFNLENBQUUsQ0FBQztJQUN6RyxJQUFJLENBQUMzQix5QkFBeUIsQ0FBQ3NCLEtBQUssQ0FBQyxDQUFDO0VBQ3hDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRTZDLGFBQWFBLENBQUEsRUFBRztJQUNkLE9BQU87TUFDTGxFLGVBQWUsRUFBRSxJQUFJLENBQUNBLGVBQWU7TUFDckNwQixXQUFXLEVBQUUsSUFBSSxDQUFDQSxXQUFXO01BQzdCYSxpQ0FBaUMsRUFBRSxJQUFJLENBQUNBO0lBQzFDLENBQUM7RUFDSDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0UwRSxVQUFVQSxDQUFFQyxXQUFXLEVBQUc7SUFDeEIsSUFBSSxDQUFDcEUsZUFBZSxHQUFHb0UsV0FBVyxDQUFDcEUsZUFBZTtJQUNsRCxJQUFJLENBQUNwQixXQUFXLEdBQUd3RixXQUFXLENBQUN4RixXQUFXO0lBQzFDLElBQUksQ0FBQ2EsaUNBQWlDLEdBQUcyRSxXQUFXLENBQUMzRSxpQ0FBaUM7RUFDeEY7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU13RCxrQ0FBa0MsR0FBR0EsQ0FBQSxLQUFNO0VBQy9DLE9BQU90RixxQ0FBcUMsQ0FBQ3FFLEdBQUcsR0FDekNqRixTQUFTLENBQUMyRyxVQUFVLENBQUMsQ0FBQyxHQUFHL0YscUNBQXFDLENBQUMwRyxTQUFTLENBQUMsQ0FBQztBQUNuRixDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1yQixrQkFBa0IsR0FBR0EsQ0FBRXNCLGdCQUFnQixFQUFFQyxVQUFVLEtBQU07RUFDN0QsSUFBS0EsVUFBVSxDQUFDaEUsTUFBTSxLQUFLLENBQUMsRUFBRztJQUM3QixPQUFPLENBQUM7RUFDVjtFQUVBLElBQUlpRSxVQUFVLEdBQUdGLGdCQUFnQixDQUFDM0MsUUFBUSxDQUFFNEMsVUFBVSxDQUFFLENBQUMsQ0FBRyxDQUFDO0VBQzdELEtBQU0sSUFBSUUsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRixVQUFVLENBQUNoRSxNQUFNLEdBQUcsQ0FBQyxFQUFFa0UsQ0FBQyxFQUFFLEVBQUc7SUFDaERELFVBQVUsSUFBSUQsVUFBVSxDQUFFRSxDQUFDLENBQUUsQ0FBQzlDLFFBQVEsQ0FBRTRDLFVBQVUsQ0FBRUUsQ0FBQyxHQUFHLENBQUMsQ0FBRyxDQUFDO0VBQy9EO0VBRUEsT0FBT0QsVUFBVTtBQUNuQixDQUFDO0FBRURoSCxxQkFBcUIsQ0FBQ2tILFFBQVEsQ0FBRSxXQUFXLEVBQUVqRyxTQUFVLENBQUM7QUFDeEQsZUFBZUEsU0FBUyJ9