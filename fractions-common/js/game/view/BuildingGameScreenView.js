// Copyright 2018-2022, University of Colorado Boulder

/**
 * ScreenView for game screens where the objective is to build specific fractions.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import platform from '../../../../phet-core/js/platform.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import BackButton from '../../../../scenery-phet/js/buttons/BackButton.js';
import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import MixedFractionNode from '../../../../scenery-phet/js/MixedFractionNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import StarNode from '../../../../scenery-phet/js/StarNode.js';
import { HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Easing from '../../../../twixt/js/Easing.js';
import TransitionNode from '../../../../twixt/js/TransitionNode.js';
import AllLevelsCompletedNode from '../../../../vegas/js/AllLevelsCompletedNode.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import LevelSelectionButton from '../../../../vegas/js/LevelSelectionButton.js';
import RewardNode from '../../../../vegas/js/RewardNode.js';
import ScoreDisplayStars from '../../../../vegas/js/ScoreDisplayStars.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import BuildingRepresentation from '../../building/model/BuildingRepresentation.js';
import BuildingType from '../../building/model/BuildingType.js';
import NumberPiece from '../../building/model/NumberPiece.js';
import NumberStack from '../../building/model/NumberStack.js';
import ShapeGroup from '../../building/model/ShapeGroup.js';
import ShapePiece from '../../building/model/ShapePiece.js';
import NumberPieceNode from '../../building/view/NumberPieceNode.js';
import NumberStackNode from '../../building/view/NumberStackNode.js';
import ShapeGroupNode from '../../building/view/ShapeGroupNode.js';
import ShapePieceNode from '../../building/view/ShapePieceNode.js';
import FractionsCommonGlobals from '../../common/FractionsCommonGlobals.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import RoundArrowButton from '../../common/view/RoundArrowButton.js';
import fractionsCommon from '../../fractionsCommon.js';
import FractionsCommonStrings from '../../FractionsCommonStrings.js';
import FilledPartition from '../model/FilledPartition.js';
import ShapePartition from '../model/ShapePartition.js';
import FilledPartitionNode from './FilledPartitionNode.js';
import FractionChallengeNode from './FractionChallengeNode.js';

const chooseYourLevelString = VegasStrings.chooseYourLevel;
const levelTitlePatternString = FractionsCommonStrings.levelTitlePattern;

// constants
const LEVEL_SELECTION_SPACING = 20;
const SIDE_MARGIN = 10;
const select = ( shapePartitions, quantity ) => {
  return _.find( shapePartitions, shapePartition => shapePartition.length === quantity );
};
const LEVEL_SHAPE_PARTITIONS = [
  select( ShapePartition.PIES, 1 ),
  select( ShapePartition.VERTICAL_BARS, 2 ),
  select( ShapePartition.POLYGONS, 3 ),
  select( ShapePartition.POLYGONS, 4 ),
  select( ShapePartition.POLYGONS, 5 ),
  ShapePartition.SIX_FLOWER,
  ShapePartition.HEX_RING,
  ShapePartition.NINJA_STAR,
  select( ShapePartition.GRIDS, 9 ),
  ShapePartition.FIVE_POINT
];
const ICON_DESIGN_BOUNDS = new Bounds2( 0, 0, 90, 129 );
const QUADRATIC_TRANSITION_OPTIONS = {
  duration: 0.4,
  targetOptions: {
    easing: Easing.QUADRATIC_IN_OUT
  }
};

class BuildingGameScreenView extends ScreenView {
  /**
   * @param {BuildingGameModel} model
   */
  constructor( model ) {
    super();

    // @private {BuildingGameModel}
    this.model = model;

    // @private {Array.<Node>}
    this.shapeIcons = this.model.shapeLevels.map( level => BuildingGameScreenView.createLevelIcon( level, model.hasMixedNumbers ) );
    this.numberIcons = this.model.numberLevels.map( level => BuildingGameScreenView.createLevelIcon( level, model.hasMixedNumbers ) );

    const leftLevelSelectionNode = this.createLevelSection( 0, 4 );
    const rightLevelSelectionNode = this.createLevelSection( 5, 9 );

    // @private {Property.<boolean>}
    this.leftLevelSelectionProperty = new BooleanProperty( true );

    // @private {Node} - The "left" half of the sliding layer, displayed first
    this.levelSelectionLayer = new Node();

    this.levelSelectionLayer.addChild( new Text( chooseYourLevelString, {
      centerX: this.layoutBounds.centerX,
      top: this.layoutBounds.top + 30,
      font: new PhetFont( 30 )
    } ) );

    const challengeBackground = new Node();
    const challengeForeground = new Node();

    // @private {boolean} - We'll delay steps to transitions by a frame when this is set to true, to handle
    // https://github.com/phetsims/fractions-common/issues/42.
    this.delayTransitions = false;

    // @orivate {TransitionNode}
    this.levelSelectionTransitionNode = new TransitionNode( this.visibleBoundsProperty, {
      content: leftLevelSelectionNode,
      cachedNodes: [ leftLevelSelectionNode, rightLevelSelectionNode ]
    } );
    // No unlink needed, since we own the given Property.
    this.leftLevelSelectionProperty.lazyLink( isLeft => {
      if ( isLeft ) {
        this.levelSelectionTransitionNode.slideRightTo( leftLevelSelectionNode, QUADRATIC_TRANSITION_OPTIONS );
      }
      else {
        this.levelSelectionTransitionNode.slideLeftTo( rightLevelSelectionNode, QUADRATIC_TRANSITION_OPTIONS );
      }
      this.delayTransitions = true;
    } );

    // Switch to the proper level selection page whenever we go to the corresponding level.
    // See feature for https://github.com/phetsims/fractions-common/issues/58.
    model.challengeProperty.lazyLink( challenge => {
      if ( challenge ) {
        const isLevelLeft = challenge.levelNumber <= 5;
        if ( this.leftLevelSelectionProperty.value !== isLevelLeft ) {
          this.leftLevelSelectionProperty.value = isLevelLeft;
          this.levelSelectionTransitionNode.step( Number.POSITIVE_INFINITY );
        }
      }
    } );

    // @private {TransitionNode}
    this.mainTransitionNode = new TransitionNode( this.visibleBoundsProperty, {
      content: this.levelSelectionLayer,
      cachedNodes: [ this.levelSelectionLayer ]
    } );

    const leftButtonOptions = {
      touchAreaXDilation: SIDE_MARGIN,
      touchAreaYDilation: SIDE_MARGIN / 2
    };
    const challengeControlBox = new VBox( {
      spacing: SIDE_MARGIN,
      top: this.layoutBounds.top + SIDE_MARGIN,
      left: this.layoutBounds.left + SIDE_MARGIN,
      children: [
        new BackButton( merge( {
          listener() {
            model.levelProperty.value = null;
          }
        }, leftButtonOptions ) ),
        new RefreshButton( merge( {
          iconHeight: 27,
          xMargin: 9,
          yMargin: 7,
          listener() {
            model.levelProperty.value && model.levelProperty.value.reset();
          }
        }, leftButtonOptions ) ),
        ...( phet.chipper.queryParameters.showAnswers ? [
          new RectangularPushButton( merge( {
            content: new FaceNode( 27 ),
            listener: function() {
              model.challengeProperty.value.cheat();
            }
          }, leftButtonOptions ) )
        ] : [] )
      ]
    } );

    let lastChallengeNode = null;
    model.challengeProperty.lazyLink( ( challenge, oldChallenge ) => {
      const oldChallengeNode = lastChallengeNode;

      if ( oldChallengeNode ) {
        oldChallengeNode.interruptSubtreeInput();
      }

      lastChallengeNode = null;
      let transition;
      if ( challenge ) {
        // See https://github.com/phetsims/fractions-common/issues/43
        challenge.selectPreviouslySelectedGroup();

        const allLevelsCompleteProperty = model.levelCommpletePropertyMap.get( challenge.hasShapes ? BuildingType.SHAPE : BuildingType.NUMBER );

        const challengeNode = new FractionChallengeNode( challenge, this.layoutBounds, model.nextLevel.bind( model ), model.incorrectAttemptEmitter, allLevelsCompleteProperty );
        lastChallengeNode = challengeNode;
        if ( allLevelsCompletedNode ) {
          allLevelsCompletedNode.center = challengeNode.challengeCenter;
        }

        // Assign each challenge node with a wrapper reference, so we can easily dispose it.
        challengeNode.wrapper = new Node( {
          children: [
            challengeBackground,
            challengeControlBox,
            challengeNode,
            challengeForeground
          ]
        } );
        if ( oldChallenge && oldChallenge.refreshedChallenge === challenge ) {
          transition = this.mainTransitionNode.dissolveTo( challengeNode.wrapper, {
            duration: 0.6,
            targetOptions: {
              easing: Easing.LINEAR
            }
          } );
        }
        else {
          transition = this.mainTransitionNode.slideLeftTo( challengeNode.wrapper, QUADRATIC_TRANSITION_OPTIONS );
        }
      }
      else {
        transition = this.mainTransitionNode.slideRightTo( this.levelSelectionLayer, QUADRATIC_TRANSITION_OPTIONS );
      }
      this.delayTransitions = true;
      if ( oldChallengeNode ) {
        transition.endedEmitter.addListener( () => {
          oldChallengeNode.wrapper.dispose();
          oldChallengeNode.dispose();
        } );
      }
    } );

    this.addChild( this.mainTransitionNode );

    const gameAudioPlayer = new GameAudioPlayer();

    // No unlinks needed, since the ScreenView/Model are permanent
    model.allLevelsCompleteEmitter.addListener( () => gameAudioPlayer.gameOverPerfectScore() );
    model.singleLevelCompleteEmitter.addListener( () => gameAudioPlayer.challengeComplete() );
    model.collectedGroupEmitter.addListener( () => gameAudioPlayer.correctAnswer() );
    model.incorrectAttemptEmitter.addListener( () => gameAudioPlayer.wrongAnswer() );

    this.levelSelectionLayer.addChild( this.levelSelectionTransitionNode );

    const levelSelectionButtonSpacing = 20;

    // Buttons to switch between level selection pages
    const leftButton = new RoundArrowButton( {
      baseColor: FractionsCommonColors.yellowRoundArrowButtonProperty,
      radius: 20,
      arrowRotation: -Math.PI / 2,
      enabledProperty: new DerivedProperty( [ this.leftLevelSelectionProperty ], value => !value ),
      listener: () => {
        this.leftLevelSelectionProperty.value = true;
      }
    } );
    const rightButton = new RoundArrowButton( {
      baseColor: FractionsCommonColors.yellowRoundArrowButtonProperty,
      radius: 20,
      arrowRotation: Math.PI / 2,
      enabledProperty: this.leftLevelSelectionProperty,
      listener: () => {
        this.leftLevelSelectionProperty.value = false;
      }
    } );

    // left-right touch areas
    leftButton.touchArea = leftButton.bounds.dilatedXY( levelSelectionButtonSpacing / 2, 10 );
    rightButton.touchArea = rightButton.bounds.dilatedXY( levelSelectionButtonSpacing / 2, 10 );

    const slidingLevelSelectionNode = new HBox( {
      children: [
        leftButton,
        rightButton
      ],
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.bottom - 30,
      spacing: levelSelectionButtonSpacing
    } );
    this.levelSelectionLayer.addChild( slidingLevelSelectionNode );

    const allLevelsCompletedNode = new AllLevelsCompletedNode( () => {
      // Go back to the level selection
      model.levelProperty.value = null;
    }, {
      center: this.layoutBounds.center,
      visible: false
    } );
    challengeForeground.addChild( allLevelsCompletedNode );

    model.allLevelsCompleteEmitter.addListener( () => {
      if ( !platform.mobileSafari ) {
        // @private {RewardNode}
        this.rewardNode = new RewardNode( {
          nodes: RewardNode.createRandomNodes( [
            ..._.times( 7, () => new StarNode() ),
            ..._.times( 7, () => new FaceNode( 40, { headStroke: 'black' } ) ),
            ..._.range( 1, 10 ).map( n => new NumberPieceNode( new NumberPiece( n ) ) ),
            ..._.range( 1, 5 ).map( n => new ShapePieceNode( new ShapePiece( new Fraction( 1, n ), BuildingRepresentation.PIE, FractionsCommonColors.labPieFillProperty ), { rotation: dotRandom.nextDouble() * 2 * Math.PI } ) ),
            ..._.range( 1, 5 ).map( n => new ShapePieceNode( new ShapePiece( new Fraction( 1, n ), BuildingRepresentation.BAR, FractionsCommonColors.labBarFillProperty ) ) )
          ], 150 )
        } );
        challengeBackground.addChild( this.rewardNode );
      }
      allLevelsCompletedNode.visible = true;

      const scoreProperty = model.levelProperty.value.scoreProperty;
      let finished = false;
      const doneListener = () => {
        // We need a guard here, since otherwise the doneListener could potentially be called twice from the same
        // event.
        if ( finished ) {
          return;
        }
        finished = true;
        model.levelProperty.unlink( doneListener );
        model.challengeProperty.unlink( doneListener );
        scoreProperty.unlink( doneListener );

        if ( this.rewardNode ) {
          this.rewardNode.dispose();
          this.rewardNode = null;
        }
        allLevelsCompletedNode.visible = false;
      };
      model.challengeProperty.lazyLink( doneListener );
      model.levelProperty.lazyLink( doneListener );
      scoreProperty.lazyLink( doneListener );
    } );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.right - SIDE_MARGIN,
      bottom: this.layoutBounds.bottom - SIDE_MARGIN
    } );
    this.levelSelectionLayer.addChild( resetAllButton );

    phet.joist.display.addInputListener( {
      down: event => {
        const screen = phet.joist.sim.selectedScreenProperty.value;
        if ( screen && screen.view === this ) {
          // Any event on a shape group should handle it.
          const challenge = model.challengeProperty.value;

          const isActive = lastChallengeNode && lastChallengeNode.isPointerActive( event.pointer );

          if ( challenge && !isActive ) {
            challenge.selectedGroupProperty.value = null;
          }
        }
      }
    } );
  }

  /**
   * Steps the view forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    this.rewardNode && this.rewardNode.visible && this.rewardNode.step( dt );

    if ( this.delayTransitions ) {
      this.delayTransitions = false;
    }
    else {
      this.levelSelectionTransitionNode.step( dt );
      this.mainTransitionNode.step( dt );
    }
  }

  /**
   * Resets the view portion.
   * @public
   */
  reset() {
    this.leftLevelSelectionProperty.reset();

    // "Instantly" complete animations
    this.levelSelectionTransitionNode.step( Number.POSITIVE_INFINITY );
    this.mainTransitionNode.step( Number.POSITIVE_INFINITY );
  }

  /**
   * Creates a row of level selection buttons.
   * @private
   *
   * @param {Array.<FractionLevel>} levels
   * @param {Array.<Node>} icons
   * @returns {Node}
   */
  createLevelRow( levels, icons ) {
    return new HBox( {
      children: levels.map( ( level, index ) => {
        const button = new LevelSelectionButton( icons[ index ], level.scoreProperty, {
          buttonWidth: 110,
          buttonHeight: 200,
          createScoreDisplay: scoreProperty => new ScoreDisplayStars( scoreProperty, {
            numberOfStars: level.numTargets,
            perfectScore: level.numTargets
          } ),
          listener: () => {
            this.model.levelProperty.value = level;
          },
          soundPlayerIndex: level.number - 1
        } );
        button.touchArea = button.localBounds.dilated( LEVEL_SELECTION_SPACING / 2 );
        return button;
      } ),
      spacing: LEVEL_SELECTION_SPACING
    } );
  }

  /**
   * Creates a "page" of level selection buttons, with a slice of shape levels on top and a slice of number levels
   * on bottom.
   * @private
   *
   * @param {number} minIndex - The minimum index of levels to include (inclusive)
   * @param {number} maxIndex - The maximum index of levels to include (inclusive)
   * @returns {Node}
   */
  createLevelSection( minIndex, maxIndex ) {
    return new Node( {
      children: [
        new VBox( {
          children: [
            this.createLevelRow( this.model.shapeLevels.slice( minIndex, maxIndex + 1 ), this.shapeIcons.slice( minIndex, maxIndex + 1 ) ),
            this.createLevelRow( this.model.numberLevels.slice( minIndex, maxIndex + 1 ), this.numberIcons.slice( minIndex, maxIndex + 1 ) )
          ],
          spacing: LEVEL_SELECTION_SPACING,
          center: this.layoutBounds.center
        } )
      ]
    } );
  }

  /**
   * Creates the level icon for the given level. This is passed into LevelSelectionButton as the icon, and in our case
   * includes text about what level number it is, in addition to the icon graphic. We need to handle this and provide
   * same-bounds "icons" for every button since LevelSelectionButton still resizes the icon based on its bounds.
   * @private
   *
   * @param {FractionLevel} level
   * @param {boolean} hasMixedNumbers
   * @returns {Node}
   */
  static createLevelIcon( level, hasMixedNumbers ) {
    const label = new Text( StringUtils.fillIn( levelTitlePatternString, {
      number: level.number
    } ), {
      font: new PhetFont( 18 ),
      maxWidth: ICON_DESIGN_BOUNDS.width
    } );

    let icon;
    if ( level.buildingType === BuildingType.NUMBER ) {
      if ( !hasMixedNumbers ) {
        const stack = new NumberStack( level.number, level.number );
        for ( let i = 0; i < level.number; i++ ) {
          stack.numberPieces.push( new NumberPiece( level.number ) );
        }
        icon = new NumberStackNode( stack, {
          scale: 0.75
        } );
      }
      else {
        const hasFraction = level.number > 1;
        icon = new MixedFractionNode( {
          whole: level.number,
          numerator: hasFraction ? 1 : null,
          denominator: hasFraction ? level.number : null,
          scale: 0.9
        } );
      }
    }
    else {
      // unmixed max width ~106, mixed ~217
      let shapePartition = LEVEL_SHAPE_PARTITIONS[ level.number - 1 ];
      // There's a different shape for non-mixed level 10
      if ( level.number === 10 && !hasMixedNumbers ) {
        shapePartition = select( ShapePartition.DIAGONAL_LS, 10 );
      }
      const filledPartitions = [
        new FilledPartition( shapePartition, _.times( level.number, () => true ), level.color ),
        ...( ( hasMixedNumbers && level.number > 1 ) ? [
          new FilledPartition( shapePartition, [ true, ..._.times( level.number - 1, () => false ) ], level.color )
        ] : [] )
      ];
      icon = new HBox( {
        spacing: 5,
        children: filledPartitions.map( filledPartition => new FilledPartitionNode( filledPartition ) ),
        scale: hasMixedNumbers ? 0.4 : 0.8
      } );
    }

    label.centerX = ICON_DESIGN_BOUNDS.centerX;
    label.top = ICON_DESIGN_BOUNDS.top;

    const iconContainer = new Node( {
      children: [ icon ],
      maxWidth: ICON_DESIGN_BOUNDS.width
    } );

    iconContainer.centerX = ICON_DESIGN_BOUNDS.centerX;
    iconContainer.centerY = ( label.bottom + ICON_DESIGN_BOUNDS.bottom ) / 2;

    assert && assert( ICON_DESIGN_BOUNDS.containsBounds( label.bounds ), 'Sanity check for level icon layout' );
    assert && assert( ICON_DESIGN_BOUNDS.containsBounds( iconContainer.bounds ), 'Sanity check for level icon layout' );

    return new Node( {
      children: [ label, iconContainer ],
      localBounds: ICON_DESIGN_BOUNDS
    } );
  }

  /**
   * Creates the icon for the unmixed game screens.
   * @public
   *
   * @returns {Node}
   */
  static createUnmixedScreenIcon() {

    const shapeGroup = new ShapeGroup( BuildingRepresentation.BAR );
    shapeGroup.partitionDenominatorProperty.value = 3;

    shapeGroup.shapeContainers.get( 0 ).shapePieces.push( new ShapePiece( new Fraction( 1, 3 ), BuildingRepresentation.BAR, FractionsCommonColors.shapeBlueProperty ) );

    const shapeGroupNode = new ShapeGroupNode( shapeGroup, {
      hasButtons: false,
      isIcon: true,
      positioned: false
    } );

    const equalsText = new Text( MathSymbols.EQUAL_TO, { font: new PhetFont( 30 ) } );

    const fractionNode = new MixedFractionNode( {
      numerator: 1,
      denominator: 3,
      scale: 1.5
    } );

    return FractionsCommonGlobals.wrapIcon( new HBox( {
      spacing: 10,
      children: [
        shapeGroupNode,
        equalsText,
        fractionNode
      ],
      scale: 2.3
    } ), FractionsCommonColors.otherScreenBackgroundProperty );
  }

  /**
   * Creates the icon for the mixed game screens.
   * @public
   *
   * @returns {Node}
   */
  static createMixedScreenIcon() {
    const fractionNode = new MixedFractionNode( {
      whole: 1,
      numerator: 2,
      denominator: 3,
      scale: 1.5
    } );

    const equalsText = new Text( MathSymbols.EQUAL_TO, { font: new PhetFont( 30 ) } );

    const rightSide = new HBox( {
      spacing: 5,
      children: [
        new FilledPartitionNode( new FilledPartition( ShapePartition.SIX_FLOWER, [ true, true, true, true, true, true ], FractionsCommonColors.shapeBlueProperty ) ),
        new FilledPartitionNode( new FilledPartition( ShapePartition.SIX_FLOWER, [ true, true, true, true, false, false ], FractionsCommonColors.shapeBlueProperty ) )
      ]
    } );

    return FractionsCommonGlobals.wrapIcon( new HBox( {
      spacing: 10,
      children: [
        fractionNode,
        equalsText,
        rightSide
      ],
      scale: 1.7
    } ), FractionsCommonColors.otherScreenBackgroundProperty );
  }
}

fractionsCommon.register( 'BuildingGameScreenView', BuildingGameScreenView );
export default BuildingGameScreenView;