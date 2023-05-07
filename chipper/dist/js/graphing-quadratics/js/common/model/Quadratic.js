// Copyright 2018-2023, University of Colorado Boulder

/**
 * Quadratic is the model of an immutable quadratic, described by these equations:
 *
 * standard form: y = ax^2 + bx + c
 * vertex form: y = a(x - h)^2 + k
 * alternate vertex form: y = (1/(4p))(x - h)^2 + k
 *
 * Note that this implementation supports only parabolas that open up or down.  It does not support parabolas that
 * open left or right, which would be described by x = ay^2 + by + c.
 *
 * Typically, a quadratic requires a !== 0. But this sim is required to support a === 0.
 * So there is some non-standard behavior herein that is not exactly mathematically correct.
 * Specifically, when a === 0, Quadratic behaves like a straight line.  See for example solveX.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Color } from '../../../../scenery/js/imports.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQColors from '../GQColors.js';
import ObjectLiteralIO from '../../../../tandem/js/types/ObjectLiteralIO.js';

// The points for the Bezier curve that describes this quadratic.

export default class Quadratic {
  // Coefficients for standard form

  // The color used to render the curve.

  // Roots are ordered from left to right along the x-axis. null means that all points are roots (y = 0)

  // Fields for vertex form. Strictly speaking, we don't have a quadratic (or a parabola) if a === 0.
  // If that's the case, then these fields will be undefined.
  // y = directrix
  // x = h
  /**
   * Constructor parameters are coefficients of the standard form equation: y = ax^2 + bx + c
   */
  constructor(a, b, c, providedOptions) {
    const options = optionize()({
      // SelfOptions
      color: 'black'
    }, providedOptions);
    this.a = a;
    this.b = b;
    this.c = c;
    this.color = options.color;
    this.roots = solveRoots(a, b, c);

    // Strictly speaking, we don't have a quadratic (or a parabola) if a === 0.
    // If that's the case, then the fields in this if block will be undefined.
    if (a !== 0) {
      this.p = 1 / (4 * a);
      this.h = -b / (2 * a);
      this.k = c - b * b / (4 * a);
      this.vertex = new Vector2(this.h, this.k);
      this.focus = new Vector2(this.h, this.k + this.p);
      this.directrix = this.k - this.p; // y = directrix
      this.axisOfSymmetry = this.h; // x = h
    }
  }

  /**
   * Returns a copy of this Quadratic with a specified color.
   */
  withColor(color) {
    return new Quadratic(this.a, this.b, this.c, {
      color: color
    });
  }

  /**
   * Determines whether this quadratic and some other quadratic have the same standard-form coefficients.
   */
  hasSameCoefficients(quadratic) {
    return quadratic.a === this.a && quadratic.b === this.b && quadratic.c === this.c;
  }

  /**
   * Creates a Quadratic using coefficients of the vertex form equation: y = a(x - h)^2 + k
   * This method is used in the Vertex Form screen, where the user controls a, h, and k.
   */
  static createFromVertexForm(a, h, k, options) {
    const b = -2 * a * h;
    const c = a * h * h + k;
    return new Quadratic(a, b, c, options);
  }

  /**
   * Creates a Quadratic using coefficients of the alternate vertex form equation: y = (1/(4p))(x - h)^2 + k
   * This method is used in the Focus & Directrix screen, where the user controls p, h, and k.
   */
  static createFromAlternateVertexForm(p, h, k, options) {
    assert && assert(p !== 0, 'p cannot be zero');
    const a = 1 / (4 * p);
    return Quadratic.createFromVertexForm(a, h, k, options);
  }

  /**
   * Deserializes a Quadratic instance.
   */
  static fromStateObject(stateObject) {
    return new Quadratic(stateObject.a, stateObject.b, stateObject.c, {
      color: Color.fromStateObject(stateObject.color)
    });
  }

  /**
   * Returns a string representation of this Quadratic. For debugging only, do not rely on format!
   */
  toString() {
    return StringUtils.fillIn('Quadratic {{a}}x^2 + {{b}}x + {{c}}, color={{color}}', {
      a: this.a,
      b: this.b,
      c: this.c,
      color: this.color
    });
  }

  /**
   * Gets the quadratic term, y = ax^2
   */
  getQuadraticTerm() {
    return new Quadratic(this.a, 0, 0, {
      color: GQColors.QUADRATIC_TERM
    });
  }

  /**
   * Gets the linear term, y = bx
   */
  getLinearTerm() {
    return new Quadratic(0, this.b, 0, {
      color: GQColors.LINEAR_TERM
    });
  }

  /**
   * Gets the constant term, y = c
   */
  getConstantTerm() {
    return new Quadratic(0, 0, this.c, {
      color: GQColors.CONSTANT_TERM
    });
  }

  /**
   * Does this quadratic describe a parabola?
   * Typically, a quadratic requires a !== 0. But this sim is required to support a === 0, so this
   * method is used in places where we need to determine whether we're dealing with a parabola.
   */
  isaParabola() {
    return this.a !== 0;
  }

  /**
   * Given y, solve for x.
   * If there is more than one solution, they will be in ascending order.
   * @param y
   * @returns one or more solutions, null if there is no solution
   */
  solveX(y) {
    if (this.isaParabola()) {
      const vertex = this.vertex;
      assert && assert(vertex !== undefined);
      if (this.a > 0 && y < vertex.y || this.a < 0 && y > vertex.y) {
        // there is no solution, y is not on the parabola
        return null;
      } else {
        const k = this.k;
        assert && assert(k !== undefined);
        const h = this.h;
        assert && assert(h !== undefined);

        // For a parabola, use vertex form.
        // y = a(x - h)^2 + k => x = h +- Math.sqrt((y - k)/a)
        // This yields 2 solutions
        const commonTerm = Math.sqrt((y - k) / this.a);
        const x0 = h - commonTerm;
        const x1 = h + commonTerm;
        return [x0, x1].sort((x0, x1) => x0 - x1); // in ascending order
      }
    } else {
      // For a straight line, use slope-intercept form.
      // y = bx + c => x = (y - c)/b
      // This yields one solution.
      const x0 = (y - this.c) / this.b;
      return [x0];
    }
  }

  /**
   * Given x, solve for y.
   */
  solveY(x) {
    return this.a * x * x + this.b * x + this.c; // y = ax^2 + bx + c
  }

  /**
   * Gets the slope of the tangent line at point (x,f(x)) on the quadratic.
   */
  getTangentSlope(x) {
    assert && assert(this.isaParabola(), 'not supported for non-parabola');
    return 2 * this.a * x + this.b; // first derivative
  }

  /**
   * Gets the control points that describe this quadratic.
   * See https://github.com/phetsims/graphing-quadratics/issues/1
   */
  getControlPoints(xRange) {
    // to improve readability
    const minX = xRange.min;
    const maxX = xRange.max;
    const length = xRange.getLength();
    const aPrime = this.a * length * length;
    const bPrime = 2 * this.a * minX * length + this.b * length;
    const cPrime = this.a * minX * minX + this.b * minX + this.c;
    return {
      startPoint: new Vector2(minX, cPrime),
      controlPoint: new Vector2((minX + maxX) / 2, bPrime / 2 + cPrime),
      endPoint: new Vector2(maxX, aPrime + bPrime + cPrime)
    };
  }

  /**
   * Is the specified point a solution to this quadratic equation?
   * @param point
   * @param [distance] - how close the point must be to the solution, defaults to 0 for exact solution
   */
  hasSolution(point, distance = 0) {
    assert && assert(distance >= 0, `invalid distance: ${distance}`);
    const closestPoint = this.getClosestPoint(point);
    return point.distance(closestPoint) <= distance;
  }

  /**
   * Gets the point on this curve that is closest to a specified point.
   */
  getClosestPoint(point) {
    // to improve readability
    const x0 = point.x;
    const y0 = point.y;
    const a = this.a;
    const b = this.b;
    const c = this.c;

    // Use a larger threshold when deciding whether the cubic equation below has one root.
    // If we don't adjust this threshold, then Utils.solveCubicRootsReal will compute roots that are NaN.
    // See https://github.com/phetsims/graphing-quadratics/issues/170
    const discriminantThreshold = 1e-9;

    // Finding the closest point requires solving the cubic equation
    // (2a^2)x^3 + (3ab)x^2 + (b^2 + 2ac - 2ay0 + 1)x + (bc - by0 - x0) = 0
    // See http://mathworld.wolfram.com/Point-QuadraticDistance.html
    const roots = Utils.solveCubicRootsReal(2 * a * a, 3 * a * b, b * b + 2 * a * c - 2 * a * y0 + 1, b * c - b * y0 - x0, discriminantThreshold);
    assert && assert(roots, 'all values are roots');
    assert && assert(roots.length > 0, `unexpected number of roots: ${roots.length}`);

    // Determine which solution is closest to point (x0,y0)
    let rootPoint;
    let closestPoint = new Vector2(roots[0], this.solveY(roots[0]));
    for (let i = 1; i < roots.length; i++) {
      rootPoint = new Vector2(roots[i], this.solveY(roots[i]));
      if (rootPoint.distance(point) < closestPoint.distance(point)) {
        closestPoint = rootPoint;
      }
    }
    return closestPoint;
  }

  /**
   * Given x, find the closest point on the curve that is in range.
   */
  getClosestPointInRange(x, xRange, yRange) {
    // constrain x and solve for y
    x = xRange.constrainValue(x);
    let y = this.solveY(x);
    if (!yRange.contains(y)) {
      // y is outside range, constrain y and solve for x
      y = yRange.constrainValue(y);
      const xValues = this.solveX(y);
      assert && assert(xValues, `${'No solution exists, the parabola is likely off the graph. ' + 'x='}${x}, quadratic=${this.toString()}`);
      if (this.isaParabola()) {
        // parabola
        assert && assert(xValues.length === 2, `unexpected number of xValues: ${xValues}`);
        assert && assert(xValues[0] < xValues[1], `unexpected order of xValues: ${xValues}`);
        assert && assert(this.vertex);
        x = x < this.vertex.x ? xValues[0] : xValues[1];
      } else {
        // straight line
        assert && assert(xValues.length === 1, `unexpected number of xValues: ${xValues}`);
        x = xValues[0];
      }
    }
    return new Vector2(x, y);
  }

  /**
   * Serializes this Quadratic instance.
   */
  toStateObject() {
    return {
      // These properties are sufficient to restore a Quadratic, see fromStateObject.
      a: this.a,
      b: this.b,
      c: this.c,
      color: Color.toColor(this.color).toStateObject(),
      // These properties are desired in the data stream, but will be undefined for non-parabolas (a===0).
      // Because PhET-iO values are based on JSON.stringify, undefined properties will not be present in the
      // data stream.
      p: this.p || null,
      h: this.h || null,
      k: this.k || null,
      vertex: this.vertex ? this.vertex.toStateObject() : null,
      focus: this.focus ? this.focus.toStateObject() : null,
      directrix: this.directrix || null,
      axisOfSymmetry: this.axisOfSymmetry || null
    };
  }
  static QuadraticIO = new IOType('QuadraticIO', {
    valueType: Quadratic,
    documentation: 'QuadraticIO is a data structure that describes a quadratic equation in the model. ' + 'Its properties are relevant to standard and vertex forms of the quadratic equation. ' + 'Non-parabolas (a=0) will have a subset of the properties that parabolas have. ' + '<p>' + 'Required properties are related to the standard form y = ax<sup>2</sup> + bx + c, and include:' + '</p>' + '<ul>' + '<li>a: {NumberIO} coefficient a</li>' + '<li>b: {NumberIO} coefficient b</li>' + '<li>c: {NumberIO} coefficient c</li>' + '<li>color: {ColorIO} the color used to draw the associated curve</li>' + '</ul>' + 'All coefficient values must respect the ranges for those coefficients.',
    stateSchema: {
      // These properties are sufficient to restore a Quadratic, see fromStateObject.
      a: NumberIO,
      b: NumberIO,
      c: NumberIO,
      color: Color.ColorIO,
      // These extra properties are for the benefit of the data stream/state, when defined
      p: NullableIO(NumberIO),
      h: NullableIO(NumberIO),
      k: NullableIO(NumberIO),
      vertex: NullableIO(ObjectLiteralIO),
      focus: NullableIO(ObjectLiteralIO),
      directrix: NullableIO(NumberIO),
      axisOfSymmetry: NullableIO(NumberIO)
    },
    toStateObject: quadratic => quadratic.toStateObject(),
    fromStateObject: stateObject => Quadratic.fromStateObject(stateObject)
  });
}

/**
 * Returns the real roots of the quadratic y = ax^2 + bx + c.
 * If there is more than one root, they will be in ascending order of x coordinate.
 * @param a
 * @param b
 * @param c
 * @returns null means that all points are roots (y = 0)
 */
function solveRoots(a, b, c) {
  let roots = null;
  let xCoordinates = Utils.solveQuadraticRootsReal(a, b, c);
  if (xCoordinates !== null) {
    roots = [];
    xCoordinates = xCoordinates.sort((x0, x1) => x0 - x1); // in ascending order
    _.uniq(xCoordinates).forEach(x => {
      roots.push(new Vector2(x, 0));
    });
  }
  assert && assert(roots === null || roots.length >= 0 && roots.length <= 2, `unexpected roots: ${roots}`);
  return roots;
}
graphingQuadratics.register('Quadratic', Quadratic);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJvcHRpb25pemUiLCJTdHJpbmdVdGlscyIsIkNvbG9yIiwiSU9UeXBlIiwiTnVsbGFibGVJTyIsIk51bWJlcklPIiwiZ3JhcGhpbmdRdWFkcmF0aWNzIiwiR1FDb2xvcnMiLCJPYmplY3RMaXRlcmFsSU8iLCJRdWFkcmF0aWMiLCJjb25zdHJ1Y3RvciIsImEiLCJiIiwiYyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJjb2xvciIsInJvb3RzIiwic29sdmVSb290cyIsInAiLCJoIiwiayIsInZlcnRleCIsImZvY3VzIiwiZGlyZWN0cml4IiwiYXhpc09mU3ltbWV0cnkiLCJ3aXRoQ29sb3IiLCJoYXNTYW1lQ29lZmZpY2llbnRzIiwicXVhZHJhdGljIiwiY3JlYXRlRnJvbVZlcnRleEZvcm0iLCJjcmVhdGVGcm9tQWx0ZXJuYXRlVmVydGV4Rm9ybSIsImFzc2VydCIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0IiwidG9TdHJpbmciLCJmaWxsSW4iLCJnZXRRdWFkcmF0aWNUZXJtIiwiUVVBRFJBVElDX1RFUk0iLCJnZXRMaW5lYXJUZXJtIiwiTElORUFSX1RFUk0iLCJnZXRDb25zdGFudFRlcm0iLCJDT05TVEFOVF9URVJNIiwiaXNhUGFyYWJvbGEiLCJzb2x2ZVgiLCJ5IiwidW5kZWZpbmVkIiwiY29tbW9uVGVybSIsIk1hdGgiLCJzcXJ0IiwieDAiLCJ4MSIsInNvcnQiLCJzb2x2ZVkiLCJ4IiwiZ2V0VGFuZ2VudFNsb3BlIiwiZ2V0Q29udHJvbFBvaW50cyIsInhSYW5nZSIsIm1pblgiLCJtaW4iLCJtYXhYIiwibWF4IiwibGVuZ3RoIiwiZ2V0TGVuZ3RoIiwiYVByaW1lIiwiYlByaW1lIiwiY1ByaW1lIiwic3RhcnRQb2ludCIsImNvbnRyb2xQb2ludCIsImVuZFBvaW50IiwiaGFzU29sdXRpb24iLCJwb2ludCIsImRpc3RhbmNlIiwiY2xvc2VzdFBvaW50IiwiZ2V0Q2xvc2VzdFBvaW50IiwieTAiLCJkaXNjcmltaW5hbnRUaHJlc2hvbGQiLCJzb2x2ZUN1YmljUm9vdHNSZWFsIiwicm9vdFBvaW50IiwiaSIsImdldENsb3Nlc3RQb2ludEluUmFuZ2UiLCJ5UmFuZ2UiLCJjb25zdHJhaW5WYWx1ZSIsImNvbnRhaW5zIiwieFZhbHVlcyIsInRvU3RhdGVPYmplY3QiLCJ0b0NvbG9yIiwiUXVhZHJhdGljSU8iLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwic3RhdGVTY2hlbWEiLCJDb2xvcklPIiwieENvb3JkaW5hdGVzIiwic29sdmVRdWFkcmF0aWNSb290c1JlYWwiLCJfIiwidW5pcSIsImZvckVhY2giLCJwdXNoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJRdWFkcmF0aWMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUXVhZHJhdGljIGlzIHRoZSBtb2RlbCBvZiBhbiBpbW11dGFibGUgcXVhZHJhdGljLCBkZXNjcmliZWQgYnkgdGhlc2UgZXF1YXRpb25zOlxyXG4gKlxyXG4gKiBzdGFuZGFyZCBmb3JtOiB5ID0gYXheMiArIGJ4ICsgY1xyXG4gKiB2ZXJ0ZXggZm9ybTogeSA9IGEoeCAtIGgpXjIgKyBrXHJcbiAqIGFsdGVybmF0ZSB2ZXJ0ZXggZm9ybTogeSA9ICgxLyg0cCkpKHggLSBoKV4yICsga1xyXG4gKlxyXG4gKiBOb3RlIHRoYXQgdGhpcyBpbXBsZW1lbnRhdGlvbiBzdXBwb3J0cyBvbmx5IHBhcmFib2xhcyB0aGF0IG9wZW4gdXAgb3IgZG93bi4gIEl0IGRvZXMgbm90IHN1cHBvcnQgcGFyYWJvbGFzIHRoYXRcclxuICogb3BlbiBsZWZ0IG9yIHJpZ2h0LCB3aGljaCB3b3VsZCBiZSBkZXNjcmliZWQgYnkgeCA9IGF5XjIgKyBieSArIGMuXHJcbiAqXHJcbiAqIFR5cGljYWxseSwgYSBxdWFkcmF0aWMgcmVxdWlyZXMgYSAhPT0gMC4gQnV0IHRoaXMgc2ltIGlzIHJlcXVpcmVkIHRvIHN1cHBvcnQgYSA9PT0gMC5cclxuICogU28gdGhlcmUgaXMgc29tZSBub24tc3RhbmRhcmQgYmVoYXZpb3IgaGVyZWluIHRoYXQgaXMgbm90IGV4YWN0bHkgbWF0aGVtYXRpY2FsbHkgY29ycmVjdC5cclxuICogU3BlY2lmaWNhbGx5LCB3aGVuIGEgPT09IDAsIFF1YWRyYXRpYyBiZWhhdmVzIGxpa2UgYSBzdHJhaWdodCBsaW5lLiAgU2VlIGZvciBleGFtcGxlIHNvbHZlWC5cclxuICpcclxuICogQGF1dGhvciBBbmRyZWEgTGluXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiwgeyBWZWN0b3IyU3RhdGVPYmplY3QgfSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgQ29sb3JTdGF0ZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBOdWxsYWJsZUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdWxsYWJsZUlPLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBncmFwaGluZ1F1YWRyYXRpY3MgZnJvbSAnLi4vLi4vZ3JhcGhpbmdRdWFkcmF0aWNzLmpzJztcclxuaW1wb3J0IEdRQ29sb3JzIGZyb20gJy4uL0dRQ29sb3JzLmpzJztcclxuaW1wb3J0IE9iamVjdExpdGVyYWxJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvT2JqZWN0TGl0ZXJhbElPLmpzJztcclxuXHJcblxyXG50eXBlIFF1YWRyYXRpY1N0YXRlT2JqZWN0ID0ge1xyXG5cclxuICAvLyBUaGVzZSBwcm9wZXJ0aWVzIGFyZSBzdWZmaWNpZW50IHRvIHJlc3RvcmUgYSBRdWFkcmF0aWMsIHNlZSBmcm9tU3RhdGVPYmplY3QuXHJcbiAgYTogbnVtYmVyO1xyXG4gIGI6IG51bWJlcjtcclxuICBjOiBudW1iZXI7XHJcbiAgY29sb3I6IENvbG9yU3RhdGU7XHJcblxyXG4gIC8vIFRoZXNlIHByb3BlcnRpZXMgYXJlIGRlc2lyZWQgaW4gdGhlIGRhdGEgc3RyZWFtLCBidXQgd2lsbCBiZSB1bmRlZmluZWQgZm9yIG5vbi1wYXJhYm9sYXMgKGE9PT0wKS5cclxuICAvLyBBbnl0aGluZyB0aGF0IGlzIHVuZGVmaW5lZCB3aWxsIGJlIHNlcmlhbGl6ZWQgYXMgbnVsbCwgYmVjYXVzZSB0aGUgSlNPTiBkYXRhIHN0cmVhbSBjYW5ub3QgaW5jbHVkZSB1bmRlZmluZWQuXHJcbiAgcDogbnVtYmVyIHwgbnVsbDtcclxuICBoOiBudW1iZXIgfCBudWxsO1xyXG4gIGs6IG51bWJlciB8IG51bGw7XHJcbiAgdmVydGV4OiBWZWN0b3IyU3RhdGVPYmplY3QgfCBudWxsO1xyXG4gIGZvY3VzOiBWZWN0b3IyU3RhdGVPYmplY3QgfCBudWxsO1xyXG4gIGRpcmVjdHJpeDogbnVtYmVyIHwgbnVsbDtcclxuICBheGlzT2ZTeW1tZXRyeTogbnVtYmVyIHwgbnVsbDtcclxufTtcclxuXHJcbi8vIFRoZSBwb2ludHMgZm9yIHRoZSBCZXppZXIgY3VydmUgdGhhdCBkZXNjcmliZXMgdGhpcyBxdWFkcmF0aWMuXHJcbnR5cGUgUXVhZHJhdGljQ29udHJvbFBvaW50cyA9IHtcclxuICBzdGFydFBvaW50OiBWZWN0b3IyO1xyXG4gIGNvbnRyb2xQb2ludDogVmVjdG9yMjtcclxuICBlbmRQb2ludDogVmVjdG9yMjtcclxufTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIFRoZSBjb2xvciB1c2VkIHRvIHJlbmRlciB0aGUgY3VydmUuXHJcbiAgLy8gVGhpcyBpcyBpbiB0aGUgbW9kZWwgdG8gc3VwcG9ydCBjb2xvci1jb2Rpbmcgb2YgdGhlIHBvaW50IHRvb2wuXHJcbiAgY29sb3I/OiBDb2xvciB8IHN0cmluZztcclxufTtcclxuXHJcbnR5cGUgUXVhZHJhdGljT3B0aW9ucyA9IFNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUXVhZHJhdGljIHtcclxuXHJcbiAgLy8gQ29lZmZpY2llbnRzIGZvciBzdGFuZGFyZCBmb3JtXHJcbiAgcHVibGljIHJlYWRvbmx5IGE6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgYjogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBjOiBudW1iZXI7XHJcblxyXG4gIC8vIFRoZSBjb2xvciB1c2VkIHRvIHJlbmRlciB0aGUgY3VydmUuXHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbG9yOiBDb2xvciB8IHN0cmluZztcclxuXHJcbiAgLy8gUm9vdHMgYXJlIG9yZGVyZWQgZnJvbSBsZWZ0IHRvIHJpZ2h0IGFsb25nIHRoZSB4LWF4aXMuIG51bGwgbWVhbnMgdGhhdCBhbGwgcG9pbnRzIGFyZSByb290cyAoeSA9IDApXHJcbiAgcHVibGljIHJlYWRvbmx5IHJvb3RzOiBWZWN0b3IyW10gfCBudWxsO1xyXG5cclxuICAvLyBGaWVsZHMgZm9yIHZlcnRleCBmb3JtLiBTdHJpY3RseSBzcGVha2luZywgd2UgZG9uJ3QgaGF2ZSBhIHF1YWRyYXRpYyAob3IgYSBwYXJhYm9sYSkgaWYgYSA9PT0gMC5cclxuICAvLyBJZiB0aGF0J3MgdGhlIGNhc2UsIHRoZW4gdGhlc2UgZmllbGRzIHdpbGwgYmUgdW5kZWZpbmVkLlxyXG4gIHB1YmxpYyByZWFkb25seSBwPzogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBoPzogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBrPzogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB2ZXJ0ZXg/OiBWZWN0b3IyO1xyXG4gIHB1YmxpYyByZWFkb25seSBmb2N1cz86IFZlY3RvcjI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGRpcmVjdHJpeD86IG51bWJlcjsgLy8geSA9IGRpcmVjdHJpeFxyXG4gIHB1YmxpYyByZWFkb25seSBheGlzT2ZTeW1tZXRyeT86IG51bWJlcjsgLy8geCA9IGhcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IgcGFyYW1ldGVycyBhcmUgY29lZmZpY2llbnRzIG9mIHRoZSBzdGFuZGFyZCBmb3JtIGVxdWF0aW9uOiB5ID0gYXheMiArIGJ4ICsgY1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlciwgcHJvdmlkZWRPcHRpb25zPzogUXVhZHJhdGljT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFF1YWRyYXRpY09wdGlvbnMsIFNlbGZPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBjb2xvcjogJ2JsYWNrJ1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5hID0gYTtcclxuICAgIHRoaXMuYiA9IGI7XHJcbiAgICB0aGlzLmMgPSBjO1xyXG4gICAgdGhpcy5jb2xvciA9IG9wdGlvbnMuY29sb3I7XHJcbiAgICB0aGlzLnJvb3RzID0gc29sdmVSb290cyggYSwgYiwgYyApO1xyXG5cclxuICAgIC8vIFN0cmljdGx5IHNwZWFraW5nLCB3ZSBkb24ndCBoYXZlIGEgcXVhZHJhdGljIChvciBhIHBhcmFib2xhKSBpZiBhID09PSAwLlxyXG4gICAgLy8gSWYgdGhhdCdzIHRoZSBjYXNlLCB0aGVuIHRoZSBmaWVsZHMgaW4gdGhpcyBpZiBibG9jayB3aWxsIGJlIHVuZGVmaW5lZC5cclxuICAgIGlmICggYSAhPT0gMCApIHtcclxuXHJcbiAgICAgIHRoaXMucCA9IDEgLyAoIDQgKiBhICk7XHJcbiAgICAgIHRoaXMuaCA9IC1iIC8gKCAyICogYSApO1xyXG4gICAgICB0aGlzLmsgPSBjIC0gKCAoIGIgKiBiICkgLyAoIDQgKiBhICkgKTtcclxuXHJcbiAgICAgIHRoaXMudmVydGV4ID0gbmV3IFZlY3RvcjIoIHRoaXMuaCwgdGhpcy5rICk7XHJcbiAgICAgIHRoaXMuZm9jdXMgPSBuZXcgVmVjdG9yMiggdGhpcy5oLCB0aGlzLmsgKyB0aGlzLnAgKTtcclxuICAgICAgdGhpcy5kaXJlY3RyaXggPSB0aGlzLmsgLSB0aGlzLnA7IC8vIHkgPSBkaXJlY3RyaXhcclxuICAgICAgdGhpcy5heGlzT2ZTeW1tZXRyeSA9IHRoaXMuaDsgLy8geCA9IGhcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBjb3B5IG9mIHRoaXMgUXVhZHJhdGljIHdpdGggYSBzcGVjaWZpZWQgY29sb3IuXHJcbiAgICovXHJcbiAgcHVibGljIHdpdGhDb2xvciggY29sb3I6IENvbG9yIHwgc3RyaW5nICk6IFF1YWRyYXRpYyB7XHJcbiAgICByZXR1cm4gbmV3IFF1YWRyYXRpYyggdGhpcy5hLCB0aGlzLmIsIHRoaXMuYywgeyBjb2xvcjogY29sb3IgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoaXMgcXVhZHJhdGljIGFuZCBzb21lIG90aGVyIHF1YWRyYXRpYyBoYXZlIHRoZSBzYW1lIHN0YW5kYXJkLWZvcm0gY29lZmZpY2llbnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNTYW1lQ29lZmZpY2llbnRzKCBxdWFkcmF0aWM6IFF1YWRyYXRpYyApOiBib29sZWFuIHtcclxuICAgIHJldHVybiAoIHF1YWRyYXRpYy5hID09PSB0aGlzLmEgKSAmJiAoIHF1YWRyYXRpYy5iID09PSB0aGlzLmIgKSAmJiAoIHF1YWRyYXRpYy5jID09PSB0aGlzLmMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBRdWFkcmF0aWMgdXNpbmcgY29lZmZpY2llbnRzIG9mIHRoZSB2ZXJ0ZXggZm9ybSBlcXVhdGlvbjogeSA9IGEoeCAtIGgpXjIgKyBrXHJcbiAgICogVGhpcyBtZXRob2QgaXMgdXNlZCBpbiB0aGUgVmVydGV4IEZvcm0gc2NyZWVuLCB3aGVyZSB0aGUgdXNlciBjb250cm9scyBhLCBoLCBhbmQgay5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUZyb21WZXJ0ZXhGb3JtKCBhOiBudW1iZXIsIGg6IG51bWJlciwgazogbnVtYmVyLCBvcHRpb25zPzogUXVhZHJhdGljT3B0aW9ucyApOiBRdWFkcmF0aWMge1xyXG4gICAgY29uc3QgYiA9IC0yICogYSAqIGg7XHJcbiAgICBjb25zdCBjID0gKCBhICogaCAqIGggKSArIGs7XHJcbiAgICByZXR1cm4gbmV3IFF1YWRyYXRpYyggYSwgYiwgYywgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIFF1YWRyYXRpYyB1c2luZyBjb2VmZmljaWVudHMgb2YgdGhlIGFsdGVybmF0ZSB2ZXJ0ZXggZm9ybSBlcXVhdGlvbjogeSA9ICgxLyg0cCkpKHggLSBoKV4yICsga1xyXG4gICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgaW4gdGhlIEZvY3VzICYgRGlyZWN0cml4IHNjcmVlbiwgd2hlcmUgdGhlIHVzZXIgY29udHJvbHMgcCwgaCwgYW5kIGsuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVGcm9tQWx0ZXJuYXRlVmVydGV4Rm9ybSggcDogbnVtYmVyLCBoOiBudW1iZXIsIGs6IG51bWJlciwgb3B0aW9ucz86IFF1YWRyYXRpY09wdGlvbnMgKTogUXVhZHJhdGljIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHAgIT09IDAsICdwIGNhbm5vdCBiZSB6ZXJvJyApO1xyXG4gICAgY29uc3QgYSA9IDEgLyAoIDQgKiBwICk7XHJcbiAgICByZXR1cm4gUXVhZHJhdGljLmNyZWF0ZUZyb21WZXJ0ZXhGb3JtKCBhLCBoLCBrLCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXNlcmlhbGl6ZXMgYSBRdWFkcmF0aWMgaW5zdGFuY2UuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBmcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0OiBRdWFkcmF0aWNTdGF0ZU9iamVjdCApOiBRdWFkcmF0aWMge1xyXG4gICAgcmV0dXJuIG5ldyBRdWFkcmF0aWMoIHN0YXRlT2JqZWN0LmEsIHN0YXRlT2JqZWN0LmIsIHN0YXRlT2JqZWN0LmMsIHtcclxuICAgICAgY29sb3I6IENvbG9yLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QuY29sb3IgKVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIFF1YWRyYXRpYy4gRm9yIGRlYnVnZ2luZyBvbmx5LCBkbyBub3QgcmVseSBvbiBmb3JtYXQhXHJcbiAgICovXHJcbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCAnUXVhZHJhdGljIHt7YX19eF4yICsge3tifX14ICsge3tjfX0sIGNvbG9yPXt7Y29sb3J9fScsIHtcclxuICAgICAgYTogdGhpcy5hLFxyXG4gICAgICBiOiB0aGlzLmIsXHJcbiAgICAgIGM6IHRoaXMuYyxcclxuICAgICAgY29sb3I6IHRoaXMuY29sb3JcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHF1YWRyYXRpYyB0ZXJtLCB5ID0gYXheMlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRRdWFkcmF0aWNUZXJtKCk6IFF1YWRyYXRpYyB7XHJcbiAgICByZXR1cm4gbmV3IFF1YWRyYXRpYyggdGhpcy5hLCAwLCAwLCB7IGNvbG9yOiBHUUNvbG9ycy5RVUFEUkFUSUNfVEVSTSB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBsaW5lYXIgdGVybSwgeSA9IGJ4XHJcbiAgICovXHJcbiAgcHVibGljIGdldExpbmVhclRlcm0oKTogUXVhZHJhdGljIHtcclxuICAgIHJldHVybiBuZXcgUXVhZHJhdGljKCAwLCB0aGlzLmIsIDAsIHsgY29sb3I6IEdRQ29sb3JzLkxJTkVBUl9URVJNIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGNvbnN0YW50IHRlcm0sIHkgPSBjXHJcbiAgICovXHJcbiAgcHVibGljIGdldENvbnN0YW50VGVybSgpOiBRdWFkcmF0aWMge1xyXG4gICAgcmV0dXJuIG5ldyBRdWFkcmF0aWMoIDAsIDAsIHRoaXMuYywgeyBjb2xvcjogR1FDb2xvcnMuQ09OU1RBTlRfVEVSTSB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEb2VzIHRoaXMgcXVhZHJhdGljIGRlc2NyaWJlIGEgcGFyYWJvbGE/XHJcbiAgICogVHlwaWNhbGx5LCBhIHF1YWRyYXRpYyByZXF1aXJlcyBhICE9PSAwLiBCdXQgdGhpcyBzaW0gaXMgcmVxdWlyZWQgdG8gc3VwcG9ydCBhID09PSAwLCBzbyB0aGlzXHJcbiAgICogbWV0aG9kIGlzIHVzZWQgaW4gcGxhY2VzIHdoZXJlIHdlIG5lZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgd2UncmUgZGVhbGluZyB3aXRoIGEgcGFyYWJvbGEuXHJcbiAgICovXHJcbiAgcHVibGljIGlzYVBhcmFib2xhKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICggdGhpcy5hICE9PSAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiB5LCBzb2x2ZSBmb3IgeC5cclxuICAgKiBJZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIHNvbHV0aW9uLCB0aGV5IHdpbGwgYmUgaW4gYXNjZW5kaW5nIG9yZGVyLlxyXG4gICAqIEBwYXJhbSB5XHJcbiAgICogQHJldHVybnMgb25lIG9yIG1vcmUgc29sdXRpb25zLCBudWxsIGlmIHRoZXJlIGlzIG5vIHNvbHV0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHNvbHZlWCggeTogbnVtYmVyICk6IG51bWJlcltdIHwgbnVsbCB7XHJcbiAgICBpZiAoIHRoaXMuaXNhUGFyYWJvbGEoKSApIHtcclxuICAgICAgY29uc3QgdmVydGV4ID0gdGhpcy52ZXJ0ZXghO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZXJ0ZXggIT09IHVuZGVmaW5lZCApO1xyXG5cclxuICAgICAgaWYgKCAoIHRoaXMuYSA+IDAgJiYgeSA8IHZlcnRleC55ICkgfHwgKCB0aGlzLmEgPCAwICYmIHkgPiB2ZXJ0ZXgueSApICkge1xyXG5cclxuICAgICAgICAvLyB0aGVyZSBpcyBubyBzb2x1dGlvbiwgeSBpcyBub3Qgb24gdGhlIHBhcmFib2xhXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29uc3QgayA9IHRoaXMuayE7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggayAhPT0gdW5kZWZpbmVkICk7XHJcbiAgICAgICAgY29uc3QgaCA9IHRoaXMuaCE7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaCAhPT0gdW5kZWZpbmVkICk7XHJcblxyXG4gICAgICAgIC8vIEZvciBhIHBhcmFib2xhLCB1c2UgdmVydGV4IGZvcm0uXHJcbiAgICAgICAgLy8geSA9IGEoeCAtIGgpXjIgKyBrID0+IHggPSBoICstIE1hdGguc3FydCgoeSAtIGspL2EpXHJcbiAgICAgICAgLy8gVGhpcyB5aWVsZHMgMiBzb2x1dGlvbnNcclxuICAgICAgICBjb25zdCBjb21tb25UZXJtID0gTWF0aC5zcXJ0KCAoIHkgLSBrICkgLyB0aGlzLmEgKTtcclxuICAgICAgICBjb25zdCB4MCA9IGggLSBjb21tb25UZXJtO1xyXG4gICAgICAgIGNvbnN0IHgxID0gaCArIGNvbW1vblRlcm07XHJcbiAgICAgICAgcmV0dXJuIFsgeDAsIHgxIF0uc29ydCggKCB4MCwgeDEgKSA9PiB4MCAtIHgxICk7IC8vIGluIGFzY2VuZGluZyBvcmRlclxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIEZvciBhIHN0cmFpZ2h0IGxpbmUsIHVzZSBzbG9wZS1pbnRlcmNlcHQgZm9ybS5cclxuICAgICAgLy8geSA9IGJ4ICsgYyA9PiB4ID0gKHkgLSBjKS9iXHJcbiAgICAgIC8vIFRoaXMgeWllbGRzIG9uZSBzb2x1dGlvbi5cclxuICAgICAgY29uc3QgeDAgPSAoIHkgLSB0aGlzLmMgKSAvIHRoaXMuYjtcclxuICAgICAgcmV0dXJuIFsgeDAgXTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIHgsIHNvbHZlIGZvciB5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzb2x2ZVkoIHg6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuICggdGhpcy5hICogeCAqIHggKSArICggdGhpcy5iICogeCApICsgdGhpcy5jOyAvLyB5ID0gYXheMiArIGJ4ICsgY1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgc2xvcGUgb2YgdGhlIHRhbmdlbnQgbGluZSBhdCBwb2ludCAoeCxmKHgpKSBvbiB0aGUgcXVhZHJhdGljLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRUYW5nZW50U2xvcGUoIHg6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc2FQYXJhYm9sYSgpLCAnbm90IHN1cHBvcnRlZCBmb3Igbm9uLXBhcmFib2xhJyApO1xyXG4gICAgcmV0dXJuICggMiAqIHRoaXMuYSAqIHggKSArIHRoaXMuYjsgLy8gZmlyc3QgZGVyaXZhdGl2ZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgY29udHJvbCBwb2ludHMgdGhhdCBkZXNjcmliZSB0aGlzIHF1YWRyYXRpYy5cclxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXBoaW5nLXF1YWRyYXRpY3MvaXNzdWVzLzFcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q29udHJvbFBvaW50cyggeFJhbmdlOiBSYW5nZSApOiBRdWFkcmF0aWNDb250cm9sUG9pbnRzIHtcclxuXHJcbiAgICAvLyB0byBpbXByb3ZlIHJlYWRhYmlsaXR5XHJcbiAgICBjb25zdCBtaW5YID0geFJhbmdlLm1pbjtcclxuICAgIGNvbnN0IG1heFggPSB4UmFuZ2UubWF4O1xyXG4gICAgY29uc3QgbGVuZ3RoID0geFJhbmdlLmdldExlbmd0aCgpO1xyXG5cclxuICAgIGNvbnN0IGFQcmltZSA9IHRoaXMuYSAqIGxlbmd0aCAqIGxlbmd0aDtcclxuICAgIGNvbnN0IGJQcmltZSA9ICggMiAqIHRoaXMuYSAqIG1pblggKiBsZW5ndGggKSArICggdGhpcy5iICogbGVuZ3RoICk7XHJcbiAgICBjb25zdCBjUHJpbWUgPSAoIHRoaXMuYSAqIG1pblggKiBtaW5YICkgKyAoIHRoaXMuYiAqIG1pblggKSArIHRoaXMuYztcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGFydFBvaW50OiBuZXcgVmVjdG9yMiggbWluWCwgY1ByaW1lICksXHJcbiAgICAgIGNvbnRyb2xQb2ludDogbmV3IFZlY3RvcjIoICggbWluWCArIG1heFggKSAvIDIsIGJQcmltZSAvIDIgKyBjUHJpbWUgKSxcclxuICAgICAgZW5kUG9pbnQ6IG5ldyBWZWN0b3IyKCBtYXhYLCBhUHJpbWUgKyBiUHJpbWUgKyBjUHJpbWUgKVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElzIHRoZSBzcGVjaWZpZWQgcG9pbnQgYSBzb2x1dGlvbiB0byB0aGlzIHF1YWRyYXRpYyBlcXVhdGlvbj9cclxuICAgKiBAcGFyYW0gcG9pbnRcclxuICAgKiBAcGFyYW0gW2Rpc3RhbmNlXSAtIGhvdyBjbG9zZSB0aGUgcG9pbnQgbXVzdCBiZSB0byB0aGUgc29sdXRpb24sIGRlZmF1bHRzIHRvIDAgZm9yIGV4YWN0IHNvbHV0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGhhc1NvbHV0aW9uKCBwb2ludDogVmVjdG9yMiwgZGlzdGFuY2UgPSAwICk6IGJvb2xlYW4ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGlzdGFuY2UgPj0gMCwgYGludmFsaWQgZGlzdGFuY2U6ICR7ZGlzdGFuY2V9YCApO1xyXG4gICAgY29uc3QgY2xvc2VzdFBvaW50ID0gdGhpcy5nZXRDbG9zZXN0UG9pbnQoIHBvaW50ICk7XHJcbiAgICByZXR1cm4gcG9pbnQuZGlzdGFuY2UoIGNsb3Nlc3RQb2ludCApIDw9IGRpc3RhbmNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgcG9pbnQgb24gdGhpcyBjdXJ2ZSB0aGF0IGlzIGNsb3Nlc3QgdG8gYSBzcGVjaWZpZWQgcG9pbnQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldENsb3Nlc3RQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcblxyXG4gICAgLy8gdG8gaW1wcm92ZSByZWFkYWJpbGl0eVxyXG4gICAgY29uc3QgeDAgPSBwb2ludC54O1xyXG4gICAgY29uc3QgeTAgPSBwb2ludC55O1xyXG4gICAgY29uc3QgYSA9IHRoaXMuYTtcclxuICAgIGNvbnN0IGIgPSB0aGlzLmI7XHJcbiAgICBjb25zdCBjID0gdGhpcy5jO1xyXG5cclxuICAgIC8vIFVzZSBhIGxhcmdlciB0aHJlc2hvbGQgd2hlbiBkZWNpZGluZyB3aGV0aGVyIHRoZSBjdWJpYyBlcXVhdGlvbiBiZWxvdyBoYXMgb25lIHJvb3QuXHJcbiAgICAvLyBJZiB3ZSBkb24ndCBhZGp1c3QgdGhpcyB0aHJlc2hvbGQsIHRoZW4gVXRpbHMuc29sdmVDdWJpY1Jvb3RzUmVhbCB3aWxsIGNvbXB1dGUgcm9vdHMgdGhhdCBhcmUgTmFOLlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ncmFwaGluZy1xdWFkcmF0aWNzL2lzc3Vlcy8xNzBcclxuICAgIGNvbnN0IGRpc2NyaW1pbmFudFRocmVzaG9sZCA9IDFlLTk7XHJcblxyXG4gICAgLy8gRmluZGluZyB0aGUgY2xvc2VzdCBwb2ludCByZXF1aXJlcyBzb2x2aW5nIHRoZSBjdWJpYyBlcXVhdGlvblxyXG4gICAgLy8gKDJhXjIpeF4zICsgKDNhYil4XjIgKyAoYl4yICsgMmFjIC0gMmF5MCArIDEpeCArIChiYyAtIGJ5MCAtIHgwKSA9IDBcclxuICAgIC8vIFNlZSBodHRwOi8vbWF0aHdvcmxkLndvbGZyYW0uY29tL1BvaW50LVF1YWRyYXRpY0Rpc3RhbmNlLmh0bWxcclxuICAgIGNvbnN0IHJvb3RzID0gVXRpbHMuc29sdmVDdWJpY1Jvb3RzUmVhbChcclxuICAgICAgMiAqIGEgKiBhLFxyXG4gICAgICAzICogYSAqIGIsXHJcbiAgICAgIGIgKiBiICsgMiAqIGEgKiBjIC0gMiAqIGEgKiB5MCArIDEsXHJcbiAgICAgIGIgKiBjIC0gYiAqIHkwIC0geDAsXHJcbiAgICAgIGRpc2NyaW1pbmFudFRocmVzaG9sZFxyXG4gICAgKSE7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByb290cywgJ2FsbCB2YWx1ZXMgYXJlIHJvb3RzJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcm9vdHMubGVuZ3RoID4gMCwgYHVuZXhwZWN0ZWQgbnVtYmVyIG9mIHJvb3RzOiAke3Jvb3RzLmxlbmd0aH1gICk7XHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNvbHV0aW9uIGlzIGNsb3Nlc3QgdG8gcG9pbnQgKHgwLHkwKVxyXG4gICAgbGV0IHJvb3RQb2ludDtcclxuICAgIGxldCBjbG9zZXN0UG9pbnQgPSBuZXcgVmVjdG9yMiggcm9vdHNbIDAgXSwgdGhpcy5zb2x2ZVkoIHJvb3RzWyAwIF0gKSApO1xyXG4gICAgZm9yICggbGV0IGkgPSAxOyBpIDwgcm9vdHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHJvb3RQb2ludCA9IG5ldyBWZWN0b3IyKCByb290c1sgaSBdLCB0aGlzLnNvbHZlWSggcm9vdHNbIGkgXSApICk7XHJcbiAgICAgIGlmICggcm9vdFBvaW50LmRpc3RhbmNlKCBwb2ludCApIDwgY2xvc2VzdFBvaW50LmRpc3RhbmNlKCBwb2ludCApICkge1xyXG4gICAgICAgIGNsb3Nlc3RQb2ludCA9IHJvb3RQb2ludDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjbG9zZXN0UG9pbnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiB4LCBmaW5kIHRoZSBjbG9zZXN0IHBvaW50IG9uIHRoZSBjdXJ2ZSB0aGF0IGlzIGluIHJhbmdlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDbG9zZXN0UG9pbnRJblJhbmdlKCB4OiBudW1iZXIsIHhSYW5nZTogUmFuZ2UsIHlSYW5nZTogUmFuZ2UgKTogVmVjdG9yMiB7XHJcblxyXG4gICAgLy8gY29uc3RyYWluIHggYW5kIHNvbHZlIGZvciB5XHJcbiAgICB4ID0geFJhbmdlLmNvbnN0cmFpblZhbHVlKCB4ICk7XHJcbiAgICBsZXQgeSA9IHRoaXMuc29sdmVZKCB4ICk7XHJcblxyXG4gICAgaWYgKCAheVJhbmdlLmNvbnRhaW5zKCB5ICkgKSB7XHJcblxyXG4gICAgICAvLyB5IGlzIG91dHNpZGUgcmFuZ2UsIGNvbnN0cmFpbiB5IGFuZCBzb2x2ZSBmb3IgeFxyXG4gICAgICB5ID0geVJhbmdlLmNvbnN0cmFpblZhbHVlKCB5ICk7XHJcbiAgICAgIGNvbnN0IHhWYWx1ZXMgPSB0aGlzLnNvbHZlWCggeSApITtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeFZhbHVlcywgYCR7J05vIHNvbHV0aW9uIGV4aXN0cywgdGhlIHBhcmFib2xhIGlzIGxpa2VseSBvZmYgdGhlIGdyYXBoLiAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3g9J30ke3h9LCBxdWFkcmF0aWM9JHt0aGlzLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLmlzYVBhcmFib2xhKCkgKSB7XHJcblxyXG4gICAgICAgIC8vIHBhcmFib2xhXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeFZhbHVlcy5sZW5ndGggPT09IDIsIGB1bmV4cGVjdGVkIG51bWJlciBvZiB4VmFsdWVzOiAke3hWYWx1ZXN9YCApO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHhWYWx1ZXNbIDAgXSA8IHhWYWx1ZXNbIDEgXSwgYHVuZXhwZWN0ZWQgb3JkZXIgb2YgeFZhbHVlczogJHt4VmFsdWVzfWAgKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnZlcnRleCApO1xyXG4gICAgICAgIHggPSAoIHggPCB0aGlzLnZlcnRleCEueCApID8geFZhbHVlc1sgMCBdIDogeFZhbHVlc1sgMSBdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBzdHJhaWdodCBsaW5lXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeFZhbHVlcy5sZW5ndGggPT09IDEsIGB1bmV4cGVjdGVkIG51bWJlciBvZiB4VmFsdWVzOiAke3hWYWx1ZXN9YCApO1xyXG4gICAgICAgIHggPSB4VmFsdWVzWyAwIF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHgsIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlcmlhbGl6ZXMgdGhpcyBRdWFkcmF0aWMgaW5zdGFuY2UuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0b1N0YXRlT2JqZWN0KCk6IFF1YWRyYXRpY1N0YXRlT2JqZWN0IHtcclxuICAgIHJldHVybiB7XHJcblxyXG4gICAgICAvLyBUaGVzZSBwcm9wZXJ0aWVzIGFyZSBzdWZmaWNpZW50IHRvIHJlc3RvcmUgYSBRdWFkcmF0aWMsIHNlZSBmcm9tU3RhdGVPYmplY3QuXHJcbiAgICAgIGE6IHRoaXMuYSxcclxuICAgICAgYjogdGhpcy5iLFxyXG4gICAgICBjOiB0aGlzLmMsXHJcbiAgICAgIGNvbG9yOiBDb2xvci50b0NvbG9yKCB0aGlzLmNvbG9yICkudG9TdGF0ZU9iamVjdCgpLFxyXG5cclxuICAgICAgLy8gVGhlc2UgcHJvcGVydGllcyBhcmUgZGVzaXJlZCBpbiB0aGUgZGF0YSBzdHJlYW0sIGJ1dCB3aWxsIGJlIHVuZGVmaW5lZCBmb3Igbm9uLXBhcmFib2xhcyAoYT09PTApLlxyXG4gICAgICAvLyBCZWNhdXNlIFBoRVQtaU8gdmFsdWVzIGFyZSBiYXNlZCBvbiBKU09OLnN0cmluZ2lmeSwgdW5kZWZpbmVkIHByb3BlcnRpZXMgd2lsbCBub3QgYmUgcHJlc2VudCBpbiB0aGVcclxuICAgICAgLy8gZGF0YSBzdHJlYW0uXHJcbiAgICAgIHA6IHRoaXMucCB8fCBudWxsLFxyXG4gICAgICBoOiB0aGlzLmggfHwgbnVsbCxcclxuICAgICAgazogdGhpcy5rIHx8IG51bGwsXHJcbiAgICAgIHZlcnRleDogKCB0aGlzLnZlcnRleCA/IHRoaXMudmVydGV4LnRvU3RhdGVPYmplY3QoKSA6IG51bGwgKSxcclxuICAgICAgZm9jdXM6ICggdGhpcy5mb2N1cyA/IHRoaXMuZm9jdXMudG9TdGF0ZU9iamVjdCgpIDogbnVsbCApLFxyXG4gICAgICBkaXJlY3RyaXg6IHRoaXMuZGlyZWN0cml4IHx8IG51bGwsXHJcbiAgICAgIGF4aXNPZlN5bW1ldHJ5OiB0aGlzLmF4aXNPZlN5bW1ldHJ5IHx8IG51bGxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFF1YWRyYXRpY0lPID0gbmV3IElPVHlwZSggJ1F1YWRyYXRpY0lPJywge1xyXG4gICAgdmFsdWVUeXBlOiBRdWFkcmF0aWMsXHJcbiAgICBkb2N1bWVudGF0aW9uOlxyXG4gICAgICAnUXVhZHJhdGljSU8gaXMgYSBkYXRhIHN0cnVjdHVyZSB0aGF0IGRlc2NyaWJlcyBhIHF1YWRyYXRpYyBlcXVhdGlvbiBpbiB0aGUgbW9kZWwuICcgK1xyXG4gICAgICAnSXRzIHByb3BlcnRpZXMgYXJlIHJlbGV2YW50IHRvIHN0YW5kYXJkIGFuZCB2ZXJ0ZXggZm9ybXMgb2YgdGhlIHF1YWRyYXRpYyBlcXVhdGlvbi4gJyArXHJcbiAgICAgICdOb24tcGFyYWJvbGFzIChhPTApIHdpbGwgaGF2ZSBhIHN1YnNldCBvZiB0aGUgcHJvcGVydGllcyB0aGF0IHBhcmFib2xhcyBoYXZlLiAnICtcclxuICAgICAgJzxwPicgK1xyXG4gICAgICAnUmVxdWlyZWQgcHJvcGVydGllcyBhcmUgcmVsYXRlZCB0byB0aGUgc3RhbmRhcmQgZm9ybSB5ID0gYXg8c3VwPjI8L3N1cD4gKyBieCArIGMsIGFuZCBpbmNsdWRlOicgK1xyXG4gICAgICAnPC9wPicgK1xyXG4gICAgICAnPHVsPicgK1xyXG4gICAgICAnPGxpPmE6IHtOdW1iZXJJT30gY29lZmZpY2llbnQgYTwvbGk+JyArXHJcbiAgICAgICc8bGk+Yjoge051bWJlcklPfSBjb2VmZmljaWVudCBiPC9saT4nICtcclxuICAgICAgJzxsaT5jOiB7TnVtYmVySU99IGNvZWZmaWNpZW50IGM8L2xpPicgK1xyXG4gICAgICAnPGxpPmNvbG9yOiB7Q29sb3JJT30gdGhlIGNvbG9yIHVzZWQgdG8gZHJhdyB0aGUgYXNzb2NpYXRlZCBjdXJ2ZTwvbGk+JyArXHJcbiAgICAgICc8L3VsPicgK1xyXG4gICAgICAnQWxsIGNvZWZmaWNpZW50IHZhbHVlcyBtdXN0IHJlc3BlY3QgdGhlIHJhbmdlcyBmb3IgdGhvc2UgY29lZmZpY2llbnRzLicsXHJcbiAgICBzdGF0ZVNjaGVtYToge1xyXG5cclxuICAgICAgLy8gVGhlc2UgcHJvcGVydGllcyBhcmUgc3VmZmljaWVudCB0byByZXN0b3JlIGEgUXVhZHJhdGljLCBzZWUgZnJvbVN0YXRlT2JqZWN0LlxyXG4gICAgICBhOiBOdW1iZXJJTyxcclxuICAgICAgYjogTnVtYmVySU8sXHJcbiAgICAgIGM6IE51bWJlcklPLFxyXG4gICAgICBjb2xvcjogQ29sb3IuQ29sb3JJTyxcclxuXHJcbiAgICAgIC8vIFRoZXNlIGV4dHJhIHByb3BlcnRpZXMgYXJlIGZvciB0aGUgYmVuZWZpdCBvZiB0aGUgZGF0YSBzdHJlYW0vc3RhdGUsIHdoZW4gZGVmaW5lZFxyXG4gICAgICBwOiBOdWxsYWJsZUlPKCBOdW1iZXJJTyApLFxyXG4gICAgICBoOiBOdWxsYWJsZUlPKCBOdW1iZXJJTyApLFxyXG4gICAgICBrOiBOdWxsYWJsZUlPKCBOdW1iZXJJTyApLFxyXG4gICAgICB2ZXJ0ZXg6IE51bGxhYmxlSU8oIE9iamVjdExpdGVyYWxJTyApLFxyXG4gICAgICBmb2N1czogTnVsbGFibGVJTyggT2JqZWN0TGl0ZXJhbElPICksXHJcbiAgICAgIGRpcmVjdHJpeDogTnVsbGFibGVJTyggTnVtYmVySU8gKSxcclxuICAgICAgYXhpc09mU3ltbWV0cnk6IE51bGxhYmxlSU8oIE51bWJlcklPIClcclxuICAgIH0sXHJcbiAgICB0b1N0YXRlT2JqZWN0OiBxdWFkcmF0aWMgPT4gcXVhZHJhdGljLnRvU3RhdGVPYmplY3QoKSxcclxuICAgIGZyb21TdGF0ZU9iamVjdDogc3RhdGVPYmplY3QgPT4gUXVhZHJhdGljLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QgKVxyXG4gIH0gKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIHJlYWwgcm9vdHMgb2YgdGhlIHF1YWRyYXRpYyB5ID0gYXheMiArIGJ4ICsgYy5cclxuICogSWYgdGhlcmUgaXMgbW9yZSB0aGFuIG9uZSByb290LCB0aGV5IHdpbGwgYmUgaW4gYXNjZW5kaW5nIG9yZGVyIG9mIHggY29vcmRpbmF0ZS5cclxuICogQHBhcmFtIGFcclxuICogQHBhcmFtIGJcclxuICogQHBhcmFtIGNcclxuICogQHJldHVybnMgbnVsbCBtZWFucyB0aGF0IGFsbCBwb2ludHMgYXJlIHJvb3RzICh5ID0gMClcclxuICovXHJcbmZ1bmN0aW9uIHNvbHZlUm9vdHMoIGE6IG51bWJlciwgYjogbnVtYmVyLCBjOiBudW1iZXIgKTogVmVjdG9yMltdIHwgbnVsbCB7XHJcbiAgbGV0IHJvb3RzID0gbnVsbDtcclxuICBsZXQgeENvb3JkaW5hdGVzID0gVXRpbHMuc29sdmVRdWFkcmF0aWNSb290c1JlYWwoIGEsIGIsIGMgKTtcclxuICBpZiAoIHhDb29yZGluYXRlcyAhPT0gbnVsbCApIHtcclxuICAgIHJvb3RzID0gW107XHJcbiAgICB4Q29vcmRpbmF0ZXMgPSB4Q29vcmRpbmF0ZXMuc29ydCggKCB4MCwgeDEgKSA9PiB4MCAtIHgxICk7IC8vIGluIGFzY2VuZGluZyBvcmRlclxyXG4gICAgXy51bmlxKCB4Q29vcmRpbmF0ZXMgKS5mb3JFYWNoKCB4ID0+IHsgcm9vdHMucHVzaCggbmV3IFZlY3RvcjIoIHgsIDAgKSApOyB9ICk7XHJcbiAgfVxyXG4gIGFzc2VydCAmJiBhc3NlcnQoIHJvb3RzID09PSBudWxsIHx8ICggcm9vdHMubGVuZ3RoID49IDAgJiYgcm9vdHMubGVuZ3RoIDw9IDIgKSwgYHVuZXhwZWN0ZWQgcm9vdHM6ICR7cm9vdHN9YCApO1xyXG4gIHJldHVybiByb290cztcclxufVxyXG5cclxuZ3JhcGhpbmdRdWFkcmF0aWNzLnJlZ2lzdGVyKCAnUXVhZHJhdGljJywgUXVhZHJhdGljICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSw2QkFBNkI7QUFFL0MsT0FBT0MsT0FBTyxNQUE4QiwrQkFBK0I7QUFDM0UsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUM3RCxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLFNBQVND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