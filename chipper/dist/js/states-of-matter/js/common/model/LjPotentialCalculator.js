// Copyright 2014-2020, University of Colorado Boulder

import statesOfMatter from '../../statesOfMatter.js';
import SOMConstants from '../SOMConstants.js';

/**
 * This class calculates the Lennard-Jones potential based on values provided for the molecule size (sigma) and the
 * interaction strength (epsilon).  Note that this is a "real" calculation as opposed to a normalized calculation, which
 * has been used elsewhere in the States of Matter simulation.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
class LjPotentialCalculator {
  /**
   * @param {number} sigma
   * @param {number} epsilon
   */
  constructor(sigma, epsilon) {
    assert && assert(sigma > 0, 'sigma must be greater than 0');
    this.sigma = sigma; // Molecular diameter in picometers.
    this.epsilon = epsilon; // Interaction strength, epsilon/k-boltzmann is in Kelvin.
    this.epsilonForCalcs = this.epsilon * SOMConstants.K_BOLTZMANN; // Epsilon multiplied by k-boltzmann.
  }

  /**
   * @returns {number}
   * @public
   */
  getSigma() {
    return this.sigma;
  }

  /**
   * @param {number} sigma
   * @public
   */
  setSigma(sigma) {
    this.sigma = sigma;
  }

  /**
   * @returns {number}
   * @public
   */
  getEpsilon() {
    return this.epsilon;
  }

  /**
   * @param {number} epsilon
   * @public
   */
  setEpsilon(epsilon) {
    this.epsilon = epsilon;
    this.epsilonForCalcs = this.epsilon * SOMConstants.K_BOLTZMANN;
  }

  /**
   * Calculate the Lennard-Jones potential for the specified distance.
   * @param {number} distance - Distance between interacting molecules in picometers.
   * @returns {number} Strength of the potential in newton-meters (N*m).
   * @public
   */
  getLjPotential(distance) {
    const distanceRatio = this.sigma / distance;
    return 4 * this.epsilonForCalcs * (Math.pow(distanceRatio, 12) - Math.pow(distanceRatio, 6));
  }

  /**
   * Calculate only the repulsive component of the Lennard-Jones force for the specified distance.
   * @param {number} distance - Distance between interacting molecules in picometers.
   * @returns {number} Force in newtons.
   * @public
   */
  getRepulsiveLjForce(distance) {
    return 48 * this.epsilonForCalcs * Math.pow(this.sigma, 12) / Math.pow(distance, 13);
  }

  /**
   * Calculate only the attractive component of the Lennard-Jones force for the specified distance.
   * @param {number} distance - Distance between interacting molecules in picometers.
   * @returns {number} - Force in newtons.
   * @public
   */
  getAttractiveLjForce(distance) {
    return 24 * this.epsilonForCalcs * Math.pow(this.sigma, 6) / Math.pow(distance, 7);
  }

  /**
   * Calculate the distance at which the force is 0 because the attractive and repulsive forces are balanced.  Note
   * that this is where the potential energy is at a minimum.
   * @returns {number} - Distance where force is 0 (or very close) in picometers.
   * @public
   */
  getMinimumForceDistance() {
    // this is the solution for the min potential
    return this.sigma * Math.pow(2, 1 / 6);
  }
}
statesOfMatter.register('LjPotentialCalculator', LjPotentialCalculator);
export default LjPotentialCalculator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdGF0ZXNPZk1hdHRlciIsIlNPTUNvbnN0YW50cyIsIkxqUG90ZW50aWFsQ2FsY3VsYXRvciIsImNvbnN0cnVjdG9yIiwic2lnbWEiLCJlcHNpbG9uIiwiYXNzZXJ0IiwiZXBzaWxvbkZvckNhbGNzIiwiS19CT0xUWk1BTk4iLCJnZXRTaWdtYSIsInNldFNpZ21hIiwiZ2V0RXBzaWxvbiIsInNldEVwc2lsb24iLCJnZXRMalBvdGVudGlhbCIsImRpc3RhbmNlIiwiZGlzdGFuY2VSYXRpbyIsIk1hdGgiLCJwb3ciLCJnZXRSZXB1bHNpdmVMakZvcmNlIiwiZ2V0QXR0cmFjdGl2ZUxqRm9yY2UiLCJnZXRNaW5pbXVtRm9yY2VEaXN0YW5jZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGpQb3RlbnRpYWxDYWxjdWxhdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuaW1wb3J0IHN0YXRlc09mTWF0dGVyIGZyb20gJy4uLy4uL3N0YXRlc09mTWF0dGVyLmpzJztcclxuaW1wb3J0IFNPTUNvbnN0YW50cyBmcm9tICcuLi9TT01Db25zdGFudHMuanMnO1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgY2FsY3VsYXRlcyB0aGUgTGVubmFyZC1Kb25lcyBwb3RlbnRpYWwgYmFzZWQgb24gdmFsdWVzIHByb3ZpZGVkIGZvciB0aGUgbW9sZWN1bGUgc2l6ZSAoc2lnbWEpIGFuZCB0aGVcclxuICogaW50ZXJhY3Rpb24gc3RyZW5ndGggKGVwc2lsb24pLiAgTm90ZSB0aGF0IHRoaXMgaXMgYSBcInJlYWxcIiBjYWxjdWxhdGlvbiBhcyBvcHBvc2VkIHRvIGEgbm9ybWFsaXplZCBjYWxjdWxhdGlvbiwgd2hpY2hcclxuICogaGFzIGJlZW4gdXNlZCBlbHNld2hlcmUgaW4gdGhlIFN0YXRlcyBvZiBNYXR0ZXIgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIFNpZGRoYXJ0aGEgQ2hpbnRoYXBhbGx5IChBY3R1YWwgQ29uY2VwdHMpXHJcbiAqL1xyXG5jbGFzcyBMalBvdGVudGlhbENhbGN1bGF0b3Ige1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2lnbWFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZXBzaWxvblxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzaWdtYSwgZXBzaWxvbiApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzaWdtYSA+IDAsICdzaWdtYSBtdXN0IGJlIGdyZWF0ZXIgdGhhbiAwJyApO1xyXG5cclxuICAgIHRoaXMuc2lnbWEgPSBzaWdtYTsgIC8vIE1vbGVjdWxhciBkaWFtZXRlciBpbiBwaWNvbWV0ZXJzLlxyXG4gICAgdGhpcy5lcHNpbG9uID0gZXBzaWxvbjsgLy8gSW50ZXJhY3Rpb24gc3RyZW5ndGgsIGVwc2lsb24vay1ib2x0em1hbm4gaXMgaW4gS2VsdmluLlxyXG4gICAgdGhpcy5lcHNpbG9uRm9yQ2FsY3MgPSB0aGlzLmVwc2lsb24gKiBTT01Db25zdGFudHMuS19CT0xUWk1BTk47ICAvLyBFcHNpbG9uIG11bHRpcGxpZWQgYnkgay1ib2x0em1hbm4uXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRTaWdtYSgpIHtcclxuICAgIHJldHVybiB0aGlzLnNpZ21hO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNpZ21hXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFNpZ21hKCBzaWdtYSApIHtcclxuICAgIHRoaXMuc2lnbWEgPSBzaWdtYTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldEVwc2lsb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lcHNpbG9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0RXBzaWxvbiggZXBzaWxvbiApIHtcclxuICAgIHRoaXMuZXBzaWxvbiA9IGVwc2lsb247XHJcbiAgICB0aGlzLmVwc2lsb25Gb3JDYWxjcyA9IHRoaXMuZXBzaWxvbiAqIFNPTUNvbnN0YW50cy5LX0JPTFRaTUFOTjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGN1bGF0ZSB0aGUgTGVubmFyZC1Kb25lcyBwb3RlbnRpYWwgZm9yIHRoZSBzcGVjaWZpZWQgZGlzdGFuY2UuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRpc3RhbmNlIC0gRGlzdGFuY2UgYmV0d2VlbiBpbnRlcmFjdGluZyBtb2xlY3VsZXMgaW4gcGljb21ldGVycy5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBTdHJlbmd0aCBvZiB0aGUgcG90ZW50aWFsIGluIG5ld3Rvbi1tZXRlcnMgKE4qbSkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldExqUG90ZW50aWFsKCBkaXN0YW5jZSApIHtcclxuICAgIGNvbnN0IGRpc3RhbmNlUmF0aW8gPSB0aGlzLnNpZ21hIC8gZGlzdGFuY2U7XHJcbiAgICByZXR1cm4gKCA0ICogdGhpcy5lcHNpbG9uRm9yQ2FsY3MgKiAoIE1hdGgucG93KCBkaXN0YW5jZVJhdGlvLCAxMiApIC0gTWF0aC5wb3coIGRpc3RhbmNlUmF0aW8sIDYgKSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxjdWxhdGUgb25seSB0aGUgcmVwdWxzaXZlIGNvbXBvbmVudCBvZiB0aGUgTGVubmFyZC1Kb25lcyBmb3JjZSBmb3IgdGhlIHNwZWNpZmllZCBkaXN0YW5jZS5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgLSBEaXN0YW5jZSBiZXR3ZWVuIGludGVyYWN0aW5nIG1vbGVjdWxlcyBpbiBwaWNvbWV0ZXJzLlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IEZvcmNlIGluIG5ld3RvbnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFJlcHVsc2l2ZUxqRm9yY2UoIGRpc3RhbmNlICkge1xyXG4gICAgcmV0dXJuICggNDggKiB0aGlzLmVwc2lsb25Gb3JDYWxjcyAqIE1hdGgucG93KCB0aGlzLnNpZ21hLCAxMiApIC8gTWF0aC5wb3coIGRpc3RhbmNlLCAxMyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxjdWxhdGUgb25seSB0aGUgYXR0cmFjdGl2ZSBjb21wb25lbnQgb2YgdGhlIExlbm5hcmQtSm9uZXMgZm9yY2UgZm9yIHRoZSBzcGVjaWZpZWQgZGlzdGFuY2UuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRpc3RhbmNlIC0gRGlzdGFuY2UgYmV0d2VlbiBpbnRlcmFjdGluZyBtb2xlY3VsZXMgaW4gcGljb21ldGVycy5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIEZvcmNlIGluIG5ld3RvbnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldEF0dHJhY3RpdmVMakZvcmNlKCBkaXN0YW5jZSApIHtcclxuICAgIHJldHVybiAoIDI0ICogdGhpcy5lcHNpbG9uRm9yQ2FsY3MgKiBNYXRoLnBvdyggdGhpcy5zaWdtYSwgNiApIC8gTWF0aC5wb3coIGRpc3RhbmNlLCA3ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgYXQgd2hpY2ggdGhlIGZvcmNlIGlzIDAgYmVjYXVzZSB0aGUgYXR0cmFjdGl2ZSBhbmQgcmVwdWxzaXZlIGZvcmNlcyBhcmUgYmFsYW5jZWQuICBOb3RlXHJcbiAgICogdGhhdCB0aGlzIGlzIHdoZXJlIHRoZSBwb3RlbnRpYWwgZW5lcmd5IGlzIGF0IGEgbWluaW11bS5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIERpc3RhbmNlIHdoZXJlIGZvcmNlIGlzIDAgKG9yIHZlcnkgY2xvc2UpIGluIHBpY29tZXRlcnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE1pbmltdW1Gb3JjZURpc3RhbmNlKCkge1xyXG5cclxuICAgIC8vIHRoaXMgaXMgdGhlIHNvbHV0aW9uIGZvciB0aGUgbWluIHBvdGVudGlhbFxyXG4gICAgcmV0dXJuIHRoaXMuc2lnbWEgKiBNYXRoLnBvdyggMiwgMSAvIDYgKTtcclxuICB9XHJcbn1cclxuXHJcbnN0YXRlc09mTWF0dGVyLnJlZ2lzdGVyKCAnTGpQb3RlbnRpYWxDYWxjdWxhdG9yJywgTGpQb3RlbnRpYWxDYWxjdWxhdG9yICk7XHJcbmV4cG9ydCBkZWZhdWx0IExqUG90ZW50aWFsQ2FsY3VsYXRvcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MsWUFBWSxNQUFNLG9CQUFvQjs7QUFFN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLHFCQUFxQixDQUFDO0VBRTFCO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLEtBQUssRUFBRUMsT0FBTyxFQUFHO0lBRTVCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUYsS0FBSyxHQUFHLENBQUMsRUFBRSw4QkFBK0IsQ0FBQztJQUU3RCxJQUFJLENBQUNBLEtBQUssR0FBR0EsS0FBSyxDQUFDLENBQUU7SUFDckIsSUFBSSxDQUFDQyxPQUFPLEdBQUdBLE9BQU8sQ0FBQyxDQUFDO0lBQ3hCLElBQUksQ0FBQ0UsZUFBZSxHQUFHLElBQUksQ0FBQ0YsT0FBTyxHQUFHSixZQUFZLENBQUNPLFdBQVcsQ0FBQyxDQUFFO0VBQ25FOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLFFBQVFBLENBQUEsRUFBRztJQUNULE9BQU8sSUFBSSxDQUFDTCxLQUFLO0VBQ25COztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VNLFFBQVFBLENBQUVOLEtBQUssRUFBRztJQUNoQixJQUFJLENBQUNBLEtBQUssR0FBR0EsS0FBSztFQUNwQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFTyxVQUFVQSxDQUFBLEVBQUc7SUFDWCxPQUFPLElBQUksQ0FBQ04sT0FBTztFQUNyQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFTyxVQUFVQSxDQUFFUCxPQUFPLEVBQUc7SUFDcEIsSUFBSSxDQUFDQSxPQUFPLEdBQUdBLE9BQU87SUFDdEIsSUFBSSxDQUFDRSxlQUFlLEdBQUcsSUFBSSxDQUFDRixPQUFPLEdBQUdKLFlBQVksQ0FBQ08sV0FBVztFQUNoRTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUssY0FBY0EsQ0FBRUMsUUFBUSxFQUFHO0lBQ3pCLE1BQU1DLGFBQWEsR0FBRyxJQUFJLENBQUNYLEtBQUssR0FBR1UsUUFBUTtJQUMzQyxPQUFTLENBQUMsR0FBRyxJQUFJLENBQUNQLGVBQWUsSUFBS1MsSUFBSSxDQUFDQyxHQUFHLENBQUVGLGFBQWEsRUFBRSxFQUFHLENBQUMsR0FBR0MsSUFBSSxDQUFDQyxHQUFHLENBQUVGLGFBQWEsRUFBRSxDQUFFLENBQUMsQ0FBRTtFQUN0Rzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUcsbUJBQW1CQSxDQUFFSixRQUFRLEVBQUc7SUFDOUIsT0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDUCxlQUFlLEdBQUdTLElBQUksQ0FBQ0MsR0FBRyxDQUFFLElBQUksQ0FBQ2IsS0FBSyxFQUFFLEVBQUcsQ0FBQyxHQUFHWSxJQUFJLENBQUNDLEdBQUcsQ0FBRUgsUUFBUSxFQUFFLEVBQUcsQ0FBQztFQUM1Rjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUssb0JBQW9CQSxDQUFFTCxRQUFRLEVBQUc7SUFDL0IsT0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDUCxlQUFlLEdBQUdTLElBQUksQ0FBQ0MsR0FBRyxDQUFFLElBQUksQ0FBQ2IsS0FBSyxFQUFFLENBQUUsQ0FBQyxHQUFHWSxJQUFJLENBQUNDLEdBQUcsQ0FBRUgsUUFBUSxFQUFFLENBQUUsQ0FBQztFQUMxRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sdUJBQXVCQSxDQUFBLEVBQUc7SUFFeEI7SUFDQSxPQUFPLElBQUksQ0FBQ2hCLEtBQUssR0FBR1ksSUFBSSxDQUFDQyxHQUFHLENBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFFLENBQUM7RUFDMUM7QUFDRjtBQUVBakIsY0FBYyxDQUFDcUIsUUFBUSxDQUFFLHVCQUF1QixFQUFFbkIscUJBQXNCLENBQUM7QUFDekUsZUFBZUEscUJBQXFCIn0=