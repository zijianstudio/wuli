// Copyright 2017-2023, University of Colorado Boulder

/**
 * A directed set of half-edges determined by how the original shapes/subpaths were directionally. This is distinct from
 * boundaries, as:
 * 1. Input shapes/subpaths can self-intersect, ignore clockwise restrictions, and avoid boundary restrictions.
 * 2. Input shapes/subpaths can repeat over the same edges multiple times (affecting winding order), and can even
 *    double-back or do other operations.
 * 3. We need to record separate shape IDs for the different loops, so we can perform CAG operations on separate ones.
 *    This means we need to track winding order separately for each ID.
 *
 * As operations simplify/remove/replace edges, it will handle replacement of the edges in the loops.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import cleanArray from '../../../phet-core/js/cleanArray.js';
import Pool from '../../../phet-core/js/Pool.js';
import { kite, Subpath } from '../imports.js';
let globaId = 0;
class Loop {
  /**
   * @public (kite-internal)
   *
   * NOTE: Use Loop.pool.create for most usage instead of using the constructor directly.
   *
   * @param {number} shapeId
   * @param {boolean} closed
   */
  constructor(shapeId, closed) {
    // @public {number}
    this.id = ++globaId;

    // NOTE: most object properties are declared/documented in the initialize method. Please look there for most
    // definitions.
    this.initialize(shapeId, closed);
  }

  /**
   * Similar to a usual constructor, but is set up so it can be called multiple times (with dispose() in-between) to
   * support pooling.
   * @private
   *
   * @param {number} shapeId
   * @param {boolean} closed
   * @returns {Loop} - This reference for chaining
   */
  initialize(shapeId, closed) {
    assert && assert(typeof shapeId === 'number');
    assert && assert(typeof closed === 'boolean');

    // @public {number}
    this.shapeId = shapeId;

    // @public {boolean}
    this.closed = closed;

    // @public {Array.<HalfEdge>}
    this.halfEdges = cleanArray(this.halfEdges);
    return this;
  }

  /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   * @public
   *
   * @returns {Object}
   */
  serialize() {
    return {
      type: 'Loop',
      id: this.id,
      shapeId: this.shapeId,
      closed: this.closed,
      halfEdges: this.halfEdges.map(halfEdge => halfEdge.id)
    };
  }

  /**
   * Returns a Subpath equivalent to this loop.
   * @public
   *
   * @returns {Subpath}
   */
  toSubpath() {
    const segments = [];
    for (let i = 0; i < this.halfEdges.length; i++) {
      segments.push(this.halfEdges[i].getDirectionalSegment());
    }
    return new Subpath(segments, undefined, this.closed);
  }

  /**
   * Removes references (so it can allow other objects to be GC'ed or pooled), and frees itself to the pool so it
   * can be reused.
   * @public
   */
  dispose() {
    cleanArray(this.halfEdges);
    this.freeToPool();
  }

  // @public
  freeToPool() {
    Loop.pool.freeToPool(this);
  }

  // @public
  static pool = new Pool(Loop);
}
kite.register('Loop', Loop);
export default Loop;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjbGVhbkFycmF5IiwiUG9vbCIsImtpdGUiLCJTdWJwYXRoIiwiZ2xvYmFJZCIsIkxvb3AiLCJjb25zdHJ1Y3RvciIsInNoYXBlSWQiLCJjbG9zZWQiLCJpZCIsImluaXRpYWxpemUiLCJhc3NlcnQiLCJoYWxmRWRnZXMiLCJzZXJpYWxpemUiLCJ0eXBlIiwibWFwIiwiaGFsZkVkZ2UiLCJ0b1N1YnBhdGgiLCJzZWdtZW50cyIsImkiLCJsZW5ndGgiLCJwdXNoIiwiZ2V0RGlyZWN0aW9uYWxTZWdtZW50IiwidW5kZWZpbmVkIiwiZGlzcG9zZSIsImZyZWVUb1Bvb2wiLCJwb29sIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMb29wLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgZGlyZWN0ZWQgc2V0IG9mIGhhbGYtZWRnZXMgZGV0ZXJtaW5lZCBieSBob3cgdGhlIG9yaWdpbmFsIHNoYXBlcy9zdWJwYXRocyB3ZXJlIGRpcmVjdGlvbmFsbHkuIFRoaXMgaXMgZGlzdGluY3QgZnJvbVxyXG4gKiBib3VuZGFyaWVzLCBhczpcclxuICogMS4gSW5wdXQgc2hhcGVzL3N1YnBhdGhzIGNhbiBzZWxmLWludGVyc2VjdCwgaWdub3JlIGNsb2Nrd2lzZSByZXN0cmljdGlvbnMsIGFuZCBhdm9pZCBib3VuZGFyeSByZXN0cmljdGlvbnMuXHJcbiAqIDIuIElucHV0IHNoYXBlcy9zdWJwYXRocyBjYW4gcmVwZWF0IG92ZXIgdGhlIHNhbWUgZWRnZXMgbXVsdGlwbGUgdGltZXMgKGFmZmVjdGluZyB3aW5kaW5nIG9yZGVyKSwgYW5kIGNhbiBldmVuXHJcbiAqICAgIGRvdWJsZS1iYWNrIG9yIGRvIG90aGVyIG9wZXJhdGlvbnMuXHJcbiAqIDMuIFdlIG5lZWQgdG8gcmVjb3JkIHNlcGFyYXRlIHNoYXBlIElEcyBmb3IgdGhlIGRpZmZlcmVudCBsb29wcywgc28gd2UgY2FuIHBlcmZvcm0gQ0FHIG9wZXJhdGlvbnMgb24gc2VwYXJhdGUgb25lcy5cclxuICogICAgVGhpcyBtZWFucyB3ZSBuZWVkIHRvIHRyYWNrIHdpbmRpbmcgb3JkZXIgc2VwYXJhdGVseSBmb3IgZWFjaCBJRC5cclxuICpcclxuICogQXMgb3BlcmF0aW9ucyBzaW1wbGlmeS9yZW1vdmUvcmVwbGFjZSBlZGdlcywgaXQgd2lsbCBoYW5kbGUgcmVwbGFjZW1lbnQgb2YgdGhlIGVkZ2VzIGluIHRoZSBsb29wcy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBjbGVhbkFycmF5IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5LmpzJztcclxuaW1wb3J0IFBvb2wgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xyXG5pbXBvcnQgeyBraXRlLCBTdWJwYXRoIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5sZXQgZ2xvYmFJZCA9IDA7XHJcblxyXG5jbGFzcyBMb29wIHtcclxuICAvKipcclxuICAgKiBAcHVibGljIChraXRlLWludGVybmFsKVxyXG4gICAqXHJcbiAgICogTk9URTogVXNlIExvb3AucG9vbC5jcmVhdGUgZm9yIG1vc3QgdXNhZ2UgaW5zdGVhZCBvZiB1c2luZyB0aGUgY29uc3RydWN0b3IgZGlyZWN0bHkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2hhcGVJZFxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gY2xvc2VkXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHNoYXBlSWQsIGNsb3NlZCApIHtcclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMuaWQgPSArK2dsb2JhSWQ7XHJcblxyXG4gICAgLy8gTk9URTogbW9zdCBvYmplY3QgcHJvcGVydGllcyBhcmUgZGVjbGFyZWQvZG9jdW1lbnRlZCBpbiB0aGUgaW5pdGlhbGl6ZSBtZXRob2QuIFBsZWFzZSBsb29rIHRoZXJlIGZvciBtb3N0XHJcbiAgICAvLyBkZWZpbml0aW9ucy5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZSggc2hhcGVJZCwgY2xvc2VkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaW1pbGFyIHRvIGEgdXN1YWwgY29uc3RydWN0b3IsIGJ1dCBpcyBzZXQgdXAgc28gaXQgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyAod2l0aCBkaXNwb3NlKCkgaW4tYmV0d2VlbikgdG9cclxuICAgKiBzdXBwb3J0IHBvb2xpbmcuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaGFwZUlkXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBjbG9zZWRcclxuICAgKiBAcmV0dXJucyB7TG9vcH0gLSBUaGlzIHJlZmVyZW5jZSBmb3IgY2hhaW5pbmdcclxuICAgKi9cclxuICBpbml0aWFsaXplKCBzaGFwZUlkLCBjbG9zZWQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygc2hhcGVJZCA9PT0gJ251bWJlcicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjbG9zZWQgPT09ICdib29sZWFuJyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMuc2hhcGVJZCA9IHNoYXBlSWQ7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn1cclxuICAgIHRoaXMuY2xvc2VkID0gY2xvc2VkO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxIYWxmRWRnZT59XHJcbiAgICB0aGlzLmhhbGZFZGdlcyA9IGNsZWFuQXJyYXkoIHRoaXMuaGFsZkVkZ2VzICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIG9iamVjdCBmb3JtIHRoYXQgY2FuIGJlIHR1cm5lZCBiYWNrIGludG8gYSBzZWdtZW50IHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgZGVzZXJpYWxpemUgbWV0aG9kLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAgICovXHJcbiAgc2VyaWFsaXplKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogJ0xvb3AnLFxyXG4gICAgICBpZDogdGhpcy5pZCxcclxuICAgICAgc2hhcGVJZDogdGhpcy5zaGFwZUlkLFxyXG4gICAgICBjbG9zZWQ6IHRoaXMuY2xvc2VkLFxyXG4gICAgICBoYWxmRWRnZXM6IHRoaXMuaGFsZkVkZ2VzLm1hcCggaGFsZkVkZ2UgPT4gaGFsZkVkZ2UuaWQgKVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBTdWJwYXRoIGVxdWl2YWxlbnQgdG8gdGhpcyBsb29wLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTdWJwYXRofVxyXG4gICAqL1xyXG4gIHRvU3VicGF0aCgpIHtcclxuICAgIGNvbnN0IHNlZ21lbnRzID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmhhbGZFZGdlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgc2VnbWVudHMucHVzaCggdGhpcy5oYWxmRWRnZXNbIGkgXS5nZXREaXJlY3Rpb25hbFNlZ21lbnQoKSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBTdWJwYXRoKCBzZWdtZW50cywgdW5kZWZpbmVkLCB0aGlzLmNsb3NlZCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyByZWZlcmVuY2VzIChzbyBpdCBjYW4gYWxsb3cgb3RoZXIgb2JqZWN0cyB0byBiZSBHQydlZCBvciBwb29sZWQpLCBhbmQgZnJlZXMgaXRzZWxmIHRvIHRoZSBwb29sIHNvIGl0XHJcbiAgICogY2FuIGJlIHJldXNlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIGNsZWFuQXJyYXkoIHRoaXMuaGFsZkVkZ2VzICk7XHJcbiAgICB0aGlzLmZyZWVUb1Bvb2woKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBmcmVlVG9Qb29sKCkge1xyXG4gICAgTG9vcC5wb29sLmZyZWVUb1Bvb2woIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBzdGF0aWMgcG9vbCA9IG5ldyBQb29sKCBMb29wICk7XHJcbn1cclxuXHJcbmtpdGUucmVnaXN0ZXIoICdMb29wJywgTG9vcCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTG9vcDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxxQ0FBcUM7QUFDNUQsT0FBT0MsSUFBSSxNQUFNLCtCQUErQjtBQUNoRCxTQUFTQyxJQUFJLEVBQUVDLE9BQU8sUUFBUSxlQUFlO0FBRTdDLElBQUlDLE9BQU8sR0FBRyxDQUFDO0FBRWYsTUFBTUMsSUFBSSxDQUFDO0VBQ1Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxPQUFPLEVBQUVDLE1BQU0sRUFBRztJQUM3QjtJQUNBLElBQUksQ0FBQ0MsRUFBRSxHQUFHLEVBQUVMLE9BQU87O0lBRW5CO0lBQ0E7SUFDQSxJQUFJLENBQUNNLFVBQVUsQ0FBRUgsT0FBTyxFQUFFQyxNQUFPLENBQUM7RUFDcEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLFVBQVVBLENBQUVILE9BQU8sRUFBRUMsTUFBTSxFQUFHO0lBQzVCRyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPSixPQUFPLEtBQUssUUFBUyxDQUFDO0lBQy9DSSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPSCxNQUFNLEtBQUssU0FBVSxDQUFDOztJQUUvQztJQUNBLElBQUksQ0FBQ0QsT0FBTyxHQUFHQSxPQUFPOztJQUV0QjtJQUNBLElBQUksQ0FBQ0MsTUFBTSxHQUFHQSxNQUFNOztJQUVwQjtJQUNBLElBQUksQ0FBQ0ksU0FBUyxHQUFHWixVQUFVLENBQUUsSUFBSSxDQUFDWSxTQUFVLENBQUM7SUFFN0MsT0FBTyxJQUFJO0VBQ2I7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFNBQVNBLENBQUEsRUFBRztJQUNWLE9BQU87TUFDTEMsSUFBSSxFQUFFLE1BQU07TUFDWkwsRUFBRSxFQUFFLElBQUksQ0FBQ0EsRUFBRTtNQUNYRixPQUFPLEVBQUUsSUFBSSxDQUFDQSxPQUFPO01BQ3JCQyxNQUFNLEVBQUUsSUFBSSxDQUFDQSxNQUFNO01BQ25CSSxTQUFTLEVBQUUsSUFBSSxDQUFDQSxTQUFTLENBQUNHLEdBQUcsQ0FBRUMsUUFBUSxJQUFJQSxRQUFRLENBQUNQLEVBQUc7SUFDekQsQ0FBQztFQUNIOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFUSxTQUFTQSxDQUFBLEVBQUc7SUFDVixNQUFNQyxRQUFRLEdBQUcsRUFBRTtJQUNuQixLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNQLFNBQVMsQ0FBQ1EsTUFBTSxFQUFFRCxDQUFDLEVBQUUsRUFBRztNQUNoREQsUUFBUSxDQUFDRyxJQUFJLENBQUUsSUFBSSxDQUFDVCxTQUFTLENBQUVPLENBQUMsQ0FBRSxDQUFDRyxxQkFBcUIsQ0FBQyxDQUFFLENBQUM7SUFDOUQ7SUFDQSxPQUFPLElBQUluQixPQUFPLENBQUVlLFFBQVEsRUFBRUssU0FBUyxFQUFFLElBQUksQ0FBQ2YsTUFBTyxDQUFDO0VBQ3hEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRWdCLE9BQU9BLENBQUEsRUFBRztJQUNSeEIsVUFBVSxDQUFFLElBQUksQ0FBQ1ksU0FBVSxDQUFDO0lBQzVCLElBQUksQ0FBQ2EsVUFBVSxDQUFDLENBQUM7RUFDbkI7O0VBRUE7RUFDQUEsVUFBVUEsQ0FBQSxFQUFHO0lBQ1hwQixJQUFJLENBQUNxQixJQUFJLENBQUNELFVBQVUsQ0FBRSxJQUFLLENBQUM7RUFDOUI7O0VBRUE7RUFDQSxPQUFPQyxJQUFJLEdBQUcsSUFBSXpCLElBQUksQ0FBRUksSUFBSyxDQUFDO0FBQ2hDO0FBRUFILElBQUksQ0FBQ3lCLFFBQVEsQ0FBRSxNQUFNLEVBQUV0QixJQUFLLENBQUM7QUFFN0IsZUFBZUEsSUFBSSJ9