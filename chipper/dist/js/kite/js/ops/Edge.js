// Copyright 2017-2023, University of Colorado Boulder

/**
 * Represents a segment in the graph (connects to vertices on both ends)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Pool from '../../../phet-core/js/Pool.js';
import { HalfEdge, kite, Line, Segment, Vertex } from '../imports.js';
let globaId = 0;
class Edge {
  /**
   * @public (kite-internal)
   *
   * NOTE: Use Edge.pool.create for most usage instead of using the constructor directly.
   *
   * @param {Segment} segment
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   */
  constructor(segment, startVertex, endVertex) {
    // @public {number}
    this.id = ++globaId;

    // NOTE: most object properties are declared/documented in the initialize method. Please look there for most
    // definitions.
    this.initialize(segment, startVertex, endVertex);
  }

  /**
   * Similar to a usual constructor, but is set up so it can be called multiple times (with dispose() in-between) to
   * support pooling.
   * @private
   *
   * @param {Segment} segment
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @returns {Edge} - This reference for chaining
   */
  initialize(segment, startVertex, endVertex) {
    assert && assert(segment instanceof Segment);
    assert && assert(startVertex instanceof Vertex);
    assert && assert(endVertex instanceof Vertex);
    assert && assert(segment.start.distance(startVertex.point) < 1e-3);
    assert && assert(segment.end.distance(endVertex.point) < 1e-3);

    // @public {Segment|null} - Null when disposed (in pool)
    this.segment = segment;

    // @public {Vertex|null} - Null when disposed (in pool)
    this.startVertex = startVertex;
    this.endVertex = endVertex;

    // @public {number}
    this.signedAreaFragment = segment.getSignedAreaFragment();

    // @public {HalfEdge|null} - Null when disposed (in pool)
    this.forwardHalf = HalfEdge.pool.create(this, false);
    this.reversedHalf = HalfEdge.pool.create(this, true);

    // @public {boolean} - Used for depth-first search
    this.visited = false;

    // @public {*} - Available for arbitrary client usage. -- Keep JSONable
    this.data = null;

    // @public {*} - kite-internal
    this.internalData = {};
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
      type: 'Edge',
      id: this.id,
      segment: this.segment.serialize(),
      startVertex: this.startVertex === null ? null : this.startVertex.id,
      endVertex: this.endVertex === null ? null : this.endVertex.id,
      signedAreaFragment: this.signedAreaFragment,
      forwardHalf: this.forwardHalf.serialize(),
      reversedHalf: this.reversedHalf.serialize(),
      visited: this.visited,
      data: this.data
    };
  }

  /**
   * Removes references (so it can allow other objects to be GC'ed or pooled), and frees itself to the pool so it
   * can be reused.
   * @public
   */
  dispose() {
    this.segment = null;
    this.startVertex = null;
    this.endVertex = null;
    this.forwardHalf.dispose();
    this.reversedHalf.dispose();
    this.forwardHalf = null;
    this.reversedHalf = null;
    this.data = null;
    this.freeToPool();
  }

  /**
   * Returns the other vertex associated with an edge.
   * @public
   *
   * @param {Vertex} vertex
   * @returns {Vertex}
   */
  getOtherVertex(vertex) {
    assert && assert(vertex === this.startVertex || vertex === this.endVertex);
    return this.startVertex === vertex ? this.endVertex : this.startVertex;
  }

  /**
   * Update possibly reversed vertex references (since they may be updated)
   * @public
   */
  updateReferences() {
    this.forwardHalf.updateReferences();
    this.reversedHalf.updateReferences();
    assert && assert(!(this.segment instanceof Line) || this.startVertex !== this.endVertex, 'No line segments for same vertices');
  }

  // @public
  freeToPool() {
    Edge.pool.freeToPool(this);
  }

  // @public
  static pool = new Pool(Edge);
}
kite.register('Edge', Edge);
export default Edge;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQb29sIiwiSGFsZkVkZ2UiLCJraXRlIiwiTGluZSIsIlNlZ21lbnQiLCJWZXJ0ZXgiLCJnbG9iYUlkIiwiRWRnZSIsImNvbnN0cnVjdG9yIiwic2VnbWVudCIsInN0YXJ0VmVydGV4IiwiZW5kVmVydGV4IiwiaWQiLCJpbml0aWFsaXplIiwiYXNzZXJ0Iiwic3RhcnQiLCJkaXN0YW5jZSIsInBvaW50IiwiZW5kIiwic2lnbmVkQXJlYUZyYWdtZW50IiwiZ2V0U2lnbmVkQXJlYUZyYWdtZW50IiwiZm9yd2FyZEhhbGYiLCJwb29sIiwiY3JlYXRlIiwicmV2ZXJzZWRIYWxmIiwidmlzaXRlZCIsImRhdGEiLCJpbnRlcm5hbERhdGEiLCJzZXJpYWxpemUiLCJ0eXBlIiwiZGlzcG9zZSIsImZyZWVUb1Bvb2wiLCJnZXRPdGhlclZlcnRleCIsInZlcnRleCIsInVwZGF0ZVJlZmVyZW5jZXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVkZ2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBhIHNlZ21lbnQgaW4gdGhlIGdyYXBoIChjb25uZWN0cyB0byB2ZXJ0aWNlcyBvbiBib3RoIGVuZHMpXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgUG9vbCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbC5qcyc7XHJcbmltcG9ydCB7IEhhbGZFZGdlLCBraXRlLCBMaW5lLCBTZWdtZW50LCBWZXJ0ZXggfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbmxldCBnbG9iYUlkID0gMDtcclxuXHJcbmNsYXNzIEVkZ2Uge1xyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWMgKGtpdGUtaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBOT1RFOiBVc2UgRWRnZS5wb29sLmNyZWF0ZSBmb3IgbW9zdCB1c2FnZSBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBjb25zdHJ1Y3RvciBkaXJlY3RseS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2VnbWVudH0gc2VnbWVudFxyXG4gICAqIEBwYXJhbSB7VmVydGV4fSBzdGFydFZlcnRleFxyXG4gICAqIEBwYXJhbSB7VmVydGV4fSBlbmRWZXJ0ZXhcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2VnbWVudCwgc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCApIHtcclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMuaWQgPSArK2dsb2JhSWQ7XHJcblxyXG4gICAgLy8gTk9URTogbW9zdCBvYmplY3QgcHJvcGVydGllcyBhcmUgZGVjbGFyZWQvZG9jdW1lbnRlZCBpbiB0aGUgaW5pdGlhbGl6ZSBtZXRob2QuIFBsZWFzZSBsb29rIHRoZXJlIGZvciBtb3N0XHJcbiAgICAvLyBkZWZpbml0aW9ucy5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZSggc2VnbWVudCwgc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2ltaWxhciB0byBhIHVzdWFsIGNvbnN0cnVjdG9yLCBidXQgaXMgc2V0IHVwIHNvIGl0IGNhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgKHdpdGggZGlzcG9zZSgpIGluLWJldHdlZW4pIHRvXHJcbiAgICogc3VwcG9ydCBwb29saW5nLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NlZ21lbnR9IHNlZ21lbnRcclxuICAgKiBAcGFyYW0ge1ZlcnRleH0gc3RhcnRWZXJ0ZXhcclxuICAgKiBAcGFyYW0ge1ZlcnRleH0gZW5kVmVydGV4XHJcbiAgICogQHJldHVybnMge0VkZ2V9IC0gVGhpcyByZWZlcmVuY2UgZm9yIGNoYWluaW5nXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZSggc2VnbWVudCwgc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlZ21lbnQgaW5zdGFuY2VvZiBTZWdtZW50ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdGFydFZlcnRleCBpbnN0YW5jZW9mIFZlcnRleCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZW5kVmVydGV4IGluc3RhbmNlb2YgVmVydGV4ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWdtZW50LnN0YXJ0LmRpc3RhbmNlKCBzdGFydFZlcnRleC5wb2ludCApIDwgMWUtMyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2VnbWVudC5lbmQuZGlzdGFuY2UoIGVuZFZlcnRleC5wb2ludCApIDwgMWUtMyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1NlZ21lbnR8bnVsbH0gLSBOdWxsIHdoZW4gZGlzcG9zZWQgKGluIHBvb2wpXHJcbiAgICB0aGlzLnNlZ21lbnQgPSBzZWdtZW50O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1ZlcnRleHxudWxsfSAtIE51bGwgd2hlbiBkaXNwb3NlZCAoaW4gcG9vbClcclxuICAgIHRoaXMuc3RhcnRWZXJ0ZXggPSBzdGFydFZlcnRleDtcclxuICAgIHRoaXMuZW5kVmVydGV4ID0gZW5kVmVydGV4O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMuc2lnbmVkQXJlYUZyYWdtZW50ID0gc2VnbWVudC5nZXRTaWduZWRBcmVhRnJhZ21lbnQoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtIYWxmRWRnZXxudWxsfSAtIE51bGwgd2hlbiBkaXNwb3NlZCAoaW4gcG9vbClcclxuICAgIHRoaXMuZm9yd2FyZEhhbGYgPSBIYWxmRWRnZS5wb29sLmNyZWF0ZSggdGhpcywgZmFsc2UgKTtcclxuICAgIHRoaXMucmV2ZXJzZWRIYWxmID0gSGFsZkVkZ2UucG9vbC5jcmVhdGUoIHRoaXMsIHRydWUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIFVzZWQgZm9yIGRlcHRoLWZpcnN0IHNlYXJjaFxyXG4gICAgdGhpcy52aXNpdGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Kn0gLSBBdmFpbGFibGUgZm9yIGFyYml0cmFyeSBjbGllbnQgdXNhZ2UuIC0tIEtlZXAgSlNPTmFibGVcclxuICAgIHRoaXMuZGF0YSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Kn0gLSBraXRlLWludGVybmFsXHJcbiAgICB0aGlzLmludGVybmFsRGF0YSA9IHtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAqL1xyXG4gIHNlcmlhbGl6ZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6ICdFZGdlJyxcclxuICAgICAgaWQ6IHRoaXMuaWQsXHJcbiAgICAgIHNlZ21lbnQ6IHRoaXMuc2VnbWVudC5zZXJpYWxpemUoKSxcclxuICAgICAgc3RhcnRWZXJ0ZXg6IHRoaXMuc3RhcnRWZXJ0ZXggPT09IG51bGwgPyBudWxsIDogdGhpcy5zdGFydFZlcnRleC5pZCxcclxuICAgICAgZW5kVmVydGV4OiB0aGlzLmVuZFZlcnRleCA9PT0gbnVsbCA/IG51bGwgOiB0aGlzLmVuZFZlcnRleC5pZCxcclxuICAgICAgc2lnbmVkQXJlYUZyYWdtZW50OiB0aGlzLnNpZ25lZEFyZWFGcmFnbWVudCxcclxuICAgICAgZm9yd2FyZEhhbGY6IHRoaXMuZm9yd2FyZEhhbGYuc2VyaWFsaXplKCksXHJcbiAgICAgIHJldmVyc2VkSGFsZjogdGhpcy5yZXZlcnNlZEhhbGYuc2VyaWFsaXplKCksXHJcbiAgICAgIHZpc2l0ZWQ6IHRoaXMudmlzaXRlZCxcclxuICAgICAgZGF0YTogdGhpcy5kYXRhXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyByZWZlcmVuY2VzIChzbyBpdCBjYW4gYWxsb3cgb3RoZXIgb2JqZWN0cyB0byBiZSBHQydlZCBvciBwb29sZWQpLCBhbmQgZnJlZXMgaXRzZWxmIHRvIHRoZSBwb29sIHNvIGl0XHJcbiAgICogY2FuIGJlIHJldXNlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuc2VnbWVudCA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXJ0VmVydGV4ID0gbnVsbDtcclxuICAgIHRoaXMuZW5kVmVydGV4ID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmZvcndhcmRIYWxmLmRpc3Bvc2UoKTtcclxuICAgIHRoaXMucmV2ZXJzZWRIYWxmLmRpc3Bvc2UoKTtcclxuXHJcbiAgICB0aGlzLmZvcndhcmRIYWxmID0gbnVsbDtcclxuICAgIHRoaXMucmV2ZXJzZWRIYWxmID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmRhdGEgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgb3RoZXIgdmVydGV4IGFzc29jaWF0ZWQgd2l0aCBhbiBlZGdlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVydGV4fSB2ZXJ0ZXhcclxuICAgKiBAcmV0dXJucyB7VmVydGV4fVxyXG4gICAqL1xyXG4gIGdldE90aGVyVmVydGV4KCB2ZXJ0ZXggKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZXJ0ZXggPT09IHRoaXMuc3RhcnRWZXJ0ZXggfHwgdmVydGV4ID09PSB0aGlzLmVuZFZlcnRleCApO1xyXG5cclxuICAgIHJldHVybiB0aGlzLnN0YXJ0VmVydGV4ID09PSB2ZXJ0ZXggPyB0aGlzLmVuZFZlcnRleCA6IHRoaXMuc3RhcnRWZXJ0ZXg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgcG9zc2libHkgcmV2ZXJzZWQgdmVydGV4IHJlZmVyZW5jZXMgKHNpbmNlIHRoZXkgbWF5IGJlIHVwZGF0ZWQpXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHVwZGF0ZVJlZmVyZW5jZXMoKSB7XHJcbiAgICB0aGlzLmZvcndhcmRIYWxmLnVwZGF0ZVJlZmVyZW5jZXMoKTtcclxuICAgIHRoaXMucmV2ZXJzZWRIYWxmLnVwZGF0ZVJlZmVyZW5jZXMoKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhKCB0aGlzLnNlZ21lbnQgaW5zdGFuY2VvZiBMaW5lICkgfHwgdGhpcy5zdGFydFZlcnRleCAhPT0gdGhpcy5lbmRWZXJ0ZXgsXHJcbiAgICAgICdObyBsaW5lIHNlZ21lbnRzIGZvciBzYW1lIHZlcnRpY2VzJyApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGZyZWVUb1Bvb2woKSB7XHJcbiAgICBFZGdlLnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHN0YXRpYyBwb29sID0gbmV3IFBvb2woIEVkZ2UgKTtcclxufVxyXG5cclxua2l0ZS5yZWdpc3RlciggJ0VkZ2UnLCBFZGdlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBFZGdlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxJQUFJLE1BQU0sK0JBQStCO0FBQ2hELFNBQVNDLFFBQVEsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsTUFBTSxRQUFRLGVBQWU7QUFFckUsSUFBSUMsT0FBTyxHQUFHLENBQUM7QUFFZixNQUFNQyxJQUFJLENBQUM7RUFDVDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsT0FBTyxFQUFFQyxXQUFXLEVBQUVDLFNBQVMsRUFBRztJQUM3QztJQUNBLElBQUksQ0FBQ0MsRUFBRSxHQUFHLEVBQUVOLE9BQU87O0lBRW5CO0lBQ0E7SUFDQSxJQUFJLENBQUNPLFVBQVUsQ0FBRUosT0FBTyxFQUFFQyxXQUFXLEVBQUVDLFNBQVUsQ0FBQztFQUNwRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxVQUFVQSxDQUFFSixPQUFPLEVBQUVDLFdBQVcsRUFBRUMsU0FBUyxFQUFHO0lBQzVDRyxNQUFNLElBQUlBLE1BQU0sQ0FBRUwsT0FBTyxZQUFZTCxPQUFRLENBQUM7SUFDOUNVLE1BQU0sSUFBSUEsTUFBTSxDQUFFSixXQUFXLFlBQVlMLE1BQU8sQ0FBQztJQUNqRFMsTUFBTSxJQUFJQSxNQUFNLENBQUVILFNBQVMsWUFBWU4sTUFBTyxDQUFDO0lBQy9DUyxNQUFNLElBQUlBLE1BQU0sQ0FBRUwsT0FBTyxDQUFDTSxLQUFLLENBQUNDLFFBQVEsQ0FBRU4sV0FBVyxDQUFDTyxLQUFNLENBQUMsR0FBRyxJQUFLLENBQUM7SUFDdEVILE1BQU0sSUFBSUEsTUFBTSxDQUFFTCxPQUFPLENBQUNTLEdBQUcsQ0FBQ0YsUUFBUSxDQUFFTCxTQUFTLENBQUNNLEtBQU0sQ0FBQyxHQUFHLElBQUssQ0FBQzs7SUFFbEU7SUFDQSxJQUFJLENBQUNSLE9BQU8sR0FBR0EsT0FBTzs7SUFFdEI7SUFDQSxJQUFJLENBQUNDLFdBQVcsR0FBR0EsV0FBVztJQUM5QixJQUFJLENBQUNDLFNBQVMsR0FBR0EsU0FBUzs7SUFFMUI7SUFDQSxJQUFJLENBQUNRLGtCQUFrQixHQUFHVixPQUFPLENBQUNXLHFCQUFxQixDQUFDLENBQUM7O0lBRXpEO0lBQ0EsSUFBSSxDQUFDQyxXQUFXLEdBQUdwQixRQUFRLENBQUNxQixJQUFJLENBQUNDLE1BQU0sQ0FBRSxJQUFJLEVBQUUsS0FBTSxDQUFDO0lBQ3RELElBQUksQ0FBQ0MsWUFBWSxHQUFHdkIsUUFBUSxDQUFDcUIsSUFBSSxDQUFDQyxNQUFNLENBQUUsSUFBSSxFQUFFLElBQUssQ0FBQzs7SUFFdEQ7SUFDQSxJQUFJLENBQUNFLE9BQU8sR0FBRyxLQUFLOztJQUVwQjtJQUNBLElBQUksQ0FBQ0MsSUFBSSxHQUFHLElBQUk7O0lBRWhCO0lBQ0EsSUFBSSxDQUFDQyxZQUFZLEdBQUcsQ0FFcEIsQ0FBQztJQUVELE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxTQUFTQSxDQUFBLEVBQUc7SUFDVixPQUFPO01BQ0xDLElBQUksRUFBRSxNQUFNO01BQ1pqQixFQUFFLEVBQUUsSUFBSSxDQUFDQSxFQUFFO01BQ1hILE9BQU8sRUFBRSxJQUFJLENBQUNBLE9BQU8sQ0FBQ21CLFNBQVMsQ0FBQyxDQUFDO01BQ2pDbEIsV0FBVyxFQUFFLElBQUksQ0FBQ0EsV0FBVyxLQUFLLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDQSxXQUFXLENBQUNFLEVBQUU7TUFDbkVELFNBQVMsRUFBRSxJQUFJLENBQUNBLFNBQVMsS0FBSyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQ0EsU0FBUyxDQUFDQyxFQUFFO01BQzdETyxrQkFBa0IsRUFBRSxJQUFJLENBQUNBLGtCQUFrQjtNQUMzQ0UsV0FBVyxFQUFFLElBQUksQ0FBQ0EsV0FBVyxDQUFDTyxTQUFTLENBQUMsQ0FBQztNQUN6Q0osWUFBWSxFQUFFLElBQUksQ0FBQ0EsWUFBWSxDQUFDSSxTQUFTLENBQUMsQ0FBQztNQUMzQ0gsT0FBTyxFQUFFLElBQUksQ0FBQ0EsT0FBTztNQUNyQkMsSUFBSSxFQUFFLElBQUksQ0FBQ0E7SUFDYixDQUFDO0VBQ0g7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxPQUFPQSxDQUFBLEVBQUc7SUFDUixJQUFJLENBQUNyQixPQUFPLEdBQUcsSUFBSTtJQUNuQixJQUFJLENBQUNDLFdBQVcsR0FBRyxJQUFJO0lBQ3ZCLElBQUksQ0FBQ0MsU0FBUyxHQUFHLElBQUk7SUFFckIsSUFBSSxDQUFDVSxXQUFXLENBQUNTLE9BQU8sQ0FBQyxDQUFDO0lBQzFCLElBQUksQ0FBQ04sWUFBWSxDQUFDTSxPQUFPLENBQUMsQ0FBQztJQUUzQixJQUFJLENBQUNULFdBQVcsR0FBRyxJQUFJO0lBQ3ZCLElBQUksQ0FBQ0csWUFBWSxHQUFHLElBQUk7SUFFeEIsSUFBSSxDQUFDRSxJQUFJLEdBQUcsSUFBSTtJQUVoQixJQUFJLENBQUNLLFVBQVUsQ0FBQyxDQUFDO0VBQ25COztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLGNBQWNBLENBQUVDLE1BQU0sRUFBRztJQUN2Qm5CLE1BQU0sSUFBSUEsTUFBTSxDQUFFbUIsTUFBTSxLQUFLLElBQUksQ0FBQ3ZCLFdBQVcsSUFBSXVCLE1BQU0sS0FBSyxJQUFJLENBQUN0QixTQUFVLENBQUM7SUFFNUUsT0FBTyxJQUFJLENBQUNELFdBQVcsS0FBS3VCLE1BQU0sR0FBRyxJQUFJLENBQUN0QixTQUFTLEdBQUcsSUFBSSxDQUFDRCxXQUFXO0VBQ3hFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0V3QixnQkFBZ0JBLENBQUEsRUFBRztJQUNqQixJQUFJLENBQUNiLFdBQVcsQ0FBQ2EsZ0JBQWdCLENBQUMsQ0FBQztJQUNuQyxJQUFJLENBQUNWLFlBQVksQ0FBQ1UsZ0JBQWdCLENBQUMsQ0FBQztJQUVwQ3BCLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEVBQUcsSUFBSSxDQUFDTCxPQUFPLFlBQVlOLElBQUksQ0FBRSxJQUFJLElBQUksQ0FBQ08sV0FBVyxLQUFLLElBQUksQ0FBQ0MsU0FBUyxFQUN4RixvQ0FBcUMsQ0FBQztFQUMxQzs7RUFFQTtFQUNBb0IsVUFBVUEsQ0FBQSxFQUFHO0lBQ1h4QixJQUFJLENBQUNlLElBQUksQ0FBQ1MsVUFBVSxDQUFFLElBQUssQ0FBQztFQUM5Qjs7RUFFQTtFQUNBLE9BQU9ULElBQUksR0FBRyxJQUFJdEIsSUFBSSxDQUFFTyxJQUFLLENBQUM7QUFDaEM7QUFFQUwsSUFBSSxDQUFDaUMsUUFBUSxDQUFFLE1BQU0sRUFBRTVCLElBQUssQ0FBQztBQUU3QixlQUFlQSxJQUFJIn0=