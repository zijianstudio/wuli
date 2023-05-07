// Copyright 2016-2021, University of Colorado Boulder

/**
 * The 'Blast' screen.
 *
 * @author John Blanco
 */

import Screen from '../../../joist/js/Screen.js';
import merge from '../../../phet-core/js/merge.js';
import blast from '../blast.js';
import BlastModel from './model/BlastModel.js';
import BlastScreenView from './view/BlastScreenView.js';

class BlastScreen extends Screen {

  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( tandem, options ) {

    options = merge( {
      particleColor: 'black',
      tandem: tandem
    }, options );

    super(
      () => new BlastModel( tandem.createTandem( 'model' ) ),
      model => new BlastScreenView( model, options.particleColor, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

blast.register( 'BlastScreen', BlastScreen );
export default BlastScreen;