// Copyright 2018-2022, University of Colorado Boulder

/**
 * The "Multiply" screen of "Area Model: Introduction"
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import merge from '../../../phet-core/js/merge.js';
import { Image } from '../../../scenery/js/imports.js';
import multiplyScreenIcon_png from '../../mipmaps/multiplyScreenIcon_png.js';
import multiplyScreenNavbar_png from '../../mipmaps/multiplyScreenNavbar_png.js';
import areaModelCommon from '../areaModelCommon.js';
import AreaModelCommonStrings from '../AreaModelCommonStrings.js';
import PartialProductsChoice from '../common/model/PartialProductsChoice.js';
import AreaModelCommonColors from '../common/view/AreaModelCommonColors.js';
import PartitionLineChoice from '../proportional/model/PartitionLineChoice.js';
import ProportionalAreaModel from '../proportional/model/ProportionalAreaModel.js';
import ProportionalAreaScreenView from '../proportional/view/ProportionalAreaScreenView.js';

class MultiplyScreen extends Screen {
  constructor() {

    const options = {
      name: AreaModelCommonStrings.screen.multiplyStringProperty,
      backgroundColorProperty: AreaModelCommonColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon( new Image( multiplyScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      navigationBarIcon: new ScreenIcon( new Image( multiplyScreenNavbar_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),

      // pdom
      descriptionContent: AreaModelCommonStrings.a11y.multiplyDescription
    };

    const commonAreaOptions = {
      minimumSize: 1,
      initialWidth: 1,
      initialHeight: 1,
      snapSize: 1,
      gridSpacing: 1,
      partitionLineChoice: PartitionLineChoice.NONE,
      tilesAvailable: false,
      productsAvailable: false,
      countingAvailable: true
    };

    super(
      () => {
        return new ProportionalAreaModel( [
          merge( { maximumSize: 10 }, commonAreaOptions ),
          merge( { maximumSize: 12 }, commonAreaOptions )
        ], {
          initialPartialProductsChoice: PartialProductsChoice.HIDDEN
        } );
      },
      model => {
        return new ProportionalAreaScreenView( model, {
          showProductsSelection: false,
          showCalculationSelection: false,
          useTileLikeBackground: true,
          useSimplifiedNames: true,
          useLargeArea: true
        } );
      },
      options
    );
  }
}

areaModelCommon.register( 'MultiplyScreen', MultiplyScreen );
export default MultiplyScreen;