// Copyright 2018-2022, University of Colorado Boulder

/**
 * A sound generator used to indicate the resistance level in the RIAW simulation.  This uses the values for the
 * resistivity, length, and area of the wire to decide WHEN to generate a sound, and the value of the resistance to
 * determine the nature of the sound to be generated.
 *
 * @author John Blanco
 */

import Range from '../../../../dot/js/Range.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import brightMarimbaShort_mp3 from '../../../../tambo/sounds/brightMarimbaShort_mp3.js';
import resistanceInAWire from '../../resistanceInAWire.js';
import ResistanceInAWireConstants from '../ResistanceInAWireConstants.js';

// constants
const BINS_PER_SLIDER = 9; // odd numbers generally work best because a bin then spans the middle initial value
const MIN_RESISTANCE = ResistanceInAWireConstants.RESISTANCE_RANGE.min;
const MAX_RESISTANCE = ResistanceInAWireConstants.RESISTANCE_RANGE.max;
const MIN_RESISTIVITY = ResistanceInAWireConstants.RESISTIVITY_RANGE.min;
const MAX_RESISTIVITY = ResistanceInAWireConstants.RESISTIVITY_RANGE.max;
const MIN_AREA = ResistanceInAWireConstants.AREA_RANGE.min;
const MAX_AREA = ResistanceInAWireConstants.AREA_RANGE.max;
const MIN_LENGTH = ResistanceInAWireConstants.LENGTH_RANGE.min;
const MAX_LENGTH = ResistanceInAWireConstants.LENGTH_RANGE.max;

class ResistanceSoundGenerator extends SoundClip {

  /**
   * @constructor
   * {Object} config - a configuration object that includes property values for the resistivity, area, and length of
   * the wire and the sliders that control each, as well as a property the indicates whether a reset is in progress.
   */
  constructor( config ) {

    super( brightMarimbaShort_mp3, {
      initialOutputLevel: 0.5,
      rateChangesAffectPlayingSounds: false
    } );

    // function to map the resistance to a playback speed and play the sound
    const playResistanceSound = () => {

      if ( !config.resetInProgressProperty.value ) {

        // normalize the resistance value between 0 and 1, taking into account several orders of magnitude
        const normalizedResistance = Math.log( config.resistanceProperty.value / MIN_RESISTANCE ) /
                                     Math.log( MAX_RESISTANCE / MIN_RESISTANCE );

        // map the normalized resistance value to a playback rate for the sound clip
        const playbackRate = Math.pow( 2, ( 1 - normalizedResistance ) * 3 ) / 3;

        this.setPlaybackRate( playbackRate );
        this.play();
      }
    };

    // @private - objects that monitor the parameter and play the sound, references kept for debugging and clarity
    const resistivityMonitor = new ParameterMonitor(
      config.resistivityProperty,
      config.resistivitySlider,
      new Range( MIN_RESISTIVITY, MAX_RESISTIVITY ),
      playResistanceSound
    );
    const lengthMonitor = new ParameterMonitor(
      config.lengthProperty,
      config.lengthSlider,
      new Range( MIN_LENGTH, MAX_LENGTH ),
      playResistanceSound
    );
    const areaMonitor = new ParameterMonitor(
      config.areaProperty,
      config.areaSlider,
      new Range( MIN_AREA, MAX_AREA ),
      playResistanceSound
    );

    this.disposeResistanceSoundGenerator = () => {
      resistivityMonitor.dispose();
      lengthMonitor.dispose();
      areaMonitor.dispose();
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeResistanceSoundGenerator();
  }

}

class BinSelector {

  /**
   * inner type for placing values in a bin
   * @param {number} minValue
   * @param {number} maxValue
   * @param {number} numBins
   * @constructor
   */
  constructor( minValue, maxValue, numBins ) {

    // parameter checking
    assert && assert( maxValue > minValue );
    assert && assert( numBins > 0 );

    // @private
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.span = this.maxValue - this.minValue;
    this.numBins = numBins;

  }

  /**
   * put the provided value in a bin
   * @param value
   * @returns {number}
   * @public
   */
  selectBin( value ) {
    assert && assert( value <= this.maxValue );
    assert && assert( value >= this.minValue );

    // this calculation means that values on the boundaries will go into the higher bin except for the max value
    const proportion = ( value - this.minValue ) / this.span;
    return Math.min( Math.floor( proportion * this.numBins ), this.numBins - 1 );
  }

}

class ParameterMonitor {

  /**
   * inner type for monitoring a parameter a playing a sound when warranted
   * @param {NumberProperty} valueProperty - the value of the parameter, enclosed in an Axon Property
   * @param {SliderUnit} sliderUnit - the slider unit that controls the parameter's value
   * @param {Range} parameterRange - the range of values that the parameter can take on
   * @param {function} generateSound - function that will be called to generate the sound
   * @constructor
   */
  constructor( valueProperty, sliderUnit, parameterRange, generateSound ) {
    const binSelector = new BinSelector( parameterRange.min, parameterRange.max, BINS_PER_SLIDER );
    let selectedBin = binSelector.selectBin( valueProperty.value );

    // @private - for dispose
    this.valueProperty = valueProperty;

    // @private - for dispose
    this.valuePropertyListener = parameterValue => {
      const bin = binSelector.selectBin( parameterValue );

      // Play the sound if a change has occurred due to keyboard interaction, if the area value has moved to a new bin,
      // or if a min or max has been reached.
      if ( sliderUnit.keyboardDragging || bin !== selectedBin ||
           parameterValue === parameterRange.min || parameterValue === parameterRange.max ) {
        generateSound();
      }
      selectedBin = bin;
    };

    // hook up the listener
    valueProperty.lazyLink( this.valuePropertyListener );
  }

  /**
   * dispose
   * @public
   */
  dispose() {
    this.valueProperty.unlink( this.valuePropertyListener );
  }

}

resistanceInAWire.register( 'ResistanceSoundGenerator', ResistanceSoundGenerator );

export default ResistanceSoundGenerator;