// Copyright 2017-2023, University of Colorado Boulder

/**
 * A face is usually contained by an ("inner") boundary of edges, and zero or more ("outer") boundary holes on the inside.
 * The naming is somewhat counterintuitive here, because the "inner" boundaries are on the inside of the edges
 * (towards our face), and the "outer" hole boundaries are on the outer half-edges of the holes.
 *
 * There is normally one "unbounded" face without a normal boundary, whose "area" expands to infinity, and contains the
 * everything on the exterior of all of the edges.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import cleanArray from '../../../phet-core/js/cleanArray.js';
import Pool from '../../../phet-core/js/Pool.js';
import { kite } from '../imports.js';
let globaId = 0;
class Face {
  /**
   * @public (kite-internal)
   *
   * NOTE: Use Face.pool.create for most usage instead of using the constructor directly.
   *
   * @param {Boundary|null} boundary - Null if it's the unbounded face
   */
  constructor(boundary) {
    // @public {number}
    this.id = ++globaId;

    // NOTE: most object properties are declared/documented in the initialize method. Please look there for most
    // definitions.
    this.initialize(boundary);
  }

  /**
   * Similar to a usual constructor, but is set up so it can be called multiple times (with dispose() in-between) to
   * support pooling.
   * @private
   *
   * @param {Boundary} boundary
   * @returns {Face} - This reference for chaining
   */
  initialize(boundary) {
    assert && assert(boundary === null || boundary.isInner());

    // @public {Boundary|null} - "inner" types, null when disposed (in pool)
    this.boundary = boundary;

    // @public {Array.<Boundary>} - "outer" types
    this.holes = cleanArray(this.holes);

    // @public {Object|null} - If non-null, it's a map from shapeId {number} => winding {number}
    this.windingMap = null;

    // @public {boolean|null} - Filled in later
    this.filled = null;
    if (boundary) {
      this.addBoundaryFaceReferences(boundary);
    }
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
      type: 'Face',
      id: this.id,
      boundary: this.boundary === null ? null : this.boundary.id,
      holes: this.holes.map(boundary => boundary.id),
      windingMap: this.windingMap,
      filled: this.filled
    };
  }

  /**
   * Removes references (so it can allow other objects to be GC'ed or pooled), and frees itself to the pool so it
   * can be reused.
   * @public
   */
  dispose() {
    this.boundary = null;
    cleanArray(this.holes);
    this.windingMap = null;
    this.filled = null;
    this.freeToPool();
  }

  /**
   * Marks all half-edges on the boundary as belonging to this face.
   * @public
   *
   * @param {Boundary} boundary
   */
  addBoundaryFaceReferences(boundary) {
    for (let i = 0; i < boundary.halfEdges.length; i++) {
      assert && assert(boundary.halfEdges[i].face === null);
      boundary.halfEdges[i].face = this;
    }
  }

  /**
   * Processes the boundary-graph for a given outer boundary, and turns it into holes for this face.
   * @public
   *
   * In the graph, every outer boundary in each connected component will be holes for the single inner boundary
   * (which will be, in this case, our face's boundary). Since it's a tree, we can walk the tree recursively to add
   * all necessary holes.
   *
   * @param {Boundary} outerBoundary
   */
  recursivelyAddHoles(outerBoundary) {
    assert && assert(!outerBoundary.isInner());
    this.holes.push(outerBoundary);
    this.addBoundaryFaceReferences(outerBoundary);
    for (let i = 0; i < outerBoundary.childBoundaries.length; i++) {
      this.recursivelyAddHoles(outerBoundary.childBoundaries[i]);
    }
  }

  // @public
  freeToPool() {
    Face.pool.freeToPool(this);
  }

  // @public
  static pool = new Pool(Face);
}
kite.register('Face', Face);
export default Face;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjbGVhbkFycmF5IiwiUG9vbCIsImtpdGUiLCJnbG9iYUlkIiwiRmFjZSIsImNvbnN0cnVjdG9yIiwiYm91bmRhcnkiLCJpZCIsImluaXRpYWxpemUiLCJhc3NlcnQiLCJpc0lubmVyIiwiaG9sZXMiLCJ3aW5kaW5nTWFwIiwiZmlsbGVkIiwiYWRkQm91bmRhcnlGYWNlUmVmZXJlbmNlcyIsInNlcmlhbGl6ZSIsInR5cGUiLCJtYXAiLCJkaXNwb3NlIiwiZnJlZVRvUG9vbCIsImkiLCJoYWxmRWRnZXMiLCJsZW5ndGgiLCJmYWNlIiwicmVjdXJzaXZlbHlBZGRIb2xlcyIsIm91dGVyQm91bmRhcnkiLCJwdXNoIiwiY2hpbGRCb3VuZGFyaWVzIiwicG9vbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmFjZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGZhY2UgaXMgdXN1YWxseSBjb250YWluZWQgYnkgYW4gKFwiaW5uZXJcIikgYm91bmRhcnkgb2YgZWRnZXMsIGFuZCB6ZXJvIG9yIG1vcmUgKFwib3V0ZXJcIikgYm91bmRhcnkgaG9sZXMgb24gdGhlIGluc2lkZS5cclxuICogVGhlIG5hbWluZyBpcyBzb21ld2hhdCBjb3VudGVyaW50dWl0aXZlIGhlcmUsIGJlY2F1c2UgdGhlIFwiaW5uZXJcIiBib3VuZGFyaWVzIGFyZSBvbiB0aGUgaW5zaWRlIG9mIHRoZSBlZGdlc1xyXG4gKiAodG93YXJkcyBvdXIgZmFjZSksIGFuZCB0aGUgXCJvdXRlclwiIGhvbGUgYm91bmRhcmllcyBhcmUgb24gdGhlIG91dGVyIGhhbGYtZWRnZXMgb2YgdGhlIGhvbGVzLlxyXG4gKlxyXG4gKiBUaGVyZSBpcyBub3JtYWxseSBvbmUgXCJ1bmJvdW5kZWRcIiBmYWNlIHdpdGhvdXQgYSBub3JtYWwgYm91bmRhcnksIHdob3NlIFwiYXJlYVwiIGV4cGFuZHMgdG8gaW5maW5pdHksIGFuZCBjb250YWlucyB0aGVcclxuICogZXZlcnl0aGluZyBvbiB0aGUgZXh0ZXJpb3Igb2YgYWxsIG9mIHRoZSBlZGdlcy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBjbGVhbkFycmF5IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5LmpzJztcclxuaW1wb3J0IFBvb2wgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xyXG5pbXBvcnQgeyBraXRlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5sZXQgZ2xvYmFJZCA9IDA7XHJcblxyXG5jbGFzcyBGYWNlIHtcclxuICAvKipcclxuICAgKiBAcHVibGljIChraXRlLWludGVybmFsKVxyXG4gICAqXHJcbiAgICogTk9URTogVXNlIEZhY2UucG9vbC5jcmVhdGUgZm9yIG1vc3QgdXNhZ2UgaW5zdGVhZCBvZiB1c2luZyB0aGUgY29uc3RydWN0b3IgZGlyZWN0bHkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kYXJ5fG51bGx9IGJvdW5kYXJ5IC0gTnVsbCBpZiBpdCdzIHRoZSB1bmJvdW5kZWQgZmFjZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBib3VuZGFyeSApIHtcclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMuaWQgPSArK2dsb2JhSWQ7XHJcblxyXG4gICAgLy8gTk9URTogbW9zdCBvYmplY3QgcHJvcGVydGllcyBhcmUgZGVjbGFyZWQvZG9jdW1lbnRlZCBpbiB0aGUgaW5pdGlhbGl6ZSBtZXRob2QuIFBsZWFzZSBsb29rIHRoZXJlIGZvciBtb3N0XHJcbiAgICAvLyBkZWZpbml0aW9ucy5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZSggYm91bmRhcnkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNpbWlsYXIgdG8gYSB1c3VhbCBjb25zdHJ1Y3RvciwgYnV0IGlzIHNldCB1cCBzbyBpdCBjYW4gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzICh3aXRoIGRpc3Bvc2UoKSBpbi1iZXR3ZWVuKSB0b1xyXG4gICAqIHN1cHBvcnQgcG9vbGluZy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZGFyeX0gYm91bmRhcnlcclxuICAgKiBAcmV0dXJucyB7RmFjZX0gLSBUaGlzIHJlZmVyZW5jZSBmb3IgY2hhaW5pbmdcclxuICAgKi9cclxuICBpbml0aWFsaXplKCBib3VuZGFyeSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJvdW5kYXJ5ID09PSBudWxsIHx8IGJvdW5kYXJ5LmlzSW5uZXIoKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0JvdW5kYXJ5fG51bGx9IC0gXCJpbm5lclwiIHR5cGVzLCBudWxsIHdoZW4gZGlzcG9zZWQgKGluIHBvb2wpXHJcbiAgICB0aGlzLmJvdW5kYXJ5ID0gYm91bmRhcnk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPEJvdW5kYXJ5Pn0gLSBcIm91dGVyXCIgdHlwZXNcclxuICAgIHRoaXMuaG9sZXMgPSBjbGVhbkFycmF5KCB0aGlzLmhvbGVzICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7T2JqZWN0fG51bGx9IC0gSWYgbm9uLW51bGwsIGl0J3MgYSBtYXAgZnJvbSBzaGFwZUlkIHtudW1iZXJ9ID0+IHdpbmRpbmcge251bWJlcn1cclxuICAgIHRoaXMud2luZGluZ01hcCA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbnxudWxsfSAtIEZpbGxlZCBpbiBsYXRlclxyXG4gICAgdGhpcy5maWxsZWQgPSBudWxsO1xyXG5cclxuICAgIGlmICggYm91bmRhcnkgKSB7XHJcbiAgICAgIHRoaXMuYWRkQm91bmRhcnlGYWNlUmVmZXJlbmNlcyggYm91bmRhcnkgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IGZvcm0gdGhhdCBjYW4gYmUgdHVybmVkIGJhY2sgaW50byBhIHNlZ21lbnQgd2l0aCB0aGUgY29ycmVzcG9uZGluZyBkZXNlcmlhbGl6ZSBtZXRob2QuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge09iamVjdH1cclxuICAgKi9cclxuICBzZXJpYWxpemUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiAnRmFjZScsXHJcbiAgICAgIGlkOiB0aGlzLmlkLFxyXG4gICAgICBib3VuZGFyeTogdGhpcy5ib3VuZGFyeSA9PT0gbnVsbCA/IG51bGwgOiB0aGlzLmJvdW5kYXJ5LmlkLFxyXG4gICAgICBob2xlczogdGhpcy5ob2xlcy5tYXAoIGJvdW5kYXJ5ID0+IGJvdW5kYXJ5LmlkICksXHJcbiAgICAgIHdpbmRpbmdNYXA6IHRoaXMud2luZGluZ01hcCxcclxuICAgICAgZmlsbGVkOiB0aGlzLmZpbGxlZFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgcmVmZXJlbmNlcyAoc28gaXQgY2FuIGFsbG93IG90aGVyIG9iamVjdHMgdG8gYmUgR0MnZWQgb3IgcG9vbGVkKSwgYW5kIGZyZWVzIGl0c2VsZiB0byB0aGUgcG9vbCBzbyBpdFxyXG4gICAqIGNhbiBiZSByZXVzZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmJvdW5kYXJ5ID0gbnVsbDtcclxuICAgIGNsZWFuQXJyYXkoIHRoaXMuaG9sZXMgKTtcclxuICAgIHRoaXMud2luZGluZ01hcCA9IG51bGw7XHJcbiAgICB0aGlzLmZpbGxlZCA9IG51bGw7XHJcbiAgICB0aGlzLmZyZWVUb1Bvb2woKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcmtzIGFsbCBoYWxmLWVkZ2VzIG9uIHRoZSBib3VuZGFyeSBhcyBiZWxvbmdpbmcgdG8gdGhpcyBmYWNlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Qm91bmRhcnl9IGJvdW5kYXJ5XHJcbiAgICovXHJcbiAgYWRkQm91bmRhcnlGYWNlUmVmZXJlbmNlcyggYm91bmRhcnkgKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBib3VuZGFyeS5oYWxmRWRnZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGJvdW5kYXJ5LmhhbGZFZGdlc1sgaSBdLmZhY2UgPT09IG51bGwgKTtcclxuXHJcbiAgICAgIGJvdW5kYXJ5LmhhbGZFZGdlc1sgaSBdLmZhY2UgPSB0aGlzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJvY2Vzc2VzIHRoZSBib3VuZGFyeS1ncmFwaCBmb3IgYSBnaXZlbiBvdXRlciBib3VuZGFyeSwgYW5kIHR1cm5zIGl0IGludG8gaG9sZXMgZm9yIHRoaXMgZmFjZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBJbiB0aGUgZ3JhcGgsIGV2ZXJ5IG91dGVyIGJvdW5kYXJ5IGluIGVhY2ggY29ubmVjdGVkIGNvbXBvbmVudCB3aWxsIGJlIGhvbGVzIGZvciB0aGUgc2luZ2xlIGlubmVyIGJvdW5kYXJ5XHJcbiAgICogKHdoaWNoIHdpbGwgYmUsIGluIHRoaXMgY2FzZSwgb3VyIGZhY2UncyBib3VuZGFyeSkuIFNpbmNlIGl0J3MgYSB0cmVlLCB3ZSBjYW4gd2FsayB0aGUgdHJlZSByZWN1cnNpdmVseSB0byBhZGRcclxuICAgKiBhbGwgbmVjZXNzYXJ5IGhvbGVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZGFyeX0gb3V0ZXJCb3VuZGFyeVxyXG4gICAqL1xyXG4gIHJlY3Vyc2l2ZWx5QWRkSG9sZXMoIG91dGVyQm91bmRhcnkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3V0ZXJCb3VuZGFyeS5pc0lubmVyKCkgKTtcclxuXHJcbiAgICB0aGlzLmhvbGVzLnB1c2goIG91dGVyQm91bmRhcnkgKTtcclxuICAgIHRoaXMuYWRkQm91bmRhcnlGYWNlUmVmZXJlbmNlcyggb3V0ZXJCb3VuZGFyeSApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgb3V0ZXJCb3VuZGFyeS5jaGlsZEJvdW5kYXJpZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMucmVjdXJzaXZlbHlBZGRIb2xlcyggb3V0ZXJCb3VuZGFyeS5jaGlsZEJvdW5kYXJpZXNbIGkgXSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGZyZWVUb1Bvb2woKSB7XHJcbiAgICBGYWNlLnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHN0YXRpYyBwb29sID0gbmV3IFBvb2woIEZhY2UgKTtcclxufVxyXG5cclxua2l0ZS5yZWdpc3RlciggJ0ZhY2UnLCBGYWNlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBGYWNlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLHFDQUFxQztBQUM1RCxPQUFPQyxJQUFJLE1BQU0sK0JBQStCO0FBQ2hELFNBQVNDLElBQUksUUFBUSxlQUFlO0FBRXBDLElBQUlDLE9BQU8sR0FBRyxDQUFDO0FBRWYsTUFBTUMsSUFBSSxDQUFDO0VBQ1Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsUUFBUSxFQUFHO0lBQ3RCO0lBQ0EsSUFBSSxDQUFDQyxFQUFFLEdBQUcsRUFBRUosT0FBTzs7SUFFbkI7SUFDQTtJQUNBLElBQUksQ0FBQ0ssVUFBVSxDQUFFRixRQUFTLENBQUM7RUFDN0I7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxVQUFVQSxDQUFFRixRQUFRLEVB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