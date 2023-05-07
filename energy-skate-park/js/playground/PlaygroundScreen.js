// Copyright 2018-2022, University of Colorado Boulder

/**
 * The "Lab" screen. No premade tracks. More open space for the user to play with custom tracks.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import energySkatePark from '../energySkatePark.js';
import EnergySkateParkStrings from '../EnergySkateParkStrings.js';
import EnergySkateParkPlaygroundModel from './model/EnergySkateParkPlaygroundModel.js';
import EnergySkateParkPlaygroundScreenView from './view/EnergySkateParkPlaygroundScreenView.js';
import PlaygroundScreenIcon from './view/PlaygroundScreenIcon.js';

class PlaygroundScreen extends Screen {

  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param {Tandem} tandem
   */
  constructor( preferencesModel, tandem ) {

    const options = {
      name: EnergySkateParkStrings.screens.playgroundStringProperty,
      homeScreenIcon: new PlaygroundScreenIcon( preferencesModel, {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new EnergySkateParkPlaygroundModel( preferencesModel, tandem.createTandem( 'model' ) ),
      model => new EnergySkateParkPlaygroundScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

energySkatePark.register( 'PlaygroundScreen', PlaygroundScreen );
export default PlaygroundScreen;