// Copyright 2014-2023, University of Colorado Boulder

/**
 * Main view for the area builder game.
 *
 * @author John Blanco
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import FaceWithPointsNode from '../../../../scenery-phet/js/FaceWithPointsNode.js';
import NumberEntryControl from '../../../../scenery-phet/js/NumberEntryControl.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import Carousel from '../../../../sun/js/Carousel.js';
import Panel from '../../../../sun/js/Panel.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import LevelCompletedNode from '../../../../vegas/js/LevelCompletedNode.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderStrings from '../../AreaBuilderStrings.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
import AreaBuilderControlPanel from '../../common/view/AreaBuilderControlPanel.js';
import ShapeCreatorNode from '../../common/view/ShapeCreatorNode.js';
import ShapeNode from '../../common/view/ShapeNode.js';
import ShapePlacementBoardNode from '../../common/view/ShapePlacementBoardNode.js';
import AreaBuilderGameModel from '../model/AreaBuilderGameModel.js';
import BuildSpec from '../model/BuildSpec.js';
import GameState from '../model/GameState.js';
import AreaBuilderScoreboard from './AreaBuilderScoreboard.js';
import ColorProportionsPrompt from './ColorProportionsPrompt.js';
import GameIconFactory from './GameIconFactory.js';
import GameInfoBanner from './GameInfoBanner.js';
import StartGameLevelNode from './StartGameLevelNode.js';
import YouBuiltWindow from './YouBuiltWindow.js';
import YouEnteredWindow from './YouEnteredWindow.js';

const areaEqualsString = AreaBuilderStrings.areaEquals;
const areaQuestionString = AreaBuilderStrings.areaQuestion;
const aSolutionColonString = AreaBuilderStrings.aSolutionColon;
const aSolutionString = AreaBuilderStrings.aSolution;
const buildItString = AreaBuilderStrings.buildIt;
const checkString = VegasStrings.check;
const findTheAreaString = AreaBuilderStrings.findTheArea;
const nextString = VegasStrings.next;
const perimeterEqualsString = AreaBuilderStrings.perimeterEquals;
const solutionColonString = AreaBuilderStrings.solutionColon;
const solutionString = AreaBuilderStrings.solution;
const startOverString = AreaBuilderStrings.startOver;
const tryAgainString = VegasStrings.tryAgain;
const yourGoalString = AreaBuilderStrings.yourGoal;

// constants
const BUTTON_FONT = new PhetFont( 18 );
const BUTTON_FILL = PhetColorScheme.BUTTON_YELLOW;
const INFO_BANNER_HEIGHT = 60; // Height of the prompt and solution banners, empirically determined.
const GOAL_PROMPT_FONT = new PhetFont( { size: 20, weight: 'bold' } );
const SPACE_AROUND_SHAPE_PLACEMENT_BOARD = AreaBuilderSharedConstants.CONTROLS_INSET;
const ITEMS_PER_CAROUSEL_PAGE = 4;
const BUTTON_TOUCH_AREA_DILATION = 7;

class AreaBuilderGameView extends ScreenView {

  /**
   * @param {AreaBuilderGameModel} gameModel
   */
  constructor( gameModel ) {
    super( { layoutBounds: AreaBuilderSharedConstants.LAYOUT_BOUNDS } );
    const self = this;
    this.model = gameModel;

    // Create the game audio player.
    this.gameAudioPlayer = new GameAudioPlayer();

    // Create a root node and send to back so that the layout bounds box can be made visible if needed.
    this.rootNode = new Node();
    this.addChild( this.rootNode );
    this.rootNode.moveToBack();

    // Add layers used to control game appearance.
    this.controlLayer = new Node();
    this.rootNode.addChild( this.controlLayer );
    this.challengeLayer = new Node();
    this.rootNode.addChild( this.challengeLayer );

    // Add the node that allows the user to choose a game level to play.
    this.startGameLevelNode = new StartGameLevelNode(
      level => {
        this.numberEntryControl.clear();
        gameModel.startLevel( level );
      },
      () => {
        gameModel.reset();
        this.disposeCurrentCarousel();
      },
      gameModel.timerEnabledProperty,
      [
        GameIconFactory.createIcon( 1 ),
        GameIconFactory.createIcon( 2 ),
        GameIconFactory.createIcon( 3 ),
        GameIconFactory.createIcon( 4 ),
        GameIconFactory.createIcon( 5 ),
        GameIconFactory.createIcon( 6 )
      ],
      gameModel.bestScoreProperties,
      {
        numStarsOnButtons: gameModel.challengesPerSet,
        perfectScore: gameModel.maxPossibleScore,
        numLevels: gameModel.numberOfLevels,
        numButtonRows: 2,
        controlsInset: AreaBuilderSharedConstants.CONTROLS_INSET
      }
    );
    this.rootNode.addChild( this.startGameLevelNode );

    // Set up the constant portions of the challenge view.
    this.shapeBoard = new ShapePlacementBoardNode( gameModel.simSpecificModel.shapePlacementBoard );
    this.shapeBoardOriginalBounds = this.shapeBoard.bounds.copy(); // Necessary because the shape board's bounds can vary when shapes are placed.
    this.maxShapeBoardTextWidth = this.shapeBoardOriginalBounds.width * 0.9;
    this.yourGoalTitle = new Text( yourGoalString, {
      font: new PhetFont( { size: 24, weight: 'bold' } ),
      maxWidth: this.maxShapeBoardTextWidth
    } );
    this.challengeLayer.addChild( this.shapeBoard );
    this.eraserButton = new EraserButton( {
      right: this.shapeBoard.left,
      top: this.shapeBoard.bottom + SPACE_AROUND_SHAPE_PLACEMENT_BOARD,
      touchAreaXDilation: BUTTON_TOUCH_AREA_DILATION,
      touchAreaYDilation: BUTTON_TOUCH_AREA_DILATION,
      listener: () => {

        const challenge = gameModel.currentChallengeProperty.get();
        let shapeReleaseMode = 'fade';

        if ( challenge.checkSpec === 'areaEntered' && challenge.userShapes && challenge.userShapes[ 0 ].creationLimit ) {

          // In the case where there is a limited number of shapes, have them animate back to the carousel instead of
          // fading away so that the user understands that the stash is being replenished.
          shapeReleaseMode = 'animateHome';
        }
        gameModel.simSpecificModel.shapePlacementBoard.releaseAllShapes( shapeReleaseMode );

        // If the game was showing the user incorrect feedback when they pressed this button, auto-advance to the
        // next state.
        if ( gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN ) {
          this.numberEntryControl.clear();
          gameModel.tryAgain();
        }
      }
    } );
    this.challengeLayer.addChild( this.eraserButton );
    this.youBuiltWindow = new YouBuiltWindow( this.layoutBounds.width - this.shapeBoard.right - 14 );
    this.challengeLayer.addChild( this.youBuiltWindow );
    this.youEnteredWindow = new YouEnteredWindow( this.layoutBounds.width - this.shapeBoard.right - 14 );
    this.challengeLayer.addChild( this.youEnteredWindow );
    this.challengePromptBanner = new GameInfoBanner( this.shapeBoard.width, INFO_BANNER_HEIGHT, '#1b1464', {
      left: this.shapeBoard.left,
      bottom: this.shapeBoard.top - SPACE_AROUND_SHAPE_PLACEMENT_BOARD
    } );
    this.challengeLayer.addChild( this.challengePromptBanner );
    this.solutionBanner = new GameInfoBanner( this.shapeBoard.width, INFO_BANNER_HEIGHT, '#fbb03b', {
      left: this.shapeBoard.left,
      bottom: this.shapeBoard.top - SPACE_AROUND_SHAPE_PLACEMENT_BOARD
    } );
    this.challengeLayer.addChild( this.solutionBanner );

    // Add the control panel
    this.controlPanel = new AreaBuilderControlPanel(
      gameModel.simSpecificModel.showGridOnBoardProperty,
      gameModel.simSpecificModel.showDimensionsProperty,
      { centerX: ( this.layoutBounds.x + this.shapeBoard.left ) / 2, bottom: this.shapeBoard.bottom }
    );
    this.controlLayer.addChild( this.controlPanel );

    // Add the scoreboard.
    this.scoreboard = new AreaBuilderScoreboard(
      gameModel.levelProperty,
      gameModel.challengeIndexProperty,
      gameModel.challengesPerSet,
      gameModel.scoreProperty,
      gameModel.elapsedTimeProperty,
      {
        centerX: ( this.layoutBounds.x + this.shapeBoard.left ) / 2,
        top: this.shapeBoard.top,
        maxWidth: this.controlPanel.width
      }
    );
    this.controlLayer.addChild( this.scoreboard );

    // Control visibility of elapsed time indicator in the scoreboard.
    this.model.timerEnabledProperty.link( timerEnabled => {
      this.scoreboard.timeVisibleProperty.set( timerEnabled );
    } );

    // Add the button for returning to the level selection screen.
    this.controlLayer.addChild( new RectangularPushButton( {
      content: new Text( startOverString, { font: BUTTON_FONT, maxWidth: this.controlPanel.width } ),
      touchAreaXDilation: BUTTON_TOUCH_AREA_DILATION,
      touchAreaYDilation: BUTTON_TOUCH_AREA_DILATION,
      listener: () => {
        this.interruptSubtreeInput();
        gameModel.simSpecificModel.reset();
        gameModel.setChoosingLevelState();
      },
      baseColor: BUTTON_FILL,
      centerX: this.scoreboard.centerX,
      centerY: this.solutionBanner.centerY
    } ) );

    // Add the 'Build Prompt' node that is shown temporarily over the board to instruct the user about what to build.
    this.buildPromptVBox = new VBox( {
      children: [
        this.yourGoalTitle
      ],
      spacing: 20
    } );
    this.buildPromptPanel = new Panel( this.buildPromptVBox, {
      stroke: null,
      xMargin: 10,
      yMargin: 10
    } );
    this.challengeLayer.addChild( this.buildPromptPanel );

    // Define some variables for taking a snapshot of the user's solution.
    this.areaOfUserCreatedShape = 0;
    this.perimeterOfUserCreatedShape = 0;
    this.color1Proportion = null;

    // Add and lay out the game control buttons.
    this.gameControlButtons = [];
    const buttonOptions = {
      font: BUTTON_FONT,
      baseColor: BUTTON_FILL,
      cornerRadius: 4,
      touchAreaXDilation: BUTTON_TOUCH_AREA_DILATION,
      touchAreaYDilation: BUTTON_TOUCH_AREA_DILATION,
      maxWidth: ( this.layoutBounds.maxX - this.shapeBoardOriginalBounds.maxX ) * 0.9
    };
    this.checkAnswerButton = new TextPushButton( checkString, merge( {
      listener: () => {
        this.updateUserAnswer();
        gameModel.checkAnswer();
      }
    }, buttonOptions ) );
    this.gameControlButtons.push( this.checkAnswerButton );

    this.nextButton = new TextPushButton( nextString, merge( {
      listener: () => {
        this.numberEntryControl.clear();
        gameModel.nextChallenge();
      }
    }, buttonOptions ) );
    this.gameControlButtons.push( this.nextButton );

    this.tryAgainButton = new TextPushButton( tryAgainString, merge( {
      listener: () => {
        this.numberEntryControl.clear();
        gameModel.tryAgain();
      }
    }, buttonOptions ) );
    this.gameControlButtons.push( this.tryAgainButton );

    // Solution button for 'find the area' style of challenge, which has one specific answer.
    this.solutionButton = new TextPushButton( solutionString, merge( {
      listener: () => {
        gameModel.displayCorrectAnswer();
      }
    }, buttonOptions ) );
    this.gameControlButtons.push( this.solutionButton );

    // Solution button for 'build it' style of challenge, which has many potential answers.
    this.showASolutionButton = new TextPushButton( aSolutionString, merge( {
      listener: () => {
        this.okayToUpdateYouBuiltWindow = false;
        gameModel.displayCorrectAnswer();
      }
    }, buttonOptions ) );
    this.gameControlButtons.push( this.showASolutionButton );

    const buttonCenterX = ( this.layoutBounds.width + this.shapeBoard.right ) / 2;
    const buttonBottom = this.shapeBoard.bottom;
    this.gameControlButtons.forEach( button => {
      button.centerX = buttonCenterX;
      button.bottom = buttonBottom;
      this.controlLayer.addChild( button );
    } );

    // Add the number entry control, which is only visible on certain challenge types.
    this.numberEntryControl = new NumberEntryControl( {
      centerX: buttonCenterX,
      bottom: this.checkAnswerButton.top - 10
    } );
    this.challengeLayer.addChild( this.numberEntryControl );
    this.areaQuestionPrompt = new Text( areaQuestionString, { // This prompt goes with the number entry control.
      font: new PhetFont( 20 ),
      centerX: this.numberEntryControl.centerX,
      bottom: this.numberEntryControl.top - 10,
      maxWidth: this.numberEntryControl.width
    } );
    this.challengeLayer.addChild( this.areaQuestionPrompt );

    this.numberEntryControl.keypad.valueStringProperty.link( valueString => {

      // Handle the case where the user just starts entering digits instead of pressing the "Try Again" button.  In
      // this case, we go ahead and make the state transition to the next state.
      if ( gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN ) {
        gameModel.tryAgain();
      }

      // Update the state of the 'Check' button when the user enters new digits.
      this.updatedCheckButtonEnabledState();
    } );

    // Add the 'feedback node' that is used to visually indicate correct and incorrect answers.
    this.faceWithPointsNode = new FaceWithPointsNode( {
      faceDiameter: 85,
      pointsAlignment: 'rightBottom',
      centerX: buttonCenterX,
      top: buttonBottom + 20,
      pointsFont: new PhetFont( { size: 20, weight: 'bold' } )
    } );
    this.addChild( this.faceWithPointsNode );

    // Handle comings and goings of model shapes.
    gameModel.simSpecificModel.movableShapes.addItemAddedListener( addedShape => {

      // Create and add the view representation for this shape.
      const shapeNode = new ShapeNode( addedShape, this.layoutBounds );
      this.challengeLayer.addChild( shapeNode );

      // Add a listener that handles changes to the userControlled state.
      const userControlledListener = userControlled => {
        if ( userControlled ) {
          shapeNode.moveToFront();

          // If the game was in the state where it was prompting the user to try again, and the user started
          // interacting with shapes without pressing the 'Try Again' button, go ahead and make the state change
          // automatically.
          if ( gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN ) {
            gameModel.tryAgain();
          }
        }
      };
      addedShape.userControlledProperty.link( userControlledListener );

      // Add the removal listener for if and when this shape is removed from the model.
      gameModel.simSpecificModel.movableShapes.addItemRemovedListener( function removalListener( removedShape ) {
        if ( removedShape === addedShape ) {
          self.challengeLayer.removeChild( shapeNode );
          shapeNode.dispose();
          addedShape.userControlledProperty.unlink( userControlledListener );
          gameModel.simSpecificModel.movableShapes.removeItemRemovedListener( removalListener );
        }
      } );

      // If the initial build prompt is visible, hide it.
      if ( this.buildPromptPanel.opacity === 1 ) {
        // using a function instead, see Seasons sim, PanelNode.js for an example.
        new Animation( {
          from: this.buildPromptPanel.opacity,
          to: 0,
          setValue: opacity => { this.buildPromptPanel.opacity = opacity; },
          duration: 0.5,
          easing: Easing.CUBIC_IN_OUT
        } ).start();
      }

      // If this is a 'built it' style challenge, and this is the first element being added to the board, add the
      // build spec to the banner so that the user can reference it as they add more shapes to the board.
      if ( gameModel.currentChallengeProperty.get().buildSpec && this.challengePromptBanner.buildSpecProperty.value === null ) {
        this.challengePromptBanner.buildSpecProperty.value = gameModel.currentChallengeProperty.get().buildSpec;
      }
    } );

    gameModel.simSpecificModel.movableShapes.addItemRemovedListener( () => {
      // If the challenge is a 'build it' style challenge, and the game is in the state where the user is being given
      // the opportunity to view a solution, and the user just removed a piece, check if they now have the correct
      // answer.
      if ( gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_MOVE_ON && !this.isAnyShapeMoving() ) {
        this.model.checkAnswer();
      }
    } );

    gameModel.simSpecificModel.shapePlacementBoard.areaAndPerimeterProperty.link( areaAndPerimeter => {

      this.updatedCheckButtonEnabledState();

      // If the challenge is a 'build it' style challenge, and the game is in the state where the user is being
      // given the opportunity to view a solution, and they just changed what they had built, update the 'you built'
      // window.
      if ( gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_MOVE_ON &&
           this.model.currentChallengeProperty.get().buildSpec &&
           this.okayToUpdateYouBuiltWindow ) {
        this.updateUserAnswer();
        this.updateYouBuiltWindow( this.model.currentChallengeProperty.get() );

        // If the user has put all shapes away, check to see if they now have the correct answer.
        if ( !this.isAnyShapeMoving() ) {
          this.model.checkAnswer();
        }
      }
    } );

    // @private {GroupItemOptions[]} - Keep track of active ShapeCreatorNode instances so that they can be disposed.
    this.activeShapeNodeCreators = [];

    // @private {Carousel|null}
    this.carousel = null; // for disposal

    // Various other initialization
    this.levelCompletedNode = null; // @private
    this.shapeCarouselLayer = new Node(); // @private
    this.challengeLayer.addChild( this.shapeCarouselLayer );
    this.clearDimensionsControlOnNextChallenge = false; // @private

    // Hook up the update function for handling changes to game state.
    gameModel.gameStateProperty.link( this.handleGameStateChange.bind( this ) );

    // Set up a flag to block updates of the 'You Built' window when showing the solution.  This is necessary because
    // adding the shapes to the board in order to show the solution triggers updates of this window.
    this.okayToUpdateYouBuiltWindow = true; // @private
  }

  // @private, When the game state changes, update the view with the appropriate buttons and readouts.
  handleGameStateChange( gameState ) {

    // Hide all nodes - the appropriate ones will be shown later based on the current state.
    this.hideAllGameNodes();

    const challenge = this.model.currentChallengeProperty.get(); // convenience var

    // Show the nodes appropriate to the state
    switch( gameState ) {

      case GameState.CHOOSING_LEVEL:
        this.handleChoosingLevelState();
        break;

      case GameState.PRESENTING_INTERACTIVE_CHALLENGE:
        this.handlePresentingInteractiveChallengeState( challenge );
        break;

      case GameState.SHOWING_CORRECT_ANSWER_FEEDBACK:
        this.handleShowingCorrectAnswerFeedbackState( challenge );
        break;

      case GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN:
        this.handleShowingIncorrectAnswerFeedbackTryAgainState( challenge );
        break;

      case GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_MOVE_ON:
        this.handleShowingIncorrectAnswerFeedbackMoveOnState( challenge );
        break;

      case GameState.DISPLAYING_CORRECT_ANSWER:
        this.handleDisplayingCorrectAnswerState( challenge );
        break;

      case GameState.SHOWING_LEVEL_RESULTS:
        this.handleShowingLevelResultsState();
        break;

      default:
        throw new Error( `Unhandled game state: ${gameState}` );
    }
  }

  // @private
  handleChoosingLevelState() {
    this.show( [ this.startGameLevelNode ] );
    this.hideChallenge();
  }

  // @private
  handlePresentingInteractiveChallengeState( challenge ) {
    this.challengeLayer.pickable = null; // Pass through, prunes subtree, see Scenery documentation for details.
    this.presentChallenge();

    // Make a list of the nodes to be shown in this state.
    const nodesToShow = [
      this.scoreboard,
      this.controlPanel,
      this.checkAnswerButton,
      this.challengePromptBanner
    ];

    // Add the nodes that are only shown for certain challenge types or under certain conditions.
    if ( challenge.checkSpec === 'areaEntered' ) {
      nodesToShow.push( this.numberEntryControl );
      nodesToShow.push( this.areaQuestionPrompt );
    }
    if ( challenge.userShapes ) {
      nodesToShow.push( this.shapeCarouselLayer );
      nodesToShow.push( this.eraserButton );
    }

    this.show( nodesToShow );
    this.showChallengeGraphics();
    this.updatedCheckButtonEnabledState();
    this.okayToUpdateYouBuiltWindow = true;

    if ( this.clearDimensionsControlOnNextChallenge ) {
      this.model.simSpecificModel.showDimensionsProperty.set( false );
      this.clearDimensionsControlOnNextChallenge = false;
    }
  }

  // @private
  handleShowingCorrectAnswerFeedbackState( challenge ) {

    // Make a list of the nodes to be shown in this state.
    const nodesToShow = [
      this.scoreboard,
      this.controlPanel,
      this.nextButton,
      this.challengePromptBanner,
      this.faceWithPointsNode
    ];

    // Update and show the nodes that vary based on the challenge configurations.
    if ( challenge.buildSpec ) {
      this.updateYouBuiltWindow( challenge );
      nodesToShow.push( this.youBuiltWindow );
    }
    else {
      this.updateYouEnteredWindow( challenge );
      nodesToShow.push( this.youEnteredWindow );
    }

    // Give the user the appropriate audio and visual feedback
    this.gameAudioPlayer.correctAnswer();
    this.faceWithPointsNode.smile();
    this.faceWithPointsNode.setPoints( this.model.getChallengeCurrentPointValue() );

    // Disable interaction with the challenge elements.
    this.challengeLayer.pickable = false;

    // Make the nodes visible
    this.show( nodesToShow );
  }

  // @private
  handleShowingIncorrectAnswerFeedbackTryAgainState( challenge ) {

    // Make a list of the nodes to be shown in this state.
    const nodesToShow = [
      this.scoreboard,
      this.controlPanel,
      this.tryAgainButton,
      this.challengePromptBanner,
      this.faceWithPointsNode
    ];

    // Add the nodes whose visibility varies based on the challenge configuration.
    if ( challenge.checkSpec === 'areaEntered' ) {
      nodesToShow.push( this.numberEntryControl );
      nodesToShow.push( this.areaQuestionPrompt );
    }
    if ( challenge.userShapes ) {
      nodesToShow.push( this.shapeCarouselLayer );
      nodesToShow.push( this.eraserButton );
    }

    // Give the user the appropriate feedback.
    this.gameAudioPlayer.wrongAnswer();
    this.faceWithPointsNode.frown();
    this.faceWithPointsNode.setPoints( this.model.scoreProperty.get() );

    if ( challenge.checkSpec === 'areaEntered' ) {
      // Set the keypad to allow the user to start entering a new value.
      this.numberEntryControl.setClearOnNextKeyPress( true );
    }

    // Show the nodes
    this.show( nodesToShow );
  }

  // @private
  handleShowingIncorrectAnswerFeedbackMoveOnState( challenge ) {

    // Make a list of the nodes to be shown in this state.
    const nodesToShow = [
      this.scoreboard,
      this.controlPanel,
      this.challengePromptBanner,
      this.faceWithPointsNode
    ];

    // Add the nodes whose visibility varies based on the challenge configuration.
    if ( challenge.buildSpec ) {
      nodesToShow.push( this.showASolutionButton );
      this.updateYouBuiltWindow( challenge );
      nodesToShow.push( this.youBuiltWindow );
      if ( challenge.userShapes ) {
        nodesToShow.push( this.shapeCarouselLayer );
        nodesToShow.push( this.eraserButton );
      }
    }
    else {
      nodesToShow.push( this.solutionButton );
      this.updateYouEnteredWindow( challenge );
      nodesToShow.push( this.youEnteredWindow );
    }

    this.show( nodesToShow );

    // Give the user the appropriate feedback
    this.gameAudioPlayer.wrongAnswer();
    this.faceWithPointsNode.frown();
    this.faceWithPointsNode.setPoints( this.model.scoreProperty.get() );

    // For 'built it' style challenges, the user can still interact while in this state in case they want to try
    // to get it right.  In 'find the area' challenges, further interaction is disallowed.
    if ( challenge.checkSpec === 'areaEntered' ) {
      this.challengeLayer.pickable = false;
    }

    // Show the nodes.
    this.show( nodesToShow );
  }

  // @private
  handleDisplayingCorrectAnswerState( challenge ) {
    // Make a list of the nodes to be shown in this state.
    const nodesToShow = [
      this.scoreboard,
      this.controlPanel,
      this.nextButton,
      this.solutionBanner
    ];

    // Keep the appropriate feedback window visible.
    if ( challenge.buildSpec ) {
      nodesToShow.push( this.youBuiltWindow );
    }
    else {
      nodesToShow.push( this.youEnteredWindow );
    }

    // Update the solution banner.
    this.solutionBanner.reset();
    if ( challenge.buildSpec ) {
      this.solutionBanner.titleStringProperty.value = aSolutionColonString;
      this.solutionBanner.buildSpecProperty.value = challenge.buildSpec;
    }
    else {
      this.solutionBanner.titleStringProperty.value = solutionColonString;
      this.solutionBanner.areaToFindProperty.value = challenge.backgroundShape.unitArea;
    }
    this.showChallengeGraphics();

    // Disable interaction with the challenge elements.
    this.challengeLayer.pickable = false;

    // Turn on the dimensions indicator, since it may make the answer more clear for the user.
    this.clearDimensionsControlOnNextChallenge = !this.model.simSpecificModel.showDimensionsProperty.get();
    this.model.simSpecificModel.showDimensionsProperty.set( true );

    // Show the nodes.
    this.show( nodesToShow );
  }

  // @private
  handleShowingLevelResultsState() {
    if ( this.model.scoreProperty.get() === this.model.maxPossibleScore ) {
      this.gameAudioPlayer.gameOverPerfectScore();
    }
    else if ( this.model.scoreProperty.get() === 0 ) {
      this.gameAudioPlayer.gameOverZeroScore();
    }
    else {
      this.gameAudioPlayer.gameOverImperfectScore();
    }

    this.showLevelResultsNode();
    this.hideChallenge();
  }

  // @private Update the window that depicts what the user has built.
  updateYouBuiltWindow( challenge ) {
    assert && assert( challenge.buildSpec, 'This method should only be called for challenges that include a build spec.' );
    const userBuiltSpec = new BuildSpec(
      this.areaOfUserCreatedShape,
      challenge.buildSpec.perimeter ? this.perimeterOfUserCreatedShape : null,
      challenge.buildSpec.proportions ? {
        color1: challenge.buildSpec.proportions.color1,
        color2: challenge.buildSpec.proportions.color2,
        color1Proportion: this.color1Proportion
      } : null
    );
    this.youBuiltWindow.setBuildSpec( userBuiltSpec );
    this.youBuiltWindow.setColorBasedOnAnswerCorrectness( userBuiltSpec.equals( challenge.buildSpec ) );
    this.youBuiltWindow.centerY = this.shapeBoardOriginalBounds.centerY;
    this.youBuiltWindow.centerX = ( this.layoutBounds.maxX + this.shapeBoardOriginalBounds.maxX ) / 2;
  }

  // @private Update the window that depicts what the user has entered using the keypad.
  updateYouEnteredWindow( challenge ) {
    assert && assert( challenge.checkSpec === 'areaEntered', 'This method should only be called for find-the-area style challenges.' );
    this.youEnteredWindow.setValueEntered( this.model.simSpecificModel.areaGuess );
    this.youEnteredWindow.setColorBasedOnAnswerCorrectness( challenge.backgroundShape.unitArea === this.model.simSpecificModel.areaGuess );
    this.youEnteredWindow.centerY = this.shapeBoardOriginalBounds.centerY;
    this.youEnteredWindow.centerX = ( this.layoutBounds.maxX + this.shapeBoardOriginalBounds.maxX ) / 2;
  }

  // @private Grab a snapshot of whatever the user has built or entered
  updateUserAnswer() {
    // Save the parameters of what the user has built, if they've built anything.
    this.areaOfUserCreatedShape = this.model.simSpecificModel.shapePlacementBoard.areaAndPerimeterProperty.get().area;
    this.perimeterOfUserCreatedShape = this.model.simSpecificModel.shapePlacementBoard.areaAndPerimeterProperty.get().perimeter;
    const challenge = this.model.currentChallengeProperty.get(); // convenience var
    if ( challenge.buildSpec && challenge.buildSpec.proportions ) {
      this.color1Proportion = this.model.simSpecificModel.getProportionOfColor( challenge.buildSpec.proportions.color1 );
    }
    else {
      this.color1Proportion = null;
    }

    // Submit the user's area guess, if there is one.
    this.model.simSpecificModel.areaGuess = this.numberEntryControl.value;
  }

  // @private Returns true if any shape is animating or user controlled, false if not.
  isAnyShapeMoving() {
    for ( let i = 0; i < this.model.simSpecificModel.movableShapes.length; i++ ) {
      if ( this.model.simSpecificModel.movableShapes.get( i ).animatingProperty.get() ||
           this.model.simSpecificModel.movableShapes.get( i ).userControlledProperty.get() ) {
        return true;
      }
    }
    return false;
  }


  /**
   * @private
   */
  disposeCurrentCarousel() {
    this.activeShapeNodeCreators.length = 0;
    if ( this.carousel ) {
      this.carousel.dispose();
      this.carousel = null;
    }
  }

  /**
   * Present the challenge to the user and set things up so that they can submit their answer.
   * @private
   */
  presentChallenge() {

    if ( this.model.incorrectGuessesOnCurrentChallenge === 0 ) {

      // Clean up previous challenge.
      this.model.simSpecificModel.clearShapePlacementBoard();
      this.challengePromptBanner.reset();

      this.disposeCurrentCarousel();

      const challenge = this.model.currentChallengeProperty.get(); // Convenience var

      // Set up the challenge prompt banner, which appears above the shape placement board.
      this.challengePromptBanner.titleStringProperty.value = challenge.buildSpec ? buildItString : findTheAreaString;

      // If needed, set up the goal prompt that will initially appear over the shape placement board (in the z-order).
      if ( challenge.buildSpec ) {

        this.buildPromptVBox.removeAllChildren();
        this.buildPromptVBox.addChild( this.yourGoalTitle );
        const areaGoalNode = new Text( StringUtils.format( areaEqualsString, challenge.buildSpec.area ), {
          font: GOAL_PROMPT_FONT,
          maxWidth: this.shapeBoardOriginalBounds.width * 0.9
        } );
        if ( challenge.buildSpec.proportions ) {
          const areaPrompt = new Node();
          areaPrompt.addChild( areaGoalNode );
          areaGoalNode.string = `${areaGoalNode.string},`;
          const colorProportionsPrompt = new ColorProportionsPrompt( challenge.buildSpec.proportions.color1,
            challenge.buildSpec.proportions.color2, challenge.buildSpec.proportions.color1Proportion, {
              font: new PhetFont( { size: 16, weight: 'bold' } ),
              left: areaGoalNode.width + 10,
              centerY: areaGoalNode.centerY,
              maxWidth: this.shapeBoardOriginalBounds.width * 0.9
            }
          );
          areaPrompt.addChild( colorProportionsPrompt );

          // make sure the prompt will fit on the board - important for translatability
          if ( areaPrompt.width > this.shapeBoardOriginalBounds.width * 0.9 ) {
            areaPrompt.scale( ( this.shapeBoardOriginalBounds.width * 0.9 ) / areaPrompt.width );
          }

          this.buildPromptVBox.addChild( areaPrompt );
        }
        else {
          this.buildPromptVBox.addChild( areaGoalNode );
        }

        if ( challenge.buildSpec.perimeter ) {
          this.buildPromptVBox.addChild( new Text( StringUtils.format( perimeterEqualsString, challenge.buildSpec.perimeter ), {
            font: GOAL_PROMPT_FONT,
            maxWidth: this.maxShapeBoardTextWidth
          } ) );
        }

        // Center the panel over the shape board and make it visible.
        this.buildPromptPanel.centerX = this.shapeBoardOriginalBounds.centerX;
        this.buildPromptPanel.centerY = this.shapeBoardOriginalBounds.centerY;
        this.buildPromptPanel.visible = true;
        this.buildPromptPanel.opacity = 1; // Necessary because the board is set to fade out elsewhere.
      }
      else {
        this.buildPromptPanel.visible = false;
      }

      // Set the state of the control panel.
      this.controlPanel.dimensionsIcon.setGridVisible( !challenge.backgroundShape );
      this.controlPanel.gridControlVisibleProperty.set( challenge.toolSpec.gridControl );
      this.controlPanel.dimensionsControlVisibleProperty.set( challenge.toolSpec.dimensionsControl );
      if ( challenge.backgroundShape ) {
        this.controlPanel.dimensionsIcon.setColor( challenge.backgroundShape.fillColor );
      }
      else if ( challenge.userShapes ) {
        this.controlPanel.dimensionsIcon.setColor( challenge.userShapes[ 0 ].color );
      }
      else {
        this.controlPanel.dimensionsIcon.setColor( AreaBuilderSharedConstants.GREENISH_COLOR );
      }

      // Create the carousel if included as part of this challenge.
      if ( challenge.userShapes !== null ) {
        challenge.userShapes.forEach( userShapeSpec => {
          const creatorNodeOptions = {
            gridSpacing: AreaBuilderGameModel.UNIT_SQUARE_LENGTH,
            shapeDragBounds: this.layoutBounds,
            nonMovingAncestor: this.shapeCarouselLayer
          };
          if ( userShapeSpec.creationLimit ) {
            creatorNodeOptions.creationLimit = userShapeSpec.creationLimit;
          }
          this.activeShapeNodeCreators.push( {
            createNode: () => new ShapeCreatorNode(
              userShapeSpec.shape,
              userShapeSpec.color,
              this.model.simSpecificModel.addUserCreatedMovableShape.bind( this.model.simSpecificModel ),
              creatorNodeOptions
            )
          } );
        } );

        // Add a scrolling carousel.
        this.carousel = new Carousel( this.activeShapeNodeCreators, {
          orientation: 'horizontal',
          itemsPerPage: ITEMS_PER_CAROUSEL_PAGE,
          centerX: this.shapeBoardOriginalBounds.centerX,
          top: this.shapeBoardOriginalBounds.bottom + SPACE_AROUND_SHAPE_PLACEMENT_BOARD,
          fill: AreaBuilderSharedConstants.CONTROL_PANEL_BACKGROUND_COLOR
        } );
        this.shapeCarouselLayer.addChild( this.carousel );
      }
    }
  }

  // @private, Utility method for hiding all of the game nodes whose visibility changes during the course of a challenge.
  hideAllGameNodes() {
    this.gameControlButtons.forEach( button => { button.visible = false; } );
    this.setNodeVisibility( false, [
      this.startGameLevelNode,
      this.faceWithPointsNode,
      this.scoreboard,
      this.controlPanel,
      this.challengePromptBanner,
      this.solutionBanner,
      this.numberEntryControl,
      this.areaQuestionPrompt,
      this.youBuiltWindow,
      this.youEnteredWindow,
      this.shapeCarouselLayer,
      this.eraserButton
    ] );
  }

  // @private
  show( nodesToShow ) {
    nodesToShow.forEach( nodeToShow => { nodeToShow.visible = true; } );
  }

  // @private
  setNodeVisibility( isVisible, nodes ) {
    nodes.forEach( node => { node.visible = isVisible; } );
  }

  // @private
  hideChallenge() {
    this.challengeLayer.visible = false;
    this.controlLayer.visible = false;
  }

  // @private Show the graphic model elements for this challenge.
  showChallengeGraphics() {
    this.challengeLayer.visible = true;
    this.controlLayer.visible = true;
  }

  // @private
  updatedCheckButtonEnabledState() {
    if ( this.model.currentChallengeProperty.get() ) {
      if ( this.model.currentChallengeProperty.get().checkSpec === 'areaEntered' ) {
        this.checkAnswerButton.enabled = this.numberEntryControl.keypad.valueStringProperty.value.length > 0;
      }
      else {
        this.checkAnswerButton.enabled = this.model.simSpecificModel.shapePlacementBoard.areaAndPerimeterProperty.get().area > 0;
      }
    }
  }

  // @private
  showLevelResultsNode() {
    // Set a new "level completed" node based on the results.
    let levelCompletedNode = new LevelCompletedNode(
      this.model.levelProperty.get() + 1,
      this.model.scoreProperty.get(),
      this.model.maxPossibleScore,
      this.model.challengesPerSet,
      this.model.timerEnabledProperty.get(),
      this.model.elapsedTimeProperty.get(),
      this.model.bestTimes[ this.model.levelProperty.get() ],
      this.model.newBestTime,
      () => {
        this.model.gameStateProperty.set( GameState.CHOOSING_LEVEL );
        this.rootNode.removeChild( levelCompletedNode );
        levelCompletedNode = null;
      },
      {
        center: this.layoutBounds.center
      }
    );

    // Add the node.
    this.rootNode.addChild( levelCompletedNode );
  }
}

areaBuilder.register( 'AreaBuilderGameView', AreaBuilderGameView );
export default AreaBuilderGameView;