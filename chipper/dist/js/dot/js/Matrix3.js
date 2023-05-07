// Copyright 2013-2023, University of Colorado Boulder

/**
 * 3-dimensional Matrix
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationIO from '../../tandem/js/types/EnumerationIO.js';
import ArrayIO from '../../tandem/js/types/ArrayIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import dot from './dot.js';
import Matrix4 from './Matrix4.js';
import toSVGNumber from './toSVGNumber.js';
import Vector2 from './Vector2.js';
import Vector3 from './Vector3.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../phet-core/js/Enumeration.js';
import Pool from '../../phet-core/js/Pool.js';
export class Matrix3Type extends EnumerationValue {
  static OTHER = new Matrix3Type();
  static IDENTITY = new Matrix3Type();
  static TRANSLATION_2D = new Matrix3Type();
  static SCALING = new Matrix3Type();
  static AFFINE = new Matrix3Type();
  static enumeration = new Enumeration(Matrix3Type);
}
export default class Matrix3 {
  // Entries stored in column-major format

  /**
   * Creates an identity matrix, that can then be mutated into the proper form.
   */
  constructor() {
    //Make sure no clients are expecting to create a matrix with non-identity values
    assert && assert(arguments.length === 0, 'Matrix3 constructor should not be called with any arguments.  Use m3()/Matrix3.identity()/etc.');
    this.entries = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    this.type = Matrix3Type.IDENTITY;
  }
  initialize() {
    return this;
  }

  /**
   * Convenience getter for the individual 0,0 entry of the matrix.
   */
  m00() {
    return this.entries[0];
  }

  /**
   * Convenience getter for the individual 0,1 entry of the matrix.
   */
  m01() {
    return this.entries[3];
  }

  /**
   * Convenience getter for the individual 0,2 entry of the matrix.
   */
  m02() {
    return this.entries[6];
  }

  /**
   * Convenience getter for the individual 1,0 entry of the matrix.
   */
  m10() {
    return this.entries[1];
  }

  /**
   * Convenience getter for the individual 1,1 entry of the matrix.
   */
  m11() {
    return this.entries[4];
  }

  /**
   * Convenience getter for the individual 1,2 entry of the matrix.
   */
  m12() {
    return this.entries[7];
  }

  /**
   * Convenience getter for the individual 2,0 entry of the matrix.
   */
  m20() {
    return this.entries[2];
  }

  /**
   * Convenience getter for the individual 2,1 entry of the matrix.
   */
  m21() {
    return this.entries[5];
  }

  /**
   * Convenience getter for the individual 2,2 entry of the matrix.
   */
  m22() {
    return this.entries[8];
  }

  /**
   * Returns whether this matrix is an identity matrix.
   */
  isIdentity() {
    return this.type === Matrix3Type.IDENTITY || this.equals(Matrix3.IDENTITY);
  }

  /**
   * Returns whether this matrix is likely to be an identity matrix (returning false means "inconclusive, may be
   * identity or not"), but true is guaranteed to be an identity matrix.
   */
  isFastIdentity() {
    return this.type === Matrix3Type.IDENTITY;
  }

  /**
   * Returns whether this matrix is a translation matrix.
   * By this we mean it has no shear, rotation, or scaling
   * It may be a translation of zero.
   */
  isTranslation() {
    return this.type === Matrix3Type.TRANSLATION_2D || this.m00() === 1 && this.m11() === 1 && this.m22() === 1 && this.m01() === 0 && this.m10() === 0 && this.m20() === 0 && this.m21() === 0;
  }

  /**
   * Returns whether this matrix is an affine matrix (e.g. no shear).
   */
  isAffine() {
    return this.type === Matrix3Type.AFFINE || this.m20() === 0 && this.m21() === 0 && this.m22() === 1;
  }

  /**
   * Returns whether it's an affine matrix where the components of transforms are independent, i.e. constructed from
   * arbitrary component scaling and translation.
   */
  isAligned() {
    // non-diagonal non-translation entries should all be zero.
    return this.isAffine() && this.m01() === 0 && this.m10() === 0;
  }

  /**
   * Returns if it's an affine matrix where the components of transforms are independent, but may be switched (unlike isAligned)
   *
   * i.e. the 2x2 rotational sub-matrix is of one of the two forms:
   * A 0  or  0  A
   * 0 B      B  0
   * This means that moving a transformed point by (x,0) or (0,y) will result in a motion along one of the axes.
   */
  isAxisAligned() {
    return this.isAffine() && (this.m01() === 0 && this.m10() === 0 || this.m00() === 0 && this.m11() === 0);
  }

  /**
   * Returns whether every single entry in this matrix is a finite number (non-NaN, non-infinite).
   */
  isFinite() {
    return isFinite(this.m00()) && isFinite(this.m01()) && isFinite(this.m02()) && isFinite(this.m10()) && isFinite(this.m11()) && isFinite(this.m12()) && isFinite(this.m20()) && isFinite(this.m21()) && isFinite(this.m22());
  }

  /**
   * Returns the determinant of this matrix.
   */
  getDeterminant() {
    return this.m00() * this.m11() * this.m22() + this.m01() * this.m12() * this.m20() + this.m02() * this.m10() * this.m21() - this.m02() * this.m11() * this.m20() - this.m01() * this.m10() * this.m22() - this.m00() * this.m12() * this.m21();
  }
  get determinant() {
    return this.getDeterminant();
  }

  /**
   * Returns the 2D translation, assuming multiplication with a homogeneous vector
   */
  getTranslation() {
    return new Vector2(this.m02(), this.m12());
  }
  get translation() {
    return this.getTranslation();
  }

  /**
   * Returns a vector that is equivalent to ( T(1,0).magnitude(), T(0,1).magnitude() ) where T is a relative transform
   */
  getScaleVector() {
    return new Vector2(Math.sqrt(this.m00() * this.m00() + this.m10() * this.m10()), Math.sqrt(this.m01() * this.m01() + this.m11() * this.m11()));
  }
  get scaleVector() {
    return this.getScaleVector();
  }

  /**
   * Returns the angle in radians for the 2d rotation from this matrix, between pi, -pi
   */
  getRotation() {
    return Math.atan2(this.m10(), this.m00());
  }
  get rotation() {
    return this.getRotation();
  }

  /**
   * Returns an identity-padded copy of this matrix with an increased dimension.
   */
  toMatrix4() {
    return new Matrix4(this.m00(), this.m01(), this.m02(), 0, this.m10(), this.m11(), this.m12(), 0, this.m20(), this.m21(), this.m22(), 0, 0, 0, 0, 1);
  }

  /**
   * Returns an identity-padded copy of this matrix with an increased dimension, treating this matrix's affine
   * components only.
   */
  toAffineMatrix4() {
    return new Matrix4(this.m00(), this.m01(), 0, this.m02(), this.m10(), this.m11(), 0, this.m12(), 0, 0, 1, 0, 0, 0, 0, 1);
  }

  /**
   * Returns a string form of this object
   */
  toString() {
    return `${this.m00()} ${this.m01()} ${this.m02()}\n${this.m10()} ${this.m11()} ${this.m12()}\n${this.m20()} ${this.m21()} ${this.m22()}`;
  }

  /**
   * Creates an SVG form of this matrix, for high-performance processing in SVG output.
   */
  toSVGMatrix() {
    const result = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGMatrix();

    // top two rows
    result.a = this.m00();
    result.b = this.m10();
    result.c = this.m01();
    result.d = this.m11();
    result.e = this.m02();
    result.f = this.m12();
    return result;
  }

  /**
   * Returns the CSS form (simplified if possible) for this transformation matrix.
   */
  getCSSTransform() {
    // See http://www.w3.org/TR/css3-transforms/, particularly Section 13 that discusses the SVG compatibility

    // We need to prevent the numbers from being in an exponential toString form, since the CSS transform does not support that
    // 20 is the largest guaranteed number of digits according to https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toFixed
    // See https://github.com/phetsims/dot/issues/36

    // the inner part of a CSS3 transform, but remember to add the browser-specific parts!
    // NOTE: the toFixed calls are inlined for performance reasons
    return `matrix(${this.entries[0].toFixed(20)},${this.entries[1].toFixed(20)},${this.entries[3].toFixed(20)},${this.entries[4].toFixed(20)},${this.entries[6].toFixed(20)},${this.entries[7].toFixed(20)})`; // eslint-disable-line bad-sim-text
  }

  get cssTransform() {
    return this.getCSSTransform();
  }

  /**
   * Returns the CSS-like SVG matrix form for this transformation matrix.
   */
  getSVGTransform() {
    // SVG transform presentation attribute. See http://www.w3.org/TR/SVG/coords.html#TransformAttribute
    switch (this.type) {
      case Matrix3Type.IDENTITY:
        return '';
      case Matrix3Type.TRANSLATION_2D:
        return `translate(${toSVGNumber(this.entries[6])},${toSVGNumber(this.entries[7])})`;
      case Matrix3Type.SCALING:
        return `scale(${toSVGNumber(this.entries[0])}${this.entries[0] === this.entries[4] ? '' : `,${toSVGNumber(this.entries[4])}`})`;
      default:
        return `matrix(${toSVGNumber(this.entries[0])},${toSVGNumber(this.entries[1])},${toSVGNumber(this.entries[3])},${toSVGNumber(this.entries[4])},${toSVGNumber(this.entries[6])},${toSVGNumber(this.entries[7])})`;
    }
  }
  get svgTransform() {
    return this.getSVGTransform();
  }

  /**
   * Returns a parameter object suitable for use with jQuery's .css()
   */
  getCSSTransformStyles() {
    const transformCSS = this.getCSSTransform();

    // notes on triggering hardware acceleration: http://creativejs.com/2011/12/day-2-gpu-accelerate-your-dom-elements/
    return {
      // force iOS hardware acceleration
      '-webkit-perspective': '1000',
      '-webkit-backface-visibility': 'hidden',
      '-webkit-transform': `${transformCSS} translateZ(0)`,
      // trigger hardware acceleration if possible
      '-moz-transform': `${transformCSS} translateZ(0)`,
      // trigger hardware acceleration if possible
      '-ms-transform': transformCSS,
      '-o-transform': transformCSS,
      transform: transformCSS,
      'transform-origin': 'top left',
      // at the origin of the component. consider 0px 0px instead. Critical, since otherwise this defaults to 50% 50%!!! see https://developer.mozilla.org/en-US/docs/CSS/transform-origin
      '-ms-transform-origin': 'top left' // TODO: do we need other platform-specific transform-origin styles?
    };
  }

  get cssTransformStyles() {
    return this.getCSSTransformStyles();
  }

  /**
   * Returns exact equality with another matrix
   */
  equals(matrix) {
    return this.m00() === matrix.m00() && this.m01() === matrix.m01() && this.m02() === matrix.m02() && this.m10() === matrix.m10() && this.m11() === matrix.m11() && this.m12() === matrix.m12() && this.m20() === matrix.m20() && this.m21() === matrix.m21() && this.m22() === matrix.m22();
  }

  /**
   * Returns equality within a margin of error with another matrix
   */
  equalsEpsilon(matrix, epsilon) {
    return Math.abs(this.m00() - matrix.m00()) < epsilon && Math.abs(this.m01() - matrix.m01()) < epsilon && Math.abs(this.m02() - matrix.m02()) < epsilon && Math.abs(this.m10() - matrix.m10()) < epsilon && Math.abs(this.m11() - matrix.m11()) < epsilon && Math.abs(this.m12() - matrix.m12()) < epsilon && Math.abs(this.m20() - matrix.m20()) < epsilon && Math.abs(this.m21() - matrix.m21()) < epsilon && Math.abs(this.m22() - matrix.m22()) < epsilon;
  }

  /*---------------------------------------------------------------------------*
   * Immutable operations (returns a new matrix)
   *----------------------------------------------------------------------------*/

  /**
   * Returns a copy of this matrix
   */
  copy() {
    return m3(this.m00(), this.m01(), this.m02(), this.m10(), this.m11(), this.m12(), this.m20(), this.m21(), this.m22(), this.type);
  }

  /**
   * Returns a new matrix, defined by this matrix plus the provided matrix
   */
  plus(matrix) {
    return m3(this.m00() + matrix.m00(), this.m01() + matrix.m01(), this.m02() + matrix.m02(), this.m10() + matrix.m10(), this.m11() + matrix.m11(), this.m12() + matrix.m12(), this.m20() + matrix.m20(), this.m21() + matrix.m21(), this.m22() + matrix.m22());
  }

  /**
   * Returns a new matrix, defined by this matrix plus the provided matrix
   */
  minus(matrix) {
    return m3(this.m00() - matrix.m00(), this.m01() - matrix.m01(), this.m02() - matrix.m02(), this.m10() - matrix.m10(), this.m11() - matrix.m11(), this.m12() - matrix.m12(), this.m20() - matrix.m20(), this.m21() - matrix.m21(), this.m22() - matrix.m22());
  }

  /**
   * Returns a transposed copy of this matrix
   */
  transposed() {
    return m3(this.m00(), this.m10(), this.m20(), this.m01(), this.m11(), this.m21(), this.m02(), this.m12(), this.m22(), this.type === Matrix3Type.IDENTITY || this.type === Matrix3Type.SCALING ? this.type : undefined);
  }

  /**
   * Returns a negated copy of this matrix
   */
  negated() {
    return m3(-this.m00(), -this.m01(), -this.m02(), -this.m10(), -this.m11(), -this.m12(), -this.m20(), -this.m21(), -this.m22());
  }

  /**
   * Returns an inverted copy of this matrix
   */
  inverted() {
    let det;
    switch (this.type) {
      case Matrix3Type.IDENTITY:
        return this;
      case Matrix3Type.TRANSLATION_2D:
        return m3(1, 0, -this.m02(), 0, 1, -this.m12(), 0, 0, 1, Matrix3Type.TRANSLATION_2D);
      case Matrix3Type.SCALING:
        return m3(1 / this.m00(), 0, 0, 0, 1 / this.m11(), 0, 0, 0, 1 / this.m22(), Matrix3Type.SCALING);
      case Matrix3Type.AFFINE:
        det = this.getDeterminant();
        if (det !== 0) {
          return m3((-this.m12() * this.m21() + this.m11() * this.m22()) / det, (this.m02() * this.m21() - this.m01() * this.m22()) / det, (-this.m02() * this.m11() + this.m01() * this.m12()) / det, (this.m12() * this.m20() - this.m10() * this.m22()) / det, (-this.m02() * this.m20() + this.m00() * this.m22()) / det, (this.m02() * this.m10() - this.m00() * this.m12()) / det, 0, 0, 1, Matrix3Type.AFFINE);
        } else {
          throw new Error('Matrix could not be inverted, determinant === 0');
        }
      case Matrix3Type.OTHER:
        det = this.getDeterminant();
        if (det !== 0) {
          return m3((-this.m12() * this.m21() + this.m11() * this.m22()) / det, (this.m02() * this.m21() - this.m01() * this.m22()) / det, (-this.m02() * this.m11() + this.m01() * this.m12()) / det, (this.m12() * this.m20() - this.m10() * this.m22()) / det, (-this.m02() * this.m20() + this.m00() * this.m22()) / det, (this.m02() * this.m10() - this.m00() * this.m12()) / det, (-this.m11() * this.m20() + this.m10() * this.m21()) / det, (this.m01() * this.m20() - this.m00() * this.m21()) / det, (-this.m01() * this.m10() + this.m00() * this.m11()) / det, Matrix3Type.OTHER);
        } else {
          throw new Error('Matrix could not be inverted, determinant === 0');
        }
      default:
        throw new Error(`Matrix3.inverted with unknown type: ${this.type}`);
    }
  }

  /**
   * Returns a matrix, defined by the multiplication of this * matrix.
   *
   * @param matrix
   * @returns - NOTE: this may be the same matrix!
   */
  timesMatrix(matrix) {
    // I * M === M * I === M (the identity)
    if (this.type === Matrix3Type.IDENTITY || matrix.type === Matrix3Type.IDENTITY) {
      return this.type === Matrix3Type.IDENTITY ? matrix : this;
    }
    if (this.type === matrix.type) {
      // currently two matrices of the same type will result in the same result type
      if (this.type === Matrix3Type.TRANSLATION_2D) {
        // faster combination of translations
        return m3(1, 0, this.m02() + matrix.m02(), 0, 1, this.m12() + matrix.m12(), 0, 0, 1, Matrix3Type.TRANSLATION_2D);
      } else if (this.type === Matrix3Type.SCALING) {
        // faster combination of scaling
        return m3(this.m00() * matrix.m00(), 0, 0, 0, this.m11() * matrix.m11(), 0, 0, 0, 1, Matrix3Type.SCALING);
      }
    }
    if (this.type !== Matrix3Type.OTHER && matrix.type !== Matrix3Type.OTHER) {
      // currently two matrices that are anything but "other" are technically affine, and the result will be affine

      // affine case
      return m3(this.m00() * matrix.m00() + this.m01() * matrix.m10(), this.m00() * matrix.m01() + this.m01() * matrix.m11(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02(), this.m10() * matrix.m00() + this.m11() * matrix.m10(), this.m10() * matrix.m01() + this.m11() * matrix.m11(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12(), 0, 0, 1, Matrix3Type.AFFINE);
    }

    // general case
    return m3(this.m00() * matrix.m00() + this.m01() * matrix.m10() + this.m02() * matrix.m20(), this.m00() * matrix.m01() + this.m01() * matrix.m11() + this.m02() * matrix.m21(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02() * matrix.m22(), this.m10() * matrix.m00() + this.m11() * matrix.m10() + this.m12() * matrix.m20(), this.m10() * matrix.m01() + this.m11() * matrix.m11() + this.m12() * matrix.m21(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12() * matrix.m22(), this.m20() * matrix.m00() + this.m21() * matrix.m10() + this.m22() * matrix.m20(), this.m20() * matrix.m01() + this.m21() * matrix.m11() + this.m22() * matrix.m21(), this.m20() * matrix.m02() + this.m21() * matrix.m12() + this.m22() * matrix.m22());
  }

  /*---------------------------------------------------------------------------*
   * Immutable operations (returns new form of a parameter)
   *----------------------------------------------------------------------------*/

  /**
   * Returns the multiplication of this matrix times the provided vector (treating this matrix as homogeneous, so that
   * it is the technical multiplication of (x,y,1)).
   */
  timesVector2(vector2) {
    const x = this.m00() * vector2.x + this.m01() * vector2.y + this.m02();
    const y = this.m10() * vector2.x + this.m11() * vector2.y + this.m12();
    return new Vector2(x, y);
  }

  /**
   * Returns the multiplication of this matrix times the provided vector
   */
  timesVector3(vector3) {
    const x = this.m00() * vector3.x + this.m01() * vector3.y + this.m02() * vector3.z;
    const y = this.m10() * vector3.x + this.m11() * vector3.y + this.m12() * vector3.z;
    const z = this.m20() * vector3.x + this.m21() * vector3.y + this.m22() * vector3.z;
    return new Vector3(x, y, z);
  }

  /**
   * Returns the multiplication of the transpose of this matrix times the provided vector (assuming the 2x2 quadrant)
   */
  timesTransposeVector2(vector2) {
    const x = this.m00() * vector2.x + this.m10() * vector2.y;
    const y = this.m01() * vector2.x + this.m11() * vector2.y;
    return new Vector2(x, y);
  }

  /**
   * TODO: this operation seems to not work for transformDelta2, should be vetted
   */
  timesRelativeVector2(vector2) {
    const x = this.m00() * vector2.x + this.m01() * vector2.y;
    const y = this.m10() * vector2.y + this.m11() * vector2.y;
    return new Vector2(x, y);
  }

  /*---------------------------------------------------------------------------*
   * Mutable operations (changes this matrix)
   *----------------------------------------------------------------------------*/

  /**
   * Sets the entire state of the matrix, in row-major order.
   *
   * NOTE: Every mutable method goes through rowMajor
   */
  rowMajor(v00, v01, v02, v10, v11, v12, v20, v21, v22, type) {
    this.entries[0] = v00;
    this.entries[1] = v10;
    this.entries[2] = v20;
    this.entries[3] = v01;
    this.entries[4] = v11;
    this.entries[5] = v21;
    this.entries[6] = v02;
    this.entries[7] = v12;
    this.entries[8] = v22;

    // TODO: consider performance of the affine check here
    this.type = type === undefined ? v20 === 0 && v21 === 0 && v22 === 1 ? Matrix3Type.AFFINE : Matrix3Type.OTHER : type;
    return this;
  }

  /**
   * Sets this matrix to be a copy of another matrix.
   */
  set(matrix) {
    return this.rowMajor(matrix.m00(), matrix.m01(), matrix.m02(), matrix.m10(), matrix.m11(), matrix.m12(), matrix.m20(), matrix.m21(), matrix.m22(), matrix.type);
  }

  /**
   * Sets this matrix to be a copy of the column-major data stored in an array (e.g. WebGL).
   */
  setArray(array) {
    return this.rowMajor(array[0], array[3], array[6], array[1], array[4], array[7], array[2], array[5], array[8]);
  }

  /**
   * Sets the individual 0,0 component of this matrix.
   */
  set00(value) {
    this.entries[0] = value;
    return this;
  }

  /**
   * Sets the individual 0,1 component of this matrix.
   */
  set01(value) {
    this.entries[3] = value;
    return this;
  }

  /**
   * Sets the individual 0,2 component of this matrix.
   */
  set02(value) {
    this.entries[6] = value;
    return this;
  }

  /**
   * Sets the individual 1,0 component of this matrix.
   */
  set10(value) {
    this.entries[1] = value;
    return this;
  }

  /**
   * Sets the individual 1,1 component of this matrix.
   */
  set11(value) {
    this.entries[4] = value;
    return this;
  }

  /**
   * Sets the individual 1,2 component of this matrix.
   */
  set12(value) {
    this.entries[7] = value;
    return this;
  }

  /**
   * Sets the individual 2,0 component of this matrix.
   */
  set20(value) {
    this.entries[2] = value;
    return this;
  }

  /**
   * Sets the individual 2,1 component of this matrix.
   */
  set21(value) {
    this.entries[5] = value;
    return this;
  }

  /**
   * Sets the individual 2,2 component of this matrix.
   */
  set22(value) {
    this.entries[8] = value;
    return this;
  }

  /**
   * Makes this matrix effectively immutable to the normal methods (except direct setters?)
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
   * Sets the entire state of the matrix, in column-major order.
   */
  columnMajor(v00, v10, v20, v01, v11, v21, v02, v12, v22, type) {
    return this.rowMajor(v00, v01, v02, v10, v11, v12, v20, v21, v22, type);
  }

  /**
   * Sets this matrix to itself plus the given matrix.
   */
  add(matrix) {
    return this.rowMajor(this.m00() + matrix.m00(), this.m01() + matrix.m01(), this.m02() + matrix.m02(), this.m10() + matrix.m10(), this.m11() + matrix.m11(), this.m12() + matrix.m12(), this.m20() + matrix.m20(), this.m21() + matrix.m21(), this.m22() + matrix.m22());
  }

  /**
   * Sets this matrix to itself minus the given matrix.
   */
  subtract(m) {
    return this.rowMajor(this.m00() - m.m00(), this.m01() - m.m01(), this.m02() - m.m02(), this.m10() - m.m10(), this.m11() - m.m11(), this.m12() - m.m12(), this.m20() - m.m20(), this.m21() - m.m21(), this.m22() - m.m22());
  }

  /**
   * Sets this matrix to its own transpose.
   */
  transpose() {
    return this.rowMajor(this.m00(), this.m10(), this.m20(), this.m01(), this.m11(), this.m21(), this.m02(), this.m12(), this.m22(), this.type === Matrix3Type.IDENTITY || this.type === Matrix3Type.SCALING ? this.type : undefined);
  }

  /**
   * Sets this matrix to its own negation.
   */
  negate() {
    return this.rowMajor(-this.m00(), -this.m01(), -this.m02(), -this.m10(), -this.m11(), -this.m12(), -this.m20(), -this.m21(), -this.m22());
  }

  /**
   * Sets this matrix to its own inverse.
   */
  invert() {
    let det;
    switch (this.type) {
      case Matrix3Type.IDENTITY:
        return this;
      case Matrix3Type.TRANSLATION_2D:
        return this.rowMajor(1, 0, -this.m02(), 0, 1, -this.m12(), 0, 0, 1, Matrix3Type.TRANSLATION_2D);
      case Matrix3Type.SCALING:
        return this.rowMajor(1 / this.m00(), 0, 0, 0, 1 / this.m11(), 0, 0, 0, 1 / this.m22(), Matrix3Type.SCALING);
      case Matrix3Type.AFFINE:
        det = this.getDeterminant();
        if (det !== 0) {
          return this.rowMajor((-this.m12() * this.m21() + this.m11() * this.m22()) / det, (this.m02() * this.m21() - this.m01() * this.m22()) / det, (-this.m02() * this.m11() + this.m01() * this.m12()) / det, (this.m12() * this.m20() - this.m10() * this.m22()) / det, (-this.m02() * this.m20() + this.m00() * this.m22()) / det, (this.m02() * this.m10() - this.m00() * this.m12()) / det, 0, 0, 1, Matrix3Type.AFFINE);
        } else {
          throw new Error('Matrix could not be inverted, determinant === 0');
        }
      case Matrix3Type.OTHER:
        det = this.getDeterminant();
        if (det !== 0) {
          return this.rowMajor((-this.m12() * this.m21() + this.m11() * this.m22()) / det, (this.m02() * this.m21() - this.m01() * this.m22()) / det, (-this.m02() * this.m11() + this.m01() * this.m12()) / det, (this.m12() * this.m20() - this.m10() * this.m22()) / det, (-this.m02() * this.m20() + this.m00() * this.m22()) / det, (this.m02() * this.m10() - this.m00() * this.m12()) / det, (-this.m11() * this.m20() + this.m10() * this.m21()) / det, (this.m01() * this.m20() - this.m00() * this.m21()) / det, (-this.m01() * this.m10() + this.m00() * this.m11()) / det, Matrix3Type.OTHER);
        } else {
          throw new Error('Matrix could not be inverted, determinant === 0');
        }
      default:
        throw new Error(`Matrix3.inverted with unknown type: ${this.type}`);
    }
  }

  /**
   * Sets this matrix to the value of itself times the provided matrix
   */
  multiplyMatrix(matrix) {
    // M * I === M (the identity)
    if (matrix.type === Matrix3Type.IDENTITY) {
      // no change needed
      return this;
    }

    // I * M === M (the identity)
    if (this.type === Matrix3Type.IDENTITY) {
      // copy the other matrix to us
      return this.set(matrix);
    }
    if (this.type === matrix.type) {
      // currently two matrices of the same type will result in the same result type
      if (this.type === Matrix3Type.TRANSLATION_2D) {
        // faster combination of translations
        return this.rowMajor(1, 0, this.m02() + matrix.m02(), 0, 1, this.m12() + matrix.m12(), 0, 0, 1, Matrix3Type.TRANSLATION_2D);
      } else if (this.type === Matrix3Type.SCALING) {
        // faster combination of scaling
        return this.rowMajor(this.m00() * matrix.m00(), 0, 0, 0, this.m11() * matrix.m11(), 0, 0, 0, 1, Matrix3Type.SCALING);
      }
    }
    if (this.type !== Matrix3Type.OTHER && matrix.type !== Matrix3Type.OTHER) {
      // currently two matrices that are anything but "other" are technically affine, and the result will be affine

      // affine case
      return this.rowMajor(this.m00() * matrix.m00() + this.m01() * matrix.m10(), this.m00() * matrix.m01() + this.m01() * matrix.m11(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02(), this.m10() * matrix.m00() + this.m11() * matrix.m10(), this.m10() * matrix.m01() + this.m11() * matrix.m11(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12(), 0, 0, 1, Matrix3Type.AFFINE);
    }

    // general case
    return this.rowMajor(this.m00() * matrix.m00() + this.m01() * matrix.m10() + this.m02() * matrix.m20(), this.m00() * matrix.m01() + this.m01() * matrix.m11() + this.m02() * matrix.m21(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02() * matrix.m22(), this.m10() * matrix.m00() + this.m11() * matrix.m10() + this.m12() * matrix.m20(), this.m10() * matrix.m01() + this.m11() * matrix.m11() + this.m12() * matrix.m21(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12() * matrix.m22(), this.m20() * matrix.m00() + this.m21() * matrix.m10() + this.m22() * matrix.m20(), this.m20() * matrix.m01() + this.m21() * matrix.m11() + this.m22() * matrix.m21(), this.m20() * matrix.m02() + this.m21() * matrix.m12() + this.m22() * matrix.m22());
  }

  /**
   * Mutates this matrix, equivalent to (translation * this).
   */
  prependTranslation(x, y) {
    this.set02(this.m02() + x);
    this.set12(this.m12() + y);
    if (this.type === Matrix3Type.IDENTITY || this.type === Matrix3Type.TRANSLATION_2D) {
      this.type = Matrix3Type.TRANSLATION_2D;
    } else if (this.type === Matrix3Type.OTHER) {
      this.type = Matrix3Type.OTHER;
    } else {
      this.type = Matrix3Type.AFFINE;
    }
    return this; // for chaining
  }

  /**
   * Sets this matrix to the 3x3 identity matrix.
   */
  setToIdentity() {
    return this.rowMajor(1, 0, 0, 0, 1, 0, 0, 0, 1, Matrix3Type.IDENTITY);
  }

  /**
   * Sets this matrix to the affine translation matrix.
   */
  setToTranslation(x, y) {
    return this.rowMajor(1, 0, x, 0, 1, y, 0, 0, 1, Matrix3Type.TRANSLATION_2D);
  }

  /**
   * Sets this matrix to the affine scaling matrix.
   */
  setToScale(x, y) {
    // allow using one parameter to scale everything
    y = y === undefined ? x : y;
    return this.rowMajor(x, 0, 0, 0, y, 0, 0, 0, 1, Matrix3Type.SCALING);
  }

  /**
   * Sets this matrix to an affine matrix with the specified row-major values.
   */
  setToAffine(m00, m01, m02, m10, m11, m12) {
    return this.rowMajor(m00, m01, m02, m10, m11, m12, 0, 0, 1, Matrix3Type.AFFINE);
  }

  /**
   * Sets the matrix to a rotation defined by a rotation of the specified angle around the given unit axis.
   *
   * @param axis - normalized
   * @param angle - in radians
   */
  setToRotationAxisAngle(axis, angle) {
    let c = Math.cos(angle);
    let s = Math.sin(angle);

    // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
    if (Math.abs(c) < 1e-15) {
      c = 0;
    }
    if (Math.abs(s) < 1e-15) {
      s = 0;
    }
    const C = 1 - c;
    return this.rowMajor(axis.x * axis.x * C + c, axis.x * axis.y * C - axis.z * s, axis.x * axis.z * C + axis.y * s, axis.y * axis.x * C + axis.z * s, axis.y * axis.y * C + c, axis.y * axis.z * C - axis.x * s, axis.z * axis.x * C - axis.y * s, axis.z * axis.y * C + axis.x * s, axis.z * axis.z * C + c, Matrix3Type.OTHER);
  }

  /**
   * Sets this matrix to a rotation around the x axis (in the yz plane).
   *
   * @param angle - in radians
   */
  setToRotationX(angle) {
    let c = Math.cos(angle);
    let s = Math.sin(angle);

    // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
    if (Math.abs(c) < 1e-15) {
      c = 0;
    }
    if (Math.abs(s) < 1e-15) {
      s = 0;
    }
    return this.rowMajor(1, 0, 0, 0, c, -s, 0, s, c, Matrix3Type.OTHER);
  }

  /**
   * Sets this matrix to a rotation around the y axis (in the xz plane).
   *
   * @param angle - in radians
   */
  setToRotationY(angle) {
    let c = Math.cos(angle);
    let s = Math.sin(angle);

    // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
    if (Math.abs(c) < 1e-15) {
      c = 0;
    }
    if (Math.abs(s) < 1e-15) {
      s = 0;
    }
    return this.rowMajor(c, 0, s, 0, 1, 0, -s, 0, c, Matrix3Type.OTHER);
  }

  /**
   * Sets this matrix to a rotation around the z axis (in the xy plane).
   *
   * @param angle - in radians
   */
  setToRotationZ(angle) {
    let c = Math.cos(angle);
    let s = Math.sin(angle);

    // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
    if (Math.abs(c) < 1e-15) {
      c = 0;
    }
    if (Math.abs(s) < 1e-15) {
      s = 0;
    }
    return this.rowMajor(c, -s, 0, s, c, 0, 0, 0, 1, Matrix3Type.AFFINE);
  }

  /**
   * Sets this matrix to the combined translation+rotation (where the rotation logically would happen first, THEN it
   * would be translated).
   *
   * @param x
   * @param y
   * @param angle - in radians
   */
  setToTranslationRotation(x, y, angle) {
    let c = Math.cos(angle);
    let s = Math.sin(angle);

    // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
    if (Math.abs(c) < 1e-15) {
      c = 0;
    }
    if (Math.abs(s) < 1e-15) {
      s = 0;
    }
    return this.rowMajor(c, -s, x, s, c, y, 0, 0, 1, Matrix3Type.AFFINE);
  }

  /**
   * Sets this matrix to the combined translation+rotation (where the rotation logically would happen first, THEN it
   * would be translated).
   *
   * @param translation
   * @param angle - in radians
   */
  setToTranslationRotationPoint(translation, angle) {
    return this.setToTranslationRotation(translation.x, translation.y, angle);
  }

  /**
   * Sets this matrix to the values contained in an SVGMatrix.
   */
  setToSVGMatrix(svgMatrix) {
    return this.rowMajor(svgMatrix.a, svgMatrix.c, svgMatrix.e, svgMatrix.b, svgMatrix.d, svgMatrix.f, 0, 0, 1, Matrix3Type.AFFINE);
  }

  /**
   * Sets this matrix to a rotation matrix that rotates A to B (Vector3 instances), by rotating about the axis
   * A.cross( B ) -- Shortest path. ideally should be unit vectors.
   */
  setRotationAToB(a, b) {
    // see http://graphics.cs.brown.edu/~jfh/papers/Moller-EBA-1999/paper.pdf for information on this implementation
    const start = a;
    const end = b;
    const epsilon = 0.0001;
    let v = start.cross(end);
    const e = start.dot(end);
    const f = e < 0 ? -e : e;

    // if "from" and "to" vectors are nearly parallel
    if (f > 1.0 - epsilon) {
      let x = new Vector3(start.x > 0.0 ? start.x : -start.x, start.y > 0.0 ? start.y : -start.y, start.z > 0.0 ? start.z : -start.z);
      if (x.x < x.y) {
        if (x.x < x.z) {
          x = Vector3.X_UNIT;
        } else {
          x = Vector3.Z_UNIT;
        }
      } else {
        if (x.y < x.z) {
          x = Vector3.Y_UNIT;
        } else {
          x = Vector3.Z_UNIT;
        }
      }
      const u = x.minus(start);
      v = x.minus(end);
      const c1 = 2.0 / u.dot(u);
      const c2 = 2.0 / v.dot(v);
      const c3 = c1 * c2 * u.dot(v);
      return this.rowMajor(-c1 * u.x * u.x - c2 * v.x * v.x + c3 * v.x * u.x + 1, -c1 * u.x * u.y - c2 * v.x * v.y + c3 * v.x * u.y, -c1 * u.x * u.z - c2 * v.x * v.z + c3 * v.x * u.z, -c1 * u.y * u.x - c2 * v.y * v.x + c3 * v.y * u.x, -c1 * u.y * u.y - c2 * v.y * v.y + c3 * v.y * u.y + 1, -c1 * u.y * u.z - c2 * v.y * v.z + c3 * v.y * u.z, -c1 * u.z * u.x - c2 * v.z * v.x + c3 * v.z * u.x, -c1 * u.z * u.y - c2 * v.z * v.y + c3 * v.z * u.y, -c1 * u.z * u.z - c2 * v.z * v.z + c3 * v.z * u.z + 1);
    } else {
      // the most common case, unless "start"="end", or "start"=-"end"
      const h = 1.0 / (1.0 + e);
      const hvx = h * v.x;
      const hvz = h * v.z;
      const hvxy = hvx * v.y;
      const hvxz = hvx * v.z;
      const hvyz = hvz * v.y;
      return this.rowMajor(e + hvx * v.x, hvxy - v.z, hvxz + v.y, hvxy + v.z, e + h * v.y * v.y, hvyz - v.x, hvxz - v.y, hvyz + v.x, e + hvz * v.z);
    }
  }

  /*---------------------------------------------------------------------------*
   * Mutable operations (changes the parameter)
   *----------------------------------------------------------------------------*/

  /**
   * Sets the vector to the result of (matrix * vector), as a homogeneous multiplication.
   *
   * @returns - The vector that was mutated
   */
  multiplyVector2(vector2) {
    return vector2.setXY(this.m00() * vector2.x + this.m01() * vector2.y + this.m02(), this.m10() * vector2.x + this.m11() * vector2.y + this.m12());
  }

  /**
   * Sets the vector to the result of (matrix * vector).
   *
   * @returns - The vector that was mutated
   */
  multiplyVector3(vector3) {
    return vector3.setXYZ(this.m00() * vector3.x + this.m01() * vector3.y + this.m02() * vector3.z, this.m10() * vector3.x + this.m11() * vector3.y + this.m12() * vector3.z, this.m20() * vector3.x + this.m21() * vector3.y + this.m22() * vector3.z);
  }

  /**
   * Sets the vector to the result of (transpose(matrix) * vector), ignoring the translation parameters.
   *
   * @returns - The vector that was mutated
   */
  multiplyTransposeVector2(v) {
    return v.setXY(this.m00() * v.x + this.m10() * v.y, this.m01() * v.x + this.m11() * v.y);
  }

  /**
   * Sets the vector to the result of (matrix * vector - matrix * zero). Since this is a homogeneous operation, it is
   * equivalent to the multiplication of (x,y,0).
   *
   * @returns - The vector that was mutated
   */
  multiplyRelativeVector2(v) {
    return v.setXY(this.m00() * v.x + this.m01() * v.y, this.m10() * v.y + this.m11() * v.y);
  }

  /**
   * Sets the transform of a Canvas 2D rendering context to the affine part of this matrix
   */
  canvasSetTransform(context) {
    context.setTransform(
    // inlined array entries
    this.entries[0], this.entries[1], this.entries[3], this.entries[4], this.entries[6], this.entries[7]);
  }

  /**
   * Appends to the affine part of this matrix to the Canvas 2D rendering context
   */
  canvasAppendTransform(context) {
    if (this.type !== Matrix3Type.IDENTITY) {
      context.transform(
      // inlined array entries
      this.entries[0], this.entries[1], this.entries[3], this.entries[4], this.entries[6], this.entries[7]);
    }
  }

  /**
   * Copies the entries of this matrix over to an arbitrary array (typed or normal).
   */
  copyToArray(array) {
    array[0] = this.m00();
    array[1] = this.m10();
    array[2] = this.m20();
    array[3] = this.m01();
    array[4] = this.m11();
    array[5] = this.m21();
    array[6] = this.m02();
    array[7] = this.m12();
    array[8] = this.m22();
    return array;
  }
  freeToPool() {
    Matrix3.pool.freeToPool(this);
  }
  static pool = new Pool(Matrix3, {
    initialize: Matrix3.prototype.initialize,
    useDefaultConstruction: true,
    maxSize: 300
  });

  /**
   * Returns an identity matrix.
   */
  static identity() {
    return fromPool().setToIdentity();
  }

  /**
   * Returns a translation matrix.
   */
  static translation(x, y) {
    return fromPool().setToTranslation(x, y);
  }

  /**
   * Returns a translation matrix computed from a vector.
   */
  static translationFromVector(vector) {
    return Matrix3.translation(vector.x, vector.y);
  }

  /**
   * Returns a matrix that scales things in each dimension.
   */
  static scaling(x, y) {
    return fromPool().setToScale(x, y);
  }

  /**
   * Returns a matrix that scales things in each dimension.
   */
  static scale(x, y) {
    return Matrix3.scaling(x, y);
  }

  /**
   * Returns an affine matrix with the given parameters.
   */
  static affine(m00, m01, m02, m10, m11, m12) {
    return fromPool().setToAffine(m00, m01, m02, m10, m11, m12);
  }

  /**
   * Creates a new matrix with all entries determined in row-major order.
   */
  static rowMajor(v00, v01, v02, v10, v11, v12, v20, v21, v22, type) {
    return fromPool().rowMajor(v00, v01, v02, v10, v11, v12, v20, v21, v22, type);
  }

  /**
   * Returns a matrix rotation defined by a rotation of the specified angle around the given unit axis.
   *
   * @param axis - normalized
   * @param angle - in radians
   */
  static rotationAxisAngle(axis, angle) {
    return fromPool().setToRotationAxisAngle(axis, angle);
  }

  /**
   * Returns a matrix that rotates around the x axis (in the yz plane).
   *
   * @param angle - in radians
   */
  static rotationX(angle) {
    return fromPool().setToRotationX(angle);
  }

  /**
   * Returns a matrix that rotates around the y axis (in the xz plane).
   *
   * @param angle - in radians
   */
  static rotationY(angle) {
    return fromPool().setToRotationY(angle);
  }

  /**
   * Returns a matrix that rotates around the z axis (in the xy plane).
   *
   * @param angle - in radians
   */
  static rotationZ(angle) {
    return fromPool().setToRotationZ(angle);
  }

  /**
   * Returns a combined 2d translation + rotation (with the rotation effectively applied first).
   *
   * @param angle - in radians
   */
  static translationRotation(x, y, angle) {
    return fromPool().setToTranslationRotation(x, y, angle);
  }

  /**
   * Standard 2d rotation matrix for a given angle.
   *
   * @param angle - in radians
   */
  static rotation2(angle) {
    return fromPool().setToRotationZ(angle);
  }

  /**
   * Returns a matrix which will be a 2d rotation around a given x,y point.
   *
   * @param angle - in radians
   * @param x
   * @param y
   */
  static rotationAround(angle, x, y) {
    return Matrix3.translation(x, y).timesMatrix(Matrix3.rotation2(angle)).timesMatrix(Matrix3.translation(-x, -y));
  }

  /**
   * Returns a matrix which will be a 2d rotation around a given 2d point.
   *
   * @param angle - in radians
   * @param point
   */
  static rotationAroundPoint(angle, point) {
    return Matrix3.rotationAround(angle, point.x, point.y);
  }

  /**
   * Returns a matrix equivalent to a given SVGMatrix.
   */
  static fromSVGMatrix(svgMatrix) {
    return fromPool().setToSVGMatrix(svgMatrix);
  }

  /**
   * Returns a rotation matrix that rotates A to B, by rotating about the axis A.cross( B ) -- Shortest path. ideally
   * should be unit vectors.
   */
  static rotateAToB(a, b) {
    return fromPool().setRotationAToB(a, b);
  }

  /**
   * Shortcut for translation times a matrix (without allocating a translation matrix), see scenery#119
   */
  static translationTimesMatrix(x, y, matrix) {
    let type;
    if (matrix.type === Matrix3Type.IDENTITY || matrix.type === Matrix3Type.TRANSLATION_2D) {
      return m3(1, 0, matrix.m02() + x, 0, 1, matrix.m12() + y, 0, 0, 1, Matrix3Type.TRANSLATION_2D);
    } else if (matrix.type === Matrix3Type.OTHER) {
      type = Matrix3Type.OTHER;
    } else {
      type = Matrix3Type.AFFINE;
    }
    return m3(matrix.m00(), matrix.m01(), matrix.m02() + x, matrix.m10(), matrix.m11(), matrix.m12() + y, matrix.m20(), matrix.m21(), matrix.m22(), type);
  }

  /**
   * Serialize to an Object that can be handled by PhET-iO
   */
  static toStateObject(matrix3) {
    return {
      entries: matrix3.entries,
      type: matrix3.type.name
    };
  }

  /**
   * Convert back from a serialized Object to a Matrix3
   */
  static fromStateObject(stateObject) {
    const matrix = Matrix3.identity();
    matrix.entries = stateObject.entries;
    matrix.type = Matrix3Type.enumeration.getValue(stateObject.type);
    return matrix;
  }

  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
  // eslint-disable-line uppercase-statics-should-be-readonly
}

dot.register('Matrix3', Matrix3);
const fromPool = Matrix3.pool.fetch.bind(Matrix3.pool);
const m3 = (v00, v01, v02, v10, v11, v12, v20, v21, v22, type) => {
  return fromPool().rowMajor(v00, v01, v02, v10, v11, v12, v20, v21, v22, type);
};
export { m3 };
dot.register('m3', m3);
Matrix3.IDENTITY = Matrix3.identity().makeImmutable();
Matrix3.X_REFLECTION = m3(-1, 0, 0, 0, 1, 0, 0, 0, 1, Matrix3Type.AFFINE).makeImmutable();
Matrix3.Y_REFLECTION = m3(1, 0, 0, 0, -1, 0, 0, 0, 1, Matrix3Type.AFFINE).makeImmutable();
Matrix3.Matrix3IO = new IOType('Matrix3IO', {
  valueType: Matrix3,
  documentation: 'A 3x3 matrix often used for holding transform data.',
  toStateObject: matrix3 => Matrix3.toStateObject(matrix3),
  fromStateObject: Matrix3.fromStateObject,
  stateSchema: {
    entries: ArrayIO(NumberIO),
    type: EnumerationIO(Matrix3Type)
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbklPIiwiQXJyYXlJTyIsIklPVHlwZSIsIk51bWJlcklPIiwiZG90IiwiTWF0cml4NCIsInRvU1ZHTnVtYmVyIiwiVmVjdG9yMiIsIlZlY3RvcjMiLCJFbnVtZXJhdGlvblZhbHVlIiwiRW51bWVyYXRpb24iLCJQb29sIiwiTWF0cml4M1R5cGUiLCJPVEhFUiIsIklERU5USVRZIiwiVFJBTlNMQVRJT05fMkQiLCJTQ0FMSU5HIiwiQUZGSU5FIiwiZW51bWVyYXRpb24iLCJNYXRyaXgzIiwiY29uc3RydWN0b3IiLCJhc3NlcnQiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJlbnRyaWVzIiwidHlwZSIsImluaXRpYWxpemUiLCJtMDAiLCJtMDEiLCJtMDIiLCJtMTAiLCJtMTEiLCJtMTIiLCJtMjAiLCJtMjEiLCJtMjIiLCJpc0lkZW50aXR5IiwiZXF1YWxzIiwiaXNGYXN0SWRlbnRpdHkiLCJpc1RyYW5zbGF0aW9uIiwiaXNBZmZpbmUiLCJpc0FsaWduZWQiLCJpc0F4aXNBbGlnbmVkIiwiaXNGaW5pdGUiLCJnZXREZXRlcm1pbmFudCIsImRldGVybWluYW50IiwiZ2V0VHJhbnNsYXRpb24iLCJ0cmFuc2xhdGlvbiIsImdldFNjYWxlVmVjdG9yIiwiTWF0aCIsInNxcnQiLCJzY2FsZVZlY3RvciIsImdldFJvdGF0aW9uIiwiYXRhbjIiLCJyb3RhdGlvbiIsInRvTWF0cml4NCIsInRvQWZmaW5lTWF0cml4NCIsInRvU3RyaW5nIiwidG9TVkdNYXRyaXgiLCJyZXN1bHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnROUyIsImNyZWF0ZVNWR01hdHJpeCIsImEiLCJiIiwiYyIsImQiLCJlIiwiZiIsImdldENTU1RyYW5zZm9ybSIsInRvRml4ZWQiLCJjc3NUcmFuc2Zvcm0iLCJnZXRTVkdUcmFuc2Zvcm0iLCJzdmdUcmFuc2Zvcm0iLCJnZXRDU1NUcmFuc2Zvcm1TdHlsZXMiLCJ0cmFuc2Zvcm1DU1MiLCJ0cmFuc2Zvcm0iLCJjc3NUcmFuc2Zvcm1TdHlsZXMiLCJtYXRyaXgiLCJlcXVhbHNFcHNpbG9uIiwiZXBzaWxvbiIsImFicyIsImNvcHkiLCJtMyIsInBsdXMiLCJtaW51cyIsInRyYW5zcG9zZWQiLCJ1bmRlZmluZWQiLCJuZWdhdGVkIiwiaW52ZXJ0ZWQiLCJkZXQiLCJFcnJvciIsInRpbWVzTWF0cml4IiwidGltZXNWZWN0b3IyIiwidmVjdG9yMiIsIngiLCJ5IiwidGltZXNWZWN0b3IzIiwidmVjdG9yMyIsInoiLCJ0aW1lc1RyYW5zcG9zZVZlY3RvcjIiLCJ0aW1lc1JlbGF0aXZlVmVjdG9yMiIsInJvd01ham9yIiwidjAwIiwidjAxIiwidjAyIiwidjEwIiwidjExIiwidjEyIiwidjIwIiwidjIxIiwidjIyIiwic2V0Iiwic2V0QXJyYXkiLCJhcnJheSIsInNldDAwIiwidmFsdWUiLCJzZXQwMSIsInNldDAyIiwic2V0MTAiLCJzZXQxMSIsInNldDEyIiwic2V0MjAiLCJzZXQyMSIsInNldDIyIiwibWFrZUltbXV0YWJsZSIsImNvbHVtbk1ham9yIiwiYWRkIiwic3VidHJhY3QiLCJtIiwidHJhbnNwb3NlIiwibmVnYXRlIiwiaW52ZXJ0IiwibXVsdGlwbHlNYXRyaXgiLCJwcmVwZW5kVHJhbnNsYXRpb24iLCJzZXRUb0lkZW50aXR5Iiwic2V0VG9UcmFuc2xhdGlvbiIsInNldFRvU2NhbGUiLCJzZXRUb0FmZmluZSIsInNldFRvUm90YXRpb25BeGlzQW5nbGUiLCJheGlzIiwiYW5nbGUiLCJjb3MiLCJzIiwic2luIiwiQyIsInNldFRvUm90YXRpb25YIiwic2V0VG9Sb3RhdGlvblkiLCJzZXRUb1JvdGF0aW9uWiIsInNldFRvVHJhbnNsYXRpb25Sb3RhdGlvbiIsInNldFRvVHJhbnNsYXRpb25Sb3RhdGlvblBvaW50Iiwic2V0VG9TVkdNYXRyaXgiLCJzdmdNYXRyaXgiLCJzZXRSb3RhdGlvbkFUb0IiLCJzdGFydCIsImVuZCIsInYiLCJjcm9zcyIsIlhfVU5JVCIsIlpfVU5JVCIsIllfVU5JVCIsInUiLCJjMSIsImMyIiwiYzMiLCJoIiwiaHZ4IiwiaHZ6IiwiaHZ4eSIsImh2eHoiLCJodnl6IiwibXVsdGlwbHlWZWN0b3IyIiwic2V0WFkiLCJtdWx0aXBseVZlY3RvcjMiLCJzZXRYWVoiLCJtdWx0aXBseVRyYW5zcG9zZVZlY3RvcjIiLCJtdWx0aXBseVJlbGF0aXZlVmVjdG9yMiIsImNhbnZhc1NldFRyYW5zZm9ybSIsImNvbnRleHQiLCJzZXRUcmFuc2Zvcm0iLCJjYW52YXNBcHBlbmRUcmFuc2Zvcm0iLCJjb3B5VG9BcnJheSIsImZyZWVUb1Bvb2wiLCJwb29sIiwicHJvdG90eXBlIiwidXNlRGVmYXVsdENvbnN0cnVjdGlvbiIsIm1heFNpemUiLCJpZGVudGl0eSIsImZyb21Qb29sIiwidHJhbnNsYXRpb25Gcm9tVmVjdG9yIiwidmVjdG9yIiwic2NhbGluZyIsInNjYWxlIiwiYWZmaW5lIiwicm90YXRpb25BeGlzQW5nbGUiLCJyb3RhdGlvblgiLCJyb3RhdGlvblkiLCJyb3RhdGlvbloiLCJ0cmFuc2xhdGlvblJvdGF0aW9uIiwicm90YXRpb24yIiwicm90YXRpb25Bcm91bmQiLCJyb3RhdGlvbkFyb3VuZFBvaW50IiwicG9pbnQiLCJmcm9tU1ZHTWF0cml4Iiwicm90YXRlQVRvQiIsInRyYW5zbGF0aW9uVGltZXNNYXRyaXgiLCJ0b1N0YXRlT2JqZWN0IiwibWF0cml4MyIsIm5hbWUiLCJmcm9tU3RhdGVPYmplY3QiLCJzdGF0ZU9iamVjdCIsImdldFZhbHVlIiwicmVnaXN0ZXIiLCJmZXRjaCIsImJpbmQiLCJYX1JFRkxFQ1RJT04iLCJZX1JFRkxFQ1RJT04iLCJNYXRyaXgzSU8iLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwic3RhdGVTY2hlbWEiXSwic291cmNlcyI6WyJNYXRyaXgzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIDMtZGltZW5zaW9uYWwgTWF0cml4XHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb25JTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvRW51bWVyYXRpb25JTy5qcyc7XHJcbmltcG9ydCBBcnJheUlPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9BcnJheUlPLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xyXG5pbXBvcnQgTWF0cml4NCBmcm9tICcuL01hdHJpeDQuanMnO1xyXG5pbXBvcnQgdG9TVkdOdW1iZXIgZnJvbSAnLi90b1NWR051bWJlci5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4vVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vVmVjdG9yMy5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBQb29sLCB7IFRQb29sYWJsZSB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBNYXRyaXgzVHlwZSBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgT1RIRVIgPSBuZXcgTWF0cml4M1R5cGUoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElERU5USVRZID0gbmV3IE1hdHJpeDNUeXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUUkFOU0xBVElPTl8yRCA9IG5ldyBNYXRyaXgzVHlwZSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU0NBTElORyA9IG5ldyBNYXRyaXgzVHlwZSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQUZGSU5FID0gbmV3IE1hdHJpeDNUeXBlKCk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIE1hdHJpeDNUeXBlICk7XHJcbn1cclxuXHJcbnR5cGUgTmluZU51bWJlcnMgPSBbXHJcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcclxuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxyXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXJcclxuXTtcclxuXHJcbmV4cG9ydCB0eXBlIE1hdHJpeDNTdGF0ZU9iamVjdCA9IHtcclxuICBlbnRyaWVzOiBOaW5lTnVtYmVycztcclxuICB0eXBlOiBzdHJpbmc7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXRyaXgzIGltcGxlbWVudHMgVFBvb2xhYmxlIHtcclxuXHJcbiAgLy8gRW50cmllcyBzdG9yZWQgaW4gY29sdW1uLW1ham9yIGZvcm1hdFxyXG4gIHB1YmxpYyBlbnRyaWVzOiBOaW5lTnVtYmVycztcclxuXHJcbiAgcHVibGljIHR5cGU6IE1hdHJpeDNUeXBlO1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIGlkZW50aXR5IG1hdHJpeCwgdGhhdCBjYW4gdGhlbiBiZSBtdXRhdGVkIGludG8gdGhlIHByb3BlciBmb3JtLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgIC8vTWFrZSBzdXJlIG5vIGNsaWVudHMgYXJlIGV4cGVjdGluZyB0byBjcmVhdGUgYSBtYXRyaXggd2l0aCBub24taWRlbnRpdHkgdmFsdWVzXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcmd1bWVudHMubGVuZ3RoID09PSAwLCAnTWF0cml4MyBjb25zdHJ1Y3RvciBzaG91bGQgbm90IGJlIGNhbGxlZCB3aXRoIGFueSBhcmd1bWVudHMuICBVc2UgbTMoKS9NYXRyaXgzLmlkZW50aXR5KCkvZXRjLicgKTtcclxuXHJcbiAgICB0aGlzLmVudHJpZXMgPSBbIDEsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDEgXTtcclxuICAgIHRoaXMudHlwZSA9IE1hdHJpeDNUeXBlLklERU5USVRZO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGluaXRpYWxpemUoKTogdGhpcyB7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlbmllbmNlIGdldHRlciBmb3IgdGhlIGluZGl2aWR1YWwgMCwwIGVudHJ5IG9mIHRoZSBtYXRyaXguXHJcbiAgICovXHJcbiAgcHVibGljIG0wMCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZW50cmllc1sgMCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVuaWVuY2UgZ2V0dGVyIGZvciB0aGUgaW5kaXZpZHVhbCAwLDEgZW50cnkgb2YgdGhlIG1hdHJpeC5cclxuICAgKi9cclxuICBwdWJsaWMgbTAxKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyAzIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZW5pZW5jZSBnZXR0ZXIgZm9yIHRoZSBpbmRpdmlkdWFsIDAsMiBlbnRyeSBvZiB0aGUgbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBtMDIoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDYgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlbmllbmNlIGdldHRlciBmb3IgdGhlIGluZGl2aWR1YWwgMSwwIGVudHJ5IG9mIHRoZSBtYXRyaXguXHJcbiAgICovXHJcbiAgcHVibGljIG0xMCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZW50cmllc1sgMSBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVuaWVuY2UgZ2V0dGVyIGZvciB0aGUgaW5kaXZpZHVhbCAxLDEgZW50cnkgb2YgdGhlIG1hdHJpeC5cclxuICAgKi9cclxuICBwdWJsaWMgbTExKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyA0IF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZW5pZW5jZSBnZXR0ZXIgZm9yIHRoZSBpbmRpdmlkdWFsIDEsMiBlbnRyeSBvZiB0aGUgbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBtMTIoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDcgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlbmllbmNlIGdldHRlciBmb3IgdGhlIGluZGl2aWR1YWwgMiwwIGVudHJ5IG9mIHRoZSBtYXRyaXguXHJcbiAgICovXHJcbiAgcHVibGljIG0yMCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZW50cmllc1sgMiBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVuaWVuY2UgZ2V0dGVyIGZvciB0aGUgaW5kaXZpZHVhbCAyLDEgZW50cnkgb2YgdGhlIG1hdHJpeC5cclxuICAgKi9cclxuICBwdWJsaWMgbTIxKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyA1IF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZW5pZW5jZSBnZXR0ZXIgZm9yIHRoZSBpbmRpdmlkdWFsIDIsMiBlbnRyeSBvZiB0aGUgbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBtMjIoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDggXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIG1hdHJpeCBpcyBhbiBpZGVudGl0eSBtYXRyaXguXHJcbiAgICovXHJcbiAgcHVibGljIGlzSWRlbnRpdHkoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy50eXBlID09PSBNYXRyaXgzVHlwZS5JREVOVElUWSB8fCB0aGlzLmVxdWFscyggTWF0cml4My5JREVOVElUWSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgbWF0cml4IGlzIGxpa2VseSB0byBiZSBhbiBpZGVudGl0eSBtYXRyaXggKHJldHVybmluZyBmYWxzZSBtZWFucyBcImluY29uY2x1c2l2ZSwgbWF5IGJlXHJcbiAgICogaWRlbnRpdHkgb3Igbm90XCIpLCBidXQgdHJ1ZSBpcyBndWFyYW50ZWVkIHRvIGJlIGFuIGlkZW50aXR5IG1hdHJpeC5cclxuICAgKi9cclxuICBwdWJsaWMgaXNGYXN0SWRlbnRpdHkoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy50eXBlID09PSBNYXRyaXgzVHlwZS5JREVOVElUWTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIG1hdHJpeCBpcyBhIHRyYW5zbGF0aW9uIG1hdHJpeC5cclxuICAgKiBCeSB0aGlzIHdlIG1lYW4gaXQgaGFzIG5vIHNoZWFyLCByb3RhdGlvbiwgb3Igc2NhbGluZ1xyXG4gICAqIEl0IG1heSBiZSBhIHRyYW5zbGF0aW9uIG9mIHplcm8uXHJcbiAgICovXHJcbiAgcHVibGljIGlzVHJhbnNsYXRpb24oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy50eXBlID09PSBNYXRyaXgzVHlwZS5UUkFOU0xBVElPTl8yRCB8fCAoIHRoaXMubTAwKCkgPT09IDEgJiYgdGhpcy5tMTEoKSA9PT0gMSAmJiB0aGlzLm0yMigpID09PSAxICYmIHRoaXMubTAxKCkgPT09IDAgJiYgdGhpcy5tMTAoKSA9PT0gMCAmJiB0aGlzLm0yMCgpID09PSAwICYmIHRoaXMubTIxKCkgPT09IDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIG1hdHJpeCBpcyBhbiBhZmZpbmUgbWF0cml4IChlLmcuIG5vIHNoZWFyKS5cclxuICAgKi9cclxuICBwdWJsaWMgaXNBZmZpbmUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy50eXBlID09PSBNYXRyaXgzVHlwZS5BRkZJTkUgfHwgKCB0aGlzLm0yMCgpID09PSAwICYmIHRoaXMubTIxKCkgPT09IDAgJiYgdGhpcy5tMjIoKSA9PT0gMSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIGl0J3MgYW4gYWZmaW5lIG1hdHJpeCB3aGVyZSB0aGUgY29tcG9uZW50cyBvZiB0cmFuc2Zvcm1zIGFyZSBpbmRlcGVuZGVudCwgaS5lLiBjb25zdHJ1Y3RlZCBmcm9tXHJcbiAgICogYXJiaXRyYXJ5IGNvbXBvbmVudCBzY2FsaW5nIGFuZCB0cmFuc2xhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgaXNBbGlnbmVkKCk6IGJvb2xlYW4ge1xyXG4gICAgLy8gbm9uLWRpYWdvbmFsIG5vbi10cmFuc2xhdGlvbiBlbnRyaWVzIHNob3VsZCBhbGwgYmUgemVyby5cclxuICAgIHJldHVybiB0aGlzLmlzQWZmaW5lKCkgJiYgdGhpcy5tMDEoKSA9PT0gMCAmJiB0aGlzLm0xMCgpID09PSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBpZiBpdCdzIGFuIGFmZmluZSBtYXRyaXggd2hlcmUgdGhlIGNvbXBvbmVudHMgb2YgdHJhbnNmb3JtcyBhcmUgaW5kZXBlbmRlbnQsIGJ1dCBtYXkgYmUgc3dpdGNoZWQgKHVubGlrZSBpc0FsaWduZWQpXHJcbiAgICpcclxuICAgKiBpLmUuIHRoZSAyeDIgcm90YXRpb25hbCBzdWItbWF0cml4IGlzIG9mIG9uZSBvZiB0aGUgdHdvIGZvcm1zOlxyXG4gICAqIEEgMCAgb3IgIDAgIEFcclxuICAgKiAwIEIgICAgICBCICAwXHJcbiAgICogVGhpcyBtZWFucyB0aGF0IG1vdmluZyBhIHRyYW5zZm9ybWVkIHBvaW50IGJ5ICh4LDApIG9yICgwLHkpIHdpbGwgcmVzdWx0IGluIGEgbW90aW9uIGFsb25nIG9uZSBvZiB0aGUgYXhlcy5cclxuICAgKi9cclxuICBwdWJsaWMgaXNBeGlzQWxpZ25lZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmlzQWZmaW5lKCkgJiYgKCAoIHRoaXMubTAxKCkgPT09IDAgJiYgdGhpcy5tMTAoKSA9PT0gMCApIHx8ICggdGhpcy5tMDAoKSA9PT0gMCAmJiB0aGlzLm0xMSgpID09PSAwICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBldmVyeSBzaW5nbGUgZW50cnkgaW4gdGhpcyBtYXRyaXggaXMgYSBmaW5pdGUgbnVtYmVyIChub24tTmFOLCBub24taW5maW5pdGUpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc0Zpbml0ZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBpc0Zpbml0ZSggdGhpcy5tMDAoKSApICYmXHJcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTAxKCkgKSAmJlxyXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0wMigpICkgJiZcclxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMTAoKSApICYmXHJcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTExKCkgKSAmJlxyXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0xMigpICkgJiZcclxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMjAoKSApICYmXHJcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTIxKCkgKSAmJlxyXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0yMigpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBkZXRlcm1pbmFudCBvZiB0aGlzIG1hdHJpeC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RGV0ZXJtaW5hbnQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLm0wMCgpICogdGhpcy5tMTEoKSAqIHRoaXMubTIyKCkgKyB0aGlzLm0wMSgpICogdGhpcy5tMTIoKSAqIHRoaXMubTIwKCkgKyB0aGlzLm0wMigpICogdGhpcy5tMTAoKSAqIHRoaXMubTIxKCkgLSB0aGlzLm0wMigpICogdGhpcy5tMTEoKSAqIHRoaXMubTIwKCkgLSB0aGlzLm0wMSgpICogdGhpcy5tMTAoKSAqIHRoaXMubTIyKCkgLSB0aGlzLm0wMCgpICogdGhpcy5tMTIoKSAqIHRoaXMubTIxKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGRldGVybWluYW50KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldERldGVybWluYW50KCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgMkQgdHJhbnNsYXRpb24sIGFzc3VtaW5nIG11bHRpcGxpY2F0aW9uIHdpdGggYSBob21vZ2VuZW91cyB2ZWN0b3JcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VHJhbnNsYXRpb24oKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMubTAyKCksIHRoaXMubTEyKCkgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgdHJhbnNsYXRpb24oKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldFRyYW5zbGF0aW9uKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHZlY3RvciB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gKCBUKDEsMCkubWFnbml0dWRlKCksIFQoMCwxKS5tYWduaXR1ZGUoKSApIHdoZXJlIFQgaXMgYSByZWxhdGl2ZSB0cmFuc2Zvcm1cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U2NhbGVWZWN0b3IoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoXHJcbiAgICAgIE1hdGguc3FydCggdGhpcy5tMDAoKSAqIHRoaXMubTAwKCkgKyB0aGlzLm0xMCgpICogdGhpcy5tMTAoKSApLFxyXG4gICAgICBNYXRoLnNxcnQoIHRoaXMubTAxKCkgKiB0aGlzLm0wMSgpICsgdGhpcy5tMTEoKSAqIHRoaXMubTExKCkgKSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBzY2FsZVZlY3RvcigpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0U2NhbGVWZWN0b3IoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBhbmdsZSBpbiByYWRpYW5zIGZvciB0aGUgMmQgcm90YXRpb24gZnJvbSB0aGlzIG1hdHJpeCwgYmV0d2VlbiBwaSwgLXBpXHJcbiAgICovXHJcbiAgcHVibGljIGdldFJvdGF0aW9uKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gTWF0aC5hdGFuMiggdGhpcy5tMTAoKSwgdGhpcy5tMDAoKSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCByb3RhdGlvbigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRSb3RhdGlvbigpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gaWRlbnRpdHktcGFkZGVkIGNvcHkgb2YgdGhpcyBtYXRyaXggd2l0aCBhbiBpbmNyZWFzZWQgZGltZW5zaW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b01hdHJpeDQoKTogTWF0cml4NCB7XHJcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoXHJcbiAgICAgIHRoaXMubTAwKCksIHRoaXMubTAxKCksIHRoaXMubTAyKCksIDAsXHJcbiAgICAgIHRoaXMubTEwKCksIHRoaXMubTExKCksIHRoaXMubTEyKCksIDAsXHJcbiAgICAgIHRoaXMubTIwKCksIHRoaXMubTIxKCksIHRoaXMubTIyKCksIDAsXHJcbiAgICAgIDAsIDAsIDAsIDEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gaWRlbnRpdHktcGFkZGVkIGNvcHkgb2YgdGhpcyBtYXRyaXggd2l0aCBhbiBpbmNyZWFzZWQgZGltZW5zaW9uLCB0cmVhdGluZyB0aGlzIG1hdHJpeCdzIGFmZmluZVxyXG4gICAqIGNvbXBvbmVudHMgb25seS5cclxuICAgKi9cclxuICBwdWJsaWMgdG9BZmZpbmVNYXRyaXg0KCk6IE1hdHJpeDQge1xyXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxyXG4gICAgICB0aGlzLm0wMCgpLCB0aGlzLm0wMSgpLCAwLCB0aGlzLm0wMigpLFxyXG4gICAgICB0aGlzLm0xMCgpLCB0aGlzLm0xMSgpLCAwLCB0aGlzLm0xMigpLFxyXG4gICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAwLCAwLCAwLCAxICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIGZvcm0gb2YgdGhpcyBvYmplY3RcclxuICAgKi9cclxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgJHt0aGlzLm0wMCgpfSAke3RoaXMubTAxKCl9ICR7dGhpcy5tMDIoKX1cXG4ke1xyXG4gICAgICB0aGlzLm0xMCgpfSAke3RoaXMubTExKCl9ICR7dGhpcy5tMTIoKX1cXG4ke1xyXG4gICAgICB0aGlzLm0yMCgpfSAke3RoaXMubTIxKCl9ICR7dGhpcy5tMjIoKX1gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBTVkcgZm9ybSBvZiB0aGlzIG1hdHJpeCwgZm9yIGhpZ2gtcGVyZm9ybWFuY2UgcHJvY2Vzc2luZyBpbiBTVkcgb3V0cHV0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b1NWR01hdHJpeCgpOiBTVkdNYXRyaXgge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAnc3ZnJyApLmNyZWF0ZVNWR01hdHJpeCgpO1xyXG5cclxuICAgIC8vIHRvcCB0d28gcm93c1xyXG4gICAgcmVzdWx0LmEgPSB0aGlzLm0wMCgpO1xyXG4gICAgcmVzdWx0LmIgPSB0aGlzLm0xMCgpO1xyXG4gICAgcmVzdWx0LmMgPSB0aGlzLm0wMSgpO1xyXG4gICAgcmVzdWx0LmQgPSB0aGlzLm0xMSgpO1xyXG4gICAgcmVzdWx0LmUgPSB0aGlzLm0wMigpO1xyXG4gICAgcmVzdWx0LmYgPSB0aGlzLm0xMigpO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBDU1MgZm9ybSAoc2ltcGxpZmllZCBpZiBwb3NzaWJsZSkgZm9yIHRoaXMgdHJhbnNmb3JtYXRpb24gbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDU1NUcmFuc2Zvcm0oKTogc3RyaW5nIHtcclxuICAgIC8vIFNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLXRyYW5zZm9ybXMvLCBwYXJ0aWN1bGFybHkgU2VjdGlvbiAxMyB0aGF0IGRpc2N1c3NlcyB0aGUgU1ZHIGNvbXBhdGliaWxpdHlcclxuXHJcbiAgICAvLyBXZSBuZWVkIHRvIHByZXZlbnQgdGhlIG51bWJlcnMgZnJvbSBiZWluZyBpbiBhbiBleHBvbmVudGlhbCB0b1N0cmluZyBmb3JtLCBzaW5jZSB0aGUgQ1NTIHRyYW5zZm9ybSBkb2VzIG5vdCBzdXBwb3J0IHRoYXRcclxuICAgIC8vIDIwIGlzIHRoZSBsYXJnZXN0IGd1YXJhbnRlZWQgbnVtYmVyIG9mIGRpZ2l0cyBhY2NvcmRpbmcgdG8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9OdW1iZXIvdG9GaXhlZFxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzM2XHJcblxyXG4gICAgLy8gdGhlIGlubmVyIHBhcnQgb2YgYSBDU1MzIHRyYW5zZm9ybSwgYnV0IHJlbWVtYmVyIHRvIGFkZCB0aGUgYnJvd3Nlci1zcGVjaWZpYyBwYXJ0cyFcclxuICAgIC8vIE5PVEU6IHRoZSB0b0ZpeGVkIGNhbGxzIGFyZSBpbmxpbmVkIGZvciBwZXJmb3JtYW5jZSByZWFzb25zXHJcbiAgICByZXR1cm4gYG1hdHJpeCgke3RoaXMuZW50cmllc1sgMCBdLnRvRml4ZWQoIDIwICl9LCR7dGhpcy5lbnRyaWVzWyAxIF0udG9GaXhlZCggMjAgKX0sJHt0aGlzLmVudHJpZXNbIDMgXS50b0ZpeGVkKCAyMCApfSwke3RoaXMuZW50cmllc1sgNCBdLnRvRml4ZWQoIDIwICl9LCR7dGhpcy5lbnRyaWVzWyA2IF0udG9GaXhlZCggMjAgKX0sJHt0aGlzLmVudHJpZXNbIDcgXS50b0ZpeGVkKCAyMCApfSlgOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhZC1zaW0tdGV4dFxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBjc3NUcmFuc2Zvcm0oKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZ2V0Q1NTVHJhbnNmb3JtKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgQ1NTLWxpa2UgU1ZHIG1hdHJpeCBmb3JtIGZvciB0aGlzIHRyYW5zZm9ybWF0aW9uIG1hdHJpeC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U1ZHVHJhbnNmb3JtKCk6IHN0cmluZyB7XHJcbiAgICAvLyBTVkcgdHJhbnNmb3JtIHByZXNlbnRhdGlvbiBhdHRyaWJ1dGUuIFNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvY29vcmRzLmh0bWwjVHJhbnNmb3JtQXR0cmlidXRlXHJcbiAgICBzd2l0Y2goIHRoaXMudHlwZSApIHtcclxuICAgICAgY2FzZSBNYXRyaXgzVHlwZS5JREVOVElUWTpcclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgIGNhc2UgTWF0cml4M1R5cGUuVFJBTlNMQVRJT05fMkQ6XHJcbiAgICAgICAgcmV0dXJuIGB0cmFuc2xhdGUoJHt0b1NWR051bWJlciggdGhpcy5lbnRyaWVzWyA2IF0gKX0sJHt0b1NWR051bWJlciggdGhpcy5lbnRyaWVzWyA3IF0gKX0pYDtcclxuICAgICAgY2FzZSBNYXRyaXgzVHlwZS5TQ0FMSU5HOlxyXG4gICAgICAgIHJldHVybiBgc2NhbGUoJHt0b1NWR051bWJlciggdGhpcy5lbnRyaWVzWyAwIF0gKX0ke3RoaXMuZW50cmllc1sgMCBdID09PSB0aGlzLmVudHJpZXNbIDQgXSA/ICcnIDogYCwke3RvU1ZHTnVtYmVyKCB0aGlzLmVudHJpZXNbIDQgXSApfWB9KWA7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuIGBtYXRyaXgoJHt0b1NWR051bWJlciggdGhpcy5lbnRyaWVzWyAwIF0gKX0sJHt0b1NWR051bWJlciggdGhpcy5lbnRyaWVzWyAxIF0gKX0sJHt0b1NWR051bWJlciggdGhpcy5lbnRyaWVzWyAzIF0gKX0sJHt0b1NWR051bWJlciggdGhpcy5lbnRyaWVzWyA0IF0gKX0sJHt0b1NWR051bWJlciggdGhpcy5lbnRyaWVzWyA2IF0gKX0sJHt0b1NWR051bWJlciggdGhpcy5lbnRyaWVzWyA3IF0gKX0pYDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3ZnVHJhbnNmb3JtKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmdldFNWR1RyYW5zZm9ybSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBwYXJhbWV0ZXIgb2JqZWN0IHN1aXRhYmxlIGZvciB1c2Ugd2l0aCBqUXVlcnkncyAuY3NzKClcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q1NTVHJhbnNmb3JtU3R5bGVzKCk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xyXG4gICAgY29uc3QgdHJhbnNmb3JtQ1NTID0gdGhpcy5nZXRDU1NUcmFuc2Zvcm0oKTtcclxuXHJcbiAgICAvLyBub3RlcyBvbiB0cmlnZ2VyaW5nIGhhcmR3YXJlIGFjY2VsZXJhdGlvbjogaHR0cDovL2NyZWF0aXZlanMuY29tLzIwMTEvMTIvZGF5LTItZ3B1LWFjY2VsZXJhdGUteW91ci1kb20tZWxlbWVudHMvXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAvLyBmb3JjZSBpT1MgaGFyZHdhcmUgYWNjZWxlcmF0aW9uXHJcbiAgICAgICctd2Via2l0LXBlcnNwZWN0aXZlJzogJzEwMDAnLFxyXG4gICAgICAnLXdlYmtpdC1iYWNrZmFjZS12aXNpYmlsaXR5JzogJ2hpZGRlbicsXHJcblxyXG4gICAgICAnLXdlYmtpdC10cmFuc2Zvcm0nOiBgJHt0cmFuc2Zvcm1DU1N9IHRyYW5zbGF0ZVooMClgLCAvLyB0cmlnZ2VyIGhhcmR3YXJlIGFjY2VsZXJhdGlvbiBpZiBwb3NzaWJsZVxyXG4gICAgICAnLW1vei10cmFuc2Zvcm0nOiBgJHt0cmFuc2Zvcm1DU1N9IHRyYW5zbGF0ZVooMClgLCAvLyB0cmlnZ2VyIGhhcmR3YXJlIGFjY2VsZXJhdGlvbiBpZiBwb3NzaWJsZVxyXG4gICAgICAnLW1zLXRyYW5zZm9ybSc6IHRyYW5zZm9ybUNTUyxcclxuICAgICAgJy1vLXRyYW5zZm9ybSc6IHRyYW5zZm9ybUNTUyxcclxuICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm1DU1MsXHJcbiAgICAgICd0cmFuc2Zvcm0tb3JpZ2luJzogJ3RvcCBsZWZ0JywgLy8gYXQgdGhlIG9yaWdpbiBvZiB0aGUgY29tcG9uZW50LiBjb25zaWRlciAwcHggMHB4IGluc3RlYWQuIENyaXRpY2FsLCBzaW5jZSBvdGhlcndpc2UgdGhpcyBkZWZhdWx0cyB0byA1MCUgNTAlISEhIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0NTUy90cmFuc2Zvcm0tb3JpZ2luXHJcbiAgICAgICctbXMtdHJhbnNmb3JtLW9yaWdpbic6ICd0b3AgbGVmdCcgLy8gVE9ETzogZG8gd2UgbmVlZCBvdGhlciBwbGF0Zm9ybS1zcGVjaWZpYyB0cmFuc2Zvcm0tb3JpZ2luIHN0eWxlcz9cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGNzc1RyYW5zZm9ybVN0eWxlcygpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHsgcmV0dXJuIHRoaXMuZ2V0Q1NTVHJhbnNmb3JtU3R5bGVzKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBleGFjdCBlcXVhbGl0eSB3aXRoIGFub3RoZXIgbWF0cml4XHJcbiAgICovXHJcbiAgcHVibGljIGVxdWFscyggbWF0cml4OiBNYXRyaXgzICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMubTAwKCkgPT09IG1hdHJpeC5tMDAoKSAmJiB0aGlzLm0wMSgpID09PSBtYXRyaXgubTAxKCkgJiYgdGhpcy5tMDIoKSA9PT0gbWF0cml4Lm0wMigpICYmXHJcbiAgICAgICAgICAgdGhpcy5tMTAoKSA9PT0gbWF0cml4Lm0xMCgpICYmIHRoaXMubTExKCkgPT09IG1hdHJpeC5tMTEoKSAmJiB0aGlzLm0xMigpID09PSBtYXRyaXgubTEyKCkgJiZcclxuICAgICAgICAgICB0aGlzLm0yMCgpID09PSBtYXRyaXgubTIwKCkgJiYgdGhpcy5tMjEoKSA9PT0gbWF0cml4Lm0yMSgpICYmIHRoaXMubTIyKCkgPT09IG1hdHJpeC5tMjIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgZXF1YWxpdHkgd2l0aGluIGEgbWFyZ2luIG9mIGVycm9yIHdpdGggYW5vdGhlciBtYXRyaXhcclxuICAgKi9cclxuICBwdWJsaWMgZXF1YWxzRXBzaWxvbiggbWF0cml4OiBNYXRyaXgzLCBlcHNpbG9uOiBudW1iZXIgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gTWF0aC5hYnMoIHRoaXMubTAwKCkgLSBtYXRyaXgubTAwKCkgKSA8IGVwc2lsb24gJiZcclxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMDEoKSAtIG1hdHJpeC5tMDEoKSApIDwgZXBzaWxvbiAmJlxyXG4gICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm0wMigpIC0gbWF0cml4Lm0wMigpICkgPCBlcHNpbG9uICYmXHJcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTEwKCkgLSBtYXRyaXgubTEwKCkgKSA8IGVwc2lsb24gJiZcclxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMTEoKSAtIG1hdHJpeC5tMTEoKSApIDwgZXBzaWxvbiAmJlxyXG4gICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm0xMigpIC0gbWF0cml4Lm0xMigpICkgPCBlcHNpbG9uICYmXHJcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTIwKCkgLSBtYXRyaXgubTIwKCkgKSA8IGVwc2lsb24gJiZcclxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMjEoKSAtIG1hdHJpeC5tMjEoKSApIDwgZXBzaWxvbiAmJlxyXG4gICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm0yMigpIC0gbWF0cml4Lm0yMigpICkgPCBlcHNpbG9uO1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogSW1tdXRhYmxlIG9wZXJhdGlvbnMgKHJldHVybnMgYSBuZXcgbWF0cml4KVxyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBjb3B5IG9mIHRoaXMgbWF0cml4XHJcbiAgICovXHJcbiAgcHVibGljIGNvcHkoKTogTWF0cml4MyB7XHJcbiAgICByZXR1cm4gbTMoXHJcbiAgICAgIHRoaXMubTAwKCksIHRoaXMubTAxKCksIHRoaXMubTAyKCksXHJcbiAgICAgIHRoaXMubTEwKCksIHRoaXMubTExKCksIHRoaXMubTEyKCksXHJcbiAgICAgIHRoaXMubTIwKCksIHRoaXMubTIxKCksIHRoaXMubTIyKCksXHJcbiAgICAgIHRoaXMudHlwZVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgbWF0cml4LCBkZWZpbmVkIGJ5IHRoaXMgbWF0cml4IHBsdXMgdGhlIHByb3ZpZGVkIG1hdHJpeFxyXG4gICAqL1xyXG4gIHB1YmxpYyBwbHVzKCBtYXRyaXg6IE1hdHJpeDMgKTogTWF0cml4MyB7XHJcbiAgICByZXR1cm4gbTMoXHJcbiAgICAgIHRoaXMubTAwKCkgKyBtYXRyaXgubTAwKCksIHRoaXMubTAxKCkgKyBtYXRyaXgubTAxKCksIHRoaXMubTAyKCkgKyBtYXRyaXgubTAyKCksXHJcbiAgICAgIHRoaXMubTEwKCkgKyBtYXRyaXgubTEwKCksIHRoaXMubTExKCkgKyBtYXRyaXgubTExKCksIHRoaXMubTEyKCkgKyBtYXRyaXgubTEyKCksXHJcbiAgICAgIHRoaXMubTIwKCkgKyBtYXRyaXgubTIwKCksIHRoaXMubTIxKCkgKyBtYXRyaXgubTIxKCksIHRoaXMubTIyKCkgKyBtYXRyaXgubTIyKClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IG1hdHJpeCwgZGVmaW5lZCBieSB0aGlzIG1hdHJpeCBwbHVzIHRoZSBwcm92aWRlZCBtYXRyaXhcclxuICAgKi9cclxuICBwdWJsaWMgbWludXMoIG1hdHJpeDogTWF0cml4MyApOiBNYXRyaXgzIHtcclxuICAgIHJldHVybiBtMyhcclxuICAgICAgdGhpcy5tMDAoKSAtIG1hdHJpeC5tMDAoKSwgdGhpcy5tMDEoKSAtIG1hdHJpeC5tMDEoKSwgdGhpcy5tMDIoKSAtIG1hdHJpeC5tMDIoKSxcclxuICAgICAgdGhpcy5tMTAoKSAtIG1hdHJpeC5tMTAoKSwgdGhpcy5tMTEoKSAtIG1hdHJpeC5tMTEoKSwgdGhpcy5tMTIoKSAtIG1hdHJpeC5tMTIoKSxcclxuICAgICAgdGhpcy5tMjAoKSAtIG1hdHJpeC5tMjAoKSwgdGhpcy5tMjEoKSAtIG1hdHJpeC5tMjEoKSwgdGhpcy5tMjIoKSAtIG1hdHJpeC5tMjIoKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSB0cmFuc3Bvc2VkIGNvcHkgb2YgdGhpcyBtYXRyaXhcclxuICAgKi9cclxuICBwdWJsaWMgdHJhbnNwb3NlZCgpOiBNYXRyaXgzIHtcclxuICAgIHJldHVybiBtMyhcclxuICAgICAgdGhpcy5tMDAoKSwgdGhpcy5tMTAoKSwgdGhpcy5tMjAoKSxcclxuICAgICAgdGhpcy5tMDEoKSwgdGhpcy5tMTEoKSwgdGhpcy5tMjEoKSxcclxuICAgICAgdGhpcy5tMDIoKSwgdGhpcy5tMTIoKSwgdGhpcy5tMjIoKSwgKCB0aGlzLnR5cGUgPT09IE1hdHJpeDNUeXBlLklERU5USVRZIHx8IHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuU0NBTElORyApID8gdGhpcy50eXBlIDogdW5kZWZpbmVkXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5lZ2F0ZWQgY29weSBvZiB0aGlzIG1hdHJpeFxyXG4gICAqL1xyXG4gIHB1YmxpYyBuZWdhdGVkKCk6IE1hdHJpeDMge1xyXG4gICAgcmV0dXJuIG0zKFxyXG4gICAgICAtdGhpcy5tMDAoKSwgLXRoaXMubTAxKCksIC10aGlzLm0wMigpLFxyXG4gICAgICAtdGhpcy5tMTAoKSwgLXRoaXMubTExKCksIC10aGlzLm0xMigpLFxyXG4gICAgICAtdGhpcy5tMjAoKSwgLXRoaXMubTIxKCksIC10aGlzLm0yMigpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBpbnZlcnRlZCBjb3B5IG9mIHRoaXMgbWF0cml4XHJcbiAgICovXHJcbiAgcHVibGljIGludmVydGVkKCk6IE1hdHJpeDMge1xyXG4gICAgbGV0IGRldDtcclxuXHJcbiAgICBzd2l0Y2goIHRoaXMudHlwZSApIHtcclxuICAgICAgY2FzZSBNYXRyaXgzVHlwZS5JREVOVElUWTpcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgY2FzZSBNYXRyaXgzVHlwZS5UUkFOU0xBVElPTl8yRDpcclxuICAgICAgICByZXR1cm4gbTMoXHJcbiAgICAgICAgICAxLCAwLCAtdGhpcy5tMDIoKSxcclxuICAgICAgICAgIDAsIDEsIC10aGlzLm0xMigpLFxyXG4gICAgICAgICAgMCwgMCwgMSwgTWF0cml4M1R5cGUuVFJBTlNMQVRJT05fMkQgKTtcclxuICAgICAgY2FzZSBNYXRyaXgzVHlwZS5TQ0FMSU5HOlxyXG4gICAgICAgIHJldHVybiBtMyhcclxuICAgICAgICAgIDEgLyB0aGlzLm0wMCgpLCAwLCAwLFxyXG4gICAgICAgICAgMCwgMSAvIHRoaXMubTExKCksIDAsXHJcbiAgICAgICAgICAwLCAwLCAxIC8gdGhpcy5tMjIoKSwgTWF0cml4M1R5cGUuU0NBTElORyApO1xyXG4gICAgICBjYXNlIE1hdHJpeDNUeXBlLkFGRklORTpcclxuICAgICAgICBkZXQgPSB0aGlzLmdldERldGVybWluYW50KCk7XHJcbiAgICAgICAgaWYgKCBkZXQgIT09IDAgKSB7XHJcbiAgICAgICAgICByZXR1cm4gbTMoXHJcbiAgICAgICAgICAgICggLXRoaXMubTEyKCkgKiB0aGlzLm0yMSgpICsgdGhpcy5tMTEoKSAqIHRoaXMubTIyKCkgKSAvIGRldCxcclxuICAgICAgICAgICAgKCB0aGlzLm0wMigpICogdGhpcy5tMjEoKSAtIHRoaXMubTAxKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggLXRoaXMubTAyKCkgKiB0aGlzLm0xMSgpICsgdGhpcy5tMDEoKSAqIHRoaXMubTEyKCkgKSAvIGRldCxcclxuICAgICAgICAgICAgKCB0aGlzLm0xMigpICogdGhpcy5tMjAoKSAtIHRoaXMubTEwKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggLXRoaXMubTAyKCkgKiB0aGlzLm0yMCgpICsgdGhpcy5tMDAoKSAqIHRoaXMubTIyKCkgKSAvIGRldCxcclxuICAgICAgICAgICAgKCB0aGlzLm0wMigpICogdGhpcy5tMTAoKSAtIHRoaXMubTAwKCkgKiB0aGlzLm0xMigpICkgLyBkZXQsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIE1hdHJpeDNUeXBlLkFGRklORVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdNYXRyaXggY291bGQgbm90IGJlIGludmVydGVkLCBkZXRlcm1pbmFudCA9PT0gMCcgKTtcclxuICAgICAgICB9XHJcbiAgICAgIGNhc2UgTWF0cml4M1R5cGUuT1RIRVI6XHJcbiAgICAgICAgZGV0ID0gdGhpcy5nZXREZXRlcm1pbmFudCgpO1xyXG4gICAgICAgIGlmICggZGV0ICE9PSAwICkge1xyXG4gICAgICAgICAgcmV0dXJuIG0zKFxyXG4gICAgICAgICAgICAoIC10aGlzLm0xMigpICogdGhpcy5tMjEoKSArIHRoaXMubTExKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMDIoKSAqIHRoaXMubTIxKCkgLSB0aGlzLm0wMSgpICogdGhpcy5tMjIoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIC10aGlzLm0wMigpICogdGhpcy5tMTEoKSArIHRoaXMubTAxKCkgKiB0aGlzLm0xMigpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMTIoKSAqIHRoaXMubTIwKCkgLSB0aGlzLm0xMCgpICogdGhpcy5tMjIoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIC10aGlzLm0wMigpICogdGhpcy5tMjAoKSArIHRoaXMubTAwKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMDIoKSAqIHRoaXMubTEwKCkgLSB0aGlzLm0wMCgpICogdGhpcy5tMTIoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIC10aGlzLm0xMSgpICogdGhpcy5tMjAoKSArIHRoaXMubTEwKCkgKiB0aGlzLm0yMSgpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMDEoKSAqIHRoaXMubTIwKCkgLSB0aGlzLm0wMCgpICogdGhpcy5tMjEoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIC10aGlzLm0wMSgpICogdGhpcy5tMTAoKSArIHRoaXMubTAwKCkgKiB0aGlzLm0xMSgpICkgLyBkZXQsXHJcbiAgICAgICAgICAgIE1hdHJpeDNUeXBlLk9USEVSXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ01hdHJpeCBjb3VsZCBub3QgYmUgaW52ZXJ0ZWQsIGRldGVybWluYW50ID09PSAwJyApO1xyXG4gICAgICAgIH1cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBNYXRyaXgzLmludmVydGVkIHdpdGggdW5rbm93biB0eXBlOiAke3RoaXMudHlwZX1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbWF0cml4LCBkZWZpbmVkIGJ5IHRoZSBtdWx0aXBsaWNhdGlvbiBvZiB0aGlzICogbWF0cml4LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG1hdHJpeFxyXG4gICAqIEByZXR1cm5zIC0gTk9URTogdGhpcyBtYXkgYmUgdGhlIHNhbWUgbWF0cml4IVxyXG4gICAqL1xyXG4gIHB1YmxpYyB0aW1lc01hdHJpeCggbWF0cml4OiBNYXRyaXgzICk6IE1hdHJpeDMge1xyXG4gICAgLy8gSSAqIE0gPT09IE0gKiBJID09PSBNICh0aGUgaWRlbnRpdHkpXHJcbiAgICBpZiAoIHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuSURFTlRJVFkgfHwgbWF0cml4LnR5cGUgPT09IE1hdHJpeDNUeXBlLklERU5USVRZICkge1xyXG4gICAgICByZXR1cm4gdGhpcy50eXBlID09PSBNYXRyaXgzVHlwZS5JREVOVElUWSA/IG1hdHJpeCA6IHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLnR5cGUgPT09IG1hdHJpeC50eXBlICkge1xyXG4gICAgICAvLyBjdXJyZW50bHkgdHdvIG1hdHJpY2VzIG9mIHRoZSBzYW1lIHR5cGUgd2lsbCByZXN1bHQgaW4gdGhlIHNhbWUgcmVzdWx0IHR5cGVcclxuICAgICAgaWYgKCB0aGlzLnR5cGUgPT09IE1hdHJpeDNUeXBlLlRSQU5TTEFUSU9OXzJEICkge1xyXG4gICAgICAgIC8vIGZhc3RlciBjb21iaW5hdGlvbiBvZiB0cmFuc2xhdGlvbnNcclxuICAgICAgICByZXR1cm4gbTMoXHJcbiAgICAgICAgICAxLCAwLCB0aGlzLm0wMigpICsgbWF0cml4Lm0wMigpLFxyXG4gICAgICAgICAgMCwgMSwgdGhpcy5tMTIoKSArIG1hdHJpeC5tMTIoKSxcclxuICAgICAgICAgIDAsIDAsIDEsIE1hdHJpeDNUeXBlLlRSQU5TTEFUSU9OXzJEICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuU0NBTElORyApIHtcclxuICAgICAgICAvLyBmYXN0ZXIgY29tYmluYXRpb24gb2Ygc2NhbGluZ1xyXG4gICAgICAgIHJldHVybiBtMyhcclxuICAgICAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAwKCksIDAsIDAsXHJcbiAgICAgICAgICAwLCB0aGlzLm0xMSgpICogbWF0cml4Lm0xMSgpLCAwLFxyXG4gICAgICAgICAgMCwgMCwgMSwgTWF0cml4M1R5cGUuU0NBTElORyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLnR5cGUgIT09IE1hdHJpeDNUeXBlLk9USEVSICYmIG1hdHJpeC50eXBlICE9PSBNYXRyaXgzVHlwZS5PVEhFUiApIHtcclxuICAgICAgLy8gY3VycmVudGx5IHR3byBtYXRyaWNlcyB0aGF0IGFyZSBhbnl0aGluZyBidXQgXCJvdGhlclwiIGFyZSB0ZWNobmljYWxseSBhZmZpbmUsIGFuZCB0aGUgcmVzdWx0IHdpbGwgYmUgYWZmaW5lXHJcblxyXG4gICAgICAvLyBhZmZpbmUgY2FzZVxyXG4gICAgICByZXR1cm4gbTMoXHJcbiAgICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDAoKSArIHRoaXMubTAxKCkgKiBtYXRyaXgubTEwKCksXHJcbiAgICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDEoKSArIHRoaXMubTAxKCkgKiBtYXRyaXgubTExKCksXHJcbiAgICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDIoKSArIHRoaXMubTAxKCkgKiBtYXRyaXgubTEyKCkgKyB0aGlzLm0wMigpLFxyXG4gICAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMCgpLFxyXG4gICAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAxKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMSgpLFxyXG4gICAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMTIoKSxcclxuICAgICAgICAwLCAwLCAxLCBNYXRyaXgzVHlwZS5BRkZJTkUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBnZW5lcmFsIGNhc2VcclxuICAgIHJldHVybiBtMyhcclxuICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDAoKSArIHRoaXMubTAxKCkgKiBtYXRyaXgubTEwKCkgKyB0aGlzLm0wMigpICogbWF0cml4Lm0yMCgpLFxyXG4gICAgICB0aGlzLm0wMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMDEoKSAqIG1hdHJpeC5tMTEoKSArIHRoaXMubTAyKCkgKiBtYXRyaXgubTIxKCksXHJcbiAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjIoKSxcclxuICAgICAgdGhpcy5tMTAoKSAqIG1hdHJpeC5tMDAoKSArIHRoaXMubTExKCkgKiBtYXRyaXgubTEwKCkgKyB0aGlzLm0xMigpICogbWF0cml4Lm0yMCgpLFxyXG4gICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTEoKSArIHRoaXMubTEyKCkgKiBtYXRyaXgubTIxKCksXHJcbiAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMTIoKSAqIG1hdHJpeC5tMjIoKSxcclxuICAgICAgdGhpcy5tMjAoKSAqIG1hdHJpeC5tMDAoKSArIHRoaXMubTIxKCkgKiBtYXRyaXgubTEwKCkgKyB0aGlzLm0yMigpICogbWF0cml4Lm0yMCgpLFxyXG4gICAgICB0aGlzLm0yMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMjEoKSAqIG1hdHJpeC5tMTEoKSArIHRoaXMubTIyKCkgKiBtYXRyaXgubTIxKCksXHJcbiAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjIoKSApO1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogSW1tdXRhYmxlIG9wZXJhdGlvbnMgKHJldHVybnMgbmV3IGZvcm0gb2YgYSBwYXJhbWV0ZXIpXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbXVsdGlwbGljYXRpb24gb2YgdGhpcyBtYXRyaXggdGltZXMgdGhlIHByb3ZpZGVkIHZlY3RvciAodHJlYXRpbmcgdGhpcyBtYXRyaXggYXMgaG9tb2dlbmVvdXMsIHNvIHRoYXRcclxuICAgKiBpdCBpcyB0aGUgdGVjaG5pY2FsIG11bHRpcGxpY2F0aW9uIG9mICh4LHksMSkpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB0aW1lc1ZlY3RvcjIoIHZlY3RvcjI6IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcbiAgICBjb25zdCB4ID0gdGhpcy5tMDAoKSAqIHZlY3RvcjIueCArIHRoaXMubTAxKCkgKiB2ZWN0b3IyLnkgKyB0aGlzLm0wMigpO1xyXG4gICAgY29uc3QgeSA9IHRoaXMubTEwKCkgKiB2ZWN0b3IyLnggKyB0aGlzLm0xMSgpICogdmVjdG9yMi55ICsgdGhpcy5tMTIoKTtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMiggeCwgeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbXVsdGlwbGljYXRpb24gb2YgdGhpcyBtYXRyaXggdGltZXMgdGhlIHByb3ZpZGVkIHZlY3RvclxyXG4gICAqL1xyXG4gIHB1YmxpYyB0aW1lc1ZlY3RvcjMoIHZlY3RvcjM6IFZlY3RvcjMgKTogVmVjdG9yMyB7XHJcbiAgICBjb25zdCB4ID0gdGhpcy5tMDAoKSAqIHZlY3RvcjMueCArIHRoaXMubTAxKCkgKiB2ZWN0b3IzLnkgKyB0aGlzLm0wMigpICogdmVjdG9yMy56O1xyXG4gICAgY29uc3QgeSA9IHRoaXMubTEwKCkgKiB2ZWN0b3IzLnggKyB0aGlzLm0xMSgpICogdmVjdG9yMy55ICsgdGhpcy5tMTIoKSAqIHZlY3RvcjMuejtcclxuICAgIGNvbnN0IHogPSB0aGlzLm0yMCgpICogdmVjdG9yMy54ICsgdGhpcy5tMjEoKSAqIHZlY3RvcjMueSArIHRoaXMubTIyKCkgKiB2ZWN0b3IzLno7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIHgsIHksIHogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG11bHRpcGxpY2F0aW9uIG9mIHRoZSB0cmFuc3Bvc2Ugb2YgdGhpcyBtYXRyaXggdGltZXMgdGhlIHByb3ZpZGVkIHZlY3RvciAoYXNzdW1pbmcgdGhlIDJ4MiBxdWFkcmFudClcclxuICAgKi9cclxuICBwdWJsaWMgdGltZXNUcmFuc3Bvc2VWZWN0b3IyKCB2ZWN0b3IyOiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG4gICAgY29uc3QgeCA9IHRoaXMubTAwKCkgKiB2ZWN0b3IyLnggKyB0aGlzLm0xMCgpICogdmVjdG9yMi55O1xyXG4gICAgY29uc3QgeSA9IHRoaXMubTAxKCkgKiB2ZWN0b3IyLnggKyB0aGlzLm0xMSgpICogdmVjdG9yMi55O1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB4LCB5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUT0RPOiB0aGlzIG9wZXJhdGlvbiBzZWVtcyB0byBub3Qgd29yayBmb3IgdHJhbnNmb3JtRGVsdGEyLCBzaG91bGQgYmUgdmV0dGVkXHJcbiAgICovXHJcbiAgcHVibGljIHRpbWVzUmVsYXRpdmVWZWN0b3IyKCB2ZWN0b3IyOiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG4gICAgY29uc3QgeCA9IHRoaXMubTAwKCkgKiB2ZWN0b3IyLnggKyB0aGlzLm0wMSgpICogdmVjdG9yMi55O1xyXG4gICAgY29uc3QgeSA9IHRoaXMubTEwKCkgKiB2ZWN0b3IyLnkgKyB0aGlzLm0xMSgpICogdmVjdG9yMi55O1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB4LCB5ICk7XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBNdXRhYmxlIG9wZXJhdGlvbnMgKGNoYW5nZXMgdGhpcyBtYXRyaXgpXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgZW50aXJlIHN0YXRlIG9mIHRoZSBtYXRyaXgsIGluIHJvdy1tYWpvciBvcmRlci5cclxuICAgKlxyXG4gICAqIE5PVEU6IEV2ZXJ5IG11dGFibGUgbWV0aG9kIGdvZXMgdGhyb3VnaCByb3dNYWpvclxyXG4gICAqL1xyXG4gIHB1YmxpYyByb3dNYWpvciggdjAwOiBudW1iZXIsIHYwMTogbnVtYmVyLCB2MDI6IG51bWJlciwgdjEwOiBudW1iZXIsIHYxMTogbnVtYmVyLCB2MTI6IG51bWJlciwgdjIwOiBudW1iZXIsIHYyMTogbnVtYmVyLCB2MjI6IG51bWJlciwgdHlwZT86IE1hdHJpeDNUeXBlICk6IHRoaXMge1xyXG4gICAgdGhpcy5lbnRyaWVzWyAwIF0gPSB2MDA7XHJcbiAgICB0aGlzLmVudHJpZXNbIDEgXSA9IHYxMDtcclxuICAgIHRoaXMuZW50cmllc1sgMiBdID0gdjIwO1xyXG4gICAgdGhpcy5lbnRyaWVzWyAzIF0gPSB2MDE7XHJcbiAgICB0aGlzLmVudHJpZXNbIDQgXSA9IHYxMTtcclxuICAgIHRoaXMuZW50cmllc1sgNSBdID0gdjIxO1xyXG4gICAgdGhpcy5lbnRyaWVzWyA2IF0gPSB2MDI7XHJcbiAgICB0aGlzLmVudHJpZXNbIDcgXSA9IHYxMjtcclxuICAgIHRoaXMuZW50cmllc1sgOCBdID0gdjIyO1xyXG5cclxuICAgIC8vIFRPRE86IGNvbnNpZGVyIHBlcmZvcm1hbmNlIG9mIHRoZSBhZmZpbmUgY2hlY2sgaGVyZVxyXG4gICAgdGhpcy50eXBlID0gdHlwZSA9PT0gdW5kZWZpbmVkID8gKCAoIHYyMCA9PT0gMCAmJiB2MjEgPT09IDAgJiYgdjIyID09PSAxICkgPyBNYXRyaXgzVHlwZS5BRkZJTkUgOiBNYXRyaXgzVHlwZS5PVEhFUiApIDogdHlwZTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byBiZSBhIGNvcHkgb2YgYW5vdGhlciBtYXRyaXguXHJcbiAgICovXHJcbiAgcHVibGljIHNldCggbWF0cml4OiBNYXRyaXgzICk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXHJcbiAgICAgIG1hdHJpeC5tMDAoKSwgbWF0cml4Lm0wMSgpLCBtYXRyaXgubTAyKCksXHJcbiAgICAgIG1hdHJpeC5tMTAoKSwgbWF0cml4Lm0xMSgpLCBtYXRyaXgubTEyKCksXHJcbiAgICAgIG1hdHJpeC5tMjAoKSwgbWF0cml4Lm0yMSgpLCBtYXRyaXgubTIyKCksXHJcbiAgICAgIG1hdHJpeC50eXBlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgbWF0cml4IHRvIGJlIGEgY29weSBvZiB0aGUgY29sdW1uLW1ham9yIGRhdGEgc3RvcmVkIGluIGFuIGFycmF5IChlLmcuIFdlYkdMKS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0QXJyYXkoIGFycmF5OiBudW1iZXJbXSB8IEZsb2F0MzJBcnJheSB8IEZsb2F0NjRBcnJheSApOiB0aGlzIHtcclxuICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxyXG4gICAgICBhcnJheVsgMCBdLCBhcnJheVsgMyBdLCBhcnJheVsgNiBdLFxyXG4gICAgICBhcnJheVsgMSBdLCBhcnJheVsgNCBdLCBhcnJheVsgNyBdLFxyXG4gICAgICBhcnJheVsgMiBdLCBhcnJheVsgNSBdLCBhcnJheVsgOCBdICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBpbmRpdmlkdWFsIDAsMCBjb21wb25lbnQgb2YgdGhpcyBtYXRyaXguXHJcbiAgICovXHJcbiAgcHVibGljIHNldDAwKCB2YWx1ZTogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgdGhpcy5lbnRyaWVzWyAwIF0gPSB2YWx1ZTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgaW5kaXZpZHVhbCAwLDEgY29tcG9uZW50IG9mIHRoaXMgbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQwMSggdmFsdWU6IG51bWJlciApOiB0aGlzIHtcclxuICAgIHRoaXMuZW50cmllc1sgMyBdID0gdmFsdWU7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGluZGl2aWR1YWwgMCwyIGNvbXBvbmVudCBvZiB0aGlzIG1hdHJpeC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0MDIoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICB0aGlzLmVudHJpZXNbIDYgXSA9IHZhbHVlO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBpbmRpdmlkdWFsIDEsMCBjb21wb25lbnQgb2YgdGhpcyBtYXRyaXguXHJcbiAgICovXHJcbiAgcHVibGljIHNldDEwKCB2YWx1ZTogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgdGhpcy5lbnRyaWVzWyAxIF0gPSB2YWx1ZTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgaW5kaXZpZHVhbCAxLDEgY29tcG9uZW50IG9mIHRoaXMgbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQxMSggdmFsdWU6IG51bWJlciApOiB0aGlzIHtcclxuICAgIHRoaXMuZW50cmllc1sgNCBdID0gdmFsdWU7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGluZGl2aWR1YWwgMSwyIGNvbXBvbmVudCBvZiB0aGlzIG1hdHJpeC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0MTIoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICB0aGlzLmVudHJpZXNbIDcgXSA9IHZhbHVlO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBpbmRpdmlkdWFsIDIsMCBjb21wb25lbnQgb2YgdGhpcyBtYXRyaXguXHJcbiAgICovXHJcbiAgcHVibGljIHNldDIwKCB2YWx1ZTogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgdGhpcy5lbnRyaWVzWyAyIF0gPSB2YWx1ZTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgaW5kaXZpZHVhbCAyLDEgY29tcG9uZW50IG9mIHRoaXMgbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQyMSggdmFsdWU6IG51bWJlciApOiB0aGlzIHtcclxuICAgIHRoaXMuZW50cmllc1sgNSBdID0gdmFsdWU7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGluZGl2aWR1YWwgMiwyIGNvbXBvbmVudCBvZiB0aGlzIG1hdHJpeC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0MjIoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICB0aGlzLmVudHJpZXNbIDggXSA9IHZhbHVlO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYWtlcyB0aGlzIG1hdHJpeCBlZmZlY3RpdmVseSBpbW11dGFibGUgdG8gdGhlIG5vcm1hbCBtZXRob2RzIChleGNlcHQgZGlyZWN0IHNldHRlcnM/KVxyXG4gICAqL1xyXG4gIHB1YmxpYyBtYWtlSW1tdXRhYmxlKCk6IHRoaXMge1xyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIHRoaXMucm93TWFqb3IgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQ2Fubm90IG1vZGlmeSBpbW11dGFibGUgbWF0cml4JyApO1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBlbnRpcmUgc3RhdGUgb2YgdGhlIG1hdHJpeCwgaW4gY29sdW1uLW1ham9yIG9yZGVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb2x1bW5NYWpvciggdjAwOiBudW1iZXIsIHYxMDogbnVtYmVyLCB2MjA6IG51bWJlciwgdjAxOiBudW1iZXIsIHYxMTogbnVtYmVyLCB2MjE6IG51bWJlciwgdjAyOiBudW1iZXIsIHYxMjogbnVtYmVyLCB2MjI6IG51bWJlciwgdHlwZTogTWF0cml4M1R5cGUgKTogdGhpcyB7XHJcbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvciggdjAwLCB2MDEsIHYwMiwgdjEwLCB2MTEsIHYxMiwgdjIwLCB2MjEsIHYyMiwgdHlwZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byBpdHNlbGYgcGx1cyB0aGUgZ2l2ZW4gbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGQoIG1hdHJpeDogTWF0cml4MyApOiB0aGlzIHtcclxuICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxyXG4gICAgICB0aGlzLm0wMCgpICsgbWF0cml4Lm0wMCgpLCB0aGlzLm0wMSgpICsgbWF0cml4Lm0wMSgpLCB0aGlzLm0wMigpICsgbWF0cml4Lm0wMigpLFxyXG4gICAgICB0aGlzLm0xMCgpICsgbWF0cml4Lm0xMCgpLCB0aGlzLm0xMSgpICsgbWF0cml4Lm0xMSgpLCB0aGlzLm0xMigpICsgbWF0cml4Lm0xMigpLFxyXG4gICAgICB0aGlzLm0yMCgpICsgbWF0cml4Lm0yMCgpLCB0aGlzLm0yMSgpICsgbWF0cml4Lm0yMSgpLCB0aGlzLm0yMigpICsgbWF0cml4Lm0yMigpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byBpdHNlbGYgbWludXMgdGhlIGdpdmVuIG1hdHJpeC5cclxuICAgKi9cclxuICBwdWJsaWMgc3VidHJhY3QoIG06IE1hdHJpeDMgKTogdGhpcyB7XHJcbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcclxuICAgICAgdGhpcy5tMDAoKSAtIG0ubTAwKCksIHRoaXMubTAxKCkgLSBtLm0wMSgpLCB0aGlzLm0wMigpIC0gbS5tMDIoKSxcclxuICAgICAgdGhpcy5tMTAoKSAtIG0ubTEwKCksIHRoaXMubTExKCkgLSBtLm0xMSgpLCB0aGlzLm0xMigpIC0gbS5tMTIoKSxcclxuICAgICAgdGhpcy5tMjAoKSAtIG0ubTIwKCksIHRoaXMubTIxKCkgLSBtLm0yMSgpLCB0aGlzLm0yMigpIC0gbS5tMjIoKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhpcyBtYXRyaXggdG8gaXRzIG93biB0cmFuc3Bvc2UuXHJcbiAgICovXHJcbiAgcHVibGljIHRyYW5zcG9zZSgpOiB0aGlzIHtcclxuICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxyXG4gICAgICB0aGlzLm0wMCgpLCB0aGlzLm0xMCgpLCB0aGlzLm0yMCgpLFxyXG4gICAgICB0aGlzLm0wMSgpLCB0aGlzLm0xMSgpLCB0aGlzLm0yMSgpLFxyXG4gICAgICB0aGlzLm0wMigpLCB0aGlzLm0xMigpLCB0aGlzLm0yMigpLFxyXG4gICAgICAoIHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuSURFTlRJVFkgfHwgdGhpcy50eXBlID09PSBNYXRyaXgzVHlwZS5TQ0FMSU5HICkgPyB0aGlzLnR5cGUgOiB1bmRlZmluZWRcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgbWF0cml4IHRvIGl0cyBvd24gbmVnYXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIG5lZ2F0ZSgpOiB0aGlzIHtcclxuICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxyXG4gICAgICAtdGhpcy5tMDAoKSwgLXRoaXMubTAxKCksIC10aGlzLm0wMigpLFxyXG4gICAgICAtdGhpcy5tMTAoKSwgLXRoaXMubTExKCksIC10aGlzLm0xMigpLFxyXG4gICAgICAtdGhpcy5tMjAoKSwgLXRoaXMubTIxKCksIC10aGlzLm0yMigpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byBpdHMgb3duIGludmVyc2UuXHJcbiAgICovXHJcbiAgcHVibGljIGludmVydCgpOiB0aGlzIHtcclxuICAgIGxldCBkZXQ7XHJcblxyXG4gICAgc3dpdGNoKCB0aGlzLnR5cGUgKSB7XHJcbiAgICAgIGNhc2UgTWF0cml4M1R5cGUuSURFTlRJVFk6XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIGNhc2UgTWF0cml4M1R5cGUuVFJBTlNMQVRJT05fMkQ6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXHJcbiAgICAgICAgICAxLCAwLCAtdGhpcy5tMDIoKSxcclxuICAgICAgICAgIDAsIDEsIC10aGlzLm0xMigpLFxyXG4gICAgICAgICAgMCwgMCwgMSwgTWF0cml4M1R5cGUuVFJBTlNMQVRJT05fMkQgKTtcclxuICAgICAgY2FzZSBNYXRyaXgzVHlwZS5TQ0FMSU5HOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxyXG4gICAgICAgICAgMSAvIHRoaXMubTAwKCksIDAsIDAsXHJcbiAgICAgICAgICAwLCAxIC8gdGhpcy5tMTEoKSwgMCxcclxuICAgICAgICAgIDAsIDAsIDEgLyB0aGlzLm0yMigpLCBNYXRyaXgzVHlwZS5TQ0FMSU5HICk7XHJcbiAgICAgIGNhc2UgTWF0cml4M1R5cGUuQUZGSU5FOlxyXG4gICAgICAgIGRldCA9IHRoaXMuZ2V0RGV0ZXJtaW5hbnQoKTtcclxuICAgICAgICBpZiAoIGRldCAhPT0gMCApIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxyXG4gICAgICAgICAgICAoIC10aGlzLm0xMigpICogdGhpcy5tMjEoKSArIHRoaXMubTExKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMDIoKSAqIHRoaXMubTIxKCkgLSB0aGlzLm0wMSgpICogdGhpcy5tMjIoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIC10aGlzLm0wMigpICogdGhpcy5tMTEoKSArIHRoaXMubTAxKCkgKiB0aGlzLm0xMigpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMTIoKSAqIHRoaXMubTIwKCkgLSB0aGlzLm0xMCgpICogdGhpcy5tMjIoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIC10aGlzLm0wMigpICogdGhpcy5tMjAoKSArIHRoaXMubTAwKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMDIoKSAqIHRoaXMubTEwKCkgLSB0aGlzLm0wMCgpICogdGhpcy5tMTIoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAwLCAwLCAxLCBNYXRyaXgzVHlwZS5BRkZJTkVcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnTWF0cml4IGNvdWxkIG5vdCBiZSBpbnZlcnRlZCwgZGV0ZXJtaW5hbnQgPT09IDAnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICBjYXNlIE1hdHJpeDNUeXBlLk9USEVSOlxyXG4gICAgICAgIGRldCA9IHRoaXMuZ2V0RGV0ZXJtaW5hbnQoKTtcclxuICAgICAgICBpZiAoIGRldCAhPT0gMCApIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxyXG4gICAgICAgICAgICAoIC10aGlzLm0xMigpICogdGhpcy5tMjEoKSArIHRoaXMubTExKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMDIoKSAqIHRoaXMubTIxKCkgLSB0aGlzLm0wMSgpICogdGhpcy5tMjIoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIC10aGlzLm0wMigpICogdGhpcy5tMTEoKSArIHRoaXMubTAxKCkgKiB0aGlzLm0xMigpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMTIoKSAqIHRoaXMubTIwKCkgLSB0aGlzLm0xMCgpICogdGhpcy5tMjIoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIC10aGlzLm0wMigpICogdGhpcy5tMjAoKSArIHRoaXMubTAwKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMDIoKSAqIHRoaXMubTEwKCkgLSB0aGlzLm0wMCgpICogdGhpcy5tMTIoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIC10aGlzLm0xMSgpICogdGhpcy5tMjAoKSArIHRoaXMubTEwKCkgKiB0aGlzLm0yMSgpICkgLyBkZXQsXHJcbiAgICAgICAgICAgICggdGhpcy5tMDEoKSAqIHRoaXMubTIwKCkgLSB0aGlzLm0wMCgpICogdGhpcy5tMjEoKSApIC8gZGV0LFxyXG4gICAgICAgICAgICAoIC10aGlzLm0wMSgpICogdGhpcy5tMTAoKSArIHRoaXMubTAwKCkgKiB0aGlzLm0xMSgpICkgLyBkZXQsXHJcbiAgICAgICAgICAgIE1hdHJpeDNUeXBlLk9USEVSXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ01hdHJpeCBjb3VsZCBub3QgYmUgaW52ZXJ0ZWQsIGRldGVybWluYW50ID09PSAwJyApO1xyXG4gICAgICAgIH1cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBNYXRyaXgzLmludmVydGVkIHdpdGggdW5rbm93biB0eXBlOiAke3RoaXMudHlwZX1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgbWF0cml4IHRvIHRoZSB2YWx1ZSBvZiBpdHNlbGYgdGltZXMgdGhlIHByb3ZpZGVkIG1hdHJpeFxyXG4gICAqL1xyXG4gIHB1YmxpYyBtdWx0aXBseU1hdHJpeCggbWF0cml4OiBNYXRyaXgzICk6IHRoaXMge1xyXG4gICAgLy8gTSAqIEkgPT09IE0gKHRoZSBpZGVudGl0eSlcclxuICAgIGlmICggbWF0cml4LnR5cGUgPT09IE1hdHJpeDNUeXBlLklERU5USVRZICkge1xyXG4gICAgICAvLyBubyBjaGFuZ2UgbmVlZGVkXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEkgKiBNID09PSBNICh0aGUgaWRlbnRpdHkpXHJcbiAgICBpZiAoIHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuSURFTlRJVFkgKSB7XHJcbiAgICAgIC8vIGNvcHkgdGhlIG90aGVyIG1hdHJpeCB0byB1c1xyXG4gICAgICByZXR1cm4gdGhpcy5zZXQoIG1hdHJpeCApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy50eXBlID09PSBtYXRyaXgudHlwZSApIHtcclxuICAgICAgLy8gY3VycmVudGx5IHR3byBtYXRyaWNlcyBvZiB0aGUgc2FtZSB0eXBlIHdpbGwgcmVzdWx0IGluIHRoZSBzYW1lIHJlc3VsdCB0eXBlXHJcbiAgICAgIGlmICggdGhpcy50eXBlID09PSBNYXRyaXgzVHlwZS5UUkFOU0xBVElPTl8yRCApIHtcclxuICAgICAgICAvLyBmYXN0ZXIgY29tYmluYXRpb24gb2YgdHJhbnNsYXRpb25zXHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXHJcbiAgICAgICAgICAxLCAwLCB0aGlzLm0wMigpICsgbWF0cml4Lm0wMigpLFxyXG4gICAgICAgICAgMCwgMSwgdGhpcy5tMTIoKSArIG1hdHJpeC5tMTIoKSxcclxuICAgICAgICAgIDAsIDAsIDEsIE1hdHJpeDNUeXBlLlRSQU5TTEFUSU9OXzJEICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuU0NBTElORyApIHtcclxuICAgICAgICAvLyBmYXN0ZXIgY29tYmluYXRpb24gb2Ygc2NhbGluZ1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxyXG4gICAgICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDAoKSwgMCwgMCxcclxuICAgICAgICAgIDAsIHRoaXMubTExKCkgKiBtYXRyaXgubTExKCksIDAsXHJcbiAgICAgICAgICAwLCAwLCAxLCBNYXRyaXgzVHlwZS5TQ0FMSU5HICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMudHlwZSAhPT0gTWF0cml4M1R5cGUuT1RIRVIgJiYgbWF0cml4LnR5cGUgIT09IE1hdHJpeDNUeXBlLk9USEVSICkge1xyXG4gICAgICAvLyBjdXJyZW50bHkgdHdvIG1hdHJpY2VzIHRoYXQgYXJlIGFueXRoaW5nIGJ1dCBcIm90aGVyXCIgYXJlIHRlY2huaWNhbGx5IGFmZmluZSwgYW5kIHRoZSByZXN1bHQgd2lsbCBiZSBhZmZpbmVcclxuXHJcbiAgICAgIC8vIGFmZmluZSBjYXNlXHJcbiAgICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxyXG4gICAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMCgpLFxyXG4gICAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAxKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMSgpLFxyXG4gICAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMDIoKSxcclxuICAgICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMCgpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTAoKSxcclxuICAgICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTEoKSxcclxuICAgICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMigpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTIoKSArIHRoaXMubTEyKCksXHJcbiAgICAgICAgMCwgMCwgMSwgTWF0cml4M1R5cGUuQUZGSU5FICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ2VuZXJhbCBjYXNlXHJcbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcclxuICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDAoKSArIHRoaXMubTAxKCkgKiBtYXRyaXgubTEwKCkgKyB0aGlzLm0wMigpICogbWF0cml4Lm0yMCgpLFxyXG4gICAgICB0aGlzLm0wMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMDEoKSAqIG1hdHJpeC5tMTEoKSArIHRoaXMubTAyKCkgKiBtYXRyaXgubTIxKCksXHJcbiAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjIoKSxcclxuICAgICAgdGhpcy5tMTAoKSAqIG1hdHJpeC5tMDAoKSArIHRoaXMubTExKCkgKiBtYXRyaXgubTEwKCkgKyB0aGlzLm0xMigpICogbWF0cml4Lm0yMCgpLFxyXG4gICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTEoKSArIHRoaXMubTEyKCkgKiBtYXRyaXgubTIxKCksXHJcbiAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMTIoKSAqIG1hdHJpeC5tMjIoKSxcclxuICAgICAgdGhpcy5tMjAoKSAqIG1hdHJpeC5tMDAoKSArIHRoaXMubTIxKCkgKiBtYXRyaXgubTEwKCkgKyB0aGlzLm0yMigpICogbWF0cml4Lm0yMCgpLFxyXG4gICAgICB0aGlzLm0yMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMjEoKSAqIG1hdHJpeC5tMTEoKSArIHRoaXMubTIyKCkgKiBtYXRyaXgubTIxKCksXHJcbiAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjIoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTXV0YXRlcyB0aGlzIG1hdHJpeCwgZXF1aXZhbGVudCB0byAodHJhbnNsYXRpb24gKiB0aGlzKS5cclxuICAgKi9cclxuICBwdWJsaWMgcHJlcGVuZFRyYW5zbGF0aW9uKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiB0aGlzIHtcclxuICAgIHRoaXMuc2V0MDIoIHRoaXMubTAyKCkgKyB4ICk7XHJcbiAgICB0aGlzLnNldDEyKCB0aGlzLm0xMigpICsgeSApO1xyXG5cclxuICAgIGlmICggdGhpcy50eXBlID09PSBNYXRyaXgzVHlwZS5JREVOVElUWSB8fCB0aGlzLnR5cGUgPT09IE1hdHJpeDNUeXBlLlRSQU5TTEFUSU9OXzJEICkge1xyXG4gICAgICB0aGlzLnR5cGUgPSBNYXRyaXgzVHlwZS5UUkFOU0xBVElPTl8yRDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnR5cGUgPT09IE1hdHJpeDNUeXBlLk9USEVSICkge1xyXG4gICAgICB0aGlzLnR5cGUgPSBNYXRyaXgzVHlwZS5PVEhFUjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnR5cGUgPSBNYXRyaXgzVHlwZS5BRkZJTkU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpczsgLy8gZm9yIGNoYWluaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgbWF0cml4IHRvIHRoZSAzeDMgaWRlbnRpdHkgbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRUb0lkZW50aXR5KCk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXHJcbiAgICAgIDEsIDAsIDAsXHJcbiAgICAgIDAsIDEsIDAsXHJcbiAgICAgIDAsIDAsIDEsXHJcbiAgICAgIE1hdHJpeDNUeXBlLklERU5USVRZICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgbWF0cml4IHRvIHRoZSBhZmZpbmUgdHJhbnNsYXRpb24gbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRUb1RyYW5zbGF0aW9uKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiB0aGlzIHtcclxuICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxyXG4gICAgICAxLCAwLCB4LFxyXG4gICAgICAwLCAxLCB5LFxyXG4gICAgICAwLCAwLCAxLFxyXG4gICAgICBNYXRyaXgzVHlwZS5UUkFOU0xBVElPTl8yRCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byB0aGUgYWZmaW5lIHNjYWxpbmcgbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRUb1NjYWxlKCB4OiBudW1iZXIsIHk/OiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICAvLyBhbGxvdyB1c2luZyBvbmUgcGFyYW1ldGVyIHRvIHNjYWxlIGV2ZXJ5dGhpbmdcclxuICAgIHkgPSB5ID09PSB1bmRlZmluZWQgPyB4IDogeTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcclxuICAgICAgeCwgMCwgMCxcclxuICAgICAgMCwgeSwgMCxcclxuICAgICAgMCwgMCwgMSxcclxuICAgICAgTWF0cml4M1R5cGUuU0NBTElORyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byBhbiBhZmZpbmUgbWF0cml4IHdpdGggdGhlIHNwZWNpZmllZCByb3ctbWFqb3IgdmFsdWVzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRUb0FmZmluZSggbTAwOiBudW1iZXIsIG0wMTogbnVtYmVyLCBtMDI6IG51bWJlciwgbTEwOiBudW1iZXIsIG0xMTogbnVtYmVyLCBtMTI6IG51bWJlciApOiB0aGlzIHtcclxuICAgIHJldHVybiB0aGlzLnJvd01ham9yKCBtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCAwLCAwLCAxLCBNYXRyaXgzVHlwZS5BRkZJTkUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIG1hdHJpeCB0byBhIHJvdGF0aW9uIGRlZmluZWQgYnkgYSByb3RhdGlvbiBvZiB0aGUgc3BlY2lmaWVkIGFuZ2xlIGFyb3VuZCB0aGUgZ2l2ZW4gdW5pdCBheGlzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGF4aXMgLSBub3JtYWxpemVkXHJcbiAgICogQHBhcmFtIGFuZ2xlIC0gaW4gcmFkaWFuc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRUb1JvdGF0aW9uQXhpc0FuZ2xlKCBheGlzOiBWZWN0b3IzLCBhbmdsZTogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgbGV0IGMgPSBNYXRoLmNvcyggYW5nbGUgKTtcclxuICAgIGxldCBzID0gTWF0aC5zaW4oIGFuZ2xlICk7XHJcblxyXG4gICAgLy8gSGFuZGxlIGNhc2VzIGNsb3NlIHRvIDAsIHNpbmNlIHdlIHdhbnQgTWF0aC5QSS8yIHJvdGF0aW9ucyAoYW5kIHRoZSBsaWtlKSB0byBiZSBleGFjdFxyXG4gICAgaWYgKCBNYXRoLmFicyggYyApIDwgMWUtMTUgKSB7XHJcbiAgICAgIGMgPSAwO1xyXG4gICAgfVxyXG4gICAgaWYgKCBNYXRoLmFicyggcyApIDwgMWUtMTUgKSB7XHJcbiAgICAgIHMgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IEMgPSAxIC0gYztcclxuXHJcbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcclxuICAgICAgYXhpcy54ICogYXhpcy54ICogQyArIGMsIGF4aXMueCAqIGF4aXMueSAqIEMgLSBheGlzLnogKiBzLCBheGlzLnggKiBheGlzLnogKiBDICsgYXhpcy55ICogcyxcclxuICAgICAgYXhpcy55ICogYXhpcy54ICogQyArIGF4aXMueiAqIHMsIGF4aXMueSAqIGF4aXMueSAqIEMgKyBjLCBheGlzLnkgKiBheGlzLnogKiBDIC0gYXhpcy54ICogcyxcclxuICAgICAgYXhpcy56ICogYXhpcy54ICogQyAtIGF4aXMueSAqIHMsIGF4aXMueiAqIGF4aXMueSAqIEMgKyBheGlzLnggKiBzLCBheGlzLnogKiBheGlzLnogKiBDICsgYyxcclxuICAgICAgTWF0cml4M1R5cGUuT1RIRVIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhpcyBtYXRyaXggdG8gYSByb3RhdGlvbiBhcm91bmQgdGhlIHggYXhpcyAoaW4gdGhlIHl6IHBsYW5lKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBhbmdsZSAtIGluIHJhZGlhbnNcclxuICAgKi9cclxuICBwdWJsaWMgc2V0VG9Sb3RhdGlvblgoIGFuZ2xlOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBsZXQgYyA9IE1hdGguY29zKCBhbmdsZSApO1xyXG4gICAgbGV0IHMgPSBNYXRoLnNpbiggYW5nbGUgKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgY2FzZXMgY2xvc2UgdG8gMCwgc2luY2Ugd2Ugd2FudCBNYXRoLlBJLzIgcm90YXRpb25zIChhbmQgdGhlIGxpa2UpIHRvIGJlIGV4YWN0XHJcbiAgICBpZiAoIE1hdGguYWJzKCBjICkgPCAxZS0xNSApIHtcclxuICAgICAgYyA9IDA7XHJcbiAgICB9XHJcbiAgICBpZiAoIE1hdGguYWJzKCBzICkgPCAxZS0xNSApIHtcclxuICAgICAgcyA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXHJcbiAgICAgIDEsIDAsIDAsXHJcbiAgICAgIDAsIGMsIC1zLFxyXG4gICAgICAwLCBzLCBjLFxyXG4gICAgICBNYXRyaXgzVHlwZS5PVEhFUiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byBhIHJvdGF0aW9uIGFyb3VuZCB0aGUgeSBheGlzIChpbiB0aGUgeHogcGxhbmUpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGFuZ2xlIC0gaW4gcmFkaWFuc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRUb1JvdGF0aW9uWSggYW5nbGU6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGxldCBjID0gTWF0aC5jb3MoIGFuZ2xlICk7XHJcbiAgICBsZXQgcyA9IE1hdGguc2luKCBhbmdsZSApO1xyXG5cclxuICAgIC8vIEhhbmRsZSBjYXNlcyBjbG9zZSB0byAwLCBzaW5jZSB3ZSB3YW50IE1hdGguUEkvMiByb3RhdGlvbnMgKGFuZCB0aGUgbGlrZSkgdG8gYmUgZXhhY3RcclxuICAgIGlmICggTWF0aC5hYnMoIGMgKSA8IDFlLTE1ICkge1xyXG4gICAgICBjID0gMDtcclxuICAgIH1cclxuICAgIGlmICggTWF0aC5hYnMoIHMgKSA8IDFlLTE1ICkge1xyXG4gICAgICBzID0gMDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcclxuICAgICAgYywgMCwgcyxcclxuICAgICAgMCwgMSwgMCxcclxuICAgICAgLXMsIDAsIGMsXHJcbiAgICAgIE1hdHJpeDNUeXBlLk9USEVSICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgbWF0cml4IHRvIGEgcm90YXRpb24gYXJvdW5kIHRoZSB6IGF4aXMgKGluIHRoZSB4eSBwbGFuZSkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYW5nbGUgLSBpbiByYWRpYW5zXHJcbiAgICovXHJcbiAgcHVibGljIHNldFRvUm90YXRpb25aKCBhbmdsZTogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgbGV0IGMgPSBNYXRoLmNvcyggYW5nbGUgKTtcclxuICAgIGxldCBzID0gTWF0aC5zaW4oIGFuZ2xlICk7XHJcblxyXG4gICAgLy8gSGFuZGxlIGNhc2VzIGNsb3NlIHRvIDAsIHNpbmNlIHdlIHdhbnQgTWF0aC5QSS8yIHJvdGF0aW9ucyAoYW5kIHRoZSBsaWtlKSB0byBiZSBleGFjdFxyXG4gICAgaWYgKCBNYXRoLmFicyggYyApIDwgMWUtMTUgKSB7XHJcbiAgICAgIGMgPSAwO1xyXG4gICAgfVxyXG4gICAgaWYgKCBNYXRoLmFicyggcyApIDwgMWUtMTUgKSB7XHJcbiAgICAgIHMgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxyXG4gICAgICBjLCAtcywgMCxcclxuICAgICAgcywgYywgMCxcclxuICAgICAgMCwgMCwgMSxcclxuICAgICAgTWF0cml4M1R5cGUuQUZGSU5FICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgbWF0cml4IHRvIHRoZSBjb21iaW5lZCB0cmFuc2xhdGlvbityb3RhdGlvbiAod2hlcmUgdGhlIHJvdGF0aW9uIGxvZ2ljYWxseSB3b3VsZCBoYXBwZW4gZmlyc3QsIFRIRU4gaXRcclxuICAgKiB3b3VsZCBiZSB0cmFuc2xhdGVkKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB4XHJcbiAgICogQHBhcmFtIHlcclxuICAgKiBAcGFyYW0gYW5nbGUgLSBpbiByYWRpYW5zXHJcbiAgICovXHJcbiAgcHVibGljIHNldFRvVHJhbnNsYXRpb25Sb3RhdGlvbiggeDogbnVtYmVyLCB5OiBudW1iZXIsIGFuZ2xlOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBsZXQgYyA9IE1hdGguY29zKCBhbmdsZSApO1xyXG4gICAgbGV0IHMgPSBNYXRoLnNpbiggYW5nbGUgKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgY2FzZXMgY2xvc2UgdG8gMCwgc2luY2Ugd2Ugd2FudCBNYXRoLlBJLzIgcm90YXRpb25zIChhbmQgdGhlIGxpa2UpIHRvIGJlIGV4YWN0XHJcbiAgICBpZiAoIE1hdGguYWJzKCBjICkgPCAxZS0xNSApIHtcclxuICAgICAgYyA9IDA7XHJcbiAgICB9XHJcbiAgICBpZiAoIE1hdGguYWJzKCBzICkgPCAxZS0xNSApIHtcclxuICAgICAgcyA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXHJcbiAgICAgIGMsIC1zLCB4LFxyXG4gICAgICBzLCBjLCB5LFxyXG4gICAgICAwLCAwLCAxLFxyXG4gICAgICBNYXRyaXgzVHlwZS5BRkZJTkUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhpcyBtYXRyaXggdG8gdGhlIGNvbWJpbmVkIHRyYW5zbGF0aW9uK3JvdGF0aW9uICh3aGVyZSB0aGUgcm90YXRpb24gbG9naWNhbGx5IHdvdWxkIGhhcHBlbiBmaXJzdCwgVEhFTiBpdFxyXG4gICAqIHdvdWxkIGJlIHRyYW5zbGF0ZWQpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHRyYW5zbGF0aW9uXHJcbiAgICogQHBhcmFtIGFuZ2xlIC0gaW4gcmFkaWFuc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRUb1RyYW5zbGF0aW9uUm90YXRpb25Qb2ludCggdHJhbnNsYXRpb246IFZlY3RvcjIsIGFuZ2xlOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRUb1RyYW5zbGF0aW9uUm90YXRpb24oIHRyYW5zbGF0aW9uLngsIHRyYW5zbGF0aW9uLnksIGFuZ2xlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgbWF0cml4IHRvIHRoZSB2YWx1ZXMgY29udGFpbmVkIGluIGFuIFNWR01hdHJpeC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0VG9TVkdNYXRyaXgoIHN2Z01hdHJpeDogU1ZHTWF0cml4ICk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXHJcbiAgICAgIHN2Z01hdHJpeC5hLCBzdmdNYXRyaXguYywgc3ZnTWF0cml4LmUsXHJcbiAgICAgIHN2Z01hdHJpeC5iLCBzdmdNYXRyaXguZCwgc3ZnTWF0cml4LmYsXHJcbiAgICAgIDAsIDAsIDEsXHJcbiAgICAgIE1hdHJpeDNUeXBlLkFGRklORSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byBhIHJvdGF0aW9uIG1hdHJpeCB0aGF0IHJvdGF0ZXMgQSB0byBCIChWZWN0b3IzIGluc3RhbmNlcyksIGJ5IHJvdGF0aW5nIGFib3V0IHRoZSBheGlzXHJcbiAgICogQS5jcm9zcyggQiApIC0tIFNob3J0ZXN0IHBhdGguIGlkZWFsbHkgc2hvdWxkIGJlIHVuaXQgdmVjdG9ycy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Um90YXRpb25BVG9CKCBhOiBWZWN0b3IzLCBiOiBWZWN0b3IzICk6IHRoaXMge1xyXG4gICAgLy8gc2VlIGh0dHA6Ly9ncmFwaGljcy5jcy5icm93bi5lZHUvfmpmaC9wYXBlcnMvTW9sbGVyLUVCQS0xOTk5L3BhcGVyLnBkZiBmb3IgaW5mb3JtYXRpb24gb24gdGhpcyBpbXBsZW1lbnRhdGlvblxyXG4gICAgY29uc3Qgc3RhcnQgPSBhO1xyXG4gICAgY29uc3QgZW5kID0gYjtcclxuXHJcbiAgICBjb25zdCBlcHNpbG9uID0gMC4wMDAxO1xyXG5cclxuICAgIGxldCB2ID0gc3RhcnQuY3Jvc3MoIGVuZCApO1xyXG4gICAgY29uc3QgZSA9IHN0YXJ0LmRvdCggZW5kICk7XHJcbiAgICBjb25zdCBmID0gKCBlIDwgMCApID8gLWUgOiBlO1xyXG5cclxuICAgIC8vIGlmIFwiZnJvbVwiIGFuZCBcInRvXCIgdmVjdG9ycyBhcmUgbmVhcmx5IHBhcmFsbGVsXHJcbiAgICBpZiAoIGYgPiAxLjAgLSBlcHNpbG9uICkge1xyXG4gICAgICBsZXQgeCA9IG5ldyBWZWN0b3IzKFxyXG4gICAgICAgICggc3RhcnQueCA+IDAuMCApID8gc3RhcnQueCA6IC1zdGFydC54LFxyXG4gICAgICAgICggc3RhcnQueSA+IDAuMCApID8gc3RhcnQueSA6IC1zdGFydC55LFxyXG4gICAgICAgICggc3RhcnQueiA+IDAuMCApID8gc3RhcnQueiA6IC1zdGFydC56XHJcbiAgICAgICk7XHJcblxyXG4gICAgICBpZiAoIHgueCA8IHgueSApIHtcclxuICAgICAgICBpZiAoIHgueCA8IHgueiApIHtcclxuICAgICAgICAgIHggPSBWZWN0b3IzLlhfVU5JVDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB4ID0gVmVjdG9yMy5aX1VOSVQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICggeC55IDwgeC56ICkge1xyXG4gICAgICAgICAgeCA9IFZlY3RvcjMuWV9VTklUO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHggPSBWZWN0b3IzLlpfVU5JVDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHUgPSB4Lm1pbnVzKCBzdGFydCApO1xyXG4gICAgICB2ID0geC5taW51cyggZW5kICk7XHJcblxyXG4gICAgICBjb25zdCBjMSA9IDIuMCAvIHUuZG90KCB1ICk7XHJcbiAgICAgIGNvbnN0IGMyID0gMi4wIC8gdi5kb3QoIHYgKTtcclxuICAgICAgY29uc3QgYzMgPSBjMSAqIGMyICogdS5kb3QoIHYgKTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxyXG4gICAgICAgIC1jMSAqIHUueCAqIHUueCAtIGMyICogdi54ICogdi54ICsgYzMgKiB2LnggKiB1LnggKyAxLFxyXG4gICAgICAgIC1jMSAqIHUueCAqIHUueSAtIGMyICogdi54ICogdi55ICsgYzMgKiB2LnggKiB1LnksXHJcbiAgICAgICAgLWMxICogdS54ICogdS56IC0gYzIgKiB2LnggKiB2LnogKyBjMyAqIHYueCAqIHUueixcclxuICAgICAgICAtYzEgKiB1LnkgKiB1LnggLSBjMiAqIHYueSAqIHYueCArIGMzICogdi55ICogdS54LFxyXG4gICAgICAgIC1jMSAqIHUueSAqIHUueSAtIGMyICogdi55ICogdi55ICsgYzMgKiB2LnkgKiB1LnkgKyAxLFxyXG4gICAgICAgIC1jMSAqIHUueSAqIHUueiAtIGMyICogdi55ICogdi56ICsgYzMgKiB2LnkgKiB1LnosXHJcbiAgICAgICAgLWMxICogdS56ICogdS54IC0gYzIgKiB2LnogKiB2LnggKyBjMyAqIHYueiAqIHUueCxcclxuICAgICAgICAtYzEgKiB1LnogKiB1LnkgLSBjMiAqIHYueiAqIHYueSArIGMzICogdi56ICogdS55LFxyXG4gICAgICAgIC1jMSAqIHUueiAqIHUueiAtIGMyICogdi56ICogdi56ICsgYzMgKiB2LnogKiB1LnogKyAxXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gdGhlIG1vc3QgY29tbW9uIGNhc2UsIHVubGVzcyBcInN0YXJ0XCI9XCJlbmRcIiwgb3IgXCJzdGFydFwiPS1cImVuZFwiXHJcbiAgICAgIGNvbnN0IGggPSAxLjAgLyAoIDEuMCArIGUgKTtcclxuICAgICAgY29uc3QgaHZ4ID0gaCAqIHYueDtcclxuICAgICAgY29uc3QgaHZ6ID0gaCAqIHYuejtcclxuICAgICAgY29uc3QgaHZ4eSA9IGh2eCAqIHYueTtcclxuICAgICAgY29uc3QgaHZ4eiA9IGh2eCAqIHYuejtcclxuICAgICAgY29uc3QgaHZ5eiA9IGh2eiAqIHYueTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxyXG4gICAgICAgIGUgKyBodnggKiB2LngsIGh2eHkgLSB2LnosIGh2eHogKyB2LnksXHJcbiAgICAgICAgaHZ4eSArIHYueiwgZSArIGggKiB2LnkgKiB2LnksIGh2eXogLSB2LngsXHJcbiAgICAgICAgaHZ4eiAtIHYueSwgaHZ5eiArIHYueCwgZSArIGh2eiAqIHYuelxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogTXV0YWJsZSBvcGVyYXRpb25zIChjaGFuZ2VzIHRoZSBwYXJhbWV0ZXIpXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdmVjdG9yIHRvIHRoZSByZXN1bHQgb2YgKG1hdHJpeCAqIHZlY3RvciksIGFzIGEgaG9tb2dlbmVvdXMgbXVsdGlwbGljYXRpb24uXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyAtIFRoZSB2ZWN0b3IgdGhhdCB3YXMgbXV0YXRlZFxyXG4gICAqL1xyXG4gIHB1YmxpYyBtdWx0aXBseVZlY3RvcjIoIHZlY3RvcjI6IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdmVjdG9yMi5zZXRYWShcclxuICAgICAgdGhpcy5tMDAoKSAqIHZlY3RvcjIueCArIHRoaXMubTAxKCkgKiB2ZWN0b3IyLnkgKyB0aGlzLm0wMigpLFxyXG4gICAgICB0aGlzLm0xMCgpICogdmVjdG9yMi54ICsgdGhpcy5tMTEoKSAqIHZlY3RvcjIueSArIHRoaXMubTEyKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHZlY3RvciB0byB0aGUgcmVzdWx0IG9mIChtYXRyaXggKiB2ZWN0b3IpLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgLSBUaGUgdmVjdG9yIHRoYXQgd2FzIG11dGF0ZWRcclxuICAgKi9cclxuICBwdWJsaWMgbXVsdGlwbHlWZWN0b3IzKCB2ZWN0b3IzOiBWZWN0b3IzICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIHZlY3RvcjMuc2V0WFlaKFxyXG4gICAgICB0aGlzLm0wMCgpICogdmVjdG9yMy54ICsgdGhpcy5tMDEoKSAqIHZlY3RvcjMueSArIHRoaXMubTAyKCkgKiB2ZWN0b3IzLnosXHJcbiAgICAgIHRoaXMubTEwKCkgKiB2ZWN0b3IzLnggKyB0aGlzLm0xMSgpICogdmVjdG9yMy55ICsgdGhpcy5tMTIoKSAqIHZlY3RvcjMueixcclxuICAgICAgdGhpcy5tMjAoKSAqIHZlY3RvcjMueCArIHRoaXMubTIxKCkgKiB2ZWN0b3IzLnkgKyB0aGlzLm0yMigpICogdmVjdG9yMy56ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB2ZWN0b3IgdG8gdGhlIHJlc3VsdCBvZiAodHJhbnNwb3NlKG1hdHJpeCkgKiB2ZWN0b3IpLCBpZ25vcmluZyB0aGUgdHJhbnNsYXRpb24gcGFyYW1ldGVycy5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIC0gVGhlIHZlY3RvciB0aGF0IHdhcyBtdXRhdGVkXHJcbiAgICovXHJcbiAgcHVibGljIG11bHRpcGx5VHJhbnNwb3NlVmVjdG9yMiggdjogVmVjdG9yMiApOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB2LnNldFhZKFxyXG4gICAgICB0aGlzLm0wMCgpICogdi54ICsgdGhpcy5tMTAoKSAqIHYueSxcclxuICAgICAgdGhpcy5tMDEoKSAqIHYueCArIHRoaXMubTExKCkgKiB2LnkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHZlY3RvciB0byB0aGUgcmVzdWx0IG9mIChtYXRyaXggKiB2ZWN0b3IgLSBtYXRyaXggKiB6ZXJvKS4gU2luY2UgdGhpcyBpcyBhIGhvbW9nZW5lb3VzIG9wZXJhdGlvbiwgaXQgaXNcclxuICAgKiBlcXVpdmFsZW50IHRvIHRoZSBtdWx0aXBsaWNhdGlvbiBvZiAoeCx5LDApLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgLSBUaGUgdmVjdG9yIHRoYXQgd2FzIG11dGF0ZWRcclxuICAgKi9cclxuICBwdWJsaWMgbXVsdGlwbHlSZWxhdGl2ZVZlY3RvcjIoIHY6IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdi5zZXRYWShcclxuICAgICAgdGhpcy5tMDAoKSAqIHYueCArIHRoaXMubTAxKCkgKiB2LnksXHJcbiAgICAgIHRoaXMubTEwKCkgKiB2LnkgKyB0aGlzLm0xMSgpICogdi55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB0cmFuc2Zvcm0gb2YgYSBDYW52YXMgMkQgcmVuZGVyaW5nIGNvbnRleHQgdG8gdGhlIGFmZmluZSBwYXJ0IG9mIHRoaXMgbWF0cml4XHJcbiAgICovXHJcbiAgcHVibGljIGNhbnZhc1NldFRyYW5zZm9ybSggY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEICk6IHZvaWQge1xyXG4gICAgY29udGV4dC5zZXRUcmFuc2Zvcm0oXHJcbiAgICAgIC8vIGlubGluZWQgYXJyYXkgZW50cmllc1xyXG4gICAgICB0aGlzLmVudHJpZXNbIDAgXSxcclxuICAgICAgdGhpcy5lbnRyaWVzWyAxIF0sXHJcbiAgICAgIHRoaXMuZW50cmllc1sgMyBdLFxyXG4gICAgICB0aGlzLmVudHJpZXNbIDQgXSxcclxuICAgICAgdGhpcy5lbnRyaWVzWyA2IF0sXHJcbiAgICAgIHRoaXMuZW50cmllc1sgNyBdXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXBwZW5kcyB0byB0aGUgYWZmaW5lIHBhcnQgb2YgdGhpcyBtYXRyaXggdG8gdGhlIENhbnZhcyAyRCByZW5kZXJpbmcgY29udGV4dFxyXG4gICAqL1xyXG4gIHB1YmxpYyBjYW52YXNBcHBlbmRUcmFuc2Zvcm0oIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy50eXBlICE9PSBNYXRyaXgzVHlwZS5JREVOVElUWSApIHtcclxuICAgICAgY29udGV4dC50cmFuc2Zvcm0oXHJcbiAgICAgICAgLy8gaW5saW5lZCBhcnJheSBlbnRyaWVzXHJcbiAgICAgICAgdGhpcy5lbnRyaWVzWyAwIF0sXHJcbiAgICAgICAgdGhpcy5lbnRyaWVzWyAxIF0sXHJcbiAgICAgICAgdGhpcy5lbnRyaWVzWyAzIF0sXHJcbiAgICAgICAgdGhpcy5lbnRyaWVzWyA0IF0sXHJcbiAgICAgICAgdGhpcy5lbnRyaWVzWyA2IF0sXHJcbiAgICAgICAgdGhpcy5lbnRyaWVzWyA3IF1cclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvcGllcyB0aGUgZW50cmllcyBvZiB0aGlzIG1hdHJpeCBvdmVyIHRvIGFuIGFyYml0cmFyeSBhcnJheSAodHlwZWQgb3Igbm9ybWFsKS5cclxuICAgKi9cclxuICBwdWJsaWMgY29weVRvQXJyYXkoIGFycmF5OiBudW1iZXJbXSB8IEZsb2F0MzJBcnJheSB8IEZsb2F0NjRBcnJheSApOiBudW1iZXJbXSB8IEZsb2F0MzJBcnJheSB8IEZsb2F0NjRBcnJheSB7XHJcbiAgICBhcnJheVsgMCBdID0gdGhpcy5tMDAoKTtcclxuICAgIGFycmF5WyAxIF0gPSB0aGlzLm0xMCgpO1xyXG4gICAgYXJyYXlbIDIgXSA9IHRoaXMubTIwKCk7XHJcbiAgICBhcnJheVsgMyBdID0gdGhpcy5tMDEoKTtcclxuICAgIGFycmF5WyA0IF0gPSB0aGlzLm0xMSgpO1xyXG4gICAgYXJyYXlbIDUgXSA9IHRoaXMubTIxKCk7XHJcbiAgICBhcnJheVsgNiBdID0gdGhpcy5tMDIoKTtcclxuICAgIGFycmF5WyA3IF0gPSB0aGlzLm0xMigpO1xyXG4gICAgYXJyYXlbIDggXSA9IHRoaXMubTIyKCk7XHJcbiAgICByZXR1cm4gYXJyYXk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZnJlZVRvUG9vbCgpOiB2b2lkIHtcclxuICAgIE1hdHJpeDMucG9vbC5mcmVlVG9Qb29sKCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHBvb2wgPSBuZXcgUG9vbCggTWF0cml4Mywge1xyXG4gICAgaW5pdGlhbGl6ZTogTWF0cml4My5wcm90b3R5cGUuaW5pdGlhbGl6ZSxcclxuICAgIHVzZURlZmF1bHRDb25zdHJ1Y3Rpb246IHRydWUsXHJcbiAgICBtYXhTaXplOiAzMDBcclxuICB9ICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gaWRlbnRpdHkgbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgaWRlbnRpdHkoKTogTWF0cml4MyB7XHJcbiAgICByZXR1cm4gZnJvbVBvb2woKS5zZXRUb0lkZW50aXR5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdHJhbnNsYXRpb24gbWF0cml4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgdHJhbnNsYXRpb24oIHg6IG51bWJlciwgeTogbnVtYmVyICk6IE1hdHJpeDMge1xyXG4gICAgcmV0dXJuIGZyb21Qb29sKCkuc2V0VG9UcmFuc2xhdGlvbiggeCwgeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHRyYW5zbGF0aW9uIG1hdHJpeCBjb21wdXRlZCBmcm9tIGEgdmVjdG9yLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgdHJhbnNsYXRpb25Gcm9tVmVjdG9yKCB2ZWN0b3I6IFZlY3RvcjIgfCBWZWN0b3IzICk6IE1hdHJpeDMge1xyXG4gICAgcmV0dXJuIE1hdHJpeDMudHJhbnNsYXRpb24oIHZlY3Rvci54LCB2ZWN0b3IueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG1hdHJpeCB0aGF0IHNjYWxlcyB0aGluZ3MgaW4gZWFjaCBkaW1lbnNpb24uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBzY2FsaW5nKCB4OiBudW1iZXIsIHk/OiBudW1iZXIgKTogTWF0cml4MyB7XHJcbiAgICByZXR1cm4gZnJvbVBvb2woKS5zZXRUb1NjYWxlKCB4LCB5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbWF0cml4IHRoYXQgc2NhbGVzIHRoaW5ncyBpbiBlYWNoIGRpbWVuc2lvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHNjYWxlKCB4OiBudW1iZXIsIHk/OiBudW1iZXIgKTogTWF0cml4MyB7XHJcbiAgICByZXR1cm4gTWF0cml4My5zY2FsaW5nKCB4LCB5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFmZmluZSBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gcGFyYW1ldGVycy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGFmZmluZSggbTAwOiBudW1iZXIsIG0wMTogbnVtYmVyLCBtMDI6IG51bWJlciwgbTEwOiBudW1iZXIsIG0xMTogbnVtYmVyLCBtMTI6IG51bWJlciApOiBNYXRyaXgzIHtcclxuICAgIHJldHVybiBmcm9tUG9vbCgpLnNldFRvQWZmaW5lKCBtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IG1hdHJpeCB3aXRoIGFsbCBlbnRyaWVzIGRldGVybWluZWQgaW4gcm93LW1ham9yIG9yZGVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcm93TWFqb3IoIHYwMDogbnVtYmVyLCB2MDE6IG51bWJlciwgdjAyOiBudW1iZXIsIHYxMDogbnVtYmVyLCB2MTE6IG51bWJlciwgdjEyOiBudW1iZXIsIHYyMDogbnVtYmVyLCB2MjE6IG51bWJlciwgdjIyOiBudW1iZXIsIHR5cGU/OiBNYXRyaXgzVHlwZSApOiBNYXRyaXgzIHtcclxuICAgIHJldHVybiBmcm9tUG9vbCgpLnJvd01ham9yKFxyXG4gICAgICB2MDAsIHYwMSwgdjAyLFxyXG4gICAgICB2MTAsIHYxMSwgdjEyLFxyXG4gICAgICB2MjAsIHYyMSwgdjIyLFxyXG4gICAgICB0eXBlXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG1hdHJpeCByb3RhdGlvbiBkZWZpbmVkIGJ5IGEgcm90YXRpb24gb2YgdGhlIHNwZWNpZmllZCBhbmdsZSBhcm91bmQgdGhlIGdpdmVuIHVuaXQgYXhpcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBheGlzIC0gbm9ybWFsaXplZFxyXG4gICAqIEBwYXJhbSBhbmdsZSAtIGluIHJhZGlhbnNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJvdGF0aW9uQXhpc0FuZ2xlKCBheGlzOiBWZWN0b3IzLCBhbmdsZTogbnVtYmVyICk6IE1hdHJpeDMge1xyXG4gICAgcmV0dXJuIGZyb21Qb29sKCkuc2V0VG9Sb3RhdGlvbkF4aXNBbmdsZSggYXhpcywgYW5nbGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBtYXRyaXggdGhhdCByb3RhdGVzIGFyb3VuZCB0aGUgeCBheGlzIChpbiB0aGUgeXogcGxhbmUpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGFuZ2xlIC0gaW4gcmFkaWFuc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRpb25YKCBhbmdsZTogbnVtYmVyICk6IE1hdHJpeDMge1xyXG4gICAgcmV0dXJuIGZyb21Qb29sKCkuc2V0VG9Sb3RhdGlvblgoIGFuZ2xlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbWF0cml4IHRoYXQgcm90YXRlcyBhcm91bmQgdGhlIHkgYXhpcyAoaW4gdGhlIHh6IHBsYW5lKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBhbmdsZSAtIGluIHJhZGlhbnNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJvdGF0aW9uWSggYW5nbGU6IG51bWJlciApOiBNYXRyaXgzIHtcclxuICAgIHJldHVybiBmcm9tUG9vbCgpLnNldFRvUm90YXRpb25ZKCBhbmdsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG1hdHJpeCB0aGF0IHJvdGF0ZXMgYXJvdW5kIHRoZSB6IGF4aXMgKGluIHRoZSB4eSBwbGFuZSkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYW5nbGUgLSBpbiByYWRpYW5zXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByb3RhdGlvblooIGFuZ2xlOiBudW1iZXIgKTogTWF0cml4MyB7XHJcbiAgICByZXR1cm4gZnJvbVBvb2woKS5zZXRUb1JvdGF0aW9uWiggYW5nbGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBjb21iaW5lZCAyZCB0cmFuc2xhdGlvbiArIHJvdGF0aW9uICh3aXRoIHRoZSByb3RhdGlvbiBlZmZlY3RpdmVseSBhcHBsaWVkIGZpcnN0KS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBhbmdsZSAtIGluIHJhZGlhbnNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHRyYW5zbGF0aW9uUm90YXRpb24oIHg6IG51bWJlciwgeTogbnVtYmVyLCBhbmdsZTogbnVtYmVyICk6IE1hdHJpeDMge1xyXG4gICAgcmV0dXJuIGZyb21Qb29sKCkuc2V0VG9UcmFuc2xhdGlvblJvdGF0aW9uKCB4LCB5LCBhbmdsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhbmRhcmQgMmQgcm90YXRpb24gbWF0cml4IGZvciBhIGdpdmVuIGFuZ2xlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGFuZ2xlIC0gaW4gcmFkaWFuc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRpb24yKCBhbmdsZTogbnVtYmVyICk6IE1hdHJpeDMge1xyXG4gICAgcmV0dXJuIGZyb21Qb29sKCkuc2V0VG9Sb3RhdGlvblooIGFuZ2xlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbWF0cml4IHdoaWNoIHdpbGwgYmUgYSAyZCByb3RhdGlvbiBhcm91bmQgYSBnaXZlbiB4LHkgcG9pbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYW5nbGUgLSBpbiByYWRpYW5zXHJcbiAgICogQHBhcmFtIHhcclxuICAgKiBAcGFyYW0geVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRpb25Bcm91bmQoIGFuZ2xlOiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyICk6IE1hdHJpeDMge1xyXG4gICAgcmV0dXJuIE1hdHJpeDMudHJhbnNsYXRpb24oIHgsIHkgKS50aW1lc01hdHJpeCggTWF0cml4My5yb3RhdGlvbjIoIGFuZ2xlICkgKS50aW1lc01hdHJpeCggTWF0cml4My50cmFuc2xhdGlvbiggLXgsIC15ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBtYXRyaXggd2hpY2ggd2lsbCBiZSBhIDJkIHJvdGF0aW9uIGFyb3VuZCBhIGdpdmVuIDJkIHBvaW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGFuZ2xlIC0gaW4gcmFkaWFuc1xyXG4gICAqIEBwYXJhbSBwb2ludFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRpb25Bcm91bmRQb2ludCggYW5nbGU6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIgKTogTWF0cml4MyB7XHJcbiAgICByZXR1cm4gTWF0cml4My5yb3RhdGlvbkFyb3VuZCggYW5nbGUsIHBvaW50LngsIHBvaW50LnkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBtYXRyaXggZXF1aXZhbGVudCB0byBhIGdpdmVuIFNWR01hdHJpeC5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGZyb21TVkdNYXRyaXgoIHN2Z01hdHJpeDogU1ZHTWF0cml4ICk6IE1hdHJpeDMge1xyXG4gICAgcmV0dXJuIGZyb21Qb29sKCkuc2V0VG9TVkdNYXRyaXgoIHN2Z01hdHJpeCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHJvdGF0aW9uIG1hdHJpeCB0aGF0IHJvdGF0ZXMgQSB0byBCLCBieSByb3RhdGluZyBhYm91dCB0aGUgYXhpcyBBLmNyb3NzKCBCICkgLS0gU2hvcnRlc3QgcGF0aC4gaWRlYWxseVxyXG4gICAqIHNob3VsZCBiZSB1bml0IHZlY3RvcnMuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByb3RhdGVBVG9CKCBhOiBWZWN0b3IzLCBiOiBWZWN0b3IzICk6IE1hdHJpeDMge1xyXG4gICAgcmV0dXJuIGZyb21Qb29sKCkuc2V0Um90YXRpb25BVG9CKCBhLCBiICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaG9ydGN1dCBmb3IgdHJhbnNsYXRpb24gdGltZXMgYSBtYXRyaXggKHdpdGhvdXQgYWxsb2NhdGluZyBhIHRyYW5zbGF0aW9uIG1hdHJpeCksIHNlZSBzY2VuZXJ5IzExOVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgdHJhbnNsYXRpb25UaW1lc01hdHJpeCggeDogbnVtYmVyLCB5OiBudW1iZXIsIG1hdHJpeDogTWF0cml4MyApOiBNYXRyaXgzIHtcclxuICAgIGxldCB0eXBlO1xyXG4gICAgaWYgKCBtYXRyaXgudHlwZSA9PT0gTWF0cml4M1R5cGUuSURFTlRJVFkgfHwgbWF0cml4LnR5cGUgPT09IE1hdHJpeDNUeXBlLlRSQU5TTEFUSU9OXzJEICkge1xyXG4gICAgICByZXR1cm4gbTMoXHJcbiAgICAgICAgMSwgMCwgbWF0cml4Lm0wMigpICsgeCxcclxuICAgICAgICAwLCAxLCBtYXRyaXgubTEyKCkgKyB5LFxyXG4gICAgICAgIDAsIDAsIDEsXHJcbiAgICAgICAgTWF0cml4M1R5cGUuVFJBTlNMQVRJT05fMkQgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBtYXRyaXgudHlwZSA9PT0gTWF0cml4M1R5cGUuT1RIRVIgKSB7XHJcbiAgICAgIHR5cGUgPSBNYXRyaXgzVHlwZS5PVEhFUjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0eXBlID0gTWF0cml4M1R5cGUuQUZGSU5FO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG0zKFxyXG4gICAgICBtYXRyaXgubTAwKCksIG1hdHJpeC5tMDEoKSwgbWF0cml4Lm0wMigpICsgeCxcclxuICAgICAgbWF0cml4Lm0xMCgpLCBtYXRyaXgubTExKCksIG1hdHJpeC5tMTIoKSArIHksXHJcbiAgICAgIG1hdHJpeC5tMjAoKSwgbWF0cml4Lm0yMSgpLCBtYXRyaXgubTIyKCksXHJcbiAgICAgIHR5cGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlcmlhbGl6ZSB0byBhbiBPYmplY3QgdGhhdCBjYW4gYmUgaGFuZGxlZCBieSBQaEVULWlPXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyB0b1N0YXRlT2JqZWN0KCBtYXRyaXgzOiBNYXRyaXgzICk6IE1hdHJpeDNTdGF0ZU9iamVjdCB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlbnRyaWVzOiBtYXRyaXgzLmVudHJpZXMsXHJcbiAgICAgIHR5cGU6IG1hdHJpeDMudHlwZS5uYW1lXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCBiYWNrIGZyb20gYSBzZXJpYWxpemVkIE9iamVjdCB0byBhIE1hdHJpeDNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3Q6IE1hdHJpeDNTdGF0ZU9iamVjdCApOiBNYXRyaXgzIHtcclxuICAgIGNvbnN0IG1hdHJpeCA9IE1hdHJpeDMuaWRlbnRpdHkoKTtcclxuICAgIG1hdHJpeC5lbnRyaWVzID0gc3RhdGVPYmplY3QuZW50cmllcztcclxuICAgIG1hdHJpeC50eXBlID0gTWF0cml4M1R5cGUuZW51bWVyYXRpb24uZ2V0VmFsdWUoIHN0YXRlT2JqZWN0LnR5cGUgKTtcclxuICAgIHJldHVybiBtYXRyaXg7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIElERU5USVRZOiBNYXRyaXgzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHVwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxyXG4gIHB1YmxpYyBzdGF0aWMgWF9SRUZMRUNUSU9OOiBNYXRyaXgzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHVwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxyXG4gIHB1YmxpYyBzdGF0aWMgWV9SRUZMRUNUSU9OOiBNYXRyaXgzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHVwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxyXG4gIHB1YmxpYyBzdGF0aWMgTWF0cml4M0lPOiBJT1R5cGU7XHJcbn1cclxuXHJcbmRvdC5yZWdpc3RlciggJ01hdHJpeDMnLCBNYXRyaXgzICk7XHJcblxyXG5jb25zdCBmcm9tUG9vbCA9IE1hdHJpeDMucG9vbC5mZXRjaC5iaW5kKCBNYXRyaXgzLnBvb2wgKTtcclxuXHJcbmNvbnN0IG0zID0gKCB2MDA6IG51bWJlciwgdjAxOiBudW1iZXIsIHYwMjogbnVtYmVyLCB2MTA6IG51bWJlciwgdjExOiBudW1iZXIsIHYxMjogbnVtYmVyLCB2MjA6IG51bWJlciwgdjIxOiBudW1iZXIsIHYyMjogbnVtYmVyLCB0eXBlPzogTWF0cml4M1R5cGUgKTogTWF0cml4MyA9PiB7XHJcbiAgcmV0dXJuIGZyb21Qb29sKCkucm93TWFqb3IoIHYwMCwgdjAxLCB2MDIsIHYxMCwgdjExLCB2MTIsIHYyMCwgdjIxLCB2MjIsIHR5cGUgKTtcclxufTtcclxuZXhwb3J0IHsgbTMgfTtcclxuZG90LnJlZ2lzdGVyKCAnbTMnLCBtMyApO1xyXG5cclxuTWF0cml4My5JREVOVElUWSA9IE1hdHJpeDMuaWRlbnRpdHkoKS5tYWtlSW1tdXRhYmxlKCk7XHJcbk1hdHJpeDMuWF9SRUZMRUNUSU9OID0gbTMoXHJcbiAgLTEsIDAsIDAsXHJcbiAgMCwgMSwgMCxcclxuICAwLCAwLCAxLFxyXG4gIE1hdHJpeDNUeXBlLkFGRklORVxyXG4pLm1ha2VJbW11dGFibGUoKTtcclxuTWF0cml4My5ZX1JFRkxFQ1RJT04gPSBtMyhcclxuICAxLCAwLCAwLFxyXG4gIDAsIC0xLCAwLFxyXG4gIDAsIDAsIDEsXHJcbiAgTWF0cml4M1R5cGUuQUZGSU5FXHJcbikubWFrZUltbXV0YWJsZSgpO1xyXG5cclxuTWF0cml4My5NYXRyaXgzSU8gPSBuZXcgSU9UeXBlKCAnTWF0cml4M0lPJywge1xyXG4gIHZhbHVlVHlwZTogTWF0cml4MyxcclxuICBkb2N1bWVudGF0aW9uOiAnQSAzeDMgbWF0cml4IG9mdGVuIHVzZWQgZm9yIGhvbGRpbmcgdHJhbnNmb3JtIGRhdGEuJyxcclxuICB0b1N0YXRlT2JqZWN0OiAoIG1hdHJpeDM6IE1hdHJpeDMgKSA9PiBNYXRyaXgzLnRvU3RhdGVPYmplY3QoIG1hdHJpeDMgKSxcclxuICBmcm9tU3RhdGVPYmplY3Q6IE1hdHJpeDMuZnJvbVN0YXRlT2JqZWN0LFxyXG4gIHN0YXRlU2NoZW1hOiB7XHJcbiAgICBlbnRyaWVzOiBBcnJheUlPKCBOdW1iZXJJTyApLFxyXG4gICAgdHlwZTogRW51bWVyYXRpb25JTyggTWF0cml4M1R5cGUgKVxyXG4gIH1cclxufSApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsYUFBYSxNQUFNLHdDQUF3QztBQUNsRSxPQUFPQyxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxPQUFPQyxHQUFHLE1BQU0sVUFBVTtBQUMxQixPQUFPQyxPQUFPLE1BQU0sY0FBYztBQUNsQyxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBQzFDLE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBQ2xDLE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBQ2xDLE9BQU9DLGdCQUFnQixNQUFNLHdDQUF3QztBQUNyRSxPQUFPQyxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9B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QUMsQ0FBQztRQUMzQixJQUFLOEMsR0FBRyxLQUFLLENBQUMsRUFBRztVQUNmLE9BQU9QLEVBQUUsQ0FDUCxDQUFFLENBQUMsSUFBSSxDQUFDbkQsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ksR0FBRyxDQUFDLENBQUMsSUFBS3VELEdBQUcsRUFDNUQsQ0FBRSxJQUFJLENBQUM3RCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNOLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTyxHQUFHLENBQUMsQ0FBQyxJQUFLdUQsR0FBRyxFQUMzRCxDQUFFLENBQUMsSUFBSSxDQUFDN0QsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ksR0FBRyxDQUFDLENBQUMsSUFBSzBELEdBQUcsRUFDNUQsQ0FBRSxJQUFJLENBQUMxRCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxJQUFLdUQsR0FBRyxFQUMzRCxDQUFFLENBQUMsSUFBSSxDQUFDN0QsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDTixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ1EsR0FBRyxDQUFDLENBQUMsSUFBS3VELEdBQUcsRUFDNUQsQ0FBRSxJQUFJLENBQUM3RCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFD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QyxDQUFDLEdBQUcsSUFBSSxDQUFDSSxHQUFHLENBQUMsQ0FBQyxJQUFLdUQsR0FBRyxFQUM1RCxDQUFFLElBQUksQ0FBQzdELEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ04sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNPLEdBQUcsQ0FBQyxDQUFDLElBQUt1RCxHQUFHLEVBQzNELENBQUUsQ0FBQyxJQUFJLENBQUM3RCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0UsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSSxHQUFHLENBQUMsQ0FBQyxJQUFLMEQsR0FBRyxFQUM1RCxDQUFFLElBQUksQ0FBQzFELEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLElBQUt1RCxHQUFHLEVBQzNELENBQUUsQ0FBQyxJQUFJLENBQUM3RCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0ksR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNOLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDUSxHQUFHLENBQUMsQ0FBQyxJQUFLdUQsR0FBRyxFQUM1RCxDQUFFLElBQUksQ0FBQzdELEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLEdBQUcsQ0FBQyxDQUFDLElBQUswRCxHQUFHLEVBQzNELENBQUUsQ0FBQyxJQUFJLENBQUMzRCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ0UsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDSSxHQUFH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