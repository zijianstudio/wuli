// Copyright 2014-2020, University of Colorado Boulder
/**
 * This class is a delay buffer that allows information to be put into it and then extracted based on the amount of
 * time in the past that a value is needed.
 *
 * NOTE: This seems like it might be useful in other simulations.  If this turns out to be true, it will need some
 * work to generalize.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Utils from '../../../../dot/js/Utils.js';
import neuron from '../../neuron.js';
import DelayElement from './DelayElement.js';

// This value is used to tell if two numbers are different.  It was needed due to some floating point resolution
// problems that were occurring.
const DIFFERENCE_RESOLUTION = 1E-15;
class DelayBuffer {
  /**
   * @param {number} maxDelay // In seconds of simulation time.
   * @param {number} minTimeStep // sim the clock rate, often several orders of magnitude slower than real time.
   */
  constructor(maxDelay, minTimeStep) {
    this.numEntries = Math.ceil(maxDelay / minTimeStep); // @private
    this.filling = false; // @private
    this.allDeltaTimesEqual = true; // @private
    this.previousDeltaTime = -1; // @private
    this.countAtThisDeltaTime = 0; // @private
    // Allocate the memory that will be used.
    this.delayElements = new Array(this.numEntries); // @private

    _.times(this.numEntries, idx => {
      this.delayElements[idx] = new DelayElement();
    });

    // Head and tail pointers for FIFO-type behavior.
    this.head = 0; // @private
    this.tail = 0; // @private
    // Set the initial conditions.
    this.clear();
  }

  // @public
  addValue(value, deltaTime) {
    this.delayElements[this.head].setValueAndTime(value, deltaTime);
    this.head = (this.head + 1) % this.numEntries;
    if (this.head === this.tail) {
      // The addition of this element has overwritten what was the tail
      // of the queue, so it must be advanced.
      this.tail = (this.tail + 1) % this.numEntries;

      // Once full, it will stay full, since there is no reason to
      // remove values from the queue.
      this.filling = false;
    }

    // Update the flag that determines if all the delta time values
    // currently stored are the same.
    if (this.previousDeltaTime === -1) {
      // First time through, just store the time.
      this.previousDeltaTime = deltaTime;
      this.countAtThisDeltaTime = 1;
    } else {
      if (Math.abs(deltaTime - this.previousDeltaTime) > DIFFERENCE_RESOLUTION) {
        // The time increment has changed, so we know that there are
        // different time values in the queue.
        this.allDeltaTimesEqual = false;
        this.countAtThisDeltaTime = 1;
      } else {
        if (!this.allDeltaTimesEqual) {
          // The new value is equal to the previous value, but the
          // flag says that not all values were the same.  Does the
          // addition of this value make them all equal?
          this.countAtThisDeltaTime++;
          if (this.countAtThisDeltaTime >= this.numEntries) {
            // All delta times should now be equal, so set the
            // flag accordingly.
            this.allDeltaTimesEqual = true;
          }
        }
      }
      this.previousDeltaTime = deltaTime;
    }
  }

  // @public
  getDelayedValue(delayAmount) {
    let delayedValue = 0;
    let index = -1;
    if (this.previousDeltaTime <= 0) {
      // No data has been added yet, return 0.
      delayedValue = 0;
    } else if (this.allDeltaTimesEqual) {
      // All times in the buffer are equal, so we should be able to simply index to the appropriate location.  The
      // offset must be at least 1, since this buffer doesn't hold a non-delayed value.
      const offset = Math.max(Utils.roundSymmetric(delayAmount / this.previousDeltaTime), 1);
      if (this.filling && offset > this.head || offset > this.numEntries) {
        // The caller is asking for data that we don't have yet, so give them the oldest data available.
        delayedValue = this.delayElements[this.tail].value;
      } else {
        index = this.head - offset;
        if (index < 0) {
          // Handle wraparound.
          index = this.numEntries + index;
        }
        delayedValue = this.delayElements[index].value;
      }
    } else {
      // There is variation in the delta time values in the buffer, so we need to go through them, add up the delays,
      // and find the closest data.
      let delayReached = false;
      index = this.head > 0 ? this.head - 1 : this.numEntries - 1;
      let accumulatedDelay = 0;
      while (!delayReached) {
        accumulatedDelay += this.delayElements[index].deltaTime;
        if (accumulatedDelay >= delayAmount) {
          // We've found the data.  Note that it may not be the exact time requested - we're assuming it is close
          // enough.  Might need to add interpolation some day if more accuracy is needed.
          delayReached = true;
        } else if (index === this.tail) {
          // We've gone through all the data and there isn't enough to obtain the requested delay amount, so return
          // the oldest that is available.
          delayReached = true;
        } else {
          // Keep going through the buffer.
          index = index - 1 >= 0 ? index - 1 : this.numEntries - 1;
        }
      }
      delayedValue = this.delayElements[index].value;
    }
    return delayedValue;
  }

  // @public - get a copy of this object that retains references to individual delay elements
  getCopy() {
    const copy = new DelayBuffer(0, 1); // create a new delay buffer, but most of its contents will be overwritten below
    copy.numEntries = this.numEntries;
    copy.filling = this.filling;
    copy.allDeltaTimesEqual = this.allDeltaTimesEqual;
    copy.previousDeltaTime = this.previousDeltaTime;
    copy.countAtThisDeltaTime = this.countAtThisDeltaTime;
    copy.delayElements = this.delayElements.slice();
    copy.head = 0; // @private
    copy.tail = 0; // @private
    return copy;
  }

  // @public
  clear() {
    this.head = 0;
    this.tail = 0;
    this.previousDeltaTime = -1;
    this.filling = true;
  }
}
neuron.register('DelayBuffer', DelayBuffer);
export default DelayBuffer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIm5ldXJvbiIsIkRlbGF5RWxlbWVudCIsIkRJRkZFUkVOQ0VfUkVTT0xVVElPTiIsIkRlbGF5QnVmZmVyIiwiY29uc3RydWN0b3IiLCJtYXhEZWxheSIsIm1pblRpbWVTdGVwIiwibnVtRW50cmllcyIsIk1hdGgiLCJjZWlsIiwiZmlsbGluZyIsImFsbERlbHRhVGltZXNFcXVhbCIsInByZXZpb3VzRGVsdGFUaW1lIiwiY291bnRBdFRoaXNEZWx0YVRpbWUiLCJkZWxheUVsZW1lbnRzIiwiQXJyYXkiLCJfIiwidGltZXMiLCJpZHgiLCJoZWFkIiwidGFpbCIsImNsZWFyIiwiYWRkVmFsdWUiLCJ2YWx1ZSIsImRlbHRhVGltZSIsInNldFZhbHVlQW5kVGltZSIsImFicyIsImdldERlbGF5ZWRWYWx1ZSIsImRlbGF5QW1vdW50IiwiZGVsYXllZFZhbHVlIiwiaW5kZXgiLCJvZmZzZXQiLCJtYXgiLCJyb3VuZFN5bW1ldHJpYyIsImRlbGF5UmVhY2hlZCIsImFjY3VtdWxhdGVkRGVsYXkiLCJnZXRDb3B5IiwiY29weSIsInNsaWNlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEZWxheUJ1ZmZlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgaXMgYSBkZWxheSBidWZmZXIgdGhhdCBhbGxvd3MgaW5mb3JtYXRpb24gdG8gYmUgcHV0IGludG8gaXQgYW5kIHRoZW4gZXh0cmFjdGVkIGJhc2VkIG9uIHRoZSBhbW91bnQgb2ZcclxuICogdGltZSBpbiB0aGUgcGFzdCB0aGF0IGEgdmFsdWUgaXMgbmVlZGVkLlxyXG4gKlxyXG4gKiBOT1RFOiBUaGlzIHNlZW1zIGxpa2UgaXQgbWlnaHQgYmUgdXNlZnVsIGluIG90aGVyIHNpbXVsYXRpb25zLiAgSWYgdGhpcyB0dXJucyBvdXQgdG8gYmUgdHJ1ZSwgaXQgd2lsbCBuZWVkIHNvbWVcclxuICogd29yayB0byBnZW5lcmFsaXplLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWYgKGZvciBHaGVudCBVbml2ZXJzaXR5KVxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbmV1cm9uIGZyb20gJy4uLy4uL25ldXJvbi5qcyc7XHJcbmltcG9ydCBEZWxheUVsZW1lbnQgZnJvbSAnLi9EZWxheUVsZW1lbnQuanMnO1xyXG5cclxuLy8gVGhpcyB2YWx1ZSBpcyB1c2VkIHRvIHRlbGwgaWYgdHdvIG51bWJlcnMgYXJlIGRpZmZlcmVudC4gIEl0IHdhcyBuZWVkZWQgZHVlIHRvIHNvbWUgZmxvYXRpbmcgcG9pbnQgcmVzb2x1dGlvblxyXG4vLyBwcm9ibGVtcyB0aGF0IHdlcmUgb2NjdXJyaW5nLlxyXG5jb25zdCBESUZGRVJFTkNFX1JFU09MVVRJT04gPSAxRS0xNTtcclxuXHJcbmNsYXNzIERlbGF5QnVmZmVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heERlbGF5IC8vIEluIHNlY29uZHMgb2Ygc2ltdWxhdGlvbiB0aW1lLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5UaW1lU3RlcCAvLyBzaW0gdGhlIGNsb2NrIHJhdGUsIG9mdGVuIHNldmVyYWwgb3JkZXJzIG9mIG1hZ25pdHVkZSBzbG93ZXIgdGhhbiByZWFsIHRpbWUuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1heERlbGF5LCBtaW5UaW1lU3RlcCApIHtcclxuICAgIHRoaXMubnVtRW50cmllcyA9IE1hdGguY2VpbCggbWF4RGVsYXkgLyBtaW5UaW1lU3RlcCApOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5maWxsaW5nID0gZmFsc2U7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmFsbERlbHRhVGltZXNFcXVhbCA9IHRydWU7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnByZXZpb3VzRGVsdGFUaW1lID0gLTE7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmNvdW50QXRUaGlzRGVsdGFUaW1lID0gMDsgLy8gQHByaXZhdGVcclxuICAgIC8vIEFsbG9jYXRlIHRoZSBtZW1vcnkgdGhhdCB3aWxsIGJlIHVzZWQuXHJcbiAgICB0aGlzLmRlbGF5RWxlbWVudHMgPSBuZXcgQXJyYXkoIHRoaXMubnVtRW50cmllcyApOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIF8udGltZXMoIHRoaXMubnVtRW50cmllcywgaWR4ID0+IHtcclxuICAgICAgdGhpcy5kZWxheUVsZW1lbnRzWyBpZHggXSA9IG5ldyBEZWxheUVsZW1lbnQoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBIZWFkIGFuZCB0YWlsIHBvaW50ZXJzIGZvciBGSUZPLXR5cGUgYmVoYXZpb3IuXHJcbiAgICB0aGlzLmhlYWQgPSAwOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy50YWlsID0gMDsgLy8gQHByaXZhdGVcclxuICAgIC8vIFNldCB0aGUgaW5pdGlhbCBjb25kaXRpb25zLlxyXG4gICAgdGhpcy5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGFkZFZhbHVlKCB2YWx1ZSwgZGVsdGFUaW1lICkge1xyXG4gICAgdGhpcy5kZWxheUVsZW1lbnRzWyB0aGlzLmhlYWQgXS5zZXRWYWx1ZUFuZFRpbWUoIHZhbHVlLCBkZWx0YVRpbWUgKTtcclxuICAgIHRoaXMuaGVhZCA9ICggdGhpcy5oZWFkICsgMSApICUgdGhpcy5udW1FbnRyaWVzO1xyXG4gICAgaWYgKCB0aGlzLmhlYWQgPT09IHRoaXMudGFpbCApIHtcclxuICAgICAgLy8gVGhlIGFkZGl0aW9uIG9mIHRoaXMgZWxlbWVudCBoYXMgb3ZlcndyaXR0ZW4gd2hhdCB3YXMgdGhlIHRhaWxcclxuICAgICAgLy8gb2YgdGhlIHF1ZXVlLCBzbyBpdCBtdXN0IGJlIGFkdmFuY2VkLlxyXG4gICAgICB0aGlzLnRhaWwgPSAoIHRoaXMudGFpbCArIDEgKSAlIHRoaXMubnVtRW50cmllcztcclxuXHJcbiAgICAgIC8vIE9uY2UgZnVsbCwgaXQgd2lsbCBzdGF5IGZ1bGwsIHNpbmNlIHRoZXJlIGlzIG5vIHJlYXNvbiB0b1xyXG4gICAgICAvLyByZW1vdmUgdmFsdWVzIGZyb20gdGhlIHF1ZXVlLlxyXG4gICAgICB0aGlzLmZpbGxpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIGZsYWcgdGhhdCBkZXRlcm1pbmVzIGlmIGFsbCB0aGUgZGVsdGEgdGltZSB2YWx1ZXNcclxuICAgIC8vIGN1cnJlbnRseSBzdG9yZWQgYXJlIHRoZSBzYW1lLlxyXG4gICAgaWYgKCB0aGlzLnByZXZpb3VzRGVsdGFUaW1lID09PSAtMSApIHtcclxuICAgICAgLy8gRmlyc3QgdGltZSB0aHJvdWdoLCBqdXN0IHN0b3JlIHRoZSB0aW1lLlxyXG4gICAgICB0aGlzLnByZXZpb3VzRGVsdGFUaW1lID0gZGVsdGFUaW1lO1xyXG4gICAgICB0aGlzLmNvdW50QXRUaGlzRGVsdGFUaW1lID0gMTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAoIE1hdGguYWJzKCBkZWx0YVRpbWUgLSB0aGlzLnByZXZpb3VzRGVsdGFUaW1lICkgPiBESUZGRVJFTkNFX1JFU09MVVRJT04gKSB7XHJcbiAgICAgICAgLy8gVGhlIHRpbWUgaW5jcmVtZW50IGhhcyBjaGFuZ2VkLCBzbyB3ZSBrbm93IHRoYXQgdGhlcmUgYXJlXHJcbiAgICAgICAgLy8gZGlmZmVyZW50IHRpbWUgdmFsdWVzIGluIHRoZSBxdWV1ZS5cclxuICAgICAgICB0aGlzLmFsbERlbHRhVGltZXNFcXVhbCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY291bnRBdFRoaXNEZWx0YVRpbWUgPSAxO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICggIXRoaXMuYWxsRGVsdGFUaW1lc0VxdWFsICkge1xyXG4gICAgICAgICAgLy8gVGhlIG5ldyB2YWx1ZSBpcyBlcXVhbCB0byB0aGUgcHJldmlvdXMgdmFsdWUsIGJ1dCB0aGVcclxuICAgICAgICAgIC8vIGZsYWcgc2F5cyB0aGF0IG5vdCBhbGwgdmFsdWVzIHdlcmUgdGhlIHNhbWUuICBEb2VzIHRoZVxyXG4gICAgICAgICAgLy8gYWRkaXRpb24gb2YgdGhpcyB2YWx1ZSBtYWtlIHRoZW0gYWxsIGVxdWFsP1xyXG4gICAgICAgICAgdGhpcy5jb3VudEF0VGhpc0RlbHRhVGltZSsrO1xyXG4gICAgICAgICAgaWYgKCB0aGlzLmNvdW50QXRUaGlzRGVsdGFUaW1lID49IHRoaXMubnVtRW50cmllcyApIHtcclxuICAgICAgICAgICAgLy8gQWxsIGRlbHRhIHRpbWVzIHNob3VsZCBub3cgYmUgZXF1YWwsIHNvIHNldCB0aGVcclxuICAgICAgICAgICAgLy8gZmxhZyBhY2NvcmRpbmdseS5cclxuICAgICAgICAgICAgdGhpcy5hbGxEZWx0YVRpbWVzRXF1YWwgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB0aGlzLnByZXZpb3VzRGVsdGFUaW1lID0gZGVsdGFUaW1lO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGdldERlbGF5ZWRWYWx1ZSggZGVsYXlBbW91bnQgKSB7XHJcblxyXG4gICAgbGV0IGRlbGF5ZWRWYWx1ZSA9IDA7XHJcbiAgICBsZXQgaW5kZXggPSAtMTtcclxuICAgIGlmICggdGhpcy5wcmV2aW91c0RlbHRhVGltZSA8PSAwICkge1xyXG4gICAgICAvLyBObyBkYXRhIGhhcyBiZWVuIGFkZGVkIHlldCwgcmV0dXJuIDAuXHJcbiAgICAgIGRlbGF5ZWRWYWx1ZSA9IDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5hbGxEZWx0YVRpbWVzRXF1YWwgKSB7XHJcblxyXG4gICAgICAvLyBBbGwgdGltZXMgaW4gdGhlIGJ1ZmZlciBhcmUgZXF1YWwsIHNvIHdlIHNob3VsZCBiZSBhYmxlIHRvIHNpbXBseSBpbmRleCB0byB0aGUgYXBwcm9wcmlhdGUgbG9jYXRpb24uICBUaGVcclxuICAgICAgLy8gb2Zmc2V0IG11c3QgYmUgYXQgbGVhc3QgMSwgc2luY2UgdGhpcyBidWZmZXIgZG9lc24ndCBob2xkIGEgbm9uLWRlbGF5ZWQgdmFsdWUuXHJcbiAgICAgIGNvbnN0IG9mZnNldCA9IE1hdGgubWF4KCBVdGlscy5yb3VuZFN5bW1ldHJpYyggZGVsYXlBbW91bnQgLyB0aGlzLnByZXZpb3VzRGVsdGFUaW1lICksIDEgKTtcclxuICAgICAgaWYgKCAoIHRoaXMuZmlsbGluZyAmJiBvZmZzZXQgPiB0aGlzLmhlYWQgKSB8fCBvZmZzZXQgPiB0aGlzLm51bUVudHJpZXMgKSB7XHJcbiAgICAgICAgLy8gVGhlIGNhbGxlciBpcyBhc2tpbmcgZm9yIGRhdGEgdGhhdCB3ZSBkb24ndCBoYXZlIHlldCwgc28gZ2l2ZSB0aGVtIHRoZSBvbGRlc3QgZGF0YSBhdmFpbGFibGUuXHJcbiAgICAgICAgZGVsYXllZFZhbHVlID0gdGhpcy5kZWxheUVsZW1lbnRzWyB0aGlzLnRhaWwgXS52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBpbmRleCA9IHRoaXMuaGVhZCAtIG9mZnNldDtcclxuICAgICAgICBpZiAoIGluZGV4IDwgMCApIHtcclxuICAgICAgICAgIC8vIEhhbmRsZSB3cmFwYXJvdW5kLlxyXG4gICAgICAgICAgaW5kZXggPSB0aGlzLm51bUVudHJpZXMgKyBpbmRleDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVsYXllZFZhbHVlID0gdGhpcy5kZWxheUVsZW1lbnRzWyBpbmRleCBdLnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gVGhlcmUgaXMgdmFyaWF0aW9uIGluIHRoZSBkZWx0YSB0aW1lIHZhbHVlcyBpbiB0aGUgYnVmZmVyLCBzbyB3ZSBuZWVkIHRvIGdvIHRocm91Z2ggdGhlbSwgYWRkIHVwIHRoZSBkZWxheXMsXHJcbiAgICAgIC8vIGFuZCBmaW5kIHRoZSBjbG9zZXN0IGRhdGEuXHJcbiAgICAgIGxldCBkZWxheVJlYWNoZWQgPSBmYWxzZTtcclxuICAgICAgaW5kZXggPSB0aGlzLmhlYWQgPiAwID8gdGhpcy5oZWFkIC0gMSA6IHRoaXMubnVtRW50cmllcyAtIDE7XHJcbiAgICAgIGxldCBhY2N1bXVsYXRlZERlbGF5ID0gMDtcclxuICAgICAgd2hpbGUgKCAhZGVsYXlSZWFjaGVkICkge1xyXG4gICAgICAgIGFjY3VtdWxhdGVkRGVsYXkgKz0gdGhpcy5kZWxheUVsZW1lbnRzWyBpbmRleCBdLmRlbHRhVGltZTtcclxuICAgICAgICBpZiAoIGFjY3VtdWxhdGVkRGVsYXkgPj0gZGVsYXlBbW91bnQgKSB7XHJcbiAgICAgICAgICAvLyBXZSd2ZSBmb3VuZCB0aGUgZGF0YS4gIE5vdGUgdGhhdCBpdCBtYXkgbm90IGJlIHRoZSBleGFjdCB0aW1lIHJlcXVlc3RlZCAtIHdlJ3JlIGFzc3VtaW5nIGl0IGlzIGNsb3NlXHJcbiAgICAgICAgICAvLyBlbm91Z2guICBNaWdodCBuZWVkIHRvIGFkZCBpbnRlcnBvbGF0aW9uIHNvbWUgZGF5IGlmIG1vcmUgYWNjdXJhY3kgaXMgbmVlZGVkLlxyXG4gICAgICAgICAgZGVsYXlSZWFjaGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGluZGV4ID09PSB0aGlzLnRhaWwgKSB7XHJcbiAgICAgICAgICAvLyBXZSd2ZSBnb25lIHRocm91Z2ggYWxsIHRoZSBkYXRhIGFuZCB0aGVyZSBpc24ndCBlbm91Z2ggdG8gb2J0YWluIHRoZSByZXF1ZXN0ZWQgZGVsYXkgYW1vdW50LCBzbyByZXR1cm5cclxuICAgICAgICAgIC8vIHRoZSBvbGRlc3QgdGhhdCBpcyBhdmFpbGFibGUuXHJcbiAgICAgICAgICBkZWxheVJlYWNoZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIEtlZXAgZ29pbmcgdGhyb3VnaCB0aGUgYnVmZmVyLlxyXG4gICAgICAgICAgaW5kZXggPSBpbmRleCAtIDEgPj0gMCA/IGluZGV4IC0gMSA6IHRoaXMubnVtRW50cmllcyAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGRlbGF5ZWRWYWx1ZSA9IHRoaXMuZGVsYXlFbGVtZW50c1sgaW5kZXggXS52YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVsYXllZFZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYyAtIGdldCBhIGNvcHkgb2YgdGhpcyBvYmplY3QgdGhhdCByZXRhaW5zIHJlZmVyZW5jZXMgdG8gaW5kaXZpZHVhbCBkZWxheSBlbGVtZW50c1xyXG4gIGdldENvcHkoKSB7XHJcbiAgICBjb25zdCBjb3B5ID0gbmV3IERlbGF5QnVmZmVyKCAwLCAxICk7IC8vIGNyZWF0ZSBhIG5ldyBkZWxheSBidWZmZXIsIGJ1dCBtb3N0IG9mIGl0cyBjb250ZW50cyB3aWxsIGJlIG92ZXJ3cml0dGVuIGJlbG93XHJcbiAgICBjb3B5Lm51bUVudHJpZXMgPSB0aGlzLm51bUVudHJpZXM7XHJcbiAgICBjb3B5LmZpbGxpbmcgPSB0aGlzLmZpbGxpbmc7XHJcbiAgICBjb3B5LmFsbERlbHRhVGltZXNFcXVhbCA9IHRoaXMuYWxsRGVsdGFUaW1lc0VxdWFsO1xyXG4gICAgY29weS5wcmV2aW91c0RlbHRhVGltZSA9IHRoaXMucHJldmlvdXNEZWx0YVRpbWU7XHJcbiAgICBjb3B5LmNvdW50QXRUaGlzRGVsdGFUaW1lID0gdGhpcy5jb3VudEF0VGhpc0RlbHRhVGltZTtcclxuICAgIGNvcHkuZGVsYXlFbGVtZW50cyA9IHRoaXMuZGVsYXlFbGVtZW50cy5zbGljZSgpO1xyXG4gICAgY29weS5oZWFkID0gMDsgLy8gQHByaXZhdGVcclxuICAgIGNvcHkudGFpbCA9IDA7IC8vIEBwcml2YXRlXHJcbiAgICByZXR1cm4gY29weTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBjbGVhcigpIHtcclxuICAgIHRoaXMuaGVhZCA9IDA7XHJcbiAgICB0aGlzLnRhaWwgPSAwO1xyXG4gICAgdGhpcy5wcmV2aW91c0RlbHRhVGltZSA9IC0xO1xyXG4gICAgdGhpcy5maWxsaW5nID0gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbm5ldXJvbi5yZWdpc3RlciggJ0RlbGF5QnVmZmVyJywgRGVsYXlCdWZmZXIgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IERlbGF5QnVmZmVyO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxNQUFNLE1BQU0saUJBQWlCO0FBQ3BDLE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7O0FBRTVDO0FBQ0E7QUFDQSxNQUFNQyxxQkFBcUIsR0FBRyxLQUFLO0FBRW5DLE1BQU1DLFdBQVcsQ0FBQztFQUVoQjtBQUNGO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxRQUFRLEVBQUVDLFdBQVcsRUFBRztJQUNuQyxJQUFJLENBQUNDLFVBQVUsR0FBR0MsSUFBSSxDQUFDQyxJQUFJLENBQUVKLFFBQVEsR0FBR0MsV0FBWSxDQUFDLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUNJLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQztJQUN0QixJQUFJLENBQUNDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2hDLElBQUksQ0FBQ0MsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3QixJQUFJLENBQUNDLG9CQUFvQixHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQy9CO0lBQ0EsSUFBSSxDQUFDQyxhQUFhLEdBQUcsSUFBSUMsS0FBSyxDQUFFLElBQUksQ0FBQ1IsVUFBVyxDQUFDLENBQUMsQ0FBQzs7SUFFbkRTLENBQUMsQ0FBQ0MsS0FBSyxDQUFFLElBQUksQ0FBQ1YsVUFB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