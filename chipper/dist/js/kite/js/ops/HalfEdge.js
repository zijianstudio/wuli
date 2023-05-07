// Copyright 2017-2023, University of Colorado Boulder

/**
 * Represents a single direction/side of an Edge. There are two half-edges for each edge, representing each direction.
 * The half-edge also stores face information for the face that would be to the left of the direction of travel.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../dot/js/Vector2.js';
import Pool from '../../../phet-core/js/Pool.js';
import { kite } from '../imports.js';
let globaId = 0;
class HalfEdge {
  /**
   * @public (kite-internal)
   *
   * NOTE: Use HalfEdge.pool.create for most usage instead of using the constructor directly.
   *
   * @param {Edge} edge
   * @param {boolean} isReversed
   */
  constructor(edge, isReversed) {
    // @public {number}
    this.id = ++globaId;

    // NOTE: most object properties are declared/documented in the initialize method. Please look there for most
    // definitions.
    this.initialize(edge, isReversed);
  }

  /**
   * Similar to a usual constructor, but is set up so it can be called multiple times (with dispose() in-between) to
   * support pooling.
   * @private
   *
   * @param {Edge} edge
   * @param {boolean} isReversed
   * @returns {HalfEdge} - This reference for chaining
   */
  initialize(edge, isReversed) {
    assert && assert(edge instanceof kite.Edge);
    assert && assert(typeof isReversed === 'boolean');

    // @public {Edge|null} - Null if disposed (in pool)
    this.edge = edge;

    // @public {Face|null} - Filled in later, contains a face reference
    this.face = null;

    // @public {boolean}
    this.isReversed = isReversed;

    // @public {number}
    this.signedAreaFragment = edge.signedAreaFragment * (isReversed ? -1 : 1);

    // @public {Vertex|null}
    this.startVertex = null;
    this.endVertex = null;

    // @public {Vector2} - Used for vertex sorting in Vertex.js. X is angle of end tangent (shifted),
    // Y is curvature at end. See Vertex edge sort for more information.
    this.sortVector = this.sortVector || new Vector2(0, 0);

    // @public {*} - Available for arbitrary client usage. --- KEEP JSON
    this.data = null;
    this.updateReferences(); // Initializes vertex references

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
      type: 'HalfEdge',
      id: this.id,
      edge: this.edge.id,
      face: this.face === null ? null : this.face.id,
      isReversed: this.isReversed,
      signedAreaFragment: this.signedAreaFragment,
      startVertex: this.startVertex === null ? null : this.startVertex.id,
      endVertex: this.endVertex === null ? null : this.endVertex.id,
      sortVector: Vector2.Vector2IO.toStateObject(this.sortVector),
      data: this.data
    };
  }

  /**
   * Removes references (so it can allow other objects to be GC'ed or pooled), and frees itself to the pool so it
   * can be reused.
   * @public
   */
  dispose() {
    this.edge = null;
    this.face = null;
    this.startVertex = null;
    this.endVertex = null;
    this.data = null;
    this.freeToPool();
  }

  /**
   * Returns the next half-edge, walking around counter-clockwise as possible. Assumes edges have been sorted.
   * @public
   *
   * @param {function} [filter] - function( {Edge} ) => {boolean}. If it returns false, the edge will be skipped, and
   *                              not returned by getNext
   */
  getNext(filter) {
    // Starting at 1, forever incrementing (we will bail out with normal conditions)
    for (let i = 1;; i++) {
      let index = this.endVertex.incidentHalfEdges.indexOf(this) - i;
      if (index < 0) {
        index += this.endVertex.incidentHalfEdges.length;
      }
      const halfEdge = this.endVertex.incidentHalfEdges[index].getReversed();
      if (filter && !filter(halfEdge.edge)) {
        continue;
      }
      assert && assert(this.endVertex === halfEdge.startVertex);
      return halfEdge;
    }
  }

  /**
   * Update possibly reversed vertex references.
   * @private
   */
  updateReferences() {
    this.startVertex = this.isReversed ? this.edge.endVertex : this.edge.startVertex;
    this.endVertex = this.isReversed ? this.edge.startVertex : this.edge.endVertex;
    assert && assert(this.startVertex);
    assert && assert(this.endVertex);
  }

  /**
   * Returns the tangent of the edge at the end vertex (in the direction away from the vertex).
   * @public
   *
   * @returns {Vector2}
   */
  getEndTangent() {
    if (this.isReversed) {
      return this.edge.segment.startTangent;
    } else {
      return this.edge.segment.endTangent.negated();
    }
  }

  /**
   * Returns the curvature of the edge at the end vertex.
   * @public
   *
   * @returns {number}
   */
  getEndCurvature() {
    if (this.isReversed) {
      return -this.edge.segment.curvatureAt(0);
    } else {
      return this.edge.segment.curvatureAt(1);
    }
  }

  /**
   * Returns the opposite half-edge for the same edge.
   * @public
   *
   * @returns {HalfEdge}
   */
  getReversed() {
    return this.isReversed ? this.edge.forwardHalf : this.edge.reversedHalf;
  }

  /**
   * Returns a segment that starts at our startVertex and ends at our endVertex (may be reversed to accomplish that).
   * @public
   *
   * @returns {Segment}
   */
  getDirectionalSegment() {
    if (this.isReversed) {
      return this.edge.segment.reversed();
    } else {
      return this.edge.segment;
    }
  }

  // @public
  freeToPool() {
    HalfEdge.pool.freeToPool(this);
  }

  // @public
  static pool = new Pool(HalfEdge);
}
kite.register('HalfEdge', HalfEdge);
export default HalfEdge;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiUG9vbCIsImtpdGUiLCJnbG9iYUlkIiwiSGFsZkVkZ2UiLCJjb25zdHJ1Y3RvciIsImVkZ2UiLCJpc1JldmVyc2VkIiwiaWQiLCJpbml0aWFsaXplIiwiYXNzZXJ0IiwiRWRnZSIsImZhY2UiLCJzaWduZWRBcmVhRnJhZ21lbnQiLCJzdGFydFZlcnRleCIsImVuZFZlcnRleCIsInNvcnRWZWN0b3IiLCJkYXRhIiwidXBkYXRlUmVmZXJlbmNlcyIsInNlcmlhbGl6ZSIsInR5cGUiLCJWZWN0b3IySU8iLCJ0b1N0YXRlT2JqZWN0IiwiZGlzcG9zZSIsImZyZWVUb1Bvb2wiLCJnZXROZXh0IiwiZmlsdGVyIiwiaSIsImluZGV4IiwiaW5jaWRlbnRIYWxmRWRnZXMiLCJpbmRleE9mIiwibGVuZ3RoIiwiaGFsZkVkZ2UiLCJnZXRSZXZlcnNlZCIsImdldEVuZFRhbmdlbnQiLCJzZWdtZW50Iiwic3RhcnRUYW5nZW50IiwiZW5kVGFuZ2VudCIsIm5lZ2F0ZWQiLCJnZXRFbmRDdXJ2YXR1cmUiLCJjdXJ2YXR1cmVBdCIsImZvcndhcmRIYWxmIiwicmV2ZXJzZWRIYWxmIiwiZ2V0RGlyZWN0aW9uYWxTZWdtZW50IiwicmV2ZXJzZWQiLCJwb29sIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJIYWxmRWRnZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgc2luZ2xlIGRpcmVjdGlvbi9zaWRlIG9mIGFuIEVkZ2UuIFRoZXJlIGFyZSB0d28gaGFsZi1lZGdlcyBmb3IgZWFjaCBlZGdlLCByZXByZXNlbnRpbmcgZWFjaCBkaXJlY3Rpb24uXHJcbiAqIFRoZSBoYWxmLWVkZ2UgYWxzbyBzdG9yZXMgZmFjZSBpbmZvcm1hdGlvbiBmb3IgdGhlIGZhY2UgdGhhdCB3b3VsZCBiZSB0byB0aGUgbGVmdCBvZiB0aGUgZGlyZWN0aW9uIG9mIHRyYXZlbC5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFBvb2wgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xyXG5pbXBvcnQgeyBraXRlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5sZXQgZ2xvYmFJZCA9IDA7XHJcblxyXG5jbGFzcyBIYWxmRWRnZSB7XHJcbiAgLyoqXHJcbiAgICogQHB1YmxpYyAoa2l0ZS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIE5PVEU6IFVzZSBIYWxmRWRnZS5wb29sLmNyZWF0ZSBmb3IgbW9zdCB1c2FnZSBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBjb25zdHJ1Y3RvciBkaXJlY3RseS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RWRnZX0gZWRnZVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNSZXZlcnNlZFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBlZGdlLCBpc1JldmVyc2VkICkge1xyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5pZCA9ICsrZ2xvYmFJZDtcclxuXHJcbiAgICAvLyBOT1RFOiBtb3N0IG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBkZWNsYXJlZC9kb2N1bWVudGVkIGluIHRoZSBpbml0aWFsaXplIG1ldGhvZC4gUGxlYXNlIGxvb2sgdGhlcmUgZm9yIG1vc3RcclxuICAgIC8vIGRlZmluaXRpb25zLlxyXG4gICAgdGhpcy5pbml0aWFsaXplKCBlZGdlLCBpc1JldmVyc2VkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaW1pbGFyIHRvIGEgdXN1YWwgY29uc3RydWN0b3IsIGJ1dCBpcyBzZXQgdXAgc28gaXQgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyAod2l0aCBkaXNwb3NlKCkgaW4tYmV0d2VlbikgdG9cclxuICAgKiBzdXBwb3J0IHBvb2xpbmcuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RWRnZX0gZWRnZVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNSZXZlcnNlZFxyXG4gICAqIEByZXR1cm5zIHtIYWxmRWRnZX0gLSBUaGlzIHJlZmVyZW5jZSBmb3IgY2hhaW5pbmdcclxuICAgKi9cclxuICBpbml0aWFsaXplKCBlZGdlLCBpc1JldmVyc2VkICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZWRnZSBpbnN0YW5jZW9mIGtpdGUuRWRnZSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGlzUmV2ZXJzZWQgPT09ICdib29sZWFuJyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0VkZ2V8bnVsbH0gLSBOdWxsIGlmIGRpc3Bvc2VkIChpbiBwb29sKVxyXG4gICAgdGhpcy5lZGdlID0gZWRnZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtGYWNlfG51bGx9IC0gRmlsbGVkIGluIGxhdGVyLCBjb250YWlucyBhIGZhY2UgcmVmZXJlbmNlXHJcbiAgICB0aGlzLmZhY2UgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59XHJcbiAgICB0aGlzLmlzUmV2ZXJzZWQgPSBpc1JldmVyc2VkO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMuc2lnbmVkQXJlYUZyYWdtZW50ID0gZWRnZS5zaWduZWRBcmVhRnJhZ21lbnQgKiAoIGlzUmV2ZXJzZWQgPyAtMSA6IDEgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtWZXJ0ZXh8bnVsbH1cclxuICAgIHRoaXMuc3RhcnRWZXJ0ZXggPSBudWxsO1xyXG4gICAgdGhpcy5lbmRWZXJ0ZXggPSBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1ZlY3RvcjJ9IC0gVXNlZCBmb3IgdmVydGV4IHNvcnRpbmcgaW4gVmVydGV4LmpzLiBYIGlzIGFuZ2xlIG9mIGVuZCB0YW5nZW50IChzaGlmdGVkKSxcclxuICAgIC8vIFkgaXMgY3VydmF0dXJlIGF0IGVuZC4gU2VlIFZlcnRleCBlZGdlIHNvcnQgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgICB0aGlzLnNvcnRWZWN0b3IgPSB0aGlzLnNvcnRWZWN0b3IgfHwgbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHsqfSAtIEF2YWlsYWJsZSBmb3IgYXJiaXRyYXJ5IGNsaWVudCB1c2FnZS4gLS0tIEtFRVAgSlNPTlxyXG4gICAgdGhpcy5kYXRhID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZVJlZmVyZW5jZXMoKTsgLy8gSW5pdGlhbGl6ZXMgdmVydGV4IHJlZmVyZW5jZXNcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IGZvcm0gdGhhdCBjYW4gYmUgdHVybmVkIGJhY2sgaW50byBhIHNlZ21lbnQgd2l0aCB0aGUgY29ycmVzcG9uZGluZyBkZXNlcmlhbGl6ZSBtZXRob2QuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge09iamVjdH1cclxuICAgKi9cclxuICBzZXJpYWxpemUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiAnSGFsZkVkZ2UnLFxyXG4gICAgICBpZDogdGhpcy5pZCxcclxuICAgICAgZWRnZTogdGhpcy5lZGdlLmlkLFxyXG4gICAgICBmYWNlOiB0aGlzLmZhY2UgPT09IG51bGwgPyBudWxsIDogdGhpcy5mYWNlLmlkLFxyXG4gICAgICBpc1JldmVyc2VkOiB0aGlzLmlzUmV2ZXJzZWQsXHJcbiAgICAgIHNpZ25lZEFyZWFGcmFnbWVudDogdGhpcy5zaWduZWRBcmVhRnJhZ21lbnQsXHJcbiAgICAgIHN0YXJ0VmVydGV4OiB0aGlzLnN0YXJ0VmVydGV4ID09PSBudWxsID8gbnVsbCA6IHRoaXMuc3RhcnRWZXJ0ZXguaWQsXHJcbiAgICAgIGVuZFZlcnRleDogdGhpcy5lbmRWZXJ0ZXggPT09IG51bGwgPyBudWxsIDogdGhpcy5lbmRWZXJ0ZXguaWQsXHJcbiAgICAgIHNvcnRWZWN0b3I6IFZlY3RvcjIuVmVjdG9yMklPLnRvU3RhdGVPYmplY3QoIHRoaXMuc29ydFZlY3RvciApLFxyXG4gICAgICBkYXRhOiB0aGlzLmRhdGFcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIHJlZmVyZW5jZXMgKHNvIGl0IGNhbiBhbGxvdyBvdGhlciBvYmplY3RzIHRvIGJlIEdDJ2VkIG9yIHBvb2xlZCksIGFuZCBmcmVlcyBpdHNlbGYgdG8gdGhlIHBvb2wgc28gaXRcclxuICAgKiBjYW4gYmUgcmV1c2VkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5lZGdlID0gbnVsbDtcclxuICAgIHRoaXMuZmFjZSA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXJ0VmVydGV4ID0gbnVsbDtcclxuICAgIHRoaXMuZW5kVmVydGV4ID0gbnVsbDtcclxuICAgIHRoaXMuZGF0YSA9IG51bGw7XHJcbiAgICB0aGlzLmZyZWVUb1Bvb2woKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG5leHQgaGFsZi1lZGdlLCB3YWxraW5nIGFyb3VuZCBjb3VudGVyLWNsb2Nrd2lzZSBhcyBwb3NzaWJsZS4gQXNzdW1lcyBlZGdlcyBoYXZlIGJlZW4gc29ydGVkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtmaWx0ZXJdIC0gZnVuY3Rpb24oIHtFZGdlfSApID0+IHtib29sZWFufS4gSWYgaXQgcmV0dXJucyBmYWxzZSwgdGhlIGVkZ2Ugd2lsbCBiZSBza2lwcGVkLCBhbmRcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdCByZXR1cm5lZCBieSBnZXROZXh0XHJcbiAgICovXHJcbiAgZ2V0TmV4dCggZmlsdGVyICkge1xyXG4gICAgLy8gU3RhcnRpbmcgYXQgMSwgZm9yZXZlciBpbmNyZW1lbnRpbmcgKHdlIHdpbGwgYmFpbCBvdXQgd2l0aCBub3JtYWwgY29uZGl0aW9ucylcclxuICAgIGZvciAoIGxldCBpID0gMTsgOyBpKysgKSB7XHJcbiAgICAgIGxldCBpbmRleCA9IHRoaXMuZW5kVmVydGV4LmluY2lkZW50SGFsZkVkZ2VzLmluZGV4T2YoIHRoaXMgKSAtIGk7XHJcbiAgICAgIGlmICggaW5kZXggPCAwICkge1xyXG4gICAgICAgIGluZGV4ICs9IHRoaXMuZW5kVmVydGV4LmluY2lkZW50SGFsZkVkZ2VzLmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBoYWxmRWRnZSA9IHRoaXMuZW5kVmVydGV4LmluY2lkZW50SGFsZkVkZ2VzWyBpbmRleCBdLmdldFJldmVyc2VkKCk7XHJcbiAgICAgIGlmICggZmlsdGVyICYmICFmaWx0ZXIoIGhhbGZFZGdlLmVkZ2UgKSApIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmVuZFZlcnRleCA9PT0gaGFsZkVkZ2Uuc3RhcnRWZXJ0ZXggKTtcclxuICAgICAgcmV0dXJuIGhhbGZFZGdlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHBvc3NpYmx5IHJldmVyc2VkIHZlcnRleCByZWZlcmVuY2VzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlUmVmZXJlbmNlcygpIHtcclxuICAgIHRoaXMuc3RhcnRWZXJ0ZXggPSB0aGlzLmlzUmV2ZXJzZWQgPyB0aGlzLmVkZ2UuZW5kVmVydGV4IDogdGhpcy5lZGdlLnN0YXJ0VmVydGV4O1xyXG4gICAgdGhpcy5lbmRWZXJ0ZXggPSB0aGlzLmlzUmV2ZXJzZWQgPyB0aGlzLmVkZ2Uuc3RhcnRWZXJ0ZXggOiB0aGlzLmVkZ2UuZW5kVmVydGV4O1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zdGFydFZlcnRleCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5lbmRWZXJ0ZXggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHRhbmdlbnQgb2YgdGhlIGVkZ2UgYXQgdGhlIGVuZCB2ZXJ0ZXggKGluIHRoZSBkaXJlY3Rpb24gYXdheSBmcm9tIHRoZSB2ZXJ0ZXgpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGdldEVuZFRhbmdlbnQoKSB7XHJcbiAgICBpZiAoIHRoaXMuaXNSZXZlcnNlZCApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZWRnZS5zZWdtZW50LnN0YXJ0VGFuZ2VudDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5lZGdlLnNlZ21lbnQuZW5kVGFuZ2VudC5uZWdhdGVkKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjdXJ2YXR1cmUgb2YgdGhlIGVkZ2UgYXQgdGhlIGVuZCB2ZXJ0ZXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRFbmRDdXJ2YXR1cmUoKSB7XHJcbiAgICBpZiAoIHRoaXMuaXNSZXZlcnNlZCApIHtcclxuICAgICAgcmV0dXJuIC10aGlzLmVkZ2Uuc2VnbWVudC5jdXJ2YXR1cmVBdCggMCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmVkZ2Uuc2VnbWVudC5jdXJ2YXR1cmVBdCggMSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgb3Bwb3NpdGUgaGFsZi1lZGdlIGZvciB0aGUgc2FtZSBlZGdlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtIYWxmRWRnZX1cclxuICAgKi9cclxuICBnZXRSZXZlcnNlZCgpIHtcclxuICAgIHJldHVybiB0aGlzLmlzUmV2ZXJzZWQgPyB0aGlzLmVkZ2UuZm9yd2FyZEhhbGYgOiB0aGlzLmVkZ2UucmV2ZXJzZWRIYWxmO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHNlZ21lbnQgdGhhdCBzdGFydHMgYXQgb3VyIHN0YXJ0VmVydGV4IGFuZCBlbmRzIGF0IG91ciBlbmRWZXJ0ZXggKG1heSBiZSByZXZlcnNlZCB0byBhY2NvbXBsaXNoIHRoYXQpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTZWdtZW50fVxyXG4gICAqL1xyXG4gIGdldERpcmVjdGlvbmFsU2VnbWVudCgpIHtcclxuICAgIGlmICggdGhpcy5pc1JldmVyc2VkICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5lZGdlLnNlZ21lbnQucmV2ZXJzZWQoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5lZGdlLnNlZ21lbnQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgZnJlZVRvUG9vbCgpIHtcclxuICAgIEhhbGZFZGdlLnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHN0YXRpYyBwb29sID0gbmV3IFBvb2woIEhhbGZFZGdlICk7XHJcbn1cclxuXHJcbmtpdGUucmVnaXN0ZXIoICdIYWxmRWRnZScsIEhhbGZFZGdlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBIYWxmRWRnZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLElBQUksTUFBTSwrQkFBK0I7QUFDaEQsU0FBU0MsSUFBSSxRQUFRLGVBQWU7QUFF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