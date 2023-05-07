// Copyright 2019-2022, University of Colorado Boulder

/**
 * Mystery screen for Density
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DensityBuoyancyCommonQueryParameters from '../../../density-buoyancy-common/js/common/DensityBuoyancyCommonQueryParameters.js';
import DensityBuoyancyCommonColors from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyCommonColors.js';
import DensityBuoyancyScreenView from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyScreenView.js';
import DensityMysteryModel from '../../../density-buoyancy-common/js/density/model/DensityMysteryModel.js';
import DensityMysteryScreenView from '../../../density-buoyancy-common/js/density/view/DensityMysteryScreenView.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import mystery_screen_icon_png from '../../mipmaps/mystery_screen_icon_png.js';
import density from '../density.js';
import DensityStrings from '../DensityStrings.js';

export default class MysteryScreen extends Screen<DensityMysteryModel, DensityMysteryScreenView> {
  public constructor( tandem: Tandem ) {
    const icon = DensityBuoyancyCommonQueryParameters.generateIconImages ? DensityBuoyancyScreenView.getDensityMysteryIcon() : new Image( mystery_screen_icon_png );

    super(
      () => new DensityMysteryModel( {
        tandem: tandem.createTandem( 'model' )
      } ),
      model => new DensityMysteryScreenView( model, {
        tandem: tandem.createTandem( 'view' )
      } ),
      {
        name: DensityStrings.screen.mysteryStringProperty,
        backgroundColorProperty: DensityBuoyancyCommonColors.skyBottomProperty,
        homeScreenIcon: new ScreenIcon( icon, {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } ),
        tandem: tandem
      }
    );
  }
}

density.register( 'MysteryScreen', MysteryScreen );
