// Copyright 2017-2021, University of Colorado Boulder

/**
 * A game level
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import AreaChallenge from './AreaChallenge.js';
import GameState from './GameState.js';

class AreaLevel {
  /**
   * @param {number} number
   * @param {AreaChallengeType} type
   * @param {Property.<Color>} colorProperty
   * @param {Array.<AreaChallengeDescription>} challengeDescriptions
   */
  constructor( number, type, colorProperty, challengeDescriptions ) {

    // @public {number} - Will be the value 1 for "Level 1". Not using the 0-based values used in VEGAS, so sometimes
    // this value will need to be decremented when passed to VEGAS components.
    this.number = number;

    // @public {AreaChallengeType}
    this.type = type;

    // @public {Property.<Color>}
    this.colorProperty = colorProperty;

    // @public {Array.<AreaChallengeDescription>} - Descriptions for each type of level
    this.challengeDescriptions = challengeDescriptions;

    // @public {Property.<number>} - Ranges from 0 to AreaModelCommonConstants.PERFECT_SCORE
    //                               (since 2 points are rewarded for first attempt correct)
    this.scoreProperty = new NumberProperty( 0 );

    // @public {Array.<AreaChallenge>}
    this.challenges = this.generateChallenges();

    // @public {Property.<number>} - The index of the current challenge.
    this.challengeIndexProperty = new NumberProperty( 0 );

    // @public {Property.<AreaChallenge>}
    this.currentChallengeProperty = new DerivedProperty( [ this.challengeIndexProperty ], index => this.challenges[ index ] );

    // @public {boolean} - Whether the level is finished
    this.finished = false;
  }

  /**
   * Generates six challenges.
   * @private
   *
   * @returns {Array.<AreaChallenge>}
   */
  generateChallenges() {

    // Always include the first description as the first challenge
    let descriptions = [ this.challengeDescriptions[ 0 ] ];

    // Shuffle the rest of them in a random order
    descriptions = descriptions.concat( dotRandom.shuffle( descriptions.slice( 1 ) ) );

    // Then fill with random challenges if there are any more spaces
    while ( descriptions.length < AreaModelCommonConstants.NUM_CHALLENGES ) {
      descriptions.push( dotRandom.sample( this.challengeDescriptions ) );
    }

    // Generate based on the descriptions
    return descriptions.map( description => new AreaChallenge( description ) );
  }

  /**
   * Selects the level (resetting progress and generates a new challenge).  It is not the same as starting the level,
   * It's more of a "switch to" operation, since there will already be challenges. We want to delay the resetting of
   * the level until it's selected again (unless it was already finished).
   * @public
   */
  select() {
    if ( this.finished ) {
      this.finished = false;
      this.reset();
    }
  }

  /**
   * Marks the level as finished.  This means challenges will be regenerated if the level is selected again.
   * @public
   */
  finish() {
    this.finished = true;
  }

  /**
   * Move to the next challenge.
   * @public
   */
  next() {
    if ( this.challengeIndexProperty.value === AreaModelCommonConstants.NUM_CHALLENGES - 1 ) {
      this.finish();
      this.currentChallengeProperty.value.stateProperty.value = GameState.LEVEL_COMPLETE;
    }
    else {
      this.challengeIndexProperty.value += 1;
    }
  }

  /**
   * When we start over, we want to reset the score, but not immediately change the challenges yet (we'll wait until
   * we re-select this level).
   * @public
   *
   * See https://github.com/phetsims/area-model-common/issues/87 and
   * https://github.com/phetsims/area-model-common/issues/96.
   */
  startOver() {
    this.scoreProperty.reset();
    this.finish();
  }

  /**
   * Returns the model to its initial state.
   * @public
   */
  reset() {
    this.challenges = this.generateChallenges();

    this.scoreProperty.reset();
    this.challengeIndexProperty.reset();

    this.challengeIndexProperty.notifyListenersStatic();
  }
}

areaModelCommon.register( 'AreaLevel', AreaLevel );

export default AreaLevel;