// Copyright 2016-2022, University of Colorado Boulder

/**
 * a type representing a model of the sun as an energy source - includes the clouds that can block the sun's rays
 *
 * @author  John Blanco (original Java)
 * @author  Andrew Adare (js port)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import sunIcon_png from '../../../images/sunIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Cloud from './Cloud.js';
import Energy from './Energy.js';
import EnergySource from './EnergySource.js';

// constants
const RADIUS = 0.02; // In meters, apparent size, not (obviously) actual size.
const OFFSET_TO_CENTER_OF_SUN = new Vector2(-0.05, 0.12);
const ENERGY_CHUNK_EMISSION_PERIOD = 0.11; // In seconds.
const MAX_DISTANCE_OF_E_CHUNKS_FROM_SUN = 0.7; // In meters.

// Constants that control the nature of the emission sectors.  These are used to make emission look random yet still
// have a fairly steady rate within each sector.  One sector is intended to point at the solar panel.
const NUM_EMISSION_SECTORS = 10;
const EMISSION_SECTOR_SPAN = 2 * Math.PI / NUM_EMISSION_SECTORS;

// used to tweak sector positions to make sure solar panel gets consistent flow of E's
const EMISSION_SECTOR_OFFSET = EMISSION_SECTOR_SPAN * 0.71;
class SunEnergySource extends EnergySource {
  /**
   * @param {SolarPanel} solarPanel
   * @param {BooleanProperty} isPlayingProperty
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {Object} [options]
   */
  constructor(solarPanel, isPlayingProperty, energyChunksVisibleProperty, energyChunkGroup, options) {
    options = merge({
      tandem: Tandem.REQUIRED
    }, options);
    super(new Image(sunIcon_png), options);

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.sun;

    // @public (read-only) {SolarPanel}
    this.solarPanel = solarPanel;

    // @public (read-only) {number}
    this.radius = RADIUS;

    // @public {Cloud[]} - clouds that can potentially block the sun's rays.  The positions are set so that they appear
    // between the sun and the solar panel, and must not overlap with one another.
    this.clouds = [new Cloud(new Vector2(-0.01, 0.08), this.positionProperty), new Cloud(new Vector2(0.017, 0.0875), this.positionProperty), new Cloud(new Vector2(0.02, 0.105), this.positionProperty)];

    // @public {NumberProperty} - a factor between zero and one that indicates how cloudy it is
    this.cloudinessProportionProperty = new NumberProperty(0, {
      range: new Range(0, 1),
      tandem: options.tandem.createTandem('cloudinessProportionProperty'),
      phetioDocumentation: 'proportion of clouds blocking the sun'
    });

    // @public - exists only for phet-io
    this.sunProportionProperty = new DerivedProperty([this.cloudinessProportionProperty], cloudinessProportion => {
      return 1 - cloudinessProportion;
    }, {
      range: new Range(0, 1),
      tandem: options.tandem.createTandem('sunProportionProperty'),
      phetioDocumentation: 'proportion of sun reaching the solar panel',
      phetioValueType: NumberIO
    });

    // @private - internal variables used in methods
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.isPlayingProperty = isPlayingProperty;
    this.energyChunkEmissionCountdownTimer = ENERGY_CHUNK_EMISSION_PERIOD;
    this.sectorList = dotRandom.shuffle(_.range(NUM_EMISSION_SECTORS));
    this.currentSectorIndex = 0;
    this.sunPosition = OFFSET_TO_CENTER_OF_SUN;

    // @private - list of energy chunks that should be allowed to pass through the clouds without bouncing (i.e. being
    // reflected)
    this.energyChunksPassingThroughClouds = createObservableArray({
      tandem: options.tandem.createTandem('energyChunksPassingThroughClouds'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(EnergyChunk.EnergyChunkIO))
    });

    // @private
    this.energyChunkGroup = energyChunkGroup;

    // set up a listener to add/remove clouds based on the value of the cloudiness Property
    this.cloudinessProportionProperty.link(cloudiness => {
      const nClouds = this.clouds.length;
      for (let i = 0; i < nClouds; i++) {
        // stagger the existence strength of the clouds
        const value = Utils.clamp(cloudiness * nClouds - i, 0, 1);
        this.clouds[i].existenceStrengthProperty.set(value);
      }
    });

    // update the position of the sun as the position of this system changes
    this.positionProperty.link(position => {
      this.sunPosition = position.plus(OFFSET_TO_CENTER_OF_SUN);
    });
  }

  /**
   * step in time
   * @param dt - time step, in seconds
   * @returns {Energy}
   * @public
   */
  step(dt) {
    let energyProduced = 0;
    if (this.activeProperty.value === true) {
      // see if it is time to emit a new energy chunk
      this.energyChunkEmissionCountdownTimer -= dt;
      if (this.energyChunkEmissionCountdownTimer <= 0) {
        // create a new chunk and start it on its way
        this.emitEnergyChunk();
        this.energyChunkEmissionCountdownTimer += ENERGY_CHUNK_EMISSION_PERIOD;
      }

      // move the energy chunks
      this.updateEnergyChunkPositions(dt);
      let energyProducedProportion = 1 - this.cloudinessProportionProperty.value;

      // map energy produced proportion to eliminate very low values
      energyProducedProportion = energyProducedProportion === 0 ? 0 : 0.1 + energyProducedProportion * 0.9;
      assert && assert(energyProducedProportion >= 0 && energyProducedProportion <= 1);

      // calculate the amount of energy produced
      energyProduced = EFACConstants.MAX_ENERGY_PRODUCTION_RATE * energyProducedProportion * dt;
    }

    // produce the energy
    return new Energy(EnergyType.LIGHT, energyProduced, 0);
  }

  /**
   * @param {number} dt - time step, in seconds
   * @private
   */
  updateEnergyChunkPositions(dt) {
    // check for bouncing and absorption of the energy chunks
    this.energyChunkList.forEach(chunk => {
      const distanceFromSun = chunk.positionProperty.value.distance(this.sunPosition.plus(OFFSET_TO_CENTER_OF_SUN));

      // this energy chunk was absorbed by the solar panel, so put it on the list of outgoing chunks
      if (this.solarPanel.activeProperty.value && this.solarPanel.getAbsorptionShape().containsPoint(chunk.positionProperty.value)) {
        this.energyChunkList.remove(chunk);
        if (this.energyChunksPassingThroughClouds.includes(chunk)) {
          this.energyChunksPassingThroughClouds.remove(chunk);
        }
        this.outgoingEnergyChunks.push(chunk);
      }

      // this energy chunk is out of visible range, so remove it
      else if (distanceFromSun > MAX_DISTANCE_OF_E_CHUNKS_FROM_SUN || chunk.positionProperty.value.x < -0.35 ||
      // empirically determined
      chunk.positionProperty.value.y > EFACConstants.SYSTEMS_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT) {
        this.energyChunkList.remove(chunk);
        if (this.energyChunksPassingThroughClouds.includes(chunk)) {
          this.energyChunksPassingThroughClouds.remove(chunk);
        }
        this.energyChunkGroup.disposeElement(chunk);
      }

      // chunks encountering clouds
      else {
        this.clouds.forEach(cloud => {
          const inClouds = cloud.getCloudAbsorptionReflectionShape().containsPoint(chunk.positionProperty.value);
          const inList = this.energyChunksPassingThroughClouds.includes(chunk);
          const deltaPhi = chunk.velocity.angle - chunk.positionProperty.value.minus(this.sunPosition).angle;
          if (inClouds && !inList && Math.abs(deltaPhi) < Math.PI / 10) {
            // decide whether this energy chunk should pass through the clouds or be reflected
            if (dotRandom.nextDouble() < cloud.existenceStrengthProperty.get()) {
              // Reflect the energy chunk.  It looks a little weird if they go back to the sun, so the code below
              // tries to avoid that.
              const angleTowardsSun = chunk.velocity.angle + Math.PI;
              const reflectionAngle = chunk.positionProperty.value.minus(cloud.getCenterPosition()).angle;
              if (reflectionAngle < angleTowardsSun) {
                chunk.setVelocity(chunk.velocity.rotated(0.7 * Math.PI + dotRandom.nextDouble() * Math.PI / 8));
              } else {
                chunk.setVelocity(chunk.velocity.rotated(-0.7 * Math.PI - dotRandom.nextDouble() * Math.PI / 8));
              }
            } else {
              // let the energy chunk pass through the cloud
              this.energyChunksPassingThroughClouds.push(chunk);
            }
          }
        });
      }
    });

    // move the energy chunks
    this.energyChunkList.forEach(chunk => {
      chunk.translateBasedOnVelocity(dt);
    });
  }

  /**
   * @private
   */
  emitEnergyChunk() {
    const emissionAngle = this.chooseNextEmissionAngle();
    const velocity = new Vector2(EFACConstants.ENERGY_CHUNK_VELOCITY, 0).rotated(emissionAngle);
    const startPoint = this.sunPosition.plus(new Vector2(RADIUS / 2, 0).rotated(emissionAngle));
    const chunk = this.energyChunkGroup.createNextElement(EnergyType.LIGHT, startPoint, velocity, this.energyChunksVisibleProperty);
    this.energyChunkList.add(chunk);
  }

  /**
   * @public
   * @override
   */
  preloadEnergyChunks() {
    this.clearEnergyChunks();
    let preloadTime = 6; // in simulated seconds, empirically determined
    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    this.energyChunkEmissionCountdownTimer = 0;

    // simulate energy chunks moving through the system
    while (preloadTime > 0) {
      this.energyChunkEmissionCountdownTimer -= dt;
      if (this.energyChunkEmissionCountdownTimer <= 0) {
        this.emitEnergyChunk();
        this.energyChunkEmissionCountdownTimer += ENERGY_CHUNK_EMISSION_PERIOD;
      }
      this.updateEnergyChunkPositions(dt);
      preloadTime -= dt;
    }

    // remove any chunks that actually made it to the solar panel
    this.outgoingEnergyChunks.clear();
  }

  /**
   * return a structure containing type, rate, and direction of emitted energy
   * @returns {Energy}
   * @public
   */
  getEnergyOutputRate() {
    return new Energy(EnergyType.LIGHT, EFACConstants.MAX_ENERGY_PRODUCTION_RATE * (1 - this.cloudinessProportionProperty.value));
  }

  /**
   * @returns {number} emission angle
   * @private
   */
  chooseNextEmissionAngle() {
    const sector = this.sectorList[this.currentSectorIndex];
    this.currentSectorIndex++;
    if (this.currentSectorIndex >= NUM_EMISSION_SECTORS) {
      this.currentSectorIndex = 0;
    }

    // angle is a function of the selected sector and a random offset within the sector
    return sector * EMISSION_SECTOR_SPAN + dotRandom.nextDouble() * EMISSION_SECTOR_SPAN + EMISSION_SECTOR_OFFSET;
  }

  /**
   * Pre-populate the space around the sun with energy chunks. The number of iterations is chosen carefully such that
   * there are chunks that are close, but not quite reaching, the solar panel.
   * @public
   * @override
   */
  activate() {
    super.activate();

    // Don't move the EnergyChunks from their position if setting state.
    // Don't step if not playing, this makes sure that PhET-iO state maintains exact EnergyChunk positions.
    if (!phet.joist.sim.isSettingPhetioStateProperty.value && this.isPlayingProperty.value) {
      // step a few times to get some energy chunks out
      for (let i = 0; i < 100; i++) {
        this.step(EFACConstants.SIM_TIME_PER_TICK_NORMAL);
      }
    }
  }

  /**
   * deactivate the sun
   * @public
   * @override
   */
  deactivate() {
    super.deactivate();
    this.cloudinessProportionProperty.reset();
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.energyChunksPassingThroughClouds.clear();
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @returns {Object}
   */
  toStateObject() {
    return {
      sectorList: this.sectorList,
      currentSectorIndex: this.currentSectorIndex,
      radius: this.radius,
      sunPosition: this.sunPosition,
      energyChunkEmissionCountdownTimer: this.energyChunkEmissionCountdownTimer
    };
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @param {Object} stateObject - see this.toStateObject()
   */
  applyState(stateObject) {
    this.sectorList = stateObject.sectorList;
    this.currentSectorIndex = stateObject.currentSectorIndex;
    this.radius = stateObject.radius;
    this.sunPosition = stateObject.sunPosition;
    this.energyChunkEmissionCountdownTimer = stateObject.energyChunkEmissionCountdownTimer;
  }
}

// statics
SunEnergySource.OFFSET_TO_CENTER_OF_SUN = OFFSET_TO_CENTER_OF_SUN;
energyFormsAndChanges.register('SunEnergySource', SunEnergySource);
export default SunEnergySource;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwibWVyZ2UiLCJJbWFnZSIsIlRhbmRlbSIsIk51bWJlcklPIiwiUmVmZXJlbmNlSU8iLCJzdW5JY29uX3BuZyIsIkVGQUNDb25zdGFudHMiLCJFbmVyZ3lDaHVuayIsIkVuZXJneVR5cGUiLCJlbmVyZ3lGb3Jtc0FuZENoYW5nZXMiLCJFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzIiwiQ2xvdWQiLCJFbmVyZ3kiLCJFbmVyZ3lTb3VyY2UiLCJSQURJVVMiLCJPRkZTRVRfVE9fQ0VOVEVSX09GX1NVTiIsIkVORVJHWV9DSFVOS19FTUlTU0lPTl9QRVJJT0QiLCJNQVhfRElTVEFOQ0VfT0ZfRV9DSFVOS1NfRlJPTV9TVU4iLCJOVU1fRU1JU1NJT05fU0VDVE9SUyIsIkVNSVNTSU9OX1NFQ1RPUl9TUEFOIiwiTWF0aCIsIlBJIiwiRU1JU1NJT05fU0VDVE9SX09GRlNFVCIsIlN1bkVuZXJneVNvdXJjZSIsImNvbnN0cnVjdG9yIiwic29sYXJQYW5lbCIsImlzUGxheWluZ1Byb3BlcnR5IiwiZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5IiwiZW5lcmd5Q2h1bmtHcm91cCIsIm9wdGlvbnMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImExMXlOYW1lIiwiYTExeSIsInN1biIsInJhZGl1cyIsImNsb3VkcyIsInBvc2l0aW9uUHJvcGVydHkiLCJjbG91ZGluZXNzUHJvcG9ydGlvblByb3BlcnR5IiwicmFuZ2UiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwic3VuUHJvcG9ydGlvblByb3BlcnR5IiwiY2xvdWRpbmVzc1Byb3BvcnRpb24iLCJwaGV0aW9WYWx1ZVR5cGUiLCJlbmVyZ3lDaHVua0VtaXNzaW9uQ291bnRkb3duVGltZXIiLCJzZWN0b3JMaXN0Iiwic2h1ZmZsZSIsIl8iLCJjdXJyZW50U2VjdG9ySW5kZXgiLCJzdW5Qb3NpdGlvbiIsImVuZXJneUNodW5rc1Bhc3NpbmdUaHJvdWdoQ2xvdWRzIiwicGhldGlvVHlwZSIsIk9ic2VydmFibGVBcnJheUlPIiwiRW5lcmd5Q2h1bmtJTyIsImxpbmsiLCJjbG91ZGluZXNzIiwibkNsb3VkcyIsImxlbmd0aCIsImkiLCJ2YWx1ZSIsImNsYW1wIiwiZXhpc3RlbmNlU3RyZW5ndGhQcm9wZXJ0eSIsInNldCIsInBvc2l0aW9uIiwicGx1cyIsInN0ZXAiLCJkdCIsImVuZXJneVByb2R1Y2VkIiwiYWN0aXZlUHJvcGVydHkiLCJlbWl0RW5lcmd5Q2h1bmsiLCJ1cGRhdGVFbmVyZ3lDaHVua1Bvc2l0aW9ucyIsImVuZXJneVByb2R1Y2VkUHJvcG9ydGlvbiIsImFzc2VydCIsIk1BWF9FTkVSR1lfUFJPRFVDVElPTl9SQVRFIiwiTElHSFQiLCJlbmVyZ3lDaHVua0xpc3QiLCJmb3JFYWNoIiwiY2h1bmsiLCJkaXN0YW5jZUZyb21TdW4iLCJkaXN0YW5jZSIsImdldEFic29ycHRpb25TaGFwZSIsImNvbnRhaW5zUG9pbnQiLCJyZW1vdmUiLCJpbmNsdWRlcyIsIm91dGdvaW5nRW5lcmd5Q2h1bmtzIiwicHVzaCIsIngiLCJ5IiwiU1lTVEVNU19TQ1JFRU5fRU5FUkdZX0NIVU5LX01BWF9UUkFWRUxfSEVJR0hUIiwiZGlzcG9zZUVsZW1lbnQiLCJjbG91ZCIsImluQ2xvdWRzIiwiZ2V0Q2xvdWRBYnNvcnB0aW9uUmVmbGVjdGlvblNoYXBlIiwiaW5MaXN0IiwiZGVsdGFQaGkiLCJ2ZWxvY2l0eSIsImFuZ2xlIiwibWludXMiLCJhYnMiLCJuZXh0RG91YmxlIiwiZ2V0IiwiYW5nbGVUb3dhcmRzU3VuIiwicmVmbGVjdGlvbkFuZ2xlIiwiZ2V0Q2VudGVyUG9zaXRpb24iLCJzZXRWZWxvY2l0eSIsInJvdGF0ZWQiLCJ0cmFuc2xhdGVCYXNlZE9uVmVsb2NpdHkiLCJlbWlzc2lvbkFuZ2xlIiwiY2hvb3NlTmV4dEVtaXNzaW9uQW5nbGUiLCJFTkVSR1lfQ0hVTktfVkVMT0NJVFkiLCJzdGFydFBvaW50IiwiY3JlYXRlTmV4dEVsZW1lbnQiLCJhZGQiLCJwcmVsb2FkRW5lcmd5Q2h1bmtzIiwiY2xlYXJFbmVyZ3lDaHVua3MiLCJwcmVsb2FkVGltZSIsIkZSQU1FU19QRVJfU0VDT05EIiwiY2xlYXIiLCJnZXRFbmVyZ3lPdXRwdXRSYXRlIiwic2VjdG9yIiwiYWN0aXZhdGUiLCJwaGV0Iiwiam9pc3QiLCJzaW0iLCJpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IiwiU0lNX1RJTUVfUEVSX1RJQ0tfTk9STUFMIiwiZGVhY3RpdmF0ZSIsInJlc2V0IiwidG9TdGF0ZU9iamVjdCIsImFwcGx5U3RhdGUiLCJzdGF0ZU9iamVjdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3VuRW5lcmd5U291cmNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGEgdHlwZSByZXByZXNlbnRpbmcgYSBtb2RlbCBvZiB0aGUgc3VuIGFzIGFuIGVuZXJneSBzb3VyY2UgLSBpbmNsdWRlcyB0aGUgY2xvdWRzIHRoYXQgY2FuIGJsb2NrIHRoZSBzdW4ncyByYXlzXHJcbiAqXHJcbiAqIEBhdXRob3IgIEpvaG4gQmxhbmNvIChvcmlnaW5hbCBKYXZhKVxyXG4gKiBAYXV0aG9yICBBbmRyZXcgQWRhcmUgKGpzIHBvcnQpXHJcbiAqL1xyXG5cclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IFJlZmVyZW5jZUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9SZWZlcmVuY2VJTy5qcyc7XHJcbmltcG9ydCBzdW5JY29uX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvc3VuSWNvbl9wbmcuanMnO1xyXG5pbXBvcnQgRUZBQ0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRUZBQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDaHVuayBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRW5lcmd5Q2h1bmsuanMnO1xyXG5pbXBvcnQgRW5lcmd5VHlwZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRW5lcmd5VHlwZS5qcyc7XHJcbmltcG9ydCBlbmVyZ3lGb3Jtc0FuZENoYW5nZXMgZnJvbSAnLi4vLi4vZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLmpzJztcclxuaW1wb3J0IEVuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MgZnJvbSAnLi4vLi4vRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBDbG91ZCBmcm9tICcuL0Nsb3VkLmpzJztcclxuaW1wb3J0IEVuZXJneSBmcm9tICcuL0VuZXJneS5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTb3VyY2UgZnJvbSAnLi9FbmVyZ3lTb3VyY2UuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFJBRElVUyA9IDAuMDI7IC8vIEluIG1ldGVycywgYXBwYXJlbnQgc2l6ZSwgbm90IChvYnZpb3VzbHkpIGFjdHVhbCBzaXplLlxyXG5jb25zdCBPRkZTRVRfVE9fQ0VOVEVSX09GX1NVTiA9IG5ldyBWZWN0b3IyKCAtMC4wNSwgMC4xMiApO1xyXG5jb25zdCBFTkVSR1lfQ0hVTktfRU1JU1NJT05fUEVSSU9EID0gMC4xMTsgLy8gSW4gc2Vjb25kcy5cclxuY29uc3QgTUFYX0RJU1RBTkNFX09GX0VfQ0hVTktTX0ZST01fU1VOID0gMC43OyAvLyBJbiBtZXRlcnMuXHJcblxyXG4vLyBDb25zdGFudHMgdGhhdCBjb250cm9sIHRoZSBuYXR1cmUgb2YgdGhlIGVtaXNzaW9uIHNlY3RvcnMuICBUaGVzZSBhcmUgdXNlZCB0byBtYWtlIGVtaXNzaW9uIGxvb2sgcmFuZG9tIHlldCBzdGlsbFxyXG4vLyBoYXZlIGEgZmFpcmx5IHN0ZWFkeSByYXRlIHdpdGhpbiBlYWNoIHNlY3Rvci4gIE9uZSBzZWN0b3IgaXMgaW50ZW5kZWQgdG8gcG9pbnQgYXQgdGhlIHNvbGFyIHBhbmVsLlxyXG5jb25zdCBOVU1fRU1JU1NJT05fU0VDVE9SUyA9IDEwO1xyXG5jb25zdCBFTUlTU0lPTl9TRUNUT1JfU1BBTiA9IDIgKiBNYXRoLlBJIC8gTlVNX0VNSVNTSU9OX1NFQ1RPUlM7XHJcblxyXG4vLyB1c2VkIHRvIHR3ZWFrIHNlY3RvciBwb3NpdGlvbnMgdG8gbWFrZSBzdXJlIHNvbGFyIHBhbmVsIGdldHMgY29uc2lzdGVudCBmbG93IG9mIEUnc1xyXG5jb25zdCBFTUlTU0lPTl9TRUNUT1JfT0ZGU0VUID0gRU1JU1NJT05fU0VDVE9SX1NQQU4gKiAwLjcxO1xyXG5cclxuXHJcbmNsYXNzIFN1bkVuZXJneVNvdXJjZSBleHRlbmRzIEVuZXJneVNvdXJjZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7U29sYXJQYW5lbH0gc29sYXJQYW5lbFxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhblByb3BlcnR5fSBpc1BsYXlpbmdQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhblByb3BlcnR5fSBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge0VuZXJneUNodW5rR3JvdXB9IGVuZXJneUNodW5rR3JvdXBcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHNvbGFyUGFuZWwsIGlzUGxheWluZ1Byb3BlcnR5LCBlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHksIGVuZXJneUNodW5rR3JvdXAsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG5ldyBJbWFnZSggc3VuSWNvbl9wbmcgKSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ30gLSBhMTF5IG5hbWVcclxuICAgIHRoaXMuYTExeU5hbWUgPSBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmExMXkuc3VuO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1NvbGFyUGFuZWx9XHJcbiAgICB0aGlzLnNvbGFyUGFuZWwgPSBzb2xhclBhbmVsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn1cclxuICAgIHRoaXMucmFkaXVzID0gUkFESVVTO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Nsb3VkW119IC0gY2xvdWRzIHRoYXQgY2FuIHBvdGVudGlhbGx5IGJsb2NrIHRoZSBzdW4ncyByYXlzLiAgVGhlIHBvc2l0aW9ucyBhcmUgc2V0IHNvIHRoYXQgdGhleSBhcHBlYXJcclxuICAgIC8vIGJldHdlZW4gdGhlIHN1biBhbmQgdGhlIHNvbGFyIHBhbmVsLCBhbmQgbXVzdCBub3Qgb3ZlcmxhcCB3aXRoIG9uZSBhbm90aGVyLlxyXG4gICAgdGhpcy5jbG91ZHMgPSBbXHJcbiAgICAgIG5ldyBDbG91ZCggbmV3IFZlY3RvcjIoIC0wLjAxLCAwLjA4ICksIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSApLFxyXG4gICAgICBuZXcgQ2xvdWQoIG5ldyBWZWN0b3IyKCAwLjAxNywgMC4wODc1ICksIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSApLFxyXG4gICAgICBuZXcgQ2xvdWQoIG5ldyBWZWN0b3IyKCAwLjAyLCAwLjEwNSApLCB0aGlzLnBvc2l0aW9uUHJvcGVydHkgKVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJQcm9wZXJ0eX0gLSBhIGZhY3RvciBiZXR3ZWVuIHplcm8gYW5kIG9uZSB0aGF0IGluZGljYXRlcyBob3cgY2xvdWR5IGl0IGlzXHJcbiAgICB0aGlzLmNsb3VkaW5lc3NQcm9wb3J0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMSApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Nsb3VkaW5lc3NQcm9wb3J0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdwcm9wb3J0aW9uIG9mIGNsb3VkcyBibG9ja2luZyB0aGUgc3VuJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBleGlzdHMgb25seSBmb3IgcGhldC1pb1xyXG4gICAgdGhpcy5zdW5Qcm9wb3J0aW9uUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMuY2xvdWRpbmVzc1Byb3BvcnRpb25Qcm9wZXJ0eSBdLCBjbG91ZGluZXNzUHJvcG9ydGlvbiA9PiB7XHJcbiAgICAgIHJldHVybiAxIC0gY2xvdWRpbmVzc1Byb3BvcnRpb247XHJcbiAgICB9LCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDEgKSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzdW5Qcm9wb3J0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdwcm9wb3J0aW9uIG9mIHN1biByZWFjaGluZyB0aGUgc29sYXIgcGFuZWwnLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bWJlcklPXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBpbnRlcm5hbCB2YXJpYWJsZXMgdXNlZCBpbiBtZXRob2RzXHJcbiAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSA9IGVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eTtcclxuICAgIHRoaXMuaXNQbGF5aW5nUHJvcGVydHkgPSBpc1BsYXlpbmdQcm9wZXJ0eTtcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtFbWlzc2lvbkNvdW50ZG93blRpbWVyID0gRU5FUkdZX0NIVU5LX0VNSVNTSU9OX1BFUklPRDtcclxuICAgIHRoaXMuc2VjdG9yTGlzdCA9IGRvdFJhbmRvbS5zaHVmZmxlKCBfLnJhbmdlKCBOVU1fRU1JU1NJT05fU0VDVE9SUyApICk7XHJcbiAgICB0aGlzLmN1cnJlbnRTZWN0b3JJbmRleCA9IDA7XHJcbiAgICB0aGlzLnN1blBvc2l0aW9uID0gT0ZGU0VUX1RPX0NFTlRFUl9PRl9TVU47XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBsaXN0IG9mIGVuZXJneSBjaHVua3MgdGhhdCBzaG91bGQgYmUgYWxsb3dlZCB0byBwYXNzIHRocm91Z2ggdGhlIGNsb3VkcyB3aXRob3V0IGJvdW5jaW5nIChpLmUuIGJlaW5nXHJcbiAgICAvLyByZWZsZWN0ZWQpXHJcbiAgICB0aGlzLmVuZXJneUNodW5rc1Bhc3NpbmdUaHJvdWdoQ2xvdWRzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5Q2h1bmtzUGFzc2luZ1Rocm91Z2hDbG91ZHMnICksXHJcbiAgICAgIHBoZXRpb1R5cGU6IGNyZWF0ZU9ic2VydmFibGVBcnJheS5PYnNlcnZhYmxlQXJyYXlJTyggUmVmZXJlbmNlSU8oIEVuZXJneUNodW5rLkVuZXJneUNodW5rSU8gKSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cCA9IGVuZXJneUNodW5rR3JvdXA7XHJcblxyXG4gICAgLy8gc2V0IHVwIGEgbGlzdGVuZXIgdG8gYWRkL3JlbW92ZSBjbG91ZHMgYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZSBjbG91ZGluZXNzIFByb3BlcnR5XHJcbiAgICB0aGlzLmNsb3VkaW5lc3NQcm9wb3J0aW9uUHJvcGVydHkubGluayggY2xvdWRpbmVzcyA9PiB7XHJcbiAgICAgIGNvbnN0IG5DbG91ZHMgPSB0aGlzLmNsb3Vkcy5sZW5ndGg7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG5DbG91ZHM7IGkrKyApIHtcclxuXHJcbiAgICAgICAgLy8gc3RhZ2dlciB0aGUgZXhpc3RlbmNlIHN0cmVuZ3RoIG9mIHRoZSBjbG91ZHNcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IFV0aWxzLmNsYW1wKCBjbG91ZGluZXNzICogbkNsb3VkcyAtIGksIDAsIDEgKTtcclxuICAgICAgICB0aGlzLmNsb3Vkc1sgaSBdLmV4aXN0ZW5jZVN0cmVuZ3RoUHJvcGVydHkuc2V0KCB2YWx1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBwb3NpdGlvbiBvZiB0aGUgc3VuIGFzIHRoZSBwb3NpdGlvbiBvZiB0aGlzIHN5c3RlbSBjaGFuZ2VzXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICB0aGlzLnN1blBvc2l0aW9uID0gcG9zaXRpb24ucGx1cyggT0ZGU0VUX1RPX0NFTlRFUl9PRl9TVU4gKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHN0ZXAgaW4gdGltZVxyXG4gICAqIEBwYXJhbSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEByZXR1cm5zIHtFbmVyZ3l9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgbGV0IGVuZXJneVByb2R1Y2VkID0gMDtcclxuICAgIGlmICggdGhpcy5hY3RpdmVQcm9wZXJ0eS52YWx1ZSA9PT0gdHJ1ZSApIHtcclxuXHJcbiAgICAgIC8vIHNlZSBpZiBpdCBpcyB0aW1lIHRvIGVtaXQgYSBuZXcgZW5lcmd5IGNodW5rXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtFbWlzc2lvbkNvdW50ZG93blRpbWVyIC09IGR0O1xyXG4gICAgICBpZiAoIHRoaXMuZW5lcmd5Q2h1bmtFbWlzc2lvbkNvdW50ZG93blRpbWVyIDw9IDAgKSB7XHJcblxyXG4gICAgICAgIC8vIGNyZWF0ZSBhIG5ldyBjaHVuayBhbmQgc3RhcnQgaXQgb24gaXRzIHdheVxyXG4gICAgICAgIHRoaXMuZW1pdEVuZXJneUNodW5rKCk7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0VtaXNzaW9uQ291bnRkb3duVGltZXIgKz0gRU5FUkdZX0NIVU5LX0VNSVNTSU9OX1BFUklPRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbW92ZSB0aGUgZW5lcmd5IGNodW5rc1xyXG4gICAgICB0aGlzLnVwZGF0ZUVuZXJneUNodW5rUG9zaXRpb25zKCBkdCApO1xyXG5cclxuICAgICAgbGV0IGVuZXJneVByb2R1Y2VkUHJvcG9ydGlvbiA9IDEgLSB0aGlzLmNsb3VkaW5lc3NQcm9wb3J0aW9uUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICAvLyBtYXAgZW5lcmd5IHByb2R1Y2VkIHByb3BvcnRpb24gdG8gZWxpbWluYXRlIHZlcnkgbG93IHZhbHVlc1xyXG4gICAgICBlbmVyZ3lQcm9kdWNlZFByb3BvcnRpb24gPSBlbmVyZ3lQcm9kdWNlZFByb3BvcnRpb24gPT09IDAgPyAwIDogMC4xICsgKCBlbmVyZ3lQcm9kdWNlZFByb3BvcnRpb24gKiAwLjkgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZW5lcmd5UHJvZHVjZWRQcm9wb3J0aW9uID49IDAgJiYgZW5lcmd5UHJvZHVjZWRQcm9wb3J0aW9uIDw9IDEgKTtcclxuXHJcbiAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgYW1vdW50IG9mIGVuZXJneSBwcm9kdWNlZFxyXG4gICAgICBlbmVyZ3lQcm9kdWNlZCA9IEVGQUNDb25zdGFudHMuTUFYX0VORVJHWV9QUk9EVUNUSU9OX1JBVEUgKiBlbmVyZ3lQcm9kdWNlZFByb3BvcnRpb24gKiBkdDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBwcm9kdWNlIHRoZSBlbmVyZ3lcclxuICAgIHJldHVybiBuZXcgRW5lcmd5KCBFbmVyZ3lUeXBlLkxJR0hULCBlbmVyZ3lQcm9kdWNlZCwgMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVFbmVyZ3lDaHVua1Bvc2l0aW9ucyggZHQgKSB7XHJcblxyXG4gICAgLy8gY2hlY2sgZm9yIGJvdW5jaW5nIGFuZCBhYnNvcnB0aW9uIG9mIHRoZSBlbmVyZ3kgY2h1bmtzXHJcbiAgICB0aGlzLmVuZXJneUNodW5rTGlzdC5mb3JFYWNoKCBjaHVuayA9PiB7XHJcblxyXG4gICAgICBjb25zdCBkaXN0YW5jZUZyb21TdW4gPSBjaHVuay5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmRpc3RhbmNlKCB0aGlzLnN1blBvc2l0aW9uLnBsdXMoIE9GRlNFVF9UT19DRU5URVJfT0ZfU1VOICkgKTtcclxuXHJcbiAgICAgIC8vIHRoaXMgZW5lcmd5IGNodW5rIHdhcyBhYnNvcmJlZCBieSB0aGUgc29sYXIgcGFuZWwsIHNvIHB1dCBpdCBvbiB0aGUgbGlzdCBvZiBvdXRnb2luZyBjaHVua3NcclxuICAgICAgaWYgKCB0aGlzLnNvbGFyUGFuZWwuYWN0aXZlUHJvcGVydHkudmFsdWUgJiYgdGhpcy5zb2xhclBhbmVsLmdldEFic29ycHRpb25TaGFwZSgpLmNvbnRhaW5zUG9pbnQoIGNodW5rLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKSApIHtcclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rTGlzdC5yZW1vdmUoIGNodW5rICk7XHJcblxyXG4gICAgICAgIGlmICggdGhpcy5lbmVyZ3lDaHVua3NQYXNzaW5nVGhyb3VnaENsb3Vkcy5pbmNsdWRlcyggY2h1bmsgKSApIHtcclxuICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtzUGFzc2luZ1Rocm91Z2hDbG91ZHMucmVtb3ZlKCBjaHVuayApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm91dGdvaW5nRW5lcmd5Q2h1bmtzLnB1c2goIGNodW5rICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRoaXMgZW5lcmd5IGNodW5rIGlzIG91dCBvZiB2aXNpYmxlIHJhbmdlLCBzbyByZW1vdmUgaXRcclxuICAgICAgZWxzZSBpZiAoIGRpc3RhbmNlRnJvbVN1biA+IE1BWF9ESVNUQU5DRV9PRl9FX0NIVU5LU19GUk9NX1NVTiB8fFxyXG4gICAgICAgICAgICAgICAgY2h1bmsucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54IDwgLTAuMzUgfHwgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgICAgICAgICAgICAgY2h1bmsucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ID4gRUZBQ0NvbnN0YW50cy5TWVNURU1TX1NDUkVFTl9FTkVSR1lfQ0hVTktfTUFYX1RSQVZFTF9IRUlHSFRcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5lbmVyZ3lDaHVua0xpc3QucmVtb3ZlKCBjaHVuayApO1xyXG4gICAgICAgIGlmICggdGhpcy5lbmVyZ3lDaHVua3NQYXNzaW5nVGhyb3VnaENsb3Vkcy5pbmNsdWRlcyggY2h1bmsgKSApIHtcclxuICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtzUGFzc2luZ1Rocm91Z2hDbG91ZHMucmVtb3ZlKCBjaHVuayApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVuZXJneUNodW5rR3JvdXAuZGlzcG9zZUVsZW1lbnQoIGNodW5rICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGNodW5rcyBlbmNvdW50ZXJpbmcgY2xvdWRzXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuY2xvdWRzLmZvckVhY2goIGNsb3VkID0+IHtcclxuXHJcbiAgICAgICAgICBjb25zdCBpbkNsb3VkcyA9IGNsb3VkLmdldENsb3VkQWJzb3JwdGlvblJlZmxlY3Rpb25TaGFwZSgpLmNvbnRhaW5zUG9pbnQoIGNodW5rLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICAgIGNvbnN0IGluTGlzdCA9IHRoaXMuZW5lcmd5Q2h1bmtzUGFzc2luZ1Rocm91Z2hDbG91ZHMuaW5jbHVkZXMoIGNodW5rICk7XHJcbiAgICAgICAgICBjb25zdCBkZWx0YVBoaSA9IGNodW5rLnZlbG9jaXR5LmFuZ2xlIC0gY2h1bmsucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5taW51cyggdGhpcy5zdW5Qb3NpdGlvbiApLmFuZ2xlO1xyXG5cclxuICAgICAgICAgIGlmICggaW5DbG91ZHMgJiYgIWluTGlzdCAmJiBNYXRoLmFicyggZGVsdGFQaGkgKSA8IE1hdGguUEkgLyAxMCApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGRlY2lkZSB3aGV0aGVyIHRoaXMgZW5lcmd5IGNodW5rIHNob3VsZCBwYXNzIHRocm91Z2ggdGhlIGNsb3VkcyBvciBiZSByZWZsZWN0ZWRcclxuICAgICAgICAgICAgaWYgKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpIDwgY2xvdWQuZXhpc3RlbmNlU3RyZW5ndGhQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gUmVmbGVjdCB0aGUgZW5lcmd5IGNodW5rLiAgSXQgbG9va3MgYSBsaXR0bGUgd2VpcmQgaWYgdGhleSBnbyBiYWNrIHRvIHRoZSBzdW4sIHNvIHRoZSBjb2RlIGJlbG93XHJcbiAgICAgICAgICAgICAgLy8gdHJpZXMgdG8gYXZvaWQgdGhhdC5cclxuICAgICAgICAgICAgICBjb25zdCBhbmdsZVRvd2FyZHNTdW4gPSBjaHVuay52ZWxvY2l0eS5hbmdsZSArIE1hdGguUEk7XHJcbiAgICAgICAgICAgICAgY29uc3QgcmVmbGVjdGlvbkFuZ2xlID0gY2h1bmsucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5taW51cyggY2xvdWQuZ2V0Q2VudGVyUG9zaXRpb24oKSApLmFuZ2xlO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoIHJlZmxlY3Rpb25BbmdsZSA8IGFuZ2xlVG93YXJkc1N1biApIHtcclxuICAgICAgICAgICAgICAgIGNodW5rLnNldFZlbG9jaXR5KCBjaHVuay52ZWxvY2l0eS5yb3RhdGVkKFxyXG4gICAgICAgICAgICAgICAgICAwLjcgKiBNYXRoLlBJICsgZG90UmFuZG9tLm5leHREb3VibGUoKSAqIE1hdGguUEkgLyA4IClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY2h1bmsuc2V0VmVsb2NpdHkoXHJcbiAgICAgICAgICAgICAgICAgIGNodW5rLnZlbG9jaXR5LnJvdGF0ZWQoIC0wLjcgKiBNYXRoLlBJIC0gZG90UmFuZG9tLm5leHREb3VibGUoKSAqIE1hdGguUEkgLyA4IClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gbGV0IHRoZSBlbmVyZ3kgY2h1bmsgcGFzcyB0aHJvdWdoIHRoZSBjbG91ZFxyXG4gICAgICAgICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtzUGFzc2luZ1Rocm91Z2hDbG91ZHMucHVzaCggY2h1bmsgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG1vdmUgdGhlIGVuZXJneSBjaHVua3NcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtMaXN0LmZvckVhY2goIGNodW5rID0+IHtcclxuICAgICAgY2h1bmsudHJhbnNsYXRlQmFzZWRPblZlbG9jaXR5KCBkdCApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBlbWl0RW5lcmd5Q2h1bmsoKSB7XHJcbiAgICBjb25zdCBlbWlzc2lvbkFuZ2xlID0gdGhpcy5jaG9vc2VOZXh0RW1pc3Npb25BbmdsZSgpO1xyXG4gICAgY29uc3QgdmVsb2NpdHkgPSBuZXcgVmVjdG9yMiggRUZBQ0NvbnN0YW50cy5FTkVSR1lfQ0hVTktfVkVMT0NJVFksIDAgKS5yb3RhdGVkKCBlbWlzc2lvbkFuZ2xlICk7XHJcbiAgICBjb25zdCBzdGFydFBvaW50ID0gdGhpcy5zdW5Qb3NpdGlvbi5wbHVzKCBuZXcgVmVjdG9yMiggUkFESVVTIC8gMiwgMCApLnJvdGF0ZWQoIGVtaXNzaW9uQW5nbGUgKSApO1xyXG4gICAgY29uc3QgY2h1bmsgPSB0aGlzLmVuZXJneUNodW5rR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIEVuZXJneVR5cGUuTElHSFQsIHN0YXJ0UG9pbnQsIHZlbG9jaXR5LCB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSApO1xyXG5cclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtMaXN0LmFkZCggY2h1bmsgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBwcmVsb2FkRW5lcmd5Q2h1bmtzKCkge1xyXG4gICAgdGhpcy5jbGVhckVuZXJneUNodW5rcygpO1xyXG4gICAgbGV0IHByZWxvYWRUaW1lID0gNjsgLy8gaW4gc2ltdWxhdGVkIHNlY29uZHMsIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgIGNvbnN0IGR0ID0gMSAvIEVGQUNDb25zdGFudHMuRlJBTUVTX1BFUl9TRUNPTkQ7XHJcbiAgICB0aGlzLmVuZXJneUNodW5rRW1pc3Npb25Db3VudGRvd25UaW1lciA9IDA7XHJcblxyXG4gICAgLy8gc2ltdWxhdGUgZW5lcmd5IGNodW5rcyBtb3ZpbmcgdGhyb3VnaCB0aGUgc3lzdGVtXHJcbiAgICB3aGlsZSAoIHByZWxvYWRUaW1lID4gMCApIHtcclxuICAgICAgdGhpcy5lbmVyZ3lDaHVua0VtaXNzaW9uQ291bnRkb3duVGltZXIgLT0gZHQ7XHJcbiAgICAgIGlmICggdGhpcy5lbmVyZ3lDaHVua0VtaXNzaW9uQ291bnRkb3duVGltZXIgPD0gMCApIHtcclxuICAgICAgICB0aGlzLmVtaXRFbmVyZ3lDaHVuaygpO1xyXG4gICAgICAgIHRoaXMuZW5lcmd5Q2h1bmtFbWlzc2lvbkNvdW50ZG93blRpbWVyICs9IEVORVJHWV9DSFVOS19FTUlTU0lPTl9QRVJJT0Q7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy51cGRhdGVFbmVyZ3lDaHVua1Bvc2l0aW9ucyggZHQgKTtcclxuICAgICAgcHJlbG9hZFRpbWUgLT0gZHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVtb3ZlIGFueSBjaHVua3MgdGhhdCBhY3R1YWxseSBtYWRlIGl0IHRvIHRoZSBzb2xhciBwYW5lbFxyXG4gICAgdGhpcy5vdXRnb2luZ0VuZXJneUNodW5rcy5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogcmV0dXJuIGEgc3RydWN0dXJlIGNvbnRhaW5pbmcgdHlwZSwgcmF0ZSwgYW5kIGRpcmVjdGlvbiBvZiBlbWl0dGVkIGVuZXJneVxyXG4gICAqIEByZXR1cm5zIHtFbmVyZ3l9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldEVuZXJneU91dHB1dFJhdGUoKSB7XHJcbiAgICByZXR1cm4gbmV3IEVuZXJneShcclxuICAgICAgRW5lcmd5VHlwZS5MSUdIVCxcclxuICAgICAgRUZBQ0NvbnN0YW50cy5NQVhfRU5FUkdZX1BST0RVQ1RJT05fUkFURSAqICggMSAtIHRoaXMuY2xvdWRpbmVzc1Byb3BvcnRpb25Qcm9wZXJ0eS52YWx1ZSApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge251bWJlcn0gZW1pc3Npb24gYW5nbGVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGNob29zZU5leHRFbWlzc2lvbkFuZ2xlKCkge1xyXG4gICAgY29uc3Qgc2VjdG9yID0gdGhpcy5zZWN0b3JMaXN0WyB0aGlzLmN1cnJlbnRTZWN0b3JJbmRleCBdO1xyXG4gICAgdGhpcy5jdXJyZW50U2VjdG9ySW5kZXgrKztcclxuXHJcbiAgICBpZiAoIHRoaXMuY3VycmVudFNlY3RvckluZGV4ID49IE5VTV9FTUlTU0lPTl9TRUNUT1JTICkge1xyXG4gICAgICB0aGlzLmN1cnJlbnRTZWN0b3JJbmRleCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYW5nbGUgaXMgYSBmdW5jdGlvbiBvZiB0aGUgc2VsZWN0ZWQgc2VjdG9yIGFuZCBhIHJhbmRvbSBvZmZzZXQgd2l0aGluIHRoZSBzZWN0b3JcclxuICAgIHJldHVybiBzZWN0b3IgKiBFTUlTU0lPTl9TRUNUT1JfU1BBTiArXHJcbiAgICAgICAgICAgKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogRU1JU1NJT05fU0VDVE9SX1NQQU4gKSArXHJcbiAgICAgICAgICAgRU1JU1NJT05fU0VDVE9SX09GRlNFVDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByZS1wb3B1bGF0ZSB0aGUgc3BhY2UgYXJvdW5kIHRoZSBzdW4gd2l0aCBlbmVyZ3kgY2h1bmtzLiBUaGUgbnVtYmVyIG9mIGl0ZXJhdGlvbnMgaXMgY2hvc2VuIGNhcmVmdWxseSBzdWNoIHRoYXRcclxuICAgKiB0aGVyZSBhcmUgY2h1bmtzIHRoYXQgYXJlIGNsb3NlLCBidXQgbm90IHF1aXRlIHJlYWNoaW5nLCB0aGUgc29sYXIgcGFuZWwuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGFjdGl2YXRlKCkge1xyXG4gICAgc3VwZXIuYWN0aXZhdGUoKTtcclxuXHJcbiAgICAvLyBEb24ndCBtb3ZlIHRoZSBFbmVyZ3lDaHVua3MgZnJvbSB0aGVpciBwb3NpdGlvbiBpZiBzZXR0aW5nIHN0YXRlLlxyXG4gICAgLy8gRG9uJ3Qgc3RlcCBpZiBub3QgcGxheWluZywgdGhpcyBtYWtlcyBzdXJlIHRoYXQgUGhFVC1pTyBzdGF0ZSBtYWludGFpbnMgZXhhY3QgRW5lcmd5Q2h1bmsgcG9zaXRpb25zLlxyXG4gICAgaWYgKCAhcGhldC5qb2lzdC5zaW0uaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS52YWx1ZSAmJiB0aGlzLmlzUGxheWluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgLy8gc3RlcCBhIGZldyB0aW1lcyB0byBnZXQgc29tZSBlbmVyZ3kgY2h1bmtzIG91dFxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCAxMDA7IGkrKyApIHtcclxuICAgICAgICB0aGlzLnN0ZXAoIEVGQUNDb25zdGFudHMuU0lNX1RJTUVfUEVSX1RJQ0tfTk9STUFMICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGRlYWN0aXZhdGUgdGhlIHN1blxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkZWFjdGl2YXRlKCkge1xyXG4gICAgc3VwZXIuZGVhY3RpdmF0ZSgpO1xyXG4gICAgdGhpcy5jbG91ZGluZXNzUHJvcG9ydGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgY2xlYXJFbmVyZ3lDaHVua3MoKSB7XHJcbiAgICBzdXBlci5jbGVhckVuZXJneUNodW5rcygpO1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua3NQYXNzaW5nVGhyb3VnaENsb3Vkcy5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpYyAoRW5lcmd5U3lzdGVtRWxlbWVudElPKVxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAgICovXHJcbiAgdG9TdGF0ZU9iamVjdCgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHNlY3Rvckxpc3Q6IHRoaXMuc2VjdG9yTGlzdCxcclxuICAgICAgY3VycmVudFNlY3RvckluZGV4OiB0aGlzLmN1cnJlbnRTZWN0b3JJbmRleCxcclxuICAgICAgcmFkaXVzOiB0aGlzLnJhZGl1cyxcclxuICAgICAgc3VuUG9zaXRpb246IHRoaXMuc3VuUG9zaXRpb24sXHJcbiAgICAgIGVuZXJneUNodW5rRW1pc3Npb25Db3VudGRvd25UaW1lcjogdGhpcy5lbmVyZ3lDaHVua0VtaXNzaW9uQ291bnRkb3duVGltZXJcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljIChFbmVyZ3lTeXN0ZW1FbGVtZW50SU8pXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlT2JqZWN0IC0gc2VlIHRoaXMudG9TdGF0ZU9iamVjdCgpXHJcbiAgICovXHJcbiAgYXBwbHlTdGF0ZSggc3RhdGVPYmplY3QgKSB7XHJcbiAgICB0aGlzLnNlY3Rvckxpc3QgPSBzdGF0ZU9iamVjdC5zZWN0b3JMaXN0O1xyXG4gICAgdGhpcy5jdXJyZW50U2VjdG9ySW5kZXggPSBzdGF0ZU9iamVjdC5jdXJyZW50U2VjdG9ySW5kZXg7XHJcbiAgICB0aGlzLnJhZGl1cyA9IHN0YXRlT2JqZWN0LnJhZGl1cztcclxuICAgIHRoaXMuc3VuUG9zaXRpb24gPSBzdGF0ZU9iamVjdC5zdW5Qb3NpdGlvbjtcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtFbWlzc2lvbkNvdW50ZG93blRpbWVyID0gc3RhdGVPYmplY3QuZW5lcmd5Q2h1bmtFbWlzc2lvbkNvdW50ZG93blRpbWVyO1xyXG4gIH1cclxufVxyXG5cclxuLy8gc3RhdGljc1xyXG5TdW5FbmVyZ3lTb3VyY2UuT0ZGU0VUX1RPX0NFTlRFUl9PRl9TVU4gPSBPRkZTRVRfVE9fQ0VOVEVSX09GX1NVTjtcclxuXHJcbmVuZXJneUZvcm1zQW5kQ2hhbmdlcy5yZWdpc3RlciggJ1N1bkVuZXJneVNvdXJjZScsIFN1bkVuZXJneVNvdXJjZSApO1xyXG5leHBvcnQgZGVmYXVsdCBTdW5FbmVyZ3lTb3VyY2U7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sOENBQThDO0FBQ2hGLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0MsS0FBSyxRQUFRLG1DQUFtQztBQUN6RCxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxX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