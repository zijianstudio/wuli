// Copyright 2022-2023, University of Colorado Boulder
/* eslint-disable */
/**
 * Slider abstraction for the frequency and amplitude sliders--but note that light frequency slider uses spectrum for
 * track and thumb.  All instances exist for the lifetime of the sim and do not require disposal.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import HSlider, { HSliderOptions } from '../../../../sun/js/HSlider.js';
import generalBoundaryBoopSoundPlayer from '../../../../tambo/js/shared-sound-players/generalBoundaryBoopSoundPlayer.js';
import generalSoftClickSoundPlayer from '../../../../tambo/js/shared-sound-players/generalSoftClickSoundPlayer.js';
import sound from '../../sound.js';
import SoundConstants from '../../common/SoundConstants.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { SceneryEvent, Text } from '../../../../scenery/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';

// constants
const MIN_INTER_CLICK_TIME = ( 1 / 60 * 1000 ) * 2; // min time between clicks, in milliseconds, empirically determined
const TOLERANCE = 1E-6;

const MAJOR_TICK_MODULUS = 5;

type SelfOptions = {
  maxTickIndex: number;
  showTicks?: boolean;
};
type SoundSliderOptions = SelfOptions & HSliderOptions;

export default class SoundSlider extends HSlider {

  /**
   * @param {NumberProperty} property
   * @param {Object} [options]
   */
  constructor( property: NumberProperty, providedOptions?: SoundSliderOptions ) {

    const maxTickIndex = ( providedOptions && providedOptions.maxTickIndex ) ? providedOptions.maxTickIndex : 10;

    const min = property.range.min;
    const max = property.range.max;
    const ticks = _.range( 0, maxTickIndex + 1 ).map( index => {
      return {
        value: Utils.linear( 0, maxTickIndex, min, max, index ),
        type: index % MAJOR_TICK_MODULUS === 0 ? 'major' : 'minor'
      };
    } );

    // Keep track of the previous value on slider drag for playing sounds
    let lastValue = property.value;

    // Keep track of the last time a sound was played so that we don't play too often
    let timeOfLastClick = 0;

    const options = optionize<SoundSliderOptions, SelfOptions, HSliderOptions>()( {

      // Ticks are created for all sliders for sonification, but not shown for the Light Frequency slider
      showTicks: true,
      constrainValue: ( value: number ) => {
        if ( Math.abs( value - property.range.min ) <= TOLERANCE ) {
          return property.range.min;
        }
        else if ( Math.abs( value - property.range.max ) <= TOLERANCE ) {
          return property.range.max;
        }
        else {
          return value;
        }
      },

      drag: ( event: SceneryEvent ) => {

        const value = property.value;

        if ( event.isFromPDOM() ) {

          if ( Math.abs( value - property.range.max ) <= TOLERANCE ||
               Math.abs( value - property.range.min ) <= TOLERANCE ) {
            generalBoundaryBoopSoundPlayer.play();
          }
          else {
            generalSoftClickSoundPlayer.play();
          }
        }
        else {

          // handle the sound as desired for mouse/touch style input
          for ( let i = 0; i < ticks.length; i++ ) {
            const tick = ticks[ i ];
            if ( lastValue !== value && ( value === property.range.min || value === property.range.max ) ) {
              generalBoundaryBoopSoundPlayer.play();
              break;
            }
            else if ( lastValue < tick.value && value >= tick.value || lastValue > tick.value && value <= tick.value ) {
              if ( phet.joist.elapsedTime - timeOfLastClick >= MIN_INTER_CLICK_TIME ) {
                generalSoftClickSoundPlayer.play();
                timeOfLastClick = phet.joist.elapsedTime;
              }
              break;
            }
          }
        }

        lastValue = value;
      }
    }, providedOptions );

    // ticks
    if ( options.showTicks ) {
      options.tickLabelSpacing = 2;
      options.majorTickLength = SoundConstants.MAJOR_TICK_LENGTH;
      options.minorTickLength = 8;
    }

    if ( !options.thumbNode ) {
      options.thumbSize = SoundConstants.THUMB_SIZE;
    }

    if ( !options.trackNode ) {
      options.trackSize = new Dimension2( 150, 1 );
    }

    super( property, property.range, options );

    options.showTicks && ticks.forEach( tick => {
      if ( tick.type === 'major' ) {

        this.addMajorTick( tick.value );
      }
      else {

        this.addMinorTick( tick.value );
      }
    } );
  }
}

sound.register( 'SoundSlider', SoundSlider );