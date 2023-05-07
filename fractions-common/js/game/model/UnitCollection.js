// Copyright 2018-2020, University of Colorado Boulder

/**
 * Represents a sum of unit fractions, where the numerator (for each different denominator) is the quantity of
 * unit fractions.
 *
 * For example, if quantities = [ 1, 0, 4 ] it would be equivalent to:
 *   1/1 + 4/3
 * or as unit fractions:
 *   1/1 + 1/3 + 1/3 + 1/3 + 1/3
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import fractionsCommon from '../../fractionsCommon.js';

class UnitCollection {
  /**
   * @param {Array.<number>} quantities - quantities[ i ] represents the numerator n of ( n / ( i + 1 ) ).
   */
  constructor( quantities ) {

    // @public {Array.<number>}
    this.quantities = quantities;
  }

  /**
   * Returns the total fraction value of the full collection (all fractions added together).
   * @public
   *
   * @returns {Fraction}
   */
  get totalFraction() {
    return _.reduce( this.fractions, ( a, b ) => a.plus( b ), Fraction.ZERO ).reduced();
  }

  /**
   * Returns the value represented as a list of fractions (one for each denominator)
   * @public
   *
   * @returns {Array.<Fraction>}
   */
  get fractions() {
    return this.quantities.map( ( quantity, index ) => new Fraction( quantity, index + 1 ) ).filter( f => f.numerator !== 0 );
  }

  /**
   * Returns the collection as represented by unit fractions (1/x).
   * @public
   *
   * @returns {Array.<Fraction>}
   */
  get unitFractions() {
    return _.flatten( this.quantities.map( ( quantity, index ) => _.times( quantity, () => new Fraction( 1, index + 1 ) ) ) );
  }

  /**
   * Returns the total of all of the numerators.
   * @public
   *
   * @returns {number}
   */
  get totalQuantities() {
    return _.sum( this.quantities );
  }

  /**
   * Returns how many of the fractions's numerators are not divisible by the denominators (won't simplify to x/1).
   * @public
   *
   * @returns {number}
   */
  get nondivisibleCount() {
    return _.sum( this.quantities.map( ( quantity, index ) => quantity % ( index + 1 ) === 0 ? 0 : 1 ) );
  }

  /**
   * Returns an array of all denominators which have a non-zero numerator.
   * @public
   *
   * @returns {Array.<number>}
   */
  get nonzeroDenominators() {
    return _.range( 1, this.quantities.length + 1 ).filter( denominator => {
      return this.quantities[ denominator - 1 ] > 0;
    } );
  }

  /**
   * Determines how many "whole groups" are required to fit this unit collection. This is essentially the question of
   * how many pie-shaped containers do you need to fit all of the "unit fraction" pie slices in this collection.
   * This can be more than the "ceiling" of the fraction, e.g. 1/2 + 1/3 + 1/4 + 1/5 + 5/7 (~1.9976) which needs to be
   * split into 3 "whole groups" to fit the slices.
   * @public
   *
   * @param {number} [maximumCount] - The maximum number of groups that should be allowed at all. Don't consider any
   *                                  other options.
   * @param {number} [acceptableThreshold] - If provided, this will return the very first set of groups that only has
   *                                         this many groups or less (so we don't have to compute more than is
   *                                         necessary)
   * @returns {Array.<Array.<Fraction>>|null}
   */
  getCompactRequiredGroups( maximumCount = Number.POSITIVE_INFINITY, acceptableThreshold = Number.POSITIVE_INFINITY ) {
    let bestGroups = null;
    let bestCount = Number.POSITIVE_INFINITY;

    const fractions = this.unitFractions;

    const groups = [];
    const sums = [];

    function recur( i ) {
      // If our current groups meet our "abort threshold", bail immediately
      if ( bestGroups && bestCount <= acceptableThreshold ) {
        return;
      }

      if ( i === fractions.length ) {
        if ( groups.length < bestCount ) {
          bestCount = groups.length;
          bestGroups = groups.map( group => group.slice() );
        }
      }
      else {
        const fraction = fractions[ i ];

        // Adding to existing groups
        for ( let j = 0; j < groups.length; j++ ) {
          const oldSum = sums[ j ];
          const newSum = oldSum.plus( fraction );
          if ( !Fraction.ONE.isLessThan( newSum ) ) {
            sums[ j ] = newSum;
            groups[ j ].push( fraction );

            recur( i + 1 );

            groups[ j ].pop();
            sums[ j ] = oldSum;
          }
        }

        // Adding a new group
        if ( groups.length < maximumCount ) {
          groups.push( [ fraction ] );
          sums.push( fraction );

          recur( i + 1 );

          groups.pop();
          sums.pop();
        }
      }
    }

    recur( 0 );

    return bestGroups;
  }

  /**
   * Returns a value based on the lexicographic order of the two collections, used for sorting.
   * @public
   *
   * @param {UnitCollection} collection
   * @returns {number}
   */
  compare( collection ) {
    // We'll compare all of the indices, defaulting any not defined to 0
    const maxIndex = Math.max( this.quantities.length, collection.quantities.length ) - 1;

    for ( let i = 0; i <= maxIndex; i++ ) {
      const diff = ( this.quantities[ i ] || 0 ) - ( collection.quantities[ i ] || 0 );
      if ( diff ) {
        return diff;
      }
    }
    return 0;
  }

  /**
   * Returns whether the two collections have equal numbers of fractions.
   * @public
   *
   * @param {UnitCollection} collection
   * @returns {boolean}
   */
  equals( collection ) {
    return this.compare( collection ) === 0;
  }

  /**
   * Returns the result of applying the binary operation component-wise to this collection and the provided one.
   * @private
   *
   * @param {function} op - function( {number}, {number} ) => {number}
   * @param {UnitCollection} collection
   * @returns {UnitCollection}
   */
  binaryOperation( op, collection ) {
    return new UnitCollection( _.range( 0, Math.max( this.quantities.length, collection.quantities.length ) ).map( i => {
      return op( this.quantities[ i ] || 0, collection.quantities[ i ] || 0 );
    } ) );
  }

  /**
   * Returns the result of adding the two collections.
   * @public
   *
   * @param {UnitCollection} collection
   * @returns {UnitCollection}
   */
  plus( collection ) {
    return this.binaryOperation( ( a, b ) => a + b, collection );
  }

  /**
   * Returns the result of subtracting the two collections.
   * @public
   *
   * @param {UnitCollection} collection
   * @returns {UnitCollection}
   */
  minus( collection ) {
    return this.binaryOperation( ( a, b ) => a - b, collection );
  }

  /**
   * Returns whether this collection is effectively a superset of the given collection.
   * @public
   *
   * @param {UnitCollection} collection
   * @returns {boolean}
   */
  contains( collection ) {
    for ( let i = 0; i < collection.quantities.length; i++ ) {
      const ourCoefficient = this.quantities[ i ];
      const theirCoefficient = collection.quantities[ i ];

      if ( theirCoefficient && ( !ourCoefficient || theirCoefficient > ourCoefficient ) ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns a string representation useful for debugging.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return this.quantities.map( ( quantity, index ) => quantity ? `${quantity}/${index + 1}` : '' ).filter( _.identity ).join( ' + ' );
  }

  /**
   * Converts an array of fractions to the corresponding UnitCollection with the same sum.
   * @public
   *
   * @param {Array.<Fraction>} fractions
   * @returns {UnitCollection}
   */
  static fractionsToCollection( fractions ) {
    const quantities = [];
    fractions.forEach( fraction => {
      while ( quantities.length < fraction.denominator ) {
        quantities.push( 0 );
      }
      quantities[ fraction.denominator - 1 ] += fraction.numerator;
    } );
    return new UnitCollection( quantities );
  }
}

fractionsCommon.register( 'UnitCollection', UnitCollection );
export default UnitCollection;