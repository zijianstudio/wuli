// Copyright 2014-2022, University of Colorado Boulder

/**
 * Single pendulum model.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import pendulumLab from '../../pendulumLab.js';
import PendulumLabConstants from '../PendulumLabConstants.js';
import PeriodTrace from './PeriodTrace.js';

// constants
const TWO_PI = Math.PI * 2;

// scratch vector for convenience
const scratchVector = new Vector2(0, 0);
class Pendulum {
  /**
   * @param {number} index - Which pendulum in a system is this?
   * @param {number} mass - mass of pendulum, kg.
   * @param {number} length - length of pendulum, m.
   * @param {boolean} isVisible - Initial visibility of pendulum.
   * @param {Property.<number>} gravityProperty - Property with current gravity value.
   * @param {Property.<number>} frictionProperty - Property with current friction value.
   * @param {Property.<boolean>} isPeriodTraceVisibleProperty - Flag property to track checkbox value of period trace visibility.
   * @param {boolean} hasPeriodTimer
   */
  constructor(index, mass, length, isVisible, gravityProperty, frictionProperty, isPeriodTraceVisibleProperty, hasPeriodTimer) {
    // @public {number}
    this.index = index;

    // @public {Property.<number>} - Length of the pendulum (in meters)
    this.lengthProperty = new NumberProperty(length);

    // @public {Property.<number>} - Mass of the pendulum (in kilograms)
    this.massProperty = new NumberProperty(mass);

    // @public {Property.<number>} - Angle in radians (0 is straight down, positive is to the right)
    this.angleProperty = new NumberProperty(0);

    // @public {Property.<number>} - Angular velocity (in radians/second)
    this.angularVelocityProperty = new NumberProperty(0);

    // @public {boolean}
    this.hasPeriodTimer = hasPeriodTimer;

    /*---------------------------------------------------------------------------*
    * Derived variables
    *----------------------------------------------------------------------------*/

    // @public {Property.<number>} - Angular acceleration in rad/s^2
    this.angularAccelerationProperty = new NumberProperty(0);

    // @public - Position from the rotation point
    this.positionProperty = new Vector2Property(Vector2.ZERO);

    // @public
    this.velocityProperty = new Vector2Property(Vector2.ZERO);

    // @public
    this.accelerationProperty = new Vector2Property(Vector2.ZERO);

    // @public {Property.<number>} - In Joules
    this.kineticEnergyProperty = new NumberProperty(0);

    // @public {Property.<number>} - In Joules
    this.potentialEnergyProperty = new NumberProperty(0);

    // @public {Property.<number>} - In Joules
    this.thermalEnergyProperty = new NumberProperty(0);

    // @public {Property.<boolean>} - Whether the pendulum is currently being dragged.
    this.isUserControlledProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} - Whether the pendulum tick is visible on the protractor.
    this.isTickVisibleProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} - Whether the entire pendulum is visible or not
    this.isVisibleProperty = new BooleanProperty(false);

    // save link to global properties
    // @private
    this.gravityProperty = gravityProperty;
    this.frictionProperty = frictionProperty;

    // @public
    this.stepEmitter = new Emitter({
      parameters: [{
        valueType: 'number'
      }]
    });
    this.userMovedEmitter = new Emitter();
    this.crossingEmitter = new Emitter({
      parameters: [{
        valueType: 'number'
      }, {
        valueType: 'boolean'
      }]
    });
    this.peakEmitter = new Emitter({
      parameters: [{
        valueType: 'number'
      }]
    });
    this.resetEmitter = new Emitter();

    // default color for this pendulum
    // @public (read-only)
    this.color = PendulumLabConstants.PENDULUM_COLORS[index]; // {string}

    // @public {Range} (read-only)
    this.lengthRange = new Range(0.1, 1.0);

    // @public {Range} (read-only)
    this.massRange = new Range(0.1, 1.50);

    // @public {PeriodTrace}
    this.periodTrace = new PeriodTrace(this);

    // If it NOT repeatable, the PeriodTimer type will control the visibility.
    if (!hasPeriodTimer) {
      Multilink.multilink([isPeriodTraceVisibleProperty, this.isVisibleProperty], (isPeriodTraceVisible, isVisible) => {
        this.periodTrace.isVisibleProperty.value = isPeriodTraceVisible && isVisible;
      });
    }

    // make tick on protractor visible after first drag
    this.isUserControlledProperty.lazyLink(isUserControlled => {
      if (isUserControlled) {
        this.isTickVisibleProperty.value = true; // Seems like an UI-specific issue, not model

        this.angularVelocityProperty.value = 0;
        this.updateDerivedVariables(false);

        // Clear thermal energy on a drag, see https://github.com/phetsims/pendulum-lab/issues/196
        this.thermalEnergyProperty.value = 0;
      }
    });

    // make the angle value visible after the first drag
    this.angleProperty.lazyLink(() => {
      if (this.isUserControlledProperty.value) {
        this.updateDerivedVariables(false);
        this.userMovedEmitter.emit();
      }
    });

    // update the angular velocity when the length changes
    this.lengthProperty.lazyLink((newLength, oldLength) => {
      this.angularVelocityProperty.value = this.angularVelocityProperty.value * oldLength / newLength;
      this.updateDerivedVariables(false); // preserve thermal energy
    });

    this.updateListener = this.updateDerivedVariables.bind(this, false); // don't add thermal energy on these callbacks
    this.massProperty.lazyLink(this.updateListener);
    gravityProperty.lazyLink(this.updateListener);
  }

  /**
   * Function that returns the instantaneous angular acceleration
   * @private
   *
   * @param {number} theta - angular position
   * @param {number} omega - angular velocity
   * @returns {number}
   */
  omegaDerivative(theta, omega) {
    return -this.frictionTerm(omega) - this.gravityProperty.value / this.lengthProperty.value * Math.sin(theta);
  }

  /**
   * Function that returns the tangential drag force on the pendulum per unit mass per unit length
   * The friction term has units of angular acceleration.
   * The friction has a linear and quadratic component (with speed)
   * @private
   *
   * @param {number} omega - the angular velocity of the pendulum
   * @returns {number}
   */
  frictionTerm(omega) {
    return this.frictionProperty.value * this.lengthProperty.value / Math.pow(this.massProperty.value, 1 / 3) * omega * Math.abs(omega) + this.frictionProperty.value / Math.pow(this.massProperty.value, 2 / 3) * omega;
  }

  /**
   * Stepper function for the pendulum model.
   * It uses a Runge-Kutta approach to solve the angular differential equation
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    let theta = this.angleProperty.value;
    let omega = this.angularVelocityProperty.value;
    const numSteps = Math.max(7, dt * 120);

    // 10 iterations typically maintains about ~11 digits of precision for total energy
    for (let i = 0; i < numSteps; i++) {
      const step = dt / numSteps;

      // Runge Kutta (order 4), where the derivative of theta is omega.
      const k1 = omega * step;
      const l1 = this.omegaDerivative(theta, omega) * step;
      const k2 = (omega + 0.5 * l1) * step;
      const l2 = this.omegaDerivative(theta + 0.5 * k1, omega + 0.5 * l1) * step;
      const k3 = (omega + 0.5 * l2) * step;
      const l3 = this.omegaDerivative(theta + 0.5 * k2, omega + 0.5 * l2) * step;
      const k4 = (omega + l3) * step;
      const l4 = this.omegaDerivative(theta + k3, omega + l3) * step;
      const newTheta = Pendulum.modAngle(theta + (k1 + 2 * k2 + 2 * k3 + k4) / 6);
      const newOmega = omega + (l1 + 2 * l2 + 2 * l3 + l4) / 6;

      // did the pendulum crossed the vertical axis (from below)
      // is the pendulum going from left to right or vice versa, or (is the pendulum on the vertical axis and changed position )
      if (newTheta * theta < 0 || newTheta === 0 && theta !== 0) {
        this.cross(i * step, (i + 1) * step, newOmega > 0, theta, newTheta);
      }

      // did the pendulum reach a turning point
      // is the pendulum changing is speed from left to right or is the angular speed zero but wasn't zero on the last update
      if (newOmega * omega < 0 || newOmega === 0 && omega !== 0) {
        this.peak(theta, newTheta);
      }
      theta = newTheta;
      omega = newOmega;
    }

    // update the angular variables
    this.angleProperty.value = theta;
    this.angularVelocityProperty.value = omega;

    // update the derived variables, taking into account the transfer to thermal energy if friction is present
    this.updateDerivedVariables(this.frictionProperty.value > 0);
    this.stepEmitter.emit(dt);
  }

  /**
   * Function that emits when the pendulum is crossing the equilibrium point (theta=0)
   * Given that the time step is finite, we attempt to do a linear interpolation, to find the
   * precise time at which the pendulum cross the vertical.
   * @private
   *
   * @param {number} oldDT
   * @param {number} newDT
   * @param {boolean} isPositiveDirection
   * @param {number} oldTheta
   * @param {number} newTheta
   */
  cross(oldDT, newDT, isPositiveDirection, oldTheta, newTheta) {
    // If we crossed near oldTheta, our crossing DT is near oldDT. If we crossed near newTheta, our crossing DT is close
    // to newDT.
    const crossingDT = Utils.linear(oldTheta, newTheta, oldDT, newDT, 0);
    this.crossingEmitter.emit(crossingDT, isPositiveDirection);
  }

  /**
   * Sends a signal that the peak angle (turning angle) has been reached
   * It sends the value of the peak angle
   * @private
   *
   * @param {number} oldTheta
   * @param {number} newTheta
   */
  peak(oldTheta, newTheta) {
    // a slightly better estimate is turningAngle =  ( oldTheta + newTheta ) / 2 + (dt/2)*(oldOmega^2+newOmega^2)/(oldOmega-newOmega)
    const turningAngle = oldTheta + newTheta > 0 ? Math.max(oldTheta, newTheta) : Math.min(oldTheta, newTheta);
    this.peakEmitter.emit(turningAngle);
  }

  /**
   * Given the angular position and velocity, this function updates derived variables :
   * namely the various energies( kinetic, thermal, potential and total energy)
   * and the linear variables (position, velocity, acceleration) of the pendulum
   * @private
   *
   * @param {boolean} energyChangeToThermal - is Friction present in the model
   */
  updateDerivedVariables(energyChangeToThermal) {
    const speed = Math.abs(this.angularVelocityProperty.value) * this.lengthProperty.value;
    this.angularAccelerationProperty.value = this.omegaDerivative(this.angleProperty.value, this.angularVelocityProperty.value);
    const height = this.lengthProperty.value * (1 - Math.cos(this.angleProperty.value));
    const oldKineticEnergy = this.kineticEnergyProperty.value;
    this.kineticEnergyProperty.value = 0.5 * this.massProperty.value * speed * speed;
    const oldPotentialEnergy = this.potentialEnergyProperty.value;
    this.potentialEnergyProperty.value = this.massProperty.value * this.gravityProperty.value * height;
    if (energyChangeToThermal) {
      this.thermalEnergyProperty.value += oldKineticEnergy + oldPotentialEnergy - (this.kineticEnergyProperty.value + this.potentialEnergyProperty.value);
    }
    this.positionProperty.value = Vector2.createPolar(this.lengthProperty.value, this.angleProperty.value - Math.PI / 2);
    this.velocityProperty.value = Vector2.createPolar(this.angularVelocityProperty.value * this.lengthProperty.value, this.angleProperty.value); // coordinate frame -pi/2, but perpendicular +pi/2

    // add up net forces for the acceleration

    // tangential friction
    this.accelerationProperty.value = Vector2.createPolar(-this.frictionTerm(this.angularVelocityProperty.value) / this.massProperty.value, this.angleProperty.value);
    // tangential gravity
    this.accelerationProperty.value.add(scratchVector.setPolar(-this.gravityProperty.value * Math.sin(this.angleProperty.value), this.angleProperty.value));
    // radial (centripetal acceleration)
    this.accelerationProperty.value.add(scratchVector.setPolar(this.lengthProperty.value * this.angularVelocityProperty.value * this.angularVelocityProperty.value, this.angleProperty.value + Math.PI / 2));
    this.velocityProperty.notifyListenersStatic();
    this.accelerationProperty.notifyListenersStatic();
  }

  /**
   * Reset all the properties of this model.
   * @public
   */
  reset() {
    // Note: We don't reset isVisibleProperty, since it is controlled externally.
    this.lengthProperty.reset();
    this.massProperty.reset();
    this.angleProperty.reset();
    this.angularVelocityProperty.reset();
    this.angularAccelerationProperty.reset();
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.accelerationProperty.reset();
    this.kineticEnergyProperty.reset();
    this.potentialEnergyProperty.reset();
    this.thermalEnergyProperty.reset();
    this.isUserControlledProperty.reset();
    this.isTickVisibleProperty.reset();
    this.updateDerivedVariables(false);
  }

  /**
   * Function that determines if the pendulum is stationary, i.e. is controlled by the user or not moving
   * @public
   *
   * @returns {boolean}
   */
  isStationary() {
    return this.isUserControlledProperty.value || this.angleProperty.value === 0 && this.angularVelocityProperty.value === 0 && this.angularAccelerationProperty.value === 0;
  }

  /**
   * Functions returns an approximate period of the pendulum
   * The so-called small angle approximation is a lower bound to the true period in absence of friction
   * This function is currently used to fade out the path of the period trace
   * @public
   *
   * @returns {number}
   */
  getApproximatePeriod() {
    return 2 * Math.PI * Math.sqrt(this.lengthProperty.value / this.gravityProperty.value);
  }

  /**
   * Resets the motion of the Pendulum
   * @public
   */
  resetMotion() {
    this.angleProperty.reset();
    this.angularVelocityProperty.reset();

    // ticks are initially invisible
    this.isTickVisibleProperty.reset();
    this.periodTrace.resetPathPoints();
    this.updateDerivedVariables(false);
    this.resetEmitter.emit();
  }

  /**
   * Resets the thermal energy to zero
   * @public
   */
  resetThermalEnergy() {
    this.thermalEnergyProperty.reset();
  }

  /**
   * Takes our angle modulo 2pi between -pi and pi.
   * @public
   *
   * @param {number} angle
   * @returns {number}
   */
  static modAngle(angle) {
    angle = angle % TWO_PI;
    if (angle < -Math.PI) {
      angle += TWO_PI;
    }
    if (angle > Math.PI) {
      angle -= TWO_PI;
    }
    return angle;
  }
}
pendulumLab.register('Pendulum', Pendulum);
export default Pendulum;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiTXVsdGlsaW5rIiwiTnVtYmVyUHJvcGVydHkiLCJSYW5nZSIsIlV0aWxzIiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsInBlbmR1bHVtTGFiIiwiUGVuZHVsdW1MYWJDb25zdGFudHMiLCJQZXJpb2RUcmFjZSIsIlRXT19QSSIsIk1hdGgiLCJQSSIsInNjcmF0Y2hWZWN0b3IiLCJQZW5kdWx1bSIsImNvbnN0cnVjdG9yIiwiaW5kZXgiLCJtYXNzIiwibGVuZ3RoIiwiaXNWaXNpYmxlIiwiZ3Jhdml0eVByb3BlcnR5IiwiZnJpY3Rpb25Qcm9wZXJ0eSIsImlzUGVyaW9kVHJhY2VWaXNpYmxlUHJvcGVydHkiLCJoYXNQZXJpb2RUaW1lciIsImxlbmd0aFByb3BlcnR5IiwibWFzc1Byb3BlcnR5IiwiYW5nbGVQcm9wZXJ0eSIsImFuZ3VsYXJWZWxvY2l0eVByb3BlcnR5IiwiYW5ndWxhckFjY2VsZXJhdGlvblByb3BlcnR5IiwicG9zaXRpb25Qcm9wZXJ0eSIsIlpFUk8iLCJ2ZWxvY2l0eVByb3BlcnR5IiwiYWNjZWxlcmF0aW9uUHJvcGVydHkiLCJraW5ldGljRW5lcmd5UHJvcGVydHkiLCJwb3RlbnRpYWxFbmVyZ3lQcm9wZXJ0eSIsInRoZXJtYWxFbmVyZ3lQcm9wZXJ0eSIsImlzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImlzVGlja1Zpc2libGVQcm9wZXJ0eSIsImlzVmlzaWJsZVByb3BlcnR5Iiwic3RlcEVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwidXNlck1vdmVkRW1pdHRlciIsImNyb3NzaW5nRW1pdHRlciIsInBlYWtFbWl0dGVyIiwicmVzZXRFbWl0dGVyIiwiY29sb3IiLCJQRU5EVUxVTV9DT0xPUlMiLCJsZW5ndGhSYW5nZSIsIm1hc3NSYW5nZSIsInBlcmlvZFRyYWNlIiwibXVsdGlsaW5rIiwiaXNQZXJpb2RUcmFjZVZpc2libGUiLCJ2YWx1ZSIsImxhenlMaW5rIiwiaXNVc2VyQ29udHJvbGxlZCIsInVwZGF0ZURlcml2ZWRWYXJpYWJsZXMiLCJlbWl0IiwibmV3TGVuZ3RoIiwib2xkTGVuZ3RoIiwidXBkYXRlTGlzdGVuZXIiLCJiaW5kIiwib21lZ2FEZXJpdmF0aXZlIiwidGhldGEiLCJvbWVnYSIsImZyaWN0aW9uVGVybSIsInNpbiIsInBvdyIsImFicyIsInN0ZXAiLCJkdCIsIm51bVN0ZXBzIiwibWF4IiwiaSIsImsxIiwibDEiLCJrMiIsImwyIiwiazMiLCJsMyIsIms0IiwibDQiLCJuZXdUaGV0YSIsIm1vZEFuZ2xlIiwibmV3T21lZ2EiLCJjcm9zcyIsInBlYWsiLCJvbGREVCIsIm5ld0RUIiwiaXNQb3NpdGl2ZURpcmVjdGlvbiIsIm9sZFRoZXRhIiwiY3Jvc3NpbmdEVCIsImxpbmVhciIsInR1cm5pbmdBbmdsZSIsIm1pbiIsImVuZXJneUNoYW5nZVRvVGhlcm1hbCIsInNwZWVkIiwiaGVpZ2h0IiwiY29zIiwib2xkS2luZXRpY0VuZXJneSIsIm9sZFBvdGVudGlhbEVuZXJneSIsImNyZWF0ZVBvbGFyIiwiYWRkIiwic2V0UG9sYXIiLCJub3RpZnlMaXN0ZW5lcnNTdGF0aWMiLCJyZXNldCIsImlzU3RhdGlvbmFyeSIsImdldEFwcHJveGltYXRlUGVyaW9kIiwic3FydCIsInJlc2V0TW90aW9uIiwicmVzZXRQYXRoUG9pbnRzIiwicmVzZXRUaGVybWFsRW5lcmd5IiwiYW5nbGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBlbmR1bHVtLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNpbmdsZSBwZW5kdWx1bSBtb2RlbC5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IHBlbmR1bHVtTGFiIGZyb20gJy4uLy4uL3BlbmR1bHVtTGFiLmpzJztcclxuaW1wb3J0IFBlbmR1bHVtTGFiQ29uc3RhbnRzIGZyb20gJy4uL1BlbmR1bHVtTGFiQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFBlcmlvZFRyYWNlIGZyb20gJy4vUGVyaW9kVHJhY2UuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRXT19QSSA9IE1hdGguUEkgKiAyO1xyXG5cclxuLy8gc2NyYXRjaCB2ZWN0b3IgZm9yIGNvbnZlbmllbmNlXHJcbmNvbnN0IHNjcmF0Y2hWZWN0b3IgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG5cclxuY2xhc3MgUGVuZHVsdW0ge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIFdoaWNoIHBlbmR1bHVtIGluIGEgc3lzdGVtIGlzIHRoaXM/XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1hc3MgLSBtYXNzIG9mIHBlbmR1bHVtLCBrZy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIC0gbGVuZ3RoIG9mIHBlbmR1bHVtLCBtLlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWaXNpYmxlIC0gSW5pdGlhbCB2aXNpYmlsaXR5IG9mIHBlbmR1bHVtLlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IGdyYXZpdHlQcm9wZXJ0eSAtIFByb3BlcnR5IHdpdGggY3VycmVudCBncmF2aXR5IHZhbHVlLlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IGZyaWN0aW9uUHJvcGVydHkgLSBQcm9wZXJ0eSB3aXRoIGN1cnJlbnQgZnJpY3Rpb24gdmFsdWUuXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGlzUGVyaW9kVHJhY2VWaXNpYmxlUHJvcGVydHkgLSBGbGFnIHByb3BlcnR5IHRvIHRyYWNrIGNoZWNrYm94IHZhbHVlIG9mIHBlcmlvZCB0cmFjZSB2aXNpYmlsaXR5LlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGFzUGVyaW9kVGltZXJcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaW5kZXgsIG1hc3MsIGxlbmd0aCwgaXNWaXNpYmxlLCBncmF2aXR5UHJvcGVydHksIGZyaWN0aW9uUHJvcGVydHksIGlzUGVyaW9kVHJhY2VWaXNpYmxlUHJvcGVydHksIGhhc1BlcmlvZFRpbWVyICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gLSBMZW5ndGggb2YgdGhlIHBlbmR1bHVtIChpbiBtZXRlcnMpXHJcbiAgICB0aGlzLmxlbmd0aFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBsZW5ndGggKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gLSBNYXNzIG9mIHRoZSBwZW5kdWx1bSAoaW4ga2lsb2dyYW1zKVxyXG4gICAgdGhpcy5tYXNzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG1hc3MgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gLSBBbmdsZSBpbiByYWRpYW5zICgwIGlzIHN0cmFpZ2h0IGRvd24sIHBvc2l0aXZlIGlzIHRvIHRoZSByaWdodClcclxuICAgIHRoaXMuYW5nbGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSAtIEFuZ3VsYXIgdmVsb2NpdHkgKGluIHJhZGlhbnMvc2Vjb25kKVxyXG4gICAgdGhpcy5hbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59XHJcbiAgICB0aGlzLmhhc1BlcmlvZFRpbWVyID0gaGFzUGVyaW9kVGltZXI7XHJcblxyXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICAqIERlcml2ZWQgdmFyaWFibGVzXHJcbiAgICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IC0gQW5ndWxhciBhY2NlbGVyYXRpb24gaW4gcmFkL3NeMlxyXG4gICAgdGhpcy5hbmd1bGFyQWNjZWxlcmF0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gUG9zaXRpb24gZnJvbSB0aGUgcm90YXRpb24gcG9pbnRcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gLSBJbiBKb3VsZXNcclxuICAgIHRoaXMua2luZXRpY0VuZXJneVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IC0gSW4gSm91bGVzXHJcbiAgICB0aGlzLnBvdGVudGlhbEVuZXJneVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IC0gSW4gSm91bGVzXHJcbiAgICB0aGlzLnRoZXJtYWxFbmVyZ3lQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBXaGV0aGVyIHRoZSBwZW5kdWx1bSBpcyBjdXJyZW50bHkgYmVpbmcgZHJhZ2dlZC5cclxuICAgIHRoaXMuaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IC0gV2hldGhlciB0aGUgcGVuZHVsdW0gdGljayBpcyB2aXNpYmxlIG9uIHRoZSBwcm90cmFjdG9yLlxyXG4gICAgdGhpcy5pc1RpY2tWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBXaGV0aGVyIHRoZSBlbnRpcmUgcGVuZHVsdW0gaXMgdmlzaWJsZSBvciBub3RcclxuICAgIHRoaXMuaXNWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIHNhdmUgbGluayB0byBnbG9iYWwgcHJvcGVydGllc1xyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZ3Jhdml0eVByb3BlcnR5ID0gZ3Jhdml0eVByb3BlcnR5O1xyXG4gICAgdGhpcy5mcmljdGlvblByb3BlcnR5ID0gZnJpY3Rpb25Qcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLnN0ZXBFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHsgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogJ251bWJlcicgfSBdIH0gKTtcclxuICAgIHRoaXMudXNlck1vdmVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICB0aGlzLmNyb3NzaW5nRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7IHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6ICdudW1iZXInIH0sIHsgdmFsdWVUeXBlOiAnYm9vbGVhbicgfSBdIH0gKTtcclxuICAgIHRoaXMucGVha0VtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiAnbnVtYmVyJyB9IF0gfSApO1xyXG4gICAgdGhpcy5yZXNldEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIGRlZmF1bHQgY29sb3IgZm9yIHRoaXMgcGVuZHVsdW1cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMuY29sb3IgPSBQZW5kdWx1bUxhYkNvbnN0YW50cy5QRU5EVUxVTV9DT0xPUlNbIGluZGV4IF07IC8vIHtzdHJpbmd9XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UmFuZ2V9IChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLmxlbmd0aFJhbmdlID0gbmV3IFJhbmdlKCAwLjEsIDEuMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1JhbmdlfSAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy5tYXNzUmFuZ2UgPSBuZXcgUmFuZ2UoIDAuMSwgMS41MCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1BlcmlvZFRyYWNlfVxyXG4gICAgdGhpcy5wZXJpb2RUcmFjZSA9IG5ldyBQZXJpb2RUcmFjZSggdGhpcyApO1xyXG5cclxuICAgIC8vIElmIGl0IE5PVCByZXBlYXRhYmxlLCB0aGUgUGVyaW9kVGltZXIgdHlwZSB3aWxsIGNvbnRyb2wgdGhlIHZpc2liaWxpdHkuXHJcbiAgICBpZiAoICFoYXNQZXJpb2RUaW1lciApIHtcclxuICAgICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBpc1BlcmlvZFRyYWNlVmlzaWJsZVByb3BlcnR5LCB0aGlzLmlzVmlzaWJsZVByb3BlcnR5IF0sICggaXNQZXJpb2RUcmFjZVZpc2libGUsIGlzVmlzaWJsZSApID0+IHtcclxuICAgICAgICB0aGlzLnBlcmlvZFRyYWNlLmlzVmlzaWJsZVByb3BlcnR5LnZhbHVlID0gaXNQZXJpb2RUcmFjZVZpc2libGUgJiYgaXNWaXNpYmxlO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbWFrZSB0aWNrIG9uIHByb3RyYWN0b3IgdmlzaWJsZSBhZnRlciBmaXJzdCBkcmFnXHJcbiAgICB0aGlzLmlzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5sYXp5TGluayggaXNVc2VyQ29udHJvbGxlZCA9PiB7XHJcbiAgICAgIGlmICggaXNVc2VyQ29udHJvbGxlZCApIHtcclxuICAgICAgICB0aGlzLmlzVGlja1Zpc2libGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7IC8vIFNlZW1zIGxpa2UgYW4gVUktc3BlY2lmaWMgaXNzdWUsIG5vdCBtb2RlbFxyXG5cclxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlID0gMDtcclxuICAgICAgICB0aGlzLnVwZGF0ZURlcml2ZWRWYXJpYWJsZXMoIGZhbHNlICk7XHJcblxyXG4gICAgICAgIC8vIENsZWFyIHRoZXJtYWwgZW5lcmd5IG9uIGEgZHJhZywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZW5kdWx1bS1sYWIvaXNzdWVzLzE5NlxyXG4gICAgICAgIHRoaXMudGhlcm1hbEVuZXJneVByb3BlcnR5LnZhbHVlID0gMDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG1ha2UgdGhlIGFuZ2xlIHZhbHVlIHZpc2libGUgYWZ0ZXIgdGhlIGZpcnN0IGRyYWdcclxuICAgIHRoaXMuYW5nbGVQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xyXG4gICAgICBpZiAoIHRoaXMuaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlRGVyaXZlZFZhcmlhYmxlcyggZmFsc2UgKTtcclxuICAgICAgICB0aGlzLnVzZXJNb3ZlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBhbmd1bGFyIHZlbG9jaXR5IHdoZW4gdGhlIGxlbmd0aCBjaGFuZ2VzXHJcbiAgICB0aGlzLmxlbmd0aFByb3BlcnR5LmxhenlMaW5rKCAoIG5ld0xlbmd0aCwgb2xkTGVuZ3RoICkgPT4ge1xyXG4gICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlID0gdGhpcy5hbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSAqIG9sZExlbmd0aCAvIG5ld0xlbmd0aDtcclxuICAgICAgdGhpcy51cGRhdGVEZXJpdmVkVmFyaWFibGVzKCBmYWxzZSApOyAvLyBwcmVzZXJ2ZSB0aGVybWFsIGVuZXJneVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudXBkYXRlTGlzdGVuZXIgPSB0aGlzLnVwZGF0ZURlcml2ZWRWYXJpYWJsZXMuYmluZCggdGhpcywgZmFsc2UgKTsgLy8gZG9uJ3QgYWRkIHRoZXJtYWwgZW5lcmd5IG9uIHRoZXNlIGNhbGxiYWNrc1xyXG4gICAgdGhpcy5tYXNzUHJvcGVydHkubGF6eUxpbmsoIHRoaXMudXBkYXRlTGlzdGVuZXIgKTtcclxuICAgIGdyYXZpdHlQcm9wZXJ0eS5sYXp5TGluayggdGhpcy51cGRhdGVMaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBpbnN0YW50YW5lb3VzIGFuZ3VsYXIgYWNjZWxlcmF0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aGV0YSAtIGFuZ3VsYXIgcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0gb21lZ2EgLSBhbmd1bGFyIHZlbG9jaXR5XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBvbWVnYURlcml2YXRpdmUoIHRoZXRhLCBvbWVnYSApIHtcclxuICAgIHJldHVybiAtdGhpcy5mcmljdGlvblRlcm0oIG9tZWdhICkgLSAoIHRoaXMuZ3Jhdml0eVByb3BlcnR5LnZhbHVlIC8gdGhpcy5sZW5ndGhQcm9wZXJ0eS52YWx1ZSApICogTWF0aC5zaW4oIHRoZXRhICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHRhbmdlbnRpYWwgZHJhZyBmb3JjZSBvbiB0aGUgcGVuZHVsdW0gcGVyIHVuaXQgbWFzcyBwZXIgdW5pdCBsZW5ndGhcclxuICAgKiBUaGUgZnJpY3Rpb24gdGVybSBoYXMgdW5pdHMgb2YgYW5ndWxhciBhY2NlbGVyYXRpb24uXHJcbiAgICogVGhlIGZyaWN0aW9uIGhhcyBhIGxpbmVhciBhbmQgcXVhZHJhdGljIGNvbXBvbmVudCAod2l0aCBzcGVlZClcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9tZWdhIC0gdGhlIGFuZ3VsYXIgdmVsb2NpdHkgb2YgdGhlIHBlbmR1bHVtXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBmcmljdGlvblRlcm0oIG9tZWdhICkge1xyXG4gICAgcmV0dXJuIHRoaXMuZnJpY3Rpb25Qcm9wZXJ0eS52YWx1ZSAqIHRoaXMubGVuZ3RoUHJvcGVydHkudmFsdWUgLyBNYXRoLnBvdyggdGhpcy5tYXNzUHJvcGVydHkudmFsdWUsIDEgLyAzICkgKiBvbWVnYSAqIE1hdGguYWJzKCBvbWVnYSApICtcclxuICAgICAgICAgICB0aGlzLmZyaWN0aW9uUHJvcGVydHkudmFsdWUgLyBNYXRoLnBvdyggdGhpcy5tYXNzUHJvcGVydHkudmFsdWUsIDIgLyAzICkgKiBvbWVnYTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBwZXIgZnVuY3Rpb24gZm9yIHRoZSBwZW5kdWx1bSBtb2RlbC5cclxuICAgKiBJdCB1c2VzIGEgUnVuZ2UtS3V0dGEgYXBwcm9hY2ggdG8gc29sdmUgdGhlIGFuZ3VsYXIgZGlmZmVyZW50aWFsIGVxdWF0aW9uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcbiAgICBsZXQgdGhldGEgPSB0aGlzLmFuZ2xlUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgbGV0IG9tZWdhID0gdGhpcy5hbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICBjb25zdCBudW1TdGVwcyA9IE1hdGgubWF4KCA3LCBkdCAqIDEyMCApO1xyXG5cclxuICAgIC8vIDEwIGl0ZXJhdGlvbnMgdHlwaWNhbGx5IG1haW50YWlucyBhYm91dCB+MTEgZGlnaXRzIG9mIHByZWNpc2lvbiBmb3IgdG90YWwgZW5lcmd5XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1TdGVwczsgaSsrICkge1xyXG4gICAgICBjb25zdCBzdGVwID0gZHQgLyBudW1TdGVwcztcclxuXHJcbiAgICAgIC8vIFJ1bmdlIEt1dHRhIChvcmRlciA0KSwgd2hlcmUgdGhlIGRlcml2YXRpdmUgb2YgdGhldGEgaXMgb21lZ2EuXHJcbiAgICAgIGNvbnN0IGsxID0gb21lZ2EgKiBzdGVwO1xyXG4gICAgICBjb25zdCBsMSA9IHRoaXMub21lZ2FEZXJpdmF0aXZlKCB0aGV0YSwgb21lZ2EgKSAqIHN0ZXA7XHJcbiAgICAgIGNvbnN0IGsyID0gKCBvbWVnYSArIDAuNSAqIGwxICkgKiBzdGVwO1xyXG4gICAgICBjb25zdCBsMiA9IHRoaXMub21lZ2FEZXJpdmF0aXZlKCB0aGV0YSArIDAuNSAqIGsxLCBvbWVnYSArIDAuNSAqIGwxICkgKiBzdGVwO1xyXG4gICAgICBjb25zdCBrMyA9ICggb21lZ2EgKyAwLjUgKiBsMiApICogc3RlcDtcclxuICAgICAgY29uc3QgbDMgPSB0aGlzLm9tZWdhRGVyaXZhdGl2ZSggdGhldGEgKyAwLjUgKiBrMiwgb21lZ2EgKyAwLjUgKiBsMiApICogc3RlcDtcclxuICAgICAgY29uc3QgazQgPSAoIG9tZWdhICsgbDMgKSAqIHN0ZXA7XHJcbiAgICAgIGNvbnN0IGw0ID0gdGhpcy5vbWVnYURlcml2YXRpdmUoIHRoZXRhICsgazMsIG9tZWdhICsgbDMgKSAqIHN0ZXA7XHJcbiAgICAgIGNvbnN0IG5ld1RoZXRhID0gUGVuZHVsdW0ubW9kQW5nbGUoIHRoZXRhICsgKCBrMSArIDIgKiBrMiArIDIgKiBrMyArIGs0ICkgLyA2ICk7XHJcbiAgICAgIGNvbnN0IG5ld09tZWdhID0gb21lZ2EgKyAoIGwxICsgMiAqIGwyICsgMiAqIGwzICsgbDQgKSAvIDY7XHJcblxyXG4gICAgICAvLyBkaWQgdGhlIHBlbmR1bHVtIGNyb3NzZWQgdGhlIHZlcnRpY2FsIGF4aXMgKGZyb20gYmVsb3cpXHJcbiAgICAgIC8vIGlzIHRoZSBwZW5kdWx1bSBnb2luZyBmcm9tIGxlZnQgdG8gcmlnaHQgb3IgdmljZSB2ZXJzYSwgb3IgKGlzIHRoZSBwZW5kdWx1bSBvbiB0aGUgdmVydGljYWwgYXhpcyBhbmQgY2hhbmdlZCBwb3NpdGlvbiApXHJcbiAgICAgIGlmICggKCBuZXdUaGV0YSAqIHRoZXRhIDwgMCApIHx8ICggbmV3VGhldGEgPT09IDAgJiYgdGhldGEgIT09IDAgKSApIHtcclxuICAgICAgICB0aGlzLmNyb3NzKCBpICogc3RlcCwgKCBpICsgMSApICogc3RlcCwgbmV3T21lZ2EgPiAwLCB0aGV0YSwgbmV3VGhldGEgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZGlkIHRoZSBwZW5kdWx1bSByZWFjaCBhIHR1cm5pbmcgcG9pbnRcclxuICAgICAgLy8gaXMgdGhlIHBlbmR1bHVtIGNoYW5naW5nIGlzIHNwZWVkIGZyb20gbGVmdCB0byByaWdodCBvciBpcyB0aGUgYW5ndWxhciBzcGVlZCB6ZXJvIGJ1dCB3YXNuJ3QgemVybyBvbiB0aGUgbGFzdCB1cGRhdGVcclxuICAgICAgaWYgKCAoIG5ld09tZWdhICogb21lZ2EgPCAwICkgfHwgKCBuZXdPbWVnYSA9PT0gMCAmJiBvbWVnYSAhPT0gMCApICkge1xyXG4gICAgICAgIHRoaXMucGVhayggdGhldGEsIG5ld1RoZXRhICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoZXRhID0gbmV3VGhldGE7XHJcbiAgICAgIG9tZWdhID0gbmV3T21lZ2E7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBhbmd1bGFyIHZhcmlhYmxlc1xyXG4gICAgdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlID0gdGhldGE7XHJcbiAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlID0gb21lZ2E7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBkZXJpdmVkIHZhcmlhYmxlcywgdGFraW5nIGludG8gYWNjb3VudCB0aGUgdHJhbnNmZXIgdG8gdGhlcm1hbCBlbmVyZ3kgaWYgZnJpY3Rpb24gaXMgcHJlc2VudFxyXG4gICAgdGhpcy51cGRhdGVEZXJpdmVkVmFyaWFibGVzKCB0aGlzLmZyaWN0aW9uUHJvcGVydHkudmFsdWUgPiAwICk7XHJcblxyXG4gICAgdGhpcy5zdGVwRW1pdHRlci5lbWl0KCBkdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCBlbWl0cyB3aGVuIHRoZSBwZW5kdWx1bSBpcyBjcm9zc2luZyB0aGUgZXF1aWxpYnJpdW0gcG9pbnQgKHRoZXRhPTApXHJcbiAgICogR2l2ZW4gdGhhdCB0aGUgdGltZSBzdGVwIGlzIGZpbml0ZSwgd2UgYXR0ZW1wdCB0byBkbyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uLCB0byBmaW5kIHRoZVxyXG4gICAqIHByZWNpc2UgdGltZSBhdCB3aGljaCB0aGUgcGVuZHVsdW0gY3Jvc3MgdGhlIHZlcnRpY2FsLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gb2xkRFRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbmV3RFRcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzUG9zaXRpdmVEaXJlY3Rpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0gb2xkVGhldGFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbmV3VGhldGFcclxuICAgKi9cclxuICBjcm9zcyggb2xkRFQsIG5ld0RULCBpc1Bvc2l0aXZlRGlyZWN0aW9uLCBvbGRUaGV0YSwgbmV3VGhldGEgKSB7XHJcbiAgICAvLyBJZiB3ZSBjcm9zc2VkIG5lYXIgb2xkVGhldGEsIG91ciBjcm9zc2luZyBEVCBpcyBuZWFyIG9sZERULiBJZiB3ZSBjcm9zc2VkIG5lYXIgbmV3VGhldGEsIG91ciBjcm9zc2luZyBEVCBpcyBjbG9zZVxyXG4gICAgLy8gdG8gbmV3RFQuXHJcbiAgICBjb25zdCBjcm9zc2luZ0RUID0gVXRpbHMubGluZWFyKCBvbGRUaGV0YSwgbmV3VGhldGEsIG9sZERULCBuZXdEVCwgMCApO1xyXG5cclxuICAgIHRoaXMuY3Jvc3NpbmdFbWl0dGVyLmVtaXQoIGNyb3NzaW5nRFQsIGlzUG9zaXRpdmVEaXJlY3Rpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlbmRzIGEgc2lnbmFsIHRoYXQgdGhlIHBlYWsgYW5nbGUgKHR1cm5pbmcgYW5nbGUpIGhhcyBiZWVuIHJlYWNoZWRcclxuICAgKiBJdCBzZW5kcyB0aGUgdmFsdWUgb2YgdGhlIHBlYWsgYW5nbGVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9sZFRoZXRhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5ld1RoZXRhXHJcbiAgICovXHJcbiAgcGVhayggb2xkVGhldGEsIG5ld1RoZXRhICkge1xyXG4gICAgLy8gYSBzbGlnaHRseSBiZXR0ZXIgZXN0aW1hdGUgaXMgdHVybmluZ0FuZ2xlID0gICggb2xkVGhldGEgKyBuZXdUaGV0YSApIC8gMiArIChkdC8yKSoob2xkT21lZ2FeMituZXdPbWVnYV4yKS8ob2xkT21lZ2EtbmV3T21lZ2EpXHJcbiAgICBjb25zdCB0dXJuaW5nQW5nbGUgPSAoIG9sZFRoZXRhICsgbmV3VGhldGEgPiAwICkgPyBNYXRoLm1heCggb2xkVGhldGEsIG5ld1RoZXRhICkgOiBNYXRoLm1pbiggb2xkVGhldGEsIG5ld1RoZXRhICk7XHJcbiAgICB0aGlzLnBlYWtFbWl0dGVyLmVtaXQoIHR1cm5pbmdBbmdsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gdGhlIGFuZ3VsYXIgcG9zaXRpb24gYW5kIHZlbG9jaXR5LCB0aGlzIGZ1bmN0aW9uIHVwZGF0ZXMgZGVyaXZlZCB2YXJpYWJsZXMgOlxyXG4gICAqIG5hbWVseSB0aGUgdmFyaW91cyBlbmVyZ2llcygga2luZXRpYywgdGhlcm1hbCwgcG90ZW50aWFsIGFuZCB0b3RhbCBlbmVyZ3kpXHJcbiAgICogYW5kIHRoZSBsaW5lYXIgdmFyaWFibGVzIChwb3NpdGlvbiwgdmVsb2NpdHksIGFjY2VsZXJhdGlvbikgb2YgdGhlIHBlbmR1bHVtXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZW5lcmd5Q2hhbmdlVG9UaGVybWFsIC0gaXMgRnJpY3Rpb24gcHJlc2VudCBpbiB0aGUgbW9kZWxcclxuICAgKi9cclxuICB1cGRhdGVEZXJpdmVkVmFyaWFibGVzKCBlbmVyZ3lDaGFuZ2VUb1RoZXJtYWwgKSB7XHJcbiAgICBjb25zdCBzcGVlZCA9IE1hdGguYWJzKCB0aGlzLmFuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlICkgKiB0aGlzLmxlbmd0aFByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIHRoaXMuYW5ndWxhckFjY2VsZXJhdGlvblByb3BlcnR5LnZhbHVlID0gdGhpcy5vbWVnYURlcml2YXRpdmUoIHRoaXMuYW5nbGVQcm9wZXJ0eS52YWx1ZSwgdGhpcy5hbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5sZW5ndGhQcm9wZXJ0eS52YWx1ZSAqICggMSAtIE1hdGguY29zKCB0aGlzLmFuZ2xlUHJvcGVydHkudmFsdWUgKSApO1xyXG5cclxuICAgIGNvbnN0IG9sZEtpbmV0aWNFbmVyZ3kgPSB0aGlzLmtpbmV0aWNFbmVyZ3lQcm9wZXJ0eS52YWx1ZTtcclxuICAgIHRoaXMua2luZXRpY0VuZXJneVByb3BlcnR5LnZhbHVlID0gMC41ICogdGhpcy5tYXNzUHJvcGVydHkudmFsdWUgKiBzcGVlZCAqIHNwZWVkO1xyXG5cclxuICAgIGNvbnN0IG9sZFBvdGVudGlhbEVuZXJneSA9IHRoaXMucG90ZW50aWFsRW5lcmd5UHJvcGVydHkudmFsdWU7XHJcbiAgICB0aGlzLnBvdGVudGlhbEVuZXJneVByb3BlcnR5LnZhbHVlID0gdGhpcy5tYXNzUHJvcGVydHkudmFsdWUgKiB0aGlzLmdyYXZpdHlQcm9wZXJ0eS52YWx1ZSAqIGhlaWdodDtcclxuXHJcbiAgICBpZiAoIGVuZXJneUNoYW5nZVRvVGhlcm1hbCApIHtcclxuICAgICAgdGhpcy50aGVybWFsRW5lcmd5UHJvcGVydHkudmFsdWUgKz0gKCBvbGRLaW5ldGljRW5lcmd5ICsgb2xkUG90ZW50aWFsRW5lcmd5ICkgLSAoIHRoaXMua2luZXRpY0VuZXJneVByb3BlcnR5LnZhbHVlICsgdGhpcy5wb3RlbnRpYWxFbmVyZ3lQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IFZlY3RvcjIuY3JlYXRlUG9sYXIoIHRoaXMubGVuZ3RoUHJvcGVydHkudmFsdWUsIHRoaXMuYW5nbGVQcm9wZXJ0eS52YWx1ZSAtIE1hdGguUEkgLyAyICk7XHJcbiAgICB0aGlzLnZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSBWZWN0b3IyLmNyZWF0ZVBvbGFyKCB0aGlzLmFuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlICogdGhpcy5sZW5ndGhQcm9wZXJ0eS52YWx1ZSwgdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlICk7IC8vIGNvb3JkaW5hdGUgZnJhbWUgLXBpLzIsIGJ1dCBwZXJwZW5kaWN1bGFyICtwaS8yXHJcblxyXG4gICAgLy8gYWRkIHVwIG5ldCBmb3JjZXMgZm9yIHRoZSBhY2NlbGVyYXRpb25cclxuXHJcbiAgICAvLyB0YW5nZW50aWFsIGZyaWN0aW9uXHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvblByb3BlcnR5LnZhbHVlID0gVmVjdG9yMi5jcmVhdGVQb2xhciggLXRoaXMuZnJpY3Rpb25UZXJtKCB0aGlzLmFuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlICkgLyB0aGlzLm1hc3NQcm9wZXJ0eS52YWx1ZSwgdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAvLyB0YW5nZW50aWFsIGdyYXZpdHlcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uUHJvcGVydHkudmFsdWUuYWRkKCBzY3JhdGNoVmVjdG9yLnNldFBvbGFyKCAtdGhpcy5ncmF2aXR5UHJvcGVydHkudmFsdWUgKiBNYXRoLnNpbiggdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlICksIHRoaXMuYW5nbGVQcm9wZXJ0eS52YWx1ZSApICk7XHJcbiAgICAvLyByYWRpYWwgKGNlbnRyaXBldGFsIGFjY2VsZXJhdGlvbilcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uUHJvcGVydHkudmFsdWUuYWRkKCBzY3JhdGNoVmVjdG9yLnNldFBvbGFyKCB0aGlzLmxlbmd0aFByb3BlcnR5LnZhbHVlICogdGhpcy5hbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSAqIHRoaXMuYW5ndWxhclZlbG9jaXR5UHJvcGVydHkudmFsdWUsIHRoaXMuYW5nbGVQcm9wZXJ0eS52YWx1ZSArIE1hdGguUEkgLyAyICkgKTtcclxuXHJcbiAgICB0aGlzLnZlbG9jaXR5UHJvcGVydHkubm90aWZ5TGlzdGVuZXJzU3RhdGljKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvblByb3BlcnR5Lm5vdGlmeUxpc3RlbmVyc1N0YXRpYygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgYWxsIHRoZSBwcm9wZXJ0aWVzIG9mIHRoaXMgbW9kZWwuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgLy8gTm90ZTogV2UgZG9uJ3QgcmVzZXQgaXNWaXNpYmxlUHJvcGVydHksIHNpbmNlIGl0IGlzIGNvbnRyb2xsZWQgZXh0ZXJuYWxseS5cclxuICAgIHRoaXMubGVuZ3RoUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubWFzc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFuZ2xlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYW5ndWxhckFjY2VsZXJhdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5raW5ldGljRW5lcmd5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucG90ZW50aWFsRW5lcmd5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudGhlcm1hbEVuZXJneVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pc1RpY2tWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZURlcml2ZWRWYXJpYWJsZXMoIGZhbHNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IGRldGVybWluZXMgaWYgdGhlIHBlbmR1bHVtIGlzIHN0YXRpb25hcnksIGkuZS4gaXMgY29udHJvbGxlZCBieSB0aGUgdXNlciBvciBub3QgbW92aW5nXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNTdGF0aW9uYXJ5KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5LnZhbHVlIHx8ICggdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlID09PSAwICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eVByb3BlcnR5LnZhbHVlID09PSAwICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFuZ3VsYXJBY2NlbGVyYXRpb25Qcm9wZXJ0eS52YWx1ZSA9PT0gMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb25zIHJldHVybnMgYW4gYXBwcm94aW1hdGUgcGVyaW9kIG9mIHRoZSBwZW5kdWx1bVxyXG4gICAqIFRoZSBzby1jYWxsZWQgc21hbGwgYW5nbGUgYXBwcm94aW1hdGlvbiBpcyBhIGxvd2VyIGJvdW5kIHRvIHRoZSB0cnVlIHBlcmlvZCBpbiBhYnNlbmNlIG9mIGZyaWN0aW9uXHJcbiAgICogVGhpcyBmdW5jdGlvbiBpcyBjdXJyZW50bHkgdXNlZCB0byBmYWRlIG91dCB0aGUgcGF0aCBvZiB0aGUgcGVyaW9kIHRyYWNlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRBcHByb3hpbWF0ZVBlcmlvZCgpIHtcclxuICAgIHJldHVybiAyICogTWF0aC5QSSAqIE1hdGguc3FydCggdGhpcy5sZW5ndGhQcm9wZXJ0eS52YWx1ZSAvIHRoaXMuZ3Jhdml0eVByb3BlcnR5LnZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIG1vdGlvbiBvZiB0aGUgUGVuZHVsdW1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXRNb3Rpb24oKSB7XHJcbiAgICB0aGlzLmFuZ2xlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5UHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICAvLyB0aWNrcyBhcmUgaW5pdGlhbGx5IGludmlzaWJsZVxyXG4gICAgdGhpcy5pc1RpY2tWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLnBlcmlvZFRyYWNlLnJlc2V0UGF0aFBvaW50cygpO1xyXG5cclxuICAgIHRoaXMudXBkYXRlRGVyaXZlZFZhcmlhYmxlcyggZmFsc2UgKTtcclxuXHJcbiAgICB0aGlzLnJlc2V0RW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIHRoZXJtYWwgZW5lcmd5IHRvIHplcm9cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXRUaGVybWFsRW5lcmd5KCkge1xyXG4gICAgdGhpcy50aGVybWFsRW5lcmd5UHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2VzIG91ciBhbmdsZSBtb2R1bG8gMnBpIGJldHdlZW4gLXBpIGFuZCBwaS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBtb2RBbmdsZSggYW5nbGUgKSB7XHJcbiAgICBhbmdsZSA9IGFuZ2xlICUgVFdPX1BJO1xyXG5cclxuICAgIGlmICggYW5nbGUgPCAtTWF0aC5QSSApIHtcclxuICAgICAgYW5nbGUgKz0gVFdPX1BJO1xyXG4gICAgfVxyXG4gICAgaWYgKCBhbmdsZSA+IE1hdGguUEkgKSB7XHJcbiAgICAgIGFuZ2xlIC09IFRXT19QSTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYW5nbGU7XHJcbiAgfVxyXG59XHJcblxyXG5wZW5kdWx1bUxhYi5yZWdpc3RlciggJ1BlbmR1bHVtJywgUGVuZHVsdW0gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBlbmR1bHVtOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxvQkFBb0IsTUFBTSw0QkFBNEI7QUFDN0QsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjs7QUFFMUM7QUFDQSxNQUFNQyxNQUFNLEdBQUdDLElBQUksQ0FBQ0MsRUFBRSxHQUFHLENBQUM7O0FBRTFCO0FBQ0EsTUFBTUMsYUFBYSxHQUFHLElBQUlSLE9BQU8sQ0FB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