// Copyright 2018-2022, University of Colorado Boulder

/**
 * The "Partition" screen of "Area Model: Introduction"
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import merge from '../../../phet-core/js/merge.js';
import { Image } from '../../../scenery/js/imports.js';
import partitionScreenIcon_png from '../../mipmaps/partitionScreenIcon_png.js';
import partitionScreenNavbar_png from '../../mipmaps/partitionScreenNavbar_png.js';
import areaModelCommon from '../areaModelCommon.js';
import AreaModelCommonStrings from '../AreaModelCommonStrings.js';
import AreaCalculationChoice from '../common/model/AreaCalculationChoice.js';
import AreaModelCommonColors from '../common/view/AreaModelCommonColors.js';
import PartitionLineChoice from '../proportional/model/PartitionLineChoice.js';
import ProportionalAreaModel from '../proportional/model/ProportionalAreaModel.js';
import ProportionalAreaScreenView from '../proportional/view/ProportionalAreaScreenView.js';

class PartitionScreen extends Screen {
  constructor() {

    const options = {
      name: AreaModelCommonStrings.screen.partitionStringProperty,
      backgroundColorProperty: AreaModelCommonColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon( new Image( partitionScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new Image( partitionScreenNavbar_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),

      // pdom
      descriptionContent: AreaModelCommonStrings.a11y.partitionDescription
    };

    const commonAreaOptions = {
      minimumSize: 1,
      initialWidth: 5,
      initialHeight: 5,
      initialVerticalSplit: 2,
      initialHorizontalSplit: 2,
      partitionLineChoice: PartitionLineChoice.ONE,
      snapSize: 1,
      gridSpacing: 1,
      partitionSnapSize: 1,
      tilesAvailable: false,
      productsAvailable: false
    };

    super(
      () => {
        return new ProportionalAreaModel( [
          merge( { maximumSize: 10 }, commonAreaOptions ),
          merge( { maximumSize: 12 }, commonAreaOptions )
        ], {
          initialAreaCalculationChoice: AreaCalculationChoice.SHOW_ALL_LINES
        } );
      },
      model => {
        return new ProportionalAreaScreenView( model, {
          showCalculationSelection: false,
          useTileLikeBackground: true,
          useSimplifiedNames: true,
          useCalculationBox: true
        } );
      },
      options
    );
  }
}

areaModelCommon.register( 'PartitionScreen', PartitionScreen );
export default PartitionScreen;