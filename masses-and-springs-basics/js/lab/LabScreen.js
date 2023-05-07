// Copyright 2018-2022, University of Colorado Boulder

/**
 * The Lab screen for Masses and Springs: Basics.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import MassesAndSpringsColors from '../../../masses-and-springs/js/common/view/MassesAndSpringsColors.js';
import LabModel from '../../../masses-and-springs/js/lab/model/LabModel.js';
import merge from '../../../phet-core/js/merge.js';
import { Image } from '../../../scenery/js/imports.js';
import labScreenIcon_png from '../../images/labScreenIcon_png.js';
import massesAndSpringsBasics from '../massesAndSpringsBasics.js';
import MassesAndSpringsBasicsStrings from '../MassesAndSpringsBasicsStrings.js';
import LabScreenView from './view/LabScreenView.js';


class LabScreen extends Screen {

  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   *
   */
  constructor( tandem, options ) {

    options = merge( {
      basicsVersion: true,
      name: MassesAndSpringsBasicsStrings.screen.labStringProperty,
      backgroundColorProperty: MassesAndSpringsColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon( new Image( labScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    }, options );

    super(
      () => new LabModel( tandem.createTandem( 'model' ), true, options ),
      model => new LabScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

massesAndSpringsBasics.register( 'LabScreen', LabScreen );
export default LabScreen;