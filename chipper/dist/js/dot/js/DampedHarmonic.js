// Copyright 2023, University of Colorado Boulder

/**
 * Solves for a specific solution of a damped harmonic oscillator
 * (https://en.wikipedia.org/wiki/Harmonic_oscillator#Damped_harmonic_oscillator), given the initial value and
 * derivative.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
import dot from './dot.js';
class SolutionType extends EnumerationValue {
  static OVER_DAMPED = new SolutionType();
  static UNDER_DAMPED = new SolutionType();
  static CRITICALLY_DAMPED = new SolutionType();
  static UNKNOWN = new SolutionType();
  static enumeration = new Enumeration(SolutionType);
}
class DampedHarmonic {
  // if critically damped
  // if under-damped
  // if over-damped
  // if over-damped
  /**
   * For solving ax'' + bx' + cx = 0 with initial conditions x(0) and x'(0).
   *
   * @param a - Coefficient in front of the second derivative.
   * @param b - Coefficient in front of the first derivative, responsible for the amount of damping applied.
   * @param c - Coefficient in front of the current value, responsible for the amount of force towards equilibrium.
   * @param initialValue - The value of x(0), i.e. the initial position at t=0.
   * @param initialDerivative - The value of x'(0), i.e. the initial velocity at t=0;
   */
  constructor(a, b, c, initialValue, initialDerivative) {
    assert && assert(isFinite(a) && a !== 0);
    assert && assert(isFinite(b));
    assert && assert(isFinite(c) && c !== 0);
    assert && assert(isFinite(initialValue));
    assert && assert(isFinite(initialDerivative));

    // We'll transform into the simpler: x'' + dampingConstant x' + angularFrequencySquared x = 0
    this.dampingConstant = b / a;
    this.angularFrequencySquared = c / a;
    assert && assert(this.dampingConstant >= 0, 'a and b should share the same sign');
    assert && assert(this.angularFrequencySquared > 0, 'a and c should share the same sign');

    // Determines what type of solution is required.
    this.discriminant = this.dampingConstant * this.dampingConstant - 4 * this.angularFrequencySquared;
    this.solutionType = SolutionType.UNKNOWN; // will be filled in below

    // Constants that determine what linear combination of solutions satisfies the initial conditions
    this.c1 = 0;
    this.c2 = 0;
    if (Math.abs(this.discriminant) < 1e-5) {
      this.solutionType = SolutionType.CRITICALLY_DAMPED;
      this.angularFrequency = Math.sqrt(this.angularFrequencySquared);
      this.c1 = initialValue;
      this.c2 = initialDerivative + this.angularFrequency * initialValue;
    } else if (this.discriminant < 0) {
      this.solutionType = SolutionType.UNDER_DAMPED;
      this.frequency = 0.5 * Math.sqrt(-this.discriminant);
      this.c1 = initialValue;
      this.c2 = this.dampingConstant * initialValue / (2 * this.frequency) + initialDerivative / this.frequency;
    } else {
      this.solutionType = SolutionType.OVER_DAMPED;
      this.positiveRoot = 0.5 * (-this.dampingConstant + Math.sqrt(this.discriminant));
      this.negativeRoot = 0.5 * (-this.dampingConstant - Math.sqrt(this.discriminant));
      this.c2 = (this.negativeRoot * initialValue - initialDerivative) / (this.negativeRoot - this.positiveRoot);
      this.c1 = initialValue - this.c2;
    }
  }

  /**
   * Returns the value of x(t) determined by the differential equation and initial conditions.
   */
  getValue(t) {
    if (this.solutionType === SolutionType.CRITICALLY_DAMPED) {
      assert && assert(this.angularFrequency !== undefined);
      return (this.c1 + this.c2 * t) * Math.exp(-this.angularFrequency * t);
    } else if (this.solutionType === SolutionType.UNDER_DAMPED) {
      assert && assert(this.frequency !== undefined);
      const theta = this.frequency * t;
      return Math.exp(-(this.dampingConstant / 2) * t) * (this.c1 * Math.cos(theta) + this.c2 * Math.sin(theta));
    } else if (this.solutionType === SolutionType.OVER_DAMPED) {
      assert && assert(this.positiveRoot !== undefined);
      assert && assert(this.negativeRoot !== undefined);
      return this.c1 * Math.exp(this.negativeRoot * t) + this.c2 * Math.exp(this.positiveRoot * t);
    } else {
      throw new Error('Unknown solution type?');
    }
  }

  /**
   * Returns the value of x'(t) determined by the differential equation and initial conditions.
   */
  getDerivative(t) {
    if (this.solutionType === SolutionType.CRITICALLY_DAMPED) {
      assert && assert(this.angularFrequency !== undefined);
      return Math.exp(-this.angularFrequency * t) * (this.c2 - this.angularFrequency * (this.c1 + this.c2 * t));
    } else if (this.solutionType === SolutionType.UNDER_DAMPED) {
      assert && assert(this.frequency !== undefined);
      const theta = this.frequency * t;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      const term1 = this.frequency * (this.c2 * cos - this.c1 * sin);
      const term2 = 0.5 * this.dampingConstant * (this.c1 * cos + this.c2 * sin);
      return Math.exp(-0.5 * this.dampingConstant * t) * (term1 - term2);
    } else if (this.solutionType === SolutionType.OVER_DAMPED) {
      assert && assert(this.positiveRoot !== undefined);
      assert && assert(this.negativeRoot !== undefined);
      return this.c1 * this.negativeRoot * Math.exp(this.negativeRoot * t) + this.c2 * this.positiveRoot * Math.exp(this.positiveRoot * t);
    } else {
      throw new Error('Unknown solution type?');
    }
  }
}
dot.register('DampedHarmonic', DampedHarmonic);
export default DampedHarmonic;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJkb3QiLCJTb2x1dGlvblR5cGUiLCJPVkVSX0RBTVBFRCIsIlVOREVSX0RBTVBFRCIsIkNSSVRJQ0FMTFlfREFNUEVEIiwiVU5LTk9XTiIsImVudW1lcmF0aW9uIiwiRGFtcGVkSGFybW9uaWMiLCJjb25zdHJ1Y3RvciIsImEiLCJiIiwiYyIsImluaXRpYWxWYWx1ZSIsImluaXRpYWxEZXJpdmF0aXZlIiwiYXNzZXJ0IiwiaXNGaW5pdGUiLCJkYW1waW5nQ29uc3RhbnQiLCJhbmd1bGFyRnJlcXVlbmN5U3F1YXJlZCIsImRpc2NyaW1pbmFudCIsInNvbHV0aW9uVHlwZSIsImMxIiwiYzIiLCJNYXRoIiwiYWJzIiwiYW5ndWxhckZyZXF1ZW5jeSIsInNxcnQiLCJmcmVxdWVuY3kiLCJwb3NpdGl2ZVJvb3QiLCJuZWdhdGl2ZVJvb3QiLCJnZXRWYWx1ZSIsInQiLCJ1bmRlZmluZWQiLCJleHAiLCJ0aGV0YSIsImNvcyIsInNpbiIsIkVycm9yIiwiZ2V0RGVyaXZhdGl2ZSIsInRlcm0xIiwidGVybTIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRhbXBlZEhhcm1vbmljLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTb2x2ZXMgZm9yIGEgc3BlY2lmaWMgc29sdXRpb24gb2YgYSBkYW1wZWQgaGFybW9uaWMgb3NjaWxsYXRvclxyXG4gKiAoaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSGFybW9uaWNfb3NjaWxsYXRvciNEYW1wZWRfaGFybW9uaWNfb3NjaWxsYXRvciksIGdpdmVuIHRoZSBpbml0aWFsIHZhbHVlIGFuZFxyXG4gKiBkZXJpdmF0aXZlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XHJcblxyXG5jbGFzcyBTb2x1dGlvblR5cGUgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE9WRVJfREFNUEVEID0gbmV3IFNvbHV0aW9uVHlwZSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVU5ERVJfREFNUEVEID0gbmV3IFNvbHV0aW9uVHlwZSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQ1JJVElDQUxMWV9EQU1QRUQgPSBuZXcgU29sdXRpb25UeXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBVTktOT1dOID0gbmV3IFNvbHV0aW9uVHlwZSgpO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGVudW1lcmF0aW9uID0gbmV3IEVudW1lcmF0aW9uKCBTb2x1dGlvblR5cGUgKTtcclxufVxyXG5cclxuY2xhc3MgRGFtcGVkSGFybW9uaWMge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRhbXBpbmdDb25zdGFudDogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYW5ndWxhckZyZXF1ZW5jeVNxdWFyZWQ6IG51bWJlcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc2NyaW1pbmFudDogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc29sdXRpb25UeXBlOiBTb2x1dGlvblR5cGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjMTogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYzI6IG51bWJlcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGFuZ3VsYXJGcmVxdWVuY3k/OiBudW1iZXI7IC8vIGlmIGNyaXRpY2FsbHkgZGFtcGVkXHJcbiAgcHJpdmF0ZSByZWFkb25seSBmcmVxdWVuY3k/OiBudW1iZXI7IC8vIGlmIHVuZGVyLWRhbXBlZFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcG9zaXRpdmVSb290PzogbnVtYmVyOyAvLyBpZiBvdmVyLWRhbXBlZFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbmVnYXRpdmVSb290PzogbnVtYmVyOyAvLyBpZiBvdmVyLWRhbXBlZFxyXG5cclxuICAvKipcclxuICAgKiBGb3Igc29sdmluZyBheCcnICsgYngnICsgY3ggPSAwIHdpdGggaW5pdGlhbCBjb25kaXRpb25zIHgoMCkgYW5kIHgnKDApLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGEgLSBDb2VmZmljaWVudCBpbiBmcm9udCBvZiB0aGUgc2Vjb25kIGRlcml2YXRpdmUuXHJcbiAgICogQHBhcmFtIGIgLSBDb2VmZmljaWVudCBpbiBmcm9udCBvZiB0aGUgZmlyc3QgZGVyaXZhdGl2ZSwgcmVzcG9uc2libGUgZm9yIHRoZSBhbW91bnQgb2YgZGFtcGluZyBhcHBsaWVkLlxyXG4gICAqIEBwYXJhbSBjIC0gQ29lZmZpY2llbnQgaW4gZnJvbnQgb2YgdGhlIGN1cnJlbnQgdmFsdWUsIHJlc3BvbnNpYmxlIGZvciB0aGUgYW1vdW50IG9mIGZvcmNlIHRvd2FyZHMgZXF1aWxpYnJpdW0uXHJcbiAgICogQHBhcmFtIGluaXRpYWxWYWx1ZSAtIFRoZSB2YWx1ZSBvZiB4KDApLCBpLmUuIHRoZSBpbml0aWFsIHBvc2l0aW9uIGF0IHQ9MC5cclxuICAgKiBAcGFyYW0gaW5pdGlhbERlcml2YXRpdmUgLSBUaGUgdmFsdWUgb2YgeCcoMCksIGkuZS4gdGhlIGluaXRpYWwgdmVsb2NpdHkgYXQgdD0wO1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlciwgaW5pdGlhbFZhbHVlOiBudW1iZXIsIGluaXRpYWxEZXJpdmF0aXZlOiBudW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYSApICYmIGEgIT09IDAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBiICkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBjICkgJiYgYyAhPT0gMCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGluaXRpYWxWYWx1ZSApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggaW5pdGlhbERlcml2YXRpdmUgKSApO1xyXG5cclxuICAgIC8vIFdlJ2xsIHRyYW5zZm9ybSBpbnRvIHRoZSBzaW1wbGVyOiB4JycgKyBkYW1waW5nQ29uc3RhbnQgeCcgKyBhbmd1bGFyRnJlcXVlbmN5U3F1YXJlZCB4ID0gMFxyXG4gICAgdGhpcy5kYW1waW5nQ29uc3RhbnQgPSBiIC8gYTtcclxuICAgIHRoaXMuYW5ndWxhckZyZXF1ZW5jeVNxdWFyZWQgPSBjIC8gYTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmRhbXBpbmdDb25zdGFudCA+PSAwLCAnYSBhbmQgYiBzaG91bGQgc2hhcmUgdGhlIHNhbWUgc2lnbicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYW5ndWxhckZyZXF1ZW5jeVNxdWFyZWQgPiAwLCAnYSBhbmQgYyBzaG91bGQgc2hhcmUgdGhlIHNhbWUgc2lnbicgKTtcclxuXHJcbiAgICAvLyBEZXRlcm1pbmVzIHdoYXQgdHlwZSBvZiBzb2x1dGlvbiBpcyByZXF1aXJlZC5cclxuICAgIHRoaXMuZGlzY3JpbWluYW50ID0gdGhpcy5kYW1waW5nQ29uc3RhbnQgKiB0aGlzLmRhbXBpbmdDb25zdGFudCAtIDQgKiB0aGlzLmFuZ3VsYXJGcmVxdWVuY3lTcXVhcmVkO1xyXG5cclxuICAgIHRoaXMuc29sdXRpb25UeXBlID0gU29sdXRpb25UeXBlLlVOS05PV047IC8vIHdpbGwgYmUgZmlsbGVkIGluIGJlbG93XHJcblxyXG4gICAgLy8gQ29uc3RhbnRzIHRoYXQgZGV0ZXJtaW5lIHdoYXQgbGluZWFyIGNvbWJpbmF0aW9uIG9mIHNvbHV0aW9ucyBzYXRpc2ZpZXMgdGhlIGluaXRpYWwgY29uZGl0aW9uc1xyXG4gICAgdGhpcy5jMSA9IDA7XHJcbiAgICB0aGlzLmMyID0gMDtcclxuXHJcbiAgICBpZiAoIE1hdGguYWJzKCB0aGlzLmRpc2NyaW1pbmFudCApIDwgMWUtNSApIHtcclxuICAgICAgdGhpcy5zb2x1dGlvblR5cGUgPSBTb2x1dGlvblR5cGUuQ1JJVElDQUxMWV9EQU1QRUQ7XHJcblxyXG4gICAgICB0aGlzLmFuZ3VsYXJGcmVxdWVuY3kgPSBNYXRoLnNxcnQoIHRoaXMuYW5ndWxhckZyZXF1ZW5jeVNxdWFyZWQgKTtcclxuXHJcbiAgICAgIHRoaXMuYzEgPSBpbml0aWFsVmFsdWU7XHJcbiAgICAgIHRoaXMuYzIgPSBpbml0aWFsRGVyaXZhdGl2ZSArIHRoaXMuYW5ndWxhckZyZXF1ZW5jeSAqIGluaXRpYWxWYWx1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLmRpc2NyaW1pbmFudCA8IDAgKSB7XHJcbiAgICAgIHRoaXMuc29sdXRpb25UeXBlID0gU29sdXRpb25UeXBlLlVOREVSX0RBTVBFRDtcclxuXHJcbiAgICAgIHRoaXMuZnJlcXVlbmN5ID0gMC41ICogTWF0aC5zcXJ0KCAtdGhpcy5kaXNjcmltaW5hbnQgKTtcclxuXHJcbiAgICAgIHRoaXMuYzEgPSBpbml0aWFsVmFsdWU7XHJcbiAgICAgIHRoaXMuYzIgPSAoIHRoaXMuZGFtcGluZ0NvbnN0YW50ICogaW5pdGlhbFZhbHVlICkgLyAoIDIgKiB0aGlzLmZyZXF1ZW5jeSApICsgaW5pdGlhbERlcml2YXRpdmUgLyB0aGlzLmZyZXF1ZW5jeTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnNvbHV0aW9uVHlwZSA9IFNvbHV0aW9uVHlwZS5PVkVSX0RBTVBFRDtcclxuXHJcbiAgICAgIHRoaXMucG9zaXRpdmVSb290ID0gMC41ICogKCAtdGhpcy5kYW1waW5nQ29uc3RhbnQgKyBNYXRoLnNxcnQoIHRoaXMuZGlzY3JpbWluYW50ICkgKTtcclxuICAgICAgdGhpcy5uZWdhdGl2ZVJvb3QgPSAwLjUgKiAoIC10aGlzLmRhbXBpbmdDb25zdGFudCAtIE1hdGguc3FydCggdGhpcy5kaXNjcmltaW5hbnQgKSApO1xyXG5cclxuICAgICAgdGhpcy5jMiA9ICggdGhpcy5uZWdhdGl2ZVJvb3QgKiBpbml0aWFsVmFsdWUgLSBpbml0aWFsRGVyaXZhdGl2ZSApIC8gKCB0aGlzLm5lZ2F0aXZlUm9vdCAtIHRoaXMucG9zaXRpdmVSb290ICk7XHJcbiAgICAgIHRoaXMuYzEgPSBpbml0aWFsVmFsdWUgLSB0aGlzLmMyO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgeCh0KSBkZXRlcm1pbmVkIGJ5IHRoZSBkaWZmZXJlbnRpYWwgZXF1YXRpb24gYW5kIGluaXRpYWwgY29uZGl0aW9ucy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VmFsdWUoIHQ6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgaWYgKCB0aGlzLnNvbHV0aW9uVHlwZSA9PT0gU29sdXRpb25UeXBlLkNSSVRJQ0FMTFlfREFNUEVEICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmFuZ3VsYXJGcmVxdWVuY3kgIT09IHVuZGVmaW5lZCApO1xyXG5cclxuICAgICAgcmV0dXJuICggdGhpcy5jMSArIHRoaXMuYzIgKiB0ICkgKiBNYXRoLmV4cCggLXRoaXMuYW5ndWxhckZyZXF1ZW5jeSEgKiB0ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5zb2x1dGlvblR5cGUgPT09IFNvbHV0aW9uVHlwZS5VTkRFUl9EQU1QRUQgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZnJlcXVlbmN5ICE9PSB1bmRlZmluZWQgKTtcclxuXHJcbiAgICAgIGNvbnN0IHRoZXRhID0gdGhpcy5mcmVxdWVuY3khICogdDtcclxuICAgICAgcmV0dXJuIE1hdGguZXhwKCAtKCB0aGlzLmRhbXBpbmdDb25zdGFudCAvIDIgKSAqIHQgKSAqICggdGhpcy5jMSAqIE1hdGguY29zKCB0aGV0YSApICsgdGhpcy5jMiAqIE1hdGguc2luKCB0aGV0YSApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5zb2x1dGlvblR5cGUgPT09IFNvbHV0aW9uVHlwZS5PVkVSX0RBTVBFRCApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wb3NpdGl2ZVJvb3QgIT09IHVuZGVmaW5lZCApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm5lZ2F0aXZlUm9vdCAhPT0gdW5kZWZpbmVkICk7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5jMSAqIE1hdGguZXhwKCB0aGlzLm5lZ2F0aXZlUm9vdCEgKiB0ICkgKyB0aGlzLmMyICogTWF0aC5leHAoIHRoaXMucG9zaXRpdmVSb290ISAqIHQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdVbmtub3duIHNvbHV0aW9uIHR5cGU/JyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgeCcodCkgZGV0ZXJtaW5lZCBieSB0aGUgZGlmZmVyZW50aWFsIGVxdWF0aW9uIGFuZCBpbml0aWFsIGNvbmRpdGlvbnMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldERlcml2YXRpdmUoIHQ6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgaWYgKCB0aGlzLnNvbHV0aW9uVHlwZSA9PT0gU29sdXRpb25UeXBlLkNSSVRJQ0FMTFlfREFNUEVEICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmFuZ3VsYXJGcmVxdWVuY3kgIT09IHVuZGVmaW5lZCApO1xyXG5cclxuICAgICAgcmV0dXJuIE1hdGguZXhwKCAtdGhpcy5hbmd1bGFyRnJlcXVlbmN5ISAqIHQgKSAqICggdGhpcy5jMiAtIHRoaXMuYW5ndWxhckZyZXF1ZW5jeSEgKiAoIHRoaXMuYzEgKyB0aGlzLmMyICogdCApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5zb2x1dGlvblR5cGUgPT09IFNvbHV0aW9uVHlwZS5VTkRFUl9EQU1QRUQgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZnJlcXVlbmN5ICE9PSB1bmRlZmluZWQgKTtcclxuXHJcbiAgICAgIGNvbnN0IHRoZXRhID0gdGhpcy5mcmVxdWVuY3khICogdDtcclxuICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoIHRoZXRhICk7XHJcbiAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKCB0aGV0YSApO1xyXG4gICAgICBjb25zdCB0ZXJtMSA9IHRoaXMuZnJlcXVlbmN5ISAqICggdGhpcy5jMiAqIGNvcyAtIHRoaXMuYzEgKiBzaW4gKTtcclxuICAgICAgY29uc3QgdGVybTIgPSAwLjUgKiB0aGlzLmRhbXBpbmdDb25zdGFudCAqICggdGhpcy5jMSAqIGNvcyArIHRoaXMuYzIgKiBzaW4gKTtcclxuICAgICAgcmV0dXJuIE1hdGguZXhwKCAtMC41ICogdGhpcy5kYW1waW5nQ29uc3RhbnQgKiB0ICkgKiAoIHRlcm0xIC0gdGVybTIgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnNvbHV0aW9uVHlwZSA9PT0gU29sdXRpb25UeXBlLk9WRVJfREFNUEVEICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBvc2l0aXZlUm9vdCAhPT0gdW5kZWZpbmVkICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubmVnYXRpdmVSb290ICE9PSB1bmRlZmluZWQgKTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLmMxICogdGhpcy5uZWdhdGl2ZVJvb3QhICogTWF0aC5leHAoIHRoaXMubmVnYXRpdmVSb290ISAqIHQgKSArIHRoaXMuYzIgKiB0aGlzLnBvc2l0aXZlUm9vdCEgKiBNYXRoLmV4cCggdGhpcy5wb3NpdGl2ZVJvb3QhICogdCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ1Vua25vd24gc29sdXRpb24gdHlwZT8nICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5kb3QucmVnaXN0ZXIoICdEYW1wZWRIYXJtb25pYycsIERhbXBlZEhhcm1vbmljICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEYW1wZWRIYXJtb25pYzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0MsZ0JBQWdCLE1BQU0sd0NBQXdDO0FBQ3JFLE9BQU9DLEdBQUcsTUFBTSxVQUFVO0FBRTFCLE1BQU1DLFlBQVksU0FBU0YsZ0JBQWdCLENBQUM7RUFDMUMsT0FBdUJHLFdBQVcsR0FBRyxJQUFJRCxZQUFZLENBQUMsQ0FBQztFQUN2RCxPQUF1QkUsWUFBWSxHQUFHLElBQUlGLFlBQVksQ0FBQyxDQUFDO0VBQ3hELE9BQXVCRyxpQkFBaUIsR0FBRyxJQUFJSCxZQUFZLENBQUMsQ0FBQztFQUM3RCxPQUF1QkksT0FBTyxHQUFHLElBQUlKLFlBQVksQ0FBQyxDQUFDO0VBRW5ELE9BQXVCSyxXQUFXLEdBQUcsSUFBSVIsV0FBVyxDQUFFRyxZQUFhLENBQUM7QUFDdEU7QUFFQSxNQUFNTSxjQUFjLENBQUM7RUFReUI7RUFDUDtFQUNHO0VBQ0E7RUFFeEM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NDLFdBQVdBLENBQUVDLENBQVMsRUFBRUMsQ0FBUyxFQUFFQyxDQUFTLEVBQUVDLFlBQW9CLEVBQUVDLGlCQUF5QixFQUFHO0lBQ3JHQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUMsUUFBUSxDQUFFTixDQUFFLENBQUMsSUFBSUEsQ0FBQyxLQUFLLENBQUUsQ0FBQztJ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