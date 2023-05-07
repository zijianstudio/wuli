// Copyright 2019-2022, University of Colorado Boulder

/**
 * Represents a specific challenge (set of fractions/pieces/targets and the given state of its solution).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Anton Ulyanov, Andrey Zelenkov (Mlearner)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import merge from '../../../../phet-core/js/merge.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import FilledPartition from '../../game/model/FilledPartition.js';
import FillType from '../../game/model/FillType.js';
import ShapePartition from '../../game/model/ShapePartition.js';
import MatchPiece from './MatchPiece.js';
import MatchSpot from './MatchSpot.js';
import MatchTarget from './MatchTarget.js';

// constants
const NUM_PAIRS = 6;
const PIECE_COLORS = [
  FractionsCommonColors.shapeBlueProperty,
  FractionsCommonColors.shapeGreenProperty,
  FractionsCommonColors.shapeRedProperty
];

class MatchingChallenge {
  /**
   * @param {number} levelNumber
   * @param {Object} config
   */
  constructor( levelNumber, config ) {

    config = merge( {
      // {Array.<Fraction>}
      fractions: [],

      // {Array.<ShapePartition>} optional
      shapePartitions: [
        ...ShapePartition.PIES,
        ...ShapePartition.HORIZONTAL_BARS,
        ...ShapePartition.VERTICAL_BARS,
        ...ShapePartition.PLUS_SIGNS.filter( shapePartition => shapePartition.length > 3 ),
        ...ShapePartition.GRIDS,
        ...ShapePartition.PYRAMIDS,
        ...ShapePartition.POLYGONS,
        ...ShapePartition.DIAGONAL_LS.filter( shapePartition => shapePartition.length > 2 ),
        ...ShapePartition.INTERLEAVED_LS,
        ShapePartition.TETRIS,
        ShapePartition.SIX_FLOWER,
        ShapePartition.FIVE_POINT,
        ShapePartition.NINJA_STAR,
        ShapePartition.HEX_RING
      ],

      // {boolean}
      hasMixedNumbers: false,

      // {Array.<FillType>} optional
      fillTypes: [
        FillType.SEQUENTIAL
      ],

      // {Array.<number>} optional
      numericScaleFactors: [ 1 ],

      // {Property.<boolean>} optional
      timeVisibleProperty: new BooleanProperty( true ),

      // {number}
      previousBestTime: Number.POSITIVE_INFINITY
    }, config );

    assert && assert( config.fractions.length > 0 );

    // @public {Property.<boolean>}
    this.timeVisibleProperty = config.timeVisibleProperty;

    // @public {number}
    this.levelNumber = levelNumber;
    this.previousBestTime = config.previousBestTime;

    // @public {Property.<MatchingChallenge.State>}
    this.stateProperty = new Property( MatchingChallenge.State.NO_COMPARISON );

    // @public {Property.<number>}
    this.scoreProperty = new NumberProperty( 0 );
    this.lastScoreGainProperty = new NumberProperty( 0 );

    // @public {Property.<boolean>}
    this.wasLastAttemptFailureProperty = new BooleanProperty( false );

    // @public {Property.<number>}
    this.elapsedTimeProperty = new NumberProperty( 0 );

    // @public {boolean}
    this.isNewBestTime = false;

    // @public {Emitter} - Fires correct/incorrect whenever "check" is pressed, based on the result
    this.correctEmitter = new Emitter();
    this.incorrectEmitter = new Emitter();

    // @public {Emitter} - Fires when the challenge is fully completed
    this.completedEmitter = new Emitter();

    // @public {boolean}
    this.isComplete = false;

    // @public {MatchingChallenge} - Set externally if, when going from this challenge to the specified one, there
    // should instead be a "refresh" animation instead of "next" challenge.
    this.refreshedChallenge = null;

    // @public {Array.<MatchSpot>}
    this.sourceSpots = _.range( 0, 2 * NUM_PAIRS ).map( () => new MatchSpot() );
    this.scaleSpots = _.range( 0, 2 ).map( () => new MatchSpot( { isScale: true } ) );

    // @public {Property.<MatchSpot>}
    this.lastChangedScaleSpotProperty = new Property( this.scaleSpots[ 0 ] );
    this.scaleSpots.forEach( scaleSpot => {
      scaleSpot.pieceProperty.lazyLink( () => {
        this.lastChangedScaleSpotProperty.value = scaleSpot;
      } );
    } );

    // @public {Array.<MatchTarget>}
    this.targets = _.range( 0, NUM_PAIRS ).map( () => new MatchTarget() );

    const pieces = [];
    const fractions = dotRandom.shuffle( config.fractions ).slice( 0, NUM_PAIRS );
    const hasGreaterThanOne = _.some( fractions, fraction => Fraction.ONE.isLessThan( fraction ) );

    fractions.forEach( ( fraction, index ) => {
      const scaleFactor = dotRandom.sample( config.numericScaleFactors );
      const scaledFraction = new Fraction( fraction.numerator * scaleFactor, fraction.denominator * scaleFactor );
      const fillType = dotRandom.sample( config.fillTypes );
      const shapePartitions = ShapePartition.supportsDenominator( config.shapePartitions, fraction.denominator );

      [ 0, 1 ].forEach( subIndex => {
        // First (generally 3) fractions should be numbers
        const shapePartition = ( subIndex === 0 && index < NUM_PAIRS / 2 ) ? null : dotRandom.sample( shapePartitions );
        const color = PIECE_COLORS[ ( index + subIndex ) % 3 ];

        const filledPartitions = shapePartition ? FilledPartition.fill( shapePartition, fraction, color, fillType ) : null;
        const piece = new MatchPiece( filledPartitions ? fraction : scaledFraction, filledPartitions, config.hasMixedNumbers, hasGreaterThanOne, {
          grab: () => {
            if ( piece.spotProperty.value ) {
              piece.spotProperty.value.pieceProperty.value = null;
              piece.spotProperty.value = null;
            }
          },
          drop: () => {
            const distanceFunction = spot => spot.positionProperty.value.distance( piece.positionProperty.value );
            const openSpots = [ ...this.sourceSpots, ...this.scaleSpots ].filter( spot => spot.pieceProperty.value === null );
            const closestSpot = _.minBy( [ ...this.sourceSpots, ...this.scaleSpots ], distanceFunction );
            const closestOpenSpot = _.minBy( openSpots, distanceFunction );
            assert && assert( closestOpenSpot );

            // If the user drops the piece on the scale, it will replace any existing piece
            if ( _.includes( this.scaleSpots, closestSpot ) && closestSpot.pieceProperty.value ) {
              const existingPiece = closestSpot.pieceProperty.value;
              existingPiece.moveToSpot( closestOpenSpot );
              closestSpot.pieceProperty.value = null;
              piece.moveToSpot( closestSpot );
            }
            else {
              piece.moveToSpot( closestOpenSpot );
            }
          }
        } );
        pieces.push( piece );
      } );
    } );

    // @public {Array.<MatchPiece>}
    this.pieces = dotRandom.shuffle( pieces );

    // Connect the pieces to the initial source spots
    this.pieces.forEach( ( piece, index ) => {
      const sourceSpot = this.sourceSpots[ index ];

      piece.spotProperty.value = sourceSpot;
      sourceSpot.pieceProperty.value = piece;
    } );

    // @private {Array.<MatchPiece>}
    this.lastFailedPair = [];
    Multilink.multilink( this.scaleSpots.map( scaleSpot => scaleSpot.pieceProperty ), ( leftPiece, rightPiece ) => {
      if ( !leftPiece || !rightPiece ) {
        this.stateProperty.value = MatchingChallenge.State.NO_COMPARISON;
      }
      else if ( this.stateProperty.value === MatchingChallenge.State.NO_COMPARISON &&
                leftPiece &&
                rightPiece &&
                ( !_.includes( this.lastFailedPair, leftPiece ) || !_.includes( this.lastFailedPair, rightPiece ) ) ) {
        this.stateProperty.value = MatchingChallenge.State.COMPARISON;
      }
    } );
  }

  /**
   * Takes the pieces stored in the scale spots, and moves them to the next open target.
   * @public
   */
  collect() {
    const leftPiece = this.scaleSpots[ 0 ].pieceProperty.value;
    const rightPiece = this.scaleSpots[ 1 ].pieceProperty.value;

    const target = _.find( this.targets, target => !target.isFilledProperty.value );

    target.layout( leftPiece, rightPiece );

    // Hook up the spot/piece changes
    this.scaleSpots.forEach( scaleSpot => {
      scaleSpot.pieceProperty.value = null;
    } );

    leftPiece.moveToSpot( target.spots[ 0 ], {
      scale: leftPiece.targetScale
    } );
    rightPiece.moveToSpot( target.spots[ 1 ], {
      scale: rightPiece.targetScale
    } );

    target.isFilledProperty.value = true;
    this.wasLastAttemptFailureProperty.value = false;

    if ( _.every( this.targets, target => target.isFilledProperty.value ) ) {
      const isPerfectRun = this.scoreProperty.value === this.targets.length * 2;
      const isImprovedTime = this.elapsedTimeProperty.value < this.previousBestTime;
      if ( isPerfectRun && isImprovedTime ) {
        this.isNewBestTime = true;
      }

      this.isComplete = true;
      this.completedEmitter.emit();
    }
  }

  /**
   * Compares the pieces stored in the scale spots, with either a "correct" (matching) or "incorrect" answer.
   * @public
   */
  compare() {
    const leftPiece = this.scaleSpots[ 0 ].pieceProperty.value;
    const rightPiece = this.scaleSpots[ 1 ].pieceProperty.value;

    if ( leftPiece.fraction.reduced().equals( rightPiece.fraction.reduced() ) ) {
      const scoreDelta = this.wasLastAttemptFailureProperty.value ? 1 : 2;
      this.lastScoreGainProperty.value = scoreDelta;
      this.stateProperty.value = MatchingChallenge.State.MATCHED;

      this.scoreProperty.value += scoreDelta;

      this.correctEmitter.emit();
    }
    else {
      if ( this.wasLastAttemptFailureProperty.value ) {
        this.stateProperty.value = MatchingChallenge.State.SHOW_ANSWER;
      }
      else {
        this.stateProperty.value = MatchingChallenge.State.TRY_AGAIN;
      }
      this.lastFailedPair = [ leftPiece, rightPiece ];
      this.wasLastAttemptFailureProperty.value = true;
      this.lastScoreGainProperty.value = 0;

      this.incorrectEmitter.emit();
    }
  }

  /**
   * Handles the "try again" press behavior, which will remove the chart and buttons for the given (failed) pair.
   * @public
   */
  tryAgain() {
    this.stateProperty.value = MatchingChallenge.State.NO_COMPARISON;
  }

  /**
   * Given that the scale pieces don't match, it swaps out one with the "correct" piece, and animates both.
   * @public
   */
  showAnswer() {
    const changingSpot = this.lastChangedScaleSpotProperty.value;
    const stationarySpot = this.scaleSpots[ ( this.scaleSpots.indexOf( changingSpot ) + 1 ) % 2 ];
    const discardPiece = changingSpot.pieceProperty.value;
    const matchedPiece = _.find( this.pieces, piece => {
      return _.includes( this.sourceSpots, piece.spotProperty.value ) &&
             piece.fraction.reduced().equals( stationarySpot.pieceProperty.value.fraction.reduced() );
    } );

    // In the case where we are dragging the other pieces that would be required, we won't complete the "show answer".
    if ( !matchedPiece ) {
      return;
    }

    discardPiece.moveToSpot( matchedPiece.spotProperty.value );
    matchedPiece.moveToSpot( changingSpot );

    this.stateProperty.value = MatchingChallenge.State.MATCHED;
  }

  /**
   * If both scales are empty, fill them with a matching pair.
   * @public
   */
  cheat() {
    // Only do things if both scales are empty, and there is one unfilled target
    if ( _.every( this.scaleSpots, spot => spot.pieceProperty.value === null ) &&
         _.some( this.targets, target => !target.isFilledProperty.value ) ) {
      const firstPiece = _.find( this.pieces, piece => _.includes( this.sourceSpots, piece.spotProperty.value ) );
      const secondPiece = _.find( this.pieces, piece => {
        return piece !== firstPiece &&
               _.includes( this.sourceSpots, piece.spotProperty.value ) &&
               piece.fraction.reduced().equals( firstPiece.fraction.reduced() );
      } );

      firstPiece.moveToSpot( this.scaleSpots[ 0 ] );
      secondPiece.moveToSpot( this.scaleSpots[ 1 ] );
    }
  }

  /**
   * Steps the model forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    // Only increase elapsed time if there is at least one unfilled target
    if ( _.some( this.targets, target => !target.isFilledProperty.value ) ) {
      this.elapsedTimeProperty.value += dt;
    }

    this.pieces.forEach( piece => piece.step( dt ) );
  }
}

// @public {EnumerationDeprecated} - The main state values for the model
MatchingChallenge.State = EnumerationDeprecated.byKeys( [
  'NO_COMPARISON',
  'COMPARISON',
  'MATCHED',
  'TRY_AGAIN',
  'SHOW_ANSWER'
] );

fractionsCommon.register( 'MatchingChallenge', MatchingChallenge );
export default MatchingChallenge;