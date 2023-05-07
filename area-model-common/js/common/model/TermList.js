// Copyright 2017-2021, University of Colorado Boulder

/**
 * An ordered list of terms.  Note that throughout the simulation, to represent a "no terms" we use null instead
 * of TermList([]).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../areaModelCommon.js';

class TermList {
  /**
   * @param {Array.<Term>} terms
   */
  constructor( terms ) {

    // @public {Array.<Term>}
    this.terms = terms;
  }

  /**
   * Addition of term lists.
   * @public
   *
   * @param {TermList} termList
   * @returns {TermList}
   */
  plus( termList ) {
    return new TermList( this.terms.concat( termList.terms ) );
  }

  /**
   * Multiplication of term lists.
   * @public
   *
   * @param {TermList} termList
   * @returns {TermList}
   */
  times( termList ) {
    return new TermList( _.flatten( this.terms.map( term => termList.terms.map( otherTerm => term.times( otherTerm ) ) ) ) );
  }

  /**
   * Returns a new TermList, (stable) sorted by the exponent.
   * @public
   *
   * @returns {TermList}
   */
  orderedByExponent() {
    return new TermList( _.sortBy( this.terms, term => -term.power ) );
  }

  /**
   * Returns whether any of the terms have a negative coefficient.
   * @public
   *
   * @returns {boolean}
   */
  hasNegativeTerm() {
    return _.some( this.terms, term => term.coefficient < 0 );
  }

  /**
   * Returns a string suitable for RichText
   * @public
   *
   * @returns {string}
   */
  toRichString() {
    return this.terms.map( ( term, index ) => term.toRichString( index > 0 ) ).join( '' );
  }

  /**
   * Equality for just whether the terms are the same (so a TermList can be compared to a Polynomial and be equal
   * despite being different types.)  Note that Polynomial orders the terms so this order-dependent check will still
   * work.
   * @public
   *
   * @param {TermList} termList
   */
  equals( termList ) {
    if ( this.terms.length !== termList.terms.length ) {
      return false;
    }

    // This uses a reverse search instead of a forward search for optimization--probably not important for Area Model,
    // but optimized in case it is moved to common code.
    for ( let i = this.terms.length - 1; i >= 0; i-- ) {
      if ( !this.terms[ i ].equals( termList.terms[ i ] ) ) {
        return false;
      }
    }

    return true;
  }
}

areaModelCommon.register( 'TermList', TermList );

export default TermList;