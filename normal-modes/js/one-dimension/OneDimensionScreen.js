// Copyright 2020-2022, University of Colorado Boulder

/**
 * The 'One Dimension' screen.
 *
 * @author Franco Barpp Gomes (UTFPR)
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import NormalModesColors from '../common/NormalModesColors.js';
import NormalModesIconFactory from '../common/view/NormalModesIconFactory.js';
import normalModes from '../normalModes.js';
import NormalModesStrings from '../NormalModesStrings.js';
import OneDimensionModel from './model/OneDimensionModel.js';
import OneDimensionScreenView from './view/OneDimensionScreenView.js';

class OneDimensionScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: NormalModesStrings.screen.oneDimensionStringProperty,
      backgroundColorProperty: new Property( NormalModesColors.SCREEN_BACKGROUND ),
      homeScreenIcon: NormalModesIconFactory.createOneDimensionScreenIcon(),
      tandem: tandem
    };

    super(
      () => new OneDimensionModel( { tandem: tandem.createTandem( 'model' ) } ),
      model => new OneDimensionScreenView( model, { tandem: tandem.createTandem( 'view' ) } ),
      options
    );
  }
}

normalModes.register( 'OneDimensionScreen', OneDimensionScreen );
export default OneDimensionScreen;