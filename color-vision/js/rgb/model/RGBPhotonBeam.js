// Copyright 2014-2021, University of Colorado Boulder

/**
 * Model of the photon beams used on the RGB screen, made of individual photon particles.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import colorVision from '../../colorVision.js';
import ColorVisionConstants from '../../common/ColorVisionConstants.js';
import RGBPhoton from './RGBPhoton.js';

class RGBPhotonBeam {

  /**
   * @param {string} color an rgb string
   * @param {Property.<number>} intensityProperty the intensity property for this color from the model
   * @param {Property.<number>} perceivedIntensityProperty the perceived intensity property for this color from the model
   * @param {number} beamLength the length of the beam, used to calculate the starting x coordinate
   * @param {Tandem} tandem
   */
  constructor( color, intensityProperty, perceivedIntensityProperty, beamLength, tandem ) {

    // @public
    this.photons = [];
    this.color = color;
    this.beamLength = beamLength;

    // @private
    this.intensityProperty = intensityProperty;
    this.perceivedIntensityProperty = perceivedIntensityProperty;
  }


  // @public
  updateAnimationFrame( dt ) {

    // move all photons that are currently active
    for ( let i = 0; i < this.photons.length; i++ ) {

      // calculate the new position of the photon in order to check whether will still be in bounds
      const newX = this.photons[ i ].position.x + dt * this.photons[ i ].velocity.x;
      const newY = this.photons[ i ].position.y + dt * this.photons[ i ].velocity.y;

      if ( newX > 0 && newY > 0 && newY < ColorVisionConstants.BEAM_HEIGHT ) {
        this.photons[ i ].updateAnimationFrame( newX, newY );
      }
      else {
        this.perceivedIntensityProperty.set( this.photons[ i ].intensity );
        this.photons.splice( i, 1 ); // remove jth RGBPhoton from list
      }
    }

    // emit a black photon for resetting the perceived color to black if no more photons are emitted this frame
    if ( this.intensityProperty.get() === 0 ) {
      const blackPhoton = new RGBPhoton(
        new Vector2( this.beamLength, ColorVisionConstants.BEAM_HEIGHT / 2 ),
        new Vector2( ColorVisionConstants.X_VELOCITY, 0 ),
        0
      );
      this.photons.push( blackPhoton );
    }
  }

  // @public
  createPhoton( timeElapsed ) {
    const intensity = this.intensityProperty.get();

    // only create a new photon if intensity is greater than 0
    if ( intensity > 0 ) {
      const x = this.beamLength + ColorVisionConstants.X_VELOCITY * timeElapsed;
      const yVelocity = ( dotRandom.nextDouble() * ColorVisionConstants.FAN_FACTOR - ( ColorVisionConstants.FAN_FACTOR / 2 ) ) * 60;

      const initialY = yVelocity * ( 25 / 60 ) + ( ColorVisionConstants.BEAM_HEIGHT / 2 );
      const deltaY = yVelocity * timeElapsed;
      const y = initialY + deltaY;

      this.photons.push( new RGBPhoton(
        new Vector2( x, y ),
        new Vector2( ColorVisionConstants.X_VELOCITY, yVelocity ),
        intensity )
      );
    }
  }

  // @public
  reset() {
    // empty photon array
    while ( this.photons.length ) {
      this.photons.pop();
    }
  }
}

colorVision.register( 'RGBPhotonBeam', RGBPhotonBeam );

export default RGBPhotonBeam;
