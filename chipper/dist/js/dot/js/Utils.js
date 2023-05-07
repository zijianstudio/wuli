// Copyright 2013-2023, University of Colorado Boulder

/**
 * Utility functions for Dot, placed into the phet.dot.X namespace.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import dot from './dot.js';
import Vector2 from './Vector2.js';
import Vector3 from './Vector3.js';

// constants
const EPSILON = Number.MIN_VALUE;
const TWO_PI = 2 * Math.PI;

// "static" variables used in boxMullerTransform
let generate;
let z0;
let z1;
const Utils = {
  /**
   * Returns the original value if it is inclusively within the [max,min] range. If it's below the range, min is
   * returned, and if it's above the range, max is returned.
   * @public
   *
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  clamp(value, min, max) {
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    } else {
      return value;
    }
  },
  /**
   * Returns a number in the range $n\in[\mathrm{min},\mathrm{max})$ with the same equivalence class as the input
   * value mod (max-min), i.e. for a value $m$, $m\equiv n\ (\mathrm{mod}\ \mathrm{max}-\mathrm{min})$.
   * @public
   *
   * The 'down' indicates that if the value is equal to min or max, the max is returned.
   *
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  moduloBetweenDown(value, min, max) {
    assert && assert(max > min, 'max > min required for moduloBetween');
    const divisor = max - min;

    // get a partial result of value-min between [0,divisor)
    let partial = (value - min) % divisor;
    if (partial < 0) {
      // since if value-min < 0, the remainder will give us a negative number
      partial += divisor;
    }
    return partial + min; // add back in the minimum value
  },

  /**
   * Returns a number in the range $n\in(\mathrm{min},\mathrm{max}]$ with the same equivalence class as the input
   * value mod (max-min), i.e. for a value $m$, $m\equiv n\ (\mathrm{mod}\ \mathrm{max}-\mathrm{min})$.
   * @public
   *
   * The 'up' indicates that if the value is equal to min or max, the min is returned.
   *
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  moduloBetweenUp(value, min, max) {
    return -Utils.moduloBetweenDown(-value, -max, -min);
  },
  /**
   * Returns an array of integers from A to B (inclusive), e.g. rangeInclusive( 4, 7 ) maps to [ 4, 5, 6, 7 ].
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @returns {Array.<number>}
   */
  rangeInclusive(a, b) {
    if (b < a) {
      return [];
    }
    const result = new Array(b - a + 1);
    for (let i = a; i <= b; i++) {
      result[i - a] = i;
    }
    return result;
  },
  /**
   * Returns an array of integers from A to B (exclusive), e.g. rangeExclusive( 4, 7 ) maps to [ 5, 6 ].
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @returns {Array.<number>}
   */
  rangeExclusive(a, b) {
    return Utils.rangeInclusive(a + 1, b - 1);
  },
  /**
   * Converts degrees to radians.
   * @public
   *
   * @param {number} degrees
   * @returns {number}
   */
  toRadians(degrees) {
    return Math.PI * degrees / 180;
  },
  /**
   * Converts radians to degrees.
   * @public
   *
   * @param {number} radians
   * @returns {number}
   */
  toDegrees(radians) {
    return 180 * radians / Math.PI;
  },
  /**
   * Workaround for broken modulo operator.
   * E.g. on iOS9, 1e10 % 1e10 -> 2.65249474e-315
   * See https://github.com/phetsims/dot/issues/75
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */
  mod(a, b) {
    if (a / b % 1 === 0) {
      return 0; // a is a multiple of b
    } else {
      return a % b;
    }
  },
  /**
   * Greatest Common Divisor, using https://en.wikipedia.org/wiki/Euclidean_algorithm. See
   * https://en.wikipedia.org/wiki/Greatest_common_divisor
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */
  gcd(a, b) {
    return Math.abs(b === 0 ? a : this.gcd(b, Utils.mod(a, b)));
  },
  /**
   * Least Common Multiple, https://en.wikipedia.org/wiki/Least_common_multiple
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @returns {number} lcm, an integer
   */
  lcm(a, b) {
    return Utils.roundSymmetric(Math.abs(a * b) / Utils.gcd(a, b));
  },
  /**
   * Intersection point between the lines defined by the line segments p1-2 and p3-p4. If the
   * lines are not properly defined, null is returned. If there are no intersections or infinitely many,
   * e.g. parallel lines, null is returned.
   * @public
   *
   * @param {Vector2} p1
   * @param {Vector2} p2
   * @param {Vector2} p3
   * @param {Vector2} p4
   * @returns {Vector2|null}
   */
  lineLineIntersection(p1, p2, p3, p4) {
    const epsilon = 1e-10;

    // If the endpoints are the same, they don't properly define a line
    if (p1.equals(p2) || p3.equals(p4)) {
      return null;
    }

    // Taken from an answer in
    // http://stackoverflow.com/questions/385305/efficient-maths-algorithm-to-calculate-intersections
    const x12 = p1.x - p2.x;
    const x34 = p3.x - p4.x;
    const y12 = p1.y - p2.y;
    const y34 = p3.y - p4.y;
    const denom = x12 * y34 - y12 * x34;

    // If the denominator is 0, lines are parallel or coincident
    if (Math.abs(denom) < epsilon) {
      return null;
    }

    // define intersection using determinants, see https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
    const a = p1.x * p2.y - p1.y * p2.x;
    const b = p3.x * p4.y - p3.y * p4.x;
    return new Vector2((a * x34 - x12 * b) / denom, (a * y34 - y12 * b) / denom);
  },
  /**
   * Returns the center of a circle that will lie on 3 points (if it exists), otherwise null (if collinear).
   * @public
   *
   * @param {Vector2} p1
   * @param {Vector2} p2
   * @param {Vector2} p3
   * @returns {Vector2|null}
   */
  circleCenterFromPoints(p1, p2, p3) {
    // TODO: Can we make scratch vectors here, avoiding the circular reference?

    // midpoints between p1-p2 and p2-p3
    const p12 = new Vector2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    const p23 = new Vector2((p2.x + p3.x) / 2, (p2.y + p3.y) / 2);

    // perpendicular points from the minpoints
    const p12x = new Vector2(p12.x + (p2.y - p1.y), p12.y - (p2.x - p1.x));
    const p23x = new Vector2(p23.x + (p3.y - p2.y), p23.y - (p3.x - p2.x));
    return Utils.lineLineIntersection(p12, p12x, p23, p23x);
  },
  /**
   * Returns whether the point p is inside the circle defined by the other three points (p1, p2, p3).
   * @public
   *
   * NOTE: p1,p2,p3 should be specified in a counterclockwise (mathematically) order, and thus should have a positive
   * signed area.
   *
   * See notes in https://en.wikipedia.org/wiki/Delaunay_triangulation.
   *
   * @param {Vector2} p1
   * @param {Vector2} p2
   * @param {Vector2} p3
   * @param {Vector2} p
   * @returns {boolean}
   */
  pointInCircleFromPoints(p1, p2, p3, p) {
    assert && assert(Utils.triangleAreaSigned(p1, p2, p3) > 0, 'Defined points should be in a counterclockwise order');
    const m00 = p1.x - p.x;
    const m01 = p1.y - p.y;
    const m02 = (p1.x - p.x) * (p1.x - p.x) + (p1.y - p.y) * (p1.y - p.y);
    const m10 = p2.x - p.x;
    const m11 = p2.y - p.y;
    const m12 = (p2.x - p.x) * (p2.x - p.x) + (p2.y - p.y) * (p2.y - p.y);
    const m20 = p3.x - p.x;
    const m21 = p3.y - p.y;
    const m22 = (p3.x - p.x) * (p3.x - p.x) + (p3.y - p.y) * (p3.y - p.y);
    const determinant = m00 * m11 * m22 + m01 * m12 * m20 + m02 * m10 * m21 - m02 * m11 * m20 - m01 * m10 * m22 - m00 * m12 * m21;
    return determinant > 0;
  },
  /**
   * Ray-sphere intersection, returning information about the closest intersection. Assumes the sphere is centered
   * at the origin (for ease of computation), transform the ray to compensate if needed.
   * @public
   *
   * If there is no intersection, null is returned. Otherwise an object will be returned like:
   * <pre class="brush: js">
   * {
   *   distance: {number}, // distance from the ray position to the intersection
   *   hitPoint: {Vector3}, // location of the intersection
   *   normal: {Vector3}, // the normal of the sphere's surface at the intersection
   *   fromOutside: {boolean}, // whether the ray intersected the sphere from outside the sphere first
   * }
   * </pre>
   *
   * @param {number} radius
   * @param {Ray3} ray
   * @param {number} epsilon
   * @returns {Object}
   */
  // assumes a sphere with the specified radius, centered at the origin
  sphereRayIntersection(radius, ray, epsilon) {
    epsilon = epsilon === undefined ? 1e-5 : epsilon;

    // center is the origin for now, but leaving in computations so that we can change that in the future. optimize away if needed
    const center = new Vector3(0, 0, 0);
    const rayDir = ray.direction;
    const pos = ray.position;
    const centerToRay = pos.minus(center);

    // basically, we can use the quadratic equation to solve for both possible hit points (both +- roots are the hit points)
    const tmp = rayDir.dot(centerToRay);
    const centerToRayDistSq = centerToRay.magnitudeSquared;
    const det = 4 * tmp * tmp - 4 * (centerToRayDistSq - radius * radius);
    if (det < epsilon) {
      // ray misses sphere entirely
      return null;
    }
    const base = rayDir.dot(center) - rayDir.dot(pos);
    const sqt = Math.sqrt(det) / 2;

    // the "first" entry point distance into the sphere. if we are inside the sphere, it is behind us
    const ta = base - sqt;

    // the "second" entry point distance
    const tb = base + sqt;
    if (tb < epsilon) {
      // sphere is behind ray, so don't return an intersection
      return null;
    }
    const hitPositionB = ray.pointAtDistance(tb);
    const normalB = hitPositionB.minus(center).normalized();
    if (ta < epsilon) {
      // we are inside the sphere
      // in => out
      return {
        distance: tb,
        hitPoint: hitPositionB,
        normal: normalB.negated(),
        fromOutside: false
      };
    } else {
      // two possible hits
      const hitPositionA = ray.pointAtDistance(ta);
      const normalA = hitPositionA.minus(center).normalized();

      // close hit, we have out => in
      return {
        distance: ta,
        hitPoint: hitPositionA,
        normal: normalA,
        fromOutside: true
      };
    }
  },
  /**
   * Returns an array of the real roots of the quadratic equation $ax + b=0$, or null if every value is a solution.
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @returns {Array.<number>|null} - The real roots of the equation, or null if all values are roots. If the root has
   *                                  a multiplicity larger than 1, it will be repeated that many times.
   */
  solveLinearRootsReal(a, b) {
    if (a === 0) {
      if (b === 0) {
        return null;
      } else {
        return [];
      }
    } else {
      return [-b / a];
    }
  },
  /**
   * Returns an array of the real roots of the quadratic equation $ax^2 + bx + c=0$, or null if every value is a
   * solution. If a is nonzero, there should be between 0 and 2 (inclusive) values returned.
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @returns {Array.<number>|null} - The real roots of the equation, or null if all values are roots. If the root has
   *                                  a multiplicity larger than 1, it will be repeated that many times.
   */
  solveQuadraticRootsReal(a, b, c) {
    // Check for a degenerate case where we don't have a quadratic, or if the order of magnitude is such where the
    // linear solution would be expected
    const epsilon = 1E7;
    if (a === 0 || Math.abs(b / a) > epsilon || Math.abs(c / a) > epsilon) {
      return Utils.solveLinearRootsReal(b, c);
    }
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      return [];
    }
    const sqrt = Math.sqrt(discriminant);
    // TODO: how to handle if discriminant is 0? give unique root or double it?
    // TODO: probably just use Complex for the future
    return [(-b - sqrt) / (2 * a), (-b + sqrt) / (2 * a)];
  },
  /**
   * Returns an array of the real roots of the cubic equation $ax^3 + bx^2 + cx + d=0$, or null if every value is a
   * solution. If a is nonzero, there should be between 0 and 3 (inclusive) values returned.
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @param {number} d
   * @param {number} [discriminantThreshold] - for determining whether we have a single real root
   * @returns {Array.<number>|null} - The real roots of the equation, or null if all values are roots. If the root has
   *                                  a multiplicity larger than 1, it will be repeated that many times.
   */
  solveCubicRootsReal(a, b, c, d, discriminantThreshold = 1e-7) {
    let roots;

    // TODO: a Complex type!

    // Check for a degenerate case where we don't have a cubic
    if (a === 0) {
      roots = Utils.solveQuadraticRootsReal(b, c, d);
    } else {
      //We need to test whether a is several orders of magnitude less than b, c, d
      const epsilon = 1E7;
      if (a === 0 || Math.abs(b / a) > epsilon || Math.abs(c / a) > epsilon || Math.abs(d / a) > epsilon) {
        roots = Utils.solveQuadraticRootsReal(b, c, d);
      } else {
        if (d === 0 || Math.abs(a / d) > epsilon || Math.abs(b / d) > epsilon || Math.abs(c / d) > epsilon) {
          roots = [0].concat(Utils.solveQuadraticRootsReal(a, b, c));
        } else {
          b /= a;
          c /= a;
          d /= a;
          const q = (3.0 * c - b * b) / 9;
          const r = (-(27 * d) + b * (9 * c - 2 * (b * b))) / 54;
          const discriminant = q * q * q + r * r;
          const b3 = b / 3;
          if (discriminant > discriminantThreshold) {
            // a single real root
            const dsqrt = Math.sqrt(discriminant);
            roots = [Utils.cubeRoot(r + dsqrt) + Utils.cubeRoot(r - dsqrt) - b3];
          } else if (discriminant > -discriminantThreshold) {
            // would truly be discriminant==0, but floating-point error
            // contains a double root (but with three roots)
            const rsqrt = Utils.cubeRoot(r);
            const doubleRoot = -b3 - rsqrt;
            roots = [-b3 + 2 * rsqrt, doubleRoot, doubleRoot];
          } else {
            // all unique (three roots)
            let qX = -q * q * q;
            qX = Math.acos(r / Math.sqrt(qX));
            const rr = 2 * Math.sqrt(-q);
            roots = [-b3 + rr * Math.cos(qX / 3), -b3 + rr * Math.cos((qX + 2 * Math.PI) / 3), -b3 + rr * Math.cos((qX + 4 * Math.PI) / 3)];
          }
        }
      }
    }
    assert && roots && roots.forEach(root => assert(isFinite(root), 'All returned solveCubicRootsReal roots should be finite'));
    return roots;
  },
  /**
   * Returns the unique real cube root of x, such that $y^3=x$.
   * @public
   *
   * @param {number} x
   * @returns {number}
   */
  cubeRoot(x) {
    return x >= 0 ? Math.pow(x, 1 / 3) : -Math.pow(-x, 1 / 3);
  },
  /**
   * Defines and evaluates a linear mapping. The mapping is defined so that $f(a_1)=b_1$ and $f(a_2)=b_2$, and other
   * values are interpolated along the linear equation. The returned value is $f(a_3)$.
   * @public
   *
   * @param {number} a1
   * @param {number} a2
   * @param {number} b1
   * @param {number} b2
   * @param {number} a3
   * @returns {number}
   */
  linear(a1, a2, b1, b2, a3) {
    assert && assert(typeof a3 === 'number', 'linear requires a number to evaluate');
    return (b2 - b1) / (a2 - a1) * (a3 - a1) + b1;
  },
  /**
   * Rounds using "Round half away from zero" algorithm. See dot#35.
   * @public
   *
   * JavaScript's Math.round is not symmetric for positive and negative numbers, it uses IEEE 754 "Round half up".
   * See https://en.wikipedia.org/wiki/Rounding#Round_half_up.
   * For sims, we want to treat positive and negative values symmetrically, which is IEEE 754 "Round half away from zero",
   * See https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero
   *
   * Note that -0 is rounded to 0, since we typically do not want to display -0 in sims.
   *
   * @param {number} value                               `
   * @returns {number}
   */
  roundSymmetric(value) {
    return (value < 0 ? -1 : 1) * Math.round(Math.abs(value)); // eslint-disable-line bad-sim-text
  },

  /**
   * A predictable implementation of toFixed.
   * @public
   *
   * JavaScript's toFixed is notoriously buggy, behavior differs depending on browser,
   * because the spec doesn't specify whether to round or floor.
   * Rounding is symmetric for positive and negative values, see Utils.roundSymmetric.
   *
   * @param {number} value
   * @param {number} decimalPlaces
   * @returns {string}
   */
  toFixed(value, decimalPlaces) {
    const multiplier = Math.pow(10, decimalPlaces);
    const newValue = Utils.roundSymmetric(value * multiplier) / multiplier;
    return newValue.toFixed(decimalPlaces); // eslint-disable-line bad-sim-text
  },

  /**
   * A predictable implementation of toFixed, where the result is returned as a number instead of a string.
   * @public
   *
   * JavaScript's toFixed is notoriously buggy, behavior differs depending on browser,
   * because the spec doesn't specify whether to round or floor.
   * Rounding is symmetric for positive and negative values, see Utils.roundSymmetric.
   *
   * @param {number} value
   * @param {number} decimalPlaces
   * @returns {number}
   */
  toFixedNumber(value, decimalPlaces) {
    return parseFloat(Utils.toFixed(value, decimalPlaces));
  },
  /**
   * Returns true if two numbers are within epsilon of each other.
   *
   * @param {number} a
   * @param {number} b
   * @param {number} epsilon
   * @returns {boolean}
   */
  equalsEpsilon(a, b, epsilon) {
    return Math.abs(a - b) <= epsilon;
  },
  /**
   * Computes the intersection of the two line segments $(x_1,y_1)(x_2,y_2)$ and $(x_3,y_3)(x_4,y_4)$. If there is no
   * intersection, null is returned.
   * @public
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} x3
   * @param {number} y3
   * @param {number} x4
   * @param {number} y4
   * @returns {Vector2|null}
   */
  lineSegmentIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    // @private
    // Determines counterclockwiseness. Positive if counterclockwise, negative if clockwise, zero if straight line
    // Point1(a,b), Point2(c,d), Point3(e,f)
    // See http://jeffe.cs.illinois.edu/teaching/373/notes/x05-convexhull.pdf
    // @returns {number}
    const ccw = (a, b, c, d, e, f) => (f - b) * (c - a) - (d - b) * (e - a);

    // Check if intersection doesn't exist. See http://jeffe.cs.illinois.edu/teaching/373/notes/x06-sweepline.pdf
    // If point1 and point2 are on opposite sides of line 3 4, exactly one of the two triples 1, 3, 4 and 2, 3, 4
    // is in counterclockwise order.
    if (ccw(x1, y1, x3, y3, x4, y4) * ccw(x2, y2, x3, y3, x4, y4) > 0 || ccw(x3, y3, x1, y1, x2, y2) * ccw(x4, y4, x1, y1, x2, y2) > 0) {
      return null;
    }
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    // If denominator is 0, the lines are parallel or coincident
    if (Math.abs(denom) < 1e-10) {
      return null;
    }

    // Check if there is an exact endpoint overlap (and then return an exact answer).
    if (x1 === x3 && y1 === y3 || x1 === x4 && y1 === y4) {
      return new Vector2(x1, y1);
    } else if (x2 === x3 && y2 === y3 || x2 === x4 && y2 === y4) {
      return new Vector2(x2, y2);
    }

    // Use determinants to calculate intersection, see https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
    const intersectionX = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
    const intersectionY = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;
    return new Vector2(intersectionX, intersectionY);
  },
  /**
   * Squared distance from a point to a line segment squared.
   * See http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
   * @public
   *
   * @param {Vector2} point - The point
   * @param {Vector2} a - Starting point of the line segment
   * @param {Vector2} b - Ending point of the line segment
   * @returns {number}
   */
  distToSegmentSquared(point, a, b) {
    // the square of the distance between a and b,
    const segmentSquaredLength = a.distanceSquared(b);

    // if the segment length is zero, the a and b point are coincident. return the squared distance between a and point
    if (segmentSquaredLength === 0) {
      return point.distanceSquared(a);
    }

    // the t value parametrize the projection of the point onto the a b line
    const t = ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / segmentSquaredLength;
    let distanceSquared;
    if (t < 0) {
      // if t<0, the projection point is outside the ab line, beyond a
      distanceSquared = point.distanceSquared(a);
    } else if (t > 1) {
      // if t>1, the projection past is outside the ab segment, beyond b,
      distanceSquared = point.distanceSquared(b);
    } else {
      // if 0<t<1, the projection point lies along the line joining a and b.
      distanceSquared = point.distanceSquared(new Vector2(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y)));
    }
    return distanceSquared;
  },
  /**
   * distance from a point to a line segment squared.
   * @public
   *
   * @param {Vector2} point - The point
   * @param {Vector2} a - Starting point of the line segment
   * @param {Vector2} b - Ending point of the line segment
   * @returns {number}
   */
  distToSegment(point, a, b) {
    return Math.sqrt(this.distToSegmentSquared(point, a, b));
  },
  /**
   * Determines whether the three points are approximately collinear.
   * @public
   *
   * @param {Vector2} a
   * @param {Vector2} b
   * @param {Vector2} c
   * @param {number} [epsilon]
   * @returns {boolean}
   */
  arePointsCollinear(a, b, c, epsilon) {
    if (epsilon === undefined) {
      epsilon = 0;
    }
    return Utils.triangleArea(a, b, c) <= epsilon;
  },
  /**
   * The area inside the triangle defined by the three vertices.
   * @public
   *
   * @param {Vector2} a
   * @param {Vector2} b
   * @param {Vector2} c
   * @returns {number}
   */
  triangleArea(a, b, c) {
    return Math.abs(Utils.triangleAreaSigned(a, b, c));
  },
  /**
   * The area inside the triangle defined by the three vertices, but with the sign determined by whether the vertices
   * provided are clockwise or counter-clockwise.
   * @public
   *
   * If the vertices are counterclockwise (in a right-handed coordinate system), then the signed area will be
   * positive.
   *
   * @param {Vector2} a
   * @param {Vector2} b
   * @param {Vector2} c
   * @returns {number}
   */
  triangleAreaSigned(a, b, c) {
    return a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y);
  },
  /**
   * Returns the centroid of the simple planar polygon using Green's Theorem P=-y/2, Q=x/2 (similar to how kite
   * computes areas). See also https://en.wikipedia.org/wiki/Shoelace_formula.
   * @public
   *
   * @param {Array.<Vector2>} vertices
   * @returns {Vector2}
   */
  centroidOfPolygon(vertices) {
    const centroid = new Vector2(0, 0);
    let area = 0;
    vertices.forEach((v0, i) => {
      const v1 = vertices[(i + 1) % vertices.length];
      const doubleShoelace = v0.x * v1.y - v1.x * v0.y;
      area += doubleShoelace / 2;

      // Compute the centroid of the flat intersection with https://en.wikipedia.org/wiki/Centroid#Of_a_polygon
      centroid.addXY((v0.x + v1.x) * doubleShoelace, (v0.y + v1.y) * doubleShoelace);
    });
    centroid.divideScalar(6 * area);
    return centroid;
  },
  /**
   * Function that returns the hyperbolic cosine of a number
   * @public
   *
   * @param {number} value
   * @returns {number}
   */
  cosh(value) {
    return (Math.exp(value) + Math.exp(-value)) / 2;
  },
  /**
   * Function that returns the hyperbolic sine of a number
   * @public
   *
   * @param {number} value
   * @returns {number}
   */
  sinh(value) {
    return (Math.exp(value) - Math.exp(-value)) / 2;
  },
  /**
   * Log base-10, since it wasn't included in every supported browser.
   * @public
   *
   * @param {number} val
   * @returns {number}
   */
  log10(val) {
    return Math.log(val) / Math.LN10;
  },
  /**
   * Generates a random Gaussian sample with the given mean and standard deviation.
   * This method relies on the "static" variables generate, z0, and z1 defined above.
   * Random.js is the primary client of this function, but it is defined here so it can be
   * used other places more easily if need be.
   * Code inspired by example here: https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform.
   * @public
   *
   * @param {number} mu - The mean of the Gaussian
   * @param {number} sigma - The standard deviation of the Gaussian
   * @param {Random} random - the source of randomness
   * @returns {number}
   */
  boxMullerTransform(mu, sigma, random) {
    generate = !generate;
    if (!generate) {
      return z1 * sigma + mu;
    }
    let u1;
    let u2;
    do {
      u1 = random.nextDouble();
      u2 = random.nextDouble();
    } while (u1 <= EPSILON);
    z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(TWO_PI * u2);
    z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(TWO_PI * u2);
    return z0 * sigma + mu;
  },
  /**
   * Determines the number of decimal places in a value.
   * @public
   *
   * @param {number} value - a finite number, scientific notation is not supported for decimal numbers
   * @returns {number}
   */
  numberOfDecimalPlaces(value) {
    assert && assert(typeof value === 'number' && isFinite(value), `value must be a finite number ${value}`);
    if (Math.floor(value) === value) {
      return 0;
    } else {
      const string = value.toString();

      // Handle scientific notation
      if (string.includes('e')) {
        // e.g. '1e-21', '5.6e+34', etc.
        const split = string.split('e');
        const mantissa = split[0]; // The left part, e.g. '1' or '5.6'
        const exponent = Number(split[1]); // The right part, e.g. '-21' or '+34'

        // How many decimal places are there in the left part
        const mantissaDecimalPlaces = mantissa.includes('.') ? mantissa.split('.')[1].length : 0;

        // We adjust the number of decimal places by the exponent, e.g. '1.5e1' has zero decimal places, and
        // '1.5e-2' has three.
        return Math.max(mantissaDecimalPlaces - exponent, 0);
      } else {
        // Handle decimal notation. Since we're not an integer, we should be guaranteed to have a decimal
        return string.split('.')[1].length;
      }
    }
  },
  /**
   * Rounds a value to a multiple of a specified interval.
   * Examples:
   * roundToInterval( 0.567, 0.01 ) -> 0.57
   * roundToInterval( 0.567, 0.02 ) -> 0.56
   * roundToInterval( 5.67, 0.5 ) -> 5.5
   *
   * @param {number} value
   * @param {number} interval
   * @returns {number}
   */
  roundToInterval(value, interval) {
    return Utils.toFixedNumber(Utils.roundSymmetric(value / interval) * interval, Utils.numberOfDecimalPlaces(interval));
  }
};
dot.register('Utils', Utils);

// make these available in the main namespace directly (for now)
dot.clamp = Utils.clamp;
dot.moduloBetweenDown = Utils.moduloBetweenDown;
dot.moduloBetweenUp = Utils.moduloBetweenUp;
dot.rangeInclusive = Utils.rangeInclusive;
dot.rangeExclusive = Utils.rangeExclusive;
dot.toRadians = Utils.toRadians;
dot.toDegrees = Utils.toDegrees;
dot.lineLineIntersection = Utils.lineLineIntersection;
dot.lineSegmentIntersection = Utils.lineSegmentIntersection;
dot.sphereRayIntersection = Utils.sphereRayIntersection;
dot.solveQuadraticRootsReal = Utils.solveQuadraticRootsReal;
dot.solveCubicRootsReal = Utils.solveCubicRootsReal;
dot.cubeRoot = Utils.cubeRoot;
dot.linear = Utils.linear;
dot.boxMullerTransform = Utils.boxMullerTransform;
export default Utils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3QiLCJWZWN0b3IyIiwiVmVjdG9yMyIsIkVQU0lMT04iLCJOdW1iZXIiLCJNSU5fVkFMVUUiLCJUV09fUEkiLCJNYXRoIiwiUEkiLCJnZW5lcmF0ZSIsInowIiwiejEiLCJVdGlscyIsImNsYW1wIiwidmFsdWUiLCJtaW4iLCJtYXgiLCJtb2R1bG9CZXR3ZWVuRG93biIsImFzc2VydCIsImRpdmlzb3IiLCJwYXJ0aWFsIiwibW9kdWxvQmV0d2VlblVwIiwicmFuZ2VJbmNsdXNpdmUiLCJhIiwiYiIsInJlc3VsdCIsIkFycmF5IiwiaSIsInJhbmdlRXhjbHVzaXZlIiwidG9SYWRpYW5zIiwiZGVncmVlcyIsInRvRGVncmVlcyIsInJhZGlhbnMiLCJtb2QiLCJnY2QiLCJhYnMiLCJsY20iLCJyb3VuZFN5bW1ldHJpYyIsImxpbmVMaW5lSW50ZXJzZWN0aW9uIiwicDEiLCJwMiIsInAzIiwicDQiLCJlcHNpbG9uIiwiZXF1YWxzIiwieDEyIiwieCIsIngzNCIsInkxMiIsInkiLCJ5MzQiLCJkZW5vbSIsImNpcmNsZUNlbnRlckZyb21Qb2ludHMiLCJwMTIiLCJwMjMiLCJwMTJ4IiwicDIzeCIsInBvaW50SW5DaXJjbGVGcm9tUG9pbnRzIiwicCIsInRyaWFuZ2xlQXJlYVNpZ25lZCIsIm0wMCIsIm0wMSIsIm0wMiIsIm0xMCIsIm0xMSIsIm0xMiIsIm0yMCIsIm0yMSIsIm0yMiIsImRldGVybWluYW50Iiwic3BoZXJlUmF5SW50ZXJzZWN0aW9uIiwicmFkaXVzIiwicmF5IiwidW5kZWZpbmVkIiwiY2VudGVyIiwicmF5RGlyIiwiZGlyZWN0aW9uIiwicG9zIiwicG9zaXRpb24iLCJjZW50ZXJUb1JheSIsIm1pbnVzIiwidG1wIiwiY2VudGVyVG9SYXlEaXN0U3EiLCJtYWduaXR1ZGVTcXVhcmVkIiwiZGV0IiwiYmFzZSIsInNxdCIsInNxcnQiLCJ0YSIsInRiIiwiaGl0UG9zaXRpb25CIiwicG9pbnRBdERpc3RhbmNlIiwibm9ybWFsQiIsIm5vcm1hbGl6ZWQiLCJkaXN0YW5jZSIsImhpdFBvaW50Iiwibm9ybWFsIiwibmVnYXRlZCIsImZyb21PdXRzaWRlIiwiaGl0UG9zaXRpb25BIiwibm9ybWFsQSIsInNvbHZlTGluZWFyUm9vdHNSZWFsIiwic29sdmVRdWFkcmF0aWNSb290c1JlYWwiLCJjIiwiZGlzY3JpbWluYW50Iiwic29sdmVDdWJpY1Jvb3RzUmVhbCIsImQiLCJkaXNjcmltaW5hbnRUaHJlc2hvbGQiLCJyb290cyIsImNvbmNhdCIsInEiLCJyIiwiYjMiLCJkc3FydCIsImN1YmVSb290IiwicnNxcnQiLCJkb3VibGVSb290IiwicVgiLCJhY29zIiwicnIiLCJjb3MiLCJmb3JFYWNoIiwicm9vdCIsImlzRmluaXRlIiwicG93IiwibGluZWFyIiwiYTEiLCJhMiIsImIxIiwiYjIiLCJhMyIsInJvdW5kIiwidG9GaXhlZCIsImRlY2ltYWxQbGFjZXMiLCJtdWx0aXBsaWVyIiwibmV3VmFsdWUiLCJ0b0ZpeGVkTnVtYmVyIiwicGFyc2VGbG9hdCIsImVxdWFsc0Vwc2lsb24iLCJsaW5lU2VnbWVudEludGVyc2VjdGlvbiIsIngxIiwieTEiLCJ4MiIsInkyIiwieDMiLCJ5MyIsIng0IiwieTQiLCJjY3ciLCJlIiwiZiIsImludGVyc2VjdGlvblgiLCJpbnRlcnNlY3Rpb25ZIiwiZGlzdFRvU2VnbWVudFNxdWFyZWQiLCJwb2ludCIsInNlZ21lbnRTcXVhcmVkTGVuZ3RoIiwiZGlzdGFuY2VTcXVhcmVkIiwidCIsImRpc3RUb1NlZ21lbnQiLCJhcmVQb2ludHNDb2xsaW5lYXIiLCJ0cmlhbmdsZUFyZWEiLCJjZW50cm9pZE9mUG9seWdvbiIsInZlcnRpY2VzIiwiY2VudHJvaWQiLCJhcmVhIiwidjAiLCJ2MSIsImxlbmd0aCIsImRvdWJsZVNob2VsYWNlIiwiYWRkWFkiLCJkaXZpZGVTY2FsYXIiLCJjb3NoIiwiZXhwIiwic2luaCIsImxvZzEwIiwidmFsIiwibG9nIiwiTE4xMCIsImJveE11bGxlclRyYW5zZm9ybSIsIm11Iiwic2lnbWEiLCJyYW5kb20iLCJ1MSIsInUyIiwibmV4dERvdWJsZSIsInNpbiIsIm51bWJlck9mRGVjaW1hbFBsYWNlcyIsImZsb29yIiwic3RyaW5nIiwidG9TdHJpbmciLCJpbmNsdWRlcyIsInNwbGl0IiwibWFudGlzc2EiLCJleHBvbmVudCIsIm1hbnRpc3NhRGVjaW1hbFBsYWNlcyIsInJvdW5kVG9JbnRlcnZhbCIsImludGVydmFsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJVdGlscy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBVdGlsaXR5IGZ1bmN0aW9ucyBmb3IgRG90LCBwbGFjZWQgaW50byB0aGUgcGhldC5kb3QuWCBuYW1lc3BhY2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi9WZWN0b3IzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBFUFNJTE9OID0gTnVtYmVyLk1JTl9WQUxVRTtcclxuY29uc3QgVFdPX1BJID0gMiAqIE1hdGguUEk7XHJcblxyXG4vLyBcInN0YXRpY1wiIHZhcmlhYmxlcyB1c2VkIGluIGJveE11bGxlclRyYW5zZm9ybVxyXG5sZXQgZ2VuZXJhdGU7XHJcbmxldCB6MDtcclxubGV0IHoxO1xyXG5cclxuY29uc3QgVXRpbHMgPSB7XHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgb3JpZ2luYWwgdmFsdWUgaWYgaXQgaXMgaW5jbHVzaXZlbHkgd2l0aGluIHRoZSBbbWF4LG1pbl0gcmFuZ2UuIElmIGl0J3MgYmVsb3cgdGhlIHJhbmdlLCBtaW4gaXNcclxuICAgKiByZXR1cm5lZCwgYW5kIGlmIGl0J3MgYWJvdmUgdGhlIHJhbmdlLCBtYXggaXMgcmV0dXJuZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1pblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGNsYW1wKCB2YWx1ZSwgbWluLCBtYXggKSB7XHJcbiAgICBpZiAoIHZhbHVlIDwgbWluICkge1xyXG4gICAgICByZXR1cm4gbWluO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHZhbHVlID4gbWF4ICkge1xyXG4gICAgICByZXR1cm4gbWF4O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbnVtYmVyIGluIHRoZSByYW5nZSAkblxcaW5bXFxtYXRocm17bWlufSxcXG1hdGhybXttYXh9KSQgd2l0aCB0aGUgc2FtZSBlcXVpdmFsZW5jZSBjbGFzcyBhcyB0aGUgaW5wdXRcclxuICAgKiB2YWx1ZSBtb2QgKG1heC1taW4pLCBpLmUuIGZvciBhIHZhbHVlICRtJCwgJG1cXGVxdWl2IG5cXCAoXFxtYXRocm17bW9kfVxcIFxcbWF0aHJte21heH0tXFxtYXRocm17bWlufSkkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoZSAnZG93bicgaW5kaWNhdGVzIHRoYXQgaWYgdGhlIHZhbHVlIGlzIGVxdWFsIHRvIG1pbiBvciBtYXgsIHRoZSBtYXggaXMgcmV0dXJuZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWluXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgbW9kdWxvQmV0d2VlbkRvd24oIHZhbHVlLCBtaW4sIG1heCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1heCA+IG1pbiwgJ21heCA+IG1pbiByZXF1aXJlZCBmb3IgbW9kdWxvQmV0d2VlbicgKTtcclxuXHJcbiAgICBjb25zdCBkaXZpc29yID0gbWF4IC0gbWluO1xyXG5cclxuICAgIC8vIGdldCBhIHBhcnRpYWwgcmVzdWx0IG9mIHZhbHVlLW1pbiBiZXR3ZWVuIFswLGRpdmlzb3IpXHJcbiAgICBsZXQgcGFydGlhbCA9ICggdmFsdWUgLSBtaW4gKSAlIGRpdmlzb3I7XHJcbiAgICBpZiAoIHBhcnRpYWwgPCAwICkge1xyXG4gICAgICAvLyBzaW5jZSBpZiB2YWx1ZS1taW4gPCAwLCB0aGUgcmVtYWluZGVyIHdpbGwgZ2l2ZSB1cyBhIG5lZ2F0aXZlIG51bWJlclxyXG4gICAgICBwYXJ0aWFsICs9IGRpdmlzb3I7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBhcnRpYWwgKyBtaW47IC8vIGFkZCBiYWNrIGluIHRoZSBtaW5pbXVtIHZhbHVlXHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG51bWJlciBpbiB0aGUgcmFuZ2UgJG5cXGluKFxcbWF0aHJte21pbn0sXFxtYXRocm17bWF4fV0kIHdpdGggdGhlIHNhbWUgZXF1aXZhbGVuY2UgY2xhc3MgYXMgdGhlIGlucHV0XHJcbiAgICogdmFsdWUgbW9kIChtYXgtbWluKSwgaS5lLiBmb3IgYSB2YWx1ZSAkbSQsICRtXFxlcXVpdiBuXFwgKFxcbWF0aHJte21vZH1cXCBcXG1hdGhybXttYXh9LVxcbWF0aHJte21pbn0pJC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGUgJ3VwJyBpbmRpY2F0ZXMgdGhhdCBpZiB0aGUgdmFsdWUgaXMgZXF1YWwgdG8gbWluIG9yIG1heCwgdGhlIG1pbiBpcyByZXR1cm5lZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBtb2R1bG9CZXR3ZWVuVXAoIHZhbHVlLCBtaW4sIG1heCApIHtcclxuICAgIHJldHVybiAtVXRpbHMubW9kdWxvQmV0d2VlbkRvd24oIC12YWx1ZSwgLW1heCwgLW1pbiApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgaW50ZWdlcnMgZnJvbSBBIHRvIEIgKGluY2x1c2l2ZSksIGUuZy4gcmFuZ2VJbmNsdXNpdmUoIDQsIDcgKSBtYXBzIHRvIFsgNCwgNSwgNiwgNyBdLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59XHJcbiAgICovXHJcbiAgcmFuZ2VJbmNsdXNpdmUoIGEsIGIgKSB7XHJcbiAgICBpZiAoIGIgPCBhICkge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXkoIGIgLSBhICsgMSApO1xyXG4gICAgZm9yICggbGV0IGkgPSBhOyBpIDw9IGI7IGkrKyApIHtcclxuICAgICAgcmVzdWx0WyBpIC0gYSBdID0gaTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBpbnRlZ2VycyBmcm9tIEEgdG8gQiAoZXhjbHVzaXZlKSwgZS5nLiByYW5nZUV4Y2x1c2l2ZSggNCwgNyApIG1hcHMgdG8gWyA1LCA2IF0uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYlxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48bnVtYmVyPn1cclxuICAgKi9cclxuICByYW5nZUV4Y2x1c2l2ZSggYSwgYiApIHtcclxuICAgIHJldHVybiBVdGlscy5yYW5nZUluY2x1c2l2ZSggYSArIDEsIGIgLSAxICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgZGVncmVlcyB0byByYWRpYW5zLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZWdyZWVzXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICB0b1JhZGlhbnMoIGRlZ3JlZXMgKSB7XHJcbiAgICByZXR1cm4gTWF0aC5QSSAqIGRlZ3JlZXMgLyAxODA7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgcmFkaWFucyB0byBkZWdyZWVzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYW5zXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICB0b0RlZ3JlZXMoIHJhZGlhbnMgKSB7XHJcbiAgICByZXR1cm4gMTgwICogcmFkaWFucyAvIE1hdGguUEk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogV29ya2Fyb3VuZCBmb3IgYnJva2VuIG1vZHVsbyBvcGVyYXRvci5cclxuICAgKiBFLmcuIG9uIGlPUzksIDFlMTAgJSAxZTEwIC0+IDIuNjUyNDk0NzRlLTMxNVxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy83NVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIG1vZCggYSwgYiApIHtcclxuICAgIGlmICggYSAvIGIgJSAxID09PSAwICkge1xyXG4gICAgICByZXR1cm4gMDsgLy8gYSBpcyBhIG11bHRpcGxlIG9mIGJcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gYSAlIGI7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR3JlYXRlc3QgQ29tbW9uIERpdmlzb3IsIHVzaW5nIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0V1Y2xpZGVhbl9hbGdvcml0aG0uIFNlZVxyXG4gICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dyZWF0ZXN0X2NvbW1vbl9kaXZpc29yXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2NkKCBhLCBiICkge1xyXG4gICAgcmV0dXJuIE1hdGguYWJzKCBiID09PSAwID8gYSA6IHRoaXMuZ2NkKCBiLCBVdGlscy5tb2QoIGEsIGIgKSApICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogTGVhc3QgQ29tbW9uIE11bHRpcGxlLCBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MZWFzdF9jb21tb25fbXVsdGlwbGVcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiXHJcbiAgICogQHJldHVybnMge251bWJlcn0gbGNtLCBhbiBpbnRlZ2VyXHJcbiAgICovXHJcbiAgbGNtKCBhLCBiICkge1xyXG4gICAgcmV0dXJuIFV0aWxzLnJvdW5kU3ltbWV0cmljKCBNYXRoLmFicyggYSAqIGIgKSAvIFV0aWxzLmdjZCggYSwgYiApICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJzZWN0aW9uIHBvaW50IGJldHdlZW4gdGhlIGxpbmVzIGRlZmluZWQgYnkgdGhlIGxpbmUgc2VnbWVudHMgcDEtMiBhbmQgcDMtcDQuIElmIHRoZVxyXG4gICAqIGxpbmVzIGFyZSBub3QgcHJvcGVybHkgZGVmaW5lZCwgbnVsbCBpcyByZXR1cm5lZC4gSWYgdGhlcmUgYXJlIG5vIGludGVyc2VjdGlvbnMgb3IgaW5maW5pdGVseSBtYW55LFxyXG4gICAqIGUuZy4gcGFyYWxsZWwgbGluZXMsIG51bGwgaXMgcmV0dXJuZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwMVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcDJcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHAzXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwNFxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfG51bGx9XHJcbiAgICovXHJcbiAgbGluZUxpbmVJbnRlcnNlY3Rpb24oIHAxLCBwMiwgcDMsIHA0ICkge1xyXG4gICAgY29uc3QgZXBzaWxvbiA9IDFlLTEwO1xyXG5cclxuICAgIC8vIElmIHRoZSBlbmRwb2ludHMgYXJlIHRoZSBzYW1lLCB0aGV5IGRvbid0IHByb3Blcmx5IGRlZmluZSBhIGxpbmVcclxuICAgIGlmICggcDEuZXF1YWxzKCBwMiApIHx8IHAzLmVxdWFscyggcDQgKSApIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGFrZW4gZnJvbSBhbiBhbnN3ZXIgaW5cclxuICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzg1MzA1L2VmZmljaWVudC1tYXRocy1hbGdvcml0aG0tdG8tY2FsY3VsYXRlLWludGVyc2VjdGlvbnNcclxuICAgIGNvbnN0IHgxMiA9IHAxLnggLSBwMi54O1xyXG4gICAgY29uc3QgeDM0ID0gcDMueCAtIHA0Lng7XHJcbiAgICBjb25zdCB5MTIgPSBwMS55IC0gcDIueTtcclxuICAgIGNvbnN0IHkzNCA9IHAzLnkgLSBwNC55O1xyXG5cclxuICAgIGNvbnN0IGRlbm9tID0geDEyICogeTM0IC0geTEyICogeDM0O1xyXG5cclxuICAgIC8vIElmIHRoZSBkZW5vbWluYXRvciBpcyAwLCBsaW5lcyBhcmUgcGFyYWxsZWwgb3IgY29pbmNpZGVudFxyXG4gICAgaWYgKCBNYXRoLmFicyggZGVub20gKSA8IGVwc2lsb24gKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRlZmluZSBpbnRlcnNlY3Rpb24gdXNpbmcgZGV0ZXJtaW5hbnRzLCBzZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGluZSVFMiU4MCU5M2xpbmVfaW50ZXJzZWN0aW9uXHJcbiAgICBjb25zdCBhID0gcDEueCAqIHAyLnkgLSBwMS55ICogcDIueDtcclxuICAgIGNvbnN0IGIgPSBwMy54ICogcDQueSAtIHAzLnkgKiBwNC54O1xyXG5cclxuICAgIHJldHVybiBuZXcgVmVjdG9yMihcclxuICAgICAgKCBhICogeDM0IC0geDEyICogYiApIC8gZGVub20sXHJcbiAgICAgICggYSAqIHkzNCAtIHkxMiAqIGIgKSAvIGRlbm9tXHJcbiAgICApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNlbnRlciBvZiBhIGNpcmNsZSB0aGF0IHdpbGwgbGllIG9uIDMgcG9pbnRzIChpZiBpdCBleGlzdHMpLCBvdGhlcndpc2UgbnVsbCAoaWYgY29sbGluZWFyKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHAxXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwMlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcDNcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMnxudWxsfVxyXG4gICAqL1xyXG4gIGNpcmNsZUNlbnRlckZyb21Qb2ludHMoIHAxLCBwMiwgcDMgKSB7XHJcbiAgICAvLyBUT0RPOiBDYW4gd2UgbWFrZSBzY3JhdGNoIHZlY3RvcnMgaGVyZSwgYXZvaWRpbmcgdGhlIGNpcmN1bGFyIHJlZmVyZW5jZT9cclxuXHJcbiAgICAvLyBtaWRwb2ludHMgYmV0d2VlbiBwMS1wMiBhbmQgcDItcDNcclxuICAgIGNvbnN0IHAxMiA9IG5ldyBWZWN0b3IyKCAoIHAxLnggKyBwMi54ICkgLyAyLCAoIHAxLnkgKyBwMi55ICkgLyAyICk7XHJcbiAgICBjb25zdCBwMjMgPSBuZXcgVmVjdG9yMiggKCBwMi54ICsgcDMueCApIC8gMiwgKCBwMi55ICsgcDMueSApIC8gMiApO1xyXG5cclxuICAgIC8vIHBlcnBlbmRpY3VsYXIgcG9pbnRzIGZyb20gdGhlIG1pbnBvaW50c1xyXG4gICAgY29uc3QgcDEyeCA9IG5ldyBWZWN0b3IyKCBwMTIueCArICggcDIueSAtIHAxLnkgKSwgcDEyLnkgLSAoIHAyLnggLSBwMS54ICkgKTtcclxuICAgIGNvbnN0IHAyM3ggPSBuZXcgVmVjdG9yMiggcDIzLnggKyAoIHAzLnkgLSBwMi55ICksIHAyMy55IC0gKCBwMy54IC0gcDIueCApICk7XHJcblxyXG4gICAgcmV0dXJuIFV0aWxzLmxpbmVMaW5lSW50ZXJzZWN0aW9uKCBwMTIsIHAxMngsIHAyMywgcDIzeCApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgcG9pbnQgcCBpcyBpbnNpZGUgdGhlIGNpcmNsZSBkZWZpbmVkIGJ5IHRoZSBvdGhlciB0aHJlZSBwb2ludHMgKHAxLCBwMiwgcDMpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIE5PVEU6IHAxLHAyLHAzIHNob3VsZCBiZSBzcGVjaWZpZWQgaW4gYSBjb3VudGVyY2xvY2t3aXNlIChtYXRoZW1hdGljYWxseSkgb3JkZXIsIGFuZCB0aHVzIHNob3VsZCBoYXZlIGEgcG9zaXRpdmVcclxuICAgKiBzaWduZWQgYXJlYS5cclxuICAgKlxyXG4gICAqIFNlZSBub3RlcyBpbiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9EZWxhdW5heV90cmlhbmd1bGF0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwMVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcDJcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHAzXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgcG9pbnRJbkNpcmNsZUZyb21Qb2ludHMoIHAxLCBwMiwgcDMsIHAgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBVdGlscy50cmlhbmdsZUFyZWFTaWduZWQoIHAxLCBwMiwgcDMgKSA+IDAsXHJcbiAgICAgICdEZWZpbmVkIHBvaW50cyBzaG91bGQgYmUgaW4gYSBjb3VudGVyY2xvY2t3aXNlIG9yZGVyJyApO1xyXG5cclxuICAgIGNvbnN0IG0wMCA9IHAxLnggLSBwLng7XHJcbiAgICBjb25zdCBtMDEgPSBwMS55IC0gcC55O1xyXG4gICAgY29uc3QgbTAyID0gKCBwMS54IC0gcC54ICkgKiAoIHAxLnggLSBwLnggKSArICggcDEueSAtIHAueSApICogKCBwMS55IC0gcC55ICk7XHJcbiAgICBjb25zdCBtMTAgPSBwMi54IC0gcC54O1xyXG4gICAgY29uc3QgbTExID0gcDIueSAtIHAueTtcclxuICAgIGNvbnN0IG0xMiA9ICggcDIueCAtIHAueCApICogKCBwMi54IC0gcC54ICkgKyAoIHAyLnkgLSBwLnkgKSAqICggcDIueSAtIHAueSApO1xyXG4gICAgY29uc3QgbTIwID0gcDMueCAtIHAueDtcclxuICAgIGNvbnN0IG0yMSA9IHAzLnkgLSBwLnk7XHJcbiAgICBjb25zdCBtMjIgPSAoIHAzLnggLSBwLnggKSAqICggcDMueCAtIHAueCApICsgKCBwMy55IC0gcC55ICkgKiAoIHAzLnkgLSBwLnkgKTtcclxuXHJcbiAgICBjb25zdCBkZXRlcm1pbmFudCA9IG0wMCAqIG0xMSAqIG0yMiArIG0wMSAqIG0xMiAqIG0yMCArIG0wMiAqIG0xMCAqIG0yMSAtIG0wMiAqIG0xMSAqIG0yMCAtIG0wMSAqIG0xMCAqIG0yMiAtIG0wMCAqIG0xMiAqIG0yMTtcclxuICAgIHJldHVybiBkZXRlcm1pbmFudCA+IDA7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmF5LXNwaGVyZSBpbnRlcnNlY3Rpb24sIHJldHVybmluZyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY2xvc2VzdCBpbnRlcnNlY3Rpb24uIEFzc3VtZXMgdGhlIHNwaGVyZSBpcyBjZW50ZXJlZFxyXG4gICAqIGF0IHRoZSBvcmlnaW4gKGZvciBlYXNlIG9mIGNvbXB1dGF0aW9uKSwgdHJhbnNmb3JtIHRoZSByYXkgdG8gY29tcGVuc2F0ZSBpZiBuZWVkZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogSWYgdGhlcmUgaXMgbm8gaW50ZXJzZWN0aW9uLCBudWxsIGlzIHJldHVybmVkLiBPdGhlcndpc2UgYW4gb2JqZWN0IHdpbGwgYmUgcmV0dXJuZWQgbGlrZTpcclxuICAgKiA8cHJlIGNsYXNzPVwiYnJ1c2g6IGpzXCI+XHJcbiAgICoge1xyXG4gICAqICAgZGlzdGFuY2U6IHtudW1iZXJ9LCAvLyBkaXN0YW5jZSBmcm9tIHRoZSByYXkgcG9zaXRpb24gdG8gdGhlIGludGVyc2VjdGlvblxyXG4gICAqICAgaGl0UG9pbnQ6IHtWZWN0b3IzfSwgLy8gbG9jYXRpb24gb2YgdGhlIGludGVyc2VjdGlvblxyXG4gICAqICAgbm9ybWFsOiB7VmVjdG9yM30sIC8vIHRoZSBub3JtYWwgb2YgdGhlIHNwaGVyZSdzIHN1cmZhY2UgYXQgdGhlIGludGVyc2VjdGlvblxyXG4gICAqICAgZnJvbU91dHNpZGU6IHtib29sZWFufSwgLy8gd2hldGhlciB0aGUgcmF5IGludGVyc2VjdGVkIHRoZSBzcGhlcmUgZnJvbSBvdXRzaWRlIHRoZSBzcGhlcmUgZmlyc3RcclxuICAgKiB9XHJcbiAgICogPC9wcmU+XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzXHJcbiAgICogQHBhcmFtIHtSYXkzfSByYXlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZXBzaWxvblxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAgICovXHJcbiAgLy8gYXNzdW1lcyBhIHNwaGVyZSB3aXRoIHRoZSBzcGVjaWZpZWQgcmFkaXVzLCBjZW50ZXJlZCBhdCB0aGUgb3JpZ2luXHJcbiAgc3BoZXJlUmF5SW50ZXJzZWN0aW9uKCByYWRpdXMsIHJheSwgZXBzaWxvbiApIHtcclxuICAgIGVwc2lsb24gPSBlcHNpbG9uID09PSB1bmRlZmluZWQgPyAxZS01IDogZXBzaWxvbjtcclxuXHJcbiAgICAvLyBjZW50ZXIgaXMgdGhlIG9yaWdpbiBmb3Igbm93LCBidXQgbGVhdmluZyBpbiBjb21wdXRhdGlvbnMgc28gdGhhdCB3ZSBjYW4gY2hhbmdlIHRoYXQgaW4gdGhlIGZ1dHVyZS4gb3B0aW1pemUgYXdheSBpZiBuZWVkZWRcclxuICAgIGNvbnN0IGNlbnRlciA9IG5ldyBWZWN0b3IzKCAwLCAwLCAwICk7XHJcblxyXG4gICAgY29uc3QgcmF5RGlyID0gcmF5LmRpcmVjdGlvbjtcclxuICAgIGNvbnN0IHBvcyA9IHJheS5wb3NpdGlvbjtcclxuICAgIGNvbnN0IGNlbnRlclRvUmF5ID0gcG9zLm1pbnVzKCBjZW50ZXIgKTtcclxuXHJcbiAgICAvLyBiYXNpY2FsbHksIHdlIGNhbiB1c2UgdGhlIHF1YWRyYXRpYyBlcXVhdGlvbiB0byBzb2x2ZSBmb3IgYm90aCBwb3NzaWJsZSBoaXQgcG9pbnRzIChib3RoICstIHJvb3RzIGFyZSB0aGUgaGl0IHBvaW50cylcclxuICAgIGNvbnN0IHRtcCA9IHJheURpci5kb3QoIGNlbnRlclRvUmF5ICk7XHJcbiAgICBjb25zdCBjZW50ZXJUb1JheURpc3RTcSA9IGNlbnRlclRvUmF5Lm1hZ25pdHVkZVNxdWFyZWQ7XHJcbiAgICBjb25zdCBkZXQgPSA0ICogdG1wICogdG1wIC0gNCAqICggY2VudGVyVG9SYXlEaXN0U3EgLSByYWRpdXMgKiByYWRpdXMgKTtcclxuICAgIGlmICggZGV0IDwgZXBzaWxvbiApIHtcclxuICAgICAgLy8gcmF5IG1pc3NlcyBzcGhlcmUgZW50aXJlbHlcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYmFzZSA9IHJheURpci5kb3QoIGNlbnRlciApIC0gcmF5RGlyLmRvdCggcG9zICk7XHJcbiAgICBjb25zdCBzcXQgPSBNYXRoLnNxcnQoIGRldCApIC8gMjtcclxuXHJcbiAgICAvLyB0aGUgXCJmaXJzdFwiIGVudHJ5IHBvaW50IGRpc3RhbmNlIGludG8gdGhlIHNwaGVyZS4gaWYgd2UgYXJlIGluc2lkZSB0aGUgc3BoZXJlLCBpdCBpcyBiZWhpbmQgdXNcclxuICAgIGNvbnN0IHRhID0gYmFzZSAtIHNxdDtcclxuXHJcbiAgICAvLyB0aGUgXCJzZWNvbmRcIiBlbnRyeSBwb2ludCBkaXN0YW5jZVxyXG4gICAgY29uc3QgdGIgPSBiYXNlICsgc3F0O1xyXG5cclxuICAgIGlmICggdGIgPCBlcHNpbG9uICkge1xyXG4gICAgICAvLyBzcGhlcmUgaXMgYmVoaW5kIHJheSwgc28gZG9uJ3QgcmV0dXJuIGFuIGludGVyc2VjdGlvblxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBoaXRQb3NpdGlvbkIgPSByYXkucG9pbnRBdERpc3RhbmNlKCB0YiApO1xyXG4gICAgY29uc3Qgbm9ybWFsQiA9IGhpdFBvc2l0aW9uQi5taW51cyggY2VudGVyICkubm9ybWFsaXplZCgpO1xyXG5cclxuICAgIGlmICggdGEgPCBlcHNpbG9uICkge1xyXG4gICAgICAvLyB3ZSBhcmUgaW5zaWRlIHRoZSBzcGhlcmVcclxuICAgICAgLy8gaW4gPT4gb3V0XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZGlzdGFuY2U6IHRiLFxyXG4gICAgICAgIGhpdFBvaW50OiBoaXRQb3NpdGlvbkIsXHJcbiAgICAgICAgbm9ybWFsOiBub3JtYWxCLm5lZ2F0ZWQoKSxcclxuICAgICAgICBmcm9tT3V0c2lkZTogZmFsc2VcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyB0d28gcG9zc2libGUgaGl0c1xyXG4gICAgICBjb25zdCBoaXRQb3NpdGlvbkEgPSByYXkucG9pbnRBdERpc3RhbmNlKCB0YSApO1xyXG4gICAgICBjb25zdCBub3JtYWxBID0gaGl0UG9zaXRpb25BLm1pbnVzKCBjZW50ZXIgKS5ub3JtYWxpemVkKCk7XHJcblxyXG4gICAgICAvLyBjbG9zZSBoaXQsIHdlIGhhdmUgb3V0ID0+IGluXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZGlzdGFuY2U6IHRhLFxyXG4gICAgICAgIGhpdFBvaW50OiBoaXRQb3NpdGlvbkEsXHJcbiAgICAgICAgbm9ybWFsOiBub3JtYWxBLFxyXG4gICAgICAgIGZyb21PdXRzaWRlOiB0cnVlXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiB0aGUgcmVhbCByb290cyBvZiB0aGUgcXVhZHJhdGljIGVxdWF0aW9uICRheCArIGI9MCQsIG9yIG51bGwgaWYgZXZlcnkgdmFsdWUgaXMgYSBzb2x1dGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiXHJcbiAgICogQHJldHVybnMge0FycmF5LjxudW1iZXI+fG51bGx9IC0gVGhlIHJlYWwgcm9vdHMgb2YgdGhlIGVxdWF0aW9uLCBvciBudWxsIGlmIGFsbCB2YWx1ZXMgYXJlIHJvb3RzLiBJZiB0aGUgcm9vdCBoYXNcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhIG11bHRpcGxpY2l0eSBsYXJnZXIgdGhhbiAxLCBpdCB3aWxsIGJlIHJlcGVhdGVkIHRoYXQgbWFueSB0aW1lcy5cclxuICAgKi9cclxuICBzb2x2ZUxpbmVhclJvb3RzUmVhbCggYSwgYiApIHtcclxuICAgIGlmICggYSA9PT0gMCApIHtcclxuICAgICAgaWYgKCBiID09PSAwICkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBbIC1iIC8gYSBdO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgdGhlIHJlYWwgcm9vdHMgb2YgdGhlIHF1YWRyYXRpYyBlcXVhdGlvbiAkYXheMiArIGJ4ICsgYz0wJCwgb3IgbnVsbCBpZiBldmVyeSB2YWx1ZSBpcyBhXHJcbiAgICogc29sdXRpb24uIElmIGEgaXMgbm9uemVybywgdGhlcmUgc2hvdWxkIGJlIGJldHdlZW4gMCBhbmQgMiAoaW5jbHVzaXZlKSB2YWx1ZXMgcmV0dXJuZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjXHJcbiAgICogQHJldHVybnMge0FycmF5LjxudW1iZXI+fG51bGx9IC0gVGhlIHJlYWwgcm9vdHMgb2YgdGhlIGVxdWF0aW9uLCBvciBudWxsIGlmIGFsbCB2YWx1ZXMgYXJlIHJvb3RzLiBJZiB0aGUgcm9vdCBoYXNcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhIG11bHRpcGxpY2l0eSBsYXJnZXIgdGhhbiAxLCBpdCB3aWxsIGJlIHJlcGVhdGVkIHRoYXQgbWFueSB0aW1lcy5cclxuICAgKi9cclxuICBzb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbCggYSwgYiwgYyApIHtcclxuICAgIC8vIENoZWNrIGZvciBhIGRlZ2VuZXJhdGUgY2FzZSB3aGVyZSB3ZSBkb24ndCBoYXZlIGEgcXVhZHJhdGljLCBvciBpZiB0aGUgb3JkZXIgb2YgbWFnbml0dWRlIGlzIHN1Y2ggd2hlcmUgdGhlXHJcbiAgICAvLyBsaW5lYXIgc29sdXRpb24gd291bGQgYmUgZXhwZWN0ZWRcclxuICAgIGNvbnN0IGVwc2lsb24gPSAxRTc7XHJcbiAgICBpZiAoIGEgPT09IDAgfHwgTWF0aC5hYnMoIGIgLyBhICkgPiBlcHNpbG9uIHx8IE1hdGguYWJzKCBjIC8gYSApID4gZXBzaWxvbiApIHtcclxuICAgICAgcmV0dXJuIFV0aWxzLnNvbHZlTGluZWFyUm9vdHNSZWFsKCBiLCBjICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGlzY3JpbWluYW50ID0gYiAqIGIgLSA0ICogYSAqIGM7XHJcbiAgICBpZiAoIGRpc2NyaW1pbmFudCA8IDAgKSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuICAgIGNvbnN0IHNxcnQgPSBNYXRoLnNxcnQoIGRpc2NyaW1pbmFudCApO1xyXG4gICAgLy8gVE9ETzogaG93IHRvIGhhbmRsZSBpZiBkaXNjcmltaW5hbnQgaXMgMD8gZ2l2ZSB1bmlxdWUgcm9vdCBvciBkb3VibGUgaXQ/XHJcbiAgICAvLyBUT0RPOiBwcm9iYWJseSBqdXN0IHVzZSBDb21wbGV4IGZvciB0aGUgZnV0dXJlXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAoIC1iIC0gc3FydCApIC8gKCAyICogYSApLFxyXG4gICAgICAoIC1iICsgc3FydCApIC8gKCAyICogYSApXHJcbiAgICBdO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgdGhlIHJlYWwgcm9vdHMgb2YgdGhlIGN1YmljIGVxdWF0aW9uICRheF4zICsgYnheMiArIGN4ICsgZD0wJCwgb3IgbnVsbCBpZiBldmVyeSB2YWx1ZSBpcyBhXHJcbiAgICogc29sdXRpb24uIElmIGEgaXMgbm9uemVybywgdGhlcmUgc2hvdWxkIGJlIGJldHdlZW4gMCBhbmQgMyAoaW5jbHVzaXZlKSB2YWx1ZXMgcmV0dXJuZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gW2Rpc2NyaW1pbmFudFRocmVzaG9sZF0gLSBmb3IgZGV0ZXJtaW5pbmcgd2hldGhlciB3ZSBoYXZlIGEgc2luZ2xlIHJlYWwgcm9vdFxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48bnVtYmVyPnxudWxsfSAtIFRoZSByZWFsIHJvb3RzIG9mIHRoZSBlcXVhdGlvbiwgb3IgbnVsbCBpZiBhbGwgdmFsdWVzIGFyZSByb290cy4gSWYgdGhlIHJvb3QgaGFzXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYSBtdWx0aXBsaWNpdHkgbGFyZ2VyIHRoYW4gMSwgaXQgd2lsbCBiZSByZXBlYXRlZCB0aGF0IG1hbnkgdGltZXMuXHJcbiAgICovXHJcbiAgc29sdmVDdWJpY1Jvb3RzUmVhbCggYSwgYiwgYywgZCwgZGlzY3JpbWluYW50VGhyZXNob2xkID0gMWUtNyApIHtcclxuXHJcbiAgICBsZXQgcm9vdHM7XHJcblxyXG4gICAgLy8gVE9ETzogYSBDb21wbGV4IHR5cGUhXHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIGEgZGVnZW5lcmF0ZSBjYXNlIHdoZXJlIHdlIGRvbid0IGhhdmUgYSBjdWJpY1xyXG4gICAgaWYgKCBhID09PSAwICkge1xyXG4gICAgICByb290cyA9IFV0aWxzLnNvbHZlUXVhZHJhdGljUm9vdHNSZWFsKCBiLCBjLCBkICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy9XZSBuZWVkIHRvIHRlc3Qgd2hldGhlciBhIGlzIHNldmVyYWwgb3JkZXJzIG9mIG1hZ25pdHVkZSBsZXNzIHRoYW4gYiwgYywgZFxyXG4gICAgICBjb25zdCBlcHNpbG9uID0gMUU3O1xyXG5cclxuICAgICAgaWYgKCBhID09PSAwIHx8IE1hdGguYWJzKCBiIC8gYSApID4gZXBzaWxvbiB8fCBNYXRoLmFicyggYyAvIGEgKSA+IGVwc2lsb24gfHwgTWF0aC5hYnMoIGQgLyBhICkgPiBlcHNpbG9uICkge1xyXG4gICAgICAgIHJvb3RzID0gVXRpbHMuc29sdmVRdWFkcmF0aWNSb290c1JlYWwoIGIsIGMsIGQgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBpZiAoIGQgPT09IDAgfHwgTWF0aC5hYnMoIGEgLyBkICkgPiBlcHNpbG9uIHx8IE1hdGguYWJzKCBiIC8gZCApID4gZXBzaWxvbiB8fCBNYXRoLmFicyggYyAvIGQgKSA+IGVwc2lsb24gKSB7XHJcbiAgICAgICAgICByb290cyA9IFsgMCBdLmNvbmNhdCggVXRpbHMuc29sdmVRdWFkcmF0aWNSb290c1JlYWwoIGEsIGIsIGMgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGIgLz0gYTtcclxuICAgICAgICAgIGMgLz0gYTtcclxuICAgICAgICAgIGQgLz0gYTtcclxuXHJcbiAgICAgICAgICBjb25zdCBxID0gKCAzLjAgKiBjIC0gKCBiICogYiApICkgLyA5O1xyXG4gICAgICAgICAgY29uc3QgciA9ICggLSggMjcgKiBkICkgKyBiICogKCA5ICogYyAtIDIgKiAoIGIgKiBiICkgKSApIC8gNTQ7XHJcbiAgICAgICAgICBjb25zdCBkaXNjcmltaW5hbnQgPSBxICogcSAqIHEgKyByICogcjtcclxuICAgICAgICAgIGNvbnN0IGIzID0gYiAvIDM7XHJcblxyXG4gICAgICAgICAgaWYgKCBkaXNjcmltaW5hbnQgPiBkaXNjcmltaW5hbnRUaHJlc2hvbGQgKSB7XHJcbiAgICAgICAgICAgIC8vIGEgc2luZ2xlIHJlYWwgcm9vdFxyXG4gICAgICAgICAgICBjb25zdCBkc3FydCA9IE1hdGguc3FydCggZGlzY3JpbWluYW50ICk7XHJcbiAgICAgICAgICAgIHJvb3RzID0gWyBVdGlscy5jdWJlUm9vdCggciArIGRzcXJ0ICkgKyBVdGlscy5jdWJlUm9vdCggciAtIGRzcXJ0ICkgLSBiMyBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIGRpc2NyaW1pbmFudCA+IC1kaXNjcmltaW5hbnRUaHJlc2hvbGQgKSB7IC8vIHdvdWxkIHRydWx5IGJlIGRpc2NyaW1pbmFudD09MCwgYnV0IGZsb2F0aW5nLXBvaW50IGVycm9yXHJcbiAgICAgICAgICAgIC8vIGNvbnRhaW5zIGEgZG91YmxlIHJvb3QgKGJ1dCB3aXRoIHRocmVlIHJvb3RzKVxyXG4gICAgICAgICAgICBjb25zdCByc3FydCA9IFV0aWxzLmN1YmVSb290KCByICk7XHJcbiAgICAgICAgICAgIGNvbnN0IGRvdWJsZVJvb3QgPSAtYjMgLSByc3FydDtcclxuICAgICAgICAgICAgcm9vdHMgPSBbIC1iMyArIDIgKiByc3FydCwgZG91YmxlUm9vdCwgZG91YmxlUm9vdCBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGFsbCB1bmlxdWUgKHRocmVlIHJvb3RzKVxyXG4gICAgICAgICAgICBsZXQgcVggPSAtcSAqIHEgKiBxO1xyXG4gICAgICAgICAgICBxWCA9IE1hdGguYWNvcyggciAvIE1hdGguc3FydCggcVggKSApO1xyXG4gICAgICAgICAgICBjb25zdCByciA9IDIgKiBNYXRoLnNxcnQoIC1xICk7XHJcbiAgICAgICAgICAgIHJvb3RzID0gW1xyXG4gICAgICAgICAgICAgIC1iMyArIHJyICogTWF0aC5jb3MoIHFYIC8gMyApLFxyXG4gICAgICAgICAgICAgIC1iMyArIHJyICogTWF0aC5jb3MoICggcVggKyAyICogTWF0aC5QSSApIC8gMyApLFxyXG4gICAgICAgICAgICAgIC1iMyArIHJyICogTWF0aC5jb3MoICggcVggKyA0ICogTWF0aC5QSSApIC8gMyApXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIHJvb3RzICYmIHJvb3RzLmZvckVhY2goIHJvb3QgPT4gYXNzZXJ0KCBpc0Zpbml0ZSggcm9vdCApLCAnQWxsIHJldHVybmVkIHNvbHZlQ3ViaWNSb290c1JlYWwgcm9vdHMgc2hvdWxkIGJlIGZpbml0ZScgKSApO1xyXG5cclxuICAgIHJldHVybiByb290cztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB1bmlxdWUgcmVhbCBjdWJlIHJvb3Qgb2YgeCwgc3VjaCB0aGF0ICR5XjM9eCQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGN1YmVSb290KCB4ICkge1xyXG4gICAgcmV0dXJuIHggPj0gMCA/IE1hdGgucG93KCB4LCAxIC8gMyApIDogLU1hdGgucG93KCAteCwgMSAvIDMgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBEZWZpbmVzIGFuZCBldmFsdWF0ZXMgYSBsaW5lYXIgbWFwcGluZy4gVGhlIG1hcHBpbmcgaXMgZGVmaW5lZCBzbyB0aGF0ICRmKGFfMSk9Yl8xJCBhbmQgJGYoYV8yKT1iXzIkLCBhbmQgb3RoZXJcclxuICAgKiB2YWx1ZXMgYXJlIGludGVycG9sYXRlZCBhbG9uZyB0aGUgbGluZWFyIGVxdWF0aW9uLiBUaGUgcmV0dXJuZWQgdmFsdWUgaXMgJGYoYV8zKSQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGExXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGEyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGIxXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGIyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGEzXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBsaW5lYXIoIGExLCBhMiwgYjEsIGIyLCBhMyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBhMyA9PT0gJ251bWJlcicsICdsaW5lYXIgcmVxdWlyZXMgYSBudW1iZXIgdG8gZXZhbHVhdGUnICk7XHJcbiAgICByZXR1cm4gKCBiMiAtIGIxICkgLyAoIGEyIC0gYTEgKSAqICggYTMgLSBhMSApICsgYjE7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUm91bmRzIHVzaW5nIFwiUm91bmQgaGFsZiBhd2F5IGZyb20gemVyb1wiIGFsZ29yaXRobS4gU2VlIGRvdCMzNS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBKYXZhU2NyaXB0J3MgTWF0aC5yb3VuZCBpcyBub3Qgc3ltbWV0cmljIGZvciBwb3NpdGl2ZSBhbmQgbmVnYXRpdmUgbnVtYmVycywgaXQgdXNlcyBJRUVFIDc1NCBcIlJvdW5kIGhhbGYgdXBcIi5cclxuICAgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUm91bmRpbmcjUm91bmRfaGFsZl91cC5cclxuICAgKiBGb3Igc2ltcywgd2Ugd2FudCB0byB0cmVhdCBwb3NpdGl2ZSBhbmQgbmVnYXRpdmUgdmFsdWVzIHN5bW1ldHJpY2FsbHksIHdoaWNoIGlzIElFRUUgNzU0IFwiUm91bmQgaGFsZiBhd2F5IGZyb20gemVyb1wiLFxyXG4gICAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Sb3VuZGluZyNSb3VuZF9oYWxmX2F3YXlfZnJvbV96ZXJvXHJcbiAgICpcclxuICAgKiBOb3RlIHRoYXQgLTAgaXMgcm91bmRlZCB0byAwLCBzaW5jZSB3ZSB0eXBpY2FsbHkgZG8gbm90IHdhbnQgdG8gZGlzcGxheSAtMCBpbiBzaW1zLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIHJvdW5kU3ltbWV0cmljKCB2YWx1ZSApIHtcclxuICAgIHJldHVybiAoICggdmFsdWUgPCAwICkgPyAtMSA6IDEgKSAqIE1hdGgucm91bmQoIE1hdGguYWJzKCB2YWx1ZSApICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFkLXNpbS10ZXh0XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQSBwcmVkaWN0YWJsZSBpbXBsZW1lbnRhdGlvbiBvZiB0b0ZpeGVkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEphdmFTY3JpcHQncyB0b0ZpeGVkIGlzIG5vdG9yaW91c2x5IGJ1Z2d5LCBiZWhhdmlvciBkaWZmZXJzIGRlcGVuZGluZyBvbiBicm93c2VyLFxyXG4gICAqIGJlY2F1c2UgdGhlIHNwZWMgZG9lc24ndCBzcGVjaWZ5IHdoZXRoZXIgdG8gcm91bmQgb3IgZmxvb3IuXHJcbiAgICogUm91bmRpbmcgaXMgc3ltbWV0cmljIGZvciBwb3NpdGl2ZSBhbmQgbmVnYXRpdmUgdmFsdWVzLCBzZWUgVXRpbHMucm91bmRTeW1tZXRyaWMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVjaW1hbFBsYWNlc1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgdG9GaXhlZCggdmFsdWUsIGRlY2ltYWxQbGFjZXMgKSB7XHJcbiAgICBjb25zdCBtdWx0aXBsaWVyID0gTWF0aC5wb3coIDEwLCBkZWNpbWFsUGxhY2VzICk7XHJcbiAgICBjb25zdCBuZXdWYWx1ZSA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCB2YWx1ZSAqIG11bHRpcGxpZXIgKSAvIG11bHRpcGxpZXI7XHJcbiAgICByZXR1cm4gbmV3VmFsdWUudG9GaXhlZCggZGVjaW1hbFBsYWNlcyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhZC1zaW0tdGV4dFxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEEgcHJlZGljdGFibGUgaW1wbGVtZW50YXRpb24gb2YgdG9GaXhlZCwgd2hlcmUgdGhlIHJlc3VsdCBpcyByZXR1cm5lZCBhcyBhIG51bWJlciBpbnN0ZWFkIG9mIGEgc3RyaW5nLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEphdmFTY3JpcHQncyB0b0ZpeGVkIGlzIG5vdG9yaW91c2x5IGJ1Z2d5LCBiZWhhdmlvciBkaWZmZXJzIGRlcGVuZGluZyBvbiBicm93c2VyLFxyXG4gICAqIGJlY2F1c2UgdGhlIHNwZWMgZG9lc24ndCBzcGVjaWZ5IHdoZXRoZXIgdG8gcm91bmQgb3IgZmxvb3IuXHJcbiAgICogUm91bmRpbmcgaXMgc3ltbWV0cmljIGZvciBwb3NpdGl2ZSBhbmQgbmVnYXRpdmUgdmFsdWVzLCBzZWUgVXRpbHMucm91bmRTeW1tZXRyaWMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVjaW1hbFBsYWNlc1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgdG9GaXhlZE51bWJlciggdmFsdWUsIGRlY2ltYWxQbGFjZXMgKSB7XHJcbiAgICByZXR1cm4gcGFyc2VGbG9hdCggVXRpbHMudG9GaXhlZCggdmFsdWUsIGRlY2ltYWxQbGFjZXMgKSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0d28gbnVtYmVycyBhcmUgd2l0aGluIGVwc2lsb24gb2YgZWFjaCBvdGhlci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZXBzaWxvblxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGVxdWFsc0Vwc2lsb24oIGEsIGIsIGVwc2lsb24gKSB7XHJcbiAgICByZXR1cm4gTWF0aC5hYnMoIGEgLSBiICkgPD0gZXBzaWxvbjtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlcyB0aGUgaW50ZXJzZWN0aW9uIG9mIHRoZSB0d28gbGluZSBzZWdtZW50cyAkKHhfMSx5XzEpKHhfMix5XzIpJCBhbmQgJCh4XzMseV8zKSh4XzQseV80KSQuIElmIHRoZXJlIGlzIG5vXHJcbiAgICogaW50ZXJzZWN0aW9uLCBudWxsIGlzIHJldHVybmVkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4M1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5M1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4NFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5NFxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfG51bGx9XHJcbiAgICovXHJcbiAgbGluZVNlZ21lbnRJbnRlcnNlY3Rpb24oIHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCApIHtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgLy8gRGV0ZXJtaW5lcyBjb3VudGVyY2xvY2t3aXNlbmVzcy4gUG9zaXRpdmUgaWYgY291bnRlcmNsb2Nrd2lzZSwgbmVnYXRpdmUgaWYgY2xvY2t3aXNlLCB6ZXJvIGlmIHN0cmFpZ2h0IGxpbmVcclxuICAgIC8vIFBvaW50MShhLGIpLCBQb2ludDIoYyxkKSwgUG9pbnQzKGUsZilcclxuICAgIC8vIFNlZSBodHRwOi8vamVmZmUuY3MuaWxsaW5vaXMuZWR1L3RlYWNoaW5nLzM3My9ub3Rlcy94MDUtY29udmV4aHVsbC5wZGZcclxuICAgIC8vIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICBjb25zdCBjY3cgPSAoIGEsIGIsIGMsIGQsIGUsIGYgKSA9PiAoIGYgLSBiICkgKiAoIGMgLSBhICkgLSAoIGQgLSBiICkgKiAoIGUgLSBhICk7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgaW50ZXJzZWN0aW9uIGRvZXNuJ3QgZXhpc3QuIFNlZSBodHRwOi8vamVmZmUuY3MuaWxsaW5vaXMuZWR1L3RlYWNoaW5nLzM3My9ub3Rlcy94MDYtc3dlZXBsaW5lLnBkZlxyXG4gICAgLy8gSWYgcG9pbnQxIGFuZCBwb2ludDIgYXJlIG9uIG9wcG9zaXRlIHNpZGVzIG9mIGxpbmUgMyA0LCBleGFjdGx5IG9uZSBvZiB0aGUgdHdvIHRyaXBsZXMgMSwgMywgNCBhbmQgMiwgMywgNFxyXG4gICAgLy8gaXMgaW4gY291bnRlcmNsb2Nrd2lzZSBvcmRlci5cclxuICAgIGlmICggY2N3KCB4MSwgeTEsIHgzLCB5MywgeDQsIHk0ICkgKiBjY3coIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQgKSA+IDAgfHxcclxuICAgICAgICAgY2N3KCB4MywgeTMsIHgxLCB5MSwgeDIsIHkyICkgKiBjY3coIHg0LCB5NCwgeDEsIHkxLCB4MiwgeTIgKSA+IDBcclxuICAgICkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkZW5vbSA9ICggeDEgLSB4MiApICogKCB5MyAtIHk0ICkgLSAoIHkxIC0geTIgKSAqICggeDMgLSB4NCApO1xyXG4gICAgLy8gSWYgZGVub21pbmF0b3IgaXMgMCwgdGhlIGxpbmVzIGFyZSBwYXJhbGxlbCBvciBjb2luY2lkZW50XHJcbiAgICBpZiAoIE1hdGguYWJzKCBkZW5vbSApIDwgMWUtMTAgKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGFuIGV4YWN0IGVuZHBvaW50IG92ZXJsYXAgKGFuZCB0aGVuIHJldHVybiBhbiBleGFjdCBhbnN3ZXIpLlxyXG4gICAgaWYgKCAoIHgxID09PSB4MyAmJiB5MSA9PT0geTMgKSB8fCAoIHgxID09PSB4NCAmJiB5MSA9PT0geTQgKSApIHtcclxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB4MSwgeTEgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCAoIHgyID09PSB4MyAmJiB5MiA9PT0geTMgKSB8fCAoIHgyID09PSB4NCAmJiB5MiA9PT0geTQgKSApIHtcclxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB4MiwgeTIgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVc2UgZGV0ZXJtaW5hbnRzIHRvIGNhbGN1bGF0ZSBpbnRlcnNlY3Rpb24sIHNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaW5lJUUyJTgwJTkzbGluZV9pbnRlcnNlY3Rpb25cclxuICAgIGNvbnN0IGludGVyc2VjdGlvblggPSAoICggeDEgKiB5MiAtIHkxICogeDIgKSAqICggeDMgLSB4NCApIC0gKCB4MSAtIHgyICkgKiAoIHgzICogeTQgLSB5MyAqIHg0ICkgKSAvIGRlbm9tO1xyXG4gICAgY29uc3QgaW50ZXJzZWN0aW9uWSA9ICggKCB4MSAqIHkyIC0geTEgKiB4MiApICogKCB5MyAtIHk0ICkgLSAoIHkxIC0geTIgKSAqICggeDMgKiB5NCAtIHkzICogeDQgKSApIC8gZGVub207XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIGludGVyc2VjdGlvblgsIGludGVyc2VjdGlvblkgKTtcclxuICB9LFxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogU3F1YXJlZCBkaXN0YW5jZSBmcm9tIGEgcG9pbnQgdG8gYSBsaW5lIHNlZ21lbnQgc3F1YXJlZC5cclxuICAgKiBTZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NDkyMTEvc2hvcnRlc3QtZGlzdGFuY2UtYmV0d2Vlbi1hLXBvaW50LWFuZC1hLWxpbmUtc2VnbWVudFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9pbnQgLSBUaGUgcG9pbnRcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGEgLSBTdGFydGluZyBwb2ludCBvZiB0aGUgbGluZSBzZWdtZW50XHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBiIC0gRW5kaW5nIHBvaW50IG9mIHRoZSBsaW5lIHNlZ21lbnRcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGRpc3RUb1NlZ21lbnRTcXVhcmVkKCBwb2ludCwgYSwgYiApIHtcclxuICAgIC8vIHRoZSBzcXVhcmUgb2YgdGhlIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYixcclxuICAgIGNvbnN0IHNlZ21lbnRTcXVhcmVkTGVuZ3RoID0gYS5kaXN0YW5jZVNxdWFyZWQoIGIgKTtcclxuXHJcbiAgICAvLyBpZiB0aGUgc2VnbWVudCBsZW5ndGggaXMgemVybywgdGhlIGEgYW5kIGIgcG9pbnQgYXJlIGNvaW5jaWRlbnQuIHJldHVybiB0aGUgc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIHBvaW50XHJcbiAgICBpZiAoIHNlZ21lbnRTcXVhcmVkTGVuZ3RoID09PSAwICkgeyByZXR1cm4gcG9pbnQuZGlzdGFuY2VTcXVhcmVkKCBhICk7IH1cclxuXHJcbiAgICAvLyB0aGUgdCB2YWx1ZSBwYXJhbWV0cml6ZSB0aGUgcHJvamVjdGlvbiBvZiB0aGUgcG9pbnQgb250byB0aGUgYSBiIGxpbmVcclxuICAgIGNvbnN0IHQgPSAoICggcG9pbnQueCAtIGEueCApICogKCBiLnggLSBhLnggKSArICggcG9pbnQueSAtIGEueSApICogKCBiLnkgLSBhLnkgKSApIC8gc2VnbWVudFNxdWFyZWRMZW5ndGg7XHJcblxyXG4gICAgbGV0IGRpc3RhbmNlU3F1YXJlZDtcclxuXHJcbiAgICBpZiAoIHQgPCAwICkge1xyXG4gICAgICAvLyBpZiB0PDAsIHRoZSBwcm9qZWN0aW9uIHBvaW50IGlzIG91dHNpZGUgdGhlIGFiIGxpbmUsIGJleW9uZCBhXHJcbiAgICAgIGRpc3RhbmNlU3F1YXJlZCA9IHBvaW50LmRpc3RhbmNlU3F1YXJlZCggYSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHQgPiAxICkge1xyXG4gICAgICAvLyBpZiB0PjEsIHRoZSBwcm9qZWN0aW9uIHBhc3QgaXMgb3V0c2lkZSB0aGUgYWIgc2VnbWVudCwgYmV5b25kIGIsXHJcbiAgICAgIGRpc3RhbmNlU3F1YXJlZCA9IHBvaW50LmRpc3RhbmNlU3F1YXJlZCggYiApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIGlmIDA8dDwxLCB0aGUgcHJvamVjdGlvbiBwb2ludCBsaWVzIGFsb25nIHRoZSBsaW5lIGpvaW5pbmcgYSBhbmQgYi5cclxuICAgICAgZGlzdGFuY2VTcXVhcmVkID0gcG9pbnQuZGlzdGFuY2VTcXVhcmVkKCBuZXcgVmVjdG9yMiggYS54ICsgdCAqICggYi54IC0gYS54ICksIGEueSArIHQgKiAoIGIueSAtIGEueSApICkgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGlzdGFuY2VTcXVhcmVkO1xyXG5cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBkaXN0YW5jZSBmcm9tIGEgcG9pbnQgdG8gYSBsaW5lIHNlZ21lbnQgc3F1YXJlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvaW50IC0gVGhlIHBvaW50XHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBhIC0gU3RhcnRpbmcgcG9pbnQgb2YgdGhlIGxpbmUgc2VnbWVudFxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gYiAtIEVuZGluZyBwb2ludCBvZiB0aGUgbGluZSBzZWdtZW50XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBkaXN0VG9TZWdtZW50KCBwb2ludCwgYSwgYiApIHtcclxuICAgIHJldHVybiBNYXRoLnNxcnQoIHRoaXMuZGlzdFRvU2VnbWVudFNxdWFyZWQoIHBvaW50LCBhLCBiICkgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHRocmVlIHBvaW50cyBhcmUgYXBwcm94aW1hdGVseSBjb2xsaW5lYXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBhXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBiXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBjXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtlcHNpbG9uXVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGFyZVBvaW50c0NvbGxpbmVhciggYSwgYiwgYywgZXBzaWxvbiApIHtcclxuICAgIGlmICggZXBzaWxvbiA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICBlcHNpbG9uID0gMDtcclxuICAgIH1cclxuICAgIHJldHVybiBVdGlscy50cmlhbmdsZUFyZWEoIGEsIGIsIGMgKSA8PSBlcHNpbG9uO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBhcmVhIGluc2lkZSB0aGUgdHJpYW5nbGUgZGVmaW5lZCBieSB0aGUgdGhyZWUgdmVydGljZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBhXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBiXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBjXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICB0cmlhbmdsZUFyZWEoIGEsIGIsIGMgKSB7XHJcbiAgICByZXR1cm4gTWF0aC5hYnMoIFV0aWxzLnRyaWFuZ2xlQXJlYVNpZ25lZCggYSwgYiwgYyApICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGFyZWEgaW5zaWRlIHRoZSB0cmlhbmdsZSBkZWZpbmVkIGJ5IHRoZSB0aHJlZSB2ZXJ0aWNlcywgYnV0IHdpdGggdGhlIHNpZ24gZGV0ZXJtaW5lZCBieSB3aGV0aGVyIHRoZSB2ZXJ0aWNlc1xyXG4gICAqIHByb3ZpZGVkIGFyZSBjbG9ja3dpc2Ugb3IgY291bnRlci1jbG9ja3dpc2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogSWYgdGhlIHZlcnRpY2VzIGFyZSBjb3VudGVyY2xvY2t3aXNlIChpbiBhIHJpZ2h0LWhhbmRlZCBjb29yZGluYXRlIHN5c3RlbSksIHRoZW4gdGhlIHNpZ25lZCBhcmVhIHdpbGwgYmVcclxuICAgKiBwb3NpdGl2ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gYVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gYlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgdHJpYW5nbGVBcmVhU2lnbmVkKCBhLCBiLCBjICkge1xyXG4gICAgcmV0dXJuIGEueCAqICggYi55IC0gYy55ICkgKyBiLnggKiAoIGMueSAtIGEueSApICsgYy54ICogKCBhLnkgLSBiLnkgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjZW50cm9pZCBvZiB0aGUgc2ltcGxlIHBsYW5hciBwb2x5Z29uIHVzaW5nIEdyZWVuJ3MgVGhlb3JlbSBQPS15LzIsIFE9eC8yIChzaW1pbGFyIHRvIGhvdyBraXRlXHJcbiAgICogY29tcHV0ZXMgYXJlYXMpLiBTZWUgYWxzbyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TaG9lbGFjZV9mb3JtdWxhLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFZlY3RvcjI+fSB2ZXJ0aWNlc1xyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGNlbnRyb2lkT2ZQb2x5Z29uKCB2ZXJ0aWNlcyApIHtcclxuICAgIGNvbnN0IGNlbnRyb2lkID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuXHJcbiAgICBsZXQgYXJlYSA9IDA7XHJcbiAgICB2ZXJ0aWNlcy5mb3JFYWNoKCAoIHYwLCBpICkgPT4ge1xyXG4gICAgICBjb25zdCB2MSA9IHZlcnRpY2VzWyAoIGkgKyAxICkgJSB2ZXJ0aWNlcy5sZW5ndGggXTtcclxuICAgICAgY29uc3QgZG91YmxlU2hvZWxhY2UgPSB2MC54ICogdjEueSAtIHYxLnggKiB2MC55O1xyXG5cclxuICAgICAgYXJlYSArPSBkb3VibGVTaG9lbGFjZSAvIDI7XHJcblxyXG4gICAgICAvLyBDb21wdXRlIHRoZSBjZW50cm9pZCBvZiB0aGUgZmxhdCBpbnRlcnNlY3Rpb24gd2l0aCBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DZW50cm9pZCNPZl9hX3BvbHlnb25cclxuICAgICAgY2VudHJvaWQuYWRkWFkoXHJcbiAgICAgICAgKCB2MC54ICsgdjEueCApICogZG91YmxlU2hvZWxhY2UsXHJcbiAgICAgICAgKCB2MC55ICsgdjEueSApICogZG91YmxlU2hvZWxhY2VcclxuICAgICAgKTtcclxuICAgIH0gKTtcclxuICAgIGNlbnRyb2lkLmRpdmlkZVNjYWxhciggNiAqIGFyZWEgKTtcclxuXHJcbiAgICByZXR1cm4gY2VudHJvaWQ7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBoeXBlcmJvbGljIGNvc2luZSBvZiBhIG51bWJlclxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgY29zaCggdmFsdWUgKSB7XHJcbiAgICByZXR1cm4gKCBNYXRoLmV4cCggdmFsdWUgKSArIE1hdGguZXhwKCAtdmFsdWUgKSApIC8gMjtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGh5cGVyYm9saWMgc2luZSBvZiBhIG51bWJlclxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgc2luaCggdmFsdWUgKSB7XHJcbiAgICByZXR1cm4gKCBNYXRoLmV4cCggdmFsdWUgKSAtIE1hdGguZXhwKCAtdmFsdWUgKSApIC8gMjtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBMb2cgYmFzZS0xMCwgc2luY2UgaXQgd2Fzbid0IGluY2x1ZGVkIGluIGV2ZXJ5IHN1cHBvcnRlZCBicm93c2VyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWxcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGxvZzEwKCB2YWwgKSB7XHJcbiAgICByZXR1cm4gTWF0aC5sb2coIHZhbCApIC8gTWF0aC5MTjEwO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlcyBhIHJhbmRvbSBHYXVzc2lhbiBzYW1wbGUgd2l0aCB0aGUgZ2l2ZW4gbWVhbiBhbmQgc3RhbmRhcmQgZGV2aWF0aW9uLlxyXG4gICAqIFRoaXMgbWV0aG9kIHJlbGllcyBvbiB0aGUgXCJzdGF0aWNcIiB2YXJpYWJsZXMgZ2VuZXJhdGUsIHowLCBhbmQgejEgZGVmaW5lZCBhYm92ZS5cclxuICAgKiBSYW5kb20uanMgaXMgdGhlIHByaW1hcnkgY2xpZW50IG9mIHRoaXMgZnVuY3Rpb24sIGJ1dCBpdCBpcyBkZWZpbmVkIGhlcmUgc28gaXQgY2FuIGJlXHJcbiAgICogdXNlZCBvdGhlciBwbGFjZXMgbW9yZSBlYXNpbHkgaWYgbmVlZCBiZS5cclxuICAgKiBDb2RlIGluc3BpcmVkIGJ5IGV4YW1wbGUgaGVyZTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQm94JUUyJTgwJTkzTXVsbGVyX3RyYW5zZm9ybS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbXUgLSBUaGUgbWVhbiBvZiB0aGUgR2F1c3NpYW5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2lnbWEgLSBUaGUgc3RhbmRhcmQgZGV2aWF0aW9uIG9mIHRoZSBHYXVzc2lhblxyXG4gICAqIEBwYXJhbSB7UmFuZG9tfSByYW5kb20gLSB0aGUgc291cmNlIG9mIHJhbmRvbW5lc3NcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGJveE11bGxlclRyYW5zZm9ybSggbXUsIHNpZ21hLCByYW5kb20gKSB7XHJcbiAgICBnZW5lcmF0ZSA9ICFnZW5lcmF0ZTtcclxuXHJcbiAgICBpZiAoICFnZW5lcmF0ZSApIHtcclxuICAgICAgcmV0dXJuIHoxICogc2lnbWEgKyBtdTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdTE7XHJcbiAgICBsZXQgdTI7XHJcbiAgICBkbyB7XHJcbiAgICAgIHUxID0gcmFuZG9tLm5leHREb3VibGUoKTtcclxuICAgICAgdTIgPSByYW5kb20ubmV4dERvdWJsZSgpO1xyXG4gICAgfVxyXG4gICAgd2hpbGUgKCB1MSA8PSBFUFNJTE9OICk7XHJcblxyXG4gICAgejAgPSBNYXRoLnNxcnQoIC0yLjAgKiBNYXRoLmxvZyggdTEgKSApICogTWF0aC5jb3MoIFRXT19QSSAqIHUyICk7XHJcbiAgICB6MSA9IE1hdGguc3FydCggLTIuMCAqIE1hdGgubG9nKCB1MSApICkgKiBNYXRoLnNpbiggVFdPX1BJICogdTIgKTtcclxuICAgIHJldHVybiB6MCAqIHNpZ21hICsgbXU7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB0aGUgbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIGluIGEgdmFsdWUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gYSBmaW5pdGUgbnVtYmVyLCBzY2llbnRpZmljIG5vdGF0aW9uIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIGRlY2ltYWwgbnVtYmVyc1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgbnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCB2YWx1ZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHZhbHVlICksIGB2YWx1ZSBtdXN0IGJlIGEgZmluaXRlIG51bWJlciAke3ZhbHVlfWAgKTtcclxuICAgIGlmICggTWF0aC5mbG9vciggdmFsdWUgKSA9PT0gdmFsdWUgKSB7XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IHN0cmluZyA9IHZhbHVlLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAvLyBIYW5kbGUgc2NpZW50aWZpYyBub3RhdGlvblxyXG4gICAgICBpZiAoIHN0cmluZy5pbmNsdWRlcyggJ2UnICkgKSB7XHJcbiAgICAgICAgLy8gZS5nLiAnMWUtMjEnLCAnNS42ZSszNCcsIGV0Yy5cclxuICAgICAgICBjb25zdCBzcGxpdCA9IHN0cmluZy5zcGxpdCggJ2UnICk7XHJcbiAgICAgICAgY29uc3QgbWFudGlzc2EgPSBzcGxpdFsgMCBdOyAvLyBUaGUgbGVmdCBwYXJ0LCBlLmcuICcxJyBvciAnNS42J1xyXG4gICAgICAgIGNvbnN0IGV4cG9uZW50ID0gTnVtYmVyKCBzcGxpdFsgMSBdICk7IC8vIFRoZSByaWdodCBwYXJ0LCBlLmcuICctMjEnIG9yICcrMzQnXHJcblxyXG4gICAgICAgIC8vIEhvdyBtYW55IGRlY2ltYWwgcGxhY2VzIGFyZSB0aGVyZSBpbiB0aGUgbGVmdCBwYXJ0XHJcbiAgICAgICAgY29uc3QgbWFudGlzc2FEZWNpbWFsUGxhY2VzID0gbWFudGlzc2EuaW5jbHVkZXMoICcuJyApID8gbWFudGlzc2Euc3BsaXQoICcuJyApWyAxIF0ubGVuZ3RoIDogMDtcclxuXHJcbiAgICAgICAgLy8gV2UgYWRqdXN0IHRoZSBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgYnkgdGhlIGV4cG9uZW50LCBlLmcuICcxLjVlMScgaGFzIHplcm8gZGVjaW1hbCBwbGFjZXMsIGFuZFxyXG4gICAgICAgIC8vICcxLjVlLTInIGhhcyB0aHJlZS5cclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoIG1hbnRpc3NhRGVjaW1hbFBsYWNlcyAtIGV4cG9uZW50LCAwICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7IC8vIEhhbmRsZSBkZWNpbWFsIG5vdGF0aW9uLiBTaW5jZSB3ZSdyZSBub3QgYW4gaW50ZWdlciwgd2Ugc2hvdWxkIGJlIGd1YXJhbnRlZWQgdG8gaGF2ZSBhIGRlY2ltYWxcclxuICAgICAgICByZXR1cm4gc3RyaW5nLnNwbGl0KCAnLicgKVsgMSBdLmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJvdW5kcyBhIHZhbHVlIHRvIGEgbXVsdGlwbGUgb2YgYSBzcGVjaWZpZWQgaW50ZXJ2YWwuXHJcbiAgICogRXhhbXBsZXM6XHJcbiAgICogcm91bmRUb0ludGVydmFsKCAwLjU2NywgMC4wMSApIC0+IDAuNTdcclxuICAgKiByb3VuZFRvSW50ZXJ2YWwoIDAuNTY3LCAwLjAyICkgLT4gMC41NlxyXG4gICAqIHJvdW5kVG9JbnRlcnZhbCggNS42NywgMC41ICkgLT4gNS41XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW50ZXJ2YWxcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIHJvdW5kVG9JbnRlcnZhbCggdmFsdWUsIGludGVydmFsICkge1xyXG4gICAgcmV0dXJuIFV0aWxzLnRvRml4ZWROdW1iZXIoIFV0aWxzLnJvdW5kU3ltbWV0cmljKCB2YWx1ZSAvIGludGVydmFsICkgKiBpbnRlcnZhbCxcclxuICAgICAgVXRpbHMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCBpbnRlcnZhbCApICk7XHJcbiAgfVxyXG59O1xyXG5kb3QucmVnaXN0ZXIoICdVdGlscycsIFV0aWxzICk7XHJcblxyXG4vLyBtYWtlIHRoZXNlIGF2YWlsYWJsZSBpbiB0aGUgbWFpbiBuYW1lc3BhY2UgZGlyZWN0bHkgKGZvciBub3cpXHJcbmRvdC5jbGFtcCA9IFV0aWxzLmNsYW1wO1xyXG5kb3QubW9kdWxvQmV0d2VlbkRvd24gPSBVdGlscy5tb2R1bG9CZXR3ZWVuRG93bjtcclxuZG90Lm1vZHVsb0JldHdlZW5VcCA9IFV0aWxzLm1vZHVsb0JldHdlZW5VcDtcclxuZG90LnJhbmdlSW5jbHVzaXZlID0gVXRpbHMucmFuZ2VJbmNsdXNpdmU7XHJcbmRvdC5yYW5nZUV4Y2x1c2l2ZSA9IFV0aWxzLnJhbmdlRXhjbHVzaXZlO1xyXG5kb3QudG9SYWRpYW5zID0gVXRpbHMudG9SYWRpYW5zO1xyXG5kb3QudG9EZWdyZWVzID0gVXRpbHMudG9EZWdyZWVzO1xyXG5kb3QubGluZUxpbmVJbnRlcnNlY3Rpb24gPSBVdGlscy5saW5lTGluZUludGVyc2VjdGlvbjtcclxuZG90LmxpbmVTZWdtZW50SW50ZXJzZWN0aW9uID0gVXRpbHMubGluZVNlZ21lbnRJbnRlcnNlY3Rpb247XHJcbmRvdC5zcGhlcmVSYXlJbnRlcnNlY3Rpb24gPSBVdGlscy5zcGhlcmVSYXlJbnRlcnNlY3Rpb247XHJcbmRvdC5zb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbCA9IFV0aWxzLnNvbHZlUXVhZHJhdGljUm9vdHNSZWFsO1xyXG5kb3Quc29sdmVDdWJpY1Jvb3RzUmVhbCA9IFV0aWxzLnNvbHZlQ3ViaWNSb290c1JlYWw7XHJcbmRvdC5jdWJlUm9vdCA9IFV0aWxzLmN1YmVSb290O1xyXG5kb3QubGluZWFyID0gVXRpbHMubGluZWFyO1xyXG5kb3QuYm94TXVsbGVyVHJhbnNmb3JtID0gVXRpbHMuYm94TXVsbGVyVHJhbnNmb3JtO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVXRpbHM7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQU0sVUFBVTtBQUMxQixPQUFPQyxPQUFPLE1BQU0sY0FBYztBQUNsQyxPQUFPQyxPQUFPLE1BQU0sY0FBYzs7QUFFbEM7QUFDQSxNQUFNQyxPQUFPLEdBQUdDLE1BQU0sQ0FBQ0MsU0FBUztBQUNoQyxNQUFNQyxNQUFNLEdBQUcsQ0FBQyxHQUFHQyxJQUFJLENBQUNDLEVBQUU7O0FBRTFCO0FBQ0EsSUFBSUMsUUFBUTtBQUNaLElBQUlDLEVBQUU7QUFDTixJQUFJQyxFQUFFO0FBRU4sTUFBTUMsS0FBSyxHQUFHO0VBQ1o7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsS0FBS0EsQ0FBRUMsS0FBSyxFQUFFQyxHQUFHLEVBQUVDLEdBQUcsRUFBRztJQUN2QixJQUFLRixLQUFLLEdBQUdDLEdBQUcsRUFBRztNQUNqQixPQUFPQSxHQUFHO0lBQ1osQ0FBQyxNQUNJLElBQUtELEtBQUssR0FBR0UsR0FBRyxFQUFHO01BQ3RCLE9BQU9BLEdBQUc7SUFDWixDQUFDLE1BQ0k7TUFDSCxPQUFPRixLQUFLO0lBQ2Q7RUFDRixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLGlCQUFpQkEsQ0FBRUgsS0FBSyxFQUFFQyxHQUFHLEVBQUVDLEdBQUcsRUFBRztJQUNuQ0UsTUFBTSxJQUFJQSxNQUFNLENBQUVGLEdBQUcsR0FBR0QsR0FBRyxFQUFFLHNDQUF1QyxDQUFDO0lBRXJFLE1BQU1JLE9BQU8sR0FBR0gsR0FBRyxHQUFHRCxHQUFHOztJQUV6QjtJQUNBLElBQUlLLE9BQU8sR0FBRyxDQUFFTixLQUFLLEdBQUdDLEdBQUcsSUFBS0ksT0FBTztJQUN2QyxJQUFLQyxPQUFPLEdBQUcsQ0FBQyxFQUFHO01BQ2pCO01BQ0FBLE9BQU8sSUFBSUQsT0FBTztJQUNwQjtJQUVBLE9BQU9DLE9BQU8sR0FBR0wsR0FBRyxDQUFDLENBQUM7RUFDeEIsQ0FBQzs7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sZUFBZUEsQ0FBRVAsS0FBSyxFQUFFQyxHQUFHLEVBQUVDLEdBQUcsRUFBRztJQUNqQyxPQUFPLENBQUNKLEtBQUssQ0FBQ0ssaUJBQWlCLENBQUUsQ0FBQ0gsS0FBSyxFQUFFLENBQUNFLEdBQUcsRUFBRSxDQUFDRCxHQUFJLENBQUM7RUFDdkQsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU8sY0FBY0EsQ0FBRUMsQ0FBQyxFQUFFQyxDQUFDLEVBQUc7SUFDckIsSUFBS0EsQ0FBQyxHQUFHRCxDQUFDLEVBQUc7TUFDWCxPQUFPLEVBQUU7SUFDWDtJQUNBLE1BQU1FLE1BQU0sR0FBRyxJQUFJQyxLQUFLLENBQUVGLENBQUMsR0FBR0QsQ0FBQyxHQUFHLENBQUUsQ0FBQztJQUNyQyxLQUFNLElBQUlJLENBQUMsR0FBR0osQ0FBQyxFQUFFSSxDQUFDLElBQUlILENBQUMsRUFBRUcsQ0FBQyxFQUFFLEVBQUc7TUFDN0JGLE1BQU0sQ0FBRUUsQ0FBQyxHQUFHSixDQUFDLENBQUUsR0FBR0ksQ0FBQztJQUNyQjtJQUNBLE9BQU9GLE1BQU07RUFDZixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxjQUFjQSxDQUFFTCxDQUFDLEVBQUVDLENBQUMsRUFBRztJQUNyQixPQUFPWixLQUFLLENBQUNVLGNBQWMsQ0FBRUMsQ0FBQyxHQUFHLENBQUMsRUFBRUMsQ0FBQyxHQUFHLENBQUUsQ0FBQztFQUM3QyxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUssU0FBU0EsQ0FBRUMsT0FBTyxFQUFHO0lBQ25CLE9BQU92QixJQUFJLENBQUNDLEVBQUUsR0FBR3NCLE9BQU8sR0FBRyxHQUFHO0VBQ2hDLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxTQUFTQSxDQUFFQyxPQUFPLEVBQUc7SUFDbkIsT0FBTyxHQUFHLEdBQUdBLE9BQU8sR0FBR3pCLElBQUksQ0FBQ0MsRUFBRTtFQUNoQyxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFeUIsR0FBR0EsQ0FBRVYsQ0FBQyxFQUFFQyxDQUFDLEVBQUc7SUFDVixJQUFLRCxDQUFDLEdBQUdDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFHO01BQ3JCLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDWixDQUFDLE1BQ0k7TUFDSCxPQUFPRCxDQUFDLEdBQUdDLENBQUM7SUFDZDtFQUNGLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVUsR0FBR0EsQ0FBRVgsQ0FBQyxFQUFFQyxDQUFDLEVBQUc7SUFDVixPQUFPakIsSUFBSSxDQUFDNEIsR0FBRyxDQUFFWCxDQUFDLEtBQUssQ0FBQyxHQUFHRCxDQUFDLEdBQUcsSUFBSSxDQUFDVyxHQUFHLENBQUVWLENBQUMsRUFBRVosS0FBSyxDQUFDcUIsR0FBRyxDQUFFVixDQUFDLEVBQUVDLENBQUUsQ0FBRSxDQUFFLENBQUM7RUFDbkUsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVksR0FBR0EsQ0FBRWIsQ0FBQyxFQUFFQyxDQUFDLEVBQUc7SUFDVixPQUFPWixLQUFLLENBQUN5QixjQUFjLENBQUU5QixJQUFJLENBQUM0QixHQUFHLENBQUVaLENBQUMsR0FBR0MsQ0FBRSxDQUFDLEdBQUdaLEtBQUssQ0FBQ3NCLEdBQUcsQ0FBRVgsQ0FBQyxFQUFFQyxDQUFFLENBQUUsQ0FBQztFQUN0RSxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VjLG9CQUFvQkEsQ0FBRUMsRUFBRSxFQUFFQyxFQUFFLEVBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFHO0lBQ3JDLE1BQU1DLE9BQU8sR0FBRyxLQUFLOztJQUVyQjtJQUNBLElBQUtKLEVBQUUsQ0FBQ0ssTUFBTSxDQUFFSixFQUFHLENBQUMsSUFBSUMsRUFBRSxDQUFDRyxNQUFNLENBQUVGLEVBQUcsQ0FBQyxFQUFHO01BQ3hDLE9BQU8sSUFBSTtJQUNiOztJQUVBO0lBQ0E7SUFDQSxNQUFNRyxHQUFHLEdBQUdOLEVBQUUsQ0FBQ08sQ0FBQyxHQUFHTixFQUFFLENBQUNNLENBQUM7SUFDdkIsTUFBTUMsR0FBRyxHQUFHTixFQUFFLENBQUNLLENBQUMsR0FBR0osRUFBRSxDQUFDSSxDQUFDO0lBQ3ZCLE1BQU1FLEdBQUcsR0FBR1QsRUFBRSxDQUFDVSxDQUFDLEdBQUdULEVBQUUsQ0FBQ1MsQ0FBQztJQUN2QixNQUFNQyxHQUFHLEdBQUdULEVBQUUsQ0FBQ1EsQ0FBQyxHQUFHUCxFQUFFLENBQUNPLENBQUM7SUFFdkIsTUFBTUUsS0FBSyxHQUFHTixHQUFHLEdBQUdLLEdBQUcsR0FBR0YsR0FBRyxHQUFHRCxHQUFHOztJQUVuQztJQUNBLElBQUt4QyxJQUFJLENBQUM0QixHQUFHLENBQUVnQixLQUFNLENBQUMsR0FBR1IsT0FBTyxFQUFHO01BQ2pDLE9BQU8sSUFBSTtJQUNiOztJQUVBO0lBQ0EsTUFBTXBCLENBQUMsR0FBR2dCLEVBQUUsQ0FBQ08sQ0FBQyxHQUFHTixFQUFFLENBQUNTLENBQUMsR0FBR1YsRUFBRSxDQUFDVSxDQUFDLEdBQUdULEVBQUUsQ0FBQ00sQ0FBQztJQUNuQyxNQUFNdEIsQ0FBQyxHQUFHaUIsRUFBRSxDQUFDSyxDQUFDLEdBQUdKLEVBQUUsQ0FBQ08sQ0FBQyxHQUFHUixFQUFFLENBQUNRLENBQUMsR0FBR1AsRUFBRSxDQUFDSSxDQUFDO0lBRW5DLE9BQU8sSUFBSTdDLE9BQU8sQ0FDaEIsQ0FBRXNCLENBQUMsR0FBR3dCLEdBQUcsR0FBR0YsR0FBRyxHQUFHckIsQ0FBQyxJQUFLMkIsS0FBSyxFQUM3QixDQUFFNUIsQ0FBQyxHQUFHMkIsR0FBRyxHQUFHRixHQUFHLEdBQUd4QixDQUFDLElBQUsyQixLQUMxQixDQUFDO0VBQ0gsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxzQkFBc0JBLENBQUViLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFFLEVBQUc7SUFDbkM7O0lBRUE7SUFDQSxNQUFNWSxHQUFHLEdBQUcsSUFBSXBELE9BQU8sQ0FBRSxDQUFFc0MsRUFBRSxDQUFDTyxDQUFDLEdBQUdOLEVBQUUsQ0FBQ00sQ0FBQyxJQUFLLENBQUMsRUFBRSxDQUFFUCxFQUFFLENBQUNVLENBQUMsR0FBR1QsRUFBRSxDQUFDUyxDQUFDLElBQUssQ0FBRSxDQUFDO0lBQ25FLE1BQU1LLEdBQUcsR0FBRyxJQUFJckQsT0FBTyxDQUFFLENBQUV1QyxFQUFFLENBQUNNLENBQUMsR0FBR0wsRUFBRSxDQUFDSyxDQUFDLElBQUssQ0FBQyxFQUFFLENBQUVOLEVBQUUsQ0FBQ1MsQ0FBQyxHQUFHUixFQUFFLENBQUNRLENBQUMsSUFBSyxDQUFFLENBQUM7O0lBRW5FO0lBQ0EsTUFBTU0sSUFBSSxHQUFHLElBQUl0RCxPQUFPLENBQUVvRCxHQUFHLENBQUNQLENBQUMsSUFBS04sRUFBRSxDQUFDUyxDQUFDLEdBQUdWLEVBQUUsQ0FBQ1UsQ0FBQyxDQUFFLEVBQUVJLEdBQUcsQ0FBQ0osQ0FBQyxJQUFLVCxFQUFFLENBQUNNLENBQUMsR0FBR1AsRUFBRSxDQUFDTyxDQUFDLENBQUcsQ0FBQztJQUM1RSxNQUFNVSxJQUFJLEdBQUcsSUFBSXZELE9BQU8sQ0FBRXFELEdBQUcsQ0FBQ1IsQ0FBQyxJQUFLTCxFQUFFLENBQUNRLENBQUMsR0FBR1QsRUFBRSxDQUFDUyxDQUFDLENBQUUsRUFBRUssR0FBRyxDQUFDTCxDQUFDLElBQUtSLEVBQUUsQ0FBQ0ssQ0FBQyxHQUFHTixFQUFFLENBQUNNLENBQUMsQ0FBRyxDQUFDO0lBRTVFLE9BQU9sQyxLQUFLLENBQUMwQixvQkFBb0IsQ0FBRWUsR0FBRyxFQUFFRSxJQUFJLEVBQUVELEdBQUcsRUFBRUUsSUFBSyxDQUFDO0VBQzNELENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsdUJBQXVCQSxDQUFFbEIsRUFBRSxFQUFFQyxFQUFFLEVBQUVDLEVBQUUsRUFBRWlCLENBQUMsRUFBRztJQUN2Q3hDLE1BQU0sSUFBSUEsTUFBTSxDQUFFTixLQUFLLENBQUMrQyxrQkFBa0IsQ0FBRXBCLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFHLENBQUMsR0FBRyxDQUFDLEVBQzFELHNEQUF1RCxDQUFDO0lBRTFELE1BQU1tQixHQUFHLEdBQUdyQixFQUFFLENBQUNPLENBQUMsR0FBR1ksQ0FBQyxDQUFDWixDQUFDO0lBQ3RCLE1BQU1lLEdBQUcsR0FBR3RCLEVBQUUsQ0FBQ1UsQ0FBQyxHQUFHUyxDQUFDLENBQUNULENBQUM7SUFDdEIsTUFBTWEsR0FBRyxHQUFHLENBQUV2QixFQUFFLENBQUNPLENBQUMsR0FBR1ksQ0FBQyxDQUFDWixDQUFDLEtBQU9QLEVBQUUsQ0FBQ08sQ0FBQyxHQUFHWSxDQUFDLENBQUNaLENBQUMsQ0FBRSxHQUFHLENBQUVQLEVBQUUsQ0FBQ1UsQ0FBQyxHQUFHUyxDQUFDLENBQUNULENBQUMsS0FBT1YsRUFBRSxDQUFDVSxDQUFDLEdBQUdTLENBQUMsQ0FBQ1QsQ0FBQyxDQUFFO0lBQzdFLE1BQU1jLEdBQUcsR0FBR3ZCLEVBQUUsQ0FBQ00sQ0FBQyxHQUFHWSxDQUFDLENBQUNaLENBQUM7SUFDdEIsTUFBTWtCLEdBQUcsR0FBR3hCLEVBQUUsQ0FBQ1MsQ0FBQyxHQUFHUyxDQUFDLENBQUNULENBQUM7SUFDdEIsTUFBTWdCLEdBQUcsR0FBRyxDQUFFekIsRUFBRSxDQUFDTSxDQUFDLEdBQUdZLENBQUMsQ0FBQ1osQ0FBQyxLQUFPTixFQUFFLENBQUNNLENBQUMsR0FBR1ksQ0FBQyxDQUFDWixDQUFDLENBQUUsR0FBRyxDQUFFTixFQUFFLENBQUNTLENBQUMsR0FBR1MsQ0FBQyxDQUFDVCxDQUFDLEtBQU9ULEVBQUUsQ0FBQ1MsQ0FBQyxHQUFHUyxDQUFDLENBQUNULENBQUMsQ0FBRTtJQUM3RSxNQUFNaUIsR0FBRyxHQUFHekIsRUFBRSxDQUFDSyxDQUFDLEdBQUdZLENBQUMsQ0FBQ1osQ0FBQztJQUN0QixNQUFNcUIsR0FBRyxHQUFHMUIsRUFBRSxDQUFDUSxDQUFDLEdBQUdTLENBQUMsQ0FBQ1QsQ0FBQztJQUN0QixNQUFNbUIsR0FBRyxHQUFHLENBQUUzQixFQUFFLENBQUNLLENBQUMsR0FBR1ksQ0FBQyxDQUFDWixDQUFDLEtBQU9MLEVBQUUsQ0FBQ0ssQ0FBQyxHQUFHWSxDQUFDLENBQUNaLENBQUMsQ0FBRSxHQUFHLENBQUVMLEVBQUUsQ0FBQ1EsQ0FBQyxHQUFHUyxDQUFDLENBQUNULENBQUMsS0FBT1IsRUFBRSxDQUFDUSxDQUFDLEdBQUdTLENBQUMsQ0FBQ1QsQ0FBQyxDQUFFO0lBRTdFLE1BQU1vQixXQUFXLEdBQUdULEdBQUcsR0FBR0ksR0FBRyxHQUFHSSxHQUFHLEdBQUdQLEdBQUcsR0FBR0ksR0FBRyxHQUFHQyxHQUFHLEdBQUdKLEdBQUcsR0FBR0MsR0FBRyxHQUFHSSxHQUFHLEdBQUdMLEdBQUcsR0FBR0UsR0FBRyxHQUFHRSxHQUFHLEdBQUdMLEdBQUcsR0FBR0UsR0FBRyxHQUFHSyxHQUFHLEdBQUdSLEdBQUcsR0FBR0ssR0FBRyxHQUFHRSxHQUFHO0lBQzdILE9BQU9FLFdBQVcsR0FBRyxDQUFDO0VBQ3hCLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0U7RUFDQUMscUJBQXFCQSxDQUFFQyxNQUFNLEVBQUVDLEdBQUcsRUFBRTdCLE9BQU8sRUFBRztJQUM1Q0EsT0FBTyxHQUFHQSxPQUFPLEtBQUs4QixTQUFTLEdBQUcsSUFBSSxHQUFHOUIsT0FBTzs7SUFFaEQ7SUFDQSxNQUFNK0IsTUFBTSxHQUFHLElBQUl4RSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFFckMsTUFBTXlFLE1BQU0sR0FBR0gsR0FBRyxDQUFDSSxTQUFTO0lBQzVCLE1BQU1DLEdBQUcsR0FBR0wsR0FBRyxDQUFDTSxRQUFRO0lBQ3hCLE1BQU1DLFdBQVcsR0FBR0YsR0FBRyxDQUFDRyxLQUFLLENBQUVOLE1BQU8sQ0FBQzs7SUFFdkM7SUFDQSxNQUFNTyxHQUFHLEdBQUdOLE1BQU0sQ0FBQzNFLEdBQUcsQ0FBRStFLFdBQVksQ0FBQztJQUNyQyxNQUFNRyxpQkFBaUIsR0FBR0gsV0FBVyxDQUFDSSxnQkFBZ0I7SUFDdEQsTUFBTUMsR0FBRyxHQUFHLENBQUMsR0FBR0gsR0FBRyxHQUFHQSxHQUFHLEdBQUcsQ0FBQyxJQUFLQyxpQkFBaUIsR0FBR1gsTUFBTSxHQUFHQSxNQUFNLENBQUU7SUFDdkUsSUFBS2EsR0FBRyxHQUFHekMsT0FBTyxFQUFHO01BQ25CO01BQ0EsT0FBTyxJQUFJO0lBQ2I7SUFFQSxNQUFNMEMsSUFBSSxHQUFHVixNQUFNLENBQUMzRSxHQUFHLENBQUUwRSxNQUFPLENBQUMsR0FBR0MsTUFBTSxDQUFDM0UsR0FBRyxDQUFFNkUsR0FBSSxDQUFDO0lBQ3JELE1BQU1TLEdBQUcsR0FBRy9FLElBQUksQ0FBQ2dGLElBQUksQ0FBRUgsR0FBSSxDQUFDLEdBQUcsQ0FBQzs7SUFFaEM7SUFDQSxNQUFNSSxFQUFFLEdBQUdILElBQUksR0FBR0MsR0FBRzs7SUFFckI7SUFDQSxNQUFNRyxFQUFFLEdBQUdKLElBQUksR0FBR0MsR0FBRztJQUVyQixJQUFLRyxFQUFFLEdBQUc5QyxPQUFPLEVBQUc7TUFDbEI7TUFDQSxPQUFPLElBQUk7SUFDYjtJQUVBLE1BQU0rQyxZQUFZLEdBQUdsQixHQUFHLENBQUNtQixlQUFlLENBQUVGLEVBQUcsQ0FBQztJQUM5QyxNQUFNRyxPQUFPLEdBQUdGLFlBQVksQ0FBQ1YsS0FBSyxDQUFFTixNQUFPLENBQUMsQ0FBQ21CLFVBQVUsQ0FBQyxDQUFDO0lBRXpELElBQUtMLEVBQUUsR0FBRzdDLE9BQU8sRUFBRztNQUNsQjtNQUNBO01BQ0EsT0FBTztRQUNMbUQsUUFBUSxFQUFFTCxFQUFFO1FBQ1pNLFFBQVEsRUFBRUwsWUFBWTtRQUN0Qk0sTUFBTSxFQUFFSixPQUFPLENBQUNLLE9BQU8sQ0FBQyxDQUFDO1FBQ3pCQyxXQUFXLEVBQUU7TUFDZixDQUFDO0lBQ0gsQ0FBQyxNQUNJO01BQ0g7TUFDQSxNQUFNQyxZQUFZLEdBQUczQixHQUFHLENBQUNtQixlQUFlLENBQUVILEVBQUcsQ0FBQztNQUM5QyxNQUFNWSxPQUFPLEdBQUdELFlBQVksQ0FBQ25CLEtBQUssQ0FBRU4sTUFBTyxDQUFDLENBQUNtQixVQUFVLENBQUMsQ0FBQzs7TUFFekQ7TUFDQSxPQUFPO1FBQ0xDLFFBQVEsRUFBRU4sRUFBRTtRQUNaTyxRQUFRLEVBQUVJLFlBQVk7UUFDdEJILE1BQU0sRUFBRUksT0FBTztRQUNmRixXQUFXLEVBQUU7TUFDZixDQUFDO0lBQ0g7RUFDRixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLG9CQUFvQkEsQ0FBRTlFLENBQUMsRUFBRUMsQ0FBQyxFQUFHO0lBQzNCLElBQUtELENBQUMsS0FBSyxDQUFDLEVBQUc7TUFDYixJQUFLQyxDQUFDLEtBQUssQ0FBQyxFQUFHO1FBQ2IsT0FBTyxJQUFJO01BQ2IsQ0FBQyxNQUNJO1FBQ0gsT0FBTyxFQUFFO01BQ1g7SUFDRixDQUFDLE1BQ0k7TUFDSCxPQUFPLENBQUUsQ0FBQ0EsQ0FBQyxHQUFHRCxDQUFDLENBQUU7SUFDbkI7RUFDRixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFK0UsdUJBQXVCQSxDQUFFL0UsQ0FBQyxFQUFFQyxDQUFDLEVBQUUrRSxDQUFDLEVBQUc7SUFDakM7SUFDQTtJQUNBLE1BQU01RCxPQUFPLEdBQUcsR0FBRztJQUNuQixJQUFLcEIsQ0FBQyxLQUFLLENBQUMsSUFBSWhCLElBQUksQ0FBQzRCLEdBQUcsQ0FBRVgsQ0FBQyxHQUFHRCxDQUFFLENBQUMsR0FBR29CLE9BQU8sSUFBSXBDLElBQUksQ0FBQzRCLEdBQUcsQ0FBRW9FLENBQUMsR0FBR2hGLENBQUUsQ0FBQyxHQUFHb0IsT0FBTyxFQUFHO01BQzNFLE9BQU8vQixLQUFLLENBQUN5RixvQkFBb0IsQ0FBRTdFLENBQUMsRUFBRStFLENBQUUsQ0FBQztJQUMzQztJQUVBLE1BQU1DLFlBQVksR0FBR2hGLENBQUMsR0FBR0EsQ0FBQyxHQUFHLENBQUMsR0FBR0QsQ0FBQyxHQUFHZ0YsQ0FBQztJQUN0QyxJQUFLQyxZQUFZLEdBQUcsQ0FBQyxFQUFHO01BQ3RCLE9BQU8sRUFBRTtJQUNYO0lBQ0EsTUFBTWpCLElBQUksR0FBR2hGLElBQUksQ0FBQ2dGLElBQUksQ0FBRWlCLFlBQWEsQ0FBQztJQUN0QztJQUNBO0lBQ0EsT0FBTyxDQUNMLENBQUUsQ0FBQ2hGLENBQUMsR0FBRytELElBQUksS0FBTyxDQUFDLEdBQUdoRSxDQUFDLENBQUUsRUFDekIsQ0FBRSxDQUFDQyxDQUFDLEdBQUcrRCxJQUFJLEtBQU8sQ0FBQyxHQUFHaEUsQ0FBQyxDQUFFLENBQzFCO0VBQ0gsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VrRixtQkFBbUJBLENBQUVsRixDQUFDLEVBQUVDLENBQUMsRUFBRStFLENBQUMsRUFBRUcsQ0FBQyxFQUFFQyxxQkFBcUIsR0FBRyxJQUFJLEVBQUc7SUFFOUQsSUFBSUMsS0FBSzs7SUFFVDs7SUFFQTtJQUNBLElBQUtyRixDQUFDLEtBQUssQ0FBQyxFQUFHO01BQ2JxRixLQUFLLEdBQUdoRyxLQUFLLENBQUMwRix1QkFBdUIsQ0FBRTlFLENBQUMsRUFBRStFLENBQUMsRUFBRUcsQ0FBRSxDQUFDO0lBQ2xELENBQUMsTUFDSTtNQUNIO01BQ0EsTUFBTS9ELE9BQU8sR0FBRyxHQUFHO01BRW5CLElBQUtwQixDQUFDLEtBQUssQ0FBQyxJQUFJaEIsSUFBSSxDQUFDNEIsR0FBRyxDQUFFWCxDQUFDLEdBQUdELENBQUUsQ0FBQyxHQUFHb0IsT0FBTyxJQUFJcEMsSUFBSSxDQUFDNEIsR0FBRyxDQUFFb0UsQ0FBQyxHQUFHaEYsQ0FBRSxDQUFDLEdBQUdvQixPQUFPLElBQUlwQyxJQUFJLENBQUM0QixHQUFHLENBQUV1RSxDQUFDLEdBQUduRixDQUFFLENBQUMsR0FBR29CLE9BQU8sRUFBRztRQUMxR2lFLEtBQUssR0FBR2hHLEtBQUssQ0FBQzBGLHVCQUF1QixDQUFFOUUsQ0FBQyxFQUFFK0UsQ0FBQyxFQUFFRyxDQUFFLENBQUM7TUFDbEQsQ0FBQyxNQUNJO1FBQ0gsSUFBS0EsQ0FBQyxLQUFLLENBQUMsSUFBSW5HLElBQUksQ0FBQzRCLEdBQUcsQ0FBRVosQ0FBQyxHQUFHbUYsQ0FBRSxDQUFDLEdBQUcvRCxPQUFPLElBQUlwQyxJQUFJLENBQUM0QixHQUFHLENBQUVYLENBQUMsR0FBR2tGLENBQUUsQ0FBQyxHQUFHL0QsT0FBTyxJQUFJcEMsSUFBSSxDQUFDNEIsR0FBRyxDQUFFb0UsQ0FBQyxHQUFHRyxDQUFFLENBQUMsR0FBRy9ELE9BQU8sRUFBRztVQUMxR2lFLEtBQUssR0FBRyxDQUFFLENBQUMsQ0FBRSxDQUFDQyxNQUFNLENBQUVqRyxLQUFLLENBQUMwRix1QkFBdUIsQ0FBRS9FLENBQUMsRUFBRUMsQ0FBQyxFQUFFK0UsQ0FBRSxDQUFFLENBQUM7UUFDbEUsQ0FBQyxNQUNJO1VBQ0gvRSxDQUFDLElBQUlELENBQUM7VUFDTmdGLENBQUMsSUFBSWhGLENBQUM7VUFDTm1GLENBQUMsSUFBSW5GLENBQUM7VUFFTixNQUFNdUYsQ0FBQyxHQUFHLENBQUUsR0FBRyxHQUFHUCxDQUFDLEdBQUsvRSxDQUFDLEdBQUdBLENBQUcsSUFBSyxDQUFDO1VBQ3JDLE1BQU11RixDQUFDLEdBQUcsQ0FBRSxFQUFHLEVBQUUsR0FBR0wsQ0FBQyxDQUFFLEdBQUdsRixDQUFDLElBQUssQ0FBQyxHQUFHK0UsQ0FBQyxHQUFHLENBQUMsSUFBSy9FLENBQUMsR0FBR0EsQ0FBQyxDQUFFLENBQUUsSUFBSyxFQUFFO1VBQzlELE1BQU1nRixZQUFZLEdBQUdNLENBQUMsR0FBR0EsQ0FBQyxHQUFHQSxDQUFDLEdBQUdDLENBQUMsR0FBR0EsQ0FBQztVQUN0QyxNQUFNQyxFQUFFLEdBQUd4RixDQUFDLEdBQUcsQ0FBQztVQUVoQixJQUFLZ0YsWUFBWSxHQUFHRyxxQkFBcUIsRUFBRztZQUMxQztZQUNBLE1BQU1NLEtBQUssR0FBRzFHLElBQUksQ0FBQ2dGLElBQUksQ0FBRWlCLFlBQWEsQ0FBQztZQUN2Q0ksS0FBSyxHQUFHLENBQUVoRyxLQUFLLENBQUNzRyxRQUFRLENBQUVILENBQUMsR0FBR0UsS0FBTSxDQUFDLEdBQUdyRyxLQUFLLENBQUNzRyxRQUFRLENBQUVILENBQUMsR0FBR0UsS0FBTSxDQUFDLEdBQUdELEVBQUUsQ0FBRTtVQUM1RSxDQUFDLE1BQ0ksSUFBS1IsWUFBWSxHQUFHLENBQUNHLHFCQUFxQixFQUFHO1lBQUU7WUFDbEQ7WUFDQSxNQUFNUSxLQUFLLEdBQUd2RyxLQUFLLENBQUNzRyxRQUFRLENBQUVILENBQUUsQ0FBQztZQUNqQyxNQUFNSyxVQUFVLEdBQUcsQ0FBQ0osRUFBRSxHQUFHRyxLQUFLO1lBQzlCUCxLQUFLLEdBQUcsQ0FBRSxDQUFDSSxFQUFFLEdBQUcsQ0FBQyxHQUFHRyxLQUFLLEVBQUVDLFVBQVUsRUFBRUEsVUFBVSxDQUFFO1VBQ3JELENBQUMsTUFDSTtZQUNIO1lBQ0EsSUFBSUMsRUFBRSxHQUFHLENBQUNQLENBQUMsR0FBR0EsQ0FBQyxHQUFHQSxDQUFDO1lBQ25CTyxFQUFFLEdBQUc5RyxJQUFJLENBQUMrRyxJQUFJLENBQUVQLENBQUMsR0FBR3hHLElBQUksQ0FBQ2dGLElBQUksQ0FBRThCLEVBQUcsQ0FBRSxDQUFDO1lBQ3JDLE1BQU1FLEVBQUUsR0FBRyxDQUFDLEdBQUdoSCxJQUFJLENBQUNnRixJQUFJLENBQUUsQ0FBQ3VCLENBQUUsQ0FBQztZQUM5QkYsS0FBSyxHQUFHLENBQ04sQ0FBQ0ksRUFBRSxHQUFHTyxFQUFFLEdBQUdoSCxJQUFJLENBQUNpSCxHQUFHLENBQUVILEVBQUUsR0FBRyxDQUFFLENBQUMsRUFDN0IsQ0FBQ0wsRUFBRSxHQUFHTyxFQUFFLEdBQUdoSCxJQUFJLENBQUNpSCxHQUFHLENBQUUsQ0FBRUgsRUFBRSxHQUFHLENBQUMsR0FBRzlHLElBQUksQ0FBQ0MsRUFBRSxJQUFLLENBQUUsQ0FBQyxFQUMvQyxDQUFDd0csRUFBRSxHQUFHTyxFQUFFLEdBQUdoSCxJQUFJLENBQUNpSCxHQUFHLENBQUUsQ0FBRUgsRUFBRSxHQUFHLENBQUMsR0FBRzlHLElBQUksQ0FBQ0MsRUFBRSxJQUFLLENBQUUsQ0FBQyxDQUNoRDtVQUNIO1FBQ0Y7TUFDRjtJQUNGO0lBRUFVLE1BQU0sSUFBSTBGLEtBQUssSUFBSUEsS0FBSyxDQUFDYSxPQUFPLENBQUVDLElBQUksSUFBSXhHLE1BQU0sQ0FBRXlHLFFBQVEsQ0FBRUQsSUFBSyxDQUFDLEVBQUUseURBQTBELENBQUUsQ0FBQztJQUVqSSxPQUFPZCxLQUFLO0VBQ2QsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VNLFFBQVFBLENBQUVwRSxDQUFDLEVBQUc7SUFDWixPQUFPQSxDQUFDLElBQUksQ0FBQyxHQUFHdkMsSUFBSSxDQUFDcUgsR0FBRyxDQUFFOUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFFLENBQUMsR0FBRyxDQUFDdkMsSUFBSSxDQUFDcUgsR0FBRyxDQUFFLENBQUM5RSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUUsQ0FBQztFQUMvRCxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UrRSxNQUFNQSxDQUFFQyxFQUFFLEVBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFFLEVBQUVDLEVBQUUsRUFBRztJQUMzQmhILE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU9nSCxFQUFFLEtBQUssUUFBUSxFQUFFLHNDQUF1QyxDQUFDO0lBQ2xGLE9BQU8sQ0FBRUQsRUFBRSxHQUFHRCxFQUFFLEtBQU9ELEVBQUUsR0FBR0QsRUFBRSxDQUFFLElBQUtJLEVBQUUsR0FBR0osRUFBRSxDQUFFLEdBQUdFLEVBQUU7RUFDckQsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRTNGLGNBQWNBLENBQUV2QixLQUFLLEVBQUc7SUFDdEIsT0FBTyxDQUFJQSxLQUFLLEdBQUcsQ0FBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBS1AsSUFBSSxDQUFDNEgsS0FBSyxDQUFFNUgsSUFBSSxDQUFDNEIsR0FBRyxDQUFFckIsS0FBTSxDQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ3ZFLENBQUM7O0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VzSCxPQUFPQSxDQUFFdEgsS0FBSyxFQUFFdUgsYUFBYSxFQUFHO0lBQzlCLE1BQU1DLFVBQVUsR0FBRy9ILElBQUksQ0FBQ3FILEdBQUcsQ0FBRSxFQUFFLEVBQUVTLGFBQWMsQ0FBQztJQUNoRCxNQUFNRSxRQUFRLEdBQUczSCxLQUFLLENBQUN5QixjQUFjLENBQUV2QixLQUFLLEdBQUd3SCxVQUFXLENBQUMsR0FBR0EsVUFBVTtJQUN4RSxPQUFPQyxRQUFRLENBQUNILE9BQU8sQ0FBRUMsYUFBYyxDQUFDLENBQUMsQ0FBQztFQUM1QyxDQUFDOztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxhQUFhQSxDQUFFMUgsS0FBSyxFQUFFdUgsYUFBYSxFQUFHO0lBQ3BDLE9BQU9JLFVBQVUsQ0FBRTdILEtBQUssQ0FBQ3dILE9BQU8sQ0FBRXRILEtBQUssRUFBRXVILGFBQWMsQ0FBRSxDQUFDO0VBQzVELENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VLLGFBQWFBLENBQUVuSCxDQUFDLEVBQUVDLENBQUMsRUFBRW1CLE9BQU8sRUFBRztJQUM3QixPQUFPcEMsSUFBSSxDQUFDNEIsR0FBRyxDQUFFWixDQUFDLEdBQUdDLENBQUUsQ0FBQyxJQUFJbUIsT0FBTztFQUNyQyxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VnRyx1QkFBdUJBLENBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFFLEVBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFFLEVBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFHO0lBRXhEO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxNQUFNQyxHQUFHLEdBQUdBLENBQUU3SCxDQUFDLEVBQUVDLENBQUMsRUFBRStFLENBQUMsRUFBRUcsQ0FBQyxFQUFFMkMsQ0FBQyxFQUFFQyxDQUFDLEtBQU0sQ0FBRUEsQ0FBQyxHQUFHOUgsQ0FBQyxLQUFPK0UsQ0FBQyxHQUFHaEYsQ0FBQyxDQUFFLEdBQUcsQ0FBRW1GLENBQUMsR0FBR2xGLENBQUMsS0FBTzZILENBQUMsR0FBRzlILENBQUMsQ0FBRTs7SUFFakY7SUFDQTtJQUNBO0lBQ0EsSUFBSzZILEdBQUcsQ0FBRVIsRUFBRSxFQUFFQyxFQUFFLEVBQUVHLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFFLEVBQUVDLEVBQUcsQ0FBQyxHQUFHQyxHQUFHLENBQUVOLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFFLEVBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFHLENBQUMsR0FBRyxDQUFDLElBQ2pFQyxHQUFHLENBQUVKLEVBQUUsRUFBRUMsRUFBRSxFQUFFTCxFQUFFLEVBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFHLENBQUMsR0FBR0ssR0FBRyxDQUFFRixFQUFFLEVBQUVDLEVBQUUsRUFBRVAsRUFBRSxFQUFFQyxFQUFFLEVBQUVDLEVBQUUsRUFBRUMsRUFBRyxDQUFDLEdBQUcsQ0FBQyxFQUNwRTtNQUNBLE9BQU8sSUFBSTtJQUNiO0lBRUEsTUFBTTVGLEtBQUssR0FBRyxDQUFFeUYsRUFBRSxHQUFHRSxFQUFFLEtBQU9HLEVBQUUsR0FBR0UsRUFBRSxDQUFFLEdBQUcsQ0FBRU4sRUFBRSxHQUFHRSxFQUFFLEtBQU9DLEVBQUUsR0FBR0UsRUFBRSxDQUFFO0lBQ25FO0lBQ0EsSUFBSzNJLElBQUksQ0FBQzRCLEdBQUcsQ0FBRWdCLEtBQU0sQ0FBQyxHQUFHLEtBQUssRUFBRztNQUMvQixPQUFPLElBQUk7SUFDYjs7SUFFQTtJQUNBLElBQU95RixFQUFFLEtBQUtJLEVBQUUsSUFBSUgsRUFBRSxLQUFLSSxFQUFFLElBQVFMLEVBQUUsS0FBS00sRUFBRSxJQUFJTCxFQUFFLEtBQUtNLEVBQUksRUFBRztNQUM5RCxPQUFPLElBQUlsSixPQUFPLENBQUUySSxFQUFFLEVBQUVDLEVBQUcsQ0FBQztJQUM5QixDQUFDLE1BQ0ksSUFBT0MsRUFBRSxLQUFLRSxFQUFFLElBQUlELEVBQUUsS0FBS0UsRUFBRSxJQUFRSCxFQUFFLEtBQUtJLEVBQUUsSUFBSUgsRUFBRSxLQUFLSSxFQUFJLEVBQUc7TUFDbkUsT0FBTyxJQUFJbEosT0FBTyxDQUFFNkksRUFBRSxFQUFFQyxFQUFHLENBQUM7SUFDOUI7O0lBRUE7SUFDQSxNQUFNUSxhQUFhLEdBQUcsQ0FBRSxDQUFFWCxFQUFFLEdBQUdHLEVBQUUsR0FBR0YsRUFBRSxHQUFHQyxFQUFFLEtBQU9FLEVBQUUsR0FBR0UsRUFBRSxDQUFFLEdBQUcsQ0FBRU4sRUFBRSxHQUFHRSxFQUFFLEtBQU9FLEVBQUUsR0FBR0csRUFBRSxHQUFHRixFQUFFLEdBQUdDLEVBQUUsQ0FBRSxJQUFLL0YsS0FBSztJQUMzRyxNQUFNcUcsYUFBYSxHQUFHLENBQUUsQ0FBRVosRUFBRSxHQUFHRyxFQUFFLEdBQUdGLEVBQUUsR0FBR0MsRUFBRSxLQUFPRyxFQUFFLEdBQUdFLEVBQUUsQ0FBRSxHQUFHLENBQUVOLEVBQUUsR0FBR0UsRUFBRSxLQUFPQyxFQUFFLEdBQUdHLEVBQUUsR0FBR0YsRUFBRSxHQUFHQyxFQUFFLENBQUUsSUFBSy9GLEtBQUs7SUFDM0csT0FBTyxJQUFJbEQsT0FBTyxDQUFFc0osYUFBYSxFQUFFQyxhQUFjLENBQUM7RUFDcEQsQ0FBQztFQUdEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLG9CQUFvQkEsQ0FBRUMsS0FBSyxFQUFFbkksQ0FBQyxFQUFFQyxDQUFDLEVBQUc7SUFDbEM7SUFDQSxNQUFNbUksb0JBQW9CLEdBQUdwSSxDQUFDLENBQUNxSSxlQUFlLENBQUVwSSxDQUFFLENBQUM7O0lBRW5EO0lBQ0EsSUFBS21JLG9CQUFvQixLQUFLLENBQUMsRUFBRztNQUFFLE9BQU9ELEtBQUssQ0FBQ0UsZUFBZSxDQUFFckksQ0FBRSxDQUFDO0lBQUU7O0lBRXZFO0lBQ0EsTUFBTXNJLENBQUMsR0FBRyxDQUFFLENBQUVILEtBQUssQ0FBQzVHLENBQUMsR0FBR3ZCLENBQUMsQ0FBQ3VCLENBQUMsS0FBT3RCLENBQUMsQ0FBQ3NCLENBQUMsR0FBR3ZCLENBQUMsQ0FBQ3VCLENBQUMsQ0FBRSxHQUFHLENBQUU0RyxLQUFLLENBQUN6RyxDQUFDLEdBQUcxQixDQUFDLENBQUMwQixDQUFDLEtBQU96QixDQUFDLENBQUN5QixDQUFDLEdBQUcxQixDQUFDLENBQUMwQixDQUFDLENBQUUsSUFBSzBHLG9CQUFvQjtJQUUxRyxJQUFJQyxlQUFlO0lBRW5CLElBQUtDLENBQUMsR0FBRyxDQUFDLEVBQUc7TUFDWDtNQUNBRCxlQUFlLEdBQUdGLEtBQUssQ0FBQ0UsZUFBZSxDQUFFckksQ0FBRSxDQUFDO0lBQzlDLENBQUMsTUFDSSxJQUFLc0ksQ0FBQyxHQUFHLENBQUMsRUFBRztNQUNoQjtNQUNBRCxlQUFlLEdBQUdGLEtBQUssQ0FBQ0UsZUFBZSxDQUFFcEksQ0FBRSxDQUFDO0lBQzlDLENBQUMsTUFDSTtNQUNIO01BQ0FvSSxlQUFlLEdBQUdGLEtBQUssQ0FBQ0UsZUFBZSxDQUFFLElBQUkzSixPQUFPLENBQUVzQixDQUFDLENBQUN1QixDQUFDLEdBQUcrRyxDQUFDLElBQUtySSxDQUFDLENBQUNzQixDQUFDLEdBQUd2QixDQUFDLENBQUN1QixDQUFDLENBQUUsRUFBRXZCLENBQUMsQ0FBQzBCLENBQUMsR0FBRzRHLENBQUMsSUFBS3JJLENBQUMsQ0FBQ3lCLENBQUMsR0FBRzFCLENBQUMsQ0FBQzBCLENBQUMsQ0FBRyxDQUFFLENBQUM7SUFDNUc7SUFFQSxPQUFPMkcsZUFBZTtFQUV4QixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLGFBQWFBLENBQUVKLEtBQUssRUFBRW5JLENBQUMsRUFBRUMsQ0FBQyxFQUFHO0lBQzNCLE9BQU9qQixJQUFJLENBQUNnRixJQUFJLENBQUUsSUFBSSxDQUFDa0Usb0JBQW9CLENBQUVDLEtBQUssRUFBRW5JLENBQUMsRUFBRUMsQ0FBRSxDQUFFLENBQUM7RUFDOUQsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0V1SSxrQkFBa0JBLENBQUV4SSxDQUFDLEVBQUVDLENBQUMsRUFBRStFLENBQUMsRUFBRTVELE9BQU8sRUFBRztJQUNyQyxJQUFLQSxPQUFPLEtBQUs4QixTQUFTLEVBQUc7TUFDM0I5QixPQUFPLEdBQUcsQ0FBQztJQUNiO0lBQ0EsT0FBTy9CLEtBQUssQ0FBQ29KLFlBQVksQ0FBRXpJLENBQUMsRUFBRUMsQ0FBQyxFQUFFK0UsQ0FBRSxDQUFDLElBQUk1RCxPQUFPO0VBQ2pELENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRXFILFlBQVlBLENBQUV6SSxDQUFDLEVBQUVDLENBQUMsRUFBRStFLENBQUMsRUFBRztJQUN0QixPQUFPaEcsSUFBSSxDQUFDNEIsR0FBRyxDQUFFdkIsS0FBSyxDQUFDK0Msa0JBQWtCLENBQUVwQyxDQUFDLEVBQUVDLENBQUMsRUFBRStFLENBQUUsQ0FBRSxDQUFDO0VBQ3hELENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFNUMsa0JBQWtCQSxDQUFFcEMsQ0FBQyxFQUFFQyxDQUFDLEVBQUUrRSxDQUFDLEVBQUc7SUFDNUIsT0FBT2hGLENBQUMsQ0FBQ3VCLENBQUMsSUFBS3RCLENBQUMsQ0FBQ3lCLENBQUMsR0FBR3NELENBQUMsQ0FBQ3RELENBQUMsQ0FBRSxHQUFHekIsQ0FBQyxDQUFDc0IsQ0FBQyxJQUFLeUQsQ0FBQyxDQUFDdEQsQ0FBQyxHQUFHMUIsQ0FBQyxDQUFDMEIsQ0FBQyxDQUFFLEdBQUdzRCxDQUFDLENBQUN6RCxDQUFDLElBQUt2QixDQUFDLENBQUMwQixDQUFDLEdBQUd6QixDQUFDLENBQUN5QixDQUFDLENBQUU7RUFDeEUsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWdILGlCQUFpQkEsQ0FBRUMsUUFBUSxFQUFHO0lBQzVCLE1BQU1DLFFBQVEsR0FBRyxJQUFJbEssT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFFcEMsSUFBSW1LLElBQUksR0FBRyxDQUFDO0lBQ1pGLFFBQVEsQ0FBQ3pDLE9BQU8sQ0FBRSxDQUFFNEMsRUFBRSxFQUFFMUksQ0FBQyxLQUFNO01BQzdCLE1BQU0ySSxFQUFFLEdBQUdKLFFBQVEsQ0FBRSxDQUFFdkksQ0FBQyxHQUFHLENBQUMsSUFBS3VJLFFBQVEsQ0FBQ0ssTUFBTSxDQUFFO01BQ2xELE1BQU1DLGNBQWMsR0FBR0gsRUFBRSxDQUFDdkgsQ0FBQyxHQUFHd0gsRUFBRSxDQUFDckgsQ0FBQyxHQUFHcUgsRUFBRSxDQUFDeEgsQ0FBQyxHQUFHdUgsRUFBRSxDQUFDcEgsQ0FBQztNQUVoRG1ILElBQUksSUFBSUksY0FBYyxHQUFHLENBQUM7O01BRTFCO01BQ0FMLFFBQVEsQ0FBQ00sS0FBSyxDQUNaLENBQUVKLEVBQUUsQ0FBQ3ZILENBQUMsR0FBR3dILEVBQUUsQ0FBQ3hILENBQUMsSUFBSzBILGNBQWMsRUFDaEMsQ0FBRUgsRUFBRSxDQUFDcEgsQ0FBQyxHQUFHcUgsRUFBRSxDQUFDckgsQ0FBQyxJQUFLdUgsY0FDcEIsQ0FBQztJQUNILENBQUUsQ0FBQztJQUNITCxRQUFRLENBQUNPLFlBQVksQ0FBRSxDQUFDLEdBQUdOLElBQUssQ0FBQztJQUVqQyxPQUFPRCxRQUFRO0VBQ2pCLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFUSxJQUFJQSxDQUFFN0osS0FBSyxFQUFHO0lBQ1osT0FBTyxDQUFFUCxJQUFJLENBQUNxSyxHQUFHLENBQUU5SixLQUFNLENBQUMsR0FBR1AsSUFBSSxDQUFDcUssR0FBRyxDQUFFLENBQUM5SixLQUFNLENBQUMsSUFBSyxDQUFDO0VBQ3ZELENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFK0osSUFBSUEsQ0FBRS9KLEtBQUssRUFBRztJQUNaLE9BQU8sQ0FBRVAsSUFBSSxDQUFDcUssR0FBRyxDQUFFOUosS0FBTSxDQUFDLEdBQUdQLElBQUksQ0FBQ3FLLEdBQUcsQ0FBRSxDQUFDOUosS0FBTSxDQUFDLElBQUssQ0FBQztFQUN2RCxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWdLLEtBQUtBLENBQUVDLEdBQUcsRUFBRztJQUNYLE9BQU94SyxJQUFJLENBQUN5SyxHQUFHLENBQUVELEdBQUksQ0FBQyxHQUFHeEssSUFBSSxDQUFDMEssSUFBSTtFQUNwQyxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsa0JBQWtCQSxDQUFFQyxFQUFFLEVBQUVDLEtBQUssRUFBRUMsTUFBTSxFQUFHO0lBQ3RDNUssUUFBUSxHQUFHLENBQUNBLFFBQVE7SUFFcEIsSUFBSyxDQUFDQSxRQUFRLEVBQUc7TUFDZixPQUFPRSxFQUFFLEdBQUd5SyxLQUFLLEdBQUdELEVBQUU7SUFDeEI7SUFFQSxJQUFJRyxFQUFFO0lBQ04sSUFBSUMsRUFBRTtJQUNOLEdBQUc7TUFDREQsRUFBRSxHQUFHRCxNQUFNLENBQUNHLFVBQVUsQ0FBQyxDQUFDO01BQ3hCRCxFQUFFLEdBQUdGLE1BQU0sQ0FBQ0csVUFBVSxDQUFDLENBQUM7SUFDMUIsQ0FBQyxRQUNPRixFQUFFLElBQUluTCxPQUFPO0lBRXJCTyxFQUFFLEdBQUdILElBQUksQ0FBQ2dGLElBQUksQ0FBRSxDQUFDLEdBQUcsR0FBR2hGLElBQUksQ0FBQ3lLLEdBQUcsQ0FBRU0sRUFBRyxDQUFFLENBQUMsR0FBRy9LLElBQUksQ0FBQ2lILEdBQUcsQ0FBRWxILE1BQU0sR0FBR2lMLEVBQUcsQ0FBQztJQUNqRTVLLEVBQUUsR0FBR0osSUFBSSxDQUFDZ0YsSUFBSSxDQUFFLENBQUMsR0FBRyxHQUFHaEYsSUFBSSxDQUFDeUssR0FBRyxDQUFFTSxFQUFHLENBQUUsQ0FBQyxHQUFHL0ssSUFBSSxDQUFDa0wsR0FBRyxDQUFFbkwsTUFBTSxHQUFHaUwsRUFBRyxDQUFDO0lBQ2pFLE9BQU83SyxFQUFFLEdBQUcwSyxLQUFLLEdBQUdELEVBQUU7RUFDeEIsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VPLHFCQUFxQkEsQ0FBRTVLLEtBQUssRUFBRztJQUM3QkksTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT0osS0FBSyxLQUFLLFFBQVEsSUFBSTZHLFFBQVEsQ0FBRTdHLEtBQU0sQ0FBQyxFQUFHLGlDQUFnQ0EsS0FBTSxFQUFFLENBQUM7SUFDNUcsSUFBS1AsSUFBSSxDQUFDb0wsS0FBSyxDQUFFN0ssS0FBTSxDQUFDLEtBQUtBLEtBQUssRUFBRztNQUNuQyxPQUFPLENBQUM7SUFDVixDQUFDLE1BQ0k7TUFDSCxNQUFNOEssTUFBTSxHQUFHOUssS0FBSyxDQUFDK0ssUUFBUSxDQUFDLENBQUM7O01BRS9CO01BQ0EsSUFBS0QsTUFBTSxDQUFDRSxRQUFRLENBQUUsR0FBSSxDQUFDLEVBQUc7UUFDNUI7UUFDQSxNQUFNQyxLQUFLLEdBQUdILE1BQU0sQ0FBQ0csS0FBSyxDQUFFLEdBQUksQ0FBQztRQUNqQyxNQUFNQyxRQUFRLEdBQUdELEtBQUssQ0FBRSxDQUFDLENBQUUsQ0FBQyxDQUFDO1FBQzdCLE1BQU1FLFFBQVEsR0FBRzdMLE1BQU0sQ0FBRTJMLEtBQUssQ0FBRSxDQUFDLENBQUcsQ0FBQyxDQUFDLENBQUM7O1FBRXZDO1FBQ0EsTUFBTUcscUJBQXFCLEdBQUdGLFFBQVEsQ0FBQ0YsUUFBUSxDQUFFLEdBQUksQ0FBQyxHQUFHRSxRQUFRLENBQUNELEtBQUssQ0FBRSxHQUFJLENBQUMsQ0FBRSxDQUFDLENBQUUsQ0FBQ3hCLE1BQU0sR0FBRyxDQUFDOztRQUU5RjtRQUNBO1FBQ0EsT0FBT2hLLElBQUksQ0FBQ1MsR0FBRyxDQUFFa0wscUJBQXFCLEdBQUdELFFBQVEsRUFBRSxDQUFFLENBQUM7TUFDeEQsQ0FBQyxNQUNJO1FBQUU7UUFDTCxPQUFPTCxNQUFNLENBQUNHLEtBQUssQ0FBRSxHQUFJLENBQUMsQ0FBRSxDQUFDLENBQUUsQ0FBQ3hCLE1BQU07TUFDeEM7SUFDRjtFQUNGLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0U0QixlQUFlQSxDQUFFckwsS0FBSyxFQUFFc0wsUUFBUSxFQUFHO0lBQ2pDLE9BQU94TCxLQUFLLENBQUM0SCxhQUFhLENBQUU1SCxLQUFLLENBQUN5QixjQUFjLENBQUV2QixLQUFLLEdBQUdzTCxRQUFTLENBQUMsR0FBR0EsUUFBUSxFQUM3RXhMLEtBQUssQ0FBQzhLLHFCQUFxQixDQUFFVSxRQUFTLENBQUUsQ0FBQztFQUM3QztBQUNGLENBQUM7QUFDRHBNLEdBQUcsQ0FBQ3FNLFFBQVEsQ0FBRSxPQUFPLEVBQUV6TCxLQUFNLENBQUM7O0FBRTlCO0FBQ0FaLEdBQUcsQ0FBQ2EsS0FBSyxHQUFHRCxLQUFLLENBQUNDLEtBQUs7QUFDdkJiLEdBQUcsQ0FBQ2lCLGlCQUFpQixHQUFHTCxLQUFLLENBQUNLLGlCQUFpQjtBQUMvQ2pCLEdBQUcsQ0FBQ3FCLGVBQWUsR0FBR1QsS0FBSyxDQUFDUyxlQUFlO0FBQzNDckIsR0FBRyxDQUFDc0IsY0FBYyxHQUFHVixLQUFLLENBQUNVLGNBQWM7QUFDekN0QixHQUFHLENBQUM0QixjQUFjLEdBQUdoQixLQUFLLENBQUNnQixjQUFjO0FBQ3pDNUIsR0FBRyxDQUFDNkIsU0FBUyxHQUFHakIsS0FBSyxDQUFDaUIsU0FBUztBQUMvQjdCLEdBQUcsQ0FBQytCLFNBQVMsR0FBR25CLEtBQUssQ0FBQ21CLFNBQVM7QUFDL0IvQixHQUFHLENBQUNzQyxvQkFBb0IsR0FBRzFCLEtBQUssQ0FBQzBCLG9CQUFvQjtBQUNyRHRDLEdBQUcsQ0FBQzJJLHVCQUF1QixHQUFHL0gsS0FBSyxDQUFDK0gsdUJBQXVCO0FBQzNEM0ksR0FBRyxDQUFDc0UscUJBQXFCLEdBQUcxRCxLQUFLLENBQUMwRCxxQkFBcUI7QUFDdkR0RSxHQUFHLENBQUNzRyx1QkFBdUIsR0FBRzFGLEtBQUssQ0FBQzBGLHVCQUF1QjtBQUMzRHRHLEdBQUcsQ0FBQ3lHLG1CQUFtQixHQUFHN0YsS0FBSyxDQUFDNkYsbUJBQW1CO0FBQ25EekcsR0FBRyxDQUFDa0gsUUFBUSxHQUFHdEcsS0FBSyxDQUFDc0csUUFBUTtBQUM3QmxILEdBQUcsQ0FBQzZILE1BQU0sR0FBR2pILEtBQUssQ0FBQ2lILE1BQU07QUFDekI3SCxHQUFHLENBQUNrTCxrQkFBa0IsR0FBR3RLLEtBQUssQ0FBQ3NLLGtCQUFrQjtBQUVqRCxlQUFldEssS0FBSyJ9