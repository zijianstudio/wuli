// Copyright 2018-2020, University of Colorado Boulder

/**
 * sound generator used to produce a sound when the temperature of the books is going down, i.e. the system is cooling
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import NoiseGenerator from '../../../../tambo/js/sound-generators/NoiseGenerator.js';
import friction from '../../friction.js';

// constants
const AMPLITUDE_AVERAGING_ARRAY_LENGTH = 10;
const COOLING_SOUND_DELAY = 0.25; // delay before playing the cooling sound after cooling is detected, in seconds
const COOLING_SOUND_DURATION = 2; // amount of time cooling sound plays, in seconds

class CoolingSoundGenerator extends NoiseGenerator {
  /**
   * {NumberProperty} moleculeOscillationAmplitudeProperty - position of the top book
   * {Object} [options] - options, see parent classes for more information
   * @constructor
   */
  constructor(moleculeOscillationAmplitudeProperty, options) {
    options = merge({
      noiseType: 'pink',
      centerFrequency: 6000,
      qFactor: 4,
      initialOutputLevel: 0,
      maxOutputLevel: 1
    }, options);
    super(options);

    // @private {number} - max output level, used in the step function that updates the sound output level
    this.maxOutputLevel = options.maxOutputLevel;

    // @private {number} - most recent and previous oscillation values, used to calculate change rate history
    this.mostRecentAmplitudeValue = 0;
    this.previousAmplitudeValue = 0;

    // @private {number[]} - array that tracks previous amplitude change rates, used to detect cooling
    this.amplitudeChangeRateHistory = [];

    // @private {number} - time which the molecules have been cooling, i.e. oscillation amplitude has been going down
    this.continuousCoolingTime = 0;

    // monitor the molecule oscillation amplitude and update local state
    moleculeOscillationAmplitudeProperty.lazyLink(amplitude => {
      this.mostRecentAmplitudeValue = amplitude;
    });
  }

  /**
   * step function that calculates the molecule oscillation change rate and updates the level of the cooling sound
   * @param {number} dt - amount of time step, in seconds
   * @public
   */
  step(dt) {
    // calculate the rate of change for the amplitude
    const amplitudeChangeRate = (this.mostRecentAmplitudeValue - this.previousAmplitudeValue) / dt;
    this.previousAmplitudeValue = this.mostRecentAmplitudeValue;

    // keep track of the history of the amplitude change rate so that it can be averaged
    this.amplitudeChangeRateHistory.push(amplitudeChangeRate);
    if (this.amplitudeChangeRateHistory.length > AMPLITUDE_AVERAGING_ARRAY_LENGTH) {
      this.amplitudeChangeRateHistory.splice(0, 1);
    }

    // calculate the average change rate
    const averageChangeRate = this.amplitudeChangeRateHistory.reduce((total, num) => total + num) / AMPLITUDE_AVERAGING_ARRAY_LENGTH;

    // keep track of whether the molecules are cooling off and, if so, for how long
    if (this.amplitudeChangeRateHistory.length === AMPLITUDE_AVERAGING_ARRAY_LENGTH && averageChangeRate < 0) {
      this.continuousCoolingTime += dt;
    } else {
      this.continuousCoolingTime = 0;
    }

    // update the state of the "cooling" sound
    let targetOutputLevel = 0;
    if (this.continuousCoolingTime > COOLING_SOUND_DELAY) {
      // Calculate a scaling factor for the output level of the cooling sound that is based on how long the
      // sound should be played and on how fast it is cooling.  This results in a level that only plays for a
      // fixed duration and gets quieter as the molecules approach what is essentially room temperature.
      const scalingFactor = (1 - Math.min((this.continuousCoolingTime - COOLING_SOUND_DELAY) / COOLING_SOUND_DURATION, 1)) * Math.min(Math.abs(averageChangeRate), 1);

      // calculate the target output level as a function of the max output and the scaling factor
      targetOutputLevel = this.maxOutputLevel * scalingFactor;
    }
    if (this.outputLevel !== targetOutputLevel) {
      if (targetOutputLevel > 0) {
        // start the noise generator if it isn't already running
        if (!this.isPlaying) {
          this.start();
        }

        // set the output level using an empirically determined time constant such that changes sound smooth
        this.setOutputLevel(targetOutputLevel, 0.07);
      } else {
        // stop the noise generator in a way that fades rapidly but not TOO abruptly
        this.setOutputLevel(targetOutputLevel, 0.2);
        this.stop(this.audioContext.currentTime + 0.01);
      }
    }
  }
}
friction.register('CoolingSoundGenerator', CoolingSoundGenerator);
export default CoolingSoundGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIk5vaXNlR2VuZXJhdG9yIiwiZnJpY3Rpb24iLCJBTVBMSVRVREVfQVZFUkFHSU5HX0FSUkFZX0xFTkdUSCIsIkNPT0xJTkdfU09VTkRfREVMQVkiLCJDT09MSU5HX1NPVU5EX0RVUkFUSU9OIiwiQ29vbGluZ1NvdW5kR2VuZXJhdG9yIiwiY29uc3RydWN0b3IiLCJtb2xlY3VsZU9zY2lsbGF0aW9uQW1wbGl0dWRlUHJvcGVydHkiLCJvcHRpb25zIiwibm9pc2VUeXBlIiwiY2VudGVyRnJlcXVlbmN5IiwicUZhY3RvciIsImluaXRpYWxPdXRwdXRMZXZlbCIsIm1heE91dHB1dExldmVsIiwibW9zdFJlY2VudEFtcGxpdHVkZVZhbHVlIiwicHJldmlvdXNBbXBsaXR1ZGVWYWx1ZSIsImFtcGxpdHVkZUNoYW5nZVJhdGVIaXN0b3J5IiwiY29udGludW91c0Nvb2xpbmdUaW1lIiwibGF6eUxpbmsiLCJhbXBsaXR1ZGUiLCJzdGVwIiwiZHQiLCJhbXBsaXR1ZGVDaGFuZ2VSYXRlIiwicHVzaCIsImxlbmd0aCIsInNwbGljZSIsImF2ZXJhZ2VDaGFuZ2VSYXRlIiwicmVkdWNlIiwidG90YWwiLCJudW0iLCJ0YXJnZXRPdXRwdXRMZXZlbCIsInNjYWxpbmdGYWN0b3IiLCJNYXRoIiwibWluIiwiYWJzIiwib3V0cHV0TGV2ZWwiLCJpc1BsYXlpbmciLCJzdGFydCIsInNldE91dHB1dExldmVsIiwic3RvcCIsImF1ZGlvQ29udGV4dCIsImN1cnJlbnRUaW1lIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb29saW5nU291bmRHZW5lcmF0b3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogc291bmQgZ2VuZXJhdG9yIHVzZWQgdG8gcHJvZHVjZSBhIHNvdW5kIHdoZW4gdGhlIHRlbXBlcmF0dXJlIG9mIHRoZSBib29rcyBpcyBnb2luZyBkb3duLCBpLmUuIHRoZSBzeXN0ZW0gaXMgY29vbGluZ1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBOb2lzZUdlbmVyYXRvciBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL05vaXNlR2VuZXJhdG9yLmpzJztcclxuaW1wb3J0IGZyaWN0aW9uIGZyb20gJy4uLy4uL2ZyaWN0aW9uLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBBTVBMSVRVREVfQVZFUkFHSU5HX0FSUkFZX0xFTkdUSCA9IDEwO1xyXG5jb25zdCBDT09MSU5HX1NPVU5EX0RFTEFZID0gMC4yNTsgLy8gZGVsYXkgYmVmb3JlIHBsYXlpbmcgdGhlIGNvb2xpbmcgc291bmQgYWZ0ZXIgY29vbGluZyBpcyBkZXRlY3RlZCwgaW4gc2Vjb25kc1xyXG5jb25zdCBDT09MSU5HX1NPVU5EX0RVUkFUSU9OID0gMjsgLy8gYW1vdW50IG9mIHRpbWUgY29vbGluZyBzb3VuZCBwbGF5cywgaW4gc2Vjb25kc1xyXG5cclxuY2xhc3MgQ29vbGluZ1NvdW5kR2VuZXJhdG9yIGV4dGVuZHMgTm9pc2VHZW5lcmF0b3Ige1xyXG5cclxuICAvKipcclxuICAgKiB7TnVtYmVyUHJvcGVydHl9IG1vbGVjdWxlT3NjaWxsYXRpb25BbXBsaXR1ZGVQcm9wZXJ0eSAtIHBvc2l0aW9uIG9mIHRoZSB0b3AgYm9va1xyXG4gICAqIHtPYmplY3R9IFtvcHRpb25zXSAtIG9wdGlvbnMsIHNlZSBwYXJlbnQgY2xhc3NlcyBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2xlY3VsZU9zY2lsbGF0aW9uQW1wbGl0dWRlUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgICAgbm9pc2VUeXBlOiAncGluaycsXHJcbiAgICAgICAgY2VudGVyRnJlcXVlbmN5OiA2MDAwLFxyXG4gICAgICAgIHFGYWN0b3I6IDQsXHJcbiAgICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLFxyXG4gICAgICAgIG1heE91dHB1dExldmVsOiAxXHJcbiAgICAgIH0sXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIG1heCBvdXRwdXQgbGV2ZWwsIHVzZWQgaW4gdGhlIHN0ZXAgZnVuY3Rpb24gdGhhdCB1cGRhdGVzIHRoZSBzb3VuZCBvdXRwdXQgbGV2ZWxcclxuICAgIHRoaXMubWF4T3V0cHV0TGV2ZWwgPSBvcHRpb25zLm1heE91dHB1dExldmVsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gbW9zdCByZWNlbnQgYW5kIHByZXZpb3VzIG9zY2lsbGF0aW9uIHZhbHVlcywgdXNlZCB0byBjYWxjdWxhdGUgY2hhbmdlIHJhdGUgaGlzdG9yeVxyXG4gICAgdGhpcy5tb3N0UmVjZW50QW1wbGl0dWRlVmFsdWUgPSAwO1xyXG4gICAgdGhpcy5wcmV2aW91c0FtcGxpdHVkZVZhbHVlID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyW119IC0gYXJyYXkgdGhhdCB0cmFja3MgcHJldmlvdXMgYW1wbGl0dWRlIGNoYW5nZSByYXRlcywgdXNlZCB0byBkZXRlY3QgY29vbGluZ1xyXG4gICAgdGhpcy5hbXBsaXR1ZGVDaGFuZ2VSYXRlSGlzdG9yeSA9IFtdO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gdGltZSB3aGljaCB0aGUgbW9sZWN1bGVzIGhhdmUgYmVlbiBjb29saW5nLCBpLmUuIG9zY2lsbGF0aW9uIGFtcGxpdHVkZSBoYXMgYmVlbiBnb2luZyBkb3duXHJcbiAgICB0aGlzLmNvbnRpbnVvdXNDb29saW5nVGltZSA9IDA7XHJcblxyXG4gICAgLy8gbW9uaXRvciB0aGUgbW9sZWN1bGUgb3NjaWxsYXRpb24gYW1wbGl0dWRlIGFuZCB1cGRhdGUgbG9jYWwgc3RhdGVcclxuICAgIG1vbGVjdWxlT3NjaWxsYXRpb25BbXBsaXR1ZGVQcm9wZXJ0eS5sYXp5TGluayggYW1wbGl0dWRlID0+IHtcclxuICAgICAgdGhpcy5tb3N0UmVjZW50QW1wbGl0dWRlVmFsdWUgPSBhbXBsaXR1ZGU7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzdGVwIGZ1bmN0aW9uIHRoYXQgY2FsY3VsYXRlcyB0aGUgbW9sZWN1bGUgb3NjaWxsYXRpb24gY2hhbmdlIHJhdGUgYW5kIHVwZGF0ZXMgdGhlIGxldmVsIG9mIHRoZSBjb29saW5nIHNvdW5kXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gYW1vdW50IG9mIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuXHJcbiAgICAvLyBjYWxjdWxhdGUgdGhlIHJhdGUgb2YgY2hhbmdlIGZvciB0aGUgYW1wbGl0dWRlXHJcbiAgICBjb25zdCBhbXBsaXR1ZGVDaGFuZ2VSYXRlID0gKCB0aGlzLm1vc3RSZWNlbnRBbXBsaXR1ZGVWYWx1ZSAtIHRoaXMucHJldmlvdXNBbXBsaXR1ZGVWYWx1ZSApIC8gZHQ7XHJcbiAgICB0aGlzLnByZXZpb3VzQW1wbGl0dWRlVmFsdWUgPSB0aGlzLm1vc3RSZWNlbnRBbXBsaXR1ZGVWYWx1ZTtcclxuXHJcbiAgICAvLyBrZWVwIHRyYWNrIG9mIHRoZSBoaXN0b3J5IG9mIHRoZSBhbXBsaXR1ZGUgY2hhbmdlIHJhdGUgc28gdGhhdCBpdCBjYW4gYmUgYXZlcmFnZWRcclxuICAgIHRoaXMuYW1wbGl0dWRlQ2hhbmdlUmF0ZUhpc3RvcnkucHVzaCggYW1wbGl0dWRlQ2hhbmdlUmF0ZSApO1xyXG4gICAgaWYgKCB0aGlzLmFtcGxpdHVkZUNoYW5nZVJhdGVIaXN0b3J5Lmxlbmd0aCA+IEFNUExJVFVERV9BVkVSQUdJTkdfQVJSQVlfTEVOR1RIICkge1xyXG4gICAgICB0aGlzLmFtcGxpdHVkZUNoYW5nZVJhdGVIaXN0b3J5LnNwbGljZSggMCwgMSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgYXZlcmFnZSBjaGFuZ2UgcmF0ZVxyXG4gICAgY29uc3QgYXZlcmFnZUNoYW5nZVJhdGUgPVxyXG4gICAgICB0aGlzLmFtcGxpdHVkZUNoYW5nZVJhdGVIaXN0b3J5LnJlZHVjZSggKCB0b3RhbCwgbnVtICkgPT4gdG90YWwgKyBudW0gKSAvIEFNUExJVFVERV9BVkVSQUdJTkdfQVJSQVlfTEVOR1RIO1xyXG5cclxuICAgIC8vIGtlZXAgdHJhY2sgb2Ygd2hldGhlciB0aGUgbW9sZWN1bGVzIGFyZSBjb29saW5nIG9mZiBhbmQsIGlmIHNvLCBmb3IgaG93IGxvbmdcclxuICAgIGlmICggdGhpcy5hbXBsaXR1ZGVDaGFuZ2VSYXRlSGlzdG9yeS5sZW5ndGggPT09IEFNUExJVFVERV9BVkVSQUdJTkdfQVJSQVlfTEVOR1RIICYmIGF2ZXJhZ2VDaGFuZ2VSYXRlIDwgMCApIHtcclxuICAgICAgdGhpcy5jb250aW51b3VzQ29vbGluZ1RpbWUgKz0gZHQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5jb250aW51b3VzQ29vbGluZ1RpbWUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgc3RhdGUgb2YgdGhlIFwiY29vbGluZ1wiIHNvdW5kXHJcbiAgICBsZXQgdGFyZ2V0T3V0cHV0TGV2ZWwgPSAwO1xyXG4gICAgaWYgKCB0aGlzLmNvbnRpbnVvdXNDb29saW5nVGltZSA+IENPT0xJTkdfU09VTkRfREVMQVkgKSB7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgYSBzY2FsaW5nIGZhY3RvciBmb3IgdGhlIG91dHB1dCBsZXZlbCBvZiB0aGUgY29vbGluZyBzb3VuZCB0aGF0IGlzIGJhc2VkIG9uIGhvdyBsb25nIHRoZVxyXG4gICAgICAvLyBzb3VuZCBzaG91bGQgYmUgcGxheWVkIGFuZCBvbiBob3cgZmFzdCBpdCBpcyBjb29saW5nLiAgVGhpcyByZXN1bHRzIGluIGEgbGV2ZWwgdGhhdCBvbmx5IHBsYXlzIGZvciBhXHJcbiAgICAgIC8vIGZpeGVkIGR1cmF0aW9uIGFuZCBnZXRzIHF1aWV0ZXIgYXMgdGhlIG1vbGVjdWxlcyBhcHByb2FjaCB3aGF0IGlzIGVzc2VudGlhbGx5IHJvb20gdGVtcGVyYXR1cmUuXHJcbiAgICAgIGNvbnN0IHNjYWxpbmdGYWN0b3IgPVxyXG4gICAgICAgICggMSAtIE1hdGgubWluKCAoIHRoaXMuY29udGludW91c0Nvb2xpbmdUaW1lIC0gQ09PTElOR19TT1VORF9ERUxBWSApIC8gQ09PTElOR19TT1VORF9EVVJBVElPTiwgMSApICkgKlxyXG4gICAgICAgIE1hdGgubWluKCBNYXRoLmFicyggYXZlcmFnZUNoYW5nZVJhdGUgKSwgMSApO1xyXG5cclxuICAgICAgLy8gY2FsY3VsYXRlIHRoZSB0YXJnZXQgb3V0cHV0IGxldmVsIGFzIGEgZnVuY3Rpb24gb2YgdGhlIG1heCBvdXRwdXQgYW5kIHRoZSBzY2FsaW5nIGZhY3RvclxyXG4gICAgICB0YXJnZXRPdXRwdXRMZXZlbCA9IHRoaXMubWF4T3V0cHV0TGV2ZWwgKiBzY2FsaW5nRmFjdG9yO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLm91dHB1dExldmVsICE9PSB0YXJnZXRPdXRwdXRMZXZlbCApIHtcclxuICAgICAgaWYgKCB0YXJnZXRPdXRwdXRMZXZlbCA+IDAgKSB7XHJcblxyXG4gICAgICAgIC8vIHN0YXJ0IHRoZSBub2lzZSBnZW5lcmF0b3IgaWYgaXQgaXNuJ3QgYWxyZWFkeSBydW5uaW5nXHJcbiAgICAgICAgaWYgKCAhdGhpcy5pc1BsYXlpbmcgKSB7XHJcbiAgICAgICAgICB0aGlzLnN0YXJ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzZXQgdGhlIG91dHB1dCBsZXZlbCB1c2luZyBhbiBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRpbWUgY29uc3RhbnQgc3VjaCB0aGF0IGNoYW5nZXMgc291bmQgc21vb3RoXHJcbiAgICAgICAgdGhpcy5zZXRPdXRwdXRMZXZlbCggdGFyZ2V0T3V0cHV0TGV2ZWwsIDAuMDcgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gc3RvcCB0aGUgbm9pc2UgZ2VuZXJhdG9yIGluIGEgd2F5IHRoYXQgZmFkZXMgcmFwaWRseSBidXQgbm90IFRPTyBhYnJ1cHRseVxyXG4gICAgICAgIHRoaXMuc2V0T3V0cHV0TGV2ZWwoIHRhcmdldE91dHB1dExldmVsLCAwLjIgKTtcclxuICAgICAgICB0aGlzLnN0b3AoIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4wMSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufVxyXG5cclxuZnJpY3Rpb24ucmVnaXN0ZXIoICdDb29saW5nU291bmRHZW5lcmF0b3InLCBDb29saW5nU291bmRHZW5lcmF0b3IgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvb2xpbmdTb3VuZEdlbmVyYXRvcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxjQUFjLE1BQU0seURBQXlEO0FBQ3BGLE9BQU9DLFFBQVEsTUFBTSxtQkFBbUI7O0FBRXhDO0FBQ0EsTUFBTUMsZ0NBQWdDLEdBQUcsRUFBRTtBQUMzQyxNQUFNQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNsQyxNQUFNQyxzQkFBc0IsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFbEMsTUFBTUMscUJBQXFCLFNBQVNMLGNBQWMsQ0FBQztFQUVqRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VNLFdBQVdBLENBQUVDLG9DQUFvQyxFQUFFQyxPQUFPLEVBQUc7SUFFM0RBLE9BQU8sR0FBR1QsS0FB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