// Copyright 2013-2022, University of Colorado Boulder

/**
 * An elliptical arc (a continuous sub-part of an ellipse).
 *
 * Additional helpful notes:
 * - http://www.w3.org/TR/SVG/implnote.html#PathElementImplementationNotes
 * - http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-ellipse
 *   (note: context.ellipse was removed from the Canvas spec)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import { Arc, BoundsIntersection, kite, Line, RayIntersection, Segment, SegmentIntersection, svgNumber } from '../imports.js';

// constants
const toDegrees = Utils.toDegrees;
export default class EllipticalArc extends Segment {
  // Lazily-computed derived information
  // Mapping between our ellipse and a unit circle

  // End angle in relation to our start angle (can get remapped)
  // Whether it's a full ellipse (and not just an arc)

  // Corresponding circular arc for our unit transform.

  /**
   * If the startAngle/endAngle difference is ~2pi, this will be a full ellipse
   *
   * @param center - Center of the ellipse
   * @param radiusX - Semi-major radius
   * @param radiusY - Semi-minor radius
   * @param rotation - Rotation of the semi-major axis
   * @param startAngle - Angle (radians) of the start of the arc
   * @param endAngle - Angle (radians) of the end of the arc
   * @param anticlockwise - Decides which direction the arc takes around the center
   */
  constructor(center, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
    super();
    this._center = center;
    this._radiusX = radiusX;
    this._radiusY = radiusY;
    this._rotation = rotation;
    this._startAngle = startAngle;
    this._endAngle = endAngle;
    this._anticlockwise = anticlockwise;
    this.invalidate();
  }

  /**
   * Sets the center of the EllipticalArc.
   */
  setCenter(center) {
    assert && assert(center.isFinite(), `EllipticalArc center should be finite: ${center.toString()}`);
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
   * Returns the center of this EllipticalArc.
   */
  getCenter() {
    return this._center;
  }

  /**
   * Sets the semi-major radius of the EllipticalArc.
   */
  setRadiusX(radiusX) {
    assert && assert(isFinite(radiusX), `EllipticalArc radiusX should be a finite number: ${radiusX}`);
    if (this._radiusX !== radiusX) {
      this._radiusX = radiusX;
      this.invalidate();
    }
    return this; // allow chaining
  }

  set radiusX(value) {
    this.setRadiusX(value);
  }
  get radiusX() {
    return this.getRadiusX();
  }

  /**
   * Returns the semi-major radius of this EllipticalArc.
   */
  getRadiusX() {
    return this._radiusX;
  }

  /**
   * Sets the semi-minor radius of the EllipticalArc.
   */
  setRadiusY(radiusY) {
    assert && assert(isFinite(radiusY), `EllipticalArc radiusY should be a finite number: ${radiusY}`);
    if (this._radiusY !== radiusY) {
      this._radiusY = radiusY;
      this.invalidate();
    }
    return this; // allow chaining
  }

  set radiusY(value) {
    this.setRadiusY(value);
  }
  get radiusY() {
    return this.getRadiusY();
  }

  /**
   * Returns the semi-minor radius of this EllipticalArc.
   */
  getRadiusY() {
    return this._radiusY;
  }

  /**
   * Sets the rotation of the EllipticalArc.
   */
  setRotation(rotation) {
    assert && assert(isFinite(rotation), `EllipticalArc rotation should be a finite number: ${rotation}`);
    if (this._rotation !== rotation) {
      this._rotation = rotation;
      this.invalidate();
    }
    return this; // allow chaining
  }

  set rotation(value) {
    this.setRotation(value);
  }
  get rotation() {
    return this.getRotation();
  }

  /**
   * Returns the rotation of this EllipticalArc.
   */
  getRotation() {
    return this._rotation;
  }

  /**
   * Sets the startAngle of the EllipticalArc.
   */
  setStartAngle(startAngle) {
    assert && assert(isFinite(startAngle), `EllipticalArc startAngle should be a finite number: ${startAngle}`);
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
   * Returns the startAngle of this EllipticalArc.
   */
  getStartAngle() {
    return this._startAngle;
  }

  /**
   * Sets the endAngle of the EllipticalArc.
   */
  setEndAngle(endAngle) {
    assert && assert(isFinite(endAngle), `EllipticalArc endAngle should be a finite number: ${endAngle}`);
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
   * Returns the endAngle of this EllipticalArc.
   */
  getEndAngle() {
    return this._endAngle;
  }

  /**
   * Sets the anticlockwise of the EllipticalArc.
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
   * Returns the anticlockwise of this EllipticalArc.
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

    // see http://mathworld.wolfram.com/Ellipse.html (59)
    const angle = this.angleAt(t);
    const aq = this._radiusX * Math.sin(angle);
    const bq = this._radiusY * Math.cos(angle);
    const denominator = Math.pow(bq * bq + aq * aq, 3 / 2);
    return (this._anticlockwise ? -1 : 1) * this._radiusX * this._radiusY / denominator;
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
    return [new EllipticalArc(this._center, this._radiusX, this._radiusY, this._rotation, angle0, angleT, this._anticlockwise), new EllipticalArc(this._center, this._radiusX, this._radiusY, this._rotation, angleT, angle1, this._anticlockwise)];
  }

  /**
   * Clears cached information, should be called when any of the 'constructor arguments' are mutated.
   */
  invalidate() {
    assert && assert(this._center instanceof Vector2, 'Arc center should be a Vector2');
    assert && assert(this._center.isFinite(), 'Arc center should be finite (not NaN or infinite)');
    assert && assert(typeof this._radiusX === 'number', `Arc radiusX should be a number: ${this._radiusX}`);
    assert && assert(isFinite(this._radiusX), `Arc radiusX should be a finite number: ${this._radiusX}`);
    assert && assert(typeof this._radiusY === 'number', `Arc radiusY should be a number: ${this._radiusY}`);
    assert && assert(isFinite(this._radiusY), `Arc radiusY should be a finite number: ${this._radiusY}`);
    assert && assert(typeof this._rotation === 'number', `Arc rotation should be a number: ${this._rotation}`);
    assert && assert(isFinite(this._rotation), `Arc rotation should be a finite number: ${this._rotation}`);
    assert && assert(typeof this._startAngle === 'number', `Arc startAngle should be a number: ${this._startAngle}`);
    assert && assert(isFinite(this._startAngle), `Arc startAngle should be a finite number: ${this._startAngle}`);
    assert && assert(typeof this._endAngle === 'number', `Arc endAngle should be a number: ${this._endAngle}`);
    assert && assert(isFinite(this._endAngle), `Arc endAngle should be a finite number: ${this._endAngle}`);
    assert && assert(typeof this._anticlockwise === 'boolean', `Arc anticlockwise should be a boolean: ${this._anticlockwise}`);
    this._unitTransform = null;
    this._start = null;
    this._end = null;
    this._startTangent = null;
    this._endTangent = null;
    this._actualEndAngle = null;
    this._isFullPerimeter = null;
    this._angleDifference = null;
    this._unitArcSegment = null;
    this._bounds = null;
    this._svgPathFragment = null;

    // remapping of negative radii
    if (this._radiusX < 0) {
      // support this case since we might actually need to handle it inside of strokes?
      this._radiusX = -this._radiusX;
      this._startAngle = Math.PI - this._startAngle;
      this._endAngle = Math.PI - this._endAngle;
      this._anticlockwise = !this._anticlockwise;
    }
    if (this._radiusY < 0) {
      // support this case since we might actually need to handle it inside of strokes?
      this._radiusY = -this._radiusY;
      this._startAngle = -this._startAngle;
      this._endAngle = -this._endAngle;
      this._anticlockwise = !this._anticlockwise;
    }
    if (this._radiusX < this._radiusY) {
      // swap radiusX and radiusY internally for consistent Canvas / SVG output
      this._rotation += Math.PI / 2;
      this._startAngle -= Math.PI / 2;
      this._endAngle -= Math.PI / 2;

      // swap radiusX and radiusY
      const tmpR = this._radiusX;
      this._radiusX = this._radiusY;
      this._radiusY = tmpR;
    }
    if (this._radiusX < this._radiusY) {
      // TODO: check this
      throw new Error('Not verified to work if radiusX < radiusY');
    }

    // constraints shared with Arc
    assert && assert(!(!this._anticlockwise && this._endAngle - this._startAngle <= -Math.PI * 2 || this._anticlockwise && this._startAngle - this._endAngle <= -Math.PI * 2), 'Not handling elliptical arcs with start/end angles that show differences in-between browser handling');
    assert && assert(!(!this._anticlockwise && this._endAngle - this._startAngle > Math.PI * 2 || this._anticlockwise && this._startAngle - this._endAngle > Math.PI * 2), 'Not handling elliptical arcs with start/end angles that show differences in-between browser handling');
    this.invalidationEmitter.emit();
  }

  /**
   * Computes a transform that maps a unit circle into this ellipse's location.
   *
   * Helpful, since we can get the parametric position of our unit circle (at t), and then transform it with this
   * transform to get the ellipse's parametric position (at t).
   */
  getUnitTransform() {
    if (this._unitTransform === null) {
      this._unitTransform = EllipticalArc.computeUnitTransform(this._center, this._radiusX, this._radiusY, this._rotation);
    }
    return this._unitTransform;
  }
  get unitTransform() {
    return this.getUnitTransform();
  }

  /**
   * Gets the start point of this ellipticalArc
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
   * Gets the end point of this ellipticalArc
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
   * Gets the tangent vector (normalized) to this ellipticalArc at the start, pointing in the direction of motion (from start to end)
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
   * Gets the tangent vector (normalized) to this ellipticalArc at the end point, pointing in the direction of motion (from start to end)
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
   * Gets the end angle in radians
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
   * Returns a boolean value that indicates if the arc wraps up by more than two Pi
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
   * Returns an angle difference that represents how "much" of the circle our arc covers
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
   * A unit arg segment that we can map to our ellipse. useful for hit testing and such.
   */
  getUnitArcSegment() {
    if (this._unitArcSegment === null) {
      this._unitArcSegment = new Arc(Vector2.ZERO, 1, this._startAngle, this._endAngle, this._anticlockwise);
    }
    return this._unitArcSegment;
  }
  get unitArcSegment() {
    return this.getUnitArcSegment();
  }

  /**
   * Returns the bounds of this segment.
   */
  getBounds() {
    if (this._bounds === null) {
      this._bounds = Bounds2.NOTHING.withPoint(this.getStart()).withPoint(this.getEnd());

      // if the angles are different, check extrema points
      if (this._startAngle !== this._endAngle) {
        // solve the mapping from the unit circle, find locations where a coordinate of the gradient is zero.
        // we find one extrema point for both x and y, since the other two are just rotated by pi from them.
        const xAngle = Math.atan(-(this._radiusY / this._radiusX) * Math.tan(this._rotation));
        const yAngle = Math.atan(this._radiusY / this._radiusX / Math.tan(this._rotation));

        // check all of the extrema points
        this.possibleExtremaAngles = [xAngle, xAngle + Math.PI, yAngle, yAngle + Math.PI];
        _.each(this.possibleExtremaAngles, this.includeBoundsAtAngle.bind(this));
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
    if (this._radiusX <= 0 || this._radiusY <= 0 || this._startAngle === this._endAngle) {
      return [];
    } else if (this._radiusX === this._radiusY) {
      // reduce to an Arc
      const startAngle = this._startAngle + this._rotation;
      let endAngle = this._endAngle + this._rotation;

      // preserve full circles
      if (Math.abs(this._endAngle - this._startAngle) === Math.PI * 2) {
        endAngle = this._anticlockwise ? startAngle - Math.PI * 2 : startAngle + Math.PI * 2;
      }
      return [new Arc(this._center, this._radiusX, startAngle, endAngle, this._anticlockwise)];
    } else {
      return [this];
    }
  }

  /**
   * Attempts to expand the private _bounds bounding box to include a point at a specific angle, making sure that
   * angle is actually included in the arc. This will presumably be called at angles that are at critical points,
   * where the arc should have maximum/minimum x/y values.
   */
  includeBoundsAtAngle(angle) {
    if (this.unitArcSegment.containsAngle(angle)) {
      // the boundary point is in the arc
      this._bounds = this._bounds.withPoint(this.positionAtAngle(angle));
    }
  }

  /**
   * Maps a contained angle to between [startAngle,actualEndAngle), even if the end angle is lower.
   *
   * TODO: remove duplication with Arc
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
   *
   * TODO: remove duplication with Arc
   */
  tAtAngle(angle) {
    return (this.mapAngle(angle) - this._startAngle) / (this.getActualEndAngle() - this._startAngle);
  }

  /**
   * Returns the angle for the parametrized t value. The t value should range from 0 to 1 (inclusive).
   */
  angleAt(t) {
    return this._startAngle + (this.getActualEndAngle() - this._startAngle) * t;
  }

  /**
   * Returns the position of this arc at angle.
   */
  positionAtAngle(angle) {
    return this.getUnitTransform().transformPosition2(Vector2.createPolar(1, angle));
  }

  /**
   * Returns the normalized tangent of this arc.
   * The tangent points outward (inward) of this arc for clockwise (anticlockwise) direction.
   */
  tangentAtAngle(angle) {
    const normal = this.getUnitTransform().transformNormal2(Vector2.createPolar(1, angle));
    return this._anticlockwise ? normal.perpendicular : normal.perpendicular.negated();
  }

  /**
   * Returns an array of straight lines that will draw an offset on the logical left (right) side for reverse false (true)
   * It discretizes the elliptical arc in 32 segments and returns an offset curve as a list of lineTos/
   *
   * @param r - distance
   * @param reverse
   */
  offsetTo(r, reverse) {
    // how many segments to create (possibly make this more adaptive?)
    const quantity = 32;
    const points = [];
    const result = [];
    for (let i = 0; i < quantity; i++) {
      let ratio = i / (quantity - 1);
      if (reverse) {
        ratio = 1 - ratio;
      }
      const angle = this.angleAt(ratio);
      points.push(this.positionAtAngle(angle).plus(this.tangentAtAngle(angle).perpendicular.normalized().times(r)));
      if (i > 0) {
        result.push(new Line(points[i - 1], points[i]));
      }
    }
    return result;
  }

  /**
   * Returns a string containing the SVG path. assumes that the start point is already provided,
   * so anything that calls this needs to put the M calls first.
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
      const degreesRotation = toDegrees(this._rotation); // bleh, degrees?
      if (this.getAngleDifference() < Math.PI * 2 - epsilon) {
        largeArcFlag = this.getAngleDifference() < Math.PI ? '0' : '1';
        this._svgPathFragment = `A ${svgNumber(this._radiusX)} ${svgNumber(this._radiusY)} ${degreesRotation} ${largeArcFlag} ${sweepFlag} ${svgNumber(this.getEnd().x)} ${svgNumber(this.getEnd().y)}`;
      } else {
        // ellipse (or almost-ellipse) case needs to be handled differently
        // since SVG will not be able to draw (or know how to draw) the correct circle if we just have a start and end, we need to split it into two circular arcs

        // get the angle that is between and opposite of both of the points
        const splitOppositeAngle = (this._startAngle + this._endAngle) / 2; // this _should_ work for the modular case?
        const splitPoint = this.positionAtAngle(splitOppositeAngle);
        largeArcFlag = '0'; // since we split it in 2, it's always the small arc

        const firstArc = `A ${svgNumber(this._radiusX)} ${svgNumber(this._radiusY)} ${degreesRotation} ${largeArcFlag} ${sweepFlag} ${svgNumber(splitPoint.x)} ${svgNumber(splitPoint.y)}`;
        const secondArc = `A ${svgNumber(this._radiusX)} ${svgNumber(this._radiusY)} ${degreesRotation} ${largeArcFlag} ${sweepFlag} ${svgNumber(this.getEnd().x)} ${svgNumber(this.getEnd().y)}`;
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
   * Returns an array of straight lines  that will draw an offset on the logical left side.
   */
  strokeLeft(lineWidth) {
    return this.offsetTo(-lineWidth / 2, false);
  }

  /**
   * Returns an array of straight lines that will draw an offset curve on the logical right side.
   */
  strokeRight(lineWidth) {
    return this.offsetTo(lineWidth / 2, true);
  }

  /**
   * Returns a list of t values where dx/dt or dy/dt is 0 where 0 < t < 1. subdividing on these will result in monotonic segments
   * Does not include t=0 and t=1.
   */
  getInteriorExtremaTs() {
    const result = [];
    _.each(this.possibleExtremaAngles, angle => {
      if (this.unitArcSegment.containsAngle(angle)) {
        const t = this.tAtAngle(angle);
        const epsilon = 0.0000000001; // TODO: general kite epsilon?
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
    // be lazy. transform it into the space of a non-elliptical arc.
    const unitTransform = this.getUnitTransform();
    const rayInUnitCircleSpace = unitTransform.inverseRay2(ray);
    const hits = this.getUnitArcSegment().intersection(rayInUnitCircleSpace);
    return _.map(hits, hit => {
      const transformedPoint = unitTransform.transformPosition2(hit.point);
      const distance = ray.position.distance(transformedPoint);
      const normal = unitTransform.inverseNormal2(hit.normal);
      return new RayIntersection(distance, transformedPoint, normal, hit.wind, hit.t);
    });
  }

  /**
   * Returns the resultant winding number of this ray intersecting this arc.
   */
  windingIntersection(ray) {
    // be lazy. transform it into the space of a non-elliptical arc.
    const rayInUnitCircleSpace = this.getUnitTransform().inverseRay2(ray);
    return this.getUnitArcSegment().windingIntersection(rayInUnitCircleSpace);
  }

  /**
   * Draws this arc to the 2D Canvas context, assuming the context's current location is already at the start point
   */
  writeToContext(context) {
    if (context.ellipse) {
      context.ellipse(this._center.x, this._center.y, this._radiusX, this._radiusY, this._rotation, this._startAngle, this._endAngle, this._anticlockwise);
    } else {
      // fake the ellipse call by using transforms
      this.getUnitTransform().getMatrix().canvasAppendTransform(context);
      context.arc(0, 0, 1, this._startAngle, this._endAngle, this._anticlockwise);
      this.getUnitTransform().getInverse().canvasAppendTransform(context);
    }
  }

  /**
   * Returns this elliptical arc transformed by a matrix
   */
  transformed(matrix) {
    const transformedSemiMajorAxis = matrix.timesVector2(Vector2.createPolar(this._radiusX, this._rotation)).minus(matrix.timesVector2(Vector2.ZERO));
    const transformedSemiMinorAxis = matrix.timesVector2(Vector2.createPolar(this._radiusY, this._rotation + Math.PI / 2)).minus(matrix.timesVector2(Vector2.ZERO));
    const rotation = transformedSemiMajorAxis.angle;
    const radiusX = transformedSemiMajorAxis.magnitude;
    const radiusY = transformedSemiMinorAxis.magnitude;
    const reflected = matrix.getDeterminant() < 0;

    // reverse the 'clockwiseness' if our transform includes a reflection
    // TODO: check reflections. swapping angle signs should fix clockwiseness
    const anticlockwise = reflected ? !this._anticlockwise : this._anticlockwise;
    const startAngle = reflected ? -this._startAngle : this._startAngle;
    let endAngle = reflected ? -this._endAngle : this._endAngle;
    if (Math.abs(this._endAngle - this._startAngle) === Math.PI * 2) {
      endAngle = anticlockwise ? startAngle - Math.PI * 2 : startAngle + Math.PI * 2;
    }
    return new EllipticalArc(matrix.timesVector2(this._center), radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
  }

  /**
   * Returns the contribution to the signed area computed using Green's Theorem, with P=-y/2 and Q=x/2.
   *
   * NOTE: This is this segment's contribution to the line integral (-y/2 dx + x/2 dy).
   */
  getSignedAreaFragment() {
    const t0 = this._startAngle;
    const t1 = this.getActualEndAngle();
    const sin0 = Math.sin(t0);
    const sin1 = Math.sin(t1);
    const cos0 = Math.cos(t0);
    const cos1 = Math.cos(t1);

    // Derived via Mathematica (curve-area.nb)
    return 0.5 * (this._radiusX * this._radiusY * (t1 - t0) + Math.cos(this._rotation) * (this._radiusX * this._center.y * (cos0 - cos1) + this._radiusY * this._center.x * (sin1 - sin0)) + Math.sin(this._rotation) * (this._radiusX * this._center.x * (cos1 - cos0) + this._radiusY * this._center.y * (sin1 - sin0)));
  }

  /**
   * Returns a reversed copy of this segment (mapping the parametrization from [0,1] => [1,0]).
   */
  reversed() {
    return new EllipticalArc(this._center, this._radiusX, this._radiusY, this._rotation, this._endAngle, this._startAngle, !this._anticlockwise);
  }

  /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   */
  serialize() {
    return {
      type: 'EllipticalArc',
      centerX: this._center.x,
      centerY: this._center.y,
      radiusX: this._radiusX,
      radiusY: this._radiusY,
      rotation: this._rotation,
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
    if (segment instanceof EllipticalArc) {
      return EllipticalArc.getOverlaps(this, segment);
    }
    return null;
  }

  /**
   * Returns an EllipticalArc from the serialized representation.
   */
  static deserialize(obj) {
    assert && assert(obj.type === 'EllipticalArc');
    return new EllipticalArc(new Vector2(obj.centerX, obj.centerY), obj.radiusX, obj.radiusY, obj.rotation, obj.startAngle, obj.endAngle, obj.anticlockwise);
  }

  /**
   * Returns what type of overlap is possible based on the center/radii/rotation. We ignore the start/end angles and
   * anticlockwise information, and determine if the FULL ellipses overlap.
   */
  static getOverlapType(a, b, epsilon = 1e-10) {
    // Different centers can't overlap continuously
    if (a._center.distance(b._center) < epsilon) {
      const matchingRadii = Math.abs(a._radiusX - b._radiusX) < epsilon && Math.abs(a._radiusY - b._radiusY) < epsilon;
      const oppositeRadii = Math.abs(a._radiusX - b._radiusY) < epsilon && Math.abs(a._radiusY - b._radiusX) < epsilon;
      if (matchingRadii) {
        // Difference between rotations should be an approximate multiple of pi. We add pi/2 before modulo, so the
        // result of that should be ~pi/2 (don't need to check both endpoints)
        if (Math.abs(Utils.moduloBetweenDown(a._rotation - b._rotation + Math.PI / 2, 0, Math.PI) - Math.PI / 2) < epsilon) {
          return EllipticalArcOverlapType.MATCHING_OVERLAP;
        }
      }
      if (oppositeRadii) {
        // Difference between rotations should be an approximate multiple of pi (with pi/2 added).
        if (Math.abs(Utils.moduloBetweenDown(a._rotation - b._rotation, 0, Math.PI) - Math.PI / 2) < epsilon) {
          return EllipticalArcOverlapType.OPPOSITE_OVERLAP;
        }
      }
    }
    return EllipticalArcOverlapType.NONE;
  }

  /**
   * Determine whether two elliptical arcs overlap over continuous sections, and if so finds the a,b pairs such that
   * p( t ) === q( a * t + b ).
   *
   * @returns - Any overlaps (from 0 to 2)
   */
  static getOverlaps(a, b) {
    const overlapType = EllipticalArc.getOverlapType(a, b);
    if (overlapType === EllipticalArcOverlapType.NONE) {
      return [];
    } else {
      return Arc.getAngularOverlaps(a._startAngle + a._rotation, a.getActualEndAngle() + a._rotation, b._startAngle + b._rotation, b.getActualEndAngle() + b._rotation);
    }
  }

  /**
   * Returns any (finite) intersection between the two elliptical arc segments.
   */
  static intersect(a, b, epsilon = 1e-10) {
    const overlapType = EllipticalArc.getOverlapType(a, b, epsilon);
    if (overlapType === EllipticalArcOverlapType.NONE) {
      return BoundsIntersection.intersect(a, b);
    } else {
      // If we effectively have the same ellipse, just different sections of it. The only finite intersections could be
      // at the endpoints, so we'll inspect those.

      const results = [];
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
      return results;
    }
  }

  /**
   * Transforms the unit circle into our ellipse.
   *
   * adapted from http://www.w3.org/TR/SVG/implnote.html#PathElementImplementationNotes
   */
  static computeUnitTransform(center, radiusX, radiusY, rotation) {
    return new Transform3(Matrix3.translation(center.x, center.y) // TODO: convert to Matrix3.translation( this._center) when available
    .timesMatrix(Matrix3.rotation2(rotation)).timesMatrix(Matrix3.scaling(radiusX, radiusY)));
  }
}
export class EllipticalArcOverlapType extends EnumerationValue {
  // radiusX of one equals radiusX of the other, with equivalent centers and rotations to work
  static MATCHING_OVERLAP = new EllipticalArcOverlapType();

  // radiusX of one equals radiusY of the other, with equivalent centers and rotations to work
  static OPPOSITE_OVERLAP = new EllipticalArcOverlapType();

  // no overlap
  static NONE = new EllipticalArcOverlapType();
  static enumeration = new Enumeration(EllipticalArcOverlapType);
}
kite.register('EllipticalArc', EllipticalArc);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlRyYW5zZm9ybTMiLCJVdGlscyIsIlZlY3RvcjIiLCJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJBcmMiLCJCb3VuZHNJbnRlcnNlY3Rpb24iLCJraXRlIiwiTGluZSIsIlJheUludGVyc2VjdGlvbiIsIlNlZ21lbnQiLCJTZWdtZW50SW50ZXJzZWN0aW9uIiwic3ZnTnVtYmVyIiwidG9EZWdyZWVzIiwiRWxsaXB0aWNhbEFyYyIsImNvbnN0cnVjdG9yIiwiY2VudGVyIiwicmFkaXVzWCIsInJhZGl1c1kiLCJyb3RhdGlvbiIsInN0YXJ0QW5nbGUiLCJlbmRBbmdsZSIsImFudGljbG9ja3dpc2UiLCJfY2VudGVyIiwiX3JhZGl1c1giLCJfcmFkaXVzWSIsIl9yb3RhdGlvbiIsIl9zdGFydEFuZ2xlIiwiX2VuZEFuZ2xlIiwiX2FudGljbG9ja3dpc2UiLCJpbnZhbGlkYXRlIiwic2V0Q2VudGVyIiwiYXNzZXJ0IiwiaXNGaW5pdGUiLCJ0b1N0cmluZyIsImVxdWFscyIsInZhbHVlIiwiZ2V0Q2VudGVyIiwic2V0UmFkaXVzWCIsImdldFJhZGl1c1giLCJzZXRSYWRpdXNZIiwiZ2V0UmFkaXVzWSIsInNldFJvdGF0aW9uIiwiZ2V0Um90YXRpb24iLCJzZXRTdGFydEFuZ2xlIiwiZ2V0U3RhcnRBbmdsZSIsInNldEVuZEFuZ2xlIiwiZ2V0RW5kQW5nbGUiLCJzZXRBbnRpY2xvY2t3aXNlIiwiZ2V0QW50aWNsb2Nrd2lzZSIsInBvc2l0aW9uQXQiLCJ0IiwicG9zaXRpb25BdEFuZ2xlIiwiYW5nbGVBdCIsInRhbmdlbnRBdCIsInRhbmdlbnRBdEFuZ2xlIiwiY3VydmF0dXJlQXQiLCJhbmdsZSIsImFxIiwiTWF0aCIsInNpbiIsImJxIiwiY29zIiwiZGVub21pbmF0b3IiLCJwb3ciLCJzdWJkaXZpZGVkIiwiYW5nbGUwIiwiYW5nbGVUIiwiYW5nbGUxIiwiX3VuaXRUcmFuc2Zvcm0iLCJfc3RhcnQiLCJfZW5kIiwiX3N0YXJ0VGFuZ2VudCIsIl9lbmRUYW5nZW50IiwiX2FjdHVhbEVuZEFuZ2xlIiwiX2lzRnVsbFBlcmltZXRlciIsIl9hbmdsZURpZmZlcmVuY2UiLCJfdW5pdEFyY1NlZ21lbnQiLCJfYm91bmRzIiwiX3N2Z1BhdGhGcmFnbWVudCIsIlBJIiwidG1wUiIsIkVycm9yIiwiaW52YWxpZGF0aW9uRW1pdHRlciIsImVtaXQiLCJnZXRVbml0VHJhbnNmb3JtIiwiY29tcHV0ZVVuaXRUcmFuc2Zvcm0iLCJ1bml0VHJhbnNmb3JtIiwiZ2V0U3RhcnQiLCJzdGFydCIsImdldEVuZCIsImVuZCIsImdldFN0YXJ0VGFuZ2VudCIsInN0YXJ0VGFuZ2VudCIsImdldEVuZFRhbmdlbnQiLCJlbmRUYW5nZW50IiwiZ2V0QWN0dWFsRW5kQW5nbGUiLCJjb21wdXRlQWN0dWFsRW5kQW5nbGUiLCJhY3R1YWxFbmRBbmdsZSIsImdldElzRnVsbFBlcmltZXRlciIsImlzRnVsbFBlcmltZXRlciIsImdldEFuZ2xlRGlmZmVyZW5jZSIsImFuZ2xlRGlmZmVyZW5jZSIsImdldFVuaXRBcmNTZWdtZW50IiwiWkVSTyIsInVuaXRBcmNTZWdtZW50IiwiZ2V0Qm91bmRzIiwiTk9USElORyIsIndpdGhQb2ludCIsInhBbmdsZSIsImF0YW4iLCJ0YW4iLCJ5QW5nbGUiLCJwb3NzaWJsZUV4dHJlbWFBbmdsZXMiLCJfIiwiZWFjaCIsImluY2x1ZGVCb3VuZHNBdEFuZ2xlIiwiYmluZCIsImJvdW5kcyIsImdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cyIsImFicyIsImNvbnRhaW5zQW5nbGUiLCJtYXBBbmdsZSIsIm1vZHVsb0JldHdlZW5Eb3duIiwibW9kdWxvQmV0d2VlblVwIiwidEF0QW5nbGUiLCJ0cmFuc2Zvcm1Qb3NpdGlvbjIiLCJjcmVhdGVQb2xhciIsIm5vcm1hbCIsInRyYW5zZm9ybU5vcm1hbDIiLCJwZXJwZW5kaWN1bGFyIiwibmVnYXRlZCIsIm9mZnNldFRvIiwiciIsInJldmVyc2UiLCJxdWFudGl0eSIsInBvaW50cyIsInJlc3VsdCIsImkiLCJyYXRpbyIsInB1c2giLCJwbHVzIiwibm9ybWFsaXplZCIsInRpbWVzIiwiZ2V0U1ZHUGF0aEZyYWdtZW50Iiwib2xkUGF0aEZyYWdtZW50IiwiZXBzaWxvbiIsInN3ZWVwRmxhZyIsImxhcmdlQXJjRmxhZyIsImRlZ3JlZXNSb3RhdGlvbiIsIngiLCJ5Iiwic3BsaXRPcHBvc2l0ZUFuZ2xlIiwic3BsaXRQb2ludCIsImZpcnN0QXJjIiwic2Vjb25kQXJjIiwic3Ryb2tlTGVmdCIsImxpbmVXaWR0aCIsInN0cm9rZVJpZ2h0IiwiZ2V0SW50ZXJpb3JFeHRyZW1hVHMiLCJzb3J0IiwiaW50ZXJzZWN0aW9uIiwicmF5IiwicmF5SW5Vbml0Q2lyY2xlU3BhY2UiLCJpbnZlcnNlUmF5MiIsImhpdHMiLCJtYXAiLCJoaXQiLCJ0cmFuc2Zvcm1lZFBvaW50IiwicG9pbnQiLCJkaXN0YW5jZSIsInBvc2l0aW9uIiwiaW52ZXJzZU5vcm1hbDIiLCJ3aW5kIiwid2luZGluZ0ludGVyc2VjdGlvbiIsIndyaXRlVG9Db250ZXh0IiwiY29udGV4dCIsImVsbGlwc2UiLCJnZXRNYXRyaXgiLCJjYW52YXNBcHBlbmRUcmFuc2Zvcm0iLCJhcmMiLCJnZXRJbnZlcnNlIiwidHJhbnNmb3JtZWQiLCJtYXRyaXgiLCJ0cmFuc2Zvcm1lZFNlbWlNYWpvckF4aXMiLCJ0aW1lc1ZlY3RvcjIiLCJtaW51cyIsInRyYW5zZm9ybWVkU2VtaU1pbm9yQXhpcyIsIm1hZ25pdHVkZSIsInJlZmxlY3RlZCIsImdldERldGVybWluYW50IiwiZ2V0U2lnbmVkQXJlYUZyYWdtZW50IiwidDAiLCJ0MSIsInNpbjAiLCJzaW4xIiwiY29zMCIsImNvczEiLCJyZXZlcnNlZCIsInNlcmlhbGl6ZSIsInR5cGUiLCJjZW50ZXJYIiwiY2VudGVyWSIsImdldE92ZXJsYXBzIiwic2VnbWVudCIsImRlc2VyaWFsaXplIiwib2JqIiwiZ2V0T3ZlcmxhcFR5cGUiLCJhIiwiYiIsIm1hdGNoaW5nUmFkaWkiLCJvcHBvc2l0ZVJhZGlpIiwiRWxsaXB0aWNhbEFyY092ZXJsYXBUeXBlIiwiTUFUQ0hJTkdfT1ZFUkxBUCIsIk9QUE9TSVRFX09WRVJMQVAiLCJOT05FIiwib3ZlcmxhcFR5cGUiLCJnZXRBbmd1bGFyT3ZlcmxhcHMiLCJpbnRlcnNlY3QiLCJyZXN1bHRzIiwiYVN0YXJ0IiwiYUVuZCIsImJTdGFydCIsImJFbmQiLCJlcXVhbHNFcHNpbG9uIiwiYXZlcmFnZSIsInRyYW5zbGF0aW9uIiwidGltZXNNYXRyaXgiLCJyb3RhdGlvbjIiLCJzY2FsaW5nIiwiZW51bWVyYXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVsbGlwdGljYWxBcmMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQW4gZWxsaXB0aWNhbCBhcmMgKGEgY29udGludW91cyBzdWItcGFydCBvZiBhbiBlbGxpcHNlKS5cclxuICpcclxuICogQWRkaXRpb25hbCBoZWxwZnVsIG5vdGVzOlxyXG4gKiAtIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9pbXBsbm90ZS5odG1sI1BhdGhFbGVtZW50SW1wbGVtZW50YXRpb25Ob3Rlc1xyXG4gKiAtIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3RoZS1jYW52YXMtZWxlbWVudC5odG1sI2RvbS1jb250ZXh0LTJkLWVsbGlwc2VcclxuICogICAobm90ZTogY29udGV4dC5lbGxpcHNlIHdhcyByZW1vdmVkIGZyb20gdGhlIENhbnZhcyBzcGVjKVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBSYXkyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYXkyLmpzJztcclxuaW1wb3J0IFRyYW5zZm9ybTMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1RyYW5zZm9ybTMuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xyXG5pbXBvcnQgeyBBcmMsIEJvdW5kc0ludGVyc2VjdGlvbiwga2l0ZSwgTGluZSwgT3ZlcmxhcCwgUmF5SW50ZXJzZWN0aW9uLCBTZWdtZW50LCBTZWdtZW50SW50ZXJzZWN0aW9uLCBzdmdOdW1iZXIgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCB0b0RlZ3JlZXMgPSBVdGlscy50b0RlZ3JlZXM7XHJcblxyXG50eXBlIFNlcmlhbGl6ZWRFbGxpcHRpY2FsQXJjID0ge1xyXG4gIHR5cGU6ICdFbGxpcHRpY2FsQXJjJztcclxuICBjZW50ZXJYOiBudW1iZXI7XHJcbiAgY2VudGVyWTogbnVtYmVyO1xyXG4gIHJhZGl1c1g6IG51bWJlcjtcclxuICByYWRpdXNZOiBudW1iZXI7XHJcbiAgcm90YXRpb246IG51bWJlcjtcclxuICBzdGFydEFuZ2xlOiBudW1iZXI7XHJcbiAgZW5kQW5nbGU6IG51bWJlcjtcclxuICBhbnRpY2xvY2t3aXNlOiBib29sZWFuO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWxsaXB0aWNhbEFyYyBleHRlbmRzIFNlZ21lbnQge1xyXG5cclxuICBwcml2YXRlIF9jZW50ZXI6IFZlY3RvcjI7XHJcbiAgcHJpdmF0ZSBfcmFkaXVzWDogbnVtYmVyO1xyXG4gIHByaXZhdGUgX3JhZGl1c1k6IG51bWJlcjtcclxuICBwcml2YXRlIF9yb3RhdGlvbjogbnVtYmVyO1xyXG4gIHByaXZhdGUgX3N0YXJ0QW5nbGU6IG51bWJlcjtcclxuICBwcml2YXRlIF9lbmRBbmdsZTogbnVtYmVyO1xyXG4gIHByaXZhdGUgX2FudGljbG9ja3dpc2U6IGJvb2xlYW47XHJcblxyXG4gIC8vIExhemlseS1jb21wdXRlZCBkZXJpdmVkIGluZm9ybWF0aW9uXHJcbiAgcHJpdmF0ZSBfdW5pdFRyYW5zZm9ybSE6IFRyYW5zZm9ybTMgfCBudWxsOyAvLyBNYXBwaW5nIGJldHdlZW4gb3VyIGVsbGlwc2UgYW5kIGEgdW5pdCBjaXJjbGVcclxuICBwcml2YXRlIF9zdGFydCE6IFZlY3RvcjIgfCBudWxsO1xyXG4gIHByaXZhdGUgX2VuZCE6IFZlY3RvcjIgfCBudWxsO1xyXG4gIHByaXZhdGUgX3N0YXJ0VGFuZ2VudCE6IFZlY3RvcjIgfCBudWxsO1xyXG4gIHByaXZhdGUgX2VuZFRhbmdlbnQhOiBWZWN0b3IyIHwgbnVsbDtcclxuICBwcml2YXRlIF9hY3R1YWxFbmRBbmdsZSE6IG51bWJlciB8IG51bGw7IC8vIEVuZCBhbmdsZSBpbiByZWxhdGlvbiB0byBvdXIgc3RhcnQgYW5nbGUgKGNhbiBnZXQgcmVtYXBwZWQpXHJcbiAgcHJpdmF0ZSBfaXNGdWxsUGVyaW1ldGVyITogYm9vbGVhbiB8IG51bGw7IC8vIFdoZXRoZXIgaXQncyBhIGZ1bGwgZWxsaXBzZSAoYW5kIG5vdCBqdXN0IGFuIGFyYylcclxuICBwcml2YXRlIF9hbmdsZURpZmZlcmVuY2UhOiBudW1iZXIgfCBudWxsO1xyXG4gIHByaXZhdGUgX3VuaXRBcmNTZWdtZW50ITogQXJjIHwgbnVsbDsgLy8gQ29ycmVzcG9uZGluZyBjaXJjdWxhciBhcmMgZm9yIG91ciB1bml0IHRyYW5zZm9ybS5cclxuICBwcml2YXRlIF9ib3VuZHMhOiBCb3VuZHMyIHwgbnVsbDtcclxuICBwcml2YXRlIF9zdmdQYXRoRnJhZ21lbnQhOiBzdHJpbmcgfCBudWxsO1xyXG5cclxuICBwcml2YXRlIHBvc3NpYmxlRXh0cmVtYUFuZ2xlcz86IG51bWJlcltdO1xyXG5cclxuICAvKipcclxuICAgKiBJZiB0aGUgc3RhcnRBbmdsZS9lbmRBbmdsZSBkaWZmZXJlbmNlIGlzIH4ycGksIHRoaXMgd2lsbCBiZSBhIGZ1bGwgZWxsaXBzZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIGNlbnRlciAtIENlbnRlciBvZiB0aGUgZWxsaXBzZVxyXG4gICAqIEBwYXJhbSByYWRpdXNYIC0gU2VtaS1tYWpvciByYWRpdXNcclxuICAgKiBAcGFyYW0gcmFkaXVzWSAtIFNlbWktbWlub3IgcmFkaXVzXHJcbiAgICogQHBhcmFtIHJvdGF0aW9uIC0gUm90YXRpb24gb2YgdGhlIHNlbWktbWFqb3IgYXhpc1xyXG4gICAqIEBwYXJhbSBzdGFydEFuZ2xlIC0gQW5nbGUgKHJhZGlhbnMpIG9mIHRoZSBzdGFydCBvZiB0aGUgYXJjXHJcbiAgICogQHBhcmFtIGVuZEFuZ2xlIC0gQW5nbGUgKHJhZGlhbnMpIG9mIHRoZSBlbmQgb2YgdGhlIGFyY1xyXG4gICAqIEBwYXJhbSBhbnRpY2xvY2t3aXNlIC0gRGVjaWRlcyB3aGljaCBkaXJlY3Rpb24gdGhlIGFyYyB0YWtlcyBhcm91bmQgdGhlIGNlbnRlclxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY2VudGVyOiBWZWN0b3IyLCByYWRpdXNYOiBudW1iZXIsIHJhZGl1c1k6IG51bWJlciwgcm90YXRpb246IG51bWJlciwgc3RhcnRBbmdsZTogbnVtYmVyLCBlbmRBbmdsZTogbnVtYmVyLCBhbnRpY2xvY2t3aXNlOiBib29sZWFuICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLl9jZW50ZXIgPSBjZW50ZXI7XHJcbiAgICB0aGlzLl9yYWRpdXNYID0gcmFkaXVzWDtcclxuICAgIHRoaXMuX3JhZGl1c1kgPSByYWRpdXNZO1xyXG4gICAgdGhpcy5fcm90YXRpb24gPSByb3RhdGlvbjtcclxuICAgIHRoaXMuX3N0YXJ0QW5nbGUgPSBzdGFydEFuZ2xlO1xyXG4gICAgdGhpcy5fZW5kQW5nbGUgPSBlbmRBbmdsZTtcclxuICAgIHRoaXMuX2FudGljbG9ja3dpc2UgPSBhbnRpY2xvY2t3aXNlO1xyXG5cclxuICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgY2VudGVyIG9mIHRoZSBFbGxpcHRpY2FsQXJjLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDZW50ZXIoIGNlbnRlcjogVmVjdG9yMiApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNlbnRlci5pc0Zpbml0ZSgpLCBgRWxsaXB0aWNhbEFyYyBjZW50ZXIgc2hvdWxkIGJlIGZpbml0ZTogJHtjZW50ZXIudG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5fY2VudGVyLmVxdWFscyggY2VudGVyICkgKSB7XHJcbiAgICAgIHRoaXMuX2NlbnRlciA9IGNlbnRlcjtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgY2VudGVyKCB2YWx1ZTogVmVjdG9yMiApIHsgdGhpcy5zZXRDZW50ZXIoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBjZW50ZXIoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldENlbnRlcigpOyB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjZW50ZXIgb2YgdGhpcyBFbGxpcHRpY2FsQXJjLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDZW50ZXIoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5fY2VudGVyO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHNlbWktbWFqb3IgcmFkaXVzIG9mIHRoZSBFbGxpcHRpY2FsQXJjLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRSYWRpdXNYKCByYWRpdXNYOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggcmFkaXVzWCApLCBgRWxsaXB0aWNhbEFyYyByYWRpdXNYIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7cmFkaXVzWH1gICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9yYWRpdXNYICE9PSByYWRpdXNYICkge1xyXG4gICAgICB0aGlzLl9yYWRpdXNYID0gcmFkaXVzWDtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgcmFkaXVzWCggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRSYWRpdXNYKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgcmFkaXVzWCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRSYWRpdXNYKCk7IH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHNlbWktbWFqb3IgcmFkaXVzIG9mIHRoaXMgRWxsaXB0aWNhbEFyYy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmFkaXVzWCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3JhZGl1c1g7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgc2VtaS1taW5vciByYWRpdXMgb2YgdGhlIEVsbGlwdGljYWxBcmMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFJhZGl1c1koIHJhZGl1c1k6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCByYWRpdXNZICksIGBFbGxpcHRpY2FsQXJjIHJhZGl1c1kgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcjogJHtyYWRpdXNZfWAgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3JhZGl1c1kgIT09IHJhZGl1c1kgKSB7XHJcbiAgICAgIHRoaXMuX3JhZGl1c1kgPSByYWRpdXNZO1xyXG4gICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCByYWRpdXNZKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFJhZGl1c1koIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCByYWRpdXNZKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFJhZGl1c1koKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzZW1pLW1pbm9yIHJhZGl1cyBvZiB0aGlzIEVsbGlwdGljYWxBcmMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFJhZGl1c1koKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9yYWRpdXNZO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHJvdGF0aW9uIG9mIHRoZSBFbGxpcHRpY2FsQXJjLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRSb3RhdGlvbiggcm90YXRpb246IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCByb3RhdGlvbiApLCBgRWxsaXB0aWNhbEFyYyByb3RhdGlvbiBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3JvdGF0aW9ufWAgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3JvdGF0aW9uICE9PSByb3RhdGlvbiApIHtcclxuICAgICAgdGhpcy5fcm90YXRpb24gPSByb3RhdGlvbjtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgcm90YXRpb24oIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0Um90YXRpb24oIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCByb3RhdGlvbigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRSb3RhdGlvbigpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHJvdGF0aW9uIG9mIHRoaXMgRWxsaXB0aWNhbEFyYy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Um90YXRpb24oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9yb3RhdGlvbjtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBzdGFydEFuZ2xlIG9mIHRoZSBFbGxpcHRpY2FsQXJjLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRTdGFydEFuZ2xlKCBzdGFydEFuZ2xlOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggc3RhcnRBbmdsZSApLCBgRWxsaXB0aWNhbEFyYyBzdGFydEFuZ2xlIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7c3RhcnRBbmdsZX1gICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9zdGFydEFuZ2xlICE9PSBzdGFydEFuZ2xlICkge1xyXG4gICAgICB0aGlzLl9zdGFydEFuZ2xlID0gc3RhcnRBbmdsZTtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgc3RhcnRBbmdsZSggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRTdGFydEFuZ2xlKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3RhcnRBbmdsZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRTdGFydEFuZ2xlKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3RhcnRBbmdsZSBvZiB0aGlzIEVsbGlwdGljYWxBcmMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFN0YXJ0QW5nbGUoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGFydEFuZ2xlO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGVuZEFuZ2xlIG9mIHRoZSBFbGxpcHRpY2FsQXJjLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRFbmRBbmdsZSggZW5kQW5nbGU6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBlbmRBbmdsZSApLCBgRWxsaXB0aWNhbEFyYyBlbmRBbmdsZSBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2VuZEFuZ2xlfWAgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX2VuZEFuZ2xlICE9PSBlbmRBbmdsZSApIHtcclxuICAgICAgdGhpcy5fZW5kQW5nbGUgPSBlbmRBbmdsZTtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgZW5kQW5nbGUoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0RW5kQW5nbGUoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBlbmRBbmdsZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRFbmRBbmdsZSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGVuZEFuZ2xlIG9mIHRoaXMgRWxsaXB0aWNhbEFyYy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RW5kQW5nbGUoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9lbmRBbmdsZTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBhbnRpY2xvY2t3aXNlIG9mIHRoZSBFbGxpcHRpY2FsQXJjLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRBbnRpY2xvY2t3aXNlKCBhbnRpY2xvY2t3aXNlOiBib29sZWFuICk6IHRoaXMge1xyXG4gICAgaWYgKCB0aGlzLl9hbnRpY2xvY2t3aXNlICE9PSBhbnRpY2xvY2t3aXNlICkge1xyXG4gICAgICB0aGlzLl9hbnRpY2xvY2t3aXNlID0gYW50aWNsb2Nrd2lzZTtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgYW50aWNsb2Nrd2lzZSggdmFsdWU6IGJvb2xlYW4gKSB7IHRoaXMuc2V0QW50aWNsb2Nrd2lzZSggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGFudGljbG9ja3dpc2UoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmdldEFudGljbG9ja3dpc2UoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBhbnRpY2xvY2t3aXNlIG9mIHRoaXMgRWxsaXB0aWNhbEFyYy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0QW50aWNsb2Nrd2lzZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9hbnRpY2xvY2t3aXNlO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHBvc2l0aW9uIHBhcmFtZXRyaWNhbGx5LCB3aXRoIDAgPD0gdCA8PSAxLlxyXG4gICAqXHJcbiAgICogTk9URTogcG9zaXRpb25BdCggMCApIHdpbGwgcmV0dXJuIHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudCwgYW5kIHBvc2l0aW9uQXQoIDEgKSB3aWxsIHJldHVybiB0aGUgZW5kIG9mIHRoZVxyXG4gICAqIHNlZ21lbnQuXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgcG9zaXRpb25BdCggdDogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAncG9zaXRpb25BdCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0IDw9IDEsICdwb3NpdGlvbkF0IHQgc2hvdWxkIGJlIG5vIGdyZWF0ZXIgdGhhbiAxJyApO1xyXG5cclxuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uQXRBbmdsZSggdGhpcy5hbmdsZUF0KCB0ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG5vbi1ub3JtYWxpemVkIHRhbmdlbnQgKGR4L2R0LCBkeS9kdCkgb2YgdGhpcyBzZWdtZW50IGF0IHRoZSBwYXJhbWV0cmljIHZhbHVlIG9mIHQsIHdpdGggMCA8PSB0IDw9IDEuXHJcbiAgICpcclxuICAgKiBOT1RFOiB0YW5nZW50QXQoIDAgKSB3aWxsIHJldHVybiB0aGUgdGFuZ2VudCBhdCB0aGUgc3RhcnQgb2YgdGhlIHNlZ21lbnQsIGFuZCB0YW5nZW50QXQoIDEgKSB3aWxsIHJldHVybiB0aGVcclxuICAgKiB0YW5nZW50IGF0IHRoZSBlbmQgb2YgdGhlIHNlZ21lbnQuXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgdGFuZ2VudEF0KCB0OiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAsICd0YW5nZW50QXQgdCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAndGFuZ2VudEF0IHQgc2hvdWxkIGJlIG5vIGdyZWF0ZXIgdGhhbiAxJyApO1xyXG5cclxuICAgIHJldHVybiB0aGlzLnRhbmdlbnRBdEFuZ2xlKCB0aGlzLmFuZ2xlQXQoIHQgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc2lnbmVkIGN1cnZhdHVyZSBvZiB0aGUgc2VnbWVudCBhdCB0aGUgcGFyYW1ldHJpYyB2YWx1ZSB0LCB3aGVyZSAwIDw9IHQgPD0gMS5cclxuICAgKlxyXG4gICAqIFRoZSBjdXJ2YXR1cmUgd2lsbCBiZSBwb3NpdGl2ZSBmb3IgdmlzdWFsIGNsb2Nrd2lzZSAvIG1hdGhlbWF0aWNhbCBjb3VudGVyY2xvY2t3aXNlIGN1cnZlcywgbmVnYXRpdmUgZm9yIG9wcG9zaXRlXHJcbiAgICogY3VydmF0dXJlLCBhbmQgMCBmb3Igbm8gY3VydmF0dXJlLlxyXG4gICAqXHJcbiAgICogTk9URTogY3VydmF0dXJlQXQoIDAgKSB3aWxsIHJldHVybiB0aGUgY3VydmF0dXJlIGF0IHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudCwgYW5kIGN1cnZhdHVyZUF0KCAxICkgd2lsbCByZXR1cm5cclxuICAgKiB0aGUgY3VydmF0dXJlIGF0IHRoZSBlbmQgb2YgdGhlIHNlZ21lbnQuXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgY3VydmF0dXJlQXQoIHQ6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAnY3VydmF0dXJlQXQgdCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAnY3VydmF0dXJlQXQgdCBzaG91bGQgYmUgbm8gZ3JlYXRlciB0aGFuIDEnICk7XHJcblxyXG4gICAgLy8gc2VlIGh0dHA6Ly9tYXRod29ybGQud29sZnJhbS5jb20vRWxsaXBzZS5odG1sICg1OSlcclxuICAgIGNvbnN0IGFuZ2xlID0gdGhpcy5hbmdsZUF0KCB0ICk7XHJcbiAgICBjb25zdCBhcSA9IHRoaXMuX3JhZGl1c1ggKiBNYXRoLnNpbiggYW5nbGUgKTtcclxuICAgIGNvbnN0IGJxID0gdGhpcy5fcmFkaXVzWSAqIE1hdGguY29zKCBhbmdsZSApO1xyXG4gICAgY29uc3QgZGVub21pbmF0b3IgPSBNYXRoLnBvdyggYnEgKiBicSArIGFxICogYXEsIDMgLyAyICk7XHJcbiAgICByZXR1cm4gKCB0aGlzLl9hbnRpY2xvY2t3aXNlID8gLTEgOiAxICkgKiB0aGlzLl9yYWRpdXNYICogdGhpcy5fcmFkaXVzWSAvIGRlbm9taW5hdG9yO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSB3aXRoIHVwIHRvIDIgc3ViLXNlZ21lbnRzLCBzcGxpdCBhdCB0aGUgcGFyYW1ldHJpYyB0IHZhbHVlLiBUb2dldGhlciAoaW4gb3JkZXIpIHRoZXkgc2hvdWxkIG1ha2VcclxuICAgKiB1cCB0aGUgc2FtZSBzaGFwZSBhcyB0aGUgY3VycmVudCBzZWdtZW50LlxyXG4gICAqXHJcbiAgICogVGhpcyBtZXRob2QgaXMgcGFydCBvZiB0aGUgU2VnbWVudCBBUEkuIFNlZSBTZWdtZW50LmpzJ3MgY29uc3RydWN0b3IgZm9yIG1vcmUgQVBJIGRvY3VtZW50YXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIHN1YmRpdmlkZWQoIHQ6IG51bWJlciApOiBFbGxpcHRpY2FsQXJjW10ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAnc3ViZGl2aWRlZCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0IDw9IDEsICdzdWJkaXZpZGVkIHQgc2hvdWxkIGJlIG5vIGdyZWF0ZXIgdGhhbiAxJyApO1xyXG5cclxuICAgIC8vIElmIHQgaXMgMCBvciAxLCB3ZSBvbmx5IG5lZWQgdG8gcmV0dXJuIDEgc2VnbWVudFxyXG4gICAgaWYgKCB0ID09PSAwIHx8IHQgPT09IDEgKSB7XHJcbiAgICAgIHJldHVybiBbIHRoaXMgXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiB2ZXJpZnkgdGhhdCB3ZSBkb24ndCBuZWVkIHRvIHN3aXRjaCBhbnRpY2xvY2t3aXNlIGhlcmUsIG9yIHN1YnRyYWN0IDJwaSBvZmYgYW55IGFuZ2xlc1xyXG4gICAgY29uc3QgYW5nbGUwID0gdGhpcy5hbmdsZUF0KCAwICk7XHJcbiAgICBjb25zdCBhbmdsZVQgPSB0aGlzLmFuZ2xlQXQoIHQgKTtcclxuICAgIGNvbnN0IGFuZ2xlMSA9IHRoaXMuYW5nbGVBdCggMSApO1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgbmV3IEVsbGlwdGljYWxBcmMoIHRoaXMuX2NlbnRlciwgdGhpcy5fcmFkaXVzWCwgdGhpcy5fcmFkaXVzWSwgdGhpcy5fcm90YXRpb24sIGFuZ2xlMCwgYW5nbGVULCB0aGlzLl9hbnRpY2xvY2t3aXNlICksXHJcbiAgICAgIG5ldyBFbGxpcHRpY2FsQXJjKCB0aGlzLl9jZW50ZXIsIHRoaXMuX3JhZGl1c1gsIHRoaXMuX3JhZGl1c1ksIHRoaXMuX3JvdGF0aW9uLCBhbmdsZVQsIGFuZ2xlMSwgdGhpcy5fYW50aWNsb2Nrd2lzZSApXHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXJzIGNhY2hlZCBpbmZvcm1hdGlvbiwgc2hvdWxkIGJlIGNhbGxlZCB3aGVuIGFueSBvZiB0aGUgJ2NvbnN0cnVjdG9yIGFyZ3VtZW50cycgYXJlIG11dGF0ZWQuXHJcbiAgICovXHJcbiAgcHVibGljIGludmFsaWRhdGUoKTogdm9pZCB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fY2VudGVyIGluc3RhbmNlb2YgVmVjdG9yMiwgJ0FyYyBjZW50ZXIgc2hvdWxkIGJlIGEgVmVjdG9yMicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2NlbnRlci5pc0Zpbml0ZSgpLCAnQXJjIGNlbnRlciBzaG91bGQgYmUgZmluaXRlIChub3QgTmFOIG9yIGluZmluaXRlKScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl9yYWRpdXNYID09PSAnbnVtYmVyJywgYEFyYyByYWRpdXNYIHNob3VsZCBiZSBhIG51bWJlcjogJHt0aGlzLl9yYWRpdXNYfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB0aGlzLl9yYWRpdXNYICksIGBBcmMgcmFkaXVzWCBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3RoaXMuX3JhZGl1c1h9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMuX3JhZGl1c1kgPT09ICdudW1iZXInLCBgQXJjIHJhZGl1c1kgc2hvdWxkIGJlIGEgbnVtYmVyOiAke3RoaXMuX3JhZGl1c1l9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMuX3JhZGl1c1kgKSwgYEFyYyByYWRpdXNZIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7dGhpcy5fcmFkaXVzWX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGhpcy5fcm90YXRpb24gPT09ICdudW1iZXInLCBgQXJjIHJvdGF0aW9uIHNob3VsZCBiZSBhIG51bWJlcjogJHt0aGlzLl9yb3RhdGlvbn1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy5fcm90YXRpb24gKSwgYEFyYyByb3RhdGlvbiBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3RoaXMuX3JvdGF0aW9ufWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl9zdGFydEFuZ2xlID09PSAnbnVtYmVyJywgYEFyYyBzdGFydEFuZ2xlIHNob3VsZCBiZSBhIG51bWJlcjogJHt0aGlzLl9zdGFydEFuZ2xlfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB0aGlzLl9zdGFydEFuZ2xlICksIGBBcmMgc3RhcnRBbmdsZSBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3RoaXMuX3N0YXJ0QW5nbGV9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMuX2VuZEFuZ2xlID09PSAnbnVtYmVyJywgYEFyYyBlbmRBbmdsZSBzaG91bGQgYmUgYSBudW1iZXI6ICR7dGhpcy5fZW5kQW5nbGV9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMuX2VuZEFuZ2xlICksIGBBcmMgZW5kQW5nbGUgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcjogJHt0aGlzLl9lbmRBbmdsZX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGhpcy5fYW50aWNsb2Nrd2lzZSA9PT0gJ2Jvb2xlYW4nLCBgQXJjIGFudGljbG9ja3dpc2Ugc2hvdWxkIGJlIGEgYm9vbGVhbjogJHt0aGlzLl9hbnRpY2xvY2t3aXNlfWAgKTtcclxuXHJcbiAgICB0aGlzLl91bml0VHJhbnNmb3JtID0gbnVsbDtcclxuICAgIHRoaXMuX3N0YXJ0ID0gbnVsbDtcclxuICAgIHRoaXMuX2VuZCA9IG51bGw7XHJcbiAgICB0aGlzLl9zdGFydFRhbmdlbnQgPSBudWxsO1xyXG4gICAgdGhpcy5fZW5kVGFuZ2VudCA9IG51bGw7XHJcbiAgICB0aGlzLl9hY3R1YWxFbmRBbmdsZSA9IG51bGw7XHJcbiAgICB0aGlzLl9pc0Z1bGxQZXJpbWV0ZXIgPSBudWxsO1xyXG4gICAgdGhpcy5fYW5nbGVEaWZmZXJlbmNlID0gbnVsbDtcclxuICAgIHRoaXMuX3VuaXRBcmNTZWdtZW50ID0gbnVsbDtcclxuICAgIHRoaXMuX2JvdW5kcyA9IG51bGw7XHJcbiAgICB0aGlzLl9zdmdQYXRoRnJhZ21lbnQgPSBudWxsO1xyXG5cclxuICAgIC8vIHJlbWFwcGluZyBvZiBuZWdhdGl2ZSByYWRpaVxyXG4gICAgaWYgKCB0aGlzLl9yYWRpdXNYIDwgMCApIHtcclxuICAgICAgLy8gc3VwcG9ydCB0aGlzIGNhc2Ugc2luY2Ugd2UgbWlnaHQgYWN0dWFsbHkgbmVlZCB0byBoYW5kbGUgaXQgaW5zaWRlIG9mIHN0cm9rZXM/XHJcbiAgICAgIHRoaXMuX3JhZGl1c1ggPSAtdGhpcy5fcmFkaXVzWDtcclxuICAgICAgdGhpcy5fc3RhcnRBbmdsZSA9IE1hdGguUEkgLSB0aGlzLl9zdGFydEFuZ2xlO1xyXG4gICAgICB0aGlzLl9lbmRBbmdsZSA9IE1hdGguUEkgLSB0aGlzLl9lbmRBbmdsZTtcclxuICAgICAgdGhpcy5fYW50aWNsb2Nrd2lzZSA9ICF0aGlzLl9hbnRpY2xvY2t3aXNlO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLl9yYWRpdXNZIDwgMCApIHtcclxuICAgICAgLy8gc3VwcG9ydCB0aGlzIGNhc2Ugc2luY2Ugd2UgbWlnaHQgYWN0dWFsbHkgbmVlZCB0byBoYW5kbGUgaXQgaW5zaWRlIG9mIHN0cm9rZXM/XHJcbiAgICAgIHRoaXMuX3JhZGl1c1kgPSAtdGhpcy5fcmFkaXVzWTtcclxuICAgICAgdGhpcy5fc3RhcnRBbmdsZSA9IC10aGlzLl9zdGFydEFuZ2xlO1xyXG4gICAgICB0aGlzLl9lbmRBbmdsZSA9IC10aGlzLl9lbmRBbmdsZTtcclxuICAgICAgdGhpcy5fYW50aWNsb2Nrd2lzZSA9ICF0aGlzLl9hbnRpY2xvY2t3aXNlO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLl9yYWRpdXNYIDwgdGhpcy5fcmFkaXVzWSApIHtcclxuICAgICAgLy8gc3dhcCByYWRpdXNYIGFuZCByYWRpdXNZIGludGVybmFsbHkgZm9yIGNvbnNpc3RlbnQgQ2FudmFzIC8gU1ZHIG91dHB1dFxyXG4gICAgICB0aGlzLl9yb3RhdGlvbiArPSBNYXRoLlBJIC8gMjtcclxuICAgICAgdGhpcy5fc3RhcnRBbmdsZSAtPSBNYXRoLlBJIC8gMjtcclxuICAgICAgdGhpcy5fZW5kQW5nbGUgLT0gTWF0aC5QSSAvIDI7XHJcblxyXG4gICAgICAvLyBzd2FwIHJhZGl1c1ggYW5kIHJhZGl1c1lcclxuICAgICAgY29uc3QgdG1wUiA9IHRoaXMuX3JhZGl1c1g7XHJcbiAgICAgIHRoaXMuX3JhZGl1c1ggPSB0aGlzLl9yYWRpdXNZO1xyXG4gICAgICB0aGlzLl9yYWRpdXNZID0gdG1wUjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuX3JhZGl1c1ggPCB0aGlzLl9yYWRpdXNZICkge1xyXG4gICAgICAvLyBUT0RPOiBjaGVjayB0aGlzXHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ05vdCB2ZXJpZmllZCB0byB3b3JrIGlmIHJhZGl1c1ggPCByYWRpdXNZJyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvbnN0cmFpbnRzIHNoYXJlZCB3aXRoIEFyY1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggISggKCAhdGhpcy5fYW50aWNsb2Nrd2lzZSAmJiB0aGlzLl9lbmRBbmdsZSAtIHRoaXMuX3N0YXJ0QW5nbGUgPD0gLU1hdGguUEkgKiAyICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICggdGhpcy5fYW50aWNsb2Nrd2lzZSAmJiB0aGlzLl9zdGFydEFuZ2xlIC0gdGhpcy5fZW5kQW5nbGUgPD0gLU1hdGguUEkgKiAyICkgKSxcclxuICAgICAgJ05vdCBoYW5kbGluZyBlbGxpcHRpY2FsIGFyY3Mgd2l0aCBzdGFydC9lbmQgYW5nbGVzIHRoYXQgc2hvdyBkaWZmZXJlbmNlcyBpbi1iZXR3ZWVuIGJyb3dzZXIgaGFuZGxpbmcnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhKCAoICF0aGlzLl9hbnRpY2xvY2t3aXNlICYmIHRoaXMuX2VuZEFuZ2xlIC0gdGhpcy5fc3RhcnRBbmdsZSA+IE1hdGguUEkgKiAyICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICggdGhpcy5fYW50aWNsb2Nrd2lzZSAmJiB0aGlzLl9zdGFydEFuZ2xlIC0gdGhpcy5fZW5kQW5nbGUgPiBNYXRoLlBJICogMiApICksXHJcbiAgICAgICdOb3QgaGFuZGxpbmcgZWxsaXB0aWNhbCBhcmNzIHdpdGggc3RhcnQvZW5kIGFuZ2xlcyB0aGF0IHNob3cgZGlmZmVyZW5jZXMgaW4tYmV0d2VlbiBicm93c2VyIGhhbmRsaW5nJyApO1xyXG5cclxuICAgIHRoaXMuaW52YWxpZGF0aW9uRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlcyBhIHRyYW5zZm9ybSB0aGF0IG1hcHMgYSB1bml0IGNpcmNsZSBpbnRvIHRoaXMgZWxsaXBzZSdzIGxvY2F0aW9uLlxyXG4gICAqXHJcbiAgICogSGVscGZ1bCwgc2luY2Ugd2UgY2FuIGdldCB0aGUgcGFyYW1ldHJpYyBwb3NpdGlvbiBvZiBvdXIgdW5pdCBjaXJjbGUgKGF0IHQpLCBhbmQgdGhlbiB0cmFuc2Zvcm0gaXQgd2l0aCB0aGlzXHJcbiAgICogdHJhbnNmb3JtIHRvIGdldCB0aGUgZWxsaXBzZSdzIHBhcmFtZXRyaWMgcG9zaXRpb24gKGF0IHQpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRVbml0VHJhbnNmb3JtKCk6IFRyYW5zZm9ybTMge1xyXG4gICAgaWYgKCB0aGlzLl91bml0VHJhbnNmb3JtID09PSBudWxsICkge1xyXG4gICAgICB0aGlzLl91bml0VHJhbnNmb3JtID0gRWxsaXB0aWNhbEFyYy5jb21wdXRlVW5pdFRyYW5zZm9ybSggdGhpcy5fY2VudGVyLCB0aGlzLl9yYWRpdXNYLCB0aGlzLl9yYWRpdXNZLCB0aGlzLl9yb3RhdGlvbiApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX3VuaXRUcmFuc2Zvcm07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHVuaXRUcmFuc2Zvcm0oKTogVHJhbnNmb3JtMyB7IHJldHVybiB0aGlzLmdldFVuaXRUcmFuc2Zvcm0oKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBzdGFydCBwb2ludCBvZiB0aGlzIGVsbGlwdGljYWxBcmNcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U3RhcnQoKTogVmVjdG9yMiB7XHJcbiAgICBpZiAoIHRoaXMuX3N0YXJ0ID09PSBudWxsICkge1xyXG4gICAgICB0aGlzLl9zdGFydCA9IHRoaXMucG9zaXRpb25BdEFuZ2xlKCB0aGlzLl9zdGFydEFuZ2xlICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fc3RhcnQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHN0YXJ0KCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRTdGFydCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGVuZCBwb2ludCBvZiB0aGlzIGVsbGlwdGljYWxBcmNcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RW5kKCk6IFZlY3RvcjIge1xyXG4gICAgaWYgKCB0aGlzLl9lbmQgPT09IG51bGwgKSB7XHJcbiAgICAgIHRoaXMuX2VuZCA9IHRoaXMucG9zaXRpb25BdEFuZ2xlKCB0aGlzLl9lbmRBbmdsZSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX2VuZDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZW5kKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRFbmQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB0YW5nZW50IHZlY3RvciAobm9ybWFsaXplZCkgdG8gdGhpcyBlbGxpcHRpY2FsQXJjIGF0IHRoZSBzdGFydCwgcG9pbnRpbmcgaW4gdGhlIGRpcmVjdGlvbiBvZiBtb3Rpb24gKGZyb20gc3RhcnQgdG8gZW5kKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTdGFydFRhbmdlbnQoKTogVmVjdG9yMiB7XHJcbiAgICBpZiAoIHRoaXMuX3N0YXJ0VGFuZ2VudCA9PT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5fc3RhcnRUYW5nZW50ID0gdGhpcy50YW5nZW50QXRBbmdsZSggdGhpcy5fc3RhcnRBbmdsZSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0VGFuZ2VudDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3RhcnRUYW5nZW50KCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRTdGFydFRhbmdlbnQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB0YW5nZW50IHZlY3RvciAobm9ybWFsaXplZCkgdG8gdGhpcyBlbGxpcHRpY2FsQXJjIGF0IHRoZSBlbmQgcG9pbnQsIHBvaW50aW5nIGluIHRoZSBkaXJlY3Rpb24gb2YgbW90aW9uIChmcm9tIHN0YXJ0IHRvIGVuZClcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RW5kVGFuZ2VudCgpOiBWZWN0b3IyIHtcclxuICAgIGlmICggdGhpcy5fZW5kVGFuZ2VudCA9PT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5fZW5kVGFuZ2VudCA9IHRoaXMudGFuZ2VudEF0QW5nbGUoIHRoaXMuX2VuZEFuZ2xlICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fZW5kVGFuZ2VudDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZW5kVGFuZ2VudCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0RW5kVGFuZ2VudCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGVuZCBhbmdsZSBpbiByYWRpYW5zXHJcbiAgICovXHJcbiAgcHVibGljIGdldEFjdHVhbEVuZEFuZ2xlKCk6IG51bWJlciB7XHJcbiAgICBpZiAoIHRoaXMuX2FjdHVhbEVuZEFuZ2xlID09PSBudWxsICkge1xyXG4gICAgICB0aGlzLl9hY3R1YWxFbmRBbmdsZSA9IEFyYy5jb21wdXRlQWN0dWFsRW5kQW5nbGUoIHRoaXMuX3N0YXJ0QW5nbGUsIHRoaXMuX2VuZEFuZ2xlLCB0aGlzLl9hbnRpY2xvY2t3aXNlICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fYWN0dWFsRW5kQW5nbGU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGFjdHVhbEVuZEFuZ2xlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEFjdHVhbEVuZEFuZ2xlKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGJvb2xlYW4gdmFsdWUgdGhhdCBpbmRpY2F0ZXMgaWYgdGhlIGFyYyB3cmFwcyB1cCBieSBtb3JlIHRoYW4gdHdvIFBpXHJcbiAgICovXHJcbiAgcHVibGljIGdldElzRnVsbFBlcmltZXRlcigpOiBib29sZWFuIHtcclxuICAgIGlmICggdGhpcy5faXNGdWxsUGVyaW1ldGVyID09PSBudWxsICkge1xyXG4gICAgICB0aGlzLl9pc0Z1bGxQZXJpbWV0ZXIgPSAoICF0aGlzLl9hbnRpY2xvY2t3aXNlICYmIHRoaXMuX2VuZEFuZ2xlIC0gdGhpcy5fc3RhcnRBbmdsZSA+PSBNYXRoLlBJICogMiApIHx8ICggdGhpcy5fYW50aWNsb2Nrd2lzZSAmJiB0aGlzLl9zdGFydEFuZ2xlIC0gdGhpcy5fZW5kQW5nbGUgPj0gTWF0aC5QSSAqIDIgKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9pc0Z1bGxQZXJpbWV0ZXI7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGlzRnVsbFBlcmltZXRlcigpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0SXNGdWxsUGVyaW1ldGVyKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhbmdsZSBkaWZmZXJlbmNlIHRoYXQgcmVwcmVzZW50cyBob3cgXCJtdWNoXCIgb2YgdGhlIGNpcmNsZSBvdXIgYXJjIGNvdmVyc1xyXG4gICAqXHJcbiAgICogVGhlIGFuc3dlciBpcyBhbHdheXMgZ3JlYXRlciBvciBlcXVhbCB0byB6ZXJvXHJcbiAgICogVGhlIGFuc3dlciBjYW4gZXhjZWVkIHR3byBQaVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRBbmdsZURpZmZlcmVuY2UoKTogbnVtYmVyIHtcclxuICAgIGlmICggdGhpcy5fYW5nbGVEaWZmZXJlbmNlID09PSBudWxsICkge1xyXG4gICAgICAvLyBjb21wdXRlIGFuIGFuZ2xlIGRpZmZlcmVuY2UgdGhhdCByZXByZXNlbnRzIGhvdyBcIm11Y2hcIiBvZiB0aGUgY2lyY2xlIG91ciBhcmMgY292ZXJzXHJcbiAgICAgIHRoaXMuX2FuZ2xlRGlmZmVyZW5jZSA9IHRoaXMuX2FudGljbG9ja3dpc2UgPyB0aGlzLl9zdGFydEFuZ2xlIC0gdGhpcy5fZW5kQW5nbGUgOiB0aGlzLl9lbmRBbmdsZSAtIHRoaXMuX3N0YXJ0QW5nbGU7XHJcbiAgICAgIGlmICggdGhpcy5fYW5nbGVEaWZmZXJlbmNlIDwgMCApIHtcclxuICAgICAgICB0aGlzLl9hbmdsZURpZmZlcmVuY2UgKz0gTWF0aC5QSSAqIDI7XHJcbiAgICAgIH1cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fYW5nbGVEaWZmZXJlbmNlID49IDAgKTsgLy8gbm93IGl0IHNob3VsZCBhbHdheXMgYmUgemVybyBvciBwb3NpdGl2ZVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX2FuZ2xlRGlmZmVyZW5jZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYW5nbGVEaWZmZXJlbmNlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEFuZ2xlRGlmZmVyZW5jZSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgdW5pdCBhcmcgc2VnbWVudCB0aGF0IHdlIGNhbiBtYXAgdG8gb3VyIGVsbGlwc2UuIHVzZWZ1bCBmb3IgaGl0IHRlc3RpbmcgYW5kIHN1Y2guXHJcbiAgICovXHJcbiAgcHVibGljIGdldFVuaXRBcmNTZWdtZW50KCk6IEFyYyB7XHJcbiAgICBpZiAoIHRoaXMuX3VuaXRBcmNTZWdtZW50ID09PSBudWxsICkge1xyXG4gICAgICB0aGlzLl91bml0QXJjU2VnbWVudCA9IG5ldyBBcmMoIFZlY3RvcjIuWkVSTywgMSwgdGhpcy5fc3RhcnRBbmdsZSwgdGhpcy5fZW5kQW5nbGUsIHRoaXMuX2FudGljbG9ja3dpc2UgKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl91bml0QXJjU2VnbWVudDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgdW5pdEFyY1NlZ21lbnQoKTogQXJjIHsgcmV0dXJuIHRoaXMuZ2V0VW5pdEFyY1NlZ21lbnQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBib3VuZHMgb2YgdGhpcyBzZWdtZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRCb3VuZHMoKTogQm91bmRzMiB7XHJcbiAgICBpZiAoIHRoaXMuX2JvdW5kcyA9PT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5fYm91bmRzID0gQm91bmRzMi5OT1RISU5HLndpdGhQb2ludCggdGhpcy5nZXRTdGFydCgpIClcclxuICAgICAgICAud2l0aFBvaW50KCB0aGlzLmdldEVuZCgpICk7XHJcblxyXG4gICAgICAvLyBpZiB0aGUgYW5nbGVzIGFyZSBkaWZmZXJlbnQsIGNoZWNrIGV4dHJlbWEgcG9pbnRzXHJcbiAgICAgIGlmICggdGhpcy5fc3RhcnRBbmdsZSAhPT0gdGhpcy5fZW5kQW5nbGUgKSB7XHJcbiAgICAgICAgLy8gc29sdmUgdGhlIG1hcHBpbmcgZnJvbSB0aGUgdW5pdCBjaXJjbGUsIGZpbmQgbG9jYXRpb25zIHdoZXJlIGEgY29vcmRpbmF0ZSBvZiB0aGUgZ3JhZGllbnQgaXMgemVyby5cclxuICAgICAgICAvLyB3ZSBmaW5kIG9uZSBleHRyZW1hIHBvaW50IGZvciBib3RoIHggYW5kIHksIHNpbmNlIHRoZSBvdGhlciB0d28gYXJlIGp1c3Qgcm90YXRlZCBieSBwaSBmcm9tIHRoZW0uXHJcbiAgICAgICAgY29uc3QgeEFuZ2xlID0gTWF0aC5hdGFuKCAtKCB0aGlzLl9yYWRpdXNZIC8gdGhpcy5fcmFkaXVzWCApICogTWF0aC50YW4oIHRoaXMuX3JvdGF0aW9uICkgKTtcclxuICAgICAgICBjb25zdCB5QW5nbGUgPSBNYXRoLmF0YW4oICggdGhpcy5fcmFkaXVzWSAvIHRoaXMuX3JhZGl1c1ggKSAvIE1hdGgudGFuKCB0aGlzLl9yb3RhdGlvbiApICk7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGFsbCBvZiB0aGUgZXh0cmVtYSBwb2ludHNcclxuICAgICAgICB0aGlzLnBvc3NpYmxlRXh0cmVtYUFuZ2xlcyA9IFtcclxuICAgICAgICAgIHhBbmdsZSxcclxuICAgICAgICAgIHhBbmdsZSArIE1hdGguUEksXHJcbiAgICAgICAgICB5QW5nbGUsXHJcbiAgICAgICAgICB5QW5nbGUgKyBNYXRoLlBJXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgXy5lYWNoKCB0aGlzLnBvc3NpYmxlRXh0cmVtYUFuZ2xlcywgdGhpcy5pbmNsdWRlQm91bmRzQXRBbmdsZS5iaW5kKCB0aGlzICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX2JvdW5kcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYm91bmRzKCk6IEJvdW5kczIgeyByZXR1cm4gdGhpcy5nZXRCb3VuZHMoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBub24tZGVnZW5lcmF0ZSBzZWdtZW50cyB0aGF0IGFyZSBlcXVpdmFsZW50IHRvIHRoaXMgc2VnbWVudC4gR2VuZXJhbGx5IGdldHMgcmlkIChvciBzaW1wbGlmaWVzKVxyXG4gICAqIGludmFsaWQgb3IgcmVwZWF0ZWQgc2VnbWVudHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cygpOiBTZWdtZW50W10ge1xyXG4gICAgaWYgKCB0aGlzLl9yYWRpdXNYIDw9IDAgfHwgdGhpcy5fcmFkaXVzWSA8PSAwIHx8IHRoaXMuX3N0YXJ0QW5nbGUgPT09IHRoaXMuX2VuZEFuZ2xlICkge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5fcmFkaXVzWCA9PT0gdGhpcy5fcmFkaXVzWSApIHtcclxuICAgICAgLy8gcmVkdWNlIHRvIGFuIEFyY1xyXG4gICAgICBjb25zdCBzdGFydEFuZ2xlID0gdGhpcy5fc3RhcnRBbmdsZSArIHRoaXMuX3JvdGF0aW9uO1xyXG4gICAgICBsZXQgZW5kQW5nbGUgPSB0aGlzLl9lbmRBbmdsZSArIHRoaXMuX3JvdGF0aW9uO1xyXG5cclxuICAgICAgLy8gcHJlc2VydmUgZnVsbCBjaXJjbGVzXHJcbiAgICAgIGlmICggTWF0aC5hYnMoIHRoaXMuX2VuZEFuZ2xlIC0gdGhpcy5fc3RhcnRBbmdsZSApID09PSBNYXRoLlBJICogMiApIHtcclxuICAgICAgICBlbmRBbmdsZSA9IHRoaXMuX2FudGljbG9ja3dpc2UgPyBzdGFydEFuZ2xlIC0gTWF0aC5QSSAqIDIgOiBzdGFydEFuZ2xlICsgTWF0aC5QSSAqIDI7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFsgbmV3IEFyYyggdGhpcy5fY2VudGVyLCB0aGlzLl9yYWRpdXNYLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgdGhpcy5fYW50aWNsb2Nrd2lzZSApIF07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIFsgdGhpcyBdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXR0ZW1wdHMgdG8gZXhwYW5kIHRoZSBwcml2YXRlIF9ib3VuZHMgYm91bmRpbmcgYm94IHRvIGluY2x1ZGUgYSBwb2ludCBhdCBhIHNwZWNpZmljIGFuZ2xlLCBtYWtpbmcgc3VyZSB0aGF0XHJcbiAgICogYW5nbGUgaXMgYWN0dWFsbHkgaW5jbHVkZWQgaW4gdGhlIGFyYy4gVGhpcyB3aWxsIHByZXN1bWFibHkgYmUgY2FsbGVkIGF0IGFuZ2xlcyB0aGF0IGFyZSBhdCBjcml0aWNhbCBwb2ludHMsXHJcbiAgICogd2hlcmUgdGhlIGFyYyBzaG91bGQgaGF2ZSBtYXhpbXVtL21pbmltdW0geC95IHZhbHVlcy5cclxuICAgKi9cclxuICBwcml2YXRlIGluY2x1ZGVCb3VuZHNBdEFuZ2xlKCBhbmdsZTogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLnVuaXRBcmNTZWdtZW50LmNvbnRhaW5zQW5nbGUoIGFuZ2xlICkgKSB7XHJcbiAgICAgIC8vIHRoZSBib3VuZGFyeSBwb2ludCBpcyBpbiB0aGUgYXJjXHJcbiAgICAgIHRoaXMuX2JvdW5kcyA9IHRoaXMuX2JvdW5kcyEud2l0aFBvaW50KCB0aGlzLnBvc2l0aW9uQXRBbmdsZSggYW5nbGUgKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFwcyBhIGNvbnRhaW5lZCBhbmdsZSB0byBiZXR3ZWVuIFtzdGFydEFuZ2xlLGFjdHVhbEVuZEFuZ2xlKSwgZXZlbiBpZiB0aGUgZW5kIGFuZ2xlIGlzIGxvd2VyLlxyXG4gICAqXHJcbiAgICogVE9ETzogcmVtb3ZlIGR1cGxpY2F0aW9uIHdpdGggQXJjXHJcbiAgICovXHJcbiAgcHVibGljIG1hcEFuZ2xlKCBhbmdsZTogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBpZiAoIE1hdGguYWJzKCBVdGlscy5tb2R1bG9CZXR3ZWVuRG93biggYW5nbGUgLSB0aGlzLl9zdGFydEFuZ2xlLCAtTWF0aC5QSSwgTWF0aC5QSSApICkgPCAxZS04ICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fc3RhcnRBbmdsZTtcclxuICAgIH1cclxuICAgIGlmICggTWF0aC5hYnMoIFV0aWxzLm1vZHVsb0JldHdlZW5Eb3duKCBhbmdsZSAtIHRoaXMuZ2V0QWN0dWFsRW5kQW5nbGUoKSwgLU1hdGguUEksIE1hdGguUEkgKSApIDwgMWUtOCApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0QWN0dWFsRW5kQW5nbGUoKTtcclxuICAgIH1cclxuICAgIC8vIGNvbnNpZGVyIGFuIGFzc2VydCB0aGF0IHdlIGNvbnRhaW4gdGhhdCBhbmdsZT9cclxuICAgIHJldHVybiAoIHRoaXMuX3N0YXJ0QW5nbGUgPiB0aGlzLmdldEFjdHVhbEVuZEFuZ2xlKCkgKSA/XHJcbiAgICAgICAgICAgVXRpbHMubW9kdWxvQmV0d2VlblVwKCBhbmdsZSwgdGhpcy5fc3RhcnRBbmdsZSAtIDIgKiBNYXRoLlBJLCB0aGlzLl9zdGFydEFuZ2xlICkgOlxyXG4gICAgICAgICAgIFV0aWxzLm1vZHVsb0JldHdlZW5Eb3duKCBhbmdsZSwgdGhpcy5fc3RhcnRBbmdsZSwgdGhpcy5fc3RhcnRBbmdsZSArIDIgKiBNYXRoLlBJICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBwYXJhbWV0cml6ZWQgdmFsdWUgdCBmb3IgYSBnaXZlbiBhbmdsZS4gVGhlIHZhbHVlIHQgc2hvdWxkIHJhbmdlIGZyb20gMCB0byAxIChpbmNsdXNpdmUpLlxyXG4gICAqXHJcbiAgICogVE9ETzogcmVtb3ZlIGR1cGxpY2F0aW9uIHdpdGggQXJjXHJcbiAgICovXHJcbiAgcHVibGljIHRBdEFuZ2xlKCBhbmdsZTogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gKCB0aGlzLm1hcEFuZ2xlKCBhbmdsZSApIC0gdGhpcy5fc3RhcnRBbmdsZSApIC8gKCB0aGlzLmdldEFjdHVhbEVuZEFuZ2xlKCkgLSB0aGlzLl9zdGFydEFuZ2xlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBhbmdsZSBmb3IgdGhlIHBhcmFtZXRyaXplZCB0IHZhbHVlLiBUaGUgdCB2YWx1ZSBzaG91bGQgcmFuZ2UgZnJvbSAwIHRvIDEgKGluY2x1c2l2ZSkuXHJcbiAgICovXHJcbiAgcHVibGljIGFuZ2xlQXQoIHQ6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0QW5nbGUgKyAoIHRoaXMuZ2V0QWN0dWFsRW5kQW5nbGUoKSAtIHRoaXMuX3N0YXJ0QW5nbGUgKSAqIHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBwb3NpdGlvbiBvZiB0aGlzIGFyYyBhdCBhbmdsZS5cclxuICAgKi9cclxuICBwdWJsaWMgcG9zaXRpb25BdEFuZ2xlKCBhbmdsZTogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VW5pdFRyYW5zZm9ybSgpLnRyYW5zZm9ybVBvc2l0aW9uMiggVmVjdG9yMi5jcmVhdGVQb2xhciggMSwgYW5nbGUgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbm9ybWFsaXplZCB0YW5nZW50IG9mIHRoaXMgYXJjLlxyXG4gICAqIFRoZSB0YW5nZW50IHBvaW50cyBvdXR3YXJkIChpbndhcmQpIG9mIHRoaXMgYXJjIGZvciBjbG9ja3dpc2UgKGFudGljbG9ja3dpc2UpIGRpcmVjdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgdGFuZ2VudEF0QW5nbGUoIGFuZ2xlOiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICBjb25zdCBub3JtYWwgPSB0aGlzLmdldFVuaXRUcmFuc2Zvcm0oKS50cmFuc2Zvcm1Ob3JtYWwyKCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCAxLCBhbmdsZSApICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX2FudGljbG9ja3dpc2UgPyBub3JtYWwucGVycGVuZGljdWxhciA6IG5vcm1hbC5wZXJwZW5kaWN1bGFyLm5lZ2F0ZWQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2Ygc3RyYWlnaHQgbGluZXMgdGhhdCB3aWxsIGRyYXcgYW4gb2Zmc2V0IG9uIHRoZSBsb2dpY2FsIGxlZnQgKHJpZ2h0KSBzaWRlIGZvciByZXZlcnNlIGZhbHNlICh0cnVlKVxyXG4gICAqIEl0IGRpc2NyZXRpemVzIHRoZSBlbGxpcHRpY2FsIGFyYyBpbiAzMiBzZWdtZW50cyBhbmQgcmV0dXJucyBhbiBvZmZzZXQgY3VydmUgYXMgYSBsaXN0IG9mIGxpbmVUb3MvXHJcbiAgICpcclxuICAgKiBAcGFyYW0gciAtIGRpc3RhbmNlXHJcbiAgICogQHBhcmFtIHJldmVyc2VcclxuICAgKi9cclxuICBwdWJsaWMgb2Zmc2V0VG8oIHI6IG51bWJlciwgcmV2ZXJzZTogYm9vbGVhbiApOiBMaW5lW10ge1xyXG4gICAgLy8gaG93IG1hbnkgc2VnbWVudHMgdG8gY3JlYXRlIChwb3NzaWJseSBtYWtlIHRoaXMgbW9yZSBhZGFwdGl2ZT8pXHJcbiAgICBjb25zdCBxdWFudGl0eSA9IDMyO1xyXG5cclxuICAgIGNvbnN0IHBvaW50cyA9IFtdO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBxdWFudGl0eTsgaSsrICkge1xyXG4gICAgICBsZXQgcmF0aW8gPSBpIC8gKCBxdWFudGl0eSAtIDEgKTtcclxuICAgICAgaWYgKCByZXZlcnNlICkge1xyXG4gICAgICAgIHJhdGlvID0gMSAtIHJhdGlvO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGFuZ2xlID0gdGhpcy5hbmdsZUF0KCByYXRpbyApO1xyXG5cclxuICAgICAgcG9pbnRzLnB1c2goIHRoaXMucG9zaXRpb25BdEFuZ2xlKCBhbmdsZSApLnBsdXMoIHRoaXMudGFuZ2VudEF0QW5nbGUoIGFuZ2xlICkucGVycGVuZGljdWxhci5ub3JtYWxpemVkKCkudGltZXMoIHIgKSApICk7XHJcbiAgICAgIGlmICggaSA+IDAgKSB7XHJcbiAgICAgICAgcmVzdWx0LnB1c2goIG5ldyBMaW5lKCBwb2ludHNbIGkgLSAxIF0sIHBvaW50c1sgaSBdICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIFNWRyBwYXRoLiBhc3N1bWVzIHRoYXQgdGhlIHN0YXJ0IHBvaW50IGlzIGFscmVhZHkgcHJvdmlkZWQsXHJcbiAgICogc28gYW55dGhpbmcgdGhhdCBjYWxscyB0aGlzIG5lZWRzIHRvIHB1dCB0aGUgTSBjYWxscyBmaXJzdC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U1ZHUGF0aEZyYWdtZW50KCk6IHN0cmluZyB7XHJcbiAgICBsZXQgb2xkUGF0aEZyYWdtZW50O1xyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIG9sZFBhdGhGcmFnbWVudCA9IHRoaXMuX3N2Z1BhdGhGcmFnbWVudDtcclxuICAgICAgdGhpcy5fc3ZnUGF0aEZyYWdtZW50ID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmICggIXRoaXMuX3N2Z1BhdGhGcmFnbWVudCApIHtcclxuICAgICAgLy8gc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9wYXRocy5odG1sI1BhdGhEYXRhRWxsaXB0aWNhbEFyY0NvbW1hbmRzIGZvciBtb3JlIGluZm9cclxuICAgICAgLy8gcnggcnkgeC1heGlzLXJvdGF0aW9uIGxhcmdlLWFyYy1mbGFnIHN3ZWVwLWZsYWcgeCB5XHJcbiAgICAgIGNvbnN0IGVwc2lsb24gPSAwLjAxOyAvLyBhbGxvdyBzb21lIGxlZXdheSB0byByZW5kZXIgdGhpbmdzIGFzICdhbG1vc3QgY2lyY2xlcydcclxuICAgICAgY29uc3Qgc3dlZXBGbGFnID0gdGhpcy5fYW50aWNsb2Nrd2lzZSA/ICcwJyA6ICcxJztcclxuICAgICAgbGV0IGxhcmdlQXJjRmxhZztcclxuICAgICAgY29uc3QgZGVncmVlc1JvdGF0aW9uID0gdG9EZWdyZWVzKCB0aGlzLl9yb3RhdGlvbiApOyAvLyBibGVoLCBkZWdyZWVzP1xyXG4gICAgICBpZiAoIHRoaXMuZ2V0QW5nbGVEaWZmZXJlbmNlKCkgPCBNYXRoLlBJICogMiAtIGVwc2lsb24gKSB7XHJcbiAgICAgICAgbGFyZ2VBcmNGbGFnID0gdGhpcy5nZXRBbmdsZURpZmZlcmVuY2UoKSA8IE1hdGguUEkgPyAnMCcgOiAnMSc7XHJcbiAgICAgICAgdGhpcy5fc3ZnUGF0aEZyYWdtZW50ID0gYEEgJHtzdmdOdW1iZXIoIHRoaXMuX3JhZGl1c1ggKX0gJHtzdmdOdW1iZXIoIHRoaXMuX3JhZGl1c1kgKX0gJHtkZWdyZWVzUm90YXRpb25cclxuICAgICAgICB9ICR7bGFyZ2VBcmNGbGFnfSAke3N3ZWVwRmxhZ30gJHtzdmdOdW1iZXIoIHRoaXMuZ2V0RW5kKCkueCApfSAke3N2Z051bWJlciggdGhpcy5nZXRFbmQoKS55ICl9YDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBlbGxpcHNlIChvciBhbG1vc3QtZWxsaXBzZSkgY2FzZSBuZWVkcyB0byBiZSBoYW5kbGVkIGRpZmZlcmVudGx5XHJcbiAgICAgICAgLy8gc2luY2UgU1ZHIHdpbGwgbm90IGJlIGFibGUgdG8gZHJhdyAob3Iga25vdyBob3cgdG8gZHJhdykgdGhlIGNvcnJlY3QgY2lyY2xlIGlmIHdlIGp1c3QgaGF2ZSBhIHN0YXJ0IGFuZCBlbmQsIHdlIG5lZWQgdG8gc3BsaXQgaXQgaW50byB0d28gY2lyY3VsYXIgYXJjc1xyXG5cclxuICAgICAgICAvLyBnZXQgdGhlIGFuZ2xlIHRoYXQgaXMgYmV0d2VlbiBhbmQgb3Bwb3NpdGUgb2YgYm90aCBvZiB0aGUgcG9pbnRzXHJcbiAgICAgICAgY29uc3Qgc3BsaXRPcHBvc2l0ZUFuZ2xlID0gKCB0aGlzLl9zdGFydEFuZ2xlICsgdGhpcy5fZW5kQW5nbGUgKSAvIDI7IC8vIHRoaXMgX3Nob3VsZF8gd29yayBmb3IgdGhlIG1vZHVsYXIgY2FzZT9cclxuICAgICAgICBjb25zdCBzcGxpdFBvaW50ID0gdGhpcy5wb3NpdGlvbkF0QW5nbGUoIHNwbGl0T3Bwb3NpdGVBbmdsZSApO1xyXG5cclxuICAgICAgICBsYXJnZUFyY0ZsYWcgPSAnMCc7IC8vIHNpbmNlIHdlIHNwbGl0IGl0IGluIDIsIGl0J3MgYWx3YXlzIHRoZSBzbWFsbCBhcmNcclxuXHJcbiAgICAgICAgY29uc3QgZmlyc3RBcmMgPSBgQSAke3N2Z051bWJlciggdGhpcy5fcmFkaXVzWCApfSAke3N2Z051bWJlciggdGhpcy5fcmFkaXVzWSApfSAke1xyXG4gICAgICAgICAgZGVncmVlc1JvdGF0aW9ufSAke2xhcmdlQXJjRmxhZ30gJHtzd2VlcEZsYWd9ICR7XHJcbiAgICAgICAgICBzdmdOdW1iZXIoIHNwbGl0UG9pbnQueCApfSAke3N2Z051bWJlciggc3BsaXRQb2ludC55ICl9YDtcclxuICAgICAgICBjb25zdCBzZWNvbmRBcmMgPSBgQSAke3N2Z051bWJlciggdGhpcy5fcmFkaXVzWCApfSAke3N2Z051bWJlciggdGhpcy5fcmFkaXVzWSApfSAke1xyXG4gICAgICAgICAgZGVncmVlc1JvdGF0aW9ufSAke2xhcmdlQXJjRmxhZ30gJHtzd2VlcEZsYWd9ICR7XHJcbiAgICAgICAgICBzdmdOdW1iZXIoIHRoaXMuZ2V0RW5kKCkueCApfSAke3N2Z051bWJlciggdGhpcy5nZXRFbmQoKS55ICl9YDtcclxuXHJcbiAgICAgICAgdGhpcy5fc3ZnUGF0aEZyYWdtZW50ID0gYCR7Zmlyc3RBcmN9ICR7c2Vjb25kQXJjfWA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICBpZiAoIG9sZFBhdGhGcmFnbWVudCApIHtcclxuICAgICAgICBhc3NlcnQoIG9sZFBhdGhGcmFnbWVudCA9PT0gdGhpcy5fc3ZnUGF0aEZyYWdtZW50LCAnUXVhZHJhdGljIGxpbmUgc2VnbWVudCBjaGFuZ2VkIHdpdGhvdXQgaW52YWxpZGF0ZSgpJyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fc3ZnUGF0aEZyYWdtZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBzdHJhaWdodCBsaW5lcyAgdGhhdCB3aWxsIGRyYXcgYW4gb2Zmc2V0IG9uIHRoZSBsb2dpY2FsIGxlZnQgc2lkZS5cclxuICAgKi9cclxuICBwdWJsaWMgc3Ryb2tlTGVmdCggbGluZVdpZHRoOiBudW1iZXIgKTogTGluZVtdIHtcclxuICAgIHJldHVybiB0aGlzLm9mZnNldFRvKCAtbGluZVdpZHRoIC8gMiwgZmFsc2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2Ygc3RyYWlnaHQgbGluZXMgdGhhdCB3aWxsIGRyYXcgYW4gb2Zmc2V0IGN1cnZlIG9uIHRoZSBsb2dpY2FsIHJpZ2h0IHNpZGUuXHJcbiAgICovXHJcbiAgcHVibGljIHN0cm9rZVJpZ2h0KCBsaW5lV2lkdGg6IG51bWJlciApOiBMaW5lW10ge1xyXG4gICAgcmV0dXJuIHRoaXMub2Zmc2V0VG8oIGxpbmVXaWR0aCAvIDIsIHRydWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIHQgdmFsdWVzIHdoZXJlIGR4L2R0IG9yIGR5L2R0IGlzIDAgd2hlcmUgMCA8IHQgPCAxLiBzdWJkaXZpZGluZyBvbiB0aGVzZSB3aWxsIHJlc3VsdCBpbiBtb25vdG9uaWMgc2VnbWVudHNcclxuICAgKiBEb2VzIG5vdCBpbmNsdWRlIHQ9MCBhbmQgdD0xLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRJbnRlcmlvckV4dHJlbWFUcygpOiBudW1iZXJbXSB7XHJcbiAgICBjb25zdCByZXN1bHQ6IG51bWJlcltdID0gW107XHJcbiAgICBfLmVhY2goIHRoaXMucG9zc2libGVFeHRyZW1hQW5nbGVzLCAoIGFuZ2xlOiBudW1iZXIgKSA9PiB7XHJcbiAgICAgIGlmICggdGhpcy51bml0QXJjU2VnbWVudC5jb250YWluc0FuZ2xlKCBhbmdsZSApICkge1xyXG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLnRBdEFuZ2xlKCBhbmdsZSApO1xyXG4gICAgICAgIGNvbnN0IGVwc2lsb24gPSAwLjAwMDAwMDAwMDE7IC8vIFRPRE86IGdlbmVyYWwga2l0ZSBlcHNpbG9uP1xyXG4gICAgICAgIGlmICggdCA+IGVwc2lsb24gJiYgdCA8IDEgLSBlcHNpbG9uICkge1xyXG4gICAgICAgICAgcmVzdWx0LnB1c2goIHQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHJldHVybiByZXN1bHQuc29ydCgpOyAvLyBtb2RpZmllcyBvcmlnaW5hbCwgd2hpY2ggaXMgT0tcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhpdC10ZXN0cyB0aGlzIHNlZ21lbnQgd2l0aCB0aGUgcmF5LiBBbiBhcnJheSBvZiBhbGwgaW50ZXJzZWN0aW9ucyBvZiB0aGUgcmF5IHdpdGggdGhpcyBzZWdtZW50IHdpbGwgYmUgcmV0dXJuZWQuXHJcbiAgICogRm9yIGRldGFpbHMsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBpbiBTZWdtZW50LmpzXHJcbiAgICovXHJcbiAgcHVibGljIGludGVyc2VjdGlvbiggcmF5OiBSYXkyICk6IFJheUludGVyc2VjdGlvbltdIHtcclxuICAgIC8vIGJlIGxhenkuIHRyYW5zZm9ybSBpdCBpbnRvIHRoZSBzcGFjZSBvZiBhIG5vbi1lbGxpcHRpY2FsIGFyYy5cclxuICAgIGNvbnN0IHVuaXRUcmFuc2Zvcm0gPSB0aGlzLmdldFVuaXRUcmFuc2Zvcm0oKTtcclxuICAgIGNvbnN0IHJheUluVW5pdENpcmNsZVNwYWNlID0gdW5pdFRyYW5zZm9ybS5pbnZlcnNlUmF5MiggcmF5ICk7XHJcbiAgICBjb25zdCBoaXRzID0gdGhpcy5nZXRVbml0QXJjU2VnbWVudCgpLmludGVyc2VjdGlvbiggcmF5SW5Vbml0Q2lyY2xlU3BhY2UgKTtcclxuXHJcbiAgICByZXR1cm4gXy5tYXAoIGhpdHMsIGhpdCA9PiB7XHJcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVkUG9pbnQgPSB1bml0VHJhbnNmb3JtLnRyYW5zZm9ybVBvc2l0aW9uMiggaGl0LnBvaW50ICk7XHJcbiAgICAgIGNvbnN0IGRpc3RhbmNlID0gcmF5LnBvc2l0aW9uLmRpc3RhbmNlKCB0cmFuc2Zvcm1lZFBvaW50ICk7XHJcbiAgICAgIGNvbnN0IG5vcm1hbCA9IHVuaXRUcmFuc2Zvcm0uaW52ZXJzZU5vcm1hbDIoIGhpdC5ub3JtYWwgKTtcclxuICAgICAgcmV0dXJuIG5ldyBSYXlJbnRlcnNlY3Rpb24oIGRpc3RhbmNlLCB0cmFuc2Zvcm1lZFBvaW50LCBub3JtYWwsIGhpdC53aW5kLCBoaXQudCApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgcmVzdWx0YW50IHdpbmRpbmcgbnVtYmVyIG9mIHRoaXMgcmF5IGludGVyc2VjdGluZyB0aGlzIGFyYy5cclxuICAgKi9cclxuICBwdWJsaWMgd2luZGluZ0ludGVyc2VjdGlvbiggcmF5OiBSYXkyICk6IG51bWJlciB7XHJcbiAgICAvLyBiZSBsYXp5LiB0cmFuc2Zvcm0gaXQgaW50byB0aGUgc3BhY2Ugb2YgYSBub24tZWxsaXB0aWNhbCBhcmMuXHJcbiAgICBjb25zdCByYXlJblVuaXRDaXJjbGVTcGFjZSA9IHRoaXMuZ2V0VW5pdFRyYW5zZm9ybSgpLmludmVyc2VSYXkyKCByYXkgKTtcclxuICAgIHJldHVybiB0aGlzLmdldFVuaXRBcmNTZWdtZW50KCkud2luZGluZ0ludGVyc2VjdGlvbiggcmF5SW5Vbml0Q2lyY2xlU3BhY2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERyYXdzIHRoaXMgYXJjIHRvIHRoZSAyRCBDYW52YXMgY29udGV4dCwgYXNzdW1pbmcgdGhlIGNvbnRleHQncyBjdXJyZW50IGxvY2F0aW9uIGlzIGFscmVhZHkgYXQgdGhlIHN0YXJ0IHBvaW50XHJcbiAgICovXHJcbiAgcHVibGljIHdyaXRlVG9Db250ZXh0KCBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgKTogdm9pZCB7XHJcbiAgICBpZiAoIGNvbnRleHQuZWxsaXBzZSApIHtcclxuICAgICAgY29udGV4dC5lbGxpcHNlKCB0aGlzLl9jZW50ZXIueCwgdGhpcy5fY2VudGVyLnksIHRoaXMuX3JhZGl1c1gsIHRoaXMuX3JhZGl1c1ksIHRoaXMuX3JvdGF0aW9uLCB0aGlzLl9zdGFydEFuZ2xlLCB0aGlzLl9lbmRBbmdsZSwgdGhpcy5fYW50aWNsb2Nrd2lzZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIGZha2UgdGhlIGVsbGlwc2UgY2FsbCBieSB1c2luZyB0cmFuc2Zvcm1zXHJcbiAgICAgIHRoaXMuZ2V0VW5pdFRyYW5zZm9ybSgpLmdldE1hdHJpeCgpLmNhbnZhc0FwcGVuZFRyYW5zZm9ybSggY29udGV4dCApO1xyXG4gICAgICBjb250ZXh0LmFyYyggMCwgMCwgMSwgdGhpcy5fc3RhcnRBbmdsZSwgdGhpcy5fZW5kQW5nbGUsIHRoaXMuX2FudGljbG9ja3dpc2UgKTtcclxuICAgICAgdGhpcy5nZXRVbml0VHJhbnNmb3JtKCkuZ2V0SW52ZXJzZSgpLmNhbnZhc0FwcGVuZFRyYW5zZm9ybSggY29udGV4dCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGlzIGVsbGlwdGljYWwgYXJjIHRyYW5zZm9ybWVkIGJ5IGEgbWF0cml4XHJcbiAgICovXHJcbiAgcHVibGljIHRyYW5zZm9ybWVkKCBtYXRyaXg6IE1hdHJpeDMgKTogRWxsaXB0aWNhbEFyYyB7XHJcbiAgICBjb25zdCB0cmFuc2Zvcm1lZFNlbWlNYWpvckF4aXMgPSBtYXRyaXgudGltZXNWZWN0b3IyKCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCB0aGlzLl9yYWRpdXNYLCB0aGlzLl9yb3RhdGlvbiApICkubWludXMoIG1hdHJpeC50aW1lc1ZlY3RvcjIoIFZlY3RvcjIuWkVSTyApICk7XHJcbiAgICBjb25zdCB0cmFuc2Zvcm1lZFNlbWlNaW5vckF4aXMgPSBtYXRyaXgudGltZXNWZWN0b3IyKCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCB0aGlzLl9yYWRpdXNZLCB0aGlzLl9yb3RhdGlvbiArIE1hdGguUEkgLyAyICkgKS5taW51cyggbWF0cml4LnRpbWVzVmVjdG9yMiggVmVjdG9yMi5aRVJPICkgKTtcclxuICAgIGNvbnN0IHJvdGF0aW9uID0gdHJhbnNmb3JtZWRTZW1pTWFqb3JBeGlzLmFuZ2xlO1xyXG4gICAgY29uc3QgcmFkaXVzWCA9IHRyYW5zZm9ybWVkU2VtaU1ham9yQXhpcy5tYWduaXR1ZGU7XHJcbiAgICBjb25zdCByYWRpdXNZID0gdHJhbnNmb3JtZWRTZW1pTWlub3JBeGlzLm1hZ25pdHVkZTtcclxuXHJcbiAgICBjb25zdCByZWZsZWN0ZWQgPSBtYXRyaXguZ2V0RGV0ZXJtaW5hbnQoKSA8IDA7XHJcblxyXG4gICAgLy8gcmV2ZXJzZSB0aGUgJ2Nsb2Nrd2lzZW5lc3MnIGlmIG91ciB0cmFuc2Zvcm0gaW5jbHVkZXMgYSByZWZsZWN0aW9uXHJcbiAgICAvLyBUT0RPOiBjaGVjayByZWZsZWN0aW9ucy4gc3dhcHBpbmcgYW5nbGUgc2lnbnMgc2hvdWxkIGZpeCBjbG9ja3dpc2VuZXNzXHJcbiAgICBjb25zdCBhbnRpY2xvY2t3aXNlID0gcmVmbGVjdGVkID8gIXRoaXMuX2FudGljbG9ja3dpc2UgOiB0aGlzLl9hbnRpY2xvY2t3aXNlO1xyXG4gICAgY29uc3Qgc3RhcnRBbmdsZSA9IHJlZmxlY3RlZCA/IC10aGlzLl9zdGFydEFuZ2xlIDogdGhpcy5fc3RhcnRBbmdsZTtcclxuICAgIGxldCBlbmRBbmdsZSA9IHJlZmxlY3RlZCA/IC10aGlzLl9lbmRBbmdsZSA6IHRoaXMuX2VuZEFuZ2xlO1xyXG5cclxuICAgIGlmICggTWF0aC5hYnMoIHRoaXMuX2VuZEFuZ2xlIC0gdGhpcy5fc3RhcnRBbmdsZSApID09PSBNYXRoLlBJICogMiApIHtcclxuICAgICAgZW5kQW5nbGUgPSBhbnRpY2xvY2t3aXNlID8gc3RhcnRBbmdsZSAtIE1hdGguUEkgKiAyIDogc3RhcnRBbmdsZSArIE1hdGguUEkgKiAyO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgRWxsaXB0aWNhbEFyYyggbWF0cml4LnRpbWVzVmVjdG9yMiggdGhpcy5fY2VudGVyICksIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY29udHJpYnV0aW9uIHRvIHRoZSBzaWduZWQgYXJlYSBjb21wdXRlZCB1c2luZyBHcmVlbidzIFRoZW9yZW0sIHdpdGggUD0teS8yIGFuZCBRPXgvMi5cclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgaXMgdGhpcyBzZWdtZW50J3MgY29udHJpYnV0aW9uIHRvIHRoZSBsaW5lIGludGVncmFsICgteS8yIGR4ICsgeC8yIGR5KS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U2lnbmVkQXJlYUZyYWdtZW50KCk6IG51bWJlciB7XHJcbiAgICBjb25zdCB0MCA9IHRoaXMuX3N0YXJ0QW5nbGU7XHJcbiAgICBjb25zdCB0MSA9IHRoaXMuZ2V0QWN0dWFsRW5kQW5nbGUoKTtcclxuXHJcbiAgICBjb25zdCBzaW4wID0gTWF0aC5zaW4oIHQwICk7XHJcbiAgICBjb25zdCBzaW4xID0gTWF0aC5zaW4oIHQxICk7XHJcbiAgICBjb25zdCBjb3MwID0gTWF0aC5jb3MoIHQwICk7XHJcbiAgICBjb25zdCBjb3MxID0gTWF0aC5jb3MoIHQxICk7XHJcblxyXG4gICAgLy8gRGVyaXZlZCB2aWEgTWF0aGVtYXRpY2EgKGN1cnZlLWFyZWEubmIpXHJcbiAgICByZXR1cm4gMC41ICogKCB0aGlzLl9yYWRpdXNYICogdGhpcy5fcmFkaXVzWSAqICggdDEgLSB0MCApICtcclxuICAgICAgICAgICAgICAgICAgIE1hdGguY29zKCB0aGlzLl9yb3RhdGlvbiApICogKCB0aGlzLl9yYWRpdXNYICogdGhpcy5fY2VudGVyLnkgKiAoIGNvczAgLSBjb3MxICkgK1xyXG4gICAgICAgICAgICAgICAgICAgdGhpcy5fcmFkaXVzWSAqIHRoaXMuX2NlbnRlci54ICogKCBzaW4xIC0gc2luMCApICkgK1xyXG4gICAgICAgICAgICAgICAgICAgTWF0aC5zaW4oIHRoaXMuX3JvdGF0aW9uICkgKiAoIHRoaXMuX3JhZGl1c1ggKiB0aGlzLl9jZW50ZXIueCAqICggY29zMSAtIGNvczAgKSArXHJcbiAgICAgICAgICAgICAgICAgICB0aGlzLl9yYWRpdXNZICogdGhpcy5fY2VudGVyLnkgKiAoIHNpbjEgLSBzaW4wICkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHJldmVyc2VkIGNvcHkgb2YgdGhpcyBzZWdtZW50IChtYXBwaW5nIHRoZSBwYXJhbWV0cml6YXRpb24gZnJvbSBbMCwxXSA9PiBbMSwwXSkuXHJcbiAgICovXHJcbiAgcHVibGljIHJldmVyc2VkKCk6IEVsbGlwdGljYWxBcmMge1xyXG4gICAgcmV0dXJuIG5ldyBFbGxpcHRpY2FsQXJjKCB0aGlzLl9jZW50ZXIsIHRoaXMuX3JhZGl1c1gsIHRoaXMuX3JhZGl1c1ksIHRoaXMuX3JvdGF0aW9uLCB0aGlzLl9lbmRBbmdsZSwgdGhpcy5fc3RhcnRBbmdsZSwgIXRoaXMuX2FudGljbG9ja3dpc2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IGZvcm0gdGhhdCBjYW4gYmUgdHVybmVkIGJhY2sgaW50byBhIHNlZ21lbnQgd2l0aCB0aGUgY29ycmVzcG9uZGluZyBkZXNlcmlhbGl6ZSBtZXRob2QuXHJcbiAgICovXHJcbiAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkRWxsaXB0aWNhbEFyYyB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiAnRWxsaXB0aWNhbEFyYycsXHJcbiAgICAgIGNlbnRlclg6IHRoaXMuX2NlbnRlci54LFxyXG4gICAgICBjZW50ZXJZOiB0aGlzLl9jZW50ZXIueSxcclxuICAgICAgcmFkaXVzWDogdGhpcy5fcmFkaXVzWCxcclxuICAgICAgcmFkaXVzWTogdGhpcy5fcmFkaXVzWSxcclxuICAgICAgcm90YXRpb246IHRoaXMuX3JvdGF0aW9uLFxyXG4gICAgICBzdGFydEFuZ2xlOiB0aGlzLl9zdGFydEFuZ2xlLFxyXG4gICAgICBlbmRBbmdsZTogdGhpcy5fZW5kQW5nbGUsXHJcbiAgICAgIGFudGljbG9ja3dpc2U6IHRoaXMuX2FudGljbG9ja3dpc2VcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgd2hldGhlciB0d28gbGluZXMgb3ZlcmxhcCBvdmVyIGEgY29udGludW91cyBzZWN0aW9uLCBhbmQgaWYgc28gZmluZHMgdGhlIGEsYiBwYWlyIHN1Y2ggdGhhdFxyXG4gICAqIHAoIHQgKSA9PT0gcSggYSAqIHQgKyBiICkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc2VnbWVudFxyXG4gICAqIEBwYXJhbSBbZXBzaWxvbl0gLSBXaWxsIHJldHVybiBvdmVybGFwcyBvbmx5IGlmIG5vIHR3byBjb3JyZXNwb25kaW5nIHBvaW50cyBkaWZmZXIgYnkgdGhpcyBhbW91bnQgb3IgbW9yZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbiBvbmUgY29tcG9uZW50LlxyXG4gICAqIEByZXR1cm5zIC0gVGhlIHNvbHV0aW9uLCBpZiB0aGVyZSBpcyBvbmUgKGFuZCBvbmx5IG9uZSlcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0T3ZlcmxhcHMoIHNlZ21lbnQ6IFNlZ21lbnQsIGVwc2lsb24gPSAxZS02ICk6IE92ZXJsYXBbXSB8IG51bGwge1xyXG4gICAgaWYgKCBzZWdtZW50IGluc3RhbmNlb2YgRWxsaXB0aWNhbEFyYyApIHtcclxuICAgICAgcmV0dXJuIEVsbGlwdGljYWxBcmMuZ2V0T3ZlcmxhcHMoIHRoaXMsIHNlZ21lbnQgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gRWxsaXB0aWNhbEFyYyBmcm9tIHRoZSBzZXJpYWxpemVkIHJlcHJlc2VudGF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgb3ZlcnJpZGUgZGVzZXJpYWxpemUoIG9iajogU2VyaWFsaXplZEVsbGlwdGljYWxBcmMgKTogRWxsaXB0aWNhbEFyYyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvYmoudHlwZSA9PT0gJ0VsbGlwdGljYWxBcmMnICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBFbGxpcHRpY2FsQXJjKCBuZXcgVmVjdG9yMiggb2JqLmNlbnRlclgsIG9iai5jZW50ZXJZICksIG9iai5yYWRpdXNYLCBvYmoucmFkaXVzWSwgb2JqLnJvdGF0aW9uLCBvYmouc3RhcnRBbmdsZSwgb2JqLmVuZEFuZ2xlLCBvYmouYW50aWNsb2Nrd2lzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGF0IHR5cGUgb2Ygb3ZlcmxhcCBpcyBwb3NzaWJsZSBiYXNlZCBvbiB0aGUgY2VudGVyL3JhZGlpL3JvdGF0aW9uLiBXZSBpZ25vcmUgdGhlIHN0YXJ0L2VuZCBhbmdsZXMgYW5kXHJcbiAgICogYW50aWNsb2Nrd2lzZSBpbmZvcm1hdGlvbiwgYW5kIGRldGVybWluZSBpZiB0aGUgRlVMTCBlbGxpcHNlcyBvdmVybGFwLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0T3ZlcmxhcFR5cGUoIGE6IEVsbGlwdGljYWxBcmMsIGI6IEVsbGlwdGljYWxBcmMsIGVwc2lsb24gPSAxZS0xMCApOiBFbGxpcHRpY2FsQXJjT3ZlcmxhcFR5cGUge1xyXG5cclxuICAgIC8vIERpZmZlcmVudCBjZW50ZXJzIGNhbid0IG92ZXJsYXAgY29udGludW91c2x5XHJcbiAgICBpZiAoIGEuX2NlbnRlci5kaXN0YW5jZSggYi5fY2VudGVyICkgPCBlcHNpbG9uICkge1xyXG5cclxuICAgICAgY29uc3QgbWF0Y2hpbmdSYWRpaSA9IE1hdGguYWJzKCBhLl9yYWRpdXNYIC0gYi5fcmFkaXVzWCApIDwgZXBzaWxvbiAmJiBNYXRoLmFicyggYS5fcmFkaXVzWSAtIGIuX3JhZGl1c1kgKSA8IGVwc2lsb247XHJcbiAgICAgIGNvbnN0IG9wcG9zaXRlUmFkaWkgPSBNYXRoLmFicyggYS5fcmFkaXVzWCAtIGIuX3JhZGl1c1kgKSA8IGVwc2lsb24gJiYgTWF0aC5hYnMoIGEuX3JhZGl1c1kgLSBiLl9yYWRpdXNYICkgPCBlcHNpbG9uO1xyXG5cclxuICAgICAgaWYgKCBtYXRjaGluZ1JhZGlpICkge1xyXG4gICAgICAgIC8vIERpZmZlcmVuY2UgYmV0d2VlbiByb3RhdGlvbnMgc2hvdWxkIGJlIGFuIGFwcHJveGltYXRlIG11bHRpcGxlIG9mIHBpLiBXZSBhZGQgcGkvMiBiZWZvcmUgbW9kdWxvLCBzbyB0aGVcclxuICAgICAgICAvLyByZXN1bHQgb2YgdGhhdCBzaG91bGQgYmUgfnBpLzIgKGRvbid0IG5lZWQgdG8gY2hlY2sgYm90aCBlbmRwb2ludHMpXHJcbiAgICAgICAgaWYgKCBNYXRoLmFicyggVXRpbHMubW9kdWxvQmV0d2VlbkRvd24oIGEuX3JvdGF0aW9uIC0gYi5fcm90YXRpb24gKyBNYXRoLlBJIC8gMiwgMCwgTWF0aC5QSSApIC0gTWF0aC5QSSAvIDIgKSA8IGVwc2lsb24gKSB7XHJcbiAgICAgICAgICByZXR1cm4gRWxsaXB0aWNhbEFyY092ZXJsYXBUeXBlLk1BVENISU5HX09WRVJMQVA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICggb3Bwb3NpdGVSYWRpaSApIHtcclxuICAgICAgICAvLyBEaWZmZXJlbmNlIGJldHdlZW4gcm90YXRpb25zIHNob3VsZCBiZSBhbiBhcHByb3hpbWF0ZSBtdWx0aXBsZSBvZiBwaSAod2l0aCBwaS8yIGFkZGVkKS5cclxuICAgICAgICBpZiAoIE1hdGguYWJzKCBVdGlscy5tb2R1bG9CZXR3ZWVuRG93biggYS5fcm90YXRpb24gLSBiLl9yb3RhdGlvbiwgMCwgTWF0aC5QSSApIC0gTWF0aC5QSSAvIDIgKSA8IGVwc2lsb24gKSB7XHJcbiAgICAgICAgICByZXR1cm4gRWxsaXB0aWNhbEFyY092ZXJsYXBUeXBlLk9QUE9TSVRFX09WRVJMQVA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIEVsbGlwdGljYWxBcmNPdmVybGFwVHlwZS5OT05FO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lIHdoZXRoZXIgdHdvIGVsbGlwdGljYWwgYXJjcyBvdmVybGFwIG92ZXIgY29udGludW91cyBzZWN0aW9ucywgYW5kIGlmIHNvIGZpbmRzIHRoZSBhLGIgcGFpcnMgc3VjaCB0aGF0XHJcbiAgICogcCggdCApID09PSBxKCBhICogdCArIGIgKS5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIC0gQW55IG92ZXJsYXBzIChmcm9tIDAgdG8gMilcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldE92ZXJsYXBzKCBhOiBFbGxpcHRpY2FsQXJjLCBiOiBFbGxpcHRpY2FsQXJjICk6IE92ZXJsYXBbXSB7XHJcblxyXG4gICAgY29uc3Qgb3ZlcmxhcFR5cGUgPSBFbGxpcHRpY2FsQXJjLmdldE92ZXJsYXBUeXBlKCBhLCBiICk7XHJcblxyXG4gICAgaWYgKCBvdmVybGFwVHlwZSA9PT0gRWxsaXB0aWNhbEFyY092ZXJsYXBUeXBlLk5PTkUgKSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gQXJjLmdldEFuZ3VsYXJPdmVybGFwcyggYS5fc3RhcnRBbmdsZSArIGEuX3JvdGF0aW9uLCBhLmdldEFjdHVhbEVuZEFuZ2xlKCkgKyBhLl9yb3RhdGlvbixcclxuICAgICAgICBiLl9zdGFydEFuZ2xlICsgYi5fcm90YXRpb24sIGIuZ2V0QWN0dWFsRW5kQW5nbGUoKSArIGIuX3JvdGF0aW9uICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFueSAoZmluaXRlKSBpbnRlcnNlY3Rpb24gYmV0d2VlbiB0aGUgdHdvIGVsbGlwdGljYWwgYXJjIHNlZ21lbnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgb3ZlcnJpZGUgaW50ZXJzZWN0KCBhOiBFbGxpcHRpY2FsQXJjLCBiOiBFbGxpcHRpY2FsQXJjLCBlcHNpbG9uID0gMWUtMTAgKTogU2VnbWVudEludGVyc2VjdGlvbltdIHtcclxuXHJcbiAgICBjb25zdCBvdmVybGFwVHlwZSA9IEVsbGlwdGljYWxBcmMuZ2V0T3ZlcmxhcFR5cGUoIGEsIGIsIGVwc2lsb24gKTtcclxuXHJcbiAgICBpZiAoIG92ZXJsYXBUeXBlID09PSBFbGxpcHRpY2FsQXJjT3ZlcmxhcFR5cGUuTk9ORSApIHtcclxuICAgICAgcmV0dXJuIEJvdW5kc0ludGVyc2VjdGlvbi5pbnRlcnNlY3QoIGEsIGIgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBJZiB3ZSBlZmZlY3RpdmVseSBoYXZlIHRoZSBzYW1lIGVsbGlwc2UsIGp1c3QgZGlmZmVyZW50IHNlY3Rpb25zIG9mIGl0LiBUaGUgb25seSBmaW5pdGUgaW50ZXJzZWN0aW9ucyBjb3VsZCBiZVxyXG4gICAgICAvLyBhdCB0aGUgZW5kcG9pbnRzLCBzbyB3ZSdsbCBpbnNwZWN0IHRob3NlLlxyXG5cclxuICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xyXG4gICAgICBjb25zdCBhU3RhcnQgPSBhLnBvc2l0aW9uQXQoIDAgKTtcclxuICAgICAgY29uc3QgYUVuZCA9IGEucG9zaXRpb25BdCggMSApO1xyXG4gICAgICBjb25zdCBiU3RhcnQgPSBiLnBvc2l0aW9uQXQoIDAgKTtcclxuICAgICAgY29uc3QgYkVuZCA9IGIucG9zaXRpb25BdCggMSApO1xyXG5cclxuICAgICAgaWYgKCBhU3RhcnQuZXF1YWxzRXBzaWxvbiggYlN0YXJ0LCBlcHNpbG9uICkgKSB7XHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKCBuZXcgU2VnbWVudEludGVyc2VjdGlvbiggYVN0YXJ0LmF2ZXJhZ2UoIGJTdGFydCApLCAwLCAwICkgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGFTdGFydC5lcXVhbHNFcHNpbG9uKCBiRW5kLCBlcHNpbG9uICkgKSB7XHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKCBuZXcgU2VnbWVudEludGVyc2VjdGlvbiggYVN0YXJ0LmF2ZXJhZ2UoIGJFbmQgKSwgMCwgMSApICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBhRW5kLmVxdWFsc0Vwc2lsb24oIGJTdGFydCwgZXBzaWxvbiApICkge1xyXG4gICAgICAgIHJlc3VsdHMucHVzaCggbmV3IFNlZ21lbnRJbnRlcnNlY3Rpb24oIGFFbmQuYXZlcmFnZSggYlN0YXJ0ICksIDEsIDAgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggYUVuZC5lcXVhbHNFcHNpbG9uKCBiRW5kLCBlcHNpbG9uICkgKSB7XHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKCBuZXcgU2VnbWVudEludGVyc2VjdGlvbiggYUVuZC5hdmVyYWdlKCBiRW5kICksIDEsIDEgKSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyYW5zZm9ybXMgdGhlIHVuaXQgY2lyY2xlIGludG8gb3VyIGVsbGlwc2UuXHJcbiAgICpcclxuICAgKiBhZGFwdGVkIGZyb20gaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL2ltcGxub3RlLmh0bWwjUGF0aEVsZW1lbnRJbXBsZW1lbnRhdGlvbk5vdGVzXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjb21wdXRlVW5pdFRyYW5zZm9ybSggY2VudGVyOiBWZWN0b3IyLCByYWRpdXNYOiBudW1iZXIsIHJhZGl1c1k6IG51bWJlciwgcm90YXRpb246IG51bWJlciApOiBUcmFuc2Zvcm0zIHtcclxuICAgIHJldHVybiBuZXcgVHJhbnNmb3JtMyggTWF0cml4My50cmFuc2xhdGlvbiggY2VudGVyLngsIGNlbnRlci55ICkgLy8gVE9ETzogY29udmVydCB0byBNYXRyaXgzLnRyYW5zbGF0aW9uKCB0aGlzLl9jZW50ZXIpIHdoZW4gYXZhaWxhYmxlXHJcbiAgICAgIC50aW1lc01hdHJpeCggTWF0cml4My5yb3RhdGlvbjIoIHJvdGF0aW9uICkgKVxyXG4gICAgICAudGltZXNNYXRyaXgoIE1hdHJpeDMuc2NhbGluZyggcmFkaXVzWCwgcmFkaXVzWSApICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFbGxpcHRpY2FsQXJjT3ZlcmxhcFR5cGUgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuICAvLyByYWRpdXNYIG9mIG9uZSBlcXVhbHMgcmFkaXVzWCBvZiB0aGUgb3RoZXIsIHdpdGggZXF1aXZhbGVudCBjZW50ZXJzIGFuZCByb3RhdGlvbnMgdG8gd29ya1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTUFUQ0hJTkdfT1ZFUkxBUCA9IG5ldyBFbGxpcHRpY2FsQXJjT3ZlcmxhcFR5cGUoKTtcclxuXHJcbiAgLy8gcmFkaXVzWCBvZiBvbmUgZXF1YWxzIHJhZGl1c1kgb2YgdGhlIG90aGVyLCB3aXRoIGVxdWl2YWxlbnQgY2VudGVycyBhbmQgcm90YXRpb25zIHRvIHdvcmtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE9QUE9TSVRFX09WRVJMQVAgPSBuZXcgRWxsaXB0aWNhbEFyY092ZXJsYXBUeXBlKCk7XHJcblxyXG4gIC8vIG5vIG92ZXJsYXBcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE5PTkUgPSBuZXcgRWxsaXB0aWNhbEFyY092ZXJsYXBUeXBlKCk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIEVsbGlwdGljYWxBcmNPdmVybGFwVHlwZSApO1xyXG59XHJcblxyXG5raXRlLnJlZ2lzdGVyKCAnRWxsaXB0aWNhbEFyYycsIEVsbGlwdGljYWxBcmMgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFFaEQsT0FBT0MsVUFBVSxNQUFNLCtCQUErQjtBQUN0RCxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsV0FBVyxNQUFNLHNDQUFzQztBQUM5RCxPQUFPQyxnQkFBZ0IsTUFBTSwyQ0FBMkM7QUFDeEUsU0FBU0MsR0FBRyxFQUFFQyxrQkFBa0IsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQVdDLGVBQWUsRUFBRUMsT0FBTyxFQUFFQyxtQkFBbUIsRUFBRUMsU0FBUyxRQUFRLGVBQWU7O0FBRXRJO0FBQ0EsTUFBTUMsU0FBUyxHQUFHWixLQUFLLENBQUNZLFNBQVM7QUFjakMsZUFBZSxN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