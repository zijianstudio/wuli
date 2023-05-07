// Copyright 2021-2022, University of Colorado Boulder

/**
 * Helps writing buffer-array style triangles into buffers.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../dot/js/Vector3.js';
import mobius from './mobius.js';
export default class TriangleArrayWriter {
  /**
   * @param positionArray
   * @param normalArray
   * @param uvArray
   * @param offset - How many vertices have been specified so far?
   * @param offsetPosition - How to transform all of the points
   */
  constructor(positionArray, normalArray, uvArray, offset = 0, offsetPosition = Vector3.ZERO) {
    this.positionArray = positionArray;
    this.normalArray = normalArray;
    this.uvArray = uvArray;
    this.positionIndex = offset * 3;
    this.normalIndex = offset * 3;
    this.uvIndex = offset * 2;
    this.offset = offset;
    this.offsetPosition = offsetPosition;
  }

  /**
   * Writes a position into the (optional) positionArray, and increments the offset.
   */
  position(x, y, z) {
    if (this.positionArray) {
      this.positionArray[this.positionIndex++] = x + this.offsetPosition.x;
      this.positionArray[this.positionIndex++] = y + this.offsetPosition.y;
      this.positionArray[this.positionIndex++] = z + this.offsetPosition.z;
    }
    this.offset++;
  }

  /**
   * Writes a normal into the (optional) normalArray
   */
  normal(x, y, z) {
    if (this.normalArray) {
      this.normalArray[this.normalIndex++] = x;
      this.normalArray[this.normalIndex++] = y;
      this.normalArray[this.normalIndex++] = z;
    }
  }

  /**
   * Writes a UV into the (optional) uvArray
   */
  uv(u, v) {
    if (this.uvArray) {
      this.uvArray[this.uvIndex++] = u;
      this.uvArray[this.uvIndex++] = v;
    }
  }

  /**
   * Returns the offset (previous offset + number of triangles added, counted from the positionArray)
   */
  getOffset() {
    return this.offset;
  }
}
mobius.register('TriangleArrayWriter', TriangleArrayWriter);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IzIiwibW9iaXVzIiwiVHJpYW5nbGVBcnJheVdyaXRlciIsImNvbnN0cnVjdG9yIiwicG9zaXRpb25BcnJheSIsIm5vcm1hbEFycmF5IiwidXZBcnJheSIsIm9mZnNldCIsIm9mZnNldFBvc2l0aW9uIiwiWkVSTyIsInBvc2l0aW9uSW5kZXgiLCJub3JtYWxJbmRleCIsInV2SW5kZXgiLCJwb3NpdGlvbiIsIngiLCJ5IiwieiIsIm5vcm1hbCIsInV2IiwidSIsInYiLCJnZXRPZmZzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRyaWFuZ2xlQXJyYXlXcml0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSGVscHMgd3JpdGluZyBidWZmZXItYXJyYXkgc3R5bGUgdHJpYW5nbGVzIGludG8gYnVmZmVycy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IzLmpzJztcclxuaW1wb3J0IG1vYml1cyBmcm9tICcuL21vYml1cy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmlhbmdsZUFycmF5V3JpdGVyIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBwb3NpdGlvbkFycmF5OiBGbG9hdDMyQXJyYXkgfCBudWxsO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbm9ybWFsQXJyYXk6IEZsb2F0MzJBcnJheSB8IG51bGw7XHJcbiAgcHJpdmF0ZSByZWFkb25seSB1dkFycmF5OiBGbG9hdDMyQXJyYXkgfCBudWxsO1xyXG5cclxuICBwcml2YXRlIHBvc2l0aW9uSW5kZXg6IG51bWJlcjtcclxuICBwcml2YXRlIG5vcm1hbEluZGV4OiBudW1iZXI7XHJcbiAgcHJpdmF0ZSB1dkluZGV4OiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBvZmZzZXQ6IG51bWJlcjtcclxuXHJcbiAgcHJpdmF0ZSBvZmZzZXRQb3NpdGlvbjogVmVjdG9yMztcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHBvc2l0aW9uQXJyYXlcclxuICAgKiBAcGFyYW0gbm9ybWFsQXJyYXlcclxuICAgKiBAcGFyYW0gdXZBcnJheVxyXG4gICAqIEBwYXJhbSBvZmZzZXQgLSBIb3cgbWFueSB2ZXJ0aWNlcyBoYXZlIGJlZW4gc3BlY2lmaWVkIHNvIGZhcj9cclxuICAgKiBAcGFyYW0gb2Zmc2V0UG9zaXRpb24gLSBIb3cgdG8gdHJhbnNmb3JtIGFsbCBvZiB0aGUgcG9pbnRzXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwb3NpdGlvbkFycmF5OiBGbG9hdDMyQXJyYXkgfCBudWxsLCBub3JtYWxBcnJheTogRmxvYXQzMkFycmF5IHwgbnVsbCwgdXZBcnJheTogRmxvYXQzMkFycmF5IHwgbnVsbCwgb2Zmc2V0ID0gMCwgb2Zmc2V0UG9zaXRpb246IFZlY3RvcjMgPSBWZWN0b3IzLlpFUk8gKSB7XHJcblxyXG4gICAgdGhpcy5wb3NpdGlvbkFycmF5ID0gcG9zaXRpb25BcnJheTtcclxuICAgIHRoaXMubm9ybWFsQXJyYXkgPSBub3JtYWxBcnJheTtcclxuICAgIHRoaXMudXZBcnJheSA9IHV2QXJyYXk7XHJcbiAgICB0aGlzLnBvc2l0aW9uSW5kZXggPSBvZmZzZXQgKiAzO1xyXG4gICAgdGhpcy5ub3JtYWxJbmRleCA9IG9mZnNldCAqIDM7XHJcbiAgICB0aGlzLnV2SW5kZXggPSBvZmZzZXQgKiAyO1xyXG4gICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XHJcbiAgICB0aGlzLm9mZnNldFBvc2l0aW9uID0gb2Zmc2V0UG9zaXRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXcml0ZXMgYSBwb3NpdGlvbiBpbnRvIHRoZSAob3B0aW9uYWwpIHBvc2l0aW9uQXJyYXksIGFuZCBpbmNyZW1lbnRzIHRoZSBvZmZzZXQuXHJcbiAgICovXHJcbiAgcHVibGljIHBvc2l0aW9uKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLnBvc2l0aW9uQXJyYXkgKSB7XHJcbiAgICAgIHRoaXMucG9zaXRpb25BcnJheVsgdGhpcy5wb3NpdGlvbkluZGV4KysgXSA9IHggKyB0aGlzLm9mZnNldFBvc2l0aW9uLng7XHJcbiAgICAgIHRoaXMucG9zaXRpb25BcnJheVsgdGhpcy5wb3NpdGlvbkluZGV4KysgXSA9IHkgKyB0aGlzLm9mZnNldFBvc2l0aW9uLnk7XHJcbiAgICAgIHRoaXMucG9zaXRpb25BcnJheVsgdGhpcy5wb3NpdGlvbkluZGV4KysgXSA9IHogKyB0aGlzLm9mZnNldFBvc2l0aW9uLno7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5vZmZzZXQrKztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdyaXRlcyBhIG5vcm1hbCBpbnRvIHRoZSAob3B0aW9uYWwpIG5vcm1hbEFycmF5XHJcbiAgICovXHJcbiAgcHVibGljIG5vcm1hbCggeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5ub3JtYWxBcnJheSApIHtcclxuICAgICAgdGhpcy5ub3JtYWxBcnJheVsgdGhpcy5ub3JtYWxJbmRleCsrIF0gPSB4O1xyXG4gICAgICB0aGlzLm5vcm1hbEFycmF5WyB0aGlzLm5vcm1hbEluZGV4KysgXSA9IHk7XHJcbiAgICAgIHRoaXMubm9ybWFsQXJyYXlbIHRoaXMubm9ybWFsSW5kZXgrKyBdID0gejtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdyaXRlcyBhIFVWIGludG8gdGhlIChvcHRpb25hbCkgdXZBcnJheVxyXG4gICAqL1xyXG4gIHB1YmxpYyB1diggdTogbnVtYmVyLCB2OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMudXZBcnJheSApIHtcclxuICAgICAgdGhpcy51dkFycmF5WyB0aGlzLnV2SW5kZXgrKyBdID0gdTtcclxuICAgICAgdGhpcy51dkFycmF5WyB0aGlzLnV2SW5kZXgrKyBdID0gdjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG9mZnNldCAocHJldmlvdXMgb2Zmc2V0ICsgbnVtYmVyIG9mIHRyaWFuZ2xlcyBhZGRlZCwgY291bnRlZCBmcm9tIHRoZSBwb3NpdGlvbkFycmF5KVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRPZmZzZXQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLm9mZnNldDtcclxuICB9XHJcbn1cclxuXHJcbm1vYml1cy5yZWdpc3RlciggJ1RyaWFuZ2xlQXJyYXlXcml0ZXInLCBUcmlhbmdsZUFycmF5V3JpdGVyICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0seUJBQXlCO0FBQzdDLE9BQU9DLE1BQU0sTUFBTSxhQUFhO0FBRWhDLGVBQWUsTUFBTUMsbUJBQW1CLENBQUM7RUFhdkM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0MsV0FBV0EsQ0FBRUMsYUFBa0MsRUFBRUMsV0FBZ0MsRUFBRUMsT0FBNEIsRUFBRUMsTUFBTSxHQUFHLENBQUMsRUFBRUMsY0FBdUIsR0FBR1IsT0FBTyxDQUFDUyxJQUFJLEVBQUc7SUFFM0ssSUFBSSxDQUFDTCxhQUFhLEdBQUdBLGFBQWE7SUFDbEMsSUFBSSxDQUFDQyxXQUFXLEdBQUdBLFdBQVc7SUFDOUIsSUFBSSxDQUFDQyxPQUFPLEdBQUdBLE9BQU87SUFDdEIsSUFBSSxDQUFDSSxhQUFhLEdBQUdILE1BQU0sR0FBRyxDQUFDO0lBQy9CLElBQUksQ0FBQ0ksV0FBVyxHQUFHSixNQUFNLEdBQUcsQ0FBQztJQUM3QixJQUFJLENBQUNLLE9BQU8sR0FBR0wsTUFBTSxHQUFHLENBQUM7SUFDekIsSUFBSSxDQUFDQSxNQUFNLEdBQUdBLE1BQU07SUFDcEIsSUFBSSxDQUFDQyxjQUFjLEdBQUdBLGNBQWM7RUFDdEM7O0VBRUE7QUFDRjtBQUNBO0VBQ1NLLFFBQVFBLENBQUVDLENBQVMsRUFBRUMsQ0FBUyxFQUFFQyxDQUFTLEVBQVM7SUFDdkQsSUFBSyxJQUFJLENBQUNaLGFBQWEsRUFBRztNQUN4QixJQUFJLENBQUNBLGFBQWEsQ0FBRSxJQUFJLENBQUNNLGFBQWEsRUFBRSxDQUFFLEdBQUdJLENBQUMsR0FBRyxJQUFJLENBQUNOLGNBQWMsQ0FBQ00sQ0FBQztNQUN0RSxJQUFJLENBQUNWLGFBQWEsQ0FBRSxJQUFJLENBQUNNLGFBQWEsRUFBRSxDQUFFLEdBQUdLLENBQUMsR0FBRyxJQUFJLENBQUNQLGNBQWMsQ0FBQ08sQ0FBQztNQUN0RSxJQUFJLENBQUNYLGFBQWEsQ0FBRSxJQUFJLENBQUNNLGFBQWEsRUFBRSxDQUFFLEdBQUdNLENBQUMsR0FBRyxJQUFJLENBQUNSLGNBQWMsQ0FBQ1EsQ0FBQztJQUN4RTtJQUVBLElBQUksQ0FBQ1QsTUFBTSxFQUFFO0VBQ2Y7O0VBRUE7QUFDRjtBQUNBO0VBQ1NVLE1BQU1BLENBQUVILENBQVMsRUFBRUMsQ0FBUyxFQUFFQyxDQUFTLEVBQVM7SUFDckQsSUFBSyxJQUFJLENBQUNYLFdBQVcsRUFBRztNQUN0QixJQUFJLENBQUNBLFdBQVcsQ0FBRSxJQUFJLENBQUNNLFdBQVcsRUFBRSxDQUFFLEdBQUdHLENBQUM7TUFDMUMsSUFBSSxDQUFDVCxXQUFXLENBQUUsSUFBSSxDQUFDTSxXQUFXLEVBQUUsQ0FBRSxHQUFHSSxDQUFDO01BQzFDLElBQUksQ0FBQ1YsV0FBVyxDQUFFLElBQUksQ0FBQ00sV0FBVyxFQUFFLENBQUUsR0FBR0ssQ0FBQztJQUM1QztFQUNGOztFQUVBO0FBQ0Y7QUFDQTtFQUNTRSxFQUFFQSxDQUFFQyxDQUFTLEVBQUVDLENBQVMsRUFBUztJQUN0QyxJQUFLLElBQUksQ0FBQ2QsT0FBTyxFQUFHO01BQ2xCLElBQUksQ0FBQ0EsT0FBTyxDQUFFLElBQUksQ0FBQ00sT0FBTyxFQUFFLENBQUUsR0FBR08sQ0FBQztNQUNsQyxJQUFJLENBQUNiLE9BQU8sQ0FBRSxJQUFJLENBQUNNLE9BQU8sRUFBRSxDQUFFLEdBQUdRLENBQUM7SUFDcEM7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7RUFDU0MsU0FBU0EsQ0FBQSxFQUFXO0lBQ3pCLE9BQU8sSUFBSSxDQUFDZCxNQUFNO0VBQ3BCO0FBQ0Y7QUFFQU4sTUFBTSxDQUFDcUIsUUFBUSxDQUFFLHFCQUFxQixFQUFFcEIsbUJBQW9CLENBQUMifQ==