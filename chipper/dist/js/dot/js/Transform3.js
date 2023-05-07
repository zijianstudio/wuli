// Copyright 2013-2023, University of Colorado Boulder

/**
 * Forward and inverse transforms with 3x3 matrices. Methods starting with 'transform' will apply the transform from our
 * primary matrix, while methods starting with 'inverse' will apply the transform from the inverse of our matrix.
 *
 * Generally, this means transform.inverseThing( transform.transformThing( thing ) ).equals( thing ).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TinyEmitter from '../../axon/js/TinyEmitter.js';
import dot from './dot.js';
import Matrix3 from './Matrix3.js';
import Ray2 from './Ray2.js';
import Vector2 from './Vector2.js';
const scratchMatrix = new Matrix3();
class Transform3 {
  /**
   * Creates a transform based around an initial matrix.
   * @public
   *
   * @param {Matrix3} [matrix]
   */
  constructor(matrix) {
    // @private {Matrix3} - The primary matrix used for the transform
    this.matrix = Matrix3.IDENTITY.copy();

    // @private {Matrix3} - The inverse of the primary matrix, computed lazily
    this.inverse = Matrix3.IDENTITY.copy();

    // @private {Matrix3} - The transpose of the primary matrix, computed lazily
    this.matrixTransposed = Matrix3.IDENTITY.copy();

    // @private {Matrix3} - The inverse of the transposed primary matrix, computed lazily
    this.inverseTransposed = Matrix3.IDENTITY.copy();

    // @private {boolean} - Whether this.inverse has been computed based on the latest primary matrix
    this.inverseValid = true;

    // @private {boolean} - Whether this.matrixTransposed has been computed based on the latest primary matrix
    this.transposeValid = true;

    // @private {boolean} - Whether this.inverseTransposed has been computed based on the latest primary matrix
    this.inverseTransposeValid = true;

    // @public {TinyEmitter}
    this.changeEmitter = new TinyEmitter();
    if (matrix) {
      this.setMatrix(matrix);
    }
  }

  /*---------------------------------------------------------------------------*
   * mutators
   *---------------------------------------------------------------------------*/

  /**
   * Sets the value of the primary matrix directly from a Matrix3. Does not change the Matrix3 instance.
   * @public
   *
   * @param {Matrix3} matrix
   */
  setMatrix(matrix) {
    // copy the matrix over to our matrix
    this.matrix.set(matrix);

    // set flags and notify
    this.invalidate();
  }

  /**
   * Validates the matrix or matrix arguments, overrideable by subclasses to refine the validation.
   * @param {Matrix} matrix
   * @protected
   */
  validateMatrix(matrix) {
    assert && assert(matrix instanceof Matrix3, 'matrix was incorrect type');
    assert && assert(matrix.isFinite(), 'matrix must be finite');
  }

  /**
   * This should be called after our internal matrix is changed. It marks the other dependent matrices as invalid,
   * and sends out notifications of the change.
   * @private
   */
  invalidate() {
    // sanity check
    assert && this.validateMatrix(this.matrix);

    // dependent matrices now invalid
    this.inverseValid = false;
    this.transposeValid = false;
    this.inverseTransposeValid = false;
    this.changeEmitter.emit();
  }

  /**
   * Modifies the primary matrix such that: this.matrix = matrix * this.matrix.
   * @public
   *
   * @param {Matrix3} matrix
   */
  prepend(matrix) {
    assert && this.validateMatrix(matrix);

    // In the absence of a prepend-multiply function in Matrix3, copy over to a scratch matrix instead
    // TODO: implement a prepend-multiply directly in Matrix3 for a performance increase
    scratchMatrix.set(this.matrix);
    this.matrix.set(matrix);
    this.matrix.multiplyMatrix(scratchMatrix);

    // set flags and notify
    this.invalidate();
  }

  /**
   * Optimized prepended translation such that: this.matrix = translation( x, y ) * this.matrix.
   * @public
   *
   * @param {number} x -  x-coordinate
   * @param {number} y -  y-coordinate
   */
  prependTranslation(x, y) {
    // See scenery#119 for more details on the need.

    assert && assert(typeof x === 'number' && typeof y === 'number' && isFinite(x) && isFinite(y), 'Attempted to prepend non-finite or non-number (x,y) to the transform');
    this.matrix.prependTranslation(x, y);

    // set flags and notify
    this.invalidate();
  }

  /**
   * Modifies the primary matrix such that: this.matrix = this.matrix * matrix
   * @public
   *
   * @param {Matrix3} matrix
   */
  append(matrix) {
    assert && this.validateMatrix(matrix);
    this.matrix.multiplyMatrix(matrix);

    // set flags and notify
    this.invalidate();
  }

  /**
   * Like prepend(), but prepends the other transform's matrix.
   * @public
   *
   * @param {Transform3} transform
   */
  prependTransform(transform) {
    this.prepend(transform.matrix);
  }

  /**
   * Like append(), but appends the other transform's matrix.
   * @public
   *
   * @param {Transform3} transform
   */
  appendTransform(transform) {
    this.append(transform.matrix);
  }

  /**
   * Sets the transform of a Canvas context to be equivalent to this transform.
   * @public
   *
   * @param {CanvasRenderingContext2D} context
   */
  applyToCanvasContext(context) {
    context.setTransform(this.matrix.m00(), this.matrix.m10(), this.matrix.m01(), this.matrix.m11(), this.matrix.m02(), this.matrix.m12());
  }

  /*---------------------------------------------------------------------------*
   * getters
   *---------------------------------------------------------------------------*/

  /**
   * Creates a copy of this transform.
   * @public
   *
   * @returns {Transform3}
   */
  copy() {
    const transform = new Transform3(this.matrix);
    transform.inverse = this.inverse;
    transform.matrixTransposed = this.matrixTransposed;
    transform.inverseTransposed = this.inverseTransposed;
    transform.inverseValid = this.inverseValid;
    transform.transposeValid = this.transposeValid;
    transform.inverseTransposeValid = this.inverseTransposeValid;
  }

  /**
   * Returns the primary matrix of this transform.
   * @public
   *
   * @returns {Matrix3}
   */
  getMatrix() {
    return this.matrix;
  }

  /**
   * Returns the inverse of the primary matrix of this transform.
   * @public
   *
   * @returns {Matrix3}
   */
  getInverse() {
    if (!this.inverseValid) {
      this.inverseValid = true;
      this.inverse.set(this.matrix);
      this.inverse.invert();
    }
    return this.inverse;
  }

  /**
   * Returns the transpose of the primary matrix of this transform.
   * @public
   *
   * @returns {Matrix3}
   */
  getMatrixTransposed() {
    if (!this.transposeValid) {
      this.transposeValid = true;
      this.matrixTransposed.set(this.matrix);
      this.matrixTransposed.transpose();
    }
    return this.matrixTransposed;
  }

  /**
   * Returns the inverse of the transpose of matrix of this transform.
   * @public
   *
   * @returns {Matrix3}
   */
  getInverseTransposed() {
    if (!this.inverseTransposeValid) {
      this.inverseTransposeValid = true;
      this.inverseTransposed.set(this.getInverse()); // triggers inverse to be valid
      this.inverseTransposed.transpose();
    }
    return this.inverseTransposed;
  }

  /**
   * Returns whether our primary matrix is known to be an identity matrix. If false is returned, it doesn't necessarily
   * mean our matrix isn't an identity matrix, just that it is unlikely in normal usage.
   * @public
   *
   * @returns {boolean}
   */
  isIdentity() {
    return this.matrix.isFastIdentity();
  }

  /**
   * Returns whether any components of our primary matrix are either infinite or NaN.
   * @public
   *
   * @returns {boolean}
   */
  isFinite() {
    return this.matrix.isFinite();
  }

  /*---------------------------------------------------------------------------*
   * forward transforms (for Vector2 or scalar)
   *---------------------------------------------------------------------------*/

  /**
   * Transforms a 2-dimensional vector like it is a point with a position (translation is applied).
   * @public
   *
   * For an affine matrix $M$, the result is the homogeneous multiplication $M\begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$.
   *
   * @param {Vector2} v
   * @returns {Vector2}
   */
  transformPosition2(v) {
    return this.matrix.timesVector2(v);
  }

  /**
   * Transforms a 2-dimensional vector like position is irrelevant (translation is not applied).
   * @public
   *
   * For an affine matrix $\begin{bmatrix} a & b & c \\ d & e & f \\ 0 & 0 & 1 \end{bmatrix}$,
   * the result is $\begin{bmatrix} a & b & 0 \\ d & e & 0 \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$.
   *
   * @param {Vector2} v
   * @returns {Vector2}
   */
  transformDelta2(v) {
    const m = this.getMatrix();
    // m . v - m . Vector2.ZERO
    return new Vector2(m.m00() * v.x + m.m01() * v.y, m.m10() * v.x + m.m11() * v.y);
  }

  /**
   * Transforms a 2-dimensional vector like it is a normal to a curve (so that the curve is transformed, and the new
   * normal to the curve at the transformed point is returned).
   * @public
   *
   * For an affine matrix $\begin{bmatrix} a & b & c \\ d & e & f \\ 0 & 0 & 1 \end{bmatrix}$,
   * the result is $\begin{bmatrix} a & e & 0 \\ d & b & 0 \\ 0 & 0 & 1 \end{bmatrix}^{-1} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$.
   * This is essentially the transposed inverse with translation removed.
   *
   * @param {Vector2} v
   * @returns {Vector2}
   */
  transformNormal2(v) {
    return this.getInverse().timesTransposeVector2(v).normalize();
  }

  /**
   * Returns the resulting x-coordinate of the transformation of all vectors with the initial input x-coordinate. If
   * this is not well-defined (the x value depends on y), an assertion is thrown (and y is assumed to be 0).
   * @public
   *
   * @param {number} x
   * @returns {number}
   */
  transformX(x) {
    const m = this.getMatrix();
    assert && assert(!m.m01(), 'Transforming an X value with a rotation/shear is ill-defined');
    return m.m00() * x + m.m02();
  }

  /**
   * Returns the resulting y-coordinate of the transformation of all vectors with the initial input y-coordinate. If
   * this is not well-defined (the y value depends on x), an assertion is thrown (and x is assumed to be 0).
   * @public
   *
   * @param {number} y
   * @returns {number}
   */
  transformY(y) {
    const m = this.getMatrix();
    assert && assert(!m.m10(), 'Transforming a Y value with a rotation/shear is ill-defined');
    return m.m11() * y + m.m12();
  }

  /**
   * Returns the x-coordinate difference for two transformed vectors, which add the x-coordinate difference of the input
   * x (and same y values) beforehand.
   * @public
   *
   * @param {number} x
   * @returns {number}
   */
  transformDeltaX(x) {
    const m = this.getMatrix();
    // same as this.transformDelta2( new Vector2( x, 0 ) ).x;
    return m.m00() * x;
  }

  /**
   * Returns the y-coordinate difference for two transformed vectors, which add the y-coordinate difference of the input
   * y (and same x values) beforehand.
   * @public
   *
   * @param {number} y
   * @returns {number}
   */
  transformDeltaY(y) {
    const m = this.getMatrix();
    // same as this.transformDelta2( new Vector2( 0, y ) ).y;
    return m.m11() * y;
  }

  /**
   * Returns bounds (axis-aligned) that contains the transformed bounds rectangle.
   * @public
   *
   * NOTE: transform.inverseBounds2( transform.transformBounds2( bounds ) ) may be larger than the original box,
   * if it includes a rotation that isn't a multiple of $\pi/2$. This is because the returned bounds may expand in
   * area to cover ALL of the corners of the transformed bounding box.
   *
   * @param {Bounds2} bounds
   * @returns {Bounds2}
   */
  transformBounds2(bounds) {
    return bounds.transformed(this.matrix);
  }

  /**
   * Returns a transformed phet.kite.Shape.
   * @public
   *
   * @param {Shape} shape
   * @returns {Shape}
   */
  transformShape(shape) {
    return shape.transformed(this.matrix);
  }

  /**
   * Returns a transformed ray.
   * @public
   *
   * @param {Ray2} ray
   * @returns {Ray2}
   */
  transformRay2(ray) {
    return new Ray2(this.transformPosition2(ray.position), this.transformDelta2(ray.direction).normalized());
  }

  /*---------------------------------------------------------------------------*
   * inverse transforms (for Vector2 or scalar)
   *---------------------------------------------------------------------------*/

  /**
   * Transforms a 2-dimensional vector by the inverse of our transform like it is a point with a position (translation is applied).
   * @public
   *
   * For an affine matrix $M$, the result is the homogeneous multiplication $M^{-1}\begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$.
   *
   * This is the inverse of transformPosition2().
   *
   * @param {Vector2} v
   * @returns {Vector2}
   */
  inversePosition2(v) {
    return this.getInverse().timesVector2(v);
  }

  /**
   * Transforms a 2-dimensional vector by the inverse of our transform like position is irrelevant (translation is not applied).
   * @public
   *
   * For an affine matrix $\begin{bmatrix} a & b & c \\ d & e & f \\ 0 & 0 & 1 \end{bmatrix}$,
   * the result is $\begin{bmatrix} a & b & 0 \\ d & e & 0 \\ 0 & 0 & 1 \end{bmatrix}^{-1} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$.
   *
   * This is the inverse of transformDelta2().
   *
   * @param {Vector2} v
   * @returns {Vector2}
   */
  inverseDelta2(v) {
    const m = this.getInverse();
    // m . v - m . Vector2.ZERO
    return new Vector2(m.m00() * v.x + m.m01() * v.y, m.m10() * v.x + m.m11() * v.y);
  }

  /**
   * Transforms a 2-dimensional vector by the inverse of our transform like it is a normal to a curve (so that the
   * curve is transformed, and the new normal to the curve at the transformed point is returned).
   * @public
   *
   * For an affine matrix $\begin{bmatrix} a & b & c \\ d & e & f \\ 0 & 0 & 1 \end{bmatrix}$,
   * the result is $\begin{bmatrix} a & e & 0 \\ d & b & 0 \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$.
   * This is essentially the transposed transform with translation removed.
   *
   * This is the inverse of transformNormal2().
   *
   * @param {Vector2} v
   * @returns {Vector2}
   */
  inverseNormal2(v) {
    return this.matrix.timesTransposeVector2(v).normalize();
  }

  /**
   * Returns the resulting x-coordinate of the inverse transformation of all vectors with the initial input x-coordinate. If
   * this is not well-defined (the x value depends on y), an assertion is thrown (and y is assumed to be 0).
   * @public
   *
   * This is the inverse of transformX().
   *
   * @param {number} x
   * @returns {number}
   */
  inverseX(x) {
    const m = this.getInverse();
    assert && assert(!m.m01(), 'Inverting an X value with a rotation/shear is ill-defined');
    return m.m00() * x + m.m02();
  }

  /**
   * Returns the resulting y-coordinate of the inverse transformation of all vectors with the initial input y-coordinate. If
   * this is not well-defined (the y value depends on x), an assertion is thrown (and x is assumed to be 0).
   * @public
   *
   * This is the inverse of transformY().
   *
   * @param {number} y
   * @returns {number}
   */
  inverseY(y) {
    const m = this.getInverse();
    assert && assert(!m.m10(), 'Inverting a Y value with a rotation/shear is ill-defined');
    return m.m11() * y + m.m12();
  }

  /**
   * Returns the x-coordinate difference for two inverse-transformed vectors, which add the x-coordinate difference of the input
   * x (and same y values) beforehand.
   * @public
   *
   * This is the inverse of transformDeltaX().
   *
   * @param {number} x
   * @returns {number}
   */
  inverseDeltaX(x) {
    const m = this.getInverse();
    assert && assert(!m.m01(), 'Inverting an X value with a rotation/shear is ill-defined');
    // same as this.inverseDelta2( new Vector2( x, 0 ) ).x;
    return m.m00() * x;
  }

  /**
   * Returns the y-coordinate difference for two inverse-transformed vectors, which add the y-coordinate difference of the input
   * y (and same x values) beforehand.
   * @public
   *
   * This is the inverse of transformDeltaY().
   *
   * @param {number} y
   * @returns {number}
   */
  inverseDeltaY(y) {
    const m = this.getInverse();
    assert && assert(!m.m10(), 'Inverting a Y value with a rotation/shear is ill-defined');
    // same as this.inverseDelta2( new Vector2( 0, y ) ).y;
    return m.m11() * y;
  }

  /**
   * Returns bounds (axis-aligned) that contains the inverse-transformed bounds rectangle.
   * @public
   *
   * NOTE: transform.inverseBounds2( transform.transformBounds2( bounds ) ) may be larger than the original box,
   * if it includes a rotation that isn't a multiple of $\pi/2$. This is because the returned bounds may expand in
   * area to cover ALL of the corners of the transformed bounding box.
   *
   * @param {Bounds2} bounds
   * @returns {Bounds2}
   */
  inverseBounds2(bounds) {
    return bounds.transformed(this.getInverse());
  }

  /**
   * Returns an inverse-transformed phet.kite.Shape.
   * @public
   *
   * This is the inverse of transformShape()
   *
   * @param {Shape} shape
   * @returns {Shape}
   */
  inverseShape(shape) {
    return shape.transformed(this.getInverse());
  }

  /**
   * Returns an inverse-transformed ray.
   * @public
   *
   * This is the inverse of transformRay2()
   *
   * @param {Ray2} ray
   * @returns {Ray2}
   */
  inverseRay2(ray) {
    return new Ray2(this.inversePosition2(ray.position), this.inverseDelta2(ray.direction).normalized());
  }
}
dot.register('Transform3', Transform3);
export default Transform3;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsImRvdCIsIk1hdHJpeDMiLCJSYXkyIiwiVmVjdG9yMiIsInNjcmF0Y2hNYXRyaXgiLCJUcmFuc2Zvcm0zIiwiY29uc3RydWN0b3IiLCJtYXRyaXgiLCJJREVOVElUWSIsImNvcHkiLCJpbnZlcnNlIiwibWF0cml4VHJhbnNwb3NlZCIsImludmVyc2VUcmFuc3Bvc2VkIiwiaW52ZXJzZVZhbGlkIiwidHJhbnNwb3NlVmFsaWQiLCJpbnZlcnNlVHJhbnNwb3NlVmFsaWQiLCJjaGFuZ2VFbWl0dGVyIiwic2V0TWF0cml4Iiwic2V0IiwiaW52YWxpZGF0ZSIsInZhbGlkYXRlTWF0cml4IiwiYXNzZXJ0IiwiaXNGaW5pdGUiLCJlbWl0IiwicHJlcGVuZCIsIm11bHRpcGx5TWF0cml4IiwicHJlcGVuZFRyYW5zbGF0aW9uIiwieCIsInkiLCJhcHBlbmQiLCJwcmVwZW5kVHJhbnNmb3JtIiwidHJhbnNmb3JtIiwiYXBwZW5kVHJhbnNmb3JtIiwiYXBwbHlUb0NhbnZhc0NvbnRleHQiLCJjb250ZXh0Iiwic2V0VHJhbnNmb3JtIiwibTAwIiwibTEwIiwibTAxIiwibTExIiwibTAyIiwibTEyIiwiZ2V0TWF0cml4IiwiZ2V0SW52ZXJzZSIsImludmVydCIsImdldE1hdHJpeFRyYW5zcG9zZWQiLCJ0cmFuc3Bvc2UiLCJnZXRJbnZlcnNlVHJhbnNwb3NlZCIsImlzSWRlbnRpdHkiLCJpc0Zhc3RJZGVudGl0eSIsInRyYW5zZm9ybVBvc2l0aW9uMiIsInYiLCJ0aW1lc1ZlY3RvcjIiLCJ0cmFuc2Zvcm1EZWx0YTIiLCJtIiwidHJhbnNmb3JtTm9ybWFsMiIsInRpbWVzVHJhbnNwb3NlVmVjdG9yMiIsIm5vcm1hbGl6ZSIsInRyYW5zZm9ybVgiLCJ0cmFuc2Zvcm1ZIiwidHJhbnNmb3JtRGVsdGFYIiwidHJhbnNmb3JtRGVsdGFZIiwidHJhbnNmb3JtQm91bmRzMiIsImJvdW5kcyIsInRyYW5zZm9ybWVkIiwidHJhbnNmb3JtU2hhcGUiLCJzaGFwZSIsInRyYW5zZm9ybVJheTIiLCJyYXkiLCJwb3NpdGlvbiIsImRpcmVjdGlvbiIsIm5vcm1hbGl6ZWQiLCJpbnZlcnNlUG9zaXRpb24yIiwiaW52ZXJzZURlbHRhMiIsImludmVyc2VOb3JtYWwyIiwiaW52ZXJzZVgiLCJpbnZlcnNlWSIsImludmVyc2VEZWx0YVgiLCJpbnZlcnNlRGVsdGFZIiwiaW52ZXJzZUJvdW5kczIiLCJpbnZlcnNlU2hhcGUiLCJpbnZlcnNlUmF5MiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVHJhbnNmb3JtMy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBGb3J3YXJkIGFuZCBpbnZlcnNlIHRyYW5zZm9ybXMgd2l0aCAzeDMgbWF0cmljZXMuIE1ldGhvZHMgc3RhcnRpbmcgd2l0aCAndHJhbnNmb3JtJyB3aWxsIGFwcGx5IHRoZSB0cmFuc2Zvcm0gZnJvbSBvdXJcclxuICogcHJpbWFyeSBtYXRyaXgsIHdoaWxlIG1ldGhvZHMgc3RhcnRpbmcgd2l0aCAnaW52ZXJzZScgd2lsbCBhcHBseSB0aGUgdHJhbnNmb3JtIGZyb20gdGhlIGludmVyc2Ugb2Ygb3VyIG1hdHJpeC5cclxuICpcclxuICogR2VuZXJhbGx5LCB0aGlzIG1lYW5zIHRyYW5zZm9ybS5pbnZlcnNlVGhpbmcoIHRyYW5zZm9ybS50cmFuc2Zvcm1UaGluZyggdGhpbmcgKSApLmVxdWFscyggdGhpbmcgKS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBUaW55RW1pdHRlciBmcm9tICcuLi8uLi9heG9uL2pzL1RpbnlFbWl0dGVyLmpzJztcclxuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4vTWF0cml4My5qcyc7XHJcbmltcG9ydCBSYXkyIGZyb20gJy4vUmF5Mi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4vVmVjdG9yMi5qcyc7XHJcblxyXG5jb25zdCBzY3JhdGNoTWF0cml4ID0gbmV3IE1hdHJpeDMoKTtcclxuXHJcbmNsYXNzIFRyYW5zZm9ybTMge1xyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSB0cmFuc2Zvcm0gYmFzZWQgYXJvdW5kIGFuIGluaXRpYWwgbWF0cml4LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4M30gW21hdHJpeF1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbWF0cml4ICkge1xyXG4gICAgLy8gQHByaXZhdGUge01hdHJpeDN9IC0gVGhlIHByaW1hcnkgbWF0cml4IHVzZWQgZm9yIHRoZSB0cmFuc2Zvcm1cclxuICAgIHRoaXMubWF0cml4ID0gTWF0cml4My5JREVOVElUWS5jb3B5KCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge01hdHJpeDN9IC0gVGhlIGludmVyc2Ugb2YgdGhlIHByaW1hcnkgbWF0cml4LCBjb21wdXRlZCBsYXppbHlcclxuICAgIHRoaXMuaW52ZXJzZSA9IE1hdHJpeDMuSURFTlRJVFkuY29weSgpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtNYXRyaXgzfSAtIFRoZSB0cmFuc3Bvc2Ugb2YgdGhlIHByaW1hcnkgbWF0cml4LCBjb21wdXRlZCBsYXppbHlcclxuICAgIHRoaXMubWF0cml4VHJhbnNwb3NlZCA9IE1hdHJpeDMuSURFTlRJVFkuY29weSgpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtNYXRyaXgzfSAtIFRoZSBpbnZlcnNlIG9mIHRoZSB0cmFuc3Bvc2VkIHByaW1hcnkgbWF0cml4LCBjb21wdXRlZCBsYXppbHlcclxuICAgIHRoaXMuaW52ZXJzZVRyYW5zcG9zZWQgPSBNYXRyaXgzLklERU5USVRZLmNvcHkoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoaXMuaW52ZXJzZSBoYXMgYmVlbiBjb21wdXRlZCBiYXNlZCBvbiB0aGUgbGF0ZXN0IHByaW1hcnkgbWF0cml4XHJcbiAgICB0aGlzLmludmVyc2VWYWxpZCA9IHRydWU7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gV2hldGhlciB0aGlzLm1hdHJpeFRyYW5zcG9zZWQgaGFzIGJlZW4gY29tcHV0ZWQgYmFzZWQgb24gdGhlIGxhdGVzdCBwcmltYXJ5IG1hdHJpeFxyXG4gICAgdGhpcy50cmFuc3Bvc2VWYWxpZCA9IHRydWU7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gV2hldGhlciB0aGlzLmludmVyc2VUcmFuc3Bvc2VkIGhhcyBiZWVuIGNvbXB1dGVkIGJhc2VkIG9uIHRoZSBsYXRlc3QgcHJpbWFyeSBtYXRyaXhcclxuICAgIHRoaXMuaW52ZXJzZVRyYW5zcG9zZVZhbGlkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtUaW55RW1pdHRlcn1cclxuICAgIHRoaXMuY2hhbmdlRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xyXG5cclxuICAgIGlmICggbWF0cml4ICkge1xyXG4gICAgICB0aGlzLnNldE1hdHJpeCggbWF0cml4ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogbXV0YXRvcnNcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoZSBwcmltYXJ5IG1hdHJpeCBkaXJlY3RseSBmcm9tIGEgTWF0cml4My4gRG9lcyBub3QgY2hhbmdlIHRoZSBNYXRyaXgzIGluc3RhbmNlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4M30gbWF0cml4XHJcbiAgICovXHJcbiAgc2V0TWF0cml4KCBtYXRyaXggKSB7XHJcblxyXG4gICAgLy8gY29weSB0aGUgbWF0cml4IG92ZXIgdG8gb3VyIG1hdHJpeFxyXG4gICAgdGhpcy5tYXRyaXguc2V0KCBtYXRyaXggKTtcclxuXHJcbiAgICAvLyBzZXQgZmxhZ3MgYW5kIG5vdGlmeVxyXG4gICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBWYWxpZGF0ZXMgdGhlIG1hdHJpeCBvciBtYXRyaXggYXJndW1lbnRzLCBvdmVycmlkZWFibGUgYnkgc3ViY2xhc3NlcyB0byByZWZpbmUgdGhlIHZhbGlkYXRpb24uXHJcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICB2YWxpZGF0ZU1hdHJpeCggbWF0cml4ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF0cml4IGluc3RhbmNlb2YgTWF0cml4MywgJ21hdHJpeCB3YXMgaW5jb3JyZWN0IHR5cGUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXRyaXguaXNGaW5pdGUoKSwgJ21hdHJpeCBtdXN0IGJlIGZpbml0ZScgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgc2hvdWxkIGJlIGNhbGxlZCBhZnRlciBvdXIgaW50ZXJuYWwgbWF0cml4IGlzIGNoYW5nZWQuIEl0IG1hcmtzIHRoZSBvdGhlciBkZXBlbmRlbnQgbWF0cmljZXMgYXMgaW52YWxpZCxcclxuICAgKiBhbmQgc2VuZHMgb3V0IG5vdGlmaWNhdGlvbnMgb2YgdGhlIGNoYW5nZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGludmFsaWRhdGUoKSB7XHJcblxyXG4gICAgLy8gc2FuaXR5IGNoZWNrXHJcbiAgICBhc3NlcnQgJiYgdGhpcy52YWxpZGF0ZU1hdHJpeCggdGhpcy5tYXRyaXggKTtcclxuXHJcbiAgICAvLyBkZXBlbmRlbnQgbWF0cmljZXMgbm93IGludmFsaWRcclxuICAgIHRoaXMuaW52ZXJzZVZhbGlkID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyYW5zcG9zZVZhbGlkID0gZmFsc2U7XHJcbiAgICB0aGlzLmludmVyc2VUcmFuc3Bvc2VWYWxpZCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuY2hhbmdlRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb2RpZmllcyB0aGUgcHJpbWFyeSBtYXRyaXggc3VjaCB0aGF0OiB0aGlzLm1hdHJpeCA9IG1hdHJpeCAqIHRoaXMubWF0cml4LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4M30gbWF0cml4XHJcbiAgICovXHJcbiAgcHJlcGVuZCggbWF0cml4ICkge1xyXG4gICAgYXNzZXJ0ICYmIHRoaXMudmFsaWRhdGVNYXRyaXgoIG1hdHJpeCApO1xyXG5cclxuICAgIC8vIEluIHRoZSBhYnNlbmNlIG9mIGEgcHJlcGVuZC1tdWx0aXBseSBmdW5jdGlvbiBpbiBNYXRyaXgzLCBjb3B5IG92ZXIgdG8gYSBzY3JhdGNoIG1hdHJpeCBpbnN0ZWFkXHJcbiAgICAvLyBUT0RPOiBpbXBsZW1lbnQgYSBwcmVwZW5kLW11bHRpcGx5IGRpcmVjdGx5IGluIE1hdHJpeDMgZm9yIGEgcGVyZm9ybWFuY2UgaW5jcmVhc2VcclxuICAgIHNjcmF0Y2hNYXRyaXguc2V0KCB0aGlzLm1hdHJpeCApO1xyXG4gICAgdGhpcy5tYXRyaXguc2V0KCBtYXRyaXggKTtcclxuICAgIHRoaXMubWF0cml4Lm11bHRpcGx5TWF0cml4KCBzY3JhdGNoTWF0cml4ICk7XHJcblxyXG4gICAgLy8gc2V0IGZsYWdzIGFuZCBub3RpZnlcclxuICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT3B0aW1pemVkIHByZXBlbmRlZCB0cmFuc2xhdGlvbiBzdWNoIHRoYXQ6IHRoaXMubWF0cml4ID0gdHJhbnNsYXRpb24oIHgsIHkgKSAqIHRoaXMubWF0cml4LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gIHgtY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gIHktY29vcmRpbmF0ZVxyXG4gICAqL1xyXG4gIHByZXBlbmRUcmFuc2xhdGlvbiggeCwgeSApIHtcclxuICAgIC8vIFNlZSBzY2VuZXJ5IzExOSBmb3IgbW9yZSBkZXRhaWxzIG9uIHRoZSBuZWVkLlxyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB4ID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgeSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHggKSAmJiBpc0Zpbml0ZSggeSApLFxyXG4gICAgICAnQXR0ZW1wdGVkIHRvIHByZXBlbmQgbm9uLWZpbml0ZSBvciBub24tbnVtYmVyICh4LHkpIHRvIHRoZSB0cmFuc2Zvcm0nICk7XHJcblxyXG4gICAgdGhpcy5tYXRyaXgucHJlcGVuZFRyYW5zbGF0aW9uKCB4LCB5ICk7XHJcblxyXG4gICAgLy8gc2V0IGZsYWdzIGFuZCBub3RpZnlcclxuICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW9kaWZpZXMgdGhlIHByaW1hcnkgbWF0cml4IHN1Y2ggdGhhdDogdGhpcy5tYXRyaXggPSB0aGlzLm1hdHJpeCAqIG1hdHJpeFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4M30gbWF0cml4XHJcbiAgICovXHJcbiAgYXBwZW5kKCBtYXRyaXggKSB7XHJcbiAgICBhc3NlcnQgJiYgdGhpcy52YWxpZGF0ZU1hdHJpeCggbWF0cml4ICk7XHJcblxyXG4gICAgdGhpcy5tYXRyaXgubXVsdGlwbHlNYXRyaXgoIG1hdHJpeCApO1xyXG5cclxuICAgIC8vIHNldCBmbGFncyBhbmQgbm90aWZ5XHJcbiAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExpa2UgcHJlcGVuZCgpLCBidXQgcHJlcGVuZHMgdGhlIG90aGVyIHRyYW5zZm9ybSdzIG1hdHJpeC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyYW5zZm9ybTN9IHRyYW5zZm9ybVxyXG4gICAqL1xyXG4gIHByZXBlbmRUcmFuc2Zvcm0oIHRyYW5zZm9ybSApIHtcclxuICAgIHRoaXMucHJlcGVuZCggdHJhbnNmb3JtLm1hdHJpeCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTGlrZSBhcHBlbmQoKSwgYnV0IGFwcGVuZHMgdGhlIG90aGVyIHRyYW5zZm9ybSdzIG1hdHJpeC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyYW5zZm9ybTN9IHRyYW5zZm9ybVxyXG4gICAqL1xyXG4gIGFwcGVuZFRyYW5zZm9ybSggdHJhbnNmb3JtICkge1xyXG4gICAgdGhpcy5hcHBlbmQoIHRyYW5zZm9ybS5tYXRyaXggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHRyYW5zZm9ybSBvZiBhIENhbnZhcyBjb250ZXh0IHRvIGJlIGVxdWl2YWxlbnQgdG8gdGhpcyB0cmFuc2Zvcm0uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGNvbnRleHRcclxuICAgKi9cclxuICBhcHBseVRvQ2FudmFzQ29udGV4dCggY29udGV4dCApIHtcclxuICAgIGNvbnRleHQuc2V0VHJhbnNmb3JtKCB0aGlzLm1hdHJpeC5tMDAoKSwgdGhpcy5tYXRyaXgubTEwKCksIHRoaXMubWF0cml4Lm0wMSgpLCB0aGlzLm1hdHJpeC5tMTEoKSwgdGhpcy5tYXRyaXgubTAyKCksIHRoaXMubWF0cml4Lm0xMigpICk7XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBnZXR0ZXJzXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIHRyYW5zZm9ybS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VHJhbnNmb3JtM31cclxuICAgKi9cclxuICBjb3B5KCkge1xyXG4gICAgY29uc3QgdHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybTMoIHRoaXMubWF0cml4ICk7XHJcblxyXG4gICAgdHJhbnNmb3JtLmludmVyc2UgPSB0aGlzLmludmVyc2U7XHJcbiAgICB0cmFuc2Zvcm0ubWF0cml4VHJhbnNwb3NlZCA9IHRoaXMubWF0cml4VHJhbnNwb3NlZDtcclxuICAgIHRyYW5zZm9ybS5pbnZlcnNlVHJhbnNwb3NlZCA9IHRoaXMuaW52ZXJzZVRyYW5zcG9zZWQ7XHJcblxyXG4gICAgdHJhbnNmb3JtLmludmVyc2VWYWxpZCA9IHRoaXMuaW52ZXJzZVZhbGlkO1xyXG4gICAgdHJhbnNmb3JtLnRyYW5zcG9zZVZhbGlkID0gdGhpcy50cmFuc3Bvc2VWYWxpZDtcclxuICAgIHRyYW5zZm9ybS5pbnZlcnNlVHJhbnNwb3NlVmFsaWQgPSB0aGlzLmludmVyc2VUcmFuc3Bvc2VWYWxpZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHByaW1hcnkgbWF0cml4IG9mIHRoaXMgdHJhbnNmb3JtLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXgzfVxyXG4gICAqL1xyXG4gIGdldE1hdHJpeCgpIHtcclxuICAgIHJldHVybiB0aGlzLm1hdHJpeDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIHByaW1hcnkgbWF0cml4IG9mIHRoaXMgdHJhbnNmb3JtLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXgzfVxyXG4gICAqL1xyXG4gIGdldEludmVyc2UoKSB7XHJcbiAgICBpZiAoICF0aGlzLmludmVyc2VWYWxpZCApIHtcclxuICAgICAgdGhpcy5pbnZlcnNlVmFsaWQgPSB0cnVlO1xyXG5cclxuICAgICAgdGhpcy5pbnZlcnNlLnNldCggdGhpcy5tYXRyaXggKTtcclxuICAgICAgdGhpcy5pbnZlcnNlLmludmVydCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuaW52ZXJzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHRyYW5zcG9zZSBvZiB0aGUgcHJpbWFyeSBtYXRyaXggb2YgdGhpcyB0cmFuc2Zvcm0uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge01hdHJpeDN9XHJcbiAgICovXHJcbiAgZ2V0TWF0cml4VHJhbnNwb3NlZCgpIHtcclxuICAgIGlmICggIXRoaXMudHJhbnNwb3NlVmFsaWQgKSB7XHJcbiAgICAgIHRoaXMudHJhbnNwb3NlVmFsaWQgPSB0cnVlO1xyXG5cclxuICAgICAgdGhpcy5tYXRyaXhUcmFuc3Bvc2VkLnNldCggdGhpcy5tYXRyaXggKTtcclxuICAgICAgdGhpcy5tYXRyaXhUcmFuc3Bvc2VkLnRyYW5zcG9zZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMubWF0cml4VHJhbnNwb3NlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIHRyYW5zcG9zZSBvZiBtYXRyaXggb2YgdGhpcyB0cmFuc2Zvcm0uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge01hdHJpeDN9XHJcbiAgICovXHJcbiAgZ2V0SW52ZXJzZVRyYW5zcG9zZWQoKSB7XHJcbiAgICBpZiAoICF0aGlzLmludmVyc2VUcmFuc3Bvc2VWYWxpZCApIHtcclxuICAgICAgdGhpcy5pbnZlcnNlVHJhbnNwb3NlVmFsaWQgPSB0cnVlO1xyXG5cclxuICAgICAgdGhpcy5pbnZlcnNlVHJhbnNwb3NlZC5zZXQoIHRoaXMuZ2V0SW52ZXJzZSgpICk7IC8vIHRyaWdnZXJzIGludmVyc2UgdG8gYmUgdmFsaWRcclxuICAgICAgdGhpcy5pbnZlcnNlVHJhbnNwb3NlZC50cmFuc3Bvc2UoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmludmVyc2VUcmFuc3Bvc2VkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIG91ciBwcmltYXJ5IG1hdHJpeCBpcyBrbm93biB0byBiZSBhbiBpZGVudGl0eSBtYXRyaXguIElmIGZhbHNlIGlzIHJldHVybmVkLCBpdCBkb2Vzbid0IG5lY2Vzc2FyaWx5XHJcbiAgICogbWVhbiBvdXIgbWF0cml4IGlzbid0IGFuIGlkZW50aXR5IG1hdHJpeCwganVzdCB0aGF0IGl0IGlzIHVubGlrZWx5IGluIG5vcm1hbCB1c2FnZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc0lkZW50aXR5KCkge1xyXG4gICAgcmV0dXJuIHRoaXMubWF0cml4LmlzRmFzdElkZW50aXR5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgYW55IGNvbXBvbmVudHMgb2Ygb3VyIHByaW1hcnkgbWF0cml4IGFyZSBlaXRoZXIgaW5maW5pdGUgb3IgTmFOLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzRmluaXRlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubWF0cml4LmlzRmluaXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBmb3J3YXJkIHRyYW5zZm9ybXMgKGZvciBWZWN0b3IyIG9yIHNjYWxhcilcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIFRyYW5zZm9ybXMgYSAyLWRpbWVuc2lvbmFsIHZlY3RvciBsaWtlIGl0IGlzIGEgcG9pbnQgd2l0aCBhIHBvc2l0aW9uICh0cmFuc2xhdGlvbiBpcyBhcHBsaWVkKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBGb3IgYW4gYWZmaW5lIG1hdHJpeCAkTSQsIHRoZSByZXN1bHQgaXMgdGhlIGhvbW9nZW5lb3VzIG11bHRpcGxpY2F0aW9uICRNXFxiZWdpbntibWF0cml4fSB4IFxcXFwgeSBcXFxcIDEgXFxlbmR7Ym1hdHJpeH0kLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB2XHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgdHJhbnNmb3JtUG9zaXRpb24yKCB2ICkge1xyXG4gICAgcmV0dXJuIHRoaXMubWF0cml4LnRpbWVzVmVjdG9yMiggdiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNmb3JtcyBhIDItZGltZW5zaW9uYWwgdmVjdG9yIGxpa2UgcG9zaXRpb24gaXMgaXJyZWxldmFudCAodHJhbnNsYXRpb24gaXMgbm90IGFwcGxpZWQpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEZvciBhbiBhZmZpbmUgbWF0cml4ICRcXGJlZ2lue2JtYXRyaXh9IGEgJiBiICYgYyBcXFxcIGQgJiBlICYgZiBcXFxcIDAgJiAwICYgMSBcXGVuZHtibWF0cml4fSQsXHJcbiAgICogdGhlIHJlc3VsdCBpcyAkXFxiZWdpbntibWF0cml4fSBhICYgYiAmIDAgXFxcXCBkICYgZSAmIDAgXFxcXCAwICYgMCAmIDEgXFxlbmR7Ym1hdHJpeH0gXFxiZWdpbntibWF0cml4fSB4IFxcXFwgeSBcXFxcIDEgXFxlbmR7Ym1hdHJpeH0kLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB2XHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgdHJhbnNmb3JtRGVsdGEyKCB2ICkge1xyXG4gICAgY29uc3QgbSA9IHRoaXMuZ2V0TWF0cml4KCk7XHJcbiAgICAvLyBtIC4gdiAtIG0gLiBWZWN0b3IyLlpFUk9cclxuICAgIHJldHVybiBuZXcgVmVjdG9yMiggbS5tMDAoKSAqIHYueCArIG0ubTAxKCkgKiB2LnksIG0ubTEwKCkgKiB2LnggKyBtLm0xMSgpICogdi55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIGEgMi1kaW1lbnNpb25hbCB2ZWN0b3IgbGlrZSBpdCBpcyBhIG5vcm1hbCB0byBhIGN1cnZlIChzbyB0aGF0IHRoZSBjdXJ2ZSBpcyB0cmFuc2Zvcm1lZCwgYW5kIHRoZSBuZXdcclxuICAgKiBub3JtYWwgdG8gdGhlIGN1cnZlIGF0IHRoZSB0cmFuc2Zvcm1lZCBwb2ludCBpcyByZXR1cm5lZCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogRm9yIGFuIGFmZmluZSBtYXRyaXggJFxcYmVnaW57Ym1hdHJpeH0gYSAmIGIgJiBjIFxcXFwgZCAmIGUgJiBmIFxcXFwgMCAmIDAgJiAxIFxcZW5ke2JtYXRyaXh9JCxcclxuICAgKiB0aGUgcmVzdWx0IGlzICRcXGJlZ2lue2JtYXRyaXh9IGEgJiBlICYgMCBcXFxcIGQgJiBiICYgMCBcXFxcIDAgJiAwICYgMSBcXGVuZHtibWF0cml4fV57LTF9IFxcYmVnaW57Ym1hdHJpeH0geCBcXFxcIHkgXFxcXCAxIFxcZW5ke2JtYXRyaXh9JC5cclxuICAgKiBUaGlzIGlzIGVzc2VudGlhbGx5IHRoZSB0cmFuc3Bvc2VkIGludmVyc2Ugd2l0aCB0cmFuc2xhdGlvbiByZW1vdmVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB2XHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgdHJhbnNmb3JtTm9ybWFsMiggdiApIHtcclxuICAgIHJldHVybiB0aGlzLmdldEludmVyc2UoKS50aW1lc1RyYW5zcG9zZVZlY3RvcjIoIHYgKS5ub3JtYWxpemUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHJlc3VsdGluZyB4LWNvb3JkaW5hdGUgb2YgdGhlIHRyYW5zZm9ybWF0aW9uIG9mIGFsbCB2ZWN0b3JzIHdpdGggdGhlIGluaXRpYWwgaW5wdXQgeC1jb29yZGluYXRlLiBJZlxyXG4gICAqIHRoaXMgaXMgbm90IHdlbGwtZGVmaW5lZCAodGhlIHggdmFsdWUgZGVwZW5kcyBvbiB5KSwgYW4gYXNzZXJ0aW9uIGlzIHRocm93biAoYW5kIHkgaXMgYXNzdW1lZCB0byBiZSAwKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgdHJhbnNmb3JtWCggeCApIHtcclxuICAgIGNvbnN0IG0gPSB0aGlzLmdldE1hdHJpeCgpO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW0ubTAxKCksICdUcmFuc2Zvcm1pbmcgYW4gWCB2YWx1ZSB3aXRoIGEgcm90YXRpb24vc2hlYXIgaXMgaWxsLWRlZmluZWQnICk7XHJcbiAgICByZXR1cm4gbS5tMDAoKSAqIHggKyBtLm0wMigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgcmVzdWx0aW5nIHktY29vcmRpbmF0ZSBvZiB0aGUgdHJhbnNmb3JtYXRpb24gb2YgYWxsIHZlY3RvcnMgd2l0aCB0aGUgaW5pdGlhbCBpbnB1dCB5LWNvb3JkaW5hdGUuIElmXHJcbiAgICogdGhpcyBpcyBub3Qgd2VsbC1kZWZpbmVkICh0aGUgeSB2YWx1ZSBkZXBlbmRzIG9uIHgpLCBhbiBhc3NlcnRpb24gaXMgdGhyb3duIChhbmQgeCBpcyBhc3N1bWVkIHRvIGJlIDApLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICB0cmFuc2Zvcm1ZKCB5ICkge1xyXG4gICAgY29uc3QgbSA9IHRoaXMuZ2V0TWF0cml4KCk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhbS5tMTAoKSwgJ1RyYW5zZm9ybWluZyBhIFkgdmFsdWUgd2l0aCBhIHJvdGF0aW9uL3NoZWFyIGlzIGlsbC1kZWZpbmVkJyApO1xyXG4gICAgcmV0dXJuIG0ubTExKCkgKiB5ICsgbS5tMTIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHgtY29vcmRpbmF0ZSBkaWZmZXJlbmNlIGZvciB0d28gdHJhbnNmb3JtZWQgdmVjdG9ycywgd2hpY2ggYWRkIHRoZSB4LWNvb3JkaW5hdGUgZGlmZmVyZW5jZSBvZiB0aGUgaW5wdXRcclxuICAgKiB4IChhbmQgc2FtZSB5IHZhbHVlcykgYmVmb3JlaGFuZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgdHJhbnNmb3JtRGVsdGFYKCB4ICkge1xyXG4gICAgY29uc3QgbSA9IHRoaXMuZ2V0TWF0cml4KCk7XHJcbiAgICAvLyBzYW1lIGFzIHRoaXMudHJhbnNmb3JtRGVsdGEyKCBuZXcgVmVjdG9yMiggeCwgMCApICkueDtcclxuICAgIHJldHVybiBtLm0wMCgpICogeDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHktY29vcmRpbmF0ZSBkaWZmZXJlbmNlIGZvciB0d28gdHJhbnNmb3JtZWQgdmVjdG9ycywgd2hpY2ggYWRkIHRoZSB5LWNvb3JkaW5hdGUgZGlmZmVyZW5jZSBvZiB0aGUgaW5wdXRcclxuICAgKiB5IChhbmQgc2FtZSB4IHZhbHVlcykgYmVmb3JlaGFuZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgdHJhbnNmb3JtRGVsdGFZKCB5ICkge1xyXG4gICAgY29uc3QgbSA9IHRoaXMuZ2V0TWF0cml4KCk7XHJcbiAgICAvLyBzYW1lIGFzIHRoaXMudHJhbnNmb3JtRGVsdGEyKCBuZXcgVmVjdG9yMiggMCwgeSApICkueTtcclxuICAgIHJldHVybiBtLm0xMSgpICogeTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYm91bmRzIChheGlzLWFsaWduZWQpIHRoYXQgY29udGFpbnMgdGhlIHRyYW5zZm9ybWVkIGJvdW5kcyByZWN0YW5nbGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogTk9URTogdHJhbnNmb3JtLmludmVyc2VCb3VuZHMyKCB0cmFuc2Zvcm0udHJhbnNmb3JtQm91bmRzMiggYm91bmRzICkgKSBtYXkgYmUgbGFyZ2VyIHRoYW4gdGhlIG9yaWdpbmFsIGJveCxcclxuICAgKiBpZiBpdCBpbmNsdWRlcyBhIHJvdGF0aW9uIHRoYXQgaXNuJ3QgYSBtdWx0aXBsZSBvZiAkXFxwaS8yJC4gVGhpcyBpcyBiZWNhdXNlIHRoZSByZXR1cm5lZCBib3VuZHMgbWF5IGV4cGFuZCBpblxyXG4gICAqIGFyZWEgdG8gY292ZXIgQUxMIG9mIHRoZSBjb3JuZXJzIG9mIHRoZSB0cmFuc2Zvcm1lZCBib3VuZGluZyBib3guXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGJvdW5kc1xyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMyfVxyXG4gICAqL1xyXG4gIHRyYW5zZm9ybUJvdW5kczIoIGJvdW5kcyApIHtcclxuICAgIHJldHVybiBib3VuZHMudHJhbnNmb3JtZWQoIHRoaXMubWF0cml4ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdHJhbnNmb3JtZWQgcGhldC5raXRlLlNoYXBlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHRyYW5zZm9ybVNoYXBlKCBzaGFwZSApIHtcclxuICAgIHJldHVybiBzaGFwZS50cmFuc2Zvcm1lZCggdGhpcy5tYXRyaXggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSB0cmFuc2Zvcm1lZCByYXkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtSYXkyfSByYXlcclxuICAgKiBAcmV0dXJucyB7UmF5Mn1cclxuICAgKi9cclxuICB0cmFuc2Zvcm1SYXkyKCByYXkgKSB7XHJcbiAgICByZXR1cm4gbmV3IFJheTIoIHRoaXMudHJhbnNmb3JtUG9zaXRpb24yKCByYXkucG9zaXRpb24gKSwgdGhpcy50cmFuc2Zvcm1EZWx0YTIoIHJheS5kaXJlY3Rpb24gKS5ub3JtYWxpemVkKCkgKTtcclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIGludmVyc2UgdHJhbnNmb3JtcyAoZm9yIFZlY3RvcjIgb3Igc2NhbGFyKVxyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNmb3JtcyBhIDItZGltZW5zaW9uYWwgdmVjdG9yIGJ5IHRoZSBpbnZlcnNlIG9mIG91ciB0cmFuc2Zvcm0gbGlrZSBpdCBpcyBhIHBvaW50IHdpdGggYSBwb3NpdGlvbiAodHJhbnNsYXRpb24gaXMgYXBwbGllZCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogRm9yIGFuIGFmZmluZSBtYXRyaXggJE0kLCB0aGUgcmVzdWx0IGlzIHRoZSBob21vZ2VuZW91cyBtdWx0aXBsaWNhdGlvbiAkTV57LTF9XFxiZWdpbntibWF0cml4fSB4IFxcXFwgeSBcXFxcIDEgXFxlbmR7Ym1hdHJpeH0kLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1Qb3NpdGlvbjIoKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGludmVyc2VQb3NpdGlvbjIoIHYgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRJbnZlcnNlKCkudGltZXNWZWN0b3IyKCB2ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIGEgMi1kaW1lbnNpb25hbCB2ZWN0b3IgYnkgdGhlIGludmVyc2Ugb2Ygb3VyIHRyYW5zZm9ybSBsaWtlIHBvc2l0aW9uIGlzIGlycmVsZXZhbnQgKHRyYW5zbGF0aW9uIGlzIG5vdCBhcHBsaWVkKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBGb3IgYW4gYWZmaW5lIG1hdHJpeCAkXFxiZWdpbntibWF0cml4fSBhICYgYiAmIGMgXFxcXCBkICYgZSAmIGYgXFxcXCAwICYgMCAmIDEgXFxlbmR7Ym1hdHJpeH0kLFxyXG4gICAqIHRoZSByZXN1bHQgaXMgJFxcYmVnaW57Ym1hdHJpeH0gYSAmIGIgJiAwIFxcXFwgZCAmIGUgJiAwIFxcXFwgMCAmIDAgJiAxIFxcZW5ke2JtYXRyaXh9XnstMX0gXFxiZWdpbntibWF0cml4fSB4IFxcXFwgeSBcXFxcIDEgXFxlbmR7Ym1hdHJpeH0kLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1EZWx0YTIoKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGludmVyc2VEZWx0YTIoIHYgKSB7XHJcbiAgICBjb25zdCBtID0gdGhpcy5nZXRJbnZlcnNlKCk7XHJcbiAgICAvLyBtIC4gdiAtIG0gLiBWZWN0b3IyLlpFUk9cclxuICAgIHJldHVybiBuZXcgVmVjdG9yMiggbS5tMDAoKSAqIHYueCArIG0ubTAxKCkgKiB2LnksIG0ubTEwKCkgKiB2LnggKyBtLm0xMSgpICogdi55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIGEgMi1kaW1lbnNpb25hbCB2ZWN0b3IgYnkgdGhlIGludmVyc2Ugb2Ygb3VyIHRyYW5zZm9ybSBsaWtlIGl0IGlzIGEgbm9ybWFsIHRvIGEgY3VydmUgKHNvIHRoYXQgdGhlXHJcbiAgICogY3VydmUgaXMgdHJhbnNmb3JtZWQsIGFuZCB0aGUgbmV3IG5vcm1hbCB0byB0aGUgY3VydmUgYXQgdGhlIHRyYW5zZm9ybWVkIHBvaW50IGlzIHJldHVybmVkKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBGb3IgYW4gYWZmaW5lIG1hdHJpeCAkXFxiZWdpbntibWF0cml4fSBhICYgYiAmIGMgXFxcXCBkICYgZSAmIGYgXFxcXCAwICYgMCAmIDEgXFxlbmR7Ym1hdHJpeH0kLFxyXG4gICAqIHRoZSByZXN1bHQgaXMgJFxcYmVnaW57Ym1hdHJpeH0gYSAmIGUgJiAwIFxcXFwgZCAmIGIgJiAwIFxcXFwgMCAmIDAgJiAxIFxcZW5ke2JtYXRyaXh9IFxcYmVnaW57Ym1hdHJpeH0geCBcXFxcIHkgXFxcXCAxIFxcZW5ke2JtYXRyaXh9JC5cclxuICAgKiBUaGlzIGlzIGVzc2VudGlhbGx5IHRoZSB0cmFuc3Bvc2VkIHRyYW5zZm9ybSB3aXRoIHRyYW5zbGF0aW9uIHJlbW92ZWQuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbnZlcnNlIG9mIHRyYW5zZm9ybU5vcm1hbDIoKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGludmVyc2VOb3JtYWwyKCB2ICkge1xyXG4gICAgcmV0dXJuIHRoaXMubWF0cml4LnRpbWVzVHJhbnNwb3NlVmVjdG9yMiggdiApLm5vcm1hbGl6ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgcmVzdWx0aW5nIHgtY29vcmRpbmF0ZSBvZiB0aGUgaW52ZXJzZSB0cmFuc2Zvcm1hdGlvbiBvZiBhbGwgdmVjdG9ycyB3aXRoIHRoZSBpbml0aWFsIGlucHV0IHgtY29vcmRpbmF0ZS4gSWZcclxuICAgKiB0aGlzIGlzIG5vdCB3ZWxsLWRlZmluZWQgKHRoZSB4IHZhbHVlIGRlcGVuZHMgb24geSksIGFuIGFzc2VydGlvbiBpcyB0aHJvd24gKGFuZCB5IGlzIGFzc3VtZWQgdG8gYmUgMCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1YKCkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgaW52ZXJzZVgoIHggKSB7XHJcbiAgICBjb25zdCBtID0gdGhpcy5nZXRJbnZlcnNlKCk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhbS5tMDEoKSwgJ0ludmVydGluZyBhbiBYIHZhbHVlIHdpdGggYSByb3RhdGlvbi9zaGVhciBpcyBpbGwtZGVmaW5lZCcgKTtcclxuICAgIHJldHVybiBtLm0wMCgpICogeCArIG0ubTAyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSByZXN1bHRpbmcgeS1jb29yZGluYXRlIG9mIHRoZSBpbnZlcnNlIHRyYW5zZm9ybWF0aW9uIG9mIGFsbCB2ZWN0b3JzIHdpdGggdGhlIGluaXRpYWwgaW5wdXQgeS1jb29yZGluYXRlLiBJZlxyXG4gICAqIHRoaXMgaXMgbm90IHdlbGwtZGVmaW5lZCAodGhlIHkgdmFsdWUgZGVwZW5kcyBvbiB4KSwgYW4gYXNzZXJ0aW9uIGlzIHRocm93biAoYW5kIHggaXMgYXNzdW1lZCB0byBiZSAwKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbnZlcnNlIG9mIHRyYW5zZm9ybVkoKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBpbnZlcnNlWSggeSApIHtcclxuICAgIGNvbnN0IG0gPSB0aGlzLmdldEludmVyc2UoKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFtLm0xMCgpLCAnSW52ZXJ0aW5nIGEgWSB2YWx1ZSB3aXRoIGEgcm90YXRpb24vc2hlYXIgaXMgaWxsLWRlZmluZWQnICk7XHJcbiAgICByZXR1cm4gbS5tMTEoKSAqIHkgKyBtLm0xMigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgeC1jb29yZGluYXRlIGRpZmZlcmVuY2UgZm9yIHR3byBpbnZlcnNlLXRyYW5zZm9ybWVkIHZlY3RvcnMsIHdoaWNoIGFkZCB0aGUgeC1jb29yZGluYXRlIGRpZmZlcmVuY2Ugb2YgdGhlIGlucHV0XHJcbiAgICogeCAoYW5kIHNhbWUgeSB2YWx1ZXMpIGJlZm9yZWhhbmQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1EZWx0YVgoKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBpbnZlcnNlRGVsdGFYKCB4ICkge1xyXG4gICAgY29uc3QgbSA9IHRoaXMuZ2V0SW52ZXJzZSgpO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW0ubTAxKCksICdJbnZlcnRpbmcgYW4gWCB2YWx1ZSB3aXRoIGEgcm90YXRpb24vc2hlYXIgaXMgaWxsLWRlZmluZWQnICk7XHJcbiAgICAvLyBzYW1lIGFzIHRoaXMuaW52ZXJzZURlbHRhMiggbmV3IFZlY3RvcjIoIHgsIDAgKSApLng7XHJcbiAgICByZXR1cm4gbS5tMDAoKSAqIHg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB5LWNvb3JkaW5hdGUgZGlmZmVyZW5jZSBmb3IgdHdvIGludmVyc2UtdHJhbnNmb3JtZWQgdmVjdG9ycywgd2hpY2ggYWRkIHRoZSB5LWNvb3JkaW5hdGUgZGlmZmVyZW5jZSBvZiB0aGUgaW5wdXRcclxuICAgKiB5IChhbmQgc2FtZSB4IHZhbHVlcykgYmVmb3JlaGFuZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbnZlcnNlIG9mIHRyYW5zZm9ybURlbHRhWSgpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGludmVyc2VEZWx0YVkoIHkgKSB7XHJcbiAgICBjb25zdCBtID0gdGhpcy5nZXRJbnZlcnNlKCk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhbS5tMTAoKSwgJ0ludmVydGluZyBhIFkgdmFsdWUgd2l0aCBhIHJvdGF0aW9uL3NoZWFyIGlzIGlsbC1kZWZpbmVkJyApO1xyXG4gICAgLy8gc2FtZSBhcyB0aGlzLmludmVyc2VEZWx0YTIoIG5ldyBWZWN0b3IyKCAwLCB5ICkgKS55O1xyXG4gICAgcmV0dXJuIG0ubTExKCkgKiB5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBib3VuZHMgKGF4aXMtYWxpZ25lZCkgdGhhdCBjb250YWlucyB0aGUgaW52ZXJzZS10cmFuc2Zvcm1lZCBib3VuZHMgcmVjdGFuZ2xlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIE5PVEU6IHRyYW5zZm9ybS5pbnZlcnNlQm91bmRzMiggdHJhbnNmb3JtLnRyYW5zZm9ybUJvdW5kczIoIGJvdW5kcyApICkgbWF5IGJlIGxhcmdlciB0aGFuIHRoZSBvcmlnaW5hbCBib3gsXHJcbiAgICogaWYgaXQgaW5jbHVkZXMgYSByb3RhdGlvbiB0aGF0IGlzbid0IGEgbXVsdGlwbGUgb2YgJFxccGkvMiQuIFRoaXMgaXMgYmVjYXVzZSB0aGUgcmV0dXJuZWQgYm91bmRzIG1heSBleHBhbmQgaW5cclxuICAgKiBhcmVhIHRvIGNvdmVyIEFMTCBvZiB0aGUgY29ybmVycyBvZiB0aGUgdHJhbnNmb3JtZWQgYm91bmRpbmcgYm94LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBib3VuZHNcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzMn1cclxuICAgKi9cclxuICBpbnZlcnNlQm91bmRzMiggYm91bmRzICkge1xyXG4gICAgcmV0dXJuIGJvdW5kcy50cmFuc2Zvcm1lZCggdGhpcy5nZXRJbnZlcnNlKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gaW52ZXJzZS10cmFuc2Zvcm1lZCBwaGV0LmtpdGUuU2hhcGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1TaGFwZSgpXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBpbnZlcnNlU2hhcGUoIHNoYXBlICkge1xyXG4gICAgcmV0dXJuIHNoYXBlLnRyYW5zZm9ybWVkKCB0aGlzLmdldEludmVyc2UoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBpbnZlcnNlLXRyYW5zZm9ybWVkIHJheS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbnZlcnNlIG9mIHRyYW5zZm9ybVJheTIoKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtSYXkyfSByYXlcclxuICAgKiBAcmV0dXJucyB7UmF5Mn1cclxuICAgKi9cclxuICBpbnZlcnNlUmF5MiggcmF5ICkge1xyXG4gICAgcmV0dXJuIG5ldyBSYXkyKCB0aGlzLmludmVyc2VQb3NpdGlvbjIoIHJheS5wb3NpdGlvbiApLCB0aGlzLmludmVyc2VEZWx0YTIoIHJheS5kaXJlY3Rpb24gKS5ub3JtYWxpemVkKCkgKTtcclxuICB9XHJcbn1cclxuXHJcbmRvdC5yZWdpc3RlciggJ1RyYW5zZm9ybTMnLCBUcmFuc2Zvcm0zICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUcmFuc2Zvcm0zOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0sOEJBQThCO0FBQ3RELE9BQU9DLEdBQUcsTUFBTSxVQUFVO0FBQzFCLE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBQ2xDLE9BQU9DLElBQUksTUFBTSxXQUFXO0FBQzVCLE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBRWxDLE1BQU1DLGFBQWEsR0FBRyxJQUFJSCxPQUFPLENBQUMsQ0FBQztBQUVuQyxNQUFNSSxVQUFVLENBQUM7RUFDZjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsTUFBTSxFQUFHO0lBQ3BCO0lBQ0EsSUFBSSxDQUFDQSxNQUFNLEdBQUdOLE9BQU8sQ0FBQ08sUUFBUSxDQUFDQyxJQUFJLENBQUMsQ0FBQzs7SUFFckM7SUFDQSxJQUFJLENBQUNDLE9BQU8sR0FBR1QsT0FBTyxDQUFDTyxRQUFRLENBQUNDLElBQUksQ0FBQyxDQUFDOztJQUV0QztJQUNBLElBQUksQ0FBQ0UsZ0JBQWdCLEdBQUdWLE9BQU8sQ0FBQ08sUUFBUSxDQUFDQyxJQUFJLENBQUMsQ0FBQzs7SUFFL0M7SUFDQSxJQUFJLENBQUNHLGlCQUFpQixHQUFHWCxPQUFPLENBQUNPLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDLENBQUM7O0lBRWhEO0lBQ0EsSUFBSSxDQUFDSSxZQUFZLEdBQUcsSUFBSTs7SUFFeEI7SUFDQSxJQUFJLENBQUND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