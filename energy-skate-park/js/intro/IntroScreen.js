// Copyright 2018-2022, University of Colorado Boulder

/**
 * The "Intro" screen.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import energySkatePark from '../energySkatePark.js';
import EnergySkateParkStrings from '../EnergySkateParkStrings.js';
import IntroModel from './model/IntroModel.js';
import IntroScreenIcon from './view/IntroScreenIcon.js';
import IntroScreenView from './view/IntroScreenView.js';

class IntroScreen extends Screen {

  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param {Tandem} tandem
   */
  constructor( preferencesModel, tandem ) {
    const options = {
      name: EnergySkateParkStrings.screens.introStringProperty,
      tandem: tandem,
      homeScreenIcon: new IntroScreenIcon( preferencesModel, {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } )
    };

    super(
      () => new IntroModel( preferencesModel, tandem.createTandem( 'model' ) ),
      model => new IntroScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );

  }
}

energySkatePark.register( 'IntroScreen', IntroScreen );
export default IntroScreen;