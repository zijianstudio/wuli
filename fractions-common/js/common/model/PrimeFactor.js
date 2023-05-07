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
  constructor( prime, order ) {
    assert && assert( Primes.isPrime( prime ) );
    assert && assert( typeof order === 'number' && order % 1 === 0 && order >= 1 );

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
    return Math.pow( this.prime, this.order );
  }

  /**
   * Returns a new copy.
   * @public
   *
   * @returns {PrimeFactor}
   */
  copy() {
    return new PrimeFactor( this.prime, this.order );
  }

  /**
   * Returns whether this prime factor is equal to the provided one.
   * @public
   *
   * @param {PrimeFactor} primeFactor
   * @returns {boolean}
   */
  equals( primeFactor ) {
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

fractionsCommon.register( 'PrimeFactor', PrimeFactor );
export default PrimeFactor;