// Copyright 2018-2022, University of Colorado Boulder

/**
 * The mixed-numbers game screen for Build a Fraction
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import FractionsCommonColors from '../../../fractions-common/js/common/view/FractionsCommonColors.js';
import BuildingGameModel from '../../../fractions-common/js/game/model/BuildingGameModel.js';
import BuildingGameScreenView from '../../../fractions-common/js/game/view/BuildingGameScreenView.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import buildAFraction from '../buildAFraction.js';
import BuildAFractionStrings from '../BuildAFractionStrings.js';

class MixedNumbersScreen extends Screen {
  constructor() {
    super(
      () => new BuildingGameModel( true ),
      model => new BuildingGameScreenView( model ),
      {
        name: BuildAFractionStrings.screen.mixedNumbersStringProperty,
        backgroundColorProperty: FractionsCommonColors.otherScreenBackgroundProperty,
        homeScreenIcon: new ScreenIcon( BuildingGameScreenView.createMixedScreenIcon(), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } )
      }
    );
  }
}

buildAFraction.register( 'MixedNumbersScreen', MixedNumbersScreen );
export default MixedNumbersScreen;