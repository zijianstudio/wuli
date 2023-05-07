// Copyright 2022-2023, University of Colorado Boulder

/**
 * "Mean & Median" screen
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Image } from '../../../scenery/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import CAVColors from '../common/CAVColors.js';
import centerAndVariability from '../centerAndVariability.js';
import MeanAndMedianModel from './model/MeanAndMedianModel.js';
import CAVScreen, { CAVScreenOptions } from '../common/CAVScreen.js';
import MeanAndMedianScreenView from './view/MeanAndMedianScreenView.js';
import CenterAndVariabilityStrings from '../CenterAndVariabilityStrings.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import meanAndMedianScreenIcon_png from '../../images/meanAndMedianScreenIcon_png.js';

type MeanAndMedianScreenOptions = CAVScreenOptions;

export default class MeanAndMedianScreen extends CAVScreen<MeanAndMedianModel, MeanAndMedianScreenView> {

  public constructor( providedOptions: MeanAndMedianScreenOptions ) {

    const options = optionize<MeanAndMedianScreenOptions, EmptySelfOptions, CAVScreenOptions>()( {
      name: CenterAndVariabilityStrings.screen.meanAndMedianStringProperty,
      homeScreenIcon: new ScreenIcon( new Image( meanAndMedianScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      backgroundColorProperty: CAVColors.screenBackgroundColorProperty
    }, providedOptions );

    super(
      () => new MeanAndMedianModel( {
        tandem: options.tandem.createTandem( 'model' )
      } ),
      model => new MeanAndMedianScreenView( model, {
        tandem: options.tandem.createTandem( 'view' )
      } ),
      options
    );
  }
}

centerAndVariability.register( 'MeanAndMedianScreen', MeanAndMedianScreen );