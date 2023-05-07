// Copyright 2017-2022, University of Colorado Boulder

/**
 * Game screen for Fractions: Intro
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import FractionsCommonColors from '../../../fractions-common/js/common/view/FractionsCommonColors.js';
import BuildingGameModel from '../../../fractions-common/js/game/model/BuildingGameModel.js';
import BuildingGameScreenView from '../../../fractions-common/js/game/view/BuildingGameScreenView.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import fractionsIntro from '../fractionsIntro.js';
import FractionsIntroStrings from '../FractionsIntroStrings.js';

class GameScreen extends Screen {
  constructor() {
    super(
      () => new BuildingGameModel( false ),
      model => new BuildingGameScreenView( model ),
      {
        name: FractionsIntroStrings.screen.gameStringProperty,
        backgroundColorProperty: FractionsCommonColors.otherScreenBackgroundProperty,
        homeScreenIcon: new ScreenIcon( BuildingGameScreenView.createUnmixedScreenIcon(), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } )
      }
    );
  }
}

fractionsIntro.register( 'GameScreen', GameScreen );
export default GameScreen;