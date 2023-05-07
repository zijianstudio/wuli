// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import genericHomeScreenIcon_png from '../../images/genericHomeScreenIcon_png.js';
import numberLineOperations from '../numberLineOperations.js';
import NumberLineOperationsStrings from '../NumberLineOperationsStrings.js';
import NLOGenericModel from './model/NLOGenericModel.js';
import NLOGenericScreenView from './view/NLOGenericScreenView.js';

class NLOGenericScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: NumberLineOperationsStrings.screen.genericStringProperty,
      backgroundColorProperty: new Property( '#f3fffe' ),
      homeScreenIcon: new ScreenIcon( new Image( genericHomeScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new NLOGenericModel( tandem.createTandem( 'model' ) ),
      model => new NLOGenericScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

numberLineOperations.register( 'NLOGenericScreen', NLOGenericScreen );
export default NLOGenericScreen;