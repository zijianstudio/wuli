// Copyright 2022, University of Colorado Boulder

/**
 *
 * Dynamic Icon for the Intro Screen, dependent on the character preferences.
 *
 * @author Agustín Vallejo
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import { Image } from '../../../../scenery/js/imports.js';
import playgroundScreenIcon_png from '../../../images/playgroundScreenIcon_png.js';
import dog_right_png from '../../../images/dog_right_png.js';
import energySkatePark from '../../energySkatePark.js';

class PlaygroundScreenIcon extends ScreenIcon {

  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param {Object} providedOptions
   */
  constructor( preferencesModel, providedOptions = {} ) {

    const background = new Image( playgroundScreenIcon_png );

    let skater;

    preferencesModel.skaterCharacterSetProperty.link( character => {

      // image8 is one of the animals in the set, for fun in the playground
      skater = character ? new Image( character.imageSet8.rightImage ) : new Image( dog_right_png );

      // Translate, scale and rotate to the desired position
      const transformMatrix = Matrix3.translation( 375, 110 );
      transformMatrix.multiplyMatrix( Matrix3.rotation2( -2 * Math.PI / 3 ) );
      transformMatrix.multiplyMatrix( Matrix3.scaling( 0.5 ) );
      transformMatrix.multiplyMatrix( Matrix3.translation( -skater.width / 2, -skater.height ) );

      skater.setMatrix( transformMatrix );
      background.children = [ skater ];
    } );

    super( background, providedOptions );
  }
}

energySkatePark.register( 'PlaygroundScreenIcon', PlaygroundScreenIcon );
export default PlaygroundScreenIcon;