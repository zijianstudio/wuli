// Copyright 2013-2023, University of Colorado Boulder

/**
 * The 'Point Slope' screen. Conforms to the contract specified in joist/Screen.
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
import PointSlopeModel from './model/PointSlopeModel.js';
import PointSlopeScreenView from './view/PointSlopeScreenView.js';

export default class PointSlopeScreen extends Screen<PointSlopeModel, PointSlopeScreenView> {

  public constructor( tandem: Tandem ) {

    const options = {
      name: GraphingLinesStrings.screen.pointSlopeStringProperty,
      backgroundColorProperty: new Property( GLColors.SCREEN_BACKGROUND ),
      homeScreenIcon: GLIconFactory.createPointSlopeScreenIcon(),
      tandem: tandem
    };

    super(
      () => new PointSlopeModel( tandem.createTandem( 'model' ) ),
      model => new PointSlopeScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

graphingLines.register( 'PointSlopeScreen', PointSlopeScreen );