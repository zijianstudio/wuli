// Copyright 2022, University of Colorado Boulder

/**
 * ConcentrationSliderSoundGenerator is a sound generator specifically designed to produce sounds for the concentration
 * slider that controls the greenhouse gas levels in the Greenhouse Effect simulation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import ValueChangeSoundPlayer from '../../../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import sliderMovement_mp3 from '../../../sounds/sliderMovement_mp3.js';
import SoundGenerator from '../../../../tambo/js/sound-generators/SoundGenerator.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
class ConcentrationSliderSoundGenerator extends ValueChangeSoundPlayer {
  constructor(concentrationProperty, valueRange) {
    // sound generator for the middle range of the slider's movement
    const sliderMiddleSoundGenerator = new SliderMiddleRangeSoundGenerator(concentrationProperty, valueRange, {
      initialOutputLevel: 0.1
    });
    soundManager.addSoundGenerator(sliderMiddleSoundGenerator);
    super(valueRange, {
      numberOfMiddleThresholds: 9,
      middleMovingUpSoundPlayer: sliderMiddleSoundGenerator,
      middleMovingDownSoundPlayer: sliderMiddleSoundGenerator
    });
  }
}

/**
 * Sound generator to be used for the middle portion of the concentration slider range.
 */
class SliderMiddleRangeSoundGenerator extends SoundGenerator {
  constructor(concentrationProperty, concentrationRange, options) {
    super(options);

    // Create a dynamics compressor so that the output of this sound generator doesn't go too high when lots of sounds
    // are being played.
    const dynamicsCompressorNode = this.audioContext.createDynamicsCompressor();

    // The following values were empirically determined through informed experimentation.
    const now = this.audioContext.currentTime;
    dynamicsCompressorNode.threshold.setValueAtTime(-3, now);
    dynamicsCompressorNode.knee.setValueAtTime(0, now); // hard knee
    dynamicsCompressorNode.ratio.setValueAtTime(12, now);
    dynamicsCompressorNode.attack.setValueAtTime(0, now);
    dynamicsCompressorNode.release.setValueAtTime(0.25, now);
    dynamicsCompressorNode.connect(this.masterGainNode);

    // the sound clip that forms the basis of all sounds that are produced
    this.baseSoundClip = new SoundClip(sliderMovement_mp3, {
      rateChangesAffectPlayingSounds: false
    });
    this.baseSoundClip.connect(dynamicsCompressorNode);

    // variables used by the methods below
    this.concentrationProperty = concentrationProperty;
    this.concentrationRange = concentrationRange;
  }

  /**
   * Play the main sound clip multiple times with some randomization around the center pitch and the delay between each
   * play.  The behavior was determined by informed trial-and-error based on an initial sound design that used a bunch
   * of separate sound clips.  See https://github.com/phetsims/greenhouse-effect/issues/28.
   */
  play() {
    // parameters the bound the randomization, empirically determined
    const minimumInterSoundTime = 0.06;
    const maximumInterSoundTime = minimumInterSoundTime * 1.5;

    // Set a value for the number of playing instances of the clip at which we limit additional plays.  This helps to
    // prevent too many instances of the clip from playing simultaneously, which can sound a bit chatic.
    const playingInstancesLimitThreshold = 5;

    // Calculate a normalized value based on the range.
    const normalizedValue = this.concentrationRange.getNormalizedValue(this.concentrationProperty.value);

    // Calculate the number of times to play based on the current concentration value.  This calculation was empirically
    // determined and can be adjusted as needed to get the desired sound behavior.  There is also code to limit the
    // number of playing instance so that it doesn't get overwhelming.
    let timesToPlay;
    if (this.baseSoundClip.getNumberOfPlayingInstances() < playingInstancesLimitThreshold) {
      timesToPlay = Math.floor(normalizedValue * 3) + 2;
    } else {
      timesToPlay = 1;
    }

    // Calculate the minimum playback rate based on the current concentration.
    const minPlaybackRate = 1 + normalizedValue * 2;
    let delayAmount = 0;
    _.times(timesToPlay, () => {
      // Set the playback rate with some randomization.
      this.baseSoundClip.setPlaybackRate(minPlaybackRate + dotRandom.nextDouble() * 0.2, 0);

      // Put some spacing between each playing of the clip.  The parameters of the calculation are broken out to make
      // experimentation and adjustment easier.
      this.baseSoundClip.play(delayAmount);
      delayAmount = delayAmount + minimumInterSoundTime + dotRandom.nextDouble() * (maximumInterSoundTime - minimumInterSoundTime);
    });
    this.baseSoundClip.setPlaybackRate(1, 0);
  }
  stop() {
    // does nothing in this class, but is needed for the TSoundPlayer interface
  }
}
greenhouseEffect.register('ConcentrationSliderSoundGenerator', ConcentrationSliderSoundGenerator);
export default ConcentrationSliderSoundGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTb3VuZENsaXAiLCJWYWx1ZUNoYW5nZVNvdW5kUGxheWVyIiwic291bmRNYW5hZ2VyIiwiZ3JlZW5ob3VzZUVmZmVjdCIsInNsaWRlck1vdmVtZW50X21wMyIsIlNvdW5kR2VuZXJhdG9yIiwiZG90UmFuZG9tIiwiQ29uY2VudHJhdGlvblNsaWRlclNvdW5kR2VuZXJhdG9yIiwiY29uc3RydWN0b3IiLCJjb25jZW50cmF0aW9uUHJvcGVydHkiLCJ2YWx1ZVJhbmdlIiwic2xpZGVyTWlkZGxlU291bmRHZW5lcmF0b3IiLCJTbGlkZXJNaWRkbGVSYW5nZVNvdW5kR2VuZXJhdG9yIiwiaW5pdGlhbE91dHB1dExldmVsIiwiYWRkU291bmRHZW5lcmF0b3IiLCJudW1iZXJPZk1pZGRsZVRocmVzaG9sZHMiLCJtaWRkbGVNb3ZpbmdVcFNvdW5kUGxheWVyIiwibWlkZGxlTW92aW5nRG93blNvdW5kUGxheWVyIiwiY29uY2VudHJhdGlvblJhbmdlIiwib3B0aW9ucyIsImR5bmFtaWNzQ29tcHJlc3Nvck5vZGUiLCJhdWRpb0NvbnRleHQiLCJjcmVhdGVEeW5hbWljc0NvbXByZXNzb3IiLCJub3ciLCJjdXJyZW50VGltZSIsInRocmVzaG9sZCIsInNldFZhbHVlQXRUaW1lIiwia25lZSIsInJhdGlvIiwiYXR0YWNrIiwicmVsZWFzZSIsImNvbm5lY3QiLCJtYXN0ZXJHYWluTm9kZSIsImJhc2VTb3VuZENsaXAiLCJyYXRlQ2hhbmdlc0FmZmVjdFBsYXlpbmdTb3VuZHMiLCJwbGF5IiwibWluaW11bUludGVyU291bmRUaW1lIiwibWF4aW11bUludGVyU291bmRUaW1lIiwicGxheWluZ0luc3RhbmNlc0xpbWl0VGhyZXNob2xkIiwibm9ybWFsaXplZFZhbHVlIiwiZ2V0Tm9ybWFsaXplZFZhbHVlIiwidmFsdWUiLCJ0aW1lc1RvUGxheSIsImdldE51bWJlck9mUGxheWluZ0luc3RhbmNlcyIsIk1hdGgiLCJmbG9vciIsIm1pblBsYXliYWNrUmF0ZSIsImRlbGF5QW1vdW50IiwiXyIsInRpbWVzIiwic2V0UGxheWJhY2tSYXRlIiwibmV4dERvdWJsZSIsInN0b3AiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvbmNlbnRyYXRpb25TbGlkZXJTb3VuZEdlbmVyYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29uY2VudHJhdGlvblNsaWRlclNvdW5kR2VuZXJhdG9yIGlzIGEgc291bmQgZ2VuZXJhdG9yIHNwZWNpZmljYWxseSBkZXNpZ25lZCB0byBwcm9kdWNlIHNvdW5kcyBmb3IgdGhlIGNvbmNlbnRyYXRpb25cclxuICogc2xpZGVyIHRoYXQgY29udHJvbHMgdGhlIGdyZWVuaG91c2UgZ2FzIGxldmVscyBpbiB0aGUgR3JlZW5ob3VzZSBFZmZlY3Qgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgU291bmRDbGlwIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvU291bmRDbGlwLmpzJztcclxuaW1wb3J0IFZhbHVlQ2hhbmdlU291bmRQbGF5ZXIgZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9WYWx1ZUNoYW5nZVNvdW5kUGxheWVyLmpzJztcclxuaW1wb3J0IHNvdW5kTWFuYWdlciBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZE1hbmFnZXIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcbmltcG9ydCBzbGlkZXJNb3ZlbWVudF9tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL3NsaWRlck1vdmVtZW50X21wMy5qcyc7XHJcbmltcG9ydCBTb3VuZEdlbmVyYXRvciwgeyBTb3VuZEdlbmVyYXRvck9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kR2VuZXJhdG9yLmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFNvdW5kUGxheWVyIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL1RTb3VuZFBsYXllci5qcyc7XHJcblxyXG5jbGFzcyBDb25jZW50cmF0aW9uU2xpZGVyU291bmRHZW5lcmF0b3IgZXh0ZW5kcyBWYWx1ZUNoYW5nZVNvdW5kUGxheWVyIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb25jZW50cmF0aW9uUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sIHZhbHVlUmFuZ2U6IFJhbmdlICkge1xyXG5cclxuICAgIC8vIHNvdW5kIGdlbmVyYXRvciBmb3IgdGhlIG1pZGRsZSByYW5nZSBvZiB0aGUgc2xpZGVyJ3MgbW92ZW1lbnRcclxuICAgIGNvbnN0IHNsaWRlck1pZGRsZVNvdW5kR2VuZXJhdG9yID0gbmV3IFNsaWRlck1pZGRsZVJhbmdlU291bmRHZW5lcmF0b3IoIGNvbmNlbnRyYXRpb25Qcm9wZXJ0eSwgdmFsdWVSYW5nZSwge1xyXG4gICAgICBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuMVxyXG4gICAgfSApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBzbGlkZXJNaWRkbGVTb3VuZEdlbmVyYXRvciApO1xyXG5cclxuICAgIHN1cGVyKCB2YWx1ZVJhbmdlLCB7XHJcblxyXG4gICAgICBudW1iZXJPZk1pZGRsZVRocmVzaG9sZHM6IDksXHJcbiAgICAgIG1pZGRsZU1vdmluZ1VwU291bmRQbGF5ZXI6IHNsaWRlck1pZGRsZVNvdW5kR2VuZXJhdG9yLFxyXG4gICAgICBtaWRkbGVNb3ZpbmdEb3duU291bmRQbGF5ZXI6IHNsaWRlck1pZGRsZVNvdW5kR2VuZXJhdG9yXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU291bmQgZ2VuZXJhdG9yIHRvIGJlIHVzZWQgZm9yIHRoZSBtaWRkbGUgcG9ydGlvbiBvZiB0aGUgY29uY2VudHJhdGlvbiBzbGlkZXIgcmFuZ2UuXHJcbiAqL1xyXG5jbGFzcyBTbGlkZXJNaWRkbGVSYW5nZVNvdW5kR2VuZXJhdG9yIGV4dGVuZHMgU291bmRHZW5lcmF0b3IgaW1wbGVtZW50cyBUU291bmRQbGF5ZXIge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYmFzZVNvdW5kQ2xpcDogU291bmRDbGlwO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY29uY2VudHJhdGlvblByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY29uY2VudHJhdGlvblJhbmdlOiBSYW5nZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb25jZW50cmF0aW9uUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25jZW50cmF0aW9uUmFuZ2U6IFJhbmdlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucz86IFBhcnRpYWw8U291bmRHZW5lcmF0b3JPcHRpb25zPiApIHtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIGR5bmFtaWNzIGNvbXByZXNzb3Igc28gdGhhdCB0aGUgb3V0cHV0IG9mIHRoaXMgc291bmQgZ2VuZXJhdG9yIGRvZXNuJ3QgZ28gdG9vIGhpZ2ggd2hlbiBsb3RzIG9mIHNvdW5kc1xyXG4gICAgLy8gYXJlIGJlaW5nIHBsYXllZC5cclxuICAgIGNvbnN0IGR5bmFtaWNzQ29tcHJlc3Nvck5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKTtcclxuXHJcbiAgICAvLyBUaGUgZm9sbG93aW5nIHZhbHVlcyB3ZXJlIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdGhyb3VnaCBpbmZvcm1lZCBleHBlcmltZW50YXRpb24uXHJcbiAgICBjb25zdCBub3cgPSB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcclxuICAgIGR5bmFtaWNzQ29tcHJlc3Nvck5vZGUudGhyZXNob2xkLnNldFZhbHVlQXRUaW1lKCAtMywgbm93ICk7XHJcbiAgICBkeW5hbWljc0NvbXByZXNzb3JOb2RlLmtuZWUuc2V0VmFsdWVBdFRpbWUoIDAsIG5vdyApOyAvLyBoYXJkIGtuZWVcclxuICAgIGR5bmFtaWNzQ29tcHJlc3Nvck5vZGUucmF0aW8uc2V0VmFsdWVBdFRpbWUoIDEyLCBub3cgKTtcclxuICAgIGR5bmFtaWNzQ29tcHJlc3Nvck5vZGUuYXR0YWNrLnNldFZhbHVlQXRUaW1lKCAwLCBub3cgKTtcclxuICAgIGR5bmFtaWNzQ29tcHJlc3Nvck5vZGUucmVsZWFzZS5zZXRWYWx1ZUF0VGltZSggMC4yNSwgbm93ICk7XHJcbiAgICBkeW5hbWljc0NvbXByZXNzb3JOb2RlLmNvbm5lY3QoIHRoaXMubWFzdGVyR2Fpbk5vZGUgKTtcclxuXHJcbiAgICAvLyB0aGUgc291bmQgY2xpcCB0aGF0IGZvcm1zIHRoZSBiYXNpcyBvZiBhbGwgc291bmRzIHRoYXQgYXJlIHByb2R1Y2VkXHJcbiAgICB0aGlzLmJhc2VTb3VuZENsaXAgPSBuZXcgU291bmRDbGlwKCBzbGlkZXJNb3ZlbWVudF9tcDMsIHtcclxuICAgICAgcmF0ZUNoYW5nZXNBZmZlY3RQbGF5aW5nU291bmRzOiBmYWxzZVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5iYXNlU291bmRDbGlwLmNvbm5lY3QoIGR5bmFtaWNzQ29tcHJlc3Nvck5vZGUgKTtcclxuXHJcbiAgICAvLyB2YXJpYWJsZXMgdXNlZCBieSB0aGUgbWV0aG9kcyBiZWxvd1xyXG4gICAgdGhpcy5jb25jZW50cmF0aW9uUHJvcGVydHkgPSBjb25jZW50cmF0aW9uUHJvcGVydHk7XHJcbiAgICB0aGlzLmNvbmNlbnRyYXRpb25SYW5nZSA9IGNvbmNlbnRyYXRpb25SYW5nZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBsYXkgdGhlIG1haW4gc291bmQgY2xpcCBtdWx0aXBsZSB0aW1lcyB3aXRoIHNvbWUgcmFuZG9taXphdGlvbiBhcm91bmQgdGhlIGNlbnRlciBwaXRjaCBhbmQgdGhlIGRlbGF5IGJldHdlZW4gZWFjaFxyXG4gICAqIHBsYXkuICBUaGUgYmVoYXZpb3Igd2FzIGRldGVybWluZWQgYnkgaW5mb3JtZWQgdHJpYWwtYW5kLWVycm9yIGJhc2VkIG9uIGFuIGluaXRpYWwgc291bmQgZGVzaWduIHRoYXQgdXNlZCBhIGJ1bmNoXHJcbiAgICogb2Ygc2VwYXJhdGUgc291bmQgY2xpcHMuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyZWVuaG91c2UtZWZmZWN0L2lzc3Vlcy8yOC5cclxuICAgKi9cclxuICBwdWJsaWMgcGxheSgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBwYXJhbWV0ZXJzIHRoZSBib3VuZCB0aGUgcmFuZG9taXphdGlvbiwgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgY29uc3QgbWluaW11bUludGVyU291bmRUaW1lID0gMC4wNjtcclxuICAgIGNvbnN0IG1heGltdW1JbnRlclNvdW5kVGltZSA9IG1pbmltdW1JbnRlclNvdW5kVGltZSAqIDEuNTtcclxuXHJcbiAgICAvLyBTZXQgYSB2YWx1ZSBmb3IgdGhlIG51bWJlciBvZiBwbGF5aW5nIGluc3RhbmNlcyBvZiB0aGUgY2xpcCBhdCB3aGljaCB3ZSBsaW1pdCBhZGRpdGlvbmFsIHBsYXlzLiAgVGhpcyBoZWxwcyB0b1xyXG4gICAgLy8gcHJldmVudCB0b28gbWFueSBpbnN0YW5jZXMgb2YgdGhlIGNsaXAgZnJvbSBwbGF5aW5nIHNpbXVsdGFuZW91c2x5LCB3aGljaCBjYW4gc291bmQgYSBiaXQgY2hhdGljLlxyXG4gICAgY29uc3QgcGxheWluZ0luc3RhbmNlc0xpbWl0VGhyZXNob2xkID0gNTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgYSBub3JtYWxpemVkIHZhbHVlIGJhc2VkIG9uIHRoZSByYW5nZS5cclxuICAgIGNvbnN0IG5vcm1hbGl6ZWRWYWx1ZSA9IHRoaXMuY29uY2VudHJhdGlvblJhbmdlLmdldE5vcm1hbGl6ZWRWYWx1ZSggdGhpcy5jb25jZW50cmF0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgdGhlIG51bWJlciBvZiB0aW1lcyB0byBwbGF5IGJhc2VkIG9uIHRoZSBjdXJyZW50IGNvbmNlbnRyYXRpb24gdmFsdWUuICBUaGlzIGNhbGN1bGF0aW9uIHdhcyBlbXBpcmljYWxseVxyXG4gICAgLy8gZGV0ZXJtaW5lZCBhbmQgY2FuIGJlIGFkanVzdGVkIGFzIG5lZWRlZCB0byBnZXQgdGhlIGRlc2lyZWQgc291bmQgYmVoYXZpb3IuICBUaGVyZSBpcyBhbHNvIGNvZGUgdG8gbGltaXQgdGhlXHJcbiAgICAvLyBudW1iZXIgb2YgcGxheWluZyBpbnN0YW5jZSBzbyB0aGF0IGl0IGRvZXNuJ3QgZ2V0IG92ZXJ3aGVsbWluZy5cclxuICAgIGxldCB0aW1lc1RvUGxheTtcclxuICAgIGlmICggdGhpcy5iYXNlU291bmRDbGlwLmdldE51bWJlck9mUGxheWluZ0luc3RhbmNlcygpIDwgcGxheWluZ0luc3RhbmNlc0xpbWl0VGhyZXNob2xkICkge1xyXG4gICAgICB0aW1lc1RvUGxheSA9IE1hdGguZmxvb3IoIG5vcm1hbGl6ZWRWYWx1ZSAqIDMgKSArIDI7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGltZXNUb1BsYXkgPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbGN1bGF0ZSB0aGUgbWluaW11bSBwbGF5YmFjayByYXRlIGJhc2VkIG9uIHRoZSBjdXJyZW50IGNvbmNlbnRyYXRpb24uXHJcbiAgICBjb25zdCBtaW5QbGF5YmFja1JhdGUgPSAxICsgbm9ybWFsaXplZFZhbHVlICogMjtcclxuXHJcbiAgICBsZXQgZGVsYXlBbW91bnQgPSAwO1xyXG4gICAgXy50aW1lcyggdGltZXNUb1BsYXksICgpID0+IHtcclxuXHJcbiAgICAgIC8vIFNldCB0aGUgcGxheWJhY2sgcmF0ZSB3aXRoIHNvbWUgcmFuZG9taXphdGlvbi5cclxuICAgICAgdGhpcy5iYXNlU291bmRDbGlwLnNldFBsYXliYWNrUmF0ZSggbWluUGxheWJhY2tSYXRlICsgKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogMC4yICksIDAgKTtcclxuXHJcbiAgICAgIC8vIFB1dCBzb21lIHNwYWNpbmcgYmV0d2VlbiBlYWNoIHBsYXlpbmcgb2YgdGhlIGNsaXAuICBUaGUgcGFyYW1ldGVycyBvZiB0aGUgY2FsY3VsYXRpb24gYXJlIGJyb2tlbiBvdXQgdG8gbWFrZVxyXG4gICAgICAvLyBleHBlcmltZW50YXRpb24gYW5kIGFkanVzdG1lbnQgZWFzaWVyLlxyXG4gICAgICB0aGlzLmJhc2VTb3VuZENsaXAucGxheSggZGVsYXlBbW91bnQgKTtcclxuICAgICAgZGVsYXlBbW91bnQgPSBkZWxheUFtb3VudCArIG1pbmltdW1JbnRlclNvdW5kVGltZSArIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiAoIG1heGltdW1JbnRlclNvdW5kVGltZSAtIG1pbmltdW1JbnRlclNvdW5kVGltZSApO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5iYXNlU291bmRDbGlwLnNldFBsYXliYWNrUmF0ZSggMSwgMCApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0b3AoKTogdm9pZCB7XHJcbiAgICAvLyBkb2VzIG5vdGhpbmcgaW4gdGhpcyBjbGFzcywgYnV0IGlzIG5lZWRlZCBmb3IgdGhlIFRTb3VuZFBsYXllciBpbnRlcmZhY2VcclxuICB9XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdDb25jZW50cmF0aW9uU2xpZGVyU291bmRHZW5lcmF0b3InLCBDb25jZW50cmF0aW9uU2xpZGVyU291bmRHZW5lcmF0b3IgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvbmNlbnRyYXRpb25TbGlkZXJTb3VuZEdlbmVyYXRvcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sb0RBQW9EO0FBQzFFLE9BQU9DLHNCQUFzQixNQUFNLGlFQUFpRTtBQUNwRyxPQUFPQyxZQUFZLE1BQU0sc0NBQXNDO0FBRS9ELE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxrQkFBa0IsTUFBTSx1Q0FBdUM7QUFDdEUsT0FBT0MsY0FBYyxNQUFpQyx5REFBeUQ7QUFDL0csT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUl2RCxNQUFNQyxpQ0FBaUMsU0FBU04sc0JBQXNCLENBQUM7RUFFOURPLFdBQVdBLENBQUVDLHFCQUFnRCxFQUFFQyxVQUFpQixFQUFHO0lBRXhGO0lBQ0EsTUFBTUMsMEJBQTBCLEdBQUcsSUFBSUMsK0JBQStCLENBQUVILHFCQUFxQixFQUFFQyxVQUFVLEVBQUU7TUFDekdHLGtCQUFrQixFQUFFO0lBQ3RCLENBQUUsQ0FBQztJQUNIWCxZQUFZLENBQUNZLGlCQUFpQixDQUFFSCwwQkFBMkIsQ0FBQztJQUU1RCxLQUFLLENBQUVELFVBQVUsRUFBRTtNQUVqQkssd0JBQXdCLEVBQUUsQ0FBQztNQUMzQkMseUJBQXlCLEVBQUVMLDBCQUEwQjtNQUNyRE0sMkJBQTJCLEVBQUVOO0lBQy9CLENBQUUsQ0FBQztFQUNMO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsK0JBQStCLFNBQVNQLGNBQWMsQ0FBeUI7RUFLNUVHLFdBQVdBLENBQUVDLHFCQUFnRCxFQUNoRFMsa0JBQXlCLEVBQ3pCQyxPQUF3QyxFQUFHO0lBRTdELEtBQUssQ0FBRUEsT0FBUSxDQUFDOztJQUVoQjtJQUNBO0lBQ0EsTUFBTUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDQyxZQUFZLENBQUNDLHdCQUF3QixDQUFDLENBQUM7O0lBRTNFO0lBQ0EsTUFBTUMsR0FBRyxHQUFHLElBQUksQ0FBQ0YsWUFBWSxDQUFDRyxXQUFXO0lBQ3pDSixzQkFBc0IsQ0FBQ0ssU0FBUyxDQUFDQyxjQUFjLENBQUUsQ0FBQyxDQUFDLEVBQUVILEdBQUksQ0FBQztJQUMxREgsc0JBQXNCLENBQUNPLElBQUksQ0FBQ0QsY0FBYyxDQUFFLENBQUMsRUFBRUgsR0FBSSxDQUFDLENBQUMsQ0FBQztJQUN0REgsc0JBQXNCLENBQUNRLEtBQUssQ0FBQ0YsY0FBYyxDQUFFLEVBQUUsRUFBRUgsR0FBSSxDQUFDO0lBQ3RESCxzQkFBc0IsQ0FBQ1MsTUFBTSxDQUFDSCxjQUFjLENBQUUsQ0FBQyxFQUFFSCxHQUFJLENBQUM7SUFDdERILHNCQUFzQixDQUFDVSxPQUFPLENBQUNKLGNBQWMsQ0FBRSxJQUFJLEVBQUVILEdBQUksQ0FBQztJQUMxREgsc0JBQXNCLENBQUNXLE9BQU8sQ0FBRSxJQUFJLENBQUNDLGNBQWUsQ0FBQzs7SUFFckQ7SUFDQSxJQUFJLENBQUNDLGFBQWEsR0FBRyxJQUFJakMsU0FBUyxDQUFFSSxrQkFBa0IsRUFBRTtNQUN0RDhCLDhCQUE4QixFQUFFO0lBQ2xDLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0QsYUFBYSxDQUFDRixPQUFPLENBQUVYLHNCQUF1QixDQUFDOztJQUVwRDtJQUNBLElBQUksQ0FBQ1gscUJBQXFCLEdBQUdBLHFCQUFxQjtJQUNsRCxJQUFJLENBQUNTLGtCQUFrQixHQUFHQSxrQkFBa0I7RUFDOUM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNTaUIsSUFBSUEsQ0FBQSxFQUFTO0lBRWxCO0lBQ0EsTUFBTUMscUJBQXFCLEdBQUcsSUFBSTtJQUNsQyxNQUFNQyxxQkFBcUIsR0FBR0QscUJBQXFCLEdBQUcsR0FBRzs7SUFFekQ7SUFDQTtJQUNBLE1BQU1FLDhCQUE4QixHQUFHLENBQUM7O0lBRXhDO0lBQ0EsTUFBTUMsZUFBZSxHQUFHLElBQUksQ0FBQ3JCLGtCQUFrQixDQUFDc0Isa0JBQWtCLENBQUUsSUFBSSxDQUFDL0IscUJBQXFCLENBQUNnQyxLQUFNLENBQUM7O0lBRXRHO0lBQ0E7SUFDQTtJQUNBLElBQUlDLFdBQVc7SUFDZixJQUFLLElBQUksQ0FBQ1QsYUFBYSxDQUFDVSwyQkFBMkIsQ0FBQyxDQUFDLEdBQUdMLDhCQUE4QixFQUFHO01BQ3ZGSSxXQUFXLEdBQUdFLElBQUksQ0FBQ0MsS0FBSyxDQUFFTixlQUFlLEdBQUcsQ0FBRSxDQUFDLEdBQUcsQ0FBQztJQUNyRCxDQUFDLE1BQ0k7TUFDSEcsV0FBVyxHQUFHLENBQUM7SUFDakI7O0lBRUE7SUFDQSxNQUFNSSxlQUFlLEdBQUcsQ0FBQyxHQUFHUCxlQUFlLEdBQUcsQ0FBQztJQUUvQyxJQUFJUSxXQUFXLEdBQUcsQ0FBQztJQUNuQkMsQ0FBQyxDQUFDQyxLQUFLLENBQUVQLFdBQVcsRUFBRSxNQUFNO01BRTFCO01BQ0EsSUFBSSxDQUFDVCxhQUFhLENBQUNpQixlQUFlLENBQUVKLGVBQWUsR0FBS3hDLFNBQVMsQ0FBQzZDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsR0FBSyxFQUFFLENBQUUsQ0FBQzs7TUFFM0Y7TUFDQTtNQUNBLElBQUksQ0FBQ2xCLGFBQWEsQ0FBQ0UsSUFBSSxDQUFFWSxXQUFZLENBQUM7TUFDdENBLFdBQVcsR0FBR0EsV0FBVyxHQUFHWCxxQkFBcUIsR0FBRzlCLFNBQVMsQ0FBQzZDLFVBQVUsQ0FBQyxDQUFDLElBQUtkLHFCQUFxQixHQUFHRCxxQkFBcUIsQ0FBRTtJQUNoSSxDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNILGFBQWEsQ0FBQ2lCLGVBQWUsQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0VBQzVDO0VBRU9FLElBQUlBLENBQUEsRUFBUztJQUNsQjtFQUFBO0FBRUo7QUFFQWpELGdCQUFnQixDQUFDa0QsUUFBUSxDQUFFLG1DQUFtQyxFQUFFOUMsaUNBQWtDLENBQUM7QUFFbkcsZUFBZUEsaUNBQWlDIn0=