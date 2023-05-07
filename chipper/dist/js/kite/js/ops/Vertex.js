// Copyright 2017-2023, University of Colorado Boulder

/**
 * Represents a point in space that connects to edges. It stores the edges that are connected (directionally as
 * half-edges since Cubic segments can start and end at the same point/vertex), and can handle sorting edges so that
 * a half-edge's "next" half-edge (following counter-clockwise) can be determined.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../dot/js/Vector2.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Pool from '../../../phet-core/js/Pool.js';
import { kite, Line } from '../imports.js';
let globaId = 0;
class Vertex {
  /**
   * @public (kite-internal)
   *
   * NOTE: Use Vertex.pool.create for most usage instead of using the constructor directly.
   *
   * @param {Vector2} point - The point where the vertex should be located.
   */
  constructor(point) {
    // @public {number}
    this.id = ++globaId;

    // NOTE: most object properties are declared/documented in the initialize method. Please look there for most
    // definitions.
    this.initialize(point);
  }

  /**
   * Similar to a usual constructor, but is set up so it can be called multiple times (with dispose() in-between) to
   * support pooling.
   * @private
   *
   * @param {Vector2} point
   * @returns {Vertex} - This reference for chaining
   */
  initialize(point) {
    assert && assert(point instanceof Vector2);

    // @public {Vector2}
    this.point = point;

    // @public {Array.<HalfEdge>} - Records the half-edge that points to (ends at) this vertex.
    this.incidentHalfEdges = cleanArray(this.incidentHalfEdges);

    // @public {boolean} - Used for depth-first search
    this.visited = false;

    // @public {number} - Visit index for bridge detection (more efficient to have inline here)
    this.visitIndex = 0;

    // @public {number} - Low index for bridge detection (more efficient to have inline here)
    this.lowIndex = 0;

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
      type: 'Vertex',
      id: this.id,
      point: Vector2.Vector2IO.toStateObject(this.point),
      incidentHalfEdges: this.incidentHalfEdges.map(halfEdge => halfEdge.id),
      visited: this.visited,
      visitIndex: this.visitIndex,
      lowIndex: this.lowIndex
    };
  }

  /**
   * Removes references (so it can allow other objects to be GC'ed or pooled), and frees itself to the pool so it
   * can be reused.
   * @public
   */
  dispose() {
    this.point = Vector2.ZERO;
    cleanArray(this.incidentHalfEdges);
    this.freeToPool();
  }

  /**
   * Sorts the edges in increasing angle order.
   * @public
   */
  sortEdges() {
    const vectors = []; // x coordinate will be "angle", y coordinate will be curvature
    for (let i = 0; i < this.incidentHalfEdges.length; i++) {
      const halfEdge = this.incidentHalfEdges[i];
      // NOTE: If it is expensive to precompute curvature, we could save it until edgeComparison needs it.
      vectors.push(halfEdge.sortVector.setXY(halfEdge.getEndTangent().angle, halfEdge.getEndCurvature()));
    }

    // "Rotate" the angles until we are sure that our "cut" (where -pi goes to pi around the circle) is at a place
    // not near any angle. This should prevent ambiguity in sorting (which can lead to bugs in the order)
    const cutoff = -Math.PI + 1e-4;
    let atCutAngle = false;
    while (!atCutAngle) {
      atCutAngle = true;
      for (let i = 0; i < vectors.length; i++) {
        if (vectors[i].x < cutoff) {
          atCutAngle = false;
        }
      }
      if (!atCutAngle) {
        for (let i = 0; i < vectors.length; i++) {
          const vector = vectors[i];
          vector.x -= 1.62594024516; // Definitely not choosing random digits by typing! (shouldn't matter)
          if (vector.x < -Math.PI - 1e-4) {
            vector.x += Math.PI * 2;
          }
        }
      }
    }
    this.incidentHalfEdges.sort(Vertex.edgeComparison);
  }

  /**
   * Compare two edges for sortEdges. Should have executed that first, as it relies on information looked up in that
   * process.
   * @public
   *
   * @param {Edge} halfEdgeA
   * @param {Edge} halfEdgeB
   * @returns {number}
   */
  static edgeComparison(halfEdgeA, halfEdgeB) {
    const angleA = halfEdgeA.sortVector.x;
    const angleB = halfEdgeB.sortVector.x;

    // Don't allow angleA=-pi, angleB=pi (they are equivalent)
    // If our angle is very small, we need to accept it still if we have two lines (since they will have the same
    // curvature).
    if (Math.abs(angleA - angleB) > 1e-5 || angleA !== angleB && halfEdgeA.edge.segment instanceof Line && halfEdgeB.edge.segment instanceof Line) {
      return angleA < angleB ? -1 : 1;
    } else {
      const curvatureA = halfEdgeA.sortVector.y;
      const curvatureB = halfEdgeB.sortVector.y;
      if (Math.abs(curvatureA - curvatureB) > 1e-5) {
        return curvatureA < curvatureB ? 1 : -1;
      } else {
        throw new Error('TODO: Need to implement more advanced disambiguation ');
      }
    }
  }

  // @public
  freeToPool() {
    Vertex.pool.freeToPool(this);
  }

  // @public
  static pool = new Pool(Vertex);
}
kite.register('Vertex', Vertex);
export default Vertex;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiY2xlYW5BcnJheSIsIlBvb2wiLCJraXRlIiwiTGluZSIsImdsb2JhSWQiLCJWZXJ0ZXgiLCJjb25zdHJ1Y3RvciIsInBvaW50IiwiaWQiLCJpbml0aWFsaXplIiwiYXNzZXJ0IiwiaW5jaWRlbnRIYWxmRWRnZXMiLCJ2aXNpdGVkIiwidmlzaXRJbmRleCIsImxvd0luZGV4IiwiZGF0YSIsImludGVybmFsRGF0YSIsInNlcmlhbGl6ZSIsInR5cGUiLCJWZWN0b3IySU8iLCJ0b1N0YXRlT2JqZWN0IiwibWFwIiwiaGFsZkVkZ2UiLCJkaXNwb3NlIiwiWkVSTyIsImZyZWVUb1Bvb2wiLCJzb3J0RWRnZXMiLCJ2ZWN0b3JzIiwiaSIsImxlbmd0aCIsInB1c2giLCJzb3J0VmVjdG9yIiwic2V0WFkiLCJnZXRFbmRUYW5nZW50IiwiYW5nbGUiLCJnZXRFbmRDdXJ2YXR1cmUiLCJjdXRvZmYiLCJNYXRoIiwiUEkiLCJhdEN1dEFuZ2xlIiwieCIsInZlY3RvciIsInNvcnQiLCJlZGdlQ29tcGFyaXNvbiIsImhhbGZFZGdlQSIsImhhbGZFZGdlQiIsImFuZ2xlQSIsImFuZ2xlQiIsImFicyIsImVkZ2UiLCJzZWdtZW50IiwiY3VydmF0dXJlQSIsInkiLCJjdXJ2YXR1cmVCIiwiRXJyb3IiLCJwb29sIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJWZXJ0ZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBhIHBvaW50IGluIHNwYWNlIHRoYXQgY29ubmVjdHMgdG8gZWRnZXMuIEl0IHN0b3JlcyB0aGUgZWRnZXMgdGhhdCBhcmUgY29ubmVjdGVkIChkaXJlY3Rpb25hbGx5IGFzXHJcbiAqIGhhbGYtZWRnZXMgc2luY2UgQ3ViaWMgc2VnbWVudHMgY2FuIHN0YXJ0IGFuZCBlbmQgYXQgdGhlIHNhbWUgcG9pbnQvdmVydGV4KSwgYW5kIGNhbiBoYW5kbGUgc29ydGluZyBlZGdlcyBzbyB0aGF0XHJcbiAqIGEgaGFsZi1lZGdlJ3MgXCJuZXh0XCIgaGFsZi1lZGdlIChmb2xsb3dpbmcgY291bnRlci1jbG9ja3dpc2UpIGNhbiBiZSBkZXRlcm1pbmVkLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XHJcbmltcG9ydCBQb29sIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sLmpzJztcclxuaW1wb3J0IHsga2l0ZSwgTGluZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxubGV0IGdsb2JhSWQgPSAwO1xyXG5cclxuY2xhc3MgVmVydGV4IHtcclxuICAvKipcclxuICAgKiBAcHVibGljIChraXRlLWludGVybmFsKVxyXG4gICAqXHJcbiAgICogTk9URTogVXNlIFZlcnRleC5wb29sLmNyZWF0ZSBmb3IgbW9zdCB1c2FnZSBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBjb25zdHJ1Y3RvciBkaXJlY3RseS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9pbnQgLSBUaGUgcG9pbnQgd2hlcmUgdGhlIHZlcnRleCBzaG91bGQgYmUgbG9jYXRlZC5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcG9pbnQgKSB7XHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICB0aGlzLmlkID0gKytnbG9iYUlkO1xyXG5cclxuICAgIC8vIE5PVEU6IG1vc3Qgb2JqZWN0IHByb3BlcnRpZXMgYXJlIGRlY2xhcmVkL2RvY3VtZW50ZWQgaW4gdGhlIGluaXRpYWxpemUgbWV0aG9kLiBQbGVhc2UgbG9vayB0aGVyZSBmb3IgbW9zdFxyXG4gICAgLy8gZGVmaW5pdGlvbnMuXHJcbiAgICB0aGlzLmluaXRpYWxpemUoIHBvaW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaW1pbGFyIHRvIGEgdXN1YWwgY29uc3RydWN0b3IsIGJ1dCBpcyBzZXQgdXAgc28gaXQgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyAod2l0aCBkaXNwb3NlKCkgaW4tYmV0d2VlbikgdG9cclxuICAgKiBzdXBwb3J0IHBvb2xpbmcuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9pbnRcclxuICAgKiBAcmV0dXJucyB7VmVydGV4fSAtIFRoaXMgcmVmZXJlbmNlIGZvciBjaGFpbmluZ1xyXG4gICAqL1xyXG4gIGluaXRpYWxpemUoIHBvaW50ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcG9pbnQgaW5zdGFuY2VvZiBWZWN0b3IyICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VmVjdG9yMn1cclxuICAgIHRoaXMucG9pbnQgPSBwb2ludDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48SGFsZkVkZ2U+fSAtIFJlY29yZHMgdGhlIGhhbGYtZWRnZSB0aGF0IHBvaW50cyB0byAoZW5kcyBhdCkgdGhpcyB2ZXJ0ZXguXHJcbiAgICB0aGlzLmluY2lkZW50SGFsZkVkZ2VzID0gY2xlYW5BcnJheSggdGhpcy5pbmNpZGVudEhhbGZFZGdlcyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gVXNlZCBmb3IgZGVwdGgtZmlyc3Qgc2VhcmNoXHJcbiAgICB0aGlzLnZpc2l0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gVmlzaXQgaW5kZXggZm9yIGJyaWRnZSBkZXRlY3Rpb24gKG1vcmUgZWZmaWNpZW50IHRvIGhhdmUgaW5saW5lIGhlcmUpXHJcbiAgICB0aGlzLnZpc2l0SW5kZXggPSAwO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gLSBMb3cgaW5kZXggZm9yIGJyaWRnZSBkZXRlY3Rpb24gKG1vcmUgZWZmaWNpZW50IHRvIGhhdmUgaW5saW5lIGhlcmUpXHJcbiAgICB0aGlzLmxvd0luZGV4ID0gMDtcclxuXHJcbiAgICAvLyBAcHVibGljIHsqfSAtIEF2YWlsYWJsZSBmb3IgYXJiaXRyYXJ5IGNsaWVudCB1c2FnZS4gLS0gS2VlcCBKU09OYWJsZVxyXG4gICAgdGhpcy5kYXRhID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHVibGljIHsqfSAtIGtpdGUtaW50ZXJuYWxcclxuICAgIHRoaXMuaW50ZXJuYWxEYXRhID0ge1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIG9iamVjdCBmb3JtIHRoYXQgY2FuIGJlIHR1cm5lZCBiYWNrIGludG8gYSBzZWdtZW50IHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgZGVzZXJpYWxpemUgbWV0aG9kLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAgICovXHJcbiAgc2VyaWFsaXplKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogJ1ZlcnRleCcsXHJcbiAgICAgIGlkOiB0aGlzLmlkLFxyXG4gICAgICBwb2ludDogVmVjdG9yMi5WZWN0b3IySU8udG9TdGF0ZU9iamVjdCggdGhpcy5wb2ludCApLFxyXG4gICAgICBpbmNpZGVudEhhbGZFZGdlczogdGhpcy5pbmNpZGVudEhhbGZFZGdlcy5tYXAoIGhhbGZFZGdlID0+IGhhbGZFZGdlLmlkICksXHJcbiAgICAgIHZpc2l0ZWQ6IHRoaXMudmlzaXRlZCxcclxuICAgICAgdmlzaXRJbmRleDogdGhpcy52aXNpdEluZGV4LFxyXG4gICAgICBsb3dJbmRleDogdGhpcy5sb3dJbmRleFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgcmVmZXJlbmNlcyAoc28gaXQgY2FuIGFsbG93IG90aGVyIG9iamVjdHMgdG8gYmUgR0MnZWQgb3IgcG9vbGVkKSwgYW5kIGZyZWVzIGl0c2VsZiB0byB0aGUgcG9vbCBzbyBpdFxyXG4gICAqIGNhbiBiZSByZXVzZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLnBvaW50ID0gVmVjdG9yMi5aRVJPO1xyXG4gICAgY2xlYW5BcnJheSggdGhpcy5pbmNpZGVudEhhbGZFZGdlcyApO1xyXG4gICAgdGhpcy5mcmVlVG9Qb29sKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTb3J0cyB0aGUgZWRnZXMgaW4gaW5jcmVhc2luZyBhbmdsZSBvcmRlci5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc29ydEVkZ2VzKCkge1xyXG4gICAgY29uc3QgdmVjdG9ycyA9IFtdOyAvLyB4IGNvb3JkaW5hdGUgd2lsbCBiZSBcImFuZ2xlXCIsIHkgY29vcmRpbmF0ZSB3aWxsIGJlIGN1cnZhdHVyZVxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5pbmNpZGVudEhhbGZFZGdlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgaGFsZkVkZ2UgPSB0aGlzLmluY2lkZW50SGFsZkVkZ2VzWyBpIF07XHJcbiAgICAgIC8vIE5PVEU6IElmIGl0IGlzIGV4cGVuc2l2ZSB0byBwcmVjb21wdXRlIGN1cnZhdHVyZSwgd2UgY291bGQgc2F2ZSBpdCB1bnRpbCBlZGdlQ29tcGFyaXNvbiBuZWVkcyBpdC5cclxuICAgICAgdmVjdG9ycy5wdXNoKCBoYWxmRWRnZS5zb3J0VmVjdG9yLnNldFhZKCBoYWxmRWRnZS5nZXRFbmRUYW5nZW50KCkuYW5nbGUsIGhhbGZFZGdlLmdldEVuZEN1cnZhdHVyZSgpICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBcIlJvdGF0ZVwiIHRoZSBhbmdsZXMgdW50aWwgd2UgYXJlIHN1cmUgdGhhdCBvdXIgXCJjdXRcIiAod2hlcmUgLXBpIGdvZXMgdG8gcGkgYXJvdW5kIHRoZSBjaXJjbGUpIGlzIGF0IGEgcGxhY2VcclxuICAgIC8vIG5vdCBuZWFyIGFueSBhbmdsZS4gVGhpcyBzaG91bGQgcHJldmVudCBhbWJpZ3VpdHkgaW4gc29ydGluZyAod2hpY2ggY2FuIGxlYWQgdG8gYnVncyBpbiB0aGUgb3JkZXIpXHJcbiAgICBjb25zdCBjdXRvZmYgPSAtTWF0aC5QSSArIDFlLTQ7XHJcbiAgICBsZXQgYXRDdXRBbmdsZSA9IGZhbHNlO1xyXG4gICAgd2hpbGUgKCAhYXRDdXRBbmdsZSApIHtcclxuICAgICAgYXRDdXRBbmdsZSA9IHRydWU7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHZlY3RvcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgaWYgKCB2ZWN0b3JzWyBpIF0ueCA8IGN1dG9mZiApIHtcclxuICAgICAgICAgIGF0Q3V0QW5nbGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCAhYXRDdXRBbmdsZSApIHtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB2ZWN0b3JzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgY29uc3QgdmVjdG9yID0gdmVjdG9yc1sgaSBdO1xyXG4gICAgICAgICAgdmVjdG9yLnggLT0gMS42MjU5NDAyNDUxNjsgLy8gRGVmaW5pdGVseSBub3QgY2hvb3NpbmcgcmFuZG9tIGRpZ2l0cyBieSB0eXBpbmchIChzaG91bGRuJ3QgbWF0dGVyKVxyXG4gICAgICAgICAgaWYgKCB2ZWN0b3IueCA8IC1NYXRoLlBJIC0gMWUtNCApIHtcclxuICAgICAgICAgICAgdmVjdG9yLnggKz0gTWF0aC5QSSAqIDI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbmNpZGVudEhhbGZFZGdlcy5zb3J0KCBWZXJ0ZXguZWRnZUNvbXBhcmlzb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXBhcmUgdHdvIGVkZ2VzIGZvciBzb3J0RWRnZXMuIFNob3VsZCBoYXZlIGV4ZWN1dGVkIHRoYXQgZmlyc3QsIGFzIGl0IHJlbGllcyBvbiBpbmZvcm1hdGlvbiBsb29rZWQgdXAgaW4gdGhhdFxyXG4gICAqIHByb2Nlc3MuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFZGdlfSBoYWxmRWRnZUFcclxuICAgKiBAcGFyYW0ge0VkZ2V9IGhhbGZFZGdlQlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgc3RhdGljIGVkZ2VDb21wYXJpc29uKCBoYWxmRWRnZUEsIGhhbGZFZGdlQiApIHtcclxuICAgIGNvbnN0IGFuZ2xlQSA9IGhhbGZFZGdlQS5zb3J0VmVjdG9yLng7XHJcbiAgICBjb25zdCBhbmdsZUIgPSBoYWxmRWRnZUIuc29ydFZlY3Rvci54O1xyXG5cclxuICAgIC8vIERvbid0IGFsbG93IGFuZ2xlQT0tcGksIGFuZ2xlQj1waSAodGhleSBhcmUgZXF1aXZhbGVudClcclxuICAgIC8vIElmIG91ciBhbmdsZSBpcyB2ZXJ5IHNtYWxsLCB3ZSBuZWVkIHRvIGFjY2VwdCBpdCBzdGlsbCBpZiB3ZSBoYXZlIHR3byBsaW5lcyAoc2luY2UgdGhleSB3aWxsIGhhdmUgdGhlIHNhbWVcclxuICAgIC8vIGN1cnZhdHVyZSkuXHJcbiAgICBpZiAoIE1hdGguYWJzKCBhbmdsZUEgLSBhbmdsZUIgKSA+IDFlLTUgfHxcclxuICAgICAgICAgKCBhbmdsZUEgIT09IGFuZ2xlQiAmJiAoIGhhbGZFZGdlQS5lZGdlLnNlZ21lbnQgaW5zdGFuY2VvZiBMaW5lICkgJiYgKCBoYWxmRWRnZUIuZWRnZS5zZWdtZW50IGluc3RhbmNlb2YgTGluZSApICkgKSB7XHJcbiAgICAgIHJldHVybiBhbmdsZUEgPCBhbmdsZUIgPyAtMSA6IDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgY3VydmF0dXJlQSA9IGhhbGZFZGdlQS5zb3J0VmVjdG9yLnk7XHJcbiAgICAgIGNvbnN0IGN1cnZhdHVyZUIgPSBoYWxmRWRnZUIuc29ydFZlY3Rvci55O1xyXG4gICAgICBpZiAoIE1hdGguYWJzKCBjdXJ2YXR1cmVBIC0gY3VydmF0dXJlQiApID4gMWUtNSApIHtcclxuICAgICAgICByZXR1cm4gY3VydmF0dXJlQSA8IGN1cnZhdHVyZUIgPyAxIDogLTE7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnVE9ETzogTmVlZCB0byBpbXBsZW1lbnQgbW9yZSBhZHZhbmNlZCBkaXNhbWJpZ3VhdGlvbiAnICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBmcmVlVG9Qb29sKCkge1xyXG4gICAgVmVydGV4LnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHN0YXRpYyBwb29sID0gbmV3IFBvb2woIFZlcnRleCApO1xyXG59XHJcblxyXG5raXRlLnJlZ2lzdGVyKCAnVmVydGV4JywgVmVydGV4ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWZXJ0ZXg7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLFVBQVUsTUFBTSxxQ0FBcUM7QUFDNUQsT0FBT0MsSUFBSSxNQUFNLCtCQUErQjtBQUNoRCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxlQUFlO0FBRTFDLElBQUlDLE9BQU8sR0FBRyxDQUFDO0FBRWYsTUFBTUMsTUFBTSxDQUFDO0VBQ1g7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsS0FBSyxFQUFHO0lBQ25CO0lBQ0EsSUFBSSxDQUFDQyxFQUFFLEdBQUcsRUFBRUosT0FBTzs7SUFFbkI7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