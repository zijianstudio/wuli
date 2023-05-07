// Copyright 2013-2023, University of Colorado Boulder

/**
 * Basic 2-dimensional vector, represented as (x,y).  Values can be numeric, or NaN or infinite.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Pool from '../../phet-core/js/Pool.js';
import IOType from '../../tandem/js/types/IOType.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import dot from './dot.js';
import Utils from './Utils.js';
import Vector3 from './Vector3.js';
const ADDING_ACCUMULATOR = (vector, nextVector) => {
  return vector.add(nextVector);
};
export default class Vector2 {
  // The X coordinate of the vector.

  // The Y coordinate of the vector.

  /**
   * Creates a 2-dimensional vector with the specified X and Y values.
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * The magnitude (Euclidean/L2 Norm) of this vector, i.e. $\sqrt{x^2+y^2}$.
   */
  getMagnitude() {
    return Math.sqrt(this.magnitudeSquared);
  }
  get magnitude() {
    return this.getMagnitude();
  }

  /**
   * The squared magnitude (square of the Euclidean/L2 Norm) of this vector, i.e. $x^2+y^2$.
   */
  getMagnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }
  get magnitudeSquared() {
    return this.getMagnitudeSquared();
  }

  /**
   * The Euclidean distance between this vector (treated as a point) and another point.
   */
  distance(point) {
    return Math.sqrt(this.distanceSquared(point));
  }

  /**
   * The Euclidean distance between this vector (treated as a point) and another point (x,y).
   */
  distanceXY(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * The squared Euclidean distance between this vector (treated as a point) and another point.
   */
  distanceSquared(point) {
    const dx = this.x - point.x;
    const dy = this.y - point.y;
    return dx * dx + dy * dy;
  }

  /**
   * The squared Euclidean distance between this vector (treated as a point) and another point with coordinates (x,y).
   */
  distanceSquaredXY(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return dx * dx + dy * dy;
  }

  /**
   * The dot-product (Euclidean inner product) between this vector and another vector v.
   */
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * The dot-product (Euclidean inner product) between this vector and another vector (x,y).
   */
  dotXY(x, y) {
    return this.x * x + this.y * y;
  }

  /**
   * The angle $\theta$ of this vector, such that this vector is equal to
   * $$ u = \begin{bmatrix} r\cos\theta \\ r\sin\theta \end{bmatrix} $$
   * for the magnitude $r \ge 0$ of the vector, with $\theta\in(-\pi,\pi]$
   */
  getAngle() {
    return Math.atan2(this.y, this.x);
  }
  get angle() {
    return this.getAngle();
  }

  /**
   * The angle between this vector and another vector, in the range $\theta\in[0, \pi]$.
   *
   * Equal to $\theta = \cos^{-1}( \hat{u} \cdot \hat{v} )$ where $\hat{u}$ is this vector (normalized) and $\hat{v}$
   * is the input vector (normalized).
   */
  angleBetween(v) {
    const thisMagnitude = this.magnitude;
    const vMagnitude = v.magnitude;
    // @ts-expect-error TODO: import with circular protection
    return Math.acos(dot.clamp((this.x * v.x + this.y * v.y) / (thisMagnitude * vMagnitude), -1, 1));
  }

  /**
   * Exact equality comparison between this vector and another vector.
     * @returns - Whether the two vectors have equal components
   */
  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * Approximate equality comparison between this vector and another vector.
   *
   * @returns - Whether difference between the two vectors has no component with an absolute value greater than epsilon.
   */
  equalsEpsilon(other, epsilon) {
    if (!epsilon) {
      epsilon = 0;
    }
    return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y)) <= epsilon;
  }

  /**
   * Returns false if either component is NaN, infinity, or -infinity. Otherwise returns true.
   */
  isFinite() {
    return isFinite(this.x) && isFinite(this.y);
  }

  /*---------------------------------------------------------------------------*
   * Immutables
   *---------------------------------------------------------------------------*/

  /**
   * Creates a copy of this vector, or if a vector is passed in, set that vector's values to ours.
   *
   * This is the immutable form of the function set(), if a vector is provided. This will return a new vector, and
   * will not modify this vector.
   *
   * @param [vector] - If not provided, creates a new Vector2 with filled in values. Otherwise, fills in the
   *                   values of the provided vector so that it equals this vector.
   */
  copy(vector) {
    if (vector) {
      return vector.set(this);
    } else {
      return v2(this.x, this.y);
    }
  }

  /**
   * The scalar value of the z-component of the equivalent 3-dimensional cross product:
   * $$ f( u, v ) = \left( \begin{bmatrix} u_x \\ u_y \\ 0 \end{bmatrix} \times \begin{bmatrix} v_x \\ v_y \\ 0 \end{bmatrix} \right)_z = u_x v_y - u_y v_x $$
   */
  crossScalar(v) {
    return this.x * v.y - this.y * v.x;
  }

  /**
   * Normalized (re-scaled) copy of this vector such that its magnitude is 1. If its initial magnitude is zero, an
   * error is thrown.
   *
   * This is the immutable form of the function normalize(). This will return a new vector, and will not modify this
   * vector.
   */
  normalized() {
    const mag = this.magnitude;
    if (mag === 0) {
      throw new Error('Cannot normalize a zero-magnitude vector');
    } else {
      return v2(this.x / mag, this.y / mag);
    }
  }

  /**
   * Returns a copy of this vector with each component rounded by Utils.roundSymmetric.
   *
   * This is the immutable form of the function roundSymmetric(). This will return a new vector, and will not modify
   * this vector.
   */
  roundedSymmetric() {
    return this.copy().roundSymmetric();
  }

  /**
   * Re-scaled copy of this vector such that it has the desired magnitude. If its initial magnitude is zero, an error
   * is thrown. If the passed-in magnitude is negative, the direction of the resulting vector will be reversed.
   *
   * This is the immutable form of the function setMagnitude(). This will return a new vector, and will not modify
   * this vector.
   */
  withMagnitude(magnitude) {
    return this.copy().setMagnitude(magnitude);
  }

  /**
   * Copy of this vector, scaled by the desired scalar value.
   *
   * This is the immutable form of the function multiplyScalar(). This will return a new vector, and will not modify
   * this vector.
   */
  timesScalar(scalar) {
    return v2(this.x * scalar, this.y * scalar);
  }

  /**
   * Same as timesScalar.
   *
   * This is the immutable form of the function multiply(). This will return a new vector, and will not modify
   * this vector.
   */
  times(scalar) {
    return this.timesScalar(scalar);
  }

  /**
   * Copy of this vector, multiplied component-wise by the passed-in vector v.
   *
   * This is the immutable form of the function componentMultiply(). This will return a new vector, and will not modify
   * this vector.
   */
  componentTimes(v) {
    return v2(this.x * v.x, this.y * v.y);
  }

  /**
   * Addition of this vector and another vector, returning a copy.
   *
   * This is the immutable form of the function add(). This will return a new vector, and will not modify
   * this vector.
   */
  plus(v) {
    return v2(this.x + v.x, this.y + v.y);
  }

  /**
   * Addition of this vector and another vector (x,y), returning a copy.
   *
   * This is the immutable form of the function addXY(). This will return a new vector, and will not modify
   * this vector.
   */
  plusXY(x, y) {
    return v2(this.x + x, this.y + y);
  }

  /**
   * Addition of this vector with a scalar (adds the scalar to every component), returning a copy.
   *
   * This is the immutable form of the function addScalar(). This will return a new vector, and will not modify
   * this vector.
   */
  plusScalar(scalar) {
    return v2(this.x + scalar, this.y + scalar);
  }

  /**
   * Subtraction of this vector by another vector v, returning a copy.
   *
   * This is the immutable form of the function subtract(). This will return a new vector, and will not modify
   * this vector.
   */
  minus(v) {
    return v2(this.x - v.x, this.y - v.y);
  }

  /**
   * Subtraction of this vector by another vector (x,y), returning a copy.
   *
   * This is the immutable form of the function subtractXY(). This will return a new vector, and will not modify
   * this vector.
   */
  minusXY(x, y) {
    return v2(this.x - x, this.y - y);
  }

  /**
   * Subtraction of this vector by a scalar (subtracts the scalar from every component), returning a copy.
   *
   * This is the immutable form of the function subtractScalar(). This will return a new vector, and will not modify
   * this vector.
   */
  minusScalar(scalar) {
    return v2(this.x - scalar, this.y - scalar);
  }

  /**
   * Division of this vector by a scalar (divides every component by the scalar), returning a copy.
   *
   * This is the immutable form of the function divideScalar(). This will return a new vector, and will not modify
   * this vector.
   */
  dividedScalar(scalar) {
    return v2(this.x / scalar, this.y / scalar);
  }

  /**
   * Negated copy of this vector (multiplies every component by -1).
   *
   * This is the immutable form of the function negate(). This will return a new vector, and will not modify
   * this vector.
   */
  negated() {
    return v2(-this.x, -this.y);
  }

  /**
   * Rotated by -pi/2 (perpendicular to this vector), returned as a copy.
   */
  getPerpendicular() {
    return v2(this.y, -this.x);
  }
  get perpendicular() {
    return this.getPerpendicular();
  }

  /**
   * Rotated by an arbitrary angle, in radians. Returned as a copy.
   *
   * This is the immutable form of the function rotate(). This will return a new vector, and will not modify
   * this vector.
   *
   * @param angle - In radians
   */
  rotated(angle) {
    const newAngle = this.angle + angle;
    const mag = this.magnitude;
    return v2(mag * Math.cos(newAngle), mag * Math.sin(newAngle));
  }

  /**
   * Mutable method that rotates this vector about an x,y point.
   *
   * @param x - origin of rotation in x
   * @param y - origin of rotation in y
   * @param angle - radians to rotate
   * @returns this for chaining
   */
  rotateAboutXY(x, y, angle) {
    const dx = this.x - x;
    const dy = this.y - y;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    this.x = x + dx * cos - dy * sin;
    this.y = y + dx * sin + dy * cos;
    return this;
  }

  /**
   * Same as rotateAboutXY but with a point argument.
   */
  rotateAboutPoint(point, angle) {
    return this.rotateAboutXY(point.x, point.y, angle);
  }

  /**
   * Immutable method that returns a new Vector2 that is rotated about the given point.
   *
   * @param x - origin for rotation in x
   * @param y - origin for rotation in y
   * @param angle - radians to rotate
   */
  rotatedAboutXY(x, y, angle) {
    return v2(this.x, this.y).rotateAboutXY(x, y, angle);
  }

  /**
   * Immutable method that returns a new Vector2 rotated about the given point.
   */
  rotatedAboutPoint(point, angle) {
    return this.rotatedAboutXY(point.x, point.y, angle);
  }

  /**
   * A linear interpolation between this vector (ratio=0) and another vector (ratio=1).
   *
   * @param vector
   * @param ratio - Not necessarily constrained in [0, 1]
   */
  blend(vector, ratio) {
    return v2(this.x + (vector.x - this.x) * ratio, this.y + (vector.y - this.y) * ratio);
  }

  /**
   * The average (midpoint) between this vector and another vector.
   */
  average(vector) {
    return this.blend(vector, 0.5);
  }

  /**
   * Take a component-based mean of all vectors provided.
   */
  static average(vectors) {
    const added = _.reduce(vectors, ADDING_ACCUMULATOR, new Vector2(0, 0));
    return added.divideScalar(vectors.length);
  }

  /**
   * Debugging string for the vector.
   */
  toString() {
    return `Vector2(${this.x}, ${this.y})`;
  }

  /**
   * Converts this to a 3-dimensional vector, with the z-component equal to 0.
   */
  toVector3() {
    return new Vector3(this.x, this.y, 0);
  }

  /*---------------------------------------------------------------------------*
   * Mutables
   * - all mutation should go through setXY / setX / setY
   *---------------------------------------------------------------------------*/

  /**
   * Sets all of the components of this vector, returning this.
   */
  setXY(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Sets the x-component of this vector, returning this.
   */
  setX(x) {
    this.x = x;
    return this;
  }

  /**
   * Sets the y-component of this vector, returning this.
   */
  setY(y) {
    this.y = y;
    return this;
  }

  /**
   * Sets this vector to be a copy of another vector.
   *
   * This is the mutable form of the function copy(). This will mutate (change) this vector, in addition to returning
   * this vector itself.
   */
  set(v) {
    return this.setXY(v.x, v.y);
  }

  /**
   * Sets the magnitude of this vector. If the passed-in magnitude is negative, this flips the vector and sets its
   * magnitude to abs( magnitude ).
   *
   * This is the mutable form of the function withMagnitude(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  setMagnitude(magnitude) {
    const scale = magnitude / this.magnitude;
    return this.multiplyScalar(scale);
  }

  /**
   * Adds another vector to this vector, changing this vector.
   *
   * This is the mutable form of the function plus(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  add(v) {
    return this.setXY(this.x + v.x, this.y + v.y);
  }

  /**
   * Adds another vector (x,y) to this vector, changing this vector.
   *
   * This is the mutable form of the function plusXY(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  addXY(x, y) {
    return this.setXY(this.x + x, this.y + y);
  }

  /**
   * Adds a scalar to this vector (added to every component), changing this vector.
   *
   * This is the mutable form of the function plusScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  addScalar(scalar) {
    return this.setXY(this.x + scalar, this.y + scalar);
  }

  /**
   * Subtracts this vector by another vector, changing this vector.
   *
   * This is the mutable form of the function minus(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  subtract(v) {
    return this.setXY(this.x - v.x, this.y - v.y);
  }

  /**
   * Subtracts this vector by another vector (x,y), changing this vector.
   *
   * This is the mutable form of the function minusXY(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  subtractXY(x, y) {
    return this.setXY(this.x - x, this.y - y);
  }

  /**
   * Subtracts this vector by a scalar (subtracts each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function minusScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  subtractScalar(scalar) {
    return this.setXY(this.x - scalar, this.y - scalar);
  }

  /**
   * Multiplies this vector by a scalar (multiplies each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function timesScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  multiplyScalar(scalar) {
    return this.setXY(this.x * scalar, this.y * scalar);
  }

  /**
   * Multiplies this vector by a scalar (multiplies each component by the scalar), changing this vector.
   * Same as multiplyScalar.
   *
   * This is the mutable form of the function times(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  multiply(scalar) {
    return this.multiplyScalar(scalar);
  }

  /**
   * Multiplies this vector by another vector component-wise, changing this vector.
   *
   * This is the mutable form of the function componentTimes(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  componentMultiply(v) {
    return this.setXY(this.x * v.x, this.y * v.y);
  }

  /**
   * Divides this vector by a scalar (divides each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function dividedScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  divideScalar(scalar) {
    return this.setXY(this.x / scalar, this.y / scalar);
  }

  /**
   * Negates this vector (multiplies each component by -1), changing this vector.
   *
   * This is the mutable form of the function negated(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  negate() {
    return this.setXY(-this.x, -this.y);
  }

  /**
   * Normalizes this vector (rescales to where the magnitude is 1), changing this vector.
   *
   * This is the mutable form of the function normalized(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  normalize() {
    const mag = this.magnitude;
    if (mag === 0) {
      throw new Error('Cannot normalize a zero-magnitude vector');
    } else {
      return this.divideScalar(mag);
    }
  }

  /**
   * Rounds each component of this vector with Utils.roundSymmetric.
   *
   * This is the mutable form of the function roundedSymmetric(). This will mutate (change) this vector, in addition
   * to returning the vector itself.
   */
  roundSymmetric() {
    return this.setXY(Utils.roundSymmetric(this.x), Utils.roundSymmetric(this.y));
  }

  /**
   * Rotates this vector by the angle (in radians), changing this vector.
   *
   * This is the mutable form of the function rotated(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   *
   * @param angle - In radians
   */
  rotate(angle) {
    const newAngle = this.angle + angle;
    const mag = this.magnitude;
    return this.setXY(mag * Math.cos(newAngle), mag * Math.sin(newAngle));
  }

  /**
   * Sets this vector's value to be the x,y values matching the given magnitude and angle (in radians), changing
   * this vector, and returning itself.
   *
   * @param magnitude
   * @param angle - In radians
   */
  setPolar(magnitude, angle) {
    return this.setXY(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
  }

  /**
   * Returns a duck-typed object meant for use with tandem/phet-io serialization. Although this is redundant with
   * stateSchema, it is a nice feature of such a heavily-used type to be able to call toStateObject directly on the type.
   *
   * @returns - see stateSchema for schema
   */
  toStateObject() {
    return {
      x: this.x,
      y: this.y
    };
  }
  freeToPool() {
    Vector2.pool.freeToPool(this);
  }
  static pool = new Pool(Vector2, {
    maxSize: 1000,
    initialize: Vector2.prototype.setXY,
    defaultArguments: [0, 0]
  });

  // static methods

  /**
   * Returns a Vector2 with the specified magnitude $r$ and angle $\theta$ (in radians), with the formula:
   * $$ f( r, \theta ) = \begin{bmatrix} r\cos\theta \\ r\sin\theta \end{bmatrix} $$
   */
  static createPolar(magnitude, angle) {
    return new Vector2(0, 0).setPolar(magnitude, angle);
  }

  /**
   * Constructs a Vector2 from a duck-typed object, for use with tandem/phet-io deserialization.
   *
   * @param stateObject - see stateSchema for schema
   */
  static fromStateObject(stateObject) {
    return v2(stateObject.x, stateObject.y);
  }

  /**
   * Allocation-free implementation that gets the angle between two vectors
   *
   * @returns the angle between the vectors
   */
  static getAngleBetweenVectors(startVector, endVector) {
    const dx = endVector.x - startVector.x;
    const dy = endVector.y - startVector.y;
    return Math.atan2(dy, dx);
  }

  /**
   * Allocation-free way to get the distance between vectors.
   *
   * @returns the angle between the vectors
   */
  static getDistanceBetweenVectors(startVector, endVector) {
    const dx = endVector.x - startVector.x;
    const dy = endVector.y - startVector.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * ImmutableVector2 zero vector: $\begin{bmatrix} 0\\0 \end{bmatrix}$
   */
  // eslint-disable-line uppercase-statics-should-be-readonly
  /**
   * ImmutableVector2 vector: $\begin{bmatrix} 1\\0 \end{bmatrix}$
   */
  // eslint-disable-line uppercase-statics-should-be-readonly
  /**
   * ImmutableVector2 vector: $\begin{bmatrix} 0\\1 \end{bmatrix}$
   */
  // eslint-disable-line uppercase-statics-should-be-readonly
}

// (read-only) - Helps to identify the dimension of the vector
Vector2.prototype.isVector2 = true;
Vector2.prototype.dimension = 2;
dot.register('Vector2', Vector2);
const v2 = Vector2.pool.create.bind(Vector2.pool);
dot.register('v2', v2);
class ImmutableVector2 extends Vector2 {
  /**
   * Throw errors whenever a mutable method is called on our immutable vector
   */
  static mutableOverrideHelper(mutableFunctionName) {
    ImmutableVector2.prototype[mutableFunctionName] = () => {
      throw new Error(`Cannot call mutable method '${mutableFunctionName}' on immutable Vector2`);
    };
  }
}
ImmutableVector2.mutableOverrideHelper('setXY');
ImmutableVector2.mutableOverrideHelper('setX');
ImmutableVector2.mutableOverrideHelper('setY');
Vector2.ZERO = assert ? new ImmutableVector2(0, 0) : new Vector2(0, 0);
Vector2.X_UNIT = assert ? new ImmutableVector2(1, 0) : new Vector2(1, 0);
Vector2.Y_UNIT = assert ? new ImmutableVector2(0, 1) : new Vector2(0, 1);
Vector2.Vector2IO = new IOType('Vector2IO', {
  valueType: Vector2,
  stateSchema: {
    x: NumberIO,
    y: NumberIO
  },
  toStateObject: vector2 => vector2.toStateObject(),
  fromStateObject: stateObject => Vector2.fromStateObject(stateObject),
  documentation: 'A numerical object with x and y properties, like {x:3,y:4}'
});
export { v2 };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQb29sIiwiSU9UeXBlIiwiTnVtYmVySU8iLCJkb3QiLCJVdGlscyIsIlZlY3RvcjMiLCJBRERJTkdfQUNDVU1VTEFUT1IiLCJ2ZWN0b3IiLCJuZXh0VmVjdG9yIiwiYWRkIiwiVmVjdG9yMiIsImNvbnN0cnVjdG9yIiwieCIsInkiLCJnZXRNYWduaXR1ZGUiLCJNYXRoIiwic3FydCIsIm1hZ25pdHVkZVNxdWFyZWQiLCJtYWduaXR1ZGUiLCJnZXRNYWduaXR1ZGVTcXVhcmVkIiwiZGlzdGFuY2UiLCJwb2ludCIsImRpc3RhbmNlU3F1YXJlZCIsImRpc3RhbmNlWFkiLCJkeCIsImR5IiwiZGlzdGFuY2VTcXVhcmVkWFkiLCJ2IiwiZG90WFkiLCJnZXRBbmdsZSIsImF0YW4yIiwiYW5nbGUiLCJhbmdsZUJldHdlZW4iLCJ0aGlzTWFnbml0dWRlIiwidk1hZ25pdHVkZSIsImFjb3MiLCJjbGFtcCIsImVxdWFscyIsIm90aGVyIiwiZXF1YWxzRXBzaWxvbiIsImVwc2lsb24iLCJtYXgiLCJhYnMiLCJpc0Zpbml0ZSIsImNvcHkiLCJzZXQiLCJ2MiIsImNyb3NzU2NhbGFyIiwibm9ybWFsaXplZCIsIm1hZyIsIkVycm9yIiwicm91bmRlZFN5bW1ldHJpYyIsInJvdW5kU3ltbWV0cmljIiwid2l0aE1hZ25pdHVkZSIsInNldE1hZ25pdHVkZSIsInRpbWVzU2NhbGFyIiwic2NhbGFyIiwidGltZXMiLCJjb21wb25lbnRUaW1lcyIsInBsdXMiLCJwbHVzWFkiLCJwbHVzU2NhbGFyIiwibWludXMiLCJtaW51c1hZIiwibWludXNTY2FsYXIiLCJkaXZpZGVkU2NhbGFyIiwibmVnYXRlZCIsImdldFBlcnBlbmRpY3VsYXIiLCJwZXJwZW5kaWN1bGFyIiwicm90YXRlZCIsIm5ld0FuZ2xlIiwiY29zIiwic2luIiwicm90YXRlQWJvdXRYWSIsInJvdGF0ZUFib3V0UG9pbnQiLCJyb3RhdGVkQWJvdXRYWSIsInJvdGF0ZWRBYm91dFBvaW50IiwiYmxlbmQiLCJyYXRpbyIsImF2ZXJhZ2UiLCJ2ZWN0b3JzIiwiYWRkZWQiLCJfIiwicmVkdWNlIiwiZGl2aWRlU2NhbGFyIiwibGVuZ3RoIiwidG9TdHJpbmciLCJ0b1ZlY3RvcjMiLCJzZXRYWSIsInNldFgiLCJzZXRZIiwic2NhbGUiLCJtdWx0aXBseVNjYWxhciIsImFkZFhZIiwiYWRkU2NhbGFyIiwic3VidHJhY3QiLCJzdWJ0cmFjdFhZIiwic3VidHJhY3RTY2FsYXIiLCJtdWx0aXBseSIsImNvbXBvbmVudE11bHRpcGx5IiwibmVnYXRlIiwibm9ybWFsaXplIiwicm90YXRlIiwic2V0UG9sYXIiLCJ0b1N0YXRlT2JqZWN0IiwiZnJlZVRvUG9vbCIsInBvb2wiLCJtYXhTaXplIiwiaW5pdGlhbGl6ZSIsInByb3RvdHlwZSIsImRlZmF1bHRBcmd1bWVudHMiLCJjcmVhdGVQb2xhciIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0IiwiZ2V0QW5nbGVCZXR3ZWVuVmVjdG9ycyIsInN0YXJ0VmVjdG9yIiwiZW5kVmVjdG9yIiwiZ2V0RGlzdGFuY2VCZXR3ZWVuVmVjdG9ycyIsImlzVmVjdG9yMiIsImRpbWVuc2lvbiIsInJlZ2lzdGVyIiwiY3JlYXRlIiwiYmluZCIsIkltbXV0YWJsZVZlY3RvcjIiLCJtdXRhYmxlT3ZlcnJpZGVIZWxwZXIiLCJtdXRhYmxlRnVuY3Rpb25OYW1lIiwiWkVSTyIsImFzc2VydCIsIlhfVU5JVCIsIllfVU5JVCIsIlZlY3RvcjJJTyIsInZhbHVlVHlwZSIsInN0YXRlU2NoZW1hIiwidmVjdG9yMiIsImRvY3VtZW50YXRpb24iXSwic291cmNlcyI6WyJWZWN0b3IyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2ljIDItZGltZW5zaW9uYWwgdmVjdG9yLCByZXByZXNlbnRlZCBhcyAoeCx5KS4gIFZhbHVlcyBjYW4gYmUgbnVtZXJpYywgb3IgTmFOIG9yIGluZmluaXRlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFBvb2wsIHsgVFBvb2xhYmxlIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi9WZWN0b3IzLmpzJztcclxuXHJcbmNvbnN0IEFERElOR19BQ0NVTVVMQVRPUiA9ICggdmVjdG9yOiBWZWN0b3IyLCBuZXh0VmVjdG9yOiBWZWN0b3IyICkgPT4ge1xyXG4gIHJldHVybiB2ZWN0b3IuYWRkKCBuZXh0VmVjdG9yICk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZWN0b3IyIGltcGxlbWVudHMgVFBvb2xhYmxlIHtcclxuXHJcbiAgLy8gVGhlIFggY29vcmRpbmF0ZSBvZiB0aGUgdmVjdG9yLlxyXG4gIHB1YmxpYyB4OiBudW1iZXI7XHJcblxyXG4gIC8vIFRoZSBZIGNvb3JkaW5hdGUgb2YgdGhlIHZlY3Rvci5cclxuICBwdWJsaWMgeTogbnVtYmVyO1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgMi1kaW1lbnNpb25hbCB2ZWN0b3Igd2l0aCB0aGUgc3BlY2lmaWVkIFggYW5kIFkgdmFsdWVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHggLSBYIGNvb3JkaW5hdGVcclxuICAgKiBAcGFyYW0geSAtIFkgY29vcmRpbmF0ZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggeDogbnVtYmVyLCB5OiBudW1iZXIgKSB7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBtYWduaXR1ZGUgKEV1Y2xpZGVhbi9MMiBOb3JtKSBvZiB0aGlzIHZlY3RvciwgaS5lLiAkXFxzcXJ0e3heMit5XjJ9JC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TWFnbml0dWRlKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLm1hZ25pdHVkZVNxdWFyZWQgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgbWFnbml0dWRlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldE1hZ25pdHVkZSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBzcXVhcmVkIG1hZ25pdHVkZSAoc3F1YXJlIG9mIHRoZSBFdWNsaWRlYW4vTDIgTm9ybSkgb2YgdGhpcyB2ZWN0b3IsIGkuZS4gJHheMit5XjIkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRNYWduaXR1ZGVTcXVhcmVkKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBtYWduaXR1ZGVTcXVhcmVkKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldE1hZ25pdHVkZVNxdWFyZWQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgRXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhpcyB2ZWN0b3IgKHRyZWF0ZWQgYXMgYSBwb2ludCkgYW5kIGFub3RoZXIgcG9pbnQuXHJcbiAgICovXHJcbiAgcHVibGljIGRpc3RhbmNlKCBwb2ludDogVmVjdG9yMiApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5kaXN0YW5jZVNxdWFyZWQoIHBvaW50ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBFdWNsaWRlYW4gZGlzdGFuY2UgYmV0d2VlbiB0aGlzIHZlY3RvciAodHJlYXRlZCBhcyBhIHBvaW50KSBhbmQgYW5vdGhlciBwb2ludCAoeCx5KS5cclxuICAgKi9cclxuICBwdWJsaWMgZGlzdGFuY2VYWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IGR4ID0gdGhpcy54IC0geDtcclxuICAgIGNvbnN0IGR5ID0gdGhpcy55IC0geTtcclxuICAgIHJldHVybiBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgc3F1YXJlZCBFdWNsaWRlYW4gZGlzdGFuY2UgYmV0d2VlbiB0aGlzIHZlY3RvciAodHJlYXRlZCBhcyBhIHBvaW50KSBhbmQgYW5vdGhlciBwb2ludC5cclxuICAgKi9cclxuICBwdWJsaWMgZGlzdGFuY2VTcXVhcmVkKCBwb2ludDogVmVjdG9yMiApOiBudW1iZXIge1xyXG4gICAgY29uc3QgZHggPSB0aGlzLnggLSBwb2ludC54O1xyXG4gICAgY29uc3QgZHkgPSB0aGlzLnkgLSBwb2ludC55O1xyXG4gICAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHNxdWFyZWQgRXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhpcyB2ZWN0b3IgKHRyZWF0ZWQgYXMgYSBwb2ludCkgYW5kIGFub3RoZXIgcG9pbnQgd2l0aCBjb29yZGluYXRlcyAoeCx5KS5cclxuICAgKi9cclxuICBwdWJsaWMgZGlzdGFuY2VTcXVhcmVkWFkoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBjb25zdCBkeCA9IHRoaXMueCAtIHg7XHJcbiAgICBjb25zdCBkeSA9IHRoaXMueSAtIHk7XHJcbiAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgZG90LXByb2R1Y3QgKEV1Y2xpZGVhbiBpbm5lciBwcm9kdWN0KSBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyIHZlY3RvciB2LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBkb3QoIHY6IFZlY3RvcjIgKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2Lnk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgZG90LXByb2R1Y3QgKEV1Y2xpZGVhbiBpbm5lciBwcm9kdWN0KSBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyIHZlY3RvciAoeCx5KS5cclxuICAgKi9cclxuICBwdWJsaWMgZG90WFkoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy54ICogeCArIHRoaXMueSAqIHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgYW5nbGUgJFxcdGhldGEkIG9mIHRoaXMgdmVjdG9yLCBzdWNoIHRoYXQgdGhpcyB2ZWN0b3IgaXMgZXF1YWwgdG9cclxuICAgKiAkJCB1ID0gXFxiZWdpbntibWF0cml4fSByXFxjb3NcXHRoZXRhIFxcXFwgclxcc2luXFx0aGV0YSBcXGVuZHtibWF0cml4fSAkJFxyXG4gICAqIGZvciB0aGUgbWFnbml0dWRlICRyIFxcZ2UgMCQgb2YgdGhlIHZlY3Rvciwgd2l0aCAkXFx0aGV0YVxcaW4oLVxccGksXFxwaV0kXHJcbiAgICovXHJcbiAgcHVibGljIGdldEFuZ2xlKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gTWF0aC5hdGFuMiggdGhpcy55LCB0aGlzLnggKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYW5nbGUoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldEFuZ2xlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgYW5nbGUgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlciB2ZWN0b3IsIGluIHRoZSByYW5nZSAkXFx0aGV0YVxcaW5bMCwgXFxwaV0kLlxyXG4gICAqXHJcbiAgICogRXF1YWwgdG8gJFxcdGhldGEgPSBcXGNvc157LTF9KCBcXGhhdHt1fSBcXGNkb3QgXFxoYXR7dn0gKSQgd2hlcmUgJFxcaGF0e3V9JCBpcyB0aGlzIHZlY3RvciAobm9ybWFsaXplZCkgYW5kICRcXGhhdHt2fSRcclxuICAgKiBpcyB0aGUgaW5wdXQgdmVjdG9yIChub3JtYWxpemVkKS5cclxuICAgKi9cclxuICBwdWJsaWMgYW5nbGVCZXR3ZWVuKCB2OiBWZWN0b3IyICk6IG51bWJlciB7XHJcbiAgICBjb25zdCB0aGlzTWFnbml0dWRlID0gdGhpcy5tYWduaXR1ZGU7XHJcbiAgICBjb25zdCB2TWFnbml0dWRlID0gdi5tYWduaXR1ZGU7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE86IGltcG9ydCB3aXRoIGNpcmN1bGFyIHByb3RlY3Rpb25cclxuICAgIHJldHVybiBNYXRoLmFjb3MoIGRvdC5jbGFtcCggKCB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKSAvICggdGhpc01hZ25pdHVkZSAqIHZNYWduaXR1ZGUgKSwgLTEsIDEgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXhhY3QgZXF1YWxpdHkgY29tcGFyaXNvbiBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyIHZlY3Rvci5cclxuXHJcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIHRoZSB0d28gdmVjdG9ycyBoYXZlIGVxdWFsIGNvbXBvbmVudHNcclxuICAgKi9cclxuICBwdWJsaWMgZXF1YWxzKCBvdGhlcjogVmVjdG9yMiApOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLnggPT09IG90aGVyLnggJiYgdGhpcy55ID09PSBvdGhlci55O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXBwcm94aW1hdGUgZXF1YWxpdHkgY29tcGFyaXNvbiBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyIHZlY3Rvci5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHR3byB2ZWN0b3JzIGhhcyBubyBjb21wb25lbnQgd2l0aCBhbiBhYnNvbHV0ZSB2YWx1ZSBncmVhdGVyIHRoYW4gZXBzaWxvbi5cclxuICAgKi9cclxuICBwdWJsaWMgZXF1YWxzRXBzaWxvbiggb3RoZXI6IFZlY3RvcjIsIGVwc2lsb246IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIGlmICggIWVwc2lsb24gKSB7XHJcbiAgICAgIGVwc2lsb24gPSAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE1hdGgubWF4KCBNYXRoLmFicyggdGhpcy54IC0gb3RoZXIueCApLCBNYXRoLmFicyggdGhpcy55IC0gb3RoZXIueSApICkgPD0gZXBzaWxvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgZmFsc2UgaWYgZWl0aGVyIGNvbXBvbmVudCBpcyBOYU4sIGluZmluaXR5LCBvciAtaW5maW5pdHkuIE90aGVyd2lzZSByZXR1cm5zIHRydWUuXHJcbiAgICovXHJcbiAgcHVibGljIGlzRmluaXRlKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGlzRmluaXRlKCB0aGlzLnggKSAmJiBpc0Zpbml0ZSggdGhpcy55ICk7XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBJbW11dGFibGVzXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIHZlY3Rvciwgb3IgaWYgYSB2ZWN0b3IgaXMgcGFzc2VkIGluLCBzZXQgdGhhdCB2ZWN0b3IncyB2YWx1ZXMgdG8gb3Vycy5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzZXQoKSwgaWYgYSB2ZWN0b3IgaXMgcHJvdmlkZWQuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmRcclxuICAgKiB3aWxsIG5vdCBtb2RpZnkgdGhpcyB2ZWN0b3IuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gW3ZlY3Rvcl0gLSBJZiBub3QgcHJvdmlkZWQsIGNyZWF0ZXMgYSBuZXcgVmVjdG9yMiB3aXRoIGZpbGxlZCBpbiB2YWx1ZXMuIE90aGVyd2lzZSwgZmlsbHMgaW4gdGhlXHJcbiAgICogICAgICAgICAgICAgICAgICAgdmFsdWVzIG9mIHRoZSBwcm92aWRlZCB2ZWN0b3Igc28gdGhhdCBpdCBlcXVhbHMgdGhpcyB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIGNvcHkoIHZlY3Rvcj86IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcbiAgICBpZiAoIHZlY3RvciApIHtcclxuICAgICAgcmV0dXJuIHZlY3Rvci5zZXQoIHRoaXMgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdjIoIHRoaXMueCwgdGhpcy55ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgc2NhbGFyIHZhbHVlIG9mIHRoZSB6LWNvbXBvbmVudCBvZiB0aGUgZXF1aXZhbGVudCAzLWRpbWVuc2lvbmFsIGNyb3NzIHByb2R1Y3Q6XHJcbiAgICogJCQgZiggdSwgdiApID0gXFxsZWZ0KCBcXGJlZ2lue2JtYXRyaXh9IHVfeCBcXFxcIHVfeSBcXFxcIDAgXFxlbmR7Ym1hdHJpeH0gXFx0aW1lcyBcXGJlZ2lue2JtYXRyaXh9IHZfeCBcXFxcIHZfeSBcXFxcIDAgXFxlbmR7Ym1hdHJpeH0gXFxyaWdodClfeiA9IHVfeCB2X3kgLSB1X3kgdl94ICQkXHJcbiAgICovXHJcbiAgcHVibGljIGNyb3NzU2NhbGFyKCB2OiBWZWN0b3IyICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTm9ybWFsaXplZCAocmUtc2NhbGVkKSBjb3B5IG9mIHRoaXMgdmVjdG9yIHN1Y2ggdGhhdCBpdHMgbWFnbml0dWRlIGlzIDEuIElmIGl0cyBpbml0aWFsIG1hZ25pdHVkZSBpcyB6ZXJvLCBhblxyXG4gICAqIGVycm9yIGlzIHRocm93bi5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBub3JtYWxpemUoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnkgdGhpc1xyXG4gICAqIHZlY3Rvci5cclxuICAgKi9cclxuICBwdWJsaWMgbm9ybWFsaXplZCgpOiBWZWN0b3IyIHtcclxuICAgIGNvbnN0IG1hZyA9IHRoaXMubWFnbml0dWRlO1xyXG4gICAgaWYgKCBtYWcgPT09IDAgKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ0Nhbm5vdCBub3JtYWxpemUgYSB6ZXJvLW1hZ25pdHVkZSB2ZWN0b3InICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHYyKCB0aGlzLnggLyBtYWcsIHRoaXMueSAvIG1hZyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGNvcHkgb2YgdGhpcyB2ZWN0b3Igd2l0aCBlYWNoIGNvbXBvbmVudCByb3VuZGVkIGJ5IFV0aWxzLnJvdW5kU3ltbWV0cmljLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHJvdW5kU3ltbWV0cmljKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIHJvdW5kZWRTeW1tZXRyaWMoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5jb3B5KCkucm91bmRTeW1tZXRyaWMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlLXNjYWxlZCBjb3B5IG9mIHRoaXMgdmVjdG9yIHN1Y2ggdGhhdCBpdCBoYXMgdGhlIGRlc2lyZWQgbWFnbml0dWRlLiBJZiBpdHMgaW5pdGlhbCBtYWduaXR1ZGUgaXMgemVybywgYW4gZXJyb3JcclxuICAgKiBpcyB0aHJvd24uIElmIHRoZSBwYXNzZWQtaW4gbWFnbml0dWRlIGlzIG5lZ2F0aXZlLCB0aGUgZGlyZWN0aW9uIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yIHdpbGwgYmUgcmV2ZXJzZWQuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2V0TWFnbml0dWRlKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIHdpdGhNYWduaXR1ZGUoIG1hZ25pdHVkZTogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuY29weSgpLnNldE1hZ25pdHVkZSggbWFnbml0dWRlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb3B5IG9mIHRoaXMgdmVjdG9yLCBzY2FsZWQgYnkgdGhlIGRlc2lyZWQgc2NhbGFyIHZhbHVlLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIHRpbWVzU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB2MiggdGhpcy54ICogc2NhbGFyLCB0aGlzLnkgKiBzY2FsYXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNhbWUgYXMgdGltZXNTY2FsYXIuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbXVsdGlwbHkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIHZlY3Rvci5cclxuICAgKi9cclxuICBwdWJsaWMgdGltZXMoIHNjYWxhcjogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMudGltZXNTY2FsYXIoIHNjYWxhciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29weSBvZiB0aGlzIHZlY3RvciwgbXVsdGlwbGllZCBjb21wb25lbnQtd2lzZSBieSB0aGUgcGFzc2VkLWluIHZlY3RvciB2LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvbXBvbmVudE11bHRpcGx5KCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIGNvbXBvbmVudFRpbWVzKCB2OiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHYyKCB0aGlzLnggKiB2LngsIHRoaXMueSAqIHYueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkaXRpb24gb2YgdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yLCByZXR1cm5pbmcgYSBjb3B5LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGFkZCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgdmVjdG9yLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwbHVzKCB2OiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHYyKCB0aGlzLnggKyB2LngsIHRoaXMueSArIHYueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkaXRpb24gb2YgdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yICh4LHkpLCByZXR1cm5pbmcgYSBjb3B5LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGFkZFhZKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIHBsdXNYWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdjIoIHRoaXMueCArIHgsIHRoaXMueSArIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZGl0aW9uIG9mIHRoaXMgdmVjdG9yIHdpdGggYSBzY2FsYXIgKGFkZHMgdGhlIHNjYWxhciB0byBldmVyeSBjb21wb25lbnQpLCByZXR1cm5pbmcgYSBjb3B5LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGFkZFNjYWxhcigpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgdmVjdG9yLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwbHVzU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB2MiggdGhpcy54ICsgc2NhbGFyLCB0aGlzLnkgKyBzY2FsYXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN1YnRyYWN0aW9uIG9mIHRoaXMgdmVjdG9yIGJ5IGFub3RoZXIgdmVjdG9yIHYsIHJldHVybmluZyBhIGNvcHkuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc3VidHJhY3QoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIHZlY3Rvci5cclxuICAgKi9cclxuICBwdWJsaWMgbWludXMoIHY6IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdjIoIHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdWJ0cmFjdGlvbiBvZiB0aGlzIHZlY3RvciBieSBhbm90aGVyIHZlY3RvciAoeCx5KSwgcmV0dXJuaW5nIGEgY29weS5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzdWJ0cmFjdFhZKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIG1pbnVzWFkoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHYyKCB0aGlzLnggLSB4LCB0aGlzLnkgLSB5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdWJ0cmFjdGlvbiBvZiB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAoc3VidHJhY3RzIHRoZSBzY2FsYXIgZnJvbSBldmVyeSBjb21wb25lbnQpLCByZXR1cm5pbmcgYSBjb3B5LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHN1YnRyYWN0U2NhbGFyKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIG1pbnVzU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB2MiggdGhpcy54IC0gc2NhbGFyLCB0aGlzLnkgLSBzY2FsYXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpdmlzaW9uIG9mIHRoaXMgdmVjdG9yIGJ5IGEgc2NhbGFyIChkaXZpZGVzIGV2ZXJ5IGNvbXBvbmVudCBieSB0aGUgc2NhbGFyKSwgcmV0dXJuaW5nIGEgY29weS5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaXZpZGVTY2FsYXIoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIHZlY3Rvci5cclxuICAgKi9cclxuICBwdWJsaWMgZGl2aWRlZFNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdjIoIHRoaXMueCAvIHNjYWxhciwgdGhpcy55IC8gc2NhbGFyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBOZWdhdGVkIGNvcHkgb2YgdGhpcyB2ZWN0b3IgKG11bHRpcGxpZXMgZXZlcnkgY29tcG9uZW50IGJ5IC0xKS5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBuZWdhdGUoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIHZlY3Rvci5cclxuICAgKi9cclxuICBwdWJsaWMgbmVnYXRlZCgpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB2MiggLXRoaXMueCwgLXRoaXMueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlZCBieSAtcGkvMiAocGVycGVuZGljdWxhciB0byB0aGlzIHZlY3RvciksIHJldHVybmVkIGFzIGEgY29weS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UGVycGVuZGljdWxhcigpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB2MiggdGhpcy55LCAtdGhpcy54ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHBlcnBlbmRpY3VsYXIoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRQZXJwZW5kaWN1bGFyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSb3RhdGVkIGJ5IGFuIGFyYml0cmFyeSBhbmdsZSwgaW4gcmFkaWFucy4gUmV0dXJuZWQgYXMgYSBjb3B5LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHJvdGF0ZSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgdmVjdG9yLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGFuZ2xlIC0gSW4gcmFkaWFuc1xyXG4gICAqL1xyXG4gIHB1YmxpYyByb3RhdGVkKCBhbmdsZTogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgY29uc3QgbmV3QW5nbGUgPSB0aGlzLmFuZ2xlICsgYW5nbGU7XHJcbiAgICBjb25zdCBtYWcgPSB0aGlzLm1hZ25pdHVkZTtcclxuICAgIHJldHVybiB2MiggbWFnICogTWF0aC5jb3MoIG5ld0FuZ2xlICksIG1hZyAqIE1hdGguc2luKCBuZXdBbmdsZSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNdXRhYmxlIG1ldGhvZCB0aGF0IHJvdGF0ZXMgdGhpcyB2ZWN0b3IgYWJvdXQgYW4geCx5IHBvaW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHggLSBvcmlnaW4gb2Ygcm90YXRpb24gaW4geFxyXG4gICAqIEBwYXJhbSB5IC0gb3JpZ2luIG9mIHJvdGF0aW9uIGluIHlcclxuICAgKiBAcGFyYW0gYW5nbGUgLSByYWRpYW5zIHRvIHJvdGF0ZVxyXG4gICAqIEByZXR1cm5zIHRoaXMgZm9yIGNoYWluaW5nXHJcbiAgICovXHJcbiAgcHVibGljIHJvdGF0ZUFib3V0WFkoIHg6IG51bWJlciwgeTogbnVtYmVyLCBhbmdsZTogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgY29uc3QgZHggPSB0aGlzLnggLSB4O1xyXG4gICAgY29uc3QgZHkgPSB0aGlzLnkgLSB5O1xyXG4gICAgY29uc3QgY29zID0gTWF0aC5jb3MoIGFuZ2xlICk7XHJcbiAgICBjb25zdCBzaW4gPSBNYXRoLnNpbiggYW5nbGUgKTtcclxuICAgIHRoaXMueCA9IHggKyBkeCAqIGNvcyAtIGR5ICogc2luO1xyXG4gICAgdGhpcy55ID0geSArIGR4ICogc2luICsgZHkgKiBjb3M7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTYW1lIGFzIHJvdGF0ZUFib3V0WFkgYnV0IHdpdGggYSBwb2ludCBhcmd1bWVudC5cclxuICAgKi9cclxuICBwdWJsaWMgcm90YXRlQWJvdXRQb2ludCggcG9pbnQ6IFZlY3RvcjIsIGFuZ2xlOiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5yb3RhdGVBYm91dFhZKCBwb2ludC54LCBwb2ludC55LCBhbmdsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW1tdXRhYmxlIG1ldGhvZCB0aGF0IHJldHVybnMgYSBuZXcgVmVjdG9yMiB0aGF0IGlzIHJvdGF0ZWQgYWJvdXQgdGhlIGdpdmVuIHBvaW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHggLSBvcmlnaW4gZm9yIHJvdGF0aW9uIGluIHhcclxuICAgKiBAcGFyYW0geSAtIG9yaWdpbiBmb3Igcm90YXRpb24gaW4geVxyXG4gICAqIEBwYXJhbSBhbmdsZSAtIHJhZGlhbnMgdG8gcm90YXRlXHJcbiAgICovXHJcbiAgcHVibGljIHJvdGF0ZWRBYm91dFhZKCB4OiBudW1iZXIsIHk6IG51bWJlciwgYW5nbGU6IG51bWJlciApOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB2MiggdGhpcy54LCB0aGlzLnkgKS5yb3RhdGVBYm91dFhZKCB4LCB5LCBhbmdsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW1tdXRhYmxlIG1ldGhvZCB0aGF0IHJldHVybnMgYSBuZXcgVmVjdG9yMiByb3RhdGVkIGFib3V0IHRoZSBnaXZlbiBwb2ludC5cclxuICAgKi9cclxuICBwdWJsaWMgcm90YXRlZEFib3V0UG9pbnQoIHBvaW50OiBWZWN0b3IyLCBhbmdsZTogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMucm90YXRlZEFib3V0WFkoIHBvaW50LngsIHBvaW50LnksIGFuZ2xlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdGhpcyB2ZWN0b3IgKHJhdGlvPTApIGFuZCBhbm90aGVyIHZlY3RvciAocmF0aW89MSkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdmVjdG9yXHJcbiAgICogQHBhcmFtIHJhdGlvIC0gTm90IG5lY2Vzc2FyaWx5IGNvbnN0cmFpbmVkIGluIFswLCAxXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBibGVuZCggdmVjdG9yOiBWZWN0b3IyLCByYXRpbzogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHYyKCB0aGlzLnggKyAoIHZlY3Rvci54IC0gdGhpcy54ICkgKiByYXRpbywgdGhpcy55ICsgKCB2ZWN0b3IueSAtIHRoaXMueSApICogcmF0aW8gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBhdmVyYWdlIChtaWRwb2ludCkgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlciB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIGF2ZXJhZ2UoIHZlY3RvcjogVmVjdG9yMiApOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLmJsZW5kKCB2ZWN0b3IsIDAuNSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGFrZSBhIGNvbXBvbmVudC1iYXNlZCBtZWFuIG9mIGFsbCB2ZWN0b3JzIHByb3ZpZGVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgYXZlcmFnZSggdmVjdG9yczogVmVjdG9yMltdICk6IFZlY3RvcjIge1xyXG4gICAgY29uc3QgYWRkZWQgPSBfLnJlZHVjZSggdmVjdG9ycywgQURESU5HX0FDQ1VNVUxBVE9SLCBuZXcgVmVjdG9yMiggMCwgMCApICk7XHJcbiAgICByZXR1cm4gYWRkZWQuZGl2aWRlU2NhbGFyKCB2ZWN0b3JzLmxlbmd0aCApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIERlYnVnZ2luZyBzdHJpbmcgZm9yIHRoZSB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYFZlY3RvcjIoJHt0aGlzLnh9LCAke3RoaXMueX0pYDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIHRoaXMgdG8gYSAzLWRpbWVuc2lvbmFsIHZlY3Rvciwgd2l0aCB0aGUgei1jb21wb25lbnQgZXF1YWwgdG8gMC5cclxuICAgKi9cclxuICBwdWJsaWMgdG9WZWN0b3IzKCk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCB0aGlzLngsIHRoaXMueSwgMCApO1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogTXV0YWJsZXNcclxuICAgKiAtIGFsbCBtdXRhdGlvbiBzaG91bGQgZ28gdGhyb3VnaCBzZXRYWSAvIHNldFggLyBzZXRZXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGFsbCBvZiB0aGUgY29tcG9uZW50cyBvZiB0aGlzIHZlY3RvciwgcmV0dXJuaW5nIHRoaXMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFhZKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiBWZWN0b3IyIHtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB4LWNvbXBvbmVudCBvZiB0aGlzIHZlY3RvciwgcmV0dXJuaW5nIHRoaXMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFgoIHg6IG51bWJlciApOiBWZWN0b3IyIHtcclxuICAgIHRoaXMueCA9IHg7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB5LWNvbXBvbmVudCBvZiB0aGlzIHZlY3RvciwgcmV0dXJuaW5nIHRoaXMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFkoIHk6IG51bWJlciApOiBWZWN0b3IyIHtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhpcyB2ZWN0b3IgdG8gYmUgYSBjb3B5IG9mIGFub3RoZXIgdmVjdG9yLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBjb3B5KCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgdmVjdG9yIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0KCB2OiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIHYueCwgdi55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBtYWduaXR1ZGUgb2YgdGhpcyB2ZWN0b3IuIElmIHRoZSBwYXNzZWQtaW4gbWFnbml0dWRlIGlzIG5lZ2F0aXZlLCB0aGlzIGZsaXBzIHRoZSB2ZWN0b3IgYW5kIHNldHMgaXRzXHJcbiAgICogbWFnbml0dWRlIHRvIGFicyggbWFnbml0dWRlICkuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhNYWduaXR1ZGUoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cclxuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRNYWduaXR1ZGUoIG1hZ25pdHVkZTogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgY29uc3Qgc2NhbGUgPSBtYWduaXR1ZGUgLyB0aGlzLm1hZ25pdHVkZTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhciggc2NhbGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYW5vdGhlciB2ZWN0b3IgdG8gdGhpcyB2ZWN0b3IsIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBwbHVzKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXHJcbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkKCB2OiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGFub3RoZXIgdmVjdG9yICh4LHkpIHRvIHRoaXMgdmVjdG9yLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcGx1c1hZKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXHJcbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkWFkoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIHRoaXMueCArIHgsIHRoaXMueSArIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBzY2FsYXIgdG8gdGhpcyB2ZWN0b3IgKGFkZGVkIHRvIGV2ZXJ5IGNvbXBvbmVudCksIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBwbHVzU2NhbGFyKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXHJcbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLnNldFhZKCB0aGlzLnggKyBzY2FsYXIsIHRoaXMueSArIHNjYWxhciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3VidHJhY3RzIHRoaXMgdmVjdG9yIGJ5IGFub3RoZXIgdmVjdG9yLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbWludXMoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cclxuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdWJ0cmFjdCggdjogVmVjdG9yMiApOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLnNldFhZKCB0aGlzLnggLSB2LngsIHRoaXMueSAtIHYueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3VidHJhY3RzIHRoaXMgdmVjdG9yIGJ5IGFub3RoZXIgdmVjdG9yICh4LHkpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbWludXNYWSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xyXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIHN1YnRyYWN0WFkoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIHRoaXMueCAtIHgsIHRoaXMueSAtIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN1YnRyYWN0cyB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAoc3VidHJhY3RzIGVhY2ggY29tcG9uZW50IGJ5IHRoZSBzY2FsYXIpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbWludXNTY2FsYXIoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cclxuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdWJ0cmFjdFNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRYWSggdGhpcy54IC0gc2NhbGFyLCB0aGlzLnkgLSBzY2FsYXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE11bHRpcGxpZXMgdGhpcyB2ZWN0b3IgYnkgYSBzY2FsYXIgKG11bHRpcGxpZXMgZWFjaCBjb21wb25lbnQgYnkgdGhlIHNjYWxhciksIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB0aW1lc1NjYWxhcigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xyXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIG11bHRpcGx5U2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLnNldFhZKCB0aGlzLnggKiBzY2FsYXIsIHRoaXMueSAqIHNjYWxhciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTXVsdGlwbGllcyB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAobXVsdGlwbGllcyBlYWNoIGNvbXBvbmVudCBieSB0aGUgc2NhbGFyKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXHJcbiAgICogU2FtZSBhcyBtdWx0aXBseVNjYWxhci5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gdGltZXMoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cclxuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBtdWx0aXBseSggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhciggc2NhbGFyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNdWx0aXBsaWVzIHRoaXMgdmVjdG9yIGJ5IGFub3RoZXIgdmVjdG9yIGNvbXBvbmVudC13aXNlLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gY29tcG9uZW50VGltZXMoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cclxuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb21wb25lbnRNdWx0aXBseSggdjogVmVjdG9yMiApOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLnNldFhZKCB0aGlzLnggKiB2LngsIHRoaXMueSAqIHYueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGl2aWRlcyB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAoZGl2aWRlcyBlYWNoIGNvbXBvbmVudCBieSB0aGUgc2NhbGFyKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGRpdmlkZWRTY2FsYXIoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cclxuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBkaXZpZGVTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIHRoaXMueCAvIHNjYWxhciwgdGhpcy55IC8gc2NhbGFyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBOZWdhdGVzIHRoaXMgdmVjdG9yIChtdWx0aXBsaWVzIGVhY2ggY29tcG9uZW50IGJ5IC0xKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG5lZ2F0ZWQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cclxuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBuZWdhdGUoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRYWSggLXRoaXMueCwgLXRoaXMueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTm9ybWFsaXplcyB0aGlzIHZlY3RvciAocmVzY2FsZXMgdG8gd2hlcmUgdGhlIG1hZ25pdHVkZSBpcyAxKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG5vcm1hbGl6ZWQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cclxuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBub3JtYWxpemUoKTogVmVjdG9yMiB7XHJcbiAgICBjb25zdCBtYWcgPSB0aGlzLm1hZ25pdHVkZTtcclxuICAgIGlmICggbWFnID09PSAwICkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdDYW5ub3Qgbm9ybWFsaXplIGEgemVyby1tYWduaXR1ZGUgdmVjdG9yJyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmRpdmlkZVNjYWxhciggbWFnICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSb3VuZHMgZWFjaCBjb21wb25lbnQgb2YgdGhpcyB2ZWN0b3Igd2l0aCBVdGlscy5yb3VuZFN5bW1ldHJpYy5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm91bmRlZFN5bW1ldHJpYygpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvblxyXG4gICAqIHRvIHJldHVybmluZyB0aGUgdmVjdG9yIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgcm91bmRTeW1tZXRyaWMoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRYWSggVXRpbHMucm91bmRTeW1tZXRyaWMoIHRoaXMueCApLCBVdGlscy5yb3VuZFN5bW1ldHJpYyggdGhpcy55ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJvdGF0ZXMgdGhpcyB2ZWN0b3IgYnkgdGhlIGFuZ2xlIChpbiByYWRpYW5zKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHJvdGF0ZWQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cclxuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGFuZ2xlIC0gSW4gcmFkaWFuc1xyXG4gICAqL1xyXG4gIHB1YmxpYyByb3RhdGUoIGFuZ2xlOiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICBjb25zdCBuZXdBbmdsZSA9IHRoaXMuYW5nbGUgKyBhbmdsZTtcclxuICAgIGNvbnN0IG1hZyA9IHRoaXMubWFnbml0dWRlO1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIG1hZyAqIE1hdGguY29zKCBuZXdBbmdsZSApLCBtYWcgKiBNYXRoLnNpbiggbmV3QW5nbGUgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIHZlY3RvcidzIHZhbHVlIHRvIGJlIHRoZSB4LHkgdmFsdWVzIG1hdGNoaW5nIHRoZSBnaXZlbiBtYWduaXR1ZGUgYW5kIGFuZ2xlIChpbiByYWRpYW5zKSwgY2hhbmdpbmdcclxuICAgKiB0aGlzIHZlY3RvciwgYW5kIHJldHVybmluZyBpdHNlbGYuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbWFnbml0dWRlXHJcbiAgICogQHBhcmFtIGFuZ2xlIC0gSW4gcmFkaWFuc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRQb2xhciggbWFnbml0dWRlOiBudW1iZXIsIGFuZ2xlOiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRYWSggbWFnbml0dWRlICogTWF0aC5jb3MoIGFuZ2xlICksIG1hZ25pdHVkZSAqIE1hdGguc2luKCBhbmdsZSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgZHVjay10eXBlZCBvYmplY3QgbWVhbnQgZm9yIHVzZSB3aXRoIHRhbmRlbS9waGV0LWlvIHNlcmlhbGl6YXRpb24uIEFsdGhvdWdoIHRoaXMgaXMgcmVkdW5kYW50IHdpdGhcclxuICAgKiBzdGF0ZVNjaGVtYSwgaXQgaXMgYSBuaWNlIGZlYXR1cmUgb2Ygc3VjaCBhIGhlYXZpbHktdXNlZCB0eXBlIHRvIGJlIGFibGUgdG8gY2FsbCB0b1N0YXRlT2JqZWN0IGRpcmVjdGx5IG9uIHRoZSB0eXBlLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgLSBzZWUgc3RhdGVTY2hlbWEgZm9yIHNjaGVtYVxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b1N0YXRlT2JqZWN0KCk6IFZlY3RvcjJTdGF0ZU9iamVjdCB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiB0aGlzLngsXHJcbiAgICAgIHk6IHRoaXMueVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBmcmVlVG9Qb29sKCk6IHZvaWQge1xyXG4gICAgVmVjdG9yMi5wb29sLmZyZWVUb1Bvb2woIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgcG9vbCA9IG5ldyBQb29sKCBWZWN0b3IyLCB7XHJcbiAgICBtYXhTaXplOiAxMDAwLFxyXG4gICAgaW5pdGlhbGl6ZTogVmVjdG9yMi5wcm90b3R5cGUuc2V0WFksXHJcbiAgICBkZWZhdWx0QXJndW1lbnRzOiBbIDAsIDAgXVxyXG4gIH0gKTtcclxuXHJcbiAgLy8gc3RhdGljIG1ldGhvZHNcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIFZlY3RvcjIgd2l0aCB0aGUgc3BlY2lmaWVkIG1hZ25pdHVkZSAkciQgYW5kIGFuZ2xlICRcXHRoZXRhJCAoaW4gcmFkaWFucyksIHdpdGggdGhlIGZvcm11bGE6XHJcbiAgICogJCQgZiggciwgXFx0aGV0YSApID0gXFxiZWdpbntibWF0cml4fSByXFxjb3NcXHRoZXRhIFxcXFwgclxcc2luXFx0aGV0YSBcXGVuZHtibWF0cml4fSAkJFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlUG9sYXIoIG1hZ25pdHVkZTogbnVtYmVyLCBhbmdsZTogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCAwLCAwICkuc2V0UG9sYXIoIG1hZ25pdHVkZSwgYW5nbGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdHMgYSBWZWN0b3IyIGZyb20gYSBkdWNrLXR5cGVkIG9iamVjdCwgZm9yIHVzZSB3aXRoIHRhbmRlbS9waGV0LWlvIGRlc2VyaWFsaXphdGlvbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdGF0ZU9iamVjdCAtIHNlZSBzdGF0ZVNjaGVtYSBmb3Igc2NoZW1hXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBmcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0OiBWZWN0b3IyU3RhdGVPYmplY3QgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdjIoXHJcbiAgICAgIHN0YXRlT2JqZWN0LngsXHJcbiAgICAgIHN0YXRlT2JqZWN0LnlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGxvY2F0aW9uLWZyZWUgaW1wbGVtZW50YXRpb24gdGhhdCBnZXRzIHRoZSBhbmdsZSBiZXR3ZWVuIHR3byB2ZWN0b3JzXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB0aGUgYW5nbGUgYmV0d2VlbiB0aGUgdmVjdG9yc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0QW5nbGVCZXR3ZWVuVmVjdG9ycyggc3RhcnRWZWN0b3I6IFZlY3RvcjIsIGVuZFZlY3RvcjogVmVjdG9yMiApOiBudW1iZXIge1xyXG4gICAgY29uc3QgZHggPSBlbmRWZWN0b3IueCAtIHN0YXJ0VmVjdG9yLng7XHJcbiAgICBjb25zdCBkeSA9IGVuZFZlY3Rvci55IC0gc3RhcnRWZWN0b3IueTtcclxuICAgIHJldHVybiBNYXRoLmF0YW4yKCBkeSwgZHggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFsbG9jYXRpb24tZnJlZSB3YXkgdG8gZ2V0IHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHZlY3RvcnMuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB0aGUgYW5nbGUgYmV0d2VlbiB0aGUgdmVjdG9yc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0RGlzdGFuY2VCZXR3ZWVuVmVjdG9ycyggc3RhcnRWZWN0b3I6IFZlY3RvcjIsIGVuZFZlY3RvcjogVmVjdG9yMiApOiBudW1iZXIge1xyXG4gICAgY29uc3QgZHggPSBlbmRWZWN0b3IueCAtIHN0YXJ0VmVjdG9yLng7XHJcbiAgICBjb25zdCBkeSA9IGVuZFZlY3Rvci55IC0gc3RhcnRWZWN0b3IueTtcclxuICAgIHJldHVybiBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNWZWN0b3IyITogYm9vbGVhbjtcclxuICBwdWJsaWMgZGltZW5zaW9uITogbnVtYmVyO1xyXG5cclxuICAvKipcclxuICAgKiBJbW11dGFibGVWZWN0b3IyIHplcm8gdmVjdG9yOiAkXFxiZWdpbntibWF0cml4fSAwXFxcXDAgXFxlbmR7Ym1hdHJpeH0kXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBaRVJPOiBWZWN0b3IyOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHVwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxyXG5cclxuICAvKipcclxuICAgKiBJbW11dGFibGVWZWN0b3IyIHZlY3RvcjogJFxcYmVnaW57Ym1hdHJpeH0gMVxcXFwwIFxcZW5ke2JtYXRyaXh9JFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgWF9VTklUOiBWZWN0b3IyOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHVwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxyXG5cclxuICAvKipcclxuICAgKiBJbW11dGFibGVWZWN0b3IyIHZlY3RvcjogJFxcYmVnaW57Ym1hdHJpeH0gMFxcXFwxIFxcZW5ke2JtYXRyaXh9JFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgWV9VTklUOiBWZWN0b3IyOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHVwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxyXG5cclxuICBwdWJsaWMgc3RhdGljIFZlY3RvcjJJTzogSU9UeXBlO1xyXG59XHJcblxyXG4vLyAocmVhZC1vbmx5KSAtIEhlbHBzIHRvIGlkZW50aWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHZlY3RvclxyXG5WZWN0b3IyLnByb3RvdHlwZS5pc1ZlY3RvcjIgPSB0cnVlO1xyXG5WZWN0b3IyLnByb3RvdHlwZS5kaW1lbnNpb24gPSAyO1xyXG5cclxuZG90LnJlZ2lzdGVyKCAnVmVjdG9yMicsIFZlY3RvcjIgKTtcclxuXHJcbmNvbnN0IHYyID0gVmVjdG9yMi5wb29sLmNyZWF0ZS5iaW5kKCBWZWN0b3IyLnBvb2wgKTtcclxuZG90LnJlZ2lzdGVyKCAndjInLCB2MiApO1xyXG5cclxuY2xhc3MgSW1tdXRhYmxlVmVjdG9yMiBleHRlbmRzIFZlY3RvcjIge1xyXG4gIC8qKlxyXG4gICAqIFRocm93IGVycm9ycyB3aGVuZXZlciBhIG11dGFibGUgbWV0aG9kIGlzIGNhbGxlZCBvbiBvdXIgaW1tdXRhYmxlIHZlY3RvclxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgbXV0YWJsZU92ZXJyaWRlSGVscGVyKCBtdXRhYmxlRnVuY3Rpb25OYW1lOiAnc2V0WCcgfCAnc2V0WScgfCAnc2V0WFknICk6IHZvaWQge1xyXG4gICAgSW1tdXRhYmxlVmVjdG9yMi5wcm90b3R5cGVbIG11dGFibGVGdW5jdGlvbk5hbWUgXSA9ICgpID0+IHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgQ2Fubm90IGNhbGwgbXV0YWJsZSBtZXRob2QgJyR7bXV0YWJsZUZ1bmN0aW9uTmFtZX0nIG9uIGltbXV0YWJsZSBWZWN0b3IyYCApO1xyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbkltbXV0YWJsZVZlY3RvcjIubXV0YWJsZU92ZXJyaWRlSGVscGVyKCAnc2V0WFknICk7XHJcbkltbXV0YWJsZVZlY3RvcjIubXV0YWJsZU92ZXJyaWRlSGVscGVyKCAnc2V0WCcgKTtcclxuSW1tdXRhYmxlVmVjdG9yMi5tdXRhYmxlT3ZlcnJpZGVIZWxwZXIoICdzZXRZJyApO1xyXG5cclxuVmVjdG9yMi5aRVJPID0gYXNzZXJ0ID8gbmV3IEltbXV0YWJsZVZlY3RvcjIoIDAsIDAgKSA6IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblZlY3RvcjIuWF9VTklUID0gYXNzZXJ0ID8gbmV3IEltbXV0YWJsZVZlY3RvcjIoIDEsIDAgKSA6IG5ldyBWZWN0b3IyKCAxLCAwICk7XHJcblZlY3RvcjIuWV9VTklUID0gYXNzZXJ0ID8gbmV3IEltbXV0YWJsZVZlY3RvcjIoIDAsIDEgKSA6IG5ldyBWZWN0b3IyKCAwLCAxICk7XHJcblxyXG5leHBvcnQgdHlwZSBWZWN0b3IyU3RhdGVPYmplY3QgPSB7XHJcbiAgeDogbnVtYmVyO1xyXG4gIHk6IG51bWJlcjtcclxufTtcclxuXHJcblZlY3RvcjIuVmVjdG9yMklPID0gbmV3IElPVHlwZTxWZWN0b3IyLCBWZWN0b3IyU3RhdGVPYmplY3Q+KCAnVmVjdG9yMklPJywge1xyXG4gIHZhbHVlVHlwZTogVmVjdG9yMixcclxuICBzdGF0ZVNjaGVtYToge1xyXG4gICAgeDogTnVtYmVySU8sXHJcbiAgICB5OiBOdW1iZXJJT1xyXG4gIH0sXHJcbiAgdG9TdGF0ZU9iamVjdDogKCB2ZWN0b3IyOiBWZWN0b3IyICkgPT4gdmVjdG9yMi50b1N0YXRlT2JqZWN0KCksXHJcbiAgZnJvbVN0YXRlT2JqZWN0OiAoIHN0YXRlT2JqZWN0OiBWZWN0b3IyU3RhdGVPYmplY3QgKSA9PiBWZWN0b3IyLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QgKSxcclxuICBkb2N1bWVudGF0aW9uOiAnQSBudW1lcmljYWwgb2JqZWN0IHdpdGggeCBhbmQgeSBwcm9wZXJ0aWVzLCBsaWtlIHt4OjMseTo0fSdcclxufSApO1xyXG5cclxuZXhwb3J0IHsgdjIgfTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLElBQUksTUFBcUIsNEJBQTRCO0FBQzVELE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxPQUFPQyxHQUFHLE1BQU0sVUFBVTtBQUMxQixPQUFPQyxLQUFLLE1BQU0sWUFBWTtBQUM5QixPQUFPQyxPQUFPLE1BQU0sY0FBYztBQUVsQyxNQUFNQyxrQkFBa0IsR0FBR0EsQ0FBRUMsTUFBZSxFQUFFQyxVQUFtQixLQUFNO0VBQ3JFLE9BQU9ELE1BQU0sQ0FBQ0UsR0FBRyxDQUFFRCxVQUFXLENBQUM7QUFDakMsQ0FBQztBQUVELGVBQWUsTUFBTUUsT0FBTyxDQUFzQjtFQUVoRDs7RUFHQTs7RUFHQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0MsV0FBV0EsQ0FBRUMsQ0FBUyxFQUFFQyxDQUFTLEVBQUc7SUFDekMsSUFBSSxDQUFDRCxDQUFDLEdBQUdBLENBQUM7SUFDVixJQUFJLENBQUNDLENBQUMsR0FBR0EsQ0FBQztFQUNaOztFQUVBO0FBQ0Y7QUFDQTtFQUNTQyxZQUFZQSxDQUFBLEVBQVc7SUFDNUIsT0FBT0MsSUFBSSxD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