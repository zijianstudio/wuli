// Copyright 2020-2022, University of Colorado Boulder

/**
 * The main pool of liquid, cut into the ground.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds3 from '../../../../dot/js/Bounds3.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Basin, { BasinOptions } from './Basin.js';
import Mass from './Mass.js';

export type PoolOptions = BasinOptions;

export default class Pool extends Basin {

  public readonly bounds: Bounds3;

  public constructor( bounds: Bounds3, options?: PoolOptions ) {

    const initialVolume = 0.1;

    super( optionize<PoolOptions, EmptySelfOptions, BasinOptions>()( {
      initialVolume: initialVolume,
      initialY: bounds.minY + initialVolume / ( bounds.width * bounds.depth )
    }, options ) );

    this.bounds = bounds;

    // These won't change over the life of the pool.
    this.stepBottom = bounds.minY;
    this.stepTop = bounds.maxY;
  }

  /**
   * Returns whether a given mass is inside this basin (e.g. if filled with liquid, would it be displacing any
   * liquid).
   */
  public isMassInside( mass: Mass ): boolean {
    return mass.stepBottom < this.stepTop;
  }

  /**
   * Returns the maximum area that could be contained with liquid at a given y value.
   */
  public getMaximumArea( y: number ): number {
    if ( y < this.bounds.minY || y > this.bounds.maxY ) {
      return 0;
    }
    else {
      return this.bounds.width * this.bounds.depth;
    }
  }

  /**
   * Returns the maximum volume that could be contained with liquid up to a given y value.
   */
  public getMaximumVolume( y: number ): number {
    if ( y <= this.bounds.minY ) {
      return 0;
    }
    else if ( y >= this.bounds.maxY ) {
      return this.bounds.width * this.bounds.depth * this.bounds.height;
    }
    else {
      return this.bounds.width * this.bounds.depth * ( y - this.bounds.minY );
    }
  }
}

densityBuoyancyCommon.register( 'Pool', Pool );
