// Copyright 2013-2023, University of Colorado Boulder

/**
 * A Canvas-style stateful (mutable) subpath, which tracks segments in addition to the points.
 *
 * See http://www.w3.org/TR/2dcontext/#concept-path
 * for the path / subpath Canvas concept.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Arc, kite, Line, LineStyles, Segment } from '../imports.js';
class Subpath {
  /**
   * @public
   *
   * NOTE: No arguments required (they are usually used for copy() usage or creation with new segments)
   *
   * @param {Array.<Segment>} [segments]
   * @param {Array.<Vector2>} [points]
   * @param {boolean} [closed]
   */
  constructor(segments, points, closed) {
    this.invalidatedEmitter = new TinyEmitter();
    // @public {Array.<Segment>}
    this.segments = [];

    // @public {Array.<Vector2>} recombine points if necessary, based off of start points of segments + the end point
    // of the last segment
    this.points = points || (segments && segments.length ? _.map(segments, segment => segment.start).concat(segments[segments.length - 1].end) : []);

    // @public {boolean}
    this.closed = !!closed;

    // cached stroked shape (so hit testing can be done quickly on stroked shapes)
    this._strokedSubpaths = null; // @private {Array.<Subpath>|null}
    this._strokedSubpathsComputed = false; // @private {boolean}
    this._strokedStyles = null; // @private {LineStyles|null}

    // {Bounds2|null} - If non-null, the bounds of the subpath
    this._bounds = null;

    // @private {function} - Invalidation listener
    this._invalidateListener = this.invalidate.bind(this);

    // @private {boolean} - So we can invalidate all of the points without firing invalidation tons of times
    this._invalidatingPoints = false;

    // Add all segments directly (hooks up invalidation listeners properly)
    if (segments) {
      for (let i = 0; i < segments.length; i++) {
        _.each(segments[i].getNondegenerateSegments(), segment => {
          this.addSegmentDirectly(segment);
        });
      }
    }
  }

  /**
   * Returns the bounds of this subpath. It is the bounding-box union of the bounds of each segment contained.
   * @public
   *
   * @returns {Bounds2}
   */
  getBounds() {
    if (this._bounds === null) {
      const bounds = Bounds2.NOTHING.copy();
      _.each(this.segments, segment => {
        bounds.includeBounds(segment.getBounds());
      });
      this._bounds = bounds;
    }
    return this._bounds;
  }
  get bounds() {
    return this.getBounds();
  }

  /**
   * Returns the (sometimes approximate) arc length of the subpath.
   * @public
   *
   * @param {number} [distanceEpsilon]
   * @param {number} [curveEpsilon]
   * @param {number} [maxLevels]
   * @returns {number}
   */
  getArcLength(distanceEpsilon, curveEpsilon, maxLevels) {
    let length = 0;
    for (let i = 0; i < this.segments.length; i++) {
      length += this.segments[i].getArcLength(distanceEpsilon, curveEpsilon, maxLevels);
    }
    return length;
  }

  /**
   * Returns an immutable copy of this subpath
   * @public
   *
   * @returns {Subpath}
   */
  copy() {
    return new Subpath(this.segments.slice(0), this.points.slice(0), this.closed);
  }

  /**
   * Invalidates all segments (then ourself), since some points in segments may have been changed.
   * @public
   */
  invalidatePoints() {
    this._invalidatingPoints = true;
    const numSegments = this.segments.length;
    for (let i = 0; i < numSegments; i++) {
      this.segments[i].invalidate();
    }
    this._invalidatingPoints = false;
    this.invalidate();
  }

  /**
   * Trigger invalidation (usually for our Shape)
   * @public (kite-internal)
   */
  invalidate() {
    if (!this._invalidatingPoints) {
      this._bounds = null;
      this._strokedSubpathsComputed = false;
      this.invalidatedEmitter.emit();
    }
  }

  /**
   * Adds a point to this subpath
   * @public
   *
   * @param {Vector2} point
   * @returns {Subpath}
   */
  addPoint(point) {
    this.points.push(point);
    return this; // allow chaining
  }

  /**
   * Adds a segment directly
   * @private - REALLY! Make sure we invalidate() after this is called
   *
   * @param {Segment} segment
   * @returns {Subpath}
   */
  addSegmentDirectly(segment) {
    assert && assert(segment.start.isFinite(), 'Segment start is infinite');
    assert && assert(segment.end.isFinite(), 'Segment end is infinite');
    assert && assert(segment.startTangent.isFinite(), 'Segment startTangent is infinite');
    assert && assert(segment.endTangent.isFinite(), 'Segment endTangent is infinite');
    assert && assert(segment.bounds.isEmpty() || segment.bounds.isFinite(), 'Segment bounds is infinite and non-empty');
    this.segments.push(segment);

    // Hook up an invalidation listener, so if this segment is invalidated, it will invalidate our subpath!
    // NOTE: if we add removal of segments, we'll need to remove these listeners, or we'll leak!
    segment.invalidationEmitter.addListener(this._invalidateListener);
    return this; // allow chaining
  }

  /**
   * Adds a segment to this subpath
   * @public
   *
   * @param {Segment} segment
   * @returns {Subpath}
   */
  addSegment(segment) {
    const nondegenerateSegments = segment.getNondegenerateSegments();
    const numNondegenerateSegments = nondegenerateSegments.length;
    for (let i = 0; i < numNondegenerateSegments; i++) {
      this.addSegmentDirectly(segment);
    }
    this.invalidate(); // need to invalidate after addSegmentDirectly

    return this; // allow chaining
  }

  /**
   * Adds a line segment from the start to end (if non-zero length) and marks the subpath as closed.
   * NOTE: normally you just want to mark the subpath as closed, and not generate the closing segment this way?
   * @public
   */
  addClosingSegment() {
    if (this.hasClosingSegment()) {
      const closingSegment = this.getClosingSegment();
      this.addSegmentDirectly(closingSegment);
      this.invalidate(); // need to invalidate after addSegmentDirectly
      this.addPoint(this.getFirstPoint());
      this.closed = true;
    }
  }

  /**
   * Sets this subpath to be a closed path
   * @public
   */
  close() {
    this.closed = true;

    // If needed, add a connecting "closing" segment
    this.addClosingSegment();
  }

  /**
   * Returns the numbers of points in this subpath
   * @public
   *
   * @returns {number}
   */
  getLength() {
    return this.points.length;
  }

  /**
   * Returns the first point of this subpath
   * @public
   *
   * @returns {Vector2}
   */
  getFirstPoint() {
    return _.first(this.points);
  }

  /**
   * Returns the last point of this subpath
   * @public
   *
   * @returns {Vector2}
   */
  getLastPoint() {
    return _.last(this.points);
  }

  /**
   * Returns the first segment of this subpath
   * @public
   *
   * @returns {Segment}
   */
  getFirstSegment() {
    return _.first(this.segments);
  }

  /**
   * Returns the last segment of this subpath
   * @public
   *
   * @returns {Segment}
   */
  getLastSegment() {
    return _.last(this.segments);
  }

  /**
   * Returns segments that include the "filled" area, which may include an extra closing segment if necessary.
   * @public
   *
   * @returns {Array.<Segment>}
   */
  getFillSegments() {
    const segments = this.segments.slice();
    if (this.hasClosingSegment()) {
      segments.push(this.getClosingSegment());
    }
    return segments;
  }

  /**
   * Determines if this subpath is drawable, i.e. if it contains asny segments
   * @public
   *
   * @returns {boolean}
   */
  isDrawable() {
    return this.segments.length > 0;
  }

  /**
   * Determines if this subpath is a closed path, i.e. if the flag is set to closed
   * @public
   *
   * @returns {boolean}
   */
  isClosed() {
    return this.closed;
  }

  /**
   * Determines if this subpath is a closed path, i.e. if it has a closed segment
   * @public
   *
   * @returns {boolean}
   */
  hasClosingSegment() {
    return !this.getFirstPoint().equalsEpsilon(this.getLastPoint(), 0.000000001);
  }

  /**
   * Returns a line that would close this subpath
   * @public
   *
   * @returns {Line}
   */
  getClosingSegment() {
    assert && assert(this.hasClosingSegment(), 'Implicit closing segment unnecessary on a fully closed path');
    return new Line(this.getLastPoint(), this.getFirstPoint());
  }

  /**
   * Returns an array of potential closest points on the subpath to the given point.
   * @public
   *
   * @param {Vector2} point
   * @returns {ClosestToPointResult[]}
   */
  getClosestPoints(point) {
    return Segment.filterClosestToPointResult(_.flatten(this.segments.map(segment => segment.getClosestPoints(point))));
  }

  /**
   * Draws the segment to the 2D Canvas context, assuming the context's current location is already at the start point
   * @public
   *
   * @param {CanvasRenderingContext2D} context
   */
  writeToContext(context) {
    if (this.isDrawable()) {
      const startPoint = this.getFirstSegment().start;
      context.moveTo(startPoint.x, startPoint.y); // the segments assume the current context position is at their start

      let len = this.segments.length;

      // Omit an ending line segment if our path is closed.
      // see https://github.com/phetsims/ph-scale/issues/83#issuecomment-512663949
      if (this.closed && len >= 2 && this.segments[len - 1] instanceof Line) {
        len--;
      }
      for (let i = 0; i < len; i++) {
        this.segments[i].writeToContext(context);
      }
      if (this.closed) {
        context.closePath();
      }
    }
  }

  /**
   * Converts this subpath to a new subpath made of many line segments (approximating the current subpath)
   * @public
   *
   * @param {Object} [options] -           with the following options provided:
   *  - minLevels:                       how many levels to force subdivisions
   *  - maxLevels:                       prevent subdivision past this level
   *  - distanceEpsilon (optional null): controls level of subdivision by attempting to ensure a maximum (squared) deviation from the curve
   *  - curveEpsilon (optional null):    controls level of subdivision by attempting to ensure a maximum curvature change between segments
   *  - pointMap (optional):             function( Vector2 ) : Vector2, represents a (usually non-linear) transformation applied
   *  - methodName (optional):           if the method name is found on the segment, it is called with the expected signature function( options ) : Array[Segment]
   *                                     instead of using our brute-force logic
   * @returns {Subpath}
   */
  toPiecewiseLinear(options) {
    assert && assert(!options.pointMap, 'For use with pointMap, please use nonlinearTransformed');
    return new Subpath(_.flatten(_.map(this.segments, segment => segment.toPiecewiseLinearSegments(options))), null, this.closed);
  }

  /**
   * Returns a copy of this Subpath transformed with the given matrix.
   * @public
   *
   * @param {Matrix3} matrix
   * @returns {Subpath}
   */
  transformed(matrix) {
    return new Subpath(_.map(this.segments, segment => segment.transformed(matrix)), _.map(this.points, point => matrix.timesVector2(point)), this.closed);
  }

  /**
   * Converts this subpath to a new subpath made of many line segments (approximating the current subpath) with the
   * transformation applied.
   * @public
   *
   * @param {Object} [options] -           with the following options provided:
   *  - minLevels:                       how many levels to force subdivisions
   *  - maxLevels:                       prevent subdivision past this level
   *  - distanceEpsilon (optional null): controls level of subdivision by attempting to ensure a maximum (squared) deviation from the curve
   *  - curveEpsilon (optional null):    controls level of subdivision by attempting to ensure a maximum curvature change between segments
   *  - pointMap (optional):             function( Vector2 ) : Vector2, represents a (usually non-linear) transformation applied
   *  - methodName (optional):           if the method name is found on the segment, it is called with the expected signature function( options ) : Array[Segment]
   *                                     instead of using our brute-force logic
   * @returns {Subpath}
   */
  nonlinearTransformed(options) {
    return new Subpath(_.flatten(_.map(this.segments, segment => {
      // check for this segment's support for the specific transform or discretization being applied
      if (options.methodName && segment[options.methodName]) {
        return segment[options.methodName](options);
      } else {
        return segment.toPiecewiseLinearSegments(options);
      }
    })), null, this.closed);
  }

  /**
   * Returns the bounds of this subpath when transform by a matrix.
   * @public
   *
   * @param {Matrix3} matrix
   * @returns {bounds}
   */
  getBoundsWithTransform(matrix) {
    const bounds = Bounds2.NOTHING.copy();
    const numSegments = this.segments.length;
    for (let i = 0; i < numSegments; i++) {
      bounds.includeBounds(this.segments[i].getBoundsWithTransform(matrix));
    }
    return bounds;
  }

  /**
   * Returns a subpath that is offset from this subpath by a distance
   * @public
   *
   * TODO: Resolve the bug with the inside-line-join overlap. We have the intersection handling now (potentially)
   *
   * @param {number} distance
   * @returns {Subpath}
   */
  offset(distance) {
    if (!this.isDrawable()) {
      return new Subpath([], null, this.closed);
    }
    if (distance === 0) {
      return new Subpath(this.segments.slice(), null, this.closed);
    }
    let i;
    const regularSegments = this.segments.slice();
    const offsets = [];
    for (i = 0; i < regularSegments.length; i++) {
      offsets.push(regularSegments[i].strokeLeft(2 * distance));
    }
    let segments = [];
    for (i = 0; i < regularSegments.length; i++) {
      if (this.closed || i > 0) {
        const previousI = (i > 0 ? i : regularSegments.length) - 1;
        const center = regularSegments[i].start;
        const fromTangent = regularSegments[previousI].endTangent;
        const toTangent = regularSegments[i].startTangent;
        const startAngle = fromTangent.perpendicular.negated().times(distance).angle;
        const endAngle = toTangent.perpendicular.negated().times(distance).angle;
        const anticlockwise = fromTangent.perpendicular.dot(toTangent) > 0;
        segments.push(new Arc(center, Math.abs(distance), startAngle, endAngle, anticlockwise));
      }
      segments = segments.concat(offsets[i]);
    }
    return new Subpath(segments, null, this.closed);
  }

  /**
   * Returns an array of subpaths (one if open, two if closed) that represent a stroked copy of this subpath.
   * @public
   *
   * @param {LineStyles} lineStyles
   * @returns {Array.<Subpath>}
   */
  stroked(lineStyles) {
    // non-drawable subpaths convert to empty subpaths
    if (!this.isDrawable()) {
      return [];
    }
    if (lineStyles === undefined) {
      lineStyles = new LineStyles();
    }

    // return a cached version if possible
    if (this._strokedSubpathsComputed && this._strokedStyles.equals(lineStyles)) {
      return this._strokedSubpaths;
    }
    const lineWidth = lineStyles.lineWidth;
    let i;
    let leftSegments = [];
    let rightSegments = [];
    const firstSegment = this.getFirstSegment();
    const lastSegment = this.getLastSegment();
    function appendLeftSegments(segments) {
      leftSegments = leftSegments.concat(segments);
    }
    function appendRightSegments(segments) {
      rightSegments = rightSegments.concat(segments);
    }

    // we don't need to insert an implicit closing segment if the start and end points are the same
    const alreadyClosed = lastSegment.end.equals(firstSegment.start);
    // if there is an implicit closing segment
    const closingSegment = alreadyClosed ? null : new Line(this.segments[this.segments.length - 1].end, this.segments[0].start);

    // stroke the logical "left" side of our path
    for (i = 0; i < this.segments.length; i++) {
      if (i > 0) {
        appendLeftSegments(lineStyles.leftJoin(this.segments[i].start, this.segments[i - 1].endTangent, this.segments[i].startTangent));
      }
      appendLeftSegments(this.segments[i].strokeLeft(lineWidth));
    }

    // stroke the logical "right" side of our path
    for (i = this.segments.length - 1; i >= 0; i--) {
      if (i < this.segments.length - 1) {
        appendRightSegments(lineStyles.rightJoin(this.segments[i].end, this.segments[i].endTangent, this.segments[i + 1].startTangent));
      }
      appendRightSegments(this.segments[i].strokeRight(lineWidth));
    }
    let subpaths;
    if (this.closed) {
      if (alreadyClosed) {
        // add the joins between the start and end
        appendLeftSegments(lineStyles.leftJoin(lastSegment.end, lastSegment.endTangent, firstSegment.startTangent));
        appendRightSegments(lineStyles.rightJoin(lastSegment.end, lastSegment.endTangent, firstSegment.startTangent));
      } else {
        // logical "left" stroke on the implicit closing segment
        appendLeftSegments(lineStyles.leftJoin(closingSegment.start, lastSegment.endTangent, closingSegment.startTangent));
        appendLeftSegments(closingSegment.strokeLeft(lineWidth));
        appendLeftSegments(lineStyles.leftJoin(closingSegment.end, closingSegment.endTangent, firstSegment.startTangent));

        // logical "right" stroke on the implicit closing segment
        appendRightSegments(lineStyles.rightJoin(closingSegment.end, closingSegment.endTangent, firstSegment.startTangent));
        appendRightSegments(closingSegment.strokeRight(lineWidth));
        appendRightSegments(lineStyles.rightJoin(closingSegment.start, lastSegment.endTangent, closingSegment.startTangent));
      }
      subpaths = [new Subpath(leftSegments, null, true), new Subpath(rightSegments, null, true)];
    } else {
      subpaths = [new Subpath(leftSegments.concat(lineStyles.cap(lastSegment.end, lastSegment.endTangent)).concat(rightSegments).concat(lineStyles.cap(firstSegment.start, firstSegment.startTangent.negated())), null, true)];
    }
    this._strokedSubpaths = subpaths;
    this._strokedSubpathsComputed = true;
    this._strokedStyles = lineStyles.copy(); // shallow copy, since we consider linestyles to be mutable

    return subpaths;
  }

  /**
   * Returns a copy of this subpath with the dash "holes" removed (has many subpaths usually).
   * @public
   *
   * @param {Array.<number>} lineDash
   * @param {number} lineDashOffset
   * @param {number} distanceEpsilon - controls level of subdivision by attempting to ensure a maximum (squared)
   *                                   deviation from the curve
   * @param {number} curveEpsilon - controls level of subdivision by attempting to ensure a maximum curvature change
   *                                between segments
   * @returns {Array.<Subpath>}
   */
  dashed(lineDash, lineDashOffset, distanceEpsilon, curveEpsilon) {
    // Combine segment arrays (collapsing the two-most-adjacent arrays into one, with concatenation)
    function combineSegmentArrays(left, right) {
      const combined = left[left.length - 1].concat(right[0]);
      const result = left.slice(0, left.length - 1).concat([combined]).concat(right.slice(1));
      assert && assert(result.length === left.length + right.length - 1);
      return result;
    }

    // Whether two dash items (return type from getDashValues()) can be combined together to have their end segments
    // combined with combineSegmentArrays.
    function canBeCombined(leftItem, rightItem) {
      if (!leftItem.hasRightFilled || !rightItem.hasLeftFilled) {
        return false;
      }
      const leftSegment = _.last(_.last(leftItem.segmentArrays));
      const rightSegment = rightItem.segmentArrays[0][0];
      return leftSegment.end.distance(rightSegment.start) < 1e-5;
    }

    // Compute all of the dashes
    const dashItems = [];
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      const dashItem = segment.getDashValues(lineDash, lineDashOffset, distanceEpsilon, curveEpsilon);
      dashItems.push(dashItem);

      // We moved forward in the offset by this much
      lineDashOffset += dashItem.arcLength;
      const values = [0].concat(dashItem.values).concat([1]);
      const initiallyInside = dashItem.initiallyInside;

      // Mark whether the ends are filled, so adjacent filled ends can be combined
      dashItem.hasLeftFilled = initiallyInside;
      dashItem.hasRightFilled = values.length % 2 === 0 ? initiallyInside : !initiallyInside;

      // {Array.<Array.<Segment>>}, where each contained array will be turned into a subpath at the end.
      dashItem.segmentArrays = [];
      for (let j = initiallyInside ? 0 : 1; j < values.length - 1; j += 2) {
        if (values[j] !== values[j + 1]) {
          dashItem.segmentArrays.push([segment.slice(values[j], values[j + 1])]);
        }
      }
    }

    // Combine adjacent which both are filled on the middle
    for (let i = dashItems.length - 1; i >= 1; i--) {
      const leftItem = dashItems[i - 1];
      const rightItem = dashItems[i];
      if (canBeCombined(leftItem, rightItem)) {
        dashItems.splice(i - 1, 2, {
          segmentArrays: combineSegmentArrays(leftItem.segmentArrays, rightItem.segmentArrays),
          hasLeftFilled: leftItem.hasLeftFilled,
          hasRightFilled: rightItem.hasRightFilled
        });
      }
    }

    // Combine adjacent start/end if applicable
    if (dashItems.length > 1 && canBeCombined(dashItems[dashItems.length - 1], dashItems[0])) {
      const leftItem = dashItems.pop();
      const rightItem = dashItems.shift();
      dashItems.push({
        segmentArrays: combineSegmentArrays(leftItem.segmentArrays, rightItem.segmentArrays),
        hasLeftFilled: leftItem.hasLeftFilled,
        hasRightFilled: rightItem.hasRightFilled
      });
    }

    // Determine if we are closed (have only one subpath)
    if (this.closed && dashItems.length === 1 && dashItems[0].segmentArrays.length === 1 && dashItems[0].hasLeftFilled && dashItems[0].hasRightFilled) {
      return [new Subpath(dashItems[0].segmentArrays[0], null, true)];
    }

    // Convert to subpaths
    return _.flatten(dashItems.map(dashItem => dashItem.segmentArrays)).map(segments => new Subpath(segments));
  }

  /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   * @public
   *
   * @returns {Object}
   */
  serialize() {
    return {
      type: 'Subpath',
      segments: this.segments.map(segment => segment.serialize()),
      points: this.points.map(point => ({
        x: point.x,
        y: point.y
      })),
      closed: this.closed
    };
  }

  /**
   * Returns a Subpath from the serialized representation.
   * @public
   *
   * @param {Object} obj
   * @returns {Subpath}
   */
  static deserialize(obj) {
    assert && assert(obj.type === 'Subpath');
    return new Subpath(obj.segments.map(Segment.deserialize), obj.points.map(pt => new Vector2(pt.x, pt.y)), obj.closed);
  }
}
kite.register('Subpath', Subpath);
export default Subpath;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIkJvdW5kczIiLCJWZWN0b3IyIiwiQXJjIiwia2l0ZSIsIkxpbmUiLCJMaW5lU3R5bGVzIiwiU2VnbWVudCIsIlN1YnBhdGgiLCJjb25zdHJ1Y3RvciIsInNlZ21lbnRzIiwicG9pbnRzIiwiY2xvc2VkIiwiaW52YWxpZGF0ZWRFbWl0dGVyIiwibGVuZ3RoIiwiXyIsIm1hcCIsInNlZ21lbnQiLCJzdGFydCIsImNvbmNhdCIsImVuZCIsIl9zdHJva2VkU3VicGF0aHMiLCJfc3Ryb2tlZFN1YnBhdGhzQ29tcHV0ZWQiLCJfc3Ryb2tlZFN0eWxlcyIsIl9ib3VuZHMiLCJfaW52YWxpZGF0ZUxpc3RlbmVyIiwiaW52YWxpZGF0ZSIsImJpbmQiLCJfaW52YWxpZGF0aW5nUG9pbnRzIiwiaSIsImVhY2giLCJnZXROb25kZWdlbmVyYXRlU2VnbWVudHMiLCJhZGRTZWdtZW50RGlyZWN0bHkiLCJnZXRCb3VuZHMiLCJib3VuZHMiLCJOT1RISU5HIiwiY29weSIsImluY2x1ZGVCb3VuZHMiLCJnZXRBcmNMZW5ndGgiLCJkaXN0YW5jZUVwc2lsb24iLCJjdXJ2ZUVwc2lsb24iLCJtYXhMZXZlbHMiLCJzbGljZSIsImludmFsaWRhdGVQb2ludHMiLCJudW1TZWdtZW50cyIsImVtaXQiLCJhZGRQb2ludCIsInBvaW50IiwicHVzaCIsImFzc2VydCIsImlzRmluaXRlIiwic3RhcnRUYW5nZW50IiwiZW5kVGFuZ2VudCIsImlzRW1wdHkiLCJpbnZhbGlkYXRpb25FbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJhZGRTZWdtZW50Iiwibm9uZGVnZW5lcmF0ZVNlZ21lbnRzIiwibnVtTm9uZGVnZW5lcmF0ZVNlZ21lbnRzIiwiYWRkQ2xvc2luZ1NlZ21lbnQiLCJoYXNDbG9zaW5nU2VnbWVudCIsImNsb3NpbmdTZWdtZW50IiwiZ2V0Q2xvc2luZ1NlZ21lbnQiLCJnZXRGaXJzdFBvaW50IiwiY2xvc2UiLCJnZXRMZW5ndGgiLCJmaXJzdCIsImdldExhc3RQb2ludCIsImxhc3QiLCJnZXRGaXJzdFNlZ21lbnQiLCJnZXRMYXN0U2VnbWVudCIsImdldEZpbGxTZWdtZW50cyIsImlzRHJhd2FibGUiLCJpc0Nsb3NlZCIsImVxdWFsc0Vwc2lsb24iLCJnZXRDbG9zZXN0UG9pbnRzIiwiZmlsdGVyQ2xvc2VzdFRvUG9pbnRSZXN1bHQiLCJmbGF0dGVuIiwid3JpdGVUb0NvbnRleHQiLCJjb250ZXh0Iiwic3RhcnRQb2ludCIsIm1vdmVUbyIsIngiLCJ5IiwibGVuIiwiY2xvc2VQYXRoIiwidG9QaWVjZXdpc2VMaW5lYXIiLCJvcHRpb25zIiwicG9pbnRNYXAiLCJ0b1BpZWNld2lzZUxpbmVhclNlZ21lbnRzIiwidHJhbnNmb3JtZWQiLCJtYXRyaXgiLCJ0aW1lc1ZlY3RvcjIiLCJub25saW5lYXJUcmFuc2Zvcm1lZCIsIm1ldGhvZE5hbWUiLCJnZXRCb3VuZHNXaXRoVHJhbnNmb3JtIiwib2Zmc2V0IiwiZGlzdGFuY2UiLCJyZWd1bGFyU2VnbWVudHMiLCJvZmZzZXRzIiwic3Ryb2tlTGVmdCIsInByZXZpb3VzSSIsImNlbnRlciIsImZyb21UYW5nZW50IiwidG9UYW5nZW50Iiwic3RhcnRBbmdsZSIsInBlcnBlbmRpY3VsYXIiLCJuZWdhdGVkIiwidGltZXMiLCJhbmdsZSIsImVuZEFuZ2xlIiwiYW50aWNsb2Nrd2lzZSIsImRvdCIsIk1hdGgiLCJhYnMiLCJzdHJva2VkIiwibGluZVN0eWxlcyIsInVuZGVmaW5lZCIsImVxdWFscyIsImxpbmVXaWR0aCIsImxlZnRTZWdtZW50cyIsInJpZ2h0U2VnbWVudHMiLCJmaXJzdFNlZ21lbnQiLCJsYXN0U2VnbWVudCIsImFwcGVuZExlZnRTZWdtZW50cyIsImFwcGVuZFJpZ2h0U2VnbWVudHMiLCJhbHJlYWR5Q2xvc2VkIiwibGVmdEpvaW4iLCJyaWdodEpvaW4iLCJzdHJva2VSaWdodCIsInN1YnBhdGhzIiwiY2FwIiwiZGFzaGVkIiwibGluZURhc2giLCJsaW5lRGFzaE9mZnNldCIsImNvbWJpbmVTZWdtZW50QXJyYXlzIiwibGVmdCIsInJpZ2h0IiwiY29tYmluZWQiLCJyZXN1bHQiLCJjYW5CZUNvbWJpbmVkIiwibGVmdEl0ZW0iLCJyaWdodEl0ZW0iLCJoYXNSaWdodEZpbGxlZCIsImhhc0xlZnRGaWxsZWQiLCJsZWZ0U2VnbWVudCIsInNlZ21lbnRBcnJheXMiLCJyaWdodFNlZ21lbnQiLCJkYXNoSXRlbXMiLCJkYXNoSXRlbSIsImdldERhc2hWYWx1ZXMiLCJhcmNMZW5ndGgiLCJ2YWx1ZXMiLCJpbml0aWFsbHlJbnNpZGUiLCJqIiwic3BsaWNlIiwicG9wIiwic2hpZnQiLCJzZXJpYWxpemUiLCJ0eXBlIiwiZGVzZXJpYWxpemUiLCJvYmoiLCJwdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3VicGF0aC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIENhbnZhcy1zdHlsZSBzdGF0ZWZ1bCAobXV0YWJsZSkgc3VicGF0aCwgd2hpY2ggdHJhY2tzIHNlZ21lbnRzIGluIGFkZGl0aW9uIHRvIHRoZSBwb2ludHMuXHJcbiAqXHJcbiAqIFNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi8yZGNvbnRleHQvI2NvbmNlcHQtcGF0aFxyXG4gKiBmb3IgdGhlIHBhdGggLyBzdWJwYXRoIENhbnZhcyBjb25jZXB0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgQXJjLCBraXRlLCBMaW5lLCBMaW5lU3R5bGVzLCBTZWdtZW50IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5jbGFzcyBTdWJwYXRoIHtcclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBOT1RFOiBObyBhcmd1bWVudHMgcmVxdWlyZWQgKHRoZXkgYXJlIHVzdWFsbHkgdXNlZCBmb3IgY29weSgpIHVzYWdlIG9yIGNyZWF0aW9uIHdpdGggbmV3IHNlZ21lbnRzKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48U2VnbWVudD59IFtzZWdtZW50c11cclxuICAgKiBAcGFyYW0ge0FycmF5LjxWZWN0b3IyPn0gW3BvaW50c11cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjbG9zZWRdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHNlZ21lbnRzLCBwb2ludHMsIGNsb3NlZCApIHtcclxuICAgIHRoaXMuaW52YWxpZGF0ZWRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48U2VnbWVudD59XHJcbiAgICB0aGlzLnNlZ21lbnRzID0gW107XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFZlY3RvcjI+fSByZWNvbWJpbmUgcG9pbnRzIGlmIG5lY2Vzc2FyeSwgYmFzZWQgb2ZmIG9mIHN0YXJ0IHBvaW50cyBvZiBzZWdtZW50cyArIHRoZSBlbmQgcG9pbnRcclxuICAgIC8vIG9mIHRoZSBsYXN0IHNlZ21lbnRcclxuICAgIHRoaXMucG9pbnRzID0gcG9pbnRzIHx8ICggKCBzZWdtZW50cyAmJiBzZWdtZW50cy5sZW5ndGggKSA/IF8ubWFwKCBzZWdtZW50cywgc2VnbWVudCA9PiBzZWdtZW50LnN0YXJ0ICkuY29uY2F0KCBzZWdtZW50c1sgc2VnbWVudHMubGVuZ3RoIC0gMSBdLmVuZCApIDogW10gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufVxyXG4gICAgdGhpcy5jbG9zZWQgPSAhIWNsb3NlZDtcclxuXHJcbiAgICAvLyBjYWNoZWQgc3Ryb2tlZCBzaGFwZSAoc28gaGl0IHRlc3RpbmcgY2FuIGJlIGRvbmUgcXVpY2tseSBvbiBzdHJva2VkIHNoYXBlcylcclxuICAgIHRoaXMuX3N0cm9rZWRTdWJwYXRocyA9IG51bGw7IC8vIEBwcml2YXRlIHtBcnJheS48U3VicGF0aD58bnVsbH1cclxuICAgIHRoaXMuX3N0cm9rZWRTdWJwYXRoc0NvbXB1dGVkID0gZmFsc2U7IC8vIEBwcml2YXRlIHtib29sZWFufVxyXG4gICAgdGhpcy5fc3Ryb2tlZFN0eWxlcyA9IG51bGw7IC8vIEBwcml2YXRlIHtMaW5lU3R5bGVzfG51bGx9XHJcblxyXG4gICAgLy8ge0JvdW5kczJ8bnVsbH0gLSBJZiBub24tbnVsbCwgdGhlIGJvdW5kcyBvZiB0aGUgc3VicGF0aFxyXG4gICAgdGhpcy5fYm91bmRzID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259IC0gSW52YWxpZGF0aW9uIGxpc3RlbmVyXHJcbiAgICB0aGlzLl9pbnZhbGlkYXRlTGlzdGVuZXIgPSB0aGlzLmludmFsaWRhdGUuYmluZCggdGhpcyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIFNvIHdlIGNhbiBpbnZhbGlkYXRlIGFsbCBvZiB0aGUgcG9pbnRzIHdpdGhvdXQgZmlyaW5nIGludmFsaWRhdGlvbiB0b25zIG9mIHRpbWVzXHJcbiAgICB0aGlzLl9pbnZhbGlkYXRpbmdQb2ludHMgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBBZGQgYWxsIHNlZ21lbnRzIGRpcmVjdGx5IChob29rcyB1cCBpbnZhbGlkYXRpb24gbGlzdGVuZXJzIHByb3Blcmx5KVxyXG4gICAgaWYgKCBzZWdtZW50cyApIHtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc2VnbWVudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgXy5lYWNoKCBzZWdtZW50c1sgaSBdLmdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cygpLCBzZWdtZW50ID0+IHtcclxuICAgICAgICAgIHRoaXMuYWRkU2VnbWVudERpcmVjdGx5KCBzZWdtZW50ICk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYm91bmRzIG9mIHRoaXMgc3VicGF0aC4gSXQgaXMgdGhlIGJvdW5kaW5nLWJveCB1bmlvbiBvZiB0aGUgYm91bmRzIG9mIGVhY2ggc2VnbWVudCBjb250YWluZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge0JvdW5kczJ9XHJcbiAgICovXHJcbiAgZ2V0Qm91bmRzKCkge1xyXG4gICAgaWYgKCB0aGlzLl9ib3VuZHMgPT09IG51bGwgKSB7XHJcbiAgICAgIGNvbnN0IGJvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XHJcbiAgICAgIF8uZWFjaCggdGhpcy5zZWdtZW50cywgc2VnbWVudCA9PiB7XHJcbiAgICAgICAgYm91bmRzLmluY2x1ZGVCb3VuZHMoIHNlZ21lbnQuZ2V0Qm91bmRzKCkgKTtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLl9ib3VuZHMgPSBib3VuZHM7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fYm91bmRzO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGJvdW5kcygpIHsgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgKHNvbWV0aW1lcyBhcHByb3hpbWF0ZSkgYXJjIGxlbmd0aCBvZiB0aGUgc3VicGF0aC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gW2Rpc3RhbmNlRXBzaWxvbl1cclxuICAgKiBAcGFyYW0ge251bWJlcn0gW2N1cnZlRXBzaWxvbl1cclxuICAgKiBAcGFyYW0ge251bWJlcn0gW21heExldmVsc11cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEFyY0xlbmd0aCggZGlzdGFuY2VFcHNpbG9uLCBjdXJ2ZUVwc2lsb24sIG1heExldmVscyApIHtcclxuICAgIGxldCBsZW5ndGggPSAwO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zZWdtZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgbGVuZ3RoICs9IHRoaXMuc2VnbWVudHNbIGkgXS5nZXRBcmNMZW5ndGgoIGRpc3RhbmNlRXBzaWxvbiwgY3VydmVFcHNpbG9uLCBtYXhMZXZlbHMgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBsZW5ndGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGltbXV0YWJsZSBjb3B5IG9mIHRoaXMgc3VicGF0aFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTdWJwYXRofVxyXG4gICAqL1xyXG4gIGNvcHkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFN1YnBhdGgoIHRoaXMuc2VnbWVudHMuc2xpY2UoIDAgKSwgdGhpcy5wb2ludHMuc2xpY2UoIDAgKSwgdGhpcy5jbG9zZWQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludmFsaWRhdGVzIGFsbCBzZWdtZW50cyAodGhlbiBvdXJzZWxmKSwgc2luY2Ugc29tZSBwb2ludHMgaW4gc2VnbWVudHMgbWF5IGhhdmUgYmVlbiBjaGFuZ2VkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpbnZhbGlkYXRlUG9pbnRzKCkge1xyXG4gICAgdGhpcy5faW52YWxpZGF0aW5nUG9pbnRzID0gdHJ1ZTtcclxuXHJcbiAgICBjb25zdCBudW1TZWdtZW50cyA9IHRoaXMuc2VnbWVudHMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU2VnbWVudHM7IGkrKyApIHtcclxuICAgICAgdGhpcy5zZWdtZW50c1sgaSBdLmludmFsaWRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9pbnZhbGlkYXRpbmdQb2ludHMgPSBmYWxzZTtcclxuICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlciBpbnZhbGlkYXRpb24gKHVzdWFsbHkgZm9yIG91ciBTaGFwZSlcclxuICAgKiBAcHVibGljIChraXRlLWludGVybmFsKVxyXG4gICAqL1xyXG4gIGludmFsaWRhdGUoKSB7XHJcbiAgICBpZiAoICF0aGlzLl9pbnZhbGlkYXRpbmdQb2ludHMgKSB7XHJcbiAgICAgIHRoaXMuX2JvdW5kcyA9IG51bGw7XHJcbiAgICAgIHRoaXMuX3N0cm9rZWRTdWJwYXRoc0NvbXB1dGVkID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBwb2ludCB0byB0aGlzIHN1YnBhdGhcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvaW50XHJcbiAgICogQHJldHVybnMge1N1YnBhdGh9XHJcbiAgICovXHJcbiAgYWRkUG9pbnQoIHBvaW50ICkge1xyXG4gICAgdGhpcy5wb2ludHMucHVzaCggcG9pbnQgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBzZWdtZW50IGRpcmVjdGx5XHJcbiAgICogQHByaXZhdGUgLSBSRUFMTFkhIE1ha2Ugc3VyZSB3ZSBpbnZhbGlkYXRlKCkgYWZ0ZXIgdGhpcyBpcyBjYWxsZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2VnbWVudH0gc2VnbWVudFxyXG4gICAqIEByZXR1cm5zIHtTdWJwYXRofVxyXG4gICAqL1xyXG4gIGFkZFNlZ21lbnREaXJlY3RseSggc2VnbWVudCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlZ21lbnQuc3RhcnQuaXNGaW5pdGUoKSwgJ1NlZ21lbnQgc3RhcnQgaXMgaW5maW5pdGUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWdtZW50LmVuZC5pc0Zpbml0ZSgpLCAnU2VnbWVudCBlbmQgaXMgaW5maW5pdGUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWdtZW50LnN0YXJ0VGFuZ2VudC5pc0Zpbml0ZSgpLCAnU2VnbWVudCBzdGFydFRhbmdlbnQgaXMgaW5maW5pdGUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWdtZW50LmVuZFRhbmdlbnQuaXNGaW5pdGUoKSwgJ1NlZ21lbnQgZW5kVGFuZ2VudCBpcyBpbmZpbml0ZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlZ21lbnQuYm91bmRzLmlzRW1wdHkoKSB8fCBzZWdtZW50LmJvdW5kcy5pc0Zpbml0ZSgpLCAnU2VnbWVudCBib3VuZHMgaXMgaW5maW5pdGUgYW5kIG5vbi1lbXB0eScgKTtcclxuICAgIHRoaXMuc2VnbWVudHMucHVzaCggc2VnbWVudCApO1xyXG5cclxuICAgIC8vIEhvb2sgdXAgYW4gaW52YWxpZGF0aW9uIGxpc3RlbmVyLCBzbyBpZiB0aGlzIHNlZ21lbnQgaXMgaW52YWxpZGF0ZWQsIGl0IHdpbGwgaW52YWxpZGF0ZSBvdXIgc3VicGF0aCFcclxuICAgIC8vIE5PVEU6IGlmIHdlIGFkZCByZW1vdmFsIG9mIHNlZ21lbnRzLCB3ZSdsbCBuZWVkIHRvIHJlbW92ZSB0aGVzZSBsaXN0ZW5lcnMsIG9yIHdlJ2xsIGxlYWshXHJcbiAgICBzZWdtZW50LmludmFsaWRhdGlvbkVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX2ludmFsaWRhdGVMaXN0ZW5lciApO1xyXG5cclxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIHNlZ21lbnQgdG8gdGhpcyBzdWJwYXRoXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTZWdtZW50fSBzZWdtZW50XHJcbiAgICogQHJldHVybnMge1N1YnBhdGh9XHJcbiAgICovXHJcbiAgYWRkU2VnbWVudCggc2VnbWVudCApIHtcclxuICAgIGNvbnN0IG5vbmRlZ2VuZXJhdGVTZWdtZW50cyA9IHNlZ21lbnQuZ2V0Tm9uZGVnZW5lcmF0ZVNlZ21lbnRzKCk7XHJcbiAgICBjb25zdCBudW1Ob25kZWdlbmVyYXRlU2VnbWVudHMgPSBub25kZWdlbmVyYXRlU2VnbWVudHMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtTm9uZGVnZW5lcmF0ZVNlZ21lbnRzOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuYWRkU2VnbWVudERpcmVjdGx5KCBzZWdtZW50ICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmludmFsaWRhdGUoKTsgLy8gbmVlZCB0byBpbnZhbGlkYXRlIGFmdGVyIGFkZFNlZ21lbnREaXJlY3RseVxyXG5cclxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIGxpbmUgc2VnbWVudCBmcm9tIHRoZSBzdGFydCB0byBlbmQgKGlmIG5vbi16ZXJvIGxlbmd0aCkgYW5kIG1hcmtzIHRoZSBzdWJwYXRoIGFzIGNsb3NlZC5cclxuICAgKiBOT1RFOiBub3JtYWxseSB5b3UganVzdCB3YW50IHRvIG1hcmsgdGhlIHN1YnBhdGggYXMgY2xvc2VkLCBhbmQgbm90IGdlbmVyYXRlIHRoZSBjbG9zaW5nIHNlZ21lbnQgdGhpcyB3YXk/XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZENsb3NpbmdTZWdtZW50KCkge1xyXG4gICAgaWYgKCB0aGlzLmhhc0Nsb3NpbmdTZWdtZW50KCkgKSB7XHJcbiAgICAgIGNvbnN0IGNsb3NpbmdTZWdtZW50ID0gdGhpcy5nZXRDbG9zaW5nU2VnbWVudCgpO1xyXG4gICAgICB0aGlzLmFkZFNlZ21lbnREaXJlY3RseSggY2xvc2luZ1NlZ21lbnQgKTtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7IC8vIG5lZWQgdG8gaW52YWxpZGF0ZSBhZnRlciBhZGRTZWdtZW50RGlyZWN0bHlcclxuICAgICAgdGhpcy5hZGRQb2ludCggdGhpcy5nZXRGaXJzdFBvaW50KCkgKTtcclxuICAgICAgdGhpcy5jbG9zZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIHN1YnBhdGggdG8gYmUgYSBjbG9zZWQgcGF0aFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjbG9zZSgpIHtcclxuICAgIHRoaXMuY2xvc2VkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBJZiBuZWVkZWQsIGFkZCBhIGNvbm5lY3RpbmcgXCJjbG9zaW5nXCIgc2VnbWVudFxyXG4gICAgdGhpcy5hZGRDbG9zaW5nU2VnbWVudCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbnVtYmVycyBvZiBwb2ludHMgaW4gdGhpcyBzdWJwYXRoXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRMZW5ndGgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wb2ludHMubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgZmlyc3QgcG9pbnQgb2YgdGhpcyBzdWJwYXRoXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgZ2V0Rmlyc3RQb2ludCgpIHtcclxuICAgIHJldHVybiBfLmZpcnN0KCB0aGlzLnBvaW50cyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbGFzdCBwb2ludCBvZiB0aGlzIHN1YnBhdGhcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKi9cclxuICBnZXRMYXN0UG9pbnQoKSB7XHJcbiAgICByZXR1cm4gXy5sYXN0KCB0aGlzLnBvaW50cyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgZmlyc3Qgc2VnbWVudCBvZiB0aGlzIHN1YnBhdGhcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7U2VnbWVudH1cclxuICAgKi9cclxuICBnZXRGaXJzdFNlZ21lbnQoKSB7XHJcbiAgICByZXR1cm4gXy5maXJzdCggdGhpcy5zZWdtZW50cyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbGFzdCBzZWdtZW50IG9mIHRoaXMgc3VicGF0aFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTZWdtZW50fVxyXG4gICAqL1xyXG4gIGdldExhc3RTZWdtZW50KCkge1xyXG4gICAgcmV0dXJuIF8ubGFzdCggdGhpcy5zZWdtZW50cyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBzZWdtZW50cyB0aGF0IGluY2x1ZGUgdGhlIFwiZmlsbGVkXCIgYXJlYSwgd2hpY2ggbWF5IGluY2x1ZGUgYW4gZXh0cmEgY2xvc2luZyBzZWdtZW50IGlmIG5lY2Vzc2FyeS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPFNlZ21lbnQ+fVxyXG4gICAqL1xyXG4gIGdldEZpbGxTZWdtZW50cygpIHtcclxuICAgIGNvbnN0IHNlZ21lbnRzID0gdGhpcy5zZWdtZW50cy5zbGljZSgpO1xyXG4gICAgaWYgKCB0aGlzLmhhc0Nsb3NpbmdTZWdtZW50KCkgKSB7XHJcbiAgICAgIHNlZ21lbnRzLnB1c2goIHRoaXMuZ2V0Q2xvc2luZ1NlZ21lbnQoKSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlZ21lbnRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBpZiB0aGlzIHN1YnBhdGggaXMgZHJhd2FibGUsIGkuZS4gaWYgaXQgY29udGFpbnMgYXNueSBzZWdtZW50c1xyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzRHJhd2FibGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZWdtZW50cy5sZW5ndGggPiAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBpZiB0aGlzIHN1YnBhdGggaXMgYSBjbG9zZWQgcGF0aCwgaS5lLiBpZiB0aGUgZmxhZyBpcyBzZXQgdG8gY2xvc2VkXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNDbG9zZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jbG9zZWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIGlmIHRoaXMgc3VicGF0aCBpcyBhIGNsb3NlZCBwYXRoLCBpLmUuIGlmIGl0IGhhcyBhIGNsb3NlZCBzZWdtZW50XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaGFzQ2xvc2luZ1NlZ21lbnQoKSB7XHJcbiAgICByZXR1cm4gIXRoaXMuZ2V0Rmlyc3RQb2ludCgpLmVxdWFsc0Vwc2lsb24oIHRoaXMuZ2V0TGFzdFBvaW50KCksIDAuMDAwMDAwMDAxICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbGluZSB0aGF0IHdvdWxkIGNsb3NlIHRoaXMgc3VicGF0aFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtMaW5lfVxyXG4gICAqL1xyXG4gIGdldENsb3NpbmdTZWdtZW50KCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5oYXNDbG9zaW5nU2VnbWVudCgpLCAnSW1wbGljaXQgY2xvc2luZyBzZWdtZW50IHVubmVjZXNzYXJ5IG9uIGEgZnVsbHkgY2xvc2VkIHBhdGgnICk7XHJcbiAgICByZXR1cm4gbmV3IExpbmUoIHRoaXMuZ2V0TGFzdFBvaW50KCksIHRoaXMuZ2V0Rmlyc3RQb2ludCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHBvdGVudGlhbCBjbG9zZXN0IHBvaW50cyBvbiB0aGUgc3VicGF0aCB0byB0aGUgZ2l2ZW4gcG9pbnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb2ludFxyXG4gICAqIEByZXR1cm5zIHtDbG9zZXN0VG9Qb2ludFJlc3VsdFtdfVxyXG4gICAqL1xyXG4gIGdldENsb3Nlc3RQb2ludHMoIHBvaW50ICkge1xyXG4gICAgcmV0dXJuIFNlZ21lbnQuZmlsdGVyQ2xvc2VzdFRvUG9pbnRSZXN1bHQoIF8uZmxhdHRlbiggdGhpcy5zZWdtZW50cy5tYXAoIHNlZ21lbnQgPT4gc2VnbWVudC5nZXRDbG9zZXN0UG9pbnRzKCBwb2ludCApICkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHJhd3MgdGhlIHNlZ21lbnQgdG8gdGhlIDJEIENhbnZhcyBjb250ZXh0LCBhc3N1bWluZyB0aGUgY29udGV4dCdzIGN1cnJlbnQgbG9jYXRpb24gaXMgYWxyZWFkeSBhdCB0aGUgc3RhcnQgcG9pbnRcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY29udGV4dFxyXG4gICAqL1xyXG4gIHdyaXRlVG9Db250ZXh0KCBjb250ZXh0ICkge1xyXG4gICAgaWYgKCB0aGlzLmlzRHJhd2FibGUoKSApIHtcclxuICAgICAgY29uc3Qgc3RhcnRQb2ludCA9IHRoaXMuZ2V0Rmlyc3RTZWdtZW50KCkuc3RhcnQ7XHJcbiAgICAgIGNvbnRleHQubW92ZVRvKCBzdGFydFBvaW50LngsIHN0YXJ0UG9pbnQueSApOyAvLyB0aGUgc2VnbWVudHMgYXNzdW1lIHRoZSBjdXJyZW50IGNvbnRleHQgcG9zaXRpb24gaXMgYXQgdGhlaXIgc3RhcnRcclxuXHJcbiAgICAgIGxldCBsZW4gPSB0aGlzLnNlZ21lbnRzLmxlbmd0aDtcclxuXHJcbiAgICAgIC8vIE9taXQgYW4gZW5kaW5nIGxpbmUgc2VnbWVudCBpZiBvdXIgcGF0aCBpcyBjbG9zZWQuXHJcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGgtc2NhbGUvaXNzdWVzLzgzI2lzc3VlY29tbWVudC01MTI2NjM5NDlcclxuICAgICAgaWYgKCB0aGlzLmNsb3NlZCAmJiBsZW4gPj0gMiAmJiB0aGlzLnNlZ21lbnRzWyBsZW4gLSAxIF0gaW5zdGFuY2VvZiBMaW5lICkge1xyXG4gICAgICAgIGxlbi0tO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcclxuICAgICAgICB0aGlzLnNlZ21lbnRzWyBpIF0ud3JpdGVUb0NvbnRleHQoIGNvbnRleHQgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCB0aGlzLmNsb3NlZCApIHtcclxuICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyB0aGlzIHN1YnBhdGggdG8gYSBuZXcgc3VicGF0aCBtYWRlIG9mIG1hbnkgbGluZSBzZWdtZW50cyAoYXBwcm94aW1hdGluZyB0aGUgY3VycmVudCBzdWJwYXRoKVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSAgICAgICAgICAgd2l0aCB0aGUgZm9sbG93aW5nIG9wdGlvbnMgcHJvdmlkZWQ6XHJcbiAgICogIC0gbWluTGV2ZWxzOiAgICAgICAgICAgICAgICAgICAgICAgaG93IG1hbnkgbGV2ZWxzIHRvIGZvcmNlIHN1YmRpdmlzaW9uc1xyXG4gICAqICAtIG1heExldmVsczogICAgICAgICAgICAgICAgICAgICAgIHByZXZlbnQgc3ViZGl2aXNpb24gcGFzdCB0aGlzIGxldmVsXHJcbiAgICogIC0gZGlzdGFuY2VFcHNpbG9uIChvcHRpb25hbCBudWxsKTogY29udHJvbHMgbGV2ZWwgb2Ygc3ViZGl2aXNpb24gYnkgYXR0ZW1wdGluZyB0byBlbnN1cmUgYSBtYXhpbXVtIChzcXVhcmVkKSBkZXZpYXRpb24gZnJvbSB0aGUgY3VydmVcclxuICAgKiAgLSBjdXJ2ZUVwc2lsb24gKG9wdGlvbmFsIG51bGwpOiAgICBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gY3VydmF0dXJlIGNoYW5nZSBiZXR3ZWVuIHNlZ21lbnRzXHJcbiAgICogIC0gcG9pbnRNYXAgKG9wdGlvbmFsKTogICAgICAgICAgICAgZnVuY3Rpb24oIFZlY3RvcjIgKSA6IFZlY3RvcjIsIHJlcHJlc2VudHMgYSAodXN1YWxseSBub24tbGluZWFyKSB0cmFuc2Zvcm1hdGlvbiBhcHBsaWVkXHJcbiAgICogIC0gbWV0aG9kTmFtZSAob3B0aW9uYWwpOiAgICAgICAgICAgaWYgdGhlIG1ldGhvZCBuYW1lIGlzIGZvdW5kIG9uIHRoZSBzZWdtZW50LCBpdCBpcyBjYWxsZWQgd2l0aCB0aGUgZXhwZWN0ZWQgc2lnbmF0dXJlIGZ1bmN0aW9uKCBvcHRpb25zICkgOiBBcnJheVtTZWdtZW50XVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RlYWQgb2YgdXNpbmcgb3VyIGJydXRlLWZvcmNlIGxvZ2ljXHJcbiAgICogQHJldHVybnMge1N1YnBhdGh9XHJcbiAgICovXHJcbiAgdG9QaWVjZXdpc2VMaW5lYXIoIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5wb2ludE1hcCwgJ0ZvciB1c2Ugd2l0aCBwb2ludE1hcCwgcGxlYXNlIHVzZSBub25saW5lYXJUcmFuc2Zvcm1lZCcgKTtcclxuICAgIHJldHVybiBuZXcgU3VicGF0aCggXy5mbGF0dGVuKCBfLm1hcCggdGhpcy5zZWdtZW50cywgc2VnbWVudCA9PiBzZWdtZW50LnRvUGllY2V3aXNlTGluZWFyU2VnbWVudHMoIG9wdGlvbnMgKSApICksIG51bGwsIHRoaXMuY2xvc2VkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgY29weSBvZiB0aGlzIFN1YnBhdGggdHJhbnNmb3JtZWQgd2l0aCB0aGUgZ2l2ZW4gbWF0cml4LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4M30gbWF0cml4XHJcbiAgICogQHJldHVybnMge1N1YnBhdGh9XHJcbiAgICovXHJcbiAgdHJhbnNmb3JtZWQoIG1hdHJpeCApIHtcclxuICAgIHJldHVybiBuZXcgU3VicGF0aChcclxuICAgICAgXy5tYXAoIHRoaXMuc2VnbWVudHMsIHNlZ21lbnQgPT4gc2VnbWVudC50cmFuc2Zvcm1lZCggbWF0cml4ICkgKSxcclxuICAgICAgXy5tYXAoIHRoaXMucG9pbnRzLCBwb2ludCA9PiBtYXRyaXgudGltZXNWZWN0b3IyKCBwb2ludCApICksXHJcbiAgICAgIHRoaXMuY2xvc2VkXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgdGhpcyBzdWJwYXRoIHRvIGEgbmV3IHN1YnBhdGggbWFkZSBvZiBtYW55IGxpbmUgc2VnbWVudHMgKGFwcHJveGltYXRpbmcgdGhlIGN1cnJlbnQgc3VicGF0aCkgd2l0aCB0aGVcclxuICAgKiB0cmFuc2Zvcm1hdGlvbiBhcHBsaWVkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSAgICAgICAgICAgd2l0aCB0aGUgZm9sbG93aW5nIG9wdGlvbnMgcHJvdmlkZWQ6XHJcbiAgICogIC0gbWluTGV2ZWxzOiAgICAgICAgICAgICAgICAgICAgICAgaG93IG1hbnkgbGV2ZWxzIHRvIGZvcmNlIHN1YmRpdmlzaW9uc1xyXG4gICAqICAtIG1heExldmVsczogICAgICAgICAgICAgICAgICAgICAgIHByZXZlbnQgc3ViZGl2aXNpb24gcGFzdCB0aGlzIGxldmVsXHJcbiAgICogIC0gZGlzdGFuY2VFcHNpbG9uIChvcHRpb25hbCBudWxsKTogY29udHJvbHMgbGV2ZWwgb2Ygc3ViZGl2aXNpb24gYnkgYXR0ZW1wdGluZyB0byBlbnN1cmUgYSBtYXhpbXVtIChzcXVhcmVkKSBkZXZpYXRpb24gZnJvbSB0aGUgY3VydmVcclxuICAgKiAgLSBjdXJ2ZUVwc2lsb24gKG9wdGlvbmFsIG51bGwpOiAgICBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gY3VydmF0dXJlIGNoYW5nZSBiZXR3ZWVuIHNlZ21lbnRzXHJcbiAgICogIC0gcG9pbnRNYXAgKG9wdGlvbmFsKTogICAgICAgICAgICAgZnVuY3Rpb24oIFZlY3RvcjIgKSA6IFZlY3RvcjIsIHJlcHJlc2VudHMgYSAodXN1YWxseSBub24tbGluZWFyKSB0cmFuc2Zvcm1hdGlvbiBhcHBsaWVkXHJcbiAgICogIC0gbWV0aG9kTmFtZSAob3B0aW9uYWwpOiAgICAgICAgICAgaWYgdGhlIG1ldGhvZCBuYW1lIGlzIGZvdW5kIG9uIHRoZSBzZWdtZW50LCBpdCBpcyBjYWxsZWQgd2l0aCB0aGUgZXhwZWN0ZWQgc2lnbmF0dXJlIGZ1bmN0aW9uKCBvcHRpb25zICkgOiBBcnJheVtTZWdtZW50XVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RlYWQgb2YgdXNpbmcgb3VyIGJydXRlLWZvcmNlIGxvZ2ljXHJcbiAgICogQHJldHVybnMge1N1YnBhdGh9XHJcbiAgICovXHJcbiAgbm9ubGluZWFyVHJhbnNmb3JtZWQoIG9wdGlvbnMgKSB7XHJcbiAgICByZXR1cm4gbmV3IFN1YnBhdGgoIF8uZmxhdHRlbiggXy5tYXAoIHRoaXMuc2VnbWVudHMsIHNlZ21lbnQgPT4ge1xyXG4gICAgICAvLyBjaGVjayBmb3IgdGhpcyBzZWdtZW50J3Mgc3VwcG9ydCBmb3IgdGhlIHNwZWNpZmljIHRyYW5zZm9ybSBvciBkaXNjcmV0aXphdGlvbiBiZWluZyBhcHBsaWVkXHJcbiAgICAgIGlmICggb3B0aW9ucy5tZXRob2ROYW1lICYmIHNlZ21lbnRbIG9wdGlvbnMubWV0aG9kTmFtZSBdICkge1xyXG4gICAgICAgIHJldHVybiBzZWdtZW50WyBvcHRpb25zLm1ldGhvZE5hbWUgXSggb3B0aW9ucyApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBzZWdtZW50LnRvUGllY2V3aXNlTGluZWFyU2VnbWVudHMoIG9wdGlvbnMgKTtcclxuICAgICAgfVxyXG4gICAgfSApICksIG51bGwsIHRoaXMuY2xvc2VkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBib3VuZHMgb2YgdGhpcyBzdWJwYXRoIHdoZW4gdHJhbnNmb3JtIGJ5IGEgbWF0cml4LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4M30gbWF0cml4XHJcbiAgICogQHJldHVybnMge2JvdW5kc31cclxuICAgKi9cclxuICBnZXRCb3VuZHNXaXRoVHJhbnNmb3JtKCBtYXRyaXggKSB7XHJcbiAgICBjb25zdCBib3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xyXG4gICAgY29uc3QgbnVtU2VnbWVudHMgPSB0aGlzLnNlZ21lbnRzLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bVNlZ21lbnRzOyBpKysgKSB7XHJcbiAgICAgIGJvdW5kcy5pbmNsdWRlQm91bmRzKCB0aGlzLnNlZ21lbnRzWyBpIF0uZ2V0Qm91bmRzV2l0aFRyYW5zZm9ybSggbWF0cml4ICkgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBib3VuZHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3VicGF0aCB0aGF0IGlzIG9mZnNldCBmcm9tIHRoaXMgc3VicGF0aCBieSBhIGRpc3RhbmNlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVE9ETzogUmVzb2x2ZSB0aGUgYnVnIHdpdGggdGhlIGluc2lkZS1saW5lLWpvaW4gb3ZlcmxhcC4gV2UgaGF2ZSB0aGUgaW50ZXJzZWN0aW9uIGhhbmRsaW5nIG5vdyAocG90ZW50aWFsbHkpXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2VcclxuICAgKiBAcmV0dXJucyB7U3VicGF0aH1cclxuICAgKi9cclxuICBvZmZzZXQoIGRpc3RhbmNlICkge1xyXG4gICAgaWYgKCAhdGhpcy5pc0RyYXdhYmxlKCkgKSB7XHJcbiAgICAgIHJldHVybiBuZXcgU3VicGF0aCggW10sIG51bGwsIHRoaXMuY2xvc2VkICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIGRpc3RhbmNlID09PSAwICkge1xyXG4gICAgICByZXR1cm4gbmV3IFN1YnBhdGgoIHRoaXMuc2VnbWVudHMuc2xpY2UoKSwgbnVsbCwgdGhpcy5jbG9zZWQgKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaTtcclxuXHJcbiAgICBjb25zdCByZWd1bGFyU2VnbWVudHMgPSB0aGlzLnNlZ21lbnRzLnNsaWNlKCk7XHJcbiAgICBjb25zdCBvZmZzZXRzID0gW107XHJcblxyXG4gICAgZm9yICggaSA9IDA7IGkgPCByZWd1bGFyU2VnbWVudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIG9mZnNldHMucHVzaCggcmVndWxhclNlZ21lbnRzWyBpIF0uc3Ryb2tlTGVmdCggMiAqIGRpc3RhbmNlICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc2VnbWVudHMgPSBbXTtcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgcmVndWxhclNlZ21lbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMuY2xvc2VkIHx8IGkgPiAwICkge1xyXG4gICAgICAgIGNvbnN0IHByZXZpb3VzSSA9ICggaSA+IDAgPyBpIDogcmVndWxhclNlZ21lbnRzLmxlbmd0aCApIC0gMTtcclxuICAgICAgICBjb25zdCBjZW50ZXIgPSByZWd1bGFyU2VnbWVudHNbIGkgXS5zdGFydDtcclxuICAgICAgICBjb25zdCBmcm9tVGFuZ2VudCA9IHJlZ3VsYXJTZWdtZW50c1sgcHJldmlvdXNJIF0uZW5kVGFuZ2VudDtcclxuICAgICAgICBjb25zdCB0b1RhbmdlbnQgPSByZWd1bGFyU2VnbWVudHNbIGkgXS5zdGFydFRhbmdlbnQ7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXJ0QW5nbGUgPSBmcm9tVGFuZ2VudC5wZXJwZW5kaWN1bGFyLm5lZ2F0ZWQoKS50aW1lcyggZGlzdGFuY2UgKS5hbmdsZTtcclxuICAgICAgICBjb25zdCBlbmRBbmdsZSA9IHRvVGFuZ2VudC5wZXJwZW5kaWN1bGFyLm5lZ2F0ZWQoKS50aW1lcyggZGlzdGFuY2UgKS5hbmdsZTtcclxuICAgICAgICBjb25zdCBhbnRpY2xvY2t3aXNlID0gZnJvbVRhbmdlbnQucGVycGVuZGljdWxhci5kb3QoIHRvVGFuZ2VudCApID4gMDtcclxuICAgICAgICBzZWdtZW50cy5wdXNoKCBuZXcgQXJjKCBjZW50ZXIsIE1hdGguYWJzKCBkaXN0YW5jZSApLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApICk7XHJcbiAgICAgIH1cclxuICAgICAgc2VnbWVudHMgPSBzZWdtZW50cy5jb25jYXQoIG9mZnNldHNbIGkgXSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgU3VicGF0aCggc2VnbWVudHMsIG51bGwsIHRoaXMuY2xvc2VkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHN1YnBhdGhzIChvbmUgaWYgb3BlbiwgdHdvIGlmIGNsb3NlZCkgdGhhdCByZXByZXNlbnQgYSBzdHJva2VkIGNvcHkgb2YgdGhpcyBzdWJwYXRoLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TGluZVN0eWxlc30gbGluZVN0eWxlc1xyXG4gICAqIEByZXR1cm5zIHtBcnJheS48U3VicGF0aD59XHJcbiAgICovXHJcbiAgc3Ryb2tlZCggbGluZVN0eWxlcyApIHtcclxuICAgIC8vIG5vbi1kcmF3YWJsZSBzdWJwYXRocyBjb252ZXJ0IHRvIGVtcHR5IHN1YnBhdGhzXHJcbiAgICBpZiAoICF0aGlzLmlzRHJhd2FibGUoKSApIHtcclxuICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggbGluZVN0eWxlcyA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICBsaW5lU3R5bGVzID0gbmV3IExpbmVTdHlsZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZXR1cm4gYSBjYWNoZWQgdmVyc2lvbiBpZiBwb3NzaWJsZVxyXG4gICAgaWYgKCB0aGlzLl9zdHJva2VkU3VicGF0aHNDb21wdXRlZCAmJiB0aGlzLl9zdHJva2VkU3R5bGVzLmVxdWFscyggbGluZVN0eWxlcyApICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fc3Ryb2tlZFN1YnBhdGhzO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpbmVXaWR0aCA9IGxpbmVTdHlsZXMubGluZVdpZHRoO1xyXG5cclxuICAgIGxldCBpO1xyXG4gICAgbGV0IGxlZnRTZWdtZW50cyA9IFtdO1xyXG4gICAgbGV0IHJpZ2h0U2VnbWVudHMgPSBbXTtcclxuICAgIGNvbnN0IGZpcnN0U2VnbWVudCA9IHRoaXMuZ2V0Rmlyc3RTZWdtZW50KCk7XHJcbiAgICBjb25zdCBsYXN0U2VnbWVudCA9IHRoaXMuZ2V0TGFzdFNlZ21lbnQoKTtcclxuXHJcbiAgICBmdW5jdGlvbiBhcHBlbmRMZWZ0U2VnbWVudHMoIHNlZ21lbnRzICkge1xyXG4gICAgICBsZWZ0U2VnbWVudHMgPSBsZWZ0U2VnbWVudHMuY29uY2F0KCBzZWdtZW50cyApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGVuZFJpZ2h0U2VnbWVudHMoIHNlZ21lbnRzICkge1xyXG4gICAgICByaWdodFNlZ21lbnRzID0gcmlnaHRTZWdtZW50cy5jb25jYXQoIHNlZ21lbnRzICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBpbnNlcnQgYW4gaW1wbGljaXQgY2xvc2luZyBzZWdtZW50IGlmIHRoZSBzdGFydCBhbmQgZW5kIHBvaW50cyBhcmUgdGhlIHNhbWVcclxuICAgIGNvbnN0IGFscmVhZHlDbG9zZWQgPSBsYXN0U2VnbWVudC5lbmQuZXF1YWxzKCBmaXJzdFNlZ21lbnQuc3RhcnQgKTtcclxuICAgIC8vIGlmIHRoZXJlIGlzIGFuIGltcGxpY2l0IGNsb3Npbmcgc2VnbWVudFxyXG4gICAgY29uc3QgY2xvc2luZ1NlZ21lbnQgPSBhbHJlYWR5Q2xvc2VkID8gbnVsbCA6IG5ldyBMaW5lKCB0aGlzLnNlZ21lbnRzWyB0aGlzLnNlZ21lbnRzLmxlbmd0aCAtIDEgXS5lbmQsIHRoaXMuc2VnbWVudHNbIDAgXS5zdGFydCApO1xyXG5cclxuICAgIC8vIHN0cm9rZSB0aGUgbG9naWNhbCBcImxlZnRcIiBzaWRlIG9mIG91ciBwYXRoXHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMuc2VnbWVudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggaSA+IDAgKSB7XHJcbiAgICAgICAgYXBwZW5kTGVmdFNlZ21lbnRzKCBsaW5lU3R5bGVzLmxlZnRKb2luKCB0aGlzLnNlZ21lbnRzWyBpIF0uc3RhcnQsIHRoaXMuc2VnbWVudHNbIGkgLSAxIF0uZW5kVGFuZ2VudCwgdGhpcy5zZWdtZW50c1sgaSBdLnN0YXJ0VGFuZ2VudCApICk7XHJcbiAgICAgIH1cclxuICAgICAgYXBwZW5kTGVmdFNlZ21lbnRzKCB0aGlzLnNlZ21lbnRzWyBpIF0uc3Ryb2tlTGVmdCggbGluZVdpZHRoICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzdHJva2UgdGhlIGxvZ2ljYWwgXCJyaWdodFwiIHNpZGUgb2Ygb3VyIHBhdGhcclxuICAgIGZvciAoIGkgPSB0aGlzLnNlZ21lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICBpZiAoIGkgPCB0aGlzLnNlZ21lbnRzLmxlbmd0aCAtIDEgKSB7XHJcbiAgICAgICAgYXBwZW5kUmlnaHRTZWdtZW50cyggbGluZVN0eWxlcy5yaWdodEpvaW4oIHRoaXMuc2VnbWVudHNbIGkgXS5lbmQsIHRoaXMuc2VnbWVudHNbIGkgXS5lbmRUYW5nZW50LCB0aGlzLnNlZ21lbnRzWyBpICsgMSBdLnN0YXJ0VGFuZ2VudCApICk7XHJcbiAgICAgIH1cclxuICAgICAgYXBwZW5kUmlnaHRTZWdtZW50cyggdGhpcy5zZWdtZW50c1sgaSBdLnN0cm9rZVJpZ2h0KCBsaW5lV2lkdGggKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdWJwYXRocztcclxuICAgIGlmICggdGhpcy5jbG9zZWQgKSB7XHJcbiAgICAgIGlmICggYWxyZWFkeUNsb3NlZCApIHtcclxuICAgICAgICAvLyBhZGQgdGhlIGpvaW5zIGJldHdlZW4gdGhlIHN0YXJ0IGFuZCBlbmRcclxuICAgICAgICBhcHBlbmRMZWZ0U2VnbWVudHMoIGxpbmVTdHlsZXMubGVmdEpvaW4oIGxhc3RTZWdtZW50LmVuZCwgbGFzdFNlZ21lbnQuZW5kVGFuZ2VudCwgZmlyc3RTZWdtZW50LnN0YXJ0VGFuZ2VudCApICk7XHJcbiAgICAgICAgYXBwZW5kUmlnaHRTZWdtZW50cyggbGluZVN0eWxlcy5yaWdodEpvaW4oIGxhc3RTZWdtZW50LmVuZCwgbGFzdFNlZ21lbnQuZW5kVGFuZ2VudCwgZmlyc3RTZWdtZW50LnN0YXJ0VGFuZ2VudCApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gbG9naWNhbCBcImxlZnRcIiBzdHJva2Ugb24gdGhlIGltcGxpY2l0IGNsb3Npbmcgc2VnbWVudFxyXG4gICAgICAgIGFwcGVuZExlZnRTZWdtZW50cyggbGluZVN0eWxlcy5sZWZ0Sm9pbiggY2xvc2luZ1NlZ21lbnQuc3RhcnQsIGxhc3RTZWdtZW50LmVuZFRhbmdlbnQsIGNsb3NpbmdTZWdtZW50LnN0YXJ0VGFuZ2VudCApICk7XHJcbiAgICAgICAgYXBwZW5kTGVmdFNlZ21lbnRzKCBjbG9zaW5nU2VnbWVudC5zdHJva2VMZWZ0KCBsaW5lV2lkdGggKSApO1xyXG4gICAgICAgIGFwcGVuZExlZnRTZWdtZW50cyggbGluZVN0eWxlcy5sZWZ0Sm9pbiggY2xvc2luZ1NlZ21lbnQuZW5kLCBjbG9zaW5nU2VnbWVudC5lbmRUYW5nZW50LCBmaXJzdFNlZ21lbnQuc3RhcnRUYW5nZW50ICkgKTtcclxuXHJcbiAgICAgICAgLy8gbG9naWNhbCBcInJpZ2h0XCIgc3Ryb2tlIG9uIHRoZSBpbXBsaWNpdCBjbG9zaW5nIHNlZ21lbnRcclxuICAgICAgICBhcHBlbmRSaWdodFNlZ21lbnRzKCBsaW5lU3R5bGVzLnJpZ2h0Sm9pbiggY2xvc2luZ1NlZ21lbnQuZW5kLCBjbG9zaW5nU2VnbWVudC5lbmRUYW5nZW50LCBmaXJzdFNlZ21lbnQuc3RhcnRUYW5nZW50ICkgKTtcclxuICAgICAgICBhcHBlbmRSaWdodFNlZ21lbnRzKCBjbG9zaW5nU2VnbWVudC5zdHJva2VSaWdodCggbGluZVdpZHRoICkgKTtcclxuICAgICAgICBhcHBlbmRSaWdodFNlZ21lbnRzKCBsaW5lU3R5bGVzLnJpZ2h0Sm9pbiggY2xvc2luZ1NlZ21lbnQuc3RhcnQsIGxhc3RTZWdtZW50LmVuZFRhbmdlbnQsIGNsb3NpbmdTZWdtZW50LnN0YXJ0VGFuZ2VudCApICk7XHJcbiAgICAgIH1cclxuICAgICAgc3VicGF0aHMgPSBbXHJcbiAgICAgICAgbmV3IFN1YnBhdGgoIGxlZnRTZWdtZW50cywgbnVsbCwgdHJ1ZSApLFxyXG4gICAgICAgIG5ldyBTdWJwYXRoKCByaWdodFNlZ21lbnRzLCBudWxsLCB0cnVlIClcclxuICAgICAgXTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzdWJwYXRocyA9IFtcclxuICAgICAgICBuZXcgU3VicGF0aCggbGVmdFNlZ21lbnRzLmNvbmNhdCggbGluZVN0eWxlcy5jYXAoIGxhc3RTZWdtZW50LmVuZCwgbGFzdFNlZ21lbnQuZW5kVGFuZ2VudCApIClcclxuICAgICAgICAgICAgLmNvbmNhdCggcmlnaHRTZWdtZW50cyApXHJcbiAgICAgICAgICAgIC5jb25jYXQoIGxpbmVTdHlsZXMuY2FwKCBmaXJzdFNlZ21lbnQuc3RhcnQsIGZpcnN0U2VnbWVudC5zdGFydFRhbmdlbnQubmVnYXRlZCgpICkgKSxcclxuICAgICAgICAgIG51bGwsIHRydWUgKVxyXG4gICAgICBdO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3N0cm9rZWRTdWJwYXRocyA9IHN1YnBhdGhzO1xyXG4gICAgdGhpcy5fc3Ryb2tlZFN1YnBhdGhzQ29tcHV0ZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5fc3Ryb2tlZFN0eWxlcyA9IGxpbmVTdHlsZXMuY29weSgpOyAvLyBzaGFsbG93IGNvcHksIHNpbmNlIHdlIGNvbnNpZGVyIGxpbmVzdHlsZXMgdG8gYmUgbXV0YWJsZVxyXG5cclxuICAgIHJldHVybiBzdWJwYXRocztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBjb3B5IG9mIHRoaXMgc3VicGF0aCB3aXRoIHRoZSBkYXNoIFwiaG9sZXNcIiByZW1vdmVkIChoYXMgbWFueSBzdWJwYXRocyB1c3VhbGx5KS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSBsaW5lRGFzaFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lRGFzaE9mZnNldFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZUVwc2lsb24gLSBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gKHNxdWFyZWQpXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmlhdGlvbiBmcm9tIHRoZSBjdXJ2ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjdXJ2ZUVwc2lsb24gLSBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gY3VydmF0dXJlIGNoYW5nZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZXR3ZWVuIHNlZ21lbnRzXHJcbiAgICogQHJldHVybnMge0FycmF5LjxTdWJwYXRoPn1cclxuICAgKi9cclxuICBkYXNoZWQoIGxpbmVEYXNoLCBsaW5lRGFzaE9mZnNldCwgZGlzdGFuY2VFcHNpbG9uLCBjdXJ2ZUVwc2lsb24gKSB7XHJcbiAgICAvLyBDb21iaW5lIHNlZ21lbnQgYXJyYXlzIChjb2xsYXBzaW5nIHRoZSB0d28tbW9zdC1hZGphY2VudCBhcnJheXMgaW50byBvbmUsIHdpdGggY29uY2F0ZW5hdGlvbilcclxuICAgIGZ1bmN0aW9uIGNvbWJpbmVTZWdtZW50QXJyYXlzKCBsZWZ0LCByaWdodCApIHtcclxuICAgICAgY29uc3QgY29tYmluZWQgPSBsZWZ0WyBsZWZ0Lmxlbmd0aCAtIDEgXS5jb25jYXQoIHJpZ2h0WyAwIF0gKTtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gbGVmdC5zbGljZSggMCwgbGVmdC5sZW5ndGggLSAxICkuY29uY2F0KCBbIGNvbWJpbmVkIF0gKS5jb25jYXQoIHJpZ2h0LnNsaWNlKCAxICkgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0Lmxlbmd0aCA9PT0gbGVmdC5sZW5ndGggKyByaWdodC5sZW5ndGggLSAxICk7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2hldGhlciB0d28gZGFzaCBpdGVtcyAocmV0dXJuIHR5cGUgZnJvbSBnZXREYXNoVmFsdWVzKCkpIGNhbiBiZSBjb21iaW5lZCB0b2dldGhlciB0byBoYXZlIHRoZWlyIGVuZCBzZWdtZW50c1xyXG4gICAgLy8gY29tYmluZWQgd2l0aCBjb21iaW5lU2VnbWVudEFycmF5cy5cclxuICAgIGZ1bmN0aW9uIGNhbkJlQ29tYmluZWQoIGxlZnRJdGVtLCByaWdodEl0ZW0gKSB7XHJcbiAgICAgIGlmICggIWxlZnRJdGVtLmhhc1JpZ2h0RmlsbGVkIHx8ICFyaWdodEl0ZW0uaGFzTGVmdEZpbGxlZCApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgbGVmdFNlZ21lbnQgPSBfLmxhc3QoIF8ubGFzdCggbGVmdEl0ZW0uc2VnbWVudEFycmF5cyApICk7XHJcbiAgICAgIGNvbnN0IHJpZ2h0U2VnbWVudCA9IHJpZ2h0SXRlbS5zZWdtZW50QXJyYXlzWyAwIF1bIDAgXTtcclxuICAgICAgcmV0dXJuIGxlZnRTZWdtZW50LmVuZC5kaXN0YW5jZSggcmlnaHRTZWdtZW50LnN0YXJ0ICkgPCAxZS01O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENvbXB1dGUgYWxsIG9mIHRoZSBkYXNoZXNcclxuICAgIGNvbnN0IGRhc2hJdGVtcyA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zZWdtZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgc2VnbWVudCA9IHRoaXMuc2VnbWVudHNbIGkgXTtcclxuICAgICAgY29uc3QgZGFzaEl0ZW0gPSBzZWdtZW50LmdldERhc2hWYWx1ZXMoIGxpbmVEYXNoLCBsaW5lRGFzaE9mZnNldCwgZGlzdGFuY2VFcHNpbG9uLCBjdXJ2ZUVwc2lsb24gKTtcclxuICAgICAgZGFzaEl0ZW1zLnB1c2goIGRhc2hJdGVtICk7XHJcblxyXG4gICAgICAvLyBXZSBtb3ZlZCBmb3J3YXJkIGluIHRoZSBvZmZzZXQgYnkgdGhpcyBtdWNoXHJcbiAgICAgIGxpbmVEYXNoT2Zmc2V0ICs9IGRhc2hJdGVtLmFyY0xlbmd0aDtcclxuXHJcbiAgICAgIGNvbnN0IHZhbHVlcyA9IFsgMCBdLmNvbmNhdCggZGFzaEl0ZW0udmFsdWVzICkuY29uY2F0KCBbIDEgXSApO1xyXG4gICAgICBjb25zdCBpbml0aWFsbHlJbnNpZGUgPSBkYXNoSXRlbS5pbml0aWFsbHlJbnNpZGU7XHJcblxyXG4gICAgICAvLyBNYXJrIHdoZXRoZXIgdGhlIGVuZHMgYXJlIGZpbGxlZCwgc28gYWRqYWNlbnQgZmlsbGVkIGVuZHMgY2FuIGJlIGNvbWJpbmVkXHJcbiAgICAgIGRhc2hJdGVtLmhhc0xlZnRGaWxsZWQgPSBpbml0aWFsbHlJbnNpZGU7XHJcbiAgICAgIGRhc2hJdGVtLmhhc1JpZ2h0RmlsbGVkID0gKCB2YWx1ZXMubGVuZ3RoICUgMiA9PT0gMCApID8gaW5pdGlhbGx5SW5zaWRlIDogIWluaXRpYWxseUluc2lkZTtcclxuXHJcbiAgICAgIC8vIHtBcnJheS48QXJyYXkuPFNlZ21lbnQ+Pn0sIHdoZXJlIGVhY2ggY29udGFpbmVkIGFycmF5IHdpbGwgYmUgdHVybmVkIGludG8gYSBzdWJwYXRoIGF0IHRoZSBlbmQuXHJcbiAgICAgIGRhc2hJdGVtLnNlZ21lbnRBcnJheXMgPSBbXTtcclxuICAgICAgZm9yICggbGV0IGogPSAoIGluaXRpYWxseUluc2lkZSA/IDAgOiAxICk7IGogPCB2YWx1ZXMubGVuZ3RoIC0gMTsgaiArPSAyICkge1xyXG4gICAgICAgIGlmICggdmFsdWVzWyBqIF0gIT09IHZhbHVlc1sgaiArIDEgXSApIHtcclxuICAgICAgICAgIGRhc2hJdGVtLnNlZ21lbnRBcnJheXMucHVzaCggWyBzZWdtZW50LnNsaWNlKCB2YWx1ZXNbIGogXSwgdmFsdWVzWyBqICsgMSBdICkgXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENvbWJpbmUgYWRqYWNlbnQgd2hpY2ggYm90aCBhcmUgZmlsbGVkIG9uIHRoZSBtaWRkbGVcclxuICAgIGZvciAoIGxldCBpID0gZGFzaEl0ZW1zLmxlbmd0aCAtIDE7IGkgPj0gMTsgaS0tICkge1xyXG4gICAgICBjb25zdCBsZWZ0SXRlbSA9IGRhc2hJdGVtc1sgaSAtIDEgXTtcclxuICAgICAgY29uc3QgcmlnaHRJdGVtID0gZGFzaEl0ZW1zWyBpIF07XHJcbiAgICAgIGlmICggY2FuQmVDb21iaW5lZCggbGVmdEl0ZW0sIHJpZ2h0SXRlbSApICkge1xyXG4gICAgICAgIGRhc2hJdGVtcy5zcGxpY2UoIGkgLSAxLCAyLCB7XHJcbiAgICAgICAgICBzZWdtZW50QXJyYXlzOiBjb21iaW5lU2VnbWVudEFycmF5cyggbGVmdEl0ZW0uc2VnbWVudEFycmF5cywgcmlnaHRJdGVtLnNlZ21lbnRBcnJheXMgKSxcclxuICAgICAgICAgIGhhc0xlZnRGaWxsZWQ6IGxlZnRJdGVtLmhhc0xlZnRGaWxsZWQsXHJcbiAgICAgICAgICBoYXNSaWdodEZpbGxlZDogcmlnaHRJdGVtLmhhc1JpZ2h0RmlsbGVkXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ29tYmluZSBhZGphY2VudCBzdGFydC9lbmQgaWYgYXBwbGljYWJsZVxyXG4gICAgaWYgKCBkYXNoSXRlbXMubGVuZ3RoID4gMSAmJiBjYW5CZUNvbWJpbmVkKCBkYXNoSXRlbXNbIGRhc2hJdGVtcy5sZW5ndGggLSAxIF0sIGRhc2hJdGVtc1sgMCBdICkgKSB7XHJcbiAgICAgIGNvbnN0IGxlZnRJdGVtID0gZGFzaEl0ZW1zLnBvcCgpO1xyXG4gICAgICBjb25zdCByaWdodEl0ZW0gPSBkYXNoSXRlbXMuc2hpZnQoKTtcclxuICAgICAgZGFzaEl0ZW1zLnB1c2goIHtcclxuICAgICAgICBzZWdtZW50QXJyYXlzOiBjb21iaW5lU2VnbWVudEFycmF5cyggbGVmdEl0ZW0uc2VnbWVudEFycmF5cywgcmlnaHRJdGVtLnNlZ21lbnRBcnJheXMgKSxcclxuICAgICAgICBoYXNMZWZ0RmlsbGVkOiBsZWZ0SXRlbS5oYXNMZWZ0RmlsbGVkLFxyXG4gICAgICAgIGhhc1JpZ2h0RmlsbGVkOiByaWdodEl0ZW0uaGFzUmlnaHRGaWxsZWRcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERldGVybWluZSBpZiB3ZSBhcmUgY2xvc2VkIChoYXZlIG9ubHkgb25lIHN1YnBhdGgpXHJcbiAgICBpZiAoIHRoaXMuY2xvc2VkICYmIGRhc2hJdGVtcy5sZW5ndGggPT09IDEgJiYgZGFzaEl0ZW1zWyAwIF0uc2VnbWVudEFycmF5cy5sZW5ndGggPT09IDEgJiYgZGFzaEl0ZW1zWyAwIF0uaGFzTGVmdEZpbGxlZCAmJiBkYXNoSXRlbXNbIDAgXS5oYXNSaWdodEZpbGxlZCApIHtcclxuICAgICAgcmV0dXJuIFsgbmV3IFN1YnBhdGgoIGRhc2hJdGVtc1sgMCBdLnNlZ21lbnRBcnJheXNbIDAgXSwgbnVsbCwgdHJ1ZSApIF07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ29udmVydCB0byBzdWJwYXRoc1xyXG4gICAgcmV0dXJuIF8uZmxhdHRlbiggZGFzaEl0ZW1zLm1hcCggZGFzaEl0ZW0gPT4gZGFzaEl0ZW0uc2VnbWVudEFycmF5cyApICkubWFwKCBzZWdtZW50cyA9PiBuZXcgU3VicGF0aCggc2VnbWVudHMgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAqL1xyXG4gIHNlcmlhbGl6ZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6ICdTdWJwYXRoJyxcclxuICAgICAgc2VnbWVudHM6IHRoaXMuc2VnbWVudHMubWFwKCBzZWdtZW50ID0+IHNlZ21lbnQuc2VyaWFsaXplKCkgKSxcclxuICAgICAgcG9pbnRzOiB0aGlzLnBvaW50cy5tYXAoIHBvaW50ID0+ICgge1xyXG4gICAgICAgIHg6IHBvaW50LngsXHJcbiAgICAgICAgeTogcG9pbnQueVxyXG4gICAgICB9ICkgKSxcclxuICAgICAgY2xvc2VkOiB0aGlzLmNsb3NlZFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBTdWJwYXRoIGZyb20gdGhlIHNlcmlhbGl6ZWQgcmVwcmVzZW50YXRpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9ialxyXG4gICAqIEByZXR1cm5zIHtTdWJwYXRofVxyXG4gICAqL1xyXG4gIHN0YXRpYyBkZXNlcmlhbGl6ZSggb2JqICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb2JqLnR5cGUgPT09ICdTdWJwYXRoJyApO1xyXG5cclxuICAgIHJldHVybiBuZXcgU3VicGF0aCggb2JqLnNlZ21lbnRzLm1hcCggU2VnbWVudC5kZXNlcmlhbGl6ZSApLCBvYmoucG9pbnRzLm1hcCggcHQgPT4gbmV3IFZlY3RvcjIoIHB0LngsIHB0LnkgKSApLCBvYmouY2xvc2VkICk7XHJcbiAgfVxyXG59XHJcblxyXG5raXRlLnJlZ2lzdGVyKCAnU3VicGF0aCcsIFN1YnBhdGggKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFN1YnBhdGg7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0saUNBQWlDO0FBQ3pELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxTQUFTQyxHQUFHLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxVQUFVLEVBQUVDLE9BQU8sUUFBUSxlQUFlO0FBRXBFLE1BQU1DLE9BQU8sQ0FBQztFQUNaO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxRQUFRLEVBQUVDLE1BQU0sRUFBRUMsTUFBTSxFQUFHO0lBQ3RDLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUcsSUFBSWIsV0FBVyxDQUFDLENBQUM7SUFDM0M7SUFDQSxJQUFJLENBQUNVLFFB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