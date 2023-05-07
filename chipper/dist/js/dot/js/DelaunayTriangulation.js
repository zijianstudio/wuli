// Copyright 2017-2022, University of Colorado Boulder

/**
 * Handles constrained Delaunay triangulation based on "Sweep-line algorithm for constrained Delaunay triangulation"
 * by Domiter and Zalik (2008), with some details provided by "An efficient sweep-line Delaunay triangulation
 * algorithm" by Zalik (2005).
 *
 * TODO: Second (basin) heuristic not yet implemented.
 * TODO: Constraints not yet implemented.
 * TODO: Check number of triangles/edges/vertices with Euler's Formula
 * TODO: Handle "outside" cases (and changing the front edges) for constrained edges
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import arrayRemove from '../../phet-core/js/arrayRemove.js';
import merge from '../../phet-core/js/merge.js';
import Bounds2 from './Bounds2.js';
import dot from './dot.js';
import Utils from './Utils.js';
import Vector2 from './Vector2.js';
class DelaunayTriangulation {
  /**
   * @public
   *
   * @param {Array.<Vector2>} points
   * @param {Array.<Array.<number>>} constraints - Pairs of indices into the points that should be treated as
   *                                               constrained edges.
   * @param {Object} [options]
   */
  constructor(points, constraints, options) {
    options = merge({}, options);
    let i;

    // @public {Array.<Vector2>}
    this.points = points;

    // @public {Array.<Array.<number>>}
    this.constraints = constraints;

    // @public {Array.<Triangle>}
    this.triangles = [];

    // @public {Array.<Edge>}
    this.edges = [];

    // @public {Array.<Vertex>}
    this.convexHull = [];
    if (points.length === 0) {
      return;
    }

    // @private {Array.<Vertex>}
    this.vertices = points.map((point, index) => {
      assert && assert(point instanceof Vector2 && point.isFinite());
      return new Vertex(point, index);
    });
    for (i = 0; i < this.constraints.length; i++) {
      const constraint = this.constraints[i];
      const firstIndex = constraint[0];
      const secondIndex = constraint[1];
      assert && assert(typeof firstIndex === 'number' && isFinite(firstIndex) && firstIndex % 1 === 0 && firstIndex >= 0 && firstIndex < points.length);
      assert && assert(typeof secondIndex === 'number' && isFinite(secondIndex) && secondIndex % 1 === 0 && secondIndex >= 0 && secondIndex < points.length);
      assert && assert(firstIndex !== secondIndex);
      this.vertices[firstIndex].constrainedVertices.push(this.vertices[secondIndex]);
    }
    this.vertices.sort(DelaunayTriangulation.vertexComparison);
    for (i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      vertex.sortedIndex = i;
      for (let j = vertex.constrainedVertices.length - 1; j >= 0; j--) {
        const otherVertex = vertex.constrainedVertices[j];

        // If the "other" vertex is later in the sweep-line order, it should have the reference to the earlier vertex,
        // not the other way around.
        if (otherVertex.sortedIndex === -1) {
          otherVertex.constrainedVertices.push(vertex);
          vertex.constrainedVertices.splice(j, 1);
        }
      }
    }

    // @private {Vertex}
    this.bottomVertex = this.vertices[0];

    // @private {Array.<Vertex>} - Our initialization will handle our first vertex
    this.remainingVertices = this.vertices.slice(1);
    const bounds = Bounds2.NOTHING.copy();
    for (i = points.length - 1; i >= 0; i--) {
      bounds.addPoint(points[i]);
    }
    const alpha = 0.4;
    // @private {Vertex} - Fake index -1
    this.artificialMinVertex = new Vertex(new Vector2(bounds.minX - bounds.width * alpha, bounds.minY - bounds.height * alpha), -1);
    // @private {Vertex} - Fake index -2
    this.artificialMaxVertex = new Vertex(new Vector2(bounds.maxX + bounds.width * alpha, bounds.minY - bounds.height * alpha), -2);
    this.edges.push(new Edge(this.artificialMinVertex, this.artificialMaxVertex));
    this.edges.push(new Edge(this.artificialMaxVertex, this.bottomVertex));
    this.edges.push(new Edge(this.bottomVertex, this.artificialMinVertex));

    // Set up our first (artificial) triangle.
    this.triangles.push(new Triangle(this.artificialMinVertex, this.artificialMaxVertex, this.bottomVertex, this.edges[1], this.edges[2], this.edges[0]));

    // @private {Edge|null} - The start of our front (the edges at the front of the sweep-line)
    this.firstFrontEdge = this.edges[1];
    this.edges[1].connectAfter(this.edges[2]);

    // @private {Edge} - The start of our hull (the edges at the back, making up the convex hull)
    this.firstHullEdge = this.edges[0];
  }

  /**
   * Moves the triangulation forward by a vertex.
   * @private
   */
  step() {
    // TODO: reverse the array prior to this?
    const vertex = this.remainingVertices.shift();
    const x = vertex.point.x;
    let frontEdge = this.firstFrontEdge;
    while (frontEdge) {
      // TODO: epsilon needed here?
      if (x > frontEdge.endVertex.point.x) {
        const edge1 = new Edge(frontEdge.startVertex, vertex);
        const edge2 = new Edge(vertex, frontEdge.endVertex);
        edge1.connectAfter(edge2);
        this.edges.push(edge1);
        this.edges.push(edge2);
        this.triangles.push(new Triangle(frontEdge.endVertex, frontEdge.startVertex, vertex, edge1, edge2, frontEdge));
        this.reconnectFrontEdges(frontEdge, frontEdge, edge1, edge2);
        this.legalizeEdge(frontEdge);
        this.addHalfPiHeuristic(edge1, edge2);
        this.constrainEdges(vertex, edge1, edge2);
        break;
      } else if (x === frontEdge.endVertex.point.x) {
        const leftOldEdge = frontEdge.nextEdge;
        const rightOldEdge = frontEdge;
        assert && assert(leftOldEdge !== null);
        const middleOldVertex = frontEdge.endVertex;
        const leftVertex = leftOldEdge.endVertex;
        const rightVertex = rightOldEdge.startVertex;
        const leftEdge = new Edge(vertex, leftVertex);
        const rightEdge = new Edge(rightVertex, vertex);
        const middleEdge = new Edge(middleOldVertex, vertex);
        rightEdge.connectAfter(leftEdge);
        this.edges.push(leftEdge);
        this.edges.push(rightEdge);
        this.edges.push(middleEdge);
        this.triangles.push(new Triangle(leftVertex, middleOldVertex, vertex, middleEdge, leftEdge, leftOldEdge));
        this.triangles.push(new Triangle(middleOldVertex, rightVertex, vertex, rightEdge, middleEdge, rightOldEdge));
        this.reconnectFrontEdges(rightOldEdge, leftOldEdge, rightEdge, leftEdge);
        this.legalizeEdge(leftOldEdge);
        this.legalizeEdge(rightOldEdge);
        this.legalizeEdge(middleEdge);
        this.addHalfPiHeuristic(rightEdge, leftEdge);
        this.constrainEdges(vertex, rightEdge, leftEdge);
        break;
      }
      frontEdge = frontEdge.nextEdge;
    }
  }

  /**
   * Builds a triangle between two vertices.
   * @private
   *
   * @param {Edge} firstEdge
   * @param {Edge} secondEdge
   * @param {Vertex} firstSideVertex
   * @param {Vertex} middleVertex
   * @param {Vertex} secondSideVertex
   * @returns {Edge} - The newly created edge
   */
  fillBorderTriangle(firstEdge, secondEdge, firstSideVertex, middleVertex, secondSideVertex) {
    assert && assert(firstEdge instanceof Edge);
    assert && assert(secondEdge instanceof Edge);
    assert && assert(firstSideVertex instanceof Vertex);
    assert && assert(middleVertex instanceof Vertex);
    assert && assert(secondSideVertex instanceof Vertex);
    assert && assert(middleVertex === firstEdge.startVertex || middleVertex === firstEdge.endVertex, 'middleVertex should be in firstEdge');
    assert && assert(middleVertex === secondEdge.startVertex || middleVertex === secondEdge.endVertex, 'middleVertex should be in secondEdge');
    assert && assert(firstSideVertex === firstEdge.startVertex || firstSideVertex === firstEdge.endVertex, 'firstSideVertex should be in firstEdge');
    assert && assert(secondSideVertex === secondEdge.startVertex || secondSideVertex === secondEdge.endVertex, 'secondSideVertex should be in secondEdge');
    const newEdge = new Edge(firstSideVertex, secondSideVertex);
    this.edges.push(newEdge);
    this.triangles.push(new Triangle(secondSideVertex, middleVertex, firstSideVertex, firstEdge, newEdge, secondEdge));
    this.legalizeEdge(firstEdge);
    this.legalizeEdge(secondEdge);
    return newEdge;
  }

  /**
   * Disconnects a section of front edges, and connects a new section.
   * @private
   *
   * Disconnects:
   * <nextEdge> (cut) <oldLeftEdge> ..... <oldRightEdge> (cut) <previousEdge>
   *
   * Connects:
   * <nextEdge> (join) <newLeftEdge> ..... <newRightEdge> (join) <previousEdge>
   *
   * If previousEdge is null, we'll need to set our firstFrontEdge to the newRightEdge.
   *
   * @param {Edge} oldRightEdge
   * @param {Edge} oldLeftEdge
   * @param {Edge} newRightEdge
   * @param {Edge} newLeftEdge
   */
  reconnectFrontEdges(oldRightEdge, oldLeftEdge, newRightEdge, newLeftEdge) {
    const previousEdge = oldRightEdge.previousEdge;
    const nextEdge = oldLeftEdge.nextEdge;
    if (previousEdge) {
      previousEdge.disconnectAfter();
      previousEdge.connectAfter(newRightEdge);
    } else {
      this.firstFrontEdge = newRightEdge;
    }
    if (nextEdge) {
      oldLeftEdge.disconnectAfter();
      newLeftEdge.connectAfter(nextEdge);
    }
  }

  /**
   * Tries to fill in acute angles with triangles after we add a vertex into the front.
   * @private
   *
   * @param {Edge} rightFrontEdge
   * @param {Edge} leftFrontEdge
   */
  addHalfPiHeuristic(rightFrontEdge, leftFrontEdge) {
    assert && assert(rightFrontEdge.endVertex === leftFrontEdge.startVertex);
    const middleVertex = rightFrontEdge.endVertex;
    while (rightFrontEdge.previousEdge && Utils.triangleAreaSigned(middleVertex.point, rightFrontEdge.startVertex.point, rightFrontEdge.previousEdge.startVertex.point) > 0 && middleVertex.point.minus(rightFrontEdge.startVertex.point).angleBetween(rightFrontEdge.previousEdge.startVertex.point.minus(rightFrontEdge.startVertex.point)) < Math.PI / 2) {
      const previousEdge = rightFrontEdge.previousEdge;
      const newRightEdge = new Edge(previousEdge.startVertex, middleVertex);
      this.edges.push(newRightEdge);
      this.triangles.push(new Triangle(middleVertex, rightFrontEdge.startVertex, previousEdge.startVertex, previousEdge, newRightEdge, rightFrontEdge));
      this.reconnectFrontEdges(previousEdge, rightFrontEdge, newRightEdge, newRightEdge);
      this.legalizeEdge(previousEdge);
      this.legalizeEdge(rightFrontEdge);
      rightFrontEdge = newRightEdge;
    }
    while (leftFrontEdge.nextEdge && Utils.triangleAreaSigned(middleVertex.point, leftFrontEdge.nextEdge.endVertex.point, leftFrontEdge.endVertex.point) > 0 && middleVertex.point.minus(leftFrontEdge.endVertex.point).angleBetween(leftFrontEdge.nextEdge.endVertex.point.minus(leftFrontEdge.endVertex.point)) < Math.PI / 2) {
      const nextEdge = leftFrontEdge.nextEdge;
      const newLeftEdge = new Edge(middleVertex, nextEdge.endVertex);
      this.edges.push(newLeftEdge);
      this.triangles.push(new Triangle(middleVertex, leftFrontEdge.nextEdge.endVertex, leftFrontEdge.endVertex, nextEdge, leftFrontEdge, newLeftEdge));
      this.reconnectFrontEdges(leftFrontEdge, nextEdge, newLeftEdge, newLeftEdge);
      this.legalizeEdge(nextEdge);
      this.legalizeEdge(leftFrontEdge);
      leftFrontEdge = newLeftEdge;
    }
  }

  /**
   * Handles any "edge events" that delete intersecting edges, creating the new edge, and filling in (all only if
   * necessary).
   * @private
   *
   * @param {Vertex} vertex
   * @param {Edge} rightFrontEdge
   * @param {Edge} leftFrontEdge
   */
  constrainEdges(vertex, rightFrontEdge, leftFrontEdge) {
    assert && assert(vertex instanceof Vertex);
    assert && assert(rightFrontEdge instanceof Edge);
    assert && assert(leftFrontEdge instanceof Edge);
    assert && assert(vertex === rightFrontEdge.endVertex);
    assert && assert(vertex === leftFrontEdge.startVertex);
    for (let i = 0; i < vertex.constrainedVertices.length; i++) {
      const bottomVertex = vertex.constrainedVertices[i];

      // Check if it's one of our front edge vertices (if so, bail out, since the edge already exists)
      if (bottomVertex === rightFrontEdge.startVertex || bottomVertex === leftFrontEdge.endVertex) {
        break;
      }
      const leftEdges = [];
      const rightEdges = [];
      let currentTriangle = null;
      let currentEdge = null;
      const trianglesToRemove = [];
      const edgesToRemove = [];
      let outsideRight = DelaunayTriangulation.vertexProduct(vertex, rightFrontEdge.startVertex, bottomVertex) > 0;
      let outsideLeft = DelaunayTriangulation.vertexProduct(vertex, leftFrontEdge.endVertex, bottomVertex) < 0;

      // If we start inside, we need to identify which triangle we're inside of.
      if (!outsideRight && !outsideLeft) {
        assert && assert(rightFrontEdge.triangles.length === 1);
        assert && assert(leftFrontEdge.triangles.length === 1);
        let lastVertex = rightFrontEdge.startVertex;
        let nextVertex;
        currentTriangle = rightFrontEdge.triangles[0];
        // TODO: Triangle operations to make this more readable
        while (DelaunayTriangulation.vertexProduct(vertex, nextVertex = currentTriangle.getEdgeOppositeFromVertex(vertex).getOtherVertex(lastVertex), bottomVertex) < 0) {
          currentTriangle = currentTriangle.getEdgeOppositeFromVertex(lastVertex).getOtherTriangle(currentTriangle);
          lastVertex = nextVertex;
        }

        // If our initial triangle has our vertex and bottomVertex, then bail out (edge already exists)
        if (currentTriangle.hasVertex(bottomVertex)) {
          break;
        }
        trianglesToRemove.push(currentTriangle);
        currentEdge = currentTriangle.getEdgeOppositeFromVertex(vertex);
        edgesToRemove.push(currentEdge);
        leftEdges.push(currentTriangle.getEdgeOppositeFromVertex(lastVertex));
        rightEdges.push(currentTriangle.getEdgeOppositeFromVertex(currentEdge.getOtherVertex(lastVertex)));
        assert && assert(leftEdges[0].getOtherVertex(vertex).point.x < rightEdges[0].getOtherVertex(vertex).point.x);
      }
      while (true) {
        // eslint-disable-line no-constant-condition
        if (outsideRight) {
          // TODO: implement
          break;
        } else if (outsideLeft) {
          // TODO: implement
          break;
        } else {
          if (currentEdge.triangles.length > 1) {
            const nextTriangle = currentEdge.getOtherTriangle(currentTriangle);
            if (nextTriangle.hasVertex(bottomVertex)) {
              // TODO: do things!
              trianglesToRemove.push(nextTriangle);
              leftEdges.push(nextTriangle.getNextEdge(currentEdge));
              rightEdges.push(nextTriangle.getPreviousEdge(currentEdge));
              break;
            } else {
              // If this is the next edge intersected
              let nextEdge;
              if (nextTriangle.aEdge !== currentEdge && nextTriangle.aEdge.intersectsConstrainedEdge(vertex, bottomVertex)) {
                nextEdge = nextTriangle.aEdge;
              } else if (nextTriangle.bEdge !== currentEdge && nextTriangle.bEdge.intersectsConstrainedEdge(vertex, bottomVertex)) {
                nextEdge = nextTriangle.bEdge;
              } else if (nextTriangle.cEdge !== currentEdge && nextTriangle.cEdge.intersectsConstrainedEdge(vertex, bottomVertex)) {
                nextEdge = nextTriangle.cEdge;
              }
              assert && assert(nextEdge);
              if (nextTriangle.getNextEdge(nextEdge) === currentEdge) {
                leftEdges.push(nextTriangle.getPreviousEdge(nextEdge));
              } else {
                rightEdges.push(nextTriangle.getNextEdge(nextEdge));
              }
              currentEdge = nextEdge;
              edgesToRemove.push(currentEdge);
              currentTriangle = nextTriangle;
              trianglesToRemove.push(currentTriangle);
            }
          }
          // No other triangle, exited
          else {
            if (bottomVertex.point.x < vertex.point.x) {
              outsideLeft = true;
            } else {
              outsideRight = true;
            }
          }
        }
      }
      for (let j = 0; j < trianglesToRemove.length; j++) {
        const triangleToRemove = trianglesToRemove[j];
        arrayRemove(this.triangles, triangleToRemove);
        triangleToRemove.remove();
      }
      for (let j = 0; j < edgesToRemove.length; j++) {
        arrayRemove(this.edges, edgesToRemove[j]);
      }
      const constraintEdge = new Edge(bottomVertex, vertex);
      constraintEdge.isConstrained = true;
      this.edges.push(constraintEdge);
      leftEdges.push(constraintEdge);
      rightEdges.push(constraintEdge);
      rightEdges.reverse(); // Put edges in counterclockwise order

      // TODO: remove this!
      window.triDebug && window.triDebug(this);
      this.triangulatePolygon(leftEdges);
      this.triangulatePolygon(rightEdges);
    }
  }

  /**
   * Creates edges/triangles to triangulate a simple polygon.
   * @private
   *
   * @param {Array.<Edge>} edges - Should be in counterclockwise order
   */
  triangulatePolygon(edges) {
    // TODO: Something more efficient than ear clipping method below
    while (edges.length > 3) {
      for (let k = 0; k < edges.length; k++) {
        const kx = k < edges.length - 1 ? k + 1 : 0;
        assert && assert(edges[k].getSharedVertex(edges[kx]));
      }

      // Check if each triple of vertices is an ear (and if so, remove it)
      for (let i = 0; i < edges.length; i++) {
        // Next index
        const ix = i < edges.length - 1 ? i + 1 : 0;

        // Information about our potential ear
        const edge = edges[i];
        const nextEdge = edges[ix];
        const sharedVertex = edge.getSharedVertex(nextEdge);
        const startVertex = edge.getOtherVertex(sharedVertex);
        const endVertex = nextEdge.getOtherVertex(sharedVertex);
        if (Utils.triangleAreaSigned(startVertex.point, sharedVertex.point, endVertex.point) <= 0) {
          continue;
        }

        // Variables for computing barycentric coordinates
        const endDelta = endVertex.point.minus(sharedVertex.point);
        const startDelta = startVertex.point.minus(sharedVertex.point);
        const endMagnitudeSquared = endDelta.dot(endDelta);
        const startEndProduct = endDelta.dot(startDelta);
        const startMagnitudeSquared = startDelta.dot(startDelta);
        const x = endMagnitudeSquared * startMagnitudeSquared - startEndProduct * startEndProduct;

        // See if there are other vertices in our triangle (it wouldn't be an ear if there is another in it)
        let lastVertex = edges[0].getSharedVertex(edges[edges.length - 1]);
        let hasInteriorVertex = false;
        for (let j = 0; j < edges.length; j++) {
          const vertex = edges[j].getOtherVertex(lastVertex);
          if (vertex !== sharedVertex && vertex !== startVertex && vertex !== endVertex) {
            const pointDelta = vertex.point.minus(sharedVertex.point);
            const pointEndProduct = endDelta.dot(pointDelta);
            const pointStartProduct = startDelta.dot(pointDelta);

            // Compute barycentric coordinates
            const u = (startMagnitudeSquared * pointEndProduct - startEndProduct * pointStartProduct) / x;
            const v = (endMagnitudeSquared * pointStartProduct - startEndProduct * pointEndProduct) / x;

            // Test for whether the point is in our triangle
            if (u >= -1e-10 && v >= -1e-10 && u + v < 1 + 1e-10) {
              hasInteriorVertex = true;
              break;
            }
          }
          lastVertex = vertex;
        }

        // If there is no interior vertex, then we reached an ear.
        if (!hasInteriorVertex) {
          const newEdge = new Edge(startVertex, endVertex);
          this.edges.push(newEdge);
          this.triangles.push(new Triangle(startVertex, sharedVertex, endVertex, nextEdge, newEdge, edge));
          if (ix > i) {
            edges.splice(i, 2, newEdge);
          } else {
            edges.splice(i, 1, newEdge);
            edges.splice(ix, 1);
          }

          // TODO: remove this!
          window.triDebug && window.triDebug(this);
        }
      }
    }

    // Fill in the last triangle
    if (edges.length === 3) {
      this.triangles.push(new Triangle(edges[0].getSharedVertex(edges[1]), edges[1].getSharedVertex(edges[2]), edges[0].getSharedVertex(edges[2]), edges[2], edges[0], edges[1]));

      // TODO: remove this!
      window.triDebug && window.triDebug(this);
    }
  }

  /**
   * Should be called when there are no more remaining vertices left to be processed.
   * @private
   */
  finalize() {
    // Accumulate front edges, excluding the first and last.
    const frontEdges = [];
    let frontEdge = this.firstFrontEdge.nextEdge;
    while (frontEdge && frontEdge.nextEdge) {
      frontEdges.push(frontEdge);
      frontEdge = frontEdge.nextEdge;
    }
    const firstFrontEdge = this.firstFrontEdge;
    const lastFrontEdge = frontEdge;
    assert && assert(this.firstFrontEdge.triangles.length === 1);
    assert && assert(lastFrontEdge.triangles.length === 1);

    // Handle adding any triangles not in the convex hull (on the front edge)
    for (let i = 0; i < frontEdges.length - 1; i++) {
      const firstEdge = frontEdges[i];
      const secondEdge = frontEdges[i + 1];
      if (Utils.triangleAreaSigned(secondEdge.endVertex.point, firstEdge.endVertex.point, firstEdge.startVertex.point) > 1e-10) {
        const newEdge = this.fillBorderTriangle(firstEdge, secondEdge, firstEdge.startVertex, firstEdge.endVertex, secondEdge.endVertex);
        frontEdges.splice(i, 2, newEdge);
        // start scanning from behind where we were previously (if possible)
        i = Math.max(i - 2, -1);
        // TODO: remove this!
        window.triDebug && window.triDebug(this);
      }
    }

    // Clear out front edge information, no longer needed.
    this.firstFrontEdge = null;

    // Accumulate back edges and items to get rid of
    const backEdges = [];
    const artificialEdges = [firstFrontEdge];
    let currentSplitEdge = firstFrontEdge;
    while (currentSplitEdge !== lastFrontEdge) {
      const nextTriangle = currentSplitEdge.triangles[0];
      nextTriangle.remove();
      arrayRemove(this.triangles, nextTriangle);
      const edge = nextTriangle.getNonArtificialEdge();
      if (edge) {
        backEdges.push(edge);
        const sharedVertex = edge.getSharedVertex(currentSplitEdge);
        currentSplitEdge = nextTriangle.getEdgeOppositeFromVertex(sharedVertex);
      }
      // Our min-max-bottomPoint triangle (pivot, no edge to add)
      else {
        assert && assert(currentSplitEdge.startVertex === this.artificialMaxVertex);

        // Remove the "bottom" edge connecting both artificial points
        artificialEdges.push(nextTriangle.getEdgeOppositeFromVertex(currentSplitEdge.endVertex));

        // Pivot
        currentSplitEdge = nextTriangle.getEdgeOppositeFromVertex(currentSplitEdge.startVertex);
      }
      artificialEdges.push(currentSplitEdge);
    }
    for (let i = 0; i < artificialEdges.length; i++) {
      arrayRemove(this.edges, artificialEdges[i]);
    }

    // TODO: remove this!
    window.triDebug && window.triDebug(this);

    // Handle adding any triangles not in the convex hull (on the back edge)
    for (let i = 0; i < backEdges.length - 1; i++) {
      const firstEdge = backEdges[i + 1];
      const secondEdge = backEdges[i];
      const sharedVertex = firstEdge.getSharedVertex(secondEdge);
      const firstVertex = firstEdge.getOtherVertex(sharedVertex);
      const secondVertex = secondEdge.getOtherVertex(sharedVertex);
      if (Utils.triangleAreaSigned(secondVertex.point, sharedVertex.point, firstVertex.point) > 1e-10) {
        const newEdge = this.fillBorderTriangle(firstEdge, secondEdge, firstVertex, sharedVertex, secondVertex);
        backEdges.splice(i, 2, newEdge);
        // start scanning from behind where we were previously (if possible)
        i = Math.max(i - 2, -1);
        // TODO: remove this!
        window.triDebug && window.triDebug(this);
      }
    }
    for (let i = 0; i < frontEdges.length; i++) {
      this.convexHull.push(frontEdges[i].startVertex);
    }
    this.convexHull.push(frontEdges[frontEdges.length - 1].endVertex);
    for (let i = backEdges.length - 1; i >= 1; i--) {
      this.convexHull.push(backEdges[i].getSharedVertex(backEdges[i - 1]));
    }
  }

  /**
   * Checks an edge to see whether its two adjacent triangles satisfy the delaunay condition (the far point of one
   * triangle should not be contained in the other triangle's circumcircle), and if it is not satisfied, flips the
   * edge so the condition is satisfied.
   * @private
   *
   * @param {Edge} edge
   */
  legalizeEdge(edge) {
    // Checking each edge to see if it isn't in our triangulation anymore (or can't be illegal because it doesn't
    // have multiple triangles) helps a lot.
    if (!_.includes(this.edges, edge) || edge.triangles.length !== 2 || edge.isConstrained) {
      return;
    }
    const triangle1 = edge.triangles[0];
    const triangle2 = edge.triangles[1];
    const farVertex1 = triangle1.getVertexOppositeFromEdge(edge);
    const farVertex2 = triangle2.getVertexOppositeFromEdge(edge);
    if (Utils.pointInCircleFromPoints(triangle1.aVertex.point, triangle1.bVertex.point, triangle1.cVertex.point, farVertex2.point) || Utils.pointInCircleFromPoints(triangle2.aVertex.point, triangle2.bVertex.point, triangle2.cVertex.point, farVertex1.point)) {
      // TODO: better helper functions for adding/removing triangles (takes care of the edge stuff)
      triangle1.remove();
      triangle2.remove();
      arrayRemove(this.triangles, triangle1);
      arrayRemove(this.triangles, triangle2);
      arrayRemove(this.edges, edge);
      const newEdge = new Edge(farVertex1, farVertex2);
      this.edges.push(newEdge);
      const triangle1Edge1 = triangle2.getEdgeOppositeFromVertex(triangle2.getVertexBefore(farVertex2));
      const triangle1Edge2 = triangle1.getEdgeOppositeFromVertex(triangle1.getVertexAfter(farVertex1));
      const triangle2Edge1 = triangle1.getEdgeOppositeFromVertex(triangle1.getVertexBefore(farVertex1));
      const triangle2Edge2 = triangle2.getEdgeOppositeFromVertex(triangle2.getVertexAfter(farVertex2));

      // Construct the new triangles with the correct orientations
      this.triangles.push(new Triangle(farVertex1, farVertex2, triangle1.getVertexBefore(farVertex1), triangle1Edge1, triangle1Edge2, newEdge));
      this.triangles.push(new Triangle(farVertex2, farVertex1, triangle2.getVertexBefore(farVertex2), triangle2Edge1, triangle2Edge2, newEdge));
      this.legalizeEdge(triangle1Edge1);
      this.legalizeEdge(triangle1Edge2);
      this.legalizeEdge(triangle2Edge1);
      this.legalizeEdge(triangle2Edge2);
    }
  }

  /**
   * Comparison for sorting points by y, then by x.
   * @private
   *
   * TODO: Do we need to reverse the x sort? "If our edge is horizontal, the ending point with smaller x coordinate
   *       is considered as the upper point"?
   *
   * @param {Vertex} a
   * @param {Vertex} b
   * @returns {number}
   */
  static vertexComparison(a, b) {
    assert && assert(a instanceof Vertex);
    assert && assert(b instanceof Vertex);
    a = a.point;
    b = b.point;
    if (a.y < b.y) {
      return -1;
    } else if (a.y > b.y) {
      return 1;
    } else if (a.x < b.x) {
      return -1;
    } else if (a.x > b.x) {
      return 1;
    } else {
      // NOTE: How would the algorithm work if this is the case? Would the comparison ever test the reflexive
      // property?
      return 0;
    }
  }

  /**
   * Returns the cross product of (aVertex-sharedVertex) and (bVertex-sharedVertex)
   * @private
   *
   * @param {Vertex} sharedVertex
   * @param {Vertex} aVertex
   * @param {Vertex} bVertex
   * @returns {number}
   */
  static vertexProduct(sharedVertex, aVertex, bVertex) {
    const aDiff = aVertex.point.minus(sharedVertex.point);
    const bDiff = bVertex.point.minus(sharedVertex.point);
    return aDiff.crossScalar(bDiff);
  }
}
dot.register('DelaunayTriangulation', DelaunayTriangulation);
class Vertex {
  /**
   * Vertex (point with an index)
   * @private
   *
   * @param {Vector2} point
   * @param {number} index - Index of the point in the points array
   */
  constructor(point, index) {
    assert && assert(point instanceof Vector2);
    assert && assert(point.isFinite());
    assert && assert(typeof index === 'number');

    // @public {Vector2}
    this.point = point;

    // @public {number}
    this.index = index;

    // @public {number} - Will be set after construction
    this.sortedIndex = -1;

    // @public {Array.<Vertex>} - Vertices with "lower" y values that have constrained edges with this vertex.
    this.constrainedVertices = [];
  }

  /**
   * Returns whether this is an artificial vertex (index less than zero).
   * @public
   *
   * @returns {boolean}
   */
  isArtificial() {
    return this.index < 0;
  }
}
class Edge {
  /**
   * Edge defined by two vertices
   * @private
   *
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   */
  constructor(startVertex, endVertex) {
    assert && assert(startVertex instanceof Vertex);
    assert && assert(endVertex instanceof Vertex);
    assert && assert(startVertex !== endVertex, 'Should be different vertices');

    // @public {Vertex}
    this.startVertex = startVertex;
    this.endVertex = endVertex;

    // @public {Array.<Triangle>} - Adjacent triangles to the edge
    this.triangles = [];

    // @public {Edge|null} - Linked list for the front of the sweep-line (or in the back for the convex hull)
    this.nextEdge = null;
    this.previousEdge = null;

    // @public {boolean} - Can be set to note that it was constrained
    this.isConstrained = false;
  }

  /**
   * Returns whether this is an artificial edge (has an artificial vertex)
   * @public
   *
   * @returns {boolean}
   */
  isArtificial() {
    return this.startVertex.isArtificial() || this.endVertex.isArtificial();
  }

  /**
   * Appends the edge to the end of this edge (for our linked list).
   * @public
   *
   * @param {Edge} edge
   */
  connectAfter(edge) {
    assert && assert(edge instanceof Edge);
    assert && assert(this.endVertex === edge.startVertex);
    this.nextEdge = edge;
    edge.previousEdge = this;
  }

  /**
   * @public
   */
  disconnectAfter() {
    this.nextEdge.previousEdge = null;
    this.nextEdge = null;
  }

  /**
   * Adds an adjacent triangle.
   * @public
   *
   * @param {Triangle} triangle
   */
  addTriangle(triangle) {
    assert && assert(triangle instanceof Triangle);
    assert && assert(this.triangles.length <= 1);
    this.triangles.push(triangle);
  }

  /**
   * Removes an adjacent triangle.
   * @public
   *
   * @param {Triangle} triangle
   */
  removeTriangle(triangle) {
    assert && assert(triangle instanceof Triangle);
    assert && assert(_.includes(this.triangles, triangle));
    arrayRemove(this.triangles, triangle);
  }

  /**
   * Returns the triangle in common with both edges.
   * @public
   *
   * @param {Edge} otherEdge
   * @returns {Triangle}
   */
  getSharedTriangle(otherEdge) {
    assert && assert(otherEdge instanceof Edge);
    for (let i = 0; i < this.triangles.length; i++) {
      const triangle = this.triangles[i];
      for (let j = 0; j < otherEdge.triangles.length; j++) {
        if (otherEdge.triangles[j] === triangle) {
          return triangle;
        }
      }
    }
    throw new Error('No common triangle');
  }

  /**
   * Returns the vertex in common with both edges.
   * @public
   *
   * @param {Edge} otherEdge
   * @returns {Vertex}
   */
  getSharedVertex(otherEdge) {
    assert && assert(otherEdge instanceof Edge);
    if (this.startVertex === otherEdge.startVertex || this.startVertex === otherEdge.endVertex) {
      return this.startVertex;
    } else {
      assert && assert(this.endVertex === otherEdge.startVertex || this.endVertex === otherEdge.endVertex);
      return this.endVertex;
    }
  }

  /**
   * Returns the other vertex of the edge.
   * @public
   *
   * @param {Vertex} vertex
   * @returns {Vertex}
   */
  getOtherVertex(vertex) {
    assert && assert(vertex instanceof Vertex);
    assert && assert(vertex === this.startVertex || vertex === this.endVertex);
    if (vertex === this.startVertex) {
      return this.endVertex;
    } else {
      return this.startVertex;
    }
  }

  /**
   * Returns the other triangle associated with this edge (if there are two).
   * @public
   *
   * @param {Triangle} triangle
   * @returns {Triangle}
   */
  getOtherTriangle(triangle) {
    assert && assert(triangle instanceof Triangle);
    assert && assert(this.triangles.length === 2);
    if (this.triangles[0] === triangle) {
      return this.triangles[1];
    } else {
      return this.triangles[0];
    }
  }

  /**
   * Returns whether the line segment defined between the vertex and bottomVertex intersect this edge.
   * @public
   *
   * @param {Vertex} vertex
   * @param {Vertex} bottomVertex
   * @returns {boolean}
   */
  intersectsConstrainedEdge(vertex, bottomVertex) {
    return Utils.lineSegmentIntersection(vertex.point.x, vertex.point.y, bottomVertex.point.x, bottomVertex.point.y, this.startVertex.point.x, this.startVertex.point.y, this.endVertex.point.x, this.endVertex.point.y);
  }
}
class Triangle {
  /**
   * Triangle defined by three vertices (with edges)
   * @private
   *
   * @param {Vertex} aVertex
   * @param {Vertex} bVertex
   * @param {Vertex} cVertex
   * @param {Edge} aEdge - Edge opposite the 'a' vertex
   * @param {Edge} bEdge - Edge opposite the 'b' vertex
   * @param {Edge} cEdge - Edge opposite the 'c' vertex
   */
  constructor(aVertex, bVertex, cVertex, aEdge, bEdge, cEdge) {
    // Type checks
    assert && assert(aVertex instanceof Vertex);
    assert && assert(bVertex instanceof Vertex);
    assert && assert(cVertex instanceof Vertex);
    assert && assert(aEdge instanceof Edge);
    assert && assert(bEdge instanceof Edge);
    assert && assert(cEdge instanceof Edge);

    // Ensure each vertex is NOT in the opposite edge
    assert && assert(aVertex !== aEdge.startVertex && aVertex !== aEdge.endVertex, 'Should be an opposite edge');
    assert && assert(bVertex !== bEdge.startVertex && bVertex !== bEdge.endVertex, 'Should be an opposite edge');
    assert && assert(cVertex !== cEdge.startVertex && cVertex !== cEdge.endVertex, 'Should be an opposite edge');

    // Ensure each vertex IS in its adjacent edges
    assert && assert(aVertex === bEdge.startVertex || aVertex === bEdge.endVertex, 'aVertex should be in bEdge');
    assert && assert(aVertex === cEdge.startVertex || aVertex === cEdge.endVertex, 'aVertex should be in cEdge');
    assert && assert(bVertex === aEdge.startVertex || bVertex === aEdge.endVertex, 'bVertex should be in aEdge');
    assert && assert(bVertex === cEdge.startVertex || bVertex === cEdge.endVertex, 'bVertex should be in cEdge');
    assert && assert(cVertex === aEdge.startVertex || cVertex === aEdge.endVertex, 'cVertex should be in aEdge');
    assert && assert(cVertex === bEdge.startVertex || cVertex === bEdge.endVertex, 'cVertex should be in bEdge');
    assert && assert(Utils.triangleAreaSigned(aVertex.point, bVertex.point, cVertex.point) > 0, 'Should be counterclockwise');

    // @public {Vertex}
    this.aVertex = aVertex;
    this.bVertex = bVertex;
    this.cVertex = cVertex;

    // @public {Edge}
    this.aEdge = aEdge;
    this.bEdge = bEdge;
    this.cEdge = cEdge;
    this.aEdge.addTriangle(this);
    this.bEdge.addTriangle(this);
    this.cEdge.addTriangle(this);
  }

  /**
   * Returns whether the vertex is one in the triangle.
   * @public
   *
   * @param {Vertex} vertex
   * @returns {boolean}
   */
  hasVertex(vertex) {
    return this.aVertex === vertex || this.bVertex === vertex || this.cVertex === vertex;
  }

  /**
   * Returns the vertex that is opposite from the given edge.
   * @public
   *
   * @param {Edge} edge
   * @returns {Vertex}
   */
  getVertexOppositeFromEdge(edge) {
    assert && assert(edge instanceof Edge);
    assert && assert(edge === this.aEdge || edge === this.bEdge || edge === this.cEdge, 'Should be an edge that is part of this triangle');
    if (edge === this.aEdge) {
      return this.aVertex;
    } else if (edge === this.bEdge) {
      return this.bVertex;
    } else {
      return this.cVertex;
    }
  }

  /**
   * Returns the edge that is opposite from the given vertex.
   * @public
   *
   * @param {Vertex} vertex
   * @returns {Edge}
   */
  getEdgeOppositeFromVertex(vertex) {
    assert && assert(vertex instanceof Vertex);
    assert && assert(vertex === this.aVertex || vertex === this.bVertex || vertex === this.cVertex, 'Should be a vertex that is part of this triangle');
    if (vertex === this.aVertex) {
      return this.aEdge;
    } else if (vertex === this.bVertex) {
      return this.bEdge;
    } else {
      return this.cEdge;
    }
  }

  /**
   * Returns the vertex that is just before the given vertex (in counterclockwise order).
   * @public
   *
   * @param {Vertex} vertex
   * @returns {Vertex}
   */
  getVertexBefore(vertex) {
    assert && assert(vertex instanceof Vertex);
    assert && assert(vertex === this.aVertex || vertex === this.bVertex || vertex === this.cVertex);
    if (vertex === this.aVertex) {
      return this.cVertex;
    } else if (vertex === this.bVertex) {
      return this.aVertex;
    } else {
      return this.bVertex;
    }
  }

  /**
   * Returns the vertex that is just after the given vertex (in counterclockwise order).
   * @public
   *
   * @param {Vertex} vertex
   * @returns {Vertex}
   */
  getVertexAfter(vertex) {
    assert && assert(vertex instanceof Vertex);
    assert && assert(vertex === this.aVertex || vertex === this.bVertex || vertex === this.cVertex);
    if (vertex === this.aVertex) {
      return this.bVertex;
    } else if (vertex === this.bVertex) {
      return this.cVertex;
    } else {
      return this.aVertex;
    }
  }

  /**
   * Returns the one non-artificial edge in the triangle (assuming it exists).
   * @public
   *
   * @returns {Edge|null}
   */
  getNonArtificialEdge() {
    assert && assert(this.aEdge.isArtificial() && this.bEdge.isArtificial() && !this.cEdge.isArtificial() || this.aEdge.isArtificial() && !this.bEdge.isArtificial() && this.cEdge.isArtificial() || !this.aEdge.isArtificial() && this.bEdge.isArtificial() && this.cEdge.isArtificial() || this.aEdge.isArtificial() && this.bEdge.isArtificial() && this.cEdge.isArtificial(), 'At most one edge should be non-artificial');
    if (!this.aEdge.isArtificial()) {
      return this.aEdge;
    } else if (!this.bEdge.isArtificial()) {
      return this.bEdge;
    } else if (!this.cEdge.isArtificial()) {
      return this.cEdge;
    } else {
      return null;
    }
  }

  /**
   * Returns the next edge (counterclockwise).
   * @public
   *
   * @param {Edge} edge
   * @returns {Edge}
   */
  getNextEdge(edge) {
    assert && assert(edge === this.aEdge || edge === this.bEdge || edge === this.cEdge);
    if (this.aEdge === edge) {
      return this.bEdge;
    }
    if (this.bEdge === edge) {
      return this.cEdge;
    }
    if (this.cEdge === edge) {
      return this.aEdge;
    }
    throw new Error('illegal edge');
  }

  /**
   * Returns the previous edge (clockwise).
   * @public
   *
   * @param {Edge} edge
   * @returns {Edge}
   */
  getPreviousEdge(edge) {
    assert && assert(edge === this.aEdge || edge === this.bEdge || edge === this.cEdge);
    if (this.aEdge === edge) {
      return this.cEdge;
    }
    if (this.bEdge === edge) {
      return this.aEdge;
    }
    if (this.cEdge === edge) {
      return this.bEdge;
    }
    throw new Error('illegal edge');
  }

  /**
   * Returns whether this is an artificial triangle (has an artificial vertex)
   * @public
   *
   * @returns {boolean}
   */
  isArtificial() {
    return this.aVertex.isArtificial() || this.bVertex.isArtificial() || this.cVertex.isArtificial();
  }

  /**
   * @public
   */
  remove() {
    this.aEdge.removeTriangle(this);
    this.bEdge.removeTriangle(this);
    this.cEdge.removeTriangle(this);
  }
}
export default DelaunayTriangulation;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcnJheVJlbW92ZSIsIm1lcmdlIiwiQm91bmRzMiIsImRvdCIsIlV0aWxzIiwiVmVjdG9yMiIsIkRlbGF1bmF5VHJpYW5ndWxhdGlvbiIsImNvbnN0cnVjdG9yIiwicG9pbnRzIiwiY29uc3RyYWludHMiLCJvcHRpb25zIiwiaSIsInRyaWFuZ2xlcyIsImVkZ2VzIiwiY29udmV4SHVsbCIsImxlbmd0aCIsInZlcnRpY2VzIiwibWFwIiwicG9pbnQiLCJpbmRleCIsImFzc2VydCIsImlzRmluaXRlIiwiVmVydGV4IiwiY29uc3RyYWludCIsImZpcnN0SW5kZXgiLCJzZWNvbmRJbmRleCIsImNvbnN0cmFpbmVkVmVydGljZXMiLCJwdXNoIiwic29ydCIsInZlcnRleENvbXBhcmlzb24iLCJ2ZXJ0ZXgiLCJzb3J0ZWRJbmRleCIsImoiLCJvdGhlclZlcnRleCIsInNwbGljZSIsImJvdHRvbVZlcnRleCIsInJlbWFpbmluZ1ZlcnRpY2VzIiwic2xpY2UiLCJib3VuZHMiLCJOT1RISU5HIiwiY29weSIsImFkZFBvaW50IiwiYWxwaGEiLCJhcnRpZmljaWFsTWluVmVydGV4IiwibWluWCIsIndpZHRoIiwibWluWSIsImhlaWdodCIsImFydGlmaWNpYWxNYXhWZXJ0ZXgiLCJtYXhYIiwiRWRnZSIsIlRyaWFuZ2xlIiwiZmlyc3RGcm9udEVkZ2UiLCJjb25uZWN0QWZ0ZXIiLCJmaXJzdEh1bGxFZGdlIiwic3RlcCIsInNoaWZ0IiwieCIsImZyb250RWRnZSIsImVuZFZlcnRleCIsImVkZ2UxIiwic3RhcnRWZXJ0ZXgiLCJlZGdlMiIsInJlY29ubmVjdEZyb250RWRnZXMiLCJsZWdhbGl6ZUVkZ2UiLCJhZGRIYWxmUGlIZXVyaXN0aWMiLCJjb25zdHJhaW5FZGdlcyIsImxlZnRPbGRFZGdlIiwibmV4dEVkZ2UiLCJyaWdodE9sZEVkZ2UiLCJtaWRkbGVPbGRWZXJ0ZXgiLCJsZWZ0VmVydGV4IiwicmlnaHRWZXJ0ZXgiLCJsZWZ0RWRnZSIsInJpZ2h0RWRnZSIsIm1pZGRsZUVkZ2UiLCJmaWxsQm9yZGVyVHJpYW5nbGUiLCJmaXJzdEVkZ2UiLCJzZWNvbmRFZGdlIiwiZmlyc3RTaWRlVmVydGV4IiwibWlkZGxlVmVydGV4Iiwic2Vjb25kU2lkZVZlcnRleCIsIm5ld0VkZ2UiLCJvbGRSaWdodEVkZ2UiLCJvbGRMZWZ0RWRnZSIsIm5ld1JpZ2h0RWRnZSIsIm5ld0xlZnRFZGdlIiwicHJldmlvdXNFZGdlIiwiZGlzY29ubmVjdEFmdGVyIiwicmlnaHRGcm9udEVkZ2UiLCJsZWZ0RnJvbnRFZGdlIiwidHJpYW5nbGVBcmVhU2lnbmVkIiwibWludXMiLCJhbmdsZUJldHdlZW4iLCJNYXRoIiwiUEkiLCJsZWZ0RWRnZXMiLCJyaWdodEVkZ2VzIiwiY3VycmVudFRyaWFuZ2xlIiwiY3VycmVudEVkZ2UiLCJ0cmlhbmdsZXNUb1JlbW92ZSIsImVkZ2VzVG9SZW1vdmUiLCJvdXRzaWRlUmlnaHQiLCJ2ZXJ0ZXhQcm9kdWN0Iiwib3V0c2lkZUxlZnQiLCJsYXN0VmVydGV4IiwibmV4dFZlcnRleCIsImdldEVkZ2VPcHBvc2l0ZUZyb21WZXJ0ZXgiLCJnZXRPdGhlclZlcnRleCIsImdldE90aGVyVHJpYW5nbGUiLCJoYXNWZXJ0ZXgiLCJuZXh0VHJpYW5nbGUiLCJnZXROZXh0RWRnZSIsImdldFByZXZpb3VzRWRnZSIsImFFZGdlIiwiaW50ZXJzZWN0c0NvbnN0cmFpbmVkRWRnZSIsImJFZGdlIiwiY0VkZ2UiLCJ0cmlhbmdsZVRvUmVtb3ZlIiwicmVtb3ZlIiwiY29uc3RyYWludEVkZ2UiLCJpc0NvbnN0cmFpbmVkIiwicmV2ZXJzZSIsIndpbmRvdyIsInRyaURlYnVnIiwidHJpYW5ndWxhdGVQb2x5Z29uIiwiayIsImt4IiwiZ2V0U2hhcmVkVmVydGV4IiwiaXgiLCJlZGdlIiwic2hhcmVkVmVydGV4IiwiZW5kRGVsdGEiLCJzdGFydERlbHRhIiwiZW5kTWFnbml0dWRlU3F1YXJlZCIsInN0YXJ0RW5kUHJvZHVjdCIsInN0YXJ0TWFnbml0dWRlU3F1YXJlZCIsImhhc0ludGVyaW9yVmVydGV4IiwicG9pbnREZWx0YSIsInBvaW50RW5kUHJvZHVjdCIsInBvaW50U3RhcnRQcm9kdWN0IiwidSIsInYiLCJmaW5hbGl6ZSIsImZyb250RWRnZXMiLCJsYXN0RnJvbnRFZGdlIiwibWF4IiwiYmFja0VkZ2VzIiwiYXJ0aWZpY2lhbEVkZ2VzIiwiY3VycmVudFNwbGl0RWRnZSIsImdldE5vbkFydGlmaWNpYWxFZGdlIiwiZmlyc3RWZXJ0ZXgiLCJzZWNvbmRWZXJ0ZXgiLCJfIiwiaW5jbHVkZXMiLCJ0cmlhbmdsZTEiLCJ0cmlhbmdsZTIiLCJmYXJWZXJ0ZXgxIiwiZ2V0VmVydGV4T3Bwb3NpdGVGcm9tRWRnZSIsImZhclZlcnRleDIiLCJwb2ludEluQ2lyY2xlRnJvbVBvaW50cyIsImFWZXJ0ZXgiLCJiVmVydGV4IiwiY1ZlcnRleCIsInRyaWFuZ2xlMUVkZ2UxIiwiZ2V0VmVydGV4QmVmb3JlIiwidHJpYW5nbGUxRWRnZTIiLCJnZXRWZXJ0ZXhBZnRlciIsInRyaWFuZ2xlMkVkZ2UxIiwidHJpYW5nbGUyRWRnZTIiLCJhIiwiYiIsInkiLCJhRGlmZiIsImJEaWZmIiwiY3Jvc3NTY2FsYXIiLCJyZWdpc3RlciIsImlzQXJ0aWZpY2lhbCIsImFkZFRyaWFuZ2xlIiwidHJpYW5nbGUiLCJyZW1vdmVUcmlhbmdsZSIsImdldFNoYXJlZFRyaWFuZ2xlIiwib3RoZXJFZGdlIiwiRXJyb3IiLCJsaW5lU2VnbWVudEludGVyc2VjdGlvbiJdLCJzb3VyY2VzIjpbIkRlbGF1bmF5VHJpYW5ndWxhdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBIYW5kbGVzIGNvbnN0cmFpbmVkIERlbGF1bmF5IHRyaWFuZ3VsYXRpb24gYmFzZWQgb24gXCJTd2VlcC1saW5lIGFsZ29yaXRobSBmb3IgY29uc3RyYWluZWQgRGVsYXVuYXkgdHJpYW5ndWxhdGlvblwiXHJcbiAqIGJ5IERvbWl0ZXIgYW5kIFphbGlrICgyMDA4KSwgd2l0aCBzb21lIGRldGFpbHMgcHJvdmlkZWQgYnkgXCJBbiBlZmZpY2llbnQgc3dlZXAtbGluZSBEZWxhdW5heSB0cmlhbmd1bGF0aW9uXHJcbiAqIGFsZ29yaXRobVwiIGJ5IFphbGlrICgyMDA1KS5cclxuICpcclxuICogVE9ETzogU2Vjb25kIChiYXNpbikgaGV1cmlzdGljIG5vdCB5ZXQgaW1wbGVtZW50ZWQuXHJcbiAqIFRPRE86IENvbnN0cmFpbnRzIG5vdCB5ZXQgaW1wbGVtZW50ZWQuXHJcbiAqIFRPRE86IENoZWNrIG51bWJlciBvZiB0cmlhbmdsZXMvZWRnZXMvdmVydGljZXMgd2l0aCBFdWxlcidzIEZvcm11bGFcclxuICogVE9ETzogSGFuZGxlIFwib3V0c2lkZVwiIGNhc2VzIChhbmQgY2hhbmdpbmcgdGhlIGZyb250IGVkZ2VzKSBmb3IgY29uc3RyYWluZWQgZWRnZXNcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcclxuXHJcbmNsYXNzIERlbGF1bmF5VHJpYW5ndWxhdGlvbiB7XHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48VmVjdG9yMj59IHBvaW50c1xyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEFycmF5LjxudW1iZXI+Pn0gY29uc3RyYWludHMgLSBQYWlycyBvZiBpbmRpY2VzIGludG8gdGhlIHBvaW50cyB0aGF0IHNob3VsZCBiZSB0cmVhdGVkIGFzXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cmFpbmVkIGVkZ2VzLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcG9pbnRzLCBjb25zdHJhaW50cywgb3B0aW9ucyApIHtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge30sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBsZXQgaTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48VmVjdG9yMj59XHJcbiAgICB0aGlzLnBvaW50cyA9IHBvaW50cztcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48QXJyYXkuPG51bWJlcj4+fVxyXG4gICAgdGhpcy5jb25zdHJhaW50cyA9IGNvbnN0cmFpbnRzO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxUcmlhbmdsZT59XHJcbiAgICB0aGlzLnRyaWFuZ2xlcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxFZGdlPn1cclxuICAgIHRoaXMuZWRnZXMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48VmVydGV4Pn1cclxuICAgIHRoaXMuY29udmV4SHVsbCA9IFtdO1xyXG5cclxuICAgIGlmICggcG9pbnRzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48VmVydGV4Pn1cclxuICAgIHRoaXMudmVydGljZXMgPSBwb2ludHMubWFwKCAoIHBvaW50LCBpbmRleCApID0+IHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcG9pbnQgaW5zdGFuY2VvZiBWZWN0b3IyICYmIHBvaW50LmlzRmluaXRlKCkgKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgVmVydGV4KCBwb2ludCwgaW5kZXggKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMuY29uc3RyYWludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGNvbnN0cmFpbnQgPSB0aGlzLmNvbnN0cmFpbnRzWyBpIF07XHJcbiAgICAgIGNvbnN0IGZpcnN0SW5kZXggPSBjb25zdHJhaW50WyAwIF07XHJcbiAgICAgIGNvbnN0IHNlY29uZEluZGV4ID0gY29uc3RyYWludFsgMSBdO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgZmlyc3RJbmRleCA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIGZpcnN0SW5kZXggKSAmJiBmaXJzdEluZGV4ICUgMSA9PT0gMCAmJiBmaXJzdEluZGV4ID49IDAgJiYgZmlyc3RJbmRleCA8IHBvaW50cy5sZW5ndGggKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHNlY29uZEluZGV4ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggc2Vjb25kSW5kZXggKSAmJiBzZWNvbmRJbmRleCAlIDEgPT09IDAgJiYgc2Vjb25kSW5kZXggPj0gMCAmJiBzZWNvbmRJbmRleCA8IHBvaW50cy5sZW5ndGggKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZmlyc3RJbmRleCAhPT0gc2Vjb25kSW5kZXggKTtcclxuXHJcbiAgICAgIHRoaXMudmVydGljZXNbIGZpcnN0SW5kZXggXS5jb25zdHJhaW5lZFZlcnRpY2VzLnB1c2goIHRoaXMudmVydGljZXNbIHNlY29uZEluZGV4IF0gKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnZlcnRpY2VzLnNvcnQoIERlbGF1bmF5VHJpYW5ndWxhdGlvbi52ZXJ0ZXhDb21wYXJpc29uICk7XHJcblxyXG4gICAgZm9yICggaSA9IDA7IGkgPCB0aGlzLnZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB2ZXJ0ZXggPSB0aGlzLnZlcnRpY2VzWyBpIF07XHJcbiAgICAgIHZlcnRleC5zb3J0ZWRJbmRleCA9IGk7XHJcbiAgICAgIGZvciAoIGxldCBqID0gdmVydGV4LmNvbnN0cmFpbmVkVmVydGljZXMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0gKSB7XHJcbiAgICAgICAgY29uc3Qgb3RoZXJWZXJ0ZXggPSB2ZXJ0ZXguY29uc3RyYWluZWRWZXJ0aWNlc1sgaiBdO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgXCJvdGhlclwiIHZlcnRleCBpcyBsYXRlciBpbiB0aGUgc3dlZXAtbGluZSBvcmRlciwgaXQgc2hvdWxkIGhhdmUgdGhlIHJlZmVyZW5jZSB0byB0aGUgZWFybGllciB2ZXJ0ZXgsXHJcbiAgICAgICAgLy8gbm90IHRoZSBvdGhlciB3YXkgYXJvdW5kLlxyXG4gICAgICAgIGlmICggb3RoZXJWZXJ0ZXguc29ydGVkSW5kZXggPT09IC0xICkge1xyXG4gICAgICAgICAgb3RoZXJWZXJ0ZXguY29uc3RyYWluZWRWZXJ0aWNlcy5wdXNoKCB2ZXJ0ZXggKTtcclxuICAgICAgICAgIHZlcnRleC5jb25zdHJhaW5lZFZlcnRpY2VzLnNwbGljZSggaiwgMSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwcml2YXRlIHtWZXJ0ZXh9XHJcbiAgICB0aGlzLmJvdHRvbVZlcnRleCA9IHRoaXMudmVydGljZXNbIDAgXTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPFZlcnRleD59IC0gT3VyIGluaXRpYWxpemF0aW9uIHdpbGwgaGFuZGxlIG91ciBmaXJzdCB2ZXJ0ZXhcclxuICAgIHRoaXMucmVtYWluaW5nVmVydGljZXMgPSB0aGlzLnZlcnRpY2VzLnNsaWNlKCAxICk7XHJcblxyXG4gICAgY29uc3QgYm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcclxuICAgIGZvciAoIGkgPSBwb2ludHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIGJvdW5kcy5hZGRQb2ludCggcG9pbnRzWyBpIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhbHBoYSA9IDAuNDtcclxuICAgIC8vIEBwcml2YXRlIHtWZXJ0ZXh9IC0gRmFrZSBpbmRleCAtMVxyXG4gICAgdGhpcy5hcnRpZmljaWFsTWluVmVydGV4ID0gbmV3IFZlcnRleCggbmV3IFZlY3RvcjIoIGJvdW5kcy5taW5YIC0gYm91bmRzLndpZHRoICogYWxwaGEsIGJvdW5kcy5taW5ZIC0gYm91bmRzLmhlaWdodCAqIGFscGhhICksIC0xICk7XHJcbiAgICAvLyBAcHJpdmF0ZSB7VmVydGV4fSAtIEZha2UgaW5kZXggLTJcclxuICAgIHRoaXMuYXJ0aWZpY2lhbE1heFZlcnRleCA9IG5ldyBWZXJ0ZXgoIG5ldyBWZWN0b3IyKCBib3VuZHMubWF4WCArIGJvdW5kcy53aWR0aCAqIGFscGhhLCBib3VuZHMubWluWSAtIGJvdW5kcy5oZWlnaHQgKiBhbHBoYSApLCAtMiApO1xyXG5cclxuICAgIHRoaXMuZWRnZXMucHVzaCggbmV3IEVkZ2UoIHRoaXMuYXJ0aWZpY2lhbE1pblZlcnRleCwgdGhpcy5hcnRpZmljaWFsTWF4VmVydGV4ICkgKTtcclxuICAgIHRoaXMuZWRnZXMucHVzaCggbmV3IEVkZ2UoIHRoaXMuYXJ0aWZpY2lhbE1heFZlcnRleCwgdGhpcy5ib3R0b21WZXJ0ZXggKSApO1xyXG4gICAgdGhpcy5lZGdlcy5wdXNoKCBuZXcgRWRnZSggdGhpcy5ib3R0b21WZXJ0ZXgsIHRoaXMuYXJ0aWZpY2lhbE1pblZlcnRleCApICk7XHJcblxyXG4gICAgLy8gU2V0IHVwIG91ciBmaXJzdCAoYXJ0aWZpY2lhbCkgdHJpYW5nbGUuXHJcbiAgICB0aGlzLnRyaWFuZ2xlcy5wdXNoKCBuZXcgVHJpYW5nbGUoIHRoaXMuYXJ0aWZpY2lhbE1pblZlcnRleCwgdGhpcy5hcnRpZmljaWFsTWF4VmVydGV4LCB0aGlzLmJvdHRvbVZlcnRleCxcclxuICAgICAgdGhpcy5lZGdlc1sgMSBdLCB0aGlzLmVkZ2VzWyAyIF0sIHRoaXMuZWRnZXNbIDAgXSApICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0VkZ2V8bnVsbH0gLSBUaGUgc3RhcnQgb2Ygb3VyIGZyb250ICh0aGUgZWRnZXMgYXQgdGhlIGZyb250IG9mIHRoZSBzd2VlcC1saW5lKVxyXG4gICAgdGhpcy5maXJzdEZyb250RWRnZSA9IHRoaXMuZWRnZXNbIDEgXTtcclxuICAgIHRoaXMuZWRnZXNbIDEgXS5jb25uZWN0QWZ0ZXIoIHRoaXMuZWRnZXNbIDIgXSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtFZGdlfSAtIFRoZSBzdGFydCBvZiBvdXIgaHVsbCAodGhlIGVkZ2VzIGF0IHRoZSBiYWNrLCBtYWtpbmcgdXAgdGhlIGNvbnZleCBodWxsKVxyXG4gICAgdGhpcy5maXJzdEh1bGxFZGdlID0gdGhpcy5lZGdlc1sgMCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZXMgdGhlIHRyaWFuZ3VsYXRpb24gZm9yd2FyZCBieSBhIHZlcnRleC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHN0ZXAoKSB7XHJcbiAgICAvLyBUT0RPOiByZXZlcnNlIHRoZSBhcnJheSBwcmlvciB0byB0aGlzP1xyXG4gICAgY29uc3QgdmVydGV4ID0gdGhpcy5yZW1haW5pbmdWZXJ0aWNlcy5zaGlmdCgpO1xyXG5cclxuICAgIGNvbnN0IHggPSB2ZXJ0ZXgucG9pbnQueDtcclxuXHJcbiAgICBsZXQgZnJvbnRFZGdlID0gdGhpcy5maXJzdEZyb250RWRnZTtcclxuICAgIHdoaWxlICggZnJvbnRFZGdlICkge1xyXG4gICAgICAvLyBUT0RPOiBlcHNpbG9uIG5lZWRlZCBoZXJlP1xyXG4gICAgICBpZiAoIHggPiBmcm9udEVkZ2UuZW5kVmVydGV4LnBvaW50LnggKSB7XHJcbiAgICAgICAgY29uc3QgZWRnZTEgPSBuZXcgRWRnZSggZnJvbnRFZGdlLnN0YXJ0VmVydGV4LCB2ZXJ0ZXggKTtcclxuICAgICAgICBjb25zdCBlZGdlMiA9IG5ldyBFZGdlKCB2ZXJ0ZXgsIGZyb250RWRnZS5lbmRWZXJ0ZXggKTtcclxuICAgICAgICBlZGdlMS5jb25uZWN0QWZ0ZXIoIGVkZ2UyICk7XHJcbiAgICAgICAgdGhpcy5lZGdlcy5wdXNoKCBlZGdlMSApO1xyXG4gICAgICAgIHRoaXMuZWRnZXMucHVzaCggZWRnZTIgKTtcclxuICAgICAgICB0aGlzLnRyaWFuZ2xlcy5wdXNoKCBuZXcgVHJpYW5nbGUoIGZyb250RWRnZS5lbmRWZXJ0ZXgsIGZyb250RWRnZS5zdGFydFZlcnRleCwgdmVydGV4LFxyXG4gICAgICAgICAgZWRnZTEsIGVkZ2UyLCBmcm9udEVkZ2UgKSApO1xyXG4gICAgICAgIHRoaXMucmVjb25uZWN0RnJvbnRFZGdlcyggZnJvbnRFZGdlLCBmcm9udEVkZ2UsIGVkZ2UxLCBlZGdlMiApO1xyXG4gICAgICAgIHRoaXMubGVnYWxpemVFZGdlKCBmcm9udEVkZ2UgKTtcclxuICAgICAgICB0aGlzLmFkZEhhbGZQaUhldXJpc3RpYyggZWRnZTEsIGVkZ2UyICk7XHJcbiAgICAgICAgdGhpcy5jb25zdHJhaW5FZGdlcyggdmVydGV4LCBlZGdlMSwgZWRnZTIgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggeCA9PT0gZnJvbnRFZGdlLmVuZFZlcnRleC5wb2ludC54ICkge1xyXG4gICAgICAgIGNvbnN0IGxlZnRPbGRFZGdlID0gZnJvbnRFZGdlLm5leHRFZGdlO1xyXG4gICAgICAgIGNvbnN0IHJpZ2h0T2xkRWRnZSA9IGZyb250RWRnZTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZWZ0T2xkRWRnZSAhPT0gbnVsbCApO1xyXG5cclxuICAgICAgICBjb25zdCBtaWRkbGVPbGRWZXJ0ZXggPSBmcm9udEVkZ2UuZW5kVmVydGV4O1xyXG4gICAgICAgIGNvbnN0IGxlZnRWZXJ0ZXggPSBsZWZ0T2xkRWRnZS5lbmRWZXJ0ZXg7XHJcbiAgICAgICAgY29uc3QgcmlnaHRWZXJ0ZXggPSByaWdodE9sZEVkZ2Uuc3RhcnRWZXJ0ZXg7XHJcblxyXG4gICAgICAgIGNvbnN0IGxlZnRFZGdlID0gbmV3IEVkZ2UoIHZlcnRleCwgbGVmdFZlcnRleCApO1xyXG4gICAgICAgIGNvbnN0IHJpZ2h0RWRnZSA9IG5ldyBFZGdlKCByaWdodFZlcnRleCwgdmVydGV4ICk7XHJcbiAgICAgICAgY29uc3QgbWlkZGxlRWRnZSA9IG5ldyBFZGdlKCBtaWRkbGVPbGRWZXJ0ZXgsIHZlcnRleCApO1xyXG4gICAgICAgIHJpZ2h0RWRnZS5jb25uZWN0QWZ0ZXIoIGxlZnRFZGdlICk7XHJcbiAgICAgICAgdGhpcy5lZGdlcy5wdXNoKCBsZWZ0RWRnZSApO1xyXG4gICAgICAgIHRoaXMuZWRnZXMucHVzaCggcmlnaHRFZGdlICk7XHJcbiAgICAgICAgdGhpcy5lZGdlcy5wdXNoKCBtaWRkbGVFZGdlICk7XHJcbiAgICAgICAgdGhpcy50cmlhbmdsZXMucHVzaCggbmV3IFRyaWFuZ2xlKCBsZWZ0VmVydGV4LCBtaWRkbGVPbGRWZXJ0ZXgsIHZlcnRleCxcclxuICAgICAgICAgIG1pZGRsZUVkZ2UsIGxlZnRFZGdlLCBsZWZ0T2xkRWRnZSApICk7XHJcbiAgICAgICAgdGhpcy50cmlhbmdsZXMucHVzaCggbmV3IFRyaWFuZ2xlKCBtaWRkbGVPbGRWZXJ0ZXgsIHJpZ2h0VmVydGV4LCB2ZXJ0ZXgsXHJcbiAgICAgICAgICByaWdodEVkZ2UsIG1pZGRsZUVkZ2UsIHJpZ2h0T2xkRWRnZSApICk7XHJcbiAgICAgICAgdGhpcy5yZWNvbm5lY3RGcm9udEVkZ2VzKCByaWdodE9sZEVkZ2UsIGxlZnRPbGRFZGdlLCByaWdodEVkZ2UsIGxlZnRFZGdlICk7XHJcbiAgICAgICAgdGhpcy5sZWdhbGl6ZUVkZ2UoIGxlZnRPbGRFZGdlICk7XHJcbiAgICAgICAgdGhpcy5sZWdhbGl6ZUVkZ2UoIHJpZ2h0T2xkRWRnZSApO1xyXG4gICAgICAgIHRoaXMubGVnYWxpemVFZGdlKCBtaWRkbGVFZGdlICk7XHJcbiAgICAgICAgdGhpcy5hZGRIYWxmUGlIZXVyaXN0aWMoIHJpZ2h0RWRnZSwgbGVmdEVkZ2UgKTtcclxuICAgICAgICB0aGlzLmNvbnN0cmFpbkVkZ2VzKCB2ZXJ0ZXgsIHJpZ2h0RWRnZSwgbGVmdEVkZ2UgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBmcm9udEVkZ2UgPSBmcm9udEVkZ2UubmV4dEVkZ2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCdWlsZHMgYSB0cmlhbmdsZSBiZXR3ZWVuIHR3byB2ZXJ0aWNlcy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFZGdlfSBmaXJzdEVkZ2VcclxuICAgKiBAcGFyYW0ge0VkZ2V9IHNlY29uZEVkZ2VcclxuICAgKiBAcGFyYW0ge1ZlcnRleH0gZmlyc3RTaWRlVmVydGV4XHJcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IG1pZGRsZVZlcnRleFxyXG4gICAqIEBwYXJhbSB7VmVydGV4fSBzZWNvbmRTaWRlVmVydGV4XHJcbiAgICogQHJldHVybnMge0VkZ2V9IC0gVGhlIG5ld2x5IGNyZWF0ZWQgZWRnZVxyXG4gICAqL1xyXG4gIGZpbGxCb3JkZXJUcmlhbmdsZSggZmlyc3RFZGdlLCBzZWNvbmRFZGdlLCBmaXJzdFNpZGVWZXJ0ZXgsIG1pZGRsZVZlcnRleCwgc2Vjb25kU2lkZVZlcnRleCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZpcnN0RWRnZSBpbnN0YW5jZW9mIEVkZ2UgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlY29uZEVkZ2UgaW5zdGFuY2VvZiBFZGdlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmaXJzdFNpZGVWZXJ0ZXggaW5zdGFuY2VvZiBWZXJ0ZXggKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1pZGRsZVZlcnRleCBpbnN0YW5jZW9mIFZlcnRleCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2Vjb25kU2lkZVZlcnRleCBpbnN0YW5jZW9mIFZlcnRleCApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1pZGRsZVZlcnRleCA9PT0gZmlyc3RFZGdlLnN0YXJ0VmVydGV4IHx8IG1pZGRsZVZlcnRleCA9PT0gZmlyc3RFZGdlLmVuZFZlcnRleCxcclxuICAgICAgJ21pZGRsZVZlcnRleCBzaG91bGQgYmUgaW4gZmlyc3RFZGdlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWlkZGxlVmVydGV4ID09PSBzZWNvbmRFZGdlLnN0YXJ0VmVydGV4IHx8IG1pZGRsZVZlcnRleCA9PT0gc2Vjb25kRWRnZS5lbmRWZXJ0ZXgsXHJcbiAgICAgICdtaWRkbGVWZXJ0ZXggc2hvdWxkIGJlIGluIHNlY29uZEVkZ2UnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmaXJzdFNpZGVWZXJ0ZXggPT09IGZpcnN0RWRnZS5zdGFydFZlcnRleCB8fCBmaXJzdFNpZGVWZXJ0ZXggPT09IGZpcnN0RWRnZS5lbmRWZXJ0ZXgsXHJcbiAgICAgICdmaXJzdFNpZGVWZXJ0ZXggc2hvdWxkIGJlIGluIGZpcnN0RWRnZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlY29uZFNpZGVWZXJ0ZXggPT09IHNlY29uZEVkZ2Uuc3RhcnRWZXJ0ZXggfHwgc2Vjb25kU2lkZVZlcnRleCA9PT0gc2Vjb25kRWRnZS5lbmRWZXJ0ZXgsXHJcbiAgICAgICdzZWNvbmRTaWRlVmVydGV4IHNob3VsZCBiZSBpbiBzZWNvbmRFZGdlJyApO1xyXG5cclxuICAgIGNvbnN0IG5ld0VkZ2UgPSBuZXcgRWRnZSggZmlyc3RTaWRlVmVydGV4LCBzZWNvbmRTaWRlVmVydGV4ICk7XHJcbiAgICB0aGlzLmVkZ2VzLnB1c2goIG5ld0VkZ2UgKTtcclxuICAgIHRoaXMudHJpYW5nbGVzLnB1c2goIG5ldyBUcmlhbmdsZSggc2Vjb25kU2lkZVZlcnRleCwgbWlkZGxlVmVydGV4LCBmaXJzdFNpZGVWZXJ0ZXgsXHJcbiAgICAgIGZpcnN0RWRnZSwgbmV3RWRnZSwgc2Vjb25kRWRnZSApICk7XHJcbiAgICB0aGlzLmxlZ2FsaXplRWRnZSggZmlyc3RFZGdlICk7XHJcbiAgICB0aGlzLmxlZ2FsaXplRWRnZSggc2Vjb25kRWRnZSApO1xyXG4gICAgcmV0dXJuIG5ld0VkZ2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNjb25uZWN0cyBhIHNlY3Rpb24gb2YgZnJvbnQgZWRnZXMsIGFuZCBjb25uZWN0cyBhIG5ldyBzZWN0aW9uLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBEaXNjb25uZWN0czpcclxuICAgKiA8bmV4dEVkZ2U+IChjdXQpIDxvbGRMZWZ0RWRnZT4gLi4uLi4gPG9sZFJpZ2h0RWRnZT4gKGN1dCkgPHByZXZpb3VzRWRnZT5cclxuICAgKlxyXG4gICAqIENvbm5lY3RzOlxyXG4gICAqIDxuZXh0RWRnZT4gKGpvaW4pIDxuZXdMZWZ0RWRnZT4gLi4uLi4gPG5ld1JpZ2h0RWRnZT4gKGpvaW4pIDxwcmV2aW91c0VkZ2U+XHJcbiAgICpcclxuICAgKiBJZiBwcmV2aW91c0VkZ2UgaXMgbnVsbCwgd2UnbGwgbmVlZCB0byBzZXQgb3VyIGZpcnN0RnJvbnRFZGdlIHRvIHRoZSBuZXdSaWdodEVkZ2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0VkZ2V9IG9sZFJpZ2h0RWRnZVxyXG4gICAqIEBwYXJhbSB7RWRnZX0gb2xkTGVmdEVkZ2VcclxuICAgKiBAcGFyYW0ge0VkZ2V9IG5ld1JpZ2h0RWRnZVxyXG4gICAqIEBwYXJhbSB7RWRnZX0gbmV3TGVmdEVkZ2VcclxuICAgKi9cclxuICByZWNvbm5lY3RGcm9udEVkZ2VzKCBvbGRSaWdodEVkZ2UsIG9sZExlZnRFZGdlLCBuZXdSaWdodEVkZ2UsIG5ld0xlZnRFZGdlICkge1xyXG4gICAgY29uc3QgcHJldmlvdXNFZGdlID0gb2xkUmlnaHRFZGdlLnByZXZpb3VzRWRnZTtcclxuICAgIGNvbnN0IG5leHRFZGdlID0gb2xkTGVmdEVkZ2UubmV4dEVkZ2U7XHJcbiAgICBpZiAoIHByZXZpb3VzRWRnZSApIHtcclxuICAgICAgcHJldmlvdXNFZGdlLmRpc2Nvbm5lY3RBZnRlcigpO1xyXG4gICAgICBwcmV2aW91c0VkZ2UuY29ubmVjdEFmdGVyKCBuZXdSaWdodEVkZ2UgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmZpcnN0RnJvbnRFZGdlID0gbmV3UmlnaHRFZGdlO1xyXG4gICAgfVxyXG4gICAgaWYgKCBuZXh0RWRnZSApIHtcclxuICAgICAgb2xkTGVmdEVkZ2UuZGlzY29ubmVjdEFmdGVyKCk7XHJcbiAgICAgIG5ld0xlZnRFZGdlLmNvbm5lY3RBZnRlciggbmV4dEVkZ2UgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWVzIHRvIGZpbGwgaW4gYWN1dGUgYW5nbGVzIHdpdGggdHJpYW5nbGVzIGFmdGVyIHdlIGFkZCBhIHZlcnRleCBpbnRvIHRoZSBmcm9udC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFZGdlfSByaWdodEZyb250RWRnZVxyXG4gICAqIEBwYXJhbSB7RWRnZX0gbGVmdEZyb250RWRnZVxyXG4gICAqL1xyXG4gIGFkZEhhbGZQaUhldXJpc3RpYyggcmlnaHRGcm9udEVkZ2UsIGxlZnRGcm9udEVkZ2UgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByaWdodEZyb250RWRnZS5lbmRWZXJ0ZXggPT09IGxlZnRGcm9udEVkZ2Uuc3RhcnRWZXJ0ZXggKTtcclxuXHJcbiAgICBjb25zdCBtaWRkbGVWZXJ0ZXggPSByaWdodEZyb250RWRnZS5lbmRWZXJ0ZXg7XHJcblxyXG4gICAgd2hpbGUgKCByaWdodEZyb250RWRnZS5wcmV2aW91c0VkZ2UgJiZcclxuICAgICAgICAgICAgVXRpbHMudHJpYW5nbGVBcmVhU2lnbmVkKCBtaWRkbGVWZXJ0ZXgucG9pbnQsIHJpZ2h0RnJvbnRFZGdlLnN0YXJ0VmVydGV4LnBvaW50LCByaWdodEZyb250RWRnZS5wcmV2aW91c0VkZ2Uuc3RhcnRWZXJ0ZXgucG9pbnQgKSA+IDAgJiZcclxuICAgICAgICAgICAgKCBtaWRkbGVWZXJ0ZXgucG9pbnQubWludXMoIHJpZ2h0RnJvbnRFZGdlLnN0YXJ0VmVydGV4LnBvaW50ICkgKS5hbmdsZUJldHdlZW4oIHJpZ2h0RnJvbnRFZGdlLnByZXZpb3VzRWRnZS5zdGFydFZlcnRleC5wb2ludC5taW51cyggcmlnaHRGcm9udEVkZ2Uuc3RhcnRWZXJ0ZXgucG9pbnQgKSApIDwgTWF0aC5QSSAvIDIgKSB7XHJcbiAgICAgIGNvbnN0IHByZXZpb3VzRWRnZSA9IHJpZ2h0RnJvbnRFZGdlLnByZXZpb3VzRWRnZTtcclxuICAgICAgY29uc3QgbmV3UmlnaHRFZGdlID0gbmV3IEVkZ2UoIHByZXZpb3VzRWRnZS5zdGFydFZlcnRleCwgbWlkZGxlVmVydGV4ICk7XHJcbiAgICAgIHRoaXMuZWRnZXMucHVzaCggbmV3UmlnaHRFZGdlICk7XHJcbiAgICAgIHRoaXMudHJpYW5nbGVzLnB1c2goIG5ldyBUcmlhbmdsZSggbWlkZGxlVmVydGV4LCByaWdodEZyb250RWRnZS5zdGFydFZlcnRleCwgcHJldmlvdXNFZGdlLnN0YXJ0VmVydGV4LFxyXG4gICAgICAgIHByZXZpb3VzRWRnZSwgbmV3UmlnaHRFZGdlLCByaWdodEZyb250RWRnZSApICk7XHJcblxyXG4gICAgICB0aGlzLnJlY29ubmVjdEZyb250RWRnZXMoIHByZXZpb3VzRWRnZSwgcmlnaHRGcm9udEVkZ2UsIG5ld1JpZ2h0RWRnZSwgbmV3UmlnaHRFZGdlICk7XHJcbiAgICAgIHRoaXMubGVnYWxpemVFZGdlKCBwcmV2aW91c0VkZ2UgKTtcclxuICAgICAgdGhpcy5sZWdhbGl6ZUVkZ2UoIHJpZ2h0RnJvbnRFZGdlICk7XHJcblxyXG4gICAgICByaWdodEZyb250RWRnZSA9IG5ld1JpZ2h0RWRnZTtcclxuICAgIH1cclxuICAgIHdoaWxlICggbGVmdEZyb250RWRnZS5uZXh0RWRnZSAmJlxyXG4gICAgICAgICAgICBVdGlscy50cmlhbmdsZUFyZWFTaWduZWQoIG1pZGRsZVZlcnRleC5wb2ludCwgbGVmdEZyb250RWRnZS5uZXh0RWRnZS5lbmRWZXJ0ZXgucG9pbnQsIGxlZnRGcm9udEVkZ2UuZW5kVmVydGV4LnBvaW50ICkgPiAwICYmXHJcbiAgICAgICAgICAgICggbWlkZGxlVmVydGV4LnBvaW50Lm1pbnVzKCBsZWZ0RnJvbnRFZGdlLmVuZFZlcnRleC5wb2ludCApICkuYW5nbGVCZXR3ZWVuKCBsZWZ0RnJvbnRFZGdlLm5leHRFZGdlLmVuZFZlcnRleC5wb2ludC5taW51cyggbGVmdEZyb250RWRnZS5lbmRWZXJ0ZXgucG9pbnQgKSApIDwgTWF0aC5QSSAvIDIgKSB7XHJcbiAgICAgIGNvbnN0IG5leHRFZGdlID0gbGVmdEZyb250RWRnZS5uZXh0RWRnZTtcclxuICAgICAgY29uc3QgbmV3TGVmdEVkZ2UgPSBuZXcgRWRnZSggbWlkZGxlVmVydGV4LCBuZXh0RWRnZS5lbmRWZXJ0ZXggKTtcclxuICAgICAgdGhpcy5lZGdlcy5wdXNoKCBuZXdMZWZ0RWRnZSApO1xyXG4gICAgICB0aGlzLnRyaWFuZ2xlcy5wdXNoKCBuZXcgVHJpYW5nbGUoIG1pZGRsZVZlcnRleCwgbGVmdEZyb250RWRnZS5uZXh0RWRnZS5lbmRWZXJ0ZXgsIGxlZnRGcm9udEVkZ2UuZW5kVmVydGV4LFxyXG4gICAgICAgIG5leHRFZGdlLCBsZWZ0RnJvbnRFZGdlLCBuZXdMZWZ0RWRnZSApICk7XHJcbiAgICAgIHRoaXMucmVjb25uZWN0RnJvbnRFZGdlcyggbGVmdEZyb250RWRnZSwgbmV4dEVkZ2UsIG5ld0xlZnRFZGdlLCBuZXdMZWZ0RWRnZSApO1xyXG4gICAgICB0aGlzLmxlZ2FsaXplRWRnZSggbmV4dEVkZ2UgKTtcclxuICAgICAgdGhpcy5sZWdhbGl6ZUVkZ2UoIGxlZnRGcm9udEVkZ2UgKTtcclxuXHJcbiAgICAgIGxlZnRGcm9udEVkZ2UgPSBuZXdMZWZ0RWRnZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgYW55IFwiZWRnZSBldmVudHNcIiB0aGF0IGRlbGV0ZSBpbnRlcnNlY3RpbmcgZWRnZXMsIGNyZWF0aW5nIHRoZSBuZXcgZWRnZSwgYW5kIGZpbGxpbmcgaW4gKGFsbCBvbmx5IGlmXHJcbiAgICogbmVjZXNzYXJ5KS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IHZlcnRleFxyXG4gICAqIEBwYXJhbSB7RWRnZX0gcmlnaHRGcm9udEVkZ2VcclxuICAgKiBAcGFyYW0ge0VkZ2V9IGxlZnRGcm9udEVkZ2VcclxuICAgKi9cclxuICBjb25zdHJhaW5FZGdlcyggdmVydGV4LCByaWdodEZyb250RWRnZSwgbGVmdEZyb250RWRnZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlcnRleCBpbnN0YW5jZW9mIFZlcnRleCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmlnaHRGcm9udEVkZ2UgaW5zdGFuY2VvZiBFZGdlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZWZ0RnJvbnRFZGdlIGluc3RhbmNlb2YgRWRnZSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmVydGV4ID09PSByaWdodEZyb250RWRnZS5lbmRWZXJ0ZXggKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlcnRleCA9PT0gbGVmdEZyb250RWRnZS5zdGFydFZlcnRleCApO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHZlcnRleC5jb25zdHJhaW5lZFZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBib3R0b21WZXJ0ZXggPSB2ZXJ0ZXguY29uc3RyYWluZWRWZXJ0aWNlc1sgaSBdO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgaXQncyBvbmUgb2Ygb3VyIGZyb250IGVkZ2UgdmVydGljZXMgKGlmIHNvLCBiYWlsIG91dCwgc2luY2UgdGhlIGVkZ2UgYWxyZWFkeSBleGlzdHMpXHJcbiAgICAgIGlmICggYm90dG9tVmVydGV4ID09PSByaWdodEZyb250RWRnZS5zdGFydFZlcnRleCB8fCBib3R0b21WZXJ0ZXggPT09IGxlZnRGcm9udEVkZ2UuZW5kVmVydGV4ICkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBsZWZ0RWRnZXMgPSBbXTtcclxuICAgICAgY29uc3QgcmlnaHRFZGdlcyA9IFtdO1xyXG4gICAgICBsZXQgY3VycmVudFRyaWFuZ2xlID0gbnVsbDtcclxuICAgICAgbGV0IGN1cnJlbnRFZGdlID0gbnVsbDtcclxuICAgICAgY29uc3QgdHJpYW5nbGVzVG9SZW1vdmUgPSBbXTtcclxuICAgICAgY29uc3QgZWRnZXNUb1JlbW92ZSA9IFtdO1xyXG5cclxuICAgICAgbGV0IG91dHNpZGVSaWdodCA9IERlbGF1bmF5VHJpYW5ndWxhdGlvbi52ZXJ0ZXhQcm9kdWN0KCB2ZXJ0ZXgsIHJpZ2h0RnJvbnRFZGdlLnN0YXJ0VmVydGV4LCBib3R0b21WZXJ0ZXggKSA+IDA7XHJcbiAgICAgIGxldCBvdXRzaWRlTGVmdCA9IERlbGF1bmF5VHJpYW5ndWxhdGlvbi52ZXJ0ZXhQcm9kdWN0KCB2ZXJ0ZXgsIGxlZnRGcm9udEVkZ2UuZW5kVmVydGV4LCBib3R0b21WZXJ0ZXggKSA8IDA7XHJcblxyXG4gICAgICAvLyBJZiB3ZSBzdGFydCBpbnNpZGUsIHdlIG5lZWQgdG8gaWRlbnRpZnkgd2hpY2ggdHJpYW5nbGUgd2UncmUgaW5zaWRlIG9mLlxyXG4gICAgICBpZiAoICFvdXRzaWRlUmlnaHQgJiYgIW91dHNpZGVMZWZ0ICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHJpZ2h0RnJvbnRFZGdlLnRyaWFuZ2xlcy5sZW5ndGggPT09IDEgKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZWZ0RnJvbnRFZGdlLnRyaWFuZ2xlcy5sZW5ndGggPT09IDEgKTtcclxuXHJcbiAgICAgICAgbGV0IGxhc3RWZXJ0ZXggPSByaWdodEZyb250RWRnZS5zdGFydFZlcnRleDtcclxuICAgICAgICBsZXQgbmV4dFZlcnRleDtcclxuICAgICAgICBjdXJyZW50VHJpYW5nbGUgPSByaWdodEZyb250RWRnZS50cmlhbmdsZXNbIDAgXTtcclxuICAgICAgICAvLyBUT0RPOiBUcmlhbmdsZSBvcGVyYXRpb25zIHRvIG1ha2UgdGhpcyBtb3JlIHJlYWRhYmxlXHJcbiAgICAgICAgd2hpbGUgKCBEZWxhdW5heVRyaWFuZ3VsYXRpb24udmVydGV4UHJvZHVjdCggdmVydGV4LCBuZXh0VmVydGV4ID0gY3VycmVudFRyaWFuZ2xlLmdldEVkZ2VPcHBvc2l0ZUZyb21WZXJ0ZXgoIHZlcnRleCApLmdldE90aGVyVmVydGV4KCBsYXN0VmVydGV4ICksIGJvdHRvbVZlcnRleCApIDwgMCApIHtcclxuICAgICAgICAgIGN1cnJlbnRUcmlhbmdsZSA9IGN1cnJlbnRUcmlhbmdsZS5nZXRFZGdlT3Bwb3NpdGVGcm9tVmVydGV4KCBsYXN0VmVydGV4ICkuZ2V0T3RoZXJUcmlhbmdsZSggY3VycmVudFRyaWFuZ2xlICk7XHJcbiAgICAgICAgICBsYXN0VmVydGV4ID0gbmV4dFZlcnRleDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIG91ciBpbml0aWFsIHRyaWFuZ2xlIGhhcyBvdXIgdmVydGV4IGFuZCBib3R0b21WZXJ0ZXgsIHRoZW4gYmFpbCBvdXQgKGVkZ2UgYWxyZWFkeSBleGlzdHMpXHJcbiAgICAgICAgaWYgKCBjdXJyZW50VHJpYW5nbGUuaGFzVmVydGV4KCBib3R0b21WZXJ0ZXggKSApIHtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJpYW5nbGVzVG9SZW1vdmUucHVzaCggY3VycmVudFRyaWFuZ2xlICk7XHJcblxyXG4gICAgICAgIGN1cnJlbnRFZGdlID0gY3VycmVudFRyaWFuZ2xlLmdldEVkZ2VPcHBvc2l0ZUZyb21WZXJ0ZXgoIHZlcnRleCApO1xyXG4gICAgICAgIGVkZ2VzVG9SZW1vdmUucHVzaCggY3VycmVudEVkZ2UgKTtcclxuICAgICAgICBsZWZ0RWRnZXMucHVzaCggY3VycmVudFRyaWFuZ2xlLmdldEVkZ2VPcHBvc2l0ZUZyb21WZXJ0ZXgoIGxhc3RWZXJ0ZXggKSApO1xyXG4gICAgICAgIHJpZ2h0RWRnZXMucHVzaCggY3VycmVudFRyaWFuZ2xlLmdldEVkZ2VPcHBvc2l0ZUZyb21WZXJ0ZXgoIGN1cnJlbnRFZGdlLmdldE90aGVyVmVydGV4KCBsYXN0VmVydGV4ICkgKSApO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnRFZGdlc1sgMCBdLmdldE90aGVyVmVydGV4KCB2ZXJ0ZXggKS5wb2ludC54IDwgcmlnaHRFZGdlc1sgMCBdLmdldE90aGVyVmVydGV4KCB2ZXJ0ZXggKS5wb2ludC54ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHdoaWxlICggdHJ1ZSApIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cclxuICAgICAgICBpZiAoIG91dHNpZGVSaWdodCApIHtcclxuICAgICAgICAgIC8vIFRPRE86IGltcGxlbWVudFxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBvdXRzaWRlTGVmdCApIHtcclxuICAgICAgICAgIC8vIFRPRE86IGltcGxlbWVudFxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaWYgKCBjdXJyZW50RWRnZS50cmlhbmdsZXMubGVuZ3RoID4gMSApIHtcclxuICAgICAgICAgICAgY29uc3QgbmV4dFRyaWFuZ2xlID0gY3VycmVudEVkZ2UuZ2V0T3RoZXJUcmlhbmdsZSggY3VycmVudFRyaWFuZ2xlICk7XHJcbiAgICAgICAgICAgIGlmICggbmV4dFRyaWFuZ2xlLmhhc1ZlcnRleCggYm90dG9tVmVydGV4ICkgKSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIFRPRE86IGRvIHRoaW5ncyFcclxuICAgICAgICAgICAgICB0cmlhbmdsZXNUb1JlbW92ZS5wdXNoKCBuZXh0VHJpYW5nbGUgKTtcclxuICAgICAgICAgICAgICBsZWZ0RWRnZXMucHVzaCggbmV4dFRyaWFuZ2xlLmdldE5leHRFZGdlKCBjdXJyZW50RWRnZSApICk7XHJcbiAgICAgICAgICAgICAgcmlnaHRFZGdlcy5wdXNoKCBuZXh0VHJpYW5nbGUuZ2V0UHJldmlvdXNFZGdlKCBjdXJyZW50RWRnZSApICk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyB0aGUgbmV4dCBlZGdlIGludGVyc2VjdGVkXHJcbiAgICAgICAgICAgICAgbGV0IG5leHRFZGdlO1xyXG4gICAgICAgICAgICAgIGlmICggbmV4dFRyaWFuZ2xlLmFFZGdlICE9PSBjdXJyZW50RWRnZSAmJiBuZXh0VHJpYW5nbGUuYUVkZ2UuaW50ZXJzZWN0c0NvbnN0cmFpbmVkRWRnZSggdmVydGV4LCBib3R0b21WZXJ0ZXggKSApIHtcclxuICAgICAgICAgICAgICAgIG5leHRFZGdlID0gbmV4dFRyaWFuZ2xlLmFFZGdlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIGlmICggbmV4dFRyaWFuZ2xlLmJFZGdlICE9PSBjdXJyZW50RWRnZSAmJiBuZXh0VHJpYW5nbGUuYkVkZ2UuaW50ZXJzZWN0c0NvbnN0cmFpbmVkRWRnZSggdmVydGV4LCBib3R0b21WZXJ0ZXggKSApIHtcclxuICAgICAgICAgICAgICAgIG5leHRFZGdlID0gbmV4dFRyaWFuZ2xlLmJFZGdlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIGlmICggbmV4dFRyaWFuZ2xlLmNFZGdlICE9PSBjdXJyZW50RWRnZSAmJiBuZXh0VHJpYW5nbGUuY0VkZ2UuaW50ZXJzZWN0c0NvbnN0cmFpbmVkRWRnZSggdmVydGV4LCBib3R0b21WZXJ0ZXggKSApIHtcclxuICAgICAgICAgICAgICAgIG5leHRFZGdlID0gbmV4dFRyaWFuZ2xlLmNFZGdlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZXh0RWRnZSApO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoIG5leHRUcmlhbmdsZS5nZXROZXh0RWRnZSggbmV4dEVkZ2UgKSA9PT0gY3VycmVudEVkZ2UgKSB7XHJcbiAgICAgICAgICAgICAgICBsZWZ0RWRnZXMucHVzaCggbmV4dFRyaWFuZ2xlLmdldFByZXZpb3VzRWRnZSggbmV4dEVkZ2UgKSApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJpZ2h0RWRnZXMucHVzaCggbmV4dFRyaWFuZ2xlLmdldE5leHRFZGdlKCBuZXh0RWRnZSApICk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBjdXJyZW50RWRnZSA9IG5leHRFZGdlO1xyXG4gICAgICAgICAgICAgIGVkZ2VzVG9SZW1vdmUucHVzaCggY3VycmVudEVkZ2UgKTtcclxuXHJcbiAgICAgICAgICAgICAgY3VycmVudFRyaWFuZ2xlID0gbmV4dFRyaWFuZ2xlO1xyXG4gICAgICAgICAgICAgIHRyaWFuZ2xlc1RvUmVtb3ZlLnB1c2goIGN1cnJlbnRUcmlhbmdsZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBObyBvdGhlciB0cmlhbmdsZSwgZXhpdGVkXHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCBib3R0b21WZXJ0ZXgucG9pbnQueCA8IHZlcnRleC5wb2ludC54ICkge1xyXG4gICAgICAgICAgICAgIG91dHNpZGVMZWZ0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICBvdXRzaWRlUmlnaHQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0cmlhbmdsZXNUb1JlbW92ZS5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICBjb25zdCB0cmlhbmdsZVRvUmVtb3ZlID0gdHJpYW5nbGVzVG9SZW1vdmVbIGogXTtcclxuICAgICAgICBhcnJheVJlbW92ZSggdGhpcy50cmlhbmdsZXMsIHRyaWFuZ2xlVG9SZW1vdmUgKTtcclxuICAgICAgICB0cmlhbmdsZVRvUmVtb3ZlLnJlbW92ZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBlZGdlc1RvUmVtb3ZlLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLmVkZ2VzLCBlZGdlc1RvUmVtb3ZlWyBqIF0gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgY29uc3RyYWludEVkZ2UgPSBuZXcgRWRnZSggYm90dG9tVmVydGV4LCB2ZXJ0ZXggKTtcclxuICAgICAgY29uc3RyYWludEVkZ2UuaXNDb25zdHJhaW5lZCA9IHRydWU7XHJcbiAgICAgIHRoaXMuZWRnZXMucHVzaCggY29uc3RyYWludEVkZ2UgKTtcclxuICAgICAgbGVmdEVkZ2VzLnB1c2goIGNvbnN0cmFpbnRFZGdlICk7XHJcbiAgICAgIHJpZ2h0RWRnZXMucHVzaCggY29uc3RyYWludEVkZ2UgKTtcclxuICAgICAgcmlnaHRFZGdlcy5yZXZlcnNlKCk7IC8vIFB1dCBlZGdlcyBpbiBjb3VudGVyY2xvY2t3aXNlIG9yZGVyXHJcblxyXG4gICAgICAvLyBUT0RPOiByZW1vdmUgdGhpcyFcclxuICAgICAgd2luZG93LnRyaURlYnVnICYmIHdpbmRvdy50cmlEZWJ1ZyggdGhpcyApO1xyXG5cclxuICAgICAgdGhpcy50cmlhbmd1bGF0ZVBvbHlnb24oIGxlZnRFZGdlcyApO1xyXG4gICAgICB0aGlzLnRyaWFuZ3VsYXRlUG9seWdvbiggcmlnaHRFZGdlcyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBlZGdlcy90cmlhbmdsZXMgdG8gdHJpYW5ndWxhdGUgYSBzaW1wbGUgcG9seWdvbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48RWRnZT59IGVkZ2VzIC0gU2hvdWxkIGJlIGluIGNvdW50ZXJjbG9ja3dpc2Ugb3JkZXJcclxuICAgKi9cclxuICB0cmlhbmd1bGF0ZVBvbHlnb24oIGVkZ2VzICkge1xyXG4gICAgLy8gVE9ETzogU29tZXRoaW5nIG1vcmUgZWZmaWNpZW50IHRoYW4gZWFyIGNsaXBwaW5nIG1ldGhvZCBiZWxvd1xyXG4gICAgd2hpbGUgKCBlZGdlcy5sZW5ndGggPiAzICkge1xyXG4gICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCBlZGdlcy5sZW5ndGg7IGsrKyApIHtcclxuICAgICAgICBjb25zdCBreCA9IGsgPCBlZGdlcy5sZW5ndGggLSAxID8gayArIDEgOiAwO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGVkZ2VzWyBrIF0uZ2V0U2hhcmVkVmVydGV4KCBlZGdlc1sga3ggXSApICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIGVhY2ggdHJpcGxlIG9mIHZlcnRpY2VzIGlzIGFuIGVhciAoYW5kIGlmIHNvLCByZW1vdmUgaXQpXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGVkZ2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIC8vIE5leHQgaW5kZXhcclxuICAgICAgICBjb25zdCBpeCA9IGkgPCBlZGdlcy5sZW5ndGggLSAxID8gaSArIDEgOiAwO1xyXG5cclxuICAgICAgICAvLyBJbmZvcm1hdGlvbiBhYm91dCBvdXIgcG90ZW50aWFsIGVhclxyXG4gICAgICAgIGNvbnN0IGVkZ2UgPSBlZGdlc1sgaSBdO1xyXG4gICAgICAgIGNvbnN0IG5leHRFZGdlID0gZWRnZXNbIGl4IF07XHJcbiAgICAgICAgY29uc3Qgc2hhcmVkVmVydGV4ID0gZWRnZS5nZXRTaGFyZWRWZXJ0ZXgoIG5leHRFZGdlICk7XHJcbiAgICAgICAgY29uc3Qgc3RhcnRWZXJ0ZXggPSBlZGdlLmdldE90aGVyVmVydGV4KCBzaGFyZWRWZXJ0ZXggKTtcclxuICAgICAgICBjb25zdCBlbmRWZXJ0ZXggPSBuZXh0RWRnZS5nZXRPdGhlclZlcnRleCggc2hhcmVkVmVydGV4ICk7XHJcblxyXG4gICAgICAgIGlmICggVXRpbHMudHJpYW5nbGVBcmVhU2lnbmVkKCBzdGFydFZlcnRleC5wb2ludCwgc2hhcmVkVmVydGV4LnBvaW50LCBlbmRWZXJ0ZXgucG9pbnQgKSA8PSAwICkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBWYXJpYWJsZXMgZm9yIGNvbXB1dGluZyBiYXJ5Y2VudHJpYyBjb29yZGluYXRlc1xyXG4gICAgICAgIGNvbnN0IGVuZERlbHRhID0gZW5kVmVydGV4LnBvaW50Lm1pbnVzKCBzaGFyZWRWZXJ0ZXgucG9pbnQgKTtcclxuICAgICAgICBjb25zdCBzdGFydERlbHRhID0gc3RhcnRWZXJ0ZXgucG9pbnQubWludXMoIHNoYXJlZFZlcnRleC5wb2ludCApO1xyXG4gICAgICAgIGNvbnN0IGVuZE1hZ25pdHVkZVNxdWFyZWQgPSBlbmREZWx0YS5kb3QoIGVuZERlbHRhICk7XHJcbiAgICAgICAgY29uc3Qgc3RhcnRFbmRQcm9kdWN0ID0gZW5kRGVsdGEuZG90KCBzdGFydERlbHRhICk7XHJcbiAgICAgICAgY29uc3Qgc3RhcnRNYWduaXR1ZGVTcXVhcmVkID0gc3RhcnREZWx0YS5kb3QoIHN0YXJ0RGVsdGEgKTtcclxuICAgICAgICBjb25zdCB4ID0gZW5kTWFnbml0dWRlU3F1YXJlZCAqIHN0YXJ0TWFnbml0dWRlU3F1YXJlZCAtIHN0YXJ0RW5kUHJvZHVjdCAqIHN0YXJ0RW5kUHJvZHVjdDtcclxuXHJcbiAgICAgICAgLy8gU2VlIGlmIHRoZXJlIGFyZSBvdGhlciB2ZXJ0aWNlcyBpbiBvdXIgdHJpYW5nbGUgKGl0IHdvdWxkbid0IGJlIGFuIGVhciBpZiB0aGVyZSBpcyBhbm90aGVyIGluIGl0KVxyXG4gICAgICAgIGxldCBsYXN0VmVydGV4ID0gZWRnZXNbIDAgXS5nZXRTaGFyZWRWZXJ0ZXgoIGVkZ2VzWyBlZGdlcy5sZW5ndGggLSAxIF0gKTtcclxuICAgICAgICBsZXQgaGFzSW50ZXJpb3JWZXJ0ZXggPSBmYWxzZTtcclxuICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBlZGdlcy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICAgIGNvbnN0IHZlcnRleCA9IGVkZ2VzWyBqIF0uZ2V0T3RoZXJWZXJ0ZXgoIGxhc3RWZXJ0ZXggKTtcclxuXHJcbiAgICAgICAgICBpZiAoIHZlcnRleCAhPT0gc2hhcmVkVmVydGV4ICYmIHZlcnRleCAhPT0gc3RhcnRWZXJ0ZXggJiYgdmVydGV4ICE9PSBlbmRWZXJ0ZXggKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50RGVsdGEgPSB2ZXJ0ZXgucG9pbnQubWludXMoIHNoYXJlZFZlcnRleC5wb2ludCApO1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludEVuZFByb2R1Y3QgPSBlbmREZWx0YS5kb3QoIHBvaW50RGVsdGEgKTtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnRTdGFydFByb2R1Y3QgPSBzdGFydERlbHRhLmRvdCggcG9pbnREZWx0YSApO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29tcHV0ZSBiYXJ5Y2VudHJpYyBjb29yZGluYXRlc1xyXG4gICAgICAgICAgICBjb25zdCB1ID0gKCBzdGFydE1hZ25pdHVkZVNxdWFyZWQgKiBwb2ludEVuZFByb2R1Y3QgLSBzdGFydEVuZFByb2R1Y3QgKiBwb2ludFN0YXJ0UHJvZHVjdCApIC8geDtcclxuICAgICAgICAgICAgY29uc3QgdiA9ICggZW5kTWFnbml0dWRlU3F1YXJlZCAqIHBvaW50U3RhcnRQcm9kdWN0IC0gc3RhcnRFbmRQcm9kdWN0ICogcG9pbnRFbmRQcm9kdWN0ICkgLyB4O1xyXG5cclxuICAgICAgICAgICAgLy8gVGVzdCBmb3Igd2hldGhlciB0aGUgcG9pbnQgaXMgaW4gb3VyIHRyaWFuZ2xlXHJcbiAgICAgICAgICAgIGlmICggdSA+PSAtMWUtMTAgJiYgdiA+PSAtMWUtMTAgJiYgdSArIHYgPCAxICsgMWUtMTAgKSB7XHJcbiAgICAgICAgICAgICAgaGFzSW50ZXJpb3JWZXJ0ZXggPSB0cnVlO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgbGFzdFZlcnRleCA9IHZlcnRleDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIGludGVyaW9yIHZlcnRleCwgdGhlbiB3ZSByZWFjaGVkIGFuIGVhci5cclxuICAgICAgICBpZiAoICFoYXNJbnRlcmlvclZlcnRleCApIHtcclxuICAgICAgICAgIGNvbnN0IG5ld0VkZ2UgPSBuZXcgRWRnZSggc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCApO1xyXG4gICAgICAgICAgdGhpcy5lZGdlcy5wdXNoKCBuZXdFZGdlICk7XHJcbiAgICAgICAgICB0aGlzLnRyaWFuZ2xlcy5wdXNoKCBuZXcgVHJpYW5nbGUoIHN0YXJ0VmVydGV4LCBzaGFyZWRWZXJ0ZXgsIGVuZFZlcnRleCxcclxuICAgICAgICAgICAgbmV4dEVkZ2UsIG5ld0VkZ2UsIGVkZ2UgKSApO1xyXG4gICAgICAgICAgaWYgKCBpeCA+IGkgKSB7XHJcbiAgICAgICAgICAgIGVkZ2VzLnNwbGljZSggaSwgMiwgbmV3RWRnZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGVkZ2VzLnNwbGljZSggaSwgMSwgbmV3RWRnZSApO1xyXG4gICAgICAgICAgICBlZGdlcy5zcGxpY2UoIGl4LCAxICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gVE9ETzogcmVtb3ZlIHRoaXMhXHJcbiAgICAgICAgICB3aW5kb3cudHJpRGVidWcgJiYgd2luZG93LnRyaURlYnVnKCB0aGlzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRmlsbCBpbiB0aGUgbGFzdCB0cmlhbmdsZVxyXG4gICAgaWYgKCBlZGdlcy5sZW5ndGggPT09IDMgKSB7XHJcbiAgICAgIHRoaXMudHJpYW5nbGVzLnB1c2goIG5ldyBUcmlhbmdsZSggZWRnZXNbIDAgXS5nZXRTaGFyZWRWZXJ0ZXgoIGVkZ2VzWyAxIF0gKSwgZWRnZXNbIDEgXS5nZXRTaGFyZWRWZXJ0ZXgoIGVkZ2VzWyAyIF0gKSwgZWRnZXNbIDAgXS5nZXRTaGFyZWRWZXJ0ZXgoIGVkZ2VzWyAyIF0gKSxcclxuICAgICAgICBlZGdlc1sgMiBdLCBlZGdlc1sgMCBdLCBlZGdlc1sgMSBdICkgKTtcclxuXHJcbiAgICAgIC8vIFRPRE86IHJlbW92ZSB0aGlzIVxyXG4gICAgICB3aW5kb3cudHJpRGVidWcgJiYgd2luZG93LnRyaURlYnVnKCB0aGlzICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaG91bGQgYmUgY2FsbGVkIHdoZW4gdGhlcmUgYXJlIG5vIG1vcmUgcmVtYWluaW5nIHZlcnRpY2VzIGxlZnQgdG8gYmUgcHJvY2Vzc2VkLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZmluYWxpemUoKSB7XHJcbiAgICAvLyBBY2N1bXVsYXRlIGZyb250IGVkZ2VzLCBleGNsdWRpbmcgdGhlIGZpcnN0IGFuZCBsYXN0LlxyXG4gICAgY29uc3QgZnJvbnRFZGdlcyA9IFtdO1xyXG4gICAgbGV0IGZyb250RWRnZSA9IHRoaXMuZmlyc3RGcm9udEVkZ2UubmV4dEVkZ2U7XHJcbiAgICB3aGlsZSAoIGZyb250RWRnZSAmJiBmcm9udEVkZ2UubmV4dEVkZ2UgKSB7XHJcbiAgICAgIGZyb250RWRnZXMucHVzaCggZnJvbnRFZGdlICk7XHJcbiAgICAgIGZyb250RWRnZSA9IGZyb250RWRnZS5uZXh0RWRnZTtcclxuICAgIH1cclxuICAgIGNvbnN0IGZpcnN0RnJvbnRFZGdlID0gdGhpcy5maXJzdEZyb250RWRnZTtcclxuICAgIGNvbnN0IGxhc3RGcm9udEVkZ2UgPSBmcm9udEVkZ2U7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5maXJzdEZyb250RWRnZS50cmlhbmdsZXMubGVuZ3RoID09PSAxICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsYXN0RnJvbnRFZGdlLnRyaWFuZ2xlcy5sZW5ndGggPT09IDEgKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgYWRkaW5nIGFueSB0cmlhbmdsZXMgbm90IGluIHRoZSBjb252ZXggaHVsbCAob24gdGhlIGZyb250IGVkZ2UpXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBmcm9udEVkZ2VzLmxlbmd0aCAtIDE7IGkrKyApIHtcclxuICAgICAgY29uc3QgZmlyc3RFZGdlID0gZnJvbnRFZGdlc1sgaSBdO1xyXG4gICAgICBjb25zdCBzZWNvbmRFZGdlID0gZnJvbnRFZGdlc1sgaSArIDEgXTtcclxuICAgICAgaWYgKCBVdGlscy50cmlhbmdsZUFyZWFTaWduZWQoIHNlY29uZEVkZ2UuZW5kVmVydGV4LnBvaW50LCBmaXJzdEVkZ2UuZW5kVmVydGV4LnBvaW50LCBmaXJzdEVkZ2Uuc3RhcnRWZXJ0ZXgucG9pbnQgKSA+IDFlLTEwICkge1xyXG4gICAgICAgIGNvbnN0IG5ld0VkZ2UgPSB0aGlzLmZpbGxCb3JkZXJUcmlhbmdsZSggZmlyc3RFZGdlLCBzZWNvbmRFZGdlLCBmaXJzdEVkZ2Uuc3RhcnRWZXJ0ZXgsIGZpcnN0RWRnZS5lbmRWZXJ0ZXgsIHNlY29uZEVkZ2UuZW5kVmVydGV4ICk7XHJcbiAgICAgICAgZnJvbnRFZGdlcy5zcGxpY2UoIGksIDIsIG5ld0VkZ2UgKTtcclxuICAgICAgICAvLyBzdGFydCBzY2FubmluZyBmcm9tIGJlaGluZCB3aGVyZSB3ZSB3ZXJlIHByZXZpb3VzbHkgKGlmIHBvc3NpYmxlKVxyXG4gICAgICAgIGkgPSBNYXRoLm1heCggaSAtIDIsIC0xICk7XHJcbiAgICAgICAgLy8gVE9ETzogcmVtb3ZlIHRoaXMhXHJcbiAgICAgICAgd2luZG93LnRyaURlYnVnICYmIHdpbmRvdy50cmlEZWJ1ZyggdGhpcyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2xlYXIgb3V0IGZyb250IGVkZ2UgaW5mb3JtYXRpb24sIG5vIGxvbmdlciBuZWVkZWQuXHJcbiAgICB0aGlzLmZpcnN0RnJvbnRFZGdlID0gbnVsbDtcclxuXHJcbiAgICAvLyBBY2N1bXVsYXRlIGJhY2sgZWRnZXMgYW5kIGl0ZW1zIHRvIGdldCByaWQgb2ZcclxuICAgIGNvbnN0IGJhY2tFZGdlcyA9IFtdO1xyXG4gICAgY29uc3QgYXJ0aWZpY2lhbEVkZ2VzID0gWyBmaXJzdEZyb250RWRnZSBdO1xyXG4gICAgbGV0IGN1cnJlbnRTcGxpdEVkZ2UgPSBmaXJzdEZyb250RWRnZTtcclxuICAgIHdoaWxlICggY3VycmVudFNwbGl0RWRnZSAhPT0gbGFzdEZyb250RWRnZSApIHtcclxuICAgICAgY29uc3QgbmV4dFRyaWFuZ2xlID0gY3VycmVudFNwbGl0RWRnZS50cmlhbmdsZXNbIDAgXTtcclxuICAgICAgbmV4dFRyaWFuZ2xlLnJlbW92ZSgpO1xyXG4gICAgICBhcnJheVJlbW92ZSggdGhpcy50cmlhbmdsZXMsIG5leHRUcmlhbmdsZSApO1xyXG5cclxuICAgICAgY29uc3QgZWRnZSA9IG5leHRUcmlhbmdsZS5nZXROb25BcnRpZmljaWFsRWRnZSgpO1xyXG4gICAgICBpZiAoIGVkZ2UgKSB7XHJcbiAgICAgICAgYmFja0VkZ2VzLnB1c2goIGVkZ2UgKTtcclxuICAgICAgICBjb25zdCBzaGFyZWRWZXJ0ZXggPSBlZGdlLmdldFNoYXJlZFZlcnRleCggY3VycmVudFNwbGl0RWRnZSApO1xyXG4gICAgICAgIGN1cnJlbnRTcGxpdEVkZ2UgPSBuZXh0VHJpYW5nbGUuZ2V0RWRnZU9wcG9zaXRlRnJvbVZlcnRleCggc2hhcmVkVmVydGV4ICk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gT3VyIG1pbi1tYXgtYm90dG9tUG9pbnQgdHJpYW5nbGUgKHBpdm90LCBubyBlZGdlIHRvIGFkZClcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY3VycmVudFNwbGl0RWRnZS5zdGFydFZlcnRleCA9PT0gdGhpcy5hcnRpZmljaWFsTWF4VmVydGV4ICk7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgXCJib3R0b21cIiBlZGdlIGNvbm5lY3RpbmcgYm90aCBhcnRpZmljaWFsIHBvaW50c1xyXG4gICAgICAgIGFydGlmaWNpYWxFZGdlcy5wdXNoKCBuZXh0VHJpYW5nbGUuZ2V0RWRnZU9wcG9zaXRlRnJvbVZlcnRleCggY3VycmVudFNwbGl0RWRnZS5lbmRWZXJ0ZXggKSApO1xyXG5cclxuICAgICAgICAvLyBQaXZvdFxyXG4gICAgICAgIGN1cnJlbnRTcGxpdEVkZ2UgPSBuZXh0VHJpYW5nbGUuZ2V0RWRnZU9wcG9zaXRlRnJvbVZlcnRleCggY3VycmVudFNwbGl0RWRnZS5zdGFydFZlcnRleCApO1xyXG4gICAgICB9XHJcbiAgICAgIGFydGlmaWNpYWxFZGdlcy5wdXNoKCBjdXJyZW50U3BsaXRFZGdlICk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJ0aWZpY2lhbEVkZ2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBhcnJheVJlbW92ZSggdGhpcy5lZGdlcywgYXJ0aWZpY2lhbEVkZ2VzWyBpIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiByZW1vdmUgdGhpcyFcclxuICAgIHdpbmRvdy50cmlEZWJ1ZyAmJiB3aW5kb3cudHJpRGVidWcoIHRoaXMgKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgYWRkaW5nIGFueSB0cmlhbmdsZXMgbm90IGluIHRoZSBjb252ZXggaHVsbCAob24gdGhlIGJhY2sgZWRnZSlcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJhY2tFZGdlcy5sZW5ndGggLSAxOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGZpcnN0RWRnZSA9IGJhY2tFZGdlc1sgaSArIDEgXTtcclxuICAgICAgY29uc3Qgc2Vjb25kRWRnZSA9IGJhY2tFZGdlc1sgaSBdO1xyXG5cclxuICAgICAgY29uc3Qgc2hhcmVkVmVydGV4ID0gZmlyc3RFZGdlLmdldFNoYXJlZFZlcnRleCggc2Vjb25kRWRnZSApO1xyXG4gICAgICBjb25zdCBmaXJzdFZlcnRleCA9IGZpcnN0RWRnZS5nZXRPdGhlclZlcnRleCggc2hhcmVkVmVydGV4ICk7XHJcbiAgICAgIGNvbnN0IHNlY29uZFZlcnRleCA9IHNlY29uZEVkZ2UuZ2V0T3RoZXJWZXJ0ZXgoIHNoYXJlZFZlcnRleCApO1xyXG4gICAgICBpZiAoIFV0aWxzLnRyaWFuZ2xlQXJlYVNpZ25lZCggc2Vjb25kVmVydGV4LnBvaW50LCBzaGFyZWRWZXJ0ZXgucG9pbnQsIGZpcnN0VmVydGV4LnBvaW50ICkgPiAxZS0xMCApIHtcclxuICAgICAgICBjb25zdCBuZXdFZGdlID0gdGhpcy5maWxsQm9yZGVyVHJpYW5nbGUoIGZpcnN0RWRnZSwgc2Vjb25kRWRnZSwgZmlyc3RWZXJ0ZXgsIHNoYXJlZFZlcnRleCwgc2Vjb25kVmVydGV4ICk7XHJcbiAgICAgICAgYmFja0VkZ2VzLnNwbGljZSggaSwgMiwgbmV3RWRnZSApO1xyXG4gICAgICAgIC8vIHN0YXJ0IHNjYW5uaW5nIGZyb20gYmVoaW5kIHdoZXJlIHdlIHdlcmUgcHJldmlvdXNseSAoaWYgcG9zc2libGUpXHJcbiAgICAgICAgaSA9IE1hdGgubWF4KCBpIC0gMiwgLTEgKTtcclxuICAgICAgICAvLyBUT0RPOiByZW1vdmUgdGhpcyFcclxuICAgICAgICB3aW5kb3cudHJpRGVidWcgJiYgd2luZG93LnRyaURlYnVnKCB0aGlzICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBmcm9udEVkZ2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB0aGlzLmNvbnZleEh1bGwucHVzaCggZnJvbnRFZGdlc1sgaSBdLnN0YXJ0VmVydGV4ICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvbnZleEh1bGwucHVzaCggZnJvbnRFZGdlc1sgZnJvbnRFZGdlcy5sZW5ndGggLSAxIF0uZW5kVmVydGV4ICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IGJhY2tFZGdlcy5sZW5ndGggLSAxOyBpID49IDE7IGktLSApIHtcclxuICAgICAgdGhpcy5jb252ZXhIdWxsLnB1c2goIGJhY2tFZGdlc1sgaSBdLmdldFNoYXJlZFZlcnRleCggYmFja0VkZ2VzWyBpIC0gMSBdICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrcyBhbiBlZGdlIHRvIHNlZSB3aGV0aGVyIGl0cyB0d28gYWRqYWNlbnQgdHJpYW5nbGVzIHNhdGlzZnkgdGhlIGRlbGF1bmF5IGNvbmRpdGlvbiAodGhlIGZhciBwb2ludCBvZiBvbmVcclxuICAgKiB0cmlhbmdsZSBzaG91bGQgbm90IGJlIGNvbnRhaW5lZCBpbiB0aGUgb3RoZXIgdHJpYW5nbGUncyBjaXJjdW1jaXJjbGUpLCBhbmQgaWYgaXQgaXMgbm90IHNhdGlzZmllZCwgZmxpcHMgdGhlXHJcbiAgICogZWRnZSBzbyB0aGUgY29uZGl0aW9uIGlzIHNhdGlzZmllZC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFZGdlfSBlZGdlXHJcbiAgICovXHJcbiAgbGVnYWxpemVFZGdlKCBlZGdlICkge1xyXG4gICAgLy8gQ2hlY2tpbmcgZWFjaCBlZGdlIHRvIHNlZSBpZiBpdCBpc24ndCBpbiBvdXIgdHJpYW5ndWxhdGlvbiBhbnltb3JlIChvciBjYW4ndCBiZSBpbGxlZ2FsIGJlY2F1c2UgaXQgZG9lc24ndFxyXG4gICAgLy8gaGF2ZSBtdWx0aXBsZSB0cmlhbmdsZXMpIGhlbHBzIGEgbG90LlxyXG4gICAgaWYgKCAhXy5pbmNsdWRlcyggdGhpcy5lZGdlcywgZWRnZSApIHx8IGVkZ2UudHJpYW5nbGVzLmxlbmd0aCAhPT0gMiB8fCBlZGdlLmlzQ29uc3RyYWluZWQgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0cmlhbmdsZTEgPSBlZGdlLnRyaWFuZ2xlc1sgMCBdO1xyXG4gICAgY29uc3QgdHJpYW5nbGUyID0gZWRnZS50cmlhbmdsZXNbIDEgXTtcclxuXHJcbiAgICBjb25zdCBmYXJWZXJ0ZXgxID0gdHJpYW5nbGUxLmdldFZlcnRleE9wcG9zaXRlRnJvbUVkZ2UoIGVkZ2UgKTtcclxuICAgIGNvbnN0IGZhclZlcnRleDIgPSB0cmlhbmdsZTIuZ2V0VmVydGV4T3Bwb3NpdGVGcm9tRWRnZSggZWRnZSApO1xyXG5cclxuICAgIGlmICggVXRpbHMucG9pbnRJbkNpcmNsZUZyb21Qb2ludHMoIHRyaWFuZ2xlMS5hVmVydGV4LnBvaW50LCB0cmlhbmdsZTEuYlZlcnRleC5wb2ludCwgdHJpYW5nbGUxLmNWZXJ0ZXgucG9pbnQsIGZhclZlcnRleDIucG9pbnQgKSB8fFxyXG4gICAgICAgICBVdGlscy5wb2ludEluQ2lyY2xlRnJvbVBvaW50cyggdHJpYW5nbGUyLmFWZXJ0ZXgucG9pbnQsIHRyaWFuZ2xlMi5iVmVydGV4LnBvaW50LCB0cmlhbmdsZTIuY1ZlcnRleC5wb2ludCwgZmFyVmVydGV4MS5wb2ludCApICkge1xyXG4gICAgICAvLyBUT0RPOiBiZXR0ZXIgaGVscGVyIGZ1bmN0aW9ucyBmb3IgYWRkaW5nL3JlbW92aW5nIHRyaWFuZ2xlcyAodGFrZXMgY2FyZSBvZiB0aGUgZWRnZSBzdHVmZilcclxuICAgICAgdHJpYW5nbGUxLnJlbW92ZSgpO1xyXG4gICAgICB0cmlhbmdsZTIucmVtb3ZlKCk7XHJcbiAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLnRyaWFuZ2xlcywgdHJpYW5nbGUxICk7XHJcbiAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLnRyaWFuZ2xlcywgdHJpYW5nbGUyICk7XHJcbiAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLmVkZ2VzLCBlZGdlICk7XHJcblxyXG4gICAgICBjb25zdCBuZXdFZGdlID0gbmV3IEVkZ2UoIGZhclZlcnRleDEsIGZhclZlcnRleDIgKTtcclxuICAgICAgdGhpcy5lZGdlcy5wdXNoKCBuZXdFZGdlICk7XHJcblxyXG4gICAgICBjb25zdCB0cmlhbmdsZTFFZGdlMSA9IHRyaWFuZ2xlMi5nZXRFZGdlT3Bwb3NpdGVGcm9tVmVydGV4KCB0cmlhbmdsZTIuZ2V0VmVydGV4QmVmb3JlKCBmYXJWZXJ0ZXgyICkgKTtcclxuICAgICAgY29uc3QgdHJpYW5nbGUxRWRnZTIgPSB0cmlhbmdsZTEuZ2V0RWRnZU9wcG9zaXRlRnJvbVZlcnRleCggdHJpYW5nbGUxLmdldFZlcnRleEFmdGVyKCBmYXJWZXJ0ZXgxICkgKTtcclxuICAgICAgY29uc3QgdHJpYW5nbGUyRWRnZTEgPSB0cmlhbmdsZTEuZ2V0RWRnZU9wcG9zaXRlRnJvbVZlcnRleCggdHJpYW5nbGUxLmdldFZlcnRleEJlZm9yZSggZmFyVmVydGV4MSApICk7XHJcbiAgICAgIGNvbnN0IHRyaWFuZ2xlMkVkZ2UyID0gdHJpYW5nbGUyLmdldEVkZ2VPcHBvc2l0ZUZyb21WZXJ0ZXgoIHRyaWFuZ2xlMi5nZXRWZXJ0ZXhBZnRlciggZmFyVmVydGV4MiApICk7XHJcblxyXG4gICAgICAvLyBDb25zdHJ1Y3QgdGhlIG5ldyB0cmlhbmdsZXMgd2l0aCB0aGUgY29ycmVjdCBvcmllbnRhdGlvbnNcclxuICAgICAgdGhpcy50cmlhbmdsZXMucHVzaCggbmV3IFRyaWFuZ2xlKCBmYXJWZXJ0ZXgxLCBmYXJWZXJ0ZXgyLCB0cmlhbmdsZTEuZ2V0VmVydGV4QmVmb3JlKCBmYXJWZXJ0ZXgxICksXHJcbiAgICAgICAgdHJpYW5nbGUxRWRnZTEsIHRyaWFuZ2xlMUVkZ2UyLCBuZXdFZGdlICkgKTtcclxuICAgICAgdGhpcy50cmlhbmdsZXMucHVzaCggbmV3IFRyaWFuZ2xlKCBmYXJWZXJ0ZXgyLCBmYXJWZXJ0ZXgxLCB0cmlhbmdsZTIuZ2V0VmVydGV4QmVmb3JlKCBmYXJWZXJ0ZXgyICksXHJcbiAgICAgICAgdHJpYW5nbGUyRWRnZTEsIHRyaWFuZ2xlMkVkZ2UyLCBuZXdFZGdlICkgKTtcclxuXHJcbiAgICAgIHRoaXMubGVnYWxpemVFZGdlKCB0cmlhbmdsZTFFZGdlMSApO1xyXG4gICAgICB0aGlzLmxlZ2FsaXplRWRnZSggdHJpYW5nbGUxRWRnZTIgKTtcclxuICAgICAgdGhpcy5sZWdhbGl6ZUVkZ2UoIHRyaWFuZ2xlMkVkZ2UxICk7XHJcbiAgICAgIHRoaXMubGVnYWxpemVFZGdlKCB0cmlhbmdsZTJFZGdlMiApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcGFyaXNvbiBmb3Igc29ydGluZyBwb2ludHMgYnkgeSwgdGhlbiBieSB4LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBUT0RPOiBEbyB3ZSBuZWVkIHRvIHJldmVyc2UgdGhlIHggc29ydD8gXCJJZiBvdXIgZWRnZSBpcyBob3Jpem9udGFsLCB0aGUgZW5kaW5nIHBvaW50IHdpdGggc21hbGxlciB4IGNvb3JkaW5hdGVcclxuICAgKiAgICAgICBpcyBjb25zaWRlcmVkIGFzIHRoZSB1cHBlciBwb2ludFwiP1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IGFcclxuICAgKiBAcGFyYW0ge1ZlcnRleH0gYlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgc3RhdGljIHZlcnRleENvbXBhcmlzb24oIGEsIGIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhIGluc3RhbmNlb2YgVmVydGV4ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBiIGluc3RhbmNlb2YgVmVydGV4ICk7XHJcblxyXG4gICAgYSA9IGEucG9pbnQ7XHJcbiAgICBiID0gYi5wb2ludDtcclxuICAgIGlmICggYS55IDwgYi55ICkge1xyXG4gICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggYS55ID4gYi55ICkge1xyXG4gICAgICByZXR1cm4gMTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBhLnggPCBiLnggKSB7XHJcbiAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBhLnggPiBiLnggKSB7XHJcbiAgICAgIHJldHVybiAxO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIE5PVEU6IEhvdyB3b3VsZCB0aGUgYWxnb3JpdGhtIHdvcmsgaWYgdGhpcyBpcyB0aGUgY2FzZT8gV291bGQgdGhlIGNvbXBhcmlzb24gZXZlciB0ZXN0IHRoZSByZWZsZXhpdmVcclxuICAgICAgLy8gcHJvcGVydHk/XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiAoYVZlcnRleC1zaGFyZWRWZXJ0ZXgpIGFuZCAoYlZlcnRleC1zaGFyZWRWZXJ0ZXgpXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVydGV4fSBzaGFyZWRWZXJ0ZXhcclxuICAgKiBAcGFyYW0ge1ZlcnRleH0gYVZlcnRleFxyXG4gICAqIEBwYXJhbSB7VmVydGV4fSBiVmVydGV4XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBzdGF0aWMgdmVydGV4UHJvZHVjdCggc2hhcmVkVmVydGV4LCBhVmVydGV4LCBiVmVydGV4ICkge1xyXG4gICAgY29uc3QgYURpZmYgPSBhVmVydGV4LnBvaW50Lm1pbnVzKCBzaGFyZWRWZXJ0ZXgucG9pbnQgKTtcclxuICAgIGNvbnN0IGJEaWZmID0gYlZlcnRleC5wb2ludC5taW51cyggc2hhcmVkVmVydGV4LnBvaW50ICk7XHJcbiAgICByZXR1cm4gYURpZmYuY3Jvc3NTY2FsYXIoIGJEaWZmICk7XHJcbiAgfVxyXG59XHJcblxyXG5kb3QucmVnaXN0ZXIoICdEZWxhdW5heVRyaWFuZ3VsYXRpb24nLCBEZWxhdW5heVRyaWFuZ3VsYXRpb24gKTtcclxuXHJcbmNsYXNzIFZlcnRleCB7XHJcbiAgLyoqXHJcbiAgICogVmVydGV4IChwb2ludCB3aXRoIGFuIGluZGV4KVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvaW50XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gSW5kZXggb2YgdGhlIHBvaW50IGluIHRoZSBwb2ludHMgYXJyYXlcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcG9pbnQsIGluZGV4ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcG9pbnQgaW5zdGFuY2VvZiBWZWN0b3IyICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb2ludC5pc0Zpbml0ZSgpICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgaW5kZXggPT09ICdudW1iZXInICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VmVjdG9yMn1cclxuICAgIHRoaXMucG9pbnQgPSBwb2ludDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIFdpbGwgYmUgc2V0IGFmdGVyIGNvbnN0cnVjdGlvblxyXG4gICAgdGhpcy5zb3J0ZWRJbmRleCA9IC0xO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxWZXJ0ZXg+fSAtIFZlcnRpY2VzIHdpdGggXCJsb3dlclwiIHkgdmFsdWVzIHRoYXQgaGF2ZSBjb25zdHJhaW5lZCBlZGdlcyB3aXRoIHRoaXMgdmVydGV4LlxyXG4gICAgdGhpcy5jb25zdHJhaW5lZFZlcnRpY2VzID0gW107XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBpcyBhbiBhcnRpZmljaWFsIHZlcnRleCAoaW5kZXggbGVzcyB0aGFuIHplcm8pLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzQXJ0aWZpY2lhbCgpIHtcclxuICAgIHJldHVybiB0aGlzLmluZGV4IDwgMDtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIEVkZ2Uge1xyXG4gIC8qKlxyXG4gICAqIEVkZ2UgZGVmaW5lZCBieSB0d28gdmVydGljZXNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IHN0YXJ0VmVydGV4XHJcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IGVuZFZlcnRleFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzdGFydFZlcnRleCwgZW5kVmVydGV4ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3RhcnRWZXJ0ZXggaW5zdGFuY2VvZiBWZXJ0ZXggKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVuZFZlcnRleCBpbnN0YW5jZW9mIFZlcnRleCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3RhcnRWZXJ0ZXggIT09IGVuZFZlcnRleCwgJ1Nob3VsZCBiZSBkaWZmZXJlbnQgdmVydGljZXMnICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VmVydGV4fVxyXG4gICAgdGhpcy5zdGFydFZlcnRleCA9IHN0YXJ0VmVydGV4O1xyXG4gICAgdGhpcy5lbmRWZXJ0ZXggPSBlbmRWZXJ0ZXg7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFRyaWFuZ2xlPn0gLSBBZGphY2VudCB0cmlhbmdsZXMgdG8gdGhlIGVkZ2VcclxuICAgIHRoaXMudHJpYW5nbGVzID0gW107XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RWRnZXxudWxsfSAtIExpbmtlZCBsaXN0IGZvciB0aGUgZnJvbnQgb2YgdGhlIHN3ZWVwLWxpbmUgKG9yIGluIHRoZSBiYWNrIGZvciB0aGUgY29udmV4IGh1bGwpXHJcbiAgICB0aGlzLm5leHRFZGdlID0gbnVsbDtcclxuICAgIHRoaXMucHJldmlvdXNFZGdlID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIENhbiBiZSBzZXQgdG8gbm90ZSB0aGF0IGl0IHdhcyBjb25zdHJhaW5lZFxyXG4gICAgdGhpcy5pc0NvbnN0cmFpbmVkID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgaXMgYW4gYXJ0aWZpY2lhbCBlZGdlIChoYXMgYW4gYXJ0aWZpY2lhbCB2ZXJ0ZXgpXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNBcnRpZmljaWFsKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc3RhcnRWZXJ0ZXguaXNBcnRpZmljaWFsKCkgfHwgdGhpcy5lbmRWZXJ0ZXguaXNBcnRpZmljaWFsKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBlbmRzIHRoZSBlZGdlIHRvIHRoZSBlbmQgb2YgdGhpcyBlZGdlIChmb3Igb3VyIGxpbmtlZCBsaXN0KS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0VkZ2V9IGVkZ2VcclxuICAgKi9cclxuICBjb25uZWN0QWZ0ZXIoIGVkZ2UgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlZGdlIGluc3RhbmNlb2YgRWRnZSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5lbmRWZXJ0ZXggPT09IGVkZ2Uuc3RhcnRWZXJ0ZXggKTtcclxuXHJcbiAgICB0aGlzLm5leHRFZGdlID0gZWRnZTtcclxuICAgIGVkZ2UucHJldmlvdXNFZGdlID0gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNjb25uZWN0QWZ0ZXIoKSB7XHJcbiAgICB0aGlzLm5leHRFZGdlLnByZXZpb3VzRWRnZSA9IG51bGw7XHJcbiAgICB0aGlzLm5leHRFZGdlID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYW4gYWRqYWNlbnQgdHJpYW5nbGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUcmlhbmdsZX0gdHJpYW5nbGVcclxuICAgKi9cclxuICBhZGRUcmlhbmdsZSggdHJpYW5nbGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0cmlhbmdsZSBpbnN0YW5jZW9mIFRyaWFuZ2xlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnRyaWFuZ2xlcy5sZW5ndGggPD0gMSApO1xyXG5cclxuICAgIHRoaXMudHJpYW5nbGVzLnB1c2goIHRyaWFuZ2xlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGFuIGFkamFjZW50IHRyaWFuZ2xlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VHJpYW5nbGV9IHRyaWFuZ2xlXHJcbiAgICovXHJcbiAgcmVtb3ZlVHJpYW5nbGUoIHRyaWFuZ2xlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHJpYW5nbGUgaW5zdGFuY2VvZiBUcmlhbmdsZSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggdGhpcy50cmlhbmdsZXMsIHRyaWFuZ2xlICkgKTtcclxuXHJcbiAgICBhcnJheVJlbW92ZSggdGhpcy50cmlhbmdsZXMsIHRyaWFuZ2xlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB0cmlhbmdsZSBpbiBjb21tb24gd2l0aCBib3RoIGVkZ2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RWRnZX0gb3RoZXJFZGdlXHJcbiAgICogQHJldHVybnMge1RyaWFuZ2xlfVxyXG4gICAqL1xyXG4gIGdldFNoYXJlZFRyaWFuZ2xlKCBvdGhlckVkZ2UgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvdGhlckVkZ2UgaW5zdGFuY2VvZiBFZGdlICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy50cmlhbmdsZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHRyaWFuZ2xlID0gdGhpcy50cmlhbmdsZXNbIGkgXTtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgb3RoZXJFZGdlLnRyaWFuZ2xlcy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICBpZiAoIG90aGVyRWRnZS50cmlhbmdsZXNbIGogXSA9PT0gdHJpYW5nbGUgKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJpYW5nbGU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdObyBjb21tb24gdHJpYW5nbGUnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB2ZXJ0ZXggaW4gY29tbW9uIHdpdGggYm90aCBlZGdlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0VkZ2V9IG90aGVyRWRnZVxyXG4gICAqIEByZXR1cm5zIHtWZXJ0ZXh9XHJcbiAgICovXHJcbiAgZ2V0U2hhcmVkVmVydGV4KCBvdGhlckVkZ2UgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvdGhlckVkZ2UgaW5zdGFuY2VvZiBFZGdlICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLnN0YXJ0VmVydGV4ID09PSBvdGhlckVkZ2Uuc3RhcnRWZXJ0ZXggfHwgdGhpcy5zdGFydFZlcnRleCA9PT0gb3RoZXJFZGdlLmVuZFZlcnRleCApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc3RhcnRWZXJ0ZXg7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5lbmRWZXJ0ZXggPT09IG90aGVyRWRnZS5zdGFydFZlcnRleCB8fCB0aGlzLmVuZFZlcnRleCA9PT0gb3RoZXJFZGdlLmVuZFZlcnRleCApO1xyXG4gICAgICByZXR1cm4gdGhpcy5lbmRWZXJ0ZXg7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBvdGhlciB2ZXJ0ZXggb2YgdGhlIGVkZ2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IHZlcnRleFxyXG4gICAqIEByZXR1cm5zIHtWZXJ0ZXh9XHJcbiAgICovXHJcbiAgZ2V0T3RoZXJWZXJ0ZXgoIHZlcnRleCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlcnRleCBpbnN0YW5jZW9mIFZlcnRleCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmVydGV4ID09PSB0aGlzLnN0YXJ0VmVydGV4IHx8IHZlcnRleCA9PT0gdGhpcy5lbmRWZXJ0ZXggKTtcclxuXHJcbiAgICBpZiAoIHZlcnRleCA9PT0gdGhpcy5zdGFydFZlcnRleCApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZW5kVmVydGV4O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnN0YXJ0VmVydGV4O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgb3RoZXIgdHJpYW5nbGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZWRnZSAoaWYgdGhlcmUgYXJlIHR3bykuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUcmlhbmdsZX0gdHJpYW5nbGVcclxuICAgKiBAcmV0dXJucyB7VHJpYW5nbGV9XHJcbiAgICovXHJcbiAgZ2V0T3RoZXJUcmlhbmdsZSggdHJpYW5nbGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0cmlhbmdsZSBpbnN0YW5jZW9mIFRyaWFuZ2xlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnRyaWFuZ2xlcy5sZW5ndGggPT09IDIgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMudHJpYW5nbGVzWyAwIF0gPT09IHRyaWFuZ2xlICkge1xyXG4gICAgICByZXR1cm4gdGhpcy50cmlhbmdsZXNbIDEgXTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy50cmlhbmdsZXNbIDAgXTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgbGluZSBzZWdtZW50IGRlZmluZWQgYmV0d2VlbiB0aGUgdmVydGV4IGFuZCBib3R0b21WZXJ0ZXggaW50ZXJzZWN0IHRoaXMgZWRnZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlcnRleH0gdmVydGV4XHJcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IGJvdHRvbVZlcnRleFxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGludGVyc2VjdHNDb25zdHJhaW5lZEVkZ2UoIHZlcnRleCwgYm90dG9tVmVydGV4ICkge1xyXG4gICAgcmV0dXJuIFV0aWxzLmxpbmVTZWdtZW50SW50ZXJzZWN0aW9uKCB2ZXJ0ZXgucG9pbnQueCwgdmVydGV4LnBvaW50LnksIGJvdHRvbVZlcnRleC5wb2ludC54LCBib3R0b21WZXJ0ZXgucG9pbnQueSxcclxuICAgICAgdGhpcy5zdGFydFZlcnRleC5wb2ludC54LCB0aGlzLnN0YXJ0VmVydGV4LnBvaW50LnksXHJcbiAgICAgIHRoaXMuZW5kVmVydGV4LnBvaW50LngsIHRoaXMuZW5kVmVydGV4LnBvaW50LnkgKTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFRyaWFuZ2xlIHtcclxuICAvKipcclxuICAgKiBUcmlhbmdsZSBkZWZpbmVkIGJ5IHRocmVlIHZlcnRpY2VzICh3aXRoIGVkZ2VzKVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlcnRleH0gYVZlcnRleFxyXG4gICAqIEBwYXJhbSB7VmVydGV4fSBiVmVydGV4XHJcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IGNWZXJ0ZXhcclxuICAgKiBAcGFyYW0ge0VkZ2V9IGFFZGdlIC0gRWRnZSBvcHBvc2l0ZSB0aGUgJ2EnIHZlcnRleFxyXG4gICAqIEBwYXJhbSB7RWRnZX0gYkVkZ2UgLSBFZGdlIG9wcG9zaXRlIHRoZSAnYicgdmVydGV4XHJcbiAgICogQHBhcmFtIHtFZGdlfSBjRWRnZSAtIEVkZ2Ugb3Bwb3NpdGUgdGhlICdjJyB2ZXJ0ZXhcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggYVZlcnRleCwgYlZlcnRleCwgY1ZlcnRleCwgYUVkZ2UsIGJFZGdlLCBjRWRnZSApIHtcclxuICAgIC8vIFR5cGUgY2hlY2tzXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhVmVydGV4IGluc3RhbmNlb2YgVmVydGV4ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBiVmVydGV4IGluc3RhbmNlb2YgVmVydGV4ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjVmVydGV4IGluc3RhbmNlb2YgVmVydGV4ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhRWRnZSBpbnN0YW5jZW9mIEVkZ2UgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJFZGdlIGluc3RhbmNlb2YgRWRnZSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY0VkZ2UgaW5zdGFuY2VvZiBFZGdlICk7XHJcblxyXG4gICAgLy8gRW5zdXJlIGVhY2ggdmVydGV4IGlzIE5PVCBpbiB0aGUgb3Bwb3NpdGUgZWRnZVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYVZlcnRleCAhPT0gYUVkZ2Uuc3RhcnRWZXJ0ZXggJiYgYVZlcnRleCAhPT0gYUVkZ2UuZW5kVmVydGV4LCAnU2hvdWxkIGJlIGFuIG9wcG9zaXRlIGVkZ2UnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBiVmVydGV4ICE9PSBiRWRnZS5zdGFydFZlcnRleCAmJiBiVmVydGV4ICE9PSBiRWRnZS5lbmRWZXJ0ZXgsICdTaG91bGQgYmUgYW4gb3Bwb3NpdGUgZWRnZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNWZXJ0ZXggIT09IGNFZGdlLnN0YXJ0VmVydGV4ICYmIGNWZXJ0ZXggIT09IGNFZGdlLmVuZFZlcnRleCwgJ1Nob3VsZCBiZSBhbiBvcHBvc2l0ZSBlZGdlJyApO1xyXG5cclxuICAgIC8vIEVuc3VyZSBlYWNoIHZlcnRleCBJUyBpbiBpdHMgYWRqYWNlbnQgZWRnZXNcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFWZXJ0ZXggPT09IGJFZGdlLnN0YXJ0VmVydGV4IHx8IGFWZXJ0ZXggPT09IGJFZGdlLmVuZFZlcnRleCwgJ2FWZXJ0ZXggc2hvdWxkIGJlIGluIGJFZGdlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYVZlcnRleCA9PT0gY0VkZ2Uuc3RhcnRWZXJ0ZXggfHwgYVZlcnRleCA9PT0gY0VkZ2UuZW5kVmVydGV4LCAnYVZlcnRleCBzaG91bGQgYmUgaW4gY0VkZ2UnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBiVmVydGV4ID09PSBhRWRnZS5zdGFydFZlcnRleCB8fCBiVmVydGV4ID09PSBhRWRnZS5lbmRWZXJ0ZXgsICdiVmVydGV4IHNob3VsZCBiZSBpbiBhRWRnZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJWZXJ0ZXggPT09IGNFZGdlLnN0YXJ0VmVydGV4IHx8IGJWZXJ0ZXggPT09IGNFZGdlLmVuZFZlcnRleCwgJ2JWZXJ0ZXggc2hvdWxkIGJlIGluIGNFZGdlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY1ZlcnRleCA9PT0gYUVkZ2Uuc3RhcnRWZXJ0ZXggfHwgY1ZlcnRleCA9PT0gYUVkZ2UuZW5kVmVydGV4LCAnY1ZlcnRleCBzaG91bGQgYmUgaW4gYUVkZ2UnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjVmVydGV4ID09PSBiRWRnZS5zdGFydFZlcnRleCB8fCBjVmVydGV4ID09PSBiRWRnZS5lbmRWZXJ0ZXgsICdjVmVydGV4IHNob3VsZCBiZSBpbiBiRWRnZScgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBVdGlscy50cmlhbmdsZUFyZWFTaWduZWQoIGFWZXJ0ZXgucG9pbnQsIGJWZXJ0ZXgucG9pbnQsIGNWZXJ0ZXgucG9pbnQgKSA+IDAsXHJcbiAgICAgICdTaG91bGQgYmUgY291bnRlcmNsb2Nrd2lzZScgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtWZXJ0ZXh9XHJcbiAgICB0aGlzLmFWZXJ0ZXggPSBhVmVydGV4O1xyXG4gICAgdGhpcy5iVmVydGV4ID0gYlZlcnRleDtcclxuICAgIHRoaXMuY1ZlcnRleCA9IGNWZXJ0ZXg7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RWRnZX1cclxuICAgIHRoaXMuYUVkZ2UgPSBhRWRnZTtcclxuICAgIHRoaXMuYkVkZ2UgPSBiRWRnZTtcclxuICAgIHRoaXMuY0VkZ2UgPSBjRWRnZTtcclxuXHJcbiAgICB0aGlzLmFFZGdlLmFkZFRyaWFuZ2xlKCB0aGlzICk7XHJcbiAgICB0aGlzLmJFZGdlLmFkZFRyaWFuZ2xlKCB0aGlzICk7XHJcbiAgICB0aGlzLmNFZGdlLmFkZFRyaWFuZ2xlKCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHZlcnRleCBpcyBvbmUgaW4gdGhlIHRyaWFuZ2xlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVydGV4fSB2ZXJ0ZXhcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBoYXNWZXJ0ZXgoIHZlcnRleCApIHtcclxuICAgIHJldHVybiB0aGlzLmFWZXJ0ZXggPT09IHZlcnRleCB8fCB0aGlzLmJWZXJ0ZXggPT09IHZlcnRleCB8fCB0aGlzLmNWZXJ0ZXggPT09IHZlcnRleDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHZlcnRleCB0aGF0IGlzIG9wcG9zaXRlIGZyb20gdGhlIGdpdmVuIGVkZ2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFZGdlfSBlZGdlXHJcbiAgICogQHJldHVybnMge1ZlcnRleH1cclxuICAgKi9cclxuICBnZXRWZXJ0ZXhPcHBvc2l0ZUZyb21FZGdlKCBlZGdlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZWRnZSBpbnN0YW5jZW9mIEVkZ2UgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVkZ2UgPT09IHRoaXMuYUVkZ2UgfHwgZWRnZSA9PT0gdGhpcy5iRWRnZSB8fCBlZGdlID09PSB0aGlzLmNFZGdlLFxyXG4gICAgICAnU2hvdWxkIGJlIGFuIGVkZ2UgdGhhdCBpcyBwYXJ0IG9mIHRoaXMgdHJpYW5nbGUnICk7XHJcblxyXG4gICAgaWYgKCBlZGdlID09PSB0aGlzLmFFZGdlICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5hVmVydGV4O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGVkZ2UgPT09IHRoaXMuYkVkZ2UgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmJWZXJ0ZXg7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY1ZlcnRleDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGVkZ2UgdGhhdCBpcyBvcHBvc2l0ZSBmcm9tIHRoZSBnaXZlbiB2ZXJ0ZXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IHZlcnRleFxyXG4gICAqIEByZXR1cm5zIHtFZGdlfVxyXG4gICAqL1xyXG4gIGdldEVkZ2VPcHBvc2l0ZUZyb21WZXJ0ZXgoIHZlcnRleCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlcnRleCBpbnN0YW5jZW9mIFZlcnRleCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmVydGV4ID09PSB0aGlzLmFWZXJ0ZXggfHwgdmVydGV4ID09PSB0aGlzLmJWZXJ0ZXggfHwgdmVydGV4ID09PSB0aGlzLmNWZXJ0ZXgsXHJcbiAgICAgICdTaG91bGQgYmUgYSB2ZXJ0ZXggdGhhdCBpcyBwYXJ0IG9mIHRoaXMgdHJpYW5nbGUnICk7XHJcblxyXG4gICAgaWYgKCB2ZXJ0ZXggPT09IHRoaXMuYVZlcnRleCApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuYUVkZ2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdmVydGV4ID09PSB0aGlzLmJWZXJ0ZXggKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmJFZGdlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNFZGdlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdmVydGV4IHRoYXQgaXMganVzdCBiZWZvcmUgdGhlIGdpdmVuIHZlcnRleCAoaW4gY291bnRlcmNsb2Nrd2lzZSBvcmRlcikuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IHZlcnRleFxyXG4gICAqIEByZXR1cm5zIHtWZXJ0ZXh9XHJcbiAgICovXHJcbiAgZ2V0VmVydGV4QmVmb3JlKCB2ZXJ0ZXggKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZXJ0ZXggaW5zdGFuY2VvZiBWZXJ0ZXggKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlcnRleCA9PT0gdGhpcy5hVmVydGV4IHx8IHZlcnRleCA9PT0gdGhpcy5iVmVydGV4IHx8IHZlcnRleCA9PT0gdGhpcy5jVmVydGV4ICk7XHJcblxyXG4gICAgaWYgKCB2ZXJ0ZXggPT09IHRoaXMuYVZlcnRleCApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY1ZlcnRleDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB2ZXJ0ZXggPT09IHRoaXMuYlZlcnRleCApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuYVZlcnRleDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5iVmVydGV4O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdmVydGV4IHRoYXQgaXMganVzdCBhZnRlciB0aGUgZ2l2ZW4gdmVydGV4IChpbiBjb3VudGVyY2xvY2t3aXNlIG9yZGVyKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlcnRleH0gdmVydGV4XHJcbiAgICogQHJldHVybnMge1ZlcnRleH1cclxuICAgKi9cclxuICBnZXRWZXJ0ZXhBZnRlciggdmVydGV4ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmVydGV4IGluc3RhbmNlb2YgVmVydGV4ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZXJ0ZXggPT09IHRoaXMuYVZlcnRleCB8fCB2ZXJ0ZXggPT09IHRoaXMuYlZlcnRleCB8fCB2ZXJ0ZXggPT09IHRoaXMuY1ZlcnRleCApO1xyXG5cclxuICAgIGlmICggdmVydGV4ID09PSB0aGlzLmFWZXJ0ZXggKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmJWZXJ0ZXg7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdmVydGV4ID09PSB0aGlzLmJWZXJ0ZXggKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNWZXJ0ZXg7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuYVZlcnRleDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG9uZSBub24tYXJ0aWZpY2lhbCBlZGdlIGluIHRoZSB0cmlhbmdsZSAoYXNzdW1pbmcgaXQgZXhpc3RzKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7RWRnZXxudWxsfVxyXG4gICAqL1xyXG4gIGdldE5vbkFydGlmaWNpYWxFZGdlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggKCB0aGlzLmFFZGdlLmlzQXJ0aWZpY2lhbCgpICYmIHRoaXMuYkVkZ2UuaXNBcnRpZmljaWFsKCkgJiYgIXRoaXMuY0VkZ2UuaXNBcnRpZmljaWFsKCkgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgKCB0aGlzLmFFZGdlLmlzQXJ0aWZpY2lhbCgpICYmICF0aGlzLmJFZGdlLmlzQXJ0aWZpY2lhbCgpICYmIHRoaXMuY0VkZ2UuaXNBcnRpZmljaWFsKCkgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgKCAhdGhpcy5hRWRnZS5pc0FydGlmaWNpYWwoKSAmJiB0aGlzLmJFZGdlLmlzQXJ0aWZpY2lhbCgpICYmIHRoaXMuY0VkZ2UuaXNBcnRpZmljaWFsKCkgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgKCB0aGlzLmFFZGdlLmlzQXJ0aWZpY2lhbCgpICYmIHRoaXMuYkVkZ2UuaXNBcnRpZmljaWFsKCkgJiYgdGhpcy5jRWRnZS5pc0FydGlmaWNpYWwoKSApLFxyXG4gICAgICAnQXQgbW9zdCBvbmUgZWRnZSBzaG91bGQgYmUgbm9uLWFydGlmaWNpYWwnICk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5hRWRnZS5pc0FydGlmaWNpYWwoKSApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuYUVkZ2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggIXRoaXMuYkVkZ2UuaXNBcnRpZmljaWFsKCkgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmJFZGdlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoICF0aGlzLmNFZGdlLmlzQXJ0aWZpY2lhbCgpICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5jRWRnZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG5leHQgZWRnZSAoY291bnRlcmNsb2Nrd2lzZSkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFZGdlfSBlZGdlXHJcbiAgICogQHJldHVybnMge0VkZ2V9XHJcbiAgICovXHJcbiAgZ2V0TmV4dEVkZ2UoIGVkZ2UgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlZGdlID09PSB0aGlzLmFFZGdlIHx8IGVkZ2UgPT09IHRoaXMuYkVkZ2UgfHwgZWRnZSA9PT0gdGhpcy5jRWRnZSApO1xyXG5cclxuICAgIGlmICggdGhpcy5hRWRnZSA9PT0gZWRnZSApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuYkVkZ2U7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMuYkVkZ2UgPT09IGVkZ2UgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNFZGdlO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLmNFZGdlID09PSBlZGdlICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5hRWRnZTtcclxuICAgIH1cclxuICAgIHRocm93IG5ldyBFcnJvciggJ2lsbGVnYWwgZWRnZScgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHByZXZpb3VzIGVkZ2UgKGNsb2Nrd2lzZSkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFZGdlfSBlZGdlXHJcbiAgICogQHJldHVybnMge0VkZ2V9XHJcbiAgICovXHJcbiAgZ2V0UHJldmlvdXNFZGdlKCBlZGdlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZWRnZSA9PT0gdGhpcy5hRWRnZSB8fCBlZGdlID09PSB0aGlzLmJFZGdlIHx8IGVkZ2UgPT09IHRoaXMuY0VkZ2UgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuYUVkZ2UgPT09IGVkZ2UgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNFZGdlO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLmJFZGdlID09PSBlZGdlICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5hRWRnZTtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5jRWRnZSA9PT0gZWRnZSApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuYkVkZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnaWxsZWdhbCBlZGdlJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgaXMgYW4gYXJ0aWZpY2lhbCB0cmlhbmdsZSAoaGFzIGFuIGFydGlmaWNpYWwgdmVydGV4KVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzQXJ0aWZpY2lhbCgpIHtcclxuICAgIHJldHVybiB0aGlzLmFWZXJ0ZXguaXNBcnRpZmljaWFsKCkgfHwgdGhpcy5iVmVydGV4LmlzQXJ0aWZpY2lhbCgpIHx8IHRoaXMuY1ZlcnRleC5pc0FydGlmaWNpYWwoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZW1vdmUoKSB7XHJcbiAgICB0aGlzLmFFZGdlLnJlbW92ZVRyaWFuZ2xlKCB0aGlzICk7XHJcbiAgICB0aGlzLmJFZGdlLnJlbW92ZVRyaWFuZ2xlKCB0aGlzICk7XHJcbiAgICB0aGlzLmNFZGdlLnJlbW92ZVRyaWFuZ2xlKCB0aGlzICk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEZWxhdW5heVRyaWFuZ3VsYXRpb247Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLG1DQUFtQztBQUMzRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBQ2xDLE9BQU9DLEdBQUcsTUFBTSxVQUFVO0FBQzFCLE9BQU9DLEtBQUssTUFBTSxZQUFZO0FBQzlCLE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBRWxDLE1BQU1DLHFCQUFxQixDQUFDO0VBQzFCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsTUFBTSxFQUFFQyxXQUFXLEVBQUVDLE9BQU8sRUFBRztJQUMxQ0EsT0FBTyxHQUFHVCxLQUFLLENBQUUsQ0FBQyxDQUFDLEVBQUVTLE9BQVEsQ0FBQztJQUU5QixJQUFJQyxDQUFDOztJQUVMO0lBQ0EsSUFBSSxDQUFDSCxNQUFN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