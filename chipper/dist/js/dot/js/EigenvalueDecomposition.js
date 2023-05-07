// Copyright 2013-2022, University of Colorado Boulder

/**
 * Eigensystem decomposition, based on Jama (http://math.nist.gov/javanumerics/jama/)
 *
 * Eigenvalues and eigenvectors of a real matrix.
 * <P>
 * If A is symmetric, then A = V*D*V' where the eigenvalue matrix D is
 * diagonal and the eigenvector matrix V is orthogonal.
 * I.e. A = V.times(D.times(V.transpose())) and
 * V.times(V.transpose()) equals the identity matrix.
 * <P>
 * If A is not symmetric, then the eigenvalue matrix D is block diagonal
 * with the real eigenvalues in 1-by-1 blocks and any complex eigenvalues,
 * lambda + i*mu, in 2-by-2 blocks, [lambda, mu; -mu, lambda].  The
 * columns of V represent the eigenvectors in the sense that A*V = V*D,
 * i.e. A.times(V) equals V.times(D).  The matrix V may be badly
 * conditioned, or even singular, so the validity of the equation
 * A = V*D*inverse(V) depends upon V.cond().
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import dot from './dot.js';
import Matrix from './Matrix.js';
const ArrayType = window.Float64Array || Array;
class EigenvalueDecomposition {
  /**
   * @param {Matrix} matrix - must be a square matrix
   */
  constructor(matrix) {
    let i;
    let j;
    const A = matrix.entries;
    this.n = matrix.getColumnDimension(); // @private  Row and column dimension (square matrix).
    const n = this.n;
    this.V = new ArrayType(n * n); // @private Array for internal storage of eigenvectors.

    // Arrays for internal storage of eigenvalues.
    this.d = new ArrayType(n); // @private
    this.e = new ArrayType(n); // @private

    this.issymmetric = true;
    for (j = 0; j < n && this.issymmetric; j++) {
      for (i = 0; i < n && this.issymmetric; i++) {
        this.issymmetric = A[i * this.n + j] === A[j * this.n + i];
      }
    }
    if (this.issymmetric) {
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          this.V[i * this.n + j] = A[i * this.n + j];
        }
      }

      // Tridiagonalize.
      this.tred2();

      // Diagonalize.
      this.tql2();
    } else {
      this.H = new ArrayType(n * n); // Array for internal storage of nonsymmetric Hessenberg form.
      this.ort = new ArrayType(n); // // Working storage for nonsymmetric algorithm.

      for (j = 0; j < n; j++) {
        for (i = 0; i < n; i++) {
          this.H[i * this.n + j] = A[i * this.n + j];
        }
      }

      // Reduce to Hessenberg form.
      this.orthes();

      // Reduce Hessenberg to real Schur form.
      this.hqr2();
    }
  }

  /**
   * Returns a square array of all eigenvectors arranged in a columnar format
   * @public
   * @returns {ArrayType.<number>} - a n*n matrix
   */
  getV() {
    return this.V.copy();
  }

  /**
   * Returns an array that contains the real part of the eigenvalues
   * @public
   * @returns {ArrayType.<number>} - a one dimensional array
   */
  getRealEigenvalues() {
    return this.d;
  }

  /**
   * Returns an array that contains the imaginary parts of the eigenvalues
   * @public
   * @returns {ArrayType.<number>} - a one dimensional array
   */
  getImagEigenvalues() {
    return this.e;
  }

  /**
   * Return the block diagonal eigenvalue matrix
   * @public
   * @returns {Matrix} - a n * n matrix
   */
  getD() {
    const n = this.n;
    const d = this.d;
    const e = this.e;
    const X = new Matrix(n, n);
    const D = X.entries;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        D[i * this.n + j] = 0.0;
      }
      D[i * this.n + i] = d[i];
      if (e[i] > 0) {
        D[i * this.n + i + 1] = e[i];
      } else if (e[i] < 0) {
        D[i * this.n + i - 1] = e[i];
      }
    }
    return X;
  }

  /**
   * Symmetric Householder reduction to tridiagonal form.
   * @private
   */
  tred2() {
    const n = this.n;
    const V = this.V;
    const d = this.d;
    const e = this.e;
    let i;
    let j;
    let k;
    let f;
    let g;
    let h;

    //  This is derived from the Algol procedures tred2 by
    //  Bowdler, Martin, Reinsch, and Wilkinson, Handbook for
    //  Auto. Comp., Vol.ii-Linear Algebra, and the corresponding
    //  Fortran subroutine in EISPACK.

    for (j = 0; j < n; j++) {
      d[j] = V[(n - 1) * n + j];
    }

    // Householder reduction to tridiagonal form.

    for (i = n - 1; i > 0; i--) {
      // Scale to avoid under/overflow.

      let scale = 0.0;
      h = 0.0;
      for (k = 0; k < i; k++) {
        scale = scale + Math.abs(d[k]);
      }
      if (scale === 0.0) {
        e[i] = d[i - 1];
        for (j = 0; j < i; j++) {
          d[j] = V[(i - 1) * n + j];
          V[i * this.n + j] = 0.0;
          V[j * this.n + i] = 0.0;
        }
      } else {
        // Generate Householder vector.

        for (k = 0; k < i; k++) {
          d[k] /= scale;
          h += d[k] * d[k];
        }
        f = d[i - 1];
        g = Math.sqrt(h);
        if (f > 0) {
          g = -g;
        }
        e[i] = scale * g;
        h = h - f * g;
        d[i - 1] = f - g;
        for (j = 0; j < i; j++) {
          e[j] = 0.0;
        }

        // Apply similarity transformation to remaining columns.

        for (j = 0; j < i; j++) {
          f = d[j];
          V[j * this.n + i] = f;
          g = e[j] + V[j * n + j] * f;
          for (k = j + 1; k <= i - 1; k++) {
            g += V[k * n + j] * d[k];
            e[k] += V[k * n + j] * f;
          }
          e[j] = g;
        }
        f = 0.0;
        for (j = 0; j < i; j++) {
          e[j] /= h;
          f += e[j] * d[j];
        }
        const hh = f / (h + h);
        for (j = 0; j < i; j++) {
          e[j] -= hh * d[j];
        }
        for (j = 0; j < i; j++) {
          f = d[j];
          g = e[j];
          for (k = j; k <= i - 1; k++) {
            V[k * n + j] -= f * e[k] + g * d[k];
          }
          d[j] = V[(i - 1) * n + j];
          V[i * this.n + j] = 0.0;
        }
      }
      d[i] = h;
    }

    // Accumulate transformations.

    for (i = 0; i < n - 1; i++) {
      V[(n - 1) * n + i] = V[i * n + i];
      V[i * n + i] = 1.0;
      h = d[i + 1];
      if (h !== 0.0) {
        for (k = 0; k <= i; k++) {
          d[k] = V[k * n + (i + 1)] / h;
        }
        for (j = 0; j <= i; j++) {
          g = 0.0;
          for (k = 0; k <= i; k++) {
            g += V[k * n + (i + 1)] * V[k * n + j];
          }
          for (k = 0; k <= i; k++) {
            V[k * n + j] -= g * d[k];
          }
        }
      }
      for (k = 0; k <= i; k++) {
        V[k * n + (i + 1)] = 0.0;
      }
    }
    for (j = 0; j < n; j++) {
      d[j] = V[(n - 1) * n + j];
      V[(n - 1) * n + j] = 0.0;
    }
    V[(n - 1) * n + (n - 1)] = 1.0;
    e[0] = 0.0;
  }

  /**
   * Symmetric tridiagonal QL algorithm.
   * @private
   */
  tql2() {
    const n = this.n;
    const V = this.V;
    const d = this.d;
    const e = this.e;
    let i;
    let j;
    let k;
    let l;
    let g;
    let p;
    let iter;

    //  This is derived from the Algol procedures tql2, by
    //  Bowdler, Martin, Reinsch, and Wilkinson, Handbook for
    //  Auto. Comp., Vol.ii-Linear Algebra, and the corresponding
    //  Fortran subroutine in EISPACK.

    for (i = 1; i < n; i++) {
      e[i - 1] = e[i];
    }
    e[n - 1] = 0.0;
    let f = 0.0;
    let tst1 = 0.0;
    const eps = Math.pow(2.0, -52.0);
    for (l = 0; l < n; l++) {
      // Find small subdiagonal element

      tst1 = Math.max(tst1, Math.abs(d[l]) + Math.abs(e[l]));
      let m = l;
      while (m < n) {
        if (Math.abs(e[m]) <= eps * tst1) {
          break;
        }
        m++;
      }

      // If m === l, d[l] is an eigenvalue,
      // otherwise, iterate.

      if (m > l) {
        iter = 0;
        do {
          iter = iter + 1; // (Could check iteration count here.)

          // Compute implicit shift

          g = d[l];
          p = (d[l + 1] - g) / (2.0 * e[l]);
          let r = Matrix.hypot(p, 1.0);
          if (p < 0) {
            r = -r;
          }
          d[l] = e[l] / (p + r);
          d[l + 1] = e[l] * (p + r);
          const dl1 = d[l + 1];
          let h = g - d[l];
          for (i = l + 2; i < n; i++) {
            d[i] -= h;
          }
          f = f + h;

          // Implicit QL transformation.

          p = d[m];
          let c = 1.0;
          let c2 = c;
          let c3 = c;
          const el1 = e[l + 1];
          let s = 0.0;
          let s2 = 0.0;
          for (i = m - 1; i >= l; i--) {
            c3 = c2;
            c2 = c;
            s2 = s;
            g = c * e[i];
            h = c * p;
            r = Matrix.hypot(p, e[i]);
            e[i + 1] = s * r;
            s = e[i] / r;
            c = p / r;
            p = c * d[i] - s * g;
            d[i + 1] = h + s * (c * g + s * d[i]);

            // Accumulate transformation.

            for (k = 0; k < n; k++) {
              h = V[k * n + (i + 1)];
              V[k * n + (i + 1)] = s * V[k * n + i] + c * h;
              V[k * n + i] = c * V[k * n + i] - s * h;
            }
          }
          p = -s * s2 * c3 * el1 * e[l] / dl1;
          e[l] = s * p;
          d[l] = c * p;

          // Check for convergence.
        } while (Math.abs(e[l]) > eps * tst1);
      }
      d[l] = d[l] + f;
      e[l] = 0.0;
    }

    // Sort eigenvalues and corresponding vectors.

    for (i = 0; i < n - 1; i++) {
      k = i;
      p = d[i];
      for (j = i + 1; j < n; j++) {
        if (d[j] < p) {
          k = j;
          p = d[j];
        }
      }
      if (k !== i) {
        d[k] = d[i];
        d[i] = p;
        for (j = 0; j < n; j++) {
          p = V[j * this.n + i];
          V[j * this.n + i] = V[j * n + k];
          V[j * n + k] = p;
        }
      }
    }
  }

  /**
   *  Nonsymmetric reduction to Hessenberg form.
   *  @private
   */
  orthes() {
    const n = this.n;
    const V = this.V;
    const H = this.H;
    const ort = this.ort;
    let i;
    let j;
    let m;
    let f;
    let g;

    //  This is derived from the Algol procedures orthes and ortran,
    //  by Martin and Wilkinson, Handbook for Auto. Comp.,
    //  Vol.ii-Linear Algebra, and the corresponding
    //  Fortran subroutines in EISPACK.

    const low = 0;
    const high = n - 1;
    for (m = low + 1; m <= high - 1; m++) {
      // Scale column.

      let scale = 0.0;
      for (i = m; i <= high; i++) {
        scale = scale + Math.abs(H[i * n + (m - 1)]);
      }
      if (scale !== 0.0) {
        // Compute Householder transformation.

        let h = 0.0;
        for (i = high; i >= m; i--) {
          ort[i] = H[i * n + (m - 1)] / scale;
          h += ort[i] * ort[i];
        }
        g = Math.sqrt(h);
        if (ort[m] > 0) {
          g = -g;
        }
        h = h - ort[m] * g;
        ort[m] = ort[m] - g;

        // Apply Householder similarity transformation
        // H = (I-u*u'/h)*H*(I-u*u')/h)

        for (j = m; j < n; j++) {
          f = 0.0;
          for (i = high; i >= m; i--) {
            f += ort[i] * H[i * this.n + j];
          }
          f = f / h;
          for (i = m; i <= high; i++) {
            H[i * this.n + j] -= f * ort[i];
          }
        }
        for (i = 0; i <= high; i++) {
          f = 0.0;
          for (j = high; j >= m; j--) {
            f += ort[j] * H[i * this.n + j];
          }
          f = f / h;
          for (j = m; j <= high; j++) {
            H[i * this.n + j] -= f * ort[j];
          }
        }
        ort[m] = scale * ort[m];
        H[m * n + (m - 1)] = scale * g;
      }
    }

    // Accumulate transformations (Algol's ortran).

    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        V[i * this.n + j] = i === j ? 1.0 : 0.0;
      }
    }
    for (m = high - 1; m >= low + 1; m--) {
      if (H[m * n + (m - 1)] !== 0.0) {
        for (i = m + 1; i <= high; i++) {
          ort[i] = H[i * n + (m - 1)];
        }
        for (j = m; j <= high; j++) {
          g = 0.0;
          for (i = m; i <= high; i++) {
            g += ort[i] * V[i * this.n + j];
          }
          // Double division avoids possible underflow
          g = g / ort[m] / H[m * n + (m - 1)];
          for (i = m; i <= high; i++) {
            V[i * this.n + j] += g * ort[i];
          }
        }
      }
    }
  }

  /**
   * Complex scalar division.
   * @private
   *
   * @param {*} xr
   * @param {*} xi
   * @param {*} yr
   * @param {*} yi
   */
  cdiv(xr, xi, yr, yi) {
    let r;
    let d;
    if (Math.abs(yr) > Math.abs(yi)) {
      r = yi / yr;
      d = yr + r * yi;
      this.cdivr = (xr + r * xi) / d;
      this.cdivi = (xi - r * xr) / d;
    } else {
      r = yr / yi;
      d = yi + r * yr;
      this.cdivr = (r * xr + xi) / d;
      this.cdivi = (r * xi - xr) / d;
    }
  }

  /**
   * This methods finds the eigenvalues and eigenvectors
   * of a real upper hessenberg matrix by the QR algorithm
   *
   * Nonsymmetric reduction from Hessenberg to real Schur form.
   * https://en.wikipedia.org/wiki/QR_algorithm
   *
   * @private
   */
  hqr2() {
    let n;
    const V = this.V;
    const d = this.d;
    const e = this.e;
    const H = this.H;
    let i;
    let j;
    let k;
    let l;
    let m;
    let iter;

    //  This is derived from the Algol procedure hqr2,
    //  by Martin and Wilkinson, Handbook for Auto. Comp.,
    //  Vol.ii-Linear Algebra, and the corresponding
    //  Fortran subroutine in EISPACK.

    // Initialize

    const nn = this.n;
    n = nn - 1;
    const low = 0;
    const high = nn - 1;
    const eps = Math.pow(2.0, -52.0);
    let exshift = 0.0;
    let p = 0;
    let q = 0;
    let r = 0;
    let s = 0;
    let z = 0;
    let t;
    let w;
    let x;
    let y;

    // Store roots isolated by balanc and compute matrix norm

    let norm = 0.0;
    for (i = 0; i < nn; i++) {
      if (i < low || i > high) {
        d[i] = H[i * n + i];
        e[i] = 0.0;
      }
      for (j = Math.max(i - 1, 0); j < nn; j++) {
        norm = norm + Math.abs(H[i * this.n + j]);
      }
    }

    // Outer loop over eigenvalue index

    iter = 0;
    while (n >= low) {
      // Look for single small sub-diagonal element

      l = n;
      while (l > low) {
        s = Math.abs(H[(l - 1) * n + (l - 1)]) + Math.abs(H[l * n + l]);
        if (s === 0.0) {
          s = norm;
        }
        if (Math.abs(H[l * n + (l - 1)]) < eps * s) {
          break;
        }
        l--;
      }

      // Check for convergence
      // One root found

      if (l === n) {
        H[n * n + n] = H[n * n + n] + exshift;
        d[n] = H[n * n + n];
        e[n] = 0.0;
        n--;
        iter = 0;

        // Two roots found
      } else if (l === n - 1) {
        w = H[n * n + n - 1] * H[(n - 1) * n + n];
        p = (H[(n - 1) * n + (n - 1)] - H[n * n + n]) / 2.0;
        q = p * p + w;
        z = Math.sqrt(Math.abs(q));
        H[n * n + n] = H[n * n + n] + exshift;
        H[(n - 1) * n + (n - 1)] = H[(n - 1) * n + (n - 1)] + exshift;
        x = H[n * n + n];

        // Real pair

        if (q >= 0) {
          if (p >= 0) {
            z = p + z;
          } else {
            z = p - z;
          }
          d[n - 1] = x + z;
          d[n] = d[n - 1];
          if (z !== 0.0) {
            d[n] = x - w / z;
          }
          e[n - 1] = 0.0;
          e[n] = 0.0;
          x = H[n * n + n - 1];
          s = Math.abs(x) + Math.abs(z);
          p = x / s;
          q = z / s;
          r = Math.sqrt(p * p + q * q);
          p = p / r;
          q = q / r;

          // Row modification

          for (j = n - 1; j < nn; j++) {
            z = H[(n - 1) * n + j];
            H[(n - 1) * n + j] = q * z + p * H[n * n + j];
            H[n * n + j] = q * H[n * n + j] - p * z;
          }

          // Column modification

          for (i = 0; i <= n; i++) {
            z = H[i * n + n - 1];
            H[i * n + n - 1] = q * z + p * H[i * n + n];
            H[i * n + n] = q * H[i * n + n] - p * z;
          }

          // Accumulate transformations

          for (i = low; i <= high; i++) {
            z = V[i * n + n - 1];
            V[i * n + n - 1] = q * z + p * V[i * n + n];
            V[i * n + n] = q * V[i * n + n] - p * z;
          }

          // Complex pair
        } else {
          d[n - 1] = x + p;
          d[n] = x + p;
          e[n - 1] = z;
          e[n] = -z;
        }
        n = n - 2;
        iter = 0;

        // No convergence yet
      } else {
        // Form shift

        x = H[n * n + n];
        y = 0.0;
        w = 0.0;
        if (l < n) {
          y = H[(n - 1) * n + (n - 1)];
          w = H[n * n + n - 1] * H[(n - 1) * n + n];
        }

        // Wilkinson's original ad hoc shift

        if (iter === 10) {
          exshift += x;
          for (i = low; i <= n; i++) {
            H[i * n + i] -= x;
          }
          s = Math.abs(H[n * n + n - 1]) + Math.abs(H[(n - 1) * n + n - 2]);
          x = y = 0.75 * s;
          w = -0.4375 * s * s;
        }

        // MATLAB's new ad hoc shift

        if (iter === 30) {
          s = (y - x) / 2.0;
          s = s * s + w;
          if (s > 0) {
            s = Math.sqrt(s);
            if (y < x) {
              s = -s;
            }
            s = x - w / ((y - x) / 2.0 + s);
            for (i = low; i <= n; i++) {
              H[i * n + i] -= s;
            }
            exshift += s;
            x = y = w = 0.964;
          }
        }
        iter = iter + 1; // (Could check iteration count here.)

        // Look for two consecutive small sub-diagonal elements

        m = n - 2;
        while (m >= l) {
          z = H[m * n + m];
          r = x - z;
          s = y - z;
          p = (r * s - w) / H[(m + 1) * n + m] + H[m * n + m + 1];
          q = H[(m + 1) * n + m + 1] - z - r - s;
          r = H[(m + 2) * n + m + 1];
          s = Math.abs(p) + Math.abs(q) + Math.abs(r);
          p = p / s;
          q = q / s;
          r = r / s;
          if (m === l) {
            break;
          }
          if (Math.abs(H[m * n + (m - 1)]) * (Math.abs(q) + Math.abs(r)) < eps * (Math.abs(p) * (Math.abs(H[(m - 1) * n + m - 1]) + Math.abs(z) + Math.abs(H[(m + 1) * n + m + 1])))) {
            break;
          }
          m--;
        }
        for (i = m + 2; i <= n; i++) {
          H[i * n + i - 2] = 0.0;
          if (i > m + 2) {
            H[i * n + i - 3] = 0.0;
          }
        }

        // Double QR step involving rows l:n and columns m:n

        for (k = m; k <= n - 1; k++) {
          const notlast = k !== n - 1;
          if (k !== m) {
            p = H[k * n + k - 1];
            q = H[(k + 1) * n + k - 1];
            r = notlast ? H[(k + 2) * n + k - 1] : 0.0;
            x = Math.abs(p) + Math.abs(q) + Math.abs(r);
            if (x !== 0.0) {
              p = p / x;
              q = q / x;
              r = r / x;
            }
          }
          if (x === 0.0) {
            break;
          }
          s = Math.sqrt(p * p + q * q + r * r);
          if (p < 0) {
            s = -s;
          }
          if (s !== 0) {
            if (k !== m) {
              H[k * n + k - 1] = -s * x;
            } else if (l !== m) {
              H[k * n + k - 1] = -H[k * n + k - 1];
            }
            p = p + s;
            x = p / s;
            y = q / s;
            z = r / s;
            q = q / p;
            r = r / p;

            // Row modification

            for (j = k; j < nn; j++) {
              p = H[k * n + j] + q * H[(k + 1) * n + j];
              if (notlast) {
                p = p + r * H[(k + 2) * n + j];
                H[(k + 2) * n + j] = H[(k + 2) * n + j] - p * z;
              }
              H[k * n + j] = H[k * n + j] - p * x;
              H[(k + 1) * n + j] = H[(k + 1) * n + j] - p * y;
            }

            // Column modification

            for (i = 0; i <= Math.min(n, k + 3); i++) {
              p = x * H[i * n + k] + y * H[i * n + k + 1];
              if (notlast) {
                p = p + z * H[i * n + k + 2];
                H[i * n + k + 2] = H[i * n + k + 2] - p * r;
              }
              H[i * n + k] = H[i * n + k] - p;
              H[i * n + k + 1] = H[i * n + k + 1] - p * q;
            }

            // Accumulate transformations

            for (i = low; i <= high; i++) {
              p = x * V[i * n + k] + y * V[i * n + k + 1];
              if (notlast) {
                p = p + z * V[i * n + k + 2];
                V[i * n + k + 2] = V[i * n + k + 2] - p * r;
              }
              V[i * n + k] = V[i * n + k] - p;
              V[i * n + k + 1] = V[i * n + k + 1] - p * q;
            }
          } // (s !== 0)
        } // k loop
      } // check convergence
    } // while (n >= low)

    // Backsubstitute to find vectors of upper triangular form

    if (norm === 0.0) {
      return;
    }
    for (n = nn - 1; n >= 0; n--) {
      p = d[n];
      q = e[n];

      // Real vector

      if (q === 0) {
        l = n;
        H[n * n + n] = 1.0;
        for (i = n - 1; i >= 0; i--) {
          w = H[i * n + i] - p;
          r = 0.0;
          for (j = l; j <= n; j++) {
            r = r + H[i * this.n + j] * H[j * n + n];
          }
          if (e[i] < 0.0) {
            z = w;
            s = r;
          } else {
            l = i;
            if (e[i] === 0.0) {
              if (w !== 0.0) {
                H[i * n + n] = -r / w;
              } else {
                H[i * n + n] = -r / (eps * norm);
              }

              // Solve real equations
            } else {
              x = H[i * n + i + 1];
              y = H[(i + 1) * n + i];
              q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
              t = (x * s - z * r) / q;
              H[i * n + n] = t;
              if (Math.abs(x) > Math.abs(z)) {
                H[(i + 1) * n + n] = (-r - w * t) / x;
              } else {
                H[(i + 1) * n + n] = (-s - y * t) / z;
              }
            }

            // Overflow control

            t = Math.abs(H[i * n + n]);
            if (eps * t * t > 1) {
              for (j = i; j <= n; j++) {
                H[j * n + n] = H[j * n + n] / t;
              }
            }
          }
        }

        // Complex vector
      } else if (q < 0) {
        l = n - 1;

        // Last vector component imaginary so matrix is triangular

        if (Math.abs(H[n * n + n - 1]) > Math.abs(H[(n - 1) * n + n])) {
          H[(n - 1) * n + (n - 1)] = q / H[n * n + n - 1];
          H[(n - 1) * n + n] = -(H[n * n + n] - p) / H[n * n + n - 1];
        } else {
          this.cdiv(0.0, -H[(n - 1) * n + n], H[(n - 1) * n + (n - 1)] - p, q);
          H[(n - 1) * n + (n - 1)] = this.cdivr;
          H[(n - 1) * n + n] = this.cdivi;
        }
        H[n * n + n - 1] = 0.0;
        H[n * n + n] = 1.0;
        for (i = n - 2; i >= 0; i--) {
          let ra;
          let sa;
          let vr;
          let vi;
          ra = 0.0;
          sa = 0.0;
          for (j = l; j <= n; j++) {
            ra = ra + H[i * this.n + j] * H[j * n + n - 1];
            sa = sa + H[i * this.n + j] * H[j * n + n];
          }
          w = H[i * n + i] - p;
          if (e[i] < 0.0) {
            z = w;
            r = ra;
            s = sa;
          } else {
            l = i;
            if (e[i] === 0) {
              this.cdiv(-ra, -sa, w, q);
              H[i * n + n - 1] = this.cdivr;
              H[i * n + n] = this.cdivi;
            } else {
              // Solve complex equations

              x = H[i * n + i + 1];
              y = H[(i + 1) * n + i];
              vr = (d[i] - p) * (d[i] - p) + e[i] * e[i] - q * q;
              vi = (d[i] - p) * 2.0 * q;
              if (vr === 0.0 && vi === 0.0) {
                vr = eps * norm * (Math.abs(w) + Math.abs(q) + Math.abs(x) + Math.abs(y) + Math.abs(z));
              }
              this.cdiv(x * r - z * ra + q * sa, x * s - z * sa - q * ra, vr, vi);
              H[i * n + n - 1] = this.cdivr;
              H[i * n + n] = this.cdivi;
              if (Math.abs(x) > Math.abs(z) + Math.abs(q)) {
                H[(i + 1) * n + n - 1] = (-ra - w * H[i * n + n - 1] + q * H[i * n + n]) / x;
                H[(i + 1) * n + n] = (-sa - w * H[i * n + n] - q * H[i * n + n - 1]) / x;
              } else {
                this.cdiv(-r - y * H[i * n + n - 1], -s - y * H[i * n + n], z, q);
                H[(i + 1) * n + n - 1] = this.cdivr;
                H[(i + 1) * n + n] = this.cdivi;
              }
            }

            // Overflow control
            t = Math.max(Math.abs(H[i * n + n - 1]), Math.abs(H[i * n + n]));
            if (eps * t * t > 1) {
              for (j = i; j <= n; j++) {
                H[j * n + n - 1] = H[j * n + n - 1] / t;
                H[j * n + n] = H[j * n + n] / t;
              }
            }
          }
        }
      }
    }

    // Vectors of isolated roots
    for (i = 0; i < nn; i++) {
      if (i < low || i > high) {
        for (j = i; j < nn; j++) {
          V[i * this.n + j] = H[i * this.n + j];
        }
      }
    }

    // Back transformation to get eigenvectors of original matrix
    for (j = nn - 1; j >= low; j--) {
      for (i = low; i <= high; i++) {
        z = 0.0;
        for (k = low; k <= Math.min(j, high); k++) {
          z = z + V[i * n + k] * H[k * n + j];
        }
        V[i * this.n + j] = z;
      }
    }
  }
}
dot.register('EigenvalueDecomposition', EigenvalueDecomposition);
export default EigenvalueDecomposition;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3QiLCJNYXRyaXgiLCJBcnJheVR5cGUiLCJ3aW5kb3ciLCJGbG9hdDY0QXJyYXkiLCJBcnJheSIsIkVpZ2VudmFsdWVEZWNvbXBvc2l0aW9uIiwiY29uc3RydWN0b3IiLCJtYXRyaXgiLCJpIiwiaiIsIkEiLCJlbnRyaWVzIiwibiIsImdldENvbHVtbkRpbWVuc2lvbiIsIlYiLCJkIiwiZSIsImlzc3ltbWV0cmljIiwidHJlZDIiLCJ0cWwyIiwiSCIsIm9ydCIsIm9ydGhlcyIsImhxcjIiLCJnZXRWIiwiY29weSIsImdldFJlYWxFaWdlbnZhbHVlcyIsImdldEltYWdFaWdlbnZhbHVlcyIsImdldEQiLCJYIiwiRCIsImsiLCJmIiwiZyIsImgiLCJzY2FsZSIsIk1hdGgiLCJhYnMiLCJzcXJ0IiwiaGgiLCJsIiwicCIsIml0ZXIiLCJ0c3QxIiwiZXBzIiwicG93IiwibWF4IiwibSIsInIiLCJoeXBvdCIsImRsMSIsImMiLCJjMiIsImMzIiwiZWwxIiwicyIsInMyIiwibG93IiwiaGlnaCIsImNkaXYiLCJ4ciIsInhpIiwieXIiLCJ5aSIsImNkaXZyIiwiY2RpdmkiLCJubiIsImV4c2hpZnQiLCJxIiwieiIsInQiLCJ3IiwieCIsInkiLCJub3JtIiwibm90bGFzdCIsIm1pbiIsInJhIiwic2EiLCJ2ciIsInZpIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFaWdlbnZhbHVlRGVjb21wb3NpdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFaWdlbnN5c3RlbSBkZWNvbXBvc2l0aW9uLCBiYXNlZCBvbiBKYW1hIChodHRwOi8vbWF0aC5uaXN0Lmdvdi9qYXZhbnVtZXJpY3MvamFtYS8pXHJcbiAqXHJcbiAqIEVpZ2VudmFsdWVzIGFuZCBlaWdlbnZlY3RvcnMgb2YgYSByZWFsIG1hdHJpeC5cclxuICogPFA+XHJcbiAqIElmIEEgaXMgc3ltbWV0cmljLCB0aGVuIEEgPSBWKkQqVicgd2hlcmUgdGhlIGVpZ2VudmFsdWUgbWF0cml4IEQgaXNcclxuICogZGlhZ29uYWwgYW5kIHRoZSBlaWdlbnZlY3RvciBtYXRyaXggViBpcyBvcnRob2dvbmFsLlxyXG4gKiBJLmUuIEEgPSBWLnRpbWVzKEQudGltZXMoVi50cmFuc3Bvc2UoKSkpIGFuZFxyXG4gKiBWLnRpbWVzKFYudHJhbnNwb3NlKCkpIGVxdWFscyB0aGUgaWRlbnRpdHkgbWF0cml4LlxyXG4gKiA8UD5cclxuICogSWYgQSBpcyBub3Qgc3ltbWV0cmljLCB0aGVuIHRoZSBlaWdlbnZhbHVlIG1hdHJpeCBEIGlzIGJsb2NrIGRpYWdvbmFsXHJcbiAqIHdpdGggdGhlIHJlYWwgZWlnZW52YWx1ZXMgaW4gMS1ieS0xIGJsb2NrcyBhbmQgYW55IGNvbXBsZXggZWlnZW52YWx1ZXMsXHJcbiAqIGxhbWJkYSArIGkqbXUsIGluIDItYnktMiBibG9ja3MsIFtsYW1iZGEsIG11OyAtbXUsIGxhbWJkYV0uICBUaGVcclxuICogY29sdW1ucyBvZiBWIHJlcHJlc2VudCB0aGUgZWlnZW52ZWN0b3JzIGluIHRoZSBzZW5zZSB0aGF0IEEqViA9IFYqRCxcclxuICogaS5lLiBBLnRpbWVzKFYpIGVxdWFscyBWLnRpbWVzKEQpLiAgVGhlIG1hdHJpeCBWIG1heSBiZSBiYWRseVxyXG4gKiBjb25kaXRpb25lZCwgb3IgZXZlbiBzaW5ndWxhciwgc28gdGhlIHZhbGlkaXR5IG9mIHRoZSBlcXVhdGlvblxyXG4gKiBBID0gVipEKmludmVyc2UoVikgZGVwZW5kcyB1cG9uIFYuY29uZCgpLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XHJcbmltcG9ydCBNYXRyaXggZnJvbSAnLi9NYXRyaXguanMnO1xyXG5cclxuY29uc3QgQXJyYXlUeXBlID0gd2luZG93LkZsb2F0NjRBcnJheSB8fCBBcnJheTtcclxuXHJcbmNsYXNzIEVpZ2VudmFsdWVEZWNvbXBvc2l0aW9uIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4IC0gbXVzdCBiZSBhIHNxdWFyZSBtYXRyaXhcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbWF0cml4ICkge1xyXG4gICAgbGV0IGk7XHJcbiAgICBsZXQgajtcclxuXHJcbiAgICBjb25zdCBBID0gbWF0cml4LmVudHJpZXM7XHJcbiAgICB0aGlzLm4gPSBtYXRyaXguZ2V0Q29sdW1uRGltZW5zaW9uKCk7IC8vIEBwcml2YXRlICBSb3cgYW5kIGNvbHVtbiBkaW1lbnNpb24gKHNxdWFyZSBtYXRyaXgpLlxyXG4gICAgY29uc3QgbiA9IHRoaXMubjtcclxuICAgIHRoaXMuViA9IG5ldyBBcnJheVR5cGUoIG4gKiBuICk7IC8vIEBwcml2YXRlIEFycmF5IGZvciBpbnRlcm5hbCBzdG9yYWdlIG9mIGVpZ2VudmVjdG9ycy5cclxuXHJcbiAgICAvLyBBcnJheXMgZm9yIGludGVybmFsIHN0b3JhZ2Ugb2YgZWlnZW52YWx1ZXMuXHJcbiAgICB0aGlzLmQgPSBuZXcgQXJyYXlUeXBlKCBuICk7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmUgPSBuZXcgQXJyYXlUeXBlKCBuICk7IC8vIEBwcml2YXRlXHJcblxyXG4gICAgdGhpcy5pc3N5bW1ldHJpYyA9IHRydWU7XHJcbiAgICBmb3IgKCBqID0gMDsgKCBqIDwgbiApICYmIHRoaXMuaXNzeW1tZXRyaWM7IGorKyApIHtcclxuICAgICAgZm9yICggaSA9IDA7ICggaSA8IG4gKSAmJiB0aGlzLmlzc3ltbWV0cmljOyBpKysgKSB7XHJcbiAgICAgICAgdGhpcy5pc3N5bW1ldHJpYyA9ICggQVsgaSAqIHRoaXMubiArIGogXSA9PT0gQVsgaiAqIHRoaXMubiArIGkgXSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLmlzc3ltbWV0cmljICkge1xyXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IG47IGkrKyApIHtcclxuICAgICAgICBmb3IgKCBqID0gMDsgaiA8IG47IGorKyApIHtcclxuICAgICAgICAgIHRoaXMuVlsgaSAqIHRoaXMubiArIGogXSA9IEFbIGkgKiB0aGlzLm4gKyBqIF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUcmlkaWFnb25hbGl6ZS5cclxuICAgICAgdGhpcy50cmVkMigpO1xyXG5cclxuICAgICAgLy8gRGlhZ29uYWxpemUuXHJcbiAgICAgIHRoaXMudHFsMigpO1xyXG5cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLkggPSBuZXcgQXJyYXlUeXBlKCBuICogbiApOyAvLyBBcnJheSBmb3IgaW50ZXJuYWwgc3RvcmFnZSBvZiBub25zeW1tZXRyaWMgSGVzc2VuYmVyZyBmb3JtLlxyXG4gICAgICB0aGlzLm9ydCA9IG5ldyBBcnJheVR5cGUoIG4gKTsgLy8gLy8gV29ya2luZyBzdG9yYWdlIGZvciBub25zeW1tZXRyaWMgYWxnb3JpdGhtLlxyXG5cclxuICAgICAgZm9yICggaiA9IDA7IGogPCBuOyBqKysgKSB7XHJcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBuOyBpKysgKSB7XHJcbiAgICAgICAgICB0aGlzLkhbIGkgKiB0aGlzLm4gKyBqIF0gPSBBWyBpICogdGhpcy5uICsgaiBdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUmVkdWNlIHRvIEhlc3NlbmJlcmcgZm9ybS5cclxuICAgICAgdGhpcy5vcnRoZXMoKTtcclxuXHJcbiAgICAgIC8vIFJlZHVjZSBIZXNzZW5iZXJnIHRvIHJlYWwgU2NodXIgZm9ybS5cclxuICAgICAgdGhpcy5ocXIyKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHNxdWFyZSBhcnJheSBvZiBhbGwgZWlnZW52ZWN0b3JzIGFycmFuZ2VkIGluIGEgY29sdW1uYXIgZm9ybWF0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtBcnJheVR5cGUuPG51bWJlcj59IC0gYSBuKm4gbWF0cml4XHJcbiAgICovXHJcbiAgZ2V0VigpIHtcclxuICAgIHJldHVybiB0aGlzLlYuY29weSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSByZWFsIHBhcnQgb2YgdGhlIGVpZ2VudmFsdWVzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtBcnJheVR5cGUuPG51bWJlcj59IC0gYSBvbmUgZGltZW5zaW9uYWwgYXJyYXlcclxuICAgKi9cclxuICBnZXRSZWFsRWlnZW52YWx1ZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5kO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSBpbWFnaW5hcnkgcGFydHMgb2YgdGhlIGVpZ2VudmFsdWVzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtBcnJheVR5cGUuPG51bWJlcj59IC0gYSBvbmUgZGltZW5zaW9uYWwgYXJyYXlcclxuICAgKi9cclxuICBnZXRJbWFnRWlnZW52YWx1ZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIHRoZSBibG9jayBkaWFnb25hbCBlaWdlbnZhbHVlIG1hdHJpeFxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7TWF0cml4fSAtIGEgbiAqIG4gbWF0cml4XHJcbiAgICovXHJcbiAgZ2V0RCgpIHtcclxuICAgIGNvbnN0IG4gPSB0aGlzLm47XHJcbiAgICBjb25zdCBkID0gdGhpcy5kO1xyXG4gICAgY29uc3QgZSA9IHRoaXMuZTtcclxuXHJcbiAgICBjb25zdCBYID0gbmV3IE1hdHJpeCggbiwgbiApO1xyXG4gICAgY29uc3QgRCA9IFguZW50cmllcztcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG47IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgbjsgaisrICkge1xyXG4gICAgICAgIERbIGkgKiB0aGlzLm4gKyBqIF0gPSAwLjA7XHJcbiAgICAgIH1cclxuICAgICAgRFsgaSAqIHRoaXMubiArIGkgXSA9IGRbIGkgXTtcclxuICAgICAgaWYgKCBlWyBpIF0gPiAwICkge1xyXG4gICAgICAgIERbIGkgKiB0aGlzLm4gKyBpICsgMSBdID0gZVsgaSBdO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBlWyBpIF0gPCAwICkge1xyXG4gICAgICAgIERbIGkgKiB0aGlzLm4gKyBpIC0gMSBdID0gZVsgaSBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gWDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN5bW1ldHJpYyBIb3VzZWhvbGRlciByZWR1Y3Rpb24gdG8gdHJpZGlhZ29uYWwgZm9ybS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHRyZWQyKCkge1xyXG4gICAgY29uc3QgbiA9IHRoaXMubjtcclxuICAgIGNvbnN0IFYgPSB0aGlzLlY7XHJcbiAgICBjb25zdCBkID0gdGhpcy5kO1xyXG4gICAgY29uc3QgZSA9IHRoaXMuZTtcclxuICAgIGxldCBpO1xyXG4gICAgbGV0IGo7XHJcbiAgICBsZXQgaztcclxuICAgIGxldCBmO1xyXG4gICAgbGV0IGc7XHJcbiAgICBsZXQgaDtcclxuXHJcbiAgICAvLyAgVGhpcyBpcyBkZXJpdmVkIGZyb20gdGhlIEFsZ29sIHByb2NlZHVyZXMgdHJlZDIgYnlcclxuICAgIC8vICBCb3dkbGVyLCBNYXJ0aW4sIFJlaW5zY2gsIGFuZCBXaWxraW5zb24sIEhhbmRib29rIGZvclxyXG4gICAgLy8gIEF1dG8uIENvbXAuLCBWb2wuaWktTGluZWFyIEFsZ2VicmEsIGFuZCB0aGUgY29ycmVzcG9uZGluZ1xyXG4gICAgLy8gIEZvcnRyYW4gc3Vicm91dGluZSBpbiBFSVNQQUNLLlxyXG5cclxuICAgIGZvciAoIGogPSAwOyBqIDwgbjsgaisrICkge1xyXG4gICAgICBkWyBqIF0gPSBWWyAoIG4gLSAxICkgKiBuICsgaiBdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhvdXNlaG9sZGVyIHJlZHVjdGlvbiB0byB0cmlkaWFnb25hbCBmb3JtLlxyXG5cclxuICAgIGZvciAoIGkgPSBuIC0gMTsgaSA+IDA7IGktLSApIHtcclxuXHJcbiAgICAgIC8vIFNjYWxlIHRvIGF2b2lkIHVuZGVyL292ZXJmbG93LlxyXG5cclxuICAgICAgbGV0IHNjYWxlID0gMC4wO1xyXG4gICAgICBoID0gMC4wO1xyXG4gICAgICBmb3IgKCBrID0gMDsgayA8IGk7IGsrKyApIHtcclxuICAgICAgICBzY2FsZSA9IHNjYWxlICsgTWF0aC5hYnMoIGRbIGsgXSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggc2NhbGUgPT09IDAuMCApIHtcclxuICAgICAgICBlWyBpIF0gPSBkWyBpIC0gMSBdO1xyXG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgaTsgaisrICkge1xyXG4gICAgICAgICAgZFsgaiBdID0gVlsgKCBpIC0gMSApICogbiArIGogXTtcclxuICAgICAgICAgIFZbIGkgKiB0aGlzLm4gKyBqIF0gPSAwLjA7XHJcbiAgICAgICAgICBWWyBqICogdGhpcy5uICsgaSBdID0gMC4wO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gR2VuZXJhdGUgSG91c2Vob2xkZXIgdmVjdG9yLlxyXG5cclxuICAgICAgICBmb3IgKCBrID0gMDsgayA8IGk7IGsrKyApIHtcclxuICAgICAgICAgIGRbIGsgXSAvPSBzY2FsZTtcclxuICAgICAgICAgIGggKz0gZFsgayBdICogZFsgayBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmID0gZFsgaSAtIDEgXTtcclxuICAgICAgICBnID0gTWF0aC5zcXJ0KCBoICk7XHJcbiAgICAgICAgaWYgKCBmID4gMCApIHtcclxuICAgICAgICAgIGcgPSAtZztcclxuICAgICAgICB9XHJcbiAgICAgICAgZVsgaSBdID0gc2NhbGUgKiBnO1xyXG4gICAgICAgIGggPSBoIC0gZiAqIGc7XHJcbiAgICAgICAgZFsgaSAtIDEgXSA9IGYgLSBnO1xyXG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgaTsgaisrICkge1xyXG4gICAgICAgICAgZVsgaiBdID0gMC4wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwbHkgc2ltaWxhcml0eSB0cmFuc2Zvcm1hdGlvbiB0byByZW1haW5pbmcgY29sdW1ucy5cclxuXHJcbiAgICAgICAgZm9yICggaiA9IDA7IGogPCBpOyBqKysgKSB7XHJcbiAgICAgICAgICBmID0gZFsgaiBdO1xyXG4gICAgICAgICAgVlsgaiAqIHRoaXMubiArIGkgXSA9IGY7XHJcbiAgICAgICAgICBnID0gZVsgaiBdICsgVlsgaiAqIG4gKyBqIF0gKiBmO1xyXG4gICAgICAgICAgZm9yICggayA9IGogKyAxOyBrIDw9IGkgLSAxOyBrKysgKSB7XHJcbiAgICAgICAgICAgIGcgKz0gVlsgayAqIG4gKyBqIF0gKiBkWyBrIF07XHJcbiAgICAgICAgICAgIGVbIGsgXSArPSBWWyBrICogbiArIGogXSAqIGY7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlWyBqIF0gPSBnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmID0gMC4wO1xyXG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgaTsgaisrICkge1xyXG4gICAgICAgICAgZVsgaiBdIC89IGg7XHJcbiAgICAgICAgICBmICs9IGVbIGogXSAqIGRbIGogXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaGggPSBmIC8gKCBoICsgaCApO1xyXG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgaTsgaisrICkge1xyXG4gICAgICAgICAgZVsgaiBdIC09IGhoICogZFsgaiBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKCBqID0gMDsgaiA8IGk7IGorKyApIHtcclxuICAgICAgICAgIGYgPSBkWyBqIF07XHJcbiAgICAgICAgICBnID0gZVsgaiBdO1xyXG4gICAgICAgICAgZm9yICggayA9IGo7IGsgPD0gaSAtIDE7IGsrKyApIHtcclxuICAgICAgICAgICAgVlsgayAqIG4gKyBqIF0gLT0gKCBmICogZVsgayBdICsgZyAqIGRbIGsgXSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZFsgaiBdID0gVlsgKCBpIC0gMSApICogbiArIGogXTtcclxuICAgICAgICAgIFZbIGkgKiB0aGlzLm4gKyBqIF0gPSAwLjA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGRbIGkgXSA9IGg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWNjdW11bGF0ZSB0cmFuc2Zvcm1hdGlvbnMuXHJcblxyXG4gICAgZm9yICggaSA9IDA7IGkgPCBuIC0gMTsgaSsrICkge1xyXG4gICAgICBWWyAoIG4gLSAxICkgKiBuICsgaSBdID0gVlsgaSAqIG4gKyBpIF07XHJcbiAgICAgIFZbIGkgKiBuICsgaSBdID0gMS4wO1xyXG4gICAgICBoID0gZFsgaSArIDEgXTtcclxuICAgICAgaWYgKCBoICE9PSAwLjAgKSB7XHJcbiAgICAgICAgZm9yICggayA9IDA7IGsgPD0gaTsgaysrICkge1xyXG4gICAgICAgICAgZFsgayBdID0gVlsgayAqIG4gKyAoIGkgKyAxICkgXSAvIGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoIGogPSAwOyBqIDw9IGk7IGorKyApIHtcclxuICAgICAgICAgIGcgPSAwLjA7XHJcbiAgICAgICAgICBmb3IgKCBrID0gMDsgayA8PSBpOyBrKysgKSB7XHJcbiAgICAgICAgICAgIGcgKz0gVlsgayAqIG4gKyAoIGkgKyAxICkgXSAqIFZbIGsgKiBuICsgaiBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZm9yICggayA9IDA7IGsgPD0gaTsgaysrICkge1xyXG4gICAgICAgICAgICBWWyBrICogbiArIGogXSAtPSBnICogZFsgayBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBmb3IgKCBrID0gMDsgayA8PSBpOyBrKysgKSB7XHJcbiAgICAgICAgVlsgayAqIG4gKyAoIGkgKyAxICkgXSA9IDAuMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yICggaiA9IDA7IGogPCBuOyBqKysgKSB7XHJcbiAgICAgIGRbIGogXSA9IFZbICggbiAtIDEgKSAqIG4gKyBqIF07XHJcbiAgICAgIFZbICggbiAtIDEgKSAqIG4gKyBqIF0gPSAwLjA7XHJcbiAgICB9XHJcbiAgICBWWyAoIG4gLSAxICkgKiBuICsgKCBuIC0gMSApIF0gPSAxLjA7XHJcbiAgICBlWyAwIF0gPSAwLjA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTeW1tZXRyaWMgdHJpZGlhZ29uYWwgUUwgYWxnb3JpdGhtLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdHFsMigpIHtcclxuICAgIGNvbnN0IG4gPSB0aGlzLm47XHJcbiAgICBjb25zdCBWID0gdGhpcy5WO1xyXG4gICAgY29uc3QgZCA9IHRoaXMuZDtcclxuICAgIGNvbnN0IGUgPSB0aGlzLmU7XHJcbiAgICBsZXQgaTtcclxuICAgIGxldCBqO1xyXG4gICAgbGV0IGs7XHJcbiAgICBsZXQgbDtcclxuICAgIGxldCBnO1xyXG4gICAgbGV0IHA7XHJcbiAgICBsZXQgaXRlcjtcclxuXHJcbiAgICAvLyAgVGhpcyBpcyBkZXJpdmVkIGZyb20gdGhlIEFsZ29sIHByb2NlZHVyZXMgdHFsMiwgYnlcclxuICAgIC8vICBCb3dkbGVyLCBNYXJ0aW4sIFJlaW5zY2gsIGFuZCBXaWxraW5zb24sIEhhbmRib29rIGZvclxyXG4gICAgLy8gIEF1dG8uIENvbXAuLCBWb2wuaWktTGluZWFyIEFsZ2VicmEsIGFuZCB0aGUgY29ycmVzcG9uZGluZ1xyXG4gICAgLy8gIEZvcnRyYW4gc3Vicm91dGluZSBpbiBFSVNQQUNLLlxyXG5cclxuICAgIGZvciAoIGkgPSAxOyBpIDwgbjsgaSsrICkge1xyXG4gICAgICBlWyBpIC0gMSBdID0gZVsgaSBdO1xyXG4gICAgfVxyXG4gICAgZVsgbiAtIDEgXSA9IDAuMDtcclxuXHJcbiAgICBsZXQgZiA9IDAuMDtcclxuICAgIGxldCB0c3QxID0gMC4wO1xyXG4gICAgY29uc3QgZXBzID0gTWF0aC5wb3coIDIuMCwgLTUyLjAgKTtcclxuICAgIGZvciAoIGwgPSAwOyBsIDwgbjsgbCsrICkge1xyXG5cclxuICAgICAgLy8gRmluZCBzbWFsbCBzdWJkaWFnb25hbCBlbGVtZW50XHJcblxyXG4gICAgICB0c3QxID0gTWF0aC5tYXgoIHRzdDEsIE1hdGguYWJzKCBkWyBsIF0gKSArIE1hdGguYWJzKCBlWyBsIF0gKSApO1xyXG4gICAgICBsZXQgbSA9IGw7XHJcbiAgICAgIHdoaWxlICggbSA8IG4gKSB7XHJcbiAgICAgICAgaWYgKCBNYXRoLmFicyggZVsgbSBdICkgPD0gZXBzICogdHN0MSApIHtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtKys7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIG0gPT09IGwsIGRbbF0gaXMgYW4gZWlnZW52YWx1ZSxcclxuICAgICAgLy8gb3RoZXJ3aXNlLCBpdGVyYXRlLlxyXG5cclxuICAgICAgaWYgKCBtID4gbCApIHtcclxuICAgICAgICBpdGVyID0gMDtcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICBpdGVyID0gaXRlciArIDE7ICAvLyAoQ291bGQgY2hlY2sgaXRlcmF0aW9uIGNvdW50IGhlcmUuKVxyXG5cclxuICAgICAgICAgIC8vIENvbXB1dGUgaW1wbGljaXQgc2hpZnRcclxuXHJcbiAgICAgICAgICBnID0gZFsgbCBdO1xyXG4gICAgICAgICAgcCA9ICggZFsgbCArIDEgXSAtIGcgKSAvICggMi4wICogZVsgbCBdICk7XHJcbiAgICAgICAgICBsZXQgciA9IE1hdHJpeC5oeXBvdCggcCwgMS4wICk7XHJcbiAgICAgICAgICBpZiAoIHAgPCAwICkge1xyXG4gICAgICAgICAgICByID0gLXI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBkWyBsIF0gPSBlWyBsIF0gLyAoIHAgKyByICk7XHJcbiAgICAgICAgICBkWyBsICsgMSBdID0gZVsgbCBdICogKCBwICsgciApO1xyXG4gICAgICAgICAgY29uc3QgZGwxID0gZFsgbCArIDEgXTtcclxuICAgICAgICAgIGxldCBoID0gZyAtIGRbIGwgXTtcclxuICAgICAgICAgIGZvciAoIGkgPSBsICsgMjsgaSA8IG47IGkrKyApIHtcclxuICAgICAgICAgICAgZFsgaSBdIC09IGg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmID0gZiArIGg7XHJcblxyXG4gICAgICAgICAgLy8gSW1wbGljaXQgUUwgdHJhbnNmb3JtYXRpb24uXHJcblxyXG4gICAgICAgICAgcCA9IGRbIG0gXTtcclxuICAgICAgICAgIGxldCBjID0gMS4wO1xyXG4gICAgICAgICAgbGV0IGMyID0gYztcclxuICAgICAgICAgIGxldCBjMyA9IGM7XHJcbiAgICAgICAgICBjb25zdCBlbDEgPSBlWyBsICsgMSBdO1xyXG4gICAgICAgICAgbGV0IHMgPSAwLjA7XHJcbiAgICAgICAgICBsZXQgczIgPSAwLjA7XHJcbiAgICAgICAgICBmb3IgKCBpID0gbSAtIDE7IGkgPj0gbDsgaS0tICkge1xyXG4gICAgICAgICAgICBjMyA9IGMyO1xyXG4gICAgICAgICAgICBjMiA9IGM7XHJcbiAgICAgICAgICAgIHMyID0gcztcclxuICAgICAgICAgICAgZyA9IGMgKiBlWyBpIF07XHJcbiAgICAgICAgICAgIGggPSBjICogcDtcclxuICAgICAgICAgICAgciA9IE1hdHJpeC5oeXBvdCggcCwgZVsgaSBdICk7XHJcbiAgICAgICAgICAgIGVbIGkgKyAxIF0gPSBzICogcjtcclxuICAgICAgICAgICAgcyA9IGVbIGkgXSAvIHI7XHJcbiAgICAgICAgICAgIGMgPSBwIC8gcjtcclxuICAgICAgICAgICAgcCA9IGMgKiBkWyBpIF0gLSBzICogZztcclxuICAgICAgICAgICAgZFsgaSArIDEgXSA9IGggKyBzICogKCBjICogZyArIHMgKiBkWyBpIF0gKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFjY3VtdWxhdGUgdHJhbnNmb3JtYXRpb24uXHJcblxyXG4gICAgICAgICAgICBmb3IgKCBrID0gMDsgayA8IG47IGsrKyApIHtcclxuICAgICAgICAgICAgICBoID0gVlsgayAqIG4gKyAoIGkgKyAxICkgXTtcclxuICAgICAgICAgICAgICBWWyBrICogbiArICggaSArIDEgKSBdID0gcyAqIFZbIGsgKiBuICsgaSBdICsgYyAqIGg7XHJcbiAgICAgICAgICAgICAgVlsgayAqIG4gKyBpIF0gPSBjICogVlsgayAqIG4gKyBpIF0gLSBzICogaDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcCA9IC1zICogczIgKiBjMyAqIGVsMSAqIGVbIGwgXSAvIGRsMTtcclxuICAgICAgICAgIGVbIGwgXSA9IHMgKiBwO1xyXG4gICAgICAgICAgZFsgbCBdID0gYyAqIHA7XHJcblxyXG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIGNvbnZlcmdlbmNlLlxyXG5cclxuICAgICAgICB9IHdoaWxlICggTWF0aC5hYnMoIGVbIGwgXSApID4gZXBzICogdHN0MSApO1xyXG4gICAgICB9XHJcbiAgICAgIGRbIGwgXSA9IGRbIGwgXSArIGY7XHJcbiAgICAgIGVbIGwgXSA9IDAuMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTb3J0IGVpZ2VudmFsdWVzIGFuZCBjb3JyZXNwb25kaW5nIHZlY3RvcnMuXHJcblxyXG4gICAgZm9yICggaSA9IDA7IGkgPCBuIC0gMTsgaSsrICkge1xyXG4gICAgICBrID0gaTtcclxuICAgICAgcCA9IGRbIGkgXTtcclxuICAgICAgZm9yICggaiA9IGkgKyAxOyBqIDwgbjsgaisrICkge1xyXG4gICAgICAgIGlmICggZFsgaiBdIDwgcCApIHtcclxuICAgICAgICAgIGsgPSBqO1xyXG4gICAgICAgICAgcCA9IGRbIGogXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBrICE9PSBpICkge1xyXG4gICAgICAgIGRbIGsgXSA9IGRbIGkgXTtcclxuICAgICAgICBkWyBpIF0gPSBwO1xyXG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgbjsgaisrICkge1xyXG4gICAgICAgICAgcCA9IFZbIGogKiB0aGlzLm4gKyBpIF07XHJcbiAgICAgICAgICBWWyBqICogdGhpcy5uICsgaSBdID0gVlsgaiAqIG4gKyBrIF07XHJcbiAgICAgICAgICBWWyBqICogbiArIGsgXSA9IHA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiAgTm9uc3ltbWV0cmljIHJlZHVjdGlvbiB0byBIZXNzZW5iZXJnIGZvcm0uXHJcbiAgICogIEBwcml2YXRlXHJcbiAgICovXHJcbiAgb3J0aGVzKCkge1xyXG4gICAgY29uc3QgbiA9IHRoaXMubjtcclxuICAgIGNvbnN0IFYgPSB0aGlzLlY7XHJcbiAgICBjb25zdCBIID0gdGhpcy5IO1xyXG4gICAgY29uc3Qgb3J0ID0gdGhpcy5vcnQ7XHJcbiAgICBsZXQgaTtcclxuICAgIGxldCBqO1xyXG4gICAgbGV0IG07XHJcbiAgICBsZXQgZjtcclxuICAgIGxldCBnO1xyXG5cclxuICAgIC8vICBUaGlzIGlzIGRlcml2ZWQgZnJvbSB0aGUgQWxnb2wgcHJvY2VkdXJlcyBvcnRoZXMgYW5kIG9ydHJhbixcclxuICAgIC8vICBieSBNYXJ0aW4gYW5kIFdpbGtpbnNvbiwgSGFuZGJvb2sgZm9yIEF1dG8uIENvbXAuLFxyXG4gICAgLy8gIFZvbC5paS1MaW5lYXIgQWxnZWJyYSwgYW5kIHRoZSBjb3JyZXNwb25kaW5nXHJcbiAgICAvLyAgRm9ydHJhbiBzdWJyb3V0aW5lcyBpbiBFSVNQQUNLLlxyXG5cclxuICAgIGNvbnN0IGxvdyA9IDA7XHJcbiAgICBjb25zdCBoaWdoID0gbiAtIDE7XHJcblxyXG4gICAgZm9yICggbSA9IGxvdyArIDE7IG0gPD0gaGlnaCAtIDE7IG0rKyApIHtcclxuXHJcbiAgICAgIC8vIFNjYWxlIGNvbHVtbi5cclxuXHJcbiAgICAgIGxldCBzY2FsZSA9IDAuMDtcclxuICAgICAgZm9yICggaSA9IG07IGkgPD0gaGlnaDsgaSsrICkge1xyXG4gICAgICAgIHNjYWxlID0gc2NhbGUgKyBNYXRoLmFicyggSFsgaSAqIG4gKyAoIG0gLSAxICkgXSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggc2NhbGUgIT09IDAuMCApIHtcclxuXHJcbiAgICAgICAgLy8gQ29tcHV0ZSBIb3VzZWhvbGRlciB0cmFuc2Zvcm1hdGlvbi5cclxuXHJcbiAgICAgICAgbGV0IGggPSAwLjA7XHJcbiAgICAgICAgZm9yICggaSA9IGhpZ2g7IGkgPj0gbTsgaS0tICkge1xyXG4gICAgICAgICAgb3J0WyBpIF0gPSBIWyBpICogbiArICggbSAtIDEgKSBdIC8gc2NhbGU7XHJcbiAgICAgICAgICBoICs9IG9ydFsgaSBdICogb3J0WyBpIF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGcgPSBNYXRoLnNxcnQoIGggKTtcclxuICAgICAgICBpZiAoIG9ydFsgbSBdID4gMCApIHtcclxuICAgICAgICAgIGcgPSAtZztcclxuICAgICAgICB9XHJcbiAgICAgICAgaCA9IGggLSBvcnRbIG0gXSAqIGc7XHJcbiAgICAgICAgb3J0WyBtIF0gPSBvcnRbIG0gXSAtIGc7XHJcblxyXG4gICAgICAgIC8vIEFwcGx5IEhvdXNlaG9sZGVyIHNpbWlsYXJpdHkgdHJhbnNmb3JtYXRpb25cclxuICAgICAgICAvLyBIID0gKEktdSp1Jy9oKSpIKihJLXUqdScpL2gpXHJcblxyXG4gICAgICAgIGZvciAoIGogPSBtOyBqIDwgbjsgaisrICkge1xyXG4gICAgICAgICAgZiA9IDAuMDtcclxuICAgICAgICAgIGZvciAoIGkgPSBoaWdoOyBpID49IG07IGktLSApIHtcclxuICAgICAgICAgICAgZiArPSBvcnRbIGkgXSAqIEhbIGkgKiB0aGlzLm4gKyBqIF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmID0gZiAvIGg7XHJcbiAgICAgICAgICBmb3IgKCBpID0gbTsgaSA8PSBoaWdoOyBpKysgKSB7XHJcbiAgICAgICAgICAgIEhbIGkgKiB0aGlzLm4gKyBqIF0gLT0gZiAqIG9ydFsgaSBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPD0gaGlnaDsgaSsrICkge1xyXG4gICAgICAgICAgZiA9IDAuMDtcclxuICAgICAgICAgIGZvciAoIGogPSBoaWdoOyBqID49IG07IGotLSApIHtcclxuICAgICAgICAgICAgZiArPSBvcnRbIGogXSAqIEhbIGkgKiB0aGlzLm4gKyBqIF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmID0gZiAvIGg7XHJcbiAgICAgICAgICBmb3IgKCBqID0gbTsgaiA8PSBoaWdoOyBqKysgKSB7XHJcbiAgICAgICAgICAgIEhbIGkgKiB0aGlzLm4gKyBqIF0gLT0gZiAqIG9ydFsgaiBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBvcnRbIG0gXSA9IHNjYWxlICogb3J0WyBtIF07XHJcbiAgICAgICAgSFsgbSAqIG4gKyAoIG0gLSAxICkgXSA9IHNjYWxlICogZztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEFjY3VtdWxhdGUgdHJhbnNmb3JtYXRpb25zIChBbGdvbCdzIG9ydHJhbikuXHJcblxyXG4gICAgZm9yICggaSA9IDA7IGkgPCBuOyBpKysgKSB7XHJcbiAgICAgIGZvciAoIGogPSAwOyBqIDwgbjsgaisrICkge1xyXG4gICAgICAgIFZbIGkgKiB0aGlzLm4gKyBqIF0gPSAoIGkgPT09IGogPyAxLjAgOiAwLjAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoIG0gPSBoaWdoIC0gMTsgbSA+PSBsb3cgKyAxOyBtLS0gKSB7XHJcbiAgICAgIGlmICggSFsgbSAqIG4gKyAoIG0gLSAxICkgXSAhPT0gMC4wICkge1xyXG4gICAgICAgIGZvciAoIGkgPSBtICsgMTsgaSA8PSBoaWdoOyBpKysgKSB7XHJcbiAgICAgICAgICBvcnRbIGkgXSA9IEhbIGkgKiBuICsgKCBtIC0gMSApIF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoIGogPSBtOyBqIDw9IGhpZ2g7IGorKyApIHtcclxuICAgICAgICAgIGcgPSAwLjA7XHJcbiAgICAgICAgICBmb3IgKCBpID0gbTsgaSA8PSBoaWdoOyBpKysgKSB7XHJcbiAgICAgICAgICAgIGcgKz0gb3J0WyBpIF0gKiBWWyBpICogdGhpcy5uICsgaiBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gRG91YmxlIGRpdmlzaW9uIGF2b2lkcyBwb3NzaWJsZSB1bmRlcmZsb3dcclxuICAgICAgICAgIGcgPSAoIGcgLyBvcnRbIG0gXSApIC8gSFsgbSAqIG4gKyAoIG0gLSAxICkgXTtcclxuICAgICAgICAgIGZvciAoIGkgPSBtOyBpIDw9IGhpZ2g7IGkrKyApIHtcclxuICAgICAgICAgICAgVlsgaSAqIHRoaXMubiArIGogXSArPSBnICogb3J0WyBpIF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wbGV4IHNjYWxhciBkaXZpc2lvbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHsqfSB4clxyXG4gICAqIEBwYXJhbSB7Kn0geGlcclxuICAgKiBAcGFyYW0geyp9IHlyXHJcbiAgICogQHBhcmFtIHsqfSB5aVxyXG4gICAqL1xyXG4gIGNkaXYoIHhyLCB4aSwgeXIsIHlpICkge1xyXG4gICAgbGV0IHI7XHJcbiAgICBsZXQgZDtcclxuICAgIGlmICggTWF0aC5hYnMoIHlyICkgPiBNYXRoLmFicyggeWkgKSApIHtcclxuICAgICAgciA9IHlpIC8geXI7XHJcbiAgICAgIGQgPSB5ciArIHIgKiB5aTtcclxuICAgICAgdGhpcy5jZGl2ciA9ICggeHIgKyByICogeGkgKSAvIGQ7XHJcbiAgICAgIHRoaXMuY2RpdmkgPSAoIHhpIC0gciAqIHhyICkgLyBkO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHIgPSB5ciAvIHlpO1xyXG4gICAgICBkID0geWkgKyByICogeXI7XHJcbiAgICAgIHRoaXMuY2RpdnIgPSAoIHIgKiB4ciArIHhpICkgLyBkO1xyXG4gICAgICB0aGlzLmNkaXZpID0gKCByICogeGkgLSB4ciApIC8gZDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgbWV0aG9kcyBmaW5kcyB0aGUgZWlnZW52YWx1ZXMgYW5kIGVpZ2VudmVjdG9yc1xyXG4gICAqIG9mIGEgcmVhbCB1cHBlciBoZXNzZW5iZXJnIG1hdHJpeCBieSB0aGUgUVIgYWxnb3JpdGhtXHJcbiAgICpcclxuICAgKiBOb25zeW1tZXRyaWMgcmVkdWN0aW9uIGZyb20gSGVzc2VuYmVyZyB0byByZWFsIFNjaHVyIGZvcm0uXHJcbiAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUVJfYWxnb3JpdGhtXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGhxcjIoKSB7XHJcbiAgICBsZXQgbjtcclxuICAgIGNvbnN0IFYgPSB0aGlzLlY7XHJcbiAgICBjb25zdCBkID0gdGhpcy5kO1xyXG4gICAgY29uc3QgZSA9IHRoaXMuZTtcclxuICAgIGNvbnN0IEggPSB0aGlzLkg7XHJcbiAgICBsZXQgaTtcclxuICAgIGxldCBqO1xyXG4gICAgbGV0IGs7XHJcbiAgICBsZXQgbDtcclxuICAgIGxldCBtO1xyXG4gICAgbGV0IGl0ZXI7XHJcblxyXG4gICAgLy8gIFRoaXMgaXMgZGVyaXZlZCBmcm9tIHRoZSBBbGdvbCBwcm9jZWR1cmUgaHFyMixcclxuICAgIC8vICBieSBNYXJ0aW4gYW5kIFdpbGtpbnNvbiwgSGFuZGJvb2sgZm9yIEF1dG8uIENvbXAuLFxyXG4gICAgLy8gIFZvbC5paS1MaW5lYXIgQWxnZWJyYSwgYW5kIHRoZSBjb3JyZXNwb25kaW5nXHJcbiAgICAvLyAgRm9ydHJhbiBzdWJyb3V0aW5lIGluIEVJU1BBQ0suXHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZVxyXG5cclxuICAgIGNvbnN0IG5uID0gdGhpcy5uO1xyXG4gICAgbiA9IG5uIC0gMTtcclxuICAgIGNvbnN0IGxvdyA9IDA7XHJcbiAgICBjb25zdCBoaWdoID0gbm4gLSAxO1xyXG4gICAgY29uc3QgZXBzID0gTWF0aC5wb3coIDIuMCwgLTUyLjAgKTtcclxuICAgIGxldCBleHNoaWZ0ID0gMC4wO1xyXG4gICAgbGV0IHAgPSAwO1xyXG4gICAgbGV0IHEgPSAwO1xyXG4gICAgbGV0IHIgPSAwO1xyXG4gICAgbGV0IHMgPSAwO1xyXG4gICAgbGV0IHogPSAwO1xyXG4gICAgbGV0IHQ7XHJcbiAgICBsZXQgdztcclxuICAgIGxldCB4O1xyXG4gICAgbGV0IHk7XHJcblxyXG4gICAgLy8gU3RvcmUgcm9vdHMgaXNvbGF0ZWQgYnkgYmFsYW5jIGFuZCBjb21wdXRlIG1hdHJpeCBub3JtXHJcblxyXG4gICAgbGV0IG5vcm0gPSAwLjA7XHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IG5uOyBpKysgKSB7XHJcbiAgICAgIGlmICggaSA8IGxvdyB8fCBpID4gaGlnaCApIHtcclxuICAgICAgICBkWyBpIF0gPSBIWyBpICogbiArIGkgXTtcclxuICAgICAgICBlWyBpIF0gPSAwLjA7XHJcbiAgICAgIH1cclxuICAgICAgZm9yICggaiA9IE1hdGgubWF4KCBpIC0gMSwgMCApOyBqIDwgbm47IGorKyApIHtcclxuICAgICAgICBub3JtID0gbm9ybSArIE1hdGguYWJzKCBIWyBpICogdGhpcy5uICsgaiBdICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBPdXRlciBsb29wIG92ZXIgZWlnZW52YWx1ZSBpbmRleFxyXG5cclxuICAgIGl0ZXIgPSAwO1xyXG4gICAgd2hpbGUgKCBuID49IGxvdyApIHtcclxuXHJcbiAgICAgIC8vIExvb2sgZm9yIHNpbmdsZSBzbWFsbCBzdWItZGlhZ29uYWwgZWxlbWVudFxyXG5cclxuICAgICAgbCA9IG47XHJcbiAgICAgIHdoaWxlICggbCA+IGxvdyApIHtcclxuICAgICAgICBzID0gTWF0aC5hYnMoIEhbICggbCAtIDEgKSAqIG4gKyAoIGwgLSAxICkgXSApICsgTWF0aC5hYnMoIEhbIGwgKiBuICsgbCBdICk7XHJcbiAgICAgICAgaWYgKCBzID09PSAwLjAgKSB7XHJcbiAgICAgICAgICBzID0gbm9ybTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBNYXRoLmFicyggSFsgbCAqIG4gKyAoIGwgLSAxICkgXSApIDwgZXBzICogcyApIHtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsLS07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGZvciBjb252ZXJnZW5jZVxyXG4gICAgICAvLyBPbmUgcm9vdCBmb3VuZFxyXG5cclxuICAgICAgaWYgKCBsID09PSBuICkge1xyXG4gICAgICAgIEhbIG4gKiBuICsgbiBdID0gSFsgbiAqIG4gKyBuIF0gKyBleHNoaWZ0O1xyXG4gICAgICAgIGRbIG4gXSA9IEhbIG4gKiBuICsgbiBdO1xyXG4gICAgICAgIGVbIG4gXSA9IDAuMDtcclxuICAgICAgICBuLS07XHJcbiAgICAgICAgaXRlciA9IDA7XHJcblxyXG4gICAgICAgIC8vIFR3byByb290cyBmb3VuZFxyXG5cclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggbCA9PT0gbiAtIDEgKSB7XHJcbiAgICAgICAgdyA9IEhbIG4gKiBuICsgbiAtIDEgXSAqIEhbICggbiAtIDEgKSAqIG4gKyBuIF07XHJcbiAgICAgICAgcCA9ICggSFsgKCBuIC0gMSApICogbiArICggbiAtIDEgKSBdIC0gSFsgbiAqIG4gKyBuIF0gKSAvIDIuMDtcclxuICAgICAgICBxID0gcCAqIHAgKyB3O1xyXG4gICAgICAgIHogPSBNYXRoLnNxcnQoIE1hdGguYWJzKCBxICkgKTtcclxuICAgICAgICBIWyBuICogbiArIG4gXSA9IEhbIG4gKiBuICsgbiBdICsgZXhzaGlmdDtcclxuICAgICAgICBIWyAoIG4gLSAxICkgKiBuICsgKCBuIC0gMSApIF0gPSBIWyAoIG4gLSAxICkgKiBuICsgKCBuIC0gMSApIF0gKyBleHNoaWZ0O1xyXG4gICAgICAgIHggPSBIWyBuICogbiArIG4gXTtcclxuXHJcbiAgICAgICAgLy8gUmVhbCBwYWlyXHJcblxyXG4gICAgICAgIGlmICggcSA+PSAwICkge1xyXG4gICAgICAgICAgaWYgKCBwID49IDAgKSB7XHJcbiAgICAgICAgICAgIHogPSBwICsgejtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB6ID0gcCAtIHo7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBkWyBuIC0gMSBdID0geCArIHo7XHJcbiAgICAgICAgICBkWyBuIF0gPSBkWyBuIC0gMSBdO1xyXG4gICAgICAgICAgaWYgKCB6ICE9PSAwLjAgKSB7XHJcbiAgICAgICAgICAgIGRbIG4gXSA9IHggLSB3IC8gejtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVbIG4gLSAxIF0gPSAwLjA7XHJcbiAgICAgICAgICBlWyBuIF0gPSAwLjA7XHJcbiAgICAgICAgICB4ID0gSFsgbiAqIG4gKyBuIC0gMSBdO1xyXG4gICAgICAgICAgcyA9IE1hdGguYWJzKCB4ICkgKyBNYXRoLmFicyggeiApO1xyXG4gICAgICAgICAgcCA9IHggLyBzO1xyXG4gICAgICAgICAgcSA9IHogLyBzO1xyXG4gICAgICAgICAgciA9IE1hdGguc3FydCggcCAqIHAgKyBxICogcSApO1xyXG4gICAgICAgICAgcCA9IHAgLyByO1xyXG4gICAgICAgICAgcSA9IHEgLyByO1xyXG5cclxuICAgICAgICAgIC8vIFJvdyBtb2RpZmljYXRpb25cclxuXHJcbiAgICAgICAgICBmb3IgKCBqID0gbiAtIDE7IGogPCBubjsgaisrICkge1xyXG4gICAgICAgICAgICB6ID0gSFsgKCBuIC0gMSApICogbiArIGogXTtcclxuICAgICAgICAgICAgSFsgKCBuIC0gMSApICogbiArIGogXSA9IHEgKiB6ICsgcCAqIEhbIG4gKiBuICsgaiBdO1xyXG4gICAgICAgICAgICBIWyBuICogbiArIGogXSA9IHEgKiBIWyBuICogbiArIGogXSAtIHAgKiB6O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIENvbHVtbiBtb2RpZmljYXRpb25cclxuXHJcbiAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8PSBuOyBpKysgKSB7XHJcbiAgICAgICAgICAgIHogPSBIWyBpICogbiArIG4gLSAxIF07XHJcbiAgICAgICAgICAgIEhbIGkgKiBuICsgbiAtIDEgXSA9IHEgKiB6ICsgcCAqIEhbIGkgKiBuICsgbiBdO1xyXG4gICAgICAgICAgICBIWyBpICogbiArIG4gXSA9IHEgKiBIWyBpICogbiArIG4gXSAtIHAgKiB6O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEFjY3VtdWxhdGUgdHJhbnNmb3JtYXRpb25zXHJcblxyXG4gICAgICAgICAgZm9yICggaSA9IGxvdzsgaSA8PSBoaWdoOyBpKysgKSB7XHJcbiAgICAgICAgICAgIHogPSBWWyBpICogbiArIG4gLSAxIF07XHJcbiAgICAgICAgICAgIFZbIGkgKiBuICsgbiAtIDEgXSA9IHEgKiB6ICsgcCAqIFZbIGkgKiBuICsgbiBdO1xyXG4gICAgICAgICAgICBWWyBpICogbiArIG4gXSA9IHEgKiBWWyBpICogbiArIG4gXSAtIHAgKiB6O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIENvbXBsZXggcGFpclxyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBkWyBuIC0gMSBdID0geCArIHA7XHJcbiAgICAgICAgICBkWyBuIF0gPSB4ICsgcDtcclxuICAgICAgICAgIGVbIG4gLSAxIF0gPSB6O1xyXG4gICAgICAgICAgZVsgbiBdID0gLXo7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG4gPSBuIC0gMjtcclxuICAgICAgICBpdGVyID0gMDtcclxuXHJcbiAgICAgICAgLy8gTm8gY29udmVyZ2VuY2UgeWV0XHJcblxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBGb3JtIHNoaWZ0XHJcblxyXG4gICAgICAgIHggPSBIWyBuICogbiArIG4gXTtcclxuICAgICAgICB5ID0gMC4wO1xyXG4gICAgICAgIHcgPSAwLjA7XHJcbiAgICAgICAgaWYgKCBsIDwgbiApIHtcclxuICAgICAgICAgIHkgPSBIWyAoIG4gLSAxICkgKiBuICsgKCBuIC0gMSApIF07XHJcbiAgICAgICAgICB3ID0gSFsgbiAqIG4gKyBuIC0gMSBdICogSFsgKCBuIC0gMSApICogbiArIG4gXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFdpbGtpbnNvbidzIG9yaWdpbmFsIGFkIGhvYyBzaGlmdFxyXG5cclxuICAgICAgICBpZiAoIGl0ZXIgPT09IDEwICkge1xyXG4gICAgICAgICAgZXhzaGlmdCArPSB4O1xyXG4gICAgICAgICAgZm9yICggaSA9IGxvdzsgaSA8PSBuOyBpKysgKSB7XHJcbiAgICAgICAgICAgIEhbIGkgKiBuICsgaSBdIC09IHg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzID0gTWF0aC5hYnMoIEhbIG4gKiBuICsgbiAtIDEgXSApICsgTWF0aC5hYnMoIEhbICggbiAtIDEgKSAqIG4gKyBuIC0gMiBdICk7XHJcbiAgICAgICAgICB4ID0geSA9IDAuNzUgKiBzO1xyXG4gICAgICAgICAgdyA9IC0wLjQzNzUgKiBzICogcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE1BVExBQidzIG5ldyBhZCBob2Mgc2hpZnRcclxuXHJcbiAgICAgICAgaWYgKCBpdGVyID09PSAzMCApIHtcclxuICAgICAgICAgIHMgPSAoIHkgLSB4ICkgLyAyLjA7XHJcbiAgICAgICAgICBzID0gcyAqIHMgKyB3O1xyXG4gICAgICAgICAgaWYgKCBzID4gMCApIHtcclxuICAgICAgICAgICAgcyA9IE1hdGguc3FydCggcyApO1xyXG4gICAgICAgICAgICBpZiAoIHkgPCB4ICkge1xyXG4gICAgICAgICAgICAgIHMgPSAtcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzID0geCAtIHcgLyAoICggeSAtIHggKSAvIDIuMCArIHMgKTtcclxuICAgICAgICAgICAgZm9yICggaSA9IGxvdzsgaSA8PSBuOyBpKysgKSB7XHJcbiAgICAgICAgICAgICAgSFsgaSAqIG4gKyBpIF0gLT0gcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBleHNoaWZ0ICs9IHM7XHJcbiAgICAgICAgICAgIHggPSB5ID0gdyA9IDAuOTY0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaXRlciA9IGl0ZXIgKyAxOyAgIC8vIChDb3VsZCBjaGVjayBpdGVyYXRpb24gY291bnQgaGVyZS4pXHJcblxyXG4gICAgICAgIC8vIExvb2sgZm9yIHR3byBjb25zZWN1dGl2ZSBzbWFsbCBzdWItZGlhZ29uYWwgZWxlbWVudHNcclxuXHJcbiAgICAgICAgbSA9IG4gLSAyO1xyXG4gICAgICAgIHdoaWxlICggbSA+PSBsICkge1xyXG4gICAgICAgICAgeiA9IEhbIG0gKiBuICsgbSBdO1xyXG4gICAgICAgICAgciA9IHggLSB6O1xyXG4gICAgICAgICAgcyA9IHkgLSB6O1xyXG4gICAgICAgICAgcCA9ICggciAqIHMgLSB3ICkgLyBIWyAoIG0gKyAxICkgKiBuICsgbSBdICsgSFsgbSAqIG4gKyBtICsgMSBdO1xyXG4gICAgICAgICAgcSA9IEhbICggbSArIDEgKSAqIG4gKyBtICsgMSBdIC0geiAtIHIgLSBzO1xyXG4gICAgICAgICAgciA9IEhbICggbSArIDIgKSAqIG4gKyBtICsgMSBdO1xyXG4gICAgICAgICAgcyA9IE1hdGguYWJzKCBwICkgKyBNYXRoLmFicyggcSApICsgTWF0aC5hYnMoIHIgKTtcclxuICAgICAgICAgIHAgPSBwIC8gcztcclxuICAgICAgICAgIHEgPSBxIC8gcztcclxuICAgICAgICAgIHIgPSByIC8gcztcclxuICAgICAgICAgIGlmICggbSA9PT0gbCApIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoIE1hdGguYWJzKCBIWyBtICogbiArICggbSAtIDEgKSBdICkgKiAoIE1hdGguYWJzKCBxICkgKyBNYXRoLmFicyggciApICkgPFxyXG4gICAgICAgICAgICAgICBlcHMgKiAoIE1hdGguYWJzKCBwICkgKiAoIE1hdGguYWJzKCBIWyAoIG0gLSAxICkgKiBuICsgbSAtIDEgXSApICsgTWF0aC5hYnMoIHogKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5hYnMoIEhbICggbSArIDEgKSAqIG4gKyBtICsgMSBdICkgKSApICkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG0tLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoIGkgPSBtICsgMjsgaSA8PSBuOyBpKysgKSB7XHJcbiAgICAgICAgICBIWyBpICogbiArIGkgLSAyIF0gPSAwLjA7XHJcbiAgICAgICAgICBpZiAoIGkgPiBtICsgMiApIHtcclxuICAgICAgICAgICAgSFsgaSAqIG4gKyBpIC0gMyBdID0gMC4wO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRG91YmxlIFFSIHN0ZXAgaW52b2x2aW5nIHJvd3MgbDpuIGFuZCBjb2x1bW5zIG06blxyXG5cclxuICAgICAgICBmb3IgKCBrID0gbTsgayA8PSBuIC0gMTsgaysrICkge1xyXG4gICAgICAgICAgY29uc3Qgbm90bGFzdCA9ICggayAhPT0gbiAtIDEgKTtcclxuICAgICAgICAgIGlmICggayAhPT0gbSApIHtcclxuICAgICAgICAgICAgcCA9IEhbIGsgKiBuICsgayAtIDEgXTtcclxuICAgICAgICAgICAgcSA9IEhbICggayArIDEgKSAqIG4gKyBrIC0gMSBdO1xyXG4gICAgICAgICAgICByID0gKCBub3RsYXN0ID8gSFsgKCBrICsgMiApICogbiArIGsgLSAxIF0gOiAwLjAgKTtcclxuICAgICAgICAgICAgeCA9IE1hdGguYWJzKCBwICkgKyBNYXRoLmFicyggcSApICsgTWF0aC5hYnMoIHIgKTtcclxuICAgICAgICAgICAgaWYgKCB4ICE9PSAwLjAgKSB7XHJcbiAgICAgICAgICAgICAgcCA9IHAgLyB4O1xyXG4gICAgICAgICAgICAgIHEgPSBxIC8geDtcclxuICAgICAgICAgICAgICByID0gciAvIHg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICggeCA9PT0gMC4wICkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHMgPSBNYXRoLnNxcnQoIHAgKiBwICsgcSAqIHEgKyByICogciApO1xyXG4gICAgICAgICAgaWYgKCBwIDwgMCApIHtcclxuICAgICAgICAgICAgcyA9IC1zO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKCBzICE9PSAwICkge1xyXG4gICAgICAgICAgICBpZiAoIGsgIT09IG0gKSB7XHJcbiAgICAgICAgICAgICAgSFsgayAqIG4gKyBrIC0gMSBdID0gLXMgKiB4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCBsICE9PSBtICkge1xyXG4gICAgICAgICAgICAgIEhbIGsgKiBuICsgayAtIDEgXSA9IC1IWyBrICogbiArIGsgLSAxIF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcCA9IHAgKyBzO1xyXG4gICAgICAgICAgICB4ID0gcCAvIHM7XHJcbiAgICAgICAgICAgIHkgPSBxIC8gcztcclxuICAgICAgICAgICAgeiA9IHIgLyBzO1xyXG4gICAgICAgICAgICBxID0gcSAvIHA7XHJcbiAgICAgICAgICAgIHIgPSByIC8gcDtcclxuXHJcbiAgICAgICAgICAgIC8vIFJvdyBtb2RpZmljYXRpb25cclxuXHJcbiAgICAgICAgICAgIGZvciAoIGogPSBrOyBqIDwgbm47IGorKyApIHtcclxuICAgICAgICAgICAgICBwID0gSFsgayAqIG4gKyBqIF0gKyBxICogSFsgKCBrICsgMSApICogbiArIGogXTtcclxuICAgICAgICAgICAgICBpZiAoIG5vdGxhc3QgKSB7XHJcbiAgICAgICAgICAgICAgICBwID0gcCArIHIgKiBIWyAoIGsgKyAyICkgKiBuICsgaiBdO1xyXG4gICAgICAgICAgICAgICAgSFsgKCBrICsgMiApICogbiArIGogXSA9IEhbICggayArIDIgKSAqIG4gKyBqIF0gLSBwICogejtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgSFsgayAqIG4gKyBqIF0gPSBIWyBrICogbiArIGogXSAtIHAgKiB4O1xyXG4gICAgICAgICAgICAgIEhbICggayArIDEgKSAqIG4gKyBqIF0gPSBIWyAoIGsgKyAxICkgKiBuICsgaiBdIC0gcCAqIHk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENvbHVtbiBtb2RpZmljYXRpb25cclxuXHJcbiAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDw9IE1hdGgubWluKCBuLCBrICsgMyApOyBpKysgKSB7XHJcbiAgICAgICAgICAgICAgcCA9IHggKiBIWyBpICogbiArIGsgXSArIHkgKiBIWyBpICogbiArIGsgKyAxIF07XHJcbiAgICAgICAgICAgICAgaWYgKCBub3RsYXN0ICkge1xyXG4gICAgICAgICAgICAgICAgcCA9IHAgKyB6ICogSFsgaSAqIG4gKyBrICsgMiBdO1xyXG4gICAgICAgICAgICAgICAgSFsgaSAqIG4gKyBrICsgMiBdID0gSFsgaSAqIG4gKyBrICsgMiBdIC0gcCAqIHI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIEhbIGkgKiBuICsgayBdID0gSFsgaSAqIG4gKyBrIF0gLSBwO1xyXG4gICAgICAgICAgICAgIEhbIGkgKiBuICsgayArIDEgXSA9IEhbIGkgKiBuICsgayArIDEgXSAtIHAgKiBxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBY2N1bXVsYXRlIHRyYW5zZm9ybWF0aW9uc1xyXG5cclxuICAgICAgICAgICAgZm9yICggaSA9IGxvdzsgaSA8PSBoaWdoOyBpKysgKSB7XHJcbiAgICAgICAgICAgICAgcCA9IHggKiBWWyBpICogbiArIGsgXSArIHkgKiBWWyBpICogbiArIGsgKyAxIF07XHJcbiAgICAgICAgICAgICAgaWYgKCBub3RsYXN0ICkge1xyXG4gICAgICAgICAgICAgICAgcCA9IHAgKyB6ICogVlsgaSAqIG4gKyBrICsgMiBdO1xyXG4gICAgICAgICAgICAgICAgVlsgaSAqIG4gKyBrICsgMiBdID0gVlsgaSAqIG4gKyBrICsgMiBdIC0gcCAqIHI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIFZbIGkgKiBuICsgayBdID0gVlsgaSAqIG4gKyBrIF0gLSBwO1xyXG4gICAgICAgICAgICAgIFZbIGkgKiBuICsgayArIDEgXSA9IFZbIGkgKiBuICsgayArIDEgXSAtIHAgKiBxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9ICAvLyAocyAhPT0gMClcclxuICAgICAgICB9ICAvLyBrIGxvb3BcclxuICAgICAgfSAgLy8gY2hlY2sgY29udmVyZ2VuY2VcclxuICAgIH0gIC8vIHdoaWxlIChuID49IGxvdylcclxuXHJcbiAgICAvLyBCYWNrc3Vic3RpdHV0ZSB0byBmaW5kIHZlY3RvcnMgb2YgdXBwZXIgdHJpYW5ndWxhciBmb3JtXHJcblxyXG4gICAgaWYgKCBub3JtID09PSAwLjAgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBuID0gbm4gLSAxOyBuID49IDA7IG4tLSApIHtcclxuICAgICAgcCA9IGRbIG4gXTtcclxuICAgICAgcSA9IGVbIG4gXTtcclxuXHJcbiAgICAgIC8vIFJlYWwgdmVjdG9yXHJcblxyXG4gICAgICBpZiAoIHEgPT09IDAgKSB7XHJcbiAgICAgICAgbCA9IG47XHJcbiAgICAgICAgSFsgbiAqIG4gKyBuIF0gPSAxLjA7XHJcbiAgICAgICAgZm9yICggaSA9IG4gLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgICAgIHcgPSBIWyBpICogbiArIGkgXSAtIHA7XHJcbiAgICAgICAgICByID0gMC4wO1xyXG4gICAgICAgICAgZm9yICggaiA9IGw7IGogPD0gbjsgaisrICkge1xyXG4gICAgICAgICAgICByID0gciArIEhbIGkgKiB0aGlzLm4gKyBqIF0gKiBIWyBqICogbiArIG4gXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICggZVsgaSBdIDwgMC4wICkge1xyXG4gICAgICAgICAgICB6ID0gdztcclxuICAgICAgICAgICAgcyA9IHI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbCA9IGk7XHJcbiAgICAgICAgICAgIGlmICggZVsgaSBdID09PSAwLjAgKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCB3ICE9PSAwLjAgKSB7XHJcbiAgICAgICAgICAgICAgICBIWyBpICogbiArIG4gXSA9IC1yIC8gdztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBIWyBpICogbiArIG4gXSA9IC1yIC8gKCBlcHMgKiBub3JtICk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAvLyBTb2x2ZSByZWFsIGVxdWF0aW9uc1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICB4ID0gSFsgaSAqIG4gKyBpICsgMSBdO1xyXG4gICAgICAgICAgICAgIHkgPSBIWyAoIGkgKyAxICkgKiBuICsgaSBdO1xyXG4gICAgICAgICAgICAgIHEgPSAoIGRbIGkgXSAtIHAgKSAqICggZFsgaSBdIC0gcCApICsgZVsgaSBdICogZVsgaSBdO1xyXG4gICAgICAgICAgICAgIHQgPSAoIHggKiBzIC0geiAqIHIgKSAvIHE7XHJcbiAgICAgICAgICAgICAgSFsgaSAqIG4gKyBuIF0gPSB0O1xyXG4gICAgICAgICAgICAgIGlmICggTWF0aC5hYnMoIHggKSA+IE1hdGguYWJzKCB6ICkgKSB7XHJcbiAgICAgICAgICAgICAgICBIWyAoIGkgKyAxICkgKiBuICsgbiBdID0gKCAtciAtIHcgKiB0ICkgLyB4O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIEhbICggaSArIDEgKSAqIG4gKyBuIF0gPSAoIC1zIC0geSAqIHQgKSAvIHo7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBPdmVyZmxvdyBjb250cm9sXHJcblxyXG4gICAgICAgICAgICB0ID0gTWF0aC5hYnMoIEhbIGkgKiBuICsgbiBdICk7XHJcbiAgICAgICAgICAgIGlmICggKCBlcHMgKiB0ICkgKiB0ID4gMSApIHtcclxuICAgICAgICAgICAgICBmb3IgKCBqID0gaTsgaiA8PSBuOyBqKysgKSB7XHJcbiAgICAgICAgICAgICAgICBIWyBqICogbiArIG4gXSA9IEhbIGogKiBuICsgbiBdIC8gdDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENvbXBsZXggdmVjdG9yXHJcblxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBxIDwgMCApIHtcclxuICAgICAgICBsID0gbiAtIDE7XHJcblxyXG4gICAgICAgIC8vIExhc3QgdmVjdG9yIGNvbXBvbmVudCBpbWFnaW5hcnkgc28gbWF0cml4IGlzIHRyaWFuZ3VsYXJcclxuXHJcbiAgICAgICAgaWYgKCBNYXRoLmFicyggSFsgbiAqIG4gKyBuIC0gMSBdICkgPiBNYXRoLmFicyggSFsgKCBuIC0gMSApICogbiArIG4gXSApICkge1xyXG4gICAgICAgICAgSFsgKCBuIC0gMSApICogbiArICggbiAtIDEgKSBdID0gcSAvIEhbIG4gKiBuICsgbiAtIDEgXTtcclxuICAgICAgICAgIEhbICggbiAtIDEgKSAqIG4gKyBuIF0gPSAtKCBIWyBuICogbiArIG4gXSAtIHAgKSAvIEhbIG4gKiBuICsgbiAtIDEgXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmNkaXYoIDAuMCwgLUhbICggbiAtIDEgKSAqIG4gKyBuIF0sIEhbICggbiAtIDEgKSAqIG4gKyAoIG4gLSAxICkgXSAtIHAsIHEgKTtcclxuICAgICAgICAgIEhbICggbiAtIDEgKSAqIG4gKyAoIG4gLSAxICkgXSA9IHRoaXMuY2RpdnI7XHJcbiAgICAgICAgICBIWyAoIG4gLSAxICkgKiBuICsgbiBdID0gdGhpcy5jZGl2aTtcclxuICAgICAgICB9XHJcbiAgICAgICAgSFsgbiAqIG4gKyBuIC0gMSBdID0gMC4wO1xyXG4gICAgICAgIEhbIG4gKiBuICsgbiBdID0gMS4wO1xyXG4gICAgICAgIGZvciAoIGkgPSBuIC0gMjsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgICAgICBsZXQgcmE7XHJcbiAgICAgICAgICBsZXQgc2E7XHJcbiAgICAgICAgICBsZXQgdnI7XHJcbiAgICAgICAgICBsZXQgdmk7XHJcbiAgICAgICAgICByYSA9IDAuMDtcclxuICAgICAgICAgIHNhID0gMC4wO1xyXG4gICAgICAgICAgZm9yICggaiA9IGw7IGogPD0gbjsgaisrICkge1xyXG4gICAgICAgICAgICByYSA9IHJhICsgSFsgaSAqIHRoaXMubiArIGogXSAqIEhbIGogKiBuICsgbiAtIDEgXTtcclxuICAgICAgICAgICAgc2EgPSBzYSArIEhbIGkgKiB0aGlzLm4gKyBqIF0gKiBIWyBqICogbiArIG4gXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHcgPSBIWyBpICogbiArIGkgXSAtIHA7XHJcblxyXG4gICAgICAgICAgaWYgKCBlWyBpIF0gPCAwLjAgKSB7XHJcbiAgICAgICAgICAgIHogPSB3O1xyXG4gICAgICAgICAgICByID0gcmE7XHJcbiAgICAgICAgICAgIHMgPSBzYTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsID0gaTtcclxuICAgICAgICAgICAgaWYgKCBlWyBpIF0gPT09IDAgKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5jZGl2KCAtcmEsIC1zYSwgdywgcSApO1xyXG4gICAgICAgICAgICAgIEhbIGkgKiBuICsgbiAtIDEgXSA9IHRoaXMuY2RpdnI7XHJcbiAgICAgICAgICAgICAgSFsgaSAqIG4gKyBuIF0gPSB0aGlzLmNkaXZpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAvLyBTb2x2ZSBjb21wbGV4IGVxdWF0aW9uc1xyXG5cclxuICAgICAgICAgICAgICB4ID0gSFsgaSAqIG4gKyBpICsgMSBdO1xyXG4gICAgICAgICAgICAgIHkgPSBIWyAoIGkgKyAxICkgKiBuICsgaSBdO1xyXG4gICAgICAgICAgICAgIHZyID0gKCBkWyBpIF0gLSBwICkgKiAoIGRbIGkgXSAtIHAgKSArIGVbIGkgXSAqIGVbIGkgXSAtIHEgKiBxO1xyXG4gICAgICAgICAgICAgIHZpID0gKCBkWyBpIF0gLSBwICkgKiAyLjAgKiBxO1xyXG4gICAgICAgICAgICAgIGlmICggdnIgPT09IDAuMCAmJiB2aSA9PT0gMC4wICkge1xyXG4gICAgICAgICAgICAgICAgdnIgPSBlcHMgKiBub3JtICogKCBNYXRoLmFicyggdyApICsgTWF0aC5hYnMoIHEgKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguYWJzKCB4ICkgKyBNYXRoLmFicyggeSApICsgTWF0aC5hYnMoIHogKSApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB0aGlzLmNkaXYoIHggKiByIC0geiAqIHJhICsgcSAqIHNhLCB4ICogcyAtIHogKiBzYSAtIHEgKiByYSwgdnIsIHZpICk7XHJcbiAgICAgICAgICAgICAgSFsgaSAqIG4gKyBuIC0gMSBdID0gdGhpcy5jZGl2cjtcclxuICAgICAgICAgICAgICBIWyBpICogbiArIG4gXSA9IHRoaXMuY2Rpdmk7XHJcbiAgICAgICAgICAgICAgaWYgKCBNYXRoLmFicyggeCApID4gKCBNYXRoLmFicyggeiApICsgTWF0aC5hYnMoIHEgKSApICkge1xyXG4gICAgICAgICAgICAgICAgSFsgKCBpICsgMSApICogbiArIG4gLSAxIF0gPSAoIC1yYSAtIHcgKiBIWyBpICogbiArIG4gLSAxIF0gKyBxICogSFsgaSAqIG4gKyBuIF0gKSAvIHg7XHJcbiAgICAgICAgICAgICAgICBIWyAoIGkgKyAxICkgKiBuICsgbiBdID0gKCAtc2EgLSB3ICogSFsgaSAqIG4gKyBuIF0gLSBxICogSFsgaSAqIG4gKyBuIC0gMSBdICkgLyB4O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2RpdiggLXIgLSB5ICogSFsgaSAqIG4gKyBuIC0gMSBdLCAtcyAtIHkgKiBIWyBpICogbiArIG4gXSwgeiwgcSApO1xyXG4gICAgICAgICAgICAgICAgSFsgKCBpICsgMSApICogbiArIG4gLSAxIF0gPSB0aGlzLmNkaXZyO1xyXG4gICAgICAgICAgICAgICAgSFsgKCBpICsgMSApICogbiArIG4gXSA9IHRoaXMuY2Rpdmk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBPdmVyZmxvdyBjb250cm9sXHJcbiAgICAgICAgICAgIHQgPSBNYXRoLm1heCggTWF0aC5hYnMoIEhbIGkgKiBuICsgbiAtIDEgXSApLCBNYXRoLmFicyggSFsgaSAqIG4gKyBuIF0gKSApO1xyXG4gICAgICAgICAgICBpZiAoICggZXBzICogdCApICogdCA+IDEgKSB7XHJcbiAgICAgICAgICAgICAgZm9yICggaiA9IGk7IGogPD0gbjsgaisrICkge1xyXG4gICAgICAgICAgICAgICAgSFsgaiAqIG4gKyBuIC0gMSBdID0gSFsgaiAqIG4gKyBuIC0gMSBdIC8gdDtcclxuICAgICAgICAgICAgICAgIEhbIGogKiBuICsgbiBdID0gSFsgaiAqIG4gKyBuIF0gLyB0O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFZlY3RvcnMgb2YgaXNvbGF0ZWQgcm9vdHNcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgbm47IGkrKyApIHtcclxuICAgICAgaWYgKCBpIDwgbG93IHx8IGkgPiBoaWdoICkge1xyXG4gICAgICAgIGZvciAoIGogPSBpOyBqIDwgbm47IGorKyApIHtcclxuICAgICAgICAgIFZbIGkgKiB0aGlzLm4gKyBqIF0gPSBIWyBpICogdGhpcy5uICsgaiBdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEJhY2sgdHJhbnNmb3JtYXRpb24gdG8gZ2V0IGVpZ2VudmVjdG9ycyBvZiBvcmlnaW5hbCBtYXRyaXhcclxuICAgIGZvciAoIGogPSBubiAtIDE7IGogPj0gbG93OyBqLS0gKSB7XHJcbiAgICAgIGZvciAoIGkgPSBsb3c7IGkgPD0gaGlnaDsgaSsrICkge1xyXG4gICAgICAgIHogPSAwLjA7XHJcbiAgICAgICAgZm9yICggayA9IGxvdzsgayA8PSBNYXRoLm1pbiggaiwgaGlnaCApOyBrKysgKSB7XHJcbiAgICAgICAgICB6ID0geiArIFZbIGkgKiBuICsgayBdICogSFsgayAqIG4gKyBqIF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFZbIGkgKiB0aGlzLm4gKyBqIF0gPSB6O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5kb3QucmVnaXN0ZXIoICdFaWdlbnZhbHVlRGVjb21wb3NpdGlvbicsIEVpZ2VudmFsdWVEZWNvbXBvc2l0aW9uICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBFaWdlbnZhbHVlRGVjb21wb3NpdGlvbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsR0FBRyxNQUFNLFVBQVU7QUFDMUIsT0FBT0MsTUFBTSxNQUFNLGFBQWE7QUFFaEMsTUFBTUMsU0FBUyxHQUFHQyxNQUFNLENBQUNDLFlBQVksSUFBSUMsS0FBSztBQUU5QyxNQUFNQyx1QkFBdUIsQ0FBQztFQUM1QjtBQUNGO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsTUFBTSxFQUFHO0lBQ3BCLElBQUlDLENBQUM7SUFDTCxJQUFJQyxDQUFDO0lBRUwsTUFBTUMsQ0FBQyxHQUFHSCxNQUFNLENBQUNJLE9BQU87SUFDeEIsSUFBSSxDQUFDQyxDQUFDLEdBQUdMLE1BQU0sQ0FBQ00sa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEMsTUFBTUQsQ0FBQyxHQUFHLElBQUksQ0FBQ0EsQ0FBQztJQUNoQixJQUFJLENBQUNFLENBQUMsR0FBRyxJQUFJYixTQUFTLENBQUVXLENBQUMsR0FBR0EsQ0FBRSxDQUFDLENBQUMsQ0FBQzs7SUFFakM7SUFDQSxJQUFJLENBQUNHLENBQUMsR0FBRyxJQUFJZCxTQUFTLENBQUVXLENBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0IsSUFBSSxDQUFDSSxDQUFDLEdBQUcsSUFBSWYsU0FBUyxDQUFFVyxDQUFFLENBQUMsQ0FBQyxDQUFDOztJQUU3QixJQUFJLENBQUNLLFdBQVcsR0FBRyxJQUFJO0lBQ3ZC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