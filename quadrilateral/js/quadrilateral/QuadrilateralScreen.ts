// Copyright 2021-2023, University of Colorado Boulder

/**
 * Entry point for the screen of quadrilateral.
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import QuadrilateralColors from '../QuadrilateralColors.js';
import quadrilateral from '../quadrilateral.js';
import QuadrilateralModel from './model/QuadrilateralModel.js';
import QuadrilateralScreenView from './view/QuadrilateralScreenView.js';
import QuadrilateralOptionsModel from './model/QuadrilateralOptionsModel.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import QuadrilateralKeyboardHelpContent from './view/QuadrilateralKeyboardHelpContent.js';

export default class QuadrilateralScreen extends Screen<QuadrilateralModel, QuadrilateralScreenView> {
  public constructor( optionsModel: QuadrilateralOptionsModel, providedOptions: ScreenOptions ) {

    const options = optionize<ScreenOptions, EmptySelfOptions, ScreenOptions>()( {
      backgroundColorProperty: QuadrilateralColors.screenBackgroundColorProperty,
      createKeyboardHelpNode: () => new QuadrilateralKeyboardHelpContent()
    }, providedOptions );

    super(
      () => new QuadrilateralModel( optionsModel, options.tandem.createTandem( 'model' ) ),
      model => new QuadrilateralScreenView( model, optionsModel, options.tandem.createTandem( 'view' ) ),
      options
    );
  }
}

quadrilateral.register( 'QuadrilateralScreen', QuadrilateralScreen );