// Copyright 2018-2022, University of Colorado Boulder

/**
 * Game screen for Fractions: Mixed Numbers
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import FractionsCommonColors from '../../../fractions-common/js/common/view/FractionsCommonColors.js';
import BuildingGameModel from '../../../fractions-common/js/game/model/BuildingGameModel.js';
import BuildingGameScreenView from '../../../fractions-common/js/game/view/BuildingGameScreenView.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import fractionsMixedNumbers from '../fractionsMixedNumbers.js';
import FractionsMixedNumbersStrings from '../FractionsMixedNumbersStrings.js';

class GameScreen extends Screen {
  constructor() {
    super(
      () => new BuildingGameModel( true ),
      model => new BuildingGameScreenView( model ),
      {
        name: FractionsMixedNumbersStrings.screen.gameStringProperty,
        backgroundColorProperty: FractionsCommonColors.otherScreenBackgroundProperty,
        homeScreenIcon: new ScreenIcon( BuildingGameScreenView.createMixedScreenIcon(), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } )
      }
    );
  }
}

fractionsMixedNumbers.register( 'GameScreen', GameScreen );
export default GameScreen;