// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main model class for the balance game.
 *
 * Note: Levels in this model are zero-indexed, even though they are often
 * presented to the user as starting at level 1.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import Property from '../../../../axon/js/Property.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import balancingAct from '../../balancingAct.js';
import ColumnState from '../../common/model/ColumnState.js';
import Fulcrum from '../../common/model/Fulcrum.js';
import LevelSupportColumn from '../../common/model/LevelSupportColumn.js';
import Plank from '../../common/model/Plank.js';
import BalanceGameChallengeFactory from './BalanceGameChallengeFactory.js';
import BalanceMassesChallenge from './BalanceMassesChallenge.js';
import MassDeductionChallenge from './MassDeductionChallenge.js';
import TiltedSupportColumn from './TiltedSupportColumn.js';
import TiltPredictionChallenge from './TiltPredictionChallenge.js';

// constants
const MAX_LEVELS = 4;
const MAX_POINTS_PER_PROBLEM = 2;
const CHALLENGES_PER_PROBLEM_SET = 6;
const MAX_SCORE_PER_GAME = MAX_POINTS_PER_PROBLEM * CHALLENGES_PER_PROBLEM_SET;
const FULCRUM_HEIGHT = 0.85; // In meters.
const PLANK_HEIGHT = 0.75; // In meters.

class BalanceGameModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    this.timerEnabledProperty = new Property( false );
    this.levelProperty = new Property( 0 ); // Zero-based in the model, though levels appear to the user to start at 1.
    this.challengeIndexProperty = new Property( 0 );
    this.scoreProperty = new Property( 0 );

    // Valid values for gameState are 'choosingLevel', 'presentingInteractiveChallenge', 'showingCorrectAnswerFeedback',
    // 'showingIncorrectAnswerFeedbackTryAgain', 'showingIncorrectAnswerFeedbackMoveOn', 'displayingCorrectAnswer',
    // 'showingLevelResults'
    this.gameStateProperty = new Property( 'choosingLevel' );
    this.columnStateProperty = new EnumerationDeprecatedProperty( ColumnState, ColumnState.SINGLE_COLUMN );
    this.elapsedTimeProperty = new Property( 0 );

    // Best times and scores.
    this.bestTimes = [];
    this.mostRecentScores = [];
    _.times( MAX_LEVELS, () => {
      this.bestTimes.push( null );
      this.mostRecentScores.push( new Property( 0 ) );
    } );

    // Counter used to track number of incorrect answers.
    this.incorrectGuessesOnCurrentChallenge = 0;

    // Current set of challenges, which collectively comprise a single level, on
    // which the user is currently working.
    this.challengeList = null;

    // Fixed masses that sit on the plank and that the user must attempt to balance.
    this.fixedMasses = createObservableArray();

    // Masses that the user moves on to the plank to counterbalance the fixed masses.
    this.movableMasses = createObservableArray();

    // Masses that the user is (or users are) moving.
    this.userControlledMasses = [];

    // Add the plank.
    this.plank = new Plank( new Vector2( 0, PLANK_HEIGHT ), new Vector2( 0, FULCRUM_HEIGHT ), this.columnStateProperty, this.userControlledMasses,
      tandem.createTandem( 'plank' ) );

    // Tilted support column.  In this model, there is only one.
    const tiltedSupportColumnXPos = 1.8; // Meters, empirically chosen to look good.
    this.tiltedSupportColumn = new TiltedSupportColumn( PLANK_HEIGHT + tiltedSupportColumnXPos * Math.tan( this.plank.maxTiltAngle ),
      tiltedSupportColumnXPos, -this.plank.maxTiltAngle );

    // Level support columns.
    this.levelSupportColumns = [
      new LevelSupportColumn( PLANK_HEIGHT, -1.625 ),
      new LevelSupportColumn( PLANK_HEIGHT, 1.625 )
    ];

    // Fulcrum on which the plank pivots
    this.fulcrum = new Fulcrum( new Dimension2( 1, FULCRUM_HEIGHT ) );
  }

  /**
   * @param {number} dt
   * @public
   */
  step( dt ) {
    this.plank.step( dt );
    this.movableMasses.forEach( mass => {
      mass.step( dt );
    } );
    this.fixedMasses.forEach( mass => {
      mass.step( dt );
    } );
  }

  /**
   * @public
   */
  reset() {
    this.timerEnabledProperty.reset();
    this.levelProperty.reset();
    this.challengeIndexProperty.reset();
    this.scoreProperty.reset();
    this.gameStateProperty.reset();
    this.columnStateProperty.reset();
    this.elapsedTimeProperty.reset();
    this.mostRecentScores.forEach( mostRecentScoreProperty => { mostRecentScoreProperty.reset(); } );
    this.bestTimes = [];
    _.times( MAX_LEVELS, () => {
      this.bestTimes.push( null );
    } );
  }

  /**
   * @param {number} level
   * @public
   */
  startLevel( level ) {
    this.levelProperty.set( level );
    this.scoreProperty.reset();
    this.challengeIndexProperty.reset();
    this.restartGameTimer();

    // Set up the challenges.
    this.challengeList = BalanceGameChallengeFactory.generateChallengeSet( level );

    // Set up the model for the next challenge
    this.setChallenge( this.challengeList[ 0 ], this.challengeList[ 0 ].initialColumnState );

    // Change to new game state.
    this.gameStateProperty.set( 'presentingInteractiveChallenge' );

    // Flag set to indicate new best time, cleared each time a level is started.
    this.newBestTime = false;
  }

  /**
   * @param balanceChallenge
   * @param columnState
   * @private
   */
  setChallenge( balanceChallenge, columnState ) {

    // Clear out the previous challenge (if there was one).  Start by resetting the plank.
    this.plank.removeAllMasses();
    this.userControlledMasses.length = 0;

    // Force the plank to be level and still.  This prevents any floating point inaccuracies when adding masses.
    this.columnStateProperty.set( ColumnState.DOUBLE_COLUMNS );

    // Clear out the masses from the previous challenge.
    this.fixedMasses.clear();
    this.movableMasses.clear();

    // Set up the new challenge.
    balanceChallenge.fixedMassDistancePairs.forEach( fixedMassDistancePair => {
      this.fixedMasses.push( fixedMassDistancePair.mass );
      this.plank.addMassToSurfaceAt( fixedMassDistancePair.mass, fixedMassDistancePair.distance );
    } );

    balanceChallenge.movableMasses.forEach( mass => {
      const initialPosition = new Vector2( 3, 0 );
      mass.positionProperty.set( initialPosition );
      mass.userControlledProperty.link( userControlled => {
        if ( userControlled ) {
          this.userControlledMasses.push( mass );
        }
        else {
          // The user has dropped this mass.
          this.userControlledMasses.splice( this.userControlledMasses.indexOf( mass ), 1 );
          if ( !this.plank.addMassToSurface( mass ) ) {
            // The attempt to add this mass to surface of plank failed,
            // probably because the mass wasn't over the plank or there
            // wasn't on open spot near where it was released.
            mass.positionProperty.set( initialPosition );
          }
        }
      } );
      this.movableMasses.add( mass );

    } );

    // Set the column state.
    this.columnStateProperty.set( columnState );
  }

  /**
   * @returns {BalanceMassesChallenge|null}
   * @public
   */
  getCurrentChallenge() {
    if ( this.challengeList === null || this.challengeList.size <= this.challengeIndexProperty.get() ) {
      return null;
    }
    return this.challengeList[ this.challengeIndexProperty.get() ];
  }

  /**
   * @returns {number}
   * @public
   */
  getChallengeCurrentPointValue() {
    return MAX_POINTS_PER_PROBLEM - this.incorrectGuessesOnCurrentChallenge;
  }

  /**
   * Check the user's proposed answer.  Used overloaded functions in the original Java sim, a little ugly when ported.
   * @param mass
   * @param tiltPrediction
   * @public
   */
  checkAnswer( mass, tiltPrediction ) {
    if ( this.getCurrentChallenge() instanceof BalanceMassesChallenge ) {

      // Turn off the column(s) so that the plank can move.
      this.columnStateProperty.set( ColumnState.NO_COLUMNS );

      this.handleProposedAnswer( this.plank.isBalanced() );
    }
    else if ( this.getCurrentChallenge() instanceof TiltPredictionChallenge ) {

      const isAnswerCorrect = ( tiltPrediction === 'tiltDownOnLeftSide' && this.plank.getTorqueDueToMasses() > 0 ) ||
                              ( tiltPrediction === 'tiltDownOnRightSide' && this.plank.getTorqueDueToMasses() < 0 ) ||
                              ( tiltPrediction === 'stayBalanced' && this.plank.getTorqueDueToMasses() === 0 );

      if ( isAnswerCorrect ) {
        // Turn off the column(s) so that the plank can move.
        this.columnStateProperty.set( ColumnState.NO_COLUMNS );
      }

      this.handleProposedAnswer( isAnswerCorrect );
    }
    else if ( this.getCurrentChallenge() instanceof MassDeductionChallenge ) {
      this.handleProposedAnswer( mass === this.getTotalFixedMassValue() );
    }
  }

  /**
   * @param {boolean} answerIsCorrect
   * @private
   */
  handleProposedAnswer( answerIsCorrect ) {
    let pointsEarned = 0;
    if ( answerIsCorrect ) {
      // The user answered the challenge correctly.
      this.gameStateProperty.set( 'showingCorrectAnswerFeedback' );
      if ( this.incorrectGuessesOnCurrentChallenge === 0 ) {
        // User got it right the first time.
        pointsEarned = MAX_POINTS_PER_PROBLEM;
      }
      else {
        // User got it wrong at first, but got it right now.
        pointsEarned = MAX_POINTS_PER_PROBLEM - this.incorrectGuessesOnCurrentChallenge;
      }
      this.scoreProperty.value += pointsEarned;
    }
    else {
      // The user got it wrong.
      this.incorrectGuessesOnCurrentChallenge++;
      if ( this.incorrectGuessesOnCurrentChallenge < this.getCurrentChallenge().maxAttemptsAllowed ) {
        this.gameStateProperty.set( 'showingIncorrectAnswerFeedbackTryAgain' );
      }
      else {
        this.gameStateProperty.set( 'showingIncorrectAnswerFeedbackMoveOn' );
      }
    }
  }

  /**
   * @public
   */
  newGame() {
    this.stopGameTimer();
    this.gameStateProperty.set( 'choosingLevel' );
    this.incorrectGuessesOnCurrentChallenge = 0;
  }

  /**
   * @public
   */
  nextChallenge() {
    this.challengeIndexProperty.value++;
    this.incorrectGuessesOnCurrentChallenge = 0;
    if ( this.challengeIndexProperty.get() < this.challengeList.length ) {
      // Move to the next challenge.
      this.setChallenge( this.getCurrentChallenge(), this.getCurrentChallenge().initialColumnState );
      this.gameStateProperty.set( 'presentingInteractiveChallenge' );
    }
    else {
      // All challenges completed for this level.  See if this is a new
      // best time and, if so, record it.
      const level = this.levelProperty.get();
      if ( this.scoreProperty.get() === MAX_SCORE_PER_GAME ) {
        // Perfect game.  See if new best time.
        if ( this.bestTimes[ level ] === null || this.elapsedTimeProperty.get() < this.bestTimes[ level ] ) {
          this.newBestTime = this.bestTimes[ level ] !== null; // Don't set this flag for the first 'best time', only when the time improves.
          this.bestTimes[ level ] = this.elapsedTimeProperty.get();
        }
      }
      this.mostRecentScores[ level ].value = this.scoreProperty.get();

      // Done with this game, show the results.
      this.gameStateProperty.set( 'showingLevelResults' );
    }
  }

  /**
   * @public
   */
  tryAgain() {

    // Restore the column(s) to the original state but don't move the masses anywhere.  This makes it easier for the
    // users to see why their answer was incorrect.
    this.columnStateProperty.set( this.getCurrentChallenge().initialColumnState );
    this.gameStateProperty.set( 'presentingInteractiveChallenge' );
  }

  /**
   * @public
   */
  displayCorrectAnswer() {
    const currentChallenge = this.getCurrentChallenge();

    // Put the challenge in its initial state, but with the columns turned off.
    this.setChallenge( currentChallenge, ColumnState.NO_COLUMNS );

    // Add the movable mass or masses to the plank according to the solution.
    currentChallenge.balancedConfiguration.forEach( massDistancePair => {
      this.plank.addMassToSurfaceAt( massDistancePair.mass, massDistancePair.distance );
    } );

    // Update the game state.
    this.gameStateProperty.set( 'displayingCorrectAnswer' );
  }

  /**
   * @public
   */
  getTipDirection() {
    if ( this.plank.getTorqueDueToMasses() < 0 ) {
      return 'tiltDownOnRightSide';
    }
    else if ( this.plank.getTorqueDueToMasses() > 0 ) {
      return 'tiltDownOnLeftSide';
    }
    else {
      return 'stayBalanced';
    }
  }

  /**
   * @public
   */
  getTotalFixedMassValue() {
    let totalMass = 0;
    this.getCurrentChallenge().fixedMassDistancePairs.forEach( massDistancePair => {
      totalMass += massDistancePair.mass.massValue;
    } );
    return totalMass;
  }

  /**
   * @public
   */
  restartGameTimer() {
    if ( this.gameTimerId !== null ) {
      stepTimer.clearInterval( this.gameTimerId );
    }
    this.elapsedTimeProperty.reset();
    this.gameTimerId = stepTimer.setInterval( () => { this.elapsedTimeProperty.value += 1; }, 1000 );
  }

  /**
   * @public
   */
  stopGameTimer() {
    stepTimer.clearInterval( this.gameTimerId );
    this.gameTimerId = null;
  }
}


// statics
BalanceGameModel.PROBLEMS_PER_LEVEL = CHALLENGES_PER_PROBLEM_SET;
BalanceGameModel.MAX_POSSIBLE_SCORE = MAX_POINTS_PER_PROBLEM * CHALLENGES_PER_PROBLEM_SET;

balancingAct.register( 'BalanceGameModel', BalanceGameModel );

export default BalanceGameModel;