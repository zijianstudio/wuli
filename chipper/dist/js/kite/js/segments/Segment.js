// Copyright 2013-2023, University of Colorado Boulder

/**
 * A segment represents a specific curve with a start and end.
 *
 * Each segment is treated parametrically, where t=0 is the start of the segment, and t=1 is the end. Values of t
 * between those represent points along the segment.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Utils from '../../../dot/js/Utils.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Arc, BoundsIntersection, EllipticalArc, kite, Line, Shape, Subpath } from '../imports.js';

// null if no solution, true if every a,b pair is a solution, otherwise the single solution

export default class Segment {
  constructor() {
    this.invalidationEmitter = new TinyEmitter();
  }

  // The start point of the segment, parametrically at t=0.

  // The end point of the segment, parametrically at t=1.

  // The normalized tangent vector to the segment at its start point, pointing in the direction of motion (from start to
  // end).
  // The normalized tangent vector to the segment at its end point, pointing in the direction of motion (from start to
  // end).
  // The bounding box for the segment.
  // Returns the position parametrically, with 0 <= t <= 1. NOTE that this function doesn't keep a constant magnitude
  // tangent.
  // Returns the non-normalized tangent (dx/dt, dy/dt) of this segment at the parametric value of t, with 0 <= t <= 1.
  // Returns the signed curvature (positive for visual clockwise - mathematical counterclockwise)
  // Returns an array with up to 2 sub-segments, split at the parametric t value. The segments together should make the
  // same shape as the original segment.
  // Returns a string containing the SVG path. assumes that the start point is already provided, so anything that calls
  // this needs to put the M calls first
  // Returns an array of segments that will draw an offset curve on the logical left side
  // Returns an array of segments that will draw an offset curve on the logical right side
  // Returns the winding number for intersection with a ray
  // Returns a list of t values where dx/dt or dy/dt is 0 where 0 < t < 1. subdividing on these will result in monotonic
  // segments
  // Returns a list of intersections between the segment and the ray.
  // Returns a {Bounds2} representing the bounding box for the segment.
  // Returns signed area contribution for this segment using Green's Theorem
  // Returns a list of non-degenerate segments that are equivalent to this segment. Generally gets rid (or simplifies)
  // invalid or repeated segments.
  // Draws the segment to the 2D Canvas context, assuming the context's current location is already at the start point
  // Returns a new segment that represents this segment after transformation by the matrix
  /**
   * Will return true if the start/end tangents are purely vertical or horizontal. If all of the segments of a shape
   * have this property, then the only line joins will be a multiple of pi/2 (90 degrees), and so all of the types of
   * line joins will have the same bounds. This means that the stroked bounds will just be a pure dilation of the
   * regular bounds, by lineWidth / 2.
   */
  areStrokedBoundsDilated() {
    const epsilon = 0.0000001;

    // If the derivative at the start/end are pointing in a cardinal direction (north/south/east/west), then the
    // endpoints won't trigger non-dilated bounds, and the interior of the curve will not contribute.
    return Math.abs(this.startTangent.x * this.startTangent.y) < epsilon && Math.abs(this.endTangent.x * this.endTangent.y) < epsilon;
  }

  /**
   * TODO: override everywhere so this isn't necessary (it's not particularly efficient!)
   */
  getBoundsWithTransform(matrix) {
    const transformedSegment = this.transformed(matrix);
    return transformedSegment.getBounds();
  }

  /**
   * Extracts a slice of a segment, based on the parametric value.
   *
   * Given that this segment is represented by the interval [0,1]
   */
  slice(t0, t1) {
    assert && assert(t0 >= 0 && t0 <= 1 && t1 >= 0 && t1 <= 1, 'Parametric value out of range');
    assert && assert(t0 < t1);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let segment = this; // eslint-disable-line consistent-this
    if (t1 < 1) {
      segment = segment.subdivided(t1)[0];
    }
    if (t0 > 0) {
      segment = segment.subdivided(Utils.linear(0, t1, 0, 1, t0))[1];
    }
    return segment;
  }

  /**
   * @param tList - list of sorted t values from 0 <= t <= 1
   */
  subdivisions(tList) {
    // this could be solved by recursion, but we don't plan on the JS engine doing tail-call optimization

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let right = this; // eslint-disable-line consistent-this
    const result = [];
    for (let i = 0; i < tList.length; i++) {
      // assume binary subdivision
      const t = tList[i];
      const arr = right.subdivided(t);
      assert && assert(arr.length === 2);
      result.push(arr[0]);
      right = arr[1];

      // scale up the remaining t values
      for (let j = i + 1; j < tList.length; j++) {
        tList[j] = Utils.linear(t, 1, 0, 1, tList[j]);
      }
    }
    result.push(right);
    return result;
  }

  /**
   * Return an array of segments from breaking this segment into monotone pieces
   */
  subdividedIntoMonotone() {
    return this.subdivisions(this.getInteriorExtremaTs());
  }

  /**
   * Determines if the segment is sufficiently flat (given certain epsilon values)
   *
   * @param distanceEpsilon - controls level of subdivision by attempting to ensure a maximum (squared)
   *                          deviation from the curve
   * @param curveEpsilon - controls level of subdivision by attempting to ensure a maximum curvature change
   *                       between segments
   */
  isSufficientlyFlat(distanceEpsilon, curveEpsilon) {
    const start = this.start;
    const middle = this.positionAt(0.5);
    const end = this.end;
    return Segment.isSufficientlyFlat(distanceEpsilon, curveEpsilon, start, middle, end);
  }

  /**
   * Returns the (sometimes approximate) arc length of the segment.
   */
  getArcLength(distanceEpsilon, curveEpsilon, maxLevels) {
    distanceEpsilon = distanceEpsilon === undefined ? 1e-10 : distanceEpsilon;
    curveEpsilon = curveEpsilon === undefined ? 1e-8 : curveEpsilon;
    maxLevels = maxLevels === undefined ? 15 : maxLevels;
    if (maxLevels <= 0 || this.isSufficientlyFlat(distanceEpsilon, curveEpsilon)) {
      return this.start.distance(this.end);
    } else {
      const subdivided = this.subdivided(0.5);
      return subdivided[0].getArcLength(distanceEpsilon, curveEpsilon, maxLevels - 1) + subdivided[1].getArcLength(distanceEpsilon, curveEpsilon, maxLevels - 1);
    }
  }

  /**
   * Returns information about the line dash parametric offsets for a given segment.
   *
   * As always, this is fairly approximate depending on the type of segment.
   *
   * @param lineDash
   * @param lineDashOffset
   * @param distanceEpsilon - controls level of subdivision by attempting to ensure a maximum (squared)
   *                          deviation from the curve
   * @param curveEpsilon - controls level of subdivision by attempting to ensure a maximum curvature change
   *                       between segments
   */
  getDashValues(lineDash, lineDashOffset, distanceEpsilon, curveEpsilon) {
    assert && assert(lineDash.length > 0, 'Do not call with an empty dash array');

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const values = [];
    let arcLength = 0;

    // Do the offset modulo the sum, so that we don't have to cycle for a long time
    const lineDashSum = _.sum(lineDash);
    lineDashOffset = lineDashOffset % lineDashSum;

    // Ensure the lineDashOffset is positive
    if (lineDashOffset < 0) {
      lineDashOffset += lineDashSum;
    }

    // The current section of lineDash that we are in
    let dashIndex = 0;
    let dashOffset = 0;
    let isInside = true;
    function nextDashIndex() {
      dashIndex = (dashIndex + 1) % lineDash.length;
      isInside = !isInside;
    }

    // Burn off initial lineDashOffset
    while (lineDashOffset > 0) {
      if (lineDashOffset >= lineDash[dashIndex]) {
        lineDashOffset -= lineDash[dashIndex];
        nextDashIndex();
      } else {
        dashOffset = lineDashOffset;
        lineDashOffset = 0;
      }
    }
    const initiallyInside = isInside;

    // Recursively progress through until we have mostly-linear segments.
    (function recur(t0, t1, p0, p1, depth) {
      // Compute the t/position at the midpoint t value
      const tMid = (t0 + t1) / 2;
      const pMid = self.positionAt(tMid);

      // If it's flat enough (or we hit our recursion limit), process it
      if (depth > 14 || Segment.isSufficientlyFlat(distanceEpsilon, curveEpsilon, p0, pMid, p1)) {
        // Estimate length
        const totalLength = p0.distance(pMid) + pMid.distance(p1);
        arcLength += totalLength;

        // While we are longer than the remaining amount for the next dash change.
        let lengthLeft = totalLength;
        while (dashOffset + lengthLeft >= lineDash[dashIndex]) {
          // Compute the t (for now, based on the total length for ease)
          const t = Utils.linear(0, totalLength, t0, t1, totalLength - lengthLeft + lineDash[dashIndex] - dashOffset);

          // Record the dash change
          values.push(t);

          // Remove amount added from our lengthLeft (move to the dash)
          lengthLeft -= lineDash[dashIndex] - dashOffset;
          dashOffset = 0; // at the dash, we'll have 0 offset
          nextDashIndex();
        }

        // Spill-over, just add it
        dashOffset = dashOffset + lengthLeft;
      } else {
        recur(t0, tMid, p0, pMid, depth + 1);
        recur(tMid, t1, pMid, p1, depth + 1);
      }
    })(0, 1, this.start, this.end, 0);
    return {
      values: values,
      arcLength: arcLength,
      initiallyInside: initiallyInside
    };
  }

  /**
   *
   * @param [options]
   * @param [minLevels] -   how many levels to force subdivisions
   * @param [maxLevels] -   prevent subdivision past this level
   * @param [segments]
   * @param [start]
   * @param [end]
   */
  toPiecewiseLinearSegments(options, minLevels, maxLevels, segments, start, end) {
    // for the first call, initialize min/max levels from our options
    minLevels = minLevels === undefined ? options.minLevels : minLevels;
    maxLevels = maxLevels === undefined ? options.maxLevels : maxLevels;
    segments = segments || [];
    const pointMap = options.pointMap || _.identity;

    // points mapped by the (possibly-nonlinear) pointMap.
    start = start || pointMap(this.start);
    end = end || pointMap(this.end);
    const middle = pointMap(this.positionAt(0.5));
    assert && assert(minLevels <= maxLevels);
    assert && assert(options.distanceEpsilon === null || typeof options.distanceEpsilon === 'number');
    assert && assert(options.curveEpsilon === null || typeof options.curveEpsilon === 'number');
    assert && assert(!pointMap || typeof pointMap === 'function');

    // i.e. we will have finished = maxLevels === 0 || ( minLevels <= 0 && epsilonConstraints ), just didn't want to one-line it
    let finished = maxLevels === 0; // bail out once we reach our maximum number of subdivision levels
    if (!finished && minLevels <= 0) {
      // force subdivision if minLevels hasn't been reached
      finished = this.isSufficientlyFlat(options.distanceEpsilon === null || options.distanceEpsilon === undefined ? Number.POSITIVE_INFINITY : options.distanceEpsilon, options.curveEpsilon === null || options.curveEpsilon === undefined ? Number.POSITIVE_INFINITY : options.curveEpsilon);
    }
    if (finished) {
      segments.push(new Line(start, end));
    } else {
      const subdividedSegments = this.subdivided(0.5);
      subdividedSegments[0].toPiecewiseLinearSegments(options, minLevels - 1, maxLevels - 1, segments, start, middle);
      subdividedSegments[1].toPiecewiseLinearSegments(options, minLevels - 1, maxLevels - 1, segments, middle, end);
    }
    return segments;
  }

  /**
   * Returns a list of Line and/or Arc segments that approximates this segment.
   */
  toPiecewiseLinearOrArcSegments(providedOptions) {
    const options = optionize()({
      minLevels: 2,
      maxLevels: 7,
      curvatureThreshold: 0.02,
      errorThreshold: 10,
      errorPoints: [0.25, 0.75]
    }, providedOptions);
    const segments = [];
    this.toPiecewiseLinearOrArcRecursion(options, options.minLevels, options.maxLevels, segments, 0, 1, this.positionAt(0), this.positionAt(1), this.curvatureAt(0), this.curvatureAt(1));
    return segments;
  }

  /**
   * Helper function for toPiecewiseLinearOrArcSegments. - will push into segments
   */
  toPiecewiseLinearOrArcRecursion(options, minLevels, maxLevels, segments, startT, endT, startPoint, endPoint, startCurvature, endCurvature) {
    const middleT = (startT + endT) / 2;
    const middlePoint = this.positionAt(middleT);
    const middleCurvature = this.curvatureAt(middleT);
    if (maxLevels <= 0 || minLevels <= 0 && Math.abs(startCurvature - middleCurvature) + Math.abs(middleCurvature - endCurvature) < options.curvatureThreshold * 2) {
      const segment = Arc.createFromPoints(startPoint, middlePoint, endPoint);
      let needsSplit = false;
      if (segment instanceof Arc) {
        const radiusSquared = segment.radius * segment.radius;
        for (let i = 0; i < options.errorPoints.length; i++) {
          const t = options.errorPoints[i];
          const point = this.positionAt(startT * (1 - t) + endT * t);
          if (Math.abs(point.distanceSquared(segment.center) - radiusSquared) > options.errorThreshold) {
            needsSplit = true;
            break;
          }
        }
      }
      if (!needsSplit) {
        segments.push(segment);
        return;
      }
    }
    this.toPiecewiseLinearOrArcRecursion(options, minLevels - 1, maxLevels - 1, segments, startT, middleT, startPoint, middlePoint, startCurvature, middleCurvature);
    this.toPiecewiseLinearOrArcRecursion(options, minLevels - 1, maxLevels - 1, segments, middleT, endT, middlePoint, endPoint, middleCurvature, endCurvature);
  }

  /**
   * Returns a Shape containing just this one segment.
   */
  toShape() {
    return new Shape([new Subpath([this])]);
  }
  getClosestPoints(point) {
    // TODO: solve segments to determine this analytically! (only implemented for Line right now, should be easy to do with some things)
    return Segment.closestToPoint([this], point, 1e-7);
  }

  /**
   * List of results (since there can be duplicates), threshold is used for subdivision,
   * where it will exit if all of the segments are shorter than the threshold
   *
   * TODO: solve segments to determine this analytically!
   */
  static closestToPoint(segments, point, threshold) {
    const thresholdSquared = threshold * threshold;
    let items = [];
    let bestList = [];
    let bestDistanceSquared = Number.POSITIVE_INFINITY;
    let thresholdOk = false;
    _.each(segments, segment => {
      // if we have an explicit computation for this segment, use it
      if (segment instanceof Line) {
        const infos = segment.explicitClosestToPoint(point);
        _.each(infos, info => {
          if (info.distanceSquared < bestDistanceSquared) {
            bestList = [info];
            bestDistanceSquared = info.distanceSquared;
          } else if (info.distanceSquared === bestDistanceSquared) {
            bestList.push(info);
          }
        });
      } else {
        // otherwise, we will split based on monotonicity, so we can subdivide
        // separate, so we can map the subdivided segments
        const ts = [0].concat(segment.getInteriorExtremaTs()).concat([1]);
        for (let i = 0; i < ts.length - 1; i++) {
          const ta = ts[i];
          const tb = ts[i + 1];
          const pa = segment.positionAt(ta);
          const pb = segment.positionAt(tb);
          const bounds = Bounds2.point(pa).addPoint(pb);
          const minDistanceSquared = bounds.minimumDistanceToPointSquared(point);
          if (minDistanceSquared <= bestDistanceSquared) {
            const maxDistanceSquared = bounds.maximumDistanceToPointSquared(point);
            if (maxDistanceSquared < bestDistanceSquared) {
              bestDistanceSquared = maxDistanceSquared;
              bestList = []; // clear it
            }

            items.push({
              ta: ta,
              tb: tb,
              pa: pa,
              pb: pb,
              segment: segment,
              bounds: bounds,
              min: minDistanceSquared,
              max: maxDistanceSquared
            });
          }
        }
      }
    });
    while (items.length && !thresholdOk) {
      const curItems = items;
      items = [];

      // whether all of the segments processed are shorter than the threshold
      thresholdOk = true;
      for (const item of curItems) {
        if (item.min > bestDistanceSquared) {
          continue; // drop this item
        }

        if (thresholdOk && item.pa.distanceSquared(item.pb) > thresholdSquared) {
          thresholdOk = false;
        }
        const tmid = (item.ta + item.tb) / 2;
        const pmid = item.segment.positionAt(tmid);
        const boundsA = Bounds2.point(item.pa).addPoint(pmid);
        const boundsB = Bounds2.point(item.pb).addPoint(pmid);
        const minA = boundsA.minimumDistanceToPointSquared(point);
        const minB = boundsB.minimumDistanceToPointSquared(point);
        if (minA <= bestDistanceSquared) {
          const maxA = boundsA.maximumDistanceToPointSquared(point);
          if (maxA < bestDistanceSquared) {
            bestDistanceSquared = maxA;
            bestList = []; // clear it
          }

          items.push({
            ta: item.ta,
            tb: tmid,
            pa: item.pa,
            pb: pmid,
            segment: item.segment,
            bounds: boundsA,
            min: minA,
            max: maxA
          });
        }
        if (minB <= bestDistanceSquared) {
          const maxB = boundsB.maximumDistanceToPointSquared(point);
          if (maxB < bestDistanceSquared) {
            bestDistanceSquared = maxB;
            bestList = []; // clear it
          }

          items.push({
            ta: tmid,
            tb: item.tb,
            pa: pmid,
            pb: item.pb,
            segment: item.segment,
            bounds: boundsB,
            min: minB,
            max: maxB
          });
        }
      }
    }

    // if there are any closest regions, they are within the threshold, so we will add them all
    _.each(items, item => {
      const t = (item.ta + item.tb) / 2;
      const closestPoint = item.segment.positionAt(t);
      bestList.push({
        segment: item.segment,
        t: t,
        closestPoint: closestPoint,
        distanceSquared: point.distanceSquared(closestPoint)
      });
    });
    return bestList;
  }

  /**
   * Given the cubic-premultiplied values for two cubic bezier curves, determines (if available) a specified (a,b) pair
   * such that p( t ) === q( a * t + b ).
   *
   * Given a 1-dimensional cubic bezier determined by the control points p0, p1, p2 and p3, compute:
   *
   * [ p0s ]    [  1   0   0   0 ]   [ p0 ]
   * [ p1s ] == [ -3   3   0   0 ] * [ p1 ]
   * [ p2s ] == [  3  -6   3   0 ] * [ p2 ]
   * [ p3s ]    [ -1   3  -3   1 ]   [ p3 ]
   *
   * see Cubic.getOverlaps for more information.
   */
  static polynomialGetOverlapCubic(p0s, p1s, p2s, p3s, q0s, q1s, q2s, q3s) {
    if (q3s === 0) {
      return Segment.polynomialGetOverlapQuadratic(p0s, p1s, p2s, q0s, q1s, q2s);
    }
    const a = Math.sign(p3s / q3s) * Math.pow(Math.abs(p3s / q3s), 1 / 3);
    if (a === 0) {
      return null; // If there would be solutions, then q3s would have been non-zero
    }

    const b = (p2s - a * a * q2s) / (3 * a * a * q3s);
    return {
      a: a,
      b: b
    };
  }

  /**
   * Given the quadratic-premultiplied values for two quadratic bezier curves, determines (if available) a specified (a,b) pair
   * such that p( t ) === q( a * t + b ).
   *
   * Given a 1-dimensional quadratic bezier determined by the control points p0, p1, p2, compute:
   *
   * [ p0s ]    [  1   0   0 ]   [ p0 ]
   * [ p1s ] == [ -2   2   0 ] * [ p1 ]
   * [ p2s ]    [  2  -2   3 ] * [ p2 ]
   *
   * see Quadratic.getOverlaps for more information.
   */
  static polynomialGetOverlapQuadratic(p0s, p1s, p2s, q0s, q1s, q2s) {
    if (q2s === 0) {
      return Segment.polynomialGetOverlapLinear(p0s, p1s, q0s, q1s);
    }
    const discr = p2s / q2s;
    if (discr < 0) {
      return null; // not possible to have a solution with an imaginary a
    }

    const a = Math.sqrt(p2s / q2s);
    if (a === 0) {
      return null; // If there would be solutions, then q2s would have been non-zero
    }

    const b = (p1s - a * q1s) / (2 * a * q2s);
    return {
      a: a,
      b: b
    };
  }

  /**
   * Given the linear-premultiplied values for two lines, determines (if available) a specified (a,b) pair
   * such that p( t ) === q( a * t + b ).
   *
   * Given a line determined by the control points p0, p1, compute:
   *
   * [ p0s ] == [  1   0 ] * [ p0 ]
   * [ p1s ] == [ -1   1 ] * [ p1 ]
   *
   * see Quadratic/Cubic.getOverlaps for more information.
   */
  static polynomialGetOverlapLinear(p0s, p1s, q0s, q1s) {
    if (q1s === 0) {
      if (p0s === q0s) {
        return true;
      } else {
        return null;
      }
    }
    const a = p1s / q1s;
    if (a === 0) {
      return null;
    }
    const b = (p0s - q0s) / q1s;
    return {
      a: a,
      b: b
    };
  }

  /**
   * Returns all the distinct (non-endpoint, non-finite) intersections between the two segments.
   */
  static intersect(a, b) {
    if (Line && a instanceof Line && b instanceof Line) {
      return Line.intersect(a, b);
    } else if (Line && a instanceof Line) {
      return Line.intersectOther(a, b);
    } else if (Line && b instanceof Line) {
      // need to swap our intersections, since 'b' is the line
      return Line.intersectOther(b, a).map(swapSegmentIntersection);
    } else if (Arc && a instanceof Arc && b instanceof Arc) {
      return Arc.intersect(a, b);
    } else if (EllipticalArc && a instanceof EllipticalArc && b instanceof EllipticalArc) {
      return EllipticalArc.intersect(a, b);
    } else {
      return BoundsIntersection.intersect(a, b);
    }
  }

  /**
   * Returns a Segment from the serialized representation.
   */
  static deserialize(obj) {
    // @ts-expect-error TODO: namespacing
    assert && assert(obj.type && kite[obj.type] && kite[obj.type].deserialize);

    // @ts-expect-error TODO: namespacing
    return kite[obj.type].deserialize(obj);
  }

  /**
   * Determines if the start/middle/end points are representative of a sufficiently flat segment
   * (given certain epsilon values)
   *
   * @param start
   * @param middle
   * @param end
   * @param distanceEpsilon - controls level of subdivision by attempting to ensure a maximum (squared)
   *                          deviation from the curve
   * @param curveEpsilon - controls level of subdivision by attempting to ensure a maximum curvature change
   *                       between segments
   */
  static isSufficientlyFlat(distanceEpsilon, curveEpsilon, start, middle, end) {
    // flatness criterion: A=start, B=end, C=midpoint, d0=distance from AB, d1=||B-A||, subdivide if d0/d1 > sqrt(epsilon)
    if (Utils.distToSegmentSquared(middle, start, end) / start.distanceSquared(end) > curveEpsilon) {
      return false;
    }
    // deviation criterion
    if (Utils.distToSegmentSquared(middle, start, end) > distanceEpsilon) {
      return false;
    }
    return true;
  }
  static filterClosestToPointResult(results) {
    if (results.length === 0) {
      return [];
    }
    const closestDistanceSquared = _.minBy(results, result => result.distanceSquared).distanceSquared;

    // Return all results that are within 1e-11 of the closest distance (to account for floating point error), but unique
    // based on the location.
    return _.uniqWith(results.filter(result => Math.abs(result.distanceSquared - closestDistanceSquared) < 1e-11), (a, b) => a.closestPoint.distanceSquared(b.closestPoint) < 1e-11);
  }
}
kite.register('Segment', Segment);
function swapSegmentIntersection(segmentIntersection) {
  return segmentIntersection.getSwapped();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIkJvdW5kczIiLCJVdGlscyIsIm9wdGlvbml6ZSIsIkFyYyIsIkJvdW5kc0ludGVyc2VjdGlvbiIsIkVsbGlwdGljYWxBcmMiLCJraXRlIiwiTGluZSIsIlNoYXBlIiwiU3VicGF0aCIsIlNlZ21lbnQiLCJjb25zdHJ1Y3RvciIsImludmFsaWRhdGlvbkVtaXR0ZXIiLCJhcmVTdHJva2VkQm91bmRzRGlsYXRlZCIsImVwc2lsb24iLCJNYXRoIiwiYWJzIiwic3RhcnRUYW5nZW50IiwieCIsInkiLCJlbmRUYW5nZW50IiwiZ2V0Qm91bmRzV2l0aFRyYW5zZm9ybSIsIm1hdHJpeCIsInRyYW5zZm9ybWVkU2VnbWVudCIsInRyYW5zZm9ybWVkIiwiZ2V0Qm91bmRzIiwic2xpY2UiLCJ0MCIsInQxIiwiYXNzZXJ0Iiwic2VnbWVudCIsInN1YmRpdmlkZWQiLCJsaW5lYXIiLCJzdWJkaXZpc2lvbnMiLCJ0TGlzdCIsInJpZ2h0IiwicmVzdWx0IiwiaSIsImxlbmd0aCIsInQiLCJhcnIiLCJwdXNoIiwiaiIsInN1YmRpdmlkZWRJbnRvTW9ub3RvbmUiLCJnZXRJbnRlcmlvckV4dHJlbWFUcyIsImlzU3VmZmljaWVudGx5RmxhdCIsImRpc3RhbmNlRXBzaWxvbiIsImN1cnZlRXBzaWxvbiIsInN0YXJ0IiwibWlkZGxlIiwicG9zaXRpb25BdCIsImVuZCIsImdldEFyY0xlbmd0aCIsIm1heExldmVscyIsInVuZGVmaW5lZCIsImRpc3RhbmNlIiwiZ2V0RGFzaFZhbHVlcyIsImxpbmVEYXNoIiwibGluZURhc2hPZmZzZXQiLCJzZWxmIiwidmFsdWVzIiwiYXJjTGVuZ3RoIiwibGluZURhc2hTdW0iLCJfIiwic3VtIiwiZGFzaEluZGV4IiwiZGFzaE9mZnNldCIsImlzSW5zaWRlIiwibmV4dERhc2hJbmRleCIsImluaXRpYWxseUluc2lkZSIsInJlY3VyIiwicDAiLCJwMSIsImRlcHRoIiwidE1pZCIsInBNaWQiLCJ0b3RhbExlbmd0aCIsImxlbmd0aExlZnQiLCJ0b1BpZWNld2lzZUxpbmVhclNlZ21lbnRzIiwib3B0aW9ucyIsIm1pbkxldmVscyIsInNlZ21lbnRzIiwicG9pbnRNYXAiLCJpZGVudGl0eSIsImZpbmlzaGVkIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJzdWJkaXZpZGVkU2VnbWVudHMiLCJ0b1BpZWNld2lzZUxpbmVhck9yQXJjU2VnbWVudHMiLCJwcm92aWRlZE9wdGlvbnMiLCJjdXJ2YXR1cmVUaHJlc2hvbGQiLCJlcnJvclRocmVzaG9sZCIsImVycm9yUG9pbnRzIiwidG9QaWVjZXdpc2VMaW5lYXJPckFyY1JlY3Vyc2lvbiIsImN1cnZhdHVyZUF0Iiwic3RhcnRUIiwiZW5kVCIsInN0YXJ0UG9pbnQiLCJlbmRQb2ludCIsInN0YXJ0Q3VydmF0dXJlIiwiZW5kQ3VydmF0dXJlIiwibWlkZGxlVCIsIm1pZGRsZVBvaW50IiwibWlkZGxlQ3VydmF0dXJlIiwiY3JlYXRlRnJvbVBvaW50cyIsIm5lZWRzU3BsaXQiLCJyYWRpdXNTcXVhcmVkIiwicmFkaXVzIiwicG9pbnQiLCJkaXN0YW5jZVNxdWFyZWQiLCJjZW50ZXIiLCJ0b1NoYXBlIiwiZ2V0Q2xvc2VzdFBvaW50cyIsImNsb3Nlc3RUb1BvaW50IiwidGhyZXNob2xkIiwidGhyZXNob2xkU3F1YXJlZCIsIml0ZW1zIiwiYmVzdExpc3QiLCJiZXN0RGlzdGFuY2VTcXVhcmVkIiwidGhyZXNob2xkT2siLCJlYWNoIiwiaW5mb3MiLCJleHBsaWNpdENsb3Nlc3RUb1BvaW50IiwiaW5mbyIsInRzIiwiY29uY2F0IiwidGEiLCJ0YiIsInBhIiwicGIiLCJib3VuZHMiLCJhZGRQb2ludCIsIm1pbkRpc3RhbmNlU3F1YXJlZCIsIm1pbmltdW1EaXN0YW5jZVRvUG9pbnRTcXVhcmVkIiwibWF4RGlzdGFuY2VTcXVhcmVkIiwibWF4aW11bURpc3RhbmNlVG9Qb2ludFNxdWFyZWQiLCJtaW4iLCJtYXgiLCJjdXJJdGVtcyIsIml0ZW0iLCJ0bWlkIiwicG1pZCIsImJvdW5kc0EiLCJib3VuZHNCIiwibWluQSIsIm1pbkIiLCJtYXhBIiwibWF4QiIsImNsb3Nlc3RQb2ludCIsInBvbHlub21pYWxHZXRPdmVybGFwQ3ViaWMiLCJwMHMiLCJwMXMiLCJwMnMiLCJwM3MiLCJxMHMiLCJxMXMiLCJxMnMiLCJxM3MiLCJwb2x5bm9taWFsR2V0T3ZlcmxhcFF1YWRyYXRpYyIsImEiLCJzaWduIiwicG93IiwiYiIsInBvbHlub21pYWxHZXRPdmVybGFwTGluZWFyIiwiZGlzY3IiLCJzcXJ0IiwiaW50ZXJzZWN0IiwiaW50ZXJzZWN0T3RoZXIiLCJtYXAiLCJzd2FwU2VnbWVudEludGVyc2VjdGlvbiIsImRlc2VyaWFsaXplIiwib2JqIiwidHlwZSIsImRpc3RUb1NlZ21lbnRTcXVhcmVkIiwiZmlsdGVyQ2xvc2VzdFRvUG9pbnRSZXN1bHQiLCJyZXN1bHRzIiwiY2xvc2VzdERpc3RhbmNlU3F1YXJlZCIsIm1pbkJ5IiwidW5pcVdpdGgiLCJmaWx0ZXIiLCJyZWdpc3RlciIsInNlZ21lbnRJbnRlcnNlY3Rpb24iLCJnZXRTd2FwcGVkIl0sInNvdXJjZXMiOlsiU2VnbWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHNlZ21lbnQgcmVwcmVzZW50cyBhIHNwZWNpZmljIGN1cnZlIHdpdGggYSBzdGFydCBhbmQgZW5kLlxyXG4gKlxyXG4gKiBFYWNoIHNlZ21lbnQgaXMgdHJlYXRlZCBwYXJhbWV0cmljYWxseSwgd2hlcmUgdD0wIGlzIHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudCwgYW5kIHQ9MSBpcyB0aGUgZW5kLiBWYWx1ZXMgb2YgdFxyXG4gKiBiZXR3ZWVuIHRob3NlIHJlcHJlc2VudCBwb2ludHMgYWxvbmcgdGhlIHNlZ21lbnQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XHJcbmltcG9ydCBUaW55RW1pdHRlciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlFbWl0dGVyLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBSYXkyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYXkyLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XHJcbmltcG9ydCB7IEFyYywgQm91bmRzSW50ZXJzZWN0aW9uLCBFbGxpcHRpY2FsQXJjLCBraXRlLCBMaW5lLCBSYXlJbnRlcnNlY3Rpb24sIFNlZ21lbnRJbnRlcnNlY3Rpb24sIFNoYXBlLCBTdWJwYXRoIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG50eXBlIERhc2hWYWx1ZXMgPSB7XHJcblxyXG4gIC8vIFBhcmFtZXRyaWMgKHQpIHZhbHVlcyBmb3Igd2hlcmUgZGFzaCBib3VuZGFyaWVzIGV4aXN0XHJcbiAgdmFsdWVzOiBudW1iZXJbXTtcclxuXHJcbiAgLy8gVG90YWwgYXJjIGxlbmd0aCBmb3IgdGhpcyBzZWdtZW50XHJcbiAgYXJjTGVuZ3RoOiBudW1iZXI7XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlIHN0YXJ0IG9mIHRoZSBzZWdtZW50IGlzIGluc2lkZSBhIGRhc2ggKGluc3RlYWQgb2YgYSBnYXApXHJcbiAgaW5pdGlhbGx5SW5zaWRlOiBib29sZWFuO1xyXG59O1xyXG5cclxudHlwZSBTaW1wbGVPdmVybGFwID0ge1xyXG4gIGE6IG51bWJlcjtcclxuICBiOiBudW1iZXI7XHJcbn07XHJcblxyXG4vLyBudWxsIGlmIG5vIHNvbHV0aW9uLCB0cnVlIGlmIGV2ZXJ5IGEsYiBwYWlyIGlzIGEgc29sdXRpb24sIG90aGVyd2lzZSB0aGUgc2luZ2xlIHNvbHV0aW9uXHJcbnR5cGUgUG9zc2libGVTaW1wbGVPdmVybGFwID0gU2ltcGxlT3ZlcmxhcCB8IG51bGwgfCB0cnVlO1xyXG5cclxuZXhwb3J0IHR5cGUgQ2xvc2VzdFRvUG9pbnRSZXN1bHQgPSB7XHJcbiAgc2VnbWVudDogU2VnbWVudDtcclxuICB0OiBudW1iZXI7XHJcbiAgY2xvc2VzdFBvaW50OiBWZWN0b3IyO1xyXG4gIGRpc3RhbmNlU3F1YXJlZDogbnVtYmVyO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUGllY2V3aXNlTGluZWFyT3B0aW9ucyA9IHtcclxuICAvLyBob3cgbWFueSBsZXZlbHMgdG8gZm9yY2Ugc3ViZGl2aXNpb25zXHJcbiAgbWluTGV2ZWxzPzogbnVtYmVyO1xyXG5cclxuICAvLyBwcmV2ZW50IHN1YmRpdmlzaW9uIHBhc3QgdGhpcyBsZXZlbFxyXG4gIG1heExldmVscz86IG51bWJlcjtcclxuXHJcbiAgLy8gY29udHJvbHMgbGV2ZWwgb2Ygc3ViZGl2aXNpb24gYnkgYXR0ZW1wdGluZyB0byBlbnN1cmUgYSBtYXhpbXVtIChzcXVhcmVkKSBkZXZpYXRpb24gZnJvbSB0aGUgY3VydmVcclxuICBkaXN0YW5jZUVwc2lsb24/OiBudW1iZXIgfCBudWxsO1xyXG5cclxuICAvLyBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gY3VydmF0dXJlIGNoYW5nZSBiZXR3ZWVuIHNlZ21lbnRzXHJcbiAgY3VydmVFcHNpbG9uPzogbnVtYmVyIHwgbnVsbDtcclxuXHJcbiAgLy8gcmVwcmVzZW50cyBhICh1c3VhbGx5IG5vbi1saW5lYXIpIHRyYW5zZm9ybWF0aW9uIGFwcGxpZWRcclxuICBwb2ludE1hcD86ICggdjogVmVjdG9yMiApID0+IFZlY3RvcjI7XHJcblxyXG4gIC8vIGlmIHRoZSBtZXRob2QgbmFtZSBpcyBmb3VuZCBvbiB0aGUgc2VnbWVudCwgaXQgaXMgY2FsbGVkIHdpdGggdGhlIGV4cGVjdGVkIHNpZ25hdHVyZVxyXG4gIC8vIGZ1bmN0aW9uKCBvcHRpb25zICkgOiBBcnJheVtTZWdtZW50XSBpbnN0ZWFkIG9mIHVzaW5nIG91ciBicnV0ZS1mb3JjZSBsb2dpY1xyXG4gIG1ldGhvZE5hbWU/OiBzdHJpbmc7XHJcbn07XHJcblxyXG50eXBlIFBpZWNld2lzZUxpbmVhck9yQXJjUmVjdXJzaW9uT3B0aW9ucyA9IHtcclxuICBjdXJ2YXR1cmVUaHJlc2hvbGQ6IG51bWJlcjtcclxuICBlcnJvclRocmVzaG9sZDogbnVtYmVyO1xyXG4gIGVycm9yUG9pbnRzOiBbbnVtYmVyLCBudW1iZXJdO1xyXG59O1xyXG5cclxudHlwZSBQaWVjZXdpc2VMaW5lYXJPckFyY09wdGlvbnMgPSB7XHJcbiAgbWluTGV2ZWxzPzogbnVtYmVyO1xyXG4gIG1heExldmVscz86IG51bWJlcjtcclxufSAmIFBhcnRpYWw8UGllY2V3aXNlTGluZWFyT3JBcmNSZWN1cnNpb25PcHRpb25zPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIFNlZ21lbnQge1xyXG5cclxuICBwdWJsaWMgaW52YWxpZGF0aW9uRW1pdHRlcjogVEVtaXR0ZXI7XHJcblxyXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuaW52YWxpZGF0aW9uRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xyXG4gIH1cclxuXHJcbiAgLy8gVGhlIHN0YXJ0IHBvaW50IG9mIHRoZSBzZWdtZW50LCBwYXJhbWV0cmljYWxseSBhdCB0PTAuXHJcbiAgcHVibGljIGFic3RyYWN0IGdldCBzdGFydCgpOiBWZWN0b3IyO1xyXG5cclxuICAvLyBUaGUgZW5kIHBvaW50IG9mIHRoZSBzZWdtZW50LCBwYXJhbWV0cmljYWxseSBhdCB0PTEuXHJcbiAgcHVibGljIGFic3RyYWN0IGdldCBlbmQoKTogVmVjdG9yMjtcclxuXHJcbiAgLy8gVGhlIG5vcm1hbGl6ZWQgdGFuZ2VudCB2ZWN0b3IgdG8gdGhlIHNlZ21lbnQgYXQgaXRzIHN0YXJ0IHBvaW50LCBwb2ludGluZyBpbiB0aGUgZGlyZWN0aW9uIG9mIG1vdGlvbiAoZnJvbSBzdGFydCB0b1xyXG4gIC8vIGVuZCkuXHJcbiAgcHVibGljIGFic3RyYWN0IGdldCBzdGFydFRhbmdlbnQoKTogVmVjdG9yMjtcclxuXHJcbiAgLy8gVGhlIG5vcm1hbGl6ZWQgdGFuZ2VudCB2ZWN0b3IgdG8gdGhlIHNlZ21lbnQgYXQgaXRzIGVuZCBwb2ludCwgcG9pbnRpbmcgaW4gdGhlIGRpcmVjdGlvbiBvZiBtb3Rpb24gKGZyb20gc3RhcnQgdG9cclxuICAvLyBlbmQpLlxyXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXQgZW5kVGFuZ2VudCgpOiBWZWN0b3IyO1xyXG5cclxuICAvLyBUaGUgYm91bmRpbmcgYm94IGZvciB0aGUgc2VnbWVudC5cclxuICBwdWJsaWMgYWJzdHJhY3QgZ2V0IGJvdW5kcygpOiBCb3VuZHMyO1xyXG5cclxuICAvLyBSZXR1cm5zIHRoZSBwb3NpdGlvbiBwYXJhbWV0cmljYWxseSwgd2l0aCAwIDw9IHQgPD0gMS4gTk9URSB0aGF0IHRoaXMgZnVuY3Rpb24gZG9lc24ndCBrZWVwIGEgY29uc3RhbnQgbWFnbml0dWRlXHJcbiAgLy8gdGFuZ2VudC5cclxuICBwdWJsaWMgYWJzdHJhY3QgcG9zaXRpb25BdCggdDogbnVtYmVyICk6IFZlY3RvcjI7XHJcblxyXG4gIC8vIFJldHVybnMgdGhlIG5vbi1ub3JtYWxpemVkIHRhbmdlbnQgKGR4L2R0LCBkeS9kdCkgb2YgdGhpcyBzZWdtZW50IGF0IHRoZSBwYXJhbWV0cmljIHZhbHVlIG9mIHQsIHdpdGggMCA8PSB0IDw9IDEuXHJcbiAgcHVibGljIGFic3RyYWN0IHRhbmdlbnRBdCggdDogbnVtYmVyICk6IFZlY3RvcjI7XHJcblxyXG4gIC8vIFJldHVybnMgdGhlIHNpZ25lZCBjdXJ2YXR1cmUgKHBvc2l0aXZlIGZvciB2aXN1YWwgY2xvY2t3aXNlIC0gbWF0aGVtYXRpY2FsIGNvdW50ZXJjbG9ja3dpc2UpXHJcbiAgcHVibGljIGFic3RyYWN0IGN1cnZhdHVyZUF0KCB0OiBudW1iZXIgKTogbnVtYmVyO1xyXG5cclxuICAvLyBSZXR1cm5zIGFuIGFycmF5IHdpdGggdXAgdG8gMiBzdWItc2VnbWVudHMsIHNwbGl0IGF0IHRoZSBwYXJhbWV0cmljIHQgdmFsdWUuIFRoZSBzZWdtZW50cyB0b2dldGhlciBzaG91bGQgbWFrZSB0aGVcclxuICAvLyBzYW1lIHNoYXBlIGFzIHRoZSBvcmlnaW5hbCBzZWdtZW50LlxyXG4gIHB1YmxpYyBhYnN0cmFjdCBzdWJkaXZpZGVkKCB0OiBudW1iZXIgKTogU2VnbWVudFtdO1xyXG5cclxuICAvLyBSZXR1cm5zIGEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIFNWRyBwYXRoLiBhc3N1bWVzIHRoYXQgdGhlIHN0YXJ0IHBvaW50IGlzIGFscmVhZHkgcHJvdmlkZWQsIHNvIGFueXRoaW5nIHRoYXQgY2FsbHNcclxuICAvLyB0aGlzIG5lZWRzIHRvIHB1dCB0aGUgTSBjYWxscyBmaXJzdFxyXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRTVkdQYXRoRnJhZ21lbnQoKTogc3RyaW5nO1xyXG5cclxuICAvLyBSZXR1cm5zIGFuIGFycmF5IG9mIHNlZ21lbnRzIHRoYXQgd2lsbCBkcmF3IGFuIG9mZnNldCBjdXJ2ZSBvbiB0aGUgbG9naWNhbCBsZWZ0IHNpZGVcclxuICBwdWJsaWMgYWJzdHJhY3Qgc3Ryb2tlTGVmdCggbGluZVdpZHRoOiBudW1iZXIgKTogU2VnbWVudFtdO1xyXG5cclxuICAvLyBSZXR1cm5zIGFuIGFycmF5IG9mIHNlZ21lbnRzIHRoYXQgd2lsbCBkcmF3IGFuIG9mZnNldCBjdXJ2ZSBvbiB0aGUgbG9naWNhbCByaWdodCBzaWRlXHJcbiAgcHVibGljIGFic3RyYWN0IHN0cm9rZVJpZ2h0KCBsaW5lV2lkdGg6IG51bWJlciApOiBTZWdtZW50W107XHJcblxyXG4gIC8vIFJldHVybnMgdGhlIHdpbmRpbmcgbnVtYmVyIGZvciBpbnRlcnNlY3Rpb24gd2l0aCBhIHJheVxyXG4gIHB1YmxpYyBhYnN0cmFjdCB3aW5kaW5nSW50ZXJzZWN0aW9uKCByYXk6IFJheTIgKTogbnVtYmVyO1xyXG5cclxuICAvLyBSZXR1cm5zIGEgbGlzdCBvZiB0IHZhbHVlcyB3aGVyZSBkeC9kdCBvciBkeS9kdCBpcyAwIHdoZXJlIDAgPCB0IDwgMS4gc3ViZGl2aWRpbmcgb24gdGhlc2Ugd2lsbCByZXN1bHQgaW4gbW9ub3RvbmljXHJcbiAgLy8gc2VnbWVudHNcclxuICBwdWJsaWMgYWJzdHJhY3QgZ2V0SW50ZXJpb3JFeHRyZW1hVHMoKTogbnVtYmVyW107XHJcblxyXG4gIC8vIFJldHVybnMgYSBsaXN0IG9mIGludGVyc2VjdGlvbnMgYmV0d2VlbiB0aGUgc2VnbWVudCBhbmQgdGhlIHJheS5cclxuICBwdWJsaWMgYWJzdHJhY3QgaW50ZXJzZWN0aW9uKCByYXk6IFJheTIgKTogUmF5SW50ZXJzZWN0aW9uW107XHJcblxyXG4gIC8vIFJldHVybnMgYSB7Qm91bmRzMn0gcmVwcmVzZW50aW5nIHRoZSBib3VuZGluZyBib3ggZm9yIHRoZSBzZWdtZW50LlxyXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRCb3VuZHMoKTogQm91bmRzMjtcclxuXHJcbiAgLy8gUmV0dXJucyBzaWduZWQgYXJlYSBjb250cmlidXRpb24gZm9yIHRoaXMgc2VnbWVudCB1c2luZyBHcmVlbidzIFRoZW9yZW1cclxuICBwdWJsaWMgYWJzdHJhY3QgZ2V0U2lnbmVkQXJlYUZyYWdtZW50KCk6IG51bWJlcjtcclxuXHJcbiAgLy8gUmV0dXJucyBhIGxpc3Qgb2Ygbm9uLWRlZ2VuZXJhdGUgc2VnbWVudHMgdGhhdCBhcmUgZXF1aXZhbGVudCB0byB0aGlzIHNlZ21lbnQuIEdlbmVyYWxseSBnZXRzIHJpZCAob3Igc2ltcGxpZmllcylcclxuICAvLyBpbnZhbGlkIG9yIHJlcGVhdGVkIHNlZ21lbnRzLlxyXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXROb25kZWdlbmVyYXRlU2VnbWVudHMoKTogU2VnbWVudFtdO1xyXG5cclxuICAvLyBEcmF3cyB0aGUgc2VnbWVudCB0byB0aGUgMkQgQ2FudmFzIGNvbnRleHQsIGFzc3VtaW5nIHRoZSBjb250ZXh0J3MgY3VycmVudCBsb2NhdGlvbiBpcyBhbHJlYWR5IGF0IHRoZSBzdGFydCBwb2ludFxyXG4gIHB1YmxpYyBhYnN0cmFjdCB3cml0ZVRvQ29udGV4dCggY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEICk6IHZvaWQ7XHJcblxyXG4gIC8vIFJldHVybnMgYSBuZXcgc2VnbWVudCB0aGF0IHJlcHJlc2VudHMgdGhpcyBzZWdtZW50IGFmdGVyIHRyYW5zZm9ybWF0aW9uIGJ5IHRoZSBtYXRyaXhcclxuICBwdWJsaWMgYWJzdHJhY3QgdHJhbnNmb3JtZWQoIG1hdHJpeDogTWF0cml4MyApOiBTZWdtZW50O1xyXG5cclxuICAvKipcclxuICAgKiBXaWxsIHJldHVybiB0cnVlIGlmIHRoZSBzdGFydC9lbmQgdGFuZ2VudHMgYXJlIHB1cmVseSB2ZXJ0aWNhbCBvciBob3Jpem9udGFsLiBJZiBhbGwgb2YgdGhlIHNlZ21lbnRzIG9mIGEgc2hhcGVcclxuICAgKiBoYXZlIHRoaXMgcHJvcGVydHksIHRoZW4gdGhlIG9ubHkgbGluZSBqb2lucyB3aWxsIGJlIGEgbXVsdGlwbGUgb2YgcGkvMiAoOTAgZGVncmVlcyksIGFuZCBzbyBhbGwgb2YgdGhlIHR5cGVzIG9mXHJcbiAgICogbGluZSBqb2lucyB3aWxsIGhhdmUgdGhlIHNhbWUgYm91bmRzLiBUaGlzIG1lYW5zIHRoYXQgdGhlIHN0cm9rZWQgYm91bmRzIHdpbGwganVzdCBiZSBhIHB1cmUgZGlsYXRpb24gb2YgdGhlXHJcbiAgICogcmVndWxhciBib3VuZHMsIGJ5IGxpbmVXaWR0aCAvIDIuXHJcbiAgICovXHJcbiAgcHVibGljIGFyZVN0cm9rZWRCb3VuZHNEaWxhdGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgZXBzaWxvbiA9IDAuMDAwMDAwMTtcclxuXHJcbiAgICAvLyBJZiB0aGUgZGVyaXZhdGl2ZSBhdCB0aGUgc3RhcnQvZW5kIGFyZSBwb2ludGluZyBpbiBhIGNhcmRpbmFsIGRpcmVjdGlvbiAobm9ydGgvc291dGgvZWFzdC93ZXN0KSwgdGhlbiB0aGVcclxuICAgIC8vIGVuZHBvaW50cyB3b24ndCB0cmlnZ2VyIG5vbi1kaWxhdGVkIGJvdW5kcywgYW5kIHRoZSBpbnRlcmlvciBvZiB0aGUgY3VydmUgd2lsbCBub3QgY29udHJpYnV0ZS5cclxuICAgIHJldHVybiBNYXRoLmFicyggdGhpcy5zdGFydFRhbmdlbnQueCAqIHRoaXMuc3RhcnRUYW5nZW50LnkgKSA8IGVwc2lsb24gJiYgTWF0aC5hYnMoIHRoaXMuZW5kVGFuZ2VudC54ICogdGhpcy5lbmRUYW5nZW50LnkgKSA8IGVwc2lsb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUT0RPOiBvdmVycmlkZSBldmVyeXdoZXJlIHNvIHRoaXMgaXNuJ3QgbmVjZXNzYXJ5IChpdCdzIG5vdCBwYXJ0aWN1bGFybHkgZWZmaWNpZW50ISlcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Qm91bmRzV2l0aFRyYW5zZm9ybSggbWF0cml4OiBNYXRyaXgzICk6IEJvdW5kczIge1xyXG4gICAgY29uc3QgdHJhbnNmb3JtZWRTZWdtZW50ID0gdGhpcy50cmFuc2Zvcm1lZCggbWF0cml4ICk7XHJcbiAgICByZXR1cm4gdHJhbnNmb3JtZWRTZWdtZW50LmdldEJvdW5kcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXh0cmFjdHMgYSBzbGljZSBvZiBhIHNlZ21lbnQsIGJhc2VkIG9uIHRoZSBwYXJhbWV0cmljIHZhbHVlLlxyXG4gICAqXHJcbiAgICogR2l2ZW4gdGhhdCB0aGlzIHNlZ21lbnQgaXMgcmVwcmVzZW50ZWQgYnkgdGhlIGludGVydmFsIFswLDFdXHJcbiAgICovXHJcbiAgcHVibGljIHNsaWNlKCB0MDogbnVtYmVyLCB0MTogbnVtYmVyICk6IFNlZ21lbnQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdDAgPj0gMCAmJiB0MCA8PSAxICYmIHQxID49IDAgJiYgdDEgPD0gMSwgJ1BhcmFtZXRyaWMgdmFsdWUgb3V0IG9mIHJhbmdlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdDAgPCB0MSApO1xyXG5cclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xyXG4gICAgbGV0IHNlZ21lbnQ6IFNlZ21lbnQgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpc1xyXG4gICAgaWYgKCB0MSA8IDEgKSB7XHJcbiAgICAgIHNlZ21lbnQgPSBzZWdtZW50LnN1YmRpdmlkZWQoIHQxIClbIDAgXTtcclxuICAgIH1cclxuICAgIGlmICggdDAgPiAwICkge1xyXG4gICAgICBzZWdtZW50ID0gc2VnbWVudC5zdWJkaXZpZGVkKCBVdGlscy5saW5lYXIoIDAsIHQxLCAwLCAxLCB0MCApIClbIDEgXTtcclxuICAgIH1cclxuICAgIHJldHVybiBzZWdtZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHRMaXN0IC0gbGlzdCBvZiBzb3J0ZWQgdCB2YWx1ZXMgZnJvbSAwIDw9IHQgPD0gMVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdWJkaXZpc2lvbnMoIHRMaXN0OiBudW1iZXJbXSApOiBTZWdtZW50W10ge1xyXG4gICAgLy8gdGhpcyBjb3VsZCBiZSBzb2x2ZWQgYnkgcmVjdXJzaW9uLCBidXQgd2UgZG9uJ3QgcGxhbiBvbiB0aGUgSlMgZW5naW5lIGRvaW5nIHRhaWwtY2FsbCBvcHRpbWl6YXRpb25cclxuXHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcclxuICAgIGxldCByaWdodDogU2VnbWVudCA9IHRoaXM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY29uc2lzdGVudC10aGlzXHJcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRMaXN0Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAvLyBhc3N1bWUgYmluYXJ5IHN1YmRpdmlzaW9uXHJcbiAgICAgIGNvbnN0IHQgPSB0TGlzdFsgaSBdO1xyXG4gICAgICBjb25zdCBhcnIgPSByaWdodC5zdWJkaXZpZGVkKCB0ICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGFyci5sZW5ndGggPT09IDIgKTtcclxuICAgICAgcmVzdWx0LnB1c2goIGFyclsgMCBdICk7XHJcbiAgICAgIHJpZ2h0ID0gYXJyWyAxIF07XHJcblxyXG4gICAgICAvLyBzY2FsZSB1cCB0aGUgcmVtYWluaW5nIHQgdmFsdWVzXHJcbiAgICAgIGZvciAoIGxldCBqID0gaSArIDE7IGogPCB0TGlzdC5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICB0TGlzdFsgaiBdID0gVXRpbHMubGluZWFyKCB0LCAxLCAwLCAxLCB0TGlzdFsgaiBdICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJlc3VsdC5wdXNoKCByaWdodCApO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybiBhbiBhcnJheSBvZiBzZWdtZW50cyBmcm9tIGJyZWFraW5nIHRoaXMgc2VnbWVudCBpbnRvIG1vbm90b25lIHBpZWNlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdWJkaXZpZGVkSW50b01vbm90b25lKCk6IFNlZ21lbnRbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5zdWJkaXZpc2lvbnMoIHRoaXMuZ2V0SW50ZXJpb3JFeHRyZW1hVHMoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBpZiB0aGUgc2VnbWVudCBpcyBzdWZmaWNpZW50bHkgZmxhdCAoZ2l2ZW4gY2VydGFpbiBlcHNpbG9uIHZhbHVlcylcclxuICAgKlxyXG4gICAqIEBwYXJhbSBkaXN0YW5jZUVwc2lsb24gLSBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gKHNxdWFyZWQpXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIGRldmlhdGlvbiBmcm9tIHRoZSBjdXJ2ZVxyXG4gICAqIEBwYXJhbSBjdXJ2ZUVwc2lsb24gLSBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gY3VydmF0dXJlIGNoYW5nZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICBiZXR3ZWVuIHNlZ21lbnRzXHJcbiAgICovXHJcbiAgcHVibGljIGlzU3VmZmljaWVudGx5RmxhdCggZGlzdGFuY2VFcHNpbG9uOiBudW1iZXIsIGN1cnZlRXBzaWxvbjogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLnN0YXJ0O1xyXG4gICAgY29uc3QgbWlkZGxlID0gdGhpcy5wb3NpdGlvbkF0KCAwLjUgKTtcclxuICAgIGNvbnN0IGVuZCA9IHRoaXMuZW5kO1xyXG5cclxuICAgIHJldHVybiBTZWdtZW50LmlzU3VmZmljaWVudGx5RmxhdCggZGlzdGFuY2VFcHNpbG9uLCBjdXJ2ZUVwc2lsb24sIHN0YXJ0LCBtaWRkbGUsIGVuZCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgKHNvbWV0aW1lcyBhcHByb3hpbWF0ZSkgYXJjIGxlbmd0aCBvZiB0aGUgc2VnbWVudC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0QXJjTGVuZ3RoKCBkaXN0YW5jZUVwc2lsb246IG51bWJlciwgY3VydmVFcHNpbG9uOiBudW1iZXIsIG1heExldmVsczogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBkaXN0YW5jZUVwc2lsb24gPSBkaXN0YW5jZUVwc2lsb24gPT09IHVuZGVmaW5lZCA/IDFlLTEwIDogZGlzdGFuY2VFcHNpbG9uO1xyXG4gICAgY3VydmVFcHNpbG9uID0gY3VydmVFcHNpbG9uID09PSB1bmRlZmluZWQgPyAxZS04IDogY3VydmVFcHNpbG9uO1xyXG4gICAgbWF4TGV2ZWxzID0gbWF4TGV2ZWxzID09PSB1bmRlZmluZWQgPyAxNSA6IG1heExldmVscztcclxuXHJcbiAgICBpZiAoIG1heExldmVscyA8PSAwIHx8IHRoaXMuaXNTdWZmaWNpZW50bHlGbGF0KCBkaXN0YW5jZUVwc2lsb24sIGN1cnZlRXBzaWxvbiApICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5zdGFydC5kaXN0YW5jZSggdGhpcy5lbmQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb25zdCBzdWJkaXZpZGVkID0gdGhpcy5zdWJkaXZpZGVkKCAwLjUgKTtcclxuICAgICAgcmV0dXJuIHN1YmRpdmlkZWRbIDAgXS5nZXRBcmNMZW5ndGgoIGRpc3RhbmNlRXBzaWxvbiwgY3VydmVFcHNpbG9uLCBtYXhMZXZlbHMgLSAxICkgK1xyXG4gICAgICAgICAgICAgc3ViZGl2aWRlZFsgMSBdLmdldEFyY0xlbmd0aCggZGlzdGFuY2VFcHNpbG9uLCBjdXJ2ZUVwc2lsb24sIG1heExldmVscyAtIDEgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGxpbmUgZGFzaCBwYXJhbWV0cmljIG9mZnNldHMgZm9yIGEgZ2l2ZW4gc2VnbWVudC5cclxuICAgKlxyXG4gICAqIEFzIGFsd2F5cywgdGhpcyBpcyBmYWlybHkgYXBwcm94aW1hdGUgZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIHNlZ21lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbGluZURhc2hcclxuICAgKiBAcGFyYW0gbGluZURhc2hPZmZzZXRcclxuICAgKiBAcGFyYW0gZGlzdGFuY2VFcHNpbG9uIC0gY29udHJvbHMgbGV2ZWwgb2Ygc3ViZGl2aXNpb24gYnkgYXR0ZW1wdGluZyB0byBlbnN1cmUgYSBtYXhpbXVtIChzcXVhcmVkKVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZpYXRpb24gZnJvbSB0aGUgY3VydmVcclxuICAgKiBAcGFyYW0gY3VydmVFcHNpbG9uIC0gY29udHJvbHMgbGV2ZWwgb2Ygc3ViZGl2aXNpb24gYnkgYXR0ZW1wdGluZyB0byBlbnN1cmUgYSBtYXhpbXVtIGN1cnZhdHVyZSBjaGFuZ2VcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgYmV0d2VlbiBzZWdtZW50c1xyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXREYXNoVmFsdWVzKCBsaW5lRGFzaDogbnVtYmVyW10sIGxpbmVEYXNoT2Zmc2V0OiBudW1iZXIsIGRpc3RhbmNlRXBzaWxvbjogbnVtYmVyLCBjdXJ2ZUVwc2lsb246IG51bWJlciApOiBEYXNoVmFsdWVzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpbmVEYXNoLmxlbmd0aCA+IDAsICdEbyBub3QgY2FsbCB3aXRoIGFuIGVtcHR5IGRhc2ggYXJyYXknICk7XHJcblxyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuXHJcbiAgICBjb25zdCB2YWx1ZXMgPSBbXTtcclxuICAgIGxldCBhcmNMZW5ndGggPSAwO1xyXG5cclxuICAgIC8vIERvIHRoZSBvZmZzZXQgbW9kdWxvIHRoZSBzdW0sIHNvIHRoYXQgd2UgZG9uJ3QgaGF2ZSB0byBjeWNsZSBmb3IgYSBsb25nIHRpbWVcclxuICAgIGNvbnN0IGxpbmVEYXNoU3VtID0gXy5zdW0oIGxpbmVEYXNoICk7XHJcbiAgICBsaW5lRGFzaE9mZnNldCA9IGxpbmVEYXNoT2Zmc2V0ICUgbGluZURhc2hTdW07XHJcblxyXG4gICAgLy8gRW5zdXJlIHRoZSBsaW5lRGFzaE9mZnNldCBpcyBwb3NpdGl2ZVxyXG4gICAgaWYgKCBsaW5lRGFzaE9mZnNldCA8IDAgKSB7XHJcbiAgICAgIGxpbmVEYXNoT2Zmc2V0ICs9IGxpbmVEYXNoU3VtO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoZSBjdXJyZW50IHNlY3Rpb24gb2YgbGluZURhc2ggdGhhdCB3ZSBhcmUgaW5cclxuICAgIGxldCBkYXNoSW5kZXggPSAwO1xyXG4gICAgbGV0IGRhc2hPZmZzZXQgPSAwO1xyXG4gICAgbGV0IGlzSW5zaWRlID0gdHJ1ZTtcclxuXHJcbiAgICBmdW5jdGlvbiBuZXh0RGFzaEluZGV4KCk6IHZvaWQge1xyXG4gICAgICBkYXNoSW5kZXggPSAoIGRhc2hJbmRleCArIDEgKSAlIGxpbmVEYXNoLmxlbmd0aDtcclxuICAgICAgaXNJbnNpZGUgPSAhaXNJbnNpZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQnVybiBvZmYgaW5pdGlhbCBsaW5lRGFzaE9mZnNldFxyXG4gICAgd2hpbGUgKCBsaW5lRGFzaE9mZnNldCA+IDAgKSB7XHJcbiAgICAgIGlmICggbGluZURhc2hPZmZzZXQgPj0gbGluZURhc2hbIGRhc2hJbmRleCBdICkge1xyXG4gICAgICAgIGxpbmVEYXNoT2Zmc2V0IC09IGxpbmVEYXNoWyBkYXNoSW5kZXggXTtcclxuICAgICAgICBuZXh0RGFzaEluZGV4KCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgZGFzaE9mZnNldCA9IGxpbmVEYXNoT2Zmc2V0O1xyXG4gICAgICAgIGxpbmVEYXNoT2Zmc2V0ID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGluaXRpYWxseUluc2lkZSA9IGlzSW5zaWRlO1xyXG5cclxuICAgIC8vIFJlY3Vyc2l2ZWx5IHByb2dyZXNzIHRocm91Z2ggdW50aWwgd2UgaGF2ZSBtb3N0bHktbGluZWFyIHNlZ21lbnRzLlxyXG4gICAgKCBmdW5jdGlvbiByZWN1ciggdDA6IG51bWJlciwgdDE6IG51bWJlciwgcDA6IFZlY3RvcjIsIHAxOiBWZWN0b3IyLCBkZXB0aDogbnVtYmVyICkge1xyXG4gICAgICAvLyBDb21wdXRlIHRoZSB0L3Bvc2l0aW9uIGF0IHRoZSBtaWRwb2ludCB0IHZhbHVlXHJcbiAgICAgIGNvbnN0IHRNaWQgPSAoIHQwICsgdDEgKSAvIDI7XHJcbiAgICAgIGNvbnN0IHBNaWQgPSBzZWxmLnBvc2l0aW9uQXQoIHRNaWQgKTtcclxuXHJcbiAgICAgIC8vIElmIGl0J3MgZmxhdCBlbm91Z2ggKG9yIHdlIGhpdCBvdXIgcmVjdXJzaW9uIGxpbWl0KSwgcHJvY2VzcyBpdFxyXG4gICAgICBpZiAoIGRlcHRoID4gMTQgfHwgU2VnbWVudC5pc1N1ZmZpY2llbnRseUZsYXQoIGRpc3RhbmNlRXBzaWxvbiwgY3VydmVFcHNpbG9uLCBwMCwgcE1pZCwgcDEgKSApIHtcclxuICAgICAgICAvLyBFc3RpbWF0ZSBsZW5ndGhcclxuICAgICAgICBjb25zdCB0b3RhbExlbmd0aCA9IHAwLmRpc3RhbmNlKCBwTWlkICkgKyBwTWlkLmRpc3RhbmNlKCBwMSApO1xyXG4gICAgICAgIGFyY0xlbmd0aCArPSB0b3RhbExlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gV2hpbGUgd2UgYXJlIGxvbmdlciB0aGFuIHRoZSByZW1haW5pbmcgYW1vdW50IGZvciB0aGUgbmV4dCBkYXNoIGNoYW5nZS5cclxuICAgICAgICBsZXQgbGVuZ3RoTGVmdCA9IHRvdGFsTGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlICggZGFzaE9mZnNldCArIGxlbmd0aExlZnQgPj0gbGluZURhc2hbIGRhc2hJbmRleCBdICkge1xyXG4gICAgICAgICAgLy8gQ29tcHV0ZSB0aGUgdCAoZm9yIG5vdywgYmFzZWQgb24gdGhlIHRvdGFsIGxlbmd0aCBmb3IgZWFzZSlcclxuICAgICAgICAgIGNvbnN0IHQgPSBVdGlscy5saW5lYXIoIDAsIHRvdGFsTGVuZ3RoLCB0MCwgdDEsIHRvdGFsTGVuZ3RoIC0gbGVuZ3RoTGVmdCArIGxpbmVEYXNoWyBkYXNoSW5kZXggXSAtIGRhc2hPZmZzZXQgKTtcclxuXHJcbiAgICAgICAgICAvLyBSZWNvcmQgdGhlIGRhc2ggY2hhbmdlXHJcbiAgICAgICAgICB2YWx1ZXMucHVzaCggdCApO1xyXG5cclxuICAgICAgICAgIC8vIFJlbW92ZSBhbW91bnQgYWRkZWQgZnJvbSBvdXIgbGVuZ3RoTGVmdCAobW92ZSB0byB0aGUgZGFzaClcclxuICAgICAgICAgIGxlbmd0aExlZnQgLT0gbGluZURhc2hbIGRhc2hJbmRleCBdIC0gZGFzaE9mZnNldDtcclxuICAgICAgICAgIGRhc2hPZmZzZXQgPSAwOyAvLyBhdCB0aGUgZGFzaCwgd2UnbGwgaGF2ZSAwIG9mZnNldFxyXG4gICAgICAgICAgbmV4dERhc2hJbmRleCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU3BpbGwtb3ZlciwganVzdCBhZGQgaXRcclxuICAgICAgICBkYXNoT2Zmc2V0ID0gZGFzaE9mZnNldCArIGxlbmd0aExlZnQ7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmVjdXIoIHQwLCB0TWlkLCBwMCwgcE1pZCwgZGVwdGggKyAxICk7XHJcbiAgICAgICAgcmVjdXIoIHRNaWQsIHQxLCBwTWlkLCBwMSwgZGVwdGggKyAxICk7XHJcbiAgICAgIH1cclxuICAgIH0gKSggMCwgMSwgdGhpcy5zdGFydCwgdGhpcy5lbmQsIDAgKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB2YWx1ZXM6IHZhbHVlcyxcclxuICAgICAgYXJjTGVuZ3RoOiBhcmNMZW5ndGgsXHJcbiAgICAgIGluaXRpYWxseUluc2lkZTogaW5pdGlhbGx5SW5zaWRlXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICpcclxuICAgKiBAcGFyYW0gW29wdGlvbnNdXHJcbiAgICogQHBhcmFtIFttaW5MZXZlbHNdIC0gICBob3cgbWFueSBsZXZlbHMgdG8gZm9yY2Ugc3ViZGl2aXNpb25zXHJcbiAgICogQHBhcmFtIFttYXhMZXZlbHNdIC0gICBwcmV2ZW50IHN1YmRpdmlzaW9uIHBhc3QgdGhpcyBsZXZlbFxyXG4gICAqIEBwYXJhbSBbc2VnbWVudHNdXHJcbiAgICogQHBhcmFtIFtzdGFydF1cclxuICAgKiBAcGFyYW0gW2VuZF1cclxuICAgKi9cclxuICBwdWJsaWMgdG9QaWVjZXdpc2VMaW5lYXJTZWdtZW50cyggb3B0aW9uczogUGllY2V3aXNlTGluZWFyT3B0aW9ucywgbWluTGV2ZWxzPzogbnVtYmVyLCBtYXhMZXZlbHM/OiBudW1iZXIsIHNlZ21lbnRzPzogTGluZVtdLCBzdGFydD86IFZlY3RvcjIsIGVuZD86IFZlY3RvcjIgKTogTGluZVtdIHtcclxuICAgIC8vIGZvciB0aGUgZmlyc3QgY2FsbCwgaW5pdGlhbGl6ZSBtaW4vbWF4IGxldmVscyBmcm9tIG91ciBvcHRpb25zXHJcbiAgICBtaW5MZXZlbHMgPSBtaW5MZXZlbHMgPT09IHVuZGVmaW5lZCA/IG9wdGlvbnMubWluTGV2ZWxzISA6IG1pbkxldmVscztcclxuICAgIG1heExldmVscyA9IG1heExldmVscyA9PT0gdW5kZWZpbmVkID8gb3B0aW9ucy5tYXhMZXZlbHMhIDogbWF4TGV2ZWxzO1xyXG5cclxuICAgIHNlZ21lbnRzID0gc2VnbWVudHMgfHwgW107XHJcbiAgICBjb25zdCBwb2ludE1hcCA9IG9wdGlvbnMucG9pbnRNYXAgfHwgXy5pZGVudGl0eTtcclxuXHJcbiAgICAvLyBwb2ludHMgbWFwcGVkIGJ5IHRoZSAocG9zc2libHktbm9ubGluZWFyKSBwb2ludE1hcC5cclxuICAgIHN0YXJ0ID0gc3RhcnQgfHwgcG9pbnRNYXAoIHRoaXMuc3RhcnQgKTtcclxuICAgIGVuZCA9IGVuZCB8fCBwb2ludE1hcCggdGhpcy5lbmQgKTtcclxuICAgIGNvbnN0IG1pZGRsZSA9IHBvaW50TWFwKCB0aGlzLnBvc2l0aW9uQXQoIDAuNSApICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWluTGV2ZWxzIDw9IG1heExldmVscyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5kaXN0YW5jZUVwc2lsb24gPT09IG51bGwgfHwgdHlwZW9mIG9wdGlvbnMuZGlzdGFuY2VFcHNpbG9uID09PSAnbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5jdXJ2ZUVwc2lsb24gPT09IG51bGwgfHwgdHlwZW9mIG9wdGlvbnMuY3VydmVFcHNpbG9uID09PSAnbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXBvaW50TWFwIHx8IHR5cGVvZiBwb2ludE1hcCA9PT0gJ2Z1bmN0aW9uJyApO1xyXG5cclxuICAgIC8vIGkuZS4gd2Ugd2lsbCBoYXZlIGZpbmlzaGVkID0gbWF4TGV2ZWxzID09PSAwIHx8ICggbWluTGV2ZWxzIDw9IDAgJiYgZXBzaWxvbkNvbnN0cmFpbnRzICksIGp1c3QgZGlkbid0IHdhbnQgdG8gb25lLWxpbmUgaXRcclxuICAgIGxldCBmaW5pc2hlZCA9IG1heExldmVscyA9PT0gMDsgLy8gYmFpbCBvdXQgb25jZSB3ZSByZWFjaCBvdXIgbWF4aW11bSBudW1iZXIgb2Ygc3ViZGl2aXNpb24gbGV2ZWxzXHJcbiAgICBpZiAoICFmaW5pc2hlZCAmJiBtaW5MZXZlbHMgPD0gMCApIHsgLy8gZm9yY2Ugc3ViZGl2aXNpb24gaWYgbWluTGV2ZWxzIGhhc24ndCBiZWVuIHJlYWNoZWRcclxuICAgICAgZmluaXNoZWQgPSB0aGlzLmlzU3VmZmljaWVudGx5RmxhdChcclxuICAgICAgICBvcHRpb25zLmRpc3RhbmNlRXBzaWxvbiA9PT0gbnVsbCB8fCBvcHRpb25zLmRpc3RhbmNlRXBzaWxvbiA9PT0gdW5kZWZpbmVkID8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIDogb3B0aW9ucy5kaXN0YW5jZUVwc2lsb24sXHJcbiAgICAgICAgb3B0aW9ucy5jdXJ2ZUVwc2lsb24gPT09IG51bGwgfHwgb3B0aW9ucy5jdXJ2ZUVwc2lsb24gPT09IHVuZGVmaW5lZCA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IG9wdGlvbnMuY3VydmVFcHNpbG9uXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBmaW5pc2hlZCApIHtcclxuICAgICAgc2VnbWVudHMucHVzaCggbmV3IExpbmUoIHN0YXJ0ISwgZW5kISApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3Qgc3ViZGl2aWRlZFNlZ21lbnRzID0gdGhpcy5zdWJkaXZpZGVkKCAwLjUgKTtcclxuICAgICAgc3ViZGl2aWRlZFNlZ21lbnRzWyAwIF0udG9QaWVjZXdpc2VMaW5lYXJTZWdtZW50cyggb3B0aW9ucywgbWluTGV2ZWxzIC0gMSwgbWF4TGV2ZWxzIC0gMSwgc2VnbWVudHMsIHN0YXJ0LCBtaWRkbGUgKTtcclxuICAgICAgc3ViZGl2aWRlZFNlZ21lbnRzWyAxIF0udG9QaWVjZXdpc2VMaW5lYXJTZWdtZW50cyggb3B0aW9ucywgbWluTGV2ZWxzIC0gMSwgbWF4TGV2ZWxzIC0gMSwgc2VnbWVudHMsIG1pZGRsZSwgZW5kICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc2VnbWVudHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBMaW5lIGFuZC9vciBBcmMgc2VnbWVudHMgdGhhdCBhcHByb3hpbWF0ZXMgdGhpcyBzZWdtZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b1BpZWNld2lzZUxpbmVhck9yQXJjU2VnbWVudHMoIHByb3ZpZGVkT3B0aW9uczogUGllY2V3aXNlTGluZWFyT3JBcmNPcHRpb25zICk6IFNlZ21lbnRbXSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFBpZWNld2lzZUxpbmVhck9yQXJjT3B0aW9ucywgUGllY2V3aXNlTGluZWFyT3JBcmNPcHRpb25zLCBQaWVjZXdpc2VMaW5lYXJPckFyY1JlY3Vyc2lvbk9wdGlvbnM+KCkoIHtcclxuICAgICAgbWluTGV2ZWxzOiAyLFxyXG4gICAgICBtYXhMZXZlbHM6IDcsXHJcbiAgICAgIGN1cnZhdHVyZVRocmVzaG9sZDogMC4wMixcclxuICAgICAgZXJyb3JUaHJlc2hvbGQ6IDEwLFxyXG4gICAgICBlcnJvclBvaW50czogWyAwLjI1LCAwLjc1IF1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHNlZ21lbnRzOiBTZWdtZW50W10gPSBbXTtcclxuICAgIHRoaXMudG9QaWVjZXdpc2VMaW5lYXJPckFyY1JlY3Vyc2lvbiggb3B0aW9ucywgb3B0aW9ucy5taW5MZXZlbHMsIG9wdGlvbnMubWF4TGV2ZWxzLCBzZWdtZW50cyxcclxuICAgICAgMCwgMSxcclxuICAgICAgdGhpcy5wb3NpdGlvbkF0KCAwICksIHRoaXMucG9zaXRpb25BdCggMSApLFxyXG4gICAgICB0aGlzLmN1cnZhdHVyZUF0KCAwICksIHRoaXMuY3VydmF0dXJlQXQoIDEgKSApO1xyXG4gICAgcmV0dXJuIHNlZ21lbnRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGVscGVyIGZ1bmN0aW9uIGZvciB0b1BpZWNld2lzZUxpbmVhck9yQXJjU2VnbWVudHMuIC0gd2lsbCBwdXNoIGludG8gc2VnbWVudHNcclxuICAgKi9cclxuICBwcml2YXRlIHRvUGllY2V3aXNlTGluZWFyT3JBcmNSZWN1cnNpb24oIG9wdGlvbnM6IFBpZWNld2lzZUxpbmVhck9yQXJjUmVjdXJzaW9uT3B0aW9ucywgbWluTGV2ZWxzOiBudW1iZXIsIG1heExldmVsczogbnVtYmVyLCBzZWdtZW50czogU2VnbWVudFtdLCBzdGFydFQ6IG51bWJlciwgZW5kVDogbnVtYmVyLCBzdGFydFBvaW50OiBWZWN0b3IyLCBlbmRQb2ludDogVmVjdG9yMiwgc3RhcnRDdXJ2YXR1cmU6IG51bWJlciwgZW5kQ3VydmF0dXJlOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBjb25zdCBtaWRkbGVUID0gKCBzdGFydFQgKyBlbmRUICkgLyAyO1xyXG4gICAgY29uc3QgbWlkZGxlUG9pbnQgPSB0aGlzLnBvc2l0aW9uQXQoIG1pZGRsZVQgKTtcclxuICAgIGNvbnN0IG1pZGRsZUN1cnZhdHVyZSA9IHRoaXMuY3VydmF0dXJlQXQoIG1pZGRsZVQgKTtcclxuXHJcbiAgICBpZiAoIG1heExldmVscyA8PSAwIHx8ICggbWluTGV2ZWxzIDw9IDAgJiYgTWF0aC5hYnMoIHN0YXJ0Q3VydmF0dXJlIC0gbWlkZGxlQ3VydmF0dXJlICkgKyBNYXRoLmFicyggbWlkZGxlQ3VydmF0dXJlIC0gZW5kQ3VydmF0dXJlICkgPCBvcHRpb25zLmN1cnZhdHVyZVRocmVzaG9sZCAqIDIgKSApIHtcclxuICAgICAgY29uc3Qgc2VnbWVudCA9IEFyYy5jcmVhdGVGcm9tUG9pbnRzKCBzdGFydFBvaW50LCBtaWRkbGVQb2ludCwgZW5kUG9pbnQgKTtcclxuICAgICAgbGV0IG5lZWRzU3BsaXQgPSBmYWxzZTtcclxuICAgICAgaWYgKCBzZWdtZW50IGluc3RhbmNlb2YgQXJjICkge1xyXG4gICAgICAgIGNvbnN0IHJhZGl1c1NxdWFyZWQgPSBzZWdtZW50LnJhZGl1cyAqIHNlZ21lbnQucmFkaXVzO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG9wdGlvbnMuZXJyb3JQb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICBjb25zdCB0ID0gb3B0aW9ucy5lcnJvclBvaW50c1sgaSBdO1xyXG4gICAgICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLnBvc2l0aW9uQXQoIHN0YXJ0VCAqICggMSAtIHQgKSArIGVuZFQgKiB0ICk7XHJcbiAgICAgICAgICBpZiAoIE1hdGguYWJzKCBwb2ludC5kaXN0YW5jZVNxdWFyZWQoIHNlZ21lbnQuY2VudGVyICkgLSByYWRpdXNTcXVhcmVkICkgPiBvcHRpb25zLmVycm9yVGhyZXNob2xkICkge1xyXG4gICAgICAgICAgICBuZWVkc1NwbGl0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICggIW5lZWRzU3BsaXQgKSB7XHJcbiAgICAgICAgc2VnbWVudHMucHVzaCggc2VnbWVudCApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy50b1BpZWNld2lzZUxpbmVhck9yQXJjUmVjdXJzaW9uKCBvcHRpb25zLCBtaW5MZXZlbHMgLSAxLCBtYXhMZXZlbHMgLSAxLCBzZWdtZW50cyxcclxuICAgICAgc3RhcnRULCBtaWRkbGVULFxyXG4gICAgICBzdGFydFBvaW50LCBtaWRkbGVQb2ludCxcclxuICAgICAgc3RhcnRDdXJ2YXR1cmUsIG1pZGRsZUN1cnZhdHVyZSApO1xyXG4gICAgdGhpcy50b1BpZWNld2lzZUxpbmVhck9yQXJjUmVjdXJzaW9uKCBvcHRpb25zLCBtaW5MZXZlbHMgLSAxLCBtYXhMZXZlbHMgLSAxLCBzZWdtZW50cyxcclxuICAgICAgbWlkZGxlVCwgZW5kVCxcclxuICAgICAgbWlkZGxlUG9pbnQsIGVuZFBvaW50LFxyXG4gICAgICBtaWRkbGVDdXJ2YXR1cmUsIGVuZEN1cnZhdHVyZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIFNoYXBlIGNvbnRhaW5pbmcganVzdCB0aGlzIG9uZSBzZWdtZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b1NoYXBlKCk6IFNoYXBlIHtcclxuICAgIHJldHVybiBuZXcgU2hhcGUoIFsgbmV3IFN1YnBhdGgoIFsgdGhpcyBdICkgXSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldENsb3Nlc3RQb2ludHMoIHBvaW50OiBWZWN0b3IyICk6IENsb3Nlc3RUb1BvaW50UmVzdWx0W10ge1xyXG4gICAgLy8gVE9ETzogc29sdmUgc2VnbWVudHMgdG8gZGV0ZXJtaW5lIHRoaXMgYW5hbHl0aWNhbGx5ISAob25seSBpbXBsZW1lbnRlZCBmb3IgTGluZSByaWdodCBub3csIHNob3VsZCBiZSBlYXN5IHRvIGRvIHdpdGggc29tZSB0aGluZ3MpXHJcbiAgICByZXR1cm4gU2VnbWVudC5jbG9zZXN0VG9Qb2ludCggWyB0aGlzIF0sIHBvaW50LCAxZS03ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBMaXN0IG9mIHJlc3VsdHMgKHNpbmNlIHRoZXJlIGNhbiBiZSBkdXBsaWNhdGVzKSwgdGhyZXNob2xkIGlzIHVzZWQgZm9yIHN1YmRpdmlzaW9uLFxyXG4gICAqIHdoZXJlIGl0IHdpbGwgZXhpdCBpZiBhbGwgb2YgdGhlIHNlZ21lbnRzIGFyZSBzaG9ydGVyIHRoYW4gdGhlIHRocmVzaG9sZFxyXG4gICAqXHJcbiAgICogVE9ETzogc29sdmUgc2VnbWVudHMgdG8gZGV0ZXJtaW5lIHRoaXMgYW5hbHl0aWNhbGx5IVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY2xvc2VzdFRvUG9pbnQoIHNlZ21lbnRzOiBTZWdtZW50W10sIHBvaW50OiBWZWN0b3IyLCB0aHJlc2hvbGQ6IG51bWJlciApOiBDbG9zZXN0VG9Qb2ludFJlc3VsdFtdIHtcclxuICAgIHR5cGUgSXRlbSA9IHtcclxuICAgICAgdGE6IG51bWJlcjtcclxuICAgICAgdGI6IG51bWJlcjtcclxuICAgICAgcGE6IFZlY3RvcjI7XHJcbiAgICAgIHBiOiBWZWN0b3IyO1xyXG4gICAgICBzZWdtZW50OiBTZWdtZW50O1xyXG4gICAgICBib3VuZHM6IEJvdW5kczI7XHJcbiAgICAgIG1pbjogbnVtYmVyO1xyXG4gICAgICBtYXg6IG51bWJlcjtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgdGhyZXNob2xkU3F1YXJlZCA9IHRocmVzaG9sZCAqIHRocmVzaG9sZDtcclxuICAgIGxldCBpdGVtczogSXRlbVtdID0gW107XHJcbiAgICBsZXQgYmVzdExpc3Q6IENsb3Nlc3RUb1BvaW50UmVzdWx0W10gPSBbXTtcclxuICAgIGxldCBiZXN0RGlzdGFuY2VTcXVhcmVkID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgbGV0IHRocmVzaG9sZE9rID0gZmFsc2U7XHJcblxyXG4gICAgXy5lYWNoKCBzZWdtZW50cywgKCBzZWdtZW50OiBTZWdtZW50ICkgPT4ge1xyXG4gICAgICAvLyBpZiB3ZSBoYXZlIGFuIGV4cGxpY2l0IGNvbXB1dGF0aW9uIGZvciB0aGlzIHNlZ21lbnQsIHVzZSBpdFxyXG4gICAgICBpZiAoIHNlZ21lbnQgaW5zdGFuY2VvZiBMaW5lICkge1xyXG4gICAgICAgIGNvbnN0IGluZm9zID0gc2VnbWVudC5leHBsaWNpdENsb3Nlc3RUb1BvaW50KCBwb2ludCApO1xyXG4gICAgICAgIF8uZWFjaCggaW5mb3MsIGluZm8gPT4ge1xyXG4gICAgICAgICAgaWYgKCBpbmZvLmRpc3RhbmNlU3F1YXJlZCA8IGJlc3REaXN0YW5jZVNxdWFyZWQgKSB7XHJcbiAgICAgICAgICAgIGJlc3RMaXN0ID0gWyBpbmZvIF07XHJcbiAgICAgICAgICAgIGJlc3REaXN0YW5jZVNxdWFyZWQgPSBpbmZvLmRpc3RhbmNlU3F1YXJlZDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCBpbmZvLmRpc3RhbmNlU3F1YXJlZCA9PT0gYmVzdERpc3RhbmNlU3F1YXJlZCApIHtcclxuICAgICAgICAgICAgYmVzdExpc3QucHVzaCggaW5mbyApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBvdGhlcndpc2UsIHdlIHdpbGwgc3BsaXQgYmFzZWQgb24gbW9ub3RvbmljaXR5LCBzbyB3ZSBjYW4gc3ViZGl2aWRlXHJcbiAgICAgICAgLy8gc2VwYXJhdGUsIHNvIHdlIGNhbiBtYXAgdGhlIHN1YmRpdmlkZWQgc2VnbWVudHNcclxuICAgICAgICBjb25zdCB0cyA9IFsgMCBdLmNvbmNhdCggc2VnbWVudC5nZXRJbnRlcmlvckV4dHJlbWFUcygpICkuY29uY2F0KCBbIDEgXSApO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRzLmxlbmd0aCAtIDE7IGkrKyApIHtcclxuICAgICAgICAgIGNvbnN0IHRhID0gdHNbIGkgXTtcclxuICAgICAgICAgIGNvbnN0IHRiID0gdHNbIGkgKyAxIF07XHJcbiAgICAgICAgICBjb25zdCBwYSA9IHNlZ21lbnQucG9zaXRpb25BdCggdGEgKTtcclxuICAgICAgICAgIGNvbnN0IHBiID0gc2VnbWVudC5wb3NpdGlvbkF0KCB0YiApO1xyXG4gICAgICAgICAgY29uc3QgYm91bmRzID0gQm91bmRzMi5wb2ludCggcGEgKS5hZGRQb2ludCggcGIgKTtcclxuICAgICAgICAgIGNvbnN0IG1pbkRpc3RhbmNlU3F1YXJlZCA9IGJvdW5kcy5taW5pbXVtRGlzdGFuY2VUb1BvaW50U3F1YXJlZCggcG9pbnQgKTtcclxuICAgICAgICAgIGlmICggbWluRGlzdGFuY2VTcXVhcmVkIDw9IGJlc3REaXN0YW5jZVNxdWFyZWQgKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1heERpc3RhbmNlU3F1YXJlZCA9IGJvdW5kcy5tYXhpbXVtRGlzdGFuY2VUb1BvaW50U3F1YXJlZCggcG9pbnQgKTtcclxuICAgICAgICAgICAgaWYgKCBtYXhEaXN0YW5jZVNxdWFyZWQgPCBiZXN0RGlzdGFuY2VTcXVhcmVkICkge1xyXG4gICAgICAgICAgICAgIGJlc3REaXN0YW5jZVNxdWFyZWQgPSBtYXhEaXN0YW5jZVNxdWFyZWQ7XHJcbiAgICAgICAgICAgICAgYmVzdExpc3QgPSBbXTsgLy8gY2xlYXIgaXRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpdGVtcy5wdXNoKCB7XHJcbiAgICAgICAgICAgICAgdGE6IHRhLFxyXG4gICAgICAgICAgICAgIHRiOiB0YixcclxuICAgICAgICAgICAgICBwYTogcGEsXHJcbiAgICAgICAgICAgICAgcGI6IHBiLFxyXG4gICAgICAgICAgICAgIHNlZ21lbnQ6IHNlZ21lbnQsXHJcbiAgICAgICAgICAgICAgYm91bmRzOiBib3VuZHMsXHJcbiAgICAgICAgICAgICAgbWluOiBtaW5EaXN0YW5jZVNxdWFyZWQsXHJcbiAgICAgICAgICAgICAgbWF4OiBtYXhEaXN0YW5jZVNxdWFyZWRcclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHdoaWxlICggaXRlbXMubGVuZ3RoICYmICF0aHJlc2hvbGRPayApIHtcclxuICAgICAgY29uc3QgY3VySXRlbXMgPSBpdGVtcztcclxuICAgICAgaXRlbXMgPSBbXTtcclxuXHJcbiAgICAgIC8vIHdoZXRoZXIgYWxsIG9mIHRoZSBzZWdtZW50cyBwcm9jZXNzZWQgYXJlIHNob3J0ZXIgdGhhbiB0aGUgdGhyZXNob2xkXHJcbiAgICAgIHRocmVzaG9sZE9rID0gdHJ1ZTtcclxuXHJcbiAgICAgIGZvciAoIGNvbnN0IGl0ZW0gb2YgY3VySXRlbXMgKSB7XHJcbiAgICAgICAgaWYgKCBpdGVtLm1pbiA+IGJlc3REaXN0YW5jZVNxdWFyZWQgKSB7XHJcbiAgICAgICAgICBjb250aW51ZTsgLy8gZHJvcCB0aGlzIGl0ZW1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCB0aHJlc2hvbGRPayAmJiBpdGVtLnBhLmRpc3RhbmNlU3F1YXJlZCggaXRlbS5wYiApID4gdGhyZXNob2xkU3F1YXJlZCApIHtcclxuICAgICAgICAgIHRocmVzaG9sZE9rID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRtaWQgPSAoIGl0ZW0udGEgKyBpdGVtLnRiICkgLyAyO1xyXG4gICAgICAgIGNvbnN0IHBtaWQgPSBpdGVtLnNlZ21lbnQucG9zaXRpb25BdCggdG1pZCApO1xyXG4gICAgICAgIGNvbnN0IGJvdW5kc0EgPSBCb3VuZHMyLnBvaW50KCBpdGVtLnBhICkuYWRkUG9pbnQoIHBtaWQgKTtcclxuICAgICAgICBjb25zdCBib3VuZHNCID0gQm91bmRzMi5wb2ludCggaXRlbS5wYiApLmFkZFBvaW50KCBwbWlkICk7XHJcbiAgICAgICAgY29uc3QgbWluQSA9IGJvdW5kc0EubWluaW11bURpc3RhbmNlVG9Qb2ludFNxdWFyZWQoIHBvaW50ICk7XHJcbiAgICAgICAgY29uc3QgbWluQiA9IGJvdW5kc0IubWluaW11bURpc3RhbmNlVG9Qb2ludFNxdWFyZWQoIHBvaW50ICk7XHJcbiAgICAgICAgaWYgKCBtaW5BIDw9IGJlc3REaXN0YW5jZVNxdWFyZWQgKSB7XHJcbiAgICAgICAgICBjb25zdCBtYXhBID0gYm91bmRzQS5tYXhpbXVtRGlzdGFuY2VUb1BvaW50U3F1YXJlZCggcG9pbnQgKTtcclxuICAgICAgICAgIGlmICggbWF4QSA8IGJlc3REaXN0YW5jZVNxdWFyZWQgKSB7XHJcbiAgICAgICAgICAgIGJlc3REaXN0YW5jZVNxdWFyZWQgPSBtYXhBO1xyXG4gICAgICAgICAgICBiZXN0TGlzdCA9IFtdOyAvLyBjbGVhciBpdFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaXRlbXMucHVzaCgge1xyXG4gICAgICAgICAgICB0YTogaXRlbS50YSxcclxuICAgICAgICAgICAgdGI6IHRtaWQsXHJcbiAgICAgICAgICAgIHBhOiBpdGVtLnBhLFxyXG4gICAgICAgICAgICBwYjogcG1pZCxcclxuICAgICAgICAgICAgc2VnbWVudDogaXRlbS5zZWdtZW50LFxyXG4gICAgICAgICAgICBib3VuZHM6IGJvdW5kc0EsXHJcbiAgICAgICAgICAgIG1pbjogbWluQSxcclxuICAgICAgICAgICAgbWF4OiBtYXhBXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggbWluQiA8PSBiZXN0RGlzdGFuY2VTcXVhcmVkICkge1xyXG4gICAgICAgICAgY29uc3QgbWF4QiA9IGJvdW5kc0IubWF4aW11bURpc3RhbmNlVG9Qb2ludFNxdWFyZWQoIHBvaW50ICk7XHJcbiAgICAgICAgICBpZiAoIG1heEIgPCBiZXN0RGlzdGFuY2VTcXVhcmVkICkge1xyXG4gICAgICAgICAgICBiZXN0RGlzdGFuY2VTcXVhcmVkID0gbWF4QjtcclxuICAgICAgICAgICAgYmVzdExpc3QgPSBbXTsgLy8gY2xlYXIgaXRcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGl0ZW1zLnB1c2goIHtcclxuICAgICAgICAgICAgdGE6IHRtaWQsXHJcbiAgICAgICAgICAgIHRiOiBpdGVtLnRiLFxyXG4gICAgICAgICAgICBwYTogcG1pZCxcclxuICAgICAgICAgICAgcGI6IGl0ZW0ucGIsXHJcbiAgICAgICAgICAgIHNlZ21lbnQ6IGl0ZW0uc2VnbWVudCxcclxuICAgICAgICAgICAgYm91bmRzOiBib3VuZHNCLFxyXG4gICAgICAgICAgICBtaW46IG1pbkIsXHJcbiAgICAgICAgICAgIG1heDogbWF4QlxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHRoZXJlIGFyZSBhbnkgY2xvc2VzdCByZWdpb25zLCB0aGV5IGFyZSB3aXRoaW4gdGhlIHRocmVzaG9sZCwgc28gd2Ugd2lsbCBhZGQgdGhlbSBhbGxcclxuICAgIF8uZWFjaCggaXRlbXMsIGl0ZW0gPT4ge1xyXG4gICAgICBjb25zdCB0ID0gKCBpdGVtLnRhICsgaXRlbS50YiApIC8gMjtcclxuICAgICAgY29uc3QgY2xvc2VzdFBvaW50ID0gaXRlbS5zZWdtZW50LnBvc2l0aW9uQXQoIHQgKTtcclxuICAgICAgYmVzdExpc3QucHVzaCgge1xyXG4gICAgICAgIHNlZ21lbnQ6IGl0ZW0uc2VnbWVudCxcclxuICAgICAgICB0OiB0LFxyXG4gICAgICAgIGNsb3Nlc3RQb2ludDogY2xvc2VzdFBvaW50LFxyXG4gICAgICAgIGRpc3RhbmNlU3F1YXJlZDogcG9pbnQuZGlzdGFuY2VTcXVhcmVkKCBjbG9zZXN0UG9pbnQgKVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIGJlc3RMaXN0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gdGhlIGN1YmljLXByZW11bHRpcGxpZWQgdmFsdWVzIGZvciB0d28gY3ViaWMgYmV6aWVyIGN1cnZlcywgZGV0ZXJtaW5lcyAoaWYgYXZhaWxhYmxlKSBhIHNwZWNpZmllZCAoYSxiKSBwYWlyXHJcbiAgICogc3VjaCB0aGF0IHAoIHQgKSA9PT0gcSggYSAqIHQgKyBiICkuXHJcbiAgICpcclxuICAgKiBHaXZlbiBhIDEtZGltZW5zaW9uYWwgY3ViaWMgYmV6aWVyIGRldGVybWluZWQgYnkgdGhlIGNvbnRyb2wgcG9pbnRzIHAwLCBwMSwgcDIgYW5kIHAzLCBjb21wdXRlOlxyXG4gICAqXHJcbiAgICogWyBwMHMgXSAgICBbICAxICAgMCAgIDAgICAwIF0gICBbIHAwIF1cclxuICAgKiBbIHAxcyBdID09IFsgLTMgICAzICAgMCAgIDAgXSAqIFsgcDEgXVxyXG4gICAqIFsgcDJzIF0gPT0gWyAgMyAgLTYgICAzICAgMCBdICogWyBwMiBdXHJcbiAgICogWyBwM3MgXSAgICBbIC0xICAgMyAgLTMgICAxIF0gICBbIHAzIF1cclxuICAgKlxyXG4gICAqIHNlZSBDdWJpYy5nZXRPdmVybGFwcyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHBvbHlub21pYWxHZXRPdmVybGFwQ3ViaWMoIHAwczogbnVtYmVyLCBwMXM6IG51bWJlciwgcDJzOiBudW1iZXIsIHAzczogbnVtYmVyLCBxMHM6IG51bWJlciwgcTFzOiBudW1iZXIsIHEyczogbnVtYmVyLCBxM3M6IG51bWJlciApOiBQb3NzaWJsZVNpbXBsZU92ZXJsYXAge1xyXG4gICAgaWYgKCBxM3MgPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiBTZWdtZW50LnBvbHlub21pYWxHZXRPdmVybGFwUXVhZHJhdGljKCBwMHMsIHAxcywgcDJzLCBxMHMsIHExcywgcTJzICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYSA9IE1hdGguc2lnbiggcDNzIC8gcTNzICkgKiBNYXRoLnBvdyggTWF0aC5hYnMoIHAzcyAvIHEzcyApLCAxIC8gMyApO1xyXG4gICAgaWYgKCBhID09PSAwICkge1xyXG4gICAgICByZXR1cm4gbnVsbDsgLy8gSWYgdGhlcmUgd291bGQgYmUgc29sdXRpb25zLCB0aGVuIHEzcyB3b3VsZCBoYXZlIGJlZW4gbm9uLXplcm9cclxuICAgIH1cclxuICAgIGNvbnN0IGIgPSAoIHAycyAtIGEgKiBhICogcTJzICkgLyAoIDMgKiBhICogYSAqIHEzcyApO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYTogYSxcclxuICAgICAgYjogYlxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIHRoZSBxdWFkcmF0aWMtcHJlbXVsdGlwbGllZCB2YWx1ZXMgZm9yIHR3byBxdWFkcmF0aWMgYmV6aWVyIGN1cnZlcywgZGV0ZXJtaW5lcyAoaWYgYXZhaWxhYmxlKSBhIHNwZWNpZmllZCAoYSxiKSBwYWlyXHJcbiAgICogc3VjaCB0aGF0IHAoIHQgKSA9PT0gcSggYSAqIHQgKyBiICkuXHJcbiAgICpcclxuICAgKiBHaXZlbiBhIDEtZGltZW5zaW9uYWwgcXVhZHJhdGljIGJlemllciBkZXRlcm1pbmVkIGJ5IHRoZSBjb250cm9sIHBvaW50cyBwMCwgcDEsIHAyLCBjb21wdXRlOlxyXG4gICAqXHJcbiAgICogWyBwMHMgXSAgICBbICAxICAgMCAgIDAgXSAgIFsgcDAgXVxyXG4gICAqIFsgcDFzIF0gPT0gWyAtMiAgIDIgICAwIF0gKiBbIHAxIF1cclxuICAgKiBbIHAycyBdICAgIFsgIDIgIC0yICAgMyBdICogWyBwMiBdXHJcbiAgICpcclxuICAgKiBzZWUgUXVhZHJhdGljLmdldE92ZXJsYXBzIGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcG9seW5vbWlhbEdldE92ZXJsYXBRdWFkcmF0aWMoIHAwczogbnVtYmVyLCBwMXM6IG51bWJlciwgcDJzOiBudW1iZXIsIHEwczogbnVtYmVyLCBxMXM6IG51bWJlciwgcTJzOiBudW1iZXIgKTogUG9zc2libGVTaW1wbGVPdmVybGFwIHtcclxuICAgIGlmICggcTJzID09PSAwICkge1xyXG4gICAgICByZXR1cm4gU2VnbWVudC5wb2x5bm9taWFsR2V0T3ZlcmxhcExpbmVhciggcDBzLCBwMXMsIHEwcywgcTFzICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGlzY3IgPSBwMnMgLyBxMnM7XHJcbiAgICBpZiAoIGRpc2NyIDwgMCApIHtcclxuICAgICAgcmV0dXJuIG51bGw7IC8vIG5vdCBwb3NzaWJsZSB0byBoYXZlIGEgc29sdXRpb24gd2l0aCBhbiBpbWFnaW5hcnkgYVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGEgPSBNYXRoLnNxcnQoIHAycyAvIHEycyApO1xyXG4gICAgaWYgKCBhID09PSAwICkge1xyXG4gICAgICByZXR1cm4gbnVsbDsgLy8gSWYgdGhlcmUgd291bGQgYmUgc29sdXRpb25zLCB0aGVuIHEycyB3b3VsZCBoYXZlIGJlZW4gbm9uLXplcm9cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBiID0gKCBwMXMgLSBhICogcTFzICkgLyAoIDIgKiBhICogcTJzICk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBhOiBhLFxyXG4gICAgICBiOiBiXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gdGhlIGxpbmVhci1wcmVtdWx0aXBsaWVkIHZhbHVlcyBmb3IgdHdvIGxpbmVzLCBkZXRlcm1pbmVzIChpZiBhdmFpbGFibGUpIGEgc3BlY2lmaWVkIChhLGIpIHBhaXJcclxuICAgKiBzdWNoIHRoYXQgcCggdCApID09PSBxKCBhICogdCArIGIgKS5cclxuICAgKlxyXG4gICAqIEdpdmVuIGEgbGluZSBkZXRlcm1pbmVkIGJ5IHRoZSBjb250cm9sIHBvaW50cyBwMCwgcDEsIGNvbXB1dGU6XHJcbiAgICpcclxuICAgKiBbIHAwcyBdID09IFsgIDEgICAwIF0gKiBbIHAwIF1cclxuICAgKiBbIHAxcyBdID09IFsgLTEgICAxIF0gKiBbIHAxIF1cclxuICAgKlxyXG4gICAqIHNlZSBRdWFkcmF0aWMvQ3ViaWMuZ2V0T3ZlcmxhcHMgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBwb2x5bm9taWFsR2V0T3ZlcmxhcExpbmVhciggcDBzOiBudW1iZXIsIHAxczogbnVtYmVyLCBxMHM6IG51bWJlciwgcTFzOiBudW1iZXIgKTogUG9zc2libGVTaW1wbGVPdmVybGFwIHtcclxuICAgIGlmICggcTFzID09PSAwICkge1xyXG4gICAgICBpZiAoIHAwcyA9PT0gcTBzICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYSA9IHAxcyAvIHExcztcclxuICAgIGlmICggYSA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYiA9ICggcDBzIC0gcTBzICkgLyBxMXM7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBhOiBhLFxyXG4gICAgICBiOiBiXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbGwgdGhlIGRpc3RpbmN0IChub24tZW5kcG9pbnQsIG5vbi1maW5pdGUpIGludGVyc2VjdGlvbnMgYmV0d2VlbiB0aGUgdHdvIHNlZ21lbnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgaW50ZXJzZWN0KCBhOiBTZWdtZW50LCBiOiBTZWdtZW50ICk6IFNlZ21lbnRJbnRlcnNlY3Rpb25bXSB7XHJcbiAgICBpZiAoIExpbmUgJiYgYSBpbnN0YW5jZW9mIExpbmUgJiYgYiBpbnN0YW5jZW9mIExpbmUgKSB7XHJcbiAgICAgIHJldHVybiBMaW5lLmludGVyc2VjdCggYSwgYiApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIExpbmUgJiYgYSBpbnN0YW5jZW9mIExpbmUgKSB7XHJcbiAgICAgIHJldHVybiBMaW5lLmludGVyc2VjdE90aGVyKCBhLCBiICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggTGluZSAmJiBiIGluc3RhbmNlb2YgTGluZSApIHtcclxuICAgICAgLy8gbmVlZCB0byBzd2FwIG91ciBpbnRlcnNlY3Rpb25zLCBzaW5jZSAnYicgaXMgdGhlIGxpbmVcclxuICAgICAgcmV0dXJuIExpbmUuaW50ZXJzZWN0T3RoZXIoIGIsIGEgKS5tYXAoIHN3YXBTZWdtZW50SW50ZXJzZWN0aW9uICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggQXJjICYmIGEgaW5zdGFuY2VvZiBBcmMgJiYgYiBpbnN0YW5jZW9mIEFyYyApIHtcclxuICAgICAgcmV0dXJuIEFyYy5pbnRlcnNlY3QoIGEsIGIgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBFbGxpcHRpY2FsQXJjICYmIGEgaW5zdGFuY2VvZiBFbGxpcHRpY2FsQXJjICYmIGIgaW5zdGFuY2VvZiBFbGxpcHRpY2FsQXJjICkge1xyXG4gICAgICByZXR1cm4gRWxsaXB0aWNhbEFyYy5pbnRlcnNlY3QoIGEsIGIgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gQm91bmRzSW50ZXJzZWN0aW9uLmludGVyc2VjdCggYSwgYiApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIFNlZ21lbnQgZnJvbSB0aGUgc2VyaWFsaXplZCByZXByZXNlbnRhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGRlc2VyaWFsaXplKCBvYmo6IEludGVudGlvbmFsQW55ICk6IFNlZ21lbnQge1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiBuYW1lc3BhY2luZ1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb2JqLnR5cGUgJiYga2l0ZVsgb2JqLnR5cGUgXSAmJiBraXRlWyBvYmoudHlwZSBdLmRlc2VyaWFsaXplICk7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiBuYW1lc3BhY2luZ1xyXG4gICAgcmV0dXJuIGtpdGVbIG9iai50eXBlIF0uZGVzZXJpYWxpemUoIG9iaiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBpZiB0aGUgc3RhcnQvbWlkZGxlL2VuZCBwb2ludHMgYXJlIHJlcHJlc2VudGF0aXZlIG9mIGEgc3VmZmljaWVudGx5IGZsYXQgc2VnbWVudFxyXG4gICAqIChnaXZlbiBjZXJ0YWluIGVwc2lsb24gdmFsdWVzKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXJ0XHJcbiAgICogQHBhcmFtIG1pZGRsZVxyXG4gICAqIEBwYXJhbSBlbmRcclxuICAgKiBAcGFyYW0gZGlzdGFuY2VFcHNpbG9uIC0gY29udHJvbHMgbGV2ZWwgb2Ygc3ViZGl2aXNpb24gYnkgYXR0ZW1wdGluZyB0byBlbnN1cmUgYSBtYXhpbXVtIChzcXVhcmVkKVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZpYXRpb24gZnJvbSB0aGUgY3VydmVcclxuICAgKiBAcGFyYW0gY3VydmVFcHNpbG9uIC0gY29udHJvbHMgbGV2ZWwgb2Ygc3ViZGl2aXNpb24gYnkgYXR0ZW1wdGluZyB0byBlbnN1cmUgYSBtYXhpbXVtIGN1cnZhdHVyZSBjaGFuZ2VcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgYmV0d2VlbiBzZWdtZW50c1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgaXNTdWZmaWNpZW50bHlGbGF0KCBkaXN0YW5jZUVwc2lsb246IG51bWJlciwgY3VydmVFcHNpbG9uOiBudW1iZXIsIHN0YXJ0OiBWZWN0b3IyLCBtaWRkbGU6IFZlY3RvcjIsIGVuZDogVmVjdG9yMiApOiBib29sZWFuIHtcclxuICAgIC8vIGZsYXRuZXNzIGNyaXRlcmlvbjogQT1zdGFydCwgQj1lbmQsIEM9bWlkcG9pbnQsIGQwPWRpc3RhbmNlIGZyb20gQUIsIGQxPXx8Qi1BfHwsIHN1YmRpdmlkZSBpZiBkMC9kMSA+IHNxcnQoZXBzaWxvbilcclxuICAgIGlmICggVXRpbHMuZGlzdFRvU2VnbWVudFNxdWFyZWQoIG1pZGRsZSwgc3RhcnQsIGVuZCApIC8gc3RhcnQuZGlzdGFuY2VTcXVhcmVkKCBlbmQgKSA+IGN1cnZlRXBzaWxvbiApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgLy8gZGV2aWF0aW9uIGNyaXRlcmlvblxyXG4gICAgaWYgKCBVdGlscy5kaXN0VG9TZWdtZW50U3F1YXJlZCggbWlkZGxlLCBzdGFydCwgZW5kICkgPiBkaXN0YW5jZUVwc2lsb24gKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBmaWx0ZXJDbG9zZXN0VG9Qb2ludFJlc3VsdCggcmVzdWx0czogQ2xvc2VzdFRvUG9pbnRSZXN1bHRbXSApOiBDbG9zZXN0VG9Qb2ludFJlc3VsdFtdIHtcclxuICAgIGlmICggcmVzdWx0cy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjbG9zZXN0RGlzdGFuY2VTcXVhcmVkID0gXy5taW5CeSggcmVzdWx0cywgcmVzdWx0ID0+IHJlc3VsdC5kaXN0YW5jZVNxdWFyZWQgKSEuZGlzdGFuY2VTcXVhcmVkO1xyXG5cclxuICAgIC8vIFJldHVybiBhbGwgcmVzdWx0cyB0aGF0IGFyZSB3aXRoaW4gMWUtMTEgb2YgdGhlIGNsb3Nlc3QgZGlzdGFuY2UgKHRvIGFjY291bnQgZm9yIGZsb2F0aW5nIHBvaW50IGVycm9yKSwgYnV0IHVuaXF1ZVxyXG4gICAgLy8gYmFzZWQgb24gdGhlIGxvY2F0aW9uLlxyXG4gICAgcmV0dXJuIF8udW5pcVdpdGgoIHJlc3VsdHMuZmlsdGVyKCByZXN1bHQgPT4gTWF0aC5hYnMoIHJlc3VsdC5kaXN0YW5jZVNxdWFyZWQgLSBjbG9zZXN0RGlzdGFuY2VTcXVhcmVkICkgPCAxZS0xMSApLCAoIGEsIGIgKSA9PiBhLmNsb3Nlc3RQb2ludC5kaXN0YW5jZVNxdWFyZWQoIGIuY2xvc2VzdFBvaW50ICkgPCAxZS0xMSApO1xyXG4gIH1cclxufVxyXG5cclxua2l0ZS5yZWdpc3RlciggJ1NlZ21lbnQnLCBTZWdtZW50ICk7XHJcblxyXG5mdW5jdGlvbiBzd2FwU2VnbWVudEludGVyc2VjdGlvbiggc2VnbWVudEludGVyc2VjdGlvbjogU2VnbWVudEludGVyc2VjdGlvbiApOiBTZWdtZW50SW50ZXJzZWN0aW9uIHtcclxuICByZXR1cm4gc2VnbWVudEludGVyc2VjdGlvbi5nZXRTd2FwcGVkKCk7XHJcbn1cclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFdBQVcsTUFBTSxpQ0FBaUM7QUFDekQsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUdoRCxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBRTVDLE9BQU9DLFNBQVMsTUFBTSxvQ0FBb0M7QUFFMUQsU0FBU0MsR0FBRyxFQUFFQyxrQkFBa0IsRUFBRUMsYUFBYSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBd0NDLEtBQUssRUFBRUMsT0FBTyxRQUFRLGVBQWU7O0FBbUJ4STs7QUEwQ0EsZUFBZSxNQUFlQyxPQUFPLENBQUM7RUFJMUJDLFdBQVdBLENBQUEsRUFBRztJQUN0QixJQUFJLENBQUNDLG1CQUFtQixHQUFHLElBQUliLFdBQVcsQ0FBQyxDQUFDO0VBQzlDOztFQUVBOztFQUdBOztFQUdBO0VBQ0E7RUFHQTtFQUNBO0VBR0E7RUFHQTtFQUNBO0VBR0E7RUFHQTtFQUdBO0VBQ0E7RUFHQTtFQUNBO0VBR0E7RUFHQTtFQUdBO0VBR0E7RUFDQTtFQUdBO0VBR0E7RUFHQTtFQUdBO0VBQ0E7RUFHQTtFQUdBO0VBR0E7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NjLHVCQUF1QkEsQ0FBQSxFQUFZO0lB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