// Copyright 2020-2021, University of Colorado Boulder

/**
 * Data structure that handles creating/destroying related objects that need to exist when something's count is >=1
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Poolable from '../../../phet-core/js/Poolable.js';
import { scenery } from '../imports.js';
class CountMap {
  /**
   * @param {function(*):*} create
   * @param {function(*,*)} destroy
   */
  constructor(create, destroy) {
    // @private
    this.create = create;
    this.destroy = destroy;

    // @private {Map.<*,Entry>}
    this.map = new Map();
  }

  /**
   * @public
   *
   * @param {*} key
   * @param {number} [quantity]
   */
  increment(key, quantity = 1) {
    assert && assert(typeof quantity === 'number');
    assert && assert(quantity >= 1);
    if (this.map.has(key)) {
      this.map.get(key).count += quantity;
    } else {
      const value = this.create(key);
      const entry = CountMapEntry.createFromPool(quantity, key, value);
      this.map.set(key, entry);
    }
  }

  /**
   * @public
   *
   * @param {*} key
   * @param {number} [quantity]
   */
  decrement(key, quantity = 1) {
    assert && assert(typeof quantity === 'number');
    assert && assert(quantity >= 1);
    const entry = this.map.get(key);

    // Was an old comment of
    // > since the block may have been disposed (yikes!), we have a defensive set-up here
    // So we're playing it extra defensive here for now
    if (entry) {
      entry.count -= quantity;
      if (entry.count < 1) {
        this.destroy(key, entry.value);
        this.map.delete(key);
        entry.dispose();
      }
    }
  }

  /**
   * @public
   *
   * @param {*} key
   * @returns {*}
   */
  get(key) {
    return this.map.get(key).value;
  }

  /**
   * @public
   *
   * NOTE: We COULD try to collect all of the CountMapEntries... but that seems like an awful lot of CPU.
   * If GC is an issue from this, we can add more logic
   */
  clear() {
    this.map.clear();
  }
}
class CountMapEntry {
  /**
   * @param {number} count
   * @param {*} key
   * @param {*} value
   */
  constructor(count, key, value) {
    this.initialize(count, key, value);
  }

  /**
   * @public
   *
   * @param {number} count
   * @param {*} key
   * @param {*} value
   */
  initialize(count, key, value) {
    // @public {number}
    this.count = count;

    // @public {*}
    this.key = key;
    this.value = value;
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    // Null things out, to prevent leaks (in case)
    this.key = null;
    this.value = null;
    this.freeToPool();
  }
}
Poolable.mixInto(CountMapEntry, {
  initialize: CountMapEntry.prototype.initialize
});
scenery.register('CountMap', CountMap);
export default CountMap;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQb29sYWJsZSIsInNjZW5lcnkiLCJDb3VudE1hcCIsImNvbnN0cnVjdG9yIiwiY3JlYXRlIiwiZGVzdHJveSIsIm1hcCIsIk1hcCIsImluY3JlbWVudCIsImtleSIsInF1YW50aXR5IiwiYXNzZXJ0IiwiaGFzIiwiZ2V0IiwiY291bnQiLCJ2YWx1ZSIsImVudHJ5IiwiQ291bnRNYXBFbnRyeSIsImNyZWF0ZUZyb21Qb29sIiwic2V0IiwiZGVjcmVtZW50IiwiZGVsZXRlIiwiZGlzcG9zZSIsImNsZWFyIiwiaW5pdGlhbGl6ZSIsImZyZWVUb1Bvb2wiLCJtaXhJbnRvIiwicHJvdG90eXBlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb3VudE1hcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEYXRhIHN0cnVjdHVyZSB0aGF0IGhhbmRsZXMgY3JlYXRpbmcvZGVzdHJveWluZyByZWxhdGVkIG9iamVjdHMgdGhhdCBuZWVkIHRvIGV4aXN0IHdoZW4gc29tZXRoaW5nJ3MgY291bnQgaXMgPj0xXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcclxuaW1wb3J0IHsgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxuY2xhc3MgQ291bnRNYXAge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKik6Kn0gY3JlYXRlXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbigqLCopfSBkZXN0cm95XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNyZWF0ZSwgZGVzdHJveSApIHtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5jcmVhdGUgPSBjcmVhdGU7XHJcbiAgICB0aGlzLmRlc3Ryb3kgPSBkZXN0cm95O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtNYXAuPCosRW50cnk+fVxyXG4gICAgdGhpcy5tYXAgPSBuZXcgTWFwKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0geyp9IGtleVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbcXVhbnRpdHldXHJcbiAgICovXHJcbiAgaW5jcmVtZW50KCBrZXksIHF1YW50aXR5ID0gMSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBxdWFudGl0eSA9PT0gJ251bWJlcicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHF1YW50aXR5ID49IDEgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMubWFwLmhhcygga2V5ICkgKSB7XHJcbiAgICAgIHRoaXMubWFwLmdldCgga2V5ICkuY291bnQgKz0gcXVhbnRpdHk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmNyZWF0ZSgga2V5ICk7XHJcbiAgICAgIGNvbnN0IGVudHJ5ID0gQ291bnRNYXBFbnRyeS5jcmVhdGVGcm9tUG9vbCggcXVhbnRpdHksIGtleSwgdmFsdWUgKTtcclxuICAgICAgdGhpcy5tYXAuc2V0KCBrZXksIGVudHJ5ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0geyp9IGtleVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbcXVhbnRpdHldXHJcbiAgICovXHJcbiAgZGVjcmVtZW50KCBrZXksIHF1YW50aXR5ID0gMSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBxdWFudGl0eSA9PT0gJ251bWJlcicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHF1YW50aXR5ID49IDEgKTtcclxuXHJcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMubWFwLmdldCgga2V5ICk7XHJcblxyXG4gICAgLy8gV2FzIGFuIG9sZCBjb21tZW50IG9mXHJcbiAgICAvLyA+IHNpbmNlIHRoZSBibG9jayBtYXkgaGF2ZSBiZWVuIGRpc3Bvc2VkICh5aWtlcyEpLCB3ZSBoYXZlIGEgZGVmZW5zaXZlIHNldC11cCBoZXJlXHJcbiAgICAvLyBTbyB3ZSdyZSBwbGF5aW5nIGl0IGV4dHJhIGRlZmVuc2l2ZSBoZXJlIGZvciBub3dcclxuICAgIGlmICggZW50cnkgKSB7XHJcbiAgICAgIGVudHJ5LmNvdW50IC09IHF1YW50aXR5O1xyXG4gICAgICBpZiAoIGVudHJ5LmNvdW50IDwgMSApIHtcclxuICAgICAgICB0aGlzLmRlc3Ryb3koIGtleSwgZW50cnkudmFsdWUgKTtcclxuICAgICAgICB0aGlzLm1hcC5kZWxldGUoIGtleSApO1xyXG4gICAgICAgIGVudHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHsqfSBrZXlcclxuICAgKiBAcmV0dXJucyB7Kn1cclxuICAgKi9cclxuICBnZXQoIGtleSApIHtcclxuICAgIHJldHVybiB0aGlzLm1hcC5nZXQoIGtleSApLnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogTk9URTogV2UgQ09VTEQgdHJ5IHRvIGNvbGxlY3QgYWxsIG9mIHRoZSBDb3VudE1hcEVudHJpZXMuLi4gYnV0IHRoYXQgc2VlbXMgbGlrZSBhbiBhd2Z1bCBsb3Qgb2YgQ1BVLlxyXG4gICAqIElmIEdDIGlzIGFuIGlzc3VlIGZyb20gdGhpcywgd2UgY2FuIGFkZCBtb3JlIGxvZ2ljXHJcbiAgICovXHJcbiAgY2xlYXIoKSB7XHJcbiAgICB0aGlzLm1hcC5jbGVhcigpO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgQ291bnRNYXBFbnRyeSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvdW50XHJcbiAgICogQHBhcmFtIHsqfSBrZXlcclxuICAgKiBAcGFyYW0geyp9IHZhbHVlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNvdW50LCBrZXksIHZhbHVlICkge1xyXG4gICAgdGhpcy5pbml0aWFsaXplKCBjb3VudCwga2V5LCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvdW50XHJcbiAgICogQHBhcmFtIHsqfSBrZXlcclxuICAgKiBAcGFyYW0geyp9IHZhbHVlXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZSggY291bnQsIGtleSwgdmFsdWUgKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5jb3VudCA9IGNvdW50O1xyXG5cclxuICAgIC8vIEBwdWJsaWMgeyp9XHJcbiAgICB0aGlzLmtleSA9IGtleTtcclxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIC8vIE51bGwgdGhpbmdzIG91dCwgdG8gcHJldmVudCBsZWFrcyAoaW4gY2FzZSlcclxuICAgIHRoaXMua2V5ID0gbnVsbDtcclxuICAgIHRoaXMudmFsdWUgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xyXG4gIH1cclxufVxyXG5cclxuUG9vbGFibGUubWl4SW50byggQ291bnRNYXBFbnRyeSwge1xyXG4gIGluaXRpYWxpemU6IENvdW50TWFwRW50cnkucHJvdG90eXBlLmluaXRpYWxpemVcclxufSApO1xyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0NvdW50TWFwJywgQ291bnRNYXAgKTtcclxuZXhwb3J0IGRlZmF1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