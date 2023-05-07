// Copyright 2013-2022, University of Colorado Boulder

/**
 * Arbitrary-dimensional matrix, based on Jama (http://math.nist.gov/javanumerics/jama/)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import isArray from '../../phet-core/js/isArray.js';
import dot from './dot.js';
import './EigenvalueDecomposition.js';
import LUDecomposition from './LUDecomposition.js';
import QRDecomposition from './QRDecomposition.js';
import SingularValueDecomposition from './SingularValueDecomposition.js';
import Vector2 from './Vector2.js';
import Vector3 from './Vector3.js';
import Vector4 from './Vector4.js';
const ArrayType = window.Float64Array || Array;
class Matrix {
  /**
   * @param {number} m - number of rows
   * @param {number} n - number of columns
   * @param {number[] | number} [filler]
   * @param {boolean} [fast]
   */
  constructor(m, n, filler, fast) {
    // @public {number}
    this.m = m;
    this.n = n;
    const size = m * n;
    // @public {number}
    this.size = size;
    let i;
    if (fast) {
      // @public {Array.<number>|Float64Array}
      this.entries = filler;
    } else {
      if (!filler) {
        filler = 0;
      }

      // entries stored in row-major format
      this.entries = new ArrayType(size);
      if (isArray(filler)) {
        assert && assert(filler.length === size);
        for (i = 0; i < size; i++) {
          this.entries[i] = filler[i];
        }
      } else {
        for (i = 0; i < size; i++) {
          this.entries[i] = filler;
        }
      }
    }
  }

  /**
   * @public
   *
   * @returns {Matrix}
   */
  copy() {
    const result = new Matrix(this.m, this.n);
    for (let i = 0; i < this.size; i++) {
      result.entries[i] = this.entries[i];
    }
    return result;
  }

  /**
   * @public
   *
   * @returns {Array.<number>}
   */
  getArray() {
    return this.entries;
  }

  /**
   * @public
   *
   * @returns {Array.<number>}
   */
  getArrayCopy() {
    return new ArrayType(this.entries);
  }

  /**
   * @public
   *
   * @returns {number}
   */
  getRowDimension() {
    return this.m;
  }

  /**
   * @public
   *
   * @returns {number}
   */
  getColumnDimension() {
    return this.n;
  }

  /**
   * TODO: inline this places if we aren't using an inlining compiler! (check performance)
   * @public
   *
   * @param {number} i
   * @param {number} j
   * @returns {number}
   */
  index(i, j) {
    return i * this.n + j;
  }

  /**
   * Get the matrix element (i,j) with the convention that row and column indices start at zero
   * @public
   *
   * @param {number} i - row index
   * @param {number} j - column index
   * @returns {number}
   */
  get(i, j) {
    return this.entries[this.index(i, j)];
  }

  /**
   * Set the matrix element (i,j) to a value s with the convention that row and column indices start at zero
   * @public
   *
   * @param {number} i - row index
   * @param {number} j - column index
   * @param {number} s - value of the matrix element
   */
  set(i, j, s) {
    this.entries[this.index(i, j)] = s;
  }

  /**
   * @public
   *
   * @param {number} i0
   * @param {number} i1
   * @param {number} j0
   * @param {number} j1
   * @returns {Matrix}
   */
  getMatrix(i0, i1, j0, j1) {
    const result = new Matrix(i1 - i0 + 1, j1 - j0 + 1);
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        result.entries[result.index(i - i0, j - j0)] = this.entries[this.index(i, j)];
      }
    }
    return result;
  }

  /**
   * @public
   *
   * @param {Array.<number>} r
   * @param {number} j0
   * @param {number} j1
   * @returns {Matrix}
   */
  getArrayRowMatrix(r, j0, j1) {
    const result = new Matrix(r.length, j1 - j0 + 1);
    for (let i = 0; i < r.length; i++) {
      for (let j = j0; j <= j1; j++) {
        result.entries[result.index(i, j - j0)] = this.entries[this.index(r[i], j)];
      }
    }
    return result;
  }

  /**
   * @public
   *
   * @param {Matrix} [result] - allow passing in a pre-constructed matrix
   * @returns {Matrix}
   */
  transpose(result) {
    result = result || new Matrix(this.n, this.m);
    assert && assert(result.m === this.n);
    assert && assert(result.n === this.m);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        result.entries[result.index(j, i)] = this.entries[this.index(i, j)];
      }
    }
    return result;
  }

  /**
   * @public
   *
   * @returns {number}
   */
  norm1() {
    let f = 0;
    for (let j = 0; j < this.n; j++) {
      let s = 0;
      for (let i = 0; i < this.m; i++) {
        s += Math.abs(this.entries[this.index(i, j)]);
      }
      f = Math.max(f, s);
    }
    return f;
  }

  /**
   * @public
   *
   * @returns {number}
   */
  norm2() {
    return new SingularValueDecomposition(this).norm2();
  }

  /**
   * @public
   *
   * @returns {number}
   */
  normInf() {
    let f = 0;
    for (let i = 0; i < this.m; i++) {
      let s = 0;
      for (let j = 0; j < this.n; j++) {
        s += Math.abs(this.entries[this.index(i, j)]);
      }
      f = Math.max(f, s);
    }
    return f;
  }

  /**
   * @public
   *
   * @returns {number}
   */
  normF() {
    let f = 0;
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        f = Matrix.hypot(f, this.entries[this.index(i, j)]);
      }
    }
    return f;
  }

  /**
   * @public
   *
   * @returns {Matrix}
   */
  uminus() {
    const result = new Matrix(this.m, this.n);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        result.entries[result.index(i, j)] = -this.entries[this.index(i, j)];
      }
    }
    return result;
  }

  /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  plus(matrix) {
    this.checkMatrixDimensions(matrix);
    const result = new Matrix(this.m, this.n);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const index = result.index(i, j);
        result.entries[index] = this.entries[index] + matrix.entries[index];
      }
    }
    return result;
  }

  /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  plusEquals(matrix) {
    this.checkMatrixDimensions(matrix);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const index = this.index(i, j);
        this.entries[index] = this.entries[index] + matrix.entries[index];
      }
    }
    return this;
  }

  /**
   * A linear interpolation between this Matrix (ratio=0) and another Matrix (ratio=1).
   * @public
   *
   * @param {Matrix} matrix
   * @param {number} ratio - Not necessarily constrained in [0, 1]
   * @returns {Matrix}
   */
  blendEquals(matrix, ratio) {
    this.checkMatrixDimensions(matrix);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const index = this.index(i, j);
        const a = this.entries[index];
        const b = matrix.entries[index];
        this.entries[index] = a + (b - a) * ratio;
      }
    }
    return this;
  }

  /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  minus(matrix) {
    this.checkMatrixDimensions(matrix);
    const result = new Matrix(this.m, this.n);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const index = this.index(i, j);
        result.entries[index] = this.entries[index] - matrix.entries[index];
      }
    }
    return result;
  }

  /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  minusEquals(matrix) {
    this.checkMatrixDimensions(matrix);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const index = this.index(i, j);
        this.entries[index] = this.entries[index] - matrix.entries[index];
      }
    }
    return this;
  }

  /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  arrayTimes(matrix) {
    this.checkMatrixDimensions(matrix);
    const result = new Matrix(this.m, this.n);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const index = result.index(i, j);
        result.entries[index] = this.entries[index] * matrix.entries[index];
      }
    }
    return result;
  }

  /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  arrayTimesEquals(matrix) {
    this.checkMatrixDimensions(matrix);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const index = this.index(i, j);
        this.entries[index] = this.entries[index] * matrix.entries[index];
      }
    }
    return this;
  }

  /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  arrayRightDivide(matrix) {
    this.checkMatrixDimensions(matrix);
    const result = new Matrix(this.m, this.n);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const index = this.index(i, j);
        result.entries[index] = this.entries[index] / matrix.entries[index];
      }
    }
    return result;
  }

  /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  arrayRightDivideEquals(matrix) {
    this.checkMatrixDimensions(matrix);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const index = this.index(i, j);
        this.entries[index] = this.entries[index] / matrix.entries[index];
      }
    }
    return this;
  }

  /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  arrayLeftDivide(matrix) {
    this.checkMatrixDimensions(matrix);
    const result = new Matrix(this.m, this.n);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const index = this.index(i, j);
        result.entries[index] = matrix.entries[index] / this.entries[index];
      }
    }
    return result;
  }

  /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  arrayLeftDivideEquals(matrix) {
    this.checkMatrixDimensions(matrix);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const index = this.index(i, j);
        this.entries[index] = matrix.entries[index] / this.entries[index];
      }
    }
    return this;
  }

  /**
   * @public
   *
   * @param {Matrix|number} matrixOrScalar
   * @returns {Matrix}
   */
  times(matrixOrScalar) {
    let result;
    let i;
    let j;
    let k;
    let s;
    let matrix;
    if (matrixOrScalar.isMatrix) {
      matrix = matrixOrScalar;
      if (matrix.m !== this.n) {
        throw new Error('Matrix inner dimensions must agree.');
      }
      result = new Matrix(this.m, matrix.n);
      const matrixcolj = new ArrayType(this.n);
      for (j = 0; j < matrix.n; j++) {
        for (k = 0; k < this.n; k++) {
          matrixcolj[k] = matrix.entries[matrix.index(k, j)];
        }
        for (i = 0; i < this.m; i++) {
          s = 0;
          for (k = 0; k < this.n; k++) {
            s += this.entries[this.index(i, k)] * matrixcolj[k];
          }
          result.entries[result.index(i, j)] = s;
        }
      }
      return result;
    } else {
      s = matrixOrScalar;
      result = new Matrix(this.m, this.n);
      for (i = 0; i < this.m; i++) {
        for (j = 0; j < this.n; j++) {
          result.entries[result.index(i, j)] = s * this.entries[this.index(i, j)];
        }
      }
      return result;
    }
  }

  /**
   * @public
   *
   * @param {number} s
   * @returns {Matrix}
   */
  timesEquals(s) {
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const index = this.index(i, j);
        this.entries[index] = s * this.entries[index];
      }
    }
    return this;
  }

  /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  solve(matrix) {
    return this.m === this.n ? new LUDecomposition(this).solve(matrix) : new QRDecomposition(this).solve(matrix);
  }

  /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  solveTranspose(matrix) {
    return this.transpose().solve(matrix.transpose());
  }

  /**
   * @public
   *
   * @returns {Matrix}
   */
  inverse() {
    return this.solve(Matrix.identity(this.m, this.m));
  }

  /**
   * @public
   *
   * @returns {number}
   */
  det() {
    return new LUDecomposition(this).det();
  }

  /**
   * @public
   *
   * @returns {number}
   */
  rank() {
    return new SingularValueDecomposition(this).rank();
  }

  /**
   * @public
   *
   * @returns {number}
   */
  cond() {
    return new SingularValueDecomposition(this).cond();
  }

  /**
   * @public
   *
   * @returns {number}
   */
  trace() {
    let t = 0;
    for (let i = 0; i < Math.min(this.m, this.n); i++) {
      t += this.entries[this.index(i, i)];
    }
    return t;
  }

  /**
   * @public
   *
   * @param {Matrix} matrix
   */
  checkMatrixDimensions(matrix) {
    if (matrix.m !== this.m || matrix.n !== this.n) {
      throw new Error('Matrix dimensions must agree.');
    }
  }

  /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */
  toString() {
    let result = '';
    result += `dim: ${this.getRowDimension()}x${this.getColumnDimension()}\n`;
    for (let row = 0; row < this.getRowDimension(); row++) {
      for (let col = 0; col < this.getColumnDimension(); col++) {
        result += `${this.get(row, col)} `;
      }
      result += '\n';
    }
    return result;
  }

  /**
   * Returns a vector that is contained in the specified column
   * @public
   *
   * @param {number} column
   * @returns {Vector2}
   */
  extractVector2(column) {
    assert && assert(this.m === 2); // rows should match vector dimension
    return new Vector2(this.get(0, column), this.get(1, column));
  }

  /**
   * Returns a vector that is contained in the specified column
   * @public
   *
   * @param {number} column
   * @returns {Vector3}
   */
  extractVector3(column) {
    assert && assert(this.m === 3); // rows should match vector dimension
    return new Vector3(this.get(0, column), this.get(1, column), this.get(2, column));
  }

  /**
   * Returns a vector that is contained in the specified column
   * @public
   *
   * @param {number} column
   * @returns {Vector4}
   */
  extractVector4(column) {
    assert && assert(this.m === 4); // rows should match vector dimension
    return new Vector4(this.get(0, column), this.get(1, column), this.get(2, column), this.get(3, column));
  }

  /**
   * Sets the current matrix to the values of the listed column vectors (Vector3).
   * @public
   *
   * @param {Array.<Vector3>} vectors
   * @returns {Matrix}
   */
  setVectors3(vectors) {
    const m = 3;
    const n = vectors.length;
    assert && assert(this.m === m);
    assert && assert(this.n === n);
    for (let i = 0; i < n; i++) {
      const vector = vectors[i];
      this.entries[i] = vector.x;
      this.entries[i + n] = vector.y;
      this.entries[i + 2 * n] = vector.z;
    }
    return this;
  }

  /**
   * sqrt(a^2 + b^2) without under/overflow.
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */
  static hypot(a, b) {
    let r;
    if (Math.abs(a) > Math.abs(b)) {
      r = b / a;
      r = Math.abs(a) * Math.sqrt(1 + r * r);
    } else if (b !== 0) {
      r = a / b;
      r = Math.abs(b) * Math.sqrt(1 + r * r);
    } else {
      r = 0.0;
    }
    return r;
  }

  /**
   * Sets this matrix to the identity.
   * @public
   *
   * @param {number} m
   * @param {number} n
   * @returns {Matrix}
   */
  static identity(m, n) {
    const result = new Matrix(m, n);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        result.entries[result.index(i, j)] = i === j ? 1.0 : 0.0;
      }
    }
    return result;
  }

  /**
   * Returns a square diagonal matrix, whose entries along the diagonal are specified by the passed-in array, and the
   * other entries are 0.
   * @public
   *
   * @param {Array.<number>} diagonalValues
   * @returns {Matrix}
   */
  static diagonalMatrix(diagonalValues) {
    const n = diagonalValues.length;
    const result = new Matrix(n, n); // Should fill in zeros
    for (let i = 0; i < n; i++) {
      result.entries[result.index(i, i)] = diagonalValues[i];
    }
    return result;
  }

  /**
   * @public
   *
   * @param {Vector2} vector
   * @returns {Matrix}
   */
  static rowVector2(vector) {
    return new Matrix(1, 2, [vector.x, vector.y]);
  }

  /**
   * @public
   *
   * @param {Vector3} vector
   * @returns {Matrix}
   */
  static rowVector3(vector) {
    return new Matrix(1, 3, [vector.x, vector.y, vector.z]);
  }

  /**
   * @public
   *
   * @param {Vector4} vector
   * @returns {Matrix}
   */
  static rowVector4(vector) {
    return new Matrix(1, 4, [vector.x, vector.y, vector.z, vector.w]);
  }

  /**
   * @public
   *
   * @param {Vector2|Vector3|Vector4} vector
   * @returns {Matrix}
   */
  static rowVector(vector) {
    if (vector.isVector2) {
      return Matrix.rowVector2(vector);
    } else if (vector.isVector3) {
      return Matrix.rowVector3(vector);
    } else if (vector.isVector4) {
      return Matrix.rowVector4(vector);
    } else {
      throw new Error(`undetected type of vector: ${vector.toString()}`);
    }
  }

  /**
   * @public
   *
   * @param {Vector2} vector
   * @returns {Matrix}
   */
  static columnVector2(vector) {
    return new Matrix(2, 1, [vector.x, vector.y]);
  }

  /**
   * @public
   *
   * @param {Vector3} vector
   * @returns {Matrix}
   */
  static columnVector3(vector) {
    return new Matrix(3, 1, [vector.x, vector.y, vector.z]);
  }

  /**
   * @public
   *
   * @param {Vector4} vector
   * @returns {Matrix}
   */
  static columnVector4(vector) {
    return new Matrix(4, 1, [vector.x, vector.y, vector.z, vector.w]);
  }

  /**
   * @public
   *
   * @param {Vector2|Vector3|Vector4} vector
   * @returns {Matrix}
   */
  static columnVector(vector) {
    if (vector.isVector2) {
      return Matrix.columnVector2(vector);
    } else if (vector.isVector3) {
      return Matrix.columnVector3(vector);
    } else if (vector.isVector4) {
      return Matrix.columnVector4(vector);
    } else {
      throw new Error(`undetected type of vector: ${vector.toString()}`);
    }
  }

  /**
   * Create a Matrix where each column is a vector
   * @public
   *
   * @param {Array.<Vector2>} vectors
   */
  static fromVectors2(vectors) {
    const dimension = 2;
    const n = vectors.length;
    const data = new ArrayType(dimension * n);
    for (let i = 0; i < n; i++) {
      const vector = vectors[i];
      data[i] = vector.x;
      data[i + n] = vector.y;
    }
    return new Matrix(dimension, n, data, true);
  }

  /**
   * Create a Matrix where each column is a vector
   * @public
   *
   * @param {Array.<Vector3>} vectors
   */
  static fromVectors3(vectors) {
    const dimension = 3;
    const n = vectors.length;
    const data = new ArrayType(dimension * n);
    for (let i = 0; i < n; i++) {
      const vector = vectors[i];
      data[i] = vector.x;
      data[i + n] = vector.y;
      data[i + 2 * n] = vector.z;
    }
    return new Matrix(dimension, n, data, true);
  }

  /**
   * Create a Matrix where each column is a vector
   * @public
   *
   * @param {Array.<Vector4>} vectors
   */
  static fromVectors4(vectors) {
    const dimension = 4;
    const n = vectors.length;
    const data = new ArrayType(dimension * n);
    for (let i = 0; i < n; i++) {
      const vector = vectors[i];
      data[i] = vector.x;
      data[i + n] = vector.y;
      data[i + 2 * n] = vector.z;
      data[i + 3 * n] = vector.w;
    }
    return new Matrix(dimension, n, data, true);
  }
}

// @public {boolean}
Matrix.prototype.isMatrix = true;
dot.register('Matrix', Matrix);
export default Matrix;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0FycmF5IiwiZG90IiwiTFVEZWNvbXBvc2l0aW9uIiwiUVJEZWNvbXBvc2l0aW9uIiwiU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb24iLCJWZWN0b3IyIiwiVmVjdG9yMyIsIlZlY3RvcjQiLCJBcnJheVR5cGUiLCJ3aW5kb3ciLCJGbG9hdDY0QXJyYXkiLCJBcnJheSIsIk1hdHJpeCIsImNvbnN0cnVjdG9yIiwibSIsIm4iLCJmaWxsZXIiLCJmYXN0Iiwic2l6ZSIsImkiLCJlbnRyaWVzIiwiYXNzZXJ0IiwibGVuZ3RoIiwiY29weSIsInJlc3VsdCIsImdldEFycmF5IiwiZ2V0QXJyYXlDb3B5IiwiZ2V0Um93RGltZW5zaW9uIiwiZ2V0Q29sdW1uRGltZW5zaW9uIiwiaW5kZXgiLCJqIiwiZ2V0Iiwic2V0IiwicyIsImdldE1hdHJpeCIsImkwIiwiaTEiLCJqMCIsImoxIiwiZ2V0QXJyYXlSb3dNYXRyaXgiLCJyIiwidHJhbnNwb3NlIiwibm9ybTEiLCJmIiwiTWF0aCIsImFicyIsIm1heCIsIm5vcm0yIiwibm9ybUluZiIsIm5vcm1GIiwiaHlwb3QiLCJ1bWludXMiLCJwbHVzIiwibWF0cml4IiwiY2hlY2tNYXRyaXhEaW1lbnNpb25zIiwicGx1c0VxdWFscyIsImJsZW5kRXF1YWxzIiwicmF0aW8iLCJhIiwiYiIsIm1pbnVzIiwibWludXNFcXVhbHMiLCJhcnJheVRpbWVzIiwiYXJyYXlUaW1lc0VxdWFscyIsImFycmF5UmlnaHREaXZpZGUiLCJhcnJheVJpZ2h0RGl2aWRlRXF1YWxzIiwiYXJyYXlMZWZ0RGl2aWRlIiwiYXJyYXlMZWZ0RGl2aWRlRXF1YWxzIiwidGltZXMiLCJtYXRyaXhPclNjYWxhciIsImsiLCJpc01hdHJpeCIsIkVycm9yIiwibWF0cml4Y29saiIsInRpbWVzRXF1YWxzIiwic29sdmUiLCJzb2x2ZVRyYW5zcG9zZSIsImludmVyc2UiLCJpZGVudGl0eSIsImRldCIsInJhbmsiLCJjb25kIiwidHJhY2UiLCJ0IiwibWluIiwidG9TdHJpbmciLCJyb3ciLCJjb2wiLCJleHRyYWN0VmVjdG9yMiIsImNvbHVtbiIsImV4dHJhY3RWZWN0b3IzIiwiZXh0cmFjdFZlY3RvcjQiLCJzZXRWZWN0b3JzMyIsInZlY3RvcnMiLCJ2ZWN0b3IiLCJ4IiwieSIsInoiLCJzcXJ0IiwiZGlhZ29uYWxNYXRyaXgiLCJkaWFnb25hbFZhbHVlcyIsInJvd1ZlY3RvcjIiLCJyb3dWZWN0b3IzIiwicm93VmVjdG9yNCIsInciLCJyb3dWZWN0b3IiLCJpc1ZlY3RvcjIiLCJpc1ZlY3RvcjMiLCJpc1ZlY3RvcjQiLCJjb2x1bW5WZWN0b3IyIiwiY29sdW1uVmVjdG9yMyIsImNvbHVtblZlY3RvcjQiLCJjb2x1bW5WZWN0b3IiLCJmcm9tVmVjdG9yczIiLCJkaW1lbnNpb24iLCJkYXRhIiwiZnJvbVZlY3RvcnMzIiwiZnJvbVZlY3RvcnM0IiwicHJvdG90eXBlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYXRyaXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQXJiaXRyYXJ5LWRpbWVuc2lvbmFsIG1hdHJpeCwgYmFzZWQgb24gSmFtYSAoaHR0cDovL21hdGgubmlzdC5nb3YvamF2YW51bWVyaWNzL2phbWEvKVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2lzQXJyYXkuanMnO1xyXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcclxuaW1wb3J0ICcuL0VpZ2VudmFsdWVEZWNvbXBvc2l0aW9uLmpzJztcclxuaW1wb3J0IExVRGVjb21wb3NpdGlvbiBmcm9tICcuL0xVRGVjb21wb3NpdGlvbi5qcyc7XHJcbmltcG9ydCBRUkRlY29tcG9zaXRpb24gZnJvbSAnLi9RUkRlY29tcG9zaXRpb24uanMnO1xyXG5pbXBvcnQgU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb24gZnJvbSAnLi9TaW5ndWxhclZhbHVlRGVjb21wb3NpdGlvbi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4vVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vVmVjdG9yMy5qcyc7XHJcbmltcG9ydCBWZWN0b3I0IGZyb20gJy4vVmVjdG9yNC5qcyc7XHJcblxyXG5jb25zdCBBcnJheVR5cGUgPSB3aW5kb3cuRmxvYXQ2NEFycmF5IHx8IEFycmF5O1xyXG5cclxuY2xhc3MgTWF0cml4IHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbSAtIG51bWJlciBvZiByb3dzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG4gLSBudW1iZXIgb2YgY29sdW1uc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyW10gfCBudW1iZXJ9IFtmaWxsZXJdXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBbZmFzdF1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbSwgbiwgZmlsbGVyLCBmYXN0ICkge1xyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5tID0gbTtcclxuICAgIHRoaXMubiA9IG47XHJcblxyXG4gICAgY29uc3Qgc2l6ZSA9IG0gKiBuO1xyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5zaXplID0gc2l6ZTtcclxuICAgIGxldCBpO1xyXG5cclxuICAgIGlmICggZmFzdCApIHtcclxuICAgICAgLy8gQHB1YmxpYyB7QXJyYXkuPG51bWJlcj58RmxvYXQ2NEFycmF5fVxyXG4gICAgICB0aGlzLmVudHJpZXMgPSBmaWxsZXI7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgaWYgKCAhZmlsbGVyICkge1xyXG4gICAgICAgIGZpbGxlciA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGVudHJpZXMgc3RvcmVkIGluIHJvdy1tYWpvciBmb3JtYXRcclxuICAgICAgdGhpcy5lbnRyaWVzID0gbmV3IEFycmF5VHlwZSggc2l6ZSApO1xyXG5cclxuICAgICAgaWYgKCBpc0FycmF5KCBmaWxsZXIgKSApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmaWxsZXIubGVuZ3RoID09PSBzaXplICk7XHJcblxyXG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgc2l6ZTsgaSsrICkge1xyXG4gICAgICAgICAgdGhpcy5lbnRyaWVzWyBpIF0gPSBmaWxsZXJbIGkgXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBzaXplOyBpKysgKSB7XHJcbiAgICAgICAgICB0aGlzLmVudHJpZXNbIGkgXSA9IGZpbGxlcjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgY29weSgpIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXRyaXgoIHRoaXMubSwgdGhpcy5uICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNpemU7IGkrKyApIHtcclxuICAgICAgcmVzdWx0LmVudHJpZXNbIGkgXSA9IHRoaXMuZW50cmllc1sgaSBdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48bnVtYmVyPn1cclxuICAgKi9cclxuICBnZXRBcnJheSgpIHtcclxuICAgIHJldHVybiB0aGlzLmVudHJpZXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59XHJcbiAgICovXHJcbiAgZ2V0QXJyYXlDb3B5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBBcnJheVR5cGUoIHRoaXMuZW50cmllcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRSb3dEaW1lbnNpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRDb2x1bW5EaW1lbnNpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVE9ETzogaW5saW5lIHRoaXMgcGxhY2VzIGlmIHdlIGFyZW4ndCB1c2luZyBhbiBpbmxpbmluZyBjb21waWxlciEgKGNoZWNrIHBlcmZvcm1hbmNlKVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGluZGV4KCBpLCBqICkge1xyXG4gICAgcmV0dXJuIGkgKiB0aGlzLm4gKyBqO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBtYXRyaXggZWxlbWVudCAoaSxqKSB3aXRoIHRoZSBjb252ZW50aW9uIHRoYXQgcm93IGFuZCBjb2x1bW4gaW5kaWNlcyBzdGFydCBhdCB6ZXJvXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGkgLSByb3cgaW5kZXhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaiAtIGNvbHVtbiBpbmRleFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0KCBpLCBqICkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW50cmllc1sgdGhpcy5pbmRleCggaSwgaiApIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIG1hdHJpeCBlbGVtZW50IChpLGopIHRvIGEgdmFsdWUgcyB3aXRoIHRoZSBjb252ZW50aW9uIHRoYXQgcm93IGFuZCBjb2x1bW4gaW5kaWNlcyBzdGFydCBhdCB6ZXJvXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGkgLSByb3cgaW5kZXhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaiAtIGNvbHVtbiBpbmRleFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzIC0gdmFsdWUgb2YgdGhlIG1hdHJpeCBlbGVtZW50XHJcbiAgICovXHJcbiAgc2V0KCBpLCBqLCBzICkge1xyXG4gICAgdGhpcy5lbnRyaWVzWyB0aGlzLmluZGV4KCBpLCBqICkgXSA9IHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaTBcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaTFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gajBcclxuICAgKiBAcGFyYW0ge251bWJlcn0gajFcclxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxyXG4gICAqL1xyXG4gIGdldE1hdHJpeCggaTAsIGkxLCBqMCwgajEgKSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWF0cml4KCBpMSAtIGkwICsgMSwgajEgLSBqMCArIDEgKTtcclxuICAgIGZvciAoIGxldCBpID0gaTA7IGkgPD0gaTE7IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSBqMDsgaiA8PSBqMTsgaisrICkge1xyXG4gICAgICAgIHJlc3VsdC5lbnRyaWVzWyByZXN1bHQuaW5kZXgoIGkgLSBpMCwgaiAtIGowICkgXSA9IHRoaXMuZW50cmllc1sgdGhpcy5pbmRleCggaSwgaiApIF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSByXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGowXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGoxXHJcbiAgICogQHJldHVybnMge01hdHJpeH1cclxuICAgKi9cclxuICBnZXRBcnJheVJvd01hdHJpeCggciwgajAsIGoxICkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hdHJpeCggci5sZW5ndGgsIGoxIC0gajAgKyAxICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCByLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IGowOyBqIDw9IGoxOyBqKysgKSB7XHJcbiAgICAgICAgcmVzdWx0LmVudHJpZXNbIHJlc3VsdC5pbmRleCggaSwgaiAtIGowICkgXSA9IHRoaXMuZW50cmllc1sgdGhpcy5pbmRleCggclsgaSBdLCBqICkgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4fSBbcmVzdWx0XSAtIGFsbG93IHBhc3NpbmcgaW4gYSBwcmUtY29uc3RydWN0ZWQgbWF0cml4XHJcbiAgICogQHJldHVybnMge01hdHJpeH1cclxuICAgKi9cclxuICB0cmFuc3Bvc2UoIHJlc3VsdCApIHtcclxuICAgIHJlc3VsdCA9IHJlc3VsdCB8fCBuZXcgTWF0cml4KCB0aGlzLm4sIHRoaXMubSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0Lm0gPT09IHRoaXMubiApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0Lm4gPT09IHRoaXMubSApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5tOyBpKysgKSB7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMubjsgaisrICkge1xyXG4gICAgICAgIHJlc3VsdC5lbnRyaWVzWyByZXN1bHQuaW5kZXgoIGosIGkgKSBdID0gdGhpcy5lbnRyaWVzWyB0aGlzLmluZGV4KCBpLCBqICkgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgbm9ybTEoKSB7XHJcbiAgICBsZXQgZiA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcclxuICAgICAgbGV0IHMgPSAwO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcclxuICAgICAgICBzICs9IE1hdGguYWJzKCB0aGlzLmVudHJpZXNbIHRoaXMuaW5kZXgoIGksIGogKSBdICk7XHJcbiAgICAgIH1cclxuICAgICAgZiA9IE1hdGgubWF4KCBmLCBzICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgbm9ybTIoKSB7XHJcbiAgICByZXR1cm4gKCBuZXcgU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb24oIHRoaXMgKS5ub3JtMigpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIG5vcm1JbmYoKSB7XHJcbiAgICBsZXQgZiA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcclxuICAgICAgbGV0IHMgPSAwO1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcclxuICAgICAgICBzICs9IE1hdGguYWJzKCB0aGlzLmVudHJpZXNbIHRoaXMuaW5kZXgoIGksIGogKSBdICk7XHJcbiAgICAgIH1cclxuICAgICAgZiA9IE1hdGgubWF4KCBmLCBzICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgbm9ybUYoKSB7XHJcbiAgICBsZXQgZiA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XHJcbiAgICAgICAgZiA9IE1hdHJpeC5oeXBvdCggZiwgdGhpcy5lbnRyaWVzWyB0aGlzLmluZGV4KCBpLCBqICkgXSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgdW1pbnVzKCkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hdHJpeCggdGhpcy5tLCB0aGlzLm4gKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcclxuICAgICAgICByZXN1bHQuZW50cmllc1sgcmVzdWx0LmluZGV4KCBpLCBqICkgXSA9IC10aGlzLmVudHJpZXNbIHRoaXMuaW5kZXgoIGksIGogKSBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgcGx1cyggbWF0cml4ICkge1xyXG4gICAgdGhpcy5jaGVja01hdHJpeERpbWVuc2lvbnMoIG1hdHJpeCApO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hdHJpeCggdGhpcy5tLCB0aGlzLm4gKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IHJlc3VsdC5pbmRleCggaSwgaiApO1xyXG4gICAgICAgIHJlc3VsdC5lbnRyaWVzWyBpbmRleCBdID0gdGhpcy5lbnRyaWVzWyBpbmRleCBdICsgbWF0cml4LmVudHJpZXNbIGluZGV4IF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4XHJcbiAgICogQHJldHVybnMge01hdHJpeH1cclxuICAgKi9cclxuICBwbHVzRXF1YWxzKCBtYXRyaXggKSB7XHJcbiAgICB0aGlzLmNoZWNrTWF0cml4RGltZW5zaW9ucyggbWF0cml4ICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4KCBpLCBqICk7XHJcbiAgICAgICAgdGhpcy5lbnRyaWVzWyBpbmRleCBdID0gdGhpcy5lbnRyaWVzWyBpbmRleCBdICsgbWF0cml4LmVudHJpZXNbIGluZGV4IF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHRoaXMgTWF0cml4IChyYXRpbz0wKSBhbmQgYW5vdGhlciBNYXRyaXggKHJhdGlvPTEpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmF0aW8gLSBOb3QgbmVjZXNzYXJpbHkgY29uc3RyYWluZWQgaW4gWzAsIDFdXHJcbiAgICogQHJldHVybnMge01hdHJpeH1cclxuICAgKi9cclxuICBibGVuZEVxdWFscyggbWF0cml4LCByYXRpbyApIHtcclxuICAgIHRoaXMuY2hlY2tNYXRyaXhEaW1lbnNpb25zKCBtYXRyaXggKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaW5kZXgoIGksIGogKTtcclxuICAgICAgICBjb25zdCBhID0gdGhpcy5lbnRyaWVzWyBpbmRleCBdO1xyXG4gICAgICAgIGNvbnN0IGIgPSBtYXRyaXguZW50cmllc1sgaW5kZXggXTtcclxuICAgICAgICB0aGlzLmVudHJpZXNbIGluZGV4IF0gPSBhICsgKCBiIC0gYSApICogcmF0aW87XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgbWludXMoIG1hdHJpeCApIHtcclxuICAgIHRoaXMuY2hlY2tNYXRyaXhEaW1lbnNpb25zKCBtYXRyaXggKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXRyaXgoIHRoaXMubSwgdGhpcy5uICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4KCBpLCBqICk7XHJcbiAgICAgICAgcmVzdWx0LmVudHJpZXNbIGluZGV4IF0gPSB0aGlzLmVudHJpZXNbIGluZGV4IF0gLSBtYXRyaXguZW50cmllc1sgaW5kZXggXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXhcclxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxyXG4gICAqL1xyXG4gIG1pbnVzRXF1YWxzKCBtYXRyaXggKSB7XHJcbiAgICB0aGlzLmNoZWNrTWF0cml4RGltZW5zaW9ucyggbWF0cml4ICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4KCBpLCBqICk7XHJcbiAgICAgICAgdGhpcy5lbnRyaWVzWyBpbmRleCBdID0gdGhpcy5lbnRyaWVzWyBpbmRleCBdIC0gbWF0cml4LmVudHJpZXNbIGluZGV4IF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgYXJyYXlUaW1lcyggbWF0cml4ICkge1xyXG4gICAgdGhpcy5jaGVja01hdHJpeERpbWVuc2lvbnMoIG1hdHJpeCApO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hdHJpeCggdGhpcy5tLCB0aGlzLm4gKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IHJlc3VsdC5pbmRleCggaSwgaiApO1xyXG4gICAgICAgIHJlc3VsdC5lbnRyaWVzWyBpbmRleCBdID0gdGhpcy5lbnRyaWVzWyBpbmRleCBdICogbWF0cml4LmVudHJpZXNbIGluZGV4IF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4XHJcbiAgICogQHJldHVybnMge01hdHJpeH1cclxuICAgKi9cclxuICBhcnJheVRpbWVzRXF1YWxzKCBtYXRyaXggKSB7XHJcbiAgICB0aGlzLmNoZWNrTWF0cml4RGltZW5zaW9ucyggbWF0cml4ICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4KCBpLCBqICk7XHJcbiAgICAgICAgdGhpcy5lbnRyaWVzWyBpbmRleCBdID0gdGhpcy5lbnRyaWVzWyBpbmRleCBdICogbWF0cml4LmVudHJpZXNbIGluZGV4IF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgYXJyYXlSaWdodERpdmlkZSggbWF0cml4ICkge1xyXG4gICAgdGhpcy5jaGVja01hdHJpeERpbWVuc2lvbnMoIG1hdHJpeCApO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hdHJpeCggdGhpcy5tLCB0aGlzLm4gKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaW5kZXgoIGksIGogKTtcclxuICAgICAgICByZXN1bHQuZW50cmllc1sgaW5kZXggXSA9IHRoaXMuZW50cmllc1sgaW5kZXggXSAvIG1hdHJpeC5lbnRyaWVzWyBpbmRleCBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgYXJyYXlSaWdodERpdmlkZUVxdWFscyggbWF0cml4ICkge1xyXG4gICAgdGhpcy5jaGVja01hdHJpeERpbWVuc2lvbnMoIG1hdHJpeCApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5tOyBpKysgKSB7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMubjsgaisrICkge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pbmRleCggaSwgaiApO1xyXG4gICAgICAgIHRoaXMuZW50cmllc1sgaW5kZXggXSA9IHRoaXMuZW50cmllc1sgaW5kZXggXSAvIG1hdHJpeC5lbnRyaWVzWyBpbmRleCBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXhcclxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxyXG4gICAqL1xyXG4gIGFycmF5TGVmdERpdmlkZSggbWF0cml4ICkge1xyXG4gICAgdGhpcy5jaGVja01hdHJpeERpbWVuc2lvbnMoIG1hdHJpeCApO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hdHJpeCggdGhpcy5tLCB0aGlzLm4gKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaW5kZXgoIGksIGogKTtcclxuICAgICAgICByZXN1bHQuZW50cmllc1sgaW5kZXggXSA9IG1hdHJpeC5lbnRyaWVzWyBpbmRleCBdIC8gdGhpcy5lbnRyaWVzWyBpbmRleCBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgYXJyYXlMZWZ0RGl2aWRlRXF1YWxzKCBtYXRyaXggKSB7XHJcbiAgICB0aGlzLmNoZWNrTWF0cml4RGltZW5zaW9ucyggbWF0cml4ICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4KCBpLCBqICk7XHJcbiAgICAgICAgdGhpcy5lbnRyaWVzWyBpbmRleCBdID0gbWF0cml4LmVudHJpZXNbIGluZGV4IF0gLyB0aGlzLmVudHJpZXNbIGluZGV4IF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXh8bnVtYmVyfSBtYXRyaXhPclNjYWxhclxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgdGltZXMoIG1hdHJpeE9yU2NhbGFyICkge1xyXG4gICAgbGV0IHJlc3VsdDtcclxuICAgIGxldCBpO1xyXG4gICAgbGV0IGo7XHJcbiAgICBsZXQgaztcclxuICAgIGxldCBzO1xyXG4gICAgbGV0IG1hdHJpeDtcclxuICAgIGlmICggbWF0cml4T3JTY2FsYXIuaXNNYXRyaXggKSB7XHJcbiAgICAgIG1hdHJpeCA9IG1hdHJpeE9yU2NhbGFyO1xyXG4gICAgICBpZiAoIG1hdHJpeC5tICE9PSB0aGlzLm4gKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnTWF0cml4IGlubmVyIGRpbWVuc2lvbnMgbXVzdCBhZ3JlZS4nICk7XHJcbiAgICAgIH1cclxuICAgICAgcmVzdWx0ID0gbmV3IE1hdHJpeCggdGhpcy5tLCBtYXRyaXgubiApO1xyXG4gICAgICBjb25zdCBtYXRyaXhjb2xqID0gbmV3IEFycmF5VHlwZSggdGhpcy5uICk7XHJcbiAgICAgIGZvciAoIGogPSAwOyBqIDwgbWF0cml4Lm47IGorKyApIHtcclxuICAgICAgICBmb3IgKCBrID0gMDsgayA8IHRoaXMubjsgaysrICkge1xyXG4gICAgICAgICAgbWF0cml4Y29salsgayBdID0gbWF0cml4LmVudHJpZXNbIG1hdHJpeC5pbmRleCggaywgaiApIF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgdGhpcy5tOyBpKysgKSB7XHJcbiAgICAgICAgICBzID0gMDtcclxuICAgICAgICAgIGZvciAoIGsgPSAwOyBrIDwgdGhpcy5uOyBrKysgKSB7XHJcbiAgICAgICAgICAgIHMgKz0gdGhpcy5lbnRyaWVzWyB0aGlzLmluZGV4KCBpLCBrICkgXSAqIG1hdHJpeGNvbGpbIGsgXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJlc3VsdC5lbnRyaWVzWyByZXN1bHQuaW5kZXgoIGksIGogKSBdID0gcztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzID0gbWF0cml4T3JTY2FsYXI7XHJcbiAgICAgIHJlc3VsdCA9IG5ldyBNYXRyaXgoIHRoaXMubSwgdGhpcy5uICk7XHJcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgdGhpcy5tOyBpKysgKSB7XHJcbiAgICAgICAgZm9yICggaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcclxuICAgICAgICAgIHJlc3VsdC5lbnRyaWVzWyByZXN1bHQuaW5kZXgoIGksIGogKSBdID0gcyAqIHRoaXMuZW50cmllc1sgdGhpcy5pbmRleCggaSwgaiApIF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc1xyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgdGltZXNFcXVhbHMoIHMgKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4KCBpLCBqICk7XHJcbiAgICAgICAgdGhpcy5lbnRyaWVzWyBpbmRleCBdID0gcyAqIHRoaXMuZW50cmllc1sgaW5kZXggXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4XHJcbiAgICogQHJldHVybnMge01hdHJpeH1cclxuICAgKi9cclxuICBzb2x2ZSggbWF0cml4ICkge1xyXG4gICAgcmV0dXJuICggdGhpcy5tID09PSB0aGlzLm4gPyAoIG5ldyBMVURlY29tcG9zaXRpb24oIHRoaXMgKSApLnNvbHZlKCBtYXRyaXggKSA6XHJcbiAgICAgICAgICAgICAoIG5ldyBRUkRlY29tcG9zaXRpb24oIHRoaXMgKSApLnNvbHZlKCBtYXRyaXggKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgc29sdmVUcmFuc3Bvc2UoIG1hdHJpeCApIHtcclxuICAgIHJldHVybiB0aGlzLnRyYW5zcG9zZSgpLnNvbHZlKCBtYXRyaXgudHJhbnNwb3NlKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgaW52ZXJzZSgpIHtcclxuICAgIHJldHVybiB0aGlzLnNvbHZlKCBNYXRyaXguaWRlbnRpdHkoIHRoaXMubSwgdGhpcy5tICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZGV0KCkge1xyXG4gICAgcmV0dXJuIG5ldyBMVURlY29tcG9zaXRpb24oIHRoaXMgKS5kZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgcmFuaygpIHtcclxuICAgIHJldHVybiBuZXcgU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb24oIHRoaXMgKS5yYW5rKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGNvbmQoKSB7XHJcbiAgICByZXR1cm4gbmV3IFNpbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uKCB0aGlzICkuY29uZCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICB0cmFjZSgpIHtcclxuICAgIGxldCB0ID0gMDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IE1hdGgubWluKCB0aGlzLm0sIHRoaXMubiApOyBpKysgKSB7XHJcbiAgICAgIHQgKz0gdGhpcy5lbnRyaWVzWyB0aGlzLmluZGV4KCBpLCBpICkgXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxyXG4gICAqL1xyXG4gIGNoZWNrTWF0cml4RGltZW5zaW9ucyggbWF0cml4ICkge1xyXG4gICAgaWYgKCBtYXRyaXgubSAhPT0gdGhpcy5tIHx8IG1hdHJpeC5uICE9PSB0aGlzLm4gKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ01hdHJpeCBkaW1lbnNpb25zIG11c3QgYWdyZWUuJyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHN0cmluZyBmb3JtIG9mIHRoaXMgb2JqZWN0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIGxldCByZXN1bHQgPSAnJztcclxuICAgIHJlc3VsdCArPSBgZGltOiAke3RoaXMuZ2V0Um93RGltZW5zaW9uKCl9eCR7dGhpcy5nZXRDb2x1bW5EaW1lbnNpb24oKX1cXG5gO1xyXG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IHRoaXMuZ2V0Um93RGltZW5zaW9uKCk7IHJvdysrICkge1xyXG4gICAgICBmb3IgKCBsZXQgY29sID0gMDsgY29sIDwgdGhpcy5nZXRDb2x1bW5EaW1lbnNpb24oKTsgY29sKysgKSB7XHJcbiAgICAgICAgcmVzdWx0ICs9IGAke3RoaXMuZ2V0KCByb3csIGNvbCApfSBgO1xyXG4gICAgICB9XHJcbiAgICAgIHJlc3VsdCArPSAnXFxuJztcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdmVjdG9yIHRoYXQgaXMgY29udGFpbmVkIGluIHRoZSBzcGVjaWZpZWQgY29sdW1uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtblxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGV4dHJhY3RWZWN0b3IyKCBjb2x1bW4gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm0gPT09IDIgKTsgLy8gcm93cyBzaG91bGQgbWF0Y2ggdmVjdG9yIGRpbWVuc2lvblxyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB0aGlzLmdldCggMCwgY29sdW1uICksIHRoaXMuZ2V0KCAxLCBjb2x1bW4gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHZlY3RvciB0aGF0IGlzIGNvbnRhaW5lZCBpbiB0aGUgc3BlY2lmaWVkIGNvbHVtblxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW5cclxuICAgKiBAcmV0dXJucyB7VmVjdG9yM31cclxuICAgKi9cclxuICBleHRyYWN0VmVjdG9yMyggY29sdW1uICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5tID09PSAzICk7IC8vIHJvd3Mgc2hvdWxkIG1hdGNoIHZlY3RvciBkaW1lbnNpb25cclxuICAgIHJldHVybiBuZXcgVmVjdG9yMyggdGhpcy5nZXQoIDAsIGNvbHVtbiApLCB0aGlzLmdldCggMSwgY29sdW1uICksIHRoaXMuZ2V0KCAyLCBjb2x1bW4gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHZlY3RvciB0aGF0IGlzIGNvbnRhaW5lZCBpbiB0aGUgc3BlY2lmaWVkIGNvbHVtblxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW5cclxuICAgKiBAcmV0dXJucyB7VmVjdG9yNH1cclxuICAgKi9cclxuICBleHRyYWN0VmVjdG9yNCggY29sdW1uICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5tID09PSA0ICk7IC8vIHJvd3Mgc2hvdWxkIG1hdGNoIHZlY3RvciBkaW1lbnNpb25cclxuICAgIHJldHVybiBuZXcgVmVjdG9yNCggdGhpcy5nZXQoIDAsIGNvbHVtbiApLCB0aGlzLmdldCggMSwgY29sdW1uICksIHRoaXMuZ2V0KCAyLCBjb2x1bW4gKSwgdGhpcy5nZXQoIDMsIGNvbHVtbiApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBjdXJyZW50IG1hdHJpeCB0byB0aGUgdmFsdWVzIG9mIHRoZSBsaXN0ZWQgY29sdW1uIHZlY3RvcnMgKFZlY3RvcjMpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFZlY3RvcjM+fSB2ZWN0b3JzXHJcbiAgICogQHJldHVybnMge01hdHJpeH1cclxuICAgKi9cclxuICBzZXRWZWN0b3JzMyggdmVjdG9ycyApIHtcclxuICAgIGNvbnN0IG0gPSAzO1xyXG4gICAgY29uc3QgbiA9IHZlY3RvcnMubGVuZ3RoO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubSA9PT0gbSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5uID09PSBuICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbjsgaSsrICkge1xyXG4gICAgICBjb25zdCB2ZWN0b3IgPSB2ZWN0b3JzWyBpIF07XHJcbiAgICAgIHRoaXMuZW50cmllc1sgaSBdID0gdmVjdG9yLng7XHJcbiAgICAgIHRoaXMuZW50cmllc1sgaSArIG4gXSA9IHZlY3Rvci55O1xyXG4gICAgICB0aGlzLmVudHJpZXNbIGkgKyAyICogbiBdID0gdmVjdG9yLno7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzcXJ0KGFeMiArIGJeMikgd2l0aG91dCB1bmRlci9vdmVyZmxvdy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBzdGF0aWMgaHlwb3QoIGEsIGIgKSB7XHJcbiAgICBsZXQgcjtcclxuICAgIGlmICggTWF0aC5hYnMoIGEgKSA+IE1hdGguYWJzKCBiICkgKSB7XHJcbiAgICAgIHIgPSBiIC8gYTtcclxuICAgICAgciA9IE1hdGguYWJzKCBhICkgKiBNYXRoLnNxcnQoIDEgKyByICogciApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGIgIT09IDAgKSB7XHJcbiAgICAgIHIgPSBhIC8gYjtcclxuICAgICAgciA9IE1hdGguYWJzKCBiICkgKiBNYXRoLnNxcnQoIDEgKyByICogciApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHIgPSAwLjA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhpcyBtYXRyaXggdG8gdGhlIGlkZW50aXR5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5cclxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBpZGVudGl0eSggbSwgbiApIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXRyaXgoIG0sIG4gKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG07IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgbjsgaisrICkge1xyXG4gICAgICAgIHJlc3VsdC5lbnRyaWVzWyByZXN1bHQuaW5kZXgoIGksIGogKSBdID0gKCBpID09PSBqID8gMS4wIDogMC4wICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3F1YXJlIGRpYWdvbmFsIG1hdHJpeCwgd2hvc2UgZW50cmllcyBhbG9uZyB0aGUgZGlhZ29uYWwgYXJlIHNwZWNpZmllZCBieSB0aGUgcGFzc2VkLWluIGFycmF5LCBhbmQgdGhlXHJcbiAgICogb3RoZXIgZW50cmllcyBhcmUgMC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSBkaWFnb25hbFZhbHVlc1xyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgc3RhdGljIGRpYWdvbmFsTWF0cml4KCBkaWFnb25hbFZhbHVlcyApIHtcclxuICAgIGNvbnN0IG4gPSBkaWFnb25hbFZhbHVlcy5sZW5ndGg7XHJcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWF0cml4KCBuLCBuICk7IC8vIFNob3VsZCBmaWxsIGluIHplcm9zXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBuOyBpKysgKSB7XHJcbiAgICAgIHJlc3VsdC5lbnRyaWVzWyByZXN1bHQuaW5kZXgoIGksIGkgKSBdID0gZGlhZ29uYWxWYWx1ZXNbIGkgXTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHZlY3RvclxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgc3RhdGljIHJvd1ZlY3RvcjIoIHZlY3RvciApIHtcclxuICAgIHJldHVybiBuZXcgTWF0cml4KCAxLCAyLCBbIHZlY3Rvci54LCB2ZWN0b3IueSBdICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IHZlY3RvclxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgc3RhdGljIHJvd1ZlY3RvcjMoIHZlY3RvciApIHtcclxuICAgIHJldHVybiBuZXcgTWF0cml4KCAxLCAzLCBbIHZlY3Rvci54LCB2ZWN0b3IueSwgdmVjdG9yLnogXSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3I0fSB2ZWN0b3JcclxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxyXG4gICAqL1xyXG4gIHN0YXRpYyByb3dWZWN0b3I0KCB2ZWN0b3IgKSB7XHJcbiAgICByZXR1cm4gbmV3IE1hdHJpeCggMSwgNCwgWyB2ZWN0b3IueCwgdmVjdG9yLnksIHZlY3Rvci56LCB2ZWN0b3IudyBdICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ8VmVjdG9yM3xWZWN0b3I0fSB2ZWN0b3JcclxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxyXG4gICAqL1xyXG4gIHN0YXRpYyByb3dWZWN0b3IoIHZlY3RvciApIHtcclxuICAgIGlmICggdmVjdG9yLmlzVmVjdG9yMiApIHtcclxuICAgICAgcmV0dXJuIE1hdHJpeC5yb3dWZWN0b3IyKCB2ZWN0b3IgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB2ZWN0b3IuaXNWZWN0b3IzICkge1xyXG4gICAgICByZXR1cm4gTWF0cml4LnJvd1ZlY3RvcjMoIHZlY3RvciApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHZlY3Rvci5pc1ZlY3RvcjQgKSB7XHJcbiAgICAgIHJldHVybiBNYXRyaXgucm93VmVjdG9yNCggdmVjdG9yICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5kZXRlY3RlZCB0eXBlIG9mIHZlY3RvcjogJHt2ZWN0b3IudG9TdHJpbmcoKX1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHZlY3RvclxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgc3RhdGljIGNvbHVtblZlY3RvcjIoIHZlY3RvciApIHtcclxuICAgIHJldHVybiBuZXcgTWF0cml4KCAyLCAxLCBbIHZlY3Rvci54LCB2ZWN0b3IueSBdICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IHZlY3RvclxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgc3RhdGljIGNvbHVtblZlY3RvcjMoIHZlY3RvciApIHtcclxuICAgIHJldHVybiBuZXcgTWF0cml4KCAzLCAxLCBbIHZlY3Rvci54LCB2ZWN0b3IueSwgdmVjdG9yLnogXSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3I0fSB2ZWN0b3JcclxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjb2x1bW5WZWN0b3I0KCB2ZWN0b3IgKSB7XHJcbiAgICByZXR1cm4gbmV3IE1hdHJpeCggNCwgMSwgWyB2ZWN0b3IueCwgdmVjdG9yLnksIHZlY3Rvci56LCB2ZWN0b3IudyBdICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ8VmVjdG9yM3xWZWN0b3I0fSB2ZWN0b3JcclxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjb2x1bW5WZWN0b3IoIHZlY3RvciApIHtcclxuICAgIGlmICggdmVjdG9yLmlzVmVjdG9yMiApIHtcclxuICAgICAgcmV0dXJuIE1hdHJpeC5jb2x1bW5WZWN0b3IyKCB2ZWN0b3IgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB2ZWN0b3IuaXNWZWN0b3IzICkge1xyXG4gICAgICByZXR1cm4gTWF0cml4LmNvbHVtblZlY3RvcjMoIHZlY3RvciApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHZlY3Rvci5pc1ZlY3RvcjQgKSB7XHJcbiAgICAgIHJldHVybiBNYXRyaXguY29sdW1uVmVjdG9yNCggdmVjdG9yICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5kZXRlY3RlZCB0eXBlIG9mIHZlY3RvcjogJHt2ZWN0b3IudG9TdHJpbmcoKX1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBNYXRyaXggd2hlcmUgZWFjaCBjb2x1bW4gaXMgYSB2ZWN0b3JcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxWZWN0b3IyPn0gdmVjdG9yc1xyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tVmVjdG9yczIoIHZlY3RvcnMgKSB7XHJcbiAgICBjb25zdCBkaW1lbnNpb24gPSAyO1xyXG4gICAgY29uc3QgbiA9IHZlY3RvcnMubGVuZ3RoO1xyXG4gICAgY29uc3QgZGF0YSA9IG5ldyBBcnJheVR5cGUoIGRpbWVuc2lvbiAqIG4gKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBuOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHZlY3RvciA9IHZlY3RvcnNbIGkgXTtcclxuICAgICAgZGF0YVsgaSBdID0gdmVjdG9yLng7XHJcbiAgICAgIGRhdGFbIGkgKyBuIF0gPSB2ZWN0b3IueTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IE1hdHJpeCggZGltZW5zaW9uLCBuLCBkYXRhLCB0cnVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBNYXRyaXggd2hlcmUgZWFjaCBjb2x1bW4gaXMgYSB2ZWN0b3JcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxWZWN0b3IzPn0gdmVjdG9yc1xyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tVmVjdG9yczMoIHZlY3RvcnMgKSB7XHJcbiAgICBjb25zdCBkaW1lbnNpb24gPSAzO1xyXG4gICAgY29uc3QgbiA9IHZlY3RvcnMubGVuZ3RoO1xyXG4gICAgY29uc3QgZGF0YSA9IG5ldyBBcnJheVR5cGUoIGRpbWVuc2lvbiAqIG4gKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBuOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHZlY3RvciA9IHZlY3RvcnNbIGkgXTtcclxuICAgICAgZGF0YVsgaSBdID0gdmVjdG9yLng7XHJcbiAgICAgIGRhdGFbIGkgKyBuIF0gPSB2ZWN0b3IueTtcclxuICAgICAgZGF0YVsgaSArIDIgKiBuIF0gPSB2ZWN0b3IuejtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IE1hdHJpeCggZGltZW5zaW9uLCBuLCBkYXRhLCB0cnVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBNYXRyaXggd2hlcmUgZWFjaCBjb2x1bW4gaXMgYSB2ZWN0b3JcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxWZWN0b3I0Pn0gdmVjdG9yc1xyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tVmVjdG9yczQoIHZlY3RvcnMgKSB7XHJcbiAgICBjb25zdCBkaW1lbnNpb24gPSA0O1xyXG4gICAgY29uc3QgbiA9IHZlY3RvcnMubGVuZ3RoO1xyXG4gICAgY29uc3QgZGF0YSA9IG5ldyBBcnJheVR5cGUoIGRpbWVuc2lvbiAqIG4gKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBuOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHZlY3RvciA9IHZlY3RvcnNbIGkgXTtcclxuICAgICAgZGF0YVsgaSBdID0gdmVjdG9yLng7XHJcbiAgICAgIGRhdGFbIGkgKyBuIF0gPSB2ZWN0b3IueTtcclxuICAgICAgZGF0YVsgaSArIDIgKiBuIF0gPSB2ZWN0b3IuejtcclxuICAgICAgZGF0YVsgaSArIDMgKiBuIF0gPSB2ZWN0b3IudztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IE1hdHJpeCggZGltZW5zaW9uLCBuLCBkYXRhLCB0cnVlICk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBAcHVibGljIHtib29sZWFufVxyXG5NYXRyaXgucHJvdG90eXBlLmlzTWF0cml4ID0gdHJ1ZTtcclxuXHJcbmRvdC5yZWdpc3RlciggJ01hdHJpeCcsIE1hdHJpeCApO1xyXG5leHBvcnQgZGVmYXVsdCBNYXRyaXg7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsR0FBRyxNQUFNLFVBQVU7QUFDMUIsT0FBTyw4QkFBOEI7QUFDckMsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUNsRCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLDBCQUEwQixNQUFNLGlDQUFpQztBQUN4RSxPQUFPQyxPQUFPLE1BQU0sY0FBYztBQUNsQyxPQUFPQyxPQUFPLE1BQU0sY0FBYztBQUNsQyxPQUFPQyxPQUFPLE1BQU0sY0FBYztBQUVsQyxNQUFNQyxTQUFTLEdBQUdDLE1BQU0sQ0FBQ0MsWUFBWSxJQUFJQyxLQUFLO0FBRTlDLE1BQU1DLE1BQU0sQ0FBQztFQUNYO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxDQUFDLEVBQUVDLENBQUMsRUFBRUMsTUFBTSxFQUFFQyxJQUFJLEVBQUc7SUFDaEM7SUFDQSxJQUFJLENBQUNILENBQUMsR0FBR0EsQ0FBQztJQUNWLElBQUksQ0FBQ0MsQ0FBQyxHQUFHQSxDQUFDO0lBRVYsTUFBTUcsSUFBSSxHQUFHSixDQUFDLEdBQUdDLENBQUM7SUFDbEI7SUFDQSxJQUFJLENBQUNHLElBQUksR0FBR0EsSUFBSTtJQUNoQixJQUFJQyxDQUFDO0lBRUwsSUFBS0YsSUFBSSxFQUFHO01BQ1Y7TUFDQSxJQUFJLENBQUNHLE9BQU8sR0FBR0osTUFBTTtJQUN2QixDQUFDLE1BQ0k7TUFDSCxJQUFLLENBQUNBLE1BQU0sRUFBRztRQUNiQSxNQUFNLEdBQUcsQ0FBQztNQUNaOztNQUVBO01BQ0EsSUFBSSxDQUFDSSxPQUFPLEdBQUcsSUFBSVosU0FBUyxDQUFFVSxJQUFLLENBQUM7TUFFcEMsSUFBS2xCLE9BQU8sQ0FBRWdCLE1BQU8sQ0FBQyxFQUFHO1FBQ3ZCSyxNQUFNLElBQUlBLE1BQU0sQ0FBRUwsTUFBTSxDQUFDTSxNQUFNLEtBQUtKLElBQUssQ0FBQztRQUUxQyxLQUFNQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdELElBQUksRUFBRUMsQ0FBQyxFQUFFLEVBQUc7VUFDM0IsSUFBSSxDQUFDQyxPQUFPLENBQUVELENBQUMsQ0FBRSxHQUFHSCxNQUFNLENBQUVHLENBQUMsQ0FBRTtRQUNqQztNQUNGLENBQUMsTUFDSTtRQUNILEtBQU1BLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0QsSUFBSSxFQUFFQyxDQUFDLEVBQUUsRUFBRztVQUMzQixJQUFJLENBQUNDLE9BQU8sQ0FBRUQsQ0FBQyxDQUFFLEdBQUdILE1BQU07UUFDNUI7TUFDRjtJQUNGO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFTyxJQUFJQSxDQUFBLEVBQUc7SUFDTCxNQUFNQyxNQUFNLEdBQUcsSUFBSVosTUFBTSxDQUFFLElBQUksQ0FBQ0UsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBRSxDQUFDO0lBQzNDLEtBQU0sSUFBSUksQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ0QsSUFBSSxFQUFFQyxDQUFDLEVBQUUsRUFBRztNQUNwQ0ssTUFBTSxDQUFDSixPQUFPLENBQUVELENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQ0MsT0FBTyxDQUFFRCxDQUFDLENBQUU7SUFDekM7SUFDQSxPQUFPSyxNQUFNO0VBQ2Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxRQUFRQSxDQUFBLEVBQUc7SUFDVCxPQUFPLElBQUksQ0FBQ0wsT0FBTztFQUNyQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VNLFlBQVlBLENBQUEsRUFBRztJQUNiLE9BQU8sSUFBSWxCLFNBQVMsQ0FBRSxJQUFJLENBQUNZLE9BQVEsQ0FBQztFQUN0Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VPLGVBQWVBLENBQUEsRUFBRztJQUNoQixPQUFPLElBQUksQ0FBQ2IsQ0FBQztFQUNmOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRWMsa0JBQWtCQSxDQUFBLEVBQUc7SUFDbkIsT0FBTyxJQUFJLENBQUNiLENBQUM7RUFDZjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VjLEtBQUtBLENBQUVWLENBQUMsRUFBRVcsQ0FBQyxFQUFHO0lBQ1osT0FBT1gsQ0FBQyxHQUFHLElBQUksQ0FBQ0osQ0FBQyxHQUFHZSxDQUFDO0VBQ3ZCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsR0FBR0EsQ0FBRVosQ0FBQyxFQUFFVyxDQUFDLEVBQUc7SUFDVixPQUFPLElBQUksQ0FBQ1YsT0FBTyxDQUFFLElBQUksQ0FBQ1MsS0FBSyxDQUFFVixDQUFDLEVBQUVXLENBQUUsQ0FBQyxDQUFFO0VBQzNDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsR0FBR0EsQ0FBRWIsQ0FBQyxFQUFFVyxDQUFDLEVBQUVHLENBQUMsRUFBRztJQUNiLElBQUksQ0FBQ2IsT0FBTyxDQUFFLElBQUksQ0FBQ1MsS0FBSyxDQUFFVixDQUFDLEVBQUVXLENBQUUsQ0FBQyxDQUFFLEdBQUdHLENBQUM7RUFDeEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFNBQVNBLENBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFFLEVBQUVDLEVBQUUsRUFBRztJQUMxQixNQUFNZCxNQUFNLEdBQUcsSUFBSVosTUFBTSxDQUFFd0IsRUFBRSxHQUFHRCxFQUFFLEdBQUcsQ0FBQyxFQUFFRyxFQUFFLEdBQUdELEVBQUUsR0FBRyxDQUFFLENBQUM7SUFDckQsS0FBTSxJQUFJbEIsQ0FBQyxHQUFHZ0IsRUFBRSxFQUFFaEIsQ0FBQyxJQUFJaUIsRUFBRSxFQUFFakIsQ0FBQyxFQUFFLEVBQUc7TUFDL0IsS0FBTSxJQUFJVyxDQUFDLEdBQUdPLEVBQUUsRUFBRVAsQ0FBQyxJQUFJUSxFQUFFLEVBQUVSLENBQUMsRUFBRSxFQUFHO1FBQy9CTixNQUFNLENBQUNKLE9BQU8sQ0FBRUksTUFBTSxDQUFDSyxLQUFLLENBQUVWLENBQUMsR0FBR2dCLEVBQUUsRUFBRUwsQ0FBQyxHQUFHTyxFQUFHLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQ2pCLE9BQU8sQ0FBRSxJQUFJLENBQUNTLEtBQUssQ0FBRVYsQ0FBQyxFQUFFVyxDQUFFLENBQUMsQ0FBRTtNQUN2RjtJQUNGO0lBQ0EsT0FBT04sTUFBTTtFQUNmOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWUsaUJBQWlCQSxDQUFFQyxDQUFDLEVBQUVILEVBQUUsRUFBRUMsRUFBRSxFQUFHO0lBQzdCLE1BQU1kLE1BQU0sR0FBRyxJQUFJWixNQUFNLENBQUU0QixDQUFDLENBQUNsQixNQUFNLEVBQUVnQixFQUFFLEdBQUdELEVBQUUsR0FBRyxDQUFFLENBQUM7SUFDbEQsS0FBTSxJQUFJbEIsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHcUIsQ0FBQyxDQUFDbEIsTUFBTSxFQUFFSCxDQUFDLEVBQUUsRUFBRztNQUNuQyxLQUFNLElBQUlXLENBQUMsR0FBR08sRUFBRSxFQUFFUCxDQUFDLElBQUlRLEVBQUUsRUFBRVIsQ0FBQyxFQUFFLEVBQUc7UUFDL0JOLE1BQU0sQ0FBQ0osT0FBTyxDQUFFSSxNQUFNLENBQUNLLEtBQUssQ0FBRVYsQ0FBQyxFQUFFVyxDQUFDLEdBQUdPLEVBQUcsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDakIsT0FBTyxDQUFFLElBQUksQ0FBQ1MsS0FBSyxDQUFFVyxDQUFDLENBQUVyQixDQUFDLENBQUUsRUFBRVcsQ0FBRSxDQUFDLENBQUU7TUFDdkY7SUFDRjtJQUNBLE9BQU9OLE1BQU07RUFDZjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWlCLFNBQVNBLENBQUVqQixNQUFNLEVBQUc7SUFDbEJBLE1BQU0sR0FBR0EsTUFBTSxJQUFJLElBQUlaLE1BQU0sQ0FBRSxJQUFJLENBQUNHLENBQUMsRUFBRSxJQUFJLENBQUNELENBQUUsQ0FBQztJQUMvQ08sTUFBTSxJQUFJQSxNQUFNLENBQUVHLE1BQU0sQ0FBQ1YsQ0FBQyxLQUFLLElBQUksQ0FBQ0MsQ0FBRSxDQUFDO0lBQ3ZDTSxNQUFNLElBQUlBLE1BQU0sQ0FBRUcsTUFBTSxDQUFDVCxDQUFDLEtBQUssSUFBSSxDQUFDRCxDQUFFLENBQUM7SUFDdkMsS0FBTSxJQUFJSyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDTCxDQUFDLEVBQUVLLENBQUMsRUFBRSxFQUFHO01BQ2pDLEtBQU0sSUFBSVcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ2YsQ0FBQyxFQUFFZSxDQUFDLEVBQUUsRUFBRztRQUNqQ04sTUFBTSxDQUFDSixPQUFPLENBQUVJLE1BQU0sQ0FBQ0ssS0FBSyxDQUFFQyxDQUFDLEVBQUVYLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDQyxPQUFPLENBQUUsSUFBSSxDQUFDUyxLQUFLLENBQUVWLENBQUMsRUFBRVcsQ0FBRSxDQUFDLENBQUU7TUFDN0U7SUFDRjtJQUNBLE9BQU9OLE1BQU07RUFDZjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VrQixLQUFLQSxDQUFBLEVBQUc7SUFDTixJQUFJQyxDQUFDLEdBQUcsQ0FBQztJQUNULEtBQU0sSUFBSWIsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ2YsQ0FBQyxFQUFFZSxDQUFDLEVBQUUsRUFBRztNQUNqQyxJQUFJRyxDQUFDLEdBQUcsQ0FBQztNQUNULEtBQU0sSUFBSWQsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ0wsQ0FBQyxFQUFFSyxDQUFDLEVBQUUsRUFBRztRQUNqQ2MsQ0FBQyxJQUFJVyxJQUFJLENBQUNDLEdBQUcsQ0FBRSxJQUFJLENBQUN6QixPQUFPLENBQUUsSUFBSSxDQUFDUyxLQUFLLENBQUVWLENBQUMsRUFBRVcsQ0FBRSxDQUFDLENBQUcsQ0FBQztNQUNyRDtNQUNBYSxDQUFDLEdBQUdDLElBQUksQ0FBQ0UsR0FBRyxDQUFFSCxDQUFDLEVBQUVWLENBQUUsQ0FBQztJQUN0QjtJQUNBLE9BQU9VLENBQUM7RUFDVjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLEtBQUtBLENBQUEsRUFBRztJQUNOLE9BQVMsSUFBSTNDLDBCQUEwQixDQUFFLElBQUssQ0FBQyxDQUFDMkMsS0FBSyxDQUFDLENBQUM7RUFDekQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxPQUFPQSxDQUFBLEVBQUc7SUFDUixJQUFJTCxDQUFDLEdBQUcsQ0FBQztJQUNULEtBQU0sSUFBSXhCLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNMLENBQUMsRUFBRUssQ0FBQyxFQUFFLEVBQUc7TUFDakMsSUFBSWMsQ0FBQyxHQUFHLENBQUM7TUFDVCxLQUFNLElBQUlILENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNmLENBQUMsRUFBRWUsQ0FBQyxFQUFFLEVBQUc7UUFDakNHLENBQUMsSUFBSVcsSUFBSSxDQUFDQyxHQUFHLENBQUUsSUFBSSxDQUFDekIsT0FBTyxDQUFFLElBQUksQ0FBQ1MsS0FBSyxDQUFFVixDQUFDLEVBQUVXLENBQUUsQ0FBQyxDQUFHLENBQUM7TUFDckQ7TUFDQWEsQ0FBQyxHQUFHQyxJQUFJLENBQUNFLEdBQUcsQ0FBRUgsQ0FBQyxFQUFFVixDQUFFLENBQUM7SUFDdEI7SUFDQSxPQUFPVSxDQUFDO0VBQ1Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFTSxLQUFLQSxDQUFBLEVBQUc7SUFDTixJQUFJTixDQUFDLEdBQUcsQ0FBQztJQUNULEtBQU0sSUFBSXhCLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNMLENBQUMsRUFBRUssQ0FBQyxFQUFFLEVBQUc7TUFDakMsS0FBTSxJQUFJVyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDZixDQUFDLEVBQUVlLENBQUMsRUFBRSxFQUFHO1FBQ2pDYSxDQUFDLEdBQUcvQixNQUFNLENBQUNzQyxLQUFLLENBQUVQLENBQUMsRUFBRSxJQUFJLENBQUN2QixPQUFPLENBQUUsSUFBSSxDQUFDUyxLQUFLLENBQUVWLENBQUMsRUFBRVcsQ0FBRSxDQUFDLENBQUcsQ0FBQztNQUMzRDtJQUNGO0lBQ0EsT0FBT2EsQ0FBQztFQUNWOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRVEsTUFBTUEsQ0FBQSxFQUFHO0lBQ1AsTUFBTTNCLE1BQU0sR0FBRyxJQUFJWixNQUFNLENBQUUsSUFBSSxDQUFDRSxDQUFDLEVBQUUsSUFBSSxDQUFDQyxDQUFFLENBQUM7SUFDM0MsS0FBTSxJQUFJSSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDTCxDQUFDLEVBQUVLLENBQUMsRUFBRSxFQUFHO01BQ2pDLEtBQU0sSUFBSVcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ2YsQ0FBQyxFQUFFZSxDQUFDLEVBQUUsRUFBRztRQUNqQ04sTUFBTSxDQUFDSixPQUFPLENBQUVJLE1BQU0sQ0FBQ0ssS0FBSyxDQUFFVixDQUFDLEVBQUVXLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUNWLE9BQU8sQ0FBRSxJQUFJLENBQUNTLEtBQUssQ0FBRVYsQ0FBQyxFQUFFVyxDQUFFLENBQUMsQ0FBRTtNQUM5RTtJQUNGO0lBQ0EsT0FBT04sTUFBTTtFQUNmOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFNEIsSUFBSUEsQ0FBRUMsTUFBTSxFQUFHO0lBQ2IsSUFBSSxDQUFDQyxxQkFBcUIsQ0FBRUQsTUFBTyxDQUFDO0lBQ3BDLE1BQU03QixNQUFNLEdBQUcsSUFBSVosTUFBTSxDQUFFLElBQUksQ0FBQ0UsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBRSxDQUFDO0lBQzNDLEtBQU0sSUFBSUksQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ0wsQ0FBQyxFQUFFSyxDQUFDLEVBQUUsRUFBRztNQUNqQyxLQUFNLElBQUlXLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNmLENBQUMsRUFBRWUsQ0FBQyxFQUFFLEVBQUc7UUFDakMsTUFBTUQsS0FBSyxHQUFHTCxNQUFNLENBQUNLLEtBQUssQ0FBRVYsQ0FBQyxFQUFFVyxDQUFFLENBQUM7UUFDbENOLE1BQU0sQ0FBQ0osT0FBTyxDQUFFUyxLQUFLLENBQUUsR0FBRyxJQUFJLENBQUNULE9BQU8sQ0FBRVMsS0FBSyxDQUFFLEdBQUd3QixNQUFNLENBQUNqQyxPQUFPLENBQUVTLEtBQUssQ0FBRTtNQUMzRTtJQUNGO0lBQ0EsT0FBT0wsTUFBTTtFQUNmOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFK0IsVUFBVUEsQ0FBRUYsTUFBTSxFQUFHO0lBQ25CLElBQUksQ0FBQ0MscUJBQXFCLENBQUVELE1BQU8sQ0FBQztJQUNwQyxLQUFNLElBQUlsQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDTCxDQUFDLEVBQUVLLENBQUMsRUFBRSxFQUFHO01BQ2pDLEtBQU0sSUFBSVcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ2YsQ0FBQyxFQUFFZSxDQUFDLEVBQUUsRUFBRztRQUNqQyxNQUFNRCxLQUFLLEdBQUcsSUFBSSxDQUFDQSxLQUFLLENBQUVWLENBQUMsRUFBRVcsQ0FBRSxDQUFDO1FBQ2hDLElBQUksQ0FBQ1YsT0FBTyxDQUFFUyxLQUFLLENBQUUsR0FBRyxJQUFJLENBQUNULE9BQU8sQ0FBRVMsS0FBSyxDQUFFLEdBQUd3QixNQUFNLENBQUNqQyxPQUFPLENBQUVTLEtBQUssQ0FBRTtNQUN6RTtJQUNGO0lBQ0EsT0FBTyxJQUFJO0VBQ2I7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFMkIsV0FBV0EsQ0FBRUgsTUFBTSxFQUFFSSxLQUFLLEVBQUc7SUFDM0IsSUFBSSxDQUFDSCxxQkFBcUIsQ0FBRUQsTUFBTyxDQUFDO0lBQ3BDLEtBQU0sSUFBSWxDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNMLENBQUMsRUFBRUssQ0FBQyxFQUFFLEVBQUc7TUFDakMsS0FBTSxJQUFJVyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDZixDQUFDLEVBQUVlLENBQUMsRUFBRSxFQUFHO1FBQ2pDLE1BQU1ELEtBQUssR0FBRyxJQUFJLENBQUNBLEtBQUssQ0FBRVYsQ0FBQyxFQUFFVyxDQUFFLENBQUM7UUFDaEMsTUFBTTRCLENBQUMsR0FBRyxJQUFJLENBQUN0QyxPQUFPLENBQUVTLEtBQUssQ0FBRTtRQUMvQixNQUFNOEIsQ0FBQyxHQUFHTixNQUFNLENBQUNqQyxPQUFPLENBQUVTLEtBQUssQ0FBRTtRQUNqQyxJQUFJLENBQUNULE9BQU8sQ0FBRVMsS0FBSyxDQUFFLEdBQUc2QixDQUFDLEdBQUcsQ0FBRUMsQ0FBQyxHQUFHRCxDQUFDLElBQUtELEtBQUs7TUFDL0M7SUFDRjtJQUNBLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxLQUFLQSxDQUFFUCxNQUFNLEVBQUc7SUFDZCxJQUFJLENBQUNDLHFCQUFxQixDQUFFRCxNQUFPLENBQUM7SUFDcEMsTUFBTTdCLE1BQU0sR0FBRyxJQUFJWixNQUFNLENBQUUsSUFBSSxDQUFDRSxDQUFDLEVBQUUsSUFBSSxDQUFDQyxDQUFFLENBQUM7SUFDM0MsS0FBTSxJQUFJSSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDTCxDQUFDLEVBQUVLLENBQUMsRUFBRSxFQUFHO01BQ2pDLEtBQU0sSUFBSVcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ2YsQ0FBQyxFQUFFZSxDQUFDLEVBQUUsRUFBRztRQUNqQyxNQUFNRCxLQUFLLEdBQUcsSUFBSSxDQUFDQSxLQUFLLENBQUVWLENBQUMsRUFBRVcsQ0FBRSxDQUFDO1FBQ2hDTixNQUFNLENBQUNKLE9BQU8sQ0FBRVMsS0FBSyxDQUFFLEdBQUcsSUFBSSxDQUFDVCxPQUFPLENBQUVTLEtBQUssQ0FBRSxHQUFHd0IsTUFBTSxDQUFDakMsT0FBTyxDQUFFUyxLQUFLLENBQUU7TUFDM0U7SUFDRjtJQUNBLE9BQU9MLE1BQU07RUFDZjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRXFDLFdBQVdBLENBQUVSLE1BQU0sRUFBRztJQUNwQixJQUFJLENBQUNDLHFCQUFxQixDQUFFRCxNQUFPLENBQUM7SUFDcEMsS0FBTSxJQUFJbEMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ0wsQ0FBQyxFQUFFSyxDQUFDLEVBQUUsRUFBRztNQUNqQyxLQUFNLElBQUlXLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNmLENBQUMsRUFBRWUsQ0FBQyxFQUFFLEVBQUc7UUFDakMsTUFBTUQsS0FBSyxHQUFHLElBQUksQ0FBQ0EsS0FBSyxDQUFFVixDQUFDLEVBQUVXLENBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUNWLE9BQU8sQ0FBRVMsS0FBSyxDQUFFLEdBQUcsSUFBSSxDQUFDVCxPQUFPLENBQUVTLEtBQUssQ0FBRSxHQUFHd0IsTUFBTSxDQUFDakMsT0FBTyxDQUFFUyxLQUFLLENBQUU7TUFDekU7SUFDRjtJQUNBLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFaUMsVUFBVUEsQ0FBRVQsTUFBTSxFQUFHO0lBQ25CLElBQUksQ0FBQ0MscUJBQXFCLENBQUVELE1BQU8sQ0FBQztJQUNwQyxNQUFNN0IsTUFBTSxHQUFHLElBQUlaLE1BQU0sQ0FBRSxJQUFJLENBQUNFLENBQUMsRUFBRSxJQUFJLENBQUNDLENBQUUsQ0FBQztJQUMzQyxLQUFNLElBQUlJLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNMLENBQUMsRUFBRUssQ0FBQyxFQUFFLEVBQUc7TUFDakMsS0FBTSxJQUFJVyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDZixDQUFDLEVBQUVlLENBQUMsRUFBRSxFQUFHO1FBQ2pDLE1BQU1ELEtBQUssR0FBR0wsTUFBTSxDQUFDSyxLQUFLLENBQUVWLENBQUMsRUFBRVcsQ0FBRSxDQUFDO1FBQ2xDTixNQUFNLENBQUNKLE9BQU8sQ0FBRVMsS0FBSyxDQUFFLEdBQUcsSUFBSSxDQUFDVCxPQUFPLENBQUVTLEtBQUssQ0FBRSxHQUFHd0IsTUFBTSxDQUFDakMsT0FBTyxDQUFFUyxLQUFLLENBQUU7TUFDM0U7SUFDRjtJQUNBLE9BQU9MLE1BQU07RUFDZjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRXVDLGdCQUFnQkEsQ0FBRVYsTUFBTSxFQUFHO0lBQ3pCLElBQUksQ0FBQ0MscUJBQXFCLENBQUVELE1BQU8sQ0FBQztJQUNwQyxLQUFNLElBQUlsQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDTCxDQUFDLEVBQUVLLENBQUMsRUFBRSxFQUFHO01BQ2pDLEtBQU0sSUFBSVcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ2YsQ0FBQyxFQUFFZSxDQUFDLEVBQUUsRUFBRztRQUNqQyxNQUFNRCxLQUFLLEdBQUcsSUFBSSxDQUFDQSxLQUFLLENBQUVWLENBQUMsRUFBRVcsQ0FBRSxDQUFDO1FBQ2hDLElBQUksQ0FBQ1YsT0FBTyxDQUFFUyxLQUFLLENBQUUsR0FBRyxJQUFJLENBQUNULE9BQU8sQ0FBRVMsS0FBSyxDQUFFLEdBQUd3QixNQUFNLENBQUNqQyxPQUFPLENBQUVTLEtBQUssQ0FBRTtNQUN6RTtJQUNGO0lBQ0EsT0FBTyxJQUFJO0VBQ2I7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VtQyxnQkFBZ0JBLENBQUVYLE1BQU0sRUFBRztJQUN6QixJQUFJLENBQUNDLHFCQUFxQixDQUFFRCxNQUFPLENBQUM7SUFDcEMsTUFBTTdCLE1BQU0sR0FBRyxJQUFJWixNQUFNLENBQUUsSUFBSSxDQUFDRSxDQUFDLEVBQUUsSUFBSSxDQUFDQyxDQUFFLENBQUM7SUFDM0MsS0FBTSxJQUFJSSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDTCxDQUFDLEVBQUVLLENBQUMsRUFBRSxFQUFHO01BQ2pDLEtBQU0sSUFBSVcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ2YsQ0FBQyxFQUFFZSxDQUFDLEVBQUUsRUFBRztRQUNqQyxNQUFNRCxLQUFLLEdBQUcsSUFBSSxDQUFDQSxLQUFLLENBQUVWLENBQUMsRUFBRVcsQ0FBRSxDQUFDO1FBQ2hDTixNQUFNLENBQUNKLE9BQU8sQ0FBRVMsS0FBSyxDQUFFLEdBQUcsSUFBSSxDQUFDVCxPQUFPLENBQUVTLEtBQUssQ0FBRSxHQUFHd0IsTUFBTSxDQUFDakMsT0FBTyxDQUFFUyxLQUFLLENBQUU7TUFDM0U7SUFDRjtJQUNBLE9BQU9MLE1BQU07RUFDZjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRXlDLHNCQUFzQkEsQ0FBRVosTUFBTSxFQUFHO0lBQy9CLElBQUksQ0FBQ0MscUJBQXFCLENBQUVELE1BQU8sQ0FBQztJQUNwQyxLQUFNLElBQUlsQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDTCxDQUFDLEVBQUVLLENBQUMsRUFBRSxFQUFHO01BQ2pDLEtBQU0sSUFBSVcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ2YsQ0FBQyxFQUFFZSxDQUFDLEVBQUUsRUFBRztRQUNqQyxNQUFNRCxLQUFLLEdBQUcsSUFBSSxDQUFDQSxLQUFLLENBQUVWLENBQUMsRUFBRVcsQ0FBRSxDQUFDO1FBQ2hDLElBQUksQ0FBQ1YsT0FBTyxDQUFFUyxLQUFLLENBQUUsR0FBRyxJQUFJLENBQUNULE9BQU8sQ0FBRVMsS0FBSyxDQUFFLEdBQUd3QixNQUFNLENBQUNqQyxPQUFPLENBQUVTLEtBQUssQ0FBRTtNQUN6RTtJQUNGO0lBQ0EsT0FBTyxJQUFJO0VBQ2I7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VxQyxlQUFlQSxDQUFFYixNQUFNLEVBQUc7SUFDeEIsSUFBSSxDQUFDQyxxQkFBcUIsQ0FBRUQsTUFBTyxDQUFDO0lBQ3BDLE1BQU03QixNQUFNLEdBQUcsSUFBSVosTUFBTSxDQUFFLElBQUksQ0FBQ0UsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBRSxDQUFDO0lBQzNDLEtBQU0sSUFBSUksQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ0wsQ0FBQyxFQUFFSyxDQUFDLEVBQUUsRUFBRztNQUNqQyxLQUFNLElBQUlXLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNmLENBQUMsRUFBRWUsQ0FBQyxFQUFFLEVBQUc7UUFDakMsTUFBTUQsS0FBSyxHQUFHLElBQUksQ0FBQ0EsS0FBSyxDQUFFVixDQUFDLEVBQUVXLENBQUUsQ0FBQztRQUNoQ04sTUFBTSxDQUFDSixPQUFPLENBQUVTLEtBQUssQ0FBRSxHQUFHd0IsTUFBTSxDQUFDakMsT0FBTyxDQUFFUyxLQUFLLENBQUUsR0FBRyxJQUFJLENBQUNULE9BQU8sQ0FBRVMsS0FBSyxDQUFFO01BQzNFO0lBQ0Y7SUFDQSxPQUFPTCxNQUFNO0VBQ2Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UyQyxxQkFBcUJBLENBQUVkLE1BQU0sRUFBRztJQUM5QixJQUFJLENBQUNDLHFCQUFxQixDQUFFRCxNQUFPLENBQUM7SUFDcEMsS0FBTSxJQUFJbEMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ0wsQ0FBQyxFQUFFSyxDQUFDLEVBQUUsRUFBRztNQUNqQyxLQUFNLElBQUlXLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNmLENBQUMsRUFBRWUsQ0FBQyxFQUFFLEVBQUc7UUFDakMsTUFBTUQsS0FBSyxHQUFHLElBQUksQ0FBQ0EsS0FBSyxDQUFFVixDQUFDLEVBQUVXLENBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUNWLE9BQU8sQ0FBRVMsS0FBSyxDQUFFLEdBQUd3QixNQUFNLENBQUNqQyxPQUFPLENBQUVTLEtBQUssQ0FBRSxHQUFHLElBQUksQ0FBQ1QsT0FBTyxDQUFFUyxLQUFLLENBQUU7TUFDekU7SUFDRjtJQUNBLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFdUMsS0FBS0EsQ0FBRUMsY0FBYyxFQUFHO0lBQ3RCLElBQUk3QyxNQUFNO0lBQ1YsSUFBSUwsQ0FBQztJQUNMLElBQUlXLENBQUM7SUFDTCxJQUFJd0MsQ0FBQztJQUNMLElBQUlyQyxDQUFDO0lBQ0wsSUFBSW9CLE1BQU07SUFDVixJQUFLZ0IsY0FBYyxDQUFDRSxRQUFRLEVBQUc7TUFDN0JsQixNQUFNLEdBQUdnQixjQUFjO01BQ3ZCLElBQUtoQixNQUFNLENBQUN2QyxDQUFDLEtBQUssSUFBSSxDQUFDQyxDQUFDLEVBQUc7UUFDekIsTUFBTSxJQUFJeUQsS0FBSyxDQUFFLHFDQUFzQyxDQUFDO01BQzFEO01BQ0FoRCxNQUFNLEdBQUcsSUFBSVosTUFBTSxDQUFFLElBQUksQ0FBQ0UsQ0FBQyxFQUFFdUMsTUFBTSxDQUFDdEMsQ0FBRSxDQUFDO01BQ3ZDLE1BQU0wRCxVQUFVLEdBQUcsSUFBSWpFLFNBQVMsQ0FBRSxJQUFJLENBQUNPLENBQUUsQ0FBQztNQUMxQyxLQUFNZSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUd1QixNQUFNLENBQUN0QyxDQUFDLEVBQUVlLENBQUMsRUFBRSxFQUFHO1FBQy9CLEtBQU13QyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDdkQsQ0FBQyxFQUFFdUQsQ0FBQyxFQUFFLEVBQUc7VUFDN0JHLFVBQVUsQ0FBRUgsQ0FBQyxDQUFFLEdBQUdqQixNQUFNLENBQUNqQyxPQUFPLENBQUVpQyxNQUFNLENBQUN4QixLQUFLLENBQUV5QyxDQUFDLEVBQUV4QyxDQUFFLENBQUMsQ0FBRTtRQUMxRDtRQUNBLEtBQU1YLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNMLENBQUMsRUFBRUssQ0FBQyxFQUFFLEVBQUc7VUFDN0JjLENBQUMsR0FBRyxDQUFDO1VBQ0wsS0FBTXFDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUN2RCxDQUFDLEVBQUV1RCxDQUFDLEVBQUUsRUFBRztZQUM3QnJDLENBQUMsSUFBSSxJQUFJLENBQUNiLE9BQU8sQ0FBRSxJQUFJLENBQUNTLEtBQUssQ0FBRVYsQ0FBQyxFQUFFbUQsQ0FBRSxDQUFDLENBQUUsR0FBR0csVUFBVSxDQUFFSCxDQUFDLENBQUU7VUFDM0Q7VUFDQTlDLE1BQU0sQ0FBQ0osT0FBTyxDQUFFSSxNQUFNLENBQUNLLEtBQUssQ0FBRVYsQ0FBQyxFQUFFVyxDQUFFLENBQUMsQ0FBRSxHQUFHRyxDQUFDO1FBQzVDO01BQ0Y7TUFDQSxPQUFPVCxNQUFNO0lBQ2YsQ0FBQyxNQUNJO01BQ0hTLENBQUMsR0FBR29DLGNBQWM7TUFDbEI3QyxNQUFNLEdBQUcsSUFBSVosTUFBTSxDQUFFLElBQUksQ0FBQ0UsQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBRSxDQUFDO01BQ3JDLEtBQU1JLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNMLENBQUMsRUFBRUssQ0FBQyxFQUFFLEVBQUc7UUFDN0IsS0FBTVcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ2YsQ0FBQyxFQUFFZSxDQUFDLEVBQUUsRUFBRztVQUM3Qk4sTUFBTSxDQUFDSixPQUFPLENBQUVJLE1BQU0sQ0FBQ0ssS0FBSyxDQUFFVixDQUFDLEVBQUVXLENBQUUsQ0FBQyxDQUFFLEdBQUdHLENBQUMsR0FBRyxJQUFJLENBQUNiLE9BQU8sQ0FBRSxJQUFJLENBQUNTLEtBQUssQ0FBRVYsQ0FBQyxFQUFFVyxDQUFFLENBQUMsQ0FBRTtRQUNqRjtNQUNGO01BQ0EsT0FBT04sTUFBTTtJQUNmO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VrRCxXQUFXQSxDQUFFekMsQ0FBQyxFQUFHO0lBQ2YsS0FBTSxJQUFJZCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDTCxDQUFDLEVBQUVLLENBQUMsRUFBRSxFQUFHO01BQ2pDLEtBQU0sSUFBSVcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ2YsQ0FBQyxFQUFFZSxDQUFDLEVBQUUsRUFBRztRQUNqQyxNQUFNRCxLQUFLLEdBQUcsSUFBSSxDQUFDQSxLQUFLLENBQUVWLENBQUMsRUFBRVcsQ0FBRSxDQUFDO1FBQ2hDLElBQUksQ0FBQ1YsT0FBTyxDQUFFUyxLQUFLLENBQUUsR0FBR0ksQ0FBQyxHQUFHLElBQUksQ0FBQ2IsT0FBTyxDQUFFUyxLQUFLLENBQUU7TUFDbkQ7SUFDRjtJQUNBLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFOEMsS0FBS0EsQ0FBRXRCLE1BQU0sRUFBRztJQUNkLE9BQVMsSUFBSSxDQUFDdkMsQ0FBQyxLQUFLLElBQUksQ0FBQ0MsQ0FBQyxHQUFLLElBQUliLGVBQWUsQ0FBRSxJQUFLLENBQUMsQ0FBR3lFLEtBQUssQ0FBRXRCLE1BQU8sQ0FBQyxHQUNqRSxJQUFJbEQsZUFBZSxDQUFFLElBQUssQ0FBQyxDQUFHd0UsS0FBSyxDQUFFdEIsTUFBTyxDQUFDO0VBQzFEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFdUIsY0FBY0EsQ0FBRXZCLE1BQU0sRUFBRztJQUN2QixPQUFPLElBQUksQ0FBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQ2tDLEtBQUssQ0FBRXRCLE1BQU0sQ0FBQ1osU0FBUyxDQUFDLENBQUUsQ0FBQztFQUNyRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VvQyxPQUFPQSxDQUFBLEVBQUc7SUFDUixPQUFPLElBQUksQ0FBQ0YsS0FBSyxDQUFFL0QsTUFBTSxDQUFDa0UsUUFBUSxDQUFFLElBQUksQ0FBQ2hFLENBQUMsRUFBRSxJQUFJLENBQUNBLENBQUUsQ0FBRSxDQUFDO0VBQ3hEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRWlFLEdBQUdBLENBQUEsRUFBRztJQUNKLE9BQU8sSUFBSTdFLGVBQWUsQ0FBRSxJQUFLLENBQUMsQ0FBQzZFLEdBQUcsQ0FBQyxDQUFDO0VBQzFDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsSUFBSUEsQ0FBQSxFQUFHO0lBQ0wsT0FBTyxJQUFJNUUsMEJBQTBCLENBQUUsSUFBSyxDQUFDLENBQUM0RSxJQUFJLENBQUMsQ0FBQztFQUN0RDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLElBQUlBLENBQUEsRUFBRztJQUNMLE9BQU8sSUFBSTdFLDBCQUEwQixDQUFFLElBQUssQ0FBQyxDQUFDNkUsSUFBSSxDQUFDLENBQUM7RUFDdEQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxLQUFLQSxDQUFBLEVBQUc7SUFDTixJQUFJQyxDQUFDLEdBQUcsQ0FBQztJQUNULEtBQU0sSUFBSWhFLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3lCLElBQUksQ0FBQ3dDLEdBQUcsQ0FBRSxJQUFJLENBQUN0RSxDQUFDLEVBQUUsSUFBSSxDQUFDQyxDQUFFLENBQUMsRUFBRUksQ0FBQyxFQUFFLEVBQUc7TUFDckRnRSxDQUFDLElBQUksSUFBSSxDQUFDL0QsT0FBTyxDQUFFLElBQUksQ0FBQ1MsS0FBSyxDQUFFVixDQUFDLEVBQUVBLENBQUUsQ0FBQyxDQUFFO0lBQ3pDO0lBQ0EsT0FBT2dFLENBQUM7RUFDVjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0U3QixxQkFBcUJBLENBQUVELE1BQU0sRUFBRztJQUM5QixJQUFLQSxNQUFNLENBQUN2QyxDQUFDLEtBQUssSUFBSSxDQUFDQSxDQUFDLElBQUl1QyxNQUFNLENBQUN0QyxDQUFDLEtBQUssSUFBSSxDQUFDQSxDQUFDLEVBQUc7TUFDaEQsTUFBTSxJQUFJeUQsS0FBSyxDQUFFLCtCQUFnQyxDQUFDO0lBQ3BEO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VhLFFBQVFBLENBQUEsRUFBRztJQUNULElBQUk3RCxNQUFNLEdBQUcsRUFBRTtJQUNmQSxNQUFNLElBQUssUUFBTyxJQUFJLENBQUNHLGVBQWUsQ0FBQyxDQUFFLElBQUcsSUFBSSxDQUFDQyxrQkFBa0IsQ0FBQyxDQUFFLElBQUc7SUFDekUsS0FBTSxJQUFJMEQsR0FBRyxHQUFHLENBQUMsRUFBRUEsR0FBRyxHQUFHLElBQUksQ0FBQzNELGVBQWUsQ0FBQyxDQUFDLEVBQUUyRCxHQUFHLEVBQUUsRUFBRztNQUN2RCxLQUFNLElBQUlDLEdBQUcsR0FBRyxDQUFDLEVBQUVBLEdBQUcsR0FBRyxJQUFJLENBQUMzRCxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUyRCxHQUFHLEVBQUUsRUFBRztRQUMxRC9ELE1BQU0sSUFBSyxHQUFFLElBQUksQ0FBQ08sR0FBRyxDQUFFdUQsR0FBRyxFQUFFQyxHQUFJLENBQUUsR0FBRTtNQUN0QztNQUNBL0QsTUFBTSxJQUFJLElBQUk7SUFDaEI7SUFDQSxPQUFPQSxNQUFNO0VBQ2Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWdFLGNBQWNBLENBQUVDLE1BQU0sRUFBRztJQUN2QnBFLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ1AsQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbEMsT0FBTyxJQUFJVCxPQUFPLENBQUUsSUFBSSxDQUFDMEIsR0FBRyxDQUFFLENBQUMsRUFBRTBELE1BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQzFELEdBQUcsQ0FBRSxDQUFDLEVBQUUwRCxNQUFPLENBQUUsQ0FBQztFQUNwRTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxjQUFjQSxDQUFFRCxNQUFNLEVBQUc7SUFDdkJwRSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUNQLENBQUMsS0FBSyxDQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLE9BQU8sSUFBSVIsT0FBTyxDQUFFLElBQUksQ0FBQ3lCLEdBQUcsQ0FBRSxDQUFDLEVBQUUwRCxNQUFPLENBQUMsRUFBRSxJQUFJLENBQUMxRCxHQUFHLENBQUUsQ0FBQyxFQUFFMEQsTUFBTyxDQUFDLEVBQUUsSUFBSSxDQUFDMUQsR0FBRyxDQUFFLENBQUMsRUFBRTBELE1BQU8sQ0FBRSxDQUFDO0VBQzNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLGNBQWNBLENBQUVGLE1BQU0sRUFBRztJQUN2QnBFLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ1AsQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbEMsT0FBTyxJQUFJUCxPQUFPLENBQUUsSUFBSSxDQUFDd0IsR0FBRyxDQUFFLENBQUMsRUFBRTBELE1BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQzFELEdBQUcsQ0FBRSxDQUFDLEVBQUUwRCxNQUFPLENBQUMsRUFBRSxJQUFJLENBQUMxRCxHQUFHLENBQUUsQ0FBQyxFQUFFMEQsTUFBTyxDQUFDLEVBQUUsSUFBSSxDQUFDMUQsR0FBRyxDQUFFLENBQUMsRUFBRTBELE1BQU8sQ0FBRSxDQUFDO0VBQ2xIOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUNyQixNQUFNL0UsQ0FBQyxHQUFHLENBQUM7SUFDWCxNQUFNQyxDQUFDLEdBQUc4RSxPQUFPLENBQUN2RSxNQUFNO0lBRXhCRCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUNQLENBQUMsS0FBS0EsQ0FBRSxDQUFDO0lBQ2hDTyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUNOLENBQUMsS0FBS0EsQ0FBRSxDQUFDO0lBRWhDLEtBQU0sSUFBSUksQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHSixDQUFDLEVBQUVJLENBQUMsRUFBRSxFQUFHO01BQzVCLE1BQU0yRSxNQUFNLEdBQUdELE9BQU8sQ0FBRTFFLENBQUMsQ0FBRTtNQUMzQixJQUFJLENBQUNDLE9BQU8sQ0FBRUQsQ0FBQyxDQUFFLEdBQUcyRSxNQUFNLENBQUNDLENBQUM7TUFDNUIsSUFBSSxDQUFDM0UsT0FBTyxDQUFFRCxDQUFDLEdBQUdKLENBQUMsQ0FBRSxHQUFHK0UsTUFBTSxDQUFDRSxDQUFDO01BQ2hDLElBQUksQ0FBQzVFLE9BQU8sQ0FBRUQsQ0FBQyxHQUFHLENBQUMsR0FBR0osQ0FBQyxDQUFFLEdBQUcrRSxNQUFNLENBQUNHLENBQUM7SUFDdEM7SUFFQSxPQUFPLElBQUk7RUFDYjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBTy9DLEtBQUtBLENBQUVRLENBQUMsRUFBRUMsQ0FBQyxFQUFHO0lBQ25CLElBQUluQixDQUFDO0lBQ0wsSUFBS0ksSUFBSSxDQUFDQyxHQUFHLENBQUVhLENBQUUsQ0FBQyxHQUFHZCxJQUFJLENBQUNDLEdBQUcsQ0FBRWMsQ0FBRSxDQUFDLEVBQUc7TUFDbkNuQixDQUFDLEdBQUdtQixDQUFDLEdBQUdELENBQUM7TUFDVGxCLENBQUMsR0FBR0ksSUFBSSxDQUFDQyxHQUFHLENBQUVhLENBQUUsQ0FBQyxHQUFHZCxJQUFJLENBQUNzRCxJQUFJLENBQUUsQ0FBQyxHQUFHMUQsQ0FBQyxHQUFHQSxDQUFFLENBQUM7SUFDNUMsQ0FBQyxNQUNJLElBQUttQixDQUFDLEtBQUssQ0FBQyxFQUFHO01BQ2xCbkIsQ0FBQyxHQUFHa0IsQ0FBQyxHQUFHQyxDQUFDO01BQ1RuQixDQUFDLEdBQUdJLElBQUksQ0FBQ0MsR0FBRyxDQUFFYyxDQUFFLENBQUMsR0FBR2YsSUFBSSxDQUFDc0QsSUFBSSxDQUFFLENBQUMsR0FBRzFELENBQUMsR0FBR0EsQ0FBRSxDQUFDO0lBQzVDLENBQUMsTUFDSTtNQUNIQSxDQUFDLEdBQUcsR0FBRztJQUNUO0lBQ0EsT0FBT0EsQ0FBQztFQUNWOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPc0MsUUFBUUEsQ0FBRWhFLENBQUMsRUFBRUMsQ0FBQyxFQUFHO0lBQ3RCLE1BQU1TLE1BQU0sR0FBRyxJQUFJWixNQUFNLENBQUVFLENBQUMsRUFBRUMsQ0FBRSxDQUFDO0lBQ2pDLEtBQU0sSUFBSUksQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHTCxDQUFDLEVBQUVLLENBQUMsRUFBRSxFQUFHO01BQzVCLEtBQU0sSUFBSVcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHZixDQUFDLEVBQUVlLENBQUMsRUFBRSxFQUFHO1FBQzVCTixNQUFNLENBQUNKLE9BQU8sQ0FBRUksTUFBTSxDQUFDSyxLQUFLLENBQUVWLENBQUMsRUFBRVcsQ0FBRSxDQUFDLENBQUUsR0FBS1gsQ0FBQyxLQUFLVyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUs7TUFDbEU7SUFDRjtJQUNBLE9BQU9OLE1BQU07RUFDZjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBTzJFLGNBQWNBLENBQUVDLGNBQWMsRUFBRztJQUN0QyxNQUFNckYsQ0FBQyxHQUFHcUYsY0FBYyxDQUFDOUUsTUFBTTtJQUMvQixNQUFNRSxNQUFNLEdBQUcsSUFBSVosTUFBTSxDQUFFRyxDQUFDLEVBQUVBLENBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkMsS0FBTSxJQUFJSSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdKLENBQUMsRUFBRUksQ0FBQyxFQUFFLEVBQUc7TUFDNUJLLE1BQU0sQ0FBQ0osT0FBTyxDQUFFSSxNQUFNLENBQUNLLEtBQUssQ0FBRVYsQ0FBQyxFQUFFQSxDQUFFLENBQUMsQ0FBRSxHQUFHaUYsY0FBYyxDQUFFakYsQ0FBQyxDQUFFO0lBQzlEO0lBQ0EsT0FBT0ssTUFBTTtFQUNmOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU82RSxVQUFVQSxDQUFFUCxNQUFNLEVBQUc7SUFDMUIsT0FBTyxJQUFJbEYsTUFBTSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRWtGLE1BQU0sQ0FBQ0MsQ0FBQyxFQUFFRCxNQUFNLENBQUNFLENBQUMsQ0FBRyxDQUFDO0VBQ25EOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9NLFVBQVVBLENBQUVSLE1BQU0sRUFBRztJQUMxQixPQUFPLElBQUlsRixNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFa0YsTUFBTSxDQUFDQyxDQUFDLEVBQUVELE1BQU0sQ0FBQ0UsQ0FBQyxFQUFFRixNQUFNLENBQUNHLENBQUMsQ0FBRyxDQUFDO0VBQzdEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9NLFVBQVVBLENBQUVULE1BQU0sRUFBRztJQUMxQixPQUFPLElBQUlsRixNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFa0YsTUFBTSxDQUFDQyxDQUFDLEVBQUVELE1BQU0sQ0FBQ0UsQ0FBQyxFQUFFRixNQUFNLENBQUNHLENBQUMsRUFBRUgsTUFBTSxDQUFDVSxDQUFDLENBQUcsQ0FBQztFQUN2RTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPQyxTQUFTQSxDQUFFWCxNQUFNLEVBQUc7SUFDekIsSUFBS0EsTUFBTSxDQUFDWSxTQUFTLEVBQUc7TUFDdEIsT0FBTzlGLE1BQU0sQ0FBQ3lGLFVBQVUsQ0FBRVAsTUFBTyxDQUFDO0lBQ3BDLENBQUMsTUFDSSxJQUFLQSxNQUFNLENBQUNhLFNBQVMsRUFBRztNQUMzQixPQUFPL0YsTUFBTSxDQUFDMEYsVUFBVSxDQUFFUixNQUFPLENBQUM7SUFDcEMsQ0FBQyxNQUNJLElBQUtBLE1BQU0sQ0FBQ2MsU0FBUyxFQUFHO01BQzNCLE9BQU9oRyxNQUFNLENBQUMyRixVQUFVLENBQUVULE1BQU8sQ0FBQztJQUNwQyxDQUFDLE1BQ0k7TUFDSCxNQUFNLElBQUl0QixLQUFLLENBQUcsOEJBQTZCc0IsTUFBTSxDQUFDVCxRQUFRLENBQUMsQ0FBRSxFQUFFLENBQUM7SUFDdEU7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPd0IsYUFBYUEsQ0FBRWYsTUFBTSxFQUFHO0lBQzdCLE9BQU8sSUFBSWxGLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUVrRixNQUFNLENBQUNDLENBQUMsRUFBRUQsTUFBTSxDQUFDRSxDQUFDLENBQUcsQ0FBQztFQUNuRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPYyxhQUFhQSxDQUFFaEIsTUFBTSxFQUFHO0lBQzdCLE9BQU8sSUFBSWxGLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUVrRixNQUFNLENBQUNDLENBQUMsRUFBRUQsTUFBTSxDQUFDRSxDQUFDLEVBQUVGLE1BQU0sQ0FBQ0csQ0FBQyxDQUFHLENBQUM7RUFDN0Q7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBT2MsYUFBYUEsQ0FBRWpCLE1BQU0sRUFBRztJQUM3QixPQUFPLElBQUlsRixNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFa0YsTUFBTSxDQUFDQyxDQUFDLEVBQUVELE1BQU0sQ0FBQ0UsQ0FBQyxFQUFFRixNQUFNLENBQUNHLENBQUMsRUFBRUgsTUFBTSxDQUFDVSxDQUFDLENBQUcsQ0FBQztFQUN2RTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPUSxZQUFZQSxDQUFFbEIsTUFBTSxFQUFHO0lBQzVCLElBQUtBLE1BQU0sQ0FBQ1ksU0FBUyxFQUFHO01BQ3RCLE9BQU85RixNQUFNLENBQUNpRyxhQUFhLENBQUVmLE1BQU8sQ0FBQztJQUN2QyxDQUFDLE1BQ0ksSUFBS0EsTUFBTSxDQUFDYSxTQUFTLEVBQUc7TUFDM0IsT0FBTy9GLE1BQU0sQ0FBQ2tHLGFBQWEsQ0FBRWhCLE1BQU8sQ0FBQztJQUN2QyxDQUFDLE1BQ0ksSUFBS0EsTUFBTSxDQUFDYyxTQUFTLEVBQUc7TUFDM0IsT0FBT2hHLE1BQU0sQ0FBQ21HLGFBQWEsQ0FBRWpCLE1BQU8sQ0FBQztJQUN2QyxDQUFDLE1BQ0k7TUFDSCxNQUFNLElBQUl0QixLQUFLLENBQUcsOEJBQTZCc0IsTUFBTSxDQUFDVCxRQUFRLENBQUMsQ0FBRSxFQUFFLENBQUM7SUFDdEU7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPNEIsWUFBWUEsQ0FBRXBCLE9BQU8sRUFBRztJQUM3QixNQUFNcUIsU0FBUyxHQUFHLENBQUM7SUFDbkIsTUFBTW5HLENBQUMsR0FBRzhFLE9BQU8sQ0FBQ3ZFLE1BQU07SUFDeEIsTUFBTTZGLElBQUksR0FBRyxJQUFJM0csU0FBUyxDQUFFMEcsU0FBUyxHQUFHbkcsQ0FBRSxDQUFDO0lBRTNDLEtBQU0sSUFBSUksQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHSixDQUFDLEVBQUVJLENBQUMsRUFBRSxFQUFHO01BQzVCLE1BQU0yRSxNQUFNLEdBQUdELE9BQU8sQ0FBRTFFLENBQUMsQ0FBRTtNQUMzQmdHLElBQUksQ0FBRWhHLENBQUMsQ0FBRSxHQUFHMkUsTUFBTSxDQUFDQyxDQUFDO01BQ3BCb0IsSUFBSSxDQUFFaEcsQ0FBQyxHQUFHSixDQUFDLENBQUUsR0FBRytFLE1BQU0sQ0FBQ0UsQ0FBQztJQUMxQjtJQUVBLE9BQU8sSUFBSXBGLE1BQU0sQ0FBRXNHLFNBQVMsRUFBRW5HLENBQUMsRUFBRW9HLElBQUksRUFBRSxJQUFLLENBQUM7RUFDL0M7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBT0MsWUFBWUEsQ0FBRXZCLE9BQU8sRUFBRztJQUM3QixNQUFNcUIsU0FBUyxHQUFHLENBQUM7SUFDbkIsTUFBTW5HLENBQUMsR0FBRzhFLE9BQU8sQ0FBQ3ZFLE1BQU07SUFDeEIsTUFBTTZGLElBQUksR0FBRyxJQUFJM0csU0FBUyxDQUFFMEcsU0FBUyxHQUFHbkcsQ0FBRSxDQUFDO0lBRTNDLEtBQU0sSUFBSUksQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHSixDQUFDLEVBQUVJLENBQUMsRUFBRSxFQUFHO01BQzVCLE1BQU0yRSxNQUFNLEdBQUdELE9BQU8sQ0FBRTFFLENBQUMsQ0FBRTtNQUMzQmdHLElBQUksQ0FBRWhHLENBQUMsQ0FBRSxHQUFHMkUsTUFBTSxDQUFDQyxDQUFDO01BQ3BCb0IsSUFBSSxDQUFFaEcsQ0FBQyxHQUFHSixDQUFDLENBQUUsR0FBRytFLE1BQU0sQ0FBQ0UsQ0FBQztNQUN4Qm1CLElBQUksQ0FBRWhHLENBQUMsR0FBRyxDQUFDLEdBQUdKLENBQUMsQ0FBRSxHQUFHK0UsTUFBTSxDQUFDRyxDQUFDO0lBQzlCO0lBRUEsT0FBTyxJQUFJckYsTUFBTSxDQUFFc0csU0FBUyxFQUFFbkcsQ0FBQyxFQUFFb0csSUFBSSxFQUFFLElBQUssQ0FBQztFQUMvQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPRSxZQUFZQSxDQUFFeEIsT0FBTyxFQUFHO0lBQzdCLE1BQU1xQixTQUFTLEdBQUcsQ0FBQztJQUNuQixNQUFNbkcsQ0FBQyxHQUFHOEUsT0FBTyxDQUFDdkUsTUFBTTtJQUN4QixNQUFNNkYsSUFBSSxHQUFHLElBQUkzRyxTQUFTLENBQUUwRyxTQUFTLEdBQUduRyxDQUFFLENBQUM7SUFFM0MsS0FBTSxJQUFJSSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdKLENBQUMsRUFBRUksQ0FBQyxFQUFFLEVBQUc7TUFDNUIsTUFBTTJFLE1BQU0sR0FBR0QsT0FBTyxDQUFFMUUsQ0FBQyxDQUFFO01BQzNCZ0csSUFBSSxDQUFFaEcsQ0FBQyxDQUFFLEdBQUcyRSxNQUFNLENBQUNDLENBQUM7TUFDcEJvQixJQUFJLENBQUVoRyxDQUFDLEdBQUdKLENBQUMsQ0FBRSxHQUFHK0UsTUFBTSxDQUFDRSxDQUFDO01BQ3hCbUIsSUFBSSxDQUFFaEcsQ0FBQyxHQUFHLENBQUMsR0FBR0osQ0FBQyxDQUFFLEdBQUcrRSxNQUFNLENBQUNHLENBQUM7TUFDNUJrQixJQUFJLENBQUVoRyxDQUFDLEdBQUcsQ0FBQyxHQUFHSixDQUFDLENBQUUsR0FBRytFLE1BQU0sQ0FBQ1UsQ0FBQztJQUM5QjtJQUVBLE9BQU8sSUFBSTVGLE1BQU0sQ0FBRXNHLFNBQVMsRUFBRW5HLENBQUMsRUFBRW9HLElBQUksRUFBRSxJQUFLLENBQUM7RUFDL0M7QUFDRjs7QUFFQTtBQUNBdkcsTUFBTSxDQUFDMEcsU0FBUyxDQUFDL0MsUUFBUSxHQUFHLElBQUk7QUFFaEN0RSxHQUFHLENBQUNzSCxRQUFRLENBQUUsUUFBUSxFQUFFM0csTUFBTyxDQUFDO0FBQ2hDLGVBQWVBLE1BQU0ifQ==