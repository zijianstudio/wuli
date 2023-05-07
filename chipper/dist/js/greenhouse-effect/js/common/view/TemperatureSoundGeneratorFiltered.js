// Copyright 2021-2022, University of Colorado Boulder

/**
 * TemperatureSoundGeneratorFiltered is used to create a sound indicating the temperature, and uses a sound loop and an
 * adjustable filter to do it.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Range from '../../../../dot/js/Range.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../tambo/js/sound-generators/SoundGenerator.js';
import greenhouseEffectTemperatureBaseAmbience4Octaves_mp3 from '../../../sounds/greenhouseEffectTemperatureBaseAmbience4Octaves_mp3.js';
import greenhouseEffect from '../../greenhouseEffect.js';

// constants
const FILTER_FREQUENCY_RANGE = new Range(120, 2500);
const TIME_CONSTANT = 0.015;
const FILTER_Q = 10; // empirically determined

class TemperatureSoundGeneratorFiltered extends SoundGenerator {
  constructor(temperatureProperty, isSunShiningProperty, expectedTemperatureRange, options) {
    super(options);

    // loop which will be filtered to produce the sounds
    const baseSoundLoop = new SoundClip(greenhouseEffectTemperatureBaseAmbience4Octaves_mp3, {
      loop: true
    });
    this.temperatureToFilterFrequency = new LinearFunction(expectedTemperatureRange.min, expectedTemperatureRange.max, FILTER_FREQUENCY_RANGE.min, FILTER_FREQUENCY_RANGE.max);

    // low pass filter
    const lowPassFilter = this.audioContext.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.Q.value = FILTER_Q;
    lowPassFilter.connect(this.masterGainNode);

    // Send the loop into both filters.
    baseSoundLoop.connect(lowPassFilter);

    // This loop should be producing sound whenever the sun is shining.
    isSunShiningProperty.link(isSunShining => {
      if (isSunShining) {
        baseSoundLoop.play();
      } else {
        baseSoundLoop.stop();
      }
    });

    // Adjust the filters as the temperature changes.
    temperatureProperty.link(temperature => {
      const frequency = this.temperatureToFilterFrequency.evaluate(temperature);
      const now = this.audioContext.currentTime;
      lowPassFilter.frequency.setTargetAtTime(frequency, now, TIME_CONSTANT);
    });
  }
}
greenhouseEffect.register('TemperatureSoundGeneratorFiltered', TemperatureSoundGeneratorFiltered);
export default TemperatureSoundGeneratorFiltered;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lYXJGdW5jdGlvbiIsIlJhbmdlIiwiU291bmRDbGlwIiwiU291bmRHZW5lcmF0b3IiLCJncmVlbmhvdXNlRWZmZWN0VGVtcGVyYXR1cmVCYXNlQW1iaWVuY2U0T2N0YXZlc19tcDMiLCJncmVlbmhvdXNlRWZmZWN0IiwiRklMVEVSX0ZSRVFVRU5DWV9SQU5HRSIsIlRJTUVfQ09OU1RBTlQiLCJGSUxURVJfUSIsIlRlbXBlcmF0dXJlU291bmRHZW5lcmF0b3JGaWx0ZXJlZCIsImNvbnN0cnVjdG9yIiwidGVtcGVyYXR1cmVQcm9wZXJ0eSIsImlzU3VuU2hpbmluZ1Byb3BlcnR5IiwiZXhwZWN0ZWRUZW1wZXJhdHVyZVJhbmdlIiwib3B0aW9ucyIsImJhc2VTb3VuZExvb3AiLCJsb29wIiwidGVtcGVyYXR1cmVUb0ZpbHRlckZyZXF1ZW5jeSIsIm1pbiIsIm1heCIsImxvd1Bhc3NGaWx0ZXIiLCJhdWRpb0NvbnRleHQiLCJjcmVhdGVCaXF1YWRGaWx0ZXIiLCJ0eXBlIiwiUSIsInZhbHVlIiwiY29ubmVjdCIsIm1hc3RlckdhaW5Ob2RlIiwibGluayIsImlzU3VuU2hpbmluZyIsInBsYXkiLCJzdG9wIiwidGVtcGVyYXR1cmUiLCJmcmVxdWVuY3kiLCJldmFsdWF0ZSIsIm5vdyIsImN1cnJlbnRUaW1lIiwic2V0VGFyZ2V0QXRUaW1lIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUZW1wZXJhdHVyZVNvdW5kR2VuZXJhdG9yRmlsdGVyZWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGVtcGVyYXR1cmVTb3VuZEdlbmVyYXRvckZpbHRlcmVkIGlzIHVzZWQgdG8gY3JlYXRlIGEgc291bmQgaW5kaWNhdGluZyB0aGUgdGVtcGVyYXR1cmUsIGFuZCB1c2VzIGEgc291bmQgbG9vcCBhbmQgYW5cclxuICogYWRqdXN0YWJsZSBmaWx0ZXIgdG8gZG8gaXQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTGluZWFyRnVuY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0xpbmVhckZ1bmN0aW9uLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBTb3VuZENsaXAgZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXAuanMnO1xyXG5pbXBvcnQgU291bmRHZW5lcmF0b3IsIHsgU291bmRHZW5lcmF0b3JPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9Tb3VuZEdlbmVyYXRvci5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0VGVtcGVyYXR1cmVCYXNlQW1iaWVuY2U0T2N0YXZlc19tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL2dyZWVuaG91c2VFZmZlY3RUZW1wZXJhdHVyZUJhc2VBbWJpZW5jZTRPY3RhdmVzX21wMy5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEZJTFRFUl9GUkVRVUVOQ1lfUkFOR0UgPSBuZXcgUmFuZ2UoIDEyMCwgMjUwMCApO1xyXG5jb25zdCBUSU1FX0NPTlNUQU5UID0gMC4wMTU7XHJcbmNvbnN0IEZJTFRFUl9RID0gMTA7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuXHJcbmNsYXNzIFRlbXBlcmF0dXJlU291bmRHZW5lcmF0b3JGaWx0ZXJlZCBleHRlbmRzIFNvdW5kR2VuZXJhdG9yIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IHRlbXBlcmF0dXJlVG9GaWx0ZXJGcmVxdWVuY3k6IExpbmVhckZ1bmN0aW9uO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRlbXBlcmF0dXJlUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBpc1N1blNoaW5pbmdQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZFRlbXBlcmF0dXJlUmFuZ2U6IFJhbmdlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogU291bmRHZW5lcmF0b3JPcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gbG9vcCB3aGljaCB3aWxsIGJlIGZpbHRlcmVkIHRvIHByb2R1Y2UgdGhlIHNvdW5kc1xyXG4gICAgY29uc3QgYmFzZVNvdW5kTG9vcCA9IG5ldyBTb3VuZENsaXAoIGdyZWVuaG91c2VFZmZlY3RUZW1wZXJhdHVyZUJhc2VBbWJpZW5jZTRPY3RhdmVzX21wMywge1xyXG4gICAgICBsb29wOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50ZW1wZXJhdHVyZVRvRmlsdGVyRnJlcXVlbmN5ID0gbmV3IExpbmVhckZ1bmN0aW9uKFxyXG4gICAgICBleHBlY3RlZFRlbXBlcmF0dXJlUmFuZ2UubWluLFxyXG4gICAgICBleHBlY3RlZFRlbXBlcmF0dXJlUmFuZ2UubWF4LFxyXG4gICAgICBGSUxURVJfRlJFUVVFTkNZX1JBTkdFLm1pbixcclxuICAgICAgRklMVEVSX0ZSRVFVRU5DWV9SQU5HRS5tYXhcclxuICAgICk7XHJcblxyXG4gICAgLy8gbG93IHBhc3MgZmlsdGVyXHJcbiAgICBjb25zdCBsb3dQYXNzRmlsdGVyID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlQmlxdWFkRmlsdGVyKCk7XHJcbiAgICBsb3dQYXNzRmlsdGVyLnR5cGUgPSAnbG93cGFzcyc7XHJcbiAgICBsb3dQYXNzRmlsdGVyLlEudmFsdWUgPSBGSUxURVJfUTtcclxuICAgIGxvd1Bhc3NGaWx0ZXIuY29ubmVjdCggdGhpcy5tYXN0ZXJHYWluTm9kZSApO1xyXG5cclxuICAgIC8vIFNlbmQgdGhlIGxvb3AgaW50byBib3RoIGZpbHRlcnMuXHJcbiAgICBiYXNlU291bmRMb29wLmNvbm5lY3QoIGxvd1Bhc3NGaWx0ZXIgKTtcclxuXHJcbiAgICAvLyBUaGlzIGxvb3Agc2hvdWxkIGJlIHByb2R1Y2luZyBzb3VuZCB3aGVuZXZlciB0aGUgc3VuIGlzIHNoaW5pbmcuXHJcbiAgICBpc1N1blNoaW5pbmdQcm9wZXJ0eS5saW5rKCBpc1N1blNoaW5pbmcgPT4ge1xyXG4gICAgICBpZiAoIGlzU3VuU2hpbmluZyApIHtcclxuICAgICAgICBiYXNlU291bmRMb29wLnBsYXkoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBiYXNlU291bmRMb29wLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkanVzdCB0aGUgZmlsdGVycyBhcyB0aGUgdGVtcGVyYXR1cmUgY2hhbmdlcy5cclxuICAgIHRlbXBlcmF0dXJlUHJvcGVydHkubGluayggdGVtcGVyYXR1cmUgPT4ge1xyXG4gICAgICBjb25zdCBmcmVxdWVuY3kgPSB0aGlzLnRlbXBlcmF0dXJlVG9GaWx0ZXJGcmVxdWVuY3kuZXZhbHVhdGUoIHRlbXBlcmF0dXJlICk7XHJcbiAgICAgIGNvbnN0IG5vdyA9IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xyXG4gICAgICBsb3dQYXNzRmlsdGVyLmZyZXF1ZW5jeS5zZXRUYXJnZXRBdFRpbWUoIGZyZXF1ZW5jeSwgbm93LCBUSU1FX0NPTlNUQU5UICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmVlbmhvdXNlRWZmZWN0LnJlZ2lzdGVyKCAnVGVtcGVyYXR1cmVTb3VuZEdlbmVyYXRvckZpbHRlcmVkJywgVGVtcGVyYXR1cmVTb3VuZEdlbmVyYXRvckZpbHRlcmVkICk7XHJcbmV4cG9ydCBkZWZhdWx0IFRlbXBlcmF0dXJlU291bmRHZW5lcmF0b3JGaWx0ZXJlZDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxjQUFjLE1BQU0sc0NBQXNDO0FBQ2pFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsU0FBUyxNQUFNLG9EQUFvRDtBQUMxRSxPQUFPQyxjQUFjLE1BQWlDLHlEQUF5RDtBQUMvRyxPQUFPQyxtREFBbUQsTUFBTSx3RUFBd0U7QUFDeEksT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCOztBQUV4RDtBQUNBLE1BQU1DLHNCQUFzQixHQUFHLElBQUlMLEtBQUssQ0FBRSxHQUFHLEVBQUUsSUFBSyxDQUFDO0FBQ3JELE1BQU1NLGFBQWEsR0FBRyxLQUFLO0FBQzNCLE1BQU1DLFFBQVEsR0FBRyxFQUFFLENBQUMsQ0FBQzs7QUFFckIsTUFBTUMsaUNBQWlDLFNBQVNOLGNBQWMsQ0FBQztFQUd0RE8sV0FBV0EsQ0FBRUMsbUJBQXFDLEVBQ3JDQyxvQkFBdUMsRUFDdkNDLHdCQUErQixFQUMvQkMsT0FBOEIsRUFBRztJQUVuRCxLQUFLLENBQUVBLE9BQVEsQ0FBQzs7SUFFaEI7SUFDQSxNQUFNQyxhQUFhLEdBQUcsSUFBSWIsU0FBUyxDQUFFRSxtREFBbUQsRUFBRTtNQUN4RlksSUFBSSxFQUFFO0lBQ1IsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDQyw0QkFBNEIsR0FBRyxJQUFJakIsY0FBYyxDQUNwRGEsd0JBQXdCLENBQUNLLEdBQUcsRUFDNUJMLHdCQUF3QixDQUFDTSxHQUFHLEVBQzVCYixzQkFBc0IsQ0FBQ1ksR0FBRyxFQUMxQlosc0JBQXNCLENBQUNhLEdBQ3pCLENBQUM7O0lBRUQ7SUFDQSxNQUFNQyxhQUFhLEdBQUcsSUFBSSxDQUFDQyxZQUFZLENBQUNDLGtCQUFrQixDQUFDLENBQUM7SUFDNURGLGFBQWEsQ0FBQ0csSUFBSSxHQUFHLFNBQVM7SUFDOUJILGFBQWEsQ0FBQ0ksQ0FBQyxDQUFDQyxLQUFLLEdBQUdqQixRQUFRO0lBQ2hDWSxhQUFhLENBQUNNLE9BQU8sQ0FBRSxJQUFJLENBQUNDLGNBQWUsQ0FBQzs7SUFFNUM7SUFDQVosYUFBYSxDQUFDVyxPQUFPLENBQUVOLGFBQWMsQ0FBQzs7SUFFdEM7SUFDQVIsb0JBQW9CLENBQUNnQixJQUFJLENBQUVDLFlBQVksSUFBSTtNQUN6QyxJQUFLQSxZQUFZLEVBQUc7UUFDbEJkLGFBQWEsQ0FBQ2UsSUFBSSxDQUFDLENBQUM7TUFDdEIsQ0FBQyxNQUNJO1FBQ0hmLGFBQWEsQ0FBQ2dCLElBQUksQ0FBQyxDQUFDO01BQ3RCO0lBQ0YsQ0FBRSxDQUFDOztJQUVIO0lBQ0FwQixtQkFBbUIsQ0FBQ2lCLElBQUksQ0FBRUksV0FBVyxJQUFJO01BQ3ZDLE1BQU1DLFNBQVMsR0FBRyxJQUFJLENBQUNoQiw0QkFBNEIsQ0FBQ2lCLFFBQVEsQ0FBRUYsV0FBWSxDQUFDO01BQzNFLE1BQU1HLEdBQUcsR0FBRyxJQUFJLENBQUNkLFlBQVksQ0FBQ2UsV0FBVztNQUN6Q2hCLGFBQWEsQ0FBQ2EsU0FBUyxDQUFDSSxlQUFlLENBQUVKLFNBQVMsRUFBRUUsR0FBRyxFQUFFNUIsYUFBYyxDQUFDO0lBQzFFLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQUYsZ0JBQWdCLENBQUNpQyxRQUFRLENBQUUsbUNBQW1DLEVBQUU3QixpQ0FBa0MsQ0FBQztBQUNuRyxlQUFlQSxpQ0FBaUMifQ==