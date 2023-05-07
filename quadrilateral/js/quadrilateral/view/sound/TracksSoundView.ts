// Copyright 2022-2023, University of Colorado Boulder

/**
 * Base class for the sound designs. There are a collection of soundtracks that will play and represent shapes and
 * geometric properties. The sounds play in the background and loop forever, but their output level will change
 * depending on shape state and user input. By default, sound will only play for a few seconds after input with the
 * quadrilateral.
 *
 * Subclasses of this sound view will provide all the tracks to play and implement how their output level
 * should change with state of the shape.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import Enumeration from '../../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../../phet-core/js/EnumerationValue.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import soundManager from '../../../../../tambo/js/soundManager.js';
import WrappedAudioBuffer from '../../../../../tambo/js/WrappedAudioBuffer.js';
import quadrilateral from '../../../quadrilateral.js';
import QuadrilateralShapeModel from '../../model/QuadrilateralShapeModel.js';
import QuadrilateralSoundOptionsModel from '../../model/QuadrilateralSoundOptionsModel.js';

// In seconds, how long all tracks should play after there has been some change in shape.
const ALL_TRACKS_PLAY_TIME = 5;

// In seconds, how long tracks fade in or fade out when sound transitions between playing and stopped.
const FADE_TIME = 1;

// The maximum output level for all tracks of this sound design. Applied to this SoundGenerator, so that all tracks
// connected to this one will be limited by this output level.
const MAX_OUTPUT_LEVEL = 0.2;

// linear maps that determine output level from remaining fade time
const REMAINING_FADE_IN_TIME_TO_GAIN = new LinearFunction( FADE_TIME, 0, 0, MAX_OUTPUT_LEVEL );
const REMAINING_FADE_OUT_TIME_TO_GAIN = new LinearFunction( FADE_TIME, 0, MAX_OUTPUT_LEVEL, 0 );

// For the state of the sound view, indicating how sound is currently behaving.
class PlayingState extends EnumerationValue {
  public static readonly PLAYING = new PlayingState();
  public static readonly STOPPED = new PlayingState();
  public static readonly FADING_IN = new PlayingState();
  public static readonly FADING_OUT = new PlayingState();

  public static readonly enumeration = new Enumeration( PlayingState );
}

export default class TracksSoundView extends SoundGenerator {

  // Controls options for the sound design that may change from the Preferences dialog.
  private readonly soundOptionsModel: QuadrilateralSoundOptionsModel;

  // Array of all SoundGenerators from the provided tracks. They will play and loop forever in the background. Depending
  // on input and state of the quadrilateral shape, their output level will change.
  public readonly soundClips: readonly SoundClip[];

  // A map that goes from the index of the sound file to play to its desired output leve. Subclasses will populate this.
  public readonly indexToOutputLevelMap = new Map<number, number>();

  // How much time sounds should continue to play after interaction with the quadrilateral. If the user has
  // selected to play sounds forever, this variable is meaningless.
  private remainingPlayTime = 0;

  // How much time sounds should continue to fade for as we transition between playing and stopped.
  private remainingFadeTime = 0;

  // State variable that controls how the sound is currently playing, fading in, fading out, or solid play.
  private playingState: PlayingState = PlayingState.STOPPED;

  // Indicates that the shape has changed in some way so that we can fade into playing clips if playingState
  // is stopped or currently fading out.
  private shapeDirty = false;

  public constructor( shapeModel: QuadrilateralShapeModel, shapeSoundEnabledProperty: TReadOnlyProperty<boolean>, resetNotInProgressProperty: TReadOnlyProperty<boolean>, soundOptionsModel: QuadrilateralSoundOptionsModel, tracks: WrappedAudioBuffer[] ) {
    super( {

      // don't play sounds while model reset is in progress or when the user has opted out of playing music tracks
      enableControlProperties: [ resetNotInProgressProperty, shapeSoundEnabledProperty ],

      // No sound from this track set initially
      initialOutputLevel: 0
    } );

    this.soundOptionsModel = soundOptionsModel;

    this.soundClips = tracks.map( track => {

      // Create a looping SoundGenerator for the track and connect it to the gainNode of this parent SoundGenerator.
      // That way the volume of all clips can be controlled through the TracksSoundView. Initially silent until
      // state of the model determines this particular sub-sound should play.
      const generator = new SoundClip( track, {
        loop: true,
        initialOutputLevel: 0,

        // All sub-SoundClips need to align perfectly, do not trim any silence
        trimSilence: false
      } );
      generator.connect( this.masterGainNode );

      // immediately start playing all sounds, all control for this design uses output level
      generator.play();

      return generator;
    } );

    soundManager.addSoundGenerator( this );

    shapeModel.shapeChangedEmitter.addListener( () => {
      if ( resetNotInProgressProperty.value ) {

        // if we are stopped, transition to fading out
        this.shapeDirty = true;

        // if we are already playing, reset timing variables to continue playing for the full duration
        this.remainingPlayTime = ALL_TRACKS_PLAY_TIME;
      }
      else {

        // shape just changed due to reset, do not transition to fading in, stop all sound imediately
        this.stopPlayingImmediately();
      }
    } );

    // Stop playing all sounds immediately and reset state variables. Done on both disabled AND enabled because
    // when shape sounds are enabled again, we want the user to move the shape to hear new sounds.
    shapeSoundEnabledProperty.link( shapeSoundEnabled => {
      this.stopPlayingImmediately();
    } );
  }

  /**
   * Stop playing all sounds immediately and reset all timing variables and state so that sound is stopped.
   */
  private stopPlayingImmediately(): void {
    this.shapeDirty = false;
    this.playingState = PlayingState.STOPPED;
    this.remainingPlayTime = 0;
    this.remainingFadeTime = 0;
  }

  /**
   * Step the sound view, playing all tracks for a certain amount of time and reducing output level to zero. Since
   * tracks loop forever as we fade in and out of melodies, we set the output level instead of calling stop().
   *
   * @param dt - in seconds
   */
  public step( dt: number ): void {
    if ( this.playingState === PlayingState.STOPPED ) {
      if ( this.outputLevel !== 0 ) {
        this.setOutputLevel( 0 );
      }

      // Triggers indicate we should transition to fading in
      if ( this.shapeDirty ) {
        this.playingState = PlayingState.FADING_IN;
        this.remainingFadeTime = FADE_TIME;
        this.shapeDirty = false;
      }
    }
    else if ( this.playingState === PlayingState.PLAYING ) {

      // Updating counting variables and transition to fading out if it is time
      if ( !this.soundOptionsModel.tracksPlayForeverProperty.value ) {
        this.remainingPlayTime = Math.max( 0, this.remainingPlayTime - dt );
      }

      if ( this.remainingPlayTime === 0 ) {
        this.playingState = PlayingState.FADING_OUT;
        this.remainingFadeTime = FADE_TIME;
      }
    }
    else if ( this.playingState === PlayingState.FADING_IN ) {

      this.remainingFadeTime = Math.max( 0, this.remainingFadeTime - dt );
      this.setOutputLevel( REMAINING_FADE_IN_TIME_TO_GAIN.evaluate( this.remainingFadeTime ) );

      if ( this.remainingFadeTime === 0 ) {
        this.playingState = PlayingState.PLAYING;
      }
    }
    else if ( this.playingState === PlayingState.FADING_OUT ) {

      // update output level and counting variables, transition to STOPPED if it is time
      this.remainingFadeTime = Math.max( 0, this.remainingFadeTime - dt );
      this.setOutputLevel( REMAINING_FADE_OUT_TIME_TO_GAIN.evaluate( this.remainingFadeTime ) );

      if ( this.shapeDirty ) {

        // shape just changed again while fading out, fade in again for the time we spent and transition to fading in
        this.remainingFadeTime = FADE_TIME - this.remainingFadeTime;
        this.playingState = PlayingState.FADING_IN;
        this.shapeDirty = false;
      }
      else if ( this.remainingFadeTime === 0 ) {

        // No interaction since start of fade out, transition to stopped
        this.playingState = PlayingState.STOPPED;
      }
    }
  }

  /**
   * Remove all SoundGenerators associated with this view so that they stop playing sounds.
   */
  public override dispose(): void {
    this.soundClips.forEach( generator => {
      generator.disconnect( this.masterGainNode );
      generator.dispose();
    } );

    super.dispose();
  }
}

quadrilateral.register( 'TracksSoundView', TracksSoundView );