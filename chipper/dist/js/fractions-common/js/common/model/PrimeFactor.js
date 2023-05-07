// Copyright 2018-2020, University of Colorado Boulder

/**
 * Represents a power of a prime number.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import fractionsCommon from '../../fractionsCommon.js';
import Primes from './Primes.js';
class PrimeFactor {
  /**
   * @param {number} prime
   * @param {number} order
   */
  constructor(prime, order) {
    assert && assert(Primes.isPrime(prime));
    assert && assert(typeof order === 'number' && order % 1 === 0 && order >= 1);

    // @public {number}
    this.prime = prime;
    this.order = order;
  }

  /**
   * Returns the actual number that this prime factor represents.
   * @public
   *
   * @returns {number}
   */
  get number() {
    return Math.pow(this.prime, this.order);
  }

  /**
   * Returns a new copy.
   * @public
   *
   * @returns {PrimeFactor}
   */
  copy() {
    return new PrimeFactor(this.prime, this.order);
  }

  /**
   * Returns whether this prime factor is equal to the provided one.
   * @public
   *
   * @param {PrimeFactor} primeFactor
   * @returns {boolean}
   */
  equals(primeFactor) {
    return this.prime === primeFactor.prime && this.order === primeFactor.order;
  }

  /**
   * Returns a string representation, mostly for debugging.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `${this.prime}${this.order > 1 ? `^${this.order}` : ''}`;
  }
}
fractionsCommon.register('PrimeFactor', PrimeFactor);
export default PrimeFactor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcmFjdGlvbnNDb21tb24iLCJQcmltZXMiLCJQcmltZUZhY3RvciIsImNvbnN0cnVjdG9yIiwicHJpbWUiLCJvcmRlciIsImFzc2VydCIsImlzUHJpbWUiLCJudW1iZXIiLCJNYXRoIiwicG93IiwiY29weSIsImVxdWFscyIsInByaW1lRmFjdG9yIiwidG9TdHJpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlByaW1lRmFjdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBwb3dlciBvZiBhIHByaW1lIG51bWJlci5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuaW1wb3J0IFByaW1lcyBmcm9tICcuL1ByaW1lcy5qcyc7XHJcblxyXG5jbGFzcyBQcmltZUZhY3RvciB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByaW1lXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9yZGVyXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHByaW1lLCBvcmRlciApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIFByaW1lcy5pc1ByaW1lKCBwcmltZSApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygb3JkZXIgPT09ICdudW1iZXInICYmIG9yZGVyICUgMSA9PT0gMCAmJiBvcmRlciA+PSAxICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5wcmltZSA9IHByaW1lO1xyXG4gICAgdGhpcy5vcmRlciA9IG9yZGVyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYWN0dWFsIG51bWJlciB0aGF0IHRoaXMgcHJpbWUgZmFjdG9yIHJlcHJlc2VudHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXQgbnVtYmVyKCkge1xyXG4gICAgcmV0dXJuIE1hdGgucG93KCB0aGlzLnByaW1lLCB0aGlzLm9yZGVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IGNvcHkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1ByaW1lRmFjdG9yfVxyXG4gICAqL1xyXG4gIGNvcHkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFByaW1lRmFjdG9yKCB0aGlzLnByaW1lLCB0aGlzLm9yZGVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBwcmltZSBmYWN0b3IgaXMgZXF1YWwgdG8gdGhlIHByb3ZpZGVkIG9uZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ByaW1lRmFjdG9yfSBwcmltZUZhY3RvclxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGVxdWFscyggcHJpbWVGYWN0b3IgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wcmltZSA9PT0gcHJpbWVGYWN0b3IucHJpbWUgJiYgdGhpcy5vcmRlciA9PT0gcHJpbWVGYWN0b3Iub3JkZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uLCBtb3N0bHkgZm9yIGRlYnVnZ2luZy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHRvU3RyaW5nKCkge1xyXG4gICAgcmV0dXJuIGAke3RoaXMucHJpbWV9JHt0aGlzLm9yZGVyID4gMSA/IGBeJHt0aGlzLm9yZGVyfWAgOiAnJ31gO1xyXG4gIH1cclxufVxyXG5cclxuZnJhY3Rpb25zQ29tbW9uLnJlZ2lzdGVyKCAnUHJpbWVGYWN0b3InLCBQcmltZUZhY3RvciApO1xyXG5leHBvcnQgZGVmYXVsdCBQcmltZUZhY3RvcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxNQUFNLE1BQU0sYUFBYTtBQUVoQyxNQUFNQyxXQUFXLENBQUM7RUFDaEI7QUFDRjtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxLQUFLLEVBQUc7SUFDMUJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFTCxNQUFNLENBQUNNLE9BQU8sQ0FBRUgsS0FBTSxDQUFFLENBQUM7SUFDM0NFLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU9ELEtBQUssS0FBSyxRQUFRLElBQUlBLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJQSxLQUFLLElBQUksQ0FBRSxDQUFDOztJQUU5RTtJQUNBLElBQUksQ0FBQ0QsS0FBSyxHQUFHQSxLQUFLO0lBQ2xCLElBQUksQ0FBQ0MsS0FBSyxHQUFHQSxLQUFLO0VBQ3BCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLElBQUlHLE1BQU1BLENBQUEsRUFBRztJQUNYLE9BQU9DLElBQUksQ0FBQ0MsR0FBRyxDQUFFLElBQUksQ0FBQ04sS0FBSyxFQUFFLElBQUksQ0FBQ0MsS0FBTSxDQUFDO0VBQzNDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFTSxJQUFJQSxDQUFBLEVBQUc7SUFDTCxPQUFPLElBQUlULFdBQVcsQ0FBRSxJQUFJLENBQUNFLEtBQUssRUFBRSxJQUFJLENBQUNDLEtBQU0sQ0FBQztFQUNsRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFTyxNQUFNQSxDQUFFQyxXQUFXLEVBQUc7SUFDcEIsT0FBTyxJQUFJLENBQUNULEtBQUssS0FBS1MsV0FBVyxDQUFDVCxLQUFLLElBQUksSUFBSSxDQUFDQyxLQUFLLEtBQUtRLFdBQVcsQ0FBQ1IsS0FBSztFQUM3RTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVMsUUFBUUEsQ0FBQSxFQUFHO0lBQ1QsT0FBUSxHQUFFLElBQUksQ0FBQ1YsS0FBTSxHQUFFLElBQUksQ0FBQ0MsS0FBSyxHQUFHLENBQUMsR0FBSSxJQUFHLElBQUksQ0FBQ0EsS0FBTSxFQUFDLEdBQUcsRUFBRyxFQUFDO0VBQ2pFO0FBQ0Y7QUFFQUwsZUFBZSxDQUFDZSxRQUFRLENBQUUsYUFBYSxFQUFFYixXQUFZLENBQUM7QUFDdEQsZUFBZUEsV0FBVyJ9