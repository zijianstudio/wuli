// Copyright 2019-2022, University of Colorado Boulder

/**
 * Main ScreenView for matching game style screens.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Screen from '../../../../joist/js/Screen.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import BackButton from '../../../../scenery-phet/js/buttons/BackButton.js';
import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import TimerToggleButton from '../../../../scenery-phet/js/buttons/TimerToggleButton.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import MixedFractionNode from '../../../../scenery-phet/js/MixedFractionNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Easing from '../../../../twixt/js/Easing.js';
import TransitionNode from '../../../../twixt/js/TransitionNode.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import LevelSelectionButton from '../../../../vegas/js/LevelSelectionButton.js';
import ScoreDisplayStars from '../../../../vegas/js/ScoreDisplayStars.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import FractionsCommonStrings from '../../FractionsCommonStrings.js';
import FilledPartition from '../../game/model/FilledPartition.js';
import ShapePartition from '../../game/model/ShapePartition.js';
import FilledPartitionNode from '../../game/view/FilledPartitionNode.js';
import MatchingChallenge from '../model/MatchingChallenge.js';
import MatchingChallengeNode from './MatchingChallengeNode.js';

// constants
const LEVEL_SELECTION_SPACING = 25;
const SIDE_MARGIN = 10;
const ICON_DESIGN_BOUNDS = new Bounds2(0, 0, 90, 129);
const select = (shapePartitions, quantity) => {
  return _.find(shapePartitions, shapePartition => shapePartition.length === quantity);
};
const LEVEL_SHAPE_PARTITIONS = [select(ShapePartition.PIES, 1), select(ShapePartition.HORIZONTAL_BARS, 2), select(ShapePartition.VERTICAL_BARS, 3), select(ShapePartition.DIAGONAL_LS, 4), select(ShapePartition.POLYGONS, 5), ShapePartition.SIX_FLOWER, ShapePartition.HEX_RING, ShapePartition.NINJA_STAR];
const LEVEL_COLORS = [FractionsCommonColors.shapeRedProperty, FractionsCommonColors.shapeGreenProperty, FractionsCommonColors.shapeBlueProperty, FractionsCommonColors.shapeOrangeProperty, FractionsCommonColors.shapeMagentaProperty, FractionsCommonColors.shapeYellowProperty, FractionsCommonColors.shapeLighterPinkProperty, FractionsCommonColors.shapeStrongGreenProperty];
const QUADRATIC_TRANSITION_OPTIONS = {
  duration: 0.4,
  targetOptions: {
    easing: Easing.QUADRATIC_IN_OUT
  }
};
const chooseYourLevelString = VegasStrings.chooseYourLevel;
const fractionsChooseYourLevelString = FractionsCommonStrings.fractionsChooseYourLevel;
const levelTitlePatternString = FractionsCommonStrings.levelTitlePattern;
const mixedNumbersChooseYourLevelString = FractionsCommonStrings.mixedNumbersChooseYourLevel;
class MatchingGameScreenView extends ScreenView {
  /**
   * @param {MatchingGameModel} model
   */
  constructor(model) {
    super();

    // @private {MatchingGameModel}
    this.model = model;
    const gameAudioPlayer = new GameAudioPlayer();
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      }
    });
    const levelIcons = model.levels.map(level => MatchingGameScreenView.createLevelIcon(level, model.hasMixedNumbers));

    // @private {Node} - The "left" half of the sliding layer, displayed first
    this.levelSelectionLayer = new Node({
      children: [resetAllButton, new TimerToggleButton(model.timeVisibleProperty, {
        touchAreaXDilation: 5,
        touchAreaYDilation: 5,
        bottom: this.layoutBounds.bottom - SIDE_MARGIN,
        left: this.layoutBounds.left + SIDE_MARGIN
      }), new VBox({
        spacing: 20,
        center: this.layoutBounds.center,
        children: [new Text(model.useShortTitle ? chooseYourLevelString : model.hasMixedNumbers ? mixedNumbersChooseYourLevelString : fractionsChooseYourLevelString, {
          centerX: this.layoutBounds.centerX,
          top: this.layoutBounds.top + 30,
          font: new PhetFont(30)
        }), new VBox({
          children: [this.createLevelRow(this.model.levels.slice(0, 4), levelIcons.slice(0, 4)), this.createLevelRow(this.model.levels.slice(4), levelIcons.slice(4))],
          spacing: LEVEL_SELECTION_SPACING
        })]
      })]
    });
    resetAllButton.bottom = this.layoutBounds.bottom - SIDE_MARGIN;
    resetAllButton.right = this.layoutBounds.right - SIDE_MARGIN;

    // @private {TransitionNode}
    this.transitionNode = new TransitionNode(this.visibleBoundsProperty, {
      content: this.levelSelectionLayer,
      cachedNodes: [this.levelSelectionLayer]
    });
    this.addChild(this.transitionNode);
    const challengeBackground = new Node();
    const challengeForeground = new Node();
    const leftButtonOptions = {
      touchAreaXDilation: SIDE_MARGIN,
      touchAreaYDilation: SIDE_MARGIN / 2
    };
    const challengeControlBox = new VBox({
      spacing: 10,
      top: this.layoutBounds.top + 160,
      left: this.layoutBounds.left + FractionsCommonConstants.MATCHING_MARGIN,
      children: [new BackButton(merge({
        listener() {
          const level = model.levelProperty.value;
          const challenge = model.challengeProperty.value;
          model.levelProperty.value = null;

          // Force a refresh on a completed level with the back button
          if (challenge.isComplete && challenge.stateProperty.value === MatchingChallenge.State.NO_COMPARISON) {
            level.refresh();
          }
        }
      }, leftButtonOptions)), new RefreshButton(merge({
        iconHeight: 27,
        xMargin: 9,
        yMargin: 7,
        listener() {
          const level = model.levelProperty.value;
          if (level) {
            level.refresh();
            level.select();
          }
        }
      }, leftButtonOptions)), ...(phet.chipper.queryParameters.showAnswers ? [new RectangularPushButton(merge({
        content: new FaceNode(27),
        listener: function () {
          model.challengeProperty.value.cheat();
        }
      }, leftButtonOptions))] : [])]
    });

    // @private {MatchingChallengeNode|null}
    this.lastChallengeNode = null;
    model.challengeProperty.lazyLink((challenge, oldChallenge) => {
      const oldChallengeNode = this.lastChallengeNode;
      if (oldChallengeNode) {
        oldChallengeNode.interruptSubtreeInput();
      }
      this.lastChallengeNode = null;
      let transition;
      if (challenge) {
        const challengeNode = new MatchingChallengeNode(challenge, this.layoutBounds, gameAudioPlayer, {
          rewardContainer: challengeBackground,
          onContinue: () => {
            const level = model.levelProperty.value;
            model.levelProperty.value = null;

            // Start a new challenge for the level
            if (level) {
              level.refresh();
            }
          }
        });
        this.lastChallengeNode = challengeNode;

        // Assign each challenge node with a wrapper reference, so we can easily dispose it.
        challengeNode.wrapper = new Node({
          children: [challengeBackground, challengeControlBox, challengeNode, challengeForeground]
        });
        if (oldChallenge && oldChallenge.refreshedChallenge === challenge) {
          transition = this.transitionNode.dissolveTo(challengeNode.wrapper, {
            duration: 0.6,
            targetOptions: {
              easing: Easing.LINEAR
            }
          });
        } else {
          transition = this.transitionNode.slideLeftTo(challengeNode.wrapper, QUADRATIC_TRANSITION_OPTIONS);
        }
      } else {
        transition = this.transitionNode.slideRightTo(this.levelSelectionLayer, QUADRATIC_TRANSITION_OPTIONS);
      }
      this.delayTransitions = true;
      if (oldChallengeNode) {
        transition.endedEmitter.addListener(() => {
          oldChallengeNode.wrapper.dispose();
          oldChallengeNode.dispose();
        });
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
    this.transitionNode.step(dt);
    this.lastChallengeNode && this.lastChallengeNode.step(dt);
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

    // unmixed max width ~106, mixed ~217
    const shapePartition = LEVEL_SHAPE_PARTITIONS[level.number - 1];
    const color = LEVEL_COLORS[level.number - 1];
    const filledPartitions = [new FilledPartition(shapePartition, _.times(level.number, () => true), color), ...(hasMixedNumbers ? [new FilledPartition(shapePartition, [true, ..._.times(level.number - 1, () => false)], color)] : [])];
    const icon = new HBox({
      spacing: 5,
      children: filledPartitions.map(filledPartition => new FilledPartitionNode(filledPartition, {
        borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
      })),
      scale: hasMixedNumbers ? 0.5 : 0.8
    });
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
   * Creates a row of level selection buttons.
   * @private
   *
   * @param {Array.<MatchingLevel>} levels
   * @param {Array.<Node>} icons
   * @returns {Node}
   */
  createLevelRow(levels, icons) {
    return new HBox({
      children: levels.map((level, index) => {
        const button = new LevelSelectionButton(icons[index], level.levelSelectionScoreProperty, {
          buttonWidth: 110,
          buttonHeight: 200,
          createScoreDisplay: scoreProperty => new ScoreDisplayStars(scoreProperty, {
            numberOfStars: 3,
            perfectScore: 12
          }),
          listener: () => {
            this.model.levelProperty.value = level;
          },
          baseColor: FractionsCommonColors.matchingLevelBackgroundProperty,
          // Workaround since it expects 0 as the best time if there was no best time. Don't solve levels in
          // under a second!
          bestTimeProperty: new DerivedProperty([level.bestTimeProperty], bestTime => isFinite(bestTime) ? bestTime : 0),
          bestTimeVisibleProperty: new DerivedProperty([level.timeVisibleProperty, level.levelSelectionScoreProperty], (timeVisible, score) => {
            return timeVisible && score === 12;
          }),
          bestTimeYSpacing: 5
        });
        return button;
      }),
      spacing: LEVEL_SELECTION_SPACING
    });
  }

  /**
   * The home-screen icon for the main (non-mixed) screen.
   * @public
   *
   * @returns {Node}
   */
  static createIntroHomeIcon() {
    const rectangle = new Rectangle(0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: FractionsCommonColors.matchingHomeIconBackgroundProperty
    });
    rectangle.addChild(new HBox({
      spacing: 20,
      children: [new FilledPartitionNode(new FilledPartition(select(ShapePartition.PIES, 2), [false, true], FractionsCommonColors.shapeBlueProperty), {
        scale: 2.5,
        borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
      }), new Text('=', {
        fill: 'black',
        font: new PhetFont(160)
      }), new MixedFractionNode({
        numerator: 1,
        denominator: 2,
        vinculumExtension: 5,
        scale: 3
      })],
      center: rectangle.center
    }));
    return rectangle;
  }

  /**
   * The navbar icon for the main (non-mixed) screen.
   * @public
   *
   * @returns {Node}
   */
  static createIntroNavbarIcon() {
    const rectangle = new Rectangle(0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: FractionsCommonColors.matchingNavbarIconBackgroundProperty,
      borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
    });
    rectangle.addChild(new FilledPartitionNode(new FilledPartition(select(ShapePartition.PIES, 2), [false, true], FractionsCommonColors.shapeBlueProperty), {
      center: rectangle.center,
      scale: 4
    }));
    return rectangle;
  }

  /**
   * The home-screen icon for the mixed screen.
   * @public
   *
   * @returns {Node}
   */
  static createMixedHomeIcon() {
    const rectangle = new Rectangle(0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: FractionsCommonColors.matchingHomeIconBackgroundProperty
    });
    rectangle.addChild(new HBox({
      spacing: 15,
      children: [new HBox({
        spacing: 10,
        children: [new FilledPartitionNode(new FilledPartition(ShapePartition.SIX_FLOWER, [true, true, true, true, true, true], FractionsCommonColors.shapeRedProperty), {
          borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
        }), new FilledPartitionNode(new FilledPartition(ShapePartition.SIX_FLOWER, [false, true, true, true, false, false], FractionsCommonColors.shapeRedProperty), {
          borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
        })],
        scale: 1.2
      }), new Text('=', {
        fill: 'black',
        font: new PhetFont(160)
      }), new MixedFractionNode({
        whole: 1,
        numerator: 1,
        denominator: 2,
        vinculumExtension: 3,
        scale: 3
      })],
      center: rectangle.center
    }));
    return rectangle;
  }

  /**
   * The navbar icon for the mixed screen.
   * @public
   *
   * @returns {Node}
   */
  static createMixedNavbarIcon() {
    const rectangle = new Rectangle(0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: FractionsCommonColors.matchingNavbarIconBackgroundProperty
    });
    rectangle.addChild(new HBox({
      spacing: 5,
      children: [new FilledPartitionNode(new FilledPartition(ShapePartition.SIX_FLOWER, [true, true, true, true, true, true], FractionsCommonColors.shapeRedProperty), {
        borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
      }), new FilledPartitionNode(new FilledPartition(ShapePartition.SIX_FLOWER, [false, true, true, true, false, false], FractionsCommonColors.shapeRedProperty), {
        borderLineWidth: FractionsCommonConstants.MATCHING_BORDER
      })],
      center: rectangle.center,
      scale: 2.5
    }));
    return rectangle;
  }
}
fractionsCommon.register('MatchingGameScreenView', MatchingGameScreenView);
export default MatchingGameScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJCb3VuZHMyIiwiU2NyZWVuIiwiU2NyZWVuVmlldyIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJCYWNrQnV0dG9uIiwiUmVmcmVzaEJ1dHRvbiIsIlJlc2V0QWxsQnV0dG9uIiwiVGltZXJUb2dnbGVCdXR0b24iLCJGYWNlTm9kZSIsIk1peGVkRnJhY3Rpb25Ob2RlIiwiUGhldEZvbnQiLCJIQm94IiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJWQm94IiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiRWFzaW5nIiwiVHJhbnNpdGlvbk5vZGUiLCJHYW1lQXVkaW9QbGF5ZXIiLCJMZXZlbFNlbGVjdGlvbkJ1dHRvbiIsIlNjb3JlRGlzcGxheVN0YXJzIiwiVmVnYXNTdHJpbmdzIiwiRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzIiwiRnJhY3Rpb25zQ29tbW9uQ29sb3JzIiwiZnJhY3Rpb25zQ29tbW9uIiwiRnJhY3Rpb25zQ29tbW9uU3RyaW5ncyIsIkZpbGxlZFBhcnRpdGlvbiIsIlNoYXBlUGFydGl0aW9uIiwiRmlsbGVkUGFydGl0aW9uTm9kZSIsIk1hdGNoaW5nQ2hhbGxlbmdlIiwiTWF0Y2hpbmdDaGFsbGVuZ2VOb2RlIiwiTEVWRUxfU0VMRUNUSU9OX1NQQUNJTkciLCJTSURFX01BUkdJTiIsIklDT05fREVTSUdOX0JPVU5EUyIsInNlbGVjdCIsInNoYXBlUGFydGl0aW9ucyIsInF1YW50aXR5IiwiXyIsImZpbmQiLCJzaGFwZVBhcnRpdGlvbiIsImxlbmd0aCIsIkxFVkVMX1NIQVBFX1BBUlRJVElPTlMiLCJQSUVTIiwiSE9SSVpPTlRBTF9CQVJTIiwiVkVSVElDQUxfQkFSUyIsIkRJQUdPTkFMX0xTIiwiUE9MWUdPTlMiLCJTSVhfRkxPV0VSIiwiSEVYX1JJTkciLCJOSU5KQV9TVEFSIiwiTEVWRUxfQ09MT1JTIiwic2hhcGVSZWRQcm9wZXJ0eSIsInNoYXBlR3JlZW5Qcm9wZXJ0eSIsInNoYXBlQmx1ZVByb3BlcnR5Iiwic2hhcGVPcmFuZ2VQcm9wZXJ0eSIsInNoYXBlTWFnZW50YVByb3BlcnR5Iiwic2hhcGVZZWxsb3dQcm9wZXJ0eSIsInNoYXBlTGlnaHRlclBpbmtQcm9wZXJ0eSIsInNoYXBlU3Ryb25nR3JlZW5Qcm9wZXJ0eSIsIlFVQURSQVRJQ19UUkFOU0lUSU9OX09QVElPTlMiLCJkdXJhdGlvbiIsInRhcmdldE9wdGlvbnMiLCJlYXNpbmciLCJRVUFEUkFUSUNfSU5fT1VUIiwiY2hvb3NlWW91ckxldmVsU3RyaW5nIiwiY2hvb3NlWW91ckxldmVsIiwiZnJhY3Rpb25zQ2hvb3NlWW91ckxldmVsU3RyaW5nIiwiZnJhY3Rpb25zQ2hvb3NlWW91ckxldmVsIiwibGV2ZWxUaXRsZVBhdHRlcm5TdHJpbmciLCJsZXZlbFRpdGxlUGF0dGVybiIsIm1peGVkTnVtYmVyc0Nob29zZVlvdXJMZXZlbFN0cmluZyIsIm1peGVkTnVtYmVyc0Nob29zZVlvdXJMZXZlbCIsIk1hdGNoaW5nR2FtZVNjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwiZ2FtZUF1ZGlvUGxheWVyIiwicmVzZXRBbGxCdXR0b24iLCJsaXN0ZW5lciIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsInJlc2V0IiwibGV2ZWxJY29ucyIsImxldmVscyIsIm1hcCIsImxldmVsIiwiY3JlYXRlTGV2ZWxJY29uIiwiaGFzTWl4ZWROdW1iZXJzIiwibGV2ZWxTZWxlY3Rpb25MYXllciIsImNoaWxkcmVuIiwidGltZVZpc2libGVQcm9wZXJ0eSIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImJvdHRvbSIsImxheW91dEJvdW5kcyIsImxlZnQiLCJzcGFjaW5nIiwiY2VudGVyIiwidXNlU2hvcnRUaXRsZSIsImNlbnRlclgiLCJ0b3AiLCJmb250IiwiY3JlYXRlTGV2ZWxSb3ciLCJzbGljZSIsInJpZ2h0IiwidHJhbnNpdGlvbk5vZGUiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJjb250ZW50IiwiY2FjaGVkTm9kZXMiLCJhZGRDaGlsZCIsImNoYWxsZW5nZUJhY2tncm91bmQiLCJjaGFsbGVuZ2VGb3JlZ3JvdW5kIiwibGVmdEJ1dHRvbk9wdGlvbnMiLCJjaGFsbGVuZ2VDb250cm9sQm94IiwiTUFUQ0hJTkdfTUFSR0lOIiwibGV2ZWxQcm9wZXJ0eSIsInZhbHVlIiwiY2hhbGxlbmdlIiwiY2hhbGxlbmdlUHJvcGVydHkiLCJpc0NvbXBsZXRlIiwic3RhdGVQcm9wZXJ0eSIsIlN0YXRlIiwiTk9fQ09NUEFSSVNPTiIsInJlZnJlc2giLCJpY29uSGVpZ2h0IiwieE1hcmdpbiIsInlNYXJnaW4iLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsInNob3dBbnN3ZXJzIiwiY2hlYXQiLCJsYXN0Q2hhbGxlbmdlTm9kZSIsImxhenlMaW5rIiwib2xkQ2hhbGxlbmdlIiwib2xkQ2hhbGxlbmdlTm9kZSIsInRyYW5zaXRpb24iLCJjaGFsbGVuZ2VOb2RlIiwicmV3YXJkQ29udGFpbmVyIiwib25Db250aW51ZSIsIndyYXBwZXIiLCJyZWZyZXNoZWRDaGFsbGVuZ2UiLCJkaXNzb2x2ZVRvIiwiTElORUFSIiwic2xpZGVMZWZ0VG8iLCJzbGlkZVJpZ2h0VG8iLCJkZWxheVRyYW5zaXRpb25zIiwiZW5kZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJkaXNwb3NlIiwic3RlcCIsImR0IiwibGFiZWwiLCJmaWxsSW4iLCJudW1iZXIiLCJtYXhXaWR0aCIsIndpZHRoIiwiY29sb3IiLCJmaWxsZWRQYXJ0aXRpb25zIiwidGltZXMiLCJpY29uIiwiZmlsbGVkUGFydGl0aW9uIiwiYm9yZGVyTGluZVdpZHRoIiwiTUFUQ0hJTkdfQk9SREVSIiwic2NhbGUiLCJpY29uQ29udGFpbmVyIiwiY2VudGVyWSIsImFzc2VydCIsImNvbnRhaW5zQm91bmRzIiwiYm91bmRzIiwibG9jYWxCb3VuZHMiLCJpY29ucyIsImluZGV4IiwiYnV0dG9uIiwibGV2ZWxTZWxlY3Rpb25TY29yZVByb3BlcnR5IiwiYnV0dG9uV2lkdGgiLCJidXR0b25IZWlnaHQiLCJjcmVhdGVTY29yZURpc3BsYXkiLCJzY29yZVByb3BlcnR5IiwibnVtYmVyT2ZTdGFycyIsInBlcmZlY3RTY29yZSIsImJhc2VDb2xvciIsIm1hdGNoaW5nTGV2ZWxCYWNrZ3JvdW5kUHJvcGVydHkiLCJiZXN0VGltZVByb3BlcnR5IiwiYmVzdFRpbWUiLCJpc0Zpbml0ZSIsImJlc3RUaW1lVmlzaWJsZVByb3BlcnR5IiwidGltZVZpc2libGUiLCJzY29yZSIsImJlc3RUaW1lWVNwYWNpbmciLCJjcmVhdGVJbnRyb0hvbWVJY29uIiwicmVjdGFuZ2xlIiwiTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUiLCJoZWlnaHQiLCJmaWxsIiwibWF0Y2hpbmdIb21lSWNvbkJhY2tncm91bmRQcm9wZXJ0eSIsIm51bWVyYXRvciIsImRlbm9taW5hdG9yIiwidmluY3VsdW1FeHRlbnNpb24iLCJjcmVhdGVJbnRyb05hdmJhckljb24iLCJtYXRjaGluZ05hdmJhckljb25CYWNrZ3JvdW5kUHJvcGVydHkiLCJjcmVhdGVNaXhlZEhvbWVJY29uIiwid2hvbGUiLCJjcmVhdGVNaXhlZE5hdmJhckljb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1hdGNoaW5nR2FtZVNjcmVlblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBTY3JlZW5WaWV3IGZvciBtYXRjaGluZyBnYW1lIHN0eWxlIHNjcmVlbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBCYWNrQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL0JhY2tCdXR0b24uanMnO1xyXG5pbXBvcnQgUmVmcmVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZWZyZXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IFRpbWVyVG9nZ2xlQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1RpbWVyVG9nZ2xlQnV0dG9uLmpzJztcclxuaW1wb3J0IEZhY2VOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GYWNlTm9kZS5qcyc7XHJcbmltcG9ydCBNaXhlZEZyYWN0aW9uTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWl4ZWRGcmFjdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgSEJveCwgTm9kZSwgUmVjdGFuZ2xlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBUcmFuc2l0aW9uTm9kZSBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9UcmFuc2l0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBHYW1lQXVkaW9QbGF5ZXIgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvR2FtZUF1ZGlvUGxheWVyLmpzJztcclxuaW1wb3J0IExldmVsU2VsZWN0aW9uQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0xldmVsU2VsZWN0aW9uQnV0dG9uLmpzJztcclxuaW1wb3J0IFNjb3JlRGlzcGxheVN0YXJzIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1Njb3JlRGlzcGxheVN0YXJzLmpzJztcclxuaW1wb3J0IFZlZ2FzU3RyaW5ncyBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9WZWdhc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9GcmFjdGlvbnNDb21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgRnJhY3Rpb25zQ29tbW9uQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0ZyYWN0aW9uc0NvbW1vbkNvbG9ycy5qcyc7XHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vblN0cmluZ3MgZnJvbSAnLi4vLi4vRnJhY3Rpb25zQ29tbW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBGaWxsZWRQYXJ0aXRpb24gZnJvbSAnLi4vLi4vZ2FtZS9tb2RlbC9GaWxsZWRQYXJ0aXRpb24uanMnO1xyXG5pbXBvcnQgU2hhcGVQYXJ0aXRpb24gZnJvbSAnLi4vLi4vZ2FtZS9tb2RlbC9TaGFwZVBhcnRpdGlvbi5qcyc7XHJcbmltcG9ydCBGaWxsZWRQYXJ0aXRpb25Ob2RlIGZyb20gJy4uLy4uL2dhbWUvdmlldy9GaWxsZWRQYXJ0aXRpb25Ob2RlLmpzJztcclxuaW1wb3J0IE1hdGNoaW5nQ2hhbGxlbmdlIGZyb20gJy4uL21vZGVsL01hdGNoaW5nQ2hhbGxlbmdlLmpzJztcclxuaW1wb3J0IE1hdGNoaW5nQ2hhbGxlbmdlTm9kZSBmcm9tICcuL01hdGNoaW5nQ2hhbGxlbmdlTm9kZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTEVWRUxfU0VMRUNUSU9OX1NQQUNJTkcgPSAyNTtcclxuY29uc3QgU0lERV9NQVJHSU4gPSAxMDtcclxuY29uc3QgSUNPTl9ERVNJR05fQk9VTkRTID0gbmV3IEJvdW5kczIoIDAsIDAsIDkwLCAxMjkgKTtcclxuY29uc3Qgc2VsZWN0ID0gKCBzaGFwZVBhcnRpdGlvbnMsIHF1YW50aXR5ICkgPT4ge1xyXG4gIHJldHVybiBfLmZpbmQoIHNoYXBlUGFydGl0aW9ucywgc2hhcGVQYXJ0aXRpb24gPT4gc2hhcGVQYXJ0aXRpb24ubGVuZ3RoID09PSBxdWFudGl0eSApO1xyXG59O1xyXG5jb25zdCBMRVZFTF9TSEFQRV9QQVJUSVRJT05TID0gW1xyXG4gIHNlbGVjdCggU2hhcGVQYXJ0aXRpb24uUElFUywgMSApLFxyXG4gIHNlbGVjdCggU2hhcGVQYXJ0aXRpb24uSE9SSVpPTlRBTF9CQVJTLCAyICksXHJcbiAgc2VsZWN0KCBTaGFwZVBhcnRpdGlvbi5WRVJUSUNBTF9CQVJTLCAzICksXHJcbiAgc2VsZWN0KCBTaGFwZVBhcnRpdGlvbi5ESUFHT05BTF9MUywgNCApLFxyXG4gIHNlbGVjdCggU2hhcGVQYXJ0aXRpb24uUE9MWUdPTlMsIDUgKSxcclxuICBTaGFwZVBhcnRpdGlvbi5TSVhfRkxPV0VSLFxyXG4gIFNoYXBlUGFydGl0aW9uLkhFWF9SSU5HLFxyXG4gIFNoYXBlUGFydGl0aW9uLk5JTkpBX1NUQVJcclxuXTtcclxuY29uc3QgTEVWRUxfQ09MT1JTID0gW1xyXG4gIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5zaGFwZVJlZFByb3BlcnR5LFxyXG4gIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5zaGFwZUdyZWVuUHJvcGVydHksXHJcbiAgRnJhY3Rpb25zQ29tbW9uQ29sb3JzLnNoYXBlQmx1ZVByb3BlcnR5LFxyXG4gIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5zaGFwZU9yYW5nZVByb3BlcnR5LFxyXG4gIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5zaGFwZU1hZ2VudGFQcm9wZXJ0eSxcclxuICBGcmFjdGlvbnNDb21tb25Db2xvcnMuc2hhcGVZZWxsb3dQcm9wZXJ0eSxcclxuICBGcmFjdGlvbnNDb21tb25Db2xvcnMuc2hhcGVMaWdodGVyUGlua1Byb3BlcnR5LFxyXG4gIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5zaGFwZVN0cm9uZ0dyZWVuUHJvcGVydHlcclxuXTtcclxuY29uc3QgUVVBRFJBVElDX1RSQU5TSVRJT05fT1BUSU9OUyA9IHtcclxuICBkdXJhdGlvbjogMC40LFxyXG4gIHRhcmdldE9wdGlvbnM6IHtcclxuICAgIGVhc2luZzogRWFzaW5nLlFVQURSQVRJQ19JTl9PVVRcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBjaG9vc2VZb3VyTGV2ZWxTdHJpbmcgPSBWZWdhc1N0cmluZ3MuY2hvb3NlWW91ckxldmVsO1xyXG5jb25zdCBmcmFjdGlvbnNDaG9vc2VZb3VyTGV2ZWxTdHJpbmcgPSBGcmFjdGlvbnNDb21tb25TdHJpbmdzLmZyYWN0aW9uc0Nob29zZVlvdXJMZXZlbDtcclxuY29uc3QgbGV2ZWxUaXRsZVBhdHRlcm5TdHJpbmcgPSBGcmFjdGlvbnNDb21tb25TdHJpbmdzLmxldmVsVGl0bGVQYXR0ZXJuO1xyXG5jb25zdCBtaXhlZE51bWJlcnNDaG9vc2VZb3VyTGV2ZWxTdHJpbmcgPSBGcmFjdGlvbnNDb21tb25TdHJpbmdzLm1peGVkTnVtYmVyc0Nob29zZVlvdXJMZXZlbDtcclxuXHJcbmNsYXNzIE1hdGNoaW5nR2FtZVNjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge01hdGNoaW5nR2FtZU1vZGVsfSBtb2RlbFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge01hdGNoaW5nR2FtZU1vZGVsfVxyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIGNvbnN0IGdhbWVBdWRpb1BsYXllciA9IG5ldyBHYW1lQXVkaW9QbGF5ZXIoKTtcclxuXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XHJcbiAgICAgICAgbW9kZWwucmVzZXQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGxldmVsSWNvbnMgPSBtb2RlbC5sZXZlbHMubWFwKCBsZXZlbCA9PiBNYXRjaGluZ0dhbWVTY3JlZW5WaWV3LmNyZWF0ZUxldmVsSWNvbiggbGV2ZWwsIG1vZGVsLmhhc01peGVkTnVtYmVycyApICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge05vZGV9IC0gVGhlIFwibGVmdFwiIGhhbGYgb2YgdGhlIHNsaWRpbmcgbGF5ZXIsIGRpc3BsYXllZCBmaXJzdFxyXG4gICAgdGhpcy5sZXZlbFNlbGVjdGlvbkxheWVyID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICByZXNldEFsbEJ1dHRvbixcclxuICAgICAgICBuZXcgVGltZXJUb2dnbGVCdXR0b24oIG1vZGVsLnRpbWVWaXNpYmxlUHJvcGVydHksIHtcclxuICAgICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogNSxcclxuICAgICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogNSxcclxuICAgICAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gU0lERV9NQVJHSU4sXHJcbiAgICAgICAgICBsZWZ0OiB0aGlzLmxheW91dEJvdW5kcy5sZWZ0ICsgU0lERV9NQVJHSU5cclxuICAgICAgICB9ICksXHJcbiAgICAgICAgbmV3IFZCb3goIHtcclxuICAgICAgICAgIHNwYWNpbmc6IDIwLFxyXG4gICAgICAgICAgY2VudGVyOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXIsXHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICBuZXcgVGV4dCggbW9kZWwudXNlU2hvcnRUaXRsZSA/IGNob29zZVlvdXJMZXZlbFN0cmluZyA6ICggbW9kZWwuaGFzTWl4ZWROdW1iZXJzID8gbWl4ZWROdW1iZXJzQ2hvb3NlWW91ckxldmVsU3RyaW5nIDogZnJhY3Rpb25zQ2hvb3NlWW91ckxldmVsU3RyaW5nICksIHtcclxuICAgICAgICAgICAgICBjZW50ZXJYOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYLFxyXG4gICAgICAgICAgICAgIHRvcDogdGhpcy5sYXlvdXRCb3VuZHMudG9wICsgMzAsXHJcbiAgICAgICAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAzMCApXHJcbiAgICAgICAgICAgIH0gKSxcclxuICAgICAgICAgICAgbmV3IFZCb3goIHtcclxuICAgICAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVMZXZlbFJvdyggdGhpcy5tb2RlbC5sZXZlbHMuc2xpY2UoIDAsIDQgKSwgbGV2ZWxJY29ucy5zbGljZSggMCwgNCApICksXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUxldmVsUm93KCB0aGlzLm1vZGVsLmxldmVscy5zbGljZSggNCApLCBsZXZlbEljb25zLnNsaWNlKCA0ICkgKVxyXG4gICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgc3BhY2luZzogTEVWRUxfU0VMRUNUSU9OX1NQQUNJTkdcclxuICAgICAgICAgICAgfSApXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIHJlc2V0QWxsQnV0dG9uLmJvdHRvbSA9IHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSAtIFNJREVfTUFSR0lOO1xyXG4gICAgcmVzZXRBbGxCdXR0b24ucmlnaHQgPSB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIFNJREVfTUFSR0lOO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtUcmFuc2l0aW9uTm9kZX1cclxuICAgIHRoaXMudHJhbnNpdGlvbk5vZGUgPSBuZXcgVHJhbnNpdGlvbk5vZGUoIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LCB7XHJcbiAgICAgIGNvbnRlbnQ6IHRoaXMubGV2ZWxTZWxlY3Rpb25MYXllcixcclxuICAgICAgY2FjaGVkTm9kZXM6IFsgdGhpcy5sZXZlbFNlbGVjdGlvbkxheWVyIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMudHJhbnNpdGlvbk5vZGUgKTtcclxuXHJcbiAgICBjb25zdCBjaGFsbGVuZ2VCYWNrZ3JvdW5kID0gbmV3IE5vZGUoKTtcclxuICAgIGNvbnN0IGNoYWxsZW5nZUZvcmVncm91bmQgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIGNvbnN0IGxlZnRCdXR0b25PcHRpb25zID0ge1xyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IFNJREVfTUFSR0lOLFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IFNJREVfTUFSR0lOIC8gMlxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBjaGFsbGVuZ2VDb250cm9sQm94ID0gbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgIHRvcDogdGhpcy5sYXlvdXRCb3VuZHMudG9wICsgMTYwLFxyXG4gICAgICBsZWZ0OiB0aGlzLmxheW91dEJvdW5kcy5sZWZ0ICsgRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLk1BVENISU5HX01BUkdJTixcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgQmFja0J1dHRvbiggbWVyZ2UoIHtcclxuICAgICAgICAgIGxpc3RlbmVyKCkge1xyXG4gICAgICAgICAgICBjb25zdCBsZXZlbCA9IG1vZGVsLmxldmVsUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoYWxsZW5nZSA9IG1vZGVsLmNoYWxsZW5nZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgICAgICBtb2RlbC5sZXZlbFByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIEZvcmNlIGEgcmVmcmVzaCBvbiBhIGNvbXBsZXRlZCBsZXZlbCB3aXRoIHRoZSBiYWNrIGJ1dHRvblxyXG4gICAgICAgICAgICBpZiAoIGNoYWxsZW5nZS5pc0NvbXBsZXRlICYmIGNoYWxsZW5nZS5zdGF0ZVByb3BlcnR5LnZhbHVlID09PSBNYXRjaGluZ0NoYWxsZW5nZS5TdGF0ZS5OT19DT01QQVJJU09OICkge1xyXG4gICAgICAgICAgICAgIGxldmVsLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIGxlZnRCdXR0b25PcHRpb25zICkgKSxcclxuICAgICAgICBuZXcgUmVmcmVzaEJ1dHRvbiggbWVyZ2UoIHtcclxuICAgICAgICAgIGljb25IZWlnaHQ6IDI3LFxyXG4gICAgICAgICAgeE1hcmdpbjogOSxcclxuICAgICAgICAgIHlNYXJnaW46IDcsXHJcbiAgICAgICAgICBsaXN0ZW5lcigpIHtcclxuICAgICAgICAgICAgY29uc3QgbGV2ZWwgPSBtb2RlbC5sZXZlbFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAoIGxldmVsICkge1xyXG4gICAgICAgICAgICAgIGxldmVsLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgICBsZXZlbC5zZWxlY3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIGxlZnRCdXR0b25PcHRpb25zICkgKSxcclxuICAgICAgICAuLi4oIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuc2hvd0Fuc3dlcnMgPyBbXHJcbiAgICAgICAgICBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCBtZXJnZSgge1xyXG4gICAgICAgICAgICBjb250ZW50OiBuZXcgRmFjZU5vZGUoIDI3ICksXHJcbiAgICAgICAgICAgIGxpc3RlbmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBtb2RlbC5jaGFsbGVuZ2VQcm9wZXJ0eS52YWx1ZS5jaGVhdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCBsZWZ0QnV0dG9uT3B0aW9ucyApIClcclxuICAgICAgICBdIDogW10gKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge01hdGNoaW5nQ2hhbGxlbmdlTm9kZXxudWxsfVxyXG4gICAgdGhpcy5sYXN0Q2hhbGxlbmdlTm9kZSA9IG51bGw7XHJcbiAgICBtb2RlbC5jaGFsbGVuZ2VQcm9wZXJ0eS5sYXp5TGluayggKCBjaGFsbGVuZ2UsIG9sZENoYWxsZW5nZSApID0+IHtcclxuICAgICAgY29uc3Qgb2xkQ2hhbGxlbmdlTm9kZSA9IHRoaXMubGFzdENoYWxsZW5nZU5vZGU7XHJcblxyXG4gICAgICBpZiAoIG9sZENoYWxsZW5nZU5vZGUgKSB7XHJcbiAgICAgICAgb2xkQ2hhbGxlbmdlTm9kZS5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5sYXN0Q2hhbGxlbmdlTm9kZSA9IG51bGw7XHJcbiAgICAgIGxldCB0cmFuc2l0aW9uO1xyXG4gICAgICBpZiAoIGNoYWxsZW5nZSApIHtcclxuICAgICAgICBjb25zdCBjaGFsbGVuZ2VOb2RlID0gbmV3IE1hdGNoaW5nQ2hhbGxlbmdlTm9kZSggY2hhbGxlbmdlLCB0aGlzLmxheW91dEJvdW5kcywgZ2FtZUF1ZGlvUGxheWVyLCB7XHJcbiAgICAgICAgICByZXdhcmRDb250YWluZXI6IGNoYWxsZW5nZUJhY2tncm91bmQsXHJcbiAgICAgICAgICBvbkNvbnRpbnVlOiAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxldmVsID0gbW9kZWwubGV2ZWxQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICAgICAgbW9kZWwubGV2ZWxQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBTdGFydCBhIG5ldyBjaGFsbGVuZ2UgZm9yIHRoZSBsZXZlbFxyXG4gICAgICAgICAgICBpZiAoIGxldmVsICkge1xyXG4gICAgICAgICAgICAgIGxldmVsLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICB0aGlzLmxhc3RDaGFsbGVuZ2VOb2RlID0gY2hhbGxlbmdlTm9kZTtcclxuXHJcbiAgICAgICAgLy8gQXNzaWduIGVhY2ggY2hhbGxlbmdlIG5vZGUgd2l0aCBhIHdyYXBwZXIgcmVmZXJlbmNlLCBzbyB3ZSBjYW4gZWFzaWx5IGRpc3Bvc2UgaXQuXHJcbiAgICAgICAgY2hhbGxlbmdlTm9kZS53cmFwcGVyID0gbmV3IE5vZGUoIHtcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgIGNoYWxsZW5nZUJhY2tncm91bmQsXHJcbiAgICAgICAgICAgIGNoYWxsZW5nZUNvbnRyb2xCb3gsXHJcbiAgICAgICAgICAgIGNoYWxsZW5nZU5vZGUsXHJcbiAgICAgICAgICAgIGNoYWxsZW5nZUZvcmVncm91bmRcclxuICAgICAgICAgIF1cclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgaWYgKCBvbGRDaGFsbGVuZ2UgJiYgb2xkQ2hhbGxlbmdlLnJlZnJlc2hlZENoYWxsZW5nZSA9PT0gY2hhbGxlbmdlICkge1xyXG4gICAgICAgICAgdHJhbnNpdGlvbiA9IHRoaXMudHJhbnNpdGlvbk5vZGUuZGlzc29sdmVUbyggY2hhbGxlbmdlTm9kZS53cmFwcGVyLCB7XHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAwLjYsXHJcbiAgICAgICAgICAgIHRhcmdldE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBlYXNpbmc6IEVhc2luZy5MSU5FQVJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRyYW5zaXRpb24gPSB0aGlzLnRyYW5zaXRpb25Ob2RlLnNsaWRlTGVmdFRvKCBjaGFsbGVuZ2VOb2RlLndyYXBwZXIsIFFVQURSQVRJQ19UUkFOU0lUSU9OX09QVElPTlMgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdHJhbnNpdGlvbiA9IHRoaXMudHJhbnNpdGlvbk5vZGUuc2xpZGVSaWdodFRvKCB0aGlzLmxldmVsU2VsZWN0aW9uTGF5ZXIsIFFVQURSQVRJQ19UUkFOU0lUSU9OX09QVElPTlMgKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmRlbGF5VHJhbnNpdGlvbnMgPSB0cnVlO1xyXG4gICAgICBpZiAoIG9sZENoYWxsZW5nZU5vZGUgKSB7XHJcbiAgICAgICAgdHJhbnNpdGlvbi5lbmRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgICAgIG9sZENoYWxsZW5nZU5vZGUud3JhcHBlci5kaXNwb3NlKCk7XHJcbiAgICAgICAgICBvbGRDaGFsbGVuZ2VOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIHRoZSB2aWV3IGZvcndhcmQgaW4gdGltZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMudHJhbnNpdGlvbk5vZGUuc3RlcCggZHQgKTtcclxuXHJcbiAgICB0aGlzLmxhc3RDaGFsbGVuZ2VOb2RlICYmIHRoaXMubGFzdENoYWxsZW5nZU5vZGUuc3RlcCggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGxldmVsIGljb24gZm9yIHRoZSBnaXZlbiBsZXZlbC4gVGhpcyBpcyBwYXNzZWQgaW50byBMZXZlbFNlbGVjdGlvbkJ1dHRvbiBhcyB0aGUgaWNvbiwgYW5kIGluIG91ciBjYXNlXHJcbiAgICogaW5jbHVkZXMgdGV4dCBhYm91dCB3aGF0IGxldmVsIG51bWJlciBpdCBpcywgaW4gYWRkaXRpb24gdG8gdGhlIGljb24gZ3JhcGhpYy4gV2UgbmVlZCB0byBoYW5kbGUgdGhpcyBhbmQgcHJvdmlkZVxyXG4gICAqIHNhbWUtYm91bmRzIFwiaWNvbnNcIiBmb3IgZXZlcnkgYnV0dG9uIHNpbmNlIExldmVsU2VsZWN0aW9uQnV0dG9uIHN0aWxsIHJlc2l6ZXMgdGhlIGljb24gYmFzZWQgb24gaXRzIGJvdW5kcy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGcmFjdGlvbkxldmVsfSBsZXZlbFxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGFzTWl4ZWROdW1iZXJzXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZUxldmVsSWNvbiggbGV2ZWwsIGhhc01peGVkTnVtYmVycyApIHtcclxuICAgIGNvbnN0IGxhYmVsID0gbmV3IFRleHQoIFN0cmluZ1V0aWxzLmZpbGxJbiggbGV2ZWxUaXRsZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgbnVtYmVyOiBsZXZlbC5udW1iZXJcclxuICAgIH0gKSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE4ICksXHJcbiAgICAgIG1heFdpZHRoOiBJQ09OX0RFU0lHTl9CT1VORFMud2lkdGhcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB1bm1peGVkIG1heCB3aWR0aCB+MTA2LCBtaXhlZCB+MjE3XHJcbiAgICBjb25zdCBzaGFwZVBhcnRpdGlvbiA9IExFVkVMX1NIQVBFX1BBUlRJVElPTlNbIGxldmVsLm51bWJlciAtIDEgXTtcclxuICAgIGNvbnN0IGNvbG9yID0gTEVWRUxfQ09MT1JTWyBsZXZlbC5udW1iZXIgLSAxIF07XHJcbiAgICBjb25zdCBmaWxsZWRQYXJ0aXRpb25zID0gW1xyXG4gICAgICBuZXcgRmlsbGVkUGFydGl0aW9uKCBzaGFwZVBhcnRpdGlvbiwgXy50aW1lcyggbGV2ZWwubnVtYmVyLCAoKSA9PiB0cnVlICksIGNvbG9yICksXHJcbiAgICAgIC4uLiggaGFzTWl4ZWROdW1iZXJzID8gW1xyXG4gICAgICAgIG5ldyBGaWxsZWRQYXJ0aXRpb24oIHNoYXBlUGFydGl0aW9uLCBbIHRydWUsIC4uLl8udGltZXMoIGxldmVsLm51bWJlciAtIDEsICgpID0+IGZhbHNlICkgXSwgY29sb3IgKVxyXG4gICAgICBdIDogW10gKVxyXG4gICAgXTtcclxuICAgIGNvbnN0IGljb24gPSBuZXcgSEJveCgge1xyXG4gICAgICBzcGFjaW5nOiA1LFxyXG4gICAgICBjaGlsZHJlbjogZmlsbGVkUGFydGl0aW9ucy5tYXAoIGZpbGxlZFBhcnRpdGlvbiA9PiBuZXcgRmlsbGVkUGFydGl0aW9uTm9kZSggZmlsbGVkUGFydGl0aW9uLCB7XHJcbiAgICAgICAgYm9yZGVyTGluZVdpZHRoOiBGcmFjdGlvbnNDb21tb25Db25zdGFudHMuTUFUQ0hJTkdfQk9SREVSXHJcbiAgICAgIH0gKSApLFxyXG4gICAgICBzY2FsZTogaGFzTWl4ZWROdW1iZXJzID8gMC41IDogMC44XHJcbiAgICB9ICk7XHJcblxyXG4gICAgbGFiZWwuY2VudGVyWCA9IElDT05fREVTSUdOX0JPVU5EUy5jZW50ZXJYO1xyXG4gICAgbGFiZWwudG9wID0gSUNPTl9ERVNJR05fQk9VTkRTLnRvcDtcclxuXHJcbiAgICBjb25zdCBpY29uQ29udGFpbmVyID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgaWNvbiBdLFxyXG4gICAgICBtYXhXaWR0aDogSUNPTl9ERVNJR05fQk9VTkRTLndpZHRoXHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWNvbkNvbnRhaW5lci5jZW50ZXJYID0gSUNPTl9ERVNJR05fQk9VTkRTLmNlbnRlclg7XHJcbiAgICBpY29uQ29udGFpbmVyLmNlbnRlclkgPSAoIGxhYmVsLmJvdHRvbSArIElDT05fREVTSUdOX0JPVU5EUy5ib3R0b20gKSAvIDI7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggSUNPTl9ERVNJR05fQk9VTkRTLmNvbnRhaW5zQm91bmRzKCBsYWJlbC5ib3VuZHMgKSwgJ1Nhbml0eSBjaGVjayBmb3IgbGV2ZWwgaWNvbiBsYXlvdXQnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBJQ09OX0RFU0lHTl9CT1VORFMuY29udGFpbnNCb3VuZHMoIGljb25Db250YWluZXIuYm91bmRzICksICdTYW5pdHkgY2hlY2sgZm9yIGxldmVsIGljb24gbGF5b3V0JyApO1xyXG5cclxuICAgIHJldHVybiBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBsYWJlbCwgaWNvbkNvbnRhaW5lciBdLFxyXG4gICAgICBsb2NhbEJvdW5kczogSUNPTl9ERVNJR05fQk9VTkRTXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcm93IG9mIGxldmVsIHNlbGVjdGlvbiBidXR0b25zLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxNYXRjaGluZ0xldmVsPn0gbGV2ZWxzXHJcbiAgICogQHBhcmFtIHtBcnJheS48Tm9kZT59IGljb25zXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICovXHJcbiAgY3JlYXRlTGV2ZWxSb3coIGxldmVscywgaWNvbnMgKSB7XHJcbiAgICByZXR1cm4gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IGxldmVscy5tYXAoICggbGV2ZWwsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9IG5ldyBMZXZlbFNlbGVjdGlvbkJ1dHRvbiggaWNvbnNbIGluZGV4IF0sIGxldmVsLmxldmVsU2VsZWN0aW9uU2NvcmVQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgYnV0dG9uV2lkdGg6IDExMCxcclxuICAgICAgICAgIGJ1dHRvbkhlaWdodDogMjAwLFxyXG4gICAgICAgICAgY3JlYXRlU2NvcmVEaXNwbGF5OiBzY29yZVByb3BlcnR5ID0+IG5ldyBTY29yZURpc3BsYXlTdGFycyggc2NvcmVQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgICBudW1iZXJPZlN0YXJzOiAzLFxyXG4gICAgICAgICAgICBwZXJmZWN0U2NvcmU6IDEyXHJcbiAgICAgICAgICB9ICksXHJcbiAgICAgICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmxldmVsUHJvcGVydHkudmFsdWUgPSBsZXZlbDtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBiYXNlQ29sb3I6IEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5tYXRjaGluZ0xldmVsQmFja2dyb3VuZFByb3BlcnR5LFxyXG4gICAgICAgICAgLy8gV29ya2Fyb3VuZCBzaW5jZSBpdCBleHBlY3RzIDAgYXMgdGhlIGJlc3QgdGltZSBpZiB0aGVyZSB3YXMgbm8gYmVzdCB0aW1lLiBEb24ndCBzb2x2ZSBsZXZlbHMgaW5cclxuICAgICAgICAgIC8vIHVuZGVyIGEgc2Vjb25kIVxyXG4gICAgICAgICAgYmVzdFRpbWVQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBsZXZlbC5iZXN0VGltZVByb3BlcnR5IF0sIGJlc3RUaW1lID0+IGlzRmluaXRlKCBiZXN0VGltZSApID8gYmVzdFRpbWUgOiAwICksXHJcbiAgICAgICAgICBiZXN0VGltZVZpc2libGVQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBsZXZlbC50aW1lVmlzaWJsZVByb3BlcnR5LCBsZXZlbC5sZXZlbFNlbGVjdGlvblNjb3JlUHJvcGVydHkgXSwgKCB0aW1lVmlzaWJsZSwgc2NvcmUgKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aW1lVmlzaWJsZSAmJiBzY29yZSA9PT0gMTI7XHJcbiAgICAgICAgICB9ICksXHJcbiAgICAgICAgICBiZXN0VGltZVlTcGFjaW5nOiA1XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHJldHVybiBidXR0b247XHJcbiAgICAgIH0gKSxcclxuICAgICAgc3BhY2luZzogTEVWRUxfU0VMRUNUSU9OX1NQQUNJTkdcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBob21lLXNjcmVlbiBpY29uIGZvciB0aGUgbWFpbiAobm9uLW1peGVkKSBzY3JlZW4uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZUludHJvSG9tZUljb24oKSB7XHJcbiAgICBjb25zdCByZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUud2lkdGgsIFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS5oZWlnaHQsIHtcclxuICAgICAgZmlsbDogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm1hdGNoaW5nSG9tZUljb25CYWNrZ3JvdW5kUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICByZWN0YW5nbGUuYWRkQ2hpbGQoIG5ldyBIQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDIwLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBGaWxsZWRQYXJ0aXRpb25Ob2RlKCBuZXcgRmlsbGVkUGFydGl0aW9uKCBzZWxlY3QoIFNoYXBlUGFydGl0aW9uLlBJRVMsIDIgKSwgWyBmYWxzZSwgdHJ1ZSBdLCBGcmFjdGlvbnNDb21tb25Db2xvcnMuc2hhcGVCbHVlUHJvcGVydHkgKSwge1xyXG4gICAgICAgICAgc2NhbGU6IDIuNSxcclxuICAgICAgICAgIGJvcmRlckxpbmVXaWR0aDogRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLk1BVENISU5HX0JPUkRFUlxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBuZXcgVGV4dCggJz0nLCB7IGZpbGw6ICdibGFjaycsIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTYwICkgfSApLFxyXG4gICAgICAgIG5ldyBNaXhlZEZyYWN0aW9uTm9kZSgge1xyXG4gICAgICAgICAgbnVtZXJhdG9yOiAxLFxyXG4gICAgICAgICAgZGVub21pbmF0b3I6IDIsXHJcbiAgICAgICAgICB2aW5jdWx1bUV4dGVuc2lvbjogNSxcclxuICAgICAgICAgIHNjYWxlOiAzXHJcbiAgICAgICAgfSApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNlbnRlcjogcmVjdGFuZ2xlLmNlbnRlclxyXG4gICAgfSApICk7XHJcblxyXG4gICAgcmV0dXJuIHJlY3RhbmdsZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBuYXZiYXIgaWNvbiBmb3IgdGhlIG1haW4gKG5vbi1taXhlZCkgc2NyZWVuLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtOb2RlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVJbnRyb05hdmJhckljb24oKSB7XHJcbiAgICBjb25zdCByZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUud2lkdGgsIFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS5oZWlnaHQsIHtcclxuICAgICAgZmlsbDogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm1hdGNoaW5nTmF2YmFySWNvbkJhY2tncm91bmRQcm9wZXJ0eSxcclxuICAgICAgYm9yZGVyTGluZVdpZHRoOiBGcmFjdGlvbnNDb21tb25Db25zdGFudHMuTUFUQ0hJTkdfQk9SREVSXHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmVjdGFuZ2xlLmFkZENoaWxkKCBuZXcgRmlsbGVkUGFydGl0aW9uTm9kZSggbmV3IEZpbGxlZFBhcnRpdGlvbiggc2VsZWN0KCBTaGFwZVBhcnRpdGlvbi5QSUVTLCAyICksIFsgZmFsc2UsIHRydWUgXSwgRnJhY3Rpb25zQ29tbW9uQ29sb3JzLnNoYXBlQmx1ZVByb3BlcnR5ICksIHtcclxuICAgICAgY2VudGVyOiByZWN0YW5nbGUuY2VudGVyLFxyXG4gICAgICBzY2FsZTogNFxyXG4gICAgfSApICk7XHJcblxyXG4gICAgcmV0dXJuIHJlY3RhbmdsZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBob21lLXNjcmVlbiBpY29uIGZvciB0aGUgbWl4ZWQgc2NyZWVuLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtOb2RlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVNaXhlZEhvbWVJY29uKCkge1xyXG4gICAgY29uc3QgcmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLndpZHRoLCBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUuaGVpZ2h0LCB7XHJcbiAgICAgIGZpbGw6IEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5tYXRjaGluZ0hvbWVJY29uQmFja2dyb3VuZFByb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmVjdGFuZ2xlLmFkZENoaWxkKCBuZXcgSEJveCgge1xyXG4gICAgICBzcGFjaW5nOiAxNSxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgSEJveCgge1xyXG4gICAgICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICBuZXcgRmlsbGVkUGFydGl0aW9uTm9kZSggbmV3IEZpbGxlZFBhcnRpdGlvbiggU2hhcGVQYXJ0aXRpb24uU0lYX0ZMT1dFUiwgWyB0cnVlLCB0cnVlLCB0cnVlLCB0cnVlLCB0cnVlLCB0cnVlIF0sIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5zaGFwZVJlZFByb3BlcnR5ICksIHtcclxuICAgICAgICAgICAgICBib3JkZXJMaW5lV2lkdGg6IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5NQVRDSElOR19CT1JERVJcclxuICAgICAgICAgICAgfSApLFxyXG4gICAgICAgICAgICBuZXcgRmlsbGVkUGFydGl0aW9uTm9kZSggbmV3IEZpbGxlZFBhcnRpdGlvbiggU2hhcGVQYXJ0aXRpb24uU0lYX0ZMT1dFUiwgWyBmYWxzZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UsIGZhbHNlIF0sIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5zaGFwZVJlZFByb3BlcnR5ICksIHtcclxuICAgICAgICAgICAgICBib3JkZXJMaW5lV2lkdGg6IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5NQVRDSElOR19CT1JERVJcclxuICAgICAgICAgICAgfSApXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgc2NhbGU6IDEuMlxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBuZXcgVGV4dCggJz0nLCB7IGZpbGw6ICdibGFjaycsIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTYwICkgfSApLFxyXG4gICAgICAgIG5ldyBNaXhlZEZyYWN0aW9uTm9kZSgge1xyXG4gICAgICAgICAgd2hvbGU6IDEsXHJcbiAgICAgICAgICBudW1lcmF0b3I6IDEsXHJcbiAgICAgICAgICBkZW5vbWluYXRvcjogMixcclxuICAgICAgICAgIHZpbmN1bHVtRXh0ZW5zaW9uOiAzLFxyXG4gICAgICAgICAgc2NhbGU6IDNcclxuICAgICAgICB9IClcclxuICAgICAgXSxcclxuICAgICAgY2VudGVyOiByZWN0YW5nbGUuY2VudGVyXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICByZXR1cm4gcmVjdGFuZ2xlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIG5hdmJhciBpY29uIGZvciB0aGUgbWl4ZWQgc2NyZWVuLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtOb2RlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVNaXhlZE5hdmJhckljb24oKSB7XHJcbiAgICBjb25zdCByZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUud2lkdGgsIFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS5oZWlnaHQsIHtcclxuICAgICAgZmlsbDogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm1hdGNoaW5nTmF2YmFySWNvbkJhY2tncm91bmRQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIHJlY3RhbmdsZS5hZGRDaGlsZCggbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogNSxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgRmlsbGVkUGFydGl0aW9uTm9kZSggbmV3IEZpbGxlZFBhcnRpdGlvbiggU2hhcGVQYXJ0aXRpb24uU0lYX0ZMT1dFUiwgWyB0cnVlLCB0cnVlLCB0cnVlLCB0cnVlLCB0cnVlLCB0cnVlIF0sIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5zaGFwZVJlZFByb3BlcnR5ICksIHtcclxuICAgICAgICAgIGJvcmRlckxpbmVXaWR0aDogRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLk1BVENISU5HX0JPUkRFUlxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBuZXcgRmlsbGVkUGFydGl0aW9uTm9kZSggbmV3IEZpbGxlZFBhcnRpdGlvbiggU2hhcGVQYXJ0aXRpb24uU0lYX0ZMT1dFUiwgWyBmYWxzZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UsIGZhbHNlIF0sIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5zaGFwZVJlZFByb3BlcnR5ICksIHtcclxuICAgICAgICAgIGJvcmRlckxpbmVXaWR0aDogRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLk1BVENISU5HX0JPUkRFUlxyXG4gICAgICAgIH0gKVxyXG4gICAgICBdLFxyXG4gICAgICBjZW50ZXI6IHJlY3RhbmdsZS5jZW50ZXIsXHJcbiAgICAgIHNjYWxlOiAyLjVcclxuICAgIH0gKSApO1xyXG5cclxuICAgIHJldHVybiByZWN0YW5nbGU7XHJcbiAgfVxyXG59XHJcblxyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdNYXRjaGluZ0dhbWVTY3JlZW5WaWV3JywgTWF0Y2hpbmdHYW1lU2NyZWVuVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBNYXRjaGluZ0dhbWVTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLGdDQUFnQztBQUNuRCxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxVQUFVLE1BQU0sbURBQW1EO0FBQzFFLE9BQU9DLGFBQWEsTUFBTSxzREFBc0Q7QUFDaEYsT0FBT0MsY0FBYyxNQUFNLHVEQUF1RDtBQUNsRixPQUFPQyxpQkFBaUIsTUFBTSwwREFBMEQ7QUFDeEYsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxpQkFBaUIsTUFBTSxrREFBa0Q7QUFDaEYsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDckYsT0FBT0MscUJBQXFCLE1BQU0scURBQXFEO0FBQ3ZGLE9BQU9D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