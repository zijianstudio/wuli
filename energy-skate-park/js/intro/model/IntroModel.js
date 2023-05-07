// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import EnergySkateParkFullTrackSetModel from '../../common/model/EnergySkateParkFullTrackSetModel.js';
import energySkatePark from '../../energySkatePark.js';

class IntroModel extends EnergySkateParkFullTrackSetModel {

  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param tandem
   */
  constructor( preferencesModel, tandem ) {
    super( preferencesModel, tandem, {

      // by default the Intro screen does not save samples
      defaultSaveSamples: false
    } );

    // attach listeners that clear skater path when Properties like direction and dragging change
    this.attachPathRemovalListeners();
  }
}

energySkatePark.register( 'IntroModel', IntroModel );

export default IntroModel;
