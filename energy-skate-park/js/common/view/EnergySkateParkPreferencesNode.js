// Copyright 2022-2023, University of Colorado Boulder

/**
 * The node that is shown in the Preferences dialog of Energy Skate Park to control simulation
 * specific settings.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import PreferencesDialogConstants from '../../../../joist/js/preferences/PreferencesDialogConstants.js';
import PreferencesControl from '../../../../joist/js/preferences/PreferencesControl.js';
import { Node, RichText, Text } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import EnergySkateParkPreferencesModel from '../model/EnergySkateParkPreferencesModel.js';

class EnergySkateParkPreferencesNode extends Node {

  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param {Tandem} tandem
   */
  constructor( preferencesModel, tandem ) {
    super();

    const metersPerSecondSquaredLabel = new RichText( EnergySkateParkStrings.preferences.metersPerSecondSquaredStringProperty,
      PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS
    );

    const newtonsPerKilogramLabel = new Text( EnergySkateParkStrings.preferences.newtonsPerKilogramStringProperty,
      PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS );

    const accelarationUnitsSwitch = new ABSwitch( preferencesModel.accelerationUnitsProperty,
      EnergySkateParkPreferencesModel.AccelerationUnits.METERS_PER_SECOND_SQUARED,
      metersPerSecondSquaredLabel,
      EnergySkateParkPreferencesModel.AccelerationUnits.NEWTONS_PER_KILOGRAM,
      newtonsPerKilogramLabel,
      { toggleSwitchOptions: PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS }
      );

    const accelerationUnitsControl = new PreferencesControl(
      {
        labelNode: new Text( EnergySkateParkStrings.preferences.accelerationUnitsStringProperty, PreferencesDialogConstants.CONTROL_LABEL_OPTIONS ),
        labelSpacing: 20,
        controlNode: accelarationUnitsSwitch
      }
    );

    this.addChild( accelerationUnitsControl );
  }
}

energySkatePark.register( 'EnergySkateParkPreferencesNode', EnergySkateParkPreferencesNode );
export default EnergySkateParkPreferencesNode;
