// Copyright 2022, University of Colorado Boulder

/**
 *
 * Dynamic Icon for the Intro Screen, dependent on the character preferences.
 *
 * @author Agustín Vallejo
 */

import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import { Image } from '../../../../scenery/js/imports.js';
import introScreenIcon_png from '../../../images/introScreenIcon_png.js';
import skater1_set1_right_png from '../../../images/skater1_set1_right_png.js';
import energySkatePark from '../../energySkatePark.js';

class IntroScreenIcon extends ScreenIcon {

  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param {Object} providedOptions
   */
  constructor( preferencesModel, providedOptions = {} ) {

    const background = new Image( introScreenIcon_png );

    let skater;

    preferencesModel.skaterCharacterSetProperty.link( character => {
      skater = character ? new Image( character.imageSet1.rightImage ) : new Image( skater1_set1_right_png );

      // Translate, scale and rotate to the desired position
      const transformMatrix = Matrix3.translation( 95, 150 );
      transformMatrix.multiplyMatrix( Matrix3.rotation2( 1.1 * Math.PI / 3 ) );
      transformMatrix.multiplyMatrix( Matrix3.scaling( 0.5 ) );
      transformMatrix.multiplyMatrix( Matrix3.translation( -skater.width / 2, -skater.height ) );

      skater.setMatrix( transformMatrix );
      background.children = [ skater ];
    } );

    super( background, providedOptions );
  }
}

energySkatePark.register( 'IntroScreenIcon', IntroScreenIcon );
export default IntroScreenIcon;