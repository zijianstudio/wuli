// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import chipsHomeScreenIcon_png from '../../images/chipsHomeScreenIcon_png.js';
import numberLineOperations from '../numberLineOperations.js';
import NumberLineOperationsStrings from '../NumberLineOperationsStrings.js';
import NLOChipsModel from './model/NLOChipsModel.js';
import NLOChipsScreenView from './view/NLOChipsScreenView.js';

class NLOChipsScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: NumberLineOperationsStrings.screen.chipsStringProperty,
      backgroundColorProperty: new Property( '#f8f6fe' ),
      homeScreenIcon: new ScreenIcon( new Image( chipsHomeScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new NLOChipsModel( tandem.createTandem( 'model' ) ),
      model => new NLOChipsScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

numberLineOperations.register( 'NLOChipsScreen', NLOChipsScreen );
export default NLOChipsScreen;