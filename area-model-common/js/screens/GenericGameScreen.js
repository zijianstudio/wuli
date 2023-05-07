// Copyright 2018-2022, University of Colorado Boulder

/**
 * The "Game" screen in "Area Model: Multiplication"
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import genericGameScreenIcon_png from '../../mipmaps/genericGameScreenIcon_png.js';
import genericGameScreenNavbar_png from '../../mipmaps/genericGameScreenNavbar_png.js';
import areaModelCommon from '../areaModelCommon.js';
import AreaModelCommonStrings from '../AreaModelCommonStrings.js';
import AreaModelCommonColors from '../common/view/AreaModelCommonColors.js';
import GenericGameAreaModel from '../game/model/GenericGameAreaModel.js';
import GameAreaScreenView from '../game/view/GameAreaScreenView.js';

class GenericGameScreen extends Screen {
  constructor() {

    const options = {
      name: AreaModelCommonStrings.screen.gameStringProperty,
      backgroundColorProperty: AreaModelCommonColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon( new Image( genericGameScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new Image( genericGameScreenNavbar_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } )
    };

    super(
      () => new GenericGameAreaModel(),
      model => new GameAreaScreenView( model ),
      options
    );
  }
}

areaModelCommon.register( 'GenericGameScreen', GenericGameScreen );
export default GenericGameScreen;