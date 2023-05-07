// Copyright 2014-2022, University of Colorado Boulder

/**
 * The 'Intro' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import introIcon_png from '../../images/introIcon_png.js';
import introIconSmall_png from '../../images/introIconSmall_png.js';
import balancingAct from '../balancingAct.js';
import BalancingActStrings from '../BalancingActStrings.js';
import BAIntroModel from './model/BAIntroModel.js';
import BAIntroView from './view/BAIntroView.js';

class BAIntroScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: BalancingActStrings.introStringProperty,
      homeScreenIcon: new ScreenIcon( new Image( introIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new Image( introIconSmall_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new BAIntroModel( tandem.createTandem( 'model' ) ),
      model => new BAIntroView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

balancingAct.register( 'BAIntroScreen', BAIntroScreen );
export default BAIntroScreen;