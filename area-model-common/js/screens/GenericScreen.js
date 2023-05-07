// Copyright 2018-2022, University of Colorado Boulder

/**
 * The "Generic" screen, used in "Area Model: Multiplication" and "Area Model: Algebra"
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import genericScreenIcon_png from '../../mipmaps/genericScreenIcon_png.js';
import areaModelCommon from '../areaModelCommon.js';
import AreaModelCommonStrings from '../AreaModelCommonStrings.js';
import AreaModelCommonColors from '../common/view/AreaModelCommonColors.js';
import GenericAreaModel from '../generic/model/GenericAreaModel.js';
import GenericAreaScreenView from '../generic/view/GenericAreaScreenView.js';

class GenericScreen extends Screen {
  constructor() {

    const options = {
      name: AreaModelCommonStrings.screen.genericStringProperty,
      backgroundColorProperty: AreaModelCommonColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon( new Image( genericScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } )
    };

    super(
      () => {
        return new GenericAreaModel( {
          allowExponents: false
        } );
      },
      model => new GenericAreaScreenView( model, 0 ),
      options
    );
  }
}

areaModelCommon.register( 'GenericScreen', GenericScreen );
export default GenericScreen;