// Copyright 2014-2020, University of Colorado Boulder

/**
 * Model of a photon for RGB screen.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import colorVision from '../../colorVision.js';

class RGBPhoton extends PhetioObject {

  /**
   * @param {Vector2} position
   * @param {Vector2} velocity
   * @param {number} intensity between 0-255 for rgb intensity
   * @param {Object} [options]
   */
  constructor( position, velocity, intensity, options ) {
    super( options );

    // @public
    this.position = position;
    this.velocity = velocity;
    this.intensity = intensity;
  }

  /**
   * @param {number} newX
   * @param {number} newY
   * @public
   */
  updateAnimationFrame( newX, newY ) {
    this.position.x = newX;
    this.position.y = newY;
  }
}

colorVision.register( 'RGBPhoton', RGBPhoton );

RGBPhoton.RGBPhotonIO = new IOType( 'RGBPhotonIO', {
  valueType: RGBPhoton,
  documentation: 'A Photon that has R, G, and B',
  toStateObject: rgbPhoton => ( {
    position: Vector2.Vector2IO.toStateObject( rgbPhoton.position ),
    velocity: Vector2.Vector2IO.toStateObject( rgbPhoton.velocity ),
    intensity: rgbPhoton.intensity
  } ),
  fromStateObject: stateObject => new RGBPhoton(
    Vector2.Vector2IO.fromStateObject( stateObject.position ),
    Vector2.Vector2IO.fromStateObject( stateObject.velocity ),
    stateObject.intensity
  )
} );

export default RGBPhoton;
