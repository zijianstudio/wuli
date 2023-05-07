// Copyright 2013-2023, University of Colorado Boulder

/**
 * The 'Slope' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import GLColors from '../common/GLColors.js';
import GLIconFactory from '../common/view/GLIconFactory.js';
import graphingLines from '../graphingLines.js';
import GraphingLinesStrings from '../GraphingLinesStrings.js';
import SlopeModel from './model/SlopeModel.js';
import SlopeScreenView from './view/SlopeScreenView.js';

export default class SlopeScreen extends Screen<SlopeModel, SlopeScreenView> {

  public constructor( tandem: Tandem ) {

    const options = {
      name: GraphingLinesStrings.screen.slopeStringProperty,
      backgroundColorProperty: new Property( GLColors.SCREEN_BACKGROUND ),
      homeScreenIcon: GLIconFactory.createSlopeScreenIcon(),
      tandem: tandem
    };

    super(
      () => new SlopeModel( tandem.createTandem( 'model' ) ),
      model => new SlopeScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

graphingLines.register( 'SlopeScreen', SlopeScreen );