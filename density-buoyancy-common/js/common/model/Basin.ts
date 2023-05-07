// Copyright 2020-2022, University of Colorado Boulder

/**
 * Represents a basin that a liquid can reside in at a specific level. This is used for the pool and liquid in the boat.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import InterpolatedProperty from './InterpolatedProperty.js';
import Mass from './Mass.js';

export type BasinOptions = {
  initialVolume?: number;
  initialY?: number;
  tandem?: Tandem;
};

export default abstract class Basin {

  // In m^3, the volume of liquid contained in this basin
  public readonly liquidVolumeProperty: Property<number>;

  // The y coordinate of the liquid level (absolute in the model, NOT relative to anything)
  public readonly liquidYInterpolatedProperty: InterpolatedProperty<number>;

  // The bottom and top of the basin's area of containment (absolute model coordinates), set during physics engine steps.
  public stepBottom: number;
  public stepTop: number;

  // The masses contained in this basin, set during the physics engine steps.
  public stepMasses: Mass[];

  // A basin that may be contained in this one (boat basin in the pool) NOTE: only one guaranteed
  public childBasin: Basin | null;

  protected constructor( providedOptions?: BasinOptions ) {
    const options = optionize<BasinOptions, BasinOptions>()( {
      initialVolume: 0,
      initialY: 0,
      tandem: Tandem.REQUIRED
    }, providedOptions );

    const tandem = options.tandem;

    this.liquidVolumeProperty = new NumberProperty( options.initialVolume, {
      tandem: tandem.createTandem( 'liquidVolumeProperty' ),
      phetioReadOnly: true,
      range: new Range( 0, Number.POSITIVE_INFINITY ),
      phetioDocumentation: 'The volume of liquid contained in the basin',
      units: 'm^3'
    } );

    this.liquidYInterpolatedProperty = new InterpolatedProperty( options.initialY, {
      interpolate: InterpolatedProperty.interpolateNumber,
      phetioOuterType: InterpolatedProperty.InterpolatedPropertyIO,
      phetioValueType: NumberIO,
      tandem: tandem.createTandem( 'liquidYInterpolatedProperty' ),
      phetioHighFrequency: true,
      phetioReadOnly: true,
      phetioDocumentation: 'The y-value of the liquid in model coordinates (where 0 is the top of the pool)'
    } );

    this.stepBottom = 0;
    this.stepTop = 0;
    this.stepMasses = [];
    this.childBasin = null;
  }

  /**
   * Returns whether a given mass is inside this basin (e.g. if filled with liquid, would it be displacing any
   * liquid).
   */
  public abstract isMassInside( mass: Mass ): boolean;

  /**
   * Returns the maximum area that could be contained with liquid at a given y value.
   */
  public abstract getMaximumArea( y: number ): number;

  /**
   * Returns the maximum volume that could be contained with liquid up to a given y value.
   */
  public abstract getMaximumVolume( y: number ): number;

  /**
   * Returns the filled area in the basin (i.e. things that aren't air or water) at the given y value
   */
  public getDisplacedArea( y: number ): number {
    let area = 0;
    this.stepMasses.forEach( mass => {
      area += mass.getDisplacedArea( y );
      assert && assert( !isNaN( area ) );
    } );

    // Don't double-count things, since we're counting the full displacement of the child basin's container
    if ( this.childBasin ) {
      area -= this.childBasin.getDisplacedArea( y );
    }

    return area;
  }

  /**
   * Returns the filled volume in the basin (i.e. things that aren't air or water) that is below the given y value.
   */
  public getDisplacedVolume( y: number ): number {
    let volume = 0;
    this.stepMasses.forEach( mass => {
      volume += mass.getDisplacedVolume( y );
      assert && assert( !isNaN( volume ) );
    } );

    assert && assert( this !== this.childBasin );

    // Don't double-count things, since we're counting the full displacement of the child basin's container
    if ( this.childBasin ) {
      volume -= this.childBasin.getDisplacedVolume( Math.min( y, this.childBasin.stepTop ) );
    }

    return volume;
  }

  /**
   * Returns the empty area in the basin (i.e. air, that isn't a solid object) at the given y value.
   */
  public getEmptyArea( y: number ): number {
    return this.getMaximumArea( y ) - this.getDisplacedArea( y );
  }

  /**
   * Returns the empty volume in the basin (i.e. air, that isn't a solid object) that is below the given y value.
   */
  public getEmptyVolume( y: number ): number {
    const emptyVolume = this.getMaximumVolume( y ) - this.getDisplacedVolume( y );
    assert && assert( emptyVolume >= -1e-11, 'empty volume should be non-negative' );
    return emptyVolume;
  }

  /**
   * Computes the liquid's y coordinate, given the current volume
   */
  public computeY(): void {
    const liquidVolume = this.liquidVolumeProperty.value;
    if ( liquidVolume === 0 ) {
      this.liquidYInterpolatedProperty.setNextValue( this.stepBottom );
      return;
    }

    const emptyVolume = this.getEmptyVolume( this.stepTop );
    if ( emptyVolume === liquidVolume ) {
      this.liquidYInterpolatedProperty.setNextValue( this.stepTop );
      return;
    }

    // Due to shapes used, there is no analytical solution.
    this.liquidYInterpolatedProperty.setNextValue( Basin.findRoot(
      this.stepBottom,
      this.stepTop,
      1e-7,

      // We're finding the root (zero), so that's where the empty volume equals the liquid volume
      yTest => this.getEmptyVolume( yTest ) - liquidVolume,

      // The derivative (change of volume) happens to be the area at that section
      yTest => this.getEmptyArea( yTest )
    ) );
  }

  /**
   * Resets to an initial state.
   */
  public reset(): void {
    this.liquidVolumeProperty.reset();
    this.liquidYInterpolatedProperty.reset();
  }

  /**
   * Hybrid root-finding given our constraints (guaranteed interval, value/derivative). Combines Newton's and bisection.
   */
  private static findRoot( minX: number, maxX: number, tolerance: number, valueFunction: ( n: number ) => number, derivativeFunction: ( n: number ) => number ): number {
    let x = ( minX + maxX ) / 2;

    let y;
    let dy;

    while ( Math.abs( y = valueFunction( x ) ) > tolerance ) {
      dy = derivativeFunction( x );

      if ( y < 0 ) {
        minX = x;
      }
      else {
        maxX = x;
      }

      // Newton's method first
      x -= y / dy;

      // Bounded to be bisection at the very least
      if ( x <= minX || x >= maxX ) {
        x = ( minX + maxX ) / 2;

        // Check to see if it's impossible to pass our tolerance
        if ( x === minX || x === maxX ) {
          break;
        }
      }
    }

    return x;
  }
}

densityBuoyancyCommon.register( 'Basin', Basin );
