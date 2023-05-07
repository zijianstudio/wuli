// Copyright 2015-2023, University of Colorado Boulder

/**
 * Game screenview for make-a-ten. Includes 10 levels, where the goal for each is to combine the 2 numbers together into
 * one number by manipulating with the concept of making a ten. Each level can generate an infinite number of
 * challenges, so the score for each level is an integer (instead of a proportion like other sims).
 *
 * @author Sharfudeen Ashraf
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import CountingCommonScreenView from '../../../../../counting-common/js/common/view/CountingCommonScreenView.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import InfoButton from '../../../../../scenery-phet/js/buttons/InfoButton.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { ButtonListener, HBox, Node, Rectangle, Text } from '../../../../../scenery/js/imports.js';
import Easing from '../../../../../twixt/js/Easing.js';
import TransitionNode from '../../../../../twixt/js/TransitionNode.js';
import GameAudioPlayer from '../../../../../vegas/js/GameAudioPlayer.js';
import InfiniteStatusBar from '../../../../../vegas/js/InfiniteStatusBar.js';
import RewardDialog from '../../../../../vegas/js/RewardDialog.js';
import makeATen from '../../../makeATen.js';
import MakeATenStrings from '../../../MakeATenStrings.js';
import AdditionTermsNode from '../../common/view/AdditionTermsNode.js';
import GameState from '../model/GameState.js';
import InfoDialog from './InfoDialog.js';
import MakeATenRewardNode from './MakeATenRewardNode.js';
import NextArrowButton from './NextArrowButton.js';
import StartGameLevelNode from './StartGameLevelNode.js';

const nextString = MakeATenStrings.next;
const patternLevel0LevelNumberString = MakeATenStrings.pattern.level[ '0levelNumber' ];

class MakeATenGameScreenView extends CountingCommonScreenView {

  /**
   * @param {MakeATenGameModel} model
   */
  constructor( model ) {
    super( model );

    this.finishInitialization();

    // @private {Node} - The "left" half of the sliding layer, displayed first
    this.levelSelectionLayer = new Node();

    // @private {Node} - The "right" half of the sliding layer, will slide into view when the user selects a level
    this.challengeLayer = new Node();

    const showingLeftProperty = new DerivedProperty( [ model.gameStateProperty ], gameState => gameState === GameState.CHOOSING_LEVEL );

    // @private {TransitionNode}
    this.transitionNode = new TransitionNode( this.visibleBoundsProperty, {
      content: this.levelSelectionLayer
    } );
    showingLeftProperty.lazyLink( isLeft => {
      if ( isLeft ) {
        this.transitionNode.slideRightTo( this.levelSelectionLayer, {
          duration: 0.4,
          targetOptions: {
            easing: Easing.QUADRATIC_IN_OUT
          }
        } );
      }
      else {
        this.transitionNode.slideLeftTo( this.challengeLayer, {
          duration: 0.4,
          targetOptions: {
            easing: Easing.QUADRATIC_IN_OUT
          }
        } );
      }
    } );
    this.addChild( this.transitionNode );

    // @private {StartGameLevelNode} - Shows buttons that allow selecting the level to play
    this.startGameLevelNode = new StartGameLevelNode( model );
    this.levelSelectionLayer.addChild( this.startGameLevelNode );

    // Move our resetAllButton onto our level-selection layer
    this.resetAllButton.detach();
    this.levelSelectionLayer.addChild( this.resetAllButton );

    // info dialog, constructed lazily because Dialog requires sim bounds during construction
    let dialog = null;

    // @private {InfoButton} - Shows '?' in the corner that pops up the info dialog when clicked.
    this.infoButton = new InfoButton( {
      touchAreaXDilation: 7,
      touchAreaYDilation: 7,
      listener: () => {
        if ( !dialog ) {
          dialog = new InfoDialog( model.levels );
        }
        dialog.show();
      },
      scale: 0.7,
      top: this.layoutBounds.top + 20,
      right: this.layoutBounds.right - 20
    } );
    this.levelSelectionLayer.addChild( this.infoButton );

    // The node that display "12 + 100 = "
    const additionTermsNode = new AdditionTermsNode( model.additionTerms, false );
    additionTermsNode.left = this.layoutBounds.left + 38;
    additionTermsNode.top = this.layoutBounds.top + 75;
    this.challengeLayer.addChild( additionTermsNode );

    // @private {NextArrowButton} - Moves to the next challenge when clicked
    this.nextChallengeButton = new NextArrowButton( nextString, {
      listener: () => {
        model.moveToNextChallenge();
      },
      top: this.layoutBounds.centerY,
      right: this.layoutBounds.right - 20
    } );
    this.challengeLayer.addChild( this.nextChallengeButton );
    model.gameStateProperty.link( gameState => {
      this.nextChallengeButton.visible = gameState === GameState.CORRECT_ANSWER;
    } );

    // Add the counting object layer from our supertype
    this.challengeLayer.addChild( this.countingObjectLayerNode );

    const levelNumberText = new Text( '', {
      font: new PhetFont( { size: 18, weight: 'bold' } ),
      pickable: false,
      maxWidth: 120
    } );
    const levelDescriptionText = new Text( '', {
      font: new PhetFont( 18 ),
      pickable: false
    } );
    model.currentLevelProperty.link( level => {
      levelNumberText.string = StringUtils.format( patternLevel0LevelNumberString, `${level.number}` );
      levelDescriptionText.string = level.description;
    } );
    const statusMessageNode = new HBox( {
      children: [ levelNumberText, levelDescriptionText ],
      spacing: 30
    } );

    // @private {InfiniteStatusBar} - Status bar at the top of the screen
    this.gameStatusBar = new InfiniteStatusBar( this.layoutBounds, this.visibleBoundsProperty, statusMessageNode, model.currentScoreProperty, {
      floatToTop: true,
      barFill: new DerivedProperty( [ model.currentLevelProperty ], _.property( 'color' ) ),
      backButtonListener: model.moveToChoosingLevel.bind( model )
    } );
    this.challengeLayer.addChild( this.gameStatusBar );

    // Hook up the audio player to the sound settings.
    this.gameAudioPlayer = new GameAudioPlayer();

    // Trigger initial layout
    this.layoutControls();

    // Hook up the update function for handling changes to game state.
    model.gameStateProperty.link( this.onGameStateChange.bind( this ) );

    // @private {RewardNode|null} - see showReward()
    this.rewardNode = null;

    // @private {function|null} - see showReward()
    this.rewardNodeBoundsListener = null;

    // @private {Rectangle}
    this.rewardBarrier = Rectangle.bounds( this.visibleBoundsProperty.value, {
      fill: 'rgba(128,128,128,0.4)'
    } );
    this.visibleBoundsProperty.linkAttribute( this.rewardBarrier, 'rectBounds' );
    this.rewardBarrier.addInputListener( new ButtonListener( {
      fire: event => {
        this.hideReward();
      }
    } ) );

    model.levels.forEach( level => {
      level.scoreProperty.link( score => {
        if ( score === 10 ) {
          this.showReward();
        }
      } );
    } );
  }

  /**
   * @public
   */
  step( dt ) {
    this.rewardNode && this.rewardNode.step( dt );
    this.transitionNode && this.transitionNode.step( dt );
  }

  /**
   * Shows the reward node.
   * @private
   */
  showReward() {
    this.gameAudioPlayer.gameOverPerfectScore();

    this.rewardNode = new MakeATenRewardNode();
    this.addChild( this.rewardBarrier );
    this.addChild( this.rewardNode );
    this.rewardNodeBoundsListener = this.visibleBoundsProperty.linkAttribute( this.rewardNode, 'canvasBounds' );

    const rewardDialog = new RewardDialog( 10, {
      keepGoingButtonListener: () => {
        this.hideReward();
        rewardDialog.dispose();

      },
      newLevelButtonListener: () => {
        this.hideReward();
        this.model.moveToChoosingLevel();
        rewardDialog.dispose();
      }
    } );
    rewardDialog.show();
  }

  /**
   * Hides the reward node.
   * @private
   */
  hideReward() {
    this.removeChild( this.rewardNode );
    this.removeChild( this.rewardBarrier );
    this.visibleBoundsProperty.unlink( this.rewardNodeBoundsListener );

    // fully release references
    this.rewardNode = null;
    this.rewardNodeBoundsListener = null;
  }

  /**
   * When the game state changes, update the view with the appropriate buttons and readouts.
   * @private
   *
   * @param {GameState} gameState
   */
  onGameStateChange( gameState ) {
    if ( gameState === GameState.PRESENTING_INTERACTIVE_CHALLENGE ) {
      this.model.setupChallenge( this.model.currentChallengeProperty.value );
    }
    if ( gameState === GameState.CORRECT_ANSWER ) {
      this.model.incrementScore();
      this.gameAudioPlayer.correctAnswer();
    }
  }

  /**
   * @public
   * @override
   * @returns {number} - Amount in view coordinates to leave at the top of the screen.
   */
  getTopBoundsOffset() {
    return this.gameStatusBar.height;
  }
}

makeATen.register( 'MakeATenGameScreenView', MakeATenGameScreenView );
export default MakeATenGameScreenView;