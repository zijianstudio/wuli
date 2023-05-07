// Copyright 2014-2022, University of Colorado Boulder

/**
 * The 'RGB' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import colorVision from '../colorVision.js';
import ColorVisionStrings from '../ColorVisionStrings.js';
import ColorVisionConstants from '../common/ColorVisionConstants.js';
import RGBModel from './model/RGBModel.js';
import RGBIconNode from './view/RGBIconNode.js';
import RGBScreenView from './view/RGBScreenView.js';

class RGBScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: ColorVisionStrings.RgbBulbsModule.titleStringProperty,
      backgroundColorProperty: new Property( 'black' ),
      homeScreenIcon: new ScreenIcon( new RGBIconNode( ColorVisionConstants.HOME_SCREEN_ICON_OPTIONS ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new RGBIconNode( ColorVisionConstants.HOME_SCREEN_ICON_OPTIONS ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      showUnselectedHomeScreenIconFrame: true,
      tandem: tandem
    };

    super(
      () => new RGBModel( tandem.createTandem( 'model' ) ),
      model => new RGBScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

colorVision.register( 'RGBScreen', RGBScreen );
export default RGBScreen;