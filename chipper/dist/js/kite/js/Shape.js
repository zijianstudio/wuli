// Copyright 2013-2023, University of Colorado Boulder

/**
 * Shape handling
 *
 * Shapes are internally made up of Subpaths, which contain a series of segments, and are optionally closed.
 * Familiarity with how Canvas handles subpaths is helpful for understanding this code.
 *
 * Canvas spec: http://www.w3.org/TR/2dcontext/
 * SVG spec: http://www.w3.org/TR/SVG/expanded-toc.html
 *           http://www.w3.org/TR/SVG/paths.html#PathData (for paths)
 * Notes for elliptical arcs: http://www.w3.org/TR/SVG/implnote.html#PathElementImplementationNotes
 * Notes for painting strokes: https://svgwg.org/svg2-draft/painting.html
 *
 * TODO: add nonzero / evenodd support when browsers support it
 * TODO: docs
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TinyEmitter from '../../axon/js/TinyEmitter.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Ray2 from '../../dot/js/Ray2.js';
import Vector2 from '../../dot/js/Vector2.js';
import merge from '../../phet-core/js/merge.js';
import { Arc, Cubic, EllipticalArc, Graph, kite, Line, LineStyles, Quadratic, Subpath, svgNumber, svgPath, Segment } from './imports.js';

//  (We can't get joist's random reference here)
const randomSource = Math.random;

/**
 * Convenience function that returns a Vector2
 * used throughout this file as an abbreviation for a displacement, a position or a point.
 * @private
 * @param {number} x
 * @param {number} y
 * @returns {Vector2}
 */
function v(x, y) {
  return new Vector2(x, y);
}

/**
 * The tension parameter controls how smoothly the curve turns through its control points. For a Catmull-Rom curve,
 * the tension is zero. The tension should range from -1 to 1.
 * @private
 * @param {Vector2} beforeVector
 * @param {Vector2} currentVector
 * @param {Vector2} afterVector
 * @param {number} tension - the tension should range from -1 to 1.
 * @returns {Vector2}
 */
function weightedSplineVector(beforeVector, currentVector, afterVector, tension) {
  return afterVector.copy().subtract(beforeVector).multiplyScalar((1 - tension) / 6).add(currentVector);
}

// a normalized vector for non-zero winding checks
// var weirdDir = v( Math.PI, 22 / 7 );

class Shape {
  /**
   * @public
   *
   * All arguments optional, they are for the copy() method. if used, ensure that 'bounds' is consistent with 'subpaths'
   *
   * @param {Array.<Subpath>|string} [subpaths]
   * @param {Bounds2} [bounds]
   */
  constructor(subpaths, bounds) {
    // @public {Array.<Subpath>} Lower-level piecewise mathematical description using segments, also
    // individually immutable
    this.subpaths = [];

    // @private {Bounds2} If non-null, computed bounds for all pieces added so far. Lazily computed with
    // getBounds/bounds ES5 getter
    this._bounds = bounds ? bounds.copy() : null; // {Bounds2 | null}

    // @public {TinyEmitter}
    this.invalidatedEmitter = new TinyEmitter();
    this.resetControlPoints();

    // @private {function}
    this._invalidateListener = this.invalidate.bind(this);

    // @private {boolean} - So we can invalidate all of the points without firing invalidation tons of times
    this._invalidatingPoints = false;

    // @private {boolean} - When set by makeImmutable(), it indicates this Shape won't be changed from now on, and
    //                      attempts to change it may result in errors.
    this._immutable = false;

    // Add in subpaths from the constructor (if applicable)
    if (typeof subpaths === 'object') {
      // assume it's an array
      for (let i = 0; i < subpaths.length; i++) {
        this.addSubpath(subpaths[i]);
      }
    }
    if (subpaths && typeof subpaths !== 'object') {
      assert && assert(typeof subpaths === 'string', 'if subpaths is not an object, it must be a string');
      // parse the SVG path
      _.each(svgPath.parse(subpaths), item => {
        assert && assert(Shape.prototype[item.cmd] !== undefined, `method ${item.cmd} from parsed SVG does not exist`);
        // eslint-disable-next-line prefer-spread
        this[item.cmd].apply(this, item.args);
      });
    }

    // defines _bounds if not already defined (among other things)
    this.invalidate();
  }

  /**
   * Resets the control points
   * @private
   *
   * for tracking the last quadratic/cubic control point for smooth* functions
   * see https://github.com/phetsims/kite/issues/38
   */
  resetControlPoints() {
    this.lastQuadraticControlPoint = null;
    this.lastCubicControlPoint = null;
  }

  /**
   * Sets the quadratic control point
   * @private
   *
   * @param {Vector2} point
   */
  setQuadraticControlPoint(point) {
    this.lastQuadraticControlPoint = point;
    this.lastCubicControlPoint = null;
  }

  /**
   * Sets the cubic control point
   * @private
   *
   * @param {Vector2} point
   */
  setCubicControlPoint(point) {
    this.lastQuadraticControlPoint = null;
    this.lastCubicControlPoint = point;
  }

  /**
   * Moves to a point given by the coordinates x and y
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @returns {Shape}
   */
  moveTo(x, y) {
    assert && assert(typeof x === 'number' && isFinite(x), `x must be a finite number: ${x}`);
    assert && assert(typeof y === 'number' && isFinite(y), `y must be a finite number: ${y}`);
    return this.moveToPoint(v(x, y));
  }

  /**
   * Moves a relative displacement (x,y) from last point
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @returns {Shape}
   */
  moveToRelative(x, y) {
    assert && assert(typeof x === 'number' && isFinite(x), `x must be a finite number: ${x}`);
    assert && assert(typeof y === 'number' && isFinite(y), `y must be a finite number: ${y}`);
    return this.moveToPointRelative(v(x, y));
  }

  /**
   * Moves a relative displacement (point) from last point
   * @public
   *
   * @param {Vector2} point - a displacement
   * @returns {Shape}
   */
  moveToPointRelative(point) {
    return this.moveToPoint(this.getRelativePoint().plus(point));
  }

  /**
   * Adds to this shape a subpath that moves (no joint) it to a point
   * @public
   *
   * @param {Vector2} point
   * @returns {Shape}
   */
  moveToPoint(point) {
    this.addSubpath(new Subpath().addPoint(point));
    this.resetControlPoints();
    return this; // for chaining
  }

  /**
   * Adds to this shape a straight line from last point to the coordinate (x,y)
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @returns {Shape}
   */
  lineTo(x, y) {
    assert && assert(typeof x === 'number' && isFinite(x), `x must be a finite number: ${x}`);
    assert && assert(typeof y === 'number' && isFinite(y), `y must be a finite number: ${y}`);
    return this.lineToPoint(v(x, y));
  }

  /**
   * Adds to this shape a straight line displaced by a relative amount x, and y from last point
   * @public
   *
   * @param {number} x - horizontal displacement
   * @param {number} y - vertical displacement
   * @returns {Shape}
   */
  lineToRelative(x, y) {
    assert && assert(typeof x === 'number' && isFinite(x), `x must be a finite number: ${x}`);
    assert && assert(typeof y === 'number' && isFinite(y), `y must be a finite number: ${y}`);
    return this.lineToPointRelative(v(x, y));
  }

  /**
   * Adds to this shape a straight line displaced by a relative displacement (point)
   * @public
   *
   * @param {Vector2} point - a displacement
   * @returns {Shape}
   */
  lineToPointRelative(point) {
    return this.lineToPoint(this.getRelativePoint().plus(point));
  }

  /**
   * Adds to this shape a straight line from this lastPoint to point
   * @public
   *
   * @param {Vector2} point
   * @returns {Shape}
   */
  lineToPoint(point) {
    // see http://www.w3.org/TR/2dcontext/#dom-context-2d-lineto
    if (this.hasSubpaths()) {
      const start = this.getLastSubpath().getLastPoint();
      const end = point;
      const line = new Line(start, end);
      this.getLastSubpath().addPoint(end);
      this.addSegmentAndBounds(line);
    } else {
      this.ensure(point);
    }
    this.resetControlPoints();
    return this; // for chaining
  }

  /**
   * Adds a horizontal line (x represents the x-coordinate of the end point)
   * @public
   *
   * @param {number} x
   * @returns {Shape}
   */
  horizontalLineTo(x) {
    return this.lineTo(x, this.getRelativePoint().y);
  }

  /**
   * Adds a horizontal line (x represent a horizontal displacement)
   * @public
   *
   * @param {number} x
   * @returns {Shape}
   */
  horizontalLineToRelative(x) {
    return this.lineToRelative(x, 0);
  }

  /**
   * Adds a vertical line (y represents the y-coordinate of the end point)
   * @public
   *
   * @param {number} y
   * @returns {Shape}
   */
  verticalLineTo(y) {
    return this.lineTo(this.getRelativePoint().x, y);
  }

  /**
   * Adds a vertical line (y represents a vertical displacement)
   * @public
   *
   * @param {number} y
   * @returns {Shape}
   */
  verticalLineToRelative(y) {
    return this.lineToRelative(0, y);
  }

  /**
   * Zig-zags between the current point and the specified point
   * @public
   *
   * @param {number} endX - the end of the shape
   * @param {number} endY - the end of the shape
   * @param {number} amplitude - the vertical amplitude of the zig zag wave
   * @param {number} numberZigZags - the number of oscillations
   * @param {boolean} symmetrical - flag for drawing a symmetrical zig zag
   */
  zigZagTo(endX, endY, amplitude, numberZigZags, symmetrical) {
    return this.zigZagToPoint(new Vector2(endX, endY), amplitude, numberZigZags, symmetrical);
  }

  /**
   * Zig-zags between the current point and the specified point.
   * Implementation moved from circuit-construction-kit-common on April 22, 2019.
   * @public
   *
   * @param {Vector2} endPoint - the end of the shape
   * @param {number} amplitude - the vertical amplitude of the zig zag wave, signed to choose initial direction
   * @param {number} numberZigZags - the number of complete oscillations
   * @param {boolean} symmetrical - flag for drawing a symmetrical zig zag
   */
  zigZagToPoint(endPoint, amplitude, numberZigZags, symmetrical) {
    assert && assert(Number.isInteger(numberZigZags), `numberZigZags must be an integer: ${numberZigZags}`);
    this.ensure(endPoint);
    const startPoint = this.getLastPoint();
    const delta = endPoint.minus(startPoint);
    const directionUnitVector = delta.normalized();
    const amplitudeNormalVector = directionUnitVector.perpendicular.times(amplitude);
    let wavelength;
    if (symmetrical) {
      // the wavelength is shorter to add half a wave.
      wavelength = delta.magnitude / (numberZigZags + 0.5);
    } else {
      wavelength = delta.magnitude / numberZigZags;
    }
    for (let i = 0; i < numberZigZags; i++) {
      const waveOrigin = directionUnitVector.times(i * wavelength).plus(startPoint);
      const topPoint = waveOrigin.plus(directionUnitVector.times(wavelength / 4)).plus(amplitudeNormalVector);
      const bottomPoint = waveOrigin.plus(directionUnitVector.times(3 * wavelength / 4)).minus(amplitudeNormalVector);
      this.lineToPoint(topPoint);
      this.lineToPoint(bottomPoint);
    }

    // add last half of the wavelength
    if (symmetrical) {
      const waveOrigin = directionUnitVector.times(numberZigZags * wavelength).plus(startPoint);
      const topPoint = waveOrigin.plus(directionUnitVector.times(wavelength / 4)).plus(amplitudeNormalVector);
      this.lineToPoint(topPoint);
    }
    return this.lineToPoint(endPoint);
  }

  /**
   * Adds a quadratic curve to this shape
   * @public
   *
   * The curve is guaranteed to pass through the coordinate (x,y) but does not pass through the control point
   *
   * @param {number} cpx - control point horizontal coordinate
   * @param {number} cpy - control point vertical coordinate
   * @param {number} x
   * @param {number} y
   * @returns {Shape}
   */
  quadraticCurveTo(cpx, cpy, x, y) {
    assert && assert(typeof cpx === 'number' && isFinite(cpx), `cpx must be a finite number: ${cpx}`);
    assert && assert(typeof cpy === 'number' && isFinite(cpy), `cpy must be a finite number: ${cpy}`);
    assert && assert(typeof x === 'number' && isFinite(x), `x must be a finite number: ${x}`);
    assert && assert(typeof y === 'number' && isFinite(y), `y must be a finite number: ${y}`);
    return this.quadraticCurveToPoint(v(cpx, cpy), v(x, y));
  }

  /**
   * Adds a quadratic curve to this shape. The control and final points are specified as displacment from the last
   * point in this shape
   * @public
   *
   * @param {number} cpx - control point horizontal coordinate
   * @param {number} cpy - control point vertical coordinate
   * @param {number} x - final x position of the quadratic curve
   * @param {number} y - final y position of the quadratic curve
   * @returns {Shape}
   */
  quadraticCurveToRelative(cpx, cpy, x, y) {
    assert && assert(typeof cpx === 'number' && isFinite(cpx), `cpx must be a finite number: ${cpx}`);
    assert && assert(typeof cpy === 'number' && isFinite(cpy), `cpy must be a finite number: ${cpy}`);
    assert && assert(typeof x === 'number' && isFinite(x), `x must be a finite number: ${x}`);
    assert && assert(typeof y === 'number' && isFinite(y), `y must be a finite number: ${y}`);
    return this.quadraticCurveToPointRelative(v(cpx, cpy), v(x, y));
  }

  /**
   * Adds a quadratic curve to this shape. The control and final points are specified as displacement from the
   * last point in this shape
   * @public
   *
   * @param {Vector2} controlPoint
   * @param {Vector2} point - the quadratic curve passes through this point
   * @returns {Shape}
   */
  quadraticCurveToPointRelative(controlPoint, point) {
    const relativePoint = this.getRelativePoint();
    return this.quadraticCurveToPoint(relativePoint.plus(controlPoint), relativePoint.plus(point));
  }

  /**
   * Adds a quadratic curve to this shape. The quadratic curves passes through the x and y coordinate.
   * The shape should join smoothly with the previous subpaths
   * @public
   *
   * TODO: consider a rename to put 'smooth' farther back?
   *
   * @param {number} x - final x position of the quadratic curve
   * @param {number} y - final y position of the quadratic curve
   * @returns {Shape}
   */
  smoothQuadraticCurveTo(x, y) {
    assert && assert(typeof x === 'number' && isFinite(x), `x must be a finite number: ${x}`);
    assert && assert(typeof y === 'number' && isFinite(y), `y must be a finite number: ${y}`);
    return this.quadraticCurveToPoint(this.getSmoothQuadraticControlPoint(), v(x, y));
  }

  /**
   * Adds a quadratic curve to this shape. The quadratic curves passes through the x and y coordinate.
   * The shape should join smoothly with the previous subpaths
   * @public
   *
   * @param {number} x - final x position of the quadratic curve
   * @param {number} y - final y position of the quadratic curve
   * @returns {Shape}
   */
  smoothQuadraticCurveToRelative(x, y) {
    assert && assert(typeof x === 'number' && isFinite(x), `x must be a finite number: ${x}`);
    assert && assert(typeof y === 'number' && isFinite(y), `y must be a finite number: ${y}`);
    return this.quadraticCurveToPoint(this.getSmoothQuadraticControlPoint(), v(x, y).plus(this.getRelativePoint()));
  }

  /**
   * Adds a quadratic bezier curve to this shape.
   * @public
   *
   * @param {Vector2} controlPoint
   * @param {Vector2} point - the quadratic curve passes through this point
   * @returns {Shape}
   */
  quadraticCurveToPoint(controlPoint, point) {
    // see http://www.w3.org/TR/2dcontext/#dom-context-2d-quadraticcurveto
    this.ensure(controlPoint);
    const start = this.getLastSubpath().getLastPoint();
    const quadratic = new Quadratic(start, controlPoint, point);
    this.getLastSubpath().addPoint(point);
    const nondegenerateSegments = quadratic.getNondegenerateSegments();
    _.each(nondegenerateSegments, segment => {
      // TODO: optimization
      this.addSegmentAndBounds(segment);
    });
    this.setQuadraticControlPoint(controlPoint);
    return this; // for chaining
  }

  /**
   * Adds a cubic bezier curve to this shape.
   * @public
   *
   * @param {number} cp1x - control point 1,  horizontal coordinate
   * @param {number} cp1y - control point 1,  vertical coordinate
   * @param {number} cp2x - control point 2,  horizontal coordinate
   * @param {number} cp2y - control point 2,  vertical coordinate
   * @param {number} x - final x position of the cubic curve
   * @param {number} y - final y position of the cubic curve
   * @returns {Shape}
   */
  cubicCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    assert && assert(typeof cp1x === 'number' && isFinite(cp1x), `cp1x must be a finite number: ${cp1x}`);
    assert && assert(typeof cp1y === 'number' && isFinite(cp1y), `cp1y must be a finite number: ${cp1y}`);
    assert && assert(typeof cp2x === 'number' && isFinite(cp2x), `cp2x must be a finite number: ${cp2x}`);
    assert && assert(typeof cp2y === 'number' && isFinite(cp2y), `cp2y must be a finite number: ${cp2y}`);
    assert && assert(typeof x === 'number' && isFinite(x), `x must be a finite number: ${x}`);
    assert && assert(typeof y === 'number' && isFinite(y), `y must be a finite number: ${y}`);
    return this.cubicCurveToPoint(v(cp1x, cp1y), v(cp2x, cp2y), v(x, y));
  }

  /**
   * @public
   *
   * @param {number} cp1x - control point 1,  horizontal displacement
   * @param {number} cp1y - control point 1,  vertical displacement
   * @param {number} cp2x - control point 2,  horizontal displacement
   * @param {number} cp2y - control point 2,  vertical displacement
   * @param {number} x - final horizontal displacement
   * @param {number} y - final vertical displacment
   * @returns {Shape}
   */
  cubicCurveToRelative(cp1x, cp1y, cp2x, cp2y, x, y) {
    assert && assert(typeof cp1x === 'number' && isFinite(cp1x), `cp1x must be a finite number: ${cp1x}`);
    assert && assert(typeof cp1y === 'number' && isFinite(cp1y), `cp1y must be a finite number: ${cp1y}`);
    assert && assert(typeof cp2x === 'number' && isFinite(cp2x), `cp2x must be a finite number: ${cp2x}`);
    assert && assert(typeof cp2y === 'number' && isFinite(cp2y), `cp2y must be a finite number: ${cp2y}`);
    assert && assert(typeof x === 'number' && isFinite(x), `x must be a finite number: ${x}`);
    assert && assert(typeof y === 'number' && isFinite(y), `y must be a finite number: ${y}`);
    return this.cubicCurveToPointRelative(v(cp1x, cp1y), v(cp2x, cp2y), v(x, y));
  }

  /**
   * @public
   *
   * @param {Vector2} control1 - control displacement  1
   * @param {Vector2} control2 - control displacement 2
   * @param {Vector2} point - final displacement
   * @returns {Shape}
   */
  cubicCurveToPointRelative(control1, control2, point) {
    const relativePoint = this.getRelativePoint();
    return this.cubicCurveToPoint(relativePoint.plus(control1), relativePoint.plus(control2), relativePoint.plus(point));
  }

  /**
   * @public
   *
   * @param {number} cp2x - control point 2,  horizontal coordinate
   * @param {number} cp2y - control point 2,  vertical coordinate
   * @param {number} x
   * @param {number} y
   * @returns {Shape}
   */
  smoothCubicCurveTo(cp2x, cp2y, x, y) {
    assert && assert(typeof cp2x === 'number' && isFinite(cp2x), `cp2x must be a finite number: ${cp2x}`);
    assert && assert(typeof cp2y === 'number' && isFinite(cp2y), `cp2y must be a finite number: ${cp2y}`);
    assert && assert(typeof x === 'number' && isFinite(x), `x must be a finite number: ${x}`);
    assert && assert(typeof y === 'number' && isFinite(y), `y must be a finite number: ${y}`);
    return this.cubicCurveToPoint(this.getSmoothCubicControlPoint(), v(cp2x, cp2y), v(x, y));
  }

  /**
   * @public
   *
   * @param {number} cp2x - control point 2,  horizontal coordinate
   * @param {number} cp2y - control point 2,  vertical coordinate
   * @param {number} x
   * @param {number} y
   * @returns {Shape}
   */
  smoothCubicCurveToRelative(cp2x, cp2y, x, y) {
    assert && assert(typeof cp2x === 'number' && isFinite(cp2x), `cp2x must be a finite number: ${cp2x}`);
    assert && assert(typeof cp2y === 'number' && isFinite(cp2y), `cp2y must be a finite number: ${cp2y}`);
    assert && assert(typeof x === 'number' && isFinite(x), `x must be a finite number: ${x}`);
    assert && assert(typeof y === 'number' && isFinite(y), `y must be a finite number: ${y}`);
    return this.cubicCurveToPoint(this.getSmoothCubicControlPoint(), v(cp2x, cp2y).plus(this.getRelativePoint()), v(x, y).plus(this.getRelativePoint()));
  }

  /**
   * @public
   *
   * @param {Vector2} control1
   * @param {Vector2} control2
   * @param {Vector2} point
   * @returns {Shape}
   */
  cubicCurveToPoint(control1, control2, point) {
    // see http://www.w3.org/TR/2dcontext/#dom-context-2d-quadraticcurveto
    this.ensure(control1);
    const start = this.getLastSubpath().getLastPoint();
    const cubic = new Cubic(start, control1, control2, point);
    const nondegenerateSegments = cubic.getNondegenerateSegments();
    _.each(nondegenerateSegments, segment => {
      this.addSegmentAndBounds(segment);
    });
    this.getLastSubpath().addPoint(point);
    this.setCubicControlPoint(control2);
    return this; // for chaining
  }

  /**
   * @public
   *
   * @param {number} centerX - horizontal coordinate of the center of the arc
   * @param {number} centerY - Center of the arc
   * @param {number} radius - How far from the center the arc will be
   * @param {number} startAngle - Angle (radians) of the start of the arc
   * @param {number} endAngle - Angle (radians) of the end of the arc
   * @param {boolean} [anticlockwise] - Decides which direction the arc takes around the center
   * @returns {Shape}
   */
  arc(centerX, centerY, radius, startAngle, endAngle, anticlockwise) {
    assert && assert(typeof centerX === 'number' && isFinite(centerX), `centerX must be a finite number: ${centerX}`);
    assert && assert(typeof centerY === 'number' && isFinite(centerY), `centerY must be a finite number: ${centerY}`);
    return this.arcPoint(v(centerX, centerY), radius, startAngle, endAngle, anticlockwise);
  }

  /**
   * @public
   *
   * @param {Vector2} center - Center of the arc (every point on the arc is equally far from the center)
   * @param {number} radius - How far from the center the arc will be
   * @param {number} startAngle - Angle (radians) of the start of the arc
   * @param {number} endAngle - Angle (radians) of the end of the arc
   * @param {boolean} [anticlockwise] - Decides which direction the arc takes around the center
   * @returns {Shape}
   */
  arcPoint(center, radius, startAngle, endAngle, anticlockwise) {
    // see http://www.w3.org/TR/2dcontext/#dom-context-2d-arc
    if (anticlockwise === undefined) {
      anticlockwise = false;
    }
    const arc = new Arc(center, radius, startAngle, endAngle, anticlockwise);

    // we are assuming that the normal conditions were already met (or exceptioned out) so that these actually work with canvas
    const startPoint = arc.getStart();
    const endPoint = arc.getEnd();

    // if there is already a point on the subpath, and it is different than our starting point, draw a line between them
    if (this.hasSubpaths() && this.getLastSubpath().getLength() > 0 && !startPoint.equals(this.getLastSubpath().getLastPoint(), 0)) {
      this.addSegmentAndBounds(new Line(this.getLastSubpath().getLastPoint(), startPoint));
    }
    if (!this.hasSubpaths()) {
      this.addSubpath(new Subpath());
    }

    // technically the Canvas spec says to add the start point, so we do this even though it is probably completely unnecessary (there is no conditional)
    this.getLastSubpath().addPoint(startPoint);
    this.getLastSubpath().addPoint(endPoint);
    this.addSegmentAndBounds(arc);
    this.resetControlPoints();
    return this; // for chaining
  }

  /**
   * Creates an elliptical arc
   * @public
   *
   * @param {number} centerX - horizontal coordinate of the center of the arc
   * @param {number} centerY -  vertical coordinate of the center of the arc
   * @param {number} radiusX - semi axis
   * @param {number} radiusY - semi axis
   * @param {number} rotation - rotation of the elliptical arc with respect to the positive x axis.
   * @param {number} startAngle
   * @param {number} endAngle
   * @param {boolean} [anticlockwise]
   * @returns {Shape}
   */
  ellipticalArc(centerX, centerY, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
    assert && assert(typeof centerX === 'number' && isFinite(centerX), `centerX must be a finite number: ${centerX}`);
    assert && assert(typeof centerY === 'number' && isFinite(centerY), `centerY must be a finite number: ${centerY}`);
    return this.ellipticalArcPoint(v(centerX, centerY), radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
  }

  /**
   * Creates an elliptic arc
   * @public
   *
   * @param {Vector2} center
   * @param {number} radiusX
   * @param {number} radiusY
   * @param {number} rotation - rotation of the arc with respect to the positive x axis.
   * @param {number} startAngle -
   * @param {number} endAngle
   * @param {boolean} [anticlockwise]
   * @returns {Shape}
   */
  ellipticalArcPoint(center, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
    // see http://www.w3.org/TR/2dcontext/#dom-context-2d-arc
    if (anticlockwise === undefined) {
      anticlockwise = false;
    }
    const ellipticalArc = new EllipticalArc(center, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);

    // we are assuming that the normal conditions were already met (or exceptioned out) so that these actually work with canvas
    const startPoint = ellipticalArc.start;
    const endPoint = ellipticalArc.end;

    // if there is already a point on the subpath, and it is different than our starting point, draw a line between them
    if (this.hasSubpaths() && this.getLastSubpath().getLength() > 0 && !startPoint.equals(this.getLastSubpath().getLastPoint(), 0)) {
      this.addSegmentAndBounds(new Line(this.getLastSubpath().getLastPoint(), startPoint));
    }
    if (!this.hasSubpaths()) {
      this.addSubpath(new Subpath());
    }

    // technically the Canvas spec says to add the start point, so we do this even though it is probably completely unnecessary (there is no conditional)
    this.getLastSubpath().addPoint(startPoint);
    this.getLastSubpath().addPoint(endPoint);
    this.addSegmentAndBounds(ellipticalArc);
    this.resetControlPoints();
    return this; // for chaining
  }

  /**
   * Adds a subpath that joins the last point of this shape to the first point to form a closed shape
   * @public
   *
   * @returns {Shape}
   */
  close() {
    if (this.hasSubpaths()) {
      const previousPath = this.getLastSubpath();
      const nextPath = new Subpath();
      previousPath.close();
      this.addSubpath(nextPath);
      nextPath.addPoint(previousPath.getFirstPoint());
    }
    this.resetControlPoints();
    return this; // for chaining
  }

  /**
   * Moves to the next subpath, but without adding any points to it (like a moveTo would do).
   * @public
   *
   * This is particularly helpful for cases where you don't want to have to compute the explicit starting point of
   * the next subpath. For instance, if you want three disconnected circles:
   * - shape.circle( 50, 50, 20 ).newSubpath().circle( 100, 100, 20 ).newSubpath().circle( 150, 50, 20 )
   *
   * See https://github.com/phetsims/kite/issues/72 for more info.
   *
   * @returns {Shape}
   */
  newSubpath() {
    this.addSubpath(new Subpath());
    this.resetControlPoints();
    return this; // for chaining
  }

  /**
   * Makes this Shape immutable, so that attempts to further change the Shape will fail. This allows clients to avoid
   * adding change listeners to this Shape.
   * @public
   *
   * @returns {Shape} - Self, for chaining
   */
  makeImmutable() {
    this._immutable = true;
    this.notifyInvalidationListeners();
    return this; // for chaining
  }

  /**
   * Returns whether this Shape is immutable (see makeImmutable for details).
   * @public
   *
   * @returns {boolean}
   */
  isImmutable() {
    return this._immutable;
  }

  /**
   * Matches SVG's elliptical arc from http://www.w3.org/TR/SVG/paths.html
   * @public
   *
   * WARNING: rotation (for now) is in DEGREES. This will probably change in the future.
   *
   * @param {number} radiusX - Semi-major axis size
   * @param {number} radiusY - Semi-minor axis size
   * @param {number} rotation - Rotation of the ellipse (its semi-major axis)
   * @param {boolean} largeArc - Whether the arc will go the longest route around the ellipse.
   * @param {boolean} sweep - Whether the arc made goes from start to end "clockwise" (opposite of anticlockwise flag)
   * @param {number} x - End point X position
   * @param {number} y - End point Y position
   * @returns {Shape} - this Shape for chaining
   */
  ellipticalArcToRelative(radiusX, radiusY, rotation, largeArc, sweep, x, y) {
    const relativePoint = this.getRelativePoint();
    return this.ellipticalArcTo(radiusX, radiusY, rotation, largeArc, sweep, x + relativePoint.x, y + relativePoint.y);
  }

  /**
   * Matches SVG's elliptical arc from http://www.w3.org/TR/SVG/paths.html
   * @public
   *
   * WARNING: rotation (for now) is in DEGREES. This will probably change in the future.
   *
   * @param {number} radiusX - Semi-major axis size
   * @param {number} radiusY - Semi-minor axis size
   * @param {number} rotation - Rotation of the ellipse (its semi-major axis)
   * @param {boolean} largeArc - Whether the arc will go the longest route around the ellipse.
   * @param {boolean} sweep - Whether the arc made goes from start to end "clockwise" (opposite of anticlockwise flag)
   * @param {number} x - End point X position
   * @param {number} y - End point Y position
   * @returns {Shape} - this Shape for chaining
   */
  ellipticalArcTo(radiusX, radiusY, rotation, largeArc, sweep, x, y) {
    // See "F.6.5 Conversion from endpoint to center parameterization"
    // in https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes

    const endPoint = new Vector2(x, y);
    this.ensure(endPoint);
    const startPoint = this.getLastSubpath().getLastPoint();
    this.getLastSubpath().addPoint(endPoint);

    // Absolute value applied to radii (per SVG spec)
    if (radiusX < 0) {
      radiusX *= -1.0;
    }
    if (radiusY < 0) {
      radiusY *= -1.0;
    }
    let rxs = radiusX * radiusX;
    let rys = radiusY * radiusY;
    const prime = startPoint.minus(endPoint).dividedScalar(2).rotated(-rotation);
    const pxs = prime.x * prime.x;
    const pys = prime.y * prime.y;
    let centerPrime = new Vector2(radiusX * prime.y / radiusY, -radiusY * prime.x / radiusX);

    // If the radii are not large enough to accomodate the start/end point, apply F.6.6 correction
    const size = pxs / rxs + pys / rys;
    if (size > 1) {
      radiusX *= Math.sqrt(size);
      radiusY *= Math.sqrt(size);

      // redo some computations from above
      rxs = radiusX * radiusX;
      rys = radiusY * radiusY;
      centerPrime = new Vector2(radiusX * prime.y / radiusY, -radiusY * prime.x / radiusX);
    }

    // Naming matches https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes for
    // F.6.5 Conversion from endpoint to center parameterization

    centerPrime.multiplyScalar(Math.sqrt(Math.max(0, (rxs * rys - rxs * pys - rys * pxs) / (rxs * pys + rys * pxs))));
    if (largeArc === sweep) {
      // From spec: where the + sign is chosen if fA ≠ fS, and the − sign is chosen if fA = fS.
      centerPrime.multiplyScalar(-1);
    }
    const center = startPoint.blend(endPoint, 0.5).plus(centerPrime.rotated(rotation));
    function signedAngle(u, v) {
      // From spec: where the ± sign appearing here is the sign of ux vy − uy vx.
      return (u.x * v.y - u.y * v.x > 0 ? 1 : -1) * u.angleBetween(v);
    }
    const victor = new Vector2((prime.x - centerPrime.x) / radiusX, (prime.y - centerPrime.y) / radiusY);
    const ross = new Vector2((-prime.x - centerPrime.x) / radiusX, (-prime.y - centerPrime.y) / radiusY);
    const startAngle = signedAngle(Vector2.X_UNIT, victor);
    let deltaAngle = signedAngle(victor, ross) % (Math.PI * 2);

    // From spec:
    // > In other words, if fS = 0 and the right side of (F.6.5.6) is greater than 0, then subtract 360°, whereas if
    // > fS = 1 and the right side of (F.6.5.6) is less than 0, then add 360°. In all other cases leave it as is.
    if (!sweep && deltaAngle > 0) {
      deltaAngle -= Math.PI * 2;
    }
    if (sweep && deltaAngle < 0) {
      deltaAngle += Math.PI * 2;
    }

    // Standard handling of degenerate segments (particularly, converting elliptical arcs to circular arcs)
    const ellipticalArc = new EllipticalArc(center, radiusX, radiusY, rotation, startAngle, startAngle + deltaAngle, !sweep);
    const nondegenerateSegments = ellipticalArc.getNondegenerateSegments();
    _.each(nondegenerateSegments, segment => {
      this.addSegmentAndBounds(segment);
    });
    return this;
  }

  /**
   * Draws a circle using the arc() call with the following parameters:
   * circle( center, radius ) // center is a Vector2
   * circle( centerX, centerY, radius )
   * @public
   *
   * @param {Vector2|number} centerX
   * @param {number} centerY
   * @param {number} [radius]
   * @returns {Shape} - this shape for chaining
   */
  circle(centerX, centerY, radius) {
    if (typeof centerX === 'object') {
      // circle( center, radius )
      const center = centerX;
      radius = centerY;
      return this.arcPoint(center, radius, 0, Math.PI * 2, false).close();
    } else {
      assert && assert(typeof centerX === 'number' && isFinite(centerX), `centerX must be a finite number: ${centerX}`);
      assert && assert(typeof centerY === 'number' && isFinite(centerY), `centerY must be a finite number: ${centerY}`);

      // circle( centerX, centerY, radius )
      return this.arcPoint(v(centerX, centerY), radius, 0, Math.PI * 2, false).close();
    }
  }

  /**
   * Draws an ellipse using the ellipticalArc() call with the following parameters:
   * ellipse( center, radiusX, radiusY, rotation ) // center is a Vector2
   * ellipse( centerX, centerY, radiusX, radiusY, rotation )
   * @public
   *
   * The rotation is about the centerX, centerY.
   *
   * @param {number|Vector2} centerX
   * @param {number} [centerY]
   * @param {number} radiusX
   * @param {number} radiusY
   * @param {number} rotation
   * @returns {Shape}
   */
  ellipse(centerX, centerY, radiusX, radiusY, rotation) {
    // TODO: separate into ellipse() and ellipsePoint()?
    // TODO: Ellipse/EllipticalArc has a mess of parameters. Consider parameter object, or double-check parameter handling
    if (typeof centerX === 'object') {
      // ellipse( center, radiusX, radiusY, rotation )
      const center = centerX;
      rotation = radiusY;
      radiusY = radiusX;
      radiusX = centerY;
      return this.ellipticalArcPoint(center, radiusX, radiusY, rotation || 0, 0, Math.PI * 2, false).close();
    } else {
      assert && assert(typeof centerX === 'number' && isFinite(centerX), `centerX must be a finite number: ${centerX}`);
      assert && assert(typeof centerY === 'number' && isFinite(centerY), `centerY must be a finite number: ${centerY}`);

      // ellipse( centerX, centerY, radiusX, radiusY, rotation )
      return this.ellipticalArcPoint(v(centerX, centerY), radiusX, radiusY, rotation || 0, 0, Math.PI * 2, false).close();
    }
  }

  /**
   * Creates a rectangle shape
   * @public
   *
   * @param {number} x - left position
   * @param {number} y - bottom position (in non inverted cartesian system)
   * @param {number} width
   * @param {number} height
   * @returns {Shape}
   */
  rect(x, y, width, height) {
    assert && assert(typeof x === 'number' && isFinite(x), `x must be a finite number: ${x}`);
    assert && assert(typeof y === 'number' && isFinite(y), `y must be a finite number: ${y}`);
    assert && assert(typeof width === 'number' && isFinite(width), `width must be a finite number: ${width}`);
    assert && assert(typeof height === 'number' && isFinite(height), `height must be a finite number: ${height}`);
    const subpath = new Subpath();
    this.addSubpath(subpath);
    subpath.addPoint(v(x, y));
    subpath.addPoint(v(x + width, y));
    subpath.addPoint(v(x + width, y + height));
    subpath.addPoint(v(x, y + height));
    this.addSegmentAndBounds(new Line(subpath.points[0], subpath.points[1]));
    this.addSegmentAndBounds(new Line(subpath.points[1], subpath.points[2]));
    this.addSegmentAndBounds(new Line(subpath.points[2], subpath.points[3]));
    subpath.close();
    this.addSubpath(new Subpath());
    this.getLastSubpath().addPoint(v(x, y));
    assert && assert(!isNaN(this.bounds.getX()));
    this.resetControlPoints();
    return this;
  }

  /**
   * Creates a round rectangle. All arguments are number.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} width - width of the rectangle
   * @param {number} height - height of the rectangle
   * @param {number} arcw - arc width
   * @param {number} arch - arc height
   * @returns {Shape}
   */
  roundRect(x, y, width, height, arcw, arch) {
    const lowX = x + arcw;
    const highX = x + width - arcw;
    const lowY = y + arch;
    const highY = y + height - arch;
    // if ( true ) {
    if (arcw === arch) {
      // we can use circular arcs, which have well defined stroked offsets
      this.arc(highX, lowY, arcw, -Math.PI / 2, 0, false).arc(highX, highY, arcw, 0, Math.PI / 2, false).arc(lowX, highY, arcw, Math.PI / 2, Math.PI, false).arc(lowX, lowY, arcw, Math.PI, Math.PI * 3 / 2, false).close();
    } else {
      // we have to resort to elliptical arcs
      this.ellipticalArc(highX, lowY, arcw, arch, 0, -Math.PI / 2, 0, false).ellipticalArc(highX, highY, arcw, arch, 0, 0, Math.PI / 2, false).ellipticalArc(lowX, highY, arcw, arch, 0, Math.PI / 2, Math.PI, false).ellipticalArc(lowX, lowY, arcw, arch, 0, Math.PI, Math.PI * 3 / 2, false).close();
    }
    return this;
  }

  /**
   * Creates a polygon from an array of vertices.
   * @public
   *
   * @param {Array.<Vector2>} vertices
   * @returns {Shape}
   */
  polygon(vertices) {
    const length = vertices.length;
    if (length > 0) {
      this.moveToPoint(vertices[0]);
      for (let i = 1; i < length; i++) {
        this.lineToPoint(vertices[i]);
      }
    }
    return this.close();
  }

  /**
   * This is a convenience function that allows to generate Cardinal splines
   * from a position array. Cardinal spline differs from Bezier curves in that all
   * defined points on a Cardinal spline are on the path itself.
   * @public
   *
   * It includes a tension parameter to allow the client to specify how tightly
   * the path interpolates between points. One can think of the tension as the tension in
   * a rubber band around pegs. however unlike a rubber band the tension can be negative.
   * the tension ranges from -1 to 1
   *
   * @param {Array.<Vector2>} positions
   * @param {Object} [options] - see documentation below
   * @returns {Shape}
   */
  cardinalSpline(positions, options) {
    options = merge({
      // the tension parameter controls how smoothly the curve turns through its
      // control points. For a Catmull-Rom curve the tension is zero.
      // the tension should range from  -1 to 1
      tension: 0,
      // is the resulting shape forming a closed line?
      isClosedLineSegments: false
    }, options);
    assert && assert(options.tension < 1 && options.tension > -1, ' the tension goes from -1 to 1 ');
    const pointNumber = positions.length; // number of points in the array

    // if the line is open, there is one less segments than point vectors
    const segmentNumber = options.isClosedLineSegments ? pointNumber : pointNumber - 1;
    for (let i = 0; i < segmentNumber; i++) {
      let cardinalPoints; // {Array.<Vector2>} cardinal points Array
      if (i === 0 && !options.isClosedLineSegments) {
        cardinalPoints = [positions[0], positions[0], positions[1], positions[2]];
      } else if (i === segmentNumber - 1 && !options.isClosedLineSegments) {
        cardinalPoints = [positions[i - 1], positions[i], positions[i + 1], positions[i + 1]];
      } else {
        cardinalPoints = [positions[(i - 1 + pointNumber) % pointNumber], positions[i % pointNumber], positions[(i + 1) % pointNumber], positions[(i + 2) % pointNumber]];
      }

      // Cardinal Spline to Cubic Bezier conversion matrix
      //    0                 1             0            0
      //  (-1+tension)/6      1      (1-tension)/6       0
      //    0            (1-tension)/6      1       (-1+tension)/6
      //    0                 0             1           0

      // {Array.<Vector2>} bezier points Array
      const bezierPoints = [cardinalPoints[1], weightedSplineVector(cardinalPoints[0], cardinalPoints[1], cardinalPoints[2], options.tension), weightedSplineVector(cardinalPoints[3], cardinalPoints[2], cardinalPoints[1], options.tension), cardinalPoints[2]];

      // special operations on the first point
      if (i === 0) {
        this.ensure(bezierPoints[0]);
        this.getLastSubpath().addPoint(bezierPoints[0]);
      }
      this.cubicCurveToPoint(bezierPoints[1], bezierPoints[2], bezierPoints[3]);
    }
    return this;
  }

  /**
   * Returns a copy of this shape
   * @public
   *
   * @returns {Shape}
   */
  copy() {
    // copy each individual subpath, so future modifications to either Shape doesn't affect the other one
    return new Shape(_.map(this.subpaths, subpath => subpath.copy()), this.bounds);
  }

  /**
   * Writes out this shape's path to a canvas 2d context. does NOT include the beginPath()!
   * @public
   *
   * @param {CanvasRenderingContext2D} context
   */
  writeToContext(context) {
    const len = this.subpaths.length;
    for (let i = 0; i < len; i++) {
      this.subpaths[i].writeToContext(context);
    }
  }

  /**
   * Returns something like "M150 0 L75 200 L225 200 Z" for a triangle
   * @public
   *
   * @returns {string}
   */
  getSVGPath() {
    let string = '';
    const len = this.subpaths.length;
    for (let i = 0; i < len; i++) {
      const subpath = this.subpaths[i];
      if (subpath.isDrawable()) {
        // since the commands after this are relative to the previous 'point', we need to specify a move to the initial point
        const startPoint = subpath.segments[0].start;
        string += `M ${svgNumber(startPoint.x)} ${svgNumber(startPoint.y)} `;
        for (let k = 0; k < subpath.segments.length; k++) {
          string += `${subpath.segments[k].getSVGPathFragment()} `;
        }
        if (subpath.isClosed()) {
          string += 'Z ';
        }
      }
    }
    return string;
  }

  /**
   * Returns a new Shape that is transformed by the associated matrix
   * @public
   *
   * @param {Matrix3} matrix
   * @returns {Shape}
   */
  transformed(matrix) {
    // TODO: allocation reduction
    const subpaths = _.map(this.subpaths, subpath => subpath.transformed(matrix));
    const bounds = _.reduce(subpaths, (bounds, subpath) => bounds.union(subpath.bounds), Bounds2.NOTHING);
    return new Shape(subpaths, bounds);
  }

  /**
   * Converts this subpath to a new shape made of many line segments (approximating the current shape) with the
   * transformation applied.
   * @public
   *
   * Provided options (see Segment.nonlinearTransformed)
   * - minLevels:                       how many levels to force subdivisions
   * - maxLevels:                       prevent subdivision past this level
   * - distanceEpsilon (optional null): controls level of subdivision by attempting to ensure a maximum (squared) deviation from the curve. smaller => more subdivision
   * - curveEpsilon (optional null):    controls level of subdivision by attempting to ensure a maximum curvature change between segments. smaller => more subdivision
   * -   OR includeCurvature:           {boolean}, whether to include a default curveEpsilon (usually off by default)
   * - pointMap (optional):             function( Vector2 ) : Vector2, represents a (usually non-linear) transformation applied
   * - methodName (optional):           if the method name is found on the segment, it is called with the expected signature function( options ) : Array[Segment]
   *                                    instead of using our brute-force logic. Supports optimizations for custom non-linear transforms (like polar coordinates)
   * @param {Object} [options]
   * @returns {Shape}
   */
  nonlinearTransformed(options) {
    // defaults
    options = merge({
      minLevels: 0,
      maxLevels: 7,
      distanceEpsilon: 0.16,
      // NOTE: this will change when the Shape is scaled, since this is a threshold for the square of a distance value
      curveEpsilon: options && options.includeCurvature ? 0.002 : null
    }, options);

    // TODO: allocation reduction
    const subpaths = _.map(this.subpaths, subpath => subpath.nonlinearTransformed(options));
    const bounds = _.reduce(subpaths, (bounds, subpath) => bounds.union(subpath.bounds), Bounds2.NOTHING);
    return new Shape(subpaths, bounds);
  }

  /**
   * Maps points by treating their x coordinate as polar angle, and y coordinate as polar magnitude.
   * See http://en.wikipedia.org/wiki/Polar_coordinate_system
   * @public
   *
   * Please see Shape.nonlinearTransformed for more documentation on adaptive discretization options (minLevels, maxLevels, distanceEpsilon, curveEpsilon)
   *
   * Example: A line from (0,10) to (pi,10) will be transformed to a circular arc from (10,0) to (-10,0) passing through (0,10).
   *
   * @param {Object} [options]
   * @returns {Shape}
   */
  polarToCartesian(options) {
    return this.nonlinearTransformed(merge({
      pointMap: p => Vector2.createPolar(p.y, p.x),
      methodName: 'polarToCartesian' // this will be called on Segments if it exists to do more optimized conversion (see Line)
    }, options));
  }

  /**
   * Converts each segment into lines, using an adaptive (midpoint distance subdivision) method.
   * @public
   *
   * NOTE: uses nonlinearTransformed method internally, but since we don't provide a pointMap or methodName, it won't create anything but line segments.
   * See nonlinearTransformed for documentation of options
   *
   * @param {Object} [options]
   * @returns {Shape}
   */
  toPiecewiseLinear(options) {
    assert && assert(!options.pointMap, 'No pointMap for toPiecewiseLinear allowed, since it could create non-linear segments');
    assert && assert(!options.methodName, 'No methodName for toPiecewiseLinear allowed, since it could create non-linear segments');
    return this.nonlinearTransformed(options);
  }

  /**
   * Is this point contained in this shape
   * @public
   *
   * @param {Vector2} point
   * @returns {boolean}
   */
  containsPoint(point) {
    // we pick a ray, and determine the winding number over that ray. if the number of segments crossing it CCW == number of segments crossing it CW, then the point is contained in the shape
    const ray = new Ray2(point, Vector2.X_UNIT);
    return this.windingIntersection(ray) !== 0;
  }

  /**
   * Hit-tests this shape with the ray. An array of all intersections of the ray with this shape will be returned.
   * For details, see the documentation in Segment.js
   * @public
   *
   * @param {Ray2} ray
   * @returns {Array.<Intersection>} - See Segment.js for details. For this function, intersections will be returned
   *                                   sorted by the distance from the ray's position.
   */
  intersection(ray) {
    let hits = [];
    const numSubpaths = this.subpaths.length;
    for (let i = 0; i < numSubpaths; i++) {
      const subpath = this.subpaths[i];
      if (subpath.isDrawable()) {
        const numSegments = subpath.segments.length;
        for (let k = 0; k < numSegments; k++) {
          const segment = subpath.segments[k];
          hits = hits.concat(segment.intersection(ray));
        }
        if (subpath.hasClosingSegment()) {
          hits = hits.concat(subpath.getClosingSegment().intersection(ray));
        }
      }
    }
    return _.sortBy(hits, hit => hit.distance);
  }

  /**
   * Returns whether the provided line segment would have some part on top or touching the interior (filled area) of
   * this shape.
   * @public
   *
   * This differs somewhat from an intersection of the line segment with the Shape's path, as we will return true
   * ("intersection") if the line segment is entirely contained in the interior of the Shape's path.
   *
   * @param {Vector2} startPoint - One end of the line segment
   * @param {Vector2} endPoint - The other end of the line segment
   * @returns {boolean}
   */
  interiorIntersectsLineSegment(startPoint, endPoint) {
    // First check if our midpoint is in the Shape (as either our midpoint is in the Shape, OR the line segment will
    // intersect the Shape's boundary path).
    const midpoint = startPoint.blend(endPoint, 0.5);
    if (this.containsPoint(midpoint)) {
      return true;
    }

    // TODO: if an issue, we can reduce this allocation to a scratch variable local in the Shape.js scope.
    const delta = endPoint.minus(startPoint);
    const length = delta.magnitude;
    if (length === 0) {
      return false;
    }
    delta.normalize(); // so we can use it as a unit vector, expected by the Ray

    // Grab all intersections (that are from startPoint towards the direction of endPoint)
    const hits = this.intersection(new Ray2(startPoint, delta));

    // See if we have any intersections along our infinite ray whose distance from the startPoint is less than or
    // equal to our line segment's length.
    for (let i = 0; i < hits.length; i++) {
      if (hits[i].distance <= length) {
        return true;
      }
    }

    // Did not hit the boundary, and wasn't fully contained.
    return false;
  }

  /**
   * Returns the winding number for intersection with a ray
   * @public
   *
   * @param {Ray2} ray
   * @returns {number}
   */
  windingIntersection(ray) {
    let wind = 0;
    const numSubpaths = this.subpaths.length;
    for (let i = 0; i < numSubpaths; i++) {
      const subpath = this.subpaths[i];
      if (subpath.isDrawable()) {
        const numSegments = subpath.segments.length;
        for (let k = 0; k < numSegments; k++) {
          wind += subpath.segments[k].windingIntersection(ray);
        }

        // handle the implicit closing line segment
        if (subpath.hasClosingSegment()) {
          wind += subpath.getClosingSegment().windingIntersection(ray);
        }
      }
    }
    return wind;
  }

  /**
   * Whether the path of the Shape intersects (or is contained in) the provided bounding box.
   * Computed by checking intersections with all four edges of the bounding box, or whether the Shape is totally
   * contained within the bounding box.
   * @public
   *
   * @param {Bounds2} bounds
   * @returns {boolean}
   */
  intersectsBounds(bounds) {
    // If the bounding box completely surrounds our shape, it intersects the bounds
    if (this.bounds.intersection(bounds).equals(this.bounds)) {
      return true;
    }

    // rays for hit testing along the bounding box edges
    const minHorizontalRay = new Ray2(new Vector2(bounds.minX, bounds.minY), new Vector2(1, 0));
    const minVerticalRay = new Ray2(new Vector2(bounds.minX, bounds.minY), new Vector2(0, 1));
    const maxHorizontalRay = new Ray2(new Vector2(bounds.maxX, bounds.maxY), new Vector2(-1, 0));
    const maxVerticalRay = new Ray2(new Vector2(bounds.maxX, bounds.maxY), new Vector2(0, -1));
    let hitPoint;
    let i;
    // TODO: could optimize to intersect differently so we bail sooner
    const horizontalRayIntersections = this.intersection(minHorizontalRay).concat(this.intersection(maxHorizontalRay));
    for (i = 0; i < horizontalRayIntersections.length; i++) {
      hitPoint = horizontalRayIntersections[i].point;
      if (hitPoint.x >= bounds.minX && hitPoint.x <= bounds.maxX) {
        return true;
      }
    }
    const verticalRayIntersections = this.intersection(minVerticalRay).concat(this.intersection(maxVerticalRay));
    for (i = 0; i < verticalRayIntersections.length; i++) {
      hitPoint = verticalRayIntersections[i].point;
      if (hitPoint.y >= bounds.minY && hitPoint.y <= bounds.maxY) {
        return true;
      }
    }

    // not contained, and no intersections with the sides of the bounding box
    return false;
  }

  /**
   * Returns a new Shape that is an outline of the stroked path of this current Shape. currently not intended to be
   * nested (doesn't do intersection computations yet)
   * @public
   *
   * TODO: rename stroked( lineStyles )?
   *
   * @param {LineStyles} lineStyles
   * @returns {Shape}
   */
  getStrokedShape(lineStyles) {
    let subpaths = [];
    const bounds = Bounds2.NOTHING.copy();
    let subLen = this.subpaths.length;
    for (let i = 0; i < subLen; i++) {
      const subpath = this.subpaths[i];
      const strokedSubpath = subpath.stroked(lineStyles);
      subpaths = subpaths.concat(strokedSubpath);
    }
    subLen = subpaths.length;
    for (let i = 0; i < subLen; i++) {
      bounds.includeBounds(subpaths[i].bounds);
    }
    return new Shape(subpaths, bounds);
  }

  /**
   * Gets a shape offset by a certain amount.
   * @public
   *
   * @param {number} distance
   * @returns {Shape}
   */
  getOffsetShape(distance) {
    // TODO: abstract away this type of behavior
    const subpaths = [];
    const bounds = Bounds2.NOTHING.copy();
    let subLen = this.subpaths.length;
    for (let i = 0; i < subLen; i++) {
      subpaths.push(this.subpaths[i].offset(distance));
    }
    subLen = subpaths.length;
    for (let i = 0; i < subLen; i++) {
      bounds.includeBounds(subpaths[i].bounds);
    }
    return new Shape(subpaths, bounds);
  }

  /**
   * Returns a copy of this subpath with the dash "holes" removed (has many subpaths usually).
   * @public
   *
   * @param {Array.<number>} lineDash
   * @param {number} lineDashOffset
   * @param {Object} [options]
   * @returns {Shape}
   */
  getDashedShape(lineDash, lineDashOffset, options) {
    options = merge({
      // controls level of subdivision by attempting to ensure a maximum (squared) deviation from the curve
      distanceEpsilon: 1e-10,
      // controls level of subdivision by attempting to ensure a maximum curvature change between segments
      curveEpsilon: 1e-8
    }, options);
    return new Shape(_.flatten(this.subpaths.map(subpath => subpath.dashed(lineDash, lineDashOffset, options.distanceEpsilon, options.curveEpsilon))));
  }

  /**
   * Returns the bounds of this shape. It is the bounding-box union of the bounds of each subpath contained.
   * @public
   *
   * @returns {Bounds2}
   */
  getBounds() {
    if (this._bounds === null) {
      const bounds = Bounds2.NOTHING.copy();
      _.each(this.subpaths, subpath => {
        bounds.includeBounds(subpath.getBounds());
      });
      this._bounds = bounds;
    }
    return this._bounds;
  }
  get bounds() {
    return this.getBounds();
  }

  /**
   * Returns the bounds for a stroked version of this shape. The input lineStyles are used to determine the size and
   * style of the stroke, and then the bounds of the stroked shape are returned.
   * @public
   *
   * @param {LineStyles} lineStyles
   * @returns {Bounds2}
   */
  getStrokedBounds(lineStyles) {
    assert && assert(lineStyles instanceof LineStyles);

    // Check if all of our segments end vertically or horizontally AND our drawable subpaths are all closed. If so,
    // we can apply a bounds dilation.
    let areStrokedBoundsDilated = true;
    for (let i = 0; i < this.subpaths.length; i++) {
      const subpath = this.subpaths[i];

      // If a subpath with any segments is NOT closed, line-caps will apply. We can't make the simplification in this
      // case.
      if (subpath.isDrawable() && !subpath.isClosed()) {
        areStrokedBoundsDilated = false;
        break;
      }
      for (let j = 0; j < subpath.segments.length; j++) {
        const segment = subpath.segments[j];
        if (!segment.areStrokedBoundsDilated()) {
          areStrokedBoundsDilated = false;
          break;
        }
      }
    }
    if (areStrokedBoundsDilated) {
      return this.bounds.dilated(lineStyles.lineWidth / 2);
    } else {
      const bounds = this.bounds.copy();
      for (let i = 0; i < this.subpaths.length; i++) {
        const subpaths = this.subpaths[i].stroked(lineStyles);
        for (let j = 0; j < subpaths.length; j++) {
          bounds.includeBounds(subpaths[j].bounds);
        }
      }
      return bounds;
    }
  }

  /**
   * Returns a simplified form of this shape.
   * @public
   *
   * Runs it through the normal CAG process, which should combine areas where possible, handles self-intersection,
   * etc.
   *
   * NOTE: Currently (2017-10-04) adjacent segments may get simplified only if they are lines. Not yet complete.
   *
   * @returns {Shape}
   */
  getSimplifiedAreaShape() {
    return Graph.simplifyNonZero(this);
  }

  /**
   * @public
   *
   * @param {Matrix3} matrix
   * @param {LineStyles} [lineStyles]
   * @returns {Bounds2}
   */
  getBoundsWithTransform(matrix, lineStyles) {
    const bounds = Bounds2.NOTHING.copy();
    const numSubpaths = this.subpaths.length;
    for (let i = 0; i < numSubpaths; i++) {
      const subpath = this.subpaths[i];
      bounds.includeBounds(subpath.getBoundsWithTransform(matrix));
    }
    if (lineStyles) {
      bounds.includeBounds(this.getStrokedShape(lineStyles).getBoundsWithTransform(matrix));
    }
    return bounds;
  }

  /**
   * Return an approximate value of the area inside of this Shape (where containsPoint is true) using Monte-Carlo.
   * @public
   *
   * NOTE: Generally, use getArea(). This can be used for verification, but takes a large number of samples.
   *
   * @param {number} numSamples - How many times to randomly check for inclusion of points.
   * @returns {number}
   */
  getApproximateArea(numSamples) {
    const x = this.bounds.minX;
    const y = this.bounds.minY;
    const width = this.bounds.width;
    const height = this.bounds.height;
    const rectangleArea = width * height;
    let count = 0;
    const point = new Vector2(0, 0);
    for (let i = 0; i < numSamples; i++) {
      point.x = x + randomSource() * width;
      point.y = y + randomSource() * height;
      if (this.containsPoint(point)) {
        count++;
      }
    }
    return rectangleArea * count / numSamples;
  }

  /**
   * Return the area inside of the Shape (where containsPoint is true), assuming there is no self-intersection or
   * overlap, and the same orientation (winding order) is used. Should also support holes (with opposite orientation),
   * assuming they don't intersect the containing subpath.
   * @public
   *
   * @returns {number}
   */
  getNonoverlappingArea() {
    // Only absolute-value the final value.
    return Math.abs(_.sum(this.subpaths.map(subpath => _.sum(subpath.getFillSegments().map(segment => segment.getSignedAreaFragment())))));
  }

  /**
   * Returns the area inside of the shape.
   * @public
   *
   * NOTE: This requires running it through a lot of computation to determine a non-overlapping non-self-intersecting
   *       form first. If the Shape is "simple" enough, getNonoverlappingArea would be preferred.
   *
   * @returns {number}
   */
  getArea() {
    return this.getSimplifiedAreaShape().getNonoverlappingArea();
  }

  /**
   * Return the approximate location of the centroid of the Shape (the average of all points where containsPoint is true)
   * using Monte-Carlo methods.
   * @public
   *
   * @param {number} numSamples - How many times to randomly check for inclusion of points.
   * @returns {number}
   */
  getApproximateCentroid(numSamples) {
    const x = this.bounds.minX;
    const y = this.bounds.minY;
    const width = this.bounds.width;
    const height = this.bounds.height;
    let count = 0;
    const sum = new Vector2(0, 0);
    const point = new Vector2(0, 0);
    for (let i = 0; i < numSamples; i++) {
      point.x = x + randomSource() * width;
      point.y = y + randomSource() * height;
      if (this.containsPoint(point)) {
        sum.add(point);
        count++;
      }
    }
    return sum.dividedScalar(count);
  }

  /**
   * Returns an array of potential closest point results on the Shape to the given point.
   * @public
   *
   * @param {Vector2} point
   * @returns {ClosestToPointResult[]}
   */
  getClosestPoints(point) {
    return Segment.filterClosestToPointResult(_.flatten(this.subpaths.map(subpath => subpath.getClosestPoints(point))));
  }

  /**
   * Returns a single point ON the Shape boundary that is closest to the given point (picks an arbitrary one if there
   * are multiple).
   * @public
   *
   * @param {Vector2} point
   * @returns {Vector2}
   */
  getClosestPoint(point) {
    return this.getClosestPoints(point)[0].closestPoint;
  }

  /**
   * Should be called after mutating the x/y of Vector2 points that were passed in to various Shape calls, so that
   * derived information computed (bounds, etc.) will be correct, and any clients (e.g. Scenery Paths) will be
   * notified of the updates.
   * @public
   */
  invalidatePoints() {
    this._invalidatingPoints = true;
    const numSubpaths = this.subpaths.length;
    for (let i = 0; i < numSubpaths; i++) {
      this.subpaths[i].invalidatePoints();
    }
    this._invalidatingPoints = false;
    this.invalidate();
  }

  /**
   * @public
   *
   * @returns {string}
   */
  toString() {
    // TODO: consider a more verbose but safer way?
    return `new phet.kite.Shape( '${this.getSVGPath()}' )`;
  }

  /*---------------------------------------------------------------------------*
   * Internal subpath computations
   *----------------------------------------------------------------------------*/

  /**
   * @private
   */
  invalidate() {
    assert && assert(!this._immutable, 'Attempt to modify an immutable Shape');
    if (!this._invalidatingPoints) {
      this._bounds = null;
      this.notifyInvalidationListeners();
    }
  }

  /**
   * Called when a part of the Shape has changed, or if metadata on the Shape has changed (e.g. it became immutable).
   * @private
   */
  notifyInvalidationListeners() {
    this.invalidatedEmitter.emit();
  }

  /**
   * @private
   *
   * @param {Segment} segment
   */
  addSegmentAndBounds(segment) {
    this.getLastSubpath().addSegment(segment);
    this.invalidate();
  }

  /**
   * Makes sure that we have a subpath (and if there is no subpath, start it at this point)
   * @private
   *
   * @param {Vector2} point
   */
  ensure(point) {
    if (!this.hasSubpaths()) {
      this.addSubpath(new Subpath());
      this.getLastSubpath().addPoint(point);
    }
  }

  /**
   * Adds a subpath
   * @private
   *
   * @param {Subpath} subpath
   */
  addSubpath(subpath) {
    this.subpaths.push(subpath);

    // listen to when the subpath is invalidated (will cause bounds recomputation here)
    subpath.invalidatedEmitter.addListener(this._invalidateListener);
    this.invalidate();
    return this; // allow chaining
  }

  /**
   * Determines if there are any subpaths
   * @private
   *
   * @returns {boolean}
   */
  hasSubpaths() {
    return this.subpaths.length > 0;
  }

  /**
   * Gets the last subpath
   * @private
   *
   * @returns {Subpath}
   */
  getLastSubpath() {
    return _.last(this.subpaths);
  }

  /**
   * Gets the last point in the last subpath, or null if it doesn't exist
   * @public
   *
   * @returns {Vector2|null}
   */
  getLastPoint() {
    return this.hasSubpaths() ? this.getLastSubpath().getLastPoint() : null;
  }

  /**
   * Gets the last drawable segment in the last subpath, or null if it doesn't exist
   * @private
   *
   * @returns {Segment|null}
   */
  getLastSegment() {
    if (!this.hasSubpaths()) {
      return null;
    }
    const subpath = this.getLastSubpath();
    if (!subpath.isDrawable()) {
      return null;
    }
    return subpath.getLastSegment();
  }

  /**
   * Returns the control point to be used to create a smooth quadratic segments
   * @private
   *
   * @returns {Vector2}
   */
  getSmoothQuadraticControlPoint() {
    const lastPoint = this.getLastPoint();
    if (this.lastQuadraticControlPoint) {
      return lastPoint.plus(lastPoint.minus(this.lastQuadraticControlPoint));
    } else {
      return lastPoint;
    }
  }

  /**
   * Returns the control point to be used to create a smooth cubic segment
   * @private
   *
   * @returns {Vector2}
   */
  getSmoothCubicControlPoint() {
    const lastPoint = this.getLastPoint();
    if (this.lastCubicControlPoint) {
      return lastPoint.plus(lastPoint.minus(this.lastCubicControlPoint));
    } else {
      return lastPoint;
    }
  }

  /**
   * Returns the last point in the last subpath, or the Vector ZERO if it doesn't exist
   * @private
   *
   * @returns {Vector2}
   */
  getRelativePoint() {
    const lastPoint = this.getLastPoint();
    return lastPoint ? lastPoint : Vector2.ZERO;
  }

  /**
   * Returns a new shape that contains a union of the two shapes (a point in either shape is in the resulting shape).
   * @public
   *
   * @param {Shape} shape
   * @returns {Shape}
   */
  shapeUnion(shape) {
    return Graph.binaryResult(this, shape, Graph.BINARY_NONZERO_UNION);
  }

  /**
   * Returns a new shape that contains the intersection of the two shapes (a point in both shapes is in the
   * resulting shape).
   * @public
   *
   * @param {Shape} shape
   * @returns {Shape}
   */
  shapeIntersection(shape) {
    return Graph.binaryResult(this, shape, Graph.BINARY_NONZERO_INTERSECTION);
  }

  /**
   * Returns a new shape that contains the difference of the two shapes (a point in the first shape and NOT in the
   * second shape is in the resulting shape).
   * @public
   *
   * @param {Shape} shape
   * @returns {Shape}
   */
  shapeDifference(shape) {
    return Graph.binaryResult(this, shape, Graph.BINARY_NONZERO_DIFFERENCE);
  }

  /**
   * Returns a new shape that contains the xor of the two shapes (a point in only one shape is in the resulting
   * shape).
   * @public
   *
   * @param {Shape} shape
   * @returns {Shape}
   */
  shapeXor(shape) {
    return Graph.binaryResult(this, shape, Graph.BINARY_NONZERO_XOR);
  }

  /**
   * Returns a new shape that only contains portions of segments that are within the passed-in shape's area.
   * @public
   *
   * @param {Shape} shape
   * @param {Object} [options] - See Graph.clipShape options
   * @returns {Shape}
   */
  shapeClip(shape, options) {
    return Graph.clipShape(shape, this, options);
  }

  /**
   * Returns the (sometimes approximate) arc length of all of the shape's subpaths combined.
   * @public
   *
   * @param {number} [distanceEpsilon]
   * @param {number} [curveEpsilon]
   * @param {number} [maxLevels]
   * @returns {number}
   */
  getArcLength(distanceEpsilon, curveEpsilon, maxLevels) {
    let length = 0;
    for (let i = 0; i < this.subpaths.length; i++) {
      length += this.subpaths[i].getArcLength(distanceEpsilon, curveEpsilon, maxLevels);
    }
    return length;
  }

  /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   * @public
   *
   * @returns {Object}
   */
  serialize() {
    return {
      type: 'Shape',
      subpaths: this.subpaths.map(subpath => subpath.serialize())
    };
  }

  /**
   * Returns a Shape from the serialized representation.
   * @public
   *
   * @param {Object} obj
   * @returns {Shape}
   */
  static deserialize(obj) {
    assert && assert(obj.type === 'Shape');
    return new Shape(obj.subpaths.map(Subpath.deserialize));
  }

  /**
   * Creates a rectangle
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @returns {Shape}
   */
  static rectangle(x, y, width, height) {
    return new Shape().rect(x, y, width, height);
  }

  /**
   * Creates a round rectangle {Shape}, with {number} arguments. Uses circular or elliptical arcs if given.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} arcw
   * @param {number} arch
   * @returns {Shape}
   */
  static roundRect(x, y, width, height, arcw, arch) {
    return new Shape().roundRect(x, y, width, height, arcw, arch);
  }

  /**
   * Creates a rounded rectangle, where each corner can have a different radius. The radii default to 0, and may be set
   * using topLeft, topRight, bottomLeft and bottomRight in the options. If the specified radii are larger than the dimension
   * on that side, they radii are reduced proportionally, see https://github.com/phetsims/under-pressure/issues/151
   * @public
   *
   * E.g.:
   *
   * var cornerRadius = 20;
   * var rect = Shape.roundedRectangleWithRadii( 0, 0, 200, 100, {
   *   topLeft: cornerRadius,
   *   topRight: cornerRadius
   * } );
   *
   * @param {number} x - Left edge position
   * @param {number} y - Top edge position
   * @param {number} width - Width of rectangle
   * @param {number} height - Height of rectangle
   * @param {Object} [cornerRadii] - Optional object with potential radii for each corner.
   * @returns {Shape}
   */
  static roundedRectangleWithRadii(x, y, width, height, cornerRadii) {
    // defaults to 0 (not using merge, since we reference each multiple times)
    let topLeftRadius = cornerRadii && cornerRadii.topLeft || 0;
    let topRightRadius = cornerRadii && cornerRadii.topRight || 0;
    let bottomLeftRadius = cornerRadii && cornerRadii.bottomLeft || 0;
    let bottomRightRadius = cornerRadii && cornerRadii.bottomRight || 0;

    // type and constraint assertions
    assert && assert(typeof x === 'number' && isFinite(x), 'Non-finite x');
    assert && assert(typeof y === 'number' && isFinite(y), 'Non-finite y');
    assert && assert(typeof width === 'number' && width >= 0 && isFinite(width), 'Negative or non-finite width');
    assert && assert(typeof height === 'number' && height >= 0 && isFinite(height), 'Negative or non-finite height');
    assert && assert(typeof topLeftRadius === 'number' && topLeftRadius >= 0 && isFinite(topLeftRadius), 'Invalid topLeft');
    assert && assert(typeof topRightRadius === 'number' && topRightRadius >= 0 && isFinite(topRightRadius), 'Invalid topRight');
    assert && assert(typeof bottomLeftRadius === 'number' && bottomLeftRadius >= 0 && isFinite(bottomLeftRadius), 'Invalid bottomLeft');
    assert && assert(typeof bottomRightRadius === 'number' && bottomRightRadius >= 0 && isFinite(bottomRightRadius), 'Invalid bottomRight');

    // The width and height take precedence over the corner radii. If the sum of the corner radii exceed
    // that dimension, then the corner radii are reduced proportionately
    const topSum = topLeftRadius + topRightRadius;
    if (topSum > width && topSum > 0) {
      topLeftRadius = topLeftRadius / topSum * width;
      topRightRadius = topRightRadius / topSum * width;
    }
    const bottomSum = bottomLeftRadius + bottomRightRadius;
    if (bottomSum > width && bottomSum > 0) {
      bottomLeftRadius = bottomLeftRadius / bottomSum * width;
      bottomRightRadius = bottomRightRadius / bottomSum * width;
    }
    const leftSum = topLeftRadius + bottomLeftRadius;
    if (leftSum > height && leftSum > 0) {
      topLeftRadius = topLeftRadius / leftSum * height;
      bottomLeftRadius = bottomLeftRadius / leftSum * height;
    }
    const rightSum = topRightRadius + bottomRightRadius;
    if (rightSum > height && rightSum > 0) {
      topRightRadius = topRightRadius / rightSum * height;
      bottomRightRadius = bottomRightRadius / rightSum * height;
    }

    // verify there is no overlap between corners
    assert && assert(topLeftRadius + topRightRadius <= width, 'Corner overlap on top edge');
    assert && assert(bottomLeftRadius + bottomRightRadius <= width, 'Corner overlap on bottom edge');
    assert && assert(topLeftRadius + bottomLeftRadius <= height, 'Corner overlap on left edge');
    assert && assert(topRightRadius + bottomRightRadius <= height, 'Corner overlap on right edge');
    const shape = new Shape();
    const right = x + width;
    const bottom = y + height;

    // To draw the rounded rectangle, we use the implicit "line from last segment to next segment" and the close() for
    // all the straight line edges between arcs, or lineTo the corner.

    if (bottomRightRadius > 0) {
      shape.arc(right - bottomRightRadius, bottom - bottomRightRadius, bottomRightRadius, 0, Math.PI / 2, false);
    } else {
      shape.moveTo(right, bottom);
    }
    if (bottomLeftRadius > 0) {
      shape.arc(x + bottomLeftRadius, bottom - bottomLeftRadius, bottomLeftRadius, Math.PI / 2, Math.PI, false);
    } else {
      shape.lineTo(x, bottom);
    }
    if (topLeftRadius > 0) {
      shape.arc(x + topLeftRadius, y + topLeftRadius, topLeftRadius, Math.PI, 3 * Math.PI / 2, false);
    } else {
      shape.lineTo(x, y);
    }
    if (topRightRadius > 0) {
      shape.arc(right - topRightRadius, y + topRightRadius, topRightRadius, 3 * Math.PI / 2, 2 * Math.PI, false);
    } else {
      shape.lineTo(right, y);
    }
    shape.close();
    return shape;
  }

  /**
   * Returns a Shape from a bounds, offset by certain amounts, and with certain corner radii.
   * @public
   *
   * @param {Bounds2} bounds
   * @param {Object} offsets - { left, top, right, bottom }, all numbers. Determines how to expand the bounds
   * @param {Object} radii - See Shape.roundedRectangleWithRadii
   * @returns {Shape}
   */
  static boundsOffsetWithRadii(bounds, offsets, radii) {
    const offsetBounds = bounds.withOffsets(offsets.left, offsets.top, offsets.right, offsets.bottom);
    return Shape.roundedRectangleWithRadii(offsetBounds.minX, offsetBounds.minY, offsetBounds.width, offsetBounds.height, radii);
  }

  /**
   * Creates a closed polygon from an array of vertices by connecting them by a series of lines.
   * The lines are joining the adjacent vertices in the array.
   * @public
   *
   * @param {Array.<Vector2>} vertices
   * @returns {Shape}
   */
  static polygon(vertices) {
    return new Shape().polygon(vertices);
  }

  /**
   * Creates a rectangular shape from bounds
   * @public
   *
   * @param {Bounds2} bounds
   * @returns {Shape}
   */
  static bounds(bounds) {
    return new Shape().rect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  }

  /**
   * Creates a line segment, using either (x1,y1,x2,y2) or ({x1,y1},{x2,y2}) arguments
   * @public
   *
   * @param {number|Vector2} a
   * @param {number|Vector2} b
   * @param {number} [c]
   * @param {number} [d]
   * @returns {Shape}
   */
  static lineSegment(a, b, c, d) {
    // TODO: add type assertions?
    if (typeof a === 'number') {
      return new Shape().moveTo(a, b).lineTo(c, d);
    } else {
      // then a and b must be {Vector2}
      return new Shape().moveToPoint(a).lineToPoint(b);
    }
  }

  /**
   * Returns a regular polygon of radius and number of sides
   * The regular polygon is oriented such that the first vertex lies on the positive x-axis.
   * @public
   *
   * @param {number} sides - an integer
   * @param {number} radius
   * @returns {Shape}
   */
  static regularPolygon(sides, radius) {
    const shape = new Shape();
    _.each(_.range(sides), k => {
      const point = Vector2.createPolar(radius, 2 * Math.PI * k / sides);
      k === 0 ? shape.moveToPoint(point) : shape.lineToPoint(point);
    });
    return shape.close();
  }

  /**
   * Creates a circle
   * supports both circle( centerX, centerY, radius ), circle( center, radius ), and circle( radius ) with the center default to 0,0
   * @public
   *
   * @param {Vector2|number} centerX
   * @param {number} [centerY]
   * @param {number} [radius]
   * @returns {Shape}
   */
  static circle(centerX, centerY, radius) {
    if (centerY === undefined) {
      // circle( radius ), center = 0,0
      return new Shape().circle(0, 0, centerX);
    }
    return new Shape().circle(centerX, centerY, radius);
  }

  /**
   * Supports ellipse( centerX, centerY, radiusX, radiusY, rotation ), ellipse( center, radiusX, radiusY, rotation ), and ellipse( radiusX, radiusY, rotation )
   * with the center default to 0,0 and rotation of 0.  The rotation is about the centerX, centerY.
   * @public
   *
   * @param {number|Vector2} centerX
   * @param {number} [centerY]
   * @param {number|Vector2} radiusX
   * @param {number} [radiusY]
   * @param {number} rotation
   * @returns {Shape}
   */
  static ellipse(centerX, centerY, radiusX, radiusY, rotation) {
    // TODO: Ellipse/EllipticalArc has a mess of parameters. Consider parameter object, or double-check parameter handling
    if (radiusY === undefined) {
      // ellipse( radiusX, radiusY ), center = 0,0
      return new Shape().ellipse(0, 0, centerX, centerY, radiusX);
    }
    return new Shape().ellipse(centerX, centerY, radiusX, radiusY, rotation);
  }

  /**
   * Supports both arc( centerX, centerY, radius, startAngle, endAngle, anticlockwise ) and arc( center, radius, startAngle, endAngle, anticlockwise )
   * @public
   *
   * @param {Vector2|number} centerX
   * @param {number} [centerY]
   * @param {number} radius - How far from the center the arc will be
   * @param {number} startAngle - Angle (radians) of the start of the arc
   * @param {number} endAngle - Angle (radians) of the end of the arc
   * @param {boolean} [anticlockwise] - Decides which direction the arc takes around the center
   * @returns {Shape}
   */
  static arc(centerX, centerY, radius, startAngle, endAngle, anticlockwise) {
    return new Shape().arc(centerX, centerY, radius, startAngle, endAngle, anticlockwise);
  }

  /**
   * Returns the union of an array of shapes.
   * @public
   *
   * @param {Array.<Shape>} shapes
   * @returns {Shape}
   */
  static union(shapes) {
    return Graph.unionNonZero(shapes);
  }

  /**
   * Returns the intersection of an array of shapes.
   * @public
   *
   * @param {Array.<Shape>} shapes
   * @returns {Shape}
   */
  static intersection(shapes) {
    return Graph.intersectionNonZero(shapes);
  }

  /**
   * Returns the xor of an array of shapes.
   * @public
   *
   * @param {Array.<Shape>} shapes
   * @returns {Shape}
   */
  static xor(shapes) {
    return Graph.xorNonZero(shapes);
  }

  /**
   * Returns a new Shape constructed by appending a list of segments together.
   * @public
   *
   * @param {Array.<Segment>} segments
   * @param {boolean} [closed]
   * @returns {Shape}
   */
  static segments(segments, closed) {
    if (assert) {
      for (let i = 1; i < segments.length; i++) {
        assert(segments[i - 1].end.equalsEpsilon(segments[i].start, 1e-6), 'Mismatched start/end');
      }
    }
    return new Shape([new Subpath(segments, undefined, !!closed)]);
  }
}
kite.register('Shape', Shape);

/*---------------------------------------------------------------------------*
 * Shape shortcuts
 *----------------------------------------------------------------------------*/

// @public {function}
Shape.rect = Shape.rectangle;
Shape.roundRectangle = Shape.roundRect;
export default Shape;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIkJvdW5kczIiLCJSYXkyIiwiVmVjdG9yMiIsIm1lcmdlIiwiQXJjIiwiQ3ViaWMiLCJFbGxpcHRpY2FsQXJjIiwiR3JhcGgiLCJraXRlIiwiTGluZSIsIkxpbmVTdHlsZXMiLCJRdWFkcmF0aWMiLCJTdWJwYXRoIiwic3ZnTnVtYmVyIiwic3ZnUGF0aCIsIlNlZ21lbnQiLCJyYW5kb21Tb3VyY2UiLCJNYXRoIiwicmFuZG9tIiwidiIsIngiLCJ5Iiwid2VpZ2h0ZWRTcGxpbmVWZWN0b3IiLCJiZWZvcmVWZWN0b3IiLCJjdXJyZW50VmVjdG9yIiwiYWZ0ZXJWZWN0b3IiLCJ0ZW5zaW9uIiwiY29weSIsInN1YnRyYWN0IiwibXVsdGlwbHlTY2FsYXIiLCJhZGQiLCJTaGFwZSIsImNvbnN0cnVjdG9yIiwic3VicGF0aHMiLCJib3VuZHMiLCJfYm91bmRzIiwiaW52YWxpZGF0ZWRFbWl0dGVyIiwicmVzZXRDb250cm9sUG9pbnRzIiwiX2ludmFsaWRhdGVMaXN0ZW5lciIsImludmFsaWRhdGUiLCJiaW5kIiwiX2ludmFsaWRhdGluZ1BvaW50cyIsIl9pbW11dGFibGUiLCJpIiwibGVuZ3RoIiwiYWRkU3VicGF0aCIsImFzc2VydCIsIl8iLCJlYWNoIiwicGFyc2UiLCJpdGVtIiwicHJvdG90eXBlIiwiY21kIiwidW5kZWZpbmVkIiwiYXBwbHkiLCJhcmdzIiwibGFzdFF1YWRyYXRpY0NvbnRyb2xQb2ludCIsImxhc3RDdWJpY0NvbnRyb2xQb2ludCIsInNldFF1YWRyYXRpY0NvbnRyb2xQb2ludCIsInBvaW50Iiwic2V0Q3ViaWNDb250cm9sUG9pbnQiLCJtb3ZlVG8iLCJpc0Zpbml0ZSIsIm1vdmVUb1BvaW50IiwibW92ZVRvUmVsYXRpdmUiLCJtb3ZlVG9Qb2ludFJlbGF0aXZlIiwiZ2V0UmVsYXRpdmVQb2ludCIsInBsdXMiLCJhZGRQb2ludCIsImxpbmVUbyIsImxpbmVUb1BvaW50IiwibGluZVRvUmVsYXRpdmUiLCJsaW5lVG9Qb2ludFJlbGF0aXZlIiwiaGFzU3VicGF0aHMiLCJzdGFydCIsImdldExhc3RTdWJwYXRoIiwiZ2V0TGFzdFBvaW50IiwiZW5kIiwibGluZSIsImFkZFNlZ21lbnRBbmRCb3VuZHMiLCJlbnN1cmUiLCJob3Jpem9udGFsTGluZVRvIiwiaG9yaXpvbnRhbExpbmVUb1JlbGF0aXZlIiwidmVydGljYWxMaW5lVG8iLCJ2ZXJ0aWNhbExpbmVUb1JlbGF0aXZlIiwiemlnWmFnVG8iLCJlbmRYIiwiZW5kWSIsImFtcGxpdHVkZSIsIm51bWJlclppZ1phZ3MiLCJzeW1tZXRyaWNhbCIsInppZ1phZ1RvUG9pbnQiLCJlbmRQb2ludCIsIk51bWJlciIsImlzSW50ZWdlciIsInN0YXJ0UG9pbnQiLCJkZWx0YSIsIm1pbnVzIiwiZGlyZWN0aW9uVW5pdFZlY3RvciIsIm5vcm1hbGl6ZWQiLCJhbXBsaXR1ZGVOb3JtYWxWZWN0b3IiLCJwZXJwZW5kaWN1bGFyIiwidGltZXMiLCJ3YXZlbGVuZ3RoIiwibWFnbml0dWRlIiwid2F2ZU9yaWdpbiIsInRvcFBvaW50IiwiYm90dG9tUG9pbnQiLCJxdWFkcmF0aWNDdXJ2ZVRvIiwiY3B4IiwiY3B5IiwicXVhZHJhdGljQ3VydmVUb1BvaW50IiwicXVhZHJhdGljQ3VydmVUb1JlbGF0aXZlIiwicXVhZHJhdGljQ3VydmVUb1BvaW50UmVsYXRpdmUiLCJjb250cm9sUG9pbnQiLCJyZWxhdGl2ZVBvaW50Iiwic21vb3RoUXVhZHJhdGljQ3VydmVUbyIsImdldFNtb290aFF1YWRyYXRpY0NvbnRyb2xQb2ludCIsInNtb290aFF1YWRyYXRpY0N1cnZlVG9SZWxhdGl2ZSIsInF1YWRyYXRpYyIsIm5vbmRlZ2VuZXJhdGVTZWdtZW50cyIsImdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cyIsInNlZ21lbnQiLCJjdWJpY0N1cnZlVG8iLCJjcDF4IiwiY3AxeSIsImNwMngiLCJjcDJ5IiwiY3ViaWNDdXJ2ZVRvUG9pbnQiLCJjdWJpY0N1cnZlVG9SZWxhdGl2ZSIsImN1YmljQ3VydmVUb1BvaW50UmVsYXRpdmUiLCJjb250cm9sMSIsImNvbnRyb2wyIiwic21vb3RoQ3ViaWNDdXJ2ZVRvIiwiZ2V0U21vb3RoQ3ViaWNDb250cm9sUG9pbnQiLCJzbW9vdGhDdWJpY0N1cnZlVG9SZWxhdGl2ZSIsImN1YmljIiwiYXJjIiwiY2VudGVyWCIsImNlbnRlclkiLCJyYWRpdXMiLCJzdGFydEFuZ2xlIiwiZW5kQW5nbGUiLCJhbnRpY2xvY2t3aXNlIiwiYXJjUG9pbnQiLCJjZW50ZXIiLCJnZXRTdGFydCIsImdldEVuZCIsImdldExlbmd0aCIsImVxdWFscyIsImVsbGlwdGljYWxBcmMiLCJyYWRpdXNYIiwicmFkaXVzWSIsInJvdGF0aW9uIiwiZWxsaXB0aWNhbEFyY1BvaW50IiwiY2xvc2UiLCJwcmV2aW91c1BhdGgiLCJuZXh0UGF0aCIsImdldEZpcnN0UG9pbnQiLCJuZXdTdWJwYXRoIiwibWFrZUltbXV0YWJsZSIsIm5vdGlmeUludmFsaWRhdGlvbkxpc3RlbmVycyIsImlzSW1tdXRhYmxlIiwiZWxsaXB0aWNhbEFyY1RvUmVsYXRpdmUiLCJsYXJnZUFyYyIsInN3ZWVwIiwiZWxsaXB0aWNhbEFyY1RvIiwicnhzIiwicnlzIiwicHJpbWUiLCJkaXZpZGVkU2NhbGFyIiwicm90YXRlZCIsInB4cyIsInB5cyIsImNlbnRlclByaW1lIiwic2l6ZSIsInNxcnQiLCJtYXgiLCJibGVuZCIsInNpZ25lZEFuZ2xlIiwidSIsImFuZ2xlQmV0d2VlbiIsInZpY3RvciIsInJvc3MiLCJYX1VOSVQiLCJkZWx0YUFuZ2xlIiwiUEkiLCJjaXJjbGUiLCJlbGxpcHNlIiwicmVjdCIsIndpZHRoIiwiaGVpZ2h0Iiwic3VicGF0aCIsInBvaW50cyIsImlzTmFOIiwiZ2V0WCIsInJvdW5kUmVjdCIsImFyY3ciLCJhcmNoIiwibG93WCIsImhpZ2hYIiwibG93WSIsImhpZ2hZIiwicG9seWdvbiIsInZlcnRpY2VzIiwiY2FyZGluYWxTcGxpbmUiLCJwb3NpdGlvbnMiLCJvcHRpb25zIiwiaXNDbG9zZWRMaW5lU2VnbWVudHMiLCJwb2ludE51bWJlciIsInNlZ21lbnROdW1iZXIiLCJjYXJkaW5hbFBvaW50cyIsImJlemllclBvaW50cyIsIm1hcCIsIndyaXRlVG9Db250ZXh0IiwiY29udGV4dCIsImxlbiIsImdldFNWR1BhdGgiLCJzdHJpbmciLCJpc0RyYXdhYmxlIiwic2VnbWVudHMiLCJrIiwiZ2V0U1ZHUGF0aEZyYWdtZW50IiwiaXNDbG9zZWQiLCJ0cmFuc2Zvcm1lZCIsIm1hdHJpeCIsInJlZHVjZSIsInVuaW9uIiwiTk9USElORyIsIm5vbmxpbmVhclRyYW5zZm9ybWVkIiwibWluTGV2ZWxzIiwibWF4TGV2ZWxzIiwiZGlzdGFuY2VFcHNpbG9uIiwiY3VydmVFcHNpbG9uIiwiaW5jbHVkZUN1cnZhdHVyZSIsInBvbGFyVG9DYXJ0ZXNpYW4iLCJwb2ludE1hcCIsInAiLCJjcmVhdGVQb2xhciIsIm1ldGhvZE5hbWUiLCJ0b1BpZWNld2lzZUxpbmVhciIsImNvbnRhaW5zUG9pbnQiLCJyYXkiLCJ3aW5kaW5nSW50ZXJzZWN0aW9uIiwiaW50ZXJzZWN0aW9uIiwiaGl0cyIsIm51bVN1YnBhdGhzIiwibnVtU2VnbWVudHMiLCJjb25jYXQiLCJoYXNDbG9zaW5nU2VnbWVudCIsImdldENsb3NpbmdTZWdtZW50Iiwic29ydEJ5IiwiaGl0IiwiZGlzdGFuY2UiLCJpbnRlcmlvckludGVyc2VjdHNMaW5lU2VnbWVudCIsIm1pZHBvaW50Iiwibm9ybWFsaXplIiwid2luZCIsImludGVyc2VjdHNCb3VuZHMiLCJtaW5Ib3Jpem9udGFsUmF5IiwibWluWCIsIm1pblkiLCJtaW5WZXJ0aWNhbFJheSIsIm1heEhvcml6b250YWxSYXkiLCJtYXhYIiwibWF4WSIsIm1heFZlcnRpY2FsUmF5IiwiaGl0UG9pbnQiLCJob3Jpem9udGFsUmF5SW50ZXJzZWN0aW9ucyIsInZlcnRpY2FsUmF5SW50ZXJzZWN0aW9ucyIsImdldFN0cm9rZWRTaGFwZSIsImxpbmVTdHlsZXMiLCJzdWJMZW4iLCJzdHJva2VkU3VicGF0aCIsInN0cm9rZWQiLCJpbmNsdWRlQm91bmRzIiwiZ2V0T2Zmc2V0U2hhcGUiLCJwdXNoIiwib2Zmc2V0IiwiZ2V0RGFzaGVkU2hhcGUiLCJsaW5lRGFzaCIsImxpbmVEYXNoT2Zmc2V0IiwiZmxhdHRlbiIsImRhc2hlZCIsImdldEJvdW5kcyIsImdldFN0cm9rZWRCb3VuZHMiLCJhcmVTdHJva2VkQm91bmRzRGlsYXRlZCIsImoiLCJkaWxhdGVkIiwibGluZVdpZHRoIiwiZ2V0U2ltcGxpZmllZEFyZWFTaGFwZSIsInNpbXBsaWZ5Tm9uWmVybyIsImdldEJvdW5kc1dpdGhUcmFuc2Zvcm0iLCJnZXRBcHByb3hpbWF0ZUFyZWEiLCJudW1TYW1wbGVzIiwicmVjdGFuZ2xlQXJlYSIsImNvdW50IiwiZ2V0Tm9ub3ZlcmxhcHBpbmdBcmVhIiwiYWJzIiwic3VtIiwiZ2V0RmlsbFNlZ21lbnRzIiwiZ2V0U2lnbmVkQXJlYUZyYWdtZW50IiwiZ2V0QXJlYSIsImdldEFwcHJveGltYXRlQ2VudHJvaWQiLCJnZXRDbG9zZXN0UG9pbnRzIiwiZmlsdGVyQ2xvc2VzdFRvUG9pbnRSZXN1bHQiLCJnZXRDbG9zZXN0UG9pbnQiLCJjbG9zZXN0UG9pbnQiLCJpbnZhbGlkYXRlUG9pbnRzIiwidG9TdHJpbmciLCJlbWl0IiwiYWRkU2VnbWVudCIsImFkZExpc3RlbmVyIiwibGFzdCIsImdldExhc3RTZWdtZW50IiwibGFzdFBvaW50IiwiWkVSTyIsInNoYXBlVW5pb24iLCJzaGFwZSIsImJpbmFyeVJlc3VsdCIsIkJJTkFSWV9OT05aRVJPX1VOSU9OIiwic2hhcGVJbnRlcnNlY3Rpb24iLCJCSU5BUllfTk9OWkVST19JTlRFUlNFQ1RJT04iLCJzaGFwZURpZmZlcmVuY2UiLCJCSU5BUllfTk9OWkVST19ESUZGRVJFTkNFIiwic2hhcGVYb3IiLCJCSU5BUllfTk9OWkVST19YT1IiLCJzaGFwZUNsaXAiLCJjbGlwU2hhcGUiLCJnZXRBcmNMZW5ndGgiLCJzZXJpYWxpemUiLCJ0eXBlIiwiZGVzZXJpYWxpemUiLCJvYmoiLCJyZWN0YW5nbGUiLCJyb3VuZGVkUmVjdGFuZ2xlV2l0aFJhZGlpIiwiY29ybmVyUmFkaWkiLCJ0b3BMZWZ0UmFkaXVzIiwidG9wTGVmdCIsInRvcFJpZ2h0UmFkaXVzIiwidG9wUmlnaHQiLCJib3R0b21MZWZ0UmFkaXVzIiwiYm90dG9tTGVmdCIsImJvdHRvbVJpZ2h0UmFkaXVzIiwiYm90dG9tUmlnaHQiLCJ0b3BTdW0iLCJib3R0b21TdW0iLCJsZWZ0U3VtIiwicmlnaHRTdW0iLCJyaWdodCIsImJvdHRvbSIsImJvdW5kc09mZnNldFdpdGhSYWRpaSIsIm9mZnNldHMiLCJyYWRpaSIsIm9mZnNldEJvdW5kcyIsIndpdGhPZmZzZXRzIiwibGVmdCIsInRvcCIsImxpbmVTZWdtZW50IiwiYSIsImIiLCJjIiwiZCIsInJlZ3VsYXJQb2x5Z29uIiwic2lkZXMiLCJyYW5nZSIsInNoYXBlcyIsInVuaW9uTm9uWmVybyIsImludGVyc2VjdGlvbk5vblplcm8iLCJ4b3IiLCJ4b3JOb25aZXJvIiwiY2xvc2VkIiwiZXF1YWxzRXBzaWxvbiIsInJlZ2lzdGVyIiwicm91bmRSZWN0YW5nbGUiXSwic291cmNlcyI6WyJTaGFwZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTaGFwZSBoYW5kbGluZ1xyXG4gKlxyXG4gKiBTaGFwZXMgYXJlIGludGVybmFsbHkgbWFkZSB1cCBvZiBTdWJwYXRocywgd2hpY2ggY29udGFpbiBhIHNlcmllcyBvZiBzZWdtZW50cywgYW5kIGFyZSBvcHRpb25hbGx5IGNsb3NlZC5cclxuICogRmFtaWxpYXJpdHkgd2l0aCBob3cgQ2FudmFzIGhhbmRsZXMgc3VicGF0aHMgaXMgaGVscGZ1bCBmb3IgdW5kZXJzdGFuZGluZyB0aGlzIGNvZGUuXHJcbiAqXHJcbiAqIENhbnZhcyBzcGVjOiBodHRwOi8vd3d3LnczLm9yZy9UUi8yZGNvbnRleHQvXHJcbiAqIFNWRyBzcGVjOiBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvZXhwYW5kZWQtdG9jLmh0bWxcclxuICogICAgICAgICAgIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9wYXRocy5odG1sI1BhdGhEYXRhIChmb3IgcGF0aHMpXHJcbiAqIE5vdGVzIGZvciBlbGxpcHRpY2FsIGFyY3M6IGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9pbXBsbm90ZS5odG1sI1BhdGhFbGVtZW50SW1wbGVtZW50YXRpb25Ob3Rlc1xyXG4gKiBOb3RlcyBmb3IgcGFpbnRpbmcgc3Ryb2tlczogaHR0cHM6Ly9zdmd3Zy5vcmcvc3ZnMi1kcmFmdC9wYWludGluZy5odG1sXHJcbiAqXHJcbiAqIFRPRE86IGFkZCBub256ZXJvIC8gZXZlbm9kZCBzdXBwb3J0IHdoZW4gYnJvd3NlcnMgc3VwcG9ydCBpdFxyXG4gKiBUT0RPOiBkb2NzXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgVGlueUVtaXR0ZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9UaW55RW1pdHRlci5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFJheTIgZnJvbSAnLi4vLi4vZG90L2pzL1JheTIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBBcmMsIEN1YmljLCBFbGxpcHRpY2FsQXJjLCBHcmFwaCwga2l0ZSwgTGluZSwgTGluZVN0eWxlcywgUXVhZHJhdGljLCBTdWJwYXRoLCBzdmdOdW1iZXIsIHN2Z1BhdGgsIFNlZ21lbnQgfSBmcm9tICcuL2ltcG9ydHMuanMnO1xyXG5cclxuLy8gIChXZSBjYW4ndCBnZXQgam9pc3QncyByYW5kb20gcmVmZXJlbmNlIGhlcmUpXHJcbmNvbnN0IHJhbmRvbVNvdXJjZSA9IE1hdGgucmFuZG9tO1xyXG5cclxuLyoqXHJcbiAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFZlY3RvcjJcclxuICogdXNlZCB0aHJvdWdob3V0IHRoaXMgZmlsZSBhcyBhbiBhYmJyZXZpYXRpb24gZm9yIGEgZGlzcGxhY2VtZW50LCBhIHBvc2l0aW9uIG9yIGEgcG9pbnQuXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gKi9cclxuZnVuY3Rpb24gdiggeCwgeSApIHsgcmV0dXJuIG5ldyBWZWN0b3IyKCB4LCB5ICk7IH1cclxuXHJcbi8qKlxyXG4gKiBUaGUgdGVuc2lvbiBwYXJhbWV0ZXIgY29udHJvbHMgaG93IHNtb290aGx5IHRoZSBjdXJ2ZSB0dXJucyB0aHJvdWdoIGl0cyBjb250cm9sIHBvaW50cy4gRm9yIGEgQ2F0bXVsbC1Sb20gY3VydmUsXHJcbiAqIHRoZSB0ZW5zaW9uIGlzIHplcm8uIFRoZSB0ZW5zaW9uIHNob3VsZCByYW5nZSBmcm9tIC0xIHRvIDEuXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7VmVjdG9yMn0gYmVmb3JlVmVjdG9yXHJcbiAqIEBwYXJhbSB7VmVjdG9yMn0gY3VycmVudFZlY3RvclxyXG4gKiBAcGFyYW0ge1ZlY3RvcjJ9IGFmdGVyVmVjdG9yXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB0ZW5zaW9uIC0gdGhlIHRlbnNpb24gc2hvdWxkIHJhbmdlIGZyb20gLTEgdG8gMS5cclxuICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAqL1xyXG5mdW5jdGlvbiB3ZWlnaHRlZFNwbGluZVZlY3RvciggYmVmb3JlVmVjdG9yLCBjdXJyZW50VmVjdG9yLCBhZnRlclZlY3RvciwgdGVuc2lvbiApIHtcclxuICByZXR1cm4gYWZ0ZXJWZWN0b3IuY29weSgpXHJcbiAgICAuc3VidHJhY3QoIGJlZm9yZVZlY3RvciApXHJcbiAgICAubXVsdGlwbHlTY2FsYXIoICggMSAtIHRlbnNpb24gKSAvIDYgKVxyXG4gICAgLmFkZCggY3VycmVudFZlY3RvciApO1xyXG59XHJcblxyXG4vLyBhIG5vcm1hbGl6ZWQgdmVjdG9yIGZvciBub24temVybyB3aW5kaW5nIGNoZWNrc1xyXG4vLyB2YXIgd2VpcmREaXIgPSB2KCBNYXRoLlBJLCAyMiAvIDcgKTtcclxuXHJcbmNsYXNzIFNoYXBlIHtcclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBBbGwgYXJndW1lbnRzIG9wdGlvbmFsLCB0aGV5IGFyZSBmb3IgdGhlIGNvcHkoKSBtZXRob2QuIGlmIHVzZWQsIGVuc3VyZSB0aGF0ICdib3VuZHMnIGlzIGNvbnNpc3RlbnQgd2l0aCAnc3VicGF0aHMnXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxTdWJwYXRoPnxzdHJpbmd9IFtzdWJwYXRoc11cclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IFtib3VuZHNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHN1YnBhdGhzLCBib3VuZHMgKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFN1YnBhdGg+fSBMb3dlci1sZXZlbCBwaWVjZXdpc2UgbWF0aGVtYXRpY2FsIGRlc2NyaXB0aW9uIHVzaW5nIHNlZ21lbnRzLCBhbHNvXHJcbiAgICAvLyBpbmRpdmlkdWFsbHkgaW1tdXRhYmxlXHJcbiAgICB0aGlzLnN1YnBhdGhzID0gW107XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0JvdW5kczJ9IElmIG5vbi1udWxsLCBjb21wdXRlZCBib3VuZHMgZm9yIGFsbCBwaWVjZXMgYWRkZWQgc28gZmFyLiBMYXppbHkgY29tcHV0ZWQgd2l0aFxyXG4gICAgLy8gZ2V0Qm91bmRzL2JvdW5kcyBFUzUgZ2V0dGVyXHJcbiAgICB0aGlzLl9ib3VuZHMgPSBib3VuZHMgPyBib3VuZHMuY29weSgpIDogbnVsbDsgLy8ge0JvdW5kczIgfCBudWxsfVxyXG5cclxuICAgIC8vIEBwdWJsaWMge1RpbnlFbWl0dGVyfVxyXG4gICAgdGhpcy5pbnZhbGlkYXRlZEVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcclxuXHJcbiAgICB0aGlzLnJlc2V0Q29udHJvbFBvaW50cygpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cclxuICAgIHRoaXMuX2ludmFsaWRhdGVMaXN0ZW5lciA9IHRoaXMuaW52YWxpZGF0ZS5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gU28gd2UgY2FuIGludmFsaWRhdGUgYWxsIG9mIHRoZSBwb2ludHMgd2l0aG91dCBmaXJpbmcgaW52YWxpZGF0aW9uIHRvbnMgb2YgdGltZXNcclxuICAgIHRoaXMuX2ludmFsaWRhdGluZ1BvaW50cyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIFdoZW4gc2V0IGJ5IG1ha2VJbW11dGFibGUoKSwgaXQgaW5kaWNhdGVzIHRoaXMgU2hhcGUgd29uJ3QgYmUgY2hhbmdlZCBmcm9tIG5vdyBvbiwgYW5kXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICBhdHRlbXB0cyB0byBjaGFuZ2UgaXQgbWF5IHJlc3VsdCBpbiBlcnJvcnMuXHJcbiAgICB0aGlzLl9pbW11dGFibGUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBBZGQgaW4gc3VicGF0aHMgZnJvbSB0aGUgY29uc3RydWN0b3IgKGlmIGFwcGxpY2FibGUpXHJcbiAgICBpZiAoIHR5cGVvZiBzdWJwYXRocyA9PT0gJ29iamVjdCcgKSB7XHJcbiAgICAgIC8vIGFzc3VtZSBpdCdzIGFuIGFycmF5XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN1YnBhdGhzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIHRoaXMuYWRkU3VicGF0aCggc3VicGF0aHNbIGkgXSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBzdWJwYXRocyAmJiB0eXBlb2Ygc3VicGF0aHMgIT09ICdvYmplY3QnICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygc3VicGF0aHMgPT09ICdzdHJpbmcnLCAnaWYgc3VicGF0aHMgaXMgbm90IGFuIG9iamVjdCwgaXQgbXVzdCBiZSBhIHN0cmluZycgKTtcclxuICAgICAgLy8gcGFyc2UgdGhlIFNWRyBwYXRoXHJcbiAgICAgIF8uZWFjaCggc3ZnUGF0aC5wYXJzZSggc3VicGF0aHMgKSwgaXRlbSA9PiB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggU2hhcGUucHJvdG90eXBlWyBpdGVtLmNtZCBdICE9PSB1bmRlZmluZWQsIGBtZXRob2QgJHtpdGVtLmNtZH0gZnJvbSBwYXJzZWQgU1ZHIGRvZXMgbm90IGV4aXN0YCApO1xyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItc3ByZWFkXHJcbiAgICAgICAgdGhpc1sgaXRlbS5jbWQgXS5hcHBseSggdGhpcywgaXRlbS5hcmdzICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkZWZpbmVzIF9ib3VuZHMgaWYgbm90IGFscmVhZHkgZGVmaW5lZCAoYW1vbmcgb3RoZXIgdGhpbmdzKVxyXG4gICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBjb250cm9sIHBvaW50c1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBmb3IgdHJhY2tpbmcgdGhlIGxhc3QgcXVhZHJhdGljL2N1YmljIGNvbnRyb2wgcG9pbnQgZm9yIHNtb290aCogZnVuY3Rpb25zXHJcbiAgICogc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy8zOFxyXG4gICAqL1xyXG4gIHJlc2V0Q29udHJvbFBvaW50cygpIHtcclxuICAgIHRoaXMubGFzdFF1YWRyYXRpY0NvbnRyb2xQb2ludCA9IG51bGw7XHJcbiAgICB0aGlzLmxhc3RDdWJpY0NvbnRyb2xQb2ludCA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBxdWFkcmF0aWMgY29udHJvbCBwb2ludFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvaW50XHJcbiAgICovXHJcbiAgc2V0UXVhZHJhdGljQ29udHJvbFBvaW50KCBwb2ludCApIHtcclxuICAgIHRoaXMubGFzdFF1YWRyYXRpY0NvbnRyb2xQb2ludCA9IHBvaW50O1xyXG4gICAgdGhpcy5sYXN0Q3ViaWNDb250cm9sUG9pbnQgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgY3ViaWMgY29udHJvbCBwb2ludFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvaW50XHJcbiAgICovXHJcbiAgc2V0Q3ViaWNDb250cm9sUG9pbnQoIHBvaW50ICkge1xyXG4gICAgdGhpcy5sYXN0UXVhZHJhdGljQ29udHJvbFBvaW50ID0gbnVsbDtcclxuICAgIHRoaXMubGFzdEN1YmljQ29udHJvbFBvaW50ID0gcG9pbnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlcyB0byBhIHBvaW50IGdpdmVuIGJ5IHRoZSBjb29yZGluYXRlcyB4IGFuZCB5XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBtb3ZlVG8oIHgsIHkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgeCA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHggKSwgYHggbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgeSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHkgKSwgYHkgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eX1gICk7XHJcbiAgICByZXR1cm4gdGhpcy5tb3ZlVG9Qb2ludCggdiggeCwgeSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlcyBhIHJlbGF0aXZlIGRpc3BsYWNlbWVudCAoeCx5KSBmcm9tIGxhc3QgcG9pbnRcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIG1vdmVUb1JlbGF0aXZlKCB4LCB5ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB4ICksIGB4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3h9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHkgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB5ICksIGB5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3l9YCApO1xyXG4gICAgcmV0dXJuIHRoaXMubW92ZVRvUG9pbnRSZWxhdGl2ZSggdiggeCwgeSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlcyBhIHJlbGF0aXZlIGRpc3BsYWNlbWVudCAocG9pbnQpIGZyb20gbGFzdCBwb2ludFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9pbnQgLSBhIGRpc3BsYWNlbWVudFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBtb3ZlVG9Qb2ludFJlbGF0aXZlKCBwb2ludCApIHtcclxuICAgIHJldHVybiB0aGlzLm1vdmVUb1BvaW50KCB0aGlzLmdldFJlbGF0aXZlUG9pbnQoKS5wbHVzKCBwb2ludCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIHRvIHRoaXMgc2hhcGUgYSBzdWJwYXRoIHRoYXQgbW92ZXMgKG5vIGpvaW50KSBpdCB0byBhIHBvaW50XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb2ludFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBtb3ZlVG9Qb2ludCggcG9pbnQgKSB7XHJcbiAgICB0aGlzLmFkZFN1YnBhdGgoIG5ldyBTdWJwYXRoKCkuYWRkUG9pbnQoIHBvaW50ICkgKTtcclxuICAgIHRoaXMucmVzZXRDb250cm9sUG9pbnRzKCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7IC8vIGZvciBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyB0byB0aGlzIHNoYXBlIGEgc3RyYWlnaHQgbGluZSBmcm9tIGxhc3QgcG9pbnQgdG8gdGhlIGNvb3JkaW5hdGUgKHgseSlcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIGxpbmVUbyggeCwgeSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB4ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggeCApLCBgeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt4fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB5ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggeSApLCBgeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt5fWAgKTtcclxuICAgIHJldHVybiB0aGlzLmxpbmVUb1BvaW50KCB2KCB4LCB5ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgdG8gdGhpcyBzaGFwZSBhIHN0cmFpZ2h0IGxpbmUgZGlzcGxhY2VkIGJ5IGEgcmVsYXRpdmUgYW1vdW50IHgsIGFuZCB5IGZyb20gbGFzdCBwb2ludFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnRcclxuICAgKiBAcGFyYW0ge251bWJlcn0geSAtIHZlcnRpY2FsIGRpc3BsYWNlbWVudFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBsaW5lVG9SZWxhdGl2ZSggeCwgeSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB4ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggeCApLCBgeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt4fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB5ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggeSApLCBgeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt5fWAgKTtcclxuICAgIHJldHVybiB0aGlzLmxpbmVUb1BvaW50UmVsYXRpdmUoIHYoIHgsIHkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyB0byB0aGlzIHNoYXBlIGEgc3RyYWlnaHQgbGluZSBkaXNwbGFjZWQgYnkgYSByZWxhdGl2ZSBkaXNwbGFjZW1lbnQgKHBvaW50KVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9pbnQgLSBhIGRpc3BsYWNlbWVudFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBsaW5lVG9Qb2ludFJlbGF0aXZlKCBwb2ludCApIHtcclxuICAgIHJldHVybiB0aGlzLmxpbmVUb1BvaW50KCB0aGlzLmdldFJlbGF0aXZlUG9pbnQoKS5wbHVzKCBwb2ludCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIHRvIHRoaXMgc2hhcGUgYSBzdHJhaWdodCBsaW5lIGZyb20gdGhpcyBsYXN0UG9pbnQgdG8gcG9pbnRcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvaW50XHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIGxpbmVUb1BvaW50KCBwb2ludCApIHtcclxuICAgIC8vIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi8yZGNvbnRleHQvI2RvbS1jb250ZXh0LTJkLWxpbmV0b1xyXG4gICAgaWYgKCB0aGlzLmhhc1N1YnBhdGhzKCkgKSB7XHJcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5nZXRMYXN0U3VicGF0aCgpLmdldExhc3RQb2ludCgpO1xyXG4gICAgICBjb25zdCBlbmQgPSBwb2ludDtcclxuICAgICAgY29uc3QgbGluZSA9IG5ldyBMaW5lKCBzdGFydCwgZW5kICk7XHJcbiAgICAgIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5hZGRQb2ludCggZW5kICk7XHJcbiAgICAgIHRoaXMuYWRkU2VnbWVudEFuZEJvdW5kcyggbGluZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuZW5zdXJlKCBwb2ludCApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5yZXNldENvbnRyb2xQb2ludHMoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpczsgIC8vIGZvciBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIGhvcml6b250YWwgbGluZSAoeCByZXByZXNlbnRzIHRoZSB4LWNvb3JkaW5hdGUgb2YgdGhlIGVuZCBwb2ludClcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBob3Jpem9udGFsTGluZVRvKCB4ICkge1xyXG4gICAgcmV0dXJuIHRoaXMubGluZVRvKCB4LCB0aGlzLmdldFJlbGF0aXZlUG9pbnQoKS55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgaG9yaXpvbnRhbCBsaW5lICh4IHJlcHJlc2VudCBhIGhvcml6b250YWwgZGlzcGxhY2VtZW50KVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIGhvcml6b250YWxMaW5lVG9SZWxhdGl2ZSggeCApIHtcclxuICAgIHJldHVybiB0aGlzLmxpbmVUb1JlbGF0aXZlKCB4LCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgdmVydGljYWwgbGluZSAoeSByZXByZXNlbnRzIHRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIGVuZCBwb2ludClcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICB2ZXJ0aWNhbExpbmVUbyggeSApIHtcclxuICAgIHJldHVybiB0aGlzLmxpbmVUbyggdGhpcy5nZXRSZWxhdGl2ZVBvaW50KCkueCwgeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIHZlcnRpY2FsIGxpbmUgKHkgcmVwcmVzZW50cyBhIHZlcnRpY2FsIGRpc3BsYWNlbWVudClcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICB2ZXJ0aWNhbExpbmVUb1JlbGF0aXZlKCB5ICkge1xyXG4gICAgcmV0dXJuIHRoaXMubGluZVRvUmVsYXRpdmUoIDAsIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFppZy16YWdzIGJldHdlZW4gdGhlIGN1cnJlbnQgcG9pbnQgYW5kIHRoZSBzcGVjaWZpZWQgcG9pbnRcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZW5kWCAtIHRoZSBlbmQgb2YgdGhlIHNoYXBlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVuZFkgLSB0aGUgZW5kIG9mIHRoZSBzaGFwZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbXBsaXR1ZGUgLSB0aGUgdmVydGljYWwgYW1wbGl0dWRlIG9mIHRoZSB6aWcgemFnIHdhdmVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyWmlnWmFncyAtIHRoZSBudW1iZXIgb2Ygb3NjaWxsYXRpb25zXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBzeW1tZXRyaWNhbCAtIGZsYWcgZm9yIGRyYXdpbmcgYSBzeW1tZXRyaWNhbCB6aWcgemFnXHJcbiAgICovXHJcbiAgemlnWmFnVG8oIGVuZFgsIGVuZFksIGFtcGxpdHVkZSwgbnVtYmVyWmlnWmFncywgc3ltbWV0cmljYWwgKSB7XHJcbiAgICByZXR1cm4gdGhpcy56aWdaYWdUb1BvaW50KCBuZXcgVmVjdG9yMiggZW5kWCwgZW5kWSApLCBhbXBsaXR1ZGUsIG51bWJlclppZ1phZ3MsIHN5bW1ldHJpY2FsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBaaWctemFncyBiZXR3ZWVuIHRoZSBjdXJyZW50IHBvaW50IGFuZCB0aGUgc3BlY2lmaWVkIHBvaW50LlxyXG4gICAqIEltcGxlbWVudGF0aW9uIG1vdmVkIGZyb20gY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbiBvbiBBcHJpbCAyMiwgMjAxOS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGVuZFBvaW50IC0gdGhlIGVuZCBvZiB0aGUgc2hhcGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYW1wbGl0dWRlIC0gdGhlIHZlcnRpY2FsIGFtcGxpdHVkZSBvZiB0aGUgemlnIHphZyB3YXZlLCBzaWduZWQgdG8gY2hvb3NlIGluaXRpYWwgZGlyZWN0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlclppZ1phZ3MgLSB0aGUgbnVtYmVyIG9mIGNvbXBsZXRlIG9zY2lsbGF0aW9uc1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc3ltbWV0cmljYWwgLSBmbGFnIGZvciBkcmF3aW5nIGEgc3ltbWV0cmljYWwgemlnIHphZ1xyXG4gICAqL1xyXG4gIHppZ1phZ1RvUG9pbnQoIGVuZFBvaW50LCBhbXBsaXR1ZGUsIG51bWJlclppZ1phZ3MsIHN5bW1ldHJpY2FsICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG51bWJlclppZ1phZ3MgKSwgYG51bWJlclppZ1phZ3MgbXVzdCBiZSBhbiBpbnRlZ2VyOiAke251bWJlclppZ1phZ3N9YCApO1xyXG5cclxuICAgIHRoaXMuZW5zdXJlKCBlbmRQb2ludCApO1xyXG4gICAgY29uc3Qgc3RhcnRQb2ludCA9IHRoaXMuZ2V0TGFzdFBvaW50KCk7XHJcbiAgICBjb25zdCBkZWx0YSA9IGVuZFBvaW50Lm1pbnVzKCBzdGFydFBvaW50ICk7XHJcbiAgICBjb25zdCBkaXJlY3Rpb25Vbml0VmVjdG9yID0gZGVsdGEubm9ybWFsaXplZCgpO1xyXG4gICAgY29uc3QgYW1wbGl0dWRlTm9ybWFsVmVjdG9yID0gZGlyZWN0aW9uVW5pdFZlY3Rvci5wZXJwZW5kaWN1bGFyLnRpbWVzKCBhbXBsaXR1ZGUgKTtcclxuXHJcbiAgICBsZXQgd2F2ZWxlbmd0aDtcclxuICAgIGlmICggc3ltbWV0cmljYWwgKSB7XHJcbiAgICAgIC8vIHRoZSB3YXZlbGVuZ3RoIGlzIHNob3J0ZXIgdG8gYWRkIGhhbGYgYSB3YXZlLlxyXG4gICAgICB3YXZlbGVuZ3RoID0gZGVsdGEubWFnbml0dWRlIC8gKCBudW1iZXJaaWdaYWdzICsgMC41ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgd2F2ZWxlbmd0aCA9IGRlbHRhLm1hZ25pdHVkZSAvIG51bWJlclppZ1phZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyWmlnWmFnczsgaSsrICkge1xyXG4gICAgICBjb25zdCB3YXZlT3JpZ2luID0gZGlyZWN0aW9uVW5pdFZlY3Rvci50aW1lcyggaSAqIHdhdmVsZW5ndGggKS5wbHVzKCBzdGFydFBvaW50ICk7XHJcbiAgICAgIGNvbnN0IHRvcFBvaW50ID0gd2F2ZU9yaWdpbi5wbHVzKCBkaXJlY3Rpb25Vbml0VmVjdG9yLnRpbWVzKCB3YXZlbGVuZ3RoIC8gNCApICkucGx1cyggYW1wbGl0dWRlTm9ybWFsVmVjdG9yICk7XHJcbiAgICAgIGNvbnN0IGJvdHRvbVBvaW50ID0gd2F2ZU9yaWdpbi5wbHVzKCBkaXJlY3Rpb25Vbml0VmVjdG9yLnRpbWVzKCAzICogd2F2ZWxlbmd0aCAvIDQgKSApLm1pbnVzKCBhbXBsaXR1ZGVOb3JtYWxWZWN0b3IgKTtcclxuICAgICAgdGhpcy5saW5lVG9Qb2ludCggdG9wUG9pbnQgKTtcclxuICAgICAgdGhpcy5saW5lVG9Qb2ludCggYm90dG9tUG9pbnQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhZGQgbGFzdCBoYWxmIG9mIHRoZSB3YXZlbGVuZ3RoXHJcbiAgICBpZiAoIHN5bW1ldHJpY2FsICkge1xyXG4gICAgICBjb25zdCB3YXZlT3JpZ2luID0gZGlyZWN0aW9uVW5pdFZlY3Rvci50aW1lcyggbnVtYmVyWmlnWmFncyAqIHdhdmVsZW5ndGggKS5wbHVzKCBzdGFydFBvaW50ICk7XHJcbiAgICAgIGNvbnN0IHRvcFBvaW50ID0gd2F2ZU9yaWdpbi5wbHVzKCBkaXJlY3Rpb25Vbml0VmVjdG9yLnRpbWVzKCB3YXZlbGVuZ3RoIC8gNCApICkucGx1cyggYW1wbGl0dWRlTm9ybWFsVmVjdG9yICk7XHJcbiAgICAgIHRoaXMubGluZVRvUG9pbnQoIHRvcFBvaW50ICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMubGluZVRvUG9pbnQoIGVuZFBvaW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgcXVhZHJhdGljIGN1cnZlIHRvIHRoaXMgc2hhcGVcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGUgY3VydmUgaXMgZ3VhcmFudGVlZCB0byBwYXNzIHRocm91Z2ggdGhlIGNvb3JkaW5hdGUgKHgseSkgYnV0IGRvZXMgbm90IHBhc3MgdGhyb3VnaCB0aGUgY29udHJvbCBwb2ludFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNweCAtIGNvbnRyb2wgcG9pbnQgaG9yaXpvbnRhbCBjb29yZGluYXRlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNweSAtIGNvbnRyb2wgcG9pbnQgdmVydGljYWwgY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgcXVhZHJhdGljQ3VydmVUbyggY3B4LCBjcHksIHgsIHkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY3B4ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggY3B4ICksIGBjcHggbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7Y3B4fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjcHkgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjcHkgKSwgYGNweSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcHl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB4ICksIGB4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3h9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHkgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB5ICksIGB5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3l9YCApO1xyXG4gICAgcmV0dXJuIHRoaXMucXVhZHJhdGljQ3VydmVUb1BvaW50KCB2KCBjcHgsIGNweSApLCB2KCB4LCB5ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBxdWFkcmF0aWMgY3VydmUgdG8gdGhpcyBzaGFwZS4gVGhlIGNvbnRyb2wgYW5kIGZpbmFsIHBvaW50cyBhcmUgc3BlY2lmaWVkIGFzIGRpc3BsYWNtZW50IGZyb20gdGhlIGxhc3RcclxuICAgKiBwb2ludCBpbiB0aGlzIHNoYXBlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNweCAtIGNvbnRyb2wgcG9pbnQgaG9yaXpvbnRhbCBjb29yZGluYXRlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNweSAtIGNvbnRyb2wgcG9pbnQgdmVydGljYWwgY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gZmluYWwgeCBwb3NpdGlvbiBvZiB0aGUgcXVhZHJhdGljIGN1cnZlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBmaW5hbCB5IHBvc2l0aW9uIG9mIHRoZSBxdWFkcmF0aWMgY3VydmVcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgcXVhZHJhdGljQ3VydmVUb1JlbGF0aXZlKCBjcHgsIGNweSwgeCwgeSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjcHggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjcHggKSwgYGNweCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcHh9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNweSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIGNweSApLCBgY3B5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NweX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgeCA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHggKSwgYHggbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgeSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHkgKSwgYHkgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eX1gICk7XHJcbiAgICByZXR1cm4gdGhpcy5xdWFkcmF0aWNDdXJ2ZVRvUG9pbnRSZWxhdGl2ZSggdiggY3B4LCBjcHkgKSwgdiggeCwgeSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgcXVhZHJhdGljIGN1cnZlIHRvIHRoaXMgc2hhcGUuIFRoZSBjb250cm9sIGFuZCBmaW5hbCBwb2ludHMgYXJlIHNwZWNpZmllZCBhcyBkaXNwbGFjZW1lbnQgZnJvbSB0aGVcclxuICAgKiBsYXN0IHBvaW50IGluIHRoaXMgc2hhcGVcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGNvbnRyb2xQb2ludFxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9pbnQgLSB0aGUgcXVhZHJhdGljIGN1cnZlIHBhc3NlcyB0aHJvdWdoIHRoaXMgcG9pbnRcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgcXVhZHJhdGljQ3VydmVUb1BvaW50UmVsYXRpdmUoIGNvbnRyb2xQb2ludCwgcG9pbnQgKSB7XHJcbiAgICBjb25zdCByZWxhdGl2ZVBvaW50ID0gdGhpcy5nZXRSZWxhdGl2ZVBvaW50KCk7XHJcbiAgICByZXR1cm4gdGhpcy5xdWFkcmF0aWNDdXJ2ZVRvUG9pbnQoIHJlbGF0aXZlUG9pbnQucGx1cyggY29udHJvbFBvaW50ICksIHJlbGF0aXZlUG9pbnQucGx1cyggcG9pbnQgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIHF1YWRyYXRpYyBjdXJ2ZSB0byB0aGlzIHNoYXBlLiBUaGUgcXVhZHJhdGljIGN1cnZlcyBwYXNzZXMgdGhyb3VnaCB0aGUgeCBhbmQgeSBjb29yZGluYXRlLlxyXG4gICAqIFRoZSBzaGFwZSBzaG91bGQgam9pbiBzbW9vdGhseSB3aXRoIHRoZSBwcmV2aW91cyBzdWJwYXRoc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRPRE86IGNvbnNpZGVyIGEgcmVuYW1lIHRvIHB1dCAnc21vb3RoJyBmYXJ0aGVyIGJhY2s/XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geCAtIGZpbmFsIHggcG9zaXRpb24gb2YgdGhlIHF1YWRyYXRpYyBjdXJ2ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gZmluYWwgeSBwb3NpdGlvbiBvZiB0aGUgcXVhZHJhdGljIGN1cnZlXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHNtb290aFF1YWRyYXRpY0N1cnZlVG8oIHgsIHkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgeCA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHggKSwgYHggbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgeSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHkgKSwgYHkgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eX1gICk7XHJcbiAgICByZXR1cm4gdGhpcy5xdWFkcmF0aWNDdXJ2ZVRvUG9pbnQoIHRoaXMuZ2V0U21vb3RoUXVhZHJhdGljQ29udHJvbFBvaW50KCksIHYoIHgsIHkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIHF1YWRyYXRpYyBjdXJ2ZSB0byB0aGlzIHNoYXBlLiBUaGUgcXVhZHJhdGljIGN1cnZlcyBwYXNzZXMgdGhyb3VnaCB0aGUgeCBhbmQgeSBjb29yZGluYXRlLlxyXG4gICAqIFRoZSBzaGFwZSBzaG91bGQgam9pbiBzbW9vdGhseSB3aXRoIHRoZSBwcmV2aW91cyBzdWJwYXRoc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gZmluYWwgeCBwb3NpdGlvbiBvZiB0aGUgcXVhZHJhdGljIGN1cnZlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBmaW5hbCB5IHBvc2l0aW9uIG9mIHRoZSBxdWFkcmF0aWMgY3VydmVcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgc21vb3RoUXVhZHJhdGljQ3VydmVUb1JlbGF0aXZlKCB4LCB5ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB4ICksIGB4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3h9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHkgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB5ICksIGB5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3l9YCApO1xyXG4gICAgcmV0dXJuIHRoaXMucXVhZHJhdGljQ3VydmVUb1BvaW50KCB0aGlzLmdldFNtb290aFF1YWRyYXRpY0NvbnRyb2xQb2ludCgpLCB2KCB4LCB5ICkucGx1cyggdGhpcy5nZXRSZWxhdGl2ZVBvaW50KCkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIHF1YWRyYXRpYyBiZXppZXIgY3VydmUgdG8gdGhpcyBzaGFwZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGNvbnRyb2xQb2ludFxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9pbnQgLSB0aGUgcXVhZHJhdGljIGN1cnZlIHBhc3NlcyB0aHJvdWdoIHRoaXMgcG9pbnRcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgcXVhZHJhdGljQ3VydmVUb1BvaW50KCBjb250cm9sUG9pbnQsIHBvaW50ICkge1xyXG4gICAgLy8gc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSLzJkY29udGV4dC8jZG9tLWNvbnRleHQtMmQtcXVhZHJhdGljY3VydmV0b1xyXG4gICAgdGhpcy5lbnN1cmUoIGNvbnRyb2xQb2ludCApO1xyXG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmdldExhc3RTdWJwYXRoKCkuZ2V0TGFzdFBvaW50KCk7XHJcbiAgICBjb25zdCBxdWFkcmF0aWMgPSBuZXcgUXVhZHJhdGljKCBzdGFydCwgY29udHJvbFBvaW50LCBwb2ludCApO1xyXG4gICAgdGhpcy5nZXRMYXN0U3VicGF0aCgpLmFkZFBvaW50KCBwb2ludCApO1xyXG4gICAgY29uc3Qgbm9uZGVnZW5lcmF0ZVNlZ21lbnRzID0gcXVhZHJhdGljLmdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cygpO1xyXG4gICAgXy5lYWNoKCBub25kZWdlbmVyYXRlU2VnbWVudHMsIHNlZ21lbnQgPT4ge1xyXG4gICAgICAvLyBUT0RPOiBvcHRpbWl6YXRpb25cclxuICAgICAgdGhpcy5hZGRTZWdtZW50QW5kQm91bmRzKCBzZWdtZW50ICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnNldFF1YWRyYXRpY0NvbnRyb2xQb2ludCggY29udHJvbFBvaW50ICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7ICAvLyBmb3IgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBjdWJpYyBiZXppZXIgY3VydmUgdG8gdGhpcyBzaGFwZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gY3AxeCAtIGNvbnRyb2wgcG9pbnQgMSwgIGhvcml6b250YWwgY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjcDF5IC0gY29udHJvbCBwb2ludCAxLCAgdmVydGljYWwgY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjcDJ4IC0gY29udHJvbCBwb2ludCAyLCAgaG9yaXpvbnRhbCBjb29yZGluYXRlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNwMnkgLSBjb250cm9sIHBvaW50IDIsICB2ZXJ0aWNhbCBjb29yZGluYXRlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBmaW5hbCB4IHBvc2l0aW9uIG9mIHRoZSBjdWJpYyBjdXJ2ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gZmluYWwgeSBwb3NpdGlvbiBvZiB0aGUgY3ViaWMgY3VydmVcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgY3ViaWNDdXJ2ZVRvKCBjcDF4LCBjcDF5LCBjcDJ4LCBjcDJ5LCB4LCB5ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNwMXggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjcDF4ICksIGBjcDF4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NwMXh9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNwMXkgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjcDF5ICksIGBjcDF5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NwMXl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNwMnggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjcDJ4ICksIGBjcDJ4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NwMnh9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNwMnkgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjcDJ5ICksIGBjcDJ5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NwMnl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB4ICksIGB4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3h9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHkgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB5ICksIGB5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3l9YCApO1xyXG4gICAgcmV0dXJuIHRoaXMuY3ViaWNDdXJ2ZVRvUG9pbnQoIHYoIGNwMXgsIGNwMXkgKSwgdiggY3AyeCwgY3AyeSApLCB2KCB4LCB5ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjcDF4IC0gY29udHJvbCBwb2ludCAxLCAgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gY3AxeSAtIGNvbnRyb2wgcG9pbnQgMSwgIHZlcnRpY2FsIGRpc3BsYWNlbWVudFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjcDJ4IC0gY29udHJvbCBwb2ludCAyLCAgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gY3AyeSAtIGNvbnRyb2wgcG9pbnQgMiwgIHZlcnRpY2FsIGRpc3BsYWNlbWVudFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gZmluYWwgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnRcclxuICAgKiBAcGFyYW0ge251bWJlcn0geSAtIGZpbmFsIHZlcnRpY2FsIGRpc3BsYWNtZW50XHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIGN1YmljQ3VydmVUb1JlbGF0aXZlKCBjcDF4LCBjcDF5LCBjcDJ4LCBjcDJ5LCB4LCB5ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNwMXggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjcDF4ICksIGBjcDF4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NwMXh9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNwMXkgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjcDF5ICksIGBjcDF5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NwMXl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNwMnggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjcDJ4ICksIGBjcDJ4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NwMnh9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNwMnkgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjcDJ5ICksIGBjcDJ5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NwMnl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB4ICksIGB4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3h9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHkgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB5ICksIGB5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3l9YCApO1xyXG4gICAgcmV0dXJuIHRoaXMuY3ViaWNDdXJ2ZVRvUG9pbnRSZWxhdGl2ZSggdiggY3AxeCwgY3AxeSApLCB2KCBjcDJ4LCBjcDJ5ICksIHYoIHgsIHkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBjb250cm9sMSAtIGNvbnRyb2wgZGlzcGxhY2VtZW50ICAxXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBjb250cm9sMiAtIGNvbnRyb2wgZGlzcGxhY2VtZW50IDJcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvaW50IC0gZmluYWwgZGlzcGxhY2VtZW50XHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIGN1YmljQ3VydmVUb1BvaW50UmVsYXRpdmUoIGNvbnRyb2wxLCBjb250cm9sMiwgcG9pbnQgKSB7XHJcbiAgICBjb25zdCByZWxhdGl2ZVBvaW50ID0gdGhpcy5nZXRSZWxhdGl2ZVBvaW50KCk7XHJcbiAgICByZXR1cm4gdGhpcy5jdWJpY0N1cnZlVG9Qb2ludCggcmVsYXRpdmVQb2ludC5wbHVzKCBjb250cm9sMSApLCByZWxhdGl2ZVBvaW50LnBsdXMoIGNvbnRyb2wyICksIHJlbGF0aXZlUG9pbnQucGx1cyggcG9pbnQgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNwMnggLSBjb250cm9sIHBvaW50IDIsICBob3Jpem9udGFsIGNvb3JkaW5hdGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gY3AyeSAtIGNvbnRyb2wgcG9pbnQgMiwgIHZlcnRpY2FsIGNvb3JkaW5hdGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHNtb290aEN1YmljQ3VydmVUbyggY3AyeCwgY3AyeSwgeCwgeSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjcDJ4ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggY3AyeCApLCBgY3AyeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcDJ4fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjcDJ5ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggY3AyeSApLCBgY3AyeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcDJ5fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB4ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggeCApLCBgeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt4fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB5ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggeSApLCBgeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt5fWAgKTtcclxuICAgIHJldHVybiB0aGlzLmN1YmljQ3VydmVUb1BvaW50KCB0aGlzLmdldFNtb290aEN1YmljQ29udHJvbFBvaW50KCksIHYoIGNwMngsIGNwMnkgKSwgdiggeCwgeSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gY3AyeCAtIGNvbnRyb2wgcG9pbnQgMiwgIGhvcml6b250YWwgY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjcDJ5IC0gY29udHJvbCBwb2ludCAyLCAgdmVydGljYWwgY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgc21vb3RoQ3ViaWNDdXJ2ZVRvUmVsYXRpdmUoIGNwMngsIGNwMnksIHgsIHkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY3AyeCA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIGNwMnggKSwgYGNwMnggbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7Y3AyeH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY3AyeSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIGNwMnkgKSwgYGNwMnkgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7Y3AyeX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgeCA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHggKSwgYHggbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgeSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHkgKSwgYHkgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eX1gICk7XHJcbiAgICByZXR1cm4gdGhpcy5jdWJpY0N1cnZlVG9Qb2ludCggdGhpcy5nZXRTbW9vdGhDdWJpY0NvbnRyb2xQb2ludCgpLCB2KCBjcDJ4LCBjcDJ5ICkucGx1cyggdGhpcy5nZXRSZWxhdGl2ZVBvaW50KCkgKSwgdiggeCwgeSApLnBsdXMoIHRoaXMuZ2V0UmVsYXRpdmVQb2ludCgpICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gY29udHJvbDFcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGNvbnRyb2wyXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb2ludFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBjdWJpY0N1cnZlVG9Qb2ludCggY29udHJvbDEsIGNvbnRyb2wyLCBwb2ludCApIHtcclxuICAgIC8vIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi8yZGNvbnRleHQvI2RvbS1jb250ZXh0LTJkLXF1YWRyYXRpY2N1cnZldG9cclxuICAgIHRoaXMuZW5zdXJlKCBjb250cm9sMSApO1xyXG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmdldExhc3RTdWJwYXRoKCkuZ2V0TGFzdFBvaW50KCk7XHJcbiAgICBjb25zdCBjdWJpYyA9IG5ldyBDdWJpYyggc3RhcnQsIGNvbnRyb2wxLCBjb250cm9sMiwgcG9pbnQgKTtcclxuXHJcbiAgICBjb25zdCBub25kZWdlbmVyYXRlU2VnbWVudHMgPSBjdWJpYy5nZXROb25kZWdlbmVyYXRlU2VnbWVudHMoKTtcclxuICAgIF8uZWFjaCggbm9uZGVnZW5lcmF0ZVNlZ21lbnRzLCBzZWdtZW50ID0+IHtcclxuICAgICAgdGhpcy5hZGRTZWdtZW50QW5kQm91bmRzKCBzZWdtZW50ICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmdldExhc3RTdWJwYXRoKCkuYWRkUG9pbnQoIHBvaW50ICk7XHJcblxyXG4gICAgdGhpcy5zZXRDdWJpY0NvbnRyb2xQb2ludCggY29udHJvbDIgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpczsgIC8vIGZvciBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNlbnRlclggLSBob3Jpem9udGFsIGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgYXJjXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNlbnRlclkgLSBDZW50ZXIgb2YgdGhlIGFyY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgLSBIb3cgZmFyIGZyb20gdGhlIGNlbnRlciB0aGUgYXJjIHdpbGwgYmVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRBbmdsZSAtIEFuZ2xlIChyYWRpYW5zKSBvZiB0aGUgc3RhcnQgb2YgdGhlIGFyY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlbmRBbmdsZSAtIEFuZ2xlIChyYWRpYW5zKSBvZiB0aGUgZW5kIG9mIHRoZSBhcmNcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthbnRpY2xvY2t3aXNlXSAtIERlY2lkZXMgd2hpY2ggZGlyZWN0aW9uIHRoZSBhcmMgdGFrZXMgYXJvdW5kIHRoZSBjZW50ZXJcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgYXJjKCBjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBhbnRpY2xvY2t3aXNlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNlbnRlclggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjZW50ZXJYICksIGBjZW50ZXJYIG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NlbnRlclh9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNlbnRlclkgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjZW50ZXJZICksIGBjZW50ZXJZIG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NlbnRlcll9YCApO1xyXG4gICAgcmV0dXJuIHRoaXMuYXJjUG9pbnQoIHYoIGNlbnRlclgsIGNlbnRlclkgKSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBjZW50ZXIgLSBDZW50ZXIgb2YgdGhlIGFyYyAoZXZlcnkgcG9pbnQgb24gdGhlIGFyYyBpcyBlcXVhbGx5IGZhciBmcm9tIHRoZSBjZW50ZXIpXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyAtIEhvdyBmYXIgZnJvbSB0aGUgY2VudGVyIHRoZSBhcmMgd2lsbCBiZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydEFuZ2xlIC0gQW5nbGUgKHJhZGlhbnMpIG9mIHRoZSBzdGFydCBvZiB0aGUgYXJjXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVuZEFuZ2xlIC0gQW5nbGUgKHJhZGlhbnMpIG9mIHRoZSBlbmQgb2YgdGhlIGFyY1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2FudGljbG9ja3dpc2VdIC0gRGVjaWRlcyB3aGljaCBkaXJlY3Rpb24gdGhlIGFyYyB0YWtlcyBhcm91bmQgdGhlIGNlbnRlclxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBhcmNQb2ludCggY2VudGVyLCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBhbnRpY2xvY2t3aXNlICkge1xyXG4gICAgLy8gc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSLzJkY29udGV4dC8jZG9tLWNvbnRleHQtMmQtYXJjXHJcbiAgICBpZiAoIGFudGljbG9ja3dpc2UgPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgYW50aWNsb2Nrd2lzZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFyYyA9IG5ldyBBcmMoIGNlbnRlciwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApO1xyXG5cclxuICAgIC8vIHdlIGFyZSBhc3N1bWluZyB0aGF0IHRoZSBub3JtYWwgY29uZGl0aW9ucyB3ZXJlIGFscmVhZHkgbWV0IChvciBleGNlcHRpb25lZCBvdXQpIHNvIHRoYXQgdGhlc2UgYWN0dWFsbHkgd29yayB3aXRoIGNhbnZhc1xyXG4gICAgY29uc3Qgc3RhcnRQb2ludCA9IGFyYy5nZXRTdGFydCgpO1xyXG4gICAgY29uc3QgZW5kUG9pbnQgPSBhcmMuZ2V0RW5kKCk7XHJcblxyXG4gICAgLy8gaWYgdGhlcmUgaXMgYWxyZWFkeSBhIHBvaW50IG9uIHRoZSBzdWJwYXRoLCBhbmQgaXQgaXMgZGlmZmVyZW50IHRoYW4gb3VyIHN0YXJ0aW5nIHBvaW50LCBkcmF3IGEgbGluZSBiZXR3ZWVuIHRoZW1cclxuICAgIGlmICggdGhpcy5oYXNTdWJwYXRocygpICYmIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5nZXRMZW5ndGgoKSA+IDAgJiYgIXN0YXJ0UG9pbnQuZXF1YWxzKCB0aGlzLmdldExhc3RTdWJwYXRoKCkuZ2V0TGFzdFBvaW50KCksIDAgKSApIHtcclxuICAgICAgdGhpcy5hZGRTZWdtZW50QW5kQm91bmRzKCBuZXcgTGluZSggdGhpcy5nZXRMYXN0U3VicGF0aCgpLmdldExhc3RQb2ludCgpLCBzdGFydFBvaW50ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoICF0aGlzLmhhc1N1YnBhdGhzKCkgKSB7XHJcbiAgICAgIHRoaXMuYWRkU3VicGF0aCggbmV3IFN1YnBhdGgoKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRlY2huaWNhbGx5IHRoZSBDYW52YXMgc3BlYyBzYXlzIHRvIGFkZCB0aGUgc3RhcnQgcG9pbnQsIHNvIHdlIGRvIHRoaXMgZXZlbiB0aG91Z2ggaXQgaXMgcHJvYmFibHkgY29tcGxldGVseSB1bm5lY2Vzc2FyeSAodGhlcmUgaXMgbm8gY29uZGl0aW9uYWwpXHJcbiAgICB0aGlzLmdldExhc3RTdWJwYXRoKCkuYWRkUG9pbnQoIHN0YXJ0UG9pbnQgKTtcclxuICAgIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5hZGRQb2ludCggZW5kUG9pbnQgKTtcclxuXHJcbiAgICB0aGlzLmFkZFNlZ21lbnRBbmRCb3VuZHMoIGFyYyApO1xyXG4gICAgdGhpcy5yZXNldENvbnRyb2xQb2ludHMoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpczsgIC8vIGZvciBjaGFpbmluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBlbGxpcHRpY2FsIGFyY1xyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjZW50ZXJYIC0gaG9yaXpvbnRhbCBjb29yZGluYXRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIGFyY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjZW50ZXJZIC0gIHZlcnRpY2FsIGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgYXJjXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1c1ggLSBzZW1pIGF4aXNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzWSAtIHNlbWkgYXhpc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByb3RhdGlvbiAtIHJvdGF0aW9uIG9mIHRoZSBlbGxpcHRpY2FsIGFyYyB3aXRoIHJlc3BlY3QgdG8gdGhlIHBvc2l0aXZlIHggYXhpcy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRBbmdsZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlbmRBbmdsZVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2FudGljbG9ja3dpc2VdXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIGVsbGlwdGljYWxBcmMoIGNlbnRlclgsIGNlbnRlclksIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjZW50ZXJYID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggY2VudGVyWCApLCBgY2VudGVyWCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjZW50ZXJYfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjZW50ZXJZID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggY2VudGVyWSApLCBgY2VudGVyWSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjZW50ZXJZfWAgKTtcclxuICAgIHJldHVybiB0aGlzLmVsbGlwdGljYWxBcmNQb2ludCggdiggY2VudGVyWCwgY2VudGVyWSApLCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGFudGljbG9ja3dpc2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYW4gZWxsaXB0aWMgYXJjXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBjZW50ZXJcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXNZXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJvdGF0aW9uIC0gcm90YXRpb24gb2YgdGhlIGFyYyB3aXRoIHJlc3BlY3QgdG8gdGhlIHBvc2l0aXZlIHggYXhpcy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRBbmdsZSAtXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVuZEFuZ2xlXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBbYW50aWNsb2Nrd2lzZV1cclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgZWxsaXB0aWNhbEFyY1BvaW50KCBjZW50ZXIsIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApIHtcclxuICAgIC8vIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi8yZGNvbnRleHQvI2RvbS1jb250ZXh0LTJkLWFyY1xyXG4gICAgaWYgKCBhbnRpY2xvY2t3aXNlID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgIGFudGljbG9ja3dpc2UgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBlbGxpcHRpY2FsQXJjID0gbmV3IEVsbGlwdGljYWxBcmMoIGNlbnRlciwgcmFkaXVzWCwgcmFkaXVzWSwgcm90YXRpb24sIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBhbnRpY2xvY2t3aXNlICk7XHJcblxyXG4gICAgLy8gd2UgYXJlIGFzc3VtaW5nIHRoYXQgdGhlIG5vcm1hbCBjb25kaXRpb25zIHdlcmUgYWxyZWFkeSBtZXQgKG9yIGV4Y2VwdGlvbmVkIG91dCkgc28gdGhhdCB0aGVzZSBhY3R1YWxseSB3b3JrIHdpdGggY2FudmFzXHJcbiAgICBjb25zdCBzdGFydFBvaW50ID0gZWxsaXB0aWNhbEFyYy5zdGFydDtcclxuICAgIGNvbnN0IGVuZFBvaW50ID0gZWxsaXB0aWNhbEFyYy5lbmQ7XHJcblxyXG4gICAgLy8gaWYgdGhlcmUgaXMgYWxyZWFkeSBhIHBvaW50IG9uIHRoZSBzdWJwYXRoLCBhbmQgaXQgaXMgZGlmZmVyZW50IHRoYW4gb3VyIHN0YXJ0aW5nIHBvaW50LCBkcmF3IGEgbGluZSBiZXR3ZWVuIHRoZW1cclxuICAgIGlmICggdGhpcy5oYXNTdWJwYXRocygpICYmIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5nZXRMZW5ndGgoKSA+IDAgJiYgIXN0YXJ0UG9pbnQuZXF1YWxzKCB0aGlzLmdldExhc3RTdWJwYXRoKCkuZ2V0TGFzdFBvaW50KCksIDAgKSApIHtcclxuICAgICAgdGhpcy5hZGRTZWdtZW50QW5kQm91bmRzKCBuZXcgTGluZSggdGhpcy5nZXRMYXN0U3VicGF0aCgpLmdldExhc3RQb2ludCgpLCBzdGFydFBvaW50ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoICF0aGlzLmhhc1N1YnBhdGhzKCkgKSB7XHJcbiAgICAgIHRoaXMuYWRkU3VicGF0aCggbmV3IFN1YnBhdGgoKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRlY2huaWNhbGx5IHRoZSBDYW52YXMgc3BlYyBzYXlzIHRvIGFkZCB0aGUgc3RhcnQgcG9pbnQsIHNvIHdlIGRvIHRoaXMgZXZlbiB0aG91Z2ggaXQgaXMgcHJvYmFibHkgY29tcGxldGVseSB1bm5lY2Vzc2FyeSAodGhlcmUgaXMgbm8gY29uZGl0aW9uYWwpXHJcbiAgICB0aGlzLmdldExhc3RTdWJwYXRoKCkuYWRkUG9pbnQoIHN0YXJ0UG9pbnQgKTtcclxuICAgIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5hZGRQb2ludCggZW5kUG9pbnQgKTtcclxuXHJcbiAgICB0aGlzLmFkZFNlZ21lbnRBbmRCb3VuZHMoIGVsbGlwdGljYWxBcmMgKTtcclxuICAgIHRoaXMucmVzZXRDb250cm9sUG9pbnRzKCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7ICAvLyBmb3IgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBzdWJwYXRoIHRoYXQgam9pbnMgdGhlIGxhc3QgcG9pbnQgb2YgdGhpcyBzaGFwZSB0byB0aGUgZmlyc3QgcG9pbnQgdG8gZm9ybSBhIGNsb3NlZCBzaGFwZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBjbG9zZSgpIHtcclxuICAgIGlmICggdGhpcy5oYXNTdWJwYXRocygpICkge1xyXG4gICAgICBjb25zdCBwcmV2aW91c1BhdGggPSB0aGlzLmdldExhc3RTdWJwYXRoKCk7XHJcbiAgICAgIGNvbnN0IG5leHRQYXRoID0gbmV3IFN1YnBhdGgoKTtcclxuXHJcbiAgICAgIHByZXZpb3VzUGF0aC5jbG9zZSgpO1xyXG4gICAgICB0aGlzLmFkZFN1YnBhdGgoIG5leHRQYXRoICk7XHJcbiAgICAgIG5leHRQYXRoLmFkZFBvaW50KCBwcmV2aW91c1BhdGguZ2V0Rmlyc3RQb2ludCgpICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnJlc2V0Q29udHJvbFBvaW50cygpO1xyXG4gICAgcmV0dXJuIHRoaXM7ICAvLyBmb3IgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmVzIHRvIHRoZSBuZXh0IHN1YnBhdGgsIGJ1dCB3aXRob3V0IGFkZGluZyBhbnkgcG9pbnRzIHRvIGl0IChsaWtlIGEgbW92ZVRvIHdvdWxkIGRvKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHBhcnRpY3VsYXJseSBoZWxwZnVsIGZvciBjYXNlcyB3aGVyZSB5b3UgZG9uJ3Qgd2FudCB0byBoYXZlIHRvIGNvbXB1dGUgdGhlIGV4cGxpY2l0IHN0YXJ0aW5nIHBvaW50IG9mXHJcbiAgICogdGhlIG5leHQgc3VicGF0aC4gRm9yIGluc3RhbmNlLCBpZiB5b3Ugd2FudCB0aHJlZSBkaXNjb25uZWN0ZWQgY2lyY2xlczpcclxuICAgKiAtIHNoYXBlLmNpcmNsZSggNTAsIDUwLCAyMCApLm5ld1N1YnBhdGgoKS5jaXJjbGUoIDEwMCwgMTAwLCAyMCApLm5ld1N1YnBhdGgoKS5jaXJjbGUoIDE1MCwgNTAsIDIwIClcclxuICAgKlxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzIgZm9yIG1vcmUgaW5mby5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBuZXdTdWJwYXRoKCkge1xyXG4gICAgdGhpcy5hZGRTdWJwYXRoKCBuZXcgU3VicGF0aCgpICk7XHJcbiAgICB0aGlzLnJlc2V0Q29udHJvbFBvaW50cygpO1xyXG5cclxuICAgIHJldHVybiB0aGlzOyAvLyBmb3IgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1ha2VzIHRoaXMgU2hhcGUgaW1tdXRhYmxlLCBzbyB0aGF0IGF0dGVtcHRzIHRvIGZ1cnRoZXIgY2hhbmdlIHRoZSBTaGFwZSB3aWxsIGZhaWwuIFRoaXMgYWxsb3dzIGNsaWVudHMgdG8gYXZvaWRcclxuICAgKiBhZGRpbmcgY2hhbmdlIGxpc3RlbmVycyB0byB0aGlzIFNoYXBlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX0gLSBTZWxmLCBmb3IgY2hhaW5pbmdcclxuICAgKi9cclxuICBtYWtlSW1tdXRhYmxlKCkge1xyXG4gICAgdGhpcy5faW1tdXRhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLm5vdGlmeUludmFsaWRhdGlvbkxpc3RlbmVycygpO1xyXG5cclxuICAgIHJldHVybiB0aGlzOyAvLyBmb3IgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIFNoYXBlIGlzIGltbXV0YWJsZSAoc2VlIG1ha2VJbW11dGFibGUgZm9yIGRldGFpbHMpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzSW1tdXRhYmxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ltbXV0YWJsZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hdGNoZXMgU1ZHJ3MgZWxsaXB0aWNhbCBhcmMgZnJvbSBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvcGF0aHMuaHRtbFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFdBUk5JTkc6IHJvdGF0aW9uIChmb3Igbm93KSBpcyBpbiBERUdSRUVTLiBUaGlzIHdpbGwgcHJvYmFibHkgY2hhbmdlIGluIHRoZSBmdXR1cmUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzWCAtIFNlbWktbWFqb3IgYXhpcyBzaXplXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1c1kgLSBTZW1pLW1pbm9yIGF4aXMgc2l6ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByb3RhdGlvbiAtIFJvdGF0aW9uIG9mIHRoZSBlbGxpcHNlIChpdHMgc2VtaS1tYWpvciBheGlzKVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gbGFyZ2VBcmMgLSBXaGV0aGVyIHRoZSBhcmMgd2lsbCBnbyB0aGUgbG9uZ2VzdCByb3V0ZSBhcm91bmQgdGhlIGVsbGlwc2UuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBzd2VlcCAtIFdoZXRoZXIgdGhlIGFyYyBtYWRlIGdvZXMgZnJvbSBzdGFydCB0byBlbmQgXCJjbG9ja3dpc2VcIiAob3Bwb3NpdGUgb2YgYW50aWNsb2Nrd2lzZSBmbGFnKVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gRW5kIHBvaW50IFggcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0geSAtIEVuZCBwb2ludCBZIHBvc2l0aW9uXHJcbiAgICogQHJldHVybnMge1NoYXBlfSAtIHRoaXMgU2hhcGUgZm9yIGNoYWluaW5nXHJcbiAgICovXHJcbiAgZWxsaXB0aWNhbEFyY1RvUmVsYXRpdmUoIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uLCBsYXJnZUFyYywgc3dlZXAsIHgsIHkgKSB7XHJcbiAgICBjb25zdCByZWxhdGl2ZVBvaW50ID0gdGhpcy5nZXRSZWxhdGl2ZVBvaW50KCk7XHJcbiAgICByZXR1cm4gdGhpcy5lbGxpcHRpY2FsQXJjVG8oIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uLCBsYXJnZUFyYywgc3dlZXAsIHggKyByZWxhdGl2ZVBvaW50LngsIHkgKyByZWxhdGl2ZVBvaW50LnkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hdGNoZXMgU1ZHJ3MgZWxsaXB0aWNhbCBhcmMgZnJvbSBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvcGF0aHMuaHRtbFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFdBUk5JTkc6IHJvdGF0aW9uIChmb3Igbm93KSBpcyBpbiBERUdSRUVTLiBUaGlzIHdpbGwgcHJvYmFibHkgY2hhbmdlIGluIHRoZSBmdXR1cmUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzWCAtIFNlbWktbWFqb3IgYXhpcyBzaXplXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1c1kgLSBTZW1pLW1pbm9yIGF4aXMgc2l6ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByb3RhdGlvbiAtIFJvdGF0aW9uIG9mIHRoZSBlbGxpcHNlIChpdHMgc2VtaS1tYWpvciBheGlzKVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gbGFyZ2VBcmMgLSBXaGV0aGVyIHRoZSBhcmMgd2lsbCBnbyB0aGUgbG9uZ2VzdCByb3V0ZSBhcm91bmQgdGhlIGVsbGlwc2UuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBzd2VlcCAtIFdoZXRoZXIgdGhlIGFyYyBtYWRlIGdvZXMgZnJvbSBzdGFydCB0byBlbmQgXCJjbG9ja3dpc2VcIiAob3Bwb3NpdGUgb2YgYW50aWNsb2Nrd2lzZSBmbGFnKVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gRW5kIHBvaW50IFggcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0geSAtIEVuZCBwb2ludCBZIHBvc2l0aW9uXHJcbiAgICogQHJldHVybnMge1NoYXBlfSAtIHRoaXMgU2hhcGUgZm9yIGNoYWluaW5nXHJcbiAgICovXHJcbiAgZWxsaXB0aWNhbEFyY1RvKCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiwgbGFyZ2VBcmMsIHN3ZWVwLCB4LCB5ICkge1xyXG4gICAgLy8gU2VlIFwiRi42LjUgQ29udmVyc2lvbiBmcm9tIGVuZHBvaW50IHRvIGNlbnRlciBwYXJhbWV0ZXJpemF0aW9uXCJcclxuICAgIC8vIGluIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9TVkcvaW1wbG5vdGUuaHRtbCNBcmNJbXBsZW1lbnRhdGlvbk5vdGVzXHJcblxyXG4gICAgY29uc3QgZW5kUG9pbnQgPSBuZXcgVmVjdG9yMiggeCwgeSApO1xyXG4gICAgdGhpcy5lbnN1cmUoIGVuZFBvaW50ICk7XHJcblxyXG4gICAgY29uc3Qgc3RhcnRQb2ludCA9IHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5nZXRMYXN0UG9pbnQoKTtcclxuICAgIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5hZGRQb2ludCggZW5kUG9pbnQgKTtcclxuXHJcbiAgICAvLyBBYnNvbHV0ZSB2YWx1ZSBhcHBsaWVkIHRvIHJhZGlpIChwZXIgU1ZHIHNwZWMpXHJcbiAgICBpZiAoIHJhZGl1c1ggPCAwICkgeyByYWRpdXNYICo9IC0xLjA7IH1cclxuICAgIGlmICggcmFkaXVzWSA8IDAgKSB7IHJhZGl1c1kgKj0gLTEuMDsgfVxyXG5cclxuICAgIGxldCByeHMgPSByYWRpdXNYICogcmFkaXVzWDtcclxuICAgIGxldCByeXMgPSByYWRpdXNZICogcmFkaXVzWTtcclxuICAgIGNvbnN0IHByaW1lID0gc3RhcnRQb2ludC5taW51cyggZW5kUG9pbnQgKS5kaXZpZGVkU2NhbGFyKCAyICkucm90YXRlZCggLXJvdGF0aW9uICk7XHJcbiAgICBjb25zdCBweHMgPSBwcmltZS54ICogcHJpbWUueDtcclxuICAgIGNvbnN0IHB5cyA9IHByaW1lLnkgKiBwcmltZS55O1xyXG4gICAgbGV0IGNlbnRlclByaW1lID0gbmV3IFZlY3RvcjIoIHJhZGl1c1ggKiBwcmltZS55IC8gcmFkaXVzWSwgLXJhZGl1c1kgKiBwcmltZS54IC8gcmFkaXVzWCApO1xyXG5cclxuICAgIC8vIElmIHRoZSByYWRpaSBhcmUgbm90IGxhcmdlIGVub3VnaCB0byBhY2NvbW9kYXRlIHRoZSBzdGFydC9lbmQgcG9pbnQsIGFwcGx5IEYuNi42IGNvcnJlY3Rpb25cclxuICAgIGNvbnN0IHNpemUgPSBweHMgLyByeHMgKyBweXMgLyByeXM7XHJcbiAgICBpZiAoIHNpemUgPiAxICkge1xyXG4gICAgICByYWRpdXNYICo9IE1hdGguc3FydCggc2l6ZSApO1xyXG4gICAgICByYWRpdXNZICo9IE1hdGguc3FydCggc2l6ZSApO1xyXG5cclxuICAgICAgLy8gcmVkbyBzb21lIGNvbXB1dGF0aW9ucyBmcm9tIGFib3ZlXHJcbiAgICAgIHJ4cyA9IHJhZGl1c1ggKiByYWRpdXNYO1xyXG4gICAgICByeXMgPSByYWRpdXNZICogcmFkaXVzWTtcclxuICAgICAgY2VudGVyUHJpbWUgPSBuZXcgVmVjdG9yMiggcmFkaXVzWCAqIHByaW1lLnkgLyByYWRpdXNZLCAtcmFkaXVzWSAqIHByaW1lLnggLyByYWRpdXNYICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTmFtaW5nIG1hdGNoZXMgaHR0cHM6Ly93d3cudzMub3JnL1RSL1NWRy9pbXBsbm90ZS5odG1sI0FyY0ltcGxlbWVudGF0aW9uTm90ZXMgZm9yXHJcbiAgICAvLyBGLjYuNSBDb252ZXJzaW9uIGZyb20gZW5kcG9pbnQgdG8gY2VudGVyIHBhcmFtZXRlcml6YXRpb25cclxuXHJcbiAgICBjZW50ZXJQcmltZS5tdWx0aXBseVNjYWxhciggTWF0aC5zcXJ0KCBNYXRoLm1heCggMCwgKCByeHMgKiByeXMgLSByeHMgKiBweXMgLSByeXMgKiBweHMgKSAvICggcnhzICogcHlzICsgcnlzICogcHhzICkgKSApICk7XHJcbiAgICBpZiAoIGxhcmdlQXJjID09PSBzd2VlcCApIHtcclxuICAgICAgLy8gRnJvbSBzcGVjOiB3aGVyZSB0aGUgKyBzaWduIGlzIGNob3NlbiBpZiBmQSDiiaAgZlMsIGFuZCB0aGUg4oiSIHNpZ24gaXMgY2hvc2VuIGlmIGZBID0gZlMuXHJcbiAgICAgIGNlbnRlclByaW1lLm11bHRpcGx5U2NhbGFyKCAtMSApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgY2VudGVyID0gc3RhcnRQb2ludC5ibGVuZCggZW5kUG9pbnQsIDAuNSApLnBsdXMoIGNlbnRlclByaW1lLnJvdGF0ZWQoIHJvdGF0aW9uICkgKTtcclxuXHJcbiAgICBmdW5jdGlvbiBzaWduZWRBbmdsZSggdSwgdiApIHtcclxuICAgICAgLy8gRnJvbSBzcGVjOiB3aGVyZSB0aGUgwrEgc2lnbiBhcHBlYXJpbmcgaGVyZSBpcyB0aGUgc2lnbiBvZiB1eCB2eSDiiJIgdXkgdnguXHJcbiAgICAgIHJldHVybiAoICggdS54ICogdi55IC0gdS55ICogdi54ICkgPiAwID8gMSA6IC0xICkgKiB1LmFuZ2xlQmV0d2VlbiggdiApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpY3RvciA9IG5ldyBWZWN0b3IyKCAoIHByaW1lLnggLSBjZW50ZXJQcmltZS54ICkgLyByYWRpdXNYLCAoIHByaW1lLnkgLSBjZW50ZXJQcmltZS55ICkgLyByYWRpdXNZICk7XHJcbiAgICBjb25zdCByb3NzID0gbmV3IFZlY3RvcjIoICggLXByaW1lLnggLSBjZW50ZXJQcmltZS54ICkgLyByYWRpdXNYLCAoIC1wcmltZS55IC0gY2VudGVyUHJpbWUueSApIC8gcmFkaXVzWSApO1xyXG4gICAgY29uc3Qgc3RhcnRBbmdsZSA9IHNpZ25lZEFuZ2xlKCBWZWN0b3IyLlhfVU5JVCwgdmljdG9yICk7XHJcbiAgICBsZXQgZGVsdGFBbmdsZSA9IHNpZ25lZEFuZ2xlKCB2aWN0b3IsIHJvc3MgKSAlICggTWF0aC5QSSAqIDIgKTtcclxuXHJcbiAgICAvLyBGcm9tIHNwZWM6XHJcbiAgICAvLyA+IEluIG90aGVyIHdvcmRzLCBpZiBmUyA9IDAgYW5kIHRoZSByaWdodCBzaWRlIG9mIChGLjYuNS42KSBpcyBncmVhdGVyIHRoYW4gMCwgdGhlbiBzdWJ0cmFjdCAzNjDCsCwgd2hlcmVhcyBpZlxyXG4gICAgLy8gPiBmUyA9IDEgYW5kIHRoZSByaWdodCBzaWRlIG9mIChGLjYuNS42KSBpcyBsZXNzIHRoYW4gMCwgdGhlbiBhZGQgMzYwwrAuIEluIGFsbCBvdGhlciBjYXNlcyBsZWF2ZSBpdCBhcyBpcy5cclxuICAgIGlmICggIXN3ZWVwICYmIGRlbHRhQW5nbGUgPiAwICkge1xyXG4gICAgICBkZWx0YUFuZ2xlIC09IE1hdGguUEkgKiAyO1xyXG4gICAgfVxyXG4gICAgaWYgKCBzd2VlcCAmJiBkZWx0YUFuZ2xlIDwgMCApIHtcclxuICAgICAgZGVsdGFBbmdsZSArPSBNYXRoLlBJICogMjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTdGFuZGFyZCBoYW5kbGluZyBvZiBkZWdlbmVyYXRlIHNlZ21lbnRzIChwYXJ0aWN1bGFybHksIGNvbnZlcnRpbmcgZWxsaXB0aWNhbCBhcmNzIHRvIGNpcmN1bGFyIGFyY3MpXHJcbiAgICBjb25zdCBlbGxpcHRpY2FsQXJjID0gbmV3IEVsbGlwdGljYWxBcmMoIGNlbnRlciwgcmFkaXVzWCwgcmFkaXVzWSwgcm90YXRpb24sIHN0YXJ0QW5nbGUsIHN0YXJ0QW5nbGUgKyBkZWx0YUFuZ2xlLCAhc3dlZXAgKTtcclxuICAgIGNvbnN0IG5vbmRlZ2VuZXJhdGVTZWdtZW50cyA9IGVsbGlwdGljYWxBcmMuZ2V0Tm9uZGVnZW5lcmF0ZVNlZ21lbnRzKCk7XHJcbiAgICBfLmVhY2goIG5vbmRlZ2VuZXJhdGVTZWdtZW50cywgc2VnbWVudCA9PiB7XHJcbiAgICAgIHRoaXMuYWRkU2VnbWVudEFuZEJvdW5kcyggc2VnbWVudCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHJhd3MgYSBjaXJjbGUgdXNpbmcgdGhlIGFyYygpIGNhbGwgd2l0aCB0aGUgZm9sbG93aW5nIHBhcmFtZXRlcnM6XHJcbiAgICogY2lyY2xlKCBjZW50ZXIsIHJhZGl1cyApIC8vIGNlbnRlciBpcyBhIFZlY3RvcjJcclxuICAgKiBjaXJjbGUoIGNlbnRlclgsIGNlbnRlclksIHJhZGl1cyApXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfG51bWJlcn0gY2VudGVyWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjZW50ZXJZXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtyYWRpdXNdXHJcbiAgICogQHJldHVybnMge1NoYXBlfSAtIHRoaXMgc2hhcGUgZm9yIGNoYWluaW5nXHJcbiAgICovXHJcbiAgY2lyY2xlKCBjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMgKSB7XHJcbiAgICBpZiAoIHR5cGVvZiBjZW50ZXJYID09PSAnb2JqZWN0JyApIHtcclxuICAgICAgLy8gY2lyY2xlKCBjZW50ZXIsIHJhZGl1cyApXHJcbiAgICAgIGNvbnN0IGNlbnRlciA9IGNlbnRlclg7XHJcbiAgICAgIHJhZGl1cyA9IGNlbnRlclk7XHJcbiAgICAgIHJldHVybiB0aGlzLmFyY1BvaW50KCBjZW50ZXIsIHJhZGl1cywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlICkuY2xvc2UoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY2VudGVyWCA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIGNlbnRlclggKSwgYGNlbnRlclggbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7Y2VudGVyWH1gICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjZW50ZXJZID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggY2VudGVyWSApLCBgY2VudGVyWSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjZW50ZXJZfWAgKTtcclxuXHJcbiAgICAgIC8vIGNpcmNsZSggY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzIClcclxuICAgICAgcmV0dXJuIHRoaXMuYXJjUG9pbnQoIHYoIGNlbnRlclgsIGNlbnRlclkgKSwgcmFkaXVzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UgKS5jbG9zZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHJhd3MgYW4gZWxsaXBzZSB1c2luZyB0aGUgZWxsaXB0aWNhbEFyYygpIGNhbGwgd2l0aCB0aGUgZm9sbG93aW5nIHBhcmFtZXRlcnM6XHJcbiAgICogZWxsaXBzZSggY2VudGVyLCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiApIC8vIGNlbnRlciBpcyBhIFZlY3RvcjJcclxuICAgKiBlbGxpcHNlKCBjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiApXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhlIHJvdGF0aW9uIGlzIGFib3V0IHRoZSBjZW50ZXJYLCBjZW50ZXJZLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ8VmVjdG9yMn0gY2VudGVyWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbY2VudGVyWV1cclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXNZXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJvdGF0aW9uXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIGVsbGlwc2UoIGNlbnRlclgsIGNlbnRlclksIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uICkge1xyXG4gICAgLy8gVE9ETzogc2VwYXJhdGUgaW50byBlbGxpcHNlKCkgYW5kIGVsbGlwc2VQb2ludCgpP1xyXG4gICAgLy8gVE9ETzogRWxsaXBzZS9FbGxpcHRpY2FsQXJjIGhhcyBhIG1lc3Mgb2YgcGFyYW1ldGVycy4gQ29uc2lkZXIgcGFyYW1ldGVyIG9iamVjdCwgb3IgZG91YmxlLWNoZWNrIHBhcmFtZXRlciBoYW5kbGluZ1xyXG4gICAgaWYgKCB0eXBlb2YgY2VudGVyWCA9PT0gJ29iamVjdCcgKSB7XHJcbiAgICAgIC8vIGVsbGlwc2UoIGNlbnRlciwgcmFkaXVzWCwgcmFkaXVzWSwgcm90YXRpb24gKVxyXG4gICAgICBjb25zdCBjZW50ZXIgPSBjZW50ZXJYO1xyXG4gICAgICByb3RhdGlvbiA9IHJhZGl1c1k7XHJcbiAgICAgIHJhZGl1c1kgPSByYWRpdXNYO1xyXG4gICAgICByYWRpdXNYID0gY2VudGVyWTtcclxuICAgICAgcmV0dXJuIHRoaXMuZWxsaXB0aWNhbEFyY1BvaW50KCBjZW50ZXIsIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uIHx8IDAsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSApLmNsb3NlKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNlbnRlclggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjZW50ZXJYICksIGBjZW50ZXJYIG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NlbnRlclh9YCApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY2VudGVyWSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIGNlbnRlclkgKSwgYGNlbnRlclkgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7Y2VudGVyWX1gICk7XHJcblxyXG4gICAgICAvLyBlbGxpcHNlKCBjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiApXHJcbiAgICAgIHJldHVybiB0aGlzLmVsbGlwdGljYWxBcmNQb2ludCggdiggY2VudGVyWCwgY2VudGVyWSApLCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiB8fCAwLCAwLCBNYXRoLlBJICogMiwgZmFsc2UgKS5jbG9zZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHJlY3RhbmdsZSBzaGFwZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gbGVmdCBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gYm90dG9tIHBvc2l0aW9uIChpbiBub24gaW52ZXJ0ZWQgY2FydGVzaWFuIHN5c3RlbSlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHJlY3QoIHgsIHksIHdpZHRoLCBoZWlnaHQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgeCA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHggKSwgYHggbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgeSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHkgKSwgYHkgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB3aWR0aCApLCBgd2lkdGggbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7d2lkdGh9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGhlaWdodCA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIGhlaWdodCApLCBgaGVpZ2h0IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2hlaWdodH1gICk7XHJcblxyXG4gICAgY29uc3Qgc3VicGF0aCA9IG5ldyBTdWJwYXRoKCk7XHJcbiAgICB0aGlzLmFkZFN1YnBhdGgoIHN1YnBhdGggKTtcclxuICAgIHN1YnBhdGguYWRkUG9pbnQoIHYoIHgsIHkgKSApO1xyXG4gICAgc3VicGF0aC5hZGRQb2ludCggdiggeCArIHdpZHRoLCB5ICkgKTtcclxuICAgIHN1YnBhdGguYWRkUG9pbnQoIHYoIHggKyB3aWR0aCwgeSArIGhlaWdodCApICk7XHJcbiAgICBzdWJwYXRoLmFkZFBvaW50KCB2KCB4LCB5ICsgaGVpZ2h0ICkgKTtcclxuICAgIHRoaXMuYWRkU2VnbWVudEFuZEJvdW5kcyggbmV3IExpbmUoIHN1YnBhdGgucG9pbnRzWyAwIF0sIHN1YnBhdGgucG9pbnRzWyAxIF0gKSApO1xyXG4gICAgdGhpcy5hZGRTZWdtZW50QW5kQm91bmRzKCBuZXcgTGluZSggc3VicGF0aC5wb2ludHNbIDEgXSwgc3VicGF0aC5wb2ludHNbIDIgXSApICk7XHJcbiAgICB0aGlzLmFkZFNlZ21lbnRBbmRCb3VuZHMoIG5ldyBMaW5lKCBzdWJwYXRoLnBvaW50c1sgMiBdLCBzdWJwYXRoLnBvaW50c1sgMyBdICkgKTtcclxuICAgIHN1YnBhdGguY2xvc2UoKTtcclxuICAgIHRoaXMuYWRkU3VicGF0aCggbmV3IFN1YnBhdGgoKSApO1xyXG4gICAgdGhpcy5nZXRMYXN0U3VicGF0aCgpLmFkZFBvaW50KCB2KCB4LCB5ICkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFpc05hTiggdGhpcy5ib3VuZHMuZ2V0WCgpICkgKTtcclxuICAgIHRoaXMucmVzZXRDb250cm9sUG9pbnRzKCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcm91bmQgcmVjdGFuZ2xlLiBBbGwgYXJndW1lbnRzIGFyZSBudW1iZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCAtIHdpZHRoIG9mIHRoZSByZWN0YW5nbGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gaGVpZ2h0IG9mIHRoZSByZWN0YW5nbGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYXJjdyAtIGFyYyB3aWR0aFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhcmNoIC0gYXJjIGhlaWdodFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICByb3VuZFJlY3QoIHgsIHksIHdpZHRoLCBoZWlnaHQsIGFyY3csIGFyY2ggKSB7XHJcbiAgICBjb25zdCBsb3dYID0geCArIGFyY3c7XHJcbiAgICBjb25zdCBoaWdoWCA9IHggKyB3aWR0aCAtIGFyY3c7XHJcbiAgICBjb25zdCBsb3dZID0geSArIGFyY2g7XHJcbiAgICBjb25zdCBoaWdoWSA9IHkgKyBoZWlnaHQgLSBhcmNoO1xyXG4gICAgLy8gaWYgKCB0cnVlICkge1xyXG4gICAgaWYgKCBhcmN3ID09PSBhcmNoICkge1xyXG4gICAgICAvLyB3ZSBjYW4gdXNlIGNpcmN1bGFyIGFyY3MsIHdoaWNoIGhhdmUgd2VsbCBkZWZpbmVkIHN0cm9rZWQgb2Zmc2V0c1xyXG4gICAgICB0aGlzXHJcbiAgICAgICAgLmFyYyggaGlnaFgsIGxvd1ksIGFyY3csIC1NYXRoLlBJIC8gMiwgMCwgZmFsc2UgKVxyXG4gICAgICAgIC5hcmMoIGhpZ2hYLCBoaWdoWSwgYXJjdywgMCwgTWF0aC5QSSAvIDIsIGZhbHNlIClcclxuICAgICAgICAuYXJjKCBsb3dYLCBoaWdoWSwgYXJjdywgTWF0aC5QSSAvIDIsIE1hdGguUEksIGZhbHNlIClcclxuICAgICAgICAuYXJjKCBsb3dYLCBsb3dZLCBhcmN3LCBNYXRoLlBJLCBNYXRoLlBJICogMyAvIDIsIGZhbHNlIClcclxuICAgICAgICAuY2xvc2UoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyB3ZSBoYXZlIHRvIHJlc29ydCB0byBlbGxpcHRpY2FsIGFyY3NcclxuICAgICAgdGhpc1xyXG4gICAgICAgIC5lbGxpcHRpY2FsQXJjKCBoaWdoWCwgbG93WSwgYXJjdywgYXJjaCwgMCwgLU1hdGguUEkgLyAyLCAwLCBmYWxzZSApXHJcbiAgICAgICAgLmVsbGlwdGljYWxBcmMoIGhpZ2hYLCBoaWdoWSwgYXJjdywgYXJjaCwgMCwgMCwgTWF0aC5QSSAvIDIsIGZhbHNlIClcclxuICAgICAgICAuZWxsaXB0aWNhbEFyYyggbG93WCwgaGlnaFksIGFyY3csIGFyY2gsIDAsIE1hdGguUEkgLyAyLCBNYXRoLlBJLCBmYWxzZSApXHJcbiAgICAgICAgLmVsbGlwdGljYWxBcmMoIGxvd1gsIGxvd1ksIGFyY3csIGFyY2gsIDAsIE1hdGguUEksIE1hdGguUEkgKiAzIC8gMiwgZmFsc2UgKVxyXG4gICAgICAgIC5jbG9zZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcG9seWdvbiBmcm9tIGFuIGFycmF5IG9mIHZlcnRpY2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFZlY3RvcjI+fSB2ZXJ0aWNlc1xyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBwb2x5Z29uKCB2ZXJ0aWNlcyApIHtcclxuICAgIGNvbnN0IGxlbmd0aCA9IHZlcnRpY2VzLmxlbmd0aDtcclxuICAgIGlmICggbGVuZ3RoID4gMCApIHtcclxuICAgICAgdGhpcy5tb3ZlVG9Qb2ludCggdmVydGljZXNbIDAgXSApO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBsZW5ndGg7IGkrKyApIHtcclxuICAgICAgICB0aGlzLmxpbmVUb1BvaW50KCB2ZXJ0aWNlc1sgaSBdICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmNsb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgZnVuY3Rpb24gdGhhdCBhbGxvd3MgdG8gZ2VuZXJhdGUgQ2FyZGluYWwgc3BsaW5lc1xyXG4gICAqIGZyb20gYSBwb3NpdGlvbiBhcnJheS4gQ2FyZGluYWwgc3BsaW5lIGRpZmZlcnMgZnJvbSBCZXppZXIgY3VydmVzIGluIHRoYXQgYWxsXHJcbiAgICogZGVmaW5lZCBwb2ludHMgb24gYSBDYXJkaW5hbCBzcGxpbmUgYXJlIG9uIHRoZSBwYXRoIGl0c2VsZi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBJdCBpbmNsdWRlcyBhIHRlbnNpb24gcGFyYW1ldGVyIHRvIGFsbG93IHRoZSBjbGllbnQgdG8gc3BlY2lmeSBob3cgdGlnaHRseVxyXG4gICAqIHRoZSBwYXRoIGludGVycG9sYXRlcyBiZXR3ZWVuIHBvaW50cy4gT25lIGNhbiB0aGluayBvZiB0aGUgdGVuc2lvbiBhcyB0aGUgdGVuc2lvbiBpblxyXG4gICAqIGEgcnViYmVyIGJhbmQgYXJvdW5kIHBlZ3MuIGhvd2V2ZXIgdW5saWtlIGEgcnViYmVyIGJhbmQgdGhlIHRlbnNpb24gY2FuIGJlIG5lZ2F0aXZlLlxyXG4gICAqIHRoZSB0ZW5zaW9uIHJhbmdlcyBmcm9tIC0xIHRvIDFcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFZlY3RvcjI+fSBwb3NpdGlvbnNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gc2VlIGRvY3VtZW50YXRpb24gYmVsb3dcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgY2FyZGluYWxTcGxpbmUoIHBvc2l0aW9ucywgb3B0aW9ucyApIHtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICAvLyB0aGUgdGVuc2lvbiBwYXJhbWV0ZXIgY29udHJvbHMgaG93IHNtb290aGx5IHRoZSBjdXJ2ZSB0dXJucyB0aHJvdWdoIGl0c1xyXG4gICAgICAvLyBjb250cm9sIHBvaW50cy4gRm9yIGEgQ2F0bXVsbC1Sb20gY3VydmUgdGhlIHRlbnNpb24gaXMgemVyby5cclxuICAgICAgLy8gdGhlIHRlbnNpb24gc2hvdWxkIHJhbmdlIGZyb20gIC0xIHRvIDFcclxuICAgICAgdGVuc2lvbjogMCxcclxuXHJcbiAgICAgIC8vIGlzIHRoZSByZXN1bHRpbmcgc2hhcGUgZm9ybWluZyBhIGNsb3NlZCBsaW5lP1xyXG4gICAgICBpc0Nsb3NlZExpbmVTZWdtZW50czogZmFsc2VcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnRlbnNpb24gPCAxICYmIG9wdGlvbnMudGVuc2lvbiA+IC0xLCAnIHRoZSB0ZW5zaW9uIGdvZXMgZnJvbSAtMSB0byAxICcgKTtcclxuXHJcbiAgICBjb25zdCBwb2ludE51bWJlciA9IHBvc2l0aW9ucy5sZW5ndGg7IC8vIG51bWJlciBvZiBwb2ludHMgaW4gdGhlIGFycmF5XHJcblxyXG4gICAgLy8gaWYgdGhlIGxpbmUgaXMgb3BlbiwgdGhlcmUgaXMgb25lIGxlc3Mgc2VnbWVudHMgdGhhbiBwb2ludCB2ZWN0b3JzXHJcbiAgICBjb25zdCBzZWdtZW50TnVtYmVyID0gKCBvcHRpb25zLmlzQ2xvc2VkTGluZVNlZ21lbnRzICkgPyBwb2ludE51bWJlciA6IHBvaW50TnVtYmVyIC0gMTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzZWdtZW50TnVtYmVyOyBpKysgKSB7XHJcbiAgICAgIGxldCBjYXJkaW5hbFBvaW50czsgLy8ge0FycmF5LjxWZWN0b3IyPn0gY2FyZGluYWwgcG9pbnRzIEFycmF5XHJcbiAgICAgIGlmICggaSA9PT0gMCAmJiAhb3B0aW9ucy5pc0Nsb3NlZExpbmVTZWdtZW50cyApIHtcclxuICAgICAgICBjYXJkaW5hbFBvaW50cyA9IFtcclxuICAgICAgICAgIHBvc2l0aW9uc1sgMCBdLFxyXG4gICAgICAgICAgcG9zaXRpb25zWyAwIF0sXHJcbiAgICAgICAgICBwb3NpdGlvbnNbIDEgXSxcclxuICAgICAgICAgIHBvc2l0aW9uc1sgMiBdIF07XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoICggaSA9PT0gc2VnbWVudE51bWJlciAtIDEgKSAmJiAhb3B0aW9ucy5pc0Nsb3NlZExpbmVTZWdtZW50cyApIHtcclxuICAgICAgICBjYXJkaW5hbFBvaW50cyA9IFtcclxuICAgICAgICAgIHBvc2l0aW9uc1sgaSAtIDEgXSxcclxuICAgICAgICAgIHBvc2l0aW9uc1sgaSBdLFxyXG4gICAgICAgICAgcG9zaXRpb25zWyBpICsgMSBdLFxyXG4gICAgICAgICAgcG9zaXRpb25zWyBpICsgMSBdIF07XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY2FyZGluYWxQb2ludHMgPSBbXHJcbiAgICAgICAgICBwb3NpdGlvbnNbICggaSAtIDEgKyBwb2ludE51bWJlciApICUgcG9pbnROdW1iZXIgXSxcclxuICAgICAgICAgIHBvc2l0aW9uc1sgaSAlIHBvaW50TnVtYmVyIF0sXHJcbiAgICAgICAgICBwb3NpdGlvbnNbICggaSArIDEgKSAlIHBvaW50TnVtYmVyIF0sXHJcbiAgICAgICAgICBwb3NpdGlvbnNbICggaSArIDIgKSAlIHBvaW50TnVtYmVyIF0gXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2FyZGluYWwgU3BsaW5lIHRvIEN1YmljIEJlemllciBjb252ZXJzaW9uIG1hdHJpeFxyXG4gICAgICAvLyAgICAwICAgICAgICAgICAgICAgICAxICAgICAgICAgICAgIDAgICAgICAgICAgICAwXHJcbiAgICAgIC8vICAoLTErdGVuc2lvbikvNiAgICAgIDEgICAgICAoMS10ZW5zaW9uKS82ICAgICAgIDBcclxuICAgICAgLy8gICAgMCAgICAgICAgICAgICgxLXRlbnNpb24pLzYgICAgICAxICAgICAgICgtMSt0ZW5zaW9uKS82XHJcbiAgICAgIC8vICAgIDAgICAgICAgICAgICAgICAgIDAgICAgICAgICAgICAgMSAgICAgICAgICAgMFxyXG5cclxuICAgICAgLy8ge0FycmF5LjxWZWN0b3IyPn0gYmV6aWVyIHBvaW50cyBBcnJheVxyXG4gICAgICBjb25zdCBiZXppZXJQb2ludHMgPSBbXHJcbiAgICAgICAgY2FyZGluYWxQb2ludHNbIDEgXSxcclxuICAgICAgICB3ZWlnaHRlZFNwbGluZVZlY3RvciggY2FyZGluYWxQb2ludHNbIDAgXSwgY2FyZGluYWxQb2ludHNbIDEgXSwgY2FyZGluYWxQb2ludHNbIDIgXSwgb3B0aW9ucy50ZW5zaW9uICksXHJcbiAgICAgICAgd2VpZ2h0ZWRTcGxpbmVWZWN0b3IoIGNhcmRpbmFsUG9pbnRzWyAzIF0sIGNhcmRpbmFsUG9pbnRzWyAyIF0sIGNhcmRpbmFsUG9pbnRzWyAxIF0sIG9wdGlvbnMudGVuc2lvbiApLFxyXG4gICAgICAgIGNhcmRpbmFsUG9pbnRzWyAyIF1cclxuICAgICAgXTtcclxuXHJcbiAgICAgIC8vIHNwZWNpYWwgb3BlcmF0aW9ucyBvbiB0aGUgZmlyc3QgcG9pbnRcclxuICAgICAgaWYgKCBpID09PSAwICkge1xyXG4gICAgICAgIHRoaXMuZW5zdXJlKCBiZXppZXJQb2ludHNbIDAgXSApO1xyXG4gICAgICAgIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5hZGRQb2ludCggYmV6aWVyUG9pbnRzWyAwIF0gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5jdWJpY0N1cnZlVG9Qb2ludCggYmV6aWVyUG9pbnRzWyAxIF0sIGJlemllclBvaW50c1sgMiBdLCBiZXppZXJQb2ludHNbIDMgXSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGNvcHkgb2YgdGhpcyBzaGFwZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBjb3B5KCkge1xyXG4gICAgLy8gY29weSBlYWNoIGluZGl2aWR1YWwgc3VicGF0aCwgc28gZnV0dXJlIG1vZGlmaWNhdGlvbnMgdG8gZWl0aGVyIFNoYXBlIGRvZXNuJ3QgYWZmZWN0IHRoZSBvdGhlciBvbmVcclxuICAgIHJldHVybiBuZXcgU2hhcGUoIF8ubWFwKCB0aGlzLnN1YnBhdGhzLCBzdWJwYXRoID0+IHN1YnBhdGguY29weSgpICksIHRoaXMuYm91bmRzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXcml0ZXMgb3V0IHRoaXMgc2hhcGUncyBwYXRoIHRvIGEgY2FudmFzIDJkIGNvbnRleHQuIGRvZXMgTk9UIGluY2x1ZGUgdGhlIGJlZ2luUGF0aCgpIVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0XHJcbiAgICovXHJcbiAgd3JpdGVUb0NvbnRleHQoIGNvbnRleHQgKSB7XHJcbiAgICBjb25zdCBsZW4gPSB0aGlzLnN1YnBhdGhzLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xyXG4gICAgICB0aGlzLnN1YnBhdGhzWyBpIF0ud3JpdGVUb0NvbnRleHQoIGNvbnRleHQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgc29tZXRoaW5nIGxpa2UgXCJNMTUwIDAgTDc1IDIwMCBMMjI1IDIwMCBaXCIgZm9yIGEgdHJpYW5nbGVcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldFNWR1BhdGgoKSB7XHJcbiAgICBsZXQgc3RyaW5nID0gJyc7XHJcbiAgICBjb25zdCBsZW4gPSB0aGlzLnN1YnBhdGhzLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xyXG4gICAgICBjb25zdCBzdWJwYXRoID0gdGhpcy5zdWJwYXRoc1sgaSBdO1xyXG4gICAgICBpZiAoIHN1YnBhdGguaXNEcmF3YWJsZSgpICkge1xyXG4gICAgICAgIC8vIHNpbmNlIHRoZSBjb21tYW5kcyBhZnRlciB0aGlzIGFyZSByZWxhdGl2ZSB0byB0aGUgcHJldmlvdXMgJ3BvaW50Jywgd2UgbmVlZCB0byBzcGVjaWZ5IGEgbW92ZSB0byB0aGUgaW5pdGlhbCBwb2ludFxyXG4gICAgICAgIGNvbnN0IHN0YXJ0UG9pbnQgPSBzdWJwYXRoLnNlZ21lbnRzWyAwIF0uc3RhcnQ7XHJcblxyXG4gICAgICAgIHN0cmluZyArPSBgTSAke3N2Z051bWJlciggc3RhcnRQb2ludC54ICl9ICR7c3ZnTnVtYmVyKCBzdGFydFBvaW50LnkgKX0gYDtcclxuXHJcbiAgICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwgc3VicGF0aC5zZWdtZW50cy5sZW5ndGg7IGsrKyApIHtcclxuICAgICAgICAgIHN0cmluZyArPSBgJHtzdWJwYXRoLnNlZ21lbnRzWyBrIF0uZ2V0U1ZHUGF0aEZyYWdtZW50KCl9IGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIHN1YnBhdGguaXNDbG9zZWQoKSApIHtcclxuICAgICAgICAgIHN0cmluZyArPSAnWiAnO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN0cmluZztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgU2hhcGUgdGhhdCBpcyB0cmFuc2Zvcm1lZCBieSB0aGUgYXNzb2NpYXRlZCBtYXRyaXhcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01hdHJpeDN9IG1hdHJpeFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICB0cmFuc2Zvcm1lZCggbWF0cml4ICkge1xyXG4gICAgLy8gVE9ETzogYWxsb2NhdGlvbiByZWR1Y3Rpb25cclxuICAgIGNvbnN0IHN1YnBhdGhzID0gXy5tYXAoIHRoaXMuc3VicGF0aHMsIHN1YnBhdGggPT4gc3VicGF0aC50cmFuc2Zvcm1lZCggbWF0cml4ICkgKTtcclxuICAgIGNvbnN0IGJvdW5kcyA9IF8ucmVkdWNlKCBzdWJwYXRocywgKCBib3VuZHMsIHN1YnBhdGggKSA9PiBib3VuZHMudW5pb24oIHN1YnBhdGguYm91bmRzICksIEJvdW5kczIuTk9USElORyApO1xyXG4gICAgcmV0dXJuIG5ldyBTaGFwZSggc3VicGF0aHMsIGJvdW5kcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgdGhpcyBzdWJwYXRoIHRvIGEgbmV3IHNoYXBlIG1hZGUgb2YgbWFueSBsaW5lIHNlZ21lbnRzIChhcHByb3hpbWF0aW5nIHRoZSBjdXJyZW50IHNoYXBlKSB3aXRoIHRoZVxyXG4gICAqIHRyYW5zZm9ybWF0aW9uIGFwcGxpZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogUHJvdmlkZWQgb3B0aW9ucyAoc2VlIFNlZ21lbnQubm9ubGluZWFyVHJhbnNmb3JtZWQpXHJcbiAgICogLSBtaW5MZXZlbHM6ICAgICAgICAgICAgICAgICAgICAgICBob3cgbWFueSBsZXZlbHMgdG8gZm9yY2Ugc3ViZGl2aXNpb25zXHJcbiAgICogLSBtYXhMZXZlbHM6ICAgICAgICAgICAgICAgICAgICAgICBwcmV2ZW50IHN1YmRpdmlzaW9uIHBhc3QgdGhpcyBsZXZlbFxyXG4gICAqIC0gZGlzdGFuY2VFcHNpbG9uIChvcHRpb25hbCBudWxsKTogY29udHJvbHMgbGV2ZWwgb2Ygc3ViZGl2aXNpb24gYnkgYXR0ZW1wdGluZyB0byBlbnN1cmUgYSBtYXhpbXVtIChzcXVhcmVkKSBkZXZpYXRpb24gZnJvbSB0aGUgY3VydmUuIHNtYWxsZXIgPT4gbW9yZSBzdWJkaXZpc2lvblxyXG4gICAqIC0gY3VydmVFcHNpbG9uIChvcHRpb25hbCBudWxsKTogICAgY29udHJvbHMgbGV2ZWwgb2Ygc3ViZGl2aXNpb24gYnkgYXR0ZW1wdGluZyB0byBlbnN1cmUgYSBtYXhpbXVtIGN1cnZhdHVyZSBjaGFuZ2UgYmV0d2VlbiBzZWdtZW50cy4gc21hbGxlciA9PiBtb3JlIHN1YmRpdmlzaW9uXHJcbiAgICogLSAgIE9SIGluY2x1ZGVDdXJ2YXR1cmU6ICAgICAgICAgICB7Ym9vbGVhbn0sIHdoZXRoZXIgdG8gaW5jbHVkZSBhIGRlZmF1bHQgY3VydmVFcHNpbG9uICh1c3VhbGx5IG9mZiBieSBkZWZhdWx0KVxyXG4gICAqIC0gcG9pbnRNYXAgKG9wdGlvbmFsKTogICAgICAgICAgICAgZnVuY3Rpb24oIFZlY3RvcjIgKSA6IFZlY3RvcjIsIHJlcHJlc2VudHMgYSAodXN1YWxseSBub24tbGluZWFyKSB0cmFuc2Zvcm1hdGlvbiBhcHBsaWVkXHJcbiAgICogLSBtZXRob2ROYW1lIChvcHRpb25hbCk6ICAgICAgICAgICBpZiB0aGUgbWV0aG9kIG5hbWUgaXMgZm91bmQgb24gdGhlIHNlZ21lbnQsIGl0IGlzIGNhbGxlZCB3aXRoIHRoZSBleHBlY3RlZCBzaWduYXR1cmUgZnVuY3Rpb24oIG9wdGlvbnMgKSA6IEFycmF5W1NlZ21lbnRdXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0ZWFkIG9mIHVzaW5nIG91ciBicnV0ZS1mb3JjZSBsb2dpYy4gU3VwcG9ydHMgb3B0aW1pemF0aW9ucyBmb3IgY3VzdG9tIG5vbi1saW5lYXIgdHJhbnNmb3JtcyAobGlrZSBwb2xhciBjb29yZGluYXRlcylcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIG5vbmxpbmVhclRyYW5zZm9ybWVkKCBvcHRpb25zICkge1xyXG4gICAgLy8gZGVmYXVsdHNcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBtaW5MZXZlbHM6IDAsXHJcbiAgICAgIG1heExldmVsczogNyxcclxuICAgICAgZGlzdGFuY2VFcHNpbG9uOiAwLjE2LCAvLyBOT1RFOiB0aGlzIHdpbGwgY2hhbmdlIHdoZW4gdGhlIFNoYXBlIGlzIHNjYWxlZCwgc2luY2UgdGhpcyBpcyBhIHRocmVzaG9sZCBmb3IgdGhlIHNxdWFyZSBvZiBhIGRpc3RhbmNlIHZhbHVlXHJcbiAgICAgIGN1cnZlRXBzaWxvbjogKCBvcHRpb25zICYmIG9wdGlvbnMuaW5jbHVkZUN1cnZhdHVyZSApID8gMC4wMDIgOiBudWxsXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gVE9ETzogYWxsb2NhdGlvbiByZWR1Y3Rpb25cclxuICAgIGNvbnN0IHN1YnBhdGhzID0gXy5tYXAoIHRoaXMuc3VicGF0aHMsIHN1YnBhdGggPT4gc3VicGF0aC5ub25saW5lYXJUcmFuc2Zvcm1lZCggb3B0aW9ucyApICk7XHJcbiAgICBjb25zdCBib3VuZHMgPSBfLnJlZHVjZSggc3VicGF0aHMsICggYm91bmRzLCBzdWJwYXRoICkgPT4gYm91bmRzLnVuaW9uKCBzdWJwYXRoLmJvdW5kcyApLCBCb3VuZHMyLk5PVEhJTkcgKTtcclxuICAgIHJldHVybiBuZXcgU2hhcGUoIHN1YnBhdGhzLCBib3VuZHMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcHMgcG9pbnRzIGJ5IHRyZWF0aW5nIHRoZWlyIHggY29vcmRpbmF0ZSBhcyBwb2xhciBhbmdsZSwgYW5kIHkgY29vcmRpbmF0ZSBhcyBwb2xhciBtYWduaXR1ZGUuXHJcbiAgICogU2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUG9sYXJfY29vcmRpbmF0ZV9zeXN0ZW1cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBQbGVhc2Ugc2VlIFNoYXBlLm5vbmxpbmVhclRyYW5zZm9ybWVkIGZvciBtb3JlIGRvY3VtZW50YXRpb24gb24gYWRhcHRpdmUgZGlzY3JldGl6YXRpb24gb3B0aW9ucyAobWluTGV2ZWxzLCBtYXhMZXZlbHMsIGRpc3RhbmNlRXBzaWxvbiwgY3VydmVFcHNpbG9uKVxyXG4gICAqXHJcbiAgICogRXhhbXBsZTogQSBsaW5lIGZyb20gKDAsMTApIHRvIChwaSwxMCkgd2lsbCBiZSB0cmFuc2Zvcm1lZCB0byBhIGNpcmN1bGFyIGFyYyBmcm9tICgxMCwwKSB0byAoLTEwLDApIHBhc3NpbmcgdGhyb3VnaCAoMCwxMCkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHBvbGFyVG9DYXJ0ZXNpYW4oIG9wdGlvbnMgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ub25saW5lYXJUcmFuc2Zvcm1lZCggbWVyZ2UoIHtcclxuICAgICAgcG9pbnRNYXA6IHAgPT4gVmVjdG9yMi5jcmVhdGVQb2xhciggcC55LCBwLnggKSxcclxuICAgICAgbWV0aG9kTmFtZTogJ3BvbGFyVG9DYXJ0ZXNpYW4nIC8vIHRoaXMgd2lsbCBiZSBjYWxsZWQgb24gU2VnbWVudHMgaWYgaXQgZXhpc3RzIHRvIGRvIG1vcmUgb3B0aW1pemVkIGNvbnZlcnNpb24gKHNlZSBMaW5lKVxyXG4gICAgfSwgb3B0aW9ucyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyBlYWNoIHNlZ21lbnQgaW50byBsaW5lcywgdXNpbmcgYW4gYWRhcHRpdmUgKG1pZHBvaW50IGRpc3RhbmNlIHN1YmRpdmlzaW9uKSBtZXRob2QuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogTk9URTogdXNlcyBub25saW5lYXJUcmFuc2Zvcm1lZCBtZXRob2QgaW50ZXJuYWxseSwgYnV0IHNpbmNlIHdlIGRvbid0IHByb3ZpZGUgYSBwb2ludE1hcCBvciBtZXRob2ROYW1lLCBpdCB3b24ndCBjcmVhdGUgYW55dGhpbmcgYnV0IGxpbmUgc2VnbWVudHMuXHJcbiAgICogU2VlIG5vbmxpbmVhclRyYW5zZm9ybWVkIGZvciBkb2N1bWVudGF0aW9uIG9mIG9wdGlvbnNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgdG9QaWVjZXdpc2VMaW5lYXIoIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5wb2ludE1hcCwgJ05vIHBvaW50TWFwIGZvciB0b1BpZWNld2lzZUxpbmVhciBhbGxvd2VkLCBzaW5jZSBpdCBjb3VsZCBjcmVhdGUgbm9uLWxpbmVhciBzZWdtZW50cycgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLm1ldGhvZE5hbWUsICdObyBtZXRob2ROYW1lIGZvciB0b1BpZWNld2lzZUxpbmVhciBhbGxvd2VkLCBzaW5jZSBpdCBjb3VsZCBjcmVhdGUgbm9uLWxpbmVhciBzZWdtZW50cycgKTtcclxuICAgIHJldHVybiB0aGlzLm5vbmxpbmVhclRyYW5zZm9ybWVkKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJcyB0aGlzIHBvaW50IGNvbnRhaW5lZCBpbiB0aGlzIHNoYXBlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb2ludFxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGNvbnRhaW5zUG9pbnQoIHBvaW50ICkge1xyXG4gICAgLy8gd2UgcGljayBhIHJheSwgYW5kIGRldGVybWluZSB0aGUgd2luZGluZyBudW1iZXIgb3ZlciB0aGF0IHJheS4gaWYgdGhlIG51bWJlciBvZiBzZWdtZW50cyBjcm9zc2luZyBpdCBDQ1cgPT0gbnVtYmVyIG9mIHNlZ21lbnRzIGNyb3NzaW5nIGl0IENXLCB0aGVuIHRoZSBwb2ludCBpcyBjb250YWluZWQgaW4gdGhlIHNoYXBlXHJcbiAgICBjb25zdCByYXkgPSBuZXcgUmF5MiggcG9pbnQsIFZlY3RvcjIuWF9VTklUICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMud2luZGluZ0ludGVyc2VjdGlvbiggcmF5ICkgIT09IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIaXQtdGVzdHMgdGhpcyBzaGFwZSB3aXRoIHRoZSByYXkuIEFuIGFycmF5IG9mIGFsbCBpbnRlcnNlY3Rpb25zIG9mIHRoZSByYXkgd2l0aCB0aGlzIHNoYXBlIHdpbGwgYmUgcmV0dXJuZWQuXHJcbiAgICogRm9yIGRldGFpbHMsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBpbiBTZWdtZW50LmpzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtSYXkyfSByYXlcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPEludGVyc2VjdGlvbj59IC0gU2VlIFNlZ21lbnQuanMgZm9yIGRldGFpbHMuIEZvciB0aGlzIGZ1bmN0aW9uLCBpbnRlcnNlY3Rpb25zIHdpbGwgYmUgcmV0dXJuZWRcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ydGVkIGJ5IHRoZSBkaXN0YW5jZSBmcm9tIHRoZSByYXkncyBwb3NpdGlvbi5cclxuICAgKi9cclxuICBpbnRlcnNlY3Rpb24oIHJheSApIHtcclxuICAgIGxldCBoaXRzID0gW107XHJcbiAgICBjb25zdCBudW1TdWJwYXRocyA9IHRoaXMuc3VicGF0aHMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU3VicGF0aHM7IGkrKyApIHtcclxuICAgICAgY29uc3Qgc3VicGF0aCA9IHRoaXMuc3VicGF0aHNbIGkgXTtcclxuXHJcbiAgICAgIGlmICggc3VicGF0aC5pc0RyYXdhYmxlKCkgKSB7XHJcbiAgICAgICAgY29uc3QgbnVtU2VnbWVudHMgPSBzdWJwYXRoLnNlZ21lbnRzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCBudW1TZWdtZW50czsgaysrICkge1xyXG4gICAgICAgICAgY29uc3Qgc2VnbWVudCA9IHN1YnBhdGguc2VnbWVudHNbIGsgXTtcclxuICAgICAgICAgIGhpdHMgPSBoaXRzLmNvbmNhdCggc2VnbWVudC5pbnRlcnNlY3Rpb24oIHJheSApICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIHN1YnBhdGguaGFzQ2xvc2luZ1NlZ21lbnQoKSApIHtcclxuICAgICAgICAgIGhpdHMgPSBoaXRzLmNvbmNhdCggc3VicGF0aC5nZXRDbG9zaW5nU2VnbWVudCgpLmludGVyc2VjdGlvbiggcmF5ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBfLnNvcnRCeSggaGl0cywgaGl0ID0+IGhpdC5kaXN0YW5jZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBwcm92aWRlZCBsaW5lIHNlZ21lbnQgd291bGQgaGF2ZSBzb21lIHBhcnQgb24gdG9wIG9yIHRvdWNoaW5nIHRoZSBpbnRlcmlvciAoZmlsbGVkIGFyZWEpIG9mXHJcbiAgICogdGhpcyBzaGFwZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGRpZmZlcnMgc29tZXdoYXQgZnJvbSBhbiBpbnRlcnNlY3Rpb24gb2YgdGhlIGxpbmUgc2VnbWVudCB3aXRoIHRoZSBTaGFwZSdzIHBhdGgsIGFzIHdlIHdpbGwgcmV0dXJuIHRydWVcclxuICAgKiAoXCJpbnRlcnNlY3Rpb25cIikgaWYgdGhlIGxpbmUgc2VnbWVudCBpcyBlbnRpcmVseSBjb250YWluZWQgaW4gdGhlIGludGVyaW9yIG9mIHRoZSBTaGFwZSdzIHBhdGguXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHN0YXJ0UG9pbnQgLSBPbmUgZW5kIG9mIHRoZSBsaW5lIHNlZ21lbnRcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGVuZFBvaW50IC0gVGhlIG90aGVyIGVuZCBvZiB0aGUgbGluZSBzZWdtZW50XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaW50ZXJpb3JJbnRlcnNlY3RzTGluZVNlZ21lbnQoIHN0YXJ0UG9pbnQsIGVuZFBvaW50ICkge1xyXG4gICAgLy8gRmlyc3QgY2hlY2sgaWYgb3VyIG1pZHBvaW50IGlzIGluIHRoZSBTaGFwZSAoYXMgZWl0aGVyIG91ciBtaWRwb2ludCBpcyBpbiB0aGUgU2hhcGUsIE9SIHRoZSBsaW5lIHNlZ21lbnQgd2lsbFxyXG4gICAgLy8gaW50ZXJzZWN0IHRoZSBTaGFwZSdzIGJvdW5kYXJ5IHBhdGgpLlxyXG4gICAgY29uc3QgbWlkcG9pbnQgPSBzdGFydFBvaW50LmJsZW5kKCBlbmRQb2ludCwgMC41ICk7XHJcbiAgICBpZiAoIHRoaXMuY29udGFpbnNQb2ludCggbWlkcG9pbnQgKSApIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogaWYgYW4gaXNzdWUsIHdlIGNhbiByZWR1Y2UgdGhpcyBhbGxvY2F0aW9uIHRvIGEgc2NyYXRjaCB2YXJpYWJsZSBsb2NhbCBpbiB0aGUgU2hhcGUuanMgc2NvcGUuXHJcbiAgICBjb25zdCBkZWx0YSA9IGVuZFBvaW50Lm1pbnVzKCBzdGFydFBvaW50ICk7XHJcbiAgICBjb25zdCBsZW5ndGggPSBkZWx0YS5tYWduaXR1ZGU7XHJcblxyXG4gICAgaWYgKCBsZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkZWx0YS5ub3JtYWxpemUoKTsgLy8gc28gd2UgY2FuIHVzZSBpdCBhcyBhIHVuaXQgdmVjdG9yLCBleHBlY3RlZCBieSB0aGUgUmF5XHJcblxyXG4gICAgLy8gR3JhYiBhbGwgaW50ZXJzZWN0aW9ucyAodGhhdCBhcmUgZnJvbSBzdGFydFBvaW50IHRvd2FyZHMgdGhlIGRpcmVjdGlvbiBvZiBlbmRQb2ludClcclxuICAgIGNvbnN0IGhpdHMgPSB0aGlzLmludGVyc2VjdGlvbiggbmV3IFJheTIoIHN0YXJ0UG9pbnQsIGRlbHRhICkgKTtcclxuXHJcbiAgICAvLyBTZWUgaWYgd2UgaGF2ZSBhbnkgaW50ZXJzZWN0aW9ucyBhbG9uZyBvdXIgaW5maW5pdGUgcmF5IHdob3NlIGRpc3RhbmNlIGZyb20gdGhlIHN0YXJ0UG9pbnQgaXMgbGVzcyB0aGFuIG9yXHJcbiAgICAvLyBlcXVhbCB0byBvdXIgbGluZSBzZWdtZW50J3MgbGVuZ3RoLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgaGl0cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCBoaXRzWyBpIF0uZGlzdGFuY2UgPD0gbGVuZ3RoICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGlkIG5vdCBoaXQgdGhlIGJvdW5kYXJ5LCBhbmQgd2Fzbid0IGZ1bGx5IGNvbnRhaW5lZC5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHdpbmRpbmcgbnVtYmVyIGZvciBpbnRlcnNlY3Rpb24gd2l0aCBhIHJheVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UmF5Mn0gcmF5XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICB3aW5kaW5nSW50ZXJzZWN0aW9uKCByYXkgKSB7XHJcbiAgICBsZXQgd2luZCA9IDA7XHJcblxyXG4gICAgY29uc3QgbnVtU3VicGF0aHMgPSB0aGlzLnN1YnBhdGhzLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bVN1YnBhdGhzOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHN1YnBhdGggPSB0aGlzLnN1YnBhdGhzWyBpIF07XHJcblxyXG4gICAgICBpZiAoIHN1YnBhdGguaXNEcmF3YWJsZSgpICkge1xyXG4gICAgICAgIGNvbnN0IG51bVNlZ21lbnRzID0gc3VicGF0aC5zZWdtZW50cy5sZW5ndGg7XHJcbiAgICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwgbnVtU2VnbWVudHM7IGsrKyApIHtcclxuICAgICAgICAgIHdpbmQgKz0gc3VicGF0aC5zZWdtZW50c1sgayBdLndpbmRpbmdJbnRlcnNlY3Rpb24oIHJheSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaGFuZGxlIHRoZSBpbXBsaWNpdCBjbG9zaW5nIGxpbmUgc2VnbWVudFxyXG4gICAgICAgIGlmICggc3VicGF0aC5oYXNDbG9zaW5nU2VnbWVudCgpICkge1xyXG4gICAgICAgICAgd2luZCArPSBzdWJwYXRoLmdldENsb3NpbmdTZWdtZW50KCkud2luZGluZ0ludGVyc2VjdGlvbiggcmF5ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHdpbmQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSBwYXRoIG9mIHRoZSBTaGFwZSBpbnRlcnNlY3RzIChvciBpcyBjb250YWluZWQgaW4pIHRoZSBwcm92aWRlZCBib3VuZGluZyBib3guXHJcbiAgICogQ29tcHV0ZWQgYnkgY2hlY2tpbmcgaW50ZXJzZWN0aW9ucyB3aXRoIGFsbCBmb3VyIGVkZ2VzIG9mIHRoZSBib3VuZGluZyBib3gsIG9yIHdoZXRoZXIgdGhlIFNoYXBlIGlzIHRvdGFsbHlcclxuICAgKiBjb250YWluZWQgd2l0aGluIHRoZSBib3VuZGluZyBib3guXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBib3VuZHNcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpbnRlcnNlY3RzQm91bmRzKCBib3VuZHMgKSB7XHJcbiAgICAvLyBJZiB0aGUgYm91bmRpbmcgYm94IGNvbXBsZXRlbHkgc3Vycm91bmRzIG91ciBzaGFwZSwgaXQgaW50ZXJzZWN0cyB0aGUgYm91bmRzXHJcbiAgICBpZiAoIHRoaXMuYm91bmRzLmludGVyc2VjdGlvbiggYm91bmRzICkuZXF1YWxzKCB0aGlzLmJvdW5kcyApICkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByYXlzIGZvciBoaXQgdGVzdGluZyBhbG9uZyB0aGUgYm91bmRpbmcgYm94IGVkZ2VzXHJcbiAgICBjb25zdCBtaW5Ib3Jpem9udGFsUmF5ID0gbmV3IFJheTIoIG5ldyBWZWN0b3IyKCBib3VuZHMubWluWCwgYm91bmRzLm1pblkgKSwgbmV3IFZlY3RvcjIoIDEsIDAgKSApO1xyXG4gICAgY29uc3QgbWluVmVydGljYWxSYXkgPSBuZXcgUmF5MiggbmV3IFZlY3RvcjIoIGJvdW5kcy5taW5YLCBib3VuZHMubWluWSApLCBuZXcgVmVjdG9yMiggMCwgMSApICk7XHJcbiAgICBjb25zdCBtYXhIb3Jpem9udGFsUmF5ID0gbmV3IFJheTIoIG5ldyBWZWN0b3IyKCBib3VuZHMubWF4WCwgYm91bmRzLm1heFkgKSwgbmV3IFZlY3RvcjIoIC0xLCAwICkgKTtcclxuICAgIGNvbnN0IG1heFZlcnRpY2FsUmF5ID0gbmV3IFJheTIoIG5ldyBWZWN0b3IyKCBib3VuZHMubWF4WCwgYm91bmRzLm1heFkgKSwgbmV3IFZlY3RvcjIoIDAsIC0xICkgKTtcclxuXHJcbiAgICBsZXQgaGl0UG9pbnQ7XHJcbiAgICBsZXQgaTtcclxuICAgIC8vIFRPRE86IGNvdWxkIG9wdGltaXplIHRvIGludGVyc2VjdCBkaWZmZXJlbnRseSBzbyB3ZSBiYWlsIHNvb25lclxyXG4gICAgY29uc3QgaG9yaXpvbnRhbFJheUludGVyc2VjdGlvbnMgPSB0aGlzLmludGVyc2VjdGlvbiggbWluSG9yaXpvbnRhbFJheSApLmNvbmNhdCggdGhpcy5pbnRlcnNlY3Rpb24oIG1heEhvcml6b250YWxSYXkgKSApO1xyXG4gICAgZm9yICggaSA9IDA7IGkgPCBob3Jpem9udGFsUmF5SW50ZXJzZWN0aW9ucy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaGl0UG9pbnQgPSBob3Jpem9udGFsUmF5SW50ZXJzZWN0aW9uc1sgaSBdLnBvaW50O1xyXG4gICAgICBpZiAoIGhpdFBvaW50LnggPj0gYm91bmRzLm1pblggJiYgaGl0UG9pbnQueCA8PSBib3VuZHMubWF4WCApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZlcnRpY2FsUmF5SW50ZXJzZWN0aW9ucyA9IHRoaXMuaW50ZXJzZWN0aW9uKCBtaW5WZXJ0aWNhbFJheSApLmNvbmNhdCggdGhpcy5pbnRlcnNlY3Rpb24oIG1heFZlcnRpY2FsUmF5ICkgKTtcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgdmVydGljYWxSYXlJbnRlcnNlY3Rpb25zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBoaXRQb2ludCA9IHZlcnRpY2FsUmF5SW50ZXJzZWN0aW9uc1sgaSBdLnBvaW50O1xyXG4gICAgICBpZiAoIGhpdFBvaW50LnkgPj0gYm91bmRzLm1pblkgJiYgaGl0UG9pbnQueSA8PSBib3VuZHMubWF4WSApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIG5vdCBjb250YWluZWQsIGFuZCBubyBpbnRlcnNlY3Rpb25zIHdpdGggdGhlIHNpZGVzIG9mIHRoZSBib3VuZGluZyBib3hcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgU2hhcGUgdGhhdCBpcyBhbiBvdXRsaW5lIG9mIHRoZSBzdHJva2VkIHBhdGggb2YgdGhpcyBjdXJyZW50IFNoYXBlLiBjdXJyZW50bHkgbm90IGludGVuZGVkIHRvIGJlXHJcbiAgICogbmVzdGVkIChkb2Vzbid0IGRvIGludGVyc2VjdGlvbiBjb21wdXRhdGlvbnMgeWV0KVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRPRE86IHJlbmFtZSBzdHJva2VkKCBsaW5lU3R5bGVzICk/XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0xpbmVTdHlsZXN9IGxpbmVTdHlsZXNcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgZ2V0U3Ryb2tlZFNoYXBlKCBsaW5lU3R5bGVzICkge1xyXG4gICAgbGV0IHN1YnBhdGhzID0gW107XHJcbiAgICBjb25zdCBib3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xyXG4gICAgbGV0IHN1YkxlbiA9IHRoaXMuc3VicGF0aHMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3ViTGVuOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHN1YnBhdGggPSB0aGlzLnN1YnBhdGhzWyBpIF07XHJcbiAgICAgIGNvbnN0IHN0cm9rZWRTdWJwYXRoID0gc3VicGF0aC5zdHJva2VkKCBsaW5lU3R5bGVzICk7XHJcbiAgICAgIHN1YnBhdGhzID0gc3VicGF0aHMuY29uY2F0KCBzdHJva2VkU3VicGF0aCApO1xyXG4gICAgfVxyXG4gICAgc3ViTGVuID0gc3VicGF0aHMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3ViTGVuOyBpKysgKSB7XHJcbiAgICAgIGJvdW5kcy5pbmNsdWRlQm91bmRzKCBzdWJwYXRoc1sgaSBdLmJvdW5kcyApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBTaGFwZSggc3VicGF0aHMsIGJvdW5kcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhIHNoYXBlIG9mZnNldCBieSBhIGNlcnRhaW4gYW1vdW50LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZVxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBnZXRPZmZzZXRTaGFwZSggZGlzdGFuY2UgKSB7XHJcbiAgICAvLyBUT0RPOiBhYnN0cmFjdCBhd2F5IHRoaXMgdHlwZSBvZiBiZWhhdmlvclxyXG4gICAgY29uc3Qgc3VicGF0aHMgPSBbXTtcclxuICAgIGNvbnN0IGJvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XHJcbiAgICBsZXQgc3ViTGVuID0gdGhpcy5zdWJwYXRocy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdWJMZW47IGkrKyApIHtcclxuICAgICAgc3VicGF0aHMucHVzaCggdGhpcy5zdWJwYXRoc1sgaSBdLm9mZnNldCggZGlzdGFuY2UgKSApO1xyXG4gICAgfVxyXG4gICAgc3ViTGVuID0gc3VicGF0aHMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3ViTGVuOyBpKysgKSB7XHJcbiAgICAgIGJvdW5kcy5pbmNsdWRlQm91bmRzKCBzdWJwYXRoc1sgaSBdLmJvdW5kcyApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBTaGFwZSggc3VicGF0aHMsIGJvdW5kcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGNvcHkgb2YgdGhpcyBzdWJwYXRoIHdpdGggdGhlIGRhc2ggXCJob2xlc1wiIHJlbW92ZWQgKGhhcyBtYW55IHN1YnBhdGhzIHVzdWFsbHkpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPG51bWJlcj59IGxpbmVEYXNoXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxpbmVEYXNoT2Zmc2V0XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBnZXREYXNoZWRTaGFwZSggbGluZURhc2gsIGxpbmVEYXNoT2Zmc2V0LCBvcHRpb25zICkge1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIC8vIGNvbnRyb2xzIGxldmVsIG9mIHN1YmRpdmlzaW9uIGJ5IGF0dGVtcHRpbmcgdG8gZW5zdXJlIGEgbWF4aW11bSAoc3F1YXJlZCkgZGV2aWF0aW9uIGZyb20gdGhlIGN1cnZlXHJcbiAgICAgIGRpc3RhbmNlRXBzaWxvbjogMWUtMTAsXHJcblxyXG4gICAgICAvLyBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gY3VydmF0dXJlIGNoYW5nZSBiZXR3ZWVuIHNlZ21lbnRzXHJcbiAgICAgIGN1cnZlRXBzaWxvbjogMWUtOFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiBuZXcgU2hhcGUoIF8uZmxhdHRlbiggdGhpcy5zdWJwYXRocy5tYXAoIHN1YnBhdGggPT4gc3VicGF0aC5kYXNoZWQoIGxpbmVEYXNoLCBsaW5lRGFzaE9mZnNldCwgb3B0aW9ucy5kaXN0YW5jZUVwc2lsb24sIG9wdGlvbnMuY3VydmVFcHNpbG9uICkgKSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBib3VuZHMgb2YgdGhpcyBzaGFwZS4gSXQgaXMgdGhlIGJvdW5kaW5nLWJveCB1bmlvbiBvZiB0aGUgYm91bmRzIG9mIGVhY2ggc3VicGF0aCBjb250YWluZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge0JvdW5kczJ9XHJcbiAgICovXHJcbiAgZ2V0Qm91bmRzKCkge1xyXG4gICAgaWYgKCB0aGlzLl9ib3VuZHMgPT09IG51bGwgKSB7XHJcbiAgICAgIGNvbnN0IGJvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XHJcbiAgICAgIF8uZWFjaCggdGhpcy5zdWJwYXRocywgc3VicGF0aCA9PiB7XHJcbiAgICAgICAgYm91bmRzLmluY2x1ZGVCb3VuZHMoIHN1YnBhdGguZ2V0Qm91bmRzKCkgKTtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLl9ib3VuZHMgPSBib3VuZHM7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fYm91bmRzO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGJvdW5kcygpIHsgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYm91bmRzIGZvciBhIHN0cm9rZWQgdmVyc2lvbiBvZiB0aGlzIHNoYXBlLiBUaGUgaW5wdXQgbGluZVN0eWxlcyBhcmUgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHNpemUgYW5kXHJcbiAgICogc3R5bGUgb2YgdGhlIHN0cm9rZSwgYW5kIHRoZW4gdGhlIGJvdW5kcyBvZiB0aGUgc3Ryb2tlZCBzaGFwZSBhcmUgcmV0dXJuZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtMaW5lU3R5bGVzfSBsaW5lU3R5bGVzXHJcbiAgICogQHJldHVybnMge0JvdW5kczJ9XHJcbiAgICovXHJcbiAgZ2V0U3Ryb2tlZEJvdW5kcyggbGluZVN0eWxlcyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpbmVTdHlsZXMgaW5zdGFuY2VvZiBMaW5lU3R5bGVzICk7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgYWxsIG9mIG91ciBzZWdtZW50cyBlbmQgdmVydGljYWxseSBvciBob3Jpem9udGFsbHkgQU5EIG91ciBkcmF3YWJsZSBzdWJwYXRocyBhcmUgYWxsIGNsb3NlZC4gSWYgc28sXHJcbiAgICAvLyB3ZSBjYW4gYXBwbHkgYSBib3VuZHMgZGlsYXRpb24uXHJcbiAgICBsZXQgYXJlU3Ryb2tlZEJvdW5kc0RpbGF0ZWQgPSB0cnVlO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJwYXRocy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgc3VicGF0aCA9IHRoaXMuc3VicGF0aHNbIGkgXTtcclxuXHJcbiAgICAgIC8vIElmIGEgc3VicGF0aCB3aXRoIGFueSBzZWdtZW50cyBpcyBOT1QgY2xvc2VkLCBsaW5lLWNhcHMgd2lsbCBhcHBseS4gV2UgY2FuJ3QgbWFrZSB0aGUgc2ltcGxpZmljYXRpb24gaW4gdGhpc1xyXG4gICAgICAvLyBjYXNlLlxyXG4gICAgICBpZiAoIHN1YnBhdGguaXNEcmF3YWJsZSgpICYmICFzdWJwYXRoLmlzQ2xvc2VkKCkgKSB7XHJcbiAgICAgICAgYXJlU3Ryb2tlZEJvdW5kc0RpbGF0ZWQgPSBmYWxzZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBzdWJwYXRoLnNlZ21lbnRzLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgIGNvbnN0IHNlZ21lbnQgPSBzdWJwYXRoLnNlZ21lbnRzWyBqIF07XHJcbiAgICAgICAgaWYgKCAhc2VnbWVudC5hcmVTdHJva2VkQm91bmRzRGlsYXRlZCgpICkge1xyXG4gICAgICAgICAgYXJlU3Ryb2tlZEJvdW5kc0RpbGF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggYXJlU3Ryb2tlZEJvdW5kc0RpbGF0ZWQgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmJvdW5kcy5kaWxhdGVkKCBsaW5lU3R5bGVzLmxpbmVXaWR0aCAvIDIgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb25zdCBib3VuZHMgPSB0aGlzLmJvdW5kcy5jb3B5KCk7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuc3VicGF0aHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3Qgc3VicGF0aHMgPSB0aGlzLnN1YnBhdGhzWyBpIF0uc3Ryb2tlZCggbGluZVN0eWxlcyApO1xyXG4gICAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHN1YnBhdGhzLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgICAgYm91bmRzLmluY2x1ZGVCb3VuZHMoIHN1YnBhdGhzWyBqIF0uYm91bmRzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBib3VuZHM7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc2ltcGxpZmllZCBmb3JtIG9mIHRoaXMgc2hhcGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogUnVucyBpdCB0aHJvdWdoIHRoZSBub3JtYWwgQ0FHIHByb2Nlc3MsIHdoaWNoIHNob3VsZCBjb21iaW5lIGFyZWFzIHdoZXJlIHBvc3NpYmxlLCBoYW5kbGVzIHNlbGYtaW50ZXJzZWN0aW9uLFxyXG4gICAqIGV0Yy5cclxuICAgKlxyXG4gICAqIE5PVEU6IEN1cnJlbnRseSAoMjAxNy0xMC0wNCkgYWRqYWNlbnQgc2VnbWVudHMgbWF5IGdldCBzaW1wbGlmaWVkIG9ubHkgaWYgdGhleSBhcmUgbGluZXMuIE5vdCB5ZXQgY29tcGxldGUuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgZ2V0U2ltcGxpZmllZEFyZWFTaGFwZSgpIHtcclxuICAgIHJldHVybiBHcmFwaC5zaW1wbGlmeU5vblplcm8oIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4M30gbWF0cml4XHJcbiAgICogQHBhcmFtIHtMaW5lU3R5bGVzfSBbbGluZVN0eWxlc11cclxuICAgKiBAcmV0dXJucyB7Qm91bmRzMn1cclxuICAgKi9cclxuICBnZXRCb3VuZHNXaXRoVHJhbnNmb3JtKCBtYXRyaXgsIGxpbmVTdHlsZXMgKSB7XHJcbiAgICBjb25zdCBib3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xyXG5cclxuICAgIGNvbnN0IG51bVN1YnBhdGhzID0gdGhpcy5zdWJwYXRocy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1TdWJwYXRoczsgaSsrICkge1xyXG4gICAgICBjb25zdCBzdWJwYXRoID0gdGhpcy5zdWJwYXRoc1sgaSBdO1xyXG4gICAgICBib3VuZHMuaW5jbHVkZUJvdW5kcyggc3VicGF0aC5nZXRCb3VuZHNXaXRoVHJhbnNmb3JtKCBtYXRyaXggKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggbGluZVN0eWxlcyApIHtcclxuICAgICAgYm91bmRzLmluY2x1ZGVCb3VuZHMoIHRoaXMuZ2V0U3Ryb2tlZFNoYXBlKCBsaW5lU3R5bGVzICkuZ2V0Qm91bmRzV2l0aFRyYW5zZm9ybSggbWF0cml4ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYm91bmRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIGFuIGFwcHJveGltYXRlIHZhbHVlIG9mIHRoZSBhcmVhIGluc2lkZSBvZiB0aGlzIFNoYXBlICh3aGVyZSBjb250YWluc1BvaW50IGlzIHRydWUpIHVzaW5nIE1vbnRlLUNhcmxvLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIE5PVEU6IEdlbmVyYWxseSwgdXNlIGdldEFyZWEoKS4gVGhpcyBjYW4gYmUgdXNlZCBmb3IgdmVyaWZpY2F0aW9uLCBidXQgdGFrZXMgYSBsYXJnZSBudW1iZXIgb2Ygc2FtcGxlcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1TYW1wbGVzIC0gSG93IG1hbnkgdGltZXMgdG8gcmFuZG9tbHkgY2hlY2sgZm9yIGluY2x1c2lvbiBvZiBwb2ludHMuXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRBcHByb3hpbWF0ZUFyZWEoIG51bVNhbXBsZXMgKSB7XHJcbiAgICBjb25zdCB4ID0gdGhpcy5ib3VuZHMubWluWDtcclxuICAgIGNvbnN0IHkgPSB0aGlzLmJvdW5kcy5taW5ZO1xyXG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLmJvdW5kcy53aWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuYm91bmRzLmhlaWdodDtcclxuXHJcbiAgICBjb25zdCByZWN0YW5nbGVBcmVhID0gd2lkdGggKiBoZWlnaHQ7XHJcbiAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgY29uc3QgcG9pbnQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU2FtcGxlczsgaSsrICkge1xyXG4gICAgICBwb2ludC54ID0geCArIHJhbmRvbVNvdXJjZSgpICogd2lkdGg7XHJcbiAgICAgIHBvaW50LnkgPSB5ICsgcmFuZG9tU291cmNlKCkgKiBoZWlnaHQ7XHJcbiAgICAgIGlmICggdGhpcy5jb250YWluc1BvaW50KCBwb2ludCApICkge1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZWN0YW5nbGVBcmVhICogY291bnQgLyBudW1TYW1wbGVzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIHRoZSBhcmVhIGluc2lkZSBvZiB0aGUgU2hhcGUgKHdoZXJlIGNvbnRhaW5zUG9pbnQgaXMgdHJ1ZSksIGFzc3VtaW5nIHRoZXJlIGlzIG5vIHNlbGYtaW50ZXJzZWN0aW9uIG9yXHJcbiAgICogb3ZlcmxhcCwgYW5kIHRoZSBzYW1lIG9yaWVudGF0aW9uICh3aW5kaW5nIG9yZGVyKSBpcyB1c2VkLiBTaG91bGQgYWxzbyBzdXBwb3J0IGhvbGVzICh3aXRoIG9wcG9zaXRlIG9yaWVudGF0aW9uKSxcclxuICAgKiBhc3N1bWluZyB0aGV5IGRvbid0IGludGVyc2VjdCB0aGUgY29udGFpbmluZyBzdWJwYXRoLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0Tm9ub3ZlcmxhcHBpbmdBcmVhKCkge1xyXG4gICAgLy8gT25seSBhYnNvbHV0ZS12YWx1ZSB0aGUgZmluYWwgdmFsdWUuXHJcbiAgICByZXR1cm4gTWF0aC5hYnMoIF8uc3VtKCB0aGlzLnN1YnBhdGhzLm1hcCggc3VicGF0aCA9PiBfLnN1bSggc3VicGF0aC5nZXRGaWxsU2VnbWVudHMoKS5tYXAoIHNlZ21lbnQgPT4gc2VnbWVudC5nZXRTaWduZWRBcmVhRnJhZ21lbnQoKSApICkgKSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBhcmVhIGluc2lkZSBvZiB0aGUgc2hhcGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyByZXF1aXJlcyBydW5uaW5nIGl0IHRocm91Z2ggYSBsb3Qgb2YgY29tcHV0YXRpb24gdG8gZGV0ZXJtaW5lIGEgbm9uLW92ZXJsYXBwaW5nIG5vbi1zZWxmLWludGVyc2VjdGluZ1xyXG4gICAqICAgICAgIGZvcm0gZmlyc3QuIElmIHRoZSBTaGFwZSBpcyBcInNpbXBsZVwiIGVub3VnaCwgZ2V0Tm9ub3ZlcmxhcHBpbmdBcmVhIHdvdWxkIGJlIHByZWZlcnJlZC5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0QXJlYSgpIHtcclxuICAgIHJldHVybiB0aGlzLmdldFNpbXBsaWZpZWRBcmVhU2hhcGUoKS5nZXROb25vdmVybGFwcGluZ0FyZWEoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybiB0aGUgYXBwcm94aW1hdGUgbG9jYXRpb24gb2YgdGhlIGNlbnRyb2lkIG9mIHRoZSBTaGFwZSAodGhlIGF2ZXJhZ2Ugb2YgYWxsIHBvaW50cyB3aGVyZSBjb250YWluc1BvaW50IGlzIHRydWUpXHJcbiAgICogdXNpbmcgTW9udGUtQ2FybG8gbWV0aG9kcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtU2FtcGxlcyAtIEhvdyBtYW55IHRpbWVzIHRvIHJhbmRvbWx5IGNoZWNrIGZvciBpbmNsdXNpb24gb2YgcG9pbnRzLlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0QXBwcm94aW1hdGVDZW50cm9pZCggbnVtU2FtcGxlcyApIHtcclxuICAgIGNvbnN0IHggPSB0aGlzLmJvdW5kcy5taW5YO1xyXG4gICAgY29uc3QgeSA9IHRoaXMuYm91bmRzLm1pblk7XHJcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMuYm91bmRzLndpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5ib3VuZHMuaGVpZ2h0O1xyXG5cclxuICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICBjb25zdCBzdW0gPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgY29uc3QgcG9pbnQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU2FtcGxlczsgaSsrICkge1xyXG4gICAgICBwb2ludC54ID0geCArIHJhbmRvbVNvdXJjZSgpICogd2lkdGg7XHJcbiAgICAgIHBvaW50LnkgPSB5ICsgcmFuZG9tU291cmNlKCkgKiBoZWlnaHQ7XHJcbiAgICAgIGlmICggdGhpcy5jb250YWluc1BvaW50KCBwb2ludCApICkge1xyXG4gICAgICAgIHN1bS5hZGQoIHBvaW50ICk7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN1bS5kaXZpZGVkU2NhbGFyKCBjb3VudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBwb3RlbnRpYWwgY2xvc2VzdCBwb2ludCByZXN1bHRzIG9uIHRoZSBTaGFwZSB0byB0aGUgZ2l2ZW4gcG9pbnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb2ludFxyXG4gICAqIEByZXR1cm5zIHtDbG9zZXN0VG9Qb2ludFJlc3VsdFtdfVxyXG4gICAqL1xyXG4gIGdldENsb3Nlc3RQb2ludHMoIHBvaW50ICkge1xyXG4gICAgcmV0dXJuIFNlZ21lbnQuZmlsdGVyQ2xvc2VzdFRvUG9pbnRSZXN1bHQoIF8uZmxhdHRlbiggdGhpcy5zdWJwYXRocy5tYXAoIHN1YnBhdGggPT4gc3VicGF0aC5nZXRDbG9zZXN0UG9pbnRzKCBwb2ludCApICkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHNpbmdsZSBwb2ludCBPTiB0aGUgU2hhcGUgYm91bmRhcnkgdGhhdCBpcyBjbG9zZXN0IHRvIHRoZSBnaXZlbiBwb2ludCAocGlja3MgYW4gYXJiaXRyYXJ5IG9uZSBpZiB0aGVyZVxyXG4gICAqIGFyZSBtdWx0aXBsZSkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb2ludFxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGdldENsb3Nlc3RQb2ludCggcG9pbnQgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRDbG9zZXN0UG9pbnRzKCBwb2ludCApWyAwIF0uY2xvc2VzdFBvaW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hvdWxkIGJlIGNhbGxlZCBhZnRlciBtdXRhdGluZyB0aGUgeC95IG9mIFZlY3RvcjIgcG9pbnRzIHRoYXQgd2VyZSBwYXNzZWQgaW4gdG8gdmFyaW91cyBTaGFwZSBjYWxscywgc28gdGhhdFxyXG4gICAqIGRlcml2ZWQgaW5mb3JtYXRpb24gY29tcHV0ZWQgKGJvdW5kcywgZXRjLikgd2lsbCBiZSBjb3JyZWN0LCBhbmQgYW55IGNsaWVudHMgKGUuZy4gU2NlbmVyeSBQYXRocykgd2lsbCBiZVxyXG4gICAqIG5vdGlmaWVkIG9mIHRoZSB1cGRhdGVzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpbnZhbGlkYXRlUG9pbnRzKCkge1xyXG4gICAgdGhpcy5faW52YWxpZGF0aW5nUG9pbnRzID0gdHJ1ZTtcclxuXHJcbiAgICBjb25zdCBudW1TdWJwYXRocyA9IHRoaXMuc3VicGF0aHMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU3VicGF0aHM7IGkrKyApIHtcclxuICAgICAgdGhpcy5zdWJwYXRoc1sgaSBdLmludmFsaWRhdGVQb2ludHMoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9pbnZhbGlkYXRpbmdQb2ludHMgPSBmYWxzZTtcclxuICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIC8vIFRPRE86IGNvbnNpZGVyIGEgbW9yZSB2ZXJib3NlIGJ1dCBzYWZlciB3YXk/XHJcbiAgICByZXR1cm4gYG5ldyBwaGV0LmtpdGUuU2hhcGUoICcke3RoaXMuZ2V0U1ZHUGF0aCgpfScgKWA7XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBJbnRlcm5hbCBzdWJwYXRoIGNvbXB1dGF0aW9uc1xyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaW52YWxpZGF0ZSgpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLl9pbW11dGFibGUsICdBdHRlbXB0IHRvIG1vZGlmeSBhbiBpbW11dGFibGUgU2hhcGUnICk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5faW52YWxpZGF0aW5nUG9pbnRzICkge1xyXG4gICAgICB0aGlzLl9ib3VuZHMgPSBudWxsO1xyXG5cclxuICAgICAgdGhpcy5ub3RpZnlJbnZhbGlkYXRpb25MaXN0ZW5lcnMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgcGFydCBvZiB0aGUgU2hhcGUgaGFzIGNoYW5nZWQsIG9yIGlmIG1ldGFkYXRhIG9uIHRoZSBTaGFwZSBoYXMgY2hhbmdlZCAoZS5nLiBpdCBiZWNhbWUgaW1tdXRhYmxlKS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG5vdGlmeUludmFsaWRhdGlvbkxpc3RlbmVycygpIHtcclxuICAgIHRoaXMuaW52YWxpZGF0ZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NlZ21lbnR9IHNlZ21lbnRcclxuICAgKi9cclxuICBhZGRTZWdtZW50QW5kQm91bmRzKCBzZWdtZW50ICkge1xyXG4gICAgdGhpcy5nZXRMYXN0U3VicGF0aCgpLmFkZFNlZ21lbnQoIHNlZ21lbnQgKTtcclxuICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFrZXMgc3VyZSB0aGF0IHdlIGhhdmUgYSBzdWJwYXRoIChhbmQgaWYgdGhlcmUgaXMgbm8gc3VicGF0aCwgc3RhcnQgaXQgYXQgdGhpcyBwb2ludClcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb2ludFxyXG4gICAqL1xyXG4gIGVuc3VyZSggcG9pbnQgKSB7XHJcbiAgICBpZiAoICF0aGlzLmhhc1N1YnBhdGhzKCkgKSB7XHJcbiAgICAgIHRoaXMuYWRkU3VicGF0aCggbmV3IFN1YnBhdGgoKSApO1xyXG4gICAgICB0aGlzLmdldExhc3RTdWJwYXRoKCkuYWRkUG9pbnQoIHBvaW50ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgc3VicGF0aFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1N1YnBhdGh9IHN1YnBhdGhcclxuICAgKi9cclxuICBhZGRTdWJwYXRoKCBzdWJwYXRoICkge1xyXG4gICAgdGhpcy5zdWJwYXRocy5wdXNoKCBzdWJwYXRoICk7XHJcblxyXG4gICAgLy8gbGlzdGVuIHRvIHdoZW4gdGhlIHN1YnBhdGggaXMgaW52YWxpZGF0ZWQgKHdpbGwgY2F1c2UgYm91bmRzIHJlY29tcHV0YXRpb24gaGVyZSlcclxuICAgIHN1YnBhdGguaW52YWxpZGF0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLl9pbnZhbGlkYXRlTGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgaWYgdGhlcmUgYXJlIGFueSBzdWJwYXRoc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBoYXNTdWJwYXRocygpIHtcclxuICAgIHJldHVybiB0aGlzLnN1YnBhdGhzLmxlbmd0aCA+IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBsYXN0IHN1YnBhdGhcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge1N1YnBhdGh9XHJcbiAgICovXHJcbiAgZ2V0TGFzdFN1YnBhdGgoKSB7XHJcbiAgICByZXR1cm4gXy5sYXN0KCB0aGlzLnN1YnBhdGhzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBsYXN0IHBvaW50IGluIHRoZSBsYXN0IHN1YnBhdGgsIG9yIG51bGwgaWYgaXQgZG9lc24ndCBleGlzdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfG51bGx9XHJcbiAgICovXHJcbiAgZ2V0TGFzdFBvaW50KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaGFzU3VicGF0aHMoKSA/IHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5nZXRMYXN0UG9pbnQoKSA6IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBsYXN0IGRyYXdhYmxlIHNlZ21lbnQgaW4gdGhlIGxhc3Qgc3VicGF0aCwgb3IgbnVsbCBpZiBpdCBkb2Vzbid0IGV4aXN0XHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtTZWdtZW50fG51bGx9XHJcbiAgICovXHJcbiAgZ2V0TGFzdFNlZ21lbnQoKSB7XHJcbiAgICBpZiAoICF0aGlzLmhhc1N1YnBhdGhzKCkgKSB7IHJldHVybiBudWxsOyB9XHJcblxyXG4gICAgY29uc3Qgc3VicGF0aCA9IHRoaXMuZ2V0TGFzdFN1YnBhdGgoKTtcclxuICAgIGlmICggIXN1YnBhdGguaXNEcmF3YWJsZSgpICkgeyByZXR1cm4gbnVsbDsgfVxyXG5cclxuICAgIHJldHVybiBzdWJwYXRoLmdldExhc3RTZWdtZW50KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjb250cm9sIHBvaW50IHRvIGJlIHVzZWQgdG8gY3JlYXRlIGEgc21vb3RoIHF1YWRyYXRpYyBzZWdtZW50c1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKi9cclxuICBnZXRTbW9vdGhRdWFkcmF0aWNDb250cm9sUG9pbnQoKSB7XHJcbiAgICBjb25zdCBsYXN0UG9pbnQgPSB0aGlzLmdldExhc3RQb2ludCgpO1xyXG5cclxuICAgIGlmICggdGhpcy5sYXN0UXVhZHJhdGljQ29udHJvbFBvaW50ICkge1xyXG4gICAgICByZXR1cm4gbGFzdFBvaW50LnBsdXMoIGxhc3RQb2ludC5taW51cyggdGhpcy5sYXN0UXVhZHJhdGljQ29udHJvbFBvaW50ICkgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gbGFzdFBvaW50O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY29udHJvbCBwb2ludCB0byBiZSB1c2VkIHRvIGNyZWF0ZSBhIHNtb290aCBjdWJpYyBzZWdtZW50XHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGdldFNtb290aEN1YmljQ29udHJvbFBvaW50KCkge1xyXG4gICAgY29uc3QgbGFzdFBvaW50ID0gdGhpcy5nZXRMYXN0UG9pbnQoKTtcclxuXHJcbiAgICBpZiAoIHRoaXMubGFzdEN1YmljQ29udHJvbFBvaW50ICkge1xyXG4gICAgICByZXR1cm4gbGFzdFBvaW50LnBsdXMoIGxhc3RQb2ludC5taW51cyggdGhpcy5sYXN0Q3ViaWNDb250cm9sUG9pbnQgKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBsYXN0UG9pbnQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBsYXN0IHBvaW50IGluIHRoZSBsYXN0IHN1YnBhdGgsIG9yIHRoZSBWZWN0b3IgWkVSTyBpZiBpdCBkb2Vzbid0IGV4aXN0XHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGdldFJlbGF0aXZlUG9pbnQoKSB7XHJcbiAgICBjb25zdCBsYXN0UG9pbnQgPSB0aGlzLmdldExhc3RQb2ludCgpO1xyXG4gICAgcmV0dXJuIGxhc3RQb2ludCA/IGxhc3RQb2ludCA6IFZlY3RvcjIuWkVSTztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgc2hhcGUgdGhhdCBjb250YWlucyBhIHVuaW9uIG9mIHRoZSB0d28gc2hhcGVzIChhIHBvaW50IGluIGVpdGhlciBzaGFwZSBpcyBpbiB0aGUgcmVzdWx0aW5nIHNoYXBlKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBzaGFwZVVuaW9uKCBzaGFwZSApIHtcclxuICAgIHJldHVybiBHcmFwaC5iaW5hcnlSZXN1bHQoIHRoaXMsIHNoYXBlLCBHcmFwaC5CSU5BUllfTk9OWkVST19VTklPTiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBzaGFwZSB0aGF0IGNvbnRhaW5zIHRoZSBpbnRlcnNlY3Rpb24gb2YgdGhlIHR3byBzaGFwZXMgKGEgcG9pbnQgaW4gYm90aCBzaGFwZXMgaXMgaW4gdGhlXHJcbiAgICogcmVzdWx0aW5nIHNoYXBlKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBzaGFwZUludGVyc2VjdGlvbiggc2hhcGUgKSB7XHJcbiAgICByZXR1cm4gR3JhcGguYmluYXJ5UmVzdWx0KCB0aGlzLCBzaGFwZSwgR3JhcGguQklOQVJZX05PTlpFUk9fSU5URVJTRUNUSU9OICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IHNoYXBlIHRoYXQgY29udGFpbnMgdGhlIGRpZmZlcmVuY2Ugb2YgdGhlIHR3byBzaGFwZXMgKGEgcG9pbnQgaW4gdGhlIGZpcnN0IHNoYXBlIGFuZCBOT1QgaW4gdGhlXHJcbiAgICogc2Vjb25kIHNoYXBlIGlzIGluIHRoZSByZXN1bHRpbmcgc2hhcGUpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHNoYXBlRGlmZmVyZW5jZSggc2hhcGUgKSB7XHJcbiAgICByZXR1cm4gR3JhcGguYmluYXJ5UmVzdWx0KCB0aGlzLCBzaGFwZSwgR3JhcGguQklOQVJZX05PTlpFUk9fRElGRkVSRU5DRSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBzaGFwZSB0aGF0IGNvbnRhaW5zIHRoZSB4b3Igb2YgdGhlIHR3byBzaGFwZXMgKGEgcG9pbnQgaW4gb25seSBvbmUgc2hhcGUgaXMgaW4gdGhlIHJlc3VsdGluZ1xyXG4gICAqIHNoYXBlKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBzaGFwZVhvciggc2hhcGUgKSB7XHJcbiAgICByZXR1cm4gR3JhcGguYmluYXJ5UmVzdWx0KCB0aGlzLCBzaGFwZSwgR3JhcGguQklOQVJZX05PTlpFUk9fWE9SICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IHNoYXBlIHRoYXQgb25seSBjb250YWlucyBwb3J0aW9ucyBvZiBzZWdtZW50cyB0aGF0IGFyZSB3aXRoaW4gdGhlIHBhc3NlZC1pbiBzaGFwZSdzIGFyZWEuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gU2VlIEdyYXBoLmNsaXBTaGFwZSBvcHRpb25zXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHNoYXBlQ2xpcCggc2hhcGUsIG9wdGlvbnMgKSB7XHJcbiAgICByZXR1cm4gR3JhcGguY2xpcFNoYXBlKCBzaGFwZSwgdGhpcywgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgKHNvbWV0aW1lcyBhcHByb3hpbWF0ZSkgYXJjIGxlbmd0aCBvZiBhbGwgb2YgdGhlIHNoYXBlJ3Mgc3VicGF0aHMgY29tYmluZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtkaXN0YW5jZUVwc2lsb25dXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtjdXJ2ZUVwc2lsb25dXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFttYXhMZXZlbHNdXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRBcmNMZW5ndGgoIGRpc3RhbmNlRXBzaWxvbiwgY3VydmVFcHNpbG9uLCBtYXhMZXZlbHMgKSB7XHJcbiAgICBsZXQgbGVuZ3RoID0gMDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuc3VicGF0aHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGxlbmd0aCArPSB0aGlzLnN1YnBhdGhzWyBpIF0uZ2V0QXJjTGVuZ3RoKCBkaXN0YW5jZUVwc2lsb24sIGN1cnZlRXBzaWxvbiwgbWF4TGV2ZWxzICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAqL1xyXG4gIHNlcmlhbGl6ZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6ICdTaGFwZScsXHJcbiAgICAgIHN1YnBhdGhzOiB0aGlzLnN1YnBhdGhzLm1hcCggc3VicGF0aCA9PiBzdWJwYXRoLnNlcmlhbGl6ZSgpIClcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgU2hhcGUgZnJvbSB0aGUgc2VyaWFsaXplZCByZXByZXNlbnRhdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBkZXNlcmlhbGl6ZSggb2JqICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb2JqLnR5cGUgPT09ICdTaGFwZScgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFNoYXBlKCBvYmouc3VicGF0aHMubWFwKCBTdWJwYXRoLmRlc2VyaWFsaXplICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSByZWN0YW5nbGVcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBzdGF0aWMgcmVjdGFuZ2xlKCB4LCB5LCB3aWR0aCwgaGVpZ2h0ICkge1xyXG4gICAgcmV0dXJuIG5ldyBTaGFwZSgpLnJlY3QoIHgsIHksIHdpZHRoLCBoZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSByb3VuZCByZWN0YW5nbGUge1NoYXBlfSwgd2l0aCB7bnVtYmVyfSBhcmd1bWVudHMuIFVzZXMgY2lyY3VsYXIgb3IgZWxsaXB0aWNhbCBhcmNzIGlmIGdpdmVuLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFyY3dcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYXJjaFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBzdGF0aWMgcm91bmRSZWN0KCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBhcmN3LCBhcmNoICkge1xyXG4gICAgcmV0dXJuIG5ldyBTaGFwZSgpLnJvdW5kUmVjdCggeCwgeSwgd2lkdGgsIGhlaWdodCwgYXJjdywgYXJjaCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHJvdW5kZWQgcmVjdGFuZ2xlLCB3aGVyZSBlYWNoIGNvcm5lciBjYW4gaGF2ZSBhIGRpZmZlcmVudCByYWRpdXMuIFRoZSByYWRpaSBkZWZhdWx0IHRvIDAsIGFuZCBtYXkgYmUgc2V0XHJcbiAgICogdXNpbmcgdG9wTGVmdCwgdG9wUmlnaHQsIGJvdHRvbUxlZnQgYW5kIGJvdHRvbVJpZ2h0IGluIHRoZSBvcHRpb25zLiBJZiB0aGUgc3BlY2lmaWVkIHJhZGlpIGFyZSBsYXJnZXIgdGhhbiB0aGUgZGltZW5zaW9uXHJcbiAgICogb24gdGhhdCBzaWRlLCB0aGV5IHJhZGlpIGFyZSByZWR1Y2VkIHByb3BvcnRpb25hbGx5LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3VuZGVyLXByZXNzdXJlL2lzc3Vlcy8xNTFcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBFLmcuOlxyXG4gICAqXHJcbiAgICogdmFyIGNvcm5lclJhZGl1cyA9IDIwO1xyXG4gICAqIHZhciByZWN0ID0gU2hhcGUucm91bmRlZFJlY3RhbmdsZVdpdGhSYWRpaSggMCwgMCwgMjAwLCAxMDAsIHtcclxuICAgKiAgIHRvcExlZnQ6IGNvcm5lclJhZGl1cyxcclxuICAgKiAgIHRvcFJpZ2h0OiBjb3JuZXJSYWRpdXNcclxuICAgKiB9ICk7XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geCAtIExlZnQgZWRnZSBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gVG9wIGVkZ2UgcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBXaWR0aCBvZiByZWN0YW5nbGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gSGVpZ2h0IG9mIHJlY3RhbmdsZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbY29ybmVyUmFkaWldIC0gT3B0aW9uYWwgb2JqZWN0IHdpdGggcG90ZW50aWFsIHJhZGlpIGZvciBlYWNoIGNvcm5lci5cclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgc3RhdGljIHJvdW5kZWRSZWN0YW5nbGVXaXRoUmFkaWkoIHgsIHksIHdpZHRoLCBoZWlnaHQsIGNvcm5lclJhZGlpICkge1xyXG5cclxuICAgIC8vIGRlZmF1bHRzIHRvIDAgKG5vdCB1c2luZyBtZXJnZSwgc2luY2Ugd2UgcmVmZXJlbmNlIGVhY2ggbXVsdGlwbGUgdGltZXMpXHJcbiAgICBsZXQgdG9wTGVmdFJhZGl1cyA9IGNvcm5lclJhZGlpICYmIGNvcm5lclJhZGlpLnRvcExlZnQgfHwgMDtcclxuICAgIGxldCB0b3BSaWdodFJhZGl1cyA9IGNvcm5lclJhZGlpICYmIGNvcm5lclJhZGlpLnRvcFJpZ2h0IHx8IDA7XHJcbiAgICBsZXQgYm90dG9tTGVmdFJhZGl1cyA9IGNvcm5lclJhZGlpICYmIGNvcm5lclJhZGlpLmJvdHRvbUxlZnQgfHwgMDtcclxuICAgIGxldCBib3R0b21SaWdodFJhZGl1cyA9IGNvcm5lclJhZGlpICYmIGNvcm5lclJhZGlpLmJvdHRvbVJpZ2h0IHx8IDA7XHJcblxyXG4gICAgLy8gdHlwZSBhbmQgY29uc3RyYWludCBhc3NlcnRpb25zXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgeCA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHggKSwgJ05vbi1maW5pdGUgeCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB5ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggeSApLCAnTm9uLWZpbml0ZSB5JyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHdpZHRoID09PSAnbnVtYmVyJyAmJiB3aWR0aCA+PSAwICYmIGlzRmluaXRlKCB3aWR0aCApLCAnTmVnYXRpdmUgb3Igbm9uLWZpbml0ZSB3aWR0aCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBoZWlnaHQgPT09ICdudW1iZXInICYmIGhlaWdodCA+PSAwICYmIGlzRmluaXRlKCBoZWlnaHQgKSwgJ05lZ2F0aXZlIG9yIG5vbi1maW5pdGUgaGVpZ2h0JyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRvcExlZnRSYWRpdXMgPT09ICdudW1iZXInICYmIHRvcExlZnRSYWRpdXMgPj0gMCAmJiBpc0Zpbml0ZSggdG9wTGVmdFJhZGl1cyApLFxyXG4gICAgICAnSW52YWxpZCB0b3BMZWZ0JyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRvcFJpZ2h0UmFkaXVzID09PSAnbnVtYmVyJyAmJiB0b3BSaWdodFJhZGl1cyA+PSAwICYmIGlzRmluaXRlKCB0b3BSaWdodFJhZGl1cyApLFxyXG4gICAgICAnSW52YWxpZCB0b3BSaWdodCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBib3R0b21MZWZ0UmFkaXVzID09PSAnbnVtYmVyJyAmJiBib3R0b21MZWZ0UmFkaXVzID49IDAgJiYgaXNGaW5pdGUoIGJvdHRvbUxlZnRSYWRpdXMgKSxcclxuICAgICAgJ0ludmFsaWQgYm90dG9tTGVmdCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBib3R0b21SaWdodFJhZGl1cyA9PT0gJ251bWJlcicgJiYgYm90dG9tUmlnaHRSYWRpdXMgPj0gMCAmJiBpc0Zpbml0ZSggYm90dG9tUmlnaHRSYWRpdXMgKSxcclxuICAgICAgJ0ludmFsaWQgYm90dG9tUmlnaHQnICk7XHJcblxyXG4gICAgLy8gVGhlIHdpZHRoIGFuZCBoZWlnaHQgdGFrZSBwcmVjZWRlbmNlIG92ZXIgdGhlIGNvcm5lciByYWRpaS4gSWYgdGhlIHN1bSBvZiB0aGUgY29ybmVyIHJhZGlpIGV4Y2VlZFxyXG4gICAgLy8gdGhhdCBkaW1lbnNpb24sIHRoZW4gdGhlIGNvcm5lciByYWRpaSBhcmUgcmVkdWNlZCBwcm9wb3J0aW9uYXRlbHlcclxuICAgIGNvbnN0IHRvcFN1bSA9IHRvcExlZnRSYWRpdXMgKyB0b3BSaWdodFJhZGl1cztcclxuICAgIGlmICggdG9wU3VtID4gd2lkdGggJiYgdG9wU3VtID4gMCApIHtcclxuXHJcbiAgICAgIHRvcExlZnRSYWRpdXMgPSB0b3BMZWZ0UmFkaXVzIC8gdG9wU3VtICogd2lkdGg7XHJcbiAgICAgIHRvcFJpZ2h0UmFkaXVzID0gdG9wUmlnaHRSYWRpdXMgLyB0b3BTdW0gKiB3aWR0aDtcclxuICAgIH1cclxuICAgIGNvbnN0IGJvdHRvbVN1bSA9IGJvdHRvbUxlZnRSYWRpdXMgKyBib3R0b21SaWdodFJhZGl1cztcclxuICAgIGlmICggYm90dG9tU3VtID4gd2lkdGggJiYgYm90dG9tU3VtID4gMCApIHtcclxuXHJcbiAgICAgIGJvdHRvbUxlZnRSYWRpdXMgPSBib3R0b21MZWZ0UmFkaXVzIC8gYm90dG9tU3VtICogd2lkdGg7XHJcbiAgICAgIGJvdHRvbVJpZ2h0UmFkaXVzID0gYm90dG9tUmlnaHRSYWRpdXMgLyBib3R0b21TdW0gKiB3aWR0aDtcclxuICAgIH1cclxuICAgIGNvbnN0IGxlZnRTdW0gPSB0b3BMZWZ0UmFkaXVzICsgYm90dG9tTGVmdFJhZGl1cztcclxuICAgIGlmICggbGVmdFN1bSA+IGhlaWdodCAmJiBsZWZ0U3VtID4gMCApIHtcclxuXHJcbiAgICAgIHRvcExlZnRSYWRpdXMgPSB0b3BMZWZ0UmFkaXVzIC8gbGVmdFN1bSAqIGhlaWdodDtcclxuICAgICAgYm90dG9tTGVmdFJhZGl1cyA9IGJvdHRvbUxlZnRSYWRpdXMgLyBsZWZ0U3VtICogaGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgY29uc3QgcmlnaHRTdW0gPSB0b3BSaWdodFJhZGl1cyArIGJvdHRvbVJpZ2h0UmFkaXVzO1xyXG4gICAgaWYgKCByaWdodFN1bSA+IGhlaWdodCAmJiByaWdodFN1bSA+IDAgKSB7XHJcbiAgICAgIHRvcFJpZ2h0UmFkaXVzID0gdG9wUmlnaHRSYWRpdXMgLyByaWdodFN1bSAqIGhlaWdodDtcclxuICAgICAgYm90dG9tUmlnaHRSYWRpdXMgPSBib3R0b21SaWdodFJhZGl1cyAvIHJpZ2h0U3VtICogaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHZlcmlmeSB0aGVyZSBpcyBubyBvdmVybGFwIGJldHdlZW4gY29ybmVyc1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdG9wTGVmdFJhZGl1cyArIHRvcFJpZ2h0UmFkaXVzIDw9IHdpZHRoLCAnQ29ybmVyIG92ZXJsYXAgb24gdG9wIGVkZ2UnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBib3R0b21MZWZ0UmFkaXVzICsgYm90dG9tUmlnaHRSYWRpdXMgPD0gd2lkdGgsICdDb3JuZXIgb3ZlcmxhcCBvbiBib3R0b20gZWRnZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRvcExlZnRSYWRpdXMgKyBib3R0b21MZWZ0UmFkaXVzIDw9IGhlaWdodCwgJ0Nvcm5lciBvdmVybGFwIG9uIGxlZnQgZWRnZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRvcFJpZ2h0UmFkaXVzICsgYm90dG9tUmlnaHRSYWRpdXMgPD0gaGVpZ2h0LCAnQ29ybmVyIG92ZXJsYXAgb24gcmlnaHQgZWRnZScgKTtcclxuXHJcbiAgICBjb25zdCBzaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG4gICAgY29uc3QgcmlnaHQgPSB4ICsgd2lkdGg7XHJcbiAgICBjb25zdCBib3R0b20gPSB5ICsgaGVpZ2h0O1xyXG5cclxuICAgIC8vIFRvIGRyYXcgdGhlIHJvdW5kZWQgcmVjdGFuZ2xlLCB3ZSB1c2UgdGhlIGltcGxpY2l0IFwibGluZSBmcm9tIGxhc3Qgc2VnbWVudCB0byBuZXh0IHNlZ21lbnRcIiBhbmQgdGhlIGNsb3NlKCkgZm9yXHJcbiAgICAvLyBhbGwgdGhlIHN0cmFpZ2h0IGxpbmUgZWRnZXMgYmV0d2VlbiBhcmNzLCBvciBsaW5lVG8gdGhlIGNvcm5lci5cclxuXHJcbiAgICBpZiAoIGJvdHRvbVJpZ2h0UmFkaXVzID4gMCApIHtcclxuICAgICAgc2hhcGUuYXJjKCByaWdodCAtIGJvdHRvbVJpZ2h0UmFkaXVzLCBib3R0b20gLSBib3R0b21SaWdodFJhZGl1cywgYm90dG9tUmlnaHRSYWRpdXMsIDAsIE1hdGguUEkgLyAyLCBmYWxzZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHNoYXBlLm1vdmVUbyggcmlnaHQsIGJvdHRvbSApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggYm90dG9tTGVmdFJhZGl1cyA+IDAgKSB7XHJcbiAgICAgIHNoYXBlLmFyYyggeCArIGJvdHRvbUxlZnRSYWRpdXMsIGJvdHRvbSAtIGJvdHRvbUxlZnRSYWRpdXMsIGJvdHRvbUxlZnRSYWRpdXMsIE1hdGguUEkgLyAyLCBNYXRoLlBJLCBmYWxzZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHNoYXBlLmxpbmVUbyggeCwgYm90dG9tICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0b3BMZWZ0UmFkaXVzID4gMCApIHtcclxuICAgICAgc2hhcGUuYXJjKCB4ICsgdG9wTGVmdFJhZGl1cywgeSArIHRvcExlZnRSYWRpdXMsIHRvcExlZnRSYWRpdXMsIE1hdGguUEksIDMgKiBNYXRoLlBJIC8gMiwgZmFsc2UgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzaGFwZS5saW5lVG8oIHgsIHkgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRvcFJpZ2h0UmFkaXVzID4gMCApIHtcclxuICAgICAgc2hhcGUuYXJjKCByaWdodCAtIHRvcFJpZ2h0UmFkaXVzLCB5ICsgdG9wUmlnaHRSYWRpdXMsIHRvcFJpZ2h0UmFkaXVzLCAzICogTWF0aC5QSSAvIDIsIDIgKiBNYXRoLlBJLCBmYWxzZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHNoYXBlLmxpbmVUbyggcmlnaHQsIHkgKTtcclxuICAgIH1cclxuXHJcbiAgICBzaGFwZS5jbG9zZSgpO1xyXG5cclxuICAgIHJldHVybiBzaGFwZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBTaGFwZSBmcm9tIGEgYm91bmRzLCBvZmZzZXQgYnkgY2VydGFpbiBhbW91bnRzLCBhbmQgd2l0aCBjZXJ0YWluIGNvcm5lciByYWRpaS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGJvdW5kc1xyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvZmZzZXRzIC0geyBsZWZ0LCB0b3AsIHJpZ2h0LCBib3R0b20gfSwgYWxsIG51bWJlcnMuIERldGVybWluZXMgaG93IHRvIGV4cGFuZCB0aGUgYm91bmRzXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHJhZGlpIC0gU2VlIFNoYXBlLnJvdW5kZWRSZWN0YW5nbGVXaXRoUmFkaWlcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgc3RhdGljIGJvdW5kc09mZnNldFdpdGhSYWRpaSggYm91bmRzLCBvZmZzZXRzLCByYWRpaSApIHtcclxuICAgIGNvbnN0IG9mZnNldEJvdW5kcyA9IGJvdW5kcy53aXRoT2Zmc2V0cyggb2Zmc2V0cy5sZWZ0LCBvZmZzZXRzLnRvcCwgb2Zmc2V0cy5yaWdodCwgb2Zmc2V0cy5ib3R0b20gKTtcclxuICAgIHJldHVybiBTaGFwZS5yb3VuZGVkUmVjdGFuZ2xlV2l0aFJhZGlpKCBvZmZzZXRCb3VuZHMubWluWCwgb2Zmc2V0Qm91bmRzLm1pblksIG9mZnNldEJvdW5kcy53aWR0aCwgb2Zmc2V0Qm91bmRzLmhlaWdodCwgcmFkaWkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjbG9zZWQgcG9seWdvbiBmcm9tIGFuIGFycmF5IG9mIHZlcnRpY2VzIGJ5IGNvbm5lY3RpbmcgdGhlbSBieSBhIHNlcmllcyBvZiBsaW5lcy5cclxuICAgKiBUaGUgbGluZXMgYXJlIGpvaW5pbmcgdGhlIGFkamFjZW50IHZlcnRpY2VzIGluIHRoZSBhcnJheS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxWZWN0b3IyPn0gdmVydGljZXNcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgc3RhdGljIHBvbHlnb24oIHZlcnRpY2VzICkge1xyXG4gICAgcmV0dXJuIG5ldyBTaGFwZSgpLnBvbHlnb24oIHZlcnRpY2VzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcmVjdGFuZ3VsYXIgc2hhcGUgZnJvbSBib3VuZHNcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGJvdW5kc1xyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBzdGF0aWMgYm91bmRzKCBib3VuZHMgKSB7XHJcbiAgICByZXR1cm4gbmV3IFNoYXBlKCkucmVjdCggYm91bmRzLm1pblgsIGJvdW5kcy5taW5ZLCBib3VuZHMubWF4WCAtIGJvdW5kcy5taW5YLCBib3VuZHMubWF4WSAtIGJvdW5kcy5taW5ZICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbGluZSBzZWdtZW50LCB1c2luZyBlaXRoZXIgKHgxLHkxLHgyLHkyKSBvciAoe3gxLHkxfSx7eDIseTJ9KSBhcmd1bWVudHNcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcnxWZWN0b3IyfSBhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ8VmVjdG9yMn0gYlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbY11cclxuICAgKiBAcGFyYW0ge251bWJlcn0gW2RdXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsaW5lU2VnbWVudCggYSwgYiwgYywgZCApIHtcclxuICAgIC8vIFRPRE86IGFkZCB0eXBlIGFzc2VydGlvbnM/XHJcbiAgICBpZiAoIHR5cGVvZiBhID09PSAnbnVtYmVyJyApIHtcclxuICAgICAgcmV0dXJuIG5ldyBTaGFwZSgpLm1vdmVUbyggYSwgYiApLmxpbmVUbyggYywgZCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIHRoZW4gYSBhbmQgYiBtdXN0IGJlIHtWZWN0b3IyfVxyXG4gICAgICByZXR1cm4gbmV3IFNoYXBlKCkubW92ZVRvUG9pbnQoIGEgKS5saW5lVG9Qb2ludCggYiApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHJlZ3VsYXIgcG9seWdvbiBvZiByYWRpdXMgYW5kIG51bWJlciBvZiBzaWRlc1xyXG4gICAqIFRoZSByZWd1bGFyIHBvbHlnb24gaXMgb3JpZW50ZWQgc3VjaCB0aGF0IHRoZSBmaXJzdCB2ZXJ0ZXggbGllcyBvbiB0aGUgcG9zaXRpdmUgeC1heGlzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaWRlcyAtIGFuIGludGVnZXJcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyByZWd1bGFyUG9seWdvbiggc2lkZXMsIHJhZGl1cyApIHtcclxuICAgIGNvbnN0IHNoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICBfLmVhY2goIF8ucmFuZ2UoIHNpZGVzICksIGsgPT4ge1xyXG4gICAgICBjb25zdCBwb2ludCA9IFZlY3RvcjIuY3JlYXRlUG9sYXIoIHJhZGl1cywgMiAqIE1hdGguUEkgKiBrIC8gc2lkZXMgKTtcclxuICAgICAgKCBrID09PSAwICkgPyBzaGFwZS5tb3ZlVG9Qb2ludCggcG9pbnQgKSA6IHNoYXBlLmxpbmVUb1BvaW50KCBwb2ludCApO1xyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIHNoYXBlLmNsb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY2lyY2xlXHJcbiAgICogc3VwcG9ydHMgYm90aCBjaXJjbGUoIGNlbnRlclgsIGNlbnRlclksIHJhZGl1cyApLCBjaXJjbGUoIGNlbnRlciwgcmFkaXVzICksIGFuZCBjaXJjbGUoIHJhZGl1cyApIHdpdGggdGhlIGNlbnRlciBkZWZhdWx0IHRvIDAsMFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMnxudW1iZXJ9IGNlbnRlclhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gW2NlbnRlclldXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtyYWRpdXNdXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjaXJjbGUoIGNlbnRlclgsIGNlbnRlclksIHJhZGl1cyApIHtcclxuICAgIGlmICggY2VudGVyWSA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAvLyBjaXJjbGUoIHJhZGl1cyApLCBjZW50ZXIgPSAwLDBcclxuICAgICAgcmV0dXJuIG5ldyBTaGFwZSgpLmNpcmNsZSggMCwgMCwgY2VudGVyWCApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBTaGFwZSgpLmNpcmNsZSggY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdXBwb3J0cyBlbGxpcHNlKCBjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiApLCBlbGxpcHNlKCBjZW50ZXIsIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uICksIGFuZCBlbGxpcHNlKCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiApXHJcbiAgICogd2l0aCB0aGUgY2VudGVyIGRlZmF1bHQgdG8gMCwwIGFuZCByb3RhdGlvbiBvZiAwLiAgVGhlIHJvdGF0aW9uIGlzIGFib3V0IHRoZSBjZW50ZXJYLCBjZW50ZXJZLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfFZlY3RvcjJ9IGNlbnRlclhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gW2NlbnRlclldXHJcbiAgICogQHBhcmFtIHtudW1iZXJ8VmVjdG9yMn0gcmFkaXVzWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbcmFkaXVzWV1cclxuICAgKiBAcGFyYW0ge251bWJlcn0gcm90YXRpb25cclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgc3RhdGljIGVsbGlwc2UoIGNlbnRlclgsIGNlbnRlclksIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uICkge1xyXG4gICAgLy8gVE9ETzogRWxsaXBzZS9FbGxpcHRpY2FsQXJjIGhhcyBhIG1lc3Mgb2YgcGFyYW1ldGVycy4gQ29uc2lkZXIgcGFyYW1ldGVyIG9iamVjdCwgb3IgZG91YmxlLWNoZWNrIHBhcmFtZXRlciBoYW5kbGluZ1xyXG4gICAgaWYgKCByYWRpdXNZID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgIC8vIGVsbGlwc2UoIHJhZGl1c1gsIHJhZGl1c1kgKSwgY2VudGVyID0gMCwwXHJcbiAgICAgIHJldHVybiBuZXcgU2hhcGUoKS5lbGxpcHNlKCAwLCAwLCBjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXNYICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFNoYXBlKCkuZWxsaXBzZSggY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzWCwgcmFkaXVzWSwgcm90YXRpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN1cHBvcnRzIGJvdGggYXJjKCBjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBhbnRpY2xvY2t3aXNlICkgYW5kIGFyYyggY2VudGVyLCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBhbnRpY2xvY2t3aXNlIClcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ8bnVtYmVyfSBjZW50ZXJYXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtjZW50ZXJZXVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgLSBIb3cgZmFyIGZyb20gdGhlIGNlbnRlciB0aGUgYXJjIHdpbGwgYmVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRBbmdsZSAtIEFuZ2xlIChyYWRpYW5zKSBvZiB0aGUgc3RhcnQgb2YgdGhlIGFyY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlbmRBbmdsZSAtIEFuZ2xlIChyYWRpYW5zKSBvZiB0aGUgZW5kIG9mIHRoZSBhcmNcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthbnRpY2xvY2t3aXNlXSAtIERlY2lkZXMgd2hpY2ggZGlyZWN0aW9uIHRoZSBhcmMgdGFrZXMgYXJvdW5kIHRoZSBjZW50ZXJcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgc3RhdGljIGFyYyggY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApIHtcclxuICAgIHJldHVybiBuZXcgU2hhcGUoKS5hcmMoIGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGFudGljbG9ja3dpc2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHVuaW9uIG9mIGFuIGFycmF5IG9mIHNoYXBlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxTaGFwZT59IHNoYXBlc1xyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBzdGF0aWMgdW5pb24oIHNoYXBlcyApIHtcclxuICAgIHJldHVybiBHcmFwaC51bmlvbk5vblplcm8oIHNoYXBlcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaW50ZXJzZWN0aW9uIG9mIGFuIGFycmF5IG9mIHNoYXBlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxTaGFwZT59IHNoYXBlc1xyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBzdGF0aWMgaW50ZXJzZWN0aW9uKCBzaGFwZXMgKSB7XHJcbiAgICByZXR1cm4gR3JhcGguaW50ZXJzZWN0aW9uTm9uWmVybyggc2hhcGVzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB4b3Igb2YgYW4gYXJyYXkgb2Ygc2hhcGVzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFNoYXBlPn0gc2hhcGVzXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyB4b3IoIHNoYXBlcyApIHtcclxuICAgIHJldHVybiBHcmFwaC54b3JOb25aZXJvKCBzaGFwZXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgU2hhcGUgY29uc3RydWN0ZWQgYnkgYXBwZW5kaW5nIGEgbGlzdCBvZiBzZWdtZW50cyB0b2dldGhlci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxTZWdtZW50Pn0gc2VnbWVudHNcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjbG9zZWRdXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzZWdtZW50cyggc2VnbWVudHMsIGNsb3NlZCApIHtcclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBzZWdtZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBhc3NlcnQoIHNlZ21lbnRzWyBpIC0gMSBdLmVuZC5lcXVhbHNFcHNpbG9uKCBzZWdtZW50c1sgaSBdLnN0YXJ0LCAxZS02ICksICdNaXNtYXRjaGVkIHN0YXJ0L2VuZCcgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgU2hhcGUoIFsgbmV3IFN1YnBhdGgoIHNlZ21lbnRzLCB1bmRlZmluZWQsICEhY2xvc2VkICkgXSApO1xyXG4gIH1cclxufVxyXG5cclxua2l0ZS5yZWdpc3RlciggJ1NoYXBlJywgU2hhcGUgKTtcclxuXHJcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gKiBTaGFwZSBzaG9ydGN1dHNcclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbi8vIEBwdWJsaWMge2Z1bmN0aW9ufVxyXG5TaGFwZS5yZWN0ID0gU2hhcGUucmVjdGFuZ2xlO1xyXG5TaGFwZS5yb3VuZFJlY3RhbmdsZSA9IFNoYXBlLnJvdW5kUmVjdDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNoYXBlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0sOEJBQThCO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSx5QkFBeUI7QUFDN0MsT0FBT0MsSUFBSSxNQUFNLHNCQUFzQjtBQUN2QyxPQUFPQyxPQUFPLE1BQU0seUJBQXlCO0FBQzdDLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsU0FBU0MsR0FBRyxFQUFFQyxLQUFLLEVBQUVDLGFBQWEsRUFBRUMsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsVUFBVSxFQUFFQyxTQUFTLEVBQUVDLE9BQU8sRUFBRUMsU0FBUyxFQUFFQyxPQUFPLEVBQUVDLE9BQU8sUUFBUSxjQUFjOztBQUV4STtBQUNBLE1BQU1DLFlBQVksR0FBR0MsSUFBSSxDQUFDQyxNQUFNOztBQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0MsQ0FBQ0EsQ0FBRUMsQ0FBQyxFQUFFQyxDQUFDLEVBQUc7RUFBRSxPQUFPLElBQUluQixPQUFPLENBQUVrQixDQUFDLEVBQUVDLENBQUUsQ0FBQztBQUFFOztBQUVqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLG9CQUFvQkEsQ0FBRUMsWUFBWSxFQUFFQyxhQUFhLEVBQUVDLFdBQVcsRUFBRUMsT0FBTyxFQUFHO0VBQ2pGLE9BQU9ELFdBQVcsQ0FBQ0UsSUFBSSxDQUFDLENBQUMsQ0FDdEJDLFFBQVEsQ0FBRUwsWUFBYSxDQUFDLENBQ3hCTSxjQUFjLENBQUUsQ0FBRSxDQUFDLEdBQUdILE9BQU8sSUFBSyxDQUFFLENBQUMsQ0FDckNJLEdBQUcsQ0FBRU4sYUFBYyxDQUFDO0FBQ3pCOztBQUVBO0FBQ0E7O0FBRUEsTUFBTU8sS0FBSyxDQUFDO0VBQ1Y7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxRQUFRLEVBQUVDLE1BQU0sRUFBRztJQUU5QjtJQUNBO0lBQ0EsSUFBSSxDQUFDRCxRQUFRLEdBQUcsRUFBRTs7SUFFbEI7SUFDQTtJQUNBLElBQUksQ0FBQ0UsT0FBTyxHQUFHRCxNQUFNLEdBQUdBLE1BQU0sQ0FBQ1AsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQzs7SUFFOUM7SUFDQSxJQUFJLENBQUNTLGtCQUFrQixHQUFHLElBQUlyQyxXQUFXLENBQUMsQ0FBQztJQUUzQyxJQUFJLENBQUNzQyxrQkFBa0IsQ0FBQyxDQUFDOztJQUV6QjtJQUNBLElBQUksQ0FBQ0MsbUJBQW1CLEdBQUcsSUFBSSxDQUFDQyxVQUFVLENBQUNDLElBQUksQ0FBRSxJQUFLLENBQUM7O0lBRXZEO0lBQ0EsSUFBSSxDQUFDQyxtQkFBbUIsR0FBRyxLQUFLOztJQUVoQztJQUNBO0lBQ0EsSUFBSSxDQUFDQyxVQUFVLEdBQUcsS0FBSzs7SUFFdkI7SUFDQSxJQUFLLE9BQU9ULFFBQVEsS0FBSyxRQUFRLEVBQUc7TUFDbEM7TUFDQSxLQUFNLElBQUlVLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR1YsUUFBUSxDQUFDVyxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFHO1FBQzFDLElBQUksQ0FBQ0UsVUFBVSxDQUFFWixRQUFRLENBQUVVLENBQUMsQ0FBRyxDQUFDO01BQ2xDO0lBQ0Y7SUFFQSxJQUFLVixRQUFRLElBQUksT0FBT0EsUUFBUSxLQUFLLFFBQVEsRUFBRztNQUM5Q2EsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT2IsUUFBUSxLQUFLLFFBQVEsRUFBRSxtREFBb0QsQ0FBQztNQUNyRztNQUNBYyxDQUFDLENBQUNDLElBQUksQ0FBRWxDLE9BQU8sQ0FBQ21DLEtBQUssQ0FBRWhCLFFBQVMsQ0FBQyxFQUFFaUIsSUFBSSxJQUFJO1FBQ3pDSixNQUFNLElBQUlBLE1BQU0sQ0FBRWYsS0FBSyxDQUFDb0IsU0FBUyxDQUFFRCxJQUFJLENBQUNFLEdBQUcsQ0FBRSxLQUFLQyxTQUFTLEVBQUcsVUFBU0gsSUFBSSxDQUFDRSxHQUFJLGlDQUFpQyxDQUFDO1FBQ2xIO1FBQ0EsSUFBSSxDQUFFRixJQUFJLENBQUNFLEdBQUcsQ0FBRSxDQUFDRSxLQUFLLENBQUUsSUFBSSxFQUFFSixJQUFJLENBQUNLLElBQUssQ0FBQztNQUMzQyxDQUFFLENBQUM7SUFDTDs7SUFFQTtJQUNBLElBQUksQ0FBQ2hCLFVBQVUsQ0FBQyxDQUFDO0VBQ25COztFQUdBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VGLGtCQUFrQkEsQ0FBQSxFQUFHO0lBQ25CLElBQUksQ0FBQ21CLHlCQUF5QixHQUFHLElBQUk7SUFDckMsSUFBSSxDQUFDQyxxQkFBcUIsR0FBRyxJQUFJO0VBQ25DOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyx3QkFBd0JBLENBQUVDLEtBQUssRUFBRztJQUNoQyxJQUFJLENBQUNILHlCQUF5QixHQUFHRyxLQUFLO0lBQ3RDLElBQUksQ0FBQ0YscUJBQXFCLEdBQUcsSUFBSTtFQUNuQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUcsb0JBQW9CQSxDQUFFRCxLQUFLLEVBQUc7SUFDNUIsSUFBSSxDQUFDSCx5QkFBeUIsR0FBRyxJQUFJO0lBQ3JDLElBQUksQ0FBQ0MscUJBQXFCLEdBQUdFLEtBQUs7RUFDcEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxNQUFNQSxDQUFFekMsQ0FBQyxFQUFFQyxDQUFDLEVBQUc7SUFDYnlCLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU8xQixDQUFDLEtBQUssUUFBUSxJQUFJMEMsUUFBUSxDQUFFMUMsQ0FBRSxDQUFDLEVBQUcsOEJBQTZCQSxDQUFFLEVBQUUsQ0FBQztJQUM3RjBCLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU96QixDQUFDLEtBQUssUUFBUSxJQUFJeUMsUUFBUSxDQUFFekMsQ0FBRSxDQUFDLEVBQUcsOEJBQTZCQSxDQUFFLEVBQUUsQ0FBQztJQUM3RixPQUFPLElBQUksQ0FBQzBDLFdBQVcsQ0FBRTVDLENBQUMsQ0FBRUMsQ0FBQyxFQUFFQyxDQUFFLENBQUUsQ0FBQztFQUN0Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UyQyxjQUFjQSxDQUFFNUMsQ0FBQyxFQUFFQyxDQUFDLEVBQUc7SUFDckJ5QixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPMUIsQ0FBQyxLQUFLLFFBQVEsSUFBSTBDLFFBQVEsQ0FBRTFDLENBQUUsQ0FBQyxFQUFHLDhCQUE2QkEsQ0FBRSxFQUFFLENBQUM7SUFDN0YwQixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPekIsQ0FBQyxLQUFLLFFBQVEsSUFBSXlDLFFBQVEsQ0FBRXpDLENBQUUsQ0FBQyxFQUFHLDhCQUE2QkEsQ0FBRSxFQUFFLENBQUM7SUFDN0YsT0FBTyxJQUFJLENBQUM0QyxtQkFBbUIsQ0FBRTlDLENBQUMsQ0FBRUMsQ0FBQyxFQUFFQyxDQUFFLENBQUUsQ0FBQztFQUM5Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFNEMsbUJBQW1CQSxDQUFFTixLQUFLLEVBQUc7SUFDM0IsT0FBTyxJQUFJLENBQUNJLFdBQVcsQ0FBRSxJQUFJLENBQUNHLGdCQUFnQixDQUFDLENBQUMsQ0FBQ0MsSUFBSSxDQUFFUixLQUFNLENBQUUsQ0FBQztFQUNsRTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxXQUFXQSxDQUFFSixLQUFLLEVBQUc7SUFDbkIsSUFBSSxDQUFDZCxVQUFVLENBQUUsSUFBSWpDLE9BQU8sQ0FBQyxDQUFDLENBQUN3RCxRQUFRLENBQUVULEtBQU0sQ0FBRSxDQUFDO0lBQ2xELElBQUksQ0FBQ3RCLGtCQUFrQixDQUFDLENBQUM7SUFFekIsT0FBTyxJQUFJLENBQUMsQ0FBQztFQUNmOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWdDLE1BQU1BLENBQUVqRCxDQUFDLEVBQUVDLENBQUMsRUFBRztJQUNieUIsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBTzFCLENBQUMsS0FBSyxRQUFRLElBQUkwQyxRQUFRLENBQUUxQyxDQUFFLENBQUMsRUFBRyw4QkFBNkJBLENBQUUsRUFBRSxDQUFDO0lBQzdGMEIsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT3pCLENBQUMsS0FBSyxRQUFRLElBQUl5QyxRQUFRLENBQUV6QyxDQUFFLENBQUMsRUFBRyw4QkFBNkJBLENBQUUsRUFBRSxDQUFDO0lBQzdGLE9BQU8sSUFBSSxDQUFDaUQsV0FBVyxDQUFFbkQsQ0FBQyxDQUFFQyxDQUFDLEVBQUVDLENBQUUsQ0FBRSxDQUFDO0VBQ3RDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWtELGNBQWNBLENBQUVuRCxDQUFDLEVBQUVDLENBQUMsRUFBRztJQUNyQnlCLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU8xQixDQUFDLEtBQUssUUFBUSxJQUFJMEMsUUFBUSxDQUFFMUMsQ0FBRSxDQUFDLEVBQUcsOEJBQTZCQSxDQUFFLEVBQUUsQ0FBQztJQUM3RjBCLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU96QixDQUFDLEtBQUssUUFBUSxJQUFJeUMsUUFBUSxDQUFFekMsQ0FBRSxDQUFDLEVBQUcsOEJBQTZCQSxDQUFFLEVBQUUsQ0FBQztJQUM3RixPQUFPLElBQUksQ0FBQ21ELG1CQUFtQixDQUFFckQsQ0FBQyxDQUFFQyxDQUFDLEVBQUVDLENBQUUsQ0FBRSxDQUFDO0VBQzlDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VtRCxtQkFBbUJBLENBQUViLEtBQUssRUFBRztJQUMzQixPQUFPLElBQUksQ0FBQ1csV0FBVyxDQUFFLElBQUksQ0FBQ0osZ0JBQWdCLENBQUMsQ0FBQyxDQUFDQyxJQUFJLENBQUVSLEtBQU0sQ0FBRSxDQUFDO0VBQ2xFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VXLFdBQVdBLENBQUVYLEtBQUssRUFBRztJQUNuQjtJQUNBLElBQUssSUFBSSxDQUFDYyxXQUFXLENBQUMsQ0FBQyxFQUFHO01BQ3hCLE1BQU1DLEtBQUssR0FBRyxJQUFJLENBQUNDLGNBQWMsQ0FBQyxDQUFDLENBQUNDLFlBQVksQ0FBQyxDQUFDO01BQ2xELE1BQU1DLEdBQUcsR0FBR2xCLEtBQUs7TUFDakIsTUFBTW1CLElBQUksR0FBRyxJQUFJckUsSUFBSSxDQUFFaUUsS0FBSyxFQUFFRyxHQUFJLENBQUM7TUFDbkMsSUFBSSxDQUFDRixjQUFjLENBQUMsQ0FBQyxDQUFDUCxRQUFRLENBQUVTLEdBQUksQ0FBQztNQUNyQyxJQUFJLENBQUNFLG1CQUFtQixDQUFFRCxJQUFLLENBQUM7SUFDbEMsQ0FBQyxNQUNJO01BQ0gsSUFBSSxDQUFDRSxNQUFNLENBQUVyQixLQUFNLENBQUM7SUFDdEI7SUFDQSxJQUFJLENBQUN0QixrQkFBa0IsQ0FBQyxDQUFDO0lBRXpCLE9BQU8sSUFBSSxDQUFDLENBQUU7RUFDaEI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRTRDLGdCQUFnQkEsQ0FBRTdELENBQUMsRUFBRztJQUNwQixPQUFPLElBQUksQ0FBQ2lELE1BQU0sQ0FBRWpELENBQUMsRUFBRSxJQUFJLENBQUM4QyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM3QyxDQUFFLENBQUM7RUFDcEQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRTZELHdCQUF3QkEsQ0FBRTlELENBQUMsRUFBRztJQUM1QixPQUFPLElBQUksQ0FBQ21ELGNBQWMsQ0FBRW5ELENBQUMsRUFBRSxDQUFFLENBQUM7RUFDcEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRStELGNBQWNBLENBQUU5RCxDQUFDLEVBQUc7SUFDbEIsT0FBTyxJQUFJLENBQUNnRCxNQUFNLENBQUUsSUFBSSxDQUFDSCxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM5QyxDQUFDLEVBQUVDLENBQUUsQ0FBQztFQUNwRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFK0Qsc0JBQXNCQSxDQUFFL0QsQ0FBQyxFQUFHO0lBQzFCLE9BQU8sSUFBSSxDQUFDa0QsY0FBYyxDQUFFLENBQUMsRUFBRWxELENBQUUsQ0FBQztFQUNwQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFZ0UsUUFBUUEsQ0FBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsYUFBYSxFQUFFQyxXQUFXLEVBQUc7SUFDNUQsT0FBTyxJQUFJLENBQUNDLGFBQWEsQ0FBRSxJQUFJekYsT0FBTyxDQUFFb0YsSUFBSSxFQUFFQyxJQUFLLENBQUMsRUFBRUMsU0FBUyxFQUFFQyxhQUFhLEVBQUVDLFdBQVksQ0FBQztFQUMvRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxhQUFhQSxDQUFFQyxRQUFRLEVBQUVKLFNBQVMsRUFBRUMsYUFBYSxFQUFFQyxXQUFXLEVBQUc7SUFFL0Q1QyxNQUFNLElBQUlBLE1BQU0sQ0FBRStDLE1BQU0sQ0FBQ0MsU0FBUyxDQUFFTCxhQUFjLENBQUMsRUFBRyxxQ0FBb0NBLGFBQWMsRUFBRSxDQUFDO0lBRTNHLElBQUksQ0FBQ1QsTUFBTSxDQUFFWSxRQUFTLENBQUM7SUFDdkIsTUFBTUcsVUFBVSxHQUFHLElBQUksQ0FBQ25CLFlBQVksQ0FBQyxDQUFDO0lBQ3RDLE1BQU1vQixLQUFLLEdBQUdKLFFBQVEsQ0FBQ0ssS0FBSyxDQUFFRixVQUFXLENBQUM7SUFDMUMsTUFBTUcsbUJBQW1CLEdBQUdGLEtBQUssQ0FBQ0csVUFBVSxDQUFDLENBQUM7SUFDOUMsTUFBTUMscUJBQXFCLEdBQUdGLG1CQUFtQixDQUFDRyxhQUFhLENBQUNDLEtBQUssQ0FBRWQsU0FBVSxDQUFDO0lBRWxGLElBQUllLFVBQVU7SUFDZCxJQUFLYixXQUFXLEVBQUc7TUFDakI7TUFDQWEsVUFBVSxHQUFHUCxLQUFLLENBQUNRLFNBQVMsSUFBS2YsYUFBYSxHQUFHLEdBQUcsQ0FBRTtJQUN4RCxDQUFDLE1BQ0k7TUFDSGMsVUFBVSxHQUFHUCxLQUFLLENBQUNRLFNBQVMsR0FBR2YsYUFBYTtJQUM5QztJQUVBLEtBQU0sSUFBSTlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzhDLGFBQWEsRUFBRTlDLENBQUMsRUFBRSxFQUFHO01BQ3hDLE1BQU04RCxVQUFVLEdBQUdQLG1CQUFtQixDQUFDSSxLQUFLLENBQUUzRCxDQUFDLEdBQUc0RCxVQUFXLENBQUMsQ0FBQ3BDLElBQUksQ0FBRTRCLFVBQVcsQ0FBQztNQUNqRixNQUFNVyxRQUFRLEdBQUdELFVBQVUsQ0FBQ3RDLElBQUksQ0FBRStCLG1CQUFtQixDQUFDSSxLQUFLLENBQUVDLFVBQVUsR0FBRyxDQUFFLENBQUUsQ0FBQyxDQUFDcEMsSUFBSSxDQUFFaUMscUJBQXNCLENBQUM7TUFDN0csTUFBTU8sV0FBVyxHQUFHRixVQUFVLENBQUN0QyxJQUFJLENBQUUrQixtQkFBbUIsQ0FBQ0ksS0FBSyxDQUFFLENBQUMsR0FBR0MsVUFBVSxHQUFHLENBQUUsQ0FBRSxDQUFDLENBQUNOLEtBQUssQ0FBRUcscUJBQXNCLENBQUM7TUFDckgsSUFBSSxDQUFDOUIsV0FBVyxDQUFFb0MsUUFBUyxDQUFDO01BQzVCLElBQUksQ0FBQ3BDLFdBQVcsQ0FBRXFDLFdBQVksQ0FBQztJQUNqQzs7SUFFQTtJQUNBLElBQUtqQixXQUFXLEVBQUc7TUFDakIsTUFBTWUsVUFBVSxHQUFHUCxtQkFBbUIsQ0FBQ0ksS0FBSyxDQUFFYixhQUFhLEdBQUdjLFVBQVcsQ0FBQyxDQUFDcEMsSUFBSSxDQUFFNEIsVUFBVyxDQUFDO01BQzdGLE1BQU1XLFFBQVEsR0FBR0QsVUFBVSxDQUFDdEMsSUFBSSxDQUFFK0IsbUJBQW1CLENBQUNJLEtBQUssQ0FBRUMsVUFBVSxHQUFHLENBQUUsQ0FBRSxDQUFDLENBQUNwQyxJQUFJLENBQUVpQyxxQkFBc0IsQ0FBQztNQUM3RyxJQUFJLENBQUM5QixXQUFXLENBQUVvQyxRQUFTLENBQUM7SUFDOUI7SUFFQSxPQUFPLElBQUksQ0FBQ3BDLFdBQVcsQ0FBRXNCLFFBQVMsQ0FBQztFQUNyQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWdCLGdCQUFnQkEsQ0FBRUMsR0FBRyxFQUFFQyxHQUFHLEVBQUUxRixDQUFDLEVBQUVDLENBQUMsRUFBRztJQUNqQ3lCLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU8rRCxHQUFHLEtBQUssUUFBUSxJQUFJL0MsUUFBUSxDQUFFK0MsR0FBSSxDQUFDLEVBQUcsZ0NBQStCQSxHQUFJLEVBQUUsQ0FBQztJQUNyRy9ELE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU9nRSxHQUFHLEtBQUssUUFBUSxJQUFJaEQsUUFBUSxDQUFFZ0QsR0FBSSxDQUFDLEVBQUcsZ0NBQStCQSxHQUFJLEVBQUUsQ0FBQztJQUNyR2hFLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU8xQixDQUFDLEtBQUssUUFBUSxJQUFJMEMsUUFBUSxDQUFFMUMsQ0FBRSxDQUFDLEVBQUcsOEJBQTZCQSxDQUFFLEVBQUUsQ0FBQztJQUM3RjBCLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU96QixDQUFDLEtBQUssUUFBUSxJQUFJeUMsUUFBUSxDQUFFekMsQ0FBRSxDQUFDLEVBQUcsOEJBQTZCQSxDQUFFLEVBQUUsQ0FBQztJQUM3RixPQUFPLElBQUksQ0FBQzBGLHFCQUFxQixDQUFFNUYsQ0FBQyxDQUFFMEYsR0FBRyxFQUFFQyxHQUFJLENBQUMsRUFBRTNGLENBQUMsQ0FBRUMsQ0FBQyxFQUFFQyxDQUFFLENBQUUsQ0FBQztFQUMvRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UyRix3QkFBd0JBLENBQUVILEdBQUcsRUFBRUMsR0FBRyxFQUFFMUYsQ0FBQyxFQUFFQyxDQUFDLEVBQUc7SUFDekN5QixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPK0QsR0FBRyxLQUFLLFFBQVEsSUFBSS9DLFFBQVEsQ0FBRStDLEdBQUksQ0FBQyxFQUFHLGdDQUErQkEsR0FBSSxFQUFFLENBQUM7SUFDckcvRCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPZ0UsR0FBRyxLQUFLLFFBQVEsSUFBSWhELFFBQVEsQ0FBRWdELEdBQUksQ0FBQyxFQUFHLGdDQUErQkEsR0FBSSxFQUFFLENBQUM7SUFDckdoRSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPMUIsQ0FBQyxLQUFLLFFBQVEsSUFBSTBDLFFBQVEsQ0FBRTFDLENBQUUsQ0FBQyxFQUFHLDhCQUE2QkEsQ0FBRSxFQUFFLENBQUM7SUFDN0YwQixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPekIsQ0FBQyxLQUFLLFFBQVEsSUFBSXlDLFFBQVEsQ0FBRXpDLENBQUUsQ0FBQyxFQUFHLDhCQUE2QkEsQ0FBRSxFQUFFLENBQUM7SUFDN0YsT0FBTyxJQUFJLENBQUM0Riw2QkFBNkIsQ0FBRTlGLENBQUMsQ0FBRTBGLEdBQUcsRUFBRUMsR0FBSSxDQUFDLEVBQUUzRixDQUFDLENBQUVDLENBQUMsRUFBRUMsQ0FBRSxDQUFFLENBQUM7RUFDdkU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0U0Riw2QkFBNkJBLENBQUVDLFlBQVksRUFBRXZELEtBQUssRUFBRztJQUNuRCxNQUFNd0QsYUFBYSxHQUFHLElBQUksQ0FBQ2pELGdCQUFnQixDQUFDLENBQUM7SUFDN0MsT0FBTyxJQUFJLENBQUM2QyxxQkFBcUIsQ0FBRUksYUFBYSxDQUFDaEQsSUFBSSxDQUFFK0MsWUFBYSxDQUFDLEVBQUVDLGFBQWEsQ0FBQ2hELElBQUksQ0FBRVIsS0FBTSxDQUFFLENBQUM7RUFDdEc7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFeUQsc0JBQXNCQSxDQUFFaEcsQ0FBQyxFQUFFQyxDQUFDLEVBQUc7SUFDN0J5QixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPMUIsQ0FBQyxLQUFLLFFBQVEsSUFBSTBDLFFBQVEsQ0FBRTFDLENBQUUsQ0FBQyxFQUFHLDhCQUE2QkEsQ0FBRSxFQUFFLENBQUM7SUFDN0YwQixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPekIsQ0FBQyxLQUFLLFFBQVEsSUFBSXlDLFFBQVEsQ0FBRXpDLENBQUUsQ0FBQyxFQUFHLDhCQUE2QkEsQ0FBRSxFQUFFLENBQUM7SUFDN0YsT0FBTyxJQUFJLENBQUMwRixxQkFBcUIsQ0FBRSxJQUFJLENBQUNNLDhCQUE4QixDQUFDLENBQUMsRUFBRWxHLENBQUMsQ0FBRUMsQ0FBQyxFQUFFQyxDQUFFLENBQUUsQ0FBQztFQUN2Rjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWlHLDhCQUE4QkEsQ0FBRWxHLENBQUMsRUFBRUMsQ0FBQyxFQUFHO0lBQ3JDeUIsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBTzFCLENBQUMsS0FBSyxRQUFRLElBQUkwQyxRQUFRLENBQUUxQyxDQUFFLENBQUMsRUFBRyw4QkFBNkJBLENBQUUsRUFBRSxDQUFDO0lBQzdGMEIsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT3pCLENBQUMsS0FBSyxRQUFRLElBQUl5QyxRQUFRLENBQUV6QyxDQUFFLENBQUMsRUFBRyw4QkFBNkJBLENBQUUsRUFBRSxDQUFDO0lBQzdGLE9BQU8sSUFBSSxDQUFDMEYscUJBQXFCLENBQUUsSUFBSSxDQUFDTSw4QkFBOEIsQ0FBQyxDQUFDLEVBQUVsRyxDQUFDLENBQUVDLENBQUMsRUFBRUMsQ0FBRSxDQUFDLENBQUM4QyxJQUFJLENBQUUsSUFBSSxDQUFDRCxnQkFBZ0IsQ0FBQyxDQUFFLENBQUUsQ0FBQztFQUN2SDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0U2QyxxQkFBcUJBLENBQUVHLFlBQVksRUFBRXZELEtBQUssRUFBRztJQUMzQztJQUNBLElBQUksQ0FBQ3FCLE1BQU0sQ0FBRWtDLFlBQWEsQ0FBQztJQUMzQixNQUFNeEMsS0FBSyxHQUFHLElBQUksQ0FBQ0MsY0FBYyxDQUFDLENBQUMsQ0FBQ0MsWUFBWSxDQUFDLENBQUM7SUFDbEQsTUFBTTJDLFNBQVMsR0FBRyxJQUFJNUcsU0FBUyxDQUFFK0QsS0FBSyxFQUFFd0MsWUFBWSxFQUFFdkQsS0FBTSxDQUFDO0lBQzdELElBQUksQ0FBQ2dCLGNBQWMsQ0FBQyxDQUFDLENBQUNQLFFBQVEsQ0FBRVQsS0FBTSxDQUFDO0lBQ3ZDLE1BQU02RCxxQkFBcUIsR0FBR0QsU0FBUyxDQUFDRSx3QkFBd0IsQ0FBQyxDQUFDO0lBQ2xFMUUsQ0FBQyxDQUFDQyxJQUFJLENBQUV3RSxxQkFBcUIsRUFBRUUsT0FBTyxJQUFJO01BQ3hDO01BQ0EsSUFBSSxDQUFDM0MsbUJBQW1CLENBQUUyQyxPQUFRLENBQUM7SUFDckMsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDaEUsd0JBQXdCLENBQUV3RCxZQUFhLENBQUM7SUFFN0MsT0FBTyxJQUFJLENBQUMsQ0FBRTtFQUNoQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVMsWUFBWUEsQ0FBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFM0csQ0FBQyxFQUFFQyxDQUFDLEVBQUc7SUFDM0N5QixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPOEUsSUFBSSxLQUFLLFFBQVEsSUFBSTlELFFBQVEsQ0FBRThELElBQUssQ0FBQyxFQUFHLGlDQUFnQ0EsSUFBSyxFQUFFLENBQUM7SUFDekc5RSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPK0UsSUFBSSxLQUFLLFFBQVEsSUFBSS9ELFFBQVEsQ0FBRStELElBQUssQ0FBQyxFQUFHLGlDQUFnQ0EsSUFBSyxFQUFFLENBQUM7SUFDekcvRSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPZ0YsSUFBSSxLQUFLLFFBQVEsSUFBSWhFLFFBQVEsQ0FBRWdFLElBQUssQ0FBQyxFQUFHLGlDQUFnQ0EsSUFBSyxFQUFFLENBQUM7SUFDekdoRixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPaUYsSUFBSSxLQUFLLFFBQVEsSUFBSWpFLFFBQVEsQ0FBRWlFLElBQUssQ0FBQyxFQUFHLGlDQUFnQ0EsSUFBSyxFQUFFLENBQUM7SUFDekdqRixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPMUIsQ0FBQyxLQUFLLFFBQVEsSUFBSTBDLFFBQVEsQ0FBRTFDLENBQUUsQ0FBQyxFQUFHLDhCQUE2QkEsQ0FBRSxFQUFFLENBQUM7SUFDN0YwQixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPekIsQ0FBQyxLQUFLLFFBQVEsSUFBSXlDLFFBQVEsQ0FBRXpDLENBQUUsQ0FBQyxFQUFHLDhCQUE2QkEsQ0FBRSxFQUFFLENBQUM7SUFDN0YsT0FBTyxJQUFJLENBQUMyRyxpQkFBaUIsQ0FBRTdHLENBQUMsQ0FBRXlHLElBQUksRUFBRUMsSUFBSyxDQUFDLEVBQUUxRyxDQUFDLENBQUUyRyxJQUFJLEVBQUVDLElBQUssQ0FBQyxFQUFFNUcsQ0FBQyxDQUFFQyxDQUFDLEVBQUVDLENBQUUsQ0FBRSxDQUFDO0VBQzlFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRTRHLG9CQUFvQkEsQ0FBRUwsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFM0csQ0FBQyxFQUFFQyxDQUFDLEVBQUc7SUFDbkR5QixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPOEUsSUFBSSxLQUFLLFFBQVEsSUFBSTlELFFBQVEsQ0FBRThELElBQUssQ0FBQyxFQUFHLGlDQUFnQ0EsSUFBSyxFQUFFLENBQUM7SUFDekc5RSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPK0UsSUFBSSxLQUFLLFFBQVEsSUFBSS9ELFFBQVEsQ0FBRStELElBQUssQ0FBQyxFQUFHLGlDQUFnQ0EsSUFBSyxFQUFFLENBQUM7SUFDekcvRSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPZ0YsSUFBSSxLQUFLLFFBQVEsSUFBSWhFLFFBQVEsQ0FBRWdFLElBQUssQ0FBQyxFQUFHLGlDQUFnQ0EsSUFBSyxFQUFFLENBQUM7SUFDekdoRixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPaUYsSUFBSSxLQUFLLFFBQVEsSUFBSWpFLFFBQVEsQ0FBRWlFLElBQUssQ0FBQyxFQUFHLGlDQUFnQ0EsSUFBSyxFQUFFLENBQUM7SUFDekdqRixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPMUIsQ0FBQyxLQUFLLFFBQVEsSUFBSTBDLFFBQVEsQ0FBRTFDLENBQUUsQ0FBQyxFQUFHLDhCQUE2QkEsQ0FBRSxFQUFFLENBQUM7SUFDN0YwQixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPekIsQ0FBQyxLQUFLLFFBQVEsSUFBSXlDLFFBQVEsQ0FBRXpDLENBQUUsQ0FBQyxFQUFHLDhCQUE2QkEsQ0FBRSxFQUFFLENBQUM7SUFDN0YsT0FBTyxJQUFJLENBQUM2Ryx5QkFBeUIsQ0FBRS9HLENBQUMsQ0FBRXlHLElBQUksRUFBRUMsSUFBSyxDQUFDLEVBQUUxRyxDQUFDLENBQUUyRyxJQUFJLEVBQUVDLElBQUssQ0FBQyxFQUFFNUcsQ0FBQyxDQUFFQyxDQUFDLEVBQUVDLENBQUUsQ0FBRSxDQUFDO0VBQ3RGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRTZHLHlCQUF5QkEsQ0FBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUV6RSxLQUFLLEVBQUc7SUFDckQsTUFBTXdELGFBQWEsR0FBRyxJQUFJLENBQUNqRCxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzdDLE9BQU8sSUFBSSxDQUFDOEQsaUJBQWlCLENBQUViLGFBQWEsQ0FBQ2hELElBQUksQ0FBRWdFLFFBQVMsQ0FBQyxFQUFFaEIsYUFBYSxDQUFDaEQsSUFBSSxDQUFFaUUsUUFBUyxDQUFDLEVBQUVqQixhQUFhLENBQUNoRCxJQUFJLENBQUVSLEtBQU0sQ0FBRSxDQUFDO0VBQzlIOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFMEUsa0JBQWtCQSxDQUFFUCxJQUFJLEVBQUVDLElBQUksRUFBRTNHLENBQUMsRUFBRUMsQ0FBQyxFQUFHO0lBQ3JDeUIsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT2dGLElBQUksS0FBSyxRQUFRLElBQUloRSxRQUFRLENBQUVnRSxJQUFLLENBQUMsRUFBRyxpQ0FBZ0NBLElBQUssRUFBRSxDQUFDO0lBQ3pHaEYsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT2lGLElBQUksS0FBSyxRQUFRLElBQUlqRSxRQUFRLENBQUVpRSxJQUFLLENBQUMsRUFBRyxpQ0FBZ0NBLElBQUssRUFBRSxDQUFDO0lBQ3pHakYsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBTzFCLENBQUMsS0FBSyxRQUFRLElBQUkwQyxRQUFRLENBQUUxQyxDQUFFLENBQUMsRUFBRyw4QkFBNkJBLENBQUUsRUFBRSxDQUFDO0lBQzdGMEIsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT3pCLENBQUMsS0FBSyxRQUFRLElBQUl5QyxRQUFRLENBQUV6QyxDQUFFLENBQUMsRUFBRyw4QkFBNkJBLENBQUUsRUFBRSxDQUFDO0lBQzdGLE9BQU8sSUFBSSxDQUFDMkcsaUJBQWlCLENBQUUsSUFBSSxDQUFDTSwwQkFBMEIsQ0FBQyxDQUFDLEVBQUVuSCxDQUFDLENBQUUyRyxJQUFJLEVBQUVDLElBQUssQ0FBQyxFQUFFNUcsQ0FBQyxDQUFFQyxDQUFDLEVBQUVDLENBQUUsQ0FBRSxDQUFDO0VBQ2hHOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFa0gsMEJBQTBCQSxDQUFFVCxJQUFJLEVBQUVDLElBQUksRUFBRTNHLENBQUMsRUFBRUMsQ0FBQyxFQUFHO0lBQzdDeUIsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT2dGLElBQUksS0FBSyxRQUFRLElBQUloRSxRQUFRLENBQUVnRSxJQUFLLENBQUMsRUFBRyxpQ0FBZ0NBLElBQUssRUFBRSxDQUFDO0lBQ3pHaEYsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT2lGLElBQUksS0FBSyxRQUFRLElBQUlqRSxRQUFRLENBQUVpRSxJQUFLLENBQUMsRUFBRyxpQ0FBZ0NBLElBQUssRUFBRSxDQUFDO0lBQ3pHakYsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBTzFCLENBQUMsS0FBSyxRQUFRLElBQUkwQyxRQUFRLENBQUUxQyxDQUFFLENBQUMsRUFBRyw4QkFBNkJBLENBQUUsRUFBRSxDQUFDO0lBQzdGMEIsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT3pCLENBQUMsS0FBSyxRQUFRLElBQUl5QyxRQUFRLENBQUV6QyxDQUFFLENBQUMsRUFBRyw4QkFBNkJBLENBQUUsRUFBRSxDQUFDO0lBQzdGLE9BQU8sSUFBSSxDQUFDMkcsaUJBQWlCLENBQUUsSUFBSSxDQUFDTSwwQkFBMEIsQ0FBQyxDQUFDLEVBQUVuSCxDQUFDLENBQUUyRyxJQUFJLEVBQUVDLElBQUssQ0FBQyxDQUFDNUQsSUFBSSxDQUFFLElBQUksQ0FBQ0QsZ0JBQWdCLENBQUMsQ0FBRSxDQUFDLEVBQUUvQyxDQUFDLENBQUVDLENBQUMsRUFBRUMsQ0FBRSxDQUFDLENBQUM4QyxJQUFJLENBQUUsSUFBSSxDQUFDRCxnQkFBZ0IsQ0FBQyxDQUFFLENBQUUsQ0FBQztFQUNoSzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0U4RCxpQkFBaUJBLENBQUVHLFFBQVEsRUFBRUMsUUFBUSxFQUFFekUsS0FBSyxFQUFHO0lBQzdDO0lBQ0EsSUFBSSxDQUFDcUIsTUFBTSxDQUFFbUQsUUFBUyxDQUFDO0lBQ3ZCLE1BQU16RCxLQUFLLEdBQUcsSUFBSSxDQUFDQyxjQUFjLENBQUMsQ0FBQyxDQUFDQyxZQUFZLENBQUMsQ0FBQztJQUNsRCxNQUFNNEQsS0FBSyxHQUFHLElBQUluSSxLQUFLLENBQUVxRSxLQUFLLEVBQUV5RCxRQUFRLEVBQUVDLFFBQVEsRUFBRXpFLEtBQU0sQ0FBQztJQUUzRCxNQUFNNkQscUJBQXFCLEdBQUdnQixLQUFLLENBQUNmLHdCQUF3QixDQUFDLENBQUM7SUFDOUQxRSxDQUFDLENBQUNDLElBQUksQ0FBRXdFLHFCQUFxQixFQUFFRSxPQUFPLElBQUk7TUFDeEMsSUFBSSxDQUFDM0MsbUJBQW1CLENBQUUyQyxPQUFRLENBQUM7SUFDckMsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDL0MsY0FBYyxDQUFDLENBQUMsQ0FBQ1AsUUFBUSxDQUFFVCxLQUFNLENBQUM7SUFFdkMsSUFBSSxDQUFDQyxvQkFBb0IsQ0FBRXdFLFFBQVMsQ0FBQztJQUVyQyxPQUFPLElBQUksQ0FBQyxDQUFFO0VBQ2hCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUssR0FBR0EsQ0FBRUMsT0FBTyxFQUFFQyxPQUFPLEVBQUVDLE1BQU0sRUFBRUMsVUFBVSxFQUFFQyxRQUFRLEVBQUVDLGFBQWEsRUFBRztJQUNuRWpHLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU80RixPQUFPLEtBQUssUUFBUSxJQUFJNUUsUUFBUSxDQUFFNEUsT0FBUSxDQUFDLEVBQUcsb0NBQW1DQSxPQUFRLEVBQUUsQ0FBQztJQUNySDVGLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU82RixPQUFPLEtBQUssUUFBUSxJQUFJN0UsUUFBUSxDQUFFNkUsT0FBUSxDQUFDLEVBQUcsb0NBQW1DQSxPQUFRLEVBQUUsQ0FBQztJQUNySCxPQUFPLElBQUksQ0FBQ0ssUUFBUSxDQUFFN0gsQ0FBQyxDQUFFdUgsT0FBTyxFQUFFQyxPQUFRLENBQUMsRUFBRUMsTUFBTSxFQUFFQyxVQUFVLEVBQUVDLFFBQVEsRUFBRUMsYUFBYyxDQUFDO0VBQzVGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFFBQVFBLENBQUVDLE1BQU0sRUFBRUwsTUFBTSxFQUFFQyxVQUFVLEVBQUVDLFFBQVEsRUFBRUMsYUFBYSxFQUFHO0lBQzlEO0lBQ0EsSUFBS0EsYUFBYSxLQUFLMUYsU0FBUyxFQUFHO01BQ2pDMEYsYUFBYSxHQUFHLEtBQUs7SUFDdkI7SUFFQSxNQUFNTixHQUFHLEdBQUcsSUFBSXJJLEdBQUcsQ0FBRTZJLE1BQU0sRUFBRUwsTUFBTSxFQUFFQyxVQUFVLEVBQUVDLFFBQVEsRUFBRUMsYUFBYyxDQUFDOztJQUUxRTtJQUNBLE1BQU1oRCxVQUFVLEdBQUcwQyxHQUFHLENBQUNTLFFBQVEsQ0FBQyxDQUFDO0lBQ2pDLE1BQU10RCxRQUFRLEdBQUc2QyxHQUFHLENBQUNVLE1BQU0sQ0FBQyxDQUFDOztJQUU3QjtJQUNBLElBQUssSUFBSSxDQUFDMUUsV0FBVyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUNFLGNBQWMsQ0FBQyxDQUFDLENBQUN5RSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDckQsVUFBVSxDQUFDc0QsTUFBTSxDQUFFLElBQUksQ0FBQzFFLGNBQWMsQ0FBQyxDQUFDLENBQUNDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQUc7TUFDbEksSUFBSSxDQUFDRyxtQkFBbUIsQ0FBRSxJQUFJdEUsSUFBSSxDQUFFLElBQUksQ0FBQ2tFLGNBQWMsQ0FBQyxDQUFDLENBQUNDLFlBQVksQ0FBQyxDQUFDLEVBQUVtQixVQUFXLENBQUUsQ0FBQztJQUMxRjtJQUVBLElBQUssQ0FBQyxJQUFJLENBQUN0QixXQUFXLENBQUMsQ0FBQyxFQUFHO01BQ3pCLElBQUksQ0FBQzVCLFVBQVUsQ0FBRSxJQUFJakMsT0FBTyxDQUFDLENBQUUsQ0FBQztJQUNsQzs7SUFFQTtJQUNBLElBQUksQ0FBQytELGNBQWMsQ0FBQyxDQUFDLENBQUNQLFFBQVEsQ0FBRTJCLFVBQVcsQ0FBQztJQUM1QyxJQUFJLENBQUNwQixjQUFjLENBQUMsQ0FBQyxDQUFDUCxRQUFRLENBQUV3QixRQUFTLENBQUM7SUFFMUMsSUFBSSxDQUFDYixtQkFBbUIsQ0FBRTBELEdBQUksQ0FBQztJQUMvQixJQUFJLENBQUNwRyxrQkFBa0IsQ0FBQyxDQUFDO0lBRXpCLE9BQU8sSUFBSSxDQUFDLENBQUU7RUFDaEI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFaUgsYUFBYUEsQ0FBRVosT0FBTyxFQUFFQyxPQUFPLEVBQUVZLE9BQU8sRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUVaLFVBQVUsRUFBRUMsUUFBUSxFQUFFQyxhQUFhLEVBQUc7SUFDakdqRyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPNEYsT0FBTyxLQUFLLFFBQVEsSUFBSTVFLFFBQVEsQ0FBRTRFLE9BQVEsQ0FBQyxFQUFHLG9DQUFtQ0EsT0FBUSxFQUFFLENBQUM7SUFDckg1RixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPNkYsT0FBTyxLQUFLLFFBQVEsSUFBSTdFLFFBQVEsQ0FBRTZFLE9BQVEsQ0FBQyxFQUFHLG9DQUFtQ0EsT0FBUSxFQUFFLENBQUM7SUFDckgsT0FBTyxJQUFJLENBQUNlLGtCQUFrQixDQUFFdkksQ0FBQyxDQUFFdUgsT0FBTyxFQUFFQyxPQUFRLENBQUMsRUFBRVksT0FBTyxFQUFFQyxPQUFPLEVBQUVDLFFBQVEsRUFBRVosVUFBVSxFQUFFQyxRQUFRLEVBQUVDLGFBQWMsQ0FBQztFQUMxSDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFVyxrQkFBa0JBLENBQUVULE1BQU0sRUFBRU0sT0FBTyxFQUFFQyxPQUFPLEVBQUVDLFFBQVEsRUFBRVosVUFBVSxFQUFFQyxRQUFRLEVBQUVDLGFBQWEsRUFBRztJQUM1RjtJQUNBLElBQUtBLGFBQWEsS0FBSzFGLFNBQVMsRUFBRztNQUNqQzBGLGFBQWEsR0FBRyxLQUFLO0lBQ3ZCO0lBRUEsTUFBTU8sYUFBYSxHQUFHLElBQUloSixhQUFhLENBQUUySSxNQUFNLEVBQUVNLE9BQU8sRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUVaLFVBQVUsRUFBRUMsUUFBUSxFQUFFQyxhQUFjLENBQUM7O0lBRWxIO0lBQ0EsTUFBTWhELFVBQVUsR0FBR3VELGFBQWEsQ0FBQzVFLEtBQUs7SUFDdEMsTUFBTWtCLFFBQVEsR0FBRzBELGFBQWEsQ0FBQ3pFLEdBQUc7O0lBRWxDO0lBQ0EsSUFBSyxJQUFJLENBQUNKLFdBQVcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDRSxjQUFjLENBQUMsQ0FBQyxDQUFDeUUsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQ3JELFVBQVUsQ0FBQ3NELE1BQU0sQ0FBRSxJQUFJLENBQUMxRSxjQUFjLENBQUMsQ0FBQyxDQUFDQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUFHO01BQ2xJLElBQUksQ0FBQ0csbUJBQW1CLENBQUUsSUFBSXRFLElBQUksQ0FBRSxJQUFJLENBQUNrRSxjQUFjLENBQUMsQ0FBQyxDQUFDQyxZQUFZLENBQUMsQ0FBQyxFQUFFbUIsVUFBVyxDQUFFLENBQUM7SUFDMUY7SUFFQSxJQUFLLENBQUMsSUFBSSxDQUFDdEIsV0FBVyxDQUFDLENBQUMsRUFBRztNQUN6QixJQUFJLENBQUM1QixVQUFVLENBQUUsSUFBSWpDLE9BQU8sQ0FBQyxDQUFFLENBQUM7SUFDbEM7O0lBRUE7SUFDQSxJQUFJLENBQUMrRCxjQUFjLENBQUMsQ0FBQyxDQUFDUCxRQUFRLENBQUUyQixVQUFXLENBQUM7SUFDNUMsSUFBSSxDQUFDcEIsY0FBYyxDQUFDLENBQUMsQ0FBQ1AsUUFBUSxDQUFFd0IsUUFBUyxDQUFDO0lBRTFDLElBQUksQ0FBQ2IsbUJBQW1CLENBQUV1RSxhQUFjLENBQUM7SUFDekMsSUFBSSxDQUFDakgsa0JBQWtCLENBQUMsQ0FBQztJQUV6QixPQUFPLElBQUksQ0FBQyxDQUFFO0VBQ2hCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFc0gsS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSyxJQUFJLENBQUNsRixXQUFXLENBQUMsQ0FBQyxFQUFHO01BQ3hCLE1BQU1tRixZQUFZLEdBQUcsSUFBSSxDQUFDakYsY0FBYyxDQUFDLENBQUM7TUFDMUMsTUFBTWtGLFFBQVEsR0FBRyxJQUFJakosT0FBTyxDQUFDLENBQUM7TUFFOUJnSixZQUFZLENBQUNELEtBQUssQ0FBQyxDQUFDO01BQ3BCLElBQUksQ0FBQzlHLFVBQVUsQ0FBRWdILFFBQVMsQ0FBQztNQUMzQkEsUUFBUSxDQUFDekYsUUFBUSxDQUFFd0YsWUFBWSxDQUFDRSxhQUFhLENBQUMsQ0FBRSxDQUFDO0lBQ25EO0lBQ0EsSUFBSSxDQUFDekgsa0JBQWtCLENBQUMsQ0FBQztJQUN6QixPQUFPLElBQUksQ0FBQyxDQUFFO0VBQ2hCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFMEgsVUFBVUEsQ0FBQSxFQUFHO0lBQ1gsSUFBSSxDQUFDbEgsVUFBVSxDQUFFLElBQUlqQyxPQUFPLENBQUMsQ0FBRSxDQUFDO0lBQ2hDLElBQUksQ0FBQ3lCLGtCQUFrQixDQUFDLENBQUM7SUFFekIsT0FBTyxJQUFJLENBQUMsQ0FBQztFQUNmOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UySCxhQUFhQSxDQUFBLEVBQUc7SUFDZCxJQUFJLENBQUN0SCxVQUFVLEdBQUcsSUFBSTtJQUV0QixJQUFJLENBQUN1SCwyQkFBMkIsQ0FBQyxDQUFDO0lBRWxDLE9BQU8sSUFBSSxDQUFDLENBQUM7RUFDZjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBQSxFQUFHO0lBQ1osT0FBTyxJQUFJLENBQUN4SCxVQUFVO0VBQ3hCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFeUgsdUJBQXVCQSxDQUFFWixPQUFPLEVBQUVDLE9BQU8sRUFBRUMsUUFBUSxFQUFFVyxRQUFRLEVBQUVDLEtBQUssRUFBRWpKLENBQUMsRUFBRUMsQ0FBQyxFQUFHO0lBQzNFLE1BQU04RixhQUFhLEdBQUcsSUFBSSxDQUFDakQsZ0JBQWdCLENBQUMsQ0FBQztJQUM3QyxPQUFPLElBQUksQ0FBQ29HLGVBQWUsQ0FBRWYsT0FBTyxFQUFFQyxPQUFPLEVBQUVDLFFBQVEsRUFBRVcsUUFBUSxFQUFFQyxLQUFLLEVBQUVqSixDQUFDLEdBQUcrRixhQUFhLENBQUMvRixDQUFDLEVBQUVDLENBQUMsR0FBRzhGLGFBQWEsQ0FBQzlGLENBQUUsQ0FBQztFQUN0SDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWlKLGVBQWVBLENBQUVmLE9BQU8sRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUVXLFFBQVEsRUFBRUMsS0FBSyxFQUFFakosQ0FBQyxFQUFFQyxDQUFDLEVBQUc7SUFDbkU7SUFDQTs7SUFFQSxNQUFNdUUsUUFBUSxHQUFHLElBQUkxRixPQUFPLENBQUVrQixDQUFDLEVBQUVDLENBQUUsQ0FBQztJQUNwQyxJQUFJLENBQUMyRCxNQUFNLENBQUVZLFFBQVMsQ0FBQztJQUV2QixNQUFNRyxVQUFVLEdBQUcsSUFBSSxDQUFDcEIsY0FBYyxDQUFDLENBQUMsQ0FBQ0MsWUFBWSxDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDRCxjQUFjLENBQUMsQ0FBQyxDQUFDUCxRQUFRLENBQUV3QixRQUFTLENBQUM7O0lBRTFDO0lBQ0EsSUFBSzJELE9BQU8sR0FBRyxDQUFDLEVBQUc7TUFBRUEsT0FBTyxJQUFJLENBQUMsR0FBRztJQUFFO0lBQ3RDLElBQUtDLE9BQU8sR0FBRyxDQUFDLEVBQUc7TUFBRUEsT0FBTyxJQUFJLENBQUMsR0FBRztJQUFFO0lBRXRDLElBQUllLEdBQUcsR0FBR2hCLE9BQU8sR0FBR0EsT0FBTztJQUMzQixJQUFJaUIsR0FBRyxHQUFHaEIsT0FBTyxHQUFHQSxPQUFPO0lBQzNCLE1BQU1pQixLQUFLLEdBQUcxRSxVQUFVLENBQUNFLEtBQUssQ0FBRUwsUUFBUyxDQUFDLENBQUM4RSxhQUFhLENBQUUsQ0FBRSxDQUFDLENBQUNDLE9BQU8sQ0FBRSxDQUFDbEIsUUFBUyxDQUFDO0lBQ2xGLE1BQU1tQixHQUFHLEdBQUdILEtBQUssQ0FBQ3JKLENBQUMsR0FBR3FKLEtBQUssQ0FBQ3JKLENBQUM7SUFDN0IsTUFBTXlKLEdBQUcsR0FBR0osS0FBSyxDQUFDcEosQ0FBQyxHQUFHb0osS0FBSyxDQUFDcEosQ0FBQztJQUM3QixJQUFJeUosV0FBVyxHQUFHLElBQUk1SyxPQUFPLENBQUVxSixPQUFPLEdBQUdrQixLQUFLLENBQUNwSixDQUFDLEdBQUdtSSxPQUFPLEVBQUUsQ0FBQ0EsT0FBTyxHQUFHaUIsS0FBSyxDQUFDckosQ0FBQyxHQUFHbUksT0FBUSxDQUFDOztJQUUxRjtJQUNBLE1BQU13QixJQUFJLEdBQUdILEdBQUcsR0FBR0wsR0FBRyxHQUFHTSxHQUFHLEdBQUdMLEdBQUc7SUFDbEMsSUFBS08sSUFBSSxHQUFHLENBQUMsRUFBRztNQUNkeEIsT0FBTyxJQUFJdEksSUFBSSxDQUFDK0osSUFBSSxDQUFFRCxJQUFLLENBQUM7TUFDNUJ2QixPQUFPLElBQUl2SSxJQUFJLENBQUMrSixJQUFJLENBQUVELElBQUssQ0FBQzs7TUFFNUI7TUFDQVIsR0FBRyxHQUFHaEIsT0FBTyxHQUFHQSxPQUFPO01BQ3ZCaUIsR0FBRyxHQUFHaEIsT0FBTyxHQUFHQSxPQUFPO01BQ3ZCc0IsV0FBVyxHQUFHLElBQUk1SyxPQUFPLENBQUVxSixPQUFPLEdBQUdrQixLQUFLLENBQUNwSixDQUFDLEdBQUdtSSxPQUFPLEVBQUUsQ0FBQ0EsT0FBTyxHQUFHaUIsS0FBSyxDQUFDckosQ0FBQyxHQUFHbUksT0FBUSxDQUFDO0lBQ3hGOztJQUVBO0lBQ0E7O0lBRUF1QixXQUFXLENBQUNqSixjQUFjLENBQUVaLElBQUksQ0FBQytKLElBQUksQ0FBRS9KLElBQUksQ0FBQ2dLLEdBQUcsQ0FBRSxDQUFDLEVBQUUsQ0FBRVYsR0FBRyxHQUFHQyxHQUFHLEdBQUdELEdBQUcsR0FBR00sR0FBRyxHQUFHTCxHQUFHLEdBQUdJLEdBQUcsS0FBT0wsR0FBRyxHQUFHTSxHQUFHLEdBQUdMLEdBQUcsR0FBR0ksR0FBRyxDQUFHLENBQUUsQ0FBRSxDQUFDO0lBQzNILElBQUtSLFFBQVEsS0FBS0MsS0FBSyxFQUFHO01BQ3hCO01BQ0FTLFdBQVcsQ0FBQ2pKLGNBQWMsQ0FBRSxDQUFDLENBQUUsQ0FBQztJQUNsQztJQUNBLE1BQU1vSCxNQUFNLEdBQUdsRCxVQUFVLENBQUNtRixLQUFLLENBQUV0RixRQUFRLEVBQUUsR0FBSSxDQUFDLENBQUN6QixJQUFJLENBQUUyRyxXQUFXLENBQUNILE9BQU8sQ0FBRWxCLFFBQVMsQ0FBRSxDQUFDO0lBRXhGLFNBQVMwQixXQUFXQSxDQUFFQyxDQUFDLEVBQUVqSyxDQUFDLEVBQUc7TUFDM0I7TUFDQSxPQUFPLENBQUlpSyxDQUFDLENBQUNoSyxDQUFDLEdBQUdELENBQUMsQ0FBQ0UsQ0FBQyxHQUFHK0osQ0FBQyxDQUFDL0osQ0FBQyxHQUFHRixDQUFDLENBQUNDLENBQUMsR0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFLZ0ssQ0FBQyxDQUFDQyxZQUFZLENBQUVsSyxDQUFFLENBQUM7SUFDekU7SUFFQSxNQUFNbUssTUFBTSxHQUFHLElBQUlwTCxPQUFPLENBQUUsQ0FBRXVLLEtBQUssQ0FBQ3JKLENBQUMsR0FBRzBKLFdBQVcsQ0FBQzFKLENBQUMsSUFBS21JLE9BQU8sRUFBRSxDQUFFa0IsS0FBSyxDQUFDcEosQ0FBQyxHQUFHeUosV0FBVyxDQUFDekosQ0FBQyxJQUFLbUksT0FBUSxDQUFDO0lBQzFHLE1BQU0rQixJQUFJLEdBQUcsSUFBSXJMLE9BQU8sQ0FBRSxDQUFFLENBQUN1SyxLQUFLLENBQUNySixDQUFDLEdBQUcwSixXQUFXLENBQUMxSixDQUFDLElBQUttSSxPQUFPLEVBQUUsQ0FBRSxDQUFDa0IsS0FBSyxDQUFDcEosQ0FBQyxHQUFHeUosV0FBVyxDQUFDekosQ0FBQyxJQUFLbUksT0FBUSxDQUFDO0lBQzFHLE1BQU1YLFVBQVUsR0FBR3NDLFdBQVcsQ0FBRWpMLE9BQU8sQ0FBQ3NMLE1BQU0sRUFBRUYsTUFBTyxDQUFDO0lBQ3hELElBQUlHLFVBQVUsR0FBR04sV0FBVyxDQUFFRyxNQUFNLEVBQUVDLElBQUssQ0FBQyxJQUFLdEssSUFBSSxDQUFDeUssRUFBRSxHQUFHLENBQUMsQ0FBRTs7SUFFOUQ7SUFDQTtJQUNBO0lBQ0EsSUFBSyxDQUFDckIsS0FBSyxJQUFJb0IsVUFBVSxHQUFHLENBQUMsRUFBRztNQUM5QkEsVUFBVSxJQUFJeEssSUFBSSxDQUFDeUssRUFBRSxHQUFHLENBQUM7SUFDM0I7SUFDQSxJQUFLckIsS0FBSyxJQUFJb0IsVUFBVSxHQUFHLENBQUMsRUFBRztNQUM3QkEsVUFBVSxJQUFJeEssSUFBSSxDQUFDeUssRUFBRSxHQUFHLENBQUM7SUFDM0I7O0lBRUE7SUFDQSxNQUFNcEMsYUFBYSxHQUFHLElBQUloSixhQUFhLENBQUUySSxNQUFNLEVBQUVNLE9BQU8sRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUVaLFVBQVUsRUFBRUEsVUFBVSxHQUFHNEMsVUFBVSxFQUFFLENBQUNwQixLQUFNLENBQUM7SUFDMUgsTUFBTTdDLHFCQUFxQixHQUFHOEIsYUFBYSxDQUFDN0Isd0JBQXdCLENBQUMsQ0FBQztJQUN0RTFFLENBQUMsQ0FBQ0MsSUFBSSxDQUFFd0UscUJBQXFCLEVBQUVFLE9BQU8sSUFBSTtNQUN4QyxJQUFJLENBQUMzQyxtQkFBbUIsQ0FBRTJDLE9BQVEsQ0FBQztJQUNyQyxDQUFFLENBQUM7SUFFSCxPQUFPLElBQUk7RUFDYjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VpRSxNQUFNQSxDQUFFakQsT0FBTyxFQUFFQyxPQUFPLEVBQUVDLE1BQU0sRUFBRztJQUNqQyxJQUFLLE9BQU9GLE9BQU8sS0FBSyxRQUFRLEVBQUc7TUFDakM7TUFDQSxNQUFNTyxNQUFNLEdBQUdQLE9BQU87TUFDdEJFLE1BQU0sR0FBR0QsT0FBTztNQUNoQixPQUFPLElBQUksQ0FBQ0ssUUFBUSxDQUFFQyxNQUFNLEVBQUVMLE1BQU0sRUFBRSxDQUFDLEVBQUUzSCxJQUFJLENBQUN5SyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxDQUFDL0IsS0FBSyxDQUFDLENBQUM7SUFDdkUsQ0FBQyxNQUNJO01BQ0g3RyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPNEYsT0FBTyxLQUFLLFFBQVEsSUFBSTVFLFFBQVEsQ0FBRTRFLE9BQVEsQ0FBQyxFQUFHLG9DQUFtQ0EsT0FBUSxFQUFFLENBQUM7TUFDckg1RixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPNkYsT0FBTyxLQUFLLFFBQVEsSUFBSTdFLFFBQVEsQ0FBRTZFLE9BQVEsQ0FBQyxFQUFHLG9DQUFtQ0EsT0FBUSxFQUFFLENBQUM7O01BRXJIO01BQ0EsT0FBTyxJQUFJLENBQUNLLFFBQVEsQ0FBRTdILENBQUMsQ0FBRXVILE9BQU8sRUFBRUMsT0FBUSxDQUFDLEVBQUVDLE1BQU0sRUFBRSxDQUFDLEVBQUUzSCxJQUFJLENBQUN5SyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxDQUFDL0IsS0FBSyxDQUFDLENBQUM7SUFDdEY7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWlDLE9BQU9BLENBQUVsRCxPQUFPLEVBQUVDLE9BQU8sRUFBRVksT0FBTyxFQUFFQyxPQUFPLEVBQUVDLFFBQVEsRUFBRztJQUN0RDtJQUNBO0lBQ0EsSUFBSyxPQUFPZixPQUFPLEtBQUssUUFBUSxFQUFHO01BQ2pDO01BQ0EsTUFBTU8sTUFBTSxHQUFHUCxPQUFPO01BQ3RCZSxRQUFRLEdBQUdELE9BQU87TUFDbEJBLE9BQU8sR0FBR0QsT0FBTztNQUNqQkEsT0FBTyxHQUFHWixPQUFPO01BQ2pCLE9BQU8sSUFBSSxDQUFDZSxrQkFBa0IsQ0FBRVQsTUFBTSxFQUFFTSxPQUFPLEVBQUVDLE9BQU8sRUFBRUMsUUFBUSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUV4SSxJQUFJLENBQUN5SyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxDQUFDL0IsS0FBSyxDQUFDLENBQUM7SUFDMUcsQ0FBQyxNQUNJO01BQ0g3RyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPNEYsT0FBTyxLQUFLLFFBQVEsSUFBSTVFLFFBQVEsQ0FBRTRFLE9BQVEsQ0FBQyxFQUFHLG9DQUFtQ0EsT0FBUSxFQUFFLENBQUM7TUFDckg1RixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPNkYsT0FBTyxLQUFLLFFBQVEsSUFBSTdFLFFBQVEsQ0FBRTZFLE9BQVEsQ0FBQyxFQUFHLG9DQUFtQ0EsT0FBUSxFQUFFLENBQUM7O01BRXJIO01BQ0EsT0FBTyxJQUFJLENBQUNlLGtCQUFrQixDQUFFdkksQ0FBQyxDQUFFdUgsT0FBTyxFQUFFQyxPQUFRLENBQUMsRUFBRVksT0FBTyxFQUFFQyxPQUFPLEVBQUVDLFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFeEksSUFBSSxDQUFDeUssRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFNLENBQUMsQ0FBQy9CLEtBQUssQ0FBQyxDQUFDO0lBQ3pIO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWtDLElBQUlBLENBQUV6SyxDQUFDLEVBQUVDLENBQUMsRUFBRXlLLEtBQUssRUFBRUMsTUFBTSxFQUFHO0lBQzFCakosTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBTzFCLENBQUMsS0FBSyxRQUFRLElBQUkwQyxRQUFRLENBQUUxQyxDQUFFLENBQUMsRUFBRyw4QkFBNkJBLENBQUUsRUFBRSxDQUFDO0lBQzdGMEIsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT3pCLENBQUMsS0FBSyxRQUFRLElBQUl5QyxRQUFRLENBQUV6QyxDQUFFLENBQUMsRUFBRyw4QkFBNkJBLENBQUUsRUFBRSxDQUFDO0lBQzdGeUIsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT2dKLEtBQUssS0FBSyxRQUFRLElBQUloSSxRQUFRLENBQUVnSSxLQUFNLENBQUMsRUFBRyxrQ0FBaUNBLEtBQU0sRUFBRSxDQUFDO0lBQzdHaEosTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT2lKLE1BQU0sS0FBSyxRQUFRLElBQUlqSSxRQUFRLENBQUVpSSxNQUFPLENBQUMsRUFBRyxtQ0FBa0NBLE1BQU8sRUFBRSxDQUFDO0lBRWpILE1BQU1DLE9BQU8sR0FBRyxJQUFJcEwsT0FBTyxDQUFDLENBQUM7SUFDN0IsSUFBSSxDQUFDaUMsVUFBVSxDQUFFbUosT0FBUSxDQUFDO0lBQzFCQSxPQUFPLENBQUM1SCxRQUFRLENBQUVqRCxDQUFDLENBQUVDLENBQUMsRUFBRUMsQ0FBRSxDQUFFLENBQUM7SUFDN0IySyxPQUFPLENBQUM1SCxRQUFRLENBQUVqRCxDQUFDLENBQUVDLENBQUMsR0FBRzBLLEtBQUssRUFBRXpLLENBQUUsQ0FBRSxDQUFDO0lBQ3JDMkssT0FBTyxDQUFDNUgsUUFBUSxDQUFFakQsQ0FBQyxDQUFFQyxDQUFDLEdBQUcwSyxLQUFLLEVBQUV6SyxDQUFDLEdBQUcwSyxNQUFPLENBQUUsQ0FBQztJQUM5Q0MsT0FBTyxDQUFDNUgsUUFBUSxDQUFFakQsQ0FBQyxDQUFFQyxDQUFDLEVBQUVDLENBQUMsR0FBRzBLLE1BQU8sQ0FBRSxDQUFDO0lBQ3RDLElBQUksQ0FBQ2hILG1CQUFtQixDQUFFLElBQUl0RSxJQUFJLENBQUV1TCxPQUFPLENBQUNDLE1BQU0sQ0FBRSxDQUFDLENBQUUsRUFBRUQsT0FBTyxDQUFDQyxNQUFNLENBQUUsQ0FBQyxDQUFHLENBQUUsQ0FBQztJQUNoRixJQUFJLENBQUNsSCxtQkFBbUIsQ0FBRSxJQUFJdEUsSUFBSSxDQUFFdUwsT0FBTyxDQUFDQyxNQUFNLENBQUUsQ0FBQyxDQUFFLEVBQUVELE9BQU8sQ0FBQ0MsTUFBTSxDQUFFLENBQUMsQ0FBRyxDQUFFLENBQUM7SUFDaEYsSUFBSSxDQUFDbEgsbUJBQW1CLENBQUUsSUFBSXRFLElBQUksQ0FBRXVMLE9BQU8sQ0FBQ0MsTUFBTSxDQUFFLENBQUMsQ0FBRSxFQUFFRCxPQUFPLENBQUNDLE1BQU0sQ0FBRSxDQUFDLENBQUcsQ0FBRSxDQUFDO0lBQ2hGRCxPQUFPLENBQUNyQyxLQUFLLENBQUMsQ0FBQztJQUNmLElBQUksQ0FBQzlHLFVBQVUsQ0FBRSxJQUFJakMsT0FBTyxDQUFDLENBQUUsQ0FBQztJQUNoQyxJQUFJLENBQUMrRCxjQUFjLENBQUMsQ0FBQyxDQUFDUCxRQUFRLENBQUVqRCxDQUFDLENBQUVDLENBQUMsRUFBRUMsQ0FBRSxDQUFFLENBQUM7SUFDM0N5QixNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDb0osS0FBSyxDQUFFLElBQUksQ0FBQ2hLLE1BQU0sQ0FBQ2lLLElBQUksQ0FBQyxDQUFFLENBQUUsQ0FBQztJQUNoRCxJQUFJLENBQUM5SixrQkFBa0IsQ0FBQyxDQUFDO0lBRXpCLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFK0osU0FBU0EsQ0FBRWhMLENBQUMsRUFBRUMsQ0FBQyxFQUFFeUssS0FBSyxFQUFFQyxNQUFNLEVBQUVNLElBQUksRUFBRUMsSUFBSSxFQUFHO0lBQzNDLE1BQU1DLElBQUksR0FBR25MLENBQUMsR0FBR2lMLElBQUk7SUFDckIsTUFBTUcsS0FBSyxHQUFHcEwsQ0FBQyxHQUFHMEssS0FBSyxHQUFHTyxJQUFJO0lBQzlCLE1BQU1JLElBQUksR0FBR3BMLENBQUMsR0FBR2lMLElBQUk7SUFDckIsTUFBTUksS0FBSyxHQUFHckwsQ0FBQyxHQUFHMEssTUFBTSxHQUFHTyxJQUFJO0lBQy9CO0lBQ0EsSUFBS0QsSUFBSSxLQUFLQyxJQUFJLEVBQUc7TUFDbkI7TUFDQSxJQUFJLENBQ0Q3RCxHQUFHLENBQUUrRCxLQUFLLEVBQUVDLElBQUksRUFBRUosSUFBSSxFQUFFLENBQUNwTCxJQUFJLENBQUN5SyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFNLENBQUMsQ0FDaERqRCxHQUFHLENBQUUrRCxLQUFLLEVBQUVFLEtBQUssRUFBRUwsSUFBSSxFQUFFLENBQUMsRUFBRXBMLElBQUksQ0FBQ3lLLEVBQUUsR0FBRyxDQUFDLEVBQUUsS0FBTSxDQUFDLENBQ2hEakQsR0FBRyxDQUFFOEQsSUFBSSxFQUFFRyxLQUFLLEVBQUVMLElBQUksRUFBRXBMLElBQUksQ0FBQ3lLLEVBQUUsR0FBRyxDQUFDLEVBQUV6SyxJQUFJLENBQUN5SyxFQUFFLEVBQUUsS0FBTSxDQUFDLENBQ3JEakQsR0FBRyxDQUFFOEQsSUFBSSxFQUFFRSxJQUFJLEVBQUVKLElBQUksRUFBRXBMLElBQUksQ0FBQ3lLLEVBQUUsRUFBRXpLLElBQUksQ0FBQ3lLLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxDQUN4RC9CLEtBQUssQ0FBQyxDQUFDO0lBQ1osQ0FBQyxNQUNJO01BQ0g7TUFDQSxJQUFJLENBQ0RMLGFBQWEsQ0FBRWtELEtBQUssRUFBRUMsSUFBSSxFQUFFSixJQUFJLEVBQUVDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQ3JMLElBQUksQ0FBQ3lLLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxDQUNuRXBDLGFBQWEsQ0FBRWtELEtBQUssRUFBRUUsS0FBSyxFQUFFTCxJQUFJLEVBQUVDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFckwsSUFBSSxDQUFDeUssRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFNLENBQUMsQ0FDbkVwQyxhQUFhLENBQUVpRCxJQUFJLEVBQUVHLEtBQUssRUFBRUwsSUFBSSxFQUFFQyxJQUFJLEVBQUUsQ0FBQyxFQUFFckwsSUFBSSxDQUFDeUssRUFBRSxHQUFHLENBQUMsRUFBRXpLLElBQUksQ0FBQ3lLLEVBQUUsRUFBRSxLQUFNLENBQUMsQ0FDeEVwQyxhQUFhLENBQUVpRCxJQUFJLEVBQUVFLElBQUksRUFBRUosSUFBSSxFQUFFQyxJQUFJLEVBQUUsQ0FBQyxFQUFFckwsSUFBSSxDQUFDeUssRUFBRSxFQUFFekssSUFBSSxDQUFDeUssRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBTSxDQUFDLENBQzNFL0IsS0FBSyxDQUFDLENBQUM7SUFDWjtJQUNBLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VnRCxPQUFPQSxDQUFFQyxRQUFRLEVBQUc7SUFDbEIsTUFBTWhLLE1BQU0sR0FBR2dLLFFBQVEsQ0FBQ2hLLE1BQU07SUFDOUIsSUFBS0EsTUFBTSxHQUFHLENBQUMsRUFBRztNQUNoQixJQUFJLENBQUNtQixXQUFXLENBQUU2SSxRQUFRLENBQUUsQ0FBQyxDQUFHLENBQUM7TUFDakMsS0FBTSxJQUFJakssQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHQyxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFHO1FBQ2pDLElBQUksQ0FBQzJCLFdBQVcsQ0FBRXNJLFFBQVEsQ0FBRWpLLENBQUMsQ0FBRyxDQUFDO01BQ25DO0lBQ0Y7SUFDQSxPQUFPLElBQUksQ0FBQ2dILEtBQUssQ0FBQyxDQUFDO0VBQ3JCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFa0QsY0FBY0EsQ0FBRUMsU0FBUyxFQUFFQyxPQUFPLEVBQUc7SUFDbkNBLE9BQU8sR0FBRzVNLEtBQUssQ0FBRTtNQUNmO01BQ0E7TUFDQTtNQUNBdUIsT0FBTyxFQUFFLENBQUM7TUFFVjtNQUNBc0wsb0JBQW9CLEVBQUU7SUFDeEIsQ0FBQyxFQUFFRCxPQUFRLENBQUM7SUFFWmpLLE1BQU0sSUFBSUEsTUFBTSxDQUFFaUssT0FBTyxDQUFDckwsT0FBTyxHQUFHLENBQUMsSUFBSXFMLE9BQU8sQ0FBQ3JMLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxpQ0FBa0MsQ0FBQztJQUVsRyxNQUFNdUwsV0FBVyxHQUFHSCxTQUFTLENBQUNsSyxNQUFNLENBQUMsQ0FBQzs7SUFFdEM7SUFDQSxNQUFNc0ssYUFBYSxHQUFLSCxPQUFPLENBQUNDLG9CQUFvQixHQUFLQyxXQUFXLEdBQUdBLFdBQVcsR0FBRyxDQUFDO0lBRXRGLEtBQU0sSUFBSXRLLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3VLLGFBQWEsRUFBRXZLLENBQUMsRUFBRSxFQUFHO01BQ3hDLElBQUl3SyxjQUFjLENBQUMsQ0FBQztNQUNwQixJQUFLeEssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDb0ssT0FBTyxDQUFDQyxvQkFBb0IsRUFBRztRQUM5Q0csY0FBYyxHQUFHLENBQ2ZMLFNBQVMsQ0FBRSxDQUFDLENBQUUsRUFDZEEsU0FBUyxDQUFFLENBQUMsQ0FBRSxFQUNkQSxTQUFTLENBQUUsQ0FBQyxDQUFFLEVBQ2RBLFNBQVMsQ0FBRSxDQUFDLENBQUUsQ0FBRTtNQUNwQixDQUFDLE1BQ0ksSUFBT25LLENBQUMsS0FBS3VLLGFBQWEsR0FBRyxDQUFDLElBQU0sQ0FBQ0gsT0FBTyxDQUFDQyxvQkFBb0IsRUFBRztRQUN2RUcsY0FBYyxHQUFHLENBQ2ZMLFNBQVMsQ0FBRW5LLENBQUMsR0FBRyxDQUFDLENBQUUsRUFDbEJtSyxTQUFTLENBQUVuSyxDQUFDLENBQUUsRUFDZG1LLFNBQVMsQ0FBRW5LLENBQUMsR0FBRyxDQUFDLENBQUUsRUFDbEJtSyxTQUFTLENBQUVuSyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUU7TUFDeEIsQ0FBQyxNQUNJO1FBQ0h3SyxjQUFjLEdBQUcsQ0FDZkwsU0FBUyxDQUFFLENBQUVuSyxDQUFDLEdBQUcsQ0FBQyxHQUFHc0ssV0FBVyxJQUFLQSxXQUFXLENBQUUsRUFDbERILFNBQVMsQ0FBRW5LLENBQUMsR0FBR3NLLFdBQVcsQ0FBRSxFQUM1QkgsU0FBUyxDQUFFLENBQUVuSyxDQUFDLEdBQUcsQ0FBQyxJQUFLc0ssV0FBVyxDQUFFLEVBQ3BDSCxTQUFTLENBQUUsQ0FBRW5LLENBQUMsR0FBRyxDQUFDLElBQUtzSyxXQUFXLENBQUUsQ0FBRTtNQUMxQzs7TUFFQTtNQUNBO01BQ0E7TUFDQTtNQUNBOztNQUVBO01BQ0EsTUFBTUcsWUFBWSxHQUFHLENBQ25CRCxjQUFjLENBQUUsQ0FBQyxDQUFFLEVBQ25CN0wsb0JBQW9CLENBQUU2TCxjQUFjLENBQUUsQ0FBQyxDQUFFLEVBQUVBLGNBQWMsQ0FBRSxDQUFDLENBQUUsRUFBRUEsY0FBYyxDQUFFLENBQUMsQ0FBRSxFQUFFSixPQUFPLENBQUNyTCxPQUFRLENBQUMsRUFDdEdKLG9CQUFvQixDQUFFNkwsY0FBYyxDQUFFLENBQUMsQ0FBRSxFQUFFQSxjQUFjLENBQUUsQ0FBQyxDQUFFLEVBQUVBLGNBQWMsQ0FBRSxDQUFDLENBQUUsRUFBRUosT0FBTyxDQUFDckwsT0FBUSxDQUFDLEVBQ3RHeUwsY0FBYyxDQUFFLENBQUMsQ0FBRSxDQUNwQjs7TUFFRDtNQUNBLElBQUt4SyxDQUFDLEtBQUssQ0FBQyxFQUFHO1FBQ2IsSUFBSSxDQUFDcUMsTUFBTSxDQUFFb0ksWUFBWSxDQUFFLENBQUMsQ0FBRyxDQUFDO1FBQ2hDLElBQUksQ0FBQ3pJLGNBQWMsQ0FBQyxDQUFDLENBQUNQLFFBQVEsQ0FBRWdKLFlBQVksQ0FBRSxDQUFDLENBQUcsQ0FBQztNQUNyRDtNQUVBLElBQUksQ0FBQ3BGLGlCQUFpQixDQUFFb0YsWUFBWSxDQUFFLENBQUMsQ0FBRSxFQUFFQSxZQUFZLENBQUUsQ0FBQyxDQUFFLEVBQUVBLFlBQVksQ0FBRSxDQUFDLENBQUcsQ0FBQztJQUNuRjtJQUVBLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFekwsSUFBSUEsQ0FBQSxFQUFHO0lBQ0w7SUFDQSxPQUFPLElBQUlJLEtBQUssQ0FBRWdCLENBQUMsQ0FBQ3NLLEdBQUcsQ0FBRSxJQUFJLENBQUNwTCxRQUFRLEVBQUUrSixPQUFPLElBQUlBLE9BQU8sQ0FBQ3JLLElBQUksQ0FBQyxDQUFFLENBQUMsRUFBRSxJQUFJLENBQUNPLE1BQU8sQ0FBQztFQUNwRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRW9MLGNBQWNBLENBQUVDLE9BQU8sRUFBRztJQUN4QixNQUFNQyxHQUFHLEdBQUcsSUFBSSxDQUFDdkwsUUFBUSxDQUFDVyxNQUFNO0lBQ2hDLEtBQU0sSUFBSUQsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHNkssR0FBRyxFQUFFN0ssQ0FBQyxFQUFFLEVBQUc7TUFDOUIsSUFBSSxDQUFDVixRQUFRLENBQUVVLENBQUMsQ0FBRSxDQUFDMkssY0FBYyxDQUFFQyxPQUFRLENBQUM7SUFDOUM7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsVUFBVUEsQ0FBQSxFQUFHO0lBQ1gsSUFBSUMsTUFBTSxHQUFHLEVBQUU7SUFDZixNQUFNRixHQUFHLEdBQUcsSUFBSSxDQUFDdkwsUUFBUSxDQUFDVyxNQUFNO0lBQ2hDLEtBQU0sSUFBSUQsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHNkssR0FBRyxFQUFFN0ssQ0FBQyxFQUFFLEVBQUc7TUFDOUIsTUFBTXFKLE9BQU8sR0FBRyxJQUFJLENBQUMvSixRQUFRLENBQUVVLENBQUMsQ0FBRTtNQUNsQyxJQUFLcUosT0FBTyxDQUFDMkIsVUFBVSxDQUFDLENBQUMsRUFBRztRQUMxQjtRQUNBLE1BQU01SCxVQUFVLEdBQUdpRyxPQUFPLENBQUM0QixRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNsSixLQUFLO1FBRTlDZ0osTUFBTSxJQUFLLEtBQUk3TSxTQUFTLENBQUVrRixVQUFVLENBQUMzRSxDQUFFLENBQUUsSUFBR1AsU0FBUyxDQUFFa0YsVUFBVSxDQUFDMUUsQ0FBRSxDQUFFLEdBQUU7UUFFeEUsS0FBTSxJQUFJd00sQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHN0IsT0FBTyxDQUFDNEIsUUFBUSxDQUFDaEwsTUFBTSxFQUFFaUwsQ0FBQyxFQUFFLEVBQUc7VUFDbERILE1BQU0sSUFBSyxHQUFFMUIsT0FBTyxDQUFDNEIsUUFBUSxDQUFFQyxDQUFDLENBQUUsQ0FBQ0Msa0JBQWtCLENBQUMsQ0FBRSxHQUFFO1FBQzVEO1FBRUEsSUFBSzlCLE9BQU8sQ0FBQytCLFFBQVEsQ0FBQyxDQUFDLEVBQUc7VUFDeEJMLE1BQU0sSUFBSSxJQUFJO1FBQ2hCO01BQ0Y7SUFDRjtJQUNBLE9BQU9BLE1BQU07RUFDZjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFTSxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFDcEI7SUFDQSxNQUFNaE0sUUFBUSxHQUFHYyxDQUFDLENBQUNzSyxHQUFHLENBQUUsSUFBSSxDQUFDcEwsUUFBUSxFQUFFK0osT0FBTyxJQUFJQSxPQUFPLENBQUNnQyxXQUFXLENBQUVDLE1BQU8sQ0FBRSxDQUFDO0lBQ2pGLE1BQU0vTCxNQUFNLEdBQUdhLENBQUMsQ0FBQ21MLE1BQU0sQ0FBRWpNLFFBQVEsRUFBRSxDQUFFQyxNQUFNLEVBQUU4SixPQUFPLEtBQU05SixNQUFNLENBQUNpTSxLQUFLLENBQUVuQyxPQUFPLENBQUM5SixNQUFPLENBQUMsRUFBRWxDLE9BQU8sQ0FBQ29PLE9BQVEsQ0FBQztJQUMzRyxPQUFPLElBQUlyTSxLQUFLLENBQUVFLFFBQVEsRUFBRUMsTUFBTyxDQUFDO0VBQ3RDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRW1NLG9CQUFvQkEsQ0FBRXRCLE9BQU8sRUFBRztJQUM5QjtJQUNBQSxPQUFPLEdBQUc1TSxLQUFLLENBQUU7TUFDZm1PLFNBQVMsRUFBRSxDQUFDO01BQ1pDLFNBQVMsRUFBRSxDQUFDO01BQ1pDLGVBQWUsRUFBRSxJQUFJO01BQUU7TUFDdkJDLFlBQVksRUFBSTFCLE9BQU8sSUFBSUEsT0FBTyxDQUFDMkIsZ0JBQWdCLEdBQUssS0FBSyxHQUFHO0lBQ2xFLENBQUMsRUFBRTNCLE9BQVEsQ0FBQzs7SUFFWjtJQUNBLE1BQU05SyxRQUFRLEdBQUdjLENBQUMsQ0FBQ3NLLEdBQUcsQ0FBRSxJQUFJLENBQUNwTCxRQUFRLEVBQUUrSixPQUFPLElBQUlBLE9BQU8sQ0FBQ3FDLG9CQUFvQixDQUFFdEIsT0FBUSxDQUFFLENBQUM7SUFDM0YsTUFBTTdLLE1BQU0sR0FBR2EsQ0FBQyxDQUFDbUwsTUFBTSxDQUFFak0sUUFBUSxFQUFFLENBQUVDLE1BQU0sRUFBRThKLE9BQU8sS0FBTTlKLE1BQU0sQ0FBQ2lNLEtBQUssQ0FBRW5DLE9BQU8sQ0FBQzlKLE1BQU8sQ0FBQyxFQUFFbEMsT0FBTyxDQUFDb08sT0FBUSxDQUFDO0lBQzNHLE9BQU8sSUFBSXJNLEtBQUssQ0FBRUUsUUFBUSxFQUFFQyxNQUFPLENBQUM7RUFDdEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0V5TSxnQkFBZ0JBLENBQUU1QixPQUFPLEVBQUc7SUFDMUIsT0FBTyxJQUFJLENBQUNzQixvQkFBb0IsQ0FBRWxPLEtBQUssQ0FBRTtNQUN2Q3lPLFFBQVEsRUFBRUMsQ0FBQyxJQUFJM08sT0FBTyxDQUFDNE8sV0FBVyxDQUFFRCxDQUFDLENBQUN4TixDQUFDLEVBQUV3TixDQUFDLENBQUN6TixDQUFFLENBQUM7TUFDOUMyTixVQUFVLEVBQUUsa0JBQWtCLENBQUM7SUFDakMsQ0FBQyxFQUFFaEMsT0FBUSxDQUFFLENBQUM7RUFDaEI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWlDLGlCQUFpQkEsQ0FBRWpDLE9BQU8sRUFBRztJQUMzQmpLLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNpSyxPQUFPLENBQUM2QixRQUFRLEVBQUUsc0ZBQXVGLENBQUM7SUFDN0g5TCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDaUssT0FBTyxDQUFDZ0MsVUFBVSxFQUFFLHdGQUF5RixDQUFDO0lBQ2pJLE9BQU8sSUFBSSxDQUFDVixvQkFBb0IsQ0FBRXRCLE9BQVEsQ0FBQztFQUM3Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFa0MsYUFBYUEsQ0FBRXRMLEtBQUssRUFBRztJQUNyQjtJQUNBLE1BQU11TCxHQUFHLEdBQUcsSUFBSWpQLElBQUksQ0FBRTBELEtBQUssRUFBRXpELE9BQU8sQ0FBQ3NMLE1BQU8sQ0FBQztJQUU3QyxPQUFPLElBQUksQ0FBQzJELG1CQUFtQixDQUFFRCxHQUFJLENBQUMsS0FBSyxDQUFDO0VBQzlDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxZQUFZQSxDQUFFRixHQUFHLEVBQUc7SUFDbEIsSUFBSUcsSUFBSSxHQUFHLEVBQUU7SUFDYixNQUFNQyxXQUFXLEdBQUcsSUFBSSxDQUFDck4sUUFBUSxDQUFDVyxNQUFNO0lBQ3hDLEtBQU0sSUFBSUQsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHMk0sV0FBVyxFQUFFM00sQ0FBQyxFQUFFLEVBQUc7TUFDdEMsTUFBTXFKLE9BQU8sR0FBRyxJQUFJLENBQUMvSixRQUFRLENBQUVVLENBQUMsQ0FBRTtNQUVsQyxJQUFLcUosT0FBTyxDQUFDMkIsVUFBVSxDQUFDLENBQUMsRUFBRztRQUMxQixNQUFNNEIsV0FBVyxHQUFHdkQsT0FBTyxDQUFDNEIsUUFBUSxDQUFDaEwsTUFBTTtRQUMzQyxLQUFNLElBQUlpTCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcwQixXQUFXLEVBQUUxQixDQUFDLEVBQUUsRUFBRztVQUN0QyxNQUFNbkcsT0FBTyxHQUFHc0UsT0FBTyxDQUFDNEIsUUFBUSxDQUFFQyxDQUFDLENBQUU7VUFDckN3QixJQUFJLEdBQUdBLElBQUksQ0FBQ0csTUFBTSxDQUFFOUgsT0FBTyxDQUFDMEgsWUFBWSxDQUFFRixHQUFJLENBQUUsQ0FBQztRQUNuRDtRQUVBLElBQUtsRCxPQUFPLENBQUN5RCxpQkFBaUIsQ0FBQyxDQUFDLEVBQUc7VUFDakNKLElBQUksR0FBR0EsSUFBSSxDQUFDRyxNQUFNLENBQUV4RCxPQUFPLENBQUMwRCxpQkFBaUIsQ0FBQyxDQUFDLENBQUNOLFlBQVksQ0FBRUYsR0FBSSxDQUFFLENBQUM7UUFDdkU7TUFDRjtJQUNGO0lBQ0EsT0FBT25NLENBQUMsQ0FBQzRNLE1BQU0sQ0FBRU4sSUFBSSxFQUFFTyxHQUFHLElBQUlBLEdBQUcsQ0FBQ0MsUUFBUyxDQUFDO0VBQzlDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyw2QkFBNkJBLENBQUUvSixVQUFVLEVBQUVILFFBQVEsRUFBRztJQUNwRDtJQUNBO0lBQ0EsTUFBTW1LLFFBQVEsR0FBR2hLLFVBQVUsQ0FBQ21GLEtBQUssQ0FBRXRGLFFBQVEsRUFBRSxHQUFJLENBQUM7SUFDbEQsSUFBSyxJQUFJLENBQUNxSixhQUFhLENBQUVjLFFBQVMsQ0FBQyxFQUFHO01BQ3BDLE9BQU8sSUFBSTtJQUNiOztJQUVBO0lBQ0EsTUFBTS9KLEtBQUssR0FBR0osUUFBUSxDQUFDSyxLQUFLLENBQUVGLFVBQVcsQ0FBQztJQUMxQyxNQUFNbkQsTUFBTSxHQUFHb0QsS0FBSyxDQUFDUSxTQUFTO0lBRTlCLElBQUs1RCxNQUFNLEtBQUssQ0FBQyxFQUFHO01BQ2xCLE9BQU8sS0FBSztJQUNkO0lBRUFvRCxLQUFLLENBQUNnSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBRW5CO0lBQ0EsTUFBTVgsSUFBSSxHQUFHLElBQUksQ0FBQ0QsWUFBWSxDQUFFLElBQUluUCxJQUFJLENBQUU4RixVQUFVLEVBQUVDLEtBQU0sQ0FBRSxDQUFDOztJQUUvRDtJQUNBO0lBQ0EsS0FBTSxJQUFJckQsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHME0sSUFBSSxDQUFDek0sTUFBTSxFQUFFRCxDQUFDLEVBQUUsRUFBRztNQUN0QyxJQUFLME0sSUFBSSxDQUFFMU0sQ0FBQyxDQUFFLENBQUNrTixRQUFRLElBQUlqTixNQUFNLEVBQUc7UUFDbEMsT0FBTyxJQUFJO01BQ2I7SUFDRjs7SUFFQTtJQUNBLE9BQU8sS0FBSztFQUNkOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0V1TSxtQkFBbUJBLENBQUVELEdBQUcsRUFBRztJQUN6QixJQUFJZSxJQUFJLEdBQUcsQ0FBQztJQUVaLE1BQU1YLFdBQVcsR0FBRyxJQUFJLENBQUNyTixRQUFRLENBQUNXLE1BQU07SUFDeEMsS0FBTSxJQUFJRCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcyTSxXQUFXLEVBQUUzTSxDQUFDLEVBQUUsRUFBRztNQUN0QyxNQUFNcUosT0FBTyxHQUFHLElBQUksQ0FBQy9KLFFBQVEsQ0FBRVUsQ0FBQyxDQUFFO01BRWxDLElBQUtxSixPQUFPLENBQUMyQixVQUFVLENBQUMsQ0FBQyxFQUFHO1FBQzFCLE1BQU00QixXQUFXLEdBQUd2RCxPQUFPLENBQUM0QixRQUFRLENBQUNoTCxNQUFNO1FBQzNDLEtBQU0sSUFBSWlMLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzBCLFdBQVcsRUFBRTFCLENBQUMsRUFBRSxFQUFHO1VBQ3RDb0MsSUFBSSxJQUFJakUsT0FBTyxDQUFDNEIsUUFBUSxDQUFFQyxDQUFDLENBQUUsQ0FBQ3NCLG1CQUFtQixDQUFFRCxHQUFJLENBQUM7UUFDMUQ7O1FBRUE7UUFDQSxJQUFLbEQsT0FBTyxDQUFDeUQsaUJBQWlCLENBQUMsQ0FBQyxFQUFHO1VBQ2pDUSxJQUFJLElBQUlqRSxPQUFPLENBQUMwRCxpQkFBaUIsQ0FBQyxDQUFDLENBQUNQLG1CQUFtQixDQUFFRCxHQUFJLENBQUM7UUFDaEU7TUFDRjtJQUNGO0lBRUEsT0FBT2UsSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxnQkFBZ0JBLENBQUVoTyxNQUFNLEVBQUc7SUFDekI7SUFDQSxJQUFLLElBQUksQ0FBQ0EsTUFBTSxDQUFDa04sWUFBWSxDQUFFbE4sTUFBTyxDQUFDLENBQUNtSCxNQUFNLENBQUUsSUFBSSxDQUFDbkgsTUFBTyxDQUFDLEVBQUc7TUFDOUQsT0FBTyxJQUFJO0lBQ2I7O0lBRUE7SUFDQSxNQUFNaU8sZ0JBQWdCLEdBQUcsSUFBSWxRLElBQUksQ0FBRSxJQUFJQyxPQUFPLENBQUVnQyxNQUFNLENBQUNrTyxJQUFJLEVBQUVsTyxNQUFNLENBQUNtTyxJQUFLLENBQUMsRUFBRSxJQUFJblEsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUUsQ0FBQztJQUNqRyxNQUFNb1EsY0FBYyxHQUFHLElBQUlyUSxJQUFJLENBQUUsSUFBSUMsT0FBTyxDQUFFZ0MsTUFBTSxDQUFDa08sSUFBSSxFQUFFbE8sTUFBTSxDQUFDbU8sSUFBSyxDQUFDLEVBQUUsSUFBSW5RLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFFLENBQUM7SUFDL0YsTUFBTXFRLGdCQUFnQixHQUFHLElBQUl0USxJQUFJLENBQUUsSUFBSUMsT0FBTyxDQUFFZ0MsTUFBTSxDQUFDc08sSUFBSSxFQUFFdE8sTUFBTSxDQUFDdU8sSUFBSyxDQUFDLEVBQUUsSUFBSXZRLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUUsQ0FBQztJQUNsRyxNQUFNd1EsY0FBYyxHQUFHLElBQUl6USxJQUFJLENBQUUsSUFBSUMsT0FBTyxDQUFFZ0MsTUFBTSxDQUFDc08sSUFBSSxFQUFFdE8sTUFBTSxDQUFDdU8sSUFBSyxDQUFDLEVBQUUsSUFBSXZRLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUUsQ0FBQztJQUVoRyxJQUFJeVEsUUFBUTtJQUNaLElBQUloTyxDQUFDO0lBQ0w7SUFDQSxNQUFNaU8sMEJBQTBCLEdBQUcsSUFBSSxDQUFDeEIsWUFBWSxDQUFFZSxnQkFBaUIsQ0FBQyxDQUFDWCxNQUFNLENBQUUsSUFBSSxDQUFDSixZQUFZLENBQUVtQixnQkFBaUIsQ0FBRSxDQUFDO0lBQ3hILEtBQU01TixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdpTywwQkFBMEIsQ0FBQ2hPLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7TUFDeERnTyxRQUFRLEdBQUdDLDBCQUEwQixDQUFFak8sQ0FBQyxDQUFFLENBQUNnQixLQUFLO01BQ2hELElBQUtnTixRQUFRLENBQUN2UCxDQUFDLElBQUljLE1BQU0sQ0FBQ2tPLElBQUksSUFBSU8sUUFBUSxDQUFDdlAsQ0FBQyxJQUFJYyxNQUFNLENBQUNzTyxJQUFJLEVBQUc7UUFDNUQsT0FBTyxJQUFJO01BQ2I7SUFDRjtJQUVBLE1BQU1LLHdCQUF3QixHQUFHLElBQUksQ0FBQ3pCLFlBQVksQ0FBRWtCLGNBQWUsQ0FBQyxDQUFDZCxNQUFNLENBQUUsSUFBSSxDQUFDSixZQUFZLENBQUVzQixjQUFlLENBQUUsQ0FBQztJQUNsSCxLQUFNL04sQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHa08sd0JBQXdCLENBQUNqTyxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFHO01BQ3REZ08sUUFBUSxHQUFHRSx3QkFBd0IsQ0FBRWxPLENBQUMsQ0FBRSxDQUFDZ0IsS0FBSztNQUM5QyxJQUFLZ04sUUFBUSxDQUFDdFAsQ0FBQyxJQUFJYSxNQUFNLENBQUNtTyxJQUFJLElBQUlNLFFBQVEsQ0FBQ3RQLENBQUMsSUFBSWEsTUFBTSxDQUFDdU8sSUFBSSxFQUFHO1FBQzVELE9BQU8sSUFBSTtNQUNiO0lBQ0Y7O0lBRUE7SUFDQSxPQUFPLEtBQUs7RUFDZDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSyxlQUFlQSxDQUFFQyxVQUFVLEVBQUc7SUFDNUIsSUFBSTlPLFFBQVEsR0FBRyxFQUFFO0lBQ2pCLE1BQU1DLE1BQU0sR0FBR2xDLE9BQU8sQ0FBQ29PLE9BQU8sQ0FBQ3pNLElBQUksQ0FBQyxDQUFDO0lBQ3JDLElBQUlxUCxNQUFNLEdBQUcsSUFBSSxDQUFDL08sUUFBUSxDQUFDVyxNQUFNO0lBQ2pDLEtBQU0sSUFBSUQsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHcU8sTUFBTSxFQUFFck8sQ0FBQyxFQUFFLEVBQUc7TUFDakMsTUFBTXFKLE9BQU8sR0FBRyxJQUFJLENBQUMvSixRQUFRLENBQUVVLENBQUMsQ0FBRTtNQUNsQyxNQUFNc08sY0FBYyxHQUFHakYsT0FBTyxDQUFDa0YsT0FBTyxDQUFFSCxVQUFXLENBQUM7TUFDcEQ5TyxRQUFRLEdBQUdBLFFBQVEsQ0FBQ3VOLE1BQU0sQ0FBRXlCLGNBQWUsQ0FBQztJQUM5QztJQUNBRCxNQUFNLEdBQUcvTyxRQUFRLENBQUNXLE1BQU07SUFDeEIsS0FBTSxJQUFJRCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdxTyxNQUFNLEVBQUVyTyxDQUFDLEVBQUUsRUFBRztNQUNqQ1QsTUFBTSxDQUFDaVAsYUFBYSxDQUFFbFAsUUFBUSxDQUFFVSxDQUFDLENBQUUsQ0FBQ1QsTUFBTyxDQUFDO0lBQzlDO0lBQ0EsT0FBTyxJQUFJSCxLQUFLLENBQUVFLFFBQVEsRUFBRUMsTUFBTyxDQUFDO0VBQ3RDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VrUCxjQUFjQSxDQUFFdkIsUUFBUSxFQUFHO0lBQ3pCO0lBQ0EsTUFBTTVOLFFBQVEsR0FBRyxFQUFFO0lBQ25CLE1BQU1DLE1BQU0sR0FBR2xDLE9BQU8sQ0FBQ29PLE9BQU8sQ0FBQ3pNLElBQUksQ0FBQyxDQUFDO0lBQ3JDLElBQUlxUCxNQUFNLEdBQUcsSUFBSSxDQUFDL08sUUFBUSxDQUFDVyxNQUFNO0lBQ2pDLEtBQU0sSUFBSUQsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHcU8sTUFBTSxFQUFFck8sQ0FBQyxFQUFFLEVBQUc7TUFDakNWLFFBQVEsQ0FBQ29QLElBQUksQ0FBRSxJQUFJLENBQUNwUCxRQUFRLENBQUVVLENBQUMsQ0FBRSxDQUFDMk8sTUFBTSxDQUFFekIsUUFBUyxDQUFFLENBQUM7SUFDeEQ7SUFDQW1CLE1BQU0sR0FBRy9PLFFBQVEsQ0FBQ1csTUFBTTtJQUN4QixLQUFNLElBQUlELENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3FPLE1BQU0sRUFBRXJPLENBQUMsRUFBRSxFQUFHO01BQ2pDVCxNQUFNLENBQUNpUCxhQUFhLENBQUVsUCxRQUFRLENBQUVVLENBQUMsQ0FBRSxDQUFDVCxNQUFPLENBQUM7SUFDOUM7SUFDQSxPQUFPLElBQUlILEtBQUssQ0FBRUUsUUFBUSxFQUFFQyxNQUFPLENBQUM7RUFDdEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VxUCxjQUFjQSxDQUFFQyxRQUFRLEVBQUVDLGNBQWMsRUFBRTFFLE9BQU8sRUFBRztJQUNsREEsT0FBTyxHQUFHNU0sS0FBSyxDQUFFO01BQ2Y7TUFDQXFPLGVBQWUsRUFBRSxLQUFLO01BRXRCO01BQ0FDLFlBQVksRUFBRTtJQUNoQixDQUFDLEVBQUUxQixPQUFRLENBQUM7SUFFWixPQUFPLElBQUloTCxLQUFLLENBQUVnQixDQUFDLENBQUMyTyxPQUFPLENBQUUsSUFBSSxDQUFDelAsUUFBUSxDQUFDb0wsR0FBRyxDQUFFckIsT0FBTyxJQUFJQSxPQUFPLENBQUMyRixNQUFNLENBQUVILFFBQVEsRUFBRUMsY0FBYyxFQUFFMUUsT0FBTyxDQUFDeUIsZUFBZSxFQUFFekIsT0FBTyxDQUFDMEIsWUFBYSxDQUFFLENBQUUsQ0FBRSxDQUFDO0VBQzVKOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFbUQsU0FBU0EsQ0FBQSxFQUFHO0lBQ1YsSUFBSyxJQUFJLENBQUN6UCxPQUFPLEtBQUssSUFBSSxFQUFHO01BQzNCLE1BQU1ELE1BQU0sR0FBR2xDLE9BQU8sQ0FBQ29PLE9BQU8sQ0FBQ3pNLElBQUksQ0FBQyxDQUFDO01BQ3JDb0IsQ0FBQyxDQUFDQyxJQUFJLENBQUUsSUFBSSxDQUFDZixRQUFRLEVBQUUrSixPQUFPLElBQUk7UUFDaEM5SixNQUFNLENBQUNpUCxhQUFhLENBQUVuRixPQUFPLENBQUM0RixTQUFTLENBQUMsQ0FBRSxDQUFDO01BQzdDLENBQUUsQ0FBQztNQUNILElBQUksQ0FBQ3pQLE9BQU8sR0FBR0QsTUFBTTtJQUN2QjtJQUNBLE9BQU8sSUFBSSxDQUFDQyxPQUFPO0VBQ3JCO0VBRUEsSUFBSUQsTUFBTUEsQ0FBQSxFQUFHO0lBQUUsT0FBTyxJQUFJLENBQUMwUCxTQUFTLENBQUMsQ0FBQztFQUFFOztFQUV4QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLGdCQUFnQkEsQ0FBRWQsVUFBVSxFQUFHO0lBQzdCak8sTUFBTSxJQUFJQSxNQUFNLENBQUVpTyxVQUFVLFlBQVlyUSxVQUFXLENBQUM7O0lBRXBEO0lBQ0E7SUFDQSxJQUFJb1IsdUJBQXVCLEdBQUcsSUFBSTtJQUNsQyxLQUFNLElBQUluUCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDVixRQUFRLENBQUNXLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7TUFDL0MsTUFBTXFKLE9BQU8sR0FBRyxJQUFJLENBQUMvSixRQUFRLENBQUVVLENBQUMsQ0FBRTs7TUFFbEM7TUFDQTtNQUNBLElBQUtxSixPQUFPLENBQUMyQixVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMzQixPQUFPLENBQUMrQixRQUFRLENBQUMsQ0FBQyxFQUFHO1FBQ2pEK0QsdUJBQXVCLEdBQUcsS0FBSztRQUMvQjtNQUNGO01BQ0EsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcvRixPQUFPLENBQUM0QixRQUFRLENBQUNoTCxNQUFNLEVBQUVtUCxDQUFDLEVBQUUsRUFBRztRQUNsRCxNQUFNckssT0FBTyxHQUFHc0UsT0FBTyxDQUFDNEIsUUFBUSxDQUFFbUUsQ0FBQyxDQUFFO1FBQ3JDLElBQUssQ0FBQ3JLLE9BQU8sQ0FBQ29LLHVCQUF1QixDQUFDLENBQUMsRUFBRztVQUN4Q0EsdUJBQXVCLEdBQUcsS0FBSztVQUMvQjtRQUNGO01BQ0Y7SUFDRjtJQUVBLElBQUtBLHVCQUF1QixFQUFHO01BQzdCLE9BQU8sSUFBSSxDQUFDNVAsTUFBTSxDQUFDOFAsT0FBTyxDQUFFakIsVUFBVSxDQUFDa0IsU0FBUyxHQUFHLENBQUUsQ0FBQztJQUN4RCxDQUFDLE1BQ0k7TUFDSCxNQUFNL1AsTUFBTSxHQUFHLElBQUksQ0FBQ0EsTUFBTSxDQUFDUCxJQUFJLENBQUMsQ0FBQztNQUNqQyxLQUFNLElBQUlnQixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDVixRQUFRLENBQUNXLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7UUFDL0MsTUFBTVYsUUFBUSxHQUFHLElBQUksQ0FBQ0EsUUFBUSxDQUFFVSxDQUFDLENBQUUsQ0FBQ3VPLE9BQU8sQ0FBRUgsVUFBVyxDQUFDO1FBQ3pELEtBQU0sSUFBSWdCLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzlQLFFBQVEsQ0FBQ1csTUFBTSxFQUFFbVAsQ0FBQyxFQUFFLEVBQUc7VUFDMUM3UCxNQUFNLENBQUNpUCxhQUFhLENBQUVsUCxRQUFRLENBQUU4UCxDQUFDLENBQUUsQ0FBQzdQLE1BQU8sQ0FBQztRQUM5QztNQUNGO01BQ0EsT0FBT0EsTUFBTTtJQUNmO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFZ1Esc0JBQXNCQSxDQUFBLEVBQUc7SUFDdkIsT0FBTzNSLEtBQUssQ0FBQzRSLGVBQWUsQ0FBRSxJQUFLLENBQUM7RUFDdEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsc0JBQXNCQSxDQUFFbkUsTUFBTSxFQUFFOEMsVUFBVSxFQUFHO0lBQzNDLE1BQU03TyxNQUFNLEdBQUdsQyxPQUFPLENBQUNvTyxPQUFPLENBQUN6TSxJQUFJLENBQUMsQ0FBQztJQUVyQyxNQUFNMk4sV0FBVyxHQUFHLElBQUksQ0FBQ3JOLFFBQVEsQ0FBQ1csTUFBTTtJQUN4QyxLQUFNLElBQUlELENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzJNLFdBQVcsRUFBRTNNLENBQUMsRUFBRSxFQUFHO01BQ3RDLE1BQU1xSixPQUFPLEdBQUcsSUFBSSxDQUFDL0osUUFBUSxDQUFFVSxDQUFDLENBQUU7TUFDbENULE1BQU0sQ0FBQ2lQLGFBQWEsQ0FBRW5GLE9BQU8sQ0FBQ29HLHNCQUFzQixDQUFFbkUsTUFBTyxDQUFFLENBQUM7SUFDbEU7SUFFQSxJQUFLOEMsVUFBVSxFQUFHO01BQ2hCN08sTUFBTSxDQUFDaVAsYUFBYSxDQUFFLElBQUksQ0FBQ0wsZUFBZSxDQUFFQyxVQUFXLENBQUMsQ0FBQ3FCLHNCQUFzQixDQUFFbkUsTUFBTyxDQUFFLENBQUM7SUFDN0Y7SUFFQSxPQUFPL0wsTUFBTTtFQUNmOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFbVEsa0JBQWtCQSxDQUFFQyxVQUFVLEVBQUc7SUFDL0IsTUFBTWxSLENBQUMsR0FBRyxJQUFJLENBQUNjLE1BQU0sQ0FBQ2tPLElBQUk7SUFDMUIsTUFBTS9PLENBQUMsR0FBRyxJQUFJLENBQUNhLE1BQU0sQ0FBQ21PLElBQUk7SUFDMUIsTUFBTXZFLEtBQUssR0FBRyxJQUFJLENBQUM1SixNQUFNLENBQUM0SixLQUFLO0lBQy9CLE1BQU1DLE1BQU0sR0FBRyxJQUFJLENBQUM3SixNQUFNLENBQUM2SixNQUFNO0lBRWpDLE1BQU13RyxhQUFhLEdBQUd6RyxLQUFLLEdBQUdDLE1BQU07SUFDcEMsSUFBSXlHLEtBQUssR0FBRyxDQUFDO0lBQ2IsTUFBTTdPLEtBQUssR0FBRyxJQUFJekQsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDakMsS0FBTSxJQUFJeUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHMlAsVUFBVSxFQUFFM1AsQ0FBQyxFQUFFLEVBQUc7TUFDckNnQixLQUFLLENBQUN2QyxDQUFDLEdBQUdBLENBQUMsR0FBR0osWUFBWSxDQUFDLENBQUMsR0FBRzhLLEtBQUs7TUFDcENuSSxLQUFLLENBQUN0QyxDQUFDLEdBQUdBLENBQUMsR0FBR0wsWUFBWSxDQUFDLENBQUMsR0FBRytLLE1BQU07TUFDckMsSUFBSyxJQUFJLENBQUNrRCxhQUFhLENBQUV0TCxLQUFNLENBQUMsRUFBRztRQUNqQzZPLEtBQUssRUFBRTtNQUNUO0lBQ0Y7SUFDQSxPQUFPRCxhQUFhLEdBQUdDLEtBQUssR0FBR0YsVUFBVTtFQUMzQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLHFCQUFxQkEsQ0FBQSxFQUFHO0lBQ3RCO0lBQ0EsT0FBT3hSLElBQUksQ0FBQ3lSLEdBQUcsQ0FBRTNQLENBQUMsQ0FBQzRQLEdBQUcsQ0FBRSxJQUFJLENBQUMxUSxRQUFRLENBQUNvTCxHQUFHLENBQUVyQixPQUFPLElBQUlqSixDQUFDLENBQUM0UCxHQUFHLENBQUUzRyxPQUFPLENBQUM0RyxlQUFlLENBQUMsQ0FBQyxDQUFDdkYsR0FBRyxDQUFFM0YsT0FBTyxJQUFJQSxPQUFPLENBQUNtTCxxQkFBcUIsQ0FBQyxDQUFFLENBQUUsQ0FBRSxDQUFFLENBQUUsQ0FBQztFQUNsSjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsT0FBT0EsQ0FBQSxFQUFHO0lBQ1IsT0FBTyxJQUFJLENBQUNaLHNCQUFzQixDQUFDLENBQUMsQ0FBQ08scUJBQXFCLENBQUMsQ0FBQztFQUM5RDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VNLHNCQUFzQkEsQ0FBRVQsVUFBVSxFQUFHO0lBQ25DLE1BQU1sUixDQUFDLEdBQUcsSUFBSSxDQUFDYyxNQUFNLENBQUNrTyxJQUFJO0lBQzFCLE1BQU0vTyxDQUFDLEdBQUcsSUFBSSxDQUFDYSxNQUFNLENBQUNtTyxJQUFJO0lBQzFCLE1BQU12RSxLQUFLLEdBQUcsSUFBSSxDQUFDNUosTUFBTSxDQUFDNEosS0FBSztJQUMvQixNQUFNQyxNQUFNLEdBQUcsSUFBSSxDQUFDN0osTUFBTSxDQUFDNkosTUFBTTtJQUVqQyxJQUFJeUcsS0FBSyxHQUFHLENBQUM7SUFDYixNQUFNRyxHQUFHLEdBQUcsSUFBSXpTLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0lBQy9CLE1BQU15RCxLQUFLLEdBQUcsSUFBSXpELE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0lBQ2pDLEtBQU0sSUFBSXlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzJQLFVBQVUsRUFBRTNQLENBQUMsRUFBRSxFQUFHO01BQ3JDZ0IsS0FBSyxDQUFDdkMsQ0FBQyxHQUFHQSxDQUFDLEdBQUdKLFlBQVksQ0FBQyxDQUFDLEdBQUc4SyxLQUFLO01BQ3BDbkksS0FBSyxDQUFDdEMsQ0FBQyxHQUFHQSxDQUFDLEdBQUdMLFlBQVksQ0FBQyxDQUFDLEdBQUcrSyxNQUFNO01BQ3JDLElBQUssSUFBSSxDQUFDa0QsYUFBYSxDQUFFdEwsS0FBTSxDQUFDLEVBQUc7UUFDakNnUCxHQUFHLENBQUM3USxHQUFHLENBQUU2QixLQUFNLENBQUM7UUFDaEI2TyxLQUFLLEVBQUU7TUFDVDtJQUNGO0lBQ0EsT0FBT0csR0FBRyxDQUFDakksYUFBYSxDQUFFOEgsS0FBTSxDQUFDO0VBQ25DOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VRLGdCQUFnQkEsQ0FBRXJQLEtBQUssRUFBRztJQUN4QixPQUFPNUMsT0FBTyxDQUFDa1MsMEJBQTBCLENBQUVsUSxDQUFDLENBQUMyTyxPQUFPLENBQUUsSUFBSSxDQUFDelAsUUFBUSxDQUFDb0wsR0FBRyxDQUFFckIsT0FBTyxJQUFJQSxPQUFPLENBQUNnSCxnQkFBZ0IsQ0FBRXJQLEtBQU0sQ0FBRSxDQUFFLENBQUUsQ0FBQztFQUM3SDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0V1UCxlQUFlQSxDQUFFdlAsS0FBSyxFQUFHO0lBQ3ZCLE9BQU8sSUFBSSxDQUFDcVAsZ0JBQWdCLENBQUVyUCxLQUFNLENBQUMsQ0FBRSxDQUFDLENBQUUsQ0FBQ3dQLFlBQVk7RUFDekQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLGdCQUFnQkEsQ0FBQSxFQUFHO0lBQ2pCLElBQUksQ0FBQzNRLG1CQUFtQixHQUFHLElBQUk7SUFFL0IsTUFBTTZNLFdBQVcsR0FBRyxJQUFJLENBQUNyTixRQUFRLENBQUNXLE1BQU07SUFDeEMsS0FBTSxJQUFJRCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcyTSxXQUFXLEVBQUUzTSxDQUFDLEVBQUUsRUFBRztNQUN0QyxJQUFJLENBQUNWLFFBQVEsQ0FBRVUsQ0FBQyxDQUFFLENBQUN5USxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3ZDO0lBRUEsSUFBSSxDQUFDM1EsbUJBQW1CLEdBQUcsS0FBSztJQUNoQyxJQUFJLENBQUNGLFVBQVUsQ0FBQyxDQUFDO0VBQ25COztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRThRLFFBQVFBLENBQUEsRUFBRztJQUNUO0lBQ0EsT0FBUSx5QkFBd0IsSUFBSSxDQUFDNUYsVUFBVSxDQUFDLENBQUUsS0FBSTtFQUN4RDs7RUFFQTtBQUNGO0FBQ0E7O0VBRUU7QUFDRjtBQUNBO0VBQ0VsTCxVQUFVQSxDQUFBLEVBQUc7SUFDWE8sTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQyxJQUFJLENBQUNKLFVBQVUsRUFBRSxzQ0FBdUMsQ0FBQztJQUU1RSxJQUFLLENBQUMsSUFBSSxDQUFDRCxtQkFBbUIsRUFBRztNQUMvQixJQUFJLENBQUNOLE9BQU8sR0FBRyxJQUFJO01BRW5CLElBQUksQ0FBQzhILDJCQUEyQixDQUFDLENBQUM7SUFDcEM7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFQSwyQkFBMkJBLENBQUEsRUFBRztJQUM1QixJQUFJLENBQUM3SCxrQkFBa0IsQ0FBQ2tSLElBQUksQ0FBQyxDQUFDO0VBQ2hDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRXZPLG1CQUFtQkEsQ0FBRTJDLE9BQU8sRUFBRztJQUM3QixJQUFJLENBQUMvQyxjQUFjLENBQUMsQ0FBQyxDQUFDNE8sVUFBVSxDQUFFN0wsT0FBUSxDQUFDO0lBQzNDLElBQUksQ0FBQ25GLFVBQVUsQ0FBQyxDQUFDO0VBQ25COztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFeUMsTUFBTUEsQ0FBRXJCLEtBQUssRUFBRztJQUNkLElBQUssQ0FBQyxJQUFJLENBQUNjLFdBQVcsQ0FBQyxDQUFDLEVBQUc7TUFDekIsSUFBSSxDQUFDNUIsVUFBVSxDQUFFLElBQUlqQyxPQUFPLENBQUMsQ0FBRSxDQUFDO01BQ2hDLElBQUksQ0FBQytELGNBQWMsQ0FBQyxDQUFDLENBQUNQLFFBQVEsQ0FBRVQsS0FBTSxDQUFDO0lBQ3pDO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VkLFVBQVVBLENBQUVtSixPQUFPLEVBQUc7SUFDcEIsSUFBSSxDQUFDL0osUUFBUSxDQUFDb1AsSUFBSSxDQUFFckYsT0FBUSxDQUFDOztJQUU3QjtJQUNBQSxPQUFPLENBQUM1SixrQkFBa0IsQ0FBQ29SLFdBQVcsQ0FBRSxJQUFJLENBQUNsUixtQkFBb0IsQ0FBQztJQUVsRSxJQUFJLENBQUNDLFVBQVUsQ0FBQyxDQUFDO0lBRWpCLE9BQU8sSUFBSSxDQUFDLENBQUM7RUFDZjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWtDLFdBQVdBLENBQUEsRUFBRztJQUNaLE9BQU8sSUFBSSxDQUFDeEMsUUFBUSxDQUFDVyxNQUFNLEdBQUcsQ0FBQztFQUNqQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRStCLGNBQWNBLENBQUEsRUFBRztJQUNmLE9BQU81QixDQUFDLENBQUMwUSxJQUFJLENBQUUsSUFBSSxDQUFDeFIsUUFBUyxDQUFDO0VBQ2hDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFMkMsWUFBWUEsQ0FBQSxFQUFHO0lBQ2IsT0FBTyxJQUFJLENBQUNILFdBQVcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRSxjQUFjLENBQUMsQ0FBQyxDQUFDQyxZQUFZLENBQUMsQ0FBQyxHQUFHLElBQUk7RUFDekU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0U4TyxjQUFjQSxDQUFBLEVBQUc7SUFDZixJQUFLLENBQUMsSUFBSSxDQUFDalAsV0FBVyxDQUFDLENBQUMsRUFBRztNQUFFLE9BQU8sSUFBSTtJQUFFO0lBRTFDLE1BQU11SCxPQUFPLEdBQUcsSUFBSSxDQUFDckgsY0FBYyxDQUFDLENBQUM7SUFDckMsSUFBSyxDQUFDcUgsT0FBTyxDQUFDMkIsVUFBVSxDQUFDLENBQUMsRUFBRztNQUFFLE9BQU8sSUFBSTtJQUFFO0lBRTVDLE9BQU8zQixPQUFPLENBQUMwSCxjQUFjLENBQUMsQ0FBQztFQUNqQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRXJNLDhCQUE4QkEsQ0FBQSxFQUFHO0lBQy9CLE1BQU1zTSxTQUFTLEdBQUcsSUFBSSxDQUFDL08sWUFBWSxDQUFDLENBQUM7SUFFckMsSUFBSyxJQUFJLENBQUNwQix5QkFBeUIsRUFBRztNQUNwQyxPQUFPbVEsU0FBUyxDQUFDeFAsSUFBSSxDQUFFd1AsU0FBUyxDQUFDMU4sS0FBSyxDQUFFLElBQUksQ0FBQ3pDLHlCQUEwQixDQUFFLENBQUM7SUFDNUUsQ0FBQyxNQUNJO01BQ0gsT0FBT21RLFNBQVM7SUFDbEI7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRXJMLDBCQUEwQkEsQ0FBQSxFQUFHO0lBQzNCLE1BQU1xTCxTQUFTLEdBQUcsSUFBSSxDQUFDL08sWUFBWSxDQUFDLENBQUM7SUFFckMsSUFBSyxJQUFJLENBQUNuQixxQkFBcUIsRUFBRztNQUNoQyxPQUFPa1EsU0FBUyxDQUFDeFAsSUFBSSxDQUFFd1AsU0FBUyxDQUFDMU4sS0FBSyxDQUFFLElBQUksQ0FBQ3hDLHFCQUFzQixDQUFFLENBQUM7SUFDeEUsQ0FBQyxNQUNJO01BQ0gsT0FBT2tRLFNBQVM7SUFDbEI7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRXpQLGdCQUFnQkEsQ0FBQSxFQUFHO0lBQ2pCLE1BQU15UCxTQUFTLEdBQUcsSUFBSSxDQUFDL08sWUFBWSxDQUFDLENBQUM7SUFDckMsT0FBTytPLFNBQVMsR0FBR0EsU0FBUyxHQUFHelQsT0FBTyxDQUFDMFQsSUFBSTtFQUM3Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxVQUFVQSxDQUFFQyxLQUFLLEVBQUc7SUFDbEIsT0FBT3ZULEtBQUssQ0FBQ3dULFlBQVksQ0FBRSxJQUFJLEVBQUVELEtBQUssRUFBRXZULEtBQUssQ0FBQ3lULG9CQUFxQixDQUFDO0VBQ3RFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsaUJBQWlCQSxDQUFFSCxLQUFLLEVBQUc7SUFDekIsT0FBT3ZULEtBQUssQ0FBQ3dULFlBQVksQ0FBRSxJQUFJLEVBQUVELEtBQUssRUFBRXZULEtBQUssQ0FBQzJULDJCQUE0QixDQUFDO0VBQzdFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsZUFBZUEsQ0FBRUwsS0FBSyxFQUFHO0lBQ3ZCLE9BQU92VCxLQUFLLENBQUN3VCxZQUFZLENBQUUsSUFBSSxFQUFFRCxLQUFLLEVBQUV2VCxLQUFLLENBQUM2VCx5QkFBMEIsQ0FBQztFQUMzRTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFFBQVFBLENBQUVQLEtBQUssRUFBRztJQUNoQixPQUFPdlQsS0FBSyxDQUFDd1QsWUFBWSxDQUFFLElBQUksRUFBRUQsS0FBSyxFQUFFdlQsS0FBSyxDQUFDK1Qsa0JBQW1CLENBQUM7RUFDcEU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxTQUFTQSxDQUFFVCxLQUFLLEVBQUUvRyxPQUFPLEVBQUc7SUFDMUIsT0FBT3hNLEtBQUssQ0FBQ2lVLFNBQVMsQ0FBRVYsS0FBSyxFQUFFLElBQUksRUFBRS9HLE9BQVEsQ0FBQztFQUNoRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRTBILFlBQVlBLENBQUVqRyxlQUFlLEVBQUVDLFlBQVksRUFBRUYsU0FBUyxFQUFHO0lBQ3ZELElBQUkzTCxNQUFNLEdBQUcsQ0FBQztJQUNkLEtBQU0sSUFBSUQsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ1YsUUFBUSxDQUFDVyxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFHO01BQy9DQyxNQUFNLElBQUksSUFBSSxDQUFDWCxRQUFRLENBQUVVLENBQUMsQ0FBRSxDQUFDOFIsWUFBWSxDQUFFakcsZUFBZSxFQUFFQyxZQUFZLEVBQUVGLFNBQVUsQ0FBQztJQUN2RjtJQUNBLE9BQU8zTCxNQUFNO0VBQ2Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0U4UixTQUFTQSxDQUFBLEVBQUc7SUFDVixPQUFPO01BQ0xDLElBQUksRUFBRSxPQUFPO01BQ2IxUyxRQUFRLEVBQUUsSUFBSSxDQUFDQSxRQUFRLENBQUNvTCxHQUFHLENBQUVyQixPQUFPLElBQUlBLE9BQU8sQ0FBQzBJLFNBQVMsQ0FBQyxDQUFFO0lBQzlELENBQUM7RUFDSDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9FLFdBQVdBLENBQUVDLEdBQUcsRUFBRztJQUN4Qi9SLE1BQU0sSUFBSUEsTUFBTSxDQUFFK1IsR0FBRyxDQUFDRixJQUFJLEtBQUssT0FBUSxDQUFDO0lBRXhDLE9BQU8sSUFBSTVTLEtBQUssQ0FBRThTLEdBQUcsQ0FBQzVTLFFBQVEsQ0FBQ29MLEdBQUcsQ0FBRXpNLE9BQU8sQ0FBQ2dVLFdBQVksQ0FBRSxDQUFDO0VBQzdEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBT0UsU0FBU0EsQ0FBRTFULENBQUMsRUFBRUMsQ0FBQyxFQUFFeUssS0FBSyxFQUFFQyxNQUFNLEVBQUc7SUFDdEMsT0FBTyxJQUFJaEssS0FBSyxDQUFDLENBQUMsQ0FBQzhKLElBQUksQ0FBRXpLLENBQUMsRUFBRUMsQ0FBQyxFQUFFeUssS0FBSyxFQUFFQyxNQUFPLENBQUM7RUFDaEQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBT0ssU0FBU0EsQ0FBRWhMLENBQUMsRUFBRUMsQ0FBQyxFQUFFeUssS0FBSyxFQUFFQyxNQUFNLEVBQUVNLElBQUksRUFBRUMsSUFBSSxFQUFHO0lBQ2xELE9BQU8sSUFBSXZLLEtBQUssQ0FBQyxDQUFDLENBQUNxSyxTQUFTLENBQUVoTCxDQUFDLEVBQUVDLENBQUMsRUFBRXlLLEtBQUssRUFBRUMsTUFBTSxFQUFFTSxJQUFJLEVBQUVDLElBQUssQ0FBQztFQUNqRTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPeUkseUJBQXlCQSxDQUFFM1QsQ0FBQyxFQUFFQyxDQUFDLEVBQUV5SyxLQUFLLEVBQUVDLE1BQU0sRUFBRWlKLFdBQVcsRUFBRztJQUVuRTtJQUNBLElBQUlDLGFBQWEsR0FBR0QsV0FBVyxJQUFJQSxXQUFXLENBQUNFLE9BQU8sSUFBSSxDQUFDO0lBQzNELElBQUlDLGNBQWMsR0FBR0gsV0FBVyxJQUFJQSxXQUFXLENBQUNJLFFBQVEsSUFBSSxDQUFDO0lBQzdELElBQUlDLGdCQUFnQixHQUFHTCxXQUFXLElBQUlBLFdBQVcsQ0FBQ00sVUFBVSxJQUFJLENBQUM7SUFDakUsSUFBSUMsaUJBQWlCLEdBQUdQLFdBQVcsSUFBSUEsV0FBVyxDQUFDUSxXQUFXLElBQUksQ0FBQzs7SUFFbkU7SUFDQTFTLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU8xQixDQUFDLEtBQUssUUFBUSxJQUFJMEMsUUFBUSxDQUFFMUMsQ0FBRSxDQUFDLEVBQUUsY0FBZSxDQUFDO0lBQzFFMEIsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT3pCLENBQUMsS0FBSyxRQUFRLElBQUl5QyxRQUFRLENBQUV6QyxDQUFFLENBQUMsRUFBRSxjQUFlLENBQUM7SUFDMUV5QixNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPZ0osS0FBSyxLQUFLLFFBQVEsSUFBSUEsS0FBSyxJQUFJLENBQUMsSUFBSWhJLFFBQVEsQ0FBRWdJLEtBQU0sQ0FBQyxFQUFFLDhCQUErQixDQUFDO0lBQ2hIaEosTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT2lKLE1BQU0sS0FBSyxRQUFRLElBQUlBLE1BQU0sSUFBSSxDQUFDLElBQUlqSSxRQUFRLENBQUVpSSxNQUFPLENBQUMsRUFBRSwrQkFBZ0MsQ0FBQztJQUNwSGpKLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU9tUyxhQUFhLEtBQUssUUFBUSxJQUFJQSxhQUFhLElBQUksQ0FBQyxJQUFJblIsUUFBUSxDQUFFbVIsYUFBYyxDQUFDLEVBQ3BHLGlCQUFrQixDQUFDO0lBQ3JCblMsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT3FTLGNBQWMsS0FBSyxRQUFRLElBQUlBLGNBQWMsSUFBSSxDQUFDLElBQUlyUixRQUFRLENBQUVxUixjQUFlLENBQUMsRUFDdkcsa0JBQW1CLENBQUM7SUFDdEJyUyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPdVMsZ0JBQWdCLEtBQUssUUFBUSxJQUFJQSxnQkFBZ0IsSUFBSSxDQUFDLElBQUl2UixRQUFRLENBQUV1UixnQkFBaUIsQ0FBQyxFQUM3RyxvQkFBcUIsQ0FBQztJQUN4QnZTLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU95UyxpQkFBaUIsS0FBSyxRQUFRLElBQUlBLGlCQUFpQixJQUFJLENBQUMsSUFBSXpSLFFBQVEsQ0FBRXlSLGlCQUFrQixDQUFDLEVBQ2hILHFCQUFzQixDQUFDOztJQUV6QjtJQUNBO0lBQ0EsTUFBTUUsTUFBTSxHQUFHUixhQUFhLEdBQUdFLGNBQWM7SUFDN0MsSUFBS00sTUFBTSxHQUFHM0osS0FBSyxJQUFJMkosTUFBTSxHQUFHLENBQUMsRUFBRztNQUVsQ1IsYUFBYSxHQUFHQSxhQUFhLEdBQUdRLE1BQU0sR0FBRzNKLEtBQUs7TUFDOUNxSixjQUFjLEdBQUdBLGNBQWMsR0FBR00sTUFBTSxHQUFHM0osS0FBSztJQUNsRDtJQUNBLE1BQU00SixTQUFTLEdBQUdMLGdCQUFnQixHQUFHRSxpQkFBaUI7SUFDdEQsSUFBS0csU0FBUyxHQUFHNUosS0FBSyxJQUFJNEosU0FBUyxHQUFHLENBQUMsRUFBRztNQUV4Q0wsZ0JBQWdCLEdBQUdBLGdCQUFnQixHQUFHSyxTQUFTLEdBQUc1SixLQUFLO01BQ3ZEeUosaUJBQWlCLEdBQUdBLGlCQUFpQixHQUFHRyxTQUFTLEdBQUc1SixLQUFLO0lBQzNEO0lBQ0EsTUFBTTZKLE9BQU8sR0FBR1YsYUFBYSxHQUFHSSxnQkFBZ0I7SUFDaEQsSUFBS00sT0FBTyxHQUFHNUosTUFBTSxJQUFJNEosT0FBTyxHQUFHLENBQUMsRUFBRztNQUVyQ1YsYUFBYSxHQUFHQSxhQUFhLEdBQUdVLE9BQU8sR0FBRzVKLE1BQU07TUFDaERzSixnQkFBZ0IsR0FBR0EsZ0JBQWdCLEdBQUdNLE9BQU8sR0FBRzVKLE1BQU07SUFDeEQ7SUFDQSxNQUFNNkosUUFBUSxHQUFHVCxjQUFjLEdBQUdJLGlCQUFpQjtJQUNuRCxJQUFLSyxRQUFRLEdBQUc3SixNQUFNLElBQUk2SixRQUFRLEdBQUcsQ0FBQyxFQUFHO01BQ3ZDVCxjQUFjLEdBQUdBLGNBQWMsR0FBR1MsUUFBUSxHQUFHN0osTUFBTTtNQUNuRHdKLGlCQUFpQixHQUFHQSxpQkFBaUIsR0FBR0ssUUFBUSxHQUFHN0osTUFBTTtJQUMzRDs7SUFFQTtJQUNBakosTUFBTSxJQUFJQSxNQUFNLENBQUVtUyxhQUFhLEdBQUdFLGNBQWMsSUFBSXJKLEtBQUssRUFBRSw0QkFBNkIsQ0FBQztJQUN6RmhKLE1BQU0sSUFBSUEsTUFBTSxDQUFFdVMsZ0JBQWdCLEdBQUdFLGlCQUFpQixJQUFJekosS0FBSyxFQUFFLCtCQUFnQyxDQUFDO0lBQ2xHaEosTUFBTSxJQUFJQSxNQUFNLENBQUVtUyxhQUFhLEdBQUdJLGdCQUFnQixJQUFJdEosTUFBTSxFQUFFLDZCQUE4QixDQUFDO0lBQzdGakosTUFBTSxJQUFJQSxNQUFNLENBQUVxUyxjQUFjLEdBQUdJLGlCQUFpQixJQUFJeEosTUFBTSxFQUFFLDhCQUErQixDQUFDO0lBRWhHLE1BQU0rSCxLQUFLLEdBQUcsSUFBSS9SLEtBQUssQ0FBQyxDQUFDO0lBQ3pCLE1BQU04VCxLQUFLLEdBQUd6VSxDQUFDLEdBQUcwSyxLQUFLO0lBQ3ZCLE1BQU1nSyxNQUFNLEdBQUd6VSxDQUFDLEdBQUcwSyxNQUFNOztJQUV6QjtJQUNBOztJQUVBLElBQUt3SixpQkFBaUIsR0FBRyxDQUFDLEVBQUc7TUFDM0J6QixLQUFLLENBQUNyTCxHQUFHLENBQUVvTixLQUFLLEdBQUdOLGlCQUFpQixFQUFFTyxNQUFNLEdBQUdQLGlCQUFpQixFQUFFQSxpQkFBaUIsRUFBRSxDQUFDLEVBQUV0VSxJQUFJLENBQUN5SyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQU0sQ0FBQztJQUM5RyxDQUFDLE1BQ0k7TUFDSG9JLEtBQUssQ0FBQ2pRLE1BQU0sQ0FBRWdTLEtBQUssRUFBRUMsTUFBTyxDQUFDO0lBQy9CO0lBRUEsSUFBS1QsZ0JBQWdCLEdBQUcsQ0FBQyxFQUFHO01BQzFCdkIsS0FBSyxDQUFDckwsR0FBRyxDQUFFckgsQ0FBQyxHQUFHaVUsZ0JBQWdCLEVBQUVTLE1BQU0sR0FBR1QsZ0JBQWdCLEVBQUVBLGdCQUFnQixFQUFFcFUsSUFBSSxDQUFDeUssRUFBRSxHQUFHLENBQUMsRUFBRXpLLElBQUksQ0FBQ3lLLEVBQUUsRUFBRSxLQUFNLENBQUM7SUFDN0csQ0FBQyxNQUNJO01BQ0hvSSxLQUFLLENBQUN6UCxNQUFNLENBQUVqRCxDQUFDLEVBQUUwVSxNQUFPLENBQUM7SUFDM0I7SUFFQSxJQUFLYixhQUFhLEdBQUcsQ0FBQyxFQUFHO01BQ3ZCbkIsS0FBSyxDQUFDckwsR0FBRyxDQUFFckgsQ0FBQyxHQUFHNlQsYUFBYSxFQUFFNVQsQ0FBQyxHQUFHNFQsYUFBYSxFQUFFQSxhQUFhLEVBQUVoVSxJQUFJLENBQUN5SyxFQUFFLEVBQUUsQ0FBQyxHQUFHekssSUFBSSxDQUFDeUssRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFNLENBQUM7SUFDbkcsQ0FBQyxNQUNJO01BQ0hvSSxLQUFLLENBQUN6UCxNQUFNLENBQUVqRCxDQUFDLEVBQUVDLENBQUUsQ0FBQztJQUN0QjtJQUVBLElBQUs4VCxjQUFjLEdBQUcsQ0FBQyxFQUFHO01BQ3hCckIsS0FBSyxDQUFDckwsR0FBRyxDQUFFb04sS0FBSyxHQUFHVixjQUFjLEVBQUU5VCxDQUFDLEdBQUc4VCxjQUFjLEVBQUVBLGNBQWMsRUFBRSxDQUFDLEdBQUdsVSxJQUFJLENBQUN5SyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBR3pLLElBQUksQ0FBQ3lLLEVBQUUsRUFBRSxLQUFNLENBQUM7SUFDOUcsQ0FBQyxNQUNJO01BQ0hvSSxLQUFLLENBQUN6UCxNQUFNLENBQUV3UixLQUFLLEVBQUV4VSxDQUFFLENBQUM7SUFDMUI7SUFFQXlTLEtBQUssQ0FBQ25LLEtBQUssQ0FBQyxDQUFDO0lBRWIsT0FBT21LLEtBQUs7RUFDZDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPaUMscUJBQXFCQSxDQUFFN1QsTUFBTSxFQUFFOFQsT0FBTyxFQUFFQyxLQUFLLEVBQUc7SUFDckQsTUFBTUMsWUFBWSxHQUFHaFUsTUFBTSxDQUFDaVUsV0FBVyxDQUFFSCxPQUFPLENBQUNJLElBQUksRUFBRUosT0FBTyxDQUFDSyxHQUFHLEVBQUVMLE9BQU8sQ0FBQ0gsS0FBSyxFQUFFRyxPQUFPLENBQUNGLE1BQU8sQ0FBQztJQUNuRyxPQUFPL1QsS0FBSyxDQUFDZ1QseUJBQXlCLENBQUVtQixZQUFZLENBQUM5RixJQUFJLEVBQUU4RixZQUFZLENBQUM3RixJQUFJLEVBQUU2RixZQUFZLENBQUNwSyxLQUFLLEVBQUVvSyxZQUFZLENBQUNuSyxNQUFNLEVBQUVrSyxLQUFNLENBQUM7RUFDaEk7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU90SixPQUFPQSxDQUFFQyxRQUFRLEVBQUc7SUFDekIsT0FBTyxJQUFJN0ssS0FBSyxDQUFDLENBQUMsQ0FBQzRLLE9BQU8sQ0FBRUMsUUFBUyxDQUFDO0VBQ3hDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBTzFLLE1BQU1BLENBQUVBLE1BQU0sRUFBRztJQUN0QixPQUFPLElBQUlILEtBQUssQ0FBQyxDQUFDLENBQUM4SixJQUFJLENBQUUzSixNQUFNLENBQUNrTyxJQUFJLEVBQUVsTyxNQUFNLENBQUNtTyxJQUFJLEVBQUVuTyxNQUFNLENBQUNzTyxJQUFJLEdBQUd0TyxNQUFNLENBQUNrTyxJQUFJLEVBQUVsTyxNQUFNLENBQUN1TyxJQUFJLEdBQUd2TyxNQUFNLENBQUNtTyxJQUFLLENBQUM7RUFDM0c7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPaUcsV0FBV0EsQ0FBRUMsQ0FBQyxFQUFFQyxDQUFDLEVBQUVDLENBQUMsRUFBRUMsQ0FBQyxFQUFHO0lBQy9CO0lBQ0EsSUFBSyxPQUFPSCxDQUFDLEtBQUssUUFBUSxFQUFHO01BQzNCLE9BQU8sSUFBSXhVLEtBQUssQ0FBQyxDQUFDLENBQUM4QixNQUFNLENBQUUwUyxDQUFDLEVBQUVDLENBQUUsQ0FBQyxDQUFDblMsTUFBTSxDQUFFb1MsQ0FBQyxFQUFFQyxDQUFFLENBQUM7SUFDbEQsQ0FBQyxNQUNJO01BQ0g7TUFDQSxPQUFPLElBQUkzVSxLQUFLLENBQUMsQ0FBQyxDQUFDZ0MsV0FBVyxDQUFFd1MsQ0FBRSxDQUFDLENBQUNqUyxXQUFXLENBQUVrUyxDQUFFLENBQUM7SUFDdEQ7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPRyxjQUFjQSxDQUFFQyxLQUFLLEVBQUVoTyxNQUFNLEVBQUc7SUFDckMsTUFBTWtMLEtBQUssR0FBRyxJQUFJL1IsS0FBSyxDQUFDLENBQUM7SUFDekJnQixDQUFDLENBQUNDLElBQUksQ0FBRUQsQ0FBQyxDQUFDOFQsS0FBSyxDQUFFRCxLQUFNLENBQUMsRUFBRS9JLENBQUMsSUFBSTtNQUM3QixNQUFNbEssS0FBSyxHQUFHekQsT0FBTyxDQUFDNE8sV0FBVyxDQUFFbEcsTUFBTSxFQUFFLENBQUMsR0FBRzNILElBQUksQ0FBQ3lLLEVBQUUsR0FBR21DLENBQUMsR0FBRytJLEtBQU0sQ0FBQztNQUNsRS9JLENBQUMsS0FBSyxDQUFDLEdBQUtpRyxLQUFLLENBQUMvUCxXQUFXLENBQUVKLEtBQU0sQ0FBQyxHQUFHbVEsS0FBSyxDQUFDeFAsV0FBVyxDQUFFWCxLQUFNLENBQUM7SUFDdkUsQ0FBRSxDQUFDO0lBQ0gsT0FBT21RLEtBQUssQ0FBQ25LLEtBQUssQ0FBQyxDQUFDO0VBQ3RCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBT2dDLE1BQU1BLENBQUVqRCxPQUFPLEVBQUVDLE9BQU8sRUFBRUMsTUFBTSxFQUFHO0lBQ3hDLElBQUtELE9BQU8sS0FBS3RGLFNBQVMsRUFBRztNQUMzQjtNQUNBLE9BQU8sSUFBSXRCLEtBQUssQ0FBQyxDQUFDLENBQUM0SixNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRWpELE9BQVEsQ0FBQztJQUM1QztJQUNBLE9BQU8sSUFBSTNHLEtBQUssQ0FBQyxDQUFDLENBQUM0SixNQUFNLENBQUVqRCxPQUFPLEVBQUVDLE9BQU8sRUFBRUMsTUFBTyxDQUFDO0VBQ3ZEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9nRCxPQUFPQSxDQUFFbEQsT0FBTyxFQUFFQyxPQUFPLEVBQUVZLE9BQU8sRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUc7SUFDN0Q7SUFDQSxJQUFLRCxPQUFPLEtBQUtuRyxTQUFTLEVBQUc7TUFDM0I7TUFDQSxPQUFPLElBQUl0QixLQUFLLENBQUMsQ0FBQyxDQUFDNkosT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVsRCxPQUFPLEVBQUVDLE9BQU8sRUFBRVksT0FBUSxDQUFDO0lBQy9EO0lBQ0EsT0FBTyxJQUFJeEgsS0FBSyxDQUFDLENBQUMsQ0FBQzZKLE9BQU8sQ0FBRWxELE9BQU8sRUFBRUMsT0FBTyxFQUFFWSxPQUFPLEVBQUVDLE9BQU8sRUFBRUMsUUFBUyxDQUFDO0VBQzVFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9oQixHQUFHQSxDQUFFQyxPQUFPLEVBQUVDLE9BQU8sRUFBRUMsTUFBTSxFQUFFQyxVQUFVLEVBQUVDLFFBQVEsRUFBRUMsYUFBYSxFQUFHO0lBQzFFLE9BQU8sSUFBSWhILEtBQUssQ0FBQyxDQUFDLENBQUMwRyxHQUFHLENBQUVDLE9BQU8sRUFBRUMsT0FBTyxFQUFFQyxNQUFNLEVBQUVDLFVBQVUsRUFBRUMsUUFBUSxFQUFFQyxhQUFjLENBQUM7RUFDekY7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPb0YsS0FBS0EsQ0FBRTJJLE1BQU0sRUFBRztJQUNyQixPQUFPdlcsS0FBSyxDQUFDd1csWUFBWSxDQUFFRCxNQUFPLENBQUM7RUFDckM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPMUgsWUFBWUEsQ0FBRTBILE1BQU0sRUFBRztJQUM1QixPQUFPdlcsS0FBSyxDQUFDeVcsbUJBQW1CLENBQUVGLE1BQU8sQ0FBQztFQUM1Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9HLEdBQUdBLENBQUVILE1BQU0sRUFBRztJQUNuQixPQUFPdlcsS0FBSyxDQUFDMlcsVUFBVSxDQUFFSixNQUFPLENBQUM7RUFDbkM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9sSixRQUFRQSxDQUFFQSxRQUFRLEVBQUV1SixNQUFNLEVBQUc7SUFDbEMsSUFBS3JVLE1BQU0sRUFBRztNQUNaLEtBQU0sSUFBSUgsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHaUwsUUFBUSxDQUFDaEwsTUFBTSxFQUFFRCxDQUFDLEVBQUUsRUFBRztRQUMxQ0csTUFBTSxDQUFFOEssUUFBUSxDQUFFakwsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFDa0MsR0FBRyxDQUFDdVMsYUFBYSxDQUFFeEosUUFBUSxDQUFFakwsQ0FBQyxDQUFFLENBQUMrQixLQUFLLEVBQUUsSUFBSyxDQUFDLEVBQUUsc0JBQXVCLENBQUM7TUFDcEc7SUFDRjtJQUVBLE9BQU8sSUFBSTNDLEtBQUssQ0FBRSxDQUFFLElBQUluQixPQUFPLENBQUVnTixRQUFRLEVBQUV2SyxTQUFTLEVBQUUsQ0FBQyxDQUFDOFQsTUFBTyxDQUFDLENBQUcsQ0FBQztFQUN0RTtBQUNGO0FBRUEzVyxJQUFJLENBQUM2VyxRQUFRLENBQUUsT0FBTyxFQUFFdFYsS0FBTSxDQUFDOztBQUUvQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQUEsS0FBSyxDQUFDOEosSUFBSSxHQUFHOUosS0FBSyxDQUFDK1MsU0FBUztBQUM1Qi9TLEtBQUssQ0FBQ3VWLGNBQWMsR0FBR3ZWLEtBQUssQ0FBQ3FLLFNBQVM7QUFFdEMsZUFBZXJLLEtBQUsifQ==