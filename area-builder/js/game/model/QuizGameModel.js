// Copyright 2014-2021, University of Colorado Boulder

/**
 * Framework for a quiz style game where the user is presented with various 'challenges' which must be answered and for
 * which they get points.  This file defines the code that handles the general behavior for PhET's quiz-style games,
 * such as state transitions, timers, best scores, and such.  It works in conjunction with a sim-specific model that
 * handles behavior that is specific to this simulation's game, such as how the model changes when displaying correct
 * answer to the user.
 *
 * This separation of concerns is experimental, and this simulation (Area Builder) is the first one where it is being
 * tried.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import merge from '../../../../phet-core/js/merge.js';
import areaBuilder from '../../areaBuilder.js';
import GameState from './GameState.js';

class QuizGameModel {

  /**
   * @param challengeFactory - Factory object that is used to create challenges, examine usage for details.
   * @param simSpecificModel - Model containing the elements of the game that are unique to this sim, used to delegate
   * delegate certain actions.  Look through code for usage details.
   * @param {Object} [options]
   */
  constructor( challengeFactory, simSpecificModel, options ) {
    this.challengeFactory = challengeFactory; // @private
    this.simSpecificModel = simSpecificModel; // @public

    options = merge( {
      numberOfLevels: 6,
      challengesPerSet: 6,
      maxPointsPerChallenge: 2,
      maxAttemptsPerChallenge: 2
    }, options );

    // @public - model properties
    this.timerEnabledProperty = new Property( false );
    this.levelProperty = new Property( 0 );
    this.challengeIndexProperty = new Property( 0 );
    this.currentChallengeProperty = new Property( null );
    this.scoreProperty = new Property( 0 );
    this.elapsedTimeProperty = new Property( 0 );
    this.gameStateProperty = new Property( GameState.CHOOSING_LEVEL ); // Current state of the game, see GameState for valid values.

    // other public vars
    this.numberOfLevels = options.numberOfLevels; // @public
    this.challengesPerSet = options.challengesPerSet; // @public
    this.maxPointsPerChallenge = options.maxPointsPerChallenge; // @public
    this.maxPossibleScore = options.challengesPerSet * options.maxPointsPerChallenge; // @public
    this.maxAttemptsPerChallenge = options.maxAttemptsPerChallenge; // @private

    // @private Wall time at which current level was started.
    this.gameStartTime = 0;

    // Best times and scores.
    this.bestTimes = []; // @public
    this.bestScoreProperties = []; // @public
    _.times( options.numberOfLevels, () => {
      this.bestTimes.push( null );
      this.bestScoreProperties.push( new Property( 0 ) );
    } );

    // Counter used to track number of incorrect answers.
    this.incorrectGuessesOnCurrentChallenge = 0; // @public

    // Current set of challenges, which collectively comprise a single level, on which the user is currently working.
    this.challengeList = null;  // @private

    // Let the sim-specific model know when the challenge changes.
    this.currentChallengeProperty.lazyLink( challenge => { simSpecificModel.setChallenge( challenge ); } );
  }

  // @private
  step( dt ) {
    this.simSpecificModel.step( dt );
  }

  /**
   * reset this model
   * @public
   */
  reset() {
    this.timerEnabledProperty.reset();
    this.levelProperty.reset();
    this.challengeIndexProperty.reset();
    this.currentChallengeProperty.reset();
    this.scoreProperty.reset();
    this.elapsedTimeProperty.reset();
    this.gameStateProperty.reset();
    this.bestScoreProperties.forEach( bestScoreProperty => { bestScoreProperty.reset(); } );
    this.bestTimes = [];
    _.times( this.numberOfLevels, () => {
      this.bestTimes.push( null );
    } );
  }

  /**
   * starts new level
   * @param {number} level
   * @public
   */
  startLevel( level ) {
    this.levelProperty.set( level );
    this.scoreProperty.reset();
    this.challengeIndexProperty.set( 0 );
    this.incorrectGuessesOnCurrentChallenge = 0;
    this.restartGameTimer();

    // Create the list of challenges.
    this.challengeList = this.challengeFactory.generateChallengeSet( level, this.challengesPerSet );

    // Set up the model for the next challenge
    this.currentChallengeProperty.set( this.challengeList[ this.challengeIndexProperty.get() ] );

    // Let the sim-specific model know that a new level is being started in case it needs to do any initialization.
    this.simSpecificModel.startLevel();

    // Change to new game state.
    this.gameStateProperty.set( GameState.PRESENTING_INTERACTIVE_CHALLENGE );

    // Flag set to indicate new best time, cleared each time a level is started.
    this.newBestTime = false;
  }

  /**
   * @public
   */
  setChoosingLevelState() {
    this.gameStateProperty.set( GameState.CHOOSING_LEVEL );
  }

  /**
   * @public
   */
  getChallengeCurrentPointValue() {
    return Math.max( this.maxPointsPerChallenge - this.incorrectGuessesOnCurrentChallenge, 0 );
  }

  /**
   * Check the user's proposed answer.
   * @public
   */
  checkAnswer( answer ) {
    this.handleProposedAnswer( this.simSpecificModel.checkAnswer( this.currentChallengeProperty.get() ) );
  }

  /**
   * @param answerIsCorrect
   * @private
   */
  handleProposedAnswer( answerIsCorrect ) {
    let pointsEarned = 0;
    if ( answerIsCorrect ) {
      // The user answered the challenge correctly.
      this.gameStateProperty.set( GameState.SHOWING_CORRECT_ANSWER_FEEDBACK );
      if ( this.incorrectGuessesOnCurrentChallenge === 0 ) {
        // User got it right the first time.
        pointsEarned = this.maxPointsPerChallenge;
      }
      else {
        // User got it wrong at first, but got it right now.
        pointsEarned = Math.max( this.maxPointsPerChallenge - this.incorrectGuessesOnCurrentChallenge, 0 );
      }
      this.scoreProperty.value += pointsEarned;
    }
    else {
      // The user got it wrong.
      this.incorrectGuessesOnCurrentChallenge++;
      if ( this.incorrectGuessesOnCurrentChallenge < this.maxAttemptsPerChallenge ) {
        this.gameStateProperty.set( GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN );
      }
      else {
        this.gameStateProperty.set( GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_MOVE_ON );
      }
    }
  }

  // @private
  newGame() {
    this.stopGameTimer();
    this.gameStateProperty.set( GameState.CHOOSING_LEVEL );
    this.incorrectGuessesOnCurrentChallenge = 0;
  }

  /**
   * Move to the next challenge in the current challenge set.
   * @public
   */
  nextChallenge() {
    const currentLevel = this.levelProperty.get();
    this.incorrectGuessesOnCurrentChallenge = 0;
    if ( this.challengeIndexProperty.get() + 1 < this.challengeList.length ) {
      // Move to the next challenge.
      this.challengeIndexProperty.value++;
      this.currentChallengeProperty.set( this.challengeList[ this.challengeIndexProperty.get() ] );
      this.gameStateProperty.set( GameState.PRESENTING_INTERACTIVE_CHALLENGE );
    }
    else {
      // All challenges completed for this level.  See if this is a new best time and, if so, record it.
      if ( this.scoreProperty.get() === this.maxPossibleScore ) {
        // Perfect game.  See if new best time.
        if ( this.bestTimes[ currentLevel ] === null || this.elapsedTimeProperty.get() < this.bestTimes[ currentLevel ] ) {
          this.newBestTime = this.bestTimes[ currentLevel ] !== null; // Don't set this flag for the first 'best time', only when the time improves.
          this.bestTimes[ currentLevel ] = this.elapsedTimeProperty.get();
        }
      }
      this.bestScoreProperties[ currentLevel ].value = this.scoreProperty.get();

      // Done with this game, show the results.
      this.gameStateProperty.set( GameState.SHOWING_LEVEL_RESULTS );
    }
  }

  /**
   * @public
   */
  tryAgain() {
    this.simSpecificModel.tryAgain();
    this.gameStateProperty.set( GameState.PRESENTING_INTERACTIVE_CHALLENGE );
  }

  /**
   * @public
   */
  displayCorrectAnswer() {

    // Set the challenge to display the correct answer.
    this.simSpecificModel.displayCorrectAnswer( this.currentChallengeProperty.get() );

    // Update the game state.
    this.gameStateProperty.set( GameState.DISPLAYING_CORRECT_ANSWER );
  }

  // @private
  restartGameTimer() {
    if ( this.gameTimerId !== null ) {
      window.clearInterval( this.gameTimerId );
    }
    this.elapsedTimeProperty.set( 0 );
    this.gameTimerId = stepTimer.setInterval( () => { this.elapsedTimeProperty.value += 1; }, 1000 );
  }

  // @private
  stopGameTimer() {
    window.clearInterval( this.gameTimerId );
    this.gameTimerId = null;
  }
}

areaBuilder.register( 'QuizGameModel', QuizGameModel );
export default QuizGameModel;