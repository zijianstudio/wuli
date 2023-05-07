// Copyright 2015-2020, University of Colorado Boulder

/**
 * Possible game states.
 */

import makeATen from '../../../makeATen.js';

const GameState = Object.freeze( {
  // Shows level selection buttons
  CHOOSING_LEVEL: 'CHOOSING_LEVEL',

  // In a level, challenge not completed
  PRESENTING_INTERACTIVE_CHALLENGE: 'PRESENTING_INTERACTIVE_CHALLENGE',

  // In a level, challenge completed (can move to next challenge)
  CORRECT_ANSWER: 'CORRECT_ANSWER'
} );

makeATen.register( 'GameState', GameState );

export default GameState;