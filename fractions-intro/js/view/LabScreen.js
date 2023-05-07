// Copyright 2017-2022, University of Colorado Boulder

/**
 * Lab screen for Fractions: Intro
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import FractionsCommonColors from '../../../fractions-common/js/common/view/FractionsCommonColors.js';
import BuildingLabModel from '../../../fractions-common/js/lab/model/BuildingLabModel.js';
import BuildingLabScreenView from '../../../fractions-common/js/lab/view/BuildingLabScreenView.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import fractionsIntro from '../fractionsIntro.js';
import FractionsIntroStrings from '../FractionsIntroStrings.js';

class LabScreen extends Screen {
  constructor() {
    super(
      () => new BuildingLabModel( false ),
      model => new BuildingLabScreenView( model ),
      {
        name: FractionsIntroStrings.screen.labStringProperty,
        backgroundColorProperty: FractionsCommonColors.otherScreenBackgroundProperty,
        homeScreenIcon: new ScreenIcon( BuildingLabScreenView.createUnmixedScreenIcon(), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } )
      }
    );
  }
}

fractionsIntro.register( 'LabScreen', LabScreen );
export default LabScreen;