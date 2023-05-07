// Copyright 2014-2023, University of Colorado Boulder

/**
 * Model for the 'Game' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import TModel from '../../../../joist/js/TModel.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GameTimer from '../../../../vegas/js/GameTimer.js';
import RPALConstants from '../../common/RPALConstants.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import Challenge from './Challenge.js';
import ChallengeFactory from './ChallengeFactory.js';
import GamePhase from './GamePhase.js';
import GameVisibility from './GameVisibility.js';
import PlayState from './PlayState.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';

const POINTS_FIRST_CHECK = 2;
const POINTS_SECOND_CHECK = 1;

type SelfOptions = {
  level?: number; // the current level in the game, numbered starting with zero
  numberOfLevels?: number; // number of levels in the game
  maxQuantity?: number; // maximum quantity of any substance in a reaction
};

type GameModelOptions = SelfOptions;

export default class GameModel implements TModel {

  public readonly numberOfLevels: number;
  public readonly maxQuantity: number;

  public readonly timerEnabledProperty: Property<boolean>; // is the timer turned on?
  public readonly gameVisibilityProperty: EnumerationProperty<GameVisibility>;

  // the current level, starts at 0 in the model, presented as starting from 1 in the view
  public readonly levelProperty: Property<number>;

  // how many points the user has earned for the current game
  public readonly scoreProperty: Property<number>;

  // the number of challenges in the current game being played
  public readonly numberOfChallengesProperty: Property<number>;

  // the current challenge being played, null if there's no challenge
  public readonly challengeProperty: Property<Challenge | null>;

  // the index of the current challenge, -1 indicates no challenge
  public readonly challengeIndexProperty: Property<number>;

  // the current 'phase' of the game
  public readonly gamePhaseProperty: EnumerationProperty<GamePhase>;

  // the current 'play state' of the game
  public readonly playStateProperty: EnumerationProperty<PlayState>;

  // These fields should be treated as read-only. They are changed by GameModel as game-play progresses.
  public challenges: Challenge[]; // the set of challenges for the current game being played
  public readonly bestScoreProperties: Property<number>[]; // best scores for each level
  public readonly bestTimeProperties: Property<number | null>[]; // best times for each level, null if a level has no best time yet
  public isNewBestTime: boolean; // is the time for the most-recently-completed game a new best time?

  public readonly timer: GameTimer;

  public constructor( tandem: Tandem, providedOptions?: GameModelOptions ) {

    const options = optionize<GameModelOptions, SelfOptions>()( {

      // SelfOptions
      level: 0,
      numberOfLevels: 3,
      maxQuantity: RPALConstants.QUANTITY_RANGE.max
    }, providedOptions );

    this.numberOfLevels = options.numberOfLevels;
    this.maxQuantity = options.maxQuantity;

    this.timerEnabledProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'timerEnabledProperty' )
    } );

    this.gameVisibilityProperty = new EnumerationProperty( GameVisibility.SHOW_ALL, {
      tandem: tandem.createTandem( 'gameVisibilityProperty' )
    } );

    // read-only
    this.levelProperty = new NumberProperty( 0, {
      numberType: 'Integer',
      hasListenerOrderDependencies: true, // TODO: https://github.com/phetsims/reactants-products-and-leftovers/issues/85
      range: new Range( 0, this.numberOfLevels - 1 ),
      tandem: tandem.createTandem( 'levelProperty' )
    } );

    this.scoreProperty = new NumberProperty( 0, {
      numberType: 'Integer',
      isValidValue: value => ( value >= 0 ),
      tandem: tandem.createTandem( 'scoreProperty' )
    } );

    this.numberOfChallengesProperty = new NumberProperty( 0, {
      numberType: 'Integer',
      //TODO https://github.com/phetsims/reactants-products-and-leftovers/issues/78 range
      isValidValue: value => ( value >= 0 ),
      tandem: tandem.createTandem( 'numberOfChallengesProperty' )
    } );

    this.challengeProperty = new Property<Challenge | null>( null, {
      //TODO https://github.com/phetsims/reactants-products-and-leftovers/issues/78 NullableIO( ChallengeIO )
    } );

    this.challengeIndexProperty = new NumberProperty( -1, {
      numberType: 'Integer',
      //TODO https://github.com/phetsims/reactants-products-and-leftovers/issues/78 range
      isValidValue: value => ( value >= -1 ),
      tandem: tandem.createTandem( 'challengeIndexProperty' )
    } );

    this.gamePhaseProperty = new EnumerationProperty( GamePhase.SETTINGS, {
      tandem: tandem.createTandem( 'gamePhaseProperty' ),
      phetioReadOnly: true
      //TODO https://github.com/phetsims/reactants-products-and-leftovers/issues/78 phetioDocumentation
    } );

    this.playStateProperty = new EnumerationProperty( PlayState.NONE, {
      tandem: tandem.createTandem( 'playStateProperty' ),
      phetioReadOnly: true
      //TODO https://github.com/phetsims/reactants-products-and-leftovers/issues/78 phetioDocumentation
    } );

    // read-only
    this.challenges = [];
    this.bestScoreProperties = [];
    this.bestTimeProperties = [];
    this.isNewBestTime = false;
    const bestScoresTandem = tandem.createTandem( 'bestScores' );
    const bestTimesTandem = tandem.createTandem( 'bestTimes' );
    for ( let level = 0; level < this.numberOfLevels; level++ ) {

      this.bestScoreProperties.push( new NumberProperty( 0, {
        numberType: 'Integer',
        tandem: bestScoresTandem.createTandem( `bestScore${level}Property` )
      } ) );

      this.bestTimeProperties.push( new Property<number | null>( null, {
        tandem: bestTimesTandem.createTandem( `bestTime${level}Property` ),
        phetioValueType: NullableIO( NumberIO )
        //TODO https://github.com/phetsims/reactants-products-and-leftovers/issues/78 phetioDocumentation
      } ) );
    }

    this.timer = new GameTimer();
  }

  public reset(): void {

    // reset Properties
    this.timerEnabledProperty.reset();
    this.gameVisibilityProperty.reset();
    this.levelProperty.reset();
    this.scoreProperty.reset();
    this.numberOfChallengesProperty.reset();
    this.challengeProperty.reset();
    this.challengeIndexProperty.reset();
    this.gamePhaseProperty.reset();
    this.playStateProperty.reset();

    // reset scores and times for each level
    this.bestScoreProperties.forEach( property => {
      property.value = 0;
    } );
    this.bestTimeProperties.forEach( property => {
      property.value = null;
    } );
  }

  // Advances to GamePhase.SETTINGS, shows the user-interface for selecting game settings.
  public settings(): void {
    this.timer.stop();
    this.playStateProperty.value = PlayState.NONE;
    this.gamePhaseProperty.value = GamePhase.SETTINGS; // do this last, so that other stuff is set up before observers are notified
  }

  // Advances to GamePhase.PLAY, to play a game for the specified level.
  public play( level: number ): void {
    assert && assert( this.gamePhaseProperty.value === GamePhase.SETTINGS );
    this.levelProperty.value = level;
    this.scoreProperty.value = 0;
    this.initChallenges();
    this.timer.start();
    this.playStateProperty.value = PlayState.FIRST_CHECK;
    this.gamePhaseProperty.value = GamePhase.PLAY; // do this last, so that other stuff is set up before observers are notified
  }

  // Advances to GamePhase.RESULTS, ends the current game and displays results.
  private results(): void {
    assert && assert( this.gamePhaseProperty.value === GamePhase.PLAY );
    this.timer.stop();
    this.updateBestScore();
    this.updateBestTime();
    this.playStateProperty.value = PlayState.NONE;
    this.gamePhaseProperty.value = GamePhase.RESULTS; // do this last, so that other stuff is set up before observers are notified
  }

  // Checks the current guess.
  public check(): void {
    const playState = this.playStateProperty.value;
    assert && assert( playState === PlayState.FIRST_CHECK || playState === PlayState.SECOND_CHECK );

    const challenge = this.challengeProperty.value!;
    assert && assert( challenge );

    if ( challenge.isCorrect() ) {
      // stop the timer as soon as we successfully complete the last challenge
      if ( this.challengeIndexProperty.value === this.challenges.length - 1 ) {
        this.timer.stop();
      }
      const points = ( playState === PlayState.FIRST_CHECK ) ? POINTS_FIRST_CHECK : POINTS_SECOND_CHECK;
      challenge.points = points;
      this.scoreProperty.value = this.scoreProperty.value + points;
      this.playStateProperty.value = PlayState.NEXT;
    }
    else {
      this.playStateProperty.value = ( playState === PlayState.FIRST_CHECK ) ? PlayState.TRY_AGAIN : PlayState.SHOW_ANSWER;
    }
  }

  // Makes another attempt at solving the challenge.
  public tryAgain(): void {
    assert && assert( this.playStateProperty.value === PlayState.TRY_AGAIN );
    this.playStateProperty.value = PlayState.SECOND_CHECK;
  }

  // Shows the correct answer.
  public showAnswer(): void {
    assert && assert( this.playStateProperty.value === PlayState.SHOW_ANSWER );
    const challenge = this.challengeProperty.value!;
    assert && assert( challenge );
    challenge.showAnswer();
    this.playStateProperty.value = PlayState.NEXT;
  }

  // Advances to the next challenge.
  public next(): void {
    if ( this.challengeIndexProperty.value === this.challenges.length - 1 ) {
      // game has been completed, advance to GamePhase.RESULTS
      this.results();
    }
    else {
      // advance to next challenge
      this.challengeIndexProperty.value = this.challengeIndexProperty.value + 1;
      this.challengeProperty.value = this.challenges[ this.challengeIndexProperty.value ];
      this.playStateProperty.value = PlayState.FIRST_CHECK;
    }
  }

  /**
   * Gets the number of challenges for the specified level.
   */
  public getNumberOfChallenges( level: number ): number {
    return ChallengeFactory.getNumberOfChallenges( level );
  }

  /**
   * Gets the perfect score for the specified level.
   */
  public getPerfectScore( level: number ): number {
    return ChallengeFactory.getNumberOfChallenges( level ) * POINTS_FIRST_CHECK;
  }

  /**
   * Is the current score perfect?
   */
  public isPerfectScore(): boolean {
    return ( this.scoreProperty.value === this.getPerfectScore( this.levelProperty.value ) );
  }

  // Updates the best score for the current level.
  private updateBestScore(): void {
    const level = this.levelProperty.value;
    if ( this.scoreProperty.value > this.bestScoreProperties[ level ].value ) {
      this.bestScoreProperties[ level ].value = this.scoreProperty.value;
    }
  }

  // Updates the best time for the current level, at the end of a timed game with a perfect score.
  private updateBestTime(): void {
    assert && assert( !this.timer.isRunningProperty.value );
    this.isNewBestTime = false;
    if ( this.timerEnabledProperty.value && this.isPerfectScore() ) {
      const level = this.levelProperty.value;
      const time = this.timer.elapsedTimeProperty.value;
      const bestTime = this.bestTimeProperties[ level ].value;
      if ( bestTime === null ) {
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
    this.challenges = ChallengeFactory.createChallenges( this.levelProperty.value, this.maxQuantity, {
      moleculesVisible: ( this.gameVisibilityProperty.value !== GameVisibility.HIDE_MOLECULES ),
      numbersVisible: ( this.gameVisibilityProperty.value !== GameVisibility.HIDE_NUMBERS )
    } );
    this.numberOfChallengesProperty.value = this.challenges.length;
    this.challengeIndexProperty.value = 0;
    this.challengeProperty.value = this.challenges[ this.challengeIndexProperty.value ];
  }

  /**
   * DEBUG: Skips the current challenge. Score and best times are meaningless after using this. This is a developer feature.
   */
  public skipCurrentChallenge(): void {
    this.next();
  }

  /**
   * DEBUG: Replays the current challenge. Score and best times are meaningless after using this. This is a developer feature.
   */
  public replayCurrentChallenge(): void {
    this.challengeProperty.value && this.challengeProperty.value.reset();
    this.playStateProperty.value = PlayState.FIRST_CHECK;
  }
}

reactantsProductsAndLeftovers.register( 'GameModel', GameModel );