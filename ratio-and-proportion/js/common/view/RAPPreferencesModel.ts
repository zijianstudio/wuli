// Copyright 2022, University of Colorado Boulder

/**
 * Options used by the sim that the user can change in the Preferences Dialog.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import PreferencesModel, { PreferencesModelOptions } from '../../../../joist/js/preferences/PreferencesModel.js';
import MediaPipe from '../../../../tangible/js/mediaPipe/MediaPipe.js';
import MediaPipeQueryParameters from '../../../../tangible/js/mediaPipe/MediaPipeQueryParameters.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class RAPPreferencesModel extends PreferencesModel {

  public constructor() {
    const options: PreferencesModelOptions = { inputOptions: {} };
    if ( MediaPipeQueryParameters.cameraInput === 'hands' ) {
      options.inputOptions!.customPreferences = [ { createContent: () => MediaPipe.getMediaPipeOptionsNode() } ];
    }
    super( options );
  }
}

ratioAndProportion.register( 'RAPPreferencesModel', RAPPreferencesModel );
export default RAPPreferencesModel;