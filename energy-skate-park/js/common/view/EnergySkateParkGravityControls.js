// Copyright 2020-2022, University of Colorado Boulder

/**
 * A collection of controls for EnergySkateParkControlPanel that pertain to gravity.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { VBox } from '../../../../scenery/js/imports.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import EnergySkateParkPreferencesModel from '../model/EnergySkateParkPreferencesModel.js';
import GravityComboBox from './GravityComboBox.js';
import GravityNumberControl from './GravityNumberControl.js';
import GravitySlider from './GravitySlider.js';

// constants
const gravityNewtonsPerKilogramPatternString = EnergySkateParkStrings.physicalControls.gravityControls.gravityNewtonsPerKilogramPatternStringProperty;

class EnergySkateParkGravityControls extends VBox {

  /**
   * @param {NumberProperty} gravityMagnitudeProperty
   * @param {BooleanProperty} userControlledProperty
   * @param {EnumerationProperty} accelerationUnitsProperty - controls the units to display acceleration
   * @param {Emitter} resetEmitter - broadcasts a message when the EnergySkateParkModel is reset
   * @param {Node} listParent - parent Node for the ComboBox, if one is included
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( gravityMagnitudeProperty, userControlledProperty, accelerationUnitsProperty, resetEmitter, listParent, tandem, options ) {

    options = merge( {

      // {boolean} - whether or not a GravitySlider is included in this set of controls, only GravitySlider or
      // GravityNumberControl can be used at one time
      includeGravitySlider: false,

      // {boolean} - whether or not a GravityNumberControl is included in this set of controls, only GravitySlider
      // or GravityNumberControl can be used at one time
      includeGravityNumberControl: true,

      // {boolean} - whether or not a GravityComboBox is included in this set of controls
      includeGravityComboBox: false,

      // {Object} - options passed to the GravityNumberControl, if one is included
      gravityNumberControlOptions: null,

      // {Object} - options passed to the GravityComboBox, if one is included
      gravityComboBoxOptions: null,

      // {Object} - options passed to the GravitySlider, if one is included
      gravitySliderOptions: null
    }, options );
    assert && assert( !( options.includeGravitySlider && options.includeGravityNumberControl ), 'only GravitySlider OR GravityNumberControl can be used at one time' );

    const children = [];

    if ( options.includeGravityNumberControl ) {

      // The user is able to control the units of gravity with query parameter and checkbox. NumberControl/NumberDisplay
      // does not support changing the valuePattern so we need to create two NumberControls and swap visibility.
      if ( options.gravityNumberControlOptions && options.gravityNumberControlOptions.numberDisplayOptions ) {
        assert && assert( !options.gravityNumberControlOptions.numberDisplayOptions.valuePattern,
          'valuePattern of the gravity number control is set by EnergySkateParkGravityControls' );
      }
      const gravityControlInMetersPerSecondSquared = new GravityNumberControl( gravityMagnitudeProperty, userControlledProperty, tandem.createTandem( 'gravityInMetersPerSecondSquaredControl' ), options.gravityNumberControlOptions );
      const gravityControlInNewtonsPerKilogram = new GravityNumberControl( gravityMagnitudeProperty, userControlledProperty, tandem.createTandem( 'gravityInNewtonsPerKilogramControl' ), merge( {}, options.gravityNumberControlOptions, {
          numberDisplayOptions: {
            valuePattern: gravityNewtonsPerKilogramPatternString
          }
        } )
      );

      children.push( gravityControlInMetersPerSecondSquared );
      children.push( gravityControlInNewtonsPerKilogram );

      // the units of acceleration determine which control is visible
      accelerationUnitsProperty.link( accelerationUnits => {
        const inMetersPerSecond = accelerationUnits === EnergySkateParkPreferencesModel.AccelerationUnits.METERS_PER_SECOND_SQUARED;
        gravityControlInMetersPerSecondSquared.visible = inMetersPerSecond;
        gravityControlInNewtonsPerKilogram.visible = !inMetersPerSecond;
      } );
    }

    if ( options.includeGravitySlider ) {
      const gravitySlider = new GravitySlider( gravityMagnitudeProperty, userControlledProperty, tandem.createTandem( 'gravityControl' ) );
      children.push( gravitySlider );
    }

    if ( options.includeGravityComboBox ) {
      const gravityComboBox = new GravityComboBox( gravityMagnitudeProperty, userControlledProperty, resetEmitter, listParent, tandem.createTandem( 'gravityComboBox' ), options );
      children.push( gravityComboBox );
    }

    super( { resize: true, spacing: 8, children: children } );
  }
}

energySkatePark.register( 'EnergySkateParkGravityControls', EnergySkateParkGravityControls );
export default EnergySkateParkGravityControls;