// Copyright 2022, University of Colorado Boulder

/**
 * PerceivedColorSoundGenerator generates a sound that indicates the color that is being perceived by the person in the
 * model.  It mixes together sounds that correspond to the red, green, and blue levels that are being perceived.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

// TODO: There are a number of build- or run-time options in this file for different sounds.  They exists to support
//       comparisons between different options in the sound design, and should be removed once the design is finalized.
//       see https://github.com/phetsims/color-vision/issues/139.

import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../tambo/js/sound-generators/SoundGenerator.js';
import colorVisionHighAmbienceV2_mp3 from '../../../sounds/colorVisionHighAmbienceV2_mp3.js';
import colorVisionIndividualNotesChord01_mp3 from '../../../sounds/colorVisionIndividualNotesChord01_mp3.js';
import colorVisionIndividualNotesChord02_mp3 from '../../../sounds/colorVisionIndividualNotesChord02_mp3.js';
import colorVisionIndividualNotesChord03_mp3 from '../../../sounds/colorVisionIndividualNotesChord03_mp3.js';
import colorVisionIndividualNotesOctave01_mp3 from '../../../sounds/colorVisionIndividualNotesOctave01_mp3.js';
import colorVisionIndividualNotesOctave02_mp3 from '../../../sounds/colorVisionIndividualNotesOctave02_mp3.js';
import colorVisionIndividualNotesOctave03_mp3 from '../../../sounds/colorVisionIndividualNotesOctave03_mp3.js';
import colorVisionLowAmbienceV2_mp3 from '../../../sounds/colorVisionLowAmbienceV2_mp3.js';
import colorVisionMidAmbienceV2_mp3 from '../../../sounds/colorVisionMidAmbienceV2_mp3.js';
import colorVision from '../../colorVision.js';

// constants
const CONSTITUENT_SOUND_CLIP_OPTIONS = {
  loop: true
};

const SOUND_SETS = [
  [ colorVisionIndividualNotesChord01_mp3, colorVisionIndividualNotesChord02_mp3, colorVisionIndividualNotesChord03_mp3 ],
  [ colorVisionIndividualNotesOctave01_mp3, colorVisionIndividualNotesOctave02_mp3, colorVisionIndividualNotesOctave03_mp3 ],
  [ colorVisionLowAmbienceV2_mp3, colorVisionMidAmbienceV2_mp3, colorVisionHighAmbienceV2_mp3 ]
];

const SOUND_SET = SOUND_SETS[ 0 ];

const USE_FILTERS = true;

const LOW_FILTER_RANGE = new Range( 200, 2000 );
const MID_FILTER_RANGE = new Range( 200, 4000 );
const HIGH_FILTER_RANGE = new Range( 300, 8000 );

class PerceivedColorSoundGenerator extends SoundGenerator {

  /**
   * @param {Property.<Color>} perceivedColorProperty
   * @param {SoundGeneratorOptions} [options]
   */
  constructor( perceivedColorProperty, options ) {

    super( options );

    // Create sound clips for the three light ranges, i.e. R, G, and B.
    const lowRangeSoundClip = new SoundClip( SOUND_SET[ 0 ], CONSTITUENT_SOUND_CLIP_OPTIONS );
    const midRangeSoundClip = new SoundClip( SOUND_SET[ 1 ], CONSTITUENT_SOUND_CLIP_OPTIONS );
    const highRangeSoundClip = new SoundClip( SOUND_SET[ 2 ], CONSTITUENT_SOUND_CLIP_OPTIONS );

    // Create the filters that will be used to alter the source sounds if they are turned on.
    let lowFilter = null;
    let midFilter = null;
    let highFilter = null;
    if ( USE_FILTERS ) {
      const now = this.audioContext.currentTime;
      lowFilter = this.audioContext.createBiquadFilter();
      lowFilter.type = 'lowpass';
      lowFilter.frequency.setValueAtTime( LOW_FILTER_RANGE.min, now );
      midFilter = this.audioContext.createBiquadFilter();
      midFilter.type = 'lowpass';
      midFilter.frequency.setValueAtTime( MID_FILTER_RANGE.min, now );
      highFilter = this.audioContext.createBiquadFilter();
      highFilter.type = 'lowpass';
      highFilter.frequency.setValueAtTime( HIGH_FILTER_RANGE.min, now );

      // Wire up the audio path.
      lowRangeSoundClip.connect( lowFilter );
      lowFilter.connect( this.masterGainNode );
      midRangeSoundClip.connect( midFilter );
      midFilter.connect( this.masterGainNode );
      highRangeSoundClip.connect( highFilter );
      highFilter.connect( this.masterGainNode );
    }
    else {
      lowRangeSoundClip.connect( this.masterGainNode );
      midRangeSoundClip.connect( this.masterGainNode );
      highRangeSoundClip.connect( this.masterGainNode );
    }

    // Adjust the audio based on the perceived color.  This may lead to changes in volume or filter frequencies.
    perceivedColorProperty.link( perceivedColor => {
      if ( USE_FILTERS ) {
        adjustAudio( perceivedColor.r, perceivedColor.a, lowRangeSoundClip, lowFilter, LOW_FILTER_RANGE );
        adjustAudio( perceivedColor.g, perceivedColor.a, midRangeSoundClip, midFilter, MID_FILTER_RANGE );
        adjustAudio( perceivedColor.b, perceivedColor.a, highRangeSoundClip, highFilter, HIGH_FILTER_RANGE );
      }
      else {
        adjustSoundLevel( perceivedColor.r, perceivedColor.a, lowRangeSoundClip );
        adjustSoundLevel( perceivedColor.g, perceivedColor.a, midRangeSoundClip );
        adjustSoundLevel( perceivedColor.b, perceivedColor.a, highRangeSoundClip );
      }
    } );
  }
}

// helper function to adjust output level, created to avoid code duplication
const adjustSoundLevel = ( colorLevel, alpha, soundClip ) => {
  const normalizedColorLevel = Utils.clamp( ( colorLevel * alpha ) / 255, 0, 1 );
  if ( normalizedColorLevel === 0 && soundClip.isPlaying ) {
    soundClip.stop();
  }
  else if ( normalizedColorLevel > 0 && !soundClip.isPlaying ) {
    soundClip.play();
  }
  soundClip.setOutputLevel( normalizedColorLevel );
};

// helper function to adjust filter cutoff frequency and sound clip output level, created to avoid code duplication
const adjustAudio = ( colorLevel, alpha, soundClip, filter, filterRange ) => {
  const normalizedColorLevel = Utils.clamp( ( colorLevel * alpha ) / 255, 0, 1 );
  if ( normalizedColorLevel === 0 && soundClip.isPlaying ) {
    soundClip.stop();
  }
  else if ( normalizedColorLevel > 0 && !soundClip.isPlaying ) {
    soundClip.play();
  }
  filter.frequency.setValueAtTime( filterRange.expandNormalizedValue( Math.pow( normalizedColorLevel, 4 ) ), 0 );
};

colorVision.register( 'PerceivedColorSoundGenerator', PerceivedColorSoundGenerator );

export default PerceivedColorSoundGenerator;