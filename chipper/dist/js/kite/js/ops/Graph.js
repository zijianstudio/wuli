// Copyright 2017-2023, University of Colorado Boulder

/**
 * A multigraph whose edges are segments.
 *
 * Supports general shape simplification, overlap/intersection removal and computation. General output would include
 * Shapes (from CAG - Constructive Area Geometry) and triangulations.
 *
 * See Graph.binaryResult for the general procedure for CAG.
 *
 * TODO: Use https://github.com/mauriciosantos/Buckets-JS for priority queue, implement simple sweep line
 *       with "enters" and "leaves" entries in the queue. When edge removed, remove "leave" from queue.
 *       and add any replacement edges. Applies to overlap and intersection handling.
 *       NOTE: This should impact performance a lot, as we are currently over-scanning and re-scanning a lot.
 *       Intersection is currently (by far?) the performance bottleneck.
 * TODO: Collapse non-Line adjacent edges together. Similar logic to overlap for each segment time, hopefully can
 *       factor this out.
 * TODO: Properly handle sorting edges around a vertex when two edges have the same tangent out. We'll need to use
 *       curvature, or do tricks to follow both curves by an 'epsilon' and sort based on that.
 * TODO: Consider separating out epsilon values (may be a general Kite thing rather than just ops)
 * TODO: Loop-Blinn output and constrained Delaunay triangulation
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import merge from '../../../phet-core/js/merge.js';
import { Arc, Boundary, Cubic, Edge, EdgeSegmentTree, EllipticalArc, Face, kite, Line, Loop, Segment, Subpath, Vertex, VertexSegmentTree } from '../imports.js';
let bridgeId = 0;
let globalId = 0;
class Graph {
  /**
   * @public (kite-internal)
   */
  constructor() {
    // @public {Array.<Vertex>}
    this.vertices = [];

    // @public {Array.<Edge>}
    this.edges = [];

    // @public {Array.<Boundary>}
    this.innerBoundaries = [];
    this.outerBoundaries = [];
    this.boundaries = [];

    // @public {Array.<number>}
    this.shapeIds = [];

    // @public {Array.<Loop>}
    this.loops = [];

    // @public {Face}
    this.unboundedFace = Face.pool.create(null);

    // @public {Array.<Face>}
    this.faces = [this.unboundedFace];
  }

  /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   * @public
   *
   * @returns {Object}
   */
  serialize() {
    return {
      type: 'Graph',
      vertices: this.vertices.map(vertex => vertex.serialize()),
      edges: this.edges.map(edge => edge.serialize()),
      boundaries: this.boundaries.map(boundary => boundary.serialize()),
      innerBoundaries: this.innerBoundaries.map(boundary => boundary.id),
      outerBoundaries: this.outerBoundaries.map(boundary => boundary.id),
      shapeIds: this.shapeIds,
      loops: this.loops.map(loop => loop.serialize()),
      unboundedFace: this.unboundedFace.id,
      faces: this.faces.map(face => face.serialize())
    };
  }

  /**
   * Recreate a Graph based on serialized state from serialize()
   * @public
   *
   * @param {Object} obj
   */
  static deserialize(obj) {
    const graph = new Graph();
    const vertexMap = {};
    const edgeMap = {};
    const halfEdgeMap = {};
    const boundaryMap = {};
    const loopMap = {};
    const faceMap = {};
    graph.vertices = obj.vertices.map(data => {
      const vertex = new Vertex(Vector2.Vector2IO.fromStateObject(data.point));
      vertexMap[data.id] = vertex;
      // incidentHalfEdges connected below
      vertex.visited = data.visited;
      vertex.visitIndex = data.visitIndex;
      vertex.lowIndex = data.lowIndex;
      return vertex;
    });
    graph.edges = obj.edges.map(data => {
      const edge = new Edge(Segment.deserialize(data.segment), vertexMap[data.startVertex], vertexMap[data.endVertex]);
      edgeMap[data.id] = edge;
      edge.signedAreaFragment = data.signedAreaFragment;
      const deserializeHalfEdge = (halfEdge, halfEdgeData) => {
        halfEdgeMap[halfEdgeData.id] = halfEdge;
        // face connected later
        halfEdge.isReversed = halfEdgeData.isReversed;
        halfEdge.signedAreaFragment = halfEdgeData.signedAreaFragment;
        halfEdge.startVertex = vertexMap[halfEdgeData.startVertex.id];
        halfEdge.endVertex = vertexMap[halfEdgeData.endVertex.id];
        halfEdge.sortVector = Vector2.Vector2IO.fromStateObject(halfEdgeData.sortVector);
        halfEdge.data = halfEdgeData.data;
      };
      deserializeHalfEdge(edge.forwardHalf, data.forwardHalf);
      deserializeHalfEdge(edge.reversedHalf, data.reversedHalf);
      edge.visited = data.visited;
      edge.data = data.data;
      return edge;
    });

    // Connect Vertex incidentHalfEdges
    obj.vertices.forEach((data, i) => {
      const vertex = graph.vertices[i];
      vertex.incidentHalfEdges = data.incidentHalfEdges.map(id => halfEdgeMap[id]);
    });
    graph.boundaries = obj.boundaries.map(data => {
      const boundary = Boundary.pool.create(data.halfEdges.map(id => halfEdgeMap[id]));
      boundaryMap[data.id] = boundary;
      boundary.signedArea = data.signedArea;
      boundary.bounds = Bounds2.Bounds2IO.fromStateObject(data.bounds);
      // childBoundaries handled below
      return boundary;
    });
    obj.boundaries.forEach((data, i) => {
      const boundary = graph.boundaries[i];
      boundary.childBoundaries = data.childBoundaries.map(id => boundaryMap[id]);
    });
    graph.innerBoundaries = obj.innerBoundaries.map(id => boundaryMap[id]);
    graph.outerBoundaries = obj.outerBoundaries.map(id => boundaryMap[id]);
    graph.shapeIds = obj.shapeIds;
    graph.loops = obj.loops.map(data => {
      const loop = new Loop(data.shapeId, data.closed);
      loopMap[data.id] = loop;
      loop.halfEdges = data.halfEdges.map(id => halfEdgeMap[id]);
      return loop;
    });
    graph.faces = obj.faces.map((data, i) => {
      const face = i === 0 ? graph.unboundedFace : new Face(boundaryMap[data.boundary]);
      faceMap[data.id] = face;
      face.holes = data.holes.map(id => boundaryMap[id]);
      face.windingMap = data.windingMap;
      face.filled = data.filled;
      return face;
    });

    // Connected faces to halfEdges
    obj.edges.forEach((data, i) => {
      const edge = graph.edges[i];
      edge.forwardHalf.face = data.forwardHalf.face === null ? null : faceMap[data.forwardHalf.face];
      edge.reversedHalf.face = data.reversedHalf.face === null ? null : faceMap[data.reversedHalf.face];
    });
    return graph;
  }

  /**
   * Adds a Shape (with a given ID for CAG purposes) to the graph.
   * @public
   *
   * @param {number} shapeId - The ID which should be shared for all paths/shapes that should be combined with
   *                           respect to the winding number of faces. For CAG, independent shapes should be given
   *                           different IDs (so they have separate winding numbers recorded).
   * @param {Shape} shape
   * @param {Object} [options] - See addSubpath
   */
  addShape(shapeId, shape, options) {
    for (let i = 0; i < shape.subpaths.length; i++) {
      this.addSubpath(shapeId, shape.subpaths[i], options);
    }
  }

  /**
   * Adds a subpath of a Shape (with a given ID for CAG purposes) to the graph.
   * @public
   *
   * @param {number} shapeId - See addShape() documentation
   * @param {Subpath} subpath
   * @param {Object} [options]
   */
  addSubpath(shapeId, subpath, options) {
    assert && assert(typeof shapeId === 'number');
    assert && assert(subpath instanceof Subpath);
    options = merge({
      ensureClosed: true
    }, options);

    // Ensure the shapeId is recorded
    if (this.shapeIds.indexOf(shapeId) < 0) {
      this.shapeIds.push(shapeId);
    }
    if (subpath.segments.length === 0) {
      return;
    }
    const closed = subpath.closed || options.ensureClosed;
    const segments = options.ensureClosed ? subpath.getFillSegments() : subpath.segments;
    let index;

    // Collects all of the vertices
    const vertices = [];
    for (index = 0; index < segments.length; index++) {
      let previousIndex = index - 1;
      if (previousIndex < 0) {
        previousIndex = segments.length - 1;
      }

      // Get the end of the previous segment and start of the next. Generally they should be equal or almost equal,
      // as it's the point at the joint of two segments.
      let end = segments[previousIndex].end;
      const start = segments[index].start;

      // If we are creating an open "loop", don't interpolate the start/end of the entire subpath together.
      if (!closed && index === 0) {
        end = start;
      }

      // If they are exactly equal, don't take a chance on floating-point arithmetic
      if (start.equals(end)) {
        vertices.push(Vertex.pool.create(start));
      } else {
        assert && assert(start.distance(end) < 1e-5, 'Inaccurate start/end points');
        vertices.push(Vertex.pool.create(start.average(end)));
      }
    }
    if (!closed) {
      // If we aren't closed, create an "end" vertex since it may be different from the "start"
      vertices.push(Vertex.pool.create(segments[segments.length - 1].end));
    }

    // Create the loop object from the vertices, filling in edges
    const loop = Loop.pool.create(shapeId, closed);
    for (index = 0; index < segments.length; index++) {
      let nextIndex = index + 1;
      if (closed && nextIndex === segments.length) {
        nextIndex = 0;
      }
      const edge = Edge.pool.create(segments[index], vertices[index], vertices[nextIndex]);
      loop.halfEdges.push(edge.forwardHalf);
      this.addEdge(edge);
    }
    this.loops.push(loop);
    this.vertices.push(...vertices);
  }

  /**
   * Simplifies edges/vertices, computes boundaries and faces (with the winding map).
   * @public
   */
  computeSimplifiedFaces() {
    // Before we find any intersections (self-intersection or between edges), we'll want to identify and fix up
    // any cases where there are an infinite number of intersections between edges (they are continuously
    // overlapping). For any overlap, we'll split it into one "overlap" edge and any remaining edges. After this
    // process, there should be no continuous overlaps.
    this.eliminateOverlap();

    // Detects any edge self-intersection, and splits it into multiple edges. This currently happens with cubics only,
    // but needs to be done before we intersect those cubics with any other edges.
    this.eliminateSelfIntersection();

    // Find inter-edge intersections (that aren't at endpoints). Splits edges involved into the intersection. After
    // this pass, we should have a well-defined graph where in the planar embedding edges don't intersect or overlap.
    this.eliminateIntersection();

    // From the above process (and input), we may have multiple vertices that occupy essentially the same location.
    // These vertices get combined into one vertex in the location. If there was a mostly-degenerate edge that was
    // very small between edges, it will be removed.
    this.collapseVertices();

    // Our graph can end up with edges that would have the same face on both sides (are considered a "bridge" edge).
    // These need to be removed, so that our face handling logic doesn't have to handle another class of cases.
    this.removeBridges();

    // Vertices can be left over where they have less than 2 incident edges, and they can be safely removed (since
    // they won't contribute to the area output).
    this.removeLowOrderVertices();

    // Now that the graph has well-defined vertices and edges (2-edge-connected, nonoverlapping), we'll want to know
    // the order of edges around a vertex (if you rotate around a vertex, what edges are in what order?).
    this.orderVertexEdges();

    // Extracts boundaries and faces, by following each half-edge counter-clockwise, and faces are created for
    // boundaries that have positive signed area.
    this.extractFaces();

    // We need to determine which boundaries are holes for each face. This creates a "boundary tree" where the nodes
    // are boundaries. All connected components should be one face and its holes. The holes get stored on the
    // respective face.
    this.computeBoundaryTree();

    // Compute the winding numbers of each face for each shapeId, to determine whether the input would have that
    // face "filled". It should then be ready for future processing.
    this.computeWindingMap();
  }

  /**
   * Sets whether each face should be filled or unfilled based on a filter function.
   * @public
   *
   * The windingMapFilter will be called on each face's winding map, and will use the return value as whether the face
   * is filled or not.
   *
   * The winding map is an {Object} associated with each face that has a key for every shapeId that was used in
   * addShape/addSubpath, and the value for those keys is the winding number of the face given all paths with the
   * shapeId.
   *
   * For example, imagine you added two shapeIds (0 and 1), and the iteration is on a face that is included in
   * one loop specified with shapeId:0 (inside a counter-clockwise curve), and is outside of any segments specified
   * by the second loop (shapeId:1). Then the winding map will be:
   * {
   *   0: 1 // shapeId:0 has a winding number of 1 for this face (generally filled)
   *   1: 0 // shapeId:1 has a winding number of 0 for this face (generally not filled)
   * }
   *
   * Generally, winding map filters can be broken down into two steps:
   * 1. Given the winding number for each shapeId, compute whether that loop was originally filled. Normally, this is
   *    done with a non-zero rule (any winding number is filled, except zero). SVG also provides an even-odd rule
   *    (odd numbers are filled, even numbers are unfilled).
   * 2. Given booleans for each shapeId from step 1, compute CAG operations based on boolean formulas. Say you wanted
   *    to take the union of shapeIds 0 and 1, then remove anything in shapeId 2. Given the booleans above, this can
   *    be directly computed as (filled0 || filled1) && !filled2.
   *
   * @param {function} windingMapFilter
   */
  computeFaceInclusion(windingMapFilter) {
    for (let i = 0; i < this.faces.length; i++) {
      const face = this.faces[i];
      face.filled = windingMapFilter(face.windingMap);
    }
  }

  /**
   * Create a new Graph object based only on edges in this graph that separate a "filled" face from an "unfilled"
   * face.
   * @public
   *
   * This is a convenient way to "collapse" adjacent filled and unfilled faces together, and compute the curves and
   * holes properly, given a filled "normal" graph.
   */
  createFilledSubGraph() {
    const graph = new Graph();
    const vertexMap = {}; // old id => newVertex

    for (let i = 0; i < this.edges.length; i++) {
      const edge = this.edges[i];
      if (edge.forwardHalf.face.filled !== edge.reversedHalf.face.filled) {
        if (!vertexMap[edge.startVertex.id]) {
          const newStartVertex = Vertex.pool.create(edge.startVertex.point);
          graph.vertices.push(newStartVertex);
          vertexMap[edge.startVertex.id] = newStartVertex;
        }
        if (!vertexMap[edge.endVertex.id]) {
          const newEndVertex = Vertex.pool.create(edge.endVertex.point);
          graph.vertices.push(newEndVertex);
          vertexMap[edge.endVertex.id] = newEndVertex;
        }
        const startVertex = vertexMap[edge.startVertex.id];
        const endVertex = vertexMap[edge.endVertex.id];
        graph.addEdge(Edge.pool.create(edge.segment, startVertex, endVertex));
      }
    }

    // Run some more "simplified" processing on this graph to determine which faces are filled (after simplification).
    // We don't need the intersection or other processing steps, since this was accomplished (presumably) already
    // for the given graph.
    graph.collapseAdjacentEdges();
    graph.orderVertexEdges();
    graph.extractFaces();
    graph.computeBoundaryTree();
    graph.fillAlternatingFaces();
    return graph;
  }

  /**
   * Returns a Shape that creates a subpath for each filled face (with the desired holes).
   * @public
   *
   * Generally should be called on a graph created with createFilledSubGraph().
   *
   * @returns {Shape}
   */
  facesToShape() {
    const subpaths = [];
    for (let i = 0; i < this.faces.length; i++) {
      const face = this.faces[i];
      if (face.filled) {
        subpaths.push(face.boundary.toSubpath());
        for (let j = 0; j < face.holes.length; j++) {
          subpaths.push(face.holes[j].toSubpath());
        }
      }
    }
    return new kite.Shape(subpaths);
  }

  /**
   * Releases owned objects to their pools, and clears references that may have been picked up from external sources.
   * @public
   */
  dispose() {
    // this.boundaries should contain all elements of innerBoundaries and outerBoundaries
    while (this.boundaries.length) {
      this.boundaries.pop().dispose();
    }
    cleanArray(this.innerBoundaries);
    cleanArray(this.outerBoundaries);
    while (this.loops.length) {
      this.loops.pop().dispose();
    }
    while (this.faces.length) {
      this.faces.pop().dispose();
    }
    while (this.vertices.length) {
      this.vertices.pop().dispose();
    }
    while (this.edges.length) {
      this.edges.pop().dispose();
    }
  }

  /**
   * Adds an edge to the graph (and sets up connection information).
   * @private
   *
   * @param {Edge} edge
   */
  addEdge(edge) {
    assert && assert(edge instanceof Edge);
    assert && assert(!_.includes(edge.startVertex.incidentHalfEdges, edge.reversedHalf), 'Should not already be connected');
    assert && assert(!_.includes(edge.endVertex.incidentHalfEdges, edge.forwardHalf), 'Should not already be connected');
    this.edges.push(edge);
    edge.startVertex.incidentHalfEdges.push(edge.reversedHalf);
    edge.endVertex.incidentHalfEdges.push(edge.forwardHalf);
  }

  /**
   * Removes an edge from the graph (and disconnects incident information).
   * @private
   *
   * @param {Edge} edge
   */
  removeEdge(edge) {
    assert && assert(edge instanceof Edge);
    arrayRemove(this.edges, edge);
    arrayRemove(edge.startVertex.incidentHalfEdges, edge.reversedHalf);
    arrayRemove(edge.endVertex.incidentHalfEdges, edge.forwardHalf);
  }

  /**
   * Replaces a single edge (in loops) with a series of edges (possibly empty).
   * @private
   *
   * @param {Edge} edge
   * @param {Array.<HalfEdge>} forwardHalfEdges
   */
  replaceEdgeInLoops(edge, forwardHalfEdges) {
    // Compute reversed half-edges
    const reversedHalfEdges = [];
    for (let i = 0; i < forwardHalfEdges.length; i++) {
      reversedHalfEdges.push(forwardHalfEdges[forwardHalfEdges.length - 1 - i].getReversed());
    }
    for (let i = 0; i < this.loops.length; i++) {
      const loop = this.loops[i];
      for (let j = loop.halfEdges.length - 1; j >= 0; j--) {
        const halfEdge = loop.halfEdges[j];
        if (halfEdge.edge === edge) {
          const replacementHalfEdges = halfEdge === edge.forwardHalf ? forwardHalfEdges : reversedHalfEdges;
          Array.prototype.splice.apply(loop.halfEdges, [j, 1].concat(replacementHalfEdges));
        }
      }
    }
  }

  /**
   * Tries to combine adjacent edges (with a 2-order vertex) into one edge where possible.
   * @private
   *
   * This helps to combine things like collinear lines, where there's a vertex that can basically be removed.
   */
  collapseAdjacentEdges() {
    let needsLoop = true;
    while (needsLoop) {
      needsLoop = false;
      for (let i = 0; i < this.vertices.length; i++) {
        const vertex = this.vertices[i];
        if (vertex.incidentHalfEdges.length === 2) {
          const aEdge = vertex.incidentHalfEdges[0].edge;
          const bEdge = vertex.incidentHalfEdges[1].edge;
          let aSegment = aEdge.segment;
          let bSegment = bEdge.segment;
          const aVertex = aEdge.getOtherVertex(vertex);
          const bVertex = bEdge.getOtherVertex(vertex);
          assert && assert(this.loops.length === 0);

          // TODO: Can we avoid this in the inner loop?
          if (aEdge.startVertex === vertex) {
            aSegment = aSegment.reversed();
          }
          if (bEdge.endVertex === vertex) {
            bSegment = bSegment.reversed();
          }
          if (aSegment instanceof Line && bSegment instanceof Line) {
            // See if the lines are collinear, so that we can combine them into one edge
            if (aSegment.tangentAt(0).normalized().distance(bSegment.tangentAt(0).normalized()) < 1e-6) {
              this.removeEdge(aEdge);
              this.removeEdge(bEdge);
              aEdge.dispose();
              bEdge.dispose();
              arrayRemove(this.vertices, vertex);
              vertex.dispose();
              const newSegment = new Line(aVertex.point, bVertex.point);
              this.addEdge(new Edge(newSegment, aVertex, bVertex));
              needsLoop = true;
              break;
            }
          }
        }
      }
    }
  }

  /**
   * Gets rid of overlapping segments by combining overlaps into a shared edge.
   * @private
   */
  eliminateOverlap() {
    // We'll expand bounds by this amount, so that "adjacent" bounds (with a potentially overlapping vertical or
    // horizontal line) will have a non-zero amount of area overlapping.
    const epsilon = 1e-4;

    // Our queue will store entries of { start: boolean, edge: Edge }, representing a sweep line similar to the
    // Bentley-Ottmann approach. We'll track which edges are passing through the sweep line.
    const queue = new window.FlatQueue();

    // Tracks which edges are through the sweep line, but in a graph structure like a segment/interval tree, so that we
    // can have fast lookup (what edges are in a certain range) and also fast inserts/removals.
    const segmentTree = new EdgeSegmentTree(epsilon);

    // Assorted operations use a shortcut to "tag" edges with a unique ID, to indicate it has already been processed
    // for this call of eliminateOverlap(). This is a higher-performance option to storing an array of "already
    // processed" edges.
    const nextId = globalId++;

    // Adds an edge to the queue
    const addToQueue = edge => {
      const bounds = edge.segment.bounds;

      // TODO: see if object allocations are slow here
      queue.push({
        start: true,
        edge: edge
      }, bounds.minY - epsilon);
      queue.push({
        start: false,
        edge: edge
      }, bounds.maxY + epsilon);
    };

    // Removes an edge from the queue (effectively... when we pop from the queue, we'll check its ID data, and if it was
    // "removed" we will ignore it. Higher-performance than using an array.
    const removeFromQueue = edge => {
      // Store the ID so we can have a high-performance removal
      edge.internalData.removedId = nextId;
    };
    for (let i = 0; i < this.edges.length; i++) {
      addToQueue(this.edges[i]);
    }

    // We track edges to dispose separately, instead of synchronously disposing them. This is mainly due to the trick of
    // removal IDs, since if we re-used pooled Edges when creating, they would still have the ID OR they would lose the
    // "removed" information.
    const edgesToDispose = [];
    while (queue.length) {
      const entry = queue.pop();
      const edge = entry.edge;

      // Skip edges we already removed
      if (edge.internalData.removedId === nextId) {
        continue;
      }
      if (entry.start) {
        // We'll bail out of the loop if we find overlaps, and we'll store the relevant information in these
        let found = false;
        let overlappedEdge;
        let addedEdges;

        // TODO: Is this closure killing performance?
        segmentTree.query(edge, otherEdge => {
          const overlaps = edge.segment.getOverlaps(otherEdge.segment);
          if (overlaps !== null && overlaps.length) {
            for (let k = 0; k < overlaps.length; k++) {
              const overlap = overlaps[k];
              if (Math.abs(overlap.t1 - overlap.t0) > 1e-5 && Math.abs(overlap.qt1 - overlap.qt0) > 1e-5) {
                addedEdges = this.splitOverlap(edge, otherEdge, overlap);
                found = true;
                overlappedEdge = otherEdge;
                return true;
              }
            }
          }
          return false;
        });
        if (found) {
          // We haven't added our edge yet, so no need to remove it.
          segmentTree.removeItem(overlappedEdge);

          // Adjust the queue
          removeFromQueue(overlappedEdge);
          removeFromQueue(edge);
          for (let i = 0; i < addedEdges.length; i++) {
            addToQueue(addedEdges[i]);
          }
          edgesToDispose.push(edge);
          edgesToDispose.push(overlappedEdge);
        } else {
          // No overlaps found, add it and continue
          segmentTree.addItem(edge);
        }
      } else {
        // Removal can't trigger an intersection, so we can safely remove it
        segmentTree.removeItem(edge);
      }
    }
    for (let i = 0; i < edgesToDispose.length; i++) {
      edgesToDispose[i].dispose();
    }
  }

  /**
   * Splits/combines edges when there is an overlap of two edges (two edges who have an infinite number of
   * intersection points).
   * @private
   *
   * NOTE: This does NOT dispose aEdge/bEdge, due to eliminateOverlap's needs.
   *
   * Generally this creates an edge for the "shared" part of both segments, and then creates edges for the parts
   * outside of the shared region, connecting them together.
   *
   * @param {Edge} aEdge
   * @param {Edge} bEdge
   * @param {Overlap} overlap
   * @returns {Array.<Edge>}
   */
  splitOverlap(aEdge, bEdge, overlap) {
    const newEdges = [];
    const aSegment = aEdge.segment;
    const bSegment = bEdge.segment;

    // Remove the edges from before
    this.removeEdge(aEdge);
    this.removeEdge(bEdge);
    let t0 = overlap.t0;
    let t1 = overlap.t1;
    let qt0 = overlap.qt0;
    let qt1 = overlap.qt1;

    // Apply rounding so we don't generate really small segments on the ends
    if (t0 < 1e-5) {
      t0 = 0;
    }
    if (t1 > 1 - 1e-5) {
      t1 = 1;
    }
    if (qt0 < 1e-5) {
      qt0 = 0;
    }
    if (qt1 > 1 - 1e-5) {
      qt1 = 1;
    }

    // Whether there will be remaining edges on each side.
    const aBefore = t0 > 0 ? aSegment.subdivided(t0)[0] : null;
    const bBefore = qt0 > 0 ? bSegment.subdivided(qt0)[0] : null;
    const aAfter = t1 < 1 ? aSegment.subdivided(t1)[1] : null;
    const bAfter = qt1 < 1 ? bSegment.subdivided(qt1)[1] : null;
    let middle = aSegment;
    if (t0 > 0) {
      middle = middle.subdivided(t0)[1];
    }
    if (t1 < 1) {
      middle = middle.subdivided(Utils.linear(t0, 1, 0, 1, t1))[0];
    }
    let beforeVertex;
    if (aBefore && bBefore) {
      beforeVertex = Vertex.pool.create(middle.start);
      this.vertices.push(beforeVertex);
    } else if (aBefore) {
      beforeVertex = overlap.a > 0 ? bEdge.startVertex : bEdge.endVertex;
    } else {
      beforeVertex = aEdge.startVertex;
    }
    let afterVertex;
    if (aAfter && bAfter) {
      afterVertex = Vertex.pool.create(middle.end);
      this.vertices.push(afterVertex);
    } else if (aAfter) {
      afterVertex = overlap.a > 0 ? bEdge.endVertex : bEdge.startVertex;
    } else {
      afterVertex = aEdge.endVertex;
    }
    const middleEdge = Edge.pool.create(middle, beforeVertex, afterVertex);
    newEdges.push(middleEdge);
    let aBeforeEdge;
    let aAfterEdge;
    let bBeforeEdge;
    let bAfterEdge;

    // Add "leftover" edges
    if (aBefore) {
      aBeforeEdge = Edge.pool.create(aBefore, aEdge.startVertex, beforeVertex);
      newEdges.push(aBeforeEdge);
    }
    if (aAfter) {
      aAfterEdge = Edge.pool.create(aAfter, afterVertex, aEdge.endVertex);
      newEdges.push(aAfterEdge);
    }
    if (bBefore) {
      bBeforeEdge = Edge.pool.create(bBefore, bEdge.startVertex, overlap.a > 0 ? beforeVertex : afterVertex);
      newEdges.push(bBeforeEdge);
    }
    if (bAfter) {
      bAfterEdge = Edge.pool.create(bAfter, overlap.a > 0 ? afterVertex : beforeVertex, bEdge.endVertex);
      newEdges.push(bAfterEdge);
    }
    for (let i = 0; i < newEdges.length; i++) {
      this.addEdge(newEdges[i]);
    }

    // Collect "replacement" edges
    const aEdges = (aBefore ? [aBeforeEdge] : []).concat([middleEdge]).concat(aAfter ? [aAfterEdge] : []);
    const bEdges = (bBefore ? [bBeforeEdge] : []).concat([middleEdge]).concat(bAfter ? [bAfterEdge] : []);
    const aForwardHalfEdges = [];
    const bForwardHalfEdges = [];
    for (let i = 0; i < aEdges.length; i++) {
      aForwardHalfEdges.push(aEdges[i].forwardHalf);
    }
    for (let i = 0; i < bEdges.length; i++) {
      // Handle reversing the "middle" edge
      const isForward = bEdges[i] !== middleEdge || overlap.a > 0;
      bForwardHalfEdges.push(isForward ? bEdges[i].forwardHalf : bEdges[i].reversedHalf);
    }

    // Replace edges in the loops
    this.replaceEdgeInLoops(aEdge, aForwardHalfEdges);
    this.replaceEdgeInLoops(bEdge, bForwardHalfEdges);
    return newEdges;
  }

  /**
   * Handles splitting of self-intersection of segments (happens with Cubics).
   * @private
   */
  eliminateSelfIntersection() {
    assert && assert(this.boundaries.length === 0, 'Only handles simpler level primitive splitting right now');
    for (let i = this.edges.length - 1; i >= 0; i--) {
      const edge = this.edges[i];
      const segment = edge.segment;
      if (segment instanceof Cubic) {
        // TODO: This might not properly handle when it only one endpoint is on the curve
        const selfIntersection = segment.getSelfIntersection();
        if (selfIntersection) {
          assert && assert(selfIntersection.aT < selfIntersection.bT);
          const segments = segment.subdivisions([selfIntersection.aT, selfIntersection.bT]);
          const vertex = Vertex.pool.create(selfIntersection.point);
          this.vertices.push(vertex);
          const startEdge = Edge.pool.create(segments[0], edge.startVertex, vertex);
          const middleEdge = Edge.pool.create(segments[1], vertex, vertex);
          const endEdge = Edge.pool.create(segments[2], vertex, edge.endVertex);
          this.removeEdge(edge);
          this.addEdge(startEdge);
          this.addEdge(middleEdge);
          this.addEdge(endEdge);
          this.replaceEdgeInLoops(edge, [startEdge.forwardHalf, middleEdge.forwardHalf, endEdge.forwardHalf]);
          edge.dispose();
        }
      }
    }
  }

  /**
   * Replace intersections between different segments by splitting them and creating a vertex.
   * @private
   */
  eliminateIntersection() {
    // We'll expand bounds by this amount, so that "adjacent" bounds (with a potentially overlapping vertical or
    // horizontal line) will have a non-zero amount of area overlapping.
    const epsilon = 1e-4;

    // Our queue will store entries of { start: boolean, edge: Edge }, representing a sweep line similar to the
    // Bentley-Ottmann approach. We'll track which edges are passing through the sweep line.
    const queue = new window.FlatQueue();

    // Tracks which edges are through the sweep line, but in a graph structure like a segment/interval tree, so that we
    // can have fast lookup (what edges are in a certain range) and also fast inserts/removals.
    const segmentTree = new EdgeSegmentTree(epsilon);

    // Assorted operations use a shortcut to "tag" edges with a unique ID, to indicate it has already been processed
    // for this call of eliminateOverlap(). This is a higher-performance option to storing an array of "already
    // processed" edges.
    const nextId = globalId++;

    // Adds an edge to the queue
    const addToQueue = edge => {
      const bounds = edge.segment.bounds;

      // TODO: see if object allocations are slow here
      queue.push({
        start: true,
        edge: edge
      }, bounds.minY - epsilon);
      queue.push({
        start: false,
        edge: edge
      }, bounds.maxY + epsilon);
    };

    // Removes an edge from the queue (effectively... when we pop from the queue, we'll check its ID data, and if it was
    // "removed" we will ignore it. Higher-performance than using an array.
    const removeFromQueue = edge => {
      // Store the ID so we can have a high-performance removal
      edge.internalData.removedId = nextId;
    };
    for (let i = 0; i < this.edges.length; i++) {
      addToQueue(this.edges[i]);
    }

    // We track edges to dispose separately, instead of synchronously disposing them. This is mainly due to the trick of
    // removal IDs, since if we re-used pooled Edges when creating, they would still have the ID OR they would lose the
    // "removed" information.
    const edgesToDispose = [];
    while (queue.length) {
      const entry = queue.pop();
      const edge = entry.edge;

      // Skip edges we already removed
      if (edge.internalData.removedId === nextId) {
        continue;
      }
      if (entry.start) {
        // We'll bail out of the loop if we find overlaps, and we'll store the relevant information in these
        let found = false;
        let overlappedEdge;
        let addedEdges;
        let removedEdges;

        // TODO: Is this closure killing performance?
        segmentTree.query(edge, otherEdge => {
          const aSegment = edge.segment;
          const bSegment = otherEdge.segment;
          let intersections = Segment.intersect(aSegment, bSegment);
          intersections = intersections.filter(intersection => {
            const aT = intersection.aT;
            const bT = intersection.bT;
            const aInternal = aT > 1e-5 && aT < 1 - 1e-5;
            const bInternal = bT > 1e-5 && bT < 1 - 1e-5;
            return aInternal || bInternal;
          });
          if (intersections.length) {
            // TODO: In the future, handle multiple intersections (instead of re-running)
            const intersection = intersections[0];
            const result = this.simpleSplit(edge, otherEdge, intersection.aT, intersection.bT, intersection.point);
            if (result) {
              found = true;
              overlappedEdge = otherEdge;
              addedEdges = result.addedEdges;
              removedEdges = result.removedEdges;
              return true;
            }
          }
          return false;
        });
        if (found) {
          // If we didn't "remove" that edge, we'll still need to add it in.
          if (removedEdges.includes(edge)) {
            removeFromQueue(edge);
            edgesToDispose.push(edge);
          } else {
            segmentTree.addItem(edge);
          }
          if (removedEdges.includes(overlappedEdge)) {
            segmentTree.removeItem(overlappedEdge);
            removeFromQueue(overlappedEdge);
            edgesToDispose.push(overlappedEdge);
          }

          // Adjust the queue
          for (let i = 0; i < addedEdges.length; i++) {
            addToQueue(addedEdges[i]);
          }
        } else {
          // No overlaps found, add it and continue
          segmentTree.addItem(edge);
        }
      } else {
        // Removal can't trigger an intersection, so we can safely remove it
        segmentTree.removeItem(edge);
      }
    }
    for (let i = 0; i < edgesToDispose.length; i++) {
      edgesToDispose[i].dispose();
    }
  }

  /**
   * Handles splitting two intersecting edges.
   * @private
   *
   * @param {Edge} aEdge
   * @param {Edge} bEdge
   * @param {number} aT - Parametric t value of the intersection for aEdge
   * @param {number} bT - Parametric t value of the intersection for bEdge
   * @param {Vector2} point - Location of the intersection
   *
   * @returns {{addedEdges: Edge[], removedEdges: Edge[]}|null}
   */
  simpleSplit(aEdge, bEdge, aT, bT, point) {
    const aInternal = aT > 1e-6 && aT < 1 - 1e-6;
    const bInternal = bT > 1e-6 && bT < 1 - 1e-6;
    let vertex = null;
    if (!aInternal) {
      vertex = aT < 0.5 ? aEdge.startVertex : aEdge.endVertex;
    } else if (!bInternal) {
      vertex = bT < 0.5 ? bEdge.startVertex : bEdge.endVertex;
    } else {
      vertex = Vertex.pool.create(point);
      this.vertices.push(vertex);
    }
    let changed = false;
    const addedEdges = [];
    const removedEdges = [];
    if (aInternal && vertex !== aEdge.startVertex && vertex !== aEdge.endVertex) {
      addedEdges.push(...this.splitEdge(aEdge, aT, vertex));
      removedEdges.push(aEdge);
      changed = true;
    }
    if (bInternal && vertex !== bEdge.startVertex && vertex !== bEdge.endVertex) {
      addedEdges.push(...this.splitEdge(bEdge, bT, vertex));
      removedEdges.push(bEdge);
      changed = true;
    }
    return changed ? {
      addedEdges: addedEdges,
      removedEdges: removedEdges
    } : null;
  }

  /**
   * Splits an edge into two edges at a specific parametric t value.
   * @private
   *
   * @param {Edge} edge
   * @param {number} t
   * @param {Vertex} vertex - The vertex that is placed at the split location
   */
  splitEdge(edge, t, vertex) {
    assert && assert(this.boundaries.length === 0, 'Only handles simpler level primitive splitting right now');
    assert && assert(edge.startVertex !== vertex);
    assert && assert(edge.endVertex !== vertex);
    const segments = edge.segment.subdivided(t);
    assert && assert(segments.length === 2);
    const firstEdge = Edge.pool.create(segments[0], edge.startVertex, vertex);
    const secondEdge = Edge.pool.create(segments[1], vertex, edge.endVertex);

    // Remove old connections
    this.removeEdge(edge);

    // Add new connections
    this.addEdge(firstEdge);
    this.addEdge(secondEdge);
    this.replaceEdgeInLoops(edge, [firstEdge.forwardHalf, secondEdge.forwardHalf]);
    return [firstEdge, secondEdge];
  }

  /**
   * Combine vertices that are almost exactly in the same place (removing edges and vertices where necessary).
   * @private
   */
  collapseVertices() {
    assert && assert(_.every(this.edges, edge => _.includes(this.vertices, edge.startVertex)));
    assert && assert(_.every(this.edges, edge => _.includes(this.vertices, edge.endVertex)));

    // We'll expand bounds by this amount, so that "adjacent" bounds (with a potentially overlapping vertical or
    // horizontal line) will have a non-zero amount of area overlapping.
    const epsilon = 1e-4;

    // Our queue will store entries of { start: boolean, vertex: Vertex }, representing a sweep line similar to the
    // Bentley-Ottmann approach. We'll track which edges are passing through the sweep line.
    const queue = new window.FlatQueue();

    // Tracks which vertices are through the sweep line, but in a graph structure like a segment/interval tree, so that
    // we can have fast lookup (what vertices are in a certain range) and also fast inserts/removals.
    const segmentTree = new VertexSegmentTree(epsilon);

    // Assorted operations use a shortcut to "tag" vertices with a unique ID, to indicate it has already been processed
    // for this call of eliminateOverlap(). This is a higher-performance option to storing an array of "already
    // processed" edges.
    const nextId = globalId++;

    // Adds an vertex to the queue
    const addToQueue = vertex => {
      // TODO: see if object allocations are slow here
      queue.push({
        start: true,
        vertex: vertex
      }, vertex.point.y - epsilon);
      queue.push({
        start: false,
        vertex: vertex
      }, vertex.point.y + epsilon);
    };

    // Removes a vertex from the queue (effectively... when we pop from the queue, we'll check its ID data, and if it
    // was "removed" we will ignore it. Higher-performance than using an array.
    const removeFromQueue = vertex => {
      // Store the ID so we can have a high-performance removal
      vertex.internalData.removedId = nextId;
    };
    for (let i = 0; i < this.vertices.length; i++) {
      addToQueue(this.vertices[i]);
    }

    // We track vertices to dispose separately, instead of synchronously disposing them. This is mainly due to the trick
    // of removal IDs, since if we re-used pooled Vertices when creating, they would still have the ID OR they would
    // lose the "removed" information.
    const verticesToDispose = [];
    while (queue.length) {
      const entry = queue.pop();
      const vertex = entry.vertex;

      // Skip vertices we already removed
      if (vertex.internalData.removedId === nextId) {
        continue;
      }
      if (entry.start) {
        // We'll bail out of the loop if we find overlaps, and we'll store the relevant information in these
        let found = false;
        let overlappedVertex;
        let addedVertices;

        // TODO: Is this closure killing performance?
        segmentTree.query(vertex, otherVertex => {
          const distance = vertex.point.distance(otherVertex.point);
          if (distance < 1e-5) {
            const newVertex = Vertex.pool.create(distance === 0 ? vertex.point : vertex.point.average(otherVertex.point));
            this.vertices.push(newVertex);
            arrayRemove(this.vertices, vertex);
            arrayRemove(this.vertices, otherVertex);
            for (let k = this.edges.length - 1; k >= 0; k--) {
              const edge = this.edges[k];
              const startMatches = edge.startVertex === vertex || edge.startVertex === otherVertex;
              const endMatches = edge.endVertex === vertex || edge.endVertex === otherVertex;

              // Outright remove edges that were between A and B that aren't loops
              if (startMatches && endMatches) {
                if ((edge.segment.bounds.width > 1e-5 || edge.segment.bounds.height > 1e-5) && (edge.segment instanceof Cubic || edge.segment instanceof Arc || edge.segment instanceof EllipticalArc)) {
                  // Replace it with a new edge that is from the vertex to itself
                  const replacementEdge = Edge.pool.create(edge.segment, newVertex, newVertex);
                  this.addEdge(replacementEdge);
                  this.replaceEdgeInLoops(edge, [replacementEdge.forwardHalf]);
                } else {
                  this.replaceEdgeInLoops(edge, []); // remove the edge from loops with no replacement
                }

                this.removeEdge(edge);
                edge.dispose();
              } else if (startMatches) {
                edge.startVertex = newVertex;
                newVertex.incidentHalfEdges.push(edge.reversedHalf);
                edge.updateReferences();
              } else if (endMatches) {
                edge.endVertex = newVertex;
                newVertex.incidentHalfEdges.push(edge.forwardHalf);
                edge.updateReferences();
              }
            }
            addedVertices = [newVertex];
            found = true;
            overlappedVertex = otherVertex;
            return true;
          }
          return false;
        });
        if (found) {
          // We haven't added our edge yet, so no need to remove it.
          segmentTree.removeItem(overlappedVertex);

          // Adjust the queue
          removeFromQueue(overlappedVertex);
          removeFromQueue(vertex);
          for (let i = 0; i < addedVertices.length; i++) {
            addToQueue(addedVertices[i]);
          }
          verticesToDispose.push(vertex);
          verticesToDispose.push(overlappedVertex);
        } else {
          // No overlaps found, add it and continue
          segmentTree.addItem(vertex);
        }
      } else {
        // Removal can't trigger an intersection, so we can safely remove it
        segmentTree.removeItem(vertex);
      }
    }
    for (let i = 0; i < verticesToDispose.length; i++) {
      verticesToDispose[i].dispose();
    }
    assert && assert(_.every(this.edges, edge => _.includes(this.vertices, edge.startVertex)));
    assert && assert(_.every(this.edges, edge => _.includes(this.vertices, edge.endVertex)));
  }

  /**
   * Scan a given vertex for bridges recursively with a depth-first search.
   * @private
   *
   * Records visit times to each vertex, and back-propagates so that we can efficiently determine if there was another
   * path around to the vertex.
   *
   * Assumes this is only called one time once all edges/vertices are set up. Repeated calls will fail because we
   * don't mark visited/etc. references again on startup
   *
   * See Tarjan's algorithm for more information. Some modifications were needed, since this is technically a
   * multigraph/pseudograph (can have edges that have the same start/end vertex, and can have multiple edges
   * going from the same two vertices).
   *
   * @param {Array.<Edge>} bridges - Appends bridge edges to here.
   * @param {Vertex} vertex
   */
  markBridges(bridges, vertex) {
    vertex.visited = true;
    vertex.visitIndex = vertex.lowIndex = bridgeId++;
    for (let i = 0; i < vertex.incidentHalfEdges.length; i++) {
      const edge = vertex.incidentHalfEdges[i].edge;
      const childVertex = vertex.incidentHalfEdges[i].startVertex; // by definition, our vertex should be the endVertex
      if (!childVertex.visited) {
        edge.visited = true;
        childVertex.parent = vertex;
        this.markBridges(bridges, childVertex);

        // Check if there's another route that reaches back to our vertex from an ancestor
        vertex.lowIndex = Math.min(vertex.lowIndex, childVertex.lowIndex);

        // If there was no route, then we reached a bridge
        if (childVertex.lowIndex > vertex.visitIndex) {
          bridges.push(edge);
        }
      } else if (!edge.visited) {
        vertex.lowIndex = Math.min(vertex.lowIndex, childVertex.visitIndex);
      }
    }
  }

  /**
   * Removes edges that are the only edge holding two connected components together. Based on our problem, the
   * face on either side of the "bridge" edges would always be the same, so we can safely remove them.
   * @private
   */
  removeBridges() {
    const bridges = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      if (!vertex.visited) {
        this.markBridges(bridges, vertex);
      }
    }
    for (let i = 0; i < bridges.length; i++) {
      const bridgeEdge = bridges[i];
      this.removeEdge(bridgeEdge);
      this.replaceEdgeInLoops(bridgeEdge, []);
      bridgeEdge.dispose();
    }
  }

  /**
   * Removes vertices that have order less than 2 (so either a vertex with one or zero edges adjacent).
   * @private
   */
  removeLowOrderVertices() {
    assert && assert(_.every(this.edges, edge => _.includes(this.vertices, edge.startVertex)));
    assert && assert(_.every(this.edges, edge => _.includes(this.vertices, edge.endVertex)));
    let needsLoop = true;
    while (needsLoop) {
      needsLoop = false;
      for (let i = this.vertices.length - 1; i >= 0; i--) {
        const vertex = this.vertices[i];
        if (vertex.incidentHalfEdges.length < 2) {
          // Disconnect any existing edges
          for (let j = 0; j < vertex.incidentHalfEdges.length; j++) {
            const edge = vertex.incidentHalfEdges[j].edge;
            this.removeEdge(edge);
            this.replaceEdgeInLoops(edge, []); // remove the edge from the loops
            edge.dispose();
          }

          // Remove the vertex
          this.vertices.splice(i, 1);
          vertex.dispose();
          needsLoop = true;
          break;
        }
      }
    }
    assert && assert(_.every(this.edges, edge => _.includes(this.vertices, edge.startVertex)));
    assert && assert(_.every(this.edges, edge => _.includes(this.vertices, edge.endVertex)));
  }

  /**
   * Sorts incident half-edges for each vertex.
   * @private
   */
  orderVertexEdges() {
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].sortEdges();
    }
  }

  /**
   * Creates boundaries and faces by following each half-edge counter-clockwise
   * @private
   */
  extractFaces() {
    const halfEdges = [];
    for (let i = 0; i < this.edges.length; i++) {
      halfEdges.push(this.edges[i].forwardHalf);
      halfEdges.push(this.edges[i].reversedHalf);
    }
    while (halfEdges.length) {
      const boundaryHalfEdges = [];
      let halfEdge = halfEdges[0];
      const startingHalfEdge = halfEdge;
      while (halfEdge) {
        arrayRemove(halfEdges, halfEdge);
        boundaryHalfEdges.push(halfEdge);
        halfEdge = halfEdge.getNext();
        if (halfEdge === startingHalfEdge) {
          break;
        }
      }
      const boundary = Boundary.pool.create(boundaryHalfEdges);
      (boundary.signedArea > 0 ? this.innerBoundaries : this.outerBoundaries).push(boundary);
      this.boundaries.push(boundary);
    }
    for (let i = 0; i < this.innerBoundaries.length; i++) {
      this.faces.push(Face.pool.create(this.innerBoundaries[i]));
    }
  }

  /**
   * Given the inner and outer boundaries, it computes a tree representation to determine what boundaries are
   * holes of what other boundaries, then sets up face holes with the result.
   * @public
   *
   * This information is stored in the childBoundaries array of Boundary, and is then read out to set up faces.
   */
  computeBoundaryTree() {
    // TODO: detect "indeterminate" for robustness (and try new angles?)
    const unboundedHoles = []; // {Array.<Boundary>}

    // We'll want to compute a ray for each outer boundary that starts at an extreme point for that direction and
    // continues outwards. The next boundary it intersects will be linked together in the tree.
    // We have a mostly-arbitrary angle here that hopefully won't be used.
    const transform = new Transform3(Matrix3.rotation2(1.5729657));
    for (let i = 0; i < this.outerBoundaries.length; i++) {
      const outerBoundary = this.outerBoundaries[i];
      const ray = outerBoundary.computeExtremeRay(transform);
      let closestEdge = null;
      let closestDistance = Number.POSITIVE_INFINITY;
      let closestWind = false;
      for (let j = 0; j < this.edges.length; j++) {
        const edge = this.edges[j];
        const intersections = edge.segment.intersection(ray);
        for (let k = 0; k < intersections.length; k++) {
          const intersection = intersections[k];
          if (intersection.distance < closestDistance) {
            closestEdge = edge;
            closestDistance = intersection.distance;
            closestWind = intersection.wind;
          }
        }
      }
      if (closestEdge === null) {
        unboundedHoles.push(outerBoundary);
      } else {
        const reversed = closestWind < 0;
        const closestHalfEdge = reversed ? closestEdge.reversedHalf : closestEdge.forwardHalf;
        const closestBoundary = this.getBoundaryOfHalfEdge(closestHalfEdge);
        closestBoundary.childBoundaries.push(outerBoundary);
      }
    }
    unboundedHoles.forEach(this.unboundedFace.recursivelyAddHoles.bind(this.unboundedFace));
    for (let i = 0; i < this.faces.length; i++) {
      const face = this.faces[i];
      if (face.boundary !== null) {
        face.boundary.childBoundaries.forEach(face.recursivelyAddHoles.bind(face));
      }
    }
  }

  /**
   * Computes the winding map for each face, starting with 0 on the unbounded face (for each shapeId).
   * @private
   */
  computeWindingMap() {
    const edges = this.edges.slice();

    // Winding numbers for "outside" are 0.
    const outsideMap = {};
    for (let i = 0; i < this.shapeIds.length; i++) {
      outsideMap[this.shapeIds[i]] = 0;
    }
    this.unboundedFace.windingMap = outsideMap;

    // We have "solved" the unbounded face, and then iteratively go over the edges looking for a case where we have
    // solved one of the faces that is adjacent to that edge. We can then compute the difference between winding
    // numbers between the two faces, and thus determine the (absolute) winding numbers for the unsolved face.
    while (edges.length) {
      for (let j = edges.length - 1; j >= 0; j--) {
        const edge = edges[j];
        const forwardHalf = edge.forwardHalf;
        const reversedHalf = edge.reversedHalf;
        const forwardFace = forwardHalf.face;
        const reversedFace = reversedHalf.face;
        assert && assert(forwardFace !== reversedFace);
        const solvedForward = forwardFace.windingMap !== null;
        const solvedReversed = reversedFace.windingMap !== null;
        if (solvedForward && solvedReversed) {
          edges.splice(j, 1);
          if (assert) {
            for (let m = 0; m < this.shapeIds.length; m++) {
              const id = this.shapeIds[m];
              assert(forwardFace.windingMap[id] - reversedFace.windingMap[id] === this.computeDifferential(edge, id));
            }
          }
        } else if (!solvedForward && !solvedReversed) {
          continue;
        } else {
          const solvedFace = solvedForward ? forwardFace : reversedFace;
          const unsolvedFace = solvedForward ? reversedFace : forwardFace;
          const windingMap = {};
          for (let k = 0; k < this.shapeIds.length; k++) {
            const shapeId = this.shapeIds[k];
            const differential = this.computeDifferential(edge, shapeId);
            windingMap[shapeId] = solvedFace.windingMap[shapeId] + differential * (solvedForward ? -1 : 1);
          }
          unsolvedFace.windingMap = windingMap;
        }
      }
    }
  }

  /**
   * Computes the differential in winding numbers (forward face winding number minus the reversed face winding number)
   * ("forward face" is the face on the forward half-edge side, etc.)
   * @private
   *
   * @param {Edge} edge
   * @param {number} shapeId
   * @returns {number} - The difference between forward face and reversed face winding numbers.
   */
  computeDifferential(edge, shapeId) {
    let differential = 0; // forward face - reversed face
    for (let m = 0; m < this.loops.length; m++) {
      const loop = this.loops[m];
      assert && assert(loop.closed, 'This is only defined to work for closed loops');
      if (loop.shapeId !== shapeId) {
        continue;
      }
      for (let n = 0; n < loop.halfEdges.length; n++) {
        const loopHalfEdge = loop.halfEdges[n];
        if (loopHalfEdge === edge.forwardHalf) {
          differential++;
        } else if (loopHalfEdge === edge.reversedHalf) {
          differential--;
        }
      }
    }
    return differential;
  }

  /**
   * Sets the unbounded face as unfilled, and then sets each face's fill so that edges separate one filled face with
   * one unfilled face.
   * @private
   *
   * NOTE: Best to call this on the result from createFilledSubGraph(), since it should have guaranteed properties
   *       to make this consistent. Notably, all vertices need to have an even order (number of edges)
   */
  fillAlternatingFaces() {
    let nullFaceFilledCount = 0;
    for (let i = 0; i < this.faces.length; i++) {
      this.faces[i].filled = null;
      nullFaceFilledCount++;
    }
    this.unboundedFace.filled = false;
    nullFaceFilledCount--;
    while (nullFaceFilledCount) {
      for (let i = 0; i < this.edges.length; i++) {
        const edge = this.edges[i];
        const forwardFace = edge.forwardHalf.face;
        const reversedFace = edge.reversedHalf.face;
        const forwardNull = forwardFace.filled === null;
        const reversedNull = reversedFace.filled === null;
        if (forwardNull && !reversedNull) {
          forwardFace.filled = !reversedFace.filled;
          nullFaceFilledCount--;
        } else if (!forwardNull && reversedNull) {
          reversedFace.filled = !forwardFace.filled;
          nullFaceFilledCount--;
        }
      }
    }
  }

  /**
   * Returns the boundary that contains the specified half-edge.
   * @private
   *
   * TODO: find a better way, this is crazy inefficient
   *
   * @param {HalfEdge} halfEdge
   * @returns {Boundary}
   */
  getBoundaryOfHalfEdge(halfEdge) {
    for (let i = 0; i < this.boundaries.length; i++) {
      const boundary = this.boundaries[i];
      if (boundary.hasHalfEdge(halfEdge)) {
        return boundary;
      }
    }
    throw new Error('Could not find boundary');
  }

  /**
   * "Union" binary winding map filter for use with Graph.binaryResult.
   * @public
   *
   * This combines both shapes together so that a point is in the resulting shape if it was in either of the input
   * shapes.
   *
   * @param {Object} windingMap - See computeFaceInclusion for more details
   * @returns {boolean}
   */
  static BINARY_NONZERO_UNION(windingMap) {
    return windingMap['0'] !== 0 || windingMap['1'] !== 0;
  }

  /**
   * "Intersection" binary winding map filter for use with Graph.binaryResult.
   * @public
   *
   * This combines both shapes together so that a point is in the resulting shape if it was in both of the input
   * shapes.
   *
   * @param {Object} windingMap - See computeFaceInclusion for more details
   * @returns {boolean}
   */
  static BINARY_NONZERO_INTERSECTION(windingMap) {
    return windingMap['0'] !== 0 && windingMap['1'] !== 0;
  }

  /**
   * "Difference" binary winding map filter for use with Graph.binaryResult.
   * @public
   *
   * This combines both shapes together so that a point is in the resulting shape if it was in the first shape AND
   * was NOT in the second shape.
   *
   * @param {Object} windingMap - See computeFaceInclusion for more details
   * @returns {boolean}
   */
  static BINARY_NONZERO_DIFFERENCE(windingMap) {
    return windingMap['0'] !== 0 && windingMap['1'] === 0;
  }

  /**
   * "XOR" binary winding map filter for use with Graph.binaryResult.
   * @public
   *
   * This combines both shapes together so that a point is in the resulting shape if it is only in exactly one of the
   * input shapes. It's like the union minus intersection.
   *
   * @param {Object} windingMap - See computeFaceInclusion for more details
   * @returns {boolean}
   */
  static BINARY_NONZERO_XOR(windingMap) {
    return (windingMap['0'] !== 0 ^ windingMap['1'] !== 0) === 1; // eslint-disable-line no-bitwise
  }

  /**
   * Returns the resulting Shape obtained by combining the two shapes given with the filter.
   * @public
   *
   * @param {Shape} shapeA
   * @param {Shape} shapeB
   * @param {function} windingMapFilter - See computeFaceInclusion for details on the format
   * @returns {Shape}
   */
  static binaryResult(shapeA, shapeB, windingMapFilter) {
    const graph = new Graph();
    graph.addShape(0, shapeA);
    graph.addShape(1, shapeB);
    graph.computeSimplifiedFaces();
    graph.computeFaceInclusion(windingMapFilter);
    const subgraph = graph.createFilledSubGraph();
    const shape = subgraph.facesToShape();
    graph.dispose();
    subgraph.dispose();
    return shape;
  }

  /**
   * Returns the union of an array of shapes.
   * @public
   *
   * @param {Array.<Shape>} shapes
   * @returns {Shape}
   */
  static unionNonZero(shapes) {
    const graph = new Graph();
    for (let i = 0; i < shapes.length; i++) {
      graph.addShape(i, shapes[i]);
    }
    graph.computeSimplifiedFaces();
    graph.computeFaceInclusion(windingMap => {
      for (let j = 0; j < shapes.length; j++) {
        if (windingMap[j] !== 0) {
          return true;
        }
      }
      return false;
    });
    const subgraph = graph.createFilledSubGraph();
    const shape = subgraph.facesToShape();
    graph.dispose();
    subgraph.dispose();
    return shape;
  }

  /**
   * Returns the intersection of an array of shapes.
   * @public
   *
   * @param {Array.<Shape>} shapes
   * @returns {Shape}
   */
  static intersectionNonZero(shapes) {
    const graph = new Graph();
    for (let i = 0; i < shapes.length; i++) {
      graph.addShape(i, shapes[i]);
    }
    graph.computeSimplifiedFaces();
    graph.computeFaceInclusion(windingMap => {
      for (let j = 0; j < shapes.length; j++) {
        if (windingMap[j] === 0) {
          return false;
        }
      }
      return true;
    });
    const subgraph = graph.createFilledSubGraph();
    const shape = subgraph.facesToShape();
    graph.dispose();
    subgraph.dispose();
    return shape;
  }

  /**
   * Returns the xor of an array of shapes.
   * @public
   *
   * TODO: reduce code duplication?
   *
   * @param {Array.<Shape>} shapes
   * @returns {Shape}
   */
  static xorNonZero(shapes) {
    const graph = new Graph();
    for (let i = 0; i < shapes.length; i++) {
      graph.addShape(i, shapes[i]);
    }
    graph.computeSimplifiedFaces();
    graph.computeFaceInclusion(windingMap => {
      let included = false;
      for (let j = 0; j < shapes.length; j++) {
        if (windingMap[j] !== 0) {
          included = !included;
        }
      }
      return included;
    });
    const subgraph = graph.createFilledSubGraph();
    const shape = subgraph.facesToShape();
    graph.dispose();
    subgraph.dispose();
    return shape;
  }

  /**
   * Returns a simplified Shape obtained from running it through the simplification steps with non-zero output.
   * @public
   *
   * @param {Shape} shape
   * @returns {Shape}
   */
  static simplifyNonZero(shape) {
    const graph = new Graph();
    graph.addShape(0, shape);
    graph.computeSimplifiedFaces();
    graph.computeFaceInclusion(map => map['0'] !== 0);
    const subgraph = graph.createFilledSubGraph();
    const resultShape = subgraph.facesToShape();
    graph.dispose();
    subgraph.dispose();
    return resultShape;
  }

  /**
   * Returns a clipped version of `shape` that contains only the parts that are within the area defined by
   * `clipAreaShape`
   * @public
   *
   * @param {Shape} clipAreaShape
   * @param {Shape} shape
   * @param {Object} [options]
   * @returns {Shape}
   */
  static clipShape(clipAreaShape, shape, options) {
    let i;
    let j;
    let loop;
    const SHAPE_ID = 0;
    const CLIP_SHAPE_ID = 1;
    options = merge({
      // {boolean} - Respectively whether segments should be in the returned shape if they are in the exterior of the
      // clipAreaShape (outside), on the boundary, or in the interior.
      includeExterior: false,
      includeBoundary: true,
      includeInterior: true
    }, options);
    const simplifiedClipAreaShape = Graph.simplifyNonZero(clipAreaShape);
    const graph = new Graph();
    graph.addShape(SHAPE_ID, shape, {
      ensureClosed: false // don't add closing segments, since we'll be recreating subpaths/etc.
    });

    graph.addShape(CLIP_SHAPE_ID, simplifiedClipAreaShape);

    // A subset of simplifications (we want to keep low-order vertices, etc.)
    graph.eliminateOverlap();
    graph.eliminateSelfIntersection();
    graph.eliminateIntersection();
    graph.collapseVertices();

    // Mark clip edges with data=true
    for (i = 0; i < graph.loops.length; i++) {
      loop = graph.loops[i];
      if (loop.shapeId === CLIP_SHAPE_ID) {
        for (j = 0; j < loop.halfEdges.length; j++) {
          loop.halfEdges[j].edge.data = true;
        }
      }
    }
    const subpaths = [];
    for (i = 0; i < graph.loops.length; i++) {
      loop = graph.loops[i];
      if (loop.shapeId === SHAPE_ID) {
        let segments = [];
        for (j = 0; j < loop.halfEdges.length; j++) {
          const halfEdge = loop.halfEdges[j];
          const included = halfEdge.edge.data ? options.includeBoundary : simplifiedClipAreaShape.containsPoint(halfEdge.edge.segment.positionAt(0.5)) ? options.includeInterior : options.includeExterior;
          if (included) {
            segments.push(halfEdge.getDirectionalSegment());
          }
          // If we have an excluded segment in-between included segments, we'll need to split into more subpaths to handle
          // the gap.
          else if (segments.length) {
            subpaths.push(new Subpath(segments, undefined, loop.closed));
            segments = [];
          }
        }
        if (segments.length) {
          subpaths.push(new Subpath(segments, undefined, loop.closed));
        }
      }
    }
    graph.dispose();
    return new kite.Shape(subpaths);
  }
}
kite.register('Graph', Graph);
export default Graph;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlRyYW5zZm9ybTMiLCJVdGlscyIsIlZlY3RvcjIiLCJhcnJheVJlbW92ZSIsImNsZWFuQXJyYXkiLCJtZXJnZSIsIkFyYyIsIkJvdW5kYXJ5IiwiQ3ViaWMiLCJFZGdlIiwiRWRnZVNlZ21lbnRUcmVlIiwiRWxsaXB0aWNhbEFyYyIsIkZhY2UiLCJraXRlIiwiTGluZSIsIkxvb3AiLCJTZWdtZW50IiwiU3VicGF0aCIsIlZlcnRleCIsIlZlcnRleFNlZ21lbnRUcmVlIiwiYnJpZGdlSWQiLCJnbG9iYWxJZCIsIkdyYXBoIiwiY29uc3RydWN0b3IiLCJ2ZXJ0aWNlcyIsImVkZ2VzIiwiaW5uZXJCb3VuZGFyaWVzIiwib3V0ZXJCb3VuZGFyaWVzIiwiYm91bmRhcmllcyIsInNoYXBlSWRzIiwibG9vcHMiLCJ1bmJvdW5kZWRGYWNlIiwicG9vbCIsImNyZWF0ZSIsImZhY2VzIiwic2VyaWFsaXplIiwidHlwZSIsIm1hcCIsInZlcnRleCIsImVkZ2UiLCJib3VuZGFyeSIsImlkIiwibG9vcCIsImZhY2UiLCJkZXNlcmlhbGl6ZSIsIm9iaiIsImdyYXBoIiwidmVydGV4TWFwIiwiZWRnZU1hcCIsImhhbGZFZGdlTWFwIiwiYm91bmRhcnlNYXAiLCJsb29wTWFwIiwiZmFjZU1hcCIsImRhdGEiLCJWZWN0b3IySU8iLCJmcm9tU3RhdGVPYmplY3QiLCJwb2ludCIsInZpc2l0ZWQiLCJ2aXNpdEluZGV4IiwibG93SW5kZXgiLCJzZWdtZW50Iiwic3RhcnRWZXJ0ZXgiLCJlbmRWZXJ0ZXgiLCJzaWduZWRBcmVhRnJhZ21lbnQiLCJkZXNlcmlhbGl6ZUhhbGZFZGdlIiwiaGFsZkVkZ2UiLCJoYWxmRWRnZURhdGEiLCJpc1JldmVyc2VkIiwic29ydFZlY3RvciIsImZvcndhcmRIYWxmIiwicmV2ZXJzZWRIYWxmIiwiZm9yRWFjaCIsImkiLCJpbmNpZGVudEhhbGZFZGdlcyIsImhhbGZFZGdlcyIsInNpZ25lZEFyZWEiLCJib3VuZHMiLCJCb3VuZHMySU8iLCJjaGlsZEJvdW5kYXJpZXMiLCJzaGFwZUlkIiwiY2xvc2VkIiwiaG9sZXMiLCJ3aW5kaW5nTWFwIiwiZmlsbGVkIiwiYWRkU2hhcGUiLCJzaGFwZSIsIm9wdGlvbnMiLCJzdWJwYXRocyIsImxlbmd0aCIsImFkZFN1YnBhdGgiLCJzdWJwYXRoIiwiYXNzZXJ0IiwiZW5zdXJlQ2xvc2VkIiwiaW5kZXhPZiIsInB1c2giLCJzZWdtZW50cyIsImdldEZpbGxTZWdtZW50cyIsImluZGV4IiwicHJldmlvdXNJbmRleCIsImVuZCIsInN0YXJ0IiwiZXF1YWxzIiwiZGlzdGFuY2UiLCJhdmVyYWdlIiwibmV4dEluZGV4IiwiYWRkRWRnZSIsImNvbXB1dGVTaW1wbGlmaWVkRmFjZXMiLCJlbGltaW5hdGVPdmVybGFwIiwiZWxpbWluYXRlU2VsZkludGVyc2VjdGlvbiIsImVsaW1pbmF0ZUludGVyc2VjdGlvbiIsImNvbGxhcHNlVmVydGljZXMiLCJyZW1vdmVCcmlkZ2VzIiwicmVtb3ZlTG93T3JkZXJWZXJ0aWNlcyIsIm9yZGVyVmVydGV4RWRnZXMiLCJleHRyYWN0RmFjZXMiLCJjb21wdXRlQm91bmRhcnlUcmVlIiwiY29tcHV0ZVdpbmRpbmdNYXAiLCJjb21wdXRlRmFjZUluY2x1c2lvbiIsIndpbmRpbmdNYXBGaWx0ZXIiLCJjcmVhdGVGaWxsZWRTdWJHcmFwaCIsIm5ld1N0YXJ0VmVydGV4IiwibmV3RW5kVmVydGV4IiwiY29sbGFwc2VBZGphY2VudEVkZ2VzIiwiZmlsbEFsdGVybmF0aW5nRmFjZXMiLCJmYWNlc1RvU2hhcGUiLCJ0b1N1YnBhdGgiLCJqIiwiU2hhcGUiLCJkaXNwb3NlIiwicG9wIiwiXyIsImluY2x1ZGVzIiwicmVtb3ZlRWRnZSIsInJlcGxhY2VFZGdlSW5Mb29wcyIsImZvcndhcmRIYWxmRWRnZXMiLCJyZXZlcnNlZEhhbGZFZGdlcyIsImdldFJldmVyc2VkIiwicmVwbGFjZW1lbnRIYWxmRWRnZXMiLCJBcnJheSIsInByb3RvdHlwZSIsInNwbGljZSIsImFwcGx5IiwiY29uY2F0IiwibmVlZHNMb29wIiwiYUVkZ2UiLCJiRWRnZSIsImFTZWdtZW50IiwiYlNlZ21lbnQiLCJhVmVydGV4IiwiZ2V0T3RoZXJWZXJ0ZXgiLCJiVmVydGV4IiwicmV2ZXJzZWQiLCJ0YW5nZW50QXQiLCJub3JtYWxpemVkIiwibmV3U2VnbWVudCIsImVwc2lsb24iLCJxdWV1ZSIsIndpbmRvdyIsIkZsYXRRdWV1ZSIsInNlZ21lbnRUcmVlIiwibmV4dElkIiwiYWRkVG9RdWV1ZSIsIm1pblkiLCJtYXhZIiwicmVtb3ZlRnJvbVF1ZXVlIiwiaW50ZXJuYWxEYXRhIiwicmVtb3ZlZElkIiwiZWRnZXNUb0Rpc3Bvc2UiLCJlbnRyeSIsImZvdW5kIiwib3ZlcmxhcHBlZEVkZ2UiLCJhZGRlZEVkZ2VzIiwicXVlcnkiLCJvdGhlckVkZ2UiLCJvdmVybGFwcyIsImdldE92ZXJsYXBzIiwiayIsIm92ZXJsYXAiLCJNYXRoIiwiYWJzIiwidDEiLCJ0MCIsInF0MSIsInF0MCIsInNwbGl0T3ZlcmxhcCIsInJlbW92ZUl0ZW0iLCJhZGRJdGVtIiwibmV3RWRnZXMiLCJhQmVmb3JlIiwic3ViZGl2aWRlZCIsImJCZWZvcmUiLCJhQWZ0ZXIiLCJiQWZ0ZXIiLCJtaWRkbGUiLCJsaW5lYXIiLCJiZWZvcmVWZXJ0ZXgiLCJhIiwiYWZ0ZXJWZXJ0ZXgiLCJtaWRkbGVFZGdlIiwiYUJlZm9yZUVkZ2UiLCJhQWZ0ZXJFZGdlIiwiYkJlZm9yZUVkZ2UiLCJiQWZ0ZXJFZGdlIiwiYUVkZ2VzIiwiYkVkZ2VzIiwiYUZvcndhcmRIYWxmRWRnZXMiLCJiRm9yd2FyZEhhbGZFZGdlcyIsImlzRm9yd2FyZCIsInNlbGZJbnRlcnNlY3Rpb24iLCJnZXRTZWxmSW50ZXJzZWN0aW9uIiwiYVQiLCJiVCIsInN1YmRpdmlzaW9ucyIsInN0YXJ0RWRnZSIsImVuZEVkZ2UiLCJyZW1vdmVkRWRnZXMiLCJpbnRlcnNlY3Rpb25zIiwiaW50ZXJzZWN0IiwiZmlsdGVyIiwiaW50ZXJzZWN0aW9uIiwiYUludGVybmFsIiwiYkludGVybmFsIiwicmVzdWx0Iiwic2ltcGxlU3BsaXQiLCJjaGFuZ2VkIiwic3BsaXRFZGdlIiwidCIsImZpcnN0RWRnZSIsInNlY29uZEVkZ2UiLCJldmVyeSIsInkiLCJ2ZXJ0aWNlc1RvRGlzcG9zZSIsIm92ZXJsYXBwZWRWZXJ0ZXgiLCJhZGRlZFZlcnRpY2VzIiwib3RoZXJWZXJ0ZXgiLCJuZXdWZXJ0ZXgiLCJzdGFydE1hdGNoZXMiLCJlbmRNYXRjaGVzIiwid2lkdGgiLCJoZWlnaHQiLCJyZXBsYWNlbWVudEVkZ2UiLCJ1cGRhdGVSZWZlcmVuY2VzIiwibWFya0JyaWRnZXMiLCJicmlkZ2VzIiwiY2hpbGRWZXJ0ZXgiLCJwYXJlbnQiLCJtaW4iLCJicmlkZ2VFZGdlIiwic29ydEVkZ2VzIiwiYm91bmRhcnlIYWxmRWRnZXMiLCJzdGFydGluZ0hhbGZFZGdlIiwiZ2V0TmV4dCIsInVuYm91bmRlZEhvbGVzIiwidHJhbnNmb3JtIiwicm90YXRpb24yIiwib3V0ZXJCb3VuZGFyeSIsInJheSIsImNvbXB1dGVFeHRyZW1lUmF5IiwiY2xvc2VzdEVkZ2UiLCJjbG9zZXN0RGlzdGFuY2UiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImNsb3Nlc3RXaW5kIiwid2luZCIsImNsb3Nlc3RIYWxmRWRnZSIsImNsb3Nlc3RCb3VuZGFyeSIsImdldEJvdW5kYXJ5T2ZIYWxmRWRnZSIsInJlY3Vyc2l2ZWx5QWRkSG9sZXMiLCJiaW5kIiwic2xpY2UiLCJvdXRzaWRlTWFwIiwiZm9yd2FyZEZhY2UiLCJyZXZlcnNlZEZhY2UiLCJzb2x2ZWRGb3J3YXJkIiwic29sdmVkUmV2ZXJzZWQiLCJtIiwiY29tcHV0ZURpZmZlcmVudGlhbCIsInNvbHZlZEZhY2UiLCJ1bnNvbHZlZEZhY2UiLCJkaWZmZXJlbnRpYWwiLCJuIiwibG9vcEhhbGZFZGdlIiwibnVsbEZhY2VGaWxsZWRDb3VudCIsImZvcndhcmROdWxsIiwicmV2ZXJzZWROdWxsIiwiaGFzSGFsZkVkZ2UiLCJFcnJvciIsIkJJTkFSWV9OT05aRVJPX1VOSU9OIiwiQklOQVJZX05PTlpFUk9fSU5URVJTRUNUSU9OIiwiQklOQVJZX05PTlpFUk9fRElGRkVSRU5DRSIsIkJJTkFSWV9OT05aRVJPX1hPUiIsImJpbmFyeVJlc3VsdCIsInNoYXBlQSIsInNoYXBlQiIsInN1YmdyYXBoIiwidW5pb25Ob25aZXJvIiwic2hhcGVzIiwiaW50ZXJzZWN0aW9uTm9uWmVybyIsInhvck5vblplcm8iLCJpbmNsdWRlZCIsInNpbXBsaWZ5Tm9uWmVybyIsInJlc3VsdFNoYXBlIiwiY2xpcFNoYXBlIiwiY2xpcEFyZWFTaGFwZSIsIlNIQVBFX0lEIiwiQ0xJUF9TSEFQRV9JRCIsImluY2x1ZGVFeHRlcmlvciIsImluY2x1ZGVCb3VuZGFyeSIsImluY2x1ZGVJbnRlcmlvciIsInNpbXBsaWZpZWRDbGlwQXJlYVNoYXBlIiwiY29udGFpbnNQb2ludCIsInBvc2l0aW9uQXQiLCJnZXREaXJlY3Rpb25hbFNlZ21lbnQiLCJ1bmRlZmluZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdyYXBoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbXVsdGlncmFwaCB3aG9zZSBlZGdlcyBhcmUgc2VnbWVudHMuXHJcbiAqXHJcbiAqIFN1cHBvcnRzIGdlbmVyYWwgc2hhcGUgc2ltcGxpZmljYXRpb24sIG92ZXJsYXAvaW50ZXJzZWN0aW9uIHJlbW92YWwgYW5kIGNvbXB1dGF0aW9uLiBHZW5lcmFsIG91dHB1dCB3b3VsZCBpbmNsdWRlXHJcbiAqIFNoYXBlcyAoZnJvbSBDQUcgLSBDb25zdHJ1Y3RpdmUgQXJlYSBHZW9tZXRyeSkgYW5kIHRyaWFuZ3VsYXRpb25zLlxyXG4gKlxyXG4gKiBTZWUgR3JhcGguYmluYXJ5UmVzdWx0IGZvciB0aGUgZ2VuZXJhbCBwcm9jZWR1cmUgZm9yIENBRy5cclxuICpcclxuICogVE9ETzogVXNlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXVyaWNpb3NhbnRvcy9CdWNrZXRzLUpTIGZvciBwcmlvcml0eSBxdWV1ZSwgaW1wbGVtZW50IHNpbXBsZSBzd2VlcCBsaW5lXHJcbiAqICAgICAgIHdpdGggXCJlbnRlcnNcIiBhbmQgXCJsZWF2ZXNcIiBlbnRyaWVzIGluIHRoZSBxdWV1ZS4gV2hlbiBlZGdlIHJlbW92ZWQsIHJlbW92ZSBcImxlYXZlXCIgZnJvbSBxdWV1ZS5cclxuICogICAgICAgYW5kIGFkZCBhbnkgcmVwbGFjZW1lbnQgZWRnZXMuIEFwcGxpZXMgdG8gb3ZlcmxhcCBhbmQgaW50ZXJzZWN0aW9uIGhhbmRsaW5nLlxyXG4gKiAgICAgICBOT1RFOiBUaGlzIHNob3VsZCBpbXBhY3QgcGVyZm9ybWFuY2UgYSBsb3QsIGFzIHdlIGFyZSBjdXJyZW50bHkgb3Zlci1zY2FubmluZyBhbmQgcmUtc2Nhbm5pbmcgYSBsb3QuXHJcbiAqICAgICAgIEludGVyc2VjdGlvbiBpcyBjdXJyZW50bHkgKGJ5IGZhcj8pIHRoZSBwZXJmb3JtYW5jZSBib3R0bGVuZWNrLlxyXG4gKiBUT0RPOiBDb2xsYXBzZSBub24tTGluZSBhZGphY2VudCBlZGdlcyB0b2dldGhlci4gU2ltaWxhciBsb2dpYyB0byBvdmVybGFwIGZvciBlYWNoIHNlZ21lbnQgdGltZSwgaG9wZWZ1bGx5IGNhblxyXG4gKiAgICAgICBmYWN0b3IgdGhpcyBvdXQuXHJcbiAqIFRPRE86IFByb3Blcmx5IGhhbmRsZSBzb3J0aW5nIGVkZ2VzIGFyb3VuZCBhIHZlcnRleCB3aGVuIHR3byBlZGdlcyBoYXZlIHRoZSBzYW1lIHRhbmdlbnQgb3V0LiBXZSdsbCBuZWVkIHRvIHVzZVxyXG4gKiAgICAgICBjdXJ2YXR1cmUsIG9yIGRvIHRyaWNrcyB0byBmb2xsb3cgYm90aCBjdXJ2ZXMgYnkgYW4gJ2Vwc2lsb24nIGFuZCBzb3J0IGJhc2VkIG9uIHRoYXQuXHJcbiAqIFRPRE86IENvbnNpZGVyIHNlcGFyYXRpbmcgb3V0IGVwc2lsb24gdmFsdWVzIChtYXkgYmUgYSBnZW5lcmFsIEtpdGUgdGhpbmcgcmF0aGVyIHRoYW4ganVzdCBvcHMpXHJcbiAqIFRPRE86IExvb3AtQmxpbm4gb3V0cHV0IGFuZCBjb25zdHJhaW5lZCBEZWxhdW5heSB0cmlhbmd1bGF0aW9uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFRyYW5zZm9ybTMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1RyYW5zZm9ybTMuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5UmVtb3ZlLmpzJztcclxuaW1wb3J0IGNsZWFuQXJyYXkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2NsZWFuQXJyYXkuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgQXJjLCBCb3VuZGFyeSwgQ3ViaWMsIEVkZ2UsIEVkZ2VTZWdtZW50VHJlZSwgRWxsaXB0aWNhbEFyYywgRmFjZSwga2l0ZSwgTGluZSwgTG9vcCwgU2VnbWVudCwgU3VicGF0aCwgVmVydGV4LCBWZXJ0ZXhTZWdtZW50VHJlZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxubGV0IGJyaWRnZUlkID0gMDtcclxubGV0IGdsb2JhbElkID0gMDtcclxuXHJcbmNsYXNzIEdyYXBoIHtcclxuICAvKipcclxuICAgKiBAcHVibGljIChraXRlLWludGVybmFsKVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFZlcnRleD59XHJcbiAgICB0aGlzLnZlcnRpY2VzID0gW107XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPEVkZ2U+fVxyXG4gICAgdGhpcy5lZGdlcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxCb3VuZGFyeT59XHJcbiAgICB0aGlzLmlubmVyQm91bmRhcmllcyA9IFtdO1xyXG4gICAgdGhpcy5vdXRlckJvdW5kYXJpZXMgPSBbXTtcclxuICAgIHRoaXMuYm91bmRhcmllcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxudW1iZXI+fVxyXG4gICAgdGhpcy5zaGFwZUlkcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxMb29wPn1cclxuICAgIHRoaXMubG9vcHMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtGYWNlfVxyXG4gICAgdGhpcy51bmJvdW5kZWRGYWNlID0gRmFjZS5wb29sLmNyZWF0ZSggbnVsbCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxGYWNlPn1cclxuICAgIHRoaXMuZmFjZXMgPSBbIHRoaXMudW5ib3VuZGVkRmFjZSBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAqL1xyXG4gIHNlcmlhbGl6ZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6ICdHcmFwaCcsXHJcbiAgICAgIHZlcnRpY2VzOiB0aGlzLnZlcnRpY2VzLm1hcCggdmVydGV4ID0+IHZlcnRleC5zZXJpYWxpemUoKSApLFxyXG4gICAgICBlZGdlczogdGhpcy5lZGdlcy5tYXAoIGVkZ2UgPT4gZWRnZS5zZXJpYWxpemUoKSApLFxyXG4gICAgICBib3VuZGFyaWVzOiB0aGlzLmJvdW5kYXJpZXMubWFwKCBib3VuZGFyeSA9PiBib3VuZGFyeS5zZXJpYWxpemUoKSApLFxyXG4gICAgICBpbm5lckJvdW5kYXJpZXM6IHRoaXMuaW5uZXJCb3VuZGFyaWVzLm1hcCggYm91bmRhcnkgPT4gYm91bmRhcnkuaWQgKSxcclxuICAgICAgb3V0ZXJCb3VuZGFyaWVzOiB0aGlzLm91dGVyQm91bmRhcmllcy5tYXAoIGJvdW5kYXJ5ID0+IGJvdW5kYXJ5LmlkICksXHJcbiAgICAgIHNoYXBlSWRzOiB0aGlzLnNoYXBlSWRzLFxyXG4gICAgICBsb29wczogdGhpcy5sb29wcy5tYXAoIGxvb3AgPT4gbG9vcC5zZXJpYWxpemUoKSApLFxyXG4gICAgICB1bmJvdW5kZWRGYWNlOiB0aGlzLnVuYm91bmRlZEZhY2UuaWQsXHJcbiAgICAgIGZhY2VzOiB0aGlzLmZhY2VzLm1hcCggZmFjZSA9PiBmYWNlLnNlcmlhbGl6ZSgpIClcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWNyZWF0ZSBhIEdyYXBoIGJhc2VkIG9uIHNlcmlhbGl6ZWQgc3RhdGUgZnJvbSBzZXJpYWxpemUoKVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcclxuICAgKi9cclxuICBzdGF0aWMgZGVzZXJpYWxpemUoIG9iaiApIHtcclxuICAgIGNvbnN0IGdyYXBoID0gbmV3IEdyYXBoKCk7XHJcblxyXG4gICAgY29uc3QgdmVydGV4TWFwID0ge307XHJcbiAgICBjb25zdCBlZGdlTWFwID0ge307XHJcbiAgICBjb25zdCBoYWxmRWRnZU1hcCA9IHt9O1xyXG4gICAgY29uc3QgYm91bmRhcnlNYXAgPSB7fTtcclxuICAgIGNvbnN0IGxvb3BNYXAgPSB7fTtcclxuICAgIGNvbnN0IGZhY2VNYXAgPSB7fTtcclxuXHJcbiAgICBncmFwaC52ZXJ0aWNlcyA9IG9iai52ZXJ0aWNlcy5tYXAoIGRhdGEgPT4ge1xyXG4gICAgICBjb25zdCB2ZXJ0ZXggPSBuZXcgVmVydGV4KCBWZWN0b3IyLlZlY3RvcjJJTy5mcm9tU3RhdGVPYmplY3QoIGRhdGEucG9pbnQgKSApO1xyXG4gICAgICB2ZXJ0ZXhNYXBbIGRhdGEuaWQgXSA9IHZlcnRleDtcclxuICAgICAgLy8gaW5jaWRlbnRIYWxmRWRnZXMgY29ubmVjdGVkIGJlbG93XHJcbiAgICAgIHZlcnRleC52aXNpdGVkID0gZGF0YS52aXNpdGVkO1xyXG4gICAgICB2ZXJ0ZXgudmlzaXRJbmRleCA9IGRhdGEudmlzaXRJbmRleDtcclxuICAgICAgdmVydGV4Lmxvd0luZGV4ID0gZGF0YS5sb3dJbmRleDtcclxuICAgICAgcmV0dXJuIHZlcnRleDtcclxuICAgIH0gKTtcclxuXHJcbiAgICBncmFwaC5lZGdlcyA9IG9iai5lZGdlcy5tYXAoIGRhdGEgPT4ge1xyXG4gICAgICBjb25zdCBlZGdlID0gbmV3IEVkZ2UoIFNlZ21lbnQuZGVzZXJpYWxpemUoIGRhdGEuc2VnbWVudCApLCB2ZXJ0ZXhNYXBbIGRhdGEuc3RhcnRWZXJ0ZXggXSwgdmVydGV4TWFwWyBkYXRhLmVuZFZlcnRleCBdICk7XHJcbiAgICAgIGVkZ2VNYXBbIGRhdGEuaWQgXSA9IGVkZ2U7XHJcbiAgICAgIGVkZ2Uuc2lnbmVkQXJlYUZyYWdtZW50ID0gZGF0YS5zaWduZWRBcmVhRnJhZ21lbnQ7XHJcblxyXG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZUhhbGZFZGdlID0gKCBoYWxmRWRnZSwgaGFsZkVkZ2VEYXRhICkgPT4ge1xyXG4gICAgICAgIGhhbGZFZGdlTWFwWyBoYWxmRWRnZURhdGEuaWQgXSA9IGhhbGZFZGdlO1xyXG4gICAgICAgIC8vIGZhY2UgY29ubmVjdGVkIGxhdGVyXHJcbiAgICAgICAgaGFsZkVkZ2UuaXNSZXZlcnNlZCA9IGhhbGZFZGdlRGF0YS5pc1JldmVyc2VkO1xyXG4gICAgICAgIGhhbGZFZGdlLnNpZ25lZEFyZWFGcmFnbWVudCA9IGhhbGZFZGdlRGF0YS5zaWduZWRBcmVhRnJhZ21lbnQ7XHJcbiAgICAgICAgaGFsZkVkZ2Uuc3RhcnRWZXJ0ZXggPSB2ZXJ0ZXhNYXBbIGhhbGZFZGdlRGF0YS5zdGFydFZlcnRleC5pZCBdO1xyXG4gICAgICAgIGhhbGZFZGdlLmVuZFZlcnRleCA9IHZlcnRleE1hcFsgaGFsZkVkZ2VEYXRhLmVuZFZlcnRleC5pZCBdO1xyXG4gICAgICAgIGhhbGZFZGdlLnNvcnRWZWN0b3IgPSBWZWN0b3IyLlZlY3RvcjJJTy5mcm9tU3RhdGVPYmplY3QoIGhhbGZFZGdlRGF0YS5zb3J0VmVjdG9yICk7XHJcbiAgICAgICAgaGFsZkVkZ2UuZGF0YSA9IGhhbGZFZGdlRGF0YS5kYXRhO1xyXG4gICAgICB9O1xyXG4gICAgICBkZXNlcmlhbGl6ZUhhbGZFZGdlKCBlZGdlLmZvcndhcmRIYWxmLCBkYXRhLmZvcndhcmRIYWxmICk7XHJcbiAgICAgIGRlc2VyaWFsaXplSGFsZkVkZ2UoIGVkZ2UucmV2ZXJzZWRIYWxmLCBkYXRhLnJldmVyc2VkSGFsZiApO1xyXG5cclxuICAgICAgZWRnZS52aXNpdGVkID0gZGF0YS52aXNpdGVkO1xyXG4gICAgICBlZGdlLmRhdGEgPSBkYXRhLmRhdGE7XHJcbiAgICAgIHJldHVybiBlZGdlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENvbm5lY3QgVmVydGV4IGluY2lkZW50SGFsZkVkZ2VzXHJcbiAgICBvYmoudmVydGljZXMuZm9yRWFjaCggKCBkYXRhLCBpICkgPT4ge1xyXG4gICAgICBjb25zdCB2ZXJ0ZXggPSBncmFwaC52ZXJ0aWNlc1sgaSBdO1xyXG4gICAgICB2ZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXMgPSBkYXRhLmluY2lkZW50SGFsZkVkZ2VzLm1hcCggaWQgPT4gaGFsZkVkZ2VNYXBbIGlkIF0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBncmFwaC5ib3VuZGFyaWVzID0gb2JqLmJvdW5kYXJpZXMubWFwKCBkYXRhID0+IHtcclxuICAgICAgY29uc3QgYm91bmRhcnkgPSBCb3VuZGFyeS5wb29sLmNyZWF0ZSggZGF0YS5oYWxmRWRnZXMubWFwKCBpZCA9PiBoYWxmRWRnZU1hcFsgaWQgXSApICk7XHJcbiAgICAgIGJvdW5kYXJ5TWFwWyBkYXRhLmlkIF0gPSBib3VuZGFyeTtcclxuICAgICAgYm91bmRhcnkuc2lnbmVkQXJlYSA9IGRhdGEuc2lnbmVkQXJlYTtcclxuICAgICAgYm91bmRhcnkuYm91bmRzID0gQm91bmRzMi5Cb3VuZHMySU8uZnJvbVN0YXRlT2JqZWN0KCBkYXRhLmJvdW5kcyApO1xyXG4gICAgICAvLyBjaGlsZEJvdW5kYXJpZXMgaGFuZGxlZCBiZWxvd1xyXG4gICAgICByZXR1cm4gYm91bmRhcnk7XHJcbiAgICB9ICk7XHJcbiAgICBvYmouYm91bmRhcmllcy5mb3JFYWNoKCAoIGRhdGEsIGkgKSA9PiB7XHJcbiAgICAgIGNvbnN0IGJvdW5kYXJ5ID0gZ3JhcGguYm91bmRhcmllc1sgaSBdO1xyXG4gICAgICBib3VuZGFyeS5jaGlsZEJvdW5kYXJpZXMgPSBkYXRhLmNoaWxkQm91bmRhcmllcy5tYXAoIGlkID0+IGJvdW5kYXJ5TWFwWyBpZCBdICk7XHJcbiAgICB9ICk7XHJcbiAgICBncmFwaC5pbm5lckJvdW5kYXJpZXMgPSBvYmouaW5uZXJCb3VuZGFyaWVzLm1hcCggaWQgPT4gYm91bmRhcnlNYXBbIGlkIF0gKTtcclxuICAgIGdyYXBoLm91dGVyQm91bmRhcmllcyA9IG9iai5vdXRlckJvdW5kYXJpZXMubWFwKCBpZCA9PiBib3VuZGFyeU1hcFsgaWQgXSApO1xyXG5cclxuICAgIGdyYXBoLnNoYXBlSWRzID0gb2JqLnNoYXBlSWRzO1xyXG5cclxuICAgIGdyYXBoLmxvb3BzID0gb2JqLmxvb3BzLm1hcCggZGF0YSA9PiB7XHJcbiAgICAgIGNvbnN0IGxvb3AgPSBuZXcgTG9vcCggZGF0YS5zaGFwZUlkLCBkYXRhLmNsb3NlZCApO1xyXG4gICAgICBsb29wTWFwWyBkYXRhLmlkIF0gPSBsb29wO1xyXG4gICAgICBsb29wLmhhbGZFZGdlcyA9IGRhdGEuaGFsZkVkZ2VzLm1hcCggaWQgPT4gaGFsZkVkZ2VNYXBbIGlkIF0gKTtcclxuICAgICAgcmV0dXJuIGxvb3A7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgZ3JhcGguZmFjZXMgPSBvYmouZmFjZXMubWFwKCAoIGRhdGEsIGkgKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZhY2UgPSBpID09PSAwID8gZ3JhcGgudW5ib3VuZGVkRmFjZSA6IG5ldyBGYWNlKCBib3VuZGFyeU1hcFsgZGF0YS5ib3VuZGFyeSBdICk7XHJcbiAgICAgIGZhY2VNYXBbIGRhdGEuaWQgXSA9IGZhY2U7XHJcbiAgICAgIGZhY2UuaG9sZXMgPSBkYXRhLmhvbGVzLm1hcCggaWQgPT4gYm91bmRhcnlNYXBbIGlkIF0gKTtcclxuICAgICAgZmFjZS53aW5kaW5nTWFwID0gZGF0YS53aW5kaW5nTWFwO1xyXG4gICAgICBmYWNlLmZpbGxlZCA9IGRhdGEuZmlsbGVkO1xyXG4gICAgICByZXR1cm4gZmFjZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDb25uZWN0ZWQgZmFjZXMgdG8gaGFsZkVkZ2VzXHJcbiAgICBvYmouZWRnZXMuZm9yRWFjaCggKCBkYXRhLCBpICkgPT4ge1xyXG4gICAgICBjb25zdCBlZGdlID0gZ3JhcGguZWRnZXNbIGkgXTtcclxuICAgICAgZWRnZS5mb3J3YXJkSGFsZi5mYWNlID0gZGF0YS5mb3J3YXJkSGFsZi5mYWNlID09PSBudWxsID8gbnVsbCA6IGZhY2VNYXBbIGRhdGEuZm9yd2FyZEhhbGYuZmFjZSBdO1xyXG4gICAgICBlZGdlLnJldmVyc2VkSGFsZi5mYWNlID0gZGF0YS5yZXZlcnNlZEhhbGYuZmFjZSA9PT0gbnVsbCA/IG51bGwgOiBmYWNlTWFwWyBkYXRhLnJldmVyc2VkSGFsZi5mYWNlIF07XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIGdyYXBoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIFNoYXBlICh3aXRoIGEgZ2l2ZW4gSUQgZm9yIENBRyBwdXJwb3NlcykgdG8gdGhlIGdyYXBoLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaGFwZUlkIC0gVGhlIElEIHdoaWNoIHNob3VsZCBiZSBzaGFyZWQgZm9yIGFsbCBwYXRocy9zaGFwZXMgdGhhdCBzaG91bGQgYmUgY29tYmluZWQgd2l0aFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcGVjdCB0byB0aGUgd2luZGluZyBudW1iZXIgb2YgZmFjZXMuIEZvciBDQUcsIGluZGVwZW5kZW50IHNoYXBlcyBzaG91bGQgYmUgZ2l2ZW5cclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZlcmVudCBJRHMgKHNvIHRoZXkgaGF2ZSBzZXBhcmF0ZSB3aW5kaW5nIG51bWJlcnMgcmVjb3JkZWQpLlxyXG4gICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIFNlZSBhZGRTdWJwYXRoXHJcbiAgICovXHJcbiAgYWRkU2hhcGUoIHNoYXBlSWQsIHNoYXBlLCBvcHRpb25zICkge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc2hhcGUuc3VicGF0aHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuYWRkU3VicGF0aCggc2hhcGVJZCwgc2hhcGUuc3VicGF0aHNbIGkgXSwgb3B0aW9ucyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIHN1YnBhdGggb2YgYSBTaGFwZSAod2l0aCBhIGdpdmVuIElEIGZvciBDQUcgcHVycG9zZXMpIHRvIHRoZSBncmFwaC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2hhcGVJZCAtIFNlZSBhZGRTaGFwZSgpIGRvY3VtZW50YXRpb25cclxuICAgKiBAcGFyYW0ge1N1YnBhdGh9IHN1YnBhdGhcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgYWRkU3VicGF0aCggc2hhcGVJZCwgc3VicGF0aCwgb3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBzaGFwZUlkID09PSAnbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3VicGF0aCBpbnN0YW5jZW9mIFN1YnBhdGggKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgZW5zdXJlQ2xvc2VkOiB0cnVlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gRW5zdXJlIHRoZSBzaGFwZUlkIGlzIHJlY29yZGVkXHJcbiAgICBpZiAoIHRoaXMuc2hhcGVJZHMuaW5kZXhPZiggc2hhcGVJZCApIDwgMCApIHtcclxuICAgICAgdGhpcy5zaGFwZUlkcy5wdXNoKCBzaGFwZUlkICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBzdWJwYXRoLnNlZ21lbnRzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNsb3NlZCA9IHN1YnBhdGguY2xvc2VkIHx8IG9wdGlvbnMuZW5zdXJlQ2xvc2VkO1xyXG4gICAgY29uc3Qgc2VnbWVudHMgPSBvcHRpb25zLmVuc3VyZUNsb3NlZCA/IHN1YnBhdGguZ2V0RmlsbFNlZ21lbnRzKCkgOiBzdWJwYXRoLnNlZ21lbnRzO1xyXG4gICAgbGV0IGluZGV4O1xyXG5cclxuICAgIC8vIENvbGxlY3RzIGFsbCBvZiB0aGUgdmVydGljZXNcclxuICAgIGNvbnN0IHZlcnRpY2VzID0gW107XHJcbiAgICBmb3IgKCBpbmRleCA9IDA7IGluZGV4IDwgc2VnbWVudHMubGVuZ3RoOyBpbmRleCsrICkge1xyXG4gICAgICBsZXQgcHJldmlvdXNJbmRleCA9IGluZGV4IC0gMTtcclxuICAgICAgaWYgKCBwcmV2aW91c0luZGV4IDwgMCApIHtcclxuICAgICAgICBwcmV2aW91c0luZGV4ID0gc2VnbWVudHMubGVuZ3RoIC0gMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gR2V0IHRoZSBlbmQgb2YgdGhlIHByZXZpb3VzIHNlZ21lbnQgYW5kIHN0YXJ0IG9mIHRoZSBuZXh0LiBHZW5lcmFsbHkgdGhleSBzaG91bGQgYmUgZXF1YWwgb3IgYWxtb3N0IGVxdWFsLFxyXG4gICAgICAvLyBhcyBpdCdzIHRoZSBwb2ludCBhdCB0aGUgam9pbnQgb2YgdHdvIHNlZ21lbnRzLlxyXG4gICAgICBsZXQgZW5kID0gc2VnbWVudHNbIHByZXZpb3VzSW5kZXggXS5lbmQ7XHJcbiAgICAgIGNvbnN0IHN0YXJ0ID0gc2VnbWVudHNbIGluZGV4IF0uc3RhcnQ7XHJcblxyXG4gICAgICAvLyBJZiB3ZSBhcmUgY3JlYXRpbmcgYW4gb3BlbiBcImxvb3BcIiwgZG9uJ3QgaW50ZXJwb2xhdGUgdGhlIHN0YXJ0L2VuZCBvZiB0aGUgZW50aXJlIHN1YnBhdGggdG9nZXRoZXIuXHJcbiAgICAgIGlmICggIWNsb3NlZCAmJiBpbmRleCA9PT0gMCApIHtcclxuICAgICAgICBlbmQgPSBzdGFydDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgdGhleSBhcmUgZXhhY3RseSBlcXVhbCwgZG9uJ3QgdGFrZSBhIGNoYW5jZSBvbiBmbG9hdGluZy1wb2ludCBhcml0aG1ldGljXHJcbiAgICAgIGlmICggc3RhcnQuZXF1YWxzKCBlbmQgKSApIHtcclxuICAgICAgICB2ZXJ0aWNlcy5wdXNoKCBWZXJ0ZXgucG9vbC5jcmVhdGUoIHN0YXJ0ICkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdGFydC5kaXN0YW5jZSggZW5kICkgPCAxZS01LCAnSW5hY2N1cmF0ZSBzdGFydC9lbmQgcG9pbnRzJyApO1xyXG4gICAgICAgIHZlcnRpY2VzLnB1c2goIFZlcnRleC5wb29sLmNyZWF0ZSggc3RhcnQuYXZlcmFnZSggZW5kICkgKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoICFjbG9zZWQgKSB7XHJcbiAgICAgIC8vIElmIHdlIGFyZW4ndCBjbG9zZWQsIGNyZWF0ZSBhbiBcImVuZFwiIHZlcnRleCBzaW5jZSBpdCBtYXkgYmUgZGlmZmVyZW50IGZyb20gdGhlIFwic3RhcnRcIlxyXG4gICAgICB2ZXJ0aWNlcy5wdXNoKCBWZXJ0ZXgucG9vbC5jcmVhdGUoIHNlZ21lbnRzWyBzZWdtZW50cy5sZW5ndGggLSAxIF0uZW5kICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGxvb3Agb2JqZWN0IGZyb20gdGhlIHZlcnRpY2VzLCBmaWxsaW5nIGluIGVkZ2VzXHJcbiAgICBjb25zdCBsb29wID0gTG9vcC5wb29sLmNyZWF0ZSggc2hhcGVJZCwgY2xvc2VkICk7XHJcbiAgICBmb3IgKCBpbmRleCA9IDA7IGluZGV4IDwgc2VnbWVudHMubGVuZ3RoOyBpbmRleCsrICkge1xyXG4gICAgICBsZXQgbmV4dEluZGV4ID0gaW5kZXggKyAxO1xyXG4gICAgICBpZiAoIGNsb3NlZCAmJiBuZXh0SW5kZXggPT09IHNlZ21lbnRzLmxlbmd0aCApIHtcclxuICAgICAgICBuZXh0SW5kZXggPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBlZGdlID0gRWRnZS5wb29sLmNyZWF0ZSggc2VnbWVudHNbIGluZGV4IF0sIHZlcnRpY2VzWyBpbmRleCBdLCB2ZXJ0aWNlc1sgbmV4dEluZGV4IF0gKTtcclxuICAgICAgbG9vcC5oYWxmRWRnZXMucHVzaCggZWRnZS5mb3J3YXJkSGFsZiApO1xyXG4gICAgICB0aGlzLmFkZEVkZ2UoIGVkZ2UgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxvb3BzLnB1c2goIGxvb3AgKTtcclxuICAgIHRoaXMudmVydGljZXMucHVzaCggLi4udmVydGljZXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNpbXBsaWZpZXMgZWRnZXMvdmVydGljZXMsIGNvbXB1dGVzIGJvdW5kYXJpZXMgYW5kIGZhY2VzICh3aXRoIHRoZSB3aW5kaW5nIG1hcCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNvbXB1dGVTaW1wbGlmaWVkRmFjZXMoKSB7XHJcbiAgICAvLyBCZWZvcmUgd2UgZmluZCBhbnkgaW50ZXJzZWN0aW9ucyAoc2VsZi1pbnRlcnNlY3Rpb24gb3IgYmV0d2VlbiBlZGdlcyksIHdlJ2xsIHdhbnQgdG8gaWRlbnRpZnkgYW5kIGZpeCB1cFxyXG4gICAgLy8gYW55IGNhc2VzIHdoZXJlIHRoZXJlIGFyZSBhbiBpbmZpbml0ZSBudW1iZXIgb2YgaW50ZXJzZWN0aW9ucyBiZXR3ZWVuIGVkZ2VzICh0aGV5IGFyZSBjb250aW51b3VzbHlcclxuICAgIC8vIG92ZXJsYXBwaW5nKS4gRm9yIGFueSBvdmVybGFwLCB3ZSdsbCBzcGxpdCBpdCBpbnRvIG9uZSBcIm92ZXJsYXBcIiBlZGdlIGFuZCBhbnkgcmVtYWluaW5nIGVkZ2VzLiBBZnRlciB0aGlzXHJcbiAgICAvLyBwcm9jZXNzLCB0aGVyZSBzaG91bGQgYmUgbm8gY29udGludW91cyBvdmVybGFwcy5cclxuICAgIHRoaXMuZWxpbWluYXRlT3ZlcmxhcCgpO1xyXG5cclxuICAgIC8vIERldGVjdHMgYW55IGVkZ2Ugc2VsZi1pbnRlcnNlY3Rpb24sIGFuZCBzcGxpdHMgaXQgaW50byBtdWx0aXBsZSBlZGdlcy4gVGhpcyBjdXJyZW50bHkgaGFwcGVucyB3aXRoIGN1YmljcyBvbmx5LFxyXG4gICAgLy8gYnV0IG5lZWRzIHRvIGJlIGRvbmUgYmVmb3JlIHdlIGludGVyc2VjdCB0aG9zZSBjdWJpY3Mgd2l0aCBhbnkgb3RoZXIgZWRnZXMuXHJcbiAgICB0aGlzLmVsaW1pbmF0ZVNlbGZJbnRlcnNlY3Rpb24oKTtcclxuXHJcbiAgICAvLyBGaW5kIGludGVyLWVkZ2UgaW50ZXJzZWN0aW9ucyAodGhhdCBhcmVuJ3QgYXQgZW5kcG9pbnRzKS4gU3BsaXRzIGVkZ2VzIGludm9sdmVkIGludG8gdGhlIGludGVyc2VjdGlvbi4gQWZ0ZXJcclxuICAgIC8vIHRoaXMgcGFzcywgd2Ugc2hvdWxkIGhhdmUgYSB3ZWxsLWRlZmluZWQgZ3JhcGggd2hlcmUgaW4gdGhlIHBsYW5hciBlbWJlZGRpbmcgZWRnZXMgZG9uJ3QgaW50ZXJzZWN0IG9yIG92ZXJsYXAuXHJcbiAgICB0aGlzLmVsaW1pbmF0ZUludGVyc2VjdGlvbigpO1xyXG5cclxuICAgIC8vIEZyb20gdGhlIGFib3ZlIHByb2Nlc3MgKGFuZCBpbnB1dCksIHdlIG1heSBoYXZlIG11bHRpcGxlIHZlcnRpY2VzIHRoYXQgb2NjdXB5IGVzc2VudGlhbGx5IHRoZSBzYW1lIGxvY2F0aW9uLlxyXG4gICAgLy8gVGhlc2UgdmVydGljZXMgZ2V0IGNvbWJpbmVkIGludG8gb25lIHZlcnRleCBpbiB0aGUgbG9jYXRpb24uIElmIHRoZXJlIHdhcyBhIG1vc3RseS1kZWdlbmVyYXRlIGVkZ2UgdGhhdCB3YXNcclxuICAgIC8vIHZlcnkgc21hbGwgYmV0d2VlbiBlZGdlcywgaXQgd2lsbCBiZSByZW1vdmVkLlxyXG4gICAgdGhpcy5jb2xsYXBzZVZlcnRpY2VzKCk7XHJcblxyXG4gICAgLy8gT3VyIGdyYXBoIGNhbiBlbmQgdXAgd2l0aCBlZGdlcyB0aGF0IHdvdWxkIGhhdmUgdGhlIHNhbWUgZmFjZSBvbiBib3RoIHNpZGVzIChhcmUgY29uc2lkZXJlZCBhIFwiYnJpZGdlXCIgZWRnZSkuXHJcbiAgICAvLyBUaGVzZSBuZWVkIHRvIGJlIHJlbW92ZWQsIHNvIHRoYXQgb3VyIGZhY2UgaGFuZGxpbmcgbG9naWMgZG9lc24ndCBoYXZlIHRvIGhhbmRsZSBhbm90aGVyIGNsYXNzIG9mIGNhc2VzLlxyXG4gICAgdGhpcy5yZW1vdmVCcmlkZ2VzKCk7XHJcblxyXG4gICAgLy8gVmVydGljZXMgY2FuIGJlIGxlZnQgb3ZlciB3aGVyZSB0aGV5IGhhdmUgbGVzcyB0aGFuIDIgaW5jaWRlbnQgZWRnZXMsIGFuZCB0aGV5IGNhbiBiZSBzYWZlbHkgcmVtb3ZlZCAoc2luY2VcclxuICAgIC8vIHRoZXkgd29uJ3QgY29udHJpYnV0ZSB0byB0aGUgYXJlYSBvdXRwdXQpLlxyXG4gICAgdGhpcy5yZW1vdmVMb3dPcmRlclZlcnRpY2VzKCk7XHJcblxyXG4gICAgLy8gTm93IHRoYXQgdGhlIGdyYXBoIGhhcyB3ZWxsLWRlZmluZWQgdmVydGljZXMgYW5kIGVkZ2VzICgyLWVkZ2UtY29ubmVjdGVkLCBub25vdmVybGFwcGluZyksIHdlJ2xsIHdhbnQgdG8ga25vd1xyXG4gICAgLy8gdGhlIG9yZGVyIG9mIGVkZ2VzIGFyb3VuZCBhIHZlcnRleCAoaWYgeW91IHJvdGF0ZSBhcm91bmQgYSB2ZXJ0ZXgsIHdoYXQgZWRnZXMgYXJlIGluIHdoYXQgb3JkZXI/KS5cclxuICAgIHRoaXMub3JkZXJWZXJ0ZXhFZGdlcygpO1xyXG5cclxuICAgIC8vIEV4dHJhY3RzIGJvdW5kYXJpZXMgYW5kIGZhY2VzLCBieSBmb2xsb3dpbmcgZWFjaCBoYWxmLWVkZ2UgY291bnRlci1jbG9ja3dpc2UsIGFuZCBmYWNlcyBhcmUgY3JlYXRlZCBmb3JcclxuICAgIC8vIGJvdW5kYXJpZXMgdGhhdCBoYXZlIHBvc2l0aXZlIHNpZ25lZCBhcmVhLlxyXG4gICAgdGhpcy5leHRyYWN0RmFjZXMoKTtcclxuXHJcbiAgICAvLyBXZSBuZWVkIHRvIGRldGVybWluZSB3aGljaCBib3VuZGFyaWVzIGFyZSBob2xlcyBmb3IgZWFjaCBmYWNlLiBUaGlzIGNyZWF0ZXMgYSBcImJvdW5kYXJ5IHRyZWVcIiB3aGVyZSB0aGUgbm9kZXNcclxuICAgIC8vIGFyZSBib3VuZGFyaWVzLiBBbGwgY29ubmVjdGVkIGNvbXBvbmVudHMgc2hvdWxkIGJlIG9uZSBmYWNlIGFuZCBpdHMgaG9sZXMuIFRoZSBob2xlcyBnZXQgc3RvcmVkIG9uIHRoZVxyXG4gICAgLy8gcmVzcGVjdGl2ZSBmYWNlLlxyXG4gICAgdGhpcy5jb21wdXRlQm91bmRhcnlUcmVlKCk7XHJcblxyXG4gICAgLy8gQ29tcHV0ZSB0aGUgd2luZGluZyBudW1iZXJzIG9mIGVhY2ggZmFjZSBmb3IgZWFjaCBzaGFwZUlkLCB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgaW5wdXQgd291bGQgaGF2ZSB0aGF0XHJcbiAgICAvLyBmYWNlIFwiZmlsbGVkXCIuIEl0IHNob3VsZCB0aGVuIGJlIHJlYWR5IGZvciBmdXR1cmUgcHJvY2Vzc2luZy5cclxuICAgIHRoaXMuY29tcHV0ZVdpbmRpbmdNYXAoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgd2hldGhlciBlYWNoIGZhY2Ugc2hvdWxkIGJlIGZpbGxlZCBvciB1bmZpbGxlZCBiYXNlZCBvbiBhIGZpbHRlciBmdW5jdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGUgd2luZGluZ01hcEZpbHRlciB3aWxsIGJlIGNhbGxlZCBvbiBlYWNoIGZhY2UncyB3aW5kaW5nIG1hcCwgYW5kIHdpbGwgdXNlIHRoZSByZXR1cm4gdmFsdWUgYXMgd2hldGhlciB0aGUgZmFjZVxyXG4gICAqIGlzIGZpbGxlZCBvciBub3QuXHJcbiAgICpcclxuICAgKiBUaGUgd2luZGluZyBtYXAgaXMgYW4ge09iamVjdH0gYXNzb2NpYXRlZCB3aXRoIGVhY2ggZmFjZSB0aGF0IGhhcyBhIGtleSBmb3IgZXZlcnkgc2hhcGVJZCB0aGF0IHdhcyB1c2VkIGluXHJcbiAgICogYWRkU2hhcGUvYWRkU3VicGF0aCwgYW5kIHRoZSB2YWx1ZSBmb3IgdGhvc2Uga2V5cyBpcyB0aGUgd2luZGluZyBudW1iZXIgb2YgdGhlIGZhY2UgZ2l2ZW4gYWxsIHBhdGhzIHdpdGggdGhlXHJcbiAgICogc2hhcGVJZC5cclxuICAgKlxyXG4gICAqIEZvciBleGFtcGxlLCBpbWFnaW5lIHlvdSBhZGRlZCB0d28gc2hhcGVJZHMgKDAgYW5kIDEpLCBhbmQgdGhlIGl0ZXJhdGlvbiBpcyBvbiBhIGZhY2UgdGhhdCBpcyBpbmNsdWRlZCBpblxyXG4gICAqIG9uZSBsb29wIHNwZWNpZmllZCB3aXRoIHNoYXBlSWQ6MCAoaW5zaWRlIGEgY291bnRlci1jbG9ja3dpc2UgY3VydmUpLCBhbmQgaXMgb3V0c2lkZSBvZiBhbnkgc2VnbWVudHMgc3BlY2lmaWVkXHJcbiAgICogYnkgdGhlIHNlY29uZCBsb29wIChzaGFwZUlkOjEpLiBUaGVuIHRoZSB3aW5kaW5nIG1hcCB3aWxsIGJlOlxyXG4gICAqIHtcclxuICAgKiAgIDA6IDEgLy8gc2hhcGVJZDowIGhhcyBhIHdpbmRpbmcgbnVtYmVyIG9mIDEgZm9yIHRoaXMgZmFjZSAoZ2VuZXJhbGx5IGZpbGxlZClcclxuICAgKiAgIDE6IDAgLy8gc2hhcGVJZDoxIGhhcyBhIHdpbmRpbmcgbnVtYmVyIG9mIDAgZm9yIHRoaXMgZmFjZSAoZ2VuZXJhbGx5IG5vdCBmaWxsZWQpXHJcbiAgICogfVxyXG4gICAqXHJcbiAgICogR2VuZXJhbGx5LCB3aW5kaW5nIG1hcCBmaWx0ZXJzIGNhbiBiZSBicm9rZW4gZG93biBpbnRvIHR3byBzdGVwczpcclxuICAgKiAxLiBHaXZlbiB0aGUgd2luZGluZyBudW1iZXIgZm9yIGVhY2ggc2hhcGVJZCwgY29tcHV0ZSB3aGV0aGVyIHRoYXQgbG9vcCB3YXMgb3JpZ2luYWxseSBmaWxsZWQuIE5vcm1hbGx5LCB0aGlzIGlzXHJcbiAgICogICAgZG9uZSB3aXRoIGEgbm9uLXplcm8gcnVsZSAoYW55IHdpbmRpbmcgbnVtYmVyIGlzIGZpbGxlZCwgZXhjZXB0IHplcm8pLiBTVkcgYWxzbyBwcm92aWRlcyBhbiBldmVuLW9kZCBydWxlXHJcbiAgICogICAgKG9kZCBudW1iZXJzIGFyZSBmaWxsZWQsIGV2ZW4gbnVtYmVycyBhcmUgdW5maWxsZWQpLlxyXG4gICAqIDIuIEdpdmVuIGJvb2xlYW5zIGZvciBlYWNoIHNoYXBlSWQgZnJvbSBzdGVwIDEsIGNvbXB1dGUgQ0FHIG9wZXJhdGlvbnMgYmFzZWQgb24gYm9vbGVhbiBmb3JtdWxhcy4gU2F5IHlvdSB3YW50ZWRcclxuICAgKiAgICB0byB0YWtlIHRoZSB1bmlvbiBvZiBzaGFwZUlkcyAwIGFuZCAxLCB0aGVuIHJlbW92ZSBhbnl0aGluZyBpbiBzaGFwZUlkIDIuIEdpdmVuIHRoZSBib29sZWFucyBhYm92ZSwgdGhpcyBjYW5cclxuICAgKiAgICBiZSBkaXJlY3RseSBjb21wdXRlZCBhcyAoZmlsbGVkMCB8fCBmaWxsZWQxKSAmJiAhZmlsbGVkMi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IHdpbmRpbmdNYXBGaWx0ZXJcclxuICAgKi9cclxuICBjb21wdXRlRmFjZUluY2x1c2lvbiggd2luZGluZ01hcEZpbHRlciApIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZmFjZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGZhY2UgPSB0aGlzLmZhY2VzWyBpIF07XHJcbiAgICAgIGZhY2UuZmlsbGVkID0gd2luZGluZ01hcEZpbHRlciggZmFjZS53aW5kaW5nTWFwICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBuZXcgR3JhcGggb2JqZWN0IGJhc2VkIG9ubHkgb24gZWRnZXMgaW4gdGhpcyBncmFwaCB0aGF0IHNlcGFyYXRlIGEgXCJmaWxsZWRcIiBmYWNlIGZyb20gYW4gXCJ1bmZpbGxlZFwiXHJcbiAgICogZmFjZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVudCB3YXkgdG8gXCJjb2xsYXBzZVwiIGFkamFjZW50IGZpbGxlZCBhbmQgdW5maWxsZWQgZmFjZXMgdG9nZXRoZXIsIGFuZCBjb21wdXRlIHRoZSBjdXJ2ZXMgYW5kXHJcbiAgICogaG9sZXMgcHJvcGVybHksIGdpdmVuIGEgZmlsbGVkIFwibm9ybWFsXCIgZ3JhcGguXHJcbiAgICovXHJcbiAgY3JlYXRlRmlsbGVkU3ViR3JhcGgoKSB7XHJcbiAgICBjb25zdCBncmFwaCA9IG5ldyBHcmFwaCgpO1xyXG5cclxuICAgIGNvbnN0IHZlcnRleE1hcCA9IHt9OyAvLyBvbGQgaWQgPT4gbmV3VmVydGV4XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5lZGdlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgZWRnZSA9IHRoaXMuZWRnZXNbIGkgXTtcclxuICAgICAgaWYgKCBlZGdlLmZvcndhcmRIYWxmLmZhY2UuZmlsbGVkICE9PSBlZGdlLnJldmVyc2VkSGFsZi5mYWNlLmZpbGxlZCApIHtcclxuICAgICAgICBpZiAoICF2ZXJ0ZXhNYXBbIGVkZ2Uuc3RhcnRWZXJ0ZXguaWQgXSApIHtcclxuICAgICAgICAgIGNvbnN0IG5ld1N0YXJ0VmVydGV4ID0gVmVydGV4LnBvb2wuY3JlYXRlKCBlZGdlLnN0YXJ0VmVydGV4LnBvaW50ICk7XHJcbiAgICAgICAgICBncmFwaC52ZXJ0aWNlcy5wdXNoKCBuZXdTdGFydFZlcnRleCApO1xyXG4gICAgICAgICAgdmVydGV4TWFwWyBlZGdlLnN0YXJ0VmVydGV4LmlkIF0gPSBuZXdTdGFydFZlcnRleDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCAhdmVydGV4TWFwWyBlZGdlLmVuZFZlcnRleC5pZCBdICkge1xyXG4gICAgICAgICAgY29uc3QgbmV3RW5kVmVydGV4ID0gVmVydGV4LnBvb2wuY3JlYXRlKCBlZGdlLmVuZFZlcnRleC5wb2ludCApO1xyXG4gICAgICAgICAgZ3JhcGgudmVydGljZXMucHVzaCggbmV3RW5kVmVydGV4ICk7XHJcbiAgICAgICAgICB2ZXJ0ZXhNYXBbIGVkZ2UuZW5kVmVydGV4LmlkIF0gPSBuZXdFbmRWZXJ0ZXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzdGFydFZlcnRleCA9IHZlcnRleE1hcFsgZWRnZS5zdGFydFZlcnRleC5pZCBdO1xyXG4gICAgICAgIGNvbnN0IGVuZFZlcnRleCA9IHZlcnRleE1hcFsgZWRnZS5lbmRWZXJ0ZXguaWQgXTtcclxuICAgICAgICBncmFwaC5hZGRFZGdlKCBFZGdlLnBvb2wuY3JlYXRlKCBlZGdlLnNlZ21lbnQsIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXggKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUnVuIHNvbWUgbW9yZSBcInNpbXBsaWZpZWRcIiBwcm9jZXNzaW5nIG9uIHRoaXMgZ3JhcGggdG8gZGV0ZXJtaW5lIHdoaWNoIGZhY2VzIGFyZSBmaWxsZWQgKGFmdGVyIHNpbXBsaWZpY2F0aW9uKS5cclxuICAgIC8vIFdlIGRvbid0IG5lZWQgdGhlIGludGVyc2VjdGlvbiBvciBvdGhlciBwcm9jZXNzaW5nIHN0ZXBzLCBzaW5jZSB0aGlzIHdhcyBhY2NvbXBsaXNoZWQgKHByZXN1bWFibHkpIGFscmVhZHlcclxuICAgIC8vIGZvciB0aGUgZ2l2ZW4gZ3JhcGguXHJcbiAgICBncmFwaC5jb2xsYXBzZUFkamFjZW50RWRnZXMoKTtcclxuICAgIGdyYXBoLm9yZGVyVmVydGV4RWRnZXMoKTtcclxuICAgIGdyYXBoLmV4dHJhY3RGYWNlcygpO1xyXG4gICAgZ3JhcGguY29tcHV0ZUJvdW5kYXJ5VHJlZSgpO1xyXG4gICAgZ3JhcGguZmlsbEFsdGVybmF0aW5nRmFjZXMoKTtcclxuXHJcbiAgICByZXR1cm4gZ3JhcGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgU2hhcGUgdGhhdCBjcmVhdGVzIGEgc3VicGF0aCBmb3IgZWFjaCBmaWxsZWQgZmFjZSAod2l0aCB0aGUgZGVzaXJlZCBob2xlcykuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogR2VuZXJhbGx5IHNob3VsZCBiZSBjYWxsZWQgb24gYSBncmFwaCBjcmVhdGVkIHdpdGggY3JlYXRlRmlsbGVkU3ViR3JhcGgoKS5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBmYWNlc1RvU2hhcGUoKSB7XHJcbiAgICBjb25zdCBzdWJwYXRocyA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5mYWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgZmFjZSA9IHRoaXMuZmFjZXNbIGkgXTtcclxuICAgICAgaWYgKCBmYWNlLmZpbGxlZCApIHtcclxuICAgICAgICBzdWJwYXRocy5wdXNoKCBmYWNlLmJvdW5kYXJ5LnRvU3VicGF0aCgpICk7XHJcbiAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgZmFjZS5ob2xlcy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICAgIHN1YnBhdGhzLnB1c2goIGZhY2UuaG9sZXNbIGogXS50b1N1YnBhdGgoKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBraXRlLlNoYXBlKCBzdWJwYXRocyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZXMgb3duZWQgb2JqZWN0cyB0byB0aGVpciBwb29scywgYW5kIGNsZWFycyByZWZlcmVuY2VzIHRoYXQgbWF5IGhhdmUgYmVlbiBwaWNrZWQgdXAgZnJvbSBleHRlcm5hbCBzb3VyY2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG5cclxuICAgIC8vIHRoaXMuYm91bmRhcmllcyBzaG91bGQgY29udGFpbiBhbGwgZWxlbWVudHMgb2YgaW5uZXJCb3VuZGFyaWVzIGFuZCBvdXRlckJvdW5kYXJpZXNcclxuICAgIHdoaWxlICggdGhpcy5ib3VuZGFyaWVzLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5ib3VuZGFyaWVzLnBvcCgpLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuICAgIGNsZWFuQXJyYXkoIHRoaXMuaW5uZXJCb3VuZGFyaWVzICk7XHJcbiAgICBjbGVhbkFycmF5KCB0aGlzLm91dGVyQm91bmRhcmllcyApO1xyXG5cclxuICAgIHdoaWxlICggdGhpcy5sb29wcy5sZW5ndGggKSB7XHJcbiAgICAgIHRoaXMubG9vcHMucG9wKCkuZGlzcG9zZSgpO1xyXG4gICAgfVxyXG4gICAgd2hpbGUgKCB0aGlzLmZhY2VzLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5mYWNlcy5wb3AoKS5kaXNwb3NlKCk7XHJcbiAgICB9XHJcbiAgICB3aGlsZSAoIHRoaXMudmVydGljZXMubGVuZ3RoICkge1xyXG4gICAgICB0aGlzLnZlcnRpY2VzLnBvcCgpLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuICAgIHdoaWxlICggdGhpcy5lZGdlcy5sZW5ndGggKSB7XHJcbiAgICAgIHRoaXMuZWRnZXMucG9wKCkuZGlzcG9zZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhbiBlZGdlIHRvIHRoZSBncmFwaCAoYW5kIHNldHMgdXAgY29ubmVjdGlvbiBpbmZvcm1hdGlvbikuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RWRnZX0gZWRnZVxyXG4gICAqL1xyXG4gIGFkZEVkZ2UoIGVkZ2UgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlZGdlIGluc3RhbmNlb2YgRWRnZSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaW5jbHVkZXMoIGVkZ2Uuc3RhcnRWZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXMsIGVkZ2UucmV2ZXJzZWRIYWxmICksICdTaG91bGQgbm90IGFscmVhZHkgYmUgY29ubmVjdGVkJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaW5jbHVkZXMoIGVkZ2UuZW5kVmVydGV4LmluY2lkZW50SGFsZkVkZ2VzLCBlZGdlLmZvcndhcmRIYWxmICksICdTaG91bGQgbm90IGFscmVhZHkgYmUgY29ubmVjdGVkJyApO1xyXG5cclxuICAgIHRoaXMuZWRnZXMucHVzaCggZWRnZSApO1xyXG4gICAgZWRnZS5zdGFydFZlcnRleC5pbmNpZGVudEhhbGZFZGdlcy5wdXNoKCBlZGdlLnJldmVyc2VkSGFsZiApO1xyXG4gICAgZWRnZS5lbmRWZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXMucHVzaCggZWRnZS5mb3J3YXJkSGFsZiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbiBlZGdlIGZyb20gdGhlIGdyYXBoIChhbmQgZGlzY29ubmVjdHMgaW5jaWRlbnQgaW5mb3JtYXRpb24pLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0VkZ2V9IGVkZ2VcclxuICAgKi9cclxuICByZW1vdmVFZGdlKCBlZGdlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZWRnZSBpbnN0YW5jZW9mIEVkZ2UgKTtcclxuXHJcbiAgICBhcnJheVJlbW92ZSggdGhpcy5lZGdlcywgZWRnZSApO1xyXG4gICAgYXJyYXlSZW1vdmUoIGVkZ2Uuc3RhcnRWZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXMsIGVkZ2UucmV2ZXJzZWRIYWxmICk7XHJcbiAgICBhcnJheVJlbW92ZSggZWRnZS5lbmRWZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXMsIGVkZ2UuZm9yd2FyZEhhbGYgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcGxhY2VzIGEgc2luZ2xlIGVkZ2UgKGluIGxvb3BzKSB3aXRoIGEgc2VyaWVzIG9mIGVkZ2VzIChwb3NzaWJseSBlbXB0eSkuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RWRnZX0gZWRnZVxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEhhbGZFZGdlPn0gZm9yd2FyZEhhbGZFZGdlc1xyXG4gICAqL1xyXG4gIHJlcGxhY2VFZGdlSW5Mb29wcyggZWRnZSwgZm9yd2FyZEhhbGZFZGdlcyApIHtcclxuICAgIC8vIENvbXB1dGUgcmV2ZXJzZWQgaGFsZi1lZGdlc1xyXG4gICAgY29uc3QgcmV2ZXJzZWRIYWxmRWRnZXMgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGZvcndhcmRIYWxmRWRnZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHJldmVyc2VkSGFsZkVkZ2VzLnB1c2goIGZvcndhcmRIYWxmRWRnZXNbIGZvcndhcmRIYWxmRWRnZXMubGVuZ3RoIC0gMSAtIGkgXS5nZXRSZXZlcnNlZCgpICk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5sb29wcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgbG9vcCA9IHRoaXMubG9vcHNbIGkgXTtcclxuXHJcbiAgICAgIGZvciAoIGxldCBqID0gbG9vcC5oYWxmRWRnZXMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0gKSB7XHJcbiAgICAgICAgY29uc3QgaGFsZkVkZ2UgPSBsb29wLmhhbGZFZGdlc1sgaiBdO1xyXG5cclxuICAgICAgICBpZiAoIGhhbGZFZGdlLmVkZ2UgPT09IGVkZ2UgKSB7XHJcbiAgICAgICAgICBjb25zdCByZXBsYWNlbWVudEhhbGZFZGdlcyA9IGhhbGZFZGdlID09PSBlZGdlLmZvcndhcmRIYWxmID8gZm9yd2FyZEhhbGZFZGdlcyA6IHJldmVyc2VkSGFsZkVkZ2VzO1xyXG4gICAgICAgICAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseSggbG9vcC5oYWxmRWRnZXMsIFsgaiwgMSBdLmNvbmNhdCggcmVwbGFjZW1lbnRIYWxmRWRnZXMgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZXMgdG8gY29tYmluZSBhZGphY2VudCBlZGdlcyAod2l0aCBhIDItb3JkZXIgdmVydGV4KSBpbnRvIG9uZSBlZGdlIHdoZXJlIHBvc3NpYmxlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBUaGlzIGhlbHBzIHRvIGNvbWJpbmUgdGhpbmdzIGxpa2UgY29sbGluZWFyIGxpbmVzLCB3aGVyZSB0aGVyZSdzIGEgdmVydGV4IHRoYXQgY2FuIGJhc2ljYWxseSBiZSByZW1vdmVkLlxyXG4gICAqL1xyXG4gIGNvbGxhcHNlQWRqYWNlbnRFZGdlcygpIHtcclxuICAgIGxldCBuZWVkc0xvb3AgPSB0cnVlO1xyXG4gICAgd2hpbGUgKCBuZWVkc0xvb3AgKSB7XHJcbiAgICAgIG5lZWRzTG9vcCA9IGZhbHNlO1xyXG5cclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy52ZXJ0aWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCB2ZXJ0ZXggPSB0aGlzLnZlcnRpY2VzWyBpIF07XHJcbiAgICAgICAgaWYgKCB2ZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXMubGVuZ3RoID09PSAyICkge1xyXG4gICAgICAgICAgY29uc3QgYUVkZ2UgPSB2ZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXNbIDAgXS5lZGdlO1xyXG4gICAgICAgICAgY29uc3QgYkVkZ2UgPSB2ZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXNbIDEgXS5lZGdlO1xyXG4gICAgICAgICAgbGV0IGFTZWdtZW50ID0gYUVkZ2Uuc2VnbWVudDtcclxuICAgICAgICAgIGxldCBiU2VnbWVudCA9IGJFZGdlLnNlZ21lbnQ7XHJcbiAgICAgICAgICBjb25zdCBhVmVydGV4ID0gYUVkZ2UuZ2V0T3RoZXJWZXJ0ZXgoIHZlcnRleCApO1xyXG4gICAgICAgICAgY29uc3QgYlZlcnRleCA9IGJFZGdlLmdldE90aGVyVmVydGV4KCB2ZXJ0ZXggKTtcclxuXHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmxvb3BzLmxlbmd0aCA9PT0gMCApO1xyXG5cclxuICAgICAgICAgIC8vIFRPRE86IENhbiB3ZSBhdm9pZCB0aGlzIGluIHRoZSBpbm5lciBsb29wP1xyXG4gICAgICAgICAgaWYgKCBhRWRnZS5zdGFydFZlcnRleCA9PT0gdmVydGV4ICkge1xyXG4gICAgICAgICAgICBhU2VnbWVudCA9IGFTZWdtZW50LnJldmVyc2VkKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoIGJFZGdlLmVuZFZlcnRleCA9PT0gdmVydGV4ICkge1xyXG4gICAgICAgICAgICBiU2VnbWVudCA9IGJTZWdtZW50LnJldmVyc2VkKCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCBhU2VnbWVudCBpbnN0YW5jZW9mIExpbmUgJiYgYlNlZ21lbnQgaW5zdGFuY2VvZiBMaW5lICkge1xyXG4gICAgICAgICAgICAvLyBTZWUgaWYgdGhlIGxpbmVzIGFyZSBjb2xsaW5lYXIsIHNvIHRoYXQgd2UgY2FuIGNvbWJpbmUgdGhlbSBpbnRvIG9uZSBlZGdlXHJcbiAgICAgICAgICAgIGlmICggYVNlZ21lbnQudGFuZ2VudEF0KCAwICkubm9ybWFsaXplZCgpLmRpc3RhbmNlKCBiU2VnbWVudC50YW5nZW50QXQoIDAgKS5ub3JtYWxpemVkKCkgKSA8IDFlLTYgKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFZGdlKCBhRWRnZSApO1xyXG4gICAgICAgICAgICAgIHRoaXMucmVtb3ZlRWRnZSggYkVkZ2UgKTtcclxuICAgICAgICAgICAgICBhRWRnZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgYkVkZ2UuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLnZlcnRpY2VzLCB2ZXJ0ZXggKTtcclxuICAgICAgICAgICAgICB2ZXJ0ZXguZGlzcG9zZSgpO1xyXG5cclxuICAgICAgICAgICAgICBjb25zdCBuZXdTZWdtZW50ID0gbmV3IExpbmUoIGFWZXJ0ZXgucG9pbnQsIGJWZXJ0ZXgucG9pbnQgKTtcclxuICAgICAgICAgICAgICB0aGlzLmFkZEVkZ2UoIG5ldyBFZGdlKCBuZXdTZWdtZW50LCBhVmVydGV4LCBiVmVydGV4ICkgKTtcclxuXHJcbiAgICAgICAgICAgICAgbmVlZHNMb29wID0gdHJ1ZTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyByaWQgb2Ygb3ZlcmxhcHBpbmcgc2VnbWVudHMgYnkgY29tYmluaW5nIG92ZXJsYXBzIGludG8gYSBzaGFyZWQgZWRnZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGVsaW1pbmF0ZU92ZXJsYXAoKSB7XHJcblxyXG4gICAgLy8gV2UnbGwgZXhwYW5kIGJvdW5kcyBieSB0aGlzIGFtb3VudCwgc28gdGhhdCBcImFkamFjZW50XCIgYm91bmRzICh3aXRoIGEgcG90ZW50aWFsbHkgb3ZlcmxhcHBpbmcgdmVydGljYWwgb3JcclxuICAgIC8vIGhvcml6b250YWwgbGluZSkgd2lsbCBoYXZlIGEgbm9uLXplcm8gYW1vdW50IG9mIGFyZWEgb3ZlcmxhcHBpbmcuXHJcbiAgICBjb25zdCBlcHNpbG9uID0gMWUtNDtcclxuXHJcbiAgICAvLyBPdXIgcXVldWUgd2lsbCBzdG9yZSBlbnRyaWVzIG9mIHsgc3RhcnQ6IGJvb2xlYW4sIGVkZ2U6IEVkZ2UgfSwgcmVwcmVzZW50aW5nIGEgc3dlZXAgbGluZSBzaW1pbGFyIHRvIHRoZVxyXG4gICAgLy8gQmVudGxleS1PdHRtYW5uIGFwcHJvYWNoLiBXZSdsbCB0cmFjayB3aGljaCBlZGdlcyBhcmUgcGFzc2luZyB0aHJvdWdoIHRoZSBzd2VlcCBsaW5lLlxyXG4gICAgY29uc3QgcXVldWUgPSBuZXcgd2luZG93LkZsYXRRdWV1ZSgpO1xyXG5cclxuICAgIC8vIFRyYWNrcyB3aGljaCBlZGdlcyBhcmUgdGhyb3VnaCB0aGUgc3dlZXAgbGluZSwgYnV0IGluIGEgZ3JhcGggc3RydWN0dXJlIGxpa2UgYSBzZWdtZW50L2ludGVydmFsIHRyZWUsIHNvIHRoYXQgd2VcclxuICAgIC8vIGNhbiBoYXZlIGZhc3QgbG9va3VwICh3aGF0IGVkZ2VzIGFyZSBpbiBhIGNlcnRhaW4gcmFuZ2UpIGFuZCBhbHNvIGZhc3QgaW5zZXJ0cy9yZW1vdmFscy5cclxuICAgIGNvbnN0IHNlZ21lbnRUcmVlID0gbmV3IEVkZ2VTZWdtZW50VHJlZSggZXBzaWxvbiApO1xyXG5cclxuICAgIC8vIEFzc29ydGVkIG9wZXJhdGlvbnMgdXNlIGEgc2hvcnRjdXQgdG8gXCJ0YWdcIiBlZGdlcyB3aXRoIGEgdW5pcXVlIElELCB0byBpbmRpY2F0ZSBpdCBoYXMgYWxyZWFkeSBiZWVuIHByb2Nlc3NlZFxyXG4gICAgLy8gZm9yIHRoaXMgY2FsbCBvZiBlbGltaW5hdGVPdmVybGFwKCkuIFRoaXMgaXMgYSBoaWdoZXItcGVyZm9ybWFuY2Ugb3B0aW9uIHRvIHN0b3JpbmcgYW4gYXJyYXkgb2YgXCJhbHJlYWR5XHJcbiAgICAvLyBwcm9jZXNzZWRcIiBlZGdlcy5cclxuICAgIGNvbnN0IG5leHRJZCA9IGdsb2JhbElkKys7XHJcblxyXG4gICAgLy8gQWRkcyBhbiBlZGdlIHRvIHRoZSBxdWV1ZVxyXG4gICAgY29uc3QgYWRkVG9RdWV1ZSA9IGVkZ2UgPT4ge1xyXG4gICAgICBjb25zdCBib3VuZHMgPSBlZGdlLnNlZ21lbnQuYm91bmRzO1xyXG5cclxuICAgICAgLy8gVE9ETzogc2VlIGlmIG9iamVjdCBhbGxvY2F0aW9ucyBhcmUgc2xvdyBoZXJlXHJcbiAgICAgIHF1ZXVlLnB1c2goIHsgc3RhcnQ6IHRydWUsIGVkZ2U6IGVkZ2UgfSwgYm91bmRzLm1pblkgLSBlcHNpbG9uICk7XHJcbiAgICAgIHF1ZXVlLnB1c2goIHsgc3RhcnQ6IGZhbHNlLCBlZGdlOiBlZGdlIH0sIGJvdW5kcy5tYXhZICsgZXBzaWxvbiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBSZW1vdmVzIGFuIGVkZ2UgZnJvbSB0aGUgcXVldWUgKGVmZmVjdGl2ZWx5Li4uIHdoZW4gd2UgcG9wIGZyb20gdGhlIHF1ZXVlLCB3ZSdsbCBjaGVjayBpdHMgSUQgZGF0YSwgYW5kIGlmIGl0IHdhc1xyXG4gICAgLy8gXCJyZW1vdmVkXCIgd2Ugd2lsbCBpZ25vcmUgaXQuIEhpZ2hlci1wZXJmb3JtYW5jZSB0aGFuIHVzaW5nIGFuIGFycmF5LlxyXG4gICAgY29uc3QgcmVtb3ZlRnJvbVF1ZXVlID0gZWRnZSA9PiB7XHJcbiAgICAgIC8vIFN0b3JlIHRoZSBJRCBzbyB3ZSBjYW4gaGF2ZSBhIGhpZ2gtcGVyZm9ybWFuY2UgcmVtb3ZhbFxyXG4gICAgICBlZGdlLmludGVybmFsRGF0YS5yZW1vdmVkSWQgPSBuZXh0SWQ7XHJcbiAgICB9O1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZWRnZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGFkZFRvUXVldWUoIHRoaXMuZWRnZXNbIGkgXSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdlIHRyYWNrIGVkZ2VzIHRvIGRpc3Bvc2Ugc2VwYXJhdGVseSwgaW5zdGVhZCBvZiBzeW5jaHJvbm91c2x5IGRpc3Bvc2luZyB0aGVtLiBUaGlzIGlzIG1haW5seSBkdWUgdG8gdGhlIHRyaWNrIG9mXHJcbiAgICAvLyByZW1vdmFsIElEcywgc2luY2UgaWYgd2UgcmUtdXNlZCBwb29sZWQgRWRnZXMgd2hlbiBjcmVhdGluZywgdGhleSB3b3VsZCBzdGlsbCBoYXZlIHRoZSBJRCBPUiB0aGV5IHdvdWxkIGxvc2UgdGhlXHJcbiAgICAvLyBcInJlbW92ZWRcIiBpbmZvcm1hdGlvbi5cclxuICAgIGNvbnN0IGVkZ2VzVG9EaXNwb3NlID0gW107XHJcblxyXG4gICAgd2hpbGUgKCBxdWV1ZS5sZW5ndGggKSB7XHJcbiAgICAgIGNvbnN0IGVudHJ5ID0gcXVldWUucG9wKCk7XHJcbiAgICAgIGNvbnN0IGVkZ2UgPSBlbnRyeS5lZGdlO1xyXG5cclxuICAgICAgLy8gU2tpcCBlZGdlcyB3ZSBhbHJlYWR5IHJlbW92ZWRcclxuICAgICAgaWYgKCBlZGdlLmludGVybmFsRGF0YS5yZW1vdmVkSWQgPT09IG5leHRJZCApIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBlbnRyeS5zdGFydCApIHtcclxuICAgICAgICAvLyBXZSdsbCBiYWlsIG91dCBvZiB0aGUgbG9vcCBpZiB3ZSBmaW5kIG92ZXJsYXBzLCBhbmQgd2UnbGwgc3RvcmUgdGhlIHJlbGV2YW50IGluZm9ybWF0aW9uIGluIHRoZXNlXHJcbiAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IG92ZXJsYXBwZWRFZGdlO1xyXG4gICAgICAgIGxldCBhZGRlZEVkZ2VzO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBJcyB0aGlzIGNsb3N1cmUga2lsbGluZyBwZXJmb3JtYW5jZT9cclxuICAgICAgICBzZWdtZW50VHJlZS5xdWVyeSggZWRnZSwgb3RoZXJFZGdlID0+IHtcclxuICAgICAgICAgIGNvbnN0IG92ZXJsYXBzID0gZWRnZS5zZWdtZW50LmdldE92ZXJsYXBzKCBvdGhlckVkZ2Uuc2VnbWVudCApO1xyXG5cclxuICAgICAgICAgIGlmICggb3ZlcmxhcHMgIT09IG51bGwgJiYgb3ZlcmxhcHMubGVuZ3RoICkge1xyXG4gICAgICAgICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCBvdmVybGFwcy5sZW5ndGg7IGsrKyApIHtcclxuICAgICAgICAgICAgICBjb25zdCBvdmVybGFwID0gb3ZlcmxhcHNbIGsgXTtcclxuICAgICAgICAgICAgICBpZiAoIE1hdGguYWJzKCBvdmVybGFwLnQxIC0gb3ZlcmxhcC50MCApID4gMWUtNSAmJlxyXG4gICAgICAgICAgICAgICAgICAgTWF0aC5hYnMoIG92ZXJsYXAucXQxIC0gb3ZlcmxhcC5xdDAgKSA+IDFlLTUgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgYWRkZWRFZGdlcyA9IHRoaXMuc3BsaXRPdmVybGFwKCBlZGdlLCBvdGhlckVkZ2UsIG92ZXJsYXAgKTtcclxuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIG92ZXJsYXBwZWRFZGdlID0gb3RoZXJFZGdlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgaWYgKCBmb3VuZCApIHtcclxuICAgICAgICAgIC8vIFdlIGhhdmVuJ3QgYWRkZWQgb3VyIGVkZ2UgeWV0LCBzbyBubyBuZWVkIHRvIHJlbW92ZSBpdC5cclxuICAgICAgICAgIHNlZ21lbnRUcmVlLnJlbW92ZUl0ZW0oIG92ZXJsYXBwZWRFZGdlICk7XHJcblxyXG4gICAgICAgICAgLy8gQWRqdXN0IHRoZSBxdWV1ZVxyXG4gICAgICAgICAgcmVtb3ZlRnJvbVF1ZXVlKCBvdmVybGFwcGVkRWRnZSApO1xyXG4gICAgICAgICAgcmVtb3ZlRnJvbVF1ZXVlKCBlZGdlICk7XHJcbiAgICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhZGRlZEVkZ2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgICBhZGRUb1F1ZXVlKCBhZGRlZEVkZ2VzWyBpIF0gKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBlZGdlc1RvRGlzcG9zZS5wdXNoKCBlZGdlICk7XHJcbiAgICAgICAgICBlZGdlc1RvRGlzcG9zZS5wdXNoKCBvdmVybGFwcGVkRWRnZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIE5vIG92ZXJsYXBzIGZvdW5kLCBhZGQgaXQgYW5kIGNvbnRpbnVlXHJcbiAgICAgICAgICBzZWdtZW50VHJlZS5hZGRJdGVtKCBlZGdlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIFJlbW92YWwgY2FuJ3QgdHJpZ2dlciBhbiBpbnRlcnNlY3Rpb24sIHNvIHdlIGNhbiBzYWZlbHkgcmVtb3ZlIGl0XHJcbiAgICAgICAgc2VnbWVudFRyZWUucmVtb3ZlSXRlbSggZWRnZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZWRnZXNUb0Rpc3Bvc2UubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGVkZ2VzVG9EaXNwb3NlWyBpIF0uZGlzcG9zZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3BsaXRzL2NvbWJpbmVzIGVkZ2VzIHdoZW4gdGhlcmUgaXMgYW4gb3ZlcmxhcCBvZiB0d28gZWRnZXMgKHR3byBlZGdlcyB3aG8gaGF2ZSBhbiBpbmZpbml0ZSBudW1iZXIgb2ZcclxuICAgKiBpbnRlcnNlY3Rpb24gcG9pbnRzKS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBkb2VzIE5PVCBkaXNwb3NlIGFFZGdlL2JFZGdlLCBkdWUgdG8gZWxpbWluYXRlT3ZlcmxhcCdzIG5lZWRzLlxyXG4gICAqXHJcbiAgICogR2VuZXJhbGx5IHRoaXMgY3JlYXRlcyBhbiBlZGdlIGZvciB0aGUgXCJzaGFyZWRcIiBwYXJ0IG9mIGJvdGggc2VnbWVudHMsIGFuZCB0aGVuIGNyZWF0ZXMgZWRnZXMgZm9yIHRoZSBwYXJ0c1xyXG4gICAqIG91dHNpZGUgb2YgdGhlIHNoYXJlZCByZWdpb24sIGNvbm5lY3RpbmcgdGhlbSB0b2dldGhlci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RWRnZX0gYUVkZ2VcclxuICAgKiBAcGFyYW0ge0VkZ2V9IGJFZGdlXHJcbiAgICogQHBhcmFtIHtPdmVybGFwfSBvdmVybGFwXHJcbiAgICogQHJldHVybnMge0FycmF5LjxFZGdlPn1cclxuICAgKi9cclxuICBzcGxpdE92ZXJsYXAoIGFFZGdlLCBiRWRnZSwgb3ZlcmxhcCApIHtcclxuICAgIGNvbnN0IG5ld0VkZ2VzID0gW107XHJcblxyXG4gICAgY29uc3QgYVNlZ21lbnQgPSBhRWRnZS5zZWdtZW50O1xyXG4gICAgY29uc3QgYlNlZ21lbnQgPSBiRWRnZS5zZWdtZW50O1xyXG5cclxuICAgIC8vIFJlbW92ZSB0aGUgZWRnZXMgZnJvbSBiZWZvcmVcclxuICAgIHRoaXMucmVtb3ZlRWRnZSggYUVkZ2UgKTtcclxuICAgIHRoaXMucmVtb3ZlRWRnZSggYkVkZ2UgKTtcclxuXHJcbiAgICBsZXQgdDAgPSBvdmVybGFwLnQwO1xyXG4gICAgbGV0IHQxID0gb3ZlcmxhcC50MTtcclxuICAgIGxldCBxdDAgPSBvdmVybGFwLnF0MDtcclxuICAgIGxldCBxdDEgPSBvdmVybGFwLnF0MTtcclxuXHJcbiAgICAvLyBBcHBseSByb3VuZGluZyBzbyB3ZSBkb24ndCBnZW5lcmF0ZSByZWFsbHkgc21hbGwgc2VnbWVudHMgb24gdGhlIGVuZHNcclxuICAgIGlmICggdDAgPCAxZS01ICkgeyB0MCA9IDA7IH1cclxuICAgIGlmICggdDEgPiAxIC0gMWUtNSApIHsgdDEgPSAxOyB9XHJcbiAgICBpZiAoIHF0MCA8IDFlLTUgKSB7IHF0MCA9IDA7IH1cclxuICAgIGlmICggcXQxID4gMSAtIDFlLTUgKSB7IHF0MSA9IDE7IH1cclxuXHJcbiAgICAvLyBXaGV0aGVyIHRoZXJlIHdpbGwgYmUgcmVtYWluaW5nIGVkZ2VzIG9uIGVhY2ggc2lkZS5cclxuICAgIGNvbnN0IGFCZWZvcmUgPSB0MCA+IDAgPyBhU2VnbWVudC5zdWJkaXZpZGVkKCB0MCApWyAwIF0gOiBudWxsO1xyXG4gICAgY29uc3QgYkJlZm9yZSA9IHF0MCA+IDAgPyBiU2VnbWVudC5zdWJkaXZpZGVkKCBxdDAgKVsgMCBdIDogbnVsbDtcclxuICAgIGNvbnN0IGFBZnRlciA9IHQxIDwgMSA/IGFTZWdtZW50LnN1YmRpdmlkZWQoIHQxIClbIDEgXSA6IG51bGw7XHJcbiAgICBjb25zdCBiQWZ0ZXIgPSBxdDEgPCAxID8gYlNlZ21lbnQuc3ViZGl2aWRlZCggcXQxIClbIDEgXSA6IG51bGw7XHJcblxyXG4gICAgbGV0IG1pZGRsZSA9IGFTZWdtZW50O1xyXG4gICAgaWYgKCB0MCA+IDAgKSB7XHJcbiAgICAgIG1pZGRsZSA9IG1pZGRsZS5zdWJkaXZpZGVkKCB0MCApWyAxIF07XHJcbiAgICB9XHJcbiAgICBpZiAoIHQxIDwgMSApIHtcclxuICAgICAgbWlkZGxlID0gbWlkZGxlLnN1YmRpdmlkZWQoIFV0aWxzLmxpbmVhciggdDAsIDEsIDAsIDEsIHQxICkgKVsgMCBdO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBiZWZvcmVWZXJ0ZXg7XHJcbiAgICBpZiAoIGFCZWZvcmUgJiYgYkJlZm9yZSApIHtcclxuICAgICAgYmVmb3JlVmVydGV4ID0gVmVydGV4LnBvb2wuY3JlYXRlKCBtaWRkbGUuc3RhcnQgKTtcclxuICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKCBiZWZvcmVWZXJ0ZXggKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBhQmVmb3JlICkge1xyXG4gICAgICBiZWZvcmVWZXJ0ZXggPSBvdmVybGFwLmEgPiAwID8gYkVkZ2Uuc3RhcnRWZXJ0ZXggOiBiRWRnZS5lbmRWZXJ0ZXg7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgYmVmb3JlVmVydGV4ID0gYUVkZ2Uuc3RhcnRWZXJ0ZXg7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGFmdGVyVmVydGV4O1xyXG4gICAgaWYgKCBhQWZ0ZXIgJiYgYkFmdGVyICkge1xyXG4gICAgICBhZnRlclZlcnRleCA9IFZlcnRleC5wb29sLmNyZWF0ZSggbWlkZGxlLmVuZCApO1xyXG4gICAgICB0aGlzLnZlcnRpY2VzLnB1c2goIGFmdGVyVmVydGV4ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggYUFmdGVyICkge1xyXG4gICAgICBhZnRlclZlcnRleCA9IG92ZXJsYXAuYSA+IDAgPyBiRWRnZS5lbmRWZXJ0ZXggOiBiRWRnZS5zdGFydFZlcnRleDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhZnRlclZlcnRleCA9IGFFZGdlLmVuZFZlcnRleDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtaWRkbGVFZGdlID0gRWRnZS5wb29sLmNyZWF0ZSggbWlkZGxlLCBiZWZvcmVWZXJ0ZXgsIGFmdGVyVmVydGV4ICk7XHJcbiAgICBuZXdFZGdlcy5wdXNoKCBtaWRkbGVFZGdlICk7XHJcblxyXG4gICAgbGV0IGFCZWZvcmVFZGdlO1xyXG4gICAgbGV0IGFBZnRlckVkZ2U7XHJcbiAgICBsZXQgYkJlZm9yZUVkZ2U7XHJcbiAgICBsZXQgYkFmdGVyRWRnZTtcclxuXHJcbiAgICAvLyBBZGQgXCJsZWZ0b3ZlclwiIGVkZ2VzXHJcbiAgICBpZiAoIGFCZWZvcmUgKSB7XHJcbiAgICAgIGFCZWZvcmVFZGdlID0gRWRnZS5wb29sLmNyZWF0ZSggYUJlZm9yZSwgYUVkZ2Uuc3RhcnRWZXJ0ZXgsIGJlZm9yZVZlcnRleCApO1xyXG4gICAgICBuZXdFZGdlcy5wdXNoKCBhQmVmb3JlRWRnZSApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBhQWZ0ZXIgKSB7XHJcbiAgICAgIGFBZnRlckVkZ2UgPSBFZGdlLnBvb2wuY3JlYXRlKCBhQWZ0ZXIsIGFmdGVyVmVydGV4LCBhRWRnZS5lbmRWZXJ0ZXggKTtcclxuICAgICAgbmV3RWRnZXMucHVzaCggYUFmdGVyRWRnZSApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBiQmVmb3JlICkge1xyXG4gICAgICBiQmVmb3JlRWRnZSA9IEVkZ2UucG9vbC5jcmVhdGUoIGJCZWZvcmUsIGJFZGdlLnN0YXJ0VmVydGV4LCBvdmVybGFwLmEgPiAwID8gYmVmb3JlVmVydGV4IDogYWZ0ZXJWZXJ0ZXggKTtcclxuICAgICAgbmV3RWRnZXMucHVzaCggYkJlZm9yZUVkZ2UgKTtcclxuICAgIH1cclxuICAgIGlmICggYkFmdGVyICkge1xyXG4gICAgICBiQWZ0ZXJFZGdlID0gRWRnZS5wb29sLmNyZWF0ZSggYkFmdGVyLCBvdmVybGFwLmEgPiAwID8gYWZ0ZXJWZXJ0ZXggOiBiZWZvcmVWZXJ0ZXgsIGJFZGdlLmVuZFZlcnRleCApO1xyXG4gICAgICBuZXdFZGdlcy5wdXNoKCBiQWZ0ZXJFZGdlICk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbmV3RWRnZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuYWRkRWRnZSggbmV3RWRnZXNbIGkgXSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENvbGxlY3QgXCJyZXBsYWNlbWVudFwiIGVkZ2VzXHJcbiAgICBjb25zdCBhRWRnZXMgPSAoIGFCZWZvcmUgPyBbIGFCZWZvcmVFZGdlIF0gOiBbXSApLmNvbmNhdCggWyBtaWRkbGVFZGdlIF0gKS5jb25jYXQoIGFBZnRlciA/IFsgYUFmdGVyRWRnZSBdIDogW10gKTtcclxuICAgIGNvbnN0IGJFZGdlcyA9ICggYkJlZm9yZSA/IFsgYkJlZm9yZUVkZ2UgXSA6IFtdICkuY29uY2F0KCBbIG1pZGRsZUVkZ2UgXSApLmNvbmNhdCggYkFmdGVyID8gWyBiQWZ0ZXJFZGdlIF0gOiBbXSApO1xyXG5cclxuICAgIGNvbnN0IGFGb3J3YXJkSGFsZkVkZ2VzID0gW107XHJcbiAgICBjb25zdCBiRm9yd2FyZEhhbGZFZGdlcyA9IFtdO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGFFZGdlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgYUZvcndhcmRIYWxmRWRnZXMucHVzaCggYUVkZ2VzWyBpIF0uZm9yd2FyZEhhbGYgKTtcclxuICAgIH1cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJFZGdlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgLy8gSGFuZGxlIHJldmVyc2luZyB0aGUgXCJtaWRkbGVcIiBlZGdlXHJcbiAgICAgIGNvbnN0IGlzRm9yd2FyZCA9IGJFZGdlc1sgaSBdICE9PSBtaWRkbGVFZGdlIHx8IG92ZXJsYXAuYSA+IDA7XHJcbiAgICAgIGJGb3J3YXJkSGFsZkVkZ2VzLnB1c2goIGlzRm9yd2FyZCA/IGJFZGdlc1sgaSBdLmZvcndhcmRIYWxmIDogYkVkZ2VzWyBpIF0ucmV2ZXJzZWRIYWxmICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVwbGFjZSBlZGdlcyBpbiB0aGUgbG9vcHNcclxuICAgIHRoaXMucmVwbGFjZUVkZ2VJbkxvb3BzKCBhRWRnZSwgYUZvcndhcmRIYWxmRWRnZXMgKTtcclxuICAgIHRoaXMucmVwbGFjZUVkZ2VJbkxvb3BzKCBiRWRnZSwgYkZvcndhcmRIYWxmRWRnZXMgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3RWRnZXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIHNwbGl0dGluZyBvZiBzZWxmLWludGVyc2VjdGlvbiBvZiBzZWdtZW50cyAoaGFwcGVucyB3aXRoIEN1YmljcykuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBlbGltaW5hdGVTZWxmSW50ZXJzZWN0aW9uKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ib3VuZGFyaWVzLmxlbmd0aCA9PT0gMCwgJ09ubHkgaGFuZGxlcyBzaW1wbGVyIGxldmVsIHByaW1pdGl2ZSBzcGxpdHRpbmcgcmlnaHQgbm93JyApO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gdGhpcy5lZGdlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgY29uc3QgZWRnZSA9IHRoaXMuZWRnZXNbIGkgXTtcclxuICAgICAgY29uc3Qgc2VnbWVudCA9IGVkZ2Uuc2VnbWVudDtcclxuXHJcbiAgICAgIGlmICggc2VnbWVudCBpbnN0YW5jZW9mIEN1YmljICkge1xyXG4gICAgICAgIC8vIFRPRE86IFRoaXMgbWlnaHQgbm90IHByb3Blcmx5IGhhbmRsZSB3aGVuIGl0IG9ubHkgb25lIGVuZHBvaW50IGlzIG9uIHRoZSBjdXJ2ZVxyXG4gICAgICAgIGNvbnN0IHNlbGZJbnRlcnNlY3Rpb24gPSBzZWdtZW50LmdldFNlbGZJbnRlcnNlY3Rpb24oKTtcclxuXHJcbiAgICAgICAgaWYgKCBzZWxmSW50ZXJzZWN0aW9uICkge1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2VsZkludGVyc2VjdGlvbi5hVCA8IHNlbGZJbnRlcnNlY3Rpb24uYlQgKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBzZWdtZW50cyA9IHNlZ21lbnQuc3ViZGl2aXNpb25zKCBbIHNlbGZJbnRlcnNlY3Rpb24uYVQsIHNlbGZJbnRlcnNlY3Rpb24uYlQgXSApO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHZlcnRleCA9IFZlcnRleC5wb29sLmNyZWF0ZSggc2VsZkludGVyc2VjdGlvbi5wb2ludCApO1xyXG4gICAgICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKCB2ZXJ0ZXggKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBzdGFydEVkZ2UgPSBFZGdlLnBvb2wuY3JlYXRlKCBzZWdtZW50c1sgMCBdLCBlZGdlLnN0YXJ0VmVydGV4LCB2ZXJ0ZXggKTtcclxuICAgICAgICAgIGNvbnN0IG1pZGRsZUVkZ2UgPSBFZGdlLnBvb2wuY3JlYXRlKCBzZWdtZW50c1sgMSBdLCB2ZXJ0ZXgsIHZlcnRleCApO1xyXG4gICAgICAgICAgY29uc3QgZW5kRWRnZSA9IEVkZ2UucG9vbC5jcmVhdGUoIHNlZ21lbnRzWyAyIF0sIHZlcnRleCwgZWRnZS5lbmRWZXJ0ZXggKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUVkZ2UoIGVkZ2UgKTtcclxuXHJcbiAgICAgICAgICB0aGlzLmFkZEVkZ2UoIHN0YXJ0RWRnZSApO1xyXG4gICAgICAgICAgdGhpcy5hZGRFZGdlKCBtaWRkbGVFZGdlICk7XHJcbiAgICAgICAgICB0aGlzLmFkZEVkZ2UoIGVuZEVkZ2UgKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnJlcGxhY2VFZGdlSW5Mb29wcyggZWRnZSwgWyBzdGFydEVkZ2UuZm9yd2FyZEhhbGYsIG1pZGRsZUVkZ2UuZm9yd2FyZEhhbGYsIGVuZEVkZ2UuZm9yd2FyZEhhbGYgXSApO1xyXG5cclxuICAgICAgICAgIGVkZ2UuZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVwbGFjZSBpbnRlcnNlY3Rpb25zIGJldHdlZW4gZGlmZmVyZW50IHNlZ21lbnRzIGJ5IHNwbGl0dGluZyB0aGVtIGFuZCBjcmVhdGluZyBhIHZlcnRleC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGVsaW1pbmF0ZUludGVyc2VjdGlvbigpIHtcclxuXHJcbiAgICAvLyBXZSdsbCBleHBhbmQgYm91bmRzIGJ5IHRoaXMgYW1vdW50LCBzbyB0aGF0IFwiYWRqYWNlbnRcIiBib3VuZHMgKHdpdGggYSBwb3RlbnRpYWxseSBvdmVybGFwcGluZyB2ZXJ0aWNhbCBvclxyXG4gICAgLy8gaG9yaXpvbnRhbCBsaW5lKSB3aWxsIGhhdmUgYSBub24temVybyBhbW91bnQgb2YgYXJlYSBvdmVybGFwcGluZy5cclxuICAgIGNvbnN0IGVwc2lsb24gPSAxZS00O1xyXG5cclxuICAgIC8vIE91ciBxdWV1ZSB3aWxsIHN0b3JlIGVudHJpZXMgb2YgeyBzdGFydDogYm9vbGVhbiwgZWRnZTogRWRnZSB9LCByZXByZXNlbnRpbmcgYSBzd2VlcCBsaW5lIHNpbWlsYXIgdG8gdGhlXHJcbiAgICAvLyBCZW50bGV5LU90dG1hbm4gYXBwcm9hY2guIFdlJ2xsIHRyYWNrIHdoaWNoIGVkZ2VzIGFyZSBwYXNzaW5nIHRocm91Z2ggdGhlIHN3ZWVwIGxpbmUuXHJcbiAgICBjb25zdCBxdWV1ZSA9IG5ldyB3aW5kb3cuRmxhdFF1ZXVlKCk7XHJcblxyXG4gICAgLy8gVHJhY2tzIHdoaWNoIGVkZ2VzIGFyZSB0aHJvdWdoIHRoZSBzd2VlcCBsaW5lLCBidXQgaW4gYSBncmFwaCBzdHJ1Y3R1cmUgbGlrZSBhIHNlZ21lbnQvaW50ZXJ2YWwgdHJlZSwgc28gdGhhdCB3ZVxyXG4gICAgLy8gY2FuIGhhdmUgZmFzdCBsb29rdXAgKHdoYXQgZWRnZXMgYXJlIGluIGEgY2VydGFpbiByYW5nZSkgYW5kIGFsc28gZmFzdCBpbnNlcnRzL3JlbW92YWxzLlxyXG4gICAgY29uc3Qgc2VnbWVudFRyZWUgPSBuZXcgRWRnZVNlZ21lbnRUcmVlKCBlcHNpbG9uICk7XHJcblxyXG4gICAgLy8gQXNzb3J0ZWQgb3BlcmF0aW9ucyB1c2UgYSBzaG9ydGN1dCB0byBcInRhZ1wiIGVkZ2VzIHdpdGggYSB1bmlxdWUgSUQsIHRvIGluZGljYXRlIGl0IGhhcyBhbHJlYWR5IGJlZW4gcHJvY2Vzc2VkXHJcbiAgICAvLyBmb3IgdGhpcyBjYWxsIG9mIGVsaW1pbmF0ZU92ZXJsYXAoKS4gVGhpcyBpcyBhIGhpZ2hlci1wZXJmb3JtYW5jZSBvcHRpb24gdG8gc3RvcmluZyBhbiBhcnJheSBvZiBcImFscmVhZHlcclxuICAgIC8vIHByb2Nlc3NlZFwiIGVkZ2VzLlxyXG4gICAgY29uc3QgbmV4dElkID0gZ2xvYmFsSWQrKztcclxuXHJcbiAgICAvLyBBZGRzIGFuIGVkZ2UgdG8gdGhlIHF1ZXVlXHJcbiAgICBjb25zdCBhZGRUb1F1ZXVlID0gZWRnZSA9PiB7XHJcbiAgICAgIGNvbnN0IGJvdW5kcyA9IGVkZ2Uuc2VnbWVudC5ib3VuZHM7XHJcblxyXG4gICAgICAvLyBUT0RPOiBzZWUgaWYgb2JqZWN0IGFsbG9jYXRpb25zIGFyZSBzbG93IGhlcmVcclxuICAgICAgcXVldWUucHVzaCggeyBzdGFydDogdHJ1ZSwgZWRnZTogZWRnZSB9LCBib3VuZHMubWluWSAtIGVwc2lsb24gKTtcclxuICAgICAgcXVldWUucHVzaCggeyBzdGFydDogZmFsc2UsIGVkZ2U6IGVkZ2UgfSwgYm91bmRzLm1heFkgKyBlcHNpbG9uICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFJlbW92ZXMgYW4gZWRnZSBmcm9tIHRoZSBxdWV1ZSAoZWZmZWN0aXZlbHkuLi4gd2hlbiB3ZSBwb3AgZnJvbSB0aGUgcXVldWUsIHdlJ2xsIGNoZWNrIGl0cyBJRCBkYXRhLCBhbmQgaWYgaXQgd2FzXHJcbiAgICAvLyBcInJlbW92ZWRcIiB3ZSB3aWxsIGlnbm9yZSBpdC4gSGlnaGVyLXBlcmZvcm1hbmNlIHRoYW4gdXNpbmcgYW4gYXJyYXkuXHJcbiAgICBjb25zdCByZW1vdmVGcm9tUXVldWUgPSBlZGdlID0+IHtcclxuICAgICAgLy8gU3RvcmUgdGhlIElEIHNvIHdlIGNhbiBoYXZlIGEgaGlnaC1wZXJmb3JtYW5jZSByZW1vdmFsXHJcbiAgICAgIGVkZ2UuaW50ZXJuYWxEYXRhLnJlbW92ZWRJZCA9IG5leHRJZDtcclxuICAgIH07XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5lZGdlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgYWRkVG9RdWV1ZSggdGhpcy5lZGdlc1sgaSBdICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2UgdHJhY2sgZWRnZXMgdG8gZGlzcG9zZSBzZXBhcmF0ZWx5LCBpbnN0ZWFkIG9mIHN5bmNocm9ub3VzbHkgZGlzcG9zaW5nIHRoZW0uIFRoaXMgaXMgbWFpbmx5IGR1ZSB0byB0aGUgdHJpY2sgb2ZcclxuICAgIC8vIHJlbW92YWwgSURzLCBzaW5jZSBpZiB3ZSByZS11c2VkIHBvb2xlZCBFZGdlcyB3aGVuIGNyZWF0aW5nLCB0aGV5IHdvdWxkIHN0aWxsIGhhdmUgdGhlIElEIE9SIHRoZXkgd291bGQgbG9zZSB0aGVcclxuICAgIC8vIFwicmVtb3ZlZFwiIGluZm9ybWF0aW9uLlxyXG4gICAgY29uc3QgZWRnZXNUb0Rpc3Bvc2UgPSBbXTtcclxuXHJcbiAgICB3aGlsZSAoIHF1ZXVlLmxlbmd0aCApIHtcclxuICAgICAgY29uc3QgZW50cnkgPSBxdWV1ZS5wb3AoKTtcclxuICAgICAgY29uc3QgZWRnZSA9IGVudHJ5LmVkZ2U7XHJcblxyXG4gICAgICAvLyBTa2lwIGVkZ2VzIHdlIGFscmVhZHkgcmVtb3ZlZFxyXG4gICAgICBpZiAoIGVkZ2UuaW50ZXJuYWxEYXRhLnJlbW92ZWRJZCA9PT0gbmV4dElkICkge1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIGVudHJ5LnN0YXJ0ICkge1xyXG4gICAgICAgIC8vIFdlJ2xsIGJhaWwgb3V0IG9mIHRoZSBsb29wIGlmIHdlIGZpbmQgb3ZlcmxhcHMsIGFuZCB3ZSdsbCBzdG9yZSB0aGUgcmVsZXZhbnQgaW5mb3JtYXRpb24gaW4gdGhlc2VcclxuICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICBsZXQgb3ZlcmxhcHBlZEVkZ2U7XHJcbiAgICAgICAgbGV0IGFkZGVkRWRnZXM7XHJcbiAgICAgICAgbGV0IHJlbW92ZWRFZGdlcztcclxuXHJcbiAgICAgICAgLy8gVE9ETzogSXMgdGhpcyBjbG9zdXJlIGtpbGxpbmcgcGVyZm9ybWFuY2U/XHJcbiAgICAgICAgc2VnbWVudFRyZWUucXVlcnkoIGVkZ2UsIG90aGVyRWRnZSA9PiB7XHJcblxyXG4gICAgICAgICAgY29uc3QgYVNlZ21lbnQgPSBlZGdlLnNlZ21lbnQ7XHJcbiAgICAgICAgICBjb25zdCBiU2VnbWVudCA9IG90aGVyRWRnZS5zZWdtZW50O1xyXG4gICAgICAgICAgbGV0IGludGVyc2VjdGlvbnMgPSBTZWdtZW50LmludGVyc2VjdCggYVNlZ21lbnQsIGJTZWdtZW50ICk7XHJcbiAgICAgICAgICBpbnRlcnNlY3Rpb25zID0gaW50ZXJzZWN0aW9ucy5maWx0ZXIoIGludGVyc2VjdGlvbiA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFUID0gaW50ZXJzZWN0aW9uLmFUO1xyXG4gICAgICAgICAgICBjb25zdCBiVCA9IGludGVyc2VjdGlvbi5iVDtcclxuICAgICAgICAgICAgY29uc3QgYUludGVybmFsID0gYVQgPiAxZS01ICYmIGFUIDwgKCAxIC0gMWUtNSApO1xyXG4gICAgICAgICAgICBjb25zdCBiSW50ZXJuYWwgPSBiVCA+IDFlLTUgJiYgYlQgPCAoIDEgLSAxZS01ICk7XHJcbiAgICAgICAgICAgIHJldHVybiBhSW50ZXJuYWwgfHwgYkludGVybmFsO1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgICAgaWYgKCBpbnRlcnNlY3Rpb25zLmxlbmd0aCApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE86IEluIHRoZSBmdXR1cmUsIGhhbmRsZSBtdWx0aXBsZSBpbnRlcnNlY3Rpb25zIChpbnN0ZWFkIG9mIHJlLXJ1bm5pbmcpXHJcbiAgICAgICAgICAgIGNvbnN0IGludGVyc2VjdGlvbiA9IGludGVyc2VjdGlvbnNbIDAgXTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuc2ltcGxlU3BsaXQoIGVkZ2UsIG90aGVyRWRnZSwgaW50ZXJzZWN0aW9uLmFULCBpbnRlcnNlY3Rpb24uYlQsIGludGVyc2VjdGlvbi5wb2ludCApO1xyXG5cclxuICAgICAgICAgICAgaWYgKCByZXN1bHQgKSB7XHJcbiAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIG92ZXJsYXBwZWRFZGdlID0gb3RoZXJFZGdlO1xyXG4gICAgICAgICAgICAgIGFkZGVkRWRnZXMgPSByZXN1bHQuYWRkZWRFZGdlcztcclxuICAgICAgICAgICAgICByZW1vdmVkRWRnZXMgPSByZXN1bHQucmVtb3ZlZEVkZ2VzO1xyXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgaWYgKCBmb3VuZCApIHtcclxuICAgICAgICAgIC8vIElmIHdlIGRpZG4ndCBcInJlbW92ZVwiIHRoYXQgZWRnZSwgd2UnbGwgc3RpbGwgbmVlZCB0byBhZGQgaXQgaW4uXHJcbiAgICAgICAgICBpZiAoIHJlbW92ZWRFZGdlcy5pbmNsdWRlcyggZWRnZSApICkge1xyXG4gICAgICAgICAgICByZW1vdmVGcm9tUXVldWUoIGVkZ2UgKTtcclxuICAgICAgICAgICAgZWRnZXNUb0Rpc3Bvc2UucHVzaCggZWRnZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlZ21lbnRUcmVlLmFkZEl0ZW0oIGVkZ2UgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICggcmVtb3ZlZEVkZ2VzLmluY2x1ZGVzKCBvdmVybGFwcGVkRWRnZSApICkge1xyXG4gICAgICAgICAgICBzZWdtZW50VHJlZS5yZW1vdmVJdGVtKCBvdmVybGFwcGVkRWRnZSApO1xyXG4gICAgICAgICAgICByZW1vdmVGcm9tUXVldWUoIG92ZXJsYXBwZWRFZGdlICk7XHJcbiAgICAgICAgICAgIGVkZ2VzVG9EaXNwb3NlLnB1c2goIG92ZXJsYXBwZWRFZGdlICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gQWRqdXN0IHRoZSBxdWV1ZVxyXG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYWRkZWRFZGdlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgICAgYWRkVG9RdWV1ZSggYWRkZWRFZGdlc1sgaSBdICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgLy8gTm8gb3ZlcmxhcHMgZm91bmQsIGFkZCBpdCBhbmQgY29udGludWVcclxuICAgICAgICAgIHNlZ21lbnRUcmVlLmFkZEl0ZW0oIGVkZ2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gUmVtb3ZhbCBjYW4ndCB0cmlnZ2VyIGFuIGludGVyc2VjdGlvbiwgc28gd2UgY2FuIHNhZmVseSByZW1vdmUgaXRcclxuICAgICAgICBzZWdtZW50VHJlZS5yZW1vdmVJdGVtKCBlZGdlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBlZGdlc1RvRGlzcG9zZS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgZWRnZXNUb0Rpc3Bvc2VbIGkgXS5kaXNwb3NlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIHNwbGl0dGluZyB0d28gaW50ZXJzZWN0aW5nIGVkZ2VzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0VkZ2V9IGFFZGdlXHJcbiAgICogQHBhcmFtIHtFZGdlfSBiRWRnZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhVCAtIFBhcmFtZXRyaWMgdCB2YWx1ZSBvZiB0aGUgaW50ZXJzZWN0aW9uIGZvciBhRWRnZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiVCAtIFBhcmFtZXRyaWMgdCB2YWx1ZSBvZiB0aGUgaW50ZXJzZWN0aW9uIGZvciBiRWRnZVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9pbnQgLSBMb2NhdGlvbiBvZiB0aGUgaW50ZXJzZWN0aW9uXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7e2FkZGVkRWRnZXM6IEVkZ2VbXSwgcmVtb3ZlZEVkZ2VzOiBFZGdlW119fG51bGx9XHJcbiAgICovXHJcbiAgc2ltcGxlU3BsaXQoIGFFZGdlLCBiRWRnZSwgYVQsIGJULCBwb2ludCApIHtcclxuICAgIGNvbnN0IGFJbnRlcm5hbCA9IGFUID4gMWUtNiAmJiBhVCA8ICggMSAtIDFlLTYgKTtcclxuICAgIGNvbnN0IGJJbnRlcm5hbCA9IGJUID4gMWUtNiAmJiBiVCA8ICggMSAtIDFlLTYgKTtcclxuXHJcbiAgICBsZXQgdmVydGV4ID0gbnVsbDtcclxuICAgIGlmICggIWFJbnRlcm5hbCApIHtcclxuICAgICAgdmVydGV4ID0gYVQgPCAwLjUgPyBhRWRnZS5zdGFydFZlcnRleCA6IGFFZGdlLmVuZFZlcnRleDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCAhYkludGVybmFsICkge1xyXG4gICAgICB2ZXJ0ZXggPSBiVCA8IDAuNSA/IGJFZGdlLnN0YXJ0VmVydGV4IDogYkVkZ2UuZW5kVmVydGV4O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHZlcnRleCA9IFZlcnRleC5wb29sLmNyZWF0ZSggcG9pbnQgKTtcclxuICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKCB2ZXJ0ZXggKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgY29uc3QgYWRkZWRFZGdlcyA9IFtdO1xyXG4gICAgY29uc3QgcmVtb3ZlZEVkZ2VzID0gW107XHJcblxyXG4gICAgaWYgKCBhSW50ZXJuYWwgJiYgdmVydGV4ICE9PSBhRWRnZS5zdGFydFZlcnRleCAmJiB2ZXJ0ZXggIT09IGFFZGdlLmVuZFZlcnRleCApIHtcclxuICAgICAgYWRkZWRFZGdlcy5wdXNoKCAuLi50aGlzLnNwbGl0RWRnZSggYUVkZ2UsIGFULCB2ZXJ0ZXggKSApO1xyXG4gICAgICByZW1vdmVkRWRnZXMucHVzaCggYUVkZ2UgKTtcclxuICAgICAgY2hhbmdlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAoIGJJbnRlcm5hbCAmJiB2ZXJ0ZXggIT09IGJFZGdlLnN0YXJ0VmVydGV4ICYmIHZlcnRleCAhPT0gYkVkZ2UuZW5kVmVydGV4ICkge1xyXG4gICAgICBhZGRlZEVkZ2VzLnB1c2goIC4uLnRoaXMuc3BsaXRFZGdlKCBiRWRnZSwgYlQsIHZlcnRleCApICk7XHJcbiAgICAgIHJlbW92ZWRFZGdlcy5wdXNoKCBiRWRnZSApO1xyXG4gICAgICBjaGFuZ2VkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY2hhbmdlZCA/IHtcclxuICAgICAgYWRkZWRFZGdlczogYWRkZWRFZGdlcyxcclxuICAgICAgcmVtb3ZlZEVkZ2VzOiByZW1vdmVkRWRnZXNcclxuICAgIH0gOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3BsaXRzIGFuIGVkZ2UgaW50byB0d28gZWRnZXMgYXQgYSBzcGVjaWZpYyBwYXJhbWV0cmljIHQgdmFsdWUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RWRnZX0gZWRnZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0XHJcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IHZlcnRleCAtIFRoZSB2ZXJ0ZXggdGhhdCBpcyBwbGFjZWQgYXQgdGhlIHNwbGl0IGxvY2F0aW9uXHJcbiAgICovXHJcbiAgc3BsaXRFZGdlKCBlZGdlLCB0LCB2ZXJ0ZXggKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmJvdW5kYXJpZXMubGVuZ3RoID09PSAwLCAnT25seSBoYW5kbGVzIHNpbXBsZXIgbGV2ZWwgcHJpbWl0aXZlIHNwbGl0dGluZyByaWdodCBub3cnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlZGdlLnN0YXJ0VmVydGV4ICE9PSB2ZXJ0ZXggKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVkZ2UuZW5kVmVydGV4ICE9PSB2ZXJ0ZXggKTtcclxuXHJcbiAgICBjb25zdCBzZWdtZW50cyA9IGVkZ2Uuc2VnbWVudC5zdWJkaXZpZGVkKCB0ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWdtZW50cy5sZW5ndGggPT09IDIgKTtcclxuXHJcbiAgICBjb25zdCBmaXJzdEVkZ2UgPSBFZGdlLnBvb2wuY3JlYXRlKCBzZWdtZW50c1sgMCBdLCBlZGdlLnN0YXJ0VmVydGV4LCB2ZXJ0ZXggKTtcclxuICAgIGNvbnN0IHNlY29uZEVkZ2UgPSBFZGdlLnBvb2wuY3JlYXRlKCBzZWdtZW50c1sgMSBdLCB2ZXJ0ZXgsIGVkZ2UuZW5kVmVydGV4ICk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIG9sZCBjb25uZWN0aW9uc1xyXG4gICAgdGhpcy5yZW1vdmVFZGdlKCBlZGdlICk7XHJcblxyXG4gICAgLy8gQWRkIG5ldyBjb25uZWN0aW9uc1xyXG4gICAgdGhpcy5hZGRFZGdlKCBmaXJzdEVkZ2UgKTtcclxuICAgIHRoaXMuYWRkRWRnZSggc2Vjb25kRWRnZSApO1xyXG5cclxuICAgIHRoaXMucmVwbGFjZUVkZ2VJbkxvb3BzKCBlZGdlLCBbIGZpcnN0RWRnZS5mb3J3YXJkSGFsZiwgc2Vjb25kRWRnZS5mb3J3YXJkSGFsZiBdICk7XHJcblxyXG4gICAgcmV0dXJuIFsgZmlyc3RFZGdlLCBzZWNvbmRFZGdlIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21iaW5lIHZlcnRpY2VzIHRoYXQgYXJlIGFsbW9zdCBleGFjdGx5IGluIHRoZSBzYW1lIHBsYWNlIChyZW1vdmluZyBlZGdlcyBhbmQgdmVydGljZXMgd2hlcmUgbmVjZXNzYXJ5KS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGNvbGxhcHNlVmVydGljZXMoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCB0aGlzLmVkZ2VzLCBlZGdlID0+IF8uaW5jbHVkZXMoIHRoaXMudmVydGljZXMsIGVkZ2Uuc3RhcnRWZXJ0ZXggKSApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCB0aGlzLmVkZ2VzLCBlZGdlID0+IF8uaW5jbHVkZXMoIHRoaXMudmVydGljZXMsIGVkZ2UuZW5kVmVydGV4ICkgKSApO1xyXG5cclxuICAgIC8vIFdlJ2xsIGV4cGFuZCBib3VuZHMgYnkgdGhpcyBhbW91bnQsIHNvIHRoYXQgXCJhZGphY2VudFwiIGJvdW5kcyAod2l0aCBhIHBvdGVudGlhbGx5IG92ZXJsYXBwaW5nIHZlcnRpY2FsIG9yXHJcbiAgICAvLyBob3Jpem9udGFsIGxpbmUpIHdpbGwgaGF2ZSBhIG5vbi16ZXJvIGFtb3VudCBvZiBhcmVhIG92ZXJsYXBwaW5nLlxyXG4gICAgY29uc3QgZXBzaWxvbiA9IDFlLTQ7XHJcblxyXG4gICAgLy8gT3VyIHF1ZXVlIHdpbGwgc3RvcmUgZW50cmllcyBvZiB7IHN0YXJ0OiBib29sZWFuLCB2ZXJ0ZXg6IFZlcnRleCB9LCByZXByZXNlbnRpbmcgYSBzd2VlcCBsaW5lIHNpbWlsYXIgdG8gdGhlXHJcbiAgICAvLyBCZW50bGV5LU90dG1hbm4gYXBwcm9hY2guIFdlJ2xsIHRyYWNrIHdoaWNoIGVkZ2VzIGFyZSBwYXNzaW5nIHRocm91Z2ggdGhlIHN3ZWVwIGxpbmUuXHJcbiAgICBjb25zdCBxdWV1ZSA9IG5ldyB3aW5kb3cuRmxhdFF1ZXVlKCk7XHJcblxyXG4gICAgLy8gVHJhY2tzIHdoaWNoIHZlcnRpY2VzIGFyZSB0aHJvdWdoIHRoZSBzd2VlcCBsaW5lLCBidXQgaW4gYSBncmFwaCBzdHJ1Y3R1cmUgbGlrZSBhIHNlZ21lbnQvaW50ZXJ2YWwgdHJlZSwgc28gdGhhdFxyXG4gICAgLy8gd2UgY2FuIGhhdmUgZmFzdCBsb29rdXAgKHdoYXQgdmVydGljZXMgYXJlIGluIGEgY2VydGFpbiByYW5nZSkgYW5kIGFsc28gZmFzdCBpbnNlcnRzL3JlbW92YWxzLlxyXG4gICAgY29uc3Qgc2VnbWVudFRyZWUgPSBuZXcgVmVydGV4U2VnbWVudFRyZWUoIGVwc2lsb24gKTtcclxuXHJcbiAgICAvLyBBc3NvcnRlZCBvcGVyYXRpb25zIHVzZSBhIHNob3J0Y3V0IHRvIFwidGFnXCIgdmVydGljZXMgd2l0aCBhIHVuaXF1ZSBJRCwgdG8gaW5kaWNhdGUgaXQgaGFzIGFscmVhZHkgYmVlbiBwcm9jZXNzZWRcclxuICAgIC8vIGZvciB0aGlzIGNhbGwgb2YgZWxpbWluYXRlT3ZlcmxhcCgpLiBUaGlzIGlzIGEgaGlnaGVyLXBlcmZvcm1hbmNlIG9wdGlvbiB0byBzdG9yaW5nIGFuIGFycmF5IG9mIFwiYWxyZWFkeVxyXG4gICAgLy8gcHJvY2Vzc2VkXCIgZWRnZXMuXHJcbiAgICBjb25zdCBuZXh0SWQgPSBnbG9iYWxJZCsrO1xyXG5cclxuICAgIC8vIEFkZHMgYW4gdmVydGV4IHRvIHRoZSBxdWV1ZVxyXG4gICAgY29uc3QgYWRkVG9RdWV1ZSA9IHZlcnRleCA9PiB7XHJcbiAgICAgIC8vIFRPRE86IHNlZSBpZiBvYmplY3QgYWxsb2NhdGlvbnMgYXJlIHNsb3cgaGVyZVxyXG4gICAgICBxdWV1ZS5wdXNoKCB7IHN0YXJ0OiB0cnVlLCB2ZXJ0ZXg6IHZlcnRleCB9LCB2ZXJ0ZXgucG9pbnQueSAtIGVwc2lsb24gKTtcclxuICAgICAgcXVldWUucHVzaCggeyBzdGFydDogZmFsc2UsIHZlcnRleDogdmVydGV4IH0sIHZlcnRleC5wb2ludC55ICsgZXBzaWxvbiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBSZW1vdmVzIGEgdmVydGV4IGZyb20gdGhlIHF1ZXVlIChlZmZlY3RpdmVseS4uLiB3aGVuIHdlIHBvcCBmcm9tIHRoZSBxdWV1ZSwgd2UnbGwgY2hlY2sgaXRzIElEIGRhdGEsIGFuZCBpZiBpdFxyXG4gICAgLy8gd2FzIFwicmVtb3ZlZFwiIHdlIHdpbGwgaWdub3JlIGl0LiBIaWdoZXItcGVyZm9ybWFuY2UgdGhhbiB1c2luZyBhbiBhcnJheS5cclxuICAgIGNvbnN0IHJlbW92ZUZyb21RdWV1ZSA9IHZlcnRleCA9PiB7XHJcbiAgICAgIC8vIFN0b3JlIHRoZSBJRCBzbyB3ZSBjYW4gaGF2ZSBhIGhpZ2gtcGVyZm9ybWFuY2UgcmVtb3ZhbFxyXG4gICAgICB2ZXJ0ZXguaW50ZXJuYWxEYXRhLnJlbW92ZWRJZCA9IG5leHRJZDtcclxuICAgIH07XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy52ZXJ0aWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgYWRkVG9RdWV1ZSggdGhpcy52ZXJ0aWNlc1sgaSBdICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2UgdHJhY2sgdmVydGljZXMgdG8gZGlzcG9zZSBzZXBhcmF0ZWx5LCBpbnN0ZWFkIG9mIHN5bmNocm9ub3VzbHkgZGlzcG9zaW5nIHRoZW0uIFRoaXMgaXMgbWFpbmx5IGR1ZSB0byB0aGUgdHJpY2tcclxuICAgIC8vIG9mIHJlbW92YWwgSURzLCBzaW5jZSBpZiB3ZSByZS11c2VkIHBvb2xlZCBWZXJ0aWNlcyB3aGVuIGNyZWF0aW5nLCB0aGV5IHdvdWxkIHN0aWxsIGhhdmUgdGhlIElEIE9SIHRoZXkgd291bGRcclxuICAgIC8vIGxvc2UgdGhlIFwicmVtb3ZlZFwiIGluZm9ybWF0aW9uLlxyXG4gICAgY29uc3QgdmVydGljZXNUb0Rpc3Bvc2UgPSBbXTtcclxuXHJcbiAgICB3aGlsZSAoIHF1ZXVlLmxlbmd0aCApIHtcclxuICAgICAgY29uc3QgZW50cnkgPSBxdWV1ZS5wb3AoKTtcclxuICAgICAgY29uc3QgdmVydGV4ID0gZW50cnkudmVydGV4O1xyXG5cclxuICAgICAgLy8gU2tpcCB2ZXJ0aWNlcyB3ZSBhbHJlYWR5IHJlbW92ZWRcclxuICAgICAgaWYgKCB2ZXJ0ZXguaW50ZXJuYWxEYXRhLnJlbW92ZWRJZCA9PT0gbmV4dElkICkge1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIGVudHJ5LnN0YXJ0ICkge1xyXG4gICAgICAgIC8vIFdlJ2xsIGJhaWwgb3V0IG9mIHRoZSBsb29wIGlmIHdlIGZpbmQgb3ZlcmxhcHMsIGFuZCB3ZSdsbCBzdG9yZSB0aGUgcmVsZXZhbnQgaW5mb3JtYXRpb24gaW4gdGhlc2VcclxuICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICBsZXQgb3ZlcmxhcHBlZFZlcnRleDtcclxuICAgICAgICBsZXQgYWRkZWRWZXJ0aWNlcztcclxuXHJcbiAgICAgICAgLy8gVE9ETzogSXMgdGhpcyBjbG9zdXJlIGtpbGxpbmcgcGVyZm9ybWFuY2U/XHJcbiAgICAgICAgc2VnbWVudFRyZWUucXVlcnkoIHZlcnRleCwgb3RoZXJWZXJ0ZXggPT4ge1xyXG4gICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB2ZXJ0ZXgucG9pbnQuZGlzdGFuY2UoIG90aGVyVmVydGV4LnBvaW50ICk7XHJcbiAgICAgICAgICBpZiAoIGRpc3RhbmNlIDwgMWUtNSApIHtcclxuXHJcbiAgICAgICAgICAgICAgY29uc3QgbmV3VmVydGV4ID0gVmVydGV4LnBvb2wuY3JlYXRlKCBkaXN0YW5jZSA9PT0gMCA/IHZlcnRleC5wb2ludCA6IHZlcnRleC5wb2ludC5hdmVyYWdlKCBvdGhlclZlcnRleC5wb2ludCApICk7XHJcbiAgICAgICAgICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKCBuZXdWZXJ0ZXggKTtcclxuXHJcbiAgICAgICAgICAgICAgYXJyYXlSZW1vdmUoIHRoaXMudmVydGljZXMsIHZlcnRleCApO1xyXG4gICAgICAgICAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLnZlcnRpY2VzLCBvdGhlclZlcnRleCApO1xyXG4gICAgICAgICAgICAgIGZvciAoIGxldCBrID0gdGhpcy5lZGdlcy5sZW5ndGggLSAxOyBrID49IDA7IGstLSApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGVkZ2UgPSB0aGlzLmVkZ2VzWyBrIF07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydE1hdGNoZXMgPSBlZGdlLnN0YXJ0VmVydGV4ID09PSB2ZXJ0ZXggfHwgZWRnZS5zdGFydFZlcnRleCA9PT0gb3RoZXJWZXJ0ZXg7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBlbmRNYXRjaGVzID0gZWRnZS5lbmRWZXJ0ZXggPT09IHZlcnRleCB8fCBlZGdlLmVuZFZlcnRleCA9PT0gb3RoZXJWZXJ0ZXg7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gT3V0cmlnaHQgcmVtb3ZlIGVkZ2VzIHRoYXQgd2VyZSBiZXR3ZWVuIEEgYW5kIEIgdGhhdCBhcmVuJ3QgbG9vcHNcclxuICAgICAgICAgICAgICAgIGlmICggc3RhcnRNYXRjaGVzICYmIGVuZE1hdGNoZXMgKSB7XHJcbiAgICAgICAgICAgICAgICAgIGlmICggKCBlZGdlLnNlZ21lbnQuYm91bmRzLndpZHRoID4gMWUtNSB8fCBlZGdlLnNlZ21lbnQuYm91bmRzLmhlaWdodCA+IDFlLTUgKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICggZWRnZS5zZWdtZW50IGluc3RhbmNlb2YgQ3ViaWMgfHwgZWRnZS5zZWdtZW50IGluc3RhbmNlb2YgQXJjIHx8IGVkZ2Uuc2VnbWVudCBpbnN0YW5jZW9mIEVsbGlwdGljYWxBcmMgKSApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIGl0IHdpdGggYSBuZXcgZWRnZSB0aGF0IGlzIGZyb20gdGhlIHZlcnRleCB0byBpdHNlbGZcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudEVkZ2UgPSBFZGdlLnBvb2wuY3JlYXRlKCBlZGdlLnNlZ21lbnQsIG5ld1ZlcnRleCwgbmV3VmVydGV4ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRFZGdlKCByZXBsYWNlbWVudEVkZ2UgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlcGxhY2VFZGdlSW5Mb29wcyggZWRnZSwgWyByZXBsYWNlbWVudEVkZ2UuZm9yd2FyZEhhbGYgXSApO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVwbGFjZUVkZ2VJbkxvb3BzKCBlZGdlLCBbXSApOyAvLyByZW1vdmUgdGhlIGVkZ2UgZnJvbSBsb29wcyB3aXRoIG5vIHJlcGxhY2VtZW50XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFZGdlKCBlZGdlICk7XHJcbiAgICAgICAgICAgICAgICAgIGVkZ2UuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIHN0YXJ0TWF0Y2hlcyApIHtcclxuICAgICAgICAgICAgICAgICAgZWRnZS5zdGFydFZlcnRleCA9IG5ld1ZlcnRleDtcclxuICAgICAgICAgICAgICAgICAgbmV3VmVydGV4LmluY2lkZW50SGFsZkVkZ2VzLnB1c2goIGVkZ2UucmV2ZXJzZWRIYWxmICk7XHJcbiAgICAgICAgICAgICAgICAgIGVkZ2UudXBkYXRlUmVmZXJlbmNlcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIGVuZE1hdGNoZXMgKSB7XHJcbiAgICAgICAgICAgICAgICAgIGVkZ2UuZW5kVmVydGV4ID0gbmV3VmVydGV4O1xyXG4gICAgICAgICAgICAgICAgICBuZXdWZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXMucHVzaCggZWRnZS5mb3J3YXJkSGFsZiApO1xyXG4gICAgICAgICAgICAgICAgICBlZGdlLnVwZGF0ZVJlZmVyZW5jZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhZGRlZFZlcnRpY2VzID0gWyBuZXdWZXJ0ZXggXTtcclxuICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICBvdmVybGFwcGVkVmVydGV4ID0gb3RoZXJWZXJ0ZXg7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIGlmICggZm91bmQgKSB7XHJcbiAgICAgICAgICAvLyBXZSBoYXZlbid0IGFkZGVkIG91ciBlZGdlIHlldCwgc28gbm8gbmVlZCB0byByZW1vdmUgaXQuXHJcbiAgICAgICAgICBzZWdtZW50VHJlZS5yZW1vdmVJdGVtKCBvdmVybGFwcGVkVmVydGV4ICk7XHJcblxyXG4gICAgICAgICAgLy8gQWRqdXN0IHRoZSBxdWV1ZVxyXG4gICAgICAgICAgcmVtb3ZlRnJvbVF1ZXVlKCBvdmVybGFwcGVkVmVydGV4ICk7XHJcbiAgICAgICAgICByZW1vdmVGcm9tUXVldWUoIHZlcnRleCApO1xyXG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYWRkZWRWZXJ0aWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgICAgYWRkVG9RdWV1ZSggYWRkZWRWZXJ0aWNlc1sgaSBdICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdmVydGljZXNUb0Rpc3Bvc2UucHVzaCggdmVydGV4ICk7XHJcbiAgICAgICAgICB2ZXJ0aWNlc1RvRGlzcG9zZS5wdXNoKCBvdmVybGFwcGVkVmVydGV4ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgLy8gTm8gb3ZlcmxhcHMgZm91bmQsIGFkZCBpdCBhbmQgY29udGludWVcclxuICAgICAgICAgIHNlZ21lbnRUcmVlLmFkZEl0ZW0oIHZlcnRleCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBSZW1vdmFsIGNhbid0IHRyaWdnZXIgYW4gaW50ZXJzZWN0aW9uLCBzbyB3ZSBjYW4gc2FmZWx5IHJlbW92ZSBpdFxyXG4gICAgICAgIHNlZ21lbnRUcmVlLnJlbW92ZUl0ZW0oIHZlcnRleCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmVydGljZXNUb0Rpc3Bvc2UubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHZlcnRpY2VzVG9EaXNwb3NlWyBpIF0uZGlzcG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uZXZlcnkoIHRoaXMuZWRnZXMsIGVkZ2UgPT4gXy5pbmNsdWRlcyggdGhpcy52ZXJ0aWNlcywgZWRnZS5zdGFydFZlcnRleCApICkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uZXZlcnkoIHRoaXMuZWRnZXMsIGVkZ2UgPT4gXy5pbmNsdWRlcyggdGhpcy52ZXJ0aWNlcywgZWRnZS5lbmRWZXJ0ZXggKSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTY2FuIGEgZ2l2ZW4gdmVydGV4IGZvciBicmlkZ2VzIHJlY3Vyc2l2ZWx5IHdpdGggYSBkZXB0aC1maXJzdCBzZWFyY2guXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIFJlY29yZHMgdmlzaXQgdGltZXMgdG8gZWFjaCB2ZXJ0ZXgsIGFuZCBiYWNrLXByb3BhZ2F0ZXMgc28gdGhhdCB3ZSBjYW4gZWZmaWNpZW50bHkgZGV0ZXJtaW5lIGlmIHRoZXJlIHdhcyBhbm90aGVyXHJcbiAgICogcGF0aCBhcm91bmQgdG8gdGhlIHZlcnRleC5cclxuICAgKlxyXG4gICAqIEFzc3VtZXMgdGhpcyBpcyBvbmx5IGNhbGxlZCBvbmUgdGltZSBvbmNlIGFsbCBlZGdlcy92ZXJ0aWNlcyBhcmUgc2V0IHVwLiBSZXBlYXRlZCBjYWxscyB3aWxsIGZhaWwgYmVjYXVzZSB3ZVxyXG4gICAqIGRvbid0IG1hcmsgdmlzaXRlZC9ldGMuIHJlZmVyZW5jZXMgYWdhaW4gb24gc3RhcnR1cFxyXG4gICAqXHJcbiAgICogU2VlIFRhcmphbidzIGFsZ29yaXRobSBmb3IgbW9yZSBpbmZvcm1hdGlvbi4gU29tZSBtb2RpZmljYXRpb25zIHdlcmUgbmVlZGVkLCBzaW5jZSB0aGlzIGlzIHRlY2huaWNhbGx5IGFcclxuICAgKiBtdWx0aWdyYXBoL3BzZXVkb2dyYXBoIChjYW4gaGF2ZSBlZGdlcyB0aGF0IGhhdmUgdGhlIHNhbWUgc3RhcnQvZW5kIHZlcnRleCwgYW5kIGNhbiBoYXZlIG11bHRpcGxlIGVkZ2VzXHJcbiAgICogZ29pbmcgZnJvbSB0aGUgc2FtZSB0d28gdmVydGljZXMpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48RWRnZT59IGJyaWRnZXMgLSBBcHBlbmRzIGJyaWRnZSBlZGdlcyB0byBoZXJlLlxyXG4gICAqIEBwYXJhbSB7VmVydGV4fSB2ZXJ0ZXhcclxuICAgKi9cclxuICBtYXJrQnJpZGdlcyggYnJpZGdlcywgdmVydGV4ICkge1xyXG4gICAgdmVydGV4LnZpc2l0ZWQgPSB0cnVlO1xyXG4gICAgdmVydGV4LnZpc2l0SW5kZXggPSB2ZXJ0ZXgubG93SW5kZXggPSBicmlkZ2VJZCsrO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHZlcnRleC5pbmNpZGVudEhhbGZFZGdlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgZWRnZSA9IHZlcnRleC5pbmNpZGVudEhhbGZFZGdlc1sgaSBdLmVkZ2U7XHJcbiAgICAgIGNvbnN0IGNoaWxkVmVydGV4ID0gdmVydGV4LmluY2lkZW50SGFsZkVkZ2VzWyBpIF0uc3RhcnRWZXJ0ZXg7IC8vIGJ5IGRlZmluaXRpb24sIG91ciB2ZXJ0ZXggc2hvdWxkIGJlIHRoZSBlbmRWZXJ0ZXhcclxuICAgICAgaWYgKCAhY2hpbGRWZXJ0ZXgudmlzaXRlZCApIHtcclxuICAgICAgICBlZGdlLnZpc2l0ZWQgPSB0cnVlO1xyXG4gICAgICAgIGNoaWxkVmVydGV4LnBhcmVudCA9IHZlcnRleDtcclxuICAgICAgICB0aGlzLm1hcmtCcmlkZ2VzKCBicmlkZ2VzLCBjaGlsZFZlcnRleCApO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiB0aGVyZSdzIGFub3RoZXIgcm91dGUgdGhhdCByZWFjaGVzIGJhY2sgdG8gb3VyIHZlcnRleCBmcm9tIGFuIGFuY2VzdG9yXHJcbiAgICAgICAgdmVydGV4Lmxvd0luZGV4ID0gTWF0aC5taW4oIHZlcnRleC5sb3dJbmRleCwgY2hpbGRWZXJ0ZXgubG93SW5kZXggKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlcmUgd2FzIG5vIHJvdXRlLCB0aGVuIHdlIHJlYWNoZWQgYSBicmlkZ2VcclxuICAgICAgICBpZiAoIGNoaWxkVmVydGV4Lmxvd0luZGV4ID4gdmVydGV4LnZpc2l0SW5kZXggKSB7XHJcbiAgICAgICAgICBicmlkZ2VzLnB1c2goIGVkZ2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoICFlZGdlLnZpc2l0ZWQgKSB7XHJcbiAgICAgICAgdmVydGV4Lmxvd0luZGV4ID0gTWF0aC5taW4oIHZlcnRleC5sb3dJbmRleCwgY2hpbGRWZXJ0ZXgudmlzaXRJbmRleCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGVkZ2VzIHRoYXQgYXJlIHRoZSBvbmx5IGVkZ2UgaG9sZGluZyB0d28gY29ubmVjdGVkIGNvbXBvbmVudHMgdG9nZXRoZXIuIEJhc2VkIG9uIG91ciBwcm9ibGVtLCB0aGVcclxuICAgKiBmYWNlIG9uIGVpdGhlciBzaWRlIG9mIHRoZSBcImJyaWRnZVwiIGVkZ2VzIHdvdWxkIGFsd2F5cyBiZSB0aGUgc2FtZSwgc28gd2UgY2FuIHNhZmVseSByZW1vdmUgdGhlbS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlbW92ZUJyaWRnZXMoKSB7XHJcbiAgICBjb25zdCBicmlkZ2VzID0gW107XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy52ZXJ0aWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgdmVydGV4ID0gdGhpcy52ZXJ0aWNlc1sgaSBdO1xyXG4gICAgICBpZiAoICF2ZXJ0ZXgudmlzaXRlZCApIHtcclxuICAgICAgICB0aGlzLm1hcmtCcmlkZ2VzKCBicmlkZ2VzLCB2ZXJ0ZXggKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJyaWRnZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGJyaWRnZUVkZ2UgPSBicmlkZ2VzWyBpIF07XHJcblxyXG4gICAgICB0aGlzLnJlbW92ZUVkZ2UoIGJyaWRnZUVkZ2UgKTtcclxuICAgICAgdGhpcy5yZXBsYWNlRWRnZUluTG9vcHMoIGJyaWRnZUVkZ2UsIFtdICk7XHJcbiAgICAgIGJyaWRnZUVkZ2UuZGlzcG9zZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyB2ZXJ0aWNlcyB0aGF0IGhhdmUgb3JkZXIgbGVzcyB0aGFuIDIgKHNvIGVpdGhlciBhIHZlcnRleCB3aXRoIG9uZSBvciB6ZXJvIGVkZ2VzIGFkamFjZW50KS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlbW92ZUxvd09yZGVyVmVydGljZXMoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCB0aGlzLmVkZ2VzLCBlZGdlID0+IF8uaW5jbHVkZXMoIHRoaXMudmVydGljZXMsIGVkZ2Uuc3RhcnRWZXJ0ZXggKSApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCB0aGlzLmVkZ2VzLCBlZGdlID0+IF8uaW5jbHVkZXMoIHRoaXMudmVydGljZXMsIGVkZ2UuZW5kVmVydGV4ICkgKSApO1xyXG5cclxuICAgIGxldCBuZWVkc0xvb3AgPSB0cnVlO1xyXG4gICAgd2hpbGUgKCBuZWVkc0xvb3AgKSB7XHJcbiAgICAgIG5lZWRzTG9vcCA9IGZhbHNlO1xyXG5cclxuICAgICAgZm9yICggbGV0IGkgPSB0aGlzLnZlcnRpY2VzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IHRoaXMudmVydGljZXNbIGkgXTtcclxuXHJcbiAgICAgICAgaWYgKCB2ZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXMubGVuZ3RoIDwgMiApIHtcclxuICAgICAgICAgIC8vIERpc2Nvbm5lY3QgYW55IGV4aXN0aW5nIGVkZ2VzXHJcbiAgICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB2ZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVkZ2UgPSB2ZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXNbIGogXS5lZGdlO1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUVkZ2UoIGVkZ2UgKTtcclxuICAgICAgICAgICAgdGhpcy5yZXBsYWNlRWRnZUluTG9vcHMoIGVkZ2UsIFtdICk7IC8vIHJlbW92ZSB0aGUgZWRnZSBmcm9tIHRoZSBsb29wc1xyXG4gICAgICAgICAgICBlZGdlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIHZlcnRleFxyXG4gICAgICAgICAgdGhpcy52ZXJ0aWNlcy5zcGxpY2UoIGksIDEgKTtcclxuICAgICAgICAgIHZlcnRleC5kaXNwb3NlKCk7XHJcblxyXG4gICAgICAgICAgbmVlZHNMb29wID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggdGhpcy5lZGdlcywgZWRnZSA9PiBfLmluY2x1ZGVzKCB0aGlzLnZlcnRpY2VzLCBlZGdlLnN0YXJ0VmVydGV4ICkgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggdGhpcy5lZGdlcywgZWRnZSA9PiBfLmluY2x1ZGVzKCB0aGlzLnZlcnRpY2VzLCBlZGdlLmVuZFZlcnRleCApICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNvcnRzIGluY2lkZW50IGhhbGYtZWRnZXMgZm9yIGVhY2ggdmVydGV4LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgb3JkZXJWZXJ0ZXhFZGdlcygpIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMudmVydGljZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMudmVydGljZXNbIGkgXS5zb3J0RWRnZXMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYm91bmRhcmllcyBhbmQgZmFjZXMgYnkgZm9sbG93aW5nIGVhY2ggaGFsZi1lZGdlIGNvdW50ZXItY2xvY2t3aXNlXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBleHRyYWN0RmFjZXMoKSB7XHJcbiAgICBjb25zdCBoYWxmRWRnZXMgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZWRnZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGhhbGZFZGdlcy5wdXNoKCB0aGlzLmVkZ2VzWyBpIF0uZm9yd2FyZEhhbGYgKTtcclxuICAgICAgaGFsZkVkZ2VzLnB1c2goIHRoaXMuZWRnZXNbIGkgXS5yZXZlcnNlZEhhbGYgKTtcclxuICAgIH1cclxuXHJcbiAgICB3aGlsZSAoIGhhbGZFZGdlcy5sZW5ndGggKSB7XHJcbiAgICAgIGNvbnN0IGJvdW5kYXJ5SGFsZkVkZ2VzID0gW107XHJcbiAgICAgIGxldCBoYWxmRWRnZSA9IGhhbGZFZGdlc1sgMCBdO1xyXG4gICAgICBjb25zdCBzdGFydGluZ0hhbGZFZGdlID0gaGFsZkVkZ2U7XHJcbiAgICAgIHdoaWxlICggaGFsZkVkZ2UgKSB7XHJcbiAgICAgICAgYXJyYXlSZW1vdmUoIGhhbGZFZGdlcywgaGFsZkVkZ2UgKTtcclxuICAgICAgICBib3VuZGFyeUhhbGZFZGdlcy5wdXNoKCBoYWxmRWRnZSApO1xyXG4gICAgICAgIGhhbGZFZGdlID0gaGFsZkVkZ2UuZ2V0TmV4dCgpO1xyXG4gICAgICAgIGlmICggaGFsZkVkZ2UgPT09IHN0YXJ0aW5nSGFsZkVkZ2UgKSB7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgYm91bmRhcnkgPSBCb3VuZGFyeS5wb29sLmNyZWF0ZSggYm91bmRhcnlIYWxmRWRnZXMgKTtcclxuICAgICAgKCBib3VuZGFyeS5zaWduZWRBcmVhID4gMCA/IHRoaXMuaW5uZXJCb3VuZGFyaWVzIDogdGhpcy5vdXRlckJvdW5kYXJpZXMgKS5wdXNoKCBib3VuZGFyeSApO1xyXG4gICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaCggYm91bmRhcnkgKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmlubmVyQm91bmRhcmllcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpcy5mYWNlcy5wdXNoKCBGYWNlLnBvb2wuY3JlYXRlKCB0aGlzLmlubmVyQm91bmRhcmllc1sgaSBdICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIHRoZSBpbm5lciBhbmQgb3V0ZXIgYm91bmRhcmllcywgaXQgY29tcHV0ZXMgYSB0cmVlIHJlcHJlc2VudGF0aW9uIHRvIGRldGVybWluZSB3aGF0IGJvdW5kYXJpZXMgYXJlXHJcbiAgICogaG9sZXMgb2Ygd2hhdCBvdGhlciBib3VuZGFyaWVzLCB0aGVuIHNldHMgdXAgZmFjZSBob2xlcyB3aXRoIHRoZSByZXN1bHQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpbmZvcm1hdGlvbiBpcyBzdG9yZWQgaW4gdGhlIGNoaWxkQm91bmRhcmllcyBhcnJheSBvZiBCb3VuZGFyeSwgYW5kIGlzIHRoZW4gcmVhZCBvdXQgdG8gc2V0IHVwIGZhY2VzLlxyXG4gICAqL1xyXG4gIGNvbXB1dGVCb3VuZGFyeVRyZWUoKSB7XHJcbiAgICAvLyBUT0RPOiBkZXRlY3QgXCJpbmRldGVybWluYXRlXCIgZm9yIHJvYnVzdG5lc3MgKGFuZCB0cnkgbmV3IGFuZ2xlcz8pXHJcbiAgICBjb25zdCB1bmJvdW5kZWRIb2xlcyA9IFtdOyAvLyB7QXJyYXkuPEJvdW5kYXJ5Pn1cclxuXHJcbiAgICAvLyBXZSdsbCB3YW50IHRvIGNvbXB1dGUgYSByYXkgZm9yIGVhY2ggb3V0ZXIgYm91bmRhcnkgdGhhdCBzdGFydHMgYXQgYW4gZXh0cmVtZSBwb2ludCBmb3IgdGhhdCBkaXJlY3Rpb24gYW5kXHJcbiAgICAvLyBjb250aW51ZXMgb3V0d2FyZHMuIFRoZSBuZXh0IGJvdW5kYXJ5IGl0IGludGVyc2VjdHMgd2lsbCBiZSBsaW5rZWQgdG9nZXRoZXIgaW4gdGhlIHRyZWUuXHJcbiAgICAvLyBXZSBoYXZlIGEgbW9zdGx5LWFyYml0cmFyeSBhbmdsZSBoZXJlIHRoYXQgaG9wZWZ1bGx5IHdvbid0IGJlIHVzZWQuXHJcbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBuZXcgVHJhbnNmb3JtMyggTWF0cml4My5yb3RhdGlvbjIoIDEuNTcyOTY1NyApICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5vdXRlckJvdW5kYXJpZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IG91dGVyQm91bmRhcnkgPSB0aGlzLm91dGVyQm91bmRhcmllc1sgaSBdO1xyXG5cclxuICAgICAgY29uc3QgcmF5ID0gb3V0ZXJCb3VuZGFyeS5jb21wdXRlRXh0cmVtZVJheSggdHJhbnNmb3JtICk7XHJcblxyXG4gICAgICBsZXQgY2xvc2VzdEVkZ2UgPSBudWxsO1xyXG4gICAgICBsZXQgY2xvc2VzdERpc3RhbmNlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgICBsZXQgY2xvc2VzdFdpbmQgPSBmYWxzZTtcclxuXHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMuZWRnZXMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3QgZWRnZSA9IHRoaXMuZWRnZXNbIGogXTtcclxuXHJcbiAgICAgICAgY29uc3QgaW50ZXJzZWN0aW9ucyA9IGVkZ2Uuc2VnbWVudC5pbnRlcnNlY3Rpb24oIHJheSApO1xyXG4gICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IGludGVyc2VjdGlvbnMubGVuZ3RoOyBrKysgKSB7XHJcbiAgICAgICAgICBjb25zdCBpbnRlcnNlY3Rpb24gPSBpbnRlcnNlY3Rpb25zWyBrIF07XHJcblxyXG4gICAgICAgICAgaWYgKCBpbnRlcnNlY3Rpb24uZGlzdGFuY2UgPCBjbG9zZXN0RGlzdGFuY2UgKSB7XHJcbiAgICAgICAgICAgIGNsb3Nlc3RFZGdlID0gZWRnZTtcclxuICAgICAgICAgICAgY2xvc2VzdERpc3RhbmNlID0gaW50ZXJzZWN0aW9uLmRpc3RhbmNlO1xyXG4gICAgICAgICAgICBjbG9zZXN0V2luZCA9IGludGVyc2VjdGlvbi53aW5kO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBjbG9zZXN0RWRnZSA9PT0gbnVsbCApIHtcclxuICAgICAgICB1bmJvdW5kZWRIb2xlcy5wdXNoKCBvdXRlckJvdW5kYXJ5ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29uc3QgcmV2ZXJzZWQgPSBjbG9zZXN0V2luZCA8IDA7XHJcbiAgICAgICAgY29uc3QgY2xvc2VzdEhhbGZFZGdlID0gcmV2ZXJzZWQgPyBjbG9zZXN0RWRnZS5yZXZlcnNlZEhhbGYgOiBjbG9zZXN0RWRnZS5mb3J3YXJkSGFsZjtcclxuICAgICAgICBjb25zdCBjbG9zZXN0Qm91bmRhcnkgPSB0aGlzLmdldEJvdW5kYXJ5T2ZIYWxmRWRnZSggY2xvc2VzdEhhbGZFZGdlICk7XHJcbiAgICAgICAgY2xvc2VzdEJvdW5kYXJ5LmNoaWxkQm91bmRhcmllcy5wdXNoKCBvdXRlckJvdW5kYXJ5ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1bmJvdW5kZWRIb2xlcy5mb3JFYWNoKCB0aGlzLnVuYm91bmRlZEZhY2UucmVjdXJzaXZlbHlBZGRIb2xlcy5iaW5kKCB0aGlzLnVuYm91bmRlZEZhY2UgKSApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5mYWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgZmFjZSA9IHRoaXMuZmFjZXNbIGkgXTtcclxuICAgICAgaWYgKCBmYWNlLmJvdW5kYXJ5ICE9PSBudWxsICkge1xyXG4gICAgICAgIGZhY2UuYm91bmRhcnkuY2hpbGRCb3VuZGFyaWVzLmZvckVhY2goIGZhY2UucmVjdXJzaXZlbHlBZGRIb2xlcy5iaW5kKCBmYWNlICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZXMgdGhlIHdpbmRpbmcgbWFwIGZvciBlYWNoIGZhY2UsIHN0YXJ0aW5nIHdpdGggMCBvbiB0aGUgdW5ib3VuZGVkIGZhY2UgKGZvciBlYWNoIHNoYXBlSWQpLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY29tcHV0ZVdpbmRpbmdNYXAoKSB7XHJcbiAgICBjb25zdCBlZGdlcyA9IHRoaXMuZWRnZXMuc2xpY2UoKTtcclxuXHJcbiAgICAvLyBXaW5kaW5nIG51bWJlcnMgZm9yIFwib3V0c2lkZVwiIGFyZSAwLlxyXG4gICAgY29uc3Qgb3V0c2lkZU1hcCA9IHt9O1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zaGFwZUlkcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgb3V0c2lkZU1hcFsgdGhpcy5zaGFwZUlkc1sgaSBdIF0gPSAwO1xyXG4gICAgfVxyXG4gICAgdGhpcy51bmJvdW5kZWRGYWNlLndpbmRpbmdNYXAgPSBvdXRzaWRlTWFwO1xyXG5cclxuICAgIC8vIFdlIGhhdmUgXCJzb2x2ZWRcIiB0aGUgdW5ib3VuZGVkIGZhY2UsIGFuZCB0aGVuIGl0ZXJhdGl2ZWx5IGdvIG92ZXIgdGhlIGVkZ2VzIGxvb2tpbmcgZm9yIGEgY2FzZSB3aGVyZSB3ZSBoYXZlXHJcbiAgICAvLyBzb2x2ZWQgb25lIG9mIHRoZSBmYWNlcyB0aGF0IGlzIGFkamFjZW50IHRvIHRoYXQgZWRnZS4gV2UgY2FuIHRoZW4gY29tcHV0ZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHdpbmRpbmdcclxuICAgIC8vIG51bWJlcnMgYmV0d2VlbiB0aGUgdHdvIGZhY2VzLCBhbmQgdGh1cyBkZXRlcm1pbmUgdGhlIChhYnNvbHV0ZSkgd2luZGluZyBudW1iZXJzIGZvciB0aGUgdW5zb2x2ZWQgZmFjZS5cclxuICAgIHdoaWxlICggZWRnZXMubGVuZ3RoICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IGVkZ2VzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tICkge1xyXG4gICAgICAgIGNvbnN0IGVkZ2UgPSBlZGdlc1sgaiBdO1xyXG5cclxuICAgICAgICBjb25zdCBmb3J3YXJkSGFsZiA9IGVkZ2UuZm9yd2FyZEhhbGY7XHJcbiAgICAgICAgY29uc3QgcmV2ZXJzZWRIYWxmID0gZWRnZS5yZXZlcnNlZEhhbGY7XHJcblxyXG4gICAgICAgIGNvbnN0IGZvcndhcmRGYWNlID0gZm9yd2FyZEhhbGYuZmFjZTtcclxuICAgICAgICBjb25zdCByZXZlcnNlZEZhY2UgPSByZXZlcnNlZEhhbGYuZmFjZTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmb3J3YXJkRmFjZSAhPT0gcmV2ZXJzZWRGYWNlICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHNvbHZlZEZvcndhcmQgPSBmb3J3YXJkRmFjZS53aW5kaW5nTWFwICE9PSBudWxsO1xyXG4gICAgICAgIGNvbnN0IHNvbHZlZFJldmVyc2VkID0gcmV2ZXJzZWRGYWNlLndpbmRpbmdNYXAgIT09IG51bGw7XHJcblxyXG4gICAgICAgIGlmICggc29sdmVkRm9yd2FyZCAmJiBzb2x2ZWRSZXZlcnNlZCApIHtcclxuICAgICAgICAgIGVkZ2VzLnNwbGljZSggaiwgMSApO1xyXG5cclxuICAgICAgICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICAgICAgICBmb3IgKCBsZXQgbSA9IDA7IG0gPCB0aGlzLnNoYXBlSWRzLmxlbmd0aDsgbSsrICkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGlkID0gdGhpcy5zaGFwZUlkc1sgbSBdO1xyXG4gICAgICAgICAgICAgIGFzc2VydCggZm9yd2FyZEZhY2Uud2luZGluZ01hcFsgaWQgXSAtIHJldmVyc2VkRmFjZS53aW5kaW5nTWFwWyBpZCBdID09PSB0aGlzLmNvbXB1dGVEaWZmZXJlbnRpYWwoIGVkZ2UsIGlkICkgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggIXNvbHZlZEZvcndhcmQgJiYgIXNvbHZlZFJldmVyc2VkICkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgY29uc3Qgc29sdmVkRmFjZSA9IHNvbHZlZEZvcndhcmQgPyBmb3J3YXJkRmFjZSA6IHJldmVyc2VkRmFjZTtcclxuICAgICAgICAgIGNvbnN0IHVuc29sdmVkRmFjZSA9IHNvbHZlZEZvcndhcmQgPyByZXZlcnNlZEZhY2UgOiBmb3J3YXJkRmFjZTtcclxuXHJcbiAgICAgICAgICBjb25zdCB3aW5kaW5nTWFwID0ge307XHJcbiAgICAgICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCB0aGlzLnNoYXBlSWRzLmxlbmd0aDsgaysrICkge1xyXG4gICAgICAgICAgICBjb25zdCBzaGFwZUlkID0gdGhpcy5zaGFwZUlkc1sgayBdO1xyXG4gICAgICAgICAgICBjb25zdCBkaWZmZXJlbnRpYWwgPSB0aGlzLmNvbXB1dGVEaWZmZXJlbnRpYWwoIGVkZ2UsIHNoYXBlSWQgKTtcclxuICAgICAgICAgICAgd2luZGluZ01hcFsgc2hhcGVJZCBdID0gc29sdmVkRmFjZS53aW5kaW5nTWFwWyBzaGFwZUlkIF0gKyBkaWZmZXJlbnRpYWwgKiAoIHNvbHZlZEZvcndhcmQgPyAtMSA6IDEgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHVuc29sdmVkRmFjZS53aW5kaW5nTWFwID0gd2luZGluZ01hcDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXB1dGVzIHRoZSBkaWZmZXJlbnRpYWwgaW4gd2luZGluZyBudW1iZXJzIChmb3J3YXJkIGZhY2Ugd2luZGluZyBudW1iZXIgbWludXMgdGhlIHJldmVyc2VkIGZhY2Ugd2luZGluZyBudW1iZXIpXHJcbiAgICogKFwiZm9yd2FyZCBmYWNlXCIgaXMgdGhlIGZhY2Ugb24gdGhlIGZvcndhcmQgaGFsZi1lZGdlIHNpZGUsIGV0Yy4pXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RWRnZX0gZWRnZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaGFwZUlkXHJcbiAgICogQHJldHVybnMge251bWJlcn0gLSBUaGUgZGlmZmVyZW5jZSBiZXR3ZWVuIGZvcndhcmQgZmFjZSBhbmQgcmV2ZXJzZWQgZmFjZSB3aW5kaW5nIG51bWJlcnMuXHJcbiAgICovXHJcbiAgY29tcHV0ZURpZmZlcmVudGlhbCggZWRnZSwgc2hhcGVJZCApIHtcclxuICAgIGxldCBkaWZmZXJlbnRpYWwgPSAwOyAvLyBmb3J3YXJkIGZhY2UgLSByZXZlcnNlZCBmYWNlXHJcbiAgICBmb3IgKCBsZXQgbSA9IDA7IG0gPCB0aGlzLmxvb3BzLmxlbmd0aDsgbSsrICkge1xyXG4gICAgICBjb25zdCBsb29wID0gdGhpcy5sb29wc1sgbSBdO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsb29wLmNsb3NlZCwgJ1RoaXMgaXMgb25seSBkZWZpbmVkIHRvIHdvcmsgZm9yIGNsb3NlZCBsb29wcycgKTtcclxuICAgICAgaWYgKCBsb29wLnNoYXBlSWQgIT09IHNoYXBlSWQgKSB7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoIGxldCBuID0gMDsgbiA8IGxvb3AuaGFsZkVkZ2VzLmxlbmd0aDsgbisrICkge1xyXG4gICAgICAgIGNvbnN0IGxvb3BIYWxmRWRnZSA9IGxvb3AuaGFsZkVkZ2VzWyBuIF07XHJcbiAgICAgICAgaWYgKCBsb29wSGFsZkVkZ2UgPT09IGVkZ2UuZm9yd2FyZEhhbGYgKSB7XHJcbiAgICAgICAgICBkaWZmZXJlbnRpYWwrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGxvb3BIYWxmRWRnZSA9PT0gZWRnZS5yZXZlcnNlZEhhbGYgKSB7XHJcbiAgICAgICAgICBkaWZmZXJlbnRpYWwtLTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBkaWZmZXJlbnRpYWw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB1bmJvdW5kZWQgZmFjZSBhcyB1bmZpbGxlZCwgYW5kIHRoZW4gc2V0cyBlYWNoIGZhY2UncyBmaWxsIHNvIHRoYXQgZWRnZXMgc2VwYXJhdGUgb25lIGZpbGxlZCBmYWNlIHdpdGhcclxuICAgKiBvbmUgdW5maWxsZWQgZmFjZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogTk9URTogQmVzdCB0byBjYWxsIHRoaXMgb24gdGhlIHJlc3VsdCBmcm9tIGNyZWF0ZUZpbGxlZFN1YkdyYXBoKCksIHNpbmNlIGl0IHNob3VsZCBoYXZlIGd1YXJhbnRlZWQgcHJvcGVydGllc1xyXG4gICAqICAgICAgIHRvIG1ha2UgdGhpcyBjb25zaXN0ZW50LiBOb3RhYmx5LCBhbGwgdmVydGljZXMgbmVlZCB0byBoYXZlIGFuIGV2ZW4gb3JkZXIgKG51bWJlciBvZiBlZGdlcylcclxuICAgKi9cclxuICBmaWxsQWx0ZXJuYXRpbmdGYWNlcygpIHtcclxuICAgIGxldCBudWxsRmFjZUZpbGxlZENvdW50ID0gMDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZmFjZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuZmFjZXNbIGkgXS5maWxsZWQgPSBudWxsO1xyXG4gICAgICBudWxsRmFjZUZpbGxlZENvdW50Kys7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51bmJvdW5kZWRGYWNlLmZpbGxlZCA9IGZhbHNlO1xyXG4gICAgbnVsbEZhY2VGaWxsZWRDb3VudC0tO1xyXG5cclxuICAgIHdoaWxlICggbnVsbEZhY2VGaWxsZWRDb3VudCApIHtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5lZGdlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBlZGdlID0gdGhpcy5lZGdlc1sgaSBdO1xyXG4gICAgICAgIGNvbnN0IGZvcndhcmRGYWNlID0gZWRnZS5mb3J3YXJkSGFsZi5mYWNlO1xyXG4gICAgICAgIGNvbnN0IHJldmVyc2VkRmFjZSA9IGVkZ2UucmV2ZXJzZWRIYWxmLmZhY2U7XHJcblxyXG4gICAgICAgIGNvbnN0IGZvcndhcmROdWxsID0gZm9yd2FyZEZhY2UuZmlsbGVkID09PSBudWxsO1xyXG4gICAgICAgIGNvbnN0IHJldmVyc2VkTnVsbCA9IHJldmVyc2VkRmFjZS5maWxsZWQgPT09IG51bGw7XHJcblxyXG4gICAgICAgIGlmICggZm9yd2FyZE51bGwgJiYgIXJldmVyc2VkTnVsbCApIHtcclxuICAgICAgICAgIGZvcndhcmRGYWNlLmZpbGxlZCA9ICFyZXZlcnNlZEZhY2UuZmlsbGVkO1xyXG4gICAgICAgICAgbnVsbEZhY2VGaWxsZWRDb3VudC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggIWZvcndhcmROdWxsICYmIHJldmVyc2VkTnVsbCApIHtcclxuICAgICAgICAgIHJldmVyc2VkRmFjZS5maWxsZWQgPSAhZm9yd2FyZEZhY2UuZmlsbGVkO1xyXG4gICAgICAgICAgbnVsbEZhY2VGaWxsZWRDb3VudC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYm91bmRhcnkgdGhhdCBjb250YWlucyB0aGUgc3BlY2lmaWVkIGhhbGYtZWRnZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogVE9ETzogZmluZCBhIGJldHRlciB3YXksIHRoaXMgaXMgY3JhenkgaW5lZmZpY2llbnRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SGFsZkVkZ2V9IGhhbGZFZGdlXHJcbiAgICogQHJldHVybnMge0JvdW5kYXJ5fVxyXG4gICAqL1xyXG4gIGdldEJvdW5kYXJ5T2ZIYWxmRWRnZSggaGFsZkVkZ2UgKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmJvdW5kYXJpZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGJvdW5kYXJ5ID0gdGhpcy5ib3VuZGFyaWVzWyBpIF07XHJcblxyXG4gICAgICBpZiAoIGJvdW5kYXJ5Lmhhc0hhbGZFZGdlKCBoYWxmRWRnZSApICkge1xyXG4gICAgICAgIHJldHVybiBib3VuZGFyeTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRocm93IG5ldyBFcnJvciggJ0NvdWxkIG5vdCBmaW5kIGJvdW5kYXJ5JyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogXCJVbmlvblwiIGJpbmFyeSB3aW5kaW5nIG1hcCBmaWx0ZXIgZm9yIHVzZSB3aXRoIEdyYXBoLmJpbmFyeVJlc3VsdC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGNvbWJpbmVzIGJvdGggc2hhcGVzIHRvZ2V0aGVyIHNvIHRoYXQgYSBwb2ludCBpcyBpbiB0aGUgcmVzdWx0aW5nIHNoYXBlIGlmIGl0IHdhcyBpbiBlaXRoZXIgb2YgdGhlIGlucHV0XHJcbiAgICogc2hhcGVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHdpbmRpbmdNYXAgLSBTZWUgY29tcHV0ZUZhY2VJbmNsdXNpb24gZm9yIG1vcmUgZGV0YWlsc1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIHN0YXRpYyBCSU5BUllfTk9OWkVST19VTklPTiggd2luZGluZ01hcCApIHtcclxuICAgIHJldHVybiB3aW5kaW5nTWFwWyAnMCcgXSAhPT0gMCB8fCB3aW5kaW5nTWFwWyAnMScgXSAhPT0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiSW50ZXJzZWN0aW9uXCIgYmluYXJ5IHdpbmRpbmcgbWFwIGZpbHRlciBmb3IgdXNlIHdpdGggR3JhcGguYmluYXJ5UmVzdWx0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgY29tYmluZXMgYm90aCBzaGFwZXMgdG9nZXRoZXIgc28gdGhhdCBhIHBvaW50IGlzIGluIHRoZSByZXN1bHRpbmcgc2hhcGUgaWYgaXQgd2FzIGluIGJvdGggb2YgdGhlIGlucHV0XHJcbiAgICogc2hhcGVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHdpbmRpbmdNYXAgLSBTZWUgY29tcHV0ZUZhY2VJbmNsdXNpb24gZm9yIG1vcmUgZGV0YWlsc1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIHN0YXRpYyBCSU5BUllfTk9OWkVST19JTlRFUlNFQ1RJT04oIHdpbmRpbmdNYXAgKSB7XHJcbiAgICByZXR1cm4gd2luZGluZ01hcFsgJzAnIF0gIT09IDAgJiYgd2luZGluZ01hcFsgJzEnIF0gIT09IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBcIkRpZmZlcmVuY2VcIiBiaW5hcnkgd2luZGluZyBtYXAgZmlsdGVyIGZvciB1c2Ugd2l0aCBHcmFwaC5iaW5hcnlSZXN1bHQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBjb21iaW5lcyBib3RoIHNoYXBlcyB0b2dldGhlciBzbyB0aGF0IGEgcG9pbnQgaXMgaW4gdGhlIHJlc3VsdGluZyBzaGFwZSBpZiBpdCB3YXMgaW4gdGhlIGZpcnN0IHNoYXBlIEFORFxyXG4gICAqIHdhcyBOT1QgaW4gdGhlIHNlY29uZCBzaGFwZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB3aW5kaW5nTWFwIC0gU2VlIGNvbXB1dGVGYWNlSW5jbHVzaW9uIGZvciBtb3JlIGRldGFpbHNcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBzdGF0aWMgQklOQVJZX05PTlpFUk9fRElGRkVSRU5DRSggd2luZGluZ01hcCApIHtcclxuICAgIHJldHVybiB3aW5kaW5nTWFwWyAnMCcgXSAhPT0gMCAmJiB3aW5kaW5nTWFwWyAnMScgXSA9PT0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiWE9SXCIgYmluYXJ5IHdpbmRpbmcgbWFwIGZpbHRlciBmb3IgdXNlIHdpdGggR3JhcGguYmluYXJ5UmVzdWx0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgY29tYmluZXMgYm90aCBzaGFwZXMgdG9nZXRoZXIgc28gdGhhdCBhIHBvaW50IGlzIGluIHRoZSByZXN1bHRpbmcgc2hhcGUgaWYgaXQgaXMgb25seSBpbiBleGFjdGx5IG9uZSBvZiB0aGVcclxuICAgKiBpbnB1dCBzaGFwZXMuIEl0J3MgbGlrZSB0aGUgdW5pb24gbWludXMgaW50ZXJzZWN0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHdpbmRpbmdNYXAgLSBTZWUgY29tcHV0ZUZhY2VJbmNsdXNpb24gZm9yIG1vcmUgZGV0YWlsc1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIHN0YXRpYyBCSU5BUllfTk9OWkVST19YT1IoIHdpbmRpbmdNYXAgKSB7XHJcbiAgICByZXR1cm4gKCAoIHdpbmRpbmdNYXBbICcwJyBdICE9PSAwICkgXiAoIHdpbmRpbmdNYXBbICcxJyBdICE9PSAwICkgKSA9PT0gMTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1iaXR3aXNlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSByZXN1bHRpbmcgU2hhcGUgb2J0YWluZWQgYnkgY29tYmluaW5nIHRoZSB0d28gc2hhcGVzIGdpdmVuIHdpdGggdGhlIGZpbHRlci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZUFcclxuICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZUJcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB3aW5kaW5nTWFwRmlsdGVyIC0gU2VlIGNvbXB1dGVGYWNlSW5jbHVzaW9uIGZvciBkZXRhaWxzIG9uIHRoZSBmb3JtYXRcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgc3RhdGljIGJpbmFyeVJlc3VsdCggc2hhcGVBLCBzaGFwZUIsIHdpbmRpbmdNYXBGaWx0ZXIgKSB7XHJcbiAgICBjb25zdCBncmFwaCA9IG5ldyBHcmFwaCgpO1xyXG4gICAgZ3JhcGguYWRkU2hhcGUoIDAsIHNoYXBlQSApO1xyXG4gICAgZ3JhcGguYWRkU2hhcGUoIDEsIHNoYXBlQiApO1xyXG5cclxuICAgIGdyYXBoLmNvbXB1dGVTaW1wbGlmaWVkRmFjZXMoKTtcclxuICAgIGdyYXBoLmNvbXB1dGVGYWNlSW5jbHVzaW9uKCB3aW5kaW5nTWFwRmlsdGVyICk7XHJcbiAgICBjb25zdCBzdWJncmFwaCA9IGdyYXBoLmNyZWF0ZUZpbGxlZFN1YkdyYXBoKCk7XHJcbiAgICBjb25zdCBzaGFwZSA9IHN1YmdyYXBoLmZhY2VzVG9TaGFwZSgpO1xyXG5cclxuICAgIGdyYXBoLmRpc3Bvc2UoKTtcclxuICAgIHN1YmdyYXBoLmRpc3Bvc2UoKTtcclxuXHJcbiAgICByZXR1cm4gc2hhcGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB1bmlvbiBvZiBhbiBhcnJheSBvZiBzaGFwZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48U2hhcGU+fSBzaGFwZXNcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgc3RhdGljIHVuaW9uTm9uWmVybyggc2hhcGVzICkge1xyXG4gICAgY29uc3QgZ3JhcGggPSBuZXcgR3JhcGgoKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHNoYXBlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgZ3JhcGguYWRkU2hhcGUoIGksIHNoYXBlc1sgaSBdICk7XHJcbiAgICB9XHJcblxyXG4gICAgZ3JhcGguY29tcHV0ZVNpbXBsaWZpZWRGYWNlcygpO1xyXG4gICAgZ3JhcGguY29tcHV0ZUZhY2VJbmNsdXNpb24oIHdpbmRpbmdNYXAgPT4ge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBzaGFwZXMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgaWYgKCB3aW5kaW5nTWFwWyBqIF0gIT09IDAgKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgc3ViZ3JhcGggPSBncmFwaC5jcmVhdGVGaWxsZWRTdWJHcmFwaCgpO1xyXG4gICAgY29uc3Qgc2hhcGUgPSBzdWJncmFwaC5mYWNlc1RvU2hhcGUoKTtcclxuXHJcbiAgICBncmFwaC5kaXNwb3NlKCk7XHJcbiAgICBzdWJncmFwaC5kaXNwb3NlKCk7XHJcblxyXG4gICAgcmV0dXJuIHNoYXBlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaW50ZXJzZWN0aW9uIG9mIGFuIGFycmF5IG9mIHNoYXBlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxTaGFwZT59IHNoYXBlc1xyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBzdGF0aWMgaW50ZXJzZWN0aW9uTm9uWmVybyggc2hhcGVzICkge1xyXG4gICAgY29uc3QgZ3JhcGggPSBuZXcgR3JhcGgoKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHNoYXBlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgZ3JhcGguYWRkU2hhcGUoIGksIHNoYXBlc1sgaSBdICk7XHJcbiAgICB9XHJcblxyXG4gICAgZ3JhcGguY29tcHV0ZVNpbXBsaWZpZWRGYWNlcygpO1xyXG4gICAgZ3JhcGguY29tcHV0ZUZhY2VJbmNsdXNpb24oIHdpbmRpbmdNYXAgPT4ge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBzaGFwZXMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgaWYgKCB3aW5kaW5nTWFwWyBqIF0gPT09IDAgKSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgc3ViZ3JhcGggPSBncmFwaC5jcmVhdGVGaWxsZWRTdWJHcmFwaCgpO1xyXG4gICAgY29uc3Qgc2hhcGUgPSBzdWJncmFwaC5mYWNlc1RvU2hhcGUoKTtcclxuXHJcbiAgICBncmFwaC5kaXNwb3NlKCk7XHJcbiAgICBzdWJncmFwaC5kaXNwb3NlKCk7XHJcblxyXG4gICAgcmV0dXJuIHNoYXBlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgeG9yIG9mIGFuIGFycmF5IG9mIHNoYXBlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUT0RPOiByZWR1Y2UgY29kZSBkdXBsaWNhdGlvbj9cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFNoYXBlPn0gc2hhcGVzXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyB4b3JOb25aZXJvKCBzaGFwZXMgKSB7XHJcbiAgICBjb25zdCBncmFwaCA9IG5ldyBHcmFwaCgpO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc2hhcGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBncmFwaC5hZGRTaGFwZSggaSwgc2hhcGVzWyBpIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICBncmFwaC5jb21wdXRlU2ltcGxpZmllZEZhY2VzKCk7XHJcbiAgICBncmFwaC5jb21wdXRlRmFjZUluY2x1c2lvbiggd2luZGluZ01hcCA9PiB7XHJcbiAgICAgIGxldCBpbmNsdWRlZCA9IGZhbHNlO1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBzaGFwZXMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgaWYgKCB3aW5kaW5nTWFwWyBqIF0gIT09IDAgKSB7XHJcbiAgICAgICAgICBpbmNsdWRlZCA9ICFpbmNsdWRlZDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGluY2x1ZGVkO1xyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgc3ViZ3JhcGggPSBncmFwaC5jcmVhdGVGaWxsZWRTdWJHcmFwaCgpO1xyXG4gICAgY29uc3Qgc2hhcGUgPSBzdWJncmFwaC5mYWNlc1RvU2hhcGUoKTtcclxuXHJcbiAgICBncmFwaC5kaXNwb3NlKCk7XHJcbiAgICBzdWJncmFwaC5kaXNwb3NlKCk7XHJcblxyXG4gICAgcmV0dXJuIHNoYXBlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHNpbXBsaWZpZWQgU2hhcGUgb2J0YWluZWQgZnJvbSBydW5uaW5nIGl0IHRocm91Z2ggdGhlIHNpbXBsaWZpY2F0aW9uIHN0ZXBzIHdpdGggbm9uLXplcm8gb3V0cHV0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzaW1wbGlmeU5vblplcm8oIHNoYXBlICkge1xyXG4gICAgY29uc3QgZ3JhcGggPSBuZXcgR3JhcGgoKTtcclxuICAgIGdyYXBoLmFkZFNoYXBlKCAwLCBzaGFwZSApO1xyXG5cclxuICAgIGdyYXBoLmNvbXB1dGVTaW1wbGlmaWVkRmFjZXMoKTtcclxuICAgIGdyYXBoLmNvbXB1dGVGYWNlSW5jbHVzaW9uKCBtYXAgPT4gbWFwWyAnMCcgXSAhPT0gMCApO1xyXG4gICAgY29uc3Qgc3ViZ3JhcGggPSBncmFwaC5jcmVhdGVGaWxsZWRTdWJHcmFwaCgpO1xyXG4gICAgY29uc3QgcmVzdWx0U2hhcGUgPSBzdWJncmFwaC5mYWNlc1RvU2hhcGUoKTtcclxuXHJcbiAgICBncmFwaC5kaXNwb3NlKCk7XHJcbiAgICBzdWJncmFwaC5kaXNwb3NlKCk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdFNoYXBlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGNsaXBwZWQgdmVyc2lvbiBvZiBgc2hhcGVgIHRoYXQgY29udGFpbnMgb25seSB0aGUgcGFydHMgdGhhdCBhcmUgd2l0aGluIHRoZSBhcmVhIGRlZmluZWQgYnlcclxuICAgKiBgY2xpcEFyZWFTaGFwZWBcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlfSBjbGlwQXJlYVNoYXBlXHJcbiAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjbGlwU2hhcGUoIGNsaXBBcmVhU2hhcGUsIHNoYXBlLCBvcHRpb25zICkge1xyXG4gICAgbGV0IGk7XHJcbiAgICBsZXQgajtcclxuICAgIGxldCBsb29wO1xyXG5cclxuICAgIGNvbnN0IFNIQVBFX0lEID0gMDtcclxuICAgIGNvbnN0IENMSVBfU0hBUEVfSUQgPSAxO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBSZXNwZWN0aXZlbHkgd2hldGhlciBzZWdtZW50cyBzaG91bGQgYmUgaW4gdGhlIHJldHVybmVkIHNoYXBlIGlmIHRoZXkgYXJlIGluIHRoZSBleHRlcmlvciBvZiB0aGVcclxuICAgICAgLy8gY2xpcEFyZWFTaGFwZSAob3V0c2lkZSksIG9uIHRoZSBib3VuZGFyeSwgb3IgaW4gdGhlIGludGVyaW9yLlxyXG4gICAgICBpbmNsdWRlRXh0ZXJpb3I6IGZhbHNlLFxyXG4gICAgICBpbmNsdWRlQm91bmRhcnk6IHRydWUsXHJcbiAgICAgIGluY2x1ZGVJbnRlcmlvcjogdHJ1ZVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHNpbXBsaWZpZWRDbGlwQXJlYVNoYXBlID0gR3JhcGguc2ltcGxpZnlOb25aZXJvKCBjbGlwQXJlYVNoYXBlICk7XHJcblxyXG4gICAgY29uc3QgZ3JhcGggPSBuZXcgR3JhcGgoKTtcclxuICAgIGdyYXBoLmFkZFNoYXBlKCBTSEFQRV9JRCwgc2hhcGUsIHtcclxuICAgICAgZW5zdXJlQ2xvc2VkOiBmYWxzZSAvLyBkb24ndCBhZGQgY2xvc2luZyBzZWdtZW50cywgc2luY2Ugd2UnbGwgYmUgcmVjcmVhdGluZyBzdWJwYXRocy9ldGMuXHJcbiAgICB9ICk7XHJcbiAgICBncmFwaC5hZGRTaGFwZSggQ0xJUF9TSEFQRV9JRCwgc2ltcGxpZmllZENsaXBBcmVhU2hhcGUgKTtcclxuXHJcbiAgICAvLyBBIHN1YnNldCBvZiBzaW1wbGlmaWNhdGlvbnMgKHdlIHdhbnQgdG8ga2VlcCBsb3ctb3JkZXIgdmVydGljZXMsIGV0Yy4pXHJcbiAgICBncmFwaC5lbGltaW5hdGVPdmVybGFwKCk7XHJcbiAgICBncmFwaC5lbGltaW5hdGVTZWxmSW50ZXJzZWN0aW9uKCk7XHJcbiAgICBncmFwaC5lbGltaW5hdGVJbnRlcnNlY3Rpb24oKTtcclxuICAgIGdyYXBoLmNvbGxhcHNlVmVydGljZXMoKTtcclxuXHJcbiAgICAvLyBNYXJrIGNsaXAgZWRnZXMgd2l0aCBkYXRhPXRydWVcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgZ3JhcGgubG9vcHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGxvb3AgPSBncmFwaC5sb29wc1sgaSBdO1xyXG4gICAgICBpZiAoIGxvb3Auc2hhcGVJZCA9PT0gQ0xJUF9TSEFQRV9JRCApIHtcclxuICAgICAgICBmb3IgKCBqID0gMDsgaiA8IGxvb3AuaGFsZkVkZ2VzLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgICAgbG9vcC5oYWxmRWRnZXNbIGogXS5lZGdlLmRhdGEgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1YnBhdGhzID0gW107XHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IGdyYXBoLmxvb3BzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBsb29wID0gZ3JhcGgubG9vcHNbIGkgXTtcclxuICAgICAgaWYgKCBsb29wLnNoYXBlSWQgPT09IFNIQVBFX0lEICkge1xyXG4gICAgICAgIGxldCBzZWdtZW50cyA9IFtdO1xyXG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgbG9vcC5oYWxmRWRnZXMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgICBjb25zdCBoYWxmRWRnZSA9IGxvb3AuaGFsZkVkZ2VzWyBqIF07XHJcblxyXG4gICAgICAgICAgY29uc3QgaW5jbHVkZWQgPSBoYWxmRWRnZS5lZGdlLmRhdGEgPyBvcHRpb25zLmluY2x1ZGVCb3VuZGFyeSA6IChcclxuICAgICAgICAgICAgc2ltcGxpZmllZENsaXBBcmVhU2hhcGUuY29udGFpbnNQb2ludCggaGFsZkVkZ2UuZWRnZS5zZWdtZW50LnBvc2l0aW9uQXQoIDAuNSApICkgPyBvcHRpb25zLmluY2x1ZGVJbnRlcmlvciA6IG9wdGlvbnMuaW5jbHVkZUV4dGVyaW9yXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgaWYgKCBpbmNsdWRlZCApIHtcclxuICAgICAgICAgICAgc2VnbWVudHMucHVzaCggaGFsZkVkZ2UuZ2V0RGlyZWN0aW9uYWxTZWdtZW50KCkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhbiBleGNsdWRlZCBzZWdtZW50IGluLWJldHdlZW4gaW5jbHVkZWQgc2VnbWVudHMsIHdlJ2xsIG5lZWQgdG8gc3BsaXQgaW50byBtb3JlIHN1YnBhdGhzIHRvIGhhbmRsZVxyXG4gICAgICAgICAgLy8gdGhlIGdhcC5cclxuICAgICAgICAgIGVsc2UgaWYgKCBzZWdtZW50cy5sZW5ndGggKSB7XHJcbiAgICAgICAgICAgIHN1YnBhdGhzLnB1c2goIG5ldyBTdWJwYXRoKCBzZWdtZW50cywgdW5kZWZpbmVkLCBsb29wLmNsb3NlZCApICk7XHJcbiAgICAgICAgICAgIHNlZ21lbnRzID0gW107XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggc2VnbWVudHMubGVuZ3RoICkge1xyXG4gICAgICAgICAgc3VicGF0aHMucHVzaCggbmV3IFN1YnBhdGgoIHNlZ21lbnRzLCB1bmRlZmluZWQsIGxvb3AuY2xvc2VkICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBncmFwaC5kaXNwb3NlKCk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBraXRlLlNoYXBlKCBzdWJwYXRocyApO1xyXG4gIH1cclxufVxyXG5cclxua2l0ZS5yZWdpc3RlciggJ0dyYXBoJywgR3JhcGggKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdyYXBoO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0sK0JBQStCO0FBQ3RELE9BQU9DLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxXQUFXLE1BQU0sc0NBQXNDO0FBQzlELE9BQU9DLFVBQVUsTUFBTSxxQ0FBcUM7QUFDNUQsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxTQUFTQyxHQUFHLEVBQUVDLFFBQVEsRUFBRUMsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLGVBQWUsRUFBRUMsYUFBYSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsT0FBTyxFQUFFQyxNQUFNLEVBQUVDLGlCQUFpQixRQUFRLGVBQWU7QUFFL0osSUFBSUMsUUFBUSxH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