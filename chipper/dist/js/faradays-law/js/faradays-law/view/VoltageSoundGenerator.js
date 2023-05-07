// Copyright 2020-2022, University of Colorado Boulder

/**
 * VoltageSoundGenerator is a sound generator that produces sounds based on the voltage level.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../tambo/js/sound-generators/SoundGenerator.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import lightbulbVoltageNoteBFlat4_mp3 from '../../../sounds/lightbulbVoltageNoteBFlat4_mp3.js';
import lightbulbVoltageNoteC4_mp3 from '../../../sounds/lightbulbVoltageNoteC4_mp3.js';
import lightbulbVoltageNoteC5_mp3 from '../../../sounds/lightbulbVoltageNoteC5_mp3.js';
import lightbulbVoltageNoteE4_mp3 from '../../../sounds/lightbulbVoltageNoteE4_mp3.js';
import lightbulbVoltageNoteG4_mp3 from '../../../sounds/lightbulbVoltageNoteG4_mp3.js';
import faradaysLaw from '../../faradaysLaw.js';

// constants
const SOUND_GENERATION_THRESHOLD_VOLTAGE = 0.01; // in volts, empirically determined, must be greater than zero
const TONE_OPTIONS = {
  loop: true,
  initialOutputLevel: 0
};

// By design, the voltage in this sim hits its max at pi/2 so that it is easy to integrate with the voltmeter, so use
// that value for the maximum voltage in the calculations for this sound generator.
const MAX_VOLTAGE_FOR_CALCULATIONS = Math.PI / 2;
class VoltageSoundGenerator extends SoundGenerator {
  /**
   * @param {NumberProperty} voltageProperty
   * @param {Object} [options]
   * @constructor
   */
  constructor(voltageProperty, options) {
    options = merge({
      initialOutputLevel: 0.2
    }, options);
    super(options);

    // sound clips that represent individual tones and that are layered to produce the voltage sound
    const voltageSoundClips = [new SoundClip(lightbulbVoltageNoteC4_mp3, TONE_OPTIONS), new SoundClip(lightbulbVoltageNoteE4_mp3, TONE_OPTIONS), new SoundClip(lightbulbVoltageNoteG4_mp3, TONE_OPTIONS)];
    voltageSoundClips.forEach(voltageSoundClip => {
      voltageSoundClip.connect(this.masterGainNode);
    });

    // high notes that are played or not based on the sign of the voltage
    const highNoteOutputLevelMultiplier = 0.2;
    const positiveVoltmeterHighTone = new SoundClip(lightbulbVoltageNoteC5_mp3, TONE_OPTIONS);
    soundManager.addSoundGenerator(positiveVoltmeterHighTone);
    const positiveVoltmeterLowTone = new SoundClip(lightbulbVoltageNoteBFlat4_mp3, TONE_OPTIONS);
    soundManager.addSoundGenerator(positiveVoltmeterLowTone);

    // closure for adjusting the sound based on the voltage
    const voltageListener = voltage => {
      const voltageMagnitude = Math.abs(voltage);
      if (voltageMagnitude > SOUND_GENERATION_THRESHOLD_VOLTAGE) {
        // Set the level for each of the lower tones based on the voltage level.  The lowest tones kick in first (i.e at
        // the lowest voltage), then the next ones are layered in.
        voltageSoundClips.forEach((clip, index) => {
          if (!clip.isPlaying) {
            clip.play();
          }
          const playThreshold = index * (MAX_VOLTAGE_FOR_CALCULATIONS / voltageSoundClips.length);
          const outputLevel = Utils.clamp(0, voltageMagnitude - playThreshold, 1);
          clip.setOutputLevel(outputLevel);
        });

        // top tone, which varies based on whether the voltage is positive or negative
        const topNoteOutputLevel = Utils.clamp(0, voltageMagnitude, 1) * highNoteOutputLevelMultiplier;
        if (voltage > 0) {
          if (!positiveVoltmeterHighTone.isPlaying) {
            positiveVoltmeterHighTone.play();
          }
          positiveVoltmeterHighTone.setOutputLevel(topNoteOutputLevel);
          positiveVoltmeterLowTone.stop();
        } else if (voltage < 0) {
          if (!positiveVoltmeterLowTone.isPlaying) {
            positiveVoltmeterLowTone.play();
          }
          positiveVoltmeterLowTone.setOutputLevel(topNoteOutputLevel);
          positiveVoltmeterHighTone.stop();
        }
      } else {
        // The voltage is below the sound generation threshold, so stop all tones.
        voltageSoundClips.forEach(clip => {
          if (clip.isPlaying) {
            clip.stop();
          }
        });
        positiveVoltmeterHighTone.stop();
        positiveVoltmeterLowTone.stop();
      }
    };
    voltageProperty.link(voltageListener);

    // @private {function}
    this.disposeVoltageSoundGenerator = () => {
      voltageProperty.unlink(voltageListener);
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeVoltageSoundGenerator();
    super.dispose();
  }
}
faradaysLaw.register('VoltageSoundGenerator', VoltageSoundGenerator);
export default VoltageSoundGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIm1lcmdlIiwiU291bmRDbGlwIiwiU291bmRHZW5lcmF0b3IiLCJzb3VuZE1hbmFnZXIiLCJsaWdodGJ1bGJWb2x0YWdlTm90ZUJGbGF0NF9tcDMiLCJsaWdodGJ1bGJWb2x0YWdlTm90ZUM0X21wMyIsImxpZ2h0YnVsYlZvbHRhZ2VOb3RlQzVfbXAzIiwibGlnaHRidWxiVm9sdGFnZU5vdGVFNF9tcDMiLCJsaWdodGJ1bGJWb2x0YWdlTm90ZUc0X21wMyIsImZhcmFkYXlzTGF3IiwiU09VTkRfR0VORVJBVElPTl9USFJFU0hPTERfVk9MVEFHRSIsIlRPTkVfT1BUSU9OUyIsImxvb3AiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJNQVhfVk9MVEFHRV9GT1JfQ0FMQ1VMQVRJT05TIiwiTWF0aCIsIlBJIiwiVm9sdGFnZVNvdW5kR2VuZXJhdG9yIiwiY29uc3RydWN0b3IiLCJ2b2x0YWdlUHJvcGVydHkiLCJvcHRpb25zIiwidm9sdGFnZVNvdW5kQ2xpcHMiLCJmb3JFYWNoIiwidm9sdGFnZVNvdW5kQ2xpcCIsImNvbm5lY3QiLCJtYXN0ZXJHYWluTm9kZSIsImhpZ2hOb3RlT3V0cHV0TGV2ZWxNdWx0aXBsaWVyIiwicG9zaXRpdmVWb2x0bWV0ZXJIaWdoVG9uZSIsImFkZFNvdW5kR2VuZXJhdG9yIiwicG9zaXRpdmVWb2x0bWV0ZXJMb3dUb25lIiwidm9sdGFnZUxpc3RlbmVyIiwidm9sdGFnZSIsInZvbHRhZ2VNYWduaXR1ZGUiLCJhYnMiLCJjbGlwIiwiaW5kZXgiLCJpc1BsYXlpbmciLCJwbGF5IiwicGxheVRocmVzaG9sZCIsImxlbmd0aCIsIm91dHB1dExldmVsIiwiY2xhbXAiLCJzZXRPdXRwdXRMZXZlbCIsInRvcE5vdGVPdXRwdXRMZXZlbCIsInN0b3AiLCJsaW5rIiwiZGlzcG9zZVZvbHRhZ2VTb3VuZEdlbmVyYXRvciIsInVubGluayIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZvbHRhZ2VTb3VuZEdlbmVyYXRvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWb2x0YWdlU291bmRHZW5lcmF0b3IgaXMgYSBzb3VuZCBnZW5lcmF0b3IgdGhhdCBwcm9kdWNlcyBzb3VuZHMgYmFzZWQgb24gdGhlIHZvbHRhZ2UgbGV2ZWwuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU291bmRDbGlwIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvU291bmRDbGlwLmpzJztcclxuaW1wb3J0IFNvdW5kR2VuZXJhdG9yIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvU291bmRHZW5lcmF0b3IuanMnO1xyXG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci5qcyc7XHJcbmltcG9ydCBsaWdodGJ1bGJWb2x0YWdlTm90ZUJGbGF0NF9tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL2xpZ2h0YnVsYlZvbHRhZ2VOb3RlQkZsYXQ0X21wMy5qcyc7XHJcbmltcG9ydCBsaWdodGJ1bGJWb2x0YWdlTm90ZUM0X21wMyBmcm9tICcuLi8uLi8uLi9zb3VuZHMvbGlnaHRidWxiVm9sdGFnZU5vdGVDNF9tcDMuanMnO1xyXG5pbXBvcnQgbGlnaHRidWxiVm9sdGFnZU5vdGVDNV9tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL2xpZ2h0YnVsYlZvbHRhZ2VOb3RlQzVfbXAzLmpzJztcclxuaW1wb3J0IGxpZ2h0YnVsYlZvbHRhZ2VOb3RlRTRfbXAzIGZyb20gJy4uLy4uLy4uL3NvdW5kcy9saWdodGJ1bGJWb2x0YWdlTm90ZUU0X21wMy5qcyc7XHJcbmltcG9ydCBsaWdodGJ1bGJWb2x0YWdlTm90ZUc0X21wMyBmcm9tICcuLi8uLi8uLi9zb3VuZHMvbGlnaHRidWxiVm9sdGFnZU5vdGVHNF9tcDMuanMnO1xyXG5pbXBvcnQgZmFyYWRheXNMYXcgZnJvbSAnLi4vLi4vZmFyYWRheXNMYXcuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNPVU5EX0dFTkVSQVRJT05fVEhSRVNIT0xEX1ZPTFRBR0UgPSAwLjAxOyAvLyBpbiB2b2x0cywgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCwgbXVzdCBiZSBncmVhdGVyIHRoYW4gemVyb1xyXG5jb25zdCBUT05FX09QVElPTlMgPSB7IGxvb3A6IHRydWUsIGluaXRpYWxPdXRwdXRMZXZlbDogMCB9O1xyXG5cclxuLy8gQnkgZGVzaWduLCB0aGUgdm9sdGFnZSBpbiB0aGlzIHNpbSBoaXRzIGl0cyBtYXggYXQgcGkvMiBzbyB0aGF0IGl0IGlzIGVhc3kgdG8gaW50ZWdyYXRlIHdpdGggdGhlIHZvbHRtZXRlciwgc28gdXNlXHJcbi8vIHRoYXQgdmFsdWUgZm9yIHRoZSBtYXhpbXVtIHZvbHRhZ2UgaW4gdGhlIGNhbGN1bGF0aW9ucyBmb3IgdGhpcyBzb3VuZCBnZW5lcmF0b3IuXHJcbmNvbnN0IE1BWF9WT0xUQUdFX0ZPUl9DQUxDVUxBVElPTlMgPSBNYXRoLlBJIC8gMjtcclxuXHJcbmNsYXNzIFZvbHRhZ2VTb3VuZEdlbmVyYXRvciBleHRlbmRzIFNvdW5kR2VuZXJhdG9yIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJQcm9wZXJ0eX0gdm9sdGFnZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB2b2x0YWdlUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGluaXRpYWxPdXRwdXRMZXZlbDogMC4yXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBzb3VuZCBjbGlwcyB0aGF0IHJlcHJlc2VudCBpbmRpdmlkdWFsIHRvbmVzIGFuZCB0aGF0IGFyZSBsYXllcmVkIHRvIHByb2R1Y2UgdGhlIHZvbHRhZ2Ugc291bmRcclxuICAgIGNvbnN0IHZvbHRhZ2VTb3VuZENsaXBzID0gW1xyXG4gICAgICBuZXcgU291bmRDbGlwKCBsaWdodGJ1bGJWb2x0YWdlTm90ZUM0X21wMywgVE9ORV9PUFRJT05TICksXHJcbiAgICAgIG5ldyBTb3VuZENsaXAoIGxpZ2h0YnVsYlZvbHRhZ2VOb3RlRTRfbXAzLCBUT05FX09QVElPTlMgKSxcclxuICAgICAgbmV3IFNvdW5kQ2xpcCggbGlnaHRidWxiVm9sdGFnZU5vdGVHNF9tcDMsIFRPTkVfT1BUSU9OUyApXHJcbiAgICBdO1xyXG4gICAgdm9sdGFnZVNvdW5kQ2xpcHMuZm9yRWFjaCggdm9sdGFnZVNvdW5kQ2xpcCA9PiB7XHJcbiAgICAgIHZvbHRhZ2VTb3VuZENsaXAuY29ubmVjdCggdGhpcy5tYXN0ZXJHYWluTm9kZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGhpZ2ggbm90ZXMgdGhhdCBhcmUgcGxheWVkIG9yIG5vdCBiYXNlZCBvbiB0aGUgc2lnbiBvZiB0aGUgdm9sdGFnZVxyXG4gICAgY29uc3QgaGlnaE5vdGVPdXRwdXRMZXZlbE11bHRpcGxpZXIgPSAwLjI7XHJcbiAgICBjb25zdCBwb3NpdGl2ZVZvbHRtZXRlckhpZ2hUb25lID0gbmV3IFNvdW5kQ2xpcCggbGlnaHRidWxiVm9sdGFnZU5vdGVDNV9tcDMsIFRPTkVfT1BUSU9OUyApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBwb3NpdGl2ZVZvbHRtZXRlckhpZ2hUb25lICk7XHJcbiAgICBjb25zdCBwb3NpdGl2ZVZvbHRtZXRlckxvd1RvbmUgPSBuZXcgU291bmRDbGlwKCBsaWdodGJ1bGJWb2x0YWdlTm90ZUJGbGF0NF9tcDMsIFRPTkVfT1BUSU9OUyApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBwb3NpdGl2ZVZvbHRtZXRlckxvd1RvbmUgKTtcclxuXHJcbiAgICAvLyBjbG9zdXJlIGZvciBhZGp1c3RpbmcgdGhlIHNvdW5kIGJhc2VkIG9uIHRoZSB2b2x0YWdlXHJcbiAgICBjb25zdCB2b2x0YWdlTGlzdGVuZXIgPSB2b2x0YWdlID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IHZvbHRhZ2VNYWduaXR1ZGUgPSBNYXRoLmFicyggdm9sdGFnZSApO1xyXG5cclxuICAgICAgaWYgKCB2b2x0YWdlTWFnbml0dWRlID4gU09VTkRfR0VORVJBVElPTl9USFJFU0hPTERfVk9MVEFHRSApIHtcclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSBsZXZlbCBmb3IgZWFjaCBvZiB0aGUgbG93ZXIgdG9uZXMgYmFzZWQgb24gdGhlIHZvbHRhZ2UgbGV2ZWwuICBUaGUgbG93ZXN0IHRvbmVzIGtpY2sgaW4gZmlyc3QgKGkuZSBhdFxyXG4gICAgICAgIC8vIHRoZSBsb3dlc3Qgdm9sdGFnZSksIHRoZW4gdGhlIG5leHQgb25lcyBhcmUgbGF5ZXJlZCBpbi5cclxuICAgICAgICB2b2x0YWdlU291bmRDbGlwcy5mb3JFYWNoKCAoIGNsaXAsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgICAgaWYgKCAhY2xpcC5pc1BsYXlpbmcgKSB7XHJcbiAgICAgICAgICAgIGNsaXAucGxheSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgcGxheVRocmVzaG9sZCA9IGluZGV4ICogKCBNQVhfVk9MVEFHRV9GT1JfQ0FMQ1VMQVRJT05TIC8gdm9sdGFnZVNvdW5kQ2xpcHMubGVuZ3RoICk7XHJcbiAgICAgICAgICBjb25zdCBvdXRwdXRMZXZlbCA9IFV0aWxzLmNsYW1wKCAwLCB2b2x0YWdlTWFnbml0dWRlIC0gcGxheVRocmVzaG9sZCwgMSApO1xyXG4gICAgICAgICAgY2xpcC5zZXRPdXRwdXRMZXZlbCggb3V0cHV0TGV2ZWwgKTtcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIHRvcCB0b25lLCB3aGljaCB2YXJpZXMgYmFzZWQgb24gd2hldGhlciB0aGUgdm9sdGFnZSBpcyBwb3NpdGl2ZSBvciBuZWdhdGl2ZVxyXG4gICAgICAgIGNvbnN0IHRvcE5vdGVPdXRwdXRMZXZlbCA9IFV0aWxzLmNsYW1wKCAwLCB2b2x0YWdlTWFnbml0dWRlLCAxICkgKiBoaWdoTm90ZU91dHB1dExldmVsTXVsdGlwbGllcjtcclxuICAgICAgICBpZiAoIHZvbHRhZ2UgPiAwICkge1xyXG4gICAgICAgICAgaWYgKCAhcG9zaXRpdmVWb2x0bWV0ZXJIaWdoVG9uZS5pc1BsYXlpbmcgKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aXZlVm9sdG1ldGVySGlnaFRvbmUucGxheSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcG9zaXRpdmVWb2x0bWV0ZXJIaWdoVG9uZS5zZXRPdXRwdXRMZXZlbCggdG9wTm90ZU91dHB1dExldmVsICk7XHJcbiAgICAgICAgICBwb3NpdGl2ZVZvbHRtZXRlckxvd1RvbmUuc3RvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggdm9sdGFnZSA8IDAgKSB7XHJcbiAgICAgICAgICBpZiAoICFwb3NpdGl2ZVZvbHRtZXRlckxvd1RvbmUuaXNQbGF5aW5nICkge1xyXG4gICAgICAgICAgICBwb3NpdGl2ZVZvbHRtZXRlckxvd1RvbmUucGxheSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcG9zaXRpdmVWb2x0bWV0ZXJMb3dUb25lLnNldE91dHB1dExldmVsKCB0b3BOb3RlT3V0cHV0TGV2ZWwgKTtcclxuICAgICAgICAgIHBvc2l0aXZlVm9sdG1ldGVySGlnaFRvbmUuc3RvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gVGhlIHZvbHRhZ2UgaXMgYmVsb3cgdGhlIHNvdW5kIGdlbmVyYXRpb24gdGhyZXNob2xkLCBzbyBzdG9wIGFsbCB0b25lcy5cclxuICAgICAgICB2b2x0YWdlU291bmRDbGlwcy5mb3JFYWNoKCBjbGlwID0+IHtcclxuICAgICAgICAgIGlmICggY2xpcC5pc1BsYXlpbmcgKSB7XHJcbiAgICAgICAgICAgIGNsaXAuc3RvcCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBwb3NpdGl2ZVZvbHRtZXRlckhpZ2hUb25lLnN0b3AoKTtcclxuICAgICAgICBwb3NpdGl2ZVZvbHRtZXRlckxvd1RvbmUuc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHZvbHRhZ2VQcm9wZXJ0eS5saW5rKCB2b2x0YWdlTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259XHJcbiAgICB0aGlzLmRpc3Bvc2VWb2x0YWdlU291bmRHZW5lcmF0b3IgPSAoKSA9PiB7IHZvbHRhZ2VQcm9wZXJ0eS51bmxpbmsoIHZvbHRhZ2VMaXN0ZW5lciApOyB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VWb2x0YWdlU291bmRHZW5lcmF0b3IoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmZhcmFkYXlzTGF3LnJlZ2lzdGVyKCAnVm9sdGFnZVNvdW5kR2VuZXJhdG9yJywgVm9sdGFnZVNvdW5kR2VuZXJhdG9yICk7XHJcbmV4cG9ydCBkZWZhdWx0IFZvbHRhZ2VTb3VuZEdlbmVyYXRvcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLDZCQUE2QjtB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