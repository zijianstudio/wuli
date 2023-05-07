// Copyright 2017-2020, University of Colorado Boulder

/**
 * Data structure that keeps track of running average over a given window.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import dot from './dot.js';
class RunningAverage {
  /**
   * @param {number} windowSize - number of points to average
   */
  constructor(windowSize) {
    assert && assert(windowSize > 0, 'window size must be positive');

    // @private {number}
    this.windowSize = windowSize;

    // @private {number[]} - Used circularly.
    this.samples = new Array(windowSize);

    // @private {number} - We add/subtract samples in a circular array pattern using this index.
    this.sampleIndex = 0;

    // @private {number} - Total sum of the samples within the window (not yet divided by number of samples)
    this.total = 0;

    // @private {number} - number of samples received so far
    this.numSamples = 0;
    this.clear();
  }

  /**
   * Clear the running average.
   * @public
   */
  clear() {
    this.total = 0;
    this.numSamples = 0;

    // Need to clear all of the samples
    for (let i = 0; i < this.windowSize; i++) {
      this.samples[i] = 0;
    }
  }

  /**
   * Gets the current value of the running average.
   * @public
   *
   * @returns {number}
   */
  getRunningAverage() {
    return this.total / this.numSamples;
  }

  /**
   * Returns whether the number of samples is at least as large as the window size (the buffer is full).
   * @public
   *
   * @returns {boolean}
   */
  isSaturated() {
    return this.numSamples >= this.windowSize;
  }

  /**
   * Add a data point to the average and return the new running average.
   * @public
   *
   * @param {number} sample
   * @returns {number}
   */
  updateRunningAverage(sample) {
    assert && assert(typeof sample === 'number' && isFinite(sample));

    // Limit at the window size
    this.numSamples = Math.min(this.windowSize, this.numSamples + 1);

    // Remove the old sample (will be 0 if there was no sample yet, due to clear())
    this.total -= this.samples[this.sampleIndex];
    assert && assert(isFinite(this.total));

    // Add in the new sample
    this.total += sample;
    assert && assert(isFinite(this.total));

    // Overwrite in the array and move to the next index
    this.samples[this.sampleIndex] = sample;
    this.sampleIndex = (this.sampleIndex + 1) % this.windowSize;
    return this.getRunningAverage();
  }
}
dot.register('RunningAverage', RunningAverage);
export default RunningAverage;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3QiLCJSdW5uaW5nQXZlcmFnZSIsImNvbnN0cnVjdG9yIiwid2luZG93U2l6ZSIsImFzc2VydCIsInNhbXBsZXMiLCJBcnJheSIsInNhbXBsZUluZGV4IiwidG90YWwiLCJudW1TYW1wbGVzIiwiY2xlYXIiLCJpIiwiZ2V0UnVubmluZ0F2ZXJhZ2UiLCJpc1NhdHVyYXRlZCIsInVwZGF0ZVJ1bm5pbmdBdmVyYWdlIiwic2FtcGxlIiwiaXNGaW5pdGUiLCJNYXRoIiwibWluIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSdW5uaW5nQXZlcmFnZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEYXRhIHN0cnVjdHVyZSB0aGF0IGtlZXBzIHRyYWNrIG9mIHJ1bm5pbmcgYXZlcmFnZSBvdmVyIGEgZ2l2ZW4gd2luZG93LlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xyXG5cclxuY2xhc3MgUnVubmluZ0F2ZXJhZ2Uge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aW5kb3dTaXplIC0gbnVtYmVyIG9mIHBvaW50cyB0byBhdmVyYWdlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHdpbmRvd1NpemUgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggd2luZG93U2l6ZSA+IDAsICd3aW5kb3cgc2l6ZSBtdXN0IGJlIHBvc2l0aXZlJyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9XHJcbiAgICB0aGlzLndpbmRvd1NpemUgPSB3aW5kb3dTaXplO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJbXX0gLSBVc2VkIGNpcmN1bGFybHkuXHJcbiAgICB0aGlzLnNhbXBsZXMgPSBuZXcgQXJyYXkoIHdpbmRvd1NpemUgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIFdlIGFkZC9zdWJ0cmFjdCBzYW1wbGVzIGluIGEgY2lyY3VsYXIgYXJyYXkgcGF0dGVybiB1c2luZyB0aGlzIGluZGV4LlxyXG4gICAgdGhpcy5zYW1wbGVJbmRleCA9IDA7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBUb3RhbCBzdW0gb2YgdGhlIHNhbXBsZXMgd2l0aGluIHRoZSB3aW5kb3cgKG5vdCB5ZXQgZGl2aWRlZCBieSBudW1iZXIgb2Ygc2FtcGxlcylcclxuICAgIHRoaXMudG90YWwgPSAwO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gbnVtYmVyIG9mIHNhbXBsZXMgcmVjZWl2ZWQgc28gZmFyXHJcbiAgICB0aGlzLm51bVNhbXBsZXMgPSAwO1xyXG5cclxuICAgIHRoaXMuY2xlYXIoKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBDbGVhciB0aGUgcnVubmluZyBhdmVyYWdlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjbGVhcigpIHtcclxuICAgIHRoaXMudG90YWwgPSAwO1xyXG4gICAgdGhpcy5udW1TYW1wbGVzID0gMDtcclxuXHJcbiAgICAvLyBOZWVkIHRvIGNsZWFyIGFsbCBvZiB0aGUgc2FtcGxlc1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy53aW5kb3dTaXplOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuc2FtcGxlc1sgaSBdID0gMDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIHJ1bm5pbmcgYXZlcmFnZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldFJ1bm5pbmdBdmVyYWdlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudG90YWwgLyB0aGlzLm51bVNhbXBsZXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIG51bWJlciBvZiBzYW1wbGVzIGlzIGF0IGxlYXN0IGFzIGxhcmdlIGFzIHRoZSB3aW5kb3cgc2l6ZSAodGhlIGJ1ZmZlciBpcyBmdWxsKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc1NhdHVyYXRlZCgpIHtcclxuICAgIHJldHVybiB0aGlzLm51bVNhbXBsZXMgPj0gdGhpcy53aW5kb3dTaXplO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGEgZGF0YSBwb2ludCB0byB0aGUgYXZlcmFnZSBhbmQgcmV0dXJuIHRoZSBuZXcgcnVubmluZyBhdmVyYWdlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzYW1wbGVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIHVwZGF0ZVJ1bm5pbmdBdmVyYWdlKCBzYW1wbGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygc2FtcGxlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggc2FtcGxlICkgKTtcclxuXHJcbiAgICAvLyBMaW1pdCBhdCB0aGUgd2luZG93IHNpemVcclxuICAgIHRoaXMubnVtU2FtcGxlcyA9IE1hdGgubWluKCB0aGlzLndpbmRvd1NpemUsIHRoaXMubnVtU2FtcGxlcyArIDEgKTtcclxuXHJcbiAgICAvLyBSZW1vdmUgdGhlIG9sZCBzYW1wbGUgKHdpbGwgYmUgMCBpZiB0aGVyZSB3YXMgbm8gc2FtcGxlIHlldCwgZHVlIHRvIGNsZWFyKCkpXHJcbiAgICB0aGlzLnRvdGFsIC09IHRoaXMuc2FtcGxlc1sgdGhpcy5zYW1wbGVJbmRleCBdO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMudG90YWwgKSApO1xyXG5cclxuICAgIC8vIEFkZCBpbiB0aGUgbmV3IHNhbXBsZVxyXG4gICAgdGhpcy50b3RhbCArPSBzYW1wbGU7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy50b3RhbCApICk7XHJcblxyXG4gICAgLy8gT3ZlcndyaXRlIGluIHRoZSBhcnJheSBhbmQgbW92ZSB0byB0aGUgbmV4dCBpbmRleFxyXG4gICAgdGhpcy5zYW1wbGVzWyB0aGlzLnNhbXBsZUluZGV4IF0gPSBzYW1wbGU7XHJcbiAgICB0aGlzLnNhbXBsZUluZGV4ID0gKCB0aGlzLnNhbXBsZUluZGV4ICsgMSApICUgdGhpcy53aW5kb3dTaXplO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmdldFJ1bm5pbmdBdmVyYWdlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5kb3QucmVnaXN0ZXIoICdSdW5uaW5nQXZlcmFnZScsIFJ1bm5pbmdBdmVyYWdlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSdW5uaW5nQXZlcmFnZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQU0sVUFBVTtBQUUxQixNQUFNQyxjQUFjLENBQUM7RUFDbkI7QUFDRjtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLFVBQVUsRUFBRztJQUV4QkMsTUFBTSxJQUFJQSxNQUFNLENBQUVELFVBQVUsR0FBRyxDQUFDLEVBQUUsOEJBQStCLENBQUM7O0lBRWxFO0lBQ0EsSUFBSSxDQUFDQSxVQUFVLEdBQUdBLFVBQVU7O0lBRTVCO0lBQ0EsSUFBSSxDQUFDRSxPQUFPLEdBQUcsSUFBSUMsS0FBSyxDQUFFSCxVQUFXLENBQUM7O0lBRXRDO0lBQ0EsSUFBSSxDQUFDSSxXQUFXLEdBQUcsQ0FBQzs7SUFFcEI7SUFDQSxJQUFJLENBQUNDLEtBQUssR0FBRyxDQUFDOztJQUVkO0lBQ0EsSUFBSSxDQUFDQyxVQUFVLEdBQUcsQ0FBQztJQUVuQixJQUFJLENBQUNDLEtBQUssQ0FBQyxDQUFDO0VBQ2Q7O0VBR0E7QUFDRjtBQUNBO0FBQ0E7RUFDRUEsS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSSxDQUFDRixLQUFLLEdBQUcsQ0FBQztJQUNkLElBQUksQ0FBQ0MsVUFBVSxHQUFHLENBQUM7O0lBRW5CO0lBQ0EsS0FBTSxJQUFJRSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDUixVQUFVLEVBQUVRLENBQUMsRUFBRSxFQUFHO01BQzFDLElBQUksQ0FBQ04sT0FBTyxDQUFFTSxDQUFDLENBQUUsR0FBRyxDQUFDO0lBQ3ZCO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLGlCQUFpQkEsQ0FBQSxFQUFHO0lBQ2xCLE9BQU8sSUFBSSxDQUFDSixLQUFLLEdBQUcsSUFBSSxDQUFDQyxVQUFVO0VBQ3JDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxXQUFXQSxDQUFBLEVBQUc7SUFDWixPQUFPLElBQUksQ0FBQ0osVUFBVSxJQUFJLElBQUksQ0FBQ04sVUFBVTtFQUMzQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFVyxvQkFBb0JBLENBQUVDLE1BQU0sRUFBRztJQUM3QlgsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT1csTUFBTSxLQUFLLFFBQVEsSUFBSUMsUUFBUSxDQUFFRCxNQUFPLENBQUUsQ0FBQzs7SUFFcEU7SUFDQSxJQUFJLENBQUNOLFVBQVUsR0FBR1EsSUFBSSxDQUFDQyxHQUFHLENBQUUsSUFBSSxDQUFDZixVQUFVLEVBQUUsSUFBSSxDQUFDTSxVQUFVLEdBQUcsQ0FBRSxDQUFDOztJQUVsRTtJQUNBLElBQUksQ0FBQ0QsS0FBSyxJQUFJLElBQUksQ0FBQ0gsT0FBTyxDQUFFLElBQUksQ0FBQ0UsV0FBVyxDQUFFO0lBQzlDSCxNQUFNLElBQUlBLE1BQU0sQ0FBRVksUUFBUSxDQUFFLElBQUksQ0FBQ1IsS0FBTSxDQUFFLENBQUM7O0lBRTFDO0lBQ0EsSUFBSSxDQUFDQSxLQUFLLElBQUlPLE1BQU07SUFDcEJYLE1BQU0sSUFBSUEsTUFBTSxDQUFFWSxRQUFRLENBQUUsSUFBSSxDQUFDUixLQUFNLENBQUUsQ0FBQzs7SUFFMUM7SUFDQSxJQUFJLENBQUNILE9BQU8sQ0FBRSxJQUFJLENBQUNFLFdBQVcsQ0FBRSxHQUFHUSxNQUFNO0lBQ3pDLElBQUksQ0FBQ1IsV0FBVyxHQUFHLENBQUUsSUFBSSxDQUFDQSxXQUFXLEdBQUcsQ0FBQyxJQUFLLElBQUksQ0FBQ0osVUFBVTtJQUU3RCxPQUFPLElBQUksQ0FBQ1MsaUJBQWlCLENBQUMsQ0FBQztFQUNqQztBQUNGO0FBRUFaLEdBQUcsQ0FBQ21CLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRWxCLGNBQWUsQ0FBQztBQUVoRCxlQUFlQSxjQUFjIn0=