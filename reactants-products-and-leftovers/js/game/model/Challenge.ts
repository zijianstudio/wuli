// Copyright 2014-2023, University of Colorado Boulder

/**
 * A challenge consists of a reaction (with specific before and after quantities), the user's 'guess',
 * and a specification of which part of the reaction (before or after) the user needs to guess.
 * This is essentially a data structure that keeps all of these associated things together.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import BoxType from '../../common/model/BoxType.js';
import Reaction from '../../common/model/Reaction.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import GameGuess from './GameGuess.js';

type SelfOptions = {
  moleculesVisible?: boolean; // are molecules visible when playing the challenge?
  numbersVisible?: boolean; // are numbers visible when playing the challenge?
};

export type ChallengeOptions = SelfOptions;

export default class Challenge {

  public readonly reaction: Reaction;
  public readonly interactiveBox: BoxType; // which box (Before or After) needs to be guessed
  public readonly moleculesVisible: boolean;
  public readonly numbersVisible: boolean;
  public readonly guess: GameGuess;
  public points: number; // points awarded for this challenge

  public constructor( reaction: Reaction, interactiveBox: BoxType, providedOptions?: ChallengeOptions ) {

    const options = optionize<ChallengeOptions, SelfOptions>()( {

      // SelfOptions
      moleculesVisible: true,
      numbersVisible: true
    }, providedOptions );

    this.reaction = reaction;
    this.interactiveBox = interactiveBox;
    this.moleculesVisible = options.moleculesVisible;
    this.numbersVisible = options.numbersVisible;
    this.guess = new GameGuess( reaction, interactiveBox );
    this.points = 0;
  }

  public reset(): void {
    this.guess.reset();
    this.points = 0;
  }

  // Does the user's guess match the correct answer?
  public isCorrect(): boolean {
    let i;
    let correct = true;
    // all reactants must be equal
    for ( i = 0; correct && i < this.reaction.reactants.length; i++ ) {
      correct = this.guess.reactants[ i ].equals( this.reaction.reactants[ i ] );
    }
    // all products must be equal
    for ( i = 0; correct && i < this.reaction.products.length; i++ ) {
      correct = this.guess.products[ i ].equals( this.reaction.products[ i ] );
    }
    // all leftovers must be equal
    for ( i = 0; correct && i < this.reaction.leftovers.length; i++ ) {
      correct = this.guess.leftovers[ i ].equals( this.reaction.leftovers[ i ] );
    }
    return correct;
  }

  // Reveals the correct answer by copying the answer's reaction quantities to the guess.
  public showAnswer(): void {
    let i;
    for ( i = 0; i < this.guess.reactants.length; i++ ) {
      this.guess.reactants[ i ].quantityProperty.value = this.reaction.reactants[ i ].quantityProperty.value;
    }
    for ( i = 0; i < this.guess.products.length; i++ ) {
      this.guess.products[ i ].quantityProperty.value = this.reaction.products[ i ].quantityProperty.value;
    }
    for ( i = 0; i < this.guess.leftovers.length; i++ ) {
      this.guess.leftovers[ i ].quantityProperty.value = this.reaction.leftovers[ i ].quantityProperty.value;
    }
  }
}

reactantsProductsAndLeftovers.register( 'Challenge', Challenge );