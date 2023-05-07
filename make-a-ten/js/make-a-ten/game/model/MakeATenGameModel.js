// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model for the game screen of Make a Ten.
 *
 * @author Sharfudeen Ashraf
 */

import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Property from '../../../../../axon/js/Property.js';
import CountingCommonModel from '../../../../../counting-common/js/common/model/CountingCommonModel.js';
import level10_png from '../../../../images/level10_png.js';
import level1_png from '../../../../images/level1_png.js';
import level2_png from '../../../../images/level2_png.js';
import level3_png from '../../../../images/level3_png.js';
import level4_png from '../../../../images/level4_png.js';
import level5_png from '../../../../images/level5_png.js';
import level6_png from '../../../../images/level6_png.js';
import level7_png from '../../../../images/level7_png.js';
import level8_png from '../../../../images/level8_png.js';
import level9_png from '../../../../images/level9_png.js';
import makeATen from '../../../makeATen.js';
import MakeATenStrings from '../../../MakeATenStrings.js';
import MakeATenConstants from '../../common/MakeATenConstants.js';
import AdditionTerms from '../../common/model/AdditionTerms.js';
import GameState from './GameState.js';
import Level from './Level.js';
import NumberChallengeFactory from './NumberChallengeFactory.js';

// Level descriptions
const level10DescriptionString = MakeATenStrings.level10Description;
const level1DescriptionString = MakeATenStrings.level1Description;
const level2DescriptionString = MakeATenStrings.level2Description;
const level3DescriptionString = MakeATenStrings.level3Description;
const level4DescriptionString = MakeATenStrings.level4Description;
const level5DescriptionString = MakeATenStrings.level5Description;
const level6DescriptionString = MakeATenStrings.level6Description;
const level7DescriptionString = MakeATenStrings.level7Description;
const level8DescriptionString = MakeATenStrings.level8Description;
const level9DescriptionString = MakeATenStrings.level9Description;

// Level icons

class MakeATenGameModel extends CountingCommonModel {
  constructor() {
    super( MakeATenConstants.MAX_SUM );

    // Created here, since due to the initialization of dotRandom to support PhET-iO, we need to delay until the model
    // is created (can't do at static load time), thus we have a separate challenge factory.
    const numberChallengeFactory = new NumberChallengeFactory();

    // @public {Array.<Level>} - All of the game levels for this screen.
    this.levels = [
      new Level( 1, '#FC4280', level1_png, level1DescriptionString, numberChallengeFactory ),
      new Level( 2, '#FC4280', level2_png, level2DescriptionString, numberChallengeFactory ),
      new Level( 3, '#FC4280', level3_png, level3DescriptionString, numberChallengeFactory ),
      new Level( 4, '#06A5AD', level4_png, level4DescriptionString, numberChallengeFactory ),
      new Level( 5, '#06A5AD', level5_png, level5DescriptionString, numberChallengeFactory ),
      new Level( 6, '#06A5AD', level6_png, level6DescriptionString, numberChallengeFactory ),
      new Level( 7, '#06A5AD', level7_png, level7DescriptionString, numberChallengeFactory ),
      new Level( 8, '#9778CC', level8_png, level8DescriptionString, numberChallengeFactory ),
      new Level( 9, '#9778CC', level9_png, level9DescriptionString, numberChallengeFactory ),
      new Level( 10, '#9778CC', level10_png, level10DescriptionString, numberChallengeFactory )
    ];

    // @public {Property.<Level>} - The current level
    this.currentLevelProperty = new Property( this.levels[ 0 ] );

    // @public {NumberProperty} - The score for whatever the current level is.
    this.currentScoreProperty = new NumberProperty( 0 );

    // @public {Property.<NumberChallenge|null>} - The current challenge when in a level
    this.currentChallengeProperty = new Property( null );

    // @public {Property.<GameState>} - Current game state
    this.gameStateProperty = new Property( GameState.CHOOSING_LEVEL );

    // @public {AdditionTerms} - Our left and right terms to be added.
    this.additionTerms = new AdditionTerms();

    // Check for when the challenge is completed
    this.countingObjects.lengthProperty.link( ( newLength, oldLength ) => {
      // Check oldLength to make sure it's not from the counting objects just added.
      if ( newLength === 1 && oldLength === 2 && this.gameStateProperty.value === GameState.PRESENTING_INTERACTIVE_CHALLENGE ) { // The user has added the two numbers, trigger success state
        this.gameStateProperty.value = GameState.CORRECT_ANSWER;
      }
    } );

    // Keep our currentScore updated when the level changes.
    this.currentLevelProperty.link( level => {
      this.currentScoreProperty.value = level.scoreProperty.value;
    } );

    // Keep our currentScore updated when our current level's score changes.
    this.levels.forEach( level => {
      level.scoreProperty.link( score => {
        if ( level === this.currentLevelProperty.value ) {
          this.currentScoreProperty.value = score;
        }
      } );
    } );
  }

  /**
   * Starts a new challenge with the level specified
   * @public
   *
   * @param {Level} level
   */
  startLevel( level ) {
    this.removeAllCountingObjects();

    this.currentLevelProperty.value = level;

    // Set up the model for the next challenge
    this.currentChallengeProperty.value = level.generateChallenge();

    // Change to new game state.
    this.gameStateProperty.value = GameState.PRESENTING_INTERACTIVE_CHALLENGE;
  }

  /**
   * Increments the score of the current level.
   * @public
   */
  incrementScore() {
    this.currentLevelProperty.value.scoreProperty.value++;
  }

  /**
   * Moves to the next challenge (the current challenge's solution was correct).
   * @public
   */
  moveToNextChallenge() {
    this.removeAllCountingObjects();

    this.currentChallengeProperty.value = this.currentLevelProperty.value.generateChallenge();
    this.gameStateProperty.value = GameState.PRESENTING_INTERACTIVE_CHALLENGE;
  }

  /**
   * Moves back to the level selection.
   * @public
   */
  moveToChoosingLevel() {
    this.gameStateProperty.value = GameState.CHOOSING_LEVEL;
  }

  /**
   * Creates counting objects for the specified challenge.
   * @public
   *
   * @param {NumberChallenge} numberChallenge
   */
  setupChallenge( numberChallenge ) {
    this.removeAllCountingObjects();
    this.additionTerms.leftTermProperty.value = numberChallenge.leftTerm;
    this.additionTerms.rightTermProperty.value = numberChallenge.rightTerm;
    this.addMultipleNumbers( [ numberChallenge.leftTerm, numberChallenge.rightTerm ] );
  }

  /**
   * Resets our game model.
   * @public
   */
  reset() {
    super.reset();

    this.currentLevelProperty.reset();
    this.currentScoreProperty.reset();
    this.currentChallengeProperty.reset();
    this.gameStateProperty.reset();

    for ( let i = 0; i < this.levels.length; i++ ) {
      this.levels[ i ].reset();
    }
  }
}

makeATen.register( 'MakeATenGameModel', MakeATenGameModel );

export default MakeATenGameModel;