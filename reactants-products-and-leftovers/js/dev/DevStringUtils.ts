// Copyright 2014-2023, University of Colorado Boulder

/**
 * Collection of static string utilities used for development.
 * Some of this began its life as toString functions associated with various types.
 * But it's a decent chunk of code, and very development-specific, so it was consolidated here.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Reaction from '../common/model/Reaction.js';
import reactantsProductsAndLeftovers from '../reactantsProductsAndLeftovers.js';

const DevStringUtils = {

  /**
   * String representation of a reaction equation, with HTML stripped out.
   */
  equationString( reaction: Reaction ): string {
    let s = '';
    // reactants
    for ( let i = 0; i < reaction.reactants.length; i++ ) {
      if ( i !== 0 ) { s += '+ '; }
      s += ( `${reaction.reactants[ i ].coefficientProperty.value} ${reaction.reactants[ i ].symbol} ` );
    }
    // right arrow
    s += '\u2192 ';
    // products
    for ( let i = 0; i < reaction.products.length; i++ ) {
      if ( i !== 0 ) { s += '+ '; }
      s += ( `${reaction.products[ i ].coefficientProperty.value} ${reaction.products[ i ].symbol}` );
      if ( i < reaction.products.length - 1 ) {
        s += ' ';
      }
    }
    return s.replace( /<sub>/g, '' ).replace( /<\/sub>/g, '' );
  },

  /**
   * String representation of quantities for reactants, products and leftovers.
   * Example: 4,1 -> 1,2,2,0
   */
  quantitiesString( reaction: Reaction ): string {
    let s = '';
    let i = 0;
    // reactants
    for ( i = 0; i < reaction.reactants.length; i++ ) {
      if ( i !== 0 ) { s += ','; }
      s += reaction.reactants[ i ].quantityProperty.value;
    }
    // right arrow
    s += ' \u2192 ';
    // products
    for ( i = 0; i < reaction.products.length; i++ ) {
      if ( i !== 0 ) { s += ','; }
      s += reaction.products[ i ].quantityProperty.value;
    }
    // leftovers
    for ( i = 0; i < reaction.leftovers.length; i++ ) {
      s += ',';
      s += reaction.leftovers[ i ].quantityProperty.value;
    }
    return s;
  },

  /**
   * String representation of a reaction, including quantities.
   * Example: 2H2 + 1O2 -> 2H2O : 2,2 -> 2,0,1
   */
  reactionString( reaction: Reaction ): string {
    return `${DevStringUtils.equationString( reaction )} : ${DevStringUtils.quantitiesString( reaction )}`;
  }
};

reactantsProductsAndLeftovers.register( 'DevStringUtils', DevStringUtils );
export default DevStringUtils;