// Copyright 2013-2023, University of Colorado Boulder

/**
 * Main screen for the balance game.
 *
 * @author John Blanco
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import FaceWithPointsNode from '../../../../scenery-phet/js/FaceWithPointsNode.js';
import OutsideBackgroundNode from '../../../../scenery-phet/js/OutsideBackgroundNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Node, Text } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import FiniteStatusBar from '../../../../vegas/js/FiniteStatusBar.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import LevelCompletedNode from '../../../../vegas/js/LevelCompletedNode.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import gameLevel1Icon_png from '../../../mipmaps/gameLevel1Icon_png.js';
import gameLevel2Icon_png from '../../../mipmaps/gameLevel2Icon_png.js';
import gameLevel3Icon_png from '../../../mipmaps/gameLevel3Icon_png.js';
import gameLevel4Icon_png from '../../../mipmaps/gameLevel4Icon_png.js';
import balancingAct from '../../balancingAct.js';
import BalancingActStrings from '../../BalancingActStrings.js';
import BASharedConstants from '../../common/BASharedConstants.js';
import ColumnState from '../../common/model/ColumnState.js';
import PositionIndicatorChoice from '../../common/model/PositionIndicatorChoice.js';
import AttachmentBarNode from '../../common/view/AttachmentBarNode.js';
import FulcrumNode from '../../common/view/FulcrumNode.js';
import LevelIndicatorNode from '../../common/view/LevelIndicatorNode.js';
import LevelSupportColumnNode from '../../common/view/LevelSupportColumnNode.js';
import MassNodeFactory from '../../common/view/MassNodeFactory.js';
import PlankNode from '../../common/view/PlankNode.js';
import PositionIndicatorControlPanel from '../../common/view/PositionIndicatorControlPanel.js';
import PositionMarkerSetNode from '../../common/view/PositionMarkerSetNode.js';
import RotatingRulerNode from '../../common/view/RotatingRulerNode.js';
import TiltedSupportColumnNode from '../../common/view/TiltedSupportColumnNode.js';
import BalanceGameModel from '../model/BalanceGameModel.js';
import BalanceMassesChallenge from '../model/BalanceMassesChallenge.js';
import MassDeductionChallenge from '../model/MassDeductionChallenge.js';
import TiltPredictionChallenge from '../model/TiltPredictionChallenge.js';
import GameIconNode from './GameIconNode.js';
import MassValueEntryNode from './MassValueEntryNode.js';
import StartGameLevelNode from './StartGameLevelNode.js';
import TiltPredictionSelectorNode from './TiltPredictionSelectorNode.js';
const checkString = VegasStrings.check;
const nextString = VegasStrings.next;
const showAnswerString = VegasStrings.showAnswer;
const startOverString = BalancingActStrings.startOver;
const tryAgainString = VegasStrings.tryAgain;

// constants
const BUTTON_FONT = new PhetFont(24);
const BUTTON_FILL = new Color(0, 255, 153);
class BalanceGameView extends ScreenView {
  /**
   * @param {BalanceGameModel} gameModel
   * @param {Tandem} tandem
   */
  constructor(gameModel, tandem) {
    super({
      layoutBounds: BASharedConstants.LAYOUT_BOUNDS
    });
    const self = this;
    this.model = gameModel;

    // Create the model-view transform.  The primary units used in the model are meters, so significant zoom is used.
    // The multipliers for the 2nd parameter can be used to adjust where the point (0, 0) in the model, which is on the
    // ground just below the center of the balance, is positioned in the view.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, new Vector2(this.layoutBounds.width * 0.45, this.layoutBounds.height * 0.86), 115);
    this.modelViewTransform = modelViewTransform; // Make modelViewTransform available to descendant types.

    // Create a root node and send to back so that the layout bounds box can
    // be made visible if needed.
    this.rootNode = new Node();
    this.addChild(this.rootNode);
    this.rootNode.moveToBack();

    // Add the background, which portrays the sky and ground.
    this.outsideBackgroundNode = new OutsideBackgroundNode(this.layoutBounds.centerX, modelViewTransform.modelToViewY(0), this.layoutBounds.width * 2.5, this.layoutBounds.height * 1.5, this.layoutBounds.height);
    this.rootNode.addChild(this.outsideBackgroundNode);

    // Add layers used to control game appearance.
    this.controlLayer = new Node();
    this.rootNode.addChild(this.controlLayer);
    this.challengeLayer = new Node();
    this.rootNode.addChild(this.challengeLayer);

    // Add the fulcrum, the columns, etc.
    this.challengeLayer.addChild(new FulcrumNode(modelViewTransform, gameModel.fulcrum));
    this.challengeLayer.addChild(new TiltedSupportColumnNode(modelViewTransform, gameModel.tiltedSupportColumn, gameModel.columnStateProperty));
    gameModel.levelSupportColumns.forEach(levelSupportColumn => {
      this.challengeLayer.addChild(new LevelSupportColumnNode(modelViewTransform, levelSupportColumn, gameModel.columnStateProperty, false));
    });
    this.challengeLayer.addChild(new PlankNode(modelViewTransform, gameModel.plank));
    this.challengeLayer.addChild(new AttachmentBarNode(modelViewTransform, gameModel.plank));

    // Watch the model and add/remove visual representations of masses.
    gameModel.movableMasses.addItemAddedListener(addedMass => {
      // Create and add the view representation for this mass.
      const massNode = MassNodeFactory.createMassNode(addedMass, modelViewTransform, true, new Property(true), gameModel.columnStateProperty);
      this.challengeLayer.addChild(massNode);

      // Move the mass to the front when grabbed so that layering stays reasonable.
      addedMass.userControlledProperty.link(userControlled => {
        if (userControlled) {
          massNode.moveToFront();
        }
      });

      // Add the removal listener for if and when this mass is removed from the model.
      gameModel.movableMasses.addItemRemovedListener(function removeMovableMass() {
        self.challengeLayer.removeChild(massNode);
        gameModel.movableMasses.removeItemRemovedListener(removeMovableMass);
      });
    });
    gameModel.fixedMasses.addItemAddedListener(addedMass => {
      // Create and add the view representation for this mass.
      const massNode = MassNodeFactory.createMassNode(addedMass, modelViewTransform, true, new Property(true), gameModel.columnStateProperty);
      massNode.pickable = false; // Fixed masses can't be moved by users.
      this.challengeLayer.addChild(massNode);

      // Add the removal listener for if and when this mass is removed from the model.
      gameModel.fixedMasses.addItemRemovedListener(function removeFixedMass() {
        self.challengeLayer.removeChild(massNode);
        gameModel.fixedMasses.removeItemRemovedListener(removeFixedMass);
      });
    });

    // Add the node that allows the user to choose a game level to play.
    this.startGameLevelNode = new StartGameLevelNode(level => {
      gameModel.startLevel(level);
    }, () => {
      gameModel.reset();
    }, gameModel.timerEnabledProperty, [new GameIconNode(gameLevel1Icon_png, 1), new GameIconNode(gameLevel2Icon_png, 2), new GameIconNode(gameLevel3Icon_png, 3), new GameIconNode(gameLevel4Icon_png, 4)], gameModel.mostRecentScores, modelViewTransform, {
      numStarsOnButtons: BalanceGameModel.PROBLEMS_PER_LEVEL,
      perfectScore: BalanceGameModel.MAX_POSSIBLE_SCORE,
      maxTitleWidth: this.layoutBounds.width
    });
    this.rootNode.addChild(this.startGameLevelNode);

    // Initialize a reference to the 'level completed' node.
    this.levelCompletedNode = null;

    // Create the audio player for the game sounds.
    this.gameAudioPlayer = new GameAudioPlayer();

    // Create and add the game scoreboard.
    this.scoreboard = new FiniteStatusBar(this.layoutBounds, this.visibleBoundsProperty, gameModel.scoreProperty, {
      challengeIndexProperty: gameModel.challengeIndexProperty,
      numberOfChallengesProperty: new Property(BalanceGameModel.PROBLEMS_PER_LEVEL),
      // FiniteStatusBar uses 1-based level numbering, model is 0-based, see #85.
      levelProperty: new DerivedProperty([gameModel.levelProperty], level => level + 1),
      elapsedTimeProperty: gameModel.elapsedTimeProperty,
      timerEnabledProperty: gameModel.timerEnabledProperty,
      startOverButtonText: startOverString,
      font: new PhetFont(14),
      textFill: 'white',
      xMargin: 20,
      yMargin: 5,
      barFill: 'rgb( 36, 88, 151 )',
      dynamicAlignment: false,
      startOverButtonOptions: {
        textFill: 'black',
        baseColor: '#e5f3ff',
        maxHeight: 30,
        listener: () => {
          gameModel.newGame();
        }
      }
    });
    this.addChild(this.scoreboard);

    // Add the title.  It is blank to start with, and is updated later at the appropriate state change.
    this.challengeTitleNode = new Text('', {
      font: new PhetFont({
        size: 60,
        weight: 'bold'
      }),
      fill: 'white',
      stroke: 'black',
      lineWidth: 1.5,
      top: this.scoreboard.bottom + 20,
      maxWidth: 530 // empirically determined based on tests with long strings
    });

    this.challengeLayer.addChild(this.challengeTitleNode);

    // Add the dialog node that is used in the mass deduction challenges
    // to enable the user to submit specific mass values.
    this.massValueEntryNode = new MassValueEntryNode({
      centerX: modelViewTransform.modelToViewX(0),
      top: this.challengeTitleNode.bounds.maxY + 4
    });
    this.challengeLayer.addChild(this.massValueEntryNode);

    // Add the node that allows the user to submit their prediction of which
    // way the plank will tilt.  This is used in the tilt prediction challenges.
    this.tiltPredictionSelectorNode = new TiltPredictionSelectorNode(gameModel.gameStateProperty);
    this.challengeLayer.addChild(this.tiltPredictionSelectorNode);
    this.tiltPredictionSelectorNode.center = new Vector2(modelViewTransform.modelToViewX(0), this.challengeTitleNode.bounds.maxY + 100);

    // Create the 'feedback node' that is used to visually indicate correct
    // and incorrect answers.
    this.faceWithPointsNode = new FaceWithPointsNode({
      faceOpacity: 0.6,
      faceDiameter: this.layoutBounds.width * 0.31,
      pointsFill: 'yellow',
      pointsStroke: 'black',
      pointsAlignment: 'rightCenter',
      centerX: this.modelViewTransform.modelToViewX(0),
      centerY: this.modelViewTransform.modelToViewY(2.2)
    });
    this.addChild(this.faceWithPointsNode);

    // Add and lay out the buttons.
    this.buttons = [];
    const buttonOptions = {
      font: BUTTON_FONT,
      baseColor: BUTTON_FILL,
      cornerRadius: 4,
      maxWidth: 300 // empirically determined
    };

    this.checkAnswerButton = new TextPushButton(checkString, merge({
      listener: () => {
        gameModel.checkAnswer(this.massValueEntryNode.massValueProperty.value, this.tiltPredictionSelectorNode.tiltPredictionProperty.value);
      }
    }, buttonOptions));
    this.rootNode.addChild(this.checkAnswerButton);
    this.buttons.push(this.checkAnswerButton);
    this.nextButton = new TextPushButton(nextString, merge({
      listener: () => {
        gameModel.nextChallenge();
      }
    }, buttonOptions));
    this.rootNode.addChild(this.nextButton);
    this.buttons.push(this.nextButton);
    this.tryAgainButton = new TextPushButton(tryAgainString, merge({
      listener: () => {
        gameModel.tryAgain();
      }
    }, buttonOptions));
    this.rootNode.addChild(this.tryAgainButton);
    this.buttons.push(this.tryAgainButton);
    this.displayCorrectAnswerButton = new TextPushButton(showAnswerString, merge({
      listener: () => {
        gameModel.displayCorrectAnswer();
      }
    }, buttonOptions));
    this.rootNode.addChild(this.displayCorrectAnswerButton);
    this.buttons.push(this.displayCorrectAnswerButton);
    const buttonCenter = this.modelViewTransform.modelToViewPosition(new Vector2(0, -0.3));
    this.buttons.forEach(button => {
      button.center = buttonCenter;
    });

    // Add listeners that control the enabled state of the check answer button.
    gameModel.plank.massesOnSurface.addItemAddedListener(this.updateCheckAnswerButtonEnabled.bind(this));
    gameModel.plank.massesOnSurface.addItemRemovedListener(this.updateCheckAnswerButtonEnabled.bind(this));
    this.tiltPredictionSelectorNode.tiltPredictionProperty.link(this.updateCheckAnswerButtonEnabled.bind(this));
    this.massValueEntryNode.massValueProperty.link(this.updateCheckAnswerButtonEnabled.bind(this));

    // Register for changes to the game state and update accordingly.
    gameModel.gameStateProperty.link(this.handleGameStateChange.bind(this));

    // Show the level indicator to help the user see if the plank is perfectly
    // balanced, but only show it when the support column has been removed.
    const levelIndicator = new LevelIndicatorNode(modelViewTransform, gameModel.plank);
    gameModel.columnStateProperty.link(columnState => {
      levelIndicator.visible = columnState === ColumnState.NO_COLUMNS;
    });
    this.challengeLayer.addChild(levelIndicator);

    // Add a panel for controlling whether the ruler or marker set are visible.
    const positionMarkerStateProperty = new EnumerationDeprecatedProperty(PositionIndicatorChoice, PositionIndicatorChoice.NONE);

    // Add the ruler.
    const rulersVisibleProperty = new Property(false);
    positionMarkerStateProperty.link(positionMarkerState => {
      rulersVisibleProperty.value = positionMarkerState === PositionIndicatorChoice.RULERS;
    });
    this.challengeLayer.addChild(new RotatingRulerNode(gameModel.plank, modelViewTransform, rulersVisibleProperty));

    // Add the position markers.
    const positionMarkersVisibleProperty = new Property(false);
    positionMarkerStateProperty.link(positionMarkerState => {
      positionMarkersVisibleProperty.value = positionMarkerState === PositionIndicatorChoice.MARKS;
    });
    this.challengeLayer.addChild(new PositionMarkerSetNode(gameModel.plank, modelViewTransform, positionMarkersVisibleProperty));

    // Add the control panel that will allow users to select between the
    // various position markers, i.e. ruler, position markers, or nothing.
    const positionControlPanel = new PositionIndicatorControlPanel(positionMarkerStateProperty, {
      right: this.layoutBounds.right - 10,
      top: this.scoreboard.bottom + 23,
      // specify a max width that will fit the panel between the rightmost view object and the layout bounds
      maxWidth: this.layoutBounds.width - this.tiltPredictionSelectorNode.bounds.maxX - 10,
      tandem: tandem.createTandem('positionPanel')
    });
    this.controlLayer.addChild(positionControlPanel);
  }

  // @private
  updateTitle() {
    const balanceGameChallenge = this.model.getCurrentChallenge();
    if (balanceGameChallenge !== null) {
      this.challengeTitleNode.string = this.model.getCurrentChallenge().viewConfig.title;
    } else {
      // Set the value to something so that layout can be done.  This
      // string doesn't need to be translated - users should never see it.
      this.challengeTitleNode.setString('No challenge available.');
    }

    // Center the title above the pivot point.
    this.challengeTitleNode.centerX = this.modelViewTransform.modelToViewX(this.model.plank.pivotPoint.x);
  }

  // @private
  updateCheckAnswerButtonEnabled() {
    if (this.model.getCurrentChallenge() instanceof BalanceMassesChallenge) {
      // The button should be enabled whenever there are masses on the
      // right side of the plank.
      let massesOnRightSide = false;
      this.model.plank.massesOnSurface.forEach(mass => {
        if (mass.positionProperty.get().x > this.model.plank.getPlankSurfaceCenter().x) {
          massesOnRightSide = true;
        }
      });
      this.checkAnswerButton.enabled = massesOnRightSide;
    } else if (this.model.getCurrentChallenge() instanceof TiltPredictionChallenge) {
      // The button should be enabled once the user has made a prediction.
      this.checkAnswerButton.enabled = this.tiltPredictionSelectorNode.tiltPredictionProperty.value !== 'none';
    } else if (this.model.getCurrentChallenge() instanceof MassDeductionChallenge) {
      // The button should be enabled for any non-zero value.
      this.checkAnswerButton.enabled = this.massValueEntryNode.massValueProperty.value !== 0;
    }
  }

  // @private When the game state changes, update the view with the appropriate buttons and readouts.
  handleGameStateChange(gameState) {
    // Hide all nodes - the appropriate ones will be shown later based on
    // the current state.
    this.hideAllGameNodes();
    let score;

    // Show the nodes appropriate to the state
    switch (gameState) {
      case 'choosingLevel':
        this.show([this.startGameLevelNode]);
        this.hideChallenge();
        break;
      case 'presentingInteractiveChallenge':
        this.updateTitle();
        this.challengeLayer.pickable = null;
        this.show([this.challengeTitleNode, this.scoreboard, this.checkAnswerButton]);
        if (this.model.getCurrentChallenge().viewConfig.showMassEntryDialog) {
          if (this.model.incorrectGuessesOnCurrentChallenge === 0) {
            this.massValueEntryNode.clear();
          }
          this.massValueEntryNode.visible = true;
        } else {
          if (this.model.getCurrentChallenge().viewConfig.showTiltPredictionSelector) {
            this.tiltPredictionSelectorNode.tiltPredictionProperty.reset();
            this.tiltPredictionSelectorNode.visible = true;
          }
        }
        this.showChallengeGraphics();
        break;
      case 'showingCorrectAnswerFeedback':
        // Show the appropriate nodes for this state.
        this.show([this.scoreboard, this.nextButton]);

        // Give the user the appropriate audio and visual feedback
        this.gameAudioPlayer.correctAnswer();
        this.faceWithPointsNode.smile();
        this.faceWithPointsNode.setPoints(this.model.getChallengeCurrentPointValue());
        this.faceWithPointsNode.visible = true;

        // Disable interaction with the challenge elements.
        this.challengeLayer.pickable = false;
        break;
      case 'showingIncorrectAnswerFeedbackTryAgain':
        // Show the appropriate nodes for this state.
        this.show([this.scoreboard, this.tryAgainButton]);

        // Give the user the appropriate feedback
        this.gameAudioPlayer.wrongAnswer();
        this.faceWithPointsNode.frown();
        this.faceWithPointsNode.setPoints(this.model.scoreProperty.get());
        this.faceWithPointsNode.visible = true;

        // Disable interaction with the challenge elements.
        this.challengeLayer.pickable = false;
        break;
      case 'showingIncorrectAnswerFeedbackMoveOn':
        // Show the appropriate nodes for this state.
        this.show([this.scoreboard, this.displayCorrectAnswerButton]);

        // Give the user the appropriate feedback
        this.gameAudioPlayer.wrongAnswer();
        this.faceWithPointsNode.frown();
        this.faceWithPointsNode.setPoints(this.model.scoreProperty.get());
        this.faceWithPointsNode.visible = true;

        // Disable interaction with the challenge elements.
        this.challengeLayer.pickable = false;
        break;
      case 'displayingCorrectAnswer':
        // Show the appropriate nodes for this state.
        this.show([this.scoreboard, this.nextButton]);

        // Display the correct answer
        if (this.model.getCurrentChallenge().viewConfig.showMassEntryDialog) {
          this.massValueEntryNode.showAnswer(this.model.getTotalFixedMassValue());
          this.massValueEntryNode.visible = true;
        } else if (this.model.getCurrentChallenge().viewConfig.showTiltPredictionSelector) {
          this.tiltPredictionSelectorNode.tiltPredictionProperty.value = this.model.getTipDirection();
          this.tiltPredictionSelectorNode.visible = true;
        }
        this.showChallengeGraphics();

        // Disable interaction with the challenge elements.
        this.challengeLayer.pickable = false;
        break;
      case 'showingLevelResults':
        score = this.model.scoreProperty.get();
        if (score === BalanceGameModel.MAX_POSSIBLE_SCORE) {
          this.gameAudioPlayer.gameOverPerfectScore();
        } else if (score === 0) {
          this.gameAudioPlayer.gameOverZeroScore();
        } else {
          this.gameAudioPlayer.gameOverImperfectScore();
        }
        this.showLevelResultsNode();
        this.hideChallenge();
        break;
      default:
        throw new Error('Unhandled game state');
    }
  }

  // @private Utility method for hiding all of the game nodes whose visibility changes during the course of a challenge.
  hideAllGameNodes() {
    this.buttons.forEach(button => {
      button.visible = false;
    });
    this.setNodeVisibility(false, [this.startGameLevelNode, this.challengeTitleNode, this.faceWithPointsNode, this.scoreboard, this.tiltPredictionSelectorNode, this.massValueEntryNode]);
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

  // @private Show the graphic model elements for this challenge, i.e. the plank, fulcrum, etc.
  showChallengeGraphics() {
    this.challengeLayer.visible = true;
    this.controlLayer.visible = true;
  }

  // @private
  showLevelResultsNode() {
    // Set a new "level completed" node based on the results.
    this.levelCompletedNode = new LevelCompletedNode(this.model.levelProperty.get() + 1, this.model.scoreProperty.get(), BalanceGameModel.MAX_POSSIBLE_SCORE, BalanceGameModel.PROBLEMS_PER_LEVEL, this.model.timerEnabledProperty.get(), this.model.elapsedTimeProperty.get(), this.model.bestTimes[this.model.levelProperty.get()], this.model.newBestTime, () => {
      this.model.gameStateProperty.set('choosingLevel');
      this.rootNode.removeChild(this.levelCompletedNode);
      this.levelCompletedNode = null;
    }, {
      center: this.layoutBounds.center
    });

    // Add the node.
    this.rootNode.addChild(this.levelCompletedNode);
  }
}
balancingAct.register('BalanceGameView', BalanceGameView);
export default BalanceGameView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIlByb3BlcnR5IiwiVmVjdG9yMiIsIlNjcmVlblZpZXciLCJtZXJnZSIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJGYWNlV2l0aFBvaW50c05vZGUiLCJPdXRzaWRlQmFja2dyb3VuZE5vZGUiLCJQaGV0Rm9udCIsIkNvbG9yIiwiTm9kZSIsIlRleHQiLCJUZXh0UHVzaEJ1dHRvbiIsIkZpbml0ZVN0YXR1c0JhciIsIkdhbWVBdWRpb1BsYXllciIsIkxldmVsQ29tcGxldGVkTm9kZSIsIlZlZ2FzU3RyaW5ncyIsImdhbWVMZXZlbDFJY29uX3BuZyIsImdhbWVMZXZlbDJJY29uX3BuZyIsImdhbWVMZXZlbDNJY29uX3BuZyIsImdhbWVMZXZlbDRJY29uX3BuZyIsImJhbGFuY2luZ0FjdCIsIkJhbGFuY2luZ0FjdFN0cmluZ3MiLCJCQVNoYXJlZENvbnN0YW50cyIsIkNvbHVtblN0YXRlIiwiUG9zaXRpb25JbmRpY2F0b3JDaG9pY2UiLCJBdHRhY2htZW50QmFyTm9kZSIsIkZ1bGNydW1Ob2RlIiwiTGV2ZWxJbmRpY2F0b3JOb2RlIiwiTGV2ZWxTdXBwb3J0Q29sdW1uTm9kZSIsIk1hc3NOb2RlRmFjdG9yeSIsIlBsYW5rTm9kZSIsIlBvc2l0aW9uSW5kaWNhdG9yQ29udHJvbFBhbmVsIiwiUG9zaXRpb25NYXJrZXJTZXROb2RlIiwiUm90YXRpbmdSdWxlck5vZGUiLCJUaWx0ZWRTdXBwb3J0Q29sdW1uTm9kZSIsIkJhbGFuY2VHYW1lTW9kZWwiLCJCYWxhbmNlTWFzc2VzQ2hhbGxlbmdlIiwiTWFzc0RlZHVjdGlvbkNoYWxsZW5nZSIsIlRpbHRQcmVkaWN0aW9uQ2hhbGxlbmdlIiwiR2FtZUljb25Ob2RlIiwiTWFzc1ZhbHVlRW50cnlOb2RlIiwiU3RhcnRHYW1lTGV2ZWxOb2RlIiwiVGlsdFByZWRpY3Rpb25TZWxlY3Rvck5vZGUiLCJjaGVja1N0cmluZyIsImNoZWNrIiwibmV4dFN0cmluZyIsIm5leHQiLCJzaG93QW5zd2VyU3RyaW5nIiwic2hvd0Fuc3dlciIsInN0YXJ0T3ZlclN0cmluZyIsInN0YXJ0T3ZlciIsInRyeUFnYWluU3RyaW5nIiwidHJ5QWdhaW4iLCJCVVRUT05fRk9OVCIsIkJVVFRPTl9GSUxMIiwiQmFsYW5jZUdhbWVWaWV3IiwiY29uc3RydWN0b3IiLCJnYW1lTW9kZWwiLCJ0YW5kZW0iLCJsYXlvdXRCb3VuZHMiLCJMQVlPVVRfQk9VTkRTIiwic2VsZiIsIm1vZGVsIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmciLCJaRVJPIiwid2lkdGgiLCJoZWlnaHQiLCJyb290Tm9kZSIsImFkZENoaWxkIiwibW92ZVRvQmFjayIsIm91dHNpZGVCYWNrZ3JvdW5kTm9kZSIsImNlbnRlclgiLCJtb2RlbFRvVmlld1kiLCJjb250cm9sTGF5ZXIiLCJjaGFsbGVuZ2VMYXllciIsImZ1bGNydW0iLCJ0aWx0ZWRTdXBwb3J0Q29sdW1uIiwiY29sdW1uU3RhdGVQcm9wZXJ0eSIsImxldmVsU3VwcG9ydENvbHVtbnMiLCJmb3JFYWNoIiwibGV2ZWxTdXBwb3J0Q29sdW1uIiwicGxhbmsiLCJtb3ZhYmxlTWFzc2VzIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhZGRlZE1hc3MiLCJtYXNzTm9kZSIsImNyZWF0ZU1hc3NOb2RlIiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImxpbmsiLCJ1c2VyQ29udHJvbGxlZCIsIm1vdmVUb0Zyb250IiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsInJlbW92ZU1vdmFibGVNYXNzIiwicmVtb3ZlQ2hpbGQiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwiZml4ZWRNYXNzZXMiLCJwaWNrYWJsZSIsInJlbW92ZUZpeGVkTWFzcyIsInN0YXJ0R2FtZUxldmVsTm9kZSIsImxldmVsIiwic3RhcnRMZXZlbCIsInJlc2V0IiwidGltZXJFbmFibGVkUHJvcGVydHkiLCJtb3N0UmVjZW50U2NvcmVzIiwibnVtU3RhcnNPbkJ1dHRvbnMiLCJQUk9CTEVNU19QRVJfTEVWRUwiLCJwZXJmZWN0U2NvcmUiLCJNQVhfUE9TU0lCTEVfU0NPUkUiLCJtYXhUaXRsZVdpZHRoIiwibGV2ZWxDb21wbGV0ZWROb2RlIiwiZ2FtZUF1ZGlvUGxheWVyIiwic2NvcmVib2FyZCIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsInNjb3JlUHJvcGVydHkiLCJjaGFsbGVuZ2VJbmRleFByb3BlcnR5IiwibnVtYmVyT2ZDaGFsbGVuZ2VzUHJvcGVydHkiLCJsZXZlbFByb3BlcnR5IiwiZWxhcHNlZFRpbWVQcm9wZXJ0eSIsInN0YXJ0T3ZlckJ1dHRvblRleHQiLCJmb250IiwidGV4dEZpbGwiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImJhckZpbGwiLCJkeW5hbWljQWxpZ25tZW50Iiwic3RhcnRPdmVyQnV0dG9uT3B0aW9ucyIsImJhc2VDb2xvciIsIm1heEhlaWdodCIsImxpc3RlbmVyIiwibmV3R2FtZSIsImNoYWxsZW5nZVRpdGxlTm9kZSIsInNpemUiLCJ3ZWlnaHQiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwidG9wIiwiYm90dG9tIiwibWF4V2lkdGgiLCJtYXNzVmFsdWVFbnRyeU5vZGUiLCJtb2RlbFRvVmlld1giLCJib3VuZHMiLCJtYXhZIiwidGlsdFByZWRpY3Rpb25TZWxlY3Rvck5vZGUiLCJnYW1lU3RhdGVQcm9wZXJ0eSIsImNlbnRlciIsImZhY2VXaXRoUG9pbnRzTm9kZSIsImZhY2VPcGFjaXR5IiwiZmFjZURpYW1ldGVyIiwicG9pbnRzRmlsbCIsInBvaW50c1N0cm9rZSIsInBvaW50c0FsaWdubWVudCIsImNlbnRlclkiLCJidXR0b25zIiwiYnV0dG9uT3B0aW9ucyIsImNvcm5lclJhZGl1cyIsImNoZWNrQW5zd2VyQnV0dG9uIiwiY2hlY2tBbnN3ZXIiLCJtYXNzVmFsdWVQcm9wZXJ0eSIsInZhbHVlIiwidGlsdFByZWRpY3Rpb25Qcm9wZXJ0eSIsInB1c2giLCJuZXh0QnV0dG9uIiwibmV4dENoYWxsZW5nZSIsInRyeUFnYWluQnV0dG9uIiwiZGlzcGxheUNvcnJlY3RBbnN3ZXJCdXR0b24iLCJkaXNwbGF5Q29ycmVjdEFuc3dlciIsImJ1dHRvbkNlbnRlciIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJidXR0b24iLCJtYXNzZXNPblN1cmZhY2UiLCJ1cGRhdGVDaGVja0Fuc3dlckJ1dHRvbkVuYWJsZWQiLCJiaW5kIiwiaGFuZGxlR2FtZVN0YXRlQ2hhbmdlIiwibGV2ZWxJbmRpY2F0b3IiLCJjb2x1bW5TdGF0ZSIsInZpc2libGUiLCJOT19DT0xVTU5TIiwicG9zaXRpb25NYXJrZXJTdGF0ZVByb3BlcnR5IiwiTk9ORSIsInJ1bGVyc1Zpc2libGVQcm9wZXJ0eSIsInBvc2l0aW9uTWFya2VyU3RhdGUiLCJSVUxFUlMiLCJwb3NpdGlvbk1hcmtlcnNWaXNpYmxlUHJvcGVydHkiLCJNQVJLUyIsInBvc2l0aW9uQ29udHJvbFBhbmVsIiwicmlnaHQiLCJtYXhYIiwiY3JlYXRlVGFuZGVtIiwidXBkYXRlVGl0bGUiLCJiYWxhbmNlR2FtZUNoYWxsZW5nZSIsImdldEN1cnJlbnRDaGFsbGVuZ2UiLCJzdHJpbmciLCJ2aWV3Q29uZmlnIiwidGl0bGUiLCJzZXRTdHJpbmciLCJwaXZvdFBvaW50IiwieCIsIm1hc3Nlc09uUmlnaHRTaWRlIiwibWFzcyIsInBvc2l0aW9uUHJvcGVydHkiLCJnZXQiLCJnZXRQbGFua1N1cmZhY2VDZW50ZXIiLCJlbmFibGVkIiwiZ2FtZVN0YXRlIiwiaGlkZUFsbEdhbWVOb2RlcyIsInNjb3JlIiwic2hvdyIsImhpZGVDaGFsbGVuZ2UiLCJzaG93TWFzc0VudHJ5RGlhbG9nIiwiaW5jb3JyZWN0R3Vlc3Nlc09uQ3VycmVudENoYWxsZW5nZSIsImNsZWFyIiwic2hvd1RpbHRQcmVkaWN0aW9uU2VsZWN0b3IiLCJzaG93Q2hhbGxlbmdlR3JhcGhpY3MiLCJjb3JyZWN0QW5zd2VyIiwic21pbGUiLCJzZXRQb2ludHMiLCJnZXRDaGFsbGVuZ2VDdXJyZW50UG9pbnRWYWx1ZSIsIndyb25nQW5zd2VyIiwiZnJvd24iLCJnZXRUb3RhbEZpeGVkTWFzc1ZhbHVlIiwiZ2V0VGlwRGlyZWN0aW9uIiwiZ2FtZU92ZXJQZXJmZWN0U2NvcmUiLCJnYW1lT3Zlclplcm9TY29yZSIsImdhbWVPdmVySW1wZXJmZWN0U2NvcmUiLCJzaG93TGV2ZWxSZXN1bHRzTm9kZSIsIkVycm9yIiwic2V0Tm9kZVZpc2liaWxpdHkiLCJub2Rlc1RvU2hvdyIsIm5vZGVUb1Nob3ciLCJpc1Zpc2libGUiLCJub2RlcyIsIm5vZGUiLCJiZXN0VGltZXMiLCJuZXdCZXN0VGltZSIsInNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmFsYW5jZUdhbWVWaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gc2NyZWVuIGZvciB0aGUgYmFsYW5jZSBnYW1lLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgRmFjZVdpdGhQb2ludHNOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GYWNlV2l0aFBvaW50c05vZGUuanMnO1xyXG5pbXBvcnQgT3V0c2lkZUJhY2tncm91bmROb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9PdXRzaWRlQmFja2dyb3VuZE5vZGUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGV4dFB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvVGV4dFB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgRmluaXRlU3RhdHVzQmFyIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0Zpbml0ZVN0YXR1c0Jhci5qcyc7XHJcbmltcG9ydCBHYW1lQXVkaW9QbGF5ZXIgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvR2FtZUF1ZGlvUGxheWVyLmpzJztcclxuaW1wb3J0IExldmVsQ29tcGxldGVkTm9kZSBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9MZXZlbENvbXBsZXRlZE5vZGUuanMnO1xyXG5pbXBvcnQgVmVnYXNTdHJpbmdzIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1ZlZ2FzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBnYW1lTGV2ZWwxSWNvbl9wbmcgZnJvbSAnLi4vLi4vLi4vbWlwbWFwcy9nYW1lTGV2ZWwxSWNvbl9wbmcuanMnO1xyXG5pbXBvcnQgZ2FtZUxldmVsMkljb25fcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZ2FtZUxldmVsMkljb25fcG5nLmpzJztcclxuaW1wb3J0IGdhbWVMZXZlbDNJY29uX3BuZyBmcm9tICcuLi8uLi8uLi9taXBtYXBzL2dhbWVMZXZlbDNJY29uX3BuZy5qcyc7XHJcbmltcG9ydCBnYW1lTGV2ZWw0SWNvbl9wbmcgZnJvbSAnLi4vLi4vLi4vbWlwbWFwcy9nYW1lTGV2ZWw0SWNvbl9wbmcuanMnO1xyXG5pbXBvcnQgYmFsYW5jaW5nQWN0IGZyb20gJy4uLy4uL2JhbGFuY2luZ0FjdC5qcyc7XHJcbmltcG9ydCBCYWxhbmNpbmdBY3RTdHJpbmdzIGZyb20gJy4uLy4uL0JhbGFuY2luZ0FjdFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQkFTaGFyZWRDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0JBU2hhcmVkQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENvbHVtblN0YXRlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Db2x1bW5TdGF0ZS5qcyc7XHJcbmltcG9ydCBQb3NpdGlvbkluZGljYXRvckNob2ljZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUG9zaXRpb25JbmRpY2F0b3JDaG9pY2UuanMnO1xyXG5pbXBvcnQgQXR0YWNobWVudEJhck5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQXR0YWNobWVudEJhck5vZGUuanMnO1xyXG5pbXBvcnQgRnVsY3J1bU5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRnVsY3J1bU5vZGUuanMnO1xyXG5pbXBvcnQgTGV2ZWxJbmRpY2F0b3JOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0xldmVsSW5kaWNhdG9yTm9kZS5qcyc7XHJcbmltcG9ydCBMZXZlbFN1cHBvcnRDb2x1bW5Ob2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0xldmVsU3VwcG9ydENvbHVtbk5vZGUuanMnO1xyXG5pbXBvcnQgTWFzc05vZGVGYWN0b3J5IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L01hc3NOb2RlRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBQbGFua05vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvUGxhbmtOb2RlLmpzJztcclxuaW1wb3J0IFBvc2l0aW9uSW5kaWNhdG9yQ29udHJvbFBhbmVsIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1Bvc2l0aW9uSW5kaWNhdG9yQ29udHJvbFBhbmVsLmpzJztcclxuaW1wb3J0IFBvc2l0aW9uTWFya2VyU2V0Tm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Qb3NpdGlvbk1hcmtlclNldE5vZGUuanMnO1xyXG5pbXBvcnQgUm90YXRpbmdSdWxlck5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvUm90YXRpbmdSdWxlck5vZGUuanMnO1xyXG5pbXBvcnQgVGlsdGVkU3VwcG9ydENvbHVtbk5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvVGlsdGVkU3VwcG9ydENvbHVtbk5vZGUuanMnO1xyXG5pbXBvcnQgQmFsYW5jZUdhbWVNb2RlbCBmcm9tICcuLi9tb2RlbC9CYWxhbmNlR2FtZU1vZGVsLmpzJztcclxuaW1wb3J0IEJhbGFuY2VNYXNzZXNDaGFsbGVuZ2UgZnJvbSAnLi4vbW9kZWwvQmFsYW5jZU1hc3Nlc0NoYWxsZW5nZS5qcyc7XHJcbmltcG9ydCBNYXNzRGVkdWN0aW9uQ2hhbGxlbmdlIGZyb20gJy4uL21vZGVsL01hc3NEZWR1Y3Rpb25DaGFsbGVuZ2UuanMnO1xyXG5pbXBvcnQgVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2UgZnJvbSAnLi4vbW9kZWwvVGlsdFByZWRpY3Rpb25DaGFsbGVuZ2UuanMnO1xyXG5pbXBvcnQgR2FtZUljb25Ob2RlIGZyb20gJy4vR2FtZUljb25Ob2RlLmpzJztcclxuaW1wb3J0IE1hc3NWYWx1ZUVudHJ5Tm9kZSBmcm9tICcuL01hc3NWYWx1ZUVudHJ5Tm9kZS5qcyc7XHJcbmltcG9ydCBTdGFydEdhbWVMZXZlbE5vZGUgZnJvbSAnLi9TdGFydEdhbWVMZXZlbE5vZGUuanMnO1xyXG5pbXBvcnQgVGlsdFByZWRpY3Rpb25TZWxlY3Rvck5vZGUgZnJvbSAnLi9UaWx0UHJlZGljdGlvblNlbGVjdG9yTm9kZS5qcyc7XHJcblxyXG5jb25zdCBjaGVja1N0cmluZyA9IFZlZ2FzU3RyaW5ncy5jaGVjaztcclxuY29uc3QgbmV4dFN0cmluZyA9IFZlZ2FzU3RyaW5ncy5uZXh0O1xyXG5jb25zdCBzaG93QW5zd2VyU3RyaW5nID0gVmVnYXNTdHJpbmdzLnNob3dBbnN3ZXI7XHJcbmNvbnN0IHN0YXJ0T3ZlclN0cmluZyA9IEJhbGFuY2luZ0FjdFN0cmluZ3Muc3RhcnRPdmVyO1xyXG5jb25zdCB0cnlBZ2FpblN0cmluZyA9IFZlZ2FzU3RyaW5ncy50cnlBZ2FpbjtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBCVVRUT05fRk9OVCA9IG5ldyBQaGV0Rm9udCggMjQgKTtcclxuY29uc3QgQlVUVE9OX0ZJTEwgPSBuZXcgQ29sb3IoIDAsIDI1NSwgMTUzICk7XHJcblxyXG5jbGFzcyBCYWxhbmNlR2FtZVZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCYWxhbmNlR2FtZU1vZGVsfSBnYW1lTW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGdhbWVNb2RlbCwgdGFuZGVtICkge1xyXG4gICAgc3VwZXIoIHsgbGF5b3V0Qm91bmRzOiBCQVNoYXJlZENvbnN0YW50cy5MQVlPVVRfQk9VTkRTIH0gKTtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgdGhpcy5tb2RlbCA9IGdhbWVNb2RlbDtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIG1vZGVsLXZpZXcgdHJhbnNmb3JtLiAgVGhlIHByaW1hcnkgdW5pdHMgdXNlZCBpbiB0aGUgbW9kZWwgYXJlIG1ldGVycywgc28gc2lnbmlmaWNhbnQgem9vbSBpcyB1c2VkLlxyXG4gICAgLy8gVGhlIG11bHRpcGxpZXJzIGZvciB0aGUgMm5kIHBhcmFtZXRlciBjYW4gYmUgdXNlZCB0byBhZGp1c3Qgd2hlcmUgdGhlIHBvaW50ICgwLCAwKSBpbiB0aGUgbW9kZWwsIHdoaWNoIGlzIG9uIHRoZVxyXG4gICAgLy8gZ3JvdW5kIGp1c3QgYmVsb3cgdGhlIGNlbnRlciBvZiB0aGUgYmFsYW5jZSwgaXMgcG9zaXRpb25lZCBpbiB0aGUgdmlldy5cclxuICAgIGNvbnN0IG1vZGVsVmlld1RyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgbmV3IFZlY3RvcjIoIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoICogMC40NSwgdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0ICogMC44NiApLFxyXG4gICAgICAxMTUgKTtcclxuICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtID0gbW9kZWxWaWV3VHJhbnNmb3JtOyAvLyBNYWtlIG1vZGVsVmlld1RyYW5zZm9ybSBhdmFpbGFibGUgdG8gZGVzY2VuZGFudCB0eXBlcy5cclxuXHJcbiAgICAvLyBDcmVhdGUgYSByb290IG5vZGUgYW5kIHNlbmQgdG8gYmFjayBzbyB0aGF0IHRoZSBsYXlvdXQgYm91bmRzIGJveCBjYW5cclxuICAgIC8vIGJlIG1hZGUgdmlzaWJsZSBpZiBuZWVkZWQuXHJcbiAgICB0aGlzLnJvb3ROb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucm9vdE5vZGUgKTtcclxuICAgIHRoaXMucm9vdE5vZGUubW92ZVRvQmFjaygpO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgYmFja2dyb3VuZCwgd2hpY2ggcG9ydHJheXMgdGhlIHNreSBhbmQgZ3JvdW5kLlxyXG4gICAgdGhpcy5vdXRzaWRlQmFja2dyb3VuZE5vZGUgPSBuZXcgT3V0c2lkZUJhY2tncm91bmROb2RlKFxyXG4gICAgICB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYLFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCAwICksXHJcbiAgICAgIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoICogMi41LFxyXG4gICAgICB0aGlzLmxheW91dEJvdW5kcy5oZWlnaHQgKiAxLjUsXHJcbiAgICAgIHRoaXMubGF5b3V0Qm91bmRzLmhlaWdodFxyXG4gICAgKTtcclxuICAgIHRoaXMucm9vdE5vZGUuYWRkQ2hpbGQoIHRoaXMub3V0c2lkZUJhY2tncm91bmROb2RlICk7XHJcblxyXG4gICAgLy8gQWRkIGxheWVycyB1c2VkIHRvIGNvbnRyb2wgZ2FtZSBhcHBlYXJhbmNlLlxyXG4gICAgdGhpcy5jb250cm9sTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5yb290Tm9kZS5hZGRDaGlsZCggdGhpcy5jb250cm9sTGF5ZXIgKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5yb290Tm9kZS5hZGRDaGlsZCggdGhpcy5jaGFsbGVuZ2VMYXllciApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgZnVsY3J1bSwgdGhlIGNvbHVtbnMsIGV0Yy5cclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIG5ldyBGdWxjcnVtTm9kZSggbW9kZWxWaWV3VHJhbnNmb3JtLCBnYW1lTW9kZWwuZnVsY3J1bSApICk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCBuZXcgVGlsdGVkU3VwcG9ydENvbHVtbk5vZGUoXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgZ2FtZU1vZGVsLnRpbHRlZFN1cHBvcnRDb2x1bW4sXHJcbiAgICAgIGdhbWVNb2RlbC5jb2x1bW5TdGF0ZVByb3BlcnR5XHJcbiAgICApICk7XHJcbiAgICBnYW1lTW9kZWwubGV2ZWxTdXBwb3J0Q29sdW1ucy5mb3JFYWNoKCBsZXZlbFN1cHBvcnRDb2x1bW4gPT4ge1xyXG4gICAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCBuZXcgTGV2ZWxTdXBwb3J0Q29sdW1uTm9kZShcclxuICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgICAgbGV2ZWxTdXBwb3J0Q29sdW1uLFxyXG4gICAgICAgIGdhbWVNb2RlbC5jb2x1bW5TdGF0ZVByb3BlcnR5LFxyXG4gICAgICAgIGZhbHNlXHJcbiAgICAgICkgKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIG5ldyBQbGFua05vZGUoIG1vZGVsVmlld1RyYW5zZm9ybSwgZ2FtZU1vZGVsLnBsYW5rICkgKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIG5ldyBBdHRhY2htZW50QmFyTm9kZSggbW9kZWxWaWV3VHJhbnNmb3JtLCBnYW1lTW9kZWwucGxhbmsgKSApO1xyXG5cclxuICAgIC8vIFdhdGNoIHRoZSBtb2RlbCBhbmQgYWRkL3JlbW92ZSB2aXN1YWwgcmVwcmVzZW50YXRpb25zIG9mIG1hc3Nlcy5cclxuICAgIGdhbWVNb2RlbC5tb3ZhYmxlTWFzc2VzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBhZGRlZE1hc3MgPT4ge1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgdGhlIHZpZXcgcmVwcmVzZW50YXRpb24gZm9yIHRoaXMgbWFzcy5cclxuICAgICAgY29uc3QgbWFzc05vZGUgPSBNYXNzTm9kZUZhY3RvcnkuY3JlYXRlTWFzc05vZGUoIGFkZGVkTWFzcywgbW9kZWxWaWV3VHJhbnNmb3JtLCB0cnVlLCBuZXcgUHJvcGVydHkoIHRydWUgKSwgZ2FtZU1vZGVsLmNvbHVtblN0YXRlUHJvcGVydHkgKTtcclxuICAgICAgdGhpcy5jaGFsbGVuZ2VMYXllci5hZGRDaGlsZCggbWFzc05vZGUgKTtcclxuXHJcbiAgICAgIC8vIE1vdmUgdGhlIG1hc3MgdG8gdGhlIGZyb250IHdoZW4gZ3JhYmJlZCBzbyB0aGF0IGxheWVyaW5nIHN0YXlzIHJlYXNvbmFibGUuXHJcbiAgICAgIGFkZGVkTWFzcy51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxpbmsoIHVzZXJDb250cm9sbGVkID0+IHtcclxuICAgICAgICBpZiAoIHVzZXJDb250cm9sbGVkICkge1xyXG4gICAgICAgICAgbWFzc05vZGUubW92ZVRvRnJvbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgcmVtb3ZhbCBsaXN0ZW5lciBmb3IgaWYgYW5kIHdoZW4gdGhpcyBtYXNzIGlzIHJlbW92ZWQgZnJvbSB0aGUgbW9kZWwuXHJcbiAgICAgIGdhbWVNb2RlbC5tb3ZhYmxlTWFzc2VzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIGZ1bmN0aW9uIHJlbW92ZU1vdmFibGVNYXNzKCkge1xyXG4gICAgICAgIHNlbGYuY2hhbGxlbmdlTGF5ZXIucmVtb3ZlQ2hpbGQoIG1hc3NOb2RlICk7XHJcbiAgICAgICAgZ2FtZU1vZGVsLm1vdmFibGVNYXNzZXMucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggcmVtb3ZlTW92YWJsZU1hc3MgKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gICAgZ2FtZU1vZGVsLmZpeGVkTWFzc2VzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBhZGRlZE1hc3MgPT4ge1xyXG4gICAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgdmlldyByZXByZXNlbnRhdGlvbiBmb3IgdGhpcyBtYXNzLlxyXG4gICAgICBjb25zdCBtYXNzTm9kZSA9IE1hc3NOb2RlRmFjdG9yeS5jcmVhdGVNYXNzTm9kZSggYWRkZWRNYXNzLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHRydWUsIG5ldyBQcm9wZXJ0eSggdHJ1ZSApLCBnYW1lTW9kZWwuY29sdW1uU3RhdGVQcm9wZXJ0eSApO1xyXG4gICAgICBtYXNzTm9kZS5waWNrYWJsZSA9IGZhbHNlOyAvLyBGaXhlZCBtYXNzZXMgY2FuJ3QgYmUgbW92ZWQgYnkgdXNlcnMuXHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIG1hc3NOb2RlICk7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIHJlbW92YWwgbGlzdGVuZXIgZm9yIGlmIGFuZCB3aGVuIHRoaXMgbWFzcyBpcyByZW1vdmVkIGZyb20gdGhlIG1vZGVsLlxyXG4gICAgICBnYW1lTW9kZWwuZml4ZWRNYXNzZXMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggZnVuY3Rpb24gcmVtb3ZlRml4ZWRNYXNzKCkge1xyXG4gICAgICAgIHNlbGYuY2hhbGxlbmdlTGF5ZXIucmVtb3ZlQ2hpbGQoIG1hc3NOb2RlICk7XHJcbiAgICAgICAgZ2FtZU1vZGVsLmZpeGVkTWFzc2VzLnJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXIoIHJlbW92ZUZpeGVkTWFzcyApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBub2RlIHRoYXQgYWxsb3dzIHRoZSB1c2VyIHRvIGNob29zZSBhIGdhbWUgbGV2ZWwgdG8gcGxheS5cclxuICAgIHRoaXMuc3RhcnRHYW1lTGV2ZWxOb2RlID0gbmV3IFN0YXJ0R2FtZUxldmVsTm9kZShcclxuICAgICAgbGV2ZWwgPT4geyBnYW1lTW9kZWwuc3RhcnRMZXZlbCggbGV2ZWwgKTsgfSxcclxuICAgICAgKCkgPT4geyBnYW1lTW9kZWwucmVzZXQoKTsgfSxcclxuICAgICAgZ2FtZU1vZGVsLnRpbWVyRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICBbXHJcbiAgICAgICAgbmV3IEdhbWVJY29uTm9kZSggZ2FtZUxldmVsMUljb25fcG5nLCAxICksXHJcbiAgICAgICAgbmV3IEdhbWVJY29uTm9kZSggZ2FtZUxldmVsMkljb25fcG5nLCAyICksXHJcbiAgICAgICAgbmV3IEdhbWVJY29uTm9kZSggZ2FtZUxldmVsM0ljb25fcG5nLCAzICksXHJcbiAgICAgICAgbmV3IEdhbWVJY29uTm9kZSggZ2FtZUxldmVsNEljb25fcG5nLCA0IClcclxuICAgICAgXSxcclxuICAgICAgZ2FtZU1vZGVsLm1vc3RSZWNlbnRTY29yZXMsXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAge1xyXG4gICAgICAgIG51bVN0YXJzT25CdXR0b25zOiBCYWxhbmNlR2FtZU1vZGVsLlBST0JMRU1TX1BFUl9MRVZFTCxcclxuICAgICAgICBwZXJmZWN0U2NvcmU6IEJhbGFuY2VHYW1lTW9kZWwuTUFYX1BPU1NJQkxFX1NDT1JFLFxyXG4gICAgICAgIG1heFRpdGxlV2lkdGg6IHRoaXMubGF5b3V0Qm91bmRzLndpZHRoXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICB0aGlzLnJvb3ROb2RlLmFkZENoaWxkKCB0aGlzLnN0YXJ0R2FtZUxldmVsTm9kZSApO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgYSByZWZlcmVuY2UgdG8gdGhlICdsZXZlbCBjb21wbGV0ZWQnIG5vZGUuXHJcbiAgICB0aGlzLmxldmVsQ29tcGxldGVkTm9kZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBhdWRpbyBwbGF5ZXIgZm9yIHRoZSBnYW1lIHNvdW5kcy5cclxuICAgIHRoaXMuZ2FtZUF1ZGlvUGxheWVyID0gbmV3IEdhbWVBdWRpb1BsYXllcigpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBnYW1lIHNjb3JlYm9hcmQuXHJcbiAgICB0aGlzLnNjb3JlYm9hcmQgPSBuZXcgRmluaXRlU3RhdHVzQmFyKFxyXG4gICAgICB0aGlzLmxheW91dEJvdW5kcyxcclxuICAgICAgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksXHJcbiAgICAgIGdhbWVNb2RlbC5zY29yZVByb3BlcnR5LFxyXG4gICAgICB7XHJcbiAgICAgICAgY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eTogZ2FtZU1vZGVsLmNoYWxsZW5nZUluZGV4UHJvcGVydHksXHJcbiAgICAgICAgbnVtYmVyT2ZDaGFsbGVuZ2VzUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggQmFsYW5jZUdhbWVNb2RlbC5QUk9CTEVNU19QRVJfTEVWRUwgKSxcclxuXHJcbiAgICAgICAgLy8gRmluaXRlU3RhdHVzQmFyIHVzZXMgMS1iYXNlZCBsZXZlbCBudW1iZXJpbmcsIG1vZGVsIGlzIDAtYmFzZWQsIHNlZSAjODUuXHJcbiAgICAgICAgbGV2ZWxQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBnYW1lTW9kZWwubGV2ZWxQcm9wZXJ0eSBdLCBsZXZlbCA9PiBsZXZlbCArIDEgKSxcclxuICAgICAgICBlbGFwc2VkVGltZVByb3BlcnR5OiBnYW1lTW9kZWwuZWxhcHNlZFRpbWVQcm9wZXJ0eSxcclxuICAgICAgICB0aW1lckVuYWJsZWRQcm9wZXJ0eTogZ2FtZU1vZGVsLnRpbWVyRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICAgIHN0YXJ0T3ZlckJ1dHRvblRleHQ6IHN0YXJ0T3ZlclN0cmluZyxcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE0ICksXHJcbiAgICAgICAgdGV4dEZpbGw6ICd3aGl0ZScsXHJcbiAgICAgICAgeE1hcmdpbjogMjAsXHJcbiAgICAgICAgeU1hcmdpbjogNSxcclxuICAgICAgICBiYXJGaWxsOiAncmdiKCAzNiwgODgsIDE1MSApJyxcclxuICAgICAgICBkeW5hbWljQWxpZ25tZW50OiBmYWxzZSxcclxuICAgICAgICBzdGFydE92ZXJCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgICB0ZXh0RmlsbDogJ2JsYWNrJyxcclxuICAgICAgICAgIGJhc2VDb2xvcjogJyNlNWYzZmYnLFxyXG4gICAgICAgICAgbWF4SGVpZ2h0OiAzMCxcclxuICAgICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7IGdhbWVNb2RlbC5uZXdHYW1lKCk7IH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnNjb3JlYm9hcmQgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHRpdGxlLiAgSXQgaXMgYmxhbmsgdG8gc3RhcnQgd2l0aCwgYW5kIGlzIHVwZGF0ZWQgbGF0ZXIgYXQgdGhlIGFwcHJvcHJpYXRlIHN0YXRlIGNoYW5nZS5cclxuICAgIHRoaXMuY2hhbGxlbmdlVGl0bGVOb2RlID0gbmV3IFRleHQoICcnLCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiA2MCwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGxpbmVXaWR0aDogMS41LFxyXG4gICAgICB0b3A6IHRoaXMuc2NvcmVib2FyZC5ib3R0b20gKyAyMCxcclxuICAgICAgbWF4V2lkdGg6IDUzMCAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIGJhc2VkIG9uIHRlc3RzIHdpdGggbG9uZyBzdHJpbmdzXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCB0aGlzLmNoYWxsZW5nZVRpdGxlTm9kZSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgZGlhbG9nIG5vZGUgdGhhdCBpcyB1c2VkIGluIHRoZSBtYXNzIGRlZHVjdGlvbiBjaGFsbGVuZ2VzXHJcbiAgICAvLyB0byBlbmFibGUgdGhlIHVzZXIgdG8gc3VibWl0IHNwZWNpZmljIG1hc3MgdmFsdWVzLlxyXG4gICAgdGhpcy5tYXNzVmFsdWVFbnRyeU5vZGUgPSBuZXcgTWFzc1ZhbHVlRW50cnlOb2RlKCB7XHJcbiAgICAgIGNlbnRlclg6IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIDAgKSxcclxuICAgICAgdG9wOiB0aGlzLmNoYWxsZW5nZVRpdGxlTm9kZS5ib3VuZHMubWF4WSArIDRcclxuICAgIH0gKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHRoaXMubWFzc1ZhbHVlRW50cnlOb2RlICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBub2RlIHRoYXQgYWxsb3dzIHRoZSB1c2VyIHRvIHN1Ym1pdCB0aGVpciBwcmVkaWN0aW9uIG9mIHdoaWNoXHJcbiAgICAvLyB3YXkgdGhlIHBsYW5rIHdpbGwgdGlsdC4gIFRoaXMgaXMgdXNlZCBpbiB0aGUgdGlsdCBwcmVkaWN0aW9uIGNoYWxsZW5nZXMuXHJcbiAgICB0aGlzLnRpbHRQcmVkaWN0aW9uU2VsZWN0b3JOb2RlID0gbmV3IFRpbHRQcmVkaWN0aW9uU2VsZWN0b3JOb2RlKCBnYW1lTW9kZWwuZ2FtZVN0YXRlUHJvcGVydHkgKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHRoaXMudGlsdFByZWRpY3Rpb25TZWxlY3Rvck5vZGUgKTtcclxuICAgIHRoaXMudGlsdFByZWRpY3Rpb25TZWxlY3Rvck5vZGUuY2VudGVyID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIDAgKSxcclxuICAgICAgdGhpcy5jaGFsbGVuZ2VUaXRsZU5vZGUuYm91bmRzLm1heFkgKyAxMDBcclxuICAgICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSAnZmVlZGJhY2sgbm9kZScgdGhhdCBpcyB1c2VkIHRvIHZpc3VhbGx5IGluZGljYXRlIGNvcnJlY3RcclxuICAgIC8vIGFuZCBpbmNvcnJlY3QgYW5zd2Vycy5cclxuICAgIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlID0gbmV3IEZhY2VXaXRoUG9pbnRzTm9kZShcclxuICAgICAge1xyXG4gICAgICAgIGZhY2VPcGFjaXR5OiAwLjYsXHJcbiAgICAgICAgZmFjZURpYW1ldGVyOiB0aGlzLmxheW91dEJvdW5kcy53aWR0aCAqIDAuMzEsXHJcbiAgICAgICAgcG9pbnRzRmlsbDogJ3llbGxvdycsXHJcbiAgICAgICAgcG9pbnRzU3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICAgIHBvaW50c0FsaWdubWVudDogJ3JpZ2h0Q2VudGVyJyxcclxuICAgICAgICBjZW50ZXJYOiB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIDAgKSxcclxuICAgICAgICBjZW50ZXJZOiB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIDIuMiApXHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlICk7XHJcblxyXG4gICAgLy8gQWRkIGFuZCBsYXkgb3V0IHRoZSBidXR0b25zLlxyXG4gICAgdGhpcy5idXR0b25zID0gW107XHJcbiAgICBjb25zdCBidXR0b25PcHRpb25zID0ge1xyXG4gICAgICBmb250OiBCVVRUT05fRk9OVCxcclxuICAgICAgYmFzZUNvbG9yOiBCVVRUT05fRklMTCxcclxuICAgICAgY29ybmVyUmFkaXVzOiA0LFxyXG4gICAgICBtYXhXaWR0aDogMzAwIC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgIH07XHJcbiAgICB0aGlzLmNoZWNrQW5zd2VyQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCBjaGVja1N0cmluZywgbWVyZ2UoIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBnYW1lTW9kZWwuY2hlY2tBbnN3ZXIoXHJcbiAgICAgICAgICB0aGlzLm1hc3NWYWx1ZUVudHJ5Tm9kZS5tYXNzVmFsdWVQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICAgIHRoaXMudGlsdFByZWRpY3Rpb25TZWxlY3Rvck5vZGUudGlsdFByZWRpY3Rpb25Qcm9wZXJ0eS52YWx1ZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH0sIGJ1dHRvbk9wdGlvbnMgKSApO1xyXG4gICAgdGhpcy5yb290Tm9kZS5hZGRDaGlsZCggdGhpcy5jaGVja0Fuc3dlckJ1dHRvbiApO1xyXG4gICAgdGhpcy5idXR0b25zLnB1c2goIHRoaXMuY2hlY2tBbnN3ZXJCdXR0b24gKTtcclxuXHJcbiAgICB0aGlzLm5leHRCdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oIG5leHRTdHJpbmcsIG1lcmdlKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7IGdhbWVNb2RlbC5uZXh0Q2hhbGxlbmdlKCk7IH1cclxuICAgIH0sIGJ1dHRvbk9wdGlvbnMgKSApO1xyXG4gICAgdGhpcy5yb290Tm9kZS5hZGRDaGlsZCggdGhpcy5uZXh0QnV0dG9uICk7XHJcbiAgICB0aGlzLmJ1dHRvbnMucHVzaCggdGhpcy5uZXh0QnV0dG9uICk7XHJcblxyXG4gICAgdGhpcy50cnlBZ2FpbkJ1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggdHJ5QWdhaW5TdHJpbmcsIG1lcmdlKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7IGdhbWVNb2RlbC50cnlBZ2FpbigpOyB9XHJcbiAgICB9LCBidXR0b25PcHRpb25zICkgKTtcclxuICAgIHRoaXMucm9vdE5vZGUuYWRkQ2hpbGQoIHRoaXMudHJ5QWdhaW5CdXR0b24gKTtcclxuICAgIHRoaXMuYnV0dG9ucy5wdXNoKCB0aGlzLnRyeUFnYWluQnV0dG9uICk7XHJcblxyXG4gICAgdGhpcy5kaXNwbGF5Q29ycmVjdEFuc3dlckJ1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggc2hvd0Fuc3dlclN0cmluZywgbWVyZ2UoIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHsgZ2FtZU1vZGVsLmRpc3BsYXlDb3JyZWN0QW5zd2VyKCk7IH1cclxuICAgIH0sIGJ1dHRvbk9wdGlvbnMgKSApO1xyXG4gICAgdGhpcy5yb290Tm9kZS5hZGRDaGlsZCggdGhpcy5kaXNwbGF5Q29ycmVjdEFuc3dlckJ1dHRvbiApO1xyXG4gICAgdGhpcy5idXR0b25zLnB1c2goIHRoaXMuZGlzcGxheUNvcnJlY3RBbnN3ZXJCdXR0b24gKTtcclxuXHJcbiAgICBjb25zdCBidXR0b25DZW50ZXIgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBuZXcgVmVjdG9yMiggMCwgLTAuMyApICk7XHJcbiAgICB0aGlzLmJ1dHRvbnMuZm9yRWFjaCggYnV0dG9uID0+IHtcclxuICAgICAgYnV0dG9uLmNlbnRlciA9IGJ1dHRvbkNlbnRlcjtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgbGlzdGVuZXJzIHRoYXQgY29udHJvbCB0aGUgZW5hYmxlZCBzdGF0ZSBvZiB0aGUgY2hlY2sgYW5zd2VyIGJ1dHRvbi5cclxuICAgIGdhbWVNb2RlbC5wbGFuay5tYXNzZXNPblN1cmZhY2UuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIHRoaXMudXBkYXRlQ2hlY2tBbnN3ZXJCdXR0b25FbmFibGVkLmJpbmQoIHRoaXMgKSApO1xyXG4gICAgZ2FtZU1vZGVsLnBsYW5rLm1hc3Nlc09uU3VyZmFjZS5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCB0aGlzLnVwZGF0ZUNoZWNrQW5zd2VyQnV0dG9uRW5hYmxlZC5iaW5kKCB0aGlzICkgKTtcclxuICAgIHRoaXMudGlsdFByZWRpY3Rpb25TZWxlY3Rvck5vZGUudGlsdFByZWRpY3Rpb25Qcm9wZXJ0eS5saW5rKCB0aGlzLnVwZGF0ZUNoZWNrQW5zd2VyQnV0dG9uRW5hYmxlZC5iaW5kKCB0aGlzICkgKTtcclxuICAgIHRoaXMubWFzc1ZhbHVlRW50cnlOb2RlLm1hc3NWYWx1ZVByb3BlcnR5LmxpbmsoIHRoaXMudXBkYXRlQ2hlY2tBbnN3ZXJCdXR0b25FbmFibGVkLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIC8vIFJlZ2lzdGVyIGZvciBjaGFuZ2VzIHRvIHRoZSBnYW1lIHN0YXRlIGFuZCB1cGRhdGUgYWNjb3JkaW5nbHkuXHJcbiAgICBnYW1lTW9kZWwuZ2FtZVN0YXRlUHJvcGVydHkubGluayggdGhpcy5oYW5kbGVHYW1lU3RhdGVDaGFuZ2UuYmluZCggdGhpcyApICk7XHJcblxyXG4gICAgLy8gU2hvdyB0aGUgbGV2ZWwgaW5kaWNhdG9yIHRvIGhlbHAgdGhlIHVzZXIgc2VlIGlmIHRoZSBwbGFuayBpcyBwZXJmZWN0bHlcclxuICAgIC8vIGJhbGFuY2VkLCBidXQgb25seSBzaG93IGl0IHdoZW4gdGhlIHN1cHBvcnQgY29sdW1uIGhhcyBiZWVuIHJlbW92ZWQuXHJcbiAgICBjb25zdCBsZXZlbEluZGljYXRvciA9IG5ldyBMZXZlbEluZGljYXRvck5vZGUoIG1vZGVsVmlld1RyYW5zZm9ybSwgZ2FtZU1vZGVsLnBsYW5rICk7XHJcbiAgICBnYW1lTW9kZWwuY29sdW1uU3RhdGVQcm9wZXJ0eS5saW5rKCBjb2x1bW5TdGF0ZSA9PiB7XHJcbiAgICAgIGxldmVsSW5kaWNhdG9yLnZpc2libGUgPSAoIGNvbHVtblN0YXRlID09PSBDb2x1bW5TdGF0ZS5OT19DT0xVTU5TICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLmFkZENoaWxkKCBsZXZlbEluZGljYXRvciApO1xyXG5cclxuICAgIC8vIEFkZCBhIHBhbmVsIGZvciBjb250cm9sbGluZyB3aGV0aGVyIHRoZSBydWxlciBvciBtYXJrZXIgc2V0IGFyZSB2aXNpYmxlLlxyXG4gICAgY29uc3QgcG9zaXRpb25NYXJrZXJTdGF0ZVByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5KCBQb3NpdGlvbkluZGljYXRvckNob2ljZSwgUG9zaXRpb25JbmRpY2F0b3JDaG9pY2UuTk9ORSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgcnVsZXIuXHJcbiAgICBjb25zdCBydWxlcnNWaXNpYmxlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICBwb3NpdGlvbk1hcmtlclN0YXRlUHJvcGVydHkubGluayggcG9zaXRpb25NYXJrZXJTdGF0ZSA9PiB7XHJcbiAgICAgIHJ1bGVyc1Zpc2libGVQcm9wZXJ0eS52YWx1ZSA9IHBvc2l0aW9uTWFya2VyU3RhdGUgPT09IFBvc2l0aW9uSW5kaWNhdG9yQ2hvaWNlLlJVTEVSUztcclxuICAgIH0gKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIG5ldyBSb3RhdGluZ1J1bGVyTm9kZSggZ2FtZU1vZGVsLnBsYW5rLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHJ1bGVyc1Zpc2libGVQcm9wZXJ0eSApICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBwb3NpdGlvbiBtYXJrZXJzLlxyXG4gICAgY29uc3QgcG9zaXRpb25NYXJrZXJzVmlzaWJsZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgcG9zaXRpb25NYXJrZXJTdGF0ZVByb3BlcnR5LmxpbmsoIHBvc2l0aW9uTWFya2VyU3RhdGUgPT4ge1xyXG4gICAgICBwb3NpdGlvbk1hcmtlcnNWaXNpYmxlUHJvcGVydHkudmFsdWUgPSBwb3NpdGlvbk1hcmtlclN0YXRlID09PSBQb3NpdGlvbkluZGljYXRvckNob2ljZS5NQVJLUztcclxuICAgIH0gKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIG5ldyBQb3NpdGlvbk1hcmtlclNldE5vZGUoIGdhbWVNb2RlbC5wbGFuaywgbW9kZWxWaWV3VHJhbnNmb3JtLCBwb3NpdGlvbk1hcmtlcnNWaXNpYmxlUHJvcGVydHkgKSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgY29udHJvbCBwYW5lbCB0aGF0IHdpbGwgYWxsb3cgdXNlcnMgdG8gc2VsZWN0IGJldHdlZW4gdGhlXHJcbiAgICAvLyB2YXJpb3VzIHBvc2l0aW9uIG1hcmtlcnMsIGkuZS4gcnVsZXIsIHBvc2l0aW9uIG1hcmtlcnMsIG9yIG5vdGhpbmcuXHJcbiAgICBjb25zdCBwb3NpdGlvbkNvbnRyb2xQYW5lbCA9IG5ldyBQb3NpdGlvbkluZGljYXRvckNvbnRyb2xQYW5lbCggcG9zaXRpb25NYXJrZXJTdGF0ZVByb3BlcnR5LCB7XHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIDEwLFxyXG4gICAgICB0b3A6IHRoaXMuc2NvcmVib2FyZC5ib3R0b20gKyAyMyxcclxuXHJcbiAgICAgIC8vIHNwZWNpZnkgYSBtYXggd2lkdGggdGhhdCB3aWxsIGZpdCB0aGUgcGFuZWwgYmV0d2VlbiB0aGUgcmlnaHRtb3N0IHZpZXcgb2JqZWN0IGFuZCB0aGUgbGF5b3V0IGJvdW5kc1xyXG4gICAgICBtYXhXaWR0aDogdGhpcy5sYXlvdXRCb3VuZHMud2lkdGggLSB0aGlzLnRpbHRQcmVkaWN0aW9uU2VsZWN0b3JOb2RlLmJvdW5kcy5tYXhYIC0gMTAsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Bvc2l0aW9uUGFuZWwnIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuY29udHJvbExheWVyLmFkZENoaWxkKCBwb3NpdGlvbkNvbnRyb2xQYW5lbCApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICB1cGRhdGVUaXRsZSgpIHtcclxuICAgIGNvbnN0IGJhbGFuY2VHYW1lQ2hhbGxlbmdlID0gdGhpcy5tb2RlbC5nZXRDdXJyZW50Q2hhbGxlbmdlKCk7XHJcbiAgICBpZiAoIGJhbGFuY2VHYW1lQ2hhbGxlbmdlICE9PSBudWxsICkge1xyXG4gICAgICB0aGlzLmNoYWxsZW5nZVRpdGxlTm9kZS5zdHJpbmcgPSB0aGlzLm1vZGVsLmdldEN1cnJlbnRDaGFsbGVuZ2UoKS52aWV3Q29uZmlnLnRpdGxlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIFNldCB0aGUgdmFsdWUgdG8gc29tZXRoaW5nIHNvIHRoYXQgbGF5b3V0IGNhbiBiZSBkb25lLiAgVGhpc1xyXG4gICAgICAvLyBzdHJpbmcgZG9lc24ndCBuZWVkIHRvIGJlIHRyYW5zbGF0ZWQgLSB1c2VycyBzaG91bGQgbmV2ZXIgc2VlIGl0LlxyXG4gICAgICB0aGlzLmNoYWxsZW5nZVRpdGxlTm9kZS5zZXRTdHJpbmcoICdObyBjaGFsbGVuZ2UgYXZhaWxhYmxlLicgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDZW50ZXIgdGhlIHRpdGxlIGFib3ZlIHRoZSBwaXZvdCBwb2ludC5cclxuICAgIHRoaXMuY2hhbGxlbmdlVGl0bGVOb2RlLmNlbnRlclggPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHRoaXMubW9kZWwucGxhbmsucGl2b3RQb2ludC54ICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIHVwZGF0ZUNoZWNrQW5zd2VyQnV0dG9uRW5hYmxlZCgpIHtcclxuICAgIGlmICggdGhpcy5tb2RlbC5nZXRDdXJyZW50Q2hhbGxlbmdlKCkgaW5zdGFuY2VvZiBCYWxhbmNlTWFzc2VzQ2hhbGxlbmdlICkge1xyXG4gICAgICAvLyBUaGUgYnV0dG9uIHNob3VsZCBiZSBlbmFibGVkIHdoZW5ldmVyIHRoZXJlIGFyZSBtYXNzZXMgb24gdGhlXHJcbiAgICAgIC8vIHJpZ2h0IHNpZGUgb2YgdGhlIHBsYW5rLlxyXG4gICAgICBsZXQgbWFzc2VzT25SaWdodFNpZGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5tb2RlbC5wbGFuay5tYXNzZXNPblN1cmZhY2UuZm9yRWFjaCggbWFzcyA9PiB7XHJcbiAgICAgICAgaWYgKCBtYXNzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCA+IHRoaXMubW9kZWwucGxhbmsuZ2V0UGxhbmtTdXJmYWNlQ2VudGVyKCkueCApIHtcclxuICAgICAgICAgIG1hc3Nlc09uUmlnaHRTaWRlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5jaGVja0Fuc3dlckJ1dHRvbi5lbmFibGVkID0gbWFzc2VzT25SaWdodFNpZGU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5tb2RlbC5nZXRDdXJyZW50Q2hhbGxlbmdlKCkgaW5zdGFuY2VvZiBUaWx0UHJlZGljdGlvbkNoYWxsZW5nZSApIHtcclxuICAgICAgLy8gVGhlIGJ1dHRvbiBzaG91bGQgYmUgZW5hYmxlZCBvbmNlIHRoZSB1c2VyIGhhcyBtYWRlIGEgcHJlZGljdGlvbi5cclxuICAgICAgdGhpcy5jaGVja0Fuc3dlckJ1dHRvbi5lbmFibGVkID0gdGhpcy50aWx0UHJlZGljdGlvblNlbGVjdG9yTm9kZS50aWx0UHJlZGljdGlvblByb3BlcnR5LnZhbHVlICE9PSAnbm9uZSc7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5tb2RlbC5nZXRDdXJyZW50Q2hhbGxlbmdlKCkgaW5zdGFuY2VvZiBNYXNzRGVkdWN0aW9uQ2hhbGxlbmdlICkge1xyXG4gICAgICAvLyBUaGUgYnV0dG9uIHNob3VsZCBiZSBlbmFibGVkIGZvciBhbnkgbm9uLXplcm8gdmFsdWUuXHJcbiAgICAgIHRoaXMuY2hlY2tBbnN3ZXJCdXR0b24uZW5hYmxlZCA9IHRoaXMubWFzc1ZhbHVlRW50cnlOb2RlLm1hc3NWYWx1ZVByb3BlcnR5LnZhbHVlICE9PSAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGUgV2hlbiB0aGUgZ2FtZSBzdGF0ZSBjaGFuZ2VzLCB1cGRhdGUgdGhlIHZpZXcgd2l0aCB0aGUgYXBwcm9wcmlhdGUgYnV0dG9ucyBhbmQgcmVhZG91dHMuXHJcbiAgaGFuZGxlR2FtZVN0YXRlQ2hhbmdlKCBnYW1lU3RhdGUgKSB7XHJcblxyXG4gICAgLy8gSGlkZSBhbGwgbm9kZXMgLSB0aGUgYXBwcm9wcmlhdGUgb25lcyB3aWxsIGJlIHNob3duIGxhdGVyIGJhc2VkIG9uXHJcbiAgICAvLyB0aGUgY3VycmVudCBzdGF0ZS5cclxuICAgIHRoaXMuaGlkZUFsbEdhbWVOb2RlcygpO1xyXG5cclxuICAgIGxldCBzY29yZTtcclxuXHJcbiAgICAvLyBTaG93IHRoZSBub2RlcyBhcHByb3ByaWF0ZSB0byB0aGUgc3RhdGVcclxuICAgIHN3aXRjaCggZ2FtZVN0YXRlICkge1xyXG4gICAgICBjYXNlICdjaG9vc2luZ0xldmVsJzpcclxuICAgICAgICB0aGlzLnNob3coIFsgdGhpcy5zdGFydEdhbWVMZXZlbE5vZGUgXSApO1xyXG4gICAgICAgIHRoaXMuaGlkZUNoYWxsZW5nZSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSAncHJlc2VudGluZ0ludGVyYWN0aXZlQ2hhbGxlbmdlJzpcclxuICAgICAgICB0aGlzLnVwZGF0ZVRpdGxlKCk7XHJcbiAgICAgICAgdGhpcy5jaGFsbGVuZ2VMYXllci5waWNrYWJsZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zaG93KCBbIHRoaXMuY2hhbGxlbmdlVGl0bGVOb2RlLCB0aGlzLnNjb3JlYm9hcmQsIHRoaXMuY2hlY2tBbnN3ZXJCdXR0b24gXSApO1xyXG4gICAgICAgIGlmICggdGhpcy5tb2RlbC5nZXRDdXJyZW50Q2hhbGxlbmdlKCkudmlld0NvbmZpZy5zaG93TWFzc0VudHJ5RGlhbG9nICkge1xyXG4gICAgICAgICAgaWYgKCB0aGlzLm1vZGVsLmluY29ycmVjdEd1ZXNzZXNPbkN1cnJlbnRDaGFsbGVuZ2UgPT09IDAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFzc1ZhbHVlRW50cnlOb2RlLmNsZWFyKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLm1hc3NWYWx1ZUVudHJ5Tm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpZiAoIHRoaXMubW9kZWwuZ2V0Q3VycmVudENoYWxsZW5nZSgpLnZpZXdDb25maWcuc2hvd1RpbHRQcmVkaWN0aW9uU2VsZWN0b3IgKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGlsdFByZWRpY3Rpb25TZWxlY3Rvck5vZGUudGlsdFByZWRpY3Rpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICAgICAgICB0aGlzLnRpbHRQcmVkaWN0aW9uU2VsZWN0b3JOb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zaG93Q2hhbGxlbmdlR3JhcGhpY3MoKTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlICdzaG93aW5nQ29ycmVjdEFuc3dlckZlZWRiYWNrJzpcclxuXHJcbiAgICAgICAgLy8gU2hvdyB0aGUgYXBwcm9wcmlhdGUgbm9kZXMgZm9yIHRoaXMgc3RhdGUuXHJcbiAgICAgICAgdGhpcy5zaG93KCBbIHRoaXMuc2NvcmVib2FyZCwgdGhpcy5uZXh0QnV0dG9uIF0gKTtcclxuXHJcbiAgICAgICAgLy8gR2l2ZSB0aGUgdXNlciB0aGUgYXBwcm9wcmlhdGUgYXVkaW8gYW5kIHZpc3VhbCBmZWVkYmFja1xyXG4gICAgICAgIHRoaXMuZ2FtZUF1ZGlvUGxheWVyLmNvcnJlY3RBbnN3ZXIoKTtcclxuICAgICAgICB0aGlzLmZhY2VXaXRoUG9pbnRzTm9kZS5zbWlsZSgpO1xyXG4gICAgICAgIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlLnNldFBvaW50cyggdGhpcy5tb2RlbC5nZXRDaGFsbGVuZ2VDdXJyZW50UG9pbnRWYWx1ZSgpICk7XHJcbiAgICAgICAgdGhpcy5mYWNlV2l0aFBvaW50c05vZGUudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIERpc2FibGUgaW50ZXJhY3Rpb24gd2l0aCB0aGUgY2hhbGxlbmdlIGVsZW1lbnRzLlxyXG4gICAgICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIucGlja2FibGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlICdzaG93aW5nSW5jb3JyZWN0QW5zd2VyRmVlZGJhY2tUcnlBZ2Fpbic6XHJcblxyXG4gICAgICAgIC8vIFNob3cgdGhlIGFwcHJvcHJpYXRlIG5vZGVzIGZvciB0aGlzIHN0YXRlLlxyXG4gICAgICAgIHRoaXMuc2hvdyggWyB0aGlzLnNjb3JlYm9hcmQsIHRoaXMudHJ5QWdhaW5CdXR0b24gXSApO1xyXG5cclxuICAgICAgICAvLyBHaXZlIHRoZSB1c2VyIHRoZSBhcHByb3ByaWF0ZSBmZWVkYmFja1xyXG4gICAgICAgIHRoaXMuZ2FtZUF1ZGlvUGxheWVyLndyb25nQW5zd2VyKCk7XHJcbiAgICAgICAgdGhpcy5mYWNlV2l0aFBvaW50c05vZGUuZnJvd24oKTtcclxuICAgICAgICB0aGlzLmZhY2VXaXRoUG9pbnRzTm9kZS5zZXRQb2ludHMoIHRoaXMubW9kZWwuc2NvcmVQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICAgIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlLnZpc2libGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBEaXNhYmxlIGludGVyYWN0aW9uIHdpdGggdGhlIGNoYWxsZW5nZSBlbGVtZW50cy5cclxuICAgICAgICB0aGlzLmNoYWxsZW5nZUxheWVyLnBpY2thYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSAnc2hvd2luZ0luY29ycmVjdEFuc3dlckZlZWRiYWNrTW92ZU9uJzpcclxuXHJcbiAgICAgICAgLy8gU2hvdyB0aGUgYXBwcm9wcmlhdGUgbm9kZXMgZm9yIHRoaXMgc3RhdGUuXHJcbiAgICAgICAgdGhpcy5zaG93KCBbIHRoaXMuc2NvcmVib2FyZCwgdGhpcy5kaXNwbGF5Q29ycmVjdEFuc3dlckJ1dHRvbiBdICk7XHJcblxyXG4gICAgICAgIC8vIEdpdmUgdGhlIHVzZXIgdGhlIGFwcHJvcHJpYXRlIGZlZWRiYWNrXHJcbiAgICAgICAgdGhpcy5nYW1lQXVkaW9QbGF5ZXIud3JvbmdBbnN3ZXIoKTtcclxuICAgICAgICB0aGlzLmZhY2VXaXRoUG9pbnRzTm9kZS5mcm93bigpO1xyXG4gICAgICAgIHRoaXMuZmFjZVdpdGhQb2ludHNOb2RlLnNldFBvaW50cyggdGhpcy5tb2RlbC5zY29yZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgICAgdGhpcy5mYWNlV2l0aFBvaW50c05vZGUudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIERpc2FibGUgaW50ZXJhY3Rpb24gd2l0aCB0aGUgY2hhbGxlbmdlIGVsZW1lbnRzLlxyXG4gICAgICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIucGlja2FibGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlICdkaXNwbGF5aW5nQ29ycmVjdEFuc3dlcic6XHJcblxyXG4gICAgICAgIC8vIFNob3cgdGhlIGFwcHJvcHJpYXRlIG5vZGVzIGZvciB0aGlzIHN0YXRlLlxyXG4gICAgICAgIHRoaXMuc2hvdyggWyB0aGlzLnNjb3JlYm9hcmQsIHRoaXMubmV4dEJ1dHRvbiBdICk7XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgdGhlIGNvcnJlY3QgYW5zd2VyXHJcbiAgICAgICAgaWYgKCB0aGlzLm1vZGVsLmdldEN1cnJlbnRDaGFsbGVuZ2UoKS52aWV3Q29uZmlnLnNob3dNYXNzRW50cnlEaWFsb2cgKSB7XHJcbiAgICAgICAgICB0aGlzLm1hc3NWYWx1ZUVudHJ5Tm9kZS5zaG93QW5zd2VyKCB0aGlzLm1vZGVsLmdldFRvdGFsRml4ZWRNYXNzVmFsdWUoKSApO1xyXG4gICAgICAgICAgdGhpcy5tYXNzVmFsdWVFbnRyeU5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLm1vZGVsLmdldEN1cnJlbnRDaGFsbGVuZ2UoKS52aWV3Q29uZmlnLnNob3dUaWx0UHJlZGljdGlvblNlbGVjdG9yICkge1xyXG4gICAgICAgICAgdGhpcy50aWx0UHJlZGljdGlvblNlbGVjdG9yTm9kZS50aWx0UHJlZGljdGlvblByb3BlcnR5LnZhbHVlID0gdGhpcy5tb2RlbC5nZXRUaXBEaXJlY3Rpb24oKTtcclxuICAgICAgICAgIHRoaXMudGlsdFByZWRpY3Rpb25TZWxlY3Rvck5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2hvd0NoYWxsZW5nZUdyYXBoaWNzKCk7XHJcblxyXG4gICAgICAgIC8vIERpc2FibGUgaW50ZXJhY3Rpb24gd2l0aCB0aGUgY2hhbGxlbmdlIGVsZW1lbnRzLlxyXG4gICAgICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIucGlja2FibGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlICdzaG93aW5nTGV2ZWxSZXN1bHRzJzpcclxuICAgICAgICBzY29yZSA9IHRoaXMubW9kZWwuc2NvcmVQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICBpZiAoIHNjb3JlID09PSBCYWxhbmNlR2FtZU1vZGVsLk1BWF9QT1NTSUJMRV9TQ09SRSApIHtcclxuICAgICAgICAgIHRoaXMuZ2FtZUF1ZGlvUGxheWVyLmdhbWVPdmVyUGVyZmVjdFNjb3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBzY29yZSA9PT0gMCApIHtcclxuICAgICAgICAgIHRoaXMuZ2FtZUF1ZGlvUGxheWVyLmdhbWVPdmVyWmVyb1Njb3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5nYW1lQXVkaW9QbGF5ZXIuZ2FtZU92ZXJJbXBlcmZlY3RTY29yZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zaG93TGV2ZWxSZXN1bHRzTm9kZSgpO1xyXG4gICAgICAgIHRoaXMuaGlkZUNoYWxsZW5nZSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdVbmhhbmRsZWQgZ2FtZSBzdGF0ZScgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlIFV0aWxpdHkgbWV0aG9kIGZvciBoaWRpbmcgYWxsIG9mIHRoZSBnYW1lIG5vZGVzIHdob3NlIHZpc2liaWxpdHkgY2hhbmdlcyBkdXJpbmcgdGhlIGNvdXJzZSBvZiBhIGNoYWxsZW5nZS5cclxuICBoaWRlQWxsR2FtZU5vZGVzKCkge1xyXG4gICAgdGhpcy5idXR0b25zLmZvckVhY2goIGJ1dHRvbiA9PiB7IGJ1dHRvbi52aXNpYmxlID0gZmFsc2U7IH0gKTtcclxuICAgIHRoaXMuc2V0Tm9kZVZpc2liaWxpdHkoIGZhbHNlLCBbIHRoaXMuc3RhcnRHYW1lTGV2ZWxOb2RlLCB0aGlzLmNoYWxsZW5nZVRpdGxlTm9kZSwgdGhpcy5mYWNlV2l0aFBvaW50c05vZGUsIHRoaXMuc2NvcmVib2FyZCxcclxuICAgICAgdGhpcy50aWx0UHJlZGljdGlvblNlbGVjdG9yTm9kZSwgdGhpcy5tYXNzVmFsdWVFbnRyeU5vZGUgXSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICBzaG93KCBub2Rlc1RvU2hvdyApIHtcclxuICAgIG5vZGVzVG9TaG93LmZvckVhY2goIG5vZGVUb1Nob3cgPT4geyBub2RlVG9TaG93LnZpc2libGUgPSB0cnVlOyB9ICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIHNldE5vZGVWaXNpYmlsaXR5KCBpc1Zpc2libGUsIG5vZGVzICkge1xyXG4gICAgbm9kZXMuZm9yRWFjaCggbm9kZSA9PiB7IG5vZGUudmlzaWJsZSA9IGlzVmlzaWJsZTsgfSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICBoaWRlQ2hhbGxlbmdlKCkge1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllci52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLmNvbnRyb2xMYXllci52aXNpYmxlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZSBTaG93IHRoZSBncmFwaGljIG1vZGVsIGVsZW1lbnRzIGZvciB0aGlzIGNoYWxsZW5nZSwgaS5lLiB0aGUgcGxhbmssIGZ1bGNydW0sIGV0Yy5cclxuICBzaG93Q2hhbGxlbmdlR3JhcGhpY3MoKSB7XHJcbiAgICB0aGlzLmNoYWxsZW5nZUxheWVyLnZpc2libGUgPSB0cnVlO1xyXG4gICAgdGhpcy5jb250cm9sTGF5ZXIudmlzaWJsZSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIHNob3dMZXZlbFJlc3VsdHNOb2RlKCkge1xyXG4gICAgLy8gU2V0IGEgbmV3IFwibGV2ZWwgY29tcGxldGVkXCIgbm9kZSBiYXNlZCBvbiB0aGUgcmVzdWx0cy5cclxuICAgIHRoaXMubGV2ZWxDb21wbGV0ZWROb2RlID0gbmV3IExldmVsQ29tcGxldGVkTm9kZShcclxuICAgICAgdGhpcy5tb2RlbC5sZXZlbFByb3BlcnR5LmdldCgpICsgMSxcclxuICAgICAgdGhpcy5tb2RlbC5zY29yZVByb3BlcnR5LmdldCgpLFxyXG4gICAgICBCYWxhbmNlR2FtZU1vZGVsLk1BWF9QT1NTSUJMRV9TQ09SRSxcclxuICAgICAgQmFsYW5jZUdhbWVNb2RlbC5QUk9CTEVNU19QRVJfTEVWRUwsXHJcbiAgICAgIHRoaXMubW9kZWwudGltZXJFbmFibGVkUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgIHRoaXMubW9kZWwuZWxhcHNlZFRpbWVQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgdGhpcy5tb2RlbC5iZXN0VGltZXNbIHRoaXMubW9kZWwubGV2ZWxQcm9wZXJ0eS5nZXQoKSBdLFxyXG4gICAgICB0aGlzLm1vZGVsLm5ld0Jlc3RUaW1lLFxyXG4gICAgICAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5nYW1lU3RhdGVQcm9wZXJ0eS5zZXQoICdjaG9vc2luZ0xldmVsJyApO1xyXG4gICAgICAgIHRoaXMucm9vdE5vZGUucmVtb3ZlQ2hpbGQoIHRoaXMubGV2ZWxDb21wbGV0ZWROb2RlICk7XHJcbiAgICAgICAgdGhpcy5sZXZlbENvbXBsZXRlZE5vZGUgPSBudWxsO1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgY2VudGVyOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgbm9kZS5cclxuICAgIHRoaXMucm9vdE5vZGUuYWRkQ2hpbGQoIHRoaXMubGV2ZWxDb21wbGV0ZWROb2RlICk7XHJcbiAgfVxyXG59XHJcblxyXG5iYWxhbmNpbmdBY3QucmVnaXN0ZXIoICdCYWxhbmNlR2FtZVZpZXcnLCBCYWxhbmNlR2FtZVZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgQmFsYW5jZUdhbWVWaWV3O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyw2QkFBNkIsTUFBTSxzREFBc0Q7QUFDaEcsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFVBQVUsTUFBTSxv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