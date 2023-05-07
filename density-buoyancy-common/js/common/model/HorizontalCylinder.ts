// Copyright 2019-2022, University of Colorado Boulder

/**
 * A cylinder laying on its side (the caps are on the left/right)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Ray3 from '../../../../dot/js/Ray3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass, { InstrumentedMassOptions, MASS_MAX_SHAPES_DIMENSION, MASS_MIN_SHAPES_DIMENSION } from './Mass.js';
import PhysicsEngine from './PhysicsEngine.js';
import { MassShape } from './MassShape.js';

export type HorizontalCylinderOptions = StrictOmit<InstrumentedMassOptions, 'body' | 'shape' | 'volume' | 'massShape'>;

export default class HorizontalCylinder extends Mass {

  public readonly radiusProperty: Property<number>;
  public readonly lengthProperty: Property<number>;

  // Step information
  public stepRadius: number;
  public stepHeight: number;
  public stepArea: number;
  public stepMaximumVolume: number;
  public stepMaximumArea: number;

  public constructor( engine: PhysicsEngine, radius: number, length: number, providedConfig: HorizontalCylinderOptions ) {
    const config = optionize<HorizontalCylinderOptions, EmptySelfOptions, InstrumentedMassOptions>()( {
      body: engine.createBox( length, radius * 2 ),
      shape: HorizontalCylinder.getHorizontalCylinderShape( radius, length ),
      volume: HorizontalCylinder.getVolume( radius, length ),
      massShape: MassShape.HORIZONTAL_CYLINDER,

      phetioType: HorizontalCylinder.HorizontalCylinderIO
    }, providedConfig );

    assert && assert( !config.canRotate );

    super( engine, config as InstrumentedMassOptions );

    // {Property.<number>}
    this.radiusProperty = new NumberProperty( radius, {
      tandem: config.tandem.createTandem( 'radiusProperty' ),
      range: new Range( 0, Number.POSITIVE_INFINITY )
    } );
    this.lengthProperty = new NumberProperty( length, {
      tandem: config.tandem.createTandem( 'lengthProperty' ),
      range: new Range( 0, Number.POSITIVE_INFINITY )
    } );

    this.stepRadius = 0;
    this.stepHeight = 0;
    this.stepArea = 0;
    this.stepMaximumVolume = 0;
    this.stepMaximumArea = 0;

    this.updateSize( radius, length );
  }

  /**
   * Updates the size of the cone.
   */
  public updateSize( radius: number, length: number ): void {
    this.engine.updateBox( this.body, length, radius * 2 );

    this.radiusProperty.value = radius;
    this.lengthProperty.value = length;

    this.shapeProperty.value = HorizontalCylinder.getHorizontalCylinderShape( radius, length );

    this.volumeLock = true;
    this.volumeProperty.value = HorizontalCylinder.getVolume( radius, length );
    this.volumeLock = false;

    this.forceOffsetProperty.value = new Vector3( 0, 0, radius );
    this.massOffsetProperty.value = new Vector3( 0, -radius * 0.5, radius * 0.7 );
  }

  /**
   * Returns the radius from a general size scale
   */
  public static getRadiusFromRatio( heightRatio: number ): number {
    return ( MASS_MIN_SHAPES_DIMENSION + heightRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) ) / 2;
  }

  /**
   * Returns the length from a general size scale
   */
  public static getLengthFromRatio( widthRatio: number ): number {
    return ( MASS_MIN_SHAPES_DIMENSION + widthRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) );
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   */
  public setRatios( widthRatio: number, heightRatio: number ): void {
    this.updateSize(
      HorizontalCylinder.getRadiusFromRatio( heightRatio ),
      HorizontalCylinder.getLengthFromRatio( widthRatio )
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
    this.stepBottom = yOffset - this.radiusProperty.value;
    this.stepTop = yOffset + this.radiusProperty.value;

    this.stepRadius = this.radiusProperty.value;
    this.stepHeight = this.lengthProperty.value;
    this.stepMaximumArea = 2 * this.stepRadius * this.lengthProperty.value;
    this.stepMaximumVolume = Math.PI * this.stepRadius * this.stepRadius * this.lengthProperty.value;
  }

  /**
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  public override intersect( ray: Ray3, isTouch: boolean ): number | null {
    const translation = this.matrix.getTranslation().toVector3();
    const radius = this.radiusProperty.value;
    const length = this.lengthProperty.value;
    const relativePosition = ray.position.minusXYZ( translation.x, translation.y, translation.z );

    const yp = 4 / ( radius * radius );
    const zp = 4 / ( radius * radius );

    const a = yp * ray.direction.y * ray.direction.y + zp * ray.direction.z * ray.direction.z;
    const b = 2 * ( yp * relativePosition.y * ray.direction.y + zp * relativePosition.z * ray.direction.z );
    const c = -1 + yp * relativePosition.y * relativePosition.y + zp * relativePosition.z * relativePosition.z;

    const tValues = Utils.solveQuadraticRootsReal( a, b, c )!.filter( t => {
      if ( t <= 0 ) {
        return false;
      }
      const x = ray.pointAtDistance( t ).x;

      return Math.abs( x - translation.x ) <= length / 2;
    } );

    if ( tValues.length ) {
      return tValues[ 0 ];
    }
    else {
      return null;
    }
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
      const ratio = ( liquidLevel - this.stepBottom ) / ( this.stepTop - this.stepBottom );

      return this.stepMaximumArea * 2 * Math.sqrt( ratio - ratio * ratio );
    }
  }

  /**
   * Returns the displaced volume of this object up to a given y level, assuming a y value for the given liquid level.
   *
   * Assumes step information was updated.
   */
  public getDisplacedVolume( liquidLevel: number ): number {
    if ( liquidLevel <= this.stepBottom ) {
      return 0;
    }
    else if ( liquidLevel >= this.stepTop ) {
      return this.stepMaximumVolume;
    }
    else {
      const ratio = ( liquidLevel - this.stepBottom ) / ( this.stepTop - this.stepBottom );
      const f = 2 * ratio - 1;

      // Computed with Mathematica
      return this.stepMaximumVolume * ( 2 * Math.sqrt( ratio - ratio * ratio ) * f + Math.acos( -f ) ) / Math.PI;
    }
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    this.radiusProperty.reset();
    this.lengthProperty.reset();
    this.updateSize( this.radiusProperty.value, this.lengthProperty.value );

    super.reset();
  }

  /**
   * Releases references
   */
  public override dispose(): void {
    this.radiusProperty.dispose();
    this.lengthProperty.dispose();

    super.dispose();
  }

  /**
   * Returns a horizontal cylinder shape for a given radius/length.
   */
  public static getHorizontalCylinderShape( radius: number, length: number ): Shape {
    return Shape.rect( -length / 2, -radius, length, 2 * radius );
  }

  /**
   * Returns the volume of a horizontal cylinder with the given radius and length.
   */
  public static getVolume( radius: number, length: number ): number {
    return Math.PI * radius * radius * length;
  }

  public static readonly HorizontalCylinderIO = new IOType( 'HorizontalCylinderIO', {
    valueType: HorizontalCylinder,
    supertype: Mass.MassIO,
    documentation: 'Represents a cylinder laying on its side'
  } );
}

densityBuoyancyCommon.register( 'HorizontalCylinder', HorizontalCylinder );
