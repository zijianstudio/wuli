// Copyright 2019-2022, University of Colorado Boulder

/**
 * Intro screen for Density
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DensityBuoyancyCommonQueryParameters from '../../../density-buoyancy-common/js/common/DensityBuoyancyCommonQueryParameters.js';
import DensityBuoyancyCommonColors from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyCommonColors.js';
import DensityBuoyancyScreenView from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyScreenView.js';
import DensityIntroModel from '../../../density-buoyancy-common/js/density/model/DensityIntroModel.js';
import DensityIntroScreenView from '../../../density-buoyancy-common/js/density/view/DensityIntroScreenView.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import intro_screen_icon_png from '../../mipmaps/intro_screen_icon_png.js';
import density from '../density.js';
import DensityStrings from '../DensityStrings.js';

export default class IntroScreen extends Screen<DensityIntroModel, DensityIntroScreenView> {
  public constructor( tandem: Tandem ) {
    const icon = DensityBuoyancyCommonQueryParameters.generateIconImages ? DensityBuoyancyScreenView.getDensityIntroIcon() : new Image( intro_screen_icon_png );

    super(
      () => new DensityIntroModel( {
        tandem: tandem.createTandem( 'model' )
      } ),
      model => new DensityIntroScreenView( model, {
        tandem: tandem.createTandem( 'view' )
      } ),
      {
        name: DensityStrings.screen.introStringProperty,
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

density.register( 'IntroScreen', IntroScreen );
