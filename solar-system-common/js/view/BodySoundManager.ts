// Copyright 2023, University of Colorado Boulder

/**
 * Module in charge of controlling the sounds of the bodies in the simulation.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import SolarSystemCommonModel from '../model/SolarSystemCommonModel.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import soundConstants from '../../../tambo/js/soundConstants.js';
import Utils from '../../../dot/js/Utils.js';
import Bodies_Collide_Absorb_2_to_1_mp3 from '../../sounds/Bodies_Collide_Absorb_2_to_1_mp3.js';
import Bodies_Collide_Absorb_3_to_2_mp3 from '../../sounds/Bodies_Collide_Absorb_3_to_2_mp3.js';
import Bodies_Collide_Absorb_4_to_3_mp3 from '../../sounds/Bodies_Collide_Absorb_4_to_3_mp3.js';
import Collision_Sound_mp3 from '../../sounds/Collision_Sound_mp3.js';
import Mass_Selection_1_mp3 from '../../sounds/Mass_Selection_1_mp3.js';
import Mass_Selection_2_mp3 from '../../sounds/Mass_Selection_2_mp3.js';
import Mass_Selection_3_mp3 from '../../sounds/Mass_Selection_3_mp3.js';
import Mass_Selection_4_mp3 from '../../sounds/Mass_Selection_4_mp3.js';
import Metronome_Sound_1_mp3 from '../../sounds/Metronome_Sound_1_mp3.js';
import Metronome_Sound_2_mp3 from '../../sounds/Metronome_Sound_2_mp3.js';
import Metronome_Sound_Reverb_1_mp3 from '../../sounds/Metronome_Sound_Reverb_1_mp3.js';
import Metronome_Sound_Reverb_2_mp3 from '../../sounds/Metronome_Sound_Reverb_2_mp3.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';

const bodyNumberSounds = [
  Mass_Selection_1_mp3,
  Mass_Selection_2_mp3,
  Mass_Selection_3_mp3,
  Mass_Selection_4_mp3
];

// Sounds for when the bodies are reduced from the number control or collision
const removalSounds = [
  Bodies_Collide_Absorb_2_to_1_mp3,
  Bodies_Collide_Absorb_3_to_2_mp3,
  Bodies_Collide_Absorb_4_to_3_mp3,
  Collision_Sound_mp3
];

const metronomeSounds = [
  Metronome_Sound_1_mp3,
  Metronome_Sound_2_mp3,
  Metronome_Sound_Reverb_1_mp3,
  Metronome_Sound_Reverb_2_mp3
];

// Other scales available to play around with!
const METRONOME = [ 7, 0, 0, 0, 0, 0 ]; // METRONOME
// const METRONOME = [ 4, 2, 0, 2, 4, 4 ]; // ADDITIONAL
// const METRONOME = [ 0, 2, 4, 5, 7, 9 ]; // SCALE
// const METRONOME = [ 0, 2, 4, 7, 9, 12 ]; // PENTATONIC_SCALE
// const METRONOME = [ 0, 3, 5, 6, 7, 10 ]; // BLUES_SCALE

export default class BodySoundManager {
  private readonly model: SolarSystemCommonModel;
  private readonly bodyNumberSoundClips: SoundClip[];
  private readonly removalSoundClips: SoundClip[];
  private readonly metronomeSoundClips: SoundClip[];

  public constructor( model: SolarSystemCommonModel ) {
    this.model = model;

    this.bodyNumberSoundClips = bodyNumberSounds.map( sound => new SoundClip( sound, {
      initialOutputLevel: SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL * 2
    } ) );

    this.removalSoundClips = removalSounds.map( sound => new SoundClip( sound, {
      initialOutputLevel: SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL * 2
    } ) );

    this.metronomeSoundClips = metronomeSounds.map( sound => new SoundClip( sound, {
      rateChangesAffectPlayingSounds: false
    } ) );

    this.bodyNumberSoundClips.forEach( sound => soundManager.addSoundGenerator( sound ) );
    this.removalSoundClips.forEach( sound => soundManager.addSoundGenerator( sound ) );
    this.metronomeSoundClips.forEach( sound => soundManager.addSoundGenerator( sound ) );

    // Increasing the level of the collision sound
    this.removalSoundClips[ this.removalSoundClips.length - 1 ].setOutputLevel( 10 );
  }

  public playBodyAddedSound( bodyNumber: number ): void {
    this.bodyNumberSoundClips[ bodyNumber ].play();
  }

  public playBodyRemovedSound( bodyNumber: number ): void {
    this.removalSoundClips[ bodyNumber ].play();
  }

  /**
   *  This function plays the melody described in METRONOME based on the division index.
   *  Because of how scales work, they are powers of the twelfth root of 2.
   *
   *  The amount of divisions shifts the metronome sound up or down half an octave (1 to 1.5)
   *
   *  And depending on the semi major axis, the sound is small (muted) or big (with reverb)
   */
  public playOrbitalMetronome( i: number, semiMajorAxis: number, divisions: number ): void {
    const smallSound = this.metronomeSoundClips[ 0 ];
    const bigSound = this.metronomeSoundClips[ 2 ];

    const divisionOffset = 1 + divisions / 12;

    smallSound.setPlaybackRate( Math.pow( soundConstants.TWELFTH_ROOT_OF_TWO, METRONOME[ i ] ) * divisionOffset );
    smallSound.setOutputLevel( Utils.clamp( Utils.linear( 0, 500, 1, 0, semiMajorAxis ), 0, 1 ) );
    smallSound.play();


    bigSound.setPlaybackRate( Math.pow( soundConstants.TWELFTH_ROOT_OF_TWO, METRONOME[ i ] ) * divisionOffset );
    bigSound.setOutputLevel( Utils.clamp( Utils.linear( 100, 500, 0, 1, semiMajorAxis ), 0, 1 ) );
    bigSound.play();
  }
}


solarSystemCommon.register( 'BodySoundManager', BodySoundManager );