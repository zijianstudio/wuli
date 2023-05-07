// Copyright 2022, University of Colorado Boulder

/**
 * Abstract base type for handling physics engines
 *
 * PhysicsEngine.Body represents an opaque object reference type that is specific to the engine it was created from.
 * These can be created with the create* methods, and are passed in to many methods.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import { BodyStateObject } from './P2Engine.js';

export default abstract class PhysicsEngine {

  // Engines typically work in fixed-time steps, this is how far we are in the
  // display from the "previous" step (0) to the "next" step (1).
  public interpolationRatio: number;

  protected constructor() {
    this.interpolationRatio = 1;
  }

  /**
   * Steps forward in time.
   */
  public abstract step( dt: number ): void;

  /**
   * Adds a body into the engine, so that it will be tracked during the step.
   */
  public abstract addBody( body: PhysicsEngineBody ): void;

  /**
   * Removes a body from the engine, so that it will not be tracked during the step anymore.
   */
  public abstract removeBody( body: PhysicsEngineBody ): void;

  /**
   * Sets the mass of a body (and whether it can rotate, which for some engines needs to be set at the same time).
   */
  public abstract bodySetMass( body: PhysicsEngineBody, mass: number, options?: { canRotate?: boolean } ): void;

  /**
   * Sets the provided matrix to the current transformation matrix of the body (to reduce allocations)
   */
  public abstract bodyGetMatrixTransform( body: PhysicsEngineBody, matrix: Matrix3 ): Matrix3;

  /**
   * Sets the provided matrix to the current transformation matrix of the body (to reduce allocations)
   */
  public abstract bodyGetStepMatrixTransform( body: PhysicsEngineBody, matrix: Matrix3 ): Matrix3;

  /**
   * Sets the position of a body.
   */
  public abstract bodySetPosition( body: PhysicsEngineBody, position: Vector2 ): void;

  /**
   * Sets the rotation of a body.
   */
  public abstract bodySetRotation( body: PhysicsEngineBody, rotation: number ): void;

  /**
   * Returns the velocity of a body.
   */
  public abstract bodyGetVelocity( body: PhysicsEngineBody ): Vector2;

  /**
   * Sets the velocity of a body.
   */
  public abstract bodySetVelocity( body: PhysicsEngineBody, velocity: Vector2 ): void;

  /**
   * Applies a given force to a body (should be in the post-step listener ideally)
   */
  public abstract bodyApplyForce( body: PhysicsEngineBody, force: Vector2 ): void;

  /**
   * Returns the applied contact force computed in the last step.
   */
  public abstract bodyGetContactForces( body: PhysicsEngineBody ): Vector2;

  /**
   * Returns the applied contact force computed in the last step (as a force on A from B).
   */
  public abstract bodyGetContactForceBetween( bodyA: PhysicsEngineBody, bodyB: PhysicsEngineBody ): Vector2;

  /**
   * Resets the contact forces that have happened on a body to 0 after measurement.
   */
  public abstract resetContactForces( body: PhysicsEngineBody ): void;

  /**
   * Returns a serialized form of a body
   */
  public abstract bodyToStateObject( body: PhysicsEngineBody ): BodyStateObject;

  /**
   * Applies a given state object to a body.
   */
  public abstract bodyApplyState( body: PhysicsEngineBody, obj: BodyStateObject ): void;

  /**
   * Returns a serialized form of a body
   */
  public abstract bodyResetHidden( body: PhysicsEngineBody ): void;

  /**
   * Sets the previous position of a body to the current position
   */
  public abstract bodySynchronizePrevious( body: PhysicsEngineBody ): void;

  /**
   * Creates a (static) ground body with the given vertices.
   */
  public abstract createGround( vertices: Vector2[] ): PhysicsEngineBody;

  /**
   * Creates a (static) barrier body with the given vertices.
   */
  public abstract createBarrier( vertices: Vector2[] ): PhysicsEngineBody;

  /**
   * Creates a (dynamic) box body, with the origin at the center of the box.
   */
  public abstract createBox( width: number, height: number, isStatic?: boolean ): PhysicsEngineBody;

  /**
   * Updates the width/height of a box body.
   */
  public abstract updateBox( body: PhysicsEngineBody, width: number, height: number ): void;

  /**
   * Creates a (dynamic) body, with the origin at the centroid.
   */
  public abstract createFromVertices( vertices: Vector2[], workaround: boolean ): PhysicsEngineBody;

  /**
   * Updates the vertices of a dynamic vertex-based body.
   */
  public abstract updateFromVertices( body: PhysicsEngineBody, vertices: Vector2[], workaround: boolean ): void;

  /**
   * Adds a listener to be called after each internal step.
   */
  public abstract addPostStepListener( listener: ( dt: number ) => void ): void;

  /**
   * Removes a listener to be called after each internal step.
   */
  public abstract removePostStepListener( listener: ( dt: number ) => void ): void;

  /**
   * Adds in a pointer constraint so that the body's current point at the position will stay at the position
   * (if the body is getting dragged).
   */
  public abstract addPointerConstraint( body: PhysicsEngineBody, position: Vector2 ): void;

  /**
   * Updates a pointer constraint so that the body will essentially be dragged to the new position.
   */
  public abstract updatePointerConstraint( body: PhysicsEngineBody, position: Vector2 ): void;

  /**
   * Removes a pointer constraint.
   */
  public abstract removePointerConstraint( body: PhysicsEngineBody ): void;
}

// NOTE: if we're using something other than P2, we'll need to improve this typing
export type PhysicsEngineBody = p2.Body;

densityBuoyancyCommon.register( 'PhysicsEngine', PhysicsEngine );
