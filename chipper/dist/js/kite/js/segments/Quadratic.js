// Copyright 2013-2022, University of Colorado Boulder

/**
 * Quadratic Bezier segment
 *
 * Good reference: http://cagd.cs.byu.edu/~557/text/ch2.pdf
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Cubic, kite, Line, Overlap, RayIntersection, Segment, svgNumber } from '../imports.js';

// constants
const solveQuadraticRootsReal = Utils.solveQuadraticRootsReal;
const arePointsCollinear = Utils.arePointsCollinear;

// Used in multiple filters
function isBetween0And1(t) {
  return t >= 0 && t <= 1;
}
export default class Quadratic extends Segment {
  // Lazily-computed derived information

  // T where x-derivative is 0 (replaced with NaN if not in range)
  // T where y-derivative is 0 (replaced with NaN if not in range)

  /**
   * @param start - Start point of the quadratic bezier
   * @param control - Control point (curve usually doesn't go through here)
   * @param end - End point of the quadratic bezier
   */
  constructor(start, control, end) {
    super();
    this._start = start;
    this._control = control;
    this._end = end;
    this.invalidate();
  }

  /**
   * Sets the start point of the Quadratic.
   */
  setStart(start) {
    assert && assert(start.isFinite(), `Quadratic start should be finite: ${start.toString()}`);
    if (!this._start.equals(start)) {
      this._start = start;
      this.invalidate();
    }
    return this; // allow chaining
  }

  set start(value) {
    this.setStart(value);
  }
  get start() {
    return this.getStart();
  }

  /**
   * Returns the start of this Quadratic.
   */
  getStart() {
    return this._start;
  }

  /**
   * Sets the control point of the Quadratic.
   */
  setControl(control) {
    assert && assert(control.isFinite(), `Quadratic control should be finite: ${control.toString()}`);
    if (!this._control.equals(control)) {
      this._control = control;
      this.invalidate();
    }
    return this; // allow chaining
  }

  set control(value) {
    this.setControl(value);
  }
  get control() {
    return this.getControl();
  }

  /**
   * Returns the control point of this Quadratic.
   */
  getControl() {
    return this._control;
  }

  /**
   * Sets the end point of the Quadratic.
   */
  setEnd(end) {
    assert && assert(end.isFinite(), `Quadratic end should be finite: ${end.toString()}`);
    if (!this._end.equals(end)) {
      this._end = end;
      this.invalidate();
    }
    return this; // allow chaining
  }

  set end(value) {
    this.setEnd(value);
  }
  get end() {
    return this.getEnd();
  }

  /**
   * Returns the end of this Quadratic.
   */
  getEnd() {
    return this._end;
  }

  /**
   * Returns the position parametrically, with 0 <= t <= 1.
   *
   * NOTE: positionAt( 0 ) will return the start of the segment, and positionAt( 1 ) will return the end of the
   * segment.
   *
   * This method is part of the Segment API. See Segment.js's constructor for more API documentation.
   */
  positionAt(t) {
    assert && assert(t >= 0, 'positionAt t should be non-negative');
    assert && assert(t <= 1, 'positionAt t should be no greater than 1');
    const mt = 1 - t;
    // described from t=[0,1] as: (1-t)^2 start + 2(1-t)t control + t^2 end
    // TODO: allocation reduction
    return this._start.times(mt * mt).plus(this._control.times(2 * mt * t)).plus(this._end.times(t * t));
  }

  /**
   * Returns the non-normalized tangent (dx/dt, dy/dt) of this segment at the parametric value of t, with 0 <= t <= 1.
   *
   * NOTE: tangentAt( 0 ) will return the tangent at the start of the segment, and tangentAt( 1 ) will return the
   * tangent at the end of the segment.
   *
   * This method is part of the Segment API. See Segment.js's constructor for more API documentation.
   */
  tangentAt(t) {
    assert && assert(t >= 0, 'tangentAt t should be non-negative');
    assert && assert(t <= 1, 'tangentAt t should be no greater than 1');

    // For a quadratic curve, the derivative is given by : 2(1-t)( control - start ) + 2t( end - control )
    // TODO: allocation reduction
    return this._control.minus(this._start).times(2 * (1 - t)).plus(this._end.minus(this._control).times(2 * t));
  }

  /**
   * Returns the signed curvature of the segment at the parametric value t, where 0 <= t <= 1.
   *
   * The curvature will be positive for visual clockwise / mathematical counterclockwise curves, negative for opposite
   * curvature, and 0 for no curvature.
   *
   * NOTE: curvatureAt( 0 ) will return the curvature at the start of the segment, and curvatureAt( 1 ) will return
   * the curvature at the end of the segment.
   *
   * This method is part of the Segment API. See Segment.js's constructor for more API documentation.
   */
  curvatureAt(t) {
    assert && assert(t >= 0, 'curvatureAt t should be non-negative');
    assert && assert(t <= 1, 'curvatureAt t should be no greater than 1');

    // see http://cagd.cs.byu.edu/~557/text/ch2.pdf p31
    // TODO: remove code duplication with Cubic
    const epsilon = 0.0000001;
    if (Math.abs(t - 0.5) > 0.5 - epsilon) {
      const isZero = t < 0.5;
      const p0 = isZero ? this._start : this._end;
      const p1 = this._control;
      const p2 = isZero ? this._end : this._start;
      const d10 = p1.minus(p0);
      const a = d10.magnitude;
      const h = (isZero ? -1 : 1) * d10.perpendicular.normalized().dot(p2.minus(p1));
      return h * (this.degree - 1) / (this.degree * a * a);
    } else {
      return this.subdivided(t)[0].curvatureAt(1);
    }
  }

  /**
   * Returns an array with up to 2 sub-segments, split at the parametric t value. Together (in order) they should make
   * up the same shape as the current segment.
   *
   * This method is part of the Segment API. See Segment.js's constructor for more API documentation.
   */
  subdivided(t) {
    assert && assert(t >= 0, 'subdivided t should be non-negative');
    assert && assert(t <= 1, 'subdivided t should be no greater than 1');

    // If t is 0 or 1, we only need to return 1 segment
    if (t === 0 || t === 1) {
      return [this];
    }

    // de Casteljau method
    const leftMid = this._start.blend(this._control, t);
    const rightMid = this._control.blend(this._end, t);
    const mid = leftMid.blend(rightMid, t);
    return [new Quadratic(this._start, leftMid, mid), new Quadratic(mid, rightMid, this._end)];
  }

  /**
   * Clears cached information, should be called when any of the 'constructor arguments' are mutated.
   */
  invalidate() {
    assert && assert(this._start instanceof Vector2, `Quadratic start should be a Vector2: ${this._start}`);
    assert && assert(this._start.isFinite(), `Quadratic start should be finite: ${this._start.toString()}`);
    assert && assert(this._control instanceof Vector2, `Quadratic control should be a Vector2: ${this._control}`);
    assert && assert(this._control.isFinite(), `Quadratic control should be finite: ${this._control.toString()}`);
    assert && assert(this._end instanceof Vector2, `Quadratic end should be a Vector2: ${this._end}`);
    assert && assert(this._end.isFinite(), `Quadratic end should be finite: ${this._end.toString()}`);

    // Lazily-computed derived information
    this._startTangent = null;
    this._endTangent = null;
    this._tCriticalX = null;
    this._tCriticalY = null;
    this._bounds = null;
    this._svgPathFragment = null;
    this.invalidationEmitter.emit();
  }

  /**
   * Returns the tangent vector (normalized) to the segment at the start, pointing in the direction of motion (from start to end)
   */
  getStartTangent() {
    if (this._startTangent === null) {
      const controlIsStart = this._start.equals(this._control);
      // TODO: allocation reduction
      this._startTangent = controlIsStart ? this._end.minus(this._start).normalized() : this._control.minus(this._start).normalized();
    }
    return this._startTangent;
  }
  get startTangent() {
    return this.getStartTangent();
  }

  /**
   * Returns the tangent vector (normalized) to the segment at the end, pointing in the direction of motion (from start to end)
   */
  getEndTangent() {
    if (this._endTangent === null) {
      const controlIsEnd = this._end.equals(this._control);
      // TODO: allocation reduction
      this._endTangent = controlIsEnd ? this._end.minus(this._start).normalized() : this._end.minus(this._control).normalized();
    }
    return this._endTangent;
  }
  get endTangent() {
    return this.getEndTangent();
  }
  getTCriticalX() {
    // compute x where the derivative is 0 (used for bounds and other things)
    if (this._tCriticalX === null) {
      this._tCriticalX = Quadratic.extremaT(this._start.x, this._control.x, this._end.x);
    }
    return this._tCriticalX;
  }
  get tCriticalX() {
    return this.getTCriticalX();
  }
  getTCriticalY() {
    // compute y where the derivative is 0 (used for bounds and other things)
    if (this._tCriticalY === null) {
      this._tCriticalY = Quadratic.extremaT(this._start.y, this._control.y, this._end.y);
    }
    return this._tCriticalY;
  }
  get tCriticalY() {
    return this.getTCriticalY();
  }

  /**
   * Returns a list of non-degenerate segments that are equivalent to this segment. Generally gets rid (or simplifies)
   * invalid or repeated segments.
   */
  getNondegenerateSegments() {
    const start = this._start;
    const control = this._control;
    const end = this._end;
    const startIsEnd = start.equals(end);
    const startIsControl = start.equals(control);
    const endIsControl = start.equals(control);
    if (startIsEnd && startIsControl) {
      // all same points
      return [];
    } else if (startIsEnd) {
      // this is a special collinear case, we basically line out to the farthest point and back
      const halfPoint = this.positionAt(0.5);
      return [new Line(start, halfPoint), new Line(halfPoint, end)];
    } else if (arePointsCollinear(start, control, end)) {
      // if they are collinear, we can reduce to start->control and control->end, or if control is between, just one line segment
      // also, start !== end (handled earlier)
      if (startIsControl || endIsControl) {
        // just a line segment!
        return [new Line(start, end)]; // no extra nondegenerate check since start !== end
      }
      // now control point must be unique. we check to see if our rendered path will be outside of the start->end line segment
      const delta = end.minus(start);
      const p1d = control.minus(start).dot(delta.normalized()) / delta.magnitude;
      const t = Quadratic.extremaT(0, p1d, 1);
      if (!isNaN(t) && t > 0 && t < 1) {
        // we have a local max inside the range, indicating that our extrema point is outside of start->end
        // we'll line to and from it
        const pt = this.positionAt(t);
        return _.flatten([new Line(start, pt).getNondegenerateSegments(), new Line(pt, end).getNondegenerateSegments()]);
      } else {
        // just provide a line segment, our rendered path doesn't go outside of this
        return [new Line(start, end)]; // no extra nondegenerate check since start !== end
      }
    } else {
      return [this];
    }
  }

  /**
   * Returns the bounds of this segment.
   */
  getBounds() {
    // calculate our temporary guaranteed lower bounds based on the end points
    if (this._bounds === null) {
      this._bounds = new Bounds2(Math.min(this._start.x, this._end.x), Math.min(this._start.y, this._end.y), Math.max(this._start.x, this._end.x), Math.max(this._start.y, this._end.y));

      // compute x and y where the derivative is 0, so we can include this in the bounds
      const tCriticalX = this.getTCriticalX();
      const tCriticalY = this.getTCriticalY();
      if (!isNaN(tCriticalX) && tCriticalX > 0 && tCriticalX < 1) {
        this._bounds = this._bounds.withPoint(this.positionAt(tCriticalX));
      }
      if (!isNaN(tCriticalY) && tCriticalY > 0 && tCriticalY < 1) {
        this._bounds = this._bounds.withPoint(this.positionAt(tCriticalY));
      }
    }
    return this._bounds;
  }
  get bounds() {
    return this.getBounds();
  }

  // see http://www.visgraf.impa.br/sibgrapi96/trabs/pdf/a14.pdf
  // and http://math.stackexchange.com/questions/12186/arc-length-of-bezier-curves for curvature / arc length

  /**
   * Returns an array of quadratic that are offset to this quadratic by a distance r
   *
   * @param r - distance
   * @param reverse
   */
  offsetTo(r, reverse) {
    // TODO: implement more accurate method at http://www.antigrain.com/research/adaptive_bezier/index.html
    // TODO: or more recently (and relevantly): http://www.cis.usouthal.edu/~hain/general/Publications/Bezier/BezierFlattening.pdf
    let curves = [this];

    // subdivide this curve
    const depth = 5; // generates 2^depth curves
    for (let i = 0; i < depth; i++) {
      curves = _.flatten(_.map(curves, curve => curve.subdivided(0.5)));
    }
    let offsetCurves = _.map(curves, curve => curve.approximateOffset(r));
    if (reverse) {
      offsetCurves.reverse();
      offsetCurves = _.map(offsetCurves, curve => curve.reversed());
    }
    return offsetCurves;
  }

  /**
   * Elevation of this quadratic Bezier curve to a cubic Bezier curve
   */
  degreeElevated() {
    // TODO: allocation reduction
    return new Cubic(this._start, this._start.plus(this._control.timesScalar(2)).dividedScalar(3), this._end.plus(this._control.timesScalar(2)).dividedScalar(3), this._end);
  }

  /**
   * @param r - distance
   */
  approximateOffset(r) {
    return new Quadratic(this._start.plus((this._start.equals(this._control) ? this._end.minus(this._start) : this._control.minus(this._start)).perpendicular.normalized().times(r)), this._control.plus(this._end.minus(this._start).perpendicular.normalized().times(r)), this._end.plus((this._end.equals(this._control) ? this._end.minus(this._start) : this._end.minus(this._control)).perpendicular.normalized().times(r)));
  }

  /**
   * Returns a string containing the SVG path. assumes that the start point is already provided, so anything that calls this needs to put the M calls first
   */
  getSVGPathFragment() {
    let oldPathFragment;
    if (assert) {
      oldPathFragment = this._svgPathFragment;
      this._svgPathFragment = null;
    }
    if (!this._svgPathFragment) {
      this._svgPathFragment = `Q ${svgNumber(this._control.x)} ${svgNumber(this._control.y)} ${svgNumber(this._end.x)} ${svgNumber(this._end.y)}`;
    }
    if (assert) {
      if (oldPathFragment) {
        assert(oldPathFragment === this._svgPathFragment, 'Quadratic line segment changed without invalidate()');
      }
    }
    return this._svgPathFragment;
  }

  /**
   * Returns an array of lines that will draw an offset curve on the logical left side
   */
  strokeLeft(lineWidth) {
    return this.offsetTo(-lineWidth / 2, false);
  }

  /**
   * Returns an array of lines that will draw an offset curve on the logical right side
   */
  strokeRight(lineWidth) {
    return this.offsetTo(lineWidth / 2, true);
  }
  getInteriorExtremaTs() {
    // TODO: we assume here we are reduce, so that a criticalX doesn't equal a criticalY?
    const result = [];
    const epsilon = 0.0000000001; // TODO: general kite epsilon?

    const criticalX = this.getTCriticalX();
    const criticalY = this.getTCriticalY();
    if (!isNaN(criticalX) && criticalX > epsilon && criticalX < 1 - epsilon) {
      result.push(this.tCriticalX);
    }
    if (!isNaN(criticalY) && criticalY > epsilon && criticalY < 1 - epsilon) {
      result.push(this.tCriticalY);
    }
    return result.sort();
  }

  /**
   * Hit-tests this segment with the ray. An array of all intersections of the ray with this segment will be returned.
   * For details, see the documentation in Segment.js
   */
  intersection(ray) {
    const result = [];

    // find the rotation that will put our ray in the direction of the x-axis so we can only solve for y=0 for intersections
    const inverseMatrix = Matrix3.rotation2(-ray.direction.angle).timesMatrix(Matrix3.translation(-ray.position.x, -ray.position.y));
    const p0 = inverseMatrix.timesVector2(this._start);
    const p1 = inverseMatrix.timesVector2(this._control);
    const p2 = inverseMatrix.timesVector2(this._end);

    //(1-t)^2 start + 2(1-t)t control + t^2 end
    const a = p0.y - 2 * p1.y + p2.y;
    const b = -2 * p0.y + 2 * p1.y;
    const c = p0.y;
    const ts = solveQuadraticRootsReal(a, b, c);
    _.each(ts, t => {
      if (t >= 0 && t <= 1) {
        const hitPoint = this.positionAt(t);
        const unitTangent = this.tangentAt(t).normalized();
        const perp = unitTangent.perpendicular;
        const toHit = hitPoint.minus(ray.position);

        // make sure it's not behind the ray
        if (toHit.dot(ray.direction) > 0) {
          const normal = perp.dot(ray.direction) > 0 ? perp.negated() : perp;
          const wind = ray.direction.perpendicular.dot(unitTangent) < 0 ? 1 : -1;
          result.push(new RayIntersection(toHit.magnitude, hitPoint, normal, wind, t));
        }
      }
    });
    return result;
  }

  /**
   * Returns the winding number for intersection with a ray
   */
  windingIntersection(ray) {
    let wind = 0;
    const hits = this.intersection(ray);
    _.each(hits, hit => {
      wind += hit.wind;
    });
    return wind;
  }

  /**
   * Draws the segment to the 2D Canvas context, assuming the context's current location is already at the start point
   */
  writeToContext(context) {
    context.quadraticCurveTo(this._control.x, this._control.y, this._end.x, this._end.y);
  }

  /**
   * Returns a new quadratic that represents this quadratic after transformation by the matrix
   */
  transformed(matrix) {
    return new Quadratic(matrix.timesVector2(this._start), matrix.timesVector2(this._control), matrix.timesVector2(this._end));
  }

  /**
   * Returns the contribution to the signed area computed using Green's Theorem, with P=-y/2 and Q=x/2.
   *
   * NOTE: This is this segment's contribution to the line integral (-y/2 dx + x/2 dy).
   */
  getSignedAreaFragment() {
    return 1 / 6 * (this._start.x * (2 * this._control.y + this._end.y) + this._control.x * (-2 * this._start.y + 2 * this._end.y) + this._end.x * (-this._start.y - 2 * this._control.y));
  }

  /**
   * Given the current curve parameterized by t, will return a curve parameterized by x where t = a * x + b
   */
  reparameterized(a, b) {
    // to the polynomial pt^2 + qt + r:
    const p = this._start.plus(this._end.plus(this._control.timesScalar(-2)));
    const q = this._control.minus(this._start).timesScalar(2);
    const r = this._start;

    // to the polynomial alpha*x^2 + beta*x + gamma:
    const alpha = p.timesScalar(a * a);
    const beta = p.timesScalar(a * b).timesScalar(2).plus(q.timesScalar(a));
    const gamma = p.timesScalar(b * b).plus(q.timesScalar(b)).plus(r);

    // back to the form start,control,end
    return new Quadratic(gamma, beta.timesScalar(0.5).plus(gamma), alpha.plus(beta).plus(gamma));
  }

  /**
   * Returns a reversed copy of this segment (mapping the parametrization from [0,1] => [1,0]).
   */
  reversed() {
    return new Quadratic(this._end, this._control, this._start);
  }

  /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   */
  serialize() {
    return {
      type: 'Quadratic',
      startX: this._start.x,
      startY: this._start.y,
      controlX: this._control.x,
      controlY: this._control.y,
      endX: this._end.x,
      endY: this._end.y
    };
  }

  /**
   * Determine whether two lines overlap over a continuous section, and if so finds the a,b pair such that
   * p( t ) === q( a * t + b ).
   *
   * @param segment
   * @param [epsilon] - Will return overlaps only if no two corresponding points differ by this amount or more in one component.
   * @returns - The solution, if there is one (and only one)
   */
  getOverlaps(segment, epsilon = 1e-6) {
    if (segment instanceof Quadratic) {
      return Quadratic.getOverlaps(this, segment);
    }
    return null;
  }

  /**
   * Returns a Quadratic from the serialized representation.
   */
  static deserialize(obj) {
    assert && assert(obj.type === 'Quadratic');
    return new Quadratic(new Vector2(obj.startX, obj.startY), new Vector2(obj.controlX, obj.controlY), new Vector2(obj.endX, obj.endY));
  }

  /**
   * One-dimensional solution to extrema
   */
  static extremaT(start, control, end) {
    // compute t where the derivative is 0 (used for bounds and other things)
    const divisorX = 2 * (end - 2 * control + start);
    if (divisorX !== 0) {
      return -2 * (control - start) / divisorX;
    } else {
      return NaN;
    }
  }

  /**
   * Determine whether two Quadratics overlap over a continuous section, and if so finds the a,b pair such that
   * p( t ) === q( a * t + b ).
   *
   * NOTE: for this particular function, we assume we're not degenerate. Things may work if we can be degree-reduced
   * to a quadratic, but generally that shouldn't be done.
   *
   * @param quadratic1
   * @param quadratic2
   * @param [epsilon] - Will return overlaps only if no two corresponding points differ by this amount or more
   *                             in one component.
   * @returns - The solution, if there is one (and only one)
   */
  static getOverlaps(quadratic1, quadratic2, epsilon = 1e-6) {
    /*
     * NOTE: For implementation details in this function, please see Cubic.getOverlaps. It goes over all of the
     * same implementation details, but instead our bezier matrix is a 3x3:
     *
     * [  1  0  0 ]
     * [ -2  2  0 ]
     * [  1 -2  1 ]
     *
     * And we use the upper-left section of (at+b) adjustment matrix relevant for the quadratic.
     */

    const noOverlap = [];

    // Efficiently compute the multiplication of the bezier matrix:
    const p0x = quadratic1._start.x;
    const p1x = -2 * quadratic1._start.x + 2 * quadratic1._control.x;
    const p2x = quadratic1._start.x - 2 * quadratic1._control.x + quadratic1._end.x;
    const p0y = quadratic1._start.y;
    const p1y = -2 * quadratic1._start.y + 2 * quadratic1._control.y;
    const p2y = quadratic1._start.y - 2 * quadratic1._control.y + quadratic1._end.y;
    const q0x = quadratic2._start.x;
    const q1x = -2 * quadratic2._start.x + 2 * quadratic2._control.x;
    const q2x = quadratic2._start.x - 2 * quadratic2._control.x + quadratic2._end.x;
    const q0y = quadratic2._start.y;
    const q1y = -2 * quadratic2._start.y + 2 * quadratic2._control.y;
    const q2y = quadratic2._start.y - 2 * quadratic2._control.y + quadratic2._end.y;

    // Determine the candidate overlap (preferring the dimension with the largest variation)
    const xSpread = Math.abs(Math.max(quadratic1._start.x, quadratic1._control.x, quadratic1._end.x, quadratic2._start.x, quadratic2._control.x, quadratic2._end.x) - Math.min(quadratic1._start.x, quadratic1._control.x, quadratic1._end.x, quadratic2._start.x, quadratic2._control.x, quadratic2._end.x));
    const ySpread = Math.abs(Math.max(quadratic1._start.y, quadratic1._control.y, quadratic1._end.y, quadratic2._start.y, quadratic2._control.y, quadratic2._end.y) - Math.min(quadratic1._start.y, quadratic1._control.y, quadratic1._end.y, quadratic2._start.y, quadratic2._control.y, quadratic2._end.y));
    const xOverlap = Segment.polynomialGetOverlapQuadratic(p0x, p1x, p2x, q0x, q1x, q2x);
    const yOverlap = Segment.polynomialGetOverlapQuadratic(p0y, p1y, p2y, q0y, q1y, q2y);
    let overlap;
    if (xSpread > ySpread) {
      overlap = xOverlap === null || xOverlap === true ? yOverlap : xOverlap;
    } else {
      overlap = yOverlap === null || yOverlap === true ? xOverlap : yOverlap;
    }
    if (overlap === null || overlap === true) {
      return noOverlap; // No way to pin down an overlap
    }

    const a = overlap.a;
    const b = overlap.b;
    const aa = a * a;
    const bb = b * b;
    const ab2 = 2 * a * b;

    // Compute quadratic coefficients for the difference between p(t) and q(a*t+b)
    const d0x = q0x + b * q1x + bb * q2x - p0x;
    const d1x = a * q1x + ab2 * q2x - p1x;
    const d2x = aa * q2x - p2x;
    const d0y = q0y + b * q1y + bb * q2y - p0y;
    const d1y = a * q1y + ab2 * q2y - p1y;
    const d2y = aa * q2y - p2y;

    // Find the t values where extremes lie in the [0,1] range for each 1-dimensional quadratic. We do this by
    // differentiating the quadratic and finding the roots of the resulting line.
    const xRoots = Utils.solveLinearRootsReal(2 * d2x, d1x);
    const yRoots = Utils.solveLinearRootsReal(2 * d2y, d1y);
    const xExtremeTs = _.uniq([0, 1].concat(xRoots ? xRoots.filter(isBetween0And1) : []));
    const yExtremeTs = _.uniq([0, 1].concat(yRoots ? yRoots.filter(isBetween0And1) : []));

    // Examine the single-coordinate distances between the "overlaps" at each extreme T value. If the distance is larger
    // than our epsilon, then the "overlap" would not be valid.
    for (let i = 0; i < xExtremeTs.length; i++) {
      const t = xExtremeTs[i];
      if (Math.abs((d2x * t + d1x) * t + d0x) > epsilon) {
        return noOverlap;
      }
    }
    for (let i = 0; i < yExtremeTs.length; i++) {
      const t = yExtremeTs[i];
      if (Math.abs((d2y * t + d1y) * t + d0y) > epsilon) {
        return noOverlap;
      }
    }
    const qt0 = b;
    const qt1 = a + b;

    // TODO: do we want an epsilon in here to be permissive?
    if (qt0 > 1 && qt1 > 1 || qt0 < 0 && qt1 < 0) {
      return noOverlap;
    }
    return [new Overlap(a, b)];
  }

  // Degree of the polynomial (quadratic)
}

Quadratic.prototype.degree = 2;
kite.register('Quadratic', Quadratic);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlV0aWxzIiwiVmVjdG9yMiIsIkN1YmljIiwia2l0ZSIsIkxpbmUiLCJPdmVybGFwIiwiUmF5SW50ZXJzZWN0aW9uIiwiU2VnbWVudCIsInN2Z051bWJlciIsInNvbHZlUXVhZHJhdGljUm9vdHNSZWFsIiwiYXJlUG9pbnRzQ29sbGluZWFyIiwiaXNCZXR3ZWVuMEFuZDEiLCJ0IiwiUXVhZHJhdGljIiwiY29uc3RydWN0b3IiLCJzdGFydCIsImNvbnRyb2wiLCJlbmQiLCJfc3RhcnQiLCJfY29udHJvbCIsIl9lbmQiLCJpbnZhbGlkYXRlIiwic2V0U3RhcnQiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsInRvU3RyaW5nIiwiZXF1YWxzIiwidmFsdWUiLCJnZXRTdGFydCIsInNldENvbnRyb2wiLCJnZXRDb250cm9sIiwic2V0RW5kIiwiZ2V0RW5kIiwicG9zaXRpb25BdCIsIm10IiwidGltZXMiLCJwbHVzIiwidGFuZ2VudEF0IiwibWludXMiLCJjdXJ2YXR1cmVBdCIsImVwc2lsb24iLCJNYXRoIiwiYWJzIiwiaXNaZXJvIiwicDAiLCJwMSIsInAyIiwiZDEwIiwiYSIsIm1hZ25pdHVkZSIsImgiLCJwZXJwZW5kaWN1bGFyIiwibm9ybWFsaXplZCIsImRvdCIsImRlZ3JlZSIsInN1YmRpdmlkZWQiLCJsZWZ0TWlkIiwiYmxlbmQiLCJyaWdodE1pZCIsIm1pZCIsIl9zdGFydFRhbmdlbnQiLCJfZW5kVGFuZ2VudCIsIl90Q3JpdGljYWxYIiwiX3RDcml0aWNhbFkiLCJfYm91bmRzIiwiX3N2Z1BhdGhGcmFnbWVudCIsImludmFsaWRhdGlvbkVtaXR0ZXIiLCJlbWl0IiwiZ2V0U3RhcnRUYW5nZW50IiwiY29udHJvbElzU3RhcnQiLCJzdGFydFRhbmdlbnQiLCJnZXRFbmRUYW5nZW50IiwiY29udHJvbElzRW5kIiwiZW5kVGFuZ2VudCIsImdldFRDcml0aWNhbFgiLCJleHRyZW1hVCIsIngiLCJ0Q3JpdGljYWxYIiwiZ2V0VENyaXRpY2FsWSIsInkiLCJ0Q3JpdGljYWxZIiwiZ2V0Tm9uZGVnZW5lcmF0ZVNlZ21lbnRzIiwic3RhcnRJc0VuZCIsInN0YXJ0SXNDb250cm9sIiwiZW5kSXNDb250cm9sIiwiaGFsZlBvaW50IiwiZGVsdGEiLCJwMWQiLCJpc05hTiIsInB0IiwiXyIsImZsYXR0ZW4iLCJnZXRCb3VuZHMiLCJtaW4iLCJtYXgiLCJ3aXRoUG9pbnQiLCJib3VuZHMiLCJvZmZzZXRUbyIsInIiLCJyZXZlcnNlIiwiY3VydmVzIiwiZGVwdGgiLCJpIiwibWFwIiwiY3VydmUiLCJvZmZzZXRDdXJ2ZXMiLCJhcHByb3hpbWF0ZU9mZnNldCIsInJldmVyc2VkIiwiZGVncmVlRWxldmF0ZWQiLCJ0aW1lc1NjYWxhciIsImRpdmlkZWRTY2FsYXIiLCJnZXRTVkdQYXRoRnJhZ21lbnQiLCJvbGRQYXRoRnJhZ21lbnQiLCJzdHJva2VMZWZ0IiwibGluZVdpZHRoIiwic3Ryb2tlUmlnaHQiLCJnZXRJbnRlcmlvckV4dHJlbWFUcyIsInJlc3VsdCIsImNyaXRpY2FsWCIsImNyaXRpY2FsWSIsInB1c2giLCJzb3J0IiwiaW50ZXJzZWN0aW9uIiwicmF5IiwiaW52ZXJzZU1hdHJpeCIsInJvdGF0aW9uMiIsImRpcmVjdGlvbiIsImFuZ2xlIiwidGltZXNNYXRyaXgiLCJ0cmFuc2xhdGlvbiIsInBvc2l0aW9uIiwidGltZXNWZWN0b3IyIiwiYiIsImMiLCJ0cyIsImVhY2giLCJoaXRQb2ludCIsInVuaXRUYW5nZW50IiwicGVycCIsInRvSGl0Iiwibm9ybWFsIiwibmVnYXRlZCIsIndpbmQiLCJ3aW5kaW5nSW50ZXJzZWN0aW9uIiwiaGl0cyIsImhpdCIsIndyaXRlVG9Db250ZXh0IiwiY29udGV4dCIsInF1YWRyYXRpY0N1cnZlVG8iLCJ0cmFuc2Zvcm1lZCIsIm1hdHJpeCIsImdldFNpZ25lZEFyZWFGcmFnbWVudCIsInJlcGFyYW1ldGVyaXplZCIsInAiLCJxIiwiYWxwaGEiLCJiZXRhIiwiZ2FtbWEiLCJzZXJpYWxpemUiLCJ0eXBlIiwic3RhcnRYIiwic3RhcnRZIiwiY29udHJvbFgiLCJjb250cm9sWSIsImVuZFgiLCJlbmRZIiwiZ2V0T3ZlcmxhcHMiLCJzZWdtZW50IiwiZGVzZXJpYWxpemUiLCJvYmoiLCJkaXZpc29yWCIsIk5hTiIsInF1YWRyYXRpYzEiLCJxdWFkcmF0aWMyIiwibm9PdmVybGFwIiwicDB4IiwicDF4IiwicDJ4IiwicDB5IiwicDF5IiwicDJ5IiwicTB4IiwicTF4IiwicTJ4IiwicTB5IiwicTF5IiwicTJ5IiwieFNwcmVhZCIsInlTcHJlYWQiLCJ4T3ZlcmxhcCIsInBvbHlub21pYWxHZXRPdmVybGFwUXVhZHJhdGljIiwieU92ZXJsYXAiLCJvdmVybGFwIiwiYWEiLCJiYiIsImFiMiIsImQweCIsImQxeCIsImQyeCIsImQweSIsImQxeSIsImQyeSIsInhSb290cyIsInNvbHZlTGluZWFyUm9vdHNSZWFsIiwieVJvb3RzIiwieEV4dHJlbWVUcyIsInVuaXEiLCJjb25jYXQiLCJmaWx0ZXIiLCJ5RXh0cmVtZVRzIiwibGVuZ3RoIiwicXQwIiwicXQxIiwicHJvdG90eXBlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJRdWFkcmF0aWMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUXVhZHJhdGljIEJlemllciBzZWdtZW50XHJcbiAqXHJcbiAqIEdvb2QgcmVmZXJlbmNlOiBodHRwOi8vY2FnZC5jcy5ieXUuZWR1L341NTcvdGV4dC9jaDIucGRmXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFJheTIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JheTIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBDdWJpYywga2l0ZSwgTGluZSwgT3ZlcmxhcCwgUmF5SW50ZXJzZWN0aW9uLCBTZWdtZW50LCBzdmdOdW1iZXIgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBzb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbCA9IFV0aWxzLnNvbHZlUXVhZHJhdGljUm9vdHNSZWFsO1xyXG5jb25zdCBhcmVQb2ludHNDb2xsaW5lYXIgPSBVdGlscy5hcmVQb2ludHNDb2xsaW5lYXI7XHJcblxyXG4vLyBVc2VkIGluIG11bHRpcGxlIGZpbHRlcnNcclxuZnVuY3Rpb24gaXNCZXR3ZWVuMEFuZDEoIHQ6IG51bWJlciApOiBib29sZWFuIHtcclxuICByZXR1cm4gdCA+PSAwICYmIHQgPD0gMTtcclxufVxyXG5cclxudHlwZSBTZXJpYWxpemVkUXVhZHJhdGljID0ge1xyXG4gIHR5cGU6ICdRdWFkcmF0aWMnO1xyXG4gIHN0YXJ0WDogbnVtYmVyO1xyXG4gIHN0YXJ0WTogbnVtYmVyO1xyXG4gIGNvbnRyb2xYOiBudW1iZXI7XHJcbiAgY29udHJvbFk6IG51bWJlcjtcclxuICBlbmRYOiBudW1iZXI7XHJcbiAgZW5kWTogbnVtYmVyO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUXVhZHJhdGljIGV4dGVuZHMgU2VnbWVudCB7XHJcblxyXG4gIHByaXZhdGUgX3N0YXJ0OiBWZWN0b3IyO1xyXG4gIHByaXZhdGUgX2NvbnRyb2w6IFZlY3RvcjI7XHJcbiAgcHJpdmF0ZSBfZW5kOiBWZWN0b3IyO1xyXG5cclxuICAvLyBMYXppbHktY29tcHV0ZWQgZGVyaXZlZCBpbmZvcm1hdGlvblxyXG4gIHByaXZhdGUgX3N0YXJ0VGFuZ2VudCE6IFZlY3RvcjIgfCBudWxsO1xyXG4gIHByaXZhdGUgX2VuZFRhbmdlbnQhOiBWZWN0b3IyIHwgbnVsbDtcclxuICBwcml2YXRlIF90Q3JpdGljYWxYITogbnVtYmVyIHwgbnVsbDsgLy8gVCB3aGVyZSB4LWRlcml2YXRpdmUgaXMgMCAocmVwbGFjZWQgd2l0aCBOYU4gaWYgbm90IGluIHJhbmdlKVxyXG4gIHByaXZhdGUgX3RDcml0aWNhbFkhOiBudW1iZXIgfCBudWxsOyAvLyBUIHdoZXJlIHktZGVyaXZhdGl2ZSBpcyAwIChyZXBsYWNlZCB3aXRoIE5hTiBpZiBub3QgaW4gcmFuZ2UpXHJcbiAgcHJpdmF0ZSBfYm91bmRzITogQm91bmRzMiB8IG51bGw7XHJcbiAgcHJpdmF0ZSBfc3ZnUGF0aEZyYWdtZW50ITogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHN0YXJ0IC0gU3RhcnQgcG9pbnQgb2YgdGhlIHF1YWRyYXRpYyBiZXppZXJcclxuICAgKiBAcGFyYW0gY29udHJvbCAtIENvbnRyb2wgcG9pbnQgKGN1cnZlIHVzdWFsbHkgZG9lc24ndCBnbyB0aHJvdWdoIGhlcmUpXHJcbiAgICogQHBhcmFtIGVuZCAtIEVuZCBwb2ludCBvZiB0aGUgcXVhZHJhdGljIGJlemllclxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3RhcnQ6IFZlY3RvcjIsIGNvbnRyb2w6IFZlY3RvcjIsIGVuZDogVmVjdG9yMiApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5fc3RhcnQgPSBzdGFydDtcclxuICAgIHRoaXMuX2NvbnRyb2wgPSBjb250cm9sO1xyXG4gICAgdGhpcy5fZW5kID0gZW5kO1xyXG5cclxuICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgc3RhcnQgcG9pbnQgb2YgdGhlIFF1YWRyYXRpYy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0U3RhcnQoIHN0YXJ0OiBWZWN0b3IyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3RhcnQuaXNGaW5pdGUoKSwgYFF1YWRyYXRpYyBzdGFydCBzaG91bGQgYmUgZmluaXRlOiAke3N0YXJ0LnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIGlmICggIXRoaXMuX3N0YXJ0LmVxdWFscyggc3RhcnQgKSApIHtcclxuICAgICAgdGhpcy5fc3RhcnQgPSBzdGFydDtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgc3RhcnQoIHZhbHVlOiBWZWN0b3IyICkgeyB0aGlzLnNldFN0YXJ0KCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3RhcnQoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldFN0YXJ0KCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3RhcnQgb2YgdGhpcyBRdWFkcmF0aWMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFN0YXJ0KCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0O1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGNvbnRyb2wgcG9pbnQgb2YgdGhlIFF1YWRyYXRpYy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q29udHJvbCggY29udHJvbDogVmVjdG9yMiApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbnRyb2wuaXNGaW5pdGUoKSwgYFF1YWRyYXRpYyBjb250cm9sIHNob3VsZCBiZSBmaW5pdGU6ICR7Y29udHJvbC50b1N0cmluZygpfWAgKTtcclxuXHJcbiAgICBpZiAoICF0aGlzLl9jb250cm9sLmVxdWFscyggY29udHJvbCApICkge1xyXG4gICAgICB0aGlzLl9jb250cm9sID0gY29udHJvbDtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgY29udHJvbCggdmFsdWU6IFZlY3RvcjIgKSB7IHRoaXMuc2V0Q29udHJvbCggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGNvbnRyb2woKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldENvbnRyb2woKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjb250cm9sIHBvaW50IG9mIHRoaXMgUXVhZHJhdGljLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDb250cm9sKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRyb2w7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgZW5kIHBvaW50IG9mIHRoZSBRdWFkcmF0aWMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldEVuZCggZW5kOiBWZWN0b3IyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZW5kLmlzRmluaXRlKCksIGBRdWFkcmF0aWMgZW5kIHNob3VsZCBiZSBmaW5pdGU6ICR7ZW5kLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIGlmICggIXRoaXMuX2VuZC5lcXVhbHMoIGVuZCApICkge1xyXG4gICAgICB0aGlzLl9lbmQgPSBlbmQ7XHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGVuZCggdmFsdWU6IFZlY3RvcjIgKSB7IHRoaXMuc2V0RW5kKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZW5kKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRFbmQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBlbmQgb2YgdGhpcyBRdWFkcmF0aWMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEVuZCgpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLl9lbmQ7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgcG9zaXRpb24gcGFyYW1ldHJpY2FsbHksIHdpdGggMCA8PSB0IDw9IDEuXHJcbiAgICpcclxuICAgKiBOT1RFOiBwb3NpdGlvbkF0KCAwICkgd2lsbCByZXR1cm4gdGhlIHN0YXJ0IG9mIHRoZSBzZWdtZW50LCBhbmQgcG9zaXRpb25BdCggMSApIHdpbGwgcmV0dXJuIHRoZSBlbmQgb2YgdGhlXHJcbiAgICogc2VnbWVudC5cclxuICAgKlxyXG4gICAqIFRoaXMgbWV0aG9kIGlzIHBhcnQgb2YgdGhlIFNlZ21lbnQgQVBJLiBTZWUgU2VnbWVudC5qcydzIGNvbnN0cnVjdG9yIGZvciBtb3JlIEFQSSBkb2N1bWVudGF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwb3NpdGlvbkF0KCB0OiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAsICdwb3NpdGlvbkF0IHQgc2hvdWxkIGJlIG5vbi1uZWdhdGl2ZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPD0gMSwgJ3Bvc2l0aW9uQXQgdCBzaG91bGQgYmUgbm8gZ3JlYXRlciB0aGFuIDEnICk7XHJcblxyXG4gICAgY29uc3QgbXQgPSAxIC0gdDtcclxuICAgIC8vIGRlc2NyaWJlZCBmcm9tIHQ9WzAsMV0gYXM6ICgxLXQpXjIgc3RhcnQgKyAyKDEtdCl0IGNvbnRyb2wgKyB0XjIgZW5kXHJcbiAgICAvLyBUT0RPOiBhbGxvY2F0aW9uIHJlZHVjdGlvblxyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0LnRpbWVzKCBtdCAqIG10ICkucGx1cyggdGhpcy5fY29udHJvbC50aW1lcyggMiAqIG10ICogdCApICkucGx1cyggdGhpcy5fZW5kLnRpbWVzKCB0ICogdCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBub24tbm9ybWFsaXplZCB0YW5nZW50IChkeC9kdCwgZHkvZHQpIG9mIHRoaXMgc2VnbWVudCBhdCB0aGUgcGFyYW1ldHJpYyB2YWx1ZSBvZiB0LCB3aXRoIDAgPD0gdCA8PSAxLlxyXG4gICAqXHJcbiAgICogTk9URTogdGFuZ2VudEF0KCAwICkgd2lsbCByZXR1cm4gdGhlIHRhbmdlbnQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzZWdtZW50LCBhbmQgdGFuZ2VudEF0KCAxICkgd2lsbCByZXR1cm4gdGhlXHJcbiAgICogdGFuZ2VudCBhdCB0aGUgZW5kIG9mIHRoZSBzZWdtZW50LlxyXG4gICAqXHJcbiAgICogVGhpcyBtZXRob2QgaXMgcGFydCBvZiB0aGUgU2VnbWVudCBBUEkuIFNlZSBTZWdtZW50LmpzJ3MgY29uc3RydWN0b3IgZm9yIG1vcmUgQVBJIGRvY3VtZW50YXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIHRhbmdlbnRBdCggdDogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAndGFuZ2VudEF0IHQgc2hvdWxkIGJlIG5vbi1uZWdhdGl2ZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPD0gMSwgJ3RhbmdlbnRBdCB0IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcclxuXHJcbiAgICAvLyBGb3IgYSBxdWFkcmF0aWMgY3VydmUsIHRoZSBkZXJpdmF0aXZlIGlzIGdpdmVuIGJ5IDogMigxLXQpKCBjb250cm9sIC0gc3RhcnQgKSArIDJ0KCBlbmQgLSBjb250cm9sIClcclxuICAgIC8vIFRPRE86IGFsbG9jYXRpb24gcmVkdWN0aW9uXHJcbiAgICByZXR1cm4gdGhpcy5fY29udHJvbC5taW51cyggdGhpcy5fc3RhcnQgKS50aW1lcyggMiAqICggMSAtIHQgKSApLnBsdXMoIHRoaXMuX2VuZC5taW51cyggdGhpcy5fY29udHJvbCApLnRpbWVzKCAyICogdCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzaWduZWQgY3VydmF0dXJlIG9mIHRoZSBzZWdtZW50IGF0IHRoZSBwYXJhbWV0cmljIHZhbHVlIHQsIHdoZXJlIDAgPD0gdCA8PSAxLlxyXG4gICAqXHJcbiAgICogVGhlIGN1cnZhdHVyZSB3aWxsIGJlIHBvc2l0aXZlIGZvciB2aXN1YWwgY2xvY2t3aXNlIC8gbWF0aGVtYXRpY2FsIGNvdW50ZXJjbG9ja3dpc2UgY3VydmVzLCBuZWdhdGl2ZSBmb3Igb3Bwb3NpdGVcclxuICAgKiBjdXJ2YXR1cmUsIGFuZCAwIGZvciBubyBjdXJ2YXR1cmUuXHJcbiAgICpcclxuICAgKiBOT1RFOiBjdXJ2YXR1cmVBdCggMCApIHdpbGwgcmV0dXJuIHRoZSBjdXJ2YXR1cmUgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzZWdtZW50LCBhbmQgY3VydmF0dXJlQXQoIDEgKSB3aWxsIHJldHVyblxyXG4gICAqIHRoZSBjdXJ2YXR1cmUgYXQgdGhlIGVuZCBvZiB0aGUgc2VnbWVudC5cclxuICAgKlxyXG4gICAqIFRoaXMgbWV0aG9kIGlzIHBhcnQgb2YgdGhlIFNlZ21lbnQgQVBJLiBTZWUgU2VnbWVudC5qcydzIGNvbnN0cnVjdG9yIGZvciBtb3JlIEFQSSBkb2N1bWVudGF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjdXJ2YXR1cmVBdCggdDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAsICdjdXJ2YXR1cmVBdCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0IDw9IDEsICdjdXJ2YXR1cmVBdCB0IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcclxuXHJcbiAgICAvLyBzZWUgaHR0cDovL2NhZ2QuY3MuYnl1LmVkdS9+NTU3L3RleHQvY2gyLnBkZiBwMzFcclxuICAgIC8vIFRPRE86IHJlbW92ZSBjb2RlIGR1cGxpY2F0aW9uIHdpdGggQ3ViaWNcclxuICAgIGNvbnN0IGVwc2lsb24gPSAwLjAwMDAwMDE7XHJcbiAgICBpZiAoIE1hdGguYWJzKCB0IC0gMC41ICkgPiAwLjUgLSBlcHNpbG9uICkge1xyXG4gICAgICBjb25zdCBpc1plcm8gPSB0IDwgMC41O1xyXG4gICAgICBjb25zdCBwMCA9IGlzWmVybyA/IHRoaXMuX3N0YXJ0IDogdGhpcy5fZW5kO1xyXG4gICAgICBjb25zdCBwMSA9IHRoaXMuX2NvbnRyb2w7XHJcbiAgICAgIGNvbnN0IHAyID0gaXNaZXJvID8gdGhpcy5fZW5kIDogdGhpcy5fc3RhcnQ7XHJcbiAgICAgIGNvbnN0IGQxMCA9IHAxLm1pbnVzKCBwMCApO1xyXG4gICAgICBjb25zdCBhID0gZDEwLm1hZ25pdHVkZTtcclxuICAgICAgY29uc3QgaCA9ICggaXNaZXJvID8gLTEgOiAxICkgKiBkMTAucGVycGVuZGljdWxhci5ub3JtYWxpemVkKCkuZG90KCBwMi5taW51cyggcDEgKSApO1xyXG4gICAgICByZXR1cm4gKCBoICogKCB0aGlzLmRlZ3JlZSAtIDEgKSApIC8gKCB0aGlzLmRlZ3JlZSAqIGEgKiBhICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc3ViZGl2aWRlZCggdCApWyAwIF0uY3VydmF0dXJlQXQoIDEgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgd2l0aCB1cCB0byAyIHN1Yi1zZWdtZW50cywgc3BsaXQgYXQgdGhlIHBhcmFtZXRyaWMgdCB2YWx1ZS4gVG9nZXRoZXIgKGluIG9yZGVyKSB0aGV5IHNob3VsZCBtYWtlXHJcbiAgICogdXAgdGhlIHNhbWUgc2hhcGUgYXMgdGhlIGN1cnJlbnQgc2VnbWVudC5cclxuICAgKlxyXG4gICAqIFRoaXMgbWV0aG9kIGlzIHBhcnQgb2YgdGhlIFNlZ21lbnQgQVBJLiBTZWUgU2VnbWVudC5qcydzIGNvbnN0cnVjdG9yIGZvciBtb3JlIEFQSSBkb2N1bWVudGF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdWJkaXZpZGVkKCB0OiBudW1iZXIgKTogUXVhZHJhdGljW10ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAnc3ViZGl2aWRlZCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0IDw9IDEsICdzdWJkaXZpZGVkIHQgc2hvdWxkIGJlIG5vIGdyZWF0ZXIgdGhhbiAxJyApO1xyXG5cclxuICAgIC8vIElmIHQgaXMgMCBvciAxLCB3ZSBvbmx5IG5lZWQgdG8gcmV0dXJuIDEgc2VnbWVudFxyXG4gICAgaWYgKCB0ID09PSAwIHx8IHQgPT09IDEgKSB7XHJcbiAgICAgIHJldHVybiBbIHRoaXMgXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkZSBDYXN0ZWxqYXUgbWV0aG9kXHJcbiAgICBjb25zdCBsZWZ0TWlkID0gdGhpcy5fc3RhcnQuYmxlbmQoIHRoaXMuX2NvbnRyb2wsIHQgKTtcclxuICAgIGNvbnN0IHJpZ2h0TWlkID0gdGhpcy5fY29udHJvbC5ibGVuZCggdGhpcy5fZW5kLCB0ICk7XHJcbiAgICBjb25zdCBtaWQgPSBsZWZ0TWlkLmJsZW5kKCByaWdodE1pZCwgdCApO1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgbmV3IFF1YWRyYXRpYyggdGhpcy5fc3RhcnQsIGxlZnRNaWQsIG1pZCApLFxyXG4gICAgICBuZXcgUXVhZHJhdGljKCBtaWQsIHJpZ2h0TWlkLCB0aGlzLl9lbmQgKVxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFycyBjYWNoZWQgaW5mb3JtYXRpb24sIHNob3VsZCBiZSBjYWxsZWQgd2hlbiBhbnkgb2YgdGhlICdjb25zdHJ1Y3RvciBhcmd1bWVudHMnIGFyZSBtdXRhdGVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpbnZhbGlkYXRlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fc3RhcnQgaW5zdGFuY2VvZiBWZWN0b3IyLCBgUXVhZHJhdGljIHN0YXJ0IHNob3VsZCBiZSBhIFZlY3RvcjI6ICR7dGhpcy5fc3RhcnR9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fc3RhcnQuaXNGaW5pdGUoKSwgYFF1YWRyYXRpYyBzdGFydCBzaG91bGQgYmUgZmluaXRlOiAke3RoaXMuX3N0YXJ0LnRvU3RyaW5nKCl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fY29udHJvbCBpbnN0YW5jZW9mIFZlY3RvcjIsIGBRdWFkcmF0aWMgY29udHJvbCBzaG91bGQgYmUgYSBWZWN0b3IyOiAke3RoaXMuX2NvbnRyb2x9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fY29udHJvbC5pc0Zpbml0ZSgpLCBgUXVhZHJhdGljIGNvbnRyb2wgc2hvdWxkIGJlIGZpbml0ZTogJHt0aGlzLl9jb250cm9sLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fZW5kIGluc3RhbmNlb2YgVmVjdG9yMiwgYFF1YWRyYXRpYyBlbmQgc2hvdWxkIGJlIGEgVmVjdG9yMjogJHt0aGlzLl9lbmR9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fZW5kLmlzRmluaXRlKCksIGBRdWFkcmF0aWMgZW5kIHNob3VsZCBiZSBmaW5pdGU6ICR7dGhpcy5fZW5kLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIC8vIExhemlseS1jb21wdXRlZCBkZXJpdmVkIGluZm9ybWF0aW9uXHJcbiAgICB0aGlzLl9zdGFydFRhbmdlbnQgPSBudWxsO1xyXG4gICAgdGhpcy5fZW5kVGFuZ2VudCA9IG51bGw7XHJcbiAgICB0aGlzLl90Q3JpdGljYWxYID0gbnVsbDtcclxuICAgIHRoaXMuX3RDcml0aWNhbFkgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuX2JvdW5kcyA9IG51bGw7XHJcbiAgICB0aGlzLl9zdmdQYXRoRnJhZ21lbnQgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuaW52YWxpZGF0aW9uRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB0YW5nZW50IHZlY3RvciAobm9ybWFsaXplZCkgdG8gdGhlIHNlZ21lbnQgYXQgdGhlIHN0YXJ0LCBwb2ludGluZyBpbiB0aGUgZGlyZWN0aW9uIG9mIG1vdGlvbiAoZnJvbSBzdGFydCB0byBlbmQpXHJcbiAgICovXHJcbiAgcHVibGljIGdldFN0YXJ0VGFuZ2VudCgpOiBWZWN0b3IyIHtcclxuICAgIGlmICggdGhpcy5fc3RhcnRUYW5nZW50ID09PSBudWxsICkge1xyXG4gICAgICBjb25zdCBjb250cm9sSXNTdGFydCA9IHRoaXMuX3N0YXJ0LmVxdWFscyggdGhpcy5fY29udHJvbCApO1xyXG4gICAgICAvLyBUT0RPOiBhbGxvY2F0aW9uIHJlZHVjdGlvblxyXG4gICAgICB0aGlzLl9zdGFydFRhbmdlbnQgPSBjb250cm9sSXNTdGFydCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VuZC5taW51cyggdGhpcy5fc3RhcnQgKS5ub3JtYWxpemVkKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jb250cm9sLm1pbnVzKCB0aGlzLl9zdGFydCApLm5vcm1hbGl6ZWQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9zdGFydFRhbmdlbnQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHN0YXJ0VGFuZ2VudCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0U3RhcnRUYW5nZW50KCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdGFuZ2VudCB2ZWN0b3IgKG5vcm1hbGl6ZWQpIHRvIHRoZSBzZWdtZW50IGF0IHRoZSBlbmQsIHBvaW50aW5nIGluIHRoZSBkaXJlY3Rpb24gb2YgbW90aW9uIChmcm9tIHN0YXJ0IHRvIGVuZClcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RW5kVGFuZ2VudCgpOiBWZWN0b3IyIHtcclxuICAgIGlmICggdGhpcy5fZW5kVGFuZ2VudCA9PT0gbnVsbCApIHtcclxuICAgICAgY29uc3QgY29udHJvbElzRW5kID0gdGhpcy5fZW5kLmVxdWFscyggdGhpcy5fY29udHJvbCApO1xyXG4gICAgICAvLyBUT0RPOiBhbGxvY2F0aW9uIHJlZHVjdGlvblxyXG4gICAgICB0aGlzLl9lbmRUYW5nZW50ID0gY29udHJvbElzRW5kID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VuZC5taW51cyggdGhpcy5fc3RhcnQgKS5ub3JtYWxpemVkKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW5kLm1pbnVzKCB0aGlzLl9jb250cm9sICkubm9ybWFsaXplZCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX2VuZFRhbmdlbnQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGVuZFRhbmdlbnQoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldEVuZFRhbmdlbnQoKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0VENyaXRpY2FsWCgpOiBudW1iZXIge1xyXG4gICAgLy8gY29tcHV0ZSB4IHdoZXJlIHRoZSBkZXJpdmF0aXZlIGlzIDAgKHVzZWQgZm9yIGJvdW5kcyBhbmQgb3RoZXIgdGhpbmdzKVxyXG4gICAgaWYgKCB0aGlzLl90Q3JpdGljYWxYID09PSBudWxsICkge1xyXG4gICAgICB0aGlzLl90Q3JpdGljYWxYID0gUXVhZHJhdGljLmV4dHJlbWFUKCB0aGlzLl9zdGFydC54LCB0aGlzLl9jb250cm9sLngsIHRoaXMuX2VuZC54ICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fdENyaXRpY2FsWDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgdENyaXRpY2FsWCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRUQ3JpdGljYWxYKCk7IH1cclxuXHJcbiAgcHVibGljIGdldFRDcml0aWNhbFkoKTogbnVtYmVyIHtcclxuICAgIC8vIGNvbXB1dGUgeSB3aGVyZSB0aGUgZGVyaXZhdGl2ZSBpcyAwICh1c2VkIGZvciBib3VuZHMgYW5kIG90aGVyIHRoaW5ncylcclxuICAgIGlmICggdGhpcy5fdENyaXRpY2FsWSA9PT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5fdENyaXRpY2FsWSA9IFF1YWRyYXRpYy5leHRyZW1hVCggdGhpcy5fc3RhcnQueSwgdGhpcy5fY29udHJvbC55LCB0aGlzLl9lbmQueSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX3RDcml0aWNhbFk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHRDcml0aWNhbFkoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0VENyaXRpY2FsWSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIG5vbi1kZWdlbmVyYXRlIHNlZ21lbnRzIHRoYXQgYXJlIGVxdWl2YWxlbnQgdG8gdGhpcyBzZWdtZW50LiBHZW5lcmFsbHkgZ2V0cyByaWQgKG9yIHNpbXBsaWZpZXMpXHJcbiAgICogaW52YWxpZCBvciByZXBlYXRlZCBzZWdtZW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Tm9uZGVnZW5lcmF0ZVNlZ21lbnRzKCk6IFNlZ21lbnRbXSB7XHJcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuX3N0YXJ0O1xyXG4gICAgY29uc3QgY29udHJvbCA9IHRoaXMuX2NvbnRyb2w7XHJcbiAgICBjb25zdCBlbmQgPSB0aGlzLl9lbmQ7XHJcblxyXG4gICAgY29uc3Qgc3RhcnRJc0VuZCA9IHN0YXJ0LmVxdWFscyggZW5kICk7XHJcbiAgICBjb25zdCBzdGFydElzQ29udHJvbCA9IHN0YXJ0LmVxdWFscyggY29udHJvbCApO1xyXG4gICAgY29uc3QgZW5kSXNDb250cm9sID0gc3RhcnQuZXF1YWxzKCBjb250cm9sICk7XHJcblxyXG4gICAgaWYgKCBzdGFydElzRW5kICYmIHN0YXJ0SXNDb250cm9sICkge1xyXG4gICAgICAvLyBhbGwgc2FtZSBwb2ludHNcclxuICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHN0YXJ0SXNFbmQgKSB7XHJcbiAgICAgIC8vIHRoaXMgaXMgYSBzcGVjaWFsIGNvbGxpbmVhciBjYXNlLCB3ZSBiYXNpY2FsbHkgbGluZSBvdXQgdG8gdGhlIGZhcnRoZXN0IHBvaW50IGFuZCBiYWNrXHJcbiAgICAgIGNvbnN0IGhhbGZQb2ludCA9IHRoaXMucG9zaXRpb25BdCggMC41ICk7XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgbmV3IExpbmUoIHN0YXJ0LCBoYWxmUG9pbnQgKSxcclxuICAgICAgICBuZXcgTGluZSggaGFsZlBvaW50LCBlbmQgKVxyXG4gICAgICBdO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGFyZVBvaW50c0NvbGxpbmVhciggc3RhcnQsIGNvbnRyb2wsIGVuZCApICkge1xyXG4gICAgICAvLyBpZiB0aGV5IGFyZSBjb2xsaW5lYXIsIHdlIGNhbiByZWR1Y2UgdG8gc3RhcnQtPmNvbnRyb2wgYW5kIGNvbnRyb2wtPmVuZCwgb3IgaWYgY29udHJvbCBpcyBiZXR3ZWVuLCBqdXN0IG9uZSBsaW5lIHNlZ21lbnRcclxuICAgICAgLy8gYWxzbywgc3RhcnQgIT09IGVuZCAoaGFuZGxlZCBlYXJsaWVyKVxyXG4gICAgICBpZiAoIHN0YXJ0SXNDb250cm9sIHx8IGVuZElzQ29udHJvbCApIHtcclxuICAgICAgICAvLyBqdXN0IGEgbGluZSBzZWdtZW50IVxyXG4gICAgICAgIHJldHVybiBbIG5ldyBMaW5lKCBzdGFydCwgZW5kICkgXTsgLy8gbm8gZXh0cmEgbm9uZGVnZW5lcmF0ZSBjaGVjayBzaW5jZSBzdGFydCAhPT0gZW5kXHJcbiAgICAgIH1cclxuICAgICAgLy8gbm93IGNvbnRyb2wgcG9pbnQgbXVzdCBiZSB1bmlxdWUuIHdlIGNoZWNrIHRvIHNlZSBpZiBvdXIgcmVuZGVyZWQgcGF0aCB3aWxsIGJlIG91dHNpZGUgb2YgdGhlIHN0YXJ0LT5lbmQgbGluZSBzZWdtZW50XHJcbiAgICAgIGNvbnN0IGRlbHRhID0gZW5kLm1pbnVzKCBzdGFydCApO1xyXG4gICAgICBjb25zdCBwMWQgPSBjb250cm9sLm1pbnVzKCBzdGFydCApLmRvdCggZGVsdGEubm9ybWFsaXplZCgpICkgLyBkZWx0YS5tYWduaXR1ZGU7XHJcbiAgICAgIGNvbnN0IHQgPSBRdWFkcmF0aWMuZXh0cmVtYVQoIDAsIHAxZCwgMSApO1xyXG4gICAgICBpZiAoICFpc05hTiggdCApICYmIHQgPiAwICYmIHQgPCAxICkge1xyXG4gICAgICAgIC8vIHdlIGhhdmUgYSBsb2NhbCBtYXggaW5zaWRlIHRoZSByYW5nZSwgaW5kaWNhdGluZyB0aGF0IG91ciBleHRyZW1hIHBvaW50IGlzIG91dHNpZGUgb2Ygc3RhcnQtPmVuZFxyXG4gICAgICAgIC8vIHdlJ2xsIGxpbmUgdG8gYW5kIGZyb20gaXRcclxuICAgICAgICBjb25zdCBwdCA9IHRoaXMucG9zaXRpb25BdCggdCApO1xyXG4gICAgICAgIHJldHVybiBfLmZsYXR0ZW4oIFtcclxuICAgICAgICAgIG5ldyBMaW5lKCBzdGFydCwgcHQgKS5nZXROb25kZWdlbmVyYXRlU2VnbWVudHMoKSxcclxuICAgICAgICAgIG5ldyBMaW5lKCBwdCwgZW5kICkuZ2V0Tm9uZGVnZW5lcmF0ZVNlZ21lbnRzKClcclxuICAgICAgICBdICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8ganVzdCBwcm92aWRlIGEgbGluZSBzZWdtZW50LCBvdXIgcmVuZGVyZWQgcGF0aCBkb2Vzbid0IGdvIG91dHNpZGUgb2YgdGhpc1xyXG4gICAgICAgIHJldHVybiBbIG5ldyBMaW5lKCBzdGFydCwgZW5kICkgXTsgLy8gbm8gZXh0cmEgbm9uZGVnZW5lcmF0ZSBjaGVjayBzaW5jZSBzdGFydCAhPT0gZW5kXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gWyB0aGlzIF07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBib3VuZHMgb2YgdGhpcyBzZWdtZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRCb3VuZHMoKTogQm91bmRzMiB7XHJcbiAgICAvLyBjYWxjdWxhdGUgb3VyIHRlbXBvcmFyeSBndWFyYW50ZWVkIGxvd2VyIGJvdW5kcyBiYXNlZCBvbiB0aGUgZW5kIHBvaW50c1xyXG4gICAgaWYgKCB0aGlzLl9ib3VuZHMgPT09IG51bGwgKSB7XHJcbiAgICAgIHRoaXMuX2JvdW5kcyA9IG5ldyBCb3VuZHMyKCBNYXRoLm1pbiggdGhpcy5fc3RhcnQueCwgdGhpcy5fZW5kLnggKSwgTWF0aC5taW4oIHRoaXMuX3N0YXJ0LnksIHRoaXMuX2VuZC55ICksIE1hdGgubWF4KCB0aGlzLl9zdGFydC54LCB0aGlzLl9lbmQueCApLCBNYXRoLm1heCggdGhpcy5fc3RhcnQueSwgdGhpcy5fZW5kLnkgKSApO1xyXG5cclxuICAgICAgLy8gY29tcHV0ZSB4IGFuZCB5IHdoZXJlIHRoZSBkZXJpdmF0aXZlIGlzIDAsIHNvIHdlIGNhbiBpbmNsdWRlIHRoaXMgaW4gdGhlIGJvdW5kc1xyXG4gICAgICBjb25zdCB0Q3JpdGljYWxYID0gdGhpcy5nZXRUQ3JpdGljYWxYKCk7XHJcbiAgICAgIGNvbnN0IHRDcml0aWNhbFkgPSB0aGlzLmdldFRDcml0aWNhbFkoKTtcclxuXHJcbiAgICAgIGlmICggIWlzTmFOKCB0Q3JpdGljYWxYICkgJiYgdENyaXRpY2FsWCA+IDAgJiYgdENyaXRpY2FsWCA8IDEgKSB7XHJcbiAgICAgICAgdGhpcy5fYm91bmRzID0gdGhpcy5fYm91bmRzLndpdGhQb2ludCggdGhpcy5wb3NpdGlvbkF0KCB0Q3JpdGljYWxYICkgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoICFpc05hTiggdENyaXRpY2FsWSApICYmIHRDcml0aWNhbFkgPiAwICYmIHRDcml0aWNhbFkgPCAxICkge1xyXG4gICAgICAgIHRoaXMuX2JvdW5kcyA9IHRoaXMuX2JvdW5kcy53aXRoUG9pbnQoIHRoaXMucG9zaXRpb25BdCggdENyaXRpY2FsWSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9ib3VuZHM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGJvdW5kcygpOiBCb3VuZHMyIHsgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCk7IH1cclxuXHJcbiAgLy8gc2VlIGh0dHA6Ly93d3cudmlzZ3JhZi5pbXBhLmJyL3NpYmdyYXBpOTYvdHJhYnMvcGRmL2ExNC5wZGZcclxuICAvLyBhbmQgaHR0cDovL21hdGguc3RhY2tleGNoYW5nZS5jb20vcXVlc3Rpb25zLzEyMTg2L2FyYy1sZW5ndGgtb2YtYmV6aWVyLWN1cnZlcyBmb3IgY3VydmF0dXJlIC8gYXJjIGxlbmd0aFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHF1YWRyYXRpYyB0aGF0IGFyZSBvZmZzZXQgdG8gdGhpcyBxdWFkcmF0aWMgYnkgYSBkaXN0YW5jZSByXHJcbiAgICpcclxuICAgKiBAcGFyYW0gciAtIGRpc3RhbmNlXHJcbiAgICogQHBhcmFtIHJldmVyc2VcclxuICAgKi9cclxuICBwdWJsaWMgb2Zmc2V0VG8oIHI6IG51bWJlciwgcmV2ZXJzZTogYm9vbGVhbiApOiBRdWFkcmF0aWNbXSB7XHJcbiAgICAvLyBUT0RPOiBpbXBsZW1lbnQgbW9yZSBhY2N1cmF0ZSBtZXRob2QgYXQgaHR0cDovL3d3dy5hbnRpZ3JhaW4uY29tL3Jlc2VhcmNoL2FkYXB0aXZlX2Jlemllci9pbmRleC5odG1sXHJcbiAgICAvLyBUT0RPOiBvciBtb3JlIHJlY2VudGx5IChhbmQgcmVsZXZhbnRseSk6IGh0dHA6Ly93d3cuY2lzLnVzb3V0aGFsLmVkdS9+aGFpbi9nZW5lcmFsL1B1YmxpY2F0aW9ucy9CZXppZXIvQmV6aWVyRmxhdHRlbmluZy5wZGZcclxuICAgIGxldCBjdXJ2ZXM6IFF1YWRyYXRpY1tdID0gWyB0aGlzIF07XHJcblxyXG4gICAgLy8gc3ViZGl2aWRlIHRoaXMgY3VydmVcclxuICAgIGNvbnN0IGRlcHRoID0gNTsgLy8gZ2VuZXJhdGVzIDJeZGVwdGggY3VydmVzXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBkZXB0aDsgaSsrICkge1xyXG4gICAgICBjdXJ2ZXMgPSBfLmZsYXR0ZW4oIF8ubWFwKCBjdXJ2ZXMsICggY3VydmU6IFF1YWRyYXRpYyApID0+IGN1cnZlLnN1YmRpdmlkZWQoIDAuNSApICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgb2Zmc2V0Q3VydmVzID0gXy5tYXAoIGN1cnZlcywgKCBjdXJ2ZTogUXVhZHJhdGljICkgPT4gY3VydmUuYXBwcm94aW1hdGVPZmZzZXQoIHIgKSApO1xyXG5cclxuICAgIGlmICggcmV2ZXJzZSApIHtcclxuICAgICAgb2Zmc2V0Q3VydmVzLnJldmVyc2UoKTtcclxuICAgICAgb2Zmc2V0Q3VydmVzID0gXy5tYXAoIG9mZnNldEN1cnZlcywgKCBjdXJ2ZTogUXVhZHJhdGljICkgPT4gY3VydmUucmV2ZXJzZWQoKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvZmZzZXRDdXJ2ZXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFbGV2YXRpb24gb2YgdGhpcyBxdWFkcmF0aWMgQmV6aWVyIGN1cnZlIHRvIGEgY3ViaWMgQmV6aWVyIGN1cnZlXHJcbiAgICovXHJcbiAgcHVibGljIGRlZ3JlZUVsZXZhdGVkKCk6IEN1YmljIHtcclxuICAgIC8vIFRPRE86IGFsbG9jYXRpb24gcmVkdWN0aW9uXHJcbiAgICByZXR1cm4gbmV3IEN1YmljKFxyXG4gICAgICB0aGlzLl9zdGFydCxcclxuICAgICAgdGhpcy5fc3RhcnQucGx1cyggdGhpcy5fY29udHJvbC50aW1lc1NjYWxhciggMiApICkuZGl2aWRlZFNjYWxhciggMyApLFxyXG4gICAgICB0aGlzLl9lbmQucGx1cyggdGhpcy5fY29udHJvbC50aW1lc1NjYWxhciggMiApICkuZGl2aWRlZFNjYWxhciggMyApLFxyXG4gICAgICB0aGlzLl9lbmRcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gciAtIGRpc3RhbmNlXHJcbiAgICovXHJcbiAgcHVibGljIGFwcHJveGltYXRlT2Zmc2V0KCByOiBudW1iZXIgKTogUXVhZHJhdGljIHtcclxuICAgIHJldHVybiBuZXcgUXVhZHJhdGljKFxyXG4gICAgICB0aGlzLl9zdGFydC5wbHVzKCAoIHRoaXMuX3N0YXJ0LmVxdWFscyggdGhpcy5fY29udHJvbCApID8gdGhpcy5fZW5kLm1pbnVzKCB0aGlzLl9zdGFydCApIDogdGhpcy5fY29udHJvbC5taW51cyggdGhpcy5fc3RhcnQgKSApLnBlcnBlbmRpY3VsYXIubm9ybWFsaXplZCgpLnRpbWVzKCByICkgKSxcclxuICAgICAgdGhpcy5fY29udHJvbC5wbHVzKCB0aGlzLl9lbmQubWludXMoIHRoaXMuX3N0YXJ0ICkucGVycGVuZGljdWxhci5ub3JtYWxpemVkKCkudGltZXMoIHIgKSApLFxyXG4gICAgICB0aGlzLl9lbmQucGx1cyggKCB0aGlzLl9lbmQuZXF1YWxzKCB0aGlzLl9jb250cm9sICkgPyB0aGlzLl9lbmQubWludXMoIHRoaXMuX3N0YXJ0ICkgOiB0aGlzLl9lbmQubWludXMoIHRoaXMuX2NvbnRyb2wgKSApLnBlcnBlbmRpY3VsYXIubm9ybWFsaXplZCgpLnRpbWVzKCByICkgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzdHJpbmcgY29udGFpbmluZyB0aGUgU1ZHIHBhdGguIGFzc3VtZXMgdGhhdCB0aGUgc3RhcnQgcG9pbnQgaXMgYWxyZWFkeSBwcm92aWRlZCwgc28gYW55dGhpbmcgdGhhdCBjYWxscyB0aGlzIG5lZWRzIHRvIHB1dCB0aGUgTSBjYWxscyBmaXJzdFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTVkdQYXRoRnJhZ21lbnQoKTogc3RyaW5nIHtcclxuICAgIGxldCBvbGRQYXRoRnJhZ21lbnQ7XHJcbiAgICBpZiAoIGFzc2VydCApIHtcclxuICAgICAgb2xkUGF0aEZyYWdtZW50ID0gdGhpcy5fc3ZnUGF0aEZyYWdtZW50O1xyXG4gICAgICB0aGlzLl9zdmdQYXRoRnJhZ21lbnQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKCAhdGhpcy5fc3ZnUGF0aEZyYWdtZW50ICkge1xyXG4gICAgICB0aGlzLl9zdmdQYXRoRnJhZ21lbnQgPSBgUSAke3N2Z051bWJlciggdGhpcy5fY29udHJvbC54ICl9ICR7c3ZnTnVtYmVyKCB0aGlzLl9jb250cm9sLnkgKX0gJHtcclxuICAgICAgICBzdmdOdW1iZXIoIHRoaXMuX2VuZC54ICl9ICR7c3ZnTnVtYmVyKCB0aGlzLl9lbmQueSApfWA7XHJcbiAgICB9XHJcbiAgICBpZiAoIGFzc2VydCApIHtcclxuICAgICAgaWYgKCBvbGRQYXRoRnJhZ21lbnQgKSB7XHJcbiAgICAgICAgYXNzZXJ0KCBvbGRQYXRoRnJhZ21lbnQgPT09IHRoaXMuX3N2Z1BhdGhGcmFnbWVudCwgJ1F1YWRyYXRpYyBsaW5lIHNlZ21lbnQgY2hhbmdlZCB3aXRob3V0IGludmFsaWRhdGUoKScgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX3N2Z1BhdGhGcmFnbWVudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgbGluZXMgdGhhdCB3aWxsIGRyYXcgYW4gb2Zmc2V0IGN1cnZlIG9uIHRoZSBsb2dpY2FsIGxlZnQgc2lkZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdHJva2VMZWZ0KCBsaW5lV2lkdGg6IG51bWJlciApOiBRdWFkcmF0aWNbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5vZmZzZXRUbyggLWxpbmVXaWR0aCAvIDIsIGZhbHNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGxpbmVzIHRoYXQgd2lsbCBkcmF3IGFuIG9mZnNldCBjdXJ2ZSBvbiB0aGUgbG9naWNhbCByaWdodCBzaWRlXHJcbiAgICovXHJcbiAgcHVibGljIHN0cm9rZVJpZ2h0KCBsaW5lV2lkdGg6IG51bWJlciApOiBRdWFkcmF0aWNbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5vZmZzZXRUbyggbGluZVdpZHRoIC8gMiwgdHJ1ZSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEludGVyaW9yRXh0cmVtYVRzKCk6IG51bWJlcltdIHtcclxuICAgIC8vIFRPRE86IHdlIGFzc3VtZSBoZXJlIHdlIGFyZSByZWR1Y2UsIHNvIHRoYXQgYSBjcml0aWNhbFggZG9lc24ndCBlcXVhbCBhIGNyaXRpY2FsWT9cclxuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xyXG4gICAgY29uc3QgZXBzaWxvbiA9IDAuMDAwMDAwMDAwMTsgLy8gVE9ETzogZ2VuZXJhbCBraXRlIGVwc2lsb24/XHJcblxyXG4gICAgY29uc3QgY3JpdGljYWxYID0gdGhpcy5nZXRUQ3JpdGljYWxYKCk7XHJcbiAgICBjb25zdCBjcml0aWNhbFkgPSB0aGlzLmdldFRDcml0aWNhbFkoKTtcclxuXHJcbiAgICBpZiAoICFpc05hTiggY3JpdGljYWxYICkgJiYgY3JpdGljYWxYID4gZXBzaWxvbiAmJiBjcml0aWNhbFggPCAxIC0gZXBzaWxvbiApIHtcclxuICAgICAgcmVzdWx0LnB1c2goIHRoaXMudENyaXRpY2FsWCApO1xyXG4gICAgfVxyXG4gICAgaWYgKCAhaXNOYU4oIGNyaXRpY2FsWSApICYmIGNyaXRpY2FsWSA+IGVwc2lsb24gJiYgY3JpdGljYWxZIDwgMSAtIGVwc2lsb24gKSB7XHJcbiAgICAgIHJlc3VsdC5wdXNoKCB0aGlzLnRDcml0aWNhbFkgKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQuc29ydCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGl0LXRlc3RzIHRoaXMgc2VnbWVudCB3aXRoIHRoZSByYXkuIEFuIGFycmF5IG9mIGFsbCBpbnRlcnNlY3Rpb25zIG9mIHRoZSByYXkgd2l0aCB0aGlzIHNlZ21lbnQgd2lsbCBiZSByZXR1cm5lZC5cclxuICAgKiBGb3IgZGV0YWlscywgc2VlIHRoZSBkb2N1bWVudGF0aW9uIGluIFNlZ21lbnQuanNcclxuICAgKi9cclxuICBwdWJsaWMgaW50ZXJzZWN0aW9uKCByYXk6IFJheTIgKTogUmF5SW50ZXJzZWN0aW9uW10ge1xyXG4gICAgY29uc3QgcmVzdWx0OiBSYXlJbnRlcnNlY3Rpb25bXSA9IFtdO1xyXG5cclxuICAgIC8vIGZpbmQgdGhlIHJvdGF0aW9uIHRoYXQgd2lsbCBwdXQgb3VyIHJheSBpbiB0aGUgZGlyZWN0aW9uIG9mIHRoZSB4LWF4aXMgc28gd2UgY2FuIG9ubHkgc29sdmUgZm9yIHk9MCBmb3IgaW50ZXJzZWN0aW9uc1xyXG4gICAgY29uc3QgaW52ZXJzZU1hdHJpeCA9IE1hdHJpeDMucm90YXRpb24yKCAtcmF5LmRpcmVjdGlvbi5hbmdsZSApLnRpbWVzTWF0cml4KCBNYXRyaXgzLnRyYW5zbGF0aW9uKCAtcmF5LnBvc2l0aW9uLngsIC1yYXkucG9zaXRpb24ueSApICk7XHJcblxyXG4gICAgY29uc3QgcDAgPSBpbnZlcnNlTWF0cml4LnRpbWVzVmVjdG9yMiggdGhpcy5fc3RhcnQgKTtcclxuICAgIGNvbnN0IHAxID0gaW52ZXJzZU1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX2NvbnRyb2wgKTtcclxuICAgIGNvbnN0IHAyID0gaW52ZXJzZU1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX2VuZCApO1xyXG5cclxuICAgIC8vKDEtdCleMiBzdGFydCArIDIoMS10KXQgY29udHJvbCArIHReMiBlbmRcclxuICAgIGNvbnN0IGEgPSBwMC55IC0gMiAqIHAxLnkgKyBwMi55O1xyXG4gICAgY29uc3QgYiA9IC0yICogcDAueSArIDIgKiBwMS55O1xyXG4gICAgY29uc3QgYyA9IHAwLnk7XHJcblxyXG4gICAgY29uc3QgdHMgPSBzb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbCggYSwgYiwgYyApO1xyXG5cclxuICAgIF8uZWFjaCggdHMsIHQgPT4ge1xyXG4gICAgICBpZiAoIHQgPj0gMCAmJiB0IDw9IDEgKSB7XHJcbiAgICAgICAgY29uc3QgaGl0UG9pbnQgPSB0aGlzLnBvc2l0aW9uQXQoIHQgKTtcclxuICAgICAgICBjb25zdCB1bml0VGFuZ2VudCA9IHRoaXMudGFuZ2VudEF0KCB0ICkubm9ybWFsaXplZCgpO1xyXG4gICAgICAgIGNvbnN0IHBlcnAgPSB1bml0VGFuZ2VudC5wZXJwZW5kaWN1bGFyO1xyXG4gICAgICAgIGNvbnN0IHRvSGl0ID0gaGl0UG9pbnQubWludXMoIHJheS5wb3NpdGlvbiApO1xyXG5cclxuICAgICAgICAvLyBtYWtlIHN1cmUgaXQncyBub3QgYmVoaW5kIHRoZSByYXlcclxuICAgICAgICBpZiAoIHRvSGl0LmRvdCggcmF5LmRpcmVjdGlvbiApID4gMCApIHtcclxuICAgICAgICAgIGNvbnN0IG5vcm1hbCA9IHBlcnAuZG90KCByYXkuZGlyZWN0aW9uICkgPiAwID8gcGVycC5uZWdhdGVkKCkgOiBwZXJwO1xyXG4gICAgICAgICAgY29uc3Qgd2luZCA9IHJheS5kaXJlY3Rpb24ucGVycGVuZGljdWxhci5kb3QoIHVuaXRUYW5nZW50ICkgPCAwID8gMSA6IC0xO1xyXG4gICAgICAgICAgcmVzdWx0LnB1c2goIG5ldyBSYXlJbnRlcnNlY3Rpb24oIHRvSGl0Lm1hZ25pdHVkZSwgaGl0UG9pbnQsIG5vcm1hbCwgd2luZCwgdCApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgd2luZGluZyBudW1iZXIgZm9yIGludGVyc2VjdGlvbiB3aXRoIGEgcmF5XHJcbiAgICovXHJcbiAgcHVibGljIHdpbmRpbmdJbnRlcnNlY3Rpb24oIHJheTogUmF5MiApOiBudW1iZXIge1xyXG4gICAgbGV0IHdpbmQgPSAwO1xyXG4gICAgY29uc3QgaGl0cyA9IHRoaXMuaW50ZXJzZWN0aW9uKCByYXkgKTtcclxuICAgIF8uZWFjaCggaGl0cywgaGl0ID0+IHtcclxuICAgICAgd2luZCArPSBoaXQud2luZDtcclxuICAgIH0gKTtcclxuICAgIHJldHVybiB3aW5kO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHJhd3MgdGhlIHNlZ21lbnQgdG8gdGhlIDJEIENhbnZhcyBjb250ZXh0LCBhc3N1bWluZyB0aGUgY29udGV4dCdzIGN1cnJlbnQgbG9jYXRpb24gaXMgYWxyZWFkeSBhdCB0aGUgc3RhcnQgcG9pbnRcclxuICAgKi9cclxuICBwdWJsaWMgd3JpdGVUb0NvbnRleHQoIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCApOiB2b2lkIHtcclxuICAgIGNvbnRleHQucXVhZHJhdGljQ3VydmVUbyggdGhpcy5fY29udHJvbC54LCB0aGlzLl9jb250cm9sLnksIHRoaXMuX2VuZC54LCB0aGlzLl9lbmQueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBxdWFkcmF0aWMgdGhhdCByZXByZXNlbnRzIHRoaXMgcXVhZHJhdGljIGFmdGVyIHRyYW5zZm9ybWF0aW9uIGJ5IHRoZSBtYXRyaXhcclxuICAgKi9cclxuICBwdWJsaWMgdHJhbnNmb3JtZWQoIG1hdHJpeDogTWF0cml4MyApOiBRdWFkcmF0aWMge1xyXG4gICAgcmV0dXJuIG5ldyBRdWFkcmF0aWMoIG1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX3N0YXJ0ICksIG1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX2NvbnRyb2wgKSwgbWF0cml4LnRpbWVzVmVjdG9yMiggdGhpcy5fZW5kICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNvbnRyaWJ1dGlvbiB0byB0aGUgc2lnbmVkIGFyZWEgY29tcHV0ZWQgdXNpbmcgR3JlZW4ncyBUaGVvcmVtLCB3aXRoIFA9LXkvMiBhbmQgUT14LzIuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIGlzIHRoaXMgc2VnbWVudCdzIGNvbnRyaWJ1dGlvbiB0byB0aGUgbGluZSBpbnRlZ3JhbCAoLXkvMiBkeCArIHgvMiBkeSkuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFNpZ25lZEFyZWFGcmFnbWVudCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIDEgLyA2ICogKFxyXG4gICAgICB0aGlzLl9zdGFydC54ICogKCAyICogdGhpcy5fY29udHJvbC55ICsgdGhpcy5fZW5kLnkgKSArXHJcbiAgICAgIHRoaXMuX2NvbnRyb2wueCAqICggLTIgKiB0aGlzLl9zdGFydC55ICsgMiAqIHRoaXMuX2VuZC55ICkgK1xyXG4gICAgICB0aGlzLl9lbmQueCAqICggLXRoaXMuX3N0YXJ0LnkgLSAyICogdGhpcy5fY29udHJvbC55IClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiB0aGUgY3VycmVudCBjdXJ2ZSBwYXJhbWV0ZXJpemVkIGJ5IHQsIHdpbGwgcmV0dXJuIGEgY3VydmUgcGFyYW1ldGVyaXplZCBieSB4IHdoZXJlIHQgPSBhICogeCArIGJcclxuICAgKi9cclxuICBwdWJsaWMgcmVwYXJhbWV0ZXJpemVkKCBhOiBudW1iZXIsIGI6IG51bWJlciApOiBRdWFkcmF0aWMge1xyXG4gICAgLy8gdG8gdGhlIHBvbHlub21pYWwgcHReMiArIHF0ICsgcjpcclxuICAgIGNvbnN0IHAgPSB0aGlzLl9zdGFydC5wbHVzKCB0aGlzLl9lbmQucGx1cyggdGhpcy5fY29udHJvbC50aW1lc1NjYWxhciggLTIgKSApICk7XHJcbiAgICBjb25zdCBxID0gdGhpcy5fY29udHJvbC5taW51cyggdGhpcy5fc3RhcnQgKS50aW1lc1NjYWxhciggMiApO1xyXG4gICAgY29uc3QgciA9IHRoaXMuX3N0YXJ0O1xyXG5cclxuICAgIC8vIHRvIHRoZSBwb2x5bm9taWFsIGFscGhhKnheMiArIGJldGEqeCArIGdhbW1hOlxyXG4gICAgY29uc3QgYWxwaGEgPSBwLnRpbWVzU2NhbGFyKCBhICogYSApO1xyXG4gICAgY29uc3QgYmV0YSA9IHAudGltZXNTY2FsYXIoIGEgKiBiICkudGltZXNTY2FsYXIoIDIgKS5wbHVzKCBxLnRpbWVzU2NhbGFyKCBhICkgKTtcclxuICAgIGNvbnN0IGdhbW1hID0gcC50aW1lc1NjYWxhciggYiAqIGIgKS5wbHVzKCBxLnRpbWVzU2NhbGFyKCBiICkgKS5wbHVzKCByICk7XHJcblxyXG4gICAgLy8gYmFjayB0byB0aGUgZm9ybSBzdGFydCxjb250cm9sLGVuZFxyXG4gICAgcmV0dXJuIG5ldyBRdWFkcmF0aWMoIGdhbW1hLCBiZXRhLnRpbWVzU2NhbGFyKCAwLjUgKS5wbHVzKCBnYW1tYSApLCBhbHBoYS5wbHVzKCBiZXRhICkucGx1cyggZ2FtbWEgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHJldmVyc2VkIGNvcHkgb2YgdGhpcyBzZWdtZW50IChtYXBwaW5nIHRoZSBwYXJhbWV0cml6YXRpb24gZnJvbSBbMCwxXSA9PiBbMSwwXSkuXHJcbiAgICovXHJcbiAgcHVibGljIHJldmVyc2VkKCk6IFF1YWRyYXRpYyB7XHJcbiAgICByZXR1cm4gbmV3IFF1YWRyYXRpYyggdGhpcy5fZW5kLCB0aGlzLl9jb250cm9sLCB0aGlzLl9zdGFydCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cclxuICAgKi9cclxuICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRRdWFkcmF0aWMge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogJ1F1YWRyYXRpYycsXHJcbiAgICAgIHN0YXJ0WDogdGhpcy5fc3RhcnQueCxcclxuICAgICAgc3RhcnRZOiB0aGlzLl9zdGFydC55LFxyXG4gICAgICBjb250cm9sWDogdGhpcy5fY29udHJvbC54LFxyXG4gICAgICBjb250cm9sWTogdGhpcy5fY29udHJvbC55LFxyXG4gICAgICBlbmRYOiB0aGlzLl9lbmQueCxcclxuICAgICAgZW5kWTogdGhpcy5fZW5kLnlcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgd2hldGhlciB0d28gbGluZXMgb3ZlcmxhcCBvdmVyIGEgY29udGludW91cyBzZWN0aW9uLCBhbmQgaWYgc28gZmluZHMgdGhlIGEsYiBwYWlyIHN1Y2ggdGhhdFxyXG4gICAqIHAoIHQgKSA9PT0gcSggYSAqIHQgKyBiICkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc2VnbWVudFxyXG4gICAqIEBwYXJhbSBbZXBzaWxvbl0gLSBXaWxsIHJldHVybiBvdmVybGFwcyBvbmx5IGlmIG5vIHR3byBjb3JyZXNwb25kaW5nIHBvaW50cyBkaWZmZXIgYnkgdGhpcyBhbW91bnQgb3IgbW9yZSBpbiBvbmUgY29tcG9uZW50LlxyXG4gICAqIEByZXR1cm5zIC0gVGhlIHNvbHV0aW9uLCBpZiB0aGVyZSBpcyBvbmUgKGFuZCBvbmx5IG9uZSlcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0T3ZlcmxhcHMoIHNlZ21lbnQ6IFNlZ21lbnQsIGVwc2lsb24gPSAxZS02ICk6IE92ZXJsYXBbXSB8IG51bGwge1xyXG4gICAgaWYgKCBzZWdtZW50IGluc3RhbmNlb2YgUXVhZHJhdGljICkge1xyXG4gICAgICByZXR1cm4gUXVhZHJhdGljLmdldE92ZXJsYXBzKCB0aGlzLCBzZWdtZW50ICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgUXVhZHJhdGljIGZyb20gdGhlIHNlcmlhbGl6ZWQgcmVwcmVzZW50YXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBvdmVycmlkZSBkZXNlcmlhbGl6ZSggb2JqOiBTZXJpYWxpemVkUXVhZHJhdGljICk6IFF1YWRyYXRpYyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvYmoudHlwZSA9PT0gJ1F1YWRyYXRpYycgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFF1YWRyYXRpYyggbmV3IFZlY3RvcjIoIG9iai5zdGFydFgsIG9iai5zdGFydFkgKSwgbmV3IFZlY3RvcjIoIG9iai5jb250cm9sWCwgb2JqLmNvbnRyb2xZICksIG5ldyBWZWN0b3IyKCBvYmouZW5kWCwgb2JqLmVuZFkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT25lLWRpbWVuc2lvbmFsIHNvbHV0aW9uIHRvIGV4dHJlbWFcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGV4dHJlbWFUKCBzdGFydDogbnVtYmVyLCBjb250cm9sOiBudW1iZXIsIGVuZDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICAvLyBjb21wdXRlIHQgd2hlcmUgdGhlIGRlcml2YXRpdmUgaXMgMCAodXNlZCBmb3IgYm91bmRzIGFuZCBvdGhlciB0aGluZ3MpXHJcbiAgICBjb25zdCBkaXZpc29yWCA9IDIgKiAoIGVuZCAtIDIgKiBjb250cm9sICsgc3RhcnQgKTtcclxuICAgIGlmICggZGl2aXNvclggIT09IDAgKSB7XHJcbiAgICAgIHJldHVybiAtMiAqICggY29udHJvbCAtIHN0YXJ0ICkgLyBkaXZpc29yWDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gTmFOO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lIHdoZXRoZXIgdHdvIFF1YWRyYXRpY3Mgb3ZlcmxhcCBvdmVyIGEgY29udGludW91cyBzZWN0aW9uLCBhbmQgaWYgc28gZmluZHMgdGhlIGEsYiBwYWlyIHN1Y2ggdGhhdFxyXG4gICAqIHAoIHQgKSA9PT0gcSggYSAqIHQgKyBiICkuXHJcbiAgICpcclxuICAgKiBOT1RFOiBmb3IgdGhpcyBwYXJ0aWN1bGFyIGZ1bmN0aW9uLCB3ZSBhc3N1bWUgd2UncmUgbm90IGRlZ2VuZXJhdGUuIFRoaW5ncyBtYXkgd29yayBpZiB3ZSBjYW4gYmUgZGVncmVlLXJlZHVjZWRcclxuICAgKiB0byBhIHF1YWRyYXRpYywgYnV0IGdlbmVyYWxseSB0aGF0IHNob3VsZG4ndCBiZSBkb25lLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHF1YWRyYXRpYzFcclxuICAgKiBAcGFyYW0gcXVhZHJhdGljMlxyXG4gICAqIEBwYXJhbSBbZXBzaWxvbl0gLSBXaWxsIHJldHVybiBvdmVybGFwcyBvbmx5IGlmIG5vIHR3byBjb3JyZXNwb25kaW5nIHBvaW50cyBkaWZmZXIgYnkgdGhpcyBhbW91bnQgb3IgbW9yZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbiBvbmUgY29tcG9uZW50LlxyXG4gICAqIEByZXR1cm5zIC0gVGhlIHNvbHV0aW9uLCBpZiB0aGVyZSBpcyBvbmUgKGFuZCBvbmx5IG9uZSlcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldE92ZXJsYXBzKCBxdWFkcmF0aWMxOiBRdWFkcmF0aWMsIHF1YWRyYXRpYzI6IFF1YWRyYXRpYywgZXBzaWxvbiA9IDFlLTYgKTogT3ZlcmxhcFtdIHtcclxuXHJcbiAgICAvKlxyXG4gICAgICogTk9URTogRm9yIGltcGxlbWVudGF0aW9uIGRldGFpbHMgaW4gdGhpcyBmdW5jdGlvbiwgcGxlYXNlIHNlZSBDdWJpYy5nZXRPdmVybGFwcy4gSXQgZ29lcyBvdmVyIGFsbCBvZiB0aGVcclxuICAgICAqIHNhbWUgaW1wbGVtZW50YXRpb24gZGV0YWlscywgYnV0IGluc3RlYWQgb3VyIGJlemllciBtYXRyaXggaXMgYSAzeDM6XHJcbiAgICAgKlxyXG4gICAgICogWyAgMSAgMCAgMCBdXHJcbiAgICAgKiBbIC0yICAyICAwIF1cclxuICAgICAqIFsgIDEgLTIgIDEgXVxyXG4gICAgICpcclxuICAgICAqIEFuZCB3ZSB1c2UgdGhlIHVwcGVyLWxlZnQgc2VjdGlvbiBvZiAoYXQrYikgYWRqdXN0bWVudCBtYXRyaXggcmVsZXZhbnQgZm9yIHRoZSBxdWFkcmF0aWMuXHJcbiAgICAgKi9cclxuXHJcbiAgICBjb25zdCBub092ZXJsYXA6IE92ZXJsYXBbXSA9IFtdO1xyXG5cclxuICAgIC8vIEVmZmljaWVudGx5IGNvbXB1dGUgdGhlIG11bHRpcGxpY2F0aW9uIG9mIHRoZSBiZXppZXIgbWF0cml4OlxyXG4gICAgY29uc3QgcDB4ID0gcXVhZHJhdGljMS5fc3RhcnQueDtcclxuICAgIGNvbnN0IHAxeCA9IC0yICogcXVhZHJhdGljMS5fc3RhcnQueCArIDIgKiBxdWFkcmF0aWMxLl9jb250cm9sLng7XHJcbiAgICBjb25zdCBwMnggPSBxdWFkcmF0aWMxLl9zdGFydC54IC0gMiAqIHF1YWRyYXRpYzEuX2NvbnRyb2wueCArIHF1YWRyYXRpYzEuX2VuZC54O1xyXG4gICAgY29uc3QgcDB5ID0gcXVhZHJhdGljMS5fc3RhcnQueTtcclxuICAgIGNvbnN0IHAxeSA9IC0yICogcXVhZHJhdGljMS5fc3RhcnQueSArIDIgKiBxdWFkcmF0aWMxLl9jb250cm9sLnk7XHJcbiAgICBjb25zdCBwMnkgPSBxdWFkcmF0aWMxLl9zdGFydC55IC0gMiAqIHF1YWRyYXRpYzEuX2NvbnRyb2wueSArIHF1YWRyYXRpYzEuX2VuZC55O1xyXG4gICAgY29uc3QgcTB4ID0gcXVhZHJhdGljMi5fc3RhcnQueDtcclxuICAgIGNvbnN0IHExeCA9IC0yICogcXVhZHJhdGljMi5fc3RhcnQueCArIDIgKiBxdWFkcmF0aWMyLl9jb250cm9sLng7XHJcbiAgICBjb25zdCBxMnggPSBxdWFkcmF0aWMyLl9zdGFydC54IC0gMiAqIHF1YWRyYXRpYzIuX2NvbnRyb2wueCArIHF1YWRyYXRpYzIuX2VuZC54O1xyXG4gICAgY29uc3QgcTB5ID0gcXVhZHJhdGljMi5fc3RhcnQueTtcclxuICAgIGNvbnN0IHExeSA9IC0yICogcXVhZHJhdGljMi5fc3RhcnQueSArIDIgKiBxdWFkcmF0aWMyLl9jb250cm9sLnk7XHJcbiAgICBjb25zdCBxMnkgPSBxdWFkcmF0aWMyLl9zdGFydC55IC0gMiAqIHF1YWRyYXRpYzIuX2NvbnRyb2wueSArIHF1YWRyYXRpYzIuX2VuZC55O1xyXG5cclxuICAgIC8vIERldGVybWluZSB0aGUgY2FuZGlkYXRlIG92ZXJsYXAgKHByZWZlcnJpbmcgdGhlIGRpbWVuc2lvbiB3aXRoIHRoZSBsYXJnZXN0IHZhcmlhdGlvbilcclxuICAgIGNvbnN0IHhTcHJlYWQgPSBNYXRoLmFicyggTWF0aC5tYXgoIHF1YWRyYXRpYzEuX3N0YXJ0LngsIHF1YWRyYXRpYzEuX2NvbnRyb2wueCwgcXVhZHJhdGljMS5fZW5kLngsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhZHJhdGljMi5fc3RhcnQueCwgcXVhZHJhdGljMi5fY29udHJvbC54LCBxdWFkcmF0aWMyLl9lbmQueCApIC1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5taW4oIHF1YWRyYXRpYzEuX3N0YXJ0LngsIHF1YWRyYXRpYzEuX2NvbnRyb2wueCwgcXVhZHJhdGljMS5fZW5kLngsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhZHJhdGljMi5fc3RhcnQueCwgcXVhZHJhdGljMi5fY29udHJvbC54LCBxdWFkcmF0aWMyLl9lbmQueCApICk7XHJcbiAgICBjb25zdCB5U3ByZWFkID0gTWF0aC5hYnMoIE1hdGgubWF4KCBxdWFkcmF0aWMxLl9zdGFydC55LCBxdWFkcmF0aWMxLl9jb250cm9sLnksIHF1YWRyYXRpYzEuX2VuZC55LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1YWRyYXRpYzIuX3N0YXJ0LnksIHF1YWRyYXRpYzIuX2NvbnRyb2wueSwgcXVhZHJhdGljMi5fZW5kLnkgKSAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgubWluKCBxdWFkcmF0aWMxLl9zdGFydC55LCBxdWFkcmF0aWMxLl9jb250cm9sLnksIHF1YWRyYXRpYzEuX2VuZC55LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1YWRyYXRpYzIuX3N0YXJ0LnksIHF1YWRyYXRpYzIuX2NvbnRyb2wueSwgcXVhZHJhdGljMi5fZW5kLnkgKSApO1xyXG4gICAgY29uc3QgeE92ZXJsYXAgPSBTZWdtZW50LnBvbHlub21pYWxHZXRPdmVybGFwUXVhZHJhdGljKCBwMHgsIHAxeCwgcDJ4LCBxMHgsIHExeCwgcTJ4ICk7XHJcbiAgICBjb25zdCB5T3ZlcmxhcCA9IFNlZ21lbnQucG9seW5vbWlhbEdldE92ZXJsYXBRdWFkcmF0aWMoIHAweSwgcDF5LCBwMnksIHEweSwgcTF5LCBxMnkgKTtcclxuICAgIGxldCBvdmVybGFwO1xyXG4gICAgaWYgKCB4U3ByZWFkID4geVNwcmVhZCApIHtcclxuICAgICAgb3ZlcmxhcCA9ICggeE92ZXJsYXAgPT09IG51bGwgfHwgeE92ZXJsYXAgPT09IHRydWUgKSA/IHlPdmVybGFwIDogeE92ZXJsYXA7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgb3ZlcmxhcCA9ICggeU92ZXJsYXAgPT09IG51bGwgfHwgeU92ZXJsYXAgPT09IHRydWUgKSA/IHhPdmVybGFwIDogeU92ZXJsYXA7XHJcbiAgICB9XHJcbiAgICBpZiAoIG92ZXJsYXAgPT09IG51bGwgfHwgb3ZlcmxhcCA9PT0gdHJ1ZSApIHtcclxuICAgICAgcmV0dXJuIG5vT3ZlcmxhcDsgLy8gTm8gd2F5IHRvIHBpbiBkb3duIGFuIG92ZXJsYXBcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhID0gb3ZlcmxhcC5hO1xyXG4gICAgY29uc3QgYiA9IG92ZXJsYXAuYjtcclxuXHJcbiAgICBjb25zdCBhYSA9IGEgKiBhO1xyXG4gICAgY29uc3QgYmIgPSBiICogYjtcclxuICAgIGNvbnN0IGFiMiA9IDIgKiBhICogYjtcclxuXHJcbiAgICAvLyBDb21wdXRlIHF1YWRyYXRpYyBjb2VmZmljaWVudHMgZm9yIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gcCh0KSBhbmQgcShhKnQrYilcclxuICAgIGNvbnN0IGQweCA9IHEweCArIGIgKiBxMXggKyBiYiAqIHEyeCAtIHAweDtcclxuICAgIGNvbnN0IGQxeCA9IGEgKiBxMXggKyBhYjIgKiBxMnggLSBwMXg7XHJcbiAgICBjb25zdCBkMnggPSBhYSAqIHEyeCAtIHAyeDtcclxuICAgIGNvbnN0IGQweSA9IHEweSArIGIgKiBxMXkgKyBiYiAqIHEyeSAtIHAweTtcclxuICAgIGNvbnN0IGQxeSA9IGEgKiBxMXkgKyBhYjIgKiBxMnkgLSBwMXk7XHJcbiAgICBjb25zdCBkMnkgPSBhYSAqIHEyeSAtIHAyeTtcclxuXHJcbiAgICAvLyBGaW5kIHRoZSB0IHZhbHVlcyB3aGVyZSBleHRyZW1lcyBsaWUgaW4gdGhlIFswLDFdIHJhbmdlIGZvciBlYWNoIDEtZGltZW5zaW9uYWwgcXVhZHJhdGljLiBXZSBkbyB0aGlzIGJ5XHJcbiAgICAvLyBkaWZmZXJlbnRpYXRpbmcgdGhlIHF1YWRyYXRpYyBhbmQgZmluZGluZyB0aGUgcm9vdHMgb2YgdGhlIHJlc3VsdGluZyBsaW5lLlxyXG4gICAgY29uc3QgeFJvb3RzID0gVXRpbHMuc29sdmVMaW5lYXJSb290c1JlYWwoIDIgKiBkMngsIGQxeCApO1xyXG4gICAgY29uc3QgeVJvb3RzID0gVXRpbHMuc29sdmVMaW5lYXJSb290c1JlYWwoIDIgKiBkMnksIGQxeSApO1xyXG4gICAgY29uc3QgeEV4dHJlbWVUcyA9IF8udW5pcSggWyAwLCAxIF0uY29uY2F0KCB4Um9vdHMgPyB4Um9vdHMuZmlsdGVyKCBpc0JldHdlZW4wQW5kMSApIDogW10gKSApO1xyXG4gICAgY29uc3QgeUV4dHJlbWVUcyA9IF8udW5pcSggWyAwLCAxIF0uY29uY2F0KCB5Um9vdHMgPyB5Um9vdHMuZmlsdGVyKCBpc0JldHdlZW4wQW5kMSApIDogW10gKSApO1xyXG5cclxuICAgIC8vIEV4YW1pbmUgdGhlIHNpbmdsZS1jb29yZGluYXRlIGRpc3RhbmNlcyBiZXR3ZWVuIHRoZSBcIm92ZXJsYXBzXCIgYXQgZWFjaCBleHRyZW1lIFQgdmFsdWUuIElmIHRoZSBkaXN0YW5jZSBpcyBsYXJnZXJcclxuICAgIC8vIHRoYW4gb3VyIGVwc2lsb24sIHRoZW4gdGhlIFwib3ZlcmxhcFwiIHdvdWxkIG5vdCBiZSB2YWxpZC5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHhFeHRyZW1lVHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHQgPSB4RXh0cmVtZVRzWyBpIF07XHJcbiAgICAgIGlmICggTWF0aC5hYnMoICggZDJ4ICogdCArIGQxeCApICogdCArIGQweCApID4gZXBzaWxvbiApIHtcclxuICAgICAgICByZXR1cm4gbm9PdmVybGFwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB5RXh0cmVtZVRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB0ID0geUV4dHJlbWVUc1sgaSBdO1xyXG4gICAgICBpZiAoIE1hdGguYWJzKCAoIGQyeSAqIHQgKyBkMXkgKSAqIHQgKyBkMHkgKSA+IGVwc2lsb24gKSB7XHJcbiAgICAgICAgcmV0dXJuIG5vT3ZlcmxhcDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHF0MCA9IGI7XHJcbiAgICBjb25zdCBxdDEgPSBhICsgYjtcclxuXHJcbiAgICAvLyBUT0RPOiBkbyB3ZSB3YW50IGFuIGVwc2lsb24gaW4gaGVyZSB0byBiZSBwZXJtaXNzaXZlP1xyXG4gICAgaWYgKCAoIHF0MCA+IDEgJiYgcXQxID4gMSApIHx8ICggcXQwIDwgMCAmJiBxdDEgPCAwICkgKSB7XHJcbiAgICAgIHJldHVybiBub092ZXJsYXA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFsgbmV3IE92ZXJsYXAoIGEsIGIgKSBdO1xyXG4gIH1cclxuXHJcbiAgLy8gRGVncmVlIG9mIHRoZSBwb2x5bm9taWFsIChxdWFkcmF0aWMpXHJcbiAgcHVibGljIGRlZ3JlZSE6IG51bWJlcjtcclxufVxyXG5cclxuUXVhZHJhdGljLnByb3RvdHlwZS5kZWdyZWUgPSAyO1xyXG5cclxua2l0ZS5yZWdpc3RlciggJ1F1YWRyYXRpYycsIFF1YWRyYXRpYyApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFD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