// Copyright 2013-2023, University of Colorado Boulder

/**
 * BaseGameModel is the base class for LineGameModel and GSILineGameModel.
 *
 * Responsibilities include:
 * - creation of challenges (delegated to factory)
 * - management of game state
 * - management of game results
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GameTimer from '../../../../vegas/js/GameTimer.js';
import GLConstants from '../../common/GLConstants.js';
import GLQueryParameters from '../../common/GLQueryParameters.js';
import Line from '../../common/model/Line.js';
import graphingLines from '../../graphingLines.js';
import BaseChallengeFactory from './BaseChallengeFactory.js';
import Challenge from './Challenge.js';
import EquationForm from './EquationForm.js';
import GamePhase from './GamePhase.js';
import GraphTheLine from './GraphTheLine.js';
import ManipulationMode from './ManipulationMode.js';
import PlayState from './PlayState.js';

// constants
const INITIAL_GAME_PHASE = GamePhase.SETTINGS;
const CHALLENGES_PER_GAME = 6;
const DUMMY_CHALLENGE = new GraphTheLine( '', Line.createSlopeIntercept( 1, 1, 1 ),
  EquationForm.SLOPE_INTERCEPT, ManipulationMode.SLOPE, GLConstants.X_AXIS_RANGE, GLConstants.Y_AXIS_RANGE );

export default class BaseGameModel {

  private readonly challengeFactories: BaseChallengeFactory[];
  public readonly levelProperty: Property<number>;
  public readonly soundEnabledProperty: Property<boolean>;
  public readonly timerEnabledProperty: Property<boolean>;
  public readonly scoreProperty: Property<number>; // how many points the user has earned for the current game
  public readonly challengeProperty: Property<Challenge>;
  public readonly challengeIndexProperty: Property<number>;
  public readonly challengesPerGameProperty: Property<number>;
  public readonly playStateProperty: EnumerationProperty<PlayState>;

  public challenges: Challenge[];
  public readonly timer: GameTimer;
  public readonly numberOfLevels: number;
  public readonly maxPointsPerChallenge: number;
  public readonly bestScoreProperties: Property<number>[];
  public readonly bestTimeProperties: Property<number | null>[]; // null if a level has no best time yet
  public isNewBestTime: boolean;
  public readonly gamePhaseProperty: EnumerationProperty<GamePhase>; // set this using setGamePhase

  protected constructor( challengeFactories: BaseChallengeFactory[], tandem: Tandem ) {

    this.challengeFactories = challengeFactories;

    this.levelProperty = new NumberProperty( 0, {
      numberType: 'Integer'
    } );

    this.soundEnabledProperty = new BooleanProperty( true );

    this.timerEnabledProperty = new BooleanProperty( false );

    this.scoreProperty = new NumberProperty( 0, {
      numberType: 'Integer'
    } );

    this.challengeProperty = new Property<Challenge>( DUMMY_CHALLENGE );

    this.challengeIndexProperty = new NumberProperty( 0, {
      numberType: 'Integer'
    } );

    this.challengesPerGameProperty = new NumberProperty( CHALLENGES_PER_GAME, {
      numberType: 'Integer'
    } );

    this.playStateProperty = new EnumerationProperty( PlayState.NONE, {
      reentrant: true // see https://github.com/phetsims/graphing-lines/issues/102
    } );

    this.challenges = []; // {Challenge[]}
    this.timer = new GameTimer();
    this.numberOfLevels = challengeFactories.length;
    this.maxPointsPerChallenge = 2;
    this.bestScoreProperties = []; // {NumberProperty[]} best scores for each level
    this.bestTimeProperties = []; // {Property.<number|null>[]} best times for each level, in ms
    this.isNewBestTime = false; // is the time for the most-recently-completed game a new best time?
    for ( let level = 0; level < this.numberOfLevels; level++ ) {
      this.bestScoreProperties.push( new NumberProperty( 0, {
        numberType: 'Integer'
      } ) );
      this.bestTimeProperties.push( new Property<number | null>( null ) );
    }

    this.gamePhaseProperty = new EnumerationProperty( INITIAL_GAME_PHASE );

    this.initChallenges();

    // Do this after initChallenges, because this will fire immediately and needs to have an initial set of challenges.
    // unlink is unnecessary since BaseGameModel exists for the lifetime of the sim.
    this.playStateProperty.link( playState => {

      const challengeIndex = this.challengeIndexProperty.value;
      const isLastChallenge = ( challengeIndex === this.challenges.length - 1 );

      if ( isLastChallenge && ( playState === PlayState.NEXT || playState === PlayState.SHOW_ANSWER ) ) {
        // game over, stop the timer
        this.timer.stop();
      }

      if ( playState === PlayState.FIRST_CHECK ) {

        const level = this.levelProperty.value;
        const score = this.scoreProperty.value;

        if ( isLastChallenge ) {
          // game has been completed
          this.setGamePhase( GamePhase.RESULTS );
          if ( score > this.bestScoreProperties[ level ].value ) {
            this.bestScoreProperties[ level ].value = score;
          }
        }
        else {
          // next challenge
          const nextChallengeIndex = challengeIndex + 1;
          this.challengeIndexProperty.value = nextChallengeIndex;
          this.challengeProperty.value = this.challenges[ nextChallengeIndex ];
        }
      }
      else if ( playState === PlayState.NEXT ) {
        this.challengeProperty.value.setAnswerVisible( true );
      }
    } );

    if ( GLQueryParameters.verifyChallenges ) {
      this.verifyChallenges();
    }
  }

  /**
   * Sets the game phase. Call this instead of setting gamePhaseProperty directly,
   * because there are tasks that needs to be done before listeners are notified.
   */
  public setGamePhase( gamePhase: GamePhase ): void {
    if ( gamePhase !== this.gamePhaseProperty.value ) {

      // Do tasks that need to be done before notifying listeners.
      if ( gamePhase === GamePhase.SETTINGS ) {
        this.playStateProperty.value = PlayState.NONE;
        this.timer.stop();
      }
      else if ( gamePhase === GamePhase.PLAY ) {
        this.initChallenges();
        this.playStateProperty.value = PlayState.FIRST_CHECK;
        this.scoreProperty.value = 0;
        this.timer.start();
      }
      else if ( gamePhase === GamePhase.RESULTS ) {
        this.playStateProperty.value = PlayState.NONE;
        this.updateBestTime();
      }
      else {
        throw new Error( `unsupported game phase: ${gamePhase}` );
      }

      // Change the Property, which notifies listeners
      this.gamePhaseProperty.value = gamePhase;
    }
  }

  public reset(): void {

    this.levelProperty.reset();
    this.soundEnabledProperty.reset();
    this.timerEnabledProperty.reset();
    this.scoreProperty.reset();
    this.challengeProperty.reset();
    this.challengeIndexProperty.reset();
    this.challengesPerGameProperty.reset();
    this.playStateProperty.reset();

    this.setGamePhase( INITIAL_GAME_PHASE );
    this.resetBestScores();
    this.resetBestTimes();

    this.initChallenges(); // takes care of challengeProperty, challengeIndexProperty, challengesPerGameProperty
  }

  // Resets the best score to zero for every level.
  private resetBestScores(): void {
    this.bestScoreProperties.forEach( property => {
      property.value = 0;
    } );
  }

  // Resets the best times to null (no time) for every level.
  private resetBestTimes(): void {
    this.bestTimeProperties.forEach( property => {
      property.value = null;
    } );
  }

  public isPerfectScore(): boolean {
    return ( this.scoreProperty.value === this.getPerfectScore() );
  }

  // Gets the number of points in a perfect score (ie, correct answers for all challenges on the first try)
  public getPerfectScore(): number {
    return this.challenges.length * this.computePoints( 1 );
  }

  // Compute points to be awarded for a correct answer.
  public computePoints( attempts: number ): number {
    return Math.max( 0, this.maxPointsPerChallenge - attempts + 1 );
  }

  /**
   * Skips the current challenge.
   * This is a developer feature.
   * Score and best times are meaningless after using this.
   */
  public skipCurrentChallenge(): void {
    this.playStateProperty.value = PlayState.NEXT;
    this.playStateProperty.value = PlayState.FIRST_CHECK;
  }

  /**
   * Replays the current challenge.
   * This is a developer feature.
   * Score and best times are meaningless after using this.
   */
  public replayCurrentChallenge(): void {
    this.challengeProperty.value.reset();
    this.challengeIndexProperty.value = this.challengeIndexProperty.value - 1;
    this.challengeProperty.value = DUMMY_CHALLENGE; // force an update
    this.playStateProperty.value = PlayState.FIRST_CHECK;
  }

  // Updates the best time for the current level, at the end of a timed game with a perfect score.
  private updateBestTime(): void {
    assert && assert( !this.timer.isRunningProperty.value );
    this.isNewBestTime = false;
    if ( this.timerEnabledProperty.value && this.isPerfectScore() ) {
      const level = this.levelProperty.value;
      const time = this.timer.elapsedTimeProperty.value;
      const bestTime = this.bestTimeProperties[ level ].value;
      if ( !bestTime ) {
        // There was no previous best time for this level.
        this.bestTimeProperties[ level ].value = time;
      }
      else if ( time < bestTime ) {
        // We have a new best time for this level.
        this.bestTimeProperties[ level ].value = time;
        this.isNewBestTime = true;
      }
    }
  }

  // Initializes a new set of challenges for the current level.
  private initChallenges(): void {

    // force update
    this.challengeIndexProperty.value = -1;

    // level
    const level = this.levelProperty.value;
    assert && assert( level >= 0 && level < this.challengeFactories.length );

    // generate challenges
    this.challenges = this.challengeFactories[ level ].createChallenges();
    if ( GLQueryParameters.shuffle ) {
      this.challenges = dotRandom.shuffle( this.challenges );
    }

    // set the number of challenges
    this.challengesPerGameProperty.value = this.challenges.length;
    assert && assert( this.challengesPerGameProperty.value === CHALLENGES_PER_GAME );
  }

  // Verify challenge creation.
  private verifyChallenges(): void {
    console.log( 'begin: verify creation of challenges' );
    for ( let level = 0; level < this.challengeFactories.length; level++ ) {
      console.log( `verifying level ${level}...` );
      for ( let i = 0; i < 2000; i++ ) {
        this.challengeFactories[ level ].createChallenges();
      }
    }
    console.log( 'end: verify creation of challenges' );
  }
}

graphingLines.register( 'BaseGameModel', BaseGameModel );