// Copyright 2019-2022, University of Colorado Boulder

/**
 * An up/down cone
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
import Mass, { InstrumentedMassOptions, MASS_MAX_SHAPES_DIMENSION, MASS_MIN_SHAPES_DIMENSION, MassOptions } from './Mass.js';
import PhysicsEngine from './PhysicsEngine.js';
import { MassShape } from './MassShape.js';

const BOTTOM_FROM_CENTER_RATIO = 0.25; // center of mass to the bottom is 1/4 of the height of the cone
const TOP_FROM_CENTER_RATIO = 0.75; // center of mass to the tip is 3/4 of the height of the cone

export type ConeOptions = StrictOmit<InstrumentedMassOptions, 'body' | 'shape' | 'volume' | 'massShape'>;

export default class Cone extends Mass {

  public readonly radiusProperty: Property<number>;
  public readonly heightProperty: Property<number>;
  public readonly isVertexUp: boolean;
  public readonly vertexSign: number;

  // Step information
  public stepRadius: number;
  public stepHeight: number;
  public stepArea: number;
  public stepMaximumVolume: number;

  public constructor( engine: PhysicsEngine, radius: number, height: number, isVertexUp: boolean, providedConfig: ConeOptions ) {

    const initialVertices = Cone.getConeVertices( radius, height, isVertexUp );

    const config = optionize<ConeOptions, EmptySelfOptions, MassOptions>()( {
      body: engine.createFromVertices( initialVertices, false ),
      shape: Shape.polygon( initialVertices ),
      volume: Cone.getVolume( radius, height ),
      massShape: isVertexUp ? MassShape.CONE : MassShape.INVERTED_CONE,

      phetioType: Cone.ConeIO
    }, providedConfig );

    assert && assert( !config.canRotate );

    super( engine, config as InstrumentedMassOptions );

    this.radiusProperty = new NumberProperty( radius, {
      tandem: config.tandem.createTandem( 'radiusProperty' ),
      range: new Range( 0, Number.POSITIVE_INFINITY )
    } );
    this.heightProperty = new NumberProperty( height, {
      tandem: config.tandem.createTandem( 'heightProperty' ),
      range: new Range( 0, Number.POSITIVE_INFINITY )
    } );

    this.isVertexUp = isVertexUp;
    this.vertexSign = isVertexUp ? 1 : -1;
    this.stepRadius = 0;
    this.stepHeight = 0;
    this.stepArea = 0;
    this.stepMaximumVolume = 0;

    this.updateSize( radius, height );
  }

  /**
   * Updates the size of the cone.
   */
  public updateSize( radius: number, height: number ): void {
    const vertices = Cone.getConeVertices( radius, height, this.isVertexUp );

    this.engine.updateFromVertices( this.body, vertices, false );

    this.radiusProperty.value = radius;
    this.heightProperty.value = height;

    this.shapeProperty.value = Shape.polygon( vertices );

    this.volumeLock = true;
    this.volumeProperty.value = Cone.getVolume( radius, height );
    this.volumeLock = false;

    this.forceOffsetProperty.value = new Vector3( 0, 0, 0 );
    this.massOffsetProperty.value = new Vector3( 0, -this.heightProperty.value * ( this.isVertexUp ? 0.1 : 0.6 ), radius * 0.7 );
  }

  /**
   * Returns the radius from a general size scale
   */
  public static getRadiusFromRatio( widthRatio: number ): number {
    // Left independent from getHeightFromRatio since these should be not tied together
    return ( MASS_MIN_SHAPES_DIMENSION + widthRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) ) / 2;
  }

  /**
   * Returns the height from a general size scale
   */
  public static getHeightFromRatio( heightRatio: number ): number {
    // Left independent from getRadiusFromRatio since these should be not tied together
    return ( MASS_MIN_SHAPES_DIMENSION + heightRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) );
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   */
  public setRatios( widthRatio: number, heightRatio: number ): void {
    this.updateSize(
      Cone.getRadiusFromRatio( widthRatio ),
      Cone.getHeightFromRatio( heightRatio )
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
    this.stepBottom = yOffset - this.heightProperty.value * ( this.isVertexUp ? BOTTOM_FROM_CENTER_RATIO : TOP_FROM_CENTER_RATIO );
    this.stepTop = yOffset + this.heightProperty.value * ( this.isVertexUp ? TOP_FROM_CENTER_RATIO : BOTTOM_FROM_CENTER_RATIO );

    this.stepRadius = this.radiusProperty.value;
    this.stepHeight = this.heightProperty.value;
    this.stepArea = Math.PI * this.stepRadius * this.stepRadius;
    this.stepMaximumVolume = this.stepArea * this.heightProperty.value / 3;
  }

  /**
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  public override intersect( ray: Ray3, isTouch: boolean ): number | null {
    const translation = this.matrix.getTranslation().toVector3();
    const height = this.heightProperty.value;
    const radius = this.radiusProperty.value;

    const tipY = translation.y + this.vertexSign * height * TOP_FROM_CENTER_RATIO;
    const baseY = translation.y - this.vertexSign * height * BOTTOM_FROM_CENTER_RATIO;
    const cos = radius / height;
    const cosSquared = cos * cos;
    const cosSquaredInverse = 1 / cosSquared;

    const relativePosition = ray.position.minusXYZ( translation.x, tipY, translation.z );

    const a = cosSquaredInverse * ( ray.direction.x * ray.direction.x + ray.direction.z * ray.direction.z ) - ray.direction.y * ray.direction.y;
    const b = cosSquaredInverse * 2 * ( relativePosition.x * ray.direction.x + relativePosition.z * ray.direction.z ) - 2 * relativePosition.y * ray.direction.y;
    const c = cosSquaredInverse * ( relativePosition.x * relativePosition.x + relativePosition.z * relativePosition.z ) - relativePosition.y * relativePosition.y;

    const tValues = Utils.solveQuadraticRootsReal( a, b, c )!.filter( t => {
      if ( t <= 0 ) {
        return false;
      }
      const y = ray.pointAtDistance( t ).y;
      if ( this.isVertexUp ) {
        return y < tipY && y > baseY;
      }
      else {
        return y > tipY && y < baseY;
      }
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
      let ratio = ( liquidLevel - this.stepBottom ) / ( this.stepTop - this.stepBottom );
      if ( this.isVertexUp ) {
        ratio = 1 - ratio;
      }
      const radius = this.stepRadius * ratio;
      return Math.PI * radius * radius;
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

      if ( this.isVertexUp ) {
        // a = pi * ( r * ( 1 - t ) )^2 = pi * r^2 * ( 1 - t )^2 = ( pi * r^2 ) - ( pi * r^2 * t^2 )
        // v = pi * r^2 * t - 1/3 pi * r^2 * t^3 = pi * r^2 * ( t - 1/3 t^3 )
        return this.stepArea * this.heightProperty.value * ( ratio * ( 3 + ratio * ( ratio - 3 ) ) ) / 3;
      }
      else {
        // a = pi * (r*t)^2 = pi * r^2 * t^2
        // v = 1/3 pi * r^2 * t^3
        return this.stepArea * this.heightProperty.value * ratio * ratio * ratio / 3;
      }
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
   * Returns an array of vertices for the 2d physics model
   */
  public static getConeVertices( radius: number, height: number, isVertexUp: boolean ): Vector2[] {
    const vertexSign = isVertexUp ? 1 : -1;

    return [
      new Vector2( 0, TOP_FROM_CENTER_RATIO * vertexSign * height ),
      new Vector2( -vertexSign * radius, -BOTTOM_FROM_CENTER_RATIO * vertexSign * height ),
      new Vector2( vertexSign * radius, -BOTTOM_FROM_CENTER_RATIO * vertexSign * height )
    ];
  }

  /**
   * Returns the volume of a cone with the given radius and height.
   */
  public static getVolume( radius: number, height: number ): number {
    return Math.PI * radius * radius * height / 3;
  }

  public static readonly ConeIO = new IOType( 'ConeIO', {
    valueType: Cone,
    supertype: Mass.MassIO,
    documentation: 'Represents an up/down cone'
  } );
}

densityBuoyancyCommon.register( 'Cone', Cone );
