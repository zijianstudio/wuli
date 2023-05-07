// Copyright 2018-2022, University of Colorado Boulder

/**
 * The Stretch screen for Masses and Springs: Basics.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import MassesAndSpringsModel from '../../../masses-and-springs/js/common/model/MassesAndSpringsModel.js';
import MassesAndSpringsColors from '../../../masses-and-springs/js/common/view/MassesAndSpringsColors.js';
import merge from '../../../phet-core/js/merge.js';
import { Image } from '../../../scenery/js/imports.js';
import stretchScreenIcon_png from '../../images/stretchScreenIcon_png.js';
import massesAndSpringsBasics from '../massesAndSpringsBasics.js';
import MassesAndSpringsBasicsStrings from '../MassesAndSpringsBasicsStrings.js';
import StretchScreenView from './view/StretchScreenView.js';

// image
class StretchScreen extends Screen {
  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   *
   */
  constructor( tandem, options ) {

    options = merge( {
      name: MassesAndSpringsBasicsStrings.screen.stretchStringProperty,
      backgroundColorProperty: MassesAndSpringsColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon( new Image( stretchScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    }, options );

    super( () => {

        // Reference for model tandem
        const modelTandem = tandem.createTandem( 'model' );

        // Reference for model used in spring and mass creation
        const model = new MassesAndSpringsModel( modelTandem, options );
        model.addDefaultSprings( modelTandem );
        model.addDefaultMasses( modelTandem );

        // It is intended that the stretch screen have a specific damping
        model.dampingProperty.set( 0.7 );
        return model;
      },
      model => new StretchScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

massesAndSpringsBasics.register( 'StretchScreen', StretchScreen );
export default StretchScreen;