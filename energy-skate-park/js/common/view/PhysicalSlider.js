// Copyright 2018-2022, University of Colorado Boulder

/**
 * Controls a physical value of the model. This is just a slider with a label and labeled tick marks. It extends
 * NumberControl to leverage the layout of the label and slider so that it conveniently matches the layout
 * with other NumberControls used in this sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Text } from '../../../../scenery/js/imports.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
import PhysicalNumberControl from './PhysicalNumberControl.js';

const controlsValueLotsString = EnergySkateParkStrings.physicalControls.lotsStringProperty;
const controlsValueNoneString = EnergySkateParkStrings.physicalControls.noneStringProperty;

class PhysicalSlider extends PhysicalNumberControl {

  /**
   * @param {string} titleString
   * @param {NumberProperty} property
   * @param {Range} valueRange
   * @param {BooleanProperty} userControlledProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( titleString, property, valueRange, userControlledProperty, tandem, options ) {

    options = merge( {
      // {string} - labels for the min and max values of this control
      maxLabel: controlsValueLotsString,
      minLabel: controlsValueNoneString,

      // {*} - passed to the Slider of this NumberControl
      sliderOptions: {}
    }, options );

    // don't include any arrow buttons or the NumberDisplay for this control
    assert && assert( options.sliderOnly === undefined, 'The PhysicalSlider sets sliderOnly option' );
    options.sliderOnly = true;

    assert && assert( options.sliderOptions.majorTicks === undefined, 'The PhysicalSlider sets its own major ticks' );
    options.sliderOptions.majorTicks = [
      createTickEntry( valueRange.min, options.minLabel, tandem, 'minLabelText' ),
      createTickEntry( valueRange.max, options.maxLabel, tandem, 'maxLabelText' )
    ];

    super( titleString, property, valueRange, userControlledProperty, tandem, options );
  }
}

/**
 * Create a tick entry for the slider to be added with addMajorTick.
 * @param {number} value - value on the slider to add the tick
 * @param {string} label - label for the tick
 * @param {Tandem} tandem
 * @param {string} tandemName
 * @returns {Object} - conforms to { value: {number}, label: Node }, required by NumberControl options
 */
const createTickEntry = ( value, label, tandem, tandemName ) => {
  return {
    value: value,
    label: new Text( label, merge( {
      tandem: tandem.createTandem( tandemName )
    }, EnergySkateParkConstants.CONTROL_TICK_LABEL_OPTIONS ) )
  };
};

energySkatePark.register( 'PhysicalSlider', PhysicalSlider );
export default PhysicalSlider;