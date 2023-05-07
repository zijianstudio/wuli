// Copyright 2016-2022, University of Colorado Boulder

/**
 * Responsible for the model associated with each mass.
 *
 * @author Matt Pennington (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import Easing from '../../../../twixt/js/Easing.js';
import massesAndSprings from '../../massesAndSprings.js';
import MassesAndSpringsConstants from '../MassesAndSpringsConstants.js';
import Spring from './Spring.js';

// constants
const HEIGHT_RATIO = 2.5;
const SCALING_FACTOR = 4; // scales the radius to desired size

class Mass {
  /**
   * @param {number} massValue:  mass in kg
   * @param {number} xPosition - starting x-coordinate of the mass object, offset from the first spring position
   * @param {Color} color: color of shown mass
   * @param {Property.<number>} gravityProperty - the gravity Property from the model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(massValue, xPosition, color, gravityProperty, tandem, options) {
    assert && assert(massValue > 0, 'Mass must be greater than 0'); // To prevent divide by 0 errors

    options = merge({
      adjustable: false,
      mysteryLabel: false,
      icon: false,
      // Determines whether this mass will be displayed as an icon.
      density: 80,
      // Constant used to keep all of our masses consistent in the model (kg/m^2).
      color: color,
      zeroReferencePoint: 0 // Height of the mass when it is resting on the shelf (m).
    }, options);

    // @public Non-Property attributes
    this.adjustable = options.adjustable;
    this.mysteryLabel = options.mysteryLabel;
    this.icon = options.icon;
    this.color = color.value;
    this.zeroReferencePoint = options.zeroReferencePoint;

    // @public (read-only) {Property.<number>} mass of mass object in kg
    this.massProperty = new NumberProperty(massValue);

    // @public {Property.<number>} (read-write) radius of the massNode is dependent on its mass value
    this.radiusProperty = new DerivedProperty([this.massProperty], massValue => Math.pow(massValue / (options.density * HEIGHT_RATIO * Math.PI), 1 / 2) * SCALING_FACTOR);

    // @public {number}
    this.mass = massValue;

    // @public {Property.<number>} height in meters. Measured from bottom of mass object not screen.
    this.cylinderHeightProperty = new DerivedProperty([this.radiusProperty], radius => radius * HEIGHT_RATIO);
    this.cylinderHeightProperty.link(cylinderHeight => {
      this.zeroReferencePoint = -cylinderHeight / 2;
    });

    // @public {Property.<number>} total height of the mass, including its hook
    this.heightProperty = new DerivedProperty([this.cylinderHeightProperty], cylinderHeight => cylinderHeight + MassesAndSpringsConstants.HOOK_HEIGHT);

    // @public {Tandem} (read-only) Used for constructing tandems for corresponding view nodes.
    this.massTandem = tandem;

    // @public - the position of a mass is the center top of the model object.
    this.positionProperty = new Vector2Property(new Vector2(xPosition, this.heightProperty.value + MassesAndSpringsConstants.SHELF_HEIGHT), {
      tandem: tandem.createTandem('positionProperty')
    });

    // @public {DerivedProperty.<Vector2>} the position of the mass's center of mass.
    this.centerOfMassPositionProperty = new DerivedProperty([this.positionProperty, this.cylinderHeightProperty], (position, cylinderHeight) => new Vector2(position.x, position.y - cylinderHeight / 2 - MassesAndSpringsConstants.HOOK_HEIGHT));

    // @private {Vector2}
    this.initialPosition = this.positionProperty.initialValue;

    // @public {Property.<boolean>} indicates whether this mass is currently user controlled
    this.userControlledProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('userControlledProperty')
    });

    // @private {Property.<boolean>} whether the mass is animating after being released and not attached to a spring
    this.isAnimatingProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('isAnimatingProperty')
    });

    // @public {Property.<boolean>} indicates whether the mass is resting on its shelf.
    this.onShelfProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('onShelfProperty')
    });

    // @public {Property.<number>} vertical velocity of mass
    this.verticalVelocityProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('verticalVelocityProperty'),
      units: 'm/s',
      range: new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 0)
    });

    // @public {Property.<number>} vertical acceleration of the mass
    this.gravityProperty = gravityProperty;

    // @public {Property.<Spring|null>}  spring that the mass is attached to
    this.springProperty = new Property(null, {
      tandem: tandem.createTandem('springProperty'),
      phetioValueType: NullableIO(Spring.SpringIO)
    });

    // @public {Property.<number>} The force of the attached spring or 0 if unattached
    this.springForceProperty = new DynamicProperty(this.springProperty, {
      derive: 'springForceProperty',
      defaultValue: 0
    });

    // @public {Property.<number>} Net force applied to mass
    this.netForceProperty = new DerivedProperty([this.springForceProperty, this.massProperty, this.gravityProperty], (springForce, massValue, gravity) => springForce - massValue * gravity);

    // @public {Property.<number>} vertical acceleration of the mass
    this.accelerationProperty = new DerivedProperty([this.netForceProperty, this.massProperty], (netForce, mass) => netForce / mass);

    // @public {Property.<number>} Kinetic energy of the mass
    this.kineticEnergyProperty = new DerivedProperty([this.massProperty, this.verticalVelocityProperty, this.userControlledProperty], (mass, velocity, userControlled) => userControlled ? 0 : 0.5 * mass * Math.pow(velocity, 2));

    // @public {Property.<number>} Gravitational potential energy of the mass
    this.gravitationalPotentialEnergyProperty = new DerivedProperty([this.massProperty, this.gravityProperty, this.positionProperty], (mass, gravity, position) => {
      // The height used is determined based on the height of the shelf the masses rest on.
      const heightFromZero = position.y - options.zeroReferencePoint - this.heightProperty.value;
      return mass * gravity * heightFromZero;
    });

    // @public {Property.<number>} Kinetic energy of the mass
    this.elasticPotentialEnergyProperty = new DynamicProperty(this.springProperty, {
      derive: 'elasticPotentialEnergyProperty',
      defaultValue: 0
    });

    // @public {Property.<number>} (read-only) Total energy of the mass
    this.totalEnergyProperty = new DerivedProperty([this.kineticEnergyProperty, this.gravitationalPotentialEnergyProperty, this.elasticPotentialEnergyProperty], (kineticEnergy, gravitationalPotentialEnergy, elasticPotentialEnergy) => kineticEnergy + gravitationalPotentialEnergy + elasticPotentialEnergy);

    // @public {Property.<number>} Total energy of our spring system when it is initialized
    this.initialTotalEnergyProperty = new NumberProperty(0);

    // @public {Property.<number>} Thermal energy of the mass
    this.thermalEnergyProperty = new DerivedProperty([this.initialTotalEnergyProperty, this.totalEnergyProperty], (initialEnergy, totalEnergy) => {
      // Preserving energy here so when damping is zero the thermal energy doesn't change.
      if (this.springProperty.value && this.springProperty.value.dampingCoefficientProperty.value === 0) {
        this.preserveThermalEnergy = true;
      }
      return initialEnergy - totalEnergy;
    });

    // Used to determine when a peak is hit.
    this.verticalVelocityProperty.lazyLink((oldVelocity, newVelocity) => {
      if (this.springProperty.value) {
        if (Math.sign(oldVelocity) !== Math.sign(newVelocity) && Math.sign(oldVelocity)) {
          // @param {number} Emitter for peek during first upwards peek
          this.springProperty.value.peakEmitter.emit(1);
        }
        if (Math.sign(oldVelocity) !== Math.sign(newVelocity.y) && !Math.sign(oldVelocity)) {
          // @param {number} Emitter for peek during second downwards peek
          this.springProperty.value.peakEmitter.emit(-1);
        }
      }
    });
    this.userControlledProperty.link(userControlled => {
      if (this.springProperty.value) {
        // If the user grabs an attached mass the mass displacement should reset. Used for period trace.
        this.springProperty.value.massEquilibriumDisplacementProperty.reset();
      }
      if (!userControlled && this.springProperty.get()) {
        // When a user drags an attached mass it is as if they are restarting the spring system
        this.initialTotalEnergyProperty.set(this.kineticEnergyProperty.get() + this.gravitationalPotentialEnergyProperty.get() + this.elasticPotentialEnergyProperty.get());
      }
      if (userControlled) {
        this.onShelfProperty.set(false);
        this.verticalVelocityProperty.reset();
      }
    });

    // @private {boolean} Flag used to determine whether we are preserving the thermal energy.
    this.preserveThermalEnergy = true;

    // As the total energy changes we can derive the thermal energy as being the energy lost from the system
    this.totalEnergyProperty.link((newTotalEnergy, oldTotalEnergy) => {
      if (this.userControlledProperty.get()) {
        // If a user is dragging the mass we remove the thermal energy.
        this.initialTotalEnergyProperty.set(newTotalEnergy);
      }

      // We can preserve thermal energy by adding any change to total energy to the initial energy,
      // as long as it is not in its natural oscillation
      else if (this.preserveThermalEnergy) {
        this.initialTotalEnergyProperty.value += newTotalEnergy - oldTotalEnergy;
      }
    });

    // Used for animating the motion of a mass being released and not attached to the spring
    // @private {Vector2|null}
    this.animationStartPosition = null;

    // @private {Vector2|null}
    this.animationEndPosition = null;

    // @private {number} Valid values 0 <= x <= 1. Used to adjust rate of animation completion.
    this.animationProgress = 0;

    // The mass is considered to be animating if we are not controlling it and it isn't attached to a spring.
    Multilink.lazyMultilink([this.userControlledProperty, this.springProperty], () => {
      this.isAnimatingProperty.set(false);
    });

    // Set the equilibrium position when a mass value changes.
    // We do a similar process in Spring.js when the mass is attached to the spring.
    this.massProperty.link(value => {
      const spring = this.springProperty.value;
      if (spring) {
        // springExtension = mg/k
        const springExtensionValue = value * spring.gravityProperty.value / spring.springConstantProperty.value;
        spring.equilibriumYPositionProperty.set(spring.positionProperty.get().y - spring.naturalRestingLengthProperty.value - springExtensionValue);
        spring.massEquilibriumYPositionProperty.set(spring.positionProperty.get().y - spring.naturalRestingLengthProperty.value - springExtensionValue - this.heightProperty.value / 2);
      }
    });
  }

  /**
   * Responsible for mass falling or animating without being attached to spring.
   * @param {number} gravity
   * @param {number} floorY
   * @param {number} dt
   * @param {number} animationDt - dt used for the sliding animation after a mass is released
   *
   * @public
   */
  step(gravity, floorY, dt, animationDt) {
    const floorPosition = floorY + this.heightProperty.value;
    if (this.isAnimatingProperty.value) {
      const distance = this.animationStartPosition.distance(this.animationEndPosition);
      if (distance > 0) {
        // Adjust the speed of animation depending on the distance between the start and end
        const animationSpeed = Math.sqrt(2 / distance);

        // Responsible for animating a horizontal motion when the mass is released and not attached to a spring.
        this.animationProgress = Math.min(1, this.animationProgress + animationDt * animationSpeed);
        const ratio = Easing.CUBIC_IN_OUT.value(this.animationProgress);
        this.positionProperty.set(new Vector2(this.animationStartPosition.blend(this.animationEndPosition, ratio).x, floorPosition));
      } else {
        this.animationProgress = 1;
      }
      if (this.animationProgress === 1) {
        this.onShelfProperty.set(true);
        this.isAnimatingProperty.set(false);
      }
    }

    // If we're not animating/controlled or attached to a spring, we'll fall due to gravity
    else if (this.springProperty.get() === null && !this.userControlledProperty.get()) {
      const oldY = this.positionProperty.get().y;
      const newVerticalVelocity = this.verticalVelocityProperty.get() - gravity * dt;
      const newY = oldY + (this.verticalVelocityProperty.get() + newVerticalVelocity) * dt / 2;
      if (newY < floorPosition) {
        // if we hit the ground stop falling
        this.positionProperty.set(new Vector2(this.positionProperty.get().x, floorPosition));
        this.verticalVelocityProperty.set(0);

        // Responsible for animating the mass back to its initial position
        this.animationProgress = 0;
        this.animationStartPosition = this.positionProperty.value;
        this.animationEndPosition = new Vector2(this.initialPosition.x, this.positionProperty.value.y);
        if (this.animationStartPosition.distance(this.animationEndPosition) >= 1e-7) {
          this.isAnimatingProperty.set(true);
        } else {
          this.onShelfProperty.set(true);
        }
      } else {
        this.verticalVelocityProperty.set(newVerticalVelocity);
        this.positionProperty.set(new Vector2(this.positionProperty.get().x, newY));
      }
    }
  }

  /**
   * Detaches the mass from the spring.
   *
   * @public
   */
  detach() {
    this.verticalVelocityProperty.set(0);
    this.springProperty.set(null);
  }

  /**
   * @public
   */
  reset() {
    this.positionProperty.reset();
    this.onShelfProperty.reset();
    this.userControlledProperty.reset();
    this.springProperty.reset();
    this.verticalVelocityProperty.reset();
    this.massProperty.reset();
    this.isAnimatingProperty.reset();
    this.initialTotalEnergyProperty.reset();
  }
}
massesAndSprings.register('Mass', Mass);
export default Mass;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJEeW5hbWljUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiUmFuZ2UiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwibWVyZ2UiLCJOdWxsYWJsZUlPIiwiRWFzaW5nIiwibWFzc2VzQW5kU3ByaW5ncyIsIk1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMiLCJTcHJpbmciLCJIRUlHSFRfUkFUSU8iLCJTQ0FMSU5HX0ZBQ1RPUiIsIk1hc3MiLCJjb25zdHJ1Y3RvciIsIm1hc3NWYWx1ZSIsInhQb3NpdGlvbiIsImNvbG9yIiwiZ3Jhdml0eVByb3BlcnR5IiwidGFuZGVtIiwib3B0aW9ucyIsImFzc2VydCIsImFkanVzdGFibGUiLCJteXN0ZXJ5TGFiZWwiLCJpY29uIiwiZGVuc2l0eSIsInplcm9SZWZlcmVuY2VQb2ludCIsInZhbHVlIiwibWFzc1Byb3BlcnR5IiwicmFkaXVzUHJvcGVydHkiLCJNYXRoIiwicG93IiwiUEkiLCJtYXNzIiwiY3lsaW5kZXJIZWlnaHRQcm9wZXJ0eSIsInJhZGl1cyIsImxpbmsiLCJjeWxpbmRlckhlaWdodCIsImhlaWdodFByb3BlcnR5IiwiSE9PS19IRUlHSFQiLCJtYXNzVGFuZGVtIiwicG9zaXRpb25Qcm9wZXJ0eSIsIlNIRUxGX0hFSUdIVCIsImNyZWF0ZVRhbmRlbSIsImNlbnRlck9mTWFzc1Bvc2l0aW9uUHJvcGVydHkiLCJwb3NpdGlvbiIsIngiLCJ5IiwiaW5pdGlhbFBvc2l0aW9uIiwiaW5pdGlhbFZhbHVlIiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImlzQW5pbWF0aW5nUHJvcGVydHkiLCJvblNoZWxmUHJvcGVydHkiLCJ2ZXJ0aWNhbFZlbG9jaXR5UHJvcGVydHkiLCJ1bml0cyIsInJhbmdlIiwiTnVtYmVyIiwiTkVHQVRJVkVfSU5GSU5JVFkiLCJQT1NJVElWRV9JTkZJTklUWSIsInNwcmluZ1Byb3BlcnR5IiwicGhldGlvVmFsdWVUeXBlIiwiU3ByaW5nSU8iLCJzcHJpbmdGb3JjZVByb3BlcnR5IiwiZGVyaXZlIiwiZGVmYXVsdFZhbHVlIiwibmV0Rm9yY2VQcm9wZXJ0eSIsInNwcmluZ0ZvcmNlIiwiZ3Jhdml0eSIsImFjY2VsZXJhdGlvblByb3BlcnR5IiwibmV0Rm9yY2UiLCJraW5ldGljRW5lcmd5UHJvcGVydHkiLCJ2ZWxvY2l0eSIsInVzZXJDb250cm9sbGVkIiwiZ3Jhdml0YXRpb25hbFBvdGVudGlhbEVuZXJneVByb3BlcnR5IiwiaGVpZ2h0RnJvbVplcm8iLCJlbGFzdGljUG90ZW50aWFsRW5lcmd5UHJvcGVydHkiLCJ0b3RhbEVuZXJneVByb3BlcnR5Iiwia2luZXRpY0VuZXJneSIsImdyYXZpdGF0aW9uYWxQb3RlbnRpYWxFbmVyZ3kiLCJlbGFzdGljUG90ZW50aWFsRW5lcmd5IiwiaW5pdGlhbFRvdGFsRW5lcmd5UHJvcGVydHkiLCJ0aGVybWFsRW5lcmd5UHJvcGVydHkiLCJpbml0aWFsRW5lcmd5IiwidG90YWxFbmVyZ3kiLCJkYW1waW5nQ29lZmZpY2llbnRQcm9wZXJ0eSIsInByZXNlcnZlVGhlcm1hbEVuZXJneSIsImxhenlMaW5rIiwib2xkVmVsb2NpdHkiLCJuZXdWZWxvY2l0eSIsInNpZ24iLCJwZWFrRW1pdHRlciIsImVtaXQiLCJtYXNzRXF1aWxpYnJpdW1EaXNwbGFjZW1lbnRQcm9wZXJ0eSIsInJlc2V0IiwiZ2V0Iiwic2V0IiwibmV3VG90YWxFbmVyZ3kiLCJvbGRUb3RhbEVuZXJneSIsImFuaW1hdGlvblN0YXJ0UG9zaXRpb24iLCJhbmltYXRpb25FbmRQb3NpdGlvbiIsImFuaW1hdGlvblByb2dyZXNzIiwibGF6eU11bHRpbGluayIsInNwcmluZyIsInNwcmluZ0V4dGVuc2lvblZhbHVlIiwic3ByaW5nQ29uc3RhbnRQcm9wZXJ0eSIsImVxdWlsaWJyaXVtWVBvc2l0aW9uUHJvcGVydHkiLCJuYXR1cmFsUmVzdGluZ0xlbmd0aFByb3BlcnR5IiwibWFzc0VxdWlsaWJyaXVtWVBvc2l0aW9uUHJvcGVydHkiLCJzdGVwIiwiZmxvb3JZIiwiZHQiLCJhbmltYXRpb25EdCIsImZsb29yUG9zaXRpb24iLCJkaXN0YW5jZSIsImFuaW1hdGlvblNwZWVkIiwic3FydCIsIm1pbiIsInJhdGlvIiwiQ1VCSUNfSU5fT1VUIiwiYmxlbmQiLCJvbGRZIiwibmV3VmVydGljYWxWZWxvY2l0eSIsIm5ld1kiLCJkZXRhY2giLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1hc3MuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVzcG9uc2libGUgZm9yIHRoZSBtb2RlbCBhc3NvY2lhdGVkIHdpdGggZWFjaCBtYXNzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hdHQgUGVubmluZ3RvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRHluYW1pY1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRHluYW1pY1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBtYXNzZXNBbmRTcHJpbmdzIGZyb20gJy4uLy4uL21hc3Nlc0FuZFNwcmluZ3MuanMnO1xyXG5pbXBvcnQgTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cyBmcm9tICcuLi9NYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFNwcmluZyBmcm9tICcuL1NwcmluZy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgSEVJR0hUX1JBVElPID0gMi41O1xyXG5jb25zdCBTQ0FMSU5HX0ZBQ1RPUiA9IDQ7IC8vIHNjYWxlcyB0aGUgcmFkaXVzIHRvIGRlc2lyZWQgc2l6ZVxyXG5cclxuY2xhc3MgTWFzcyB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1hc3NWYWx1ZTogIG1hc3MgaW4ga2dcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFBvc2l0aW9uIC0gc3RhcnRpbmcgeC1jb29yZGluYXRlIG9mIHRoZSBtYXNzIG9iamVjdCwgb2Zmc2V0IGZyb20gdGhlIGZpcnN0IHNwcmluZyBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7Q29sb3J9IGNvbG9yOiBjb2xvciBvZiBzaG93biBtYXNzXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48bnVtYmVyPn0gZ3Jhdml0eVByb3BlcnR5IC0gdGhlIGdyYXZpdHkgUHJvcGVydHkgZnJvbSB0aGUgbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtYXNzVmFsdWUsIHhQb3NpdGlvbiwgY29sb3IsIGdyYXZpdHlQcm9wZXJ0eSwgdGFuZGVtLCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWFzc1ZhbHVlID4gMCwgJ01hc3MgbXVzdCBiZSBncmVhdGVyIHRoYW4gMCcgKTsgLy8gVG8gcHJldmVudCBkaXZpZGUgYnkgMCBlcnJvcnNcclxuXHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGFkanVzdGFibGU6IGZhbHNlLFxyXG4gICAgICBteXN0ZXJ5TGFiZWw6IGZhbHNlLFxyXG4gICAgICBpY29uOiBmYWxzZSwgLy8gRGV0ZXJtaW5lcyB3aGV0aGVyIHRoaXMgbWFzcyB3aWxsIGJlIGRpc3BsYXllZCBhcyBhbiBpY29uLlxyXG4gICAgICBkZW5zaXR5OiA4MCwgLy8gQ29uc3RhbnQgdXNlZCB0byBrZWVwIGFsbCBvZiBvdXIgbWFzc2VzIGNvbnNpc3RlbnQgaW4gdGhlIG1vZGVsIChrZy9tXjIpLlxyXG4gICAgICBjb2xvcjogY29sb3IsXHJcbiAgICAgIHplcm9SZWZlcmVuY2VQb2ludDogMCAvLyBIZWlnaHQgb2YgdGhlIG1hc3Mgd2hlbiBpdCBpcyByZXN0aW5nIG9uIHRoZSBzaGVsZiAobSkuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyBOb24tUHJvcGVydHkgYXR0cmlidXRlc1xyXG4gICAgdGhpcy5hZGp1c3RhYmxlID0gb3B0aW9ucy5hZGp1c3RhYmxlO1xyXG4gICAgdGhpcy5teXN0ZXJ5TGFiZWwgPSBvcHRpb25zLm15c3RlcnlMYWJlbDtcclxuICAgIHRoaXMuaWNvbiA9IG9wdGlvbnMuaWNvbjtcclxuICAgIHRoaXMuY29sb3IgPSBjb2xvci52YWx1ZTtcclxuICAgIHRoaXMuemVyb1JlZmVyZW5jZVBvaW50ID0gb3B0aW9ucy56ZXJvUmVmZXJlbmNlUG9pbnQ7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7UHJvcGVydHkuPG51bWJlcj59IG1hc3Mgb2YgbWFzcyBvYmplY3QgaW4ga2dcclxuICAgIHRoaXMubWFzc1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBtYXNzVmFsdWUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gKHJlYWQtd3JpdGUpIHJhZGl1cyBvZiB0aGUgbWFzc05vZGUgaXMgZGVwZW5kZW50IG9uIGl0cyBtYXNzIHZhbHVlXHJcbiAgICB0aGlzLnJhZGl1c1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLm1hc3NQcm9wZXJ0eSBdLCBtYXNzVmFsdWUgPT4gTWF0aC5wb3coICggbWFzc1ZhbHVlICkgLyAoIG9wdGlvbnMuZGVuc2l0eSAqIEhFSUdIVF9SQVRJTyAqIE1hdGguUEkgKSwgMSAvIDIgKSAqIFNDQUxJTkdfRkFDVE9SICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5tYXNzID0gbWFzc1ZhbHVlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSBoZWlnaHQgaW4gbWV0ZXJzLiBNZWFzdXJlZCBmcm9tIGJvdHRvbSBvZiBtYXNzIG9iamVjdCBub3Qgc2NyZWVuLlxyXG4gICAgdGhpcy5jeWxpbmRlckhlaWdodFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnJhZGl1c1Byb3BlcnR5IF0sXHJcbiAgICAgIHJhZGl1cyA9PiByYWRpdXMgKiBIRUlHSFRfUkFUSU8gKTtcclxuXHJcbiAgICB0aGlzLmN5bGluZGVySGVpZ2h0UHJvcGVydHkubGluayggY3lsaW5kZXJIZWlnaHQgPT4ge1xyXG4gICAgICB0aGlzLnplcm9SZWZlcmVuY2VQb2ludCA9IC1jeWxpbmRlckhlaWdodCAvIDI7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IHRvdGFsIGhlaWdodCBvZiB0aGUgbWFzcywgaW5jbHVkaW5nIGl0cyBob29rXHJcbiAgICB0aGlzLmhlaWdodFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmN5bGluZGVySGVpZ2h0UHJvcGVydHkgXSwgY3lsaW5kZXJIZWlnaHQgPT4gY3lsaW5kZXJIZWlnaHQgKyBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLkhPT0tfSEVJR0hUICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VGFuZGVtfSAocmVhZC1vbmx5KSBVc2VkIGZvciBjb25zdHJ1Y3RpbmcgdGFuZGVtcyBmb3IgY29ycmVzcG9uZGluZyB2aWV3IG5vZGVzLlxyXG4gICAgdGhpcy5tYXNzVGFuZGVtID0gdGFuZGVtO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSB0aGUgcG9zaXRpb24gb2YgYSBtYXNzIGlzIHRoZSBjZW50ZXIgdG9wIG9mIHRoZSBtb2RlbCBvYmplY3QuXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KFxyXG4gICAgICBuZXcgVmVjdG9yMiggeFBvc2l0aW9uLCB0aGlzLmhlaWdodFByb3BlcnR5LnZhbHVlICsgTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5TSEVMRl9IRUlHSFQgKSwge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Bvc2l0aW9uUHJvcGVydHknIClcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Rlcml2ZWRQcm9wZXJ0eS48VmVjdG9yMj59IHRoZSBwb3NpdGlvbiBvZiB0aGUgbWFzcydzIGNlbnRlciBvZiBtYXNzLlxyXG4gICAgdGhpcy5jZW50ZXJPZk1hc3NQb3NpdGlvblByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnBvc2l0aW9uUHJvcGVydHksIHRoaXMuY3lsaW5kZXJIZWlnaHRQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHBvc2l0aW9uLCBjeWxpbmRlckhlaWdodCApID0+IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgIHBvc2l0aW9uLngsXHJcbiAgICAgICAgcG9zaXRpb24ueSAtXHJcbiAgICAgICAgY3lsaW5kZXJIZWlnaHQgLyAyIC1cclxuICAgICAgICBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLkhPT0tfSEVJR0hUXHJcbiAgICAgICkgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yMn1cclxuICAgIHRoaXMuaW5pdGlhbFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LmluaXRpYWxWYWx1ZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGluZGljYXRlcyB3aGV0aGVyIHRoaXMgbWFzcyBpcyBjdXJyZW50bHkgdXNlciBjb250cm9sbGVkXHJcbiAgICB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd1c2VyQ29udHJvbGxlZFByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1Byb3BlcnR5Ljxib29sZWFuPn0gd2hldGhlciB0aGUgbWFzcyBpcyBhbmltYXRpbmcgYWZ0ZXIgYmVpbmcgcmVsZWFzZWQgYW5kIG5vdCBhdHRhY2hlZCB0byBhIHNwcmluZ1xyXG4gICAgdGhpcy5pc0FuaW1hdGluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXNBbmltYXRpbmdQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gaW5kaWNhdGVzIHdoZXRoZXIgdGhlIG1hc3MgaXMgcmVzdGluZyBvbiBpdHMgc2hlbGYuXHJcbiAgICB0aGlzLm9uU2hlbGZQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnb25TaGVsZlByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IHZlcnRpY2FsIHZlbG9jaXR5IG9mIG1hc3NcclxuICAgIHRoaXMudmVydGljYWxWZWxvY2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZlcnRpY2FsVmVsb2NpdHlQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdtL3MnLFxyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgMCApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IHZlcnRpY2FsIGFjY2VsZXJhdGlvbiBvZiB0aGUgbWFzc1xyXG4gICAgdGhpcy5ncmF2aXR5UHJvcGVydHkgPSBncmF2aXR5UHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPFNwcmluZ3xudWxsPn0gIHNwcmluZyB0aGF0IHRoZSBtYXNzIGlzIGF0dGFjaGVkIHRvXHJcbiAgICB0aGlzLnNwcmluZ1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NwcmluZ1Byb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bGxhYmxlSU8oIFNwcmluZy5TcHJpbmdJTyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IFRoZSBmb3JjZSBvZiB0aGUgYXR0YWNoZWQgc3ByaW5nIG9yIDAgaWYgdW5hdHRhY2hlZFxyXG4gICAgdGhpcy5zcHJpbmdGb3JjZVByb3BlcnR5ID0gbmV3IER5bmFtaWNQcm9wZXJ0eSggdGhpcy5zcHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBkZXJpdmU6ICdzcHJpbmdGb3JjZVByb3BlcnR5JyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiAwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IE5ldCBmb3JjZSBhcHBsaWVkIHRvIG1hc3NcclxuICAgIHRoaXMubmV0Rm9yY2VQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5zcHJpbmdGb3JjZVByb3BlcnR5LCB0aGlzLm1hc3NQcm9wZXJ0eSwgdGhpcy5ncmF2aXR5UHJvcGVydHkgXSxcclxuICAgICAgKCBzcHJpbmdGb3JjZSwgbWFzc1ZhbHVlLCBncmF2aXR5ICkgPT4gc3ByaW5nRm9yY2UgLSBtYXNzVmFsdWUgKiBncmF2aXR5ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IHZlcnRpY2FsIGFjY2VsZXJhdGlvbiBvZiB0aGUgbWFzc1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb25Qcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5uZXRGb3JjZVByb3BlcnR5LCB0aGlzLm1hc3NQcm9wZXJ0eSBdLFxyXG4gICAgICAoIG5ldEZvcmNlLCBtYXNzICkgPT4gbmV0Rm9yY2UgLyBtYXNzICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IEtpbmV0aWMgZW5lcmd5IG9mIHRoZSBtYXNzXHJcbiAgICB0aGlzLmtpbmV0aWNFbmVyZ3lQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgdGhpcy5tYXNzUHJvcGVydHksIHRoaXMudmVydGljYWxWZWxvY2l0eVByb3BlcnR5LCB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkgXSxcclxuICAgICAgKCBtYXNzLCB2ZWxvY2l0eSwgdXNlckNvbnRyb2xsZWQgKSA9PiB1c2VyQ29udHJvbGxlZCA/IDAgOiAwLjUgKiBtYXNzICogTWF0aC5wb3coIHZlbG9jaXR5LCAyICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gR3Jhdml0YXRpb25hbCBwb3RlbnRpYWwgZW5lcmd5IG9mIHRoZSBtYXNzXHJcbiAgICB0aGlzLmdyYXZpdGF0aW9uYWxQb3RlbnRpYWxFbmVyZ3lQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgdGhpcy5tYXNzUHJvcGVydHksIHRoaXMuZ3Jhdml0eVByb3BlcnR5LCB0aGlzLnBvc2l0aW9uUHJvcGVydHkgXSxcclxuICAgICAgKCBtYXNzLCBncmF2aXR5LCBwb3NpdGlvbiApID0+IHtcclxuXHJcbiAgICAgICAgLy8gVGhlIGhlaWdodCB1c2VkIGlzIGRldGVybWluZWQgYmFzZWQgb24gdGhlIGhlaWdodCBvZiB0aGUgc2hlbGYgdGhlIG1hc3NlcyByZXN0IG9uLlxyXG4gICAgICAgIGNvbnN0IGhlaWdodEZyb21aZXJvID0gcG9zaXRpb24ueSAtIG9wdGlvbnMuemVyb1JlZmVyZW5jZVBvaW50IC0gdGhpcy5oZWlnaHRQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICByZXR1cm4gKCBtYXNzICogZ3Jhdml0eSAqICggaGVpZ2h0RnJvbVplcm8gKSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IEtpbmV0aWMgZW5lcmd5IG9mIHRoZSBtYXNzXHJcbiAgICB0aGlzLmVsYXN0aWNQb3RlbnRpYWxFbmVyZ3lQcm9wZXJ0eSA9IG5ldyBEeW5hbWljUHJvcGVydHkoIHRoaXMuc3ByaW5nUHJvcGVydHksIHtcclxuICAgICAgZGVyaXZlOiAnZWxhc3RpY1BvdGVudGlhbEVuZXJneVByb3BlcnR5JyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiAwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IChyZWFkLW9ubHkpIFRvdGFsIGVuZXJneSBvZiB0aGUgbWFzc1xyXG4gICAgdGhpcy50b3RhbEVuZXJneVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggW1xyXG4gICAgICAgIHRoaXMua2luZXRpY0VuZXJneVByb3BlcnR5LFxyXG4gICAgICAgIHRoaXMuZ3Jhdml0YXRpb25hbFBvdGVudGlhbEVuZXJneVByb3BlcnR5LFxyXG4gICAgICAgIHRoaXMuZWxhc3RpY1BvdGVudGlhbEVuZXJneVByb3BlcnR5XHJcbiAgICAgIF0sXHJcbiAgICAgICgga2luZXRpY0VuZXJneSwgZ3Jhdml0YXRpb25hbFBvdGVudGlhbEVuZXJneSwgZWxhc3RpY1BvdGVudGlhbEVuZXJneSApID0+IGtpbmV0aWNFbmVyZ3kgKyBncmF2aXRhdGlvbmFsUG90ZW50aWFsRW5lcmd5ICsgZWxhc3RpY1BvdGVudGlhbEVuZXJneVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gVG90YWwgZW5lcmd5IG9mIG91ciBzcHJpbmcgc3lzdGVtIHdoZW4gaXQgaXMgaW5pdGlhbGl6ZWRcclxuICAgIHRoaXMuaW5pdGlhbFRvdGFsRW5lcmd5UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gVGhlcm1hbCBlbmVyZ3kgb2YgdGhlIG1hc3NcclxuICAgIHRoaXMudGhlcm1hbEVuZXJneVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmluaXRpYWxUb3RhbEVuZXJneVByb3BlcnR5LCB0aGlzLnRvdGFsRW5lcmd5UHJvcGVydHkgXSxcclxuICAgICAgKCBpbml0aWFsRW5lcmd5LCB0b3RhbEVuZXJneSApID0+IHtcclxuXHJcbiAgICAgICAgLy8gUHJlc2VydmluZyBlbmVyZ3kgaGVyZSBzbyB3aGVuIGRhbXBpbmcgaXMgemVybyB0aGUgdGhlcm1hbCBlbmVyZ3kgZG9lc24ndCBjaGFuZ2UuXHJcbiAgICAgICAgaWYgKCB0aGlzLnNwcmluZ1Byb3BlcnR5LnZhbHVlICYmIHRoaXMuc3ByaW5nUHJvcGVydHkudmFsdWUuZGFtcGluZ0NvZWZmaWNpZW50UHJvcGVydHkudmFsdWUgPT09IDAgKSB7XHJcbiAgICAgICAgICB0aGlzLnByZXNlcnZlVGhlcm1hbEVuZXJneSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbml0aWFsRW5lcmd5IC0gdG90YWxFbmVyZ3k7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBVc2VkIHRvIGRldGVybWluZSB3aGVuIGEgcGVhayBpcyBoaXQuXHJcbiAgICB0aGlzLnZlcnRpY2FsVmVsb2NpdHlQcm9wZXJ0eS5sYXp5TGluayggKCBvbGRWZWxvY2l0eSwgbmV3VmVsb2NpdHkgKSA9PiB7XHJcbiAgICAgIGlmICggdGhpcy5zcHJpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICBpZiAoIE1hdGguc2lnbiggb2xkVmVsb2NpdHkgKSAhPT0gTWF0aC5zaWduKCBuZXdWZWxvY2l0eSApICYmIE1hdGguc2lnbiggb2xkVmVsb2NpdHkgKSApIHtcclxuXHJcbiAgICAgICAgICAvLyBAcGFyYW0ge251bWJlcn0gRW1pdHRlciBmb3IgcGVlayBkdXJpbmcgZmlyc3QgdXB3YXJkcyBwZWVrXHJcbiAgICAgICAgICB0aGlzLnNwcmluZ1Byb3BlcnR5LnZhbHVlLnBlYWtFbWl0dGVyLmVtaXQoIDEgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBNYXRoLnNpZ24oIG9sZFZlbG9jaXR5ICkgIT09IE1hdGguc2lnbiggbmV3VmVsb2NpdHkueSApICYmICFNYXRoLnNpZ24oIG9sZFZlbG9jaXR5ICkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gQHBhcmFtIHtudW1iZXJ9IEVtaXR0ZXIgZm9yIHBlZWsgZHVyaW5nIHNlY29uZCBkb3dud2FyZHMgcGVla1xyXG4gICAgICAgICAgdGhpcy5zcHJpbmdQcm9wZXJ0eS52YWx1ZS5wZWFrRW1pdHRlci5lbWl0KCAtMSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCB1c2VyQ29udHJvbGxlZCA9PiB7XHJcbiAgICAgIGlmICggdGhpcy5zcHJpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgZ3JhYnMgYW4gYXR0YWNoZWQgbWFzcyB0aGUgbWFzcyBkaXNwbGFjZW1lbnQgc2hvdWxkIHJlc2V0LiBVc2VkIGZvciBwZXJpb2QgdHJhY2UuXHJcbiAgICAgICAgdGhpcy5zcHJpbmdQcm9wZXJ0eS52YWx1ZS5tYXNzRXF1aWxpYnJpdW1EaXNwbGFjZW1lbnRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggIXVzZXJDb250cm9sbGVkICYmIHRoaXMuc3ByaW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAgIC8vIFdoZW4gYSB1c2VyIGRyYWdzIGFuIGF0dGFjaGVkIG1hc3MgaXQgaXMgYXMgaWYgdGhleSBhcmUgcmVzdGFydGluZyB0aGUgc3ByaW5nIHN5c3RlbVxyXG4gICAgICAgIHRoaXMuaW5pdGlhbFRvdGFsRW5lcmd5UHJvcGVydHkuc2V0KCB0aGlzLmtpbmV0aWNFbmVyZ3lQcm9wZXJ0eS5nZXQoKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3Jhdml0YXRpb25hbFBvdGVudGlhbEVuZXJneVByb3BlcnR5LmdldCgpICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGFzdGljUG90ZW50aWFsRW5lcmd5UHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHVzZXJDb250cm9sbGVkICkge1xyXG4gICAgICAgIHRoaXMub25TaGVsZlByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgICB0aGlzLnZlcnRpY2FsVmVsb2NpdHlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IEZsYWcgdXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciB3ZSBhcmUgcHJlc2VydmluZyB0aGUgdGhlcm1hbCBlbmVyZ3kuXHJcbiAgICB0aGlzLnByZXNlcnZlVGhlcm1hbEVuZXJneSA9IHRydWU7XHJcblxyXG4gICAgLy8gQXMgdGhlIHRvdGFsIGVuZXJneSBjaGFuZ2VzIHdlIGNhbiBkZXJpdmUgdGhlIHRoZXJtYWwgZW5lcmd5IGFzIGJlaW5nIHRoZSBlbmVyZ3kgbG9zdCBmcm9tIHRoZSBzeXN0ZW1cclxuICAgIHRoaXMudG90YWxFbmVyZ3lQcm9wZXJ0eS5saW5rKCAoIG5ld1RvdGFsRW5lcmd5LCBvbGRUb3RhbEVuZXJneSApID0+IHtcclxuICAgICAgaWYgKCB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgLy8gSWYgYSB1c2VyIGlzIGRyYWdnaW5nIHRoZSBtYXNzIHdlIHJlbW92ZSB0aGUgdGhlcm1hbCBlbmVyZ3kuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsVG90YWxFbmVyZ3lQcm9wZXJ0eS5zZXQoIG5ld1RvdGFsRW5lcmd5ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gV2UgY2FuIHByZXNlcnZlIHRoZXJtYWwgZW5lcmd5IGJ5IGFkZGluZyBhbnkgY2hhbmdlIHRvIHRvdGFsIGVuZXJneSB0byB0aGUgaW5pdGlhbCBlbmVyZ3ksXHJcbiAgICAgIC8vIGFzIGxvbmcgYXMgaXQgaXMgbm90IGluIGl0cyBuYXR1cmFsIG9zY2lsbGF0aW9uXHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLnByZXNlcnZlVGhlcm1hbEVuZXJneSApIHtcclxuICAgICAgICB0aGlzLmluaXRpYWxUb3RhbEVuZXJneVByb3BlcnR5LnZhbHVlICs9IG5ld1RvdGFsRW5lcmd5IC0gb2xkVG90YWxFbmVyZ3k7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBVc2VkIGZvciBhbmltYXRpbmcgdGhlIG1vdGlvbiBvZiBhIG1hc3MgYmVpbmcgcmVsZWFzZWQgYW5kIG5vdCBhdHRhY2hlZCB0byB0aGUgc3ByaW5nXHJcbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yMnxudWxsfVxyXG4gICAgdGhpcy5hbmltYXRpb25TdGFydFBvc2l0aW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yMnxudWxsfVxyXG4gICAgdGhpcy5hbmltYXRpb25FbmRQb3NpdGlvbiA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gVmFsaWQgdmFsdWVzIDAgPD0geCA8PSAxLiBVc2VkIHRvIGFkanVzdCByYXRlIG9mIGFuaW1hdGlvbiBjb21wbGV0aW9uLlxyXG4gICAgdGhpcy5hbmltYXRpb25Qcm9ncmVzcyA9IDA7XHJcblxyXG4gICAgLy8gVGhlIG1hc3MgaXMgY29uc2lkZXJlZCB0byBiZSBhbmltYXRpbmcgaWYgd2UgYXJlIG5vdCBjb250cm9sbGluZyBpdCBhbmQgaXQgaXNuJ3QgYXR0YWNoZWQgdG8gYSBzcHJpbmcuXHJcbiAgICBNdWx0aWxpbmsubGF6eU11bHRpbGluayggWyB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHksIHRoaXMuc3ByaW5nUHJvcGVydHkgXSwgKCkgPT4ge1xyXG4gICAgICB0aGlzLmlzQW5pbWF0aW5nUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFNldCB0aGUgZXF1aWxpYnJpdW0gcG9zaXRpb24gd2hlbiBhIG1hc3MgdmFsdWUgY2hhbmdlcy5cclxuICAgIC8vIFdlIGRvIGEgc2ltaWxhciBwcm9jZXNzIGluIFNwcmluZy5qcyB3aGVuIHRoZSBtYXNzIGlzIGF0dGFjaGVkIHRvIHRoZSBzcHJpbmcuXHJcbiAgICB0aGlzLm1hc3NQcm9wZXJ0eS5saW5rKCB2YWx1ZSA9PiB7XHJcbiAgICAgIGNvbnN0IHNwcmluZyA9IHRoaXMuc3ByaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIGlmICggc3ByaW5nICkge1xyXG5cclxuICAgICAgICAvLyBzcHJpbmdFeHRlbnNpb24gPSBtZy9rXHJcbiAgICAgICAgY29uc3Qgc3ByaW5nRXh0ZW5zaW9uVmFsdWUgPSAoIHZhbHVlICogc3ByaW5nLmdyYXZpdHlQcm9wZXJ0eS52YWx1ZSApIC8gc3ByaW5nLnNwcmluZ0NvbnN0YW50UHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgc3ByaW5nLmVxdWlsaWJyaXVtWVBvc2l0aW9uUHJvcGVydHkuc2V0KFxyXG4gICAgICAgICAgc3ByaW5nLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSAtXHJcbiAgICAgICAgICBzcHJpbmcubmF0dXJhbFJlc3RpbmdMZW5ndGhQcm9wZXJ0eS52YWx1ZSAtXHJcbiAgICAgICAgICBzcHJpbmdFeHRlbnNpb25WYWx1ZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgc3ByaW5nLm1hc3NFcXVpbGlicml1bVlQb3NpdGlvblByb3BlcnR5LnNldChcclxuICAgICAgICAgIHNwcmluZy5wb3NpdGlvblByb3BlcnR5LmdldCgpLnkgLVxyXG4gICAgICAgICAgc3ByaW5nLm5hdHVyYWxSZXN0aW5nTGVuZ3RoUHJvcGVydHkudmFsdWUgLVxyXG4gICAgICAgICAgc3ByaW5nRXh0ZW5zaW9uVmFsdWUgLVxyXG4gICAgICAgICAgdGhpcy5oZWlnaHRQcm9wZXJ0eS52YWx1ZSAvIDIgKTtcclxuXHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBSZXNwb25zaWJsZSBmb3IgbWFzcyBmYWxsaW5nIG9yIGFuaW1hdGluZyB3aXRob3V0IGJlaW5nIGF0dGFjaGVkIHRvIHNwcmluZy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZ3Jhdml0eVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBmbG9vcllcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5pbWF0aW9uRHQgLSBkdCB1c2VkIGZvciB0aGUgc2xpZGluZyBhbmltYXRpb24gYWZ0ZXIgYSBtYXNzIGlzIHJlbGVhc2VkXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZ3Jhdml0eSwgZmxvb3JZLCBkdCwgYW5pbWF0aW9uRHQgKSB7XHJcbiAgICBjb25zdCBmbG9vclBvc2l0aW9uID0gZmxvb3JZICsgdGhpcy5oZWlnaHRQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICBpZiAoIHRoaXMuaXNBbmltYXRpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLmFuaW1hdGlvblN0YXJ0UG9zaXRpb24uZGlzdGFuY2UoIHRoaXMuYW5pbWF0aW9uRW5kUG9zaXRpb24gKTtcclxuICAgICAgaWYgKCBkaXN0YW5jZSA+IDAgKSB7XHJcblxyXG4gICAgICAgIC8vIEFkanVzdCB0aGUgc3BlZWQgb2YgYW5pbWF0aW9uIGRlcGVuZGluZyBvbiB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgc3RhcnQgYW5kIGVuZFxyXG4gICAgICAgIGNvbnN0IGFuaW1hdGlvblNwZWVkID0gTWF0aC5zcXJ0KCAyIC8gZGlzdGFuY2UgKTtcclxuXHJcbiAgICAgICAgLy8gUmVzcG9uc2libGUgZm9yIGFuaW1hdGluZyBhIGhvcml6b250YWwgbW90aW9uIHdoZW4gdGhlIG1hc3MgaXMgcmVsZWFzZWQgYW5kIG5vdCBhdHRhY2hlZCB0byBhIHNwcmluZy5cclxuICAgICAgICB0aGlzLmFuaW1hdGlvblByb2dyZXNzID0gTWF0aC5taW4oIDEsIHRoaXMuYW5pbWF0aW9uUHJvZ3Jlc3MgKyBhbmltYXRpb25EdCAqIGFuaW1hdGlvblNwZWVkICk7XHJcbiAgICAgICAgY29uc3QgcmF0aW8gPSBFYXNpbmcuQ1VCSUNfSU5fT1VULnZhbHVlKCB0aGlzLmFuaW1hdGlvblByb2dyZXNzICk7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnNldChcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCB0aGlzLmFuaW1hdGlvblN0YXJ0UG9zaXRpb24uYmxlbmQoIHRoaXMuYW5pbWF0aW9uRW5kUG9zaXRpb24sIHJhdGlvICkueCwgZmxvb3JQb3NpdGlvbiApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25Qcm9ncmVzcyA9IDE7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB0aGlzLmFuaW1hdGlvblByb2dyZXNzID09PSAxICkge1xyXG4gICAgICAgIHRoaXMub25TaGVsZlByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICAgIHRoaXMuaXNBbmltYXRpbmdQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB3ZSdyZSBub3QgYW5pbWF0aW5nL2NvbnRyb2xsZWQgb3IgYXR0YWNoZWQgdG8gYSBzcHJpbmcsIHdlJ2xsIGZhbGwgZHVlIHRvIGdyYXZpdHlcclxuICAgIGVsc2UgaWYgKCB0aGlzLnNwcmluZ1Byb3BlcnR5LmdldCgpID09PSBudWxsICYmICF0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIGNvbnN0IG9sZFkgPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueTtcclxuICAgICAgY29uc3QgbmV3VmVydGljYWxWZWxvY2l0eSA9IHRoaXMudmVydGljYWxWZWxvY2l0eVByb3BlcnR5LmdldCgpIC0gZ3Jhdml0eSAqIGR0O1xyXG4gICAgICBjb25zdCBuZXdZID0gb2xkWSArICggdGhpcy52ZXJ0aWNhbFZlbG9jaXR5UHJvcGVydHkuZ2V0KCkgKyBuZXdWZXJ0aWNhbFZlbG9jaXR5ICkgKiBkdCAvIDI7XHJcbiAgICAgIGlmICggbmV3WSA8IGZsb29yUG9zaXRpb24gKSB7XHJcblxyXG4gICAgICAgIC8vIGlmIHdlIGhpdCB0aGUgZ3JvdW5kIHN0b3AgZmFsbGluZ1xyXG4gICAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCwgZmxvb3JQb3NpdGlvbiApICk7XHJcbiAgICAgICAgdGhpcy52ZXJ0aWNhbFZlbG9jaXR5UHJvcGVydHkuc2V0KCAwICk7XHJcblxyXG4gICAgICAgIC8vIFJlc3BvbnNpYmxlIGZvciBhbmltYXRpbmcgdGhlIG1hc3MgYmFjayB0byBpdHMgaW5pdGlhbCBwb3NpdGlvblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uUHJvZ3Jlc3MgPSAwO1xyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uU3RhcnRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbkVuZFBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIHRoaXMuaW5pdGlhbFBvc2l0aW9uLngsIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICk7XHJcbiAgICAgICAgaWYgKCB0aGlzLmFuaW1hdGlvblN0YXJ0UG9zaXRpb24uZGlzdGFuY2UoIHRoaXMuYW5pbWF0aW9uRW5kUG9zaXRpb24gKSA+PSAxZS03ICkge1xyXG4gICAgICAgICAgdGhpcy5pc0FuaW1hdGluZ1Byb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMub25TaGVsZlByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnZlcnRpY2FsVmVsb2NpdHlQcm9wZXJ0eS5zZXQoIG5ld1ZlcnRpY2FsVmVsb2NpdHkgKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLngsIG5ld1kgKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRhY2hlcyB0aGUgbWFzcyBmcm9tIHRoZSBzcHJpbmcuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGV0YWNoKCkge1xyXG4gICAgdGhpcy52ZXJ0aWNhbFZlbG9jaXR5UHJvcGVydHkuc2V0KCAwICk7XHJcbiAgICB0aGlzLnNwcmluZ1Byb3BlcnR5LnNldCggbnVsbCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm9uU2hlbGZQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy51c2VyQ29udHJvbGxlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNwcmluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnZlcnRpY2FsVmVsb2NpdHlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5tYXNzUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaXNBbmltYXRpbmdQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pbml0aWFsVG90YWxFbmVyZ3lQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxubWFzc2VzQW5kU3ByaW5ncy5yZWdpc3RlciggJ01hc3MnLCBNYXNzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYXNzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtB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