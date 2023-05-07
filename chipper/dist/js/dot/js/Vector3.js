// Copyright 2013-2023, University of Colorado Boulder

/**
 * Basic 3-dimensional vector, represented as (x,y,z).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Pool from '../../phet-core/js/Pool.js';
import IOType from '../../tandem/js/types/IOType.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import dot from './dot.js';
import Utils from './Utils.js';
import { v2 } from './Vector2.js';
import { v4 } from './Vector4.js';
const ADDING_ACCUMULATOR = (vector, nextVector) => {
  return vector.add(nextVector);
};
export default class Vector3 {
  // The X coordinate of the vector.

  // The Y coordinate of the vector.

  // The Z coordinate of the vector.

  /**
   * Creates a 3-dimensional vector with the specified X, Y and Z values.
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   */
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * The magnitude (Euclidean/L2 Norm) of this vector, i.e. $\sqrt{x^2+y^2+z^2}$.
   */
  getMagnitude() {
    return Math.sqrt(this.magnitudeSquared);
  }
  get magnitude() {
    return this.getMagnitude();
  }

  /**
   * T squared magnitude (square of the Euclidean/L2 Norm) of this vector, i.e. $x^2+y^2+z^2$.
   */
  getMagnitudeSquared() {
    return this.dot(this);
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
   * The Euclidean distance between this vector (treated as a point) and another point (x,y,z).
   */
  distanceXYZ(x, y, z) {
    const dx = this.x - x;
    const dy = this.y - y;
    const dz = this.z - z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * The squared Euclidean distance between this vector (treated as a point) and another point.
   */
  distanceSquared(point) {
    const dx = this.x - point.x;
    const dy = this.y - point.y;
    const dz = this.z - point.z;
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * The squared Euclidean distance between this vector (treated as a point) and another point (x,y,z).
   */
  distanceSquaredXYZ(x, y, z) {
    const dx = this.x - x;
    const dy = this.y - y;
    const dz = this.z - z;
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * The dot-product (Euclidean inner product) between this vector and another vector v.
   */
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * The dot-product (Euclidean inner product) between this vector and another vector (x,y,z).
   */
  dotXYZ(x, y, z) {
    return this.x * x + this.y * y + this.z * z;
  }

  /**
   * The angle between this vector and another vector, in the range $\theta\in[0, \pi]$.
   *
   * Equal to $\theta = \cos^{-1}( \hat{u} \cdot \hat{v} )$ where $\hat{u}$ is this vector (normalized) and $\hat{v}$
   * is the input vector (normalized).
   */
  angleBetween(v) {
    return Math.acos(Utils.clamp(this.normalized().dot(v.normalized()), -1, 1));
  }

  /**
   * Exact equality comparison between this vector and another vector.
   *
   * @returns - Whether the two vectors have equal components
   */
  equals(other) {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }

  /**
   * Approximate equality comparison between this vector and another vector.
   *
   * @returns - Whether difference between the two vectors has no component with an absolute value greater
   *                      than epsilon.
   */
  equalsEpsilon(other, epsilon) {
    if (!epsilon) {
      epsilon = 0;
    }
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) + Math.abs(this.z - other.z) <= epsilon;
  }

  /**
   * Returns false if any component is NaN, infinity, or -infinity. Otherwise returns true.
   */
  isFinite() {
    return isFinite(this.x) && isFinite(this.y) && isFinite(this.z);
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
   * @param [vector] - If not provided, creates a new Vector3 with filled in values. Otherwise, fills in the
   *                   values of the provided vector so that it equals this vector.
   */
  copy(vector) {
    if (vector) {
      return vector.set(this);
    } else {
      return v3(this.x, this.y, this.z);
    }
  }

  /**
   * The Euclidean 3-dimensional cross-product of this vector by the passed-in vector.
   */
  cross(v) {
    return v3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
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
      return v3(this.x / mag, this.y / mag, this.z / mag);
    }
  }

  /**
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
    return v3(this.x * scalar, this.y * scalar, this.z * scalar);
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
    return v3(this.x * v.x, this.y * v.y, this.z * v.z);
  }

  /**
   * Addition of this vector and another vector, returning a copy.
   *
   * This is the immutable form of the function add(). This will return a new vector, and will not modify
   * this vector.
   */
  plus(v) {
    return v3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  /**
   * Addition of this vector and another vector (x,y,z), returning a copy.
   *
   * This is the immutable form of the function addXYZ(). This will return a new vector, and will not modify
   * this vector.
   */
  plusXYZ(x, y, z) {
    return v3(this.x + x, this.y + y, this.z + z);
  }

  /**
   * Addition of this vector with a scalar (adds the scalar to every component), returning a copy.
   *
   * This is the immutable form of the function addScalar(). This will return a new vector, and will not modify
   * this vector.
   */
  plusScalar(scalar) {
    return v3(this.x + scalar, this.y + scalar, this.z + scalar);
  }

  /**
   * Subtraction of this vector by another vector v, returning a copy.
   *
   * This is the immutable form of the function subtract(). This will return a new vector, and will not modify
   * this vector.
   */
  minus(v) {
    return v3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  /**
   * Subtraction of this vector by another vector (x,y,z), returning a copy.
   *
   * This is the immutable form of the function subtractXYZ(). This will return a new vector, and will not modify
   * this vector.
   */
  minusXYZ(x, y, z) {
    return v3(this.x - x, this.y - y, this.z - z);
  }

  /**
   * Subtraction of this vector by a scalar (subtracts the scalar from every component), returning a copy.
   *
   * This is the immutable form of the function subtractScalar(). This will return a new vector, and will not modify
   * this vector.
   */
  minusScalar(scalar) {
    return v3(this.x - scalar, this.y - scalar, this.z - scalar);
  }

  /**
   * Division of this vector by a scalar (divides every component by the scalar), returning a copy.
   *
   * This is the immutable form of the function divideScalar(). This will return a new vector, and will not modify
   * this vector.
   */
  dividedScalar(scalar) {
    return v3(this.x / scalar, this.y / scalar, this.z / scalar);
  }

  /**
   * Negated copy of this vector (multiplies every component by -1).
   *
   * This is the immutable form of the function negate(). This will return a new vector, and will not modify
   * this vector.
   *
   */
  negated() {
    return v3(-this.x, -this.y, -this.z);
  }

  /**
   * A linear interpolation between this vector (ratio=0) and another vector (ratio=1).
   *
   * @param vector
   * @param ratio - Not necessarily constrained in [0, 1]
   */
  blend(vector, ratio) {
    return this.plus(vector.minus(this).times(ratio));
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
    const added = _.reduce(vectors, ADDING_ACCUMULATOR, new Vector3(0, 0, 0));
    return added.divideScalar(vectors.length);
  }

  /**
   * Debugging string for the vector.
   */
  toString() {
    return `Vector3(${this.x}, ${this.y}, ${this.z})`;
  }

  /**
   * Converts this to a 2-dimensional vector, discarding the z-component.
   */
  toVector2() {
    return v2(this.x, this.y);
  }

  /**
   * Converts this to a 4-dimensional vector, with the w-component equal to 1 (useful for homogeneous coordinates).
   */
  toVector4() {
    return v4(this.x, this.y, this.z, 1);
  }

  /*---------------------------------------------------------------------------*
   * Mutables
   * - all mutation should go through setXYZ / setX / setY / setZ
   *---------------------------------------------------------------------------*/

  /**
   * Sets all of the components of this vector, returning this.
   */
  setXYZ(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
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
   * Sets the z-component of this vector, returning this.
   */
  setZ(z) {
    this.z = z;
    return this;
  }

  /**
   * Sets this vector to be a copy of another vector.
   *
   * This is the mutable form of the function copy(). This will mutate (change) this vector, in addition to returning
   * this vector itself.
   */
  set(v) {
    return this.setXYZ(v.x, v.y, v.z);
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
    return this.setXYZ(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  /**
   * Adds another vector (x,y,z) to this vector, changing this vector.
   *
   * This is the mutable form of the function plusXYZ(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  addXYZ(x, y, z) {
    return this.setXYZ(this.x + x, this.y + y, this.z + z);
  }

  /**
   * Adds a scalar to this vector (added to every component), changing this vector.
   *
   * This is the mutable form of the function plusScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  addScalar(scalar) {
    return this.setXYZ(this.x + scalar, this.y + scalar, this.z + scalar);
  }

  /**
   * Subtracts this vector by another vector, changing this vector.
   *
   * This is the mutable form of the function minus(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  subtract(v) {
    return this.setXYZ(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  /**
   * Subtracts this vector by another vector (x,y,z), changing this vector.
   *
   * This is the mutable form of the function minusXYZ(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  subtractXYZ(x, y, z) {
    return this.setXYZ(this.x - x, this.y - y, this.z - z);
  }

  /**
   * Subtracts this vector by a scalar (subtracts each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function minusScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  subtractScalar(scalar) {
    return this.setXYZ(this.x - scalar, this.y - scalar, this.z - scalar);
  }

  /**
   * Multiplies this vector by a scalar (multiplies each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function timesScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  multiplyScalar(scalar) {
    return this.setXYZ(this.x * scalar, this.y * scalar, this.z * scalar);
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
    return this.setXYZ(this.x * v.x, this.y * v.y, this.z * v.z);
  }

  /**
   * Divides this vector by a scalar (divides each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function dividedScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  divideScalar(scalar) {
    return this.setXYZ(this.x / scalar, this.y / scalar, this.z / scalar);
  }

  /**
   * Negates this vector (multiplies each component by -1), changing this vector.
   *
   * This is the mutable form of the function negated(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */
  negate() {
    return this.setXYZ(-this.x, -this.y, -this.z);
  }

  /**
   * Sets our value to the Euclidean 3-dimensional cross-product of this vector by the passed-in vector.
   */
  setCross(v) {
    return this.setXYZ(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
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
    return this.setXYZ(Utils.roundSymmetric(this.x), Utils.roundSymmetric(this.y), Utils.roundSymmetric(this.z));
  }

  /**
   * Returns a duck-typed object meant for use with tandem/phet-io serialization.
   */
  toStateObject() {
    return {
      x: this.x,
      y: this.y,
      z: this.z
    };
  }
  freeToPool() {
    Vector3.pool.freeToPool(this);
  }
  static pool = new Pool(Vector3, {
    maxSize: 1000,
    initialize: Vector3.prototype.setXYZ,
    defaultArguments: [0, 0, 0]
  });

  // static methods

  /**
   * Spherical linear interpolation between two unit vectors.
   *
   * @param start - Start unit vector
   * @param end - End unit vector
   * @param ratio  - Between 0 (at start vector) and 1 (at end vector)
   * @returns Spherical linear interpolation between the start and end
   */
  static slerp(start, end, ratio) {
    // @ts-expect-error TODO: import with circular protection
    return dot.Quaternion.slerp(new dot.Quaternion(), dot.Quaternion.getRotationQuaternion(start, end), ratio).timesVector3(start);
  }

  /**
   * Constructs a Vector3 from a duck-typed object, for use with tandem/phet-io deserialization.
   */
  static fromStateObject(stateObject) {
    return v3(stateObject.x, stateObject.y, stateObject.z);
  }

  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
}

// (read-only) - Helps to identify the dimension of the vector
Vector3.prototype.isVector3 = true;
Vector3.prototype.dimension = 3;
dot.register('Vector3', Vector3);
const v3 = Vector3.pool.create.bind(Vector3.pool);
dot.register('v3', v3);
class ImmutableVector3 extends Vector3 {
  /**
   * Throw errors whenever a mutable method is called on our immutable vector
   */
  static mutableOverrideHelper(mutableFunctionName) {
    ImmutableVector3.prototype[mutableFunctionName] = () => {
      throw new Error(`Cannot call mutable method '${mutableFunctionName}' on immutable Vector3`);
    };
  }
}
ImmutableVector3.mutableOverrideHelper('setXYZ');
ImmutableVector3.mutableOverrideHelper('setX');
ImmutableVector3.mutableOverrideHelper('setY');
ImmutableVector3.mutableOverrideHelper('setZ');
Vector3.ZERO = assert ? new ImmutableVector3(0, 0, 0) : new Vector3(0, 0, 0);
Vector3.X_UNIT = assert ? new ImmutableVector3(1, 0, 0) : new Vector3(1, 0, 0);
Vector3.Y_UNIT = assert ? new ImmutableVector3(0, 1, 0) : new Vector3(0, 1, 0);
Vector3.Z_UNIT = assert ? new ImmutableVector3(0, 0, 1) : new Vector3(0, 0, 1);
Vector3.Vector3IO = new IOType('Vector3IO', {
  valueType: Vector3,
  documentation: 'Basic 3-dimensional vector, represented as (x,y,z)',
  toStateObject: vector3 => vector3.toStateObject(),
  fromStateObject: Vector3.fromStateObject,
  stateSchema: {
    x: NumberIO,
    y: NumberIO,
    z: NumberIO
  }
});
export { v3 };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQb29sIiwiSU9UeXBlIiwiTnVtYmVySU8iLCJkb3QiLCJVdGlscyIsInYyIiwidjQiLCJBRERJTkdfQUNDVU1VTEFUT1IiLCJ2ZWN0b3IiLCJuZXh0VmVjdG9yIiwiYWRkIiwiVmVjdG9yMyIsImNvbnN0cnVjdG9yIiwieCIsInkiLCJ6IiwiZ2V0TWFnbml0dWRlIiwiTWF0aCIsInNxcnQiLCJtYWduaXR1ZGVTcXVhcmVkIiwibWFnbml0dWRlIiwiZ2V0TWFnbml0dWRlU3F1YXJlZCIsImRpc3RhbmNlIiwicG9pbnQiLCJkaXN0YW5jZVNxdWFyZWQiLCJkaXN0YW5jZVhZWiIsImR4IiwiZHkiLCJkeiIsImRpc3RhbmNlU3F1YXJlZFhZWiIsInYiLCJkb3RYWVoiLCJhbmdsZUJldHdlZW4iLCJhY29zIiwiY2xhbXAiLCJub3JtYWxpemVkIiwiZXF1YWxzIiwib3RoZXIiLCJlcXVhbHNFcHNpbG9uIiwiZXBzaWxvbiIsImFicyIsImlzRmluaXRlIiwiY29weSIsInNldCIsInYzIiwiY3Jvc3MiLCJtYWciLCJFcnJvciIsInJvdW5kZWRTeW1tZXRyaWMiLCJyb3VuZFN5bW1ldHJpYyIsIndpdGhNYWduaXR1ZGUiLCJzZXRNYWduaXR1ZGUiLCJ0aW1lc1NjYWxhciIsInNjYWxhciIsInRpbWVzIiwiY29tcG9uZW50VGltZXMiLCJwbHVzIiwicGx1c1hZWiIsInBsdXNTY2FsYXIiLCJtaW51cyIsIm1pbnVzWFlaIiwibWludXNTY2FsYXIiLCJkaXZpZGVkU2NhbGFyIiwibmVnYXRlZCIsImJsZW5kIiwicmF0aW8iLCJhdmVyYWdlIiwidmVjdG9ycyIsImFkZGVkIiwiXyIsInJlZHVjZSIsImRpdmlkZVNjYWxhciIsImxlbmd0aCIsInRvU3RyaW5nIiwidG9WZWN0b3IyIiwidG9WZWN0b3I0Iiwic2V0WFlaIiwic2V0WCIsInNldFkiLCJzZXRaIiwic2NhbGUiLCJtdWx0aXBseVNjYWxhciIsImFkZFhZWiIsImFkZFNjYWxhciIsInN1YnRyYWN0Iiwic3VidHJhY3RYWVoiLCJzdWJ0cmFjdFNjYWxhciIsIm11bHRpcGx5IiwiY29tcG9uZW50TXVsdGlwbHkiLCJuZWdhdGUiLCJzZXRDcm9zcyIsIm5vcm1hbGl6ZSIsInRvU3RhdGVPYmplY3QiLCJmcmVlVG9Qb29sIiwicG9vbCIsIm1heFNpemUiLCJpbml0aWFsaXplIiwicHJvdG90eXBlIiwiZGVmYXVsdEFyZ3VtZW50cyIsInNsZXJwIiwic3RhcnQiLCJlbmQiLCJRdWF0ZXJuaW9uIiwiZ2V0Um90YXRpb25RdWF0ZXJuaW9uIiwidGltZXNWZWN0b3IzIiwiZnJvbVN0YXRlT2JqZWN0Iiwic3RhdGVPYmplY3QiLCJpc1ZlY3RvcjMiLCJkaW1lbnNpb24iLCJyZWdpc3RlciIsImNyZWF0ZSIsImJpbmQiLCJJbW11dGFibGVWZWN0b3IzIiwibXV0YWJsZU92ZXJyaWRlSGVscGVyIiwibXV0YWJsZUZ1bmN0aW9uTmFtZSIsIlpFUk8iLCJhc3NlcnQiLCJYX1VOSVQiLCJZX1VOSVQiLCJaX1VOSVQiLCJWZWN0b3IzSU8iLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwidmVjdG9yMyIsInN0YXRlU2NoZW1hIl0sInNvdXJjZXMiOlsiVmVjdG9yMy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNpYyAzLWRpbWVuc2lvbmFsIHZlY3RvciwgcmVwcmVzZW50ZWQgYXMgKHgseSx6KS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBQb29sLCB7IFRQb29sYWJsZSB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyLCB7IHYyIH0gZnJvbSAnLi9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjQsIHsgdjQgfSBmcm9tICcuL1ZlY3RvcjQuanMnO1xyXG5cclxuY29uc3QgQURESU5HX0FDQ1VNVUxBVE9SID0gKCB2ZWN0b3I6IFZlY3RvcjMsIG5leHRWZWN0b3I6IFZlY3RvcjMgKSA9PiB7XHJcbiAgcmV0dXJuIHZlY3Rvci5hZGQoIG5leHRWZWN0b3IgKTtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFZlY3RvcjNTdGF0ZU9iamVjdCA9IHtcclxuICB4OiBudW1iZXI7XHJcbiAgeTogbnVtYmVyO1xyXG4gIHo6IG51bWJlcjtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlY3RvcjMgaW1wbGVtZW50cyBUUG9vbGFibGUge1xyXG5cclxuICAvLyBUaGUgWCBjb29yZGluYXRlIG9mIHRoZSB2ZWN0b3IuXHJcbiAgcHVibGljIHg6IG51bWJlcjtcclxuXHJcbiAgLy8gVGhlIFkgY29vcmRpbmF0ZSBvZiB0aGUgdmVjdG9yLlxyXG4gIHB1YmxpYyB5OiBudW1iZXI7XHJcblxyXG4gIC8vIFRoZSBaIGNvb3JkaW5hdGUgb2YgdGhlIHZlY3Rvci5cclxuICBwdWJsaWMgejogbnVtYmVyO1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgMy1kaW1lbnNpb25hbCB2ZWN0b3Igd2l0aCB0aGUgc3BlY2lmaWVkIFgsIFkgYW5kIFogdmFsdWVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHggLSBYIGNvb3JkaW5hdGVcclxuICAgKiBAcGFyYW0geSAtIFkgY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSB6IC0gWiBjb29yZGluYXRlXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyICkge1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLnogPSB6O1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBtYWduaXR1ZGUgKEV1Y2xpZGVhbi9MMiBOb3JtKSBvZiB0aGlzIHZlY3RvciwgaS5lLiAkXFxzcXJ0e3heMit5XjIrel4yfSQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldE1hZ25pdHVkZSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5tYWduaXR1ZGVTcXVhcmVkICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IG1hZ25pdHVkZSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TWFnbml0dWRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUIHNxdWFyZWQgbWFnbml0dWRlIChzcXVhcmUgb2YgdGhlIEV1Y2xpZGVhbi9MMiBOb3JtKSBvZiB0aGlzIHZlY3RvciwgaS5lLiAkeF4yK3leMit6XjIkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRNYWduaXR1ZGVTcXVhcmVkKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5kb3QoIHRoaXMgYXMgdW5rbm93biBhcyBWZWN0b3IzICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IG1hZ25pdHVkZVNxdWFyZWQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldE1hZ25pdHVkZVNxdWFyZWQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBFdWNsaWRlYW4gZGlzdGFuY2UgYmV0d2VlbiB0aGlzIHZlY3RvciAodHJlYXRlZCBhcyBhIHBvaW50KSBhbmQgYW5vdGhlciBwb2ludC5cclxuICAgKi9cclxuICBwdWJsaWMgZGlzdGFuY2UoIHBvaW50OiBWZWN0b3IzICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLmRpc3RhbmNlU3F1YXJlZCggcG9pbnQgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIEV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoaXMgdmVjdG9yICh0cmVhdGVkIGFzIGEgcG9pbnQpIGFuZCBhbm90aGVyIHBvaW50ICh4LHkseikuXHJcbiAgICovXHJcbiAgcHVibGljIGRpc3RhbmNlWFlaKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBjb25zdCBkeCA9IHRoaXMueCAtIHg7XHJcbiAgICBjb25zdCBkeSA9IHRoaXMueSAtIHk7XHJcbiAgICBjb25zdCBkeiA9IHRoaXMueiAtIHo7XHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCBkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBzcXVhcmVkIEV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoaXMgdmVjdG9yICh0cmVhdGVkIGFzIGEgcG9pbnQpIGFuZCBhbm90aGVyIHBvaW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBkaXN0YW5jZVNxdWFyZWQoIHBvaW50OiBWZWN0b3IzICk6IG51bWJlciB7XHJcbiAgICBjb25zdCBkeCA9IHRoaXMueCAtIHBvaW50Lng7XHJcbiAgICBjb25zdCBkeSA9IHRoaXMueSAtIHBvaW50Lnk7XHJcbiAgICBjb25zdCBkeiA9IHRoaXMueiAtIHBvaW50Lno7XHJcbiAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHNxdWFyZWQgRXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhpcyB2ZWN0b3IgKHRyZWF0ZWQgYXMgYSBwb2ludCkgYW5kIGFub3RoZXIgcG9pbnQgKHgseSx6KS5cclxuICAgKi9cclxuICBwdWJsaWMgZGlzdGFuY2VTcXVhcmVkWFlaKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBjb25zdCBkeCA9IHRoaXMueCAtIHg7XHJcbiAgICBjb25zdCBkeSA9IHRoaXMueSAtIHk7XHJcbiAgICBjb25zdCBkeiA9IHRoaXMueiAtIHo7XHJcbiAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGRvdC1wcm9kdWN0IChFdWNsaWRlYW4gaW5uZXIgcHJvZHVjdCkgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlciB2ZWN0b3Igdi5cclxuICAgKi9cclxuICBwdWJsaWMgZG90KCB2OiBWZWN0b3IzICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55ICsgdGhpcy56ICogdi56O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGRvdC1wcm9kdWN0IChFdWNsaWRlYW4gaW5uZXIgcHJvZHVjdCkgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlciB2ZWN0b3IgKHgseSx6KS5cclxuICAgKi9cclxuICBwdWJsaWMgZG90WFlaKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy54ICogeCArIHRoaXMueSAqIHkgKyB0aGlzLnogKiB6O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGFuZ2xlIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yLCBpbiB0aGUgcmFuZ2UgJFxcdGhldGFcXGluWzAsIFxccGldJC5cclxuICAgKlxyXG4gICAqIEVxdWFsIHRvICRcXHRoZXRhID0gXFxjb3Neey0xfSggXFxoYXR7dX0gXFxjZG90IFxcaGF0e3Z9ICkkIHdoZXJlICRcXGhhdHt1fSQgaXMgdGhpcyB2ZWN0b3IgKG5vcm1hbGl6ZWQpIGFuZCAkXFxoYXR7dn0kXHJcbiAgICogaXMgdGhlIGlucHV0IHZlY3RvciAobm9ybWFsaXplZCkuXHJcbiAgICovXHJcbiAgcHVibGljIGFuZ2xlQmV0d2VlbiggdjogVmVjdG9yMyApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIE1hdGguYWNvcyggVXRpbHMuY2xhbXAoIHRoaXMubm9ybWFsaXplZCgpLmRvdCggdi5ub3JtYWxpemVkKCkgKSwgLTEsIDEgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXhhY3QgZXF1YWxpdHkgY29tcGFyaXNvbiBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyIHZlY3Rvci5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciB0aGUgdHdvIHZlY3RvcnMgaGF2ZSBlcXVhbCBjb21wb25lbnRzXHJcbiAgICovXHJcbiAgcHVibGljIGVxdWFscyggb3RoZXI6IFZlY3RvcjMgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy54ID09PSBvdGhlci54ICYmIHRoaXMueSA9PT0gb3RoZXIueSAmJiB0aGlzLnogPT09IG90aGVyLno7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHByb3hpbWF0ZSBlcXVhbGl0eSBjb21wYXJpc29uIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgdHdvIHZlY3RvcnMgaGFzIG5vIGNvbXBvbmVudCB3aXRoIGFuIGFic29sdXRlIHZhbHVlIGdyZWF0ZXJcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICB0aGFuIGVwc2lsb24uXHJcbiAgICovXHJcbiAgcHVibGljIGVxdWFsc0Vwc2lsb24oIG90aGVyOiBWZWN0b3IzLCBlcHNpbG9uOiBudW1iZXIgKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoICFlcHNpbG9uICkge1xyXG4gICAgICBlcHNpbG9uID0gMDtcclxuICAgIH1cclxuICAgIHJldHVybiBNYXRoLmFicyggdGhpcy54IC0gb3RoZXIueCApICsgTWF0aC5hYnMoIHRoaXMueSAtIG90aGVyLnkgKSArIE1hdGguYWJzKCB0aGlzLnogLSBvdGhlci56ICkgPD0gZXBzaWxvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgZmFsc2UgaWYgYW55IGNvbXBvbmVudCBpcyBOYU4sIGluZmluaXR5LCBvciAtaW5maW5pdHkuIE90aGVyd2lzZSByZXR1cm5zIHRydWUuXHJcbiAgICovXHJcbiAgcHVibGljIGlzRmluaXRlKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGlzRmluaXRlKCB0aGlzLnggKSAmJiBpc0Zpbml0ZSggdGhpcy55ICkgJiYgaXNGaW5pdGUoIHRoaXMueiApO1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogSW1tdXRhYmxlc1xyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyB2ZWN0b3IsIG9yIGlmIGEgdmVjdG9yIGlzIHBhc3NlZCBpbiwgc2V0IHRoYXQgdmVjdG9yJ3MgdmFsdWVzIHRvIG91cnMuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2V0KCksIGlmIGEgdmVjdG9yIGlzIHByb3ZpZGVkLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kXHJcbiAgICogd2lsbCBub3QgbW9kaWZ5IHRoaXMgdmVjdG9yLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIFt2ZWN0b3JdIC0gSWYgbm90IHByb3ZpZGVkLCBjcmVhdGVzIGEgbmV3IFZlY3RvcjMgd2l0aCBmaWxsZWQgaW4gdmFsdWVzLiBPdGhlcndpc2UsIGZpbGxzIGluIHRoZVxyXG4gICAqICAgICAgICAgICAgICAgICAgIHZhbHVlcyBvZiB0aGUgcHJvdmlkZWQgdmVjdG9yIHNvIHRoYXQgaXQgZXF1YWxzIHRoaXMgdmVjdG9yLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb3B5KCB2ZWN0b3I/OiBWZWN0b3IzICk6IFZlY3RvcjMge1xyXG4gICAgaWYgKCB2ZWN0b3IgKSB7XHJcbiAgICAgIHJldHVybiB2ZWN0b3Iuc2V0KCB0aGlzIGFzIHVua25vd24gYXMgVmVjdG9yMyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB2MyggdGhpcy54LCB0aGlzLnksIHRoaXMueiApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIEV1Y2xpZGVhbiAzLWRpbWVuc2lvbmFsIGNyb3NzLXByb2R1Y3Qgb2YgdGhpcyB2ZWN0b3IgYnkgdGhlIHBhc3NlZC1pbiB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIGNyb3NzKCB2OiBWZWN0b3IzICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHYzKFxyXG4gICAgICB0aGlzLnkgKiB2LnogLSB0aGlzLnogKiB2LnksXHJcbiAgICAgIHRoaXMueiAqIHYueCAtIHRoaXMueCAqIHYueixcclxuICAgICAgdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTm9ybWFsaXplZCAocmUtc2NhbGVkKSBjb3B5IG9mIHRoaXMgdmVjdG9yIHN1Y2ggdGhhdCBpdHMgbWFnbml0dWRlIGlzIDEuIElmIGl0cyBpbml0aWFsIG1hZ25pdHVkZSBpcyB6ZXJvLCBhblxyXG4gICAqIGVycm9yIGlzIHRocm93bi5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBub3JtYWxpemUoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnkgdGhpc1xyXG4gICAqIHZlY3Rvci5cclxuICAgKi9cclxuICBwdWJsaWMgbm9ybWFsaXplZCgpOiBWZWN0b3IzIHtcclxuICAgIGNvbnN0IG1hZyA9IHRoaXMubWFnbml0dWRlO1xyXG4gICAgaWYgKCBtYWcgPT09IDAgKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ0Nhbm5vdCBub3JtYWxpemUgYSB6ZXJvLW1hZ25pdHVkZSB2ZWN0b3InICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHYzKCB0aGlzLnggLyBtYWcsIHRoaXMueSAvIG1hZywgdGhpcy56IC8gbWFnICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiByb3VuZFN5bW1ldHJpYygpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgdmVjdG9yLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByb3VuZGVkU3ltbWV0cmljKCk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHRoaXMuY29weSgpLnJvdW5kU3ltbWV0cmljKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZS1zY2FsZWQgY29weSBvZiB0aGlzIHZlY3RvciBzdWNoIHRoYXQgaXQgaGFzIHRoZSBkZXNpcmVkIG1hZ25pdHVkZS4gSWYgaXRzIGluaXRpYWwgbWFnbml0dWRlIGlzIHplcm8sIGFuIGVycm9yXHJcbiAgICogaXMgdGhyb3duLiBJZiB0aGUgcGFzc2VkLWluIG1hZ25pdHVkZSBpcyBuZWdhdGl2ZSwgdGhlIGRpcmVjdGlvbiBvZiB0aGUgcmVzdWx0aW5nIHZlY3RvciB3aWxsIGJlIHJldmVyc2VkLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNldE1hZ25pdHVkZSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgdmVjdG9yLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB3aXRoTWFnbml0dWRlKCBtYWduaXR1ZGU6IG51bWJlciApOiBWZWN0b3IzIHtcclxuICAgIHJldHVybiB0aGlzLmNvcHkoKS5zZXRNYWduaXR1ZGUoIG1hZ25pdHVkZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29weSBvZiB0aGlzIHZlY3Rvciwgc2NhbGVkIGJ5IHRoZSBkZXNpcmVkIHNjYWxhciB2YWx1ZS5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBtdWx0aXBseVNjYWxhcigpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgdmVjdG9yLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB0aW1lc1NjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gdjMoIHRoaXMueCAqIHNjYWxhciwgdGhpcy55ICogc2NhbGFyLCB0aGlzLnogKiBzY2FsYXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNhbWUgYXMgdGltZXNTY2FsYXIuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbXVsdGlwbHkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIHZlY3Rvci5cclxuICAgKi9cclxuICBwdWJsaWMgdGltZXMoIHNjYWxhcjogbnVtYmVyICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHRoaXMudGltZXNTY2FsYXIoIHNjYWxhciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29weSBvZiB0aGlzIHZlY3RvciwgbXVsdGlwbGllZCBjb21wb25lbnQtd2lzZSBieSB0aGUgcGFzc2VkLWluIHZlY3RvciB2LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvbXBvbmVudE11bHRpcGx5KCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIGNvbXBvbmVudFRpbWVzKCB2OiBWZWN0b3IzICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHYzKCB0aGlzLnggKiB2LngsIHRoaXMueSAqIHYueSwgdGhpcy56ICogdi56ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRpdGlvbiBvZiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlciB2ZWN0b3IsIHJldHVybmluZyBhIGNvcHkuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYWRkKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIHBsdXMoIHY6IFZlY3RvcjMgKTogVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gdjMoIHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55LCB0aGlzLnogKyB2LnogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZGl0aW9uIG9mIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyIHZlY3RvciAoeCx5LHopLCByZXR1cm5pbmcgYSBjb3B5LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGFkZFhZWigpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgdmVjdG9yLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwbHVzWFlaKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHYzKCB0aGlzLnggKyB4LCB0aGlzLnkgKyB5LCB0aGlzLnogKyB6ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRpdGlvbiBvZiB0aGlzIHZlY3RvciB3aXRoIGEgc2NhbGFyIChhZGRzIHRoZSBzY2FsYXIgdG8gZXZlcnkgY29tcG9uZW50KSwgcmV0dXJuaW5nIGEgY29weS5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBhZGRTY2FsYXIoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIHZlY3Rvci5cclxuICAgKi9cclxuICBwdWJsaWMgcGx1c1NjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gdjMoIHRoaXMueCArIHNjYWxhciwgdGhpcy55ICsgc2NhbGFyLCB0aGlzLnogKyBzY2FsYXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN1YnRyYWN0aW9uIG9mIHRoaXMgdmVjdG9yIGJ5IGFub3RoZXIgdmVjdG9yIHYsIHJldHVybmluZyBhIGNvcHkuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc3VidHJhY3QoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIHZlY3Rvci5cclxuICAgKi9cclxuICBwdWJsaWMgbWludXMoIHY6IFZlY3RvcjMgKTogVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gdjMoIHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55LCB0aGlzLnogLSB2LnogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN1YnRyYWN0aW9uIG9mIHRoaXMgdmVjdG9yIGJ5IGFub3RoZXIgdmVjdG9yICh4LHkseiksIHJldHVybmluZyBhIGNvcHkuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc3VidHJhY3RYWVooKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIHZlY3Rvci5cclxuICAgKi9cclxuICBwdWJsaWMgbWludXNYWVooIHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIgKTogVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gdjMoIHRoaXMueCAtIHgsIHRoaXMueSAtIHksIHRoaXMueiAtIHogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN1YnRyYWN0aW9uIG9mIHRoaXMgdmVjdG9yIGJ5IGEgc2NhbGFyIChzdWJ0cmFjdHMgdGhlIHNjYWxhciBmcm9tIGV2ZXJ5IGNvbXBvbmVudCksIHJldHVybmluZyBhIGNvcHkuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc3VidHJhY3RTY2FsYXIoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIHZlY3Rvci5cclxuICAgKi9cclxuICBwdWJsaWMgbWludXNTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHYzKCB0aGlzLnggLSBzY2FsYXIsIHRoaXMueSAtIHNjYWxhciwgdGhpcy56IC0gc2NhbGFyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXZpc2lvbiBvZiB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAoZGl2aWRlcyBldmVyeSBjb21wb25lbnQgYnkgdGhlIHNjYWxhciksIHJldHVybmluZyBhIGNvcHkuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGl2aWRlU2NhbGFyKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIGRpdmlkZWRTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHYzKCB0aGlzLnggLyBzY2FsYXIsIHRoaXMueSAvIHNjYWxhciwgdGhpcy56IC8gc2NhbGFyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBOZWdhdGVkIGNvcHkgb2YgdGhpcyB2ZWN0b3IgKG11bHRpcGxpZXMgZXZlcnkgY29tcG9uZW50IGJ5IC0xKS5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBuZWdhdGUoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIHZlY3Rvci5cclxuICAgKlxyXG4gICAqL1xyXG4gIHB1YmxpYyBuZWdhdGVkKCk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHYzKCAtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdGhpcyB2ZWN0b3IgKHJhdGlvPTApIGFuZCBhbm90aGVyIHZlY3RvciAocmF0aW89MSkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdmVjdG9yXHJcbiAgICogQHBhcmFtIHJhdGlvIC0gTm90IG5lY2Vzc2FyaWx5IGNvbnN0cmFpbmVkIGluIFswLCAxXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBibGVuZCggdmVjdG9yOiBWZWN0b3IzLCByYXRpbzogbnVtYmVyICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHRoaXMucGx1cyggdmVjdG9yLm1pbnVzKCB0aGlzIGFzIHVua25vd24gYXMgVmVjdG9yMyApLnRpbWVzKCByYXRpbyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgYXZlcmFnZSAobWlkcG9pbnQpIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhdmVyYWdlKCB2ZWN0b3I6IFZlY3RvcjMgKTogVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gdGhpcy5ibGVuZCggdmVjdG9yLCAwLjUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2UgYSBjb21wb25lbnQtYmFzZWQgbWVhbiBvZiBhbGwgdmVjdG9ycyBwcm92aWRlZC5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGF2ZXJhZ2UoIHZlY3RvcnM6IFZlY3RvcjNbXSApOiBWZWN0b3IzIHtcclxuICAgIGNvbnN0IGFkZGVkID0gXy5yZWR1Y2UoIHZlY3RvcnMsIEFERElOR19BQ0NVTVVMQVRPUiwgbmV3IFZlY3RvcjMoIDAsIDAsIDAgKSApO1xyXG4gICAgcmV0dXJuIGFkZGVkLmRpdmlkZVNjYWxhciggdmVjdG9ycy5sZW5ndGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERlYnVnZ2luZyBzdHJpbmcgZm9yIHRoZSB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYFZlY3RvcjMoJHt0aGlzLnh9LCAke3RoaXMueX0sICR7dGhpcy56fSlgO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgdGhpcyB0byBhIDItZGltZW5zaW9uYWwgdmVjdG9yLCBkaXNjYXJkaW5nIHRoZSB6LWNvbXBvbmVudC5cclxuICAgKi9cclxuICBwdWJsaWMgdG9WZWN0b3IyKCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHYyKCB0aGlzLngsIHRoaXMueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgdGhpcyB0byBhIDQtZGltZW5zaW9uYWwgdmVjdG9yLCB3aXRoIHRoZSB3LWNvbXBvbmVudCBlcXVhbCB0byAxICh1c2VmdWwgZm9yIGhvbW9nZW5lb3VzIGNvb3JkaW5hdGVzKS5cclxuICAgKi9cclxuICBwdWJsaWMgdG9WZWN0b3I0KCk6IFZlY3RvcjQge1xyXG4gICAgcmV0dXJuIHY0KCB0aGlzLngsIHRoaXMueSwgdGhpcy56LCAxICk7XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBNdXRhYmxlc1xyXG4gICAqIC0gYWxsIG11dGF0aW9uIHNob3VsZCBnbyB0aHJvdWdoIHNldFhZWiAvIHNldFggLyBzZXRZIC8gc2V0WlxyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBhbGwgb2YgdGhlIGNvbXBvbmVudHMgb2YgdGhpcyB2ZWN0b3IsIHJldHVybmluZyB0aGlzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRYWVooIHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIgKTogVmVjdG9yMyB7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMueiA9IHo7XHJcbiAgICByZXR1cm4gdGhpcyBhcyB1bmtub3duIGFzIFZlY3RvcjM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB4LWNvbXBvbmVudCBvZiB0aGlzIHZlY3RvciwgcmV0dXJuaW5nIHRoaXMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFgoIHg6IG51bWJlciApOiBWZWN0b3IzIHtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICByZXR1cm4gdGhpcyBhcyB1bmtub3duIGFzIFZlY3RvcjM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB5LWNvbXBvbmVudCBvZiB0aGlzIHZlY3RvciwgcmV0dXJuaW5nIHRoaXMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFkoIHk6IG51bWJlciApOiBWZWN0b3IzIHtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICByZXR1cm4gdGhpcyBhcyB1bmtub3duIGFzIFZlY3RvcjM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB6LWNvbXBvbmVudCBvZiB0aGlzIHZlY3RvciwgcmV0dXJuaW5nIHRoaXMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFooIHo6IG51bWJlciApOiBWZWN0b3IzIHtcclxuICAgIHRoaXMueiA9IHo7XHJcbiAgICByZXR1cm4gdGhpcyBhcyB1bmtub3duIGFzIFZlY3RvcjM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgdmVjdG9yIHRvIGJlIGEgY29weSBvZiBhbm90aGVyIHZlY3Rvci5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gY29weSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIHZlY3RvciBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIHNldCggdjogVmVjdG9yMyApOiBWZWN0b3IzIHtcclxuICAgIHJldHVybiB0aGlzLnNldFhZWiggdi54LCB2LnksIHYueiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgbWFnbml0dWRlIG9mIHRoaXMgdmVjdG9yLiBJZiB0aGUgcGFzc2VkLWluIG1hZ25pdHVkZSBpcyBuZWdhdGl2ZSwgdGhpcyBmbGlwcyB0aGUgdmVjdG9yIGFuZCBzZXRzIGl0c1xyXG4gICAqIG1hZ25pdHVkZSB0byBhYnMoIG1hZ25pdHVkZSApLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB3aXRoTWFnbml0dWRlKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXHJcbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TWFnbml0dWRlKCBtYWduaXR1ZGU6IG51bWJlciApOiBWZWN0b3IzIHtcclxuICAgIGNvbnN0IHNjYWxlID0gbWFnbml0dWRlIC8gdGhpcy5tYWduaXR1ZGU7XHJcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhciggc2NhbGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYW5vdGhlciB2ZWN0b3IgdG8gdGhpcyB2ZWN0b3IsIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBwbHVzKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXHJcbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkKCB2OiBWZWN0b3IzICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaKCB0aGlzLnggKyB2LngsIHRoaXMueSArIHYueSwgdGhpcy56ICsgdi56ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGFub3RoZXIgdmVjdG9yICh4LHkseikgdG8gdGhpcyB2ZWN0b3IsIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBwbHVzWFlaKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXHJcbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkWFlaKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaKCB0aGlzLnggKyB4LCB0aGlzLnkgKyB5LCB0aGlzLnogKyB6ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgc2NhbGFyIHRvIHRoaXMgdmVjdG9yIChhZGRlZCB0byBldmVyeSBjb21wb25lbnQpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcGx1c1NjYWxhcigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xyXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIGFkZFNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRYWVooIHRoaXMueCArIHNjYWxhciwgdGhpcy55ICsgc2NhbGFyLCB0aGlzLnogKyBzY2FsYXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN1YnRyYWN0cyB0aGlzIHZlY3RvciBieSBhbm90aGVyIHZlY3RvciwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG1pbnVzKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXHJcbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgc3VidHJhY3QoIHY6IFZlY3RvcjMgKTogVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRYWVooIHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55LCB0aGlzLnogLSB2LnogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN1YnRyYWN0cyB0aGlzIHZlY3RvciBieSBhbm90aGVyIHZlY3RvciAoeCx5LHopLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbWludXNYWVooKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cclxuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdWJ0cmFjdFhZWiggeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciApOiBWZWN0b3IzIHtcclxuICAgIHJldHVybiB0aGlzLnNldFhZWiggdGhpcy54IC0geCwgdGhpcy55IC0geSwgdGhpcy56IC0geiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3VidHJhY3RzIHRoaXMgdmVjdG9yIGJ5IGEgc2NhbGFyIChzdWJ0cmFjdHMgZWFjaCBjb21wb25lbnQgYnkgdGhlIHNjYWxhciksIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBtaW51c1NjYWxhcigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xyXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIHN1YnRyYWN0U2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3IzIHtcclxuICAgIHJldHVybiB0aGlzLnNldFhZWiggdGhpcy54IC0gc2NhbGFyLCB0aGlzLnkgLSBzY2FsYXIsIHRoaXMueiAtIHNjYWxhciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTXVsdGlwbGllcyB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAobXVsdGlwbGllcyBlYWNoIGNvbXBvbmVudCBieSB0aGUgc2NhbGFyKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHRpbWVzU2NhbGFyKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXHJcbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgbXVsdGlwbHlTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaKCB0aGlzLnggKiBzY2FsYXIsIHRoaXMueSAqIHNjYWxhciwgdGhpcy56ICogc2NhbGFyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNdWx0aXBsaWVzIHRoaXMgdmVjdG9yIGJ5IGEgc2NhbGFyIChtdWx0aXBsaWVzIGVhY2ggY29tcG9uZW50IGJ5IHRoZSBzY2FsYXIpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cclxuICAgKiBTYW1lIGFzIG11bHRpcGx5U2NhbGFyLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB0aW1lcygpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xyXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIG11bHRpcGx5KCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3IzIHtcclxuICAgIHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKCBzY2FsYXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE11bHRpcGxpZXMgdGhpcyB2ZWN0b3IgYnkgYW5vdGhlciB2ZWN0b3IgY29tcG9uZW50LXdpc2UsIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBjb21wb25lbnRUaW1lcygpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xyXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIGNvbXBvbmVudE11bHRpcGx5KCB2OiBWZWN0b3IzICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaKCB0aGlzLnggKiB2LngsIHRoaXMueSAqIHYueSwgdGhpcy56ICogdi56ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXZpZGVzIHRoaXMgdmVjdG9yIGJ5IGEgc2NhbGFyIChkaXZpZGVzIGVhY2ggY29tcG9uZW50IGJ5IHRoZSBzY2FsYXIpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGl2aWRlZFNjYWxhcigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xyXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIGRpdmlkZVNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRYWVooIHRoaXMueCAvIHNjYWxhciwgdGhpcy55IC8gc2NhbGFyLCB0aGlzLnogLyBzY2FsYXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE5lZ2F0ZXMgdGhpcyB2ZWN0b3IgKG11bHRpcGxpZXMgZWFjaCBjb21wb25lbnQgYnkgLTEpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbmVnYXRlZCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xyXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIG5lZ2F0ZSgpOiBWZWN0b3IzIHtcclxuICAgIHJldHVybiB0aGlzLnNldFhZWiggLXRoaXMueCwgLXRoaXMueSwgLXRoaXMueiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBvdXIgdmFsdWUgdG8gdGhlIEV1Y2xpZGVhbiAzLWRpbWVuc2lvbmFsIGNyb3NzLXByb2R1Y3Qgb2YgdGhpcyB2ZWN0b3IgYnkgdGhlIHBhc3NlZC1pbiB2ZWN0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIHNldENyb3NzKCB2OiBWZWN0b3IzICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaKFxyXG4gICAgICB0aGlzLnkgKiB2LnogLSB0aGlzLnogKiB2LnksXHJcbiAgICAgIHRoaXMueiAqIHYueCAtIHRoaXMueCAqIHYueixcclxuICAgICAgdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTm9ybWFsaXplcyB0aGlzIHZlY3RvciAocmVzY2FsZXMgdG8gd2hlcmUgdGhlIG1hZ25pdHVkZSBpcyAxKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG5vcm1hbGl6ZWQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cclxuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBub3JtYWxpemUoKTogVmVjdG9yMyB7XHJcbiAgICBjb25zdCBtYWcgPSB0aGlzLm1hZ25pdHVkZTtcclxuICAgIGlmICggbWFnID09PSAwICkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdDYW5ub3Qgbm9ybWFsaXplIGEgemVyby1tYWduaXR1ZGUgdmVjdG9yJyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmRpdmlkZVNjYWxhciggbWFnICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSb3VuZHMgZWFjaCBjb21wb25lbnQgb2YgdGhpcyB2ZWN0b3Igd2l0aCBVdGlscy5yb3VuZFN5bW1ldHJpYy5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm91bmRlZFN5bW1ldHJpYygpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvblxyXG4gICAqIHRvIHJldHVybmluZyB0aGUgdmVjdG9yIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgcm91bmRTeW1tZXRyaWMoKTogVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRYWVooIFV0aWxzLnJvdW5kU3ltbWV0cmljKCB0aGlzLnggKSwgVXRpbHMucm91bmRTeW1tZXRyaWMoIHRoaXMueSApLCBVdGlscy5yb3VuZFN5bW1ldHJpYyggdGhpcy56ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBkdWNrLXR5cGVkIG9iamVjdCBtZWFudCBmb3IgdXNlIHdpdGggdGFuZGVtL3BoZXQtaW8gc2VyaWFsaXphdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgdG9TdGF0ZU9iamVjdCgpOiBWZWN0b3IzU3RhdGVPYmplY3Qge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDogdGhpcy54LFxyXG4gICAgICB5OiB0aGlzLnksXHJcbiAgICAgIHo6IHRoaXMuelxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBmcmVlVG9Qb29sKCk6IHZvaWQge1xyXG4gICAgVmVjdG9yMy5wb29sLmZyZWVUb1Bvb2woIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgcG9vbCA9IG5ldyBQb29sKCBWZWN0b3IzLCB7XHJcbiAgICBtYXhTaXplOiAxMDAwLFxyXG4gICAgaW5pdGlhbGl6ZTogVmVjdG9yMy5wcm90b3R5cGUuc2V0WFlaLFxyXG4gICAgZGVmYXVsdEFyZ3VtZW50czogWyAwLCAwLCAwIF1cclxuICB9ICk7XHJcblxyXG4gIC8vIHN0YXRpYyBtZXRob2RzXHJcblxyXG4gIC8qKlxyXG4gICAqIFNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB1bml0IHZlY3RvcnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RhcnQgLSBTdGFydCB1bml0IHZlY3RvclxyXG4gICAqIEBwYXJhbSBlbmQgLSBFbmQgdW5pdCB2ZWN0b3JcclxuICAgKiBAcGFyYW0gcmF0aW8gIC0gQmV0d2VlbiAwIChhdCBzdGFydCB2ZWN0b3IpIGFuZCAxIChhdCBlbmQgdmVjdG9yKVxyXG4gICAqIEByZXR1cm5zIFNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHRoZSBzdGFydCBhbmQgZW5kXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBzbGVycCggc3RhcnQ6IFZlY3RvcjMsIGVuZDogVmVjdG9yMywgcmF0aW86IG51bWJlciApOiBWZWN0b3IzIHtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETzogaW1wb3J0IHdpdGggY2lyY3VsYXIgcHJvdGVjdGlvblxyXG4gICAgcmV0dXJuIGRvdC5RdWF0ZXJuaW9uLnNsZXJwKCBuZXcgZG90LlF1YXRlcm5pb24oKSwgZG90LlF1YXRlcm5pb24uZ2V0Um90YXRpb25RdWF0ZXJuaW9uKCBzdGFydCwgZW5kICksIHJhdGlvICkudGltZXNWZWN0b3IzKCBzdGFydCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0cyBhIFZlY3RvcjMgZnJvbSBhIGR1Y2stdHlwZWQgb2JqZWN0LCBmb3IgdXNlIHdpdGggdGFuZGVtL3BoZXQtaW8gZGVzZXJpYWxpemF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdDogVmVjdG9yM1N0YXRlT2JqZWN0ICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHYzKFxyXG4gICAgICBzdGF0ZU9iamVjdC54LFxyXG4gICAgICBzdGF0ZU9iamVjdC55LFxyXG4gICAgICBzdGF0ZU9iamVjdC56XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGlzVmVjdG9yMyE6IGJvb2xlYW47XHJcbiAgcHVibGljIGRpbWVuc2lvbiE6IG51bWJlcjtcclxuICBwdWJsaWMgc3RhdGljIFpFUk86IFZlY3RvcjM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5XHJcbiAgcHVibGljIHN0YXRpYyBYX1VOSVQ6IFZlY3RvcjM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5XHJcbiAgcHVibGljIHN0YXRpYyBZX1VOSVQ6IFZlY3RvcjM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5XHJcbiAgcHVibGljIHN0YXRpYyBaX1VOSVQ6IFZlY3RvcjM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5XHJcbiAgcHVibGljIHN0YXRpYyBWZWN0b3IzSU86IElPVHlwZTtcclxufVxyXG5cclxuLy8gKHJlYWQtb25seSkgLSBIZWxwcyB0byBpZGVudGlmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB2ZWN0b3JcclxuVmVjdG9yMy5wcm90b3R5cGUuaXNWZWN0b3IzID0gdHJ1ZTtcclxuVmVjdG9yMy5wcm90b3R5cGUuZGltZW5zaW9uID0gMztcclxuXHJcbmRvdC5yZWdpc3RlciggJ1ZlY3RvcjMnLCBWZWN0b3IzICk7XHJcblxyXG5jb25zdCB2MyA9IFZlY3RvcjMucG9vbC5jcmVhdGUuYmluZCggVmVjdG9yMy5wb29sICk7XHJcbmRvdC5yZWdpc3RlciggJ3YzJywgdjMgKTtcclxuXHJcbmNsYXNzIEltbXV0YWJsZVZlY3RvcjMgZXh0ZW5kcyBWZWN0b3IzIHtcclxuICAvKipcclxuICAgKiBUaHJvdyBlcnJvcnMgd2hlbmV2ZXIgYSBtdXRhYmxlIG1ldGhvZCBpcyBjYWxsZWQgb24gb3VyIGltbXV0YWJsZSB2ZWN0b3JcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIG11dGFibGVPdmVycmlkZUhlbHBlciggbXV0YWJsZUZ1bmN0aW9uTmFtZTogJ3NldFgnIHwgJ3NldFknIHwgJ3NldFonIHwgJ3NldFhZWicgKTogdm9pZCB7XHJcbiAgICBJbW11dGFibGVWZWN0b3IzLnByb3RvdHlwZVsgbXV0YWJsZUZ1bmN0aW9uTmFtZSBdID0gKCkgPT4ge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBDYW5ub3QgY2FsbCBtdXRhYmxlIG1ldGhvZCAnJHttdXRhYmxlRnVuY3Rpb25OYW1lfScgb24gaW1tdXRhYmxlIFZlY3RvcjNgICk7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuSW1tdXRhYmxlVmVjdG9yMy5tdXRhYmxlT3ZlcnJpZGVIZWxwZXIoICdzZXRYWVonICk7XHJcbkltbXV0YWJsZVZlY3RvcjMubXV0YWJsZU92ZXJyaWRlSGVscGVyKCAnc2V0WCcgKTtcclxuSW1tdXRhYmxlVmVjdG9yMy5tdXRhYmxlT3ZlcnJpZGVIZWxwZXIoICdzZXRZJyApO1xyXG5JbW11dGFibGVWZWN0b3IzLm11dGFibGVPdmVycmlkZUhlbHBlciggJ3NldFonICk7XHJcblxyXG5WZWN0b3IzLlpFUk8gPSBhc3NlcnQgPyBuZXcgSW1tdXRhYmxlVmVjdG9yMyggMCwgMCwgMCApIDogbmV3IFZlY3RvcjMoIDAsIDAsIDAgKTtcclxuVmVjdG9yMy5YX1VOSVQgPSBhc3NlcnQgPyBuZXcgSW1tdXRhYmxlVmVjdG9yMyggMSwgMCwgMCApIDogbmV3IFZlY3RvcjMoIDEsIDAsIDAgKTtcclxuVmVjdG9yMy5ZX1VOSVQgPSBhc3NlcnQgPyBuZXcgSW1tdXRhYmxlVmVjdG9yMyggMCwgMSwgMCApIDogbmV3IFZlY3RvcjMoIDAsIDEsIDAgKTtcclxuVmVjdG9yMy5aX1VOSVQgPSBhc3NlcnQgPyBuZXcgSW1tdXRhYmxlVmVjdG9yMyggMCwgMCwgMSApIDogbmV3IFZlY3RvcjMoIDAsIDAsIDEgKTtcclxuXHJcblZlY3RvcjMuVmVjdG9yM0lPID0gbmV3IElPVHlwZSggJ1ZlY3RvcjNJTycsIHtcclxuICB2YWx1ZVR5cGU6IFZlY3RvcjMsXHJcbiAgZG9jdW1lbnRhdGlvbjogJ0Jhc2ljIDMtZGltZW5zaW9uYWwgdmVjdG9yLCByZXByZXNlbnRlZCBhcyAoeCx5LHopJyxcclxuICB0b1N0YXRlT2JqZWN0OiAoIHZlY3RvcjM6IFZlY3RvcjMgKSA9PiB2ZWN0b3IzLnRvU3RhdGVPYmplY3QoKSxcclxuICBmcm9tU3RhdGVPYmplY3Q6IFZlY3RvcjMuZnJvbVN0YXRlT2JqZWN0LFxyXG4gIHN0YXRlU2NoZW1hOiB7XHJcbiAgICB4OiBOdW1iZXJJTyxcclxuICAgIHk6IE51bWJlcklPLFxyXG4gICAgejogTnVtYmVySU9cclxuICB9XHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IHYzIH07XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxJQUFJLE1BQXFCLDRCQUE0QjtBQUM1RCxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLFFBQVEsTUFBTSxtQ0FBbUM7QUFDeEQsT0FBT0MsR0FBRyxNQUFNLFVBQVU7QUFDMUIsT0FBT0MsS0FBSyxNQUFNLFlBQVk7QUFDOUIsU0FBa0JDLEVBQUUsUUFBUSxjQUFjO0FBQzFDLFNBQWtCQyxFQUFFLFFBQVEsY0FBYztBQUUxQyxNQUFNQyxrQkFBa0IsR0FBR0EsQ0FBRUMsTUFBZSxFQUFFQyxVQUFtQixLQUFNO0VBQ3JFLE9BQU9ELE1BQU0sQ0FBQ0UsR0FBRyxDQUFFRCxVQUFXLENBQUM7QUFDakMsQ0FBQztBQVFELGVBQWUsTUFBTUUsT0FBTyxDQUFzQjtFQUVoRDs7RUFHQTs7RUFHQTs7RUFHQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTQyxXQUFXQSxDQUFFQyxDQUFTLEVBQUVDLENBQVMsRUFBRUMsQ0FBUyxFQUFHO0lBQ3BELElBQUksQ0FBQ0YsQ0FBQyxHQUFHQSxDQUFDO0lBQ1YsSUFBSSxDQUFDQyxDQUFDLEdBQUdBLENBQUM7SUFDVixJQUFJLENBQUNDLENBQUMsR0FBR0EsQ0FBQztFQUNaOztFQUdBO0FBQ0Y7QUFDQTtFQUNTQyxZQUFZQSxDQUFBLEVBQVc7SUFDNUIsT0FBT0MsSUFBSSxDQUFDQyxJQUFJLENBQUUsSUFBSSxDQUFDQyxnQkFBaUIsQ0FBQztFQUMzQztFQUVBLElBQVdDLFNBQVNBLENBQUEsRUFBVztJQUM3QixPQUFPLElBQUksQ0FBQ0osWUFBWSxDQUFDLENBQUM7RUFDNUI7O0VBRUE7QUFDRjtBQUNBO0VBQ1NLLG1CQUFtQkEsQ0FBQSxFQUFXO0lBQ25DLE9BQU8sSUFBSSxDQUFDbEIsR0FBRyxDQUFFLElBQTJCLENBQUM7RUFDL0M7RUFFQSxJQUFXZ0IsZ0JBQWdCQSxDQUFBLEVBQVc7SUFDcEMsT0FBTyxJQUFJLENBQUNFLG1CQUFtQixDQUFDLENBQUM7RUFDbkM7O0VBRUE7QUFDRjtBQUNBO0VBQ1NDLFFBQVFBLENBQUVDLEtBQWMsRUFBVztJQUN4QyxPQUFPTixJQUFJLENBQUNDLElBQUksQ0FBRSxJQUFJLENBQUNNLGVBQWUsQ0FBRUQsS0FBTSxDQUFFLENBQUM7RUFDbkQ7O0VBRUE7QUFDRjtBQUNBO0VBQ1NFLFdBQVdBLENBQUVaLENBQVMsRUFBRUMsQ0FBUyxFQUFFQyxDQUFTLEVBQVc7SUFDNUQsTUFBTVcsRUFBRSxHQUFHLElBQUksQ0FBQ2IsQ0FBQyxHQUFHQSxDQUFDO0lBQ3JCLE1BQU1jLEVBQUUsR0FBRyxJQUFJLENBQUNiLENBQUMsR0FBR0EsQ0FBQztJQUNyQixNQUFNYyxFQUFFLEdBQUcsSUFBSSxDQUFDYixDQUFDLEdBQUdBLENBQUM7SUFDckIsT0FBT0UsSUFBSSxDQUFDQyxJQUFJLENBQUVRLEVBQUUsR0FBR0EsRUFBRSxHQUFHQyxFQUFFLEdBQUdBLEVBQUUsR0FBR0MsRUFBRSxHQUFHQSxFQUFHLENBQUM7RUFDakQ7O0VBRUE7QUFDRjtBQUNBO0VBQ1NKLGVBQWVBLENBQUVELEtBQWMsRUFBVztJQUMvQyxNQUFNRyxFQUFFLEdBQUcsSUFBSSxDQUFDYixDQUFDLEdBQUdVLEtBQUssQ0FBQ1YsQ0FBQztJQUMzQixNQUFNYyxFQUFFLEdBQUcsSUFBSSxDQUFDYixDQUFDLEdBQUdTLEtBQUssQ0FBQ1QsQ0FBQztJQUMzQixNQUFNYyxFQUFFLEdBQUcsSUFBSSxDQUFDYixDQUFDLEdBQUdRLEtBQUssQ0FBQ1IsQ0FBQztJQUMzQixPQUFPVyxFQUFFLEdBQUdBLEVBQUUsR0FBR0MsRUFBRSxHQUFHQSxFQUFFLEdBQUdDLEVBQUUsR0FBR0EsRUFBRTtFQUNwQzs7RUFFQTtBQUNGO0FBQ0E7RUFDU0Msa0JBQWtCQSxDQUFFaEIsQ0FBUyxFQUFFQyxDQUFTLEVBQUVDLENBQVMsRUFBVztJQUNuRSxNQUFNVyxFQUFFLEdBQUcsSUFBSSxDQUFDYixDQUFDLEdBQUdBLENBQUM7SUFDckIsTUFBTWMsRUFBRSxHQUFHLElBQUksQ0FBQ2IsQ0FBQyxHQUFHQSxDQUFDO0lBQ3JCLE1BQU1jLEVBQUUsR0FBRyxJQUFJLENBQUNiLENBQUMsR0FBR0EsQ0FBQztJQUNyQixPQUFPVyxFQUFFLEdBQUdBLEVBQUUsR0FBR0MsRUFBRSxHQUFHQSxFQUFFLEdBQUdDLEVBQUUsR0FBR0EsRUFBRTtFQUNwQzs7RUFFQTtBQUNGO0FBQ0E7RUFDU3pCLEdBQUdBLENBQUUyQixDQUFVLEVBQVc7SUFDL0IsT0FBTyxJQUFJLENBQUNqQixDQUFDLEdBQUdpQixDQUFDLENBQUNqQixDQUFDLEdBQUcsSUFBSSxDQUFDQyxDQUFDLEdBQUdnQixDQUFDLENBQUNoQixDQUFDLEdBQUcsSUFBSSxDQUFDQyxDQUFDLEdBQUdlLENBQUMsQ0FBQ2YsQ0FBQztFQUNuRDs7RUFFQTtBQUNGO0FBQ0E7RUFDU2dCLE1BQU1BLENBQUVsQixDQUFTLEVBQUVDLENBQVMsRUFBRUMsQ0FBUyxFQUFXO0lBQ3ZELE9BQU8sSUFBSSxDQUFDRixDQUFDLEdBQUdBLENBQUMsR0FBRyxJQUFJLENBQUNDLENBQUMsR0FBR0EsQ0FBQyxHQUFHLElBQUksQ0FBQ0MsQ0FBQyxHQUFHQSxDQUFDO0VBQzdDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTaUIsWUFBWUEsQ0FBRUYsQ0FBVSxFQUFXO0lBQ3hDLE9BQU9iLElBQUksQ0FBQ2dCLElBQUksQ0FBRTdCLEtBQUssQ0FBQzhCLEtBQUssQ0FBRSxJQUFJLENBQUNDLFVBQVUsQ0FBQyxDQUFDLENBQUNoQyxHQUFHLENBQUUyQixDQUFDLENBQUNLLFVBQVUsQ0FBQyxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUUsQ0FBQztFQUNuRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1NDLE1BQU1BLENBQUVDLEtBQWMsRUFBWTtJQUN2QyxPQUFPLElBQUksQ0FBQ3hCLENBQUMsS0FBS3dCLEtBQUssQ0FBQ3hCLENBQUMsSUFBSSxJQUFJLENBQUNDLENBQUMsS0FBS3VCLEtBQUssQ0FBQ3ZCLENBQUMsSUFBSSxJQUFJLENBQUNDLENBQUMsS0FBS3NCLEtBQUssQ0FBQ3RCLENBQUM7RUFDdkU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1N1QixhQUFhQSxDQUFFRCxLQUFjLEVBQUVFLE9BQWUsRUFBWTtJQUMvRCxJQUFLLENBQUNBLE9BQU8sRUFBRztNQUNkQSxPQUFPLEdBQUcsQ0FBQztJQUNiO0lBQ0EsT0FBT3RCLElBQUksQ0FBQ3VCLEdBQUcsQ0FBRSxJQUFJLENBQUMzQixDQUFDLEdBQUd3QixLQUFLLENBQUN4QixDQUFFLENBQUMsR0FBR0ksSUFBSSxDQUFDdUIsR0FBRyxDQUFFLElBQUksQ0FBQzFCLENBQUMsR0FBR3VCLEtBQUssQ0FBQ3ZCLENBQUUsQ0FBQyxHQUFHRyxJQUFJLENBQUN1QixHQUFHLENBQUUsSUFBSSxDQUFDekIsQ0FBQyxHQUFHc0IsS0FBSyxDQUFDdEIsQ0FBRSxDQUFDLElBQUl3QixPQUFPO0VBQzlHOztFQUVBO0FBQ0Y7QUFDQTtFQUNTRSxRQUFRQSxDQUFBLEVBQVk7SUFDekIsT0FBT0EsUUFBUSxDQUFFLElBQUksQ0FBQzVCLENBQUUsQ0FBQyxJQUFJNEIsUUFBUSxDQUFFLElBQUksQ0FBQzNCLENBQUUsQ0FBQyxJQUFJMkIsUUFBUSxDQUFFLElBQUksQ0FBQzFCLENBQUUsQ0FBQztFQUN2RTs7RUFFQTtBQUNGO0FBQ0E7O0VBRUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1MyQixJQUFJQSxDQUFFbEMsTUFBZ0IsRUFBWTtJQUN2QyxJQUFLQSxNQUFNLEVBQUc7TUFDWixPQUFPQSxNQUFNLENBQUNtQyxHQUFHLENBQUUsSUFBMkIsQ0FBQztJQUNqRCxDQUFDLE1BQ0k7TUFDSCxPQUFPQyxFQUFFLENBQUUsSUFBSSxDQUFDL0IsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBRSxDQUFDO0lBQ3JDO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0VBQ1M4QixLQUFLQSxDQUFFZixDQUFVLEVBQVk7SUFDbEMsT0FBT2MsRUFBRSxDQUNQLElBQUksQ0FBQzlCLENBQUMsR0FBR2dCLENBQUMsQ0FBQ2YsQ0FBQyxHQUFHLElBQUksQ0FBQ0EsQ0FBQyxHQUFHZSxDQUFDLENBQUNoQixDQUFDLEVBQzNCLElBQUksQ0FBQ0MsQ0FBQyxHQUFHZSxDQUFDLENBQUNqQixDQUFDLEdBQUcsSUFBSSxDQUFDQSxDQUFDLEdBQUdpQixDQUFDLENBQUNmLENBQUMsRUFDM0IsSUFBSSxDQUFDRixDQUFDLEdBQUdpQixDQUFDLENBQUNoQixDQUFDLEdBQUcsSUFBSSxDQUFDQSxDQUFDLEdBQUdnQixDQUFDLENBQUNqQixDQUM1QixDQUFDO0VBQ0g7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU3NCLFVBQVVBLENBQUEsRUFBWTtJQUMzQixNQUFNVyxHQUFHLEdBQUcsSUFBSSxDQUFDMUIsU0FBUztJQUMxQixJQUFLMEIsR0FBRyxLQUFLLENBQUMsRUFBRztNQUNmLE1BQU0sSUFBSUMsS0FBSyxDQUFFLDBDQUEyQyxDQUFDO0lBQy9ELENBQUMsTUFDSTtNQUNILE9BQU9ILEVBQUUsQ0FBRSxJQUFJLENBQUMvQixDQUFDLEdBQUdpQyxHQUFHLEVBQUUsSUFBSSxDQUFDaEMsQ0FBQyxHQUFHZ0MsR0FBRyxFQUFFLElBQUksQ0FBQy9CLENBQUMsR0FBRytCLEdBQUksQ0FBQztJQUN2RDtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDU0UsZ0JBQWdCQSxDQUFBLEVBQVk7SUFDakMsT0FBTyxJQUFJLENBQUNOLElBQUksQ0FBQyxDQUFDLENBQUNPLGNBQWMsQ0FBQyxDQUFDO0VBQ3JDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NDLGFBQWFBLENBQUU5QixTQUFpQixFQUFZO0lBQ2pELE9BQU8sSUFBSSxDQUFDc0IsSUFBSSxDQUFDLENBQUMsQ0FBQ1MsWUFBWSxDQUFFL0IsU0FBVSxDQUFDO0VBQzlDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTZ0MsV0FBV0EsQ0FBRUMsTUFBYyxFQUFZO0lBQzVDLE9BQU9ULEVBQUUsQ0FBRSxJQUFJLENBQUMvQixDQUFDLEdBQUd3QyxNQUFNLEVBQUUsSUFBSSxDQUFDdkMsQ0FBQyxHQUFHdUMsTUFBTSxFQUFFLElBQUksQ0FBQ3RDLENBQUMsR0FBR3NDLE1BQU8sQ0FBQztFQUNoRTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0MsS0FBS0EsQ0FBRUQsTUFBYyxFQUFZO0lBQ3RDLE9BQU8sSUFBSSxDQUFDRCxXQUFXLENBQUVDLE1BQU8sQ0FBQztFQUNuQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0UsY0FBY0EsQ0FBRXpCLENBQVUsRUFBWTtJQUMzQyxPQUFPYyxFQUFFLENBQUUsSUFBSSxDQUFDL0IsQ0FBQyxHQUFHaUIsQ0FBQyxDQUFDakIsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBQyxHQUFHZ0IsQ0FBQyxDQUFDaEIsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBQyxHQUFHZSxDQUFDLENBQUNmLENBQUUsQ0FBQztFQUN2RDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU3lDLElBQUlBLENBQUUxQixDQUFVLEVBQVk7SUFDakMsT0FBT2MsRUFBRSxDQUFFLElBQUksQ0FBQy9CLENBQUMsR0FBR2lCLENBQUMsQ0FBQ2pCLENBQUMsRUFBRSxJQUFJLENBQUNDLENBQUMsR0FBR2dCLENBQUMsQ0FBQ2hCLENBQUMsRUFBRSxJQUFJLENBQUNDLENBQUMsR0FBR2UsQ0FBQyxDQUFDZixDQUFFLENBQUM7RUFDdkQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1MwQyxPQUFPQSxDQUFFNUMsQ0FBUyxFQUFFQyxDQUFTLEVBQUVDLENBQVMsRUFBWTtJQUN6RCxPQUFPNkIsRUFBRSxDQUFFLElBQUksQ0FBQy9CLENBQUMsR0FBR0EsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBQyxHQUFHQSxDQUFDLEVBQUUsSUFBSSxDQUFDQyxDQUFDLEdBQUdBLENBQUUsQ0FBQztFQUNqRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDUzJDLFVBQVVBLENBQUVMLE1BQWMsRUFBWTtJQUMzQyxPQUFPVCxFQUFFLENBQUUsSUFBSSxDQUFDL0IsQ0FBQyxHQUFHd0MsTUFBTSxFQUFFLElBQUksQ0FBQ3ZDLENBQUMsR0FBR3VDLE1BQU0sRUFBRSxJQUFJLENBQUN0QyxDQUFDLEdBQUdzQyxNQUFPLENBQUM7RUFDaEU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NNLEtBQUtBLENBQUU3QixDQUFVLEVBQVk7SUFDbEMsT0FBT2MsRUFBRSxDQUFFLElBQUksQ0FBQy9CLENBQUMsR0FBR2lCLENBQUMsQ0FBQ2pCLENBQUMsRUFBRSxJQUFJLENBQUNDLENBQUMsR0FBR2dCLENBQUMsQ0FBQ2hCLENBQUMsRUFBRSxJQUFJLENBQUNDLENBQUMsR0FBR2UsQ0FBQyxDQUFDZixDQUFFLENBQUM7RUFDdkQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1M2QyxRQUFRQSxDQUFFL0MsQ0FBUyxFQUFFQyxDQUFTLEVBQUVDLENBQVMsRUFBWTtJQUMxRCxPQUFPNkIsRUFBRSxDQUFFLElBQUksQ0FBQy9CLENBQUMsR0FBR0EsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBQyxHQUFHQSxDQUFDLEVBQUUsSUFBSSxDQUFDQyxDQUFDLEdBQUdBLENBQUUsQ0FBQztFQUNqRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDUzhDLFdBQVdBLENBQUVSLE1BQWMsRUFBWTtJQUM1QyxPQUFPVCxFQUFFLENBQUUsSUFBSSxDQUFDL0IsQ0FBQyxHQUFHd0MsTUFBTSxFQUFFLElBQUksQ0FBQ3ZDLENBQUMsR0FBR3VDLE1BQU0sRUFBRSxJQUFJLENBQUN0QyxDQUFDLEdBQUdzQyxNQUFPLENBQUM7RUFDaEU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NTLGFBQWFBLENBQUVULE1BQWMsRUFBWTtJQUM5QyxPQUFPVCxFQUFFLENBQUUsSUFBSSxDQUFDL0IsQ0FBQyxHQUFHd0MsTUFBTSxFQUFFLElBQUksQ0FBQ3ZDLENBQUMsR0FBR3VDLE1BQU0sRUFBRSxJQUFJLENBQUN0QyxDQUFDLEdBQUdzQyxNQUFPLENBQUM7RUFDaEU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU1UsT0FBT0EsQ0FBQSxFQUFZO0lBQ3hCLE9BQU9uQixFQUFFLENBQUUsQ0FBQyxJQUFJLENBQUMvQixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUNDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQ0MsQ0FBRSxDQUFDO0VBQ3hDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTaUQsS0FBS0EsQ0FBRXhELE1BQWUsRUFBRXlELEtBQWEsRUFBWTtJQUN0RCxPQUFPLElBQUksQ0FBQ1QsSUFBSSxDQUFFaEQsTUFBTSxDQUFDbUQsS0FBSyxDQUFFLElBQTJCLENBQUMsQ0FBQ0wsS0FBSyxDQUFFVyxLQUFNLENBQUUsQ0FBQztFQUMvRTs7RUFFQTtBQUNGO0FBQ0E7RUFDU0MsT0FBT0EsQ0FBRTFELE1BQWUsRUFBWTtJQUN6QyxPQUFPLElBQUksQ0FBQ3dELEtBQUssQ0FBRXhELE1BQU0sRUFBRSxHQUFJLENBQUM7RUFDbEM7O0VBRUE7QUFDRjtBQUNBO0VBQ0UsT0FBYzBELE9BQU9BLENBQUVDLE9BQWtCLEVBQVk7SUFDbkQsTUFBTUMsS0FBSyxHQUFHQyxDQUFDLENBQUNDLE1BQU0sQ0FBRUgsT0FBTyxFQUFFNUQsa0JBQWtCLEVBQUUsSUFBSUksT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFFLENBQUM7SUFDN0UsT0FBT3lELEtBQUssQ0FBQ0csWUFBWSxDQUFFSixPQUFPLENBQUNLLE1BQU8sQ0FBQztFQUM3Qzs7RUFFQTtBQUNGO0FBQ0E7RUFDU0MsUUFBUUEsQ0FBQSxFQUFXO0lBQ3hCLE9BQVEsV0FBVSxJQUFJLENBQUM1RCxDQUFFLEtBQUksSUFBSSxDQUFDQyxDQUFFLEtBQUksSUFBSSxDQUFDQyxDQUFFLEdBQUU7RUFDbkQ7O0VBRUE7QUFDRjtBQUNBO0VBQ1MyRCxTQUFTQSxDQUFBLEVBQVk7SUFDMUIsT0FBT3JFLEVBQUUsQ0FBRSxJQUFJLENBQUNRLENBQUMsRUFBRSxJQUFJLENBQUNDLENBQUUsQ0FBQztFQUM3Qjs7RUFFQTtBQUNGO0FBQ0E7RUFDUzZELFNBQVNBLENBQUEsRUFBWTtJQUMxQixPQUFPckUsRUFBRSxDQUFFLElBQUksQ0FBQ08sQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBQyxFQUFFLENBQUUsQ0FBQztFQUN4Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTs7RUFFRTtBQUNGO0FBQ0E7RUFDUzZELE1BQU1BLENBQUUvRCxDQUFTLEVBQUVDLENBQVMsRUFBRUMsQ0FBUyxFQUFZO0lBQ3hELElBQUksQ0FBQ0YsQ0FBQyxHQUFHQSxDQUFDO0lBQ1YsSUFBSSxDQUFDQyxDQUFDLEdBQUdBLENBQUM7SUFDVixJQUFJLENBQUNDLENBQUMsR0FBR0EsQ0FBQztJQUNWLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtFQUNTOEQsSUFBSUEsQ0FBRWhFLENBQVMsRUFBWTtJQUNoQyxJQUFJLENBQUNBLENBQUMsR0FBR0EsQ0FBQztJQUNWLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtFQUNTaUUsSUFBSUEsQ0FBRWhFLENBQVMsRUFBWTtJQUNoQyxJQUFJLENBQUNBLENBQUMsR0FBR0EsQ0FBQztJQUNWLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtFQUNTaUUsSUFBSUEsQ0FBRWhFLENBQVMsRUFBWTtJQUNoQyxJQUFJLENBQUNBLENBQUMsR0FBR0EsQ0FBQztJQUNWLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTNEIsR0FBR0EsQ0FBRWIsQ0FBVSxFQUFZO0lBQ2hDLE9BQU8sSUFBSSxDQUFDOEMsTUFBTSxDQUFFOUMsQ0FBQyxDQUFDakIsQ0FBQyxFQUFFaUIsQ0FBQyxDQUFDaEIsQ0FBQyxFQUFFZ0IsQ0FBQyxDQUFDZixDQUFFLENBQUM7RUFDckM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU29DLFlBQVlBLENBQUUvQixTQUFpQixFQUFZO0lBQ2hELE1BQU00RCxLQUFLLEdBQUc1RCxTQUFTLEdBQUcsSUFBSSxDQUFDQSxTQUFTO0lBQ3hDLE9BQU8sSUFBSSxDQUFDNkQsY0FBYyxDQUFFRCxLQUFNLENBQUM7RUFDckM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1N0RSxHQUFHQSxDQUFFb0IsQ0FBVSxFQUFZO0lBQ2hDLE9BQU8sSUFBSSxDQUFDOEMsTUFBTSxDQUFFLElBQUksQ0FBQy9ELENBQUMsR0FBR2lCLENBQUMsQ0FBQ2pCLENBQUMsRUFBRSxJQUFJLENBQUNDLENBQUMsR0FBR2dCLENBQUMsQ0FBQ2hCLENBQUMsRUFBRSxJQUFJLENBQUNDLENBQUMsR0FBR2UsQ0FBQyxDQUFDZixDQUFFLENBQUM7RUFDaEU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NtRSxNQUFNQSxDQUFFckUsQ0FBUyxFQUFFQyxDQUFTLEVBQUVDLENBQVMsRUFBWTtJQUN4RCxPQUFPLElBQUksQ0FBQzZELE1BQU0sQ0FBRSxJQUFJLENBQUMvRCxDQUFDLEdBQUdBLENBQUMsRUFBRSxJQUFJLENBQUNDLENBQUMsR0FBR0EsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBQyxHQUFHQSxDQUFFLENBQUM7RUFDMUQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NvRSxTQUFTQSxDQUFFOUIsTUFBYyxFQUFZO0lBQzFDLE9BQU8sSUFBSSxDQUFDdUIsTUFBTSxDQUFFLElBQUksQ0FBQy9ELENBQUMsR0FBR3dDLE1BQU0sRUFBRSxJQUFJLENBQUN2QyxDQUFDLEdBQUd1QyxNQUFNLEVBQUUsSUFBSSxDQUFDdEMsQ0FBQyxHQUFHc0MsTUFBTyxDQUFDO0VBQ3pFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTK0IsUUFBUUEsQ0FBRXRELENBQVUsRUFBWTtJQUNyQyxPQUFPLElBQUksQ0FBQzhDLE1BQU0sQ0FBRSxJQUFJLENBQUMvRCxDQUFDLEdBQUdpQixDQUFDLENBQUNqQixDQUFDLEVBQUUsSUFBSSxDQUFDQyxDQUFDLEdBQUdnQixDQUFDLENBQUNoQixDQUFDLEVBQUUsSUFBSSxDQUFDQyxDQUFDLEdBQUdlLENBQUMsQ0FBQ2YsQ0FBRSxDQUFDO0VBQ2hFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTc0UsV0FBV0EsQ0FBRXhFLENBQVMsRUFBRUMsQ0FBUyxFQUFFQyxDQUFTLEVBQVk7SUFDN0QsT0FBTyxJQUFJLENBQUM2RCxNQUFNLENBQUUsSUFBSSxDQUFDL0QsQ0FBQyxHQUFHQSxDQUFDLEVBQUUsSUFBSSxDQUFDQyxDQUFDLEdBQUdBLENBQUMsRUFBRSxJQUFJLENBQUNDLENBQUMsR0FBR0EsQ0FBRSxDQUFDO0VBQzFEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTdUUsY0FBY0EsQ0FBRWpDLE1BQWMsRUFBWTtJQUMvQyxPQUFPLElBQUksQ0FBQ3VCLE1BQU0sQ0FBRSxJQUFJLENBQUMvRCxDQUFDLEdBQUd3QyxNQUFNLEVBQUUsSUFBSSxDQUFDdkMsQ0FBQyxHQUFHdUMsTUFBTSxFQUFFLElBQUksQ0FBQ3RDLENBQUMsR0FBR3NDLE1BQU8sQ0FBQztFQUN6RTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDUzRCLGNBQWNBLENBQUU1QixNQUFjLEVBQVk7SUFDL0MsT0FBTyxJQUFJLENBQUN1QixNQUFNLENBQUUsSUFBSSxDQUFDL0QsQ0FBQyxHQUFHd0MsTUFBTSxFQUFFLElBQUksQ0FBQ3ZDLENBQUMsR0FBR3VDLE1BQU0sRUFBRSxJQUFJLENBQUN0QyxDQUFDLEdBQUdzQyxNQUFPLENBQUM7RUFDekU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU2tDLFFBQVFBLENBQUVsQyxNQUFjLEVBQVk7SUFDekMsT0FBTyxJQUFJLENBQUM0QixjQUFjLENBQUU1QixNQUFPLENBQUM7RUFDdEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NtQyxpQkFBaUJBLENBQUUxRCxDQUFVLEVBQVk7SUFDOUMsT0FBTyxJQUFJLENBQUM4QyxNQUFNLENBQUUsSUFBSSxDQUFDL0QsQ0FBQyxHQUFHaUIsQ0FBQyxDQUFDakIsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBQyxHQUFHZ0IsQ0FBQyxDQUFDaEIsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBQyxHQUFHZSxDQUFDLENBQUNmLENBQUUsQ0FBQztFQUNoRTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU3dELFlBQVlBLENBQUVsQixNQUFjLEVBQVk7SUFDN0MsT0FBTyxJQUFJLENBQUN1QixNQUFNLENBQUUsSUFBSSxDQUFDL0QsQ0FBQyxHQUFHd0MsTUFBTSxFQUFFLElBQUksQ0FBQ3ZDLENBQUMsR0FBR3VDLE1BQU0sRUFBRSxJQUFJLENBQUN0QyxDQUFDLEdBQUdzQyxNQUFPLENBQUM7RUFDekU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NvQyxNQUFNQSxDQUFBLEVBQVk7SUFDdkIsT0FBTyxJQUFJLENBQUNiLE1BQU0sQ0FBRSxDQUFDLElBQUksQ0FBQy9ELENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQ0MsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDQyxDQUFFLENBQUM7RUFDakQ7O0VBRUE7QUFDRjtBQUNBO0VBQ1MyRSxRQUFRQSxDQUFFNUQsQ0FBVSxFQUFZO0lBQ3JDLE9BQU8sSUFBSSxDQUFDOEMsTUFBTSxDQUNoQixJQUFJLENBQUM5RCxDQUFDLEdBQUdnQixDQUFDLENBQUNmLENBQUMsR0FBRyxJQUFJLENBQUNBLENBQUMsR0FBR2UsQ0FBQyxDQUFDaEIsQ0FBQyxFQUMzQixJQUFJLENBQUNDLENBQUMsR0FBR2UsQ0FBQyxDQUFDakIsQ0FBQyxHQUFHLElBQUksQ0FBQ0EsQ0FBQyxHQUFHaUIsQ0FBQyxDQUFDZixDQUFDLEVBQzNCLElBQUksQ0FBQ0YsQ0FBQyxHQUFHaUIsQ0FBQyxDQUFDaEIsQ0FBQyxHQUFHLElBQUksQ0FBQ0EsQ0FBQyxHQUFHZ0IsQ0FBQyxDQUFDakIsQ0FDNUIsQ0FBQztFQUNIOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTOEUsU0FBU0EsQ0FBQSxFQUFZO0lBQzFCLE1BQU03QyxHQUFHLEdBQUcsSUFBSSxDQUFDMUIsU0FBUztJQUMxQixJQUFLMEIsR0FBRyxLQUFLLENBQUMsRUFBRztNQUNmLE1BQU0sSUFBSUMsS0FBSyxDQUFFLDBDQUEyQyxDQUFDO0lBQy9ELENBQUMsTUFDSTtNQUNILE9BQU8sSUFBSSxDQUFDd0IsWUFBWSxDQUFFekIsR0FBSSxDQUFDO0lBQ2pDO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NHLGNBQWNBLENBQUEsRUFBWTtJQUMvQixPQUFPLElBQUksQ0FBQzJCLE1BQU0sQ0FBRXhFLEtBQUssQ0FBQzZDLGNBQWMsQ0FBRSxJQUFJLENBQUNwQyxDQUFFLENBQUMsRUFBRVQsS0FBSyxDQUFDNkMsY0FBYyxDQUFFLElBQUksQ0FBQ25DLENBQUUsQ0FBQyxFQUFFVixLQUFLLENBQUM2QyxjQUFjLENBQUUsSUFBSSxDQUFDbEMsQ0FBRSxDQUFFLENBQUM7RUFDdEg7O0VBRUE7QUFDRjtBQUNBO0VBQ1M2RSxhQUFhQSxDQUFBLEVBQXVCO0lBQ3pDLE9BQU87TUFDTC9FLENBQUMsRUFBRSxJQUFJLENBQUNBLENBQUM7TUFDVEMsQ0FBQyxFQUFFLElBQUksQ0FBQ0EsQ0FBQztNQUNUQyxDQUFDLEVBQUUsSUFBSSxDQUFDQTtJQUNWLENBQUM7RUFDSDtFQUVPOEUsVUFBVUEsQ0FBQSxFQUFTO0lBQ3hCbEYsT0FBTyxDQUFDbUYsSUFBSSxDQUFDRCxVQUFVLENBQUUsSUFBSyxDQUFDO0VBQ2pDO0VBRUEsT0FBdUJDLElBQUksR0FBRyxJQUFJOUYsSUFBSSxDQUFFVyxPQUFPLEVBQUU7SUFDL0NvRixPQUFPLEVBQUUsSUFBSTtJQUNiQyxVQUFVLEVBQUVyRixPQUFPLENBQUNzRixTQUFTLENBQUNyQixNQUFNO0lBQ3BDc0IsZ0JBQWdCLEVBQUUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7RUFDN0IsQ0FBRSxDQUFDOztFQUVIOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFjQyxLQUFLQSxDQUFFQyxLQUFjLEVBQUVDLEdBQVksRUFBRXBDLEtBQWEsRUFBWTtJQUMxRTtJQUNBLE9BQU85RCxHQUFHLENBQUNtRyxVQUFVLENBQUNILEtBQUssQ0FBRSxJQUFJaEcsR0FBRyxDQUFDbUcsVUFBVSxDQUFDLENBQUMsRUFBRW5HLEdBQUcsQ0FBQ21HLFVBQVUsQ0FBQ0MscUJBQXFCLENBQUVILEtBQUssRUFBRUMsR0FBSSxDQUFDLEVBQUVwQyxLQUFNLENBQUMsQ0FBQ3VDLFlBQVksQ0FBRUosS0FBTSxDQUFDO0VBQ3RJOztFQUVBO0FBQ0Y7QUFDQTtFQUNFLE9BQWNLLGVBQWVBLENBQUVDLFdBQStCLEVBQVk7SUFDeEUsT0FBTzlELEVBQUUsQ0FDUDhELFdBQVcsQ0FBQzdGLENBQUMsRUFDYjZGLFdBQVcsQ0FBQzVGLENBQUMsRUFDYjRGLFdBQVcsQ0FBQzNGLENBQ2QsQ0FBQztFQUNIOztFQUk2QjtFQUNFO0VBQ0E7RUFDQTtBQUVqQzs7QUFFQTtBQUNBSixPQUFPLENBQUNzRixTQUFTLENBQUNVLFNBQVMsR0FBRyxJQUFJO0FBQ2xDaEcsT0FBTyxDQUFDc0YsU0FBUyxDQUFDVyxTQUFTLEdBQUcsQ0FBQztBQUUvQnpHLEdBQUcsQ0FBQzBHLFFBQVEsQ0FBRSxTQUFTLEVBQUVsRyxPQUFRLENBQUM7QUFFbEMsTUFBTWlDLEVBQUUsR0FBR2pDLE9BQU8sQ0FBQ21GLElBQUksQ0FBQ2dCLE1BQU0sQ0FBQ0MsSUFBSSxDQUFFcEcsT0FBTyxDQUFDbUYsSUFBSyxDQUFDO0FBQ25EM0YsR0FBRyxDQUFDMEcsUUFBUSxDQUFFLElBQUksRUFBRWpFLEVBQUcsQ0FBQztBQUV4QixNQUFNb0UsZ0JBQWdCLFNBQVNyRyxPQUFPLENBQUM7RUFDckM7QUFDRjtBQUNBO0VBQ0UsT0FBY3NHLHFCQUFxQkEsQ0FBRUMsbUJBQXdELEVBQVM7SUFDcEdGLGdCQUFnQixDQUFDZixTQUFTLENBQUVpQixtQkFBbUIsQ0FBRSxHQUFHLE1BQU07TUFDeEQsTUFBTSxJQUFJbkUsS0FBSyxDQUFHLCtCQUE4Qm1FLG1CQUFvQix3QkFBd0IsQ0FBQztJQUMvRixDQUFDO0VBQ0g7QUFDRjtBQUVBRixnQkFBZ0IsQ0FBQ0MscUJBQXFCLENBQUUsUUFBUyxDQUFDO0FBQ2xERCxnQkFBZ0IsQ0FBQ0MscUJBQXFCLENBQUUsTUFBTyxDQUFDO0FBQ2hERCxnQkFBZ0IsQ0FBQ0MscUJBQXFCLENBQUUsTUFBTyxDQUFDO0FBQ2hERCxnQkFBZ0IsQ0FBQ0MscUJBQXFCLENBQUUsTUFBTyxDQUFDO0FBRWhEdEcsT0FBTyxDQUFDd0csSUFBSSxHQUFHQyxNQUFNLEdBQUcsSUFBSUosZ0JBQWdCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsR0FBRyxJQUFJckcsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0FBQ2hGQSxPQUFPLENBQUMwRyxNQUFNLEdBQUdELE1BQU0sR0FBRyxJQUFJSixnQkFBZ0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxHQUFHLElBQUlyRyxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7QUFDbEZBLE9BQU8sQ0FBQzJHLE1BQU0sR0FBR0YsTUFBTSxHQUFHLElBQUlKLGdCQUFnQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEdBQUcsSUFBSXJHLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztBQUNsRkEsT0FBTyxDQUFDNEcsTUFBTSxHQUFHSCxNQUFNLEdBQUcsSUFBSUosZ0JBQWdCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsR0FBRyxJQUFJckcsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0FBRWxGQSxPQUFPLENBQUM2RyxTQUFTLEdBQUcsSUFBSXZILE1BQU0sQ0FBRSxXQUFXLEVBQUU7RUFDM0N3SCxTQUFTLEVBQUU5RyxPQUFPO0VBQ2xCK0csYUFBYSxFQUFFLG9EQUFvRDtFQUNuRTlCLGFBQWEsRUFBSStCLE9BQWdCLElBQU1BLE9BQU8sQ0FBQy9CLGFBQWEsQ0FBQyxDQUFDO0VBQzlEYSxlQUFlLEVBQUU5RixPQUFPLENBQUM4RixlQUFlO0VBQ3hDbUIsV0FBVyxFQUFFO0lBQ1gvRyxDQUFDLEVBQUVYLFFBQVE7SUFDWFksQ0FBQyxFQUFFWixRQUFRO0lBQ1hhLENBQUMsRUFBRWI7RUFDTDtBQUNGLENBQUUsQ0FBQztBQUVILFNBQVMwQyxFQUFFIn0=