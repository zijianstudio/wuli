// Copyright 2023, University of Colorado Boulder

/**
 * ShowOnesControlOptions is the 'Show Ones' control in the Preferences dialog.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Text } from '../../../../scenery/js/imports.js';
import Property from '../../../../axon/js/Property.js';
import PreferencesControl, { PreferencesControlOptions } from '../../../../joist/js/preferences/PreferencesControl.js';
import PreferencesDialogConstants from '../../../../joist/js/preferences/PreferencesDialogConstants.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';
import ToggleSwitch from '../../../../sun/js/ToggleSwitch.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';

type SelfOptions = EmptySelfOptions;

type ShowOnesControlOptions = SelfOptions &
  StrictOmit<PreferencesControlOptions, 'labelNode' | 'descriptionNode' | 'controlNode'>;

export default class ShowOnesControl extends PreferencesControl {

  public constructor( showOnesProperty: Property<boolean>, providedOptions?: ShowOnesControlOptions ) {

    const labelText = new Text( NumberSuiteCommonStrings.showOnesStringProperty,
      PreferencesDialogConstants.CONTROL_LABEL_OPTIONS );

    const descriptionText = new Text( NumberSuiteCommonStrings.showOnesDescriptionStringProperty,
      PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS );

    const toggleSwitch = new ToggleSwitch( showOnesProperty, false, true,
      PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS );

    super( optionize<ShowOnesControlOptions, SelfOptions, PreferencesControlOptions>()( {

      // PreferencesControlOptions
      labelNode: labelText,
      descriptionNode: descriptionText,
      controlNode: toggleSwitch,
      ySpacing: NumberSuiteCommonConstants.PREFERENCES_DESCRIPTION_Y_SPACING
    }, providedOptions ) );
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

numberSuiteCommon.register( 'ShowOnesControl', ShowOnesControl );