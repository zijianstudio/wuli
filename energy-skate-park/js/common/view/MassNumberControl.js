// Copyright 2019-2022, University of Colorado Boulder

/**
 * A NumberControl that controls the skater mass Property of energy skate park.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import PhysicalNumberControl from './PhysicalNumberControl.js';

const controlsMassString = EnergySkateParkStrings.physicalControls.massControls.massStringProperty;
const massKilogramsPatternString = EnergySkateParkStrings.physicalControls.massControls.massKilogramsPatternStringProperty;

class MassNumberControl extends PhysicalNumberControl {

  /**
   * @param {NumberProperty} massProperty
   * @param {BooleanProperty} userControlledProperty
   * @param {Range} massRange
   * @param {Tandem} tandem
   */
  constructor( massProperty, userControlledProperty, massRange, tandem ) {
    super( controlsMassString, massProperty, massRange, userControlledProperty, tandem, {
      numberDisplayOptions: {
        valuePattern: massKilogramsPatternString
      },
      sliderOptions: {

        // round to nearest 5 kg, as requested by design team
        constrainValue: value => Utils.roundToInterval( value, 5 )
      }
    } );
  }
}

energySkatePark.register( 'MassNumberControl', MassNumberControl );
export default MassNumberControl;