// Copyright 2014-2022, University of Colorado Boulder

/**
 * This minimalistic profiler is meant to help understand the time spent in running a PhET simulation.
 * It was designed to be minimally invasive, so it won't alter the simulation's performance significantly.
 * Note: just showing the average FPS or ms/frame is not sufficient, since we need to see when garbage collections
 * happen, which are typically a spike in a single frame.  Hence, the data is shown as a histogram. Data that
 * doesn't fit in the histogram appears in an optional 'longTimes' field.
 *
 * When a sim is run with ?profiler, output is displayed in the upper-left corner of the browser window, and updates
 * every 60 frames.
 *
 * The general format is:
 *
 * FPS - ms/frame - histogram [- longTimes]
 *
 * Here's an example:
 *
 * 48 FPS - 21ms/frame - 0,0,5,0,0,0,0,0,1,0,0,0,0,3,1,3,18,19,5,3,1,0,1,0,0,0,0,1,0,0 - 50,37,217
 *
 * The histogram field is a sequence of 30 numbers, for 0-29ms. Each number indicates the number of frames that took
 * that amount of time. In the above example, histogram[2] is 5; there were 5 frames that took 2ms.
 *
 * The longTimes field is the set of frame times that exceeded 29ms, and thus don't fit in the histogram.
 * If 2 frames took 37ms, then 37ms will appear twice.  If no frames exceeded 29ms, then this field will be absent.
 * These values are sorted in descending order, so you can easily identify the largest frame time.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../dot/js/Utils.js';
import joist from './joist.js';
// constants
const FIELD_SEPARATOR = ' \u2014 '; // em dash, a long horizontal dash
const HISTOGRAM_LENGTH = 30;
class Profiler {
  // These data structured were chosen to minimize CPU time.
  allTimes = []; // {number[]} times for all frames, in ms
  histogram = []; // {number[]} array index corresponds to number of ms, value is number of frames at that time
  longTimes = []; // {number[]} any frame times that didn't fit in histogram
  frameStartTime = 0; // {number} start time of the current frame
  previousFrameStartTime = 0; // {number} start time of the previous frame

  constructor() {
    // initialize histogram
    for (let i = 0; i < HISTOGRAM_LENGTH; i++) {
      this.histogram.push(0);
    }

    // this is where the profiler displays its output
    $('body').append('<div style="z-index: 99999999;position: absolute;color:red; left: 10px;" id="phetProfiler" ></div>');
  }
  static start(sim) {
    const profiler = new Profiler();
    sim.frameStartedEmitter.addListener(() => profiler.frameStarted());
    sim.frameEndedEmitter.addListener(() => profiler.frameEnded());
  }
  frameStarted() {
    this.frameStartTime = Date.now();
  }
  frameEnded() {
    // update the display every 60 frames
    if (this.allTimes.length > 0 && this.allTimes.length % 60 === 0) {
      let totalTime = 0;
      for (let i = 0; i < this.allTimes.length; i++) {
        totalTime += this.allTimes[i];
      }

      // FPS
      const averageFPS = Utils.roundSymmetric(1000 / (totalTime / this.allTimes.length));
      let text = `${averageFPS} FPS`;

      // ms/frame
      const averageFrameTime = Utils.roundSymmetric(totalTime / this.allTimes.length);
      text = `${text + FIELD_SEPARATOR + averageFrameTime}ms/frame`;

      // histogram
      text = text + FIELD_SEPARATOR + this.histogram;

      // longTimes
      if (this.longTimes.length > 0) {
        this.longTimes.sort((a, b) => b - a); // sort longTimes in descending order
        text = text + FIELD_SEPARATOR + this.longTimes;
      }

      // update the display
      $('#phetProfiler').html(text);

      // clear data structures
      for (let i = 0; i < HISTOGRAM_LENGTH; i++) {
        this.histogram[i] = 0;
      }
      this.longTimes.length = 0;
      this.allTimes.length = 0;
    }

    // record data for the current frame, skip first frame because we can't compute its dt
    if (this.previousFrameStartTime) {
      const dt = this.frameStartTime - this.previousFrameStartTime;
      this.allTimes.push(dt);
      if (dt < HISTOGRAM_LENGTH) {
        this.histogram[dt]++; // increment the histogram cell for the corresponding time
      } else {
        this.longTimes.push(dt); // time doesn't fit in histogram, record in longTimes
      }
    }

    this.previousFrameStartTime = this.frameStartTime;
  }
}
joist.register('Profiler', Profiler);
export default Profiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsImpvaXN0IiwiRklFTERfU0VQQVJBVE9SIiwiSElTVE9HUkFNX0xFTkdUSCIsIlByb2ZpbGVyIiwiYWxsVGltZXMiLCJoaXN0b2dyYW0iLCJsb25nVGltZXMiLCJmcmFtZVN0YXJ0VGltZSIsInByZXZpb3VzRnJhbWVTdGFydFRpbWUiLCJjb25zdHJ1Y3RvciIsImkiLCJwdXNoIiwiJCIsImFwcGVuZCIsInN0YXJ0Iiwic2ltIiwicHJvZmlsZXIiLCJmcmFtZVN0YXJ0ZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJmcmFtZVN0YXJ0ZWQiLCJmcmFtZUVuZGVkRW1pdHRlciIsImZyYW1lRW5kZWQiLCJEYXRlIiwibm93IiwibGVuZ3RoIiwidG90YWxUaW1lIiwiYXZlcmFnZUZQUyIsInJvdW5kU3ltbWV0cmljIiwidGV4dCIsImF2ZXJhZ2VGcmFtZVRpbWUiLCJzb3J0IiwiYSIsImIiLCJodG1sIiwiZHQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlByb2ZpbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgbWluaW1hbGlzdGljIHByb2ZpbGVyIGlzIG1lYW50IHRvIGhlbHAgdW5kZXJzdGFuZCB0aGUgdGltZSBzcGVudCBpbiBydW5uaW5nIGEgUGhFVCBzaW11bGF0aW9uLlxyXG4gKiBJdCB3YXMgZGVzaWduZWQgdG8gYmUgbWluaW1hbGx5IGludmFzaXZlLCBzbyBpdCB3b24ndCBhbHRlciB0aGUgc2ltdWxhdGlvbidzIHBlcmZvcm1hbmNlIHNpZ25pZmljYW50bHkuXHJcbiAqIE5vdGU6IGp1c3Qgc2hvd2luZyB0aGUgYXZlcmFnZSBGUFMgb3IgbXMvZnJhbWUgaXMgbm90IHN1ZmZpY2llbnQsIHNpbmNlIHdlIG5lZWQgdG8gc2VlIHdoZW4gZ2FyYmFnZSBjb2xsZWN0aW9uc1xyXG4gKiBoYXBwZW4sIHdoaWNoIGFyZSB0eXBpY2FsbHkgYSBzcGlrZSBpbiBhIHNpbmdsZSBmcmFtZS4gIEhlbmNlLCB0aGUgZGF0YSBpcyBzaG93biBhcyBhIGhpc3RvZ3JhbS4gRGF0YSB0aGF0XHJcbiAqIGRvZXNuJ3QgZml0IGluIHRoZSBoaXN0b2dyYW0gYXBwZWFycyBpbiBhbiBvcHRpb25hbCAnbG9uZ1RpbWVzJyBmaWVsZC5cclxuICpcclxuICogV2hlbiBhIHNpbSBpcyBydW4gd2l0aCA/cHJvZmlsZXIsIG91dHB1dCBpcyBkaXNwbGF5ZWQgaW4gdGhlIHVwcGVyLWxlZnQgY29ybmVyIG9mIHRoZSBicm93c2VyIHdpbmRvdywgYW5kIHVwZGF0ZXNcclxuICogZXZlcnkgNjAgZnJhbWVzLlxyXG4gKlxyXG4gKiBUaGUgZ2VuZXJhbCBmb3JtYXQgaXM6XHJcbiAqXHJcbiAqIEZQUyAtIG1zL2ZyYW1lIC0gaGlzdG9ncmFtIFstIGxvbmdUaW1lc11cclxuICpcclxuICogSGVyZSdzIGFuIGV4YW1wbGU6XHJcbiAqXHJcbiAqIDQ4IEZQUyAtIDIxbXMvZnJhbWUgLSAwLDAsNSwwLDAsMCwwLDAsMSwwLDAsMCwwLDMsMSwzLDE4LDE5LDUsMywxLDAsMSwwLDAsMCwwLDEsMCwwIC0gNTAsMzcsMjE3XHJcbiAqXHJcbiAqIFRoZSBoaXN0b2dyYW0gZmllbGQgaXMgYSBzZXF1ZW5jZSBvZiAzMCBudW1iZXJzLCBmb3IgMC0yOW1zLiBFYWNoIG51bWJlciBpbmRpY2F0ZXMgdGhlIG51bWJlciBvZiBmcmFtZXMgdGhhdCB0b29rXHJcbiAqIHRoYXQgYW1vdW50IG9mIHRpbWUuIEluIHRoZSBhYm92ZSBleGFtcGxlLCBoaXN0b2dyYW1bMl0gaXMgNTsgdGhlcmUgd2VyZSA1IGZyYW1lcyB0aGF0IHRvb2sgMm1zLlxyXG4gKlxyXG4gKiBUaGUgbG9uZ1RpbWVzIGZpZWxkIGlzIHRoZSBzZXQgb2YgZnJhbWUgdGltZXMgdGhhdCBleGNlZWRlZCAyOW1zLCBhbmQgdGh1cyBkb24ndCBmaXQgaW4gdGhlIGhpc3RvZ3JhbS5cclxuICogSWYgMiBmcmFtZXMgdG9vayAzN21zLCB0aGVuIDM3bXMgd2lsbCBhcHBlYXIgdHdpY2UuICBJZiBubyBmcmFtZXMgZXhjZWVkZWQgMjltcywgdGhlbiB0aGlzIGZpZWxkIHdpbGwgYmUgYWJzZW50LlxyXG4gKiBUaGVzZSB2YWx1ZXMgYXJlIHNvcnRlZCBpbiBkZXNjZW5kaW5nIG9yZGVyLCBzbyB5b3UgY2FuIGVhc2lseSBpZGVudGlmeSB0aGUgbGFyZ2VzdCBmcmFtZSB0aW1lLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XHJcbmltcG9ydCBTaW0gZnJvbSAnLi9TaW0uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEZJRUxEX1NFUEFSQVRPUiA9ICcgXFx1MjAxNCAnOyAvLyBlbSBkYXNoLCBhIGxvbmcgaG9yaXpvbnRhbCBkYXNoXHJcbmNvbnN0IEhJU1RPR1JBTV9MRU5HVEggPSAzMDtcclxuXHJcbmNsYXNzIFByb2ZpbGVyIHtcclxuXHJcblxyXG4gIC8vIFRoZXNlIGRhdGEgc3RydWN0dXJlZCB3ZXJlIGNob3NlbiB0byBtaW5pbWl6ZSBDUFUgdGltZS5cclxuICBwcml2YXRlIHJlYWRvbmx5IGFsbFRpbWVzOiBudW1iZXJbXSA9IFtdOyAvLyB7bnVtYmVyW119IHRpbWVzIGZvciBhbGwgZnJhbWVzLCBpbiBtc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgaGlzdG9ncmFtOiBudW1iZXJbXSA9IFtdOyAvLyB7bnVtYmVyW119IGFycmF5IGluZGV4IGNvcnJlc3BvbmRzIHRvIG51bWJlciBvZiBtcywgdmFsdWUgaXMgbnVtYmVyIG9mIGZyYW1lcyBhdCB0aGF0IHRpbWVcclxuICBwcml2YXRlIHJlYWRvbmx5IGxvbmdUaW1lczogbnVtYmVyW10gPSBbXTsgLy8ge251bWJlcltdfSBhbnkgZnJhbWUgdGltZXMgdGhhdCBkaWRuJ3QgZml0IGluIGhpc3RvZ3JhbVxyXG4gIHByaXZhdGUgZnJhbWVTdGFydFRpbWUgPSAwOyAvLyB7bnVtYmVyfSBzdGFydCB0aW1lIG9mIHRoZSBjdXJyZW50IGZyYW1lXHJcbiAgcHJpdmF0ZSBwcmV2aW91c0ZyYW1lU3RhcnRUaW1lID0gMDsgLy8ge251bWJlcn0gc3RhcnQgdGltZSBvZiB0aGUgcHJldmlvdXMgZnJhbWVcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIC8vIGluaXRpYWxpemUgaGlzdG9ncmFtXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBISVNUT0dSQU1fTEVOR1RIOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuaGlzdG9ncmFtLnB1c2goIDAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0aGlzIGlzIHdoZXJlIHRoZSBwcm9maWxlciBkaXNwbGF5cyBpdHMgb3V0cHV0XHJcbiAgICAkKCAnYm9keScgKS5hcHBlbmQoICc8ZGl2IHN0eWxlPVwiei1pbmRleDogOTk5OTk5OTk7cG9zaXRpb246IGFic29sdXRlO2NvbG9yOnJlZDsgbGVmdDogMTBweDtcIiBpZD1cInBoZXRQcm9maWxlclwiID48L2Rpdj4nICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIHN0YXJ0KCBzaW06IFNpbSApOiB2b2lkIHtcclxuICAgIGNvbnN0IHByb2ZpbGVyID0gbmV3IFByb2ZpbGVyKCk7XHJcbiAgICBzaW0uZnJhbWVTdGFydGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gcHJvZmlsZXIuZnJhbWVTdGFydGVkKCkgKTtcclxuICAgIHNpbS5mcmFtZUVuZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gcHJvZmlsZXIuZnJhbWVFbmRlZCgpICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGZyYW1lU3RhcnRlZCgpOiB2b2lkIHtcclxuICAgIHRoaXMuZnJhbWVTdGFydFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBmcmFtZUVuZGVkKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgZGlzcGxheSBldmVyeSA2MCBmcmFtZXNcclxuICAgIGlmICggdGhpcy5hbGxUaW1lcy5sZW5ndGggPiAwICYmIHRoaXMuYWxsVGltZXMubGVuZ3RoICUgNjAgPT09IDAgKSB7XHJcblxyXG4gICAgICBsZXQgdG90YWxUaW1lID0gMDtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5hbGxUaW1lcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICB0b3RhbFRpbWUgKz0gdGhpcy5hbGxUaW1lc1sgaSBdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBGUFNcclxuICAgICAgY29uc3QgYXZlcmFnZUZQUyA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCAxMDAwIC8gKCB0b3RhbFRpbWUgLyB0aGlzLmFsbFRpbWVzLmxlbmd0aCApICk7XHJcbiAgICAgIGxldCB0ZXh0ID0gYCR7YXZlcmFnZUZQU30gRlBTYDtcclxuXHJcbiAgICAgIC8vIG1zL2ZyYW1lXHJcbiAgICAgIGNvbnN0IGF2ZXJhZ2VGcmFtZVRpbWUgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggdG90YWxUaW1lIC8gdGhpcy5hbGxUaW1lcy5sZW5ndGggKTtcclxuICAgICAgdGV4dCA9IGAke3RleHQgKyBGSUVMRF9TRVBBUkFUT1IgKyBhdmVyYWdlRnJhbWVUaW1lfW1zL2ZyYW1lYDtcclxuXHJcbiAgICAgIC8vIGhpc3RvZ3JhbVxyXG4gICAgICB0ZXh0ID0gdGV4dCArIEZJRUxEX1NFUEFSQVRPUiArIHRoaXMuaGlzdG9ncmFtO1xyXG5cclxuICAgICAgLy8gbG9uZ1RpbWVzXHJcbiAgICAgIGlmICggdGhpcy5sb25nVGltZXMubGVuZ3RoID4gMCApIHtcclxuICAgICAgICB0aGlzLmxvbmdUaW1lcy5zb3J0KCAoIGEsIGIgKSA9PiAoIGIgLSBhICkgKTsgLy8gc29ydCBsb25nVGltZXMgaW4gZGVzY2VuZGluZyBvcmRlclxyXG4gICAgICAgIHRleHQgPSB0ZXh0ICsgRklFTERfU0VQQVJBVE9SICsgdGhpcy5sb25nVGltZXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB0aGUgZGlzcGxheVxyXG4gICAgICAkKCAnI3BoZXRQcm9maWxlcicgKS5odG1sKCB0ZXh0ICk7XHJcblxyXG4gICAgICAvLyBjbGVhciBkYXRhIHN0cnVjdHVyZXNcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgSElTVE9HUkFNX0xFTkdUSDsgaSsrICkge1xyXG4gICAgICAgIHRoaXMuaGlzdG9ncmFtWyBpIF0gPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubG9uZ1RpbWVzLmxlbmd0aCA9IDA7XHJcbiAgICAgIHRoaXMuYWxsVGltZXMubGVuZ3RoID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZWNvcmQgZGF0YSBmb3IgdGhlIGN1cnJlbnQgZnJhbWUsIHNraXAgZmlyc3QgZnJhbWUgYmVjYXVzZSB3ZSBjYW4ndCBjb21wdXRlIGl0cyBkdFxyXG4gICAgaWYgKCB0aGlzLnByZXZpb3VzRnJhbWVTdGFydFRpbWUgKSB7XHJcbiAgICAgIGNvbnN0IGR0ID0gdGhpcy5mcmFtZVN0YXJ0VGltZSAtIHRoaXMucHJldmlvdXNGcmFtZVN0YXJ0VGltZTtcclxuICAgICAgdGhpcy5hbGxUaW1lcy5wdXNoKCBkdCApO1xyXG4gICAgICBpZiAoIGR0IDwgSElTVE9HUkFNX0xFTkdUSCApIHtcclxuICAgICAgICB0aGlzLmhpc3RvZ3JhbVsgZHQgXSsrOyAvLyBpbmNyZW1lbnQgdGhlIGhpc3RvZ3JhbSBjZWxsIGZvciB0aGUgY29ycmVzcG9uZGluZyB0aW1lXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5sb25nVGltZXMucHVzaCggZHQgKTsgLy8gdGltZSBkb2Vzbid0IGZpdCBpbiBoaXN0b2dyYW0sIHJlY29yZCBpbiBsb25nVGltZXNcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucHJldmlvdXNGcmFtZVN0YXJ0VGltZSA9IHRoaXMuZnJhbWVTdGFydFRpbWU7XHJcbiAgfVxyXG59XHJcblxyXG5qb2lzdC5yZWdpc3RlciggJ1Byb2ZpbGVyJywgUHJvZmlsZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgUHJvZmlsZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sdUJBQXVCO0FBQ3pDLE9BQU9DLEtBQUssTUFBTSxZQUFZO0FBRzlCO0FBQ0EsTUFBTUMsZUFBZSxHQUFHLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLE1BQU1DLGdCQUFnQixHQUFHLEVBQUU7QUFFM0IsTUFBTUMsUUFBUSxDQUFDO0VBR2I7RUFDaUJDLFFBQVEsR0FBYSxFQUFFLENBQUMsQ0FBQztFQUN6QkMsU0FBUyxHQUFhLEVBQUUsQ0FBQyxDQUFDO0VBQzFCQyxTQUFTLEdBQWEsRUFBRSxDQUFDLENBQUM7RUFDbkNDLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQztFQUNwQkMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0VBRTdCQyxXQUFXQSxDQUFBLEVBQUc7SUFFbkI7SUFDQSxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR1IsZ0JBQWdCLEVBQUVRLENBQUMsRUFBRSxFQUFHO01BQzNDLElBQUksQ0FBQ0wsU0FBUyxDQUFDTSxJQUFJLENBQUUsQ0FBRSxDQUFDO0lBQzFCOztJQUVBO0lBQ0FDLENBQUMsQ0FBRSxNQUFPLENBQUMsQ0FBQ0MsTUFBTSxDQUFFLG9H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