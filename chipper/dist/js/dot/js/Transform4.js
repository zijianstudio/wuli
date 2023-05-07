// Copyright 2013-2022, University of Colorado Boulder

/**
 * Forward and inverse transforms with 4x4 matrices, allowing flexibility including affine and perspective transformations.
 *
 * Methods starting with 'transform' will apply the transform from our
 * primary matrix, while methods starting with 'inverse' will apply the transform from the inverse of our matrix.
 *
 * Generally, this means transform.inverseThing( transform.transformThing( thing ) ).equals( thing ).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TinyEmitter from '../../axon/js/TinyEmitter.js';
import dot from './dot.js';
import Matrix4 from './Matrix4.js';
import Ray3 from './Ray3.js';
import Vector3 from './Vector3.js';
const scratchMatrix = new Matrix4();

/**
 * check if the matrix is Finite and is of type Matrix4
 * @private
 * @param matrix
 * @returns {boolean}
 */
function checkMatrix(matrix) {
  return matrix instanceof Matrix4 && matrix.isFinite();
}
class Transform4 {
  /**
   * Creates a transform based around an initial matrix.
   * @public
   *
   * @param {Matrix4} matrix
   */
  constructor(matrix) {
    // @private {Matrix4} - The primary matrix used for the transform
    this.matrix = Matrix4.IDENTITY.copy();

    // @private {Matrix4} - The inverse of the primary matrix, computed lazily
    this.inverse = Matrix4.IDENTITY.copy();

    // @private {Matrix4} - The transpose of the primary matrix, computed lazily
    this.matrixTransposed = Matrix4.IDENTITY.copy();

    // @private {Matrix4} - The inverse of the transposed primary matrix, computed lazily
    this.inverseTransposed = Matrix4.IDENTITY.copy();

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
   * Sets the value of the primary matrix directly from a Matrix4. Does not change the Matrix4 instance of this
   * Transform4.
   * @public
   *
   * @param {Matrix4} matrix
   */
  setMatrix(matrix) {
    assert && assert(checkMatrix(matrix), 'Matrix has NaNs, non-finite values, or isn\'t a matrix!');

    // copy the matrix over to our matrix
    this.matrix.set(matrix);

    // set flags and notify
    this.invalidate();
  }

  /**
   * This should be called after our internal matrix is changed. It marks the other dependent matrices as invalid,
   * and sends out notifications of the change.
   * @private
   */
  invalidate() {
    // sanity check
    assert && assert(this.matrix.isFinite());

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
   * @param {Matrix4} matrix
   */
  prepend(matrix) {
    assert && assert(checkMatrix(matrix), 'Matrix has NaNs, non-finite values, or isn\'t a matrix!');

    // In the absence of a prepend-multiply function in Matrix4, copy over to a scratch matrix instead
    // TODO: implement a prepend-multiply directly in Matrix4 for a performance increase
    scratchMatrix.set(this.matrix);
    this.matrix.set(matrix);
    this.matrix.multiplyMatrix(scratchMatrix);

    // set flags and notify
    this.invalidate();
  }

  /**
   * Modifies the primary matrix such that: this.matrix = this.matrix * matrix
   * @public
   *
   * @param {Matrix4} matrix
   */
  append(matrix) {
    assert && assert(checkMatrix(matrix), 'Matrix has NaNs, non-finite values, or isn\'t a matrix!');
    this.matrix.multiplyMatrix(matrix);

    // set flags and notify
    this.invalidate();
  }

  /**
   * Like prepend(), but prepends the other transform's matrix.
   * @public
   *
   * @param {Transform4} transform
   */
  prependTransform(transform) {
    this.prepend(transform.matrix);
  }

  /**
   * Like append(), but appends the other transform's matrix.
   * @public
   *
   * @param {Transform4} transform
   */
  appendTransform(transform) {
    this.append(transform.matrix);
  }

  /**
   * Sets the transform of a Canvas context to be equivalent to the 2D affine part of this transform.
   * @public
   *
   * @param {CanvasRenderingContext2D} context
   */
  applyToCanvasContext(context) {
    context.setTransform(this.matrix.m00(), this.matrix.m10(), this.matrix.m01(), this.matrix.m11(), this.matrix.m03(), this.matrix.m13());
  }

  /*---------------------------------------------------------------------------*
   * getters
   *---------------------------------------------------------------------------*/

  /**
   * Creates a copy of this transform.
   * @public
   *
   * @returns {Transform4}
   */
  copy() {
    const transform = new Transform4(this.matrix);
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
   * @returns {Matrix4}
   */
  getMatrix() {
    return this.matrix;
  }

  /**
   * Returns the inverse of the primary matrix of this transform.
   * @public
   *
   * @returns {Matrix4}
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
   * @returns {Matrix4}
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
   * @returns {Matrix4}
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
    return this.matrix.type === Matrix4.Types.IDENTITY;
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
   * forward transforms (for Vector3 or scalar)
   *---------------------------------------------------------------------------*/

  /**
   * Transforms a 3-dimensional vector like it is a point with a position (translation is applied).
   * @public
   *
   * For an affine matrix $M$, the result is the homogeneous multiplication $M\begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}$.
   *
   * @param {Vector3} v
   * @returns {Vector3}
   */
  transformPosition3(v) {
    return this.matrix.timesVector3(v);
  }

  /**
   * Transforms a 3-dimensional vector like position is irrelevant (translation is not applied).
   * @public
   *
   * @param {Vector3} v
   * @returns {Vector3}
   */
  transformDelta3(v) {
    return this.matrix.timesRelativeVector3(v);
  }

  /**
   * Transforms a 3-dimensional vector like it is a normal to a surface (so that the surface is transformed, and the new
   * normal to the surface at the transformed point is returned).
   * @public
   *
   * @param {Vector3} v
   * @returns {Vector3}
   */
  transformNormal3(v) {
    return this.getInverse().timesTransposeVector3(v);
  }

  /**
   * Returns the x-coordinate difference for two transformed vectors, which add the x-coordinate difference of the input
   * x (and same y,z values) beforehand.
   * @public
   *
   * @param {number} x
   * @returns {number}
   */
  transformDeltaX(x) {
    return this.transformDelta3(new Vector3(x, 0, 0)).x;
  }

  /**
   * Returns the y-coordinate difference for two transformed vectors, which add the y-coordinate difference of the input
   * y (and same x,z values) beforehand.
   * @public
   *
   * @param {number} y
   * @returns {number}
   */
  transformDeltaY(y) {
    return this.transformDelta3(new Vector3(0, y, 0)).y;
  }

  /**
   * Returns the z-coordinate difference for two transformed vectors, which add the z-coordinate difference of the input
   * z (and same x,y values) beforehand.
   * @public
   *
   * @param {number} z
   * @returns {number}
   */
  transformDeltaZ(z) {
    return this.transformDelta3(new Vector3(0, 0, z)).z;
  }

  /**
   * Returns a transformed ray.
   * @public
   *
   * @param {Ray3} ray
   * @returns {Ray3}
   */
  transformRay(ray) {
    return new Ray3(this.transformPosition3(ray.position), this.transformPosition3(ray.position.plus(ray.direction)).minus(this.transformPosition3(ray.position)));
  }

  /*---------------------------------------------------------------------------*
   * inverse transforms (for Vector3 or scalar)
   *---------------------------------------------------------------------------*/

  /**
   * Transforms a 3-dimensional vector by the inverse of our transform like it is a point with a position (translation is applied).
   * @public
   *
   * For an affine matrix $M$, the result is the homogeneous multiplication $M^{-1}\begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}$.
   *
   * This is the inverse of transformPosition3().
   *
   * @param {Vector3} v
   * @returns {Vector3}
   */
  inversePosition3(v) {
    return this.getInverse().timesVector3(v);
  }

  /**
   * Transforms a 3-dimensional vector by the inverse of our transform like position is irrelevant (translation is not applied).
   * @public
   *
   * This is the inverse of transformDelta3().
   *
   * @param {Vector3} v
   * @returns {Vector3}
   */
  inverseDelta3(v) {
    // inverse actually has the translation rolled into the other coefficients, so we have to make this longer
    return this.inversePosition3(v).minus(this.inversePosition3(Vector3.ZERO));
  }

  /**
   * Transforms a 3-dimensional vector by the inverse of our transform like it is a normal to a curve (so that the
   * curve is transformed, and the new normal to the curve at the transformed point is returned).
   * @public
   *
   * This is the inverse of transformNormal3().
   *
   * @param {Vector3} v
   * @returns {Vector3}
   */
  inverseNormal3(v) {
    return this.matrix.timesTransposeVector3(v);
  }

  /**
   * Returns the x-coordinate difference for two inverse-transformed vectors, which add the x-coordinate difference of the input
   * x (and same y,z values) beforehand.
   * @public
   *
   * This is the inverse of transformDeltaX().
   *
   * @param {number} x
   * @returns {number}
   */
  inverseDeltaX(x) {
    return this.inverseDelta3(new Vector3(x, 0, 0)).x;
  }

  /**
   * Returns the y-coordinate difference for two inverse-transformed vectors, which add the y-coordinate difference of the input
   * y (and same x,z values) beforehand.
   * @public
   *
   * This is the inverse of transformDeltaY().
   *
   * @param {number} y
   * @returns {number}
   */
  inverseDeltaY(y) {
    return this.inverseDelta3(new Vector3(0, y, 0)).y;
  }

  /**
   * Returns the z-coordinate difference for two inverse-transformed vectors, which add the z-coordinate difference of the input
   * z (and same x,y values) beforehand.
   * @public
   *
   * This is the inverse of transformDeltaZ().
   *
   * @param {number} z
   * @returns {number}
   */
  inverseDeltaZ(z) {
    return this.inverseDelta3(new Vector3(0, 0, z)).z;
  }

  /**
   * Returns an inverse-transformed ray.
   * @public
   *
   * This is the inverse of transformRay()
   *
   * @param {Ray3} ray
   * @returns {Ray3}
   */
  inverseRay(ray) {
    return new Ray3(this.inversePosition3(ray.position), this.inversePosition3(ray.position.plus(ray.direction)).minus(this.inversePosition3(ray.position)));
  }
}
dot.register('Transform4', Transform4);
export default Transform4;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsImRvdCIsIk1hdHJpeDQiLCJSYXkzIiwiVmVjdG9yMyIsInNjcmF0Y2hNYXRyaXgiLCJjaGVja01hdHJpeCIsIm1hdHJpeCIsImlzRmluaXRlIiwiVHJhbnNmb3JtNCIsImNvbnN0cnVjdG9yIiwiSURFTlRJVFkiLCJjb3B5IiwiaW52ZXJzZSIsIm1hdHJpeFRyYW5zcG9zZWQiLCJpbnZlcnNlVHJhbnNwb3NlZCIsImludmVyc2VWYWxpZCIsInRyYW5zcG9zZVZhbGlkIiwiaW52ZXJzZVRyYW5zcG9zZVZhbGlkIiwiY2hhbmdlRW1pdHRlciIsInNldE1hdHJpeCIsImFzc2VydCIsInNldCIsImludmFsaWRhdGUiLCJlbWl0IiwicHJlcGVuZCIsIm11bHRpcGx5TWF0cml4IiwiYXBwZW5kIiwicHJlcGVuZFRyYW5zZm9ybSIsInRyYW5zZm9ybSIsImFwcGVuZFRyYW5zZm9ybSIsImFwcGx5VG9DYW52YXNDb250ZXh0IiwiY29udGV4dCIsInNldFRyYW5zZm9ybSIsIm0wMCIsIm0xMCIsIm0wMSIsIm0xMSIsIm0wMyIsIm0xMyIsImdldE1hdHJpeCIsImdldEludmVyc2UiLCJpbnZlcnQiLCJnZXRNYXRyaXhUcmFuc3Bvc2VkIiwidHJhbnNwb3NlIiwiZ2V0SW52ZXJzZVRyYW5zcG9zZWQiLCJpc0lkZW50aXR5IiwidHlwZSIsIlR5cGVzIiwidHJhbnNmb3JtUG9zaXRpb24zIiwidiIsInRpbWVzVmVjdG9yMyIsInRyYW5zZm9ybURlbHRhMyIsInRpbWVzUmVsYXRpdmVWZWN0b3IzIiwidHJhbnNmb3JtTm9ybWFsMyIsInRpbWVzVHJhbnNwb3NlVmVjdG9yMyIsInRyYW5zZm9ybURlbHRhWCIsIngiLCJ0cmFuc2Zvcm1EZWx0YVkiLCJ5IiwidHJhbnNmb3JtRGVsdGFaIiwieiIsInRyYW5zZm9ybVJheSIsInJheSIsInBvc2l0aW9uIiwicGx1cyIsImRpcmVjdGlvbiIsIm1pbnVzIiwiaW52ZXJzZVBvc2l0aW9uMyIsImludmVyc2VEZWx0YTMiLCJaRVJPIiwiaW52ZXJzZU5vcm1hbDMiLCJpbnZlcnNlRGVsdGFYIiwiaW52ZXJzZURlbHRhWSIsImludmVyc2VEZWx0YVoiLCJpbnZlcnNlUmF5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUcmFuc2Zvcm00LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEZvcndhcmQgYW5kIGludmVyc2UgdHJhbnNmb3JtcyB3aXRoIDR4NCBtYXRyaWNlcywgYWxsb3dpbmcgZmxleGliaWxpdHkgaW5jbHVkaW5nIGFmZmluZSBhbmQgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb25zLlxyXG4gKlxyXG4gKiBNZXRob2RzIHN0YXJ0aW5nIHdpdGggJ3RyYW5zZm9ybScgd2lsbCBhcHBseSB0aGUgdHJhbnNmb3JtIGZyb20gb3VyXHJcbiAqIHByaW1hcnkgbWF0cml4LCB3aGlsZSBtZXRob2RzIHN0YXJ0aW5nIHdpdGggJ2ludmVyc2UnIHdpbGwgYXBwbHkgdGhlIHRyYW5zZm9ybSBmcm9tIHRoZSBpbnZlcnNlIG9mIG91ciBtYXRyaXguXHJcbiAqXHJcbiAqIEdlbmVyYWxseSwgdGhpcyBtZWFucyB0cmFuc2Zvcm0uaW52ZXJzZVRoaW5nKCB0cmFuc2Zvcm0udHJhbnNmb3JtVGhpbmcoIHRoaW5nICkgKS5lcXVhbHMoIHRoaW5nICkuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgVGlueUVtaXR0ZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9UaW55RW1pdHRlci5qcyc7XHJcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xyXG5pbXBvcnQgTWF0cml4NCBmcm9tICcuL01hdHJpeDQuanMnO1xyXG5pbXBvcnQgUmF5MyBmcm9tICcuL1JheTMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuL1ZlY3RvcjMuanMnO1xyXG5cclxuY29uc3Qgc2NyYXRjaE1hdHJpeCA9IG5ldyBNYXRyaXg0KCk7XHJcblxyXG4vKipcclxuICogY2hlY2sgaWYgdGhlIG1hdHJpeCBpcyBGaW5pdGUgYW5kIGlzIG9mIHR5cGUgTWF0cml4NFxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0gbWF0cml4XHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gY2hlY2tNYXRyaXgoIG1hdHJpeCApIHtcclxuICByZXR1cm4gKCBtYXRyaXggaW5zdGFuY2VvZiBNYXRyaXg0ICkgJiYgbWF0cml4LmlzRmluaXRlKCk7XHJcbn1cclxuXHJcbmNsYXNzIFRyYW5zZm9ybTQge1xyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSB0cmFuc2Zvcm0gYmFzZWQgYXJvdW5kIGFuIGluaXRpYWwgbWF0cml4LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4NH0gbWF0cml4XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1hdHJpeCApIHtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7TWF0cml4NH0gLSBUaGUgcHJpbWFyeSBtYXRyaXggdXNlZCBmb3IgdGhlIHRyYW5zZm9ybVxyXG4gICAgdGhpcy5tYXRyaXggPSBNYXRyaXg0LklERU5USVRZLmNvcHkoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7TWF0cml4NH0gLSBUaGUgaW52ZXJzZSBvZiB0aGUgcHJpbWFyeSBtYXRyaXgsIGNvbXB1dGVkIGxhemlseVxyXG4gICAgdGhpcy5pbnZlcnNlID0gTWF0cml4NC5JREVOVElUWS5jb3B5KCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge01hdHJpeDR9IC0gVGhlIHRyYW5zcG9zZSBvZiB0aGUgcHJpbWFyeSBtYXRyaXgsIGNvbXB1dGVkIGxhemlseVxyXG4gICAgdGhpcy5tYXRyaXhUcmFuc3Bvc2VkID0gTWF0cml4NC5JREVOVElUWS5jb3B5KCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge01hdHJpeDR9IC0gVGhlIGludmVyc2Ugb2YgdGhlIHRyYW5zcG9zZWQgcHJpbWFyeSBtYXRyaXgsIGNvbXB1dGVkIGxhemlseVxyXG4gICAgdGhpcy5pbnZlcnNlVHJhbnNwb3NlZCA9IE1hdHJpeDQuSURFTlRJVFkuY29weSgpO1xyXG5cclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoaXMuaW52ZXJzZSBoYXMgYmVlbiBjb21wdXRlZCBiYXNlZCBvbiB0aGUgbGF0ZXN0IHByaW1hcnkgbWF0cml4XHJcbiAgICB0aGlzLmludmVyc2VWYWxpZCA9IHRydWU7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gV2hldGhlciB0aGlzLm1hdHJpeFRyYW5zcG9zZWQgaGFzIGJlZW4gY29tcHV0ZWQgYmFzZWQgb24gdGhlIGxhdGVzdCBwcmltYXJ5IG1hdHJpeFxyXG4gICAgdGhpcy50cmFuc3Bvc2VWYWxpZCA9IHRydWU7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gV2hldGhlciB0aGlzLmludmVyc2VUcmFuc3Bvc2VkIGhhcyBiZWVuIGNvbXB1dGVkIGJhc2VkIG9uIHRoZSBsYXRlc3QgcHJpbWFyeSBtYXRyaXhcclxuICAgIHRoaXMuaW52ZXJzZVRyYW5zcG9zZVZhbGlkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtUaW55RW1pdHRlcn1cclxuICAgIHRoaXMuY2hhbmdlRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xyXG5cclxuICAgIGlmICggbWF0cml4ICkge1xyXG4gICAgICB0aGlzLnNldE1hdHJpeCggbWF0cml4ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBtdXRhdG9yc1xyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgdGhlIHByaW1hcnkgbWF0cml4IGRpcmVjdGx5IGZyb20gYSBNYXRyaXg0LiBEb2VzIG5vdCBjaGFuZ2UgdGhlIE1hdHJpeDQgaW5zdGFuY2Ugb2YgdGhpc1xyXG4gICAqIFRyYW5zZm9ybTQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXg0fSBtYXRyaXhcclxuICAgKi9cclxuICBzZXRNYXRyaXgoIG1hdHJpeCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNoZWNrTWF0cml4KCBtYXRyaXggKSwgJ01hdHJpeCBoYXMgTmFOcywgbm9uLWZpbml0ZSB2YWx1ZXMsIG9yIGlzblxcJ3QgYSBtYXRyaXghJyApO1xyXG5cclxuICAgIC8vIGNvcHkgdGhlIG1hdHJpeCBvdmVyIHRvIG91ciBtYXRyaXhcclxuICAgIHRoaXMubWF0cml4LnNldCggbWF0cml4ICk7XHJcblxyXG4gICAgLy8gc2V0IGZsYWdzIGFuZCBub3RpZnlcclxuICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBzaG91bGQgYmUgY2FsbGVkIGFmdGVyIG91ciBpbnRlcm5hbCBtYXRyaXggaXMgY2hhbmdlZC4gSXQgbWFya3MgdGhlIG90aGVyIGRlcGVuZGVudCBtYXRyaWNlcyBhcyBpbnZhbGlkLFxyXG4gICAqIGFuZCBzZW5kcyBvdXQgbm90aWZpY2F0aW9ucyBvZiB0aGUgY2hhbmdlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaW52YWxpZGF0ZSgpIHtcclxuICAgIC8vIHNhbml0eSBjaGVja1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5tYXRyaXguaXNGaW5pdGUoKSApO1xyXG5cclxuICAgIC8vIGRlcGVuZGVudCBtYXRyaWNlcyBub3cgaW52YWxpZFxyXG4gICAgdGhpcy5pbnZlcnNlVmFsaWQgPSBmYWxzZTtcclxuICAgIHRoaXMudHJhbnNwb3NlVmFsaWQgPSBmYWxzZTtcclxuICAgIHRoaXMuaW52ZXJzZVRyYW5zcG9zZVZhbGlkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5jaGFuZ2VFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vZGlmaWVzIHRoZSBwcmltYXJ5IG1hdHJpeCBzdWNoIHRoYXQ6IHRoaXMubWF0cml4ID0gbWF0cml4ICogdGhpcy5tYXRyaXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXg0fSBtYXRyaXhcclxuICAgKi9cclxuICBwcmVwZW5kKCBtYXRyaXggKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGVja01hdHJpeCggbWF0cml4ICksICdNYXRyaXggaGFzIE5hTnMsIG5vbi1maW5pdGUgdmFsdWVzLCBvciBpc25cXCd0IGEgbWF0cml4IScgKTtcclxuXHJcbiAgICAvLyBJbiB0aGUgYWJzZW5jZSBvZiBhIHByZXBlbmQtbXVsdGlwbHkgZnVuY3Rpb24gaW4gTWF0cml4NCwgY29weSBvdmVyIHRvIGEgc2NyYXRjaCBtYXRyaXggaW5zdGVhZFxyXG4gICAgLy8gVE9ETzogaW1wbGVtZW50IGEgcHJlcGVuZC1tdWx0aXBseSBkaXJlY3RseSBpbiBNYXRyaXg0IGZvciBhIHBlcmZvcm1hbmNlIGluY3JlYXNlXHJcbiAgICBzY3JhdGNoTWF0cml4LnNldCggdGhpcy5tYXRyaXggKTtcclxuICAgIHRoaXMubWF0cml4LnNldCggbWF0cml4ICk7XHJcbiAgICB0aGlzLm1hdHJpeC5tdWx0aXBseU1hdHJpeCggc2NyYXRjaE1hdHJpeCApO1xyXG5cclxuICAgIC8vIHNldCBmbGFncyBhbmQgbm90aWZ5XHJcbiAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vZGlmaWVzIHRoZSBwcmltYXJ5IG1hdHJpeCBzdWNoIHRoYXQ6IHRoaXMubWF0cml4ID0gdGhpcy5tYXRyaXggKiBtYXRyaXhcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01hdHJpeDR9IG1hdHJpeFxyXG4gICAqL1xyXG4gIGFwcGVuZCggbWF0cml4ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2hlY2tNYXRyaXgoIG1hdHJpeCApLCAnTWF0cml4IGhhcyBOYU5zLCBub24tZmluaXRlIHZhbHVlcywgb3IgaXNuXFwndCBhIG1hdHJpeCEnICk7XHJcblxyXG4gICAgdGhpcy5tYXRyaXgubXVsdGlwbHlNYXRyaXgoIG1hdHJpeCApO1xyXG5cclxuICAgIC8vIHNldCBmbGFncyBhbmQgbm90aWZ5XHJcbiAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExpa2UgcHJlcGVuZCgpLCBidXQgcHJlcGVuZHMgdGhlIG90aGVyIHRyYW5zZm9ybSdzIG1hdHJpeC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyYW5zZm9ybTR9IHRyYW5zZm9ybVxyXG4gICAqL1xyXG4gIHByZXBlbmRUcmFuc2Zvcm0oIHRyYW5zZm9ybSApIHtcclxuICAgIHRoaXMucHJlcGVuZCggdHJhbnNmb3JtLm1hdHJpeCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTGlrZSBhcHBlbmQoKSwgYnV0IGFwcGVuZHMgdGhlIG90aGVyIHRyYW5zZm9ybSdzIG1hdHJpeC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyYW5zZm9ybTR9IHRyYW5zZm9ybVxyXG4gICAqL1xyXG4gIGFwcGVuZFRyYW5zZm9ybSggdHJhbnNmb3JtICkge1xyXG4gICAgdGhpcy5hcHBlbmQoIHRyYW5zZm9ybS5tYXRyaXggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHRyYW5zZm9ybSBvZiBhIENhbnZhcyBjb250ZXh0IHRvIGJlIGVxdWl2YWxlbnQgdG8gdGhlIDJEIGFmZmluZSBwYXJ0IG9mIHRoaXMgdHJhbnNmb3JtLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0XHJcbiAgICovXHJcbiAgYXBwbHlUb0NhbnZhc0NvbnRleHQoIGNvbnRleHQgKSB7XHJcbiAgICBjb250ZXh0LnNldFRyYW5zZm9ybSggdGhpcy5tYXRyaXgubTAwKCksIHRoaXMubWF0cml4Lm0xMCgpLCB0aGlzLm1hdHJpeC5tMDEoKSwgdGhpcy5tYXRyaXgubTExKCksIHRoaXMubWF0cml4Lm0wMygpLCB0aGlzLm1hdHJpeC5tMTMoKSApO1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogZ2V0dGVyc1xyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyB0cmFuc2Zvcm0uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1RyYW5zZm9ybTR9XHJcbiAgICovXHJcbiAgY29weSgpIHtcclxuICAgIGNvbnN0IHRyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm00KCB0aGlzLm1hdHJpeCApO1xyXG5cclxuICAgIHRyYW5zZm9ybS5pbnZlcnNlID0gdGhpcy5pbnZlcnNlO1xyXG4gICAgdHJhbnNmb3JtLm1hdHJpeFRyYW5zcG9zZWQgPSB0aGlzLm1hdHJpeFRyYW5zcG9zZWQ7XHJcbiAgICB0cmFuc2Zvcm0uaW52ZXJzZVRyYW5zcG9zZWQgPSB0aGlzLmludmVyc2VUcmFuc3Bvc2VkO1xyXG5cclxuICAgIHRyYW5zZm9ybS5pbnZlcnNlVmFsaWQgPSB0aGlzLmludmVyc2VWYWxpZDtcclxuICAgIHRyYW5zZm9ybS50cmFuc3Bvc2VWYWxpZCA9IHRoaXMudHJhbnNwb3NlVmFsaWQ7XHJcbiAgICB0cmFuc2Zvcm0uaW52ZXJzZVRyYW5zcG9zZVZhbGlkID0gdGhpcy5pbnZlcnNlVHJhbnNwb3NlVmFsaWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBwcmltYXJ5IG1hdHJpeCBvZiB0aGlzIHRyYW5zZm9ybS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7TWF0cml4NH1cclxuICAgKi9cclxuICBnZXRNYXRyaXgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXRyaXg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBwcmltYXJ5IG1hdHJpeCBvZiB0aGlzIHRyYW5zZm9ybS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7TWF0cml4NH1cclxuICAgKi9cclxuICBnZXRJbnZlcnNlKCkge1xyXG4gICAgaWYgKCAhdGhpcy5pbnZlcnNlVmFsaWQgKSB7XHJcbiAgICAgIHRoaXMuaW52ZXJzZVZhbGlkID0gdHJ1ZTtcclxuXHJcbiAgICAgIHRoaXMuaW52ZXJzZS5zZXQoIHRoaXMubWF0cml4ICk7XHJcbiAgICAgIHRoaXMuaW52ZXJzZS5pbnZlcnQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmludmVyc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB0cmFuc3Bvc2Ugb2YgdGhlIHByaW1hcnkgbWF0cml4IG9mIHRoaXMgdHJhbnNmb3JtLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXg0fVxyXG4gICAqL1xyXG4gIGdldE1hdHJpeFRyYW5zcG9zZWQoKSB7XHJcbiAgICBpZiAoICF0aGlzLnRyYW5zcG9zZVZhbGlkICkge1xyXG4gICAgICB0aGlzLnRyYW5zcG9zZVZhbGlkID0gdHJ1ZTtcclxuXHJcbiAgICAgIHRoaXMubWF0cml4VHJhbnNwb3NlZC5zZXQoIHRoaXMubWF0cml4ICk7XHJcbiAgICAgIHRoaXMubWF0cml4VHJhbnNwb3NlZC50cmFuc3Bvc2UoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLm1hdHJpeFRyYW5zcG9zZWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSB0cmFuc3Bvc2Ugb2YgbWF0cml4IG9mIHRoaXMgdHJhbnNmb3JtLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXg0fVxyXG4gICAqL1xyXG4gIGdldEludmVyc2VUcmFuc3Bvc2VkKCkge1xyXG4gICAgaWYgKCAhdGhpcy5pbnZlcnNlVHJhbnNwb3NlVmFsaWQgKSB7XHJcbiAgICAgIHRoaXMuaW52ZXJzZVRyYW5zcG9zZVZhbGlkID0gdHJ1ZTtcclxuXHJcbiAgICAgIHRoaXMuaW52ZXJzZVRyYW5zcG9zZWQuc2V0KCB0aGlzLmdldEludmVyc2UoKSApOyAvLyB0cmlnZ2VycyBpbnZlcnNlIHRvIGJlIHZhbGlkXHJcbiAgICAgIHRoaXMuaW52ZXJzZVRyYW5zcG9zZWQudHJhbnNwb3NlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5pbnZlcnNlVHJhbnNwb3NlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBvdXIgcHJpbWFyeSBtYXRyaXggaXMga25vd24gdG8gYmUgYW4gaWRlbnRpdHkgbWF0cml4LiBJZiBmYWxzZSBpcyByZXR1cm5lZCwgaXQgZG9lc24ndCBuZWNlc3NhcmlseVxyXG4gICAqIG1lYW4gb3VyIG1hdHJpeCBpc24ndCBhbiBpZGVudGl0eSBtYXRyaXgsIGp1c3QgdGhhdCBpdCBpcyB1bmxpa2VseSBpbiBub3JtYWwgdXNhZ2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNJZGVudGl0eSgpIHtcclxuICAgIHJldHVybiB0aGlzLm1hdHJpeC50eXBlID09PSBNYXRyaXg0LlR5cGVzLklERU5USVRZO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIGFueSBjb21wb25lbnRzIG9mIG91ciBwcmltYXJ5IG1hdHJpeCBhcmUgZWl0aGVyIGluZmluaXRlIG9yIE5hTi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc0Zpbml0ZSgpIHtcclxuICAgIHJldHVybiB0aGlzLm1hdHJpeC5pc0Zpbml0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogZm9yd2FyZCB0cmFuc2Zvcm1zIChmb3IgVmVjdG9yMyBvciBzY2FsYXIpXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIGEgMy1kaW1lbnNpb25hbCB2ZWN0b3IgbGlrZSBpdCBpcyBhIHBvaW50IHdpdGggYSBwb3NpdGlvbiAodHJhbnNsYXRpb24gaXMgYXBwbGllZCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogRm9yIGFuIGFmZmluZSBtYXRyaXggJE0kLCB0aGUgcmVzdWx0IGlzIHRoZSBob21vZ2VuZW91cyBtdWx0aXBsaWNhdGlvbiAkTVxcYmVnaW57Ym1hdHJpeH0geCBcXFxcIHkgXFxcXCB6IFxcXFwgMSBcXGVuZHtibWF0cml4fSQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IHZcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yM31cclxuICAgKi9cclxuICB0cmFuc2Zvcm1Qb3NpdGlvbjMoIHYgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXRyaXgudGltZXNWZWN0b3IzKCB2ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIGEgMy1kaW1lbnNpb25hbCB2ZWN0b3IgbGlrZSBwb3NpdGlvbiBpcyBpcnJlbGV2YW50ICh0cmFuc2xhdGlvbiBpcyBub3QgYXBwbGllZCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2XHJcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XHJcbiAgICovXHJcbiAgdHJhbnNmb3JtRGVsdGEzKCB2ICkge1xyXG4gICAgcmV0dXJuIHRoaXMubWF0cml4LnRpbWVzUmVsYXRpdmVWZWN0b3IzKCB2ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIGEgMy1kaW1lbnNpb25hbCB2ZWN0b3IgbGlrZSBpdCBpcyBhIG5vcm1hbCB0byBhIHN1cmZhY2UgKHNvIHRoYXQgdGhlIHN1cmZhY2UgaXMgdHJhbnNmb3JtZWQsIGFuZCB0aGUgbmV3XHJcbiAgICogbm9ybWFsIHRvIHRoZSBzdXJmYWNlIGF0IHRoZSB0cmFuc2Zvcm1lZCBwb2ludCBpcyByZXR1cm5lZCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2XHJcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XHJcbiAgICovXHJcbiAgdHJhbnNmb3JtTm9ybWFsMyggdiApIHtcclxuICAgIHJldHVybiB0aGlzLmdldEludmVyc2UoKS50aW1lc1RyYW5zcG9zZVZlY3RvcjMoIHYgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHgtY29vcmRpbmF0ZSBkaWZmZXJlbmNlIGZvciB0d28gdHJhbnNmb3JtZWQgdmVjdG9ycywgd2hpY2ggYWRkIHRoZSB4LWNvb3JkaW5hdGUgZGlmZmVyZW5jZSBvZiB0aGUgaW5wdXRcclxuICAgKiB4IChhbmQgc2FtZSB5LHogdmFsdWVzKSBiZWZvcmVoYW5kLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICB0cmFuc2Zvcm1EZWx0YVgoIHggKSB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1EZWx0YTMoIG5ldyBWZWN0b3IzKCB4LCAwLCAwICkgKS54O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgeS1jb29yZGluYXRlIGRpZmZlcmVuY2UgZm9yIHR3byB0cmFuc2Zvcm1lZCB2ZWN0b3JzLCB3aGljaCBhZGQgdGhlIHktY29vcmRpbmF0ZSBkaWZmZXJlbmNlIG9mIHRoZSBpbnB1dFxyXG4gICAqIHkgKGFuZCBzYW1lIHgseiB2YWx1ZXMpIGJlZm9yZWhhbmQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIHRyYW5zZm9ybURlbHRhWSggeSApIHtcclxuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybURlbHRhMyggbmV3IFZlY3RvcjMoIDAsIHksIDAgKSApLnk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB6LWNvb3JkaW5hdGUgZGlmZmVyZW5jZSBmb3IgdHdvIHRyYW5zZm9ybWVkIHZlY3RvcnMsIHdoaWNoIGFkZCB0aGUgei1jb29yZGluYXRlIGRpZmZlcmVuY2Ugb2YgdGhlIGlucHV0XHJcbiAgICogeiAoYW5kIHNhbWUgeCx5IHZhbHVlcykgYmVmb3JlaGFuZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gelxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgdHJhbnNmb3JtRGVsdGFaKCB6ICkge1xyXG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtRGVsdGEzKCBuZXcgVmVjdG9yMyggMCwgMCwgeiApICkuejtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSB0cmFuc2Zvcm1lZCByYXkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtSYXkzfSByYXlcclxuICAgKiBAcmV0dXJucyB7UmF5M31cclxuICAgKi9cclxuICB0cmFuc2Zvcm1SYXkoIHJheSApIHtcclxuICAgIHJldHVybiBuZXcgUmF5MyhcclxuICAgICAgdGhpcy50cmFuc2Zvcm1Qb3NpdGlvbjMoIHJheS5wb3NpdGlvbiApLFxyXG4gICAgICB0aGlzLnRyYW5zZm9ybVBvc2l0aW9uMyggcmF5LnBvc2l0aW9uLnBsdXMoIHJheS5kaXJlY3Rpb24gKSApLm1pbnVzKCB0aGlzLnRyYW5zZm9ybVBvc2l0aW9uMyggcmF5LnBvc2l0aW9uICkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogaW52ZXJzZSB0cmFuc2Zvcm1zIChmb3IgVmVjdG9yMyBvciBzY2FsYXIpXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIGEgMy1kaW1lbnNpb25hbCB2ZWN0b3IgYnkgdGhlIGludmVyc2Ugb2Ygb3VyIHRyYW5zZm9ybSBsaWtlIGl0IGlzIGEgcG9pbnQgd2l0aCBhIHBvc2l0aW9uICh0cmFuc2xhdGlvbiBpcyBhcHBsaWVkKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBGb3IgYW4gYWZmaW5lIG1hdHJpeCAkTSQsIHRoZSByZXN1bHQgaXMgdGhlIGhvbW9nZW5lb3VzIG11bHRpcGxpY2F0aW9uICRNXnstMX1cXGJlZ2lue2JtYXRyaXh9IHggXFxcXCB5IFxcXFwgeiBcXFxcIDEgXFxlbmR7Ym1hdHJpeH0kLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1Qb3NpdGlvbjMoKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gdlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxyXG4gICAqL1xyXG4gIGludmVyc2VQb3NpdGlvbjMoIHYgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRJbnZlcnNlKCkudGltZXNWZWN0b3IzKCB2ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIGEgMy1kaW1lbnNpb25hbCB2ZWN0b3IgYnkgdGhlIGludmVyc2Ugb2Ygb3VyIHRyYW5zZm9ybSBsaWtlIHBvc2l0aW9uIGlzIGlycmVsZXZhbnQgKHRyYW5zbGF0aW9uIGlzIG5vdCBhcHBsaWVkKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbnZlcnNlIG9mIHRyYW5zZm9ybURlbHRhMygpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2XHJcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XHJcbiAgICovXHJcbiAgaW52ZXJzZURlbHRhMyggdiApIHtcclxuICAgIC8vIGludmVyc2UgYWN0dWFsbHkgaGFzIHRoZSB0cmFuc2xhdGlvbiByb2xsZWQgaW50byB0aGUgb3RoZXIgY29lZmZpY2llbnRzLCBzbyB3ZSBoYXZlIHRvIG1ha2UgdGhpcyBsb25nZXJcclxuICAgIHJldHVybiB0aGlzLmludmVyc2VQb3NpdGlvbjMoIHYgKS5taW51cyggdGhpcy5pbnZlcnNlUG9zaXRpb24zKCBWZWN0b3IzLlpFUk8gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNmb3JtcyBhIDMtZGltZW5zaW9uYWwgdmVjdG9yIGJ5IHRoZSBpbnZlcnNlIG9mIG91ciB0cmFuc2Zvcm0gbGlrZSBpdCBpcyBhIG5vcm1hbCB0byBhIGN1cnZlIChzbyB0aGF0IHRoZVxyXG4gICAqIGN1cnZlIGlzIHRyYW5zZm9ybWVkLCBhbmQgdGhlIG5ldyBub3JtYWwgdG8gdGhlIGN1cnZlIGF0IHRoZSB0cmFuc2Zvcm1lZCBwb2ludCBpcyByZXR1cm5lZCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1Ob3JtYWwzKCkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IHZcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yM31cclxuICAgKi9cclxuICBpbnZlcnNlTm9ybWFsMyggdiApIHtcclxuICAgIHJldHVybiB0aGlzLm1hdHJpeC50aW1lc1RyYW5zcG9zZVZlY3RvcjMoIHYgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHgtY29vcmRpbmF0ZSBkaWZmZXJlbmNlIGZvciB0d28gaW52ZXJzZS10cmFuc2Zvcm1lZCB2ZWN0b3JzLCB3aGljaCBhZGQgdGhlIHgtY29vcmRpbmF0ZSBkaWZmZXJlbmNlIG9mIHRoZSBpbnB1dFxyXG4gICAqIHggKGFuZCBzYW1lIHkseiB2YWx1ZXMpIGJlZm9yZWhhbmQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1EZWx0YVgoKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBpbnZlcnNlRGVsdGFYKCB4ICkge1xyXG4gICAgcmV0dXJuIHRoaXMuaW52ZXJzZURlbHRhMyggbmV3IFZlY3RvcjMoIHgsIDAsIDAgKSApLng7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB5LWNvb3JkaW5hdGUgZGlmZmVyZW5jZSBmb3IgdHdvIGludmVyc2UtdHJhbnNmb3JtZWQgdmVjdG9ycywgd2hpY2ggYWRkIHRoZSB5LWNvb3JkaW5hdGUgZGlmZmVyZW5jZSBvZiB0aGUgaW5wdXRcclxuICAgKiB5IChhbmQgc2FtZSB4LHogdmFsdWVzKSBiZWZvcmVoYW5kLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGludmVyc2Ugb2YgdHJhbnNmb3JtRGVsdGFZKCkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgaW52ZXJzZURlbHRhWSggeSApIHtcclxuICAgIHJldHVybiB0aGlzLmludmVyc2VEZWx0YTMoIG5ldyBWZWN0b3IzKCAwLCB5LCAwICkgKS55O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgei1jb29yZGluYXRlIGRpZmZlcmVuY2UgZm9yIHR3byBpbnZlcnNlLXRyYW5zZm9ybWVkIHZlY3RvcnMsIHdoaWNoIGFkZCB0aGUgei1jb29yZGluYXRlIGRpZmZlcmVuY2Ugb2YgdGhlIGlucHV0XHJcbiAgICogeiAoYW5kIHNhbWUgeCx5IHZhbHVlcykgYmVmb3JlaGFuZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbnZlcnNlIG9mIHRyYW5zZm9ybURlbHRhWigpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGludmVyc2VEZWx0YVooIHogKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pbnZlcnNlRGVsdGEzKCBuZXcgVmVjdG9yMyggMCwgMCwgeiApICkuejtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gaW52ZXJzZS10cmFuc2Zvcm1lZCByYXkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1SYXkoKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtSYXkzfSByYXlcclxuICAgKiBAcmV0dXJucyB7UmF5M31cclxuICAgKi9cclxuICBpbnZlcnNlUmF5KCByYXkgKSB7XHJcbiAgICByZXR1cm4gbmV3IFJheTMoXHJcbiAgICAgIHRoaXMuaW52ZXJzZVBvc2l0aW9uMyggcmF5LnBvc2l0aW9uICksXHJcbiAgICAgIHRoaXMuaW52ZXJzZVBvc2l0aW9uMyggcmF5LnBvc2l0aW9uLnBsdXMoIHJheS5kaXJlY3Rpb24gKSApLm1pbnVzKCB0aGlzLmludmVyc2VQb3NpdGlvbjMoIHJheS5wb3NpdGlvbiApIClcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5kb3QucmVnaXN0ZXIoICdUcmFuc2Zvcm00JywgVHJhbnNmb3JtNCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVHJhbnNmb3JtNDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSw4QkFBOEI7QUFDdEQsT0FBT0MsR0FBRyxNQUFNLFVBQVU7QUFDMUIsT0FBT0MsT0FBTyxNQUFNLGNBQWM7QUFDbEMsT0FBT0MsSUFBSSxNQUFNLFdBQVc7QUFDNUIsT0FBT0MsT0FBTyxNQUFNLGNBQWM7QUFFbEMsTUFBTUMsYUFBYSxHQUFHLElBQUlILE9BQU8sQ0FBQyxDQUFDOztBQUVuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTSSxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7RUFDN0IsT0FBU0EsTUFBTSxZQUFZTCxPQUFPLElBQU1LLE1BQU0sQ0FBQ0MsUUFBUSxDQUFDLENBQUM7QUFDM0Q7QUFFQSxNQUFNQyxVQUFVLENBQUM7RUFDZjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUgsTUFBTSxFQUFHO0lBRXBCO0lBQ0EsSUFBSSxDQUFDQSxNQUFNLEdBQUdMLE9BQU8sQ0FBQ1MsUUFBUSxDQUFD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