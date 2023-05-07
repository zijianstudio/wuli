// Copyright 2013-2022, University of Colorado Boulder

/**
 * A complex number with mutable and immutable methods.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Matt Pennington
 */

import dot from './dot.js';
import Utils from './Utils.js';
class Complex {
  /**
   * Creates a complex number, that has both a real and imaginary part.
   * @public
   *
   * @param {number} real - The real part. For a complex number $a+bi$, this should be $a$.
   * @param {number} imaginary - The imaginary part. For a complex number $a+bi$, this should be $b$.
   */
  constructor(real, imaginary) {
    // @public {number} - The real part. For a complex number $a+bi$, this is $a$.
    this.real = real;

    // @public {number} - The imaginary part. For a complex number $a+bi$, this is $b$.
    this.imaginary = imaginary;
  }

  /**
   * Creates a copy of this complex, or if a complex is passed in, set that complex's values to ours.
   * @public
   *
   * This is the immutable form of the function set(), if a complex is provided. This will return a new complex, and
   * will not modify this complex.
   *
   * @param {Complex} [complex] - If not provided, creates a new Complex with filled in values. Otherwise, fills
   *                              in the values of the provided complex so that it equals this complex.
   * @returns {Complex}
   */
  copy(complex) {
    if (complex) {
      return complex.set(this);
    } else {
      return new Complex(this.real, this.imaginary);
    }
  }

  /**
   * The phase / argument of the complex number.
   * @public
   *
   * @returns {number}
   */
  phase() {
    return Math.atan2(this.imaginary, this.real);
  }

  /**
   * The magnitude (Euclidean/L2 Norm) of this complex number, i.e. $\sqrt{a^2+b^2}$.
   * @public
   *
   * @returns {number}
   */
  getMagnitude() {
    return Math.sqrt(this.magnitudeSquared);
  }
  get magnitude() {
    return this.getMagnitude();
  }

  /**
   * The squared magnitude (square of the Euclidean/L2 Norm) of this complex, i.e. $a^2+b^2$.
   * @public
   *
   * @returns {number}
   */
  getMagnitudeSquared() {
    return this.real * this.real + this.imaginary * this.imaginary;
  }
  get magnitudeSquared() {
    return this.getMagnitudeSquared();
  }

  /**
   * Exact equality comparison between this Complex and another Complex.
   * @public
   *
   * @param {Complex} other
   * @returns {boolean} - Whether the two complex numbers have equal components
   */
  equals(other) {
    return this.real === other.real && this.imaginary === other.imaginary;
  }

  /**
   * Approximate equality comparison between this Complex and another Complex.
   * @public
   *
   * @param {Complex} other
   * @param {number} epsilon
   * @returns {boolean} - Whether difference between the two complex numbers has no component with an absolute value
   *                      greater than epsilon.
   */
  equalsEpsilon(other, epsilon) {
    if (!epsilon) {
      epsilon = 0;
    }
    return Math.max(Math.abs(this.real - other.real), Math.abs(this.imaginary - other.imaginary)) <= epsilon;
  }

  /**
   * Addition of this Complex and another Complex, returning a copy.
   * @public
   *
   * This is the immutable form of the function add(). This will return a new Complex, and will not modify
   * this Complex.
   *
   * @param {Complex} c
   * @returns {Complex}
   */
  plus(c) {
    return new Complex(this.real + c.real, this.imaginary + c.imaginary);
  }

  /**
   * Subtraction of this Complex by another Complex c, returning a copy.
   * @public
   *
   * This is the immutable form of the function subtract(). This will return a new Complex, and will not modify
   * this Complex.
   *
   * @param {Complex} c
   * @returns {Complex}
   */
  minus(c) {
    return new Complex(this.real - c.real, this.imaginary - c.imaginary);
  }

  /**
   * Complex multiplication.
   * Immutable version of multiply
   * @public
   *
   * @param {Complex} c
   * @returns {Complex}
   */
  times(c) {
    return new Complex(this.real * c.real - this.imaginary * c.imaginary, this.real * c.imaginary + this.imaginary * c.real);
  }

  /**
   * Complex division.
   * Immutable version of divide
   * @public
   *
   * @param {Complex} c
   * @returns {Complex}
   */
  dividedBy(c) {
    const cMag = c.magnitudeSquared;
    return new Complex((this.real * c.real + this.imaginary * c.imaginary) / cMag, (this.imaginary * c.real - this.real * c.imaginary) / cMag);
  }

  /**
   * Square root.
   * Immutable form of sqrt.
   * @public
   *
   * @returns {Complex}
   */
  sqrtOf() {
    const mag = this.magnitude;
    return new Complex(Math.sqrt((mag + this.real) / 2), (this.imaginary >= 0 ? 1 : -1) * Math.sqrt((mag - this.real) / 2));
  }

  /**
   * Returns the power of this complex number by a real number.
   * @public
   *
   * @param {number} realPower
   * @returns {Complex}
   */
  powerByReal(realPower) {
    const magTimes = Math.pow(this.magnitude, realPower);
    const angle = realPower * this.phase();
    return new Complex(magTimes * Math.cos(angle), magTimes * Math.sin(angle));
  }

  /**
   * Sine.
   * Immutable form of sin.
   * @public
   *
   * @returns {Complex}
   */
  sinOf() {
    return new Complex(Math.sin(this.real) * Utils.cosh(this.imaginary), Math.cos(this.real) * Utils.sinh(this.imaginary));
  }

  /**
   * Cosine.
   * Immutable form of cos.
   * @public
   *
   * @returns {Complex}
   */
  cosOf() {
    return new Complex(Math.cos(this.real) * Utils.cosh(this.imaginary), -Math.sin(this.real) * Utils.sinh(this.imaginary));
  }

  /**
   * Returns the square of this complex number and does not modify it.
   * This is the immutable version of square.
   * @public
   *
   * @returns {Complex}
   */
  squared() {
    return this.times(this);
  }

  /**
   * Complex conjugate.
   * Immutable form of conjugate
   * @public
   *
   * @returns {Complex}
   */
  conjugated() {
    return new Complex(this.real, -this.imaginary);
  }

  /**
   * Takes e to the power of this complex number. $e^{a+bi}=e^a\cos b + i\sin b$.
   * This is the immutable form of exponentiate.
   * @public
   *
   * @returns {Complex}
   */
  exponentiated() {
    return Complex.createPolar(Math.exp(this.real), this.imaginary);
  }

  /*** Mutable functions ***/

  /**
   * Sets all of the components of this complex, returning this
   * @public
   *
   * @param {number} real
   * @param {number} imaginary
   * @returns {Complex}
   */
  setRealImaginary(real, imaginary) {
    this.real = real;
    this.imaginary = imaginary;
    return this;
  }

  /**
   * Sets the real component of this complex, returning this
   * @public
   *
   * @param {number} real
   * @returns {Complex}
   */
  setReal(real) {
    this.real = real;
    return this;
  }

  /**
   * Sets the imaginary component of this complex, returning this
   * @public
   *
   * @param {number} imaginary
   * @returns {Complex}
   */
  setImaginary(imaginary) {
    this.imaginary = imaginary;
    return this;
  }

  /**
   * Sets the components of this complex to be a copy of the parameter
   * @public
   *
   * This is the mutable form of the function copy(). This will mutate (change) this complex, in addition to returning
   * this complex itself.
   *
   * @param {Complex} c
   * @returns {Complex}
   */
  set(c) {
    return this.setRealImaginary(c.real, c.imaginary);
  }

  /**
   * Sets this Complex's value to be the a,b values matching the given magnitude and phase (in radians), changing
   * this Complex, and returning itself.
   * @public
   *
   * @param {number} magnitude
   * @param {number} phase - In radians
   * @returns {Complex}
   */
  setPolar(magnitude, phase) {
    return this.setRealImaginary(magnitude * Math.cos(phase), magnitude * Math.sin(phase));
  }

  /**
   * Addition of this Complex and another Complex, returning a copy.
   * @public
   *
   * This is the mutable form of the function plus(). This will modify and return this.
   *
   * @param {Complex} c
   * @returns {Complex}
   */
  add(c) {
    return this.setRealImaginary(this.real + c.real, this.imaginary + c.imaginary);
  }

  /**
   * Subtraction of another Complex from this Complex, returning a copy.
   * @public
   *
   * This is the mutable form of the function minus(). This will modify and return this.
   *
   * @param {Complex} c
   * @returns {Complex}
   */
  subtract(c) {
    return this.setRealImaginary(this.real - c.real, this.imaginary - c.imaginary);
  }

  /**
   * Mutable Complex multiplication.
   * @public
   *
   * @param {Complex} c
   * @returns {Complex}
   */
  multiply(c) {
    return this.setRealImaginary(this.real * c.real - this.imaginary * c.imaginary, this.real * c.imaginary + this.imaginary * c.real);
  }

  /**
   * Mutable Complex division. The immutable form is dividedBy.
   * @public
   *
   * @param {Complex} c
   * @returns {Complex}
   */
  divide(c) {
    const cMag = c.magnitudeSquared;
    return this.setRealImaginary((this.real * c.real + this.imaginary * c.imaginary) / cMag, (this.imaginary * c.real - this.real * c.imaginary) / cMag);
  }

  /**
   * Sets this Complex to e to the power of this complex number. $e^{a+bi}=e^a\cos b + i\sin b$.
   * This is the mutable version of exponentiated
   * @public
   *
   * @returns {Complex}
   */
  exponentiate() {
    return this.setPolar(Math.exp(this.real), this.imaginary);
  }

  /**
   * Squares this complex number.
   * This is the mutable version of squared.
   * @public
   *
   * @returns {Complex}
   */
  square() {
    return this.multiply(this);
  }

  /**
   * Square root.
   * Mutable form of sqrtOf.
   * @public
   *
   * @returns {Complex}
   */
  sqrt() {
    const mag = this.magnitude;
    return this.setRealImaginary(Math.sqrt((mag + this.real) / 2), (this.imaginary >= 0 ? 1 : -1) * Math.sqrt((mag - this.real) / 2));
  }

  /**
   * Sine.
   * Mutable form of sinOf.
   * @public
   *
   * @returns {Complex}
   */
  sin() {
    return this.setRealImaginary(Math.sin(this.real) * Utils.cosh(this.imaginary), Math.cos(this.real) * Utils.sinh(this.imaginary));
  }

  /**
   * Cosine.
   * Mutable form of cosOf.
   * @public
   *
   * @returns {Complex}
   */
  cos() {
    return this.setRealImaginary(Math.cos(this.real) * Utils.cosh(this.imaginary), -Math.sin(this.real) * Utils.sinh(this.imaginary));
  }

  /**
   * Complex conjugate.
   * Mutable form of conjugated
   * @public
   *
   * @returns {Complex}
   */
  conjugate() {
    return this.setRealImaginary(this.real, -this.imaginary);
  }

  /**
   * Debugging string for the complex number (provides real and imaginary parts).
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `Complex(${this.real}, ${this.imaginary})`;
  }

  /**
   * Constructs a complex number from just the real part (assuming the imaginary part is 0).
   * @public
   *
   * @param {number} real
   * @returns {Complex}
   */
  static real(real) {
    return new Complex(real, 0);
  }

  /**
   * Constructs a complex number from just the imaginary part (assuming the real part is 0).
   * @public
   *
   * @param {number} imaginary
   * @returns {Complex}
   */
  static imaginary(imaginary) {
    return new Complex(0, imaginary);
  }

  /**
   * Constructs a complex number from the polar form. For a magnitude $r$ and phase $\varphi$, this will be
   * $\cos\varphi+i r\sin\varphi$.
   * @public
   *
   * @param {number} magnitude
   * @param {number} phase
   * @returns {Complex}
   */
  static createPolar(magnitude, phase) {
    return new Complex(magnitude * Math.cos(phase), magnitude * Math.sin(phase));
  }
}
dot.register('Complex', Complex);

/**
 * Immutable constant $0$.
 * @public
 *
 * @constant {Complex} ZERO
 */
Complex.ZERO = new Complex(0, 0);

/**
 * Immutable constant $1$.
 * @public
 *
 * @constant {Complex} ONE
 */
Complex.ONE = new Complex(1, 0);

/**
 * Immutable constant $i$, the imaginary unit.
 * @public
 *
 * @constant {Complex} I
 */
Complex.I = Complex.imaginary(1);
export default Complex;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3QiLCJVdGlscyIsIkNvbXBsZXgiLCJjb25zdHJ1Y3RvciIsInJlYWwiLCJpbWFnaW5hcnkiLCJjb3B5IiwiY29tcGxleCIsInNldCIsInBoYXNlIiwiTWF0aCIsImF0YW4yIiwiZ2V0TWFnbml0dWRlIiwic3FydCIsIm1hZ25pdHVkZVNxdWFyZWQiLCJtYWduaXR1ZGUiLCJnZXRNYWduaXR1ZGVTcXVhcmVkIiwiZXF1YWxzIiwib3RoZXIiLCJlcXVhbHNFcHNpbG9uIiwiZXBzaWxvbiIsIm1heCIsImFicyIsInBsdXMiLCJjIiwibWludXMiLCJ0aW1lcyIsImRpdmlkZWRCeSIsImNNYWciLCJzcXJ0T2YiLCJtYWciLCJwb3dlckJ5UmVhbCIsInJlYWxQb3dlciIsIm1hZ1RpbWVzIiwicG93IiwiYW5nbGUiLCJjb3MiLCJzaW4iLCJzaW5PZiIsImNvc2giLCJzaW5oIiwiY29zT2YiLCJzcXVhcmVkIiwiY29uanVnYXRlZCIsImV4cG9uZW50aWF0ZWQiLCJjcmVhdGVQb2xhciIsImV4cCIsInNldFJlYWxJbWFnaW5hcnkiLCJzZXRSZWFsIiwic2V0SW1hZ2luYXJ5Iiwic2V0UG9sYXIiLCJhZGQiLCJzdWJ0cmFjdCIsIm11bHRpcGx5IiwiZGl2aWRlIiwiZXhwb25lbnRpYXRlIiwic3F1YXJlIiwiY29uanVnYXRlIiwidG9TdHJpbmciLCJyZWdpc3RlciIsIlpFUk8iLCJPTkUiLCJJIl0sInNvdXJjZXMiOlsiQ29tcGxleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGNvbXBsZXggbnVtYmVyIHdpdGggbXV0YWJsZSBhbmQgaW1tdXRhYmxlIG1ldGhvZHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICogQGF1dGhvciBNYXR0IFBlbm5pbmd0b25cclxuICovXHJcblxyXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4vVXRpbHMuanMnO1xyXG5cclxuY2xhc3MgQ29tcGxleCB7XHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNvbXBsZXggbnVtYmVyLCB0aGF0IGhhcyBib3RoIGEgcmVhbCBhbmQgaW1hZ2luYXJ5IHBhcnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlYWwgLSBUaGUgcmVhbCBwYXJ0LiBGb3IgYSBjb21wbGV4IG51bWJlciAkYStiaSQsIHRoaXMgc2hvdWxkIGJlICRhJC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW1hZ2luYXJ5IC0gVGhlIGltYWdpbmFyeSBwYXJ0LiBGb3IgYSBjb21wbGV4IG51bWJlciAkYStiaSQsIHRoaXMgc2hvdWxkIGJlICRiJC5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcmVhbCwgaW1hZ2luYXJ5ICkge1xyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIFRoZSByZWFsIHBhcnQuIEZvciBhIGNvbXBsZXggbnVtYmVyICRhK2JpJCwgdGhpcyBpcyAkYSQuXHJcbiAgICB0aGlzLnJlYWwgPSByZWFsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gLSBUaGUgaW1hZ2luYXJ5IHBhcnQuIEZvciBhIGNvbXBsZXggbnVtYmVyICRhK2JpJCwgdGhpcyBpcyAkYiQuXHJcbiAgICB0aGlzLmltYWdpbmFyeSA9IGltYWdpbmFyeTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoaXMgY29tcGxleCwgb3IgaWYgYSBjb21wbGV4IGlzIHBhc3NlZCBpbiwgc2V0IHRoYXQgY29tcGxleCdzIHZhbHVlcyB0byBvdXJzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzZXQoKSwgaWYgYSBjb21wbGV4IGlzIHByb3ZpZGVkLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGNvbXBsZXgsIGFuZFxyXG4gICAqIHdpbGwgbm90IG1vZGlmeSB0aGlzIGNvbXBsZXguXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NvbXBsZXh9IFtjb21wbGV4XSAtIElmIG5vdCBwcm92aWRlZCwgY3JlYXRlcyBhIG5ldyBDb21wbGV4IHdpdGggZmlsbGVkIGluIHZhbHVlcy4gT3RoZXJ3aXNlLCBmaWxsc1xyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW4gdGhlIHZhbHVlcyBvZiB0aGUgcHJvdmlkZWQgY29tcGxleCBzbyB0aGF0IGl0IGVxdWFscyB0aGlzIGNvbXBsZXguXHJcbiAgICogQHJldHVybnMge0NvbXBsZXh9XHJcbiAgICovXHJcbiAgY29weSggY29tcGxleCApIHtcclxuICAgIGlmICggY29tcGxleCApIHtcclxuICAgICAgcmV0dXJuIGNvbXBsZXguc2V0KCB0aGlzICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIG5ldyBDb21wbGV4KCB0aGlzLnJlYWwsIHRoaXMuaW1hZ2luYXJ5ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgcGhhc2UgLyBhcmd1bWVudCBvZiB0aGUgY29tcGxleCBudW1iZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBwaGFzZSgpIHtcclxuICAgIHJldHVybiBNYXRoLmF0YW4yKCB0aGlzLmltYWdpbmFyeSwgdGhpcy5yZWFsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgbWFnbml0dWRlIChFdWNsaWRlYW4vTDIgTm9ybSkgb2YgdGhpcyBjb21wbGV4IG51bWJlciwgaS5lLiAkXFxzcXJ0e2FeMitiXjJ9JC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldE1hZ25pdHVkZSgpIHtcclxuICAgIHJldHVybiBNYXRoLnNxcnQoIHRoaXMubWFnbml0dWRlU3F1YXJlZCApO1xyXG4gIH1cclxuXHJcbiAgZ2V0IG1hZ25pdHVkZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmdldE1hZ25pdHVkZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHNxdWFyZWQgbWFnbml0dWRlIChzcXVhcmUgb2YgdGhlIEV1Y2xpZGVhbi9MMiBOb3JtKSBvZiB0aGlzIGNvbXBsZXgsIGkuZS4gJGFeMitiXjIkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0TWFnbml0dWRlU3F1YXJlZCgpIHtcclxuICAgIHJldHVybiB0aGlzLnJlYWwgKiB0aGlzLnJlYWwgKyB0aGlzLmltYWdpbmFyeSAqIHRoaXMuaW1hZ2luYXJ5O1xyXG4gIH1cclxuXHJcbiAgZ2V0IG1hZ25pdHVkZVNxdWFyZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRNYWduaXR1ZGVTcXVhcmVkKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFeGFjdCBlcXVhbGl0eSBjb21wYXJpc29uIGJldHdlZW4gdGhpcyBDb21wbGV4IGFuZCBhbm90aGVyIENvbXBsZXguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDb21wbGV4fSBvdGhlclxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIHR3byBjb21wbGV4IG51bWJlcnMgaGF2ZSBlcXVhbCBjb21wb25lbnRzXHJcbiAgICovXHJcbiAgZXF1YWxzKCBvdGhlciApIHtcclxuICAgIHJldHVybiB0aGlzLnJlYWwgPT09IG90aGVyLnJlYWwgJiYgdGhpcy5pbWFnaW5hcnkgPT09IG90aGVyLmltYWdpbmFyeTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcHJveGltYXRlIGVxdWFsaXR5IGNvbXBhcmlzb24gYmV0d2VlbiB0aGlzIENvbXBsZXggYW5kIGFub3RoZXIgQ29tcGxleC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NvbXBsZXh9IG90aGVyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb25cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgdHdvIGNvbXBsZXggbnVtYmVycyBoYXMgbm8gY29tcG9uZW50IHdpdGggYW4gYWJzb2x1dGUgdmFsdWVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICBncmVhdGVyIHRoYW4gZXBzaWxvbi5cclxuICAgKi9cclxuICBlcXVhbHNFcHNpbG9uKCBvdGhlciwgZXBzaWxvbiApIHtcclxuICAgIGlmICggIWVwc2lsb24gKSB7XHJcbiAgICAgIGVwc2lsb24gPSAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE1hdGgubWF4KCBNYXRoLmFicyggdGhpcy5yZWFsIC0gb3RoZXIucmVhbCApLCBNYXRoLmFicyggdGhpcy5pbWFnaW5hcnkgLSBvdGhlci5pbWFnaW5hcnkgKSApIDw9IGVwc2lsb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRpdGlvbiBvZiB0aGlzIENvbXBsZXggYW5kIGFub3RoZXIgQ29tcGxleCwgcmV0dXJuaW5nIGEgY29weS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYWRkKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgQ29tcGxleCwgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgQ29tcGxleC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Q29tcGxleH0gY1xyXG4gICAqIEByZXR1cm5zIHtDb21wbGV4fVxyXG4gICAqL1xyXG4gIHBsdXMoIGMgKSB7XHJcbiAgICByZXR1cm4gbmV3IENvbXBsZXgoIHRoaXMucmVhbCArIGMucmVhbCwgdGhpcy5pbWFnaW5hcnkgKyBjLmltYWdpbmFyeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3VidHJhY3Rpb24gb2YgdGhpcyBDb21wbGV4IGJ5IGFub3RoZXIgQ29tcGxleCBjLCByZXR1cm5pbmcgYSBjb3B5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzdWJ0cmFjdCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IENvbXBsZXgsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIENvbXBsZXguXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NvbXBsZXh9IGNcclxuICAgKiBAcmV0dXJucyB7Q29tcGxleH1cclxuICAgKi9cclxuICBtaW51cyggYyApIHtcclxuICAgIHJldHVybiBuZXcgQ29tcGxleCggdGhpcy5yZWFsIC0gYy5yZWFsLCB0aGlzLmltYWdpbmFyeSAtIGMuaW1hZ2luYXJ5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wbGV4IG11bHRpcGxpY2F0aW9uLlxyXG4gICAqIEltbXV0YWJsZSB2ZXJzaW9uIG9mIG11bHRpcGx5XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDb21wbGV4fSBjXHJcbiAgICogQHJldHVybnMge0NvbXBsZXh9XHJcbiAgICovXHJcbiAgdGltZXMoIGMgKSB7XHJcbiAgICByZXR1cm4gbmV3IENvbXBsZXgoIHRoaXMucmVhbCAqIGMucmVhbCAtIHRoaXMuaW1hZ2luYXJ5ICogYy5pbWFnaW5hcnksIHRoaXMucmVhbCAqIGMuaW1hZ2luYXJ5ICsgdGhpcy5pbWFnaW5hcnkgKiBjLnJlYWwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXBsZXggZGl2aXNpb24uXHJcbiAgICogSW1tdXRhYmxlIHZlcnNpb24gb2YgZGl2aWRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDb21wbGV4fSBjXHJcbiAgICogQHJldHVybnMge0NvbXBsZXh9XHJcbiAgICovXHJcbiAgZGl2aWRlZEJ5KCBjICkge1xyXG4gICAgY29uc3QgY01hZyA9IGMubWFnbml0dWRlU3F1YXJlZDtcclxuICAgIHJldHVybiBuZXcgQ29tcGxleChcclxuICAgICAgKCB0aGlzLnJlYWwgKiBjLnJlYWwgKyB0aGlzLmltYWdpbmFyeSAqIGMuaW1hZ2luYXJ5ICkgLyBjTWFnLFxyXG4gICAgICAoIHRoaXMuaW1hZ2luYXJ5ICogYy5yZWFsIC0gdGhpcy5yZWFsICogYy5pbWFnaW5hcnkgKSAvIGNNYWdcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTcXVhcmUgcm9vdC5cclxuICAgKiBJbW11dGFibGUgZm9ybSBvZiBzcXJ0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtDb21wbGV4fVxyXG4gICAqL1xyXG4gIHNxcnRPZigpIHtcclxuICAgIGNvbnN0IG1hZyA9IHRoaXMubWFnbml0dWRlO1xyXG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KCBNYXRoLnNxcnQoICggbWFnICsgdGhpcy5yZWFsICkgLyAyICksXHJcbiAgICAgICggdGhpcy5pbWFnaW5hcnkgPj0gMCA/IDEgOiAtMSApICogTWF0aC5zcXJ0KCAoIG1hZyAtIHRoaXMucmVhbCApIC8gMiApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBwb3dlciBvZiB0aGlzIGNvbXBsZXggbnVtYmVyIGJ5IGEgcmVhbCBudW1iZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlYWxQb3dlclxyXG4gICAqIEByZXR1cm5zIHtDb21wbGV4fVxyXG4gICAqL1xyXG4gIHBvd2VyQnlSZWFsKCByZWFsUG93ZXIgKSB7XHJcbiAgICBjb25zdCBtYWdUaW1lcyA9IE1hdGgucG93KCB0aGlzLm1hZ25pdHVkZSwgcmVhbFBvd2VyICk7XHJcbiAgICBjb25zdCBhbmdsZSA9IHJlYWxQb3dlciAqIHRoaXMucGhhc2UoKTtcclxuICAgIHJldHVybiBuZXcgQ29tcGxleChcclxuICAgICAgbWFnVGltZXMgKiBNYXRoLmNvcyggYW5nbGUgKSxcclxuICAgICAgbWFnVGltZXMgKiBNYXRoLnNpbiggYW5nbGUgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNpbmUuXHJcbiAgICogSW1tdXRhYmxlIGZvcm0gb2Ygc2luLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtDb21wbGV4fVxyXG4gICAqL1xyXG4gIHNpbk9mKCkge1xyXG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KFxyXG4gICAgICBNYXRoLnNpbiggdGhpcy5yZWFsICkgKiBVdGlscy5jb3NoKCB0aGlzLmltYWdpbmFyeSApLFxyXG4gICAgICBNYXRoLmNvcyggdGhpcy5yZWFsICkgKiBVdGlscy5zaW5oKCB0aGlzLmltYWdpbmFyeSApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29zaW5lLlxyXG4gICAqIEltbXV0YWJsZSBmb3JtIG9mIGNvcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Q29tcGxleH1cclxuICAgKi9cclxuICBjb3NPZigpIHtcclxuICAgIHJldHVybiBuZXcgQ29tcGxleChcclxuICAgICAgTWF0aC5jb3MoIHRoaXMucmVhbCApICogVXRpbHMuY29zaCggdGhpcy5pbWFnaW5hcnkgKSxcclxuICAgICAgLU1hdGguc2luKCB0aGlzLnJlYWwgKSAqIFV0aWxzLnNpbmgoIHRoaXMuaW1hZ2luYXJ5IClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzcXVhcmUgb2YgdGhpcyBjb21wbGV4IG51bWJlciBhbmQgZG9lcyBub3QgbW9kaWZ5IGl0LlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSB2ZXJzaW9uIG9mIHNxdWFyZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Q29tcGxleH1cclxuICAgKi9cclxuICBzcXVhcmVkKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudGltZXMoIHRoaXMgKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBDb21wbGV4IGNvbmp1Z2F0ZS5cclxuICAgKiBJbW11dGFibGUgZm9ybSBvZiBjb25qdWdhdGVcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Q29tcGxleH1cclxuICAgKi9cclxuICBjb25qdWdhdGVkKCkge1xyXG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KCB0aGlzLnJlYWwsIC10aGlzLmltYWdpbmFyeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGFrZXMgZSB0byB0aGUgcG93ZXIgb2YgdGhpcyBjb21wbGV4IG51bWJlci4gJGVee2ErYml9PWVeYVxcY29zIGIgKyBpXFxzaW4gYiQuXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgZXhwb25lbnRpYXRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtDb21wbGV4fVxyXG4gICAqL1xyXG4gIGV4cG9uZW50aWF0ZWQoKSB7XHJcbiAgICByZXR1cm4gQ29tcGxleC5jcmVhdGVQb2xhciggTWF0aC5leHAoIHRoaXMucmVhbCApLCB0aGlzLmltYWdpbmFyeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqKiBNdXRhYmxlIGZ1bmN0aW9ucyAqKiovXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgYWxsIG9mIHRoZSBjb21wb25lbnRzIG9mIHRoaXMgY29tcGxleCwgcmV0dXJuaW5nIHRoaXNcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVhbFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbWFnaW5hcnlcclxuICAgKiBAcmV0dXJucyB7Q29tcGxleH1cclxuICAgKi9cclxuICBzZXRSZWFsSW1hZ2luYXJ5KCByZWFsLCBpbWFnaW5hcnkgKSB7XHJcbiAgICB0aGlzLnJlYWwgPSByZWFsO1xyXG4gICAgdGhpcy5pbWFnaW5hcnkgPSBpbWFnaW5hcnk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHJlYWwgY29tcG9uZW50IG9mIHRoaXMgY29tcGxleCwgcmV0dXJuaW5nIHRoaXNcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVhbFxyXG4gICAqIEByZXR1cm5zIHtDb21wbGV4fVxyXG4gICAqL1xyXG4gIHNldFJlYWwoIHJlYWwgKSB7XHJcbiAgICB0aGlzLnJlYWwgPSByZWFsO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBpbWFnaW5hcnkgY29tcG9uZW50IG9mIHRoaXMgY29tcGxleCwgcmV0dXJuaW5nIHRoaXNcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW1hZ2luYXJ5XHJcbiAgICogQHJldHVybnMge0NvbXBsZXh9XHJcbiAgICovXHJcbiAgc2V0SW1hZ2luYXJ5KCBpbWFnaW5hcnkgKSB7XHJcbiAgICB0aGlzLmltYWdpbmFyeSA9IGltYWdpbmFyeTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgY29tcG9uZW50cyBvZiB0aGlzIGNvbXBsZXggdG8gYmUgYSBjb3B5IG9mIHRoZSBwYXJhbWV0ZXJcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvcHkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGNvbXBsZXgsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgY29tcGxleCBpdHNlbGYuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NvbXBsZXh9IGNcclxuICAgKiBAcmV0dXJucyB7Q29tcGxleH1cclxuICAgKi9cclxuICBzZXQoIGMgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRSZWFsSW1hZ2luYXJ5KCBjLnJlYWwsIGMuaW1hZ2luYXJ5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgQ29tcGxleCdzIHZhbHVlIHRvIGJlIHRoZSBhLGIgdmFsdWVzIG1hdGNoaW5nIHRoZSBnaXZlbiBtYWduaXR1ZGUgYW5kIHBoYXNlIChpbiByYWRpYW5zKSwgY2hhbmdpbmdcclxuICAgKiB0aGlzIENvbXBsZXgsIGFuZCByZXR1cm5pbmcgaXRzZWxmLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYWduaXR1ZGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcGhhc2UgLSBJbiByYWRpYW5zXHJcbiAgICogQHJldHVybnMge0NvbXBsZXh9XHJcbiAgICovXHJcbiAgc2V0UG9sYXIoIG1hZ25pdHVkZSwgcGhhc2UgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRSZWFsSW1hZ2luYXJ5KCBtYWduaXR1ZGUgKiBNYXRoLmNvcyggcGhhc2UgKSwgbWFnbml0dWRlICogTWF0aC5zaW4oIHBoYXNlICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZGl0aW9uIG9mIHRoaXMgQ29tcGxleCBhbmQgYW5vdGhlciBDb21wbGV4LCByZXR1cm5pbmcgYSBjb3B5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcGx1cygpLiBUaGlzIHdpbGwgbW9kaWZ5IGFuZCByZXR1cm4gdGhpcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Q29tcGxleH0gY1xyXG4gICAqIEByZXR1cm5zIHtDb21wbGV4fVxyXG4gICAqL1xyXG4gIGFkZCggYyApIHtcclxuICAgIHJldHVybiB0aGlzLnNldFJlYWxJbWFnaW5hcnkoIHRoaXMucmVhbCArIGMucmVhbCwgdGhpcy5pbWFnaW5hcnkgKyBjLmltYWdpbmFyeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3VidHJhY3Rpb24gb2YgYW5vdGhlciBDb21wbGV4IGZyb20gdGhpcyBDb21wbGV4LCByZXR1cm5pbmcgYSBjb3B5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbWludXMoKS4gVGhpcyB3aWxsIG1vZGlmeSBhbmQgcmV0dXJuIHRoaXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NvbXBsZXh9IGNcclxuICAgKiBAcmV0dXJucyB7Q29tcGxleH1cclxuICAgKi9cclxuICBzdWJ0cmFjdCggYyApIHtcclxuICAgIHJldHVybiB0aGlzLnNldFJlYWxJbWFnaW5hcnkoIHRoaXMucmVhbCAtIGMucmVhbCwgdGhpcy5pbWFnaW5hcnkgLSBjLmltYWdpbmFyeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTXV0YWJsZSBDb21wbGV4IG11bHRpcGxpY2F0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Q29tcGxleH0gY1xyXG4gICAqIEByZXR1cm5zIHtDb21wbGV4fVxyXG4gICAqL1xyXG4gIG11bHRpcGx5KCBjICkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0UmVhbEltYWdpbmFyeShcclxuICAgICAgdGhpcy5yZWFsICogYy5yZWFsIC0gdGhpcy5pbWFnaW5hcnkgKiBjLmltYWdpbmFyeSxcclxuICAgICAgdGhpcy5yZWFsICogYy5pbWFnaW5hcnkgKyB0aGlzLmltYWdpbmFyeSAqIGMucmVhbCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTXV0YWJsZSBDb21wbGV4IGRpdmlzaW9uLiBUaGUgaW1tdXRhYmxlIGZvcm0gaXMgZGl2aWRlZEJ5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Q29tcGxleH0gY1xyXG4gICAqIEByZXR1cm5zIHtDb21wbGV4fVxyXG4gICAqL1xyXG4gIGRpdmlkZSggYyApIHtcclxuICAgIGNvbnN0IGNNYWcgPSBjLm1hZ25pdHVkZVNxdWFyZWQ7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRSZWFsSW1hZ2luYXJ5KFxyXG4gICAgICAoIHRoaXMucmVhbCAqIGMucmVhbCArIHRoaXMuaW1hZ2luYXJ5ICogYy5pbWFnaW5hcnkgKSAvIGNNYWcsXHJcbiAgICAgICggdGhpcy5pbWFnaW5hcnkgKiBjLnJlYWwgLSB0aGlzLnJlYWwgKiBjLmltYWdpbmFyeSApIC8gY01hZ1xyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhpcyBDb21wbGV4IHRvIGUgdG8gdGhlIHBvd2VyIG9mIHRoaXMgY29tcGxleCBudW1iZXIuICRlXnthK2JpfT1lXmFcXGNvcyBiICsgaVxcc2luIGIkLlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgdmVyc2lvbiBvZiBleHBvbmVudGlhdGVkXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge0NvbXBsZXh9XHJcbiAgICovXHJcbiAgZXhwb25lbnRpYXRlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0UG9sYXIoIE1hdGguZXhwKCB0aGlzLnJlYWwgKSwgdGhpcy5pbWFnaW5hcnkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNxdWFyZXMgdGhpcyBjb21wbGV4IG51bWJlci5cclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIHZlcnNpb24gb2Ygc3F1YXJlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Q29tcGxleH1cclxuICAgKi9cclxuICBzcXVhcmUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBseSggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3F1YXJlIHJvb3QuXHJcbiAgICogTXV0YWJsZSBmb3JtIG9mIHNxcnRPZi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Q29tcGxleH1cclxuICAgKi9cclxuICBzcXJ0KCkge1xyXG4gICAgY29uc3QgbWFnID0gdGhpcy5tYWduaXR1ZGU7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRSZWFsSW1hZ2luYXJ5KCBNYXRoLnNxcnQoICggbWFnICsgdGhpcy5yZWFsICkgLyAyICksXHJcbiAgICAgICggdGhpcy5pbWFnaW5hcnkgPj0gMCA/IDEgOiAtMSApICogTWF0aC5zcXJ0KCAoIG1hZyAtIHRoaXMucmVhbCApIC8gMiApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaW5lLlxyXG4gICAqIE11dGFibGUgZm9ybSBvZiBzaW5PZi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Q29tcGxleH1cclxuICAgKi9cclxuICBzaW4oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRSZWFsSW1hZ2luYXJ5KFxyXG4gICAgICBNYXRoLnNpbiggdGhpcy5yZWFsICkgKiBVdGlscy5jb3NoKCB0aGlzLmltYWdpbmFyeSApLFxyXG4gICAgICBNYXRoLmNvcyggdGhpcy5yZWFsICkgKiBVdGlscy5zaW5oKCB0aGlzLmltYWdpbmFyeSApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29zaW5lLlxyXG4gICAqIE11dGFibGUgZm9ybSBvZiBjb3NPZi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Q29tcGxleH1cclxuICAgKi9cclxuICBjb3MoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRSZWFsSW1hZ2luYXJ5KFxyXG4gICAgICBNYXRoLmNvcyggdGhpcy5yZWFsICkgKiBVdGlscy5jb3NoKCB0aGlzLmltYWdpbmFyeSApLFxyXG4gICAgICAtTWF0aC5zaW4oIHRoaXMucmVhbCApICogVXRpbHMuc2luaCggdGhpcy5pbWFnaW5hcnkgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBDb21wbGV4IGNvbmp1Z2F0ZS5cclxuICAgKiBNdXRhYmxlIGZvcm0gb2YgY29uanVnYXRlZFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtDb21wbGV4fVxyXG4gICAqL1xyXG4gIGNvbmp1Z2F0ZSgpIHtcclxuICAgIHJldHVybiB0aGlzLnNldFJlYWxJbWFnaW5hcnkoIHRoaXMucmVhbCwgLXRoaXMuaW1hZ2luYXJ5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZWJ1Z2dpbmcgc3RyaW5nIGZvciB0aGUgY29tcGxleCBudW1iZXIgKHByb3ZpZGVzIHJlYWwgYW5kIGltYWdpbmFyeSBwYXJ0cykuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIHJldHVybiBgQ29tcGxleCgke3RoaXMucmVhbH0sICR7dGhpcy5pbWFnaW5hcnl9KWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RzIGEgY29tcGxleCBudW1iZXIgZnJvbSBqdXN0IHRoZSByZWFsIHBhcnQgKGFzc3VtaW5nIHRoZSBpbWFnaW5hcnkgcGFydCBpcyAwKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVhbFxyXG4gICAqIEByZXR1cm5zIHtDb21wbGV4fVxyXG4gICAqL1xyXG4gIHN0YXRpYyByZWFsKCByZWFsICkge1xyXG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KCByZWFsLCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RzIGEgY29tcGxleCBudW1iZXIgZnJvbSBqdXN0IHRoZSBpbWFnaW5hcnkgcGFydCAoYXNzdW1pbmcgdGhlIHJlYWwgcGFydCBpcyAwKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW1hZ2luYXJ5XHJcbiAgICogQHJldHVybnMge0NvbXBsZXh9XHJcbiAgICovXHJcbiAgc3RhdGljIGltYWdpbmFyeSggaW1hZ2luYXJ5ICkge1xyXG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KCAwLCBpbWFnaW5hcnkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdHMgYSBjb21wbGV4IG51bWJlciBmcm9tIHRoZSBwb2xhciBmb3JtLiBGb3IgYSBtYWduaXR1ZGUgJHIkIGFuZCBwaGFzZSAkXFx2YXJwaGkkLCB0aGlzIHdpbGwgYmVcclxuICAgKiAkXFxjb3NcXHZhcnBoaStpIHJcXHNpblxcdmFycGhpJC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWFnbml0dWRlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBoYXNlXHJcbiAgICogQHJldHVybnMge0NvbXBsZXh9XHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZVBvbGFyKCBtYWduaXR1ZGUsIHBoYXNlICkge1xyXG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KCBtYWduaXR1ZGUgKiBNYXRoLmNvcyggcGhhc2UgKSwgbWFnbml0dWRlICogTWF0aC5zaW4oIHBoYXNlICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmRvdC5yZWdpc3RlciggJ0NvbXBsZXgnLCBDb21wbGV4ICk7XHJcblxyXG4vKipcclxuICogSW1tdXRhYmxlIGNvbnN0YW50ICQwJC5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAY29uc3RhbnQge0NvbXBsZXh9IFpFUk9cclxuICovXHJcbkNvbXBsZXguWkVSTyA9IG5ldyBDb21wbGV4KCAwLCAwICk7XHJcblxyXG4vKipcclxuICogSW1tdXRhYmxlIGNvbnN0YW50ICQxJC5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAY29uc3RhbnQge0NvbXBsZXh9IE9ORVxyXG4gKi9cclxuQ29tcGxleC5PTkUgPSBuZXcgQ29tcGxleCggMSwgMCApO1xyXG5cclxuLyoqXHJcbiAqIEltbXV0YWJsZSBjb25zdGFudCAkaSQsIHRoZSBpbWFnaW5hcnkgdW5pdC5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAY29uc3RhbnQge0NvbXBsZXh9IElcclxuICovXHJcbkNvbXBsZXguSSA9IENvbXBsZXguaW1hZ2luYXJ5KCAxICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDb21wbGV4OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsR0FBRyxNQUFNLFVBQVU7QUFDMUIsT0FBT0MsS0FBSyxNQUFNLFlBQVk7QUFFOUIsTUFBTUMsT0FBTyxDQUFDO0VBQ1o7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUc7SUFDN0I7SUFDQSxJQUFJLENBQUNELElBQUksR0FBR0EsSUFBSTs7SUFFaEI7SUFDQSxJQUFJLENBQUNDLFNBQVMsR0FBR0EsU0FBUztFQUM1Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLElBQUlBLENBQUVDLE9BQU8sRUFBRztJQUNkLElBQUtBLE9BQU8sRUFBRztNQUNiLE9BQU9BLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFLElBQUssQ0FBQztJQUM1QixDQUFDLE1BQ0k7TUFDSCxPQUFPLElBQUlOLE9BQU8sQ0FBRSxJQUFJLENBQUNFLElBQUksRUFBRSxJQUFJLENBQUNDLFNBQVUsQ0FBQztJQUNqRDtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxLQUFLQSxDQUFBLEVBQUc7SUFDTixPQUFPQyxJQUFJ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