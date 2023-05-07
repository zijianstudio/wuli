// Copyright 2018-2022, University of Colorado Boulder

/**
 * A model for track sets in Energy Skate Park "Full", which has a parabola, slope, loop, and double well tracks.
 * Tracks are not draggable, and may support friction.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkTrackSetModel from './EnergySkateParkTrackSetModel.js';

class EnergySkateParkFullTrackSetModel extends EnergySkateParkTrackSetModel {

  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( preferencesModel, tandem, options ) {
    super( preferencesModel, tandem, options );
  }
}

energySkatePark.register( 'EnergySkateParkFullTrackSetModel', EnergySkateParkFullTrackSetModel );
export default EnergySkateParkFullTrackSetModel;