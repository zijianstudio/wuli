// Copyright 2019-2023, University of Colorado Boulder

/**
 * The core model for the Density and Buoyancy sim screens, including a pool and masses.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import Gravity from './Gravity.js';
import Material from './Material.js';
import P2Engine from './P2Engine.js';
import Pool from './Pool.js';
import Scale from './Scale.js';
import optionize from '../../../../phet-core/js/optionize.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
// constants
const BLOCK_SPACING = 0.01;
const POOL_VOLUME = 0.15;
const POOL_WIDTH = 0.9;
const POOL_DEPTH = 0.4;
const POOL_HEIGHT = POOL_VOLUME / POOL_WIDTH / POOL_DEPTH;
const GROUND_FRONT_Z = POOL_DEPTH / 2;
const POOL_BACK_Z = -POOL_DEPTH / 2;
export default class DensityBuoyancyModel {
  // We'll keep blocks within these bounds, to generally stay in-screen. This may be
  // adjusted by the screen based on the visibleBoundsProperty. These are sensible defaults, with the minX and minY
  // somewhat meant to be adjusted.
  // We need to hook into a boat (if it exists) for displaying the water.
  constructor(providedOptions) {
    const options = optionize()({
      showMassesDefault: false,
      canShowForces: true,
      initialForceScale: 1 / 16
    }, providedOptions);
    const tandem = options.tandem;
    this.showGravityForceProperty = new BooleanProperty(false, {
      tandem: options.canShowForces ? tandem.createTandem('showGravityForceProperty') : Tandem.OPT_OUT
    });
    this.showBuoyancyForceProperty = new BooleanProperty(false, {
      tandem: options.canShowForces ? tandem.createTandem('showBuoyancyForceProperty') : Tandem.OPT_OUT
    });
    this.showContactForceProperty = new BooleanProperty(false, {
      tandem: options.canShowForces ? tandem.createTandem('showContactForceProperty') : Tandem.OPT_OUT
    });
    this.showForceValuesProperty = new BooleanProperty(false, {
      tandem: options.canShowForces ? tandem.createTandem('showForceValuesProperty') : Tandem.OPT_OUT
    });
    this.showMassesProperty = new BooleanProperty(options.showMassesDefault, {
      tandem: tandem.createTandem('showMassesProperty'),
      phetioDocumentation: 'Displays a mass readout on each object'
    });
    this.forceScaleProperty = new NumberProperty(options.initialForceScale, {
      tandem: options.canShowForces ? tandem.createTandem('vectorScaleProperty') : Tandem.OPT_OUT,
      range: new Range(Math.pow(0.5, 9), 1)
    });
    this.gravityProperty = new Property(Gravity.EARTH, {
      valueType: Gravity,
      phetioValueType: Gravity.GravityIO,
      tandem: tandem.createTandem('gravityProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'The acceleration due to gravity applied to all masses, (may be potentially custom or hidden from view)'
    });
    this.liquidMaterialProperty = new Property(Material.WATER, {
      valueType: Material,
      phetioValueType: Material.MaterialIO,
      tandem: tandem.createTandem('liquidMaterialProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'The material of the liquid in the pool'
    });

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.liquidDensityProperty = new DerivedProperty([this.liquidMaterialProperty], liquidMaterial => liquidMaterial.density, {
      tandem: tandem.createTandem('liquidDensityProperty'),
      phetioValueType: NumberIO,
      units: 'kg/m^3'
    });

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.liquidViscosityProperty = new DerivedProperty([this.liquidMaterialProperty], liquidMaterial => liquidMaterial.viscosity, {
      tandem: tandem.createTandem('liquidViscosityProperty'),
      phetioValueType: NumberIO,
      units: 'Pa\u00b7s'
    });
    this.poolBounds = new Bounds3(-POOL_WIDTH / 2, -POOL_HEIGHT, POOL_BACK_Z, POOL_WIDTH / 2, 0, GROUND_FRONT_Z);
    this.groundBounds = new Bounds3(-10, -10, -2, 10, 0, GROUND_FRONT_Z);
    this.invisibleBarrierBoundsProperty = new Property(new Bounds3(-0.875, -4, POOL_BACK_Z, 0.875, 4, GROUND_FRONT_Z), {
      valueComparisonStrategy: 'equalsFunction'
    });

    // How many units the barrier extends out to
    const barrierSize = 5;

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const barrierPointsProperty = new DerivedProperty([this.invisibleBarrierBoundsProperty], bounds => {
      return [new Vector2(bounds.maxX, bounds.minY), new Vector2(bounds.maxX + barrierSize, bounds.minY), new Vector2(bounds.maxX + barrierSize, bounds.maxY + barrierSize), new Vector2(bounds.minX - barrierSize, bounds.maxY + barrierSize), new Vector2(bounds.minX - barrierSize, bounds.minY), new Vector2(bounds.minX, bounds.minY), new Vector2(bounds.minX, bounds.maxY), new Vector2(bounds.maxX, bounds.maxY)];
    });
    if (DensityBuoyancyCommonQueryParameters.poolWidthMultiplier !== 1) {
      const halfX = DensityBuoyancyCommonQueryParameters.poolWidthMultiplier * 0.45;
      const halfZ = POOL_VOLUME / (2 * halfX * POOL_HEIGHT * 2);
      this.poolBounds = new Bounds3(-halfX, -POOL_HEIGHT, -halfZ, halfX, 0, halfZ);
      this.groundBounds = new Bounds3(-10, -10, -2, 10, 0, halfZ);
    }
    this.groundPoints = [new Vector2(this.groundBounds.minX, this.groundBounds.minY), new Vector2(this.groundBounds.maxX, this.groundBounds.minY), new Vector2(this.groundBounds.maxX, this.groundBounds.maxY), new Vector2(this.poolBounds.maxX, this.poolBounds.maxY), new Vector2(this.poolBounds.maxX, this.poolBounds.minY), new Vector2(this.poolBounds.minX, this.poolBounds.minY), new Vector2(this.poolBounds.minX, this.poolBounds.maxY), new Vector2(this.groundBounds.minX, this.groundBounds.maxY)];
    this.pool = new Pool(this.poolBounds, {
      tandem: tandem.createTandem('pool')
    });
    this.boat = null;
    this.engine = new P2Engine();
    this.groundBody = this.engine.createGround(this.groundPoints);
    this.engine.addBody(this.groundBody);
    this.barrierBody = this.engine.createBarrier(barrierPointsProperty.value);
    this.engine.addBody(this.barrierBody);

    // Update the barrier shape as needed (full recreation for now)
    barrierPointsProperty.lazyLink(points => {
      this.engine.removeBody(this.barrierBody);
      this.barrierBody = this.engine.createBarrier(points);
      this.engine.addBody(this.barrierBody);
    });
    this.availableMasses = createObservableArray();

    // Control masses by visibility, so that this.masses will be the subset of this.availableMasses that is visible
    const visibilityListenerMap = new Map(); // eslint-disable-line no-spaced-func
    this.availableMasses.addItemAddedListener(mass => {
      const visibilityListener = visible => {
        if (visible) {
          this.masses.push(mass);
        } else {
          this.masses.remove(mass);
        }
      };
      visibilityListenerMap.set(mass, visibilityListener);
      mass.visibleProperty.lazyLink(visibilityListener);
      if (mass.visibleProperty.value) {
        this.masses.push(mass);
      }
    });
    this.availableMasses.addItemRemovedListener(mass => {
      mass.visibleProperty.unlink(visibilityListenerMap.get(mass));
      visibilityListenerMap.delete(mass);
      if (mass.visibleProperty.value) {
        this.masses.remove(mass);
      }
    });
    this.masses = createObservableArray();
    this.masses.addItemAddedListener(mass => {
      this.engine.addBody(mass.body);
    });
    this.masses.addItemRemovedListener(mass => {
      this.engine.removeBody(mass.body);
      mass.interruptedEmitter.emit();
    });
    let boatVerticalVelocity = 0;
    let boatVerticalAcceleration = 0;

    // The main engine post-step actions, that will determine the net forces applied on each mass.
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.engine.addPostStepListener(dt => {
      this.updateLiquid();

      // {number}
      const gravity = this.gravityProperty.value.value;
      const boat = this.getBoat();
      if (boat && dt) {
        const nextBoatVerticalVelocity = this.engine.bodyGetVelocity(boat.body).y;
        boatVerticalAcceleration = (nextBoatVerticalVelocity - boatVerticalVelocity) / dt;
        boatVerticalVelocity = nextBoatVerticalVelocity;
      }

      // Will set the force Properties for all of the masses
      this.masses.forEach(mass => {
        let contactForce = this.engine.bodyGetContactForces(mass.body);

        // p2.js will report bad forces for static scales, so we need to zero these out
        if (!contactForce.isFinite()) {
          contactForce = Vector2.ZERO;
        }
        this.engine.resetContactForces(mass.body);
        mass.contactForceInterpolatedProperty.setNextValue(contactForce);
        if (mass instanceof Scale) {
          let scaleForce = 0;
          this.masses.forEach(otherMass => {
            if (mass !== otherMass) {
              const verticalForce = this.engine.bodyGetContactForceBetween(mass.body, otherMass.body).y;
              if (verticalForce > 0) {
                scaleForce += verticalForce;
              }
            }
          });
          mass.scaleForceInterpolatedProperty.setNextValue(scaleForce);
        }
        const velocity = this.engine.bodyGetVelocity(mass.body);

        // Limit velocity, so things converge faster.
        if (velocity.magnitude > 5) {
          velocity.setMagnitude(5);
          this.engine.bodySetVelocity(mass.body, velocity);
        }
        const basin = mass.containingBasin;
        const submergedVolume = basin ? mass.getDisplacedVolume(basin.liquidYInterpolatedProperty.currentValue) : 0;
        if (submergedVolume) {
          const displacedMass = submergedVolume * this.liquidDensityProperty.value;
          // Vertical acceleration of the boat will change the buoyant force.
          const acceleration = gravity + (boat && basin === boat.basin ? boatVerticalAcceleration : 0);
          const buoyantForce = new Vector2(0, displacedMass * acceleration);
          this.engine.bodyApplyForce(mass.body, buoyantForce);
          mass.buoyancyForceInterpolatedProperty.setNextValue(buoyantForce);

          // If the boat is moving, assume the liquid moves with it, and apply viscosity due to the movement of our mass
          // inside the boat's liquid.
          if (boat && basin === boat.basin) {
            velocity.subtract(this.engine.bodyGetVelocity(boat.body));
          }

          // Increase the generally-visible viscosity effect
          const ratioSubmerged = 1 - DensityBuoyancyCommonQueryParameters.viscositySubmergedRatio + DensityBuoyancyCommonQueryParameters.viscositySubmergedRatio * submergedVolume / mass.volumeProperty.value;
          const hackedViscosity = this.liquidViscosityProperty.value ? 0.03 * Math.pow(this.liquidViscosityProperty.value / 0.03, 0.8) : 0;
          const viscosityMass = Math.max(DensityBuoyancyCommonQueryParameters.viscosityMassCutoff, mass.massProperty.value);
          const viscousForce = velocity.times(-hackedViscosity * viscosityMass * ratioSubmerged * 3000 * DensityBuoyancyCommonQueryParameters.viscosityMultiplier);
          this.engine.bodyApplyForce(mass.body, viscousForce);
        } else {
          mass.buoyancyForceInterpolatedProperty.setNextValue(Vector2.ZERO);
        }

        // Gravity
        const gravityForce = new Vector2(0, -mass.massProperty.value * gravity);
        this.engine.bodyApplyForce(mass.body, gravityForce);
        mass.gravityForceInterpolatedProperty.setNextValue(gravityForce);
      });
    });
  }

  /**
   * Returns the boat (if there is one)
   */
  getBoat() {
    return this.boat;
  }

  /**
   * Computes the heights of the main pool liquid (and optionally that of the boat)
   */
  updateLiquid() {
    const boat = this.getBoat();
    const basins = [this.pool];
    if (boat && boat.visibleProperty.value) {
      basins.push(boat.basin);
      this.pool.childBasin = boat.basin;
    } else {
      this.pool.childBasin = null;
    }
    this.masses.forEach(mass => mass.updateStepInformation());
    basins.forEach(basin => {
      basin.stepMasses = this.masses.filter(mass => basin.isMassInside(mass));
    });
    let poolLiquidVolume = this.pool.liquidVolumeProperty.value;

    // May need to adjust volumes between the boat/pool if there is a boat
    if (boat) {
      if (boat.visibleProperty.value) {
        let boatLiquidVolume = boat.basin.liquidVolumeProperty.value;
        const poolEmptyVolumeToBoatTop = this.pool.getEmptyVolume(Math.min(boat.stepTop, this.poolBounds.maxY));
        const boatEmptyVolumeToBoatTop = boat.basin.getEmptyVolume(boat.stepTop);
        const poolExcess = poolLiquidVolume - poolEmptyVolumeToBoatTop;
        const boatExcess = boatLiquidVolume - boatEmptyVolumeToBoatTop;
        if (poolExcess > 0 && boatExcess < 0) {
          const transferVolume = Math.min(poolExcess, -boatExcess);
          poolLiquidVolume -= transferVolume;
          boatLiquidVolume += transferVolume;
        } else if (boatExcess > 0) {
          // If the boat overflows, just dump the rest in the pool
          poolLiquidVolume += boatExcess;
          boatLiquidVolume -= boatExcess;
        }
        boat.basin.liquidVolumeProperty.value = boatLiquidVolume;
      } else {
        boat.basin.liquidVolumeProperty.value = 0;
      }
    }

    // Check to see if water "spilled" out of the pool, and set the finalized liquid volume
    this.pool.liquidVolumeProperty.value = Math.min(poolLiquidVolume, this.pool.getEmptyVolume(this.poolBounds.maxY));
    this.pool.computeY();
    if (boat) {
      boat.basin.computeY();
    }

    // If we have a boat that is NOT underwater, we'll assign masses into the boat's basin where relevant. Otherwise
    // anything will go just into the pool's basin.
    if (boat && this.pool.liquidYInterpolatedProperty.currentValue < boat.basin.stepTop + 1e-7) {
      this.masses.forEach(mass => {
        mass.containingBasin = boat.basin.isMassInside(mass) ? boat.basin : this.pool.isMassInside(mass) ? this.pool : null;
      });
    } else {
      this.masses.forEach(mass => {
        mass.containingBasin = this.pool.isMassInside(mass) ? this.pool : null;
      });
    }
  }

  /**
   * Resets things to their original values.
   */
  reset() {
    this.showGravityForceProperty.reset();
    this.showBuoyancyForceProperty.reset();
    this.showContactForceProperty.reset();
    this.showMassesProperty.reset();
    this.showForceValuesProperty.reset();
    this.gravityProperty.reset();
    this.liquidMaterialProperty.reset();
    this.pool.reset();
    this.masses.forEach(mass => mass.reset());
  }

  /**
   * Steps forward in time.
   */
  step(dt) {
    this.engine.step(dt);
    this.masses.forEach(mass => {
      mass.step(dt, this.engine.interpolationRatio);
    });
    this.pool.liquidYInterpolatedProperty.setRatio(this.engine.interpolationRatio);
  }

  /**
   * Moves masses' previous positions to their current positions.
   */
  uninterpolateMasses() {
    this.masses.forEach(mass => this.engine.bodySynchronizePrevious(mass.body));
  }

  /**
   * Positions masses from the left of the pool outward, with padding
   */
  positionMassesLeft(masses) {
    let position = this.poolBounds.minX;
    masses.forEach(mass => {
      mass.matrix.setToTranslation(position - BLOCK_SPACING - mass.sizeProperty.value.width / 2, -mass.sizeProperty.value.minY);
      position -= BLOCK_SPACING + mass.sizeProperty.value.width;
      mass.writeData();
      mass.transformedEmitter.emit();
    });
  }

  /**
   * Positions masses from the right of the pool outward, with padding
   */
  positionMassesRight(masses) {
    let position = this.poolBounds.maxX;
    masses.forEach(mass => {
      mass.matrix.setToTranslation(position + BLOCK_SPACING + mass.sizeProperty.value.width / 2, -mass.sizeProperty.value.minY);
      position += BLOCK_SPACING + mass.sizeProperty.value.width;
      mass.writeData();
      mass.transformedEmitter.emit();
    });
  }

  /**
   * Positions masses from the left of the pool up
   */
  positionStackLeft(masses) {
    const x = this.poolBounds.minX - BLOCK_SPACING - Math.max(...masses.map(mass => mass.sizeProperty.value.width)) / 2;
    this.positionStack(masses, x);
  }

  /**
   * Positions masses from the right of the pool up
   */
  positionStackRight(masses) {
    const x = this.poolBounds.maxX + BLOCK_SPACING + Math.max(...masses.map(mass => mass.sizeProperty.value.width)) / 2;
    this.positionStack(masses, x);
  }

  /**
   * Position a stack of masses at a given center x.
   */
  positionStack(masses, x) {
    let position = 0;
    masses = _.sortBy(masses, mass => -mass.volumeProperty.value);
    masses.forEach(mass => {
      mass.matrix.setToTranslation(x, position + mass.sizeProperty.value.height / 2);
      position += mass.sizeProperty.value.height;
      mass.writeData();
      this.engine.bodySynchronizePrevious(mass.body);
      mass.transformedEmitter.emit();
    });
  }
}
densityBuoyancyCommon.register('DensityBuoyancyModel', DensityBuoyancyModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsImNyZWF0ZU9ic2VydmFibGVBcnJheSIsIkJvdW5kczMiLCJSYW5nZSIsIlZlY3RvcjIiLCJUYW5kZW0iLCJOdW1iZXJJTyIsImRlbnNpdHlCdW95YW5jeUNvbW1vbiIsIkRlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycyIsIkdyYXZpdHkiLCJNYXRlcmlhbCIsIlAyRW5naW5lIiwiUG9vbCIsIlNjYWxlIiwib3B0aW9uaXplIiwiTnVtYmVyUHJvcGVydHkiLCJCTE9DS19TUEFDSU5HIiwiUE9PTF9WT0xVTUUiLCJQT09MX1dJRFRIIiwiUE9PTF9ERVBUSCIsIlBPT0xfSEVJR0hUIiwiR1JPVU5EX0ZST05UX1oiLCJQT09MX0JBQ0tfWiIsIkRlbnNpdHlCdW95YW5jeU1vZGVsIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwic2hvd01hc3Nlc0RlZmF1bHQiLCJjYW5TaG93Rm9yY2VzIiwiaW5pdGlhbEZvcmNlU2NhbGUiLCJ0YW5kZW0iLCJzaG93R3Jhdml0eUZvcmNlUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJPUFRfT1VUIiwic2hvd0J1b3lhbmN5Rm9yY2VQcm9wZXJ0eSIsInNob3dDb250YWN0Rm9yY2VQcm9wZXJ0eSIsInNob3dGb3JjZVZhbHVlc1Byb3BlcnR5Iiwic2hvd01hc3Nlc1Byb3BlcnR5IiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImZvcmNlU2NhbGVQcm9wZXJ0eSIsInJhbmdlIiwiTWF0aCIsInBvdyIsImdyYXZpdHlQcm9wZXJ0eSIsIkVBUlRIIiwidmFsdWVUeXBlIiwicGhldGlvVmFsdWVUeXBlIiwiR3Jhdml0eUlPIiwicGhldGlvUmVhZE9ubHkiLCJsaXF1aWRNYXRlcmlhbFByb3BlcnR5IiwiV0FURVIiLCJNYXRlcmlhbElPIiwibGlxdWlkRGVuc2l0eVByb3BlcnR5IiwibGlxdWlkTWF0ZXJpYWwiLCJkZW5zaXR5IiwidW5pdHMiLCJsaXF1aWRWaXNjb3NpdHlQcm9wZXJ0eSIsInZpc2Nvc2l0eSIsInBvb2xCb3VuZHMiLCJncm91bmRCb3VuZHMiLCJpbnZpc2libGVCYXJyaWVyQm91bmRzUHJvcGVydHkiLCJ2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSIsImJhcnJpZXJTaXplIiwiYmFycmllclBvaW50c1Byb3BlcnR5IiwiYm91bmRzIiwibWF4WCIsIm1pblkiLCJtYXhZIiwibWluWCIsInBvb2xXaWR0aE11bHRpcGxpZXIiLCJoYWxmWCIsImhhbGZaIiwiZ3JvdW5kUG9pbnRzIiwicG9vbCIsImJvYXQiLCJlbmdpbmUiLCJncm91bmRCb2R5IiwiY3JlYXRlR3JvdW5kIiwiYWRkQm9keSIsImJhcnJpZXJCb2R5IiwiY3JlYXRlQmFycmllciIsInZhbHVlIiwibGF6eUxpbmsiLCJwb2ludHMiLCJyZW1vdmVCb2R5IiwiYXZhaWxhYmxlTWFzc2VzIiwidmlzaWJpbGl0eUxpc3RlbmVyTWFwIiwiTWFwIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJtYXNzIiwidmlzaWJpbGl0eUxpc3RlbmVyIiwidmlzaWJsZSIsIm1hc3NlcyIsInB1c2giLCJyZW1vdmUiLCJzZXQiLCJ2aXNpYmxlUHJvcGVydHkiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwidW5saW5rIiwiZ2V0IiwiZGVsZXRlIiwiYm9keSIsImludGVycnVwdGVkRW1pdHRlciIsImVtaXQiLCJib2F0VmVydGljYWxWZWxvY2l0eSIsImJvYXRWZXJ0aWNhbEFjY2VsZXJhdGlvbiIsImFkZFBvc3RTdGVwTGlzdGVuZXIiLCJkdCIsInVwZGF0ZUxpcXVpZCIsImdyYXZpdHkiLCJnZXRCb2F0IiwibmV4dEJvYXRWZXJ0aWNhbFZlbG9jaXR5IiwiYm9keUdldFZlbG9jaXR5IiwieSIsImZvckVhY2giLCJjb250YWN0Rm9yY2UiLCJib2R5R2V0Q29udGFjdEZvcmNlcyIsImlzRmluaXRlIiwiWkVSTyIsInJlc2V0Q29udGFjdEZvcmNlcyIsImNvbnRhY3RGb3JjZUludGVycG9sYXRlZFByb3BlcnR5Iiwic2V0TmV4dFZhbHVlIiwic2NhbGVGb3JjZSIsIm90aGVyTWFzcyIsInZlcnRpY2FsRm9yY2UiLCJib2R5R2V0Q29udGFjdEZvcmNlQmV0d2VlbiIsInNjYWxlRm9yY2VJbnRlcnBvbGF0ZWRQcm9wZXJ0eSIsInZlbG9jaXR5IiwibWFnbml0dWRlIiwic2V0TWFnbml0dWRlIiwiYm9keVNldFZlbG9jaXR5IiwiYmFzaW4iLCJjb250YWluaW5nQmFzaW4iLCJzdWJtZXJnZWRWb2x1bWUiLCJnZXREaXNwbGFjZWRWb2x1bWUiLCJsaXF1aWRZSW50ZXJwb2xhdGVkUHJvcGVydHkiLCJjdXJyZW50VmFsdWUiLCJkaXNwbGFjZWRNYXNzIiwiYWNjZWxlcmF0aW9uIiwiYnVveWFudEZvcmNlIiwiYm9keUFwcGx5Rm9yY2UiLCJidW95YW5jeUZvcmNlSW50ZXJwb2xhdGVkUHJvcGVydHkiLCJzdWJ0cmFjdCIsInJhdGlvU3VibWVyZ2VkIiwidmlzY29zaXR5U3VibWVyZ2VkUmF0aW8iLCJ2b2x1bWVQcm9wZXJ0eSIsImhhY2tlZFZpc2Nvc2l0eSIsInZpc2Nvc2l0eU1hc3MiLCJtYXgiLCJ2aXNjb3NpdHlNYXNzQ3V0b2ZmIiwibWFzc1Byb3BlcnR5IiwidmlzY291c0ZvcmNlIiwidGltZXMiLCJ2aXNjb3NpdHlNdWx0aXBsaWVyIiwiZ3Jhdml0eUZvcmNlIiwiZ3Jhdml0eUZvcmNlSW50ZXJwb2xhdGVkUHJvcGVydHkiLCJiYXNpbnMiLCJjaGlsZEJhc2luIiwidXBkYXRlU3RlcEluZm9ybWF0aW9uIiwic3RlcE1hc3NlcyIsImZpbHRlciIsImlzTWFzc0luc2lkZSIsInBvb2xMaXF1aWRWb2x1bWUiLCJsaXF1aWRWb2x1bWVQcm9wZXJ0eSIsImJvYXRMaXF1aWRWb2x1bWUiLCJwb29sRW1wdHlWb2x1bWVUb0JvYXRUb3AiLCJnZXRFbXB0eVZvbHVtZSIsIm1pbiIsInN0ZXBUb3AiLCJib2F0RW1wdHlWb2x1bWVUb0JvYXRUb3AiLCJwb29sRXhjZXNzIiwiYm9hdEV4Y2VzcyIsInRyYW5zZmVyVm9sdW1lIiwiY29tcHV0ZVkiLCJyZXNldCIsInN0ZXAiLCJpbnRlcnBvbGF0aW9uUmF0aW8iLCJzZXRSYXRpbyIsInVuaW50ZXJwb2xhdGVNYXNzZXMiLCJib2R5U3luY2hyb25pemVQcmV2aW91cyIsInBvc2l0aW9uTWFzc2VzTGVmdCIsInBvc2l0aW9uIiwibWF0cml4Iiwic2V0VG9UcmFuc2xhdGlvbiIsInNpemVQcm9wZXJ0eSIsIndpZHRoIiwid3JpdGVEYXRhIiwidHJhbnNmb3JtZWRFbWl0dGVyIiwicG9zaXRpb25NYXNzZXNSaWdodCIsInBvc2l0aW9uU3RhY2tMZWZ0IiwieCIsIm1hcCIsInBvc2l0aW9uU3RhY2siLCJwb3NpdGlvblN0YWNrUmlnaHQiLCJfIiwic29ydEJ5IiwiaGVpZ2h0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEZW5zaXR5QnVveWFuY3lNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgY29yZSBtb2RlbCBmb3IgdGhlIERlbnNpdHkgYW5kIEJ1b3lhbmN5IHNpbSBzY3JlZW5zLCBpbmNsdWRpbmcgYSBwb29sIGFuZCBtYXNzZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSwgeyBPYnNlcnZhYmxlQXJyYXkgfSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBCb3VuZHMzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMzLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBkZW5zaXR5QnVveWFuY3lDb21tb24gZnJvbSAnLi4vLi4vZGVuc2l0eUJ1b3lhbmN5Q29tbW9uLmpzJztcclxuaW1wb3J0IERlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9EZW5zaXR5QnVveWFuY3lDb21tb25RdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgR3Jhdml0eSBmcm9tICcuL0dyYXZpdHkuanMnO1xyXG5pbXBvcnQgTWF0ZXJpYWwgZnJvbSAnLi9NYXRlcmlhbC5qcyc7XHJcbmltcG9ydCBQMkVuZ2luZSBmcm9tICcuL1AyRW5naW5lLmpzJztcclxuaW1wb3J0IFBvb2wgZnJvbSAnLi9Qb29sLmpzJztcclxuaW1wb3J0IFNjYWxlIGZyb20gJy4vU2NhbGUuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgQm9hdCBmcm9tICcuLi8uLi9idW95YW5jeS9tb2RlbC9Cb2F0LmpzJztcclxuaW1wb3J0IFBoeXNpY3NFbmdpbmUsIHsgUGh5c2ljc0VuZ2luZUJvZHkgfSBmcm9tICcuL1BoeXNpY3NFbmdpbmUuanMnO1xyXG5pbXBvcnQgTWFzcyBmcm9tICcuL01hc3MuanMnO1xyXG5pbXBvcnQgQmFzaW4gZnJvbSAnLi9CYXNpbi5qcyc7XHJcbmltcG9ydCBDdWJvaWQgZnJvbSAnLi9DdWJvaWQuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSYW5nZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSYW5nZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUTW9kZWwgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvVE1vZGVsLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBCTE9DS19TUEFDSU5HID0gMC4wMTtcclxuY29uc3QgUE9PTF9WT0xVTUUgPSAwLjE1O1xyXG5jb25zdCBQT09MX1dJRFRIID0gMC45O1xyXG5jb25zdCBQT09MX0RFUFRIID0gMC40O1xyXG5jb25zdCBQT09MX0hFSUdIVCA9IFBPT0xfVk9MVU1FIC8gUE9PTF9XSURUSCAvIFBPT0xfREVQVEg7XHJcbmNvbnN0IEdST1VORF9GUk9OVF9aID0gUE9PTF9ERVBUSCAvIDI7XHJcbmNvbnN0IFBPT0xfQkFDS19aID0gLVBPT0xfREVQVEggLyAyO1xyXG5cclxuZXhwb3J0IHR5cGUgRGVuc2l0eUJ1b3lhbmN5TW9kZWxPcHRpb25zID0ge1xyXG4gIHNob3dNYXNzZXNEZWZhdWx0PzogYm9vbGVhbjtcclxuICBjYW5TaG93Rm9yY2VzPzogYm9vbGVhbjtcclxuICBpbml0aWFsRm9yY2VTY2FsZT86IG51bWJlcjtcclxuICB0YW5kZW06IFRhbmRlbTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlbnNpdHlCdW95YW5jeU1vZGVsIGltcGxlbWVudHMgVE1vZGVsIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHNob3dHcmF2aXR5Rm9yY2VQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHVibGljIHJlYWRvbmx5IHNob3dCdW95YW5jeUZvcmNlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyByZWFkb25seSBzaG93Q29udGFjdEZvcmNlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyByZWFkb25seSBzaG93Rm9yY2VWYWx1ZXNQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGZvcmNlU2NhbGVQcm9wZXJ0eTogVFJhbmdlZFByb3BlcnR5O1xyXG4gIHB1YmxpYyByZWFkb25seSBzaG93TWFzc2VzUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyByZWFkb25seSBncmF2aXR5UHJvcGVydHk6IFByb3BlcnR5PEdyYXZpdHk+O1xyXG4gIHB1YmxpYyByZWFkb25seSBsaXF1aWRNYXRlcmlhbFByb3BlcnR5OiBQcm9wZXJ0eTxNYXRlcmlhbD47XHJcbiAgcHVibGljIHJlYWRvbmx5IGxpcXVpZERlbnNpdHlQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbGlxdWlkVmlzY29zaXR5UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBwb29sQm91bmRzOiBCb3VuZHMzO1xyXG4gIHB1YmxpYyByZWFkb25seSBncm91bmRCb3VuZHM6IEJvdW5kczM7XHJcbiAgcHVibGljIHJlYWRvbmx5IGdyb3VuZFBvaW50czogVmVjdG9yMltdO1xyXG5cclxuICAvLyBXZSdsbCBrZWVwIGJsb2NrcyB3aXRoaW4gdGhlc2UgYm91bmRzLCB0byBnZW5lcmFsbHkgc3RheSBpbi1zY3JlZW4uIFRoaXMgbWF5IGJlXHJcbiAgLy8gYWRqdXN0ZWQgYnkgdGhlIHNjcmVlbiBiYXNlZCBvbiB0aGUgdmlzaWJsZUJvdW5kc1Byb3BlcnR5LiBUaGVzZSBhcmUgc2Vuc2libGUgZGVmYXVsdHMsIHdpdGggdGhlIG1pblggYW5kIG1pbllcclxuICAvLyBzb21ld2hhdCBtZWFudCB0byBiZSBhZGp1c3RlZC5cclxuICBwdWJsaWMgcmVhZG9ubHkgaW52aXNpYmxlQmFycmllckJvdW5kc1Byb3BlcnR5OiBQcm9wZXJ0eTxCb3VuZHMzPjtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IG1hc3NlczogT2JzZXJ2YWJsZUFycmF5PE1hc3M+O1xyXG4gIHB1YmxpYyByZWFkb25seSBwb29sOiBQb29sO1xyXG4gIHB1YmxpYyByZWFkb25seSBlbmdpbmU6IFBoeXNpY3NFbmdpbmU7XHJcbiAgcHVibGljIHJlYWRvbmx5IGdyb3VuZEJvZHk6IFBoeXNpY3NFbmdpbmVCb2R5O1xyXG4gIHB1YmxpYyBiYXJyaWVyQm9keTogUGh5c2ljc0VuZ2luZUJvZHk7XHJcbiAgcHVibGljIHJlYWRvbmx5IGF2YWlsYWJsZU1hc3NlczogT2JzZXJ2YWJsZUFycmF5PE1hc3M+O1xyXG5cclxuICAvLyBXZSBuZWVkIHRvIGhvb2sgaW50byBhIGJvYXQgKGlmIGl0IGV4aXN0cykgZm9yIGRpc3BsYXlpbmcgdGhlIHdhdGVyLlxyXG4gIHB1YmxpYyBib2F0OiBCb2F0IHwgbnVsbDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBEZW5zaXR5QnVveWFuY3lNb2RlbE9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPERlbnNpdHlCdW95YW5jeU1vZGVsT3B0aW9ucywgRGVuc2l0eUJ1b3lhbmN5TW9kZWxPcHRpb25zPigpKCB7XHJcbiAgICAgIHNob3dNYXNzZXNEZWZhdWx0OiBmYWxzZSxcclxuICAgICAgY2FuU2hvd0ZvcmNlczogdHJ1ZSxcclxuICAgICAgaW5pdGlhbEZvcmNlU2NhbGU6IDEgLyAxNlxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdGFuZGVtID0gb3B0aW9ucy50YW5kZW07XHJcblxyXG4gICAgdGhpcy5zaG93R3Jhdml0eUZvcmNlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMuY2FuU2hvd0ZvcmNlcyA/IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaG93R3Jhdml0eUZvcmNlUHJvcGVydHknICkgOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5zaG93QnVveWFuY3lGb3JjZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLmNhblNob3dGb3JjZXMgPyB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2hvd0J1b3lhbmN5Rm9yY2VQcm9wZXJ0eScgKSA6IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnNob3dDb250YWN0Rm9yY2VQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy5jYW5TaG93Rm9yY2VzID8gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Nob3dDb250YWN0Rm9yY2VQcm9wZXJ0eScgKSA6IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnNob3dGb3JjZVZhbHVlc1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLmNhblNob3dGb3JjZXMgPyB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2hvd0ZvcmNlVmFsdWVzUHJvcGVydHknICkgOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5zaG93TWFzc2VzUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBvcHRpb25zLnNob3dNYXNzZXNEZWZhdWx0LCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Nob3dNYXNzZXNQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0Rpc3BsYXlzIGEgbWFzcyByZWFkb3V0IG9uIGVhY2ggb2JqZWN0J1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5mb3JjZVNjYWxlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG9wdGlvbnMuaW5pdGlhbEZvcmNlU2NhbGUsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLmNhblNob3dGb3JjZXMgPyB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmVjdG9yU2NhbGVQcm9wZXJ0eScgKSA6IFRhbmRlbS5PUFRfT1VULFxyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCBNYXRoLnBvdyggMC41LCA5ICksIDEgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZ3Jhdml0eVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBHcmF2aXR5LkVBUlRILCB7XHJcbiAgICAgIHZhbHVlVHlwZTogR3Jhdml0eSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBHcmF2aXR5LkdyYXZpdHlJTyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ3Jhdml0eVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSBhY2NlbGVyYXRpb24gZHVlIHRvIGdyYXZpdHkgYXBwbGllZCB0byBhbGwgbWFzc2VzLCAobWF5IGJlIHBvdGVudGlhbGx5IGN1c3RvbSBvciBoaWRkZW4gZnJvbSB2aWV3KSdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmxpcXVpZE1hdGVyaWFsUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIE1hdGVyaWFsLldBVEVSLCB7XHJcbiAgICAgIHZhbHVlVHlwZTogTWF0ZXJpYWwsXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTWF0ZXJpYWwuTWF0ZXJpYWxJTyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGlxdWlkTWF0ZXJpYWxQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdUaGUgbWF0ZXJpYWwgb2YgdGhlIGxpcXVpZCBpbiB0aGUgcG9vbCdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBEZXJpdmVkUHJvcGVydHkgZG9lc24ndCBuZWVkIGRpc3Bvc2FsLCBzaW5jZSBldmVyeXRoaW5nIGhlcmUgbGl2ZXMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltdWxhdGlvblxyXG4gICAgdGhpcy5saXF1aWREZW5zaXR5UHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubGlxdWlkTWF0ZXJpYWxQcm9wZXJ0eSBdLCBsaXF1aWRNYXRlcmlhbCA9PiBsaXF1aWRNYXRlcmlhbC5kZW5zaXR5LCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xpcXVpZERlbnNpdHlQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdW1iZXJJTyxcclxuICAgICAgdW5pdHM6ICdrZy9tXjMnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRGVyaXZlZFByb3BlcnR5IGRvZXNuJ3QgbmVlZCBkaXNwb3NhbCwgc2luY2UgZXZlcnl0aGluZyBoZXJlIGxpdmVzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbXVsYXRpb25cclxuICAgIHRoaXMubGlxdWlkVmlzY29zaXR5UHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubGlxdWlkTWF0ZXJpYWxQcm9wZXJ0eSBdLCBsaXF1aWRNYXRlcmlhbCA9PiBsaXF1aWRNYXRlcmlhbC52aXNjb3NpdHksIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGlxdWlkVmlzY29zaXR5UHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU8sXHJcbiAgICAgIHVuaXRzOiAnUGFcXHUwMGI3cydcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnBvb2xCb3VuZHMgPSBuZXcgQm91bmRzMyhcclxuICAgICAgLVBPT0xfV0lEVEggLyAyLCAtUE9PTF9IRUlHSFQsIFBPT0xfQkFDS19aLFxyXG4gICAgICBQT09MX1dJRFRIIC8gMiwgMCwgR1JPVU5EX0ZST05UX1pcclxuICAgICk7XHJcbiAgICB0aGlzLmdyb3VuZEJvdW5kcyA9IG5ldyBCb3VuZHMzKFxyXG4gICAgICAtMTAsIC0xMCwgLTIsXHJcbiAgICAgIDEwLCAwLCBHUk9VTkRfRlJPTlRfWlxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmludmlzaWJsZUJhcnJpZXJCb3VuZHNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IEJvdW5kczMoXHJcbiAgICAgIC0wLjg3NSwgLTQsIFBPT0xfQkFDS19aLFxyXG4gICAgICAwLjg3NSwgNCwgR1JPVU5EX0ZST05UX1pcclxuICAgICksIHtcclxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBIb3cgbWFueSB1bml0cyB0aGUgYmFycmllciBleHRlbmRzIG91dCB0b1xyXG4gICAgY29uc3QgYmFycmllclNpemUgPSA1O1xyXG5cclxuICAgIC8vIERlcml2ZWRQcm9wZXJ0eSBkb2Vzbid0IG5lZWQgZGlzcG9zYWwsIHNpbmNlIGV2ZXJ5dGhpbmcgaGVyZSBsaXZlcyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW11bGF0aW9uXHJcbiAgICBjb25zdCBiYXJyaWVyUG9pbnRzUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMuaW52aXNpYmxlQmFycmllckJvdW5kc1Byb3BlcnR5IF0sIGJvdW5kcyA9PiB7XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIGJvdW5kcy5tYXhYLCBib3VuZHMubWluWSApLFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCBib3VuZHMubWF4WCArIGJhcnJpZXJTaXplLCBib3VuZHMubWluWSApLFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCBib3VuZHMubWF4WCArIGJhcnJpZXJTaXplLCBib3VuZHMubWF4WSArIGJhcnJpZXJTaXplICksXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIGJvdW5kcy5taW5YIC0gYmFycmllclNpemUsIGJvdW5kcy5tYXhZICsgYmFycmllclNpemUgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggYm91bmRzLm1pblggLSBiYXJyaWVyU2l6ZSwgYm91bmRzLm1pblkgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggYm91bmRzLm1pblgsIGJvdW5kcy5taW5ZICksXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIGJvdW5kcy5taW5YLCBib3VuZHMubWF4WSApLFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCBib3VuZHMubWF4WCwgYm91bmRzLm1heFkgKVxyXG4gICAgICBdO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGlmICggRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnBvb2xXaWR0aE11bHRpcGxpZXIgIT09IDEgKSB7XHJcbiAgICAgIGNvbnN0IGhhbGZYID0gRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnBvb2xXaWR0aE11bHRpcGxpZXIgKiAwLjQ1O1xyXG4gICAgICBjb25zdCBoYWxmWiA9IFBPT0xfVk9MVU1FIC8gKCAyICogaGFsZlggKiBQT09MX0hFSUdIVCAqIDIgKTtcclxuICAgICAgdGhpcy5wb29sQm91bmRzID0gbmV3IEJvdW5kczMoXHJcbiAgICAgICAgLWhhbGZYLCAtUE9PTF9IRUlHSFQsIC1oYWxmWixcclxuICAgICAgICBoYWxmWCwgMCwgaGFsZlpcclxuICAgICAgKTtcclxuICAgICAgdGhpcy5ncm91bmRCb3VuZHMgPSBuZXcgQm91bmRzMyhcclxuICAgICAgICAtMTAsIC0xMCwgLTIsXHJcbiAgICAgICAgMTAsIDAsIGhhbGZaXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5ncm91bmRQb2ludHMgPSBbXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB0aGlzLmdyb3VuZEJvdW5kcy5taW5YLCB0aGlzLmdyb3VuZEJvdW5kcy5taW5ZICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB0aGlzLmdyb3VuZEJvdW5kcy5tYXhYLCB0aGlzLmdyb3VuZEJvdW5kcy5taW5ZICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB0aGlzLmdyb3VuZEJvdW5kcy5tYXhYLCB0aGlzLmdyb3VuZEJvdW5kcy5tYXhZICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB0aGlzLnBvb2xCb3VuZHMubWF4WCwgdGhpcy5wb29sQm91bmRzLm1heFkgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIHRoaXMucG9vbEJvdW5kcy5tYXhYLCB0aGlzLnBvb2xCb3VuZHMubWluWSApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggdGhpcy5wb29sQm91bmRzLm1pblgsIHRoaXMucG9vbEJvdW5kcy5taW5ZICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB0aGlzLnBvb2xCb3VuZHMubWluWCwgdGhpcy5wb29sQm91bmRzLm1heFkgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIHRoaXMuZ3JvdW5kQm91bmRzLm1pblgsIHRoaXMuZ3JvdW5kQm91bmRzLm1heFkgKVxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLnBvb2wgPSBuZXcgUG9vbCggdGhpcy5wb29sQm91bmRzLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Bvb2wnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmJvYXQgPSBudWxsO1xyXG4gICAgdGhpcy5lbmdpbmUgPSBuZXcgUDJFbmdpbmUoKTtcclxuXHJcbiAgICB0aGlzLmdyb3VuZEJvZHkgPSB0aGlzLmVuZ2luZS5jcmVhdGVHcm91bmQoIHRoaXMuZ3JvdW5kUG9pbnRzICk7XHJcbiAgICB0aGlzLmVuZ2luZS5hZGRCb2R5KCB0aGlzLmdyb3VuZEJvZHkgKTtcclxuXHJcbiAgICB0aGlzLmJhcnJpZXJCb2R5ID0gdGhpcy5lbmdpbmUuY3JlYXRlQmFycmllciggYmFycmllclBvaW50c1Byb3BlcnR5LnZhbHVlICk7XHJcbiAgICB0aGlzLmVuZ2luZS5hZGRCb2R5KCB0aGlzLmJhcnJpZXJCb2R5ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBiYXJyaWVyIHNoYXBlIGFzIG5lZWRlZCAoZnVsbCByZWNyZWF0aW9uIGZvciBub3cpXHJcbiAgICBiYXJyaWVyUG9pbnRzUHJvcGVydHkubGF6eUxpbmsoIHBvaW50cyA9PiB7XHJcbiAgICAgIHRoaXMuZW5naW5lLnJlbW92ZUJvZHkoIHRoaXMuYmFycmllckJvZHkgKTtcclxuICAgICAgdGhpcy5iYXJyaWVyQm9keSA9IHRoaXMuZW5naW5lLmNyZWF0ZUJhcnJpZXIoIHBvaW50cyApO1xyXG4gICAgICB0aGlzLmVuZ2luZS5hZGRCb2R5KCB0aGlzLmJhcnJpZXJCb2R5ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hdmFpbGFibGVNYXNzZXMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuXHJcbiAgICAvLyBDb250cm9sIG1hc3NlcyBieSB2aXNpYmlsaXR5LCBzbyB0aGF0IHRoaXMubWFzc2VzIHdpbGwgYmUgdGhlIHN1YnNldCBvZiB0aGlzLmF2YWlsYWJsZU1hc3NlcyB0aGF0IGlzIHZpc2libGVcclxuICAgIGNvbnN0IHZpc2liaWxpdHlMaXN0ZW5lck1hcCA9IG5ldyBNYXA8TWFzcywgKCB2aXNpYmxlOiBib29sZWFuICkgPT4gdm9pZD4oKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zcGFjZWQtZnVuY1xyXG4gICAgdGhpcy5hdmFpbGFibGVNYXNzZXMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIG1hc3MgPT4ge1xyXG4gICAgICBjb25zdCB2aXNpYmlsaXR5TGlzdGVuZXIgPSAoIHZpc2libGU6IGJvb2xlYW4gKSA9PiB7XHJcbiAgICAgICAgaWYgKCB2aXNpYmxlICkge1xyXG4gICAgICAgICAgdGhpcy5tYXNzZXMucHVzaCggbWFzcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMubWFzc2VzLnJlbW92ZSggbWFzcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgdmlzaWJpbGl0eUxpc3RlbmVyTWFwLnNldCggbWFzcywgdmlzaWJpbGl0eUxpc3RlbmVyICk7XHJcbiAgICAgIG1hc3MudmlzaWJsZVByb3BlcnR5LmxhenlMaW5rKCB2aXNpYmlsaXR5TGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIGlmICggbWFzcy52aXNpYmxlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5tYXNzZXMucHVzaCggbWFzcyApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmF2YWlsYWJsZU1hc3Nlcy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCBtYXNzID0+IHtcclxuICAgICAgbWFzcy52aXNpYmxlUHJvcGVydHkudW5saW5rKCB2aXNpYmlsaXR5TGlzdGVuZXJNYXAuZ2V0KCBtYXNzICkhICk7XHJcbiAgICAgIHZpc2liaWxpdHlMaXN0ZW5lck1hcC5kZWxldGUoIG1hc3MgKTtcclxuXHJcbiAgICAgIGlmICggbWFzcy52aXNpYmxlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5tYXNzZXMucmVtb3ZlKCBtYXNzICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm1hc3NlcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG4gICAgdGhpcy5tYXNzZXMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIG1hc3MgPT4ge1xyXG4gICAgICB0aGlzLmVuZ2luZS5hZGRCb2R5KCBtYXNzLmJvZHkgKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMubWFzc2VzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIG1hc3MgPT4ge1xyXG4gICAgICB0aGlzLmVuZ2luZS5yZW1vdmVCb2R5KCBtYXNzLmJvZHkgKTtcclxuICAgICAgbWFzcy5pbnRlcnJ1cHRlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGxldCBib2F0VmVydGljYWxWZWxvY2l0eSA9IDA7XHJcbiAgICBsZXQgYm9hdFZlcnRpY2FsQWNjZWxlcmF0aW9uID0gMDtcclxuXHJcbiAgICAvLyBUaGUgbWFpbiBlbmdpbmUgcG9zdC1zdGVwIGFjdGlvbnMsIHRoYXQgd2lsbCBkZXRlcm1pbmUgdGhlIG5ldCBmb3JjZXMgYXBwbGllZCBvbiBlYWNoIG1hc3MuXHJcbiAgICAvLyBUaGlzIGluc3RhbmNlIGxpdmVzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbXVsYXRpb24sIHNvIHdlIGRvbid0IG5lZWQgdG8gcmVtb3ZlIHRoaXMgbGlzdGVuZXJcclxuICAgIHRoaXMuZW5naW5lLmFkZFBvc3RTdGVwTGlzdGVuZXIoIGR0ID0+IHtcclxuICAgICAgdGhpcy51cGRhdGVMaXF1aWQoKTtcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9XHJcbiAgICAgIGNvbnN0IGdyYXZpdHkgPSB0aGlzLmdyYXZpdHlQcm9wZXJ0eS52YWx1ZS52YWx1ZTtcclxuXHJcbiAgICAgIGNvbnN0IGJvYXQgPSB0aGlzLmdldEJvYXQoKTtcclxuXHJcbiAgICAgIGlmICggYm9hdCAmJiBkdCApIHtcclxuICAgICAgICBjb25zdCBuZXh0Qm9hdFZlcnRpY2FsVmVsb2NpdHkgPSB0aGlzLmVuZ2luZS5ib2R5R2V0VmVsb2NpdHkoIGJvYXQuYm9keSApLnk7XHJcbiAgICAgICAgYm9hdFZlcnRpY2FsQWNjZWxlcmF0aW9uID0gKCBuZXh0Qm9hdFZlcnRpY2FsVmVsb2NpdHkgLSBib2F0VmVydGljYWxWZWxvY2l0eSApIC8gZHQ7XHJcbiAgICAgICAgYm9hdFZlcnRpY2FsVmVsb2NpdHkgPSBuZXh0Qm9hdFZlcnRpY2FsVmVsb2NpdHk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdpbGwgc2V0IHRoZSBmb3JjZSBQcm9wZXJ0aWVzIGZvciBhbGwgb2YgdGhlIG1hc3Nlc1xyXG4gICAgICB0aGlzLm1hc3Nlcy5mb3JFYWNoKCBtYXNzID0+IHtcclxuICAgICAgICBsZXQgY29udGFjdEZvcmNlID0gdGhpcy5lbmdpbmUuYm9keUdldENvbnRhY3RGb3JjZXMoIG1hc3MuYm9keSApO1xyXG5cclxuICAgICAgICAvLyBwMi5qcyB3aWxsIHJlcG9ydCBiYWQgZm9yY2VzIGZvciBzdGF0aWMgc2NhbGVzLCBzbyB3ZSBuZWVkIHRvIHplcm8gdGhlc2Ugb3V0XHJcbiAgICAgICAgaWYgKCAhY29udGFjdEZvcmNlLmlzRmluaXRlKCkgKSB7XHJcbiAgICAgICAgICBjb250YWN0Rm9yY2UgPSBWZWN0b3IyLlpFUk87XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVuZ2luZS5yZXNldENvbnRhY3RGb3JjZXMoIG1hc3MuYm9keSApO1xyXG4gICAgICAgIG1hc3MuY29udGFjdEZvcmNlSW50ZXJwb2xhdGVkUHJvcGVydHkuc2V0TmV4dFZhbHVlKCBjb250YWN0Rm9yY2UgKTtcclxuXHJcbiAgICAgICAgaWYgKCBtYXNzIGluc3RhbmNlb2YgU2NhbGUgKSB7XHJcbiAgICAgICAgICBsZXQgc2NhbGVGb3JjZSA9IDA7XHJcbiAgICAgICAgICB0aGlzLm1hc3Nlcy5mb3JFYWNoKCBvdGhlck1hc3MgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIG1hc3MgIT09IG90aGVyTWFzcyApIHtcclxuICAgICAgICAgICAgICBjb25zdCB2ZXJ0aWNhbEZvcmNlID0gdGhpcy5lbmdpbmUuYm9keUdldENvbnRhY3RGb3JjZUJldHdlZW4oIG1hc3MuYm9keSwgb3RoZXJNYXNzLmJvZHkgKS55O1xyXG4gICAgICAgICAgICAgIGlmICggdmVydGljYWxGb3JjZSA+IDAgKSB7XHJcbiAgICAgICAgICAgICAgICBzY2FsZUZvcmNlICs9IHZlcnRpY2FsRm9yY2U7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICBtYXNzLnNjYWxlRm9yY2VJbnRlcnBvbGF0ZWRQcm9wZXJ0eS5zZXROZXh0VmFsdWUoIHNjYWxlRm9yY2UgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHZlbG9jaXR5ID0gdGhpcy5lbmdpbmUuYm9keUdldFZlbG9jaXR5KCBtYXNzLmJvZHkgKTtcclxuXHJcbiAgICAgICAgLy8gTGltaXQgdmVsb2NpdHksIHNvIHRoaW5ncyBjb252ZXJnZSBmYXN0ZXIuXHJcbiAgICAgICAgaWYgKCB2ZWxvY2l0eS5tYWduaXR1ZGUgPiA1ICkge1xyXG4gICAgICAgICAgdmVsb2NpdHkuc2V0TWFnbml0dWRlKCA1ICk7XHJcbiAgICAgICAgICB0aGlzLmVuZ2luZS5ib2R5U2V0VmVsb2NpdHkoIG1hc3MuYm9keSwgdmVsb2NpdHkgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGJhc2luID0gbWFzcy5jb250YWluaW5nQmFzaW47XHJcbiAgICAgICAgY29uc3Qgc3VibWVyZ2VkVm9sdW1lID0gYmFzaW4gPyBtYXNzLmdldERpc3BsYWNlZFZvbHVtZSggYmFzaW4ubGlxdWlkWUludGVycG9sYXRlZFByb3BlcnR5LmN1cnJlbnRWYWx1ZSApIDogMDtcclxuICAgICAgICBpZiAoIHN1Ym1lcmdlZFZvbHVtZSApIHtcclxuICAgICAgICAgIGNvbnN0IGRpc3BsYWNlZE1hc3MgPSBzdWJtZXJnZWRWb2x1bWUgKiB0aGlzLmxpcXVpZERlbnNpdHlQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICAgIC8vIFZlcnRpY2FsIGFjY2VsZXJhdGlvbiBvZiB0aGUgYm9hdCB3aWxsIGNoYW5nZSB0aGUgYnVveWFudCBmb3JjZS5cclxuICAgICAgICAgIGNvbnN0IGFjY2VsZXJhdGlvbiA9IGdyYXZpdHkgKyAoICggYm9hdCAmJiBiYXNpbiA9PT0gYm9hdC5iYXNpbiApID8gYm9hdFZlcnRpY2FsQWNjZWxlcmF0aW9uIDogMCApO1xyXG4gICAgICAgICAgY29uc3QgYnVveWFudEZvcmNlID0gbmV3IFZlY3RvcjIoIDAsIGRpc3BsYWNlZE1hc3MgKiBhY2NlbGVyYXRpb24gKTtcclxuICAgICAgICAgIHRoaXMuZW5naW5lLmJvZHlBcHBseUZvcmNlKCBtYXNzLmJvZHksIGJ1b3lhbnRGb3JjZSApO1xyXG4gICAgICAgICAgbWFzcy5idW95YW5jeUZvcmNlSW50ZXJwb2xhdGVkUHJvcGVydHkuc2V0TmV4dFZhbHVlKCBidW95YW50Rm9yY2UgKTtcclxuXHJcbiAgICAgICAgICAvLyBJZiB0aGUgYm9hdCBpcyBtb3ZpbmcsIGFzc3VtZSB0aGUgbGlxdWlkIG1vdmVzIHdpdGggaXQsIGFuZCBhcHBseSB2aXNjb3NpdHkgZHVlIHRvIHRoZSBtb3ZlbWVudCBvZiBvdXIgbWFzc1xyXG4gICAgICAgICAgLy8gaW5zaWRlIHRoZSBib2F0J3MgbGlxdWlkLlxyXG4gICAgICAgICAgaWYgKCBib2F0ICYmIGJhc2luID09PSBib2F0LmJhc2luICkge1xyXG4gICAgICAgICAgICB2ZWxvY2l0eS5zdWJ0cmFjdCggdGhpcy5lbmdpbmUuYm9keUdldFZlbG9jaXR5KCBib2F0LmJvZHkgKSApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEluY3JlYXNlIHRoZSBnZW5lcmFsbHktdmlzaWJsZSB2aXNjb3NpdHkgZWZmZWN0XHJcbiAgICAgICAgICBjb25zdCByYXRpb1N1Ym1lcmdlZCA9XHJcbiAgICAgICAgICAgICggMSAtIERlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycy52aXNjb3NpdHlTdWJtZXJnZWRSYXRpbyApICtcclxuICAgICAgICAgICAgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnZpc2Nvc2l0eVN1Ym1lcmdlZFJhdGlvICogc3VibWVyZ2VkVm9sdW1lIC8gbWFzcy52b2x1bWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICAgIGNvbnN0IGhhY2tlZFZpc2Nvc2l0eSA9IHRoaXMubGlxdWlkVmlzY29zaXR5UHJvcGVydHkudmFsdWUgPyAwLjAzICogTWF0aC5wb3coIHRoaXMubGlxdWlkVmlzY29zaXR5UHJvcGVydHkudmFsdWUgLyAwLjAzLCAwLjggKSA6IDA7XHJcbiAgICAgICAgICBjb25zdCB2aXNjb3NpdHlNYXNzID0gTWF0aC5tYXgoIERlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycy52aXNjb3NpdHlNYXNzQ3V0b2ZmLCBtYXNzLm1hc3NQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICAgICAgY29uc3QgdmlzY291c0ZvcmNlID0gdmVsb2NpdHkudGltZXMoIC1oYWNrZWRWaXNjb3NpdHkgKiB2aXNjb3NpdHlNYXNzICogcmF0aW9TdWJtZXJnZWQgKiAzMDAwICogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnZpc2Nvc2l0eU11bHRpcGxpZXIgKTtcclxuICAgICAgICAgIHRoaXMuZW5naW5lLmJvZHlBcHBseUZvcmNlKCBtYXNzLmJvZHksIHZpc2NvdXNGb3JjZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIG1hc3MuYnVveWFuY3lGb3JjZUludGVycG9sYXRlZFByb3BlcnR5LnNldE5leHRWYWx1ZSggVmVjdG9yMi5aRVJPICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHcmF2aXR5XHJcbiAgICAgICAgY29uc3QgZ3Jhdml0eUZvcmNlID0gbmV3IFZlY3RvcjIoIDAsIC1tYXNzLm1hc3NQcm9wZXJ0eS52YWx1ZSAqIGdyYXZpdHkgKTtcclxuICAgICAgICB0aGlzLmVuZ2luZS5ib2R5QXBwbHlGb3JjZSggbWFzcy5ib2R5LCBncmF2aXR5Rm9yY2UgKTtcclxuICAgICAgICBtYXNzLmdyYXZpdHlGb3JjZUludGVycG9sYXRlZFByb3BlcnR5LnNldE5leHRWYWx1ZSggZ3Jhdml0eUZvcmNlICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGJvYXQgKGlmIHRoZXJlIGlzIG9uZSlcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Qm9hdCgpOiBCb2F0IHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5ib2F0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZXMgdGhlIGhlaWdodHMgb2YgdGhlIG1haW4gcG9vbCBsaXF1aWQgKGFuZCBvcHRpb25hbGx5IHRoYXQgb2YgdGhlIGJvYXQpXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVMaXF1aWQoKTogdm9pZCB7XHJcbiAgICBjb25zdCBib2F0ID0gdGhpcy5nZXRCb2F0KCk7XHJcblxyXG4gICAgY29uc3QgYmFzaW5zOiBCYXNpbltdID0gWyB0aGlzLnBvb2wgXTtcclxuICAgIGlmICggYm9hdCAmJiBib2F0LnZpc2libGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgYmFzaW5zLnB1c2goIGJvYXQuYmFzaW4gKTtcclxuICAgICAgdGhpcy5wb29sLmNoaWxkQmFzaW4gPSBib2F0LmJhc2luO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMucG9vbC5jaGlsZEJhc2luID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1hc3Nlcy5mb3JFYWNoKCBtYXNzID0+IG1hc3MudXBkYXRlU3RlcEluZm9ybWF0aW9uKCkgKTtcclxuICAgIGJhc2lucy5mb3JFYWNoKCBiYXNpbiA9PiB7XHJcbiAgICAgIGJhc2luLnN0ZXBNYXNzZXMgPSB0aGlzLm1hc3Nlcy5maWx0ZXIoIG1hc3MgPT4gYmFzaW4uaXNNYXNzSW5zaWRlKCBtYXNzICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBsZXQgcG9vbExpcXVpZFZvbHVtZSA9IHRoaXMucG9vbC5saXF1aWRWb2x1bWVQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyBNYXkgbmVlZCB0byBhZGp1c3Qgdm9sdW1lcyBiZXR3ZWVuIHRoZSBib2F0L3Bvb2wgaWYgdGhlcmUgaXMgYSBib2F0XHJcbiAgICBpZiAoIGJvYXQgKSB7XHJcbiAgICAgIGlmICggYm9hdC52aXNpYmxlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgbGV0IGJvYXRMaXF1aWRWb2x1bWUgPSBib2F0LmJhc2luLmxpcXVpZFZvbHVtZVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgICAgICBjb25zdCBwb29sRW1wdHlWb2x1bWVUb0JvYXRUb3AgPSB0aGlzLnBvb2wuZ2V0RW1wdHlWb2x1bWUoIE1hdGgubWluKCBib2F0LnN0ZXBUb3AsIHRoaXMucG9vbEJvdW5kcy5tYXhZICkgKTtcclxuICAgICAgICBjb25zdCBib2F0RW1wdHlWb2x1bWVUb0JvYXRUb3AgPSBib2F0LmJhc2luLmdldEVtcHR5Vm9sdW1lKCBib2F0LnN0ZXBUb3AgKTtcclxuXHJcbiAgICAgICAgY29uc3QgcG9vbEV4Y2VzcyA9IHBvb2xMaXF1aWRWb2x1bWUgLSBwb29sRW1wdHlWb2x1bWVUb0JvYXRUb3A7XHJcbiAgICAgICAgY29uc3QgYm9hdEV4Y2VzcyA9IGJvYXRMaXF1aWRWb2x1bWUgLSBib2F0RW1wdHlWb2x1bWVUb0JvYXRUb3A7XHJcblxyXG4gICAgICAgIGlmICggcG9vbEV4Y2VzcyA+IDAgJiYgYm9hdEV4Y2VzcyA8IDAgKSB7XHJcbiAgICAgICAgICBjb25zdCB0cmFuc2ZlclZvbHVtZSA9IE1hdGgubWluKCBwb29sRXhjZXNzLCAtYm9hdEV4Y2VzcyApO1xyXG4gICAgICAgICAgcG9vbExpcXVpZFZvbHVtZSAtPSB0cmFuc2ZlclZvbHVtZTtcclxuICAgICAgICAgIGJvYXRMaXF1aWRWb2x1bWUgKz0gdHJhbnNmZXJWb2x1bWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBib2F0RXhjZXNzID4gMCApIHtcclxuICAgICAgICAgIC8vIElmIHRoZSBib2F0IG92ZXJmbG93cywganVzdCBkdW1wIHRoZSByZXN0IGluIHRoZSBwb29sXHJcbiAgICAgICAgICBwb29sTGlxdWlkVm9sdW1lICs9IGJvYXRFeGNlc3M7XHJcbiAgICAgICAgICBib2F0TGlxdWlkVm9sdW1lIC09IGJvYXRFeGNlc3M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJvYXQuYmFzaW4ubGlxdWlkVm9sdW1lUHJvcGVydHkudmFsdWUgPSBib2F0TGlxdWlkVm9sdW1lO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGJvYXQuYmFzaW4ubGlxdWlkVm9sdW1lUHJvcGVydHkudmFsdWUgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdhdGVyIFwic3BpbGxlZFwiIG91dCBvZiB0aGUgcG9vbCwgYW5kIHNldCB0aGUgZmluYWxpemVkIGxpcXVpZCB2b2x1bWVcclxuICAgIHRoaXMucG9vbC5saXF1aWRWb2x1bWVQcm9wZXJ0eS52YWx1ZSA9IE1hdGgubWluKCBwb29sTGlxdWlkVm9sdW1lLCB0aGlzLnBvb2wuZ2V0RW1wdHlWb2x1bWUoIHRoaXMucG9vbEJvdW5kcy5tYXhZICkgKTtcclxuXHJcbiAgICB0aGlzLnBvb2wuY29tcHV0ZVkoKTtcclxuICAgIGlmICggYm9hdCApIHtcclxuICAgICAgYm9hdC5iYXNpbi5jb21wdXRlWSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHdlIGhhdmUgYSBib2F0IHRoYXQgaXMgTk9UIHVuZGVyd2F0ZXIsIHdlJ2xsIGFzc2lnbiBtYXNzZXMgaW50byB0aGUgYm9hdCdzIGJhc2luIHdoZXJlIHJlbGV2YW50LiBPdGhlcndpc2VcclxuICAgIC8vIGFueXRoaW5nIHdpbGwgZ28ganVzdCBpbnRvIHRoZSBwb29sJ3MgYmFzaW4uXHJcbiAgICBpZiAoIGJvYXQgJiYgdGhpcy5wb29sLmxpcXVpZFlJbnRlcnBvbGF0ZWRQcm9wZXJ0eS5jdXJyZW50VmFsdWUgPCBib2F0LmJhc2luLnN0ZXBUb3AgKyAxZS03ICkge1xyXG4gICAgICB0aGlzLm1hc3Nlcy5mb3JFYWNoKCBtYXNzID0+IHtcclxuICAgICAgICBtYXNzLmNvbnRhaW5pbmdCYXNpbiA9IGJvYXQuYmFzaW4uaXNNYXNzSW5zaWRlKCBtYXNzICkgPyBib2F0LmJhc2luIDogKCB0aGlzLnBvb2wuaXNNYXNzSW5zaWRlKCBtYXNzICkgPyB0aGlzLnBvb2wgOiBudWxsICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLm1hc3Nlcy5mb3JFYWNoKCBtYXNzID0+IHtcclxuICAgICAgICBtYXNzLmNvbnRhaW5pbmdCYXNpbiA9IHRoaXMucG9vbC5pc01hc3NJbnNpZGUoIG1hc3MgKSA/IHRoaXMucG9vbCA6IG51bGw7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGluZ3MgdG8gdGhlaXIgb3JpZ2luYWwgdmFsdWVzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuc2hvd0dyYXZpdHlGb3JjZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNob3dCdW95YW5jeUZvcmNlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2hvd0NvbnRhY3RGb3JjZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNob3dNYXNzZXNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaG93Rm9yY2VWYWx1ZXNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5ncmF2aXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubGlxdWlkTWF0ZXJpYWxQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMucG9vbC5yZXNldCgpO1xyXG4gICAgdGhpcy5tYXNzZXMuZm9yRWFjaCggbWFzcyA9PiBtYXNzLnJlc2V0KCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIGZvcndhcmQgaW4gdGltZS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMuZW5naW5lLnN0ZXAoIGR0ICk7XHJcblxyXG4gICAgdGhpcy5tYXNzZXMuZm9yRWFjaCggbWFzcyA9PiB7XHJcbiAgICAgIG1hc3Muc3RlcCggZHQsIHRoaXMuZW5naW5lLmludGVycG9sYXRpb25SYXRpbyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucG9vbC5saXF1aWRZSW50ZXJwb2xhdGVkUHJvcGVydHkuc2V0UmF0aW8oIHRoaXMuZW5naW5lLmludGVycG9sYXRpb25SYXRpbyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZXMgbWFzc2VzJyBwcmV2aW91cyBwb3NpdGlvbnMgdG8gdGhlaXIgY3VycmVudCBwb3NpdGlvbnMuXHJcbiAgICovXHJcbiAgcHVibGljIHVuaW50ZXJwb2xhdGVNYXNzZXMoKTogdm9pZCB7XHJcbiAgICB0aGlzLm1hc3Nlcy5mb3JFYWNoKCBtYXNzID0+IHRoaXMuZW5naW5lLmJvZHlTeW5jaHJvbml6ZVByZXZpb3VzKCBtYXNzLmJvZHkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUG9zaXRpb25zIG1hc3NlcyBmcm9tIHRoZSBsZWZ0IG9mIHRoZSBwb29sIG91dHdhcmQsIHdpdGggcGFkZGluZ1xyXG4gICAqL1xyXG4gIHB1YmxpYyBwb3NpdGlvbk1hc3Nlc0xlZnQoIG1hc3NlczogQ3Vib2lkW10gKTogdm9pZCB7XHJcbiAgICBsZXQgcG9zaXRpb24gPSB0aGlzLnBvb2xCb3VuZHMubWluWDtcclxuXHJcbiAgICBtYXNzZXMuZm9yRWFjaCggbWFzcyA9PiB7XHJcbiAgICAgIG1hc3MubWF0cml4LnNldFRvVHJhbnNsYXRpb24oXHJcbiAgICAgICAgcG9zaXRpb24gLSBCTE9DS19TUEFDSU5HIC0gbWFzcy5zaXplUHJvcGVydHkudmFsdWUud2lkdGggLyAyLFxyXG4gICAgICAgIC1tYXNzLnNpemVQcm9wZXJ0eS52YWx1ZS5taW5ZXHJcbiAgICAgICk7XHJcbiAgICAgIHBvc2l0aW9uIC09IEJMT0NLX1NQQUNJTkcgKyBtYXNzLnNpemVQcm9wZXJ0eS52YWx1ZS53aWR0aDtcclxuICAgICAgbWFzcy53cml0ZURhdGEoKTtcclxuICAgICAgbWFzcy50cmFuc2Zvcm1lZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUG9zaXRpb25zIG1hc3NlcyBmcm9tIHRoZSByaWdodCBvZiB0aGUgcG9vbCBvdXR3YXJkLCB3aXRoIHBhZGRpbmdcclxuICAgKi9cclxuICBwdWJsaWMgcG9zaXRpb25NYXNzZXNSaWdodCggbWFzc2VzOiBDdWJvaWRbXSApOiB2b2lkIHtcclxuICAgIGxldCBwb3NpdGlvbiA9IHRoaXMucG9vbEJvdW5kcy5tYXhYO1xyXG5cclxuICAgIG1hc3Nlcy5mb3JFYWNoKCBtYXNzID0+IHtcclxuICAgICAgbWFzcy5tYXRyaXguc2V0VG9UcmFuc2xhdGlvbihcclxuICAgICAgICBwb3NpdGlvbiArIEJMT0NLX1NQQUNJTkcgKyBtYXNzLnNpemVQcm9wZXJ0eS52YWx1ZS53aWR0aCAvIDIsXHJcbiAgICAgICAgLW1hc3Muc2l6ZVByb3BlcnR5LnZhbHVlLm1pbllcclxuICAgICAgKTtcclxuICAgICAgcG9zaXRpb24gKz0gQkxPQ0tfU1BBQ0lORyArIG1hc3Muc2l6ZVByb3BlcnR5LnZhbHVlLndpZHRoO1xyXG4gICAgICBtYXNzLndyaXRlRGF0YSgpO1xyXG4gICAgICBtYXNzLnRyYW5zZm9ybWVkRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQb3NpdGlvbnMgbWFzc2VzIGZyb20gdGhlIGxlZnQgb2YgdGhlIHBvb2wgdXBcclxuICAgKi9cclxuICBwdWJsaWMgcG9zaXRpb25TdGFja0xlZnQoIG1hc3NlczogQ3Vib2lkW10gKTogdm9pZCB7XHJcbiAgICBjb25zdCB4ID0gdGhpcy5wb29sQm91bmRzLm1pblggLSBCTE9DS19TUEFDSU5HIC0gTWF0aC5tYXgoIC4uLm1hc3Nlcy5tYXAoIG1hc3MgPT4gbWFzcy5zaXplUHJvcGVydHkudmFsdWUud2lkdGggKSApIC8gMjtcclxuXHJcbiAgICB0aGlzLnBvc2l0aW9uU3RhY2soIG1hc3NlcywgeCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUG9zaXRpb25zIG1hc3NlcyBmcm9tIHRoZSByaWdodCBvZiB0aGUgcG9vbCB1cFxyXG4gICAqL1xyXG4gIHB1YmxpYyBwb3NpdGlvblN0YWNrUmlnaHQoIG1hc3NlczogQ3Vib2lkW10gKTogdm9pZCB7XHJcbiAgICBjb25zdCB4ID0gdGhpcy5wb29sQm91bmRzLm1heFggKyBCTE9DS19TUEFDSU5HICsgTWF0aC5tYXgoIC4uLm1hc3Nlcy5tYXAoIG1hc3MgPT4gbWFzcy5zaXplUHJvcGVydHkudmFsdWUud2lkdGggKSApIC8gMjtcclxuXHJcbiAgICB0aGlzLnBvc2l0aW9uU3RhY2soIG1hc3NlcywgeCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUG9zaXRpb24gYSBzdGFjayBvZiBtYXNzZXMgYXQgYSBnaXZlbiBjZW50ZXIgeC5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgcG9zaXRpb25TdGFjayggbWFzc2VzOiBDdWJvaWRbXSwgeDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgbGV0IHBvc2l0aW9uID0gMDtcclxuXHJcbiAgICBtYXNzZXMgPSBfLnNvcnRCeSggbWFzc2VzLCBtYXNzID0+IC1tYXNzLnZvbHVtZVByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgbWFzc2VzLmZvckVhY2goIG1hc3MgPT4ge1xyXG4gICAgICBtYXNzLm1hdHJpeC5zZXRUb1RyYW5zbGF0aW9uKCB4LCBwb3NpdGlvbiArIG1hc3Muc2l6ZVByb3BlcnR5LnZhbHVlLmhlaWdodCAvIDIgKTtcclxuICAgICAgcG9zaXRpb24gKz0gbWFzcy5zaXplUHJvcGVydHkudmFsdWUuaGVpZ2h0O1xyXG4gICAgICBtYXNzLndyaXRlRGF0YSgpO1xyXG4gICAgICB0aGlzLmVuZ2luZS5ib2R5U3luY2hyb25pemVQcmV2aW91cyggbWFzcy5ib2R5ICk7XHJcbiAgICAgIG1hc3MudHJhbnNmb3JtZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmRlbnNpdHlCdW95YW5jeUNvbW1vbi5yZWdpc3RlciggJ0RlbnNpdHlCdW95YW5jeU1vZGVsJywgRGVuc2l0eUJ1b3lhbmN5TW9kZWwgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLHFCQUFxQixNQUEyQiw4Q0FBOEM7QUFDckcsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUNsRSxPQUFPQyxvQ0FBb0MsTUFBTSw0Q0FBNEM7QUFDN0YsT0FBT0MsT0FBTyxNQUFNLGNBQWM7QUFDbEMsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFDcEMsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFDcEMsT0FBT0MsSUFBSSxNQUFNLFdBQVc7QUFDNUIsT0FBT0MsS0FBSyxNQUFNLFlBQVk7QUFDOUIsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQU03RCxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBS2xFO0FBQ0EsTUFBTUMsYUFBYSxHQUFHLElBQUk7QUFDMUIsTUFBTUMsV0FBVyxHQUFHLElBQUk7QUFDeEIsTUFBTUMsVUFBVSxHQUFHLEdBQUc7QUFDdEIsTUFBTUMsVUFBVSxHQUFHLEdBQUc7QUFDdEIsTUFBTUMsV0FBVyxHQUFHSCxXQUFXLEdBQUdDLFVBQVUsR0FBR0MsVUFBVTtBQUN6RCxNQUFNRSxjQUFjLEdBQUdGLFVBQVUsR0FBRyxDQUFDO0FBQ3JDLE1BQU1HLFdBQVcsR0FBRyxDQUFDSCxVQUFVLEdBQUcsQ0FBQztBQVNuQyxlQUFlLE1BQU1JLG9CQUFvQixDQUFtQjtFQWlCMUQ7RUFDQTtFQUNBO0VBVUE7RUFHT0MsV0FBV0EsQ0FBRUMsZUFBNkMsRUFBRztJQUNsRSxNQUFNQyxPQUFPLEdBQUdaLFNBQVMsQ0FBMkQsQ0FBQyxDQUFFO01BQ3JGYSxpQkFBaUIsRUFBRSxLQUFLO01BQ3hCQyxhQUFhLEVBQUUsSUFBSTtNQUNuQkMsaUJBQWlCLEVBQUUsQ0FBQyxHQUFHO0lBQ3pCLENBQUMsRUFBRUosZUFBZ0IsQ0FBQztJQUVwQixNQUFNSyxNQUFNLEdBQUdKLE9BQU8sQ0FBQ0ksTUFBTTtJQUU3QixJQUFJLENBQUNDLHdCQUF3QixHQUFHLElBQUlqQyxlQUFlLENBQUUsS0FBSyxFQUFFO01BQzFEZ0MsTUFBTSxFQUFFSixPQUFPLENBQUNFLGFBQWEsR0FBR0UsTUFBTSxDQUFDRSxZQUFZLENBQUUsMEJBQTJCLENBQUMsR0FBRzNCLE1BQU0sQ0FBQzRCO0lBQzdGLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0MseUJBQXlCLEdBQUcsSUFBSXBDLGVBQWUsQ0FBRSxLQUFLLEVBQUU7TUFDM0RnQyxNQUFNLEVBQUVKLE9BQU8sQ0FBQ0UsYUFBYSxHQUFHRSxNQUFNLENBQUNFLFlBQVksQ0FBRSwyQkFBNEIsQ0FBQyxHQUFHM0IsTUFBTSxDQUFDNEI7SUFDOUYsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDRSx3QkFBd0IsR0FBRyxJQUFJckMsZUFBZSxDQUFFLEtBQUssRUFBRTtNQUMxRGdDLE1BQU0sRUFBRUosT0FBTyxDQUFDRSxhQUFhLEdBQUdFLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLDBCQUEyQixDQUFDLEdBQUczQixNQUFNLENBQUM0QjtJQUM3RixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNHLHVCQUF1QixHQUFHLElBQUl0QyxlQUFlLENBQUUsS0FBSyxFQUFFO01BQ3pEZ0MsTUFBTSxFQUFFSixPQUFPLENBQUNFLGFBQWEsR0FBR0UsTUFBTSxDQUFDRSxZQUFZLENBQUUseUJBQTBCLENBQUMsR0FBRzNCLE1BQU0sQ0FBQzRCO0lBQzVGLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0ksa0JBQWtCLEdBQUcsSUFBSXZDLGVBQWUsQ0FBRTRCLE9BQU8sQ0FBQ0MsaUJBQWlCLEVBQUU7TUFDeEVHLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsb0JBQXFCLENBQUM7TUFDbkRNLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0Msa0JBQWtCLEdBQUcsSUFBSXhCLGNBQWMsQ0FBRVcsT0FBTyxDQUFDRyxpQkFBaUIsRUFBRTtNQUN2RUMsTUFBTSxFQUFFSixPQUFPLENBQUNFLGFBQWEsR0FBR0UsTUFBTSxDQUFDRSxZQUFZLENBQUUscUJBQXNCLENBQUMsR0FBRzNCLE1BQU0sQ0FBQzRCLE9BQU87TUFDN0ZPLEtBQUssRUFBRSxJQUFJckMsS0FBSyxDQUFFc0MsSUFBSSxDQUFDQyxHQUFHLENBQUUsR0FBRyxFQUFFLENBQUUsQ0FBQyxFQUFFLENBQUU7SUFDMUMsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDQyxlQUFlLEdBQUcsSUFBSTNDLFFBQVEsQ0FBRVMsT0FBTyxDQUFDbUMsS0FBSyxFQUFFO01BQ2xEQyxTQUFTLEVBQUVwQyxPQUFPO01BQ2xCcUMsZUFBZSxFQUFFckMsT0FBTyxDQUFDc0MsU0FBUztNQUNsQ2pCLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsaUJBQWtCLENBQUM7TUFDaERnQixjQUFjLEVBQUUsSUFBSTtNQUNwQlYsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDVyxzQkFBc0IsR0FBRyxJQUFJakQsUUFBUSxDQUFFVSxRQUFRLENBQUN3QyxLQUFLLEVBQUU7TUFDMURMLFNBQVMsRUFBRW5DLFFBQVE7TUFDbkJvQyxlQUFlLEVBQUVwQyxRQUFRLENBQUN5QyxVQUFVO01BQ3BDckIsTUFBTSxFQUFFQSxNQUFNLENBQUNFLFlBQVksQ0FBRSx3QkFBeUIsQ0FBQztNQUN2RGdCLGNBQWMsRUFBRSxJQUFJO01BQ3BCVixtQkFBbUIsRUFBRTtJQUN2QixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNjLHFCQUFxQixHQUFHLElBQUlyRCxlQUFlLENBQUUsQ0FBRSxJQUFJLENBQUNrRCxzQkFBc0IsQ0FBRSxFQUFFSSxjQUFjLElBQUlBLGNBQWMsQ0FBQ0MsT0FBTyxFQUFFO01BQzNIeEIsTUFBTSxFQUFFQSxNQUFNLENBQUNFLFlBQVksQ0FBRSx1QkFBd0IsQ0FBQztNQUN0RGMsZUFBZSxFQUFFeEMsUUFBUTtNQUN6QmlELEtBQUssRUFBRTtJQUNULENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ0MsdUJBQXVCLEdBQUcsSUFBSXpELGVBQWUsQ0FBRSxDQUFFLElBQUksQ0FBQ2tELHNCQUFzQixDQUFFLEVBQUVJLGNBQWMsSUFBSUEsY0FBYyxDQUFDSSxTQUFTLEVBQUU7TUFDL0gzQixNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLHlCQUEwQixDQUFDO01BQ3hEYyxlQUFlLEVBQUV4QyxRQUFRO01BQ3pCaUQsS0FBSyxFQUFFO0lBQ1QsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDRyxVQUFVLEdBQUcsSUFBSXhELE9BQU8sQ0FDM0IsQ0FBQ2dCLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQ0UsV0FBVyxFQUFFRSxXQUFXLEVBQzFDSixVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRUcsY0FDckIsQ0FBQztJQUNELElBQUksQ0FBQ3NDLFlBQVksR0FBRyxJQUFJekQsT0FBTyxDQUM3QixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFDWixFQUFFLEVBQUUsQ0FBQyxFQUFFbUIsY0FDVCxDQUFDO0lBRUQsSUFBSSxDQUFDdUMsOEJBQThCLEdBQUcsSUFBSTVELFFBQVEsQ0FBRSxJQUFJRSxPQUFPLENBQzdELENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFb0IsV0FBVyxFQUN2QixLQUFLLEVBQUUsQ0FBQyxFQUFFRCxjQUNaLENBQUMsRUFBRTtNQUNEd0MsdUJBQXVCLEVBQUU7SUFDM0IsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTUMsV0FBVyxHQUFHLENBQUM7O0lBRXJCO0lBQ0EsTUFBTUMscUJBQXFCLEdBQUcsSUFBSWhFLGVBQWUsQ0FBRSxDQUFFLElBQUksQ0FBQzZELDhCQUE4QixDQUFFLEVBQUVJLE1BQU0sSUFBSTtNQUNwRyxPQUFPLENBQ0wsSUFBSTVELE9BQU8sQ0FBRTRELE1BQU0sQ0FBQ0MsSUFBSSxFQUFFRCxNQUFNLENBQUNFLElBQUssQ0FBQyxFQUN2QyxJQUFJOUQsT0FBTyxDQUFFNEQsTUFBTSxDQUFDQyxJQUFJLEdBQUdILFdBQVcsRUFBRUUsTUFBTSxDQUFDRSxJQUFLLENBQUMsRUFDckQsSUFBSTlELE9BQU8sQ0FBRTRELE1BQU0sQ0FBQ0MsSUFBSSxHQUFHSCxXQUFXLEVBQUVFLE1BQU0sQ0FBQ0csSUFBSSxHQUFHTCxXQUFZLENBQUMsRUFDbkUsSUFBSTFELE9BQU8sQ0FBRTRELE1BQU0sQ0FBQ0ksSUFBSSxHQUFHTixXQUFXLEVBQUVFLE1BQU0sQ0FBQ0csSUFBSSxHQUFHTCxXQUFZLENBQUMsRUFDbkUsSUFBSTFELE9BQU8sQ0FBRTRELE1BQU0sQ0FBQ0ksSUFBSSxHQUFHTixXQUFXLEVBQUVFLE1BQU0sQ0FBQ0UsSUFBSyxDQUFDLEVBQ3JELElBQUk5RCxPQUFPLENBQUU0RCxNQUFNLENBQUNJLElBQUksRUFBRUosTUFBTSxDQUFDRSxJQUFLLENBQUMsRUFDdkMsSUFBSTlELE9BQU8sQ0FBRTRELE1BQU0sQ0FBQ0ksSUFBSSxFQUFFSixNQUFNLENBQUNHLElBQUssQ0FBQyxFQUN2QyxJQUFJL0QsT0FBTyxDQUFFNEQsTUFBTSxDQUFDQyxJQUFJLEVBQUVELE1BQU0sQ0FBQ0csSUFBSyxDQUFDLENBQ3hDO0lBQ0gsQ0FBRSxDQUFDO0lBRUgsSUFBSzNELG9DQUFvQyxDQUFDNkQsbUJBQW1CLEtBQUssQ0FBQyxFQUFHO01BQ3BFLE1BQU1DLEtBQUssR0FBRzlELG9DQUFvQyxDQUFDNkQsbUJBQW1CLEdBQUcsSUFBSTtNQUM3RSxNQUFNRSxLQUFLLEdBQUd0RCxXQUFXLElBQUssQ0FBQyxHQUFHcUQsS0FBSyxHQUFHbEQsV0FBVyxHQUFHLENBQUMsQ0FBRTtNQUMzRCxJQUFJLENBQUNzQyxVQUFVLEdBQUcsSUFBSXhELE9BQU8sQ0FDM0IsQ0FBQ29FLEtBQUssRUFBRSxDQUFDbEQsV0FBVyxFQUFFLENBQUNtRCxLQUFLLEVBQzVCRCxLQUFLLEVBQUUsQ0FBQyxFQUFFQyxLQUNaLENBQUM7TUFDRCxJQUFJLENBQUNaLFlBQVksR0FBRyxJQUFJekQsT0FBTyxDQUM3QixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFDWixFQUFFLEVBQUUsQ0FBQyxFQUFFcUUsS0FDVCxDQUFDO0lBQ0g7SUFFQSxJQUFJLENBQUNDLFlBQVksR0FBRyxDQUNsQixJQUFJcEUsT0FBTyxDQUFFLElBQUksQ0FBQ3VELFlBQVksQ0FBQ1MsSUFBSSxFQUFFLElBQUksQ0FBQ1QsWUFBWSxDQUFDTyxJQUFLLENBQUMsRUFDN0QsSUFBSTlELE9BQU8sQ0FBRSxJQUFJLENBQUN1RCxZQUFZLENBQUNNLElBQUksRUFBRSxJQUFJLENBQUNOLFlBQVksQ0FBQ08sSUFBSyxDQUFDLEVBQzdELElBQUk5RCxPQUFPLENBQUUsSUFBSSxDQUFDdUQsWUFBWSxDQUFDTSxJQUFJLEVBQUUsSUFBSSxDQUFDTixZQUFZLENBQUNRLElBQUssQ0FBQyxFQUM3RCxJQUFJL0QsT0FBTyxDQUFFLElBQUksQ0FBQ3NELFVBQVUsQ0FBQ08sSUFBSSxFQUFFLElBQUksQ0FBQ1AsVUFBVSxDQUFDUyxJQUFLLENBQUMsRUFDekQsSUFBSS9ELE9BQU8sQ0FBRSxJQUFJLENBQUNzRCxVQUFVLENBQUNPLElBQUksRUFBRSxJQUFJLENBQUNQLFVBQVUsQ0FBQ1EsSUFBSyxDQUFDLEVBQ3pELElBQUk5RCxPQUFPLENBQUUsSUFBSSxDQUFDc0QsVUFBVSxDQUFDVSxJQUFJLEVBQUUsSUFBSSxDQUFDVixVQUFVLENBQUNRLElBQUssQ0FBQyxFQUN6RCxJQUFJOUQsT0FBTyxDQUFFLElBQUksQ0FBQ3NELFVBQVUsQ0FBQ1UsSUFBSSxFQUFFLElBQUksQ0FBQ1YsVUFBVSxDQUFDUyxJQUFLLENBQUMsRUFDekQsSUFBSS9ELE9BQU8sQ0FBRSxJQUFJLENBQUN1RCxZQUFZLENBQUNTLElBQUksRUFBRSxJQUFJLENBQUNULFlBQVksQ0FBQ1EsSUFBSyxDQUFDLENBQzlEO0lBRUQsSUFBSSxDQUFDTSxJQUFJLEdBQUcsSUFBSTdELElBQUksQ0FBRSxJQUFJLENBQUM4QyxVQUFVLEVBQUU7TUFDckM1QixNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLE1BQU87SUFDdEMsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDMEMsSUFBSSxHQUFHLElBQUk7SUFDaEIsSUFBSSxDQUFDQyxNQUFNLEdBQUcsSUFBSWhFLFFBQVEsQ0FBQyxDQUFDO0lBRTVCLElBQUksQ0FBQ2lFLFVBQVUsR0FBRyxJQUFJLENBQUNELE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLElBQUksQ0FBQ0wsWUFBYSxDQUFDO0lBQy9ELElBQUksQ0FBQ0csTUFBTSxDQUFDRyxPQUFPLENBQUUsSUFBSSxDQUFDRixVQUFXLENBQUM7SUFFdEMsSUFBSSxDQUFDRyxXQUFXLEdBQUcsSUFBSSxDQUFDSixNQUFNLENBQUNLLGFBQWEsQ0FBRWpCLHFCQUFxQixDQUFDa0IsS0FBTSxDQUFDO0lBQzNFLElBQUksQ0FBQ04sTUFBTSxDQUFDRyxPQUFPLENBQUUsSUFBSSxDQUFDQyxXQUFZLENBQUM7O0lBRXZDO0lBQ0FoQixxQkFBcUIsQ0FBQ21CLFFBQVEsQ0FBRUMsTUFBTSxJQUFJO01BQ3hDLElBQUksQ0FBQ1IsTUFBTSxDQUFDUyxVQUFVLENBQUUsSUFBSSxDQUFDTCxXQUFZLENBQUM7TUFDMUMsSUFBSSxDQUFDQSxXQUFXLEdBQUcsSUFBSSxDQUFDSixNQUFNLENBQUNLLGFBQWEsQ0FBRUcsTUFBTyxDQUFDO01BQ3RELElBQUksQ0FBQ1IsTUFBTSxDQUFDRyxPQUFPLENBQUUsSUFBSSxDQUFDQyxXQUFZLENBQUM7SUFDekMsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDTSxlQUFlLEdBQUdwRixxQkFBcUIsQ0FBQyxDQUFDOztJQUU5QztJQUNBLE1BQU1xRixxQkFBcUIsR0FBRyxJQUFJQyxHQUFHLENBQXFDLENBQUMsQ0FBQyxDQUFDO0lBQzdFLElBQUksQ0FBQ0YsZUFBZSxDQUFDRyxvQkFBb0IsQ0FBRUMsSUFBSSxJQUFJO01BQ2pELE1BQU1DLGtCQUFrQixHQUFLQyxPQUFnQixJQUFNO1FBQ2pELElBQUtBLE9BQU8sRUFBRztVQUNiLElBQUksQ0FBQ0MsTUFBTSxDQUFDQyxJQUFJLENBQUVKLElBQUssQ0FBQztRQUMxQixDQUFDLE1BQ0k7VUFDSCxJQUFJLENBQUNHLE1BQU0sQ0FBQ0UsTUFBTSxDQUFFTCxJQUFLLENBQUM7UUFDNUI7TUFDRixDQUFDO01BQ0RILHFCQUFxQixDQUFDUyxHQUFHLENBQUVOLElBQUksRUFBRUMsa0JBQW1CLENBQUM7TUFDckRELElBQUksQ0FBQ08sZUFBZSxDQUFDZCxRQUFRLENBQUVRLGtCQUFtQixDQUFDO01BRW5ELElBQUtELElBQUksQ0FBQ08sZUFBZSxDQUFDZixLQUFLLEVBQUc7UUFDaEMsSUFBSSxDQUFDVyxNQUFNLENBQUNDLElBQUksQ0FBRUosSUFBSyxDQUFDO01BQzFCO0lBQ0YsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDSixlQUFlLENBQUNZLHNCQUFzQixDQUFFUixJQUFJLElBQUk7TUFDbkRBLElBQUksQ0FBQ08sZUFBZSxDQUFDRSxNQUFNLENBQUVaLHFCQUFxQixDQUFDYSxHQUFHLENBQUVWLElBQUssQ0FBRyxDQUFDO01BQ2pFSCxxQkFBcUIsQ0FBQ2MsTUFBTSxDQUFFWCxJQUFLLENBQUM7TUFFcEMsSUFBS0EsSUFBSSxDQUFDTyxlQUFlLENBQUNmLEtBQUssRUFBRztRQUNoQyxJQUFJLENBQUNXLE1BQU0sQ0FBQ0UsTUFBTSxDQUFFTCxJQUFLLENBQUM7TUFDNUI7SUFDRixDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNHLE1BQU0sR0FBRzNGLHFCQUFxQixDQUFDLENBQUM7SUFDckMsSUFBSSxDQUFDMkYsTUFBTSxDQUFDSixvQkFBb0IsQ0FBRUMsSUFBSSxJQUFJO01BQ3hDLElBQUksQ0FBQ2QsTUFBTSxDQUFDRyxPQUFPLENBQUVXLElBQUksQ0FBQ1ksSUFBSyxDQUFDO0lBQ2xDLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ1QsTUFBTSxDQUFDSyxzQkFBc0IsQ0FBRVIsSUFBSSxJQUFJO01BQzFDLElBQUksQ0FBQ2QsTUFBTSxDQUFDUyxVQUFVLENBQUVLLElBQUksQ0FBQ1ksSUFBSyxDQUFDO01BQ25DWixJQUFJLENBQUNhLGtCQUFrQixDQUFDQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFFLENBQUM7SUFFSCxJQUFJQyxvQkFBb0IsR0FBRyxDQUFDO0lBQzVCLElBQUlDLHdCQUF3QixHQUFHLENBQUM7O0lBRWhDO0lBQ0E7SUFDQSxJQUFJLENBQUM5QixNQUFNLENBQUMrQixtQkFBbUIsQ0FBRUMsRUFBRSxJQUFJO01BQ3JDLElBQUksQ0FBQ0MsWUFBWSxDQUFDLENBQUM7O01BRW5CO01BQ0EsTUFBTUMsT0FBTyxHQUFHLElBQUksQ0FBQ2xFLGVBQWUsQ0FBQ3NDLEtBQUssQ0FBQ0EsS0FBSztNQUVoRCxNQUFNUCxJQUFJLEdBQUcsSUFBSSxDQUFDb0MsT0FBTyxDQUFDLENBQUM7TUFFM0IsSUFBS3BDLElBQUksSUFBSWlDLEVBQUUsRUFBRztRQUNoQixNQUFNSSx3QkFBd0IsR0FBRyxJQUFJLENBQUNwQyxNQUFNLENBQUNxQyxlQUFlLENBQUV0QyxJQUFJLENBQUMyQixJQUFLLENBQUMsQ0FBQ1ksQ0FBQztRQUMzRVIsd0JBQXdCLEdBQUcsQ0FBRU0sd0JBQXdCLEdBQUdQLG9CQUFvQixJQUFLRyxFQUFFO1FBQ25GSCxvQkFBb0IsR0FBR08sd0JBQXdCO01BQ2pEOztNQUVBO01BQ0EsSUFBSSxDQUFDbkIsTUFBTSxDQUFDc0IsT0FBTyxDQUFFekIsSUFBSSxJQUFJO1FBQzNCLElBQUkwQixZQUFZLEdBQUcsSUFBSSxDQUFDeEMsTUFBTSxDQUFDeUMsb0JBQW9CLENBQUUzQixJQUFJLENBQUNZLElBQUssQ0FBQzs7UUFFaEU7UUFDQSxJQUFLLENBQUNjLFlBQVksQ0FBQ0UsUUFBUSxDQUFDLENBQUMsRUFBRztVQUM5QkYsWUFBWSxHQUFHL0csT0FBTyxDQUFDa0gsSUFBSTtRQUM3QjtRQUVBLElBQUksQ0FBQzNDLE1BQU0sQ0FBQzRDLGtCQUFrQixDQUFFOUIsSUFBSSxDQUFDWSxJQUFLLENBQUM7UUFDM0NaLElBQUksQ0FBQytCLGdDQUFnQyxDQUFDQyxZQUFZLENBQUVOLFlBQWEsQ0FBQztRQUVsRSxJQUFLMUIsSUFBSSxZQUFZNUUsS0FBSyxFQUFHO1VBQzNCLElBQUk2RyxVQUFVLEdBQUcsQ0FBQztVQUNsQixJQUFJLENBQUM5QixNQUFNLENBQUNzQixPQUFPLENBQUVTLFNBQVMsSUFBSTtZQUNoQyxJQUFLbEMsSUFBSSxLQUFLa0MsU0FBUyxFQUFHO2NBQ3hCLE1BQU1DLGFBQWEsR0FBRyxJQUFJLENBQUNqRCxNQUFNLENBQUNrRCwwQkFBMEIsQ0FBRXBDLElBQUksQ0FBQ1ksSUFBSSxFQUFFc0IsU0FBUyxDQUFDdEIsSUFBSyxDQUFDLENBQUNZLENBQUM7Y0FDM0YsSUFBS1csYUFBYSxHQUFHLENBQUMsRUFBRztnQkFDdkJGLFVBQVUsSUFBSUUsYUFBYTtjQUM3QjtZQUNGO1VBQ0YsQ0FBRSxDQUFDO1VBQ0huQyxJQUFJLENBQUNxQyw4QkFBOEIsQ0FBQ0wsWUFBWSxDQUFFQyxVQUFXLENBQUM7UUFDaEU7UUFFQSxNQUFNSyxRQUFRLEdBQUcsSUFBSSxDQUFDcEQsTUFBTSxDQUFDcUMsZUFBZSxDQUFFdkIsSUFBSSxDQUFDWSxJQUFLLENBQUM7O1FBRXpEO1FBQ0EsSUFBSzBCLFFBQVEsQ0FBQ0MsU0FBUyxHQUFHLENBQUMsRUFBRztVQUM1QkQsUUFBUSxDQUFDRSxZQUFZLENBQUUsQ0FBRSxDQUFDO1VBQzFCLElBQUksQ0FBQ3RELE1BQU0sQ0FBQ3VELGVBQWUsQ0FBRXpDLElBQUksQ0FBQ1ksSUFBSSxFQUFFMEIsUUFBUyxDQUFDO1FBQ3BEO1FBRUEsTUFBTUksS0FBSyxHQUFHMUMsSUFBSSxDQUFDMkMsZUFBZTtRQUNsQyxNQUFNQyxlQUFlLEdBQUdGLEtBQUssR0FBRzFDLElBQUksQ0FBQzZDLGtCQUFrQixDQUFFSCxLQUFLLENBQUNJLDJCQUEyQixDQUFDQyxZQUFhLENBQUMsR0FBRyxDQUFDO1FBQzdHLElBQUtILGVBQWUsRUFBRztVQUNyQixNQUFNSSxhQUFhLEdBQUdKLGVBQWUsR0FBRyxJQUFJLENBQUNqRixxQkFBcUIsQ0FBQzZCLEtBQUs7VUFDeEU7VUFDQSxNQUFNeUQsWUFBWSxHQUFHN0IsT0FBTyxJQUFPbkMsSUFBSSxJQUFJeUQsS0FBSyxLQUFLekQsSUFBSSxDQUFDeUQsS0FBSyxHQUFLMUIsd0JBQXdCLEdBQUcsQ0FBQyxDQUFFO1VBQ2xHLE1BQU1rQyxZQUFZLEdBQUcsSUFBSXZJLE9BQU8sQ0FBRSxDQUFDLEVBQUVxSSxhQUFhLEdBQUdDLFlBQWEsQ0FBQztVQUNuRSxJQUFJLENBQUMvRCxNQUFNLENBQUNpRSxjQUFjLENBQUVuRCxJQUFJLENBQUNZLElBQUksRUFBRXNDLFlBQWEsQ0FBQztVQUNyRGxELElBQUksQ0FBQ29ELGlDQUFpQyxDQUFDcEIsWUFBWSxDQUFFa0IsWUFBYSxDQUFDOztVQUVuRTtVQUNBO1VBQ0EsSUFBS2pFLElBQUksSUFBSXlELEtBQUssS0FBS3pELElBQUksQ0FBQ3lELEtBQUssRUFBRztZQUNsQ0osUUFBUSxDQUFDZSxRQUFRLENBQUUsSUFBSSxDQUFDbkUsTUFBTSxDQUFDcUMsZUFBZSxDQUFFdEMsSUFBSSxDQUFDMkIsSUFBSyxDQUFFLENBQUM7VUFDL0Q7O1VBRUE7VUFDQSxNQUFNMEMsY0FBYyxHQUNoQixDQUFDLEdBQUd2SSxvQ0FBb0MsQ0FBQ3dJLHVCQUF1QixHQUNsRXhJLG9DQUFvQyxDQUFDd0ksdUJBQXVCLEdBQUdYLGVBQWUsR0FBRzVDLElBQUksQ0FBQ3dELGNBQWMsQ0FBQ2hFLEtBQUs7VUFDNUcsTUFBTWlFLGVBQWUsR0FBRyxJQUFJLENBQUMxRix1QkFBdUIsQ0FBQ3lCLEtBQUssR0FBRyxJQUFJLEdBQUd4QyxJQUFJLENBQUNDLEdBQUcsQ0FBRSxJQUFJLENBQUNjLHVCQUF1QixDQUFDeUIsS0FBSyxHQUFHLElBQUksRUFBRSxHQUFJLENBQUMsR0FBRyxDQUFDO1VBQ2xJLE1BQU1rRSxhQUFhLEdBQUcxRyxJQUFJLENBQUMyRyxHQUFHLENBQUU1SSxvQ0FBb0MsQ0FBQzZJLG1CQUFtQixFQUFFNUQsSUFBSSxDQUFDNkQsWUFBWSxDQUFDckUsS0FBTSxDQUFDO1VBQ25ILE1BQU1zRSxZQUFZLEdBQUd4QixRQUFRLENBQUN5QixLQUFLLENBQUUsQ0FBQ04sZUFBZSxHQUFHQyxhQUFhLEdBQUdKLGNBQWMsR0FBRyxJQUFJLEdBQUd2SSxvQ0FBb0MsQ0FBQ2lKLG1CQUFvQixDQUFDO1VBQzFKLElBQUksQ0FBQzlFLE1BQU0sQ0FBQ2lFLGNBQWMsQ0FBRW5ELElBQUksQ0FBQ1ksSUFBSSxFQUFFa0QsWUFBYSxDQUFDO1FBQ3ZELENBQUMsTUFDSTtVQUNIOUQsSUFBSSxDQUFDb0QsaUNBQWlDLENBQUNwQixZQUFZLENBQUVySCxPQUFPLENBQUNrSCxJQUFLLENBQUM7UUFDckU7O1FBRUE7UUFDQSxNQUFNb0MsWUFBWSxHQUFHLElBQUl0SixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUNxRixJQUFJLENBQUM2RCxZQUFZLENBQUNyRSxLQUFLLEdBQUc0QixPQUFRLENBQUM7UUFDekUsSUFBSSxDQUFDbEMsTUFBTSxDQUFDaUUsY0FBYyxDQUFFbkQsSUFBSSxDQUFDWSxJQUFJLEVBQUVxRCxZQUFhLENBQUM7UUFDckRqRSxJQUFJLENBQUNrRSxnQ0FBZ0MsQ0FBQ2xDLFlBQVksQ0FBRWlDLFlBQWEsQ0FBQztNQUNwRSxDQUFFLENBQUM7SUFDTCxDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7RUFDUzVDLE9BQU9BLENBQUEsRUFBZ0I7SUFDNUIsT0FBTyxJQUFJLENBQUNwQyxJQUFJO0VBQ2xCOztFQUVBO0FBQ0Y7QUFDQTtFQUNVa0MsWUFBWUEsQ0FBQSxFQUFTO0lBQzNCLE1BQU1sQyxJQUFJLEdBQUcsSUFBSSxDQUFDb0MsT0FBTyxDQUFDLENBQUM7SUFFM0IsTUFBTThDLE1BQWUsR0FBRyxDQUFFLElBQUksQ0FBQ25GLElBQUksQ0FBRTtJQUNyQyxJQUFLQyxJQUFJLElBQUlBLElBQUksQ0FBQ3NCLGVBQWUsQ0FBQ2YsS0FBSyxFQUFHO01BQ3hDMkUsTUFBTSxDQUFDL0QsSUFBSSxDQUFFbkIsSUFBSSxDQUFDeUQsS0FBTSxDQUFDO01BQ3pCLElBQUksQ0FBQzFELElBQUksQ0FBQ29GLFVBQVUsR0FBR25GLElBQUksQ0FBQ3lELEtBQUs7SUFDbkMsQ0FBQyxNQUNJO01BQ0gsSUFBSSxDQUFDMUQsSUFBSSxDQUFDb0YsVUFBVSxHQUFHLElBQUk7SUFDN0I7SUFFQSxJQUFJLENBQUNqRSxNQUFNLENBQUNzQixPQUFPLENBQUV6QixJQUFJLElBQUlBLElBQUksQ0FBQ3FFLHFCQUFxQixDQUFDLENBQUUsQ0FBQztJQUMzREYsTUFBTSxDQUFDMUMsT0FBTyxDQUFFaUIsS0FBSyxJQUFJO01BQ3ZCQSxLQUFLLENBQUM0QixVQUFVLEdBQUcsSUFBSSxDQUFDbkUsTUFBTSxDQUFDb0UsTUFBTSxDQUFFdkUsSUFBSSxJQUFJMEMsS0FBSyxDQUFDOEIsWUFBWSxDQUFFeEUsSUFBSyxDQUFFLENBQUM7SUFDN0UsQ0FBRSxDQUFDO0lBRUgsSUFBSXlFLGdCQUFnQixHQUFHLElBQUksQ0FBQ3pGLElBQUksQ0FBQzBGLG9CQUFvQixDQUFDbEYsS0FBSzs7SUFFM0Q7SUFDQSxJQUFLUCxJQUFJLEVBQUc7TUFDVixJQUFLQSxJQUFJLENBQUNzQixlQUFlLENBQUNmLEtBQUssRUFBRztRQUNoQyxJQUFJbUYsZ0JBQWdCLEdBQUcxRixJQUFJLENBQUN5RCxLQUFLLENBQUNnQyxvQkFBb0IsQ0FBQ2xGLEtBQUs7UUFFNUQsTUFBTW9GLHdCQUF3QixHQUFHLElBQUksQ0FBQzVGLElBQUksQ0FBQzZGLGNBQWMsQ0FBRTdILElBQUksQ0FBQzhILEdBQUcsQ0FBRTdGLElBQUksQ0FBQzhGLE9BQU8sRUFBRSxJQUFJLENBQUM5RyxVQUFVLENBQUNTLElBQUssQ0FBRSxDQUFDO1FBQzNHLE1BQU1zRyx3QkFBd0IsR0FBRy9GLElBQUksQ0FBQ3lELEtBQUssQ0FBQ21DLGNBQWMsQ0FBRTVGLElBQUksQ0FBQzhGLE9BQVEsQ0FBQztRQUUxRSxNQUFNRSxVQUFVLEdBQUdSLGdCQUFnQixHQUFHRyx3QkFBd0I7UUFDOUQsTUFBTU0sVUFBVSxHQUFHUCxnQkFBZ0IsR0FBR0ssd0JBQXdCO1FBRTlELElBQUtDLFVBQVUsR0FBRyxDQUFDLElBQUlDLFVBQVUsR0FBRyxDQUFDLEVBQUc7VUFDdEMsTUFBTUMsY0FBYyxHQUFHbkksSUFBSSxDQUFDOEgsR0FBRyxDQUFFRyxVQUFVLEVBQUUsQ0FBQ0MsVUFBVyxDQUFDO1VBQzFEVCxnQkFBZ0IsSUFBSVUsY0FBYztVQUNsQ1IsZ0JBQWdCLElBQUlRLGNBQWM7UUFDcEMsQ0FBQyxNQUNJLElBQUtELFVBQVUsR0FBRyxDQUFDLEVBQUc7VUFDekI7VUFDQVQsZ0JBQWdCLElBQUlTLFVBQVU7VUFDOUJQLGdCQUFnQixJQUFJTyxVQUFVO1FBQ2hDO1FBQ0FqRyxJQUFJLENBQUN5RCxLQUFLLENBQUNnQyxvQkFBb0IsQ0FBQ2xGLEtBQUssR0FBR21GLGdCQUFnQjtNQUMxRCxDQUFDLE1BQ0k7UUFDSDFGLElBQUksQ0FBQ3lELEtBQUssQ0FBQ2dDLG9CQUFvQixDQUFDbEYsS0FBSyxHQUFHLENBQUM7TUFDM0M7SUFDRjs7SUFFQTtJQUNBLElBQUksQ0FBQ1IsSUFBSSxDQUFDMEYsb0JBQW9CLENBQUNsRixLQUFLLEdBQUd4QyxJQUFJLENBQUM4SCxHQUFHLENBQUVMLGdCQUFnQixFQUFFLElBQUksQ0FBQ3pGLElBQUksQ0FBQzZGLGNBQWMsQ0FBRSxJQUFJLENBQUM1RyxVQUFVLENBQUNTLElBQUssQ0FBRSxDQUFDO0lBRXJILElBQUksQ0FBQ00sSUFBSSxDQUFDb0csUUFBUSxDQUFDLENBQUM7SUFDcEIsSUFBS25HLElBQUksRUFBRztNQUNWQSxJQUFJLENBQUN5RCxLQUFLLENBQUMwQyxRQUFRLENBQUMsQ0FBQztJQUN2Qjs7SUFFQTtJQUNBO0lBQ0EsSUFBS25HLElBQUksSUFBSSxJQUFJLENBQUNELElBQUksQ0FBQzhELDJCQUEyQixDQUFDQyxZQUFZLEdBQUc5RCxJQUFJLENBQUN5RCxLQUFLLENBQUNxQyxPQUFPLEdBQUcsSUFBSSxFQUFHO01BQzVGLElBQUksQ0FBQzVFLE1BQU0sQ0FBQ3NCLE9BQU8sQ0FBRXpCLElBQUksSUFBSTtRQUMzQkEsSUFBSSxDQUFDMkMsZUFBZSxHQUFHMUQsSUFBSSxDQUFDeUQsS0FBSyxDQUFDOEIsWUFBWSxDQUFFeEUsSUFBSyxDQUFDLEdBQUdmLElBQUksQ0FBQ3lELEtBQUssR0FBSyxJQUFJLENBQUMxRCxJQUFJLENBQUN3RixZQUFZLENBQUV4RSxJQUFLLENBQUMsR0FBRyxJQUFJLENBQUNoQixJQUFJLEdBQUcsSUFBTTtNQUM3SCxDQUFFLENBQUM7SUFDTCxDQUFDLE1BQ0k7TUFDSCxJQUFJLENBQUNtQixNQUFNLENBQUNzQixPQUFPLENBQUV6QixJQUFJLElBQUk7UUFDM0JBLElBQUksQ0FBQzJDLGVBQWUsR0FBRyxJQUFJLENBQUMzRCxJQUFJLENBQUN3RixZQUFZLENBQUV4RSxJQUFLLENBQUMsR0FBRyxJQUFJLENBQUNoQixJQUFJLEdBQUcsSUFBSTtNQUMxRSxDQUFFLENBQUM7SUFDTDtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtFQUNTcUcsS0FBS0EsQ0FBQSxFQUFTO0lBQ25CLElBQUksQ0FBQy9JLHdCQUF3QixDQUFDK0ksS0FBSyxDQUFDLENBQUM7SUFDckMsSUFBSSxDQUFDNUkseUJBQXlCLENBQUM0SSxLQUFLLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMzSSx3QkFBd0IsQ0FBQzJJLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQ3pJLGtCQUFrQixDQUFDeUksS0FBSyxDQUFDLENBQUM7SUFDL0IsSUFBSSxDQUFDMUksdUJBQXVCLENBQUMwSSxLQUFLLENBQUMsQ0FBQztJQUNwQyxJQUFJLENBQUNuSSxlQUFlLENBQUNtSSxLQUFLLENBQUMsQ0FBQztJQUM1QixJQUFJLENBQUM3SCxzQkFBc0IsQ0FBQzZILEtBQUssQ0FBQyxDQUFDO0lBRW5DLElBQUksQ0FBQ3JHLElBQUksQ0FBQ3FHLEtBQUssQ0FBQyxDQUFDO0lBQ2pCLElBQUksQ0FBQ2xGLE1BQU0sQ0FBQ3NCLE9BQU8sQ0FBRXpCLElBQUksSUFBSUEsSUFBSSxDQUFDcUYsS0FBSyxDQUFDLENBQUUsQ0FBQztFQUM3Qzs7RUFFQTtBQUNGO0FBQ0E7RUFDU0MsSUFBSUEsQ0FBRXBFLEVBQVUsRUFBUztJQUM5QixJQUFJLENBQUNoQyxNQUFNLENBQUNvRyxJQUFJLENBQUVwRSxFQUFHLENBQUM7SUFFdEIsSUFBSSxDQUFDZixNQUFNLENBQUNzQixPQUFPLENBQUV6QixJQUFJLElBQUk7TUFDM0JBLElBQUksQ0FBQ3NGLElBQUksQ0FBRXBFLEVBQUUsRUFBRSxJQUFJLENBQUNoQyxNQUFNLENBQUNxRyxrQkFBbUIsQ0FBQztJQUNqRCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUN2RyxJQUFJLENBQUM4RCwyQkFBMkIsQ0FBQzBDLFFBQVEsQ0FBRSxJQUFJLENBQUN0RyxNQUFNLENBQUNxRyxrQkFBbUIsQ0FBQztFQUNsRjs7RUFFQTtBQUNGO0FBQ0E7RUFDU0UsbUJBQW1CQSxDQUFBLEVBQVM7SUFDakMsSUFBSSxDQUFDdEYsTUFBTSxDQUFDc0IsT0FBTyxDQUFFekIsSUFBSSxJQUFJLElBQUksQ0FBQ2QsTUFBTSxDQUFDd0csdUJBQXVCLENBQUUxRixJQUFJLENBQUNZLElBQUssQ0FBRSxDQUFDO0VBQ2pGOztFQUVBO0FBQ0Y7QUFDQTtFQUNTK0Usa0JBQWtCQSxDQUFFeEYsTUFBZ0IsRUFBUztJQUNsRCxJQUFJeUYsUUFBUSxHQUFHLElBQUksQ0FBQzNILFVBQVUsQ0FBQ1UsSUFBSTtJQUVuQ3dCLE1BQU0sQ0FBQ3NCLE9BQU8sQ0FBRXpCLElBQUksSUFBSTtNQUN0QkEsSUFBSSxDQUFDNkYsTUFBTSxDQUFDQyxnQkFBZ0IsQ0FDMUJGLFFBQVEsR0FBR3JLLGFBQWEsR0FBR3lFLElBQUksQ0FBQytGLFlBQVksQ0FBQ3ZHLEtBQUssQ0FBQ3dHLEtBQUssR0FBRyxDQUFDLEVBQzVELENBQUNoRyxJQUFJLENBQUMrRixZQUFZLENBQUN2RyxLQUFLLENBQUNmLElBQzNCLENBQUM7TUFDRG1ILFFBQVEsSUFBSXJLLGFBQWEsR0FBR3lFLElBQUksQ0FBQytGLFlBQVksQ0FBQ3ZHLEtBQUssQ0FBQ3dHLEtBQUs7TUFDekRoRyxJQUFJLENBQUNpRyxTQUFTLENBQUMsQ0FBQztNQUNoQmpHLElBQUksQ0FBQ2tHLGtCQUFrQixDQUFDcEYsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0VBQ1NxRixtQkFBbUJBLENBQUVoRyxNQUFnQixFQUFTO0lBQ25ELElBQUl5RixRQUFRLEdBQUcsSUFBSSxDQUFDM0gsVUFBVSxDQUFDTyxJQUFJO0lBRW5DMkIsTUFBTSxDQUFDc0IsT0FBTyxDQUFFekIsSUFBSSxJQUFJO01BQ3RCQSxJQUFJLENBQUM2RixNQUFNLENBQUNDLGdCQUFnQixDQUMxQkYsUUFBUSxHQUFHckssYUFBYSxHQUFHeUUsSUFBSSxDQUFDK0YsWUFBWSxDQUFDdkcsS0FBSyxDQUFDd0csS0FBSyxHQUFHLENBQUMsRUFDNUQsQ0FBQ2hHLElBQUksQ0FBQytGLFlBQVksQ0FBQ3ZHLEtBQUssQ0FBQ2YsSUFDM0IsQ0FBQztNQUNEbUgsUUFBUSxJQUFJckssYUFBYSxHQUFHeUUsSUFBSSxDQUFDK0YsWUFBWSxDQUFDdkcsS0FBSyxDQUFDd0csS0FBSztNQUN6RGhHLElBQUksQ0FBQ2lHLFNBQVMsQ0FBQyxDQUFDO01BQ2hCakcsSUFBSSxDQUFDa0csa0JBQWtCLENBQUNwRixJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7RUFDU3NGLGlCQUFpQkEsQ0FBRWpHLE1BQWdCLEVBQVM7SUFDakQsTUFBTWtHLENBQUMsR0FBRyxJQUFJLENBQUNwSSxVQUFVLENBQUNVLElBQUksR0FBR3BELGFBQWEsR0FBR3lCLElBQUksQ0FBQzJHLEdBQUcsQ0FBRSxHQUFHeEQsTUFBTSxDQUFDbUcsR0FBRyxDQUFFdEcsSUFBSSxJQUFJQSxJQUFJLENBQUMrRixZQUFZLENBQUN2RyxLQUFLLENBQUN3RyxLQUFNLENBQUUsQ0FBQyxHQUFHLENBQUM7SUFFdkgsSUFBSSxDQUFDTyxhQUFhLENBQUVwRyxNQUFNLEVBQUVrRyxDQUFFLENBQUM7RUFDakM7O0VBRUE7QUFDRjtBQUNBO0VBQ1NHLGtCQUFrQkEsQ0FBRXJHLE1BQWdCLEVBQVM7SUFDbEQsTUFBTWtHLENBQUMsR0FBRyxJQUFJLENBQUNwSSxVQUFVLENBQUNPLElBQUksR0FBR2pELGFBQWEsR0FBR3lCLElBQUksQ0FBQzJHLEdBQUcsQ0FBRSxHQUFHeEQsTUFBTSxDQUFDbUcsR0FBRyxDQUFFdEcsSUFBSSxJQUFJQSxJQUFJLENBQUMrRixZQUFZLENBQUN2RyxLQUFLLENBQUN3RyxLQUFNLENBQUUsQ0FBQyxHQUFHLENBQUM7SUFFdkgsSUFBSSxDQUFDTyxhQUFhLENBQUVwRyxNQUFNLEVBQUVrRyxDQUFFLENBQUM7RUFDakM7O0VBRUE7QUFDRjtBQUNBO0VBQ1lFLGFBQWFBLENBQUVwRyxNQUFnQixFQUFFa0csQ0FBUyxFQUFTO0lBQzNELElBQUlULFFBQVEsR0FBRyxDQUFDO0lBRWhCekYsTUFBTSxHQUFHc0csQ0FBQyxDQUFDQyxNQUFNLENBQUV2RyxNQUFNLEVBQUVILElBQUksSUFBSSxDQUFDQSxJQUFJLENBQUN3RCxjQUFjLENBQUNoRSxLQUFNLENBQUM7SUFFL0RXLE1BQU0sQ0FBQ3NCLE9BQU8sQ0FBRXpCLElBQUksSUFBSTtNQUN0QkEsSUFBSSxDQUFDNkYsTUFBTSxDQUFDQyxnQkFBZ0IsQ0FBRU8sQ0FBQyxFQUFFVCxRQUFRLEdBQUc1RixJQUFJLENBQUMrRixZQUFZLENBQUN2RyxLQUFLLENBQUNtSCxNQUFNLEdBQUcsQ0FBRSxDQUFDO01BQ2hGZixRQUFRLElBQUk1RixJQUFJLENBQUMrRixZQUFZLENBQUN2RyxLQUFLLENBQUNtSCxNQUFNO01BQzFDM0csSUFBSSxDQUFDaUcsU0FBUyxDQUFDLENBQUM7TUFDaEIsSUFBSSxDQUFDL0csTUFBTSxDQUFDd0csdUJBQXVCLENBQUUxRixJQUFJLENBQUNZLElBQUssQ0FBQztNQUNoRFosSUFBSSxDQUFDa0csa0JBQWtCLENBQUNwRixJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFoRyxxQkFBcUIsQ0FBQzhMLFFBQVEsQ0FBRSxzQkFBc0IsRUFBRTlLLG9CQUFxQixDQUFDIn0=