// Copyright 2018-2021, University of Colorado Boulder

/**
 * Handles computation (and storage) of prime numbers.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import fractionsCommon from '../../fractionsCommon.js';

const Primes = {
  // @public {Array.<number>} - The currently computed primes
  primes: [ 2 ],

  // @public {number} - What number the current primes were computed up to (if a number n is <= to this value and
  // prime, it will be in Primes.primes).
  primesComputedUpTo: 2,

  /**
   * Makes sure that primes up to `n` are computed.
   * @public
   */
  updatePrimesUpTo( n ) {
    // Don't need to compute primes we have already computed
    if ( n <= Primes.primesComputedUpTo ) { return; }

    // If we are computing more primes, make sure we aren't just jumping up by +1. Compute some extras.
    n = Math.max( n, Primes.primesComputedUpTo * 2 );

    // We'll mutate the original value, but this was the original
    const originalN = n;

    // {Array.<boolean>} - primeFlags[ p ] will end up being true if p is a prime. initialized to true
    const primeFlags = [];

    // Initialize our flags
    for ( let i = 0; i <= n; i++ ) {
      primeFlags.push( i >= 2 );
    }

    // Run the main sieve procedure
    let currentPrime = 2;
    mainLoop: // eslint-disable-line no-labels
      while ( true ) { // eslint-disable-line no-constant-condition
        // Mark multiples of the current prime as composite
        for ( let i = 2 * currentPrime; i <= n; i += currentPrime ) {
          primeFlags[ i ] = false;
        }

        // Find the next prime
        for ( let i = currentPrime + 1; i <= n; i++ ) {
          if ( primeFlags[ i ] ) {
            currentPrime = i;
            continue mainLoop; // eslint-disable-line no-labels
          }
        }

        // If there was no next prime, then we are done
        break;
      }

    // Extract the primes into an array
    const primes = [];
    for ( let i = 2; i <= n; i++ ) {
      if ( primeFlags[ i ] ) {
        primes.push( i );
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
  isPrime( n ) {
    assert && assert( typeof n === 'number' );

    // All primes are integers >= 2.
    if ( !Number.isInteger( n ) || n < 2 ) { return false; }

    Primes.updatePrimesUpTo( n );
    return _.includes( Primes.primes, n );
  }
};

fractionsCommon.register( 'Primes', Primes );
export default Primes;