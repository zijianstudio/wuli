// Copyright 2022, University of Colorado Boulder

/**
 * EnergyBalanceSoundGenerator is used to produce sounds that represent the balance of energy at the top of the
 * atmosphere.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import phetAudioContext from '../../../../tambo/js/phetAudioContext.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../tambo/js/sound-generators/SoundGenerator.js';
import emptyApartmentBedroom06Resampled_mp3 from '../../../../tambo/sounds/emptyApartmentBedroom06Resampled_mp3.js';
import energyBalanceBlip_mp3 from '../../../sounds/energyBalanceBlip_mp3.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import EnergyAbsorbingEmittingLayer from '../model/EnergyAbsorbingEmittingLayer.js';
import SunEnergySource from '../model/SunEnergySource.js';

// constants
const MAX_EXPECTED_ENERGY_MAGNITUDE = SunEnergySource.OUTPUT_ENERGY_RATE * EnergyAbsorbingEmittingLayer.SURFACE_AREA * 2;
const HIGHER_SOUND_PLAYBACK_RATE = Math.pow(2, 1 / 6);
const MIN_BLIPS_PER_SECOND_WHEN_PLAYING = 2;
const MAX_BLIPS_PER_SECOND = 10;
const VOLUME_UP_ENERGY_RATE = 10000; // threshold for turning up and maintaining volume, empirically determined
const VOLUME_FADE_OUT_TIME = 40000; // in seconds

// types for options
class EnergyBalanceSoundGenerator extends SoundGenerator {
  interBlipTime = Number.POSITIVE_INFINITY;
  interBlipCountdown = Number.POSITIVE_INFINITY;
  volumeFadeCountdown = 0;
  constructor(netEnergyBalanceProperty, inRadiativeBalanceProperty, providedOptions) {
    const options = optionize()({}, providedOptions);
    super(options);

    // Create the source sound clip.
    this.soundClip = new SoundClip(energyBalanceBlip_mp3, {
      rateChangesAffectPlayingSounds: false
    });
    this.soundClip.connect(this.masterGainNode);

    // Create a convolver node that will be used for a reverb effect.
    const convolver = phetAudioContext.createConvolver();
    convolver.buffer = emptyApartmentBedroom06Resampled_mp3.audioBufferProperty.value;

    // Add a gain node that will be used for the reverb level.
    const reverbGainNode = phetAudioContext.createGain();

    // Hook up the signal path for the reverb.
    this.soundClip.connect(convolver);
    convolver.connect(reverbGainNode);
    reverbGainNode.connect(this.masterGainNode);
    this.netEnergyBalanceProperty = netEnergyBalanceProperty;
    this.fullVolumeLevel = options.initialOutputLevel;
    this.previousEnergyRate = netEnergyBalanceProperty.value;

    // Define the listener that will update the state of sound generation based on the model state.
    const updateSoundGeneration = () => {
      if (inRadiativeBalanceProperty.value) {
        // If the model is in radiative balance, it should not produce sounds.  Set the internal state to turn off the
        // production of blips.  This will have no effect if blips are already off.
        this.interBlipTime = Number.POSITIVE_INFINITY;
        this.interBlipCountdown = this.interBlipTime;
      } else {
        const netEnergyBalance = netEnergyBalanceProperty.value;

        // Adjust the playback rate of the blip to be a higher pitch when the net energy is positive, lower when negative.
        if (netEnergyBalance > 0 && this.soundClip.playbackRate === 1) {
          this.soundClip.setPlaybackRate(HIGHER_SOUND_PLAYBACK_RATE);
        } else if (netEnergyBalance < 0 && this.soundClip.playbackRate === HIGHER_SOUND_PLAYBACK_RATE) {
          this.soundClip.setPlaybackRate(1);
        }

        // Adjust the blip rate.  They occur more quickly when the net energy is higher, slower when it's lower.
        const netEnergyMagnitude = Math.abs(netEnergyBalance);
        const blipRate = MIN_BLIPS_PER_SECOND_WHEN_PLAYING + (MAX_BLIPS_PER_SECOND - MIN_BLIPS_PER_SECOND_WHEN_PLAYING) * netEnergyMagnitude / MAX_EXPECTED_ENERGY_MAGNITUDE;
        this.interBlipTime = 1 / blipRate;
        if (this.interBlipTime < this.interBlipCountdown) {
          this.interBlipCountdown = this.interBlipTime;
        }
      }
    };
    netEnergyBalanceProperty.lazyLink(updateSoundGeneration);
    inRadiativeBalanceProperty.lazyLink(updateSoundGeneration);
    this.disposeEnergyBalanceSoundGenerator = () => {
      netEnergyBalanceProperty.unlink(updateSoundGeneration);
    };
  }

  /**
   * Step forward in time by the provided amount.  This updates the counters used to play sounds and control the volume.
   * @param dt - delta time, in seconds
   */
  step(dt) {
    // See if it is time to play a blip sound and, if so, do it and reset the countdown.
    if (this.interBlipCountdown !== Number.POSITIVE_INFINITY) {
      this.interBlipCountdown = Math.max(this.interBlipCountdown - dt, 0);
      if (this.interBlipCountdown === 0) {
        this.soundClip.play();
        this.interBlipCountdown = this.interBlipTime;
      }
    }

    // If the energy has changed significantly during this step, turn up the volume.
    const energyChangeMagnitude = Math.abs(this.netEnergyBalanceProperty.value - this.previousEnergyRate);
    if (energyChangeMagnitude > VOLUME_UP_ENERGY_RATE) {
      this.volumeFadeCountdown = VOLUME_FADE_OUT_TIME;
      this.soundClip.setOutputLevel(this.fullVolumeLevel);
    } else {
      this.volumeFadeCountdown = Math.max(this.volumeFadeCountdown - dt, 0);
      this.soundClip.setOutputLevel(this.fullVolumeLevel * (this.volumeFadeCountdown / VOLUME_FADE_OUT_TIME));
    }

    // Save the current energy rate for the next step.
    this.previousEnergyRate = this.netEnergyBalanceProperty.value;
  }
  dispose() {
    this.disposeEnergyBalanceSoundGenerator();
    super.dispose();
  }
}
greenhouseEffect.register('EnergyBalanceSoundGenerator', EnergyBalanceSoundGenerator);
export default EnergyBalanceSoundGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJwaGV0QXVkaW9Db250ZXh0IiwiU291bmRDbGlwIiwiU291bmRHZW5lcmF0b3IiLCJlbXB0eUFwYXJ0bWVudEJlZHJvb20wNlJlc2FtcGxlZF9tcDMiLCJlbmVyZ3lCYWxhbmNlQmxpcF9tcDMiLCJncmVlbmhvdXNlRWZmZWN0IiwiRW5lcmd5QWJzb3JiaW5nRW1pdHRpbmdMYXllciIsIlN1bkVuZXJneVNvdXJjZSIsIk1BWF9FWFBFQ1RFRF9FTkVSR1lfTUFHTklUVURFIiwiT1VUUFVUX0VORVJHWV9SQVRFIiwiU1VSRkFDRV9BUkVBIiwiSElHSEVSX1NPVU5EX1BMQVlCQUNLX1JBVEUiLCJNYXRoIiwicG93IiwiTUlOX0JMSVBTX1BFUl9TRUNPTkRfV0hFTl9QTEFZSU5HIiwiTUFYX0JMSVBTX1BFUl9TRUNPTkQiLCJWT0xVTUVfVVBfRU5FUkdZX1JBVEUiLCJWT0xVTUVfRkFERV9PVVRfVElNRSIsIkVuZXJneUJhbGFuY2VTb3VuZEdlbmVyYXRvciIsImludGVyQmxpcFRpbWUiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImludGVyQmxpcENvdW50ZG93biIsInZvbHVtZUZhZGVDb3VudGRvd24iLCJjb25zdHJ1Y3RvciIsIm5ldEVuZXJneUJhbGFuY2VQcm9wZXJ0eSIsImluUmFkaWF0aXZlQmFsYW5jZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNvdW5kQ2xpcCIsInJhdGVDaGFuZ2VzQWZmZWN0UGxheWluZ1NvdW5kcyIsImNvbm5lY3QiLCJtYXN0ZXJHYWluTm9kZSIsImNvbnZvbHZlciIsImNyZWF0ZUNvbnZvbHZlciIsImJ1ZmZlciIsImF1ZGlvQnVmZmVyUHJvcGVydHkiLCJ2YWx1ZSIsInJldmVyYkdhaW5Ob2RlIiwiY3JlYXRlR2FpbiIsImZ1bGxWb2x1bWVMZXZlbCIsImluaXRpYWxPdXRwdXRMZXZlbCIsInByZXZpb3VzRW5lcmd5UmF0ZSIsInVwZGF0ZVNvdW5kR2VuZXJhdGlvbiIsIm5ldEVuZXJneUJhbGFuY2UiLCJwbGF5YmFja1JhdGUiLCJzZXRQbGF5YmFja1JhdGUiLCJuZXRFbmVyZ3lNYWduaXR1ZGUiLCJhYnMiLCJibGlwUmF0ZSIsImxhenlMaW5rIiwiZGlzcG9zZUVuZXJneUJhbGFuY2VTb3VuZEdlbmVyYXRvciIsInVubGluayIsInN0ZXAiLCJkdCIsIm1heCIsInBsYXkiLCJlbmVyZ3lDaGFuZ2VNYWduaXR1ZGUiLCJzZXRPdXRwdXRMZXZlbCIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVuZXJneUJhbGFuY2VTb3VuZEdlbmVyYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRW5lcmd5QmFsYW5jZVNvdW5kR2VuZXJhdG9yIGlzIHVzZWQgdG8gcHJvZHVjZSBzb3VuZHMgdGhhdCByZXByZXNlbnQgdGhlIGJhbGFuY2Ugb2YgZW5lcmd5IGF0IHRoZSB0b3Agb2YgdGhlXHJcbiAqIGF0bW9zcGhlcmUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHBoZXRBdWRpb0NvbnRleHQgZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvcGhldEF1ZGlvQ29udGV4dC5qcyc7XHJcbmltcG9ydCBTb3VuZENsaXAsIHsgU291bmRDbGlwT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvU291bmRDbGlwLmpzJztcclxuaW1wb3J0IFNvdW5kR2VuZXJhdG9yLCB7IFNvdW5kR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvU291bmRHZW5lcmF0b3IuanMnO1xyXG5pbXBvcnQgZW1wdHlBcGFydG1lbnRCZWRyb29tMDZSZXNhbXBsZWRfbXAzIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL3NvdW5kcy9lbXB0eUFwYXJ0bWVudEJlZHJvb20wNlJlc2FtcGxlZF9tcDMuanMnO1xyXG5pbXBvcnQgZW5lcmd5QmFsYW5jZUJsaXBfbXAzIGZyb20gJy4uLy4uLy4uL3NvdW5kcy9lbmVyZ3lCYWxhbmNlQmxpcF9tcDMuanMnO1xyXG5pbXBvcnQgZ3JlZW5ob3VzZUVmZmVjdCBmcm9tICcuLi8uLi9ncmVlbmhvdXNlRWZmZWN0LmpzJztcclxuaW1wb3J0IEVuZXJneUFic29yYmluZ0VtaXR0aW5nTGF5ZXIgZnJvbSAnLi4vbW9kZWwvRW5lcmd5QWJzb3JiaW5nRW1pdHRpbmdMYXllci5qcyc7XHJcbmltcG9ydCBTdW5FbmVyZ3lTb3VyY2UgZnJvbSAnLi4vbW9kZWwvU3VuRW5lcmd5U291cmNlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNQVhfRVhQRUNURURfRU5FUkdZX01BR05JVFVERSA9IFN1bkVuZXJneVNvdXJjZS5PVVRQVVRfRU5FUkdZX1JBVEUgKiBFbmVyZ3lBYnNvcmJpbmdFbWl0dGluZ0xheWVyLlNVUkZBQ0VfQVJFQSAqIDI7XHJcbmNvbnN0IEhJR0hFUl9TT1VORF9QTEFZQkFDS19SQVRFID0gTWF0aC5wb3coIDIsIDEgLyA2ICk7XHJcbmNvbnN0IE1JTl9CTElQU19QRVJfU0VDT05EX1dIRU5fUExBWUlORyA9IDI7XHJcbmNvbnN0IE1BWF9CTElQU19QRVJfU0VDT05EID0gMTA7XHJcbmNvbnN0IFZPTFVNRV9VUF9FTkVSR1lfUkFURSA9IDEwMDAwOyAvLyB0aHJlc2hvbGQgZm9yIHR1cm5pbmcgdXAgYW5kIG1haW50YWluaW5nIHZvbHVtZSwgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5jb25zdCBWT0xVTUVfRkFERV9PVVRfVElNRSA9IDQwMDAwOyAvLyBpbiBzZWNvbmRzXHJcblxyXG4vLyB0eXBlcyBmb3Igb3B0aW9uc1xyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxudHlwZSBFbmVyZ3lCYWxhbmNlU291bmRHZW5lcmF0b3JPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTb3VuZEdlbmVyYXRvck9wdGlvbnM7XHJcblxyXG5jbGFzcyBFbmVyZ3lCYWxhbmNlU291bmRHZW5lcmF0b3IgZXh0ZW5kcyBTb3VuZEdlbmVyYXRvciB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUVuZXJneUJhbGFuY2VTb3VuZEdlbmVyYXRvcjogKCkgPT4gdm9pZDtcclxuICBwcml2YXRlIGludGVyQmxpcFRpbWU6IG51bWJlciA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICBwcml2YXRlIGludGVyQmxpcENvdW50ZG93bjogbnVtYmVyID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZnVsbFZvbHVtZUxldmVsOiBudW1iZXI7XHJcbiAgcHJpdmF0ZSB2b2x1bWVGYWRlQ291bnRkb3duID0gMDtcclxuICBwcml2YXRlIHByZXZpb3VzRW5lcmd5UmF0ZTogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc291bmRDbGlwOiBTb3VuZENsaXA7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBuZXRFbmVyZ3lCYWxhbmNlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbmV0RW5lcmd5QmFsYW5jZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgaW5SYWRpYXRpdmVCYWxhbmNlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogRW5lcmd5QmFsYW5jZVNvdW5kR2VuZXJhdG9yT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEVuZXJneUJhbGFuY2VTb3VuZEdlbmVyYXRvck9wdGlvbnMsIFNlbGZPcHRpb25zLCBTb3VuZENsaXBPcHRpb25zPigpKCB7XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgc291cmNlIHNvdW5kIGNsaXAuXHJcbiAgICB0aGlzLnNvdW5kQ2xpcCA9IG5ldyBTb3VuZENsaXAoIGVuZXJneUJhbGFuY2VCbGlwX21wMywgeyByYXRlQ2hhbmdlc0FmZmVjdFBsYXlpbmdTb3VuZHM6IGZhbHNlIH0gKTtcclxuICAgIHRoaXMuc291bmRDbGlwLmNvbm5lY3QoIHRoaXMubWFzdGVyR2Fpbk5vZGUgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBjb252b2x2ZXIgbm9kZSB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgYSByZXZlcmIgZWZmZWN0LlxyXG4gICAgY29uc3QgY29udm9sdmVyID0gcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVDb252b2x2ZXIoKTtcclxuICAgIGNvbnZvbHZlci5idWZmZXIgPSBlbXB0eUFwYXJ0bWVudEJlZHJvb20wNlJlc2FtcGxlZF9tcDMuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyBBZGQgYSBnYWluIG5vZGUgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIHRoZSByZXZlcmIgbGV2ZWwuXHJcbiAgICBjb25zdCByZXZlcmJHYWluTm9kZSA9IHBoZXRBdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xyXG5cclxuICAgIC8vIEhvb2sgdXAgdGhlIHNpZ25hbCBwYXRoIGZvciB0aGUgcmV2ZXJiLlxyXG4gICAgdGhpcy5zb3VuZENsaXAuY29ubmVjdCggY29udm9sdmVyICk7XHJcbiAgICBjb252b2x2ZXIuY29ubmVjdCggcmV2ZXJiR2Fpbk5vZGUgKTtcclxuICAgIHJldmVyYkdhaW5Ob2RlLmNvbm5lY3QoIHRoaXMubWFzdGVyR2Fpbk5vZGUgKTtcclxuXHJcbiAgICB0aGlzLm5ldEVuZXJneUJhbGFuY2VQcm9wZXJ0eSA9IG5ldEVuZXJneUJhbGFuY2VQcm9wZXJ0eTtcclxuICAgIHRoaXMuZnVsbFZvbHVtZUxldmVsID0gb3B0aW9ucy5pbml0aWFsT3V0cHV0TGV2ZWw7XHJcbiAgICB0aGlzLnByZXZpb3VzRW5lcmd5UmF0ZSA9IG5ldEVuZXJneUJhbGFuY2VQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyBEZWZpbmUgdGhlIGxpc3RlbmVyIHRoYXQgd2lsbCB1cGRhdGUgdGhlIHN0YXRlIG9mIHNvdW5kIGdlbmVyYXRpb24gYmFzZWQgb24gdGhlIG1vZGVsIHN0YXRlLlxyXG4gICAgY29uc3QgdXBkYXRlU291bmRHZW5lcmF0aW9uID0gKCkgPT4ge1xyXG5cclxuICAgICAgaWYgKCBpblJhZGlhdGl2ZUJhbGFuY2VQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIG1vZGVsIGlzIGluIHJhZGlhdGl2ZSBiYWxhbmNlLCBpdCBzaG91bGQgbm90IHByb2R1Y2Ugc291bmRzLiAgU2V0IHRoZSBpbnRlcm5hbCBzdGF0ZSB0byB0dXJuIG9mZiB0aGVcclxuICAgICAgICAvLyBwcm9kdWN0aW9uIG9mIGJsaXBzLiAgVGhpcyB3aWxsIGhhdmUgbm8gZWZmZWN0IGlmIGJsaXBzIGFyZSBhbHJlYWR5IG9mZi5cclxuICAgICAgICB0aGlzLmludGVyQmxpcFRpbWUgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICAgICAgdGhpcy5pbnRlckJsaXBDb3VudGRvd24gPSB0aGlzLmludGVyQmxpcFRpbWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ldEVuZXJneUJhbGFuY2UgPSBuZXRFbmVyZ3lCYWxhbmNlUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICAgIC8vIEFkanVzdCB0aGUgcGxheWJhY2sgcmF0ZSBvZiB0aGUgYmxpcCB0byBiZSBhIGhpZ2hlciBwaXRjaCB3aGVuIHRoZSBuZXQgZW5lcmd5IGlzIHBvc2l0aXZlLCBsb3dlciB3aGVuIG5lZ2F0aXZlLlxyXG4gICAgICAgIGlmICggbmV0RW5lcmd5QmFsYW5jZSA+IDAgJiYgdGhpcy5zb3VuZENsaXAucGxheWJhY2tSYXRlID09PSAxICkge1xyXG4gICAgICAgICAgdGhpcy5zb3VuZENsaXAuc2V0UGxheWJhY2tSYXRlKCBISUdIRVJfU09VTkRfUExBWUJBQ0tfUkFURSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggbmV0RW5lcmd5QmFsYW5jZSA8IDAgJiYgdGhpcy5zb3VuZENsaXAucGxheWJhY2tSYXRlID09PSBISUdIRVJfU09VTkRfUExBWUJBQ0tfUkFURSApIHtcclxuICAgICAgICAgIHRoaXMuc291bmRDbGlwLnNldFBsYXliYWNrUmF0ZSggMSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWRqdXN0IHRoZSBibGlwIHJhdGUuICBUaGV5IG9jY3VyIG1vcmUgcXVpY2tseSB3aGVuIHRoZSBuZXQgZW5lcmd5IGlzIGhpZ2hlciwgc2xvd2VyIHdoZW4gaXQncyBsb3dlci5cclxuICAgICAgICBjb25zdCBuZXRFbmVyZ3lNYWduaXR1ZGUgPSBNYXRoLmFicyggbmV0RW5lcmd5QmFsYW5jZSApO1xyXG4gICAgICAgIGNvbnN0IGJsaXBSYXRlID0gTUlOX0JMSVBTX1BFUl9TRUNPTkRfV0hFTl9QTEFZSU5HICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICggTUFYX0JMSVBTX1BFUl9TRUNPTkQgLSBNSU5fQkxJUFNfUEVSX1NFQ09ORF9XSEVOX1BMQVlJTkcgKSAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBuZXRFbmVyZ3lNYWduaXR1ZGUgLyBNQVhfRVhQRUNURURfRU5FUkdZX01BR05JVFVERTtcclxuICAgICAgICB0aGlzLmludGVyQmxpcFRpbWUgPSAxIC8gYmxpcFJhdGU7XHJcbiAgICAgICAgaWYgKCB0aGlzLmludGVyQmxpcFRpbWUgPCB0aGlzLmludGVyQmxpcENvdW50ZG93biApIHtcclxuICAgICAgICAgIHRoaXMuaW50ZXJCbGlwQ291bnRkb3duID0gdGhpcy5pbnRlckJsaXBUaW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBuZXRFbmVyZ3lCYWxhbmNlUHJvcGVydHkubGF6eUxpbmsoIHVwZGF0ZVNvdW5kR2VuZXJhdGlvbiApO1xyXG4gICAgaW5SYWRpYXRpdmVCYWxhbmNlUHJvcGVydHkubGF6eUxpbmsoIHVwZGF0ZVNvdW5kR2VuZXJhdGlvbiApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZUVuZXJneUJhbGFuY2VTb3VuZEdlbmVyYXRvciA9ICgpID0+IHtcclxuICAgICAgbmV0RW5lcmd5QmFsYW5jZVByb3BlcnR5LnVubGluayggdXBkYXRlU291bmRHZW5lcmF0aW9uICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcCBmb3J3YXJkIGluIHRpbWUgYnkgdGhlIHByb3ZpZGVkIGFtb3VudC4gIFRoaXMgdXBkYXRlcyB0aGUgY291bnRlcnMgdXNlZCB0byBwbGF5IHNvdW5kcyBhbmQgY29udHJvbCB0aGUgdm9sdW1lLlxyXG4gICAqIEBwYXJhbSBkdCAtIGRlbHRhIHRpbWUsIGluIHNlY29uZHNcclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBTZWUgaWYgaXQgaXMgdGltZSB0byBwbGF5IGEgYmxpcCBzb3VuZCBhbmQsIGlmIHNvLCBkbyBpdCBhbmQgcmVzZXQgdGhlIGNvdW50ZG93bi5cclxuICAgIGlmICggdGhpcy5pbnRlckJsaXBDb3VudGRvd24gIT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApIHtcclxuICAgICAgdGhpcy5pbnRlckJsaXBDb3VudGRvd24gPSBNYXRoLm1heCggdGhpcy5pbnRlckJsaXBDb3VudGRvd24gLSBkdCwgMCApO1xyXG4gICAgICBpZiAoIHRoaXMuaW50ZXJCbGlwQ291bnRkb3duID09PSAwICkge1xyXG4gICAgICAgIHRoaXMuc291bmRDbGlwLnBsYXkoKTtcclxuICAgICAgICB0aGlzLmludGVyQmxpcENvdW50ZG93biA9IHRoaXMuaW50ZXJCbGlwVGltZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHRoZSBlbmVyZ3kgaGFzIGNoYW5nZWQgc2lnbmlmaWNhbnRseSBkdXJpbmcgdGhpcyBzdGVwLCB0dXJuIHVwIHRoZSB2b2x1bWUuXHJcbiAgICBjb25zdCBlbmVyZ3lDaGFuZ2VNYWduaXR1ZGUgPSBNYXRoLmFicyggdGhpcy5uZXRFbmVyZ3lCYWxhbmNlUHJvcGVydHkudmFsdWUgLSB0aGlzLnByZXZpb3VzRW5lcmd5UmF0ZSApO1xyXG4gICAgaWYgKCBlbmVyZ3lDaGFuZ2VNYWduaXR1ZGUgPiBWT0xVTUVfVVBfRU5FUkdZX1JBVEUgKSB7XHJcbiAgICAgIHRoaXMudm9sdW1lRmFkZUNvdW50ZG93biA9IFZPTFVNRV9GQURFX09VVF9USU1FO1xyXG4gICAgICB0aGlzLnNvdW5kQ2xpcC5zZXRPdXRwdXRMZXZlbCggdGhpcy5mdWxsVm9sdW1lTGV2ZWwgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnZvbHVtZUZhZGVDb3VudGRvd24gPSBNYXRoLm1heCggdGhpcy52b2x1bWVGYWRlQ291bnRkb3duIC0gZHQsIDAgKTtcclxuICAgICAgdGhpcy5zb3VuZENsaXAuc2V0T3V0cHV0TGV2ZWwoIHRoaXMuZnVsbFZvbHVtZUxldmVsICogKCB0aGlzLnZvbHVtZUZhZGVDb3VudGRvd24gLyBWT0xVTUVfRkFERV9PVVRfVElNRSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2F2ZSB0aGUgY3VycmVudCBlbmVyZ3kgcmF0ZSBmb3IgdGhlIG5leHQgc3RlcC5cclxuICAgIHRoaXMucHJldmlvdXNFbmVyZ3lSYXRlID0gdGhpcy5uZXRFbmVyZ3lCYWxhbmNlUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZUVuZXJneUJhbGFuY2VTb3VuZEdlbmVyYXRvcigpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ0VuZXJneUJhbGFuY2VTb3VuZEdlbmVyYXRvcicsIEVuZXJneUJhbGFuY2VTb3VuZEdlbmVyYXRvciApO1xyXG5leHBvcnQgZGVmYXVsdCBFbmVyZ3lCYWxhbmNlU291bmRHZW5lcmF0b3I7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsU0FBUyxNQUE0Qix1Q0FBdUM7QUFDbkYsT0FBT0MsZ0JBQWdCLE1BQU0sMENBQTBDO0FBQ3ZFLE9BQU9DLFNBQVMsTUFBNEIsb0RBQW9EO0FBQ2hHLE9BQU9DLGNBQWMsTUFBaUMseURBQXlEO0FBQy9HLE9BQU9DLG9DQUFvQyxNQUFNLGtFQUFrRTtBQUNuSCxPQUFPQyxxQkFBcUIsTUFBTSwwQ0FBMEM7QUFDNUUsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLDRCQUE0QixNQUFNLDBDQUEwQztBQUNuRixPQUFPQyxlQUFlLE1BQU0sNkJBQTZCOztBQUV6RDtBQUNBLE1BQU1DLDZCQUE2QixHQUFHRCxlQUFlLENBQUNFLGtCQUFrQixHQUFHSCw0QkFBNEIsQ0FBQ0ksWUFBWSxHQUFHLENBQUM7QUFDeEgsTUFBTUMsMEJBQTBCLEdBQUdDLElBQUksQ0FBQ0MsR0FBRyxDQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBRSxDQUFDO0FBQ3ZELE1BQU1DLGlDQUFp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