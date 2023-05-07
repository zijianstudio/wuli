// Copyright 2019-2022, University of Colorado Boulder

/**
 * Adapter for the p2.js physics engine
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import PhysicsEngine from './PhysicsEngine.js';

// constants
const FIXED_TIME_STEP = DensityBuoyancyCommonQueryParameters.p2FixedTimeStep;
const MAX_SUB_STEPS = DensityBuoyancyCommonQueryParameters.p2MaxSubSteps;
const SIZE_SCALE = DensityBuoyancyCommonQueryParameters.p2SizeScale;
const MASS_SCALE = DensityBuoyancyCommonQueryParameters.p2MassScale;
const groundMaterial = new p2.Material();
const barrierMaterial = new p2.Material();
const dynamicMaterial = new p2.Material();
export default class P2Engine extends PhysicsEngine {
  // Maps {number} body.id => {p2.RevoluteConstraint}

  // Maps {number} body.id => {p2.Body}. Contains bodies that are empty, and specifically used for
  // pointer constraints (so they can be positioned to where the pointer is).
  constructor() {
    super();
    this.world = new p2.World({});
    this.world.applyGravity = false;
    const solver = this.world.solver;
    solver.iterations = DensityBuoyancyCommonQueryParameters.p2Iterations;
    solver.frictionIterations = DensityBuoyancyCommonQueryParameters.p2FrictionIterations;
    solver.tolerance = DensityBuoyancyCommonQueryParameters.p2Tolerance;
    this.pointerConstraintMap = {};
    this.nullBodyMap = {};

    // restitution - no bounce is 0, default is 0
    // stiffness default 1e6, Number.POSITIVE_INFINITY maybe?
    //  Saw comment "We need infinite stiffness to get exact restitution" online
    // relaxation default is 4

    this.world.addContactMaterial(new p2.ContactMaterial(groundMaterial, dynamicMaterial, {
      restitution: DensityBuoyancyCommonQueryParameters.p2Restitution,
      stiffness: DensityBuoyancyCommonQueryParameters.p2GroundStiffness,
      relaxation: DensityBuoyancyCommonQueryParameters.p2GroundRelaxation
    }));
    this.world.addContactMaterial(new p2.ContactMaterial(dynamicMaterial, dynamicMaterial, {
      restitution: DensityBuoyancyCommonQueryParameters.p2Restitution,
      stiffness: DensityBuoyancyCommonQueryParameters.p2DynamicStiffness,
      relaxation: DensityBuoyancyCommonQueryParameters.p2DynamicRelaxation
    }));
    this.world.addContactMaterial(new p2.ContactMaterial(barrierMaterial, dynamicMaterial, {
      restitution: DensityBuoyancyCommonQueryParameters.p2Restitution,
      stiffness: DensityBuoyancyCommonQueryParameters.p2BarrierStiffness,
      relaxation: DensityBuoyancyCommonQueryParameters.p2BarrierRelaxation
    }));
    this.internalStepEmitter = new TinyEmitter();
    this.world.on('postStep', () => {
      this.internalStepEmitter.emit(this.world.lastTimeStep);
    });

    // Kill vertical-only friction to avoid edge cases, see https://github.com/phetsims/density/issues/65
    // and https://github.com/phetsims/density/issues/66
    this.world.on('preSolve', preSolveEvent => {
      preSolveEvent.frictionEquations.forEach(equation => {
        equation.enabled = equation.t[0] !== 0;
      });
    });
  }

  /**
   * Steps forward in time.
   */
  step(dt) {
    this.world.step(FIXED_TIME_STEP, dt, MAX_SUB_STEPS);
    this.interpolationRatio = this.world.accumulator % FIXED_TIME_STEP / FIXED_TIME_STEP;
  }

  /**
   * Adds a body into the engine, so that it will be tracked during the step.
   */
  addBody(body) {
    this.world.addBody(body);
  }

  /**
   * Removes a body from the engine, so that it will not be tracked during the step anymore.
   */
  removeBody(body) {
    this.world.removeBody(body);
  }

  /**
   * Sets the mass of a body (and whether it can rotate, which for some engines needs to be set at the same time).
   */
  bodySetMass(body, mass, providedOptions) {
    const options = optionize()({
      // {boolean} - optional
      canRotate: false
    }, providedOptions);
    body.mass = mass * MASS_SCALE;
    if (!options.canRotate) {
      body.fixedRotation = true;
    }
    body.updateMassProperties();
  }

  /**
   * Sets the provided matrix to the current transformation matrix of the body (to reduce allocations)
   */
  bodyGetMatrixTransform(body, matrix) {
    return matrix.setToTranslationRotation(body.interpolatedPosition[0] / SIZE_SCALE, body.interpolatedPosition[1] / SIZE_SCALE, body.interpolatedAngle);
  }

  /**
   * Sets the provided matrix to the current transformation matrix of the body (to reduce allocations)
   */
  bodyGetStepMatrixTransform(body, matrix) {
    return matrix.setToTranslationRotation(body.position[0] / SIZE_SCALE, body.position[1] / SIZE_SCALE, body.angle);
  }

  /**
   * Sets the position of a body.
   */
  bodySetPosition(body, position) {
    body.position[0] = position.x * SIZE_SCALE;
    body.position[1] = position.y * SIZE_SCALE;
  }

  /**
   * Sets the rotation of a body.
   */
  bodySetRotation(body, rotation) {
    body.angle = rotation;
  }

  /**
   * Returns the velocity of a body.
   */
  bodyGetVelocity(body) {
    return P2Engine.p2ToVector(body.velocity);
  }

  /**
   * Sets the velocity of a body.
   */
  bodySetVelocity(body, velocity) {
    body.velocity[0] = velocity.x * SIZE_SCALE;
    body.velocity[1] = velocity.y * SIZE_SCALE;
  }

  /**
   * Applies a given force to a body (should be in the post-step listener ideally)
   */
  bodyApplyForce(body, force) {
    body.force[0] += force.x * SIZE_SCALE * MASS_SCALE;
    body.force[1] += force.y * SIZE_SCALE * MASS_SCALE;
  }

  /**
   * Returns the applied contact force computed in the last step.
   */
  bodyGetContactForces(body) {
    return P2Engine.p2ToVector(body.vlambda).timesScalar(body.mass / FIXED_TIME_STEP / MASS_SCALE);
  }

  /**
   * Returns the applied contact force computed in the last step (as a force on A from B).
   */
  bodyGetContactForceBetween(bodyA, bodyB) {
    const result = Vector2.ZERO.copy();
    const equations = this.world.narrowphase.contactEquations;
    for (let i = 0; i < equations.length; i++) {
      const equation = equations[i];
      let sign = 0;
      if (bodyA === equation.bodyA && bodyB === equation.bodyB) {
        sign = 1;
      }
      if (bodyA === equation.bodyB && bodyB === equation.bodyA) {
        sign = -1;
      }
      if (sign) {
        result.add(P2Engine.p2ToVector(equation.normalA).timesScalar(sign * equation.multiplier / MASS_SCALE));
      }
    }
    return result;
  }

  /**
   * Resets the contact forces that have happened on a body to 0 after measurement.
   */
  resetContactForces(body) {
    body.vlambda[0] = 0;
    body.vlambda[1] = 0;
  }

  /**
   * Returns a serialized form of a body
   */
  bodyToStateObject(body) {
    return {
      position: P2Engine.p2ToVector(body.position).toStateObject(),
      velocity: P2Engine.p2ToVector(body.velocity).toStateObject(),
      force: P2Engine.p2ToVector(body.force).toStateObject() // we applied forces after the step
    };
  }

  /**
   * Applies a given state object to a body.
   */
  bodyApplyState(body, obj) {
    // We will ignore infinities
    body.position[0] = obj.position.x * SIZE_SCALE;
    body.position[1] = obj.position.y * SIZE_SCALE;
    body.previousPosition[0] = obj.position.x * SIZE_SCALE;
    body.previousPosition[1] = obj.position.y * SIZE_SCALE;
    body.velocity[0] = obj.velocity.x * SIZE_SCALE;
    body.velocity[1] = obj.velocity.y * SIZE_SCALE;
    body.force[0] = obj.force.x * SIZE_SCALE;
    body.force[1] = obj.force.y * SIZE_SCALE;
  }

  /**
   * Returns a serialized form of a body
   */
  bodyResetHidden(body) {
    // Bodies don't start with velocity/force applied
    body.velocity[0] = 0;
    body.velocity[1] = 0;
    body.force[0] = 0;
    body.force[1] = 0;
  }

  /**
   * Sets the previous position of a body to the current position
   */
  bodySynchronizePrevious(body) {
    body.previousPosition[0] = body.position[0];
    body.previousPosition[1] = body.position[1];
  }

  /**
   * Creates a (static) ground body with the given vertices.
   */
  createGround(vertices) {
    const body = new p2.Body({
      type: p2.Body.STATIC,
      mass: 0
    });
    body.fromPolygon(vertices.map(P2Engine.vectorToP2));

    // Workaround, since using Convex wasn't working
    body.shapes.forEach(shape => {
      shape.material = groundMaterial;
    });
    return body;
  }

  /**
   * Creates a (static) barrier body with the given vertices.
   */
  createBarrier(vertices) {
    const body = new p2.Body({
      type: p2.Body.STATIC,
      mass: 0
    });
    body.fromPolygon(vertices.map(P2Engine.vectorToP2));

    // Workaround, since using Convex wasn't working
    body.shapes.forEach(shape => {
      shape.material = barrierMaterial;
    });
    return body;
  }

  /**
   * Creates a (dynamic) box body, with the origin at the center of the box.
   */
  createBox(width, height, isStatic) {
    const body = new p2.Body({
      type: isStatic ? p2.Body.STATIC : p2.Body.DYNAMIC,
      fixedRotation: true
    });
    this.updateBox(body, width, height);
    return body;
  }

  /**
   * Updates the width/height of a box body.
   */
  updateBox(body, width, height) {
    P2Engine.removeShapes(body);
    const box = new p2.Box({
      width: width * SIZE_SCALE,
      height: height * SIZE_SCALE,
      // @ts-expect-error -- material SHOULD be in ShapeOptions
      material: dynamicMaterial
    });
    body.addShape(box);
  }

  /**
   * Creates a (dynamic) body, with the origin at the centroid.
   */
  createFromVertices(vertices, workaround) {
    const body = new p2.Body({
      type: p2.Body.DYNAMIC,
      fixedRotation: true
    });
    this.updateFromVertices(body, vertices, workaround);
    return body;
  }

  /**
   * Updates the vertices of a dynamic vertex-based body.
   */
  updateFromVertices(body, vertices, workaround) {
    P2Engine.removeShapes(body);
    if (workaround) {
      body.fromPolygon(vertices.map(v => p2.vec2.fromValues(v.x * SIZE_SCALE, v.y * SIZE_SCALE)));

      // Workaround, since using Convex wasn't working
      body.shapes.forEach(shape => {
        shape.material = groundMaterial;
      });
    } else {
      const shape = new p2.Convex({
        vertices: vertices.map(P2Engine.vectorToP2)
      });
      shape.material = dynamicMaterial;
      body.addShape(shape);
    }
  }

  /**
   * Adds a listener to be called after each internal step.
   */
  addPostStepListener(listener) {
    this.internalStepEmitter.addListener(listener);
  }

  /**
   * Removes a listener to be called after each internal step.
   */
  removePostStepListener(listener) {
    this.internalStepEmitter.removeListener(listener);
  }

  /**
   * Adds in a pointer constraint so that the body's current point at the position will stay at the position
   * (if the body is getting dragged).
   */
  addPointerConstraint(body, position) {
    // Create an empty body used for the constraint (we don't want it intersecting). It will just be used for applying
    // the effects of this constraint.
    const nullBody = new p2.Body();
    this.nullBodyMap[body.id] = nullBody;
    const globalPoint = P2Engine.vectorToP2(position);
    const localPoint = p2.vec2.create();
    body.toLocalFrame(localPoint, globalPoint);
    this.world.addBody(nullBody);
    body.wakeUp();
    const pointerConstraint = new p2.RevoluteConstraint(nullBody, body, {
      localPivotA: globalPoint,
      localPivotB: localPoint,
      maxForce: DensityBuoyancyCommonQueryParameters.p2PointerMassForce * body.mass + DensityBuoyancyCommonQueryParameters.p2PointerBaseForce
    });
    this.pointerConstraintMap[body.id] = pointerConstraint;
    this.world.addConstraint(pointerConstraint);
  }

  /**
   * Updates a pointer constraint so that the body will essentially be dragged to the new position.
   */
  updatePointerConstraint(body, position) {
    const pointerConstraint = this.pointerConstraintMap[body.id];
    assert && assert(pointerConstraint);

    // @ts-expect-error it should have pivotA...
    p2.vec2.copy(pointerConstraint.pivotA, P2Engine.vectorToP2(position));
    pointerConstraint.bodyA.wakeUp();
    pointerConstraint.bodyB.wakeUp();
  }

  /**
   * Removes a pointer constraint.
   */
  removePointerConstraint(body) {
    const nullBody = this.nullBodyMap[body.id];
    const pointerConstraint = this.pointerConstraintMap[body.id];
    this.world.removeConstraint(pointerConstraint);
    this.world.removeBody(nullBody);
    delete this.nullBodyMap[body.id];
    delete this.pointerConstraintMap[body.id];
  }

  /**
   * Converts a Vector2 to a p2.vec2, for use with p2.js
   */
  static vectorToP2(vector) {
    return p2.vec2.fromValues(vector.x * SIZE_SCALE, vector.y * SIZE_SCALE);
  }

  /**
   * Converts a p2.vec2 to a Vector2
   */
  static p2ToVector(vector) {
    return new Vector2(vector[0] / SIZE_SCALE, vector[1] / SIZE_SCALE);
  }

  /**
   * Helper method that removes all shapes from a given body.
   */
  static removeShapes(body) {
    while (body.shapes.length) {
      body.removeShape(body.shapes[body.shapes.length - 1]);
    }
  }
}
densityBuoyancyCommon.register('P2Engine', P2Engine);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIlZlY3RvcjIiLCJvcHRpb25pemUiLCJkZW5zaXR5QnVveWFuY3lDb21tb24iLCJEZW5zaXR5QnVveWFuY3lDb21tb25RdWVyeVBhcmFtZXRlcnMiLCJQaHlzaWNzRW5naW5lIiwiRklYRURfVElNRV9TVEVQIiwicDJGaXhlZFRpbWVTdGVwIiwiTUFYX1NVQl9TVEVQUyIsInAyTWF4U3ViU3RlcHMiLCJTSVpFX1NDQUxFIiwicDJTaXplU2NhbGUiLCJNQVNTX1NDQUxFIiwicDJNYXNzU2NhbGUiLCJncm91bmRNYXRlcmlhbCIsInAyIiwiTWF0ZXJpYWwiLCJiYXJyaWVyTWF0ZXJpYWwiLCJkeW5hbWljTWF0ZXJpYWwiLCJQMkVuZ2luZSIsImNvbnN0cnVjdG9yIiwid29ybGQiLCJXb3JsZCIsImFwcGx5R3Jhdml0eSIsInNvbHZlciIsIml0ZXJhdGlvbnMiLCJwMkl0ZXJhdGlvbnMiLCJmcmljdGlvbkl0ZXJhdGlvbnMiLCJwMkZyaWN0aW9uSXRlcmF0aW9ucyIsInRvbGVyYW5jZSIsInAyVG9sZXJhbmNlIiwicG9pbnRlckNvbnN0cmFpbnRNYXAiLCJudWxsQm9keU1hcCIsImFkZENvbnRhY3RNYXRlcmlhbCIsIkNvbnRhY3RNYXRlcmlhbCIsInJlc3RpdHV0aW9uIiwicDJSZXN0aXR1dGlvbiIsInN0aWZmbmVzcyIsInAyR3JvdW5kU3RpZmZuZXNzIiwicmVsYXhhdGlvbiIsInAyR3JvdW5kUmVsYXhhdGlvbiIsInAyRHluYW1pY1N0aWZmbmVzcyIsInAyRHluYW1pY1JlbGF4YXRpb24iLCJwMkJhcnJpZXJTdGlmZm5lc3MiLCJwMkJhcnJpZXJSZWxheGF0aW9uIiwiaW50ZXJuYWxTdGVwRW1pdHRlciIsIm9uIiwiZW1pdCIsImxhc3RUaW1lU3RlcCIsInByZVNvbHZlRXZlbnQiLCJmcmljdGlvbkVxdWF0aW9ucyIsImZvckVhY2giLCJlcXVhdGlvbiIsImVuYWJsZWQiLCJ0Iiwic3RlcCIsImR0IiwiaW50ZXJwb2xhdGlvblJhdGlvIiwiYWNjdW11bGF0b3IiLCJhZGRCb2R5IiwiYm9keSIsInJlbW92ZUJvZHkiLCJib2R5U2V0TWFzcyIsIm1hc3MiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiY2FuUm90YXRlIiwiZml4ZWRSb3RhdGlvbiIsInVwZGF0ZU1hc3NQcm9wZXJ0aWVzIiwiYm9keUdldE1hdHJpeFRyYW5zZm9ybSIsIm1hdHJpeCIsInNldFRvVHJhbnNsYXRpb25Sb3RhdGlvbiIsImludGVycG9sYXRlZFBvc2l0aW9uIiwiaW50ZXJwb2xhdGVkQW5nbGUiLCJib2R5R2V0U3RlcE1hdHJpeFRyYW5zZm9ybSIsInBvc2l0aW9uIiwiYW5nbGUiLCJib2R5U2V0UG9zaXRpb24iLCJ4IiwieSIsImJvZHlTZXRSb3RhdGlvbiIsInJvdGF0aW9uIiwiYm9keUdldFZlbG9jaXR5IiwicDJUb1ZlY3RvciIsInZlbG9jaXR5IiwiYm9keVNldFZlbG9jaXR5IiwiYm9keUFwcGx5Rm9yY2UiLCJmb3JjZSIsImJvZHlHZXRDb250YWN0Rm9yY2VzIiwidmxhbWJkYSIsInRpbWVzU2NhbGFyIiwiYm9keUdldENvbnRhY3RGb3JjZUJldHdlZW4iLCJib2R5QSIsImJvZHlCIiwicmVzdWx0IiwiWkVSTyIsImNvcHkiLCJlcXVhdGlvbnMiLCJuYXJyb3dwaGFzZSIsImNvbnRhY3RFcXVhdGlvbnMiLCJpIiwibGVuZ3RoIiwic2lnbiIsImFkZCIsIm5vcm1hbEEiLCJtdWx0aXBsaWVyIiwicmVzZXRDb250YWN0Rm9yY2VzIiwiYm9keVRvU3RhdGVPYmplY3QiLCJ0b1N0YXRlT2JqZWN0IiwiYm9keUFwcGx5U3RhdGUiLCJvYmoiLCJwcmV2aW91c1Bvc2l0aW9uIiwiYm9keVJlc2V0SGlkZGVuIiwiYm9keVN5bmNocm9uaXplUHJldmlvdXMiLCJjcmVhdGVHcm91bmQiLCJ2ZXJ0aWNlcyIsIkJvZHkiLCJ0eXBlIiwiU1RBVElDIiwiZnJvbVBvbHlnb24iLCJtYXAiLCJ2ZWN0b3JUb1AyIiwic2hhcGVzIiwic2hhcGUiLCJtYXRlcmlhbCIsImNyZWF0ZUJhcnJpZXIiLCJjcmVhdGVCb3giLCJ3aWR0aCIsImhlaWdodCIsImlzU3RhdGljIiwiRFlOQU1JQyIsInVwZGF0ZUJveCIsInJlbW92ZVNoYXBlcyIsImJveCIsIkJveCIsImFkZFNoYXBlIiwiY3JlYXRlRnJvbVZlcnRpY2VzIiwid29ya2Fyb3VuZCIsInVwZGF0ZUZyb21WZXJ0aWNlcyIsInYiLCJ2ZWMyIiwiZnJvbVZhbHVlcyIsIkNvbnZleCIsImFkZFBvc3RTdGVwTGlzdGVuZXIiLCJsaXN0ZW5lciIsImFkZExpc3RlbmVyIiwicmVtb3ZlUG9zdFN0ZXBMaXN0ZW5lciIsInJlbW92ZUxpc3RlbmVyIiwiYWRkUG9pbnRlckNvbnN0cmFpbnQiLCJudWxsQm9keSIsImlkIiwiZ2xvYmFsUG9pbnQiLCJsb2NhbFBvaW50IiwiY3JlYXRlIiwidG9Mb2NhbEZyYW1lIiwid2FrZVVwIiwicG9pbnRlckNvbnN0cmFpbnQiLCJSZXZvbHV0ZUNvbnN0cmFpbnQiLCJsb2NhbFBpdm90QSIsImxvY2FsUGl2b3RCIiwibWF4Rm9yY2UiLCJwMlBvaW50ZXJNYXNzRm9yY2UiLCJwMlBvaW50ZXJCYXNlRm9yY2UiLCJhZGRDb25zdHJhaW50IiwidXBkYXRlUG9pbnRlckNvbnN0cmFpbnQiLCJhc3NlcnQiLCJwaXZvdEEiLCJyZW1vdmVQb2ludGVyQ29uc3RyYWludCIsInJlbW92ZUNvbnN0cmFpbnQiLCJ2ZWN0b3IiLCJyZW1vdmVTaGFwZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUDJFbmdpbmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQWRhcHRlciBmb3IgdGhlIHAyLmpzIHBoeXNpY3MgZW5naW5lXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XHJcbmltcG9ydCBUaW55RW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RpbnlFbWl0dGVyLmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiwgeyBWZWN0b3IyU3RhdGVPYmplY3QgfSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBkZW5zaXR5QnVveWFuY3lDb21tb24gZnJvbSAnLi4vLi4vZGVuc2l0eUJ1b3lhbmN5Q29tbW9uLmpzJztcclxuaW1wb3J0IERlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9EZW5zaXR5QnVveWFuY3lDb21tb25RdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgUGh5c2ljc0VuZ2luZSwgeyBQaHlzaWNzRW5naW5lQm9keSB9IGZyb20gJy4vUGh5c2ljc0VuZ2luZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRklYRURfVElNRV9TVEVQID0gRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnAyRml4ZWRUaW1lU3RlcDtcclxuY29uc3QgTUFYX1NVQl9TVEVQUyA9IERlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycy5wMk1heFN1YlN0ZXBzO1xyXG5jb25zdCBTSVpFX1NDQUxFID0gRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnAyU2l6ZVNjYWxlO1xyXG5jb25zdCBNQVNTX1NDQUxFID0gRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnAyTWFzc1NjYWxlO1xyXG5cclxuY29uc3QgZ3JvdW5kTWF0ZXJpYWwgPSBuZXcgcDIuTWF0ZXJpYWwoKTtcclxuY29uc3QgYmFycmllck1hdGVyaWFsID0gbmV3IHAyLk1hdGVyaWFsKCk7XHJcbmNvbnN0IGR5bmFtaWNNYXRlcmlhbCA9IG5ldyBwMi5NYXRlcmlhbCgpO1xyXG5cclxudHlwZSBCb2R5U2V0TWFzc09wdGlvbnMgPSB7IGNhblJvdGF0ZT86IGJvb2xlYW4gfTtcclxuXHJcbmV4cG9ydCB0eXBlIEJvZHlTdGF0ZU9iamVjdCA9IHtcclxuICBwb3NpdGlvbjogVmVjdG9yMlN0YXRlT2JqZWN0O1xyXG4gIHZlbG9jaXR5OiBWZWN0b3IyU3RhdGVPYmplY3Q7XHJcbiAgZm9yY2U6IFZlY3RvcjJTdGF0ZU9iamVjdDtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFAyRW5naW5lIGV4dGVuZHMgUGh5c2ljc0VuZ2luZSB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgd29ybGQ6IHAyLldvcmxkO1xyXG5cclxuICAvLyBNYXBzIHtudW1iZXJ9IGJvZHkuaWQgPT4ge3AyLlJldm9sdXRlQ29uc3RyYWludH1cclxuICBwcml2YXRlIHJlYWRvbmx5IHBvaW50ZXJDb25zdHJhaW50TWFwOiBSZWNvcmQ8bnVtYmVyLCBwMi5SZXZvbHV0ZUNvbnN0cmFpbnQ+O1xyXG5cclxuICAvLyBNYXBzIHtudW1iZXJ9IGJvZHkuaWQgPT4ge3AyLkJvZHl9LiBDb250YWlucyBib2RpZXMgdGhhdCBhcmUgZW1wdHksIGFuZCBzcGVjaWZpY2FsbHkgdXNlZCBmb3JcclxuICAvLyBwb2ludGVyIGNvbnN0cmFpbnRzIChzbyB0aGV5IGNhbiBiZSBwb3NpdGlvbmVkIHRvIHdoZXJlIHRoZSBwb2ludGVyIGlzKS5cclxuICBwcml2YXRlIHJlYWRvbmx5IG51bGxCb2R5TWFwOiBSZWNvcmQ8bnVtYmVyLCBwMi5Cb2R5PjtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBpbnRlcm5hbFN0ZXBFbWl0dGVyOiBURW1pdHRlcjxbIG51bWJlciBdPjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLndvcmxkID0gbmV3IHAyLldvcmxkKCB7fSApO1xyXG5cclxuICAgIHRoaXMud29ybGQuYXBwbHlHcmF2aXR5ID0gZmFsc2U7XHJcblxyXG4gICAgY29uc3Qgc29sdmVyID0gdGhpcy53b3JsZC5zb2x2ZXIgYXMgcDIuR1NTb2x2ZXI7XHJcbiAgICBzb2x2ZXIuaXRlcmF0aW9ucyA9IERlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycy5wMkl0ZXJhdGlvbnM7XHJcbiAgICBzb2x2ZXIuZnJpY3Rpb25JdGVyYXRpb25zID0gRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnAyRnJpY3Rpb25JdGVyYXRpb25zO1xyXG4gICAgc29sdmVyLnRvbGVyYW5jZSA9IERlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycy5wMlRvbGVyYW5jZTtcclxuXHJcbiAgICB0aGlzLnBvaW50ZXJDb25zdHJhaW50TWFwID0ge307XHJcbiAgICB0aGlzLm51bGxCb2R5TWFwID0ge307XHJcblxyXG4gICAgLy8gcmVzdGl0dXRpb24gLSBubyBib3VuY2UgaXMgMCwgZGVmYXVsdCBpcyAwXHJcbiAgICAvLyBzdGlmZm5lc3MgZGVmYXVsdCAxZTYsIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSBtYXliZT9cclxuICAgIC8vICBTYXcgY29tbWVudCBcIldlIG5lZWQgaW5maW5pdGUgc3RpZmZuZXNzIHRvIGdldCBleGFjdCByZXN0aXR1dGlvblwiIG9ubGluZVxyXG4gICAgLy8gcmVsYXhhdGlvbiBkZWZhdWx0IGlzIDRcclxuXHJcbiAgICB0aGlzLndvcmxkLmFkZENvbnRhY3RNYXRlcmlhbCggbmV3IHAyLkNvbnRhY3RNYXRlcmlhbCggZ3JvdW5kTWF0ZXJpYWwsIGR5bmFtaWNNYXRlcmlhbCwge1xyXG4gICAgICByZXN0aXR1dGlvbjogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnAyUmVzdGl0dXRpb24sXHJcbiAgICAgIHN0aWZmbmVzczogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnAyR3JvdW5kU3RpZmZuZXNzLFxyXG4gICAgICByZWxheGF0aW9uOiBEZW5zaXR5QnVveWFuY3lDb21tb25RdWVyeVBhcmFtZXRlcnMucDJHcm91bmRSZWxheGF0aW9uXHJcbiAgICB9ICkgKTtcclxuICAgIHRoaXMud29ybGQuYWRkQ29udGFjdE1hdGVyaWFsKCBuZXcgcDIuQ29udGFjdE1hdGVyaWFsKCBkeW5hbWljTWF0ZXJpYWwsIGR5bmFtaWNNYXRlcmlhbCwge1xyXG4gICAgICByZXN0aXR1dGlvbjogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnAyUmVzdGl0dXRpb24sXHJcbiAgICAgIHN0aWZmbmVzczogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnAyRHluYW1pY1N0aWZmbmVzcyxcclxuICAgICAgcmVsYXhhdGlvbjogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnAyRHluYW1pY1JlbGF4YXRpb25cclxuICAgIH0gKSApO1xyXG4gICAgdGhpcy53b3JsZC5hZGRDb250YWN0TWF0ZXJpYWwoIG5ldyBwMi5Db250YWN0TWF0ZXJpYWwoIGJhcnJpZXJNYXRlcmlhbCwgZHluYW1pY01hdGVyaWFsLCB7XHJcbiAgICAgIHJlc3RpdHV0aW9uOiBEZW5zaXR5QnVveWFuY3lDb21tb25RdWVyeVBhcmFtZXRlcnMucDJSZXN0aXR1dGlvbixcclxuICAgICAgc3RpZmZuZXNzOiBEZW5zaXR5QnVveWFuY3lDb21tb25RdWVyeVBhcmFtZXRlcnMucDJCYXJyaWVyU3RpZmZuZXNzLFxyXG4gICAgICByZWxheGF0aW9uOiBEZW5zaXR5QnVveWFuY3lDb21tb25RdWVyeVBhcmFtZXRlcnMucDJCYXJyaWVyUmVsYXhhdGlvblxyXG4gICAgfSApICk7XHJcblxyXG4gICAgdGhpcy5pbnRlcm5hbFN0ZXBFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XHJcblxyXG4gICAgdGhpcy53b3JsZC5vbiggJ3Bvc3RTdGVwJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLmludGVybmFsU3RlcEVtaXR0ZXIuZW1pdCggdGhpcy53b3JsZC5sYXN0VGltZVN0ZXAgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBLaWxsIHZlcnRpY2FsLW9ubHkgZnJpY3Rpb24gdG8gYXZvaWQgZWRnZSBjYXNlcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kZW5zaXR5L2lzc3Vlcy82NVxyXG4gICAgLy8gYW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kZW5zaXR5L2lzc3Vlcy82NlxyXG4gICAgdGhpcy53b3JsZC5vbiggJ3ByZVNvbHZlJywgKCBwcmVTb2x2ZUV2ZW50OiBwMi5QcmVTb2x2ZUV2ZW50ICkgPT4ge1xyXG4gICAgICBwcmVTb2x2ZUV2ZW50LmZyaWN0aW9uRXF1YXRpb25zLmZvckVhY2goIGVxdWF0aW9uID0+IHtcclxuICAgICAgICBlcXVhdGlvbi5lbmFibGVkID0gZXF1YXRpb24udFsgMCBdICE9PSAwO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwcyBmb3J3YXJkIGluIHRpbWUuXHJcbiAgICovXHJcbiAgcHVibGljIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICB0aGlzLndvcmxkLnN0ZXAoIEZJWEVEX1RJTUVfU1RFUCwgZHQsIE1BWF9TVUJfU1RFUFMgKTtcclxuICAgIHRoaXMuaW50ZXJwb2xhdGlvblJhdGlvID0gKCB0aGlzLndvcmxkLmFjY3VtdWxhdG9yICUgRklYRURfVElNRV9TVEVQICkgLyBGSVhFRF9USU1FX1NURVA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgYm9keSBpbnRvIHRoZSBlbmdpbmUsIHNvIHRoYXQgaXQgd2lsbCBiZSB0cmFja2VkIGR1cmluZyB0aGUgc3RlcC5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkQm9keSggYm9keTogUGh5c2ljc0VuZ2luZUJvZHkgKTogdm9pZCB7XHJcbiAgICB0aGlzLndvcmxkLmFkZEJvZHkoIGJvZHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBib2R5IGZyb20gdGhlIGVuZ2luZSwgc28gdGhhdCBpdCB3aWxsIG5vdCBiZSB0cmFja2VkIGR1cmluZyB0aGUgc3RlcCBhbnltb3JlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVCb2R5KCBib2R5OiBQaHlzaWNzRW5naW5lQm9keSApOiB2b2lkIHtcclxuICAgIHRoaXMud29ybGQucmVtb3ZlQm9keSggYm9keSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgbWFzcyBvZiBhIGJvZHkgKGFuZCB3aGV0aGVyIGl0IGNhbiByb3RhdGUsIHdoaWNoIGZvciBzb21lIGVuZ2luZXMgbmVlZHMgdG8gYmUgc2V0IGF0IHRoZSBzYW1lIHRpbWUpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBib2R5U2V0TWFzcyggYm9keTogUGh5c2ljc0VuZ2luZUJvZHksIG1hc3M6IG51bWJlciwgcHJvdmlkZWRPcHRpb25zPzogQm9keVNldE1hc3NPcHRpb25zICk6IHZvaWQge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxCb2R5U2V0TWFzc09wdGlvbnM+KCkoIHtcclxuICAgICAgLy8ge2Jvb2xlYW59IC0gb3B0aW9uYWxcclxuICAgICAgY2FuUm90YXRlOiBmYWxzZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgYm9keS5tYXNzID0gbWFzcyAqIE1BU1NfU0NBTEU7XHJcblxyXG4gICAgaWYgKCAhb3B0aW9ucy5jYW5Sb3RhdGUgKSB7XHJcbiAgICAgIGJvZHkuZml4ZWRSb3RhdGlvbiA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgYm9keS51cGRhdGVNYXNzUHJvcGVydGllcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgcHJvdmlkZWQgbWF0cml4IHRvIHRoZSBjdXJyZW50IHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBvZiB0aGUgYm9keSAodG8gcmVkdWNlIGFsbG9jYXRpb25zKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBib2R5R2V0TWF0cml4VHJhbnNmb3JtKCBib2R5OiBQaHlzaWNzRW5naW5lQm9keSwgbWF0cml4OiBNYXRyaXgzICk6IE1hdHJpeDMge1xyXG4gICAgcmV0dXJuIG1hdHJpeC5zZXRUb1RyYW5zbGF0aW9uUm90YXRpb24oIGJvZHkuaW50ZXJwb2xhdGVkUG9zaXRpb25bIDAgXSAvIFNJWkVfU0NBTEUsIGJvZHkuaW50ZXJwb2xhdGVkUG9zaXRpb25bIDEgXSAvIFNJWkVfU0NBTEUsIGJvZHkuaW50ZXJwb2xhdGVkQW5nbGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHByb3ZpZGVkIG1hdHJpeCB0byB0aGUgY3VycmVudCB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggb2YgdGhlIGJvZHkgKHRvIHJlZHVjZSBhbGxvY2F0aW9ucylcclxuICAgKi9cclxuICBwdWJsaWMgYm9keUdldFN0ZXBNYXRyaXhUcmFuc2Zvcm0oIGJvZHk6IFBoeXNpY3NFbmdpbmVCb2R5LCBtYXRyaXg6IE1hdHJpeDMgKTogTWF0cml4MyB7XHJcbiAgICByZXR1cm4gbWF0cml4LnNldFRvVHJhbnNsYXRpb25Sb3RhdGlvbiggYm9keS5wb3NpdGlvblsgMCBdIC8gU0laRV9TQ0FMRSwgYm9keS5wb3NpdGlvblsgMSBdIC8gU0laRV9TQ0FMRSwgYm9keS5hbmdsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgcG9zaXRpb24gb2YgYSBib2R5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBib2R5U2V0UG9zaXRpb24oIGJvZHk6IFBoeXNpY3NFbmdpbmVCb2R5LCBwb3NpdGlvbjogVmVjdG9yMiApOiB2b2lkIHtcclxuICAgIGJvZHkucG9zaXRpb25bIDAgXSA9IHBvc2l0aW9uLnggKiBTSVpFX1NDQUxFO1xyXG4gICAgYm9keS5wb3NpdGlvblsgMSBdID0gcG9zaXRpb24ueSAqIFNJWkVfU0NBTEU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSByb3RhdGlvbiBvZiBhIGJvZHkuXHJcbiAgICovXHJcbiAgcHVibGljIGJvZHlTZXRSb3RhdGlvbiggYm9keTogUGh5c2ljc0VuZ2luZUJvZHksIHJvdGF0aW9uOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBib2R5LmFuZ2xlID0gcm90YXRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB2ZWxvY2l0eSBvZiBhIGJvZHkuXHJcbiAgICovXHJcbiAgcHVibGljIGJvZHlHZXRWZWxvY2l0eSggYm9keTogUGh5c2ljc0VuZ2luZUJvZHkgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gUDJFbmdpbmUucDJUb1ZlY3RvciggYm9keS52ZWxvY2l0eSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdmVsb2NpdHkgb2YgYSBib2R5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBib2R5U2V0VmVsb2NpdHkoIGJvZHk6IFBoeXNpY3NFbmdpbmVCb2R5LCB2ZWxvY2l0eTogVmVjdG9yMiApOiB2b2lkIHtcclxuICAgIGJvZHkudmVsb2NpdHlbIDAgXSA9IHZlbG9jaXR5LnggKiBTSVpFX1NDQUxFO1xyXG4gICAgYm9keS52ZWxvY2l0eVsgMSBdID0gdmVsb2NpdHkueSAqIFNJWkVfU0NBTEU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBsaWVzIGEgZ2l2ZW4gZm9yY2UgdG8gYSBib2R5IChzaG91bGQgYmUgaW4gdGhlIHBvc3Qtc3RlcCBsaXN0ZW5lciBpZGVhbGx5KVxyXG4gICAqL1xyXG4gIHB1YmxpYyBib2R5QXBwbHlGb3JjZSggYm9keTogUGh5c2ljc0VuZ2luZUJvZHksIGZvcmNlOiBWZWN0b3IyICk6IHZvaWQge1xyXG4gICAgYm9keS5mb3JjZVsgMCBdICs9IGZvcmNlLnggKiBTSVpFX1NDQUxFICogTUFTU19TQ0FMRTtcclxuICAgIGJvZHkuZm9yY2VbIDEgXSArPSBmb3JjZS55ICogU0laRV9TQ0FMRSAqIE1BU1NfU0NBTEU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBhcHBsaWVkIGNvbnRhY3QgZm9yY2UgY29tcHV0ZWQgaW4gdGhlIGxhc3Qgc3RlcC5cclxuICAgKi9cclxuICBwdWJsaWMgYm9keUdldENvbnRhY3RGb3JjZXMoIGJvZHk6IFBoeXNpY3NFbmdpbmVCb2R5ICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIFAyRW5naW5lLnAyVG9WZWN0b3IoIGJvZHkudmxhbWJkYSApLnRpbWVzU2NhbGFyKCBib2R5Lm1hc3MgLyBGSVhFRF9USU1FX1NURVAgLyBNQVNTX1NDQUxFICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBhcHBsaWVkIGNvbnRhY3QgZm9yY2UgY29tcHV0ZWQgaW4gdGhlIGxhc3Qgc3RlcCAoYXMgYSBmb3JjZSBvbiBBIGZyb20gQikuXHJcbiAgICovXHJcbiAgcHVibGljIGJvZHlHZXRDb250YWN0Rm9yY2VCZXR3ZWVuKCBib2R5QTogUGh5c2ljc0VuZ2luZUJvZHksIGJvZHlCOiBQaHlzaWNzRW5naW5lQm9keSApOiBWZWN0b3IyIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IFZlY3RvcjIuWkVSTy5jb3B5KCk7XHJcbiAgICBjb25zdCBlcXVhdGlvbnMgPSB0aGlzLndvcmxkLm5hcnJvd3BoYXNlLmNvbnRhY3RFcXVhdGlvbnM7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZXF1YXRpb25zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBlcXVhdGlvbiA9IGVxdWF0aW9uc1sgaSBdO1xyXG5cclxuICAgICAgbGV0IHNpZ24gPSAwO1xyXG4gICAgICBpZiAoIGJvZHlBID09PSBlcXVhdGlvbi5ib2R5QSAmJiBib2R5QiA9PT0gZXF1YXRpb24uYm9keUIgKSB7XHJcbiAgICAgICAgc2lnbiA9IDE7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBib2R5QSA9PT0gZXF1YXRpb24uYm9keUIgJiYgYm9keUIgPT09IGVxdWF0aW9uLmJvZHlBICkge1xyXG4gICAgICAgIHNpZ24gPSAtMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBzaWduICkge1xyXG4gICAgICAgIHJlc3VsdC5hZGQoIFAyRW5naW5lLnAyVG9WZWN0b3IoIGVxdWF0aW9uLm5vcm1hbEEgKS50aW1lc1NjYWxhciggc2lnbiAqIGVxdWF0aW9uLm11bHRpcGxpZXIgLyBNQVNTX1NDQUxFICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIGNvbnRhY3QgZm9yY2VzIHRoYXQgaGF2ZSBoYXBwZW5lZCBvbiBhIGJvZHkgdG8gMCBhZnRlciBtZWFzdXJlbWVudC5cclxuICAgKi9cclxuICBwdWJsaWMgcmVzZXRDb250YWN0Rm9yY2VzKCBib2R5OiBQaHlzaWNzRW5naW5lQm9keSApOiB2b2lkIHtcclxuICAgIGJvZHkudmxhbWJkYVsgMCBdID0gMDtcclxuICAgIGJvZHkudmxhbWJkYVsgMSBdID0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzZXJpYWxpemVkIGZvcm0gb2YgYSBib2R5XHJcbiAgICovXHJcbiAgcHVibGljIGJvZHlUb1N0YXRlT2JqZWN0KCBib2R5OiBQaHlzaWNzRW5naW5lQm9keSApOiBCb2R5U3RhdGVPYmplY3Qge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcG9zaXRpb246IFAyRW5naW5lLnAyVG9WZWN0b3IoIGJvZHkucG9zaXRpb24gKS50b1N0YXRlT2JqZWN0KCksXHJcbiAgICAgIHZlbG9jaXR5OiBQMkVuZ2luZS5wMlRvVmVjdG9yKCBib2R5LnZlbG9jaXR5ICkudG9TdGF0ZU9iamVjdCgpLFxyXG4gICAgICBmb3JjZTogUDJFbmdpbmUucDJUb1ZlY3RvciggYm9keS5mb3JjZSApLnRvU3RhdGVPYmplY3QoKSAvLyB3ZSBhcHBsaWVkIGZvcmNlcyBhZnRlciB0aGUgc3RlcFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGxpZXMgYSBnaXZlbiBzdGF0ZSBvYmplY3QgdG8gYSBib2R5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBib2R5QXBwbHlTdGF0ZSggYm9keTogUGh5c2ljc0VuZ2luZUJvZHksIG9iajogQm9keVN0YXRlT2JqZWN0ICk6IHZvaWQge1xyXG5cclxuICAgIC8vIFdlIHdpbGwgaWdub3JlIGluZmluaXRpZXNcclxuICAgIGJvZHkucG9zaXRpb25bIDAgXSA9IG9iai5wb3NpdGlvbi54ICogU0laRV9TQ0FMRTtcclxuICAgIGJvZHkucG9zaXRpb25bIDEgXSA9IG9iai5wb3NpdGlvbi55ICogU0laRV9TQ0FMRTtcclxuICAgIGJvZHkucHJldmlvdXNQb3NpdGlvblsgMCBdID0gb2JqLnBvc2l0aW9uLnggKiBTSVpFX1NDQUxFO1xyXG4gICAgYm9keS5wcmV2aW91c1Bvc2l0aW9uWyAxIF0gPSBvYmoucG9zaXRpb24ueSAqIFNJWkVfU0NBTEU7XHJcbiAgICBib2R5LnZlbG9jaXR5WyAwIF0gPSBvYmoudmVsb2NpdHkueCAqIFNJWkVfU0NBTEU7XHJcbiAgICBib2R5LnZlbG9jaXR5WyAxIF0gPSBvYmoudmVsb2NpdHkueSAqIFNJWkVfU0NBTEU7XHJcbiAgICBib2R5LmZvcmNlWyAwIF0gPSBvYmouZm9yY2UueCAqIFNJWkVfU0NBTEU7XHJcbiAgICBib2R5LmZvcmNlWyAxIF0gPSBvYmouZm9yY2UueSAqIFNJWkVfU0NBTEU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc2VyaWFsaXplZCBmb3JtIG9mIGEgYm9keVxyXG4gICAqL1xyXG4gIHB1YmxpYyBib2R5UmVzZXRIaWRkZW4oIGJvZHk6IFBoeXNpY3NFbmdpbmVCb2R5ICk6IHZvaWQge1xyXG4gICAgLy8gQm9kaWVzIGRvbid0IHN0YXJ0IHdpdGggdmVsb2NpdHkvZm9yY2UgYXBwbGllZFxyXG4gICAgYm9keS52ZWxvY2l0eVsgMCBdID0gMDtcclxuICAgIGJvZHkudmVsb2NpdHlbIDEgXSA9IDA7XHJcbiAgICBib2R5LmZvcmNlWyAwIF0gPSAwO1xyXG4gICAgYm9keS5mb3JjZVsgMSBdID0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHByZXZpb3VzIHBvc2l0aW9uIG9mIGEgYm9keSB0byB0aGUgY3VycmVudCBwb3NpdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBib2R5U3luY2hyb25pemVQcmV2aW91cyggYm9keTogUGh5c2ljc0VuZ2luZUJvZHkgKTogdm9pZCB7XHJcbiAgICBib2R5LnByZXZpb3VzUG9zaXRpb25bIDAgXSA9IGJvZHkucG9zaXRpb25bIDAgXTtcclxuICAgIGJvZHkucHJldmlvdXNQb3NpdGlvblsgMSBdID0gYm9keS5wb3NpdGlvblsgMSBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIChzdGF0aWMpIGdyb3VuZCBib2R5IHdpdGggdGhlIGdpdmVuIHZlcnRpY2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjcmVhdGVHcm91bmQoIHZlcnRpY2VzOiBWZWN0b3IyW10gKTogUGh5c2ljc0VuZ2luZUJvZHkge1xyXG4gICAgY29uc3QgYm9keSA9IG5ldyBwMi5Cb2R5KCB7XHJcbiAgICAgIHR5cGU6IHAyLkJvZHkuU1RBVElDLFxyXG4gICAgICBtYXNzOiAwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgYm9keS5mcm9tUG9seWdvbiggdmVydGljZXMubWFwKCBQMkVuZ2luZS52ZWN0b3JUb1AyICkgKTtcclxuXHJcbiAgICAvLyBXb3JrYXJvdW5kLCBzaW5jZSB1c2luZyBDb252ZXggd2Fzbid0IHdvcmtpbmdcclxuICAgIGJvZHkuc2hhcGVzLmZvckVhY2goIHNoYXBlID0+IHtcclxuICAgICAgc2hhcGUubWF0ZXJpYWwgPSBncm91bmRNYXRlcmlhbDtcclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gYm9keTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSAoc3RhdGljKSBiYXJyaWVyIGJvZHkgd2l0aCB0aGUgZ2l2ZW4gdmVydGljZXMuXHJcbiAgICovXHJcbiAgcHVibGljIGNyZWF0ZUJhcnJpZXIoIHZlcnRpY2VzOiBWZWN0b3IyW10gKTogUGh5c2ljc0VuZ2luZUJvZHkge1xyXG4gICAgY29uc3QgYm9keSA9IG5ldyBwMi5Cb2R5KCB7XHJcbiAgICAgIHR5cGU6IHAyLkJvZHkuU1RBVElDLFxyXG4gICAgICBtYXNzOiAwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgYm9keS5mcm9tUG9seWdvbiggdmVydGljZXMubWFwKCBQMkVuZ2luZS52ZWN0b3JUb1AyICkgKTtcclxuXHJcbiAgICAvLyBXb3JrYXJvdW5kLCBzaW5jZSB1c2luZyBDb252ZXggd2Fzbid0IHdvcmtpbmdcclxuICAgIGJvZHkuc2hhcGVzLmZvckVhY2goIHNoYXBlID0+IHtcclxuICAgICAgc2hhcGUubWF0ZXJpYWwgPSBiYXJyaWVyTWF0ZXJpYWw7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIGJvZHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgKGR5bmFtaWMpIGJveCBib2R5LCB3aXRoIHRoZSBvcmlnaW4gYXQgdGhlIGNlbnRlciBvZiB0aGUgYm94LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjcmVhdGVCb3goIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBpc1N0YXRpYz86IGJvb2xlYW4gKTogUGh5c2ljc0VuZ2luZUJvZHkge1xyXG4gICAgY29uc3QgYm9keSA9IG5ldyBwMi5Cb2R5KCB7XHJcbiAgICAgIHR5cGU6IGlzU3RhdGljID8gcDIuQm9keS5TVEFUSUMgOiBwMi5Cb2R5LkRZTkFNSUMsXHJcbiAgICAgIGZpeGVkUm90YXRpb246IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZUJveCggYm9keSwgd2lkdGgsIGhlaWdodCApO1xyXG5cclxuICAgIHJldHVybiBib2R5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgd2lkdGgvaGVpZ2h0IG9mIGEgYm94IGJvZHkuXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZUJveCggYm9keTogUGh5c2ljc0VuZ2luZUJvZHksIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgUDJFbmdpbmUucmVtb3ZlU2hhcGVzKCBib2R5ICk7XHJcblxyXG4gICAgY29uc3QgYm94ID0gbmV3IHAyLkJveCgge1xyXG4gICAgICB3aWR0aDogd2lkdGggKiBTSVpFX1NDQUxFLFxyXG4gICAgICBoZWlnaHQ6IGhlaWdodCAqIFNJWkVfU0NBTEUsXHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLS0gbWF0ZXJpYWwgU0hPVUxEIGJlIGluIFNoYXBlT3B0aW9uc1xyXG4gICAgICBtYXRlcmlhbDogZHluYW1pY01hdGVyaWFsXHJcbiAgICB9ICk7XHJcblxyXG4gICAgYm9keS5hZGRTaGFwZSggYm94ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgKGR5bmFtaWMpIGJvZHksIHdpdGggdGhlIG9yaWdpbiBhdCB0aGUgY2VudHJvaWQuXHJcbiAgICovXHJcbiAgcHVibGljIGNyZWF0ZUZyb21WZXJ0aWNlcyggdmVydGljZXM6IFZlY3RvcjJbXSwgd29ya2Fyb3VuZDogYm9vbGVhbiApOiBQaHlzaWNzRW5naW5lQm9keSB7XHJcbiAgICBjb25zdCBib2R5ID0gbmV3IHAyLkJvZHkoIHtcclxuICAgICAgdHlwZTogcDIuQm9keS5EWU5BTUlDLFxyXG4gICAgICBmaXhlZFJvdGF0aW9uOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVGcm9tVmVydGljZXMoIGJvZHksIHZlcnRpY2VzLCB3b3JrYXJvdW5kICk7XHJcblxyXG4gICAgcmV0dXJuIGJvZHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSB2ZXJ0aWNlcyBvZiBhIGR5bmFtaWMgdmVydGV4LWJhc2VkIGJvZHkuXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZUZyb21WZXJ0aWNlcyggYm9keTogUGh5c2ljc0VuZ2luZUJvZHksIHZlcnRpY2VzOiBWZWN0b3IyW10sIHdvcmthcm91bmQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBQMkVuZ2luZS5yZW1vdmVTaGFwZXMoIGJvZHkgKTtcclxuXHJcbiAgICBpZiAoIHdvcmthcm91bmQgKSB7XHJcbiAgICAgIGJvZHkuZnJvbVBvbHlnb24oIHZlcnRpY2VzLm1hcCggdiA9PiBwMi52ZWMyLmZyb21WYWx1ZXMoIHYueCAqIFNJWkVfU0NBTEUsIHYueSAqIFNJWkVfU0NBTEUgKSApICk7XHJcblxyXG4gICAgICAvLyBXb3JrYXJvdW5kLCBzaW5jZSB1c2luZyBDb252ZXggd2Fzbid0IHdvcmtpbmdcclxuICAgICAgYm9keS5zaGFwZXMuZm9yRWFjaCggc2hhcGUgPT4ge1xyXG4gICAgICAgIHNoYXBlLm1hdGVyaWFsID0gZ3JvdW5kTWF0ZXJpYWw7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb25zdCBzaGFwZSA9IG5ldyBwMi5Db252ZXgoIHtcclxuICAgICAgICB2ZXJ0aWNlczogdmVydGljZXMubWFwKCBQMkVuZ2luZS52ZWN0b3JUb1AyIClcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgc2hhcGUubWF0ZXJpYWwgPSBkeW5hbWljTWF0ZXJpYWw7XHJcblxyXG4gICAgICBib2R5LmFkZFNoYXBlKCBzaGFwZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCBhZnRlciBlYWNoIGludGVybmFsIHN0ZXAuXHJcbiAgICovXHJcbiAgcHVibGljIGFkZFBvc3RTdGVwTGlzdGVuZXIoIGxpc3RlbmVyOiAoIGR0OiBudW1iZXIgKSA9PiB2b2lkICk6IHZvaWQge1xyXG4gICAgdGhpcy5pbnRlcm5hbFN0ZXBFbWl0dGVyLmFkZExpc3RlbmVyKCBsaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCBhZnRlciBlYWNoIGludGVybmFsIHN0ZXAuXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZVBvc3RTdGVwTGlzdGVuZXIoIGxpc3RlbmVyOiAoIGR0OiBudW1iZXIgKSA9PiB2b2lkICk6IHZvaWQge1xyXG4gICAgdGhpcy5pbnRlcm5hbFN0ZXBFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBsaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBpbiBhIHBvaW50ZXIgY29uc3RyYWludCBzbyB0aGF0IHRoZSBib2R5J3MgY3VycmVudCBwb2ludCBhdCB0aGUgcG9zaXRpb24gd2lsbCBzdGF5IGF0IHRoZSBwb3NpdGlvblxyXG4gICAqIChpZiB0aGUgYm9keSBpcyBnZXR0aW5nIGRyYWdnZWQpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRQb2ludGVyQ29uc3RyYWludCggYm9keTogUGh5c2ljc0VuZ2luZUJvZHksIHBvc2l0aW9uOiBWZWN0b3IyICk6IHZvaWQge1xyXG4gICAgLy8gQ3JlYXRlIGFuIGVtcHR5IGJvZHkgdXNlZCBmb3IgdGhlIGNvbnN0cmFpbnQgKHdlIGRvbid0IHdhbnQgaXQgaW50ZXJzZWN0aW5nKS4gSXQgd2lsbCBqdXN0IGJlIHVzZWQgZm9yIGFwcGx5aW5nXHJcbiAgICAvLyB0aGUgZWZmZWN0cyBvZiB0aGlzIGNvbnN0cmFpbnQuXHJcbiAgICBjb25zdCBudWxsQm9keSA9IG5ldyBwMi5Cb2R5KCk7XHJcbiAgICB0aGlzLm51bGxCb2R5TWFwWyBib2R5LmlkIF0gPSBudWxsQm9keTtcclxuXHJcbiAgICBjb25zdCBnbG9iYWxQb2ludCA9IFAyRW5naW5lLnZlY3RvclRvUDIoIHBvc2l0aW9uICk7XHJcbiAgICBjb25zdCBsb2NhbFBvaW50ID0gcDIudmVjMi5jcmVhdGUoKTtcclxuICAgIGJvZHkudG9Mb2NhbEZyYW1lKCBsb2NhbFBvaW50LCBnbG9iYWxQb2ludCApO1xyXG4gICAgdGhpcy53b3JsZC5hZGRCb2R5KCBudWxsQm9keSApO1xyXG5cclxuICAgIGJvZHkud2FrZVVwKCk7XHJcblxyXG4gICAgY29uc3QgcG9pbnRlckNvbnN0cmFpbnQgPSBuZXcgcDIuUmV2b2x1dGVDb25zdHJhaW50KCBudWxsQm9keSwgYm9keSwge1xyXG4gICAgICBsb2NhbFBpdm90QTogZ2xvYmFsUG9pbnQsXHJcbiAgICAgIGxvY2FsUGl2b3RCOiBsb2NhbFBvaW50LFxyXG4gICAgICBtYXhGb3JjZTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzLnAyUG9pbnRlck1hc3NGb3JjZSAqIGJvZHkubWFzcyArIERlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycy5wMlBvaW50ZXJCYXNlRm9yY2VcclxuICAgIH0gKTtcclxuICAgIHRoaXMucG9pbnRlckNvbnN0cmFpbnRNYXBbIGJvZHkuaWQgXSA9IHBvaW50ZXJDb25zdHJhaW50O1xyXG4gICAgdGhpcy53b3JsZC5hZGRDb25zdHJhaW50KCBwb2ludGVyQ29uc3RyYWludCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyBhIHBvaW50ZXIgY29uc3RyYWludCBzbyB0aGF0IHRoZSBib2R5IHdpbGwgZXNzZW50aWFsbHkgYmUgZHJhZ2dlZCB0byB0aGUgbmV3IHBvc2l0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB1cGRhdGVQb2ludGVyQ29uc3RyYWludCggYm9keTogUGh5c2ljc0VuZ2luZUJvZHksIHBvc2l0aW9uOiBWZWN0b3IyICk6IHZvaWQge1xyXG4gICAgY29uc3QgcG9pbnRlckNvbnN0cmFpbnQgPSB0aGlzLnBvaW50ZXJDb25zdHJhaW50TWFwWyBib2R5LmlkIF07XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb2ludGVyQ29uc3RyYWludCApO1xyXG5cclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgaXQgc2hvdWxkIGhhdmUgcGl2b3RBLi4uXHJcbiAgICBwMi52ZWMyLmNvcHkoIHBvaW50ZXJDb25zdHJhaW50LnBpdm90QSwgUDJFbmdpbmUudmVjdG9yVG9QMiggcG9zaXRpb24gKSApO1xyXG4gICAgcG9pbnRlckNvbnN0cmFpbnQuYm9keUEud2FrZVVwKCk7XHJcbiAgICBwb2ludGVyQ29uc3RyYWludC5ib2R5Qi53YWtlVXAoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBwb2ludGVyIGNvbnN0cmFpbnQuXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZVBvaW50ZXJDb25zdHJhaW50KCBib2R5OiBQaHlzaWNzRW5naW5lQm9keSApOiB2b2lkIHtcclxuICAgIGNvbnN0IG51bGxCb2R5ID0gdGhpcy5udWxsQm9keU1hcFsgYm9keS5pZCBdO1xyXG4gICAgY29uc3QgcG9pbnRlckNvbnN0cmFpbnQgPSB0aGlzLnBvaW50ZXJDb25zdHJhaW50TWFwWyBib2R5LmlkIF07XHJcblxyXG4gICAgdGhpcy53b3JsZC5yZW1vdmVDb25zdHJhaW50KCBwb2ludGVyQ29uc3RyYWludCApO1xyXG4gICAgdGhpcy53b3JsZC5yZW1vdmVCb2R5KCBudWxsQm9keSApO1xyXG5cclxuICAgIGRlbGV0ZSB0aGlzLm51bGxCb2R5TWFwWyBib2R5LmlkIF07XHJcbiAgICBkZWxldGUgdGhpcy5wb2ludGVyQ29uc3RyYWludE1hcFsgYm9keS5pZCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgYSBWZWN0b3IyIHRvIGEgcDIudmVjMiwgZm9yIHVzZSB3aXRoIHAyLmpzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgdmVjdG9yVG9QMiggdmVjdG9yOiBWZWN0b3IyICk6IFsgbnVtYmVyLCBudW1iZXIgXSB7XHJcbiAgICByZXR1cm4gcDIudmVjMi5mcm9tVmFsdWVzKCB2ZWN0b3IueCAqIFNJWkVfU0NBTEUsIHZlY3Rvci55ICogU0laRV9TQ0FMRSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgYSBwMi52ZWMyIHRvIGEgVmVjdG9yMlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIHAyVG9WZWN0b3IoIHZlY3RvcjogWyBudW1iZXIsIG51bWJlciBdICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB2ZWN0b3JbIDAgXSAvIFNJWkVfU0NBTEUsIHZlY3RvclsgMSBdIC8gU0laRV9TQ0FMRSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGVscGVyIG1ldGhvZCB0aGF0IHJlbW92ZXMgYWxsIHNoYXBlcyBmcm9tIGEgZ2l2ZW4gYm9keS5cclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyByZW1vdmVTaGFwZXMoIGJvZHk6IFBoeXNpY3NFbmdpbmVCb2R5ICk6IHZvaWQge1xyXG4gICAgd2hpbGUgKCBib2R5LnNoYXBlcy5sZW5ndGggKSB7XHJcbiAgICAgIGJvZHkucmVtb3ZlU2hhcGUoIGJvZHkuc2hhcGVzWyBib2R5LnNoYXBlcy5sZW5ndGggLSAxIF0gKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmRlbnNpdHlCdW95YW5jeUNvbW1vbi5yZWdpc3RlciggJ1AyRW5naW5lJywgUDJFbmdpbmUgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFdBQVcsTUFBTSxvQ0FBb0M7QUFFNUQsT0FBT0MsT0FBTyxNQUE4QiwrQkFBK0I7QUFDM0UsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUM3RCxPQUFPQyxxQkFBcUIsTUFBTSxnQ0FBZ0M7QUFDbEUsT0FBT0Msb0NBQW9DLE1BQU0sNENBQTRDO0FBQzdGLE9BQU9DLGFB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