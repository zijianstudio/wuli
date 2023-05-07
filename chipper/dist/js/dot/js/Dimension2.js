// Copyright 2013-2021, University of Colorado Boulder

/**
 * Basic width and height, like a Bounds2 but without the location defined.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from './Bounds2.js';
import dot from './dot.js';
class Dimension2 {
  /**
   * Creates a 2-dimensional size with a width and height
   * @public
   *
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height) {
    // @public {number} - Width of the dimension
    this.width = width;

    // @public {number} - Height of the dimension
    this.height = height;
  }

  /**
   * Debugging string for the dimension.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `[${this.width}w, ${this.height}h]`;
  }

  /**
   * Sets this dimension to be a copy of another dimension.
   * @public
   *
   * This is the mutable form of the function copy(). This will mutate (change) this dimension, in addition to returning
   * this dimension itself.
   *
   * @param {Dimension2} dimension
   * @returns {Dimension2}
   */
  set(dimension) {
    this.width = dimension.width;
    this.height = dimension.height;
    return this;
  }

  /**
   * Sets the width of the dimension, returning this.
   * @public
   *
   * @param {number} width
   * @returns {Dimension2}
   */
  setWidth(width) {
    this.width = width;
    return this;
  }

  /**
   * Sets the height of the dimension, returning this.
   * @public
   *
   * @param {number} height
   * @returns {Dimension2}
   */
  setHeight(height) {
    this.height = height;
    return this;
  }

  /**
   * Creates a copy of this dimension, or if a dimension is passed in, set that dimension's values to ours.
   * @public
   *
   * This is the immutable form of the function set(), if a dimension is provided. This will return a new dimension,
   * and will not modify this dimension.
   *
   * @param {Dimension2} [dimension] - If not provided, creates a new Dimension2 with filled in values. Otherwise, fills
   *                                   in the values of the provided dimension so that it equals this dimension.
   * @returns {Dimension2}
   */
  copy(dimension) {
    if (dimension) {
      return dimension.set(this);
    } else {
      return new Dimension2(this.width, this.height);
    }
  }

  /**
   * Swap width and height and return a new Dimension2
   * @returns {Dimension2}
   * @public
   */
  swapped() {
    return new Dimension2(this.height, this.width);
  }

  /**
   * Creates a Bounds2 from this dimension based on passing in the minimum (top-left) corner as (x,y).
   * @public
   *
   * @param {number} [x] - Minimum x coordinate of the bounds, or 0 if not provided.
   * @param {number} [y] - Minimum y coordinate of the bounds, or 0 if not provided.
   * @returns {Bounds2}
   */
  toBounds(x, y) {
    x = x !== undefined ? x : 0;
    y = y !== undefined ? y : 0;
    return new Bounds2(x, y, this.width + x, this.height + y);
  }

  /**
   * Exact equality comparison between this dimension and another dimension.
   * @public
   *
   * @param {Dimension2} other
   * @returns {boolean} - Whether the two dimensions have equal width and height
   */
  equals(other) {
    return this.width === other.width && this.height === other.height;
  }
}
dot.register('Dimension2', Dimension2);
export default Dimension2;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiZG90IiwiRGltZW5zaW9uMiIsImNvbnN0cnVjdG9yIiwid2lkdGgiLCJoZWlnaHQiLCJ0b1N0cmluZyIsInNldCIsImRpbWVuc2lvbiIsInNldFdpZHRoIiwic2V0SGVpZ2h0IiwiY29weSIsInN3YXBwZWQiLCJ0b0JvdW5kcyIsIngiLCJ5IiwidW5kZWZpbmVkIiwiZXF1YWxzIiwib3RoZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRpbWVuc2lvbjIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmFzaWMgd2lkdGggYW5kIGhlaWdodCwgbGlrZSBhIEJvdW5kczIgYnV0IHdpdGhvdXQgdGhlIGxvY2F0aW9uIGRlZmluZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcclxuXHJcbmNsYXNzIERpbWVuc2lvbjIge1xyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSAyLWRpbWVuc2lvbmFsIHNpemUgd2l0aCBhIHdpZHRoIGFuZCBoZWlnaHRcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHdpZHRoLCBoZWlnaHQgKSB7XHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gV2lkdGggb2YgdGhlIGRpbWVuc2lvblxyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gLSBIZWlnaHQgb2YgdGhlIGRpbWVuc2lvblxyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZWJ1Z2dpbmcgc3RyaW5nIGZvciB0aGUgZGltZW5zaW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgdG9TdHJpbmcoKSB7XHJcbiAgICByZXR1cm4gYFske3RoaXMud2lkdGh9dywgJHt0aGlzLmhlaWdodH1oXWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgZGltZW5zaW9uIHRvIGJlIGEgY29weSBvZiBhbm90aGVyIGRpbWVuc2lvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvcHkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGRpbWVuc2lvbiwgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBkaW1lbnNpb24gaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEaW1lbnNpb24yfSBkaW1lbnNpb25cclxuICAgKiBAcmV0dXJucyB7RGltZW5zaW9uMn1cclxuICAgKi9cclxuICBzZXQoIGRpbWVuc2lvbiApIHtcclxuICAgIHRoaXMud2lkdGggPSBkaW1lbnNpb24ud2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGRpbWVuc2lvbi5oZWlnaHQ7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHdpZHRoIG9mIHRoZSBkaW1lbnNpb24sIHJldHVybmluZyB0aGlzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxyXG4gICAqIEByZXR1cm5zIHtEaW1lbnNpb24yfVxyXG4gICAqL1xyXG4gIHNldFdpZHRoKCB3aWR0aCApIHtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgaGVpZ2h0IG9mIHRoZSBkaW1lbnNpb24sIHJldHVybmluZyB0aGlzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcclxuICAgKiBAcmV0dXJucyB7RGltZW5zaW9uMn1cclxuICAgKi9cclxuICBzZXRIZWlnaHQoIGhlaWdodCApIHtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIGRpbWVuc2lvbiwgb3IgaWYgYSBkaW1lbnNpb24gaXMgcGFzc2VkIGluLCBzZXQgdGhhdCBkaW1lbnNpb24ncyB2YWx1ZXMgdG8gb3Vycy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2V0KCksIGlmIGEgZGltZW5zaW9uIGlzIHByb3ZpZGVkLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGRpbWVuc2lvbixcclxuICAgKiBhbmQgd2lsbCBub3QgbW9kaWZ5IHRoaXMgZGltZW5zaW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEaW1lbnNpb24yfSBbZGltZW5zaW9uXSAtIElmIG5vdCBwcm92aWRlZCwgY3JlYXRlcyBhIG5ldyBEaW1lbnNpb24yIHdpdGggZmlsbGVkIGluIHZhbHVlcy4gT3RoZXJ3aXNlLCBmaWxsc1xyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbiB0aGUgdmFsdWVzIG9mIHRoZSBwcm92aWRlZCBkaW1lbnNpb24gc28gdGhhdCBpdCBlcXVhbHMgdGhpcyBkaW1lbnNpb24uXHJcbiAgICogQHJldHVybnMge0RpbWVuc2lvbjJ9XHJcbiAgICovXHJcbiAgY29weSggZGltZW5zaW9uICkge1xyXG4gICAgaWYgKCBkaW1lbnNpb24gKSB7XHJcbiAgICAgIHJldHVybiBkaW1lbnNpb24uc2V0KCB0aGlzICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIG5ldyBEaW1lbnNpb24yKCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3dhcCB3aWR0aCBhbmQgaGVpZ2h0IGFuZCByZXR1cm4gYSBuZXcgRGltZW5zaW9uMlxyXG4gICAqIEByZXR1cm5zIHtEaW1lbnNpb24yfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzd2FwcGVkKCkge1xyXG4gICAgcmV0dXJuIG5ldyBEaW1lbnNpb24yKCB0aGlzLmhlaWdodCwgdGhpcy53aWR0aCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIEJvdW5kczIgZnJvbSB0aGlzIGRpbWVuc2lvbiBiYXNlZCBvbiBwYXNzaW5nIGluIHRoZSBtaW5pbXVtICh0b3AtbGVmdCkgY29ybmVyIGFzICh4LHkpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbeF0gLSBNaW5pbXVtIHggY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLCBvciAwIGlmIG5vdCBwcm92aWRlZC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gW3ldIC0gTWluaW11bSB5IGNvb3JkaW5hdGUgb2YgdGhlIGJvdW5kcywgb3IgMCBpZiBub3QgcHJvdmlkZWQuXHJcbiAgICogQHJldHVybnMge0JvdW5kczJ9XHJcbiAgICovXHJcbiAgdG9Cb3VuZHMoIHgsIHkgKSB7XHJcbiAgICB4ID0geCAhPT0gdW5kZWZpbmVkID8geCA6IDA7XHJcbiAgICB5ID0geSAhPT0gdW5kZWZpbmVkID8geSA6IDA7XHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczIoIHgsIHksIHRoaXMud2lkdGggKyB4LCB0aGlzLmhlaWdodCArIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4YWN0IGVxdWFsaXR5IGNvbXBhcmlzb24gYmV0d2VlbiB0aGlzIGRpbWVuc2lvbiBhbmQgYW5vdGhlciBkaW1lbnNpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEaW1lbnNpb24yfSBvdGhlclxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIHR3byBkaW1lbnNpb25zIGhhdmUgZXF1YWwgd2lkdGggYW5kIGhlaWdodFxyXG4gICAqL1xyXG4gIGVxdWFscyggb3RoZXIgKSB7XHJcbiAgICByZXR1cm4gdGhpcy53aWR0aCA9PT0gb3RoZXIud2lkdGggJiYgdGhpcy5oZWlnaHQgPT09IG90aGVyLmhlaWdodDtcclxuICB9XHJcbn1cclxuXHJcbmRvdC5yZWdpc3RlciggJ0RpbWVuc2lvbjInLCBEaW1lbnNpb24yICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEaW1lbnNpb24yOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sY0FBYztBQUNsQyxPQUFPQyxHQUFHLE1BQU0sVUFBVTtBQUUxQixNQUFNQyxVQUFVLENBQUM7RUFDZjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLE1BQU0sRUFBRztJQUMzQjtJQUNBLElBQUksQ0FBQ0QsS0FBSyxHQUFHQSxLQUFLOztJQUVsQjtJQUNBLElBQUksQ0FBQ0MsTUFBTSxHQUFHQSxNQUFNO0VBQ3RCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxRQUFRQSxDQUFBLEVBQUc7SUFDVCxPQUFRLElBQUcsSUFBSSxDQUFDRixLQUFNLE1BQUssSUFBSSxDQUFDQyxNQUFPLElBQUc7RUFDNUM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsR0FBR0EsQ0FBRUMsU0FBUyxFQUFHO0lBQ2YsSUFBSSxDQUFDSixLQUFLLEdBQUdJLFNBQVMsQ0FBQ0osS0FBSztJQUM1QixJQUFJLENBQUNDLE1BQU0sR0FBR0csU0FBUyxDQUFDSCxNQUFNO0lBQzlCLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLFFBQVFBLENBQUVMLEtBQUssRUFBRztJQUNoQixJQUFJLENBQUNBLEtBQUssR0FBR0EsS0FBSztJQUNsQixPQUFPLElBQUk7RUFDYjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFTSxTQUFTQSxDQUFFTCxNQUFNLEVBQUc7SUFDbEIsSUFBSSxDQUFDQSxNQUFNLEdBQUdBLE1BQU07SUFDcEIsT0FBTyxJQUFJO0VBQ2I7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFTSxJQUFJQSxDQUFFSCxTQUFTLEVBQUc7SUFDaEIsSUFBS0EsU0FBUyxFQUFHO01BQ2YsT0FBT0EsU0FBUyxDQUFDRCxHQUFHLENBQUUsSUFBSyxDQUFDO0lBQzlCLENBQUMsTUFDSTtNQUNILE9BQU8sSUFBSUwsVUFBVSxDQUFFLElBQUksQ0FBQ0UsS0FBSyxFQUFFLElBQUksQ0FBQ0MsTUFBTyxDQUFDO0lBQ2xEO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFTyxPQUFPQSxDQUFBLEVBQUc7SUFDUixPQUFPLElBQUlWLFVBQVUsQ0FBRSxJQUFJLENBQUNHLE1BQU0sRUFBRSxJQUFJLENBQUNELEtBQU0sQ0FBQztFQUNsRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VTLFFBQVFBLENBQUVDLENBQUMsRUFBRUMsQ0FBQyxFQUFHO0lBQ2ZELENBQUMsR0FBR0EsQ0FBQyxLQUFLRSxTQUFTLEdBQUdGLENBQUMsR0FBRyxDQUFDO0lBQzNCQyxDQUFDLEdBQUdBLENBQUMsS0FBS0MsU0FBUyxHQUFHRCxDQUFDLEdBQUcsQ0FBQztJQUMzQixPQUFPLElBQUlmLE9BQU8sQ0FBRWMsQ0FBQyxFQUFFQyxDQUFDLEVBQUUsSUFBSSxDQUFDWCxLQUFLLEdBQUdVLENBQUMsRUFBRSxJQUFJLENBQUNULE1BQU0sR0FBR1UsQ0FBRSxDQUFDO0VBQzdEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLE1BQU1BLENBQUVDLEtBQUssRUFBRztJQUNkLE9BQU8sSUFBSSxDQUFDZCxLQUFLLEtBQUtjLEtBQUssQ0FBQ2QsS0FBSyxJQUFJLElBQUksQ0FBQ0MsTUFBTSxLQUFLYSxLQUFLLENBQUNiLE1BQU07RUFDbkU7QUFDRjtBQUVBSixHQUFHLENBQUNrQixRQUFRLENBQUUsWUFBWSxFQUFFakIsVUFBVyxDQUFDO0FBRXhDLGVBQWVBLFVBQVUifQ==