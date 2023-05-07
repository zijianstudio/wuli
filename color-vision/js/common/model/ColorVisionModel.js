// Copyright 2017-2020, University of Colorado Boulder

/**
 * Base type for the model in both screens.
 * See https://github.com/phetsims/color-vision/issues/117
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @abstract
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import colorVision from '../../colorVision.js';

class ColorVisionModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // @public {Property.<boolean>} is the model running?
    this.playingProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'playingProperty' )
    } );

    // @public {Property.<string>} which head view to show
    this.headModeProperty = new StringProperty( 'no-brain', {
      validValues: [ 'brain', 'no-brain' ],
      tandem: tandem.createTandem( 'headModeProperty' )
    } );

    // @public {DerivedProperty.<Color|string>}
    // the color perceived by the viewer, must be defined by the subtype.
    this.perceivedColorProperty = null;
  }


  // @public
  reset() {
    this.playingProperty.reset();
    this.headModeProperty.reset();
  }

  // @public @abstract
  // step one frame, assuming 60fps
  manualStep() {
    throw new Error( 'must be defined by subtype' );
  }
}

colorVision.register( 'ColorVisionModel', ColorVisionModel );

export default ColorVisionModel;