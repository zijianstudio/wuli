// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model of the photon beam used on the single bulb screen, made of individual photon particles.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import { Color } from '../../../../scenery/js/imports.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import colorVision from '../../colorVision.js';
import ColorVisionConstants from '../../common/ColorVisionConstants.js';
import SingleBulbConstants from '../SingleBulbConstants.js';
import SingleBulbPhoton from './SingleBulbPhoton.js';

// constants
const BLACK_ALPHA_0 = Color.BLACK.withAlpha( 0 ).setImmutable();

class SingleBulbPhotonBeam extends PhetioObject {

  /**
   * @param {SingleBulbModel} model
   * @param {number} beamLength the length of the beam. This is used to determine what position to restart the photons.
   * @param {Object} [options] - required
   */
  constructor( model, beamLength, options ) {
    options = merge( {
      phetioState: false
    }, options );

    super( options );

    // @public
    this.photons = [];
    this.beamLength = beamLength;

    // @private
    this.model = model;

    // @public
    this.repaintEmitter = new Emitter();
  }

  // @public
  updateAnimationFrame( dt ) {

    let probability = 1; // probability for a given photon to pass the filter
    const filterWavelength = this.model.filterWavelengthProperty.value;

    // move all photons that are currently active
    for ( let j = 0; j < this.photons.length; j++ ) {
      const photon = this.photons[ j ];

      // calculate the new position of the photon in order to check whether it will still be in bounds
      const newX = photon.position.x + dt * photon.velocity.x;
      const newY = photon.position.y + dt * photon.velocity.y;

      // check if the photon just passed through the filter position
      if ( this.model.filterVisibleProperty.value && newX < this.filterOffset && !photon.passedFilter ) {
        const halfWidth = SingleBulbConstants.GAUSSIAN_WIDTH / 2;

        // If the photon's wavelength is outside the transmission width, it doesn't pass.
        if ( photon.wavelength < filterWavelength - halfWidth ||
             photon.wavelength > filterWavelength + halfWidth ) {
          probability = 0;
        }
        // flashlightWavelength is within the transmission width, pass a linear percentage.
        else {
          probability = 1 - Math.abs( filterWavelength - photon.wavelength ) / halfWidth;
        }

        // set the probability to be 0.5 for white photons, this is just based on the observation of what looks good
        probability = ( !photon.wasWhite ) ? probability : 0.5;

        // remove a percentage of photons from the beam
        if ( dotRandom.nextDouble() >= probability ) {
          this.photons[ j ].dispose();
          this.photons.splice( j, 1 ); // remove jth photon from list
          continue;
        }
        // if the beam is white, make sure it is the color of the filter
        else if ( photon.isWhite ) {
          photon.color = VisibleColor.wavelengthToColor( filterWavelength );
          photon.isWhite = false;
        }
        // if the photon is not white
        else {

          // set the photonIntensity to be the same as the percentage passing through the filter,
          // for use when setting the perceived color when the photon hits the eye.
          // make sure the intensity is at least 0.2, otherwise it looks too black in the view
          photon.intensity = isFinite( probability ) ? ( ( probability < 0.2 ) ? 0.2 : probability ) : 0;
        }
      }

      // keep track of photons which pass the filter
      if ( photon.position.x < this.filterOffset ) {
        photon.passedFilter = true;
      }

      // move the photon unless it goes out of bounds
      if ( newX > 0 && newY > 0 && newY < ColorVisionConstants.BEAM_HEIGHT ) {
        photon.updateAnimationFrame( newX, newY );
      }

      // if the photon goes out of bounds, update the lastPhotonColor Property, which is used in determining the perceived color
      else {

        // the perceived color, and in particular its intensity, is based in part on whether it is or was white
        let newPerceivedColor;
        if ( photon.isWhite ) {
          newPerceivedColor = Color.WHITE;
        }
        else {
          if ( photon.wasWhite ) {
            newPerceivedColor = photon.color;
          }
          else {
            newPerceivedColor = photon.color.withAlpha( photon.intensity );
          }
        }

        // don't update the lastPhotonColor unless it is different than before, for performance reasons
        // and don't bother to update the color if the view is on beam mode
        if ( !this.model.lastPhotonColorProperty.value.equals( newPerceivedColor ) && this.model.beamTypeProperty.value === 'photon' ) {

          // if the photon was white, the perceived color keeps full intensity even when it passes the filter,
          // otherwise it takes the intensity of the photon, which may have been partially filtered
          this.model.lastPhotonColorProperty.value = ( photon.wasWhite ) ? newPerceivedColor.withAlpha( 1 ) : newPerceivedColor;
        }

        this.photons[ j ].dispose();
        this.photons.splice( j, 1 ); // remove jth photon from list
      }
    }

    // emit a black photon for resetting the perceived color to black if no more photons passing through the filter.
    // this takes care of the case when no photons pass through the filter
    if ( probability === 0 && this.model.filterVisibleProperty.value ) {
      const blackPhoton = new SingleBulbPhoton(
        new Vector2( this.filterOffset, ColorVisionConstants.BEAM_HEIGHT / 2 ),
        new Vector2( ColorVisionConstants.X_VELOCITY, 0 ),
        1,
        BLACK_ALPHA_0,
        false,
        undefined
      );
      blackPhoton.passedFilter = true;
      this.photons.push( blackPhoton );
    }

    // emit a black photon for resetting the perceived color to black if the flashlight is off
    if ( !this.model.flashlightOnProperty.value ) {
      this.photons.push( new SingleBulbPhoton(
        new Vector2( this.beamLength, ColorVisionConstants.BEAM_HEIGHT / 2 ),
        new Vector2( ColorVisionConstants.X_VELOCITY, 0 ),
        1,
        BLACK_ALPHA_0,
        false,
        undefined
      ) );
    }
  }

  // @public
  createPhoton( timeElapsed ) {

    // if the flashlight is on, create a new photon this animation frame
    if ( this.model.flashlightOnProperty.value ) {
      const newColor = ( this.model.lightTypeProperty.value === 'white' ) ?
                       randomVisibleColor() :
                       VisibleColor.wavelengthToColor( this.model.flashlightWavelengthProperty.value );

      const x = this.beamLength + ColorVisionConstants.X_VELOCITY * timeElapsed;
      const yVelocity = ( dotRandom.nextDouble() * ColorVisionConstants.FAN_FACTOR - ( ColorVisionConstants.FAN_FACTOR / 2 ) ) * 60;

      const initialY = yVelocity * ( 25 / 60 ) + ( ColorVisionConstants.BEAM_HEIGHT / 2 );
      const deltaY = yVelocity * timeElapsed;
      const y = initialY + deltaY;

      this.photons.push( new SingleBulbPhoton(
        new Vector2( x, y ),
        new Vector2( ColorVisionConstants.X_VELOCITY, yVelocity ),
        1,
        newColor,
        this.model.lightTypeProperty.value === 'white',
        this.model.flashlightWavelengthProperty.value
      ) );
    }
  }

  // @public
  reset() {
    // set all photons to be out of bounds to trigger empty redraw
    for ( let i = 0; i < this.photons.length; i++ ) {
      this.photons[ i ].position.x = 0;
    }
  }
}

/**
 * Gets a random visible Color. This is used to generate random photon colors when the light source is white light.
 * @returns {Color}
 */
function randomVisibleColor() {
  const randomWavelength = dotRandom.nextIntBetween( VisibleColor.MIN_WAVELENGTH, VisibleColor.MAX_WAVELENGTH );
  return VisibleColor.wavelengthToColor( randomWavelength );
}

SingleBulbPhotonBeam.SingleBulbPhotonBeamIO = new IOType( 'SingleBulbPhotonBeamIO', {
  valueType: SingleBulbPhotonBeam,
  documentation: 'The Beam on the single bulb screen.'
} );

colorVision.register( 'SingleBulbPhotonBeam', SingleBulbPhotonBeam );
export default SingleBulbPhotonBeam;
