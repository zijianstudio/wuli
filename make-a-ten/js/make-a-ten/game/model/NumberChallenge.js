// Copyright 2015-2020, University of Colorado Boulder

/**
 * Represents a challenge, that is presented to the user during the MakeATen game.
 * Each challenge has two terms. The values of which depends on the level of challenge
 *
 * @author Sharfudeen Ashraf
 */

import makeATen from '../../../makeATen.js';

class NumberChallenge {
  /**
   * @param {number} leftTerm
   * @param {number} rightTerm
   */
  constructor( leftTerm, rightTerm ) {
    // @public {number} - The left-hand term for addition
    this.leftTerm = leftTerm;

    // @public {number} - The right-hand term for addition
    this.rightTerm = rightTerm;

    // This object is immutable
    Object.freeze( this );
  }
}

makeATen.register( 'NumberChallenge', NumberChallenge );

export default NumberChallenge;