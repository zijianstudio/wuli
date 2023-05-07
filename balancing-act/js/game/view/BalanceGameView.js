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
const BUTTON_FONT = new PhetFont( 24 );
const BUTTON_FILL = new Color( 0, 255, 153 );

class BalanceGameView extends ScreenView {

  /**
   * @param {BalanceGameModel} gameModel
   * @param {Tandem} tandem
   */
  constructor( gameModel, tandem ) {
    super( { layoutBounds: BASharedConstants.LAYOUT_BOUNDS } );
    const self = this;
    this.model = gameModel;

    // Create the model-view transform.  The primary units used in the model are meters, so significant zoom is used.
    // The multipliers for the 2nd parameter can be used to adjust where the point (0, 0) in the model, which is on the
    // ground just below the center of the balance, is positioned in the view.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( this.layoutBounds.width * 0.45, this.layoutBounds.height * 0.86 ),
      115 );
    this.modelViewTransform = modelViewTransform; // Make modelViewTransform available to descendant types.

    // Create a root node and send to back so that the layout bounds box can
    // be made visible if needed.
    this.rootNode = new Node();
    this.addChild( this.rootNode );
    this.rootNode.moveToBack();

    // Add the background, which portrays the sky and ground.
    this.outsideBackgroundNode = new OutsideBackgroundNode(
      this.layoutBounds.centerX,
      modelViewTransform.modelToViewY( 0 ),
      this.layoutBounds.width * 2.5,
      this.layoutBounds.height * 1.5,
      this.layoutBounds.height
    );
    this.rootNode.addChild( this.outsideBackgroundNode );

    // Add layers used to control game appearance.
    this.controlLayer = new Node();
    this.rootNode.addChild( this.controlLayer );
    this.challengeLayer = new Node();
    this.rootNode.addChild( this.challengeLayer );

    // Add the fulcrum, the columns, etc.
    this.challengeLayer.addChild( new FulcrumNode( modelViewTransform, gameModel.fulcrum ) );
    this.challengeLayer.addChild( new TiltedSupportColumnNode(
      modelViewTransform,
      gameModel.tiltedSupportColumn,
      gameModel.columnStateProperty
    ) );
    gameModel.levelSupportColumns.forEach( levelSupportColumn => {
      this.challengeLayer.addChild( new LevelSupportColumnNode(
        modelViewTransform,
        levelSupportColumn,
        gameModel.columnStateProperty,
        false
      ) );
    } );
    this.challengeLayer.addChild( new PlankNode( modelViewTransform, gameModel.plank ) );
    this.challengeLayer.addChild( new AttachmentBarNode( modelViewTransform, gameModel.plank ) );

    // Watch the model and add/remove visual representations of masses.
    gameModel.movableMasses.addItemAddedListener( addedMass => {

      // Create and add the view representation for this mass.
      const massNode = MassNodeFactory.createMassNode( addedMass, modelViewTransform, true, new Property( true ), gameModel.columnStateProperty );
      this.challengeLayer.addChild( massNode );

      // Move the mass to the front when grabbed so that layering stays reasonable.
      addedMass.userControlledProperty.link( userControlled => {
        if ( userControlled ) {
          massNode.moveToFront();
        }
      } );

      // Add the removal listener for if and when this mass is removed from the model.
      gameModel.movableMasses.addItemRemovedListener( function removeMovableMass() {
        self.challengeLayer.removeChild( massNode );
        gameModel.movableMasses.removeItemRemovedListener( removeMovableMass );
      } );
    } );
    gameModel.fixedMasses.addItemAddedListener( addedMass => {
      // Create and add the view representation for this mass.
      const massNode = MassNodeFactory.createMassNode( addedMass, modelViewTransform, true, new Property( true ), gameModel.columnStateProperty );
      massNode.pickable = false; // Fixed masses can't be moved by users.
      this.challengeLayer.addChild( massNode );

      // Add the removal listener for if and when this mass is removed from the model.
      gameModel.fixedMasses.addItemRemovedListener( function removeFixedMass() {
        self.challengeLayer.removeChild( massNode );
        gameModel.fixedMasses.removeItemRemovedListener( removeFixedMass );
      } );
    } );

    // Add the node that allows the user to choose a game level to play.
    this.startGameLevelNode = new StartGameLevelNode(
      level => { gameModel.startLevel( level ); },
      () => { gameModel.reset(); },
      gameModel.timerEnabledProperty,
      [
        new GameIconNode( gameLevel1Icon_png, 1 ),
        new GameIconNode( gameLevel2Icon_png, 2 ),
        new GameIconNode( gameLevel3Icon_png, 3 ),
        new GameIconNode( gameLevel4Icon_png, 4 )
      ],
      gameModel.mostRecentScores,
      modelViewTransform,
      {
        numStarsOnButtons: BalanceGameModel.PROBLEMS_PER_LEVEL,
        perfectScore: BalanceGameModel.MAX_POSSIBLE_SCORE,
        maxTitleWidth: this.layoutBounds.width
      }
    );
    this.rootNode.addChild( this.startGameLevelNode );

    // Initialize a reference to the 'level completed' node.
    this.levelCompletedNode = null;

    // Create the audio player for the game sounds.
    this.gameAudioPlayer = new GameAudioPlayer();

    // Create and add the game scoreboard.
    this.scoreboard = new FiniteStatusBar(
      this.layoutBounds,
      this.visibleBoundsProperty,
      gameModel.scoreProperty,
      {
        challengeIndexProperty: gameModel.challengeIndexProperty,
        numberOfChallengesProperty: new Property( BalanceGameModel.PROBLEMS_PER_LEVEL ),

        // FiniteStatusBar uses 1-based level numbering, model is 0-based, see #85.
        levelProperty: new DerivedProperty( [ gameModel.levelProperty ], level => level + 1 ),
        elapsedTimeProperty: gameModel.elapsedTimeProperty,
        timerEnabledProperty: gameModel.timerEnabledProperty,
        startOverButtonText: startOverString,
        font: new PhetFont( 14 ),
        textFill: 'white',
        xMargin: 20,
        yMargin: 5,
        barFill: 'rgb( 36, 88, 151 )',
        dynamicAlignment: false,
        startOverButtonOptions: {
          textFill: 'black',
          baseColor: '#e5f3ff',
          maxHeight: 30,
          listener: () => { gameModel.newGame(); }
        }
      }
    );
    this.addChild( this.scoreboard );

    // Add the title.  It is blank to start with, and is updated later at the appropriate state change.
    this.challengeTitleNode = new Text( '', {
      font: new PhetFont( { size: 60, weight: 'bold' } ),
      fill: 'white',
      stroke: 'black',
      lineWidth: 1.5,
      top: this.scoreboard.bottom + 20,
      maxWidth: 530 // empirically determined based on tests with long strings
    } );
    this.challengeLayer.addChild( this.challengeTitleNode );

    // Add the dialog node that is used in the mass deduction challenges
    // to enable the user to submit specific mass values.
    this.massValueEntryNode = new MassValueEntryNode( {
      centerX: modelViewTransform.modelToViewX( 0 ),
      top: this.challengeTitleNode.bounds.maxY + 4
    } );
    this.challengeLayer.addChild( this.massValueEntryNode );

    // Add the node that allows the user to submit their prediction of which
    // way the plank will tilt.  This is used in the tilt prediction challenges.
    this.tiltPredictionSelectorNode = new TiltPredictionSelectorNode( gameModel.gameStateProperty );
    this.challengeLayer.addChild( this.tiltPredictionSelectorNode );
    this.tiltPredictionSelectorNode.center = new Vector2(
      modelViewTransform.modelToViewX( 0 ),
      this.challengeTitleNode.bounds.maxY + 100
    );

    // Create the 'feedback node' that is used to visually indicate correct
    // and incorrect answers.
    this.faceWithPointsNode = new FaceWithPointsNode(
      {
        faceOpacity: 0.6,
        faceDiameter: this.layoutBounds.width * 0.31,
        pointsFill: 'yellow',
        pointsStroke: 'black',
        pointsAlignment: 'rightCenter',
        centerX: this.modelViewTransform.modelToViewX( 0 ),
        centerY: this.modelViewTransform.modelToViewY( 2.2 )
      } );
    this.addChild( this.faceWithPointsNode );

    // Add and lay out the buttons.
    this.buttons = [];
    const buttonOptions = {
      font: BUTTON_FONT,
      baseColor: BUTTON_FILL,
      cornerRadius: 4,
      maxWidth: 300 // empirically determined
    };
    this.checkAnswerButton = new TextPushButton( checkString, merge( {
      listener: () => {
        gameModel.checkAnswer(
          this.massValueEntryNode.massValueProperty.value,
          this.tiltPredictionSelectorNode.tiltPredictionProperty.value
        );
      }
    }, buttonOptions ) );
    this.rootNode.addChild( this.checkAnswerButton );
    this.buttons.push( this.checkAnswerButton );

    this.nextButton = new TextPushButton( nextString, merge( {
      listener: () => { gameModel.nextChallenge(); }
    }, buttonOptions ) );
    this.rootNode.addChild( this.nextButton );
    this.buttons.push( this.nextButton );

    this.tryAgainButton = new TextPushButton( tryAgainString, merge( {
      listener: () => { gameModel.tryAgain(); }
    }, buttonOptions ) );
    this.rootNode.addChild( this.tryAgainButton );
    this.buttons.push( this.tryAgainButton );

    this.displayCorrectAnswerButton = new TextPushButton( showAnswerString, merge( {
      listener: () => { gameModel.displayCorrectAnswer(); }
    }, buttonOptions ) );
    this.rootNode.addChild( this.displayCorrectAnswerButton );
    this.buttons.push( this.displayCorrectAnswerButton );

    const buttonCenter = this.modelViewTransform.modelToViewPosition( new Vector2( 0, -0.3 ) );
    this.buttons.forEach( button => {
      button.center = buttonCenter;
    } );

    // Add listeners that control the enabled state of the check answer button.
    gameModel.plank.massesOnSurface.addItemAddedListener( this.updateCheckAnswerButtonEnabled.bind( this ) );
    gameModel.plank.massesOnSurface.addItemRemovedListener( this.updateCheckAnswerButtonEnabled.bind( this ) );
    this.tiltPredictionSelectorNode.tiltPredictionProperty.link( this.updateCheckAnswerButtonEnabled.bind( this ) );
    this.massValueEntryNode.massValueProperty.link( this.updateCheckAnswerButtonEnabled.bind( this ) );

    // Register for changes to the game state and update accordingly.
    gameModel.gameStateProperty.link( this.handleGameStateChange.bind( this ) );

    // Show the level indicator to help the user see if the plank is perfectly
    // balanced, but only show it when the support column has been removed.
    const levelIndicator = new LevelIndicatorNode( modelViewTransform, gameModel.plank );
    gameModel.columnStateProperty.link( columnState => {
      levelIndicator.visible = ( columnState === ColumnState.NO_COLUMNS );
    } );
    this.challengeLayer.addChild( levelIndicator );

    // Add a panel for controlling whether the ruler or marker set are visible.
    const positionMarkerStateProperty = new EnumerationDeprecatedProperty( PositionIndicatorChoice, PositionIndicatorChoice.NONE );

    // Add the ruler.
    const rulersVisibleProperty = new Property( false );
    positionMarkerStateProperty.link( positionMarkerState => {
      rulersVisibleProperty.value = positionMarkerState === PositionIndicatorChoice.RULERS;
    } );
    this.challengeLayer.addChild( new RotatingRulerNode( gameModel.plank, modelViewTransform, rulersVisibleProperty ) );

    // Add the position markers.
    const positionMarkersVisibleProperty = new Property( false );
    positionMarkerStateProperty.link( positionMarkerState => {
      positionMarkersVisibleProperty.value = positionMarkerState === PositionIndicatorChoice.MARKS;
    } );
    this.challengeLayer.addChild( new PositionMarkerSetNode( gameModel.plank, modelViewTransform, positionMarkersVisibleProperty ) );

    // Add the control panel that will allow users to select between the
    // various position markers, i.e. ruler, position markers, or nothing.
    const positionControlPanel = new PositionIndicatorControlPanel( positionMarkerStateProperty, {
      right: this.layoutBounds.right - 10,
      top: this.scoreboard.bottom + 23,

      // specify a max width that will fit the panel between the rightmost view object and the layout bounds
      maxWidth: this.layoutBounds.width - this.tiltPredictionSelectorNode.bounds.maxX - 10,
      tandem: tandem.createTandem( 'positionPanel' )
    } );
    this.controlLayer.addChild( positionControlPanel );
  }

  // @private
  updateTitle() {
    const balanceGameChallenge = this.model.getCurrentChallenge();
    if ( balanceGameChallenge !== null ) {
      this.challengeTitleNode.string = this.model.getCurrentChallenge().viewConfig.title;
    }
    else {
      // Set the value to something so that layout can be done.  This
      // string doesn't need to be translated - users should never see it.
      this.challengeTitleNode.setString( 'No challenge available.' );
    }

    // Center the title above the pivot point.
    this.challengeTitleNode.centerX = this.modelViewTransform.modelToViewX( this.model.plank.pivotPoint.x );
  }

  // @private
  updateCheckAnswerButtonEnabled() {
    if ( this.model.getCurrentChallenge() instanceof BalanceMassesChallenge ) {
      // The button should be enabled whenever there are masses on the
      // right side of the plank.
      let massesOnRightSide = false;
      this.model.plank.massesOnSurface.forEach( mass => {
        if ( mass.positionProperty.get().x > this.model.plank.getPlankSurfaceCenter().x ) {
          massesOnRightSide = true;
        }
      } );
      this.checkAnswerButton.enabled = massesOnRightSide;
    }
    else if ( this.model.getCurrentChallenge() instanceof TiltPredictionChallenge ) {
      // The button should be enabled once the user has made a prediction.
      this.checkAnswerButton.enabled = this.tiltPredictionSelectorNode.tiltPredictionProperty.value !== 'none';
    }
    else if ( this.model.getCurrentChallenge() instanceof MassDeductionChallenge ) {
      // The button should be enabled for any non-zero value.
      this.checkAnswerButton.enabled = this.massValueEntryNode.massValueProperty.value !== 0;
    }
  }

  // @private When the game state changes, update the view with the appropriate buttons and readouts.
  handleGameStateChange( gameState ) {

    // Hide all nodes - the appropriate ones will be shown later based on
    // the current state.
    this.hideAllGameNodes();

    let score;

    // Show the nodes appropriate to the state
    switch( gameState ) {
      case 'choosingLevel':
        this.show( [ this.startGameLevelNode ] );
        this.hideChallenge();
        break;

      case 'presentingInteractiveChallenge':
        this.updateTitle();
        this.challengeLayer.pickable = null;
        this.show( [ this.challengeTitleNode, this.scoreboard, this.checkAnswerButton ] );
        if ( this.model.getCurrentChallenge().viewConfig.showMassEntryDialog ) {
          if ( this.model.incorrectGuessesOnCurrentChallenge === 0 ) {
            this.massValueEntryNode.clear();
          }
          this.massValueEntryNode.visible = true;
        }
        else {
          if ( this.model.getCurrentChallenge().viewConfig.showTiltPredictionSelector ) {
            this.tiltPredictionSelectorNode.tiltPredictionProperty.reset();
            this.tiltPredictionSelectorNode.visible = true;
          }
        }

        this.showChallengeGraphics();

        break;

      case 'showingCorrectAnswerFeedback':

        // Show the appropriate nodes for this state.
        this.show( [ this.scoreboard, this.nextButton ] );

        // Give the user the appropriate audio and visual feedback
        this.gameAudioPlayer.correctAnswer();
        this.faceWithPointsNode.smile();
        this.faceWithPointsNode.setPoints( this.model.getChallengeCurrentPointValue() );
        this.faceWithPointsNode.visible = true;

        // Disable interaction with the challenge elements.
        this.challengeLayer.pickable = false;

        break;

      case 'showingIncorrectAnswerFeedbackTryAgain':

        // Show the appropriate nodes for this state.
        this.show( [ this.scoreboard, this.tryAgainButton ] );

        // Give the user the appropriate feedback
        this.gameAudioPlayer.wrongAnswer();
        this.faceWithPointsNode.frown();
        this.faceWithPointsNode.setPoints( this.model.scoreProperty.get() );
        this.faceWithPointsNode.visible = true;

        // Disable interaction with the challenge elements.
        this.challengeLayer.pickable = false;

        break;

      case 'showingIncorrectAnswerFeedbackMoveOn':

        // Show the appropriate nodes for this state.
        this.show( [ this.scoreboard, this.displayCorrectAnswerButton ] );

        // Give the user the appropriate feedback
        this.gameAudioPlayer.wrongAnswer();
        this.faceWithPointsNode.frown();
        this.faceWithPointsNode.setPoints( this.model.scoreProperty.get() );
        this.faceWithPointsNode.visible = true;

        // Disable interaction with the challenge elements.
        this.challengeLayer.pickable = false;

        break;

      case 'displayingCorrectAnswer':

        // Show the appropriate nodes for this state.
        this.show( [ this.scoreboard, this.nextButton ] );

        // Display the correct answer
        if ( this.model.getCurrentChallenge().viewConfig.showMassEntryDialog ) {
          this.massValueEntryNode.showAnswer( this.model.getTotalFixedMassValue() );
          this.massValueEntryNode.visible = true;
        }
        else if ( this.model.getCurrentChallenge().viewConfig.showTiltPredictionSelector ) {
          this.tiltPredictionSelectorNode.tiltPredictionProperty.value = this.model.getTipDirection();
          this.tiltPredictionSelectorNode.visible = true;
        }
        this.showChallengeGraphics();

        // Disable interaction with the challenge elements.
        this.challengeLayer.pickable = false;

        break;

      case 'showingLevelResults':
        score = this.model.scoreProperty.get();
        if ( score === BalanceGameModel.MAX_POSSIBLE_SCORE ) {
          this.gameAudioPlayer.gameOverPerfectScore();
        }
        else if ( score === 0 ) {
          this.gameAudioPlayer.gameOverZeroScore();
        }
        else {
          this.gameAudioPlayer.gameOverImperfectScore();
        }

        this.showLevelResultsNode();
        this.hideChallenge();
        break;

      default:
        throw new Error( 'Unhandled game state' );
    }
  }

  // @private Utility method for hiding all of the game nodes whose visibility changes during the course of a challenge.
  hideAllGameNodes() {
    this.buttons.forEach( button => { button.visible = false; } );
    this.setNodeVisibility( false, [ this.startGameLevelNode, this.challengeTitleNode, this.faceWithPointsNode, this.scoreboard,
      this.tiltPredictionSelectorNode, this.massValueEntryNode ] );
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

  // @private Show the graphic model elements for this challenge, i.e. the plank, fulcrum, etc.
  showChallengeGraphics() {
    this.challengeLayer.visible = true;
    this.controlLayer.visible = true;
  }

  // @private
  showLevelResultsNode() {
    // Set a new "level completed" node based on the results.
    this.levelCompletedNode = new LevelCompletedNode(
      this.model.levelProperty.get() + 1,
      this.model.scoreProperty.get(),
      BalanceGameModel.MAX_POSSIBLE_SCORE,
      BalanceGameModel.PROBLEMS_PER_LEVEL,
      this.model.timerEnabledProperty.get(),
      this.model.elapsedTimeProperty.get(),
      this.model.bestTimes[ this.model.levelProperty.get() ],
      this.model.newBestTime,
      () => {
        this.model.gameStateProperty.set( 'choosingLevel' );
        this.rootNode.removeChild( this.levelCompletedNode );
        this.levelCompletedNode = null;
      },
      {
        center: this.layoutBounds.center
      } );

    // Add the node.
    this.rootNode.addChild( this.levelCompletedNode );
  }
}

balancingAct.register( 'BalanceGameView', BalanceGameView );
export default BalanceGameView;
