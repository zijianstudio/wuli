// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import operationsHomeScreenIcon_png from '../../images/operationsHomeScreenIcon_png.js';
import numberLineOperations from '../numberLineOperations.js';
import NumberLineOperationsStrings from '../NumberLineOperationsStrings.js';
import NLOOperationsModel from './model/NLOOperationsModel.js';
import NLOOperationsScreenView from './view/NLOOperationsScreenView.js';

class NLOOperationsScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: NumberLineOperationsStrings.screen.operationsStringProperty,
      backgroundColorProperty: new Property( '#fffef3' ),
      homeScreenIcon: new ScreenIcon( new Image( operationsHomeScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new NLOOperationsModel( tandem.createTandem( 'model' ) ),
      model => new NLOOperationsScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

numberLineOperations.register( 'NLOOperationsScreen', NLOOperationsScreen );
export default NLOOperationsScreen;