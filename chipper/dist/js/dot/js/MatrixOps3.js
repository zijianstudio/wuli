// Copyright 2015-2020, University of Colorado Boulder

/**
 * Fast 3x3 matrix computations at the lower level, including an SVD implementation that is fully stable.
 * Overall, it uses a heavily mutable style, passing in the object where the result(s) will be stored.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import dot from './dot.js';

/*
 * Matrices are stored as flat typed arrays with row-major indices. For example, for a 3x3:
 * [0] [1] [2]
 * [3] [4] [5]
 * [6] [7] [8]
 *
 * NOTE: We assume the typed arrays are AT LEAST as long as necessary (but could be longer). This allows us to use
 * an array as big as the largest one we'll need.
 */

// constants
const SQRT_HALF = Math.sqrt(0.5);
const MatrixOps3 = {
  // use typed arrays if possible
  Array: dot.FastArray,
  /*---------------------------------------------------------------------------*
   * 3x3 matrix math
   *----------------------------------------------------------------------------*/

  /*
   * From 0-indexed row and column indices, returns the index into the flat array
   *
   * @param {number} row
   * @param {number} col
   */
  index3(row, col) {
    assert && assert(row >= 0 && row < 3);
    assert && assert(col >= 0 && col < 3);
    return 3 * row + col;
  },
  /*
   * Copies one matrix into another
   *
   * @param {FastMath.Array} matrix - [input] 3x3 Matrix
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */
  set3(matrix, result) {
    assert && assert(matrix.length >= 9);
    assert && assert(result.length >= 9);
    result[0] = matrix[0];
    result[1] = matrix[1];
    result[2] = matrix[2];
    result[3] = matrix[3];
    result[4] = matrix[4];
    result[5] = matrix[5];
    result[6] = matrix[6];
    result[7] = matrix[7];
    result[8] = matrix[8];
  },
  /*
   * Writes the transpose of the input matrix into the result matrix (in-place modification is OK)
   *
   * @param {FastMath.Array} matrix - [input] 3x3 Matrix
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */
  transpose3(matrix, result) {
    assert && assert(matrix.length >= 9);
    assert && assert(result.length >= 9);
    const m1 = matrix[3];
    const m2 = matrix[6];
    const m3 = matrix[1];
    const m5 = matrix[7];
    const m6 = matrix[2];
    const m7 = matrix[5];
    result[0] = matrix[0];
    result[1] = m1;
    result[2] = m2;
    result[3] = m3;
    result[4] = matrix[4];
    result[5] = m5;
    result[6] = m6;
    result[7] = m7;
    result[8] = matrix[8];
  },
  /*
   * The determinant of a 3x3 matrix
   *
   * @param {FastMath.Array} matrix - [input] 3x3 Matrix
   * @returns {number} - The determinant. 0 indicates a singular (non-invertible) matrix.
   */
  det3(matrix) {
    assert && assert(matrix.length >= 9);
    return matrix[0] * matrix[4] * matrix[8] + matrix[1] * matrix[5] * matrix[6] + matrix[2] * matrix[3] * matrix[7] - matrix[2] * matrix[4] * matrix[6] - matrix[1] * matrix[3] * matrix[8] - matrix[0] * matrix[5] * matrix[7];
  },
  /*
   * Writes the matrix multiplication ( left * right ) into result. (in-place modification is OK)
   *
   * @param {FastMath.Array} left - [input] 3x3 Matrix
   * @param {FastMath.Array} right - [input] 3x3 Matrix
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */
  mult3(left, right, result) {
    assert && assert(left.length >= 9);
    assert && assert(right.length >= 9);
    assert && assert(result.length >= 9);
    const m0 = left[0] * right[0] + left[1] * right[3] + left[2] * right[6];
    const m1 = left[0] * right[1] + left[1] * right[4] + left[2] * right[7];
    const m2 = left[0] * right[2] + left[1] * right[5] + left[2] * right[8];
    const m3 = left[3] * right[0] + left[4] * right[3] + left[5] * right[6];
    const m4 = left[3] * right[1] + left[4] * right[4] + left[5] * right[7];
    const m5 = left[3] * right[2] + left[4] * right[5] + left[5] * right[8];
    const m6 = left[6] * right[0] + left[7] * right[3] + left[8] * right[6];
    const m7 = left[6] * right[1] + left[7] * right[4] + left[8] * right[7];
    const m8 = left[6] * right[2] + left[7] * right[5] + left[8] * right[8];
    result[0] = m0;
    result[1] = m1;
    result[2] = m2;
    result[3] = m3;
    result[4] = m4;
    result[5] = m5;
    result[6] = m6;
    result[7] = m7;
    result[8] = m8;
  },
  /*
   * Writes the matrix multiplication ( transpose( left ) * right ) into result. (in-place modification is OK)
   *
   * @param {FastMath.Array} left - [input] 3x3 Matrix
   * @param {FastMath.Array} right - [input] 3x3 Matrix
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */
  mult3LeftTranspose(left, right, result) {
    assert && assert(left.length >= 9);
    assert && assert(right.length >= 9);
    assert && assert(result.length >= 9);
    const m0 = left[0] * right[0] + left[3] * right[3] + left[6] * right[6];
    const m1 = left[0] * right[1] + left[3] * right[4] + left[6] * right[7];
    const m2 = left[0] * right[2] + left[3] * right[5] + left[6] * right[8];
    const m3 = left[1] * right[0] + left[4] * right[3] + left[7] * right[6];
    const m4 = left[1] * right[1] + left[4] * right[4] + left[7] * right[7];
    const m5 = left[1] * right[2] + left[4] * right[5] + left[7] * right[8];
    const m6 = left[2] * right[0] + left[5] * right[3] + left[8] * right[6];
    const m7 = left[2] * right[1] + left[5] * right[4] + left[8] * right[7];
    const m8 = left[2] * right[2] + left[5] * right[5] + left[8] * right[8];
    result[0] = m0;
    result[1] = m1;
    result[2] = m2;
    result[3] = m3;
    result[4] = m4;
    result[5] = m5;
    result[6] = m6;
    result[7] = m7;
    result[8] = m8;
  },
  /*
   * Writes the matrix multiplication ( left * transpose( right ) ) into result. (in-place modification is OK)
   *
   * @param {FastMath.Array} left - [input] 3x3 Matrix
   * @param {FastMath.Array} right - [input] 3x3 Matrix
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */
  mult3RightTranspose(left, right, result) {
    assert && assert(left.length >= 9);
    assert && assert(right.length >= 9);
    assert && assert(result.length >= 9);
    const m0 = left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
    const m1 = left[0] * right[3] + left[1] * right[4] + left[2] * right[5];
    const m2 = left[0] * right[6] + left[1] * right[7] + left[2] * right[8];
    const m3 = left[3] * right[0] + left[4] * right[1] + left[5] * right[2];
    const m4 = left[3] * right[3] + left[4] * right[4] + left[5] * right[5];
    const m5 = left[3] * right[6] + left[4] * right[7] + left[5] * right[8];
    const m6 = left[6] * right[0] + left[7] * right[1] + left[8] * right[2];
    const m7 = left[6] * right[3] + left[7] * right[4] + left[8] * right[5];
    const m8 = left[6] * right[6] + left[7] * right[7] + left[8] * right[8];
    result[0] = m0;
    result[1] = m1;
    result[2] = m2;
    result[3] = m3;
    result[4] = m4;
    result[5] = m5;
    result[6] = m6;
    result[7] = m7;
    result[8] = m8;
  },
  /*
   * Writes the matrix multiplication ( transpose( left ) * transpose( right ) ) into result.
   * (in-place modification is OK)
   * NOTE: This is equivalent to transpose( right * left ).
   *
   * @param {FastMath.Array} left - [input] 3x3 Matrix
   * @param {FastMath.Array} right - [input] 3x3 Matrix
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */
  mult3BothTranspose(left, right, result) {
    assert && assert(left.length >= 9);
    assert && assert(right.length >= 9);
    assert && assert(result.length >= 9);
    const m0 = left[0] * right[0] + left[3] * right[1] + left[6] * right[2];
    const m1 = left[0] * right[3] + left[3] * right[4] + left[6] * right[5];
    const m2 = left[0] * right[6] + left[3] * right[7] + left[6] * right[8];
    const m3 = left[1] * right[0] + left[4] * right[1] + left[7] * right[2];
    const m4 = left[1] * right[3] + left[4] * right[4] + left[7] * right[5];
    const m5 = left[1] * right[6] + left[4] * right[7] + left[7] * right[8];
    const m6 = left[2] * right[0] + left[5] * right[1] + left[8] * right[2];
    const m7 = left[2] * right[3] + left[5] * right[4] + left[8] * right[5];
    const m8 = left[2] * right[6] + left[5] * right[7] + left[8] * right[8];
    result[0] = m0;
    result[1] = m1;
    result[2] = m2;
    result[3] = m3;
    result[4] = m4;
    result[5] = m5;
    result[6] = m6;
    result[7] = m7;
    result[8] = m8;
  },
  /*
   * Writes the product ( matrix * vector ) into result. (in-place modification is OK)
   *
   * @param {FastMath.Array} matrix - [input] 3x3 Matrix
   * @param {Vector3} vector - [input]
   * @param {Vector3} result - [output]
   */
  mult3Vector3(matrix, vector, result) {
    assert && assert(matrix.length >= 9);
    const x = matrix[0] * vector.x + matrix[1] * vector.y + matrix[2] * vector.z;
    const y = matrix[3] * vector.x + matrix[4] * vector.y + matrix[5] * vector.z;
    const z = matrix[6] * vector.x + matrix[7] * vector.y + matrix[8] * vector.z;
    result.x = x;
    result.y = y;
    result.z = z;
  },
  /*
   * Swaps two columns in a matrix, negating one of them to maintain the sign of the determinant.
   *
   * @param {FastMath.Array} matrix - [input] 3x3 Matrix
   * @param {number} idx0 - In the range [0,2]
   * @param {number} idx1 - In the range [0,2]
   */
  swapNegateColumn(matrix, idx0, idx1) {
    assert && assert(matrix.length >= 9);
    const tmp0 = matrix[idx0];
    const tmp1 = matrix[idx0 + 3];
    const tmp2 = matrix[idx0 + 6];
    matrix[idx0] = matrix[idx1];
    matrix[idx0 + 3] = matrix[idx1 + 3];
    matrix[idx0 + 6] = matrix[idx1 + 6];
    matrix[idx1] = -tmp0;
    matrix[idx1 + 3] = -tmp1;
    matrix[idx1 + 6] = -tmp2;
  },
  /*
   * Sets the result matrix to the identity.
   *
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */
  setIdentity3(result) {
    result[0] = result[4] = result[8] = 1; // diagonal
    result[1] = result[2] = result[3] = result[5] = result[6] = result[7] = 0; // non-diagonal
  },

  /*
   * Sets the result matrix to the Givens rotation (performs a rotation between two components). Instead of an angle,
   * the 'cos' and 'sin' values are passed in directly since we skip the trigonometry almost everywhere we can.
   *
   * See http://en.wikipedia.org/wiki/Givens_rotation (note that we use the other sign convention for the sin)
   *
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   * @param {number} cos - [input] The cosine of the Givens rotation angle
   * @param {number} sin - [input] The sine of the Givens rotation angle
   * @param {number} idx0 - [input] The smaller row/column index
   * @param {number} idx1 - [input] The larger row/column index
   */
  setGivens3(result, cos, sin, idx0, idx1) {
    assert && assert(idx0 < idx1);
    this.setIdentity3(result);
    result[this.index3(idx0, idx0)] = cos;
    result[this.index3(idx1, idx1)] = cos;
    result[this.index3(idx0, idx1)] = sin;
    result[this.index3(idx1, idx0)] = -sin;
  },
  /*
   * Efficiently pre-multiples the matrix in-place by the specified Givens rotation (matrix <= rotation * matrix).
   * Equivalent to using setGivens3 and mult3.
   *
   * @param {FastMath.Array} result - [input AND output] 3x3 Matrix
   * @param {number} cos - [input] The cosine of the Givens rotation angle
   * @param {number} sin - [input] The sine of the Givens rotation angle
   * @param {number} idx0 - [input] The smaller row/column index
   * @param {number} idx1 - [input] The larger row/column index
   */
  preMult3Givens(matrix, cos, sin, idx0, idx1) {
    const baseA = idx0 * 3;
    const baseB = idx1 * 3;
    // lexicographically in column-major order for "affine" section
    const a = cos * matrix[baseA + 0] + sin * matrix[baseB + 0];
    const b = cos * matrix[baseB + 0] - sin * matrix[baseA + 0];
    const c = cos * matrix[baseA + 1] + sin * matrix[baseB + 1];
    const d = cos * matrix[baseB + 1] - sin * matrix[baseA + 1];
    const e = cos * matrix[baseA + 2] + sin * matrix[baseB + 2];
    const f = cos * matrix[baseB + 2] - sin * matrix[baseA + 2];
    matrix[baseA + 0] = a;
    matrix[baseB + 0] = b;
    matrix[baseA + 1] = c;
    matrix[baseB + 1] = d;
    matrix[baseA + 2] = e;
    matrix[baseB + 2] = f;
  },
  /*
   * Efficiently post-multiples the matrix in-place by the transpose of the specified Givens rotation
   * (matrix <= matrix * rotation^T).
   * Equivalent to using setGivens3 and mult3RightTranspose.
   *
   * @param {FastMath.Array} result - [input AND output] 3x3 Matrix
   * @param {number} cos - [input] The cosine of the Givens rotation angle
   * @param {number} sin - [input] The sine of the Givens rotation angle
   * @param {number} idx0 - [input] The smaller row/column index
   * @param {number} idx1 - [input] The larger row/column index
   */
  postMult3Givens(matrix, cos, sin, idx0, idx1) {
    // lexicographically in row-major order for the "transposed affine" section
    const a = cos * matrix[idx0 + 0] + sin * matrix[idx1 + 0];
    const b = cos * matrix[idx1 + 0] - sin * matrix[idx0 + 0];
    const c = cos * matrix[idx0 + 3] + sin * matrix[idx1 + 3];
    const d = cos * matrix[idx1 + 3] - sin * matrix[idx0 + 3];
    const e = cos * matrix[idx0 + 6] + sin * matrix[idx1 + 6];
    const f = cos * matrix[idx1 + 6] - sin * matrix[idx0 + 6];
    matrix[idx0 + 0] = a;
    matrix[idx1 + 0] = b;
    matrix[idx0 + 3] = c;
    matrix[idx1 + 3] = d;
    matrix[idx0 + 6] = e;
    matrix[idx1 + 6] = f;
  },
  /*
   * Zeros out the [idx0,idx1] and [idx1,idx0] entries of the matrix mS by applying a Givens rotation as part of the
   * Jacobi iteration. In addition, the Givens rotation is prepended to mQ so we can track the accumulated rotations
   * applied (this is how we get V in the SVD).
   *
   * @param {FastMath.Array} mS - [input AND output] Symmetric 3x3 Matrix
   * @param {FastMath.Array} mQ - [input AND output] Unitary 3x3 Matrix
   * @param {number} idx0 - [input] The smaller row/column index
   * @param {number} idx1 - [input] The larger row/column index
   */
  applyJacobi3(mS, mQ, idx0, idx1) {
    // submatrix entries for idx0,idx1
    const a11 = mS[3 * idx0 + idx0];
    const a12 = mS[3 * idx0 + idx1]; // we assume mS is symmetric, so we don't need a21
    const a22 = mS[3 * idx1 + idx1];

    // Approximate givens angle, see https://graphics.cs.wisc.edu/Papers/2011/MSTTS11/SVD_TR1690.pdf (section 2.3)
    // "Computing the Singular Value Decomposition of 3x3 matrices with minimal branching and elementary floating point operations"
    // Aleka McAdams, Andrew Selle, Rasmus Tamstorf, Joseph Teran, Eftychios Sifakis
    const lhs = a12 * a12;
    let rhs = a11 - a22;
    rhs = rhs * rhs;
    const useAngle = lhs < rhs;
    const w = 1 / Math.sqrt(lhs + rhs);
    // NOTE: exact Givens angle is 0.5 * Math.atan( 2 * a12 / ( a11 - a22 ) ), but clamped to withing +-Math.PI / 4
    const cos = useAngle ? w * (a11 - a22) : SQRT_HALF;
    const sin = useAngle ? w * a12 : SQRT_HALF;

    // S' = Q * S * transpose( Q )
    this.preMult3Givens(mS, cos, sin, idx0, idx1);
    this.postMult3Givens(mS, cos, sin, idx0, idx1);

    // Q' = Q * mQ
    this.preMult3Givens(mQ, cos, sin, idx0, idx1);
  },
  /*
   * The Jacobi method, which in turn zeros out all the non-diagonal entries repeatedly until mS converges into
   * a diagonal matrix. We track the applied Givens rotations in mQ, so that when given mS and mQ=identity, we will
   * maintain the value mQ * mS * mQ^T
   *
   * @param {FastMath.Array} mS - [input AND output] Symmetric 3x3 Matrix
   * @param {FastMath.Array} mQ - [input AND output] Unitary 3x3 Matrix
   * @param {number} n - [input] The number of iterations to run
   */
  jacobiIteration3(mS, mQ, n) {
    // for 3x3, we eliminate non-diagonal entries iteratively
    for (let i = 0; i < n; i++) {
      this.applyJacobi3(mS, mQ, 0, 1);
      this.applyJacobi3(mS, mQ, 0, 2);
      this.applyJacobi3(mS, mQ, 1, 2);
    }
  },
  /*
   * One step in computing the QR decomposition. Zeros out the (row,col) entry in 'r', while maintaining the
   * value of (q * r). We will end up with an orthogonal Q and upper-triangular R (or in the SVD case,
   * R will be diagonal)
   *
   * @param {FastMath.Array} q - [input AND ouput] 3x3 Matrix
   * @param {FastMath.Array} r - [input AND ouput] 3x3 Matrix
   * @param {number} row - [input] The row of the entry to zero out
   * @param {number} col - [input] The column of the entry to zero out
   */
  qrAnnihilate3(q, r, row, col) {
    assert && assert(row > col); // only in the lower-triangular area

    const epsilon = 0.0000000001;
    let cos;
    let sin;
    const diagonalValue = r[this.index3(col, col)];
    const targetValue = r[this.index3(row, col)];
    const diagonalSquared = diagonalValue * diagonalValue;
    const targetSquared = targetValue * targetValue;

    // handle the case where both (row,col) and (col,col) are very small (would cause instabilities)
    if (diagonalSquared + targetSquared < epsilon) {
      cos = diagonalValue > 0 ? 1 : 0;
      sin = 0;
    } else {
      const rsqr = 1 / Math.sqrt(diagonalSquared + targetSquared);
      cos = rsqr * diagonalValue;
      sin = rsqr * targetValue;
    }
    this.preMult3Givens(r, cos, sin, col, row);
    this.postMult3Givens(q, cos, sin, col, row);
  },
  /*
   * 3x3 Singular Value Decomposition, handling singular cases.
   * Based on https://graphics.cs.wisc.edu/Papers/2011/MSTTS11/SVD_TR1690.pdf
   * "Computing the Singular Value Decomposition of 3x3 matrices with minimal branching and elementary floating point operations"
   * Aleka McAdams, Andrew Selle, Rasmus Tamstorf, Joseph Teran, Eftychios Sifakis
   *
   * @param {FastMath.Array} a - [input] 3x3 Matrix that we want the SVD of.
   * @param {number} jacobiIterationCount - [input] How many Jacobi iterations to run (larger is more accurate to a point)
   * @param {FastMath.Array} resultU - [output] 3x3 U matrix (unitary)
   * @param {FastMath.Array} resultSigma - [output] 3x3 diagonal matrix of singular values
   * @param {FastMath.Array} resultV - [output] 3x3 V matrix (unitary)
   */
  svd3(a, jacobiIterationCount, resultU, resultSigma, resultV) {
    // shorthands
    const q = resultU;
    const v = resultV;
    const r = resultSigma;

    // for now, use 'r' as our S == transpose( A ) * A, so we don't have to use scratch matrices
    this.mult3LeftTranspose(a, a, r);
    // we'll accumulate into 'q' == transpose( V ) during the Jacobi iteration
    this.setIdentity3(q);

    // Jacobi iteration turns Q into V^T and R into Sigma^2 (we'll ditch R since the QR decomposition will be beter)
    this.jacobiIteration3(r, q, jacobiIterationCount);
    // final determination of V
    this.transpose3(q, v); // done with this 'q' until we reuse the scratch matrix later below for the QR decomposition

    this.mult3(a, v, r); // R = AV

    // Sort columns of R and V based on singular values (needed for the QR step, and useful anyways).
    // Their product will remain unchanged.
    let mag0 = r[0] * r[0] + r[3] * r[3] + r[6] * r[6]; // column vector magnitudes
    let mag1 = r[1] * r[1] + r[4] * r[4] + r[7] * r[7];
    let mag2 = r[2] * r[2] + r[5] * r[5] + r[8] * r[8];
    let tmpMag;
    if (mag0 < mag1) {
      // swap magnitudes
      tmpMag = mag0;
      mag0 = mag1;
      mag1 = tmpMag;
      this.swapNegateColumn(r, 0, 1);
      this.swapNegateColumn(v, 0, 1);
    }
    if (mag0 < mag2) {
      // swap magnitudes
      tmpMag = mag0;
      mag0 = mag2;
      mag2 = tmpMag;
      this.swapNegateColumn(r, 0, 2);
      this.swapNegateColumn(v, 0, 2);
    }
    if (mag1 < mag2) {
      this.swapNegateColumn(r, 1, 2);
      this.swapNegateColumn(v, 1, 2);
    }

    // QR decomposition
    this.setIdentity3(q); // reusing Q now for the QR
    // Zero out all three strictly lower-triangular values. Should turn the matrix diagonal
    this.qrAnnihilate3(q, r, 1, 0);
    this.qrAnnihilate3(q, r, 2, 0);
    this.qrAnnihilate3(q, r, 2, 1);

    // checks for a singular U value, we'll add in the needed 1 entries to make sure our U is orthogonal
    const bigEpsilon = 0.001; // they really should be around 1
    if (q[0] * q[0] + q[1] * q[1] + q[2] * q[2] < bigEpsilon) {
      q[0] = 1;
    }
    if (q[3] * q[3] + q[4] * q[4] + q[5] * q[5] < bigEpsilon) {
      q[4] = 1;
    }
    if (q[6] * q[6] + q[7] * q[7] + q[8] * q[8] < bigEpsilon) {
      q[8] = 1;
    }
  },
  /*---------------------------------------------------------------------------*
   * 3xN matrix math
   *----------------------------------------------------------------------------*/

  /*
   * Sets the 3xN result matrix to be made out of column vectors
   *
   * @param {Array.<Vector3>} columnVectors - [input] List of 3D column vectors
   * @param {FastMath.Array} result - [output] 3xN Matrix, where N is the number of column vectors
   */
  setVectors3(columnVectors, result) {
    const m = 3;
    const n = columnVectors.length;
    assert && assert(result.length >= m * n, 'Array length check');
    for (let i = 0; i < n; i++) {
      const vector = columnVectors[i];
      result[i] = vector.x;
      result[i + n] = vector.y;
      result[i + 2 * n] = vector.z;
    }
  },
  /*
   * Retrieves column vector values from a 3xN matrix.
   *
   * @param {number} m - [input] The number of rows in the matrix (sanity check, should always be 3)
   * @param {number} n - [input] The number of columns in the matrix
   * @param {FastMath.Array} matrix - [input] 3xN Matrix
   * @param {number} columnIndex - [input] 3xN Matrix
   * @param {Vector3} result - [output] Vector to store the x,y,z
   */
  getColumnVector3(m, n, matrix, columnIndex, result) {
    assert && assert(m === 3 && columnIndex < n);
    result.x = matrix[columnIndex];
    result.y = matrix[columnIndex + n];
    result.z = matrix[columnIndex + 2 * n];
  },
  /*---------------------------------------------------------------------------*
   * Arbitrary dimension matrix math
   *----------------------------------------------------------------------------*/

  /*
   * From 0-indexed row and column indices, returns the index into the flat array
   *
   * @param {number} m - Number of rows in the matrix
   * @param {number} n - Number of columns in the matrix
   * @param {number} row
   * @param {number} col
   */
  index(m, n, row, col) {
    return n * row + col;
  },
  /*
   * Writes the transpose of the matrix into the result.
   *
   * @param {number} m - Number of rows in the original matrix
   * @param {number} n - Number of columns in the original matrix
   * @param {FastMath.Array} matrix - [input] MxN Matrix
   * @param {FastMath.Array} result - [output] NxM Matrix
   */
  transpose(m, n, matrix, result) {
    assert && assert(matrix.length >= m * n);
    assert && assert(result.length >= n * m);
    assert && assert(matrix !== result, 'In-place modification not implemented yet');
    for (let row = 0; row < m; row++) {
      for (let col = 0; col < n; col++) {
        result[m * col + row] = matrix[n * row + col];
      }
    }
  },
  /*
   * Writes the matrix multiplication of ( left * right ) into result
   *
   * @param {number} m - Number of rows in the left matrix
   * @param {number} n - Number of columns in the left matrix, number of rows in the right matrix
   * @param {number} p - Number of columns in the right matrix
   * @param {FastMath.Array} left - [input] MxN Matrix
   * @param {FastMath.Array} right - [input] NxP Matrix
   * @param {FastMath.Array} result - [output] MxP Matrix
   */
  mult(m, n, p, left, right, result) {
    assert && assert(left.length >= m * n);
    assert && assert(right.length >= n * p);
    assert && assert(result.length >= m * p);
    assert && assert(left !== result && right !== result, 'In-place modification not implemented yet');
    for (let row = 0; row < m; row++) {
      for (let col = 0; col < p; col++) {
        let x = 0;
        for (let k = 0; k < n; k++) {
          x += left[this.index(m, n, row, k)] * right[this.index(n, p, k, col)];
        }
        result[this.index(m, p, row, col)] = x;
      }
    }
  },
  /*
   * Writes the matrix multiplication of ( left * transpose( right ) ) into result
   *
   * @param {number} m - Number of rows in the left matrix
   * @param {number} n - Number of columns in the left matrix, number of columns in the right matrix
   * @param {number} p - Number of rows in the right matrix
   * @param {FastMath.Array} left - [input] MxN Matrix
   * @param {FastMath.Array} right - [input] PxN Matrix
   * @param {FastMath.Array} result - [output] MxP Matrix
   */
  multRightTranspose(m, n, p, left, right, result) {
    assert && assert(left.length >= m * n);
    assert && assert(right.length >= n * p);
    assert && assert(result.length >= m * p);
    assert && assert(left !== result && right !== result, 'In-place modification not implemented yet');
    for (let row = 0; row < m; row++) {
      for (let col = 0; col < p; col++) {
        let x = 0;
        for (let k = 0; k < n; k++) {
          x += left[this.index(m, n, row, k)] * right[this.index(p, n, col, k)];
        }
        result[this.index(m, p, row, col)] = x;
      }
    }
  },
  /*
   * Writes the matrix into the result, permuting the columns.
   *
   * @param {number} m - Number of rows in the original matrix
   * @param {number} n - Number of columns in the original matrix
   * @param {FastMath.Array} matrix - [input] MxN Matrix
   * @param {Permutation} permutation - [input] Permutation
   * @param {FastMath.Array} result - [output] MxN Matrix
   */
  permuteColumns(m, n, matrix, permutation, result) {
    assert && assert(matrix !== result, 'In-place modification not implemented yet');
    assert && assert(matrix.length >= m * n);
    assert && assert(result.length >= m * n);
    for (let col = 0; col < n; col++) {
      const permutedColumnIndex = permutation.indices[col];
      for (let row = 0; row < m; row++) {
        result[this.index(m, n, row, col)] = matrix[this.index(m, n, row, permutedColumnIndex)];
      }
    }
  }
};
dot.register('MatrixOps3', MatrixOps3);
export default MatrixOps3;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3QiLCJTUVJUX0hBTEYiLCJNYXRoIiwic3FydCIsIk1hdHJpeE9wczMiLCJBcnJheSIsIkZhc3RBcnJheSIsImluZGV4MyIsInJvdyIsImNvbCIsImFzc2VydCIsInNldDMiLCJtYXRyaXgiLCJyZXN1bHQiLCJsZW5ndGgiLCJ0cmFuc3Bvc2UzIiwibTEiLCJtMiIsIm0zIiwibTUiLCJtNiIsIm03IiwiZGV0MyIsIm11bHQzIiwibGVmdCIsInJpZ2h0IiwibTAiLCJtNCIsIm04IiwibXVsdDNMZWZ0VHJhbnNwb3NlIiwibXVsdDNSaWdodFRyYW5zcG9zZSIsIm11bHQzQm90aFRyYW5zcG9zZSIsIm11bHQzVmVjdG9yMyIsInZlY3RvciIsIngiLCJ5IiwieiIsInN3YXBOZWdhdGVDb2x1bW4iLCJpZHgwIiwiaWR4MSIsInRtcDAiLCJ0bXAxIiwidG1wMiIsInNldElkZW50aXR5MyIsInNldEdpdmVuczMiLCJjb3MiLCJzaW4iLCJwcmVNdWx0M0dpdmVucyIsImJhc2VBIiwiYmFzZUIiLCJhIiwiYiIsImMiLCJkIiwiZSIsImYiLCJwb3N0TXVsdDNHaXZlbnMiLCJhcHBseUphY29iaTMiLCJtUyIsIm1RIiwiYTExIiwiYTEyIiwiYTIyIiwibGhzIiwicmhzIiwidXNlQW5nbGUiLCJ3IiwiamFjb2JpSXRlcmF0aW9uMyIsIm4iLCJpIiwicXJBbm5paGlsYXRlMyIsInEiLCJyIiwiZXBzaWxvbiIsImRpYWdvbmFsVmFsdWUiLCJ0YXJnZXRWYWx1ZSIsImRpYWdvbmFsU3F1YXJlZCIsInRhcmdldFNxdWFyZWQiLCJyc3FyIiwic3ZkMyIsImphY29iaUl0ZXJhdGlvbkNvdW50IiwicmVzdWx0VSIsInJlc3VsdFNpZ21hIiwicmVzdWx0ViIsInYiLCJtYWcwIiwibWFnMSIsIm1hZzIiLCJ0bXBNYWciLCJiaWdFcHNpbG9uIiwic2V0VmVjdG9yczMiLCJjb2x1bW5WZWN0b3JzIiwibSIsImdldENvbHVtblZlY3RvcjMiLCJjb2x1bW5JbmRleCIsImluZGV4IiwidHJhbnNwb3NlIiwibXVsdCIsInAiLCJrIiwibXVsdFJpZ2h0VHJhbnNwb3NlIiwicGVybXV0ZUNvbHVtbnMiLCJwZXJtdXRhdGlvbiIsInBlcm11dGVkQ29sdW1uSW5kZXgiLCJpbmRpY2VzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYXRyaXhPcHMzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEZhc3QgM3gzIG1hdHJpeCBjb21wdXRhdGlvbnMgYXQgdGhlIGxvd2VyIGxldmVsLCBpbmNsdWRpbmcgYW4gU1ZEIGltcGxlbWVudGF0aW9uIHRoYXQgaXMgZnVsbHkgc3RhYmxlLlxyXG4gKiBPdmVyYWxsLCBpdCB1c2VzIGEgaGVhdmlseSBtdXRhYmxlIHN0eWxlLCBwYXNzaW5nIGluIHRoZSBvYmplY3Qgd2hlcmUgdGhlIHJlc3VsdChzKSB3aWxsIGJlIHN0b3JlZC5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xyXG5cclxuLypcclxuICogTWF0cmljZXMgYXJlIHN0b3JlZCBhcyBmbGF0IHR5cGVkIGFycmF5cyB3aXRoIHJvdy1tYWpvciBpbmRpY2VzLiBGb3IgZXhhbXBsZSwgZm9yIGEgM3gzOlxyXG4gKiBbMF0gWzFdIFsyXVxyXG4gKiBbM10gWzRdIFs1XVxyXG4gKiBbNl0gWzddIFs4XVxyXG4gKlxyXG4gKiBOT1RFOiBXZSBhc3N1bWUgdGhlIHR5cGVkIGFycmF5cyBhcmUgQVQgTEVBU1QgYXMgbG9uZyBhcyBuZWNlc3NhcnkgKGJ1dCBjb3VsZCBiZSBsb25nZXIpLiBUaGlzIGFsbG93cyB1cyB0byB1c2VcclxuICogYW4gYXJyYXkgYXMgYmlnIGFzIHRoZSBsYXJnZXN0IG9uZSB3ZSdsbCBuZWVkLlxyXG4gKi9cclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBTUVJUX0hBTEYgPSBNYXRoLnNxcnQoIDAuNSApO1xyXG5cclxuY29uc3QgTWF0cml4T3BzMyA9IHtcclxuICAvLyB1c2UgdHlwZWQgYXJyYXlzIGlmIHBvc3NpYmxlXHJcbiAgQXJyYXk6IGRvdC5GYXN0QXJyYXksXHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIDN4MyBtYXRyaXggbWF0aFxyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qXHJcbiAgICogRnJvbSAwLWluZGV4ZWQgcm93IGFuZCBjb2x1bW4gaW5kaWNlcywgcmV0dXJucyB0aGUgaW5kZXggaW50byB0aGUgZmxhdCBhcnJheVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJvd1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjb2xcclxuICAgKi9cclxuICBpbmRleDMoIHJvdywgY29sICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcm93ID49IDAgJiYgcm93IDwgMyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29sID49IDAgJiYgY29sIDwgMyApO1xyXG4gICAgcmV0dXJuIDMgKiByb3cgKyBjb2w7XHJcbiAgfSxcclxuXHJcbiAgLypcclxuICAgKiBDb3BpZXMgb25lIG1hdHJpeCBpbnRvIGFub3RoZXJcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IG1hdHJpeCAtIFtpbnB1dF0gM3gzIE1hdHJpeFxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdCAtIFtvdXRwdXRdIDN4MyBNYXRyaXhcclxuICAgKi9cclxuICBzZXQzKCBtYXRyaXgsIHJlc3VsdCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeC5sZW5ndGggPj0gOSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0Lmxlbmd0aCA+PSA5ICk7XHJcbiAgICByZXN1bHRbIDAgXSA9IG1hdHJpeFsgMCBdO1xyXG4gICAgcmVzdWx0WyAxIF0gPSBtYXRyaXhbIDEgXTtcclxuICAgIHJlc3VsdFsgMiBdID0gbWF0cml4WyAyIF07XHJcbiAgICByZXN1bHRbIDMgXSA9IG1hdHJpeFsgMyBdO1xyXG4gICAgcmVzdWx0WyA0IF0gPSBtYXRyaXhbIDQgXTtcclxuICAgIHJlc3VsdFsgNSBdID0gbWF0cml4WyA1IF07XHJcbiAgICByZXN1bHRbIDYgXSA9IG1hdHJpeFsgNiBdO1xyXG4gICAgcmVzdWx0WyA3IF0gPSBtYXRyaXhbIDcgXTtcclxuICAgIHJlc3VsdFsgOCBdID0gbWF0cml4WyA4IF07XHJcbiAgfSxcclxuXHJcbiAgLypcclxuICAgKiBXcml0ZXMgdGhlIHRyYW5zcG9zZSBvZiB0aGUgaW5wdXQgbWF0cml4IGludG8gdGhlIHJlc3VsdCBtYXRyaXggKGluLXBsYWNlIG1vZGlmaWNhdGlvbiBpcyBPSylcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IG1hdHJpeCAtIFtpbnB1dF0gM3gzIE1hdHJpeFxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdCAtIFtvdXRwdXRdIDN4MyBNYXRyaXhcclxuICAgKi9cclxuICB0cmFuc3Bvc2UzKCBtYXRyaXgsIHJlc3VsdCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeC5sZW5ndGggPj0gOSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0Lmxlbmd0aCA+PSA5ICk7XHJcbiAgICBjb25zdCBtMSA9IG1hdHJpeFsgMyBdO1xyXG4gICAgY29uc3QgbTIgPSBtYXRyaXhbIDYgXTtcclxuICAgIGNvbnN0IG0zID0gbWF0cml4WyAxIF07XHJcbiAgICBjb25zdCBtNSA9IG1hdHJpeFsgNyBdO1xyXG4gICAgY29uc3QgbTYgPSBtYXRyaXhbIDIgXTtcclxuICAgIGNvbnN0IG03ID0gbWF0cml4WyA1IF07XHJcbiAgICByZXN1bHRbIDAgXSA9IG1hdHJpeFsgMCBdO1xyXG4gICAgcmVzdWx0WyAxIF0gPSBtMTtcclxuICAgIHJlc3VsdFsgMiBdID0gbTI7XHJcbiAgICByZXN1bHRbIDMgXSA9IG0zO1xyXG4gICAgcmVzdWx0WyA0IF0gPSBtYXRyaXhbIDQgXTtcclxuICAgIHJlc3VsdFsgNSBdID0gbTU7XHJcbiAgICByZXN1bHRbIDYgXSA9IG02O1xyXG4gICAgcmVzdWx0WyA3IF0gPSBtNztcclxuICAgIHJlc3VsdFsgOCBdID0gbWF0cml4WyA4IF07XHJcbiAgfSxcclxuXHJcbiAgLypcclxuICAgKiBUaGUgZGV0ZXJtaW5hbnQgb2YgYSAzeDMgbWF0cml4XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBtYXRyaXggLSBbaW5wdXRdIDN4MyBNYXRyaXhcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIFRoZSBkZXRlcm1pbmFudC4gMCBpbmRpY2F0ZXMgYSBzaW5ndWxhciAobm9uLWludmVydGlibGUpIG1hdHJpeC5cclxuICAgKi9cclxuICBkZXQzKCBtYXRyaXggKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXRyaXgubGVuZ3RoID49IDkgKTtcclxuICAgIHJldHVybiBtYXRyaXhbIDAgXSAqIG1hdHJpeFsgNCBdICogbWF0cml4WyA4IF0gKyBtYXRyaXhbIDEgXSAqIG1hdHJpeFsgNSBdICogbWF0cml4WyA2IF0gK1xyXG4gICAgICAgICAgIG1hdHJpeFsgMiBdICogbWF0cml4WyAzIF0gKiBtYXRyaXhbIDcgXSAtIG1hdHJpeFsgMiBdICogbWF0cml4WyA0IF0gKiBtYXRyaXhbIDYgXSAtXHJcbiAgICAgICAgICAgbWF0cml4WyAxIF0gKiBtYXRyaXhbIDMgXSAqIG1hdHJpeFsgOCBdIC0gbWF0cml4WyAwIF0gKiBtYXRyaXhbIDUgXSAqIG1hdHJpeFsgNyBdO1xyXG4gIH0sXHJcblxyXG4gIC8qXHJcbiAgICogV3JpdGVzIHRoZSBtYXRyaXggbXVsdGlwbGljYXRpb24gKCBsZWZ0ICogcmlnaHQgKSBpbnRvIHJlc3VsdC4gKGluLXBsYWNlIG1vZGlmaWNhdGlvbiBpcyBPSylcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IGxlZnQgLSBbaW5wdXRdIDN4MyBNYXRyaXhcclxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSByaWdodCAtIFtpbnB1dF0gM3gzIE1hdHJpeFxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdCAtIFtvdXRwdXRdIDN4MyBNYXRyaXhcclxuICAgKi9cclxuICBtdWx0MyggbGVmdCwgcmlnaHQsIHJlc3VsdCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnQubGVuZ3RoID49IDkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJpZ2h0Lmxlbmd0aCA+PSA5ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXN1bHQubGVuZ3RoID49IDkgKTtcclxuICAgIGNvbnN0IG0wID0gbGVmdFsgMCBdICogcmlnaHRbIDAgXSArIGxlZnRbIDEgXSAqIHJpZ2h0WyAzIF0gKyBsZWZ0WyAyIF0gKiByaWdodFsgNiBdO1xyXG4gICAgY29uc3QgbTEgPSBsZWZ0WyAwIF0gKiByaWdodFsgMSBdICsgbGVmdFsgMSBdICogcmlnaHRbIDQgXSArIGxlZnRbIDIgXSAqIHJpZ2h0WyA3IF07XHJcbiAgICBjb25zdCBtMiA9IGxlZnRbIDAgXSAqIHJpZ2h0WyAyIF0gKyBsZWZ0WyAxIF0gKiByaWdodFsgNSBdICsgbGVmdFsgMiBdICogcmlnaHRbIDggXTtcclxuICAgIGNvbnN0IG0zID0gbGVmdFsgMyBdICogcmlnaHRbIDAgXSArIGxlZnRbIDQgXSAqIHJpZ2h0WyAzIF0gKyBsZWZ0WyA1IF0gKiByaWdodFsgNiBdO1xyXG4gICAgY29uc3QgbTQgPSBsZWZ0WyAzIF0gKiByaWdodFsgMSBdICsgbGVmdFsgNCBdICogcmlnaHRbIDQgXSArIGxlZnRbIDUgXSAqIHJpZ2h0WyA3IF07XHJcbiAgICBjb25zdCBtNSA9IGxlZnRbIDMgXSAqIHJpZ2h0WyAyIF0gKyBsZWZ0WyA0IF0gKiByaWdodFsgNSBdICsgbGVmdFsgNSBdICogcmlnaHRbIDggXTtcclxuICAgIGNvbnN0IG02ID0gbGVmdFsgNiBdICogcmlnaHRbIDAgXSArIGxlZnRbIDcgXSAqIHJpZ2h0WyAzIF0gKyBsZWZ0WyA4IF0gKiByaWdodFsgNiBdO1xyXG4gICAgY29uc3QgbTcgPSBsZWZ0WyA2IF0gKiByaWdodFsgMSBdICsgbGVmdFsgNyBdICogcmlnaHRbIDQgXSArIGxlZnRbIDggXSAqIHJpZ2h0WyA3IF07XHJcbiAgICBjb25zdCBtOCA9IGxlZnRbIDYgXSAqIHJpZ2h0WyAyIF0gKyBsZWZ0WyA3IF0gKiByaWdodFsgNSBdICsgbGVmdFsgOCBdICogcmlnaHRbIDggXTtcclxuICAgIHJlc3VsdFsgMCBdID0gbTA7XHJcbiAgICByZXN1bHRbIDEgXSA9IG0xO1xyXG4gICAgcmVzdWx0WyAyIF0gPSBtMjtcclxuICAgIHJlc3VsdFsgMyBdID0gbTM7XHJcbiAgICByZXN1bHRbIDQgXSA9IG00O1xyXG4gICAgcmVzdWx0WyA1IF0gPSBtNTtcclxuICAgIHJlc3VsdFsgNiBdID0gbTY7XHJcbiAgICByZXN1bHRbIDcgXSA9IG03O1xyXG4gICAgcmVzdWx0WyA4IF0gPSBtODtcclxuICB9LFxyXG5cclxuICAvKlxyXG4gICAqIFdyaXRlcyB0aGUgbWF0cml4IG11bHRpcGxpY2F0aW9uICggdHJhbnNwb3NlKCBsZWZ0ICkgKiByaWdodCApIGludG8gcmVzdWx0LiAoaW4tcGxhY2UgbW9kaWZpY2F0aW9uIGlzIE9LKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gbGVmdCAtIFtpbnB1dF0gM3gzIE1hdHJpeFxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJpZ2h0IC0gW2lucHV0XSAzeDMgTWF0cml4XHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0IC0gW291dHB1dF0gM3gzIE1hdHJpeFxyXG4gICAqL1xyXG4gIG11bHQzTGVmdFRyYW5zcG9zZSggbGVmdCwgcmlnaHQsIHJlc3VsdCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnQubGVuZ3RoID49IDkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJpZ2h0Lmxlbmd0aCA+PSA5ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXN1bHQubGVuZ3RoID49IDkgKTtcclxuICAgIGNvbnN0IG0wID0gbGVmdFsgMCBdICogcmlnaHRbIDAgXSArIGxlZnRbIDMgXSAqIHJpZ2h0WyAzIF0gKyBsZWZ0WyA2IF0gKiByaWdodFsgNiBdO1xyXG4gICAgY29uc3QgbTEgPSBsZWZ0WyAwIF0gKiByaWdodFsgMSBdICsgbGVmdFsgMyBdICogcmlnaHRbIDQgXSArIGxlZnRbIDYgXSAqIHJpZ2h0WyA3IF07XHJcbiAgICBjb25zdCBtMiA9IGxlZnRbIDAgXSAqIHJpZ2h0WyAyIF0gKyBsZWZ0WyAzIF0gKiByaWdodFsgNSBdICsgbGVmdFsgNiBdICogcmlnaHRbIDggXTtcclxuICAgIGNvbnN0IG0zID0gbGVmdFsgMSBdICogcmlnaHRbIDAgXSArIGxlZnRbIDQgXSAqIHJpZ2h0WyAzIF0gKyBsZWZ0WyA3IF0gKiByaWdodFsgNiBdO1xyXG4gICAgY29uc3QgbTQgPSBsZWZ0WyAxIF0gKiByaWdodFsgMSBdICsgbGVmdFsgNCBdICogcmlnaHRbIDQgXSArIGxlZnRbIDcgXSAqIHJpZ2h0WyA3IF07XHJcbiAgICBjb25zdCBtNSA9IGxlZnRbIDEgXSAqIHJpZ2h0WyAyIF0gKyBsZWZ0WyA0IF0gKiByaWdodFsgNSBdICsgbGVmdFsgNyBdICogcmlnaHRbIDggXTtcclxuICAgIGNvbnN0IG02ID0gbGVmdFsgMiBdICogcmlnaHRbIDAgXSArIGxlZnRbIDUgXSAqIHJpZ2h0WyAzIF0gKyBsZWZ0WyA4IF0gKiByaWdodFsgNiBdO1xyXG4gICAgY29uc3QgbTcgPSBsZWZ0WyAyIF0gKiByaWdodFsgMSBdICsgbGVmdFsgNSBdICogcmlnaHRbIDQgXSArIGxlZnRbIDggXSAqIHJpZ2h0WyA3IF07XHJcbiAgICBjb25zdCBtOCA9IGxlZnRbIDIgXSAqIHJpZ2h0WyAyIF0gKyBsZWZ0WyA1IF0gKiByaWdodFsgNSBdICsgbGVmdFsgOCBdICogcmlnaHRbIDggXTtcclxuICAgIHJlc3VsdFsgMCBdID0gbTA7XHJcbiAgICByZXN1bHRbIDEgXSA9IG0xO1xyXG4gICAgcmVzdWx0WyAyIF0gPSBtMjtcclxuICAgIHJlc3VsdFsgMyBdID0gbTM7XHJcbiAgICByZXN1bHRbIDQgXSA9IG00O1xyXG4gICAgcmVzdWx0WyA1IF0gPSBtNTtcclxuICAgIHJlc3VsdFsgNiBdID0gbTY7XHJcbiAgICByZXN1bHRbIDcgXSA9IG03O1xyXG4gICAgcmVzdWx0WyA4IF0gPSBtODtcclxuICB9LFxyXG5cclxuICAvKlxyXG4gICAqIFdyaXRlcyB0aGUgbWF0cml4IG11bHRpcGxpY2F0aW9uICggbGVmdCAqIHRyYW5zcG9zZSggcmlnaHQgKSApIGludG8gcmVzdWx0LiAoaW4tcGxhY2UgbW9kaWZpY2F0aW9uIGlzIE9LKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gbGVmdCAtIFtpbnB1dF0gM3gzIE1hdHJpeFxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJpZ2h0IC0gW2lucHV0XSAzeDMgTWF0cml4XHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0IC0gW291dHB1dF0gM3gzIE1hdHJpeFxyXG4gICAqL1xyXG4gIG11bHQzUmlnaHRUcmFuc3Bvc2UoIGxlZnQsIHJpZ2h0LCByZXN1bHQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZWZ0Lmxlbmd0aCA+PSA5ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByaWdodC5sZW5ndGggPj0gOSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0Lmxlbmd0aCA+PSA5ICk7XHJcbiAgICBjb25zdCBtMCA9IGxlZnRbIDAgXSAqIHJpZ2h0WyAwIF0gKyBsZWZ0WyAxIF0gKiByaWdodFsgMSBdICsgbGVmdFsgMiBdICogcmlnaHRbIDIgXTtcclxuICAgIGNvbnN0IG0xID0gbGVmdFsgMCBdICogcmlnaHRbIDMgXSArIGxlZnRbIDEgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyAyIF0gKiByaWdodFsgNSBdO1xyXG4gICAgY29uc3QgbTIgPSBsZWZ0WyAwIF0gKiByaWdodFsgNiBdICsgbGVmdFsgMSBdICogcmlnaHRbIDcgXSArIGxlZnRbIDIgXSAqIHJpZ2h0WyA4IF07XHJcbiAgICBjb25zdCBtMyA9IGxlZnRbIDMgXSAqIHJpZ2h0WyAwIF0gKyBsZWZ0WyA0IF0gKiByaWdodFsgMSBdICsgbGVmdFsgNSBdICogcmlnaHRbIDIgXTtcclxuICAgIGNvbnN0IG00ID0gbGVmdFsgMyBdICogcmlnaHRbIDMgXSArIGxlZnRbIDQgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyA1IF0gKiByaWdodFsgNSBdO1xyXG4gICAgY29uc3QgbTUgPSBsZWZ0WyAzIF0gKiByaWdodFsgNiBdICsgbGVmdFsgNCBdICogcmlnaHRbIDcgXSArIGxlZnRbIDUgXSAqIHJpZ2h0WyA4IF07XHJcbiAgICBjb25zdCBtNiA9IGxlZnRbIDYgXSAqIHJpZ2h0WyAwIF0gKyBsZWZ0WyA3IF0gKiByaWdodFsgMSBdICsgbGVmdFsgOCBdICogcmlnaHRbIDIgXTtcclxuICAgIGNvbnN0IG03ID0gbGVmdFsgNiBdICogcmlnaHRbIDMgXSArIGxlZnRbIDcgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyA4IF0gKiByaWdodFsgNSBdO1xyXG4gICAgY29uc3QgbTggPSBsZWZ0WyA2IF0gKiByaWdodFsgNiBdICsgbGVmdFsgNyBdICogcmlnaHRbIDcgXSArIGxlZnRbIDggXSAqIHJpZ2h0WyA4IF07XHJcbiAgICByZXN1bHRbIDAgXSA9IG0wO1xyXG4gICAgcmVzdWx0WyAxIF0gPSBtMTtcclxuICAgIHJlc3VsdFsgMiBdID0gbTI7XHJcbiAgICByZXN1bHRbIDMgXSA9IG0zO1xyXG4gICAgcmVzdWx0WyA0IF0gPSBtNDtcclxuICAgIHJlc3VsdFsgNSBdID0gbTU7XHJcbiAgICByZXN1bHRbIDYgXSA9IG02O1xyXG4gICAgcmVzdWx0WyA3IF0gPSBtNztcclxuICAgIHJlc3VsdFsgOCBdID0gbTg7XHJcbiAgfSxcclxuXHJcbiAgLypcclxuICAgKiBXcml0ZXMgdGhlIG1hdHJpeCBtdWx0aXBsaWNhdGlvbiAoIHRyYW5zcG9zZSggbGVmdCApICogdHJhbnNwb3NlKCByaWdodCApICkgaW50byByZXN1bHQuXHJcbiAgICogKGluLXBsYWNlIG1vZGlmaWNhdGlvbiBpcyBPSylcclxuICAgKiBOT1RFOiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gdHJhbnNwb3NlKCByaWdodCAqIGxlZnQgKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IGxlZnQgLSBbaW5wdXRdIDN4MyBNYXRyaXhcclxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSByaWdodCAtIFtpbnB1dF0gM3gzIE1hdHJpeFxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdCAtIFtvdXRwdXRdIDN4MyBNYXRyaXhcclxuICAgKi9cclxuICBtdWx0M0JvdGhUcmFuc3Bvc2UoIGxlZnQsIHJpZ2h0LCByZXN1bHQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZWZ0Lmxlbmd0aCA+PSA5ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByaWdodC5sZW5ndGggPj0gOSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0Lmxlbmd0aCA+PSA5ICk7XHJcbiAgICBjb25zdCBtMCA9IGxlZnRbIDAgXSAqIHJpZ2h0WyAwIF0gKyBsZWZ0WyAzIF0gKiByaWdodFsgMSBdICsgbGVmdFsgNiBdICogcmlnaHRbIDIgXTtcclxuICAgIGNvbnN0IG0xID0gbGVmdFsgMCBdICogcmlnaHRbIDMgXSArIGxlZnRbIDMgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyA2IF0gKiByaWdodFsgNSBdO1xyXG4gICAgY29uc3QgbTIgPSBsZWZ0WyAwIF0gKiByaWdodFsgNiBdICsgbGVmdFsgMyBdICogcmlnaHRbIDcgXSArIGxlZnRbIDYgXSAqIHJpZ2h0WyA4IF07XHJcbiAgICBjb25zdCBtMyA9IGxlZnRbIDEgXSAqIHJpZ2h0WyAwIF0gKyBsZWZ0WyA0IF0gKiByaWdodFsgMSBdICsgbGVmdFsgNyBdICogcmlnaHRbIDIgXTtcclxuICAgIGNvbnN0IG00ID0gbGVmdFsgMSBdICogcmlnaHRbIDMgXSArIGxlZnRbIDQgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyA3IF0gKiByaWdodFsgNSBdO1xyXG4gICAgY29uc3QgbTUgPSBsZWZ0WyAxIF0gKiByaWdodFsgNiBdICsgbGVmdFsgNCBdICogcmlnaHRbIDcgXSArIGxlZnRbIDcgXSAqIHJpZ2h0WyA4IF07XHJcbiAgICBjb25zdCBtNiA9IGxlZnRbIDIgXSAqIHJpZ2h0WyAwIF0gKyBsZWZ0WyA1IF0gKiByaWdodFsgMSBdICsgbGVmdFsgOCBdICogcmlnaHRbIDIgXTtcclxuICAgIGNvbnN0IG03ID0gbGVmdFsgMiBdICogcmlnaHRbIDMgXSArIGxlZnRbIDUgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyA4IF0gKiByaWdodFsgNSBdO1xyXG4gICAgY29uc3QgbTggPSBsZWZ0WyAyIF0gKiByaWdodFsgNiBdICsgbGVmdFsgNSBdICogcmlnaHRbIDcgXSArIGxlZnRbIDggXSAqIHJpZ2h0WyA4IF07XHJcbiAgICByZXN1bHRbIDAgXSA9IG0wO1xyXG4gICAgcmVzdWx0WyAxIF0gPSBtMTtcclxuICAgIHJlc3VsdFsgMiBdID0gbTI7XHJcbiAgICByZXN1bHRbIDMgXSA9IG0zO1xyXG4gICAgcmVzdWx0WyA0IF0gPSBtNDtcclxuICAgIHJlc3VsdFsgNSBdID0gbTU7XHJcbiAgICByZXN1bHRbIDYgXSA9IG02O1xyXG4gICAgcmVzdWx0WyA3IF0gPSBtNztcclxuICAgIHJlc3VsdFsgOCBdID0gbTg7XHJcbiAgfSxcclxuXHJcbiAgLypcclxuICAgKiBXcml0ZXMgdGhlIHByb2R1Y3QgKCBtYXRyaXggKiB2ZWN0b3IgKSBpbnRvIHJlc3VsdC4gKGluLXBsYWNlIG1vZGlmaWNhdGlvbiBpcyBPSylcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IG1hdHJpeCAtIFtpbnB1dF0gM3gzIE1hdHJpeFxyXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gdmVjdG9yIC0gW2lucHV0XVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gcmVzdWx0IC0gW291dHB1dF1cclxuICAgKi9cclxuICBtdWx0M1ZlY3RvcjMoIG1hdHJpeCwgdmVjdG9yLCByZXN1bHQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXRyaXgubGVuZ3RoID49IDkgKTtcclxuICAgIGNvbnN0IHggPSBtYXRyaXhbIDAgXSAqIHZlY3Rvci54ICsgbWF0cml4WyAxIF0gKiB2ZWN0b3IueSArIG1hdHJpeFsgMiBdICogdmVjdG9yLno7XHJcbiAgICBjb25zdCB5ID0gbWF0cml4WyAzIF0gKiB2ZWN0b3IueCArIG1hdHJpeFsgNCBdICogdmVjdG9yLnkgKyBtYXRyaXhbIDUgXSAqIHZlY3Rvci56O1xyXG4gICAgY29uc3QgeiA9IG1hdHJpeFsgNiBdICogdmVjdG9yLnggKyBtYXRyaXhbIDcgXSAqIHZlY3Rvci55ICsgbWF0cml4WyA4IF0gKiB2ZWN0b3IuejtcclxuICAgIHJlc3VsdC54ID0geDtcclxuICAgIHJlc3VsdC55ID0geTtcclxuICAgIHJlc3VsdC56ID0gejtcclxuICB9LFxyXG5cclxuICAvKlxyXG4gICAqIFN3YXBzIHR3byBjb2x1bW5zIGluIGEgbWF0cml4LCBuZWdhdGluZyBvbmUgb2YgdGhlbSB0byBtYWludGFpbiB0aGUgc2lnbiBvZiB0aGUgZGV0ZXJtaW5hbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBtYXRyaXggLSBbaW5wdXRdIDN4MyBNYXRyaXhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaWR4MCAtIEluIHRoZSByYW5nZSBbMCwyXVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpZHgxIC0gSW4gdGhlIHJhbmdlIFswLDJdXHJcbiAgICovXHJcbiAgc3dhcE5lZ2F0ZUNvbHVtbiggbWF0cml4LCBpZHgwLCBpZHgxICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF0cml4Lmxlbmd0aCA+PSA5ICk7XHJcbiAgICBjb25zdCB0bXAwID0gbWF0cml4WyBpZHgwIF07XHJcbiAgICBjb25zdCB0bXAxID0gbWF0cml4WyBpZHgwICsgMyBdO1xyXG4gICAgY29uc3QgdG1wMiA9IG1hdHJpeFsgaWR4MCArIDYgXTtcclxuXHJcbiAgICBtYXRyaXhbIGlkeDAgXSA9IG1hdHJpeFsgaWR4MSBdO1xyXG4gICAgbWF0cml4WyBpZHgwICsgMyBdID0gbWF0cml4WyBpZHgxICsgMyBdO1xyXG4gICAgbWF0cml4WyBpZHgwICsgNiBdID0gbWF0cml4WyBpZHgxICsgNiBdO1xyXG5cclxuICAgIG1hdHJpeFsgaWR4MSBdID0gLXRtcDA7XHJcbiAgICBtYXRyaXhbIGlkeDEgKyAzIF0gPSAtdG1wMTtcclxuICAgIG1hdHJpeFsgaWR4MSArIDYgXSA9IC10bXAyO1xyXG4gIH0sXHJcblxyXG4gIC8qXHJcbiAgICogU2V0cyB0aGUgcmVzdWx0IG1hdHJpeCB0byB0aGUgaWRlbnRpdHkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSByZXN1bHQgLSBbb3V0cHV0XSAzeDMgTWF0cml4XHJcbiAgICovXHJcbiAgc2V0SWRlbnRpdHkzKCByZXN1bHQgKSB7XHJcbiAgICByZXN1bHRbIDAgXSA9IHJlc3VsdFsgNCBdID0gcmVzdWx0WyA4IF0gPSAxOyAvLyBkaWFnb25hbFxyXG4gICAgcmVzdWx0WyAxIF0gPSByZXN1bHRbIDIgXSA9IHJlc3VsdFsgMyBdID0gcmVzdWx0WyA1IF0gPSByZXN1bHRbIDYgXSA9IHJlc3VsdFsgNyBdID0gMDsgLy8gbm9uLWRpYWdvbmFsXHJcbiAgfSxcclxuXHJcbiAgLypcclxuICAgKiBTZXRzIHRoZSByZXN1bHQgbWF0cml4IHRvIHRoZSBHaXZlbnMgcm90YXRpb24gKHBlcmZvcm1zIGEgcm90YXRpb24gYmV0d2VlbiB0d28gY29tcG9uZW50cykuIEluc3RlYWQgb2YgYW4gYW5nbGUsXHJcbiAgICogdGhlICdjb3MnIGFuZCAnc2luJyB2YWx1ZXMgYXJlIHBhc3NlZCBpbiBkaXJlY3RseSBzaW5jZSB3ZSBza2lwIHRoZSB0cmlnb25vbWV0cnkgYWxtb3N0IGV2ZXJ5d2hlcmUgd2UgY2FuLlxyXG4gICAqXHJcbiAgICogU2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvR2l2ZW5zX3JvdGF0aW9uIChub3RlIHRoYXQgd2UgdXNlIHRoZSBvdGhlciBzaWduIGNvbnZlbnRpb24gZm9yIHRoZSBzaW4pXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSByZXN1bHQgLSBbb3V0cHV0XSAzeDMgTWF0cml4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvcyAtIFtpbnB1dF0gVGhlIGNvc2luZSBvZiB0aGUgR2l2ZW5zIHJvdGF0aW9uIGFuZ2xlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNpbiAtIFtpbnB1dF0gVGhlIHNpbmUgb2YgdGhlIEdpdmVucyByb3RhdGlvbiBhbmdsZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpZHgwIC0gW2lucHV0XSBUaGUgc21hbGxlciByb3cvY29sdW1uIGluZGV4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGlkeDEgLSBbaW5wdXRdIFRoZSBsYXJnZXIgcm93L2NvbHVtbiBpbmRleFxyXG4gICAqL1xyXG4gIHNldEdpdmVuczMoIHJlc3VsdCwgY29zLCBzaW4sIGlkeDAsIGlkeDEgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpZHgwIDwgaWR4MSApO1xyXG4gICAgdGhpcy5zZXRJZGVudGl0eTMoIHJlc3VsdCApO1xyXG4gICAgcmVzdWx0WyB0aGlzLmluZGV4MyggaWR4MCwgaWR4MCApIF0gPSBjb3M7XHJcbiAgICByZXN1bHRbIHRoaXMuaW5kZXgzKCBpZHgxLCBpZHgxICkgXSA9IGNvcztcclxuICAgIHJlc3VsdFsgdGhpcy5pbmRleDMoIGlkeDAsIGlkeDEgKSBdID0gc2luO1xyXG4gICAgcmVzdWx0WyB0aGlzLmluZGV4MyggaWR4MSwgaWR4MCApIF0gPSAtc2luO1xyXG4gIH0sXHJcblxyXG4gIC8qXHJcbiAgICogRWZmaWNpZW50bHkgcHJlLW11bHRpcGxlcyB0aGUgbWF0cml4IGluLXBsYWNlIGJ5IHRoZSBzcGVjaWZpZWQgR2l2ZW5zIHJvdGF0aW9uIChtYXRyaXggPD0gcm90YXRpb24gKiBtYXRyaXgpLlxyXG4gICAqIEVxdWl2YWxlbnQgdG8gdXNpbmcgc2V0R2l2ZW5zMyBhbmQgbXVsdDMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSByZXN1bHQgLSBbaW5wdXQgQU5EIG91dHB1dF0gM3gzIE1hdHJpeFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjb3MgLSBbaW5wdXRdIFRoZSBjb3NpbmUgb2YgdGhlIEdpdmVucyByb3RhdGlvbiBhbmdsZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaW4gLSBbaW5wdXRdIFRoZSBzaW5lIG9mIHRoZSBHaXZlbnMgcm90YXRpb24gYW5nbGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaWR4MCAtIFtpbnB1dF0gVGhlIHNtYWxsZXIgcm93L2NvbHVtbiBpbmRleFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpZHgxIC0gW2lucHV0XSBUaGUgbGFyZ2VyIHJvdy9jb2x1bW4gaW5kZXhcclxuICAgKi9cclxuICBwcmVNdWx0M0dpdmVucyggbWF0cml4LCBjb3MsIHNpbiwgaWR4MCwgaWR4MSApIHtcclxuICAgIGNvbnN0IGJhc2VBID0gaWR4MCAqIDM7XHJcbiAgICBjb25zdCBiYXNlQiA9IGlkeDEgKiAzO1xyXG4gICAgLy8gbGV4aWNvZ3JhcGhpY2FsbHkgaW4gY29sdW1uLW1ham9yIG9yZGVyIGZvciBcImFmZmluZVwiIHNlY3Rpb25cclxuICAgIGNvbnN0IGEgPSBjb3MgKiBtYXRyaXhbIGJhc2VBICsgMCBdICsgc2luICogbWF0cml4WyBiYXNlQiArIDAgXTtcclxuICAgIGNvbnN0IGIgPSBjb3MgKiBtYXRyaXhbIGJhc2VCICsgMCBdIC0gc2luICogbWF0cml4WyBiYXNlQSArIDAgXTtcclxuICAgIGNvbnN0IGMgPSBjb3MgKiBtYXRyaXhbIGJhc2VBICsgMSBdICsgc2luICogbWF0cml4WyBiYXNlQiArIDEgXTtcclxuICAgIGNvbnN0IGQgPSBjb3MgKiBtYXRyaXhbIGJhc2VCICsgMSBdIC0gc2luICogbWF0cml4WyBiYXNlQSArIDEgXTtcclxuICAgIGNvbnN0IGUgPSBjb3MgKiBtYXRyaXhbIGJhc2VBICsgMiBdICsgc2luICogbWF0cml4WyBiYXNlQiArIDIgXTtcclxuICAgIGNvbnN0IGYgPSBjb3MgKiBtYXRyaXhbIGJhc2VCICsgMiBdIC0gc2luICogbWF0cml4WyBiYXNlQSArIDIgXTtcclxuICAgIG1hdHJpeFsgYmFzZUEgKyAwIF0gPSBhO1xyXG4gICAgbWF0cml4WyBiYXNlQiArIDAgXSA9IGI7XHJcbiAgICBtYXRyaXhbIGJhc2VBICsgMSBdID0gYztcclxuICAgIG1hdHJpeFsgYmFzZUIgKyAxIF0gPSBkO1xyXG4gICAgbWF0cml4WyBiYXNlQSArIDIgXSA9IGU7XHJcbiAgICBtYXRyaXhbIGJhc2VCICsgMiBdID0gZjtcclxuICB9LFxyXG5cclxuICAvKlxyXG4gICAqIEVmZmljaWVudGx5IHBvc3QtbXVsdGlwbGVzIHRoZSBtYXRyaXggaW4tcGxhY2UgYnkgdGhlIHRyYW5zcG9zZSBvZiB0aGUgc3BlY2lmaWVkIEdpdmVucyByb3RhdGlvblxyXG4gICAqIChtYXRyaXggPD0gbWF0cml4ICogcm90YXRpb25eVCkuXHJcbiAgICogRXF1aXZhbGVudCB0byB1c2luZyBzZXRHaXZlbnMzIGFuZCBtdWx0M1JpZ2h0VHJhbnNwb3NlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0IC0gW2lucHV0IEFORCBvdXRwdXRdIDN4MyBNYXRyaXhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gY29zIC0gW2lucHV0XSBUaGUgY29zaW5lIG9mIHRoZSBHaXZlbnMgcm90YXRpb24gYW5nbGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2luIC0gW2lucHV0XSBUaGUgc2luZSBvZiB0aGUgR2l2ZW5zIHJvdGF0aW9uIGFuZ2xlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGlkeDAgLSBbaW5wdXRdIFRoZSBzbWFsbGVyIHJvdy9jb2x1bW4gaW5kZXhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaWR4MSAtIFtpbnB1dF0gVGhlIGxhcmdlciByb3cvY29sdW1uIGluZGV4XHJcbiAgICovXHJcbiAgcG9zdE11bHQzR2l2ZW5zKCBtYXRyaXgsIGNvcywgc2luLCBpZHgwLCBpZHgxICkge1xyXG4gICAgLy8gbGV4aWNvZ3JhcGhpY2FsbHkgaW4gcm93LW1ham9yIG9yZGVyIGZvciB0aGUgXCJ0cmFuc3Bvc2VkIGFmZmluZVwiIHNlY3Rpb25cclxuICAgIGNvbnN0IGEgPSBjb3MgKiBtYXRyaXhbIGlkeDAgKyAwIF0gKyBzaW4gKiBtYXRyaXhbIGlkeDEgKyAwIF07XHJcbiAgICBjb25zdCBiID0gY29zICogbWF0cml4WyBpZHgxICsgMCBdIC0gc2luICogbWF0cml4WyBpZHgwICsgMCBdO1xyXG4gICAgY29uc3QgYyA9IGNvcyAqIG1hdHJpeFsgaWR4MCArIDMgXSArIHNpbiAqIG1hdHJpeFsgaWR4MSArIDMgXTtcclxuICAgIGNvbnN0IGQgPSBjb3MgKiBtYXRyaXhbIGlkeDEgKyAzIF0gLSBzaW4gKiBtYXRyaXhbIGlkeDAgKyAzIF07XHJcbiAgICBjb25zdCBlID0gY29zICogbWF0cml4WyBpZHgwICsgNiBdICsgc2luICogbWF0cml4WyBpZHgxICsgNiBdO1xyXG4gICAgY29uc3QgZiA9IGNvcyAqIG1hdHJpeFsgaWR4MSArIDYgXSAtIHNpbiAqIG1hdHJpeFsgaWR4MCArIDYgXTtcclxuICAgIG1hdHJpeFsgaWR4MCArIDAgXSA9IGE7XHJcbiAgICBtYXRyaXhbIGlkeDEgKyAwIF0gPSBiO1xyXG4gICAgbWF0cml4WyBpZHgwICsgMyBdID0gYztcclxuICAgIG1hdHJpeFsgaWR4MSArIDMgXSA9IGQ7XHJcbiAgICBtYXRyaXhbIGlkeDAgKyA2IF0gPSBlO1xyXG4gICAgbWF0cml4WyBpZHgxICsgNiBdID0gZjtcclxuICB9LFxyXG5cclxuICAvKlxyXG4gICAqIFplcm9zIG91dCB0aGUgW2lkeDAsaWR4MV0gYW5kIFtpZHgxLGlkeDBdIGVudHJpZXMgb2YgdGhlIG1hdHJpeCBtUyBieSBhcHBseWluZyBhIEdpdmVucyByb3RhdGlvbiBhcyBwYXJ0IG9mIHRoZVxyXG4gICAqIEphY29iaSBpdGVyYXRpb24uIEluIGFkZGl0aW9uLCB0aGUgR2l2ZW5zIHJvdGF0aW9uIGlzIHByZXBlbmRlZCB0byBtUSBzbyB3ZSBjYW4gdHJhY2sgdGhlIGFjY3VtdWxhdGVkIHJvdGF0aW9uc1xyXG4gICAqIGFwcGxpZWQgKHRoaXMgaXMgaG93IHdlIGdldCBWIGluIHRoZSBTVkQpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gbVMgLSBbaW5wdXQgQU5EIG91dHB1dF0gU3ltbWV0cmljIDN4MyBNYXRyaXhcclxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBtUSAtIFtpbnB1dCBBTkQgb3V0cHV0XSBVbml0YXJ5IDN4MyBNYXRyaXhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaWR4MCAtIFtpbnB1dF0gVGhlIHNtYWxsZXIgcm93L2NvbHVtbiBpbmRleFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpZHgxIC0gW2lucHV0XSBUaGUgbGFyZ2VyIHJvdy9jb2x1bW4gaW5kZXhcclxuICAgKi9cclxuICBhcHBseUphY29iaTMoIG1TLCBtUSwgaWR4MCwgaWR4MSApIHtcclxuICAgIC8vIHN1Ym1hdHJpeCBlbnRyaWVzIGZvciBpZHgwLGlkeDFcclxuICAgIGNvbnN0IGExMSA9IG1TWyAzICogaWR4MCArIGlkeDAgXTtcclxuICAgIGNvbnN0IGExMiA9IG1TWyAzICogaWR4MCArIGlkeDEgXTsgLy8gd2UgYXNzdW1lIG1TIGlzIHN5bW1ldHJpYywgc28gd2UgZG9uJ3QgbmVlZCBhMjFcclxuICAgIGNvbnN0IGEyMiA9IG1TWyAzICogaWR4MSArIGlkeDEgXTtcclxuXHJcbiAgICAvLyBBcHByb3hpbWF0ZSBnaXZlbnMgYW5nbGUsIHNlZSBodHRwczovL2dyYXBoaWNzLmNzLndpc2MuZWR1L1BhcGVycy8yMDExL01TVFRTMTEvU1ZEX1RSMTY5MC5wZGYgKHNlY3Rpb24gMi4zKVxyXG4gICAgLy8gXCJDb21wdXRpbmcgdGhlIFNpbmd1bGFyIFZhbHVlIERlY29tcG9zaXRpb24gb2YgM3gzIG1hdHJpY2VzIHdpdGggbWluaW1hbCBicmFuY2hpbmcgYW5kIGVsZW1lbnRhcnkgZmxvYXRpbmcgcG9pbnQgb3BlcmF0aW9uc1wiXHJcbiAgICAvLyBBbGVrYSBNY0FkYW1zLCBBbmRyZXcgU2VsbGUsIFJhc211cyBUYW1zdG9yZiwgSm9zZXBoIFRlcmFuLCBFZnR5Y2hpb3MgU2lmYWtpc1xyXG4gICAgY29uc3QgbGhzID0gYTEyICogYTEyO1xyXG4gICAgbGV0IHJocyA9IGExMSAtIGEyMjtcclxuICAgIHJocyA9IHJocyAqIHJocztcclxuICAgIGNvbnN0IHVzZUFuZ2xlID0gbGhzIDwgcmhzO1xyXG4gICAgY29uc3QgdyA9IDEgLyBNYXRoLnNxcnQoIGxocyArIHJocyApO1xyXG4gICAgLy8gTk9URTogZXhhY3QgR2l2ZW5zIGFuZ2xlIGlzIDAuNSAqIE1hdGguYXRhbiggMiAqIGExMiAvICggYTExIC0gYTIyICkgKSwgYnV0IGNsYW1wZWQgdG8gd2l0aGluZyArLU1hdGguUEkgLyA0XHJcbiAgICBjb25zdCBjb3MgPSB1c2VBbmdsZSA/ICggdyAqICggYTExIC0gYTIyICkgKSA6IFNRUlRfSEFMRjtcclxuICAgIGNvbnN0IHNpbiA9IHVzZUFuZ2xlID8gKCB3ICogYTEyICkgOiBTUVJUX0hBTEY7XHJcblxyXG4gICAgLy8gUycgPSBRICogUyAqIHRyYW5zcG9zZSggUSApXHJcbiAgICB0aGlzLnByZU11bHQzR2l2ZW5zKCBtUywgY29zLCBzaW4sIGlkeDAsIGlkeDEgKTtcclxuICAgIHRoaXMucG9zdE11bHQzR2l2ZW5zKCBtUywgY29zLCBzaW4sIGlkeDAsIGlkeDEgKTtcclxuXHJcbiAgICAvLyBRJyA9IFEgKiBtUVxyXG4gICAgdGhpcy5wcmVNdWx0M0dpdmVucyggbVEsIGNvcywgc2luLCBpZHgwLCBpZHgxICk7XHJcbiAgfSxcclxuXHJcbiAgLypcclxuICAgKiBUaGUgSmFjb2JpIG1ldGhvZCwgd2hpY2ggaW4gdHVybiB6ZXJvcyBvdXQgYWxsIHRoZSBub24tZGlhZ29uYWwgZW50cmllcyByZXBlYXRlZGx5IHVudGlsIG1TIGNvbnZlcmdlcyBpbnRvXHJcbiAgICogYSBkaWFnb25hbCBtYXRyaXguIFdlIHRyYWNrIHRoZSBhcHBsaWVkIEdpdmVucyByb3RhdGlvbnMgaW4gbVEsIHNvIHRoYXQgd2hlbiBnaXZlbiBtUyBhbmQgbVE9aWRlbnRpdHksIHdlIHdpbGxcclxuICAgKiBtYWludGFpbiB0aGUgdmFsdWUgbVEgKiBtUyAqIG1RXlRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IG1TIC0gW2lucHV0IEFORCBvdXRwdXRdIFN5bW1ldHJpYyAzeDMgTWF0cml4XHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gbVEgLSBbaW5wdXQgQU5EIG91dHB1dF0gVW5pdGFyeSAzeDMgTWF0cml4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG4gLSBbaW5wdXRdIFRoZSBudW1iZXIgb2YgaXRlcmF0aW9ucyB0byBydW5cclxuICAgKi9cclxuICBqYWNvYmlJdGVyYXRpb24zKCBtUywgbVEsIG4gKSB7XHJcbiAgICAvLyBmb3IgM3gzLCB3ZSBlbGltaW5hdGUgbm9uLWRpYWdvbmFsIGVudHJpZXMgaXRlcmF0aXZlbHlcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG47IGkrKyApIHtcclxuICAgICAgdGhpcy5hcHBseUphY29iaTMoIG1TLCBtUSwgMCwgMSApO1xyXG4gICAgICB0aGlzLmFwcGx5SmFjb2JpMyggbVMsIG1RLCAwLCAyICk7XHJcbiAgICAgIHRoaXMuYXBwbHlKYWNvYmkzKCBtUywgbVEsIDEsIDIgKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKlxyXG4gICAqIE9uZSBzdGVwIGluIGNvbXB1dGluZyB0aGUgUVIgZGVjb21wb3NpdGlvbi4gWmVyb3Mgb3V0IHRoZSAocm93LGNvbCkgZW50cnkgaW4gJ3InLCB3aGlsZSBtYWludGFpbmluZyB0aGVcclxuICAgKiB2YWx1ZSBvZiAocSAqIHIpLiBXZSB3aWxsIGVuZCB1cCB3aXRoIGFuIG9ydGhvZ29uYWwgUSBhbmQgdXBwZXItdHJpYW5ndWxhciBSIChvciBpbiB0aGUgU1ZEIGNhc2UsXHJcbiAgICogUiB3aWxsIGJlIGRpYWdvbmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcSAtIFtpbnB1dCBBTkQgb3VwdXRdIDN4MyBNYXRyaXhcclxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSByIC0gW2lucHV0IEFORCBvdXB1dF0gM3gzIE1hdHJpeFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByb3cgLSBbaW5wdXRdIFRoZSByb3cgb2YgdGhlIGVudHJ5IHRvIHplcm8gb3V0XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvbCAtIFtpbnB1dF0gVGhlIGNvbHVtbiBvZiB0aGUgZW50cnkgdG8gemVybyBvdXRcclxuICAgKi9cclxuICBxckFubmloaWxhdGUzKCBxLCByLCByb3csIGNvbCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJvdyA+IGNvbCApOyAvLyBvbmx5IGluIHRoZSBsb3dlci10cmlhbmd1bGFyIGFyZWFcclxuXHJcbiAgICBjb25zdCBlcHNpbG9uID0gMC4wMDAwMDAwMDAxO1xyXG4gICAgbGV0IGNvcztcclxuICAgIGxldCBzaW47XHJcblxyXG4gICAgY29uc3QgZGlhZ29uYWxWYWx1ZSA9IHJbIHRoaXMuaW5kZXgzKCBjb2wsIGNvbCApIF07XHJcbiAgICBjb25zdCB0YXJnZXRWYWx1ZSA9IHJbIHRoaXMuaW5kZXgzKCByb3csIGNvbCApIF07XHJcbiAgICBjb25zdCBkaWFnb25hbFNxdWFyZWQgPSBkaWFnb25hbFZhbHVlICogZGlhZ29uYWxWYWx1ZTtcclxuICAgIGNvbnN0IHRhcmdldFNxdWFyZWQgPSB0YXJnZXRWYWx1ZSAqIHRhcmdldFZhbHVlO1xyXG5cclxuICAgIC8vIGhhbmRsZSB0aGUgY2FzZSB3aGVyZSBib3RoIChyb3csY29sKSBhbmQgKGNvbCxjb2wpIGFyZSB2ZXJ5IHNtYWxsICh3b3VsZCBjYXVzZSBpbnN0YWJpbGl0aWVzKVxyXG4gICAgaWYgKCBkaWFnb25hbFNxdWFyZWQgKyB0YXJnZXRTcXVhcmVkIDwgZXBzaWxvbiApIHtcclxuICAgICAgY29zID0gZGlhZ29uYWxWYWx1ZSA+IDAgPyAxIDogMDtcclxuICAgICAgc2luID0gMDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb25zdCByc3FyID0gMSAvIE1hdGguc3FydCggZGlhZ29uYWxTcXVhcmVkICsgdGFyZ2V0U3F1YXJlZCApO1xyXG4gICAgICBjb3MgPSByc3FyICogZGlhZ29uYWxWYWx1ZTtcclxuICAgICAgc2luID0gcnNxciAqIHRhcmdldFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucHJlTXVsdDNHaXZlbnMoIHIsIGNvcywgc2luLCBjb2wsIHJvdyApO1xyXG4gICAgdGhpcy5wb3N0TXVsdDNHaXZlbnMoIHEsIGNvcywgc2luLCBjb2wsIHJvdyApO1xyXG4gIH0sXHJcblxyXG4gIC8qXHJcbiAgICogM3gzIFNpbmd1bGFyIFZhbHVlIERlY29tcG9zaXRpb24sIGhhbmRsaW5nIHNpbmd1bGFyIGNhc2VzLlxyXG4gICAqIEJhc2VkIG9uIGh0dHBzOi8vZ3JhcGhpY3MuY3Mud2lzYy5lZHUvUGFwZXJzLzIwMTEvTVNUVFMxMS9TVkRfVFIxNjkwLnBkZlxyXG4gICAqIFwiQ29tcHV0aW5nIHRoZSBTaW5ndWxhciBWYWx1ZSBEZWNvbXBvc2l0aW9uIG9mIDN4MyBtYXRyaWNlcyB3aXRoIG1pbmltYWwgYnJhbmNoaW5nIGFuZCBlbGVtZW50YXJ5IGZsb2F0aW5nIHBvaW50IG9wZXJhdGlvbnNcIlxyXG4gICAqIEFsZWthIE1jQWRhbXMsIEFuZHJldyBTZWxsZSwgUmFzbXVzIFRhbXN0b3JmLCBKb3NlcGggVGVyYW4sIEVmdHljaGlvcyBTaWZha2lzXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBhIC0gW2lucHV0XSAzeDMgTWF0cml4IHRoYXQgd2Ugd2FudCB0aGUgU1ZEIG9mLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBqYWNvYmlJdGVyYXRpb25Db3VudCAtIFtpbnB1dF0gSG93IG1hbnkgSmFjb2JpIGl0ZXJhdGlvbnMgdG8gcnVuIChsYXJnZXIgaXMgbW9yZSBhY2N1cmF0ZSB0byBhIHBvaW50KVxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdFUgLSBbb3V0cHV0XSAzeDMgVSBtYXRyaXggKHVuaXRhcnkpXHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0U2lnbWEgLSBbb3V0cHV0XSAzeDMgZGlhZ29uYWwgbWF0cml4IG9mIHNpbmd1bGFyIHZhbHVlc1xyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdFYgLSBbb3V0cHV0XSAzeDMgViBtYXRyaXggKHVuaXRhcnkpXHJcbiAgICovXHJcbiAgc3ZkMyggYSwgamFjb2JpSXRlcmF0aW9uQ291bnQsIHJlc3VsdFUsIHJlc3VsdFNpZ21hLCByZXN1bHRWICkge1xyXG4gICAgLy8gc2hvcnRoYW5kc1xyXG4gICAgY29uc3QgcSA9IHJlc3VsdFU7XHJcbiAgICBjb25zdCB2ID0gcmVzdWx0VjtcclxuICAgIGNvbnN0IHIgPSByZXN1bHRTaWdtYTtcclxuXHJcbiAgICAvLyBmb3Igbm93LCB1c2UgJ3InIGFzIG91ciBTID09IHRyYW5zcG9zZSggQSApICogQSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB1c2Ugc2NyYXRjaCBtYXRyaWNlc1xyXG4gICAgdGhpcy5tdWx0M0xlZnRUcmFuc3Bvc2UoIGEsIGEsIHIgKTtcclxuICAgIC8vIHdlJ2xsIGFjY3VtdWxhdGUgaW50byAncScgPT0gdHJhbnNwb3NlKCBWICkgZHVyaW5nIHRoZSBKYWNvYmkgaXRlcmF0aW9uXHJcbiAgICB0aGlzLnNldElkZW50aXR5MyggcSApO1xyXG5cclxuICAgIC8vIEphY29iaSBpdGVyYXRpb24gdHVybnMgUSBpbnRvIFZeVCBhbmQgUiBpbnRvIFNpZ21hXjIgKHdlJ2xsIGRpdGNoIFIgc2luY2UgdGhlIFFSIGRlY29tcG9zaXRpb24gd2lsbCBiZSBiZXRlcilcclxuICAgIHRoaXMuamFjb2JpSXRlcmF0aW9uMyggciwgcSwgamFjb2JpSXRlcmF0aW9uQ291bnQgKTtcclxuICAgIC8vIGZpbmFsIGRldGVybWluYXRpb24gb2YgVlxyXG4gICAgdGhpcy50cmFuc3Bvc2UzKCBxLCB2ICk7IC8vIGRvbmUgd2l0aCB0aGlzICdxJyB1bnRpbCB3ZSByZXVzZSB0aGUgc2NyYXRjaCBtYXRyaXggbGF0ZXIgYmVsb3cgZm9yIHRoZSBRUiBkZWNvbXBvc2l0aW9uXHJcblxyXG4gICAgdGhpcy5tdWx0MyggYSwgdiwgciApOyAvLyBSID0gQVZcclxuXHJcbiAgICAvLyBTb3J0IGNvbHVtbnMgb2YgUiBhbmQgViBiYXNlZCBvbiBzaW5ndWxhciB2YWx1ZXMgKG5lZWRlZCBmb3IgdGhlIFFSIHN0ZXAsIGFuZCB1c2VmdWwgYW55d2F5cykuXHJcbiAgICAvLyBUaGVpciBwcm9kdWN0IHdpbGwgcmVtYWluIHVuY2hhbmdlZC5cclxuICAgIGxldCBtYWcwID0gclsgMCBdICogclsgMCBdICsgclsgMyBdICogclsgMyBdICsgclsgNiBdICogclsgNiBdOyAvLyBjb2x1bW4gdmVjdG9yIG1hZ25pdHVkZXNcclxuICAgIGxldCBtYWcxID0gclsgMSBdICogclsgMSBdICsgclsgNCBdICogclsgNCBdICsgclsgNyBdICogclsgNyBdO1xyXG4gICAgbGV0IG1hZzIgPSByWyAyIF0gKiByWyAyIF0gKyByWyA1IF0gKiByWyA1IF0gKyByWyA4IF0gKiByWyA4IF07XHJcbiAgICBsZXQgdG1wTWFnO1xyXG4gICAgaWYgKCBtYWcwIDwgbWFnMSApIHtcclxuICAgICAgLy8gc3dhcCBtYWduaXR1ZGVzXHJcbiAgICAgIHRtcE1hZyA9IG1hZzA7XHJcbiAgICAgIG1hZzAgPSBtYWcxO1xyXG4gICAgICBtYWcxID0gdG1wTWFnO1xyXG4gICAgICB0aGlzLnN3YXBOZWdhdGVDb2x1bW4oIHIsIDAsIDEgKTtcclxuICAgICAgdGhpcy5zd2FwTmVnYXRlQ29sdW1uKCB2LCAwLCAxICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIG1hZzAgPCBtYWcyICkge1xyXG4gICAgICAvLyBzd2FwIG1hZ25pdHVkZXNcclxuICAgICAgdG1wTWFnID0gbWFnMDtcclxuICAgICAgbWFnMCA9IG1hZzI7XHJcbiAgICAgIG1hZzIgPSB0bXBNYWc7XHJcbiAgICAgIHRoaXMuc3dhcE5lZ2F0ZUNvbHVtbiggciwgMCwgMiApO1xyXG4gICAgICB0aGlzLnN3YXBOZWdhdGVDb2x1bW4oIHYsIDAsIDIgKTtcclxuICAgIH1cclxuICAgIGlmICggbWFnMSA8IG1hZzIgKSB7XHJcbiAgICAgIHRoaXMuc3dhcE5lZ2F0ZUNvbHVtbiggciwgMSwgMiApO1xyXG4gICAgICB0aGlzLnN3YXBOZWdhdGVDb2x1bW4oIHYsIDEsIDIgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBRUiBkZWNvbXBvc2l0aW9uXHJcbiAgICB0aGlzLnNldElkZW50aXR5MyggcSApOyAvLyByZXVzaW5nIFEgbm93IGZvciB0aGUgUVJcclxuICAgIC8vIFplcm8gb3V0IGFsbCB0aHJlZSBzdHJpY3RseSBsb3dlci10cmlhbmd1bGFyIHZhbHVlcy4gU2hvdWxkIHR1cm4gdGhlIG1hdHJpeCBkaWFnb25hbFxyXG4gICAgdGhpcy5xckFubmloaWxhdGUzKCBxLCByLCAxLCAwICk7XHJcbiAgICB0aGlzLnFyQW5uaWhpbGF0ZTMoIHEsIHIsIDIsIDAgKTtcclxuICAgIHRoaXMucXJBbm5paGlsYXRlMyggcSwgciwgMiwgMSApO1xyXG5cclxuICAgIC8vIGNoZWNrcyBmb3IgYSBzaW5ndWxhciBVIHZhbHVlLCB3ZSdsbCBhZGQgaW4gdGhlIG5lZWRlZCAxIGVudHJpZXMgdG8gbWFrZSBzdXJlIG91ciBVIGlzIG9ydGhvZ29uYWxcclxuICAgIGNvbnN0IGJpZ0Vwc2lsb24gPSAwLjAwMTsgLy8gdGhleSByZWFsbHkgc2hvdWxkIGJlIGFyb3VuZCAxXHJcbiAgICBpZiAoIHFbIDAgXSAqIHFbIDAgXSArIHFbIDEgXSAqIHFbIDEgXSArIHFbIDIgXSAqIHFbIDIgXSA8IGJpZ0Vwc2lsb24gKSB7XHJcbiAgICAgIHFbIDAgXSA9IDE7XHJcbiAgICB9XHJcbiAgICBpZiAoIHFbIDMgXSAqIHFbIDMgXSArIHFbIDQgXSAqIHFbIDQgXSArIHFbIDUgXSAqIHFbIDUgXSA8IGJpZ0Vwc2lsb24gKSB7XHJcbiAgICAgIHFbIDQgXSA9IDE7XHJcbiAgICB9XHJcbiAgICBpZiAoIHFbIDYgXSAqIHFbIDYgXSArIHFbIDcgXSAqIHFbIDcgXSArIHFbIDggXSAqIHFbIDggXSA8IGJpZ0Vwc2lsb24gKSB7XHJcbiAgICAgIHFbIDggXSA9IDE7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogM3hOIG1hdHJpeCBtYXRoXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLypcclxuICAgKiBTZXRzIHRoZSAzeE4gcmVzdWx0IG1hdHJpeCB0byBiZSBtYWRlIG91dCBvZiBjb2x1bW4gdmVjdG9yc1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48VmVjdG9yMz59IGNvbHVtblZlY3RvcnMgLSBbaW5wdXRdIExpc3Qgb2YgM0QgY29sdW1uIHZlY3RvcnNcclxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSByZXN1bHQgLSBbb3V0cHV0XSAzeE4gTWF0cml4LCB3aGVyZSBOIGlzIHRoZSBudW1iZXIgb2YgY29sdW1uIHZlY3RvcnNcclxuICAgKi9cclxuICBzZXRWZWN0b3JzMyggY29sdW1uVmVjdG9ycywgcmVzdWx0ICkge1xyXG4gICAgY29uc3QgbSA9IDM7XHJcbiAgICBjb25zdCBuID0gY29sdW1uVmVjdG9ycy5sZW5ndGg7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0Lmxlbmd0aCA+PSBtICogbiwgJ0FycmF5IGxlbmd0aCBjaGVjaycgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBuOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHZlY3RvciA9IGNvbHVtblZlY3RvcnNbIGkgXTtcclxuICAgICAgcmVzdWx0WyBpIF0gPSB2ZWN0b3IueDtcclxuICAgICAgcmVzdWx0WyBpICsgbiBdID0gdmVjdG9yLnk7XHJcbiAgICAgIHJlc3VsdFsgaSArIDIgKiBuIF0gPSB2ZWN0b3IuejtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKlxyXG4gICAqIFJldHJpZXZlcyBjb2x1bW4gdmVjdG9yIHZhbHVlcyBmcm9tIGEgM3hOIG1hdHJpeC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtIC0gW2lucHV0XSBUaGUgbnVtYmVyIG9mIHJvd3MgaW4gdGhlIG1hdHJpeCAoc2FuaXR5IGNoZWNrLCBzaG91bGQgYWx3YXlzIGJlIDMpXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG4gLSBbaW5wdXRdIFRoZSBudW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgbWF0cml4XHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gbWF0cml4IC0gW2lucHV0XSAzeE4gTWF0cml4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtbkluZGV4IC0gW2lucHV0XSAzeE4gTWF0cml4XHJcbiAgICogQHBhcmFtIHtWZWN0b3IzfSByZXN1bHQgLSBbb3V0cHV0XSBWZWN0b3IgdG8gc3RvcmUgdGhlIHgseSx6XHJcbiAgICovXHJcbiAgZ2V0Q29sdW1uVmVjdG9yMyggbSwgbiwgbWF0cml4LCBjb2x1bW5JbmRleCwgcmVzdWx0ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbSA9PT0gMyAmJiBjb2x1bW5JbmRleCA8IG4gKTtcclxuXHJcbiAgICByZXN1bHQueCA9IG1hdHJpeFsgY29sdW1uSW5kZXggXTtcclxuICAgIHJlc3VsdC55ID0gbWF0cml4WyBjb2x1bW5JbmRleCArIG4gXTtcclxuICAgIHJlc3VsdC56ID0gbWF0cml4WyBjb2x1bW5JbmRleCArIDIgKiBuIF07XHJcbiAgfSxcclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogQXJiaXRyYXJ5IGRpbWVuc2lvbiBtYXRyaXggbWF0aFxyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qXHJcbiAgICogRnJvbSAwLWluZGV4ZWQgcm93IGFuZCBjb2x1bW4gaW5kaWNlcywgcmV0dXJucyB0aGUgaW5kZXggaW50byB0aGUgZmxhdCBhcnJheVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG0gLSBOdW1iZXIgb2Ygcm93cyBpbiB0aGUgbWF0cml4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG4gLSBOdW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgbWF0cml4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJvd1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjb2xcclxuICAgKi9cclxuICBpbmRleCggbSwgbiwgcm93LCBjb2wgKSB7XHJcbiAgICByZXR1cm4gbiAqIHJvdyArIGNvbDtcclxuICB9LFxyXG5cclxuICAvKlxyXG4gICAqIFdyaXRlcyB0aGUgdHJhbnNwb3NlIG9mIHRoZSBtYXRyaXggaW50byB0aGUgcmVzdWx0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG0gLSBOdW1iZXIgb2Ygcm93cyBpbiB0aGUgb3JpZ2luYWwgbWF0cml4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG4gLSBOdW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgb3JpZ2luYWwgbWF0cml4XHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gbWF0cml4IC0gW2lucHV0XSBNeE4gTWF0cml4XHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0IC0gW291dHB1dF0gTnhNIE1hdHJpeFxyXG4gICAqL1xyXG4gIHRyYW5zcG9zZSggbSwgbiwgbWF0cml4LCByZXN1bHQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXRyaXgubGVuZ3RoID49IG0gKiBuICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXN1bHQubGVuZ3RoID49IG4gKiBtICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXRyaXggIT09IHJlc3VsdCwgJ0luLXBsYWNlIG1vZGlmaWNhdGlvbiBub3QgaW1wbGVtZW50ZWQgeWV0JyApO1xyXG5cclxuICAgIGZvciAoIGxldCByb3cgPSAwOyByb3cgPCBtOyByb3crKyApIHtcclxuICAgICAgZm9yICggbGV0IGNvbCA9IDA7IGNvbCA8IG47IGNvbCsrICkge1xyXG4gICAgICAgIHJlc3VsdFsgbSAqIGNvbCArIHJvdyBdID0gbWF0cml4WyBuICogcm93ICsgY29sIF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKlxyXG4gICAqIFdyaXRlcyB0aGUgbWF0cml4IG11bHRpcGxpY2F0aW9uIG9mICggbGVmdCAqIHJpZ2h0ICkgaW50byByZXN1bHRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtIC0gTnVtYmVyIG9mIHJvd3MgaW4gdGhlIGxlZnQgbWF0cml4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG4gLSBOdW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgbGVmdCBtYXRyaXgsIG51bWJlciBvZiByb3dzIGluIHRoZSByaWdodCBtYXRyaXhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcCAtIE51bWJlciBvZiBjb2x1bW5zIGluIHRoZSByaWdodCBtYXRyaXhcclxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBsZWZ0IC0gW2lucHV0XSBNeE4gTWF0cml4XHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmlnaHQgLSBbaW5wdXRdIE54UCBNYXRyaXhcclxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSByZXN1bHQgLSBbb3V0cHV0XSBNeFAgTWF0cml4XHJcbiAgICovXHJcbiAgbXVsdCggbSwgbiwgcCwgbGVmdCwgcmlnaHQsIHJlc3VsdCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnQubGVuZ3RoID49IG0gKiBuICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByaWdodC5sZW5ndGggPj0gbiAqIHAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdC5sZW5ndGggPj0gbSAqIHAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnQgIT09IHJlc3VsdCAmJiByaWdodCAhPT0gcmVzdWx0LCAnSW4tcGxhY2UgbW9kaWZpY2F0aW9uIG5vdCBpbXBsZW1lbnRlZCB5ZXQnICk7XHJcblxyXG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IG07IHJvdysrICkge1xyXG4gICAgICBmb3IgKCBsZXQgY29sID0gMDsgY29sIDwgcDsgY29sKysgKSB7XHJcbiAgICAgICAgbGV0IHggPSAwO1xyXG4gICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IG47IGsrKyApIHtcclxuICAgICAgICAgIHggKz0gbGVmdFsgdGhpcy5pbmRleCggbSwgbiwgcm93LCBrICkgXSAqIHJpZ2h0WyB0aGlzLmluZGV4KCBuLCBwLCBrLCBjb2wgKSBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHRbIHRoaXMuaW5kZXgoIG0sIHAsIHJvdywgY29sICkgXSA9IHg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKlxyXG4gICAqIFdyaXRlcyB0aGUgbWF0cml4IG11bHRpcGxpY2F0aW9uIG9mICggbGVmdCAqIHRyYW5zcG9zZSggcmlnaHQgKSApIGludG8gcmVzdWx0XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbSAtIE51bWJlciBvZiByb3dzIGluIHRoZSBsZWZ0IG1hdHJpeFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuIC0gTnVtYmVyIG9mIGNvbHVtbnMgaW4gdGhlIGxlZnQgbWF0cml4LCBudW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgcmlnaHQgbWF0cml4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHAgLSBOdW1iZXIgb2Ygcm93cyBpbiB0aGUgcmlnaHQgbWF0cml4XHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gbGVmdCAtIFtpbnB1dF0gTXhOIE1hdHJpeFxyXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJpZ2h0IC0gW2lucHV0XSBQeE4gTWF0cml4XHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0IC0gW291dHB1dF0gTXhQIE1hdHJpeFxyXG4gICAqL1xyXG4gIG11bHRSaWdodFRyYW5zcG9zZSggbSwgbiwgcCwgbGVmdCwgcmlnaHQsIHJlc3VsdCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnQubGVuZ3RoID49IG0gKiBuICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByaWdodC5sZW5ndGggPj0gbiAqIHAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdC5sZW5ndGggPj0gbSAqIHAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnQgIT09IHJlc3VsdCAmJiByaWdodCAhPT0gcmVzdWx0LCAnSW4tcGxhY2UgbW9kaWZpY2F0aW9uIG5vdCBpbXBsZW1lbnRlZCB5ZXQnICk7XHJcblxyXG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IG07IHJvdysrICkge1xyXG4gICAgICBmb3IgKCBsZXQgY29sID0gMDsgY29sIDwgcDsgY29sKysgKSB7XHJcbiAgICAgICAgbGV0IHggPSAwO1xyXG4gICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IG47IGsrKyApIHtcclxuICAgICAgICAgIHggKz0gbGVmdFsgdGhpcy5pbmRleCggbSwgbiwgcm93LCBrICkgXSAqIHJpZ2h0WyB0aGlzLmluZGV4KCBwLCBuLCBjb2wsIGsgKSBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHRbIHRoaXMuaW5kZXgoIG0sIHAsIHJvdywgY29sICkgXSA9IHg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKlxyXG4gICAqIFdyaXRlcyB0aGUgbWF0cml4IGludG8gdGhlIHJlc3VsdCwgcGVybXV0aW5nIHRoZSBjb2x1bW5zLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG0gLSBOdW1iZXIgb2Ygcm93cyBpbiB0aGUgb3JpZ2luYWwgbWF0cml4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG4gLSBOdW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgb3JpZ2luYWwgbWF0cml4XHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gbWF0cml4IC0gW2lucHV0XSBNeE4gTWF0cml4XHJcbiAgICogQHBhcmFtIHtQZXJtdXRhdGlvbn0gcGVybXV0YXRpb24gLSBbaW5wdXRdIFBlcm11dGF0aW9uXHJcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0IC0gW291dHB1dF0gTXhOIE1hdHJpeFxyXG4gICAqL1xyXG4gIHBlcm11dGVDb2x1bW5zKCBtLCBuLCBtYXRyaXgsIHBlcm11dGF0aW9uLCByZXN1bHQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXRyaXggIT09IHJlc3VsdCwgJ0luLXBsYWNlIG1vZGlmaWNhdGlvbiBub3QgaW1wbGVtZW50ZWQgeWV0JyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF0cml4Lmxlbmd0aCA+PSBtICogbiApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0Lmxlbmd0aCA+PSBtICogbiApO1xyXG5cclxuICAgIGZvciAoIGxldCBjb2wgPSAwOyBjb2wgPCBuOyBjb2wrKyApIHtcclxuICAgICAgY29uc3QgcGVybXV0ZWRDb2x1bW5JbmRleCA9IHBlcm11dGF0aW9uLmluZGljZXNbIGNvbCBdO1xyXG4gICAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgbTsgcm93KysgKSB7XHJcbiAgICAgICAgcmVzdWx0WyB0aGlzLmluZGV4KCBtLCBuLCByb3csIGNvbCApIF0gPSBtYXRyaXhbIHRoaXMuaW5kZXgoIG0sIG4sIHJvdywgcGVybXV0ZWRDb2x1bW5JbmRleCApIF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn07XHJcbmRvdC5yZWdpc3RlciggJ01hdHJpeE9wczMnLCBNYXRyaXhPcHMzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYXRyaXhPcHMzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEdBQUcsTUFBTSxVQUFVOztBQUUxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFNQyxTQUFTLEdBQUdDLElBQUksQ0FBQ0MsSUFBSSxDQUFF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LENBQUVHLE1BQU0sQ0FBQ0MsTUFBTSxJQUFJLENBQUUsQ0FBQztJQUN0QyxNQUFNWSxFQUFFLEdBQUdGLElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFO0lBQ25GLE1BQU1ULEVBQUUsR0FBR1EsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUU7SUFDbkYsTUFBTVIsRUFBRSxHQUFHTyxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRTtJQUNuRixNQUFNUCxFQUFFLEdBQUdNLElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFO0lBQ25GLE1BQU1FLEVBQUUsR0FBR0gsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENB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QUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFO0lBQ25GLE1BQU1QLEVBQUUsR0FBR00sSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUU7SUFDbkYsTUFBTUUsRUFBRSxHQUFHSCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRTtJQUNuRixNQUFNTixFQUFFLEdBQUdLLElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFO0lBQ25GLE1BQU1MLEVBQUUsR0FBR0ksSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUU7SUFDbkYsTUFBTUosRUFBRSxHQUFHRyxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRTtJQUNuRixNQUFNRyxFQUFFLEdBQUdKLElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFO0lBQ25GWixNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdhLEVBQUU7SUFDaEJiLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBR0csRUFBRTtJQUNoQkgsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHSSxFQUFFO0lBQ2hCSixNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdLLEVBQUU7SUFDaEJMLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBR2MsRUFBRTtJQUNoQmQsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHTSxFQUFFO0lBQ2hCTixNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdPLEVBQUU7SUFDaEJQLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBR1EsRUFBRTtJQUNoQlIsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHZSxFQUFFO0VBQ2xCLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxtQkFBbUJBLENBQUVOLElBQUksRUFBRUMsS0FBSyxFQUFFWixNQUFNLEVBQUc7SUFDekNILE1BQU0sSUFBSUEsTUFBTSxDQUFFYyxJQUFJLENBQUNWLE1BQU0sSUFBSSxDQUFFLENBQUM7SUFDcENKLE1BQU0sSUFBSUEsTUFBTSxDQUFFZSxLQUFLLENBQUNYLE1BQU0sSUFBSSxDQUFFLENBQUM7SUFDckNKLE1BQU0sSUFBSUEsTUFBTSxDQUFFRyxNQUFNLENBQUNDLE1BQU0sSUFBSSxDQUFFLENBQUM7SUFDdEMsTUFBTVksRUFBRSxHQUFHRixJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRTtJQUNuRixNQUFNVCxFQUFFLEdBQUdRLElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFO0lBQ25GLE1BQU1SLEVBQUUsR0FBR08sSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUU7SUFDbkYsTUFBTVAsRUFBRSxHQUFHTSxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRTtJQUNuRixNQUFNRSxFQUFFLEdBQUdILElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFO0lBQ25GLE1BQU1OLEVBQUUsR0FBR0ssSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUU7SUFDbkYsTUFBTUwsRUFBRSxHQUFHSSxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRTtJQUNuRixNQUFNSixFQUFFLEdBQUdHLElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFO0lBQ25GLE1BQU1HLEVBQUUsR0FBR0osSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUU7SUFDbkZaLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBR2EsRUFBRTtJQUNoQmIsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHRyxFQUFFO0lBQ2hCSCxNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdJLEVBQUU7SUFDaEJKLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBR0ssRUFBRTtJQUNoQkwsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHYyxFQUFFO0lBQ2hCZCxNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdNLEVBQUU7SUFDaEJOLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBR08sRUFBRTtJQUNoQlAsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHUSxFQUFFO0lBQ2hCUixNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdlLEVBQUU7RUFDbEIsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxrQkFBa0JBLENBQUVQLElBQUksRUFBRUMsS0FBSyxFQUFFWixNQUFNLEVBQUc7SUFDeENILE1BQU0sSUFBSUEsTUFBTSxDQUFFYyxJQUFJLENBQUNWLE1BQU0sSUFBSSxDQUFFLENBQUM7SUFDcENKLE1BQU0sSUFBSUEsTUFBTSxDQUFFZSxLQUFLLENBQUNYLE1BQU0sSUFBSSxDQUFFLENBQUM7SUFDckNKLE1BQU0sSUFBSUEsTUFBTSxDQUFFRyxNQUFNLENBQUNDLE1BQU0sSUFBSSxDQUFFLENBQUM7SUFDdEMsTUFBTVksRUFBRSxHQUFHRixJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRTtJQUNuRixNQUFNVCxFQUFFLEdBQUdRLElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFO0lBQ25GLE1BQU1SLEVBQUUsR0FBR08sSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUU7SUFDbkYsTUFBTVAsRUFBRSxHQUFHTSxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRTtJQUNuRixNQUFNRSxFQUFFLEdBQUdILElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFO0lBQ25GLE1BQU1OLEVBQUUsR0FBR0ssSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUU7SUFDbkYsTUFBTUwsRUFBRSxHQUFHSSxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRTtJQUNuRixNQUFNSixFQUFFLEdBQUdHLElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBR0QsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFO0lBQ25GLE1BQU1HLEVBQUUsR0FBR0osSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHQyxLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUdELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBR0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxHQUFHRCxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUdDLEtBQUssQ0FBRSxDQUFDLENBQUU7SUFDbkZaLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBR2EsRUFBRTtJQUNoQmIsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHRyxFQUFFO0lBQ2hCSCxNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdJLEVBQUU7SUFDaEJKLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBR0ssRUFBRTtJQUNoQkwsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHYyxFQUFFO0lBQ2hCZCxNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdNLEVBQUU7SUFDaEJOLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBR08sRUFBRTtJQUNoQlAsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHUSxFQUFFO0lBQ2hCUixNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdlLEVBQUU7RUFDbEIsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLFlBQVlBLENBQUVwQixNQUFNLEVBQUVxQixNQUFNLEVBQUVwQixNQUFNLEVBQUc7SUFDckNILE1BQU0sSUFBSUEsTUFBTSxDQUFFRSxNQUFNLENBQUNFLE1BQU0sSUFBSSxDQUFFLENBQUM7SUFDdEMsTUFBTW9CLENBQUMsR0FBR3RCLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBR3FCLE1BQU0sQ0FBQ0MsQ0FBQyxHQUFHdEIsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHcUIsTUFBTSxDQUFDRSxDQUFDLEdBQUd2QixNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdxQixNQUFNLENBQUNHLENBQUM7SUFDbEYsTUFBTUQsQ0FBQyxHQUFHdkIsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHcUIsTUFBTSxDQUFDQyxDQUFDLEdBQUd0QixNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdxQixNQUFNLENBQUNFLENBQUMsR0FBR3ZCLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBR3FCLE1BQU0sQ0FBQ0csQ0FBQztJQUNsRixNQUFNQSxDQUFDLEdBQUd4QixNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdxQixNQUFNLENBQUNDLENBQUMsR0FBR3RCLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBR3FCLE1BQU0sQ0FBQ0UsQ0FBQyxHQUFHdkIsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHcUIsTUFBTSxDQUFDRyxDQUFDO0lBQ2xGdkIsTUFBTSxDQUFDcUIsQ0FBQyxHQUFHQSxDQUFDO0lBQ1pyQixNQUFNLENBQUNzQixDQUFDLEdBQUdBLENBQUM7SUFDWnRCLE1BQU0sQ0FBQ3VCLENBQUMsR0FBR0EsQ0FBQztFQUNkLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxnQkFBZ0JBLENBQUV6QixNQUFNLEVBQUUwQixJQUFJLEVBQUVDLElBQUksRUFBRztJQUNyQzdCLE1BQU0sSUFBSUEsTUFBTSxDQUFFRSxNQUFNLENBQUNFLE1BQU0sSUFBSSxDQUFFLENBQUM7SUFDdEMsTUFBTTBCLElBQUksR0FBRzVCLE1BQU0sQ0FBRTBCLElBQUksQ0FBRTtJQUMzQixNQUFNRyxJQUFJLEdBQUc3QixNQUFNLENBQUUwQixJQUFJLEdBQUcsQ0FBQyxDQUFFO0lBQy9CLE1BQU1JLElBQUksR0FBRzlCLE1BQU0sQ0FBRTBCLElBQUksR0FBRyxDQUFDLENBQUU7SUFFL0IxQixNQUFNLENBQUUwQixJQUFJLENBQUUsR0FBRzFCLE1BQU0sQ0FBRTJCLElBQUksQ0FBRTtJQUMvQjNCLE1BQU0sQ0FBRTBCLElBQUksR0FBRyxDQUFDLENBQUUsR0FBRzFCLE1BQU0sQ0FBRTJCLElBQUksR0FBRyxDQUFDLENBQUU7SUFDdkMzQixNQUFNLENBQUUwQixJQUFJLEdBQUcsQ0FBQyxDQUFFLEdBQUcxQixNQUFNLENBQUUyQixJQUFJLEdBQUcsQ0FBQyxDQUFFO0lBRXZDM0IsTUFBTSxDQUFFMkIsSUFBSSxDQUFFLEdBQUcsQ0FBQ0MsSUFBSTtJQUN0QjVCLE1BQU0sQ0FBRTJCLElBQUksR0FBRyxDQUFDLENBQUUsR0FBRyxDQUFDRSxJQUFJO0lBQzFCN0IsTUFBTSxDQUFFMkIsSUFBSSxHQUFHLENBQUMsQ0FBRSxHQUFHLENBQUNHLElBQUk7RUFDNUIsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsWUFBWUEsQ0FBRTlCLE1BQU0sRUFBRztJQUNyQkEsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHQSxNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdBLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM3Q0EsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHQSxNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdBLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBR0EsTUFBTSxDQUFFLENBQUMsQ0FBRSxHQUFHQSxNQUFNLENBQUUsQ0FBQyxDQUFFLEdBQUdBLE1BQU0sQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztFQUN6RixDQUFDOztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFK0IsVUFBVUEsQ0FBRS9CLE1BQU0sRUFBRWdDLEdBQUcsRUFBRUMsR0FBRyxFQUFFUixJQUFJLEVBQUVDLElBQUksRUFBRztJQUN6QzdCLE1BQU0sSUFBSUEsTUFBTSxDQUFFNEIsSUFBSSxHQUFHQyxJQUFLLENBQUM7SUFDL0IsSUFBSSxDQUFDSSxZQUFZLENBQUU5QixNQUFPLENBQUM7SUFDM0JBLE1BQU0sQ0FBRSxJQUFJLENBQUNOLE1BQU0sQ0FBRStCLElBQUksRUFBRUEsSUFBSyxDQUFDLENBQUUsR0FBR08sR0FBRztJQUN6Q2hDLE1BQU0sQ0FBRSxJQUFJLENBQUNOLE1BQU0sQ0FBRWdDLElBQUksRUFBRUEsSUFBSyxDQUFDLENBQUUsR0FBR00sR0FBRztJQUN6Q2hDLE1BQU0sQ0FBRSxJQUFJLENBQUNOLE1BQU0sQ0FBRStCLElBQUksRUFBRUMsSUFBSyxDQUFDLENBQUUsR0FBR08sR0FBRztJQUN6Q2pDLE1BQU0sQ0FBRSxJQUFJLENBQUNOLE1BQU0sQ0FBRWdDLElBQUksRUFBRUQsSUFBSyxDQUFDLENBQUUsR0FBRyxDQUFDUSxHQUFHO0VBQzVDLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxjQUFjQSxDQUFFbkMsTUFBTSxFQUFFaUMsR0FBRyxFQUFFQyxHQUFHLEVBQUVSLElBQUksRUFBRUMsSUFBSSxFQUFHO0lBQzdDLE1BQU1TLEtBQUssR0FBR1YsSUFBSSxHQUFHLENBQUM7SUFDdEIsTUFBTVcsS0FBSyxHQUFHVixJQUFJLEdBQUcsQ0FBQztJQUN0QjtJQUNBLE1BQU1XLENBQUMsR0FBR0wsR0FBRyxHQUFHakMsTUFBTSxDQUFFb0MsS0FBSyxHQUFHLENBQUMsQ0FBRSxHQUFHRixHQUFHLEdBQUdsQyxNQUFNLENBQUVxQyxLQUFLLEdBQUcsQ0FBQyxDQUFFO0lBQy9ELE1BQU1FLENBQUMsR0FBR04sR0FBRyxHQUFHakMsTUFBTSxDQUFFcUMsS0FBSyxHQUFHLENBQUMsQ0FBRSxHQUFHSCxHQUFHLEdBQUdsQyxNQUFNLENBQUVvQyxLQUFLLEdBQUcsQ0FBQyxDQUFFO0lBQy9ELE1BQU1JLENBQUMsR0FBR1AsR0FBRyxHQUFHakMsTUFBTSxDQUFFb0MsS0FBSyxHQUFHLENBQUMsQ0FBRSxHQUFHRixHQUFHLEdBQUdsQyxNQUFNLENBQUVxQyxLQUFLLEdBQUcsQ0FBQyxDQUFFO0lBQy9ELE1BQU1JLENBQUMsR0FBR1IsR0FBRyxHQUFHakMsTUFBTSxDQUFFcUMsS0FBSyxHQUFHLENBQUMsQ0FBRSxHQUFHSCxHQUFHLEdBQUdsQyxNQUFNLENBQUVvQyxLQUFLLEdBQUcsQ0FBQyxDQUFFO0lBQy9ELE1BQU1NLENBQUMsR0FBR1QsR0FBRyxHQUFHakMsTUFBTSxDQUFFb0MsS0FBSyxHQUFHLENBQUMsQ0FBRSxHQUFHRixHQUFHLEdBQUdsQyxNQUFNLENBQUVxQyxLQUFLLEdBQUcsQ0FBQyxDQUFFO0lBQy9ELE1BQU1NLENBQUMsR0FBR1YsR0FBRyxHQUFHakMsTUFBTSxDQUFFcUMsS0FBSyxHQUFHLENBQUMsQ0FBRSxHQUFHSCxHQUFHLEdBQUdsQyxNQUFNLENBQUVvQyxLQUFLLEdBQUcsQ0FBQyxDQUFFO0lBQy9EcEMsTUFBTSxDQUFFb0MsS0FBSyxHQUFHLENBQUMsQ0FBRSxHQUFHRSxDQUFDO0lBQ3ZCdEMsTUFBTSxDQUFFcUMsS0FBSyxHQUFHLENBQUMsQ0FBRSxHQUFHRSxDQUFDO0lBQ3ZCdkMsTUFBTSxDQUFFb0MsS0FBSyxHQUFHLENBQUMsQ0FBRSxHQUFHSSxDQUFDO0lBQ3ZCeEMsTUFBTSxDQUFFcUMsS0FBSyxHQUFHLENBQUMsQ0FBRSxHQUFHSSxDQUFDO0lBQ3ZCekMsTUFBTSxDQUFFb0MsS0FBSyxHQUFHLENBQUMsQ0FBRSxHQUFHTSxDQUFDO0lBQ3ZCMUMsTUFBTSxDQUFFcUMsS0FBSyxHQUFHLENBQUMsQ0FBRSxHQUFHTSxDQUFDO0VBQ3pCLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLGVBQWVBLENBQUU1QyxNQUFNLEVBQUVpQyxHQUFHLEVBQUVDLEdBQUcsRUFBRVIsSUFBSSxFQUFFQyxJQUFJLEVBQUc7SUFDOUM7SUFDQSxNQUFNVyxDQUFDLEdBQUdMLEdBQUcsR0FBR2pDLE1BQU0sQ0FBRTBCLElBQUksR0FBRyxDQUFDLENBQUUsR0FBR1EsR0FBRyxHQUFHbEMsTUFBTSxDQUFFMkIsSUFBSSxHQUFHLENBQUMsQ0FBRTtJQUM3RCxNQUFNWSxDQUFDLEdBQUdOLEdBQUcsR0FBR2pDLE1BQU0sQ0FBRTJCLElBQUksR0FBRyxDQUFDLENBQUUsR0FBR08sR0FBRyxHQUFHbEMsTUFBTSxDQUFFMEIsSUFBSSxHQUFHLENBQUMsQ0FBRTtJQUM3RCxNQUFNYyxDQUFDLEdBQUdQLEdBQUcsR0FBR2pDLE1BQU0sQ0FBRTBCLElBQUksR0FBRyxDQUFDLENBQUUsR0FBR1EsR0FBRyxHQUFHbEMsTUFBTSxDQUFFMkIsSUFBSSxHQUFHLENBQUMsQ0FBRTtJQUM3RCxNQUFNYyxDQUFDLEdBQUdSLEdBQUcsR0FBR2pDLE1BQU0sQ0FBRTJCLElBQUksR0FBRyxDQUFDLENBQUUsR0FBR08sR0FBRyxHQUFHbEMsTUFBTSxDQUFFMEIsSUFBSSxHQUFHLENBQUMsQ0FBRTtJQUM3RCxNQUFNZ0IsQ0FBQyxHQUFHVCxHQUFHLEdBQUdqQyxNQUFNLENBQUUwQixJQUFJLEdBQUcsQ0FBQyxDQUFFLEdBQUdRLEdBQUcsR0FBR2xDLE1BQU0sQ0FBRTJCLElBQUksR0FBRyxDQUFDLENBQUU7SUFDN0QsTUFBTWdCLENBQUMsR0FBR1YsR0FBRyxHQUFHakMsTUFBTSxDQUFFMkIsSUFBSSxHQUFHLENBQUMsQ0FBRSxHQUFHTyxHQUFHLEdBQUdsQyxNQUFNLENBQUUwQixJQUFJLEdBQUcsQ0FBQyxDQUFFO0lBQzdEMUIsTUFBTSxDQUFFMEIsSUFBSSxHQUFHLENBQUMsQ0FBRSxHQUFHWSxDQUFDO0lBQ3RCdEMsTUFBTSxDQUFFMkIsSUFBSSxHQUFHLENBQUMsQ0FBRSxHQUFHWSxDQUFDO0lBQ3RCdkMsTUFBTSxDQUFFMEIsSUFBSSxHQUFHLENBQUMsQ0FBRSxHQUFHYyxDQUFDO0lBQ3RCeEMsTUFBTSxDQUFFMkIsSUFBSSxHQUFHLENBQUMsQ0FBRSxHQUFHYyxDQUFDO0lBQ3RCekMsTUFBTSxDQUFFMEIsSUFBSSxHQUFHLENBQUMsQ0FBRSxHQUFHZ0IsQ0FBQztJQUN0QjFDLE1BQU0sQ0FBRTJCLElBQUksR0FBRyxDQUFDLENBQUUsR0FBR2dCLENBQUM7RUFDeEIsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLFlBQVlBLENBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFFckIsSUFBSSxFQUFFQyxJQUFJLEVBQUc7SUFDakM7SUFDQSxNQUFNcUIsR0FBRyxHQUFHRixFQUFFLENBQUUsQ0FBQyxHQUFHcEIsSUFBSSxHQUFHQSxJQUFJLENBQUU7SUFDakMsTUFBTXVCLEdBQUcsR0FBR0gsRUFBRSxDQUFFLENBQUMsR0FBR3BCLElBQUksR0FBR0MsSUFBSSxDQUFFLENBQUMsQ0FBQztJQUNuQyxNQUFNdUIsR0FBRyxHQUFHSixFQUFFLENBQUUsQ0FBQyxHQUFHbkIsSUFBSSxHQUFHQSxJQUFJLENBQUU7O0lBRWpDO0lBQ0E7SUFDQTtJQUNBLE1BQU13QixHQUFHLEdBQUdGLEdBQUcsR0FBR0EsR0FBRztJQUNyQixJQUFJRyxHQUFHLEdBQUdKLEdBQUcsR0FBR0UsR0FBRztJQUNuQkUsR0FBRyxHQUFHQSxHQUFHLEdBQUdBLEdBQUc7SUFDZixNQUFNQyxRQUFRLEdBQUdGLEdBQUcsR0FBR0MsR0FBRztJQUMxQixNQUFNRSxDQUFDLEdBQUcsQ0FBQyxHQUFHaEUsSUFBSSxDQUFDQyxJQUFJLENBQUU0RCxHQUFHLEdBQUdDLEdBQUksQ0FBQztJQUNwQztJQUNBLE1BQU1uQixHQUFHLEdBQUdvQixRQUFRLEdBQUtDLENBQUMsSUFBS04sR0FBRyxHQUFHRSxHQUFHLENBQUUsR0FBSzdELFNBQVM7SUFDeEQsTUFBTTZDLEdBQUcsR0FBR21CLFFBQVEsR0FBS0MsQ0FBQyxHQUFHTCxHQUFHLEdBQUs1RCxTQUFTOztJQUU5QztJQUNBLElBQUksQ0FBQzhDLGNBQWMsQ0FBRVcsRUFBRSxFQUFFYixHQUFHLEVBQUVDLEdBQUcsRUFBRVIsSUFBSSxFQUFFQyxJQUFLLENBQUM7SUFDL0MsSUFBSSxDQUFDaUIsZUFBZSxDQUFFRSxFQUFFLEVBQUViLEdBQUcsRUFBRUMsR0FBRyxFQUFFUixJQUFJLEVBQUVDLElBQUssQ0FBQzs7SUFFaEQ7SUFDQSxJQUFJLENBQUNRLGNBQWMsQ0FBRVksRUFBRSxFQUFFZCxHQUFHLEVBQUVDLEdBQUcsRUFBRVIsSUFBSSxFQUFFQyxJQUFLLENBQUM7RUFDakQsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFNEIsZ0JBQWdCQSxDQUFFVCxFQUFFLEVBQUVDLEVBQUUsRUFBRVMsQ0FBQyxFQUFHO0lBQzVCO0lBQ0EsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdELENBQUMsRUFBRUMsQ0FBQyxFQUFFLEVBQUc7TUFDNUIsSUFBSSxDQUFDWixZQUFZLENBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7TUFDakMsSUFBSSxDQUFDRixZQUFZLENBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7TUFDakMsSUFBSSxDQUFDRixZQUFZLENBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDbkM7RUFDRixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVcsYUFBYUEsQ0FBRUMsQ0FBQyxFQUFFQyxDQUFDLEVBQUVoRSxHQUFHLEVBQUVDLEdBQUcsRUFBRztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUVGLEdBQUcsR0FBR0MsR0FBSSxDQUFDLENBQUMsQ0FBQzs7SUFFL0IsTUFBTWdFLE9BQU8sR0FBRyxZQUFZO0lBQzVCLElBQUk1QixHQUFHO0lBQ1AsSUFBSUMsR0FBRztJQUVQLE1BQU00QixhQUFhLEdBQUdGLENBQUMsQ0FBRSxJQUFJLENBQUNqRSxNQUFNLENBQUVFLEdBQUcsRUFBRUEsR0FBSSxDQUFDLENBQUU7SUFDbEQsTUFBTWtFLFdBQVcsR0FBR0gsQ0FBQyxDQUFFLElBQUksQ0FBQ2pFLE1BQU0sQ0FBRUMsR0FBRyxFQUFFQyxHQUFJLENBQUMsQ0FBRTtJQUNoRCxNQUFNbUUsZUFBZSxHQUFHRixhQUFhLEdBQUdBLGFBQWE7SUFDckQsTUFBTUcsYUFBYSxHQUFHRixXQUFXLEdBQUdBLFdBQVc7O0lBRS9DO0lBQ0EsSUFBS0MsZUFBZSxHQUFHQyxhQUFhLEdBQUdKLE9BQU8sRUFBRztNQUMvQzVCLEdBQUcsR0FBRzZCLGFBQWEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7TUFDL0I1QixHQUFHLEdBQUcsQ0FBQztJQUNULENBQUMsTUFDSTtNQUNILE1BQU1nQyxJQUFJLEdBQUcsQ0FBQyxHQUFHNUUsSUFBSSxDQUFDQyxJQUFJLENBQUV5RSxlQUFlLEdBQUdDLGFBQWMsQ0FBQztNQUM3RGhDLEdBQUcsR0FBR2lDLElBQUksR0FBR0osYUFBYTtNQUMxQjVCLEdBQUcsR0FBR2dDLElBQUksR0FBR0gsV0FBVztJQUMxQjtJQUVBLElBQUksQ0FBQzVCLGNBQWMsQ0FBRXlCLENBQUMsRUFBRTNCLEdBQUcsRUFBRUMsR0FBRyxFQUFFckMsR0FBRyxFQUFFRCxHQUFJLENBQUM7SUFDNUMsSUFBSSxDQUFDZ0QsZUFBZSxDQUFFZSxDQUFDLEVBQUUxQixHQUFHLEVBQUVDLEdBQUcsRUFBRXJDLEdBQUcsRUFBRUQsR0FBSSxDQUFDO0VBQy9DLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRXVFLElBQUlBLENBQUU3QixDQUFDLEVBQUU4QixvQkFBb0IsRUFBRUMsT0FBTyxFQUFFQyxXQUFXLEVBQUVDLE9BQU8sRUFBRztJQUM3RDtJQUNBLE1BQU1aLENBQUMsR0FBR1UsT0FBTztJQUNqQixNQUFNRyxDQUFDLEdBQUdELE9BQU87SUFDakIsTUFBTVgsQ0FBQyxHQUFHVSxXQUFXOztJQUVyQjtJQUNBLElBQUksQ0FBQ3JELGtCQUFrQixDQUFFcUIsQ0FBQyxFQUFFQSxDQUFDLEVBQUVzQixDQUFFLENBQUM7SUFDbEM7SUFDQSxJQUFJLENBQUM3QixZQUFZLENBQUU0QixDQUFFLENBQUM7O0lBRXRCO0lBQ0EsSUFBSSxDQUFDSixnQkFBZ0IsQ0FBRUssQ0FBQyxFQUFFRCxDQUFDLEVBQUVTLG9CQUFxQixDQUFDO0lBQ25EO0lBQ0EsSUFBSSxDQUFDakUsVUFBVSxDQUFFd0QsQ0FBQyxFQUFFYSxDQUFFLENBQUMsQ0FBQyxDQUFDOztJQUV6QixJQUFJLENBQUM3RCxLQUFLLENBQUUyQixDQUFDLEVBQUVrQyxDQUFDLEVBQUVaLENBQUUsQ0FBQyxDQUFDLENBQUM7O0lBRXZCO0lBQ0E7SUFDQSxJQUFJYSxJQUFJLEdBQUdiLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBR0EsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHQSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUdBLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBR0EsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHQSxDQUFDLENBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQztJQUNoRSxJQUFJYyxJQUFJLEdBQUdkLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBR0EsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHQSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUdBLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBR0EsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHQSxDQUFDLENBQUUsQ0FBQyxDQUFFO0lBQzlELElBQUllLElBQUksR0FBR2YsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHQSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUdBLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBR0EsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHQSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUdBLENBQUMsQ0FBRSxDQUFDLENBQUU7SUFDOUQsSUFBSWdCLE1BQU07SUFDVixJQUFLSCxJQUFJLEdBQUdDLElBQUksRUFBRztNQUNqQjtNQUNBRSxNQUFNLEdBQUdILElBQUk7TUFDYkEsSUFBSSxHQUFHQyxJQUFJO01BQ1hBLElBQUksR0FBR0UsTUFBTTtNQUNiLElBQUksQ0FBQ25ELGdCQUFnQixDQUFFbUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7TUFDaEMsSUFBSSxDQUFDbkMsZ0JBQWdCLENBQUUrQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztJQUNsQztJQUNBLElBQUtDLElBQUksR0FBR0UsSUFBSSxFQUFHO01BQ2pCO01BQ0FDLE1BQU0sR0FBR0gsSUFBSTtNQUNiQSxJQUFJLEdBQUdFLElBQUk7TUFDWEEsSUFBSSxHQUFHQyxNQUFNO01BQ2IsSUFBSSxDQUFDbkQsZ0JBQWdCLENBQUVtQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztNQUNoQyxJQUFJLENBQUNuQyxnQkFBZ0IsQ0FBRStDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0lBQ2xDO0lBQ0EsSUFBS0UsSUFBSSxHQUFHQyxJQUFJLEVBQUc7TUFDakIsSUFBSSxDQUFDbEQsZ0JBQWdCLENBQUVtQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztNQUNoQyxJQUFJLENBQUNuQyxnQkFBZ0IsQ0FBRStDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0lBQ2xDOztJQUVBO0lBQ0EsSUFBSSxDQUFDekMsWUFBWSxDQUFFNEIsQ0FBRSxDQUFDLENBQUMsQ0FBQztJQUN4QjtJQUNBLElBQUksQ0FBQ0QsYUFBYSxDQUFFQyxDQUFDLEVBQUVDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0lBQ2hDLElBQUksQ0FBQ0YsYUFBYSxDQUFFQyxDQUFDLEVBQUVDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0lBQ2hDLElBQUksQ0FBQ0YsYUFBYSxDQUFFQyxDQUFDLEVBQUVDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDOztJQUVoQztJQUNBLE1BQU1pQixVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDMUIsSUFBS2xCLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBR0EsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHQSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUdBLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBR0EsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHQSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUdrQixVQUFVLEVBQUc7TUFDdEVsQixDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQztJQUNaO0lBQ0EsSUFBS0EsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHQSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUdBLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBR0EsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHQSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUdBLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBR2tCLFVBQVUsRUFBRztNQUN0RWxCLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDO0lBQ1o7SUFDQSxJQUFLQSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUdBLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBR0EsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHQSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUdBLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBR0EsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHa0IsVUFBVSxFQUFHO01BQ3RFbEIsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUM7SUFDWjtFQUNGLENBQUM7RUFFRDtBQUNGO0FBQ0E7O0VBRUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VtQixXQUFXQSxDQUFFQyxhQUFhLEVBQUU5RSxNQUFNLEVBQUc7SUFDbkMsTUFBTStFLENBQUMsR0FBRyxDQUFDO0lBQ1gsTUFBTXhCLENBQUMsR0FBR3VCLGFBQWEsQ0FBQzdFLE1BQU07SUFFOUJKLE1BQU0sSUFBSUEsTUFBTSxDQUFFRyxNQUFNLENBQUNDLE1BQU0sSUFBSThFLENBQUMsR0FBR3hCLENBQUMsRUFBRSxvQkFBcUIsQ0FBQztJQUVoRSxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0QsQ0FBQyxFQUFFQyxDQUFDLEVBQUUsRUFBRztNQUM1QixNQUFNcEMsTUFBTSxHQUFHMEQsYUFBYSxDQUFFdEIsQ0FBQyxDQUFFO01BQ2pDeEQsTUFBTSxDQUFFd0QsQ0FBQyxDQUFFLEdBQUdwQyxNQUFNLENBQUNDLENBQUM7TUFDdEJyQixNQUFNLENBQUV3RCxDQUFDLEdBQUdELENBQUMsQ0FBRSxHQUFHbkMsTUFBTSxDQUFDRSxDQUFDO01BQzFCdEIsTUFBTSxDQUFFd0QsQ0FBQyxHQUFHLENBQUMsR0FBR0QsQ0FBQyxDQUFFLEdBQUduQyxNQUFNLENBQUNHLENBQUM7SUFDaEM7RUFDRixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0V5RCxnQkFBZ0JBLENBQUVELENBQUMsRUFBRXhCLENBQUMsRUFBRXhELE1BQU0sRUFBRWtGLFdBQVcsRUFBRWpGLE1BQU0sRUFBRztJQUNwREgsTUFBTSxJQUFJQSxNQUFNLENBQUVrRixDQUFDLEtBQUssQ0FBQyxJQUFJRSxXQUFXLEdBQUcxQixDQUFFLENBQUM7SUFFOUN2RCxNQUFNLENBQUNxQixDQUFDLEdBQUd0QixNQUFNLENBQUVrRixXQUFXLENBQUU7SUFDaENqRixNQUFNLENBQUNzQixDQUFDLEdBQUd2QixNQUFNLENBQUVrRixXQUFXLEdBQUcxQixDQUFDLENBQUU7SUFDcEN2RCxNQUFNLENBQUN1QixDQUFDLEdBQUd4QixNQUFNLENBQUVrRixXQUFXLEdBQUcsQ0FBQyxHQUFHMUIsQ0FBQyxDQUFFO0VBQzFDLENBQUM7RUFFRDtBQUNGO0FBQ0E7O0VBRUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFMkIsS0FBS0EsQ0FBRUgsQ0FBQyxFQUFFeEIsQ0FBQyxFQUFFNUQsR0FBRyxFQUFFQyxHQUFHLEVBQUc7SUFDdEIsT0FBTzJELENBQUMsR0FBRzVELEdBQUcsR0FBR0MsR0FBRztFQUN0QixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFdUYsU0FBU0EsQ0FBRUosQ0FBQyxFQUFFeEIsQ0FBQyxFQUFFeEQsTUFBTSxFQUFFQyxNQUFNLEVBQUc7SUFDaENILE1BQU0sSUFBSUEsTUFBTSxDQUFFRSxNQUFNLENBQUNFLE1BQU0sSUFBSThFLENBQUMsR0FBR3hCLENBQUUsQ0FBQztJQUMxQzFELE1BQU0sSUFBSUEsTUFBTSxDQUFFRyxNQUFNLENBQUNDLE1BQU0sSUFBSXNELENBQUMsR0FBR3dCLENBQUUsQ0FBQztJQUMxQ2xGLE1BQU0sSUFBSUEsTUFBTSxDQUFFRSxNQUFNLEtBQUtDLE1BQU0sRUFBRSwyQ0FBNEMsQ0FBQztJQUVsRixLQUFNLElBQUlMLEdBQUcsR0FBRyxDQUFDLEVBQUVBLEdBQUcsR0FBR29GLENBQUMsRUFBRXBGLEdBQUcsRUFBRSxFQUFHO01BQ2xDLEtBQU0sSUFBSUMsR0FBRyxHQUFHLENBQUMsRUFBRUEsR0FBRyxHQUFHMkQsQ0FBQyxFQUFFM0QsR0FBRyxFQUFFLEVBQUc7UUFDbENJLE1BQU0sQ0FBRStFLENBQUMsR0FBR25GLEdBQUcsR0FBR0QsR0FBRyxDQUFFLEdBQUdJLE1BQU0sQ0FBRXdELENBQUMsR0FBRzVELEdBQUcsR0FBR0MsR0FBRyxDQUFFO01BQ25EO0lBQ0Y7RUFDRixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRXdGLElBQUlBLENBQUVMLENBQUMsRUFBRXhCLENBQUMsRUFBRThCLENBQUMsRUFBRTFFLElBQUksRUFBRUMsS0FBSyxFQUFFWixNQUFNLEVBQUc7SUFDbkNILE1BQU0sSUFBSUEsTUFBTSxDQUFFYyxJQUFJLENBQUNWLE1BQU0sSUFBSThFLENBQUMsR0FBR3hCLENBQUUsQ0FBQztJQUN4QzFELE1BQU0sSUFBSUEsTUFBTSxDQUFFZSxLQUFLLENBQUNYLE1BQU0sSUFBSXNELENBQUMsR0FBRzhCLENBQUUsQ0FBQztJQUN6Q3hGLE1BQU0sSUFBSUEsTUFBTSxDQUFFRyxNQUFNLENBQUNDLE1BQU0sSUFBSThFLENBQUMsR0FBR00sQ0FBRSxDQUFDO0lBQzFDeEYsTUFBTSxJQUFJQSxNQUFNLENBQUVjLElBQUksS0FBS1gsTUFBTSxJQUFJWSxLQUFLLEtBQUtaLE1BQU0sRUFBRSwyQ0FBNEMsQ0FBQztJQUVwRyxLQUFNLElBQUlMLEdBQUcsR0FBRyxDQUFDLEVBQUVBLEdBQUcsR0FBR29GLENBQUMsRUFBRXBGLEdBQUcsRUFBRSxFQUFHO01BQ2xDLEtBQU0sSUFBSUMsR0FBRyxHQUFHLENBQUMsRUFBRUEsR0FBRyxHQUFHeUYsQ0FBQyxFQUFFekYsR0FBRyxFQUFFLEVBQUc7UUFDbEMsSUFBSXlCLENBQUMsR0FBRyxDQUFDO1FBQ1QsS0FBTSxJQUFJaUUsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHL0IsQ0FBQyxFQUFFK0IsQ0FBQyxFQUFFLEVBQUc7VUFDNUJqRSxDQUFDLElBQUlWLElBQUksQ0FBRSxJQUFJLENBQUN1RSxLQUFLLENBQUVILENBQUMsRUFBRXhCLENBQUMsRUFBRTVELEdBQUcsRUFBRTJGLENBQUUsQ0FBQyxDQUFFLEdBQUcxRSxLQUFLLENBQUUsSUFBSSxDQUFDc0UsS0FBSyxDQUFFM0IsQ0FBQyxFQUFFOEIsQ0FBQyxFQUFFQyxDQUFDLEVBQUUxRixHQUFJLENBQUMsQ0FBRTtRQUMvRTtRQUNBSSxNQUFNLENBQUUsSUFBSSxDQUFDa0YsS0FBSyxDQUFFSCxDQUFDLEVBQUVNLENBQUMsRUFBRTFGLEdBQUcsRUFBRUMsR0FBSSxDQUFDLENBQUUsR0FBR3lCLENBQUM7TUFDNUM7SUFDRjtFQUNGLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFa0Usa0JBQWtCQSxDQUFFUixDQUFDLEVBQUV4QixDQUFDLEVBQUU4QixDQUFDLEVBQUUxRSxJQUFJLEVBQUVDLEtBQUssRUFBRVosTUFBTSxFQUFHO0lBQ2pESCxNQUFNLElBQUlBLE1BQU0sQ0FBRWMsSUFBSSxDQUFDVixNQUFNLElBQUk4RSxDQUFDLEdBQUd4QixDQUFFLENBQUM7SUFDeEMxRCxNQUFNLElBQUlBLE1BQU0sQ0FBRWUsS0FBSyxDQUFDWCxNQUFNLElBQUlzRCxDQUFDLEdBQUc4QixDQUFFLENBQUM7SUFDekN4RixNQUFNLElBQUlBLE1BQU0sQ0FBRUcsTUFBTSxDQUFDQyxNQUFNLElBQUk4RSxDQUFDLEdBQUdNLENBQUUsQ0FBQztJQUMxQ3hGLE1BQU0sSUFBSUEsTUFBTSxDQUFFYyxJQUFJLEtBQUtYLE1BQU0sSUFBSVksS0FBSyxLQUFLWixNQUFNLEVBQUUsMkNBQTRDLENBQUM7SUFFcEcsS0FBTSxJQUFJTCxHQUFHLEdBQUcsQ0FBQyxFQUFFQSxHQUFHLEdBQUdvRixDQUFDLEVBQUVwRixHQUFHLEVBQUUsRUFBRztNQUNsQyxLQUFNLElBQUlDLEdBQUcsR0FBRyxDQUFDLEVBQUVBLEdBQUcsR0FBR3lGLENBQUMsRUFBRXpGLEdBQUcsRUFBRSxFQUFHO1FBQ2xDLElBQUl5QixDQUFDLEdBQUcsQ0FBQztRQUNULEtBQU0sSUFBSWlFLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRy9CLENBQUMsRUFBRStCLENBQUMsRUFBRSxFQUFHO1VBQzVCakUsQ0FBQyxJQUFJVixJQUFJLENBQUUsSUFBSSxDQUFDdUUsS0FBSyxDQUFFSCxDQUFDLEVBQUV4QixDQUFDLEVBQUU1RCxHQUFHLEVBQUUyRixDQUFFLENBQUMsQ0FBRSxHQUFHMUUsS0FBSyxDQUFFLElBQUksQ0FBQ3NFLEtBQUssQ0FBRUcsQ0FBQyxFQUFFOUIsQ0FBQyxFQUFFM0QsR0FBRyxFQUFFMEYsQ0FBRSxDQUFDLENBQUU7UUFDL0U7UUFDQXRGLE1BQU0sQ0FBRSxJQUFJLENBQUNrRixLQUFLLENBQUVILENBQUMsRUFBRU0sQ0FBQyxFQUFFMUYsR0FBRyxFQUFFQyxHQUFJLENBQUMsQ0FBRSxHQUFHeUIsQ0FBQztNQUM1QztJQUNGO0VBQ0YsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFbUUsY0FBY0EsQ0FBRVQsQ0FBQyxFQUFFeEIsQ0FBQyxFQUFFeEQsTUFBTSxFQUFFMEYsV0FBVyxFQUFFekYsTUFBTSxFQUFHO0lBQ2xESCxNQUFNLElBQUlBLE1BQU0sQ0FBRUUsTUFBTSxLQUFLQyxNQUFNLEVBQUUsMkNBQTRDLENBQUM7SUFDbEZILE1BQU0sSUFBSUEsTUFBTSxDQUFFRSxNQUFNLENBQUNFLE1BQU0sSUFBSThFLENBQUMsR0FBR3hCLENBQUUsQ0FBQztJQUMxQzFELE1BQU0sSUFBSUEsTUFBTSxDQUFFRyxNQUFNLENBQUNDLE1BQU0sSUFBSThFLENBQUMsR0FBR3hCLENBQUUsQ0FBQztJQUUxQyxLQUFNLElBQUkzRCxHQUFHLEdBQUcsQ0FBQyxFQUFFQSxHQUFHLEdBQUcyRCxDQUFDLEVBQUUzRCxHQUFHLEVBQUUsRUFBRztNQUNsQyxNQUFNOEYsbUJBQW1CLEdBQUdELFdBQVcsQ0FBQ0UsT0FBTyxDQUFFL0YsR0FBRyxDQUFFO01BQ3RELEtBQU0sSUFBSUQsR0FBRyxHQUFHLENBQUMsRUFBRUEsR0FBRyxHQUFHb0YsQ0FBQyxFQUFFcEYsR0FBRyxFQUFFLEVBQUc7UUFDbENLLE1BQU0sQ0FBRSxJQUFJLENBQUNrRixLQUFLLENBQUVILENBQUMsRUFBRXhCLENBQUMsRUFBRTVELEdBQUcsRUFBRUMsR0FBSSxDQUFDLENBQUUsR0FBR0csTUFBTSxDQUFFLElBQUksQ0FBQ21GLEtBQUssQ0FBRUgsQ0FBQyxFQUFFeEIsQ0FBQyxFQUFFNUQsR0FBRyxFQUFFK0YsbUJBQW9CLENBQUMsQ0FBRTtNQUNqRztJQUNGO0VBQ0Y7QUFDRixDQUFDO0FBQ0R2RyxHQUFHLENBQUN5RyxRQUFRLENBQUUsWUFBWSxFQUFFckcsVUFBVyxDQUFDO0FBRXhDLGVBQWVBLFVBQVUifQ==