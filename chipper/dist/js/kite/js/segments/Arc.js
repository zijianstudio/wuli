// Copyright 2013-2022, University of Colorado Boulder

/**
 * A circular arc (a continuous sub-part of a circle).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { EllipticalArc, kite, Line, Overlap, RayIntersection, Segment, SegmentIntersection, svgNumber } from '../imports.js';

// TODO: See if we should use this more
const TWO_PI = Math.PI * 2;
export default class Arc extends Segment {
  // Lazily-computed derived information

  // End angle in relation to our start angle (can get remapped)
  // Whether it's a full circle (and not just an arc)

  /**
   * If the startAngle/endAngle difference is ~2pi, this will be a full circle
   *
   * See http://www.w3.org/TR/2dcontext/#dom-context-2d-arc for detailed information on the parameters.
   *
   * @param center - Center of the arc (every point on the arc is equally far from the center)
   * @param radius - How far from the center the arc will be
   * @param startAngle - Angle (radians) of the start of the arc
   * @param endAngle - Angle (radians) of the end of the arc
   * @param anticlockwise - Decides which direction the arc takes around the center
   */
  constructor(center, radius, startAngle, endAngle, anticlockwise) {
    super();
    this._center = center;
    this._radius = radius;
    this._startAngle = startAngle;
    this._endAngle = endAngle;
    this._anticlockwise = anticlockwise;
    this.invalidate();
  }

  /**
   * Sets the center of the Arc.
   */
  setCenter(center) {
    assert && assert(center.isFinite(), `Arc center should be finite: ${center.toString()}`);
    if (!this._center.equals(center)) {
      this._center = center;
      this.invalidate();
    }
    return this; // allow chaining
  }

  set center(value) {
    this.setCenter(value);
  }
  get center() {
    return this.getCenter();
  }

  /**
   * Returns the center of this Arc.
   */
  getCenter() {
    return this._center;
  }

  /**
   * Sets the radius of the Arc.
   */
  setRadius(radius) {
    assert && assert(isFinite(radius), `Arc radius should be a finite number: ${radius}`);
    if (this._radius !== radius) {
      this._radius = radius;
      this.invalidate();
    }
    return this; // allow chaining
  }

  set radius(value) {
    this.setRadius(value);
  }
  get radius() {
    return this.getRadius();
  }

  /**
   * Returns the radius of this Arc.
   */
  getRadius() {
    return this._radius;
  }

  /**
   * Sets the startAngle of the Arc.
   */
  setStartAngle(startAngle) {
    assert && assert(isFinite(startAngle), `Arc startAngle should be a finite number: ${startAngle}`);
    if (this._startAngle !== startAngle) {
      this._startAngle = startAngle;
      this.invalidate();
    }
    return this; // allow chaining
  }

  set startAngle(value) {
    this.setStartAngle(value);
  }
  get startAngle() {
    return this.getStartAngle();
  }

  /**
   * Returns the startAngle of this Arc.
   */
  getStartAngle() {
    return this._startAngle;
  }

  /**
   * Sets the endAngle of the Arc.
   */
  setEndAngle(endAngle) {
    assert && assert(isFinite(endAngle), `Arc endAngle should be a finite number: ${endAngle}`);
    if (this._endAngle !== endAngle) {
      this._endAngle = endAngle;
      this.invalidate();
    }
    return this; // allow chaining
  }

  set endAngle(value) {
    this.setEndAngle(value);
  }
  get endAngle() {
    return this.getEndAngle();
  }

  /**
   * Returns the endAngle of this Arc.
   */
  getEndAngle() {
    return this._endAngle;
  }

  /**
   * Sets the anticlockwise of the Arc.
   */
  setAnticlockwise(anticlockwise) {
    if (this._anticlockwise !== anticlockwise) {
      this._anticlockwise = anticlockwise;
      this.invalidate();
    }
    return this; // allow chaining
  }

  set anticlockwise(value) {
    this.setAnticlockwise(value);
  }
  get anticlockwise() {
    return this.getAnticlockwise();
  }

  /**
   * Returns the anticlockwise of this Arc.
   */
  getAnticlockwise() {
    return this._anticlockwise;
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
    return this.positionAtAngle(this.angleAt(t));
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
    return this.tangentAtAngle(this.angleAt(t));
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

    // Since it is an arc of as circle, the curvature is independent of t
    return (this._anticlockwise ? -1 : 1) / this._radius;
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

    // TODO: verify that we don't need to switch anticlockwise here, or subtract 2pi off any angles
    const angle0 = this.angleAt(0);
    const angleT = this.angleAt(t);
    const angle1 = this.angleAt(1);
    return [new Arc(this._center, this._radius, angle0, angleT, this._anticlockwise), new Arc(this._center, this._radius, angleT, angle1, this._anticlockwise)];
  }

  /**
   * Clears cached information, should be called when any of the 'constructor arguments' are mutated.
   */
  invalidate() {
    this._start = null;
    this._end = null;
    this._startTangent = null;
    this._endTangent = null;
    this._actualEndAngle = null;
    this._isFullPerimeter = null;
    this._angleDifference = null;
    this._bounds = null;
    this._svgPathFragment = null;
    assert && assert(this._center instanceof Vector2, 'Arc center should be a Vector2');
    assert && assert(this._center.isFinite(), 'Arc center should be finite (not NaN or infinite)');
    assert && assert(typeof this._radius === 'number', `Arc radius should be a number: ${this._radius}`);
    assert && assert(isFinite(this._radius), `Arc radius should be a finite number: ${this._radius}`);
    assert && assert(typeof this._startAngle === 'number', `Arc startAngle should be a number: ${this._startAngle}`);
    assert && assert(isFinite(this._startAngle), `Arc startAngle should be a finite number: ${this._startAngle}`);
    assert && assert(typeof this._endAngle === 'number', `Arc endAngle should be a number: ${this._endAngle}`);
    assert && assert(isFinite(this._endAngle), `Arc endAngle should be a finite number: ${this._endAngle}`);
    assert && assert(typeof this._anticlockwise === 'boolean', `Arc anticlockwise should be a boolean: ${this._anticlockwise}`);

    // Remap negative radius to a positive radius
    if (this._radius < 0) {
      // support this case since we might actually need to handle it inside of strokes?
      this._radius = -this._radius;
      this._startAngle += Math.PI;
      this._endAngle += Math.PI;
    }

    // Constraints that should always be satisfied
    assert && assert(!(!this.anticlockwise && this._endAngle - this._startAngle <= -Math.PI * 2 || this.anticlockwise && this._startAngle - this._endAngle <= -Math.PI * 2), 'Not handling arcs with start/end angles that show differences in-between browser handling');
    assert && assert(!(!this.anticlockwise && this._endAngle - this._startAngle > Math.PI * 2 || this.anticlockwise && this._startAngle - this._endAngle > Math.PI * 2), 'Not handling arcs with start/end angles that show differences in-between browser handling');
    this.invalidationEmitter.emit();
  }

  /**
   * Gets the start position of this arc.
   */
  getStart() {
    if (this._start === null) {
      this._start = this.positionAtAngle(this._startAngle);
    }
    return this._start;
  }
  get start() {
    return this.getStart();
  }

  /**
   * Gets the end position of this arc.
   */
  getEnd() {
    if (this._end === null) {
      this._end = this.positionAtAngle(this._endAngle);
    }
    return this._end;
  }
  get end() {
    return this.getEnd();
  }

  /**
   * Gets the unit vector tangent to this arc at the start point.
   */
  getStartTangent() {
    if (this._startTangent === null) {
      this._startTangent = this.tangentAtAngle(this._startAngle);
    }
    return this._startTangent;
  }
  get startTangent() {
    return this.getStartTangent();
  }

  /**
   * Gets the unit vector tangent to the arc at the end point.
   */
  getEndTangent() {
    if (this._endTangent === null) {
      this._endTangent = this.tangentAtAngle(this._endAngle);
    }
    return this._endTangent;
  }
  get endTangent() {
    return this.getEndTangent();
  }

  /**
   * Gets the end angle in radians.
   */
  getActualEndAngle() {
    if (this._actualEndAngle === null) {
      this._actualEndAngle = Arc.computeActualEndAngle(this._startAngle, this._endAngle, this._anticlockwise);
    }
    return this._actualEndAngle;
  }
  get actualEndAngle() {
    return this.getActualEndAngle();
  }

  /**
   * Returns a boolean value that indicates if the arc wraps up by more than two Pi.
   */
  getIsFullPerimeter() {
    if (this._isFullPerimeter === null) {
      this._isFullPerimeter = !this._anticlockwise && this._endAngle - this._startAngle >= Math.PI * 2 || this._anticlockwise && this._startAngle - this._endAngle >= Math.PI * 2;
    }
    return this._isFullPerimeter;
  }
  get isFullPerimeter() {
    return this.getIsFullPerimeter();
  }

  /**
   * Returns an angle difference that represents how "much" of the circle our arc covers.
   *
   * The answer is always greater or equal to zero
   * The answer can exceed two Pi
   */
  getAngleDifference() {
    if (this._angleDifference === null) {
      // compute an angle difference that represents how "much" of the circle our arc covers
      this._angleDifference = this._anticlockwise ? this._startAngle - this._endAngle : this._endAngle - this._startAngle;
      if (this._angleDifference < 0) {
        this._angleDifference += Math.PI * 2;
      }
      assert && assert(this._angleDifference >= 0); // now it should always be zero or positive
    }

    return this._angleDifference;
  }
  get angleDifference() {
    return this.getAngleDifference();
  }

  /**
   * Returns the bounds of this segment.
   */
  getBounds() {
    if (this._bounds === null) {
      // acceleration for intersection
      this._bounds = Bounds2.NOTHING.copy().withPoint(this.getStart()).withPoint(this.getEnd());

      // if the angles are different, check extrema points
      if (this._startAngle !== this._endAngle) {
        // check all of the extrema points
        this.includeBoundsAtAngle(0);
        this.includeBoundsAtAngle(Math.PI / 2);
        this.includeBoundsAtAngle(Math.PI);
        this.includeBoundsAtAngle(3 * Math.PI / 2);
      }
    }
    return this._bounds;
  }
  get bounds() {
    return this.getBounds();
  }

  /**
   * Returns a list of non-degenerate segments that are equivalent to this segment. Generally gets rid (or simplifies)
   * invalid or repeated segments.
   */
  getNondegenerateSegments() {
    if (this._radius <= 0 || this._startAngle === this._endAngle) {
      return [];
    } else {
      return [this]; // basically, Arcs aren't really degenerate that easily
    }
  }

  /**
   * Attempts to expand the private _bounds bounding box to include a point at a specific angle, making sure that
   * angle is actually included in the arc. This will presumably be called at angles that are at critical points,
   * where the arc should have maximum/minimum x/y values.
   */
  includeBoundsAtAngle(angle) {
    if (this.containsAngle(angle)) {
      // the boundary point is in the arc
      this._bounds = this._bounds.withPoint(this._center.plus(Vector2.createPolar(this._radius, angle)));
    }
  }

  /**
   * Maps a contained angle to between [startAngle,actualEndAngle), even if the end angle is lower.
   */
  mapAngle(angle) {
    if (Math.abs(Utils.moduloBetweenDown(angle - this._startAngle, -Math.PI, Math.PI)) < 1e-8) {
      return this._startAngle;
    }
    if (Math.abs(Utils.moduloBetweenDown(angle - this.getActualEndAngle(), -Math.PI, Math.PI)) < 1e-8) {
      return this.getActualEndAngle();
    }
    // consider an assert that we contain that angle?
    return this._startAngle > this.getActualEndAngle() ? Utils.moduloBetweenUp(angle, this._startAngle - 2 * Math.PI, this._startAngle) : Utils.moduloBetweenDown(angle, this._startAngle, this._startAngle + 2 * Math.PI);
  }

  /**
   * Returns the parametrized value t for a given angle. The value t should range from 0 to 1 (inclusive).
   */
  tAtAngle(angle) {
    const t = (this.mapAngle(angle) - this._startAngle) / (this.getActualEndAngle() - this._startAngle);
    assert && assert(t >= 0 && t <= 1, `tAtAngle out of range: ${t}`);
    return t;
  }

  /**
   * Returns the angle for the parametrized t value. The t value should range from 0 to 1 (inclusive).
   */
  angleAt(t) {
    //TODO: add asserts
    return this._startAngle + (this.getActualEndAngle() - this._startAngle) * t;
  }

  /**
   * Returns the position of this arc at angle.
   */
  positionAtAngle(angle) {
    return this._center.plus(Vector2.createPolar(this._radius, angle));
  }

  /**
   * Returns the normalized tangent of this arc.
   * The tangent points outward (inward) of this arc for clockwise (anticlockwise) direction.
   */
  tangentAtAngle(angle) {
    const normal = Vector2.createPolar(1, angle);
    return this._anticlockwise ? normal.perpendicular : normal.perpendicular.negated();
  }

  /**
   * Returns whether the given angle is contained by the arc (whether a ray from the arc's origin going in that angle
   * will intersect the arc).
   */
  containsAngle(angle) {
    // transform the angle into the appropriate coordinate form
    // TODO: check anticlockwise version!
    const normalizedAngle = this._anticlockwise ? angle - this._endAngle : angle - this._startAngle;

    // get the angle between 0 and 2pi
    const positiveMinAngle = Utils.moduloBetweenDown(normalizedAngle, 0, Math.PI * 2);
    return positiveMinAngle <= this.angleDifference;
  }

  /**
   * Returns a string containing the SVG path. assumes that the start point is already provided,
   * so anything that calls this needs to put the M calls first
   */
  getSVGPathFragment() {
    let oldPathFragment;
    if (assert) {
      oldPathFragment = this._svgPathFragment;
      this._svgPathFragment = null;
    }
    if (!this._svgPathFragment) {
      // see http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands for more info
      // rx ry x-axis-rotation large-arc-flag sweep-flag x y

      const epsilon = 0.01; // allow some leeway to render things as 'almost circles'
      const sweepFlag = this._anticlockwise ? '0' : '1';
      let largeArcFlag;
      if (this.angleDifference < Math.PI * 2 - epsilon) {
        largeArcFlag = this.angleDifference < Math.PI ? '0' : '1';
        this._svgPathFragment = `A ${svgNumber(this._radius)} ${svgNumber(this._radius)} 0 ${largeArcFlag} ${sweepFlag} ${svgNumber(this.end.x)} ${svgNumber(this.end.y)}`;
      } else {
        // circle (or almost-circle) case needs to be handled differently
        // since SVG will not be able to draw (or know how to draw) the correct circle if we just have a start and end, we need to split it into two circular arcs

        // get the angle that is between and opposite of both of the points
        const splitOppositeAngle = (this._startAngle + this._endAngle) / 2; // this _should_ work for the modular case?
        const splitPoint = this._center.plus(Vector2.createPolar(this._radius, splitOppositeAngle));
        largeArcFlag = '0'; // since we split it in 2, it's always the small arc

        const firstArc = `A ${svgNumber(this._radius)} ${svgNumber(this._radius)} 0 ${largeArcFlag} ${sweepFlag} ${svgNumber(splitPoint.x)} ${svgNumber(splitPoint.y)}`;
        const secondArc = `A ${svgNumber(this._radius)} ${svgNumber(this._radius)} 0 ${largeArcFlag} ${sweepFlag} ${svgNumber(this.end.x)} ${svgNumber(this.end.y)}`;
        this._svgPathFragment = `${firstArc} ${secondArc}`;
      }
    }
    if (assert) {
      if (oldPathFragment) {
        assert(oldPathFragment === this._svgPathFragment, 'Quadratic line segment changed without invalidate()');
      }
    }
    return this._svgPathFragment;
  }

  /**
   * Returns an array of arcs that will draw an offset on the logical left side
   */
  strokeLeft(lineWidth) {
    return [new Arc(this._center, this._radius + (this._anticlockwise ? 1 : -1) * lineWidth / 2, this._startAngle, this._endAngle, this._anticlockwise)];
  }

  /**
   * Returns an array of arcs that will draw an offset curve on the logical right side
   */
  strokeRight(lineWidth) {
    return [new Arc(this._center, this._radius + (this._anticlockwise ? -1 : 1) * lineWidth / 2, this._endAngle, this._startAngle, !this._anticlockwise)];
  }

  /**
   * Returns a list of t values where dx/dt or dy/dt is 0 where 0 < t < 1. subdividing on these will result in monotonic segments
   * Does not include t=0 and t=1
   */
  getInteriorExtremaTs() {
    const result = [];
    _.each([0, Math.PI / 2, Math.PI, 3 * Math.PI / 2], angle => {
      if (this.containsAngle(angle)) {
        const t = this.tAtAngle(angle);
        const epsilon = 0.0000000001; // TODO: general kite epsilon?, also do 1e-Number format
        if (t > epsilon && t < 1 - epsilon) {
          result.push(t);
        }
      }
    });
    return result.sort(); // modifies original, which is OK
  }

  /**
   * Hit-tests this segment with the ray. An array of all intersections of the ray with this segment will be returned.
   * For details, see the documentation in Segment.js
   */
  intersection(ray) {
    const result = []; // hits in order

    // left here, if in the future we want to better-handle boundary points
    const epsilon = 0;

    // Run a general circle-intersection routine, then we can test the angles later.
    // Solves for the two solutions t such that ray.position + ray.direction * t is on the circle.
    // Then we check whether the angle at each possible hit point is in our arc.
    const centerToRay = ray.position.minus(this._center);
    const tmp = ray.direction.dot(centerToRay);
    const centerToRayDistSq = centerToRay.magnitudeSquared;
    const discriminant = 4 * tmp * tmp - 4 * (centerToRayDistSq - this._radius * this._radius);
    if (discriminant < epsilon) {
      // ray misses circle entirely
      return result;
    }
    const base = ray.direction.dot(this._center) - ray.direction.dot(ray.position);
    const sqt = Math.sqrt(discriminant) / 2;
    const ta = base - sqt;
    const tb = base + sqt;
    if (tb < epsilon) {
      // circle is behind ray
      return result;
    }
    const pointB = ray.pointAtDistance(tb);
    const normalB = pointB.minus(this._center).normalized();
    const normalBAngle = normalB.angle;
    if (ta < epsilon) {
      // we are inside the circle, so only one intersection is possible
      if (this.containsAngle(normalBAngle)) {
        // normal is towards the ray, so we negate it. also winds opposite way
        result.push(new RayIntersection(tb, pointB, normalB.negated(), this._anticlockwise ? -1 : 1, this.tAtAngle(normalBAngle)));
      }
    } else {
      // two possible hits (outside circle)
      const pointA = ray.pointAtDistance(ta);
      const normalA = pointA.minus(this._center).normalized();
      const normalAAngle = normalA.angle;
      if (this.containsAngle(normalAAngle)) {
        // hit from outside
        result.push(new RayIntersection(ta, pointA, normalA, this._anticlockwise ? 1 : -1, this.tAtAngle(normalAAngle)));
      }
      if (this.containsAngle(normalBAngle)) {
        result.push(new RayIntersection(tb, pointB, normalB.negated(), this._anticlockwise ? -1 : 1, this.tAtAngle(normalBAngle)));
      }
    }
    return result;
  }

  /**
   * Returns the resultant winding number of this ray intersecting this arc.
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
   * Draws this arc to the 2D Canvas context, assuming the context's current location is already at the start point
   */
  writeToContext(context) {
    context.arc(this._center.x, this._center.y, this._radius, this._startAngle, this._endAngle, this._anticlockwise);
  }

  /**
   * Returns a new copy of this arc, transformed by the given matrix.
   *
   * TODO: test various transform types, especially rotations, scaling, shears, etc.
   */
  transformed(matrix) {
    // so we can handle reflections in the transform, we do the general case handling for start/end angles
    const startAngle = matrix.timesVector2(Vector2.createPolar(1, this._startAngle)).minus(matrix.timesVector2(Vector2.ZERO)).angle;
    let endAngle = matrix.timesVector2(Vector2.createPolar(1, this._endAngle)).minus(matrix.timesVector2(Vector2.ZERO)).angle;

    // reverse the 'clockwiseness' if our transform includes a reflection
    const anticlockwise = matrix.getDeterminant() >= 0 ? this._anticlockwise : !this._anticlockwise;
    if (Math.abs(this._endAngle - this._startAngle) === Math.PI * 2) {
      endAngle = anticlockwise ? startAngle - Math.PI * 2 : startAngle + Math.PI * 2;
    }
    const scaleVector = matrix.getScaleVector();
    if (scaleVector.x !== scaleVector.y) {
      const radiusX = scaleVector.x * this._radius;
      const radiusY = scaleVector.y * this._radius;
      return new EllipticalArc(matrix.timesVector2(this._center), radiusX, radiusY, 0, startAngle, endAngle, anticlockwise);
    } else {
      const radius = scaleVector.x * this._radius;
      return new Arc(matrix.timesVector2(this._center), radius, startAngle, endAngle, anticlockwise);
    }
  }

  /**
   * Returns the contribution to the signed area computed using Green's Theorem, with P=-y/2 and Q=x/2.
   *
   * NOTE: This is this segment's contribution to the line integral (-y/2 dx + x/2 dy).
   */
  getSignedAreaFragment() {
    const t0 = this._startAngle;
    const t1 = this.getActualEndAngle();

    // Derived via Mathematica (curve-area.nb)
    return 0.5 * this._radius * (this._radius * (t1 - t0) + this._center.x * (Math.sin(t1) - Math.sin(t0)) - this._center.y * (Math.cos(t1) - Math.cos(t0)));
  }

  /**
   * Returns a reversed copy of this segment (mapping the parametrization from [0,1] => [1,0]).
   */
  reversed() {
    return new Arc(this._center, this._radius, this._endAngle, this._startAngle, !this._anticlockwise);
  }

  /**
   * Returns the arc length of the segment.
   */
  getArcLength() {
    return this.getAngleDifference() * this._radius;
  }

  /**
   * We can handle this simply by returning ourselves.
   */
  toPiecewiseLinearOrArcSegments() {
    return [this];
  }

  /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   */
  serialize() {
    return {
      type: 'Arc',
      centerX: this._center.x,
      centerY: this._center.y,
      radius: this._radius,
      startAngle: this._startAngle,
      endAngle: this._endAngle,
      anticlockwise: this._anticlockwise
    };
  }

  /**
   * Determine whether two lines overlap over a continuous section, and if so finds the a,b pair such that
   * p( t ) === q( a * t + b ).
   *
   * @param segment
   * @param [epsilon] - Will return overlaps only if no two corresponding points differ by this amount or more
   *                             in one component.
   * @returns - The solution, if there is one (and only one)
   */
  getOverlaps(segment, epsilon = 1e-6) {
    if (segment instanceof Arc) {
      return Arc.getOverlaps(this, segment);
    }
    return null;
  }

  /**
   * Returns an Arc from the serialized representation.
   */
  static deserialize(obj) {
    assert && assert(obj.type === 'Arc');
    return new Arc(new Vector2(obj.centerX, obj.centerY), obj.radius, obj.startAngle, obj.endAngle, obj.anticlockwise);
  }

  /**
   * Determines the actual end angle (compared to the start angle).
   *
   * Normalizes the sign of the angles, so that the sign of ( endAngle - startAngle ) matches whether it is
   * anticlockwise.
   */
  static computeActualEndAngle(startAngle, endAngle, anticlockwise) {
    if (anticlockwise) {
      // angle is 'decreasing'
      // -2pi <= end - start < 2pi
      if (startAngle > endAngle) {
        return endAngle;
      } else if (startAngle < endAngle) {
        return endAngle - 2 * Math.PI;
      } else {
        // equal
        return startAngle;
      }
    } else {
      // angle is 'increasing'
      // -2pi < end - start <= 2pi
      if (startAngle < endAngle) {
        return endAngle;
      } else if (startAngle > endAngle) {
        return endAngle + Math.PI * 2;
      } else {
        // equal
        return startAngle;
      }
    }
  }

  /**
   * Computes the potential overlap between [0,end1] and [start2,end2] (with t-values [0,1] and [tStart2,tEnd2]).
   *
   * @param end1 - Relative end angle of the first segment
   * @param start2 - Relative start angle of the second segment
   * @param end2 - Relative end angle of the second segment
   * @param tStart2 - The parametric value of the second segment's start
   * @param tEnd2 - The parametric value of the second segment's end
   */
  static getPartialOverlap(end1, start2, end2, tStart2, tEnd2) {
    assert && assert(end1 > 0 && end1 <= TWO_PI + 1e-10);
    assert && assert(start2 >= 0 && start2 < TWO_PI + 1e-10);
    assert && assert(end2 >= 0 && end2 <= TWO_PI + 1e-10);
    assert && assert(tStart2 >= 0 && tStart2 <= 1);
    assert && assert(tEnd2 >= 0 && tEnd2 <= 1);
    const reversed2 = end2 < start2;
    const min2 = reversed2 ? end2 : start2;
    const max2 = reversed2 ? start2 : end2;
    const overlapMin = min2;
    const overlapMax = Math.min(end1, max2);

    // If there's not a small amount of overlap
    if (overlapMax < overlapMin + 1e-8) {
      return [];
    } else {
      return [Overlap.createLinear(
      // minimum
      Utils.clamp(Utils.linear(0, end1, 0, 1, overlapMin), 0, 1),
      // arc1 min
      Utils.clamp(Utils.linear(start2, end2, tStart2, tEnd2, overlapMin), 0, 1),
      // arc2 min
      // maximum
      Utils.clamp(Utils.linear(0, end1, 0, 1, overlapMax), 0, 1),
      // arc1 max
      Utils.clamp(Utils.linear(start2, end2, tStart2, tEnd2, overlapMax), 0, 1) // arc2 max
      )];
    }
  }

  /**
   * Determine whether two Arcs overlap over continuous sections, and if so finds the a,b pairs such that
   * p( t ) === q( a * t + b ).
   *
   * @param startAngle1 - Start angle of arc 1
   * @param endAngle1 - "Actual" end angle of arc 1
   * @param startAngle2 - Start angle of arc 2
   * @param endAngle2 - "Actual" end angle of arc 2
   * @returns - Any overlaps (from 0 to 2)
   */
  static getAngularOverlaps(startAngle1, endAngle1, startAngle2, endAngle2) {
    assert && assert(isFinite(startAngle1));
    assert && assert(isFinite(endAngle1));
    assert && assert(isFinite(startAngle2));
    assert && assert(isFinite(endAngle2));

    // Remap start of arc 1 to 0, and the end to be positive (sign1 )
    let end1 = endAngle1 - startAngle1;
    const sign1 = end1 < 0 ? -1 : 1;
    end1 *= sign1;

    // Remap arc 2 so the start point maps to the [0,2pi) range (and end-point may lie outside that)
    const start2 = Utils.moduloBetweenDown(sign1 * (startAngle2 - startAngle1), 0, TWO_PI);
    const end2 = sign1 * (endAngle2 - startAngle2) + start2;
    let wrapT;
    if (end2 < -1e-10) {
      wrapT = -start2 / (end2 - start2);
      return Arc.getPartialOverlap(end1, start2, 0, 0, wrapT).concat(Arc.getPartialOverlap(end1, TWO_PI, end2 + TWO_PI, wrapT, 1));
    } else if (end2 > TWO_PI + 1e-10) {
      wrapT = (TWO_PI - start2) / (end2 - start2);
      return Arc.getPartialOverlap(end1, start2, TWO_PI, 0, wrapT).concat(Arc.getPartialOverlap(end1, 0, end2 - TWO_PI, wrapT, 1));
    } else {
      return Arc.getPartialOverlap(end1, start2, end2, 0, 1);
    }
  }

  /**
   * Determine whether two Arcs overlap over continuous sections, and if so finds the a,b pairs such that
   * p( t ) === q( a * t + b ).
   *
   * @returns - Any overlaps (from 0 to 2)
   */
  static getOverlaps(arc1, arc2) {
    if (arc1._center.distance(arc2._center) > 1e-8 || Math.abs(arc1._radius - arc2._radius) > 1e-8) {
      return [];
    }
    return Arc.getAngularOverlaps(arc1._startAngle, arc1.getActualEndAngle(), arc2._startAngle, arc2.getActualEndAngle());
  }

  /**
   * Returns the points of intersections between two circles.
   *
   * @param center1 - Center of the first circle
   * @param radius1 - Radius of the first circle
   * @param center2 - Center of the second circle
   * @param radius2 - Radius of the second circle
   */
  static getCircleIntersectionPoint(center1, radius1, center2, radius2) {
    assert && assert(isFinite(radius1) && radius1 >= 0);
    assert && assert(isFinite(radius2) && radius2 >= 0);
    const delta = center2.minus(center1);
    const d = delta.magnitude;
    let results = [];
    if (d < 1e-10 || d > radius1 + radius2 + 1e-10) {
      // No intersections
    } else if (d > radius1 + radius2 - 1e-10) {
      results = [center1.blend(center2, radius1 / d)];
    } else {
      const xPrime = 0.5 * (d * d - radius2 * radius2 + radius1 * radius1) / d;
      const bit = d * d - radius2 * radius2 + radius1 * radius1;
      const discriminant = 4 * d * d * radius1 * radius1 - bit * bit;
      const base = center1.blend(center2, xPrime / d);
      if (discriminant >= 1e-10) {
        const yPrime = Math.sqrt(discriminant) / d / 2;
        const perpendicular = delta.perpendicular.setMagnitude(yPrime);
        results = [base.plus(perpendicular), base.minus(perpendicular)];
      } else if (discriminant > -1e-10) {
        results = [base];
      }
    }
    if (assert) {
      results.forEach(result => {
        assert(Math.abs(result.distance(center1) - radius1) < 1e-8);
        assert(Math.abs(result.distance(center2) - radius2) < 1e-8);
      });
    }
    return results;
  }

  /**
   * Returns any (finite) intersection between the two arc segments.
   */
  static intersect(a, b) {
    const epsilon = 1e-8;
    const results = [];

    // If we effectively have the same circle, just different sections of it. The only finite intersections could be
    // at the endpoints, so we'll inspect those.
    if (a._center.equalsEpsilon(b._center, epsilon) && Math.abs(a._radius - b._radius) < epsilon) {
      const aStart = a.positionAt(0);
      const aEnd = a.positionAt(1);
      const bStart = b.positionAt(0);
      const bEnd = b.positionAt(1);
      if (aStart.equalsEpsilon(bStart, epsilon)) {
        results.push(new SegmentIntersection(aStart.average(bStart), 0, 0));
      }
      if (aStart.equalsEpsilon(bEnd, epsilon)) {
        results.push(new SegmentIntersection(aStart.average(bEnd), 0, 1));
      }
      if (aEnd.equalsEpsilon(bStart, epsilon)) {
        results.push(new SegmentIntersection(aEnd.average(bStart), 1, 0));
      }
      if (aEnd.equalsEpsilon(bEnd, epsilon)) {
        results.push(new SegmentIntersection(aEnd.average(bEnd), 1, 1));
      }
    } else {
      const points = Arc.getCircleIntersectionPoint(a._center, a._radius, b._center, b._radius);
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const angleA = point.minus(a._center).angle;
        const angleB = point.minus(b._center).angle;
        if (a.containsAngle(angleA) && b.containsAngle(angleB)) {
          results.push(new SegmentIntersection(point, a.tAtAngle(angleA), b.tAtAngle(angleB)));
        }
      }
    }
    return results;
  }

  /**
   * Creates an Arc (or if straight enough a Line) segment that goes from the startPoint to the endPoint, touching
   * the middlePoint somewhere between the two.
   */
  static createFromPoints(startPoint, middlePoint, endPoint) {
    const center = Utils.circleCenterFromPoints(startPoint, middlePoint, endPoint);

    // Close enough
    if (center === null) {
      return new Line(startPoint, endPoint);
    } else {
      const startDiff = startPoint.minus(center);
      const middleDiff = middlePoint.minus(center);
      const endDiff = endPoint.minus(center);
      const startAngle = startDiff.angle;
      const middleAngle = middleDiff.angle;
      const endAngle = endDiff.angle;
      const radius = (startDiff.magnitude + middleDiff.magnitude + endDiff.magnitude) / 3;

      // Try anticlockwise first. TODO: Don't require creation of extra Arcs
      const arc = new Arc(center, radius, startAngle, endAngle, false);
      if (arc.containsAngle(middleAngle)) {
        return arc;
      } else {
        return new Arc(center, radius, startAngle, endAngle, true);
      }
    }
  }
}
kite.register('Arc', Arc);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVXRpbHMiLCJWZWN0b3IyIiwiRWxsaXB0aWNhbEFyYyIsImtpdGUiLCJMaW5lIiwiT3ZlcmxhcCIsIlJheUludGVyc2VjdGlvbiIsIlNlZ21lbnQiLCJTZWdtZW50SW50ZXJzZWN0aW9uIiwic3ZnTnVtYmVyIiwiVFdPX1BJIiwiTWF0aCIsIlBJIiwiQXJjIiwiY29uc3RydWN0b3IiLCJjZW50ZXIiLCJyYWRpdXMiLCJzdGFydEFuZ2xlIiwiZW5kQW5nbGUiLCJhbnRpY2xvY2t3aXNlIiwiX2NlbnRlciIsIl9yYWRpdXMiLCJfc3RhcnRBbmdsZSIsIl9lbmRBbmdsZSIsIl9hbnRpY2xvY2t3aXNlIiwiaW52YWxpZGF0ZSIsInNldENlbnRlciIsImFzc2VydCIsImlzRmluaXRlIiwidG9TdHJpbmciLCJlcXVhbHMiLCJ2YWx1ZSIsImdldENlbnRlciIsInNldFJhZGl1cyIsImdldFJhZGl1cyIsInNldFN0YXJ0QW5nbGUiLCJnZXRTdGFydEFuZ2xlIiwic2V0RW5kQW5nbGUiLCJnZXRFbmRBbmdsZSIsInNldEFudGljbG9ja3dpc2UiLCJnZXRBbnRpY2xvY2t3aXNlIiwicG9zaXRpb25BdCIsInQiLCJwb3NpdGlvbkF0QW5nbGUiLCJhbmdsZUF0IiwidGFuZ2VudEF0IiwidGFuZ2VudEF0QW5nbGUiLCJjdXJ2YXR1cmVBdCIsInN1YmRpdmlkZWQiLCJhbmdsZTAiLCJhbmdsZVQiLCJhbmdsZTEiLCJfc3RhcnQiLCJfZW5kIiwiX3N0YXJ0VGFuZ2VudCIsIl9lbmRUYW5nZW50IiwiX2FjdHVhbEVuZEFuZ2xlIiwiX2lzRnVsbFBlcmltZXRlciIsIl9hbmdsZURpZmZlcmVuY2UiLCJfYm91bmRzIiwiX3N2Z1BhdGhGcmFnbWVudCIsImludmFsaWRhdGlvbkVtaXR0ZXIiLCJlbWl0IiwiZ2V0U3RhcnQiLCJzdGFydCIsImdldEVuZCIsImVuZCIsImdldFN0YXJ0VGFuZ2VudCIsInN0YXJ0VGFuZ2VudCIsImdldEVuZFRhbmdlbnQiLCJlbmRUYW5nZW50IiwiZ2V0QWN0dWFsRW5kQW5nbGUiLCJjb21wdXRlQWN0dWFsRW5kQW5nbGUiLCJhY3R1YWxFbmRBbmdsZSIsImdldElzRnVsbFBlcmltZXRlciIsImlzRnVsbFBlcmltZXRlciIsImdldEFuZ2xlRGlmZmVyZW5jZSIsImFuZ2xlRGlmZmVyZW5jZSIsImdldEJvdW5kcyIsIk5PVEhJTkciLCJjb3B5Iiwid2l0aFBvaW50IiwiaW5jbHVkZUJvdW5kc0F0QW5nbGUiLCJib3VuZHMiLCJnZXROb25kZWdlbmVyYXRlU2VnbWVudHMiLCJhbmdsZSIsImNvbnRhaW5zQW5nbGUiLCJwbHVzIiwiY3JlYXRlUG9sYXIiLCJtYXBBbmdsZSIsImFicyIsIm1vZHVsb0JldHdlZW5Eb3duIiwibW9kdWxvQmV0d2VlblVwIiwidEF0QW5nbGUiLCJub3JtYWwiLCJwZXJwZW5kaWN1bGFyIiwibmVnYXRlZCIsIm5vcm1hbGl6ZWRBbmdsZSIsInBvc2l0aXZlTWluQW5nbGUiLCJnZXRTVkdQYXRoRnJhZ21lbnQiLCJvbGRQYXRoRnJhZ21lbnQiLCJlcHNpbG9uIiwic3dlZXBGbGFnIiwibGFyZ2VBcmNGbGFnIiwieCIsInkiLCJzcGxpdE9wcG9zaXRlQW5nbGUiLCJzcGxpdFBvaW50IiwiZmlyc3RBcmMiLCJzZWNvbmRBcmMiLCJzdHJva2VMZWZ0IiwibGluZVdpZHRoIiwic3Ryb2tlUmlnaHQiLCJnZXRJbnRlcmlvckV4dHJlbWFUcyIsInJlc3VsdCIsIl8iLCJlYWNoIiwicHVzaCIsInNvcnQiLCJpbnRlcnNlY3Rpb24iLCJyYXkiLCJjZW50ZXJUb1JheSIsInBvc2l0aW9uIiwibWludXMiLCJ0bXAiLCJkaXJlY3Rpb24iLCJkb3QiLCJjZW50ZXJUb1JheURpc3RTcSIsIm1hZ25pdHVkZVNxdWFyZWQiLCJkaXNjcmltaW5hbnQiLCJiYXNlIiwic3F0Iiwic3FydCIsInRhIiwidGIiLCJwb2ludEIiLCJwb2ludEF0RGlzdGFuY2UiLCJub3JtYWxCIiwibm9ybWFsaXplZCIsIm5vcm1hbEJBbmdsZSIsInBvaW50QSIsIm5vcm1hbEEiLCJub3JtYWxBQW5nbGUiLCJ3aW5kaW5nSW50ZXJzZWN0aW9uIiwid2luZCIsImhpdHMiLCJoaXQiLCJ3cml0ZVRvQ29udGV4dCIsImNvbnRleHQiLCJhcmMiLCJ0cmFuc2Zvcm1lZCIsIm1hdHJpeCIsInRpbWVzVmVjdG9yMiIsIlpFUk8iLCJnZXREZXRlcm1pbmFudCIsInNjYWxlVmVjdG9yIiwiZ2V0U2NhbGVWZWN0b3IiLCJyYWRpdXNYIiwicmFkaXVzWSIsImdldFNpZ25lZEFyZWFGcmFnbWVudCIsInQwIiwidDEiLCJzaW4iLCJjb3MiLCJyZXZlcnNlZCIsImdldEFyY0xlbmd0aCIsInRvUGllY2V3aXNlTGluZWFyT3JBcmNTZWdtZW50cyIsInNlcmlhbGl6ZSIsInR5cGUiLCJjZW50ZXJYIiwiY2VudGVyWSIsImdldE92ZXJsYXBzIiwic2VnbWVudCIsImRlc2VyaWFsaXplIiwib2JqIiwiZ2V0UGFydGlhbE92ZXJsYXAiLCJlbmQxIiwic3RhcnQyIiwiZW5kMiIsInRTdGFydDIiLCJ0RW5kMiIsInJldmVyc2VkMiIsIm1pbjIiLCJtYXgyIiwib3ZlcmxhcE1pbiIsIm92ZXJsYXBNYXgiLCJtaW4iLCJjcmVhdGVMaW5lYXIiLCJjbGFtcCIsImxpbmVhciIsImdldEFuZ3VsYXJPdmVybGFwcyIsInN0YXJ0QW5nbGUxIiwiZW5kQW5nbGUxIiwic3RhcnRBbmdsZTIiLCJlbmRBbmdsZTIiLCJzaWduMSIsIndyYXBUIiwiY29uY2F0IiwiYXJjMSIsImFyYzIiLCJkaXN0YW5jZSIsImdldENpcmNsZUludGVyc2VjdGlvblBvaW50IiwiY2VudGVyMSIsInJhZGl1czEiLCJjZW50ZXIyIiwicmFkaXVzMiIsImRlbHRhIiwiZCIsIm1hZ25pdHVkZSIsInJlc3VsdHMiLCJibGVuZCIsInhQcmltZSIsImJpdCIsInlQcmltZSIsInNldE1hZ25pdHVkZSIsImZvckVhY2giLCJpbnRlcnNlY3QiLCJhIiwiYiIsImVxdWFsc0Vwc2lsb24iLCJhU3RhcnQiLCJhRW5kIiwiYlN0YXJ0IiwiYkVuZCIsImF2ZXJhZ2UiLCJwb2ludHMiLCJpIiwibGVuZ3RoIiwicG9pbnQiLCJhbmdsZUEiLCJhbmdsZUIiLCJjcmVhdGVGcm9tUG9pbnRzIiwic3RhcnRQb2ludCIsIm1pZGRsZVBvaW50IiwiZW5kUG9pbnQiLCJjaXJjbGVDZW50ZXJGcm9tUG9pbnRzIiwic3RhcnREaWZmIiwibWlkZGxlRGlmZiIsImVuZERpZmYiLCJtaWRkbGVBbmdsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQXJjLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgY2lyY3VsYXIgYXJjIChhIGNvbnRpbnVvdXMgc3ViLXBhcnQgb2YgYSBjaXJjbGUpLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBSYXkyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYXkyLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgRWxsaXB0aWNhbEFyYywga2l0ZSwgTGluZSwgT3ZlcmxhcCwgUmF5SW50ZXJzZWN0aW9uLCBTZWdtZW50LCBTZWdtZW50SW50ZXJzZWN0aW9uLCBzdmdOdW1iZXIgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbi8vIFRPRE86IFNlZSBpZiB3ZSBzaG91bGQgdXNlIHRoaXMgbW9yZVxyXG5jb25zdCBUV09fUEkgPSBNYXRoLlBJICogMjtcclxuXHJcbnR5cGUgU2VyaWFsaXplZEFyYyA9IHtcclxuICB0eXBlOiAnQXJjJztcclxuICBjZW50ZXJYOiBudW1iZXI7XHJcbiAgY2VudGVyWTogbnVtYmVyO1xyXG4gIHJhZGl1czogbnVtYmVyO1xyXG4gIHN0YXJ0QW5nbGU6IG51bWJlcjtcclxuICBlbmRBbmdsZTogbnVtYmVyO1xyXG4gIGFudGljbG9ja3dpc2U6IGJvb2xlYW47XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcmMgZXh0ZW5kcyBTZWdtZW50IHtcclxuXHJcbiAgcHJpdmF0ZSBfY2VudGVyOiBWZWN0b3IyO1xyXG4gIHByaXZhdGUgX3JhZGl1czogbnVtYmVyO1xyXG4gIHByaXZhdGUgX3N0YXJ0QW5nbGU6IG51bWJlcjtcclxuICBwcml2YXRlIF9lbmRBbmdsZTogbnVtYmVyO1xyXG4gIHByaXZhdGUgX2FudGljbG9ja3dpc2U6IGJvb2xlYW47XHJcblxyXG4gIC8vIExhemlseS1jb21wdXRlZCBkZXJpdmVkIGluZm9ybWF0aW9uXHJcbiAgcHJpdmF0ZSBfc3RhcnQhOiBWZWN0b3IyIHwgbnVsbDtcclxuICBwcml2YXRlIF9lbmQhOiBWZWN0b3IyIHwgbnVsbDtcclxuICBwcml2YXRlIF9zdGFydFRhbmdlbnQhOiBWZWN0b3IyIHwgbnVsbDtcclxuICBwcml2YXRlIF9lbmRUYW5nZW50ITogVmVjdG9yMiB8IG51bGw7XHJcbiAgcHJpdmF0ZSBfYWN0dWFsRW5kQW5nbGUhOiBudW1iZXIgfCBudWxsOyAvLyBFbmQgYW5nbGUgaW4gcmVsYXRpb24gdG8gb3VyIHN0YXJ0IGFuZ2xlIChjYW4gZ2V0IHJlbWFwcGVkKVxyXG4gIHByaXZhdGUgX2lzRnVsbFBlcmltZXRlciE6IGJvb2xlYW4gfCBudWxsOyAvLyBXaGV0aGVyIGl0J3MgYSBmdWxsIGNpcmNsZSAoYW5kIG5vdCBqdXN0IGFuIGFyYylcclxuICBwcml2YXRlIF9hbmdsZURpZmZlcmVuY2UhOiBudW1iZXIgfCBudWxsO1xyXG4gIHByaXZhdGUgX2JvdW5kcyE6IEJvdW5kczIgfCBudWxsO1xyXG4gIHByaXZhdGUgX3N2Z1BhdGhGcmFnbWVudCE6IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8qKlxyXG4gICAqIElmIHRoZSBzdGFydEFuZ2xlL2VuZEFuZ2xlIGRpZmZlcmVuY2UgaXMgfjJwaSwgdGhpcyB3aWxsIGJlIGEgZnVsbCBjaXJjbGVcclxuICAgKlxyXG4gICAqIFNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi8yZGNvbnRleHQvI2RvbS1jb250ZXh0LTJkLWFyYyBmb3IgZGV0YWlsZWQgaW5mb3JtYXRpb24gb24gdGhlIHBhcmFtZXRlcnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY2VudGVyIC0gQ2VudGVyIG9mIHRoZSBhcmMgKGV2ZXJ5IHBvaW50IG9uIHRoZSBhcmMgaXMgZXF1YWxseSBmYXIgZnJvbSB0aGUgY2VudGVyKVxyXG4gICAqIEBwYXJhbSByYWRpdXMgLSBIb3cgZmFyIGZyb20gdGhlIGNlbnRlciB0aGUgYXJjIHdpbGwgYmVcclxuICAgKiBAcGFyYW0gc3RhcnRBbmdsZSAtIEFuZ2xlIChyYWRpYW5zKSBvZiB0aGUgc3RhcnQgb2YgdGhlIGFyY1xyXG4gICAqIEBwYXJhbSBlbmRBbmdsZSAtIEFuZ2xlIChyYWRpYW5zKSBvZiB0aGUgZW5kIG9mIHRoZSBhcmNcclxuICAgKiBAcGFyYW0gYW50aWNsb2Nrd2lzZSAtIERlY2lkZXMgd2hpY2ggZGlyZWN0aW9uIHRoZSBhcmMgdGFrZXMgYXJvdW5kIHRoZSBjZW50ZXJcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNlbnRlcjogVmVjdG9yMiwgcmFkaXVzOiBudW1iZXIsIHN0YXJ0QW5nbGU6IG51bWJlciwgZW5kQW5nbGU6IG51bWJlciwgYW50aWNsb2Nrd2lzZTogYm9vbGVhbiApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5fY2VudGVyID0gY2VudGVyO1xyXG4gICAgdGhpcy5fcmFkaXVzID0gcmFkaXVzO1xyXG4gICAgdGhpcy5fc3RhcnRBbmdsZSA9IHN0YXJ0QW5nbGU7XHJcbiAgICB0aGlzLl9lbmRBbmdsZSA9IGVuZEFuZ2xlO1xyXG4gICAgdGhpcy5fYW50aWNsb2Nrd2lzZSA9IGFudGljbG9ja3dpc2U7XHJcblxyXG4gICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBjZW50ZXIgb2YgdGhlIEFyYy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q2VudGVyKCBjZW50ZXI6IFZlY3RvcjIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjZW50ZXIuaXNGaW5pdGUoKSwgYEFyYyBjZW50ZXIgc2hvdWxkIGJlIGZpbml0ZTogJHtjZW50ZXIudG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5fY2VudGVyLmVxdWFscyggY2VudGVyICkgKSB7XHJcbiAgICAgIHRoaXMuX2NlbnRlciA9IGNlbnRlcjtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgY2VudGVyKCB2YWx1ZTogVmVjdG9yMiApIHsgdGhpcy5zZXRDZW50ZXIoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBjZW50ZXIoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldENlbnRlcigpOyB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjZW50ZXIgb2YgdGhpcyBBcmMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldENlbnRlcigpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLl9jZW50ZXI7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgcmFkaXVzIG9mIHRoZSBBcmMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFJhZGl1cyggcmFkaXVzOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggcmFkaXVzICksIGBBcmMgcmFkaXVzIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7cmFkaXVzfWAgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3JhZGl1cyAhPT0gcmFkaXVzICkge1xyXG4gICAgICB0aGlzLl9yYWRpdXMgPSByYWRpdXM7XHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHJhZGl1cyggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRSYWRpdXMoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCByYWRpdXMoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0UmFkaXVzKCk7IH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHJhZGl1cyBvZiB0aGlzIEFyYy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmFkaXVzKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmFkaXVzO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHN0YXJ0QW5nbGUgb2YgdGhlIEFyYy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0U3RhcnRBbmdsZSggc3RhcnRBbmdsZTogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHN0YXJ0QW5nbGUgKSwgYEFyYyBzdGFydEFuZ2xlIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7c3RhcnRBbmdsZX1gICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9zdGFydEFuZ2xlICE9PSBzdGFydEFuZ2xlICkge1xyXG4gICAgICB0aGlzLl9zdGFydEFuZ2xlID0gc3RhcnRBbmdsZTtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgc3RhcnRBbmdsZSggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRTdGFydEFuZ2xlKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3RhcnRBbmdsZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRTdGFydEFuZ2xlKCk7IH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHN0YXJ0QW5nbGUgb2YgdGhpcyBBcmMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFN0YXJ0QW5nbGUoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGFydEFuZ2xlO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGVuZEFuZ2xlIG9mIHRoZSBBcmMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldEVuZEFuZ2xlKCBlbmRBbmdsZTogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGVuZEFuZ2xlICksIGBBcmMgZW5kQW5nbGUgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcjogJHtlbmRBbmdsZX1gICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9lbmRBbmdsZSAhPT0gZW5kQW5nbGUgKSB7XHJcbiAgICAgIHRoaXMuX2VuZEFuZ2xlID0gZW5kQW5nbGU7XHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGVuZEFuZ2xlKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldEVuZEFuZ2xlKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZW5kQW5nbGUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0RW5kQW5nbGUoKTsgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgZW5kQW5nbGUgb2YgdGhpcyBBcmMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEVuZEFuZ2xlKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fZW5kQW5nbGU7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgYW50aWNsb2Nrd2lzZSBvZiB0aGUgQXJjLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRBbnRpY2xvY2t3aXNlKCBhbnRpY2xvY2t3aXNlOiBib29sZWFuICk6IHRoaXMge1xyXG5cclxuICAgIGlmICggdGhpcy5fYW50aWNsb2Nrd2lzZSAhPT0gYW50aWNsb2Nrd2lzZSApIHtcclxuICAgICAgdGhpcy5fYW50aWNsb2Nrd2lzZSA9IGFudGljbG9ja3dpc2U7XHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGFudGljbG9ja3dpc2UoIHZhbHVlOiBib29sZWFuICkgeyB0aGlzLnNldEFudGljbG9ja3dpc2UoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBhbnRpY2xvY2t3aXNlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRBbnRpY2xvY2t3aXNlKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYW50aWNsb2Nrd2lzZSBvZiB0aGlzIEFyYy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0QW50aWNsb2Nrd2lzZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9hbnRpY2xvY2t3aXNlO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHBvc2l0aW9uIHBhcmFtZXRyaWNhbGx5LCB3aXRoIDAgPD0gdCA8PSAxLlxyXG4gICAqXHJcbiAgICogTk9URTogcG9zaXRpb25BdCggMCApIHdpbGwgcmV0dXJuIHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudCwgYW5kIHBvc2l0aW9uQXQoIDEgKSB3aWxsIHJldHVybiB0aGUgZW5kIG9mIHRoZVxyXG4gICAqIHNlZ21lbnQuXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgcG9zaXRpb25BdCggdDogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAncG9zaXRpb25BdCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0IDw9IDEsICdwb3NpdGlvbkF0IHQgc2hvdWxkIGJlIG5vIGdyZWF0ZXIgdGhhbiAxJyApO1xyXG5cclxuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uQXRBbmdsZSggdGhpcy5hbmdsZUF0KCB0ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG5vbi1ub3JtYWxpemVkIHRhbmdlbnQgKGR4L2R0LCBkeS9kdCkgb2YgdGhpcyBzZWdtZW50IGF0IHRoZSBwYXJhbWV0cmljIHZhbHVlIG9mIHQsIHdpdGggMCA8PSB0IDw9IDEuXHJcbiAgICpcclxuICAgKiBOT1RFOiB0YW5nZW50QXQoIDAgKSB3aWxsIHJldHVybiB0aGUgdGFuZ2VudCBhdCB0aGUgc3RhcnQgb2YgdGhlIHNlZ21lbnQsIGFuZCB0YW5nZW50QXQoIDEgKSB3aWxsIHJldHVybiB0aGVcclxuICAgKiB0YW5nZW50IGF0IHRoZSBlbmQgb2YgdGhlIHNlZ21lbnQuXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgdGFuZ2VudEF0KCB0OiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAsICd0YW5nZW50QXQgdCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAndGFuZ2VudEF0IHQgc2hvdWxkIGJlIG5vIGdyZWF0ZXIgdGhhbiAxJyApO1xyXG5cclxuICAgIHJldHVybiB0aGlzLnRhbmdlbnRBdEFuZ2xlKCB0aGlzLmFuZ2xlQXQoIHQgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc2lnbmVkIGN1cnZhdHVyZSBvZiB0aGUgc2VnbWVudCBhdCB0aGUgcGFyYW1ldHJpYyB2YWx1ZSB0LCB3aGVyZSAwIDw9IHQgPD0gMS5cclxuICAgKlxyXG4gICAqIFRoZSBjdXJ2YXR1cmUgd2lsbCBiZSBwb3NpdGl2ZSBmb3IgdmlzdWFsIGNsb2Nrd2lzZSAvIG1hdGhlbWF0aWNhbCBjb3VudGVyY2xvY2t3aXNlIGN1cnZlcywgbmVnYXRpdmUgZm9yIG9wcG9zaXRlXHJcbiAgICogY3VydmF0dXJlLCBhbmQgMCBmb3Igbm8gY3VydmF0dXJlLlxyXG4gICAqXHJcbiAgICogTk9URTogY3VydmF0dXJlQXQoIDAgKSB3aWxsIHJldHVybiB0aGUgY3VydmF0dXJlIGF0IHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudCwgYW5kIGN1cnZhdHVyZUF0KCAxICkgd2lsbCByZXR1cm5cclxuICAgKiB0aGUgY3VydmF0dXJlIGF0IHRoZSBlbmQgb2YgdGhlIHNlZ21lbnQuXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgY3VydmF0dXJlQXQoIHQ6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAnY3VydmF0dXJlQXQgdCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAnY3VydmF0dXJlQXQgdCBzaG91bGQgYmUgbm8gZ3JlYXRlciB0aGFuIDEnICk7XHJcblxyXG4gICAgLy8gU2luY2UgaXQgaXMgYW4gYXJjIG9mIGFzIGNpcmNsZSwgdGhlIGN1cnZhdHVyZSBpcyBpbmRlcGVuZGVudCBvZiB0XHJcbiAgICByZXR1cm4gKCB0aGlzLl9hbnRpY2xvY2t3aXNlID8gLTEgOiAxICkgLyB0aGlzLl9yYWRpdXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFycmF5IHdpdGggdXAgdG8gMiBzdWItc2VnbWVudHMsIHNwbGl0IGF0IHRoZSBwYXJhbWV0cmljIHQgdmFsdWUuIFRvZ2V0aGVyIChpbiBvcmRlcikgdGhleSBzaG91bGQgbWFrZVxyXG4gICAqIHVwIHRoZSBzYW1lIHNoYXBlIGFzIHRoZSBjdXJyZW50IHNlZ21lbnQuXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc3ViZGl2aWRlZCggdDogbnVtYmVyICk6IEFyY1tdIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPj0gMCwgJ3N1YmRpdmlkZWQgdCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAnc3ViZGl2aWRlZCB0IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcclxuXHJcbiAgICAvLyBJZiB0IGlzIDAgb3IgMSwgd2Ugb25seSBuZWVkIHRvIHJldHVybiAxIHNlZ21lbnRcclxuICAgIGlmICggdCA9PT0gMCB8fCB0ID09PSAxICkge1xyXG4gICAgICByZXR1cm4gWyB0aGlzIF07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogdmVyaWZ5IHRoYXQgd2UgZG9uJ3QgbmVlZCB0byBzd2l0Y2ggYW50aWNsb2Nrd2lzZSBoZXJlLCBvciBzdWJ0cmFjdCAycGkgb2ZmIGFueSBhbmdsZXNcclxuICAgIGNvbnN0IGFuZ2xlMCA9IHRoaXMuYW5nbGVBdCggMCApO1xyXG4gICAgY29uc3QgYW5nbGVUID0gdGhpcy5hbmdsZUF0KCB0ICk7XHJcbiAgICBjb25zdCBhbmdsZTEgPSB0aGlzLmFuZ2xlQXQoIDEgKTtcclxuICAgIHJldHVybiBbXHJcbiAgICAgIG5ldyBBcmMoIHRoaXMuX2NlbnRlciwgdGhpcy5fcmFkaXVzLCBhbmdsZTAsIGFuZ2xlVCwgdGhpcy5fYW50aWNsb2Nrd2lzZSApLFxyXG4gICAgICBuZXcgQXJjKCB0aGlzLl9jZW50ZXIsIHRoaXMuX3JhZGl1cywgYW5nbGVULCBhbmdsZTEsIHRoaXMuX2FudGljbG9ja3dpc2UgKVxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFycyBjYWNoZWQgaW5mb3JtYXRpb24sIHNob3VsZCBiZSBjYWxsZWQgd2hlbiBhbnkgb2YgdGhlICdjb25zdHJ1Y3RvciBhcmd1bWVudHMnIGFyZSBtdXRhdGVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpbnZhbGlkYXRlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fc3RhcnQgPSBudWxsO1xyXG4gICAgdGhpcy5fZW5kID0gbnVsbDtcclxuICAgIHRoaXMuX3N0YXJ0VGFuZ2VudCA9IG51bGw7XHJcbiAgICB0aGlzLl9lbmRUYW5nZW50ID0gbnVsbDtcclxuICAgIHRoaXMuX2FjdHVhbEVuZEFuZ2xlID0gbnVsbDtcclxuICAgIHRoaXMuX2lzRnVsbFBlcmltZXRlciA9IG51bGw7XHJcbiAgICB0aGlzLl9hbmdsZURpZmZlcmVuY2UgPSBudWxsO1xyXG4gICAgdGhpcy5fYm91bmRzID0gbnVsbDtcclxuICAgIHRoaXMuX3N2Z1BhdGhGcmFnbWVudCA9IG51bGw7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fY2VudGVyIGluc3RhbmNlb2YgVmVjdG9yMiwgJ0FyYyBjZW50ZXIgc2hvdWxkIGJlIGEgVmVjdG9yMicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2NlbnRlci5pc0Zpbml0ZSgpLCAnQXJjIGNlbnRlciBzaG91bGQgYmUgZmluaXRlIChub3QgTmFOIG9yIGluZmluaXRlKScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl9yYWRpdXMgPT09ICdudW1iZXInLCBgQXJjIHJhZGl1cyBzaG91bGQgYmUgYSBudW1iZXI6ICR7dGhpcy5fcmFkaXVzfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB0aGlzLl9yYWRpdXMgKSwgYEFyYyByYWRpdXMgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcjogJHt0aGlzLl9yYWRpdXN9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMuX3N0YXJ0QW5nbGUgPT09ICdudW1iZXInLCBgQXJjIHN0YXJ0QW5nbGUgc2hvdWxkIGJlIGEgbnVtYmVyOiAke3RoaXMuX3N0YXJ0QW5nbGV9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMuX3N0YXJ0QW5nbGUgKSwgYEFyYyBzdGFydEFuZ2xlIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7dGhpcy5fc3RhcnRBbmdsZX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGhpcy5fZW5kQW5nbGUgPT09ICdudW1iZXInLCBgQXJjIGVuZEFuZ2xlIHNob3VsZCBiZSBhIG51bWJlcjogJHt0aGlzLl9lbmRBbmdsZX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy5fZW5kQW5nbGUgKSwgYEFyYyBlbmRBbmdsZSBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3RoaXMuX2VuZEFuZ2xlfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl9hbnRpY2xvY2t3aXNlID09PSAnYm9vbGVhbicsIGBBcmMgYW50aWNsb2Nrd2lzZSBzaG91bGQgYmUgYSBib29sZWFuOiAke3RoaXMuX2FudGljbG9ja3dpc2V9YCApO1xyXG5cclxuICAgIC8vIFJlbWFwIG5lZ2F0aXZlIHJhZGl1cyB0byBhIHBvc2l0aXZlIHJhZGl1c1xyXG4gICAgaWYgKCB0aGlzLl9yYWRpdXMgPCAwICkge1xyXG4gICAgICAvLyBzdXBwb3J0IHRoaXMgY2FzZSBzaW5jZSB3ZSBtaWdodCBhY3R1YWxseSBuZWVkIHRvIGhhbmRsZSBpdCBpbnNpZGUgb2Ygc3Ryb2tlcz9cclxuICAgICAgdGhpcy5fcmFkaXVzID0gLXRoaXMuX3JhZGl1cztcclxuICAgICAgdGhpcy5fc3RhcnRBbmdsZSArPSBNYXRoLlBJO1xyXG4gICAgICB0aGlzLl9lbmRBbmdsZSArPSBNYXRoLlBJO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENvbnN0cmFpbnRzIHRoYXQgc2hvdWxkIGFsd2F5cyBiZSBzYXRpc2ZpZWRcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICEoICggIXRoaXMuYW50aWNsb2Nrd2lzZSAmJiB0aGlzLl9lbmRBbmdsZSAtIHRoaXMuX3N0YXJ0QW5nbGUgPD0gLU1hdGguUEkgKiAyICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICggdGhpcy5hbnRpY2xvY2t3aXNlICYmIHRoaXMuX3N0YXJ0QW5nbGUgLSB0aGlzLl9lbmRBbmdsZSA8PSAtTWF0aC5QSSAqIDIgKSApLFxyXG4gICAgICAnTm90IGhhbmRsaW5nIGFyY3Mgd2l0aCBzdGFydC9lbmQgYW5nbGVzIHRoYXQgc2hvdyBkaWZmZXJlbmNlcyBpbi1iZXR3ZWVuIGJyb3dzZXIgaGFuZGxpbmcnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhKCAoICF0aGlzLmFudGljbG9ja3dpc2UgJiYgdGhpcy5fZW5kQW5nbGUgLSB0aGlzLl9zdGFydEFuZ2xlID4gTWF0aC5QSSAqIDIgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgKCB0aGlzLmFudGljbG9ja3dpc2UgJiYgdGhpcy5fc3RhcnRBbmdsZSAtIHRoaXMuX2VuZEFuZ2xlID4gTWF0aC5QSSAqIDIgKSApLFxyXG4gICAgICAnTm90IGhhbmRsaW5nIGFyY3Mgd2l0aCBzdGFydC9lbmQgYW5nbGVzIHRoYXQgc2hvdyBkaWZmZXJlbmNlcyBpbi1iZXR3ZWVuIGJyb3dzZXIgaGFuZGxpbmcnICk7XHJcblxyXG4gICAgdGhpcy5pbnZhbGlkYXRpb25FbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoaXMgYXJjLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTdGFydCgpOiBWZWN0b3IyIHtcclxuICAgIGlmICggdGhpcy5fc3RhcnQgPT09IG51bGwgKSB7XHJcbiAgICAgIHRoaXMuX3N0YXJ0ID0gdGhpcy5wb3NpdGlvbkF0QW5nbGUoIHRoaXMuX3N0YXJ0QW5nbGUgKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9zdGFydDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3RhcnQoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldFN0YXJ0KCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgZW5kIHBvc2l0aW9uIG9mIHRoaXMgYXJjLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRFbmQoKTogVmVjdG9yMiB7XHJcbiAgICBpZiAoIHRoaXMuX2VuZCA9PT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5fZW5kID0gdGhpcy5wb3NpdGlvbkF0QW5nbGUoIHRoaXMuX2VuZEFuZ2xlICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fZW5kO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBlbmQoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldEVuZCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHVuaXQgdmVjdG9yIHRhbmdlbnQgdG8gdGhpcyBhcmMgYXQgdGhlIHN0YXJ0IHBvaW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTdGFydFRhbmdlbnQoKTogVmVjdG9yMiB7XHJcbiAgICBpZiAoIHRoaXMuX3N0YXJ0VGFuZ2VudCA9PT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5fc3RhcnRUYW5nZW50ID0gdGhpcy50YW5nZW50QXRBbmdsZSggdGhpcy5fc3RhcnRBbmdsZSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0VGFuZ2VudDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3RhcnRUYW5nZW50KCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRTdGFydFRhbmdlbnQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB1bml0IHZlY3RvciB0YW5nZW50IHRvIHRoZSBhcmMgYXQgdGhlIGVuZCBwb2ludC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RW5kVGFuZ2VudCgpOiBWZWN0b3IyIHtcclxuICAgIGlmICggdGhpcy5fZW5kVGFuZ2VudCA9PT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5fZW5kVGFuZ2VudCA9IHRoaXMudGFuZ2VudEF0QW5nbGUoIHRoaXMuX2VuZEFuZ2xlICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fZW5kVGFuZ2VudDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZW5kVGFuZ2VudCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0RW5kVGFuZ2VudCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGVuZCBhbmdsZSBpbiByYWRpYW5zLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRBY3R1YWxFbmRBbmdsZSgpOiBudW1iZXIge1xyXG4gICAgaWYgKCB0aGlzLl9hY3R1YWxFbmRBbmdsZSA9PT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5fYWN0dWFsRW5kQW5nbGUgPSBBcmMuY29tcHV0ZUFjdHVhbEVuZEFuZ2xlKCB0aGlzLl9zdGFydEFuZ2xlLCB0aGlzLl9lbmRBbmdsZSwgdGhpcy5fYW50aWNsb2Nrd2lzZSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX2FjdHVhbEVuZEFuZ2xlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBhY3R1YWxFbmRBbmdsZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRBY3R1YWxFbmRBbmdsZSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBib29sZWFuIHZhbHVlIHRoYXQgaW5kaWNhdGVzIGlmIHRoZSBhcmMgd3JhcHMgdXAgYnkgbW9yZSB0aGFuIHR3byBQaS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0SXNGdWxsUGVyaW1ldGVyKCk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCB0aGlzLl9pc0Z1bGxQZXJpbWV0ZXIgPT09IG51bGwgKSB7XHJcbiAgICAgIHRoaXMuX2lzRnVsbFBlcmltZXRlciA9ICggIXRoaXMuX2FudGljbG9ja3dpc2UgJiYgdGhpcy5fZW5kQW5nbGUgLSB0aGlzLl9zdGFydEFuZ2xlID49IE1hdGguUEkgKiAyICkgfHwgKCB0aGlzLl9hbnRpY2xvY2t3aXNlICYmIHRoaXMuX3N0YXJ0QW5nbGUgLSB0aGlzLl9lbmRBbmdsZSA+PSBNYXRoLlBJICogMiApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX2lzRnVsbFBlcmltZXRlcjtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgaXNGdWxsUGVyaW1ldGVyKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRJc0Z1bGxQZXJpbWV0ZXIoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFuZ2xlIGRpZmZlcmVuY2UgdGhhdCByZXByZXNlbnRzIGhvdyBcIm11Y2hcIiBvZiB0aGUgY2lyY2xlIG91ciBhcmMgY292ZXJzLlxyXG4gICAqXHJcbiAgICogVGhlIGFuc3dlciBpcyBhbHdheXMgZ3JlYXRlciBvciBlcXVhbCB0byB6ZXJvXHJcbiAgICogVGhlIGFuc3dlciBjYW4gZXhjZWVkIHR3byBQaVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRBbmdsZURpZmZlcmVuY2UoKTogbnVtYmVyIHtcclxuICAgIGlmICggdGhpcy5fYW5nbGVEaWZmZXJlbmNlID09PSBudWxsICkge1xyXG4gICAgICAvLyBjb21wdXRlIGFuIGFuZ2xlIGRpZmZlcmVuY2UgdGhhdCByZXByZXNlbnRzIGhvdyBcIm11Y2hcIiBvZiB0aGUgY2lyY2xlIG91ciBhcmMgY292ZXJzXHJcbiAgICAgIHRoaXMuX2FuZ2xlRGlmZmVyZW5jZSA9IHRoaXMuX2FudGljbG9ja3dpc2UgPyB0aGlzLl9zdGFydEFuZ2xlIC0gdGhpcy5fZW5kQW5nbGUgOiB0aGlzLl9lbmRBbmdsZSAtIHRoaXMuX3N0YXJ0QW5nbGU7XHJcbiAgICAgIGlmICggdGhpcy5fYW5nbGVEaWZmZXJlbmNlIDwgMCApIHtcclxuICAgICAgICB0aGlzLl9hbmdsZURpZmZlcmVuY2UgKz0gTWF0aC5QSSAqIDI7XHJcbiAgICAgIH1cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fYW5nbGVEaWZmZXJlbmNlID49IDAgKTsgLy8gbm93IGl0IHNob3VsZCBhbHdheXMgYmUgemVybyBvciBwb3NpdGl2ZVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX2FuZ2xlRGlmZmVyZW5jZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYW5nbGVEaWZmZXJlbmNlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEFuZ2xlRGlmZmVyZW5jZSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGJvdW5kcyBvZiB0aGlzIHNlZ21lbnQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIGlmICggdGhpcy5fYm91bmRzID09PSBudWxsICkge1xyXG4gICAgICAvLyBhY2NlbGVyYXRpb24gZm9yIGludGVyc2VjdGlvblxyXG4gICAgICB0aGlzLl9ib3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpLndpdGhQb2ludCggdGhpcy5nZXRTdGFydCgpIClcclxuICAgICAgICAud2l0aFBvaW50KCB0aGlzLmdldEVuZCgpICk7XHJcblxyXG4gICAgICAvLyBpZiB0aGUgYW5nbGVzIGFyZSBkaWZmZXJlbnQsIGNoZWNrIGV4dHJlbWEgcG9pbnRzXHJcbiAgICAgIGlmICggdGhpcy5fc3RhcnRBbmdsZSAhPT0gdGhpcy5fZW5kQW5nbGUgKSB7XHJcbiAgICAgICAgLy8gY2hlY2sgYWxsIG9mIHRoZSBleHRyZW1hIHBvaW50c1xyXG4gICAgICAgIHRoaXMuaW5jbHVkZUJvdW5kc0F0QW5nbGUoIDAgKTtcclxuICAgICAgICB0aGlzLmluY2x1ZGVCb3VuZHNBdEFuZ2xlKCBNYXRoLlBJIC8gMiApO1xyXG4gICAgICAgIHRoaXMuaW5jbHVkZUJvdW5kc0F0QW5nbGUoIE1hdGguUEkgKTtcclxuICAgICAgICB0aGlzLmluY2x1ZGVCb3VuZHNBdEFuZ2xlKCAzICogTWF0aC5QSSAvIDIgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX2JvdW5kcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYm91bmRzKCk6IEJvdW5kczIgeyByZXR1cm4gdGhpcy5nZXRCb3VuZHMoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBub24tZGVnZW5lcmF0ZSBzZWdtZW50cyB0aGF0IGFyZSBlcXVpdmFsZW50IHRvIHRoaXMgc2VnbWVudC4gR2VuZXJhbGx5IGdldHMgcmlkIChvciBzaW1wbGlmaWVzKVxyXG4gICAqIGludmFsaWQgb3IgcmVwZWF0ZWQgc2VnbWVudHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cygpOiBBcmNbXSB7XHJcbiAgICBpZiAoIHRoaXMuX3JhZGl1cyA8PSAwIHx8IHRoaXMuX3N0YXJ0QW5nbGUgPT09IHRoaXMuX2VuZEFuZ2xlICkge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIFsgdGhpcyBdOyAvLyBiYXNpY2FsbHksIEFyY3MgYXJlbid0IHJlYWxseSBkZWdlbmVyYXRlIHRoYXQgZWFzaWx5XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBdHRlbXB0cyB0byBleHBhbmQgdGhlIHByaXZhdGUgX2JvdW5kcyBib3VuZGluZyBib3ggdG8gaW5jbHVkZSBhIHBvaW50IGF0IGEgc3BlY2lmaWMgYW5nbGUsIG1ha2luZyBzdXJlIHRoYXRcclxuICAgKiBhbmdsZSBpcyBhY3R1YWxseSBpbmNsdWRlZCBpbiB0aGUgYXJjLiBUaGlzIHdpbGwgcHJlc3VtYWJseSBiZSBjYWxsZWQgYXQgYW5nbGVzIHRoYXQgYXJlIGF0IGNyaXRpY2FsIHBvaW50cyxcclxuICAgKiB3aGVyZSB0aGUgYXJjIHNob3VsZCBoYXZlIG1heGltdW0vbWluaW11bSB4L3kgdmFsdWVzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaW5jbHVkZUJvdW5kc0F0QW5nbGUoIGFuZ2xlOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMuY29udGFpbnNBbmdsZSggYW5nbGUgKSApIHtcclxuICAgICAgLy8gdGhlIGJvdW5kYXJ5IHBvaW50IGlzIGluIHRoZSBhcmNcclxuICAgICAgdGhpcy5fYm91bmRzID0gdGhpcy5fYm91bmRzIS53aXRoUG9pbnQoIHRoaXMuX2NlbnRlci5wbHVzKCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCB0aGlzLl9yYWRpdXMsIGFuZ2xlICkgKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFwcyBhIGNvbnRhaW5lZCBhbmdsZSB0byBiZXR3ZWVuIFtzdGFydEFuZ2xlLGFjdHVhbEVuZEFuZ2xlKSwgZXZlbiBpZiB0aGUgZW5kIGFuZ2xlIGlzIGxvd2VyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBtYXBBbmdsZSggYW5nbGU6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgaWYgKCBNYXRoLmFicyggVXRpbHMubW9kdWxvQmV0d2VlbkRvd24oIGFuZ2xlIC0gdGhpcy5fc3RhcnRBbmdsZSwgLU1hdGguUEksIE1hdGguUEkgKSApIDwgMWUtOCApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3N0YXJ0QW5nbGU7XHJcbiAgICB9XHJcbiAgICBpZiAoIE1hdGguYWJzKCBVdGlscy5tb2R1bG9CZXR3ZWVuRG93biggYW5nbGUgLSB0aGlzLmdldEFjdHVhbEVuZEFuZ2xlKCksIC1NYXRoLlBJLCBNYXRoLlBJICkgKSA8IDFlLTggKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldEFjdHVhbEVuZEFuZ2xlKCk7XHJcbiAgICB9XHJcbiAgICAvLyBjb25zaWRlciBhbiBhc3NlcnQgdGhhdCB3ZSBjb250YWluIHRoYXQgYW5nbGU/XHJcbiAgICByZXR1cm4gKCB0aGlzLl9zdGFydEFuZ2xlID4gdGhpcy5nZXRBY3R1YWxFbmRBbmdsZSgpICkgP1xyXG4gICAgICAgICAgIFV0aWxzLm1vZHVsb0JldHdlZW5VcCggYW5nbGUsIHRoaXMuX3N0YXJ0QW5nbGUgLSAyICogTWF0aC5QSSwgdGhpcy5fc3RhcnRBbmdsZSApIDpcclxuICAgICAgICAgICBVdGlscy5tb2R1bG9CZXR3ZWVuRG93biggYW5nbGUsIHRoaXMuX3N0YXJ0QW5nbGUsIHRoaXMuX3N0YXJ0QW5nbGUgKyAyICogTWF0aC5QSSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgcGFyYW1ldHJpemVkIHZhbHVlIHQgZm9yIGEgZ2l2ZW4gYW5nbGUuIFRoZSB2YWx1ZSB0IHNob3VsZCByYW5nZSBmcm9tIDAgdG8gMSAoaW5jbHVzaXZlKS5cclxuICAgKi9cclxuICBwdWJsaWMgdEF0QW5nbGUoIGFuZ2xlOiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHQgPSAoIHRoaXMubWFwQW5nbGUoIGFuZ2xlICkgLSB0aGlzLl9zdGFydEFuZ2xlICkgLyAoIHRoaXMuZ2V0QWN0dWFsRW5kQW5nbGUoKSAtIHRoaXMuX3N0YXJ0QW5nbGUgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAgJiYgdCA8PSAxLCBgdEF0QW5nbGUgb3V0IG9mIHJhbmdlOiAke3R9YCApO1xyXG5cclxuICAgIHJldHVybiB0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYW5nbGUgZm9yIHRoZSBwYXJhbWV0cml6ZWQgdCB2YWx1ZS4gVGhlIHQgdmFsdWUgc2hvdWxkIHJhbmdlIGZyb20gMCB0byAxIChpbmNsdXNpdmUpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhbmdsZUF0KCB0OiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIC8vVE9ETzogYWRkIGFzc2VydHNcclxuICAgIHJldHVybiB0aGlzLl9zdGFydEFuZ2xlICsgKCB0aGlzLmdldEFjdHVhbEVuZEFuZ2xlKCkgLSB0aGlzLl9zdGFydEFuZ2xlICkgKiB0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgcG9zaXRpb24gb2YgdGhpcyBhcmMgYXQgYW5nbGUuXHJcbiAgICovXHJcbiAgcHVibGljIHBvc2l0aW9uQXRBbmdsZSggYW5nbGU6IG51bWJlciApOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLl9jZW50ZXIucGx1cyggVmVjdG9yMi5jcmVhdGVQb2xhciggdGhpcy5fcmFkaXVzLCBhbmdsZSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBub3JtYWxpemVkIHRhbmdlbnQgb2YgdGhpcyBhcmMuXHJcbiAgICogVGhlIHRhbmdlbnQgcG9pbnRzIG91dHdhcmQgKGlud2FyZCkgb2YgdGhpcyBhcmMgZm9yIGNsb2Nrd2lzZSAoYW50aWNsb2Nrd2lzZSkgZGlyZWN0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB0YW5nZW50QXRBbmdsZSggYW5nbGU6IG51bWJlciApOiBWZWN0b3IyIHtcclxuICAgIGNvbnN0IG5vcm1hbCA9IFZlY3RvcjIuY3JlYXRlUG9sYXIoIDEsIGFuZ2xlICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX2FudGljbG9ja3dpc2UgPyBub3JtYWwucGVycGVuZGljdWxhciA6IG5vcm1hbC5wZXJwZW5kaWN1bGFyLm5lZ2F0ZWQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gYW5nbGUgaXMgY29udGFpbmVkIGJ5IHRoZSBhcmMgKHdoZXRoZXIgYSByYXkgZnJvbSB0aGUgYXJjJ3Mgb3JpZ2luIGdvaW5nIGluIHRoYXQgYW5nbGVcclxuICAgKiB3aWxsIGludGVyc2VjdCB0aGUgYXJjKS5cclxuICAgKi9cclxuICBwdWJsaWMgY29udGFpbnNBbmdsZSggYW5nbGU6IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIC8vIHRyYW5zZm9ybSB0aGUgYW5nbGUgaW50byB0aGUgYXBwcm9wcmlhdGUgY29vcmRpbmF0ZSBmb3JtXHJcbiAgICAvLyBUT0RPOiBjaGVjayBhbnRpY2xvY2t3aXNlIHZlcnNpb24hXHJcbiAgICBjb25zdCBub3JtYWxpemVkQW5nbGUgPSB0aGlzLl9hbnRpY2xvY2t3aXNlID8gYW5nbGUgLSB0aGlzLl9lbmRBbmdsZSA6IGFuZ2xlIC0gdGhpcy5fc3RhcnRBbmdsZTtcclxuXHJcbiAgICAvLyBnZXQgdGhlIGFuZ2xlIGJldHdlZW4gMCBhbmQgMnBpXHJcbiAgICBjb25zdCBwb3NpdGl2ZU1pbkFuZ2xlID0gVXRpbHMubW9kdWxvQmV0d2VlbkRvd24oIG5vcm1hbGl6ZWRBbmdsZSwgMCwgTWF0aC5QSSAqIDIgKTtcclxuXHJcbiAgICByZXR1cm4gcG9zaXRpdmVNaW5BbmdsZSA8PSB0aGlzLmFuZ2xlRGlmZmVyZW5jZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzdHJpbmcgY29udGFpbmluZyB0aGUgU1ZHIHBhdGguIGFzc3VtZXMgdGhhdCB0aGUgc3RhcnQgcG9pbnQgaXMgYWxyZWFkeSBwcm92aWRlZCxcclxuICAgKiBzbyBhbnl0aGluZyB0aGF0IGNhbGxzIHRoaXMgbmVlZHMgdG8gcHV0IHRoZSBNIGNhbGxzIGZpcnN0XHJcbiAgICovXHJcbiAgcHVibGljIGdldFNWR1BhdGhGcmFnbWVudCgpOiBzdHJpbmcge1xyXG4gICAgbGV0IG9sZFBhdGhGcmFnbWVudDtcclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICBvbGRQYXRoRnJhZ21lbnQgPSB0aGlzLl9zdmdQYXRoRnJhZ21lbnQ7XHJcbiAgICAgIHRoaXMuX3N2Z1BhdGhGcmFnbWVudCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoICF0aGlzLl9zdmdQYXRoRnJhZ21lbnQgKSB7XHJcbiAgICAgIC8vIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvcGF0aHMuaHRtbCNQYXRoRGF0YUVsbGlwdGljYWxBcmNDb21tYW5kcyBmb3IgbW9yZSBpbmZvXHJcbiAgICAgIC8vIHJ4IHJ5IHgtYXhpcy1yb3RhdGlvbiBsYXJnZS1hcmMtZmxhZyBzd2VlcC1mbGFnIHggeVxyXG5cclxuICAgICAgY29uc3QgZXBzaWxvbiA9IDAuMDE7IC8vIGFsbG93IHNvbWUgbGVld2F5IHRvIHJlbmRlciB0aGluZ3MgYXMgJ2FsbW9zdCBjaXJjbGVzJ1xyXG4gICAgICBjb25zdCBzd2VlcEZsYWcgPSB0aGlzLl9hbnRpY2xvY2t3aXNlID8gJzAnIDogJzEnO1xyXG4gICAgICBsZXQgbGFyZ2VBcmNGbGFnO1xyXG4gICAgICBpZiAoIHRoaXMuYW5nbGVEaWZmZXJlbmNlIDwgTWF0aC5QSSAqIDIgLSBlcHNpbG9uICkge1xyXG4gICAgICAgIGxhcmdlQXJjRmxhZyA9IHRoaXMuYW5nbGVEaWZmZXJlbmNlIDwgTWF0aC5QSSA/ICcwJyA6ICcxJztcclxuICAgICAgICB0aGlzLl9zdmdQYXRoRnJhZ21lbnQgPSBgQSAke3N2Z051bWJlciggdGhpcy5fcmFkaXVzICl9ICR7c3ZnTnVtYmVyKCB0aGlzLl9yYWRpdXMgKX0gMCAke2xhcmdlQXJjRmxhZ1xyXG4gICAgICAgIH0gJHtzd2VlcEZsYWd9ICR7c3ZnTnVtYmVyKCB0aGlzLmVuZC54ICl9ICR7c3ZnTnVtYmVyKCB0aGlzLmVuZC55ICl9YDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBjaXJjbGUgKG9yIGFsbW9zdC1jaXJjbGUpIGNhc2UgbmVlZHMgdG8gYmUgaGFuZGxlZCBkaWZmZXJlbnRseVxyXG4gICAgICAgIC8vIHNpbmNlIFNWRyB3aWxsIG5vdCBiZSBhYmxlIHRvIGRyYXcgKG9yIGtub3cgaG93IHRvIGRyYXcpIHRoZSBjb3JyZWN0IGNpcmNsZSBpZiB3ZSBqdXN0IGhhdmUgYSBzdGFydCBhbmQgZW5kLCB3ZSBuZWVkIHRvIHNwbGl0IGl0IGludG8gdHdvIGNpcmN1bGFyIGFyY3NcclxuXHJcbiAgICAgICAgLy8gZ2V0IHRoZSBhbmdsZSB0aGF0IGlzIGJldHdlZW4gYW5kIG9wcG9zaXRlIG9mIGJvdGggb2YgdGhlIHBvaW50c1xyXG4gICAgICAgIGNvbnN0IHNwbGl0T3Bwb3NpdGVBbmdsZSA9ICggdGhpcy5fc3RhcnRBbmdsZSArIHRoaXMuX2VuZEFuZ2xlICkgLyAyOyAvLyB0aGlzIF9zaG91bGRfIHdvcmsgZm9yIHRoZSBtb2R1bGFyIGNhc2U/XHJcbiAgICAgICAgY29uc3Qgc3BsaXRQb2ludCA9IHRoaXMuX2NlbnRlci5wbHVzKCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCB0aGlzLl9yYWRpdXMsIHNwbGl0T3Bwb3NpdGVBbmdsZSApICk7XHJcblxyXG4gICAgICAgIGxhcmdlQXJjRmxhZyA9ICcwJzsgLy8gc2luY2Ugd2Ugc3BsaXQgaXQgaW4gMiwgaXQncyBhbHdheXMgdGhlIHNtYWxsIGFyY1xyXG5cclxuICAgICAgICBjb25zdCBmaXJzdEFyYyA9IGBBICR7c3ZnTnVtYmVyKCB0aGlzLl9yYWRpdXMgKX0gJHtzdmdOdW1iZXIoIHRoaXMuX3JhZGl1cyApfSAwICR7XHJcbiAgICAgICAgICBsYXJnZUFyY0ZsYWd9ICR7c3dlZXBGbGFnfSAke3N2Z051bWJlciggc3BsaXRQb2ludC54ICl9ICR7c3ZnTnVtYmVyKCBzcGxpdFBvaW50LnkgKX1gO1xyXG4gICAgICAgIGNvbnN0IHNlY29uZEFyYyA9IGBBICR7c3ZnTnVtYmVyKCB0aGlzLl9yYWRpdXMgKX0gJHtzdmdOdW1iZXIoIHRoaXMuX3JhZGl1cyApfSAwICR7XHJcbiAgICAgICAgICBsYXJnZUFyY0ZsYWd9ICR7c3dlZXBGbGFnfSAke3N2Z051bWJlciggdGhpcy5lbmQueCApfSAke3N2Z051bWJlciggdGhpcy5lbmQueSApfWA7XHJcblxyXG4gICAgICAgIHRoaXMuX3N2Z1BhdGhGcmFnbWVudCA9IGAke2ZpcnN0QXJjfSAke3NlY29uZEFyY31gO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIGFzc2VydCApIHtcclxuICAgICAgaWYgKCBvbGRQYXRoRnJhZ21lbnQgKSB7XHJcbiAgICAgICAgYXNzZXJ0KCBvbGRQYXRoRnJhZ21lbnQgPT09IHRoaXMuX3N2Z1BhdGhGcmFnbWVudCwgJ1F1YWRyYXRpYyBsaW5lIHNlZ21lbnQgY2hhbmdlZCB3aXRob3V0IGludmFsaWRhdGUoKScgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX3N2Z1BhdGhGcmFnbWVudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgYXJjcyB0aGF0IHdpbGwgZHJhdyBhbiBvZmZzZXQgb24gdGhlIGxvZ2ljYWwgbGVmdCBzaWRlXHJcbiAgICovXHJcbiAgcHVibGljIHN0cm9rZUxlZnQoIGxpbmVXaWR0aDogbnVtYmVyICk6IEFyY1tdIHtcclxuICAgIHJldHVybiBbIG5ldyBBcmMoIHRoaXMuX2NlbnRlciwgdGhpcy5fcmFkaXVzICsgKCB0aGlzLl9hbnRpY2xvY2t3aXNlID8gMSA6IC0xICkgKiBsaW5lV2lkdGggLyAyLCB0aGlzLl9zdGFydEFuZ2xlLCB0aGlzLl9lbmRBbmdsZSwgdGhpcy5fYW50aWNsb2Nrd2lzZSApIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFyY3MgdGhhdCB3aWxsIGRyYXcgYW4gb2Zmc2V0IGN1cnZlIG9uIHRoZSBsb2dpY2FsIHJpZ2h0IHNpZGVcclxuICAgKi9cclxuICBwdWJsaWMgc3Ryb2tlUmlnaHQoIGxpbmVXaWR0aDogbnVtYmVyICk6IEFyY1tdIHtcclxuICAgIHJldHVybiBbIG5ldyBBcmMoIHRoaXMuX2NlbnRlciwgdGhpcy5fcmFkaXVzICsgKCB0aGlzLl9hbnRpY2xvY2t3aXNlID8gLTEgOiAxICkgKiBsaW5lV2lkdGggLyAyLCB0aGlzLl9lbmRBbmdsZSwgdGhpcy5fc3RhcnRBbmdsZSwgIXRoaXMuX2FudGljbG9ja3dpc2UgKSBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGxpc3Qgb2YgdCB2YWx1ZXMgd2hlcmUgZHgvZHQgb3IgZHkvZHQgaXMgMCB3aGVyZSAwIDwgdCA8IDEuIHN1YmRpdmlkaW5nIG9uIHRoZXNlIHdpbGwgcmVzdWx0IGluIG1vbm90b25pYyBzZWdtZW50c1xyXG4gICAqIERvZXMgbm90IGluY2x1ZGUgdD0wIGFuZCB0PTFcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0SW50ZXJpb3JFeHRyZW1hVHMoKTogbnVtYmVyW10ge1xyXG4gICAgY29uc3QgcmVzdWx0OiBudW1iZXJbXSA9IFtdO1xyXG4gICAgXy5lYWNoKCBbIDAsIE1hdGguUEkgLyAyLCBNYXRoLlBJLCAzICogTWF0aC5QSSAvIDIgXSwgYW5nbGUgPT4ge1xyXG4gICAgICBpZiAoIHRoaXMuY29udGFpbnNBbmdsZSggYW5nbGUgKSApIHtcclxuICAgICAgICBjb25zdCB0ID0gdGhpcy50QXRBbmdsZSggYW5nbGUgKTtcclxuICAgICAgICBjb25zdCBlcHNpbG9uID0gMC4wMDAwMDAwMDAxOyAvLyBUT0RPOiBnZW5lcmFsIGtpdGUgZXBzaWxvbj8sIGFsc28gZG8gMWUtTnVtYmVyIGZvcm1hdFxyXG4gICAgICAgIGlmICggdCA+IGVwc2lsb24gJiYgdCA8IDEgLSBlcHNpbG9uICkge1xyXG4gICAgICAgICAgcmVzdWx0LnB1c2goIHQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHJldHVybiByZXN1bHQuc29ydCgpOyAvLyBtb2RpZmllcyBvcmlnaW5hbCwgd2hpY2ggaXMgT0tcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhpdC10ZXN0cyB0aGlzIHNlZ21lbnQgd2l0aCB0aGUgcmF5LiBBbiBhcnJheSBvZiBhbGwgaW50ZXJzZWN0aW9ucyBvZiB0aGUgcmF5IHdpdGggdGhpcyBzZWdtZW50IHdpbGwgYmUgcmV0dXJuZWQuXHJcbiAgICogRm9yIGRldGFpbHMsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBpbiBTZWdtZW50LmpzXHJcbiAgICovXHJcbiAgcHVibGljIGludGVyc2VjdGlvbiggcmF5OiBSYXkyICk6IFJheUludGVyc2VjdGlvbltdIHtcclxuICAgIGNvbnN0IHJlc3VsdDogUmF5SW50ZXJzZWN0aW9uW10gPSBbXTsgLy8gaGl0cyBpbiBvcmRlclxyXG5cclxuICAgIC8vIGxlZnQgaGVyZSwgaWYgaW4gdGhlIGZ1dHVyZSB3ZSB3YW50IHRvIGJldHRlci1oYW5kbGUgYm91bmRhcnkgcG9pbnRzXHJcbiAgICBjb25zdCBlcHNpbG9uID0gMDtcclxuXHJcbiAgICAvLyBSdW4gYSBnZW5lcmFsIGNpcmNsZS1pbnRlcnNlY3Rpb24gcm91dGluZSwgdGhlbiB3ZSBjYW4gdGVzdCB0aGUgYW5nbGVzIGxhdGVyLlxyXG4gICAgLy8gU29sdmVzIGZvciB0aGUgdHdvIHNvbHV0aW9ucyB0IHN1Y2ggdGhhdCByYXkucG9zaXRpb24gKyByYXkuZGlyZWN0aW9uICogdCBpcyBvbiB0aGUgY2lyY2xlLlxyXG4gICAgLy8gVGhlbiB3ZSBjaGVjayB3aGV0aGVyIHRoZSBhbmdsZSBhdCBlYWNoIHBvc3NpYmxlIGhpdCBwb2ludCBpcyBpbiBvdXIgYXJjLlxyXG4gICAgY29uc3QgY2VudGVyVG9SYXkgPSByYXkucG9zaXRpb24ubWludXMoIHRoaXMuX2NlbnRlciApO1xyXG4gICAgY29uc3QgdG1wID0gcmF5LmRpcmVjdGlvbi5kb3QoIGNlbnRlclRvUmF5ICk7XHJcbiAgICBjb25zdCBjZW50ZXJUb1JheURpc3RTcSA9IGNlbnRlclRvUmF5Lm1hZ25pdHVkZVNxdWFyZWQ7XHJcbiAgICBjb25zdCBkaXNjcmltaW5hbnQgPSA0ICogdG1wICogdG1wIC0gNCAqICggY2VudGVyVG9SYXlEaXN0U3EgLSB0aGlzLl9yYWRpdXMgKiB0aGlzLl9yYWRpdXMgKTtcclxuICAgIGlmICggZGlzY3JpbWluYW50IDwgZXBzaWxvbiApIHtcclxuICAgICAgLy8gcmF5IG1pc3NlcyBjaXJjbGUgZW50aXJlbHlcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIGNvbnN0IGJhc2UgPSByYXkuZGlyZWN0aW9uLmRvdCggdGhpcy5fY2VudGVyICkgLSByYXkuZGlyZWN0aW9uLmRvdCggcmF5LnBvc2l0aW9uICk7XHJcbiAgICBjb25zdCBzcXQgPSBNYXRoLnNxcnQoIGRpc2NyaW1pbmFudCApIC8gMjtcclxuICAgIGNvbnN0IHRhID0gYmFzZSAtIHNxdDtcclxuICAgIGNvbnN0IHRiID0gYmFzZSArIHNxdDtcclxuXHJcbiAgICBpZiAoIHRiIDwgZXBzaWxvbiApIHtcclxuICAgICAgLy8gY2lyY2xlIGlzIGJlaGluZCByYXlcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwb2ludEIgPSByYXkucG9pbnRBdERpc3RhbmNlKCB0YiApO1xyXG4gICAgY29uc3Qgbm9ybWFsQiA9IHBvaW50Qi5taW51cyggdGhpcy5fY2VudGVyICkubm9ybWFsaXplZCgpO1xyXG4gICAgY29uc3Qgbm9ybWFsQkFuZ2xlID0gbm9ybWFsQi5hbmdsZTtcclxuXHJcbiAgICBpZiAoIHRhIDwgZXBzaWxvbiApIHtcclxuICAgICAgLy8gd2UgYXJlIGluc2lkZSB0aGUgY2lyY2xlLCBzbyBvbmx5IG9uZSBpbnRlcnNlY3Rpb24gaXMgcG9zc2libGVcclxuICAgICAgaWYgKCB0aGlzLmNvbnRhaW5zQW5nbGUoIG5vcm1hbEJBbmdsZSApICkge1xyXG4gICAgICAgIC8vIG5vcm1hbCBpcyB0b3dhcmRzIHRoZSByYXksIHNvIHdlIG5lZ2F0ZSBpdC4gYWxzbyB3aW5kcyBvcHBvc2l0ZSB3YXlcclxuICAgICAgICByZXN1bHQucHVzaCggbmV3IFJheUludGVyc2VjdGlvbiggdGIsIHBvaW50Qiwgbm9ybWFsQi5uZWdhdGVkKCksIHRoaXMuX2FudGljbG9ja3dpc2UgPyAtMSA6IDEsIHRoaXMudEF0QW5nbGUoIG5vcm1hbEJBbmdsZSApICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIHR3byBwb3NzaWJsZSBoaXRzIChvdXRzaWRlIGNpcmNsZSlcclxuICAgICAgY29uc3QgcG9pbnRBID0gcmF5LnBvaW50QXREaXN0YW5jZSggdGEgKTtcclxuICAgICAgY29uc3Qgbm9ybWFsQSA9IHBvaW50QS5taW51cyggdGhpcy5fY2VudGVyICkubm9ybWFsaXplZCgpO1xyXG4gICAgICBjb25zdCBub3JtYWxBQW5nbGUgPSBub3JtYWxBLmFuZ2xlO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLmNvbnRhaW5zQW5nbGUoIG5vcm1hbEFBbmdsZSApICkge1xyXG4gICAgICAgIC8vIGhpdCBmcm9tIG91dHNpZGVcclxuICAgICAgICByZXN1bHQucHVzaCggbmV3IFJheUludGVyc2VjdGlvbiggdGEsIHBvaW50QSwgbm9ybWFsQSwgdGhpcy5fYW50aWNsb2Nrd2lzZSA/IDEgOiAtMSwgdGhpcy50QXRBbmdsZSggbm9ybWFsQUFuZ2xlICkgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdGhpcy5jb250YWluc0FuZ2xlKCBub3JtYWxCQW5nbGUgKSApIHtcclxuICAgICAgICByZXN1bHQucHVzaCggbmV3IFJheUludGVyc2VjdGlvbiggdGIsIHBvaW50Qiwgbm9ybWFsQi5uZWdhdGVkKCksIHRoaXMuX2FudGljbG9ja3dpc2UgPyAtMSA6IDEsIHRoaXMudEF0QW5nbGUoIG5vcm1hbEJBbmdsZSApICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSByZXN1bHRhbnQgd2luZGluZyBudW1iZXIgb2YgdGhpcyByYXkgaW50ZXJzZWN0aW5nIHRoaXMgYXJjLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB3aW5kaW5nSW50ZXJzZWN0aW9uKCByYXk6IFJheTIgKTogbnVtYmVyIHtcclxuICAgIGxldCB3aW5kID0gMDtcclxuICAgIGNvbnN0IGhpdHMgPSB0aGlzLmludGVyc2VjdGlvbiggcmF5ICk7XHJcbiAgICBfLmVhY2goIGhpdHMsIGhpdCA9PiB7XHJcbiAgICAgIHdpbmQgKz0gaGl0LndpbmQ7XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gd2luZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERyYXdzIHRoaXMgYXJjIHRvIHRoZSAyRCBDYW52YXMgY29udGV4dCwgYXNzdW1pbmcgdGhlIGNvbnRleHQncyBjdXJyZW50IGxvY2F0aW9uIGlzIGFscmVhZHkgYXQgdGhlIHN0YXJ0IHBvaW50XHJcbiAgICovXHJcbiAgcHVibGljIHdyaXRlVG9Db250ZXh0KCBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgKTogdm9pZCB7XHJcbiAgICBjb250ZXh0LmFyYyggdGhpcy5fY2VudGVyLngsIHRoaXMuX2NlbnRlci55LCB0aGlzLl9yYWRpdXMsIHRoaXMuX3N0YXJ0QW5nbGUsIHRoaXMuX2VuZEFuZ2xlLCB0aGlzLl9hbnRpY2xvY2t3aXNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IGNvcHkgb2YgdGhpcyBhcmMsIHRyYW5zZm9ybWVkIGJ5IHRoZSBnaXZlbiBtYXRyaXguXHJcbiAgICpcclxuICAgKiBUT0RPOiB0ZXN0IHZhcmlvdXMgdHJhbnNmb3JtIHR5cGVzLCBlc3BlY2lhbGx5IHJvdGF0aW9ucywgc2NhbGluZywgc2hlYXJzLCBldGMuXHJcbiAgICovXHJcbiAgcHVibGljIHRyYW5zZm9ybWVkKCBtYXRyaXg6IE1hdHJpeDMgKTogQXJjIHwgRWxsaXB0aWNhbEFyYyB7XHJcbiAgICAvLyBzbyB3ZSBjYW4gaGFuZGxlIHJlZmxlY3Rpb25zIGluIHRoZSB0cmFuc2Zvcm0sIHdlIGRvIHRoZSBnZW5lcmFsIGNhc2UgaGFuZGxpbmcgZm9yIHN0YXJ0L2VuZCBhbmdsZXNcclxuICAgIGNvbnN0IHN0YXJ0QW5nbGUgPSBtYXRyaXgudGltZXNWZWN0b3IyKCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCAxLCB0aGlzLl9zdGFydEFuZ2xlICkgKS5taW51cyggbWF0cml4LnRpbWVzVmVjdG9yMiggVmVjdG9yMi5aRVJPICkgKS5hbmdsZTtcclxuICAgIGxldCBlbmRBbmdsZSA9IG1hdHJpeC50aW1lc1ZlY3RvcjIoIFZlY3RvcjIuY3JlYXRlUG9sYXIoIDEsIHRoaXMuX2VuZEFuZ2xlICkgKS5taW51cyggbWF0cml4LnRpbWVzVmVjdG9yMiggVmVjdG9yMi5aRVJPICkgKS5hbmdsZTtcclxuXHJcbiAgICAvLyByZXZlcnNlIHRoZSAnY2xvY2t3aXNlbmVzcycgaWYgb3VyIHRyYW5zZm9ybSBpbmNsdWRlcyBhIHJlZmxlY3Rpb25cclxuICAgIGNvbnN0IGFudGljbG9ja3dpc2UgPSBtYXRyaXguZ2V0RGV0ZXJtaW5hbnQoKSA+PSAwID8gdGhpcy5fYW50aWNsb2Nrd2lzZSA6ICF0aGlzLl9hbnRpY2xvY2t3aXNlO1xyXG5cclxuICAgIGlmICggTWF0aC5hYnMoIHRoaXMuX2VuZEFuZ2xlIC0gdGhpcy5fc3RhcnRBbmdsZSApID09PSBNYXRoLlBJICogMiApIHtcclxuICAgICAgZW5kQW5nbGUgPSBhbnRpY2xvY2t3aXNlID8gc3RhcnRBbmdsZSAtIE1hdGguUEkgKiAyIDogc3RhcnRBbmdsZSArIE1hdGguUEkgKiAyO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNjYWxlVmVjdG9yID0gbWF0cml4LmdldFNjYWxlVmVjdG9yKCk7XHJcbiAgICBpZiAoIHNjYWxlVmVjdG9yLnggIT09IHNjYWxlVmVjdG9yLnkgKSB7XHJcbiAgICAgIGNvbnN0IHJhZGl1c1ggPSBzY2FsZVZlY3Rvci54ICogdGhpcy5fcmFkaXVzO1xyXG4gICAgICBjb25zdCByYWRpdXNZID0gc2NhbGVWZWN0b3IueSAqIHRoaXMuX3JhZGl1cztcclxuICAgICAgcmV0dXJuIG5ldyBFbGxpcHRpY2FsQXJjKCBtYXRyaXgudGltZXNWZWN0b3IyKCB0aGlzLl9jZW50ZXIgKSwgcmFkaXVzWCwgcmFkaXVzWSwgMCwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGFudGljbG9ja3dpc2UgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb25zdCByYWRpdXMgPSBzY2FsZVZlY3Rvci54ICogdGhpcy5fcmFkaXVzO1xyXG4gICAgICByZXR1cm4gbmV3IEFyYyggbWF0cml4LnRpbWVzVmVjdG9yMiggdGhpcy5fY2VudGVyICksIHJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGFudGljbG9ja3dpc2UgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNvbnRyaWJ1dGlvbiB0byB0aGUgc2lnbmVkIGFyZWEgY29tcHV0ZWQgdXNpbmcgR3JlZW4ncyBUaGVvcmVtLCB3aXRoIFA9LXkvMiBhbmQgUT14LzIuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIGlzIHRoaXMgc2VnbWVudCdzIGNvbnRyaWJ1dGlvbiB0byB0aGUgbGluZSBpbnRlZ3JhbCAoLXkvMiBkeCArIHgvMiBkeSkuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFNpZ25lZEFyZWFGcmFnbWVudCgpOiBudW1iZXIge1xyXG4gICAgY29uc3QgdDAgPSB0aGlzLl9zdGFydEFuZ2xlO1xyXG4gICAgY29uc3QgdDEgPSB0aGlzLmdldEFjdHVhbEVuZEFuZ2xlKCk7XHJcblxyXG4gICAgLy8gRGVyaXZlZCB2aWEgTWF0aGVtYXRpY2EgKGN1cnZlLWFyZWEubmIpXHJcbiAgICByZXR1cm4gMC41ICogdGhpcy5fcmFkaXVzICogKCB0aGlzLl9yYWRpdXMgKiAoIHQxIC0gdDAgKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jZW50ZXIueCAqICggTWF0aC5zaW4oIHQxICkgLSBNYXRoLnNpbiggdDAgKSApIC1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NlbnRlci55ICogKCBNYXRoLmNvcyggdDEgKSAtIE1hdGguY29zKCB0MCApICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSByZXZlcnNlZCBjb3B5IG9mIHRoaXMgc2VnbWVudCAobWFwcGluZyB0aGUgcGFyYW1ldHJpemF0aW9uIGZyb20gWzAsMV0gPT4gWzEsMF0pLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXZlcnNlZCgpOiBBcmMge1xyXG4gICAgcmV0dXJuIG5ldyBBcmMoIHRoaXMuX2NlbnRlciwgdGhpcy5fcmFkaXVzLCB0aGlzLl9lbmRBbmdsZSwgdGhpcy5fc3RhcnRBbmdsZSwgIXRoaXMuX2FudGljbG9ja3dpc2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGFyYyBsZW5ndGggb2YgdGhlIHNlZ21lbnQuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGdldEFyY0xlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0QW5nbGVEaWZmZXJlbmNlKCkgKiB0aGlzLl9yYWRpdXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXZSBjYW4gaGFuZGxlIHRoaXMgc2ltcGx5IGJ5IHJldHVybmluZyBvdXJzZWx2ZXMuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIHRvUGllY2V3aXNlTGluZWFyT3JBcmNTZWdtZW50cygpOiBTZWdtZW50W10ge1xyXG4gICAgcmV0dXJuIFsgdGhpcyBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cclxuICAgKi9cclxuICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRBcmMge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogJ0FyYycsXHJcbiAgICAgIGNlbnRlclg6IHRoaXMuX2NlbnRlci54LFxyXG4gICAgICBjZW50ZXJZOiB0aGlzLl9jZW50ZXIueSxcclxuICAgICAgcmFkaXVzOiB0aGlzLl9yYWRpdXMsXHJcbiAgICAgIHN0YXJ0QW5nbGU6IHRoaXMuX3N0YXJ0QW5nbGUsXHJcbiAgICAgIGVuZEFuZ2xlOiB0aGlzLl9lbmRBbmdsZSxcclxuICAgICAgYW50aWNsb2Nrd2lzZTogdGhpcy5fYW50aWNsb2Nrd2lzZVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSB3aGV0aGVyIHR3byBsaW5lcyBvdmVybGFwIG92ZXIgYSBjb250aW51b3VzIHNlY3Rpb24sIGFuZCBpZiBzbyBmaW5kcyB0aGUgYSxiIHBhaXIgc3VjaCB0aGF0XHJcbiAgICogcCggdCApID09PSBxKCBhICogdCArIGIgKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzZWdtZW50XHJcbiAgICogQHBhcmFtIFtlcHNpbG9uXSAtIFdpbGwgcmV0dXJuIG92ZXJsYXBzIG9ubHkgaWYgbm8gdHdvIGNvcnJlc3BvbmRpbmcgcG9pbnRzIGRpZmZlciBieSB0aGlzIGFtb3VudCBvciBtb3JlXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluIG9uZSBjb21wb25lbnQuXHJcbiAgICogQHJldHVybnMgLSBUaGUgc29sdXRpb24sIGlmIHRoZXJlIGlzIG9uZSAoYW5kIG9ubHkgb25lKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRPdmVybGFwcyggc2VnbWVudDogU2VnbWVudCwgZXBzaWxvbiA9IDFlLTYgKTogT3ZlcmxhcFtdIHwgbnVsbCB7XHJcbiAgICBpZiAoIHNlZ21lbnQgaW5zdGFuY2VvZiBBcmMgKSB7XHJcbiAgICAgIHJldHVybiBBcmMuZ2V0T3ZlcmxhcHMoIHRoaXMsIHNlZ21lbnQgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gQXJjIGZyb20gdGhlIHNlcmlhbGl6ZWQgcmVwcmVzZW50YXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBvdmVycmlkZSBkZXNlcmlhbGl6ZSggb2JqOiBTZXJpYWxpemVkQXJjICk6IEFyYyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvYmoudHlwZSA9PT0gJ0FyYycgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IEFyYyggbmV3IFZlY3RvcjIoIG9iai5jZW50ZXJYLCBvYmouY2VudGVyWSApLCBvYmoucmFkaXVzLCBvYmouc3RhcnRBbmdsZSwgb2JqLmVuZEFuZ2xlLCBvYmouYW50aWNsb2Nrd2lzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB0aGUgYWN0dWFsIGVuZCBhbmdsZSAoY29tcGFyZWQgdG8gdGhlIHN0YXJ0IGFuZ2xlKS5cclxuICAgKlxyXG4gICAqIE5vcm1hbGl6ZXMgdGhlIHNpZ24gb2YgdGhlIGFuZ2xlcywgc28gdGhhdCB0aGUgc2lnbiBvZiAoIGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSApIG1hdGNoZXMgd2hldGhlciBpdCBpc1xyXG4gICAqIGFudGljbG9ja3dpc2UuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjb21wdXRlQWN0dWFsRW5kQW5nbGUoIHN0YXJ0QW5nbGU6IG51bWJlciwgZW5kQW5nbGU6IG51bWJlciwgYW50aWNsb2Nrd2lzZTogYm9vbGVhbiApOiBudW1iZXIge1xyXG4gICAgaWYgKCBhbnRpY2xvY2t3aXNlICkge1xyXG4gICAgICAvLyBhbmdsZSBpcyAnZGVjcmVhc2luZydcclxuICAgICAgLy8gLTJwaSA8PSBlbmQgLSBzdGFydCA8IDJwaVxyXG4gICAgICBpZiAoIHN0YXJ0QW5nbGUgPiBlbmRBbmdsZSApIHtcclxuICAgICAgICByZXR1cm4gZW5kQW5nbGU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHN0YXJ0QW5nbGUgPCBlbmRBbmdsZSApIHtcclxuICAgICAgICByZXR1cm4gZW5kQW5nbGUgLSAyICogTWF0aC5QSTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBlcXVhbFxyXG4gICAgICAgIHJldHVybiBzdGFydEFuZ2xlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gYW5nbGUgaXMgJ2luY3JlYXNpbmcnXHJcbiAgICAgIC8vIC0ycGkgPCBlbmQgLSBzdGFydCA8PSAycGlcclxuICAgICAgaWYgKCBzdGFydEFuZ2xlIDwgZW5kQW5nbGUgKSB7XHJcbiAgICAgICAgcmV0dXJuIGVuZEFuZ2xlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBzdGFydEFuZ2xlID4gZW5kQW5nbGUgKSB7XHJcbiAgICAgICAgcmV0dXJuIGVuZEFuZ2xlICsgTWF0aC5QSSAqIDI7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gZXF1YWxcclxuICAgICAgICByZXR1cm4gc3RhcnRBbmdsZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZXMgdGhlIHBvdGVudGlhbCBvdmVybGFwIGJldHdlZW4gWzAsZW5kMV0gYW5kIFtzdGFydDIsZW5kMl0gKHdpdGggdC12YWx1ZXMgWzAsMV0gYW5kIFt0U3RhcnQyLHRFbmQyXSkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZW5kMSAtIFJlbGF0aXZlIGVuZCBhbmdsZSBvZiB0aGUgZmlyc3Qgc2VnbWVudFxyXG4gICAqIEBwYXJhbSBzdGFydDIgLSBSZWxhdGl2ZSBzdGFydCBhbmdsZSBvZiB0aGUgc2Vjb25kIHNlZ21lbnRcclxuICAgKiBAcGFyYW0gZW5kMiAtIFJlbGF0aXZlIGVuZCBhbmdsZSBvZiB0aGUgc2Vjb25kIHNlZ21lbnRcclxuICAgKiBAcGFyYW0gdFN0YXJ0MiAtIFRoZSBwYXJhbWV0cmljIHZhbHVlIG9mIHRoZSBzZWNvbmQgc2VnbWVudCdzIHN0YXJ0XHJcbiAgICogQHBhcmFtIHRFbmQyIC0gVGhlIHBhcmFtZXRyaWMgdmFsdWUgb2YgdGhlIHNlY29uZCBzZWdtZW50J3MgZW5kXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0UGFydGlhbE92ZXJsYXAoIGVuZDE6IG51bWJlciwgc3RhcnQyOiBudW1iZXIsIGVuZDI6IG51bWJlciwgdFN0YXJ0MjogbnVtYmVyLCB0RW5kMjogbnVtYmVyICk6IE92ZXJsYXBbXSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbmQxID4gMCAmJiBlbmQxIDw9IFRXT19QSSArIDFlLTEwICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdGFydDIgPj0gMCAmJiBzdGFydDIgPCBUV09fUEkgKyAxZS0xMCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZW5kMiA+PSAwICYmIGVuZDIgPD0gVFdPX1BJICsgMWUtMTAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRTdGFydDIgPj0gMCAmJiB0U3RhcnQyIDw9IDEgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRFbmQyID49IDAgJiYgdEVuZDIgPD0gMSApO1xyXG5cclxuICAgIGNvbnN0IHJldmVyc2VkMiA9IGVuZDIgPCBzdGFydDI7XHJcbiAgICBjb25zdCBtaW4yID0gcmV2ZXJzZWQyID8gZW5kMiA6IHN0YXJ0MjtcclxuICAgIGNvbnN0IG1heDIgPSByZXZlcnNlZDIgPyBzdGFydDIgOiBlbmQyO1xyXG5cclxuICAgIGNvbnN0IG92ZXJsYXBNaW4gPSBtaW4yO1xyXG4gICAgY29uc3Qgb3ZlcmxhcE1heCA9IE1hdGgubWluKCBlbmQxLCBtYXgyICk7XHJcblxyXG4gICAgLy8gSWYgdGhlcmUncyBub3QgYSBzbWFsbCBhbW91bnQgb2Ygb3ZlcmxhcFxyXG4gICAgaWYgKCBvdmVybGFwTWF4IDwgb3ZlcmxhcE1pbiArIDFlLTggKSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gWyBPdmVybGFwLmNyZWF0ZUxpbmVhcihcclxuICAgICAgICAvLyBtaW5pbXVtXHJcbiAgICAgICAgVXRpbHMuY2xhbXAoIFV0aWxzLmxpbmVhciggMCwgZW5kMSwgMCwgMSwgb3ZlcmxhcE1pbiApLCAwLCAxICksIC8vIGFyYzEgbWluXHJcbiAgICAgICAgVXRpbHMuY2xhbXAoIFV0aWxzLmxpbmVhciggc3RhcnQyLCBlbmQyLCB0U3RhcnQyLCB0RW5kMiwgb3ZlcmxhcE1pbiApLCAwLCAxICksIC8vIGFyYzIgbWluXHJcbiAgICAgICAgLy8gbWF4aW11bVxyXG4gICAgICAgIFV0aWxzLmNsYW1wKCBVdGlscy5saW5lYXIoIDAsIGVuZDEsIDAsIDEsIG92ZXJsYXBNYXggKSwgMCwgMSApLCAvLyBhcmMxIG1heFxyXG4gICAgICAgIFV0aWxzLmNsYW1wKCBVdGlscy5saW5lYXIoIHN0YXJ0MiwgZW5kMiwgdFN0YXJ0MiwgdEVuZDIsIG92ZXJsYXBNYXggKSwgMCwgMSApIC8vIGFyYzIgbWF4XHJcbiAgICAgICkgXTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSB3aGV0aGVyIHR3byBBcmNzIG92ZXJsYXAgb3ZlciBjb250aW51b3VzIHNlY3Rpb25zLCBhbmQgaWYgc28gZmluZHMgdGhlIGEsYiBwYWlycyBzdWNoIHRoYXRcclxuICAgKiBwKCB0ICkgPT09IHEoIGEgKiB0ICsgYiApLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXJ0QW5nbGUxIC0gU3RhcnQgYW5nbGUgb2YgYXJjIDFcclxuICAgKiBAcGFyYW0gZW5kQW5nbGUxIC0gXCJBY3R1YWxcIiBlbmQgYW5nbGUgb2YgYXJjIDFcclxuICAgKiBAcGFyYW0gc3RhcnRBbmdsZTIgLSBTdGFydCBhbmdsZSBvZiBhcmMgMlxyXG4gICAqIEBwYXJhbSBlbmRBbmdsZTIgLSBcIkFjdHVhbFwiIGVuZCBhbmdsZSBvZiBhcmMgMlxyXG4gICAqIEByZXR1cm5zIC0gQW55IG92ZXJsYXBzIChmcm9tIDAgdG8gMilcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldEFuZ3VsYXJPdmVybGFwcyggc3RhcnRBbmdsZTE6IG51bWJlciwgZW5kQW5nbGUxOiBudW1iZXIsIHN0YXJ0QW5nbGUyOiBudW1iZXIsIGVuZEFuZ2xlMjogbnVtYmVyICk6IE92ZXJsYXBbXSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggc3RhcnRBbmdsZTEgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGVuZEFuZ2xlMSApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggc3RhcnRBbmdsZTIgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGVuZEFuZ2xlMiApICk7XHJcblxyXG4gICAgLy8gUmVtYXAgc3RhcnQgb2YgYXJjIDEgdG8gMCwgYW5kIHRoZSBlbmQgdG8gYmUgcG9zaXRpdmUgKHNpZ24xIClcclxuICAgIGxldCBlbmQxID0gZW5kQW5nbGUxIC0gc3RhcnRBbmdsZTE7XHJcbiAgICBjb25zdCBzaWduMSA9IGVuZDEgPCAwID8gLTEgOiAxO1xyXG4gICAgZW5kMSAqPSBzaWduMTtcclxuXHJcbiAgICAvLyBSZW1hcCBhcmMgMiBzbyB0aGUgc3RhcnQgcG9pbnQgbWFwcyB0byB0aGUgWzAsMnBpKSByYW5nZSAoYW5kIGVuZC1wb2ludCBtYXkgbGllIG91dHNpZGUgdGhhdClcclxuICAgIGNvbnN0IHN0YXJ0MiA9IFV0aWxzLm1vZHVsb0JldHdlZW5Eb3duKCBzaWduMSAqICggc3RhcnRBbmdsZTIgLSBzdGFydEFuZ2xlMSApLCAwLCBUV09fUEkgKTtcclxuICAgIGNvbnN0IGVuZDIgPSBzaWduMSAqICggZW5kQW5nbGUyIC0gc3RhcnRBbmdsZTIgKSArIHN0YXJ0MjtcclxuXHJcbiAgICBsZXQgd3JhcFQ7XHJcbiAgICBpZiAoIGVuZDIgPCAtMWUtMTAgKSB7XHJcbiAgICAgIHdyYXBUID0gLXN0YXJ0MiAvICggZW5kMiAtIHN0YXJ0MiApO1xyXG4gICAgICByZXR1cm4gQXJjLmdldFBhcnRpYWxPdmVybGFwKCBlbmQxLCBzdGFydDIsIDAsIDAsIHdyYXBUICkuY29uY2F0KCBBcmMuZ2V0UGFydGlhbE92ZXJsYXAoIGVuZDEsIFRXT19QSSwgZW5kMiArIFRXT19QSSwgd3JhcFQsIDEgKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGVuZDIgPiBUV09fUEkgKyAxZS0xMCApIHtcclxuICAgICAgd3JhcFQgPSAoIFRXT19QSSAtIHN0YXJ0MiApIC8gKCBlbmQyIC0gc3RhcnQyICk7XHJcbiAgICAgIHJldHVybiBBcmMuZ2V0UGFydGlhbE92ZXJsYXAoIGVuZDEsIHN0YXJ0MiwgVFdPX1BJLCAwLCB3cmFwVCApLmNvbmNhdCggQXJjLmdldFBhcnRpYWxPdmVybGFwKCBlbmQxLCAwLCBlbmQyIC0gVFdPX1BJLCB3cmFwVCwgMSApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIEFyYy5nZXRQYXJ0aWFsT3ZlcmxhcCggZW5kMSwgc3RhcnQyLCBlbmQyLCAwLCAxICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgd2hldGhlciB0d28gQXJjcyBvdmVybGFwIG92ZXIgY29udGludW91cyBzZWN0aW9ucywgYW5kIGlmIHNvIGZpbmRzIHRoZSBhLGIgcGFpcnMgc3VjaCB0aGF0XHJcbiAgICogcCggdCApID09PSBxKCBhICogdCArIGIgKS5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIC0gQW55IG92ZXJsYXBzIChmcm9tIDAgdG8gMilcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldE92ZXJsYXBzKCBhcmMxOiBBcmMsIGFyYzI6IEFyYyApOiBPdmVybGFwW10ge1xyXG5cclxuICAgIGlmICggYXJjMS5fY2VudGVyLmRpc3RhbmNlKCBhcmMyLl9jZW50ZXIgKSA+IDFlLTggfHwgTWF0aC5hYnMoIGFyYzEuX3JhZGl1cyAtIGFyYzIuX3JhZGl1cyApID4gMWUtOCApIHtcclxuICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBBcmMuZ2V0QW5ndWxhck92ZXJsYXBzKCBhcmMxLl9zdGFydEFuZ2xlLCBhcmMxLmdldEFjdHVhbEVuZEFuZ2xlKCksIGFyYzIuX3N0YXJ0QW5nbGUsIGFyYzIuZ2V0QWN0dWFsRW5kQW5nbGUoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgcG9pbnRzIG9mIGludGVyc2VjdGlvbnMgYmV0d2VlbiB0d28gY2lyY2xlcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjZW50ZXIxIC0gQ2VudGVyIG9mIHRoZSBmaXJzdCBjaXJjbGVcclxuICAgKiBAcGFyYW0gcmFkaXVzMSAtIFJhZGl1cyBvZiB0aGUgZmlyc3QgY2lyY2xlXHJcbiAgICogQHBhcmFtIGNlbnRlcjIgLSBDZW50ZXIgb2YgdGhlIHNlY29uZCBjaXJjbGVcclxuICAgKiBAcGFyYW0gcmFkaXVzMiAtIFJhZGl1cyBvZiB0aGUgc2Vjb25kIGNpcmNsZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0Q2lyY2xlSW50ZXJzZWN0aW9uUG9pbnQoIGNlbnRlcjE6IFZlY3RvcjIsIHJhZGl1czE6IG51bWJlciwgY2VudGVyMjogVmVjdG9yMiwgcmFkaXVzMjogbnVtYmVyICk6IFZlY3RvcjJbXSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggcmFkaXVzMSApICYmIHJhZGl1czEgPj0gMCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHJhZGl1czIgKSAmJiByYWRpdXMyID49IDAgKTtcclxuXHJcbiAgICBjb25zdCBkZWx0YSA9IGNlbnRlcjIubWludXMoIGNlbnRlcjEgKTtcclxuICAgIGNvbnN0IGQgPSBkZWx0YS5tYWduaXR1ZGU7XHJcbiAgICBsZXQgcmVzdWx0czogVmVjdG9yMltdID0gW107XHJcbiAgICBpZiAoIGQgPCAxZS0xMCB8fCBkID4gcmFkaXVzMSArIHJhZGl1czIgKyAxZS0xMCApIHtcclxuICAgICAgLy8gTm8gaW50ZXJzZWN0aW9uc1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGQgPiByYWRpdXMxICsgcmFkaXVzMiAtIDFlLTEwICkge1xyXG4gICAgICByZXN1bHRzID0gW1xyXG4gICAgICAgIGNlbnRlcjEuYmxlbmQoIGNlbnRlcjIsIHJhZGl1czEgLyBkIClcclxuICAgICAgXTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb25zdCB4UHJpbWUgPSAwLjUgKiAoIGQgKiBkIC0gcmFkaXVzMiAqIHJhZGl1czIgKyByYWRpdXMxICogcmFkaXVzMSApIC8gZDtcclxuICAgICAgY29uc3QgYml0ID0gZCAqIGQgLSByYWRpdXMyICogcmFkaXVzMiArIHJhZGl1czEgKiByYWRpdXMxO1xyXG4gICAgICBjb25zdCBkaXNjcmltaW5hbnQgPSA0ICogZCAqIGQgKiByYWRpdXMxICogcmFkaXVzMSAtIGJpdCAqIGJpdDtcclxuICAgICAgY29uc3QgYmFzZSA9IGNlbnRlcjEuYmxlbmQoIGNlbnRlcjIsIHhQcmltZSAvIGQgKTtcclxuICAgICAgaWYgKCBkaXNjcmltaW5hbnQgPj0gMWUtMTAgKSB7XHJcbiAgICAgICAgY29uc3QgeVByaW1lID0gTWF0aC5zcXJ0KCBkaXNjcmltaW5hbnQgKSAvIGQgLyAyO1xyXG4gICAgICAgIGNvbnN0IHBlcnBlbmRpY3VsYXIgPSBkZWx0YS5wZXJwZW5kaWN1bGFyLnNldE1hZ25pdHVkZSggeVByaW1lICk7XHJcbiAgICAgICAgcmVzdWx0cyA9IFtcclxuICAgICAgICAgIGJhc2UucGx1cyggcGVycGVuZGljdWxhciApLFxyXG4gICAgICAgICAgYmFzZS5taW51cyggcGVycGVuZGljdWxhciApXHJcbiAgICAgICAgXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggZGlzY3JpbWluYW50ID4gLTFlLTEwICkge1xyXG4gICAgICAgIHJlc3VsdHMgPSBbIGJhc2UgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIHJlc3VsdHMuZm9yRWFjaCggcmVzdWx0ID0+IHtcclxuICAgICAgICBhc3NlcnQhKCBNYXRoLmFicyggcmVzdWx0LmRpc3RhbmNlKCBjZW50ZXIxICkgLSByYWRpdXMxICkgPCAxZS04ICk7XHJcbiAgICAgICAgYXNzZXJ0ISggTWF0aC5hYnMoIHJlc3VsdC5kaXN0YW5jZSggY2VudGVyMiApIC0gcmFkaXVzMiApIDwgMWUtOCApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0cztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW55IChmaW5pdGUpIGludGVyc2VjdGlvbiBiZXR3ZWVuIHRoZSB0d28gYXJjIHNlZ21lbnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgb3ZlcnJpZGUgaW50ZXJzZWN0KCBhOiBBcmMsIGI6IEFyYyApOiBTZWdtZW50SW50ZXJzZWN0aW9uW10ge1xyXG4gICAgY29uc3QgZXBzaWxvbiA9IDFlLTg7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0cyA9IFtdO1xyXG5cclxuICAgIC8vIElmIHdlIGVmZmVjdGl2ZWx5IGhhdmUgdGhlIHNhbWUgY2lyY2xlLCBqdXN0IGRpZmZlcmVudCBzZWN0aW9ucyBvZiBpdC4gVGhlIG9ubHkgZmluaXRlIGludGVyc2VjdGlvbnMgY291bGQgYmVcclxuICAgIC8vIGF0IHRoZSBlbmRwb2ludHMsIHNvIHdlJ2xsIGluc3BlY3QgdGhvc2UuXHJcbiAgICBpZiAoIGEuX2NlbnRlci5lcXVhbHNFcHNpbG9uKCBiLl9jZW50ZXIsIGVwc2lsb24gKSAmJiBNYXRoLmFicyggYS5fcmFkaXVzIC0gYi5fcmFkaXVzICkgPCBlcHNpbG9uICkge1xyXG4gICAgICBjb25zdCBhU3RhcnQgPSBhLnBvc2l0aW9uQXQoIDAgKTtcclxuICAgICAgY29uc3QgYUVuZCA9IGEucG9zaXRpb25BdCggMSApO1xyXG4gICAgICBjb25zdCBiU3RhcnQgPSBiLnBvc2l0aW9uQXQoIDAgKTtcclxuICAgICAgY29uc3QgYkVuZCA9IGIucG9zaXRpb25BdCggMSApO1xyXG5cclxuICAgICAgaWYgKCBhU3RhcnQuZXF1YWxzRXBzaWxvbiggYlN0YXJ0LCBlcHNpbG9uICkgKSB7XHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKCBuZXcgU2VnbWVudEludGVyc2VjdGlvbiggYVN0YXJ0LmF2ZXJhZ2UoIGJTdGFydCApLCAwLCAwICkgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGFTdGFydC5lcXVhbHNFcHNpbG9uKCBiRW5kLCBlcHNpbG9uICkgKSB7XHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKCBuZXcgU2VnbWVudEludGVyc2VjdGlvbiggYVN0YXJ0LmF2ZXJhZ2UoIGJFbmQgKSwgMCwgMSApICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBhRW5kLmVxdWFsc0Vwc2lsb24oIGJTdGFydCwgZXBzaWxvbiApICkge1xyXG4gICAgICAgIHJlc3VsdHMucHVzaCggbmV3IFNlZ21lbnRJbnRlcnNlY3Rpb24oIGFFbmQuYXZlcmFnZSggYlN0YXJ0ICksIDEsIDAgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggYUVuZC5lcXVhbHNFcHNpbG9uKCBiRW5kLCBlcHNpbG9uICkgKSB7XHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKCBuZXcgU2VnbWVudEludGVyc2VjdGlvbiggYUVuZC5hdmVyYWdlKCBiRW5kICksIDEsIDEgKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgcG9pbnRzID0gQXJjLmdldENpcmNsZUludGVyc2VjdGlvblBvaW50KCBhLl9jZW50ZXIsIGEuX3JhZGl1cywgYi5fY2VudGVyLCBiLl9yYWRpdXMgKTtcclxuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBwb2ludCA9IHBvaW50c1sgaSBdO1xyXG4gICAgICAgIGNvbnN0IGFuZ2xlQSA9IHBvaW50Lm1pbnVzKCBhLl9jZW50ZXIgKS5hbmdsZTtcclxuICAgICAgICBjb25zdCBhbmdsZUIgPSBwb2ludC5taW51cyggYi5fY2VudGVyICkuYW5nbGU7XHJcblxyXG4gICAgICAgIGlmICggYS5jb250YWluc0FuZ2xlKCBhbmdsZUEgKSAmJiBiLmNvbnRhaW5zQW5nbGUoIGFuZ2xlQiApICkge1xyXG4gICAgICAgICAgcmVzdWx0cy5wdXNoKCBuZXcgU2VnbWVudEludGVyc2VjdGlvbiggcG9pbnQsIGEudEF0QW5nbGUoIGFuZ2xlQSApLCBiLnRBdEFuZ2xlKCBhbmdsZUIgKSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIEFyYyAob3IgaWYgc3RyYWlnaHQgZW5vdWdoIGEgTGluZSkgc2VnbWVudCB0aGF0IGdvZXMgZnJvbSB0aGUgc3RhcnRQb2ludCB0byB0aGUgZW5kUG9pbnQsIHRvdWNoaW5nXHJcbiAgICogdGhlIG1pZGRsZVBvaW50IHNvbWV3aGVyZSBiZXR3ZWVuIHRoZSB0d28uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVGcm9tUG9pbnRzKCBzdGFydFBvaW50OiBWZWN0b3IyLCBtaWRkbGVQb2ludDogVmVjdG9yMiwgZW5kUG9pbnQ6IFZlY3RvcjIgKTogU2VnbWVudCB7XHJcbiAgICBjb25zdCBjZW50ZXIgPSBVdGlscy5jaXJjbGVDZW50ZXJGcm9tUG9pbnRzKCBzdGFydFBvaW50LCBtaWRkbGVQb2ludCwgZW5kUG9pbnQgKTtcclxuXHJcbiAgICAvLyBDbG9zZSBlbm91Z2hcclxuICAgIGlmICggY2VudGVyID09PSBudWxsICkge1xyXG4gICAgICByZXR1cm4gbmV3IExpbmUoIHN0YXJ0UG9pbnQsIGVuZFBvaW50ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3Qgc3RhcnREaWZmID0gc3RhcnRQb2ludC5taW51cyggY2VudGVyICk7XHJcbiAgICAgIGNvbnN0IG1pZGRsZURpZmYgPSBtaWRkbGVQb2ludC5taW51cyggY2VudGVyICk7XHJcbiAgICAgIGNvbnN0IGVuZERpZmYgPSBlbmRQb2ludC5taW51cyggY2VudGVyICk7XHJcbiAgICAgIGNvbnN0IHN0YXJ0QW5nbGUgPSBzdGFydERpZmYuYW5nbGU7XHJcbiAgICAgIGNvbnN0IG1pZGRsZUFuZ2xlID0gbWlkZGxlRGlmZi5hbmdsZTtcclxuICAgICAgY29uc3QgZW5kQW5nbGUgPSBlbmREaWZmLmFuZ2xlO1xyXG5cclxuICAgICAgY29uc3QgcmFkaXVzID0gKCBzdGFydERpZmYubWFnbml0dWRlICsgbWlkZGxlRGlmZi5tYWduaXR1ZGUgKyBlbmREaWZmLm1hZ25pdHVkZSApIC8gMztcclxuXHJcbiAgICAgIC8vIFRyeSBhbnRpY2xvY2t3aXNlIGZpcnN0LiBUT0RPOiBEb24ndCByZXF1aXJlIGNyZWF0aW9uIG9mIGV4dHJhIEFyY3NcclxuICAgICAgY29uc3QgYXJjID0gbmV3IEFyYyggY2VudGVyLCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBmYWxzZSApO1xyXG4gICAgICBpZiAoIGFyYy5jb250YWluc0FuZ2xlKCBtaWRkbGVBbmdsZSApICkge1xyXG4gICAgICAgIHJldHVybiBhcmM7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBBcmMoIGNlbnRlciwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgdHJ1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5raXRlLnJlZ2lzdGVyKCAnQXJjJywgQXJjICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBR2hELE9BQU9DLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxTQUFTQyxhQUFhLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxPQUFPLEVBQUVDLGVBQWUsRUFBRUMsT0FBTyxFQUFFQyxtQkFBbUIsRUFBRUMsU0FBUyxRQUFRLGVBQWU7O0FBRTVIO0FBQ0EsTUFBTUMsTUFBTSxHQUFHQyxJQUFJLENBQUNDLEVBQUUsR0FBRyxDQUFDO0FBWTFCLGVBQWUsTUFBTUMsR0FBRyxTQUFTTixPQUFPLENBQUM7RUFRdkM7O0VBS3lDO0VBQ0U7O0VBSzNDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU08sV0FBV0EsQ0FBRUMsTUFBZSxFQUFFQyxNQUFjLEVBQUVDLFVBQWtCLEVBQUVDLFFBQWdCLEVBQUVDLGFBQXNCLEVBQUc7SUFDbEgsS0FBSyxDQUFDLENBQUM7SUFFUCxJQUFJLENBQUNDLE9BQU8sR0FBR0wsTUFBTTtJQUNyQixJQUFJLENBQUNNLE9BQU8sR0FBR0wsTUFBTTtJQUNyQixJQUFJLENBQUNNLFdBQVcsR0FBR0wsVUFBVTtJQUM3QixJQUFJLENBQUNNLFNBQVMsR0FBR0wsUUFBUTtJQUN6QixJQUFJLENBQUNNLGNBQWMsR0FBR0wsYUFBYTtJQUVuQyxJQUFJLENBQUNNLFVBQVUsQ0FBQyxDQUFDO0VBQ25COztFQUVBO0FBQ0Y7QUFDQTtFQUNTQyxTQUFTQSxDQUFFWCxNQUFlLEVBQVM7SUFDeENZLE1BQU0sSUFBSUEs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