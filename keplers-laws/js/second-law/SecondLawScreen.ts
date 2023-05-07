// Copyright 2023, University of Colorado Boulder

/**
 * Second Law Screen, where the user can learn about Kepler's Laws via an elliptical orbit
 *
 * @author Agustín Vallejo
 */

import { Image } from '../../../scenery/js/imports.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Screen from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import SolarSystemCommonColors from '../../../solar-system-common/js/SolarSystemCommonColors.js';
import KeplersLawsModel from '../keplers-laws/model/KeplersLawsModel.js';
import LawMode from '../keplers-laws/model/LawMode.js';
import KeplersLawsScreenView from '../keplers-laws/view/KeplersLawsScreenView.js';
import keplersLaws from '../keplersLaws.js';
import KeplersLawsStrings from '../KeplersLawsStrings.js';
import iconSecondLaw_png from '../../images/iconSecondLaw_png.js';

class SecondLawScreen extends Screen<KeplersLawsModel, KeplersLawsScreenView> {

  public constructor( tandem: Tandem ) {

    const options = {
      name: KeplersLawsStrings.screen.secondLawStringProperty,
      homeScreenIcon: new ScreenIcon( new Image( iconSecondLaw_png ), {
        fill: SolarSystemCommonColors.backgroundProperty
      } ),
      backgroundColorProperty: SolarSystemCommonColors.backgroundProperty,
      tandem: tandem
    };

    super(
      () => new KeplersLawsModel( {
        initialLaw: LawMode.SECOND_LAW,
        tandem: tandem.createTandem( 'model' )
      } ),
      model => new KeplersLawsScreenView( model, {
        tandem: tandem.createTandem( 'view' )
      } ),
      options
    );
  }
}

keplersLaws.register( 'SecondLawScreen', SecondLawScreen );
export default SecondLawScreen;