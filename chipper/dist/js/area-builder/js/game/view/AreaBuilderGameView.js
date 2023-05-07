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
const BUTTON_FONT = new PhetFont(18);
const BUTTON_FILL = PhetColorScheme.BUTTON_YELLOW;
const INFO_BANNER_HEIGHT = 60; // Height of the prompt and solution banners, empirically determined.
const GOAL_PROMPT_FONT = new PhetFont({
  size: 20,
  weight: 'bold'
});
const SPACE_AROUND_SHAPE_PLACEMENT_BOARD = AreaBuilderSharedConstants.CONTROLS_INSET;
const ITEMS_PER_CAROUSEL_PAGE = 4;
const BUTTON_TOUCH_AREA_DILATION = 7;
class AreaBuilderGameView extends ScreenView {
  /**
   * @param {AreaBuilderGameModel} gameModel
   */
  constructor(gameModel) {
    super({
      layoutBounds: AreaBuilderSharedConstants.LAYOUT_BOUNDS
    });
    const self = this;
    this.model = gameModel;

    // Create the game audio player.
    this.gameAudioPlayer = new GameAudioPlayer();

    // Create a root node and send to back so that the layout bounds box can be made visible if needed.
    this.rootNode = new Node();
    this.addChild(this.rootNode);
    this.rootNode.moveToBack();

    // Add layers used to control game appearance.
    this.controlLayer = new Node();
    this.rootNode.addChild(this.controlLayer);
    this.challengeLayer = new Node();
    this.rootNode.addChild(this.challengeLayer);

    // Add the node that allows the user to choose a game level to play.
    this.startGameLevelNode = new StartGameLevelNode(level => {
      this.numberEntryControl.clear();
      gameModel.startLevel(level);
    }, () => {
      gameModel.reset();
      this.disposeCurrentCarousel();
    }, gameModel.timerEnabledProperty, [GameIconFactory.createIcon(1), GameIconFactory.createIcon(2), GameIconFactory.createIcon(3), GameIconFactory.createIcon(4), GameIconFactory.createIcon(5), GameIconFactory.createIcon(6)], gameModel.bestScoreProperties, {
      numStarsOnButtons: gameModel.challengesPerSet,
      perfectScore: gameModel.maxPossibleScore,
      numLevels: gameModel.numberOfLevels,
      numButtonRows: 2,
      controlsInset: AreaBuilderSharedConstants.CONTROLS_INSET
    });
    this.rootNode.addChild(this.startGameLevelNode);

    // Set up the constant portions of the challenge view.
    this.shapeBoard = new ShapePlacementBoardNode(gameModel.simSpecificModel.shapePlacementBoard);
    this.shapeBoardOriginalBounds = this.shapeBoard.bounds.copy(); // Necessary because the shape board's bounds can vary when shapes are placed.
    this.maxShapeBoardTextWidth = this.shapeBoardOriginalBounds.width * 0.9;
    this.yourGoalTitle = new Text(yourGoalString, {
      font: new PhetFont({
        size: 24,
        weight: 'bold'
      }),
      maxWidth: this.maxShapeBoardTextWidth
    });
    this.challengeLayer.addChild(this.shapeBoard);
    this.eraserButton = new EraserButton({
      right: this.shapeBoard.left,
      top: this.shapeBoard.bottom + SPACE_AROUND_SHAPE_PLACEMENT_BOARD,
      touchAreaXDilation: BUTTON_TOUCH_AREA_DILATION,
      touchAreaYDilation: BUTTON_TOUCH_AREA_DILATION,
      listener: () => {
        const challenge = gameModel.currentChallengeProperty.get();
        let shapeReleaseMode = 'fade';
        if (challenge.checkSpec === 'areaEntered' && challenge.userShapes && challenge.userShapes[0].creationLimit) {
          // In the case where there is a limited number of shapes, have them animate back to the carousel instead of
          // fading away so that the user understands that the stash is being replenished.
          shapeReleaseMode = 'animateHome';
        }
        gameModel.simSpecificModel.shapePlacementBoard.releaseAllShapes(shapeReleaseMode);

        // If the game was showing the user incorrect feedback when they pressed this button, auto-advance to the
        // next state.
        if (gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN) {
          this.numberEntryControl.clear();
          gameModel.tryAgain();
        }
      }
    });
    this.challengeLayer.addChild(this.eraserButton);
    this.youBuiltWindow = new YouBuiltWindow(this.layoutBounds.width - this.shapeBoard.right - 14);
    this.challengeLayer.addChild(this.youBuiltWindow);
    this.youEnteredWindow = new YouEnteredWindow(this.layoutBounds.width - this.shapeBoard.right - 14);
    this.challengeLayer.addChild(this.youEnteredWindow);
    this.challengePromptBanner = new GameInfoBanner(this.shapeBoard.width, INFO_BANNER_HEIGHT, '#1b1464', {
      left: this.shapeBoard.left,
      bottom: this.shapeBoard.top - SPACE_AROUND_SHAPE_PLACEMENT_BOARD
    });
    this.challengeLayer.addChild(this.challengePromptBanner);
    this.solutionBanner = new GameInfoBanner(this.shapeBoard.width, INFO_BANNER_HEIGHT, '#fbb03b', {
      left: this.shapeBoard.left,
      bottom: this.shapeBoard.top - SPACE_AROUND_SHAPE_PLACEMENT_BOARD
    });
    this.challengeLayer.addChild(this.solutionBanner);

    // Add the control panel
    this.controlPanel = new AreaBuilderControlPanel(gameModel.simSpecificModel.showGridOnBoardProperty, gameModel.simSpecificModel.showDimensionsProperty, {
      centerX: (this.layoutBounds.x + this.shapeBoard.left) / 2,
      bottom: this.shapeBoard.bottom
    });
    this.controlLayer.addChild(this.controlPanel);

    // Add the scoreboard.
    this.scoreboard = new AreaBuilderScoreboard(gameModel.levelProperty, gameModel.challengeIndexProperty, gameModel.challengesPerSet, gameModel.scoreProperty, gameModel.elapsedTimeProperty, {
      centerX: (this.layoutBounds.x + this.shapeBoard.left) / 2,
      top: this.shapeBoard.top,
      maxWidth: this.controlPanel.width
    });
    this.controlLayer.addChild(this.scoreboard);

    // Control visibility of elapsed time indicator in the scoreboard.
    this.model.timerEnabledProperty.link(timerEnabled => {
      this.scoreboard.timeVisibleProperty.set(timerEnabled);
    });

    // Add the button for returning to the level selection screen.
    this.controlLayer.addChild(new RectangularPushButton({
      content: new Text(startOverString, {
        font: BUTTON_FONT,
        maxWidth: this.controlPanel.width
      }),
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
    }));

    // Add the 'Build Prompt' node that is shown temporarily over the board to instruct the user about what to build.
    this.buildPromptVBox = new VBox({
      children: [this.yourGoalTitle],
      spacing: 20
    });
    this.buildPromptPanel = new Panel(this.buildPromptVBox, {
      stroke: null,
      xMargin: 10,
      yMargin: 10
    });
    this.challengeLayer.addChild(this.buildPromptPanel);

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
      maxWidth: (this.layoutBounds.maxX - this.shapeBoardOriginalBounds.maxX) * 0.9
    };
    this.checkAnswerButton = new TextPushButton(checkString, merge({
      listener: () => {
        this.updateUserAnswer();
        gameModel.checkAnswer();
      }
    }, buttonOptions));
    this.gameControlButtons.push(this.checkAnswerButton);
    this.nextButton = new TextPushButton(nextString, merge({
      listener: () => {
        this.numberEntryControl.clear();
        gameModel.nextChallenge();
      }
    }, buttonOptions));
    this.gameControlButtons.push(this.nextButton);
    this.tryAgainButton = new TextPushButton(tryAgainString, merge({
      listener: () => {
        this.numberEntryControl.clear();
        gameModel.tryAgain();
      }
    }, buttonOptions));
    this.gameControlButtons.push(this.tryAgainButton);

    // Solution button for 'find the area' style of challenge, which has one specific answer.
    this.solutionButton = new TextPushButton(solutionString, merge({
      listener: () => {
        gameModel.displayCorrectAnswer();
      }
    }, buttonOptions));
    this.gameControlButtons.push(this.solutionButton);

    // Solution button for 'build it' style of challenge, which has many potential answers.
    this.showASolutionButton = new TextPushButton(aSolutionString, merge({
      listener: () => {
        this.okayToUpdateYouBuiltWindow = false;
        gameModel.displayCorrectAnswer();
      }
    }, buttonOptions));
    this.gameControlButtons.push(this.showASolutionButton);
    const buttonCenterX = (this.layoutBounds.width + this.shapeBoard.right) / 2;
    const buttonBottom = this.shapeBoard.bottom;
    this.gameControlButtons.forEach(button => {
      button.centerX = buttonCenterX;
      button.bottom = buttonBottom;
      this.controlLayer.addChild(button);
    });

    // Add the number entry control, which is only visible on certain challenge types.
    this.numberEntryControl = new NumberEntryControl({
      centerX: buttonCenterX,
      bottom: this.checkAnswerButton.top - 10
    });
    this.challengeLayer.addChild(this.numberEntryControl);
    this.areaQuestionPrompt = new Text(areaQuestionString, {
      // This prompt goes with the number entry control.
      font: new PhetFont(20),
      centerX: this.numberEntryControl.centerX,
      bottom: this.numberEntryControl.top - 10,
      maxWidth: this.numberEntryControl.width
    });
    this.challengeLayer.addChild(this.areaQuestionPrompt);
    this.numberEntryControl.keypad.valueStringProperty.link(valueString => {
      // Handle the case where the user just starts entering digits instead of pressing the "Try Again" button.  In
      // this case, we go ahead and make the state transition to the next state.
      if (gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN) {
        gameModel.tryAgain();
      }

      // Update the state of the 'Check' button when the user enters new digits.
      this.updatedCheckButtonEnabledState();
    });

    // Add the 'feedback node' that is used to visually indicate correct and incorrect answers.
    this.faceWithPointsNode = new FaceWithPointsNode({
      faceDiameter: 85,
      pointsAlignment: 'rightBottom',
      centerX: buttonCenterX,
      top: buttonBottom + 20,
      pointsFont: new PhetFont({
        size: 20,
        weight: 'bold'
      })
    });
    this.addChild(this.faceWithPointsNode);

    // Handle comings and goings of model shapes.
    gameModel.simSpecificModel.movableShapes.addItemAddedListener(addedShape => {
      // Create and add the view representation for this shape.
      const shapeNode = new ShapeNode(addedShape, this.layoutBounds);
      this.challengeLayer.addChild(shapeNode);

      // Add a listener that handles changes to the userControlled state.
      const userControlledListener = userControlled => {
        if (userControlled) {
          shapeNode.moveToFront();

          // If the game was in the state where it was prompting the user to try again, and the user started
          // interacting with shapes without pressing the 'Try Again' button, go ahead and make the state change
          // automatically.
          if (gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN) {
            gameModel.tryAgain();
          }
        }
      };
      addedShape.userControlledProperty.link(userControlledListener);

      // Add the removal listener for if and when this shape is removed from the model.
      gameModel.simSpecificModel.movableShapes.addItemRemovedListener(function removalListener(removedShape) {
        if (removedShape === addedShape) {
          self.challengeLayer.removeChild(shapeNode);
          shapeNode.dispose();
          addedShape.userControlledProperty.unlink(userControlledListener);
          gameModel.simSpecificModel.movableShapes.removeItemRemovedListener(removalListener);
        }
      });

      // If the initial build prompt is visible, hide it.
      if (this.buildPromptPanel.opacity === 1) {
        // using a function instead, see Seasons sim, PanelNode.js for an example.
        new Animation({
          from: this.buildPromptPanel.opacity,
          to: 0,
          setValue: opacity => {
            this.buildPromptPanel.opacity = opacity;
          },
          duration: 0.5,
          easing: Easing.CUBIC_IN_OUT
        }).start();
      }

      // If this is a 'built it' style challenge, and this is the first element being added to the board, add the
      // build spec to the banner so that the user can reference it as they add more shapes to the board.
      if (gameModel.currentChallengeProperty.get().buildSpec && this.challengePromptBanner.buildSpecProperty.value === null) {
        this.challengePromptBanner.buildSpecProperty.value = gameModel.currentChallengeProperty.get().buildSpec;
      }
    });
    gameModel.simSpecificModel.movableShapes.addItemRemovedListener(() => {
      // If the challenge is a 'build it' style challenge, and the game is in the state where the user is being given
      // the opportunity to view a solution, and the user just removed a piece, check if they now have the correct
      // answer.
      if (gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_MOVE_ON && !this.isAnyShapeMoving()) {
        this.model.checkAnswer();
      }
    });
    gameModel.simSpecificModel.shapePlacementBoard.areaAndPerimeterProperty.link(areaAndPerimeter => {
      this.updatedCheckButtonEnabledState();

      // If the challenge is a 'build it' style challenge, and the game is in the state where the user is being
      // given the opportunity to view a solution, and they just changed what they had built, update the 'you built'
      // window.
      if (gameModel.gameStateProperty.value === GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_MOVE_ON && this.model.currentChallengeProperty.get().buildSpec && this.okayToUpdateYouBuiltWindow) {
        this.updateUserAnswer();
        this.updateYouBuiltWindow(this.model.currentChallengeProperty.get());

        // If the user has put all shapes away, check to see if they now have the correct answer.
        if (!this.isAnyShapeMoving()) {
          this.model.checkAnswer();
        }
      }
    });

    // @private {GroupItemOptions[]} - Keep track of active ShapeCreatorNode instances so that they can be disposed.
    this.activeShapeNodeCreators = [];

    // @private {Carousel|null}
    this.carousel = null; // for disposal

    // Various other initialization
    this.levelCompletedNode = null; // @private
    this.shapeCarouselLayer = new Node(); // @private
    this.challengeLayer.addChild(this.shapeCarouselLayer);
    this.clearDimensionsControlOnNextChallenge = false; // @private

    // Hook up the update function for handling changes to game state.
    gameModel.gameStateProperty.link(this.handleGameStateChange.bind(this));

    // Set up a flag to block updates of the 'You Built' window when showing the solution.  This is necessary because
    // adding the shapes to the board in order to show the solution triggers updates of this window.
    this.okayToUpdateYouBuiltWindow = true; // @private
  }

  // @private, When the game state changes, update the view with the appropriate buttons and readouts.
  handleGameStateChange(gameState) {
    // Hide all nodes - the appropriate ones will be shown later based on the current state.
    this.hideAllGameNodes();
    const challenge = this.model.currentChallengeProperty.get(); // convenience var

    // Show the nodes appropriate to the state
    switch (gameState) {
      case GameState.CHOOSING_LEVEL:
        this.handleChoosingLevelState();
        break;
      case GameState.PRESENTING_INTERACTIVE_CHALLENGE:
        this.handlePresentingInteractiveChallengeState(challenge);
        break;
      case GameState.SHOWING_CORRECT_ANSWER_FEEDBACK:
        this.handleShowingCorrectAnswerFeedbackState(challenge);
        break;
      case GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_TRY_AGAIN:
        this.handleShowingIncorrectAnswerFeedbackTryAgainState(challenge);
        break;
      case GameState.SHOWING_INCORRECT_ANSWER_FEEDBACK_MOVE_ON:
        this.handleShowingIncorrectAnswerFeedbackMoveOnState(challenge);
        break;
      case GameState.DISPLAYING_CORRECT_ANSWER:
        this.handleDisplayingCorrectAnswerState(challenge);
        break;
      case GameState.SHOWING_LEVEL_RESULTS:
        this.handleShowingLevelResultsState();
        break;
      default:
        throw new Error(`Unhandled game state: ${gameState}`);
    }
  }

  // @private
  handleChoosingLevelState() {
    this.show([this.startGameLevelNode]);
    this.hideChallenge();
  }

  // @private
  handlePresentingInteractiveChallengeState(challenge) {
    this.challengeLayer.pickable = null; // Pass through, prunes subtree, see Scenery documentation for details.
    this.presentChallenge();

    // Make a list of the nodes to be shown in this state.
    const nodesToShow = [this.scoreboard, this.controlPanel, this.checkAnswerButton, this.challengePromptBanner];

    // Add the nodes that are only shown for certain challenge types or under certain conditions.
    if (challenge.checkSpec === 'areaEntered') {
      nodesToShow.push(this.numberEntryControl);
      nodesToShow.push(this.areaQuestionPrompt);
    }
    if (challenge.userShapes) {
      nodesToShow.push(this.shapeCarouselLayer);
      nodesToShow.push(this.eraserButton);
    }
    this.show(nodesToShow);
    this.showChallengeGraphics();
    this.updatedCheckButtonEnabledState();
    this.okayToUpdateYouBuiltWindow = true;
    if (this.clearDimensionsControlOnNextChallenge) {
      this.model.simSpecificModel.showDimensionsProperty.set(false);
      this.clearDimensionsControlOnNextChallenge = false;
    }
  }

  // @private
  handleShowingCorrectAnswerFeedbackState(challenge) {
    // Make a list of the nodes to be shown in this state.
    const nodesToShow = [this.scoreboard, this.controlPanel, this.nextButton, this.challengePromptBanner, this.faceWithPointsNode];

    // Update and show the nodes that vary based on the challenge configurations.
    if (challenge.buildSpec) {
      this.updateYouBuiltWindow(challenge);
      nodesToShow.push(this.youBuiltWindow);
    } else {
      this.updateYouEnteredWindow(challenge);
      nodesToShow.push(this.youEnteredWindow);
    }

    // Give the user the appropriate audio and visual feedback
    this.gameAudioPlayer.correctAnswer();
    this.faceWithPointsNode.smile();
    this.faceWithPointsNode.setPoints(this.model.getChallengeCurrentPointValue());

    // Disable interaction with the challenge elements.
    this.challengeLayer.pickable = false;

    // Make the nodes visible
    this.show(nodesToShow);
  }

  // @private
  handleShowingIncorrectAnswerFeedbackTryAgainState(challenge) {
    // Make a list of the nodes to be shown in this state.
    const nodesToShow = [this.scoreboard, this.controlPanel, this.tryAgainButton, this.challengePromptBanner, this.faceWithPointsNode];

    // Add the nodes whose visibility varies based on the challenge configuration.
    if (challenge.checkSpec === 'areaEntered') {
      nodesToShow.push(this.numberEntryControl);
      nodesToShow.push(this.areaQuestionPrompt);
    }
    if (challenge.userShapes) {
      nodesToShow.push(this.shapeCarouselLayer);
      nodesToShow.push(this.eraserButton);
    }

    // Give the user the appropriate feedback.
    this.gameAudioPlayer.wrongAnswer();
    this.faceWithPointsNode.frown();
    this.faceWithPointsNode.setPoints(this.model.scoreProperty.get());
    if (challenge.checkSpec === 'areaEntered') {
      // Set the keypad to allow the user to start entering a new value.
      this.numberEntryControl.setClearOnNextKeyPress(true);
    }

    // Show the nodes
    this.show(nodesToShow);
  }

  // @private
  handleShowingIncorrectAnswerFeedbackMoveOnState(challenge) {
    // Make a list of the nodes to be shown in this state.
    const nodesToShow = [this.scoreboard, this.controlPanel, this.challengePromptBanner, this.faceWithPointsNode];

    // Add the nodes whose visibility varies based on the challenge configuration.
    if (challenge.buildSpec) {
      nodesToShow.push(this.showASolutionButton);
      this.updateYouBuiltWindow(challenge);
      nodesToShow.push(this.youBuiltWindow);
      if (challenge.userShapes) {
        nodesToShow.push(this.shapeCarouselLayer);
        nodesToShow.push(this.eraserButton);
      }
    } else {
      nodesToShow.push(this.solutionButton);
      this.updateYouEnteredWindow(challenge);
      nodesToShow.push(this.youEnteredWindow);
    }
    this.show(nodesToShow);

    // Give the user the appropriate feedback
    this.gameAudioPlayer.wrongAnswer();
    this.faceWithPointsNode.frown();
    this.faceWithPointsNode.setPoints(this.model.scoreProperty.get());

    // For 'built it' style challenges, the user can still interact while in this state in case they want to try
    // to get it right.  In 'find the area' challenges, further interaction is disallowed.
    if (challenge.checkSpec === 'areaEntered') {
      this.challengeLayer.pickable = false;
    }

    // Show the nodes.
    this.show(nodesToShow);
  }

  // @private
  handleDisplayingCorrectAnswerState(challenge) {
    // Make a list of the nodes to be shown in this state.
    const nodesToShow = [this.scoreboard, this.controlPanel, this.nextButton, this.solutionBanner];

    // Keep the appropriate feedback window visible.
    if (challenge.buildSpec) {
      nodesToShow.push(this.youBuiltWindow);
    } else {
      nodesToShow.push(this.youEnteredWindow);
    }

    // Update the solution banner.
    this.solutionBanner.reset();
    if (challenge.buildSpec) {
      this.solutionBanner.titleStringProperty.value = aSolutionColonString;
      this.solutionBanner.buildSpecProperty.value = challenge.buildSpec;
    } else {
      this.solutionBanner.titleStringProperty.value = solutionColonString;
      this.solutionBanner.areaToFindProperty.value = challenge.backgroundShape.unitArea;
    }
    this.showChallengeGraphics();

    // Disable interaction with the challenge elements.
    this.challengeLayer.pickable = false;

    // Turn on the dimensions indicator, since it may make the answer more clear for the user.
    this.clearDimensionsControlOnNextChallenge = !this.model.simSpecificModel.showDimensionsProperty.get();
    this.model.simSpecificModel.showDimensionsProperty.set(true);

    // Show the nodes.
    this.show(nodesToShow);
  }

  // @private
  handleShowingLevelResultsState() {
    if (this.model.scoreProperty.get() === this.model.maxPossibleScore) {
      this.gameAudioPlayer.gameOverPerfectScore();
    } else if (this.model.scoreProperty.get() === 0) {
      this.gameAudioPlayer.gameOverZeroScore();
    } else {
      this.gameAudioPlayer.gameOverImperfectScore();
    }
    this.showLevelResultsNode();
    this.hideChallenge();
  }

  // @private Update the window that depicts what the user has built.
  updateYouBuiltWindow(challenge) {
    assert && assert(challenge.buildSpec, 'This method should only be called for challenges that include a build spec.');
    const userBuiltSpec = new BuildSpec(this.areaOfUserCreatedShape, challenge.buildSpec.perimeter ? this.perimeterOfUserCreatedShape : null, challenge.buildSpec.proportions ? {
      color1: challenge.buildSpec.proportions.color1,
      color2: challenge.buildSpec.proportions.color2,
      color1Proportion: this.color1Proportion
    } : null);
    this.youBuiltWindow.setBuildSpec(userBuiltSpec);
    this.youBuiltWindow.setColorBasedOnAnswerCorrectness(userBuiltSpec.equals(challenge.buildSpec));
    this.youBuiltWindow.centerY = this.shapeBoardOriginalBounds.centerY;
    this.youBuiltWindow.centerX = (this.layoutBounds.maxX + this.shapeBoardOriginalBounds.maxX) / 2;
  }

  // @private Update the window that depicts what the user has entered using the keypad.
  updateYouEnteredWindow(challenge) {
    assert && assert(challenge.checkSpec === 'areaEntered', 'This method should only be called for find-the-area style challenges.');
    this.youEnteredWindow.setValueEntered(this.model.simSpecificModel.areaGuess);
    this.youEnteredWindow.setColorBasedOnAnswerCorrectness(challenge.backgroundShape.unitArea === this.model.simSpecificModel.areaGuess);
    this.youEnteredWindow.centerY = this.shapeBoardOriginalBounds.centerY;
    this.youEnteredWindow.centerX = (this.layoutBounds.maxX + this.shapeBoardOriginalBounds.maxX) / 2;
  }

  // @private Grab a snapshot of whatever the user has built or entered
  updateUserAnswer() {
    // Save the parameters of what the user has built, if they've built anything.
    this.areaOfUserCreatedShape = this.model.simSpecificModel.shapePlacementBoard.areaAndPerimeterProperty.get().area;
    this.perimeterOfUserCreatedShape = this.model.simSpecificModel.shapePlacementBoard.areaAndPerimeterProperty.get().perimeter;
    const challenge = this.model.currentChallengeProperty.get(); // convenience var
    if (challenge.buildSpec && challenge.buildSpec.proportions) {
      this.color1Proportion = this.model.simSpecificModel.getProportionOfColor(challenge.buildSpec.proportions.color1);
    } else {
      this.color1Proportion = null;
    }

    // Submit the user's area guess, if there is one.
    this.model.simSpecificModel.areaGuess = this.numberEntryControl.value;
  }

  // @private Returns true if any shape is animating or user controlled, false if not.
  isAnyShapeMoving() {
    for (let i = 0; i < this.model.simSpecificModel.movableShapes.length; i++) {
      if (this.model.simSpecificModel.movableShapes.get(i).animatingProperty.get() || this.model.simSpecificModel.movableShapes.get(i).userControlledProperty.get()) {
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
    if (this.carousel) {
      this.carousel.dispose();
      this.carousel = null;
    }
  }

  /**
   * Present the challenge to the user and set things up so that they can submit their answer.
   * @private
   */
  presentChallenge() {
    if (this.model.incorrectGuessesOnCurrentChallenge === 0) {
      // Clean up previous challenge.
      this.model.simSpecificModel.clearShapePlacementBoard();
      this.challengePromptBanner.reset();
      this.disposeCurrentCarousel();
      const challenge = this.model.currentChallengeProperty.get(); // Convenience var

      // Set up the challenge prompt banner, which appears above the shape placement board.
      this.challengePromptBanner.titleStringProperty.value = challenge.buildSpec ? buildItString : findTheAreaString;

      // If needed, set up the goal prompt that will initially appear over the shape placement board (in the z-order).
      if (challenge.buildSpec) {
        this.buildPromptVBox.removeAllChildren();
        this.buildPromptVBox.addChild(this.yourGoalTitle);
        const areaGoalNode = new Text(StringUtils.format(areaEqualsString, challenge.buildSpec.area), {
          font: GOAL_PROMPT_FONT,
          maxWidth: this.shapeBoardOriginalBounds.width * 0.9
        });
        if (challenge.buildSpec.proportions) {
          const areaPrompt = new Node();
          areaPrompt.addChild(areaGoalNode);
          areaGoalNode.string = `${areaGoalNode.string},`;
          const colorProportionsPrompt = new ColorProportionsPrompt(challenge.buildSpec.proportions.color1, challenge.buildSpec.proportions.color2, challenge.buildSpec.proportions.color1Proportion, {
            font: new PhetFont({
              size: 16,
              weight: 'bold'
            }),
            left: areaGoalNode.width + 10,
            centerY: areaGoalNode.centerY,
            maxWidth: this.shapeBoardOriginalBounds.width * 0.9
          });
          areaPrompt.addChild(colorProportionsPrompt);

          // make sure the prompt will fit on the board - important for translatability
          if (areaPrompt.width > this.shapeBoardOriginalBounds.width * 0.9) {
            areaPrompt.scale(this.shapeBoardOriginalBounds.width * 0.9 / areaPrompt.width);
          }
          this.buildPromptVBox.addChild(areaPrompt);
        } else {
          this.buildPromptVBox.addChild(areaGoalNode);
        }
        if (challenge.buildSpec.perimeter) {
          this.buildPromptVBox.addChild(new Text(StringUtils.format(perimeterEqualsString, challenge.buildSpec.perimeter), {
            font: GOAL_PROMPT_FONT,
            maxWidth: this.maxShapeBoardTextWidth
          }));
        }

        // Center the panel over the shape board and make it visible.
        this.buildPromptPanel.centerX = this.shapeBoardOriginalBounds.centerX;
        this.buildPromptPanel.centerY = this.shapeBoardOriginalBounds.centerY;
        this.buildPromptPanel.visible = true;
        this.buildPromptPanel.opacity = 1; // Necessary because the board is set to fade out elsewhere.
      } else {
        this.buildPromptPanel.visible = false;
      }

      // Set the state of the control panel.
      this.controlPanel.dimensionsIcon.setGridVisible(!challenge.backgroundShape);
      this.controlPanel.gridControlVisibleProperty.set(challenge.toolSpec.gridControl);
      this.controlPanel.dimensionsControlVisibleProperty.set(challenge.toolSpec.dimensionsControl);
      if (challenge.backgroundShape) {
        this.controlPanel.dimensionsIcon.setColor(challenge.backgroundShape.fillColor);
      } else if (challenge.userShapes) {
        this.controlPanel.dimensionsIcon.setColor(challenge.userShapes[0].color);
      } else {
        this.controlPanel.dimensionsIcon.setColor(AreaBuilderSharedConstants.GREENISH_COLOR);
      }

      // Create the carousel if included as part of this challenge.
      if (challenge.userShapes !== null) {
        challenge.userShapes.forEach(userShapeSpec => {
          const creatorNodeOptions = {
            gridSpacing: AreaBuilderGameModel.UNIT_SQUARE_LENGTH,
            shapeDragBounds: this.layoutBounds,
            nonMovingAncestor: this.shapeCarouselLayer
          };
          if (userShapeSpec.creationLimit) {
            creatorNodeOptions.creationLimit = userShapeSpec.creationLimit;
          }
          this.activeShapeNodeCreators.push({
            createNode: () => new ShapeCreatorNode(userShapeSpec.shape, userShapeSpec.color, this.model.simSpecificModel.addUserCreatedMovableShape.bind(this.model.simSpecificModel), creatorNodeOptions)
          });
        });

        // Add a scrolling carousel.
        this.carousel = new Carousel(this.activeShapeNodeCreators, {
          orientation: 'horizontal',
          itemsPerPage: ITEMS_PER_CAROUSEL_PAGE,
          centerX: this.shapeBoardOriginalBounds.centerX,
          top: this.shapeBoardOriginalBounds.bottom + SPACE_AROUND_SHAPE_PLACEMENT_BOARD,
          fill: AreaBuilderSharedConstants.CONTROL_PANEL_BACKGROUND_COLOR
        });
        this.shapeCarouselLayer.addChild(this.carousel);
      }
    }
  }

  // @private, Utility method for hiding all of the game nodes whose visibility changes during the course of a challenge.
  hideAllGameNodes() {
    this.gameControlButtons.forEach(button => {
      button.visible = false;
    });
    this.setNodeVisibility(false, [this.startGameLevelNode, this.faceWithPointsNode, this.scoreboard, this.controlPanel, this.challengePromptBanner, this.solutionBanner, this.numberEntryControl, this.areaQuestionPrompt, this.youBuiltWindow, this.youEnteredWindow, this.shapeCarouselLayer, this.eraserButton]);
  }

  // @private
  show(nodesToShow) {
    nodesToShow.forEach(nodeToShow => {
      nodeToShow.visible = true;
    });
  }

  // @private
  setNodeVisibility(isVisible, nodes) {
    nodes.forEach(node => {
      node.visible = isVisible;
    });
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
    if (this.model.currentChallengeProperty.get()) {
      if (this.model.currentChallengeProperty.get().checkSpec === 'areaEntered') {
        this.checkAnswerButton.enabled = this.numberEntryControl.keypad.valueStringProperty.value.length > 0;
      } else {
        this.checkAnswerButton.enabled = this.model.simSpecificModel.shapePlacementBoard.areaAndPerimeterProperty.get().area > 0;
      }
    }
  }

  // @private
  showLevelResultsNode() {
    // Set a new "level completed" node based on the results.
    let levelCompletedNode = new LevelCompletedNode(this.model.levelProperty.get() + 1, this.model.scoreProperty.get(), this.model.maxPossibleScore, this.model.challengesPerSet, this.model.timerEnabledProperty.get(), this.model.elapsedTimeProperty.get(), this.model.bestTimes[this.model.levelProperty.get()], this.model.newBestTime, () => {
      this.model.gameStateProperty.set(GameState.CHOOSING_LEVEL);
      this.rootNode.removeChild(levelCompletedNode);
      levelCompletedNode = null;
    }, {
      center: this.layoutBounds.center
    });

    // Add the node.
    this.rootNode.addChild(levelCompletedNode);
  }
}
areaBuilder.register('AreaBuilderGameView', AreaBuilderGameView);
export default AreaBuilderGameView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW5WaWV3IiwibWVyZ2UiLCJTdHJpbmdVdGlscyIsIkVyYXNlckJ1dHRvbiIsIkZhY2VXaXRoUG9pbnRzTm9kZSIsIk51bWJlckVudHJ5Q29udHJvbCIsIlBoZXRDb2xvclNjaGVtZSIsIlBoZXRGb250IiwiTm9kZSIsIlRleHQiLCJWQm94IiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiVGV4dFB1c2hCdXR0b24iLCJDYXJvdXNlbCIsIlBhbmVsIiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwiR2FtZUF1ZGlvUGxheWVyIiwiTGV2ZWxDb21wbGV0ZWROb2RlIiwiVmVnYXNTdHJpbmdzIiwiYXJlYUJ1aWxkZXIiLCJBcmVhQnVpbGRlclN0cmluZ3MiLCJBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyIsIkFyZWFCdWlsZGVyQ29udHJvbFBhbmVsIiwiU2hhcGVDcmVhdG9yTm9kZSIsIlNoYXBlTm9kZSIsIlNoYXBlUGxhY2VtZW50Qm9hcmROb2RlIiwiQXJlYUJ1aWxkZXJHYW1lTW9kZWwiLCJCdWlsZFNwZWMiLCJHYW1lU3RhdGUiLCJBcmVhQnVpbGRlclNjb3JlYm9hcmQiLCJDb2xvclByb3BvcnRpb25zUHJvbXB0IiwiR2FtZUljb25GYWN0b3J5IiwiR2FtZUluZm9CYW5uZXIiLCJTdGFydEdhbWVMZXZlbE5vZGUiLCJZb3VCdWlsdFdpbmRvdyIsIllvdUVudGVyZWRXaW5kb3ciLCJhcmVhRXF1YWxzU3RyaW5nIiwiYXJlYUVxdWFscyIsImFyZWFRdWVzdGlvblN0cmluZyIsImFyZWFRdWVzdGlvbiIsImFTb2x1dGlvbkNvbG9uU3RyaW5nIiwiYVNvbHV0aW9uQ29sb24iLCJhU29sdXRpb25TdHJpbmciLCJhU29sdXRpb24iLCJidWlsZEl0U3RyaW5nIiwiYnVpbGRJdCIsImNoZWNrU3RyaW5nIiwiY2hlY2siLCJmaW5kVGhlQXJlYVN0cmluZyIsImZpbmRUaGVBcmVhIiwibmV4dFN0cmluZyIsIm5leHQiLCJwZXJpbWV0ZXJFcXVhbHNTdHJpbmciLCJwZXJpbWV0ZXJFcXVhbHMiLCJzb2x1dGlvbkNvbG9uU3RyaW5nIiwic29sdXRpb25Db2xvbiIsInNvbHV0aW9uU3RyaW5nIiwic29sdXRpb24iLCJzdGFydE92ZXJTdHJpbmciLCJzdGFydE92ZXIiLCJ0cnlBZ2FpblN0cmluZyIsInRyeUFnYWluIiwieW91ckdvYWxTdHJpbmciLCJ5b3VyR29hbCIsIkJVVFRPTl9GT05UIiwiQlVUVE9OX0ZJTEwiLCJCVVRUT05fWUVMTE9XIiwiSU5GT19CQU5ORVJfSEVJR0hUIiwiR09BTF9QUk9NUFRfRk9OVCIsInNpemUiLCJ3ZWlnaHQiLCJTUEFDRV9BUk9VTkRfU0hBUEVfUExBQ0VNRU5UX0JPQVJEIiwiQ09OVFJPTFNfSU5TRVQiLCJJVEVNU19QRVJfQ0FST1VTRUxfUEFHRSIsIkJVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OIiwiQXJlYUJ1aWxkZXJHYW1lVmlldyIsImNvbnN0cnVjdG9yIiwiZ2FtZU1vZGVsIiwibGF5b3V0Qm91bmRzIiwiTEFZT1VUX0JPVU5EUyIsInNlbGYiLCJtb2RlbCIsImdhbWVBdWRpb1BsYXllciIsInJvb3ROb2RlIiwiYWRkQ2hpbGQiLCJtb3ZlVG9CYWNrIiwiY29udHJvbExheWVyIiwiY2hhbGxlbmdlTGF5ZXIiLCJzdGFydEdhbWVMZXZlbE5vZGUiLCJsZXZlbCIsIm51bWJlckVudHJ5Q29udHJvbCIsImNsZWFyIiwic3RhcnRMZXZlbCIsInJlc2V0IiwiZGlzcG9zZUN1cnJlbnRDYXJvdXNlbCIsInRpbWVyRW5hYmxlZFByb3BlcnR5IiwiY3JlYXRlSWNvbiIsImJlc3RTY29yZVByb3BlcnRpZXMiLCJudW1TdGFyc09uQnV0dG9ucyIsImNoYWxsZW5nZXNQZXJTZXQiLCJwZXJmZWN0U2NvcmUiLCJtYXhQb3NzaWJsZVNjb3JlIiwibnVtTGV2ZWxzIiwibnVtYmVyT2ZMZXZlbHMiLCJudW1CdXR0b25Sb3dzIiwiY29udHJvbHNJbnNldCIsInNoYXBlQm9hcmQiLCJzaW1TcGVjaWZpY01vZGVsIiwic2hhcGVQbGFjZW1lbnRCb2FyZCIsInNoYXBlQm9hcmRPcmlnaW5hbEJvdW5kcyIsImJvdW5kcyIsImNvcHkiLCJtYXhTaGFwZUJvYXJkVGV4dFdpZHRoIiwid2lkdGgiLCJ5b3VyR29hbFRpdGxlIiwiZm9udCIsIm1heFdpZHRoIiwiZXJhc2VyQnV0dG9uIiwicmlnaHQiLCJsZWZ0IiwidG9wIiwiYm90dG9tIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibGlzdGVuZXIiLCJjaGFsbGVuZ2UiLCJjdXJyZW50Q2hhbGxlbmdlUHJvcGVydHkiLCJnZXQiLCJzaGFwZVJlbGVhc2VNb2RlIiwiY2hlY2tTcGVjIiwidXNlclNoYXBlcyIsImNyZWF0aW9uTGltaXQiLCJyZWxlYXNlQWxsU2hhcGVzIiwiZ2FtZVN0YXRlUHJvcGVydHkiLCJ2YWx1ZSIsIlNIT1dJTkdfSU5DT1JSRUNUX0FOU1dFUl9GRUVEQkFDS19UUllfQUdBSU4iLCJ5b3VCdWlsdFdpbmRvdyIsInlvdUVudGVyZWRXaW5kb3ciLCJjaGFsbGVuZ2VQcm9tcHRCYW5uZXIiLCJzb2x1dGlvbkJhbm5lciIsImNvbnRyb2xQYW5lbCIsInNob3dHcmlkT25Cb2FyZFByb3BlcnR5Iiwic2hvd0RpbWVuc2lvbnNQcm9wZXJ0eSIsImNlbnRlclgiLCJ4Iiwic2NvcmVib2FyZCIsImxldmVsUHJvcGVydHkiLCJjaGFsbGVuZ2VJbmRleFByb3BlcnR5Iiwic2NvcmVQcm9wZXJ0eSIsImVsYXBzZWRUaW1lUHJvcGVydHkiLCJsaW5rIiwidGltZXJFbmFibGVkIiwidGltZVZpc2libGVQcm9wZXJ0eSIsInNldCIsImNvbnRlbnQiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJzZXRDaG9vc2luZ0xldmVsU3RhdGUiLCJiYXNlQ29sb3IiLCJjZW50ZXJZIiwiYnVpbGRQcm9tcHRWQm94IiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwiYnVpbGRQcm9tcHRQYW5lbCIsInN0cm9rZSIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiYXJlYU9mVXNlckNyZWF0ZWRTaGFwZSIsInBlcmltZXRlck9mVXNlckNyZWF0ZWRTaGFwZSIsImNvbG9yMVByb3BvcnRpb24iLCJnYW1lQ29udHJvbEJ1dHRvbnMiLCJidXR0b25PcHRpb25zIiwiY29ybmVyUmFkaXVzIiwibWF4WCIsImNoZWNrQW5zd2VyQnV0dG9uIiwidXBkYXRlVXNlckFuc3dlciIsImNoZWNrQW5zd2VyIiwicHVzaCIsIm5leHRCdXR0b24iLCJuZXh0Q2hhbGxlbmdlIiwidHJ5QWdhaW5CdXR0b24iLCJzb2x1dGlvbkJ1dHRvbiIsImRpc3BsYXlDb3JyZWN0QW5zd2VyIiwic2hvd0FTb2x1dGlvbkJ1dHRvbiIsIm9rYXlUb1VwZGF0ZVlvdUJ1aWx0V2luZG93IiwiYnV0dG9uQ2VudGVyWCIsImJ1dHRvbkJvdHRvbSIsImZvckVhY2giLCJidXR0b24iLCJhcmVhUXVlc3Rpb25Qcm9tcHQiLCJrZXlwYWQiLCJ2YWx1ZVN0cmluZ1Byb3BlcnR5IiwidmFsdWVTdHJpbmciLCJ1cGRhdGVkQ2hlY2tCdXR0b25FbmFibGVkU3RhdGUiLCJmYWNlV2l0aFBvaW50c05vZGUiLCJmYWNlRGlhbWV0ZXIiLCJwb2ludHNBbGlnbm1lbnQiLCJwb2ludHNGb250IiwibW92YWJsZVNoYXBlcyIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwiYWRkZWRTaGFwZSIsInNoYXBlTm9kZSIsInVzZXJDb250cm9sbGVkTGlzdGVuZXIiLCJ1c2VyQ29udHJvbGxlZCIsIm1vdmVUb0Zyb250IiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJyZW1vdmFsTGlzdGVuZXIiLCJyZW1vdmVkU2hhcGUiLCJyZW1vdmVDaGlsZCIsImRpc3Bvc2UiLCJ1bmxpbmsiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwib3BhY2l0eSIsImZyb20iLCJ0byIsInNldFZhbHVlIiwiZHVyYXRpb24iLCJlYXNpbmciLCJDVUJJQ19JTl9PVVQiLCJzdGFydCIsImJ1aWxkU3BlYyIsImJ1aWxkU3BlY1Byb3BlcnR5IiwiU0hPV0lOR19JTkNPUlJFQ1RfQU5TV0VSX0ZFRURCQUNLX01PVkVfT04iLCJpc0FueVNoYXBlTW92aW5nIiwiYXJlYUFuZFBlcmltZXRlclByb3BlcnR5IiwiYXJlYUFuZFBlcmltZXRlciIsInVwZGF0ZVlvdUJ1aWx0V2luZG93IiwiYWN0aXZlU2hhcGVOb2RlQ3JlYXRvcnMiLCJjYXJvdXNlbCIsImxldmVsQ29tcGxldGVkTm9kZSIsInNoYXBlQ2Fyb3VzZWxMYXllciIsImNsZWFyRGltZW5zaW9uc0NvbnRyb2xPbk5leHRDaGFsbGVuZ2UiLCJoYW5kbGVHYW1lU3RhdGVDaGFuZ2UiLCJiaW5kIiwiZ2FtZVN0YXRlIiwiaGlkZUFsbEdhbWVOb2RlcyIsIkNIT09TSU5HX0xFVkVMIiwiaGFuZGxlQ2hvb3NpbmdMZXZlbFN0YXRlIiwiUFJFU0VOVElOR19JTlRFUkFDVElWRV9DSEFMTEVOR0UiLCJoYW5kbGVQcmVzZW50aW5nSW50ZXJhY3RpdmVDaGFsbGVuZ2VTdGF0ZSIsIlNIT1dJTkdfQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0siLCJoYW5kbGVTaG93aW5nQ29ycmVjdEFuc3dlckZlZWRiYWNrU3RhdGUiLCJoYW5kbGVTaG93aW5nSW5jb3JyZWN0QW5zd2VyRmVlZGJhY2tUcnlBZ2FpblN0YXRlIiwiaGFuZGxlU2hvd2luZ0luY29ycmVjdEFuc3dlckZlZWRiYWNrTW92ZU9uU3RhdGUiLCJESVNQTEFZSU5HX0NPUlJFQ1RfQU5TV0VSIiwiaGFuZGxlRGlzcGxheWluZ0NvcnJlY3RBbnN3ZXJTdGF0ZSIsIlNIT1dJTkdfTEVWRUxfUkVTVUxUUyIsImhhbmRsZVNob3dpbmdMZXZlbFJlc3VsdHNTdGF0ZSIsIkVycm9yIiwic2hvdyIsImhpZGVDaGFsbGVuZ2UiLCJwaWNrYWJsZSIsInByZXNlbnRDaGFsbGVuZ2UiLCJub2Rlc1RvU2hvdyIsInNob3dDaGFsbGVuZ2VHcmFwaGljcyIsInVwZGF0ZVlvdUVudGVyZWRXaW5kb3ciLCJjb3JyZWN0QW5zd2VyIiwic21pbGUiLCJzZXRQb2ludHMiLCJnZXRDaGFsbGVuZ2VDdXJyZW50UG9pbnRWYWx1ZSIsIndyb25nQW5zd2VyIiwiZnJvd24iLCJzZXRDbGVhck9uTmV4dEtleVByZXNzIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsImFyZWFUb0ZpbmRQcm9wZXJ0eSIsImJhY2tncm91bmRTaGFwZSIsInVuaXRBcmVhIiwiZ2FtZU92ZXJQZXJmZWN0U2NvcmUiLCJnYW1lT3Zlclplcm9TY29yZSIsImdhbWVPdmVySW1wZXJmZWN0U2NvcmUiLCJzaG93TGV2ZWxSZXN1bHRzTm9kZSIsImFzc2VydCIsInVzZXJCdWlsdFNwZWMiLCJwZXJpbWV0ZXIiLCJwcm9wb3J0aW9ucyIsImNvbG9yMSIsImNvbG9yMiIsInNldEJ1aWxkU3BlYyIsInNldENvbG9yQmFzZWRPbkFuc3dlckNvcnJlY3RuZXNzIiwiZXF1YWxzIiwic2V0VmFsdWVFbnRlcmVkIiwiYXJlYUd1ZXNzIiwiYXJlYSIsImdldFByb3BvcnRpb25PZkNvbG9yIiwiaSIsImxlbmd0aCIsImFuaW1hdGluZ1Byb3BlcnR5IiwiaW5jb3JyZWN0R3Vlc3Nlc09uQ3VycmVudENoYWxsZW5nZSIsImNsZWFyU2hhcGVQbGFjZW1lbnRCb2FyZCIsInJlbW92ZUFsbENoaWxkcmVuIiwiYXJlYUdvYWxOb2RlIiwiZm9ybWF0IiwiYXJlYVByb21wdCIsInN0cmluZyIsImNvbG9yUHJvcG9ydGlvbnNQcm9tcHQiLCJzY2FsZSIsInZpc2libGUiLCJkaW1lbnNpb25zSWNvbiIsInNldEdyaWRWaXNpYmxlIiwiZ3JpZENvbnRyb2xWaXNpYmxlUHJvcGVydHkiLCJ0b29sU3BlYyIsImdyaWRDb250cm9sIiwiZGltZW5zaW9uc0NvbnRyb2xWaXNpYmxlUHJvcGVydHkiLCJkaW1lbnNpb25zQ29udHJvbCIsInNldENvbG9yIiwiZmlsbENvbG9yIiwiY29sb3IiLCJHUkVFTklTSF9DT0xPUiIsInVzZXJTaGFwZVNwZWMiLCJjcmVhdG9yTm9kZU9wdGlvbnMiLCJncmlkU3BhY2luZyIsIlVOSVRfU1FVQVJFX0xFTkdUSCIsInNoYXBlRHJhZ0JvdW5kcyIsIm5vbk1vdmluZ0FuY2VzdG9yIiwiY3JlYXRlTm9kZSIsInNoYXBlIiwiYWRkVXNlckNyZWF0ZWRNb3ZhYmxlU2hhcGUiLCJvcmllbnRhdGlvbiIsIml0ZW1zUGVyUGFnZSIsImZpbGwiLCJDT05UUk9MX1BBTkVMX0JBQ0tHUk9VTkRfQ09MT1IiLCJzZXROb2RlVmlzaWJpbGl0eSIsIm5vZGVUb1Nob3ciLCJpc1Zpc2libGUiLCJub2RlcyIsIm5vZGUiLCJlbmFibGVkIiwiYmVzdFRpbWVzIiwibmV3QmVzdFRpbWUiLCJjZW50ZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFyZWFCdWlsZGVyR2FtZVZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiB2aWV3IGZvciB0aGUgYXJlYSBidWlsZGVyIGdhbWUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgRXJhc2VyQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL0VyYXNlckJ1dHRvbi5qcyc7XHJcbmltcG9ydCBGYWNlV2l0aFBvaW50c05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0ZhY2VXaXRoUG9pbnRzTm9kZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJFbnRyeUNvbnRyb2wgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL051bWJlckVudHJ5Q29udHJvbC5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgVGV4dFB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvVGV4dFB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgQ2Fyb3VzZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0Nhcm91c2VsLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBBbmltYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvQW5pbWF0aW9uLmpzJztcclxuaW1wb3J0IEVhc2luZyBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9FYXNpbmcuanMnO1xyXG5pbXBvcnQgR2FtZUF1ZGlvUGxheWVyIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0dhbWVBdWRpb1BsYXllci5qcyc7XHJcbmltcG9ydCBMZXZlbENvbXBsZXRlZE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvTGV2ZWxDb21wbGV0ZWROb2RlLmpzJztcclxuaW1wb3J0IFZlZ2FzU3RyaW5ncyBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9WZWdhc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgYXJlYUJ1aWxkZXIgZnJvbSAnLi4vLi4vYXJlYUJ1aWxkZXIuanMnO1xyXG5pbXBvcnQgQXJlYUJ1aWxkZXJTdHJpbmdzIGZyb20gJy4uLy4uL0FyZWFCdWlsZGVyU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQXJlYUJ1aWxkZXJDb250cm9sUGFuZWwgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQXJlYUJ1aWxkZXJDb250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgU2hhcGVDcmVhdG9yTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9TaGFwZUNyZWF0b3JOb2RlLmpzJztcclxuaW1wb3J0IFNoYXBlTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9TaGFwZU5vZGUuanMnO1xyXG5pbXBvcnQgU2hhcGVQbGFjZW1lbnRCb2FyZE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU2hhcGVQbGFjZW1lbnRCb2FyZE5vZGUuanMnO1xyXG5pbXBvcnQgQXJlYUJ1aWxkZXJHYW1lTW9kZWwgZnJvbSAnLi4vbW9kZWwvQXJlYUJ1aWxkZXJHYW1lTW9kZWwuanMnO1xyXG5pbXBvcnQgQnVpbGRTcGVjIGZyb20gJy4uL21vZGVsL0J1aWxkU3BlYy5qcyc7XHJcbmltcG9ydCBHYW1lU3RhdGUgZnJvbSAnLi4vbW9kZWwvR2FtZVN0YXRlLmpzJztcclxuaW1wb3J0IEFyZWFCdWlsZGVyU2NvcmVib2FyZCBmcm9tICcuL0FyZWFCdWlsZGVyU2NvcmVib2FyZC5qcyc7XHJcbmltcG9ydCBDb2xvclByb3BvcnRpb25zUHJvbXB0IGZyb20gJy4vQ29sb3JQcm9wb3J0aW9uc1Byb21wdC5qcyc7XHJcbmltcG9ydCBHYW1lSWNvbkZhY3RvcnkgZnJvbSAnLi9HYW1lSWNvbkZhY3RvcnkuanMnO1xyXG5pbXBvcnQgR2FtZUluZm9CYW5uZXIgZnJvbSAnLi9HYW1lSW5mb0Jhbm5lci5qcyc7XHJcbmltcG9ydCBTdGFydEdhbWVMZXZlbE5vZGUgZnJvbSAnLi9TdGFydEdhbWVMZXZlbE5vZGUuanMnO1xyXG5pbXBvcnQgWW91QnVpbHRXaW5kb3cgZnJvbSAnLi9Zb3VCdWlsdFdpbmRvdy5qcyc7XHJcbmltcG9ydCBZb3VFbnRlcmVkV2luZG93IGZyb20gJy4vWW91RW50ZXJlZFdpbmRvdy5qcyc7XHJcblxyXG5jb25zdCBhcmVhRXF1YWxzU3RyaW5nID0gQXJlYUJ1aWxkZXJTdHJpbmdzLmFyZWFFcXVhbHM7XHJcbmNvbnN0IGFyZWFRdWVzdGlvblN0cmluZyA9IEFyZWFCdWlsZGVyU3RyaW5ncy5hcmVhUXVlc3Rpb247XHJcbmNvbnN0IGFTb2x1dGlvbkNvbG9uU3RyaW5nID0gQXJlYUJ1aWxkZXJTdHJpbmdzLmFTb2x1dGlvbkNvbG9uO1xyXG5jb25zdCBhU29sdXRpb25TdHJpbmcgPSBBcmVhQnVpbGRlclN0cmluZ3MuYVNvbHV0aW9uO1xyXG5jb25zdCBidWlsZEl0U3RyaW5nID0gQXJlYUJ1aWxkZXJTdHJpbmdzLmJ1aWxkSXQ7XHJcbmNvbnN0IGNoZWNrU3RyaW5nID0gVmVnYXNTdHJpbmdzLmNoZWNrO1xyXG5jb25zdCBmaW5kVGhlQXJlYVN0cmluZyA9IEFyZWFCdWlsZGVyU3RyaW5ncy5maW5kVGhlQXJlYTtcclxuY29uc3QgbmV4dFN0cmluZyA9IFZlZ2FzU3RyaW5ncy5uZXh0O1xyXG5jb25zdCBwZXJpbWV0ZXJFcXVhbHNTdHJpbmcgPSBBcmVhQnVpbGRlclN0cmluZ3MucGVyaW1ldGVyRXF1YWxzO1xyXG5jb25zdCBzb2x1dGlvbkNvbG9uU3RyaW5nID0gQXJlYUJ1aWxkZXJTdHJpbmdzLnNvbHV0aW9uQ29sb247XHJcbmNvbnN0IHNvbHV0aW9uU3RyaW5nID0gQXJlYUJ1aWxkZXJTdHJpbmdzLnNvbHV0aW9uO1xyXG5jb25zdCBzdGFydE92ZXJTdHJpbmcgPSBBcmVhQnVpbGRlclN0cmluZ3Muc3RhcnRPdmVyO1xyXG5jb25zdCB0cnlBZ2FpblN0cmluZyA9IFZlZ2FzU3RyaW5ncy50cnlBZ2FpbjtcclxuY29uc3QgeW91ckdvYWxTdHJpbmcgPSBBcmVhQnVpbGRlclN0cmluZ3MueW91ckdvYWw7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQlVUVE9OX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE4ICk7XHJcbmNvbnN0IEJVVFRPTl9GSUxMID0gUGhldENvbG9yU2NoZW1lLkJVVFRPTl9ZRUxMT1c7XHJcbmNvbnN0IElORk9fQkFOTkVSX0hFSUdIVCA9IDYwOyAvLyBIZWlnaHQgb2YgdGhlIHByb21wdCBhbmQgc29sdXRpb24gYmFubmVycywgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZC5cclxuY29uc3QgR09BTF9QUk9NUFRfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyMCwgd2VpZ2h0OiAnYm9sZCcgfSApO1xyXG5jb25zdCBTUEFDRV9BUk9VTkRfU0hBUEVfUExBQ0VNRU5UX0JPQVJEID0gQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuQ09OVFJPTFNfSU5TRVQ7XHJcbmNvbnN0IElURU1TX1BFUl9DQVJPVVNFTF9QQUdFID0gNDtcclxuY29uc3QgQlVUVE9OX1RPVUNIX0FSRUFfRElMQVRJT04gPSA3O1xyXG5cclxuY2xhc3MgQXJlYUJ1aWxkZXJHYW1lVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0FyZWFCdWlsZGVyR2FtZU1vZGVsfSBnYW1lTW9kZWxcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZ2FtZU1vZGVsICkge1xyXG4gICAgc3VwZXIoIHsgbGF5b3V0Qm91bmRzOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5MQVlPVVRfQk9VTkRTIH0gKTtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgdGhpcy5tb2RlbCA9IGdhbWVNb2RlbDtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGdhbWUgYXVkaW8gcGxheWVyLlxyXG4gICAgdGhpcy5nYW1lQXVkaW9QbGF5ZXIgPSBuZXcgR2FtZUF1ZGlvUGxheWVyKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgcm9vdCBub2RlIGFuZCBzZW5kIHRvIGJhY2sgc28gdGhhdCB0aGUgbGF5b3V0IGJvdW5kcyBib3ggY2FuIGJlIG1hZGUgdmlzaWJsZSBpZiBuZWVkZWQuXHJcbiAgICB0aGlzLnJvb3ROb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucm9vdE5vZGUgKTtcclxuICAgIHRoaXMucm9vdE5vZGUubW92ZVRvQmFjaygpO1xyXG5cclxuICAgIC8vIEFkZCBsYXllcnMgdXNlZCB0byBjb250cm9sIGdhbWUgYXBwZWFyYW5jZS5cclxuICAgIHRoaXMuY29udHJvbExheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMucm9vdE5vZGUuYWRkQ2hpbGQoIHRoaXMuY29udHJvbExheWVyICk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMucm9vdE5vZGUuYWRkQ2hpbGQoIHRoaXMuY2hhbGxlbmdlTGF5ZXIgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIG5vZGUgdGhhdCBhbGxvd3MgdGhlIHVzZXIgdG8gY2hvb3NlIGEgZ2FtZSBsZXZlbCB0byBwbGF5LlxyXG4gICAgdGhpcy5zdGFydEdhbWVMZXZlbE5vZGUgPSBuZXcgU3RhcnRHYW1lTGV2ZWxOb2RlKFxyXG4gICAgICBsZXZlbCA9PiB7XHJcbiAgICAgICAgdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wuY2xlYXIoKTtcclxuICAgICAgICBnYW1lTW9kZWwuc3RhcnRMZXZlbCggbGV2ZWwgKTtcclxuICAgICAgfSxcclxuICAgICAgKCkgPT4ge1xyXG4gICAgICAgIGdhbWVNb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuZGlzcG9zZUN1cnJlbnRDYXJvdXNlbCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBnYW1lTW9kZWwudGltZXJFbmFibGVkUHJvcGVydHksXHJcbiAgICAgIFtcclxuICAgICAgICBHYW1lSWNvbkZhY3RvcnkuY3JlYXRlSWNvbiggMSApLFxyXG4gICAgICAgIEdhbWVJY29uRmFjdG9yeS5jcmVhdGVJY29uKCAyICksXHJcbiAgICAgICAgR2FtZUljb25GYWN0b3J5LmNyZWF0ZUljb24oIDMgKSxcclxuICAgICAgICBHYW1lSWNvbkZhY3RvcnkuY3JlYXRlSWNvbiggNCApLFxyXG4gICAgICAgIEdhbWVJY29uRmFjdG9yeS5jcmVhdGVJY29uKCA1ICksXHJcbiAgICAgICAgR2FtZUljb25GYWN0b3J5LmNyZWF0ZUljb24oIDYgKVxyXG4gICAgICBdLFxyXG4gICAgICBnYW1lTW9kZWwuYmVzdFNjb3JlUHJvcGVydGllcyxcclxuICAgICAge1xyXG4gICAgICAgIG51bVN0YXJzT25CdXR0b25zOiBnYW1lTW9kZWwuY2hhbGxlbmdlc1BlclNldCxcclxuICAgICAgICBwZXJmZWN0U2NvcmU6IGdhbWVNb2RlbC5tYXhQb3NzaWJsZVNjb3JlLFxyXG4gICAgICAgIG51bUxldmVsczogZ2FtZU1vZGVsLm51bWJlck9mTGV2ZWxzLFxyXG4gICAgICAgIG51bUJ1dHRvblJvd3M6IDIsXHJcbiAgICAgICAgY29udHJvbHNJbnNldDogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuQ09OVFJPTFNfSU5TRVRcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHRoaXMucm9vdE5vZGUuYWRkQ2hpbGQoIHRoaXMuc3RhcnRHYW1lTGV2ZWxOb2RlICk7XHJcblxyXG4gICAgLy8gU2V0IHVwIHRoZSBjb25zdGFudCBwb3J0aW9ucyBvZiB0aGUgY2hhbGxlbmdlIHZpZXcuXHJcbiAgICB0aGlzLnNoYXBlQm9hcmQgPSBuZXcgU2hhcGVQbGFjZW1lbnRCb2FyZE5vZGUoIGdhbWVNb2RlbC5zaW1TcGVjaWZpY01vZGVsLnNoYXBlUGxhY2VtZW50Qm9hcmQgKTtcclxuICAgIHRoaXMuc2hhcGVCb2FyZE9yaWdpbmFsQm91bmRzID0gdGhpcy5zaGFwZUJvYXJkLmJvdW5kcy5jb3B5KCk7IC8vIE5lY2Vzc2FyeSBiZWNhdXNlIHRoZSBzaGFwZSBib2FyZCdzIGJvdW5kcyBjYW4gdmFyeSB3aGVuIHNoYXBlcyBhcmUgcGxhY2VkLlxyXG4gICAgdGhpcy5tYXhTaGFwZUJvYXJkVGV4dFdpZHRoID0gdGhpcy5zaGFwZUJvYXJkT3JpZ2luYWxCb3VuZHMud2lkdGggKiAwLjk7XHJcbiAgICB0aGlzLnlvdXJHb2FsVGl0bGUgPSBuZXcgVGV4dCggeW91ckdvYWxTdHJpbmcsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDI0LCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgICAgIG1heFdpZHRoOiB0aGlzLm1heFNoYXBlQm9hcmRUZXh0V2lkdGhcclxuICAgIH0gKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuc2hhcGVCb2FyZCApO1xyXG4gICAgdGhpcy5lcmFzZXJCdXR0b24gPSBuZXcgRXJhc2VyQnV0dG9uKCB7XHJcbiAgICAgIHJpZ2h0OiB0aGlzLnNoYXBlQm9hcmQubGVmdCxcclxuICAgICAgdG9wOiB0aGlzLnNoYXBlQm9hcmQuYm90dG9tICsgU1BBQ0VfQVJPVU5EX1NIQVBFX1BMQUNFTUVOVF9CT0FSRCxcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiBCVVRUT05fVE9VQ0hfQVJFQV9ESUxBVElPTixcclxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiBCVVRUT05fVE9VQ0hfQVJFQV9ESUxBVElPTixcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgY2hhbGxlbmdlID0gZ2FtZU1vZGVsLmN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICBsZXQgc2hhcGVSZWxlYXNlTW9kZSA9ICdmYWRlJztcclxuXHJcbiAgICAgICAgaWYgKCBjaGFsbGVuZ2UuY2hlY2tTcGVjID09PSAnYXJlYUVudGVyZWQnICYmIGNoYWxsZW5nZS51c2VyU2hhcGVzICYmIGNoYWxsZW5nZS51c2VyU2hhcGVzWyAwIF0uY3JlYXRpb25MaW1pdCApIHtcclxuXHJcbiAgICAgICAgICAvLyBJbiB0aGUgY2FzZSB3aGVyZSB0aGVyZSBpcyBhIGxpbWl0ZWQgbnVtYmVyIG9mIHNoYXBlcywgaGF2ZSB0aGVtIGFuaW1hdGUgYmFjayB0byB0aGUgY2Fyb3VzZWwgaW5zdGVhZCBvZlxyXG4gICAgICAgICAgLy8gZmFkaW5nIGF3YXkgc28gdGhhdCB0aGUgdXNlciB1bmRlcnN0YW5kcyB0aGF0IHRoZSBzdGFzaCBpcyBiZWluZyByZXBsZW5pc2hlZC5cclxuICAgICAgICAgIHNoYXBlUmVsZWFzZU1vZGUgPSAnYW5pbWF0ZUhvbWUnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBnYW1lTW9kZWwuc2ltU3BlY2lmaWNNb2RlbC5zaGFwZVBsYWNlbWVudEJvYXJkLnJlbGVhc2VBbGxTaGFwZXMoIHNoYXBlUmVsZWFzZU1vZGUgKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGdhbWUgd2FzIHNob3dpbmcgdGhlIHVzZXIgaW5jb3JyZWN0IGZlZWRiYWNrIHdoZW4gdGhleSBwcmVzc2VkIHRoaXMgYnV0dG9uLCBhdXRvLWFkdmFuY2UgdG8gdGhlXHJcbiAgICAgICAgLy8gbmV4dCBzdGF0ZS5cclxuICAgICAgICBpZiAoIGdhbWVNb2RlbC5nYW1lU3RhdGVQcm9wZXJ0eS52YWx1ZSA9PT0gR2FtZVN0YXRlLlNIT1dJTkdfSU5DT1JSRUNUX0FOU1dFUl9GRUVEQkFDS19UUllfQUdBSU4gKSB7XHJcbiAgICAgICAgICB0aGlzLm51bWJlckVudHJ5Q29udHJvbC5jbGVhcigpO1xyXG4gICAgICAgICAgZ2FtZU1vZGVsLnRyeUFnYWluKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCB0aGlzLmVyYXNlckJ1dHRvbiApO1xyXG4gICAgdGhpcy55b3VCdWlsdFdpbmRvdyA9IG5ldyBZb3VCdWlsdFdpbmRvdyggdGhpcy5sYXlvdXRCb3VuZHMud2lkdGggLSB0aGlzLnNoYXBlQm9hcmQucmlnaHQgLSAxNCApO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllci5hZGRDaGlsZCggdGhpcy55b3VCdWlsdFdpbmRvdyApO1xyXG4gICAgdGhpcy55b3VFbnRlcmVkV2luZG93ID0gbmV3IFlvdUVudGVyZWRXaW5kb3coIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoIC0gdGhpcy5zaGFwZUJvYXJkLnJpZ2h0IC0gMTQgKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHRoaXMueW91RW50ZXJlZFdpbmRvdyApO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VQcm9tcHRCYW5uZXIgPSBuZXcgR2FtZUluZm9CYW5uZXIoIHRoaXMuc2hhcGVCb2FyZC53aWR0aCwgSU5GT19CQU5ORVJfSEVJR0hULCAnIzFiMTQ2NCcsIHtcclxuICAgICAgbGVmdDogdGhpcy5zaGFwZUJvYXJkLmxlZnQsXHJcbiAgICAgIGJvdHRvbTogdGhpcy5zaGFwZUJvYXJkLnRvcCAtIFNQQUNFX0FST1VORF9TSEFQRV9QTEFDRU1FTlRfQk9BUkRcclxuICAgIH0gKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuY2hhbGxlbmdlUHJvbXB0QmFubmVyICk7XHJcbiAgICB0aGlzLnNvbHV0aW9uQmFubmVyID0gbmV3IEdhbWVJbmZvQmFubmVyKCB0aGlzLnNoYXBlQm9hcmQud2lkdGgsIElORk9fQkFOTkVSX0hFSUdIVCwgJyNmYmIwM2InLCB7XHJcbiAgICAgIGxlZnQ6IHRoaXMuc2hhcGVCb2FyZC5sZWZ0LFxyXG4gICAgICBib3R0b206IHRoaXMuc2hhcGVCb2FyZC50b3AgLSBTUEFDRV9BUk9VTkRfU0hBUEVfUExBQ0VNRU5UX0JPQVJEXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCB0aGlzLnNvbHV0aW9uQmFubmVyICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBjb250cm9sIHBhbmVsXHJcbiAgICB0aGlzLmNvbnRyb2xQYW5lbCA9IG5ldyBBcmVhQnVpbGRlckNvbnRyb2xQYW5lbChcclxuICAgICAgZ2FtZU1vZGVsLnNpbVNwZWNpZmljTW9kZWwuc2hvd0dyaWRPbkJvYXJkUHJvcGVydHksXHJcbiAgICAgIGdhbWVNb2RlbC5zaW1TcGVjaWZpY01vZGVsLnNob3dEaW1lbnNpb25zUHJvcGVydHksXHJcbiAgICAgIHsgY2VudGVyWDogKCB0aGlzLmxheW91dEJvdW5kcy54ICsgdGhpcy5zaGFwZUJvYXJkLmxlZnQgKSAvIDIsIGJvdHRvbTogdGhpcy5zaGFwZUJvYXJkLmJvdHRvbSB9XHJcbiAgICApO1xyXG4gICAgdGhpcy5jb250cm9sTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuY29udHJvbFBhbmVsICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBzY29yZWJvYXJkLlxyXG4gICAgdGhpcy5zY29yZWJvYXJkID0gbmV3IEFyZWFCdWlsZGVyU2NvcmVib2FyZChcclxuICAgICAgZ2FtZU1vZGVsLmxldmVsUHJvcGVydHksXHJcbiAgICAgIGdhbWVNb2RlbC5jaGFsbGVuZ2VJbmRleFByb3BlcnR5LFxyXG4gICAgICBnYW1lTW9kZWwuY2hhbGxlbmdlc1BlclNldCxcclxuICAgICAgZ2FtZU1vZGVsLnNjb3JlUHJvcGVydHksXHJcbiAgICAgIGdhbWVNb2RlbC5lbGFwc2VkVGltZVByb3BlcnR5LFxyXG4gICAgICB7XHJcbiAgICAgICAgY2VudGVyWDogKCB0aGlzLmxheW91dEJvdW5kcy54ICsgdGhpcy5zaGFwZUJvYXJkLmxlZnQgKSAvIDIsXHJcbiAgICAgICAgdG9wOiB0aGlzLnNoYXBlQm9hcmQudG9wLFxyXG4gICAgICAgIG1heFdpZHRoOiB0aGlzLmNvbnRyb2xQYW5lbC53aWR0aFxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgdGhpcy5jb250cm9sTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuc2NvcmVib2FyZCApO1xyXG5cclxuICAgIC8vIENvbnRyb2wgdmlzaWJpbGl0eSBvZiBlbGFwc2VkIHRpbWUgaW5kaWNhdG9yIGluIHRoZSBzY29yZWJvYXJkLlxyXG4gICAgdGhpcy5tb2RlbC50aW1lckVuYWJsZWRQcm9wZXJ0eS5saW5rKCB0aW1lckVuYWJsZWQgPT4ge1xyXG4gICAgICB0aGlzLnNjb3JlYm9hcmQudGltZVZpc2libGVQcm9wZXJ0eS5zZXQoIHRpbWVyRW5hYmxlZCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgYnV0dG9uIGZvciByZXR1cm5pbmcgdG8gdGhlIGxldmVsIHNlbGVjdGlvbiBzY3JlZW4uXHJcbiAgICB0aGlzLmNvbnRyb2xMYXllci5hZGRDaGlsZCggbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xyXG4gICAgICBjb250ZW50OiBuZXcgVGV4dCggc3RhcnRPdmVyU3RyaW5nLCB7IGZvbnQ6IEJVVFRPTl9GT05ULCBtYXhXaWR0aDogdGhpcy5jb250cm9sUGFuZWwud2lkdGggfSApLFxyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IEJVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OLFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IEJVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OLFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XHJcbiAgICAgICAgZ2FtZU1vZGVsLnNpbVNwZWNpZmljTW9kZWwucmVzZXQoKTtcclxuICAgICAgICBnYW1lTW9kZWwuc2V0Q2hvb3NpbmdMZXZlbFN0YXRlKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGJhc2VDb2xvcjogQlVUVE9OX0ZJTEwsXHJcbiAgICAgIGNlbnRlclg6IHRoaXMuc2NvcmVib2FyZC5jZW50ZXJYLFxyXG4gICAgICBjZW50ZXJZOiB0aGlzLnNvbHV0aW9uQmFubmVyLmNlbnRlcllcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgJ0J1aWxkIFByb21wdCcgbm9kZSB0aGF0IGlzIHNob3duIHRlbXBvcmFyaWx5IG92ZXIgdGhlIGJvYXJkIHRvIGluc3RydWN0IHRoZSB1c2VyIGFib3V0IHdoYXQgdG8gYnVpbGQuXHJcbiAgICB0aGlzLmJ1aWxkUHJvbXB0VkJveCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgdGhpcy55b3VyR29hbFRpdGxlXHJcbiAgICAgIF0sXHJcbiAgICAgIHNwYWNpbmc6IDIwXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmJ1aWxkUHJvbXB0UGFuZWwgPSBuZXcgUGFuZWwoIHRoaXMuYnVpbGRQcm9tcHRWQm94LCB7XHJcbiAgICAgIHN0cm9rZTogbnVsbCxcclxuICAgICAgeE1hcmdpbjogMTAsXHJcbiAgICAgIHlNYXJnaW46IDEwXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCB0aGlzLmJ1aWxkUHJvbXB0UGFuZWwgKTtcclxuXHJcbiAgICAvLyBEZWZpbmUgc29tZSB2YXJpYWJsZXMgZm9yIHRha2luZyBhIHNuYXBzaG90IG9mIHRoZSB1c2VyJ3Mgc29sdXRpb24uXHJcbiAgICB0aGlzLmFyZWFPZlVzZXJDcmVhdGVkU2hhcGUgPSAwO1xyXG4gICAgdGhpcy5wZXJpbWV0ZXJPZlVzZXJDcmVhdGVkU2hhcGUgPSAwO1xyXG4gICAgdGhpcy5jb2xvcjFQcm9wb3J0aW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBBZGQgYW5kIGxheSBvdXQgdGhlIGdhbWUgY29udHJvbCBidXR0b25zLlxyXG4gICAgdGhpcy5nYW1lQ29udHJvbEJ1dHRvbnMgPSBbXTtcclxuICAgIGNvbnN0IGJ1dHRvbk9wdGlvbnMgPSB7XHJcbiAgICAgIGZvbnQ6IEJVVFRPTl9GT05ULFxyXG4gICAgICBiYXNlQ29sb3I6IEJVVFRPTl9GSUxMLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDQsXHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogQlVUVE9OX1RPVUNIX0FSRUFfRElMQVRJT04sXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogQlVUVE9OX1RPVUNIX0FSRUFfRElMQVRJT04sXHJcbiAgICAgIG1heFdpZHRoOiAoIHRoaXMubGF5b3V0Qm91bmRzLm1heFggLSB0aGlzLnNoYXBlQm9hcmRPcmlnaW5hbEJvdW5kcy5tYXhYICkgKiAwLjlcclxuICAgIH07XHJcbiAgICB0aGlzLmNoZWNrQW5zd2VyQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCBjaGVja1N0cmluZywgbWVyZ2UoIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVVzZXJBbnN3ZXIoKTtcclxuICAgICAgICBnYW1lTW9kZWwuY2hlY2tBbnN3ZXIoKTtcclxuICAgICAgfVxyXG4gICAgfSwgYnV0dG9uT3B0aW9ucyApICk7XHJcbiAgICB0aGlzLmdhbWVDb250cm9sQnV0dG9ucy5wdXNoKCB0aGlzLmNoZWNrQW5zd2VyQnV0dG9uICk7XHJcblxyXG4gICAgdGhpcy5uZXh0QnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCBuZXh0U3RyaW5nLCBtZXJnZSgge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMubnVtYmVyRW50cnlDb250cm9sLmNsZWFyKCk7XHJcbiAgICAgICAgZ2FtZU1vZGVsLm5leHRDaGFsbGVuZ2UoKTtcclxuICAgICAgfVxyXG4gICAgfSwgYnV0dG9uT3B0aW9ucyApICk7XHJcbiAgICB0aGlzLmdhbWVDb250cm9sQnV0dG9ucy5wdXNoKCB0aGlzLm5leHRCdXR0b24gKTtcclxuXHJcbiAgICB0aGlzLnRyeUFnYWluQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCB0cnlBZ2FpblN0cmluZywgbWVyZ2UoIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICB0aGlzLm51bWJlckVudHJ5Q29udHJvbC5jbGVhcigpO1xyXG4gICAgICAgIGdhbWVNb2RlbC50cnlBZ2FpbigpO1xyXG4gICAgICB9XHJcbiAgICB9LCBidXR0b25PcHRpb25zICkgKTtcclxuICAgIHRoaXMuZ2FtZUNvbnRyb2xCdXR0b25zLnB1c2goIHRoaXMudHJ5QWdhaW5CdXR0b24gKTtcclxuXHJcbiAgICAvLyBTb2x1dGlvbiBidXR0b24gZm9yICdmaW5kIHRoZSBhcmVhJyBzdHlsZSBvZiBjaGFsbGVuZ2UsIHdoaWNoIGhhcyBvbmUgc3BlY2lmaWMgYW5zd2VyLlxyXG4gICAgdGhpcy5zb2x1dGlvbkJ1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggc29sdXRpb25TdHJpbmcsIG1lcmdlKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgZ2FtZU1vZGVsLmRpc3BsYXlDb3JyZWN0QW5zd2VyKCk7XHJcbiAgICAgIH1cclxuICAgIH0sIGJ1dHRvbk9wdGlvbnMgKSApO1xyXG4gICAgdGhpcy5nYW1lQ29udHJvbEJ1dHRvbnMucHVzaCggdGhpcy5zb2x1dGlvbkJ1dHRvbiApO1xyXG5cclxuICAgIC8vIFNvbHV0aW9uIGJ1dHRvbiBmb3IgJ2J1aWxkIGl0JyBzdHlsZSBvZiBjaGFsbGVuZ2UsIHdoaWNoIGhhcyBtYW55IHBvdGVudGlhbCBhbnN3ZXJzLlxyXG4gICAgdGhpcy5zaG93QVNvbHV0aW9uQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCBhU29sdXRpb25TdHJpbmcsIG1lcmdlKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5va2F5VG9VcGRhdGVZb3VCdWlsdFdpbmRvdyA9IGZhbHNlO1xyXG4gICAgICAgIGdhbWVNb2RlbC5kaXNwbGF5Q29ycmVjdEFuc3dlcigpO1xyXG4gICAgICB9XHJcbiAgICB9LCBidXR0b25PcHRpb25zICkgKTtcclxuICAgIHRoaXMuZ2FtZUNvbnRyb2xCdXR0b25zLnB1c2goIHRoaXMuc2hvd0FTb2x1dGlvbkJ1dHRvbiApO1xyXG5cclxuICAgIGNvbnN0IGJ1dHRvbkNlbnRlclggPSAoIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoICsgdGhpcy5zaGFwZUJvYXJkLnJpZ2h0ICkgLyAyO1xyXG4gICAgY29uc3QgYnV0dG9uQm90dG9tID0gdGhpcy5zaGFwZUJvYXJkLmJvdHRvbTtcclxuICAgIHRoaXMuZ2FtZUNvbnRyb2xCdXR0b25zLmZvckVhY2goIGJ1dHRvbiA9PiB7XHJcbiAgICAgIGJ1dHRvbi5jZW50ZXJYID0gYnV0dG9uQ2VudGVyWDtcclxuICAgICAgYnV0dG9uLmJvdHRvbSA9IGJ1dHRvbkJvdHRvbTtcclxuICAgICAgdGhpcy5jb250cm9sTGF5ZXIuYWRkQ2hpbGQoIGJ1dHRvbiApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgbnVtYmVyIGVudHJ5IGNvbnRyb2wsIHdoaWNoIGlzIG9ubHkgdmlzaWJsZSBvbiBjZXJ0YWluIGNoYWxsZW5nZSB0eXBlcy5cclxuICAgIHRoaXMubnVtYmVyRW50cnlDb250cm9sID0gbmV3IE51bWJlckVudHJ5Q29udHJvbCgge1xyXG4gICAgICBjZW50ZXJYOiBidXR0b25DZW50ZXJYLFxyXG4gICAgICBib3R0b206IHRoaXMuY2hlY2tBbnN3ZXJCdXR0b24udG9wIC0gMTBcclxuICAgIH0gKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHRoaXMubnVtYmVyRW50cnlDb250cm9sICk7XHJcbiAgICB0aGlzLmFyZWFRdWVzdGlvblByb21wdCA9IG5ldyBUZXh0KCBhcmVhUXVlc3Rpb25TdHJpbmcsIHsgLy8gVGhpcyBwcm9tcHQgZ29lcyB3aXRoIHRoZSBudW1iZXIgZW50cnkgY29udHJvbC5cclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyMCApLFxyXG4gICAgICBjZW50ZXJYOiB0aGlzLm51bWJlckVudHJ5Q29udHJvbC5jZW50ZXJYLFxyXG4gICAgICBib3R0b206IHRoaXMubnVtYmVyRW50cnlDb250cm9sLnRvcCAtIDEwLFxyXG4gICAgICBtYXhXaWR0aDogdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wud2lkdGhcclxuICAgIH0gKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuYXJlYVF1ZXN0aW9uUHJvbXB0ICk7XHJcblxyXG4gICAgdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wua2V5cGFkLnZhbHVlU3RyaW5nUHJvcGVydHkubGluayggdmFsdWVTdHJpbmcgPT4ge1xyXG5cclxuICAgICAgLy8gSGFuZGxlIHRoZSBjYXNlIHdoZXJlIHRoZSB1c2VyIGp1c3Qgc3RhcnRzIGVudGVyaW5nIGRpZ2l0cyBpbnN0ZWFkIG9mIHByZXNzaW5nIHRoZSBcIlRyeSBBZ2FpblwiIGJ1dHRvbi4gIEluXHJcbiAgICAgIC8vIHRoaXMgY2FzZSwgd2UgZ28gYWhlYWQgYW5kIG1ha2UgdGhlIHN0YXRlIHRyYW5zaXRpb24gdG8gdGhlIG5leHQgc3RhdGUuXHJcbiAgICAgIGlmICggZ2FtZU1vZGVsLmdhbWVTdGF0ZVByb3BlcnR5LnZhbHVlID09PSBHYW1lU3RhdGUuU0hPV0lOR19JTkNPUlJFQ1RfQU5TV0VSX0ZFRURCQUNLX1RSWV9BR0FJTiApIHtcclxuICAgICAgICBnYW1lTW9kZWwudHJ5QWdhaW4oKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVXBkYXRlIHRoZSBzdGF0ZSBvZiB0aGUgJ0NoZWNrJyBidXR0b24gd2hlbiB0aGUgdXNlciBlbnRlcnMgbmV3IGRpZ2l0cy5cclxuICAgICAgdGhpcy51cGRhdGVkQ2hlY2tCdXR0b25FbmFibGVkU3RhdGUoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlICdmZWVkYmFjayBub2RlJyB0aGF0IGlzIHVzZWQgdG8gdmlzdWFsbHkgaW5kaWNhdGUgY29ycmVjdCBhbmQgaW5jb3JyZWN0IGFuc3dlcnMuXHJcbiAgICB0aGlzLmZhY2VXaXRoUG9pbnRzTm9kZSA9IG5ldyBGYWNlV2l0aFBvaW50c05vZGUoIHtcclxuICAgICAgZmFjZURpYW1ldGVyOiA4NSxcclxuICAgICAgcG9pbnRzQWxpZ25tZW50OiAncmlnaHRCb3R0b20nLFxyXG4gICAgICBjZW50ZXJYOiBidXR0b25DZW50ZXJYLFxyXG4gICAgICB0b3A6IGJ1dHRvbkJvdHRvbSArIDIwLFxyXG4gICAgICBwb2ludHNGb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMjAsIHdlaWdodDogJ2JvbGQnIH0gKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5mYWNlV2l0aFBvaW50c05vZGUgKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgY29taW5ncyBhbmQgZ29pbmdzIG9mIG1vZGVsIHNoYXBlcy5cclxuICAgIGdhbWVNb2RlbC5zaW1TcGVjaWZpY01vZGVsLm1vdmFibGVTaGFwZXMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIGFkZGVkU2hhcGUgPT4ge1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgdGhlIHZpZXcgcmVwcmVzZW50YXRpb24gZm9yIHRoaXMgc2hhcGUuXHJcbiAgICAgIGNvbnN0IHNoYXBlTm9kZSA9IG5ldyBTaGFwZU5vZGUoIGFkZGVkU2hhcGUsIHRoaXMubGF5b3V0Qm91bmRzICk7XHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHNoYXBlTm9kZSApO1xyXG5cclxuICAgICAgLy8gQWRkIGEgbGlzdGVuZXIgdGhhdCBoYW5kbGVzIGNoYW5nZXMgdG8gdGhlIHVzZXJDb250cm9sbGVkIHN0YXRlLlxyXG4gICAgICBjb25zdCB1c2VyQ29udHJvbGxlZExpc3RlbmVyID0gdXNlckNvbnRyb2xsZWQgPT4ge1xyXG4gICAgICAgIGlmICggdXNlckNvbnRyb2xsZWQgKSB7XHJcbiAgICAgICAgICBzaGFwZU5vZGUubW92ZVRvRnJvbnQoKTtcclxuXHJcbiAgICAgICAgICAvLyBJZiB0aGUgZ2FtZSB3YXMgaW4gdGhlIHN0YXRlIHdoZXJlIGl0IHdhcyBwcm9tcHRpbmcgdGhlIHVzZXIgdG8gdHJ5IGFnYWluLCBhbmQgdGhlIHVzZXIgc3RhcnRlZFxyXG4gICAgICAgICAgLy8gaW50ZXJhY3Rpbmcgd2l0aCBzaGFwZXMgd2l0aG91dCBwcmVzc2luZyB0aGUgJ1RyeSBBZ2FpbicgYnV0dG9uLCBnbyBhaGVhZCBhbmQgbWFrZSB0aGUgc3RhdGUgY2hhbmdlXHJcbiAgICAgICAgICAvLyBhdXRvbWF0aWNhbGx5LlxyXG4gICAgICAgICAgaWYgKCBnYW1lTW9kZWwuZ2FtZVN0YXRlUHJvcGVydHkudmFsdWUgPT09IEdhbWVTdGF0ZS5TSE9XSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0tfVFJZX0FHQUlOICkge1xyXG4gICAgICAgICAgICBnYW1lTW9kZWwudHJ5QWdhaW4oKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGFkZGVkU2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCB1c2VyQ29udHJvbGxlZExpc3RlbmVyICk7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIHJlbW92YWwgbGlzdGVuZXIgZm9yIGlmIGFuZCB3aGVuIHRoaXMgc2hhcGUgaXMgcmVtb3ZlZCBmcm9tIHRoZSBtb2RlbC5cclxuICAgICAgZ2FtZU1vZGVsLnNpbVNwZWNpZmljTW9kZWwubW92YWJsZVNoYXBlcy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCBmdW5jdGlvbiByZW1vdmFsTGlzdGVuZXIoIHJlbW92ZWRTaGFwZSApIHtcclxuICAgICAgICBpZiAoIHJlbW92ZWRTaGFwZSA9PT0gYWRkZWRTaGFwZSApIHtcclxuICAgICAgICAgIHNlbGYuY2hhbGxlbmdlTGF5ZXIucmVtb3ZlQ2hpbGQoIHNoYXBlTm9kZSApO1xyXG4gICAgICAgICAgc2hhcGVOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgIGFkZGVkU2hhcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS51bmxpbmsoIHVzZXJDb250cm9sbGVkTGlzdGVuZXIgKTtcclxuICAgICAgICAgIGdhbWVNb2RlbC5zaW1TcGVjaWZpY01vZGVsLm1vdmFibGVTaGFwZXMucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggcmVtb3ZhbExpc3RlbmVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBJZiB0aGUgaW5pdGlhbCBidWlsZCBwcm9tcHQgaXMgdmlzaWJsZSwgaGlkZSBpdC5cclxuICAgICAgaWYgKCB0aGlzLmJ1aWxkUHJvbXB0UGFuZWwub3BhY2l0eSA9PT0gMSApIHtcclxuICAgICAgICAvLyB1c2luZyBhIGZ1bmN0aW9uIGluc3RlYWQsIHNlZSBTZWFzb25zIHNpbSwgUGFuZWxOb2RlLmpzIGZvciBhbiBleGFtcGxlLlxyXG4gICAgICAgIG5ldyBBbmltYXRpb24oIHtcclxuICAgICAgICAgIGZyb206IHRoaXMuYnVpbGRQcm9tcHRQYW5lbC5vcGFjaXR5LFxyXG4gICAgICAgICAgdG86IDAsXHJcbiAgICAgICAgICBzZXRWYWx1ZTogb3BhY2l0eSA9PiB7IHRoaXMuYnVpbGRQcm9tcHRQYW5lbC5vcGFjaXR5ID0gb3BhY2l0eTsgfSxcclxuICAgICAgICAgIGR1cmF0aW9uOiAwLjUsXHJcbiAgICAgICAgICBlYXNpbmc6IEVhc2luZy5DVUJJQ19JTl9PVVRcclxuICAgICAgICB9ICkuc3RhcnQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgdGhpcyBpcyBhICdidWlsdCBpdCcgc3R5bGUgY2hhbGxlbmdlLCBhbmQgdGhpcyBpcyB0aGUgZmlyc3QgZWxlbWVudCBiZWluZyBhZGRlZCB0byB0aGUgYm9hcmQsIGFkZCB0aGVcclxuICAgICAgLy8gYnVpbGQgc3BlYyB0byB0aGUgYmFubmVyIHNvIHRoYXQgdGhlIHVzZXIgY2FuIHJlZmVyZW5jZSBpdCBhcyB0aGV5IGFkZCBtb3JlIHNoYXBlcyB0byB0aGUgYm9hcmQuXHJcbiAgICAgIGlmICggZ2FtZU1vZGVsLmN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eS5nZXQoKS5idWlsZFNwZWMgJiYgdGhpcy5jaGFsbGVuZ2VQcm9tcHRCYW5uZXIuYnVpbGRTcGVjUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICAgICAgdGhpcy5jaGFsbGVuZ2VQcm9tcHRCYW5uZXIuYnVpbGRTcGVjUHJvcGVydHkudmFsdWUgPSBnYW1lTW9kZWwuY3VycmVudENoYWxsZW5nZVByb3BlcnR5LmdldCgpLmJ1aWxkU3BlYztcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGdhbWVNb2RlbC5zaW1TcGVjaWZpY01vZGVsLm1vdmFibGVTaGFwZXMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAvLyBJZiB0aGUgY2hhbGxlbmdlIGlzIGEgJ2J1aWxkIGl0JyBzdHlsZSBjaGFsbGVuZ2UsIGFuZCB0aGUgZ2FtZSBpcyBpbiB0aGUgc3RhdGUgd2hlcmUgdGhlIHVzZXIgaXMgYmVpbmcgZ2l2ZW5cclxuICAgICAgLy8gdGhlIG9wcG9ydHVuaXR5IHRvIHZpZXcgYSBzb2x1dGlvbiwgYW5kIHRoZSB1c2VyIGp1c3QgcmVtb3ZlZCBhIHBpZWNlLCBjaGVjayBpZiB0aGV5IG5vdyBoYXZlIHRoZSBjb3JyZWN0XHJcbiAgICAgIC8vIGFuc3dlci5cclxuICAgICAgaWYgKCBnYW1lTW9kZWwuZ2FtZVN0YXRlUHJvcGVydHkudmFsdWUgPT09IEdhbWVTdGF0ZS5TSE9XSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0tfTU9WRV9PTiAmJiAhdGhpcy5pc0FueVNoYXBlTW92aW5nKCkgKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5jaGVja0Fuc3dlcigpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgZ2FtZU1vZGVsLnNpbVNwZWNpZmljTW9kZWwuc2hhcGVQbGFjZW1lbnRCb2FyZC5hcmVhQW5kUGVyaW1ldGVyUHJvcGVydHkubGluayggYXJlYUFuZFBlcmltZXRlciA9PiB7XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZWRDaGVja0J1dHRvbkVuYWJsZWRTdGF0ZSgpO1xyXG5cclxuICAgICAgLy8gSWYgdGhlIGNoYWxsZW5nZSBpcyBhICdidWlsZCBpdCcgc3R5bGUgY2hhbGxlbmdlLCBhbmQgdGhlIGdhbWUgaXMgaW4gdGhlIHN0YXRlIHdoZXJlIHRoZSB1c2VyIGlzIGJlaW5nXHJcbiAgICAgIC8vIGdpdmVuIHRoZSBvcHBvcnR1bml0eSB0byB2aWV3IGEgc29sdXRpb24sIGFuZCB0aGV5IGp1c3QgY2hhbmdlZCB3aGF0IHRoZXkgaGFkIGJ1aWx0LCB1cGRhdGUgdGhlICd5b3UgYnVpbHQnXHJcbiAgICAgIC8vIHdpbmRvdy5cclxuICAgICAgaWYgKCBnYW1lTW9kZWwuZ2FtZVN0YXRlUHJvcGVydHkudmFsdWUgPT09IEdhbWVTdGF0ZS5TSE9XSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0tfTU9WRV9PTiAmJlxyXG4gICAgICAgICAgIHRoaXMubW9kZWwuY3VycmVudENoYWxsZW5nZVByb3BlcnR5LmdldCgpLmJ1aWxkU3BlYyAmJlxyXG4gICAgICAgICAgIHRoaXMub2theVRvVXBkYXRlWW91QnVpbHRXaW5kb3cgKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVVc2VyQW5zd2VyKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVZb3VCdWlsdFdpbmRvdyggdGhpcy5tb2RlbC5jdXJyZW50Q2hhbGxlbmdlUHJvcGVydHkuZ2V0KCkgKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIHB1dCBhbGwgc2hhcGVzIGF3YXksIGNoZWNrIHRvIHNlZSBpZiB0aGV5IG5vdyBoYXZlIHRoZSBjb3JyZWN0IGFuc3dlci5cclxuICAgICAgICBpZiAoICF0aGlzLmlzQW55U2hhcGVNb3ZpbmcoKSApIHtcclxuICAgICAgICAgIHRoaXMubW9kZWwuY2hlY2tBbnN3ZXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7R3JvdXBJdGVtT3B0aW9uc1tdfSAtIEtlZXAgdHJhY2sgb2YgYWN0aXZlIFNoYXBlQ3JlYXRvck5vZGUgaW5zdGFuY2VzIHNvIHRoYXQgdGhleSBjYW4gYmUgZGlzcG9zZWQuXHJcbiAgICB0aGlzLmFjdGl2ZVNoYXBlTm9kZUNyZWF0b3JzID0gW107XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0Nhcm91c2VsfG51bGx9XHJcbiAgICB0aGlzLmNhcm91c2VsID0gbnVsbDsgLy8gZm9yIGRpc3Bvc2FsXHJcblxyXG4gICAgLy8gVmFyaW91cyBvdGhlciBpbml0aWFsaXphdGlvblxyXG4gICAgdGhpcy5sZXZlbENvbXBsZXRlZE5vZGUgPSBudWxsOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5zaGFwZUNhcm91c2VsTGF5ZXIgPSBuZXcgTm9kZSgpOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllci5hZGRDaGlsZCggdGhpcy5zaGFwZUNhcm91c2VsTGF5ZXIgKTtcclxuICAgIHRoaXMuY2xlYXJEaW1lbnNpb25zQ29udHJvbE9uTmV4dENoYWxsZW5nZSA9IGZhbHNlOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIEhvb2sgdXAgdGhlIHVwZGF0ZSBmdW5jdGlvbiBmb3IgaGFuZGxpbmcgY2hhbmdlcyB0byBnYW1lIHN0YXRlLlxyXG4gICAgZ2FtZU1vZGVsLmdhbWVTdGF0ZVByb3BlcnR5LmxpbmsoIHRoaXMuaGFuZGxlR2FtZVN0YXRlQ2hhbmdlLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIC8vIFNldCB1cCBhIGZsYWcgdG8gYmxvY2sgdXBkYXRlcyBvZiB0aGUgJ1lvdSBCdWlsdCcgd2luZG93IHdoZW4gc2hvd2luZyB0aGUgc29sdXRpb24uICBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlXHJcbiAgICAvLyBhZGRpbmcgdGhlIHNoYXBlcyB0byB0aGUgYm9hcmQgaW4gb3JkZXIgdG8gc2hvdyB0aGUgc29sdXRpb24gdHJpZ2dlcnMgdXBkYXRlcyBvZiB0aGlzIHdpbmRvdy5cclxuICAgIHRoaXMub2theVRvVXBkYXRlWW91QnVpbHRXaW5kb3cgPSB0cnVlOyAvLyBAcHJpdmF0ZVxyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGUsIFdoZW4gdGhlIGdhbWUgc3RhdGUgY2hhbmdlcywgdXBkYXRlIHRoZSB2aWV3IHdpdGggdGhlIGFwcHJvcHJpYXRlIGJ1dHRvbnMgYW5kIHJlYWRvdXRzLlxyXG4gIGhhbmRsZUdhbWVTdGF0ZUNoYW5nZSggZ2FtZVN0YXRlICkge1xyXG5cclxuICAgIC8vIEhpZGUgYWxsIG5vZGVzIC0gdGhlIGFwcHJvcHJpYXRlIG9uZXMgd2lsbCBiZSBzaG93biBsYXRlciBiYXNlZCBvbiB0aGUgY3VycmVudCBzdGF0ZS5cclxuICAgIHRoaXMuaGlkZUFsbEdhbWVOb2RlcygpO1xyXG5cclxuICAgIGNvbnN0IGNoYWxsZW5nZSA9IHRoaXMubW9kZWwuY3VycmVudENoYWxsZW5nZVByb3BlcnR5LmdldCgpOyAvLyBjb252ZW5pZW5jZSB2YXJcclxuXHJcbiAgICAvLyBTaG93IHRoZSBub2RlcyBhcHByb3ByaWF0ZSB0byB0aGUgc3RhdGVcclxuICAgIHN3aXRjaCggZ2FtZVN0YXRlICkge1xyXG5cclxuICAgICAgY2FzZSBHYW1lU3RhdGUuQ0hPT1NJTkdfTEVWRUw6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVDaG9vc2luZ0xldmVsU3RhdGUoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgR2FtZVN0YXRlLlBSRVNFTlRJTkdfSU5URVJBQ1RJVkVfQ0hBTExFTkdFOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlUHJlc2VudGluZ0ludGVyYWN0aXZlQ2hhbGxlbmdlU3RhdGUoIGNoYWxsZW5nZSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBHYW1lU3RhdGUuU0hPV0lOR19DT1JSRUNUX0FOU1dFUl9GRUVEQkFDSzpcclxuICAgICAgICB0aGlzLmhhbmRsZVNob3dpbmdDb3JyZWN0QW5zd2VyRmVlZGJhY2tTdGF0ZSggY2hhbGxlbmdlICk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIEdhbWVTdGF0ZS5TSE9XSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0tfVFJZX0FHQUlOOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlU2hvd2luZ0luY29ycmVjdEFuc3dlckZlZWRiYWNrVHJ5QWdhaW5TdGF0ZSggY2hhbGxlbmdlICk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIEdhbWVTdGF0ZS5TSE9XSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0tfTU9WRV9PTjpcclxuICAgICAgICB0aGlzLmhhbmRsZVNob3dpbmdJbmNvcnJlY3RBbnN3ZXJGZWVkYmFja01vdmVPblN0YXRlKCBjaGFsbGVuZ2UgKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgR2FtZVN0YXRlLkRJU1BMQVlJTkdfQ09SUkVDVF9BTlNXRVI6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVEaXNwbGF5aW5nQ29ycmVjdEFuc3dlclN0YXRlKCBjaGFsbGVuZ2UgKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgR2FtZVN0YXRlLlNIT1dJTkdfTEVWRUxfUkVTVUxUUzpcclxuICAgICAgICB0aGlzLmhhbmRsZVNob3dpbmdMZXZlbFJlc3VsdHNTdGF0ZSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBVbmhhbmRsZWQgZ2FtZSBzdGF0ZTogJHtnYW1lU3RhdGV9YCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICBoYW5kbGVDaG9vc2luZ0xldmVsU3RhdGUoKSB7XHJcbiAgICB0aGlzLnNob3coIFsgdGhpcy5zdGFydEdhbWVMZXZlbE5vZGUgXSApO1xyXG4gICAgdGhpcy5oaWRlQ2hhbGxlbmdlKCk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIGhhbmRsZVByZXNlbnRpbmdJbnRlcmFjdGl2ZUNoYWxsZW5nZVN0YXRlKCBjaGFsbGVuZ2UgKSB7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLnBpY2thYmxlID0gbnVsbDsgLy8gUGFzcyB0aHJvdWdoLCBwcnVuZXMgc3VidHJlZSwgc2VlIFNjZW5lcnkgZG9jdW1lbnRhdGlvbiBmb3IgZGV0YWlscy5cclxuICAgIHRoaXMucHJlc2VudENoYWxsZW5nZSgpO1xyXG5cclxuICAgIC8vIE1ha2UgYSBsaXN0IG9mIHRoZSBub2RlcyB0byBiZSBzaG93biBpbiB0aGlzIHN0YXRlLlxyXG4gICAgY29uc3Qgbm9kZXNUb1Nob3cgPSBbXHJcbiAgICAgIHRoaXMuc2NvcmVib2FyZCxcclxuICAgICAgdGhpcy5jb250cm9sUGFuZWwsXHJcbiAgICAgIHRoaXMuY2hlY2tBbnN3ZXJCdXR0b24sXHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlUHJvbXB0QmFubmVyXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgbm9kZXMgdGhhdCBhcmUgb25seSBzaG93biBmb3IgY2VydGFpbiBjaGFsbGVuZ2UgdHlwZXMgb3IgdW5kZXIgY2VydGFpbiBjb25kaXRpb25zLlxyXG4gICAgaWYgKCBjaGFsbGVuZ2UuY2hlY2tTcGVjID09PSAnYXJlYUVudGVyZWQnICkge1xyXG4gICAgICBub2Rlc1RvU2hvdy5wdXNoKCB0aGlzLm51bWJlckVudHJ5Q29udHJvbCApO1xyXG4gICAgICBub2Rlc1RvU2hvdy5wdXNoKCB0aGlzLmFyZWFRdWVzdGlvblByb21wdCApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBjaGFsbGVuZ2UudXNlclNoYXBlcyApIHtcclxuICAgICAgbm9kZXNUb1Nob3cucHVzaCggdGhpcy5zaGFwZUNhcm91c2VsTGF5ZXIgKTtcclxuICAgICAgbm9kZXNUb1Nob3cucHVzaCggdGhpcy5lcmFzZXJCdXR0b24gKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNob3coIG5vZGVzVG9TaG93ICk7XHJcbiAgICB0aGlzLnNob3dDaGFsbGVuZ2VHcmFwaGljcygpO1xyXG4gICAgdGhpcy51cGRhdGVkQ2hlY2tCdXR0b25FbmFibGVkU3RhdGUoKTtcclxuICAgIHRoaXMub2theVRvVXBkYXRlWW91QnVpbHRXaW5kb3cgPSB0cnVlO1xyXG5cclxuICAgIGlmICggdGhpcy5jbGVhckRpbWVuc2lvbnNDb250cm9sT25OZXh0Q2hhbGxlbmdlICkge1xyXG4gICAgICB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuc2hvd0RpbWVuc2lvbnNQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICAgIHRoaXMuY2xlYXJEaW1lbnNpb25zQ29udHJvbE9uTmV4dENoYWxsZW5nZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICBoYW5kbGVTaG93aW5nQ29ycmVjdEFuc3dlckZlZWRiYWNrU3RhdGUoIGNoYWxsZW5nZSApIHtcclxuXHJcbiAgICAvLyBNYWtlIGEgbGlzdCBvZiB0aGUgbm9kZXMgdG8gYmUgc2hvd24gaW4gdGhpcyBzdGF0ZS5cclxuICAgIGNvbnN0IG5vZGVzVG9TaG93ID0gW1xyXG4gICAgICB0aGlzLnNjb3JlYm9hcmQsXHJcbiAgICAgIHRoaXMuY29udHJvbFBhbmVsLFxyXG4gICAgICB0aGlzLm5leHRCdXR0b24sXHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlUHJvbXB0QmFubmVyLFxyXG4gICAgICB0aGlzLmZhY2VXaXRoUG9pbnRzTm9kZVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyBVcGRhdGUgYW5kIHNob3cgdGhlIG5vZGVzIHRoYXQgdmFyeSBiYXNlZCBvbiB0aGUgY2hhbGxlbmdlIGNvbmZpZ3VyYXRpb25zLlxyXG4gICAgaWYgKCBjaGFsbGVuZ2UuYnVpbGRTcGVjICkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVlvdUJ1aWx0V2luZG93KCBjaGFsbGVuZ2UgKTtcclxuICAgICAgbm9kZXNUb1Nob3cucHVzaCggdGhpcy55b3VCdWlsdFdpbmRvdyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMudXBkYXRlWW91RW50ZXJlZFdpbmRvdyggY2hhbGxlbmdlICk7XHJcbiAgICAgIG5vZGVzVG9TaG93LnB1c2goIHRoaXMueW91RW50ZXJlZFdpbmRvdyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdpdmUgdGhlIHVzZXIgdGhlIGFwcHJvcHJpYXRlIGF1ZGlvIGFuZCB2aXN1YWwgZmVlZGJhY2tcclxuICAgIHRoaXMuZ2FtZUF1ZGlvUGxheWVyLmNvcnJlY3RBbnN3ZXIoKTtcclxuICAgIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlLnNtaWxlKCk7XHJcbiAgICB0aGlzLmZhY2VXaXRoUG9pbnRzTm9kZS5zZXRQb2ludHMoIHRoaXMubW9kZWwuZ2V0Q2hhbGxlbmdlQ3VycmVudFBvaW50VmFsdWUoKSApO1xyXG5cclxuICAgIC8vIERpc2FibGUgaW50ZXJhY3Rpb24gd2l0aCB0aGUgY2hhbGxlbmdlIGVsZW1lbnRzLlxyXG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllci5waWNrYWJsZSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIE1ha2UgdGhlIG5vZGVzIHZpc2libGVcclxuICAgIHRoaXMuc2hvdyggbm9kZXNUb1Nob3cgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgaGFuZGxlU2hvd2luZ0luY29ycmVjdEFuc3dlckZlZWRiYWNrVHJ5QWdhaW5TdGF0ZSggY2hhbGxlbmdlICkge1xyXG5cclxuICAgIC8vIE1ha2UgYSBsaXN0IG9mIHRoZSBub2RlcyB0byBiZSBzaG93biBpbiB0aGlzIHN0YXRlLlxyXG4gICAgY29uc3Qgbm9kZXNUb1Nob3cgPSBbXHJcbiAgICAgIHRoaXMuc2NvcmVib2FyZCxcclxuICAgICAgdGhpcy5jb250cm9sUGFuZWwsXHJcbiAgICAgIHRoaXMudHJ5QWdhaW5CdXR0b24sXHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlUHJvbXB0QmFubmVyLFxyXG4gICAgICB0aGlzLmZhY2VXaXRoUG9pbnRzTm9kZVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIG5vZGVzIHdob3NlIHZpc2liaWxpdHkgdmFyaWVzIGJhc2VkIG9uIHRoZSBjaGFsbGVuZ2UgY29uZmlndXJhdGlvbi5cclxuICAgIGlmICggY2hhbGxlbmdlLmNoZWNrU3BlYyA9PT0gJ2FyZWFFbnRlcmVkJyApIHtcclxuICAgICAgbm9kZXNUb1Nob3cucHVzaCggdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wgKTtcclxuICAgICAgbm9kZXNUb1Nob3cucHVzaCggdGhpcy5hcmVhUXVlc3Rpb25Qcm9tcHQgKTtcclxuICAgIH1cclxuICAgIGlmICggY2hhbGxlbmdlLnVzZXJTaGFwZXMgKSB7XHJcbiAgICAgIG5vZGVzVG9TaG93LnB1c2goIHRoaXMuc2hhcGVDYXJvdXNlbExheWVyICk7XHJcbiAgICAgIG5vZGVzVG9TaG93LnB1c2goIHRoaXMuZXJhc2VyQnV0dG9uICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2l2ZSB0aGUgdXNlciB0aGUgYXBwcm9wcmlhdGUgZmVlZGJhY2suXHJcbiAgICB0aGlzLmdhbWVBdWRpb1BsYXllci53cm9uZ0Fuc3dlcigpO1xyXG4gICAgdGhpcy5mYWNlV2l0aFBvaW50c05vZGUuZnJvd24oKTtcclxuICAgIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlLnNldFBvaW50cyggdGhpcy5tb2RlbC5zY29yZVByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgaWYgKCBjaGFsbGVuZ2UuY2hlY2tTcGVjID09PSAnYXJlYUVudGVyZWQnICkge1xyXG4gICAgICAvLyBTZXQgdGhlIGtleXBhZCB0byBhbGxvdyB0aGUgdXNlciB0byBzdGFydCBlbnRlcmluZyBhIG5ldyB2YWx1ZS5cclxuICAgICAgdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wuc2V0Q2xlYXJPbk5leHRLZXlQcmVzcyggdHJ1ZSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNob3cgdGhlIG5vZGVzXHJcbiAgICB0aGlzLnNob3coIG5vZGVzVG9TaG93ICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIGhhbmRsZVNob3dpbmdJbmNvcnJlY3RBbnN3ZXJGZWVkYmFja01vdmVPblN0YXRlKCBjaGFsbGVuZ2UgKSB7XHJcblxyXG4gICAgLy8gTWFrZSBhIGxpc3Qgb2YgdGhlIG5vZGVzIHRvIGJlIHNob3duIGluIHRoaXMgc3RhdGUuXHJcbiAgICBjb25zdCBub2Rlc1RvU2hvdyA9IFtcclxuICAgICAgdGhpcy5zY29yZWJvYXJkLFxyXG4gICAgICB0aGlzLmNvbnRyb2xQYW5lbCxcclxuICAgICAgdGhpcy5jaGFsbGVuZ2VQcm9tcHRCYW5uZXIsXHJcbiAgICAgIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgbm9kZXMgd2hvc2UgdmlzaWJpbGl0eSB2YXJpZXMgYmFzZWQgb24gdGhlIGNoYWxsZW5nZSBjb25maWd1cmF0aW9uLlxyXG4gICAgaWYgKCBjaGFsbGVuZ2UuYnVpbGRTcGVjICkge1xyXG4gICAgICBub2Rlc1RvU2hvdy5wdXNoKCB0aGlzLnNob3dBU29sdXRpb25CdXR0b24gKTtcclxuICAgICAgdGhpcy51cGRhdGVZb3VCdWlsdFdpbmRvdyggY2hhbGxlbmdlICk7XHJcbiAgICAgIG5vZGVzVG9TaG93LnB1c2goIHRoaXMueW91QnVpbHRXaW5kb3cgKTtcclxuICAgICAgaWYgKCBjaGFsbGVuZ2UudXNlclNoYXBlcyApIHtcclxuICAgICAgICBub2Rlc1RvU2hvdy5wdXNoKCB0aGlzLnNoYXBlQ2Fyb3VzZWxMYXllciApO1xyXG4gICAgICAgIG5vZGVzVG9TaG93LnB1c2goIHRoaXMuZXJhc2VyQnV0dG9uICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBub2Rlc1RvU2hvdy5wdXNoKCB0aGlzLnNvbHV0aW9uQnV0dG9uICk7XHJcbiAgICAgIHRoaXMudXBkYXRlWW91RW50ZXJlZFdpbmRvdyggY2hhbGxlbmdlICk7XHJcbiAgICAgIG5vZGVzVG9TaG93LnB1c2goIHRoaXMueW91RW50ZXJlZFdpbmRvdyApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2hvdyggbm9kZXNUb1Nob3cgKTtcclxuXHJcbiAgICAvLyBHaXZlIHRoZSB1c2VyIHRoZSBhcHByb3ByaWF0ZSBmZWVkYmFja1xyXG4gICAgdGhpcy5nYW1lQXVkaW9QbGF5ZXIud3JvbmdBbnN3ZXIoKTtcclxuICAgIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlLmZyb3duKCk7XHJcbiAgICB0aGlzLmZhY2VXaXRoUG9pbnRzTm9kZS5zZXRQb2ludHMoIHRoaXMubW9kZWwuc2NvcmVQcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgIC8vIEZvciAnYnVpbHQgaXQnIHN0eWxlIGNoYWxsZW5nZXMsIHRoZSB1c2VyIGNhbiBzdGlsbCBpbnRlcmFjdCB3aGlsZSBpbiB0aGlzIHN0YXRlIGluIGNhc2UgdGhleSB3YW50IHRvIHRyeVxyXG4gICAgLy8gdG8gZ2V0IGl0IHJpZ2h0LiAgSW4gJ2ZpbmQgdGhlIGFyZWEnIGNoYWxsZW5nZXMsIGZ1cnRoZXIgaW50ZXJhY3Rpb24gaXMgZGlzYWxsb3dlZC5cclxuICAgIGlmICggY2hhbGxlbmdlLmNoZWNrU3BlYyA9PT0gJ2FyZWFFbnRlcmVkJyApIHtcclxuICAgICAgdGhpcy5jaGFsbGVuZ2VMYXllci5waWNrYWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNob3cgdGhlIG5vZGVzLlxyXG4gICAgdGhpcy5zaG93KCBub2Rlc1RvU2hvdyApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICBoYW5kbGVEaXNwbGF5aW5nQ29ycmVjdEFuc3dlclN0YXRlKCBjaGFsbGVuZ2UgKSB7XHJcbiAgICAvLyBNYWtlIGEgbGlzdCBvZiB0aGUgbm9kZXMgdG8gYmUgc2hvd24gaW4gdGhpcyBzdGF0ZS5cclxuICAgIGNvbnN0IG5vZGVzVG9TaG93ID0gW1xyXG4gICAgICB0aGlzLnNjb3JlYm9hcmQsXHJcbiAgICAgIHRoaXMuY29udHJvbFBhbmVsLFxyXG4gICAgICB0aGlzLm5leHRCdXR0b24sXHJcbiAgICAgIHRoaXMuc29sdXRpb25CYW5uZXJcclxuICAgIF07XHJcblxyXG4gICAgLy8gS2VlcCB0aGUgYXBwcm9wcmlhdGUgZmVlZGJhY2sgd2luZG93IHZpc2libGUuXHJcbiAgICBpZiAoIGNoYWxsZW5nZS5idWlsZFNwZWMgKSB7XHJcbiAgICAgIG5vZGVzVG9TaG93LnB1c2goIHRoaXMueW91QnVpbHRXaW5kb3cgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBub2Rlc1RvU2hvdy5wdXNoKCB0aGlzLnlvdUVudGVyZWRXaW5kb3cgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHNvbHV0aW9uIGJhbm5lci5cclxuICAgIHRoaXMuc29sdXRpb25CYW5uZXIucmVzZXQoKTtcclxuICAgIGlmICggY2hhbGxlbmdlLmJ1aWxkU3BlYyApIHtcclxuICAgICAgdGhpcy5zb2x1dGlvbkJhbm5lci50aXRsZVN0cmluZ1Byb3BlcnR5LnZhbHVlID0gYVNvbHV0aW9uQ29sb25TdHJpbmc7XHJcbiAgICAgIHRoaXMuc29sdXRpb25CYW5uZXIuYnVpbGRTcGVjUHJvcGVydHkudmFsdWUgPSBjaGFsbGVuZ2UuYnVpbGRTcGVjO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuc29sdXRpb25CYW5uZXIudGl0bGVTdHJpbmdQcm9wZXJ0eS52YWx1ZSA9IHNvbHV0aW9uQ29sb25TdHJpbmc7XHJcbiAgICAgIHRoaXMuc29sdXRpb25CYW5uZXIuYXJlYVRvRmluZFByb3BlcnR5LnZhbHVlID0gY2hhbGxlbmdlLmJhY2tncm91bmRTaGFwZS51bml0QXJlYTtcclxuICAgIH1cclxuICAgIHRoaXMuc2hvd0NoYWxsZW5nZUdyYXBoaWNzKCk7XHJcblxyXG4gICAgLy8gRGlzYWJsZSBpbnRlcmFjdGlvbiB3aXRoIHRoZSBjaGFsbGVuZ2UgZWxlbWVudHMuXHJcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLnBpY2thYmxlID0gZmFsc2U7XHJcblxyXG4gICAgLy8gVHVybiBvbiB0aGUgZGltZW5zaW9ucyBpbmRpY2F0b3IsIHNpbmNlIGl0IG1heSBtYWtlIHRoZSBhbnN3ZXIgbW9yZSBjbGVhciBmb3IgdGhlIHVzZXIuXHJcbiAgICB0aGlzLmNsZWFyRGltZW5zaW9uc0NvbnRyb2xPbk5leHRDaGFsbGVuZ2UgPSAhdGhpcy5tb2RlbC5zaW1TcGVjaWZpY01vZGVsLnNob3dEaW1lbnNpb25zUHJvcGVydHkuZ2V0KCk7XHJcbiAgICB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuc2hvd0RpbWVuc2lvbnNQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuXHJcbiAgICAvLyBTaG93IHRoZSBub2Rlcy5cclxuICAgIHRoaXMuc2hvdyggbm9kZXNUb1Nob3cgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgaGFuZGxlU2hvd2luZ0xldmVsUmVzdWx0c1N0YXRlKCkge1xyXG4gICAgaWYgKCB0aGlzLm1vZGVsLnNjb3JlUHJvcGVydHkuZ2V0KCkgPT09IHRoaXMubW9kZWwubWF4UG9zc2libGVTY29yZSApIHtcclxuICAgICAgdGhpcy5nYW1lQXVkaW9QbGF5ZXIuZ2FtZU92ZXJQZXJmZWN0U2NvcmUoKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLm1vZGVsLnNjb3JlUHJvcGVydHkuZ2V0KCkgPT09IDAgKSB7XHJcbiAgICAgIHRoaXMuZ2FtZUF1ZGlvUGxheWVyLmdhbWVPdmVyWmVyb1Njb3JlKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5nYW1lQXVkaW9QbGF5ZXIuZ2FtZU92ZXJJbXBlcmZlY3RTY29yZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2hvd0xldmVsUmVzdWx0c05vZGUoKTtcclxuICAgIHRoaXMuaGlkZUNoYWxsZW5nZSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGUgVXBkYXRlIHRoZSB3aW5kb3cgdGhhdCBkZXBpY3RzIHdoYXQgdGhlIHVzZXIgaGFzIGJ1aWx0LlxyXG4gIHVwZGF0ZVlvdUJ1aWx0V2luZG93KCBjaGFsbGVuZ2UgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGFsbGVuZ2UuYnVpbGRTcGVjLCAnVGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGZvciBjaGFsbGVuZ2VzIHRoYXQgaW5jbHVkZSBhIGJ1aWxkIHNwZWMuJyApO1xyXG4gICAgY29uc3QgdXNlckJ1aWx0U3BlYyA9IG5ldyBCdWlsZFNwZWMoXHJcbiAgICAgIHRoaXMuYXJlYU9mVXNlckNyZWF0ZWRTaGFwZSxcclxuICAgICAgY2hhbGxlbmdlLmJ1aWxkU3BlYy5wZXJpbWV0ZXIgPyB0aGlzLnBlcmltZXRlck9mVXNlckNyZWF0ZWRTaGFwZSA6IG51bGwsXHJcbiAgICAgIGNoYWxsZW5nZS5idWlsZFNwZWMucHJvcG9ydGlvbnMgPyB7XHJcbiAgICAgICAgY29sb3IxOiBjaGFsbGVuZ2UuYnVpbGRTcGVjLnByb3BvcnRpb25zLmNvbG9yMSxcclxuICAgICAgICBjb2xvcjI6IGNoYWxsZW5nZS5idWlsZFNwZWMucHJvcG9ydGlvbnMuY29sb3IyLFxyXG4gICAgICAgIGNvbG9yMVByb3BvcnRpb246IHRoaXMuY29sb3IxUHJvcG9ydGlvblxyXG4gICAgICB9IDogbnVsbFxyXG4gICAgKTtcclxuICAgIHRoaXMueW91QnVpbHRXaW5kb3cuc2V0QnVpbGRTcGVjKCB1c2VyQnVpbHRTcGVjICk7XHJcbiAgICB0aGlzLnlvdUJ1aWx0V2luZG93LnNldENvbG9yQmFzZWRPbkFuc3dlckNvcnJlY3RuZXNzKCB1c2VyQnVpbHRTcGVjLmVxdWFscyggY2hhbGxlbmdlLmJ1aWxkU3BlYyApICk7XHJcbiAgICB0aGlzLnlvdUJ1aWx0V2luZG93LmNlbnRlclkgPSB0aGlzLnNoYXBlQm9hcmRPcmlnaW5hbEJvdW5kcy5jZW50ZXJZO1xyXG4gICAgdGhpcy55b3VCdWlsdFdpbmRvdy5jZW50ZXJYID0gKCB0aGlzLmxheW91dEJvdW5kcy5tYXhYICsgdGhpcy5zaGFwZUJvYXJkT3JpZ2luYWxCb3VuZHMubWF4WCApIC8gMjtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlIFVwZGF0ZSB0aGUgd2luZG93IHRoYXQgZGVwaWN0cyB3aGF0IHRoZSB1c2VyIGhhcyBlbnRlcmVkIHVzaW5nIHRoZSBrZXlwYWQuXHJcbiAgdXBkYXRlWW91RW50ZXJlZFdpbmRvdyggY2hhbGxlbmdlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2hhbGxlbmdlLmNoZWNrU3BlYyA9PT0gJ2FyZWFFbnRlcmVkJywgJ1RoaXMgbWV0aG9kIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBmb3IgZmluZC10aGUtYXJlYSBzdHlsZSBjaGFsbGVuZ2VzLicgKTtcclxuICAgIHRoaXMueW91RW50ZXJlZFdpbmRvdy5zZXRWYWx1ZUVudGVyZWQoIHRoaXMubW9kZWwuc2ltU3BlY2lmaWNNb2RlbC5hcmVhR3Vlc3MgKTtcclxuICAgIHRoaXMueW91RW50ZXJlZFdpbmRvdy5zZXRDb2xvckJhc2VkT25BbnN3ZXJDb3JyZWN0bmVzcyggY2hhbGxlbmdlLmJhY2tncm91bmRTaGFwZS51bml0QXJlYSA9PT0gdGhpcy5tb2RlbC5zaW1TcGVjaWZpY01vZGVsLmFyZWFHdWVzcyApO1xyXG4gICAgdGhpcy55b3VFbnRlcmVkV2luZG93LmNlbnRlclkgPSB0aGlzLnNoYXBlQm9hcmRPcmlnaW5hbEJvdW5kcy5jZW50ZXJZO1xyXG4gICAgdGhpcy55b3VFbnRlcmVkV2luZG93LmNlbnRlclggPSAoIHRoaXMubGF5b3V0Qm91bmRzLm1heFggKyB0aGlzLnNoYXBlQm9hcmRPcmlnaW5hbEJvdW5kcy5tYXhYICkgLyAyO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGUgR3JhYiBhIHNuYXBzaG90IG9mIHdoYXRldmVyIHRoZSB1c2VyIGhhcyBidWlsdCBvciBlbnRlcmVkXHJcbiAgdXBkYXRlVXNlckFuc3dlcigpIHtcclxuICAgIC8vIFNhdmUgdGhlIHBhcmFtZXRlcnMgb2Ygd2hhdCB0aGUgdXNlciBoYXMgYnVpbHQsIGlmIHRoZXkndmUgYnVpbHQgYW55dGhpbmcuXHJcbiAgICB0aGlzLmFyZWFPZlVzZXJDcmVhdGVkU2hhcGUgPSB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuc2hhcGVQbGFjZW1lbnRCb2FyZC5hcmVhQW5kUGVyaW1ldGVyUHJvcGVydHkuZ2V0KCkuYXJlYTtcclxuICAgIHRoaXMucGVyaW1ldGVyT2ZVc2VyQ3JlYXRlZFNoYXBlID0gdGhpcy5tb2RlbC5zaW1TcGVjaWZpY01vZGVsLnNoYXBlUGxhY2VtZW50Qm9hcmQuYXJlYUFuZFBlcmltZXRlclByb3BlcnR5LmdldCgpLnBlcmltZXRlcjtcclxuICAgIGNvbnN0IGNoYWxsZW5nZSA9IHRoaXMubW9kZWwuY3VycmVudENoYWxsZW5nZVByb3BlcnR5LmdldCgpOyAvLyBjb252ZW5pZW5jZSB2YXJcclxuICAgIGlmICggY2hhbGxlbmdlLmJ1aWxkU3BlYyAmJiBjaGFsbGVuZ2UuYnVpbGRTcGVjLnByb3BvcnRpb25zICkge1xyXG4gICAgICB0aGlzLmNvbG9yMVByb3BvcnRpb24gPSB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuZ2V0UHJvcG9ydGlvbk9mQ29sb3IoIGNoYWxsZW5nZS5idWlsZFNwZWMucHJvcG9ydGlvbnMuY29sb3IxICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5jb2xvcjFQcm9wb3J0aW9uID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTdWJtaXQgdGhlIHVzZXIncyBhcmVhIGd1ZXNzLCBpZiB0aGVyZSBpcyBvbmUuXHJcbiAgICB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuYXJlYUd1ZXNzID0gdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wudmFsdWU7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZSBSZXR1cm5zIHRydWUgaWYgYW55IHNoYXBlIGlzIGFuaW1hdGluZyBvciB1c2VyIGNvbnRyb2xsZWQsIGZhbHNlIGlmIG5vdC5cclxuICBpc0FueVNoYXBlTW92aW5nKCkge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5tb2RlbC5zaW1TcGVjaWZpY01vZGVsLm1vdmFibGVTaGFwZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggdGhpcy5tb2RlbC5zaW1TcGVjaWZpY01vZGVsLm1vdmFibGVTaGFwZXMuZ2V0KCBpICkuYW5pbWF0aW5nUHJvcGVydHkuZ2V0KCkgfHxcclxuICAgICAgICAgICB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwubW92YWJsZVNoYXBlcy5nZXQoIGkgKS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBkaXNwb3NlQ3VycmVudENhcm91c2VsKCkge1xyXG4gICAgdGhpcy5hY3RpdmVTaGFwZU5vZGVDcmVhdG9ycy5sZW5ndGggPSAwO1xyXG4gICAgaWYgKCB0aGlzLmNhcm91c2VsICkge1xyXG4gICAgICB0aGlzLmNhcm91c2VsLmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy5jYXJvdXNlbCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcmVzZW50IHRoZSBjaGFsbGVuZ2UgdG8gdGhlIHVzZXIgYW5kIHNldCB0aGluZ3MgdXAgc28gdGhhdCB0aGV5IGNhbiBzdWJtaXQgdGhlaXIgYW5zd2VyLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcHJlc2VudENoYWxsZW5nZSgpIHtcclxuXHJcbiAgICBpZiAoIHRoaXMubW9kZWwuaW5jb3JyZWN0R3Vlc3Nlc09uQ3VycmVudENoYWxsZW5nZSA9PT0gMCApIHtcclxuXHJcbiAgICAgIC8vIENsZWFuIHVwIHByZXZpb3VzIGNoYWxsZW5nZS5cclxuICAgICAgdGhpcy5tb2RlbC5zaW1TcGVjaWZpY01vZGVsLmNsZWFyU2hhcGVQbGFjZW1lbnRCb2FyZCgpO1xyXG4gICAgICB0aGlzLmNoYWxsZW5nZVByb21wdEJhbm5lci5yZXNldCgpO1xyXG5cclxuICAgICAgdGhpcy5kaXNwb3NlQ3VycmVudENhcm91c2VsKCk7XHJcblxyXG4gICAgICBjb25zdCBjaGFsbGVuZ2UgPSB0aGlzLm1vZGVsLmN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eS5nZXQoKTsgLy8gQ29udmVuaWVuY2UgdmFyXHJcblxyXG4gICAgICAvLyBTZXQgdXAgdGhlIGNoYWxsZW5nZSBwcm9tcHQgYmFubmVyLCB3aGljaCBhcHBlYXJzIGFib3ZlIHRoZSBzaGFwZSBwbGFjZW1lbnQgYm9hcmQuXHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlUHJvbXB0QmFubmVyLnRpdGxlU3RyaW5nUHJvcGVydHkudmFsdWUgPSBjaGFsbGVuZ2UuYnVpbGRTcGVjID8gYnVpbGRJdFN0cmluZyA6IGZpbmRUaGVBcmVhU3RyaW5nO1xyXG5cclxuICAgICAgLy8gSWYgbmVlZGVkLCBzZXQgdXAgdGhlIGdvYWwgcHJvbXB0IHRoYXQgd2lsbCBpbml0aWFsbHkgYXBwZWFyIG92ZXIgdGhlIHNoYXBlIHBsYWNlbWVudCBib2FyZCAoaW4gdGhlIHotb3JkZXIpLlxyXG4gICAgICBpZiAoIGNoYWxsZW5nZS5idWlsZFNwZWMgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGRQcm9tcHRWQm94LnJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICAgICAgdGhpcy5idWlsZFByb21wdFZCb3guYWRkQ2hpbGQoIHRoaXMueW91ckdvYWxUaXRsZSApO1xyXG4gICAgICAgIGNvbnN0IGFyZWFHb2FsTm9kZSA9IG5ldyBUZXh0KCBTdHJpbmdVdGlscy5mb3JtYXQoIGFyZWFFcXVhbHNTdHJpbmcsIGNoYWxsZW5nZS5idWlsZFNwZWMuYXJlYSApLCB7XHJcbiAgICAgICAgICBmb250OiBHT0FMX1BST01QVF9GT05ULFxyXG4gICAgICAgICAgbWF4V2lkdGg6IHRoaXMuc2hhcGVCb2FyZE9yaWdpbmFsQm91bmRzLndpZHRoICogMC45XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIGlmICggY2hhbGxlbmdlLmJ1aWxkU3BlYy5wcm9wb3J0aW9ucyApIHtcclxuICAgICAgICAgIGNvbnN0IGFyZWFQcm9tcHQgPSBuZXcgTm9kZSgpO1xyXG4gICAgICAgICAgYXJlYVByb21wdC5hZGRDaGlsZCggYXJlYUdvYWxOb2RlICk7XHJcbiAgICAgICAgICBhcmVhR29hbE5vZGUuc3RyaW5nID0gYCR7YXJlYUdvYWxOb2RlLnN0cmluZ30sYDtcclxuICAgICAgICAgIGNvbnN0IGNvbG9yUHJvcG9ydGlvbnNQcm9tcHQgPSBuZXcgQ29sb3JQcm9wb3J0aW9uc1Byb21wdCggY2hhbGxlbmdlLmJ1aWxkU3BlYy5wcm9wb3J0aW9ucy5jb2xvcjEsXHJcbiAgICAgICAgICAgIGNoYWxsZW5nZS5idWlsZFNwZWMucHJvcG9ydGlvbnMuY29sb3IyLCBjaGFsbGVuZ2UuYnVpbGRTcGVjLnByb3BvcnRpb25zLmNvbG9yMVByb3BvcnRpb24sIHtcclxuICAgICAgICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTYsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICAgICAgICAgICAgICBsZWZ0OiBhcmVhR29hbE5vZGUud2lkdGggKyAxMCxcclxuICAgICAgICAgICAgICBjZW50ZXJZOiBhcmVhR29hbE5vZGUuY2VudGVyWSxcclxuICAgICAgICAgICAgICBtYXhXaWR0aDogdGhpcy5zaGFwZUJvYXJkT3JpZ2luYWxCb3VuZHMud2lkdGggKiAwLjlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGFyZWFQcm9tcHQuYWRkQ2hpbGQoIGNvbG9yUHJvcG9ydGlvbnNQcm9tcHQgKTtcclxuXHJcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIHByb21wdCB3aWxsIGZpdCBvbiB0aGUgYm9hcmQgLSBpbXBvcnRhbnQgZm9yIHRyYW5zbGF0YWJpbGl0eVxyXG4gICAgICAgICAgaWYgKCBhcmVhUHJvbXB0LndpZHRoID4gdGhpcy5zaGFwZUJvYXJkT3JpZ2luYWxCb3VuZHMud2lkdGggKiAwLjkgKSB7XHJcbiAgICAgICAgICAgIGFyZWFQcm9tcHQuc2NhbGUoICggdGhpcy5zaGFwZUJvYXJkT3JpZ2luYWxCb3VuZHMud2lkdGggKiAwLjkgKSAvIGFyZWFQcm9tcHQud2lkdGggKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLmJ1aWxkUHJvbXB0VkJveC5hZGRDaGlsZCggYXJlYVByb21wdCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuYnVpbGRQcm9tcHRWQm94LmFkZENoaWxkKCBhcmVhR29hbE5vZGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggY2hhbGxlbmdlLmJ1aWxkU3BlYy5wZXJpbWV0ZXIgKSB7XHJcbiAgICAgICAgICB0aGlzLmJ1aWxkUHJvbXB0VkJveC5hZGRDaGlsZCggbmV3IFRleHQoIFN0cmluZ1V0aWxzLmZvcm1hdCggcGVyaW1ldGVyRXF1YWxzU3RyaW5nLCBjaGFsbGVuZ2UuYnVpbGRTcGVjLnBlcmltZXRlciApLCB7XHJcbiAgICAgICAgICAgIGZvbnQ6IEdPQUxfUFJPTVBUX0ZPTlQsXHJcbiAgICAgICAgICAgIG1heFdpZHRoOiB0aGlzLm1heFNoYXBlQm9hcmRUZXh0V2lkdGhcclxuICAgICAgICAgIH0gKSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ2VudGVyIHRoZSBwYW5lbCBvdmVyIHRoZSBzaGFwZSBib2FyZCBhbmQgbWFrZSBpdCB2aXNpYmxlLlxyXG4gICAgICAgIHRoaXMuYnVpbGRQcm9tcHRQYW5lbC5jZW50ZXJYID0gdGhpcy5zaGFwZUJvYXJkT3JpZ2luYWxCb3VuZHMuY2VudGVyWDtcclxuICAgICAgICB0aGlzLmJ1aWxkUHJvbXB0UGFuZWwuY2VudGVyWSA9IHRoaXMuc2hhcGVCb2FyZE9yaWdpbmFsQm91bmRzLmNlbnRlclk7XHJcbiAgICAgICAgdGhpcy5idWlsZFByb21wdFBhbmVsLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuYnVpbGRQcm9tcHRQYW5lbC5vcGFjaXR5ID0gMTsgLy8gTmVjZXNzYXJ5IGJlY2F1c2UgdGhlIGJvYXJkIGlzIHNldCB0byBmYWRlIG91dCBlbHNld2hlcmUuXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5idWlsZFByb21wdFBhbmVsLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2V0IHRoZSBzdGF0ZSBvZiB0aGUgY29udHJvbCBwYW5lbC5cclxuICAgICAgdGhpcy5jb250cm9sUGFuZWwuZGltZW5zaW9uc0ljb24uc2V0R3JpZFZpc2libGUoICFjaGFsbGVuZ2UuYmFja2dyb3VuZFNoYXBlICk7XHJcbiAgICAgIHRoaXMuY29udHJvbFBhbmVsLmdyaWRDb250cm9sVmlzaWJsZVByb3BlcnR5LnNldCggY2hhbGxlbmdlLnRvb2xTcGVjLmdyaWRDb250cm9sICk7XHJcbiAgICAgIHRoaXMuY29udHJvbFBhbmVsLmRpbWVuc2lvbnNDb250cm9sVmlzaWJsZVByb3BlcnR5LnNldCggY2hhbGxlbmdlLnRvb2xTcGVjLmRpbWVuc2lvbnNDb250cm9sICk7XHJcbiAgICAgIGlmICggY2hhbGxlbmdlLmJhY2tncm91bmRTaGFwZSApIHtcclxuICAgICAgICB0aGlzLmNvbnRyb2xQYW5lbC5kaW1lbnNpb25zSWNvbi5zZXRDb2xvciggY2hhbGxlbmdlLmJhY2tncm91bmRTaGFwZS5maWxsQ29sb3IgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggY2hhbGxlbmdlLnVzZXJTaGFwZXMgKSB7XHJcbiAgICAgICAgdGhpcy5jb250cm9sUGFuZWwuZGltZW5zaW9uc0ljb24uc2V0Q29sb3IoIGNoYWxsZW5nZS51c2VyU2hhcGVzWyAwIF0uY29sb3IgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmNvbnRyb2xQYW5lbC5kaW1lbnNpb25zSWNvbi5zZXRDb2xvciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuR1JFRU5JU0hfQ09MT1IgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ3JlYXRlIHRoZSBjYXJvdXNlbCBpZiBpbmNsdWRlZCBhcyBwYXJ0IG9mIHRoaXMgY2hhbGxlbmdlLlxyXG4gICAgICBpZiAoIGNoYWxsZW5nZS51c2VyU2hhcGVzICE9PSBudWxsICkge1xyXG4gICAgICAgIGNoYWxsZW5nZS51c2VyU2hhcGVzLmZvckVhY2goIHVzZXJTaGFwZVNwZWMgPT4ge1xyXG4gICAgICAgICAgY29uc3QgY3JlYXRvck5vZGVPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBncmlkU3BhY2luZzogQXJlYUJ1aWxkZXJHYW1lTW9kZWwuVU5JVF9TUVVBUkVfTEVOR1RILFxyXG4gICAgICAgICAgICBzaGFwZURyYWdCb3VuZHM6IHRoaXMubGF5b3V0Qm91bmRzLFxyXG4gICAgICAgICAgICBub25Nb3ZpbmdBbmNlc3RvcjogdGhpcy5zaGFwZUNhcm91c2VsTGF5ZXJcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBpZiAoIHVzZXJTaGFwZVNwZWMuY3JlYXRpb25MaW1pdCApIHtcclxuICAgICAgICAgICAgY3JlYXRvck5vZGVPcHRpb25zLmNyZWF0aW9uTGltaXQgPSB1c2VyU2hhcGVTcGVjLmNyZWF0aW9uTGltaXQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNoYXBlTm9kZUNyZWF0b3JzLnB1c2goIHtcclxuICAgICAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFNoYXBlQ3JlYXRvck5vZGUoXHJcbiAgICAgICAgICAgICAgdXNlclNoYXBlU3BlYy5zaGFwZSxcclxuICAgICAgICAgICAgICB1c2VyU2hhcGVTcGVjLmNvbG9yLFxyXG4gICAgICAgICAgICAgIHRoaXMubW9kZWwuc2ltU3BlY2lmaWNNb2RlbC5hZGRVc2VyQ3JlYXRlZE1vdmFibGVTaGFwZS5iaW5kKCB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwgKSxcclxuICAgICAgICAgICAgICBjcmVhdG9yTm9kZU9wdGlvbnNcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGEgc2Nyb2xsaW5nIGNhcm91c2VsLlxyXG4gICAgICAgIHRoaXMuY2Fyb3VzZWwgPSBuZXcgQ2Fyb3VzZWwoIHRoaXMuYWN0aXZlU2hhcGVOb2RlQ3JlYXRvcnMsIHtcclxuICAgICAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXHJcbiAgICAgICAgICBpdGVtc1BlclBhZ2U6IElURU1TX1BFUl9DQVJPVVNFTF9QQUdFLFxyXG4gICAgICAgICAgY2VudGVyWDogdGhpcy5zaGFwZUJvYXJkT3JpZ2luYWxCb3VuZHMuY2VudGVyWCxcclxuICAgICAgICAgIHRvcDogdGhpcy5zaGFwZUJvYXJkT3JpZ2luYWxCb3VuZHMuYm90dG9tICsgU1BBQ0VfQVJPVU5EX1NIQVBFX1BMQUNFTUVOVF9CT0FSRCxcclxuICAgICAgICAgIGZpbGw6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfQkFDS0dST1VORF9DT0xPUlxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICB0aGlzLnNoYXBlQ2Fyb3VzZWxMYXllci5hZGRDaGlsZCggdGhpcy5jYXJvdXNlbCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZSwgVXRpbGl0eSBtZXRob2QgZm9yIGhpZGluZyBhbGwgb2YgdGhlIGdhbWUgbm9kZXMgd2hvc2UgdmlzaWJpbGl0eSBjaGFuZ2VzIGR1cmluZyB0aGUgY291cnNlIG9mIGEgY2hhbGxlbmdlLlxyXG4gIGhpZGVBbGxHYW1lTm9kZXMoKSB7XHJcbiAgICB0aGlzLmdhbWVDb250cm9sQnV0dG9ucy5mb3JFYWNoKCBidXR0b24gPT4geyBidXR0b24udmlzaWJsZSA9IGZhbHNlOyB9ICk7XHJcbiAgICB0aGlzLnNldE5vZGVWaXNpYmlsaXR5KCBmYWxzZSwgW1xyXG4gICAgICB0aGlzLnN0YXJ0R2FtZUxldmVsTm9kZSxcclxuICAgICAgdGhpcy5mYWNlV2l0aFBvaW50c05vZGUsXHJcbiAgICAgIHRoaXMuc2NvcmVib2FyZCxcclxuICAgICAgdGhpcy5jb250cm9sUGFuZWwsXHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlUHJvbXB0QmFubmVyLFxyXG4gICAgICB0aGlzLnNvbHV0aW9uQmFubmVyLFxyXG4gICAgICB0aGlzLm51bWJlckVudHJ5Q29udHJvbCxcclxuICAgICAgdGhpcy5hcmVhUXVlc3Rpb25Qcm9tcHQsXHJcbiAgICAgIHRoaXMueW91QnVpbHRXaW5kb3csXHJcbiAgICAgIHRoaXMueW91RW50ZXJlZFdpbmRvdyxcclxuICAgICAgdGhpcy5zaGFwZUNhcm91c2VsTGF5ZXIsXHJcbiAgICAgIHRoaXMuZXJhc2VyQnV0dG9uXHJcbiAgICBdICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIHNob3coIG5vZGVzVG9TaG93ICkge1xyXG4gICAgbm9kZXNUb1Nob3cuZm9yRWFjaCggbm9kZVRvU2hvdyA9PiB7IG5vZGVUb1Nob3cudmlzaWJsZSA9IHRydWU7IH0gKTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgc2V0Tm9kZVZpc2liaWxpdHkoIGlzVmlzaWJsZSwgbm9kZXMgKSB7XHJcbiAgICBub2Rlcy5mb3JFYWNoKCBub2RlID0+IHsgbm9kZS52aXNpYmxlID0gaXNWaXNpYmxlOyB9ICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIGhpZGVDaGFsbGVuZ2UoKSB7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMuY29udHJvbExheWVyLnZpc2libGUgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlIFNob3cgdGhlIGdyYXBoaWMgbW9kZWwgZWxlbWVudHMgZm9yIHRoaXMgY2hhbGxlbmdlLlxyXG4gIHNob3dDaGFsbGVuZ2VHcmFwaGljcygpIHtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIudmlzaWJsZSA9IHRydWU7XHJcbiAgICB0aGlzLmNvbnRyb2xMYXllci52aXNpYmxlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgdXBkYXRlZENoZWNrQnV0dG9uRW5hYmxlZFN0YXRlKCkge1xyXG4gICAgaWYgKCB0aGlzLm1vZGVsLmN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgaWYgKCB0aGlzLm1vZGVsLmN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eS5nZXQoKS5jaGVja1NwZWMgPT09ICdhcmVhRW50ZXJlZCcgKSB7XHJcbiAgICAgICAgdGhpcy5jaGVja0Fuc3dlckJ1dHRvbi5lbmFibGVkID0gdGhpcy5udW1iZXJFbnRyeUNvbnRyb2wua2V5cGFkLnZhbHVlU3RyaW5nUHJvcGVydHkudmFsdWUubGVuZ3RoID4gMDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmNoZWNrQW5zd2VyQnV0dG9uLmVuYWJsZWQgPSB0aGlzLm1vZGVsLnNpbVNwZWNpZmljTW9kZWwuc2hhcGVQbGFjZW1lbnRCb2FyZC5hcmVhQW5kUGVyaW1ldGVyUHJvcGVydHkuZ2V0KCkuYXJlYSA+IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgc2hvd0xldmVsUmVzdWx0c05vZGUoKSB7XHJcbiAgICAvLyBTZXQgYSBuZXcgXCJsZXZlbCBjb21wbGV0ZWRcIiBub2RlIGJhc2VkIG9uIHRoZSByZXN1bHRzLlxyXG4gICAgbGV0IGxldmVsQ29tcGxldGVkTm9kZSA9IG5ldyBMZXZlbENvbXBsZXRlZE5vZGUoXHJcbiAgICAgIHRoaXMubW9kZWwubGV2ZWxQcm9wZXJ0eS5nZXQoKSArIDEsXHJcbiAgICAgIHRoaXMubW9kZWwuc2NvcmVQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgdGhpcy5tb2RlbC5tYXhQb3NzaWJsZVNjb3JlLFxyXG4gICAgICB0aGlzLm1vZGVsLmNoYWxsZW5nZXNQZXJTZXQsXHJcbiAgICAgIHRoaXMubW9kZWwudGltZXJFbmFibGVkUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgIHRoaXMubW9kZWwuZWxhcHNlZFRpbWVQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgdGhpcy5tb2RlbC5iZXN0VGltZXNbIHRoaXMubW9kZWwubGV2ZWxQcm9wZXJ0eS5nZXQoKSBdLFxyXG4gICAgICB0aGlzLm1vZGVsLm5ld0Jlc3RUaW1lLFxyXG4gICAgICAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5nYW1lU3RhdGVQcm9wZXJ0eS5zZXQoIEdhbWVTdGF0ZS5DSE9PU0lOR19MRVZFTCApO1xyXG4gICAgICAgIHRoaXMucm9vdE5vZGUucmVtb3ZlQ2hpbGQoIGxldmVsQ29tcGxldGVkTm9kZSApO1xyXG4gICAgICAgIGxldmVsQ29tcGxldGVkTm9kZSA9IG51bGw7XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBjZW50ZXI6IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgbm9kZS5cclxuICAgIHRoaXMucm9vdE5vZGUuYWRkQ2hpbGQoIGxldmVsQ29tcGxldGVkTm9kZSApO1xyXG4gIH1cclxufVxyXG5cclxuYXJlYUJ1aWxkZXIucmVnaXN0ZXIoICdBcmVhQnVpbGRlckdhbWVWaWV3JywgQXJlYUJ1aWxkZXJHYW1lVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBBcmVhQnVpbGRlckdhbWVWaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxZQUFZLE1BQU0scURBQXFEO0FBQzlFLE9BQU9DLGtCQUFrQixNQUFNLG1EQUFtRDtBQUNsRixPQUFPQyxrQkFBa0IsTUFBTSxtREFBbUQ7QUFDbEYsT0FB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