// Copyright 2018-2022, University of Colorado Boulder

/**
 * The Bounce screen for Masses and Springs: Basics.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import MassesAndSpringsModel from '../../../masses-and-springs/js/common/model/MassesAndSpringsModel.js';
import MassesAndSpringsColors from '../../../masses-and-springs/js/common/view/MassesAndSpringsColors.js';
import merge from '../../../phet-core/js/merge.js';
import { Image } from '../../../scenery/js/imports.js';
import bounceScreenIcon_png from '../../images/bounceScreenIcon_png.js';
import massesAndSpringsBasics from '../massesAndSpringsBasics.js';
import MassesAndSpringsBasicsStrings from '../MassesAndSpringsBasicsStrings.js';
import BounceScreenView from './view/BounceScreenView.js';

class BounceScreen extends Screen {

  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( tandem, options ) {

    options = merge( {
      name: MassesAndSpringsBasicsStrings.screen.bounceStringProperty,
      backgroundColorProperty: MassesAndSpringsColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon( new Image( bounceScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    }, options );

    super( () => {

        //tandem reference for model
        const modelTandem = tandem.createTandem( 'model' );

        // model reference used for spring and mass creation
        const model = new MassesAndSpringsModel( modelTandem, options );
        model.basicsVersion = true;
        model.addDefaultSprings( modelTandem );
        model.addDefaultMasses( modelTandem );
        return model;
      },
      model => new BounceScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

massesAndSpringsBasics.register( 'BounceScreen', BounceScreen );
export default BounceScreen;