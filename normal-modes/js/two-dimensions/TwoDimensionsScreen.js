// Copyright 2020-2022, University of Colorado Boulder

/**
 * The 'Two Dimemsions' Screen.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 * @author Franco Barpp Gomes (UTFPR)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import NormalModesColors from '../common/NormalModesColors.js';
import NormalModesIconFactory from '../common/view/NormalModesIconFactory.js';
import normalModes from '../normalModes.js';
import NormalModesStrings from '../NormalModesStrings.js';
import TwoDimensionsModel from './model/TwoDimensionsModel.js';
import TwoDimensionsScreenView from './view/TwoDimensionsScreenView.js';

class TwoDimensionsScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: NormalModesStrings.screen.twoDimensionsStringProperty,
      backgroundColorProperty: new Property( NormalModesColors.SCREEN_BACKGROUND ),
      homeScreenIcon: NormalModesIconFactory.createTwoDimensionsScreenIcon(),
      tandem: tandem
    };

    super(
      () => new TwoDimensionsModel( { tandem: tandem.createTandem( 'model' ) } ),
      model => new TwoDimensionsScreenView( model, { tandem: tandem.createTandem( 'view' ) } ),
      options
    );
  }
}

normalModes.register( 'TwoDimensionsScreen', TwoDimensionsScreen );
export default TwoDimensionsScreen;