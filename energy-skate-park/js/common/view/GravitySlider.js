// Copyright 2019-2022, University of Colorado Boulder

/**
 * A slider that controls the gravity Property of energy skate park.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
import PhysicalSlider from './PhysicalSlider.js';

const controlsGravityLabelString = EnergySkateParkStrings.physicalControls.gravityControls.gravityStringProperty;
const controlsValueTinyString = EnergySkateParkStrings.physicalControls.tinyStringProperty;

class GravitySlider extends PhysicalSlider {

  /**
   * @param {NumberProperty} property
   * @param {BooleanProperty} userControlledProperty
   * @param {Tandem} tandem
   */
  constructor( property, userControlledProperty, tandem ) {
    super(
      controlsGravityLabelString,
      property,
      new Range( Math.abs( EnergySkateParkConstants.MIN_GRAVITY ), Math.abs( EnergySkateParkConstants.MAX_GRAVITY ) ),
      userControlledProperty,
      tandem, {
        minLabel: controlsValueTinyString,
        sliderOptions: {
          constrainValue: value => Utils.roundToInterval( value, 1 )
        }
      } );
  }
}

energySkatePark.register( 'GravitySlider', GravitySlider );
export default GravitySlider;