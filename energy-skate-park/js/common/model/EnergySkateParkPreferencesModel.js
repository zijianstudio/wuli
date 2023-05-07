// Copyright 2022, University of Colorado Boulder

/**
 * A model that holds preferences that are specific to Energy Skate Park. These Properties are shared and reflected
 * across all sim screens.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import regionAndCultureManager from '../../../../joist/js/preferences/regionAndCultureManager.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkQueryParameters from '../EnergySkateParkQueryParameters.js';

// Possible representations of units for acceleration in this sim, can be set by query parameter or in preferences.
class AccelerationUnits extends EnumerationValue {
  static METERS_PER_SECOND_SQUARED = new AccelerationUnits();
  static NEWTONS_PER_KILOGRAM = new AccelerationUnits();

  static enumeration = new Enumeration( AccelerationUnits );
}

class EnergySkateParkPreferencesModel {
  constructor() {

    // A Property that controls the acceleration units in the sim, "altAccelerationUnits" changes the default to N/kg
    const defaultUnits = EnergySkateParkQueryParameters.altAccelerationUnits ? AccelerationUnits.NEWTONS_PER_KILOGRAM : AccelerationUnits.METERS_PER_SECOND_SQUARED;
    this.accelerationUnitsProperty = new EnumerationProperty( defaultUnits, {
      tandem: Tandem.PREFERENCES.createTandem( 'accelerationUnitsProperty' )
    } );

    // Controls the selected SkaterImages.SkaterCharacterSet. A set of characters is selected from Preferences
    // and the actual skater character is chosen from in-screen UI.
    this.skaterCharacterSetProperty = regionAndCultureManager.regionAndCultureProperty;
  }
}

// @public
// @static
EnergySkateParkPreferencesModel.AccelerationUnits = AccelerationUnits;

energySkatePark.register( 'EnergySkateParkPreferencesModel', EnergySkateParkPreferencesModel );
export default EnergySkateParkPreferencesModel;
