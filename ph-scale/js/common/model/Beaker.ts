// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model of a simple beaker.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import phScale from '../../phScale.js';
import PHScaleConstants from '../PHScaleConstants.js';

type SelfOptions = {
  volume?: number; // L
  size?: Dimension2;
};

type BeakerOptions = SelfOptions;

export default class Beaker {

  public readonly position: Vector2;
  public readonly size: Dimension2;
  public readonly volume: number; // L

  // convenience properties, related to position and size
  public readonly left: number;
  public readonly right: number;
  public readonly bounds: Bounds2;

  public constructor( position: Vector2, providedOptions?: BeakerOptions ) {

    const options = optionize<BeakerOptions, SelfOptions>()( {

      // SelfOptions
      volume: PHScaleConstants.BEAKER_VOLUME,
      size: PHScaleConstants.BEAKER_SIZE
    }, providedOptions );

    this.position = position;
    this.size = options.size;
    this.volume = options.volume;

    this.left = this.position.x - ( this.size.width / 2 );
    this.right = this.position.x + ( this.size.width / 2 );
    this.bounds = new Bounds2( this.left, this.position.y - this.size.height, this.right, this.position.y );
  }
}

phScale.register( 'Beaker', Beaker );