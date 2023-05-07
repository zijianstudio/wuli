// Copyright 2016-2022, University of Colorado Boulder

/**
 * Responsible for the attributes associated with each spring.
 *
 * @author Matt Pennington (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Complex from '../../../../dot/js/Complex.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import massesAndSprings from '../../massesAndSprings.js';
import MassesAndSpringsConstants from '../MassesAndSpringsConstants.js';

// constants
const DEFAULT_THICKNESS = 3; // empirically determined

class Spring {
  /**
   * @param {Vector2} position - coordinates of the top center of the spring
   * @param {number} initialNaturalRestingLength - initial resting length of unweighted spring in m
   * @param {Property.<number>} dampingProperty - used for viscous damping coefficient (N.s/m) of the system
   * @param {Property.<number>} gravityProperty - the gravity Property from the model
   * @param {Tandem} tandem
   *
   */
  constructor(position, initialNaturalRestingLength, dampingProperty, gravityProperty, tandem) {
    // validate and save options
    assert && assert(initialNaturalRestingLength > 0, `naturalRestingLength must be > 0 : ${initialNaturalRestingLength}`);

    // @public {Property.<number>} (read-write) Used to position massNode forces. Right side: 1, Left side: -1
    this.forcesOrientationProperty = new NumberProperty(1);

    // @public {Property.<number|null>} gravitational acceleration
    this.gravityProperty = new Property(gravityProperty.value, {
      reentrant: true // used due to extremely small rounding
    });

    // Link to manage gravity value for the spring object. Springs exists throughout sim lifetime so no need for unlink.
    gravityProperty.link(gravity => {
      this.gravityProperty.set(gravity);
    });

    //  @public {Property.<number>} distance from the bottom of the spring from the natural resting position
    this.displacementProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('displacementProperty'),
      units: 'm',
      range: new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
    });

    // @public {Property.<number>} y position of the equilibrium position centered on mass's center of mass
    this.massEquilibriumYPositionProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('equilibriumYPositionProperty'),
      units: 'm',
      range: new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
    });

    // @public {Property.<number|null>} distance from of the bottom of the spring from the massEquilibriumYPosition
    this.massEquilibriumDisplacementProperty = new Property(null);

    // @public {Property.<number>} spring constant of spring
    this.springConstantProperty = new NumberProperty(MassesAndSpringsConstants.SPRING_CONSTANT_RANGE.defaultValue, {
      tandem: tandem.createTandem('springConstantProperty'),
      units: 'N/m',
      range: new Range(3, 60)
    });

    // @public {Property.<number>} spring force
    this.springForceProperty = new DerivedProperty([this.displacementProperty, this.springConstantProperty], (displacement, springConstant) => -springConstant * displacement, {
      units: 'N',
      phetioValueType: NumberIO
    });

    // @public {Property.<number>} viscous damping coefficient of the system
    this.dampingCoefficientProperty = new NumberProperty(dampingProperty.value, {
      tandem: tandem.createTandem('dampingCoefficientProperty'),
      units: 'N\u00b7s/m',
      range: new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
    });

    // @public - position of the spring, originated at the top-center of the spring node
    this.positionProperty = new Vector2Property(position, {
      tandem: tandem.createTandem('positionProperty')
    });

    // @public {Property.<number>} length of the spring without mass attached
    this.naturalRestingLengthProperty = new NumberProperty(initialNaturalRestingLength, {
      tandem: tandem.createTandem('naturalRestingLengthProperty'),
      units: 'm',
      range: new Range(0.1, 0.5)
    });

    // @public {Property.<number> read-only} line width of oscillating spring node
    this.thicknessProperty = new NumberProperty(DEFAULT_THICKNESS, {
      tandem: tandem.createTandem('thicknessProperty'),
      range: new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
    });

    // Calling this function here will set a calculated value for the thickness property.
    this.updateThickness(this.naturalRestingLengthProperty.get(), this.springConstantProperty.get());

    // @public {Property.<boolean>} determines whether the animation for the spring is played or not
    this.animatingProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('animatingProperty')
    });

    // @public {Property.<Mass|null> read-write} This is the Mass object that is attached to the spring
    this.massAttachedProperty = new Property(null, {
      tandem: tandem.createTandem('massAttachedProperty')
      // phetioValueType: NullableIO( MassIO )
    });

    // @public {Property.<number>} Kinetic Energy of the attached Mass
    this.kineticEnergyProperty = new DynamicProperty(this.massAttachedProperty, {
      derive: 'kineticEnergyProperty',
      defaultValue: 0
    });

    // @public {Property.<number>} Gravitational Potential Energy of the attached Mass
    this.gravitationalPotentialEnergyProperty = new DynamicProperty(this.massAttachedProperty, {
      derive: 'gravitationalPotentialEnergyProperty',
      defaultValue: 0
    });

    // @public {Property.<number>} Elastic Potential Energy of the attached Mass
    this.elasticPotentialEnergyProperty = new DerivedProperty([this.springConstantProperty, this.displacementProperty], (springConstant, displacement) => 0.5 * springConstant * Math.pow(displacement, 2));

    // @public {Property.<number>} Thermal Energy of the attached Mass
    this.thermalEnergyProperty = new DynamicProperty(this.massAttachedProperty, {
      derive: 'thermalEnergyProperty',
      defaultValue: 0
    });

    // @public {Property.<boolean>} Flag to enable the stop button for the spring.
    this.buttonEnabledProperty = new BooleanProperty(false);

    // @public {Property.<number>} (read-only) length of the spring, units = m
    this.lengthProperty = new DerivedProperty([this.naturalRestingLengthProperty, this.displacementProperty], (naturalRestingLength, displacement) => naturalRestingLength - displacement, {
      tandem: tandem.createTandem('lengthProperty'),
      units: 'm',
      range: new Range(0, Number.POSITIVE_INFINITY),
      phetioValueType: NumberIO
    });

    // @public {Property.<number>} (read-only) y position of the bottom end of the spring, units = m
    this.bottomProperty = new DerivedProperty([this.positionProperty, this.lengthProperty], (position, length) => position.y - length, {
      tandem: tandem.createTandem('bottomProperty'),
      units: 'm',
      range: new Range(0, Number.POSITIVE_INFINITY),
      phetioValueType: NumberIO
    });

    // Links are used to set damping Property of each spring to the damping property of the system
    dampingProperty.link(newDamping => {
      assert && assert(newDamping >= 0, `damping must be greater than or equal to 0: ${newDamping}`);
      this.dampingCoefficientProperty.set(newDamping);
    });

    // @public {Property.<number>}(read-only) y position of the equilibrium position
    this.equilibriumYPositionProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('equilibriumYPositionProperty'),
      units: 'm',
      range: new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
    });

    // Set the equilibrium position when a mass is attached to the spring.
    // We do a similar process in Mass.js when the mass value changes.
    Multilink.multilink([this.springConstantProperty, this.gravityProperty, this.massAttachedProperty, this.naturalRestingLengthProperty], (springConstant, gravity, mass, naturalRestingLength) => {
      if (mass) {
        // springExtension = mg/k
        const springExtension = mass.massProperty.value * this.gravityProperty.value / this.springConstantProperty.value;

        //Set equilibrium y position
        this.equilibriumYPositionProperty.set(this.positionProperty.get().y - naturalRestingLength - springExtension);

        // Set mass equilibrium y position
        this.massEquilibriumYPositionProperty.set(this.positionProperty.get().y - naturalRestingLength - springExtension - mass.heightProperty.value / 2);
      }
    });

    // @public {Property.<number>} y position of the equilibrium position centered on mass's center of mass
    this.massEquilibriumYPositionProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('equilibriumYPositionProperty'),
      units: 'm',
      range: new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
    });
    const massCenterOfMassProperty = new DynamicProperty(this.massAttachedProperty, {
      derive: 'centerOfMassPositionProperty',
      defaultValue: null
    });
    Multilink.multilink([this.massEquilibriumYPositionProperty, massCenterOfMassProperty], (massEquilibriumYPosition, massCenterOfMass) => {
      if (massCenterOfMass !== null) {
        this.massEquilibriumDisplacementProperty.set(massCenterOfMass.y - massEquilibriumYPosition);
      }
    });

    // Set the equilibrium position when a mass is attached to the spring.
    // We do a similar process in Mass.js when the mass value changes.
    Multilink.multilink([this.springConstantProperty, this.gravityProperty, this.massAttachedProperty, this.naturalRestingLengthProperty], (springConstant, gravity, mass, naturalRestingLength) => {
      if (mass) {
        // springExtension = mg/k
        const springExtensionValue = mass.massProperty.value * this.gravityProperty.value / this.springConstantProperty.value;
        this.massEquilibriumYPositionProperty.set(this.positionProperty.get().y - naturalRestingLength - springExtensionValue - mass.heightProperty.value / 2);
      }
    });
    this.springConstantProperty.link(springConstant => {
      this.updateThickness(this.naturalRestingLengthProperty.get(), springConstant);
    });

    // When the length of the spring is adjusted we need to adjust the position of the attached mass.
    this.naturalRestingLengthProperty.link(() => {
      if (this.massAttachedProperty.value) {
        this.setMass(this.massAttachedProperty.get());
      }
    });

    // @public {null|PeriodTrace} The spring should be aware of its period trace.
    // See https://github.com/phetsims/masses-and-springs-basics/issues/58
    this.periodTrace = null;

    // @public {Property.<boolean>} Responsible for the visibility of the period trace. Used in a verticalCheckboxGroup
    this.periodTraceVisibilityProperty = new BooleanProperty(false);

    // @public {Emitter} used to determine when the period tracer should alternate directions
    this.peakEmitter = new Emitter({
      parameters: [{
        valueType: 'number'
      }]
    });

    // @public {Emitter} used to determine when the mass has crossed over its equilibrium position while oscillating
    this.crossEmitter = new Emitter();

    // @public {Emitter} used to determine when to reset the periodTrace state
    this.periodTraceResetEmitter = new Emitter();
    this.massEquilibriumDisplacementProperty.link((newValue, oldValue) => {
      if (oldValue >= 0 !== newValue >= 0 && oldValue !== null && newValue !== null) {
        this.crossEmitter.emit();
      }
    });
  }

  /**
   * @public
   */
  reset() {
    this.buttonEnabledProperty.reset();
    this.gravityProperty.reset();
    this.displacementProperty.reset();
    this.dampingCoefficientProperty.reset();
    this.positionProperty.reset();
    this.naturalRestingLengthProperty.reset();
    this.massAttachedProperty.reset();
    this.springConstantProperty.reset();
    this.animatingProperty.reset();
    this.massEquilibriumDisplacementProperty.reset();
    this.periodTraceVisibilityProperty.reset();
  }

  /**
   * Retains the properties of the spring in an object that can publicly accessed.
   * @public
   *
   * @returns {Object}
   */
  getSpringState() {
    return {
      displacement: this.displacementProperty.get(),
      gravity: this.gravityProperty.get(),
      dampingCoefficient: this.dampingCoefficientProperty.get(),
      position: this.positionProperty.get(),
      naturalRestingLength: this.naturalRestingLengthProperty.get(),
      mass: this.massAttachedProperty.get(),
      springConstant: this.springConstantProperty.get(),
      thickness: this.thicknessProperty.get()
    };
  }

  /**
   * Sets the properties of the spring with previously stored properties.
   * @param {Object} springState - Sets the springs's properties with previously stored properties. See getSpringState
   *
   * @public
   */
  setSpringState(springState) {
    this.displacementProperty.set(springState.displacement);
    this.gravityProperty.set(springState.gravity);
    this.dampingCoefficientProperty.set(springState.dampingCoefficient);
    this.positionProperty.set(springState.position);
    this.naturalRestingLengthProperty.set(springState.naturalRestingLength);
    this.massAttachedProperty.set(springState.mass);
    this.springConstantProperty.set(springState.springConstant);
    this.thicknessProperty.set(springState.thickness);
  }

  /**
   * Updates thickness of spring and sets its thickness Property to calculated value. This is not handled internally
   * by the spring because the intro model determines the conditions for updating thickness.
   * @public
   *
   * @param {number} length  natural resting length of spring
   * @param {number} springConstant current spring constant of spring
   */
  updateThickness(length, springConstant) {
    // We are increasing the significance of the spring constant term by adding an exponent,
    // which is empirically determined.
    const thickness = this.thicknessProperty.initialValue * springConstant / this.springConstantProperty.initialValue * length / this.naturalRestingLengthProperty.initialValue;
    this.thicknessProperty.set(thickness);
  }

  /**
   * Updates springConstant of spring and sets its spring constant Property to calculated value. This is not handled
   * internally by the spring because the intro model determines the conditions for updating spring constant.
   * @public
   *
   * @param length {number} current natural resting length of spring
   * @param thickness number {number} current thickness of spring
   */
  updateSpringConstant(length, thickness) {
    const springConstant = this.naturalRestingLengthProperty.initialValue / length * thickness / this.thicknessProperty.initialValue * this.springConstantProperty.initialValue;
    this.springConstantProperty.set(springConstant);
  }

  /**
   * Removes mass from spring.
   *
   * @public
   */
  removeMass() {
    if (this.massAttachedProperty.get()) {
      this.massAttachedProperty.get().detach();
    }
    this.displacementProperty.set(0);
    this.massAttachedProperty.set(null);
    this.buttonEnabledProperty.set(false);
  }

  /**
   * Updates the displacement Property of the spring.
   * @param {number} yPosition
   * @param {boolean} factorNaturalLength
   *
   * @public
   */
  updateDisplacement(yPosition, factorNaturalLength) {
    if (factorNaturalLength) {
      this.displacementProperty.set(this.massAttachedProperty.value.positionProperty.value.y - (yPosition - this.naturalRestingLengthProperty.value) - MassesAndSpringsConstants.HOOK_CENTER);
    } else {
      this.displacementProperty.set(-(this.positionProperty.value.y - this.naturalRestingLengthProperty.value) + yPosition - MassesAndSpringsConstants.HOOK_CENTER);
    }
  }

  /**
   * Sets mass on spring
   * @param {Mass} mass
   *
   * @public
   */
  setMass(mass) {
    if (this.massAttachedProperty.get()) {
      this.massAttachedProperty.get().detach();
    }
    this.massAttachedProperty.set(mass);
    this.massAttachedProperty.get().springProperty.set(this);
    this.updateDisplacement(this.positionProperty.value.y, true);
    this.massAttachedProperty.get().verticalVelocityProperty.set(0);
  }

  /**
   * Stop spring motion by setting the displacement to the spring's extension, which is the length from the natural
   * resting position. This will also stop the spring from further oscillation.
   *
   * @public
   */
  stopSpring() {
    // check if mass attached on spring
    if (this.massAttachedProperty.get()) {
      const mass = this.massAttachedProperty.get();
      mass.initialTotalEnergyProperty.set(mass.totalEnergyProperty.value);

      // set displacement and stop further animation
      const springExtensionValue = mass.massProperty.value * this.gravityProperty.value / this.springConstantProperty.value;
      this.displacementProperty.set(-springExtensionValue);

      // place that mass at the correct position as well
      mass.positionProperty.set(new Vector2(this.positionProperty.get().x, this.equilibriumYPositionProperty.get() + MassesAndSpringsConstants.HOOK_CENTER));
      mass.verticalVelocityProperty.set(0);
      this.buttonEnabledProperty.set(false);
    }
  }

  /**
   * Responsible for oscillatory motion of spring system.
   * @public
   *
   * The motion is based off of a driven harmonic oscillator
   * (https://en.wikipedia.org/wiki/Harmonic_oscillator#Driven_harmonic_oscillators), which satisfies the
   * differential equation:
   *
   * x''(t) + 2ζω₀ x'(t) + ω₀² x(t) = -g
   *
   * where `t` is the time, `g` is the gravitational acceleration constant, and for our case we apply the
   * substitutions:
   *
   * ζ = sqrt(k/m)
   * ω₀ = c/(2 * sqrt(m*k))
   *
   * The solution to the differential equation gives essentially two different cases:
   * - Underdamped/overdamped (c²-4km != 0) where we can actually solve both with the same code by using complex
   *   numbers.
   * - Critically damped (c²-4km = 0), which would cause division by zero in the above case, so a different formula
   *   is needed.
   *
   * The formulas were easiest to compute in Mathematica (see assets/mass-spring-lab.nb), but essentially we use the
   * built-in solver and simplifier for both cases:
   *
   * For the overdamped/underdamped case:
   *   FullSimplify[
   *    DSolve[{(x''[t] + 2*zeta*omega0*x'[t] + omega0^2*x[t] == -g) /. subs,
   *       x'[0] == v1, x[0] == x1}, x[t], t], {Element[t, Reals],
   *     Element[v1, Reals], Element[x1, Reals], Element[m, Reals],
   *     Element[g, Reals], Element[c, Reals], Element[k, Reals], m > 0,
   *     g > 0, c >= 0, k > 0, c^2 < 4*k*m}]
   *
   * Resulting in:
   *   1/(2 k^(3/2) Sqrt[c^2-4 k m]) E^(-((t (c+I Sqrt[4 k m-c^2]))/(2 m))) (c Sqrt[k] (-1+E^((I t Sqrt[4 k m-c^2])/m))
   *   (g m+k x1)+I g m Sqrt[k (4 k m-c^2)] (E^((I t Sqrt[4 k m-c^2])/m)-2 E^((t (c+I Sqrt[4 k m-c^2]))/(2 m))+1)+2
   *   k^(3/2) m v1 E^((I t Sqrt[4 k m-c^2])/m)+I x1 Sqrt[k^3 (4 k m-c^2)] E^((I t Sqrt[4 k m-c^2])/m)+I x1 Sqrt[k^3
   *   (4 k m-c^2)]-2 k^(3/2) m v1)
   *
   * For the critically damped case:
   *   FullSimplify[
   *    DSolve[{(x''[t] + 2*zeta*omega0*x'[t] + omega0^2*x[t] == -g) /.
   *        subs /. {c -> Sqrt[4*k*m]}, x'[0] == v1, x[0] == x1}, x[t],
   *     t], {Element[t, Reals], Element[v1, Reals], Element[x1, Reals],
   *     Element[m, Reals], Element[g, Reals], Element[k, Reals], m > 0,
   *     g > 0, k > 0}]
   *
   * Resulting in:
   *   (E^(t (-Sqrt[(k/m)])) (g (m (-E^(t Sqrt[k/m]))+t Sqrt[k m]+m)+k (t (x1 Sqrt[k/m]+v1)+x1)))/k
   *
   * The code below basically factors out common subexpressions of these formulas, making them more efficient to
   * compute.
   *
   * We can use them by essentially using `t` as the timestep (dt), to compute the change for any arbitrary dt.
   * Only the constants need to be plugged in, and only the position/velocity are smoothly varying over time.
   *
   * @param {number} dt - animation time step
   */
  step(dt) {
    if (this.massAttachedProperty.get() && !this.massAttachedProperty.get().userControlledProperty.get()) {
      this.massAttachedProperty.get().preserveThermalEnergy = false;
      const k = this.springConstantProperty.get();
      const m = this.massAttachedProperty.get().massProperty.get();
      const c = this.dampingCoefficientProperty.get();
      const v = this.massAttachedProperty.get().verticalVelocityProperty.get();
      const x = this.displacementProperty.get();
      const g = this.gravityProperty.get();

      // Underdamped and Overdamped case
      if (c * c - 4 * k * m !== 0) {
        // Precompute expressions used more than twice (for performance).
        const km = k * m;
        const gm = g * m;
        const tDm = dt / m;
        const kx = k * x;
        const c2 = c * c;
        const kR2 = Math.sqrt(k);
        const k3R2 = k * kR2;
        const twok3R2mv = Complex.real(2 * k3R2 * m * v);
        const alpha = Complex.real(4 * km - c2).sqrt();
        const alphaI = alpha.times(Complex.I);
        const alphaPrime = Complex.real(c2 - 4 * km).sqrt();
        const alphatD2m = Complex.real(tDm / 2).multiply(alpha);
        const beta = Complex.real(tDm).multiply(alphaI).exponentiate();
        const eta = Complex.real(c).add(alphaI).multiply(Complex.real(tDm / 2)).exponentiate().multiply(Complex.real(2));

        // Calculate new displacement
        let coef = Complex.ONE.dividedBy(Complex.real(k3R2).multiply(alphaPrime).multiply(eta));
        let A = beta.minus(Complex.ONE).multiply(Complex.real(c * kR2 * (gm + kx)));
        let B = Complex.real(gm * kR2).multiply(alphaI).multiply(beta.minus(eta).add(Complex.ONE));
        const C = twok3R2mv.times(beta);
        const D = Complex.real(k3R2 * x).multiply(alphaI);
        const E = D.times(beta);
        let newDisplacement = coef.multiply(A.add(B).add(C).add(D).add(E).subtract(twok3R2mv)).real;

        // Calculate new velocity
        coef = Complex.real(-Math.exp(-c * dt / (2 * m)) / (2 * k3R2 * m)).divide(alphaPrime).multiply(Complex.I);
        A = alphatD2m.sinOf().multiply(Complex.real(kR2 * (gm + kx)).multiply(alpha.squared().add(Complex.real(c2))).add(twok3R2mv.times(Complex.real(c))));
        B = alphatD2m.cos().multiply(twok3R2mv).multiply(alpha).multiply(Complex.real(-1));
        const newVelocity = A.add(B).multiply(coef).real;

        //  Stop the alternation between +/- in overdamped displacement
        if (c * c - 4 * k * m > 0) {
          newDisplacement = this.displacementProperty.get() > 0 ? Math.abs(newDisplacement) : -Math.abs(newDisplacement);
        }

        // In this case ( c * c - 4 * k m < 0 ) and we are underdamped.
        // Squelch noise after coming to rest with tolerance of 1 micron
        if (Math.abs(this.displacementProperty.get() - newDisplacement) < 1e-6 && Math.abs(this.massAttachedProperty.get().verticalVelocityProperty.get()) < 1e-6) {
          this.displacementProperty.set(-m * g / k); // Equilibrium length
          this.massAttachedProperty.get().verticalVelocityProperty.set(0);
        } else {
          this.displacementProperty.set(newDisplacement);
          this.massAttachedProperty.get().verticalVelocityProperty.set(newVelocity);
        }
        assert && assert(!isNaN(this.displacementProperty.get()), 'displacement must be a number');
        assert && assert(!isNaN(this.massAttachedProperty.get().verticalVelocityProperty.get()), 'velocity must be a number');
      }

      // Critically damped case
      else {
        const omega = Math.sqrt(k / m);
        const phi = Math.exp(dt * omega);
        this.displacementProperty.set((g * (-m * phi + dt * Math.sqrt(k * m) + m) + k * (dt * (x * omega + v) + x)) / (phi * k));
        this.massAttachedProperty.get().verticalVelocityProperty.set((g * m * (Math.sqrt(k * m) - omega * (m + dt * Math.sqrt(k * m))) - k * (m * v * (omega * dt - 1) + k * dt * x)) / (phi * k * m));
      }
      this.massAttachedProperty.get().positionProperty.set(new Vector2(this.positionProperty.get().x, this.bottomProperty.get() + MassesAndSpringsConstants.HOOK_CENTER));
      this.buttonEnabledProperty.set(this.massAttachedProperty.get().verticalVelocityProperty.get() !== 0);
      this.massAttachedProperty.get().preserveThermalEnergy = true;
    }
  }
}
massesAndSprings.register('Spring', Spring);
Spring.SpringIO = new IOType('SpringIO', {
  valueType: Spring,
  documentation: 'Hangs from the ceiling and applies a force to any attached BodyIO',
  supertype: ReferenceIO(IOType.ObjectIO)
});
export default Spring;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJEeW5hbWljUHJvcGVydHkiLCJFbWl0dGVyIiwiTXVsdGlsaW5rIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkNvbXBsZXgiLCJSYW5nZSIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJJT1R5cGUiLCJOdW1iZXJJTyIsIlJlZmVyZW5jZUlPIiwibWFzc2VzQW5kU3ByaW5ncyIsIk1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMiLCJERUZBVUxUX1RISUNLTkVTUyIsIlNwcmluZyIsImNvbnN0cnVjdG9yIiwicG9zaXRpb24iLCJpbml0aWFsTmF0dXJhbFJlc3RpbmdMZW5ndGgiLCJkYW1waW5nUHJvcGVydHkiLCJncmF2aXR5UHJvcGVydHkiLCJ0YW5kZW0iLCJhc3NlcnQiLCJmb3JjZXNPcmllbnRhdGlvblByb3BlcnR5IiwidmFsdWUiLCJyZWVudHJhbnQiLCJsaW5rIiwiZ3Jhdml0eSIsInNldCIsImRpc3BsYWNlbWVudFByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwidW5pdHMiLCJyYW5nZSIsIk51bWJlciIsIk5FR0FUSVZFX0lORklOSVRZIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJtYXNzRXF1aWxpYnJpdW1ZUG9zaXRpb25Qcm9wZXJ0eSIsIm1hc3NFcXVpbGlicml1bURpc3BsYWNlbWVudFByb3BlcnR5Iiwic3ByaW5nQ29uc3RhbnRQcm9wZXJ0eSIsIlNQUklOR19DT05TVEFOVF9SQU5HRSIsImRlZmF1bHRWYWx1ZSIsInNwcmluZ0ZvcmNlUHJvcGVydHkiLCJkaXNwbGFjZW1lbnQiLCJzcHJpbmdDb25zdGFudCIsInBoZXRpb1ZhbHVlVHlwZSIsImRhbXBpbmdDb2VmZmljaWVudFByb3BlcnR5IiwicG9zaXRpb25Qcm9wZXJ0eSIsIm5hdHVyYWxSZXN0aW5nTGVuZ3RoUHJvcGVydHkiLCJ0aGlja25lc3NQcm9wZXJ0eSIsInVwZGF0ZVRoaWNrbmVzcyIsImdldCIsImFuaW1hdGluZ1Byb3BlcnR5IiwibWFzc0F0dGFjaGVkUHJvcGVydHkiLCJraW5ldGljRW5lcmd5UHJvcGVydHkiLCJkZXJpdmUiLCJncmF2aXRhdGlvbmFsUG90ZW50aWFsRW5lcmd5UHJvcGVydHkiLCJlbGFzdGljUG90ZW50aWFsRW5lcmd5UHJvcGVydHkiLCJNYXRoIiwicG93IiwidGhlcm1hbEVuZXJneVByb3BlcnR5IiwiYnV0dG9uRW5hYmxlZFByb3BlcnR5IiwibGVuZ3RoUHJvcGVydHkiLCJuYXR1cmFsUmVzdGluZ0xlbmd0aCIsImJvdHRvbVByb3BlcnR5IiwibGVuZ3RoIiwieSIsIm5ld0RhbXBpbmciLCJlcXVpbGlicml1bVlQb3NpdGlvblByb3BlcnR5IiwibXVsdGlsaW5rIiwibWFzcyIsInNwcmluZ0V4dGVuc2lvbiIsIm1hc3NQcm9wZXJ0eSIsImhlaWdodFByb3BlcnR5IiwibWFzc0NlbnRlck9mTWFzc1Byb3BlcnR5IiwibWFzc0VxdWlsaWJyaXVtWVBvc2l0aW9uIiwibWFzc0NlbnRlck9mTWFzcyIsInNwcmluZ0V4dGVuc2lvblZhbHVlIiwic2V0TWFzcyIsInBlcmlvZFRyYWNlIiwicGVyaW9kVHJhY2VWaXNpYmlsaXR5UHJvcGVydHkiLCJwZWFrRW1pdHRlciIsInBhcmFtZXRlcnMiLCJ2YWx1ZVR5cGUiLCJjcm9zc0VtaXR0ZXIiLCJwZXJpb2RUcmFjZVJlc2V0RW1pdHRlciIsIm5ld1ZhbHVlIiwib2xkVmFsdWUiLCJlbWl0IiwicmVzZXQiLCJnZXRTcHJpbmdTdGF0ZSIsImRhbXBpbmdDb2VmZmljaWVudCIsInRoaWNrbmVzcyIsInNldFNwcmluZ1N0YXRlIiwic3ByaW5nU3RhdGUiLCJpbml0aWFsVmFsdWUiLCJ1cGRhdGVTcHJpbmdDb25zdGFudCIsInJlbW92ZU1hc3MiLCJkZXRhY2giLCJ1cGRhdGVEaXNwbGFjZW1lbnQiLCJ5UG9zaXRpb24iLCJmYWN0b3JOYXR1cmFsTGVuZ3RoIiwiSE9PS19DRU5URVIiLCJzcHJpbmdQcm9wZXJ0eSIsInZlcnRpY2FsVmVsb2NpdHlQcm9wZXJ0eSIsInN0b3BTcHJpbmciLCJpbml0aWFsVG90YWxFbmVyZ3lQcm9wZXJ0eSIsInRvdGFsRW5lcmd5UHJvcGVydHkiLCJ4Iiwic3RlcCIsImR0IiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsInByZXNlcnZlVGhlcm1hbEVuZXJneSIsImsiLCJtIiwiYyIsInYiLCJnIiwia20iLCJnbSIsInREbSIsImt4IiwiYzIiLCJrUjIiLCJzcXJ0IiwiazNSMiIsInR3b2szUjJtdiIsInJlYWwiLCJhbHBoYSIsImFscGhhSSIsInRpbWVzIiwiSSIsImFscGhhUHJpbWUiLCJhbHBoYXREMm0iLCJtdWx0aXBseSIsImJldGEiLCJleHBvbmVudGlhdGUiLCJldGEiLCJhZGQiLCJjb2VmIiwiT05FIiwiZGl2aWRlZEJ5IiwiQSIsIm1pbnVzIiwiQiIsIkMiLCJEIiwiRSIsIm5ld0Rpc3BsYWNlbWVudCIsInN1YnRyYWN0IiwiZXhwIiwiZGl2aWRlIiwic2luT2YiLCJzcXVhcmVkIiwiY29zIiwibmV3VmVsb2NpdHkiLCJhYnMiLCJpc05hTiIsIm9tZWdhIiwicGhpIiwicmVnaXN0ZXIiLCJTcHJpbmdJTyIsImRvY3VtZW50YXRpb24iLCJzdXBlcnR5cGUiLCJPYmplY3RJTyJdLCJzb3VyY2VzIjpbIlNwcmluZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZXNwb25zaWJsZSBmb3IgdGhlIGF0dHJpYnV0ZXMgYXNzb2NpYXRlZCB3aXRoIGVhY2ggc3ByaW5nLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hdHQgUGVubmluZ3RvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRHluYW1pY1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRHluYW1pY1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQ29tcGxleCBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQ29tcGxleC5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVtYmVySU8uanMnO1xyXG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IG1hc3Nlc0FuZFNwcmluZ3MgZnJvbSAnLi4vLi4vbWFzc2VzQW5kU3ByaW5ncy5qcyc7XHJcbmltcG9ydCBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzIGZyb20gJy4uL01hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IERFRkFVTFRfVEhJQ0tORVNTID0gMzsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5cclxuY2xhc3MgU3ByaW5nIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uIC0gY29vcmRpbmF0ZXMgb2YgdGhlIHRvcCBjZW50ZXIgb2YgdGhlIHNwcmluZ1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbml0aWFsTmF0dXJhbFJlc3RpbmdMZW5ndGggLSBpbml0aWFsIHJlc3RpbmcgbGVuZ3RoIG9mIHVud2VpZ2h0ZWQgc3ByaW5nIGluIG1cclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSBkYW1waW5nUHJvcGVydHkgLSB1c2VkIGZvciB2aXNjb3VzIGRhbXBpbmcgY29lZmZpY2llbnQgKE4ucy9tKSBvZiB0aGUgc3lzdGVtXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48bnVtYmVyPn0gZ3Jhdml0eVByb3BlcnR5IC0gdGhlIGdyYXZpdHkgUHJvcGVydHkgZnJvbSB0aGUgbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICpcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcG9zaXRpb24sIGluaXRpYWxOYXR1cmFsUmVzdGluZ0xlbmd0aCwgZGFtcGluZ1Byb3BlcnR5LCBncmF2aXR5UHJvcGVydHksIHRhbmRlbSApIHtcclxuXHJcbiAgICAvLyB2YWxpZGF0ZSBhbmQgc2F2ZSBvcHRpb25zXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbml0aWFsTmF0dXJhbFJlc3RpbmdMZW5ndGggPiAwLCBgbmF0dXJhbFJlc3RpbmdMZW5ndGggbXVzdCBiZSA+IDAgOiAke1xyXG4gICAgICBpbml0aWFsTmF0dXJhbFJlc3RpbmdMZW5ndGh9YCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSAocmVhZC13cml0ZSkgVXNlZCB0byBwb3NpdGlvbiBtYXNzTm9kZSBmb3JjZXMuIFJpZ2h0IHNpZGU6IDEsIExlZnQgc2lkZTogLTFcclxuICAgIHRoaXMuZm9yY2VzT3JpZW50YXRpb25Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXJ8bnVsbD59IGdyYXZpdGF0aW9uYWwgYWNjZWxlcmF0aW9uXHJcbiAgICB0aGlzLmdyYXZpdHlQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZ3Jhdml0eVByb3BlcnR5LnZhbHVlLCB7XHJcbiAgICAgIHJlZW50cmFudDogdHJ1ZSAvLyB1c2VkIGR1ZSB0byBleHRyZW1lbHkgc21hbGwgcm91bmRpbmdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBMaW5rIHRvIG1hbmFnZSBncmF2aXR5IHZhbHVlIGZvciB0aGUgc3ByaW5nIG9iamVjdC4gU3ByaW5ncyBleGlzdHMgdGhyb3VnaG91dCBzaW0gbGlmZXRpbWUgc28gbm8gbmVlZCBmb3IgdW5saW5rLlxyXG4gICAgZ3Jhdml0eVByb3BlcnR5LmxpbmsoIGdyYXZpdHkgPT4ge1xyXG4gICAgICB0aGlzLmdyYXZpdHlQcm9wZXJ0eS5zZXQoIGdyYXZpdHkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyAgQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IGRpc3RhbmNlIGZyb20gdGhlIGJvdHRvbSBvZiB0aGUgc3ByaW5nIGZyb20gdGhlIG5hdHVyYWwgcmVzdGluZyBwb3NpdGlvblxyXG4gICAgdGhpcy5kaXNwbGFjZW1lbnRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkaXNwbGFjZW1lbnRQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdtJyxcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSB5IHBvc2l0aW9uIG9mIHRoZSBlcXVpbGlicml1bSBwb3NpdGlvbiBjZW50ZXJlZCBvbiBtYXNzJ3MgY2VudGVyIG9mIG1hc3NcclxuICAgIHRoaXMubWFzc0VxdWlsaWJyaXVtWVBvc2l0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsXHJcbiAgICAgIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlcXVpbGlicml1bVlQb3NpdGlvblByb3BlcnR5JyApLFxyXG4gICAgICAgIHVuaXRzOiAnbScsXHJcbiAgICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcnxudWxsPn0gZGlzdGFuY2UgZnJvbSBvZiB0aGUgYm90dG9tIG9mIHRoZSBzcHJpbmcgZnJvbSB0aGUgbWFzc0VxdWlsaWJyaXVtWVBvc2l0aW9uXHJcbiAgICB0aGlzLm1hc3NFcXVpbGlicml1bURpc3BsYWNlbWVudFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IHNwcmluZyBjb25zdGFudCBvZiBzcHJpbmdcclxuICAgIHRoaXMuc3ByaW5nQ29uc3RhbnRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5TUFJJTkdfQ09OU1RBTlRfUkFOR0UuZGVmYXVsdFZhbHVlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NwcmluZ0NvbnN0YW50UHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnTi9tJyxcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMywgNjAgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSBzcHJpbmcgZm9yY2VcclxuICAgIHRoaXMuc3ByaW5nRm9yY2VQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgdGhpcy5kaXNwbGFjZW1lbnRQcm9wZXJ0eSwgdGhpcy5zcHJpbmdDb25zdGFudFByb3BlcnR5IF0sXHJcbiAgICAgICggZGlzcGxhY2VtZW50LCBzcHJpbmdDb25zdGFudCApID0+IC1zcHJpbmdDb25zdGFudCAqIGRpc3BsYWNlbWVudCxcclxuICAgICAge1xyXG4gICAgICAgIHVuaXRzOiAnTicsXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdW1iZXJJT1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSB2aXNjb3VzIGRhbXBpbmcgY29lZmZpY2llbnQgb2YgdGhlIHN5c3RlbVxyXG4gICAgdGhpcy5kYW1waW5nQ29lZmZpY2llbnRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggZGFtcGluZ1Byb3BlcnR5LnZhbHVlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RhbXBpbmdDb2VmZmljaWVudFByb3BlcnR5JyApLFxyXG4gICAgICB1bml0czogJ05cXHUwMGI3cy9tJyxcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBwb3NpdGlvbiBvZiB0aGUgc3ByaW5nLCBvcmlnaW5hdGVkIGF0IHRoZSB0b3AtY2VudGVyIG9mIHRoZSBzcHJpbmcgbm9kZVxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggcG9zaXRpb24sIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncG9zaXRpb25Qcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSBsZW5ndGggb2YgdGhlIHNwcmluZyB3aXRob3V0IG1hc3MgYXR0YWNoZWRcclxuICAgIHRoaXMubmF0dXJhbFJlc3RpbmdMZW5ndGhQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggaW5pdGlhbE5hdHVyYWxSZXN0aW5nTGVuZ3RoLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ25hdHVyYWxSZXN0aW5nTGVuZ3RoUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnbScsXHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAuMSwgMC41IClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPiByZWFkLW9ubHl9IGxpbmUgd2lkdGggb2Ygb3NjaWxsYXRpbmcgc3ByaW5nIG5vZGVcclxuICAgIHRoaXMudGhpY2tuZXNzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIERFRkFVTFRfVEhJQ0tORVNTLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RoaWNrbmVzc1Byb3BlcnR5JyApLFxyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ2FsbGluZyB0aGlzIGZ1bmN0aW9uIGhlcmUgd2lsbCBzZXQgYSBjYWxjdWxhdGVkIHZhbHVlIGZvciB0aGUgdGhpY2tuZXNzIHByb3BlcnR5LlxyXG4gICAgdGhpcy51cGRhdGVUaGlja25lc3MoIHRoaXMubmF0dXJhbFJlc3RpbmdMZW5ndGhQcm9wZXJ0eS5nZXQoKSwgdGhpcy5zcHJpbmdDb25zdGFudFByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGFuaW1hdGlvbiBmb3IgdGhlIHNwcmluZyBpcyBwbGF5ZWQgb3Igbm90XHJcbiAgICB0aGlzLmFuaW1hdGluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYW5pbWF0aW5nUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48TWFzc3xudWxsPiByZWFkLXdyaXRlfSBUaGlzIGlzIHRoZSBNYXNzIG9iamVjdCB0aGF0IGlzIGF0dGFjaGVkIHRvIHRoZSBzcHJpbmdcclxuICAgIHRoaXMubWFzc0F0dGFjaGVkUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWFzc0F0dGFjaGVkUHJvcGVydHknIClcclxuICAgICAgLy8gcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBNYXNzSU8gKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSBLaW5ldGljIEVuZXJneSBvZiB0aGUgYXR0YWNoZWQgTWFzc1xyXG4gICAgdGhpcy5raW5ldGljRW5lcmd5UHJvcGVydHkgPSBuZXcgRHluYW1pY1Byb3BlcnR5KCB0aGlzLm1hc3NBdHRhY2hlZFByb3BlcnR5LCB7XHJcbiAgICAgIGRlcml2ZTogJ2tpbmV0aWNFbmVyZ3lQcm9wZXJ0eScsXHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogMFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSBHcmF2aXRhdGlvbmFsIFBvdGVudGlhbCBFbmVyZ3kgb2YgdGhlIGF0dGFjaGVkIE1hc3NcclxuICAgIHRoaXMuZ3Jhdml0YXRpb25hbFBvdGVudGlhbEVuZXJneVByb3BlcnR5ID0gbmV3IER5bmFtaWNQcm9wZXJ0eSggdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eSwge1xyXG4gICAgICBkZXJpdmU6ICdncmF2aXRhdGlvbmFsUG90ZW50aWFsRW5lcmd5UHJvcGVydHknLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IDBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gRWxhc3RpYyBQb3RlbnRpYWwgRW5lcmd5IG9mIHRoZSBhdHRhY2hlZCBNYXNzXHJcbiAgICB0aGlzLmVsYXN0aWNQb3RlbnRpYWxFbmVyZ3lQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgdGhpcy5zcHJpbmdDb25zdGFudFByb3BlcnR5LCB0aGlzLmRpc3BsYWNlbWVudFByb3BlcnR5IF0sXHJcbiAgICAgICggc3ByaW5nQ29uc3RhbnQsIGRpc3BsYWNlbWVudCApID0+IDAuNSAqIHNwcmluZ0NvbnN0YW50ICogTWF0aC5wb3coICggZGlzcGxhY2VtZW50ICksIDIgKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSBUaGVybWFsIEVuZXJneSBvZiB0aGUgYXR0YWNoZWQgTWFzc1xyXG4gICAgdGhpcy50aGVybWFsRW5lcmd5UHJvcGVydHkgPSBuZXcgRHluYW1pY1Byb3BlcnR5KCB0aGlzLm1hc3NBdHRhY2hlZFByb3BlcnR5LCB7XHJcbiAgICAgIGRlcml2ZTogJ3RoZXJtYWxFbmVyZ3lQcm9wZXJ0eScsXHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogMFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gRmxhZyB0byBlbmFibGUgdGhlIHN0b3AgYnV0dG9uIGZvciB0aGUgc3ByaW5nLlxyXG4gICAgdGhpcy5idXR0b25FbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSAocmVhZC1vbmx5KSBsZW5ndGggb2YgdGhlIHNwcmluZywgdW5pdHMgPSBtXHJcbiAgICB0aGlzLmxlbmd0aFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGlzLm5hdHVyYWxSZXN0aW5nTGVuZ3RoUHJvcGVydHksIHRoaXMuZGlzcGxhY2VtZW50UHJvcGVydHkgXSxcclxuICAgICAgKCBuYXR1cmFsUmVzdGluZ0xlbmd0aCwgZGlzcGxhY2VtZW50ICkgPT4gbmF0dXJhbFJlc3RpbmdMZW5ndGggLSBkaXNwbGFjZW1lbnQsXHJcbiAgICAgIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZW5ndGhQcm9wZXJ0eScgKSxcclxuICAgICAgICB1bml0czogJ20nLFxyXG4gICAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU9cclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gKHJlYWQtb25seSkgeSBwb3NpdGlvbiBvZiB0aGUgYm90dG9tIGVuZCBvZiB0aGUgc3ByaW5nLCB1bml0cyA9IG1cclxuICAgIHRoaXMuYm90dG9tUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSwgdGhpcy5sZW5ndGhQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHBvc2l0aW9uLCBsZW5ndGggKSA9PiBwb3NpdGlvbi55IC0gbGVuZ3RoLFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYm90dG9tUHJvcGVydHknICksXHJcbiAgICAgICAgdW5pdHM6ICdtJyxcclxuICAgICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKSxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bWJlcklPXHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gTGlua3MgYXJlIHVzZWQgdG8gc2V0IGRhbXBpbmcgUHJvcGVydHkgb2YgZWFjaCBzcHJpbmcgdG8gdGhlIGRhbXBpbmcgcHJvcGVydHkgb2YgdGhlIHN5c3RlbVxyXG4gICAgZGFtcGluZ1Byb3BlcnR5LmxpbmsoIG5ld0RhbXBpbmcgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZXdEYW1waW5nID49IDAsIGBkYW1waW5nIG11c3QgYmUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIDA6ICR7bmV3RGFtcGluZ31gICk7XHJcbiAgICAgIHRoaXMuZGFtcGluZ0NvZWZmaWNpZW50UHJvcGVydHkuc2V0KCBuZXdEYW1waW5nICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59KHJlYWQtb25seSkgeSBwb3NpdGlvbiBvZiB0aGUgZXF1aWxpYnJpdW0gcG9zaXRpb25cclxuICAgIHRoaXMuZXF1aWxpYnJpdW1ZUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCxcclxuICAgICAge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VxdWlsaWJyaXVtWVBvc2l0aW9uUHJvcGVydHknICksXHJcbiAgICAgICAgdW5pdHM6ICdtJyxcclxuICAgICAgICByYW5nZTogbmV3IFJhbmdlKCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIGVxdWlsaWJyaXVtIHBvc2l0aW9uIHdoZW4gYSBtYXNzIGlzIGF0dGFjaGVkIHRvIHRoZSBzcHJpbmcuXHJcbiAgICAvLyBXZSBkbyBhIHNpbWlsYXIgcHJvY2VzcyBpbiBNYXNzLmpzIHdoZW4gdGhlIG1hc3MgdmFsdWUgY2hhbmdlcy5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFtcclxuICAgICAgICB0aGlzLnNwcmluZ0NvbnN0YW50UHJvcGVydHksXHJcbiAgICAgICAgdGhpcy5ncmF2aXR5UHJvcGVydHksXHJcbiAgICAgICAgdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLm5hdHVyYWxSZXN0aW5nTGVuZ3RoUHJvcGVydHlcclxuICAgICAgXSxcclxuICAgICAgKCBzcHJpbmdDb25zdGFudCwgZ3Jhdml0eSwgbWFzcywgbmF0dXJhbFJlc3RpbmdMZW5ndGggKSA9PiB7XHJcbiAgICAgICAgaWYgKCBtYXNzICkge1xyXG5cclxuICAgICAgICAgIC8vIHNwcmluZ0V4dGVuc2lvbiA9IG1nL2tcclxuICAgICAgICAgIGNvbnN0IHNwcmluZ0V4dGVuc2lvbiA9ICggbWFzcy5tYXNzUHJvcGVydHkudmFsdWUgKiB0aGlzLmdyYXZpdHlQcm9wZXJ0eS52YWx1ZSApIC8gdGhpcy5zcHJpbmdDb25zdGFudFByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgICAgICAgIC8vU2V0IGVxdWlsaWJyaXVtIHkgcG9zaXRpb25cclxuICAgICAgICAgIHRoaXMuZXF1aWxpYnJpdW1ZUG9zaXRpb25Qcm9wZXJ0eS5zZXQoXHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55IC0gbmF0dXJhbFJlc3RpbmdMZW5ndGggLSBzcHJpbmdFeHRlbnNpb24gKTtcclxuXHJcbiAgICAgICAgICAvLyBTZXQgbWFzcyBlcXVpbGlicml1bSB5IHBvc2l0aW9uXHJcbiAgICAgICAgICB0aGlzLm1hc3NFcXVpbGlicml1bVlQb3NpdGlvblByb3BlcnR5LnNldChcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLnkgLSBuYXR1cmFsUmVzdGluZ0xlbmd0aCAtIHNwcmluZ0V4dGVuc2lvbiAtIG1hc3MuaGVpZ2h0UHJvcGVydHkudmFsdWUgLyAyXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSB5IHBvc2l0aW9uIG9mIHRoZSBlcXVpbGlicml1bSBwb3NpdGlvbiBjZW50ZXJlZCBvbiBtYXNzJ3MgY2VudGVyIG9mIG1hc3NcclxuICAgIHRoaXMubWFzc0VxdWlsaWJyaXVtWVBvc2l0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsXHJcbiAgICAgIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlcXVpbGlicml1bVlQb3NpdGlvblByb3BlcnR5JyApLFxyXG4gICAgICAgIHVuaXRzOiAnbScsXHJcbiAgICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbWFzc0NlbnRlck9mTWFzc1Byb3BlcnR5ID0gbmV3IER5bmFtaWNQcm9wZXJ0eSggdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eSwge1xyXG4gICAgICBkZXJpdmU6ICdjZW50ZXJPZk1hc3NQb3NpdGlvblByb3BlcnR5JyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiBudWxsXHJcbiAgICB9ICk7XHJcblxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyB0aGlzLm1hc3NFcXVpbGlicml1bVlQb3NpdGlvblByb3BlcnR5LCBtYXNzQ2VudGVyT2ZNYXNzUHJvcGVydHkgXSxcclxuICAgICAgKCBtYXNzRXF1aWxpYnJpdW1ZUG9zaXRpb24sIG1hc3NDZW50ZXJPZk1hc3MgKSA9PiB7XHJcbiAgICAgICAgaWYgKCBtYXNzQ2VudGVyT2ZNYXNzICE9PSBudWxsICkge1xyXG4gICAgICAgICAgdGhpcy5tYXNzRXF1aWxpYnJpdW1EaXNwbGFjZW1lbnRQcm9wZXJ0eS5zZXQoIG1hc3NDZW50ZXJPZk1hc3MueSAtIG1hc3NFcXVpbGlicml1bVlQb3NpdGlvbiApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIFNldCB0aGUgZXF1aWxpYnJpdW0gcG9zaXRpb24gd2hlbiBhIG1hc3MgaXMgYXR0YWNoZWQgdG8gdGhlIHNwcmluZy5cclxuICAgIC8vIFdlIGRvIGEgc2ltaWxhciBwcm9jZXNzIGluIE1hc3MuanMgd2hlbiB0aGUgbWFzcyB2YWx1ZSBjaGFuZ2VzLlxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggW1xyXG4gICAgICAgIHRoaXMuc3ByaW5nQ29uc3RhbnRQcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLmdyYXZpdHlQcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLm1hc3NBdHRhY2hlZFByb3BlcnR5LFxyXG4gICAgICAgIHRoaXMubmF0dXJhbFJlc3RpbmdMZW5ndGhQcm9wZXJ0eVxyXG4gICAgICBdLFxyXG4gICAgICAoIHNwcmluZ0NvbnN0YW50LCBncmF2aXR5LCBtYXNzLCBuYXR1cmFsUmVzdGluZ0xlbmd0aCApID0+IHtcclxuICAgICAgICBpZiAoIG1hc3MgKSB7XHJcblxyXG4gICAgICAgICAgLy8gc3ByaW5nRXh0ZW5zaW9uID0gbWcva1xyXG4gICAgICAgICAgY29uc3Qgc3ByaW5nRXh0ZW5zaW9uVmFsdWUgPVxyXG4gICAgICAgICAgICAoIG1hc3MubWFzc1Byb3BlcnR5LnZhbHVlICogdGhpcy5ncmF2aXR5UHJvcGVydHkudmFsdWUgKSAvIHRoaXMuc3ByaW5nQ29uc3RhbnRQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICAgIHRoaXMubWFzc0VxdWlsaWJyaXVtWVBvc2l0aW9uUHJvcGVydHkuc2V0KFxyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSAtIG5hdHVyYWxSZXN0aW5nTGVuZ3RoIC0gc3ByaW5nRXh0ZW5zaW9uVmFsdWUgLSBtYXNzLmhlaWdodFByb3BlcnR5LnZhbHVlIC8gMlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNwcmluZ0NvbnN0YW50UHJvcGVydHkubGluayggc3ByaW5nQ29uc3RhbnQgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZVRoaWNrbmVzcyggdGhpcy5uYXR1cmFsUmVzdGluZ0xlbmd0aFByb3BlcnR5LmdldCgpLCBzcHJpbmdDb25zdGFudCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIGxlbmd0aCBvZiB0aGUgc3ByaW5nIGlzIGFkanVzdGVkIHdlIG5lZWQgdG8gYWRqdXN0IHRoZSBwb3NpdGlvbiBvZiB0aGUgYXR0YWNoZWQgbWFzcy5cclxuICAgIHRoaXMubmF0dXJhbFJlc3RpbmdMZW5ndGhQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIGlmICggdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLnNldE1hc3MoIHRoaXMubWFzc0F0dGFjaGVkUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bGx8UGVyaW9kVHJhY2V9IFRoZSBzcHJpbmcgc2hvdWxkIGJlIGF3YXJlIG9mIGl0cyBwZXJpb2QgdHJhY2UuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL21hc3Nlcy1hbmQtc3ByaW5ncy1iYXNpY3MvaXNzdWVzLzU4XHJcbiAgICB0aGlzLnBlcmlvZFRyYWNlID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IFJlc3BvbnNpYmxlIGZvciB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgcGVyaW9kIHRyYWNlLiBVc2VkIGluIGEgdmVydGljYWxDaGVja2JveEdyb3VwXHJcbiAgICB0aGlzLnBlcmlvZFRyYWNlVmlzaWJpbGl0eVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtFbWl0dGVyfSB1c2VkIHRvIGRldGVybWluZSB3aGVuIHRoZSBwZXJpb2QgdHJhY2VyIHNob3VsZCBhbHRlcm5hdGUgZGlyZWN0aW9uc1xyXG4gICAgdGhpcy5wZWFrRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7IHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6ICdudW1iZXInIH0gXSB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RW1pdHRlcn0gdXNlZCB0byBkZXRlcm1pbmUgd2hlbiB0aGUgbWFzcyBoYXMgY3Jvc3NlZCBvdmVyIGl0cyBlcXVpbGlicml1bSBwb3NpdGlvbiB3aGlsZSBvc2NpbGxhdGluZ1xyXG4gICAgdGhpcy5jcm9zc0VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0VtaXR0ZXJ9IHVzZWQgdG8gZGV0ZXJtaW5lIHdoZW4gdG8gcmVzZXQgdGhlIHBlcmlvZFRyYWNlIHN0YXRlXHJcbiAgICB0aGlzLnBlcmlvZFRyYWNlUmVzZXRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICB0aGlzLm1hc3NFcXVpbGlicml1bURpc3BsYWNlbWVudFByb3BlcnR5LmxpbmsoICggbmV3VmFsdWUsIG9sZFZhbHVlICkgPT4ge1xyXG4gICAgICBpZiAoICggb2xkVmFsdWUgPj0gMCApICE9PSAoIG5ld1ZhbHVlID49IDAgKSAmJiBvbGRWYWx1ZSAhPT0gbnVsbCAmJiBuZXdWYWx1ZSAhPT0gbnVsbCApIHtcclxuICAgICAgICB0aGlzLmNyb3NzRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuYnV0dG9uRW5hYmxlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmdyYXZpdHlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5kaXNwbGFjZW1lbnRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5kYW1waW5nQ29lZmZpY2llbnRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm5hdHVyYWxSZXN0aW5nTGVuZ3RoUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubWFzc0F0dGFjaGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc3ByaW5nQ29uc3RhbnRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5hbmltYXRpbmdQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5tYXNzRXF1aWxpYnJpdW1EaXNwbGFjZW1lbnRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wZXJpb2RUcmFjZVZpc2liaWxpdHlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0YWlucyB0aGUgcHJvcGVydGllcyBvZiB0aGUgc3ByaW5nIGluIGFuIG9iamVjdCB0aGF0IGNhbiBwdWJsaWNseSBhY2Nlc3NlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAqL1xyXG4gIGdldFNwcmluZ1N0YXRlKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZGlzcGxhY2VtZW50OiB0aGlzLmRpc3BsYWNlbWVudFByb3BlcnR5LmdldCgpLFxyXG4gICAgICBncmF2aXR5OiB0aGlzLmdyYXZpdHlQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgZGFtcGluZ0NvZWZmaWNpZW50OiB0aGlzLmRhbXBpbmdDb2VmZmljaWVudFByb3BlcnR5LmdldCgpLFxyXG4gICAgICBwb3NpdGlvbjogdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLFxyXG4gICAgICBuYXR1cmFsUmVzdGluZ0xlbmd0aDogdGhpcy5uYXR1cmFsUmVzdGluZ0xlbmd0aFByb3BlcnR5LmdldCgpLFxyXG4gICAgICBtYXNzOiB0aGlzLm1hc3NBdHRhY2hlZFByb3BlcnR5LmdldCgpLFxyXG4gICAgICBzcHJpbmdDb25zdGFudDogdGhpcy5zcHJpbmdDb25zdGFudFByb3BlcnR5LmdldCgpLFxyXG4gICAgICB0aGlja25lc3M6IHRoaXMudGhpY2tuZXNzUHJvcGVydHkuZ2V0KClcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBzcHJpbmcgd2l0aCBwcmV2aW91c2x5IHN0b3JlZCBwcm9wZXJ0aWVzLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzcHJpbmdTdGF0ZSAtIFNldHMgdGhlIHNwcmluZ3MncyBwcm9wZXJ0aWVzIHdpdGggcHJldmlvdXNseSBzdG9yZWQgcHJvcGVydGllcy4gU2VlIGdldFNwcmluZ1N0YXRlXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0U3ByaW5nU3RhdGUoIHNwcmluZ1N0YXRlICkge1xyXG4gICAgdGhpcy5kaXNwbGFjZW1lbnRQcm9wZXJ0eS5zZXQoIHNwcmluZ1N0YXRlLmRpc3BsYWNlbWVudCApO1xyXG4gICAgdGhpcy5ncmF2aXR5UHJvcGVydHkuc2V0KCBzcHJpbmdTdGF0ZS5ncmF2aXR5ICk7XHJcbiAgICB0aGlzLmRhbXBpbmdDb2VmZmljaWVudFByb3BlcnR5LnNldCggc3ByaW5nU3RhdGUuZGFtcGluZ0NvZWZmaWNpZW50ICk7XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkuc2V0KCBzcHJpbmdTdGF0ZS5wb3NpdGlvbiApO1xyXG4gICAgdGhpcy5uYXR1cmFsUmVzdGluZ0xlbmd0aFByb3BlcnR5LnNldCggc3ByaW5nU3RhdGUubmF0dXJhbFJlc3RpbmdMZW5ndGggKTtcclxuICAgIHRoaXMubWFzc0F0dGFjaGVkUHJvcGVydHkuc2V0KCBzcHJpbmdTdGF0ZS5tYXNzICk7XHJcbiAgICB0aGlzLnNwcmluZ0NvbnN0YW50UHJvcGVydHkuc2V0KCBzcHJpbmdTdGF0ZS5zcHJpbmdDb25zdGFudCApO1xyXG4gICAgdGhpcy50aGlja25lc3NQcm9wZXJ0eS5zZXQoIHNwcmluZ1N0YXRlLnRoaWNrbmVzcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGlja25lc3Mgb2Ygc3ByaW5nIGFuZCBzZXRzIGl0cyB0aGlja25lc3MgUHJvcGVydHkgdG8gY2FsY3VsYXRlZCB2YWx1ZS4gVGhpcyBpcyBub3QgaGFuZGxlZCBpbnRlcm5hbGx5XHJcbiAgICogYnkgdGhlIHNwcmluZyBiZWNhdXNlIHRoZSBpbnRybyBtb2RlbCBkZXRlcm1pbmVzIHRoZSBjb25kaXRpb25zIGZvciB1cGRhdGluZyB0aGlja25lc3MuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCAgbmF0dXJhbCByZXN0aW5nIGxlbmd0aCBvZiBzcHJpbmdcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc3ByaW5nQ29uc3RhbnQgY3VycmVudCBzcHJpbmcgY29uc3RhbnQgb2Ygc3ByaW5nXHJcbiAgICovXHJcbiAgdXBkYXRlVGhpY2tuZXNzKCBsZW5ndGgsIHNwcmluZ0NvbnN0YW50ICkge1xyXG5cclxuICAgIC8vIFdlIGFyZSBpbmNyZWFzaW5nIHRoZSBzaWduaWZpY2FuY2Ugb2YgdGhlIHNwcmluZyBjb25zdGFudCB0ZXJtIGJ5IGFkZGluZyBhbiBleHBvbmVudCxcclxuICAgIC8vIHdoaWNoIGlzIGVtcGlyaWNhbGx5IGRldGVybWluZWQuXHJcbiAgICBjb25zdCB0aGlja25lc3MgPSB0aGlzLnRoaWNrbmVzc1Byb3BlcnR5LmluaXRpYWxWYWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgKiBzcHJpbmdDb25zdGFudCAvIHRoaXMuc3ByaW5nQ29uc3RhbnRQcm9wZXJ0eS5pbml0aWFsVmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICogbGVuZ3RoIC8gdGhpcy5uYXR1cmFsUmVzdGluZ0xlbmd0aFByb3BlcnR5LmluaXRpYWxWYWx1ZTtcclxuICAgIHRoaXMudGhpY2tuZXNzUHJvcGVydHkuc2V0KCB0aGlja25lc3MgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgc3ByaW5nQ29uc3RhbnQgb2Ygc3ByaW5nIGFuZCBzZXRzIGl0cyBzcHJpbmcgY29uc3RhbnQgUHJvcGVydHkgdG8gY2FsY3VsYXRlZCB2YWx1ZS4gVGhpcyBpcyBub3QgaGFuZGxlZFxyXG4gICAqIGludGVybmFsbHkgYnkgdGhlIHNwcmluZyBiZWNhdXNlIHRoZSBpbnRybyBtb2RlbCBkZXRlcm1pbmVzIHRoZSBjb25kaXRpb25zIGZvciB1cGRhdGluZyBzcHJpbmcgY29uc3RhbnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIGxlbmd0aCB7bnVtYmVyfSBjdXJyZW50IG5hdHVyYWwgcmVzdGluZyBsZW5ndGggb2Ygc3ByaW5nXHJcbiAgICogQHBhcmFtIHRoaWNrbmVzcyBudW1iZXIge251bWJlcn0gY3VycmVudCB0aGlja25lc3Mgb2Ygc3ByaW5nXHJcbiAgICovXHJcbiAgdXBkYXRlU3ByaW5nQ29uc3RhbnQoIGxlbmd0aCwgdGhpY2tuZXNzICkge1xyXG4gICAgY29uc3Qgc3ByaW5nQ29uc3RhbnQgPSB0aGlzLm5hdHVyYWxSZXN0aW5nTGVuZ3RoUHJvcGVydHkuaW5pdGlhbFZhbHVlIC8gbGVuZ3RoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICogdGhpY2tuZXNzIC8gdGhpcy50aGlja25lc3NQcm9wZXJ0eS5pbml0aWFsVmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgKiB0aGlzLnNwcmluZ0NvbnN0YW50UHJvcGVydHkuaW5pdGlhbFZhbHVlO1xyXG5cclxuICAgIHRoaXMuc3ByaW5nQ29uc3RhbnRQcm9wZXJ0eS5zZXQoIHNwcmluZ0NvbnN0YW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIG1hc3MgZnJvbSBzcHJpbmcuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVtb3ZlTWFzcygpIHtcclxuICAgIGlmICggdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eS5nZXQoKS5kZXRhY2goKTtcclxuICAgIH1cclxuICAgIHRoaXMuZGlzcGxhY2VtZW50UHJvcGVydHkuc2V0KCAwICk7XHJcbiAgICB0aGlzLm1hc3NBdHRhY2hlZFByb3BlcnR5LnNldCggbnVsbCApO1xyXG4gICAgdGhpcy5idXR0b25FbmFibGVkUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgZGlzcGxhY2VtZW50IFByb3BlcnR5IG9mIHRoZSBzcHJpbmcuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlQb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZmFjdG9yTmF0dXJhbExlbmd0aFxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHVwZGF0ZURpc3BsYWNlbWVudCggeVBvc2l0aW9uLCBmYWN0b3JOYXR1cmFsTGVuZ3RoICkge1xyXG4gICAgaWYgKCBmYWN0b3JOYXR1cmFsTGVuZ3RoICkge1xyXG4gICAgICB0aGlzLmRpc3BsYWNlbWVudFByb3BlcnR5LnNldCggdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eS52YWx1ZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCB5UG9zaXRpb24gLSB0aGlzLm5hdHVyYWxSZXN0aW5nTGVuZ3RoUHJvcGVydHkudmFsdWUgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLkhPT0tfQ0VOVEVSICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGxhY2VtZW50UHJvcGVydHkuc2V0KCAtKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSAtIHRoaXMubmF0dXJhbFJlc3RpbmdMZW5ndGhQcm9wZXJ0eS52YWx1ZSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHlQb3NpdGlvbiAtIE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuSE9PS19DRU5URVIgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgbWFzcyBvbiBzcHJpbmdcclxuICAgKiBAcGFyYW0ge01hc3N9IG1hc3NcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRNYXNzKCBtYXNzICkge1xyXG4gICAgaWYgKCB0aGlzLm1hc3NBdHRhY2hlZFByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICB0aGlzLm1hc3NBdHRhY2hlZFByb3BlcnR5LmdldCgpLmRldGFjaCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eS5zZXQoIG1hc3MgKTtcclxuICAgIHRoaXMubWFzc0F0dGFjaGVkUHJvcGVydHkuZ2V0KCkuc3ByaW5nUHJvcGVydHkuc2V0KCB0aGlzICk7XHJcbiAgICB0aGlzLnVwZGF0ZURpc3BsYWNlbWVudCggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnksIHRydWUgKTtcclxuICAgIHRoaXMubWFzc0F0dGFjaGVkUHJvcGVydHkuZ2V0KCkudmVydGljYWxWZWxvY2l0eVByb3BlcnR5LnNldCggMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RvcCBzcHJpbmcgbW90aW9uIGJ5IHNldHRpbmcgdGhlIGRpc3BsYWNlbWVudCB0byB0aGUgc3ByaW5nJ3MgZXh0ZW5zaW9uLCB3aGljaCBpcyB0aGUgbGVuZ3RoIGZyb20gdGhlIG5hdHVyYWxcclxuICAgKiByZXN0aW5nIHBvc2l0aW9uLiBUaGlzIHdpbGwgYWxzbyBzdG9wIHRoZSBzcHJpbmcgZnJvbSBmdXJ0aGVyIG9zY2lsbGF0aW9uLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0b3BTcHJpbmcoKSB7XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgbWFzcyBhdHRhY2hlZCBvbiBzcHJpbmdcclxuICAgIGlmICggdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgY29uc3QgbWFzcyA9IHRoaXMubWFzc0F0dGFjaGVkUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIG1hc3MuaW5pdGlhbFRvdGFsRW5lcmd5UHJvcGVydHkuc2V0KCBtYXNzLnRvdGFsRW5lcmd5UHJvcGVydHkudmFsdWUgKTtcclxuXHJcbiAgICAgIC8vIHNldCBkaXNwbGFjZW1lbnQgYW5kIHN0b3AgZnVydGhlciBhbmltYXRpb25cclxuICAgICAgY29uc3Qgc3ByaW5nRXh0ZW5zaW9uVmFsdWUgPSAoIG1hc3MubWFzc1Byb3BlcnR5LnZhbHVlICogdGhpcy5ncmF2aXR5UHJvcGVydHkudmFsdWUgKSAvIHRoaXMuc3ByaW5nQ29uc3RhbnRQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgdGhpcy5kaXNwbGFjZW1lbnRQcm9wZXJ0eS5zZXQoIC1zcHJpbmdFeHRlbnNpb25WYWx1ZSApO1xyXG5cclxuICAgICAgLy8gcGxhY2UgdGhhdCBtYXNzIGF0IHRoZSBjb3JyZWN0IHBvc2l0aW9uIGFzIHdlbGxcclxuICAgICAgbWFzcy5wb3NpdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLngsIHRoaXMuZXF1aWxpYnJpdW1ZUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSArIE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuSE9PS19DRU5URVJcclxuICAgICAgKSApO1xyXG4gICAgICBtYXNzLnZlcnRpY2FsVmVsb2NpdHlQcm9wZXJ0eS5zZXQoIDAgKTtcclxuICAgICAgdGhpcy5idXR0b25FbmFibGVkUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzcG9uc2libGUgZm9yIG9zY2lsbGF0b3J5IG1vdGlvbiBvZiBzcHJpbmcgc3lzdGVtLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoZSBtb3Rpb24gaXMgYmFzZWQgb2ZmIG9mIGEgZHJpdmVuIGhhcm1vbmljIG9zY2lsbGF0b3JcclxuICAgKiAoaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSGFybW9uaWNfb3NjaWxsYXRvciNEcml2ZW5faGFybW9uaWNfb3NjaWxsYXRvcnMpLCB3aGljaCBzYXRpc2ZpZXMgdGhlXHJcbiAgICogZGlmZmVyZW50aWFsIGVxdWF0aW9uOlxyXG4gICAqXHJcbiAgICogeCcnKHQpICsgMs62z4nigoAgeCcodCkgKyDPieKCgMKyIHgodCkgPSAtZ1xyXG4gICAqXHJcbiAgICogd2hlcmUgYHRgIGlzIHRoZSB0aW1lLCBgZ2AgaXMgdGhlIGdyYXZpdGF0aW9uYWwgYWNjZWxlcmF0aW9uIGNvbnN0YW50LCBhbmQgZm9yIG91ciBjYXNlIHdlIGFwcGx5IHRoZVxyXG4gICAqIHN1YnN0aXR1dGlvbnM6XHJcbiAgICpcclxuICAgKiDOtiA9IHNxcnQoay9tKVxyXG4gICAqIM+J4oKAID0gYy8oMiAqIHNxcnQobSprKSlcclxuICAgKlxyXG4gICAqIFRoZSBzb2x1dGlvbiB0byB0aGUgZGlmZmVyZW50aWFsIGVxdWF0aW9uIGdpdmVzIGVzc2VudGlhbGx5IHR3byBkaWZmZXJlbnQgY2FzZXM6XHJcbiAgICogLSBVbmRlcmRhbXBlZC9vdmVyZGFtcGVkIChjwrItNGttICE9IDApIHdoZXJlIHdlIGNhbiBhY3R1YWxseSBzb2x2ZSBib3RoIHdpdGggdGhlIHNhbWUgY29kZSBieSB1c2luZyBjb21wbGV4XHJcbiAgICogICBudW1iZXJzLlxyXG4gICAqIC0gQ3JpdGljYWxseSBkYW1wZWQgKGPCsi00a20gPSAwKSwgd2hpY2ggd291bGQgY2F1c2UgZGl2aXNpb24gYnkgemVybyBpbiB0aGUgYWJvdmUgY2FzZSwgc28gYSBkaWZmZXJlbnQgZm9ybXVsYVxyXG4gICAqICAgaXMgbmVlZGVkLlxyXG4gICAqXHJcbiAgICogVGhlIGZvcm11bGFzIHdlcmUgZWFzaWVzdCB0byBjb21wdXRlIGluIE1hdGhlbWF0aWNhIChzZWUgYXNzZXRzL21hc3Mtc3ByaW5nLWxhYi5uYiksIGJ1dCBlc3NlbnRpYWxseSB3ZSB1c2UgdGhlXHJcbiAgICogYnVpbHQtaW4gc29sdmVyIGFuZCBzaW1wbGlmaWVyIGZvciBib3RoIGNhc2VzOlxyXG4gICAqXHJcbiAgICogRm9yIHRoZSBvdmVyZGFtcGVkL3VuZGVyZGFtcGVkIGNhc2U6XHJcbiAgICogICBGdWxsU2ltcGxpZnlbXHJcbiAgICogICAgRFNvbHZlW3soeCcnW3RdICsgMip6ZXRhKm9tZWdhMCp4J1t0XSArIG9tZWdhMF4yKnhbdF0gPT0gLWcpIC8uIHN1YnMsXHJcbiAgICogICAgICAgeCdbMF0gPT0gdjEsIHhbMF0gPT0geDF9LCB4W3RdLCB0XSwge0VsZW1lbnRbdCwgUmVhbHNdLFxyXG4gICAqICAgICBFbGVtZW50W3YxLCBSZWFsc10sIEVsZW1lbnRbeDEsIFJlYWxzXSwgRWxlbWVudFttLCBSZWFsc10sXHJcbiAgICogICAgIEVsZW1lbnRbZywgUmVhbHNdLCBFbGVtZW50W2MsIFJlYWxzXSwgRWxlbWVudFtrLCBSZWFsc10sIG0gPiAwLFxyXG4gICAqICAgICBnID4gMCwgYyA+PSAwLCBrID4gMCwgY14yIDwgNCprKm19XVxyXG4gICAqXHJcbiAgICogUmVzdWx0aW5nIGluOlxyXG4gICAqICAgMS8oMiBrXigzLzIpIFNxcnRbY14yLTQgayBtXSkgRV4oLSgodCAoYytJIFNxcnRbNCBrIG0tY14yXSkpLygyIG0pKSkgKGMgU3FydFtrXSAoLTErRV4oKEkgdCBTcXJ0WzQgayBtLWNeMl0pL20pKVxyXG4gICAqICAgKGcgbStrIHgxKStJIGcgbSBTcXJ0W2sgKDQgayBtLWNeMildIChFXigoSSB0IFNxcnRbNCBrIG0tY14yXSkvbSktMiBFXigodCAoYytJIFNxcnRbNCBrIG0tY14yXSkpLygyIG0pKSsxKSsyXHJcbiAgICogICBrXigzLzIpIG0gdjEgRV4oKEkgdCBTcXJ0WzQgayBtLWNeMl0pL20pK0kgeDEgU3FydFtrXjMgKDQgayBtLWNeMildIEVeKChJIHQgU3FydFs0IGsgbS1jXjJdKS9tKStJIHgxIFNxcnRba14zXHJcbiAgICogICAoNCBrIG0tY14yKV0tMiBrXigzLzIpIG0gdjEpXHJcbiAgICpcclxuICAgKiBGb3IgdGhlIGNyaXRpY2FsbHkgZGFtcGVkIGNhc2U6XHJcbiAgICogICBGdWxsU2ltcGxpZnlbXHJcbiAgICogICAgRFNvbHZlW3soeCcnW3RdICsgMip6ZXRhKm9tZWdhMCp4J1t0XSArIG9tZWdhMF4yKnhbdF0gPT0gLWcpIC8uXHJcbiAgICogICAgICAgIHN1YnMgLy4ge2MgLT4gU3FydFs0KmsqbV19LCB4J1swXSA9PSB2MSwgeFswXSA9PSB4MX0sIHhbdF0sXHJcbiAgICogICAgIHRdLCB7RWxlbWVudFt0LCBSZWFsc10sIEVsZW1lbnRbdjEsIFJlYWxzXSwgRWxlbWVudFt4MSwgUmVhbHNdLFxyXG4gICAqICAgICBFbGVtZW50W20sIFJlYWxzXSwgRWxlbWVudFtnLCBSZWFsc10sIEVsZW1lbnRbaywgUmVhbHNdLCBtID4gMCxcclxuICAgKiAgICAgZyA+IDAsIGsgPiAwfV1cclxuICAgKlxyXG4gICAqIFJlc3VsdGluZyBpbjpcclxuICAgKiAgIChFXih0ICgtU3FydFsoay9tKV0pKSAoZyAobSAoLUVeKHQgU3FydFtrL21dKSkrdCBTcXJ0W2sgbV0rbSkrayAodCAoeDEgU3FydFtrL21dK3YxKSt4MSkpKS9rXHJcbiAgICpcclxuICAgKiBUaGUgY29kZSBiZWxvdyBiYXNpY2FsbHkgZmFjdG9ycyBvdXQgY29tbW9uIHN1YmV4cHJlc3Npb25zIG9mIHRoZXNlIGZvcm11bGFzLCBtYWtpbmcgdGhlbSBtb3JlIGVmZmljaWVudCB0b1xyXG4gICAqIGNvbXB1dGUuXHJcbiAgICpcclxuICAgKiBXZSBjYW4gdXNlIHRoZW0gYnkgZXNzZW50aWFsbHkgdXNpbmcgYHRgIGFzIHRoZSB0aW1lc3RlcCAoZHQpLCB0byBjb21wdXRlIHRoZSBjaGFuZ2UgZm9yIGFueSBhcmJpdHJhcnkgZHQuXHJcbiAgICogT25seSB0aGUgY29uc3RhbnRzIG5lZWQgdG8gYmUgcGx1Z2dlZCBpbiwgYW5kIG9ubHkgdGhlIHBvc2l0aW9uL3ZlbG9jaXR5IGFyZSBzbW9vdGhseSB2YXJ5aW5nIG92ZXIgdGltZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIGFuaW1hdGlvbiB0aW1lIHN0ZXBcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIGlmICggdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eS5nZXQoKSAmJiAhdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eS5nZXQoKS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICB0aGlzLm1hc3NBdHRhY2hlZFByb3BlcnR5LmdldCgpLnByZXNlcnZlVGhlcm1hbEVuZXJneSA9IGZhbHNlO1xyXG5cclxuICAgICAgY29uc3QgayA9IHRoaXMuc3ByaW5nQ29uc3RhbnRQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgY29uc3QgbSA9IHRoaXMubWFzc0F0dGFjaGVkUHJvcGVydHkuZ2V0KCkubWFzc1Byb3BlcnR5LmdldCgpO1xyXG4gICAgICBjb25zdCBjID0gdGhpcy5kYW1waW5nQ29lZmZpY2llbnRQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgY29uc3QgdiA9IHRoaXMubWFzc0F0dGFjaGVkUHJvcGVydHkuZ2V0KCkudmVydGljYWxWZWxvY2l0eVByb3BlcnR5LmdldCgpO1xyXG4gICAgICBjb25zdCB4ID0gdGhpcy5kaXNwbGFjZW1lbnRQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgY29uc3QgZyA9IHRoaXMuZ3Jhdml0eVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgLy8gVW5kZXJkYW1wZWQgYW5kIE92ZXJkYW1wZWQgY2FzZVxyXG4gICAgICBpZiAoICggYyAqIGMgLSA0ICogayAqIG0gKSAhPT0gMCApIHtcclxuICAgICAgICAvLyBQcmVjb21wdXRlIGV4cHJlc3Npb25zIHVzZWQgbW9yZSB0aGFuIHR3aWNlIChmb3IgcGVyZm9ybWFuY2UpLlxyXG4gICAgICAgIGNvbnN0IGttID0gayAqIG07XHJcbiAgICAgICAgY29uc3QgZ20gPSBnICogbTtcclxuICAgICAgICBjb25zdCB0RG0gPSBkdCAvIG07XHJcbiAgICAgICAgY29uc3Qga3ggPSBrICogeDtcclxuICAgICAgICBjb25zdCBjMiA9IGMgKiBjO1xyXG4gICAgICAgIGNvbnN0IGtSMiA9IE1hdGguc3FydCggayApO1xyXG4gICAgICAgIGNvbnN0IGszUjIgPSBrICoga1IyO1xyXG4gICAgICAgIGNvbnN0IHR3b2szUjJtdiA9IENvbXBsZXgucmVhbCggMiAqIGszUjIgKiBtICogdiApO1xyXG4gICAgICAgIGNvbnN0IGFscGhhID0gQ29tcGxleC5yZWFsKCA0ICoga20gLSBjMiApLnNxcnQoKTtcclxuICAgICAgICBjb25zdCBhbHBoYUkgPSBhbHBoYS50aW1lcyggQ29tcGxleC5JICk7XHJcbiAgICAgICAgY29uc3QgYWxwaGFQcmltZSA9IENvbXBsZXgucmVhbCggYzIgLSA0ICoga20gKS5zcXJ0KCk7XHJcbiAgICAgICAgY29uc3QgYWxwaGF0RDJtID0gQ29tcGxleC5yZWFsKCB0RG0gLyAyICkubXVsdGlwbHkoIGFscGhhICk7XHJcbiAgICAgICAgY29uc3QgYmV0YSA9IENvbXBsZXgucmVhbCggdERtICkubXVsdGlwbHkoIGFscGhhSSApLmV4cG9uZW50aWF0ZSgpO1xyXG4gICAgICAgIGNvbnN0IGV0YSA9IENvbXBsZXgucmVhbCggYyApLmFkZCggYWxwaGFJICkubXVsdGlwbHkoIENvbXBsZXgucmVhbCggdERtIC8gMiApICkuZXhwb25lbnRpYXRlKClcclxuICAgICAgICAgIC5tdWx0aXBseSggQ29tcGxleC5yZWFsKCAyICkgKTtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIG5ldyBkaXNwbGFjZW1lbnRcclxuICAgICAgICBsZXQgY29lZiA9IENvbXBsZXguT05FLmRpdmlkZWRCeSggQ29tcGxleC5yZWFsKCBrM1IyICkubXVsdGlwbHkoIGFscGhhUHJpbWUgKS5tdWx0aXBseSggZXRhICkgKTtcclxuICAgICAgICBsZXQgQSA9IGJldGEubWludXMoIENvbXBsZXguT05FICkubXVsdGlwbHkoIENvbXBsZXgucmVhbCggYyAqIGtSMiAqICggZ20gKyBreCApICkgKTtcclxuICAgICAgICBsZXQgQiA9IENvbXBsZXgucmVhbCggZ20gKiBrUjIgKS5tdWx0aXBseSggYWxwaGFJICkubXVsdGlwbHkoXHJcbiAgICAgICAgICBiZXRhLm1pbnVzKCBldGEgKS5hZGQoIENvbXBsZXguT05FIClcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IEMgPSB0d29rM1IybXYudGltZXMoIGJldGEgKTtcclxuICAgICAgICBjb25zdCBEID0gQ29tcGxleC5yZWFsKCBrM1IyICogeCApLm11bHRpcGx5KCBhbHBoYUkgKTtcclxuICAgICAgICBjb25zdCBFID0gRC50aW1lcyggYmV0YSApO1xyXG4gICAgICAgIGxldCBuZXdEaXNwbGFjZW1lbnQgPSBjb2VmLm11bHRpcGx5KCBBLmFkZCggQiApLmFkZCggQyApLmFkZCggRCApLmFkZCggRSApLnN1YnRyYWN0KCB0d29rM1IybXYgKSApLnJlYWw7XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBuZXcgdmVsb2NpdHlcclxuICAgICAgICBjb2VmID0gQ29tcGxleC5yZWFsKCAtKCBNYXRoLmV4cCggKCAtYyAqIGR0ICkgLyAoIDIgKiBtICkgKSApIC8gKCAyICogazNSMiAqIG0gKSApLmRpdmlkZSggYWxwaGFQcmltZSApXHJcbiAgICAgICAgICAubXVsdGlwbHkoIENvbXBsZXguSSApO1xyXG4gICAgICAgIEEgPSBhbHBoYXREMm0uc2luT2YoKS5tdWx0aXBseShcclxuICAgICAgICAgIENvbXBsZXgucmVhbCgga1IyICogKCBnbSArIGt4ICkgKVxyXG4gICAgICAgICAgICAubXVsdGlwbHkoIGFscGhhLnNxdWFyZWQoKS5hZGQoIENvbXBsZXgucmVhbCggYzIgKSApIClcclxuICAgICAgICAgICAgLmFkZCggdHdvazNSMm12LnRpbWVzKCBDb21wbGV4LnJlYWwoIGMgKSApICkgKTtcclxuICAgICAgICBCID0gYWxwaGF0RDJtLmNvcygpLm11bHRpcGx5KCB0d29rM1IybXYgKS5tdWx0aXBseSggYWxwaGEgKS5tdWx0aXBseSggQ29tcGxleC5yZWFsKCAtMSApICk7XHJcbiAgICAgICAgY29uc3QgbmV3VmVsb2NpdHkgPSBBLmFkZCggQiApLm11bHRpcGx5KCBjb2VmICkucmVhbDtcclxuXHJcbiAgICAgICAgLy8gIFN0b3AgdGhlIGFsdGVybmF0aW9uIGJldHdlZW4gKy8tIGluIG92ZXJkYW1wZWQgZGlzcGxhY2VtZW50XHJcbiAgICAgICAgaWYgKCAoIGMgKiBjIC0gNCAqIGsgKiBtICkgPiAwICkge1xyXG4gICAgICAgICAgbmV3RGlzcGxhY2VtZW50ID1cclxuICAgICAgICAgICAgKCB0aGlzLmRpc3BsYWNlbWVudFByb3BlcnR5LmdldCgpID4gMCApID8gTWF0aC5hYnMoIG5ld0Rpc3BsYWNlbWVudCApIDogLU1hdGguYWJzKCBuZXdEaXNwbGFjZW1lbnQgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluIHRoaXMgY2FzZSAoIGMgKiBjIC0gNCAqIGsgbSA8IDAgKSBhbmQgd2UgYXJlIHVuZGVyZGFtcGVkLlxyXG4gICAgICAgIC8vIFNxdWVsY2ggbm9pc2UgYWZ0ZXIgY29taW5nIHRvIHJlc3Qgd2l0aCB0b2xlcmFuY2Ugb2YgMSBtaWNyb25cclxuICAgICAgICBpZiAoIE1hdGguYWJzKCB0aGlzLmRpc3BsYWNlbWVudFByb3BlcnR5LmdldCgpIC0gbmV3RGlzcGxhY2VtZW50ICkgPCAxZS02ICYmXHJcbiAgICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eS5nZXQoKS52ZXJ0aWNhbFZlbG9jaXR5UHJvcGVydHkuZ2V0KCkgKSA8IDFlLTYgKSB7XHJcbiAgICAgICAgICB0aGlzLmRpc3BsYWNlbWVudFByb3BlcnR5LnNldCggLW0gKiBnIC8gayApOyAgLy8gRXF1aWxpYnJpdW0gbGVuZ3RoXHJcbiAgICAgICAgICB0aGlzLm1hc3NBdHRhY2hlZFByb3BlcnR5LmdldCgpLnZlcnRpY2FsVmVsb2NpdHlQcm9wZXJ0eS5zZXQoIDAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmRpc3BsYWNlbWVudFByb3BlcnR5LnNldCggbmV3RGlzcGxhY2VtZW50ICk7XHJcbiAgICAgICAgICB0aGlzLm1hc3NBdHRhY2hlZFByb3BlcnR5LmdldCgpLnZlcnRpY2FsVmVsb2NpdHlQcm9wZXJ0eS5zZXQoIG5ld1ZlbG9jaXR5ICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhaXNOYU4oIHRoaXMuZGlzcGxhY2VtZW50UHJvcGVydHkuZ2V0KCkgKSwgJ2Rpc3BsYWNlbWVudCBtdXN0IGJlIGEgbnVtYmVyJyApO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFpc05hTiggdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eS5nZXQoKS52ZXJ0aWNhbFZlbG9jaXR5UHJvcGVydHkuZ2V0KCkgKSwgJ3ZlbG9jaXR5IG11c3QgYmUgYSBudW1iZXInICk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDcml0aWNhbGx5IGRhbXBlZCBjYXNlXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IG9tZWdhID0gTWF0aC5zcXJ0KCBrIC8gbSApO1xyXG4gICAgICAgIGNvbnN0IHBoaSA9IE1hdGguZXhwKCBkdCAqIG9tZWdhICk7XHJcblxyXG4gICAgICAgIHRoaXMuZGlzcGxhY2VtZW50UHJvcGVydHkuc2V0KCAoIGcgKiAoIC1tICogcGhpICsgZHQgKiBNYXRoLnNxcnQoIGsgKiBtICkgKyBtICkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGsgKiAoIGR0ICogKCB4ICogb21lZ2EgKyB2ICkgKyB4IClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSAvICggcGhpICogayApICk7XHJcbiAgICAgICAgdGhpcy5tYXNzQXR0YWNoZWRQcm9wZXJ0eS5nZXQoKS52ZXJ0aWNhbFZlbG9jaXR5UHJvcGVydHkuc2V0KCAoIGcgKiBtICogKCBNYXRoLnNxcnQoIGsgKiBtICkgLSBvbWVnYSAqICggbSArIGR0ICogTWF0aC5zcXJ0KCBrICogbSApICkgKSAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGsgKiAoIG0gKiB2ICogKCBvbWVnYSAqIGR0IC0gMSApICsgayAqIGR0ICogeCApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIC8gKCBwaGkgKiBrICogbSApICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubWFzc0F0dGFjaGVkUHJvcGVydHkuZ2V0KCkucG9zaXRpb25Qcm9wZXJ0eS5zZXQoXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54LCB0aGlzLmJvdHRvbVByb3BlcnR5LmdldCgpICsgTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5IT09LX0NFTlRFUiApXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLmJ1dHRvbkVuYWJsZWRQcm9wZXJ0eS5zZXQoIHRoaXMubWFzc0F0dGFjaGVkUHJvcGVydHkuZ2V0KCkudmVydGljYWxWZWxvY2l0eVByb3BlcnR5LmdldCgpICE9PSAwICk7XHJcbiAgICAgIHRoaXMubWFzc0F0dGFjaGVkUHJvcGVydHkuZ2V0KCkucHJlc2VydmVUaGVybWFsRW5lcmd5ID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbm1hc3Nlc0FuZFNwcmluZ3MucmVnaXN0ZXIoICdTcHJpbmcnLCBTcHJpbmcgKTtcclxuXHJcblNwcmluZy5TcHJpbmdJTyA9IG5ldyBJT1R5cGUoICdTcHJpbmdJTycsIHtcclxuICB2YWx1ZVR5cGU6IFNwcmluZyxcclxuICBkb2N1bWVudGF0aW9uOiAnSGFuZ3MgZnJvbSB0aGUgY2VpbGluZyBhbmQgYXBwbGllcyBhIGZvcmNlIHRvIGFueSBhdHRhY2hlZCBCb2R5SU8nLFxyXG4gIHN1cGVydHlwZTogUmVmZXJlbmNlSU8oIElPVHlwZS5PYmplY3RJTyApXHJcbn0gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNwcmluZzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsTUFBTSxNQUFNLHVDQUF1QztBQUMxRCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUs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