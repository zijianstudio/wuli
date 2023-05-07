// Copyright 2017-2021, University of Colorado Boulder

/**
 * Enumeration for all states that the game can be in.  See https://github.com/phetsims/vegas/issues/74 about whether
 * this can/should be factored out.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../areaModelCommon.js';

const GameState = {
  // "check" button, editable
  FIRST_ATTEMPT: 'FIRST_ATTEMPT',
  SECOND_ATTEMPT: 'SECOND_ATTEMPT',

  // "next" button, happy face with +1 or +2 depending on score. NOT editable
  CORRECT_ANSWER: 'CORRECT_ANSWER',

  // "try again" button, sad face (editable?) - triggers next state on edit?
  WRONG_FIRST_ANSWER: 'WRONG_FIRST_ANSWER',

  // "show solution" button, sad face (editable?) - no trigger on edit?
  WRONG_SECOND_ANSWER: 'WRONG_SECOND_ANSWER',

  // "next" button, NOT editable, replaced with a solution
  SHOW_SOLUTION: 'SHOW_SOLUTION',

  LEVEL_COMPLETE: 'LEVEL_COMPLETE'
};

areaModelCommon.register( 'GameState', GameState );

// @public {Array.<GameState>} - All values the enumeration can take.
GameState.VALUES = [
  GameState.FIRST_ATTEMPT,
  GameState.SECOND_ATTEMPT,
  GameState.CORRECT_ANSWER,
  GameState.WRONG_FIRST_ANSWER,
  GameState.WRONG_SECOND_ANSWER,
  GameState.SHOW_SOLUTION,
  GameState.LEVEL_COMPLETE
];

// verify that enum is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( GameState ); }

export default GameState;