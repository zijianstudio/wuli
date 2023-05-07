// Copyright 2013-2022, University of Colorado Boulder

/**
 * audio player for the various sounds that are commonly used in PhET games
 *
 * @author John Blanco
 */

import SoundClip from '../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../tambo/js/soundManager.js';
import boing_mp3 from '../sounds/boing_mp3.js';
import cheer_mp3 from '../sounds/cheer_mp3.js';
import ding_mp3 from '../sounds/ding_mp3.js';
import organ_mp3 from '../sounds/organ_mp3.js';
import trumpet_mp3 from '../sounds/trumpet_mp3.js';
import vegas from './vegas.js';

// constants
const ding = new SoundClip( ding_mp3 );
const boing = new SoundClip( boing_mp3 );
const trumpet = new SoundClip( trumpet_mp3 );
const cheer = new SoundClip( cheer_mp3 );
const organ = new SoundClip( organ_mp3 );

let isInitialized = false;

/**
 * Adds all needed sounds to the sound manager.
 * Only does anything on the first time it is called.
 */
function addSoundsToSoundGenerator(): void {
  if ( !isInitialized ) {
    soundManager.addSoundGenerator( ding );
    soundManager.addSoundGenerator( boing );
    soundManager.addSoundGenerator( trumpet );
    soundManager.addSoundGenerator( cheer );
    soundManager.addSoundGenerator( organ );
    isInitialized = true;
  }
}

export default class GameAudioPlayer {

  public constructor() {
    addSoundsToSoundGenerator();
  }

  /**
   * play the sound that indicates a correct answer
   */
  public correctAnswer(): void {
    ding.play();
  }

  /**
   * play the sound that indicates an incorrect answer
   */
  public wrongAnswer(): void {
    boing.play();
  }

  /**
   * play the sound that indicates a challenge has been completed
   */
  public challengeComplete(): void {
    organ.play();
  }

  /**
   * play the sound that indicates that the user completed the game but didn't earn any points
   */
  public gameOverZeroScore(): void {
    boing.play();
  }

  /**
   * play the sound that indicates that the user finished the game and got some correct and some incorrect answers
   */
  public gameOverImperfectScore(): void {
    trumpet.play();
  }

  /**
   * play the sound that indicates that the user finished the game and got a perfect score
   */
  public gameOverPerfectScore(): void {
    cheer.play();
  }
}

vegas.register( 'GameAudioPlayer', GameAudioPlayer );