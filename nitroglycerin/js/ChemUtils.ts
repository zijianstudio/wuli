// Copyright 2013-2023, University of Colorado Boulder

/**
 * Miscellaneous chemistry functions.
 */

import nitroglycerin from './nitroglycerin.js';
import Element from './Element.js';

const ChemUtils = {

  /**
   * Creates a symbol (HTML fragment) based on the list of atoms in the molecule.
   * The atoms must be specified in order of appearance in the symbol.
   * Examples:
   *    [C,C,H,H,H,H] becomes "C<sub>2</sub>H<sub>4</sub>"
   *    [H,H,O] becomes "H<sub>2</sub>O"
   */
  createSymbol: function( elements: Element[] ): string {
    return ChemUtils.toSubscript( ChemUtils.createSymbolWithoutSubscripts( elements ) );
  },

  /**
   * Creates a symbol (text) based on the list of atoms in the molecule.
   * The atoms must be specified in order of appearance in the symbol.
   * Examples:
   *    [C,C,H,H,H,H] becomes "C2H4"
   *    [H,H,O] becomes "H2O"
   */
  createSymbolWithoutSubscripts: function( elements: Element[] ): string {
    let result = '';
    let atomCount = 1;
    const length = elements.length;
    for ( let i = 0; i < length; i++ ) {
      if ( i === 0 ) {
        // first atom is treated differently
        result += elements[ i ].symbol;
      }
      else if ( elements[ i ] === elements[ i - 1 ] ) {
        // this atom is the same as the previous atom
        atomCount++;
      }
      else {
        // this atom is NOT the same
        if ( atomCount > 1 ) {
          // create a subscript
          result += atomCount;
        }
        atomCount = 1;
        result += elements[ i ].symbol;
      }
    }
    if ( atomCount > 1 ) {
      // create a subscript for the final atom
      result += atomCount;
    }
    return result;
  },

  /**
   * Return an integer that can be used for sorting atom symbols alphabetically. Lower values will be returned for
   * symbols that should go first. Two-letter symbols will come after a one-letter symbol with the same first
   * character (Br after B). See http://en.wikipedia.org/wiki/Hill_system, for without carbon
   */
  nonCarbonHillSortValue: function( element: Element ): number {
    // TODO: if it's a performance issue, we should put these in Element itself, https://github.com/phetsims/nitroglycerin/issues/14
    // yes, will totally fail if our Unicode code point of the 2nd character is >1000. Agile coding? We like to live on the edge
    let value = 1000 * element.symbol.charCodeAt( 0 );
    if ( element.symbol.length > 1 ) {
      value += element.symbol.charCodeAt( 1 );
    }
    return value;
  },

  /**
   * Returns an integer that can be used for sorting atom symbols for the Hill system when the molecule contains
   * carbon. Lowest value is first. See http://en.wikipedia.org/wiki/Hill_system
   */
  carbonHillSortValue: function( element: Element ): number {
    // TODO: if it's a performance issue, we should put these in Element itself, https://github.com/phetsims/nitroglycerin/issues/14
    if ( element.isCarbon() ) {
      return 0;
    }
    else if ( element.isHydrogen() ) {
      return 1;
    }
    else {
      return ChemUtils.nonCarbonHillSortValue( element );
    }
  },

  /**
   * Handles HTML subscript formatting for molecule symbols.
   * All numbers in a string are assumed to be part of a subscript, and will be enclosed in a <sub> tag.
   * For example, 'C2H4' becomes 'C<sub>2</sub>H<sub>4</sub>'.
   * @param inputString - the input plaintext string
   * @returns - the HTML fragment
   */
  toSubscript: function( inputString: string ): string {
    let outString = '';
    let sub = false; // are we in a <sub> tag?
    const isDigit = ( c: string ) => ( c >= '0' && c <= '9' );
    for ( let i = 0; i < inputString.length; i++ ) {
      const c = inputString.charAt( i );
      if ( !sub && isDigit( c ) ) {

        // start the subscript tag when a digit is found
        outString += '<sub>';
        sub = true;
      }
      else if ( sub && !isDigit( c ) ) {

        // end the subscript tag when a non-digit is found
        outString += '</sub>';
        sub = false;
      }
      outString += c;
    }

    // end the subscript tag if inputString ends with a digit
    if ( sub ) {
      outString += '</sub>';
      sub = false;
    }
    return outString;
  },

  /**
   * @param elements - a collection of elements in a molecule
   * @returns The molecular formula of the molecule in the Hill system. Returned as an HTML fragment.
   *          See http://en.wikipedia.org/wiki/Hill_system for more information.
   */
  hillOrderedSymbol: function( elements: Element[] ): string {
    const containsCarbon = _.some( elements, element => element.isCarbon() );
    const sortFunction = containsCarbon ?
                         ChemUtils.carbonHillSortValue :  // carbon first, then hydrogen, then others alphabetically
                         ChemUtils.nonCarbonHillSortValue; // compare alphabetically since there is no carbon
    const sortedElements = _.sortBy( elements, sortFunction );
    return ChemUtils.createSymbol( sortedElements );
  }
};

nitroglycerin.register( 'ChemUtils', ChemUtils );
export default ChemUtils;