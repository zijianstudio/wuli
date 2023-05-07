// Copyright 2018-2022, University of Colorado Boulder

/**
 * The main screen of the "Area Model: Decimals" simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import merge from '../../../phet-core/js/merge.js';
import areaModelCommon from '../areaModelCommon.js';
import AreaModelCommonStrings from '../AreaModelCommonStrings.js';
import AreaModelCommonColors from '../common/view/AreaModelCommonColors.js';
import ProportionalAreaModel from '../proportional/model/ProportionalAreaModel.js';
import ProportionalAreaScreenView from '../proportional/view/ProportionalAreaScreenView.js';

class DecimalsScreen extends Screen {
  constructor() {

    const options = {
      name: AreaModelCommonStrings.screen.decimalsStringProperty,
      backgroundColorProperty: AreaModelCommonColors.backgroundProperty
    };

    const commonAreaOptions = {
      eraseWidth: 0.1,
      eraseHeight: 0.1,
      snapSize: 0.1,
      gridSpacing: 0.1,
      smallTileSize: 0.1,
      largeTileSize: 1
    };

    super(
      () => {
        return new ProportionalAreaModel( [
          merge( {
            maximumSize: 1,
            minimumSize: 0.1,
            initialWidth: 0.5,
            initialHeight: 0.5,
            initialVerticalSplit: 0.2,
            partitionSnapSize: 0.1
          }, commonAreaOptions ),
          merge( {
            maximumSize: 2,
            minimumSize: 0.1,
            initialWidth: 1,
            initialHeight: 1,
            initialVerticalSplit: 0.5,
            partitionSnapSize: 0.1
          }, commonAreaOptions ),
          merge( {
            maximumSize: 3,
            minimumSize: 0.1,
            initialWidth: 1,
            initialHeight: 1,
            initialVerticalSplit: 0.5,
            partitionSnapSize: 0.1
          }, commonAreaOptions )
        ] );
      },
      model => {
        return new ProportionalAreaScreenView( model, {
          decimalPlaces: 1
        } );
      },
      options
    );
  }
}

areaModelCommon.register( 'DecimalsScreen', DecimalsScreen );
export default DecimalsScreen;