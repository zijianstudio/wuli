// Copyright 2018-2020, University of Colorado Boulder

/**
 * Represents a prime factorization of an integer.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import fractionsCommon from '../../fractionsCommon.js';
import PrimeFactor from './PrimeFactor.js';
import Primes from './Primes.js';
class PrimeFactorization {
  /**
   * @param {Array.<PrimeFactor>} factors
   */
  constructor(factors) {
    assert && assert(Array.isArray(factors));
    assert && factors.forEach((factor, index) => {
      assert(factor instanceof PrimeFactor, 'Should include only prime factors');
      index > 0 && assert(factors[index - 1].prime < factor.prime, 'Prime factors should be strictly ordered');
    });

    // @public {Array.<PrimeFactor>}
    this.factors = factors;
  }

  /**
   * Returns the actual number that this prime factorization represents.
   * @public
   *
   * @returns {number}
   */
  get number() {
    return _.reduce(this.factors.map(f => f.number), (a, b) => a * b, 1);
  }

  /**
   * Returns the total combined order of all factors.
   * @public
   *
   * @returns {number}
   */
  get totalOrder() {
    return _.sum(this.factors.map(f => f.order));
  }

  /**
   * Returns a list of all factorizations that divide this one.
   * @public
   *
   * @returns {Array.<PrimeFactorization>}
   */
  get divisors() {
    const results = [];
    const arr = [];
    (function add(factors, index) {
      if (index === factors.length) {
        results.push(new PrimeFactorization(arr.slice()));
      } else {
        const factor = factors[index];
        const order = factor.order;
        for (let i = 0; i <= order; i++) {
          if (i) {
            arr.push(new PrimeFactor(factor.prime, i));
          }
          add(factors, index + 1);
          if (i) {
            arr.pop();
          }
        }
      }
    })(this.factors, 0);
    return results;
  }

  /**
   * Helper function for providing binary operations that operate on f( aOrder, bOrder ) => cOrder.
   * @private
   *
   * @param {PrimeFactorization} primeFactorization
   * @param {function} operation - Binary operation on factor orders
   * @returns {PrimeFactorization}
   */
  binaryOperation(factorization, operation) {
    const primes = _.uniq([...this.factors, ...factorization.factors].map(f => f.prime)).sort((a, b) => a - b);
    const factors = [];
    primes.forEach(prime => {
      const order = operation(this.getOrder(prime), factorization.getOrder(prime));
      if (order) {
        factors.push(new PrimeFactor(prime, order));
      }
    });
    return new PrimeFactorization(factors);
  }

  /**
   * Returns the result of multiplying this factorization by another.
   * @public
   *
   * @param {PrimeFactorization} factorization
   * @returns {PrimeFactorization}
   */
  times(factorization) {
    const result = this.binaryOperation(factorization, (a, b) => a + b);
    assert && assert(this.number * factorization.number === result.number);
    return result;
  }

  /**
   * Returns the result of dividing this factorization by another.
   * @public
   *
   * @param {PrimeFactorization} factorization
   * @returns {PrimeFactorization}
   */
  divided(factorization) {
    const result = this.binaryOperation(factorization, (a, b) => {
      assert && assert(a >= b, 'Division of factorizations not defined');
      return a - b;
    });
    assert && assert(this.number / factorization.number === result.number);
    return result;
  }

  /**
   * Returns the GCD (greatest common divisor) of this factorization and another.
   * @public
   *
   * @param {PrimeFactorization} factorization
   * @returns {PrimeFactorization}
   */
  gcd(factorization) {
    const result = this.binaryOperation(factorization, Math.min);
    assert && assert(Utils.gcd(this.number, factorization.number) === result.number);
    return result;
  }

  /**
   * Returns the LCM (least common multiple) of this factorization and another.
   * @public
   *
   * @param {PrimeFactorization} factorization
   * @returns {PrimeFactorization}
   */
  lcm(factorization) {
    const result = this.binaryOperation(factorization, Math.max);
    assert && assert(Utils.lcm(this.number, factorization.number) === result.number);
    return result;
  }

  /**
   * Returns whether this factorization/number divides another (whether it is a multiple of us).
   * @public
   *
   * @param {PrimeFactorization} factorization
   * @returns {boolean}
   */
  divides(factorization) {
    for (let i = 0; i < this.factors.length; i++) {
      const factor = this.factors[i];
      if (factor.order > factorization.getOrder(factor.prime)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns the order of a given prime in this factorization.
   * @public
   *
   * @param {number} prime
   * @returns {number}
   */
  getOrder(prime) {
    assert && assert(Primes.isPrime(prime));
    const factor = _.find(this.factors, factor => factor.prime === prime);
    return factor ? factor.order : 0;
  }

  /**
   * Returns a string representation, mostly for debugging.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return this.factors.join('*');
  }

  /**
   * Checks for equality between factorizations.
   * @public
   *
   * @param {PrimeFactorization} primeFactorization
   * @returns {boolean}
   */
  equals(primeFactorization) {
    if (this.factors.length !== primeFactorization.factors.length) {
      return false;
    }
    for (let i = 0; i < this.factors.length; i++) {
      if (!this.factors[i].equals(primeFactorization.factors[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns the prime factorization of a number.
   * @public
   *
   * @param {number} n
   * @returns {PrimeFactorization}
   */
  static factor(n) {
    assert && assert(typeof n === 'number' && n % 1 === 0 && n >= 1);
    if (n === 1) {
      return new PrimeFactorization([]);
    }

    // Find all primes that we'll check for. If we don't find a prime less than or equal to this, our number itself is
    // prime.
    const maxDivisor = Math.floor(Math.sqrt(n));
    Primes.updatePrimesUpTo(maxDivisor);
    const factors = [];
    const primes = Primes.primes;
    for (let i = 0; i < primes.length; i++) {
      const prime = primes[i];
      // A prime that is a divisor (not equal to our number) would be less than the max divisor
      if (prime > maxDivisor) {
        break;
      }
      let order = 0;
      while (n % prime === 0) {
        order++;
        n /= prime;
      }
      if (order) {
        factors.push(new PrimeFactor(prime, order));
      }
      if (n === 1) {
        break;
      }
    }

    // If not fully reduced, then it must be a prime
    if (n !== 1) {
      factors.push(new PrimeFactor(n, 1));
    }
    return new PrimeFactorization(factors);
  }
}
fractionsCommon.register('PrimeFactorization', PrimeFactorization);

// @public {PrimeFactorization}
PrimeFactorization.ONE = new PrimeFactorization([]);
export default PrimeFactorization;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsImZyYWN0aW9uc0NvbW1vbiIsIlByaW1lRmFjdG9yIiwiUHJpbWVzIiwiUHJpbWVGYWN0b3JpemF0aW9uIiwiY29uc3RydWN0b3IiLCJmYWN0b3JzIiwiYXNzZXJ0IiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsImZhY3RvciIsImluZGV4IiwicHJpbWUiLCJudW1iZXIiLCJfIiwicmVkdWNlIiwibWFwIiwiZiIsImEiLCJiIiwidG90YWxPcmRlciIsInN1bSIsIm9yZGVyIiwiZGl2aXNvcnMiLCJyZXN1bHRzIiwiYXJyIiwiYWRkIiwibGVuZ3RoIiwicHVzaCIsInNsaWNlIiwiaSIsInBvcCIsImJpbmFyeU9wZXJhdGlvbiIsImZhY3Rvcml6YXRpb24iLCJvcGVyYXRpb24iLCJwcmltZXMiLCJ1bmlxIiwic29ydCIsImdldE9yZGVyIiwidGltZXMiLCJyZXN1bHQiLCJkaXZpZGVkIiwiZ2NkIiwiTWF0aCIsIm1pbiIsImxjbSIsIm1heCIsImRpdmlkZXMiLCJpc1ByaW1lIiwiZmluZCIsInRvU3RyaW5nIiwiam9pbiIsImVxdWFscyIsInByaW1lRmFjdG9yaXphdGlvbiIsIm4iLCJtYXhEaXZpc29yIiwiZmxvb3IiLCJzcXJ0IiwidXBkYXRlUHJpbWVzVXBUbyIsInJlZ2lzdGVyIiwiT05FIl0sInNvdXJjZXMiOlsiUHJpbWVGYWN0b3JpemF0aW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBwcmltZSBmYWN0b3JpemF0aW9uIG9mIGFuIGludGVnZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0NvbW1vbiBmcm9tICcuLi8uLi9mcmFjdGlvbnNDb21tb24uanMnO1xyXG5pbXBvcnQgUHJpbWVGYWN0b3IgZnJvbSAnLi9QcmltZUZhY3Rvci5qcyc7XHJcbmltcG9ydCBQcmltZXMgZnJvbSAnLi9QcmltZXMuanMnO1xyXG5cclxuY2xhc3MgUHJpbWVGYWN0b3JpemF0aW9uIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0FycmF5LjxQcmltZUZhY3Rvcj59IGZhY3RvcnNcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZmFjdG9ycyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGZhY3RvcnMgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGZhY3RvcnMuZm9yRWFjaCggKCBmYWN0b3IsIGluZGV4ICkgPT4ge1xyXG4gICAgICBhc3NlcnQoIGZhY3RvciBpbnN0YW5jZW9mIFByaW1lRmFjdG9yLCAnU2hvdWxkIGluY2x1ZGUgb25seSBwcmltZSBmYWN0b3JzJyApO1xyXG4gICAgICBpbmRleCA+IDAgJiYgYXNzZXJ0KCBmYWN0b3JzWyBpbmRleCAtIDEgXS5wcmltZSA8IGZhY3Rvci5wcmltZSwgJ1ByaW1lIGZhY3RvcnMgc2hvdWxkIGJlIHN0cmljdGx5IG9yZGVyZWQnICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFByaW1lRmFjdG9yPn1cclxuICAgIHRoaXMuZmFjdG9ycyA9IGZhY3RvcnM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBhY3R1YWwgbnVtYmVyIHRoYXQgdGhpcyBwcmltZSBmYWN0b3JpemF0aW9uIHJlcHJlc2VudHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXQgbnVtYmVyKCkge1xyXG4gICAgcmV0dXJuIF8ucmVkdWNlKCB0aGlzLmZhY3RvcnMubWFwKCBmID0+IGYubnVtYmVyICksICggYSwgYiApID0+IGEgKiBiLCAxICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB0b3RhbCBjb21iaW5lZCBvcmRlciBvZiBhbGwgZmFjdG9ycy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldCB0b3RhbE9yZGVyKCkge1xyXG4gICAgcmV0dXJuIF8uc3VtKCB0aGlzLmZhY3RvcnMubWFwKCBmID0+IGYub3JkZXIgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGxpc3Qgb2YgYWxsIGZhY3Rvcml6YXRpb25zIHRoYXQgZGl2aWRlIHRoaXMgb25lLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48UHJpbWVGYWN0b3JpemF0aW9uPn1cclxuICAgKi9cclxuICBnZXQgZGl2aXNvcnMoKSB7XHJcbiAgICBjb25zdCByZXN1bHRzID0gW107XHJcbiAgICBjb25zdCBhcnIgPSBbXTtcclxuXHJcbiAgICAoIGZ1bmN0aW9uIGFkZCggZmFjdG9ycywgaW5kZXggKSB7XHJcbiAgICAgIGlmICggaW5kZXggPT09IGZhY3RvcnMubGVuZ3RoICkge1xyXG4gICAgICAgIHJlc3VsdHMucHVzaCggbmV3IFByaW1lRmFjdG9yaXphdGlvbiggYXJyLnNsaWNlKCkgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGZhY3RvciA9IGZhY3RvcnNbIGluZGV4IF07XHJcbiAgICAgICAgY29uc3Qgb3JkZXIgPSBmYWN0b3Iub3JkZXI7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDw9IG9yZGVyOyBpKysgKSB7XHJcbiAgICAgICAgICBpZiAoIGkgKSB7XHJcbiAgICAgICAgICAgIGFyci5wdXNoKCBuZXcgUHJpbWVGYWN0b3IoIGZhY3Rvci5wcmltZSwgaSApICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBhZGQoIGZhY3RvcnMsIGluZGV4ICsgMSApO1xyXG4gICAgICAgICAgaWYgKCBpICkge1xyXG4gICAgICAgICAgICBhcnIucG9wKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICkoIHRoaXMuZmFjdG9ycywgMCApO1xyXG5cclxuICAgIHJldHVybiByZXN1bHRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGVscGVyIGZ1bmN0aW9uIGZvciBwcm92aWRpbmcgYmluYXJ5IG9wZXJhdGlvbnMgdGhhdCBvcGVyYXRlIG9uIGYoIGFPcmRlciwgYk9yZGVyICkgPT4gY09yZGVyLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ByaW1lRmFjdG9yaXphdGlvbn0gcHJpbWVGYWN0b3JpemF0aW9uXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3BlcmF0aW9uIC0gQmluYXJ5IG9wZXJhdGlvbiBvbiBmYWN0b3Igb3JkZXJzXHJcbiAgICogQHJldHVybnMge1ByaW1lRmFjdG9yaXphdGlvbn1cclxuICAgKi9cclxuICBiaW5hcnlPcGVyYXRpb24oIGZhY3Rvcml6YXRpb24sIG9wZXJhdGlvbiApIHtcclxuICAgIGNvbnN0IHByaW1lcyA9IF8udW5pcSggWyAuLi50aGlzLmZhY3RvcnMsIC4uLmZhY3Rvcml6YXRpb24uZmFjdG9ycyBdLm1hcCggZiA9PiBmLnByaW1lICkgKS5zb3J0KCAoIGEsIGIgKSA9PiBhIC0gYiApO1xyXG4gICAgY29uc3QgZmFjdG9ycyA9IFtdO1xyXG4gICAgcHJpbWVzLmZvckVhY2goIHByaW1lID0+IHtcclxuICAgICAgY29uc3Qgb3JkZXIgPSBvcGVyYXRpb24oIHRoaXMuZ2V0T3JkZXIoIHByaW1lICksIGZhY3Rvcml6YXRpb24uZ2V0T3JkZXIoIHByaW1lICkgKTtcclxuICAgICAgaWYgKCBvcmRlciApIHtcclxuICAgICAgICBmYWN0b3JzLnB1c2goIG5ldyBQcmltZUZhY3RvciggcHJpbWUsIG9yZGVyICkgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIG5ldyBQcmltZUZhY3Rvcml6YXRpb24oIGZhY3RvcnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHJlc3VsdCBvZiBtdWx0aXBseWluZyB0aGlzIGZhY3Rvcml6YXRpb24gYnkgYW5vdGhlci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ByaW1lRmFjdG9yaXphdGlvbn0gZmFjdG9yaXphdGlvblxyXG4gICAqIEByZXR1cm5zIHtQcmltZUZhY3Rvcml6YXRpb259XHJcbiAgICovXHJcbiAgdGltZXMoIGZhY3Rvcml6YXRpb24gKSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmJpbmFyeU9wZXJhdGlvbiggZmFjdG9yaXphdGlvbiwgKCBhLCBiICkgPT4gYSArIGIgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubnVtYmVyICogZmFjdG9yaXphdGlvbi5udW1iZXIgPT09IHJlc3VsdC5udW1iZXIgKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSByZXN1bHQgb2YgZGl2aWRpbmcgdGhpcyBmYWN0b3JpemF0aW9uIGJ5IGFub3RoZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQcmltZUZhY3Rvcml6YXRpb259IGZhY3Rvcml6YXRpb25cclxuICAgKiBAcmV0dXJucyB7UHJpbWVGYWN0b3JpemF0aW9ufVxyXG4gICAqL1xyXG4gIGRpdmlkZWQoIGZhY3Rvcml6YXRpb24gKSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmJpbmFyeU9wZXJhdGlvbiggZmFjdG9yaXphdGlvbiwgKCBhLCBiICkgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhID49IGIsICdEaXZpc2lvbiBvZiBmYWN0b3JpemF0aW9ucyBub3QgZGVmaW5lZCcgKTtcclxuICAgICAgcmV0dXJuIGEgLSBiO1xyXG4gICAgfSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5udW1iZXIgLyBmYWN0b3JpemF0aW9uLm51bWJlciA9PT0gcmVzdWx0Lm51bWJlciApO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIEdDRCAoZ3JlYXRlc3QgY29tbW9uIGRpdmlzb3IpIG9mIHRoaXMgZmFjdG9yaXphdGlvbiBhbmQgYW5vdGhlci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ByaW1lRmFjdG9yaXphdGlvbn0gZmFjdG9yaXphdGlvblxyXG4gICAqIEByZXR1cm5zIHtQcmltZUZhY3Rvcml6YXRpb259XHJcbiAgICovXHJcbiAgZ2NkKCBmYWN0b3JpemF0aW9uICkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5iaW5hcnlPcGVyYXRpb24oIGZhY3Rvcml6YXRpb24sIE1hdGgubWluICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBVdGlscy5nY2QoIHRoaXMubnVtYmVyLCBmYWN0b3JpemF0aW9uLm51bWJlciApID09PSByZXN1bHQubnVtYmVyICk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgTENNIChsZWFzdCBjb21tb24gbXVsdGlwbGUpIG9mIHRoaXMgZmFjdG9yaXphdGlvbiBhbmQgYW5vdGhlci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ByaW1lRmFjdG9yaXphdGlvbn0gZmFjdG9yaXphdGlvblxyXG4gICAqIEByZXR1cm5zIHtQcmltZUZhY3Rvcml6YXRpb259XHJcbiAgICovXHJcbiAgbGNtKCBmYWN0b3JpemF0aW9uICkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5iaW5hcnlPcGVyYXRpb24oIGZhY3Rvcml6YXRpb24sIE1hdGgubWF4ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBVdGlscy5sY20oIHRoaXMubnVtYmVyLCBmYWN0b3JpemF0aW9uLm51bWJlciApID09PSByZXN1bHQubnVtYmVyICk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgZmFjdG9yaXphdGlvbi9udW1iZXIgZGl2aWRlcyBhbm90aGVyICh3aGV0aGVyIGl0IGlzIGEgbXVsdGlwbGUgb2YgdXMpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UHJpbWVGYWN0b3JpemF0aW9ufSBmYWN0b3JpemF0aW9uXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgZGl2aWRlcyggZmFjdG9yaXphdGlvbiApIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZmFjdG9ycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgZmFjdG9yID0gdGhpcy5mYWN0b3JzWyBpIF07XHJcbiAgICAgIGlmICggZmFjdG9yLm9yZGVyID4gZmFjdG9yaXphdGlvbi5nZXRPcmRlciggZmFjdG9yLnByaW1lICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG9yZGVyIG9mIGEgZ2l2ZW4gcHJpbWUgaW4gdGhpcyBmYWN0b3JpemF0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwcmltZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0T3JkZXIoIHByaW1lICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggUHJpbWVzLmlzUHJpbWUoIHByaW1lICkgKTtcclxuXHJcbiAgICBjb25zdCBmYWN0b3IgPSBfLmZpbmQoIHRoaXMuZmFjdG9ycywgZmFjdG9yID0+IGZhY3Rvci5wcmltZSA9PT0gcHJpbWUgKTtcclxuICAgIHJldHVybiBmYWN0b3IgPyBmYWN0b3Iub3JkZXIgOiAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiwgbW9zdGx5IGZvciBkZWJ1Z2dpbmcuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIHJldHVybiB0aGlzLmZhY3RvcnMuam9pbiggJyonICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVja3MgZm9yIGVxdWFsaXR5IGJldHdlZW4gZmFjdG9yaXphdGlvbnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQcmltZUZhY3Rvcml6YXRpb259IHByaW1lRmFjdG9yaXphdGlvblxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGVxdWFscyggcHJpbWVGYWN0b3JpemF0aW9uICkge1xyXG4gICAgaWYgKCB0aGlzLmZhY3RvcnMubGVuZ3RoICE9PSBwcmltZUZhY3Rvcml6YXRpb24uZmFjdG9ycy5sZW5ndGggKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZmFjdG9ycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCAhdGhpcy5mYWN0b3JzWyBpIF0uZXF1YWxzKCBwcmltZUZhY3Rvcml6YXRpb24uZmFjdG9yc1sgaSBdICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHByaW1lIGZhY3Rvcml6YXRpb24gb2YgYSBudW1iZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5cclxuICAgKiBAcmV0dXJucyB7UHJpbWVGYWN0b3JpemF0aW9ufVxyXG4gICAqL1xyXG4gIHN0YXRpYyBmYWN0b3IoIG4gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbiA9PT0gJ251bWJlcicgJiYgbiAlIDEgPT09IDAgJiYgbiA+PSAxICk7XHJcblxyXG4gICAgaWYgKCBuID09PSAxICkge1xyXG4gICAgICByZXR1cm4gbmV3IFByaW1lRmFjdG9yaXphdGlvbiggW10gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGaW5kIGFsbCBwcmltZXMgdGhhdCB3ZSdsbCBjaGVjayBmb3IuIElmIHdlIGRvbid0IGZpbmQgYSBwcmltZSBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhpcywgb3VyIG51bWJlciBpdHNlbGYgaXNcclxuICAgIC8vIHByaW1lLlxyXG4gICAgY29uc3QgbWF4RGl2aXNvciA9IE1hdGguZmxvb3IoIE1hdGguc3FydCggbiApICk7XHJcbiAgICBQcmltZXMudXBkYXRlUHJpbWVzVXBUbyggbWF4RGl2aXNvciApO1xyXG5cclxuICAgIGNvbnN0IGZhY3RvcnMgPSBbXTtcclxuXHJcbiAgICBjb25zdCBwcmltZXMgPSBQcmltZXMucHJpbWVzO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcHJpbWVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBwcmltZSA9IHByaW1lc1sgaSBdO1xyXG4gICAgICAvLyBBIHByaW1lIHRoYXQgaXMgYSBkaXZpc29yIChub3QgZXF1YWwgdG8gb3VyIG51bWJlcikgd291bGQgYmUgbGVzcyB0aGFuIHRoZSBtYXggZGl2aXNvclxyXG4gICAgICBpZiAoIHByaW1lID4gbWF4RGl2aXNvciApIHsgYnJlYWs7IH1cclxuXHJcbiAgICAgIGxldCBvcmRlciA9IDA7XHJcbiAgICAgIHdoaWxlICggbiAlIHByaW1lID09PSAwICkge1xyXG4gICAgICAgIG9yZGVyKys7XHJcbiAgICAgICAgbiAvPSBwcmltZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBvcmRlciApIHtcclxuICAgICAgICBmYWN0b3JzLnB1c2goIG5ldyBQcmltZUZhY3RvciggcHJpbWUsIG9yZGVyICkgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBuID09PSAxICkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgbm90IGZ1bGx5IHJlZHVjZWQsIHRoZW4gaXQgbXVzdCBiZSBhIHByaW1lXHJcbiAgICBpZiAoIG4gIT09IDEgKSB7XHJcbiAgICAgIGZhY3RvcnMucHVzaCggbmV3IFByaW1lRmFjdG9yKCBuLCAxICkgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFByaW1lRmFjdG9yaXphdGlvbiggZmFjdG9ycyApO1xyXG4gIH1cclxufVxyXG5cclxuZnJhY3Rpb25zQ29tbW9uLnJlZ2lzdGVyKCAnUHJpbWVGYWN0b3JpemF0aW9uJywgUHJpbWVGYWN0b3JpemF0aW9uICk7XHJcblxyXG4vLyBAcHVibGljIHtQcmltZUZhY3Rvcml6YXRpb259XHJcblByaW1lRmFjdG9yaXphdGlvbi5PTkUgPSBuZXcgUHJpbWVGYWN0b3JpemF0aW9uKCBbXSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUHJpbWVGYWN0b3JpemF0aW9uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUMxQyxPQUFPQyxNQUFNLE1BQU0sYUFBYTtBQUVoQyxNQUFNQyxrQkFBa0IsQ0FBQztFQUN2QjtBQUNGO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsT0FBTyxFQUFHO0lBQ3JCQyxNQUFNLElBQUlBLE1BQU0s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