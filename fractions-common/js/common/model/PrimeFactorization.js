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
  constructor( factors ) {
    assert && assert( Array.isArray( factors ) );
    assert && factors.forEach( ( factor, index ) => {
      assert( factor instanceof PrimeFactor, 'Should include only prime factors' );
      index > 0 && assert( factors[ index - 1 ].prime < factor.prime, 'Prime factors should be strictly ordered' );
    } );

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
    return _.reduce( this.factors.map( f => f.number ), ( a, b ) => a * b, 1 );
  }

  /**
   * Returns the total combined order of all factors.
   * @public
   *
   * @returns {number}
   */
  get totalOrder() {
    return _.sum( this.factors.map( f => f.order ) );
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

    ( function add( factors, index ) {
      if ( index === factors.length ) {
        results.push( new PrimeFactorization( arr.slice() ) );
      }
      else {
        const factor = factors[ index ];
        const order = factor.order;
        for ( let i = 0; i <= order; i++ ) {
          if ( i ) {
            arr.push( new PrimeFactor( factor.prime, i ) );
          }
          add( factors, index + 1 );
          if ( i ) {
            arr.pop();
          }
        }
      }
    } )( this.factors, 0 );

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
  binaryOperation( factorization, operation ) {
    const primes = _.uniq( [ ...this.factors, ...factorization.factors ].map( f => f.prime ) ).sort( ( a, b ) => a - b );
    const factors = [];
    primes.forEach( prime => {
      const order = operation( this.getOrder( prime ), factorization.getOrder( prime ) );
      if ( order ) {
        factors.push( new PrimeFactor( prime, order ) );
      }
    } );
    return new PrimeFactorization( factors );
  }

  /**
   * Returns the result of multiplying this factorization by another.
   * @public
   *
   * @param {PrimeFactorization} factorization
   * @returns {PrimeFactorization}
   */
  times( factorization ) {
    const result = this.binaryOperation( factorization, ( a, b ) => a + b );
    assert && assert( this.number * factorization.number === result.number );
    return result;
  }

  /**
   * Returns the result of dividing this factorization by another.
   * @public
   *
   * @param {PrimeFactorization} factorization
   * @returns {PrimeFactorization}
   */
  divided( factorization ) {
    const result = this.binaryOperation( factorization, ( a, b ) => {
      assert && assert( a >= b, 'Division of factorizations not defined' );
      return a - b;
    } );
    assert && assert( this.number / factorization.number === result.number );
    return result;
  }

  /**
   * Returns the GCD (greatest common divisor) of this factorization and another.
   * @public
   *
   * @param {PrimeFactorization} factorization
   * @returns {PrimeFactorization}
   */
  gcd( factorization ) {
    const result = this.binaryOperation( factorization, Math.min );
    assert && assert( Utils.gcd( this.number, factorization.number ) === result.number );
    return result;
  }

  /**
   * Returns the LCM (least common multiple) of this factorization and another.
   * @public
   *
   * @param {PrimeFactorization} factorization
   * @returns {PrimeFactorization}
   */
  lcm( factorization ) {
    const result = this.binaryOperation( factorization, Math.max );
    assert && assert( Utils.lcm( this.number, factorization.number ) === result.number );
    return result;
  }

  /**
   * Returns whether this factorization/number divides another (whether it is a multiple of us).
   * @public
   *
   * @param {PrimeFactorization} factorization
   * @returns {boolean}
   */
  divides( factorization ) {
    for ( let i = 0; i < this.factors.length; i++ ) {
      const factor = this.factors[ i ];
      if ( factor.order > factorization.getOrder( factor.prime ) ) {
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
  getOrder( prime ) {
    assert && assert( Primes.isPrime( prime ) );

    const factor = _.find( this.factors, factor => factor.prime === prime );
    return factor ? factor.order : 0;
  }

  /**
   * Returns a string representation, mostly for debugging.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return this.factors.join( '*' );
  }

  /**
   * Checks for equality between factorizations.
   * @public
   *
   * @param {PrimeFactorization} primeFactorization
   * @returns {boolean}
   */
  equals( primeFactorization ) {
    if ( this.factors.length !== primeFactorization.factors.length ) {
      return false;
    }
    for ( let i = 0; i < this.factors.length; i++ ) {
      if ( !this.factors[ i ].equals( primeFactorization.factors[ i ] ) ) {
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
  static factor( n ) {
    assert && assert( typeof n === 'number' && n % 1 === 0 && n >= 1 );

    if ( n === 1 ) {
      return new PrimeFactorization( [] );
    }

    // Find all primes that we'll check for. If we don't find a prime less than or equal to this, our number itself is
    // prime.
    const maxDivisor = Math.floor( Math.sqrt( n ) );
    Primes.updatePrimesUpTo( maxDivisor );

    const factors = [];

    const primes = Primes.primes;
    for ( let i = 0; i < primes.length; i++ ) {
      const prime = primes[ i ];
      // A prime that is a divisor (not equal to our number) would be less than the max divisor
      if ( prime > maxDivisor ) { break; }

      let order = 0;
      while ( n % prime === 0 ) {
        order++;
        n /= prime;
      }

      if ( order ) {
        factors.push( new PrimeFactor( prime, order ) );
      }

      if ( n === 1 ) {
        break;
      }
    }

    // If not fully reduced, then it must be a prime
    if ( n !== 1 ) {
      factors.push( new PrimeFactor( n, 1 ) );
    }

    return new PrimeFactorization( factors );
  }
}

fractionsCommon.register( 'PrimeFactorization', PrimeFactorization );

// @public {PrimeFactorization}
PrimeFactorization.ONE = new PrimeFactorization( [] );

export default PrimeFactorization;