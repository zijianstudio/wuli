// Copyright 2018-2022, University of Colorado Boulder

/**
 * The "Game" screen in "Area Model: Algebra"
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import variablesGameScreenIcon_png from '../../mipmaps/variablesGameScreenIcon_png.js';
import variablesGameScreenNavbar_png from '../../mipmaps/variablesGameScreenNavbar_png.js';
import areaModelCommon from '../areaModelCommon.js';
import AreaModelCommonStrings from '../AreaModelCommonStrings.js';
import AreaModelCommonColors from '../common/view/AreaModelCommonColors.js';
import VariablesGameAreaModel from '../game/model/VariablesGameAreaModel.js';
import GameAreaScreenView from '../game/view/GameAreaScreenView.js';

class VariablesGameScreen extends Screen {
  constructor() {

    const options = {
      name: AreaModelCommonStrings.screen.gameStringProperty,
      backgroundColorProperty: AreaModelCommonColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon( new Image( variablesGameScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new Image( variablesGameScreenNavbar_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } )
    };

    super(
      () => new VariablesGameAreaModel(),
      model => new GameAreaScreenView( model ),
      options
    );
  }
}

areaModelCommon.register( 'VariablesGameScreen', VariablesGameScreen );
export default VariablesGameScreen;