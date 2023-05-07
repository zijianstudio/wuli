// Copyright 2020-2022, University of Colorado Boulder

/**
 * the 'Generic' screen in the Number Line: Distance simulation
 *
 * @author Saurabh Totey
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import genericHomeIcon_png from '../../images/genericHomeIcon_png.js';
import genericNavbarIcon_png from '../../images/genericNavbarIcon_png.js';
import NLDColors from '../common/NLDColors.js';
import numberLineDistance from '../numberLineDistance.js';
import NumberLineDistanceStrings from '../NumberLineDistanceStrings.js';
import NLDGenericModel from './model/NLDGenericModel.js';
import NLDGenericScreenView from './view/NLDGenericScreenView.js';

class NLDGenericScreen extends Screen {

  /**
   * @param {Tandem} tandem
   * @public
   */
  constructor( tandem ) {
    const options = {
      name: NumberLineDistanceStrings.screen.genericStringProperty,
      backgroundColorProperty: NLDColors.genericScreenBackgroundColorProperty,
      homeScreenIcon: new ScreenIcon( new Image( genericHomeIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new Image( genericNavbarIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new NLDGenericModel( tandem.createTandem( 'model' ) ),
      model => new NLDGenericScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }

}

numberLineDistance.register( 'NLDGenericScreen', NLDGenericScreen );
export default NLDGenericScreen;
