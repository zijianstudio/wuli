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
  constructor(tandem) {
    this.timerEnabledProperty = new Property(false);
    this.levelProperty = new Property(0); // Zero-based in the model, though levels appear to the user to start at 1.
    this.challengeIndexProperty = new Property(0);
    this.scoreProperty = new Property(0);

    // Valid values for gameState are 'choosingLevel', 'presentingInteractiveChallenge', 'showingCorrectAnswerFeedback',
    // 'showingIncorrectAnswerFeedbackTryAgain', 'showingIncorrectAnswerFeedbackMoveOn', 'displayingCorrectAnswer',
    // 'showingLevelResults'
    this.gameStateProperty = new Property('choosingLevel');
    this.columnStateProperty = new EnumerationDeprecatedProperty(ColumnState, ColumnState.SINGLE_COLUMN);
    this.elapsedTimeProperty = new Property(0);

    // Best times and scores.
    this.bestTimes = [];
    this.mostRecentScores = [];
    _.times(MAX_LEVELS, () => {
      this.bestTimes.push(null);
      this.mostRecentScores.push(new Property(0));
    });

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
    this.plank = new Plank(new Vector2(0, PLANK_HEIGHT), new Vector2(0, FULCRUM_HEIGHT), this.columnStateProperty, this.userControlledMasses, tandem.createTandem('plank'));

    // Tilted support column.  In this model, there is only one.
    const tiltedSupportColumnXPos = 1.8; // Meters, empirically chosen to look good.
    this.tiltedSupportColumn = new TiltedSupportColumn(PLANK_HEIGHT + tiltedSupportColumnXPos * Math.tan(this.plank.maxTiltAngle), tiltedSupportColumnXPos, -this.plank.maxTiltAngle);

    // Level support columns.
    this.levelSupportColumns = [new LevelSupportColumn(PLANK_HEIGHT, -1.625), new LevelSupportColumn(PLANK_HEIGHT, 1.625)];

    // Fulcrum on which the plank pivots
    this.fulcrum = new Fulcrum(new Dimension2(1, FULCRUM_HEIGHT));
  }

  /**
   * @param {number} dt
   * @public
   */
  step(dt) {
    this.plank.step(dt);
    this.movableMasses.forEach(mass => {
      mass.step(dt);
    });
    this.fixedMasses.forEach(mass => {
      mass.step(dt);
    });
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
    this.mostRecentScores.forEach(mostRecentScoreProperty => {
      mostRecentScoreProperty.reset();
    });
    this.bestTimes = [];
    _.times(MAX_LEVELS, () => {
      this.bestTimes.push(null);
    });
  }

  /**
   * @param {number} level
   * @public
   */
  startLevel(level) {
    this.levelProperty.set(level);
    this.scoreProperty.reset();
    this.challengeIndexProperty.reset();
    this.restartGameTimer();

    // Set up the challenges.
    this.challengeList = BalanceGameChallengeFactory.generateChallengeSet(level);

    // Set up the model for the next challenge
    this.setChallenge(this.challengeList[0], this.challengeList[0].initialColumnState);

    // Change to new game state.
    this.gameStateProperty.set('presentingInteractiveChallenge');

    // Flag set to indicate new best time, cleared each time a level is started.
    this.newBestTime = false;
  }

  /**
   * @param balanceChallenge
   * @param columnState
   * @private
   */
  setChallenge(balanceChallenge, columnState) {
    // Clear out the previous challenge (if there was one).  Start by resetting the plank.
    this.plank.removeAllMasses();
    this.userControlledMasses.length = 0;

    // Force the plank to be level and still.  This prevents any floating point inaccuracies when adding masses.
    this.columnStateProperty.set(ColumnState.DOUBLE_COLUMNS);

    // Clear out the masses from the previous challenge.
    this.fixedMasses.clear();
    this.movableMasses.clear();

    // Set up the new challenge.
    balanceChallenge.fixedMassDistancePairs.forEach(fixedMassDistancePair => {
      this.fixedMasses.push(fixedMassDistancePair.mass);
      this.plank.addMassToSurfaceAt(fixedMassDistancePair.mass, fixedMassDistancePair.distance);
    });
    balanceChallenge.movableMasses.forEach(mass => {
      const initialPosition = new Vector2(3, 0);
      mass.positionProperty.set(initialPosition);
      mass.userControlledProperty.link(userControlled => {
        if (userControlled) {
          this.userControlledMasses.push(mass);
        } else {
          // The user has dropped this mass.
          this.userControlledMasses.splice(this.userControlledMasses.indexOf(mass), 1);
          if (!this.plank.addMassToSurface(mass)) {
            // The attempt to add this mass to surface of plank failed,
            // probably because the mass wasn't over the plank or there
            // wasn't on open spot near where it was released.
            mass.positionProperty.set(initialPosition);
          }
        }
      });
      this.movableMasses.add(mass);
    });

    // Set the column state.
    this.columnStateProperty.set(columnState);
  }

  /**
   * @returns {BalanceMassesChallenge|null}
   * @public
   */
  getCurrentChallenge() {
    if (this.challengeList === null || this.challengeList.size <= this.challengeIndexProperty.get()) {
      return null;
    }
    return this.challengeList[this.challengeIndexProperty.get()];
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
  checkAnswer(mass, tiltPrediction) {
    if (this.getCurrentChallenge() instanceof BalanceMassesChallenge) {
      // Turn off the column(s) so that the plank can move.
      this.columnStateProperty.set(ColumnState.NO_COLUMNS);
      this.handleProposedAnswer(this.plank.isBalanced());
    } else if (this.getCurrentChallenge() instanceof TiltPredictionChallenge) {
      const isAnswerCorrect = tiltPrediction === 'tiltDownOnLeftSide' && this.plank.getTorqueDueToMasses() > 0 || tiltPrediction === 'tiltDownOnRightSide' && this.plank.getTorqueDueToMasses() < 0 || tiltPrediction === 'stayBalanced' && this.plank.getTorqueDueToMasses() === 0;
      if (isAnswerCorrect) {
        // Turn off the column(s) so that the plank can move.
        this.columnStateProperty.set(ColumnState.NO_COLUMNS);
      }
      this.handleProposedAnswer(isAnswerCorrect);
    } else if (this.getCurrentChallenge() instanceof MassDeductionChallenge) {
      this.handleProposedAnswer(mass === this.getTotalFixedMassValue());
    }
  }

  /**
   * @param {boolean} answerIsCorrect
   * @private
   */
  handleProposedAnswer(answerIsCorrect) {
    let pointsEarned = 0;
    if (answerIsCorrect) {
      // The user answered the challenge correctly.
      this.gameStateProperty.set('showingCorrectAnswerFeedback');
      if (this.incorrectGuessesOnCurrentChallenge === 0) {
        // User got it right the first time.
        pointsEarned = MAX_POINTS_PER_PROBLEM;
      } else {
        // User got it wrong at first, but got it right now.
        pointsEarned = MAX_POINTS_PER_PROBLEM - this.incorrectGuessesOnCurrentChallenge;
      }
      this.scoreProperty.value += pointsEarned;
    } else {
      // The user got it wrong.
      this.incorrectGuessesOnCurrentChallenge++;
      if (this.incorrectGuessesOnCurrentChallenge < this.getCurrentChallenge().maxAttemptsAllowed) {
        this.gameStateProperty.set('showingIncorrectAnswerFeedbackTryAgain');
      } else {
        this.gameStateProperty.set('showingIncorrectAnswerFeedbackMoveOn');
      }
    }
  }

  /**
   * @public
   */
  newGame() {
    this.stopGameTimer();
    this.gameStateProperty.set('choosingLevel');
    this.incorrectGuessesOnCurrentChallenge = 0;
  }

  /**
   * @public
   */
  nextChallenge() {
    this.challengeIndexProperty.value++;
    this.incorrectGuessesOnCurrentChallenge = 0;
    if (this.challengeIndexProperty.get() < this.challengeList.length) {
      // Move to the next challenge.
      this.setChallenge(this.getCurrentChallenge(), this.getCurrentChallenge().initialColumnState);
      this.gameStateProperty.set('presentingInteractiveChallenge');
    } else {
      // All challenges completed for this level.  See if this is a new
      // best time and, if so, record it.
      const level = this.levelProperty.get();
      if (this.scoreProperty.get() === MAX_SCORE_PER_GAME) {
        // Perfect game.  See if new best time.
        if (this.bestTimes[level] === null || this.elapsedTimeProperty.get() < this.bestTimes[level]) {
          this.newBestTime = this.bestTimes[level] !== null; // Don't set this flag for the first 'best time', only when the time improves.
          this.bestTimes[level] = this.elapsedTimeProperty.get();
        }
      }
      this.mostRecentScores[level].value = this.scoreProperty.get();

      // Done with this game, show the results.
      this.gameStateProperty.set('showingLevelResults');
    }
  }

  /**
   * @public
   */
  tryAgain() {
    // Restore the column(s) to the original state but don't move the masses anywhere.  This makes it easier for the
    // users to see why their answer was incorrect.
    this.columnStateProperty.set(this.getCurrentChallenge().initialColumnState);
    this.gameStateProperty.set('presentingInteractiveChallenge');
  }

  /**
   * @public
   */
  displayCorrectAnswer() {
    const currentChallenge = this.getCurrentChallenge();

    // Put the challenge in its initial state, but with the columns turned off.
    this.setChallenge(currentChallenge, ColumnState.NO_COLUMNS);

    // Add the movable mass or masses to the plank according to the solution.
    currentChallenge.balancedConfiguration.forEach(massDistancePair => {
      this.plank.addMassToSurfaceAt(massDistancePair.mass, massDistancePair.distance);
    });

    // Update the game state.
    this.gameStateProperty.set('displayingCorrectAnswer');
  }

  /**
   * @public
   */
  getTipDirection() {
    if (this.plank.getTorqueDueToMasses() < 0) {
      return 'tiltDownOnRightSide';
    } else if (this.plank.getTorqueDueToMasses() > 0) {
      return 'tiltDownOnLeftSide';
    } else {
      return 'stayBalanced';
    }
  }

  /**
   * @public
   */
  getTotalFixedMassValue() {
    let totalMass = 0;
    this.getCurrentChallenge().fixedMassDistancePairs.forEach(massDistancePair => {
      totalMass += massDistancePair.mass.massValue;
    });
    return totalMass;
  }

  /**
   * @public
   */
  restartGameTimer() {
    if (this.gameTimerId !== null) {
      stepTimer.clearInterval(this.gameTimerId);
    }
    this.elapsedTimeProperty.reset();
    this.gameTimerId = stepTimer.setInterval(() => {
      this.elapsedTimeProperty.value += 1;
    }, 1000);
  }

  /**
   * @public
   */
  stopGameTimer() {
    stepTimer.clearInterval(this.gameTimerId);
    this.gameTimerId = null;
  }
}

// statics
BalanceGameModel.PROBLEMS_PER_LEVEL = CHALLENGES_PER_PROBLEM_SET;
BalanceGameModel.MAX_POSSIBLE_SCORE = MAX_POINTS_PER_PROBLEM * CHALLENGES_PER_PROBLEM_SET;
balancingAct.register('BalanceGameModel', BalanceGameModel);
export default BalanceGameModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIlByb3BlcnR5Iiwic3RlcFRpbWVyIiwiRGltZW5zaW9uMiIsIlZlY3RvcjIiLCJiYWxhbmNpbmdBY3QiLCJDb2x1bW5TdGF0ZSIsIkZ1bGNydW0iLCJMZXZlbFN1cHBvcnRDb2x1bW4iLCJQbGFuayIsIkJhbGFuY2VHYW1lQ2hhbGxlbmdlRmFjdG9yeSIsIkJhbGFuY2VNYXNzZXNDaGFsbGVuZ2UiLCJNYXNzRGVkdWN0aW9uQ2hhbGxlbmdlIiwiVGlsdGVkU3VwcG9ydENvbHVtbiIsIlRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlIiwiTUFYX0xFVkVMUyIsIk1BWF9QT0lOVFNfUEVSX1BST0JMRU0iLCJDSEFMTEVOR0VTX1BFUl9QUk9CTEVNX1NFVCIsIk1BWF9TQ09SRV9QRVJfR0FNRSIsIkZVTENSVU1fSEVJR0hUIiwiUExBTktfSEVJR0hUIiwiQmFsYW5jZUdhbWVNb2RlbCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwidGltZXJFbmFibGVkUHJvcGVydHkiLCJsZXZlbFByb3BlcnR5IiwiY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eSIsInNjb3JlUHJvcGVydHkiLCJnYW1lU3RhdGVQcm9wZXJ0eSIsImNvbHVtblN0YXRlUHJvcGVydHkiLCJTSU5HTEVfQ09MVU1OIiwiZWxhcHNlZFRpbWVQcm9wZXJ0eSIsImJlc3RUaW1lcyIsIm1vc3RSZWNlbnRTY29yZXMiLCJfIiwidGltZXMiLCJwdXNoIiwiaW5jb3JyZWN0R3Vlc3Nlc09uQ3VycmVudENoYWxsZW5nZSIsImNoYWxsZW5nZUxpc3QiLCJmaXhlZE1hc3NlcyIsIm1vdmFibGVNYXNzZXMiLCJ1c2VyQ29udHJvbGxlZE1hc3NlcyIsInBsYW5rIiwiY3JlYXRlVGFuZGVtIiwidGlsdGVkU3VwcG9ydENvbHVtblhQb3MiLCJ0aWx0ZWRTdXBwb3J0Q29sdW1uIiwiTWF0aCIsInRhbiIsIm1heFRpbHRBbmdsZSIsImxldmVsU3VwcG9ydENvbHVtbnMiLCJmdWxjcnVtIiwic3RlcCIsImR0IiwiZm9yRWFjaCIsIm1hc3MiLCJyZXNldCIsIm1vc3RSZWNlbnRTY29yZVByb3BlcnR5Iiwic3RhcnRMZXZlbCIsImxldmVsIiwic2V0IiwicmVzdGFydEdhbWVUaW1lciIsImdlbmVyYXRlQ2hhbGxlbmdlU2V0Iiwic2V0Q2hhbGxlbmdlIiwiaW5pdGlhbENvbHVtblN0YXRlIiwibmV3QmVzdFRpbWUiLCJiYWxhbmNlQ2hhbGxlbmdlIiwiY29sdW1uU3RhdGUiLCJyZW1vdmVBbGxNYXNzZXMiLCJsZW5ndGgiLCJET1VCTEVfQ09MVU1OUyIsImNsZWFyIiwiZml4ZWRNYXNzRGlzdGFuY2VQYWlycyIsImZpeGVkTWFzc0Rpc3RhbmNlUGFpciIsImFkZE1hc3NUb1N1cmZhY2VBdCIsImRpc3RhbmNlIiwiaW5pdGlhbFBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJsaW5rIiwidXNlckNvbnRyb2xsZWQiLCJzcGxpY2UiLCJpbmRleE9mIiwiYWRkTWFzc1RvU3VyZmFjZSIsImFkZCIsImdldEN1cnJlbnRDaGFsbGVuZ2UiLCJzaXplIiwiZ2V0IiwiZ2V0Q2hhbGxlbmdlQ3VycmVudFBvaW50VmFsdWUiLCJjaGVja0Fuc3dlciIsInRpbHRQcmVkaWN0aW9uIiwiTk9fQ09MVU1OUyIsImhhbmRsZVByb3Bvc2VkQW5zd2VyIiwiaXNCYWxhbmNlZCIsImlzQW5zd2VyQ29ycmVjdCIsImdldFRvcnF1ZUR1ZVRvTWFzc2VzIiwiZ2V0VG90YWxGaXhlZE1hc3NWYWx1ZSIsImFuc3dlcklzQ29ycmVjdCIsInBvaW50c0Vhcm5lZCIsInZhbHVlIiwibWF4QXR0ZW1wdHNBbGxvd2VkIiwibmV3R2FtZSIsInN0b3BHYW1lVGltZXIiLCJuZXh0Q2hhbGxlbmdlIiwidHJ5QWdhaW4iLCJkaXNwbGF5Q29ycmVjdEFuc3dlciIsImN1cnJlbnRDaGFsbGVuZ2UiLCJiYWxhbmNlZENvbmZpZ3VyYXRpb24iLCJtYXNzRGlzdGFuY2VQYWlyIiwiZ2V0VGlwRGlyZWN0aW9uIiwidG90YWxNYXNzIiwibWFzc1ZhbHVlIiwiZ2FtZVRpbWVySWQiLCJjbGVhckludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJQUk9CTEVNU19QRVJfTEVWRUwiLCJNQVhfUE9TU0lCTEVfU0NPUkUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJhbGFuY2VHYW1lTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBtb2RlbCBjbGFzcyBmb3IgdGhlIGJhbGFuY2UgZ2FtZS5cclxuICpcclxuICogTm90ZTogTGV2ZWxzIGluIHRoaXMgbW9kZWwgYXJlIHplcm8taW5kZXhlZCwgZXZlbiB0aG91Z2ggdGhleSBhcmUgb2Z0ZW5cclxuICogcHJlc2VudGVkIHRvIHRoZSB1c2VyIGFzIHN0YXJ0aW5nIGF0IGxldmVsIDEuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGJhbGFuY2luZ0FjdCBmcm9tICcuLi8uLi9iYWxhbmNpbmdBY3QuanMnO1xyXG5pbXBvcnQgQ29sdW1uU3RhdGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0NvbHVtblN0YXRlLmpzJztcclxuaW1wb3J0IEZ1bGNydW0gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0Z1bGNydW0uanMnO1xyXG5pbXBvcnQgTGV2ZWxTdXBwb3J0Q29sdW1uIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9MZXZlbFN1cHBvcnRDb2x1bW4uanMnO1xyXG5pbXBvcnQgUGxhbmsgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1BsYW5rLmpzJztcclxuaW1wb3J0IEJhbGFuY2VHYW1lQ2hhbGxlbmdlRmFjdG9yeSBmcm9tICcuL0JhbGFuY2VHYW1lQ2hhbGxlbmdlRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBCYWxhbmNlTWFzc2VzQ2hhbGxlbmdlIGZyb20gJy4vQmFsYW5jZU1hc3Nlc0NoYWxsZW5nZS5qcyc7XHJcbmltcG9ydCBNYXNzRGVkdWN0aW9uQ2hhbGxlbmdlIGZyb20gJy4vTWFzc0RlZHVjdGlvbkNoYWxsZW5nZS5qcyc7XHJcbmltcG9ydCBUaWx0ZWRTdXBwb3J0Q29sdW1uIGZyb20gJy4vVGlsdGVkU3VwcG9ydENvbHVtbi5qcyc7XHJcbmltcG9ydCBUaWx0UHJlZGljdGlvbkNoYWxsZW5nZSBmcm9tICcuL1RpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNQVhfTEVWRUxTID0gNDtcclxuY29uc3QgTUFYX1BPSU5UU19QRVJfUFJPQkxFTSA9IDI7XHJcbmNvbnN0IENIQUxMRU5HRVNfUEVSX1BST0JMRU1fU0VUID0gNjtcclxuY29uc3QgTUFYX1NDT1JFX1BFUl9HQU1FID0gTUFYX1BPSU5UU19QRVJfUFJPQkxFTSAqIENIQUxMRU5HRVNfUEVSX1BST0JMRU1fU0VUO1xyXG5jb25zdCBGVUxDUlVNX0hFSUdIVCA9IDAuODU7IC8vIEluIG1ldGVycy5cclxuY29uc3QgUExBTktfSEVJR0hUID0gMC43NTsgLy8gSW4gbWV0ZXJzLlxyXG5cclxuY2xhc3MgQmFsYW5jZUdhbWVNb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIHRoaXMudGltZXJFbmFibGVkUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICB0aGlzLmxldmVsUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTsgLy8gWmVyby1iYXNlZCBpbiB0aGUgbW9kZWwsIHRob3VnaCBsZXZlbHMgYXBwZWFyIHRvIHRoZSB1c2VyIHRvIHN0YXJ0IGF0IDEuXHJcbiAgICB0aGlzLmNoYWxsZW5nZUluZGV4UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTtcclxuICAgIHRoaXMuc2NvcmVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIFZhbGlkIHZhbHVlcyBmb3IgZ2FtZVN0YXRlIGFyZSAnY2hvb3NpbmdMZXZlbCcsICdwcmVzZW50aW5nSW50ZXJhY3RpdmVDaGFsbGVuZ2UnLCAnc2hvd2luZ0NvcnJlY3RBbnN3ZXJGZWVkYmFjaycsXHJcbiAgICAvLyAnc2hvd2luZ0luY29ycmVjdEFuc3dlckZlZWRiYWNrVHJ5QWdhaW4nLCAnc2hvd2luZ0luY29ycmVjdEFuc3dlckZlZWRiYWNrTW92ZU9uJywgJ2Rpc3BsYXlpbmdDb3JyZWN0QW5zd2VyJyxcclxuICAgIC8vICdzaG93aW5nTGV2ZWxSZXN1bHRzJ1xyXG4gICAgdGhpcy5nYW1lU3RhdGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggJ2Nob29zaW5nTGV2ZWwnICk7XHJcbiAgICB0aGlzLmNvbHVtblN0YXRlUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkoIENvbHVtblN0YXRlLCBDb2x1bW5TdGF0ZS5TSU5HTEVfQ09MVU1OICk7XHJcbiAgICB0aGlzLmVsYXBzZWRUaW1lUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgICAvLyBCZXN0IHRpbWVzIGFuZCBzY29yZXMuXHJcbiAgICB0aGlzLmJlc3RUaW1lcyA9IFtdO1xyXG4gICAgdGhpcy5tb3N0UmVjZW50U2NvcmVzID0gW107XHJcbiAgICBfLnRpbWVzKCBNQVhfTEVWRUxTLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuYmVzdFRpbWVzLnB1c2goIG51bGwgKTtcclxuICAgICAgdGhpcy5tb3N0UmVjZW50U2NvcmVzLnB1c2goIG5ldyBQcm9wZXJ0eSggMCApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ291bnRlciB1c2VkIHRvIHRyYWNrIG51bWJlciBvZiBpbmNvcnJlY3QgYW5zd2Vycy5cclxuICAgIHRoaXMuaW5jb3JyZWN0R3Vlc3Nlc09uQ3VycmVudENoYWxsZW5nZSA9IDA7XHJcblxyXG4gICAgLy8gQ3VycmVudCBzZXQgb2YgY2hhbGxlbmdlcywgd2hpY2ggY29sbGVjdGl2ZWx5IGNvbXByaXNlIGEgc2luZ2xlIGxldmVsLCBvblxyXG4gICAgLy8gd2hpY2ggdGhlIHVzZXIgaXMgY3VycmVudGx5IHdvcmtpbmcuXHJcbiAgICB0aGlzLmNoYWxsZW5nZUxpc3QgPSBudWxsO1xyXG5cclxuICAgIC8vIEZpeGVkIG1hc3NlcyB0aGF0IHNpdCBvbiB0aGUgcGxhbmsgYW5kIHRoYXQgdGhlIHVzZXIgbXVzdCBhdHRlbXB0IHRvIGJhbGFuY2UuXHJcbiAgICB0aGlzLmZpeGVkTWFzc2VzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gICAgLy8gTWFzc2VzIHRoYXQgdGhlIHVzZXIgbW92ZXMgb24gdG8gdGhlIHBsYW5rIHRvIGNvdW50ZXJiYWxhbmNlIHRoZSBmaXhlZCBtYXNzZXMuXHJcbiAgICB0aGlzLm1vdmFibGVNYXNzZXMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuXHJcbiAgICAvLyBNYXNzZXMgdGhhdCB0aGUgdXNlciBpcyAob3IgdXNlcnMgYXJlKSBtb3ZpbmcuXHJcbiAgICB0aGlzLnVzZXJDb250cm9sbGVkTWFzc2VzID0gW107XHJcblxyXG4gICAgLy8gQWRkIHRoZSBwbGFuay5cclxuICAgIHRoaXMucGxhbmsgPSBuZXcgUGxhbmsoIG5ldyBWZWN0b3IyKCAwLCBQTEFOS19IRUlHSFQgKSwgbmV3IFZlY3RvcjIoIDAsIEZVTENSVU1fSEVJR0hUICksIHRoaXMuY29sdW1uU3RhdGVQcm9wZXJ0eSwgdGhpcy51c2VyQ29udHJvbGxlZE1hc3NlcyxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BsYW5rJyApICk7XHJcblxyXG4gICAgLy8gVGlsdGVkIHN1cHBvcnQgY29sdW1uLiAgSW4gdGhpcyBtb2RlbCwgdGhlcmUgaXMgb25seSBvbmUuXHJcbiAgICBjb25zdCB0aWx0ZWRTdXBwb3J0Q29sdW1uWFBvcyA9IDEuODsgLy8gTWV0ZXJzLCBlbXBpcmljYWxseSBjaG9zZW4gdG8gbG9vayBnb29kLlxyXG4gICAgdGhpcy50aWx0ZWRTdXBwb3J0Q29sdW1uID0gbmV3IFRpbHRlZFN1cHBvcnRDb2x1bW4oIFBMQU5LX0hFSUdIVCArIHRpbHRlZFN1cHBvcnRDb2x1bW5YUG9zICogTWF0aC50YW4oIHRoaXMucGxhbmsubWF4VGlsdEFuZ2xlICksXHJcbiAgICAgIHRpbHRlZFN1cHBvcnRDb2x1bW5YUG9zLCAtdGhpcy5wbGFuay5tYXhUaWx0QW5nbGUgKTtcclxuXHJcbiAgICAvLyBMZXZlbCBzdXBwb3J0IGNvbHVtbnMuXHJcbiAgICB0aGlzLmxldmVsU3VwcG9ydENvbHVtbnMgPSBbXHJcbiAgICAgIG5ldyBMZXZlbFN1cHBvcnRDb2x1bW4oIFBMQU5LX0hFSUdIVCwgLTEuNjI1ICksXHJcbiAgICAgIG5ldyBMZXZlbFN1cHBvcnRDb2x1bW4oIFBMQU5LX0hFSUdIVCwgMS42MjUgKVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyBGdWxjcnVtIG9uIHdoaWNoIHRoZSBwbGFuayBwaXZvdHNcclxuICAgIHRoaXMuZnVsY3J1bSA9IG5ldyBGdWxjcnVtKCBuZXcgRGltZW5zaW9uMiggMSwgRlVMQ1JVTV9IRUlHSFQgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5wbGFuay5zdGVwKCBkdCApO1xyXG4gICAgdGhpcy5tb3ZhYmxlTWFzc2VzLmZvckVhY2goIG1hc3MgPT4ge1xyXG4gICAgICBtYXNzLnN0ZXAoIGR0ICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmZpeGVkTWFzc2VzLmZvckVhY2goIG1hc3MgPT4ge1xyXG4gICAgICBtYXNzLnN0ZXAoIGR0ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnRpbWVyRW5hYmxlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmxldmVsUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zY29yZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmdhbWVTdGF0ZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNvbHVtblN0YXRlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5tb3N0UmVjZW50U2NvcmVzLmZvckVhY2goIG1vc3RSZWNlbnRTY29yZVByb3BlcnR5ID0+IHsgbW9zdFJlY2VudFNjb3JlUHJvcGVydHkucmVzZXQoKTsgfSApO1xyXG4gICAgdGhpcy5iZXN0VGltZXMgPSBbXTtcclxuICAgIF8udGltZXMoIE1BWF9MRVZFTFMsICgpID0+IHtcclxuICAgICAgdGhpcy5iZXN0VGltZXMucHVzaCggbnVsbCApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0YXJ0TGV2ZWwoIGxldmVsICkge1xyXG4gICAgdGhpcy5sZXZlbFByb3BlcnR5LnNldCggbGV2ZWwgKTtcclxuICAgIHRoaXMuc2NvcmVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VJbmRleFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnJlc3RhcnRHYW1lVGltZXIoKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgdGhlIGNoYWxsZW5nZXMuXHJcbiAgICB0aGlzLmNoYWxsZW5nZUxpc3QgPSBCYWxhbmNlR2FtZUNoYWxsZW5nZUZhY3RvcnkuZ2VuZXJhdGVDaGFsbGVuZ2VTZXQoIGxldmVsICk7XHJcblxyXG4gICAgLy8gU2V0IHVwIHRoZSBtb2RlbCBmb3IgdGhlIG5leHQgY2hhbGxlbmdlXHJcbiAgICB0aGlzLnNldENoYWxsZW5nZSggdGhpcy5jaGFsbGVuZ2VMaXN0WyAwIF0sIHRoaXMuY2hhbGxlbmdlTGlzdFsgMCBdLmluaXRpYWxDb2x1bW5TdGF0ZSApO1xyXG5cclxuICAgIC8vIENoYW5nZSB0byBuZXcgZ2FtZSBzdGF0ZS5cclxuICAgIHRoaXMuZ2FtZVN0YXRlUHJvcGVydHkuc2V0KCAncHJlc2VudGluZ0ludGVyYWN0aXZlQ2hhbGxlbmdlJyApO1xyXG5cclxuICAgIC8vIEZsYWcgc2V0IHRvIGluZGljYXRlIG5ldyBiZXN0IHRpbWUsIGNsZWFyZWQgZWFjaCB0aW1lIGEgbGV2ZWwgaXMgc3RhcnRlZC5cclxuICAgIHRoaXMubmV3QmVzdFRpbWUgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBiYWxhbmNlQ2hhbGxlbmdlXHJcbiAgICogQHBhcmFtIGNvbHVtblN0YXRlXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzZXRDaGFsbGVuZ2UoIGJhbGFuY2VDaGFsbGVuZ2UsIGNvbHVtblN0YXRlICkge1xyXG5cclxuICAgIC8vIENsZWFyIG91dCB0aGUgcHJldmlvdXMgY2hhbGxlbmdlIChpZiB0aGVyZSB3YXMgb25lKS4gIFN0YXJ0IGJ5IHJlc2V0dGluZyB0aGUgcGxhbmsuXHJcbiAgICB0aGlzLnBsYW5rLnJlbW92ZUFsbE1hc3NlcygpO1xyXG4gICAgdGhpcy51c2VyQ29udHJvbGxlZE1hc3Nlcy5sZW5ndGggPSAwO1xyXG5cclxuICAgIC8vIEZvcmNlIHRoZSBwbGFuayB0byBiZSBsZXZlbCBhbmQgc3RpbGwuICBUaGlzIHByZXZlbnRzIGFueSBmbG9hdGluZyBwb2ludCBpbmFjY3VyYWNpZXMgd2hlbiBhZGRpbmcgbWFzc2VzLlxyXG4gICAgdGhpcy5jb2x1bW5TdGF0ZVByb3BlcnR5LnNldCggQ29sdW1uU3RhdGUuRE9VQkxFX0NPTFVNTlMgKTtcclxuXHJcbiAgICAvLyBDbGVhciBvdXQgdGhlIG1hc3NlcyBmcm9tIHRoZSBwcmV2aW91cyBjaGFsbGVuZ2UuXHJcbiAgICB0aGlzLmZpeGVkTWFzc2VzLmNsZWFyKCk7XHJcbiAgICB0aGlzLm1vdmFibGVNYXNzZXMuY2xlYXIoKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgdGhlIG5ldyBjaGFsbGVuZ2UuXHJcbiAgICBiYWxhbmNlQ2hhbGxlbmdlLmZpeGVkTWFzc0Rpc3RhbmNlUGFpcnMuZm9yRWFjaCggZml4ZWRNYXNzRGlzdGFuY2VQYWlyID0+IHtcclxuICAgICAgdGhpcy5maXhlZE1hc3Nlcy5wdXNoKCBmaXhlZE1hc3NEaXN0YW5jZVBhaXIubWFzcyApO1xyXG4gICAgICB0aGlzLnBsYW5rLmFkZE1hc3NUb1N1cmZhY2VBdCggZml4ZWRNYXNzRGlzdGFuY2VQYWlyLm1hc3MsIGZpeGVkTWFzc0Rpc3RhbmNlUGFpci5kaXN0YW5jZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGJhbGFuY2VDaGFsbGVuZ2UubW92YWJsZU1hc3Nlcy5mb3JFYWNoKCBtYXNzID0+IHtcclxuICAgICAgY29uc3QgaW5pdGlhbFBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIDMsIDAgKTtcclxuICAgICAgbWFzcy5wb3NpdGlvblByb3BlcnR5LnNldCggaW5pdGlhbFBvc2l0aW9uICk7XHJcbiAgICAgIG1hc3MudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCB1c2VyQ29udHJvbGxlZCA9PiB7XHJcbiAgICAgICAgaWYgKCB1c2VyQ29udHJvbGxlZCApIHtcclxuICAgICAgICAgIHRoaXMudXNlckNvbnRyb2xsZWRNYXNzZXMucHVzaCggbWFzcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIFRoZSB1c2VyIGhhcyBkcm9wcGVkIHRoaXMgbWFzcy5cclxuICAgICAgICAgIHRoaXMudXNlckNvbnRyb2xsZWRNYXNzZXMuc3BsaWNlKCB0aGlzLnVzZXJDb250cm9sbGVkTWFzc2VzLmluZGV4T2YoIG1hc3MgKSwgMSApO1xyXG4gICAgICAgICAgaWYgKCAhdGhpcy5wbGFuay5hZGRNYXNzVG9TdXJmYWNlKCBtYXNzICkgKSB7XHJcbiAgICAgICAgICAgIC8vIFRoZSBhdHRlbXB0IHRvIGFkZCB0aGlzIG1hc3MgdG8gc3VyZmFjZSBvZiBwbGFuayBmYWlsZWQsXHJcbiAgICAgICAgICAgIC8vIHByb2JhYmx5IGJlY2F1c2UgdGhlIG1hc3Mgd2Fzbid0IG92ZXIgdGhlIHBsYW5rIG9yIHRoZXJlXHJcbiAgICAgICAgICAgIC8vIHdhc24ndCBvbiBvcGVuIHNwb3QgbmVhciB3aGVyZSBpdCB3YXMgcmVsZWFzZWQuXHJcbiAgICAgICAgICAgIG1hc3MucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIGluaXRpYWxQb3NpdGlvbiApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLm1vdmFibGVNYXNzZXMuYWRkKCBtYXNzICk7XHJcblxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFNldCB0aGUgY29sdW1uIHN0YXRlLlxyXG4gICAgdGhpcy5jb2x1bW5TdGF0ZVByb3BlcnR5LnNldCggY29sdW1uU3RhdGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtCYWxhbmNlTWFzc2VzQ2hhbGxlbmdlfG51bGx9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldEN1cnJlbnRDaGFsbGVuZ2UoKSB7XHJcbiAgICBpZiAoIHRoaXMuY2hhbGxlbmdlTGlzdCA9PT0gbnVsbCB8fCB0aGlzLmNoYWxsZW5nZUxpc3Quc2l6ZSA8PSB0aGlzLmNoYWxsZW5nZUluZGV4UHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuY2hhbGxlbmdlTGlzdFsgdGhpcy5jaGFsbGVuZ2VJbmRleFByb3BlcnR5LmdldCgpIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRDaGFsbGVuZ2VDdXJyZW50UG9pbnRWYWx1ZSgpIHtcclxuICAgIHJldHVybiBNQVhfUE9JTlRTX1BFUl9QUk9CTEVNIC0gdGhpcy5pbmNvcnJlY3RHdWVzc2VzT25DdXJyZW50Q2hhbGxlbmdlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgdGhlIHVzZXIncyBwcm9wb3NlZCBhbnN3ZXIuICBVc2VkIG92ZXJsb2FkZWQgZnVuY3Rpb25zIGluIHRoZSBvcmlnaW5hbCBKYXZhIHNpbSwgYSBsaXR0bGUgdWdseSB3aGVuIHBvcnRlZC5cclxuICAgKiBAcGFyYW0gbWFzc1xyXG4gICAqIEBwYXJhbSB0aWx0UHJlZGljdGlvblxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjaGVja0Fuc3dlciggbWFzcywgdGlsdFByZWRpY3Rpb24gKSB7XHJcbiAgICBpZiAoIHRoaXMuZ2V0Q3VycmVudENoYWxsZW5nZSgpIGluc3RhbmNlb2YgQmFsYW5jZU1hc3Nlc0NoYWxsZW5nZSApIHtcclxuXHJcbiAgICAgIC8vIFR1cm4gb2ZmIHRoZSBjb2x1bW4ocykgc28gdGhhdCB0aGUgcGxhbmsgY2FuIG1vdmUuXHJcbiAgICAgIHRoaXMuY29sdW1uU3RhdGVQcm9wZXJ0eS5zZXQoIENvbHVtblN0YXRlLk5PX0NPTFVNTlMgKTtcclxuXHJcbiAgICAgIHRoaXMuaGFuZGxlUHJvcG9zZWRBbnN3ZXIoIHRoaXMucGxhbmsuaXNCYWxhbmNlZCgpICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5nZXRDdXJyZW50Q2hhbGxlbmdlKCkgaW5zdGFuY2VvZiBUaWx0UHJlZGljdGlvbkNoYWxsZW5nZSApIHtcclxuXHJcbiAgICAgIGNvbnN0IGlzQW5zd2VyQ29ycmVjdCA9ICggdGlsdFByZWRpY3Rpb24gPT09ICd0aWx0RG93bk9uTGVmdFNpZGUnICYmIHRoaXMucGxhbmsuZ2V0VG9ycXVlRHVlVG9NYXNzZXMoKSA+IDAgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIHRpbHRQcmVkaWN0aW9uID09PSAndGlsdERvd25PblJpZ2h0U2lkZScgJiYgdGhpcy5wbGFuay5nZXRUb3JxdWVEdWVUb01hc3NlcygpIDwgMCApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggdGlsdFByZWRpY3Rpb24gPT09ICdzdGF5QmFsYW5jZWQnICYmIHRoaXMucGxhbmsuZ2V0VG9ycXVlRHVlVG9NYXNzZXMoKSA9PT0gMCApO1xyXG5cclxuICAgICAgaWYgKCBpc0Fuc3dlckNvcnJlY3QgKSB7XHJcbiAgICAgICAgLy8gVHVybiBvZmYgdGhlIGNvbHVtbihzKSBzbyB0aGF0IHRoZSBwbGFuayBjYW4gbW92ZS5cclxuICAgICAgICB0aGlzLmNvbHVtblN0YXRlUHJvcGVydHkuc2V0KCBDb2x1bW5TdGF0ZS5OT19DT0xVTU5TICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaGFuZGxlUHJvcG9zZWRBbnN3ZXIoIGlzQW5zd2VyQ29ycmVjdCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuZ2V0Q3VycmVudENoYWxsZW5nZSgpIGluc3RhbmNlb2YgTWFzc0RlZHVjdGlvbkNoYWxsZW5nZSApIHtcclxuICAgICAgdGhpcy5oYW5kbGVQcm9wb3NlZEFuc3dlciggbWFzcyA9PT0gdGhpcy5nZXRUb3RhbEZpeGVkTWFzc1ZhbHVlKCkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYW5zd2VySXNDb3JyZWN0XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBoYW5kbGVQcm9wb3NlZEFuc3dlciggYW5zd2VySXNDb3JyZWN0ICkge1xyXG4gICAgbGV0IHBvaW50c0Vhcm5lZCA9IDA7XHJcbiAgICBpZiAoIGFuc3dlcklzQ29ycmVjdCApIHtcclxuICAgICAgLy8gVGhlIHVzZXIgYW5zd2VyZWQgdGhlIGNoYWxsZW5nZSBjb3JyZWN0bHkuXHJcbiAgICAgIHRoaXMuZ2FtZVN0YXRlUHJvcGVydHkuc2V0KCAnc2hvd2luZ0NvcnJlY3RBbnN3ZXJGZWVkYmFjaycgKTtcclxuICAgICAgaWYgKCB0aGlzLmluY29ycmVjdEd1ZXNzZXNPbkN1cnJlbnRDaGFsbGVuZ2UgPT09IDAgKSB7XHJcbiAgICAgICAgLy8gVXNlciBnb3QgaXQgcmlnaHQgdGhlIGZpcnN0IHRpbWUuXHJcbiAgICAgICAgcG9pbnRzRWFybmVkID0gTUFYX1BPSU5UU19QRVJfUFJPQkxFTTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBVc2VyIGdvdCBpdCB3cm9uZyBhdCBmaXJzdCwgYnV0IGdvdCBpdCByaWdodCBub3cuXHJcbiAgICAgICAgcG9pbnRzRWFybmVkID0gTUFYX1BPSU5UU19QRVJfUFJPQkxFTSAtIHRoaXMuaW5jb3JyZWN0R3Vlc3Nlc09uQ3VycmVudENoYWxsZW5nZTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnNjb3JlUHJvcGVydHkudmFsdWUgKz0gcG9pbnRzRWFybmVkO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIFRoZSB1c2VyIGdvdCBpdCB3cm9uZy5cclxuICAgICAgdGhpcy5pbmNvcnJlY3RHdWVzc2VzT25DdXJyZW50Q2hhbGxlbmdlKys7XHJcbiAgICAgIGlmICggdGhpcy5pbmNvcnJlY3RHdWVzc2VzT25DdXJyZW50Q2hhbGxlbmdlIDwgdGhpcy5nZXRDdXJyZW50Q2hhbGxlbmdlKCkubWF4QXR0ZW1wdHNBbGxvd2VkICkge1xyXG4gICAgICAgIHRoaXMuZ2FtZVN0YXRlUHJvcGVydHkuc2V0KCAnc2hvd2luZ0luY29ycmVjdEFuc3dlckZlZWRiYWNrVHJ5QWdhaW4nICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5nYW1lU3RhdGVQcm9wZXJ0eS5zZXQoICdzaG93aW5nSW5jb3JyZWN0QW5zd2VyRmVlZGJhY2tNb3ZlT24nICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBuZXdHYW1lKCkge1xyXG4gICAgdGhpcy5zdG9wR2FtZVRpbWVyKCk7XHJcbiAgICB0aGlzLmdhbWVTdGF0ZVByb3BlcnR5LnNldCggJ2Nob29zaW5nTGV2ZWwnICk7XHJcbiAgICB0aGlzLmluY29ycmVjdEd1ZXNzZXNPbkN1cnJlbnRDaGFsbGVuZ2UgPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG5leHRDaGFsbGVuZ2UoKSB7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUluZGV4UHJvcGVydHkudmFsdWUrKztcclxuICAgIHRoaXMuaW5jb3JyZWN0R3Vlc3Nlc09uQ3VycmVudENoYWxsZW5nZSA9IDA7XHJcbiAgICBpZiAoIHRoaXMuY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eS5nZXQoKSA8IHRoaXMuY2hhbGxlbmdlTGlzdC5sZW5ndGggKSB7XHJcbiAgICAgIC8vIE1vdmUgdG8gdGhlIG5leHQgY2hhbGxlbmdlLlxyXG4gICAgICB0aGlzLnNldENoYWxsZW5nZSggdGhpcy5nZXRDdXJyZW50Q2hhbGxlbmdlKCksIHRoaXMuZ2V0Q3VycmVudENoYWxsZW5nZSgpLmluaXRpYWxDb2x1bW5TdGF0ZSApO1xyXG4gICAgICB0aGlzLmdhbWVTdGF0ZVByb3BlcnR5LnNldCggJ3ByZXNlbnRpbmdJbnRlcmFjdGl2ZUNoYWxsZW5nZScgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBBbGwgY2hhbGxlbmdlcyBjb21wbGV0ZWQgZm9yIHRoaXMgbGV2ZWwuICBTZWUgaWYgdGhpcyBpcyBhIG5ld1xyXG4gICAgICAvLyBiZXN0IHRpbWUgYW5kLCBpZiBzbywgcmVjb3JkIGl0LlxyXG4gICAgICBjb25zdCBsZXZlbCA9IHRoaXMubGV2ZWxQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgaWYgKCB0aGlzLnNjb3JlUHJvcGVydHkuZ2V0KCkgPT09IE1BWF9TQ09SRV9QRVJfR0FNRSApIHtcclxuICAgICAgICAvLyBQZXJmZWN0IGdhbWUuICBTZWUgaWYgbmV3IGJlc3QgdGltZS5cclxuICAgICAgICBpZiAoIHRoaXMuYmVzdFRpbWVzWyBsZXZlbCBdID09PSBudWxsIHx8IHRoaXMuZWxhcHNlZFRpbWVQcm9wZXJ0eS5nZXQoKSA8IHRoaXMuYmVzdFRpbWVzWyBsZXZlbCBdICkge1xyXG4gICAgICAgICAgdGhpcy5uZXdCZXN0VGltZSA9IHRoaXMuYmVzdFRpbWVzWyBsZXZlbCBdICE9PSBudWxsOyAvLyBEb24ndCBzZXQgdGhpcyBmbGFnIGZvciB0aGUgZmlyc3QgJ2Jlc3QgdGltZScsIG9ubHkgd2hlbiB0aGUgdGltZSBpbXByb3Zlcy5cclxuICAgICAgICAgIHRoaXMuYmVzdFRpbWVzWyBsZXZlbCBdID0gdGhpcy5lbGFwc2VkVGltZVByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1vc3RSZWNlbnRTY29yZXNbIGxldmVsIF0udmFsdWUgPSB0aGlzLnNjb3JlUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgICAvLyBEb25lIHdpdGggdGhpcyBnYW1lLCBzaG93IHRoZSByZXN1bHRzLlxyXG4gICAgICB0aGlzLmdhbWVTdGF0ZVByb3BlcnR5LnNldCggJ3Nob3dpbmdMZXZlbFJlc3VsdHMnICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdHJ5QWdhaW4oKSB7XHJcblxyXG4gICAgLy8gUmVzdG9yZSB0aGUgY29sdW1uKHMpIHRvIHRoZSBvcmlnaW5hbCBzdGF0ZSBidXQgZG9uJ3QgbW92ZSB0aGUgbWFzc2VzIGFueXdoZXJlLiAgVGhpcyBtYWtlcyBpdCBlYXNpZXIgZm9yIHRoZVxyXG4gICAgLy8gdXNlcnMgdG8gc2VlIHdoeSB0aGVpciBhbnN3ZXIgd2FzIGluY29ycmVjdC5cclxuICAgIHRoaXMuY29sdW1uU3RhdGVQcm9wZXJ0eS5zZXQoIHRoaXMuZ2V0Q3VycmVudENoYWxsZW5nZSgpLmluaXRpYWxDb2x1bW5TdGF0ZSApO1xyXG4gICAgdGhpcy5nYW1lU3RhdGVQcm9wZXJ0eS5zZXQoICdwcmVzZW50aW5nSW50ZXJhY3RpdmVDaGFsbGVuZ2UnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcGxheUNvcnJlY3RBbnN3ZXIoKSB7XHJcbiAgICBjb25zdCBjdXJyZW50Q2hhbGxlbmdlID0gdGhpcy5nZXRDdXJyZW50Q2hhbGxlbmdlKCk7XHJcblxyXG4gICAgLy8gUHV0IHRoZSBjaGFsbGVuZ2UgaW4gaXRzIGluaXRpYWwgc3RhdGUsIGJ1dCB3aXRoIHRoZSBjb2x1bW5zIHR1cm5lZCBvZmYuXHJcbiAgICB0aGlzLnNldENoYWxsZW5nZSggY3VycmVudENoYWxsZW5nZSwgQ29sdW1uU3RhdGUuTk9fQ09MVU1OUyApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgbW92YWJsZSBtYXNzIG9yIG1hc3NlcyB0byB0aGUgcGxhbmsgYWNjb3JkaW5nIHRvIHRoZSBzb2x1dGlvbi5cclxuICAgIGN1cnJlbnRDaGFsbGVuZ2UuYmFsYW5jZWRDb25maWd1cmF0aW9uLmZvckVhY2goIG1hc3NEaXN0YW5jZVBhaXIgPT4ge1xyXG4gICAgICB0aGlzLnBsYW5rLmFkZE1hc3NUb1N1cmZhY2VBdCggbWFzc0Rpc3RhbmNlUGFpci5tYXNzLCBtYXNzRGlzdGFuY2VQYWlyLmRpc3RhbmNlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBnYW1lIHN0YXRlLlxyXG4gICAgdGhpcy5nYW1lU3RhdGVQcm9wZXJ0eS5zZXQoICdkaXNwbGF5aW5nQ29ycmVjdEFuc3dlcicgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRUaXBEaXJlY3Rpb24oKSB7XHJcbiAgICBpZiAoIHRoaXMucGxhbmsuZ2V0VG9ycXVlRHVlVG9NYXNzZXMoKSA8IDAgKSB7XHJcbiAgICAgIHJldHVybiAndGlsdERvd25PblJpZ2h0U2lkZSc7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5wbGFuay5nZXRUb3JxdWVEdWVUb01hc3NlcygpID4gMCApIHtcclxuICAgICAgcmV0dXJuICd0aWx0RG93bk9uTGVmdFNpZGUnO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiAnc3RheUJhbGFuY2VkJztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRUb3RhbEZpeGVkTWFzc1ZhbHVlKCkge1xyXG4gICAgbGV0IHRvdGFsTWFzcyA9IDA7XHJcbiAgICB0aGlzLmdldEN1cnJlbnRDaGFsbGVuZ2UoKS5maXhlZE1hc3NEaXN0YW5jZVBhaXJzLmZvckVhY2goIG1hc3NEaXN0YW5jZVBhaXIgPT4ge1xyXG4gICAgICB0b3RhbE1hc3MgKz0gbWFzc0Rpc3RhbmNlUGFpci5tYXNzLm1hc3NWYWx1ZTtcclxuICAgIH0gKTtcclxuICAgIHJldHVybiB0b3RhbE1hc3M7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzdGFydEdhbWVUaW1lcigpIHtcclxuICAgIGlmICggdGhpcy5nYW1lVGltZXJJZCAhPT0gbnVsbCApIHtcclxuICAgICAgc3RlcFRpbWVyLmNsZWFySW50ZXJ2YWwoIHRoaXMuZ2FtZVRpbWVySWQgKTtcclxuICAgIH1cclxuICAgIHRoaXMuZWxhcHNlZFRpbWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5nYW1lVGltZXJJZCA9IHN0ZXBUaW1lci5zZXRJbnRlcnZhbCggKCkgPT4geyB0aGlzLmVsYXBzZWRUaW1lUHJvcGVydHkudmFsdWUgKz0gMTsgfSwgMTAwMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0b3BHYW1lVGltZXIoKSB7XHJcbiAgICBzdGVwVGltZXIuY2xlYXJJbnRlcnZhbCggdGhpcy5nYW1lVGltZXJJZCApO1xyXG4gICAgdGhpcy5nYW1lVGltZXJJZCA9IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuLy8gc3RhdGljc1xyXG5CYWxhbmNlR2FtZU1vZGVsLlBST0JMRU1TX1BFUl9MRVZFTCA9IENIQUxMRU5HRVNfUEVSX1BST0JMRU1fU0VUO1xyXG5CYWxhbmNlR2FtZU1vZGVsLk1BWF9QT1NTSUJMRV9TQ09SRSA9IE1BWF9QT0lOVFNfUEVSX1BST0JMRU0gKiBDSEFMTEVOR0VTX1BFUl9QUk9CTEVNX1NFVDtcclxuXHJcbmJhbGFuY2luZ0FjdC5yZWdpc3RlciggJ0JhbGFuY2VHYW1lTW9kZWwnLCBCYWxhbmNlR2FtZU1vZGVsICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCYWxhbmNlR2FtZU1vZGVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFF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