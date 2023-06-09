// Copyright 2019-2022, University of Colorado Boulder

/**
 * Plays a sine wave using an Oscillator Node
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import LinearFunction from '../../../dot/js/LinearFunction.js';
import optionize from '../../../phet-core/js/optionize.js';
import SoundGenerator from './SoundGenerator.js';
import soundConstants from '../../../tambo/js/soundConstants.js';
import tambo from '../tambo.js';

// For the sound scene, map the amplitude to the output level for the "Play Tone"
const mapAmplitudeToOutputLevel = new LinearFunction(0, 10, 0, 0.3 // Max output level
);

class WaveGenerator extends SoundGenerator {
  // {OscillatorNode|null} created when sound begins and nullified when sound ends, see #373

  constructor(frequencyProperty, amplitudeProperty, providedOptions) {
    const options = optionize()({
      initialOutputLevel: 0,
      // Starts silent, see elsewhere in this file for where the outputLevel is set as a function of amplitude
      oscillatorType: 'sine'
    }, providedOptions);
    super(options);
    this.oscillator = null;
    const updateFrequency = () => {
      const value = frequencyProperty.value * 1000; // convert frequency in mHz to Hz
      this.oscillator && this.oscillator.frequency.setValueAtTime(value, this.audioContext.currentTime);
    };
    frequencyProperty.link(updateFrequency);
    this.fullyEnabledProperty.link(fullyEnabled => {
      if (fullyEnabled && this.oscillator === null) {
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = options.oscillatorType;
        updateFrequency();
        this.oscillator.connect(this.soundSourceDestination);
        this.oscillator.start();
      } else if (!fullyEnabled && this.oscillator !== null) {
        // Turn off the audio, note that there is no need to disconnect the oscillator - this happens automatically
        this.oscillator.stop(this.audioContext.currentTime + soundConstants.DEFAULT_LINEAR_GAIN_CHANGE_TIME);
        this.oscillator = null;
      }
    });

    // wire up volume to amplitude
    amplitudeProperty.link(amplitude => this.setOutputLevel(mapAmplitudeToOutputLevel.evaluate(amplitude)));
  }
}
tambo.register('WaveGenerator', WaveGenerator);
export default WaveGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lYXJGdW5jdGlvbiIsIm9wdGlvbml6ZSIsIlNvdW5kR2VuZXJhdG9yIiwic291bmRDb25zdGFudHMiLCJ0YW1ibyIsIm1hcEFtcGxpdHVkZVRvT3V0cHV0TGV2ZWwiLCJXYXZlR2VuZXJhdG9yIiwiY29uc3RydWN0b3IiLCJmcmVxdWVuY3lQcm9wZXJ0eSIsImFtcGxpdHVkZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImluaXRpYWxPdXRwdXRMZXZlbCIsIm9zY2lsbGF0b3JUeXBlIiwib3NjaWxsYXRvciIsInVwZGF0ZUZyZXF1ZW5jeSIsInZhbHVlIiwiZnJlcXVlbmN5Iiwic2V0VmFsdWVBdFRpbWUiLCJhdWRpb0NvbnRleHQiLCJjdXJyZW50VGltZSIsImxpbmsiLCJmdWxseUVuYWJsZWRQcm9wZXJ0eSIsImZ1bGx5RW5hYmxlZCIsImNyZWF0ZU9zY2lsbGF0b3IiLCJ0eXBlIiwiY29ubmVjdCIsInNvdW5kU291cmNlRGVzdGluYXRpb24iLCJzdGFydCIsInN0b3AiLCJERUZBVUxUX0xJTkVBUl9HQUlOX0NIQU5HRV9USU1FIiwiYW1wbGl0dWRlIiwic2V0T3V0cHV0TGV2ZWwiLCJldmFsdWF0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2F2ZUdlbmVyYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQbGF5cyBhIHNpbmUgd2F2ZSB1c2luZyBhbiBPc2NpbGxhdG9yIE5vZGVcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTGluZWFyRnVuY3Rpb24gZnJvbSAnLi4vLi4vLi4vZG90L2pzL0xpbmVhckZ1bmN0aW9uLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFNvdW5kR2VuZXJhdG9yLCB7IFNvdW5kR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gJy4vU291bmRHZW5lcmF0b3IuanMnO1xyXG5pbXBvcnQgc291bmRDb25zdGFudHMgZnJvbSAnLi4vLi4vLi4vdGFtYm8vanMvc291bmRDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgdGFtYm8gZnJvbSAnLi4vdGFtYm8uanMnO1xyXG5cclxuLy8gRm9yIHRoZSBzb3VuZCBzY2VuZSwgbWFwIHRoZSBhbXBsaXR1ZGUgdG8gdGhlIG91dHB1dCBsZXZlbCBmb3IgdGhlIFwiUGxheSBUb25lXCJcclxuY29uc3QgbWFwQW1wbGl0dWRlVG9PdXRwdXRMZXZlbCA9IG5ldyBMaW5lYXJGdW5jdGlvbihcclxuICAwLFxyXG4gIDEwLFxyXG4gIDAsXHJcbiAgMC4zIC8vIE1heCBvdXRwdXQgbGV2ZWxcclxuKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgaW5pdGlhbE91dHB1dExldmVsPzogbnVtYmVyO1xyXG4gIG9zY2lsbGF0b3JUeXBlPzogT3NjaWxsYXRvclR5cGU7XHJcbn07XHJcblxyXG50eXBlIFdhdmVHZW5lcmF0b3JPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTb3VuZEdlbmVyYXRvck9wdGlvbnM7XHJcblxyXG5jbGFzcyBXYXZlR2VuZXJhdG9yIGV4dGVuZHMgU291bmRHZW5lcmF0b3Ige1xyXG5cclxuICAvLyB7T3NjaWxsYXRvck5vZGV8bnVsbH0gY3JlYXRlZCB3aGVuIHNvdW5kIGJlZ2lucyBhbmQgbnVsbGlmaWVkIHdoZW4gc291bmQgZW5kcywgc2VlICMzNzNcclxuICBwcml2YXRlIG9zY2lsbGF0b3I6IE9zY2lsbGF0b3JOb2RlIHwgbnVsbDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBmcmVxdWVuY3lQcm9wZXJ0eTogUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LCBhbXBsaXR1ZGVQcm9wZXJ0eTogUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LCBwcm92aWRlZE9wdGlvbnM/OiBXYXZlR2VuZXJhdG9yT3B0aW9ucyApIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8V2F2ZUdlbmVyYXRvck9wdGlvbnMsIFNlbGZPcHRpb25zLCBTb3VuZEdlbmVyYXRvck9wdGlvbnM+KCkoIHtcclxuICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLCAvLyBTdGFydHMgc2lsZW50LCBzZWUgZWxzZXdoZXJlIGluIHRoaXMgZmlsZSBmb3Igd2hlcmUgdGhlIG91dHB1dExldmVsIGlzIHNldCBhcyBhIGZ1bmN0aW9uIG9mIGFtcGxpdHVkZVxyXG4gICAgICBvc2NpbGxhdG9yVHlwZTogJ3NpbmUnXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5vc2NpbGxhdG9yID0gbnVsbDtcclxuICAgIGNvbnN0IHVwZGF0ZUZyZXF1ZW5jeSA9ICgpID0+IHtcclxuICAgICAgY29uc3QgdmFsdWUgPSBmcmVxdWVuY3lQcm9wZXJ0eS52YWx1ZSAqIDEwMDA7IC8vIGNvbnZlcnQgZnJlcXVlbmN5IGluIG1IeiB0byBIelxyXG4gICAgICB0aGlzLm9zY2lsbGF0b3IgJiYgdGhpcy5vc2NpbGxhdG9yLmZyZXF1ZW5jeS5zZXRWYWx1ZUF0VGltZSggdmFsdWUsIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICk7XHJcbiAgICB9O1xyXG4gICAgZnJlcXVlbmN5UHJvcGVydHkubGluayggdXBkYXRlRnJlcXVlbmN5ICk7XHJcblxyXG4gICAgdGhpcy5mdWxseUVuYWJsZWRQcm9wZXJ0eS5saW5rKCBmdWxseUVuYWJsZWQgPT4ge1xyXG4gICAgICBpZiAoIGZ1bGx5RW5hYmxlZCAmJiB0aGlzLm9zY2lsbGF0b3IgPT09IG51bGwgKSB7XHJcbiAgICAgICAgdGhpcy5vc2NpbGxhdG9yID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xyXG4gICAgICAgIHRoaXMub3NjaWxsYXRvci50eXBlID0gb3B0aW9ucy5vc2NpbGxhdG9yVHlwZTtcclxuICAgICAgICB1cGRhdGVGcmVxdWVuY3koKTtcclxuICAgICAgICB0aGlzLm9zY2lsbGF0b3IuY29ubmVjdCggdGhpcy5zb3VuZFNvdXJjZURlc3RpbmF0aW9uICk7XHJcbiAgICAgICAgdGhpcy5vc2NpbGxhdG9yLnN0YXJ0KCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoICFmdWxseUVuYWJsZWQgJiYgdGhpcy5vc2NpbGxhdG9yICE9PSBudWxsICkge1xyXG5cclxuICAgICAgICAvLyBUdXJuIG9mZiB0aGUgYXVkaW8sIG5vdGUgdGhhdCB0aGVyZSBpcyBubyBuZWVkIHRvIGRpc2Nvbm5lY3QgdGhlIG9zY2lsbGF0b3IgLSB0aGlzIGhhcHBlbnMgYXV0b21hdGljYWxseVxyXG4gICAgICAgIHRoaXMub3NjaWxsYXRvci5zdG9wKCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHNvdW5kQ29uc3RhbnRzLkRFRkFVTFRfTElORUFSX0dBSU5fQ0hBTkdFX1RJTUUgKTtcclxuICAgICAgICB0aGlzLm9zY2lsbGF0b3IgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gd2lyZSB1cCB2b2x1bWUgdG8gYW1wbGl0dWRlXHJcbiAgICBhbXBsaXR1ZGVQcm9wZXJ0eS5saW5rKCBhbXBsaXR1ZGUgPT4gdGhpcy5zZXRPdXRwdXRMZXZlbCggbWFwQW1wbGl0dWRlVG9PdXRwdXRMZXZlbC5ldmFsdWF0ZSggYW1wbGl0dWRlICkgKSApO1xyXG4gIH1cclxufVxyXG5cclxudGFtYm8ucmVnaXN0ZXIoICdXYXZlR2VuZXJhdG9yJywgV2F2ZUdlbmVyYXRvciApO1xyXG5leHBvcnQgZGVmYXVsdCBXYXZlR2VuZXJhdG9yOyJdLCJt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