// Copyright 2023, University of Colorado Boulder
/**
 * The Elliptical Orbit model element. Evolves the body and
 * keeps track of orbital elements.
 * Serves as the Engine for the Kepler's Laws Model
 *
 * Variable definitions:
 * r: position vector
 * v: velocity vector
 * rAngle: heading of r
 * vAngle: heading of v
 * a: semi-major axis
 * b: semi-minor axis
 * c: focal distance
 * e: eccentricity
 * nu: true anomaly ( angular position of the body seen from main focus )
 * w: argument of periapsis ( angular deviation of periapsis from the 0° heading )
 * M: Initial mean anomaly ( angular position of the body seen from the center of the ellipse )
 * W: angular velocity
 *
 * @author Agustín Vallejo
 */

import Body from '../../../../solar-system-common/js/model/Body.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Utils from '../../../../dot/js/Utils.js';
import Engine from '../../../../solar-system-common/js/model/Engine.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Multilink from '../../../../axon/js/Multilink.js';
import SolarSystemCommonConstants from '../../../../solar-system-common/js/SolarSystemCommonConstants.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import OrbitTypes from './OrbitTypes.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import OrbitalArea from './OrbitalArea.js';
import keplersLaws from '../../keplersLaws.js';
import KeplersLawsConstants from '../../KeplersLawsConstants.js';
const TWOPI = 2 * Math.PI;

// Scaling down factor for the escape velocity to avoid unwanted errors
const epsilon = 0.99;

// Creation of children classes
class Ellipse {
  constructor(a, b, c, e, w, M, W, nu) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.e = e;
    this.w = w;
    this.M = M;
    this.W = W;
    this.nu = nu;
  }
}
const INITIAL_MU = 2e6;
export default class EllipticalOrbitEngine extends Engine {
  mu = INITIAL_MU; // mu = G * Mass_sun, and G in this sim is 1e4

  changedEmitter = new Emitter();
  resetEmitter = new Emitter();
  bodyPolarPosition = new Vector2(1, 0);
  periodDivisions = 4;
  orbitalAreas = [];
  updateAllowed = true;
  retrograde = false;
  alwaysCircles = false;
  isCircularProperty = new BooleanProperty(true);
  semiMajorAxisProperty = new NumberProperty(1);
  semiMinorAxisProperty = new NumberProperty(1);
  focalDistanceProperty = new NumberProperty(1);
  distance1Property = new NumberProperty(1);
  distance2Property = new NumberProperty(1);
  periodProperty = new NumberProperty(1);
  eccentricityProperty = new NumberProperty(0);

  // These variable names are letters to compare and read more easily the equations they are in
  a = 1; // semi-major axis
  b = 0; // semi-minor axis
  c = 0; // focal distance
  e = 0; // eccentricity
  w = 0; // argument of periapsis
  M = 0; // mean anomaly
  W = 0; // angular velocity
  T = 1; // period
  nu = 0; // true anomaly
  L = 0; // angular momentum
  d1 = 0; // distance from the main focus to the body
  d2 = 0; // distance from the secondary focus to the body

  // Keeps track of the validity of the orbit. True if elliptic, false either if parabolic or collision orbit.
  allowedOrbitProperty = new BooleanProperty(false);
  escapeSpeedProperty = new NumberProperty(0);
  escapeRadiusProperty = new NumberProperty(0);
  totalArea = 1;
  segmentArea = 1;
  constructor(bodies) {
    super(bodies);
    this.orbitTypeProperty = new EnumerationProperty(OrbitTypes.STABLE_ORBIT);

    // In the case of this screen, the body 0 is the sun, and the body 1 is the planet
    this.sun = bodies[0];
    this.body = bodies[1];
    this.sunMassProperty = bodies[0].massProperty;

    // Populate the orbital areas
    for (let i = 0; i < KeplersLawsConstants.MAX_ORBITAL_DIVISIONS; i++) {
      this.orbitalAreas.push(new OrbitalArea());
    }

    // Multilink to update the orbit based on the bodies position and velocity
    Multilink.multilink([this.body.positionProperty, this.body.velocityProperty, this.bodies[0].massProperty], (position, velocity, mass) => {
      const rMagnitude = position.magnitude;
      const vMagnitude = velocity.magnitude;
      this.mu = 1e4 * mass;
      this.escapeRadiusProperty.value = 2 * this.mu / (vMagnitude * vMagnitude) * epsilon * epsilon;
      this.escapeSpeedProperty.value = Math.sqrt(2 * this.mu / rMagnitude) * epsilon;
    });

    // Multilink to release orbital updates when the user is controlling the body
    Multilink.multilink([this.body.userControlledPositionProperty, this.body.userControlledVelocityProperty, this.bodies[0].userControlledMassProperty], (userControlledPosition, userControlledVelocity, userControlledMass) => {
      this.updateAllowed = userControlledPosition || userControlledVelocity || userControlledMass;
      this.resetOrbitalAreas();
      this.update();
    });
  }
  thirdLaw(a) {
    return Math.pow(INITIAL_MU * a * a * a / this.mu, 1 / 2);
  }
  run(dt) {
    // Prevent the orbit from updating if the body is orbiting
    this.updateAllowed = false;

    // Calculate the new position and velocity of the body
    this.M += dt * this.W;
    this.nu = this.getTrueAnomaly(this.M);

    // Update the position and velocity of the body
    const currentPosition = this.body.positionProperty.value;
    const newPosition = this.createPolar(this.nu, this.w);
    const newVelocity = newPosition.minus(currentPosition).normalize();
    const newAngularMomentum = newPosition.crossScalar(newVelocity);
    newVelocity.multiplyScalar(this.L / newAngularMomentum);
    this.body.positionProperty.value = newPosition;
    this.body.velocityProperty.value = newVelocity;
    this.updateBodyDistances();
    this.updateForces(newPosition);
    this.calculateOrbitalDivisions(true);
    this.changedEmitter.emit();
  }
  updateBodyDistances() {
    this.bodyPolarPosition = this.createPolar(this.nu);
    this.d1 = this.bodyPolarPosition.magnitude;
    this.d2 = 2 * this.a - this.d1;
    this.distance1Property.value = this.d1 * SolarSystemCommonConstants.POSITION_MULTIPLIER;
    this.distance2Property.value = this.d2 * SolarSystemCommonConstants.POSITION_MULTIPLIER;
  }
  updateForces(position) {
    const force = position.timesScalar(-this.mu * this.body.massProperty.value / Math.pow(position.magnitude, 3));
    this.body.forceProperty.value = force;
    this.body.accelerationProperty.value = force.timesScalar(1 / this.body.massProperty.value);
    this.sun.forceProperty.value = force.timesScalar(-1);
  }

  /**
   * Based on the current position and velocity of the body
   * Updates the orbital elements of the body using Orbital Mechanics Analytic Equations
   */
  update() {
    this.resetOrbitalAreas();
    const r = this.body.positionProperty.value;
    this.updateForces(r);
    let escaped = false;
    if (this.alwaysCircles) {
      this.enforceCircularOrbit(r);
    } else {
      const realEscapeSpeed = this.escapeSpeedProperty.value;
      const currentSpeed = this.body.velocityProperty.value.magnitude;
      if (currentSpeed >= realEscapeSpeed) {
        this.enforceEscapeSpeed();
      }
      // Using epsilon for a lower threshold on escape orbits to avoid floating point errors, which induced some flickering on edge cases
      escaped = currentSpeed >= realEscapeSpeed * epsilon;
      if (escaped) {
        this.allowedOrbitProperty.value = false;
        this.orbitTypeProperty.value = OrbitTypes.ESCAPE_ORBIT;
        this.eccentricityProperty.value = 1;
      }
    }
    const v = this.body.velocityProperty.value;
    this.L = r.crossScalar(v);
    const {
      a,
      b,
      c,
      e,
      w,
      M,
      W,
      nu
    } = this.calculateEllipse(r, v);
    this.a = a;
    this.b = b;
    this.c = c;
    this.e = e;
    this.w = w;
    this.M = M;
    this.W = W;
    this.nu = nu;
    this.T = this.thirdLaw(this.a);
    this.updateBodyDistances();
    this.totalArea = Math.PI * this.a * this.b;
    this.segmentArea = this.totalArea / this.periodDivisions;
    this.semiMajorAxisProperty.value = this.a * SolarSystemCommonConstants.POSITION_MULTIPLIER;
    this.semiMinorAxisProperty.value = this.b * SolarSystemCommonConstants.POSITION_MULTIPLIER;
    this.focalDistanceProperty.value = this.c * SolarSystemCommonConstants.POSITION_MULTIPLIER;
    this.periodProperty.value = this.T * Math.pow(SolarSystemCommonConstants.POSITION_MULTIPLIER, 3 / 2);
    if (this.collidedWithSun(a, e)) {
      this.allowedOrbitProperty.value = false;
      this.orbitTypeProperty.value = OrbitTypes.CRASH_ORBIT;
    } else if (!escaped) {
      this.allowedOrbitProperty.value = true;
      this.orbitTypeProperty.value = OrbitTypes.STABLE_ORBIT;
      this.calculateOrbitalDivisions(false);
    }
    if (e !== this.eccentricityProperty.value && this.orbitTypeProperty.value !== OrbitTypes.ESCAPE_ORBIT) {
      if (this.alwaysCircles || this.e < 0.01) {
        this.eccentricityProperty.value = 0;
      } else {
        this.eccentricityProperty.value = e;
      }
      this.isCircularProperty.value = this.eccentricityProperty.value === 0;
    }
    this.changedEmitter.emit();
  }
  enforceCircularOrbit(position) {
    // Always set the velocity to be perpendicular to the position and circular
    const direction = this.retrograde ? -1 : 1;
    this.body.velocityProperty.value = position.perpendicular.normalize().multiplyScalar(direction * 1.0001 * Math.sqrt(this.mu / position.magnitude));
    // TODO: Velocity a bit over circular orbit to avoid some errors, but they shouldnt be happening
  }

  enforceEscapeSpeed() {
    this.body.velocityProperty.value = this.body.velocityProperty.value.normalized().multiplyScalar(this.escapeSpeedProperty.value);
  }
  collidedWithSun(a, e) {
    return a * (1 - e) < Body.massToRadius(this.bodies[0].massProperty.value);
  }
  createPolar(nu, w = 0) {
    // nu is the true anomaly (Angle between periapsis and the body)
    // w is the argument of periapsis (global rotation of periapsis)
    // When w is not provided (0), we're using local orbital coordinates. When provided, the result is in global coordinates.
    return Vector2.createPolar(this.calculateR(this.a, this.e, nu), nu + w);
  }

  /**
   * Based on the number of divisions provided by the model,
   * divides the orbit in equal time sections.
   */
  calculateOrbitalDivisions(fillAreas) {
    // Nu is the angular position of the body as seen from the main focus
    let previousNu = 0;
    let bodyAngle = -this.nu;
    this.segmentArea = this.totalArea / this.periodDivisions;
    this.orbitalAreas.forEach((orbitalArea, i) => {
      if (i < this.periodDivisions && this.allowedOrbitProperty.value) {
        // Calculate true anomaly
        // ( i + 1 ) because first angle is always nu = 0
        const M = (i + 1) * TWOPI / this.periodDivisions;
        const nu = this.getTrueAnomaly(M);

        // Update orbital areas angles, constrained by the startAngle
        let startAngle = previousNu;
        let endAngle = Utils.moduloBetweenDown(nu, startAngle, startAngle + TWOPI);
        bodyAngle = Utils.moduloBetweenDown(bodyAngle, startAngle, startAngle + TWOPI);
        orbitalArea.startAngle = startAngle;
        orbitalArea.endAngle = endAngle;
        if (fillAreas) {
          // Body inside the area
          if (startAngle <= bodyAngle && bodyAngle < endAngle) {
            orbitalArea.insideProperty.value = true;
            orbitalArea.alreadyEntered = true;

            // Map opacity from 0 to 1 based on BodyAngle from startAngle to endAngle (inside area)
            const completionRate = (bodyAngle - startAngle) / (endAngle - startAngle);
            if (this.retrograde) {
              startAngle = bodyAngle;
              orbitalArea.completion = 1 - completionRate;
            } else {
              endAngle = bodyAngle;
              orbitalArea.completion = completionRate;
            }
            orbitalArea.sweptArea = this.calculateSweptArea(startAngle, endAngle);
          }
          // OUTSIDE THE AREA
          else {
            orbitalArea.insideProperty.value = false;
            // Map completion from 1 to 0 based on BodyAngle from startAngle to endAngle (outside area)
            let completionFalloff = (bodyAngle - startAngle - TWOPI) / (endAngle - startAngle - TWOPI);

            // Correct for negative values
            completionFalloff = Utils.moduloBetweenDown(completionFalloff, 0, 1);
            orbitalArea.completion = this.retrograde ? 1 - completionFalloff : completionFalloff;
          }
        }

        // Update orbital area properties
        if (!orbitalArea.alreadyEntered) {
          orbitalArea.completion = 0; // Set it to 0 if it hasn't entered yet
        }

        orbitalArea.dotPosition = this.createPolar(nu); // Position for the dots
        orbitalArea.startPosition = this.createPolar(startAngle);
        orbitalArea.endPosition = this.createPolar(endAngle);
        orbitalArea.active = true;
        previousNu = nu;
      } else {
        orbitalArea.completion = 0;
        orbitalArea.active = false;
        orbitalArea.insideProperty.value = false;
      }
    });
  }
  calculateSweptArea(startAngle, endAngle) {
    // Convert angles from foci to center to get the correct area
    startAngle = this.getMeanAnomaly(startAngle, this.e);
    endAngle = this.getMeanAnomaly(endAngle, this.e);
    endAngle = Utils.moduloBetweenDown(endAngle, startAngle, startAngle + TWOPI);
    return Math.abs(0.5 * this.a * this.b * (endAngle - startAngle));
  }
  calculate_a(r, v) {
    const rMagnitude = r.magnitude;
    const vMagnitude = v.magnitude;
    return rMagnitude * this.mu / (2 * this.mu - rMagnitude * vMagnitude * vMagnitude);
  }
  calculate_e(r, v, a) {
    const rMagnitude = r.magnitude;
    const vMagnitude = v.magnitude;
    const rAngle = r.angle;
    const vAngle = v.angle;
    return Math.pow(1 - Math.pow(rMagnitude * vMagnitude * Math.sin(vAngle - rAngle), 2) / (a * this.mu), 0.5);
  }

  /**
   * Calculates the different angles present in the ellipse
   */
  calculateAngles(r, v, a, e) {
    const rMagnitude = r.magnitude;

    // Position and velocity angles
    const rAngle = r.angle;
    const vAngle = v.angle;

    // Circular orbit case
    let nu = rAngle;

    // Elliptical orbit case
    if (e > 0) {
      // True anomaly comes from the polar ellipse equation. Based on rMagnitude, at what angle should it be
      nu = Math.acos(Utils.clamp(1 / e * (a * (1 - e * e) / rMagnitude - 1), -1, 1));

      // Determine the cuadrant of the true anomaly
      if (Math.cos(rAngle - vAngle) > 0) {
        nu *= -1;
      }
    }

    // Mean angular velocity
    let W = -500 / this.thirdLaw(a);
    this.retrograde = r.crossScalar(v) > 0;
    if (this.retrograde) {
      nu *= -1;
      W *= -1;
    }

    // Calculate Mean Anomaly
    const M = this.getMeanAnomaly(nu, e);

    // Calculate the argument of periapsis
    const w = rAngle - nu;
    return [w, M, W, nu];
  }
  calculateEllipse(r, v) {
    const a = this.calculate_a(r, v);
    const e = this.calculate_e(r, v, a);
    const b = a * Math.sqrt(1 - e * e);
    const c = a * e;
    const [w, M, W, nu] = this.calculateAngles(r, v, a, e);
    return new Ellipse(a, b, c, e, w, M, W, nu);
  }
  calculateR(a, e, nu) {
    return a * (1 - e * e) / (1 + e * Math.cos(nu));
  }

  // Numerical solution to Kepler's Equations for Eccentric Anomaly (E) and then True Anomaly (nu)
  getTrueAnomaly(M) {
    const E1 = M + this.e * Math.sin(M);
    const E2 = M + this.e * Math.sin(E1);
    const E = M + this.e * Math.sin(E2);
    const nu = Math.atan2(Math.pow(1 - this.e * this.e, 0.5) * Math.sin(E), Math.cos(E) - this.e);
    return Utils.moduloBetweenDown(nu, 0, TWOPI);
  }
  getMeanAnomaly(nu, e) {
    // Calculate Eccentric Anomaly and determine its cuadrant
    let E = -Math.acos(Utils.clamp((e + Math.cos(nu)) / (1 + e * Math.cos(nu)), -1, 1));
    if (Math.sin(E) * Math.sin(nu) < 0) {
      E *= -1;
    }

    // Calculate Mean Anomaly
    const M = E - e * Math.sin(E);
    return M;
  }
  resetOrbitalAreas() {
    this.orbitalAreas.forEach(area => {
      area.reset();
    });
    this.calculateOrbitalDivisions(false);
    this.changedEmitter.emit();
  }
  reset() {
    this.resetOrbitalAreas();
    this.a = 1; // semiMajor axis
    this.e = 0; // eccentricity
    this.w = 0; // argument of periapsis
    this.M = 0; // mean anomaly
    this.W = 0; // angular velocity
    this.T = 1; // period
    this.nu = 0; // true anomaly
    this.update();
    this.resetEmitter.emit();
  }
}
keplersLaws.register('EllipticalOrbitEngine', EllipticalOrbitEngine);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb2R5IiwiVmVjdG9yMiIsIlV0aWxzIiwiRW5naW5lIiwiRW1pdHRlciIsIk11bHRpbGluayIsIlNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzIiwiQm9vbGVhblByb3BlcnR5IiwiTnVtYmVyUHJvcGVydHkiLCJPcmJpdFR5cGVzIiwiRW51bWVyYXRpb25Qcm9wZXJ0eSIsIk9yYml0YWxBcmVhIiwia2VwbGVyc0xhd3MiLCJLZXBsZXJzTGF3c0NvbnN0YW50cyIsIlRXT1BJIiwiTWF0aCIsIlBJIiwiZXBzaWxvbiIsIkVsbGlwc2UiLCJjb25zdHJ1Y3RvciIsImEiLCJiIiwiYyIsImUiLCJ3IiwiTSIsIlciLCJudSIsIklOSVRJQUxfTVUiLCJFbGxpcHRpY2FsT3JiaXRFbmdpbmUiLCJtdSIsImNoYW5nZWRFbWl0dGVyIiwicmVzZXRFbWl0dGVyIiwiYm9keVBvbGFyUG9zaXRpb24iLCJwZXJpb2REaXZpc2lvbnMiLCJvcmJpdGFsQXJlYXMiLCJ1cGRhdGVBbGxvd2VkIiwicmV0cm9ncmFkZSIsImFsd2F5c0NpcmNsZXMiLCJpc0NpcmN1bGFyUHJvcGVydHkiLCJzZW1pTWFqb3JBeGlzUHJvcGVydHkiLCJzZW1pTWlub3JBeGlzUHJvcGVydHkiLCJmb2NhbERpc3RhbmNlUHJvcGVydHkiLCJkaXN0YW5jZTFQcm9wZXJ0eSIsImRpc3RhbmNlMlByb3BlcnR5IiwicGVyaW9kUHJvcGVydHkiLCJlY2NlbnRyaWNpdHlQcm9wZXJ0eSIsIlQiLCJMIiwiZDEiLCJkMiIsImFsbG93ZWRPcmJpdFByb3BlcnR5IiwiZXNjYXBlU3BlZWRQcm9wZXJ0eSIsImVzY2FwZVJhZGl1c1Byb3BlcnR5IiwidG90YWxBcmVhIiwic2VnbWVudEFyZWEiLCJib2RpZXMiLCJvcmJpdFR5cGVQcm9wZXJ0eSIsIlNUQUJMRV9PUkJJVCIsInN1biIsImJvZHkiLCJzdW5NYXNzUHJvcGVydHkiLCJtYXNzUHJvcGVydHkiLCJpIiwiTUFYX09SQklUQUxfRElWSVNJT05TIiwicHVzaCIsIm11bHRpbGluayIsInBvc2l0aW9uUHJvcGVydHkiLCJ2ZWxvY2l0eVByb3BlcnR5IiwicG9zaXRpb24iLCJ2ZWxvY2l0eSIsIm1hc3MiLCJyTWFnbml0dWRlIiwibWFnbml0dWRlIiwidk1hZ25pdHVkZSIsInZhbHVlIiwic3FydCIsInVzZXJDb250cm9sbGVkUG9zaXRpb25Qcm9wZXJ0eSIsInVzZXJDb250cm9sbGVkVmVsb2NpdHlQcm9wZXJ0eSIsInVzZXJDb250cm9sbGVkTWFzc1Byb3BlcnR5IiwidXNlckNvbnRyb2xsZWRQb3NpdGlvbiIsInVzZXJDb250cm9sbGVkVmVsb2NpdHkiLCJ1c2VyQ29udHJvbGxlZE1hc3MiLCJyZXNldE9yYml0YWxBcmVhcyIsInVwZGF0ZSIsInRoaXJkTGF3IiwicG93IiwicnVuIiwiZHQiLCJnZXRUcnVlQW5vbWFseSIsImN1cnJlbnRQb3NpdGlvbiIsIm5ld1Bvc2l0aW9uIiwiY3JlYXRlUG9sYXIiLCJuZXdWZWxvY2l0eSIsIm1pbnVzIiwibm9ybWFsaXplIiwibmV3QW5ndWxhck1vbWVudHVtIiwiY3Jvc3NTY2FsYXIiLCJtdWx0aXBseVNjYWxhciIsInVwZGF0ZUJvZHlEaXN0YW5jZXMiLCJ1cGRhdGVGb3JjZXMiLCJjYWxjdWxhdGVPcmJpdGFsRGl2aXNpb25zIiwiZW1pdCIsIlBPU0lUSU9OX01VTFRJUExJRVIiLCJmb3JjZSIsInRpbWVzU2NhbGFyIiwiZm9yY2VQcm9wZXJ0eSIsImFjY2VsZXJhdGlvblByb3BlcnR5IiwiciIsImVzY2FwZWQiLCJlbmZvcmNlQ2lyY3VsYXJPcmJpdCIsInJlYWxFc2NhcGVTcGVlZCIsImN1cnJlbnRTcGVlZCIsImVuZm9yY2VFc2NhcGVTcGVlZCIsIkVTQ0FQRV9PUkJJVCIsInYiLCJjYWxjdWxhdGVFbGxpcHNlIiwiY29sbGlkZWRXaXRoU3VuIiwiQ1JBU0hfT1JCSVQiLCJkaXJlY3Rpb24iLCJwZXJwZW5kaWN1bGFyIiwibm9ybWFsaXplZCIsIm1hc3NUb1JhZGl1cyIsImNhbGN1bGF0ZVIiLCJmaWxsQXJlYXMiLCJwcmV2aW91c051IiwiYm9keUFuZ2xlIiwiZm9yRWFjaCIsIm9yYml0YWxBcmVhIiwic3RhcnRBbmdsZSIsImVuZEFuZ2xlIiwibW9kdWxvQmV0d2VlbkRvd24iLCJpbnNpZGVQcm9wZXJ0eSIsImFscmVhZHlFbnRlcmVkIiwiY29tcGxldGlvblJhdGUiLCJjb21wbGV0aW9uIiwic3dlcHRBcmVhIiwiY2FsY3VsYXRlU3dlcHRBcmVhIiwiY29tcGxldGlvbkZhbGxvZmYiLCJkb3RQb3NpdGlvbiIsInN0YXJ0UG9zaXRpb24iLCJlbmRQb3NpdGlvbiIsImFjdGl2ZSIsImdldE1lYW5Bbm9tYWx5IiwiYWJzIiwiY2FsY3VsYXRlX2EiLCJjYWxjdWxhdGVfZSIsInJBbmdsZSIsImFuZ2xlIiwidkFuZ2xlIiwic2luIiwiY2FsY3VsYXRlQW5nbGVzIiwiYWNvcyIsImNsYW1wIiwiY29zIiwiRTEiLCJFMiIsIkUiLCJhdGFuMiIsImFyZWEiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRWxsaXB0aWNhbE9yYml0RW5naW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuLyoqXHJcbiAqIFRoZSBFbGxpcHRpY2FsIE9yYml0IG1vZGVsIGVsZW1lbnQuIEV2b2x2ZXMgdGhlIGJvZHkgYW5kXHJcbiAqIGtlZXBzIHRyYWNrIG9mIG9yYml0YWwgZWxlbWVudHMuXHJcbiAqIFNlcnZlcyBhcyB0aGUgRW5naW5lIGZvciB0aGUgS2VwbGVyJ3MgTGF3cyBNb2RlbFxyXG4gKlxyXG4gKiBWYXJpYWJsZSBkZWZpbml0aW9uczpcclxuICogcjogcG9zaXRpb24gdmVjdG9yXHJcbiAqIHY6IHZlbG9jaXR5IHZlY3RvclxyXG4gKiByQW5nbGU6IGhlYWRpbmcgb2YgclxyXG4gKiB2QW5nbGU6IGhlYWRpbmcgb2YgdlxyXG4gKiBhOiBzZW1pLW1ham9yIGF4aXNcclxuICogYjogc2VtaS1taW5vciBheGlzXHJcbiAqIGM6IGZvY2FsIGRpc3RhbmNlXHJcbiAqIGU6IGVjY2VudHJpY2l0eVxyXG4gKiBudTogdHJ1ZSBhbm9tYWx5ICggYW5ndWxhciBwb3NpdGlvbiBvZiB0aGUgYm9keSBzZWVuIGZyb20gbWFpbiBmb2N1cyApXHJcbiAqIHc6IGFyZ3VtZW50IG9mIHBlcmlhcHNpcyAoIGFuZ3VsYXIgZGV2aWF0aW9uIG9mIHBlcmlhcHNpcyBmcm9tIHRoZSAwwrAgaGVhZGluZyApXHJcbiAqIE06IEluaXRpYWwgbWVhbiBhbm9tYWx5ICggYW5ndWxhciBwb3NpdGlvbiBvZiB0aGUgYm9keSBzZWVuIGZyb20gdGhlIGNlbnRlciBvZiB0aGUgZWxsaXBzZSApXHJcbiAqIFc6IGFuZ3VsYXIgdmVsb2NpdHlcclxuICpcclxuICogQGF1dGhvciBBZ3VzdMOtbiBWYWxsZWpvXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvZHkgZnJvbSAnLi4vLi4vLi4vLi4vc29sYXItc3lzdGVtLWNvbW1vbi9qcy9tb2RlbC9Cb2R5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IEVuZ2luZSBmcm9tICcuLi8uLi8uLi8uLi9zb2xhci1zeXN0ZW0tY29tbW9uL2pzL21vZGVsL0VuZ2luZS5qcyc7XHJcbmltcG9ydCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cyBmcm9tICcuLi8uLi8uLi8uLi9zb2xhci1zeXN0ZW0tY29tbW9uL2pzL1NvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IE9yYml0VHlwZXMgZnJvbSAnLi9PcmJpdFR5cGVzLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE9yYml0YWxBcmVhIGZyb20gJy4vT3JiaXRhbEFyZWEuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBrZXBsZXJzTGF3cyBmcm9tICcuLi8uLi9rZXBsZXJzTGF3cy5qcyc7XHJcbmltcG9ydCBLZXBsZXJzTGF3c0NvbnN0YW50cyBmcm9tICcuLi8uLi9LZXBsZXJzTGF3c0NvbnN0YW50cy5qcyc7XHJcblxyXG5jb25zdCBUV09QSSA9IDIgKiBNYXRoLlBJO1xyXG5cclxuLy8gU2NhbGluZyBkb3duIGZhY3RvciBmb3IgdGhlIGVzY2FwZSB2ZWxvY2l0eSB0byBhdm9pZCB1bndhbnRlZCBlcnJvcnNcclxuY29uc3QgZXBzaWxvbiA9IDAuOTk7XHJcblxyXG4vLyBDcmVhdGlvbiBvZiBjaGlsZHJlbiBjbGFzc2VzXHJcbmNsYXNzIEVsbGlwc2Uge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgIHB1YmxpYyBhOiBudW1iZXIsXHJcbiAgICBwdWJsaWMgYjogbnVtYmVyLFxyXG4gICAgcHVibGljIGM6IG51bWJlcixcclxuICAgIHB1YmxpYyBlOiBudW1iZXIsXHJcbiAgICBwdWJsaWMgdzogbnVtYmVyLFxyXG4gICAgcHVibGljIE06IG51bWJlcixcclxuICAgIHB1YmxpYyBXOiBudW1iZXIsXHJcbiAgICBwdWJsaWMgbnU6IG51bWJlclxyXG4gICkge31cclxufVxyXG5cclxuY29uc3QgSU5JVElBTF9NVSA9IDJlNjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVsbGlwdGljYWxPcmJpdEVuZ2luZSBleHRlbmRzIEVuZ2luZSB7XHJcbiAgcHVibGljIG11ID0gSU5JVElBTF9NVTsgLy8gbXUgPSBHICogTWFzc19zdW4sIGFuZCBHIGluIHRoaXMgc2ltIGlzIDFlNFxyXG4gIHB1YmxpYyByZWFkb25seSBzdW46IEJvZHk7XHJcbiAgcHVibGljIHJlYWRvbmx5IGJvZHk6IEJvZHk7XHJcbiAgcHVibGljIHJlYWRvbmx5IHN1bk1hc3NQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgY2hhbmdlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gIHB1YmxpYyByZWFkb25seSByZXNldEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gIHB1YmxpYyBib2R5UG9sYXJQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCAxLCAwICk7XHJcbiAgcHVibGljIHBlcmlvZERpdmlzaW9ucyA9IDQ7XHJcbiAgcHVibGljIG9yYml0YWxBcmVhczogT3JiaXRhbEFyZWFbXSA9IFtdO1xyXG4gIHB1YmxpYyB1cGRhdGVBbGxvd2VkID0gdHJ1ZTtcclxuICBwdWJsaWMgcmV0cm9ncmFkZSA9IGZhbHNlO1xyXG4gIHB1YmxpYyBhbHdheXNDaXJjbGVzID0gZmFsc2U7XHJcbiAgcHVibGljIGlzQ2lyY3VsYXJQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuXHJcbiAgcHVibGljIHNlbWlNYWpvckF4aXNQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMSApO1xyXG4gIHB1YmxpYyBzZW1pTWlub3JBeGlzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDEgKTtcclxuICBwdWJsaWMgZm9jYWxEaXN0YW5jZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxICk7XHJcbiAgcHVibGljIGRpc3RhbmNlMVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxICk7XHJcbiAgcHVibGljIGRpc3RhbmNlMlByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxICk7XHJcbiAgcHVibGljIHBlcmlvZFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxICk7XHJcbiAgcHVibGljIGVjY2VudHJpY2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gIC8vIFRoZXNlIHZhcmlhYmxlIG5hbWVzIGFyZSBsZXR0ZXJzIHRvIGNvbXBhcmUgYW5kIHJlYWQgbW9yZSBlYXNpbHkgdGhlIGVxdWF0aW9ucyB0aGV5IGFyZSBpblxyXG4gIHB1YmxpYyBhID0gMTsgIC8vIHNlbWktbWFqb3IgYXhpc1xyXG4gIHB1YmxpYyBiID0gMDsgIC8vIHNlbWktbWlub3IgYXhpc1xyXG4gIHB1YmxpYyBjID0gMDsgIC8vIGZvY2FsIGRpc3RhbmNlXHJcbiAgcHVibGljIGUgPSAwOyAgLy8gZWNjZW50cmljaXR5XHJcbiAgcHVibGljIHcgPSAwOyAgLy8gYXJndW1lbnQgb2YgcGVyaWFwc2lzXHJcbiAgcHVibGljIE0gPSAwOyAgLy8gbWVhbiBhbm9tYWx5XHJcbiAgcHVibGljIFcgPSAwOyAgLy8gYW5ndWxhciB2ZWxvY2l0eVxyXG4gIHB1YmxpYyBUID0gMTsgIC8vIHBlcmlvZFxyXG4gIHB1YmxpYyBudSA9IDA7IC8vIHRydWUgYW5vbWFseVxyXG4gIHB1YmxpYyBMID0gMDsgIC8vIGFuZ3VsYXIgbW9tZW50dW1cclxuICBwdWJsaWMgZDEgPSAwOyAvLyBkaXN0YW5jZSBmcm9tIHRoZSBtYWluIGZvY3VzIHRvIHRoZSBib2R5XHJcbiAgcHVibGljIGQyID0gMDsgLy8gZGlzdGFuY2UgZnJvbSB0aGUgc2Vjb25kYXJ5IGZvY3VzIHRvIHRoZSBib2R5XHJcblxyXG4gIC8vIEtlZXBzIHRyYWNrIG9mIHRoZSB2YWxpZGl0eSBvZiB0aGUgb3JiaXQuIFRydWUgaWYgZWxsaXB0aWMsIGZhbHNlIGVpdGhlciBpZiBwYXJhYm9saWMgb3IgY29sbGlzaW9uIG9yYml0LlxyXG4gIHB1YmxpYyBhbGxvd2VkT3JiaXRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgcHVibGljIHJlYWRvbmx5IG9yYml0VHlwZVByb3BlcnR5OiBFbnVtZXJhdGlvblByb3BlcnR5PE9yYml0VHlwZXM+O1xyXG4gIHB1YmxpYyByZWFkb25seSBlc2NhcGVTcGVlZFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcbiAgcHVibGljIHJlYWRvbmx5IGVzY2FwZVJhZGl1c1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gIHB1YmxpYyB0b3RhbEFyZWEgPSAxO1xyXG4gIHB1YmxpYyBzZWdtZW50QXJlYSA9IDE7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYm9kaWVzOiBPYnNlcnZhYmxlQXJyYXk8Qm9keT4gKSB7XHJcbiAgICBzdXBlciggYm9kaWVzICk7XHJcblxyXG4gICAgdGhpcy5vcmJpdFR5cGVQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBPcmJpdFR5cGVzLlNUQUJMRV9PUkJJVCApO1xyXG5cclxuICAgIC8vIEluIHRoZSBjYXNlIG9mIHRoaXMgc2NyZWVuLCB0aGUgYm9keSAwIGlzIHRoZSBzdW4sIGFuZCB0aGUgYm9keSAxIGlzIHRoZSBwbGFuZXRcclxuICAgIHRoaXMuc3VuID0gYm9kaWVzWyAwIF07XHJcbiAgICB0aGlzLmJvZHkgPSBib2RpZXNbIDEgXTtcclxuICAgIHRoaXMuc3VuTWFzc1Byb3BlcnR5ID0gYm9kaWVzWyAwIF0ubWFzc1Byb3BlcnR5O1xyXG5cclxuICAgIC8vIFBvcHVsYXRlIHRoZSBvcmJpdGFsIGFyZWFzXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBLZXBsZXJzTGF3c0NvbnN0YW50cy5NQVhfT1JCSVRBTF9ESVZJU0lPTlM7IGkrKyApIHtcclxuICAgICAgdGhpcy5vcmJpdGFsQXJlYXMucHVzaCggbmV3IE9yYml0YWxBcmVhKCkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBNdWx0aWxpbmsgdG8gdXBkYXRlIHRoZSBvcmJpdCBiYXNlZCBvbiB0aGUgYm9kaWVzIHBvc2l0aW9uIGFuZCB2ZWxvY2l0eVxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgW1xyXG4gICAgICAgIHRoaXMuYm9keS5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eVByb3BlcnR5LFxyXG4gICAgICAgIHRoaXMuYm9kaWVzWyAwIF0ubWFzc1Byb3BlcnR5XHJcbiAgICAgIF0sXHJcbiAgICAgIChcclxuICAgICAgICBwb3NpdGlvbjogVmVjdG9yMixcclxuICAgICAgICB2ZWxvY2l0eTogVmVjdG9yMixcclxuICAgICAgICBtYXNzOiBudW1iZXJcclxuICAgICAgKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgck1hZ25pdHVkZSA9IHBvc2l0aW9uLm1hZ25pdHVkZTtcclxuICAgICAgICBjb25zdCB2TWFnbml0dWRlID0gdmVsb2NpdHkubWFnbml0dWRlO1xyXG5cclxuICAgICAgICB0aGlzLm11ID0gMWU0ICogbWFzcztcclxuXHJcbiAgICAgICAgdGhpcy5lc2NhcGVSYWRpdXNQcm9wZXJ0eS52YWx1ZSA9IDIgKiB0aGlzLm11IC8gKCB2TWFnbml0dWRlICogdk1hZ25pdHVkZSApICogZXBzaWxvbiAqIGVwc2lsb247XHJcbiAgICAgICAgdGhpcy5lc2NhcGVTcGVlZFByb3BlcnR5LnZhbHVlID0gTWF0aC5zcXJ0KCAyICogdGhpcy5tdSAvIHJNYWduaXR1ZGUgKSAqIGVwc2lsb247XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBNdWx0aWxpbmsgdG8gcmVsZWFzZSBvcmJpdGFsIHVwZGF0ZXMgd2hlbiB0aGUgdXNlciBpcyBjb250cm9sbGluZyB0aGUgYm9keVxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgW1xyXG4gICAgICAgIHRoaXMuYm9keS51c2VyQ29udHJvbGxlZFBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgICAgdGhpcy5ib2R5LnVzZXJDb250cm9sbGVkVmVsb2NpdHlQcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLmJvZGllc1sgMCBdLnVzZXJDb250cm9sbGVkTWFzc1Byb3BlcnR5XHJcbiAgICAgIF0sXHJcbiAgICAgIChcclxuICAgICAgICB1c2VyQ29udHJvbGxlZFBvc2l0aW9uOiBib29sZWFuLFxyXG4gICAgICAgIHVzZXJDb250cm9sbGVkVmVsb2NpdHk6IGJvb2xlYW4sXHJcbiAgICAgICAgdXNlckNvbnRyb2xsZWRNYXNzOiBib29sZWFuXHJcbiAgICAgICkgPT4ge1xyXG4gICAgICAgIHRoaXMudXBkYXRlQWxsb3dlZCA9IHVzZXJDb250cm9sbGVkUG9zaXRpb24gfHwgdXNlckNvbnRyb2xsZWRWZWxvY2l0eSB8fCB1c2VyQ29udHJvbGxlZE1hc3M7XHJcbiAgICAgICAgdGhpcy5yZXNldE9yYml0YWxBcmVhcygpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB0aGlyZExhdyggYTogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gTWF0aC5wb3coIElOSVRJQUxfTVUgKiBhICogYSAqIGEgLyB0aGlzLm11LCAxIC8gMiApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIHJ1biggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIC8vIFByZXZlbnQgdGhlIG9yYml0IGZyb20gdXBkYXRpbmcgaWYgdGhlIGJvZHkgaXMgb3JiaXRpbmdcclxuICAgIHRoaXMudXBkYXRlQWxsb3dlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSB0aGUgbmV3IHBvc2l0aW9uIGFuZCB2ZWxvY2l0eSBvZiB0aGUgYm9keVxyXG4gICAgdGhpcy5NICs9IGR0ICogdGhpcy5XO1xyXG4gICAgdGhpcy5udSA9IHRoaXMuZ2V0VHJ1ZUFub21hbHkoIHRoaXMuTSApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgcG9zaXRpb24gYW5kIHZlbG9jaXR5IG9mIHRoZSBib2R5XHJcbiAgICBjb25zdCBjdXJyZW50UG9zaXRpb24gPSB0aGlzLmJvZHkucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gdGhpcy5jcmVhdGVQb2xhciggdGhpcy5udSwgdGhpcy53ICk7XHJcbiAgICBjb25zdCBuZXdWZWxvY2l0eSA9IG5ld1Bvc2l0aW9uLm1pbnVzKCBjdXJyZW50UG9zaXRpb24gKS5ub3JtYWxpemUoKTtcclxuICAgIGNvbnN0IG5ld0FuZ3VsYXJNb21lbnR1bSA9IG5ld1Bvc2l0aW9uLmNyb3NzU2NhbGFyKCBuZXdWZWxvY2l0eSApO1xyXG4gICAgbmV3VmVsb2NpdHkubXVsdGlwbHlTY2FsYXIoIHRoaXMuTCAvIG5ld0FuZ3VsYXJNb21lbnR1bSApO1xyXG5cclxuICAgIHRoaXMuYm9keS5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3UG9zaXRpb247XHJcbiAgICB0aGlzLmJvZHkudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSA9IG5ld1ZlbG9jaXR5O1xyXG5cclxuICAgIHRoaXMudXBkYXRlQm9keURpc3RhbmNlcygpO1xyXG4gICAgdGhpcy51cGRhdGVGb3JjZXMoIG5ld1Bvc2l0aW9uICk7XHJcblxyXG4gICAgdGhpcy5jYWxjdWxhdGVPcmJpdGFsRGl2aXNpb25zKCB0cnVlICk7XHJcbiAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVCb2R5RGlzdGFuY2VzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5ib2R5UG9sYXJQb3NpdGlvbiA9IHRoaXMuY3JlYXRlUG9sYXIoIHRoaXMubnUgKTtcclxuICAgIHRoaXMuZDEgPSB0aGlzLmJvZHlQb2xhclBvc2l0aW9uLm1hZ25pdHVkZTtcclxuICAgIHRoaXMuZDIgPSAyICogdGhpcy5hIC0gdGhpcy5kMTtcclxuXHJcbiAgICB0aGlzLmRpc3RhbmNlMVByb3BlcnR5LnZhbHVlID0gdGhpcy5kMSAqIFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLlBPU0lUSU9OX01VTFRJUExJRVI7XHJcbiAgICB0aGlzLmRpc3RhbmNlMlByb3BlcnR5LnZhbHVlID0gdGhpcy5kMiAqIFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLlBPU0lUSU9OX01VTFRJUExJRVI7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdXBkYXRlRm9yY2VzKCBwb3NpdGlvbjogVmVjdG9yMiApOiB2b2lkIHtcclxuICAgIGNvbnN0IGZvcmNlID0gcG9zaXRpb24udGltZXNTY2FsYXIoIC10aGlzLm11ICogdGhpcy5ib2R5Lm1hc3NQcm9wZXJ0eS52YWx1ZSAvIE1hdGgucG93KCBwb3NpdGlvbi5tYWduaXR1ZGUsIDMgKSApO1xyXG4gICAgdGhpcy5ib2R5LmZvcmNlUHJvcGVydHkudmFsdWUgPSBmb3JjZTtcclxuICAgIHRoaXMuYm9keS5hY2NlbGVyYXRpb25Qcm9wZXJ0eS52YWx1ZSA9IGZvcmNlLnRpbWVzU2NhbGFyKCAxIC8gdGhpcy5ib2R5Lm1hc3NQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgdGhpcy5zdW4uZm9yY2VQcm9wZXJ0eS52YWx1ZSA9IGZvcmNlLnRpbWVzU2NhbGFyKCAtMSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQmFzZWQgb24gdGhlIGN1cnJlbnQgcG9zaXRpb24gYW5kIHZlbG9jaXR5IG9mIHRoZSBib2R5XHJcbiAgICogVXBkYXRlcyB0aGUgb3JiaXRhbCBlbGVtZW50cyBvZiB0aGUgYm9keSB1c2luZyBPcmJpdGFsIE1lY2hhbmljcyBBbmFseXRpYyBFcXVhdGlvbnNcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgdXBkYXRlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5yZXNldE9yYml0YWxBcmVhcygpO1xyXG5cclxuICAgIGNvbnN0IHIgPSB0aGlzLmJvZHkucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgIHRoaXMudXBkYXRlRm9yY2VzKCByICk7XHJcblxyXG4gICAgbGV0IGVzY2FwZWQgPSBmYWxzZTtcclxuICAgIGlmICggdGhpcy5hbHdheXNDaXJjbGVzICkge1xyXG4gICAgICB0aGlzLmVuZm9yY2VDaXJjdWxhck9yYml0KCByICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgcmVhbEVzY2FwZVNwZWVkID0gdGhpcy5lc2NhcGVTcGVlZFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICBjb25zdCBjdXJyZW50U3BlZWQgPSB0aGlzLmJvZHkudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZS5tYWduaXR1ZGU7XHJcbiAgICAgIGlmICggY3VycmVudFNwZWVkID49IHJlYWxFc2NhcGVTcGVlZCApIHtcclxuICAgICAgICB0aGlzLmVuZm9yY2VFc2NhcGVTcGVlZCgpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIFVzaW5nIGVwc2lsb24gZm9yIGEgbG93ZXIgdGhyZXNob2xkIG9uIGVzY2FwZSBvcmJpdHMgdG8gYXZvaWQgZmxvYXRpbmcgcG9pbnQgZXJyb3JzLCB3aGljaCBpbmR1Y2VkIHNvbWUgZmxpY2tlcmluZyBvbiBlZGdlIGNhc2VzXHJcbiAgICAgIGVzY2FwZWQgPSBjdXJyZW50U3BlZWQgPj0gKCByZWFsRXNjYXBlU3BlZWQgKiBlcHNpbG9uICk7XHJcbiAgICAgIGlmICggZXNjYXBlZCApIHtcclxuICAgICAgICB0aGlzLmFsbG93ZWRPcmJpdFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5vcmJpdFR5cGVQcm9wZXJ0eS52YWx1ZSA9IE9yYml0VHlwZXMuRVNDQVBFX09SQklUO1xyXG4gICAgICAgIHRoaXMuZWNjZW50cmljaXR5UHJvcGVydHkudmFsdWUgPSAxO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdiA9IHRoaXMuYm9keS52ZWxvY2l0eVByb3BlcnR5LnZhbHVlO1xyXG4gICAgdGhpcy5MID0gci5jcm9zc1NjYWxhciggdiApO1xyXG5cclxuICAgIGNvbnN0IHsgYSwgYiwgYywgZSwgdywgTSwgVywgbnUgfSA9IHRoaXMuY2FsY3VsYXRlRWxsaXBzZSggciwgdiApO1xyXG4gICAgdGhpcy5hID0gYTtcclxuICAgIHRoaXMuYiA9IGI7XHJcbiAgICB0aGlzLmMgPSBjO1xyXG4gICAgdGhpcy5lID0gZTtcclxuICAgIHRoaXMudyA9IHc7XHJcbiAgICB0aGlzLk0gPSBNO1xyXG4gICAgdGhpcy5XID0gVztcclxuICAgIHRoaXMubnUgPSBudTtcclxuXHJcbiAgICB0aGlzLlQgPSB0aGlzLnRoaXJkTGF3KCB0aGlzLmEgKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZUJvZHlEaXN0YW5jZXMoKTtcclxuICAgIHRoaXMudG90YWxBcmVhID0gTWF0aC5QSSAqIHRoaXMuYSAqIHRoaXMuYjtcclxuICAgIHRoaXMuc2VnbWVudEFyZWEgPSB0aGlzLnRvdGFsQXJlYSAvIHRoaXMucGVyaW9kRGl2aXNpb25zO1xyXG5cclxuICAgIHRoaXMuc2VtaU1ham9yQXhpc1Byb3BlcnR5LnZhbHVlID0gdGhpcy5hICogU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuUE9TSVRJT05fTVVMVElQTElFUjtcclxuICAgIHRoaXMuc2VtaU1pbm9yQXhpc1Byb3BlcnR5LnZhbHVlID0gdGhpcy5iICogU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuUE9TSVRJT05fTVVMVElQTElFUjtcclxuICAgIHRoaXMuZm9jYWxEaXN0YW5jZVByb3BlcnR5LnZhbHVlID0gdGhpcy5jICogU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuUE9TSVRJT05fTVVMVElQTElFUjtcclxuICAgIHRoaXMucGVyaW9kUHJvcGVydHkudmFsdWUgPSB0aGlzLlQgKiBNYXRoLnBvdyggU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuUE9TSVRJT05fTVVMVElQTElFUiwgMyAvIDIgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuY29sbGlkZWRXaXRoU3VuKCBhLCBlICkgKSB7XHJcbiAgICAgIHRoaXMuYWxsb3dlZE9yYml0UHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5vcmJpdFR5cGVQcm9wZXJ0eS52YWx1ZSA9IE9yYml0VHlwZXMuQ1JBU0hfT1JCSVQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggIWVzY2FwZWQgKSB7XHJcbiAgICAgIHRoaXMuYWxsb3dlZE9yYml0UHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICB0aGlzLm9yYml0VHlwZVByb3BlcnR5LnZhbHVlID0gT3JiaXRUeXBlcy5TVEFCTEVfT1JCSVQ7XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRlT3JiaXRhbERpdmlzaW9ucyggZmFsc2UgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGUgIT09IHRoaXMuZWNjZW50cmljaXR5UHJvcGVydHkudmFsdWUgJiYgdGhpcy5vcmJpdFR5cGVQcm9wZXJ0eS52YWx1ZSAhPT0gT3JiaXRUeXBlcy5FU0NBUEVfT1JCSVQgKSB7XHJcbiAgICAgIGlmICggdGhpcy5hbHdheXNDaXJjbGVzIHx8IHRoaXMuZSA8IDAuMDEgKSB7XHJcbiAgICAgICAgdGhpcy5lY2NlbnRyaWNpdHlQcm9wZXJ0eS52YWx1ZSA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lY2NlbnRyaWNpdHlQcm9wZXJ0eS52YWx1ZSA9IGU7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5pc0NpcmN1bGFyUHJvcGVydHkudmFsdWUgPSB0aGlzLmVjY2VudHJpY2l0eVByb3BlcnR5LnZhbHVlID09PSAwO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICB0aGlzLmNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZW5mb3JjZUNpcmN1bGFyT3JiaXQoIHBvc2l0aW9uOiBWZWN0b3IyICk6IHZvaWQge1xyXG4gICAgLy8gQWx3YXlzIHNldCB0aGUgdmVsb2NpdHkgdG8gYmUgcGVycGVuZGljdWxhciB0byB0aGUgcG9zaXRpb24gYW5kIGNpcmN1bGFyXHJcbiAgICBjb25zdCBkaXJlY3Rpb24gPSB0aGlzLnJldHJvZ3JhZGUgPyAtMSA6IDE7XHJcbiAgICB0aGlzLmJvZHkudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZSA9XHJcbiAgICAgIHBvc2l0aW9uLnBlcnBlbmRpY3VsYXIubm9ybWFsaXplKCkubXVsdGlwbHlTY2FsYXIoIGRpcmVjdGlvbiAqIDEuMDAwMSAqIE1hdGguc3FydCggdGhpcy5tdSAvIHBvc2l0aW9uLm1hZ25pdHVkZSApICk7XHJcbiAgICAvLyBUT0RPOiBWZWxvY2l0eSBhIGJpdCBvdmVyIGNpcmN1bGFyIG9yYml0IHRvIGF2b2lkIHNvbWUgZXJyb3JzLCBidXQgdGhleSBzaG91bGRudCBiZSBoYXBwZW5pbmdcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZW5mb3JjZUVzY2FwZVNwZWVkKCk6IHZvaWQge1xyXG4gICAgdGhpcy5ib2R5LnZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSB0aGlzLmJvZHkudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZS5ub3JtYWxpemVkKCkubXVsdGlwbHlTY2FsYXIoIHRoaXMuZXNjYXBlU3BlZWRQcm9wZXJ0eS52YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb2xsaWRlZFdpdGhTdW4oIGE6IG51bWJlciwgZTogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGEgKiAoIDEgLSBlICkgPCBCb2R5Lm1hc3NUb1JhZGl1cyggdGhpcy5ib2RpZXNbIDAgXS5tYXNzUHJvcGVydHkudmFsdWUgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjcmVhdGVQb2xhciggbnU6IG51bWJlciwgdyA9IDAgKTogVmVjdG9yMiB7XHJcbiAgICAvLyBudSBpcyB0aGUgdHJ1ZSBhbm9tYWx5IChBbmdsZSBiZXR3ZWVuIHBlcmlhcHNpcyBhbmQgdGhlIGJvZHkpXHJcbiAgICAvLyB3IGlzIHRoZSBhcmd1bWVudCBvZiBwZXJpYXBzaXMgKGdsb2JhbCByb3RhdGlvbiBvZiBwZXJpYXBzaXMpXHJcbiAgICAvLyBXaGVuIHcgaXMgbm90IHByb3ZpZGVkICgwKSwgd2UncmUgdXNpbmcgbG9jYWwgb3JiaXRhbCBjb29yZGluYXRlcy4gV2hlbiBwcm92aWRlZCwgdGhlIHJlc3VsdCBpcyBpbiBnbG9iYWwgY29vcmRpbmF0ZXMuXHJcbiAgICByZXR1cm4gVmVjdG9yMi5jcmVhdGVQb2xhciggdGhpcy5jYWxjdWxhdGVSKCB0aGlzLmEsIHRoaXMuZSwgbnUgKSwgbnUgKyB3ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCYXNlZCBvbiB0aGUgbnVtYmVyIG9mIGRpdmlzaW9ucyBwcm92aWRlZCBieSB0aGUgbW9kZWwsXHJcbiAgICogZGl2aWRlcyB0aGUgb3JiaXQgaW4gZXF1YWwgdGltZSBzZWN0aW9ucy5cclxuICAgKi9cclxuICBwcml2YXRlIGNhbGN1bGF0ZU9yYml0YWxEaXZpc2lvbnMoIGZpbGxBcmVhczogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIC8vIE51IGlzIHRoZSBhbmd1bGFyIHBvc2l0aW9uIG9mIHRoZSBib2R5IGFzIHNlZW4gZnJvbSB0aGUgbWFpbiBmb2N1c1xyXG4gICAgbGV0IHByZXZpb3VzTnUgPSAwO1xyXG4gICAgbGV0IGJvZHlBbmdsZSA9IC10aGlzLm51O1xyXG5cclxuICAgIHRoaXMuc2VnbWVudEFyZWEgPSB0aGlzLnRvdGFsQXJlYSAvIHRoaXMucGVyaW9kRGl2aXNpb25zO1xyXG5cclxuICAgIHRoaXMub3JiaXRhbEFyZWFzLmZvckVhY2goICggb3JiaXRhbEFyZWEsIGkgKSA9PiB7XHJcbiAgICAgIGlmICggaSA8IHRoaXMucGVyaW9kRGl2aXNpb25zICYmIHRoaXMuYWxsb3dlZE9yYml0UHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRydWUgYW5vbWFseVxyXG4gICAgICAgIC8vICggaSArIDEgKSBiZWNhdXNlIGZpcnN0IGFuZ2xlIGlzIGFsd2F5cyBudSA9IDBcclxuICAgICAgICBjb25zdCBNID0gKCBpICsgMSApICogVFdPUEkgLyB0aGlzLnBlcmlvZERpdmlzaW9ucztcclxuICAgICAgICBjb25zdCBudSA9IHRoaXMuZ2V0VHJ1ZUFub21hbHkoIE0gKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIG9yYml0YWwgYXJlYXMgYW5nbGVzLCBjb25zdHJhaW5lZCBieSB0aGUgc3RhcnRBbmdsZVxyXG4gICAgICAgIGxldCBzdGFydEFuZ2xlID0gcHJldmlvdXNOdTtcclxuICAgICAgICBsZXQgZW5kQW5nbGUgPSBVdGlscy5tb2R1bG9CZXR3ZWVuRG93biggbnUsIHN0YXJ0QW5nbGUsIHN0YXJ0QW5nbGUgKyBUV09QSSApO1xyXG4gICAgICAgIGJvZHlBbmdsZSA9IFV0aWxzLm1vZHVsb0JldHdlZW5Eb3duKCBib2R5QW5nbGUsIHN0YXJ0QW5nbGUsIHN0YXJ0QW5nbGUgKyBUV09QSSApO1xyXG5cclxuICAgICAgICBvcmJpdGFsQXJlYS5zdGFydEFuZ2xlID0gc3RhcnRBbmdsZTtcclxuICAgICAgICBvcmJpdGFsQXJlYS5lbmRBbmdsZSA9IGVuZEFuZ2xlO1xyXG5cclxuICAgICAgICBpZiAoIGZpbGxBcmVhcyApIHtcclxuICAgICAgICAgIC8vIEJvZHkgaW5zaWRlIHRoZSBhcmVhXHJcbiAgICAgICAgICBpZiAoIHN0YXJ0QW5nbGUgPD0gYm9keUFuZ2xlICYmIGJvZHlBbmdsZSA8IGVuZEFuZ2xlICkge1xyXG4gICAgICAgICAgICBvcmJpdGFsQXJlYS5pbnNpZGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIG9yYml0YWxBcmVhLmFscmVhZHlFbnRlcmVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIE1hcCBvcGFjaXR5IGZyb20gMCB0byAxIGJhc2VkIG9uIEJvZHlBbmdsZSBmcm9tIHN0YXJ0QW5nbGUgdG8gZW5kQW5nbGUgKGluc2lkZSBhcmVhKVxyXG4gICAgICAgICAgICBjb25zdCBjb21wbGV0aW9uUmF0ZSA9ICggYm9keUFuZ2xlIC0gc3RhcnRBbmdsZSApIC8gKCBlbmRBbmdsZSAtIHN0YXJ0QW5nbGUgKTtcclxuICAgICAgICAgICAgaWYgKCB0aGlzLnJldHJvZ3JhZGUgKSB7XHJcbiAgICAgICAgICAgICAgc3RhcnRBbmdsZSA9IGJvZHlBbmdsZTtcclxuICAgICAgICAgICAgICBvcmJpdGFsQXJlYS5jb21wbGV0aW9uID0gKCAxIC0gY29tcGxldGlvblJhdGUgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICBlbmRBbmdsZSA9IGJvZHlBbmdsZTtcclxuICAgICAgICAgICAgICBvcmJpdGFsQXJlYS5jb21wbGV0aW9uID0gY29tcGxldGlvblJhdGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3JiaXRhbEFyZWEuc3dlcHRBcmVhID0gdGhpcy5jYWxjdWxhdGVTd2VwdEFyZWEoIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBPVVRTSURFIFRIRSBBUkVBXHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgb3JiaXRhbEFyZWEuaW5zaWRlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgLy8gTWFwIGNvbXBsZXRpb24gZnJvbSAxIHRvIDAgYmFzZWQgb24gQm9keUFuZ2xlIGZyb20gc3RhcnRBbmdsZSB0byBlbmRBbmdsZSAob3V0c2lkZSBhcmVhKVxyXG4gICAgICAgICAgICBsZXQgY29tcGxldGlvbkZhbGxvZmYgPSAoIGJvZHlBbmdsZSAtIHN0YXJ0QW5nbGUgLSBUV09QSSApIC8gKCBlbmRBbmdsZSAtIHN0YXJ0QW5nbGUgLSBUV09QSSApO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29ycmVjdCBmb3IgbmVnYXRpdmUgdmFsdWVzXHJcbiAgICAgICAgICAgIGNvbXBsZXRpb25GYWxsb2ZmID0gVXRpbHMubW9kdWxvQmV0d2VlbkRvd24oIGNvbXBsZXRpb25GYWxsb2ZmLCAwLCAxICk7XHJcblxyXG4gICAgICAgICAgICBvcmJpdGFsQXJlYS5jb21wbGV0aW9uID0gdGhpcy5yZXRyb2dyYWRlID8gKCAxIC0gY29tcGxldGlvbkZhbGxvZmYgKSA6IGNvbXBsZXRpb25GYWxsb2ZmO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIG9yYml0YWwgYXJlYSBwcm9wZXJ0aWVzXHJcbiAgICAgICAgaWYgKCAhb3JiaXRhbEFyZWEuYWxyZWFkeUVudGVyZWQgKSB7XHJcbiAgICAgICAgICBvcmJpdGFsQXJlYS5jb21wbGV0aW9uID0gMDsgLy8gU2V0IGl0IHRvIDAgaWYgaXQgaGFzbid0IGVudGVyZWQgeWV0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9yYml0YWxBcmVhLmRvdFBvc2l0aW9uID0gdGhpcy5jcmVhdGVQb2xhciggbnUgKTsgLy8gUG9zaXRpb24gZm9yIHRoZSBkb3RzXHJcbiAgICAgICAgb3JiaXRhbEFyZWEuc3RhcnRQb3NpdGlvbiA9IHRoaXMuY3JlYXRlUG9sYXIoIHN0YXJ0QW5nbGUgKTtcclxuICAgICAgICBvcmJpdGFsQXJlYS5lbmRQb3NpdGlvbiA9IHRoaXMuY3JlYXRlUG9sYXIoIGVuZEFuZ2xlICk7XHJcbiAgICAgICAgb3JiaXRhbEFyZWEuYWN0aXZlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcHJldmlvdXNOdSA9IG51O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIG9yYml0YWxBcmVhLmNvbXBsZXRpb24gPSAwO1xyXG4gICAgICAgIG9yYml0YWxBcmVhLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIG9yYml0YWxBcmVhLmluc2lkZVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY2FsY3VsYXRlU3dlcHRBcmVhKCBzdGFydEFuZ2xlOiBudW1iZXIsIGVuZEFuZ2xlOiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIC8vIENvbnZlcnQgYW5nbGVzIGZyb20gZm9jaSB0byBjZW50ZXIgdG8gZ2V0IHRoZSBjb3JyZWN0IGFyZWFcclxuICAgIHN0YXJ0QW5nbGUgPSB0aGlzLmdldE1lYW5Bbm9tYWx5KCBzdGFydEFuZ2xlLCB0aGlzLmUgKTtcclxuICAgIGVuZEFuZ2xlID0gdGhpcy5nZXRNZWFuQW5vbWFseSggZW5kQW5nbGUsIHRoaXMuZSApO1xyXG4gICAgZW5kQW5nbGUgPSBVdGlscy5tb2R1bG9CZXR3ZWVuRG93biggZW5kQW5nbGUsIHN0YXJ0QW5nbGUsIHN0YXJ0QW5nbGUgKyBUV09QSSApO1xyXG4gICAgcmV0dXJuIE1hdGguYWJzKCAwLjUgKiB0aGlzLmEgKiB0aGlzLmIgKiAoIGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSApICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNhbGN1bGF0ZV9hKCByOiBWZWN0b3IyLCB2OiBWZWN0b3IyICk6IG51bWJlciB7XHJcbiAgICBjb25zdCByTWFnbml0dWRlID0gci5tYWduaXR1ZGU7XHJcbiAgICBjb25zdCB2TWFnbml0dWRlID0gdi5tYWduaXR1ZGU7XHJcblxyXG4gICAgcmV0dXJuIHJNYWduaXR1ZGUgKiB0aGlzLm11IC8gKCAyICogdGhpcy5tdSAtIHJNYWduaXR1ZGUgKiB2TWFnbml0dWRlICogdk1hZ25pdHVkZSApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjYWxjdWxhdGVfZSggcjogVmVjdG9yMiwgdjogVmVjdG9yMiwgYTogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBjb25zdCByTWFnbml0dWRlID0gci5tYWduaXR1ZGU7XHJcbiAgICBjb25zdCB2TWFnbml0dWRlID0gdi5tYWduaXR1ZGU7XHJcbiAgICBjb25zdCByQW5nbGUgPSByLmFuZ2xlO1xyXG4gICAgY29uc3QgdkFuZ2xlID0gdi5hbmdsZTtcclxuXHJcbiAgICByZXR1cm4gTWF0aC5wb3coXHJcbiAgICAgIDEgLSBNYXRoLnBvdyggck1hZ25pdHVkZSAqIHZNYWduaXR1ZGUgKiBNYXRoLnNpbiggdkFuZ2xlIC0gckFuZ2xlICksIDIgKVxyXG4gICAgICAvICggYSAqIHRoaXMubXUgKSwgMC41ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxjdWxhdGVzIHRoZSBkaWZmZXJlbnQgYW5nbGVzIHByZXNlbnQgaW4gdGhlIGVsbGlwc2VcclxuICAgKi9cclxuICBwcml2YXRlIGNhbGN1bGF0ZUFuZ2xlcyggcjogVmVjdG9yMiwgdjogVmVjdG9yMiwgYTogbnVtYmVyLCBlOiBudW1iZXIgKTogbnVtYmVyW10ge1xyXG4gICAgY29uc3Qgck1hZ25pdHVkZSA9IHIubWFnbml0dWRlO1xyXG5cclxuICAgIC8vIFBvc2l0aW9uIGFuZCB2ZWxvY2l0eSBhbmdsZXNcclxuICAgIGNvbnN0IHJBbmdsZSA9IHIuYW5nbGU7XHJcbiAgICBjb25zdCB2QW5nbGUgPSB2LmFuZ2xlO1xyXG5cclxuICAgIC8vIENpcmN1bGFyIG9yYml0IGNhc2VcclxuICAgIGxldCBudSA9IHJBbmdsZTtcclxuXHJcbiAgICAvLyBFbGxpcHRpY2FsIG9yYml0IGNhc2VcclxuICAgIGlmICggZSA+IDAgKSB7XHJcbiAgICAgIC8vIFRydWUgYW5vbWFseSBjb21lcyBmcm9tIHRoZSBwb2xhciBlbGxpcHNlIGVxdWF0aW9uLiBCYXNlZCBvbiByTWFnbml0dWRlLCBhdCB3aGF0IGFuZ2xlIHNob3VsZCBpdCBiZVxyXG4gICAgICBudSA9IE1hdGguYWNvcyggVXRpbHMuY2xhbXAoICggMSAvIGUgKSAqICggYSAqICggMSAtIGUgKiBlICkgLyByTWFnbml0dWRlIC0gMSApLCAtMSwgMSApICk7XHJcblxyXG4gICAgICAvLyBEZXRlcm1pbmUgdGhlIGN1YWRyYW50IG9mIHRoZSB0cnVlIGFub21hbHlcclxuICAgICAgaWYgKCBNYXRoLmNvcyggckFuZ2xlIC0gdkFuZ2xlICkgPiAwICkge1xyXG4gICAgICAgIG51ICo9IC0xO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWVhbiBhbmd1bGFyIHZlbG9jaXR5XHJcbiAgICBsZXQgVyA9IC01MDAgLyB0aGlzLnRoaXJkTGF3KCBhICk7XHJcblxyXG4gICAgdGhpcy5yZXRyb2dyYWRlID0gci5jcm9zc1NjYWxhciggdiApID4gMDtcclxuICAgIGlmICggdGhpcy5yZXRyb2dyYWRlICkge1xyXG4gICAgICBudSAqPSAtMTtcclxuICAgICAgVyAqPSAtMTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgTWVhbiBBbm9tYWx5XHJcbiAgICBjb25zdCBNID0gdGhpcy5nZXRNZWFuQW5vbWFseSggbnUsIGUgKTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgdGhlIGFyZ3VtZW50IG9mIHBlcmlhcHNpc1xyXG4gICAgY29uc3QgdyA9IHJBbmdsZSAtIG51O1xyXG5cclxuICAgIHJldHVybiBbIHcsIE0sIFcsIG51IF07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNhbGN1bGF0ZUVsbGlwc2UoIHI6IFZlY3RvcjIsIHY6IFZlY3RvcjIgKTogRWxsaXBzZSB7XHJcbiAgICBjb25zdCBhID0gdGhpcy5jYWxjdWxhdGVfYSggciwgdiApO1xyXG4gICAgY29uc3QgZSA9IHRoaXMuY2FsY3VsYXRlX2UoIHIsIHYsIGEgKTtcclxuICAgIGNvbnN0IGIgPSBhICogTWF0aC5zcXJ0KCAxIC0gZSAqIGUgKTtcclxuICAgIGNvbnN0IGMgPSBhICogZTtcclxuICAgIGNvbnN0IFsgdywgTSwgVywgbnUgXSA9IHRoaXMuY2FsY3VsYXRlQW5nbGVzKCByLCB2LCBhLCBlICk7XHJcbiAgICByZXR1cm4gbmV3IEVsbGlwc2UoIGEsIGIsIGMsIGUsIHcsIE0sIFcsIG51ICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNhbGN1bGF0ZVIoIGE6IG51bWJlciwgZTogbnVtYmVyLCBudTogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gYSAqICggMSAtIGUgKiBlICkgLyAoIDEgKyBlICogTWF0aC5jb3MoIG51ICkgKTtcclxuICB9XHJcblxyXG4gIC8vIE51bWVyaWNhbCBzb2x1dGlvbiB0byBLZXBsZXIncyBFcXVhdGlvbnMgZm9yIEVjY2VudHJpYyBBbm9tYWx5IChFKSBhbmQgdGhlbiBUcnVlIEFub21hbHkgKG51KVxyXG4gIHByaXZhdGUgZ2V0VHJ1ZUFub21hbHkoIE06IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgY29uc3QgRTEgPSBNICsgdGhpcy5lICogTWF0aC5zaW4oIE0gKTtcclxuICAgIGNvbnN0IEUyID0gTSArIHRoaXMuZSAqIE1hdGguc2luKCBFMSApO1xyXG4gICAgY29uc3QgRSA9IE0gKyB0aGlzLmUgKiBNYXRoLnNpbiggRTIgKTtcclxuICAgIGNvbnN0IG51ID0gTWF0aC5hdGFuMiggTWF0aC5wb3coIDEgLSB0aGlzLmUgKiB0aGlzLmUsIDAuNSApICogTWF0aC5zaW4oIEUgKSwgTWF0aC5jb3MoIEUgKSAtIHRoaXMuZSApO1xyXG4gICAgcmV0dXJuIFV0aWxzLm1vZHVsb0JldHdlZW5Eb3duKCBudSwgMCwgVFdPUEkgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0TWVhbkFub21hbHkoIG51OiBudW1iZXIsIGU6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgLy8gQ2FsY3VsYXRlIEVjY2VudHJpYyBBbm9tYWx5IGFuZCBkZXRlcm1pbmUgaXRzIGN1YWRyYW50XHJcbiAgICBsZXQgRSA9IC1NYXRoLmFjb3MoIFV0aWxzLmNsYW1wKCAoIGUgKyBNYXRoLmNvcyggbnUgKSApIC8gKCAxICsgZSAqIE1hdGguY29zKCBudSApICksIC0xLCAxICkgKTtcclxuICAgIGlmICggTWF0aC5zaW4oIEUgKSAqIE1hdGguc2luKCBudSApIDwgMCApIHtcclxuICAgICAgRSAqPSAtMTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgTWVhbiBBbm9tYWx5XHJcbiAgICBjb25zdCBNID0gRSAtIGUgKiBNYXRoLnNpbiggRSApO1xyXG4gICAgcmV0dXJuIE07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXRPcmJpdGFsQXJlYXMoKTogdm9pZCB7XHJcbiAgICB0aGlzLm9yYml0YWxBcmVhcy5mb3JFYWNoKCBhcmVhID0+IHtcclxuICAgICAgYXJlYS5yZXNldCgpO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5jYWxjdWxhdGVPcmJpdGFsRGl2aXNpb25zKCBmYWxzZSApO1xyXG4gICAgdGhpcy5jaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc2V0T3JiaXRhbEFyZWFzKCk7XHJcbiAgICB0aGlzLmEgPSAxOyAvLyBzZW1pTWFqb3IgYXhpc1xyXG4gICAgdGhpcy5lID0gMDsgLy8gZWNjZW50cmljaXR5XHJcbiAgICB0aGlzLncgPSAwOyAvLyBhcmd1bWVudCBvZiBwZXJpYXBzaXNcclxuICAgIHRoaXMuTSA9IDA7IC8vIG1lYW4gYW5vbWFseVxyXG4gICAgdGhpcy5XID0gMDsgLy8gYW5ndWxhciB2ZWxvY2l0eVxyXG4gICAgdGhpcy5UID0gMTsgLy8gcGVyaW9kXHJcbiAgICB0aGlzLm51ID0gMDsgLy8gdHJ1ZSBhbm9tYWx5XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgdGhpcy5yZXNldEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxufVxyXG5cclxua2VwbGVyc0xhd3MucmVnaXN0ZXIoICdFbGxpcHRpY2FsT3JiaXRFbmdpbmUnLCBFbGxpcHRpY2FsT3JiaXRFbmdpbmUgKTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLElBQUks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