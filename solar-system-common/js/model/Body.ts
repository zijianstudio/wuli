// Copyright 2023, University of Colorado Boulder

/**
 * Model for a gravitational interacting Body
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import createObservableArray, { ObservableArray } from '../../../axon/js/createObservableArray.js';
import Vector2 from '../../../dot/js/Vector2.js';
import solarSystemCommon from '../solarSystemCommon.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import { Color } from '../../../scenery/js/imports.js';
import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import Property from '../../../axon/js/Property.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import { BodyInfo } from './SolarSystemCommonModel.js';

export default class Body {
  // Unitless body quantities (physical properties)
  public readonly massProperty: Property<number>;
  public readonly radiusProperty: TReadOnlyProperty<number>;
  public readonly positionProperty: Property<Vector2>;
  public readonly velocityProperty: Property<Vector2>;
  public readonly accelerationProperty: Property<Vector2>;
  public readonly forceProperty: Property<Vector2>;

  // Collision handling
  public readonly collidedEmitter = new TinyEmitter();

  // Not resettable, common model will handle. Determines if the body is currently on-screen
  public readonly isActiveProperty = new BooleanProperty( false );

  // True when the body goes off-screen
  public readonly escapedProperty = new BooleanProperty( false );

  // True when the body force is off-scale
  public readonly forceOffscaleProperty = new BooleanProperty( false );

  // User modified properties
  public readonly userControlledPositionProperty = new BooleanProperty( false );
  public readonly userControlledVelocityProperty = new BooleanProperty( false );
  public readonly userControlledMassProperty = new BooleanProperty( false );

  // Array of points for drawing the path
  public readonly pathPoints: ObservableArray<Vector2>;

  public readonly colorProperty: TReadOnlyProperty<Color>;

  private pathDistance = 0;

  public constructor( public readonly index: number, initialMass: number, initialPosition: Vector2, initialVelocity: Vector2, public userControlledProperty: Property<boolean>, colorProperty: TReadOnlyProperty<Color> ) {
    this.massProperty = new NumberProperty( initialMass, { isValidValue: v => v > 0 } );
    this.radiusProperty = new NumberProperty( 1 );
    this.positionProperty = new Vector2Property( initialPosition );
    this.velocityProperty = new Vector2Property( initialVelocity );
    this.accelerationProperty = new Vector2Property( Vector2.ZERO );
    this.forceProperty = new Vector2Property( Vector2.ZERO );
    this.colorProperty = colorProperty;

    this.radiusProperty = new DerivedProperty( [ this.massProperty ], mass => Body.massToRadius( mass ) );

    // Data for rendering the path
    this.pathPoints = createObservableArray();
  }

  public reset(): void {
    this.massProperty.reset();
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.accelerationProperty.reset();
    this.forceProperty.reset();
    this.escapedProperty.reset();
    this.forceOffscaleProperty.reset();
    this.clearPath();
  }

  /**
   * Add a point to the collection of points that follow the trajectory of a moving body.
   * This also removes points when the path gets too long.
   */
  public addPathPoint(): void {
    const pathPoint = this.positionProperty.value.copy();

    // Only add or remove points if the body is effectively moving
    if ( this.pathPoints.length === 0 || !pathPoint.equals( this.pathPoints[ this.pathPoints.length - 1 ] ) ) {
      this.pathPoints.push( pathPoint );

      // Add the length to the tracked path length
      if ( this.pathPoints.length >= 2 ) {
        this.pathDistance += pathPoint.distance( this.pathPoints[ this.pathPoints.length - 2 ] );
      }

      // Remove points from the path as the path gets too long
      while ( this.pathDistance > 2000 ) {
        this.pathDistance -= this.pathPoints[ 1 ].distance( this.pathPoints[ 0 ] );
        this.pathPoints.shift();
      }

    }
  }

  public get info(): BodyInfo {
    return {
      mass: this.massProperty.value,
      position: this.positionProperty.value.copy(),
      velocity: this.velocityProperty.value.copy(),
      active: this.isActiveProperty.value
    };
  }

  public isOverlapping( otherBody: Body ): boolean {
    const distance = this.positionProperty.value.distance( otherBody.positionProperty.value );
    const radiusSum = this.radiusProperty.value + otherBody.radiusProperty.value;
    return distance < radiusSum;
  }

  public preventCollision( bodies: Body[] ): void {
    bodies.forEach( body => {
      if ( body !== this && this.isOverlapping( body ) ) {
        // If it's going to collide, arbitrarily move it 100 pixels up
        this.positionProperty.value = this.positionProperty.value.plus( new Vector2( 0, 100 ) );
        this.preventCollision( bodies );
      }
    } );
  }

  /**
   * Clear the whole path of points tracking the body's trajectory.
   */
  public clearPath(): void {
    this.pathPoints.clear();
    this.pathDistance = 0;
  }

  public static massToRadius( mass: number ): number {
    const minRadius = 3;
    return Math.max( minRadius, 2.3 * Math.pow( mass, 1 / 3 ) );
  }
}

solarSystemCommon.register( 'Body', Body );