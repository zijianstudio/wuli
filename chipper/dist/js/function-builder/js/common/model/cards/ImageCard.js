// Copyright 2016-2023, University of Colorado Boulder

/**
 * A card with an image on it.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import functionBuilder from '../../../functionBuilder.js';
import FBCanvasUtils from '../../../patterns/model/FBCanvasUtils.js';
import Card from './Card.js';
export default class ImageCard extends Card {
  /**
   * @param {HTMLImageElement} image - the input image
   * @param {Object} [options]
   */
  constructor(image, options) {
    super(options);

    // {HTMLCanvasElement} @public (read-only)
    this.image = image;

    // @private created on demand by getCanvas
    this._canvas = null;
  }

  /**
   * Gets the card's image as a canvas, so that it can be transformed by image functions.
   * The canvas is created on demand.
   * @returns {HTMLCanvasElement}
   * @public
   */
  getCanvas() {
    if (!this._canvas) {
      this._canvas = FBCanvasUtils.createCanvasWithImage(this.image);
    }
    return this._canvas;
  }
  get canvas() {
    return this.getCanvas();
  }
}
functionBuilder.register('ImageCard', ImageCard);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmdW5jdGlvbkJ1aWxkZXIiLCJGQkNhbnZhc1V0aWxzIiwiQ2FyZCIsIkltYWdlQ2FyZCIsImNvbnN0cnVjdG9yIiwiaW1hZ2UiLCJvcHRpb25zIiwiX2NhbnZhcyIsImdldENhbnZhcyIsImNyZWF0ZUNhbnZhc1dpdGhJbWFnZSIsImNhbnZhcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSW1hZ2VDYXJkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgY2FyZCB3aXRoIGFuIGltYWdlIG9uIGl0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBmdW5jdGlvbkJ1aWxkZXIgZnJvbSAnLi4vLi4vLi4vZnVuY3Rpb25CdWlsZGVyLmpzJztcclxuaW1wb3J0IEZCQ2FudmFzVXRpbHMgZnJvbSAnLi4vLi4vLi4vcGF0dGVybnMvbW9kZWwvRkJDYW52YXNVdGlscy5qcyc7XHJcbmltcG9ydCBDYXJkIGZyb20gJy4vQ2FyZC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbWFnZUNhcmQgZXh0ZW5kcyBDYXJkIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtIVE1MSW1hZ2VFbGVtZW50fSBpbWFnZSAtIHRoZSBpbnB1dCBpbWFnZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaW1hZ2UsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyB7SFRNTENhbnZhc0VsZW1lbnR9IEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSBjcmVhdGVkIG9uIGRlbWFuZCBieSBnZXRDYW52YXNcclxuICAgIHRoaXMuX2NhbnZhcyA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBjYXJkJ3MgaW1hZ2UgYXMgYSBjYW52YXMsIHNvIHRoYXQgaXQgY2FuIGJlIHRyYW5zZm9ybWVkIGJ5IGltYWdlIGZ1bmN0aW9ucy5cclxuICAgKiBUaGUgY2FudmFzIGlzIGNyZWF0ZWQgb24gZGVtYW5kLlxyXG4gICAqIEByZXR1cm5zIHtIVE1MQ2FudmFzRWxlbWVudH1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Q2FudmFzKCkge1xyXG4gICAgaWYgKCAhdGhpcy5fY2FudmFzICkge1xyXG4gICAgICB0aGlzLl9jYW52YXMgPSBGQkNhbnZhc1V0aWxzLmNyZWF0ZUNhbnZhc1dpdGhJbWFnZSggdGhpcy5pbWFnZSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX2NhbnZhcztcclxuICB9XHJcblxyXG4gIGdldCBjYW52YXMoKSB7IHJldHVybiB0aGlzLmdldENhbnZhcygpOyB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uQnVpbGRlci5yZWdpc3RlciggJ0ltYWdlQ2FyZCcsIEltYWdlQ2FyZCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sNkJBQTZCO0FBQ3pELE9BQU9DLGFBQWEsTUFBTSwwQ0FBMEM7QUFDcEUsT0FBT0MsSUFBSSxNQUFNLFdBQVc7QUFFNUIsZUFBZSxNQUFNQyxTQUFTLFNBQVNELElBQUksQ0FBQztFQUUxQztBQUNGO0FBQ0E7QUFDQTtFQUNFRSxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLE9BQU8sRUFBRztJQUU1QixLQUFLLENBQUVBLE9BQVEsQ0FBQzs7SUFFaEI7SUFDQSxJQUFJLENBQUNELEtBQUssR0FBR0EsS0FBSzs7SUFFbEI7SUFDQSxJQUFJLENBQUNFLE9BQU8sR0FBRyxJQUFJO0VBQ3JCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxTQUFTQSxDQUFBLEVBQUc7SUFDVixJQUFLLENBQUMsSUFBSSxDQUFDRCxPQUFPLEVBQUc7TUFDbkIsSUFBSSxDQUFDQSxPQUFPLEdBQUdOLGFBQWEsQ0FBQ1EscUJBQXFCLENBQUUsSUFBSSxDQUFDSixLQUFNLENBQUM7SUFDbEU7SUFDQSxPQUFPLElBQUksQ0FBQ0UsT0FBTztFQUNyQjtFQUVBLElBQUlHLE1BQU1BLENBQUEsRUFBRztJQUFFLE9BQU8sSUFBSSxDQUFDRixTQUFTLENBQUMsQ0FBQztFQUFFO0FBQzFDO0FBRUFSLGVBQWUsQ0FBQ1csUUFBUSxDQUFFLFdBQVcsRUFBRVIsU0FBVSxDQUFDIn0=