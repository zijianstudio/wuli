// Copyright 2018-2020, University of Colorado Boulder

/**
 * Searches for all combinations of a sum of fractions that sum to a given value, e.g. given the fraction 9/4 and the
 * coefficients 1,2,3,4,5,6, it can find all of the values a,b,c,d,e,f that satisfy
 * a/1 + b/2 + c/3 + d/4 + e/5 + f/6 === X/Y. It is also possible to constrain the search with other options, for
 * efficiency's sake.
 *
 * There is some up-front computation that will figure out an effective "search plan", i.e. what order should we search
 * for values of a,b,c,d,e,f, and how can we make the search space smaller? For instance, the value of e/5 in this case
 * can be highly constrained. The rest of the LHS (a/1 + b/2 + c/3 + d/4 + f/6) will reduce to a fraction whose
 * denominator is NOT a multiple of 5, so if (X/Y - e/5)'s denominator is a multiple of 5, it can be excluded. In this
 * case, it excludes 4/5ths of the values of e.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import PrimeFactor from '../../common/model/PrimeFactor.js';
import PrimeFactorization from '../../common/model/PrimeFactorization.js';
import fractionsCommon from '../../fractionsCommon.js';
import UnitCollection from './UnitCollection.js';

class CollectionFinder {
  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    options = merge( {
      // {Array.<PrimeFactorization>} - The available denominators that can be used.
      denominators: _.range( 1, 9 ).map( PrimeFactorization.factor )
    }, options );

    const denominators = options.denominators;

    const lcm = _.reduce( denominators, ( a, b ) => a.lcm( b ), PrimeFactorization.ONE );
    const inverses = denominators.map( f => lcm.divided( f ) );

    // {Array.<PrimeFactorization>}
    const constraintDivisors = _.flatten( lcm.factors.map( factor => {
      return _.range( 1, factor.order + 1 ).map( order => {
        return new PrimeFactorization( [ new PrimeFactor( factor.prime, order ) ] );
      } );
    } ) );

    // {Array.<Array.<PrimeFactorization>>} - constraint index => list of denominators included
    const constraintDenominators = constraintDivisors.map( divisor => denominators.filter( ( denominator, index ) => {
      return !divisor.divides( inverses[ index ] );
    } ) );

    // {Array.<Entry>}
    const entries = [];

    function filterUncomputedDenominators( divisorDenominators ) {
      return divisorDenominators.filter( denominator => !_.some( entries, entry => entry.denominator === denominator ) );
    }

    function findMinConstraintIndex() {
      let bestIndex = -1;
      let bestDivisor = null;
      let bestNumUncomputedDenominators = Number.POSITIVE_INFINITY;
      for ( let i = 0; i < constraintDivisors.length; i++ ) {
        const divisor = constraintDivisors[ i ];
        const divisorDenominators = constraintDenominators[ i ];
        const uncomputedDenominators = filterUncomputedDenominators( divisorDenominators );
        if ( uncomputedDenominators.length < bestNumUncomputedDenominators ||
             ( uncomputedDenominators.length === bestNumUncomputedDenominators && divisor.number > bestDivisor.number ) ) {
          bestIndex = i;
          bestDivisor = divisor;
          bestNumUncomputedDenominators = uncomputedDenominators.length;
        }
      }
      return bestIndex;
    }

    while ( constraintDivisors.length ) {
      const constraintIndex = findMinConstraintIndex();
      const divisorDenominators = constraintDenominators[ constraintIndex ];

      filterUncomputedDenominators( divisorDenominators ).forEach( uncomputedDenominator => {
        entries.push( new Entry( uncomputedDenominator, lcm.divided( uncomputedDenominator ) ) );
      } );
      for ( let i = 0; i < constraintDivisors.length; i++ ) {
        const divisor = constraintDivisors[ i ];
        const divisorDenominators = constraintDenominators[ i ];
        const uncomputedDenominators = filterUncomputedDenominators( divisorDenominators );
        if ( uncomputedDenominators.length === 0 ) {
          const denominatorIndices = divisorDenominators.map( d => _.findIndex( entries, entry => entry.denominator === d ) );
          const constraint = new Constraint( divisor, divisorDenominators, lcm, denominatorIndices );
          entries[ entries.length - 1 ].constraints.push( constraint );
        }
      }

      constraintDivisors.splice( constraintIndex, 1 );
      constraintDenominators.splice( constraintIndex, 1 );
    }
    filterUncomputedDenominators( denominators ).forEach( uncomputedDenominator => {
      entries.push( new Entry( uncomputedDenominator, lcm.divided( uncomputedDenominator ) ) );
    } );

    // @private {Array.<Entry>}
    this.entries = entries;

    // @private {PrimeFactorization}
    this.lcm = lcm;

    // @private {number}
    this.maxDenominatorNumber = Math.max( ...denominators.map( d => d.number ) );

    // @private {Array.<number>} - Maps "internal index" (based on entries) into the UnitCollection array index.
    this.collectionIndexMap = this.entries.map( entry => entry.denominator.number - 1 );
  }

  /**
   * Returns an array of all UnitCollections that match the given parameters (using this finder's denominators).
   * This is basically a list of all ways a given fraction (the input) can be partitioned into different sums of
   * fractions (with this finder's denominators) with numerators matching the option constraints.
   * @public
   *
   * @param {Fraction} fraction
   * @param {Object} [options]
   * @returns {Array.<UnitCollection>}
   */
  search( fraction, options ) {
    const {
      // {number} - The maximum possible quantity for each individual denominator (so e.g. if maxQuantity:4, the
      // finder will never report 5 halves).
      maxQuantity = Number.POSITIVE_INFINITY,

      // {number} - The maximum possible quantity total including all denominators (so e.g. if maxTotalQuantity:4,
      // the finder will never report 2 halves and 3 thirds).
      maxTotalQuantity = Number.POSITIVE_INFINITY,

      // {number} - The maximum total number of non-zero coefficients allowed. For example if maxNonzeroCount:2,
      // the finder will never report three non-zero numerators for different denominators.
      maxNonzeroCount = Number.POSITIVE_INFINITY
    } = options || {};

    const self = this;

    assert && assert( typeof maxQuantity === 'number' && maxQuantity >= 1 );
    assert && assert( typeof maxTotalQuantity === 'number' && maxTotalQuantity >= 1 );

    const r = fraction.numerator * this.lcm.number / fraction.denominator;

    const entries = this.entries;
    const coefficients = [];
    const results = [];

    // If our lcm is not a multiple of the fraction's denominator, we will have no possible solutions.
    if ( r % 1 !== 0 ) {
      return results;
    }

    ( function recur( index, remainder, totalCount, nonzeroCount ) {
      const entry = entries[ index ];
      const maxCoefficient = Math.min( maxQuantity, Math.floor( remainder / entry.inverseNumber ), maxTotalQuantity - totalCount );
      if ( index === entries.length - 1 ) {
        // If we have an exact solution, then maxCoefficient should be our sole solution due to the division
        const coefficient = maxCoefficient;
        const subRemainder = remainder - coefficient * entry.inverseNumber;
        if ( subRemainder === 0 ) {
          // We have a solution!

          coefficients.push( coefficient );
          const collection = self.unitCollectionFromCoefficients( coefficients );
          coefficients.pop();

          assert && assert( collection.totalFraction.reduced().equals( fraction.reduced() ) );
          assert && collection.quantities.forEach( quantity => assert( quantity <= maxQuantity ) );
          assert && assert( _.sum( collection.quantities ) <= maxTotalQuantity );

          results.push( collection );
        }
      }
      else {
        for ( let coefficient = 0; coefficient <= maxCoefficient; coefficient++ ) {
          const subRemainder = remainder - coefficient * entry.inverseNumber;
          assert && assert( subRemainder >= 0 );

          coefficients.push( coefficient );

          let constraintsSatisfied = true;
          for ( let i = 0; i < entry.constraints.length; i++ ) {
            const constraint = entry.constraints[ i ];
            if ( !constraint.satisfies( r, coefficients ) ) {
              constraintsSatisfied = false;
              break;
            }
          }
          const nextNonzeroCount = nonzeroCount + ( coefficient > 0 ? 1 : 0 );

          if ( constraintsSatisfied && nextNonzeroCount <= maxNonzeroCount ) {
            recur( index + 1, subRemainder, totalCount + coefficient, nextNonzeroCount );
          }

          coefficients.pop();
        }
      }
    } )( 0, r, 0, 0 );

    return results;
  }

  /**
   * Like search() above, but with "simple" logic (and slower) for unit test verification.
   * @public
   *
   * @param {Fraction} fraction
   * @param {Object} [options]
   * @returns {Array.<UnitCollection>}
   */
  bruteForceSearch( fraction, options ) {
    const {
      // {number} - The maximum possible quantity for each individual denominator (so e.g. if maxQuantity:4, the
      // finder will never report 5 halves).
      maxQuantity = Number.POSITIVE_INFINITY,

      // {number} - The maximum possible quantity total including all denominators (so e.g. if maxTotalQuantity:4,
      // the finder will never report 2 halves and 3 thirds).
      maxTotalQuantity = Number.POSITIVE_INFINITY
    } = options || {};

    const self = this;

    assert && assert( typeof maxQuantity === 'number' && maxQuantity >= 1 );
    assert && assert( typeof maxTotalQuantity === 'number' && maxTotalQuantity >= 1 );

    const entries = this.entries;
    const results = [];
    const coefficients = [];

    /**
     * @param {number} index - Index into our denominators
     * @param {Fraction} remainder
     * @param {number} totalCount
     */
    ( function recur( index, remainder, totalCount ) {
      const denominator = entries[ index ].denominatorNumber;

      for ( let coefficient = 0; coefficient <= maxQuantity; coefficient++ ) {
        const subRemainder = remainder.minus( new Fraction( coefficient, denominator ) );
        if ( subRemainder.value < 0 || coefficient + totalCount > maxTotalQuantity ) {
          break;
        }

        coefficients.push( coefficient );
        if ( index === entries.length - 1 ) {
          if ( subRemainder.numerator === 0 ) {
            // We have a solution!
            const collection = self.unitCollectionFromCoefficients( coefficients );

            assert && assert( collection.totalFraction.reduced().equals( fraction.reduced() ) );
            assert && collection.quantities.forEach( quantity => assert( quantity <= maxQuantity ) );
            assert && assert( _.sum( collection.quantities ) <= maxTotalQuantity );

            results.push( collection );
          }
        }
        else {
          recur( index + 1, subRemainder, totalCount + coefficient );
        }
        coefficients.pop();
      }
    } )( 0, fraction, 0 );

    return results;
  }

  /**
   * Permutes and pads coefficients to create a UnitCollection.
   * @private
   *
   * @param {Array.<number>} coefficients - In the same order as our entries, e.g. coefficients[ i ] is the
   *                                        coefficient for entries[ i ].
   * @returns {UnitCollection}
   */
  unitCollectionFromCoefficients( coefficients ) {
    // {Array.<number>} - Construct some permuted coefficients in the "correct" order
    const permutedCoefficients = [];

    // Zero-pad, since we may have some denominators "missing"
    while ( permutedCoefficients.length < this.maxDenominatorNumber ) {
      permutedCoefficients.push( 0 );
    }

    // Fill in the coefficients we do have.
    for ( let i = 0; i < coefficients.length; i++ ) {
      permutedCoefficients[ this.collectionIndexMap[ i ] ] = coefficients[ i ];
    }

    return new UnitCollection( permutedCoefficients );
  }
}

class Entry {
  /**
   * @param {PrimeFactorization} denominator
   * @param {PrimeFactorization} inverse
   * @param {Array.<Constraint>} constraints
   */
  constructor( denominator, inverse, constraints = [] ) {

    // @public {PrimeFactorization}
    this.denominator = denominator;

    // @public {PrimeFactorization}
    this.inverse = inverse;

    // @public {Array.<Constraint>}
    this.constraints = constraints;

    // @public {number}
    this.denominatorNumber = denominator.number;

    // @public {number}
    this.inverseNumber = inverse.number;
  }

  /**
   * Returns a string form of the entry, for debugging.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `${this.denominator}${this.constraints.map( c => `\n  ${c}` )}`;
  }
}

class Constraint {
  /**
   * @param {PrimeFactorization} divisor
   * @param {Array.<PrimeFactorization>} denominators
   * @param {PrimeFactorization} lcm
   * @param {Array.<number>} denominatorIndices
   */
  constructor( divisor, denominators, lcm, denominatorIndices ) {
    assert && assert( divisor instanceof PrimeFactorization );
    assert && assert( Array.isArray( denominators ) );
    assert && denominators.forEach( d => assert( d instanceof PrimeFactorization ) );
    assert && assert( lcm instanceof PrimeFactorization );
    assert && assert( Array.isArray( denominatorIndices ) );
    assert && denominatorIndices.forEach( i => assert( typeof i === 'number' ) );
    assert && assert( denominators.length === denominatorIndices.length );

    // @public {PrimeFactorization}
    this.divisor = divisor;

    // @public {Array.<PrimeFactorization>}
    this.denominators = denominators;

    // @private {PrimeFactorization}
    this.lcm = lcm;

    // @private {Array.<number>}
    this.denominatorIndices = denominatorIndices;

    // @private {number}
    this.divisorNumber = divisor.number;

    // @private {Array.<number>}
    this.denominatorCoefficients = denominators.map( d => lcm.divided( d ).number );
  }

  /**
   * Returns whether this constraint is satisfied by the given total (r = lcm * fraction) and the coefficients.
   * @public
   *
   * @param {number} r
   * @param {Array.<number>} coefficients
   * @returns {boolean}
   */
  satisfies( r, coefficients ) {
    assert && assert( typeof r === 'number' );
    assert && assert( Array.isArray( coefficients ) );

    let sum = 0;
    for ( let i = 0; i < this.denominatorCoefficients.length; i++ ) {
      sum += coefficients[ this.denominatorIndices[ i ] ] * this.denominatorCoefficients[ i ];
    }
    return ( r % this.divisorNumber ) === ( sum % this.divisorNumber );
  }

  /**
   * Returns a string form of the entry, for debugging.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `r = f(${this.denominators.join( ',' )}) (mod ${this.divisor})`;
  }
}

fractionsCommon.register( 'CollectionFinder', CollectionFinder );
export default CollectionFinder;