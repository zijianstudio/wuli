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
const select = (shapePartitions, quantity) => {
  return _.find(shapePartitions, shapePartition => shapePartition.length === quantity);
};
const LEVEL_SHAPE_PARTITIONS = [select(ShapePartition.PIES, 1), select(ShapePartition.VERTICAL_BARS, 2), select(ShapePartition.POLYGONS, 3), select(ShapePartition.POLYGONS, 4), select(ShapePartition.POLYGONS, 5), ShapePartition.SIX_FLOWER, ShapePartition.HEX_RING, ShapePartition.NINJA_STAR, select(ShapePartition.GRIDS, 9), ShapePartition.FIVE_POINT];
const ICON_DESIGN_BOUNDS = new Bounds2(0, 0, 90, 129);
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
  constructor(model) {
    super();

    // @private {BuildingGameModel}
    this.model = model;

    // @private {Array.<Node>}
    this.shapeIcons = this.model.shapeLevels.map(level => BuildingGameScreenView.createLevelIcon(level, model.hasMixedNumbers));
    this.numberIcons = this.model.numberLevels.map(level => BuildingGameScreenView.createLevelIcon(level, model.hasMixedNumbers));
    const leftLevelSelectionNode = this.createLevelSection(0, 4);
    const rightLevelSelectionNode = this.createLevelSection(5, 9);

    // @private {Property.<boolean>}
    this.leftLevelSelectionProperty = new BooleanProperty(true);

    // @private {Node} - The "left" half of the sliding layer, displayed first
    this.levelSelectionLayer = new Node();
    this.levelSelectionLayer.addChild(new Text(chooseYourLevelString, {
      centerX: this.layoutBounds.centerX,
      top: this.layoutBounds.top + 30,
      font: new PhetFont(30)
    }));
    const challengeBackground = new Node();
    const challengeForeground = new Node();

    // @private {boolean} - We'll delay steps to transitions by a frame when this is set to true, to handle
    // https://github.com/phetsims/fractions-common/issues/42.
    this.delayTransitions = false;

    // @orivate {TransitionNode}
    this.levelSelectionTransitionNode = new TransitionNode(this.visibleBoundsProperty, {
      content: leftLevelSelectionNode,
      cachedNodes: [leftLevelSelectionNode, rightLevelSelectionNode]
    });
    // No unlink needed, since we own the given Property.
    this.leftLevelSelectionProperty.lazyLink(isLeft => {
      if (isLeft) {
        this.levelSelectionTransitionNode.slideRightTo(leftLevelSelectionNode, QUADRATIC_TRANSITION_OPTIONS);
      } else {
        this.levelSelectionTransitionNode.slideLeftTo(rightLevelSelectionNode, QUADRATIC_TRANSITION_OPTIONS);
      }
      this.delayTransitions = true;
    });

    // Switch to the proper level selection page whenever we go to the corresponding level.
    // See feature for https://github.com/phetsims/fractions-common/issues/58.
    model.challengeProperty.lazyLink(challenge => {
      if (challenge) {
        const isLevelLeft = challenge.levelNumber <= 5;
        if (this.leftLevelSelectionProperty.value !== isLevelLeft) {
          this.leftLevelSelectionProperty.value = isLevelLeft;
          this.levelSelectionTransitionNode.step(Number.POSITIVE_INFINITY);
        }
      }
    });

    // @private {TransitionNode}
    this.mainTransitionNode = new TransitionNode(this.visibleBoundsProperty, {
      content: this.levelSelectionLayer,
      cachedNodes: [this.levelSelectionLayer]
    });
    const leftButtonOptions = {
      touchAreaXDilation: SIDE_MARGIN,
      touchAreaYDilation: SIDE_MARGIN / 2
    };
    const challengeControlBox = new VBox({
      spacing: SIDE_MARGIN,
      top: this.layoutBounds.top + SIDE_MARGIN,
      left: this.layoutBounds.left + SIDE_MARGIN,
      children: [new BackButton(merge({
        listener() {
          model.levelProperty.value = null;
        }
      }, leftButtonOptions)), new RefreshButton(merge({
        iconHeight: 27,
        xMargin: 9,
        yMargin: 7,
        listener() {
          model.levelProperty.value && model.levelProperty.value.reset();
        }
      }, leftButtonOptions)), ...(phet.chipper.queryParameters.showAnswers ? [new RectangularPushButton(merge({
        content: new FaceNode(27),
        listener: function () {
          model.challengeProperty.value.cheat();
        }
      }, leftButtonOptions))] : [])]
    });
    let lastChallengeNode = null;
    model.challengeProperty.lazyLink((challenge, oldChallenge) => {
      const oldChallengeNode = lastChallengeNode;
      if (oldChallengeNode) {
        oldChallengeNode.interruptSubtreeInput();
      }
      lastChallengeNode = null;
      let transition;
      if (challenge) {
        // See https://github.com/phetsims/fractions-common/issues/43
        challenge.selectPreviouslySelectedGroup();
        const allLevelsCompleteProperty = model.levelCommpletePropertyMap.get(challenge.hasShapes ? BuildingType.SHAPE : BuildingType.NUMBER);
        const challengeNode = new FractionChallengeNode(challenge, this.layoutBounds, model.nextLevel.bind(model), model.incorrectAttemptEmitter, allLevelsCompleteProperty);
        lastChallengeNode = challengeNode;
        if (allLevelsCompletedNode) {
          allLevelsCompletedNode.center = challengeNode.challengeCenter;
        }

        // Assign each challenge node with a wrapper reference, so we can easily dispose it.
        challengeNode.wrapper = new Node({
          children: [challengeBackground, challengeControlBox, challengeNode, challengeForeground]
        });
        if (oldChallenge && oldChallenge.refreshedChallenge === challenge) {
          transition = this.mainTransitionNode.dissolveTo(challengeNode.wrapper, {
            duration: 0.6,
            targetOptions: {
              easing: Easing.LINEAR
            }
          });
        } else {
          transition = this.mainTransitionNode.slideLeftTo(challengeNode.wrapper, QUADRATIC_TRANSITION_OPTIONS);
        }
      } else {
        transition = this.mainTransitionNode.slideRightTo(this.levelSelectionLayer, QUADRATIC_TRANSITION_OPTIONS);
      }
      this.delayTransitions = true;
      if (oldChallengeNode) {
        transition.endedEmitter.addListener(() => {
          oldChallengeNode.wrapper.dispose();
          oldChallengeNode.dispose();
        });
      }
    });
    this.addChild(this.mainTransitionNode);
    const gameAudioPlayer = new GameAudioPlayer();

    // No unlinks needed, since the ScreenView/Model are permanent
    model.allLevelsCompleteEmitter.addListener(() => gameAudioPlayer.gameOverPerfectScore());
    model.singleLevelCompleteEmitter.addListener(() => gameAudioPlayer.challengeComplete());
    model.collectedGroupEmitter.addListener(() => gameAudioPlayer.correctAnswer());
    model.incorrectAttemptEmitter.addListener(() => gameAudioPlayer.wrongAnswer());
    this.levelSelectionLayer.addChild(this.levelSelectionTransitionNode);
    const levelSelectionButtonSpacing = 20;

    // Buttons to switch between level selection pages
    const leftButton = new RoundArrowButton({
      baseColor: FractionsCommonColors.yellowRoundArrowButtonProperty,
      radius: 20,
      arrowRotation: -Math.PI / 2,
      enabledProperty: new DerivedProperty([this.leftLevelSelectionProperty], value => !value),
      listener: () => {
        this.leftLevelSelectionProperty.value = true;
      }
    });
    const rightButton = new RoundArrowButton({
      baseColor: FractionsCommonColors.yellowRoundArrowButtonProperty,
      radius: 20,
      arrowRotation: Math.PI / 2,
      enabledProperty: this.leftLevelSelectionProperty,
      listener: () => {
        this.leftLevelSelectionProperty.value = false;
      }
    });

    // left-right touch areas
    leftButton.touchArea = leftButton.bounds.dilatedXY(levelSelectionButtonSpacing / 2, 10);
    rightButton.touchArea = rightButton.bounds.dilatedXY(levelSelectionButtonSpacing / 2, 10);
    const slidingLevelSelectionNode = new HBox({
      children: [leftButton, rightButton],
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.bottom - 30,
      spacing: levelSelectionButtonSpacing
    });
    this.levelSelectionLayer.addChild(slidingLevelSelectionNode);
    const allLevelsCompletedNode = new AllLevelsCompletedNode(() => {
      // Go back to the level selection
      model.levelProperty.value = null;
    }, {
      center: this.layoutBounds.center,
      visible: false
    });
    challengeForeground.addChild(allLevelsCompletedNode);
    model.allLevelsCompleteEmitter.addListener(() => {
      if (!platform.mobileSafari) {
        // @private {RewardNode}
        this.rewardNode = new RewardNode({
          nodes: RewardNode.createRandomNodes([..._.times(7, () => new StarNode()), ..._.times(7, () => new FaceNode(40, {
            headStroke: 'black'
          })), ..._.range(1, 10).map(n => new NumberPieceNode(new NumberPiece(n))), ..._.range(1, 5).map(n => new ShapePieceNode(new ShapePiece(new Fraction(1, n), BuildingRepresentation.PIE, FractionsCommonColors.labPieFillProperty), {
            rotation: dotRandom.nextDouble() * 2 * Math.PI
          })), ..._.range(1, 5).map(n => new ShapePieceNode(new ShapePiece(new Fraction(1, n), BuildingRepresentation.BAR, FractionsCommonColors.labBarFillProperty)))], 150)
        });
        challengeBackground.addChild(this.rewardNode);
      }
      allLevelsCompletedNode.visible = true;
      const scoreProperty = model.levelProperty.value.scoreProperty;
      let finished = false;
      const doneListener = () => {
        // We need a guard here, since otherwise the doneListener could potentially be called twice from the same
        // event.
        if (finished) {
          return;
        }
        finished = true;
        model.levelProperty.unlink(doneListener);
        model.challengeProperty.unlink(doneListener);
        scoreProperty.unlink(doneListener);
        if (this.rewardNode) {
          this.rewardNode.dispose();
          this.rewardNode = null;
        }
        allLevelsCompletedNode.visible = false;
      };
      model.challengeProperty.lazyLink(doneListener);
      model.levelProperty.lazyLink(doneListener);
      scoreProperty.lazyLink(doneListener);
    });
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.right - SIDE_MARGIN,
      bottom: this.layoutBounds.bottom - SIDE_MARGIN
    });
    this.levelSelectionLayer.addChild(resetAllButton);
    phet.joist.display.addInputListener({
      down: event => {
        const screen = phet.joist.sim.selectedScreenProperty.value;
        if (screen && screen.view === this) {
          // Any event on a shape group should handle it.
          const challenge = model.challengeProperty.value;
          const isActive = lastChallengeNode && lastChallengeNode.isPointerActive(event.pointer);
          if (challenge && !isActive) {
            challenge.selectedGroupProperty.value = null;
          }
        }
      }
    });
  }

  /**
   * Steps the view forward in time.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    this.rewardNode && this.rewardNode.visible && this.rewardNode.step(dt);
    if (this.delayTransitions) {
      this.delayTransitions = false;
    } else {
      this.levelSelectionTransitionNode.step(dt);
      this.mainTransitionNode.step(dt);
    }
  }

  /**
   * Resets the view portion.
   * @public
   */
  reset() {
    this.leftLevelSelectionProperty.reset();

    // "Instantly" complete animations
    this.levelSelectionTransitionNode.step(Number.POSITIVE_INFINITY);
    this.mainTransitionNode.step(Number.POSITIVE_INFINITY);
  }

  /**
   * Creates a row of level selection buttons.
   * @private
   *
   * @param {Array.<FractionLevel>} levels
   * @param {Array.<Node>} icons
   * @returns {Node}
   */
  createLevelRow(levels, icons) {
    return new HBox({
      children: levels.map((level, index) => {
        const button = new LevelSelectionButton(icons[index], level.scoreProperty, {
          buttonWidth: 110,
          buttonHeight: 200,
          createScoreDisplay: scoreProperty => new ScoreDisplayStars(scoreProperty, {
            numberOfStars: level.numTargets,
            perfectScore: level.numTargets
          }),
          listener: () => {
            this.model.levelProperty.value = level;
          },
          soundPlayerIndex: level.number - 1
        });
        button.touchArea = button.localBounds.dilated(LEVEL_SELECTION_SPACING / 2);
        return button;
      }),
      spacing: LEVEL_SELECTION_SPACING
    });
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
  createLevelSection(minIndex, maxIndex) {
    return new Node({
      children: [new VBox({
        children: [this.createLevelRow(this.model.shapeLevels.slice(minIndex, maxIndex + 1), this.shapeIcons.slice(minIndex, maxIndex + 1)), this.createLevelRow(this.model.numberLevels.slice(minIndex, maxIndex + 1), this.numberIcons.slice(minIndex, maxIndex + 1))],
        spacing: LEVEL_SELECTION_SPACING,
        center: this.layoutBounds.center
      })]
    });
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
  static createLevelIcon(level, hasMixedNumbers) {
    const label = new Text(StringUtils.fillIn(levelTitlePatternString, {
      number: level.number
    }), {
      font: new PhetFont(18),
      maxWidth: ICON_DESIGN_BOUNDS.width
    });
    let icon;
    if (level.buildingType === BuildingType.NUMBER) {
      if (!hasMixedNumbers) {
        const stack = new NumberStack(level.number, level.number);
        for (let i = 0; i < level.number; i++) {
          stack.numberPieces.push(new NumberPiece(level.number));
        }
        icon = new NumberStackNode(stack, {
          scale: 0.75
        });
      } else {
        const hasFraction = level.number > 1;
        icon = new MixedFractionNode({
          whole: level.number,
          numerator: hasFraction ? 1 : null,
          denominator: hasFraction ? level.number : null,
          scale: 0.9
        });
      }
    } else {
      // unmixed max width ~106, mixed ~217
      let shapePartition = LEVEL_SHAPE_PARTITIONS[level.number - 1];
      // There's a different shape for non-mixed level 10
      if (level.number === 10 && !hasMixedNumbers) {
        shapePartition = select(ShapePartition.DIAGONAL_LS, 10);
      }
      const filledPartitions = [new FilledPartition(shapePartition, _.times(level.number, () => true), level.color), ...(hasMixedNumbers && level.number > 1 ? [new FilledPartition(shapePartition, [true, ..._.times(level.number - 1, () => false)], level.color)] : [])];
      icon = new HBox({
        spacing: 5,
        children: filledPartitions.map(filledPartition => new FilledPartitionNode(filledPartition)),
        scale: hasMixedNumbers ? 0.4 : 0.8
      });
    }
    label.centerX = ICON_DESIGN_BOUNDS.centerX;
    label.top = ICON_DESIGN_BOUNDS.top;
    const iconContainer = new Node({
      children: [icon],
      maxWidth: ICON_DESIGN_BOUNDS.width
    });
    iconContainer.centerX = ICON_DESIGN_BOUNDS.centerX;
    iconContainer.centerY = (label.bottom + ICON_DESIGN_BOUNDS.bottom) / 2;
    assert && assert(ICON_DESIGN_BOUNDS.containsBounds(label.bounds), 'Sanity check for level icon layout');
    assert && assert(ICON_DESIGN_BOUNDS.containsBounds(iconContainer.bounds), 'Sanity check for level icon layout');
    return new Node({
      children: [label, iconContainer],
      localBounds: ICON_DESIGN_BOUNDS
    });
  }

  /**
   * Creates the icon for the unmixed game screens.
   * @public
   *
   * @returns {Node}
   */
  static createUnmixedScreenIcon() {
    const shapeGroup = new ShapeGroup(BuildingRepresentation.BAR);
    shapeGroup.partitionDenominatorProperty.value = 3;
    shapeGroup.shapeContainers.get(0).shapePieces.push(new ShapePiece(new Fraction(1, 3), BuildingRepresentation.BAR, FractionsCommonColors.shapeBlueProperty));
    const shapeGroupNode = new ShapeGroupNode(shapeGroup, {
      hasButtons: false,
      isIcon: true,
      positioned: false
    });
    const equalsText = new Text(MathSymbols.EQUAL_TO, {
      font: new PhetFont(30)
    });
    const fractionNode = new MixedFractionNode({
      numerator: 1,
      denominator: 3,
      scale: 1.5
    });
    return FractionsCommonGlobals.wrapIcon(new HBox({
      spacing: 10,
      children: [shapeGroupNode, equalsText, fractionNode],
      scale: 2.3
    }), FractionsCommonColors.otherScreenBackgroundProperty);
  }

  /**
   * Creates the icon for the mixed game screens.
   * @public
   *
   * @returns {Node}
   */
  static createMixedScreenIcon() {
    const fractionNode = new MixedFractionNode({
      whole: 1,
      numerator: 2,
      denominator: 3,
      scale: 1.5
    });
    const equalsText = new Text(MathSymbols.EQUAL_TO, {
      font: new PhetFont(30)
    });
    const rightSide = new HBox({
      spacing: 5,
      children: [new FilledPartitionNode(new FilledPartition(ShapePartition.SIX_FLOWER, [true, true, true, true, true, true], FractionsCommonColors.shapeBlueProperty)), new FilledPartitionNode(new FilledPartition(ShapePartition.SIX_FLOWER, [true, true, true, true, false, false], FractionsCommonColors.shapeBlueProperty))]
    });
    return FractionsCommonGlobals.wrapIcon(new HBox({
      spacing: 10,
      children: [fractionNode, equalsText, rightSide],
      scale: 1.7
    }), FractionsCommonColors.otherScreenBackgroundProperty);
  }
}
fractionsCommon.register('BuildingGameScreenView', BuildingGameScreenView);
export default BuildingGameScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJCb3VuZHMyIiwiZG90UmFuZG9tIiwiU2NyZWVuVmlldyIsIm1lcmdlIiwicGxhdGZvcm0iLCJGcmFjdGlvbiIsIlN0cmluZ1V0aWxzIiwiQmFja0J1dHRvbiIsIlJlZnJlc2hCdXR0b24iLCJSZXNldEFsbEJ1dHRvbiIsIkZhY2VOb2RlIiwiTWF0aFN5bWJvbHMiLCJNaXhlZEZyYWN0aW9uTm9kZSIsIlBoZXRGb250IiwiU3Rhck5vZGUiLCJIQm94IiwiTm9kZSIsIlRleHQiLCJWQm94IiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiRWFzaW5nIiwiVHJhbnNpdGlvbk5vZGUiLCJBbGxMZXZlbHNDb21wbGV0ZWROb2RlIiwiR2FtZUF1ZGlvUGxheWVyIiwiTGV2ZWxTZWxlY3Rpb25CdXR0b24iLCJSZXdhcmROb2RlIiwiU2NvcmVEaXNwbGF5U3RhcnMiLCJWZWdhc1N0cmluZ3MiLCJCdWlsZGluZ1JlcHJlc2VudGF0aW9uIiwiQnVpbGRpbmdUeXBlIiwiTnVtYmVyUGllY2UiLCJOdW1iZXJTdGFjayIsIlNoYXBlR3JvdXAiLCJTaGFwZVBpZWNlIiwiTnVtYmVyUGllY2VOb2RlIiwiTnVtYmVyU3RhY2tOb2RlIiwiU2hhcGVHcm91cE5vZGUiLCJTaGFwZVBpZWNlTm9kZSIsIkZyYWN0aW9uc0NvbW1vbkdsb2JhbHMiLCJGcmFjdGlvbnNDb21tb25Db2xvcnMiLCJSb3VuZEFycm93QnV0dG9uIiwiZnJhY3Rpb25zQ29tbW9uIiwiRnJhY3Rpb25zQ29tbW9uU3RyaW5ncyIsIkZpbGxlZFBhcnRpdGlvbiIsIlNoYXBlUGFydGl0aW9uIiwiRmlsbGVkUGFydGl0aW9uTm9kZSIsIkZyYWN0aW9uQ2hhbGxlbmdlTm9kZSIsImNob29zZVlvdXJMZXZlbFN0cmluZyIsImNob29zZVlvdXJMZXZlbCIsImxldmVsVGl0bGVQYXR0ZXJuU3RyaW5nIiwibGV2ZWxUaXRsZVBhdHRlcm4iLCJMRVZFTF9TRUxFQ1RJT05fU1BBQ0lORyIsIlNJREVfTUFSR0lOIiwic2VsZWN0Iiwic2hhcGVQYXJ0aXRpb25zIiwicXVhbnRpdHkiLCJfIiwiZmluZCIsInNoYXBlUGFydGl0aW9uIiwibGVuZ3RoIiwiTEVWRUxfU0hBUEVfUEFSVElUSU9OUyIsIlBJRVMiLCJWRVJUSUNBTF9CQVJTIiwiUE9MWUdPTlMiLCJTSVhfRkxPV0VSIiwiSEVYX1JJTkciLCJOSU5KQV9TVEFSIiwiR1JJRFMiLCJGSVZFX1BPSU5UIiwiSUNPTl9ERVNJR05fQk9VTkRTIiwiUVVBRFJBVElDX1RSQU5TSVRJT05fT1BUSU9OUyIsImR1cmF0aW9uIiwidGFyZ2V0T3B0aW9ucyIsImVhc2luZyIsIlFVQURSQVRJQ19JTl9PVVQiLCJCdWlsZGluZ0dhbWVTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInNoYXBlSWNvbnMiLCJzaGFwZUxldmVscyIsIm1hcCIsImxldmVsIiwiY3JlYXRlTGV2ZWxJY29uIiwiaGFzTWl4ZWROdW1iZXJzIiwibnVtYmVySWNvbnMiLCJudW1iZXJMZXZlbHMiLCJsZWZ0TGV2ZWxTZWxlY3Rpb25Ob2RlIiwiY3JlYXRlTGV2ZWxTZWN0aW9uIiwicmlnaHRMZXZlbFNlbGVjdGlvbk5vZGUiLCJsZWZ0TGV2ZWxTZWxlY3Rpb25Qcm9wZXJ0eSIsImxldmVsU2VsZWN0aW9uTGF5ZXIiLCJhZGRDaGlsZCIsImNlbnRlclgiLCJsYXlvdXRCb3VuZHMiLCJ0b3AiLCJmb250IiwiY2hhbGxlbmdlQmFja2dyb3VuZCIsImNoYWxsZW5nZUZvcmVncm91bmQiLCJkZWxheVRyYW5zaXRpb25zIiwibGV2ZWxTZWxlY3Rpb25UcmFuc2l0aW9uTm9kZSIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsImNvbnRlbnQiLCJjYWNoZWROb2RlcyIsImxhenlMaW5rIiwiaXNMZWZ0Iiwic2xpZGVSaWdodFRvIiwic2xpZGVMZWZ0VG8iLCJjaGFsbGVuZ2VQcm9wZXJ0eSIsImNoYWxsZW5nZSIsImlzTGV2ZWxMZWZ0IiwibGV2ZWxOdW1iZXIiLCJ2YWx1ZSIsInN0ZXAiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIm1haW5UcmFuc2l0aW9uTm9kZSIsImxlZnRCdXR0b25PcHRpb25zIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwiY2hhbGxlbmdlQ29udHJvbEJveCIsInNwYWNpbmciLCJsZWZ0IiwiY2hpbGRyZW4iLCJsaXN0ZW5lciIsImxldmVsUHJvcGVydHkiLCJpY29uSGVpZ2h0IiwieE1hcmdpbiIsInlNYXJnaW4iLCJyZXNldCIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwic2hvd0Fuc3dlcnMiLCJjaGVhdCIsImxhc3RDaGFsbGVuZ2VOb2RlIiwib2xkQ2hhbGxlbmdlIiwib2xkQ2hhbGxlbmdlTm9kZSIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsInRyYW5zaXRpb24iLCJzZWxlY3RQcmV2aW91c2x5U2VsZWN0ZWRHcm91cCIsImFsbExldmVsc0NvbXBsZXRlUHJvcGVydHkiLCJsZXZlbENvbW1wbGV0ZVByb3BlcnR5TWFwIiwiZ2V0IiwiaGFzU2hhcGVzIiwiU0hBUEUiLCJOVU1CRVIiLCJjaGFsbGVuZ2VOb2RlIiwibmV4dExldmVsIiwiYmluZCIsImluY29ycmVjdEF0dGVtcHRFbWl0dGVyIiwiYWxsTGV2ZWxzQ29tcGxldGVkTm9kZSIsImNlbnRlciIsImNoYWxsZW5nZUNlbnRlciIsIndyYXBwZXIiLCJyZWZyZXNoZWRDaGFsbGVuZ2UiLCJkaXNzb2x2ZVRvIiwiTElORUFSIiwiZW5kZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJkaXNwb3NlIiwiZ2FtZUF1ZGlvUGxheWVyIiwiYWxsTGV2ZWxzQ29tcGxldGVFbWl0dGVyIiwiZ2FtZU92ZXJQZXJmZWN0U2NvcmUiLCJzaW5nbGVMZXZlbENvbXBsZXRlRW1pdHRlciIsImNoYWxsZW5nZUNvbXBsZXRlIiwiY29sbGVjdGVkR3JvdXBFbWl0dGVyIiwiY29ycmVjdEFuc3dlciIsIndyb25nQW5zd2VyIiwibGV2ZWxTZWxlY3Rpb25CdXR0b25TcGFjaW5nIiwibGVmdEJ1dHRvbiIsImJhc2VDb2xvciIsInllbGxvd1JvdW5kQXJyb3dCdXR0b25Qcm9wZXJ0eSIsInJhZGl1cyIsImFycm93Um90YXRpb24iLCJNYXRoIiwiUEkiLCJlbmFibGVkUHJvcGVydHkiLCJyaWdodEJ1dHRvbiIsInRvdWNoQXJlYSIsImJvdW5kcyIsImRpbGF0ZWRYWSIsInNsaWRpbmdMZXZlbFNlbGVjdGlvbk5vZGUiLCJib3R0b20iLCJ2aXNpYmxlIiwibW9iaWxlU2FmYXJpIiwicmV3YXJkTm9kZSIsIm5vZGVzIiwiY3JlYXRlUmFuZG9tTm9kZXMiLCJ0aW1lcyIsImhlYWRTdHJva2UiLCJyYW5nZSIsIm4iLCJQSUUiLCJsYWJQaWVGaWxsUHJvcGVydHkiLCJyb3RhdGlvbiIsIm5leHREb3VibGUiLCJCQVIiLCJsYWJCYXJGaWxsUHJvcGVydHkiLCJzY29yZVByb3BlcnR5IiwiZmluaXNoZWQiLCJkb25lTGlzdGVuZXIiLCJ1bmxpbmsiLCJyZXNldEFsbEJ1dHRvbiIsInJpZ2h0Iiwiam9pc3QiLCJkaXNwbGF5IiwiYWRkSW5wdXRMaXN0ZW5lciIsImRvd24iLCJldmVudCIsInNjcmVlbiIsInNpbSIsInNlbGVjdGVkU2NyZWVuUHJvcGVydHkiLCJ2aWV3IiwiaXNBY3RpdmUiLCJpc1BvaW50ZXJBY3RpdmUiLCJwb2ludGVyIiwic2VsZWN0ZWRHcm91cFByb3BlcnR5IiwiZHQiLCJjcmVhdGVMZXZlbFJvdyIsImxldmVscyIsImljb25zIiwiaW5kZXgiLCJidXR0b24iLCJidXR0b25XaWR0aCIsImJ1dHRvbkhlaWdodCIsImNyZWF0ZVNjb3JlRGlzcGxheSIsIm51bWJlck9mU3RhcnMiLCJudW1UYXJnZXRzIiwicGVyZmVjdFNjb3JlIiwic291bmRQbGF5ZXJJbmRleCIsIm51bWJlciIsImxvY2FsQm91bmRzIiwiZGlsYXRlZCIsIm1pbkluZGV4IiwibWF4SW5kZXgiLCJzbGljZSIsImxhYmVsIiwiZmlsbEluIiwibWF4V2lkdGgiLCJ3aWR0aCIsImljb24iLCJidWlsZGluZ1R5cGUiLCJzdGFjayIsImkiLCJudW1iZXJQaWVjZXMiLCJwdXNoIiwic2NhbGUiLCJoYXNGcmFjdGlvbiIsIndob2xlIiwibnVtZXJhdG9yIiwiZGVub21pbmF0b3IiLCJESUFHT05BTF9MUyIsImZpbGxlZFBhcnRpdGlvbnMiLCJjb2xvciIsImZpbGxlZFBhcnRpdGlvbiIsImljb25Db250YWluZXIiLCJjZW50ZXJZIiwiYXNzZXJ0IiwiY29udGFpbnNCb3VuZHMiLCJjcmVhdGVVbm1peGVkU2NyZWVuSWNvbiIsInNoYXBlR3JvdXAiLCJwYXJ0aXRpb25EZW5vbWluYXRvclByb3BlcnR5Iiwic2hhcGVDb250YWluZXJzIiwic2hhcGVQaWVjZXMiLCJzaGFwZUJsdWVQcm9wZXJ0eSIsInNoYXBlR3JvdXBOb2RlIiwiaGFzQnV0dG9ucyIsImlzSWNvbiIsInBvc2l0aW9uZWQiLCJlcXVhbHNUZXh0IiwiRVFVQUxfVE8iLCJmcmFjdGlvbk5vZGUiLCJ3cmFwSWNvbiIsIm90aGVyU2NyZWVuQmFja2dyb3VuZFByb3BlcnR5IiwiY3JlYXRlTWl4ZWRTY3JlZW5JY29uIiwicmlnaHRTaWRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCdWlsZGluZ0dhbWVTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNjcmVlblZpZXcgZm9yIGdhbWUgc2NyZWVucyB3aGVyZSB0aGUgb2JqZWN0aXZlIGlzIHRvIGJ1aWxkIHNwZWNpZmljIGZyYWN0aW9ucy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xyXG5pbXBvcnQgRnJhY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9tb2RlbC9GcmFjdGlvbi5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgQmFja0J1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9CYWNrQnV0dG9uLmpzJztcclxuaW1wb3J0IFJlZnJlc2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVmcmVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBGYWNlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvRmFjZU5vZGUuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IE1peGVkRnJhY3Rpb25Ob2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NaXhlZEZyYWN0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgU3Rhck5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1N0YXJOb2RlLmpzJztcclxuaW1wb3J0IHsgSEJveCwgTm9kZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IEVhc2luZyBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9FYXNpbmcuanMnO1xyXG5pbXBvcnQgVHJhbnNpdGlvbk5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvVHJhbnNpdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgQWxsTGV2ZWxzQ29tcGxldGVkTm9kZSBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9BbGxMZXZlbHNDb21wbGV0ZWROb2RlLmpzJztcclxuaW1wb3J0IEdhbWVBdWRpb1BsYXllciBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9HYW1lQXVkaW9QbGF5ZXIuanMnO1xyXG5pbXBvcnQgTGV2ZWxTZWxlY3Rpb25CdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvTGV2ZWxTZWxlY3Rpb25CdXR0b24uanMnO1xyXG5pbXBvcnQgUmV3YXJkTm9kZSBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9SZXdhcmROb2RlLmpzJztcclxuaW1wb3J0IFNjb3JlRGlzcGxheVN0YXJzIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1Njb3JlRGlzcGxheVN0YXJzLmpzJztcclxuaW1wb3J0IFZlZ2FzU3RyaW5ncyBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9WZWdhc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgQnVpbGRpbmdSZXByZXNlbnRhdGlvbiBmcm9tICcuLi8uLi9idWlsZGluZy9tb2RlbC9CdWlsZGluZ1JlcHJlc2VudGF0aW9uLmpzJztcclxuaW1wb3J0IEJ1aWxkaW5nVHlwZSBmcm9tICcuLi8uLi9idWlsZGluZy9tb2RlbC9CdWlsZGluZ1R5cGUuanMnO1xyXG5pbXBvcnQgTnVtYmVyUGllY2UgZnJvbSAnLi4vLi4vYnVpbGRpbmcvbW9kZWwvTnVtYmVyUGllY2UuanMnO1xyXG5pbXBvcnQgTnVtYmVyU3RhY2sgZnJvbSAnLi4vLi4vYnVpbGRpbmcvbW9kZWwvTnVtYmVyU3RhY2suanMnO1xyXG5pbXBvcnQgU2hhcGVHcm91cCBmcm9tICcuLi8uLi9idWlsZGluZy9tb2RlbC9TaGFwZUdyb3VwLmpzJztcclxuaW1wb3J0IFNoYXBlUGllY2UgZnJvbSAnLi4vLi4vYnVpbGRpbmcvbW9kZWwvU2hhcGVQaWVjZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQaWVjZU5vZGUgZnJvbSAnLi4vLi4vYnVpbGRpbmcvdmlldy9OdW1iZXJQaWVjZU5vZGUuanMnO1xyXG5pbXBvcnQgTnVtYmVyU3RhY2tOb2RlIGZyb20gJy4uLy4uL2J1aWxkaW5nL3ZpZXcvTnVtYmVyU3RhY2tOb2RlLmpzJztcclxuaW1wb3J0IFNoYXBlR3JvdXBOb2RlIGZyb20gJy4uLy4uL2J1aWxkaW5nL3ZpZXcvU2hhcGVHcm91cE5vZGUuanMnO1xyXG5pbXBvcnQgU2hhcGVQaWVjZU5vZGUgZnJvbSAnLi4vLi4vYnVpbGRpbmcvdmlldy9TaGFwZVBpZWNlTm9kZS5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbnNDb21tb25HbG9iYWxzIGZyb20gJy4uLy4uL2NvbW1vbi9GcmFjdGlvbnNDb21tb25HbG9iYWxzLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9GcmFjdGlvbnNDb21tb25Db2xvcnMuanMnO1xyXG5pbXBvcnQgUm91bmRBcnJvd0J1dHRvbiBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Sb3VuZEFycm93QnV0dG9uLmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0NvbW1vbiBmcm9tICcuLi8uLi9mcmFjdGlvbnNDb21tb24uanMnO1xyXG5pbXBvcnQgRnJhY3Rpb25zQ29tbW9uU3RyaW5ncyBmcm9tICcuLi8uLi9GcmFjdGlvbnNDb21tb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IEZpbGxlZFBhcnRpdGlvbiBmcm9tICcuLi9tb2RlbC9GaWxsZWRQYXJ0aXRpb24uanMnO1xyXG5pbXBvcnQgU2hhcGVQYXJ0aXRpb24gZnJvbSAnLi4vbW9kZWwvU2hhcGVQYXJ0aXRpb24uanMnO1xyXG5pbXBvcnQgRmlsbGVkUGFydGl0aW9uTm9kZSBmcm9tICcuL0ZpbGxlZFBhcnRpdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgRnJhY3Rpb25DaGFsbGVuZ2VOb2RlIGZyb20gJy4vRnJhY3Rpb25DaGFsbGVuZ2VOb2RlLmpzJztcclxuXHJcbmNvbnN0IGNob29zZVlvdXJMZXZlbFN0cmluZyA9IFZlZ2FzU3RyaW5ncy5jaG9vc2VZb3VyTGV2ZWw7XHJcbmNvbnN0IGxldmVsVGl0bGVQYXR0ZXJuU3RyaW5nID0gRnJhY3Rpb25zQ29tbW9uU3RyaW5ncy5sZXZlbFRpdGxlUGF0dGVybjtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBMRVZFTF9TRUxFQ1RJT05fU1BBQ0lORyA9IDIwO1xyXG5jb25zdCBTSURFX01BUkdJTiA9IDEwO1xyXG5jb25zdCBzZWxlY3QgPSAoIHNoYXBlUGFydGl0aW9ucywgcXVhbnRpdHkgKSA9PiB7XHJcbiAgcmV0dXJuIF8uZmluZCggc2hhcGVQYXJ0aXRpb25zLCBzaGFwZVBhcnRpdGlvbiA9PiBzaGFwZVBhcnRpdGlvbi5sZW5ndGggPT09IHF1YW50aXR5ICk7XHJcbn07XHJcbmNvbnN0IExFVkVMX1NIQVBFX1BBUlRJVElPTlMgPSBbXHJcbiAgc2VsZWN0KCBTaGFwZVBhcnRpdGlvbi5QSUVTLCAxICksXHJcbiAgc2VsZWN0KCBTaGFwZVBhcnRpdGlvbi5WRVJUSUNBTF9CQVJTLCAyICksXHJcbiAgc2VsZWN0KCBTaGFwZVBhcnRpdGlvbi5QT0xZR09OUywgMyApLFxyXG4gIHNlbGVjdCggU2hhcGVQYXJ0aXRpb24uUE9MWUdPTlMsIDQgKSxcclxuICBzZWxlY3QoIFNoYXBlUGFydGl0aW9uLlBPTFlHT05TLCA1ICksXHJcbiAgU2hhcGVQYXJ0aXRpb24uU0lYX0ZMT1dFUixcclxuICBTaGFwZVBhcnRpdGlvbi5IRVhfUklORyxcclxuICBTaGFwZVBhcnRpdGlvbi5OSU5KQV9TVEFSLFxyXG4gIHNlbGVjdCggU2hhcGVQYXJ0aXRpb24uR1JJRFMsIDkgKSxcclxuICBTaGFwZVBhcnRpdGlvbi5GSVZFX1BPSU5UXHJcbl07XHJcbmNvbnN0IElDT05fREVTSUdOX0JPVU5EUyA9IG5ldyBCb3VuZHMyKCAwLCAwLCA5MCwgMTI5ICk7XHJcbmNvbnN0IFFVQURSQVRJQ19UUkFOU0lUSU9OX09QVElPTlMgPSB7XHJcbiAgZHVyYXRpb246IDAuNCxcclxuICB0YXJnZXRPcHRpb25zOiB7XHJcbiAgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VUXHJcbiAgfVxyXG59O1xyXG5cclxuY2xhc3MgQnVpbGRpbmdHYW1lU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QnVpbGRpbmdHYW1lTW9kZWx9IG1vZGVsXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QnVpbGRpbmdHYW1lTW9kZWx9XHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxOb2RlPn1cclxuICAgIHRoaXMuc2hhcGVJY29ucyA9IHRoaXMubW9kZWwuc2hhcGVMZXZlbHMubWFwKCBsZXZlbCA9PiBCdWlsZGluZ0dhbWVTY3JlZW5WaWV3LmNyZWF0ZUxldmVsSWNvbiggbGV2ZWwsIG1vZGVsLmhhc01peGVkTnVtYmVycyApICk7XHJcbiAgICB0aGlzLm51bWJlckljb25zID0gdGhpcy5tb2RlbC5udW1iZXJMZXZlbHMubWFwKCBsZXZlbCA9PiBCdWlsZGluZ0dhbWVTY3JlZW5WaWV3LmNyZWF0ZUxldmVsSWNvbiggbGV2ZWwsIG1vZGVsLmhhc01peGVkTnVtYmVycyApICk7XHJcblxyXG4gICAgY29uc3QgbGVmdExldmVsU2VsZWN0aW9uTm9kZSA9IHRoaXMuY3JlYXRlTGV2ZWxTZWN0aW9uKCAwLCA0ICk7XHJcbiAgICBjb25zdCByaWdodExldmVsU2VsZWN0aW9uTm9kZSA9IHRoaXMuY3JlYXRlTGV2ZWxTZWN0aW9uKCA1LCA5ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1Byb3BlcnR5Ljxib29sZWFuPn1cclxuICAgIHRoaXMubGVmdExldmVsU2VsZWN0aW9uUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge05vZGV9IC0gVGhlIFwibGVmdFwiIGhhbGYgb2YgdGhlIHNsaWRpbmcgbGF5ZXIsIGRpc3BsYXllZCBmaXJzdFxyXG4gICAgdGhpcy5sZXZlbFNlbGVjdGlvbkxheWVyID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICB0aGlzLmxldmVsU2VsZWN0aW9uTGF5ZXIuYWRkQ2hpbGQoIG5ldyBUZXh0KCBjaG9vc2VZb3VyTGV2ZWxTdHJpbmcsIHtcclxuICAgICAgY2VudGVyWDogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWCxcclxuICAgICAgdG9wOiB0aGlzLmxheW91dEJvdW5kcy50b3AgKyAzMCxcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAzMCApXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICBjb25zdCBjaGFsbGVuZ2VCYWNrZ3JvdW5kID0gbmV3IE5vZGUoKTtcclxuICAgIGNvbnN0IGNoYWxsZW5nZUZvcmVncm91bmQgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIFdlJ2xsIGRlbGF5IHN0ZXBzIHRvIHRyYW5zaXRpb25zIGJ5IGEgZnJhbWUgd2hlbiB0aGlzIGlzIHNldCB0byB0cnVlLCB0byBoYW5kbGVcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mcmFjdGlvbnMtY29tbW9uL2lzc3Vlcy80Mi5cclxuICAgIHRoaXMuZGVsYXlUcmFuc2l0aW9ucyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBvcml2YXRlIHtUcmFuc2l0aW9uTm9kZX1cclxuICAgIHRoaXMubGV2ZWxTZWxlY3Rpb25UcmFuc2l0aW9uTm9kZSA9IG5ldyBUcmFuc2l0aW9uTm9kZSggdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksIHtcclxuICAgICAgY29udGVudDogbGVmdExldmVsU2VsZWN0aW9uTm9kZSxcclxuICAgICAgY2FjaGVkTm9kZXM6IFsgbGVmdExldmVsU2VsZWN0aW9uTm9kZSwgcmlnaHRMZXZlbFNlbGVjdGlvbk5vZGUgXVxyXG4gICAgfSApO1xyXG4gICAgLy8gTm8gdW5saW5rIG5lZWRlZCwgc2luY2Ugd2Ugb3duIHRoZSBnaXZlbiBQcm9wZXJ0eS5cclxuICAgIHRoaXMubGVmdExldmVsU2VsZWN0aW9uUHJvcGVydHkubGF6eUxpbmsoIGlzTGVmdCA9PiB7XHJcbiAgICAgIGlmICggaXNMZWZ0ICkge1xyXG4gICAgICAgIHRoaXMubGV2ZWxTZWxlY3Rpb25UcmFuc2l0aW9uTm9kZS5zbGlkZVJpZ2h0VG8oIGxlZnRMZXZlbFNlbGVjdGlvbk5vZGUsIFFVQURSQVRJQ19UUkFOU0lUSU9OX09QVElPTlMgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmxldmVsU2VsZWN0aW9uVHJhbnNpdGlvbk5vZGUuc2xpZGVMZWZ0VG8oIHJpZ2h0TGV2ZWxTZWxlY3Rpb25Ob2RlLCBRVUFEUkFUSUNfVFJBTlNJVElPTl9PUFRJT05TICk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5kZWxheVRyYW5zaXRpb25zID0gdHJ1ZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTd2l0Y2ggdG8gdGhlIHByb3BlciBsZXZlbCBzZWxlY3Rpb24gcGFnZSB3aGVuZXZlciB3ZSBnbyB0byB0aGUgY29ycmVzcG9uZGluZyBsZXZlbC5cclxuICAgIC8vIFNlZSBmZWF0dXJlIGZvciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZnJhY3Rpb25zLWNvbW1vbi9pc3N1ZXMvNTguXHJcbiAgICBtb2RlbC5jaGFsbGVuZ2VQcm9wZXJ0eS5sYXp5TGluayggY2hhbGxlbmdlID0+IHtcclxuICAgICAgaWYgKCBjaGFsbGVuZ2UgKSB7XHJcbiAgICAgICAgY29uc3QgaXNMZXZlbExlZnQgPSBjaGFsbGVuZ2UubGV2ZWxOdW1iZXIgPD0gNTtcclxuICAgICAgICBpZiAoIHRoaXMubGVmdExldmVsU2VsZWN0aW9uUHJvcGVydHkudmFsdWUgIT09IGlzTGV2ZWxMZWZ0ICkge1xyXG4gICAgICAgICAgdGhpcy5sZWZ0TGV2ZWxTZWxlY3Rpb25Qcm9wZXJ0eS52YWx1ZSA9IGlzTGV2ZWxMZWZ0O1xyXG4gICAgICAgICAgdGhpcy5sZXZlbFNlbGVjdGlvblRyYW5zaXRpb25Ob2RlLnN0ZXAoIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtUcmFuc2l0aW9uTm9kZX1cclxuICAgIHRoaXMubWFpblRyYW5zaXRpb25Ob2RlID0gbmV3IFRyYW5zaXRpb25Ob2RlKCB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSwge1xyXG4gICAgICBjb250ZW50OiB0aGlzLmxldmVsU2VsZWN0aW9uTGF5ZXIsXHJcbiAgICAgIGNhY2hlZE5vZGVzOiBbIHRoaXMubGV2ZWxTZWxlY3Rpb25MYXllciBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbGVmdEJ1dHRvbk9wdGlvbnMgPSB7XHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogU0lERV9NQVJHSU4sXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogU0lERV9NQVJHSU4gLyAyXHJcbiAgICB9O1xyXG4gICAgY29uc3QgY2hhbGxlbmdlQ29udHJvbEJveCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IFNJREVfTUFSR0lOLFxyXG4gICAgICB0b3A6IHRoaXMubGF5b3V0Qm91bmRzLnRvcCArIFNJREVfTUFSR0lOLFxyXG4gICAgICBsZWZ0OiB0aGlzLmxheW91dEJvdW5kcy5sZWZ0ICsgU0lERV9NQVJHSU4sXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IEJhY2tCdXR0b24oIG1lcmdlKCB7XHJcbiAgICAgICAgICBsaXN0ZW5lcigpIHtcclxuICAgICAgICAgICAgbW9kZWwubGV2ZWxQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgbGVmdEJ1dHRvbk9wdGlvbnMgKSApLFxyXG4gICAgICAgIG5ldyBSZWZyZXNoQnV0dG9uKCBtZXJnZSgge1xyXG4gICAgICAgICAgaWNvbkhlaWdodDogMjcsXHJcbiAgICAgICAgICB4TWFyZ2luOiA5LFxyXG4gICAgICAgICAgeU1hcmdpbjogNyxcclxuICAgICAgICAgIGxpc3RlbmVyKCkge1xyXG4gICAgICAgICAgICBtb2RlbC5sZXZlbFByb3BlcnR5LnZhbHVlICYmIG1vZGVsLmxldmVsUHJvcGVydHkudmFsdWUucmVzZXQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCBsZWZ0QnV0dG9uT3B0aW9ucyApICksXHJcbiAgICAgICAgLi4uKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnNob3dBbnN3ZXJzID8gW1xyXG4gICAgICAgICAgbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiggbWVyZ2UoIHtcclxuICAgICAgICAgICAgY29udGVudDogbmV3IEZhY2VOb2RlKCAyNyApLFxyXG4gICAgICAgICAgICBsaXN0ZW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgbW9kZWwuY2hhbGxlbmdlUHJvcGVydHkudmFsdWUuY2hlYXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgbGVmdEJ1dHRvbk9wdGlvbnMgKSApXHJcbiAgICAgICAgXSA6IFtdIClcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIGxldCBsYXN0Q2hhbGxlbmdlTm9kZSA9IG51bGw7XHJcbiAgICBtb2RlbC5jaGFsbGVuZ2VQcm9wZXJ0eS5sYXp5TGluayggKCBjaGFsbGVuZ2UsIG9sZENoYWxsZW5nZSApID0+IHtcclxuICAgICAgY29uc3Qgb2xkQ2hhbGxlbmdlTm9kZSA9IGxhc3RDaGFsbGVuZ2VOb2RlO1xyXG5cclxuICAgICAgaWYgKCBvbGRDaGFsbGVuZ2VOb2RlICkge1xyXG4gICAgICAgIG9sZENoYWxsZW5nZU5vZGUuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxhc3RDaGFsbGVuZ2VOb2RlID0gbnVsbDtcclxuICAgICAgbGV0IHRyYW5zaXRpb247XHJcbiAgICAgIGlmICggY2hhbGxlbmdlICkge1xyXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZnJhY3Rpb25zLWNvbW1vbi9pc3N1ZXMvNDNcclxuICAgICAgICBjaGFsbGVuZ2Uuc2VsZWN0UHJldmlvdXNseVNlbGVjdGVkR3JvdXAoKTtcclxuXHJcbiAgICAgICAgY29uc3QgYWxsTGV2ZWxzQ29tcGxldGVQcm9wZXJ0eSA9IG1vZGVsLmxldmVsQ29tbXBsZXRlUHJvcGVydHlNYXAuZ2V0KCBjaGFsbGVuZ2UuaGFzU2hhcGVzID8gQnVpbGRpbmdUeXBlLlNIQVBFIDogQnVpbGRpbmdUeXBlLk5VTUJFUiApO1xyXG5cclxuICAgICAgICBjb25zdCBjaGFsbGVuZ2VOb2RlID0gbmV3IEZyYWN0aW9uQ2hhbGxlbmdlTm9kZSggY2hhbGxlbmdlLCB0aGlzLmxheW91dEJvdW5kcywgbW9kZWwubmV4dExldmVsLmJpbmQoIG1vZGVsICksIG1vZGVsLmluY29ycmVjdEF0dGVtcHRFbWl0dGVyLCBhbGxMZXZlbHNDb21wbGV0ZVByb3BlcnR5ICk7XHJcbiAgICAgICAgbGFzdENoYWxsZW5nZU5vZGUgPSBjaGFsbGVuZ2VOb2RlO1xyXG4gICAgICAgIGlmICggYWxsTGV2ZWxzQ29tcGxldGVkTm9kZSApIHtcclxuICAgICAgICAgIGFsbExldmVsc0NvbXBsZXRlZE5vZGUuY2VudGVyID0gY2hhbGxlbmdlTm9kZS5jaGFsbGVuZ2VDZW50ZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBc3NpZ24gZWFjaCBjaGFsbGVuZ2Ugbm9kZSB3aXRoIGEgd3JhcHBlciByZWZlcmVuY2UsIHNvIHdlIGNhbiBlYXNpbHkgZGlzcG9zZSBpdC5cclxuICAgICAgICBjaGFsbGVuZ2VOb2RlLndyYXBwZXIgPSBuZXcgTm9kZSgge1xyXG4gICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgY2hhbGxlbmdlQmFja2dyb3VuZCxcclxuICAgICAgICAgICAgY2hhbGxlbmdlQ29udHJvbEJveCxcclxuICAgICAgICAgICAgY2hhbGxlbmdlTm9kZSxcclxuICAgICAgICAgICAgY2hhbGxlbmdlRm9yZWdyb3VuZFxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBpZiAoIG9sZENoYWxsZW5nZSAmJiBvbGRDaGFsbGVuZ2UucmVmcmVzaGVkQ2hhbGxlbmdlID09PSBjaGFsbGVuZ2UgKSB7XHJcbiAgICAgICAgICB0cmFuc2l0aW9uID0gdGhpcy5tYWluVHJhbnNpdGlvbk5vZGUuZGlzc29sdmVUbyggY2hhbGxlbmdlTm9kZS53cmFwcGVyLCB7XHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAwLjYsXHJcbiAgICAgICAgICAgIHRhcmdldE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBlYXNpbmc6IEVhc2luZy5MSU5FQVJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRyYW5zaXRpb24gPSB0aGlzLm1haW5UcmFuc2l0aW9uTm9kZS5zbGlkZUxlZnRUbyggY2hhbGxlbmdlTm9kZS53cmFwcGVyLCBRVUFEUkFUSUNfVFJBTlNJVElPTl9PUFRJT05TICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRyYW5zaXRpb24gPSB0aGlzLm1haW5UcmFuc2l0aW9uTm9kZS5zbGlkZVJpZ2h0VG8oIHRoaXMubGV2ZWxTZWxlY3Rpb25MYXllciwgUVVBRFJBVElDX1RSQU5TSVRJT05fT1BUSU9OUyApO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuZGVsYXlUcmFuc2l0aW9ucyA9IHRydWU7XHJcbiAgICAgIGlmICggb2xkQ2hhbGxlbmdlTm9kZSApIHtcclxuICAgICAgICB0cmFuc2l0aW9uLmVuZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgICAgb2xkQ2hhbGxlbmdlTm9kZS53cmFwcGVyLmRpc3Bvc2UoKTtcclxuICAgICAgICAgIG9sZENoYWxsZW5nZU5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMubWFpblRyYW5zaXRpb25Ob2RlICk7XHJcblxyXG4gICAgY29uc3QgZ2FtZUF1ZGlvUGxheWVyID0gbmV3IEdhbWVBdWRpb1BsYXllcigpO1xyXG5cclxuICAgIC8vIE5vIHVubGlua3MgbmVlZGVkLCBzaW5jZSB0aGUgU2NyZWVuVmlldy9Nb2RlbCBhcmUgcGVybWFuZW50XHJcbiAgICBtb2RlbC5hbGxMZXZlbHNDb21wbGV0ZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IGdhbWVBdWRpb1BsYXllci5nYW1lT3ZlclBlcmZlY3RTY29yZSgpICk7XHJcbiAgICBtb2RlbC5zaW5nbGVMZXZlbENvbXBsZXRlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gZ2FtZUF1ZGlvUGxheWVyLmNoYWxsZW5nZUNvbXBsZXRlKCkgKTtcclxuICAgIG1vZGVsLmNvbGxlY3RlZEdyb3VwRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gZ2FtZUF1ZGlvUGxheWVyLmNvcnJlY3RBbnN3ZXIoKSApO1xyXG4gICAgbW9kZWwuaW5jb3JyZWN0QXR0ZW1wdEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IGdhbWVBdWRpb1BsYXllci53cm9uZ0Fuc3dlcigpICk7XHJcblxyXG4gICAgdGhpcy5sZXZlbFNlbGVjdGlvbkxheWVyLmFkZENoaWxkKCB0aGlzLmxldmVsU2VsZWN0aW9uVHJhbnNpdGlvbk5vZGUgKTtcclxuXHJcbiAgICBjb25zdCBsZXZlbFNlbGVjdGlvbkJ1dHRvblNwYWNpbmcgPSAyMDtcclxuXHJcbiAgICAvLyBCdXR0b25zIHRvIHN3aXRjaCBiZXR3ZWVuIGxldmVsIHNlbGVjdGlvbiBwYWdlc1xyXG4gICAgY29uc3QgbGVmdEJ1dHRvbiA9IG5ldyBSb3VuZEFycm93QnV0dG9uKCB7XHJcbiAgICAgIGJhc2VDb2xvcjogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLnllbGxvd1JvdW5kQXJyb3dCdXR0b25Qcm9wZXJ0eSxcclxuICAgICAgcmFkaXVzOiAyMCxcclxuICAgICAgYXJyb3dSb3RhdGlvbjogLU1hdGguUEkgLyAyLFxyXG4gICAgICBlbmFibGVkUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5sZWZ0TGV2ZWxTZWxlY3Rpb25Qcm9wZXJ0eSBdLCB2YWx1ZSA9PiAhdmFsdWUgKSxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICB0aGlzLmxlZnRMZXZlbFNlbGVjdGlvblByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgcmlnaHRCdXR0b24gPSBuZXcgUm91bmRBcnJvd0J1dHRvbigge1xyXG4gICAgICBiYXNlQ29sb3I6IEZyYWN0aW9uc0NvbW1vbkNvbG9ycy55ZWxsb3dSb3VuZEFycm93QnV0dG9uUHJvcGVydHksXHJcbiAgICAgIHJhZGl1czogMjAsXHJcbiAgICAgIGFycm93Um90YXRpb246IE1hdGguUEkgLyAyLFxyXG4gICAgICBlbmFibGVkUHJvcGVydHk6IHRoaXMubGVmdExldmVsU2VsZWN0aW9uUHJvcGVydHksXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5sZWZ0TGV2ZWxTZWxlY3Rpb25Qcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbGVmdC1yaWdodCB0b3VjaCBhcmVhc1xyXG4gICAgbGVmdEJ1dHRvbi50b3VjaEFyZWEgPSBsZWZ0QnV0dG9uLmJvdW5kcy5kaWxhdGVkWFkoIGxldmVsU2VsZWN0aW9uQnV0dG9uU3BhY2luZyAvIDIsIDEwICk7XHJcbiAgICByaWdodEJ1dHRvbi50b3VjaEFyZWEgPSByaWdodEJ1dHRvbi5ib3VuZHMuZGlsYXRlZFhZKCBsZXZlbFNlbGVjdGlvbkJ1dHRvblNwYWNpbmcgLyAyLCAxMCApO1xyXG5cclxuICAgIGNvbnN0IHNsaWRpbmdMZXZlbFNlbGVjdGlvbk5vZGUgPSBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIGxlZnRCdXR0b24sXHJcbiAgICAgICAgcmlnaHRCdXR0b25cclxuICAgICAgXSxcclxuICAgICAgY2VudGVyWDogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWCxcclxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5ib3R0b20gLSAzMCxcclxuICAgICAgc3BhY2luZzogbGV2ZWxTZWxlY3Rpb25CdXR0b25TcGFjaW5nXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmxldmVsU2VsZWN0aW9uTGF5ZXIuYWRkQ2hpbGQoIHNsaWRpbmdMZXZlbFNlbGVjdGlvbk5vZGUgKTtcclxuXHJcbiAgICBjb25zdCBhbGxMZXZlbHNDb21wbGV0ZWROb2RlID0gbmV3IEFsbExldmVsc0NvbXBsZXRlZE5vZGUoICgpID0+IHtcclxuICAgICAgLy8gR28gYmFjayB0byB0aGUgbGV2ZWwgc2VsZWN0aW9uXHJcbiAgICAgIG1vZGVsLmxldmVsUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgfSwge1xyXG4gICAgICBjZW50ZXI6IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlcixcclxuICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgIH0gKTtcclxuICAgIGNoYWxsZW5nZUZvcmVncm91bmQuYWRkQ2hpbGQoIGFsbExldmVsc0NvbXBsZXRlZE5vZGUgKTtcclxuXHJcbiAgICBtb2RlbC5hbGxMZXZlbHNDb21wbGV0ZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgaWYgKCAhcGxhdGZvcm0ubW9iaWxlU2FmYXJpICkge1xyXG4gICAgICAgIC8vIEBwcml2YXRlIHtSZXdhcmROb2RlfVxyXG4gICAgICAgIHRoaXMucmV3YXJkTm9kZSA9IG5ldyBSZXdhcmROb2RlKCB7XHJcbiAgICAgICAgICBub2RlczogUmV3YXJkTm9kZS5jcmVhdGVSYW5kb21Ob2RlcyggW1xyXG4gICAgICAgICAgICAuLi5fLnRpbWVzKCA3LCAoKSA9PiBuZXcgU3Rhck5vZGUoKSApLFxyXG4gICAgICAgICAgICAuLi5fLnRpbWVzKCA3LCAoKSA9PiBuZXcgRmFjZU5vZGUoIDQwLCB7IGhlYWRTdHJva2U6ICdibGFjaycgfSApICksXHJcbiAgICAgICAgICAgIC4uLl8ucmFuZ2UoIDEsIDEwICkubWFwKCBuID0+IG5ldyBOdW1iZXJQaWVjZU5vZGUoIG5ldyBOdW1iZXJQaWVjZSggbiApICkgKSxcclxuICAgICAgICAgICAgLi4uXy5yYW5nZSggMSwgNSApLm1hcCggbiA9PiBuZXcgU2hhcGVQaWVjZU5vZGUoIG5ldyBTaGFwZVBpZWNlKCBuZXcgRnJhY3Rpb24oIDEsIG4gKSwgQnVpbGRpbmdSZXByZXNlbnRhdGlvbi5QSUUsIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5sYWJQaWVGaWxsUHJvcGVydHkgKSwgeyByb3RhdGlvbjogZG90UmFuZG9tLm5leHREb3VibGUoKSAqIDIgKiBNYXRoLlBJIH0gKSApLFxyXG4gICAgICAgICAgICAuLi5fLnJhbmdlKCAxLCA1ICkubWFwKCBuID0+IG5ldyBTaGFwZVBpZWNlTm9kZSggbmV3IFNoYXBlUGllY2UoIG5ldyBGcmFjdGlvbiggMSwgbiApLCBCdWlsZGluZ1JlcHJlc2VudGF0aW9uLkJBUiwgRnJhY3Rpb25zQ29tbW9uQ29sb3JzLmxhYkJhckZpbGxQcm9wZXJ0eSApICkgKVxyXG4gICAgICAgICAgXSwgMTUwIClcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgY2hhbGxlbmdlQmFja2dyb3VuZC5hZGRDaGlsZCggdGhpcy5yZXdhcmROb2RlICk7XHJcbiAgICAgIH1cclxuICAgICAgYWxsTGV2ZWxzQ29tcGxldGVkTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAgIGNvbnN0IHNjb3JlUHJvcGVydHkgPSBtb2RlbC5sZXZlbFByb3BlcnR5LnZhbHVlLnNjb3JlUHJvcGVydHk7XHJcbiAgICAgIGxldCBmaW5pc2hlZCA9IGZhbHNlO1xyXG4gICAgICBjb25zdCBkb25lTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgLy8gV2UgbmVlZCBhIGd1YXJkIGhlcmUsIHNpbmNlIG90aGVyd2lzZSB0aGUgZG9uZUxpc3RlbmVyIGNvdWxkIHBvdGVudGlhbGx5IGJlIGNhbGxlZCB0d2ljZSBmcm9tIHRoZSBzYW1lXHJcbiAgICAgICAgLy8gZXZlbnQuXHJcbiAgICAgICAgaWYgKCBmaW5pc2hlZCApIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xyXG4gICAgICAgIG1vZGVsLmxldmVsUHJvcGVydHkudW5saW5rKCBkb25lTGlzdGVuZXIgKTtcclxuICAgICAgICBtb2RlbC5jaGFsbGVuZ2VQcm9wZXJ0eS51bmxpbmsoIGRvbmVMaXN0ZW5lciApO1xyXG4gICAgICAgIHNjb3JlUHJvcGVydHkudW5saW5rKCBkb25lTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLnJld2FyZE5vZGUgKSB7XHJcbiAgICAgICAgICB0aGlzLnJld2FyZE5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgdGhpcy5yZXdhcmROb2RlID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgYWxsTGV2ZWxzQ29tcGxldGVkTm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIH07XHJcbiAgICAgIG1vZGVsLmNoYWxsZW5nZVByb3BlcnR5LmxhenlMaW5rKCBkb25lTGlzdGVuZXIgKTtcclxuICAgICAgbW9kZWwubGV2ZWxQcm9wZXJ0eS5sYXp5TGluayggZG9uZUxpc3RlbmVyICk7XHJcbiAgICAgIHNjb3JlUHJvcGVydHkubGF6eUxpbmsoIGRvbmVMaXN0ZW5lciApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgfSxcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gU0lERV9NQVJHSU4sXHJcbiAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gU0lERV9NQVJHSU5cclxuICAgIH0gKTtcclxuICAgIHRoaXMubGV2ZWxTZWxlY3Rpb25MYXllci5hZGRDaGlsZCggcmVzZXRBbGxCdXR0b24gKTtcclxuXHJcbiAgICBwaGV0LmpvaXN0LmRpc3BsYXkuYWRkSW5wdXRMaXN0ZW5lcigge1xyXG4gICAgICBkb3duOiBldmVudCA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2NyZWVuID0gcGhldC5qb2lzdC5zaW0uc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBpZiAoIHNjcmVlbiAmJiBzY3JlZW4udmlldyA9PT0gdGhpcyApIHtcclxuICAgICAgICAgIC8vIEFueSBldmVudCBvbiBhIHNoYXBlIGdyb3VwIHNob3VsZCBoYW5kbGUgaXQuXHJcbiAgICAgICAgICBjb25zdCBjaGFsbGVuZ2UgPSBtb2RlbC5jaGFsbGVuZ2VQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgICAgICBjb25zdCBpc0FjdGl2ZSA9IGxhc3RDaGFsbGVuZ2VOb2RlICYmIGxhc3RDaGFsbGVuZ2VOb2RlLmlzUG9pbnRlckFjdGl2ZSggZXZlbnQucG9pbnRlciApO1xyXG5cclxuICAgICAgICAgIGlmICggY2hhbGxlbmdlICYmICFpc0FjdGl2ZSApIHtcclxuICAgICAgICAgICAgY2hhbGxlbmdlLnNlbGVjdGVkR3JvdXBQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwcyB0aGUgdmlldyBmb3J3YXJkIGluIHRpbWUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcbiAgICB0aGlzLnJld2FyZE5vZGUgJiYgdGhpcy5yZXdhcmROb2RlLnZpc2libGUgJiYgdGhpcy5yZXdhcmROb2RlLnN0ZXAoIGR0ICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLmRlbGF5VHJhbnNpdGlvbnMgKSB7XHJcbiAgICAgIHRoaXMuZGVsYXlUcmFuc2l0aW9ucyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMubGV2ZWxTZWxlY3Rpb25UcmFuc2l0aW9uTm9kZS5zdGVwKCBkdCApO1xyXG4gICAgICB0aGlzLm1haW5UcmFuc2l0aW9uTm9kZS5zdGVwKCBkdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSB2aWV3IHBvcnRpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5sZWZ0TGV2ZWxTZWxlY3Rpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIC8vIFwiSW5zdGFudGx5XCIgY29tcGxldGUgYW5pbWF0aW9uc1xyXG4gICAgdGhpcy5sZXZlbFNlbGVjdGlvblRyYW5zaXRpb25Ob2RlLnN0ZXAoIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApO1xyXG4gICAgdGhpcy5tYWluVHJhbnNpdGlvbk5vZGUuc3RlcCggTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcm93IG9mIGxldmVsIHNlbGVjdGlvbiBidXR0b25zLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxGcmFjdGlvbkxldmVsPn0gbGV2ZWxzXHJcbiAgICogQHBhcmFtIHtBcnJheS48Tm9kZT59IGljb25zXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICovXHJcbiAgY3JlYXRlTGV2ZWxSb3coIGxldmVscywgaWNvbnMgKSB7XHJcbiAgICByZXR1cm4gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IGxldmVscy5tYXAoICggbGV2ZWwsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9IG5ldyBMZXZlbFNlbGVjdGlvbkJ1dHRvbiggaWNvbnNbIGluZGV4IF0sIGxldmVsLnNjb3JlUHJvcGVydHksIHtcclxuICAgICAgICAgIGJ1dHRvbldpZHRoOiAxMTAsXHJcbiAgICAgICAgICBidXR0b25IZWlnaHQ6IDIwMCxcclxuICAgICAgICAgIGNyZWF0ZVNjb3JlRGlzcGxheTogc2NvcmVQcm9wZXJ0eSA9PiBuZXcgU2NvcmVEaXNwbGF5U3RhcnMoIHNjb3JlUHJvcGVydHksIHtcclxuICAgICAgICAgICAgbnVtYmVyT2ZTdGFyczogbGV2ZWwubnVtVGFyZ2V0cyxcclxuICAgICAgICAgICAgcGVyZmVjdFNjb3JlOiBsZXZlbC5udW1UYXJnZXRzXHJcbiAgICAgICAgICB9ICksXHJcbiAgICAgICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmxldmVsUHJvcGVydHkudmFsdWUgPSBsZXZlbDtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzb3VuZFBsYXllckluZGV4OiBsZXZlbC5udW1iZXIgLSAxXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIGJ1dHRvbi50b3VjaEFyZWEgPSBidXR0b24ubG9jYWxCb3VuZHMuZGlsYXRlZCggTEVWRUxfU0VMRUNUSU9OX1NQQUNJTkcgLyAyICk7XHJcbiAgICAgICAgcmV0dXJuIGJ1dHRvbjtcclxuICAgICAgfSApLFxyXG4gICAgICBzcGFjaW5nOiBMRVZFTF9TRUxFQ1RJT05fU1BBQ0lOR1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIFwicGFnZVwiIG9mIGxldmVsIHNlbGVjdGlvbiBidXR0b25zLCB3aXRoIGEgc2xpY2Ugb2Ygc2hhcGUgbGV2ZWxzIG9uIHRvcCBhbmQgYSBzbGljZSBvZiBudW1iZXIgbGV2ZWxzXHJcbiAgICogb24gYm90dG9tLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWluSW5kZXggLSBUaGUgbWluaW11bSBpbmRleCBvZiBsZXZlbHMgdG8gaW5jbHVkZSAoaW5jbHVzaXZlKVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhJbmRleCAtIFRoZSBtYXhpbXVtIGluZGV4IG9mIGxldmVscyB0byBpbmNsdWRlIChpbmNsdXNpdmUpXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICovXHJcbiAgY3JlYXRlTGV2ZWxTZWN0aW9uKCBtaW5JbmRleCwgbWF4SW5kZXggKSB7XHJcbiAgICByZXR1cm4gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgVkJveCgge1xyXG4gICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVMZXZlbFJvdyggdGhpcy5tb2RlbC5zaGFwZUxldmVscy5zbGljZSggbWluSW5kZXgsIG1heEluZGV4ICsgMSApLCB0aGlzLnNoYXBlSWNvbnMuc2xpY2UoIG1pbkluZGV4LCBtYXhJbmRleCArIDEgKSApLFxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUxldmVsUm93KCB0aGlzLm1vZGVsLm51bWJlckxldmVscy5zbGljZSggbWluSW5kZXgsIG1heEluZGV4ICsgMSApLCB0aGlzLm51bWJlckljb25zLnNsaWNlKCBtaW5JbmRleCwgbWF4SW5kZXggKyAxICkgKVxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIHNwYWNpbmc6IExFVkVMX1NFTEVDVElPTl9TUEFDSU5HLFxyXG4gICAgICAgICAgY2VudGVyOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJcclxuICAgICAgICB9IClcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgbGV2ZWwgaWNvbiBmb3IgdGhlIGdpdmVuIGxldmVsLiBUaGlzIGlzIHBhc3NlZCBpbnRvIExldmVsU2VsZWN0aW9uQnV0dG9uIGFzIHRoZSBpY29uLCBhbmQgaW4gb3VyIGNhc2VcclxuICAgKiBpbmNsdWRlcyB0ZXh0IGFib3V0IHdoYXQgbGV2ZWwgbnVtYmVyIGl0IGlzLCBpbiBhZGRpdGlvbiB0byB0aGUgaWNvbiBncmFwaGljLiBXZSBuZWVkIHRvIGhhbmRsZSB0aGlzIGFuZCBwcm92aWRlXHJcbiAgICogc2FtZS1ib3VuZHMgXCJpY29uc1wiIGZvciBldmVyeSBidXR0b24gc2luY2UgTGV2ZWxTZWxlY3Rpb25CdXR0b24gc3RpbGwgcmVzaXplcyB0aGUgaWNvbiBiYXNlZCBvbiBpdHMgYm91bmRzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0ZyYWN0aW9uTGV2ZWx9IGxldmVsXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBoYXNNaXhlZE51bWJlcnNcclxuICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlTGV2ZWxJY29uKCBsZXZlbCwgaGFzTWl4ZWROdW1iZXJzICkge1xyXG4gICAgY29uc3QgbGFiZWwgPSBuZXcgVGV4dCggU3RyaW5nVXRpbHMuZmlsbEluKCBsZXZlbFRpdGxlUGF0dGVyblN0cmluZywge1xyXG4gICAgICBudW1iZXI6IGxldmVsLm51bWJlclxyXG4gICAgfSApLCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTggKSxcclxuICAgICAgbWF4V2lkdGg6IElDT05fREVTSUdOX0JPVU5EUy53aWR0aFxyXG4gICAgfSApO1xyXG5cclxuICAgIGxldCBpY29uO1xyXG4gICAgaWYgKCBsZXZlbC5idWlsZGluZ1R5cGUgPT09IEJ1aWxkaW5nVHlwZS5OVU1CRVIgKSB7XHJcbiAgICAgIGlmICggIWhhc01peGVkTnVtYmVycyApIHtcclxuICAgICAgICBjb25zdCBzdGFjayA9IG5ldyBOdW1iZXJTdGFjayggbGV2ZWwubnVtYmVyLCBsZXZlbC5udW1iZXIgKTtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZXZlbC5udW1iZXI7IGkrKyApIHtcclxuICAgICAgICAgIHN0YWNrLm51bWJlclBpZWNlcy5wdXNoKCBuZXcgTnVtYmVyUGllY2UoIGxldmVsLm51bWJlciApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGljb24gPSBuZXcgTnVtYmVyU3RhY2tOb2RlKCBzdGFjaywge1xyXG4gICAgICAgICAgc2NhbGU6IDAuNzVcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29uc3QgaGFzRnJhY3Rpb24gPSBsZXZlbC5udW1iZXIgPiAxO1xyXG4gICAgICAgIGljb24gPSBuZXcgTWl4ZWRGcmFjdGlvbk5vZGUoIHtcclxuICAgICAgICAgIHdob2xlOiBsZXZlbC5udW1iZXIsXHJcbiAgICAgICAgICBudW1lcmF0b3I6IGhhc0ZyYWN0aW9uID8gMSA6IG51bGwsXHJcbiAgICAgICAgICBkZW5vbWluYXRvcjogaGFzRnJhY3Rpb24gPyBsZXZlbC5udW1iZXIgOiBudWxsLFxyXG4gICAgICAgICAgc2NhbGU6IDAuOVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIHVubWl4ZWQgbWF4IHdpZHRoIH4xMDYsIG1peGVkIH4yMTdcclxuICAgICAgbGV0IHNoYXBlUGFydGl0aW9uID0gTEVWRUxfU0hBUEVfUEFSVElUSU9OU1sgbGV2ZWwubnVtYmVyIC0gMSBdO1xyXG4gICAgICAvLyBUaGVyZSdzIGEgZGlmZmVyZW50IHNoYXBlIGZvciBub24tbWl4ZWQgbGV2ZWwgMTBcclxuICAgICAgaWYgKCBsZXZlbC5udW1iZXIgPT09IDEwICYmICFoYXNNaXhlZE51bWJlcnMgKSB7XHJcbiAgICAgICAgc2hhcGVQYXJ0aXRpb24gPSBzZWxlY3QoIFNoYXBlUGFydGl0aW9uLkRJQUdPTkFMX0xTLCAxMCApO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGZpbGxlZFBhcnRpdGlvbnMgPSBbXHJcbiAgICAgICAgbmV3IEZpbGxlZFBhcnRpdGlvbiggc2hhcGVQYXJ0aXRpb24sIF8udGltZXMoIGxldmVsLm51bWJlciwgKCkgPT4gdHJ1ZSApLCBsZXZlbC5jb2xvciApLFxyXG4gICAgICAgIC4uLiggKCBoYXNNaXhlZE51bWJlcnMgJiYgbGV2ZWwubnVtYmVyID4gMSApID8gW1xyXG4gICAgICAgICAgbmV3IEZpbGxlZFBhcnRpdGlvbiggc2hhcGVQYXJ0aXRpb24sIFsgdHJ1ZSwgLi4uXy50aW1lcyggbGV2ZWwubnVtYmVyIC0gMSwgKCkgPT4gZmFsc2UgKSBdLCBsZXZlbC5jb2xvciApXHJcbiAgICAgICAgXSA6IFtdIClcclxuICAgICAgXTtcclxuICAgICAgaWNvbiA9IG5ldyBIQm94KCB7XHJcbiAgICAgICAgc3BhY2luZzogNSxcclxuICAgICAgICBjaGlsZHJlbjogZmlsbGVkUGFydGl0aW9ucy5tYXAoIGZpbGxlZFBhcnRpdGlvbiA9PiBuZXcgRmlsbGVkUGFydGl0aW9uTm9kZSggZmlsbGVkUGFydGl0aW9uICkgKSxcclxuICAgICAgICBzY2FsZTogaGFzTWl4ZWROdW1iZXJzID8gMC40IDogMC44XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBsYWJlbC5jZW50ZXJYID0gSUNPTl9ERVNJR05fQk9VTkRTLmNlbnRlclg7XHJcbiAgICBsYWJlbC50b3AgPSBJQ09OX0RFU0lHTl9CT1VORFMudG9wO1xyXG5cclxuICAgIGNvbnN0IGljb25Db250YWluZXIgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBpY29uIF0sXHJcbiAgICAgIG1heFdpZHRoOiBJQ09OX0RFU0lHTl9CT1VORFMud2lkdGhcclxuICAgIH0gKTtcclxuXHJcbiAgICBpY29uQ29udGFpbmVyLmNlbnRlclggPSBJQ09OX0RFU0lHTl9CT1VORFMuY2VudGVyWDtcclxuICAgIGljb25Db250YWluZXIuY2VudGVyWSA9ICggbGFiZWwuYm90dG9tICsgSUNPTl9ERVNJR05fQk9VTkRTLmJvdHRvbSApIC8gMjtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBJQ09OX0RFU0lHTl9CT1VORFMuY29udGFpbnNCb3VuZHMoIGxhYmVsLmJvdW5kcyApLCAnU2FuaXR5IGNoZWNrIGZvciBsZXZlbCBpY29uIGxheW91dCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIElDT05fREVTSUdOX0JPVU5EUy5jb250YWluc0JvdW5kcyggaWNvbkNvbnRhaW5lci5ib3VuZHMgKSwgJ1Nhbml0eSBjaGVjayBmb3IgbGV2ZWwgaWNvbiBsYXlvdXQnICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGxhYmVsLCBpY29uQ29udGFpbmVyIF0sXHJcbiAgICAgIGxvY2FsQm91bmRzOiBJQ09OX0RFU0lHTl9CT1VORFNcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGljb24gZm9yIHRoZSB1bm1peGVkIGdhbWUgc2NyZWVucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlVW5taXhlZFNjcmVlbkljb24oKSB7XHJcblxyXG4gICAgY29uc3Qgc2hhcGVHcm91cCA9IG5ldyBTaGFwZUdyb3VwKCBCdWlsZGluZ1JlcHJlc2VudGF0aW9uLkJBUiApO1xyXG4gICAgc2hhcGVHcm91cC5wYXJ0aXRpb25EZW5vbWluYXRvclByb3BlcnR5LnZhbHVlID0gMztcclxuXHJcbiAgICBzaGFwZUdyb3VwLnNoYXBlQ29udGFpbmVycy5nZXQoIDAgKS5zaGFwZVBpZWNlcy5wdXNoKCBuZXcgU2hhcGVQaWVjZSggbmV3IEZyYWN0aW9uKCAxLCAzICksIEJ1aWxkaW5nUmVwcmVzZW50YXRpb24uQkFSLCBGcmFjdGlvbnNDb21tb25Db2xvcnMuc2hhcGVCbHVlUHJvcGVydHkgKSApO1xyXG5cclxuICAgIGNvbnN0IHNoYXBlR3JvdXBOb2RlID0gbmV3IFNoYXBlR3JvdXBOb2RlKCBzaGFwZUdyb3VwLCB7XHJcbiAgICAgIGhhc0J1dHRvbnM6IGZhbHNlLFxyXG4gICAgICBpc0ljb246IHRydWUsXHJcbiAgICAgIHBvc2l0aW9uZWQ6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZXF1YWxzVGV4dCA9IG5ldyBUZXh0KCBNYXRoU3ltYm9scy5FUVVBTF9UTywgeyBmb250OiBuZXcgUGhldEZvbnQoIDMwICkgfSApO1xyXG5cclxuICAgIGNvbnN0IGZyYWN0aW9uTm9kZSA9IG5ldyBNaXhlZEZyYWN0aW9uTm9kZSgge1xyXG4gICAgICBudW1lcmF0b3I6IDEsXHJcbiAgICAgIGRlbm9taW5hdG9yOiAzLFxyXG4gICAgICBzY2FsZTogMS41XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIEZyYWN0aW9uc0NvbW1vbkdsb2JhbHMud3JhcEljb24oIG5ldyBIQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIHNoYXBlR3JvdXBOb2RlLFxyXG4gICAgICAgIGVxdWFsc1RleHQsXHJcbiAgICAgICAgZnJhY3Rpb25Ob2RlXHJcbiAgICAgIF0sXHJcbiAgICAgIHNjYWxlOiAyLjNcclxuICAgIH0gKSwgRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm90aGVyU2NyZWVuQmFja2dyb3VuZFByb3BlcnR5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBpY29uIGZvciB0aGUgbWl4ZWQgZ2FtZSBzY3JlZW5zLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtOb2RlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVNaXhlZFNjcmVlbkljb24oKSB7XHJcbiAgICBjb25zdCBmcmFjdGlvbk5vZGUgPSBuZXcgTWl4ZWRGcmFjdGlvbk5vZGUoIHtcclxuICAgICAgd2hvbGU6IDEsXHJcbiAgICAgIG51bWVyYXRvcjogMixcclxuICAgICAgZGVub21pbmF0b3I6IDMsXHJcbiAgICAgIHNjYWxlOiAxLjVcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBlcXVhbHNUZXh0ID0gbmV3IFRleHQoIE1hdGhTeW1ib2xzLkVRVUFMX1RPLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMzAgKSB9ICk7XHJcblxyXG4gICAgY29uc3QgcmlnaHRTaWRlID0gbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogNSxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgRmlsbGVkUGFydGl0aW9uTm9kZSggbmV3IEZpbGxlZFBhcnRpdGlvbiggU2hhcGVQYXJ0aXRpb24uU0lYX0ZMT1dFUiwgWyB0cnVlLCB0cnVlLCB0cnVlLCB0cnVlLCB0cnVlLCB0cnVlIF0sIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5zaGFwZUJsdWVQcm9wZXJ0eSApICksXHJcbiAgICAgICAgbmV3IEZpbGxlZFBhcnRpdGlvbk5vZGUoIG5ldyBGaWxsZWRQYXJ0aXRpb24oIFNoYXBlUGFydGl0aW9uLlNJWF9GTE9XRVIsIFsgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UsIGZhbHNlIF0sIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5zaGFwZUJsdWVQcm9wZXJ0eSApIClcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBGcmFjdGlvbnNDb21tb25HbG9iYWxzLndyYXBJY29uKCBuZXcgSEJveCgge1xyXG4gICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBmcmFjdGlvbk5vZGUsXHJcbiAgICAgICAgZXF1YWxzVGV4dCxcclxuICAgICAgICByaWdodFNpZGVcclxuICAgICAgXSxcclxuICAgICAgc2NhbGU6IDEuN1xyXG4gICAgfSApLCBGcmFjdGlvbnNDb21tb25Db2xvcnMub3RoZXJTY3JlZW5CYWNrZ3JvdW5kUHJvcGVydHkgKTtcclxuICB9XHJcbn1cclxuXHJcbmZyYWN0aW9uc0NvbW1vbi5yZWdpc3RlciggJ0J1aWxkaW5nR2FtZVNjcmVlblZpZXcnLCBCdWlsZGluZ0dhbWVTY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJ1aWxkaW5nR2FtZVNjcmVlblZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsT0FBT0MsUUFBUSxNQUFNLDZDQUE2QztBQUNsRSxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLE9BQU9DLFVBQVUsTUFBTSxtREFBbUQ7QUFDMUUsT0FBT0MsYUFBYSxNQUFNLHNEQUFzRDtBQUNoRixPQUFPQyxjQUFjLE1BQU0sdURBQXVEO0FBQ2xGLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxpQkFBaUIsTUFBTSxrREFBa0Q7QUFDaEYsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDMUUsT0FBT0MscUJBQXFCLE1BQU0scURBQXFEO0FBQ3ZGLE9BQU9DLE1BQU0sTUFBTSxnQ0FBZ0M7QUFDbkQsT0FBT0MsY0FBYyxNQUFNLHdDQUF3QztBQUNuRSxPQUFPQyxzQkFBc0IsTUFBTSxnREFBZ0Q7QUFDbkYsT0FBT0MsZUFBZSxNQUFNLHlDQUF5QztBQUNyRSxPQUFPQyxvQkFBb0IsTUFBTSw4Q0FBOEM7QUFDL0UsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxPQUFPQyxpQkFBaUIsTUFBTSwyQ0FBMkM7QUFDekUsT0FBT0MsWUFBWSxNQUFNLHNDQUFzQztBQUMvRCxPQUFPQyxzQkFBc0IsTUFBTSxnREFBZ0Q7QUFDbkYsT0FBT0MsWUFBWSxNQUFNLHNDQUFzQztBQUMvRCxPQUFPQyxXQUFXLE1BQU0scUNBQXFDO0FBQzdELE9BQU9DLFdBQVcsTUFBTSxxQ0FBcUM7QUFDN0QsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0Msc0JBQXNCLE1BQU0sd0NBQXdDO0FBQzNFLE9BQU9DLHFCQUFxQixNQUFNLDRDQUE0QztBQUM5RSxPQUFPQyxnQkFBZ0IsTUFBTSx1Q0FBdUM7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxzQkFBc0IsTUFBTSxpQ0FBaUM7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLDZCQUE2QjtBQUN6RCxPQUFPQyxjQUFjLE1BQU0sNEJBQTRCO0FBQ3ZELE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjtBQUMxRCxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7QUFFOUQsTUFBTUMscUJBQXFCLEdBQUdwQixZQUFZLENBQUNxQixlQUFlO0FBQzFELE1BQU1DLHVCQUF1QixHQUFHUCxzQkFBc0IsQ0FBQ1EsaUJBQWlCOztBQUV4RTtBQUNBLE1BQU1DLHVCQUF1QixHQUFHLEVBQUU7QUFDbEMsTUFBTUMsV0FBVyxHQUFHLEVBQUU7QUFDdEIsTUFBTUMsTUFBTSxHQUFHQSxDQUFFQyxlQUFlLEVBQUVDLFFBQVEsS0FBTTtFQUM5QyxPQUFPQyxDQUFDLENBQUNDLElBQUksQ0FBRUgsZUFBZSxFQUFFSSxjQUFjLElBQUlBLGNBQWMsQ0FBQ0MsTUFBTSxLQUFLSixRQUFTLENBQUM7QUFDeEYsQ0FBQztBQUNELE1BQU1LLHNCQUFzQixHQUFHLENBQzdCUCxNQUFNLENBQUVULGNBQWMsQ0FBQ2lCLElBQUksRUFBRSxDQUFFLENBQUMsRUFDaENSLE1BQU0sQ0FBRVQsY0FBYyxDQUFDa0IsYUFBYSxFQUFFLENBQUUsQ0FBQyxFQUN6Q1QsTUFBTSxDQUFFVCxjQUFjLENBQUNtQixRQUFRLEVBQUUsQ0FBRSxDQUFDLEVBQ3BDVixNQUFNLENBQUVULGNBQWMsQ0FBQ21CLFFBQVEsRUFBRSxDQUFFLENBQUMsRUFDcENWLE1BQU0sQ0FBRVQsY0FBYyxDQUFDbUIsUUFBUSxFQUFFLENBQUUsQ0FBQyxFQUNwQ25CLGNBQWMsQ0FBQ29CLFVBQVUsRUFDekJwQixjQUFjLENBQUNxQixRQUFRLEVBQ3ZCckIsY0FBYyxDQUFDc0IsVUFBVSxFQUN6QmIsTUFBTSxDQUFFVCxjQUFjLENBQUN1QixLQUFLLEVBQUUsQ0FBRSxDQUFDLEVBQ2pDdkIsY0FBYyxDQUFDd0IsVUFBVSxDQUMxQjtBQUNELE1BQU1DLGtCQUFrQixHQUFHLElBQUlyRSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBSSxDQUFDO0FBQ3ZELE1BQU1zRSw0QkFBNEIsR0FBRztFQUNuQ0MsUUFBUSxFQUFFLEdBQUc7RUFDYkMsYUFBYSxFQUFFO0lBQ2JDLE1BQU0sRUFBRXJELE1BQU0sQ0FBQ3NEO0VBQ2pCO0FBQ0YsQ0FBQztBQUVELE1BQU1DLHNCQUFzQixTQUFTekUsVUFBVSxDQUFDO0VBQzlDO0FBQ0Y7QUFDQTtFQUNFMEUsV0FBV0EsQ0FBRUMsS0FBSyxFQUFHO0lBQ25CLEtBQUssQ0FBQyxDQUFDOztJQUVQO0lBQ0EsSUFBSSxDQUFDQSxLQUFLLEdBQUdBLEtBQUs7O0lBRWxCO0lBQ0EsSUFBSSxDQUFDQyxVQUFVLEdBQUcsSUFBSSxDQUFDRCxLQUFLLENBQUNFLFdBQVcsQ0FBQ0MsR0FBRyxDQUFFQyxLQUFLLElBQUlOLHNCQUFzQixDQUFDTyxlQUFlLENBQUVELEtBQUssRUFBRUosS0FBSyxDQUFDTSxlQUFnQixDQUFFLENBQUM7SUFDL0gsSUFBSSxDQUFDQyxXQUFXLEdBQUcsSUFBSSxDQUFDUCxLQUFLLENBQUNRLFlBQVksQ0FBQ0wsR0FBRyxDQUFFQyxLQUFLLElBQUlOLHNCQUFzQixDQUFDTyxlQUFlLENBQUVELEtBQUssRUFBRUosS0FBSyxDQUFDTSxlQUFnQixDQUFFLENBQUM7SUFFakksTUFBTUcsc0JBQXNCLEdBQUcsSUFBSSxDQUFDQyxrQkFBa0IsQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0lBQzlELE1BQU1DLHVCQUF1QixHQUFHLElBQUksQ0FBQ0Qsa0JBQWtCLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQzs7SUFFL0Q7SUFDQSxJQUFJLENBQUNFLDBCQUEwQixHQUFHLElBQUkzRixlQUFlLENBQUUsSUFBSyxDQUFDOztJQUU3RDtJQUNBLElBQUksQ0FBQzRGLG1CQUFtQixHQUFHLElBQUkxRSxJQUFJLENBQUMsQ0FBQztJQUVyQyxJQUFJLENBQUMwRSxtQkFBbUIsQ0FBQ0MsUUFBUSxDQUFFLElBQUkxRSxJQUFJLENBQUU4QixxQkFBcUIsRUFBRTtNQUNsRTZDLE9BQU8sRUFBRSxJQUFJLENBQUNDLFlBQVksQ0FBQ0QsT0FBTztNQUNsQ0UsR0FBRyxFQUFFLElBQUksQ0FBQ0QsWUFBWSxDQUFDQyxHQUFHLEdBQUcsRUFBRTtNQUMvQkMsSUFBSSxFQUFFLElBQUlsRixRQUFRLENBQUUsRUFBRztJQUN6QixDQUFFLENBQUUsQ0FBQztJQUVMLE1BQU1tRixtQkFBbUIsR0FBRyxJQUFJaEYsSUFBSSxDQUFDLENBQUM7SUFDdEMsTUFBTWlGLG1CQUFtQixHQUFHLElBQUlqRixJQUFJLENBQUMsQ0FBQzs7SUFFdEM7SUFDQTtJQUNBLElBQUksQ0FBQ2tGLGdCQUFnQixHQUFHLEtBQUs7O0lBRTdCO0lBQ0EsSUFBSSxDQUFDQyw0QkFBNEIsR0FBRyxJQUFJOUUsY0FBYyxDQUFFLElBQUksQ0FBQytFLHFCQUFxQixFQUFFO01BQ2xGQyxPQUFPLEVBQUVmLHNCQUFzQjtNQUMvQmdCLFdBQVcsRUFBRSxDQUFFaEIsc0JBQXNCLEVBQUVFLHVCQUF1QjtJQUNoRSxDQUFFLENBQUM7SUFDSDtJQUNBLElBQUksQ0FBQ0MsMEJBQTBCLENBQUNjLFFBQVEsQ0FBRUMsTUFBTSxJQUFJO01BQ2xELElBQUtBLE1BQU0sRUFBRztRQUNaLElBQUksQ0FBQ0wsNEJBQTRCLENBQUNNLFlBQVksQ0FBRW5CLHNCQUFzQixFQUFFaEIsNEJBQTZCLENBQUM7TUFDeEcsQ0FBQyxNQUNJO1FBQ0gsSUFBSSxDQUFDNkIsNEJBQTRCLENBQUNPLFdBQVcsQ0FBRWxCLHVCQUF1QixFQUFFbEIsNEJBQTZCLENBQUM7TUFDeEc7TUFDQSxJQUFJLENBQUM0QixnQkFBZ0IsR0FBRyxJQUFJO0lBQzlCLENBQUUsQ0FBQzs7SUFFSDtJQUNBO0lBQ0FyQixLQUFLLENBQUM4QixpQkFBaUIsQ0FBQ0osUUFBUSxDQUFFSyxTQUFTLElBQUk7TUFDN0MsSUFBS0EsU0FBUyxFQUFHO1FBQ2YsTUFBTUMsV0FBVyxHQUFHRCxTQUFTLENBQUNFLFdBQVcsSUFBSSxDQUFDO1FBQzlDLElBQUssSUFBSSxDQUFDckIsMEJBQTBCLENBQUNzQixLQUFLLEtBQUtGLFdBQVcsRUFBRztVQUMzRCxJQUFJLENBQUNwQiwwQkFBMEIsQ0FBQ3NCLEtBQUssR0FBR0YsV0FBVztVQUNuRCxJQUFJLENBQUNWLDRCQUE0QixDQUFDYSxJQUFJLENBQUVDLE1BQU0sQ0FBQ0MsaUJBQWtCLENBQUM7UUFDcEU7TUFDRjtJQUNGLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUcsSUFBSTlGLGNBQWMsQ0FBRSxJQUFJLENBQUMrRSxxQkFBcUIsRUFBRTtNQUN4RUMsT0FBTyxFQUFFLElBQUksQ0FBQ1gsbUJBQW1CO01BQ2pDWSxXQUFXLEVBQUUsQ0FBRSxJQUFJLENBQUNaLG1CQUFtQjtJQUN6QyxDQUFFLENBQUM7SUFFSCxNQUFNMEIsaUJBQWlCLEdBQUc7TUFDeEJDLGtCQUFrQixFQUFFakUsV0FBVztNQUMvQmtFLGtCQUFrQixFQUFFbEUsV0FBVyxHQUFHO0lBQ3BDLENBQUM7SUFDRCxNQUFNbUUsbUJBQW1CLEdBQUcsSUFBSXJHLElBQUksQ0FBRTtNQUNwQ3NHLE9BQU8sRUFBRXBFLFdBQVc7TUFDcEIwQyxHQUFHLEVBQUUsSUFBSSxDQUFDRCxZQUFZLENBQUNDLEdBQUcsR0FBRzFDLFdBQVc7TUFDeENxRSxJQUFJLEVBQUUsSUFBSSxDQUFDNUIsWUFBWSxDQUFDNEIsSUFBSSxHQUFHckUsV0FBVztNQUMxQ3NFLFFBQVEsRUFBRSxDQUNSLElBQUluSCxVQUFVLENBQUVKLEtBQUssQ0FBRTtRQUNyQndILFFBQVFBLENBQUEsRUFBRztVQUNUOUMsS0FBSyxDQUFDK0MsYUFBYSxDQUFDYixLQUFLLEdBQUcsSUFBSTtRQUNsQztNQUNGLENBQUMsRUFBRUssaUJBQWtCLENBQUUsQ0FBQyxFQUN4QixJQUFJNUcsYUFBYSxDQUFFTCxLQUFLLENBQUU7UUFDeEIwSCxVQUFVLEVBQUUsRUFBRTtRQUNkQyxPQUFPLEVBQUUsQ0FBQztRQUNWQyxPQUFPLEVBQUUsQ0FBQztRQUNWSixRQUFRQSxDQUFBLEVBQUc7VUFDVDlDLEtBQUssQ0FBQytDLGFBQWEsQ0FBQ2IsS0FBSyxJQUFJbEMsS0FBSyxDQUFDK0MsYUFBYSxDQUFDYixLQUFLLENBQUNpQixLQUFLLENBQUMsQ0FBQztRQUNoRTtNQUNGLENBQUMsRUFBRVosaUJBQWtCLENBQUUsQ0FBQyxFQUN4QixJQUFLYSxJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsZUFBZSxDQUFDQyxXQUFXLEdBQUcsQ0FDOUMsSUFBSWpILHFCQUFxQixDQUFFaEIsS0FBSyxDQUFFO1FBQ2hDa0csT0FBTyxFQUFFLElBQUkzRixRQUFRLENBQUUsRUFBRyxDQUFDO1FBQzNCaUgsUUFBUSxFQUFFLFNBQUFBLENBQUEsRUFBVztVQUNuQjlDLEtBQUssQ0FBQzhCLGlCQUFpQixDQUFDSSxLQUFLLENBQUNzQixLQUFLLENBQUMsQ0FBQztRQUN2QztNQUNGLENBQUMsRUFBRWpCLGlCQUFrQixDQUFFLENBQUMsQ0FDekIsR0FBRyxFQUFFLENBQUU7SUFFWixDQUFFLENBQUM7SUFFSCxJQUFJa0IsaUJBQWlCLEdBQUcsSUFBSTtJQUM1QnpELEtBQUssQ0FBQzhCLGlCQUFpQixDQUFDSixRQUFRLENBQUUsQ0FBRUssU0FBUyxFQUFFMkIsWUFBWSxLQUFNO01BQy9ELE1BQU1DLGdCQUFnQixHQUFHRixpQkFBaUI7TUFFMUMsSUFBS0UsZ0JBQWdCLEVBQUc7UUFDdEJBLGdCQUFnQixDQUFDQyxxQkFBcUIsQ0FBQyxDQUFDO01BQzFDO01BRUFILGlCQUFpQixHQUFHLElBQUk7TUFDeEIsSUFBSUksVUFBVTtNQUNkLElBQUs5QixTQUFTLEVBQUc7UUFDZjtRQUNBQSxTQUFTLENBQUMrQiw2QkFBNkIsQ0FBQyxDQUFDO1FBRXpDLE1BQU1DLHlCQUF5QixHQUFHL0QsS0FBSyxDQUFDZ0UseUJBQXlCLENBQUNDLEdBQUcsQ0FBRWxDLFNBQVMsQ0FBQ21DLFNBQVMsR0FBR2xILFlBQVksQ0FBQ21ILEtBQUssR0FBR25ILFlBQVksQ0FBQ29ILE1BQU8sQ0FBQztRQUV2SSxNQUFNQyxhQUFhLEdBQUcsSUFBSXBHLHFCQUFxQixDQUFFOEQsU0FBUyxFQUFFLElBQUksQ0FBQ2YsWUFBWSxFQUFFaEIsS0FBSyxDQUFDc0UsU0FBUyxDQUFDQyxJQUFJLENBQUV2RSxLQUFNLENBQUMsRUFBRUEsS0FBSyxDQUFDd0UsdUJBQXVCLEVBQUVULHlCQUEwQixDQUFDO1FBQ3hLTixpQkFBaUIsR0FBR1ksYUFBYTtRQUNqQyxJQUFLSSxzQkFBc0IsRUFBRztVQUM1QkEsc0JBQXNCLENBQUNDLE1BQU0sR0FBR0wsYUFBYSxDQUFDTSxlQUFlO1FBQy9EOztRQUVBO1FBQ0FOLGFBQWEsQ0FBQ08sT0FBTyxHQUFHLElBQUl6SSxJQUFJLENBQUU7VUFDaEMwRyxRQUFRLEVBQUUsQ0FDUjFCLG1CQUFtQixFQUNuQnVCLG1CQUFtQixFQUNuQjJCLGFBQWEsRUFDYmpELG1CQUFtQjtRQUV2QixDQUFFLENBQUM7UUFDSCxJQUFLc0MsWUFBWSxJQUFJQSxZQUFZLENBQUNtQixrQkFBa0IsS0FBSzlDLFNBQVMsRUFBRztVQUNuRThCLFVBQVUsR0FBRyxJQUFJLENBQUN2QixrQkFBa0IsQ0FBQ3dDLFVBQVUsQ0FBRVQsYUFBYSxDQUFDTyxPQUFPLEVBQUU7WUFDdEVsRixRQUFRLEVBQUUsR0FBRztZQUNiQyxhQUFhLEVBQUU7Y0FDYkMsTUFBTSxFQUFFckQsTUFBTSxDQUFDd0k7WUFDakI7VUFDRixDQUFFLENBQUM7UUFDTCxDQUFDLE1BQ0k7VUFDSGxCLFVBQVUsR0FBRyxJQUFJLENBQUN2QixrQkFBa0IsQ0FBQ1QsV0FBVyxDQUFFd0MsYUFBYSxDQUFDTyxPQUFPLEVBQUVuRiw0QkFBNkIsQ0FBQztRQUN6RztNQUNGLENBQUMsTUFDSTtRQUNIb0UsVUFBVSxHQUFHLElBQUksQ0FBQ3ZCLGtCQUFrQixDQUFDVixZQUFZLENBQUUsSUFBSSxDQUFDZixtQkFBbUIsRUFBRXBCLDRCQUE2QixDQUFDO01BQzdHO01BQ0EsSUFBSSxDQUFDNEIsZ0JBQWdCLEdBQUcsSUFBSTtNQUM1QixJQUFLc0MsZ0JBQWdCLEVBQUc7UUFDdEJFLFVBQVUsQ0FBQ21CLFlBQVksQ0FBQ0MsV0FBVyxDQUFFLE1BQU07VUFDekN0QixnQkFBZ0IsQ0FBQ2lCLE9BQU8sQ0FBQ00sT0FBTyxDQUFDLENBQUM7VUFDbEN2QixnQkFBZ0IsQ0FBQ3VCLE9BQU8sQ0FBQyxDQUFDO1FBQzVCLENBQUUsQ0FBQztNQUNMO0lBQ0YsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDcEUsUUFBUSxDQUFFLElBQUksQ0FBQ3dCLGtCQUFtQixDQUFDO0lBRXhDLE1BQU02QyxlQUFlLEdBQUcsSUFBSXpJLGVBQWUsQ0FBQyxDQUFDOztJQUU3QztJQUNBc0QsS0FBSyxDQUFDb0Ysd0JBQXdCLENBQUNILFdBQVcsQ0FBRSxNQUFNRSxlQUFlLENBQUNFLG9CQUFvQixDQUFDLENBQUUsQ0FBQztJQUMxRnJGLEtBQUssQ0FBQ3NGLDBCQUEwQixDQUFDTCxXQUFXLENBQUUsTUFBTUUsZUFBZSxDQUFDSSxpQkFBaUIsQ0FBQyxDQUFFLENBQUM7SUFDekZ2RixLQUFLLENBQUN3RixxQkFBcUIsQ0FBQ1AsV0FBVyxDQUFFLE1BQU1FLGVBQWUsQ0FBQ00sYUFBYSxDQUFDLENBQUUsQ0FBQztJQUNoRnpGLEtBQUssQ0FBQ3dFLHVCQUF1QixDQUFDUyxXQUFXLENBQUUsTUFBTUUsZUFBZSxDQUFDTyxXQUFXLENBQUMsQ0FBRSxDQUFDO0lBRWhGLElBQUksQ0FBQzdFLG1CQUFtQixDQUFDQyxRQUFRLENBQUUsSUFBSSxDQUFDUSw0QkFBNkIsQ0FBQztJQUV0RSxNQUFNcUUsMkJBQTJCLEdBQUcsRUFBRTs7SUFFdEM7SUFDQSxNQUFNQyxVQUFVLEdBQUcsSUFBSWpJLGdCQUFnQixDQUFFO01BQ3ZDa0ksU0FBUyxFQUFFbkkscUJBQXFCLENBQUNvSSw4QkFBOEI7TUFDL0RDLE1BQU0sRUFBRSxFQUFFO01BQ1ZDLGFBQWEsRUFBRSxDQUFDQyxJQUFJLENBQUNDLEVBQUUsR0FBRyxDQUFDO01BQzNCQyxlQUFlLEVBQUUsSUFBSWpMLGVBQWUsQ0FBRSxDQUFFLElBQUksQ0FBQzBGLDBCQUEwQixDQUFFLEVBQUVzQixLQUFLLElBQUksQ0FBQ0EsS0FBTSxDQUFDO01BQzVGWSxRQUFRLEVBQUVBLENBQUEsS0FBTTtRQUNkLElBQUksQ0FBQ2xDLDBCQUEwQixDQUFDc0IsS0FBSyxHQUFHLElBQUk7TUFDOUM7SUFDRixDQUFFLENBQUM7SUFDSCxNQUFNa0UsV0FBVyxHQUFHLElBQUl6SSxnQkFBZ0IsQ0FBRTtNQUN4Q2tJLFNBQVMsRUFBRW5JLHFCQUFxQixDQUFDb0ksOEJBQThCO01BQy9EQyxNQUFNLEVBQUUsRUFBRTtNQUNWQyxhQUFhLEVBQUVDLElBQUksQ0FBQ0MsRUFBRSxHQUFHLENBQUM7TUFDMUJDLGVBQWUsRUFBRSxJQUFJLENBQUN2RiwwQkFBMEI7TUFDaERrQyxRQUFRLEVBQUVBLENBQUEsS0FBTTtRQUNkLElBQUksQ0FBQ2xDLDBCQUEwQixDQUFDc0IsS0FBSyxHQUFHLEtBQUs7TUFDL0M7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQTBELFVBQVUsQ0FBQ1MsU0FBUyxHQUFHVCxVQUFVLENBQUNVLE1BQU0sQ0FBQ0MsU0FBUyxDQUFFWiwyQkFBMkIsR0FBRyxDQUFDLEVBQUUsRUFBRyxDQUFDO0lBQ3pGUyxXQUFXLENBQUNDLFNBQVMsR0FBR0QsV0FBVyxDQUFDRSxNQUFNLENBQUNDLFNBQVMsQ0FBRVosMkJBQTJCLEdBQUcsQ0FBQyxFQUFFLEVBQUcsQ0FBQztJQUUzRixNQUFNYSx5QkFBeUIsR0FBRyxJQUFJdEssSUFBSSxDQUFFO01BQzFDMkcsUUFBUSxFQUFFLENBQ1IrQyxVQUFVLEVBQ1ZRLFdBQVcsQ0FDWjtNQUNEckYsT0FBTyxFQUFFLElBQUksQ0FBQ0MsWUFBWSxDQUFDRCxPQUFPO01BQ2xDMEYsTUFBTSxFQUFFLElBQUksQ0FBQ3pGLFlBQVksQ0FBQ3lGLE1BQU0sR0FBRyxFQUFFO01BQ3JDOUQsT0FBTyxFQUFFZ0Q7SUFDWCxDQUFFLENBQUM7SUFDSCxJQUFJLENBQUM5RSxtQkFBbUIsQ0FBQ0MsUUFBUSxDQUFFMEYseUJBQTBCLENBQUM7SUFFOUQsTUFBTS9CLHNCQUFzQixHQUFHLElBQUloSSxzQkFBc0IsQ0FBRSxNQUFNO01BQy9EO01BQ0F1RCxLQUFLLENBQUMrQyxhQUFhLENBQUNiLEtBQUssR0FBRyxJQUFJO0lBQ2xDLENBQUMsRUFBRTtNQUNEd0MsTUFBTSxFQUFFLElBQUksQ0FBQzFELFlBQVksQ0FBQzBELE1BQU07TUFDaENnQyxPQUFPLEVBQUU7SUFDWCxDQUFFLENBQUM7SUFDSHRGLG1CQUFtQixDQUFDTixRQUFRLENBQUUyRCxzQkFBdUIsQ0FBQztJQUV0RHpFLEtBQUssQ0FBQ29GLHdCQUF3QixDQUFDSCxXQUFXLENBQUUsTUFBTTtNQUNoRCxJQUFLLENBQUMxSixRQUFRLENBQUNvTCxZQUFZLEVBQUc7UUFDNUI7UUFDQSxJQUFJLENBQUNDLFVBQVUsR0FBRyxJQUFJaEssVUFBVSxDQUFFO1VBQ2hDaUssS0FBSyxFQUFFakssVUFBVSxDQUFDa0ssaUJBQWlCLENBQUUsQ0FDbkMsR0FBR25JLENBQUMsQ0FBQ29JLEtBQUssQ0FBRSxDQUFDLEVBQUUsTUFBTSxJQUFJOUssUUFBUSxDQUFDLENBQUUsQ0FBQyxFQUNyQyxHQUFHMEMsQ0FBQyxDQUFDb0ksS0FBSyxDQUFFLENBQUMsRUFBRSxNQUFNLElBQUlsTCxRQUFRLENBQUUsRUFBRSxFQUFFO1lBQUVtTCxVQUFVLEVBQUU7VUFBUSxDQUFFLENBQUUsQ0FBQyxFQUNsRSxHQUFHckksQ0FBQyxDQUFDc0ksS0FBSyxDQUFFLENBQUMsRUFBRSxFQUFHLENBQUMsQ0FBQzlHLEdBQUcsQ0FBRStHLENBQUMsSUFBSSxJQUFJN0osZUFBZSxDQUFFLElBQUlKLFdBQVcsQ0FBRWlLLENBQUUsQ0FBRSxDQUFFLENBQUMsRUFDM0UsR0FBR3ZJLENBQUMsQ0FBQ3NJLEtBQUssQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUM5RyxHQUFHLENBQUUrRyxDQUFDLElBQUksSUFBSTFKLGNBQWMsQ0FBRSxJQUFJSixVQUFVLENBQUUsSUFBSTVCLFFBQVEsQ0FBRSxDQUFDLEVBQUUwTCxDQUFFLENBQUMsRUFBRW5LLHNCQUFzQixDQUFDb0ssR0FBRyxFQUFFekoscUJBQXFCLENBQUMwSixrQkFBbUIsQ0FBQyxFQUFFO1lBQUVDLFFBQVEsRUFBRWpNLFNBQVMsQ0FBQ2tNLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHckIsSUFBSSxDQUFDQztVQUFHLENBQUUsQ0FBRSxDQUFDLEVBQ3JOLEdBQUd2SCxDQUFDLENBQUNzSSxLQUFLLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDOUcsR0FBRyxDQUFFK0csQ0FBQyxJQUFJLElBQUkxSixjQUFjLENBQUUsSUFBSUosVUFBVSxDQUFFLElBQUk1QixRQUFRLENBQUUsQ0FBQyxFQUFFMEwsQ0FBRSxDQUFDLEVBQUVuSyxzQkFBc0IsQ0FBQ3dLLEdBQUcsRUFBRTdKLHFCQUFxQixDQUFDOEosa0JBQW1CLENBQUUsQ0FBRSxDQUFDLENBQ2xLLEVBQUUsR0FBSTtRQUNULENBQUUsQ0FBQztRQUNIckcsbUJBQW1CLENBQUNMLFFBQVEsQ0FBRSxJQUFJLENBQUM4RixVQUFXLENBQUM7TUFDakQ7TUFDQW5DLHNCQUFzQixDQUFDaUMsT0FBTyxHQUFHLElBQUk7TUFFckMsTUFBTWUsYUFBYSxHQUFHekgsS0FBSyxDQUFDK0MsYUFBYSxDQUFDYixLQUFLLENBQUN1RixhQUFhO01BQzdELElBQUlDLFFBQVEsR0FBRyxLQUFLO01BQ3BCLE1BQU1DLFlBQVksR0FBR0EsQ0FBQSxLQUFNO1FBQ3pCO1FBQ0E7UUFDQSxJQUFLRCxRQUFRLEVBQUc7VUFDZDtRQUNGO1FBQ0FBLFFBQVEsR0FBRyxJQUFJO1FBQ2YxSCxLQUFLLENBQUMrQyxhQUFhLENBQUM2RSxNQUFNLENBQUVELFlBQWEsQ0FBQztRQUMxQzNILEtBQUssQ0FBQzhCLGlCQUFpQixDQUFDOEYsTUFBTSxDQUFFRCxZQUFhLENBQUM7UUFDOUNGLGFBQWEsQ0FBQ0csTUFBTSxDQUFFRCxZQUFhLENBQUM7UUFFcEMsSUFBSyxJQUFJLENBQUNmLFVBQVUsRUFBRztVQUNyQixJQUFJLENBQUNBLFVBQVUsQ0FBQzFCLE9BQU8sQ0FBQyxDQUFDO1VBQ3pCLElBQUksQ0FBQzBCLFVBQVUsR0FBRyxJQUFJO1FBQ3hCO1FBQ0FuQyxzQkFBc0IsQ0FBQ2lDLE9BQU8sR0FBRyxLQUFLO01BQ3hDLENBQUM7TUFDRDFHLEtBQUssQ0FBQzhCLGlCQUFpQixDQUFDSixRQUFRLENBQUVpRyxZQUFhLENBQUM7TUFDaEQzSCxLQUFLLENBQUMrQyxhQUFhLENBQUNyQixRQUFRLENBQUVpRyxZQUFhLENBQUM7TUFDNUNGLGFBQWEsQ0FBQy9GLFFBQVEsQ0FBRWlHLFlBQWEsQ0FBQztJQUN4QyxDQUFFLENBQUM7SUFFSCxNQUFNRSxjQUFjLEdBQUcsSUFBSWpNLGNBQWMsQ0FBRTtNQUN6Q2tILFFBQVEsRUFBRUEsQ0FBQSxLQUFNO1FBQ2QsSUFBSSxDQUFDYyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzVCNUQsS0FBSyxDQUFDbUQsS0FBSyxDQUFDLENBQUM7UUFDYixJQUFJLENBQUNBLEtBQUssQ0FBQyxDQUFDO01BQ2QsQ0FBQztNQUNEMkUsS0FBSyxFQUFFLElBQUksQ0FBQzlHLFlBQVksQ0FBQzhHLEtBQUssR0FBR3ZKLFdBQVc7TUFDNUNrSSxNQUFNLEVBQUUsSUFBSSxDQUFDekYsWUFBWSxDQUFDeUYsTUFBTSxHQUFHbEk7SUFDckMsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDc0MsbUJBQW1CLENBQUNDLFFBQVEsQ0FBRStHLGNBQWUsQ0FBQztJQUVuRHpFLElBQUksQ0FBQzJFLEtBQUssQ0FBQ0MsT0FBTyxDQUFDQyxnQkFBZ0IsQ0FBRTtNQUNuQ0MsSUFBSSxFQUFFQyxLQUFLLElBQUk7UUFDYixNQUFNQyxNQUFNLEdBQUdoRixJQUFJLENBQUMyRSxLQUFLLENBQUNNLEdBQUcsQ0FBQ0Msc0JBQXNCLENBQUNwRyxLQUFLO1FBQzFELElBQUtrRyxNQUFNLElBQUlBLE1BQU0sQ0FBQ0csSUFBSSxLQUFLLElBQUksRUFBRztVQUNwQztVQUNBLE1BQU14RyxTQUFTLEdBQUcvQixLQUFLLENBQUM4QixpQkFBaUIsQ0FBQ0ksS0FBSztVQUUvQyxNQUFNc0csUUFBUSxHQUFHL0UsaUJBQWlCLElBQUlBLGlCQUFpQixDQUFDZ0YsZUFBZSxDQUFFTixLQUFLLENBQUNPLE9BQVEsQ0FBQztVQUV4RixJQUFLM0csU0FBUyxJQUFJLENBQUN5RyxRQUFRLEVBQUc7WUFDNUJ6RyxTQUFTLENBQUM0RyxxQkFBcUIsQ0FBQ3pHLEtBQUssR0FBRyxJQUFJO1VBQzlDO1FBQ0Y7TUFDRjtJQUNGLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxJQUFJQSxDQUFFeUcsRUFBRSxFQUFHO0lBQ1QsSUFBSSxDQUFDaEMsVUFBVSxJQUFJLElBQUksQ0FBQ0EsVUFBVSxDQUFDRixPQUFPLElBQUksSUFBSSxDQUFDRSxVQUFVLENBQUN6RSxJQUFJLENBQUV5RyxFQUFHLENBQUM7SUFFeEUsSUFBSyxJQUFJLENBQUN2SCxnQkFBZ0IsRUFBRztNQUMzQixJQUFJLENBQUNBLGdCQUFnQixHQUFHLEtBQUs7SUFDL0IsQ0FBQyxNQUNJO01BQ0gsSUFBSSxDQUFDQyw0QkFBNEIsQ0FBQ2EsSUFBSSxDQUFFeUcsRUFBRyxDQUFDO01BQzVDLElBQUksQ0FBQ3RHLGtCQUFrQixDQUFDSCxJQUFJLENBQUV5RyxFQUFHLENBQUM7SUFDcEM7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFekYsS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSSxDQUFDdkMsMEJBQTBCLENBQUN1QyxLQUFLLENBQUMsQ0FBQzs7SUFFdkM7SUFDQSxJQUFJLENBQUM3Qiw0QkFBNEIsQ0FBQ2EsSUFBSSxDQUFFQyxNQUFNLENBQUNDLGlCQUFrQixDQUFDO0lBQ2xFLElBQUksQ0FBQ0Msa0JBQWtCLENBQUNILElBQUksQ0FBRUMsTUFBTSxDQUFDQyxpQkFBa0IsQ0FBQztFQUMxRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0V3RyxjQUFjQSxDQUFFQyxNQUFNLEVBQUVDLEtBQUssRUFBRztJQUM5QixPQUFPLElBQUk3TSxJQUFJLENBQUU7TUFDZjJHLFFBQVEsRUFBRWlHLE1BQU0sQ0FBQzNJLEdBQUcsQ0FBRSxDQUFFQyxLQUFLLEVBQUU0SSxLQUFLLEtBQU07UUFDeEMsTUFBTUMsTUFBTSxHQUFHLElBQUl0TSxvQkFBb0IsQ0FBRW9NLEtBQUssQ0FBRUMsS0FBSyxDQUFFLEVBQUU1SSxLQUFLLENBQUNxSCxhQUFhLEVBQUU7VUFDNUV5QixXQUFXLEVBQUUsR0FBRztVQUNoQkMsWUFBWSxFQUFFLEdBQUc7VUFDakJDLGtCQUFrQixFQUFFM0IsYUFBYSxJQUFJLElBQUk1SyxpQkFBaUIsQ0FBRTRLLGFBQWEsRUFBRTtZQUN6RTRCLGFBQWEsRUFBRWpKLEtBQUssQ0FBQ2tKLFVBQVU7WUFDL0JDLFlBQVksRUFBRW5KLEtBQUssQ0FBQ2tKO1VBQ3RCLENBQUUsQ0FBQztVQUNIeEcsUUFBUSxFQUFFQSxDQUFBLEtBQU07WUFDZCxJQUFJLENBQUM5QyxLQUFLLENBQUMrQyxhQUFhLENBQUNiLEtBQUssR0FBRzlCLEtBQUs7VUFDeEMsQ0FBQztVQUNEb0osZ0JBQWdCLEVBQUVwSixLQUFLLENBQUNxSixNQUFNLEdBQUc7UUFDbkMsQ0FBRSxDQUFDO1FBQ0hSLE1BQU0sQ0FBQzVDLFNBQVMsR0FBRzRDLE1BQU0sQ0FBQ1MsV0FBVyxDQUFDQyxPQUFPLENBQUVyTCx1QkFBdUIsR0FBRyxDQUFFLENBQUM7UUFDNUUsT0FBTzJLLE1BQU07TUFDZixDQUFFLENBQUM7TUFDSHRHLE9BQU8sRUFBRXJFO0lBQ1gsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VvQyxrQkFBa0JBLENBQUVrSixRQUFRLEVBQUVDLFFBQVEsRUFBRztJQUN2QyxPQUFPLElBQUkxTixJQUFJLENBQUU7TUFDZjBHLFFBQVEsRUFBRSxDQUNSLElBQUl4RyxJQUFJLENBQUU7UUFDUndHLFFBQVEsRUFBRSxDQUNSLElBQUksQ0FBQ2dHLGNBQWMsQ0FBRSxJQUFJLENBQUM3SSxLQUFLLENBQUNFLFdBQVcsQ0FBQzRKLEtBQUssQ0FBRUYsUUFBUSxFQUFFQyxRQUFRLEdBQUcsQ0FBRSxDQUFDLEVBQUUsSUFBSSxDQUFDNUosVUFBVSxDQUFDNkosS0FBSyxDQUFFRixRQUFRLEVBQUVDLFFBQVEsR0FBRyxDQUFFLENBQUUsQ0FBQyxFQUM5SCxJQUFJLENBQUNoQixjQUFjLENBQUUsSUFBSSxDQUFDN0ksS0FBSyxDQUFDUSxZQUFZLENBQUNzSixLQUFLLENBQUVGLFFBQVEsRUFBRUMsUUFBUSxHQUFHLENBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQ3RKLFdBQVcsQ0FBQ3VKLEtBQUssQ0FBRUYsUUFBUSxFQUFFQyxRQUFRLEdBQUcsQ0FBRSxDQUFFLENBQUMsQ0FDakk7UUFDRGxILE9BQU8sRUFBRXJFLHVCQUF1QjtRQUNoQ29HLE1BQU0sRUFBRSxJQUFJLENBQUMxRCxZQUFZLENBQUMwRDtNQUM1QixDQUFFLENBQUM7SUFFUCxDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9yRSxlQUFlQSxDQUFFRCxLQUFLLEVBQUVFLGVBQWUsRUFBRztJQUMvQyxNQUFNeUosS0FBSyxHQUFHLElBQUkzTixJQUFJLENBQUVYLFdBQVcsQ0FBQ3VPLE1BQU0sQ0FBRTVMLHVCQUF1QixFQUFFO01BQ25FcUwsTUFBTSxFQUFFckosS0FBSyxDQUFDcUo7SUFDaEIsQ0FBRSxDQUFDLEVBQUU7TUFDSHZJLElBQUksRUFBRSxJQUFJbEYsUUFBUSxDQUFFLEVBQUcsQ0FBQztNQUN4QmlPLFFBQVEsRUFBRXpLLGtCQUFrQixDQUFDMEs7SUFDL0IsQ0FBRSxDQUFDO0lBRUgsSUFBSUMsSUFBSTtJQUNSLElBQUsvSixLQUFLLENBQUNnSyxZQUFZLEtBQUtwTixZQUFZLENBQUNvSCxNQUFNLEVBQUc7TUFDaEQsSUFBSyxDQUFDOUQsZUFBZSxFQUFHO1FBQ3RCLE1BQU0rSixLQUFLLEdBQUcsSUFBSW5OLFdBQVcsQ0FBRWtELEtBQUssQ0FBQ3FKLE1BQU0sRUFBRXJKLEtBQUssQ0FBQ3FKLE1BQU8sQ0FBQztRQUMzRCxLQUFNLElBQUlhLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2xLLEtBQUssQ0FBQ3FKLE1BQU0sRUFBRWEsQ0FBQyxFQUFFLEVBQUc7VUFDdkNELEtBQUssQ0FBQ0UsWUFBWSxDQUFDQyxJQUFJLENBQUUsSUFBSXZOLFdBQVcsQ0FBRW1ELEtBQUssQ0FBQ3FKLE1BQU8sQ0FBRSxDQUFDO1FBQzVEO1FBQ0FVLElBQUksR0FBRyxJQUFJN00sZUFBZSxDQUFFK00sS0FBSyxFQUFFO1VBQ2pDSSxLQUFLLEVBQUU7UUFDVCxDQUFFLENBQUM7TUFDTCxDQUFDLE1BQ0k7UUFDSCxNQUFNQyxXQUFXLEdBQUd0SyxLQUFLLENBQUNxSixNQUFNLEdBQUcsQ0FBQztRQUNwQ1UsSUFBSSxHQUFHLElBQUlwTyxpQkFBaUIsQ0FBRTtVQUM1QjRPLEtBQUssRUFBRXZLLEtBQUssQ0FBQ3FKLE1BQU07VUFDbkJtQixTQUFTLEVBQUVGLFdBQVcsR0FBRyxDQUFDLEdBQUcsSUFBSTtVQUNqQ0csV0FBVyxFQUFFSCxXQUFXLEdBQUd0SyxLQUFLLENBQUNxSixNQUFNLEdBQUcsSUFBSTtVQUM5Q2dCLEtBQUssRUFBRTtRQUNULENBQUUsQ0FBQztNQUNMO0lBQ0YsQ0FBQyxNQUNJO01BQ0g7TUFDQSxJQUFJNUwsY0FBYyxHQUFHRSxzQkFBc0IsQ0FBRXFCLEtBQUssQ0FBQ3FKLE1BQU0sR0FBRyxDQUFDLENBQUU7TUFDL0Q7TUFDQSxJQUFLckosS0FBSyxDQUFDcUosTUFBTSxLQUFLLEVBQUUsSUFBSSxDQUFDbkosZUFBZSxFQUFHO1FBQzdDekIsY0FBYyxHQUFHTCxNQUFNLENBQUVULGNBQWMsQ0FBQytNLFdBQVcsRUFBRSxFQUFHLENBQUM7TUFDM0Q7TUFDQSxNQUFNQyxnQkFBZ0IsR0FBRyxDQUN2QixJQUFJak4sZUFBZSxDQUFFZSxjQUFjLEVBQUVGLENBQUMsQ0FBQ29JLEtBQUssQ0FBRTNHLEtBQUssQ0FBQ3FKLE1BQU0sRUFBRSxNQUFNLElBQUssQ0FBQyxFQUFFckosS0FBSyxDQUFDNEssS0FBTSxDQUFDLEVBQ3ZGLElBQU8xSyxlQUFlLElBQUlGLEtBQUssQ0FBQ3FKLE1BQU0sR0FBRyxDQUFDLEdBQUssQ0FDN0MsSUFBSTNMLGVBQWUsQ0FBRWUsY0FBYyxFQUFFLENBQUUsSUFBSSxFQUFFLEdBQUdGLENBQUMsQ0FBQ29JLEtBQUssQ0FBRTNHLEtBQUssQ0FBQ3FKLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxLQUFNLENBQUMsQ0FBRSxFQUFFckosS0FBSyxDQUFDNEssS0FBTSxDQUFDLENBQzFHLEdBQUcsRUFBRSxDQUFFLENBQ1Q7TUFDRGIsSUFBSSxHQUFHLElBQUlqTyxJQUFJLENBQUU7UUFDZnlHLE9BQU8sRUFBRSxDQUFDO1FBQ1ZFLFFBQVEsRUFBRWtJLGdCQUFnQixDQUFDNUssR0FBRyxDQUFFOEssZUFBZSxJQUFJLElBQUlqTixtQkFBbUIsQ0FBRWlOLGVBQWdCLENBQUUsQ0FBQztRQUMvRlIsS0FBSyxFQUFFbkssZUFBZSxHQUFHLEdBQUcsR0FBRztNQUNqQyxDQUFFLENBQUM7SUFDTDtJQUVBeUosS0FBSyxDQUFDaEosT0FBTyxHQUFHdkIsa0JBQWtCLENBQUN1QixPQUFPO0lBQzFDZ0osS0FBSyxDQUFDOUksR0FBRyxHQUFHekIsa0JBQWtCLENBQUN5QixHQUFHO0lBRWxDLE1BQU1pSyxhQUFhLEdBQUcsSUFBSS9PLElBQUksQ0FBRTtNQUM5QjBHLFFBQVEsRUFBRSxDQUFFc0gsSUFBSSxDQUFFO01BQ2xCRixRQUFRLEVBQUV6SyxrQkFBa0IsQ0FBQzBLO0lBQy9CLENBQUUsQ0FBQztJQUVIZ0IsYUFBYSxDQUFDbkssT0FBTyxHQUFHdkIsa0JBQWtCLENBQUN1QixPQUFPO0lBQ2xEbUssYUFBYSxDQUFDQyxPQUFPLEdBQUcsQ0FBRXBCLEtBQUssQ0FBQ3RELE1BQU0sR0FBR2pILGtCQUFrQixDQUFDaUgsTUFBTSxJQUFLLENBQUM7SUFFeEUyRSxNQUFNLElBQUlBLE1BQU0sQ0FBRTVMLGtCQUFrQixDQUFDNkwsY0FBYyxDQUFFdEIsS0FBSyxDQUFDekQsTUFBTyxDQUFDLEVBQUUsb0NBQXFDLENBQUM7SUFDM0c4RSxNQUFNLElBQUlBLE1BQU0sQ0FBRTVMLGtCQUFrQixDQUFDNkwsY0FBYyxDQUFFSCxhQUFhLENBQUM1RSxNQUFPLENBQUMsRUFBRSxvQ0FBcUMsQ0FBQztJQUVuSCxPQUFPLElBQUluSyxJQUFJLENBQUU7TUFDZjBHLFFBQVEsRUFBRSxDQUFFa0gsS0FBSyxFQUFFbUIsYUFBYSxDQUFFO01BQ2xDeEIsV0FBVyxFQUFFbEs7SUFDZixDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPOEwsdUJBQXVCQSxDQUFBLEVBQUc7SUFFL0IsTUFBTUMsVUFBVSxHQUFHLElBQUlwTyxVQUFVLENBQUVKLHNCQUFzQixDQUFDd0ssR0FBSSxDQUFDO0lBQy9EZ0UsVUFBVSxDQUFDQyw0QkFBNEIsQ0FBQ3RKLEtBQUssR0FBRyxDQUFDO0lBRWpEcUosVUFBVSxDQUFDRSxlQUFlLENBQUN4SCxHQUFHLENBQUUsQ0FBRSxDQUFDLENBQUN5SCxXQUFXLENBQUNsQixJQUFJLENBQUUsSUFBSXBOLFVBQVUsQ0FBRSxJQUFJNUIsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFBRXVCLHNCQUFzQixDQUFDd0ssR0FBRyxFQUFFN0oscUJBQXFCLENBQUNpTyxpQkFBa0IsQ0FBRSxDQUFDO0lBRW5LLE1BQU1DLGNBQWMsR0FBRyxJQUFJck8sY0FBYyxDQUFFZ08sVUFBVSxFQUFFO01BQ3JETSxVQUFVLEVBQUUsS0FBSztNQUNqQkMsTUFBTSxFQUFFLElBQUk7TUFDWkMsVUFBVSxFQUFFO0lBQ2QsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsVUFBVSxHQUFHLElBQUk1UCxJQUFJLENBQUVOLFdBQVcsQ0FBQ21RLFFBQVEsRUFBRTtNQUFFL0ssSUFBSSxFQUFFLElBQUlsRixRQUFRLENBQUUsRUFBRztJQUFFLENBQUUsQ0FBQztJQUVqRixNQUFNa1EsWUFBWSxHQUFHLElBQUluUSxpQkFBaUIsQ0FBRTtNQUMxQzZPLFNBQVMsRUFBRSxDQUFDO01BQ1pDLFdBQVcsRUFBRSxDQUFDO01BQ2RKLEtBQUssRUFBRTtJQUNULENBQUUsQ0FBQztJQUVILE9BQU9oTixzQkFBc0IsQ0FBQzBPLFFBQVEsQ0FBRSxJQUFJalEsSUFBSSxDQUFFO01BQ2hEeUcsT0FBTyxFQUFFLEVBQUU7TUFDWEUsUUFBUSxFQUFFLENBQ1IrSSxjQUFjLEVBQ2RJLFVBQVUsRUFDVkUsWUFBWSxDQUNiO01BQ0R6QixLQUFLLEVBQUU7SUFDVCxDQUFFLENBQUMsRUFBRS9NLHFCQUFxQixDQUFDME8sNkJBQThCLENBQUM7RUFDNUQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBT0MscUJBQXFCQSxDQUFBLEVBQUc7SUFDN0IsTUFBTUgsWUFBWSxHQUFHLElBQUluUSxpQkFBaUIsQ0FBRTtNQUMxQzRPLEtBQUssRUFBRSxDQUFDO01BQ1JDLFNBQVMsRUFBRSxDQUFDO01BQ1pDLFdBQVcsRUFBRSxDQUFDO01BQ2RKLEtBQUssRUFBRTtJQUNULENBQUUsQ0FBQztJQUVILE1BQU11QixVQUFVLEdBQUcsSUFBSTVQLElBQUksQ0FBRU4sV0FBVyxDQUFDbVEsUUFBUSxFQUFFO01BQUUvSyxJQUFJLEVBQUUsSUFBSWxGLFFBQVEsQ0FBRSxFQUFHO0lBQUUsQ0FBRSxDQUFDO0lBRWpGLE1BQU1zUSxTQUFTLEdBQUcsSUFBSXBRLElBQUksQ0FBRTtNQUMxQnlHLE9BQU8sRUFBRSxDQUFDO01BQ1ZFLFFBQVEsRUFBRSxDQUNSLElBQUk3RSxtQkFBbUIsQ0FBRSxJQUFJRixlQUFlLENBQUVDLGNBQWMsQ0FBQ29CLFVBQVUsRUFBRSxDQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFFLEVBQUV6QixxQkFBcUIsQ0FBQ2lPLGlCQUFrQixDQUFFLENBQUMsRUFDNUosSUFBSTNOLG1CQUFtQixDQUFFLElBQUlGLGVBQWUsQ0FBRUMsY0FBYyxDQUFDb0IsVUFBVSxFQUFFLENBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUUsRUFBRXpCLHFCQUFxQixDQUFDaU8saUJBQWtCLENBQUUsQ0FBQztJQUVsSyxDQUFFLENBQUM7SUFFSCxPQUFPbE8sc0JBQXNCLENBQUMwTyxRQUFRLENBQUUsSUFBSWpRLElBQUksQ0FBRTtNQUNoRHlHLE9BQU8sRUFBRSxFQUFFO01BQ1hFLFFBQVEsRUFBRSxDQUNScUosWUFBWSxFQUNaRixVQUFVLEVBQ1ZNLFNBQVMsQ0FDVjtNQUNEN0IsS0FBSyxFQUFFO0lBQ1QsQ0FBRSxDQUFDLEVBQUUvTSxxQkFBcUIsQ0FBQzBPLDZCQUE4QixDQUFDO0VBQzVEO0FBQ0Y7QUFFQXhPLGVBQWUsQ0FBQzJPLFFBQVEsQ0FBRSx3QkFBd0IsRUFBRXpNLHNCQUF1QixDQUFDO0FBQzVFLGVBQWVBLHNCQUFzQiJ9