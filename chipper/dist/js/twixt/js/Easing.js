// Copyright 2023, University of Colorado Boulder

/**
 * An Easing represents a function from the range [0,1] => [0,1] where f(0)=0 and f(1)=1. It is helpful for animation,
 * to give a more 'natural' feeling.
 *
 * Contains an implementation of generalized polynomial easing functions (where the 'in' version simply takes the input
 * to a specific power, and other functions are generalized). These should be equivalent to the polynomial tweens that
 * TWEEN.js uses, where t is The linear ratio [0,1] of the animation.
 *
 * TODO #23 create unit tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import twixt from './twixt.js';
class Easing {
  /**
   * Input to the functions should be in the range [0,1], where 0 is the start of an animation, and 1 is the end.
   *
   * @param value - Our easing function (from [0,1] => [0,1])
   * @param derivative - Our easing function's derivative (from [0,1] => *)
   * @param secondDerivative - Our easing function's second derivative (from [0,1] => *)
   */
  constructor(value, derivative, secondDerivative) {
    this.value = value;
    this.derivative = derivative;
    this.secondDerivative = secondDerivative;
  }

  /**
   * The "polynomial ease in" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  static polynomialEaseInValue(n, t) {
    assert && assert(tIsValid(t), `invalid t: ${t}`);
    return Math.pow(t, n);
  }

  /**
   * The "polynomial ease out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  static polynomialEaseOutValue(n, t) {
    assert && assert(tIsValid(t), `invalid t: ${t}`);
    return 1 - Math.pow(1 - t, n);
  }

  /**
   * The "polynomial ease in-out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  static polynomialEaseInOutValue(n, t) {
    assert && assert(tIsValid(t), `invalid t: ${t}`);
    if (t <= 0.5) {
      return 0.5 * Math.pow(2 * t, n);
    } else {
      return 1 - Easing.polynomialEaseInOutValue(n, 1 - t);
    }
  }

  /**
   * The derivative of the "polynomial ease in" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  static polynomialEaseInDerivative(n, t) {
    assert && assert(tIsValid(t), `invalid t: ${t}`);
    return n * Math.pow(t, n - 1);
  }

  /**
   * The derivative of the "polynomial ease out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  static polynomialEaseOutDerivative(n, t) {
    assert && assert(tIsValid(t), `invalid t: ${t}`);
    return n * Math.pow(1 - t, n - 1);
  }

  /**
   * The derivative of the "polynomial ease in-out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  static polynomialEaseInOutDerivative(n, t) {
    assert && assert(tIsValid(t), `invalid t: ${t}`);
    if (t <= 0.5) {
      return Math.pow(2, n - 1) * n * Math.pow(t, n - 1);
    } else {
      return Easing.polynomialEaseInOutDerivative(n, 1 - t);
    }
  }

  /**
   * The second derivative of the "polynomial ease in" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  static polynomialEaseInSecondDerivative(n, t) {
    assert && assert(tIsValid(t), `invalid t: ${t}`);
    return (n - 1) * n * Math.pow(t, n - 2);
  }

  /**
   * The second derivative of the "polynomial ease out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  static polynomialEaseOutSecondDerivative(n, t) {
    assert && assert(tIsValid(t), `invalid t: ${t}`);
    return -(n - 1) * n * Math.pow(1 - t, n - 2);
  }

  /**
   * The second derivative of the "polynomial ease in-out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  static polynomialEaseInOutSecondDerivative(n, t) {
    assert && assert(tIsValid(t), `invalid t: ${t}`);
    if (t <= 0.5) {
      return Math.pow(2, n - 1) * (n - 1) * n * Math.pow(t, n - 2);
    } else {
      return -Easing.polynomialEaseInOutSecondDerivative(n, 1 - t);
    }
  }

  /**
   * Creates a polynomial "in" easing (smooth start)
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   */
  static polynomialEaseIn(n) {
    return new Easing(Easing.polynomialEaseInValue.bind(null, n), Easing.polynomialEaseInDerivative.bind(null, n), Easing.polynomialEaseInSecondDerivative.bind(null, n));
  }

  /**
   * Creates a polynomial "out" easing (smooth end)
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   */
  static polynomialEaseOut(n) {
    return new Easing(Easing.polynomialEaseOutValue.bind(null, n), Easing.polynomialEaseOutDerivative.bind(null, n), Easing.polynomialEaseOutSecondDerivative.bind(null, n));
  }

  /**
   * Creates a polynomial "in-out" easing (smooth start and end)
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   */
  static polynomialEaseInOut(n) {
    return new Easing(Easing.polynomialEaseInOutValue.bind(null, n), Easing.polynomialEaseInOutDerivative.bind(null, n), Easing.polynomialEaseInOutSecondDerivative.bind(null, n));
  }

  // The identity easing
  static LINEAR = Easing.polynomialEaseIn(1);

  // Quadratic-derived easings (t^2)
  static QUADRATIC_IN = Easing.polynomialEaseIn(2);
  static QUADRATIC_OUT = Easing.polynomialEaseOut(2);
  static QUADRATIC_IN_OUT = Easing.polynomialEaseInOut(2);

  // Cubic-derived easings (t^3)
  static CUBIC_IN = Easing.polynomialEaseIn(3);
  static CUBIC_OUT = Easing.polynomialEaseOut(3);
  static CUBIC_IN_OUT = Easing.polynomialEaseInOut(3);

  // Quartic-derived easings (t^4)
  static QUARTIC_IN = Easing.polynomialEaseIn(4);
  static QUARTIC_OUT = Easing.polynomialEaseOut(4);
  static QUARTIC_IN_OUT = Easing.polynomialEaseInOut(4);

  // Quintic-derived easings (t^5)
  static QUINTIC_IN = Easing.polynomialEaseIn(5);
  static QUINTIC_OUT = Easing.polynomialEaseOut(5);
  static QUINTIC_IN_OUT = Easing.polynomialEaseInOut(5);
}

/**
 * Verifies that t is valid.
 * @param t - The linear ratio [0,1] of the animation
 */
function tIsValid(t) {
  return typeof t === 'number' && isFinite(t) && t >= 0 && t <= 1;
}
twixt.register('Easing', Easing);
export default Easing;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0d2l4dCIsIkVhc2luZyIsImNvbnN0cnVjdG9yIiwidmFsdWUiLCJkZXJpdmF0aXZlIiwic2Vjb25kRGVyaXZhdGl2ZSIsInBvbHlub21pYWxFYXNlSW5WYWx1ZSIsIm4iLCJ0IiwiYXNzZXJ0IiwidElzVmFsaWQiLCJNYXRoIiwicG93IiwicG9seW5vbWlhbEVhc2VPdXRWYWx1ZSIsInBvbHlub21pYWxFYXNlSW5PdXRWYWx1ZSIsInBvbHlub21pYWxFYXNlSW5EZXJpdmF0aXZlIiwicG9seW5vbWlhbEVhc2VPdXREZXJpdmF0aXZlIiwicG9seW5vbWlhbEVhc2VJbk91dERlcml2YXRpdmUiLCJwb2x5bm9taWFsRWFzZUluU2Vjb25kRGVyaXZhdGl2ZSIsInBvbHlub21pYWxFYXNlT3V0U2Vjb25kRGVyaXZhdGl2ZSIsInBvbHlub21pYWxFYXNlSW5PdXRTZWNvbmREZXJpdmF0aXZlIiwicG9seW5vbWlhbEVhc2VJbiIsImJpbmQiLCJwb2x5bm9taWFsRWFzZU91dCIsInBvbHlub21pYWxFYXNlSW5PdXQiLCJMSU5FQVIiLCJRVUFEUkFUSUNfSU4iLCJRVUFEUkFUSUNfT1VUIiwiUVVBRFJBVElDX0lOX09VVCIsIkNVQklDX0lOIiwiQ1VCSUNfT1VUIiwiQ1VCSUNfSU5fT1VUIiwiUVVBUlRJQ19JTiIsIlFVQVJUSUNfT1VUIiwiUVVBUlRJQ19JTl9PVVQiLCJRVUlOVElDX0lOIiwiUVVJTlRJQ19PVVQiLCJRVUlOVElDX0lOX09VVCIsImlzRmluaXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFYXNpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFuIEVhc2luZyByZXByZXNlbnRzIGEgZnVuY3Rpb24gZnJvbSB0aGUgcmFuZ2UgWzAsMV0gPT4gWzAsMV0gd2hlcmUgZigwKT0wIGFuZCBmKDEpPTEuIEl0IGlzIGhlbHBmdWwgZm9yIGFuaW1hdGlvbixcclxuICogdG8gZ2l2ZSBhIG1vcmUgJ25hdHVyYWwnIGZlZWxpbmcuXHJcbiAqXHJcbiAqIENvbnRhaW5zIGFuIGltcGxlbWVudGF0aW9uIG9mIGdlbmVyYWxpemVkIHBvbHlub21pYWwgZWFzaW5nIGZ1bmN0aW9ucyAod2hlcmUgdGhlICdpbicgdmVyc2lvbiBzaW1wbHkgdGFrZXMgdGhlIGlucHV0XHJcbiAqIHRvIGEgc3BlY2lmaWMgcG93ZXIsIGFuZCBvdGhlciBmdW5jdGlvbnMgYXJlIGdlbmVyYWxpemVkKS4gVGhlc2Ugc2hvdWxkIGJlIGVxdWl2YWxlbnQgdG8gdGhlIHBvbHlub21pYWwgdHdlZW5zIHRoYXRcclxuICogVFdFRU4uanMgdXNlcywgd2hlcmUgdCBpcyBUaGUgbGluZWFyIHJhdGlvIFswLDFdIG9mIHRoZSBhbmltYXRpb24uXHJcbiAqXHJcbiAqIFRPRE8gIzIzIGNyZWF0ZSB1bml0IHRlc3RzXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgdHdpeHQgZnJvbSAnLi90d2l4dC5qcyc7XHJcblxyXG50eXBlIE51bWJlckZ1bmN0aW9uID0gKCB0OiBudW1iZXIgKSA9PiBudW1iZXI7XHJcblxyXG5jbGFzcyBFYXNpbmcge1xyXG5cclxuICAvKipcclxuICAgKiBJbnB1dCB0byB0aGUgZnVuY3Rpb25zIHNob3VsZCBiZSBpbiB0aGUgcmFuZ2UgWzAsMV0sIHdoZXJlIDAgaXMgdGhlIHN0YXJ0IG9mIGFuIGFuaW1hdGlvbiwgYW5kIDEgaXMgdGhlIGVuZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB2YWx1ZSAtIE91ciBlYXNpbmcgZnVuY3Rpb24gKGZyb20gWzAsMV0gPT4gWzAsMV0pXHJcbiAgICogQHBhcmFtIGRlcml2YXRpdmUgLSBPdXIgZWFzaW5nIGZ1bmN0aW9uJ3MgZGVyaXZhdGl2ZSAoZnJvbSBbMCwxXSA9PiAqKVxyXG4gICAqIEBwYXJhbSBzZWNvbmREZXJpdmF0aXZlIC0gT3VyIGVhc2luZyBmdW5jdGlvbidzIHNlY29uZCBkZXJpdmF0aXZlIChmcm9tIFswLDFdID0+ICopXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwdWJsaWMgcmVhZG9ubHkgdmFsdWU6IE51bWJlckZ1bmN0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHVibGljIHJlYWRvbmx5IGRlcml2YXRpdmU6IE51bWJlckZ1bmN0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHVibGljIHJlYWRvbmx5IHNlY29uZERlcml2YXRpdmU6IE51bWJlckZ1bmN0aW9uICkge1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIFwicG9seW5vbWlhbCBlYXNlIGluXCIgZnVuY3Rpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbiAtIFRoZSBkZWdyZWUgb2YgdGhlIHBvbHlub21pYWwgKGRvZXMgbm90IGhhdmUgdG8gYmUgYW4gaW50ZWdlciEpXHJcbiAgICogQHBhcmFtIHQgLSBUaGUgbGluZWFyIHJhdGlvIFswLDFdIG9mIHRoZSBhbmltYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHBvbHlub21pYWxFYXNlSW5WYWx1ZSggbjogbnVtYmVyLCB0OiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRJc1ZhbGlkKCB0ICksIGBpbnZhbGlkIHQ6ICR7dH1gICk7XHJcblxyXG4gICAgcmV0dXJuIE1hdGgucG93KCB0LCBuICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgXCJwb2x5bm9taWFsIGVhc2Ugb3V0XCIgZnVuY3Rpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbiAtIFRoZSBkZWdyZWUgb2YgdGhlIHBvbHlub21pYWwgKGRvZXMgbm90IGhhdmUgdG8gYmUgYW4gaW50ZWdlciEpXHJcbiAgICogQHBhcmFtIHQgLSBUaGUgbGluZWFyIHJhdGlvIFswLDFdIG9mIHRoZSBhbmltYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHBvbHlub21pYWxFYXNlT3V0VmFsdWUoIG46IG51bWJlciwgdDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0SXNWYWxpZCggdCApLCBgaW52YWxpZCB0OiAke3R9YCApO1xyXG5cclxuICAgIHJldHVybiAxIC0gTWF0aC5wb3coIDEgLSB0LCBuICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgXCJwb2x5bm9taWFsIGVhc2UgaW4tb3V0XCIgZnVuY3Rpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbiAtIFRoZSBkZWdyZWUgb2YgdGhlIHBvbHlub21pYWwgKGRvZXMgbm90IGhhdmUgdG8gYmUgYW4gaW50ZWdlciEpXHJcbiAgICogQHBhcmFtIHQgLSBUaGUgbGluZWFyIHJhdGlvIFswLDFdIG9mIHRoZSBhbmltYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHBvbHlub21pYWxFYXNlSW5PdXRWYWx1ZSggbjogbnVtYmVyLCB0OiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRJc1ZhbGlkKCB0ICksIGBpbnZhbGlkIHQ6ICR7dH1gICk7XHJcblxyXG4gICAgaWYgKCB0IDw9IDAuNSApIHtcclxuICAgICAgcmV0dXJuIDAuNSAqIE1hdGgucG93KCAyICogdCwgbiApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiAxIC0gRWFzaW5nLnBvbHlub21pYWxFYXNlSW5PdXRWYWx1ZSggbiwgMSAtIHQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBkZXJpdmF0aXZlIG9mIHRoZSBcInBvbHlub21pYWwgZWFzZSBpblwiIGZ1bmN0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG4gLSBUaGUgZGVncmVlIG9mIHRoZSBwb2x5bm9taWFsIChkb2VzIG5vdCBoYXZlIHRvIGJlIGFuIGludGVnZXIhKVxyXG4gICAqIEBwYXJhbSB0IC0gVGhlIGxpbmVhciByYXRpbyBbMCwxXSBvZiB0aGUgYW5pbWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBwb2x5bm9taWFsRWFzZUluRGVyaXZhdGl2ZSggbjogbnVtYmVyLCB0OiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRJc1ZhbGlkKCB0ICksIGBpbnZhbGlkIHQ6ICR7dH1gICk7XHJcblxyXG4gICAgcmV0dXJuIG4gKiBNYXRoLnBvdyggdCwgbiAtIDEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBkZXJpdmF0aXZlIG9mIHRoZSBcInBvbHlub21pYWwgZWFzZSBvdXRcIiBmdW5jdGlvbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBuIC0gVGhlIGRlZ3JlZSBvZiB0aGUgcG9seW5vbWlhbCAoZG9lcyBub3QgaGF2ZSB0byBiZSBhbiBpbnRlZ2VyISlcclxuICAgKiBAcGFyYW0gdCAtIFRoZSBsaW5lYXIgcmF0aW8gWzAsMV0gb2YgdGhlIGFuaW1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcG9seW5vbWlhbEVhc2VPdXREZXJpdmF0aXZlKCBuOiBudW1iZXIsIHQ6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdElzVmFsaWQoIHQgKSwgYGludmFsaWQgdDogJHt0fWAgKTtcclxuXHJcbiAgICByZXR1cm4gbiAqIE1hdGgucG93KCAxIC0gdCwgbiAtIDEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBkZXJpdmF0aXZlIG9mIHRoZSBcInBvbHlub21pYWwgZWFzZSBpbi1vdXRcIiBmdW5jdGlvbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBuIC0gVGhlIGRlZ3JlZSBvZiB0aGUgcG9seW5vbWlhbCAoZG9lcyBub3QgaGF2ZSB0byBiZSBhbiBpbnRlZ2VyISlcclxuICAgKiBAcGFyYW0gdCAtIFRoZSBsaW5lYXIgcmF0aW8gWzAsMV0gb2YgdGhlIGFuaW1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcG9seW5vbWlhbEVhc2VJbk91dERlcml2YXRpdmUoIG46IG51bWJlciwgdDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0SXNWYWxpZCggdCApLCBgaW52YWxpZCB0OiAke3R9YCApO1xyXG5cclxuICAgIGlmICggdCA8PSAwLjUgKSB7XHJcbiAgICAgIHJldHVybiBNYXRoLnBvdyggMiwgbiAtIDEgKSAqIG4gKiBNYXRoLnBvdyggdCwgbiAtIDEgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gRWFzaW5nLnBvbHlub21pYWxFYXNlSW5PdXREZXJpdmF0aXZlKCBuLCAxIC0gdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHNlY29uZCBkZXJpdmF0aXZlIG9mIHRoZSBcInBvbHlub21pYWwgZWFzZSBpblwiIGZ1bmN0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG4gLSBUaGUgZGVncmVlIG9mIHRoZSBwb2x5bm9taWFsIChkb2VzIG5vdCBoYXZlIHRvIGJlIGFuIGludGVnZXIhKVxyXG4gICAqIEBwYXJhbSB0IC0gVGhlIGxpbmVhciByYXRpbyBbMCwxXSBvZiB0aGUgYW5pbWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBwb2x5bm9taWFsRWFzZUluU2Vjb25kRGVyaXZhdGl2ZSggbjogbnVtYmVyLCB0OiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRJc1ZhbGlkKCB0ICksIGBpbnZhbGlkIHQ6ICR7dH1gICk7XHJcblxyXG4gICAgcmV0dXJuICggbiAtIDEgKSAqIG4gKiBNYXRoLnBvdyggdCwgbiAtIDIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBzZWNvbmQgZGVyaXZhdGl2ZSBvZiB0aGUgXCJwb2x5bm9taWFsIGVhc2Ugb3V0XCIgZnVuY3Rpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbiAtIFRoZSBkZWdyZWUgb2YgdGhlIHBvbHlub21pYWwgKGRvZXMgbm90IGhhdmUgdG8gYmUgYW4gaW50ZWdlciEpXHJcbiAgICogQHBhcmFtIHQgLSBUaGUgbGluZWFyIHJhdGlvIFswLDFdIG9mIHRoZSBhbmltYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHBvbHlub21pYWxFYXNlT3V0U2Vjb25kRGVyaXZhdGl2ZSggbjogbnVtYmVyLCB0OiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRJc1ZhbGlkKCB0ICksIGBpbnZhbGlkIHQ6ICR7dH1gICk7XHJcblxyXG4gICAgcmV0dXJuIC0oIG4gLSAxICkgKiBuICogTWF0aC5wb3coIDEgLSB0LCBuIC0gMiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHNlY29uZCBkZXJpdmF0aXZlIG9mIHRoZSBcInBvbHlub21pYWwgZWFzZSBpbi1vdXRcIiBmdW5jdGlvbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBuIC0gVGhlIGRlZ3JlZSBvZiB0aGUgcG9seW5vbWlhbCAoZG9lcyBub3QgaGF2ZSB0byBiZSBhbiBpbnRlZ2VyISlcclxuICAgKiBAcGFyYW0gdCAtIFRoZSBsaW5lYXIgcmF0aW8gWzAsMV0gb2YgdGhlIGFuaW1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcG9seW5vbWlhbEVhc2VJbk91dFNlY29uZERlcml2YXRpdmUoIG46IG51bWJlciwgdDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0SXNWYWxpZCggdCApLCBgaW52YWxpZCB0OiAke3R9YCApO1xyXG5cclxuICAgIGlmICggdCA8PSAwLjUgKSB7XHJcbiAgICAgIHJldHVybiBNYXRoLnBvdyggMiwgbiAtIDEgKSAqICggbiAtIDEgKSAqIG4gKiBNYXRoLnBvdyggdCwgbiAtIDIgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gLUVhc2luZy5wb2x5bm9taWFsRWFzZUluT3V0U2Vjb25kRGVyaXZhdGl2ZSggbiwgMSAtIHQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBwb2x5bm9taWFsIFwiaW5cIiBlYXNpbmcgKHNtb290aCBzdGFydClcclxuICAgKlxyXG4gICAqIEBwYXJhbSBuIC0gVGhlIGRlZ3JlZSBvZiB0aGUgcG9seW5vbWlhbCAoZG9lcyBub3QgaGF2ZSB0byBiZSBhbiBpbnRlZ2VyISlcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHBvbHlub21pYWxFYXNlSW4oIG46IG51bWJlciApOiBFYXNpbmcge1xyXG4gICAgcmV0dXJuIG5ldyBFYXNpbmcoXHJcbiAgICAgIEVhc2luZy5wb2x5bm9taWFsRWFzZUluVmFsdWUuYmluZCggbnVsbCwgbiApLFxyXG4gICAgICBFYXNpbmcucG9seW5vbWlhbEVhc2VJbkRlcml2YXRpdmUuYmluZCggbnVsbCwgbiApLFxyXG4gICAgICBFYXNpbmcucG9seW5vbWlhbEVhc2VJblNlY29uZERlcml2YXRpdmUuYmluZCggbnVsbCwgbiApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHBvbHlub21pYWwgXCJvdXRcIiBlYXNpbmcgKHNtb290aCBlbmQpXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbiAtIFRoZSBkZWdyZWUgb2YgdGhlIHBvbHlub21pYWwgKGRvZXMgbm90IGhhdmUgdG8gYmUgYW4gaW50ZWdlciEpXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBwb2x5bm9taWFsRWFzZU91dCggbjogbnVtYmVyICk6IEVhc2luZyB7XHJcbiAgICByZXR1cm4gbmV3IEVhc2luZyhcclxuICAgICAgRWFzaW5nLnBvbHlub21pYWxFYXNlT3V0VmFsdWUuYmluZCggbnVsbCwgbiApLFxyXG4gICAgICBFYXNpbmcucG9seW5vbWlhbEVhc2VPdXREZXJpdmF0aXZlLmJpbmQoIG51bGwsIG4gKSxcclxuICAgICAgRWFzaW5nLnBvbHlub21pYWxFYXNlT3V0U2Vjb25kRGVyaXZhdGl2ZS5iaW5kKCBudWxsLCBuIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcG9seW5vbWlhbCBcImluLW91dFwiIGVhc2luZyAoc21vb3RoIHN0YXJ0IGFuZCBlbmQpXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbiAtIFRoZSBkZWdyZWUgb2YgdGhlIHBvbHlub21pYWwgKGRvZXMgbm90IGhhdmUgdG8gYmUgYW4gaW50ZWdlciEpXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBwb2x5bm9taWFsRWFzZUluT3V0KCBuOiBudW1iZXIgKTogRWFzaW5nIHtcclxuICAgIHJldHVybiBuZXcgRWFzaW5nKFxyXG4gICAgICBFYXNpbmcucG9seW5vbWlhbEVhc2VJbk91dFZhbHVlLmJpbmQoIG51bGwsIG4gKSxcclxuICAgICAgRWFzaW5nLnBvbHlub21pYWxFYXNlSW5PdXREZXJpdmF0aXZlLmJpbmQoIG51bGwsIG4gKSxcclxuICAgICAgRWFzaW5nLnBvbHlub21pYWxFYXNlSW5PdXRTZWNvbmREZXJpdmF0aXZlLmJpbmQoIG51bGwsIG4gKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIFRoZSBpZGVudGl0eSBlYXNpbmdcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IExJTkVBUiA9IEVhc2luZy5wb2x5bm9taWFsRWFzZUluKCAxICk7XHJcblxyXG4gIC8vIFF1YWRyYXRpYy1kZXJpdmVkIGVhc2luZ3MgKHReMilcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFFVQURSQVRJQ19JTiA9IEVhc2luZy5wb2x5bm9taWFsRWFzZUluKCAyICk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBRVUFEUkFUSUNfT1VUID0gRWFzaW5nLnBvbHlub21pYWxFYXNlT3V0KCAyICk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBRVUFEUkFUSUNfSU5fT1VUID0gRWFzaW5nLnBvbHlub21pYWxFYXNlSW5PdXQoIDIgKTtcclxuXHJcbiAgLy8gQ3ViaWMtZGVyaXZlZCBlYXNpbmdzICh0XjMpXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBDVUJJQ19JTiA9IEVhc2luZy5wb2x5bm9taWFsRWFzZUluKCAzICk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBDVUJJQ19PVVQgPSBFYXNpbmcucG9seW5vbWlhbEVhc2VPdXQoIDMgKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENVQklDX0lOX09VVCA9IEVhc2luZy5wb2x5bm9taWFsRWFzZUluT3V0KCAzICk7XHJcblxyXG4gIC8vIFF1YXJ0aWMtZGVyaXZlZCBlYXNpbmdzICh0XjQpXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBRVUFSVElDX0lOID0gRWFzaW5nLnBvbHlub21pYWxFYXNlSW4oIDQgKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFFVQVJUSUNfT1VUID0gRWFzaW5nLnBvbHlub21pYWxFYXNlT3V0KCA0ICk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBRVUFSVElDX0lOX09VVCA9IEVhc2luZy5wb2x5bm9taWFsRWFzZUluT3V0KCA0ICk7XHJcblxyXG4gIC8vIFF1aW50aWMtZGVyaXZlZCBlYXNpbmdzICh0XjUpXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBRVUlOVElDX0lOID0gRWFzaW5nLnBvbHlub21pYWxFYXNlSW4oIDUgKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFFVSU5USUNfT1VUID0gRWFzaW5nLnBvbHlub21pYWxFYXNlT3V0KCA1ICk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBRVUlOVElDX0lOX09VVCA9IEVhc2luZy5wb2x5bm9taWFsRWFzZUluT3V0KCA1ICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWZXJpZmllcyB0aGF0IHQgaXMgdmFsaWQuXHJcbiAqIEBwYXJhbSB0IC0gVGhlIGxpbmVhciByYXRpbyBbMCwxXSBvZiB0aGUgYW5pbWF0aW9uXHJcbiAqL1xyXG5mdW5jdGlvbiB0SXNWYWxpZCggdDogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiB0eXBlb2YgdCA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHQgKSAmJiB0ID49IDAgJiYgdCA8PSAxO1xyXG59XHJcblxyXG50d2l4dC5yZWdpc3RlciggJ0Vhc2luZycsIEVhc2luZyApO1xyXG5leHBvcnQgZGVmYXVsdCBFYXNpbmc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLFlBQVk7QUFJOUIsTUFBTUMsTUFBTSxDQUFDO0VBRVg7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0MsV0FBV0EsQ0FBa0JDLEtBQXFCLEVBQ3JCQyxVQUEwQixFQUMxQkMsZ0JBQWdDLEVBQUc7SUFBQSxLQUZuQ0YsS0FBcUIsR0FBckJBLEtBQXFCO0lBQUEsS0FDckJDLFVBQTBCLEdBQTFCQSxVQUEwQjtJQUFBLEtBQzFCQyxnQkFBZ0MsR0FBaENBLGdCQUFnQztFQUNwRTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFjQyxxQkFBcUJBLENBQUVDLENBQVMsRUFBRUMsQ0FBUyxFQUFXO0lBQ2xFQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUMsUUFBUSxDQUFFRixDQUFFLENBQUMsRUFBRyxjQUFhQSxDQUFFLEVBQUUsQ0FBQztJQUVwRCxPQUFPRyxJQUFJLENBQUNDLEdBQUcsQ0FBRUosQ0FBQyxFQUFFRCxDQUFFLENBQUM7RUFDekI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBY00sc0JBQXNCQSxDQUFFTixDQUFTLEVBQUVDLENBQVMsRUFBVztJQUNuRUMsTUFBTSxJQUFJQSxNQUFNLENBQUVDLFFBQVEsQ0FBRUYsQ0FBRSxD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