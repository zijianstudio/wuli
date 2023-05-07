// Copyright 2023, University of Colorado Boulder


/**
 * Visual representation of space object's property checkbox.
 *
 * @author Agustín Vallejo
 */

import { HSeparator, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SolarSystemCommonConstants from '../../../../solar-system-common/js/SolarSystemCommonConstants.js';
import createArrowsVisibilityCheckboxes from '../../../../solar-system-common/js/view/createArrowsVisibilityCheckboxes.js';
import createVisibilityInformationCheckboxes from '../../../../solar-system-common/js/view/createVisibilityInformationCheckboxes.js';
import KeplersLawsModel from '../model/KeplersLawsModel.js';
import KeplersLawsOrbitalInformationBox from './KeplersLawsOrbitalInformationBox.js';
import keplersLaws from '../../keplersLaws.js';
import KeplersLawsStrings from '../../KeplersLawsStrings.js';
import Checkbox from '../../../../sun/js/Checkbox.js';

class KeplersLawsControls extends Panel {
  public constructor( model: KeplersLawsModel, tandem: Tandem ) {
    super( new VBox( {
      children: [
        new KeplersLawsOrbitalInformationBox( model, {
          tandem: tandem
        } ),
        new HSeparator( SolarSystemCommonConstants.HSEPARATOR_OPTIONS ),
        new Checkbox(
          model.alwaysCircularProperty,
          new Text( KeplersLawsStrings.circularOrbitStringProperty, SolarSystemCommonConstants.TEXT_OPTIONS ),
          SolarSystemCommonConstants.CHECKBOX_OPTIONS ),
        new HSeparator( SolarSystemCommonConstants.HSEPARATOR_OPTIONS ),
        ...createArrowsVisibilityCheckboxes( model, tandem ),
        new HSeparator( SolarSystemCommonConstants.HSEPARATOR_OPTIONS ),
        ...createVisibilityInformationCheckboxes( model, tandem, false )
      ],
      spacing: 5,
      align: 'left',
      stretch: true,
      maxWidth: SolarSystemCommonConstants.TEXT_MAX_WIDTH
    } ), SolarSystemCommonConstants.CONTROL_PANEL_OPTIONS );
  }
}

keplersLaws.register( 'KeplersLawsControls', KeplersLawsControls );
export default KeplersLawsControls;