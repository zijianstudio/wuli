// Copyright 2020-2022, University of Colorado Boulder

/**
 * Demo and test harness for the AmplitudeModulator class.  This creates several sound loops and routes them through
 * an amplitude modulator instance.  It also provides the properties that can be manipulated in the view to change the
 * attributes of the modulation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import saturatedSineLoop220Hz_mp3 from '../../../../sounds/saturatedSineLoop220Hz_mp3.js';
import windsLoopC3Oscilloscope_mp3 from '../../../../sounds/demo-and-test/windsLoopC3Oscilloscope_mp3.js';
import windsLoopMiddleCOscilloscope_mp3 from '../../../../sounds/demo-and-test/windsLoopMiddleCOscilloscope_mp3.js';
import AmplitudeModulator from '../../../AmplitudeModulator.js';
import SoundClip from '../../../sound-generators/SoundClip.js';
import SoundGenerator from '../../../sound-generators/SoundGenerator.js';
import tambo from '../../../tambo.js';
class AmplitudeModulatorDemo extends SoundGenerator {
  constructor(sourceSoundIndexProperty, options) {
    super(options);

    // Create the amplitude modulator.
    this.amplitudeModulator = new AmplitudeModulator();
    this.amplitudeModulator.connect(this.soundSourceDestination);

    // sound sources that will be modulated
    const soundLoops = [new SoundClip(saturatedSineLoop220Hz_mp3, {
      loop: true
    }), new SoundClip(windsLoopC3Oscilloscope_mp3, {
      loop: true
    }), new SoundClip(windsLoopMiddleCOscilloscope_mp3, {
      loop: true
    })];

    // hook each of the loops to the amplitude modulator
    soundLoops.forEach(soundLoop => {
      soundLoop.connect(this.amplitudeModulator.getConnectionPoint());
    });

    // Play and stop the loops based on the selection property's value.  An sound source index of 0 indicates that no
    // sound should be played, values above zero are decremented by one and then used as an index into the array of
    // sound loops.
    sourceSoundIndexProperty.link(soundSourceIndex => {
      soundLoops.forEach((soundLoop, index) => {
        if (index === soundSourceIndex - 1) {
          soundLoop.play();
        } else {
          soundLoop.stop();
        }
      });
    });
  }

  /**
   * restore initial state
   */
  reset() {
    this.amplitudeModulator.myEnabledProperty.set(true);
    this.amplitudeModulator.frequencyProperty.reset();
    this.amplitudeModulator.depthProperty.reset();
    this.amplitudeModulator.waveformProperty.reset();
  }
}
tambo.register('AmplitudeModulatorDemo', AmplitudeModulatorDemo);
export default AmplitudeModulatorDemo;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzYXR1cmF0ZWRTaW5lTG9vcDIyMEh6X21wMyIsIndpbmRzTG9vcEMzT3NjaWxsb3Njb3BlX21wMyIsIndpbmRzTG9vcE1pZGRsZUNPc2NpbGxvc2NvcGVfbXAzIiwiQW1wbGl0dWRlTW9kdWxhdG9yIiwiU291bmRDbGlwIiwiU291bmRHZW5lcmF0b3IiLCJ0YW1ibyIsIkFtcGxpdHVkZU1vZHVsYXRvckRlbW8iLCJjb25zdHJ1Y3RvciIsInNvdXJjZVNvdW5kSW5kZXhQcm9wZXJ0eSIsIm9wdGlvbnMiLCJhbXBsaXR1ZGVNb2R1bGF0b3IiLCJjb25uZWN0Iiwic291bmRTb3VyY2VEZXN0aW5hdGlvbiIsInNvdW5kTG9vcHMiLCJsb29wIiwiZm9yRWFjaCIsInNvdW5kTG9vcCIsImdldENvbm5lY3Rpb25Qb2ludCIsImxpbmsiLCJzb3VuZFNvdXJjZUluZGV4IiwiaW5kZXgiLCJwbGF5Iiwic3RvcCIsInJlc2V0IiwibXlFbmFibGVkUHJvcGVydHkiLCJzZXQiLCJmcmVxdWVuY3lQcm9wZXJ0eSIsImRlcHRoUHJvcGVydHkiLCJ3YXZlZm9ybVByb3BlcnR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlbW8gYW5kIHRlc3QgaGFybmVzcyBmb3IgdGhlIEFtcGxpdHVkZU1vZHVsYXRvciBjbGFzcy4gIFRoaXMgY3JlYXRlcyBzZXZlcmFsIHNvdW5kIGxvb3BzIGFuZCByb3V0ZXMgdGhlbSB0aHJvdWdoXHJcbiAqIGFuIGFtcGxpdHVkZSBtb2R1bGF0b3IgaW5zdGFuY2UuICBJdCBhbHNvIHByb3ZpZGVzIHRoZSBwcm9wZXJ0aWVzIHRoYXQgY2FuIGJlIG1hbmlwdWxhdGVkIGluIHRoZSB2aWV3IHRvIGNoYW5nZSB0aGVcclxuICogYXR0cmlidXRlcyBvZiB0aGUgbW9kdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgc2F0dXJhdGVkU2luZUxvb3AyMjBIel9tcDMgZnJvbSAnLi4vLi4vLi4vLi4vc291bmRzL3NhdHVyYXRlZFNpbmVMb29wMjIwSHpfbXAzLmpzJztcclxuaW1wb3J0IHdpbmRzTG9vcEMzT3NjaWxsb3Njb3BlX21wMyBmcm9tICcuLi8uLi8uLi8uLi9zb3VuZHMvZGVtby1hbmQtdGVzdC93aW5kc0xvb3BDM09zY2lsbG9zY29wZV9tcDMuanMnO1xyXG5pbXBvcnQgd2luZHNMb29wTWlkZGxlQ09zY2lsbG9zY29wZV9tcDMgZnJvbSAnLi4vLi4vLi4vLi4vc291bmRzL2RlbW8tYW5kLXRlc3Qvd2luZHNMb29wTWlkZGxlQ09zY2lsbG9zY29wZV9tcDMuanMnO1xyXG5pbXBvcnQgQW1wbGl0dWRlTW9kdWxhdG9yIGZyb20gJy4uLy4uLy4uL0FtcGxpdHVkZU1vZHVsYXRvci5qcyc7XHJcbmltcG9ydCBTb3VuZENsaXAgZnJvbSAnLi4vLi4vLi4vc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXAuanMnO1xyXG5pbXBvcnQgU291bmRHZW5lcmF0b3IsIHsgU291bmRHZW5lcmF0b3JPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vc291bmQtZ2VuZXJhdG9ycy9Tb3VuZEdlbmVyYXRvci5qcyc7XHJcbmltcG9ydCB0YW1ibyBmcm9tICcuLi8uLi8uLi90YW1iby5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuXHJcbmNsYXNzIEFtcGxpdHVkZU1vZHVsYXRvckRlbW8gZXh0ZW5kcyBTb3VuZEdlbmVyYXRvciB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBhbXBsaXR1ZGVNb2R1bGF0b3I6IEFtcGxpdHVkZU1vZHVsYXRvcjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzb3VyY2VTb3VuZEluZGV4UHJvcGVydHk6IE51bWJlclByb3BlcnR5LCBvcHRpb25zPzogU291bmRHZW5lcmF0b3JPcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBhbXBsaXR1ZGUgbW9kdWxhdG9yLlxyXG4gICAgdGhpcy5hbXBsaXR1ZGVNb2R1bGF0b3IgPSBuZXcgQW1wbGl0dWRlTW9kdWxhdG9yKCk7XHJcbiAgICB0aGlzLmFtcGxpdHVkZU1vZHVsYXRvci5jb25uZWN0KCB0aGlzLnNvdW5kU291cmNlRGVzdGluYXRpb24gKTtcclxuXHJcbiAgICAvLyBzb3VuZCBzb3VyY2VzIHRoYXQgd2lsbCBiZSBtb2R1bGF0ZWRcclxuICAgIGNvbnN0IHNvdW5kTG9vcHMgPSBbXHJcbiAgICAgIG5ldyBTb3VuZENsaXAoIHNhdHVyYXRlZFNpbmVMb29wMjIwSHpfbXAzLCB7IGxvb3A6IHRydWUgfSApLFxyXG4gICAgICBuZXcgU291bmRDbGlwKCB3aW5kc0xvb3BDM09zY2lsbG9zY29wZV9tcDMsIHsgbG9vcDogdHJ1ZSB9ICksXHJcbiAgICAgIG5ldyBTb3VuZENsaXAoIHdpbmRzTG9vcE1pZGRsZUNPc2NpbGxvc2NvcGVfbXAzLCB7IGxvb3A6IHRydWUgfSApXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIGhvb2sgZWFjaCBvZiB0aGUgbG9vcHMgdG8gdGhlIGFtcGxpdHVkZSBtb2R1bGF0b3JcclxuICAgIHNvdW5kTG9vcHMuZm9yRWFjaCggc291bmRMb29wID0+IHsgc291bmRMb29wLmNvbm5lY3QoIHRoaXMuYW1wbGl0dWRlTW9kdWxhdG9yLmdldENvbm5lY3Rpb25Qb2ludCgpICk7IH0gKTtcclxuXHJcbiAgICAvLyBQbGF5IGFuZCBzdG9wIHRoZSBsb29wcyBiYXNlZCBvbiB0aGUgc2VsZWN0aW9uIHByb3BlcnR5J3MgdmFsdWUuICBBbiBzb3VuZCBzb3VyY2UgaW5kZXggb2YgMCBpbmRpY2F0ZXMgdGhhdCBub1xyXG4gICAgLy8gc291bmQgc2hvdWxkIGJlIHBsYXllZCwgdmFsdWVzIGFib3ZlIHplcm8gYXJlIGRlY3JlbWVudGVkIGJ5IG9uZSBhbmQgdGhlbiB1c2VkIGFzIGFuIGluZGV4IGludG8gdGhlIGFycmF5IG9mXHJcbiAgICAvLyBzb3VuZCBsb29wcy5cclxuICAgIHNvdXJjZVNvdW5kSW5kZXhQcm9wZXJ0eS5saW5rKCBzb3VuZFNvdXJjZUluZGV4ID0+IHtcclxuICAgICAgc291bmRMb29wcy5mb3JFYWNoKCAoIHNvdW5kTG9vcCwgaW5kZXggKSA9PiB7XHJcbiAgICAgICAgaWYgKCBpbmRleCA9PT0gc291bmRTb3VyY2VJbmRleCAtIDEgKSB7XHJcbiAgICAgICAgICBzb3VuZExvb3AucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHNvdW5kTG9vcC5zdG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZXN0b3JlIGluaXRpYWwgc3RhdGVcclxuICAgKi9cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmFtcGxpdHVkZU1vZHVsYXRvci5teUVuYWJsZWRQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgIHRoaXMuYW1wbGl0dWRlTW9kdWxhdG9yLmZyZXF1ZW5jeVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFtcGxpdHVkZU1vZHVsYXRvci5kZXB0aFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFtcGxpdHVkZU1vZHVsYXRvci53YXZlZm9ybVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG50YW1iby5yZWdpc3RlciggJ0FtcGxpdHVkZU1vZHVsYXRvckRlbW8nLCBBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vICk7XHJcbmV4cG9ydCBkZWZhdWx0IEFtcGxpdHVkZU1vZHVsYXRv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