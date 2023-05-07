// Copyright 2019-2023, University of Colorado Boulder

/**
 * An axis-aligned cuboid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Ray3 from '../../../../dot/js/Ray3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass, { InstrumentedMassOptions, MASS_MAX_SHAPES_DIMENSION, MASS_MIN_SHAPES_DIMENSION, MassIOStateObject } from './Mass.js';
import PhysicsEngine from './PhysicsEngine.js';
import { MassShape } from './MassShape.js';

export type CuboidOptions = StrictOmit<InstrumentedMassOptions, 'body' | 'shape' | 'volume' | 'massShape'>;

export default class Cuboid extends Mass {

  public readonly sizeProperty: Property<Bounds3>;

  // Step information
  public stepArea: number;
  public stepMaximumVolume: number;

  public constructor( engine: PhysicsEngine, size: Bounds3, providedConfig: CuboidOptions ) {
    const config = optionize<CuboidOptions, EmptySelfOptions, InstrumentedMassOptions>()( {
      body: engine.createBox( size.width, size.height ),
      shape: Shape.rect( size.minX, size.minY, size.width, size.height ),
      volume: size.width * size.height * size.depth,
      massShape: MassShape.BLOCK,
      phetioType: Cuboid.CuboidIO
    }, providedConfig );

    assert && assert( !config.canRotate );

    // TODO: Ask MK about why the parent options seem to be made optional, this cast shouldn't be needed
    super( engine, config as InstrumentedMassOptions );

    this.sizeProperty = new Property( size, {
      valueType: Bounds3,
      valueComparisonStrategy: 'equalsFunction',
      tandem: config.tandem.createTandem( 'sizeProperty' ),
      phetioValueType: Bounds3.Bounds3IO,
      phetioReadOnly: true
    } );

    this.stepArea = 0;
    this.stepMaximumVolume = 0;
    this.massOffsetOrientationProperty.value = new Vector2( 1, -1 );

    this.updateSize( size );
  }

  /**
   * Updates the size of the cuboid.
   */
  public updateSize( size: Bounds3 ): void {
    // Don't update our model if it's no-volume, we'll have ourselves removed anyway
    if ( size.width && size.height ) {

      // Shift it vertically to keep the same bottom, see https://github.com/phetsims/density/issues/24
      const oldSize = this.sizeProperty.value;
      this.matrix.multiplyMatrix( Matrix3.translation( 0, ( size.height - oldSize.height ) / 2 ) );
      this.writeData();

      this.engine.updateBox( this.body, size.width, size.height );
      this.sizeProperty.value = size;
      this.shapeProperty.value = Shape.rect( size.minX, size.minY, size.width, size.height );

      this.volumeLock = true;
      this.volumeProperty.value = size.width * size.height * size.depth;
      this.volumeLock = false;

      this.forceOffsetProperty.value = new Vector3( 0, 0, size.maxZ );
      this.massOffsetProperty.value = new Vector3( size.minX, size.minY, size.maxZ );

      this.transformedEmitter.emit();
    }
  }

  /**
   * Returns the general size of the mass based on a general size scale.
   */
  public static getSizeFromRatios( widthRatio: number, heightRatio: number ): Bounds3 {
    const x = ( MASS_MIN_SHAPES_DIMENSION + widthRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) ) / 2;
    const y = ( MASS_MIN_SHAPES_DIMENSION + heightRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) ) / 2;
    return new Bounds3( -x, -y, -x, x, y, x );
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   */
  public setRatios( widthRatio: number, heightRatio: number ): void {
    this.updateSize( Cuboid.getSizeFromRatios( widthRatio, heightRatio ) );
  }

  /**
   * Called after an engine-physics-model step once before doing other operations (like computing buoyant forces,
   * displacement, etc.) so that it can set high-performance flags used for this purpose.
   *
   * Type-specific values are likely to be set, but this should set at least stepX/stepBottom/stepTop
   */
  public override updateStepInformation(): void {
    super.updateStepInformation();

    const xOffset = this.stepMatrix.m02();
    const yOffset = this.stepMatrix.m12();

    this.stepX = xOffset;
    this.stepBottom = yOffset + this.sizeProperty.value.minY;
    this.stepTop = yOffset + this.sizeProperty.value.maxY;

    this.stepArea = this.sizeProperty.value.width * this.sizeProperty.value.depth;
    this.stepMaximumVolume = this.stepArea * this.sizeProperty.value.height;
  }

  /**
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  public override intersect( ray: Ray3, isTouch: boolean ): number | null {
    const size = this.sizeProperty.value;
    const translation = this.matrix.getTranslation().toVector3();

    return Cuboid.intersect( size, translation, ray );
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
      // This is identical to VerticalCylinder's getDisplacedVolume formula, see there if this needs to change.
      return this.stepMaximumVolume * ( liquidLevel - bottom ) / ( top - bottom );
    }
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    this.sizeProperty.reset();
    this.updateSize( this.sizeProperty.value );

    super.reset();
  }

  /**
   * Releases references
   */
  public override dispose(): void {
    this.sizeProperty.dispose();

    super.dispose();
  }

  /**
   * Returns a (quick) closest ray intersection with a cuboid (defined by the given Bounds3 and translation).
   */
  public static intersect( bounds: Bounds3, translation: Vector3, ray: Ray3 ): number | null {
    let tNear = Number.NEGATIVE_INFINITY;
    let tFar = Number.POSITIVE_INFINITY;

    if ( ray.direction.x > 0 ) {
      tNear = Math.max( tNear, ( bounds.minX + translation.x - ray.position.x ) / ray.direction.x );
      tFar = Math.min( tFar, ( bounds.maxX + translation.x - ray.position.x ) / ray.direction.x );
    }
    else if ( ray.direction.x < 0 ) {
      tNear = Math.max( tNear, ( bounds.maxX + translation.x - ray.position.x ) / ray.direction.x );
      tFar = Math.min( tFar, ( bounds.minX + translation.x - ray.position.x ) / ray.direction.x );
    }

    if ( ray.direction.y > 0 ) {
      tNear = Math.max( tNear, ( bounds.minY + translation.y - ray.position.y ) / ray.direction.y );
      tFar = Math.min( tFar, ( bounds.maxY + translation.y - ray.position.y ) / ray.direction.y );
    }
    else if ( ray.direction.y < 0 ) {
      tNear = Math.max( tNear, ( bounds.maxY + translation.y - ray.position.y ) / ray.direction.y );
      tFar = Math.min( tFar, ( bounds.minY + translation.y - ray.position.y ) / ray.direction.y );
    }

    if ( ray.direction.z > 0 ) {
      tNear = Math.max( tNear, ( bounds.minZ + translation.z - ray.position.z ) / ray.direction.z );
      tFar = Math.min( tFar, ( bounds.maxZ + translation.z - ray.position.z ) / ray.direction.z );
    }
    else if ( ray.direction.z < 0 ) {
      tNear = Math.max( tNear, ( bounds.maxZ + translation.z - ray.position.z ) / ray.direction.z );
      tFar = Math.min( tFar, ( bounds.minZ + translation.z - ray.position.z ) / ray.direction.z );
    }

    return ( tNear >= tFar ) ? null : ( tNear >= 0 ? tNear : ( isFinite( tFar ) && tFar >= 0 ? tFar : null ) );
  }

  public static CuboidIO = new IOType<Cuboid, CuboidIOStateObject>( 'CuboidIO', {
    valueType: Cuboid,
    supertype: Mass.MassIO,
    documentation: 'Represents an axis-aligned cuboid mass',
    stateSchema: {
      size: Bounds3.Bounds3IO
    },

    toStateObject: ( cuboid: Cuboid ): CuboidIOStateObject => {
      const parentStateObject = Mass.MassIO.toStateObject( cuboid );
      return {
        ...parentStateObject,
        size: Bounds3.Bounds3IO.toStateObject( cuboid.sizeProperty.value )
      };
    },
    applyState: ( cuboid: Cuboid, stateObject: CuboidIOStateObject ) => {

      // Apply size update first, and with the very specific update method
      cuboid.updateSize( Bounds3.Bounds3IO.fromStateObject( stateObject.size ) );
      Mass.MassIO.applyState( cuboid, stateObject );
    }
  } );
}

export type CuboidIOStateObject = MassIOStateObject & {
  size: {
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
  };
};

densityBuoyancyCommon.register( 'Cuboid', Cuboid );
