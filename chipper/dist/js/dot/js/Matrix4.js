// Copyright 2013-2022, University of Colorado Boulder

/**
 * 4-dimensional Matrix
 *
 * TODO: consider adding affine flag if it will help performance (a la Matrix3)
 * TODO: get rotation angles
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

/* eslint-disable bad-sim-text */

import EnumerationDeprecated from '../../phet-core/js/EnumerationDeprecated.js';
import dot from './dot.js';
import Vector3 from './Vector3.js';
import Vector4 from './Vector4.js';
const Float32Array = window.Float32Array || Array;
class Matrix4 {
  /**
   * @param {number} [v00]
   * @param {number} [v01]
   * @param {number} [v02]
   * @param {number} [v03]
   * @param {number} [v10]
   * @param {number} [v11]
   * @param {number} [v12]
   * @param {number} [v13]
   * @param {number} [v20]
   * @param {number} [v21]
   * @param {number} [v22]
   * @param {number} [v23]
   * @param {number} [v30]
   * @param {number} [v31]
   * @param {number} [v32]
   * @param {number} [v33]
   * @param {Matrix4.Types|undefined} [type]
   */
  constructor(v00, v01, v02, v03, v10, v11, v12, v13, v20, v21, v22, v23, v30, v31, v32, v33, type) {
    // @public {Float32Array} - entries stored in column-major format
    this.entries = new Float32Array(16);

    // @public {Matrix4.Types}
    this.type = Types.OTHER; // will be set by rowMajor

    this.rowMajor(v00 !== undefined ? v00 : 1, v01 !== undefined ? v01 : 0, v02 !== undefined ? v02 : 0, v03 !== undefined ? v03 : 0, v10 !== undefined ? v10 : 0, v11 !== undefined ? v11 : 1, v12 !== undefined ? v12 : 0, v13 !== undefined ? v13 : 0, v20 !== undefined ? v20 : 0, v21 !== undefined ? v21 : 0, v22 !== undefined ? v22 : 1, v23 !== undefined ? v23 : 0, v30 !== undefined ? v30 : 0, v31 !== undefined ? v31 : 0, v32 !== undefined ? v32 : 0, v33 !== undefined ? v33 : 1, type);
  }

  /**
   * Sets all entries of the matrix in row-major order.
   * @public
   *
   * @param {number} v00
   * @param {number} v01
   * @param {number} v02
   * @param {number} v03
   * @param {number} v10
   * @param {number} v11
   * @param {number} v12
   * @param {number} v13
   * @param {number} v20
   * @param {number} v21
   * @param {number} v22
   * @param {number} v23
   * @param {number} v30
   * @param {number} v31
   * @param {number} v32
   * @param {number} v33
   * @param {Matrix4.Types|undefined} [type]
   * @returns {Matrix4} - Self reference
   */
  rowMajor(v00, v01, v02, v03, v10, v11, v12, v13, v20, v21, v22, v23, v30, v31, v32, v33, type) {
    this.entries[0] = v00;
    this.entries[1] = v10;
    this.entries[2] = v20;
    this.entries[3] = v30;
    this.entries[4] = v01;
    this.entries[5] = v11;
    this.entries[6] = v21;
    this.entries[7] = v31;
    this.entries[8] = v02;
    this.entries[9] = v12;
    this.entries[10] = v22;
    this.entries[11] = v32;
    this.entries[12] = v03;
    this.entries[13] = v13;
    this.entries[14] = v23;
    this.entries[15] = v33;

    // TODO: consider performance of the affine check here
    this.type = type === undefined ? v30 === 0 && v31 === 0 && v32 === 0 && v33 === 1 ? Types.AFFINE : Types.OTHER : type;
    return this;
  }

  /**
   * Sets all entries of the matrix in column-major order.
   * @public
   *
   * @param {*} v00
   * @param {*} v10
   * @param {*} v20
   * @param {*} v30
   * @param {*} v01
   * @param {*} v11
   * @param {*} v21
   * @param {*} v31
   * @param {*} v02
   * @param {*} v12
   * @param {*} v22
   * @param {*} v32
   * @param {*} v03
   * @param {*} v13
   * @param {*} v23
   * @param {*} v33
   * @param {Matrix4.Types|undefined} [type]
   * @returns {Matrix4} - Self reference
   */
  columnMajor(v00, v10, v20, v30, v01, v11, v21, v31, v02, v12, v22, v32, v03, v13, v23, v33, type) {
    return this.rowMajor(v00, v01, v02, v03, v10, v11, v12, v13, v20, v21, v22, v23, v30, v31, v32, v33, type);
  }

  /**
   * Sets this matrix to the value of the passed-in matrix.
   * @public
   *
   * @param {Matrix4} matrix
   * @returns {Matrix4} - Self reference
   */
  set(matrix) {
    return this.rowMajor(matrix.m00(), matrix.m01(), matrix.m02(), matrix.m03(), matrix.m10(), matrix.m11(), matrix.m12(), matrix.m13(), matrix.m20(), matrix.m21(), matrix.m22(), matrix.m23(), matrix.m30(), matrix.m31(), matrix.m32(), matrix.m33(), matrix.type);
  }

  /**
   * Returns the 0,0 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m00() {
    return this.entries[0];
  }

  /**
   * Returns the 0,1 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m01() {
    return this.entries[4];
  }

  /**
   * Returns the 0,2 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m02() {
    return this.entries[8];
  }

  /**
   * Returns the 0,3 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m03() {
    return this.entries[12];
  }

  /**
   * Returns the 1,0 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m10() {
    return this.entries[1];
  }

  /**
   * Returns the 1,1 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m11() {
    return this.entries[5];
  }

  /**
   * Returns the 1,2 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m12() {
    return this.entries[9];
  }

  /**
   * Returns the 1,3 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m13() {
    return this.entries[13];
  }

  /**
   * Returns the 2,0 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m20() {
    return this.entries[2];
  }

  /**
   * Returns the 2,1 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m21() {
    return this.entries[6];
  }

  /**
   * Returns the 2,2 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m22() {
    return this.entries[10];
  }

  /**
   * Returns the 2,3 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m23() {
    return this.entries[14];
  }

  /**
   * Returns the 3,0 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m30() {
    return this.entries[3];
  }

  /**
   * Returns the 3,1 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m31() {
    return this.entries[7];
  }

  /**
   * Returns the 3,2 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m32() {
    return this.entries[11];
  }

  /**
   * Returns the 3,3 entry of this matrix.
   * @public
   *
   * @returns {number}
   */
  m33() {
    return this.entries[15];
  }

  /**
   * Returns whether all of this matrix's entries are finite (non-infinite and non-NaN).
   * @public
   *
   * @returns {boolean}
   */
  isFinite() {
    return isFinite(this.m00()) && isFinite(this.m01()) && isFinite(this.m02()) && isFinite(this.m03()) && isFinite(this.m10()) && isFinite(this.m11()) && isFinite(this.m12()) && isFinite(this.m13()) && isFinite(this.m20()) && isFinite(this.m21()) && isFinite(this.m22()) && isFinite(this.m23()) && isFinite(this.m30()) && isFinite(this.m31()) && isFinite(this.m32()) && isFinite(this.m33());
  }

  /**
   * Returns the 3D translation, assuming multiplication with a homogeneous vector.
   * @public
   *
   * @returns {Vector3}
   */
  getTranslation() {
    return new Vector3(this.m03(), this.m13(), this.m23());
  }
  get translation() {
    return this.getTranslation();
  }

  /**
   * Returns a vector that is equivalent to ( T(1,0,0).magnitude, T(0,1,0).magnitude, T(0,0,1).magnitude )
   * where T is a relative transform.
   * @public
   *
   * @returns {Vector3}
   */
  getScaleVector() {
    const m0003 = this.m00() + this.m03();
    const m1013 = this.m10() + this.m13();
    const m2023 = this.m20() + this.m23();
    const m3033 = this.m30() + this.m33();
    const m0103 = this.m01() + this.m03();
    const m1113 = this.m11() + this.m13();
    const m2123 = this.m21() + this.m23();
    const m3133 = this.m31() + this.m33();
    const m0203 = this.m02() + this.m03();
    const m1213 = this.m12() + this.m13();
    const m2223 = this.m22() + this.m23();
    const m3233 = this.m32() + this.m33();
    return new Vector3(Math.sqrt(m0003 * m0003 + m1013 * m1013 + m2023 * m2023 + m3033 * m3033), Math.sqrt(m0103 * m0103 + m1113 * m1113 + m2123 * m2123 + m3133 * m3133), Math.sqrt(m0203 * m0203 + m1213 * m1213 + m2223 * m2223 + m3233 * m3233));
  }
  get scaleVector() {
    return this.getScaleVector();
  }

  /**
   * Returns the CSS transform string for the associated homogeneous 3d transformation.
   * @public
   *
   * @returns {string}
   */
  getCSSTransform() {
    // See http://www.w3.org/TR/css3-transforms/, particularly Section 13 that discusses the SVG compatibility

    // the inner part of a CSS3 transform, but remember to add the browser-specific parts!
    // NOTE: the toFixed calls are inlined for performance reasons
    return `matrix3d(${this.entries[0].toFixed(20)},${this.entries[1].toFixed(20)},${this.entries[2].toFixed(20)},${this.entries[3].toFixed(20)},${this.entries[4].toFixed(20)},${this.entries[5].toFixed(20)},${this.entries[6].toFixed(20)},${this.entries[7].toFixed(20)},${this.entries[8].toFixed(20)},${this.entries[9].toFixed(20)},${this.entries[10].toFixed(20)},${this.entries[11].toFixed(20)},${this.entries[12].toFixed(20)},${this.entries[13].toFixed(20)},${this.entries[14].toFixed(20)},${this.entries[15].toFixed(20)})`;
  }
  get cssTransform() {
    return this.getCSSTransform();
  }

  /**
   * Returns exact equality with another matrix
   * @public
   *
   * @param {Matrix4} matrix
   * @returns {boolean}
   */
  equals(matrix) {
    return this.m00() === matrix.m00() && this.m01() === matrix.m01() && this.m02() === matrix.m02() && this.m03() === matrix.m03() && this.m10() === matrix.m10() && this.m11() === matrix.m11() && this.m12() === matrix.m12() && this.m13() === matrix.m13() && this.m20() === matrix.m20() && this.m21() === matrix.m21() && this.m22() === matrix.m22() && this.m23() === matrix.m23() && this.m30() === matrix.m30() && this.m31() === matrix.m31() && this.m32() === matrix.m32() && this.m33() === matrix.m33();
  }

  /**
   * Returns equality within a margin of error with another matrix
   * @public
   *
   * @param {Matrix4} matrix
   * @param {number} epsilon
   * @returns {boolean}
   */
  equalsEpsilon(matrix, epsilon) {
    return Math.abs(this.m00() - matrix.m00()) < epsilon && Math.abs(this.m01() - matrix.m01()) < epsilon && Math.abs(this.m02() - matrix.m02()) < epsilon && Math.abs(this.m03() - matrix.m03()) < epsilon && Math.abs(this.m10() - matrix.m10()) < epsilon && Math.abs(this.m11() - matrix.m11()) < epsilon && Math.abs(this.m12() - matrix.m12()) < epsilon && Math.abs(this.m13() - matrix.m13()) < epsilon && Math.abs(this.m20() - matrix.m20()) < epsilon && Math.abs(this.m21() - matrix.m21()) < epsilon && Math.abs(this.m22() - matrix.m22()) < epsilon && Math.abs(this.m23() - matrix.m23()) < epsilon && Math.abs(this.m30() - matrix.m30()) < epsilon && Math.abs(this.m31() - matrix.m31()) < epsilon && Math.abs(this.m32() - matrix.m32()) < epsilon && Math.abs(this.m33() - matrix.m33()) < epsilon;
  }

  /*---------------------------------------------------------------------------*
   * Immutable operations (returning a new matrix)
   *----------------------------------------------------------------------------*/

  /**
   * Returns a copy of this matrix
   * @public
   *
   * @returns {Matrix4}
   */
  copy() {
    return new Matrix4(this.m00(), this.m01(), this.m02(), this.m03(), this.m10(), this.m11(), this.m12(), this.m13(), this.m20(), this.m21(), this.m22(), this.m23(), this.m30(), this.m31(), this.m32(), this.m33(), this.type);
  }

  /**
   * Returns a new matrix, defined by this matrix plus the provided matrix
   * @public
   *
   * @param {Matrix4} matrix
   * @returns {Matrix4}
   */
  plus(matrix) {
    return new Matrix4(this.m00() + matrix.m00(), this.m01() + matrix.m01(), this.m02() + matrix.m02(), this.m03() + matrix.m03(), this.m10() + matrix.m10(), this.m11() + matrix.m11(), this.m12() + matrix.m12(), this.m13() + matrix.m13(), this.m20() + matrix.m20(), this.m21() + matrix.m21(), this.m22() + matrix.m22(), this.m23() + matrix.m23(), this.m30() + matrix.m30(), this.m31() + matrix.m31(), this.m32() + matrix.m32(), this.m33() + matrix.m33());
  }

  /**
   * Returns a new matrix, defined by this matrix plus the provided matrix
   * @public
   *
   * @param {Matrix4} matrix
   * @returns {Matrix4}
   */
  minus(matrix) {
    return new Matrix4(this.m00() - matrix.m00(), this.m01() - matrix.m01(), this.m02() - matrix.m02(), this.m03() - matrix.m03(), this.m10() - matrix.m10(), this.m11() - matrix.m11(), this.m12() - matrix.m12(), this.m13() - matrix.m13(), this.m20() - matrix.m20(), this.m21() - matrix.m21(), this.m22() - matrix.m22(), this.m23() - matrix.m23(), this.m30() - matrix.m30(), this.m31() - matrix.m31(), this.m32() - matrix.m32(), this.m33() - matrix.m33());
  }

  /**
   * Returns a transposed copy of this matrix
   * @public
   *
   * @returns {Matrix4}
   */
  transposed() {
    return new Matrix4(this.m00(), this.m10(), this.m20(), this.m30(), this.m01(), this.m11(), this.m21(), this.m31(), this.m02(), this.m12(), this.m22(), this.m32(), this.m03(), this.m13(), this.m23(), this.m33());
  }

  /**
   * Returns a negated copy of this matrix
   * @public
   *
   * @returns {Matrix3}
   */
  negated() {
    return new Matrix4(-this.m00(), -this.m01(), -this.m02(), -this.m03(), -this.m10(), -this.m11(), -this.m12(), -this.m13(), -this.m20(), -this.m21(), -this.m22(), -this.m23(), -this.m30(), -this.m31(), -this.m32(), -this.m33());
  }

  /**
   * Returns an inverted copy of this matrix
   * @public
   *
   * @returns {Matrix3}
   */
  inverted() {
    let det;
    switch (this.type) {
      case Types.IDENTITY:
        return this;
      case Types.TRANSLATION_3D:
        return new Matrix4(1, 0, 0, -this.m03(), 0, 1, 0, -this.m13(), 0, 0, 1, -this.m23(), 0, 0, 0, 1, Types.TRANSLATION_3D);
      case Types.SCALING:
        return new Matrix4(1 / this.m00(), 0, 0, 0, 0, 1 / this.m11(), 0, 0, 0, 0, 1 / this.m22(), 0, 0, 0, 0, 1 / this.m33(), Types.SCALING);
      case Types.AFFINE:
      case Types.OTHER:
        det = this.getDeterminant();
        if (det !== 0) {
          return new Matrix4((-this.m31() * this.m22() * this.m13() + this.m21() * this.m32() * this.m13() + this.m31() * this.m12() * this.m23() - this.m11() * this.m32() * this.m23() - this.m21() * this.m12() * this.m33() + this.m11() * this.m22() * this.m33()) / det, (this.m31() * this.m22() * this.m03() - this.m21() * this.m32() * this.m03() - this.m31() * this.m02() * this.m23() + this.m01() * this.m32() * this.m23() + this.m21() * this.m02() * this.m33() - this.m01() * this.m22() * this.m33()) / det, (-this.m31() * this.m12() * this.m03() + this.m11() * this.m32() * this.m03() + this.m31() * this.m02() * this.m13() - this.m01() * this.m32() * this.m13() - this.m11() * this.m02() * this.m33() + this.m01() * this.m12() * this.m33()) / det, (this.m21() * this.m12() * this.m03() - this.m11() * this.m22() * this.m03() - this.m21() * this.m02() * this.m13() + this.m01() * this.m22() * this.m13() + this.m11() * this.m02() * this.m23() - this.m01() * this.m12() * this.m23()) / det, (this.m30() * this.m22() * this.m13() - this.m20() * this.m32() * this.m13() - this.m30() * this.m12() * this.m23() + this.m10() * this.m32() * this.m23() + this.m20() * this.m12() * this.m33() - this.m10() * this.m22() * this.m33()) / det, (-this.m30() * this.m22() * this.m03() + this.m20() * this.m32() * this.m03() + this.m30() * this.m02() * this.m23() - this.m00() * this.m32() * this.m23() - this.m20() * this.m02() * this.m33() + this.m00() * this.m22() * this.m33()) / det, (this.m30() * this.m12() * this.m03() - this.m10() * this.m32() * this.m03() - this.m30() * this.m02() * this.m13() + this.m00() * this.m32() * this.m13() + this.m10() * this.m02() * this.m33() - this.m00() * this.m12() * this.m33()) / det, (-this.m20() * this.m12() * this.m03() + this.m10() * this.m22() * this.m03() + this.m20() * this.m02() * this.m13() - this.m00() * this.m22() * this.m13() - this.m10() * this.m02() * this.m23() + this.m00() * this.m12() * this.m23()) / det, (-this.m30() * this.m21() * this.m13() + this.m20() * this.m31() * this.m13() + this.m30() * this.m11() * this.m23() - this.m10() * this.m31() * this.m23() - this.m20() * this.m11() * this.m33() + this.m10() * this.m21() * this.m33()) / det, (this.m30() * this.m21() * this.m03() - this.m20() * this.m31() * this.m03() - this.m30() * this.m01() * this.m23() + this.m00() * this.m31() * this.m23() + this.m20() * this.m01() * this.m33() - this.m00() * this.m21() * this.m33()) / det, (-this.m30() * this.m11() * this.m03() + this.m10() * this.m31() * this.m03() + this.m30() * this.m01() * this.m13() - this.m00() * this.m31() * this.m13() - this.m10() * this.m01() * this.m33() + this.m00() * this.m11() * this.m33()) / det, (this.m20() * this.m11() * this.m03() - this.m10() * this.m21() * this.m03() - this.m20() * this.m01() * this.m13() + this.m00() * this.m21() * this.m13() + this.m10() * this.m01() * this.m23() - this.m00() * this.m11() * this.m23()) / det, (this.m30() * this.m21() * this.m12() - this.m20() * this.m31() * this.m12() - this.m30() * this.m11() * this.m22() + this.m10() * this.m31() * this.m22() + this.m20() * this.m11() * this.m32() - this.m10() * this.m21() * this.m32()) / det, (-this.m30() * this.m21() * this.m02() + this.m20() * this.m31() * this.m02() + this.m30() * this.m01() * this.m22() - this.m00() * this.m31() * this.m22() - this.m20() * this.m01() * this.m32() + this.m00() * this.m21() * this.m32()) / det, (this.m30() * this.m11() * this.m02() - this.m10() * this.m31() * this.m02() - this.m30() * this.m01() * this.m12() + this.m00() * this.m31() * this.m12() + this.m10() * this.m01() * this.m32() - this.m00() * this.m11() * this.m32()) / det, (-this.m20() * this.m11() * this.m02() + this.m10() * this.m21() * this.m02() + this.m20() * this.m01() * this.m12() - this.m00() * this.m21() * this.m12() - this.m10() * this.m01() * this.m22() + this.m00() * this.m11() * this.m22()) / det);
        } else {
          throw new Error('Matrix could not be inverted, determinant === 0');
        }
      default:
        throw new Error(`Matrix4.inverted with unknown type: ${this.type}`);
    }
  }

  /**
   * Returns a matrix, defined by the multiplication of this * matrix.
   * @public
   *
   * @param {Matrix4} matrix
   * @returns {Matrix4} - NOTE: this may be the same matrix!
   */
  timesMatrix(matrix) {
    // I * M === M * I === I (the identity)
    if (this.type === Types.IDENTITY || matrix.type === Types.IDENTITY) {
      return this.type === Types.IDENTITY ? matrix : this;
    }
    if (this.type === matrix.type) {
      // currently two matrices of the same type will result in the same result type
      if (this.type === Types.TRANSLATION_3D) {
        // faster combination of translations
        return new Matrix4(1, 0, 0, this.m03() + matrix.m02(), 0, 1, 0, this.m13() + matrix.m12(), 0, 0, 1, this.m23() + matrix.m23(), 0, 0, 0, 1, Types.TRANSLATION_3D);
      } else if (this.type === Types.SCALING) {
        // faster combination of scaling
        return new Matrix4(this.m00() * matrix.m00(), 0, 0, 0, 0, this.m11() * matrix.m11(), 0, 0, 0, 0, this.m22() * matrix.m22(), 0, 0, 0, 0, 1, Types.SCALING);
      }
    }
    if (this.type !== Types.OTHER && matrix.type !== Types.OTHER) {
      // currently two matrices that are anything but "other" are technically affine, and the result will be affine

      // affine case
      return new Matrix4(this.m00() * matrix.m00() + this.m01() * matrix.m10() + this.m02() * matrix.m20(), this.m00() * matrix.m01() + this.m01() * matrix.m11() + this.m02() * matrix.m21(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02() * matrix.m22(), this.m00() * matrix.m03() + this.m01() * matrix.m13() + this.m02() * matrix.m23() + this.m03(), this.m10() * matrix.m00() + this.m11() * matrix.m10() + this.m12() * matrix.m20(), this.m10() * matrix.m01() + this.m11() * matrix.m11() + this.m12() * matrix.m21(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12() * matrix.m22(), this.m10() * matrix.m03() + this.m11() * matrix.m13() + this.m12() * matrix.m23() + this.m13(), this.m20() * matrix.m00() + this.m21() * matrix.m10() + this.m22() * matrix.m20(), this.m20() * matrix.m01() + this.m21() * matrix.m11() + this.m22() * matrix.m21(), this.m20() * matrix.m02() + this.m21() * matrix.m12() + this.m22() * matrix.m22(), this.m20() * matrix.m03() + this.m21() * matrix.m13() + this.m22() * matrix.m23() + this.m23(), 0, 0, 0, 1, Types.AFFINE);
    }

    // general case
    return new Matrix4(this.m00() * matrix.m00() + this.m01() * matrix.m10() + this.m02() * matrix.m20() + this.m03() * matrix.m30(), this.m00() * matrix.m01() + this.m01() * matrix.m11() + this.m02() * matrix.m21() + this.m03() * matrix.m31(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02() * matrix.m22() + this.m03() * matrix.m32(), this.m00() * matrix.m03() + this.m01() * matrix.m13() + this.m02() * matrix.m23() + this.m03() * matrix.m33(), this.m10() * matrix.m00() + this.m11() * matrix.m10() + this.m12() * matrix.m20() + this.m13() * matrix.m30(), this.m10() * matrix.m01() + this.m11() * matrix.m11() + this.m12() * matrix.m21() + this.m13() * matrix.m31(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12() * matrix.m22() + this.m13() * matrix.m32(), this.m10() * matrix.m03() + this.m11() * matrix.m13() + this.m12() * matrix.m23() + this.m13() * matrix.m33(), this.m20() * matrix.m00() + this.m21() * matrix.m10() + this.m22() * matrix.m20() + this.m23() * matrix.m30(), this.m20() * matrix.m01() + this.m21() * matrix.m11() + this.m22() * matrix.m21() + this.m23() * matrix.m31(), this.m20() * matrix.m02() + this.m21() * matrix.m12() + this.m22() * matrix.m22() + this.m23() * matrix.m32(), this.m20() * matrix.m03() + this.m21() * matrix.m13() + this.m22() * matrix.m23() + this.m23() * matrix.m33(), this.m30() * matrix.m00() + this.m31() * matrix.m10() + this.m32() * matrix.m20() + this.m33() * matrix.m30(), this.m30() * matrix.m01() + this.m31() * matrix.m11() + this.m32() * matrix.m21() + this.m33() * matrix.m31(), this.m30() * matrix.m02() + this.m31() * matrix.m12() + this.m32() * matrix.m22() + this.m33() * matrix.m32(), this.m30() * matrix.m03() + this.m31() * matrix.m13() + this.m32() * matrix.m23() + this.m33() * matrix.m33());
  }

  /**
   * Returns the multiplication of this matrix times the provided vector
   * @public
   *
   * @param {Vector4} vector4
   * @returns {Vector4}
   */
  timesVector4(vector4) {
    const x = this.m00() * vector4.x + this.m01() * vector4.y + this.m02() * vector4.z + this.m03() * vector4.w;
    const y = this.m10() * vector4.x + this.m11() * vector4.y + this.m12() * vector4.z + this.m13() * vector4.w;
    const z = this.m20() * vector4.x + this.m21() * vector4.y + this.m22() * vector4.z + this.m23() * vector4.w;
    const w = this.m30() * vector4.x + this.m31() * vector4.y + this.m32() * vector4.z + this.m33() * vector4.w;
    return new Vector4(x, y, z, w);
  }

  /**
   * Returns the multiplication of this matrix times the provided vector (treating this matrix as homogeneous, so that
   * it is the technical multiplication of (x,y,z,1)).
   * @public
   *
   * @param {Vector3} vector3
   * @returns {Vector3}
   */
  timesVector3(vector3) {
    return this.timesVector4(vector3.toVector4()).toVector3();
  }

  /**
   * Returns the multiplication of this matrix's transpose times the provided vector
   * @public
   *
   * @param {Vector4} vector4
   * @returns {Vector4}
   */
  timesTransposeVector4(vector4) {
    const x = this.m00() * vector4.x + this.m10() * vector4.y + this.m20() * vector4.z + this.m30() * vector4.w;
    const y = this.m01() * vector4.x + this.m11() * vector4.y + this.m21() * vector4.z + this.m31() * vector4.w;
    const z = this.m02() * vector4.x + this.m12() * vector4.y + this.m22() * vector4.z + this.m32() * vector4.w;
    const w = this.m03() * vector4.x + this.m13() * vector4.y + this.m23() * vector4.z + this.m33() * vector4.w;
    return new Vector4(x, y, z, w);
  }

  /**
   * Returns the multiplication of this matrix's transpose times the provided vector (homogeneous).
   * @public
   *
   * @param {Vector3} vector3
   * @returns {Vector3}
   */
  timesTransposeVector3(vector3) {
    return this.timesTransposeVector4(vector3.toVector4()).toVector3();
  }

  /**
   * Equivalent to the multiplication of (x,y,z,0), ignoring the homogeneous part.
   * @public
   *
   * @param {Vector3} vector3
   * @returns {Vector3}
   */
  timesRelativeVector3(vector3) {
    const x = this.m00() * vector3.x + this.m10() * vector3.y + this.m20() * vector3.z;
    const y = this.m01() * vector3.y + this.m11() * vector3.y + this.m21() * vector3.z;
    const z = this.m02() * vector3.z + this.m12() * vector3.y + this.m22() * vector3.z;
    return new Vector3(x, y, z);
  }

  /**
   * Returns the determinant of this matrix.
   * @public
   *
   * @returns {number}
   */
  getDeterminant() {
    return this.m03() * this.m12() * this.m21() * this.m30() - this.m02() * this.m13() * this.m21() * this.m30() - this.m03() * this.m11() * this.m22() * this.m30() + this.m01() * this.m13() * this.m22() * this.m30() + this.m02() * this.m11() * this.m23() * this.m30() - this.m01() * this.m12() * this.m23() * this.m30() - this.m03() * this.m12() * this.m20() * this.m31() + this.m02() * this.m13() * this.m20() * this.m31() + this.m03() * this.m10() * this.m22() * this.m31() - this.m00() * this.m13() * this.m22() * this.m31() - this.m02() * this.m10() * this.m23() * this.m31() + this.m00() * this.m12() * this.m23() * this.m31() + this.m03() * this.m11() * this.m20() * this.m32() - this.m01() * this.m13() * this.m20() * this.m32() - this.m03() * this.m10() * this.m21() * this.m32() + this.m00() * this.m13() * this.m21() * this.m32() + this.m01() * this.m10() * this.m23() * this.m32() - this.m00() * this.m11() * this.m23() * this.m32() - this.m02() * this.m11() * this.m20() * this.m33() + this.m01() * this.m12() * this.m20() * this.m33() + this.m02() * this.m10() * this.m21() * this.m33() - this.m00() * this.m12() * this.m21() * this.m33() - this.m01() * this.m10() * this.m22() * this.m33() + this.m00() * this.m11() * this.m22() * this.m33();
  }
  get determinant() {
    return this.getDeterminant();
  }

  /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `${this.m00()} ${this.m01()} ${this.m02()} ${this.m03()}\n${this.m10()} ${this.m11()} ${this.m12()} ${this.m13()}\n${this.m20()} ${this.m21()} ${this.m22()} ${this.m23()}\n${this.m30()} ${this.m31()} ${this.m32()} ${this.m33()}`;
  }

  /**
   * Makes this matrix effectively immutable to the normal methods (except direct setters?)
   * @public
   *
   * @returns {Matrix3} - Self reference
   */
  makeImmutable() {
    if (assert) {
      this.rowMajor = () => {
        throw new Error('Cannot modify immutable matrix');
      };
    }
    return this;
  }

  /**
   * Copies the entries of this matrix over to an arbitrary array (typed or normal).
   * @public
   *
   * @param {Array|Float32Array|Float64Array} array
   * @returns {Array|Float32Array|Float64Array} - Returned for chaining
   */
  copyToArray(array) {
    array[0] = this.m00();
    array[1] = this.m10();
    array[2] = this.m20();
    array[3] = this.m30();
    array[4] = this.m01();
    array[5] = this.m11();
    array[6] = this.m21();
    array[7] = this.m31();
    array[8] = this.m02();
    array[9] = this.m12();
    array[10] = this.m22();
    array[11] = this.m32();
    array[12] = this.m03();
    array[13] = this.m13();
    array[14] = this.m23();
    array[15] = this.m33();
    return array;
  }

  /**
   * Returns an identity matrix.
   * @public
   *
   * @returns {Matrix4}
   */
  static identity() {
    return new Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, Types.IDENTITY);
  }

  /**
   * Returns a translation matrix.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Matrix4}
   */
  static translation(x, y, z) {
    return new Matrix4(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1, Types.TRANSLATION_3D);
  }

  /**
   * Returns a translation matrix computed from a vector.
   * @public
   *
   * @param {Vector3|Vector4} vector
   * @returns {Matrix4}
   */
  static translationFromVector(vector) {
    return Matrix4.translation(vector.x, vector.y, vector.z);
  }

  /**
   * Returns a matrix that scales things in each dimension.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Matrix4}
   */
  static scaling(x, y, z) {
    // allow using one parameter to scale everything
    y = y === undefined ? x : y;
    z = z === undefined ? x : z;
    return new Matrix4(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1, Types.SCALING);
  }

  /**
   * Returns a homogeneous matrix rotation defined by a rotation of the specified angle around the given unit axis.
   * @public
   *
   * @param {Vector3} axis - normalized
   * @param {number} angle - in radians
   * @returns {Matrix4}
   */
  static rotationAxisAngle(axis, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const C = 1 - c;
    return new Matrix4(axis.x * axis.x * C + c, axis.x * axis.y * C - axis.z * s, axis.x * axis.z * C + axis.y * s, 0, axis.y * axis.x * C + axis.z * s, axis.y * axis.y * C + c, axis.y * axis.z * C - axis.x * s, 0, axis.z * axis.x * C - axis.y * s, axis.z * axis.y * C + axis.x * s, axis.z * axis.z * C + c, 0, 0, 0, 0, 1, Types.AFFINE);
  }

  // TODO: add in rotation from quaternion, and from quat + translation

  /**
   * Returns a rotation matrix in the yz plane.
   * @public
   *
   * @param {number} angle - in radians
   * @returns {Matrix4}
   */
  static rotationX(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix4(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, Types.AFFINE);
  }

  /**
   * Returns a rotation matrix in the xz plane.
   * @public
   *
   * @param {number} angle - in radians
   * @returns {Matrix4}
   */
  static rotationY(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix4(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1, Types.AFFINE);
  }

  /**
   * Returns a rotation matrix in the xy plane.
   * @public
   *
   * @param {number} angle - in radians
   * @returns {Matrix4}
   */
  static rotationZ(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix4(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, Types.AFFINE);
  }

  /**
   * Returns the specific perspective matrix needed for certain WebGL contexts.
   * @public
   *
   * @param {number} fovYRadians
   * @param {number} aspect - aspect === width / height
   * @param {number} zNear
   * @param {number} zFar
   * @returns {Matrix4}
   */
  static gluPerspective(fovYRadians, aspect, zNear, zFar) {
    const cotangent = Math.cos(fovYRadians) / Math.sin(fovYRadians);
    return new Matrix4(cotangent / aspect, 0, 0, 0, 0, cotangent, 0, 0, 0, 0, (zFar + zNear) / (zNear - zFar), 2 * zFar * zNear / (zNear - zFar), 0, 0, -1, 0);
  }
}
dot.register('Matrix4', Matrix4);
const Types = EnumerationDeprecated.byKeys(['OTHER', 'IDENTITY', 'TRANSLATION_3D', 'SCALING', 'AFFINE']);

// @public {EnumerationDeprecated}
Matrix4.Types = Types;

// @public {Matrix4}
Matrix4.IDENTITY = new Matrix4().makeImmutable();
export default Matrix4;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJkb3QiLCJWZWN0b3IzIiwiVmVjdG9yNCIsIkZsb2F0MzJBcnJheSIsIndpbmRvdyIsIkFycmF5IiwiTWF0cml4NCIsImNvbnN0cnVjdG9yIiwidjAwIiwidjAxIiwidjAyIiwidjAzIiwidjEwIiwidjExIiwidjEyIiwidjEzIiwidjIwIiwidjIxIiwidjIyIiwidjIzIiwidjMwIiwidjMxIiwidjMyIiwidjMzIiwidHlwZSIsImVudHJpZXMiLCJUeXBlcyIsIk9USEVSIiwicm93TWFqb3IiLCJ1bmRlZmluZWQiLCJBRkZJTkUiLCJjb2x1bW5NYWpvciIsInNldCIsIm1hdHJpeCIsIm0wMCIsIm0wMSIsIm0wMiIsIm0wMyIsIm0xMCIsIm0xMSIsIm0xMiIsIm0xMyIsIm0yMCIsIm0yMSIsIm0yMiIsIm0yMyIsIm0zMCIsIm0zMSIsIm0zMiIsIm0zMyIsImlzRmluaXRlIiwiZ2V0VHJhbnNsYXRpb24iLCJ0cmFuc2xhdGlvbiIsImdldFNjYWxlVmVjdG9yIiwibTAwMDMiLCJtMTAxMyIsIm0yMDIzIiwibTMwMzMiLCJtMDEwMyIsIm0xMTEzIiwibTIxMjMiLCJtMzEzMyIsIm0wMjAzIiwibTEyMTMiLCJtMjIyMyIsIm0zMjMzIiwiTWF0aCIsInNxcnQiLCJzY2FsZVZlY3RvciIsImdldENTU1RyYW5zZm9ybSIsInRvRml4ZWQiLCJjc3NUcmFuc2Zvcm0iLCJlcXVhbHMiLCJlcXVhbHNFcHNpbG9uIiwiZXBzaWxvbiIsImFicyIsImNvcHkiLCJwbHVzIiwibWludXMiLCJ0cmFuc3Bvc2VkIiwibmVnYXRlZCIsImludmVydGVkIiwiZGV0IiwiSURFTlRJVFkiLCJUUkFOU0xBVElPTl8zRCIsIlNDQUxJTkciLCJnZXREZXRlcm1pbmFudCIsIkVycm9yIiwidGltZXNNYXRyaXgiLCJ0aW1lc1ZlY3RvcjQiLCJ2ZWN0b3I0IiwieCIsInkiLCJ6IiwidyIsInRpbWVzVmVjdG9yMyIsInZlY3RvcjMiLCJ0b1ZlY3RvcjQiLCJ0b1ZlY3RvcjMiLCJ0aW1lc1RyYW5zcG9zZVZlY3RvcjQiLCJ0aW1lc1RyYW5zcG9zZVZlY3RvcjMiLCJ0aW1lc1JlbGF0aXZlVmVjdG9yMyIsImRldGVybWluYW50IiwidG9TdHJpbmciLCJtYWtlSW1tdXRhYmxlIiwiYXNzZXJ0IiwiY29weVRvQXJyYXkiLCJhcnJheSIsImlkZW50aXR5IiwidHJhbnNsYXRpb25Gcm9tVmVjdG9yIiwidmVjdG9yIiwic2NhbGluZyIsInJvdGF0aW9uQXhpc0FuZ2xlIiwiYXhpcyIsImFuZ2xlIiwiYyIsImNvcyIsInMiLCJzaW4iLCJDIiwicm90YXRpb25YIiwicm90YXRpb25ZIiwicm90YXRpb25aIiwiZ2x1UGVyc3BlY3RpdmUiLCJmb3ZZUmFkaWFucyIsImFzcGVjdCIsInpOZWFyIiwiekZhciIsImNvdGFuZ2VudCIsInJlZ2lzdGVyIiwiYnlLZXlzIl0sInNvdXJjZXMiOlsiTWF0cml4NC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiA0LWRpbWVuc2lvbmFsIE1hdHJpeFxyXG4gKlxyXG4gKiBUT0RPOiBjb25zaWRlciBhZGRpbmcgYWZmaW5lIGZsYWcgaWYgaXQgd2lsbCBoZWxwIHBlcmZvcm1hbmNlIChhIGxhIE1hdHJpeDMpXHJcbiAqIFRPRE86IGdldCByb3RhdGlvbiBhbmdsZXNcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbi8qIGVzbGludC1kaXNhYmxlIGJhZC1zaW0tdGV4dCAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25EZXByZWNhdGVkLmpzJztcclxuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XHJcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vVmVjdG9yMy5qcyc7XHJcbmltcG9ydCBWZWN0b3I0IGZyb20gJy4vVmVjdG9yNC5qcyc7XHJcblxyXG5jb25zdCBGbG9hdDMyQXJyYXkgPSB3aW5kb3cuRmxvYXQzMkFycmF5IHx8IEFycmF5O1xyXG5cclxuY2xhc3MgTWF0cml4NCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MDBdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MDFdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MDJdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MDNdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MTBdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MTFdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MTJdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MTNdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MjBdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MjFdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MjJdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MjNdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MzBdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MzFdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MzJdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MzNdXHJcbiAgICogQHBhcmFtIHtNYXRyaXg0LlR5cGVzfHVuZGVmaW5lZH0gW3R5cGVdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHYwMCwgdjAxLCB2MDIsIHYwMywgdjEwLCB2MTEsIHYxMiwgdjEzLCB2MjAsIHYyMSwgdjIyLCB2MjMsIHYzMCwgdjMxLCB2MzIsIHYzMywgdHlwZSApIHtcclxuXHJcbiAgICAvLyBAcHVibGljIHtGbG9hdDMyQXJyYXl9IC0gZW50cmllcyBzdG9yZWQgaW4gY29sdW1uLW1ham9yIGZvcm1hdFxyXG4gICAgdGhpcy5lbnRyaWVzID0gbmV3IEZsb2F0MzJBcnJheSggMTYgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtNYXRyaXg0LlR5cGVzfVxyXG4gICAgdGhpcy50eXBlID0gVHlwZXMuT1RIRVI7IC8vIHdpbGwgYmUgc2V0IGJ5IHJvd01ham9yXHJcblxyXG4gICAgdGhpcy5yb3dNYWpvcihcclxuICAgICAgdjAwICE9PSB1bmRlZmluZWQgPyB2MDAgOiAxLCB2MDEgIT09IHVuZGVmaW5lZCA/IHYwMSA6IDAsIHYwMiAhPT0gdW5kZWZpbmVkID8gdjAyIDogMCwgdjAzICE9PSB1bmRlZmluZWQgPyB2MDMgOiAwLFxyXG4gICAgICB2MTAgIT09IHVuZGVmaW5lZCA/IHYxMCA6IDAsIHYxMSAhPT0gdW5kZWZpbmVkID8gdjExIDogMSwgdjEyICE9PSB1bmRlZmluZWQgPyB2MTIgOiAwLCB2MTMgIT09IHVuZGVmaW5lZCA/IHYxMyA6IDAsXHJcbiAgICAgIHYyMCAhPT0gdW5kZWZpbmVkID8gdjIwIDogMCwgdjIxICE9PSB1bmRlZmluZWQgPyB2MjEgOiAwLCB2MjIgIT09IHVuZGVmaW5lZCA/IHYyMiA6IDEsIHYyMyAhPT0gdW5kZWZpbmVkID8gdjIzIDogMCxcclxuICAgICAgdjMwICE9PSB1bmRlZmluZWQgPyB2MzAgOiAwLCB2MzEgIT09IHVuZGVmaW5lZCA/IHYzMSA6IDAsIHYzMiAhPT0gdW5kZWZpbmVkID8gdjMyIDogMCwgdjMzICE9PSB1bmRlZmluZWQgPyB2MzMgOiAxLFxyXG4gICAgICB0eXBlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGFsbCBlbnRyaWVzIG9mIHRoZSBtYXRyaXggaW4gcm93LW1ham9yIG9yZGVyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2MDBcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdjAxXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHYwMlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2MDNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdjEwXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHYxMVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2MTJcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdjEzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHYyMFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2MjFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdjIyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHYyM1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2MzBcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdjMxXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHYzMlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2MzNcclxuICAgKiBAcGFyYW0ge01hdHJpeDQuVHlwZXN8dW5kZWZpbmVkfSBbdHlwZV1cclxuICAgKiBAcmV0dXJucyB7TWF0cml4NH0gLSBTZWxmIHJlZmVyZW5jZVxyXG4gICAqL1xyXG4gIHJvd01ham9yKCB2MDAsIHYwMSwgdjAyLCB2MDMsIHYxMCwgdjExLCB2MTIsIHYxMywgdjIwLCB2MjEsIHYyMiwgdjIzLCB2MzAsIHYzMSwgdjMyLCB2MzMsIHR5cGUgKSB7XHJcbiAgICB0aGlzLmVudHJpZXNbIDAgXSA9IHYwMDtcclxuICAgIHRoaXMuZW50cmllc1sgMSBdID0gdjEwO1xyXG4gICAgdGhpcy5lbnRyaWVzWyAyIF0gPSB2MjA7XHJcbiAgICB0aGlzLmVudHJpZXNbIDMgXSA9IHYzMDtcclxuICAgIHRoaXMuZW50cmllc1sgNCBdID0gdjAxO1xyXG4gICAgdGhpcy5lbnRyaWVzWyA1IF0gPSB2MTE7XHJcbiAgICB0aGlzLmVudHJpZXNbIDYgXSA9IHYyMTtcclxuICAgIHRoaXMuZW50cmllc1sgNyBdID0gdjMxO1xyXG4gICAgdGhpcy5lbnRyaWVzWyA4IF0gPSB2MDI7XHJcbiAgICB0aGlzLmVudHJpZXNbIDkgXSA9IHYxMjtcclxuICAgIHRoaXMuZW50cmllc1sgMTAgXSA9IHYyMjtcclxuICAgIHRoaXMuZW50cmllc1sgMTEgXSA9IHYzMjtcclxuICAgIHRoaXMuZW50cmllc1sgMTIgXSA9IHYwMztcclxuICAgIHRoaXMuZW50cmllc1sgMTMgXSA9IHYxMztcclxuICAgIHRoaXMuZW50cmllc1sgMTQgXSA9IHYyMztcclxuICAgIHRoaXMuZW50cmllc1sgMTUgXSA9IHYzMztcclxuXHJcbiAgICAvLyBUT0RPOiBjb25zaWRlciBwZXJmb3JtYW5jZSBvZiB0aGUgYWZmaW5lIGNoZWNrIGhlcmVcclxuICAgIHRoaXMudHlwZSA9IHR5cGUgPT09IHVuZGVmaW5lZCA/ICggKCB2MzAgPT09IDAgJiYgdjMxID09PSAwICYmIHYzMiA9PT0gMCAmJiB2MzMgPT09IDEgKSA/IFR5cGVzLkFGRklORSA6IFR5cGVzLk9USEVSICkgOiB0eXBlO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGFsbCBlbnRyaWVzIG9mIHRoZSBtYXRyaXggaW4gY29sdW1uLW1ham9yIG9yZGVyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Kn0gdjAwXHJcbiAgICogQHBhcmFtIHsqfSB2MTBcclxuICAgKiBAcGFyYW0geyp9IHYyMFxyXG4gICAqIEBwYXJhbSB7Kn0gdjMwXHJcbiAgICogQHBhcmFtIHsqfSB2MDFcclxuICAgKiBAcGFyYW0geyp9IHYxMVxyXG4gICAqIEBwYXJhbSB7Kn0gdjIxXHJcbiAgICogQHBhcmFtIHsqfSB2MzFcclxuICAgKiBAcGFyYW0geyp9IHYwMlxyXG4gICAqIEBwYXJhbSB7Kn0gdjEyXHJcbiAgICogQHBhcmFtIHsqfSB2MjJcclxuICAgKiBAcGFyYW0geyp9IHYzMlxyXG4gICAqIEBwYXJhbSB7Kn0gdjAzXHJcbiAgICogQHBhcmFtIHsqfSB2MTNcclxuICAgKiBAcGFyYW0geyp9IHYyM1xyXG4gICAqIEBwYXJhbSB7Kn0gdjMzXHJcbiAgICogQHBhcmFtIHtNYXRyaXg0LlR5cGVzfHVuZGVmaW5lZH0gW3R5cGVdXHJcbiAgICogQHJldHVybnMge01hdHJpeDR9IC0gU2VsZiByZWZlcmVuY2VcclxuICAgKi9cclxuICBjb2x1bW5NYWpvciggdjAwLCB2MTAsIHYyMCwgdjMwLCB2MDEsIHYxMSwgdjIxLCB2MzEsIHYwMiwgdjEyLCB2MjIsIHYzMiwgdjAzLCB2MTMsIHYyMywgdjMzLCB0eXBlICkge1xyXG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoIHYwMCwgdjAxLCB2MDIsIHYwMywgdjEwLCB2MTEsIHYxMiwgdjEzLCB2MjAsIHYyMSwgdjIyLCB2MjMsIHYzMCwgdjMxLCB2MzIsIHYzMywgdHlwZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byB0aGUgdmFsdWUgb2YgdGhlIHBhc3NlZC1pbiBtYXRyaXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXg0fSBtYXRyaXhcclxuICAgKiBAcmV0dXJucyB7TWF0cml4NH0gLSBTZWxmIHJlZmVyZW5jZVxyXG4gICAqL1xyXG4gIHNldCggbWF0cml4ICkge1xyXG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXHJcbiAgICAgIG1hdHJpeC5tMDAoKSwgbWF0cml4Lm0wMSgpLCBtYXRyaXgubTAyKCksIG1hdHJpeC5tMDMoKSxcclxuICAgICAgbWF0cml4Lm0xMCgpLCBtYXRyaXgubTExKCksIG1hdHJpeC5tMTIoKSwgbWF0cml4Lm0xMygpLFxyXG4gICAgICBtYXRyaXgubTIwKCksIG1hdHJpeC5tMjEoKSwgbWF0cml4Lm0yMigpLCBtYXRyaXgubTIzKCksXHJcbiAgICAgIG1hdHJpeC5tMzAoKSwgbWF0cml4Lm0zMSgpLCBtYXRyaXgubTMyKCksIG1hdHJpeC5tMzMoKSxcclxuICAgICAgbWF0cml4LnR5cGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIDAsMCBlbnRyeSBvZiB0aGlzIG1hdHJpeC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIG0wMCgpIHtcclxuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDAgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIDAsMSBlbnRyeSBvZiB0aGlzIG1hdHJpeC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIG0wMSgpIHtcclxuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDQgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIDAsMiBlbnRyeSBvZiB0aGlzIG1hdHJpeC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIG0wMigpIHtcclxuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDggXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIDAsMyBlbnRyeSBvZiB0aGlzIG1hdHJpeC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIG0wMygpIHtcclxuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDEyIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSAxLDAgZW50cnkgb2YgdGhpcyBtYXRyaXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBtMTAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyAxIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSAxLDEgZW50cnkgb2YgdGhpcyBtYXRyaXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBtMTEoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyA1IF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSAxLDIgZW50cnkgb2YgdGhpcyBtYXRyaXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBtMTIoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyA5IF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSAxLDMgZW50cnkgb2YgdGhpcyBtYXRyaXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBtMTMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyAxMyBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgMiwwIGVudHJ5IG9mIHRoaXMgbWF0cml4LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgbTIwKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW50cmllc1sgMiBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgMiwxIGVudHJ5IG9mIHRoaXMgbWF0cml4LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgbTIxKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW50cmllc1sgNiBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgMiwyIGVudHJ5IG9mIHRoaXMgbWF0cml4LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgbTIyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW50cmllc1sgMTAgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIDIsMyBlbnRyeSBvZiB0aGlzIG1hdHJpeC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIG0yMygpIHtcclxuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDE0IF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSAzLDAgZW50cnkgb2YgdGhpcyBtYXRyaXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBtMzAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyAzIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSAzLDEgZW50cnkgb2YgdGhpcyBtYXRyaXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBtMzEoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyA3IF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSAzLDIgZW50cnkgb2YgdGhpcyBtYXRyaXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBtMzIoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyAxMSBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgMywzIGVudHJ5IG9mIHRoaXMgbWF0cml4LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgbTMzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW50cmllc1sgMTUgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBhbGwgb2YgdGhpcyBtYXRyaXgncyBlbnRyaWVzIGFyZSBmaW5pdGUgKG5vbi1pbmZpbml0ZSBhbmQgbm9uLU5hTikuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNGaW5pdGUoKSB7XHJcbiAgICByZXR1cm4gaXNGaW5pdGUoIHRoaXMubTAwKCkgKSAmJlxyXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0wMSgpICkgJiZcclxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMDIoKSApICYmXHJcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTAzKCkgKSAmJlxyXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0xMCgpICkgJiZcclxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMTEoKSApICYmXHJcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTEyKCkgKSAmJlxyXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0xMygpICkgJiZcclxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMjAoKSApICYmXHJcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTIxKCkgKSAmJlxyXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0yMigpICkgJiZcclxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMjMoKSApICYmXHJcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTMwKCkgKSAmJlxyXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0zMSgpICkgJiZcclxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMzIoKSApICYmXHJcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTMzKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIDNEIHRyYW5zbGF0aW9uLCBhc3N1bWluZyBtdWx0aXBsaWNhdGlvbiB3aXRoIGEgaG9tb2dlbmVvdXMgdmVjdG9yLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxyXG4gICAqL1xyXG4gIGdldFRyYW5zbGF0aW9uKCkge1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCB0aGlzLm0wMygpLCB0aGlzLm0xMygpLCB0aGlzLm0yMygpICk7XHJcbiAgfVxyXG5cclxuICBnZXQgdHJhbnNsYXRpb24oKSB7IHJldHVybiB0aGlzLmdldFRyYW5zbGF0aW9uKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHZlY3RvciB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gKCBUKDEsMCwwKS5tYWduaXR1ZGUsIFQoMCwxLDApLm1hZ25pdHVkZSwgVCgwLDAsMSkubWFnbml0dWRlIClcclxuICAgKiB3aGVyZSBUIGlzIGEgcmVsYXRpdmUgdHJhbnNmb3JtLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxyXG4gICAqL1xyXG4gIGdldFNjYWxlVmVjdG9yKCkge1xyXG4gICAgY29uc3QgbTAwMDMgPSB0aGlzLm0wMCgpICsgdGhpcy5tMDMoKTtcclxuICAgIGNvbnN0IG0xMDEzID0gdGhpcy5tMTAoKSArIHRoaXMubTEzKCk7XHJcbiAgICBjb25zdCBtMjAyMyA9IHRoaXMubTIwKCkgKyB0aGlzLm0yMygpO1xyXG4gICAgY29uc3QgbTMwMzMgPSB0aGlzLm0zMCgpICsgdGhpcy5tMzMoKTtcclxuICAgIGNvbnN0IG0wMTAzID0gdGhpcy5tMDEoKSArIHRoaXMubTAzKCk7XHJcbiAgICBjb25zdCBtMTExMyA9IHRoaXMubTExKCkgKyB0aGlzLm0xMygpO1xyXG4gICAgY29uc3QgbTIxMjMgPSB0aGlzLm0yMSgpICsgdGhpcy5tMjMoKTtcclxuICAgIGNvbnN0IG0zMTMzID0gdGhpcy5tMzEoKSArIHRoaXMubTMzKCk7XHJcbiAgICBjb25zdCBtMDIwMyA9IHRoaXMubTAyKCkgKyB0aGlzLm0wMygpO1xyXG4gICAgY29uc3QgbTEyMTMgPSB0aGlzLm0xMigpICsgdGhpcy5tMTMoKTtcclxuICAgIGNvbnN0IG0yMjIzID0gdGhpcy5tMjIoKSArIHRoaXMubTIzKCk7XHJcbiAgICBjb25zdCBtMzIzMyA9IHRoaXMubTMyKCkgKyB0aGlzLm0zMygpO1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKFxyXG4gICAgICBNYXRoLnNxcnQoIG0wMDAzICogbTAwMDMgKyBtMTAxMyAqIG0xMDEzICsgbTIwMjMgKiBtMjAyMyArIG0zMDMzICogbTMwMzMgKSxcclxuICAgICAgTWF0aC5zcXJ0KCBtMDEwMyAqIG0wMTAzICsgbTExMTMgKiBtMTExMyArIG0yMTIzICogbTIxMjMgKyBtMzEzMyAqIG0zMTMzICksXHJcbiAgICAgIE1hdGguc3FydCggbTAyMDMgKiBtMDIwMyArIG0xMjEzICogbTEyMTMgKyBtMjIyMyAqIG0yMjIzICsgbTMyMzMgKiBtMzIzMyApICk7XHJcbiAgfVxyXG5cclxuICBnZXQgc2NhbGVWZWN0b3IoKSB7IHJldHVybiB0aGlzLmdldFNjYWxlVmVjdG9yKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgQ1NTIHRyYW5zZm9ybSBzdHJpbmcgZm9yIHRoZSBhc3NvY2lhdGVkIGhvbW9nZW5lb3VzIDNkIHRyYW5zZm9ybWF0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0Q1NTVHJhbnNmb3JtKCkge1xyXG4gICAgLy8gU2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtdHJhbnNmb3Jtcy8sIHBhcnRpY3VsYXJseSBTZWN0aW9uIDEzIHRoYXQgZGlzY3Vzc2VzIHRoZSBTVkcgY29tcGF0aWJpbGl0eVxyXG5cclxuICAgIC8vIHRoZSBpbm5lciBwYXJ0IG9mIGEgQ1NTMyB0cmFuc2Zvcm0sIGJ1dCByZW1lbWJlciB0byBhZGQgdGhlIGJyb3dzZXItc3BlY2lmaWMgcGFydHMhXHJcbiAgICAvLyBOT1RFOiB0aGUgdG9GaXhlZCBjYWxscyBhcmUgaW5saW5lZCBmb3IgcGVyZm9ybWFuY2UgcmVhc29uc1xyXG4gICAgcmV0dXJuIGBtYXRyaXgzZCgke1xyXG4gICAgICB0aGlzLmVudHJpZXNbIDAgXS50b0ZpeGVkKCAyMCApfSwke1xyXG4gICAgICB0aGlzLmVudHJpZXNbIDEgXS50b0ZpeGVkKCAyMCApfSwke1xyXG4gICAgICB0aGlzLmVudHJpZXNbIDIgXS50b0ZpeGVkKCAyMCApfSwke1xyXG4gICAgICB0aGlzLmVudHJpZXNbIDMgXS50b0ZpeGVkKCAyMCApfSwke1xyXG4gICAgICB0aGlzLmVudHJpZXNbIDQgXS50b0ZpeGVkKCAyMCApfSwke1xyXG4gICAgICB0aGlzLmVudHJpZXNbIDUgXS50b0ZpeGVkKCAyMCApfSwke1xyXG4gICAgICB0aGlzLmVudHJpZXNbIDYgXS50b0ZpeGVkKCAyMCApfSwke1xyXG4gICAgICB0aGlzLmVudHJpZXNbIDcgXS50b0ZpeGVkKCAyMCApfSwke1xyXG4gICAgICB0aGlzLmVudHJpZXNbIDggXS50b0ZpeGVkKCAyMCApfSwke1xyXG4gICAgICB0aGlzLmVudHJpZXNbIDkgXS50b0ZpeGVkKCAyMCApfSwke1xyXG4gICAgICB0aGlzLmVudHJpZXNbIDEwIF0udG9GaXhlZCggMjAgKX0sJHtcclxuICAgICAgdGhpcy5lbnRyaWVzWyAxMSBdLnRvRml4ZWQoIDIwICl9LCR7XHJcbiAgICAgIHRoaXMuZW50cmllc1sgMTIgXS50b0ZpeGVkKCAyMCApfSwke1xyXG4gICAgICB0aGlzLmVudHJpZXNbIDEzIF0udG9GaXhlZCggMjAgKX0sJHtcclxuICAgICAgdGhpcy5lbnRyaWVzWyAxNCBdLnRvRml4ZWQoIDIwICl9LCR7XHJcbiAgICAgIHRoaXMuZW50cmllc1sgMTUgXS50b0ZpeGVkKCAyMCApfSlgO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGNzc1RyYW5zZm9ybSgpIHsgcmV0dXJuIHRoaXMuZ2V0Q1NTVHJhbnNmb3JtKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBleGFjdCBlcXVhbGl0eSB3aXRoIGFub3RoZXIgbWF0cml4XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXg0fSBtYXRyaXhcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBlcXVhbHMoIG1hdHJpeCApIHtcclxuICAgIHJldHVybiB0aGlzLm0wMCgpID09PSBtYXRyaXgubTAwKCkgJiYgdGhpcy5tMDEoKSA9PT0gbWF0cml4Lm0wMSgpICYmIHRoaXMubTAyKCkgPT09IG1hdHJpeC5tMDIoKSAmJiB0aGlzLm0wMygpID09PSBtYXRyaXgubTAzKCkgJiZcclxuICAgICAgICAgICB0aGlzLm0xMCgpID09PSBtYXRyaXgubTEwKCkgJiYgdGhpcy5tMTEoKSA9PT0gbWF0cml4Lm0xMSgpICYmIHRoaXMubTEyKCkgPT09IG1hdHJpeC5tMTIoKSAmJiB0aGlzLm0xMygpID09PSBtYXRyaXgubTEzKCkgJiZcclxuICAgICAgICAgICB0aGlzLm0yMCgpID09PSBtYXRyaXgubTIwKCkgJiYgdGhpcy5tMjEoKSA9PT0gbWF0cml4Lm0yMSgpICYmIHRoaXMubTIyKCkgPT09IG1hdHJpeC5tMjIoKSAmJiB0aGlzLm0yMygpID09PSBtYXRyaXgubTIzKCkgJiZcclxuICAgICAgICAgICB0aGlzLm0zMCgpID09PSBtYXRyaXgubTMwKCkgJiYgdGhpcy5tMzEoKSA9PT0gbWF0cml4Lm0zMSgpICYmIHRoaXMubTMyKCkgPT09IG1hdHJpeC5tMzIoKSAmJiB0aGlzLm0zMygpID09PSBtYXRyaXgubTMzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGVxdWFsaXR5IHdpdGhpbiBhIG1hcmdpbiBvZiBlcnJvciB3aXRoIGFub3RoZXIgbWF0cml4XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXg0fSBtYXRyaXhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZXBzaWxvblxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGVxdWFsc0Vwc2lsb24oIG1hdHJpeCwgZXBzaWxvbiApIHtcclxuICAgIHJldHVybiBNYXRoLmFicyggdGhpcy5tMDAoKSAtIG1hdHJpeC5tMDAoKSApIDwgZXBzaWxvbiAmJlxyXG4gICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm0wMSgpIC0gbWF0cml4Lm0wMSgpICkgPCBlcHNpbG9uICYmXHJcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTAyKCkgLSBtYXRyaXgubTAyKCkgKSA8IGVwc2lsb24gJiZcclxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMDMoKSAtIG1hdHJpeC5tMDMoKSApIDwgZXBzaWxvbiAmJlxyXG4gICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm0xMCgpIC0gbWF0cml4Lm0xMCgpICkgPCBlcHNpbG9uICYmXHJcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTExKCkgLSBtYXRyaXgubTExKCkgKSA8IGVwc2lsb24gJiZcclxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMTIoKSAtIG1hdHJpeC5tMTIoKSApIDwgZXBzaWxvbiAmJlxyXG4gICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm0xMygpIC0gbWF0cml4Lm0xMygpICkgPCBlcHNpbG9uICYmXHJcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTIwKCkgLSBtYXRyaXgubTIwKCkgKSA8IGVwc2lsb24gJiZcclxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMjEoKSAtIG1hdHJpeC5tMjEoKSApIDwgZXBzaWxvbiAmJlxyXG4gICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm0yMigpIC0gbWF0cml4Lm0yMigpICkgPCBlcHNpbG9uICYmXHJcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTIzKCkgLSBtYXRyaXgubTIzKCkgKSA8IGVwc2lsb24gJiZcclxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMzAoKSAtIG1hdHJpeC5tMzAoKSApIDwgZXBzaWxvbiAmJlxyXG4gICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm0zMSgpIC0gbWF0cml4Lm0zMSgpICkgPCBlcHNpbG9uICYmXHJcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTMyKCkgLSBtYXRyaXgubTMyKCkgKSA8IGVwc2lsb24gJiZcclxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMzMoKSAtIG1hdHJpeC5tMzMoKSApIDwgZXBzaWxvbjtcclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIEltbXV0YWJsZSBvcGVyYXRpb25zIChyZXR1cm5pbmcgYSBuZXcgbWF0cml4KVxyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBjb3B5IG9mIHRoaXMgbWF0cml4XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge01hdHJpeDR9XHJcbiAgICovXHJcbiAgY29weSgpIHtcclxuICAgIHJldHVybiBuZXcgTWF0cml4NChcclxuICAgICAgdGhpcy5tMDAoKSwgdGhpcy5tMDEoKSwgdGhpcy5tMDIoKSwgdGhpcy5tMDMoKSxcclxuICAgICAgdGhpcy5tMTAoKSwgdGhpcy5tMTEoKSwgdGhpcy5tMTIoKSwgdGhpcy5tMTMoKSxcclxuICAgICAgdGhpcy5tMjAoKSwgdGhpcy5tMjEoKSwgdGhpcy5tMjIoKSwgdGhpcy5tMjMoKSxcclxuICAgICAgdGhpcy5tMzAoKSwgdGhpcy5tMzEoKSwgdGhpcy5tMzIoKSwgdGhpcy5tMzMoKSxcclxuICAgICAgdGhpcy50eXBlXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBtYXRyaXgsIGRlZmluZWQgYnkgdGhpcyBtYXRyaXggcGx1cyB0aGUgcHJvdmlkZWQgbWF0cml4XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXg0fSBtYXRyaXhcclxuICAgKiBAcmV0dXJucyB7TWF0cml4NH1cclxuICAgKi9cclxuICBwbHVzKCBtYXRyaXggKSB7XHJcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoXHJcbiAgICAgIHRoaXMubTAwKCkgKyBtYXRyaXgubTAwKCksIHRoaXMubTAxKCkgKyBtYXRyaXgubTAxKCksIHRoaXMubTAyKCkgKyBtYXRyaXgubTAyKCksIHRoaXMubTAzKCkgKyBtYXRyaXgubTAzKCksXHJcbiAgICAgIHRoaXMubTEwKCkgKyBtYXRyaXgubTEwKCksIHRoaXMubTExKCkgKyBtYXRyaXgubTExKCksIHRoaXMubTEyKCkgKyBtYXRyaXgubTEyKCksIHRoaXMubTEzKCkgKyBtYXRyaXgubTEzKCksXHJcbiAgICAgIHRoaXMubTIwKCkgKyBtYXRyaXgubTIwKCksIHRoaXMubTIxKCkgKyBtYXRyaXgubTIxKCksIHRoaXMubTIyKCkgKyBtYXRyaXgubTIyKCksIHRoaXMubTIzKCkgKyBtYXRyaXgubTIzKCksXHJcbiAgICAgIHRoaXMubTMwKCkgKyBtYXRyaXgubTMwKCksIHRoaXMubTMxKCkgKyBtYXRyaXgubTMxKCksIHRoaXMubTMyKCkgKyBtYXRyaXgubTMyKCksIHRoaXMubTMzKCkgKyBtYXRyaXgubTMzKClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IG1hdHJpeCwgZGVmaW5lZCBieSB0aGlzIG1hdHJpeCBwbHVzIHRoZSBwcm92aWRlZCBtYXRyaXhcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01hdHJpeDR9IG1hdHJpeFxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXg0fVxyXG4gICAqL1xyXG4gIG1pbnVzKCBtYXRyaXggKSB7XHJcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoXHJcbiAgICAgIHRoaXMubTAwKCkgLSBtYXRyaXgubTAwKCksIHRoaXMubTAxKCkgLSBtYXRyaXgubTAxKCksIHRoaXMubTAyKCkgLSBtYXRyaXgubTAyKCksIHRoaXMubTAzKCkgLSBtYXRyaXgubTAzKCksXHJcbiAgICAgIHRoaXMubTEwKCkgLSBtYXRyaXgubTEwKCksIHRoaXMubTExKCkgLSBtYXRyaXgubTExKCksIHRoaXMubTEyKCkgLSBtYXRyaXgubTEyKCksIHRoaXMubTEzKCkgLSBtYXRyaXgubTEzKCksXHJcbiAgICAgIHRoaXMubTIwKCkgLSBtYXRyaXgubTIwKCksIHRoaXMubTIxKCkgLSBtYXRyaXgubTIxKCksIHRoaXMubTIyKCkgLSBtYXRyaXgubTIyKCksIHRoaXMubTIzKCkgLSBtYXRyaXgubTIzKCksXHJcbiAgICAgIHRoaXMubTMwKCkgLSBtYXRyaXgubTMwKCksIHRoaXMubTMxKCkgLSBtYXRyaXgubTMxKCksIHRoaXMubTMyKCkgLSBtYXRyaXgubTMyKCksIHRoaXMubTMzKCkgLSBtYXRyaXgubTMzKClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdHJhbnNwb3NlZCBjb3B5IG9mIHRoaXMgbWF0cml4XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge01hdHJpeDR9XHJcbiAgICovXHJcbiAgdHJhbnNwb3NlZCgpIHtcclxuICAgIHJldHVybiBuZXcgTWF0cml4NChcclxuICAgICAgdGhpcy5tMDAoKSwgdGhpcy5tMTAoKSwgdGhpcy5tMjAoKSwgdGhpcy5tMzAoKSxcclxuICAgICAgdGhpcy5tMDEoKSwgdGhpcy5tMTEoKSwgdGhpcy5tMjEoKSwgdGhpcy5tMzEoKSxcclxuICAgICAgdGhpcy5tMDIoKSwgdGhpcy5tMTIoKSwgdGhpcy5tMjIoKSwgdGhpcy5tMzIoKSxcclxuICAgICAgdGhpcy5tMDMoKSwgdGhpcy5tMTMoKSwgdGhpcy5tMjMoKSwgdGhpcy5tMzMoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5lZ2F0ZWQgY29weSBvZiB0aGlzIG1hdHJpeFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXgzfVxyXG4gICAqL1xyXG4gIG5lZ2F0ZWQoKSB7XHJcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoXHJcbiAgICAgIC10aGlzLm0wMCgpLCAtdGhpcy5tMDEoKSwgLXRoaXMubTAyKCksIC10aGlzLm0wMygpLFxyXG4gICAgICAtdGhpcy5tMTAoKSwgLXRoaXMubTExKCksIC10aGlzLm0xMigpLCAtdGhpcy5tMTMoKSxcclxuICAgICAgLXRoaXMubTIwKCksIC10aGlzLm0yMSgpLCAtdGhpcy5tMjIoKSwgLXRoaXMubTIzKCksXHJcbiAgICAgIC10aGlzLm0zMCgpLCAtdGhpcy5tMzEoKSwgLXRoaXMubTMyKCksIC10aGlzLm0zMygpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGludmVydGVkIGNvcHkgb2YgdGhpcyBtYXRyaXhcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7TWF0cml4M31cclxuICAgKi9cclxuICBpbnZlcnRlZCgpIHtcclxuICAgIGxldCBkZXQ7XHJcbiAgICBzd2l0Y2goIHRoaXMudHlwZSApIHtcclxuICAgICAgY2FzZSBUeXBlcy5JREVOVElUWTpcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgY2FzZSBUeXBlcy5UUkFOU0xBVElPTl8zRDpcclxuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXHJcbiAgICAgICAgICAxLCAwLCAwLCAtdGhpcy5tMDMoKSxcclxuICAgICAgICAgIDAsIDEsIDAsIC10aGlzLm0xMygpLFxyXG4gICAgICAgICAgMCwgMCwgMSwgLXRoaXMubTIzKCksXHJcbiAgICAgICAgICAwLCAwLCAwLCAxLCBUeXBlcy5UUkFOU0xBVElPTl8zRCApO1xyXG4gICAgICBjYXNlIFR5cGVzLlNDQUxJTkc6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxyXG4gICAgICAgICAgMSAvIHRoaXMubTAwKCksIDAsIDAsIDAsXHJcbiAgICAgICAgICAwLCAxIC8gdGhpcy5tMTEoKSwgMCwgMCxcclxuICAgICAgICAgIDAsIDAsIDEgLyB0aGlzLm0yMigpLCAwLFxyXG4gICAgICAgICAgMCwgMCwgMCwgMSAvIHRoaXMubTMzKCksIFR5cGVzLlNDQUxJTkcgKTtcclxuICAgICAgY2FzZSBUeXBlcy5BRkZJTkU6XHJcbiAgICAgIGNhc2UgVHlwZXMuT1RIRVI6XHJcbiAgICAgICAgZGV0ID0gdGhpcy5nZXREZXRlcm1pbmFudCgpO1xyXG4gICAgICAgIGlmICggZGV0ICE9PSAwICkge1xyXG4gICAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxyXG4gICAgICAgICAgICAoIC10aGlzLm0zMSgpICogdGhpcy5tMjIoKSAqIHRoaXMubTEzKCkgKyB0aGlzLm0yMSgpICogdGhpcy5tMzIoKSAqIHRoaXMubTEzKCkgKyB0aGlzLm0zMSgpICogdGhpcy5tMTIoKSAqIHRoaXMubTIzKCkgLSB0aGlzLm0xMSgpICogdGhpcy5tMzIoKSAqIHRoaXMubTIzKCkgLSB0aGlzLm0yMSgpICogdGhpcy5tMTIoKSAqIHRoaXMubTMzKCkgKyB0aGlzLm0xMSgpICogdGhpcy5tMjIoKSAqIHRoaXMubTMzKCkgKSAvIGRldCxcclxuICAgICAgICAgICAgKCB0aGlzLm0zMSgpICogdGhpcy5tMjIoKSAqIHRoaXMubTAzKCkgLSB0aGlzLm0yMSgpICogdGhpcy5tMzIoKSAqIHRoaXMubTAzKCkgLSB0aGlzLm0zMSgpICogdGhpcy5tMDIoKSAqIHRoaXMubTIzKCkgKyB0aGlzLm0wMSgpICogdGhpcy5tMzIoKSAqIHRoaXMubTIzKCkgKyB0aGlzLm0yMSgpICogdGhpcy5tMDIoKSAqIHRoaXMubTMzKCkgLSB0aGlzLm0wMSgpICogdGhpcy5tMjIoKSAqIHRoaXMubTMzKCkgKSAvIGRldCxcclxuICAgICAgICAgICAgKCAtdGhpcy5tMzEoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0wMygpICsgdGhpcy5tMTEoKSAqIHRoaXMubTMyKCkgKiB0aGlzLm0wMygpICsgdGhpcy5tMzEoKSAqIHRoaXMubTAyKCkgKiB0aGlzLm0xMygpIC0gdGhpcy5tMDEoKSAqIHRoaXMubTMyKCkgKiB0aGlzLm0xMygpIC0gdGhpcy5tMTEoKSAqIHRoaXMubTAyKCkgKiB0aGlzLm0zMygpICsgdGhpcy5tMDEoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0zMygpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMjEoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0wMygpIC0gdGhpcy5tMTEoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0wMygpIC0gdGhpcy5tMjEoKSAqIHRoaXMubTAyKCkgKiB0aGlzLm0xMygpICsgdGhpcy5tMDEoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0xMygpICsgdGhpcy5tMTEoKSAqIHRoaXMubTAyKCkgKiB0aGlzLm0yMygpIC0gdGhpcy5tMDEoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0yMygpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMzAoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0xMygpIC0gdGhpcy5tMjAoKSAqIHRoaXMubTMyKCkgKiB0aGlzLm0xMygpIC0gdGhpcy5tMzAoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0yMygpICsgdGhpcy5tMTAoKSAqIHRoaXMubTMyKCkgKiB0aGlzLm0yMygpICsgdGhpcy5tMjAoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0zMygpIC0gdGhpcy5tMTAoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0zMygpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggLXRoaXMubTMwKCkgKiB0aGlzLm0yMigpICogdGhpcy5tMDMoKSArIHRoaXMubTIwKCkgKiB0aGlzLm0zMigpICogdGhpcy5tMDMoKSArIHRoaXMubTMwKCkgKiB0aGlzLm0wMigpICogdGhpcy5tMjMoKSAtIHRoaXMubTAwKCkgKiB0aGlzLm0zMigpICogdGhpcy5tMjMoKSAtIHRoaXMubTIwKCkgKiB0aGlzLm0wMigpICogdGhpcy5tMzMoKSArIHRoaXMubTAwKCkgKiB0aGlzLm0yMigpICogdGhpcy5tMzMoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIHRoaXMubTMwKCkgKiB0aGlzLm0xMigpICogdGhpcy5tMDMoKSAtIHRoaXMubTEwKCkgKiB0aGlzLm0zMigpICogdGhpcy5tMDMoKSAtIHRoaXMubTMwKCkgKiB0aGlzLm0wMigpICogdGhpcy5tMTMoKSArIHRoaXMubTAwKCkgKiB0aGlzLm0zMigpICogdGhpcy5tMTMoKSArIHRoaXMubTEwKCkgKiB0aGlzLm0wMigpICogdGhpcy5tMzMoKSAtIHRoaXMubTAwKCkgKiB0aGlzLm0xMigpICogdGhpcy5tMzMoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIC10aGlzLm0yMCgpICogdGhpcy5tMTIoKSAqIHRoaXMubTAzKCkgKyB0aGlzLm0xMCgpICogdGhpcy5tMjIoKSAqIHRoaXMubTAzKCkgKyB0aGlzLm0yMCgpICogdGhpcy5tMDIoKSAqIHRoaXMubTEzKCkgLSB0aGlzLm0wMCgpICogdGhpcy5tMjIoKSAqIHRoaXMubTEzKCkgLSB0aGlzLm0xMCgpICogdGhpcy5tMDIoKSAqIHRoaXMubTIzKCkgKyB0aGlzLm0wMCgpICogdGhpcy5tMTIoKSAqIHRoaXMubTIzKCkgKSAvIGRldCxcclxuICAgICAgICAgICAgKCAtdGhpcy5tMzAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0xMygpICsgdGhpcy5tMjAoKSAqIHRoaXMubTMxKCkgKiB0aGlzLm0xMygpICsgdGhpcy5tMzAoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0yMygpIC0gdGhpcy5tMTAoKSAqIHRoaXMubTMxKCkgKiB0aGlzLm0yMygpIC0gdGhpcy5tMjAoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0zMygpICsgdGhpcy5tMTAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0zMygpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMzAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0wMygpIC0gdGhpcy5tMjAoKSAqIHRoaXMubTMxKCkgKiB0aGlzLm0wMygpIC0gdGhpcy5tMzAoKSAqIHRoaXMubTAxKCkgKiB0aGlzLm0yMygpICsgdGhpcy5tMDAoKSAqIHRoaXMubTMxKCkgKiB0aGlzLm0yMygpICsgdGhpcy5tMjAoKSAqIHRoaXMubTAxKCkgKiB0aGlzLm0zMygpIC0gdGhpcy5tMDAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0zMygpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggLXRoaXMubTMwKCkgKiB0aGlzLm0xMSgpICogdGhpcy5tMDMoKSArIHRoaXMubTEwKCkgKiB0aGlzLm0zMSgpICogdGhpcy5tMDMoKSArIHRoaXMubTMwKCkgKiB0aGlzLm0wMSgpICogdGhpcy5tMTMoKSAtIHRoaXMubTAwKCkgKiB0aGlzLm0zMSgpICogdGhpcy5tMTMoKSAtIHRoaXMubTEwKCkgKiB0aGlzLm0wMSgpICogdGhpcy5tMzMoKSArIHRoaXMubTAwKCkgKiB0aGlzLm0xMSgpICogdGhpcy5tMzMoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIHRoaXMubTIwKCkgKiB0aGlzLm0xMSgpICogdGhpcy5tMDMoKSAtIHRoaXMubTEwKCkgKiB0aGlzLm0yMSgpICogdGhpcy5tMDMoKSAtIHRoaXMubTIwKCkgKiB0aGlzLm0wMSgpICogdGhpcy5tMTMoKSArIHRoaXMubTAwKCkgKiB0aGlzLm0yMSgpICogdGhpcy5tMTMoKSArIHRoaXMubTEwKCkgKiB0aGlzLm0wMSgpICogdGhpcy5tMjMoKSAtIHRoaXMubTAwKCkgKiB0aGlzLm0xMSgpICogdGhpcy5tMjMoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIHRoaXMubTMwKCkgKiB0aGlzLm0yMSgpICogdGhpcy5tMTIoKSAtIHRoaXMubTIwKCkgKiB0aGlzLm0zMSgpICogdGhpcy5tMTIoKSAtIHRoaXMubTMwKCkgKiB0aGlzLm0xMSgpICogdGhpcy5tMjIoKSArIHRoaXMubTEwKCkgKiB0aGlzLm0zMSgpICogdGhpcy5tMjIoKSArIHRoaXMubTIwKCkgKiB0aGlzLm0xMSgpICogdGhpcy5tMzIoKSAtIHRoaXMubTEwKCkgKiB0aGlzLm0yMSgpICogdGhpcy5tMzIoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIC10aGlzLm0zMCgpICogdGhpcy5tMjEoKSAqIHRoaXMubTAyKCkgKyB0aGlzLm0yMCgpICogdGhpcy5tMzEoKSAqIHRoaXMubTAyKCkgKyB0aGlzLm0zMCgpICogdGhpcy5tMDEoKSAqIHRoaXMubTIyKCkgLSB0aGlzLm0wMCgpICogdGhpcy5tMzEoKSAqIHRoaXMubTIyKCkgLSB0aGlzLm0yMCgpICogdGhpcy5tMDEoKSAqIHRoaXMubTMyKCkgKyB0aGlzLm0wMCgpICogdGhpcy5tMjEoKSAqIHRoaXMubTMyKCkgKSAvIGRldCxcclxuICAgICAgICAgICAgKCB0aGlzLm0zMCgpICogdGhpcy5tMTEoKSAqIHRoaXMubTAyKCkgLSB0aGlzLm0xMCgpICogdGhpcy5tMzEoKSAqIHRoaXMubTAyKCkgLSB0aGlzLm0zMCgpICogdGhpcy5tMDEoKSAqIHRoaXMubTEyKCkgKyB0aGlzLm0wMCgpICogdGhpcy5tMzEoKSAqIHRoaXMubTEyKCkgKyB0aGlzLm0xMCgpICogdGhpcy5tMDEoKSAqIHRoaXMubTMyKCkgLSB0aGlzLm0wMCgpICogdGhpcy5tMTEoKSAqIHRoaXMubTMyKCkgKSAvIGRldCxcclxuICAgICAgICAgICAgKCAtdGhpcy5tMjAoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0wMigpICsgdGhpcy5tMTAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0wMigpICsgdGhpcy5tMjAoKSAqIHRoaXMubTAxKCkgKiB0aGlzLm0xMigpIC0gdGhpcy5tMDAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0xMigpIC0gdGhpcy5tMTAoKSAqIHRoaXMubTAxKCkgKiB0aGlzLm0yMigpICsgdGhpcy5tMDAoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0yMigpICkgLyBkZXRcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnTWF0cml4IGNvdWxkIG5vdCBiZSBpbnZlcnRlZCwgZGV0ZXJtaW5hbnQgPT09IDAnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvciggYE1hdHJpeDQuaW52ZXJ0ZWQgd2l0aCB1bmtub3duIHR5cGU6ICR7dGhpcy50eXBlfWAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBtYXRyaXgsIGRlZmluZWQgYnkgdGhlIG11bHRpcGxpY2F0aW9uIG9mIHRoaXMgKiBtYXRyaXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXg0fSBtYXRyaXhcclxuICAgKiBAcmV0dXJucyB7TWF0cml4NH0gLSBOT1RFOiB0aGlzIG1heSBiZSB0aGUgc2FtZSBtYXRyaXghXHJcbiAgICovXHJcbiAgdGltZXNNYXRyaXgoIG1hdHJpeCApIHtcclxuICAgIC8vIEkgKiBNID09PSBNICogSSA9PT0gSSAodGhlIGlkZW50aXR5KVxyXG4gICAgaWYgKCB0aGlzLnR5cGUgPT09IFR5cGVzLklERU5USVRZIHx8IG1hdHJpeC50eXBlID09PSBUeXBlcy5JREVOVElUWSApIHtcclxuICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gVHlwZXMuSURFTlRJVFkgPyBtYXRyaXggOiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy50eXBlID09PSBtYXRyaXgudHlwZSApIHtcclxuICAgICAgLy8gY3VycmVudGx5IHR3byBtYXRyaWNlcyBvZiB0aGUgc2FtZSB0eXBlIHdpbGwgcmVzdWx0IGluIHRoZSBzYW1lIHJlc3VsdCB0eXBlXHJcbiAgICAgIGlmICggdGhpcy50eXBlID09PSBUeXBlcy5UUkFOU0xBVElPTl8zRCApIHtcclxuICAgICAgICAvLyBmYXN0ZXIgY29tYmluYXRpb24gb2YgdHJhbnNsYXRpb25zXHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxyXG4gICAgICAgICAgMSwgMCwgMCwgdGhpcy5tMDMoKSArIG1hdHJpeC5tMDIoKSxcclxuICAgICAgICAgIDAsIDEsIDAsIHRoaXMubTEzKCkgKyBtYXRyaXgubTEyKCksXHJcbiAgICAgICAgICAwLCAwLCAxLCB0aGlzLm0yMygpICsgbWF0cml4Lm0yMygpLFxyXG4gICAgICAgICAgMCwgMCwgMCwgMSwgVHlwZXMuVFJBTlNMQVRJT05fM0QgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy50eXBlID09PSBUeXBlcy5TQ0FMSU5HICkge1xyXG4gICAgICAgIC8vIGZhc3RlciBjb21iaW5hdGlvbiBvZiBzY2FsaW5nXHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxyXG4gICAgICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDAoKSwgMCwgMCwgMCxcclxuICAgICAgICAgIDAsIHRoaXMubTExKCkgKiBtYXRyaXgubTExKCksIDAsIDAsXHJcbiAgICAgICAgICAwLCAwLCB0aGlzLm0yMigpICogbWF0cml4Lm0yMigpLCAwLFxyXG4gICAgICAgICAgMCwgMCwgMCwgMSwgVHlwZXMuU0NBTElORyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLnR5cGUgIT09IFR5cGVzLk9USEVSICYmIG1hdHJpeC50eXBlICE9PSBUeXBlcy5PVEhFUiApIHtcclxuICAgICAgLy8gY3VycmVudGx5IHR3byBtYXRyaWNlcyB0aGF0IGFyZSBhbnl0aGluZyBidXQgXCJvdGhlclwiIGFyZSB0ZWNobmljYWxseSBhZmZpbmUsIGFuZCB0aGUgcmVzdWx0IHdpbGwgYmUgYWZmaW5lXHJcblxyXG4gICAgICAvLyBhZmZpbmUgY2FzZVxyXG4gICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXHJcbiAgICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDAoKSArIHRoaXMubTAxKCkgKiBtYXRyaXgubTEwKCkgKyB0aGlzLm0wMigpICogbWF0cml4Lm0yMCgpLFxyXG4gICAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAxKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMSgpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjEoKSxcclxuICAgICAgICB0aGlzLm0wMCgpICogbWF0cml4Lm0wMigpICsgdGhpcy5tMDEoKSAqIG1hdHJpeC5tMTIoKSArIHRoaXMubTAyKCkgKiBtYXRyaXgubTIyKCksXHJcbiAgICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDMoKSArIHRoaXMubTAxKCkgKiBtYXRyaXgubTEzKCkgKyB0aGlzLm0wMigpICogbWF0cml4Lm0yMygpICsgdGhpcy5tMDMoKSxcclxuICAgICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMCgpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTAoKSArIHRoaXMubTEyKCkgKiBtYXRyaXgubTIwKCksXHJcbiAgICAgICAgdGhpcy5tMTAoKSAqIG1hdHJpeC5tMDEoKSArIHRoaXMubTExKCkgKiBtYXRyaXgubTExKCkgKyB0aGlzLm0xMigpICogbWF0cml4Lm0yMSgpLFxyXG4gICAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMTIoKSAqIG1hdHJpeC5tMjIoKSxcclxuICAgICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMygpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTMoKSArIHRoaXMubTEyKCkgKiBtYXRyaXgubTIzKCkgKyB0aGlzLm0xMygpLFxyXG4gICAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMCgpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjAoKSxcclxuICAgICAgICB0aGlzLm0yMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMjEoKSAqIG1hdHJpeC5tMTEoKSArIHRoaXMubTIyKCkgKiBtYXRyaXgubTIxKCksXHJcbiAgICAgICAgdGhpcy5tMjAoKSAqIG1hdHJpeC5tMDIoKSArIHRoaXMubTIxKCkgKiBtYXRyaXgubTEyKCkgKyB0aGlzLm0yMigpICogbWF0cml4Lm0yMigpLFxyXG4gICAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAzKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMygpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjMoKSArIHRoaXMubTIzKCksXHJcbiAgICAgICAgMCwgMCwgMCwgMSwgVHlwZXMuQUZGSU5FICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ2VuZXJhbCBjYXNlXHJcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoXHJcbiAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMCgpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjAoKSArIHRoaXMubTAzKCkgKiBtYXRyaXgubTMwKCksXHJcbiAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAxKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMSgpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjEoKSArIHRoaXMubTAzKCkgKiBtYXRyaXgubTMxKCksXHJcbiAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjIoKSArIHRoaXMubTAzKCkgKiBtYXRyaXgubTMyKCksXHJcbiAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAzKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMygpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjMoKSArIHRoaXMubTAzKCkgKiBtYXRyaXgubTMzKCksXHJcbiAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMCgpICsgdGhpcy5tMTIoKSAqIG1hdHJpeC5tMjAoKSArIHRoaXMubTEzKCkgKiBtYXRyaXgubTMwKCksXHJcbiAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAxKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMSgpICsgdGhpcy5tMTIoKSAqIG1hdHJpeC5tMjEoKSArIHRoaXMubTEzKCkgKiBtYXRyaXgubTMxKCksXHJcbiAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMTIoKSAqIG1hdHJpeC5tMjIoKSArIHRoaXMubTEzKCkgKiBtYXRyaXgubTMyKCksXHJcbiAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAzKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMygpICsgdGhpcy5tMTIoKSAqIG1hdHJpeC5tMjMoKSArIHRoaXMubTEzKCkgKiBtYXRyaXgubTMzKCksXHJcbiAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMCgpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjAoKSArIHRoaXMubTIzKCkgKiBtYXRyaXgubTMwKCksXHJcbiAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAxKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMSgpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjEoKSArIHRoaXMubTIzKCkgKiBtYXRyaXgubTMxKCksXHJcbiAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjIoKSArIHRoaXMubTIzKCkgKiBtYXRyaXgubTMyKCksXHJcbiAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAzKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMygpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjMoKSArIHRoaXMubTIzKCkgKiBtYXRyaXgubTMzKCksXHJcbiAgICAgIHRoaXMubTMwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0zMSgpICogbWF0cml4Lm0xMCgpICsgdGhpcy5tMzIoKSAqIG1hdHJpeC5tMjAoKSArIHRoaXMubTMzKCkgKiBtYXRyaXgubTMwKCksXHJcbiAgICAgIHRoaXMubTMwKCkgKiBtYXRyaXgubTAxKCkgKyB0aGlzLm0zMSgpICogbWF0cml4Lm0xMSgpICsgdGhpcy5tMzIoKSAqIG1hdHJpeC5tMjEoKSArIHRoaXMubTMzKCkgKiBtYXRyaXgubTMxKCksXHJcbiAgICAgIHRoaXMubTMwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0zMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMzIoKSAqIG1hdHJpeC5tMjIoKSArIHRoaXMubTMzKCkgKiBtYXRyaXgubTMyKCksXHJcbiAgICAgIHRoaXMubTMwKCkgKiBtYXRyaXgubTAzKCkgKyB0aGlzLm0zMSgpICogbWF0cml4Lm0xMygpICsgdGhpcy5tMzIoKSAqIG1hdHJpeC5tMjMoKSArIHRoaXMubTMzKCkgKiBtYXRyaXgubTMzKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG11bHRpcGxpY2F0aW9uIG9mIHRoaXMgbWF0cml4IHRpbWVzIHRoZSBwcm92aWRlZCB2ZWN0b3JcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjR9IHZlY3RvcjRcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yNH1cclxuICAgKi9cclxuICB0aW1lc1ZlY3RvcjQoIHZlY3RvcjQgKSB7XHJcbiAgICBjb25zdCB4ID0gdGhpcy5tMDAoKSAqIHZlY3RvcjQueCArIHRoaXMubTAxKCkgKiB2ZWN0b3I0LnkgKyB0aGlzLm0wMigpICogdmVjdG9yNC56ICsgdGhpcy5tMDMoKSAqIHZlY3RvcjQudztcclxuICAgIGNvbnN0IHkgPSB0aGlzLm0xMCgpICogdmVjdG9yNC54ICsgdGhpcy5tMTEoKSAqIHZlY3RvcjQueSArIHRoaXMubTEyKCkgKiB2ZWN0b3I0LnogKyB0aGlzLm0xMygpICogdmVjdG9yNC53O1xyXG4gICAgY29uc3QgeiA9IHRoaXMubTIwKCkgKiB2ZWN0b3I0LnggKyB0aGlzLm0yMSgpICogdmVjdG9yNC55ICsgdGhpcy5tMjIoKSAqIHZlY3RvcjQueiArIHRoaXMubTIzKCkgKiB2ZWN0b3I0Lnc7XHJcbiAgICBjb25zdCB3ID0gdGhpcy5tMzAoKSAqIHZlY3RvcjQueCArIHRoaXMubTMxKCkgKiB2ZWN0b3I0LnkgKyB0aGlzLm0zMigpICogdmVjdG9yNC56ICsgdGhpcy5tMzMoKSAqIHZlY3RvcjQudztcclxuICAgIHJldHVybiBuZXcgVmVjdG9yNCggeCwgeSwgeiwgdyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbXVsdGlwbGljYXRpb24gb2YgdGhpcyBtYXRyaXggdGltZXMgdGhlIHByb3ZpZGVkIHZlY3RvciAodHJlYXRpbmcgdGhpcyBtYXRyaXggYXMgaG9tb2dlbmVvdXMsIHNvIHRoYXRcclxuICAgKiBpdCBpcyB0aGUgdGVjaG5pY2FsIG11bHRpcGxpY2F0aW9uIG9mICh4LHkseiwxKSkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2ZWN0b3IzXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XHJcbiAgICovXHJcbiAgdGltZXNWZWN0b3IzKCB2ZWN0b3IzICkge1xyXG4gICAgcmV0dXJuIHRoaXMudGltZXNWZWN0b3I0KCB2ZWN0b3IzLnRvVmVjdG9yNCgpICkudG9WZWN0b3IzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBtdWx0aXBsaWNhdGlvbiBvZiB0aGlzIG1hdHJpeCdzIHRyYW5zcG9zZSB0aW1lcyB0aGUgcHJvdmlkZWQgdmVjdG9yXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3I0fSB2ZWN0b3I0XHJcbiAgICogQHJldHVybnMge1ZlY3RvcjR9XHJcbiAgICovXHJcbiAgdGltZXNUcmFuc3Bvc2VWZWN0b3I0KCB2ZWN0b3I0ICkge1xyXG4gICAgY29uc3QgeCA9IHRoaXMubTAwKCkgKiB2ZWN0b3I0LnggKyB0aGlzLm0xMCgpICogdmVjdG9yNC55ICsgdGhpcy5tMjAoKSAqIHZlY3RvcjQueiArIHRoaXMubTMwKCkgKiB2ZWN0b3I0Lnc7XHJcbiAgICBjb25zdCB5ID0gdGhpcy5tMDEoKSAqIHZlY3RvcjQueCArIHRoaXMubTExKCkgKiB2ZWN0b3I0LnkgKyB0aGlzLm0yMSgpICogdmVjdG9yNC56ICsgdGhpcy5tMzEoKSAqIHZlY3RvcjQudztcclxuICAgIGNvbnN0IHogPSB0aGlzLm0wMigpICogdmVjdG9yNC54ICsgdGhpcy5tMTIoKSAqIHZlY3RvcjQueSArIHRoaXMubTIyKCkgKiB2ZWN0b3I0LnogKyB0aGlzLm0zMigpICogdmVjdG9yNC53O1xyXG4gICAgY29uc3QgdyA9IHRoaXMubTAzKCkgKiB2ZWN0b3I0LnggKyB0aGlzLm0xMygpICogdmVjdG9yNC55ICsgdGhpcy5tMjMoKSAqIHZlY3RvcjQueiArIHRoaXMubTMzKCkgKiB2ZWN0b3I0Lnc7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIHgsIHksIHosIHcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG11bHRpcGxpY2F0aW9uIG9mIHRoaXMgbWF0cml4J3MgdHJhbnNwb3NlIHRpbWVzIHRoZSBwcm92aWRlZCB2ZWN0b3IgKGhvbW9nZW5lb3VzKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IHZlY3RvcjNcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yM31cclxuICAgKi9cclxuICB0aW1lc1RyYW5zcG9zZVZlY3RvcjMoIHZlY3RvcjMgKSB7XHJcbiAgICByZXR1cm4gdGhpcy50aW1lc1RyYW5zcG9zZVZlY3RvcjQoIHZlY3RvcjMudG9WZWN0b3I0KCkgKS50b1ZlY3RvcjMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVxdWl2YWxlbnQgdG8gdGhlIG11bHRpcGxpY2F0aW9uIG9mICh4LHkseiwwKSwgaWdub3JpbmcgdGhlIGhvbW9nZW5lb3VzIHBhcnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2ZWN0b3IzXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XHJcbiAgICovXHJcbiAgdGltZXNSZWxhdGl2ZVZlY3RvcjMoIHZlY3RvcjMgKSB7XHJcbiAgICBjb25zdCB4ID0gdGhpcy5tMDAoKSAqIHZlY3RvcjMueCArIHRoaXMubTEwKCkgKiB2ZWN0b3IzLnkgKyB0aGlzLm0yMCgpICogdmVjdG9yMy56O1xyXG4gICAgY29uc3QgeSA9IHRoaXMubTAxKCkgKiB2ZWN0b3IzLnkgKyB0aGlzLm0xMSgpICogdmVjdG9yMy55ICsgdGhpcy5tMjEoKSAqIHZlY3RvcjMuejtcclxuICAgIGNvbnN0IHogPSB0aGlzLm0wMigpICogdmVjdG9yMy56ICsgdGhpcy5tMTIoKSAqIHZlY3RvcjMueSArIHRoaXMubTIyKCkgKiB2ZWN0b3IzLno7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIHgsIHksIHogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGRldGVybWluYW50IG9mIHRoaXMgbWF0cml4LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0RGV0ZXJtaW5hbnQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tMDMoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0yMSgpICogdGhpcy5tMzAoKSAtXHJcbiAgICAgICAgICAgdGhpcy5tMDIoKSAqIHRoaXMubTEzKCkgKiB0aGlzLm0yMSgpICogdGhpcy5tMzAoKSAtXHJcbiAgICAgICAgICAgdGhpcy5tMDMoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0yMigpICogdGhpcy5tMzAoKSArXHJcbiAgICAgICAgICAgdGhpcy5tMDEoKSAqIHRoaXMubTEzKCkgKiB0aGlzLm0yMigpICogdGhpcy5tMzAoKSArXHJcbiAgICAgICAgICAgdGhpcy5tMDIoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0yMygpICogdGhpcy5tMzAoKSAtXHJcbiAgICAgICAgICAgdGhpcy5tMDEoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0yMygpICogdGhpcy5tMzAoKSAtXHJcbiAgICAgICAgICAgdGhpcy5tMDMoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0yMCgpICogdGhpcy5tMzEoKSArXHJcbiAgICAgICAgICAgdGhpcy5tMDIoKSAqIHRoaXMubTEzKCkgKiB0aGlzLm0yMCgpICogdGhpcy5tMzEoKSArXHJcbiAgICAgICAgICAgdGhpcy5tMDMoKSAqIHRoaXMubTEwKCkgKiB0aGlzLm0yMigpICogdGhpcy5tMzEoKSAtXHJcbiAgICAgICAgICAgdGhpcy5tMDAoKSAqIHRoaXMubTEzKCkgKiB0aGlzLm0yMigpICogdGhpcy5tMzEoKSAtXHJcbiAgICAgICAgICAgdGhpcy5tMDIoKSAqIHRoaXMubTEwKCkgKiB0aGlzLm0yMygpICogdGhpcy5tMzEoKSArXHJcbiAgICAgICAgICAgdGhpcy5tMDAoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0yMygpICogdGhpcy5tMzEoKSArXHJcbiAgICAgICAgICAgdGhpcy5tMDMoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0yMCgpICogdGhpcy5tMzIoKSAtXHJcbiAgICAgICAgICAgdGhpcy5tMDEoKSAqIHRoaXMubTEzKCkgKiB0aGlzLm0yMCgpICogdGhpcy5tMzIoKSAtXHJcbiAgICAgICAgICAgdGhpcy5tMDMoKSAqIHRoaXMubTEwKCkgKiB0aGlzLm0yMSgpICogdGhpcy5tMzIoKSArXHJcbiAgICAgICAgICAgdGhpcy5tMDAoKSAqIHRoaXMubTEzKCkgKiB0aGlzLm0yMSgpICogdGhpcy5tMzIoKSArXHJcbiAgICAgICAgICAgdGhpcy5tMDEoKSAqIHRoaXMubTEwKCkgKiB0aGlzLm0yMygpICogdGhpcy5tMzIoKSAtXHJcbiAgICAgICAgICAgdGhpcy5tMDAoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0yMygpICogdGhpcy5tMzIoKSAtXHJcbiAgICAgICAgICAgdGhpcy5tMDIoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0yMCgpICogdGhpcy5tMzMoKSArXHJcbiAgICAgICAgICAgdGhpcy5tMDEoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0yMCgpICogdGhpcy5tMzMoKSArXHJcbiAgICAgICAgICAgdGhpcy5tMDIoKSAqIHRoaXMubTEwKCkgKiB0aGlzLm0yMSgpICogdGhpcy5tMzMoKSAtXHJcbiAgICAgICAgICAgdGhpcy5tMDAoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0yMSgpICogdGhpcy5tMzMoKSAtXHJcbiAgICAgICAgICAgdGhpcy5tMDEoKSAqIHRoaXMubTEwKCkgKiB0aGlzLm0yMigpICogdGhpcy5tMzMoKSArXHJcbiAgICAgICAgICAgdGhpcy5tMDAoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0yMigpICogdGhpcy5tMzMoKTtcclxuICB9XHJcblxyXG4gIGdldCBkZXRlcm1pbmFudCgpIHsgcmV0dXJuIHRoaXMuZ2V0RGV0ZXJtaW5hbnQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIGZvcm0gb2YgdGhpcyBvYmplY3RcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHRvU3RyaW5nKCkge1xyXG4gICAgcmV0dXJuIGAke3RoaXMubTAwKCl9ICR7dGhpcy5tMDEoKX0gJHt0aGlzLm0wMigpfSAke3RoaXMubTAzKCl9XFxuJHtcclxuICAgICAgdGhpcy5tMTAoKX0gJHt0aGlzLm0xMSgpfSAke3RoaXMubTEyKCl9ICR7dGhpcy5tMTMoKX1cXG4ke1xyXG4gICAgICB0aGlzLm0yMCgpfSAke3RoaXMubTIxKCl9ICR7dGhpcy5tMjIoKX0gJHt0aGlzLm0yMygpfVxcbiR7XHJcbiAgICAgIHRoaXMubTMwKCl9ICR7dGhpcy5tMzEoKX0gJHt0aGlzLm0zMigpfSAke3RoaXMubTMzKCl9YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1ha2VzIHRoaXMgbWF0cml4IGVmZmVjdGl2ZWx5IGltbXV0YWJsZSB0byB0aGUgbm9ybWFsIG1ldGhvZHMgKGV4Y2VwdCBkaXJlY3Qgc2V0dGVycz8pXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge01hdHJpeDN9IC0gU2VsZiByZWZlcmVuY2VcclxuICAgKi9cclxuICBtYWtlSW1tdXRhYmxlKCkge1xyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIHRoaXMucm93TWFqb3IgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQ2Fubm90IG1vZGlmeSBpbW11dGFibGUgbWF0cml4JyApO1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb3BpZXMgdGhlIGVudHJpZXMgb2YgdGhpcyBtYXRyaXggb3ZlciB0byBhbiBhcmJpdHJhcnkgYXJyYXkgKHR5cGVkIG9yIG5vcm1hbCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheXxGbG9hdDMyQXJyYXl8RmxvYXQ2NEFycmF5fSBhcnJheVxyXG4gICAqIEByZXR1cm5zIHtBcnJheXxGbG9hdDMyQXJyYXl8RmxvYXQ2NEFycmF5fSAtIFJldHVybmVkIGZvciBjaGFpbmluZ1xyXG4gICAqL1xyXG4gIGNvcHlUb0FycmF5KCBhcnJheSApIHtcclxuICAgIGFycmF5WyAwIF0gPSB0aGlzLm0wMCgpO1xyXG4gICAgYXJyYXlbIDEgXSA9IHRoaXMubTEwKCk7XHJcbiAgICBhcnJheVsgMiBdID0gdGhpcy5tMjAoKTtcclxuICAgIGFycmF5WyAzIF0gPSB0aGlzLm0zMCgpO1xyXG4gICAgYXJyYXlbIDQgXSA9IHRoaXMubTAxKCk7XHJcbiAgICBhcnJheVsgNSBdID0gdGhpcy5tMTEoKTtcclxuICAgIGFycmF5WyA2IF0gPSB0aGlzLm0yMSgpO1xyXG4gICAgYXJyYXlbIDcgXSA9IHRoaXMubTMxKCk7XHJcbiAgICBhcnJheVsgOCBdID0gdGhpcy5tMDIoKTtcclxuICAgIGFycmF5WyA5IF0gPSB0aGlzLm0xMigpO1xyXG4gICAgYXJyYXlbIDEwIF0gPSB0aGlzLm0yMigpO1xyXG4gICAgYXJyYXlbIDExIF0gPSB0aGlzLm0zMigpO1xyXG4gICAgYXJyYXlbIDEyIF0gPSB0aGlzLm0wMygpO1xyXG4gICAgYXJyYXlbIDEzIF0gPSB0aGlzLm0xMygpO1xyXG4gICAgYXJyYXlbIDE0IF0gPSB0aGlzLm0yMygpO1xyXG4gICAgYXJyYXlbIDE1IF0gPSB0aGlzLm0zMygpO1xyXG4gICAgcmV0dXJuIGFycmF5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBpZGVudGl0eSBtYXRyaXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge01hdHJpeDR9XHJcbiAgICovXHJcbiAgc3RhdGljIGlkZW50aXR5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxyXG4gICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAwLCAwLCAwLCAxLFxyXG4gICAgICBUeXBlcy5JREVOVElUWSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHRyYW5zbGF0aW9uIG1hdHJpeC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcclxuICAgKiBAcmV0dXJucyB7TWF0cml4NH1cclxuICAgKi9cclxuICBzdGF0aWMgdHJhbnNsYXRpb24oIHgsIHksIHogKSB7XHJcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoXHJcbiAgICAgIDEsIDAsIDAsIHgsXHJcbiAgICAgIDAsIDEsIDAsIHksXHJcbiAgICAgIDAsIDAsIDEsIHosXHJcbiAgICAgIDAsIDAsIDAsIDEsXHJcbiAgICAgIFR5cGVzLlRSQU5TTEFUSU9OXzNEICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdHJhbnNsYXRpb24gbWF0cml4IGNvbXB1dGVkIGZyb20gYSB2ZWN0b3IuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IzfFZlY3RvcjR9IHZlY3RvclxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXg0fVxyXG4gICAqL1xyXG4gIHN0YXRpYyB0cmFuc2xhdGlvbkZyb21WZWN0b3IoIHZlY3RvciApIHtcclxuICAgIHJldHVybiBNYXRyaXg0LnRyYW5zbGF0aW9uKCB2ZWN0b3IueCwgdmVjdG9yLnksIHZlY3Rvci56ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbWF0cml4IHRoYXQgc2NhbGVzIHRoaW5ncyBpbiBlYWNoIGRpbWVuc2lvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcclxuICAgKiBAcmV0dXJucyB7TWF0cml4NH1cclxuICAgKi9cclxuICBzdGF0aWMgc2NhbGluZyggeCwgeSwgeiApIHtcclxuICAgIC8vIGFsbG93IHVzaW5nIG9uZSBwYXJhbWV0ZXIgdG8gc2NhbGUgZXZlcnl0aGluZ1xyXG4gICAgeSA9IHkgPT09IHVuZGVmaW5lZCA/IHggOiB5O1xyXG4gICAgeiA9IHogPT09IHVuZGVmaW5lZCA/IHggOiB6O1xyXG5cclxuICAgIHJldHVybiBuZXcgTWF0cml4NChcclxuICAgICAgeCwgMCwgMCwgMCxcclxuICAgICAgMCwgeSwgMCwgMCxcclxuICAgICAgMCwgMCwgeiwgMCxcclxuICAgICAgMCwgMCwgMCwgMSxcclxuICAgICAgVHlwZXMuU0NBTElORyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGhvbW9nZW5lb3VzIG1hdHJpeCByb3RhdGlvbiBkZWZpbmVkIGJ5IGEgcm90YXRpb24gb2YgdGhlIHNwZWNpZmllZCBhbmdsZSBhcm91bmQgdGhlIGdpdmVuIHVuaXQgYXhpcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IGF4aXMgLSBub3JtYWxpemVkXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gaW4gcmFkaWFuc1xyXG4gICAqIEByZXR1cm5zIHtNYXRyaXg0fVxyXG4gICAqL1xyXG4gIHN0YXRpYyByb3RhdGlvbkF4aXNBbmdsZSggYXhpcywgYW5nbGUgKSB7XHJcbiAgICBjb25zdCBjID0gTWF0aC5jb3MoIGFuZ2xlICk7XHJcbiAgICBjb25zdCBzID0gTWF0aC5zaW4oIGFuZ2xlICk7XHJcbiAgICBjb25zdCBDID0gMSAtIGM7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxyXG4gICAgICBheGlzLnggKiBheGlzLnggKiBDICsgYywgYXhpcy54ICogYXhpcy55ICogQyAtIGF4aXMueiAqIHMsIGF4aXMueCAqIGF4aXMueiAqIEMgKyBheGlzLnkgKiBzLCAwLFxyXG4gICAgICBheGlzLnkgKiBheGlzLnggKiBDICsgYXhpcy56ICogcywgYXhpcy55ICogYXhpcy55ICogQyArIGMsIGF4aXMueSAqIGF4aXMueiAqIEMgLSBheGlzLnggKiBzLCAwLFxyXG4gICAgICBheGlzLnogKiBheGlzLnggKiBDIC0gYXhpcy55ICogcywgYXhpcy56ICogYXhpcy55ICogQyArIGF4aXMueCAqIHMsIGF4aXMueiAqIGF4aXMueiAqIEMgKyBjLCAwLFxyXG4gICAgICAwLCAwLCAwLCAxLFxyXG4gICAgICBUeXBlcy5BRkZJTkUgKTtcclxuICB9XHJcblxyXG4gIC8vIFRPRE86IGFkZCBpbiByb3RhdGlvbiBmcm9tIHF1YXRlcm5pb24sIGFuZCBmcm9tIHF1YXQgKyB0cmFuc2xhdGlvblxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHJvdGF0aW9uIG1hdHJpeCBpbiB0aGUgeXogcGxhbmUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gaW4gcmFkaWFuc1xyXG4gICAqIEByZXR1cm5zIHtNYXRyaXg0fVxyXG4gICAqL1xyXG4gIHN0YXRpYyByb3RhdGlvblgoIGFuZ2xlICkge1xyXG4gICAgY29uc3QgYyA9IE1hdGguY29zKCBhbmdsZSApO1xyXG4gICAgY29uc3QgcyA9IE1hdGguc2luKCBhbmdsZSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgTWF0cml4NChcclxuICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgMCwgYywgLXMsIDAsXHJcbiAgICAgIDAsIHMsIGMsIDAsXHJcbiAgICAgIDAsIDAsIDAsIDEsXHJcbiAgICAgIFR5cGVzLkFGRklORSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHJvdGF0aW9uIG1hdHJpeCBpbiB0aGUgeHogcGxhbmUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gaW4gcmFkaWFuc1xyXG4gICAqIEByZXR1cm5zIHtNYXRyaXg0fVxyXG4gICAqL1xyXG4gIHN0YXRpYyByb3RhdGlvblkoIGFuZ2xlICkge1xyXG4gICAgY29uc3QgYyA9IE1hdGguY29zKCBhbmdsZSApO1xyXG4gICAgY29uc3QgcyA9IE1hdGguc2luKCBhbmdsZSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgTWF0cml4NChcclxuICAgICAgYywgMCwgcywgMCxcclxuICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgLXMsIDAsIGMsIDAsXHJcbiAgICAgIDAsIDAsIDAsIDEsXHJcbiAgICAgIFR5cGVzLkFGRklORSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHJvdGF0aW9uIG1hdHJpeCBpbiB0aGUgeHkgcGxhbmUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gaW4gcmFkaWFuc1xyXG4gICAqIEByZXR1cm5zIHtNYXRyaXg0fVxyXG4gICAqL1xyXG4gIHN0YXRpYyByb3RhdGlvblooIGFuZ2xlICkge1xyXG4gICAgY29uc3QgYyA9IE1hdGguY29zKCBhbmdsZSApO1xyXG4gICAgY29uc3QgcyA9IE1hdGguc2luKCBhbmdsZSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgTWF0cml4NChcclxuICAgICAgYywgLXMsIDAsIDAsXHJcbiAgICAgIHMsIGMsIDAsIDAsXHJcbiAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgIDAsIDAsIDAsIDEsXHJcbiAgICAgIFR5cGVzLkFGRklORSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3BlY2lmaWMgcGVyc3BlY3RpdmUgbWF0cml4IG5lZWRlZCBmb3IgY2VydGFpbiBXZWJHTCBjb250ZXh0cy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZm92WVJhZGlhbnNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IC0gYXNwZWN0ID09PSB3aWR0aCAvIGhlaWdodFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB6TmVhclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB6RmFyXHJcbiAgICogQHJldHVybnMge01hdHJpeDR9XHJcbiAgICovXHJcbiAgc3RhdGljIGdsdVBlcnNwZWN0aXZlKCBmb3ZZUmFkaWFucywgYXNwZWN0LCB6TmVhciwgekZhciApIHtcclxuICAgIGNvbnN0IGNvdGFuZ2VudCA9IE1hdGguY29zKCBmb3ZZUmFkaWFucyApIC8gTWF0aC5zaW4oIGZvdllSYWRpYW5zICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxyXG4gICAgICBjb3RhbmdlbnQgLyBhc3BlY3QsIDAsIDAsIDAsXHJcbiAgICAgIDAsIGNvdGFuZ2VudCwgMCwgMCxcclxuICAgICAgMCwgMCwgKCB6RmFyICsgek5lYXIgKSAvICggek5lYXIgLSB6RmFyICksICggMiAqIHpGYXIgKiB6TmVhciApIC8gKCB6TmVhciAtIHpGYXIgKSxcclxuICAgICAgMCwgMCwgLTEsIDAgKTtcclxuICB9XHJcbn1cclxuXHJcbmRvdC5yZWdpc3RlciggJ01hdHJpeDQnLCBNYXRyaXg0ICk7XHJcblxyXG5jb25zdCBUeXBlcyA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFtcclxuICAnT1RIRVInLFxyXG4gICdJREVOVElUWScsXHJcbiAgJ1RSQU5TTEFUSU9OXzNEJyxcclxuICAnU0NBTElORycsXHJcbiAgJ0FGRklORSdcclxuXSApO1xyXG5cclxuLy8gQHB1YmxpYyB7RW51bWVyYXRpb25EZXByZWNhdGVkfVxyXG5NYXRyaXg0LlR5cGVzID0gVHlwZXM7XHJcblxyXG4vLyBAcHVibGljIHtNYXRyaXg0fVxyXG5NYXRyaXg0LklERU5USVRZID0gbmV3IE1hdHJpeDQoKS5tYWtlSW1tdXRhYmxlKCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYXRyaXg0OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSw2Q0FBNkM7QUFDL0UsT0FBT0MsR0FBRyxNQUFNLFVBQVU7QUFDMUIsT0FBT0MsT0FBTyxNQUFNLGNBQWM7QUFDbEMsT0FBT0MsT0FBTyxNQUFNLGNBQWM7QUFFbEMsTUFBTUMsWUFBWSxHQUFHQyxNQUFNLENBQUNELFlBQVksSUFBSUUsS0FBSztBQUVqRCxNQUFNQyxPQUFPLENBQUM7RUFDWjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxHQUFHLEVBQUVDLEdBQUcsRUFBRUMsR0FBRyxFQUFFQyxHQUFHLEVBQUVDLEdBQUcsRUFBRUMsR0FBRyxFQUFFQyxHQUFHLEVBQUVDLEdBQUcsRUFBRUMsR0FBRyxFQUFF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Q0FDaEIsSUFBSSxDQUFDNEIsR0FBRyxDQUFDLENBQUMsR0FBR0QsTUFBTSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBR0YsTUFBTSxDQUFDRSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBR0gsTUFBTSxDQUFDRyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBR0osTUFBTSxDQUFDSSxHQUFHLENBQUMsQ0FBQyxFQUMxRyxJQUFJLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEdBQUdMLE1BQU0sQ0FBQ0ssR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEdBQUdOLE1BQU0sQ0FBQ00sR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEdBQUdQLE1BQU0sQ0FBQ08sR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEdBQUdSLE1BQU0sQ0FBQ1EsR0FBRyxDQUFDLENBQUMsRUFDMUcsSUFBSSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHVCxNQUFNLENBQUNTLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHVixNQUFNLENBQUNVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHWCxNQUFNLENBQUNXLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHWixNQUFNLENBQUNZLEdBQUcsQ0FBQyxDQUFDLEVBQzFHLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBR2IsTUFBTSxDQUFDYSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBR2QsTUFBTSxDQUFDYyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FB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QUFJLENBQUNTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0YsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1YsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxJQUFLaUMsR0FBRyxFQUNsUCxDQUFFLElBQUksQ0FBQ25DLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDWCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNWLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDYSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNGLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ2EsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNkLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsSUFBS2lDLEdBQUcsRUFDalAsQ0FBRSxDQUFDLElBQUksQ0FBQ25DLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDWCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNOLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDYSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNGLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ2EsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNkLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1MsR0FBRyxDQUFDLENBQUMsSUFBS2lDLEdBQUcsRUFDbFAsQ0FBRSxJQUFJLENBQUN2QyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNQLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDVixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLElBQUtxQyxHQUFHLEVBQ2pQLENBQUUsSUFBSSxDQUFDcEMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNGLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNOLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNGLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxJQUFLaUMsR0FBRyxFQUNqUCxDQUFFLENBQUMsSUFBSSxDQUFDcEMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNGLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDWCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNWLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNjLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNOLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDYSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ2YsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxJQUFLaUMsR0FBRyxFQUNsUCxDQUFFLElBQUksQ0FBQ3BDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDVSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDVixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNQLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDYyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ2EsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNmLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1MsR0FBRyxDQUFDLENBQUMsSUFBS2lDLEdBQUcsRUFDalAsQ0FBRSxDQUFDLElBQUksQ0FBQ3hDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNQLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDVSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsSUFBS3FDLEdBQUcsRUFDbFAsQ0FBRSxDQUFDLElBQUksQ0FBQ3BDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0YsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ04sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ00sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNQLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0YsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1UsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ00sR0FBRyxDQUFDLENBQUMsSUFBS2lDLEdBQUcsRUFDbFAsQ0FBRSxJQUFJLENBQUNwQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNOLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNWLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDWCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ2EsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNGLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNjLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDZixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNNLEdBQUcsQ0FBQyxDQUFDLElBQUtpQyxHQUFHLEVBQ2pQLENBQUUsQ0FBQyxJQUFJLENBQUNwQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNGLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNWLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ2EsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNOLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNjLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDZixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNVLEdBQUcsQ0FBQyxDQUFDLElBQUtpQyxHQUFHLEVBQ2xQLENBQUUsSUFBSSxDQUFDeEMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNQLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDVSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTSxHQUFHLENBQUMsQ0FBQyxJQUFLcUMsR0FBRyxFQUNqUCxDQUFFLElBQUksQ0FBQ3BDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNOLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNGLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNWLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsSUFBS2tDLEdBQUcsRUFDalAsQ0FBRSxDQUFDLElBQUksQ0FBQ3BDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDWCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNWLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDYSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNGLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ2EsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNkLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsSUFBS2tDLEdBQUcsRUFDbFAsQ0FBRSxJQUFJLENBQUNwQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDVSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTixHQUFHLENBQUMsQ0FB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QUFHRixNQUFNLENBQUNPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSixHQUFHLENBQUMsQ0FBQyxHQUFHSCxNQUFNLENBQUNXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUCxHQUFHLENBQUMsQ0FBQyxHQUFHSixNQUFNLENBQUNlLEdBQUcsQ0FBQyxDQUFDLEVBQzdHLElBQUksQ0FBQ2QsR0FBRyxDQUFDLENBQUMsR0FBR0QsTUFBTSxDQUFDSSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0YsR0FBRyxDQUFDLENBQUMsR0FBR0YsTUFBTSxDQUFDUSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0wsR0FBRyxDQUFDLENBQUMsR0FBR0gsTUFBTSxDQUFDWSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1IsR0FBRyxDQUFDLENBQUMsR0FBR0osTUFBTSxDQUFDZ0IsR0FBRyxDQUFDLENBQUMsRUFDN0csSUFBSSxDQUFDWCxHQUFHLENBQUMsQ0FBQyxHQUFHTCxNQUFNLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxHQUFHTixNQUFNLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRSxHQUFHLENBQUMsQ0FBQyxHQUFHUCxNQUFNLENBQUNTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRCxHQUFHLENBQUMsQ0FBQyxHQUFHUixNQUFNLENBQUNhLEdBQUcsQ0FBQyxDQUFDLEVBQzdHLElBQUksQ0FBQ1IsR0FBRyxDQUFDLENBQUMsR0FBR0wsTUFBTSxDQUFDRSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ksR0FBRyxDQUFDLENBQUMsR0FBR04sTUFBTSxDQUFDTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBR1AsTUFBTSxDQUFDVSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0YsR0FBRyxDQUFDLENBQUMsR0FBR1IsTUFBTSxDQUFDYyxHQUFHLENBQUMsQ0FBQyxFQUM3RyxJQUFJLENBQUNULEdBQUcsQ0FBQyxDQUFDLEdBQUdMLE1BQU0sQ0FBQ0csR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNHLEdBQUcsQ0FBQyxDQUFDLEdBQUdOLE1BQU0sQ0FBQ08sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNBLEdBQUcsQ0FBQyxDQUFDLEdBQUdQLE1BQU0sQ0FBQ1csR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUdSLE1BQU0sQ0FBQ2UsR0FBRyxDQUFDLENBQUMsRUFDN0csSUFBSSxDQUFDVixHQUFHLENBQUMsQ0FBQyxHQUFHTCxNQUFNLENBQUNJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRSxHQUFHLENBQUMsQ0FBQyxHQUFHTixNQUFNLENBQUNRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRCxHQUFHLENBQUMsQ0FBQyxHQUFHUCxNQUFNLENBQUNZLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSixHQUFHLENBQUMsQ0FBQyxHQUFHUixNQUFNLENBQUNnQixHQUFHLENBQUMsQ0FBQyxFQUM3RyxJQUFJLENBQUNQLEdBQUcsQ0FBQyxDQUFDLEdBQUdULE1BQU0sQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNTLEdBQUcsQ0FBQyxDQUFDLEdBQUdWLE1BQU0sQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNNLEdBQUcsQ0FBQyxDQUFDLEdBQUdYLE1BQU0sQ0FBQ1MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNHLEdBQUcsQ0FBQyxDQUFDLEdBQUdaLE1BQU0sQ0FBQ2EsR0FBRyxDQUFDLENBQUMsRUFDN0csSUFBSSxDQUFDSixHQUFHLENBQUMsQ0FBQyxHQUFHVCxNQUFNLENBQUNFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUSxHQUFHLENBQUMsQ0FBQyxHQUFHVixNQUFNLENBQUNNLEdBQUcsQ0FBQyxD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QyxDQUFDLEdBQ2pELElBQUksQ0FBQ1YsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FDakQsSUFBSSxDQUFDWCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUNqRCxJQUFJLENBQUNULEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0UsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQ2pELElBQUksQ0FBQ1gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FDakQsSUFBSSxDQUFDVixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRyxHQUFHLENBQUMsQ0FBQyxHQUNqRCxJQUFJLENBQUNiLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0csR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNHLEdBQUcsQ0FBQyxDQUFDLEdBQ2pELElBQUksQ0FBQ1gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0UsR0FBRyxDQUFDLENBQUMsR0FDakQsSUFBSSxDQUFDYixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ00sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRSxHQUFHLENBQUMsQ0FBQyxHQUNqRCxJQUFJLENBQUNWLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0csR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNNLEdBQUcsQ0FBQyxDQUFDLEdBQ2pELElBQUksQ0FBQ2IsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ00sR0FBRyxDQUFDLENBQUMsR0FDakQsSUFBSSxDQUFDWCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxHQUNqRCxJQUFJLENBQUNkLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0UsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEdBQ2pELElBQUksQ0FBQ2IsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0csR0FBRyxDQUFDLENBQUMsR0FDakQsSUFBSSxDQUFDZCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDRyxHQUFHLENBQUMsQ0FBQyxHQUNqRCxJQUFJLENBQUNaLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxD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