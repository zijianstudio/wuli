// Copyright 2013-2023, University of Colorado Boulder

/**
 * The 'Slope-Intercept' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import { Color } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import GLColors from '../common/GLColors.js';
import GLIconFactory from '../common/view/GLIconFactory.js';
import graphingLines from '../graphingLines.js';
import GraphingLinesStrings from '../GraphingLinesStrings.js';
import SlopeInterceptModel from './model/SlopeInterceptModel.js';
import SlopeInterceptScreenView from './view/SlopeInterceptScreenView.js';

export default class SlopeInterceptScreen extends Screen<SlopeInterceptModel, SlopeInterceptScreenView> {

  public constructor( tandem: Tandem, backgroundColorProperty = new Property<Color | string>( GLColors.SCREEN_BACKGROUND ) ) {

    const options = {
      name: GraphingLinesStrings.screen.slopeInterceptStringProperty,
      backgroundColorProperty: backgroundColorProperty,
      homeScreenIcon: GLIconFactory.createSlopeInterceptScreenIcon(),
      tandem: tandem
    };

    super(
      () => new SlopeInterceptModel( tandem.createTandem( 'model' ) ),
      model => new SlopeInterceptScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

graphingLines.register( 'SlopeInterceptScreen', SlopeInterceptScreen );