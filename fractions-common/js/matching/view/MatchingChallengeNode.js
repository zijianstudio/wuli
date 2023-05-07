// Copyright 2019-2023, University of Colorado Boulder

/**
 * View for a single MatchingChallenge.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Anton Ulyanov (Mlearner)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import FaceWithPointsNode from '../../../../scenery-phet/js/FaceWithPointsNode.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import StarNode from '../../../../scenery-phet/js/StarNode.js';
import { AlignBox, Image, Node, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import LevelCompletedNode from '../../../../vegas/js/LevelCompletedNode.js';
import RewardNode from '../../../../vegas/js/RewardNode.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import scale_png from '../../../images/scale_png.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import FractionsCommonStrings from '../../FractionsCommonStrings.js';
import MatchingChallenge from '../model/MatchingChallenge.js';
import MatchChartNode from './MatchChartNode.js';
import MatchPieceNode from './MatchPieceNode.js';

const checkString = VegasStrings.check;
const labelLevelString = VegasStrings.label.level;
const labelScorePatternString = VegasStrings.label.scorePattern;
const myMatchesString = FractionsCommonStrings.myMatches;
const okString = FractionsCommonStrings.ok;
const showAnswerString = VegasStrings.showAnswer;
const timeNumberSecString = FractionsCommonStrings.timeNumberSec;
const tryAgainString = VegasStrings.tryAgain;


// constants
const PADDING = FractionsCommonConstants.MATCHING_MARGIN;
const NUM_TARGETS = 6;
const TARGET_WIDTH = MatchPieceNode.DIMENSION.width;
const TARGET_HEIGHT = MatchPieceNode.DIMENSION.height;
const TARGETS_TOP = 365;

class MatchingChallengeNode extends Node {
  /**
   * @param {MatchingChallenge} challenge
   * @param {Bounds2} layoutBounds
   * @param {GameAudioPlayer} gameAudioPlayer
   * @param {Object} [options]
   */
  constructor( challenge, layoutBounds, gameAudioPlayer, options ) {
    super();

    options = merge( {
      // {function} - Called when the "continue" button is pressed on the level-complete node
      onContinue: () => {},

      // {Node} - Where the reward node is placed.
      rewardContainer: new Node()
    }, options );

    // @private {MatchingChallenge}
    this.challenge = challenge;

    // Will fire once we have piece nodes initialized, so the equals signs can be properly positioned in targets.
    const layoutCompleteEmitter = new Emitter();

    // @private {RewardNode|null}
    this.rewardNode = null;

    const targetWidth = ( layoutBounds.width - PADDING * ( NUM_TARGETS + 1 ) ) / NUM_TARGETS;
    let targetBottom;

    // Targets
    challenge.targets.forEach( ( target, index ) => {
      const targetBackground = new Rectangle( 0, 0, targetWidth, 100, {
        cornerRadius: 10,
        fill: FractionsCommonColors.matchingTargetBackgroundProperty,
        x: layoutBounds.left + PADDING + ( targetWidth + PADDING ) * index,
        y: layoutBounds.top + PADDING
      } );
      this.addChild( targetBackground );
      target.targetBoundsProperty.value = targetBackground.bounds;

      const equalsSign = new Text( MathSymbols.EQUAL_TO, {
        font: new PhetFont( { size: 26 } ),
        center: targetBackground.center,
        visible: false
      } );
      this.addChild( equalsSign );
      target.equalsSignBounds = equalsSign.localBounds;

      const xListener = x => {
        equalsSign.centerX = x;
      };
      target.equalsXProperty.link( xListener );
      this.disposeEmitter.addListener( () => {
        target.equalsXProperty.unlink( xListener );
      } );

      const filledListener = filled => {
        equalsSign.visible = filled;
      };
      target.isFilledProperty.link( filledListener );
      this.disposeEmitter.addListener( () => {
        target.isFilledProperty.unlink( filledListener );
      } );

      if ( !target.isFilledProperty.value ) {
        const CENTER_WEIGHT = 0.5;

        const y = targetBackground.centerY;
        target.spots[ 0 ].positionProperty.value = new Vector2( ( 1 - CENTER_WEIGHT ) * targetBackground.left + CENTER_WEIGHT * targetBackground.centerX, y );
        target.spots[ 1 ].positionProperty.value = new Vector2( ( 1 - CENTER_WEIGHT ) * targetBackground.right + CENTER_WEIGHT * targetBackground.centerX, y );
      }
      targetBottom = targetBackground.bottom;
    } );

    // Scales
    _.range( 0, 2 ).forEach( index => {
      const scaleNode = new Image( scale_png, {
        centerX: layoutBounds.centerX + ( index - 0.5 ) * 380,
        y: 260,
        scale: 0.52
      } );
      this.addChild( scaleNode );

      challenge.scaleSpots[ index ].positionProperty.value = scaleNode.centerTop.plusXY( 0, 30 );
    } );

    // Sources
    _.range( 0, NUM_TARGETS ).forEach( col => _.range( 0, 2 ).forEach( row => {
      const x = layoutBounds.centerX + TARGET_WIDTH * ( col - NUM_TARGETS / 2 );
      const y = TARGETS_TOP + TARGET_HEIGHT * row;
      const sourceNode = new Rectangle( x, y, TARGET_WIDTH, TARGET_HEIGHT, {
        fill: FractionsCommonColors.matchingSourceBackgroundProperty,
        stroke: FractionsCommonColors.matchingSourceBorderProperty,
        lineWidth: 1.5
      } );
      this.addChild( sourceNode );

      challenge.sourceSpots[ col + row * NUM_TARGETS ].positionProperty.value = sourceNode.center;
    } ) );

    this.addChild( new Text( myMatchesString, {
      font: new PhetFont( { size: 18, weight: 'bold' } ),
      left: layoutBounds.left + PADDING,
      top: targetBottom + 5,
      maxWidth: 300
    } ) );

    const rightTextOptions = {
      font: new PhetFont( { size: 15, weight: 'bold' } ),
      maxWidth: 300
    };

    const levelText = new Text( StringUtils.format( labelLevelString, challenge.levelNumber ), rightTextOptions );
    const scoreText = new Text( '', rightTextOptions );
    const timeText = new Text( '', rightTextOptions );

    this.addChild( new AlignBox( new VBox( {
      spacing: 5,
      align: 'right',
      children: [
        levelText,
        scoreText,
        timeText
      ],
      excludeInvisibleChildrenFromBounds: false
    } ), {
      alignBounds: layoutBounds.withMinY( targetBottom ),
      xAlign: 'right',
      yAlign: 'top',
      xMargin: PADDING,
      yMargin: 10
    } ) );

    // @private {function}
    this.scoreListener = score => {
      scoreText.string = StringUtils.format( labelScorePatternString, score );
    };
    this.timeListener = time => {
      timeText.string = StringUtils.format( timeNumberSecString, Utils.toFixed( time, 0 ) );
    };
    this.timeVisibleListener = visible => {
      timeText.visible = visible;
    };

    this.challenge.scoreProperty.link( this.scoreListener );
    this.challenge.elapsedTimeProperty.link( this.timeListener );
    this.challenge.timeVisibleProperty.link( this.timeVisibleListener );
    this.disposeEmitter.addListener( () => {
      this.challenge.scoreProperty.unlink( this.scoreListener );
      this.challenge.elapsedTimeProperty.unlink( this.timeListener );
      this.challenge.timeVisibleProperty.unlink( this.timeVisibleListener );
    } );

    // @private {MatchChartNode}
    this.chartNode = new MatchChartNode( {
      centerX: layoutBounds.centerX,
      top: targetBottom + 10
    } );
    this.addChild( this.chartNode );

    const chartCompare = () => {
      const leftPiece = challenge.scaleSpots[ 0 ].pieceProperty.value;
      const rightPiece = challenge.scaleSpots[ 1 ].pieceProperty.value;
      this.chartNode.compare(
        leftPiece.fraction.value,
        rightPiece.fraction.value,
        leftPiece.getColor(),
        rightPiece.getColor()
      );
    };

    const faceNode = new FaceWithPointsNode( {
      spacing: 8,
      pointsAlignment: 'rightCenter',
      faceDiameter: 120,
      pointsFont: new PhetFont( { size: 26, weight: 'bold' } ),
      centerX: layoutBounds.right - 150,
      centerY: 250
    } );
    this.addChild( faceNode );

    const buttonOptions = {
      font: new PhetFont( { size: 22, weight: 'bold' } ),
      centerX: faceNode.centerX,
      centerY: faceNode.bottom + 30,
      maxTextWidth: 150
    };

    const checkButton = new TextPushButton( checkString, merge( {
      baseColor: FractionsCommonColors.matchingCheckButtonProperty,
      listener: () => {
        chartCompare();
        challenge.compare();
      }
    }, buttonOptions ) );
    this.addChild( checkButton );
    this.disposeEmitter.addListener( () => checkButton.dispose() );

    const okButton = new TextPushButton( okString, merge( {
      baseColor: FractionsCommonColors.matchingOkButtonProperty,
      listener: () => challenge.collect()
    }, buttonOptions ) );
    this.addChild( okButton );
    this.disposeEmitter.addListener( () => okButton.dispose() );

    const tryAgainButton = new TextPushButton( tryAgainString, merge( {
      baseColor: FractionsCommonColors.matchingTryAgainButtonProperty,
      listener: () => challenge.tryAgain()
    }, buttonOptions ) );
    this.addChild( tryAgainButton );
    this.disposeEmitter.addListener( () => tryAgainButton.dispose() );

    const showAnswerButton = new TextPushButton( showAnswerString, merge( {
      baseColor: FractionsCommonColors.matchingShowAnswerButtonProperty,
      listener: () => {
        challenge.showAnswer();
        chartCompare();
      }
    }, buttonOptions ) );
    this.addChild( showAnswerButton );
    this.disposeEmitter.addListener( () => showAnswerButton.dispose() );

    // @private {Node}
    this.pieceLayer = new Node();
    this.addChild( this.pieceLayer );

    // @private {function}
    this.stateListener = state => {
      checkButton.visible = state === MatchingChallenge.State.COMPARISON;
      okButton.visible = state === MatchingChallenge.State.MATCHED;
      tryAgainButton.visible = state === MatchingChallenge.State.TRY_AGAIN;
      showAnswerButton.visible = state === MatchingChallenge.State.SHOW_ANSWER;

      faceNode.visible = state === MatchingChallenge.State.MATCHED && challenge.lastScoreGainProperty.value > 0;
      if ( state === MatchingChallenge.State.COMPARISON || state === MatchingChallenge.State.NO_COMPARISON ) {
        this.chartNode.visible = false;
      }

      this.pieceLayer.pickable = ( state === MatchingChallenge.State.SHOW_ANSWER || state === MatchingChallenge.State.MATCHED ) ? false : null;
    };
    this.challenge.stateProperty.link( this.stateListener );
    this.disposeEmitter.addListener( () => {
      this.challenge.stateProperty.unlink( this.stateListener );
    } );

    const correctListener = () => gameAudioPlayer.correctAnswer();
    const incorrectListener = () => gameAudioPlayer.wrongAnswer();
    this.challenge.correctEmitter.addListener( correctListener );
    this.challenge.incorrectEmitter.addListener( incorrectListener );
    this.disposeEmitter.addListener( () => {
      this.challenge.correctEmitter.removeListener( correctListener );
      this.challenge.incorrectEmitter.removeListener( incorrectListener );
    } );

    // @private {function}
    this.lastScoreGainListener = lastScoreGain => {
      faceNode.setPoints( lastScoreGain );
    };
    this.challenge.lastScoreGainProperty.link( this.lastScoreGainListener );
    this.disposeEmitter.addListener( () => {
      this.challenge.lastScoreGainProperty.unlink( this.lastScoreGainListener );
    } );

    const pieceNodes = [];

    challenge.pieces.forEach( piece => {
      const pieceNode = new MatchPieceNode( piece );
      pieceNodes.push( pieceNode );
      this.pieceLayer.addChild( pieceNode );
    } );
    this.disposeEmitter.addListener( () => {
      this.pieceLayer.children.forEach( pieceNode => pieceNode.dispose() );
    } );

    const completedListener = () => {
      if ( challenge.scoreProperty.value === 12 ) {
        gameAudioPlayer.gameOverPerfectScore();

        this.rewardNode = new RewardNode( {
          pickable: false,
          nodes: [
            ..._.times( 8, () => new StarNode() ),
            ..._.times( 8, () => new FaceNode( 40, { headStroke: 'black', headLineWidth: 1.5 } ) ),
            ...RewardNode.createRandomNodes( challenge.pieces.map( piece => {
              return new MatchPieceNode( piece.copy() );
            } ), 100 )
          ]
        } );
        options.rewardContainer.addChild( this.rewardNode );
      }

      const bestTime = challenge.scoreProperty.value === 12
                       ? Utils.toFixed( Math.min( challenge.elapsedTimeProperty.value, challenge.previousBestTime ), 0 )
                       : null;
      const levelCompletedNode = new LevelCompletedNode(
        challenge.levelNumber,
        challenge.scoreProperty.value,
        12,
        3,
        challenge.timeVisibleProperty.value,
        Utils.toFixed( challenge.elapsedTimeProperty.value, 0 ),
        bestTime,
        challenge.isNewBestTime,
        options.onContinue, {
          center: layoutBounds.center,
          contentMaxWidth: 600
        } );
      this.addChild( levelCompletedNode );
      this.disposeEmitter.addListener( () => {
        levelCompletedNode.dispose();
        if ( this.rewardNode ) {
          this.rewardNode.dispose();
          this.rewardNode = null;
        }
      } );
    };

    this.challenge.completedEmitter.addListener( completedListener );
    this.disposeEmitter.addListener( () => {
      this.challenge.completedEmitter.removeListener( completedListener );
    } );

    layoutCompleteEmitter.emit();
  }

  /**
   * Steps the view forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    this.rewardNode && this.rewardNode.step( dt );
    this.chartNode.step( dt );
  }
}

fractionsCommon.register( 'MatchingChallengeNode', MatchingChallengeNode );
export default MatchingChallengeNode;