// Copyright 2019-2022, University of Colorado Boulder

/**
 * A cylinder laying on its end (the caps are on the top and bottom)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Ray3 from '../../../../dot/js/Ray3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass, { InstrumentedMassOptions, MASS_MAX_SHAPES_DIMENSION, MASS_MIN_SHAPES_DIMENSION } from './Mass.js';
import PhysicsEngine from './PhysicsEngine.js';
import { MassShape } from './MassShape.js';

export type VerticalCylinderOptions = StrictOmit<InstrumentedMassOptions, 'body' | 'shape' | 'volume' | 'massShape'>;

export default class VerticalCylinder extends Mass {

  public readonly radiusProperty: Property<number>;
  public readonly heightProperty: Property<number>;

  // Step information
  public stepRadius: number;
  public stepHeight: number;
  public stepArea: number;
  public stepMaximumVolume: number;

  public constructor( engine: PhysicsEngine, radius: number, height: number, providedConfig: VerticalCylinderOptions ) {
    const config = optionize<VerticalCylinderOptions, EmptySelfOptions, InstrumentedMassOptions>()( {
      body: engine.createBox( 2 * radius, height ),
      shape: VerticalCylinder.getVerticalCylinderShape( radius, height ),
      volume: VerticalCylinder.getVolume( radius, height ),
      massShape: MassShape.VERTICAL_CYLINDER,

      phetioType: VerticalCylinder.VerticalCylinderIO
    }, providedConfig );

    assert && assert( !config.canRotate );

    super( engine, config as InstrumentedMassOptions );

    // {Property.<number>}
    this.radiusProperty = new NumberProperty( radius, {
      tandem: config.tandem.createTandem( 'radiusProperty' ),
      range: new Range( 0, Number.POSITIVE_INFINITY )
    } );
    this.heightProperty = new NumberProperty( height, {
      tandem: config.tandem.createTandem( 'heightProperty' ),
      range: new Range( 0, Number.POSITIVE_INFINITY )
    } );

    this.stepRadius = 0;
    this.stepHeight = 0;
    this.stepArea = 0;
    this.stepMaximumVolume = 0;

    this.massOffsetOrientationProperty.value = new Vector2( 0, -1 );

    this.updateSize( radius, height );
  }

  /**
   * Updates the size of the cone.
   */
  public updateSize( radius: number, height: number ): void {
    this.engine.updateBox( this.body, 2 * radius, height );

    this.radiusProperty.value = radius;
    this.heightProperty.value = height;

    this.shapeProperty.value = VerticalCylinder.getVerticalCylinderShape( radius, height );

    this.volumeLock = true;
    this.volumeProperty.value = VerticalCylinder.getVolume( radius, height );
    this.volumeLock = false;

    this.forceOffsetProperty.value = new Vector3( 0, 0, radius );
    this.massOffsetProperty.value = new Vector3( 0, -height / 2, radius );
  }

  /**
   * Returns the radius from a general size scale
   */
  public static getRadiusFromRatio( widthRatio: number ): number {
    return ( MASS_MIN_SHAPES_DIMENSION + widthRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) ) / 2;
  }

  /**
   * Returns the height from a general size scale
   */
  public static getHeightFromRatio( heightRatio: number ): number {
    return ( MASS_MIN_SHAPES_DIMENSION + heightRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) );
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   */
  public setRatios( widthRatio: number, heightRatio: number ): void {
    this.updateSize(
      VerticalCylinder.getRadiusFromRatio( widthRatio ),
      VerticalCylinder.getHeightFromRatio( heightRatio )
    );
  }

  /**
   * Called after a engine-physics-model step once before doing other operations (like computing buoyant forces,
   * displacement, etc.) so that it can set high-performance flags used for this purpose.
   *
   * Type-specific values are likely to be set, but this should set at least stepX/stepBottom/stepTop
   */
  public override updateStepInformation(): void {
    super.updateStepInformation();

    const xOffset = this.stepMatrix.m02();
    const yOffset = this.stepMatrix.m12();

    this.stepX = xOffset;
    this.stepBottom = yOffset - this.heightProperty.value / 2;
    this.stepTop = yOffset + this.heightProperty.value / 2;

    this.stepRadius = this.radiusProperty.value;
    this.stepHeight = this.heightProperty.value;
    this.stepArea = Math.PI * this.stepRadius * this.stepRadius;
    this.stepMaximumVolume = this.stepArea * this.heightProperty.value;
  }

  /**
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  public override intersect( ray: Ray3, isTouch: boolean ): number | null {
    return VerticalCylinder.intersect( ray, isTouch, this.matrix.getTranslation().toVector3(), this.radiusProperty.value, this.heightProperty.value );
  }

  /**
   * Returns the cumulative displaced volume of this object up to a given y level.
   *
   * Assumes step information was updated.
   */
  public getDisplacedArea( liquidLevel: number ): number {
    if ( liquidLevel < this.stepBottom || liquidLevel > this.stepTop ) {
      return 0;
    }
    else {
      return this.stepArea;
    }
  }

  /**
   * Returns the displaced volume of this object up to a given y level, assuming a y value for the given liquid level.
   *
   * Assumes step information was updated.
   */
  public getDisplacedVolume( liquidLevel: number ): number {
    const bottom = this.stepBottom;
    const top = this.stepTop;

    if ( liquidLevel <= bottom ) {
      return 0;
    }
    else if ( liquidLevel >= top ) {
      return this.stepMaximumVolume;
    }
    else {
      // This is identical to Cuboid's getDisplacedVolume formula, see there if this needs to change.
      return this.stepMaximumVolume * ( liquidLevel - bottom ) / ( top - bottom );
    }
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    this.radiusProperty.reset();
    this.heightProperty.reset();
    this.updateSize( this.radiusProperty.value, this.heightProperty.value );

    super.reset();
  }

  /**
   * Releases references
   */
  public override dispose(): void {
    this.radiusProperty.dispose();
    this.heightProperty.dispose();

    super.dispose();
  }

  /**
   * Returns a vertical cylinder shape for a given radius/height.
   */
  public static getVerticalCylinderShape( radius: number, height: number ): Shape {
    return Shape.rect( -radius, -height / 2, 2 * radius, height );
  }

  /**
   * Returns the volume of a vertical cylinder with the given radius and height.
   */
  public static getVolume( radius: number, height: number ): number {
    return Math.PI * radius * radius * height;
  }

  /**
   * If there is an intersection with the ray and the cone, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  public static intersect( ray: Ray3, isTouch: boolean, translation: Vector3, radius: number, height: number ): number | null {
    const relativePosition = ray.position.minusXYZ( translation.x, translation.y, translation.z );

    const xp = 4 / ( radius * radius );
    const zp = 4 / ( radius * radius );

    const a = xp * ray.direction.x * ray.direction.x + zp * ray.direction.z * ray.direction.z;
    const b = 2 * ( xp * relativePosition.x * ray.direction.x + zp * relativePosition.z * ray.direction.z );
    const c = -1 + xp * relativePosition.x * relativePosition.x + zp * relativePosition.z * relativePosition.z;

    const tValues = Utils.solveQuadraticRootsReal( a, b, c )!.filter( t => {
      if ( t <= 0 ) {
        return false;
      }
      const y = ray.pointAtDistance( t ).y;

      return Math.abs( y - translation.y ) <= height / 2;
    } );

    if ( tValues.length ) {
      return tValues[ 0 ];
    }
    else {
      return null;
    }
  }

  public static readonly VerticalCylinderIO = new IOType( 'VerticalCylinderIO', {
    valueType: VerticalCylinder,
    supertype: Mass.MassIO,
    documentation: 'Represents a cylinder laying on its end'
  } );
}

densityBuoyancyCommon.register( 'VerticalCylinder', VerticalCylinder );
