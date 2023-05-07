// Copyright 2018-2022, University of Colorado Boulder

/**
 * Lab screen for Fractions: Mixed Numbers
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import FractionsCommonColors from '../../../fractions-common/js/common/view/FractionsCommonColors.js';
import BuildingLabModel from '../../../fractions-common/js/lab/model/BuildingLabModel.js';
import BuildingLabScreenView from '../../../fractions-common/js/lab/view/BuildingLabScreenView.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import fractionsMixedNumbers from '../fractionsMixedNumbers.js';
import FractionsMixedNumbersStrings from '../FractionsMixedNumbersStrings.js';

class LabScreen extends Screen {
  constructor() {
    super(
      () => new BuildingLabModel( true ),
      model => new BuildingLabScreenView( model ),
      {
        name: FractionsMixedNumbersStrings.screen.labStringProperty,
        backgroundColorProperty: FractionsCommonColors.otherScreenBackgroundProperty,
        homeScreenIcon: new ScreenIcon( BuildingLabScreenView.createMixedScreenIcon(), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } )
      }
    );
  }
}

fractionsMixedNumbers.register( 'LabScreen', LabScreen );
export default LabScreen;