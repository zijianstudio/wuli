// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model for 'Single Bulb' screen
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Range from '../../../../dot/js/Range.js';
import EventTimer from '../../../../phet-core/js/EventTimer.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import { Color } from '../../../../scenery/js/imports.js';
import colorVision from '../../colorVision.js';
import ColorVisionModel from '../../common/model/ColorVisionModel.js';
import SingleBulbConstants from '../SingleBulbConstants.js';
import SingleBulbPhotonBeam from './SingleBulbPhotonBeam.js';

class SingleBulbModel extends ColorVisionModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( tandem );

    const flashlightTandem = tandem.createTandem( 'flashlight' );
    const filterTandem = tandem.createTandem( 'filter' );

    // @public {Property.<string>} kind of light in the beam
    // TODO: Why not an enum?
    this.lightTypeProperty = new StringProperty( 'colored', {
      validValues: [ 'white', 'colored' ],
      tandem: tandem.createTandem( 'lightTypeProperty' )
    } );

    // @public {Property.<string>} indicates solid beam vs individual photons
    this.beamTypeProperty = new StringProperty( 'beam', {
      validValues: [ 'beam', 'photon' ],
      tandem: tandem.createTandem( 'beamTypeProperty' )
    } );

    // @public {Property.<number>} in units of nm, default wavelength is yellow
    this.flashlightWavelengthProperty = new NumberProperty( 570, {
      tandem: flashlightTandem.createTandem( 'flashlightWavelengthProperty' ),
      units: 'nm',
      range: new Range( VisibleColor.MIN_WAVELENGTH, VisibleColor.MAX_WAVELENGTH )
    } );

    // @public {Property.<number>} in units of nm, default wavelength is yellow
    this.filterWavelengthProperty = new NumberProperty( 570, {
      tandem: filterTandem.createTandem( 'filterWavelengthProperty' ),
      units: 'nm',
      range: new Range( VisibleColor.MIN_WAVELENGTH, VisibleColor.MAX_WAVELENGTH )
    } );

    // @public {Property.<boolean>} is the flashlight on?
    this.flashlightOnProperty = new BooleanProperty( false, {
      tandem: flashlightTandem.createTandem( 'flashlightOnProperty' )
    } );

    // @public {Property.<boolean>} is the filter on?
    this.filterVisibleProperty = new BooleanProperty( false, {
      tandem: filterTandem.createTandem( 'filterVisibleProperty' )
    } );

    // @public {Property.<Color|string>} keep track of the last photon to hit the eye,
    // for use in calculating the perceived color
    this.lastPhotonColorProperty = new Property( new Color( 0, 0, 0, 0 ) );

    // @public {DerivedProperty.<Color|string>} the color perceived by the person depends on almost every property
    this.perceivedColorProperty = new DerivedProperty( [
        this.flashlightWavelengthProperty,
        this.filterWavelengthProperty,
        this.flashlightOnProperty,
        this.filterVisibleProperty,
        this.lightTypeProperty,
        this.beamTypeProperty,
        this.lastPhotonColorProperty
      ],
      ( flashlightWavelength, filterWavelength, flashlightOn, filterVisible, lightType, beamType, lastPhotonColor ) => {

        // If the beam is in photon mode, return the color of the last photon to hit the eye.
        // The logic for handling all of the cases where the beam is in photon mode is in the file
        // SingleBulbPhotonBeam, where lastPhotonColor is set.
        if ( beamType === 'photon' ) {
          return lastPhotonColor;
        }
        // if flashlight is not on, the perceived color is black
        else if ( !flashlightOn ) {
          return Color.BLACK;
        }
        // if the filter is visible, and the beam type is colored, calculate the percentage of color to pass
        else if ( filterVisible && lightType === 'colored' ) {
          let alpha; // the new alpha value for the color, proportional to the percentage of light to pass through the filter
          const halfWidth = SingleBulbConstants.GAUSSIAN_WIDTH / 2;

          // If the flashlightWavelength is outside the transmission width, no color passes.
          if ( flashlightWavelength < filterWavelength - halfWidth || flashlightWavelength > filterWavelength + halfWidth ) {
            alpha = 0;
          }
          // flashlightWavelength is within the transmission width, pass a linear percentage.
          else {
            alpha = 1 - Math.abs( filterWavelength - flashlightWavelength ) / halfWidth;
          }
          return VisibleColor.wavelengthToColor( flashlightWavelength ).withAlpha( alpha );
        }
        // if the filter is visible, and the beam is white, return the filter wavelength's color
        else if ( filterVisible && lightType === 'white' ) {
          return VisibleColor.wavelengthToColor( filterWavelength );
        }
        // if the beam is white and the filter is not visible, return white
        else if ( !filterVisible && lightType === 'white' ) {
          return Color.WHITE;
        }
        // if the filter is not visible, return the flashlight wavelength's color
        else {
          return VisibleColor.wavelengthToColor( flashlightWavelength );
        }
      }, {
        tandem: tandem.createTandem( 'perceivedColorProperty' ),
        phetioValueType: Color.ColorIO
      } );

    // @public
    this.photonBeam = new SingleBulbPhotonBeam( this, SingleBulbConstants.SINGLE_BEAM_LENGTH, {
      tandem: tandem.createTandem( 'photonBeam' )
    } );


    // create a new photon every 1/120 seconds
    // @private
    this.eventTimer = new EventTimer( new EventTimer.ConstantEventModel( 120 ), timeElapsed => {
      this.photonBeam.createPhoton( timeElapsed );
    } );
  }


  // @public
  step( dt ) {

    // Cap dt, see https://github.com/phetsims/color-vision/issues/115 and https://github.com/phetsims/joist/issues/130
    dt = Math.min( dt, 0.5 );

    if ( this.playingProperty.value ) {
      this.photonBeam.updateAnimationFrame( dt );
      this.eventTimer.step( dt );
    }
  }

  // @public @override
  // step one frame, assuming 60fps
  manualStep() {
    this.photonBeam.updateAnimationFrame( 1 / 60 );
    this.eventTimer.step( 1 / 60 );
  }

  // @public @override
  reset() {

    super.reset();

    this.lightTypeProperty.reset();
    this.beamTypeProperty.reset();
    this.flashlightWavelengthProperty.reset();
    this.filterWavelengthProperty.reset();
    this.flashlightOnProperty.reset();
    this.filterVisibleProperty.reset();
    this.lastPhotonColorProperty.reset();

    this.photonBeam.reset();
  }
}

colorVision.register( 'SingleBulbModel', SingleBulbModel );

export default SingleBulbModel;