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

import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import Enumeration from '../../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../../phet-core/js/EnumerationValue.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import soundManager from '../../../../../tambo/js/soundManager.js';
import quadrilateral from '../../../quadrilateral.js';
// In seconds, how long all tracks should play after there has been some change in shape.
const ALL_TRACKS_PLAY_TIME = 5;

// In seconds, how long tracks fade in or fade out when sound transitions between playing and stopped.
const FADE_TIME = 1;

// The maximum output level for all tracks of this sound design. Applied to this SoundGenerator, so that all tracks
// connected to this one will be limited by this output level.
const MAX_OUTPUT_LEVEL = 0.2;

// linear maps that determine output level from remaining fade time
const REMAINING_FADE_IN_TIME_TO_GAIN = new LinearFunction(FADE_TIME, 0, 0, MAX_OUTPUT_LEVEL);
const REMAINING_FADE_OUT_TIME_TO_GAIN = new LinearFunction(FADE_TIME, 0, MAX_OUTPUT_LEVEL, 0);

// For the state of the sound view, indicating how sound is currently behaving.
class PlayingState extends EnumerationValue {
  static PLAYING = new PlayingState();
  static STOPPED = new PlayingState();
  static FADING_IN = new PlayingState();
  static FADING_OUT = new PlayingState();
  static enumeration = new Enumeration(PlayingState);
}
export default class TracksSoundView extends SoundGenerator {
  // Controls options for the sound design that may change from the Preferences dialog.

  // Array of all SoundGenerators from the provided tracks. They will play and loop forever in the background. Depending
  // on input and state of the quadrilateral shape, their output level will change.
  // A map that goes from the index of the sound file to play to its desired output leve. Subclasses will populate this.
  indexToOutputLevelMap = new Map();

  // How much time sounds should continue to play after interaction with the quadrilateral. If the user has
  // selected to play sounds forever, this variable is meaningless.
  remainingPlayTime = 0;

  // How much time sounds should continue to fade for as we transition between playing and stopped.
  remainingFadeTime = 0;

  // State variable that controls how the sound is currently playing, fading in, fading out, or solid play.
  playingState = PlayingState.STOPPED;

  // Indicates that the shape has changed in some way so that we can fade into playing clips if playingState
  // is stopped or currently fading out.
  shapeDirty = false;
  constructor(shapeModel, shapeSoundEnabledProperty, resetNotInProgressProperty, soundOptionsModel, tracks) {
    super({
      // don't play sounds while model reset is in progress or when the user has opted out of playing music tracks
      enableControlProperties: [resetNotInProgressProperty, shapeSoundEnabledProperty],
      // No sound from this track set initially
      initialOutputLevel: 0
    });
    this.soundOptionsModel = soundOptionsModel;
    this.soundClips = tracks.map(track => {
      // Create a looping SoundGenerator for the track and connect it to the gainNode of this parent SoundGenerator.
      // That way the volume of all clips can be controlled through the TracksSoundView. Initially silent until
      // state of the model determines this particular sub-sound should play.
      const generator = new SoundClip(track, {
        loop: true,
        initialOutputLevel: 0,
        // All sub-SoundClips need to align perfectly, do not trim any silence
        trimSilence: false
      });
      generator.connect(this.masterGainNode);

      // immediately start playing all sounds, all control for this design uses output level
      generator.play();
      return generator;
    });
    soundManager.addSoundGenerator(this);
    shapeModel.shapeChangedEmitter.addListener(() => {
      if (resetNotInProgressProperty.value) {
        // if we are stopped, transition to fading out
        this.shapeDirty = true;

        // if we are already playing, reset timing variables to continue playing for the full duration
        this.remainingPlayTime = ALL_TRACKS_PLAY_TIME;
      } else {
        // shape just changed due to reset, do not transition to fading in, stop all sound imediately
        this.stopPlayingImmediately();
      }
    });

    // Stop playing all sounds immediately and reset state variables. Done on both disabled AND enabled because
    // when shape sounds are enabled again, we want the user to move the shape to hear new sounds.
    shapeSoundEnabledProperty.link(shapeSoundEnabled => {
      this.stopPlayingImmediately();
    });
  }

  /**
   * Stop playing all sounds immediately and reset all timing variables and state so that sound is stopped.
   */
  stopPlayingImmediately() {
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
  step(dt) {
    if (this.playingState === PlayingState.STOPPED) {
      if (this.outputLevel !== 0) {
        this.setOutputLevel(0);
      }

      // Triggers indicate we should transition to fading in
      if (this.shapeDirty) {
        this.playingState = PlayingState.FADING_IN;
        this.remainingFadeTime = FADE_TIME;
        this.shapeDirty = false;
      }
    } else if (this.playingState === PlayingState.PLAYING) {
      // Updating counting variables and transition to fading out if it is time
      if (!this.soundOptionsModel.tracksPlayForeverProperty.value) {
        this.remainingPlayTime = Math.max(0, this.remainingPlayTime - dt);
      }
      if (this.remainingPlayTime === 0) {
        this.playingState = PlayingState.FADING_OUT;
        this.remainingFadeTime = FADE_TIME;
      }
    } else if (this.playingState === PlayingState.FADING_IN) {
      this.remainingFadeTime = Math.max(0, this.remainingFadeTime - dt);
      this.setOutputLevel(REMAINING_FADE_IN_TIME_TO_GAIN.evaluate(this.remainingFadeTime));
      if (this.remainingFadeTime === 0) {
        this.playingState = PlayingState.PLAYING;
      }
    } else if (this.playingState === PlayingState.FADING_OUT) {
      // update output level and counting variables, transition to STOPPED if it is time
      this.remainingFadeTime = Math.max(0, this.remainingFadeTime - dt);
      this.setOutputLevel(REMAINING_FADE_OUT_TIME_TO_GAIN.evaluate(this.remainingFadeTime));
      if (this.shapeDirty) {
        // shape just changed again while fading out, fade in again for the time we spent and transition to fading in
        this.remainingFadeTime = FADE_TIME - this.remainingFadeTime;
        this.playingState = PlayingState.FADING_IN;
        this.shapeDirty = false;
      } else if (this.remainingFadeTime === 0) {
        // No interaction since start of fade out, transition to stopped
        this.playingState = PlayingState.STOPPED;
      }
    }
  }

  /**
   * Remove all SoundGenerators associated with this view so that they stop playing sounds.
   */
  dispose() {
    this.soundClips.forEach(generator => {
      generator.disconnect(this.masterGainNode);
      generator.dispose();
    });
    super.dispose();
  }
}
quadrilateral.register('TracksSoundView', TracksSoundView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lYXJGdW5jdGlvbiIsIkVudW1lcmF0aW9uIiwiRW51bWVyYXRpb25WYWx1ZSIsIlNvdW5kQ2xpcCIsIlNvdW5kR2VuZXJhdG9yIiwic291bmRNYW5hZ2VyIiwicXVhZHJpbGF0ZXJhbCIsIkFMTF9UUkFDS1NfUExBWV9USU1FIiwiRkFERV9USU1FIiwiTUFYX09VVFBVVF9MRVZFTCIsIlJFTUFJTklOR19GQURFX0lOX1RJTUVfVE9fR0FJTiIsIlJFTUFJTklOR19GQURFX09VVF9USU1FX1RPX0dBSU4iLCJQbGF5aW5nU3RhdGUiLCJQTEFZSU5HIiwiU1RPUFBFRCIsIkZBRElOR19JTiIsIkZBRElOR19PVVQiLCJlbnVtZXJhdGlvbiIsIlRyYWNrc1NvdW5kVmlldyIsImluZGV4VG9PdXRwdXRMZXZlbE1hcCIsIk1hcCIsInJlbWFpbmluZ1BsYXlUaW1lIiwicmVtYWluaW5nRmFkZVRpbWUiLCJwbGF5aW5nU3RhdGUiLCJzaGFwZURpcnR5IiwiY29uc3RydWN0b3IiLCJzaGFwZU1vZGVsIiwic2hhcGVTb3VuZEVuYWJsZWRQcm9wZXJ0eSIsInJlc2V0Tm90SW5Qcm9ncmVzc1Byb3BlcnR5Iiwic291bmRPcHRpb25zTW9kZWwiLCJ0cmFja3MiLCJlbmFibGVDb250cm9sUHJvcGVydGllcyIsImluaXRpYWxPdXRwdXRMZXZlbCIsInNvdW5kQ2xpcHMiLCJtYXAiLCJ0cmFjayIsImdlbmVyYXRvciIsImxvb3AiLCJ0cmltU2lsZW5jZSIsImNvbm5lY3QiLCJtYXN0ZXJHYWluTm9kZSIsInBsYXkiLCJhZGRTb3VuZEdlbmVyYXRvciIsInNoYXBlQ2hhbmdlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInZhbHVlIiwic3RvcFBsYXlpbmdJbW1lZGlhdGVseSIsImxpbmsiLCJzaGFwZVNvdW5kRW5hYmxlZCIsInN0ZXAiLCJkdCIsIm91dHB1dExldmVsIiwic2V0T3V0cHV0TGV2ZWwiLCJ0cmFja3NQbGF5Rm9yZXZlclByb3BlcnR5IiwiTWF0aCIsIm1heCIsImV2YWx1YXRlIiwiZGlzcG9zZSIsImZvckVhY2giLCJkaXNjb25uZWN0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUcmFja3NTb3VuZFZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmFzZSBjbGFzcyBmb3IgdGhlIHNvdW5kIGRlc2lnbnMuIFRoZXJlIGFyZSBhIGNvbGxlY3Rpb24gb2Ygc291bmR0cmFja3MgdGhhdCB3aWxsIHBsYXkgYW5kIHJlcHJlc2VudCBzaGFwZXMgYW5kXHJcbiAqIGdlb21ldHJpYyBwcm9wZXJ0aWVzLiBUaGUgc291bmRzIHBsYXkgaW4gdGhlIGJhY2tncm91bmQgYW5kIGxvb3AgZm9yZXZlciwgYnV0IHRoZWlyIG91dHB1dCBsZXZlbCB3aWxsIGNoYW5nZVxyXG4gKiBkZXBlbmRpbmcgb24gc2hhcGUgc3RhdGUgYW5kIHVzZXIgaW5wdXQuIEJ5IGRlZmF1bHQsIHNvdW5kIHdpbGwgb25seSBwbGF5IGZvciBhIGZldyBzZWNvbmRzIGFmdGVyIGlucHV0IHdpdGggdGhlXHJcbiAqIHF1YWRyaWxhdGVyYWwuXHJcbiAqXHJcbiAqIFN1YmNsYXNzZXMgb2YgdGhpcyBzb3VuZCB2aWV3IHdpbGwgcHJvdmlkZSBhbGwgdGhlIHRyYWNrcyB0byBwbGF5IGFuZCBpbXBsZW1lbnQgaG93IHRoZWlyIG91dHB1dCBsZXZlbFxyXG4gKiBzaG91bGQgY2hhbmdlIHdpdGggc3RhdGUgb2YgdGhlIHNoYXBlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBMaW5lYXJGdW5jdGlvbiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvTGluZWFyRnVuY3Rpb24uanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xyXG5pbXBvcnQgU291bmRDbGlwIGZyb20gJy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvU291bmRDbGlwLmpzJztcclxuaW1wb3J0IFNvdW5kR2VuZXJhdG9yIGZyb20gJy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvU291bmRHZW5lcmF0b3IuanMnO1xyXG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci5qcyc7XHJcbmltcG9ydCBXcmFwcGVkQXVkaW9CdWZmZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vdGFtYm8vanMvV3JhcHBlZEF1ZGlvQnVmZmVyLmpzJztcclxuaW1wb3J0IHF1YWRyaWxhdGVyYWwgZnJvbSAnLi4vLi4vLi4vcXVhZHJpbGF0ZXJhbC5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsU2hhcGVNb2RlbCBmcm9tICcuLi8uLi9tb2RlbC9RdWFkcmlsYXRlcmFsU2hhcGVNb2RlbC5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsU291bmRPcHRpb25zTW9kZWwgZnJvbSAnLi4vLi4vbW9kZWwvUXVhZHJpbGF0ZXJhbFNvdW5kT3B0aW9uc01vZGVsLmpzJztcclxuXHJcbi8vIEluIHNlY29uZHMsIGhvdyBsb25nIGFsbCB0cmFja3Mgc2hvdWxkIHBsYXkgYWZ0ZXIgdGhlcmUgaGFzIGJlZW4gc29tZSBjaGFuZ2UgaW4gc2hhcGUuXHJcbmNvbnN0IEFMTF9UUkFDS1NfUExBWV9USU1FID0gNTtcclxuXHJcbi8vIEluIHNlY29uZHMsIGhvdyBsb25nIHRyYWNrcyBmYWRlIGluIG9yIGZhZGUgb3V0IHdoZW4gc291bmQgdHJhbnNpdGlvbnMgYmV0d2VlbiBwbGF5aW5nIGFuZCBzdG9wcGVkLlxyXG5jb25zdCBGQURFX1RJTUUgPSAxO1xyXG5cclxuLy8gVGhlIG1heGltdW0gb3V0cHV0IGxldmVsIGZvciBhbGwgdHJhY2tzIG9mIHRoaXMgc291bmQgZGVzaWduLiBBcHBsaWVkIHRvIHRoaXMgU291bmRHZW5lcmF0b3IsIHNvIHRoYXQgYWxsIHRyYWNrc1xyXG4vLyBjb25uZWN0ZWQgdG8gdGhpcyBvbmUgd2lsbCBiZSBsaW1pdGVkIGJ5IHRoaXMgb3V0cHV0IGxldmVsLlxyXG5jb25zdCBNQVhfT1VUUFVUX0xFVkVMID0gMC4yO1xyXG5cclxuLy8gbGluZWFyIG1hcHMgdGhhdCBkZXRlcm1pbmUgb3V0cHV0IGxldmVsIGZyb20gcmVtYWluaW5nIGZhZGUgdGltZVxyXG5jb25zdCBSRU1BSU5JTkdfRkFERV9JTl9USU1FX1RPX0dBSU4gPSBuZXcgTGluZWFyRnVuY3Rpb24oIEZBREVfVElNRSwgMCwgMCwgTUFYX09VVFBVVF9MRVZFTCApO1xyXG5jb25zdCBSRU1BSU5JTkdfRkFERV9PVVRfVElNRV9UT19HQUlOID0gbmV3IExpbmVhckZ1bmN0aW9uKCBGQURFX1RJTUUsIDAsIE1BWF9PVVRQVVRfTEVWRUwsIDAgKTtcclxuXHJcbi8vIEZvciB0aGUgc3RhdGUgb2YgdGhlIHNvdW5kIHZpZXcsIGluZGljYXRpbmcgaG93IHNvdW5kIGlzIGN1cnJlbnRseSBiZWhhdmluZy5cclxuY2xhc3MgUGxheWluZ1N0YXRlIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBQTEFZSU5HID0gbmV3IFBsYXlpbmdTdGF0ZSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU1RPUFBFRCA9IG5ldyBQbGF5aW5nU3RhdGUoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEZBRElOR19JTiA9IG5ldyBQbGF5aW5nU3RhdGUoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEZBRElOR19PVVQgPSBuZXcgUGxheWluZ1N0YXRlKCk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIFBsYXlpbmdTdGF0ZSApO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmFja3NTb3VuZFZpZXcgZXh0ZW5kcyBTb3VuZEdlbmVyYXRvciB7XHJcblxyXG4gIC8vIENvbnRyb2xzIG9wdGlvbnMgZm9yIHRoZSBzb3VuZCBkZXNpZ24gdGhhdCBtYXkgY2hhbmdlIGZyb20gdGhlIFByZWZlcmVuY2VzIGRpYWxvZy5cclxuICBwcml2YXRlIHJlYWRvbmx5IHNvdW5kT3B0aW9uc01vZGVsOiBRdWFkcmlsYXRlcmFsU291bmRPcHRpb25zTW9kZWw7XHJcblxyXG4gIC8vIEFycmF5IG9mIGFsbCBTb3VuZEdlbmVyYXRvcnMgZnJvbSB0aGUgcHJvdmlkZWQgdHJhY2tzLiBUaGV5IHdpbGwgcGxheSBhbmQgbG9vcCBmb3JldmVyIGluIHRoZSBiYWNrZ3JvdW5kLiBEZXBlbmRpbmdcclxuICAvLyBvbiBpbnB1dCBhbmQgc3RhdGUgb2YgdGhlIHF1YWRyaWxhdGVyYWwgc2hhcGUsIHRoZWlyIG91dHB1dCBsZXZlbCB3aWxsIGNoYW5nZS5cclxuICBwdWJsaWMgcmVhZG9ubHkgc291bmRDbGlwczogcmVhZG9ubHkgU291bmRDbGlwW107XHJcblxyXG4gIC8vIEEgbWFwIHRoYXQgZ29lcyBmcm9tIHRoZSBpbmRleCBvZiB0aGUgc291bmQgZmlsZSB0byBwbGF5IHRvIGl0cyBkZXNpcmVkIG91dHB1dCBsZXZlLiBTdWJjbGFzc2VzIHdpbGwgcG9wdWxhdGUgdGhpcy5cclxuICBwdWJsaWMgcmVhZG9ubHkgaW5kZXhUb091dHB1dExldmVsTWFwID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcclxuXHJcbiAgLy8gSG93IG11Y2ggdGltZSBzb3VuZHMgc2hvdWxkIGNvbnRpbnVlIHRvIHBsYXkgYWZ0ZXIgaW50ZXJhY3Rpb24gd2l0aCB0aGUgcXVhZHJpbGF0ZXJhbC4gSWYgdGhlIHVzZXIgaGFzXHJcbiAgLy8gc2VsZWN0ZWQgdG8gcGxheSBzb3VuZHMgZm9yZXZlciwgdGhpcyB2YXJpYWJsZSBpcyBtZWFuaW5nbGVzcy5cclxuICBwcml2YXRlIHJlbWFpbmluZ1BsYXlUaW1lID0gMDtcclxuXHJcbiAgLy8gSG93IG11Y2ggdGltZSBzb3VuZHMgc2hvdWxkIGNvbnRpbnVlIHRvIGZhZGUgZm9yIGFzIHdlIHRyYW5zaXRpb24gYmV0d2VlbiBwbGF5aW5nIGFuZCBzdG9wcGVkLlxyXG4gIHByaXZhdGUgcmVtYWluaW5nRmFkZVRpbWUgPSAwO1xyXG5cclxuICAvLyBTdGF0ZSB2YXJpYWJsZSB0aGF0IGNvbnRyb2xzIGhvdyB0aGUgc291bmQgaXMgY3VycmVudGx5IHBsYXlpbmcsIGZhZGluZyBpbiwgZmFkaW5nIG91dCwgb3Igc29saWQgcGxheS5cclxuICBwcml2YXRlIHBsYXlpbmdTdGF0ZTogUGxheWluZ1N0YXRlID0gUGxheWluZ1N0YXRlLlNUT1BQRUQ7XHJcblxyXG4gIC8vIEluZGljYXRlcyB0aGF0IHRoZSBzaGFwZSBoYXMgY2hhbmdlZCBpbiBzb21lIHdheSBzbyB0aGF0IHdlIGNhbiBmYWRlIGludG8gcGxheWluZyBjbGlwcyBpZiBwbGF5aW5nU3RhdGVcclxuICAvLyBpcyBzdG9wcGVkIG9yIGN1cnJlbnRseSBmYWRpbmcgb3V0LlxyXG4gIHByaXZhdGUgc2hhcGVEaXJ0eSA9IGZhbHNlO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNoYXBlTW9kZWw6IFF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsLCBzaGFwZVNvdW5kRW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiwgcmVzZXROb3RJblByb2dyZXNzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LCBzb3VuZE9wdGlvbnNNb2RlbDogUXVhZHJpbGF0ZXJhbFNvdW5kT3B0aW9uc01vZGVsLCB0cmFja3M6IFdyYXBwZWRBdWRpb0J1ZmZlcltdICkge1xyXG4gICAgc3VwZXIoIHtcclxuXHJcbiAgICAgIC8vIGRvbid0IHBsYXkgc291bmRzIHdoaWxlIG1vZGVsIHJlc2V0IGlzIGluIHByb2dyZXNzIG9yIHdoZW4gdGhlIHVzZXIgaGFzIG9wdGVkIG91dCBvZiBwbGF5aW5nIG11c2ljIHRyYWNrc1xyXG4gICAgICBlbmFibGVDb250cm9sUHJvcGVydGllczogWyByZXNldE5vdEluUHJvZ3Jlc3NQcm9wZXJ0eSwgc2hhcGVTb3VuZEVuYWJsZWRQcm9wZXJ0eSBdLFxyXG5cclxuICAgICAgLy8gTm8gc291bmQgZnJvbSB0aGlzIHRyYWNrIHNldCBpbml0aWFsbHlcclxuICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zb3VuZE9wdGlvbnNNb2RlbCA9IHNvdW5kT3B0aW9uc01vZGVsO1xyXG5cclxuICAgIHRoaXMuc291bmRDbGlwcyA9IHRyYWNrcy5tYXAoIHRyYWNrID0+IHtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSBhIGxvb3BpbmcgU291bmRHZW5lcmF0b3IgZm9yIHRoZSB0cmFjayBhbmQgY29ubmVjdCBpdCB0byB0aGUgZ2Fpbk5vZGUgb2YgdGhpcyBwYXJlbnQgU291bmRHZW5lcmF0b3IuXHJcbiAgICAgIC8vIFRoYXQgd2F5IHRoZSB2b2x1bWUgb2YgYWxsIGNsaXBzIGNhbiBiZSBjb250cm9sbGVkIHRocm91Z2ggdGhlIFRyYWNrc1NvdW5kVmlldy4gSW5pdGlhbGx5IHNpbGVudCB1bnRpbFxyXG4gICAgICAvLyBzdGF0ZSBvZiB0aGUgbW9kZWwgZGV0ZXJtaW5lcyB0aGlzIHBhcnRpY3VsYXIgc3ViLXNvdW5kIHNob3VsZCBwbGF5LlxyXG4gICAgICBjb25zdCBnZW5lcmF0b3IgPSBuZXcgU291bmRDbGlwKCB0cmFjaywge1xyXG4gICAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLFxyXG5cclxuICAgICAgICAvLyBBbGwgc3ViLVNvdW5kQ2xpcHMgbmVlZCB0byBhbGlnbiBwZXJmZWN0bHksIGRvIG5vdCB0cmltIGFueSBzaWxlbmNlXHJcbiAgICAgICAgdHJpbVNpbGVuY2U6IGZhbHNlXHJcbiAgICAgIH0gKTtcclxuICAgICAgZ2VuZXJhdG9yLmNvbm5lY3QoIHRoaXMubWFzdGVyR2Fpbk5vZGUgKTtcclxuXHJcbiAgICAgIC8vIGltbWVkaWF0ZWx5IHN0YXJ0IHBsYXlpbmcgYWxsIHNvdW5kcywgYWxsIGNvbnRyb2wgZm9yIHRoaXMgZGVzaWduIHVzZXMgb3V0cHV0IGxldmVsXHJcbiAgICAgIGdlbmVyYXRvci5wbGF5KCk7XHJcblxyXG4gICAgICByZXR1cm4gZ2VuZXJhdG9yO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggdGhpcyApO1xyXG5cclxuICAgIHNoYXBlTW9kZWwuc2hhcGVDaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBpZiAoIHJlc2V0Tm90SW5Qcm9ncmVzc1Byb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgICAvLyBpZiB3ZSBhcmUgc3RvcHBlZCwgdHJhbnNpdGlvbiB0byBmYWRpbmcgb3V0XHJcbiAgICAgICAgdGhpcy5zaGFwZURpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gaWYgd2UgYXJlIGFscmVhZHkgcGxheWluZywgcmVzZXQgdGltaW5nIHZhcmlhYmxlcyB0byBjb250aW51ZSBwbGF5aW5nIGZvciB0aGUgZnVsbCBkdXJhdGlvblxyXG4gICAgICAgIHRoaXMucmVtYWluaW5nUGxheVRpbWUgPSBBTExfVFJBQ0tTX1BMQVlfVElNRTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gc2hhcGUganVzdCBjaGFuZ2VkIGR1ZSB0byByZXNldCwgZG8gbm90IHRyYW5zaXRpb24gdG8gZmFkaW5nIGluLCBzdG9wIGFsbCBzb3VuZCBpbWVkaWF0ZWx5XHJcbiAgICAgICAgdGhpcy5zdG9wUGxheWluZ0ltbWVkaWF0ZWx5KCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTdG9wIHBsYXlpbmcgYWxsIHNvdW5kcyBpbW1lZGlhdGVseSBhbmQgcmVzZXQgc3RhdGUgdmFyaWFibGVzLiBEb25lIG9uIGJvdGggZGlzYWJsZWQgQU5EIGVuYWJsZWQgYmVjYXVzZVxyXG4gICAgLy8gd2hlbiBzaGFwZSBzb3VuZHMgYXJlIGVuYWJsZWQgYWdhaW4sIHdlIHdhbnQgdGhlIHVzZXIgdG8gbW92ZSB0aGUgc2hhcGUgdG8gaGVhciBuZXcgc291bmRzLlxyXG4gICAgc2hhcGVTb3VuZEVuYWJsZWRQcm9wZXJ0eS5saW5rKCBzaGFwZVNvdW5kRW5hYmxlZCA9PiB7XHJcbiAgICAgIHRoaXMuc3RvcFBsYXlpbmdJbW1lZGlhdGVseSgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RvcCBwbGF5aW5nIGFsbCBzb3VuZHMgaW1tZWRpYXRlbHkgYW5kIHJlc2V0IGFsbCB0aW1pbmcgdmFyaWFibGVzIGFuZCBzdGF0ZSBzbyB0aGF0IHNvdW5kIGlzIHN0b3BwZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdG9wUGxheWluZ0ltbWVkaWF0ZWx5KCk6IHZvaWQge1xyXG4gICAgdGhpcy5zaGFwZURpcnR5ID0gZmFsc2U7XHJcbiAgICB0aGlzLnBsYXlpbmdTdGF0ZSA9IFBsYXlpbmdTdGF0ZS5TVE9QUEVEO1xyXG4gICAgdGhpcy5yZW1haW5pbmdQbGF5VGltZSA9IDA7XHJcbiAgICB0aGlzLnJlbWFpbmluZ0ZhZGVUaW1lID0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXAgdGhlIHNvdW5kIHZpZXcsIHBsYXlpbmcgYWxsIHRyYWNrcyBmb3IgYSBjZXJ0YWluIGFtb3VudCBvZiB0aW1lIGFuZCByZWR1Y2luZyBvdXRwdXQgbGV2ZWwgdG8gemVyby4gU2luY2VcclxuICAgKiB0cmFja3MgbG9vcCBmb3JldmVyIGFzIHdlIGZhZGUgaW4gYW5kIG91dCBvZiBtZWxvZGllcywgd2Ugc2V0IHRoZSBvdXRwdXQgbGV2ZWwgaW5zdGVhZCBvZiBjYWxsaW5nIHN0b3AoKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkdCAtIGluIHNlY29uZHNcclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5wbGF5aW5nU3RhdGUgPT09IFBsYXlpbmdTdGF0ZS5TVE9QUEVEICkge1xyXG4gICAgICBpZiAoIHRoaXMub3V0cHV0TGV2ZWwgIT09IDAgKSB7XHJcbiAgICAgICAgdGhpcy5zZXRPdXRwdXRMZXZlbCggMCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUcmlnZ2VycyBpbmRpY2F0ZSB3ZSBzaG91bGQgdHJhbnNpdGlvbiB0byBmYWRpbmcgaW5cclxuICAgICAgaWYgKCB0aGlzLnNoYXBlRGlydHkgKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5aW5nU3RhdGUgPSBQbGF5aW5nU3RhdGUuRkFESU5HX0lOO1xyXG4gICAgICAgIHRoaXMucmVtYWluaW5nRmFkZVRpbWUgPSBGQURFX1RJTUU7XHJcbiAgICAgICAgdGhpcy5zaGFwZURpcnR5ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnBsYXlpbmdTdGF0ZSA9PT0gUGxheWluZ1N0YXRlLlBMQVlJTkcgKSB7XHJcblxyXG4gICAgICAvLyBVcGRhdGluZyBjb3VudGluZyB2YXJpYWJsZXMgYW5kIHRyYW5zaXRpb24gdG8gZmFkaW5nIG91dCBpZiBpdCBpcyB0aW1lXHJcbiAgICAgIGlmICggIXRoaXMuc291bmRPcHRpb25zTW9kZWwudHJhY2tzUGxheUZvcmV2ZXJQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLnJlbWFpbmluZ1BsYXlUaW1lID0gTWF0aC5tYXgoIDAsIHRoaXMucmVtYWluaW5nUGxheVRpbWUgLSBkdCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIHRoaXMucmVtYWluaW5nUGxheVRpbWUgPT09IDAgKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5aW5nU3RhdGUgPSBQbGF5aW5nU3RhdGUuRkFESU5HX09VVDtcclxuICAgICAgICB0aGlzLnJlbWFpbmluZ0ZhZGVUaW1lID0gRkFERV9USU1FO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5wbGF5aW5nU3RhdGUgPT09IFBsYXlpbmdTdGF0ZS5GQURJTkdfSU4gKSB7XHJcblxyXG4gICAgICB0aGlzLnJlbWFpbmluZ0ZhZGVUaW1lID0gTWF0aC5tYXgoIDAsIHRoaXMucmVtYWluaW5nRmFkZVRpbWUgLSBkdCApO1xyXG4gICAgICB0aGlzLnNldE91dHB1dExldmVsKCBSRU1BSU5JTkdfRkFERV9JTl9USU1FX1RPX0dBSU4uZXZhbHVhdGUoIHRoaXMucmVtYWluaW5nRmFkZVRpbWUgKSApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLnJlbWFpbmluZ0ZhZGVUaW1lID09PSAwICkge1xyXG4gICAgICAgIHRoaXMucGxheWluZ1N0YXRlID0gUGxheWluZ1N0YXRlLlBMQVlJTkc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnBsYXlpbmdTdGF0ZSA9PT0gUGxheWluZ1N0YXRlLkZBRElOR19PVVQgKSB7XHJcblxyXG4gICAgICAvLyB1cGRhdGUgb3V0cHV0IGxldmVsIGFuZCBjb3VudGluZyB2YXJpYWJsZXMsIHRyYW5zaXRpb24gdG8gU1RPUFBFRCBpZiBpdCBpcyB0aW1lXHJcbiAgICAgIHRoaXMucmVtYWluaW5nRmFkZVRpbWUgPSBNYXRoLm1heCggMCwgdGhpcy5yZW1haW5pbmdGYWRlVGltZSAtIGR0ICk7XHJcbiAgICAgIHRoaXMuc2V0T3V0cHV0TGV2ZWwoIFJFTUFJTklOR19GQURFX09VVF9USU1FX1RPX0dBSU4uZXZhbHVhdGUoIHRoaXMucmVtYWluaW5nRmFkZVRpbWUgKSApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLnNoYXBlRGlydHkgKSB7XHJcblxyXG4gICAgICAgIC8vIHNoYXBlIGp1c3QgY2hhbmdlZCBhZ2FpbiB3aGlsZSBmYWRpbmcgb3V0LCBmYWRlIGluIGFnYWluIGZvciB0aGUgdGltZSB3ZSBzcGVudCBhbmQgdHJhbnNpdGlvbiB0byBmYWRpbmcgaW5cclxuICAgICAgICB0aGlzLnJlbWFpbmluZ0ZhZGVUaW1lID0gRkFERV9USU1FIC0gdGhpcy5yZW1haW5pbmdGYWRlVGltZTtcclxuICAgICAgICB0aGlzLnBsYXlpbmdTdGF0ZSA9IFBsYXlpbmdTdGF0ZS5GQURJTkdfSU47XHJcbiAgICAgICAgdGhpcy5zaGFwZURpcnR5ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMucmVtYWluaW5nRmFkZVRpbWUgPT09IDAgKSB7XHJcblxyXG4gICAgICAgIC8vIE5vIGludGVyYWN0aW9uIHNpbmNlIHN0YXJ0IG9mIGZhZGUgb3V0LCB0cmFuc2l0aW9uIHRvIHN0b3BwZWRcclxuICAgICAgICB0aGlzLnBsYXlpbmdTdGF0ZSA9IFBsYXlpbmdTdGF0ZS5TVE9QUEVEO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYWxsIFNvdW5kR2VuZXJhdG9ycyBhc3NvY2lhdGVkIHdpdGggdGhpcyB2aWV3IHNvIHRoYXQgdGhleSBzdG9wIHBsYXlpbmcgc291bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zb3VuZENsaXBzLmZvckVhY2goIGdlbmVyYXRvciA9PiB7XHJcbiAgICAgIGdlbmVyYXRvci5kaXNjb25uZWN0KCB0aGlzLm1hc3RlckdhaW5Ob2RlICk7XHJcbiAgICAgIGdlbmVyYXRvci5kaXNwb3NlKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxucXVhZHJpbGF0ZXJhbC5yZWdpc3RlciggJ1RyYWNrc1NvdW5kVmlldycsIFRyYWNrc1NvdW5kVmlldyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxjQUFjLE1BQU0seUNBQXlDO0FBQ3BFLE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0MsZ0JBQWdCLE1BQU0saURBQWlEO0FBQzlFLE9BQU9DLFNBQVMsTUFBTSx1REFBdUQ7QUFDN0UsT0FBT0MsY0FBYyxNQUFNLDREQUE0RDtBQUN2RixPQUFPQyxZQUFZLE1BQU0seUNBQXlDO0FBRWxFLE9BQU9DLGFBQWEsTUFBTSwyQkFBMkI7QUFJckQ7QUFDQSxNQUFNQyxvQkFBb0IsR0FBRyxDQUFDOztBQUU5QjtBQUNBLE1BQU1DLFNBQVMsR0FBRyxDQUFDOztBQUVuQjtBQUNBO0FBQ0EsTUFBTUMsZ0JBQWdCLEdBQUcsR0FBRzs7QUFFNUI7QUFDQSxNQUFNQyw4QkFBOEIsR0FBRyxJQUFJVixjQUFjLENBQUVRLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFQyxnQkFBaUIsQ0FBQztBQUM5RixNQUFNRSwrQkFBK0IsR0FBRyxJQUFJWCxjQUFjLENBQUVRLFNBQVMsRUFBRSxDQUFDLEVBQUVDLGdCQUFnQixFQUFFLENBQUUsQ0FBQzs7QUFFL0Y7QUFDQSxNQUFNRyxZQUFZLFNBQVNWLGdCQUFnQixDQUFDO0VBQzFDLE9BQXVCVyxPQUFPLEdBQUcsSUFBSUQsWUFBWSxDQUFDLENBQUM7RUFDbkQsT0FBdUJFLE9BQU8sR0FBRyxJQUFJRixZQUFZLENBQUMsQ0FBQztFQUNuRCxPQUF1QkcsU0FBUyxHQUFHLElBQUlILFlBQVksQ0FBQyxDQUFDO0VBQ3JELE9BQXVCSSxVQUFVLEdBQUcsSUFBSUosWUFBWSxDQUFDLENBQUM7RUFFdEQsT0FBdUJLLFdBQVcsR0FB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