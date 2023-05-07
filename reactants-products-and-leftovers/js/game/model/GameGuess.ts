// Copyright 2014-2023, University of Colorado Boulder

/**
 * A 'guess' is the user's answer to a game challenge, and it may or may not be correct.
 * We call it a 'guess' to distinguish the user's answer from the correct answer.
 * (And yes, 'guess' is semantically incorrect, since a guess is uninformed. Live with it :-)
 *
 * A guess is constructed based on a reaction and challenge type.
 * The guess will have the same number of reactants and products as the reaction,
 * and they are guaranteed to be in the same order.
 * Depending on the challenge type, values in the guess will be initialized to zero.
 *
 * A guess is correct if the reaction and guess have the same quantities of reactants,
 * products and leftovers.
 *
 * Run with the 'playAll' or 'playOne' query parameter to fill in the correct answer.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BoxType from '../../common/model/BoxType.js';
import Reaction from '../../common/model/Reaction.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import Substance from '../../common/model/Substance.js';

export default class GameGuess {

  public readonly reactants: Substance[];
  public readonly products: Substance[];
  public readonly leftovers: Substance[];

  public constructor( reaction: Reaction, interactiveBox: BoxType ) {

    assert && assert( interactiveBox === BoxType.BEFORE || interactiveBox === BoxType.AFTER );

    // Clone reactants, quantities are initialized to zero for 'Before' challenges.
    this.reactants = [];
    reaction.reactants.forEach( reactant => {
      this.reactants.push( ( interactiveBox === BoxType.BEFORE ) ? reactant.clone( 0 ) : reactant.clone() );
    } );

    // Clone products, quantities are initialized to zero for 'After' challenges.
    this.products = [];
    reaction.products.forEach( product => {
      this.products.push( ( interactiveBox === BoxType.AFTER ) ? product.clone( 0 ) : product.clone() );
    } );

    // Clone leftovers, quantities are initialized to zero for 'After' challenges.
    this.leftovers = [];
    reaction.leftovers.forEach( leftover => {
      this.leftovers.push( ( interactiveBox === BoxType.AFTER ) ? leftover.clone( 0 ) : leftover.clone() );
    } );

    assert && assert( this.reactants.length === reaction.reactants.length );
    assert && assert( this.products.length === reaction.products.length );
    assert && assert( this.leftovers.length === reaction.leftovers.length );
  }

  public reset(): void {
    this.reactants.forEach( reactant => reactant.reset() );
    this.products.forEach( product => product.reset() );
    this.leftovers.forEach( leftover => leftover.reset() );
  }
}

reactantsProductsAndLeftovers.register( 'GameGuess', GameGuess );