// Copyright 2014-2022, University of Colorado Boulder

/**
 * The 'Single Bulb' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import colorVision from '../colorVision.js';
import ColorVisionStrings from '../ColorVisionStrings.js';
import ColorVisionConstants from '../common/ColorVisionConstants.js';
import SingleBulbModel from './model/SingleBulbModel.js';
import SingleBulbIconNode from './view/SingleBulbIconNode.js';
import SingleBulbScreenView from './view/SingleBulbScreenView.js';

class SingleBulbScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: ColorVisionStrings.SingleBulbModule.titleStringProperty,
      backgroundColorProperty: new Property( 'black' ),
      homeScreenIcon: new ScreenIcon( new SingleBulbIconNode( ColorVisionConstants.HOME_SCREEN_ICON_OPTIONS ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new SingleBulbIconNode( ColorVisionConstants.HOME_SCREEN_ICON_OPTIONS ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      showUnselectedHomeScreenIconFrame: true,
      tandem: tandem
    };

    super(
      () => new SingleBulbModel( tandem.createTandem( 'model' ) ),
      model => new SingleBulbScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

colorVision.register( 'SingleBulbScreen', SingleBulbScreen );
export default SingleBulbScreen;