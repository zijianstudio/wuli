// Copyright 2019-2022, University of Colorado Boulder

/**
 * A slider that controls the mass Property of the skater in energy skate park.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import PhysicalSlider from './PhysicalSlider.js';

const controlsMassString = EnergySkateParkStrings.physicalControls.massControls.massStringProperty;
const smallString = EnergySkateParkStrings.physicalControls.smallStringProperty;
const largeString = EnergySkateParkStrings.physicalControls.largeStringProperty;

class MassSlider extends PhysicalSlider {

  /**
   * @param {NumberProperty} property
   * @param {BooleanProperty} userControlledProperty
   * @param {Range} massRange
   * @param {Tandem} tandem
   */
  constructor( property, userControlledProperty, massRange, tandem ) {
    super( controlsMassString, property, massRange, userControlledProperty, tandem, {
      minLabel: smallString,
      maxLabel: largeString,
      sliderOptions: {
        constrainValue: value => Utils.roundToInterval( value, 5 )
      }
    } );
  }
}

energySkatePark.register( 'MassSlider', MassSlider );
export default MassSlider;