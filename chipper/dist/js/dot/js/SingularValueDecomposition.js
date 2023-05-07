// Copyright 2013-2022, University of Colorado Boulder

/**
 * SVD decomposition, based on Jama (http://math.nist.gov/javanumerics/jama/)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import dot from './dot.js';
import Matrix from './Matrix.js';
const ArrayType = window.Float64Array || Array;
class SingularValueDecomposition {
  /**
   * @param {Matrix} matrix
   */
  constructor(matrix) {
    this.matrix = matrix;
    const Arg = matrix;

    // Derived from LINPACK code.
    // Initialize.
    const A = Arg.getArrayCopy();
    this.m = Arg.getRowDimension();
    this.n = Arg.getColumnDimension();
    const m = this.m;
    const n = this.n;
    const min = Math.min;
    const max = Math.max;
    const pow = Math.pow;
    const abs = Math.abs;

    /* Apparently the failing cases are only a proper subset of (m<n),
     so let's not throw error.  Correct fix to come later?
     if (m<n) {
     throw new IllegalArgumentException("Jama SVD only works for m >= n"); }
     */
    const nu = min(m, n);
    this.s = new ArrayType(min(m + 1, n));
    const s = this.s;
    this.U = new ArrayType(m * nu);
    const U = this.U;
    this.V = new ArrayType(n * n);
    const V = this.V;
    const e = new ArrayType(n);
    const work = new ArrayType(m);
    const wantu = true;
    const wantv = true;
    let i;
    let j;
    let k;
    let t;
    let f;
    let cs;
    let sn;
    const hypot = Matrix.hypot;

    // Reduce A to bidiagonal form, storing the diagonal elements
    // in s and the super-diagonal elements in e.

    const nct = min(m - 1, n);
    const nrt = max(0, min(n - 2, m));
    for (k = 0; k < max(nct, nrt); k++) {
      if (k < nct) {
        // Compute the transformation for the k-th column and
        // place the k-th diagonal in s[k].
        // Compute 2-norm of k-th column without under/overflow.
        s[k] = 0;
        for (i = k; i < m; i++) {
          s[k] = hypot(s[k], A[i * n + k]);
        }
        if (s[k] !== 0.0) {
          if (A[k * n + k] < 0.0) {
            s[k] = -s[k];
          }
          for (i = k; i < m; i++) {
            A[i * n + k] /= s[k];
          }
          A[k * n + k] += 1.0;
        }
        s[k] = -s[k];
      }
      for (j = k + 1; j < n; j++) {
        if (k < nct && s[k] !== 0.0) {
          // Apply the transformation.

          t = 0;
          for (i = k; i < m; i++) {
            t += A[i * n + k] * A[i * n + j];
          }
          t = -t / A[k * n + k];
          for (i = k; i < m; i++) {
            A[i * n + j] += t * A[i * n + k];
          }
        }

        // Place the k-th row of A into e for the
        // subsequent calculation of the row transformation.

        e[j] = A[k * n + j];
      }
      if (wantu && k < nct) {
        // Place the transformation in U for subsequent back
        // multiplication.

        for (i = k; i < m; i++) {
          U[i * nu + k] = A[i * n + k];
        }
      }
      if (k < nrt) {
        // Compute the k-th row transformation and place the
        // k-th super-diagonal in e[k].
        // Compute 2-norm without under/overflow.
        e[k] = 0;
        for (i = k + 1; i < n; i++) {
          e[k] = hypot(e[k], e[i]);
        }
        if (e[k] !== 0.0) {
          if (e[k + 1] < 0.0) {
            e[k] = -e[k];
          }
          for (i = k + 1; i < n; i++) {
            e[i] /= e[k];
          }
          e[k + 1] += 1.0;
        }
        e[k] = -e[k];
        if (k + 1 < m && e[k] !== 0.0) {
          // Apply the transformation.

          for (i = k + 1; i < m; i++) {
            work[i] = 0.0;
          }
          for (j = k + 1; j < n; j++) {
            for (i = k + 1; i < m; i++) {
              work[i] += e[j] * A[i * n + j];
            }
          }
          for (j = k + 1; j < n; j++) {
            t = -e[j] / e[k + 1];
            for (i = k + 1; i < m; i++) {
              A[i * n + j] += t * work[i];
            }
          }
        }
        if (wantv) {
          // Place the transformation in V for subsequent
          // back multiplication.

          for (i = k + 1; i < n; i++) {
            V[i * n + k] = e[i];
          }
        }
      }
    }

    // Set up the final bidiagonal matrix or order p.

    let p = min(n, m + 1);
    if (nct < n) {
      s[nct] = A[nct * n + nct];
    }
    if (m < p) {
      s[p - 1] = 0.0;
    }
    if (nrt + 1 < p) {
      e[nrt] = A[nrt * n + p - 1];
    }
    e[p - 1] = 0.0;

    // If required, generate U.

    if (wantu) {
      for (j = nct; j < nu; j++) {
        for (i = 0; i < m; i++) {
          U[i * nu + j] = 0.0;
        }
        U[j * nu + j] = 1.0;
      }
      for (k = nct - 1; k >= 0; k--) {
        if (s[k] !== 0.0) {
          for (j = k + 1; j < nu; j++) {
            t = 0;
            for (i = k; i < m; i++) {
              t += U[i * nu + k] * U[i * nu + j];
            }
            t = -t / U[k * nu + k];
            for (i = k; i < m; i++) {
              U[i * nu + j] += t * U[i * nu + k];
            }
          }
          for (i = k; i < m; i++) {
            U[i * nu + k] = -U[i * nu + k];
          }
          U[k * nu + k] = 1.0 + U[k * nu + k];
          for (i = 0; i < k - 1; i++) {
            U[i * nu + k] = 0.0;
          }
        } else {
          for (i = 0; i < m; i++) {
            U[i * nu + k] = 0.0;
          }
          U[k * nu + k] = 1.0;
        }
      }
    }

    // If required, generate V.

    if (wantv) {
      for (k = n - 1; k >= 0; k--) {
        if (k < nrt && e[k] !== 0.0) {
          for (j = k + 1; j < nu; j++) {
            t = 0;
            for (i = k + 1; i < n; i++) {
              t += V[i * n + k] * V[i * n + j];
            }
            t = -t / V[(k + 1) * n + k];
            for (i = k + 1; i < n; i++) {
              V[i * n + j] += t * V[i * n + k];
            }
          }
        }
        for (i = 0; i < n; i++) {
          V[i * n + k] = 0.0;
        }
        V[k * n + k] = 1.0;
      }
    }

    // Main iteration loop for the singular values.

    const pp = p - 1;
    let iter = 0;
    const eps = pow(2.0, -52.0);
    const tiny = pow(2.0, -966.0);
    while (p > 0) {
      let kase;

      // Here is where a test for too many iterations would go.
      if (iter > 500) {
        break;
      }

      // This section of the program inspects for
      // negligible elements in the s and e arrays.  On
      // completion the variables kase and k are set as follows.

      // kase = 1   if s(p) and e[k-1] are negligible and k<p
      // kase = 2   if s(k) is negligible and k<p
      // kase = 3   if e[k-1] is negligible, k<p, and
      //        s(k), ..., s(p) are not negligible (qr step).
      // kase = 4   if e(p-1) is negligible (convergence).

      for (k = p - 2; k >= -1; k--) {
        if (k === -1) {
          break;
        }
        if (abs(e[k]) <= tiny + eps * (abs(s[k]) + abs(s[k + 1]))) {
          e[k] = 0.0;
          break;
        }
      }
      if (k === p - 2) {
        kase = 4;
      } else {
        let ks;
        for (ks = p - 1; ks >= k; ks--) {
          if (ks === k) {
            break;
          }
          t = (ks !== p ? abs(e[ks]) : 0) + (ks !== k + 1 ? abs(e[ks - 1]) : 0);
          if (abs(s[ks]) <= tiny + eps * t) {
            s[ks] = 0.0;
            break;
          }
        }
        if (ks === k) {
          kase = 3;
        } else if (ks === p - 1) {
          kase = 1;
        } else {
          kase = 2;
          k = ks;
        }
      }
      k++;

      // Perform the task indicated by kase.

      switch (kase) {
        // Deflate negligible s(p).

        case 1:
          {
            f = e[p - 2];
            e[p - 2] = 0.0;
            for (j = p - 2; j >= k; j--) {
              t = hypot(s[j], f);
              cs = s[j] / t;
              sn = f / t;
              s[j] = t;
              if (j !== k) {
                f = -sn * e[j - 1];
                e[j - 1] = cs * e[j - 1];
              }
              if (wantv) {
                for (i = 0; i < n; i++) {
                  t = cs * V[i * n + j] + sn * V[i * n + p - 1];
                  V[i * n + p - 1] = -sn * V[i * n + j] + cs * V[i * n + p - 1];
                  V[i * n + j] = t;
                }
              }
            }
          }
          break;

        // Split at negligible s(k).

        case 2:
          {
            f = e[k - 1];
            e[k - 1] = 0.0;
            for (j = k; j < p; j++) {
              t = hypot(s[j], f);
              cs = s[j] / t;
              sn = f / t;
              s[j] = t;
              f = -sn * e[j];
              e[j] = cs * e[j];
              if (wantu) {
                for (i = 0; i < m; i++) {
                  t = cs * U[i * nu + j] + sn * U[i * nu + k - 1];
                  U[i * nu + k - 1] = -sn * U[i * nu + j] + cs * U[i * nu + k - 1];
                  U[i * nu + j] = t;
                }
              }
            }
          }
          break;

        // Perform one qr step.

        case 3:
          {
            // Calculate the shift.

            const scale = max(max(max(max(abs(s[p - 1]), abs(s[p - 2])), abs(e[p - 2])), abs(s[k])), abs(e[k]));
            const sp = s[p - 1] / scale;
            const spm1 = s[p - 2] / scale;
            const epm1 = e[p - 2] / scale;
            const sk = s[k] / scale;
            const ek = e[k] / scale;
            const b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2.0;
            const c = sp * epm1 * (sp * epm1);
            let shift = 0.0;
            if (b !== 0.0 || c !== 0.0) {
              shift = Math.sqrt(b * b + c);
              if (b < 0.0) {
                shift = -shift;
              }
              shift = c / (b + shift);
            }
            f = (sk + sp) * (sk - sp) + shift;
            let g = sk * ek;

            // Chase zeros.

            for (j = k; j < p - 1; j++) {
              t = hypot(f, g);
              cs = f / t;
              sn = g / t;
              if (j !== k) {
                e[j - 1] = t;
              }
              f = cs * s[j] + sn * e[j];
              e[j] = cs * e[j] - sn * s[j];
              g = sn * s[j + 1];
              s[j + 1] = cs * s[j + 1];
              if (wantv) {
                for (i = 0; i < n; i++) {
                  t = cs * V[i * n + j] + sn * V[i * n + j + 1];
                  V[i * n + j + 1] = -sn * V[i * n + j] + cs * V[i * n + j + 1];
                  V[i * n + j] = t;
                }
              }
              t = hypot(f, g);
              cs = f / t;
              sn = g / t;
              s[j] = t;
              f = cs * e[j] + sn * s[j + 1];
              s[j + 1] = -sn * e[j] + cs * s[j + 1];
              g = sn * e[j + 1];
              e[j + 1] = cs * e[j + 1];
              if (wantu && j < m - 1) {
                for (i = 0; i < m; i++) {
                  t = cs * U[i * nu + j] + sn * U[i * nu + j + 1];
                  U[i * nu + j + 1] = -sn * U[i * nu + j] + cs * U[i * nu + j + 1];
                  U[i * nu + j] = t;
                }
              }
            }
            e[p - 2] = f;
            iter = iter + 1;
          }
          break;

        // Convergence.

        case 4:
          {
            // Make the singular values positive.

            if (s[k] <= 0.0) {
              s[k] = s[k] < 0.0 ? -s[k] : 0.0;
              if (wantv) {
                for (i = 0; i <= pp; i++) {
                  V[i * n + k] = -V[i * n + k];
                }
              }
            }

            // Order the singular values.

            while (k < pp) {
              if (s[k] >= s[k + 1]) {
                break;
              }
              t = s[k];
              s[k] = s[k + 1];
              s[k + 1] = t;
              if (wantv && k < n - 1) {
                for (i = 0; i < n; i++) {
                  t = V[i * n + k + 1];
                  V[i * n + k + 1] = V[i * n + k];
                  V[i * n + k] = t;
                }
              }
              if (wantu && k < m - 1) {
                for (i = 0; i < m; i++) {
                  t = U[i * nu + k + 1];
                  U[i * nu + k + 1] = U[i * nu + k];
                  U[i * nu + k] = t;
                }
              }
              k++;
            }
            iter = 0;
            p--;
          }
          break;
        default:
          throw new Error(`invalid kase: ${kase}`);
      }
    }
  }

  /**
   * @public
   *
   * @returns {Matrix}
   */
  getU() {
    return new Matrix(this.m, Math.min(this.m + 1, this.n), this.U, true); // the "fast" flag added, since U is ArrayType
  }

  /**
   * @public
   *
   * @returns {Matrix}
   */
  getV() {
    return new Matrix(this.n, this.n, this.V, true);
  }

  /**
   * @public
   *
   * @returns {Array.<number>}
   */
  getSingularValues() {
    return this.s;
  }

  /**
   * @public
   *
   * @returns {Matrix}
   */
  getS() {
    const result = new Matrix(this.n, this.n);
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.n; j++) {
        result.entries[result.index(i, j)] = 0.0;
      }
      result.entries[result.index(i, i)] = this.s[i];
    }
    return result;
  }

  /**
   * @public
   *
   * @returns {number}
   */
  norm2() {
    return this.s[0];
  }

  /**
   * @public
   *
   * @returns {number}
   */
  cond() {
    return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
  }

  /**
   * @public
   *
   * @returns {number}
   */
  rank() {
    // changed to 23 from 52 (bits of mantissa), since we are using floats here!
    const eps = Math.pow(2.0, -23.0);
    const tol = Math.max(this.m, this.n) * this.s[0] * eps;
    let r = 0;
    for (let i = 0; i < this.s.length; i++) {
      if (this.s[i] > tol) {
        r++;
      }
    }
    return r;
  }

  /**
   * Constructs the Moore-Penrose pseudoinverse of the specified matrix, using the SVD construction.
   * @public
   *
   * See https://en.wikipedia.org/wiki/Moore%E2%80%93Penrose_pseudoinverse for details. Helpful for
   * linear least-squares regression.
   *
   * @param {Matrix} matrix, m x n
   * @returns {Matrix} - n x m
   */
  static pseudoinverse(matrix) {
    const svd = new SingularValueDecomposition(matrix);
    const sigmaPseudoinverse = Matrix.diagonalMatrix(svd.getSingularValues().map(value => {
      if (Math.abs(value) < 1e-300) {
        return 0;
      } else {
        return 1 / value;
      }
    }));
    return svd.getV().times(sigmaPseudoinverse).times(svd.getU().transpose());
  }
}
dot.register('SingularValueDecomposition', SingularValueDecomposition);
export default SingularValueDecomposition;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3QiLCJNYXRyaXgiLCJBcnJheVR5cGUiLCJ3aW5kb3ciLCJGbG9hdDY0QXJyYXkiLCJBcnJheSIsIlNpbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uIiwiY29uc3RydWN0b3IiLCJtYXRyaXgiLCJBcmciLCJBIiwiZ2V0QXJyYXlDb3B5IiwibSIsImdldFJvd0RpbWVuc2lvbiIsIm4iLCJnZXRDb2x1bW5EaW1lbnNpb24iLCJtaW4iLCJNYXRoIiwibWF4IiwicG93IiwiYWJzIiwibnUiLCJzIiwiVSIsIlYiLCJlIiwid29yayIsIndhbnR1Iiwid2FudHYiLCJpIiwiaiIsImsiLCJ0IiwiZiIsImNzIiwic24iLCJoeXBvdCIsIm5jdCIsIm5ydCIsInAiLCJwcCIsIml0ZXIiLCJlcHMiLCJ0aW55Iiwia2FzZSIsImtzIiwic2NhbGUiLCJzcCIsInNwbTEiLCJlcG0xIiwic2siLCJlayIsImIiLCJjIiwic2hpZnQiLCJzcXJ0IiwiZyIsIkVycm9yIiwiZ2V0VSIsImdldFYiLCJnZXRTaW5ndWxhclZhbHVlcyIsImdldFMiLCJyZXN1bHQiLCJlbnRyaWVzIiwiaW5kZXgiLCJub3JtMiIsImNvbmQiLCJyYW5rIiwidG9sIiwiciIsImxlbmd0aCIsInBzZXVkb2ludmVyc2UiLCJzdmQiLCJzaWdtYVBzZXVkb2ludmVyc2UiLCJkaWFnb25hbE1hdHJpeCIsIm1hcCIsInZhbHVlIiwidGltZXMiLCJ0cmFuc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNpbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNWRCBkZWNvbXBvc2l0aW9uLCBiYXNlZCBvbiBKYW1hIChodHRwOi8vbWF0aC5uaXN0Lmdvdi9qYXZhbnVtZXJpY3MvamFtYS8pXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcclxuaW1wb3J0IE1hdHJpeCBmcm9tICcuL01hdHJpeC5qcyc7XHJcblxyXG5jb25zdCBBcnJheVR5cGUgPSB3aW5kb3cuRmxvYXQ2NEFycmF5IHx8IEFycmF5O1xyXG5cclxuY2xhc3MgU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb24ge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXhcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbWF0cml4ICkge1xyXG4gICAgdGhpcy5tYXRyaXggPSBtYXRyaXg7XHJcblxyXG4gICAgY29uc3QgQXJnID0gbWF0cml4O1xyXG5cclxuICAgIC8vIERlcml2ZWQgZnJvbSBMSU5QQUNLIGNvZGUuXHJcbiAgICAvLyBJbml0aWFsaXplLlxyXG4gICAgY29uc3QgQSA9IEFyZy5nZXRBcnJheUNvcHkoKTtcclxuICAgIHRoaXMubSA9IEFyZy5nZXRSb3dEaW1lbnNpb24oKTtcclxuICAgIHRoaXMubiA9IEFyZy5nZXRDb2x1bW5EaW1lbnNpb24oKTtcclxuICAgIGNvbnN0IG0gPSB0aGlzLm07XHJcbiAgICBjb25zdCBuID0gdGhpcy5uO1xyXG5cclxuICAgIGNvbnN0IG1pbiA9IE1hdGgubWluO1xyXG4gICAgY29uc3QgbWF4ID0gTWF0aC5tYXg7XHJcbiAgICBjb25zdCBwb3cgPSBNYXRoLnBvdztcclxuICAgIGNvbnN0IGFicyA9IE1hdGguYWJzO1xyXG5cclxuICAgIC8qIEFwcGFyZW50bHkgdGhlIGZhaWxpbmcgY2FzZXMgYXJlIG9ubHkgYSBwcm9wZXIgc3Vic2V0IG9mIChtPG4pLFxyXG4gICAgIHNvIGxldCdzIG5vdCB0aHJvdyBlcnJvci4gIENvcnJlY3QgZml4IHRvIGNvbWUgbGF0ZXI/XHJcbiAgICAgaWYgKG08bikge1xyXG4gICAgIHRocm93IG5ldyBJbGxlZ2FsQXJndW1lbnRFeGNlcHRpb24oXCJKYW1hIFNWRCBvbmx5IHdvcmtzIGZvciBtID49IG5cIik7IH1cclxuICAgICAqL1xyXG4gICAgY29uc3QgbnUgPSBtaW4oIG0sIG4gKTtcclxuICAgIHRoaXMucyA9IG5ldyBBcnJheVR5cGUoIG1pbiggbSArIDEsIG4gKSApO1xyXG4gICAgY29uc3QgcyA9IHRoaXMucztcclxuICAgIHRoaXMuVSA9IG5ldyBBcnJheVR5cGUoIG0gKiBudSApO1xyXG4gICAgY29uc3QgVSA9IHRoaXMuVTtcclxuICAgIHRoaXMuViA9IG5ldyBBcnJheVR5cGUoIG4gKiBuICk7XHJcbiAgICBjb25zdCBWID0gdGhpcy5WO1xyXG4gICAgY29uc3QgZSA9IG5ldyBBcnJheVR5cGUoIG4gKTtcclxuICAgIGNvbnN0IHdvcmsgPSBuZXcgQXJyYXlUeXBlKCBtICk7XHJcbiAgICBjb25zdCB3YW50dSA9IHRydWU7XHJcbiAgICBjb25zdCB3YW50diA9IHRydWU7XHJcblxyXG4gICAgbGV0IGk7XHJcbiAgICBsZXQgajtcclxuICAgIGxldCBrO1xyXG4gICAgbGV0IHQ7XHJcbiAgICBsZXQgZjtcclxuXHJcbiAgICBsZXQgY3M7XHJcbiAgICBsZXQgc247XHJcblxyXG4gICAgY29uc3QgaHlwb3QgPSBNYXRyaXguaHlwb3Q7XHJcblxyXG4gICAgLy8gUmVkdWNlIEEgdG8gYmlkaWFnb25hbCBmb3JtLCBzdG9yaW5nIHRoZSBkaWFnb25hbCBlbGVtZW50c1xyXG4gICAgLy8gaW4gcyBhbmQgdGhlIHN1cGVyLWRpYWdvbmFsIGVsZW1lbnRzIGluIGUuXHJcblxyXG4gICAgY29uc3QgbmN0ID0gbWluKCBtIC0gMSwgbiApO1xyXG4gICAgY29uc3QgbnJ0ID0gbWF4KCAwLCBtaW4oIG4gLSAyLCBtICkgKTtcclxuICAgIGZvciAoIGsgPSAwOyBrIDwgbWF4KCBuY3QsIG5ydCApOyBrKysgKSB7XHJcbiAgICAgIGlmICggayA8IG5jdCApIHtcclxuXHJcbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUgdHJhbnNmb3JtYXRpb24gZm9yIHRoZSBrLXRoIGNvbHVtbiBhbmRcclxuICAgICAgICAvLyBwbGFjZSB0aGUgay10aCBkaWFnb25hbCBpbiBzW2tdLlxyXG4gICAgICAgIC8vIENvbXB1dGUgMi1ub3JtIG9mIGstdGggY29sdW1uIHdpdGhvdXQgdW5kZXIvb3ZlcmZsb3cuXHJcbiAgICAgICAgc1sgayBdID0gMDtcclxuICAgICAgICBmb3IgKCBpID0gazsgaSA8IG07IGkrKyApIHtcclxuICAgICAgICAgIHNbIGsgXSA9IGh5cG90KCBzWyBrIF0sIEFbIGkgKiBuICsgayBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggc1sgayBdICE9PSAwLjAgKSB7XHJcbiAgICAgICAgICBpZiAoIEFbIGsgKiBuICsgayBdIDwgMC4wICkge1xyXG4gICAgICAgICAgICBzWyBrIF0gPSAtc1sgayBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZm9yICggaSA9IGs7IGkgPCBtOyBpKysgKSB7XHJcbiAgICAgICAgICAgIEFbIGkgKiBuICsgayBdIC89IHNbIGsgXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIEFbIGsgKiBuICsgayBdICs9IDEuMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgc1sgayBdID0gLXNbIGsgXTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKCBqID0gayArIDE7IGogPCBuOyBqKysgKSB7XHJcbiAgICAgICAgaWYgKCAoIGsgPCBuY3QgKSAmJiAoIHNbIGsgXSAhPT0gMC4wICkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gQXBwbHkgdGhlIHRyYW5zZm9ybWF0aW9uLlxyXG5cclxuICAgICAgICAgIHQgPSAwO1xyXG4gICAgICAgICAgZm9yICggaSA9IGs7IGkgPCBtOyBpKysgKSB7XHJcbiAgICAgICAgICAgIHQgKz0gQVsgaSAqIG4gKyBrIF0gKiBBWyBpICogbiArIGogXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHQgPSAtdCAvIEFbIGsgKiBuICsgayBdO1xyXG4gICAgICAgICAgZm9yICggaSA9IGs7IGkgPCBtOyBpKysgKSB7XHJcbiAgICAgICAgICAgIEFbIGkgKiBuICsgaiBdICs9IHQgKiBBWyBpICogbiArIGsgXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFBsYWNlIHRoZSBrLXRoIHJvdyBvZiBBIGludG8gZSBmb3IgdGhlXHJcbiAgICAgICAgLy8gc3Vic2VxdWVudCBjYWxjdWxhdGlvbiBvZiB0aGUgcm93IHRyYW5zZm9ybWF0aW9uLlxyXG5cclxuICAgICAgICBlWyBqIF0gPSBBWyBrICogbiArIGogXTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHdhbnR1ICYmICggayA8IG5jdCApICkge1xyXG5cclxuICAgICAgICAvLyBQbGFjZSB0aGUgdHJhbnNmb3JtYXRpb24gaW4gVSBmb3Igc3Vic2VxdWVudCBiYWNrXHJcbiAgICAgICAgLy8gbXVsdGlwbGljYXRpb24uXHJcblxyXG4gICAgICAgIGZvciAoIGkgPSBrOyBpIDwgbTsgaSsrICkge1xyXG4gICAgICAgICAgVVsgaSAqIG51ICsgayBdID0gQVsgaSAqIG4gKyBrIF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICggayA8IG5ydCApIHtcclxuXHJcbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUgay10aCByb3cgdHJhbnNmb3JtYXRpb24gYW5kIHBsYWNlIHRoZVxyXG4gICAgICAgIC8vIGstdGggc3VwZXItZGlhZ29uYWwgaW4gZVtrXS5cclxuICAgICAgICAvLyBDb21wdXRlIDItbm9ybSB3aXRob3V0IHVuZGVyL292ZXJmbG93LlxyXG4gICAgICAgIGVbIGsgXSA9IDA7XHJcbiAgICAgICAgZm9yICggaSA9IGsgKyAxOyBpIDwgbjsgaSsrICkge1xyXG4gICAgICAgICAgZVsgayBdID0gaHlwb3QoIGVbIGsgXSwgZVsgaSBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggZVsgayBdICE9PSAwLjAgKSB7XHJcbiAgICAgICAgICBpZiAoIGVbIGsgKyAxIF0gPCAwLjAgKSB7XHJcbiAgICAgICAgICAgIGVbIGsgXSA9IC1lWyBrIF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmb3IgKCBpID0gayArIDE7IGkgPCBuOyBpKysgKSB7XHJcbiAgICAgICAgICAgIGVbIGkgXSAvPSBlWyBrIF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlWyBrICsgMSBdICs9IDEuMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZVsgayBdID0gLWVbIGsgXTtcclxuICAgICAgICBpZiAoICggayArIDEgPCBtICkgJiYgKCBlWyBrIF0gIT09IDAuMCApICkge1xyXG5cclxuICAgICAgICAgIC8vIEFwcGx5IHRoZSB0cmFuc2Zvcm1hdGlvbi5cclxuXHJcbiAgICAgICAgICBmb3IgKCBpID0gayArIDE7IGkgPCBtOyBpKysgKSB7XHJcbiAgICAgICAgICAgIHdvcmtbIGkgXSA9IDAuMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZvciAoIGogPSBrICsgMTsgaiA8IG47IGorKyApIHtcclxuICAgICAgICAgICAgZm9yICggaSA9IGsgKyAxOyBpIDwgbTsgaSsrICkge1xyXG4gICAgICAgICAgICAgIHdvcmtbIGkgXSArPSBlWyBqIF0gKiBBWyBpICogbiArIGogXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZm9yICggaiA9IGsgKyAxOyBqIDwgbjsgaisrICkge1xyXG4gICAgICAgICAgICB0ID0gLWVbIGogXSAvIGVbIGsgKyAxIF07XHJcbiAgICAgICAgICAgIGZvciAoIGkgPSBrICsgMTsgaSA8IG07IGkrKyApIHtcclxuICAgICAgICAgICAgICBBWyBpICogbiArIGogXSArPSB0ICogd29ya1sgaSBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggd2FudHYgKSB7XHJcblxyXG4gICAgICAgICAgLy8gUGxhY2UgdGhlIHRyYW5zZm9ybWF0aW9uIGluIFYgZm9yIHN1YnNlcXVlbnRcclxuICAgICAgICAgIC8vIGJhY2sgbXVsdGlwbGljYXRpb24uXHJcblxyXG4gICAgICAgICAgZm9yICggaSA9IGsgKyAxOyBpIDwgbjsgaSsrICkge1xyXG4gICAgICAgICAgICBWWyBpICogbiArIGsgXSA9IGVbIGkgXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTZXQgdXAgdGhlIGZpbmFsIGJpZGlhZ29uYWwgbWF0cml4IG9yIG9yZGVyIHAuXHJcblxyXG4gICAgbGV0IHAgPSBtaW4oIG4sIG0gKyAxICk7XHJcbiAgICBpZiAoIG5jdCA8IG4gKSB7XHJcbiAgICAgIHNbIG5jdCBdID0gQVsgbmN0ICogbiArIG5jdCBdO1xyXG4gICAgfVxyXG4gICAgaWYgKCBtIDwgcCApIHtcclxuICAgICAgc1sgcCAtIDEgXSA9IDAuMDtcclxuICAgIH1cclxuICAgIGlmICggbnJ0ICsgMSA8IHAgKSB7XHJcbiAgICAgIGVbIG5ydCBdID0gQVsgbnJ0ICogbiArIHAgLSAxIF07XHJcbiAgICB9XHJcbiAgICBlWyBwIC0gMSBdID0gMC4wO1xyXG5cclxuICAgIC8vIElmIHJlcXVpcmVkLCBnZW5lcmF0ZSBVLlxyXG5cclxuICAgIGlmICggd2FudHUgKSB7XHJcbiAgICAgIGZvciAoIGogPSBuY3Q7IGogPCBudTsgaisrICkge1xyXG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgbTsgaSsrICkge1xyXG4gICAgICAgICAgVVsgaSAqIG51ICsgaiBdID0gMC4wO1xyXG4gICAgICAgIH1cclxuICAgICAgICBVWyBqICogbnUgKyBqIF0gPSAxLjA7XHJcbiAgICAgIH1cclxuICAgICAgZm9yICggayA9IG5jdCAtIDE7IGsgPj0gMDsgay0tICkge1xyXG4gICAgICAgIGlmICggc1sgayBdICE9PSAwLjAgKSB7XHJcbiAgICAgICAgICBmb3IgKCBqID0gayArIDE7IGogPCBudTsgaisrICkge1xyXG4gICAgICAgICAgICB0ID0gMDtcclxuICAgICAgICAgICAgZm9yICggaSA9IGs7IGkgPCBtOyBpKysgKSB7XHJcbiAgICAgICAgICAgICAgdCArPSBVWyBpICogbnUgKyBrIF0gKiBVWyBpICogbnUgKyBqIF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdCA9IC10IC8gVVsgayAqIG51ICsgayBdO1xyXG4gICAgICAgICAgICBmb3IgKCBpID0gazsgaSA8IG07IGkrKyApIHtcclxuICAgICAgICAgICAgICBVWyBpICogbnUgKyBqIF0gKz0gdCAqIFVbIGkgKiBudSArIGsgXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZm9yICggaSA9IGs7IGkgPCBtOyBpKysgKSB7XHJcbiAgICAgICAgICAgIFVbIGkgKiBudSArIGsgXSA9IC1VWyBpICogbnUgKyBrIF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBVWyBrICogbnUgKyBrIF0gPSAxLjAgKyBVWyBrICogbnUgKyBrIF07XHJcbiAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGsgLSAxOyBpKysgKSB7XHJcbiAgICAgICAgICAgIFVbIGkgKiBudSArIGsgXSA9IDAuMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG07IGkrKyApIHtcclxuICAgICAgICAgICAgVVsgaSAqIG51ICsgayBdID0gMC4wO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgVVsgayAqIG51ICsgayBdID0gMS4wO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHJlcXVpcmVkLCBnZW5lcmF0ZSBWLlxyXG5cclxuICAgIGlmICggd2FudHYgKSB7XHJcbiAgICAgIGZvciAoIGsgPSBuIC0gMTsgayA+PSAwOyBrLS0gKSB7XHJcbiAgICAgICAgaWYgKCAoIGsgPCBucnQgKSAmJiAoIGVbIGsgXSAhPT0gMC4wICkgKSB7XHJcbiAgICAgICAgICBmb3IgKCBqID0gayArIDE7IGogPCBudTsgaisrICkge1xyXG4gICAgICAgICAgICB0ID0gMDtcclxuICAgICAgICAgICAgZm9yICggaSA9IGsgKyAxOyBpIDwgbjsgaSsrICkge1xyXG4gICAgICAgICAgICAgIHQgKz0gVlsgaSAqIG4gKyBrIF0gKiBWWyBpICogbiArIGogXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ID0gLXQgLyBWWyAoIGsgKyAxICkgKiBuICsgayBdO1xyXG4gICAgICAgICAgICBmb3IgKCBpID0gayArIDE7IGkgPCBuOyBpKysgKSB7XHJcbiAgICAgICAgICAgICAgVlsgaSAqIG4gKyBqIF0gKz0gdCAqIFZbIGkgKiBuICsgayBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgbjsgaSsrICkge1xyXG4gICAgICAgICAgVlsgaSAqIG4gKyBrIF0gPSAwLjA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFZbIGsgKiBuICsgayBdID0gMS4wO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWFpbiBpdGVyYXRpb24gbG9vcCBmb3IgdGhlIHNpbmd1bGFyIHZhbHVlcy5cclxuXHJcbiAgICBjb25zdCBwcCA9IHAgLSAxO1xyXG4gICAgbGV0IGl0ZXIgPSAwO1xyXG4gICAgY29uc3QgZXBzID0gcG93KCAyLjAsIC01Mi4wICk7XHJcbiAgICBjb25zdCB0aW55ID0gcG93KCAyLjAsIC05NjYuMCApO1xyXG4gICAgd2hpbGUgKCBwID4gMCApIHtcclxuICAgICAgbGV0IGthc2U7XHJcblxyXG4gICAgICAvLyBIZXJlIGlzIHdoZXJlIGEgdGVzdCBmb3IgdG9vIG1hbnkgaXRlcmF0aW9ucyB3b3VsZCBnby5cclxuICAgICAgaWYgKCBpdGVyID4gNTAwICkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUaGlzIHNlY3Rpb24gb2YgdGhlIHByb2dyYW0gaW5zcGVjdHMgZm9yXHJcbiAgICAgIC8vIG5lZ2xpZ2libGUgZWxlbWVudHMgaW4gdGhlIHMgYW5kIGUgYXJyYXlzLiAgT25cclxuICAgICAgLy8gY29tcGxldGlvbiB0aGUgdmFyaWFibGVzIGthc2UgYW5kIGsgYXJlIHNldCBhcyBmb2xsb3dzLlxyXG5cclxuICAgICAgLy8ga2FzZSA9IDEgICBpZiBzKHApIGFuZCBlW2stMV0gYXJlIG5lZ2xpZ2libGUgYW5kIGs8cFxyXG4gICAgICAvLyBrYXNlID0gMiAgIGlmIHMoaykgaXMgbmVnbGlnaWJsZSBhbmQgazxwXHJcbiAgICAgIC8vIGthc2UgPSAzICAgaWYgZVtrLTFdIGlzIG5lZ2xpZ2libGUsIGs8cCwgYW5kXHJcbiAgICAgIC8vICAgICAgICBzKGspLCAuLi4sIHMocCkgYXJlIG5vdCBuZWdsaWdpYmxlIChxciBzdGVwKS5cclxuICAgICAgLy8ga2FzZSA9IDQgICBpZiBlKHAtMSkgaXMgbmVnbGlnaWJsZSAoY29udmVyZ2VuY2UpLlxyXG5cclxuICAgICAgZm9yICggayA9IHAgLSAyOyBrID49IC0xOyBrLS0gKSB7XHJcbiAgICAgICAgaWYgKCBrID09PSAtMSApIHtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGFicyggZVsgayBdICkgPD1cclxuICAgICAgICAgICAgIHRpbnkgKyBlcHMgKiAoIGFicyggc1sgayBdICkgKyBhYnMoIHNbIGsgKyAxIF0gKSApICkge1xyXG4gICAgICAgICAgZVsgayBdID0gMC4wO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICggayA9PT0gcCAtIDIgKSB7XHJcbiAgICAgICAga2FzZSA9IDQ7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgbGV0IGtzO1xyXG4gICAgICAgIGZvciAoIGtzID0gcCAtIDE7IGtzID49IGs7IGtzLS0gKSB7XHJcbiAgICAgICAgICBpZiAoIGtzID09PSBrICkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHQgPSAoIGtzICE9PSBwID8gYWJzKCBlWyBrcyBdICkgOiAwICkgK1xyXG4gICAgICAgICAgICAgICgga3MgIT09IGsgKyAxID8gYWJzKCBlWyBrcyAtIDEgXSApIDogMCApO1xyXG4gICAgICAgICAgaWYgKCBhYnMoIHNbIGtzIF0gKSA8PSB0aW55ICsgZXBzICogdCApIHtcclxuICAgICAgICAgICAgc1sga3MgXSA9IDAuMDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgga3MgPT09IGsgKSB7XHJcbiAgICAgICAgICBrYXNlID0gMztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGtzID09PSBwIC0gMSApIHtcclxuICAgICAgICAgIGthc2UgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGthc2UgPSAyO1xyXG4gICAgICAgICAgayA9IGtzO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBrKys7XHJcblxyXG4gICAgICAvLyBQZXJmb3JtIHRoZSB0YXNrIGluZGljYXRlZCBieSBrYXNlLlxyXG5cclxuICAgICAgc3dpdGNoKCBrYXNlICkge1xyXG5cclxuICAgICAgICAvLyBEZWZsYXRlIG5lZ2xpZ2libGUgcyhwKS5cclxuXHJcbiAgICAgICAgY2FzZSAxOiB7XHJcbiAgICAgICAgICBmID0gZVsgcCAtIDIgXTtcclxuICAgICAgICAgIGVbIHAgLSAyIF0gPSAwLjA7XHJcbiAgICAgICAgICBmb3IgKCBqID0gcCAtIDI7IGogPj0gazsgai0tICkge1xyXG4gICAgICAgICAgICB0ID0gaHlwb3QoIHNbIGogXSwgZiApO1xyXG4gICAgICAgICAgICBjcyA9IHNbIGogXSAvIHQ7XHJcbiAgICAgICAgICAgIHNuID0gZiAvIHQ7XHJcbiAgICAgICAgICAgIHNbIGogXSA9IHQ7XHJcbiAgICAgICAgICAgIGlmICggaiAhPT0gayApIHtcclxuICAgICAgICAgICAgICBmID0gLXNuICogZVsgaiAtIDEgXTtcclxuICAgICAgICAgICAgICBlWyBqIC0gMSBdID0gY3MgKiBlWyBqIC0gMSBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICggd2FudHYgKSB7XHJcbiAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBuOyBpKysgKSB7XHJcbiAgICAgICAgICAgICAgICB0ID0gY3MgKiBWWyBpICogbiArIGogXSArIHNuICogVlsgaSAqIG4gKyBwIC0gMSBdO1xyXG4gICAgICAgICAgICAgICAgVlsgaSAqIG4gKyBwIC0gMSBdID0gLXNuICogVlsgaSAqIG4gKyBqIF0gKyBjcyAqIFZbIGkgKiBuICsgcCAtIDEgXTtcclxuICAgICAgICAgICAgICAgIFZbIGkgKiBuICsgaiBdID0gdDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgLy8gU3BsaXQgYXQgbmVnbGlnaWJsZSBzKGspLlxyXG5cclxuICAgICAgICBjYXNlIDI6IHtcclxuICAgICAgICAgIGYgPSBlWyBrIC0gMSBdO1xyXG4gICAgICAgICAgZVsgayAtIDEgXSA9IDAuMDtcclxuICAgICAgICAgIGZvciAoIGogPSBrOyBqIDwgcDsgaisrICkge1xyXG4gICAgICAgICAgICB0ID0gaHlwb3QoIHNbIGogXSwgZiApO1xyXG4gICAgICAgICAgICBjcyA9IHNbIGogXSAvIHQ7XHJcbiAgICAgICAgICAgIHNuID0gZiAvIHQ7XHJcbiAgICAgICAgICAgIHNbIGogXSA9IHQ7XHJcbiAgICAgICAgICAgIGYgPSAtc24gKiBlWyBqIF07XHJcbiAgICAgICAgICAgIGVbIGogXSA9IGNzICogZVsgaiBdO1xyXG4gICAgICAgICAgICBpZiAoIHdhbnR1ICkge1xyXG4gICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgbTsgaSsrICkge1xyXG4gICAgICAgICAgICAgICAgdCA9IGNzICogVVsgaSAqIG51ICsgaiBdICsgc24gKiBVWyBpICogbnUgKyBrIC0gMSBdO1xyXG4gICAgICAgICAgICAgICAgVVsgaSAqIG51ICsgayAtIDEgXSA9IC1zbiAqIFVbIGkgKiBudSArIGogXSArIGNzICogVVsgaSAqIG51ICsgayAtIDEgXTtcclxuICAgICAgICAgICAgICAgIFVbIGkgKiBudSArIGogXSA9IHQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIC8vIFBlcmZvcm0gb25lIHFyIHN0ZXAuXHJcblxyXG4gICAgICAgIGNhc2UgMzoge1xyXG5cclxuICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgc2hpZnQuXHJcblxyXG4gICAgICAgICAgY29uc3Qgc2NhbGUgPSBtYXgoIG1heCggbWF4KCBtYXgoIGFicyggc1sgcCAtIDEgXSApLCBhYnMoIHNbIHAgLSAyIF0gKSApLCBhYnMoIGVbIHAgLSAyIF0gKSApLCBhYnMoIHNbIGsgXSApICksIGFicyggZVsgayBdICkgKTtcclxuICAgICAgICAgIGNvbnN0IHNwID0gc1sgcCAtIDEgXSAvIHNjYWxlO1xyXG4gICAgICAgICAgY29uc3Qgc3BtMSA9IHNbIHAgLSAyIF0gLyBzY2FsZTtcclxuICAgICAgICAgIGNvbnN0IGVwbTEgPSBlWyBwIC0gMiBdIC8gc2NhbGU7XHJcbiAgICAgICAgICBjb25zdCBzayA9IHNbIGsgXSAvIHNjYWxlO1xyXG4gICAgICAgICAgY29uc3QgZWsgPSBlWyBrIF0gLyBzY2FsZTtcclxuICAgICAgICAgIGNvbnN0IGIgPSAoICggc3BtMSArIHNwICkgKiAoIHNwbTEgLSBzcCApICsgZXBtMSAqIGVwbTEgKSAvIDIuMDtcclxuICAgICAgICAgIGNvbnN0IGMgPSAoIHNwICogZXBtMSApICogKCBzcCAqIGVwbTEgKTtcclxuICAgICAgICAgIGxldCBzaGlmdCA9IDAuMDtcclxuICAgICAgICAgIGlmICggKCBiICE9PSAwLjAgKSB8fCAoIGMgIT09IDAuMCApICkge1xyXG4gICAgICAgICAgICBzaGlmdCA9IE1hdGguc3FydCggYiAqIGIgKyBjICk7XHJcbiAgICAgICAgICAgIGlmICggYiA8IDAuMCApIHtcclxuICAgICAgICAgICAgICBzaGlmdCA9IC1zaGlmdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzaGlmdCA9IGMgLyAoIGIgKyBzaGlmdCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZiA9ICggc2sgKyBzcCApICogKCBzayAtIHNwICkgKyBzaGlmdDtcclxuICAgICAgICAgIGxldCBnID0gc2sgKiBlaztcclxuXHJcbiAgICAgICAgICAvLyBDaGFzZSB6ZXJvcy5cclxuXHJcbiAgICAgICAgICBmb3IgKCBqID0gazsgaiA8IHAgLSAxOyBqKysgKSB7XHJcbiAgICAgICAgICAgIHQgPSBoeXBvdCggZiwgZyApO1xyXG4gICAgICAgICAgICBjcyA9IGYgLyB0O1xyXG4gICAgICAgICAgICBzbiA9IGcgLyB0O1xyXG4gICAgICAgICAgICBpZiAoIGogIT09IGsgKSB7XHJcbiAgICAgICAgICAgICAgZVsgaiAtIDEgXSA9IHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZiA9IGNzICogc1sgaiBdICsgc24gKiBlWyBqIF07XHJcbiAgICAgICAgICAgIGVbIGogXSA9IGNzICogZVsgaiBdIC0gc24gKiBzWyBqIF07XHJcbiAgICAgICAgICAgIGcgPSBzbiAqIHNbIGogKyAxIF07XHJcbiAgICAgICAgICAgIHNbIGogKyAxIF0gPSBjcyAqIHNbIGogKyAxIF07XHJcbiAgICAgICAgICAgIGlmICggd2FudHYgKSB7XHJcbiAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBuOyBpKysgKSB7XHJcbiAgICAgICAgICAgICAgICB0ID0gY3MgKiBWWyBpICogbiArIGogXSArIHNuICogVlsgaSAqIG4gKyBqICsgMSBdO1xyXG4gICAgICAgICAgICAgICAgVlsgaSAqIG4gKyBqICsgMSBdID0gLXNuICogVlsgaSAqIG4gKyBqIF0gKyBjcyAqIFZbIGkgKiBuICsgaiArIDEgXTtcclxuICAgICAgICAgICAgICAgIFZbIGkgKiBuICsgaiBdID0gdDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdCA9IGh5cG90KCBmLCBnICk7XHJcbiAgICAgICAgICAgIGNzID0gZiAvIHQ7XHJcbiAgICAgICAgICAgIHNuID0gZyAvIHQ7XHJcbiAgICAgICAgICAgIHNbIGogXSA9IHQ7XHJcbiAgICAgICAgICAgIGYgPSBjcyAqIGVbIGogXSArIHNuICogc1sgaiArIDEgXTtcclxuICAgICAgICAgICAgc1sgaiArIDEgXSA9IC1zbiAqIGVbIGogXSArIGNzICogc1sgaiArIDEgXTtcclxuICAgICAgICAgICAgZyA9IHNuICogZVsgaiArIDEgXTtcclxuICAgICAgICAgICAgZVsgaiArIDEgXSA9IGNzICogZVsgaiArIDEgXTtcclxuICAgICAgICAgICAgaWYgKCB3YW50dSAmJiAoIGogPCBtIC0gMSApICkge1xyXG4gICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgbTsgaSsrICkge1xyXG4gICAgICAgICAgICAgICAgdCA9IGNzICogVVsgaSAqIG51ICsgaiBdICsgc24gKiBVWyBpICogbnUgKyBqICsgMSBdO1xyXG4gICAgICAgICAgICAgICAgVVsgaSAqIG51ICsgaiArIDEgXSA9IC1zbiAqIFVbIGkgKiBudSArIGogXSArIGNzICogVVsgaSAqIG51ICsgaiArIDEgXTtcclxuICAgICAgICAgICAgICAgIFVbIGkgKiBudSArIGogXSA9IHQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlWyBwIC0gMiBdID0gZjtcclxuICAgICAgICAgIGl0ZXIgPSBpdGVyICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgLy8gQ29udmVyZ2VuY2UuXHJcblxyXG4gICAgICAgIGNhc2UgNDoge1xyXG5cclxuICAgICAgICAgIC8vIE1ha2UgdGhlIHNpbmd1bGFyIHZhbHVlcyBwb3NpdGl2ZS5cclxuXHJcbiAgICAgICAgICBpZiAoIHNbIGsgXSA8PSAwLjAgKSB7XHJcbiAgICAgICAgICAgIHNbIGsgXSA9ICggc1sgayBdIDwgMC4wID8gLXNbIGsgXSA6IDAuMCApO1xyXG4gICAgICAgICAgICBpZiAoIHdhbnR2ICkge1xyXG4gICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDw9IHBwOyBpKysgKSB7XHJcbiAgICAgICAgICAgICAgICBWWyBpICogbiArIGsgXSA9IC1WWyBpICogbiArIGsgXTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBPcmRlciB0aGUgc2luZ3VsYXIgdmFsdWVzLlxyXG5cclxuICAgICAgICAgIHdoaWxlICggayA8IHBwICkge1xyXG4gICAgICAgICAgICBpZiAoIHNbIGsgXSA+PSBzWyBrICsgMSBdICkge1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHQgPSBzWyBrIF07XHJcbiAgICAgICAgICAgIHNbIGsgXSA9IHNbIGsgKyAxIF07XHJcbiAgICAgICAgICAgIHNbIGsgKyAxIF0gPSB0O1xyXG4gICAgICAgICAgICBpZiAoIHdhbnR2ICYmICggayA8IG4gLSAxICkgKSB7XHJcbiAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBuOyBpKysgKSB7XHJcbiAgICAgICAgICAgICAgICB0ID0gVlsgaSAqIG4gKyBrICsgMSBdO1xyXG4gICAgICAgICAgICAgICAgVlsgaSAqIG4gKyBrICsgMSBdID0gVlsgaSAqIG4gKyBrIF07XHJcbiAgICAgICAgICAgICAgICBWWyBpICogbiArIGsgXSA9IHQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICggd2FudHUgJiYgKCBrIDwgbSAtIDEgKSApIHtcclxuICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG07IGkrKyApIHtcclxuICAgICAgICAgICAgICAgIHQgPSBVWyBpICogbnUgKyBrICsgMSBdO1xyXG4gICAgICAgICAgICAgICAgVVsgaSAqIG51ICsgayArIDEgXSA9IFVbIGkgKiBudSArIGsgXTtcclxuICAgICAgICAgICAgICAgIFVbIGkgKiBudSArIGsgXSA9IHQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGsrKztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGl0ZXIgPSAwO1xyXG4gICAgICAgICAgcC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgaW52YWxpZCBrYXNlOiAke2thc2V9YCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxyXG4gICAqL1xyXG4gIGdldFUoKSB7XHJcbiAgICByZXR1cm4gbmV3IE1hdHJpeCggdGhpcy5tLCBNYXRoLm1pbiggdGhpcy5tICsgMSwgdGhpcy5uICksIHRoaXMuVSwgdHJ1ZSApOyAvLyB0aGUgXCJmYXN0XCIgZmxhZyBhZGRlZCwgc2luY2UgVSBpcyBBcnJheVR5cGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XHJcbiAgICovXHJcbiAgZ2V0VigpIHtcclxuICAgIHJldHVybiBuZXcgTWF0cml4KCB0aGlzLm4sIHRoaXMubiwgdGhpcy5WLCB0cnVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59XHJcbiAgICovXHJcbiAgZ2V0U2luZ3VsYXJWYWx1ZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge01hdHJpeH1cclxuICAgKi9cclxuICBnZXRTKCkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hdHJpeCggdGhpcy5uLCB0aGlzLm4gKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubjsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcclxuICAgICAgICByZXN1bHQuZW50cmllc1sgcmVzdWx0LmluZGV4KCBpLCBqICkgXSA9IDAuMDtcclxuICAgICAgfVxyXG4gICAgICByZXN1bHQuZW50cmllc1sgcmVzdWx0LmluZGV4KCBpLCBpICkgXSA9IHRoaXMuc1sgaSBdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgbm9ybTIoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zWyAwIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGNvbmQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zWyAwIF0gLyB0aGlzLnNbIE1hdGgubWluKCB0aGlzLm0sIHRoaXMubiApIC0gMSBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICByYW5rKCkge1xyXG4gICAgLy8gY2hhbmdlZCB0byAyMyBmcm9tIDUyIChiaXRzIG9mIG1hbnRpc3NhKSwgc2luY2Ugd2UgYXJlIHVzaW5nIGZsb2F0cyBoZXJlIVxyXG4gICAgY29uc3QgZXBzID0gTWF0aC5wb3coIDIuMCwgLTIzLjAgKTtcclxuICAgIGNvbnN0IHRvbCA9IE1hdGgubWF4KCB0aGlzLm0sIHRoaXMubiApICogdGhpcy5zWyAwIF0gKiBlcHM7XHJcbiAgICBsZXQgciA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggdGhpcy5zWyBpIF0gPiB0b2wgKSB7XHJcbiAgICAgICAgcisrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdHMgdGhlIE1vb3JlLVBlbnJvc2UgcHNldWRvaW52ZXJzZSBvZiB0aGUgc3BlY2lmaWVkIG1hdHJpeCwgdXNpbmcgdGhlIFNWRCBjb25zdHJ1Y3Rpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01vb3JlJUUyJTgwJTkzUGVucm9zZV9wc2V1ZG9pbnZlcnNlIGZvciBkZXRhaWxzLiBIZWxwZnVsIGZvclxyXG4gICAqIGxpbmVhciBsZWFzdC1zcXVhcmVzIHJlZ3Jlc3Npb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4LCBtIHggblxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9IC0gbiB4IG1cclxuICAgKi9cclxuICBzdGF0aWMgcHNldWRvaW52ZXJzZSggbWF0cml4ICkge1xyXG4gICAgY29uc3Qgc3ZkID0gbmV3IFNpbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uKCBtYXRyaXggKTtcclxuICAgIGNvbnN0IHNpZ21hUHNldWRvaW52ZXJzZSA9IE1hdHJpeC5kaWFnb25hbE1hdHJpeCggc3ZkLmdldFNpbmd1bGFyVmFsdWVzKCkubWFwKCB2YWx1ZSA9PiB7XHJcbiAgICAgIGlmICggTWF0aC5hYnMoIHZhbHVlICkgPCAxZS0zMDAgKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIDEgLyB2YWx1ZTtcclxuICAgICAgfVxyXG4gICAgfSApICk7XHJcbiAgICByZXR1cm4gc3ZkLmdldFYoKS50aW1lcyggc2lnbWFQc2V1ZG9pbnZlcnNlICkudGltZXMoIHN2ZC5nZXRVKCkudHJhbnNwb3NlKCkgKTtcclxuICB9XHJcbn1cclxuXHJcbmRvdC5yZWdpc3RlciggJ1Npbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uJywgU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb24gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNpbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQU0sVUFBVTtBQUMxQixPQUFPQyxNQUFNLE1BQU0sYUFBYTtBQUVoQyxNQUFNQyxTQUFTLEdBQUdDLE1BQU0sQ0FBQ0MsWUFBWSxJQUFJQyxLQUFLO0FBRTlDLE1BQU1DLDBCQUEwQixDQUFDO0VBQy9CO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFDcEIsSUFBSSxDQUFDQSxNQUFNLEdBQUdBLE1BQU07SUFFcEIsTUFBTUMsR0FBRyxHQUFHRCxNQUFNOztJQUVsQjtJQUNBO0lBQ0EsTUFBTUUsQ0FBQyxHQUFHRCxHQUFHLENBQUNFLFlBQVksQ0FBQyxDQUFDO0lBQzVCLElBQUksQ0FBQ0MsQ0FBQyxHQUFHSCxHQUFHLENBQUNJLGVBQWUsQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQ0MsQ0FBQyxHQUFHTCxHQUFHLENBQUNNLGtCQUFrQixDQUFDLENBQUM7SUFDakMsTUFBTUgsQ0FBQyxHQUFHLElBQUksQ0FBQ0EsQ0FBQztJQUNoQixNQUFNRSxDQUFDLEdBQUcsSUFBSSxDQUFDQSxDQUFDO0lBRWhCLE1BQU1FLEdBQUcsR0FBR0MsSUFBSSxDQUFDRCxHQUFHO0lBQ3BCLE1BQU1FLEdBQUcsR0FBR0QsSUFBSSxDQUFDQyxHQUFHO0lBQ3BCLE1BQU1DLEdBQUcsR0FBR0YsSUFBSSxDQUFDRSxHQUFHO0lBQ3BCLE1BQU1DLEdBQUcsR0FBR0gsSUFBSSxDQUFDRyxHQUFHOztJQUVwQjtBQUNKO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksTUFBTUMsRUFBRSxHQUFHTCxHQUFHLENBQUVKLENBQUMsRUFBRUUsQ0FBRSxDQUFDO0lBQ3RCLElBQUksQ0FBQ1EsQ0FBQyxHQUFHLElBQUlwQixTQUFTLENBQUVjLEdBQUcsQ0FBRUosQ0FBQyxHQUFHLENBQUMsRUFBRUUsQ0FBRSxDQUFFLENBQUM7SUFDekMsTUFBTVEsQ0FBQyxHQUFHLElBQUksQ0FBQ0EsQ0FBQztJQUNoQixJQUFJLENBQUNDLENBQUMsR0FBRyxJQUFJckIsU0FBUyxDQUFFVSxDQUFDLEdBQUdTLEVBQUcsQ0FBQztJQUNoQyxNQUFNRSxDQUFDLEdBQUcsSUFBSSxDQUFDQSxDQUFDO0lBQ2hCLElBQUksQ0FBQ0MsQ0FBQyxHQUFHLElBQUl0QixTQUFTLENBQUVZLENBQUMsR0FBR0EsQ0FBRSxDQUFDO0lBQy9CLE1BQU1VLENBQUMsR0FBRyxJQUFJLENBQUNBLENBQUM7SUFDaEIsTUFBTUMsQ0FBQyxHQUFHLElBQUl2QixTQUFTLENBQUVZLENBQUUsQ0FBQztJQUM1QixNQUFNWSxJQUFJLEdBQUcsSUFBSXhCLFNBQVMsQ0FBRVUsQ0FBRSxDQUFDO0lBQy9CLE1BQU1lLEtBQUssR0FBRyxJQUFJO0lBQ2xCLE1BQU1DLEtBQUssR0FBRyxJQUFJO0lBRWxCLElBQUlDLENBQUM7SUFDTCxJQUFJQyxDQUFDO0lBQ0wsSUFBSUMsQ0FBQztJQUNMLElBQUlDLENBQUM7SUFDTCxJQUFJQyxDQUFDO0lBRUwsSUFBSUMsRUFBRTtJQUNOLElBQUlDLEVBQUU7SUFFTixNQUFNQyxLQUFLLEdBQUduQyxNQUFNLENBQUNtQyxLQUFLOztJQUUxQjtJQUNBOztJQUVBLE1BQU1DLEdBQUcsR0FBR3JCLEdBQUcsQ0FBRUosQ0FBQyxHQUFHLENBQUMsRUFBRUUsQ0FBRSxDQUFDO0lBQzNCLE1BQU13QixHQUFHLEdBQUdwQixHQUFHLENBQUUsQ0FBQyxFQUFFRixHQUFHLENBQUVGLENBQUMsR0FBRyxDQUFDLEVBQUVGLENBQUUsQ0FBRSxDQUFDO0lBQ3JDLEtBQU1tQixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdiLEdBQUcsQ0FBRW1CLEdBQUcsRUFBRUMsR0FBSSxDQUFDLEVBQUVQLENBQUMsRUFBRSxFQUFHO01BQ3RDLElBQUtBLENBQUMsR0FBR00sR0FBRyxFQUFHO1FBRWI7UUFDQTtRQUNBO1FBQ0FmLENBQUMsQ0FBRVMsQ0FBQyxDQUFFLEdBQUcsQ0FBQztRQUNWLEtBQU1GLENBQUMsR0FBR0UsQ0FBQyxFQUFFRixDQUFDLEdBQUdqQixDQUFDLEVBQUVpQixDQUFDLEVBQUUsRUFBRztVQUN4QlAsQ0FBQyxDQUFFUyxDQUFDLENBQUUsR0FBR0ssS0FBSyxDQUFFZCxDQUFDLENBQUVTLENBQUMsQ0FBRSxFQUFFckIsQ0FBQyxDQUFFbUIsQ0FBQyxHQUFHZixDQUFDLEdBQUdpQixDQUFDLENBQUcsQ0FBQztRQUMxQztRQUNBLElBQUtULENBQUMsQ0FBRVMsQ0FBQyxDQUFFLEtBQUssR0FBRyxFQUFHO1VBQ3BCLElBQUtyQixDQUFDLENBQUVxQixDQUFDLEdBQUdqQixDQUFDLEdBQUdpQixDQUFDLENBQUUsR0FBRyxHQUFHLEVBQUc7WUFDMUJULENBQUMsQ0FBRVMsQ0FBQyxDQUFFLEdBQUcsQ0FBQ1QsQ0FBQyxDQUFFUyxDQUFDLENBQUU7VUFDbEI7VUFDQSxLQUFNRixDQUFDLEdBQUdFLENBQUMsRUFBRUYsQ0FBQyxHQUFHakIsQ0FBQyxFQUFFaUIsQ0FBQyxFQUFFLEVBQUc7WUFDeEJuQixDQUFDLENBQUVtQixDQUFDLEdBQUdmLENBQUMsR0FBR2lCLENBQUMsQ0FBRSxJQUFJVCxDQUFDLENBQUVTLENBQUMsQ0FBRTtVQUMxQjtVQUNBckIsQ0FBQyxDQUFFcUIsQ0FBQyxHQUFHakIsQ0FBQyxHQUFHaUIsQ0FBQyxDQUFFLElBQUksR0FBRztRQUN2QjtRQUNBVCxDQUFDLENBQUVTLENBQUMsQ0FBRSxHQUFHLENBQUNULENBQUMsQ0FBRVMsQ0FBQyxDQUFFO01BQ2xCO01BQ0EsS0FBTUQsQ0FBQyxHQUFHQyxDQUFDLEdBQUcsQ0FBQyxFQUFFRCxDQUFDLEdBQUdoQixDQUFDLEVBQUVnQixDQUFDLEVBQUUsRUFBRztRQUM1QixJQUFPQyxDQUFDLEdBQUdNLEdBQUcsSUFBUWYsQ0FBQyxDQUFFUyxDQUFDLENBQUUsS0FBSyxHQUFLLEVBQUc7VUFFdkM7O1VBRUFDLENBQUMsR0FBRyxDQUFDO1VBQ0wsS0FBTUgsQ0FBQyxHQUFHRSxDQUFDLEVBQUVGLENBQUMsR0FBR2pCLENBQUMsRUFBRWlCLENBQUMsRUFBRSxFQUFHO1lBQ3hCRyxDQUFDLElBQUl0QixDQUFDLENBQUVtQixDQUFDLEdBQUdmLENBQUMsR0FBR2lCLENBQUMsQ0FBRSxHQUFHckIsQ0FBQyxDQUFFbUIsQ0FBQyxHQUFHZixDQUFDLEdBQUdnQixDQUFDLENBQUU7VUFDdEM7VUFDQUUsQ0FBQyxHQUFHLENBQUNBLENBQUMsR0FBR3RCLENBQUMsQ0FBRXFCLENBQUMsR0FBR2pCLENBQUMsR0FBR2lCLENBQUMsQ0FBRTtVQUN2QixLQUFNRixDQUFDLEdBQUdFLENBQUMsRUFBRUYsQ0FBQyxHQUFHakIsQ0FBQyxFQUFFaUIsQ0FBQyxFQUFFLEVBQUc7WUFDeEJuQixDQUFDLENBQUVtQixDQUFDLEdBQUdmLENBQUMsR0FBR2dCLENBQUMsQ0FBRSxJQUFJRSxDQUFDLEdBQUd0QixDQUFDLENBQUVtQixDQUFDLEdBQUdmLENBQUMsR0FBR2lCLENBQUMsQ0FBRTtVQUN0QztRQUNGOztRQUVBO1FBQ0E7O1FBRUFOLENBQUMsQ0FBRUssQ0FBQyxDQUFFLEdBQUdwQixDQUFDLENBQUVxQixDQUFDLEdBQUdqQixDQUFDLEdBQUdnQixDQUFDLENBQUU7TUFDekI7TUFDQSxJQUFLSCxLQUFLLElBQU1JLENBQUMsR0FBR00sR0FBSyxFQUFHO1FBRTFCO1FBQ0E7O1FBRUEsS0FBTVIsQ0FBQyxHQUFHRSxDQUFDLEVBQUVGLENBQUMsR0FBR2pCLENBQUMsRUFBRWlCLENBQUMsRUFBRSxFQUFHO1VBQ3hCTixDQUFDLENBQUVNLENBQUMsR0FBR1IsRUFBRSxHQUFHVSxDQUFDLENBQUUsR0FBR3JCLENBQUMsQ0FBRW1CLENBQUMsR0FBR2YsQ0FBQyxHQUFHaUIsQ0FBQyxDQUFFO1FBQ2xDO01BQ0Y7TUFDQSxJQUFLQSxDQUFDLEdBQUdPLEdBQUcsRUFBRztRQUViO1FBQ0E7UUFDQTtRQUNBYixDQUFDLENBQUVNLENBQUMsQ0FBRSxHQUFHLENBQUM7UUFDVixLQUFNRixDQUFDLEdBQUdFLENBQUMsR0FBRyxDQUFDLEVBQUVGLENBQUMsR0FBR2YsQ0FBQyxFQUFFZSxDQUFDLEVBQUUsRUFBRztVQUM1QkosQ0FBQyxDQUFFTSxDQUFDLENBQUUsR0FBR0ssS0FBSyxDQUFFWCxDQUFDLENBQUVNLENBQUMsQ0FBRSxFQUFFTixDQUFDLENBQUVJLENBQUMsQ0FBRyxDQUFDO1FBQ2xDO1FBQ0EsSUFBS0osQ0FBQyxDQUFFTSxDQUFDLENBQUUsS0FBSyxHQUFHLEVBQUc7VUFDcEIsSUFBS04sQ0FBQyxDQUFFTSxDQUFDLEdBQUcsQ0FBQyxDQUFFLEdBQUcsR0FBRyxFQUFHO1lBQ3RCTixDQUFDLENBQUVNLENBQUMsQ0FBRSxHQUFHLENBQUNOLENBQUMsQ0FBRU0sQ0FBQyxDQUFFO1VBQ2xCO1VBQ0EsS0FBTUYsQ0FBQyxHQUFHRSxDQUFDLEdBQUcsQ0FBQyxFQUFFRixDQUFDLEdBQUdmLENBQUMsRUFBRWUsQ0FBQyxFQUFFLEVBQUc7WUFDNUJKLENBQUMsQ0FBRUksQ0FBQyxDQUFFLElBQUlKLENBQUMsQ0FBRU0sQ0FBQyxDQUFFO1VBQ2xCO1VBQ0FOLENBQUMsQ0FBRU0sQ0FBQyxHQUFHLENBQUMsQ0FBRSxJQUFJLEdBQUc7UUFDbkI7UUFDQU4sQ0FBQyxDQUFFTSxDQUFDLENBQUUsR0FBRyxDQUFDTixDQUFDLENBQUVNLENBQUMsQ0FBRTtRQUNoQixJQUFPQSxDQUFDLEdBQUcsQ0FBQyxHQUFHbkIsQ0FBQyxJQUFRYSxDQUFDLENBQUVNLENBQUMsQ0FBRSxLQUFLLEdBQUssRUFBRztVQUV6Qzs7VUFFQSxLQUFNRixDQUFDLEdBQUdFLENBQUMsR0FBRyxDQUFDLEVBQUVGLENBQUMsR0FBR2pCLENBQUMsRUFBRWlCLENBQUMsRUFBRSxFQUFHO1lBQzVCSCxJQUFJLENBQUVHLENBQUMsQ0FBRSxHQUFHLEdBQUc7VUFDakI7VUFDQSxLQUFNQyxDQUFDLEdBQUdDLENBQUMsR0FBRyxDQUFDLEVBQUVELENBQUMsR0FBR2hCLENBQUMsRUFBRWdCLENBQUMsRUFBRSxFQUFHO1lBQzVCLEtBQU1ELENBQUMsR0FBR0UsQ0FBQyxHQUFHLENBQUMsRUFBRUYsQ0FBQyxHQUFHakIsQ0FBQyxFQUFFaUIsQ0FBQyxFQUFFLEVBQUc7Y0FDNUJILElBQUksQ0FBRUcsQ0FBQyxDQUFFLElBQUlKLENBQUMsQ0FBRUssQ0FBQyxDQUFFLEdBQUdwQixDQUFDLENBQUVtQixDQUFDLEdBQUdmLENBQUMsR0FBR2dCLENBQUMsQ0FBRTtZQUN0QztVQUNGO1VBQ0EsS0FBTUEsQ0FBQyxHQUFHQyxDQUFDLEdBQUcsQ0FBQyxFQUFFRCxDQUFDLEdBQUdoQixDQUFDLEVBQUVnQixDQUFDLEVBQUUsRUFBRztZQUM1QkUsQ0FBQyxHQUFHLENBQUNQLENBQUMsQ0FBRUssQ0FBQyxDQUFFLEdBQUdMLENBQUMsQ0FBRU0sQ0FBQyxHQUFHLENBQUMsQ0FBRTtZQUN4QixLQUFNRixDQUFDLEdBQUdFLENBQUMsR0FBRyxDQUFDLEVBQUVGLENBQUMsR0FBR2pCLENBQUMsRUFBRWlCLENBQUMsRUFBRSxFQUFHO2NBQzVCbkIsQ0FBQyxDQUFFbUIsQ0FBQyxHQUFHZixDQUFDLEdBQUdnQixDQUFDLENBQUUsSUFBSUUsQ0FBQyxHQUFHTixJQUFJLENBQUVHLENBQUMsQ0FBRTtZQUNqQztVQUNGO1FBQ0Y7UUFDQSxJQUFLRCxLQUFLLEVBQUc7VUFFWDtVQUNBOztVQUVBLEtBQU1DLENBQUMsR0FBR0UsQ0FBQyxHQUFHLENBQUMsRUFBRUYsQ0FBQyxHQUFHZixDQUFDLEVBQUVlLENBQUMsRUFBRSxFQUFHO1lBQzVCTCxDQUFDLENBQUVLLENBQUMsR0FBR2YsQ0FBQyxHQUFHaUIsQ0FBQyxDQUFFLEdBQUdOLENBQUMsQ0FBRUksQ0FBQyxDQUFFO1VBQ3pCO1FBQ0Y7TUFDRjtJQUNGOztJQUVBOztJQUVBLElBQUlVLENBQUMsR0FBR3ZCLEdBQUcsQ0FBRUYsQ0FBQyxFQUFFRixDQUFDLEdBQUcsQ0FBRSxDQUFDO0lBQ3ZCLElBQUt5QixHQUFHLEdBQUd2QixDQUFDLEVBQUc7TUFDYlEsQ0FBQyxDQUFFZSxHQUFHLENBQUUsR0FBRzNCLENBQUMsQ0FBRTJCLEdBQUcsR0FBR3ZCLENBQUMsR0FBR3VCLEdBQUcsQ0FBRTtJQUMvQjtJQUNBLElBQUt6QixDQUFDLEdBQUcyQixDQUFDLEVBQUc7TUFDWGpCLENBQUMsQ0FBRWlCLENBQUMsR0FBRyxDQUFDLENBQUUsR0FBRyxHQUFHO0lBQ2xCO0lBQ0EsSUFBS0QsR0FBRyxHQUFHLENBQUMsR0FBR0MsQ0FBQyxFQUFHO01BQ2pCZCxDQUFDLENBQUVhLEdBQUcsQ0FBRSxHQUFHNUIsQ0FBQyxDQUFFNEIsR0FBRyxHQUFHeEIsQ0FBQyxHQUFHeUIsQ0FBQyxHQUFHLENBQUMsQ0FBRTtJQUNqQztJQUNBZCxDQUFDLENBQUVjLENBQUMsR0FBRyxDQUFDLENBQUUsR0FBRyxHQUFHOztJQUVoQjs7SUFFQSxJQUFLWixLQUFLLEVBQUc7TUFDWCxLQUFNRyxDQUFDLEdBQUdPLEdBQUcsRUFBRVAsQ0FBQyxHQUFHVCxFQUFFLEVBQUVTLENBQUMsRUFBRSxFQUFHO1FBQzNCLEtBQU1ELENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2pCLENBQUMsRUFBRWlCLENBQUMsRUFBRSxFQUFHO1VBQ3hCTixDQUFDLENBQUVNLENBQUMsR0FBR1IsRUFBRSxHQUFHUyxDQUFDLENBQUUsR0FBRyxHQUFHO1FBQ3ZCO1FBQ0FQLENBQUMsQ0FBRU8sQ0FBQyxHQUFHVCxFQUFFLEdBQUdTLENBQUMsQ0FBRSxHQUFHLEdBQUc7TUFDdkI7TUFDQSxLQUFNQyxDQUFDLEdBQUdNLEdBQUcsR0FBRyxDQUFDLEVBQUVOLENBQUMsSUFBSSxDQUFDLEVBQUVBLENBQUMsRUFBRSxFQUFHO1FBQy9CLElBQUtULENBQUMsQ0FBRVMsQ0FBQyxDQUFFLEtBQUssR0FBRyxFQUFHO1VBQ3BCLEtBQU1ELENBQUMsR0FBR0MsQ0FBQyxHQUFHLENBQUMsRUFBRUQsQ0FBQyxHQUFHVCxFQUFFLEVBQUVTLENBQUMsRUFBRSxFQUFHO1lBQzdCRSxDQUFDLEdBQUcsQ0FBQztZQUNMLEtBQU1ILENBQUMsR0FBR0UsQ0FBQyxFQUFFRixDQUFDLEdBQUdqQixDQUFDLEVBQUVpQixDQUFDLEVBQUUsRUFBRztjQUN4QkcsQ0FBQyxJQUFJVCxDQUFDLENBQUVNLENBQUMsR0FBR1IsRUFBRSxHQUFHVSxDQUFDLENBQUUsR0FBR1IsQ0FBQyxDQUFFTSxDQUFDLEdBQUdSLEVBQUUsR0FBR1MsQ0FBQyxDQUFFO1lBQ3hDO1lBQ0FFLENBQUMsR0FBRyxDQUFDQSxDQUFDLEdBQUdULENBQUMsQ0FBRVEsQ0FBQyxHQUFHVixFQUFFLEdBQUdVLENBQUMsQ0FBRTtZQUN4QixLQUFNRixDQUFDLEdBQUdFLENBQUMsRUFBRUYsQ0FBQyxHQUFHakIsQ0FBQyxFQUFFaUIsQ0FBQyxFQUFFLEVBQUc7Y0FDeEJOLENBQUMsQ0FBRU0sQ0FBQyxHQUFHUixFQUFFLEdBQUdTLENBQUMsQ0FBRSxJQUFJRSxDQUFDLEdBQUdULENBQUMsQ0FBRU0sQ0FBQyxHQUFHUixFQUFFLEdBQUdVLENBQUMsQ0FBRTtZQUN4QztVQUNGO1VBQ0EsS0FBTUYsQ0FBQyxHQUFHRSxDQUFDLEVBQUVGLENBQUMsR0FBR2pCLENBQUMsRUFBRWlCLENBQUMsRUFBRSxFQUFHO1lBQ3hCTixDQUFDLENBQUVNLENBQUMsR0FBR1IsRUFBRSxHQUFHVSxDQUFDLENBQUUsR0FBRyxDQUFDUixDQUFDLENBQUVNLENBQUMsR0FBR1IsRUFBRSxHQUFHVSxDQUFDLENBQUU7VUFDcEM7VUFDQVIsQ0FBQyxDQUFFUSxDQUFDLEdBQUdWLEVBQUUsR0FBR1UsQ0FBQyxDQUFFLEdBQUcsR0FBRyxHQUFHUixDQUFDLENBQUVRLENBQUMsR0FBR1YsRUFBRSxHQUFHVSxDQUFDLENBQUU7VUFDdkMsS0FBTUYsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRSxDQUFDLEdBQUcsQ0FBQyxFQUFFRixDQUFDLEVBQUUsRUFBRztZQUM1Qk4sQ0FBQyxDQUFFTSxDQUFDLEdBQUdSLEVBQUUsR0FBR1UsQ0FBQyxDQUFFLEdBQUcsR0FBRztVQUN2QjtRQUNGLENBQUMsTUFDSTtVQUNILEtBQU1GLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2pCLENBQUMsRUFBRWlCLENBQUMsRUFBRSxFQUFHO1lBQ3hCTixDQUFDLENBQUVNLENBQUMsR0FBR1IsRUFBRSxHQUFHVSxDQUFDLENBQUUsR0FBRyxHQUFHO1VBQ3ZCO1VBQ0FSLENBQUMsQ0FBRVEsQ0FBQyxHQUFHVixFQUFFLEdBQUdVLENBQUMsQ0FBRSxHQUFHLEdBQUc7UUFDdkI7TUFDRjtJQUNGOztJQUVBOztJQUVBLElBQUtILEtBQUssRUFBRztNQUNYLEtBQU1HLENBQUMsR0FBR2pCLENBQUMsR0FBRyxDQUFDLEVBQUVpQixDQUFDLElBQUksQ0FBQyxFQUFFQSxDQUFDLEVBQUUsRUFBRztRQUM3QixJQUFPQSxDQUFDLEdBQUdPLEdBQUcsSUFBUWIsQ0FBQyxDQUFFTSxDQUFDLENBQUUsS0FBSyxHQUFLLEVBQUc7VUFDdkMsS0FBTUQsQ0FBQyxHQUFHQyxDQUFDLEdBQUcsQ0FBQyxFQUFFRCxDQUFDLEdBQUdULEVBQUUsRUFBRVMsQ0FBQyxFQUFFLEVBQUc7WUFDN0JFLENBQUMsR0FBRyxDQUFDO1lBQ0wsS0FBTUgsQ0FBQyxHQUFHRSxDQUFDLEdBQUcsQ0FBQyxFQUFFRixDQUFDLEdBQUdmLENBQUMsRUFBRWUsQ0FBQyxFQUFFLEVBQUc7Y0FDNUJHLENBQUMsSUFBSVIsQ0FBQyxDQUFFSyxDQUFDLEdBQUdmLENBQUMsR0FBR2lCLENBQUMsQ0FBRSxHQUFHUCxDQUFDLENBQUVLLENBQUMsR0FBR2YsQ0FBQyxHQUFHZ0IsQ0FBQyxDQUFFO1lBQ3RDO1lBQ0FFLENBQUMsR0FBRyxDQUFDQSxDQUFDLEdBQUdSLENBQUMsQ0FBRSxDQUFFTyxDQUFDLEdBQUcsQ0FBQyxJQUFLakIsQ0FBQyxHQUFHaUIsQ0FBQyxDQUFFO1lBQy9CLEtBQU1GLENBQUMsR0FBR0UsQ0FBQyxHQUFHLENBQUMsRUFBRUYsQ0FBQyxHQUFHZixDQUFDLEVBQUVlLENBQUMsRUFBRSxFQUFHO2NBQzVCTCxDQUFDLENBQUVLLENBQUMsR0FBR2YsQ0FBQyxHQUFHZ0IsQ0FBQyxDQUFFLElBQUlFLENBQUMsR0FBR1IsQ0FBQyxDQUFFSyxDQUFDLEdBQUdmLENBQUMsR0FBR2lCLENBQUMsQ0FBRTtZQUN0QztVQUNGO1FBQ0Y7UUFDQSxLQUFNRixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdmLENBQUMsRUFBRWUsQ0FBQyxFQUFFLEVBQUc7VUFDeEJMLENBQUMsQ0FBRUssQ0FBQyxHQUFHZixDQUFDLEdBQUdpQixDQUFDLENBQUUsR0FBRyxHQUFHO1FBQ3RCO1FBQ0FQLENBQUMsQ0FBRU8sQ0FBQyxHQUFHakIsQ0FBQyxHQUFHaUIsQ0FBQyxDQUFFLEdBQUcsR0FBRztNQUN0QjtJQUNGOztJQUVBOztJQUVBLE1BQU1TLEVBQUUsR0FBR0QsQ0FBQyxHQUFHLENBQUM7SUFDaEIsSUFBSUUsSUFBSSxHQUFHLENBQUM7SUFDWixNQUFNQyxHQUFHLEdBQUd2QixHQUFHLENBQUUsR0FBRyxFQUFFLENBQUMsSUFBSyxDQUFDO0lBQzdCLE1BQU13QixJQUFJLEdBQUd4QixHQUFHLENBQUUsR0FBRyxFQUFFLENBQUMsS0FBTSxDQUFDO0lBQy9CLE9BQVFvQixDQUFDLEdBQUcsQ0FBQyxFQUFHO01BQ2QsSUFBSUssSUFBSTs7TUFFUjtNQUNBLElBQUtILElBQUksR0FBRyxHQUFHLEVBQUc7UUFDaEI7TUFDRjs7TUFFQTtNQUNBO01BQ0E7O01BRUE7TUFDQTtNQUNBO01BQ0E7TUFDQTs7TUFFQSxLQUFNVixDQUFDLEdBQUdRLENBQUMsR0FBRyxDQUFDLEVBQUVSLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRUEsQ0FBQyxFQUFFLEVBQUc7UUFDOUIsSUFBS0EsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFHO1VBQ2Q7UUFDRjtRQUNBLElBQUtYLEdBQUcsQ0FBRUssQ0FBQyxDQUFFTSxDQUFDLENBQUcsQ0FBQyxJQUNiWSxJQUFJLEdBQUdELEdBQUcsSUFBS3RCLEdBQUcsQ0FBRUUsQ0FBQyxDQUFFUyxDQUFDLENBQUcsQ0FBQyxHQUFHWCxHQUFHLENBQUVFLENBQUMsQ0FBRVMsQ0FBQyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRztVQUN4RE4sQ0FBQyxDQUFFTSxDQUFDLENBQUUsR0FBRyxHQUFHO1VBQ1o7UUFDRjtNQUNGO01BQ0EsSUFBS0EsQ0FBQyxLQUFLUSxDQUFDLEdBQUcsQ0FBQyxFQUFHO1FBQ2pCSyxJQUFJLEdBQUcsQ0FBQztNQUNWLENBQUMsTUFDSTtRQUNILElBQUlDLEVBQUU7UUFDTixLQUFNQSxFQUFFLEdBQUdOLENBQUMsR0FBRyxDQUFDLEVBQUVNLEVBQUUsSUFBSWQsQ0FBQyxFQUFFYyxFQUFFLEVBQUUsRUFBRztVQUNoQyxJQUFLQSxFQUFFLEtBQUtkLENBQUMsRUFBRztZQUNkO1VBQ0Y7VUFDQUMsQ0FBQyxHQUFHLENBQUVhLEVBQUUsS0FBS04sQ0FBQyxHQUFHbkIsR0FBRyxDQUFFSyxDQUFDLENBQUVvQixFQUFFLENBQUcsQ0FBQyxHQUFHLENBQUMsS0FDN0JBLEVBQUUsS0FBS2QsQ0FBQyxHQUFHLENBQUMsR0FBR1gsR0FBRyxDQUFFSyxDQUFDLENBQUVvQixFQUFFLEdBQUcsQ0FBQyxDQUFHLENBQUMsR0FBRyxDQUFDLENBQUU7VUFDN0MsSUFBS3pCLEdBQUcsQ0FBRUUsQ0FBQyxDQUFFdUIsRUFBRSxDQUFHLENBQUMsSUFBSUYsSUFBSSxHQUFHRCxHQUFHLEdBQUdWLENBQUMsRUFBRztZQUN0Q1YsQ0FBQyxDQUFFdUIsRUFBRSxDQUFFLEdBQUcsR0FBRztZQUNiO1VBQ0Y7UUFDRjtRQUNBLElBQUtBLEVBQUUsS0FBS2QsQ0FBQyxFQUFHO1VBQ2RhLElBQUksR0FBRyxDQUFDO1FBQ1YsQ0FBQyxNQUNJLElBQUtDLEVBQUUsS0FBS04sQ0FBQyxHQUFHLENBQUMsRUFBRztVQUN2QkssSUFBSSxHQUFHLENBQUM7UUFDVixDQUFDLE1BQ0k7VUFDSEEsSUFBSSxHQUFHLENBQUM7VUFDUmIsQ0FBQyxHQUFHYyxFQUFFO1FBQ1I7TUFDRjtNQUNBZCxDQUFDLEVBQUU7O01BRUg7O01BRUEsUUFBUWEsSUFBSTtRQUVWOztRQUVBLEtBQUssQ0FBQztVQUFFO1lBQ05YLENBQUMsR0FBR1IsQ0FBQyxDQUFFYyxDQUFDLEdBQUcsQ0FBQyxDQUFFO1lBQ2RkLENBQUMsQ0FBRWMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxHQUFHLEdBQUc7WUFDaEIsS0FBTVQsQ0FBQyxHQUFHUyxDQUFDLEdBQUcsQ0FBQyxFQUFFVCxDQUFDLElBQUlDLENBQUMsRUFBRUQsQ0FBQyxFQUFFLEVBQUc7Y0FDN0JFLENBQUMsR0FBR0ksS0FBSyxDQUFFZCxDQUFDLENBQUVRLENBQUMsQ0FBRSxFQUFFRyxDQUFFLENBQUM7Y0FDdEJDLEVBQUUsR0FBR1osQ0FBQyxDQUFFUSxDQUFDLENBQUUsR0FBR0UsQ0FBQztjQUNmRyxFQUFFLEdBQUdGLENBQUMsR0FBR0QsQ0FBQztjQUNWVixDQUFDLENBQUVRLENBQUMsQ0FBRSxHQUFHRSxDQUFDO2NBQ1YsSUFBS0YsQ0FBQyxLQUFLQyxDQUFDLEVBQUc7Z0JBQ2JFLENBQUMsR0FBRyxDQUFDRSxFQUFFLEdBQUdWLENBQUMsQ0FBRUssQ0FBQyxHQUFHLENBQUMsQ0FBRTtnQkFDcEJMLENBQUMsQ0FBRUssQ0FBQyxHQUFHLENBQUMsQ0FBRSxHQUFHSSxFQUFFLEdBQUdULENBQUMsQ0FBRUssQ0FBQyxHQUFHLENBQUMsQ0FBRTtjQUM5QjtjQUNBLElBQUtGLEtBQUssRUFBRztnQkFDWCxLQUFNQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdmLENBQUMsRUFBRWUsQ0FBQyxFQUFFLEVBQUc7a0JBQ3hCRyxDQUFDLEdBQUdFLEVBQUUsR0FBR1YsQ0FBQyxDQUFFSyxDQUFDLEdBQUdmLENBQUMsR0FBR2dCLENBQUMsQ0FBRSxHQUFHSyxFQUFFLEdBQUdYLENBQUMsQ0FBRUssQ0FBQyxHQUFHZixDQUFDLEdBQUd5QixDQUFDLEdBQUcsQ0FBQyxDQUFFO2tCQUNqRGYsQ0FBQyxDQUFFSyxDQUFDLEdBQUdmLENBQUMsR0FBR3lCLENBQUMsR0FBRyxDQUFDLENBQUUsR0FBRyxDQUFDSixFQUFFLEdBQUdYLENBQUMsQ0FBRUssQ0FBQyxHQUFHZixDQUFDLEdBQUdnQixDQUFDLENBQUUsR0FBR0ksRUFBRSxHQUFHVixDQUFDLENBQUVLLENBQUMsR0FBR2YsQ0FBQyxHQUFHeUIsQ0FBQyxHQUFHLENBQUMsQ0FBRTtrQkFDbkVmLENBQUMsQ0FBRUssQ0FBQyxHQUFHZixDQUFDLEdBQUdnQixDQUFDLENBQUUsR0FBR0UsQ0FBQztnQkFDcEI7Y0FDRjtZQUNGO1VBQ0Y7VUFDRTs7UUFFRjs7UUFFQSxLQUFLLENBQUM7VUFBRTtZQUNOQyxDQUFDLEdBQUdSLENBQUMsQ0FBRU0sQ0FBQyxHQUFHLENBQUMsQ0FBRTtZQUNkTixDQUFDLENBQUVNLENBQUMsR0FBRyxDQUFDLENBQUUsR0FBRyxHQUFHO1lBQ2hCLEtBQU1ELENBQUMsR0FBR0MsQ0FBQyxFQUFFRCxDQUFDLEdBQUdTLENBQUMsRUFBRVQsQ0FBQyxFQUFFLEVBQUc7Y0FDeEJFLENBQUMsR0FBR0ksS0FBSyxDQUFFZCxDQUFDLENBQUVRLENBQUMsQ0FBRSxFQUFFRyxDQUFFLENBQUM7Y0FDdEJDLEVBQUUsR0FBR1osQ0FBQyxDQUFFUSxDQUFDLENBQUUsR0FBR0UsQ0FBQztjQUNmRyxFQUFFLEdBQUdGLENBQUMsR0FBR0QsQ0FBQztjQUNWVixDQUFDLENBQUVRLENBQUMsQ0FBRSxHQUFHRSxDQUFDO2NBQ1ZDLENBQUMsR0FBRyxDQUFDRSxFQUFFLEdBQUdWLENBQUMsQ0FBRUssQ0FBQyxDQUFFO2NBQ2hCTCxDQUFDLENBQUVLLENBQUMsQ0FBRSxHQUFHSSxFQUFFLEdBQUdULENBQUMsQ0FBRUssQ0FBQyxDQUFFO2NBQ3BCLElBQUtILEtBQUssRUFBRztnQkFDWCxLQUFNRSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdqQixDQUFDLEVBQUVpQixDQUFDLEVBQUUsRUFBRztrQkFDeEJHLENBQUMsR0FBR0UsRUFBRSxHQUFHWCxDQUFDLENBQUVNLENBQUMsR0FBR1IsRUFBRSxHQUFHUyxDQUFDLENBQUUsR0FBR0ssRUFBRSxHQUFHWixDQUFDLENBQUVNLENBQUMsR0FBR1IsRUFBRSxHQUFHVSxDQUFDLEdBQUcsQ0FBQyxDQUFFO2tCQUNuRFIsQ0FBQyxDQUFFTSxDQUFDLEdBQUdSLEVBQUUsR0FBR1UsQ0FBQyxHQUFHLENBQUMsQ0FBRSxHQUFHLENBQUNJLEVBQUUsR0FBR1osQ0FBQyxDQUFFTSxDQUFDLEdBQUdSLEVBQUUsR0FBR1MsQ0FBQyxDQUFFLEdBQUdJLEVBQUUsR0FBR1gsQ0FBQyxDQUFFTSxDQUFDLEdBQUdSLEVBQUUsR0FBR1UsQ0FBQyxHQUFHLENBQUMsQ0FBRTtrQkFDdEVSLENBQUMsQ0FBRU0sQ0FBQyxHQUFHUixFQUFFLEdBQUdTLENBQUMsQ0FBRSxHQUFHRSxDQUFDO2dCQUNyQjtjQUNGO1lBQ0Y7VUFDRjtVQUNFOztRQUVGOztRQUVBLEtBQUssQ0FBQztVQUFFO1lBRU47O1lBRUEsTUFBTWMsS0FBSyxHQUFHNUIsR0FBRyxDQUFFQSxHQUFHLENBQUVBLEdBQUcsQ0FBRUEsR0FBRyxDQUFFRSxHQUFHLENBQUVFLENBQUMsQ0FBRWlCLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQyxFQUFFbkIsR0FBRyxDQUFFRSxDQUFDLENBQUVpQixDQUFDLEdBQUcsQ0FBQyxDQUFHLENBQUUsQ0FBQyxFQUFFbkIsR0FBRyxDQUFFSyxDQUFDLENBQUVjLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBRSxDQUFDLEVBQUVuQixHQUFHLENBQUVFLENBQUMsQ0FBRVMsQ0FBQyxDQUFHLENBQUUsQ0FBQyxFQUFFWCxHQUFHLENBQUVLLENBQUMsQ0FBRU0sQ0FBQyxDQUFHLENBQUUsQ0FBQztZQUMvSCxNQUFNZ0IsRUFBRSxHQUFHekIsQ0FBQyxDQUFFaUIsQ0FBQyxHQUFHLENBQUMsQ0FBRSxHQUFHTyxLQUFLO1lBQzdCLE1BQU1FLElBQUksR0FBRzFCLENBQUMsQ0FBRWlCLENBQUMsR0FBRyxDQUFDLENBQUUsR0FBR08sS0FBSztZQUMvQixNQUFNRyxJQUFJLEdBQUd4QixDQUFDLENBQUVjLENBQUMsR0FBRyxDQUFDLENBQUUsR0FBR08sS0FBSztZQUMvQixNQUFNSSxFQUFFLEdBQUc1QixDQUFDLENBQUVTLENBQUMsQ0FBRSxHQUFHZSxLQUFLO1lBQ3pCLE1BQU1LLEVBQUUsR0FBRzFCLENBQUMsQ0FBRU0sQ0FBQyxDQUFFLEdBQUdlLEtBQUs7WUFDekIsTUFBTU0sQ0FBQyxHQUFHLENBQUUsQ0FBRUosSUFBSSxHQUFHRCxFQUFFLEtBQU9DLElBQUksR0FBR0QsRUFBRSxDQUFFLEdBQUdFLElBQUksR0FBR0EsSUFBSSxJQUFLLEdBQUc7WUFDL0QsTUFBTUksQ0FBQyxHQUFLTixFQUFFLEdBQUdFLElBQUksSUFBT0YsRUFBRSxHQUFHRSxJQUFJLENBQUU7WUFDdkMsSUFBSUssS0FBSyxHQUFHLEdBQUc7WUFDZixJQUFPRixDQUFDLEtBQUssR0FBRyxJQUFRQyxDQUFDLEtBQUssR0FBSyxFQUFHO2NBQ3BDQyxLQUFLLEdBQUdyQyxJQUFJLENBQUNzQyxJQUFJLENBQUVILENBQUMsR0FBR0EsQ0FBQyxHQUFHQyxDQUFFLENBQUM7Y0FDOUIsSUFBS0QsQ0FBQyxHQUFHLEdBQUcsRUFBRztnQkFDYkUsS0FBSyxHQUFHLENBQUNBLEtBQUs7Y0FDaEI7Y0FDQUEsS0FBSyxHQUFHRCxDQUFDLElBQUtELENBQUMsR0FBR0UsS0FBSyxDQUFFO1lBQzNCO1lBQ0FyQixDQUFDLEdBQUcsQ0FBRWlCLEVBQUUsR0FBR0gsRUFBRSxLQUFPRyxFQUFFLEdBQUdILEVBQUUsQ0FBRSxHQUFHTyxLQUFLO1lBQ3JDLElBQUlFLENBQUMsR0FBR04sRUFBRSxHQUFHQyxFQUFFOztZQUVmOztZQUVBLEtBQU1yQixDQUFDLEdBQUdDLENBQUMsRUFBRUQsQ0FBQyxHQUFHUyxDQUFDLEdBQUcsQ0FBQyxFQUFFVCxDQUFDLEVBQUUsRUFBRztjQUM1QkUsQ0FBQyxHQUFHSSxLQUFLLENBQUVILENBQUMsRUFBRXVCLENBQUUsQ0FBQztjQUNqQnRCLEVBQUUsR0FBR0QsQ0FBQyxHQUFHRCxDQUFDO2NBQ1ZHLEVBQUUsR0FBR3FCLENBQUMsR0FBR3hCLENBQUM7Y0FDVixJQUFLRixDQUFDLEtBQUtDLENBQUMsRUFBRztnQkFDYk4sQ0FBQyxDQUFFSyxDQUFDLEdBQUcsQ0FBQyxDQUFFLEdBQUdFLENBQUM7Y0FDaEI7Y0FDQUMsQ0FBQyxHQUFHQyxFQUFFLEdBQUdaLENBQUMsQ0FBRVEsQ0FBQyxDQUFFLEdBQUdLLEVBQUUsR0FBR1YsQ0FBQyxDQUFFSyxDQUFDLENBQUU7Y0FDN0JMLENBQUMsQ0FBRUssQ0FBQyxDQUFFLEdBQUdJLEVBQUUsR0FBR1QsQ0FBQyxDQUFFSyxDQUFDLENBQUUsR0FBR0ssRUFBRSxHQUFHYixDQUFDLENBQUVRLENBQUMsQ0FBRTtjQUNsQzBCLENBQUMsR0FBR3JCLEVBQUUsR0FBR2IsQ0FBQyxDQUFFUSxDQUFDLEdBQUcsQ0FBQyxDQUFFO2NBQ25CUixDQUFDLENBQUVRLENBQUMsR0FBRyxDQUFDLENBQUUsR0FBR0ksRUFBRSxHQUFHWixDQUFDLENBQUVRLENBQUMsR0FBRyxDQUFDLENBQUU7Y0FDNUIsSUFBS0YsS0FBSyxFQUFHO2dCQUNYLEtBQU1DLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2YsQ0FBQyxFQUFFZSxDQUFDLEVBQUUsRUFBRztrQkFDeEJHLENBQUMsR0FBR0UsRUFBRSxHQUFHVixDQUFDLENBQUVLLENBQUMsR0FBR2YsQ0FBQyxHQUFHZ0IsQ0FBQyxDQUFFLEdBQUdLLEVBQUUsR0FBR1gsQ0FBQyxDQUFFSyxDQUFDLEdBQUdmLENBQUMsR0FBR2dCLENBQUMsR0FBRyxDQUFDLENBQUU7a0JBQ2pETixDQUFDLENBQUVLLENBQUMsR0FBR2YsQ0FBQyxHQUFHZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBRSxHQUFHLENBQUNLLEVBQUUsR0FBR1gsQ0FBQyxDQUFFSyxDQUFDLEdBQUdmLENBQUMsR0FBR2dCLENBQUMsQ0FBRSxHQUFHSSxFQUFFLEdBQUdWLENBQUMsQ0FBRUssQ0FBQyxHQUFHZixDQUFDLEdBQUdnQixDQUFDLEdBQUcsQ0FBQyxDQUFFO2tCQUNuRU4sQ0FBQyxDQUFFSyxDQUFDLEdBQUdmLENBQUMsR0FBR2dCLENBQUMsQ0FBRSxHQUFHRSxDQUFDO2dCQUNwQjtjQUNGO2NBQ0FBLENBQUMsR0FBR0ksS0FBSyxDQUFFSCxDQUFDLEVBQUV1QixDQUFFLENBQUM7Y0FDakJ0QixFQUFFLEdBQUdELENBQUMsR0FBR0QsQ0FBQztjQUNWRyxFQUFFLEdBQUdxQixDQUFDLEdBQUd4QixDQUFDO2NBQ1ZWLENBQUMsQ0FBRVEsQ0FBQyxDQUFFLEdBQUdFLENBQUM7Y0FDVkMsQ0FBQyxHQUFHQyxFQUFFLEdBQUdULENBQUMsQ0FBRUssQ0FBQyxDQUFFLEdBQUdLLEVBQUUsR0FBR2IsQ0FBQyxDQUFFUSxDQUFDLEdBQUcsQ0FBQyxDQUFFO2NBQ2pDUixDQUFDLENBQUVRLENBQUMsR0FBRyxDQUFDLENBQUUsR0FBRyxDQUFDSyxFQUFFLEdBQUdWLENBQUMsQ0FBRUssQ0FBQyxDQUFFLEdBQUdJLEVBQUUsR0FBR1osQ0FBQyxDQUFFUSxDQUFDLEdBQUcsQ0FBQyxDQUFFO2NBQzNDMEIsQ0FBQyxHQUFHckIsRUFBRSxHQUFHVixDQUFDLENBQUVLLENBQUMsR0FBRyxDQUFDLENBQUU7Y0FDbkJMLENBQUMsQ0FBRUssQ0FBQyxHQUFHLENBQUMsQ0FBRSxHQUFHSSxFQUFFLEdBQUdULENBQUMsQ0FBRUssQ0FBQyxHQUFHLENBQUMsQ0FBRTtjQUM1QixJQUFLSCxLQUFLLElBQU1HLENBQUMsR0FBR2xCLENBQUMsR0FBRyxDQUFHLEVBQUc7Z0JBQzVCLEtBQU1pQixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdqQixDQUFDLEVBQUVpQixDQUFDLEVBQUUsRUFBRztrQkFDeEJHLENBQUMsR0FBR0UsRUFBRSxHQUFHWCxDQUFDLENBQUVNLENBQUMsR0FBR1IsRUFBRSxHQUFHUyxDQUFDLENBQUUsR0FBR0ssRUFBRSxHQUFHWixDQUFDLENBQUVNLENBQUMsR0FBR1IsRUFBRSxHQUFHUyxDQUFDLEdBQUcsQ0FBQyxDQUFFO2tCQUNuRFAsQ0FBQyxDQUFFTSxDQUFDLEdBQUdSLEVBQUUsR0FBR1MsQ0FBQyxHQUFHLENBQUMsQ0FBRSxHQUFHLENBQUNLLEVBQUUsR0FBR1osQ0FBQyxDQUFFTSxDQUFDLEdBQUdSLEVBQUUsR0FBR1MsQ0FBQyxDQUFFLEdBQUdJLEVBQUUsR0FBR1gsQ0FBQyxDQUFFTSxDQUFDLEdBQUdSLEVBQUUsR0FBR1MsQ0FBQyxHQUFHLENBQUMsQ0FBRTtrQkFDdEVQLENBQUMsQ0FBRU0sQ0FBQyxHQUFHUixFQUFFLEdBQUdTLENBQUMsQ0FBRSxHQUFHRSxDQUFDO2dCQUNyQjtjQUNGO1lBQ0Y7WUFDQVAsQ0FBQyxDQUFFYyxDQUFDLEdBQUcsQ0FBQyxDQUFFLEdBQUdOLENBQUM7WUFDZFEsSUFBSSxHQUFHQSxJQUFJLEdBQUcsQ0FBQztVQUNqQjtVQUNFOztRQUVGOztRQUVBLEtBQUssQ0FBQztVQUFFO1lBRU47O1lBRUEsSUFBS25CLENBQUMsQ0FBRVMsQ0FBQyxDQUFFLElBQUksR0FBRyxFQUFHO2NBQ25CVCxDQUFDLENBQUVTLENBQUMsQ0FBRSxHQUFLVCxDQUFDLENBQUVTLENBQUMsQ0FBRSxHQUFHLEdBQUcsR0FBRyxDQUFDVCxDQUFDLENBQUVTLENBQUMsQ0FBRSxHQUFHLEdBQUs7Y0FDekMsSUFBS0gsS0FBSyxFQUFHO2dCQUNYLEtBQU1DLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsSUFBSVcsRUFBRSxFQUFFWCxDQUFDLEVBQUUsRUFBRztrQkFDMUJMLENBQUMsQ0FBRUssQ0FBQyxHQUFHZixDQUFDLEdBQUdpQixDQUFDLENBQUUsR0FBRyxDQUFDUCxDQUFDLENBQUVLLENBQUMsR0FBR2YsQ0FBQyxHQUFHaUIsQ0FBQyxDQUFFO2dCQUNsQztjQUNGO1lBQ0Y7O1lBRUE7O1lBRUEsT0FBUUEsQ0FBQyxHQUFHUyxFQUFFLEVBQUc7Y0FDZixJQUFLbEIsQ0FBQyxDQUFFUyxDQUFDLENBQUUsSUFBSVQsQ0FBQyxDQUFFUyxDQUFDLEdBQUcsQ0FBQyxDQUFFLEVBQUc7Z0JBQzFCO2NBQ0Y7Y0FDQUMsQ0FBQyxHQUFHVixDQUFDLENBQUVTLENBQUMsQ0FBRTtjQUNWVCxDQUFDLENBQUVTLENBQUMsQ0FBRSxHQUFHVCxDQUFDLENBQUVTLENBQUMsR0FBRyxDQUFDLENBQUU7Y0FDbkJULENBQUMsQ0FBRVMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxHQUFHQyxDQUFDO2NBQ2QsSUFBS0osS0FBSyxJQUFNRyxDQUFDLEdBQUdqQixDQUFDLEdBQUcsQ0FBRyxFQUFHO2dCQUM1QixLQUFNZSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdmLENBQUMsRUFBRWUsQ0FBQyxFQUFFLEVBQUc7a0JBQ3hCRyxDQUFDLEdBQUdSLENBQUMsQ0FBRUssQ0FBQyxHQUFHZixDQUFDLEdBQUdpQixDQUFDLEdBQUcsQ0FBQyxDQUFFO2tCQUN0QlAsQ0FBQyxDQUFFSyxDQUFDLEdBQUdmLENBQUMsR0FBR2lCLENBQUMsR0FBRyxDQUFDLENBQUUsR0FBR1AsQ0FBQyxDQUFFSyxDQUFDLEdBQUdmLENBQUMsR0FBR2lCLENBQUMsQ0FBRTtrQkFDbkNQLENBQUMsQ0FBRUssQ0FBQyxHQUFHZixDQUFDLEdBQUdpQixDQUFDLENBQUUsR0FBR0MsQ0FBQztnQkFDcEI7Y0FDRjtjQUNBLElBQUtMLEtBQUssSUFBTUksQ0FBQyxHQUFHbkIsQ0FBQyxHQUFHLENBQUcsRUFBRztnQkFDNUIsS0FBTWlCLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2pCLENBQUMsRUFBRWlCLENBQUMsRUFBRSxFQUFHO2tCQUN4QkcsQ0FBQyxHQUFHVCxDQUFDLENBQUVNLENBQUMsR0FBR1IsRUFBRSxHQUFHVSxDQUFDLEdBQUcsQ0FBQyxDQUFFO2tCQUN2QlIsQ0FBQyxDQUFFTSxDQUFDLEdBQUdSLEVBQUUsR0FBR1UsQ0FBQyxHQUFHLENBQUMsQ0FBRSxHQUFHUixDQUFDLENBQUVNLENBQUMsR0FBR1IsRUFBRSxHQUFHVSxDQUFDLENBQUU7a0JBQ3JDUixDQUFDLENBQUVNLENBQUMsR0FBR1IsRUFBRSxHQUFHVSxDQUFDLENBQUUsR0FBR0MsQ0FBQztnQkFDckI7Y0FDRjtjQUNBRCxDQUFDLEVBQUU7WUFDTDtZQUNBVSxJQUFJLEdBQUcsQ0FBQztZQUNSRixDQUFDLEVBQUU7VUFDTDtVQUNFO1FBRUY7VUFDRSxNQUFNLElBQUlrQixLQUFLLENBQUcsaUJBQWdCYixJQUFLLEVBQUUsQ0FBQztNQUM5QztJQUNGO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFYyxJQUFJQSxDQUFBLEVBQUc7SUFDTCxPQUFPLElBQUl6RCxNQUFNLENBQUUsSUFBSSxDQUFDVyxDQUFDLEVBQUVLLElBQUksQ0FBQ0QsR0FBRyxDQUFFLElBQUksQ0FBQ0osQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUNFLENBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQ1MsQ0FBQyxFQUFFLElBQUssQ0FBQyxDQUFDLENBQUM7RUFDN0U7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFb0MsSUFBSUEsQ0FBQSxFQUFHO0lBQ0wsT0FBTyxJQUFJMUQsTUFBTSxDQUFFLElBQUksQ0FBQ2EsQ0FBQyxFQUFFLElBQUksQ0FBQ0EsQ0FBQyxFQUFFLElBQUksQ0FBQ1UsQ0FBQyxFQUFFLElBQUssQ0FBQztFQUNuRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VvQyxpQkFBaUJBLENBQUEsRUFBRztJQUNsQixPQUFPLElBQUksQ0FBQ3RDLENBQUM7RUFDZjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0V1QyxJQUFJQSxDQUFBLEVBQUc7SUFDTCxNQUFNQyxNQUFNLEdBQUcsSUFBSTdELE1BQU0sQ0FBRSxJQUFJLENBQUNhLENBQUMsRUFBRSxJQUFJLENBQUNBLENBQUUsQ0FBQztJQUMzQyxLQUFNLElBQUllLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNmLENBQUMsRUFBRWUsQ0FBQyxFQUFFLEVBQUc7TUFDakMsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDaEIsQ0FBQyxFQUFFZ0IsQ0FBQyxFQUFFLEVBQUc7UUFDakNnQyxNQUFNLENBQUNDLE9BQU8sQ0FBRUQsTUFBTSxDQUFDRSxLQUFLLENBQUVuQyxDQUFDLEVBQUVDLENBQUUsQ0FBQyxDQUFFLEdBQUcsR0FBRztNQUM5QztNQUNBZ0MsTUFBTSxDQUFDQyxPQUFPLENBQUVELE1BQU0sQ0FBQ0UsS0FBSyxDQUFFbkMsQ0FBQyxFQUFFQSxDQUFFLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQ1AsQ0FBQyxDQUFFTyxDQUFDLENBQUU7SUFDdEQ7SUFDQSxPQUFPaUMsTUFBTTtFQUNmOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUcsS0FBS0EsQ0FBQSxFQUFHO0lBQ04sT0FBTyxJQUFJLENBQUMzQyxDQUFDLENBQUUsQ0FBQyxDQUFFO0VBQ3BCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRTRDLElBQUlBLENBQUEsRUFBRztJQUNMLE9BQU8sSUFBSSxDQUFDNUMsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQ0EsQ0FBQyxDQUFFTCxJQUFJLENBQUNELEdBQUcsQ0FBRSxJQUFJLENBQUNKLENBQUMsRUFBRSxJQUFJLENBQUNFLENBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBRTtFQUMvRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VxRCxJQUFJQSxDQUFBLEVBQUc7SUFDTDtJQUNBLE1BQU16QixHQUFHLEdBQUd6QixJQUFJLENBQUNFLEdBQUcsQ0FBRSxHQUFHLEVBQUUsQ0FBQyxJQUFLLENBQUM7SUFDbEMsTUFBTWlELEdBQUcsR0FBR25ELElBQUksQ0FBQ0MsR0FBRyxDQUFFLElBQUksQ0FBQ04sQ0FBQyxFQUFFLElBQUksQ0FBQ0UsQ0FBRSxDQUFDLEdBQUcsSUFBSSxDQUFDUSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUdvQixHQUFHO0lBQzFELElBQUkyQixDQUFDLEdBQUcsQ0FBQztJQUNULEtBQU0sSUFBSXhDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNQLENBQUMsQ0FBQ2dELE1BQU0sRUFBRXpDLENBQUMsRUFBRSxFQUFHO01BQ3hDLElBQUssSUFBSSxDQUFDUCxDQUFDLENBQUVPLENBQUMsQ0FBRSxHQUFHdUMsR0FBRyxFQUFHO1FBQ3ZCQyxDQUFDLEVBQUU7TUFDTDtJQUNGO0lBQ0EsT0FBT0EsQ0FBQztFQUNWOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBT0UsYUFBYUEsQ0FBRS9ELE1BQU0sRUFBRztJQUM3QixNQUFNZ0UsR0FBRyxHQUFHLElBQUlsRSwwQkFBMEIsQ0FBRUUsTUFBTyxDQUFDO0lBQ3BELE1BQU1pRSxrQkFBa0IsR0FBR3hFLE1BQU0sQ0FBQ3lFLGNBQWMsQ0FBRUYsR0FBRyxDQUFDWixpQkFBaUIsQ0FBQyxDQUFDLENBQUNlLEdBQUcsQ0FBRUMsS0FBSyxJQUFJO01BQ3RGLElBQUszRCxJQUFJLENBQUNHLEdBQUcsQ0FBRXdELEtBQU0sQ0FBQyxHQUFHLE1BQU0sRUFBRztRQUNoQyxPQUFPLENBQUM7TUFDVixDQUFDLE1BQ0k7UUFDSCxPQUFPLENBQUMsR0FBR0EsS0FBSztNQUNsQjtJQUNGLENBQUUsQ0FBRSxDQUFDO0lBQ0wsT0FBT0osR0FBRyxDQUFDYixJQUFJLENBQUMsQ0FBQyxDQUFDa0IsS0FBSyxDQUFFSixrQkFBbUIsQ0FBQyxDQUFDSSxLQUFLLENBQUVMLEdBQUcsQ0FBQ2QsSUFBSSxDQUFDLENBQUMsQ0FBQ29CLFNBQVMsQ0FBQyxDQUFFLENBQUM7RUFDL0U7QUFDRjtBQUVBOUUsR0FBRyxDQUFDK0UsUUFBUSxDQUFFLDRCQUE0QixFQUFFekUsMEJBQTJCLENBQUM7QUFFeEUsZUFBZUEsMEJBQTBCIn0=