// Copyright 2023, University of Colorado Boulder

/**
 * Lab Screen, where the user can learn about Kepler's Laws via an elliptical orbit
 *
 * @author Agustín Vallejo
 */

import Screen from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import SolarSystemCommonColors from '../../../solar-system-common/js/SolarSystemCommonColors.js';
import KeplersLawsModel from '../keplers-laws/model/KeplersLawsModel.js';
import LawMode from '../keplers-laws/model/LawMode.js';
import KeplersLawsScreenView from '../keplers-laws/view/KeplersLawsScreenView.js';
import KeplersLawsScreenIcon from '../keplers-laws/view/KeplersLawsScreenIcon.js';
import keplersLaws from '../keplersLaws.js';
import KeplersLawsStrings from '../KeplersLawsStrings.js';

class LabScreen extends Screen<KeplersLawsModel, KeplersLawsScreenView> {

  public constructor( tandem: Tandem ) {

    const options = {
      name: KeplersLawsStrings.screen.labStringProperty,
      homeScreenIcon: new KeplersLawsScreenIcon(),
      backgroundColorProperty: SolarSystemCommonColors.backgroundProperty,
      tandem: tandem
    };

    super(
      () => new KeplersLawsModel( {
        initialLaw: LawMode.FIRST_LAW,
        tandem: tandem.createTandem( 'model' )
      } ),
      model => new KeplersLawsScreenView( model, {
        tandem: tandem.createTandem( 'view' ),
        allowLawSelection: true
      } ),
      options
    );
  }
}

keplersLaws.register( 'LabScreen', LabScreen );
export default LabScreen;