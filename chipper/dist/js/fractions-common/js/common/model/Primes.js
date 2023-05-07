// Copyright 2018-2021, University of Colorado Boulder

/**
 * Handles computation (and storage) of prime numbers.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import fractionsCommon from '../../fractionsCommon.js';
const Primes = {
  // @public {Array.<number>} - The currently computed primes
  primes: [2],
  // @public {number} - What number the current primes were computed up to (if a number n is <= to this value and
  // prime, it will be in Primes.primes).
  primesComputedUpTo: 2,
  /**
   * Makes sure that primes up to `n` are computed.
   * @public
   */
  updatePrimesUpTo(n) {
    // Don't need to compute primes we have already computed
    if (n <= Primes.primesComputedUpTo) {
      return;
    }

    // If we are computing more primes, make sure we aren't just jumping up by +1. Compute some extras.
    n = Math.max(n, Primes.primesComputedUpTo * 2);

    // We'll mutate the original value, but this was the original
    const originalN = n;

    // {Array.<boolean>} - primeFlags[ p ] will end up being true if p is a prime. initialized to true
    const primeFlags = [];

    // Initialize our flags
    for (let i = 0; i <= n; i++) {
      primeFlags.push(i >= 2);
    }

    // Run the main sieve procedure
    let currentPrime = 2;
    mainLoop:
    // eslint-disable-line no-labels
    while (true) {
      // eslint-disable-line no-constant-condition
      // Mark multiples of the current prime as composite
      for (let i = 2 * currentPrime; i <= n; i += currentPrime) {
        primeFlags[i] = false;
      }

      // Find the next prime
      for (let i = currentPrime + 1; i <= n; i++) {
        if (primeFlags[i]) {
          currentPrime = i;
          continue mainLoop; // eslint-disable-line no-labels
        }
      }

      // If there was no next prime, then we are done
      break;
    }

    // Extract the primes into an array
    const primes = [];
    for (let i = 2; i <= n; i++) {
      if (primeFlags[i]) {
        primes.push(i);
      }
    }
    Primes.primes = primes;
    Primes.primesComputedUpTo = originalN;
  },
  /**
   * Returns whether a number is prime.
   * @public
   *
   * @param {number} n
   * @returns {boolean}
   */
  isPrime(n) {
    assert && assert(typeof n === 'number');

    // All primes are integers >= 2.
    if (!Number.isInteger(n) || n < 2) {
      return false;
    }
    Primes.updatePrimesUpTo(n);
    return _.includes(Primes.primes, n);
  }
};
fractionsCommon.register('Primes', Primes);
export default Primes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcmFjdGlvbnNDb21tb24iLCJQcmltZXMiLCJwcmltZXMiLCJwcmltZXNDb21wdXRlZFVwVG8iLCJ1cGRhdGVQcmltZXNVcFRvIiwibiIsIk1hdGgiLCJtYXgiLCJvcmlnaW5hbE4iLCJwcmltZUZsYWdzIiwiaSIsInB1c2giLCJjdXJyZW50UHJpbWUiLCJtYWluTG9vcCIsImlzUHJpbWUiLCJhc3NlcnQiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJfIiwiaW5jbHVkZXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlByaW1lcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBIYW5kbGVzIGNvbXB1dGF0aW9uIChhbmQgc3RvcmFnZSkgb2YgcHJpbWUgbnVtYmVycy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuXHJcbmNvbnN0IFByaW1lcyA9IHtcclxuICAvLyBAcHVibGljIHtBcnJheS48bnVtYmVyPn0gLSBUaGUgY3VycmVudGx5IGNvbXB1dGVkIHByaW1lc1xyXG4gIHByaW1lczogWyAyIF0sXHJcblxyXG4gIC8vIEBwdWJsaWMge251bWJlcn0gLSBXaGF0IG51bWJlciB0aGUgY3VycmVudCBwcmltZXMgd2VyZSBjb21wdXRlZCB1cCB0byAoaWYgYSBudW1iZXIgbiBpcyA8PSB0byB0aGlzIHZhbHVlIGFuZFxyXG4gIC8vIHByaW1lLCBpdCB3aWxsIGJlIGluIFByaW1lcy5wcmltZXMpLlxyXG4gIHByaW1lc0NvbXB1dGVkVXBUbzogMixcclxuXHJcbiAgLyoqXHJcbiAgICogTWFrZXMgc3VyZSB0aGF0IHByaW1lcyB1cCB0byBgbmAgYXJlIGNvbXB1dGVkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB1cGRhdGVQcmltZXNVcFRvKCBuICkge1xyXG4gICAgLy8gRG9uJ3QgbmVlZCB0byBjb21wdXRlIHByaW1lcyB3ZSBoYXZlIGFscmVhZHkgY29tcHV0ZWRcclxuICAgIGlmICggbiA8PSBQcmltZXMucHJpbWVzQ29tcHV0ZWRVcFRvICkgeyByZXR1cm47IH1cclxuXHJcbiAgICAvLyBJZiB3ZSBhcmUgY29tcHV0aW5nIG1vcmUgcHJpbWVzLCBtYWtlIHN1cmUgd2UgYXJlbid0IGp1c3QganVtcGluZyB1cCBieSArMS4gQ29tcHV0ZSBzb21lIGV4dHJhcy5cclxuICAgIG4gPSBNYXRoLm1heCggbiwgUHJpbWVzLnByaW1lc0NvbXB1dGVkVXBUbyAqIDIgKTtcclxuXHJcbiAgICAvLyBXZSdsbCBtdXRhdGUgdGhlIG9yaWdpbmFsIHZhbHVlLCBidXQgdGhpcyB3YXMgdGhlIG9yaWdpbmFsXHJcbiAgICBjb25zdCBvcmlnaW5hbE4gPSBuO1xyXG5cclxuICAgIC8vIHtBcnJheS48Ym9vbGVhbj59IC0gcHJpbWVGbGFnc1sgcCBdIHdpbGwgZW5kIHVwIGJlaW5nIHRydWUgaWYgcCBpcyBhIHByaW1lLiBpbml0aWFsaXplZCB0byB0cnVlXHJcbiAgICBjb25zdCBwcmltZUZsYWdzID0gW107XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSBvdXIgZmxhZ3NcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8PSBuOyBpKysgKSB7XHJcbiAgICAgIHByaW1lRmxhZ3MucHVzaCggaSA+PSAyICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUnVuIHRoZSBtYWluIHNpZXZlIHByb2NlZHVyZVxyXG4gICAgbGV0IGN1cnJlbnRQcmltZSA9IDI7XHJcbiAgICBtYWluTG9vcDogLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1sYWJlbHNcclxuICAgICAgd2hpbGUgKCB0cnVlICkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxyXG4gICAgICAgIC8vIE1hcmsgbXVsdGlwbGVzIG9mIHRoZSBjdXJyZW50IHByaW1lIGFzIGNvbXBvc2l0ZVxyXG4gICAgICAgIGZvciAoIGxldCBpID0gMiAqIGN1cnJlbnRQcmltZTsgaSA8PSBuOyBpICs9IGN1cnJlbnRQcmltZSApIHtcclxuICAgICAgICAgIHByaW1lRmxhZ3NbIGkgXSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRmluZCB0aGUgbmV4dCBwcmltZVxyXG4gICAgICAgIGZvciAoIGxldCBpID0gY3VycmVudFByaW1lICsgMTsgaSA8PSBuOyBpKysgKSB7XHJcbiAgICAgICAgICBpZiAoIHByaW1lRmxhZ3NbIGkgXSApIHtcclxuICAgICAgICAgICAgY3VycmVudFByaW1lID0gaTtcclxuICAgICAgICAgICAgY29udGludWUgbWFpbkxvb3A7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbGFiZWxzXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiB0aGVyZSB3YXMgbm8gbmV4dCBwcmltZSwgdGhlbiB3ZSBhcmUgZG9uZVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgLy8gRXh0cmFjdCB0aGUgcHJpbWVzIGludG8gYW4gYXJyYXlcclxuICAgIGNvbnN0IHByaW1lcyA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSAyOyBpIDw9IG47IGkrKyApIHtcclxuICAgICAgaWYgKCBwcmltZUZsYWdzWyBpIF0gKSB7XHJcbiAgICAgICAgcHJpbWVzLnB1c2goIGkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgUHJpbWVzLnByaW1lcyA9IHByaW1lcztcclxuICAgIFByaW1lcy5wcmltZXNDb21wdXRlZFVwVG8gPSBvcmlnaW5hbE47XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIGEgbnVtYmVyIGlzIHByaW1lLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNQcmltZSggbiApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBuID09PSAnbnVtYmVyJyApO1xyXG5cclxuICAgIC8vIEFsbCBwcmltZXMgYXJlIGludGVnZXJzID49IDIuXHJcbiAgICBpZiAoICFOdW1iZXIuaXNJbnRlZ2VyKCBuICkgfHwgbiA8IDIgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgIFByaW1lcy51cGRhdGVQcmltZXNVcFRvKCBuICk7XHJcbiAgICByZXR1cm4gXy5pbmNsdWRlcyggUHJpbWVzLnByaW1lcywgbiApO1xyXG4gIH1cclxufTtcclxuXHJcbmZyYWN0aW9uc0NvbW1vbi5yZWdpc3RlciggJ1ByaW1lcycsIFByaW1lcyApO1xyXG5leHBvcnQgZGVmYXVsdCBQcmltZXM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSwwQkFBMEI7QUFFdEQsTUFBTUMsTUFBTSxHQUFHO0VBQ2I7RUFDQUMsTUFBTSxFQUFFLENBQUUsQ0FBQyxDQUFFO0VBRWI7RUFDQTtFQUNBQyxrQkFBa0IsRUFBRSxDQUFDO0VBRXJCO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLGdCQUFnQkEsQ0FBRUMsQ0FBQyxFQUFHO0lBQ3BCO0lBQ0EsSUFBS0EsQ0FBQyxJQUFJSixNQUFNLENBQUNFLGtCQUFrQixFQUFHO01BQUU7SUFBUTs7SUFFaEQ7SUFDQUUsQ0FBQyxHQUFHQyxJQUFJLENBQUNDLEdBQUcsQ0FBRUYsQ0FBQyxFQUFFSixNQUFNLENBQUNFLGtCQUFrQixHQUFHLENBQUUsQ0FBQzs7SUFFaEQ7SUFDQSxNQUFNSyxTQUFTLEdBQUdILENBQUM7O0lBRW5CO0lBQ0EsTUFBTUksVUFBVSxHQUFHLEVBQUU7O0lBRXJCO0lBQ0EsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLElBQUlMLENBQUMsRUFBRUssQ0FBQyxFQUFFLEVBQUc7TUFDN0JELFVBQVUsQ0FBQ0UsSUFBSSxDQUFFRCxDQUFDLElBQUksQ0FBRSxDQUFDO0lBQzNCOztJQUVBO0lBQ0EsSUFBSUUsWUFBWSxHQUFHLENBQUM7SUFDcEJDLFFBQVE7SUFBRTtJQUNSLE9BQVEsSUFBSSxFQUFHO01BQUU7TUFDZjtNQUNBLEtBQU0sSUFBSUgsQ0FBQyxHQUFHLENBQUMsR0FBR0UsWUFBWSxFQUFFRixDQUFDLElBQUlMLENBQUMsRUFBRUssQ0FBQyxJQUFJRSxZQUFZLEVBQUc7UUFDMURILFVBQVUsQ0FBRUMsQ0FBQyxDQUFFLEdBQUcsS0FBSztNQUN6Qjs7TUFFQTtNQUNBLEtBQU0sSUFBSUEsQ0FBQyxHQUFHRSxZQUFZLEdBQUcsQ0FBQyxFQUFFRixDQUFDLElBQUlMLENBQUMsRUFBRUssQ0FBQyxFQUFFLEVBQUc7UUFDNUMsSUFBS0QsVUFBVSxDQUFFQyxDQUFDLENBQUUsRUFBRztVQUNyQkUsWUFBWSxHQUFHRixDQUFDO1VBQ2hCLFNBQVNHLFFBQVEsQ0FBQyxDQUFDO1FBQ3JCO01BQ0Y7O01BRUE7TUFDQTtJQUNGOztJQUVGO0lBQ0EsTUFBTVgsTUFBTSxHQUFHLEVBQUU7SUFDakIsS0FBTSxJQUFJUSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLElBQUlMLENBQUMsRUFBRUssQ0FBQyxFQUFFLEVBQUc7TUFDN0IsSUFBS0QsVUFBVSxDQUFFQyxDQUFDLENBQUUsRUFBRztRQUNyQlIsTUFBTSxDQUFDUyxJQUFJLENBQUVELENBQUUsQ0FBQztNQUNsQjtJQUNGO0lBQ0FULE1BQU0sQ0FBQ0MsTUFBTSxHQUFHQSxNQUFNO0lBQ3RCRCxNQUFNLENBQUNFLGtCQUFrQixHQUFHSyxTQUFTO0VBQ3ZDLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFTSxPQUFPQSxDQUFFVCxDQUFDLEVBQUc7SUFDWFUsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT1YsQ0FBQyxLQUFLLFFBQVMsQ0FBQzs7SUFFekM7SUFDQSxJQUFLLENBQUNXLE1BQU0sQ0FBQ0MsU0FBUyxDQUFFWixDQUFFLENBQUMsSUFBSUEsQ0FBQyxHQUFHLENBQUMsRUFBRztNQUFFLE9BQU8sS0FBSztJQUFFO0lBRXZESixNQUFNLENBQUNHLGdCQUFnQixDQUFFQyxDQUFFLENBQUM7SUFDNUIsT0FBT2EsQ0FBQyxDQUFDQyxRQUFRLENBQUVsQixNQUFNLENBQUNDLE1BQU0sRUFBRUcsQ0FBRSxDQUFDO0VBQ3ZDO0FBQ0YsQ0FBQztBQUVETCxlQUFlLENBQUNvQixRQUFRLENBQUUsUUFBUSxFQUFFbkIsTUFBTyxDQUFDO0FBQzVDLGVBQWVBLE1BQU0ifQ==