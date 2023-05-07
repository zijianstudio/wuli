// Copyright 2014-2023, University of Colorado Boulder

/**
 * The 'Standard Form' screen.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import GQColors from '../common/GQColors.js';
import GQScreenIconFactory from '../common/view/GQScreenIconFactory.js';
import graphingQuadratics from '../graphingQuadratics.js';
import GraphingQuadraticsStrings from '../GraphingQuadraticsStrings.js';
import StandardFormModel from './model/StandardFormModel.js';
import StandardFormScreenView from './view/StandardFormScreenView.js';

export default class StandardFormScreen extends Screen<StandardFormModel, StandardFormScreenView> {

  public constructor( tandem: Tandem ) {

    const options = {

      // ScreenOptions
      name: GraphingQuadraticsStrings.screen.standardFormStringProperty,
      backgroundColorProperty: new Property( GQColors.SCREEN_BACKGROUND ),
      homeScreenIcon: GQScreenIconFactory.createStandardFormScreenIcon(),

      // Workaround for https://github.com/phetsims/joist/issues/532, which will not be fixed.
      navigationBarIcon: GQScreenIconFactory.createStandardFormScreenIcon(),

      // phet-io
      tandem: tandem
    };

    super(
      () => new StandardFormModel( tandem.createTandem( 'model' ) ),
      model => new StandardFormScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

graphingQuadratics.register( 'StandardFormScreen', StandardFormScreen );