// Copyright 2014-2022, University of Colorado Boulder

/**
 * The 'Balance Lab' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import labIcon_png from '../../images/labIcon_png.js';
import labIconSmall_png from '../../images/labIconSmall_png.js';
import balancingAct from '../balancingAct.js';
import BalancingActStrings from '../BalancingActStrings.js';
import BalanceLabModel from './model/BalanceLabModel.js';
import BalanceLabScreenView from './view/BalanceLabScreenView.js';

class BalanceLabScreen extends Screen {

  constructor( tandem ) {

    const options = {
      name: BalancingActStrings.balanceLabStringProperty,
      homeScreenIcon: new ScreenIcon( new Image( labIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new Image( labIconSmall_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new BalanceLabModel( tandem.createTandem( 'model' ) ),
      model => new BalanceLabScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

balancingAct.register( 'BalanceLabScreen', BalanceLabScreen );
export default BalanceLabScreen;