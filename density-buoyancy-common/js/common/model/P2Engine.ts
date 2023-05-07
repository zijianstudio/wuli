// Copyright 2019-2022, University of Colorado Boulder

/**
 * Adapter for the p2.js physics engine
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TEmitter from '../../../../axon/js/TEmitter.js';
import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2, { Vector2StateObject } from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import PhysicsEngine, { PhysicsEngineBody } from './PhysicsEngine.js';

// constants
const FIXED_TIME_STEP = DensityBuoyancyCommonQueryParameters.p2FixedTimeStep;
const MAX_SUB_STEPS = DensityBuoyancyCommonQueryParameters.p2MaxSubSteps;
const SIZE_SCALE = DensityBuoyancyCommonQueryParameters.p2SizeScale;
const MASS_SCALE = DensityBuoyancyCommonQueryParameters.p2MassScale;

const groundMaterial = new p2.Material();
const barrierMaterial = new p2.Material();
const dynamicMaterial = new p2.Material();

type BodySetMassOptions = { canRotate?: boolean };

export type BodyStateObject = {
  position: Vector2StateObject;
  velocity: Vector2StateObject;
  force: Vector2StateObject;
};

export default class P2Engine extends PhysicsEngine {

  private readonly world: p2.World;

  // Maps {number} body.id => {p2.RevoluteConstraint}
  private readonly pointerConstraintMap: Record<number, p2.RevoluteConstraint>;

  // Maps {number} body.id => {p2.Body}. Contains bodies that are empty, and specifically used for
  // pointer constraints (so they can be positioned to where the pointer is).
  private readonly nullBodyMap: Record<number, p2.Body>;

  private readonly internalStepEmitter: TEmitter<[ number ]>;

  public constructor() {
    super();

    this.world = new p2.World( {} );

    this.world.applyGravity = false;

    const solver = this.world.solver as p2.GSSolver;
    solver.iterations = DensityBuoyancyCommonQueryParameters.p2Iterations;
    solver.frictionIterations = DensityBuoyancyCommonQueryParameters.p2FrictionIterations;
    solver.tolerance = DensityBuoyancyCommonQueryParameters.p2Tolerance;

    this.pointerConstraintMap = {};
    this.nullBodyMap = {};

    // restitution - no bounce is 0, default is 0
    // stiffness default 1e6, Number.POSITIVE_INFINITY maybe?
    //  Saw comment "We need infinite stiffness to get exact restitution" online
    // relaxation default is 4

    this.world.addContactMaterial( new p2.ContactMaterial( groundMaterial, dynamicMaterial, {
      restitution: DensityBuoyancyCommonQueryParameters.p2Restitution,
      stiffness: DensityBuoyancyCommonQueryParameters.p2GroundStiffness,
      relaxation: DensityBuoyancyCommonQueryParameters.p2GroundRelaxation
    } ) );
    this.world.addContactMaterial( new p2.ContactMaterial( dynamicMaterial, dynamicMaterial, {
      restitution: DensityBuoyancyCommonQueryParameters.p2Restitution,
      stiffness: DensityBuoyancyCommonQueryParameters.p2DynamicStiffness,
      relaxation: DensityBuoyancyCommonQueryParameters.p2DynamicRelaxation
    } ) );
    this.world.addContactMaterial( new p2.ContactMaterial( barrierMaterial, dynamicMaterial, {
      restitution: DensityBuoyancyCommonQueryParameters.p2Restitution,
      stiffness: DensityBuoyancyCommonQueryParameters.p2BarrierStiffness,
      relaxation: DensityBuoyancyCommonQueryParameters.p2BarrierRelaxation
    } ) );

    this.internalStepEmitter = new TinyEmitter();

    this.world.on( 'postStep', () => {
      this.internalStepEmitter.emit( this.world.lastTimeStep );
    } );

    // Kill vertical-only friction to avoid edge cases, see https://github.com/phetsims/density/issues/65
    // and https://github.com/phetsims/density/issues/66
    this.world.on( 'preSolve', ( preSolveEvent: p2.PreSolveEvent ) => {
      preSolveEvent.frictionEquations.forEach( equation => {
        equation.enabled = equation.t[ 0 ] !== 0;
      } );
    } );
  }

  /**
   * Steps forward in time.
   */
  public step( dt: number ): void {
    this.world.step( FIXED_TIME_STEP, dt, MAX_SUB_STEPS );
    this.interpolationRatio = ( this.world.accumulator % FIXED_TIME_STEP ) / FIXED_TIME_STEP;
  }

  /**
   * Adds a body into the engine, so that it will be tracked during the step.
   */
  public addBody( body: PhysicsEngineBody ): void {
    this.world.addBody( body );
  }

  /**
   * Removes a body from the engine, so that it will not be tracked during the step anymore.
   */
  public removeBody( body: PhysicsEngineBody ): void {
    this.world.removeBody( body );
  }

  /**
   * Sets the mass of a body (and whether it can rotate, which for some engines needs to be set at the same time).
   */
  public bodySetMass( body: PhysicsEngineBody, mass: number, providedOptions?: BodySetMassOptions ): void {
    const options = optionize<BodySetMassOptions>()( {
      // {boolean} - optional
      canRotate: false
    }, providedOptions );

    body.mass = mass * MASS_SCALE;

    if ( !options.canRotate ) {
      body.fixedRotation = true;
    }

    body.updateMassProperties();
  }

  /**
   * Sets the provided matrix to the current transformation matrix of the body (to reduce allocations)
   */
  public bodyGetMatrixTransform( body: PhysicsEngineBody, matrix: Matrix3 ): Matrix3 {
    return matrix.setToTranslationRotation( body.interpolatedPosition[ 0 ] / SIZE_SCALE, body.interpolatedPosition[ 1 ] / SIZE_SCALE, body.interpolatedAngle );
  }

  /**
   * Sets the provided matrix to the current transformation matrix of the body (to reduce allocations)
   */
  public bodyGetStepMatrixTransform( body: PhysicsEngineBody, matrix: Matrix3 ): Matrix3 {
    return matrix.setToTranslationRotation( body.position[ 0 ] / SIZE_SCALE, body.position[ 1 ] / SIZE_SCALE, body.angle );
  }

  /**
   * Sets the position of a body.
   */
  public bodySetPosition( body: PhysicsEngineBody, position: Vector2 ): void {
    body.position[ 0 ] = position.x * SIZE_SCALE;
    body.position[ 1 ] = position.y * SIZE_SCALE;
  }

  /**
   * Sets the rotation of a body.
   */
  public bodySetRotation( body: PhysicsEngineBody, rotation: number ): void {
    body.angle = rotation;
  }

  /**
   * Returns the velocity of a body.
   */
  public bodyGetVelocity( body: PhysicsEngineBody ): Vector2 {
    return P2Engine.p2ToVector( body.velocity );
  }

  /**
   * Sets the velocity of a body.
   */
  public bodySetVelocity( body: PhysicsEngineBody, velocity: Vector2 ): void {
    body.velocity[ 0 ] = velocity.x * SIZE_SCALE;
    body.velocity[ 1 ] = velocity.y * SIZE_SCALE;
  }

  /**
   * Applies a given force to a body (should be in the post-step listener ideally)
   */
  public bodyApplyForce( body: PhysicsEngineBody, force: Vector2 ): void {
    body.force[ 0 ] += force.x * SIZE_SCALE * MASS_SCALE;
    body.force[ 1 ] += force.y * SIZE_SCALE * MASS_SCALE;
  }

  /**
   * Returns the applied contact force computed in the last step.
   */
  public bodyGetContactForces( body: PhysicsEngineBody ): Vector2 {
    return P2Engine.p2ToVector( body.vlambda ).timesScalar( body.mass / FIXED_TIME_STEP / MASS_SCALE );
  }

  /**
   * Returns the applied contact force computed in the last step (as a force on A from B).
   */
  public bodyGetContactForceBetween( bodyA: PhysicsEngineBody, bodyB: PhysicsEngineBody ): Vector2 {
    const result = Vector2.ZERO.copy();
    const equations = this.world.narrowphase.contactEquations;

    for ( let i = 0; i < equations.length; i++ ) {
      const equation = equations[ i ];

      let sign = 0;
      if ( bodyA === equation.bodyA && bodyB === equation.bodyB ) {
        sign = 1;
      }
      if ( bodyA === equation.bodyB && bodyB === equation.bodyA ) {
        sign = -1;
      }

      if ( sign ) {
        result.add( P2Engine.p2ToVector( equation.normalA ).timesScalar( sign * equation.multiplier / MASS_SCALE ) );
      }
    }

    return result;
  }

  /**
   * Resets the contact forces that have happened on a body to 0 after measurement.
   */
  public resetContactForces( body: PhysicsEngineBody ): void {
    body.vlambda[ 0 ] = 0;
    body.vlambda[ 1 ] = 0;
  }

  /**
   * Returns a serialized form of a body
   */
  public bodyToStateObject( body: PhysicsEngineBody ): BodyStateObject {
    return {
      position: P2Engine.p2ToVector( body.position ).toStateObject(),
      velocity: P2Engine.p2ToVector( body.velocity ).toStateObject(),
      force: P2Engine.p2ToVector( body.force ).toStateObject() // we applied forces after the step
    };
  }

  /**
   * Applies a given state object to a body.
   */
  public bodyApplyState( body: PhysicsEngineBody, obj: BodyStateObject ): void {

    // We will ignore infinities
    body.position[ 0 ] = obj.position.x * SIZE_SCALE;
    body.position[ 1 ] = obj.position.y * SIZE_SCALE;
    body.previousPosition[ 0 ] = obj.position.x * SIZE_SCALE;
    body.previousPosition[ 1 ] = obj.position.y * SIZE_SCALE;
    body.velocity[ 0 ] = obj.velocity.x * SIZE_SCALE;
    body.velocity[ 1 ] = obj.velocity.y * SIZE_SCALE;
    body.force[ 0 ] = obj.force.x * SIZE_SCALE;
    body.force[ 1 ] = obj.force.y * SIZE_SCALE;
  }

  /**
   * Returns a serialized form of a body
   */
  public bodyResetHidden( body: PhysicsEngineBody ): void {
    // Bodies don't start with velocity/force applied
    body.velocity[ 0 ] = 0;
    body.velocity[ 1 ] = 0;
    body.force[ 0 ] = 0;
    body.force[ 1 ] = 0;
  }

  /**
   * Sets the previous position of a body to the current position
   */
  public bodySynchronizePrevious( body: PhysicsEngineBody ): void {
    body.previousPosition[ 0 ] = body.position[ 0 ];
    body.previousPosition[ 1 ] = body.position[ 1 ];
  }

  /**
   * Creates a (static) ground body with the given vertices.
   */
  public createGround( vertices: Vector2[] ): PhysicsEngineBody {
    const body = new p2.Body( {
      type: p2.Body.STATIC,
      mass: 0
    } );

    body.fromPolygon( vertices.map( P2Engine.vectorToP2 ) );

    // Workaround, since using Convex wasn't working
    body.shapes.forEach( shape => {
      shape.material = groundMaterial;
    } );

    return body;
  }

  /**
   * Creates a (static) barrier body with the given vertices.
   */
  public createBarrier( vertices: Vector2[] ): PhysicsEngineBody {
    const body = new p2.Body( {
      type: p2.Body.STATIC,
      mass: 0
    } );

    body.fromPolygon( vertices.map( P2Engine.vectorToP2 ) );

    // Workaround, since using Convex wasn't working
    body.shapes.forEach( shape => {
      shape.material = barrierMaterial;
    } );

    return body;
  }

  /**
   * Creates a (dynamic) box body, with the origin at the center of the box.
   */
  public createBox( width: number, height: number, isStatic?: boolean ): PhysicsEngineBody {
    const body = new p2.Body( {
      type: isStatic ? p2.Body.STATIC : p2.Body.DYNAMIC,
      fixedRotation: true
    } );

    this.updateBox( body, width, height );

    return body;
  }

  /**
   * Updates the width/height of a box body.
   */
  public updateBox( body: PhysicsEngineBody, width: number, height: number ): void {
    P2Engine.removeShapes( body );

    const box = new p2.Box( {
      width: width * SIZE_SCALE,
      height: height * SIZE_SCALE,
      // @ts-expect-error -- material SHOULD be in ShapeOptions
      material: dynamicMaterial
    } );

    body.addShape( box );
  }

  /**
   * Creates a (dynamic) body, with the origin at the centroid.
   */
  public createFromVertices( vertices: Vector2[], workaround: boolean ): PhysicsEngineBody {
    const body = new p2.Body( {
      type: p2.Body.DYNAMIC,
      fixedRotation: true
    } );

    this.updateFromVertices( body, vertices, workaround );

    return body;
  }

  /**
   * Updates the vertices of a dynamic vertex-based body.
   */
  public updateFromVertices( body: PhysicsEngineBody, vertices: Vector2[], workaround: boolean ): void {
    P2Engine.removeShapes( body );

    if ( workaround ) {
      body.fromPolygon( vertices.map( v => p2.vec2.fromValues( v.x * SIZE_SCALE, v.y * SIZE_SCALE ) ) );

      // Workaround, since using Convex wasn't working
      body.shapes.forEach( shape => {
        shape.material = groundMaterial;
      } );
    }
    else {
      const shape = new p2.Convex( {
        vertices: vertices.map( P2Engine.vectorToP2 )
      } );

      shape.material = dynamicMaterial;

      body.addShape( shape );
    }
  }

  /**
   * Adds a listener to be called after each internal step.
   */
  public addPostStepListener( listener: ( dt: number ) => void ): void {
    this.internalStepEmitter.addListener( listener );
  }

  /**
   * Removes a listener to be called after each internal step.
   */
  public removePostStepListener( listener: ( dt: number ) => void ): void {
    this.internalStepEmitter.removeListener( listener );
  }

  /**
   * Adds in a pointer constraint so that the body's current point at the position will stay at the position
   * (if the body is getting dragged).
   */
  public addPointerConstraint( body: PhysicsEngineBody, position: Vector2 ): void {
    // Create an empty body used for the constraint (we don't want it intersecting). It will just be used for applying
    // the effects of this constraint.
    const nullBody = new p2.Body();
    this.nullBodyMap[ body.id ] = nullBody;

    const globalPoint = P2Engine.vectorToP2( position );
    const localPoint = p2.vec2.create();
    body.toLocalFrame( localPoint, globalPoint );
    this.world.addBody( nullBody );

    body.wakeUp();

    const pointerConstraint = new p2.RevoluteConstraint( nullBody, body, {
      localPivotA: globalPoint,
      localPivotB: localPoint,
      maxForce: DensityBuoyancyCommonQueryParameters.p2PointerMassForce * body.mass + DensityBuoyancyCommonQueryParameters.p2PointerBaseForce
    } );
    this.pointerConstraintMap[ body.id ] = pointerConstraint;
    this.world.addConstraint( pointerConstraint );
  }

  /**
   * Updates a pointer constraint so that the body will essentially be dragged to the new position.
   */
  public updatePointerConstraint( body: PhysicsEngineBody, position: Vector2 ): void {
    const pointerConstraint = this.pointerConstraintMap[ body.id ];
    assert && assert( pointerConstraint );

    // @ts-expect-error it should have pivotA...
    p2.vec2.copy( pointerConstraint.pivotA, P2Engine.vectorToP2( position ) );
    pointerConstraint.bodyA.wakeUp();
    pointerConstraint.bodyB.wakeUp();
  }

  /**
   * Removes a pointer constraint.
   */
  public removePointerConstraint( body: PhysicsEngineBody ): void {
    const nullBody = this.nullBodyMap[ body.id ];
    const pointerConstraint = this.pointerConstraintMap[ body.id ];

    this.world.removeConstraint( pointerConstraint );
    this.world.removeBody( nullBody );

    delete this.nullBodyMap[ body.id ];
    delete this.pointerConstraintMap[ body.id ];
  }

  /**
   * Converts a Vector2 to a p2.vec2, for use with p2.js
   */
  private static vectorToP2( vector: Vector2 ): [ number, number ] {
    return p2.vec2.fromValues( vector.x * SIZE_SCALE, vector.y * SIZE_SCALE );
  }

  /**
   * Converts a p2.vec2 to a Vector2
   */
  private static p2ToVector( vector: [ number, number ] ): Vector2 {
    return new Vector2( vector[ 0 ] / SIZE_SCALE, vector[ 1 ] / SIZE_SCALE );
  }

  /**
   * Helper method that removes all shapes from a given body.
   */
  private static removeShapes( body: PhysicsEngineBody ): void {
    while ( body.shapes.length ) {
      body.removeShape( body.shapes[ body.shapes.length - 1 ] );
    }
  }
}

densityBuoyancyCommon.register( 'P2Engine', P2Engine );
