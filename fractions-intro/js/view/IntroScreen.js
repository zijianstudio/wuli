// Copyright 2017-2022, University of Colorado Boulder

/**
 * Intro screen for Fractions: Intro
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import FractionsCommonColors from '../../../fractions-common/js/common/view/FractionsCommonColors.js';
import IntroModel from '../../../fractions-common/js/intro/model/IntroModel.js';
import IntroScreenView from '../../../fractions-common/js/intro/view/IntroScreenView.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import fractionsIntro from '../fractionsIntro.js';
import FractionsIntroStrings from '../FractionsIntroStrings.js';

class IntroScreen extends Screen {
  constructor() {
    super(
      () => new IntroModel( false ),
      model => new IntroScreenView( model ),
      {
        name: FractionsIntroStrings.screen.introStringProperty,
        backgroundColorProperty: FractionsCommonColors.introScreenBackgroundProperty,
        homeScreenIcon: new ScreenIcon( IntroScreenView.createUnmixedScreenIcon(), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } ),
        navigationBarIcon: new ScreenIcon( IntroScreenView.createUnmixedScreenThumbnail(), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } )
      }
    );
  }
}

fractionsIntro.register( 'IntroScreen', IntroScreen );
export default IntroScreen;