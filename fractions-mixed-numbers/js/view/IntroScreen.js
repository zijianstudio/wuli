// Copyright 2018-2022, University of Colorado Boulder

/**
 * Intro screen for Fractions: Mixed Numbers
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import FractionsCommonColors from '../../../fractions-common/js/common/view/FractionsCommonColors.js';
import IntroModel from '../../../fractions-common/js/intro/model/IntroModel.js';
import IntroScreenView from '../../../fractions-common/js/intro/view/IntroScreenView.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import fractionsMixedNumbers from '../fractionsMixedNumbers.js';
import FractionsMixedNumbersStrings from '../FractionsMixedNumbersStrings.js';

class IntroScreen extends Screen {
  constructor() {
    super(
      () => new IntroModel( true ),
      model => new IntroScreenView( model ),
      {
        name: FractionsMixedNumbersStrings.screen.introStringProperty,
        backgroundColorProperty: FractionsCommonColors.introScreenBackgroundProperty,
        homeScreenIcon: new ScreenIcon( IntroScreenView.createMixedScreenIcon(), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } ),
        navigationBarIcon: new ScreenIcon( IntroScreenView.createMixedScreenThumbnail(), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } )
      }
    );
  }
}

fractionsMixedNumbers.register( 'IntroScreen', IntroScreen );
export default IntroScreen;