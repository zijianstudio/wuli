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
  constructor(challenge, layoutBounds, gameAudioPlayer, options) {
    super();
    options = merge({
      // {function} - Called when the "continue" button is pressed on the level-complete node
      onContinue: () => {},
      // {Node} - Where the reward node is placed.
      rewardContainer: new Node()
    }, options);

    // @private {MatchingChallenge}
    this.challenge = challenge;

    // Will fire once we have piece nodes initialized, so the equals signs can be properly positioned in targets.
    const layoutCompleteEmitter = new Emitter();

    // @private {RewardNode|null}
    this.rewardNode = null;
    const targetWidth = (layoutBounds.width - PADDING * (NUM_TARGETS + 1)) / NUM_TARGETS;
    let targetBottom;

    // Targets
    challenge.targets.forEach((target, index) => {
      const targetBackground = new Rectangle(0, 0, targetWidth, 100, {
        cornerRadius: 10,
        fill: FractionsCommonColors.matchingTargetBackgroundProperty,
        x: layoutBounds.left + PADDING + (targetWidth + PADDING) * index,
        y: layoutBounds.top + PADDING
      });
      this.addChild(targetBackground);
      target.targetBoundsProperty.value = targetBackground.bounds;
      const equalsSign = new Text(MathSymbols.EQUAL_TO, {
        font: new PhetFont({
          size: 26
        }),
        center: targetBackground.center,
        visible: false
      });
      this.addChild(equalsSign);
      target.equalsSignBounds = equalsSign.localBounds;
      const xListener = x => {
        equalsSign.centerX = x;
      };
      target.equalsXProperty.link(xListener);
      this.disposeEmitter.addListener(() => {
        target.equalsXProperty.unlink(xListener);
      });
      const filledListener = filled => {
        equalsSign.visible = filled;
      };
      target.isFilledProperty.link(filledListener);
      this.disposeEmitter.addListener(() => {
        target.isFilledProperty.unlink(filledListener);
      });
      if (!target.isFilledProperty.value) {
        const CENTER_WEIGHT = 0.5;
        const y = targetBackground.centerY;
        target.spots[0].positionProperty.value = new Vector2((1 - CENTER_WEIGHT) * targetBackground.left + CENTER_WEIGHT * targetBackground.centerX, y);
        target.spots[1].positionProperty.value = new Vector2((1 - CENTER_WEIGHT) * targetBackground.right + CENTER_WEIGHT * targetBackground.centerX, y);
      }
      targetBottom = targetBackground.bottom;
    });

    // Scales
    _.range(0, 2).forEach(index => {
      const scaleNode = new Image(scale_png, {
        centerX: layoutBounds.centerX + (index - 0.5) * 380,
        y: 260,
        scale: 0.52
      });
      this.addChild(scaleNode);
      challenge.scaleSpots[index].positionProperty.value = scaleNode.centerTop.plusXY(0, 30);
    });

    // Sources
    _.range(0, NUM_TARGETS).forEach(col => _.range(0, 2).forEach(row => {
      const x = layoutBounds.centerX + TARGET_WIDTH * (col - NUM_TARGETS / 2);
      const y = TARGETS_TOP + TARGET_HEIGHT * row;
      const sourceNode = new Rectangle(x, y, TARGET_WIDTH, TARGET_HEIGHT, {
        fill: FractionsCommonColors.matchingSourceBackgroundProperty,
        stroke: FractionsCommonColors.matchingSourceBorderProperty,
        lineWidth: 1.5
      });
      this.addChild(sourceNode);
      challenge.sourceSpots[col + row * NUM_TARGETS].positionProperty.value = sourceNode.center;
    }));
    this.addChild(new Text(myMatchesString, {
      font: new PhetFont({
        size: 18,
        weight: 'bold'
      }),
      left: layoutBounds.left + PADDING,
      top: targetBottom + 5,
      maxWidth: 300
    }));
    const rightTextOptions = {
      font: new PhetFont({
        size: 15,
        weight: 'bold'
      }),
      maxWidth: 300
    };
    const levelText = new Text(StringUtils.format(labelLevelString, challenge.levelNumber), rightTextOptions);
    const scoreText = new Text('', rightTextOptions);
    const timeText = new Text('', rightTextOptions);
    this.addChild(new AlignBox(new VBox({
      spacing: 5,
      align: 'right',
      children: [levelText, scoreText, timeText],
      excludeInvisibleChildrenFromBounds: false
    }), {
      alignBounds: layoutBounds.withMinY(targetBottom),
      xAlign: 'right',
      yAlign: 'top',
      xMargin: PADDING,
      yMargin: 10
    }));

    // @private {function}
    this.scoreListener = score => {
      scoreText.string = StringUtils.format(labelScorePatternString, score);
    };
    this.timeListener = time => {
      timeText.string = StringUtils.format(timeNumberSecString, Utils.toFixed(time, 0));
    };
    this.timeVisibleListener = visible => {
      timeText.visible = visible;
    };
    this.challenge.scoreProperty.link(this.scoreListener);
    this.challenge.elapsedTimeProperty.link(this.timeListener);
    this.challenge.timeVisibleProperty.link(this.timeVisibleListener);
    this.disposeEmitter.addListener(() => {
      this.challenge.scoreProperty.unlink(this.scoreListener);
      this.challenge.elapsedTimeProperty.unlink(this.timeListener);
      this.challenge.timeVisibleProperty.unlink(this.timeVisibleListener);
    });

    // @private {MatchChartNode}
    this.chartNode = new MatchChartNode({
      centerX: layoutBounds.centerX,
      top: targetBottom + 10
    });
    this.addChild(this.chartNode);
    const chartCompare = () => {
      const leftPiece = challenge.scaleSpots[0].pieceProperty.value;
      const rightPiece = challenge.scaleSpots[1].pieceProperty.value;
      this.chartNode.compare(leftPiece.fraction.value, rightPiece.fraction.value, leftPiece.getColor(), rightPiece.getColor());
    };
    const faceNode = new FaceWithPointsNode({
      spacing: 8,
      pointsAlignment: 'rightCenter',
      faceDiameter: 120,
      pointsFont: new PhetFont({
        size: 26,
        weight: 'bold'
      }),
      centerX: layoutBounds.right - 150,
      centerY: 250
    });
    this.addChild(faceNode);
    const buttonOptions = {
      font: new PhetFont({
        size: 22,
        weight: 'bold'
      }),
      centerX: faceNode.centerX,
      centerY: faceNode.bottom + 30,
      maxTextWidth: 150
    };
    const checkButton = new TextPushButton(checkString, merge({
      baseColor: FractionsCommonColors.matchingCheckButtonProperty,
      listener: () => {
        chartCompare();
        challenge.compare();
      }
    }, buttonOptions));
    this.addChild(checkButton);
    this.disposeEmitter.addListener(() => checkButton.dispose());
    const okButton = new TextPushButton(okString, merge({
      baseColor: FractionsCommonColors.matchingOkButtonProperty,
      listener: () => challenge.collect()
    }, buttonOptions));
    this.addChild(okButton);
    this.disposeEmitter.addListener(() => okButton.dispose());
    const tryAgainButton = new TextPushButton(tryAgainString, merge({
      baseColor: FractionsCommonColors.matchingTryAgainButtonProperty,
      listener: () => challenge.tryAgain()
    }, buttonOptions));
    this.addChild(tryAgainButton);
    this.disposeEmitter.addListener(() => tryAgainButton.dispose());
    const showAnswerButton = new TextPushButton(showAnswerString, merge({
      baseColor: FractionsCommonColors.matchingShowAnswerButtonProperty,
      listener: () => {
        challenge.showAnswer();
        chartCompare();
      }
    }, buttonOptions));
    this.addChild(showAnswerButton);
    this.disposeEmitter.addListener(() => showAnswerButton.dispose());

    // @private {Node}
    this.pieceLayer = new Node();
    this.addChild(this.pieceLayer);

    // @private {function}
    this.stateListener = state => {
      checkButton.visible = state === MatchingChallenge.State.COMPARISON;
      okButton.visible = state === MatchingChallenge.State.MATCHED;
      tryAgainButton.visible = state === MatchingChallenge.State.TRY_AGAIN;
      showAnswerButton.visible = state === MatchingChallenge.State.SHOW_ANSWER;
      faceNode.visible = state === MatchingChallenge.State.MATCHED && challenge.lastScoreGainProperty.value > 0;
      if (state === MatchingChallenge.State.COMPARISON || state === MatchingChallenge.State.NO_COMPARISON) {
        this.chartNode.visible = false;
      }
      this.pieceLayer.pickable = state === MatchingChallenge.State.SHOW_ANSWER || state === MatchingChallenge.State.MATCHED ? false : null;
    };
    this.challenge.stateProperty.link(this.stateListener);
    this.disposeEmitter.addListener(() => {
      this.challenge.stateProperty.unlink(this.stateListener);
    });
    const correctListener = () => gameAudioPlayer.correctAnswer();
    const incorrectListener = () => gameAudioPlayer.wrongAnswer();
    this.challenge.correctEmitter.addListener(correctListener);
    this.challenge.incorrectEmitter.addListener(incorrectListener);
    this.disposeEmitter.addListener(() => {
      this.challenge.correctEmitter.removeListener(correctListener);
      this.challenge.incorrectEmitter.removeListener(incorrectListener);
    });

    // @private {function}
    this.lastScoreGainListener = lastScoreGain => {
      faceNode.setPoints(lastScoreGain);
    };
    this.challenge.lastScoreGainProperty.link(this.lastScoreGainListener);
    this.disposeEmitter.addListener(() => {
      this.challenge.lastScoreGainProperty.unlink(this.lastScoreGainListener);
    });
    const pieceNodes = [];
    challenge.pieces.forEach(piece => {
      const pieceNode = new MatchPieceNode(piece);
      pieceNodes.push(pieceNode);
      this.pieceLayer.addChild(pieceNode);
    });
    this.disposeEmitter.addListener(() => {
      this.pieceLayer.children.forEach(pieceNode => pieceNode.dispose());
    });
    const completedListener = () => {
      if (challenge.scoreProperty.value === 12) {
        gameAudioPlayer.gameOverPerfectScore();
        this.rewardNode = new RewardNode({
          pickable: false,
          nodes: [..._.times(8, () => new StarNode()), ..._.times(8, () => new FaceNode(40, {
            headStroke: 'black',
            headLineWidth: 1.5
          })), ...RewardNode.createRandomNodes(challenge.pieces.map(piece => {
            return new MatchPieceNode(piece.copy());
          }), 100)]
        });
        options.rewardContainer.addChild(this.rewardNode);
      }
      const bestTime = challenge.scoreProperty.value === 12 ? Utils.toFixed(Math.min(challenge.elapsedTimeProperty.value, challenge.previousBestTime), 0) : null;
      const levelCompletedNode = new LevelCompletedNode(challenge.levelNumber, challenge.scoreProperty.value, 12, 3, challenge.timeVisibleProperty.value, Utils.toFixed(challenge.elapsedTimeProperty.value, 0), bestTime, challenge.isNewBestTime, options.onContinue, {
        center: layoutBounds.center,
        contentMaxWidth: 600
      });
      this.addChild(levelCompletedNode);
      this.disposeEmitter.addListener(() => {
        levelCompletedNode.dispose();
        if (this.rewardNode) {
          this.rewardNode.dispose();
          this.rewardNode = null;
        }
      });
    };
    this.challenge.completedEmitter.addListener(completedListener);
    this.disposeEmitter.addListener(() => {
      this.challenge.completedEmitter.removeListener(completedListener);
    });
    layoutCompleteEmitter.emit();
  }

  /**
   * Steps the view forward in time.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    this.rewardNode && this.rewardNode.step(dt);
    this.chartNode.step(dt);
  }
}
fractionsCommon.register('MatchingChallengeNode', MatchingChallengeNode);
export default MatchingChallengeNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiVXRpbHMiLCJWZWN0b3IyIiwibWVyZ2UiLCJTdHJpbmdVdGlscyIsIkZhY2VOb2RlIiwiRmFjZVdpdGhQb2ludHNOb2RlIiwiTWF0aFN5bWJvbHMiLCJQaGV0Rm9udCIsIlN0YXJOb2RlIiwiQWxpZ25Cb3giLCJJbWFnZSIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiVkJveCIsIlRleHRQdXNoQnV0dG9uIiwiTGV2ZWxDb21wbGV0ZWROb2RlIiwiUmV3YXJkTm9kZSIsIlZlZ2FzU3RyaW5ncyIsInNjYWxlX3BuZyIsIkZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cyIsIkZyYWN0aW9uc0NvbW1vbkNvbG9ycyIsImZyYWN0aW9uc0NvbW1vbiIsIkZyYWN0aW9uc0NvbW1vblN0cmluZ3MiLCJNYXRjaGluZ0NoYWxsZW5nZSIsIk1hdGNoQ2hhcnROb2RlIiwiTWF0Y2hQaWVjZU5vZGUiLCJjaGVja1N0cmluZyIsImNoZWNrIiwibGFiZWxMZXZlbFN0cmluZyIsImxhYmVsIiwibGV2ZWwiLCJsYWJlbFNjb3JlUGF0dGVyblN0cmluZyIsInNjb3JlUGF0dGVybiIsIm15TWF0Y2hlc1N0cmluZyIsIm15TWF0Y2hlcyIsIm9rU3RyaW5nIiwib2siLCJzaG93QW5zd2VyU3RyaW5nIiwic2hvd0Fuc3dlciIsInRpbWVOdW1iZXJTZWNTdHJpbmciLCJ0aW1lTnVtYmVyU2VjIiwidHJ5QWdhaW5TdHJpbmciLCJ0cnlBZ2FpbiIsIlBBRERJTkciLCJNQVRDSElOR19NQVJHSU4iLCJOVU1fVEFSR0VUUyIsIlRBUkdFVF9XSURUSCIsIkRJTUVOU0lPTiIsIndpZHRoIiwiVEFSR0VUX0hFSUdIVCIsImhlaWdodCIsIlRBUkdFVFNfVE9QIiwiTWF0Y2hpbmdDaGFsbGVuZ2VOb2RlIiwiY29uc3RydWN0b3IiLCJjaGFsbGVuZ2UiLCJsYXlvdXRCb3VuZHMiLCJnYW1lQXVkaW9QbGF5ZXIiLCJvcHRpb25zIiwib25Db250aW51ZSIsInJld2FyZENvbnRhaW5lciIsImxheW91dENvbXBsZXRlRW1pdHRlciIsInJld2FyZE5vZGUiLCJ0YXJnZXRXaWR0aCIsInRhcmdldEJvdHRvbSIsInRhcmdldHMiLCJmb3JFYWNoIiwidGFyZ2V0IiwiaW5kZXgiLCJ0YXJnZXRCYWNrZ3JvdW5kIiwiY29ybmVyUmFkaXVzIiwiZmlsbCIsIm1hdGNoaW5nVGFyZ2V0QmFja2dyb3VuZFByb3BlcnR5IiwieCIsImxlZnQiLCJ5IiwidG9wIiwiYWRkQ2hpbGQiLCJ0YXJnZXRCb3VuZHNQcm9wZXJ0eSIsInZhbHVlIiwiYm91bmRzIiwiZXF1YWxzU2lnbiIsIkVRVUFMX1RPIiwiZm9udCIsInNpemUiLCJjZW50ZXIiLCJ2aXNpYmxlIiwiZXF1YWxzU2lnbkJvdW5kcyIsImxvY2FsQm91bmRzIiwieExpc3RlbmVyIiwiY2VudGVyWCIsImVxdWFsc1hQcm9wZXJ0eSIsImxpbmsiLCJkaXNwb3NlRW1pdHRlciIsImFkZExpc3RlbmVyIiwidW5saW5rIiwiZmlsbGVkTGlzdGVuZXIiLCJmaWxsZWQiLCJpc0ZpbGxlZFByb3BlcnR5IiwiQ0VOVEVSX1dFSUdIVCIsImNlbnRlclkiLCJzcG90cyIsInBvc2l0aW9uUHJvcGVydHkiLCJyaWdodCIsImJvdHRvbSIsIl8iLCJyYW5nZSIsInNjYWxlTm9kZSIsInNjYWxlIiwic2NhbGVTcG90cyIsImNlbnRlclRvcCIsInBsdXNYWSIsImNvbCIsInJvdyIsInNvdXJjZU5vZGUiLCJtYXRjaGluZ1NvdXJjZUJhY2tncm91bmRQcm9wZXJ0eSIsInN0cm9rZSIsIm1hdGNoaW5nU291cmNlQm9yZGVyUHJvcGVydHkiLCJsaW5lV2lkdGgiLCJzb3VyY2VTcG90cyIsIndlaWdodCIsIm1heFdpZHRoIiwicmlnaHRUZXh0T3B0aW9ucyIsImxldmVsVGV4dCIsImZvcm1hdCIsImxldmVsTnVtYmVyIiwic2NvcmVUZXh0IiwidGltZVRleHQiLCJzcGFjaW5nIiwiYWxpZ24iLCJjaGlsZHJlbiIsImV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMiLCJhbGlnbkJvdW5kcyIsIndpdGhNaW5ZIiwieEFsaWduIiwieUFsaWduIiwieE1hcmdpbiIsInlNYXJnaW4iLCJzY29yZUxpc3RlbmVyIiwic2NvcmUiLCJzdHJpbmciLCJ0aW1lTGlzdGVuZXIiLCJ0aW1lIiwidG9GaXhlZCIsInRpbWVWaXNpYmxlTGlzdGVuZXIiLCJzY29yZVByb3BlcnR5IiwiZWxhcHNlZFRpbWVQcm9wZXJ0eSIsInRpbWVWaXNpYmxlUHJvcGVydHkiLCJjaGFydE5vZGUiLCJjaGFydENvbXBhcmUiLCJsZWZ0UGllY2UiLCJwaWVjZVByb3BlcnR5IiwicmlnaHRQaWVjZSIsImNvbXBhcmUiLCJmcmFjdGlvbiIsImdldENvbG9yIiwiZmFjZU5vZGUiLCJwb2ludHNBbGlnbm1lbnQiLCJmYWNlRGlhbWV0ZXIiLCJwb2ludHNGb250IiwiYnV0dG9uT3B0aW9ucyIsIm1heFRleHRXaWR0aCIsImNoZWNrQnV0dG9uIiwiYmFzZUNvbG9yIiwibWF0Y2hpbmdDaGVja0J1dHRvblByb3BlcnR5IiwibGlzdGVuZXIiLCJkaXNwb3NlIiwib2tCdXR0b24iLCJtYXRjaGluZ09rQnV0dG9uUHJvcGVydHkiLCJjb2xsZWN0IiwidHJ5QWdhaW5CdXR0b24iLCJtYXRjaGluZ1RyeUFnYWluQnV0dG9uUHJvcGVydHkiLCJzaG93QW5zd2VyQnV0dG9uIiwibWF0Y2hpbmdTaG93QW5zd2VyQnV0dG9uUHJvcGVydHkiLCJwaWVjZUxheWVyIiwic3RhdGVMaXN0ZW5lciIsInN0YXRlIiwiU3RhdGUiLCJDT01QQVJJU09OIiwiTUFUQ0hFRCIsIlRSWV9BR0FJTiIsIlNIT1dfQU5TV0VSIiwibGFzdFNjb3JlR2FpblByb3BlcnR5IiwiTk9fQ09NUEFSSVNPTiIsInBpY2thYmxlIiwic3RhdGVQcm9wZXJ0eSIsImNvcnJlY3RMaXN0ZW5lciIsImNvcnJlY3RBbnN3ZXIiLCJpbmNvcnJlY3RMaXN0ZW5lciIsIndyb25nQW5zd2VyIiwiY29ycmVjdEVtaXR0ZXIiLCJpbmNvcnJlY3RFbWl0dGVyIiwicmVtb3ZlTGlzdGVuZXIiLCJsYXN0U2NvcmVHYWluTGlzdGVuZXIiLCJsYXN0U2NvcmVHYWluIiwic2V0UG9pbnRzIiwicGllY2VOb2RlcyIsInBpZWNlcyIsInBpZWNlIiwicGllY2VOb2RlIiwicHVzaCIsImNvbXBsZXRlZExpc3RlbmVyIiwiZ2FtZU92ZXJQZXJmZWN0U2NvcmUiLCJub2RlcyIsInRpbWVzIiwiaGVhZFN0cm9rZSIsImhlYWRMaW5lV2lkdGgiLCJjcmVhdGVSYW5kb21Ob2RlcyIsIm1hcCIsImNvcHkiLCJiZXN0VGltZSIsIk1hdGgiLCJtaW4iLCJwcmV2aW91c0Jlc3RUaW1lIiwibGV2ZWxDb21wbGV0ZWROb2RlIiwiaXNOZXdCZXN0VGltZSIsImNvbnRlbnRNYXhXaWR0aCIsImNvbXBsZXRlZEVtaXR0ZXIiLCJlbWl0Iiwic3RlcCIsImR0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYXRjaGluZ0NoYWxsZW5nZU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBmb3IgYSBzaW5nbGUgTWF0Y2hpbmdDaGFsbGVuZ2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICogQGF1dGhvciBBbnRvbiBVbHlhbm92IChNbGVhcm5lcilcclxuICovXHJcblxyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBGYWNlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvRmFjZU5vZGUuanMnO1xyXG5pbXBvcnQgRmFjZVdpdGhQb2ludHNOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GYWNlV2l0aFBvaW50c05vZGUuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBTdGFyTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3Rhck5vZGUuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkJveCwgSW1hZ2UsIE5vZGUsIFJlY3RhbmdsZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUZXh0UHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9UZXh0UHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBMZXZlbENvbXBsZXRlZE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvTGV2ZWxDb21wbGV0ZWROb2RlLmpzJztcclxuaW1wb3J0IFJld2FyZE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvUmV3YXJkTm9kZS5qcyc7XHJcbmltcG9ydCBWZWdhc1N0cmluZ3MgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvVmVnYXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IHNjYWxlX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvc2NhbGVfcG5nLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9GcmFjdGlvbnNDb21tb25Db2xvcnMuanMnO1xyXG5pbXBvcnQgZnJhY3Rpb25zQ29tbW9uIGZyb20gJy4uLy4uL2ZyYWN0aW9uc0NvbW1vbi5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbnNDb21tb25TdHJpbmdzIGZyb20gJy4uLy4uL0ZyYWN0aW9uc0NvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgTWF0Y2hpbmdDaGFsbGVuZ2UgZnJvbSAnLi4vbW9kZWwvTWF0Y2hpbmdDaGFsbGVuZ2UuanMnO1xyXG5pbXBvcnQgTWF0Y2hDaGFydE5vZGUgZnJvbSAnLi9NYXRjaENoYXJ0Tm9kZS5qcyc7XHJcbmltcG9ydCBNYXRjaFBpZWNlTm9kZSBmcm9tICcuL01hdGNoUGllY2VOb2RlLmpzJztcclxuXHJcbmNvbnN0IGNoZWNrU3RyaW5nID0gVmVnYXNTdHJpbmdzLmNoZWNrO1xyXG5jb25zdCBsYWJlbExldmVsU3RyaW5nID0gVmVnYXNTdHJpbmdzLmxhYmVsLmxldmVsO1xyXG5jb25zdCBsYWJlbFNjb3JlUGF0dGVyblN0cmluZyA9IFZlZ2FzU3RyaW5ncy5sYWJlbC5zY29yZVBhdHRlcm47XHJcbmNvbnN0IG15TWF0Y2hlc1N0cmluZyA9IEZyYWN0aW9uc0NvbW1vblN0cmluZ3MubXlNYXRjaGVzO1xyXG5jb25zdCBva1N0cmluZyA9IEZyYWN0aW9uc0NvbW1vblN0cmluZ3Mub2s7XHJcbmNvbnN0IHNob3dBbnN3ZXJTdHJpbmcgPSBWZWdhc1N0cmluZ3Muc2hvd0Fuc3dlcjtcclxuY29uc3QgdGltZU51bWJlclNlY1N0cmluZyA9IEZyYWN0aW9uc0NvbW1vblN0cmluZ3MudGltZU51bWJlclNlYztcclxuY29uc3QgdHJ5QWdhaW5TdHJpbmcgPSBWZWdhc1N0cmluZ3MudHJ5QWdhaW47XHJcblxyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFBBRERJTkcgPSBGcmFjdGlvbnNDb21tb25Db25zdGFudHMuTUFUQ0hJTkdfTUFSR0lOO1xyXG5jb25zdCBOVU1fVEFSR0VUUyA9IDY7XHJcbmNvbnN0IFRBUkdFVF9XSURUSCA9IE1hdGNoUGllY2VOb2RlLkRJTUVOU0lPTi53aWR0aDtcclxuY29uc3QgVEFSR0VUX0hFSUdIVCA9IE1hdGNoUGllY2VOb2RlLkRJTUVOU0lPTi5oZWlnaHQ7XHJcbmNvbnN0IFRBUkdFVFNfVE9QID0gMzY1O1xyXG5cclxuY2xhc3MgTWF0Y2hpbmdDaGFsbGVuZ2VOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNYXRjaGluZ0NoYWxsZW5nZX0gY2hhbGxlbmdlXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBsYXlvdXRCb3VuZHNcclxuICAgKiBAcGFyYW0ge0dhbWVBdWRpb1BsYXllcn0gZ2FtZUF1ZGlvUGxheWVyXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjaGFsbGVuZ2UsIGxheW91dEJvdW5kcywgZ2FtZUF1ZGlvUGxheWVyLCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgLy8ge2Z1bmN0aW9ufSAtIENhbGxlZCB3aGVuIHRoZSBcImNvbnRpbnVlXCIgYnV0dG9uIGlzIHByZXNzZWQgb24gdGhlIGxldmVsLWNvbXBsZXRlIG5vZGVcclxuICAgICAgb25Db250aW51ZTogKCkgPT4ge30sXHJcblxyXG4gICAgICAvLyB7Tm9kZX0gLSBXaGVyZSB0aGUgcmV3YXJkIG5vZGUgaXMgcGxhY2VkLlxyXG4gICAgICByZXdhcmRDb250YWluZXI6IG5ldyBOb2RlKClcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7TWF0Y2hpbmdDaGFsbGVuZ2V9XHJcbiAgICB0aGlzLmNoYWxsZW5nZSA9IGNoYWxsZW5nZTtcclxuXHJcbiAgICAvLyBXaWxsIGZpcmUgb25jZSB3ZSBoYXZlIHBpZWNlIG5vZGVzIGluaXRpYWxpemVkLCBzbyB0aGUgZXF1YWxzIHNpZ25zIGNhbiBiZSBwcm9wZXJseSBwb3NpdGlvbmVkIGluIHRhcmdldHMuXHJcbiAgICBjb25zdCBsYXlvdXRDb21wbGV0ZUVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtSZXdhcmROb2RlfG51bGx9XHJcbiAgICB0aGlzLnJld2FyZE5vZGUgPSBudWxsO1xyXG5cclxuICAgIGNvbnN0IHRhcmdldFdpZHRoID0gKCBsYXlvdXRCb3VuZHMud2lkdGggLSBQQURESU5HICogKCBOVU1fVEFSR0VUUyArIDEgKSApIC8gTlVNX1RBUkdFVFM7XHJcbiAgICBsZXQgdGFyZ2V0Qm90dG9tO1xyXG5cclxuICAgIC8vIFRhcmdldHNcclxuICAgIGNoYWxsZW5nZS50YXJnZXRzLmZvckVhY2goICggdGFyZ2V0LCBpbmRleCApID0+IHtcclxuICAgICAgY29uc3QgdGFyZ2V0QmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIHRhcmdldFdpZHRoLCAxMDAsIHtcclxuICAgICAgICBjb3JuZXJSYWRpdXM6IDEwLFxyXG4gICAgICAgIGZpbGw6IEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5tYXRjaGluZ1RhcmdldEJhY2tncm91bmRQcm9wZXJ0eSxcclxuICAgICAgICB4OiBsYXlvdXRCb3VuZHMubGVmdCArIFBBRERJTkcgKyAoIHRhcmdldFdpZHRoICsgUEFERElORyApICogaW5kZXgsXHJcbiAgICAgICAgeTogbGF5b3V0Qm91bmRzLnRvcCArIFBBRERJTkdcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCB0YXJnZXRCYWNrZ3JvdW5kICk7XHJcbiAgICAgIHRhcmdldC50YXJnZXRCb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IHRhcmdldEJhY2tncm91bmQuYm91bmRzO1xyXG5cclxuICAgICAgY29uc3QgZXF1YWxzU2lnbiA9IG5ldyBUZXh0KCBNYXRoU3ltYm9scy5FUVVBTF9UTywge1xyXG4gICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyNiB9ICksXHJcbiAgICAgICAgY2VudGVyOiB0YXJnZXRCYWNrZ3JvdW5kLmNlbnRlcixcclxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGVxdWFsc1NpZ24gKTtcclxuICAgICAgdGFyZ2V0LmVxdWFsc1NpZ25Cb3VuZHMgPSBlcXVhbHNTaWduLmxvY2FsQm91bmRzO1xyXG5cclxuICAgICAgY29uc3QgeExpc3RlbmVyID0geCA9PiB7XHJcbiAgICAgICAgZXF1YWxzU2lnbi5jZW50ZXJYID0geDtcclxuICAgICAgfTtcclxuICAgICAgdGFyZ2V0LmVxdWFsc1hQcm9wZXJ0eS5saW5rKCB4TGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgIHRhcmdldC5lcXVhbHNYUHJvcGVydHkudW5saW5rKCB4TGlzdGVuZXIgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgY29uc3QgZmlsbGVkTGlzdGVuZXIgPSBmaWxsZWQgPT4ge1xyXG4gICAgICAgIGVxdWFsc1NpZ24udmlzaWJsZSA9IGZpbGxlZDtcclxuICAgICAgfTtcclxuICAgICAgdGFyZ2V0LmlzRmlsbGVkUHJvcGVydHkubGluayggZmlsbGVkTGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgIHRhcmdldC5pc0ZpbGxlZFByb3BlcnR5LnVubGluayggZmlsbGVkTGlzdGVuZXIgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgaWYgKCAhdGFyZ2V0LmlzRmlsbGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgY29uc3QgQ0VOVEVSX1dFSUdIVCA9IDAuNTtcclxuXHJcbiAgICAgICAgY29uc3QgeSA9IHRhcmdldEJhY2tncm91bmQuY2VudGVyWTtcclxuICAgICAgICB0YXJnZXQuc3BvdHNbIDAgXS5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoICggMSAtIENFTlRFUl9XRUlHSFQgKSAqIHRhcmdldEJhY2tncm91bmQubGVmdCArIENFTlRFUl9XRUlHSFQgKiB0YXJnZXRCYWNrZ3JvdW5kLmNlbnRlclgsIHkgKTtcclxuICAgICAgICB0YXJnZXQuc3BvdHNbIDEgXS5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoICggMSAtIENFTlRFUl9XRUlHSFQgKSAqIHRhcmdldEJhY2tncm91bmQucmlnaHQgKyBDRU5URVJfV0VJR0hUICogdGFyZ2V0QmFja2dyb3VuZC5jZW50ZXJYLCB5ICk7XHJcbiAgICAgIH1cclxuICAgICAgdGFyZ2V0Qm90dG9tID0gdGFyZ2V0QmFja2dyb3VuZC5ib3R0b207XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2NhbGVzXHJcbiAgICBfLnJhbmdlKCAwLCAyICkuZm9yRWFjaCggaW5kZXggPT4ge1xyXG4gICAgICBjb25zdCBzY2FsZU5vZGUgPSBuZXcgSW1hZ2UoIHNjYWxlX3BuZywge1xyXG4gICAgICAgIGNlbnRlclg6IGxheW91dEJvdW5kcy5jZW50ZXJYICsgKCBpbmRleCAtIDAuNSApICogMzgwLFxyXG4gICAgICAgIHk6IDI2MCxcclxuICAgICAgICBzY2FsZTogMC41MlxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHNjYWxlTm9kZSApO1xyXG5cclxuICAgICAgY2hhbGxlbmdlLnNjYWxlU3BvdHNbIGluZGV4IF0ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHNjYWxlTm9kZS5jZW50ZXJUb3AucGx1c1hZKCAwLCAzMCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFNvdXJjZXNcclxuICAgIF8ucmFuZ2UoIDAsIE5VTV9UQVJHRVRTICkuZm9yRWFjaCggY29sID0+IF8ucmFuZ2UoIDAsIDIgKS5mb3JFYWNoKCByb3cgPT4ge1xyXG4gICAgICBjb25zdCB4ID0gbGF5b3V0Qm91bmRzLmNlbnRlclggKyBUQVJHRVRfV0lEVEggKiAoIGNvbCAtIE5VTV9UQVJHRVRTIC8gMiApO1xyXG4gICAgICBjb25zdCB5ID0gVEFSR0VUU19UT1AgKyBUQVJHRVRfSEVJR0hUICogcm93O1xyXG4gICAgICBjb25zdCBzb3VyY2VOb2RlID0gbmV3IFJlY3RhbmdsZSggeCwgeSwgVEFSR0VUX1dJRFRILCBUQVJHRVRfSEVJR0hULCB7XHJcbiAgICAgICAgZmlsbDogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm1hdGNoaW5nU291cmNlQmFja2dyb3VuZFByb3BlcnR5LFxyXG4gICAgICAgIHN0cm9rZTogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm1hdGNoaW5nU291cmNlQm9yZGVyUHJvcGVydHksXHJcbiAgICAgICAgbGluZVdpZHRoOiAxLjVcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBzb3VyY2VOb2RlICk7XHJcblxyXG4gICAgICBjaGFsbGVuZ2Uuc291cmNlU3BvdHNbIGNvbCArIHJvdyAqIE5VTV9UQVJHRVRTIF0ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHNvdXJjZU5vZGUuY2VudGVyO1xyXG4gICAgfSApICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFRleHQoIG15TWF0Y2hlc1N0cmluZywge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTgsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICAgICAgbGVmdDogbGF5b3V0Qm91bmRzLmxlZnQgKyBQQURESU5HLFxyXG4gICAgICB0b3A6IHRhcmdldEJvdHRvbSArIDUsXHJcbiAgICAgIG1heFdpZHRoOiAzMDBcclxuICAgIH0gKSApO1xyXG5cclxuICAgIGNvbnN0IHJpZ2h0VGV4dE9wdGlvbnMgPSB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxNSwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gICAgICBtYXhXaWR0aDogMzAwXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGxldmVsVGV4dCA9IG5ldyBUZXh0KCBTdHJpbmdVdGlscy5mb3JtYXQoIGxhYmVsTGV2ZWxTdHJpbmcsIGNoYWxsZW5nZS5sZXZlbE51bWJlciApLCByaWdodFRleHRPcHRpb25zICk7XHJcbiAgICBjb25zdCBzY29yZVRleHQgPSBuZXcgVGV4dCggJycsIHJpZ2h0VGV4dE9wdGlvbnMgKTtcclxuICAgIGNvbnN0IHRpbWVUZXh0ID0gbmV3IFRleHQoICcnLCByaWdodFRleHRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IEFsaWduQm94KCBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiA1LFxyXG4gICAgICBhbGlnbjogJ3JpZ2h0JyxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBsZXZlbFRleHQsXHJcbiAgICAgICAgc2NvcmVUZXh0LFxyXG4gICAgICAgIHRpbWVUZXh0XHJcbiAgICAgIF0sXHJcbiAgICAgIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IGZhbHNlXHJcbiAgICB9ICksIHtcclxuICAgICAgYWxpZ25Cb3VuZHM6IGxheW91dEJvdW5kcy53aXRoTWluWSggdGFyZ2V0Qm90dG9tICksXHJcbiAgICAgIHhBbGlnbjogJ3JpZ2h0JyxcclxuICAgICAgeUFsaWduOiAndG9wJyxcclxuICAgICAgeE1hcmdpbjogUEFERElORyxcclxuICAgICAgeU1hcmdpbjogMTBcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cclxuICAgIHRoaXMuc2NvcmVMaXN0ZW5lciA9IHNjb3JlID0+IHtcclxuICAgICAgc2NvcmVUZXh0LnN0cmluZyA9IFN0cmluZ1V0aWxzLmZvcm1hdCggbGFiZWxTY29yZVBhdHRlcm5TdHJpbmcsIHNjb3JlICk7XHJcbiAgICB9O1xyXG4gICAgdGhpcy50aW1lTGlzdGVuZXIgPSB0aW1lID0+IHtcclxuICAgICAgdGltZVRleHQuc3RyaW5nID0gU3RyaW5nVXRpbHMuZm9ybWF0KCB0aW1lTnVtYmVyU2VjU3RyaW5nLCBVdGlscy50b0ZpeGVkKCB0aW1lLCAwICkgKTtcclxuICAgIH07XHJcbiAgICB0aGlzLnRpbWVWaXNpYmxlTGlzdGVuZXIgPSB2aXNpYmxlID0+IHtcclxuICAgICAgdGltZVRleHQudmlzaWJsZSA9IHZpc2libGU7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY2hhbGxlbmdlLnNjb3JlUHJvcGVydHkubGluayggdGhpcy5zY29yZUxpc3RlbmVyICk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZS5lbGFwc2VkVGltZVByb3BlcnR5LmxpbmsoIHRoaXMudGltZUxpc3RlbmVyICk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZS50aW1lVmlzaWJsZVByb3BlcnR5LmxpbmsoIHRoaXMudGltZVZpc2libGVMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB0aGlzLmNoYWxsZW5nZS5zY29yZVByb3BlcnR5LnVubGluayggdGhpcy5zY29yZUxpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlLmVsYXBzZWRUaW1lUHJvcGVydHkudW5saW5rKCB0aGlzLnRpbWVMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLmNoYWxsZW5nZS50aW1lVmlzaWJsZVByb3BlcnR5LnVubGluayggdGhpcy50aW1lVmlzaWJsZUxpc3RlbmVyICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge01hdGNoQ2hhcnROb2RlfVxyXG4gICAgdGhpcy5jaGFydE5vZGUgPSBuZXcgTWF0Y2hDaGFydE5vZGUoIHtcclxuICAgICAgY2VudGVyWDogbGF5b3V0Qm91bmRzLmNlbnRlclgsXHJcbiAgICAgIHRvcDogdGFyZ2V0Qm90dG9tICsgMTBcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuY2hhcnROb2RlICk7XHJcblxyXG4gICAgY29uc3QgY2hhcnRDb21wYXJlID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBsZWZ0UGllY2UgPSBjaGFsbGVuZ2Uuc2NhbGVTcG90c1sgMCBdLnBpZWNlUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIGNvbnN0IHJpZ2h0UGllY2UgPSBjaGFsbGVuZ2Uuc2NhbGVTcG90c1sgMSBdLnBpZWNlUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIHRoaXMuY2hhcnROb2RlLmNvbXBhcmUoXHJcbiAgICAgICAgbGVmdFBpZWNlLmZyYWN0aW9uLnZhbHVlLFxyXG4gICAgICAgIHJpZ2h0UGllY2UuZnJhY3Rpb24udmFsdWUsXHJcbiAgICAgICAgbGVmdFBpZWNlLmdldENvbG9yKCksXHJcbiAgICAgICAgcmlnaHRQaWVjZS5nZXRDb2xvcigpXHJcbiAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGZhY2VOb2RlID0gbmV3IEZhY2VXaXRoUG9pbnRzTm9kZSgge1xyXG4gICAgICBzcGFjaW5nOiA4LFxyXG4gICAgICBwb2ludHNBbGlnbm1lbnQ6ICdyaWdodENlbnRlcicsXHJcbiAgICAgIGZhY2VEaWFtZXRlcjogMTIwLFxyXG4gICAgICBwb2ludHNGb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMjYsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICAgICAgY2VudGVyWDogbGF5b3V0Qm91bmRzLnJpZ2h0IC0gMTUwLFxyXG4gICAgICBjZW50ZXJZOiAyNTBcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGZhY2VOb2RlICk7XHJcblxyXG4gICAgY29uc3QgYnV0dG9uT3B0aW9ucyA9IHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDIyLCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgICAgIGNlbnRlclg6IGZhY2VOb2RlLmNlbnRlclgsXHJcbiAgICAgIGNlbnRlclk6IGZhY2VOb2RlLmJvdHRvbSArIDMwLFxyXG4gICAgICBtYXhUZXh0V2lkdGg6IDE1MFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBjaGVja0J1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggY2hlY2tTdHJpbmcsIG1lcmdlKCB7XHJcbiAgICAgIGJhc2VDb2xvcjogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm1hdGNoaW5nQ2hlY2tCdXR0b25Qcm9wZXJ0eSxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBjaGFydENvbXBhcmUoKTtcclxuICAgICAgICBjaGFsbGVuZ2UuY29tcGFyZSgpO1xyXG4gICAgICB9XHJcbiAgICB9LCBidXR0b25PcHRpb25zICkgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNoZWNrQnV0dG9uICk7XHJcbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiBjaGVja0J1dHRvbi5kaXNwb3NlKCkgKTtcclxuXHJcbiAgICBjb25zdCBva0J1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggb2tTdHJpbmcsIG1lcmdlKCB7XHJcbiAgICAgIGJhc2VDb2xvcjogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm1hdGNoaW5nT2tCdXR0b25Qcm9wZXJ0eSxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IGNoYWxsZW5nZS5jb2xsZWN0KClcclxuICAgIH0sIGJ1dHRvbk9wdGlvbnMgKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggb2tCdXR0b24gKTtcclxuICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IG9rQnV0dG9uLmRpc3Bvc2UoKSApO1xyXG5cclxuICAgIGNvbnN0IHRyeUFnYWluQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCB0cnlBZ2FpblN0cmluZywgbWVyZ2UoIHtcclxuICAgICAgYmFzZUNvbG9yOiBGcmFjdGlvbnNDb21tb25Db2xvcnMubWF0Y2hpbmdUcnlBZ2FpbkJ1dHRvblByb3BlcnR5LFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4gY2hhbGxlbmdlLnRyeUFnYWluKClcclxuICAgIH0sIGJ1dHRvbk9wdGlvbnMgKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdHJ5QWdhaW5CdXR0b24gKTtcclxuICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHRyeUFnYWluQnV0dG9uLmRpc3Bvc2UoKSApO1xyXG5cclxuICAgIGNvbnN0IHNob3dBbnN3ZXJCdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oIHNob3dBbnN3ZXJTdHJpbmcsIG1lcmdlKCB7XHJcbiAgICAgIGJhc2VDb2xvcjogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm1hdGNoaW5nU2hvd0Fuc3dlckJ1dHRvblByb3BlcnR5LFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIGNoYWxsZW5nZS5zaG93QW5zd2VyKCk7XHJcbiAgICAgICAgY2hhcnRDb21wYXJlKCk7XHJcbiAgICAgIH1cclxuICAgIH0sIGJ1dHRvbk9wdGlvbnMgKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc2hvd0Fuc3dlckJ1dHRvbiApO1xyXG4gICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gc2hvd0Fuc3dlckJ1dHRvbi5kaXNwb3NlKCkgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Tm9kZX1cclxuICAgIHRoaXMucGllY2VMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnBpZWNlTGF5ZXIgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259XHJcbiAgICB0aGlzLnN0YXRlTGlzdGVuZXIgPSBzdGF0ZSA9PiB7XHJcbiAgICAgIGNoZWNrQnV0dG9uLnZpc2libGUgPSBzdGF0ZSA9PT0gTWF0Y2hpbmdDaGFsbGVuZ2UuU3RhdGUuQ09NUEFSSVNPTjtcclxuICAgICAgb2tCdXR0b24udmlzaWJsZSA9IHN0YXRlID09PSBNYXRjaGluZ0NoYWxsZW5nZS5TdGF0ZS5NQVRDSEVEO1xyXG4gICAgICB0cnlBZ2FpbkJ1dHRvbi52aXNpYmxlID0gc3RhdGUgPT09IE1hdGNoaW5nQ2hhbGxlbmdlLlN0YXRlLlRSWV9BR0FJTjtcclxuICAgICAgc2hvd0Fuc3dlckJ1dHRvbi52aXNpYmxlID0gc3RhdGUgPT09IE1hdGNoaW5nQ2hhbGxlbmdlLlN0YXRlLlNIT1dfQU5TV0VSO1xyXG5cclxuICAgICAgZmFjZU5vZGUudmlzaWJsZSA9IHN0YXRlID09PSBNYXRjaGluZ0NoYWxsZW5nZS5TdGF0ZS5NQVRDSEVEICYmIGNoYWxsZW5nZS5sYXN0U2NvcmVHYWluUHJvcGVydHkudmFsdWUgPiAwO1xyXG4gICAgICBpZiAoIHN0YXRlID09PSBNYXRjaGluZ0NoYWxsZW5nZS5TdGF0ZS5DT01QQVJJU09OIHx8IHN0YXRlID09PSBNYXRjaGluZ0NoYWxsZW5nZS5TdGF0ZS5OT19DT01QQVJJU09OICkge1xyXG4gICAgICAgIHRoaXMuY2hhcnROb2RlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5waWVjZUxheWVyLnBpY2thYmxlID0gKCBzdGF0ZSA9PT0gTWF0Y2hpbmdDaGFsbGVuZ2UuU3RhdGUuU0hPV19BTlNXRVIgfHwgc3RhdGUgPT09IE1hdGNoaW5nQ2hhbGxlbmdlLlN0YXRlLk1BVENIRUQgKSA/IGZhbHNlIDogbnVsbDtcclxuICAgIH07XHJcbiAgICB0aGlzLmNoYWxsZW5nZS5zdGF0ZVByb3BlcnR5LmxpbmsoIHRoaXMuc3RhdGVMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB0aGlzLmNoYWxsZW5nZS5zdGF0ZVByb3BlcnR5LnVubGluayggdGhpcy5zdGF0ZUxpc3RlbmVyICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY29ycmVjdExpc3RlbmVyID0gKCkgPT4gZ2FtZUF1ZGlvUGxheWVyLmNvcnJlY3RBbnN3ZXIoKTtcclxuICAgIGNvbnN0IGluY29ycmVjdExpc3RlbmVyID0gKCkgPT4gZ2FtZUF1ZGlvUGxheWVyLndyb25nQW5zd2VyKCk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZS5jb3JyZWN0RW1pdHRlci5hZGRMaXN0ZW5lciggY29ycmVjdExpc3RlbmVyICk7XHJcbiAgICB0aGlzLmNoYWxsZW5nZS5pbmNvcnJlY3RFbWl0dGVyLmFkZExpc3RlbmVyKCBpbmNvcnJlY3RMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB0aGlzLmNoYWxsZW5nZS5jb3JyZWN0RW1pdHRlci5yZW1vdmVMaXN0ZW5lciggY29ycmVjdExpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlLmluY29ycmVjdEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIGluY29ycmVjdExpc3RlbmVyICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufVxyXG4gICAgdGhpcy5sYXN0U2NvcmVHYWluTGlzdGVuZXIgPSBsYXN0U2NvcmVHYWluID0+IHtcclxuICAgICAgZmFjZU5vZGUuc2V0UG9pbnRzKCBsYXN0U2NvcmVHYWluICk7XHJcbiAgICB9O1xyXG4gICAgdGhpcy5jaGFsbGVuZ2UubGFzdFNjb3JlR2FpblByb3BlcnR5LmxpbmsoIHRoaXMubGFzdFNjb3JlR2Fpbkxpc3RlbmVyICk7XHJcbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlLmxhc3RTY29yZUdhaW5Qcm9wZXJ0eS51bmxpbmsoIHRoaXMubGFzdFNjb3JlR2Fpbkxpc3RlbmVyICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcGllY2VOb2RlcyA9IFtdO1xyXG5cclxuICAgIGNoYWxsZW5nZS5waWVjZXMuZm9yRWFjaCggcGllY2UgPT4ge1xyXG4gICAgICBjb25zdCBwaWVjZU5vZGUgPSBuZXcgTWF0Y2hQaWVjZU5vZGUoIHBpZWNlICk7XHJcbiAgICAgIHBpZWNlTm9kZXMucHVzaCggcGllY2VOb2RlICk7XHJcbiAgICAgIHRoaXMucGllY2VMYXllci5hZGRDaGlsZCggcGllY2VOb2RlICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucGllY2VMYXllci5jaGlsZHJlbi5mb3JFYWNoKCBwaWVjZU5vZGUgPT4gcGllY2VOb2RlLmRpc3Bvc2UoKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGNvbXBsZXRlZExpc3RlbmVyID0gKCkgPT4ge1xyXG4gICAgICBpZiAoIGNoYWxsZW5nZS5zY29yZVByb3BlcnR5LnZhbHVlID09PSAxMiApIHtcclxuICAgICAgICBnYW1lQXVkaW9QbGF5ZXIuZ2FtZU92ZXJQZXJmZWN0U2NvcmUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZXdhcmROb2RlID0gbmV3IFJld2FyZE5vZGUoIHtcclxuICAgICAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgICAgIG5vZGVzOiBbXHJcbiAgICAgICAgICAgIC4uLl8udGltZXMoIDgsICgpID0+IG5ldyBTdGFyTm9kZSgpICksXHJcbiAgICAgICAgICAgIC4uLl8udGltZXMoIDgsICgpID0+IG5ldyBGYWNlTm9kZSggNDAsIHsgaGVhZFN0cm9rZTogJ2JsYWNrJywgaGVhZExpbmVXaWR0aDogMS41IH0gKSApLFxyXG4gICAgICAgICAgICAuLi5SZXdhcmROb2RlLmNyZWF0ZVJhbmRvbU5vZGVzKCBjaGFsbGVuZ2UucGllY2VzLm1hcCggcGllY2UgPT4ge1xyXG4gICAgICAgICAgICAgIHJldHVybiBuZXcgTWF0Y2hQaWVjZU5vZGUoIHBpZWNlLmNvcHkoKSApO1xyXG4gICAgICAgICAgICB9ICksIDEwMCApXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIG9wdGlvbnMucmV3YXJkQ29udGFpbmVyLmFkZENoaWxkKCB0aGlzLnJld2FyZE5vZGUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYmVzdFRpbWUgPSBjaGFsbGVuZ2Uuc2NvcmVQcm9wZXJ0eS52YWx1ZSA9PT0gMTJcclxuICAgICAgICAgICAgICAgICAgICAgICA/IFV0aWxzLnRvRml4ZWQoIE1hdGgubWluKCBjaGFsbGVuZ2UuZWxhcHNlZFRpbWVQcm9wZXJ0eS52YWx1ZSwgY2hhbGxlbmdlLnByZXZpb3VzQmVzdFRpbWUgKSwgMCApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xyXG4gICAgICBjb25zdCBsZXZlbENvbXBsZXRlZE5vZGUgPSBuZXcgTGV2ZWxDb21wbGV0ZWROb2RlKFxyXG4gICAgICAgIGNoYWxsZW5nZS5sZXZlbE51bWJlcixcclxuICAgICAgICBjaGFsbGVuZ2Uuc2NvcmVQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICAxMixcclxuICAgICAgICAzLFxyXG4gICAgICAgIGNoYWxsZW5nZS50aW1lVmlzaWJsZVByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgIFV0aWxzLnRvRml4ZWQoIGNoYWxsZW5nZS5lbGFwc2VkVGltZVByb3BlcnR5LnZhbHVlLCAwICksXHJcbiAgICAgICAgYmVzdFRpbWUsXHJcbiAgICAgICAgY2hhbGxlbmdlLmlzTmV3QmVzdFRpbWUsXHJcbiAgICAgICAgb3B0aW9ucy5vbkNvbnRpbnVlLCB7XHJcbiAgICAgICAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXIsXHJcbiAgICAgICAgICBjb250ZW50TWF4V2lkdGg6IDYwMFxyXG4gICAgICAgIH0gKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggbGV2ZWxDb21wbGV0ZWROb2RlICk7XHJcbiAgICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgICBsZXZlbENvbXBsZXRlZE5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgIGlmICggdGhpcy5yZXdhcmROb2RlICkge1xyXG4gICAgICAgICAgdGhpcy5yZXdhcmROb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgIHRoaXMucmV3YXJkTm9kZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY2hhbGxlbmdlLmNvbXBsZXRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGNvbXBsZXRlZExpc3RlbmVyICk7XHJcbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlLmNvbXBsZXRlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIGNvbXBsZXRlZExpc3RlbmVyICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgbGF5b3V0Q29tcGxldGVFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIHRoZSB2aWV3IGZvcndhcmQgaW4gdGltZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMucmV3YXJkTm9kZSAmJiB0aGlzLnJld2FyZE5vZGUuc3RlcCggZHQgKTtcclxuICAgIHRoaXMuY2hhcnROb2RlLnN0ZXAoIGR0ICk7XHJcbiAgfVxyXG59XHJcblxyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdNYXRjaGluZ0NoYWxsZW5nZU5vZGUnLCBNYXRjaGluZ0NoYWxsZW5nZU5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgTWF0Y2hpbmdDaGFsbGVuZ2VOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLGtCQUFrQixNQUFNLG1EQUFtRDtBQUNsRixPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxRQUFRLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNoRyxPQUFPQyxjQUFjLE1BQU0sOENBQThDO0FBQ3pFLE9BQU9DLGtCQUFrQixNQUFNLDRDQUE0QztBQUMzRSxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLFlBQVksTUFBTSxzQ0FBc0M7QUFDL0QsT0FBT0MsU0FBUyxNQUFNLDhCQUE4QjtBQUNwRCxPQUFPQyx3QkFBd0IsTUFBTSwwQ0FBMEM7QUFDL0UsT0FBT0MscUJBQXFCLE1BQU0sNENBQTRDO0FBQzlFLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0Msc0JBQXNCLE1BQU0saUNBQWlDO0FBQ3BFLE9BQU9DLGlCQUFpQixNQUFNLCtCQUErQjtBQUM3RCxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBQ2hELE9BQU9DLGNBQWMsTUFBTSxxQkFBcUI7QUFFaEQsTUFBTUMsV0FBVyxHQUFHVCxZQUFZLENBQUNVLEtBQUs7QUFDdEMsTUFBTUMsZ0JBQWdCLEdBQUdYLFlBQVksQ0FBQ1ksS0FBSyxDQUFDQyxLQUFLO0FBQ2pELE1BQU1DLHVCQUF1QixHQUFHZCxZQUFZLENBQUNZLEtBQUssQ0FBQ0csWUFBWTtBQUMvRCxNQUFNQyxlQUFlLEdBQUdYLHNCQUFzQixDQUFDWSxTQUFTO0FBQ3hELE1BQU1DLFFBQVEsR0FBR2Isc0JBQXNCLENBQUNjLEVBQUU7QUFDMUMsTUFBTUMsZ0JBQWdCLEdBQUdwQixZQUFZLENBQUNxQixVQUFVO0FBQ2hELE1BQU1DLG1CQUFtQixHQUFHakIsc0JBQXNCLENBQUNrQixhQUFhO0FBQ2hFLE1BQU1DLGNBQWMsR0FBR3hCLFlBQVksQ0FBQ3lCLFFBQVE7O0FBRzVDO0FBQ0EsTUFBTUMsT0FBTyxHQUFHeEIsd0JBQXdCLENBQUN5QixlQUFlO0FBQ3hELE1BQU1DLFdBQVcsR0FBRyxDQUFDO0FBQ3JCLE1BQU1DLFlBQVksR0FBR3JCLGNBQWMsQ0FBQ3NCLFNBQVMsQ0FBQ0MsS0FBSztBQUNuRCxNQUFNQyxhQUFhLEdBQUd4QixjQUFjLENBQUNzQixTQUFTLENBQUNHLE1BQU07QUFDckQsTUFBTUMsV0FBVyxHQUFHLEdBQUc7QUFFdkIsTUFBTUMscUJBQXFCLFNBQVMxQyxJQUFJLENBQUM7RUFDdkM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UyQyxXQUFXQSxDQUFFQyxTQUFTLEVBQUVDLFlBQVksRUFBRUMsZUFBZSxFQUFFQyxPQUFPLEVBQUc7SUFDL0QsS0FBSyxDQUFDLENBQUM7SUFFUEEsT0FBTyxHQUFHeEQsS0FBSyxDQUFFO01BQ2Y7TUFDQXlELFVBQVUsRUFBRUEsQ0FBQSxLQUFNLENBQUMsQ0FBQztNQUVwQjtNQUNBQyxlQUFlLEVBQUUsSUFBSWpELElBQUksQ0FBQztJQUM1QixDQUFDLEVBQUUrQyxPQUFRLENBQUM7O0lBRVo7SUFDQSxJQUFJLENBQUNILFNBQVMsR0FBR0EsU0FBUzs7SUFFMUI7SUFDQSxNQUFNTSxxQkFBcUIsR0FBRyxJQUFJOUQsT0FBTyxDQUFDLENBQUM7O0lBRTNDO0lBQ0EsSUFBSSxDQUFDK0QsVUFBVSxHQUFHLElBQUk7SUFFdEIsTUFBTUMsV0FBVyxHQUFHLENBQUVQLFlBQVksQ0FBQ1AsS0FBSyxHQUFHTCxPQUFPLElBQUtFLFdBQVcsR0FBRyxDQUFDLENBQUUsSUFBS0EsV0FBVztJQUN4RixJQUFJa0IsWUFBWTs7SUFFaEI7SUFDQVQsU0FBUyxDQUFDVSxPQUFPLENBQUNDLE9BQU8sQ0FBRSxDQUFFQyxNQUFNLEVBQUVDLEtBQUssS0FBTTtNQUM5QyxNQUFNQyxnQkFBZ0IsR0FBRyxJQUFJekQsU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVtRCxXQUFXLEVBQUUsR0FBRyxFQUFFO1FBQzlETyxZQUFZLEVBQUUsRUFBRTtRQUNoQkMsSUFBSSxFQUFFbEQscUJBQXFCLENBQUNtRCxnQ0FBZ0M7UUFDNURDLENBQUMsRUFBRWpCLFlBQVksQ0FBQ2tCLElBQUksR0FBRzlCLE9BQU8sR0FBRyxDQUFFbUIsV0FBVyxHQUFHbkIsT0FBTyxJQUFLd0IsS0FBSztRQUNsRU8sQ0FBQyxFQUFFbkIsWUFBWSxDQUFDb0IsR0FBRyxHQUFHaEM7TUFDeEIsQ0FBRSxDQUFDO01BQ0gsSUFBSSxDQUFDaUMsUUFBUSxDQUFFUixnQkFBaUIsQ0FBQztNQUNqQ0YsTUFBTSxDQUFDVyxvQkFBb0IsQ0FBQ0MsS0FBSyxHQUFHVixnQkFBZ0IsQ0FBQ1csTUFBTTtNQUUzRCxNQUFNQyxVQUFVLEdBQUcsSUFBSXBFLElBQUksQ0FBRVAsV0FBVyxDQUFDNEUsUUFBUSxFQUFFO1FBQ2pEQyxJQUFJLEVBQUUsSUFBSTVFLFFBQVEsQ0FBRTtVQUFFNkUsSUFBSSxFQUFFO1FBQUcsQ0FBRSxDQUFDO1FBQ2xDQyxNQUFNLEVBQUVoQixnQkFBZ0IsQ0FBQ2dCLE1BQU07UUFDL0JDLE9BQU8sRUFBRTtNQUNYLENBQUUsQ0FBQztNQUNILElBQUksQ0FBQ1QsUUFBUSxDQUFFSSxVQUFXLENBQUM7TUFDM0JkLE1BQU0sQ0FBQ29CLGdCQUFnQixHQUFHTixVQUFVLENBQUNPLFdBQVc7TUFFaEQsTUFBTUMsU0FBUyxHQUFHaEIsQ0FBQyxJQUFJO1FBQ3JCUSxVQUFVLENBQUNTLE9BQU8sR0FBR2pCLENBQUM7TUFDeEIsQ0FBQztNQUNETixNQUFNLENBQUN3QixlQUFlLENBQUNDLElBQUksQ0FBRUgsU0FBVSxDQUFDO01BQ3hDLElBQUksQ0FBQ0ksY0FBYyxDQUFDQyxXQUFXLENBQUUsTUFBTTtRQUNyQzNCLE1BQU0sQ0FBQ3dCLGVBQWUsQ0FBQ0ksTUFBTSxDQUFFTixTQUFVLENBQUM7TUFDNUMsQ0FBRSxDQUFDO01BRUgsTUFBTU8sY0FBYyxHQUFHQyxNQUFNLElBQUk7UUFDL0JoQixVQUFVLENBQUNLLE9BQU8sR0FBR1csTUFBTTtNQUM3QixDQUFDO01BQ0Q5QixNQUFNLENBQUMrQixnQkFBZ0IsQ0FBQ04sSUFBSSxDQUFFSSxjQUFlLENBQUM7TUFDOUMsSUFBSSxDQUFDSCxjQUFjLENBQUNDLFdBQVcsQ0FBRSxNQUFNO1FBQ3JDM0IsTUFBTSxDQUFDK0IsZ0JBQWdCLENBQUNILE1BQU0sQ0FBRUMsY0FBZSxDQUFDO01BQ2xELENBQUUsQ0FBQztNQUVILElBQUssQ0FBQzdCLE1BQU0sQ0FBQytCLGdCQUFnQixDQUFDbkIsS0FBSyxFQUFHO1FBQ3BDLE1BQU1vQixhQUFhLEdBQUcsR0FBRztRQUV6QixNQUFNeEIsQ0FBQyxHQUFHTixnQkFBZ0IsQ0FBQytCLE9BQU87UUFDbENqQyxNQUFNLENBQUNrQyxLQUFLLENBQUUsQ0FBQyxDQUFFLENBQUNDLGdCQUFnQixDQUFDdkIsS0FBSyxHQUFHLElBQUk5RSxPQUFPLENBQUUsQ0FBRSxDQUFDLEdBQUdrRyxhQUFhLElBQUs5QixnQkFBZ0IsQ0FBQ0ssSUFBSSxHQUFHeUIsYUFBYSxHQUFHOUIsZ0JBQWdCLENBQUNxQixPQUFPLEVBQUVmLENBQUUsQ0FBQztRQUNySlIsTUFBTSxDQUFDa0MsS0FBSyxDQUFFLENBQUMsQ0FBRSxDQUFDQyxnQkFBZ0IsQ0FBQ3ZCLEtBQUssR0FBRyxJQUFJOUUsT0FBTyxDQUFFLENBQUUsQ0FBQyxHQUFHa0csYUFBYSxJQUFLOUIsZ0JBQWdCLENBQUNrQyxLQUFLLEdBQUdKLGFBQWEsR0FBRzlCLGdCQUFnQixDQUFDcUIsT0FBTyxFQUFFZixDQUFFLENBQUM7TUFDeEo7TUFDQVgsWUFBWSxHQUFHSyxnQkFBZ0IsQ0FBQ21DLE1BQU07SUFDeEMsQ0FBRSxDQUFDOztJQUVIO0lBQ0FDLENBQUMsQ0FBQ0MsS0FBSyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FBQ3hDLE9BQU8sQ0FBRUUsS0FBSyxJQUFJO01BQ2hDLE1BQU11QyxTQUFTLEdBQUcsSUFBSWpHLEtBQUssQ0FBRVMsU0FBUyxFQUFFO1FBQ3RDdUUsT0FBTyxFQUFFbEMsWUFBWSxDQUFDa0MsT0FBTyxHQUFHLENBQUV0QixLQUFLLEdBQUcsR0FBRyxJQUFLLEdBQUc7UUFDckRPLENBQUMsRUFBRSxHQUFHO1FBQ05pQyxLQUFLLEVBQUU7TUFDVCxDQUFFLENBQUM7TUFDSCxJQUFJLENBQUMvQixRQUFRLENBQUU4QixTQUFVLENBQUM7TUFFMUJwRCxTQUFTLENBQUNzRCxVQUFVLENBQUV6QyxLQUFLLENBQUUsQ0FBQ2tDLGdCQUFnQixDQUFDdkIsS0FBSyxHQUFHNEIsU0FBUyxDQUFDRyxTQUFTLENBQUNDLE1BQU0sQ0FBRSxDQUFDLEVBQUUsRUFBRyxDQUFDO0lBQzVGLENBQUUsQ0FBQzs7SUFFSDtJQUNBTixDQUFDLENBQUNDLEtBQUssQ0FBRSxDQUFDLEVBQUU1RCxXQUFZLENBQUMsQ0FBQ29CLE9BQU8sQ0FBRThDLEdBQUcsSUFBSVAsQ0FBQyxDQUFDQyxLQUFLLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDeEMsT0FBTyxDQUFFK0MsR0FBRyxJQUFJO01BQ3hFLE1BQU14QyxDQUFDLEdBQUdqQixZQUFZLENBQUNrQyxPQUFPLEdBQUczQyxZQUFZLElBQUtpRSxHQUFHLEdBQUdsRSxXQUFXLEdBQUcsQ0FBQyxDQUFFO01BQ3pFLE1BQU02QixDQUFDLEdBQUd2QixXQUFXLEdBQUdGLGFBQWEsR0FBRytELEdBQUc7TUFDM0MsTUFBTUMsVUFBVSxHQUFHLElBQUl0RyxTQUFTLENBQUU2RCxDQUFDLEVBQUVFLENBQUMsRUFBRTVCLFlBQVksRUFBRUcsYUFBYSxFQUFFO1FBQ25FcUIsSUFBSSxFQUFFbEQscUJBQXFCLENBQUM4RixnQ0FBZ0M7UUFDNURDLE1BQU0sRUFBRS9GLHFCQUFxQixDQUFDZ0csNEJBQTRCO1FBQzFEQyxTQUFTLEVBQUU7TUFDYixDQUFFLENBQUM7TUFDSCxJQUFJLENBQUN6QyxRQUFRLENBQUVxQyxVQUFXLENBQUM7TUFFM0IzRCxTQUFTLENBQUNnRSxXQUFXLENBQUVQLEdBQUcsR0FBR0MsR0FBRyxHQUFHbkUsV0FBVyxDQUFFLENBQUN3RCxnQkFBZ0IsQ0FBQ3ZCLEtBQUssR0FBR21DLFVBQVUsQ0FBQzdCLE1BQU07SUFDN0YsQ0FBRSxDQUFFLENBQUM7SUFFTCxJQUFJLENBQUNSLFFBQVEsQ0FBRSxJQUFJaEUsSUFBSSxDQUFFcUIsZUFBZSxFQUFFO01BQ3hDaUQsSUFBSSxFQUFFLElBQUk1RSxRQUFRLENBQUU7UUFBRTZFLElBQUksRUFBRSxFQUFFO1FBQUVvQyxNQUFNLEVBQUU7TUFBTyxDQUFFLENBQUM7TUFDbEQ5QyxJQUFJLEVBQUVsQixZQUFZLENBQUNrQixJQUFJLEdBQUc5QixPQUFPO01BQ2pDZ0MsR0FBRyxFQUFFWixZQUFZLEdBQUcsQ0FBQztNQUNyQnlELFFBQVEsRUFBRTtJQUNaLENBQUUsQ0FBRSxDQUFDO0lBRUwsTUFBTUMsZ0JBQWdCLEdBQUc7TUFDdkJ2QyxJQUFJLEVBQUUsSUFBSTVFLFFBQVEsQ0FBRTtRQUFFNkUsSUFBSSxFQUFFLEVBQUU7UUFBRW9DLE1BQU0sRUFBRTtNQUFPLENBQUUsQ0FBQztNQUNsREMsUUFBUSxFQUFFO0lBQ1osQ0FBQztJQUVELE1BQU1FLFNBQVMsR0FBRyxJQUFJOUcsSUFBSSxDQUFFVixXQUFXLENBQUN5SCxNQUFNLENBQUUvRixnQkFBZ0IsRUFBRTBCLFNBQVMsQ0FBQ3NFLFdBQVksQ0FBQyxFQUFFSCxnQkFBaUIsQ0FBQztJQUM3RyxNQUFNSSxTQUFTLEdBQUcsSUFBSWpILElBQUksQ0FBRSxFQUFFLEVBQUU2RyxnQkFBaUIsQ0FBQztJQUNsRCxNQUFNSyxRQUFRLEdBQUcsSUFBSWxILElBQUksQ0FBRSxFQUFFLEVBQUU2RyxnQkFBaUIsQ0FBQztJQUVqRCxJQUFJLENBQUM3QyxRQUFRLENBQUUsSUFBSXBFLFFBQVEsQ0FBRSxJQUFJSyxJQUFJLENBQUU7TUFDckNrSCxPQUFPLEVBQUUsQ0FBQztNQUNWQyxLQUFLLEVBQUUsT0FBTztNQUNkQyxRQUFRLEVBQUUsQ0FDUlAsU0FBUyxFQUNURyxTQUFTLEVBQ1RDLFFBQVEsQ0FDVDtNQUNESSxrQ0FBa0MsRUFBRTtJQUN0QyxDQUFFLENBQUMsRUFBRTtNQUNIQyxXQUFXLEVBQUU1RSxZQUFZLENBQUM2RSxRQUFRLENBQUVyRSxZQUFhLENBQUM7TUFDbERzRSxNQUFNLEVBQUUsT0FBTztNQUNmQyxNQUFNLEVBQUUsS0FBSztNQUNiQyxPQUFPLEVBQUU1RixPQUFPO01BQ2hCNkYsT0FBTyxFQUFFO0lBQ1gsQ0FBRSxDQUFFLENBQUM7O0lBRUw7SUFDQSxJQUFJLENBQUNDLGFBQWEsR0FBR0MsS0FBSyxJQUFJO01BQzVCYixTQUFTLENBQUNjLE1BQU0sR0FBR3pJLFdBQVcsQ0FBQ3lILE1BQU0sQ0FBRTVGLHVCQUF1QixFQUFFMkcsS0FBTSxDQUFDO0lBQ3pFLENBQUM7SUFDRCxJQUFJLENBQUNFLFlBQVksR0FBR0MsSUFBSSxJQUFJO01BQzFCZixRQUFRLENBQUNhLE1BQU0sR0FBR3pJLFdBQVcsQ0FBQ3lILE1BQU0sQ0FBRXBGLG1CQUFtQixFQUFFeEMsS0FBSyxDQUFDK0ksT0FBTyxDQUFFRCxJQUFJLEVBQUUsQ0FBRSxDQUFFLENBQUM7SUFDdkYsQ0FBQztJQUNELElBQUksQ0FBQ0UsbUJBQW1CLEdBQUcxRCxPQUFPLElBQUk7TUFDcEN5QyxRQUFRLENBQUN6QyxPQUFPLEdBQUdBLE9BQU87SUFDNUIsQ0FBQztJQUVELElBQUksQ0FBQy9CLFNBQVMsQ0FBQzBGLGFBQWEsQ0FBQ3JELElBQUksQ0FBRSxJQUFJLENBQUM4QyxhQUFjLENBQUM7SUFDdkQsSUFBSSxDQUFDbkYsU0FBUyxDQUFDMkYsbUJBQW1CLENBQUN0RCxJQUFJLENBQUUsSUFBSSxDQUFDaUQsWUFBYSxDQUFDO0lBQzVELElBQUksQ0FBQ3RGLFNBQVMsQ0FBQzRGLG1CQUFtQixDQUFDdkQsSUFBSSxDQUFFLElBQUksQ0FBQ29ELG1CQUFvQixDQUFDO0lBQ25FLElBQUksQ0FBQ25ELGNBQWMsQ0FBQ0MsV0FBVyxDQUFFLE1BQU07TUFDckMsSUFBSSxDQUFDdkMsU0FBUyxDQUFDMEYsYUFBYSxDQUFDbEQsTUFBTSxDQUFFLElBQUksQ0FBQzJDLGFBQWMsQ0FBQztNQUN6RCxJQUFJLENBQUNuRixTQUFTLENBQUMyRixtQkFBbUIsQ0FBQ25ELE1BQU0sQ0FBRSxJQUFJLENBQUM4QyxZQUFhLENBQUM7TUFDOUQsSUFBSSxDQUFDdEYsU0FBUyxDQUFDNEYsbUJBQW1CLENBQUNwRCxNQUFNLENBQUUsSUFBSSxDQUFDaUQsbUJBQW9CLENBQUM7SUFDdkUsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDSSxTQUFTLEdBQUcsSUFBSTNILGNBQWMsQ0FBRTtNQUNuQ2lFLE9BQU8sRUFBRWxDLFlBQVksQ0FBQ2tDLE9BQU87TUFDN0JkLEdBQUcsRUFBRVosWUFBWSxHQUFHO0lBQ3RCLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ2EsUUFBUSxDQUFFLElBQUksQ0FBQ3VFLFNBQVUsQ0FBQztJQUUvQixNQUFNQyxZQUFZLEdBQUdBLENBQUEsS0FBTTtNQUN6QixNQUFNQyxTQUFTLEdBQUcvRixTQUFTLENBQUNzRCxVQUFVLENBQUUsQ0FBQyxDQUFFLENBQUMwQyxhQUFhLENBQUN4RSxLQUFLO01BQy9ELE1BQU15RSxVQUFVLEdBQUdqRyxTQUFTLENBQUNzRCxVQUFVLENBQUUsQ0FBQyxDQUFFLENBQUMwQyxhQUFhLENBQUN4RSxLQUFLO01BQ2hFLElBQUksQ0FBQ3FFLFNBQVMsQ0FBQ0ssT0FBTyxDQUNwQkgsU0FBUyxDQUFDSSxRQUFRLENBQUMzRSxLQUFLLEVBQ3hCeUUsVUFBVSxDQUFDRSxRQUFRLENBQUMzRSxLQUFLLEVBQ3pCdUUsU0FBUyxDQUFDSyxRQUFRLENBQUMsQ0FBQyxFQUNwQkgsVUFBVSxDQUFDRyxRQUFRLENBQUMsQ0FDdEIsQ0FBQztJQUNILENBQUM7SUFFRCxNQUFNQyxRQUFRLEdBQUcsSUFBSXZKLGtCQUFrQixDQUFFO01BQ3ZDMkgsT0FBTyxFQUFFLENBQUM7TUFDVjZCLGVBQWUsRUFBRSxhQUFhO01BQzlCQyxZQUFZLEVBQUUsR0FBRztNQUNqQkMsVUFBVSxFQUFFLElBQUl4SixRQUFRLENBQUU7UUFBRTZFLElBQUksRUFBRSxFQUFFO1FBQUVvQyxNQUFNLEVBQUU7TUFBTyxDQUFFLENBQUM7TUFDeEQ5QixPQUFPLEVBQUVsQyxZQUFZLENBQUMrQyxLQUFLLEdBQUcsR0FBRztNQUNqQ0gsT0FBTyxFQUFFO0lBQ1gsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDdkIsUUFBUSxDQUFFK0UsUUFBUyxDQUFDO0lBRXpCLE1BQU1JLGFBQWEsR0FBRztNQUNwQjdFLElBQUksRUFBRSxJQUFJNUUsUUFBUSxDQUFFO1FBQUU2RSxJQUFJLEVBQUUsRUFBRTtRQUFFb0MsTUFBTSxFQUFFO01BQU8sQ0FBRSxDQUFDO01BQ2xEOUIsT0FBTyxFQUFFa0UsUUFBUSxDQUFDbEUsT0FBTztNQUN6QlUsT0FBTyxFQUFFd0QsUUFBUSxDQUFDcEQsTUFBTSxHQUFHLEVBQUU7TUFDN0J5RCxZQUFZLEVBQUU7SUFDaEIsQ0FBQztJQUVELE1BQU1DLFdBQVcsR0FBRyxJQUFJbkosY0FBYyxDQUFFWSxXQUFXLEVBQUV6QixLQUFLLENBQUU7TUFDMURpSyxTQUFTLEVBQUU5SSxxQkFBcUIsQ0FBQytJLDJCQUEyQjtNQUM1REMsUUFBUSxFQUFFQSxDQUFBLEtBQU07UUFDZGhCLFlBQVksQ0FBQyxDQUFDO1FBQ2Q5RixTQUFTLENBQUNrRyxPQUFPLENBQUMsQ0FBQztNQUNyQjtJQUNGLENBQUMsRUFBRU8sYUFBYyxDQUFFLENBQUM7SUFDcEIsSUFBSSxDQUFDbkYsUUFBUSxDQUFFcUYsV0FBWSxDQUFDO0lBQzVCLElBQUksQ0FBQ3JFLGNBQWMsQ0FBQ0MsV0FBVyxDQUFFLE1BQU1vRSxXQUFXLENBQUNJLE9BQU8sQ0FBQyxDQUFFLENBQUM7SUFFOUQsTUFBTUMsUUFBUSxHQUFHLElBQUl4SixjQUFjLENBQUVxQixRQUFRLEVBQUVsQyxLQUFLLENBQUU7TUFDcERpSyxTQUFTLEVBQUU5SSxxQkFBcUIsQ0FBQ21KLHdCQUF3QjtNQUN6REgsUUFBUSxFQUFFQSxDQUFBLEtBQU05RyxTQUFTLENBQUNrSCxPQUFPLENBQUM7SUFDcEMsQ0FBQyxFQUFFVCxhQUFjLENBQUUsQ0FBQztJQUNwQixJQUFJLENBQUNuRixRQUFRLENBQUUwRixRQUFTLENBQUM7SUFDekIsSUFBSSxDQUFDMUUsY0FBYyxDQUFDQyxXQUFXLENBQUUsTUFBTXlFLFFBQVEsQ0FBQ0QsT0FBTyxDQUFDLENBQUUsQ0FBQztJQUUzRCxNQUFNSSxjQUFjLEdBQUcsSUFBSTNKLGNBQWMsQ0FBRTJCLGNBQWMsRUFBRXhDLEtBQUssQ0FBRTtNQUNoRWlLLFNBQVMsRUFBRTlJLHFCQUFxQixDQUFDc0osOEJBQThCO01BQy9ETixRQUFRLEVBQUVBLENBQUEsS0FBTTlHLFNBQVMsQ0FBQ1osUUFBUSxDQUFDO0lBQ3JDLENBQUMsRUFBRXFILGFBQWMsQ0FBRSxDQUFDO0lBQ3BCLElBQUksQ0FBQ25GLFFBQVEsQ0FBRTZGLGNBQWUsQ0FBQztJQUMvQixJQUFJLENBQUM3RSxjQUFjLENBQUNDLFdBQVcsQ0FBRSxNQUFNNEUsY0FBYyxDQUFDSixPQUFPLENBQUMsQ0FBRSxDQUFDO0lBRWpFLE1BQU1NLGdCQUFnQixHQUFHLElBQUk3SixjQUFjLENBQUV1QixnQkFBZ0IsRUFBRXBDLEtBQUssQ0FBRTtNQUNwRWlLLFNBQVMsRUFBRTlJLHFCQUFxQixDQUFDd0osZ0NBQWdDO01BQ2pFUixRQUFRLEVBQUVBLENBQUEsS0FBTTtRQUNkOUcsU0FBUyxDQUFDaEIsVUFBVSxDQUFDLENBQUM7UUFDdEI4RyxZQUFZLENBQUMsQ0FBQztNQUNoQjtJQUNGLENBQUMsRUFBRVcsYUFBYyxDQUFFLENBQUM7SUFDcEIsSUFBSSxDQUFDbkYsUUFBUSxDQUFFK0YsZ0JBQWlCLENBQUM7SUFDakMsSUFBSSxDQUFDL0UsY0FBYyxDQUFDQyxXQUFXLENBQUUsTUFBTThFLGdCQUFnQixDQUFDTixPQUFPLENBQUMsQ0FBRSxDQUFDOztJQUVuRTtJQUNBLElBQUksQ0FBQ1EsVUFBVSxHQUFHLElBQUluSyxJQUFJLENBQUMsQ0FBQztJQUM1QixJQUFJLENBQUNrRSxRQUFRLENBQUUsSUFBSSxDQUFDaUcsVUFBVyxDQUFDOztJQUVoQztJQUNBLElBQUksQ0FBQ0MsYUFBYSxHQUFHQyxLQUFLLElBQUk7TUFDNUJkLFdBQVcsQ0FBQzVFLE9BQU8sR0FBRzBGLEtBQUssS0FBS3hKLGlCQUFpQixDQUFDeUosS0FBSyxDQUFDQyxVQUFVO01BQ2xFWCxRQUFRLENBQUNqRixPQUFPLEdBQUcwRixLQUFLLEtBQUt4SixpQkFBaUIsQ0FBQ3lKLEtBQUssQ0FBQ0UsT0FBTztNQUM1RFQsY0FBYyxDQUFDcEYsT0FBTyxHQUFHMEYsS0FBSyxLQUFLeEosaUJBQWlCLENBQUN5SixLQUFLLENBQUNHLFNBQVM7TUFDcEVSLGdCQUFnQixDQUFDdEYsT0FBTyxHQUFHMEYsS0FBSyxLQUFLeEosaUJBQWlCLENBQUN5SixLQUFLLENBQUNJLFdBQVc7TUFFeEV6QixRQUFRLENBQUN0RSxPQUFPLEdBQUcwRixLQUFLLEtBQUt4SixpQkFBaUIsQ0FBQ3lKLEtBQUssQ0FBQ0UsT0FBTyxJQUFJNUgsU0FBUyxDQUFDK0gscUJBQXFCLENBQUN2RyxLQUFLLEdBQUcsQ0FBQztNQUN6RyxJQUFLaUcsS0FBSyxLQUFLeEosaUJBQWlCLENBQUN5SixLQUFLLENBQUNDLFVBQVUsSUFBSUYsS0FBSyxLQUFLeEosaUJBQWlCLENBQUN5SixLQUFLLENBQUNNLGFBQWEsRUFBRztRQUNyRyxJQUFJLENBQUNuQyxTQUFTLENBQUM5RCxPQUFPLEdBQUcsS0FBSztNQUNoQztNQUVBLElBQUksQ0FBQ3dGLFVBQVUsQ0FBQ1UsUUFBUSxHQUFLUixLQUFLLEtBQUt4SixpQkFBaUIsQ0FBQ3lKLEtBQUssQ0FBQ0ksV0FBVyxJQUFJTCxLQUFLLEtBQUt4SixpQkFBaUIsQ0FBQ3lKLEtBQUssQ0FBQ0UsT0FBTyxHQUFLLEtBQUssR0FBRyxJQUFJO0lBQzFJLENBQUM7SUFDRCxJQUFJLENBQUM1SCxTQUFTLENBQUNrSSxhQUFhLENBQUM3RixJQUFJLENBQUUsSUFBSSxDQUFDbUYsYUFBYyxDQUFDO0lBQ3ZELElBQUksQ0FBQ2xGLGNBQWMsQ0FBQ0MsV0FBVyxDQUFFLE1BQU07TUFDckMsSUFBSSxDQUFDdkMsU0FBUyxDQUFDa0ksYUFBYSxDQUFDMUYsTUFBTSxDQUFFLElBQUksQ0FBQ2dGLGFBQWMsQ0FBQztJQUMzRCxDQUFFLENBQUM7SUFFSCxNQUFNVyxlQUFlLEdBQUdBLENBQUEsS0FBTWpJLGVBQWUsQ0FBQ2tJLGFBQWEsQ0FBQyxDQUFDO0lBQzdELE1BQU1DLGlCQUFpQixHQUFHQSxDQUFBLEtBQU1uSSxlQUFlLENBQUNvSSxXQUFXLENBQUMsQ0FBQztJQUM3RCxJQUFJLENBQUN0SSxTQUFTLENBQUN1SSxjQUFjLENBQUNoRyxXQUFXLENBQUU0RixlQUFnQixDQUFDO0lBQzVELElBQUksQ0FBQ25JLFNBQVMsQ0FBQ3dJLGdCQUFnQixDQUFDakcsV0FBVyxDQUFFOEYsaUJBQWtCLENBQUM7SUFDaEUsSUFBSSxDQUFDL0YsY0FBYyxDQUFDQyxXQUFXLENBQUUsTUFBTTtNQUNyQyxJQUFJLENBQUN2QyxTQUFTLENBQUN1SSxjQUFjLENBQUNFLGNBQWMsQ0FBRU4sZUFBZ0IsQ0FBQztNQUMvRCxJQUFJLENBQUNuSSxTQUFTLENBQUN3SSxnQkFBZ0IsQ0FBQ0MsY0FBYyxDQUFFSixpQkFBa0IsQ0FBQztJQUNyRSxDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNLLHFCQUFxQixHQUFHQyxhQUFhLElBQUk7TUFDNUN0QyxRQUFRLENBQUN1QyxTQUFTLENBQUVELGFBQWMsQ0FBQztJQUNyQyxDQUFDO0lBQ0QsSUFBSSxDQUFDM0ksU0FBUyxDQUFDK0gscUJBQXFCLENBQUMxRixJQUFJLENBQUUsSUFBSSxDQUFDcUcscUJBQXNCLENBQUM7SUFDdkUsSUFBSSxDQUFDcEcsY0FBYyxDQUFDQyxXQUFXLENBQUUsTUFBTTtNQUNyQyxJQUFJLENBQUN2QyxTQUFTLENBQUMrSCxxQkFBcUIsQ0FBQ3ZGLE1BQU0sQ0FBRSxJQUFJLENBQUNrRyxxQkFBc0IsQ0FBQztJQUMzRSxDQUFFLENBQUM7SUFFSCxNQUFNRyxVQUFVLEdBQUcsRUFBRTtJQUVyQjdJLFNBQVMsQ0FBQzhJLE1BQU0sQ0FBQ25JLE9BQU8sQ0FBRW9JLEtBQUssSUFBSTtNQUNqQyxNQUFNQyxTQUFTLEdBQUcsSUFBSTdLLGNBQWMsQ0FBRTRLLEtBQU0sQ0FBQztNQUM3Q0YsVUFBVSxDQUFDSSxJQUFJLENBQUVELFNBQVUsQ0FBQztNQUM1QixJQUFJLENBQUN6QixVQUFVLENBQUNqRyxRQUFRLENBQUUwSCxTQUFVLENBQUM7SUFDdkMsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDMUcsY0FBYyxDQUFDQyxXQUFXLENBQUUsTUFBTTtNQUNyQyxJQUFJLENBQUNnRixVQUFVLENBQUM1QyxRQUFRLENBQUNoRSxPQUFPLENBQUVxSSxTQUFTLElBQUlBLFNBQVMsQ0FBQ2pDLE9BQU8sQ0FBQyxDQUFFLENBQUM7SUFDdEUsQ0FBRSxDQUFDO0lBRUgsTUFBTW1DLGlCQUFpQixHQUFHQSxDQUFBLEtBQU07TUFDOUIsSUFBS2xKLFNBQVMsQ0FBQzBGLGFBQWEsQ0FBQ2xFLEtBQUssS0FBSyxFQUFFLEVBQUc7UUFDMUN0QixlQUFlLENBQUNpSixvQkFBb0IsQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQzVJLFVBQVUsR0FBRyxJQUFJN0MsVUFBVSxDQUFFO1VBQ2hDdUssUUFBUSxFQUFFLEtBQUs7VUFDZm1CLEtBQUssRUFBRSxDQUNMLEdBQUdsRyxDQUFDLENBQUNtRyxLQUFLLENBQUUsQ0FBQyxFQUFFLE1BQU0sSUFBSXBNLFFBQVEsQ0FBQyxDQUFFLENBQUMsRUFDckMsR0FBR2lHLENBQUMsQ0FBQ21HLEtBQUssQ0FBRSxDQUFDLEVBQUUsTUFBTSxJQUFJeE0sUUFBUSxDQUFFLEVBQUUsRUFBRTtZQUFFeU0sVUFBVSxFQUFFLE9BQU87WUFBRUMsYUFBYSxFQUFFO1VBQUksQ0FBRSxDQUFFLENBQUMsRUFDdEYsR0FBRzdMLFVBQVUsQ0FBQzhMLGlCQUFpQixDQUFFeEosU0FBUyxDQUFDOEksTUFBTSxDQUFDVyxHQUFHLENBQUVWLEtBQUssSUFBSTtZQUM5RCxPQUFPLElBQUk1SyxjQUFjLENBQUU0SyxLQUFLLENBQUNXLElBQUksQ0FBQyxDQUFFLENBQUM7VUFDM0MsQ0FBRSxDQUFDLEVBQUUsR0FBSSxDQUFDO1FBRWQsQ0FBRSxDQUFDO1FBQ0h2SixPQUFPLENBQUNFLGVBQWUsQ0FBQ2lCLFFBQVEsQ0FBRSxJQUFJLENBQUNmLFVBQVcsQ0FBQztNQUNyRDtNQUVBLE1BQU1vSixRQUFRLEdBQUczSixTQUFTLENBQUMwRixhQUFhLENBQUNsRSxLQUFLLEtBQUssRUFBRSxHQUNsQy9FLEtBQUssQ0FBQytJLE9BQU8sQ0FBRW9FLElBQUksQ0FBQ0MsR0FBRyxDQUFFN0osU0FBUyxDQUFDMkYsbUJBQW1CLENBQUNuRSxLQUFLLEVBQUV4QixTQUFTLENBQUM4SixnQkFBaUIsQ0FBQyxFQUFFLENBQUUsQ0FBQyxHQUMvRixJQUFJO01BQ3ZCLE1BQU1DLGtCQUFrQixHQUFHLElBQUl0TSxrQkFBa0IsQ0FDL0N1QyxTQUFTLENBQUNzRSxXQUFXLEVBQ3JCdEUsU0FBUyxDQUFDMEYsYUFBYSxDQUFDbEUsS0FBSyxFQUM3QixFQUFFLEVBQ0YsQ0FBQyxFQUNEeEIsU0FBUyxDQUFDNEYsbUJBQW1CLENBQUNwRSxLQUFLLEVBQ25DL0UsS0FBSyxDQUFDK0ksT0FBTyxDQUFFeEYsU0FBUyxDQUFDMkYsbUJBQW1CLENBQUNuRSxLQUFLLEVBQUUsQ0FBRSxDQUFDLEVBQ3ZEbUksUUFBUSxFQUNSM0osU0FBUyxDQUFDZ0ssYUFBYSxFQUN2QjdKLE9BQU8sQ0FBQ0MsVUFBVSxFQUFFO1FBQ2xCMEIsTUFBTSxFQUFFN0IsWUFBWSxDQUFDNkIsTUFBTTtRQUMzQm1JLGVBQWUsRUFBRTtNQUNuQixDQUFFLENBQUM7TUFDTCxJQUFJLENBQUMzSSxRQUFRLENBQUV5SSxrQkFBbUIsQ0FBQztNQUNuQyxJQUFJLENBQUN6SCxjQUFjLENBQUNDLFdBQVcsQ0FBRSxNQUFNO1FBQ3JDd0gsa0JBQWtCLENBQUNoRCxPQUFPLENBQUMsQ0FBQztRQUM1QixJQUFLLElBQUksQ0FBQ3hHLFVBQVUsRUFBRztVQUNyQixJQUFJLENBQUNBLFVBQVUsQ0FBQ3dHLE9BQU8sQ0FBQyxDQUFDO1VBQ3pCLElBQUksQ0FBQ3hHLFVBQVUsR0FBRyxJQUFJO1FBQ3hCO01BQ0YsQ0FBRSxDQUFDO0lBQ0wsQ0FBQztJQUVELElBQUksQ0FBQ1AsU0FBUyxDQUFDa0ssZ0JBQWdCLENBQUMzSCxXQUFXLENBQUUyRyxpQkFBa0IsQ0FBQztJQUNoRSxJQUFJLENBQUM1RyxjQUFjLENBQUNDLFdBQVcsQ0FBRSxNQUFNO01BQ3JDLElBQUksQ0FBQ3ZDLFNBQVMsQ0FBQ2tLLGdCQUFnQixDQUFDekIsY0FBYyxDQUFFUyxpQkFBa0IsQ0FBQztJQUNyRSxDQUFFLENBQUM7SUFFSDVJLHFCQUFxQixDQUFDNkosSUFBSSxDQUFDLENBQUM7RUFDOUI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLElBQUlBLENBQUVDLEVBQUUsRUFBRztJQUNULElBQUksQ0FBQzlKLFVBQVUsSUFBSSxJQUFJLENBQUNBLFVBQVUsQ0FBQzZKLElBQUksQ0FBRUMsRUFBRyxDQUFDO0lBQzdDLElBQUksQ0FBQ3hFLFNBQVMsQ0FBQ3VFLElBQUksQ0FBRUMsRUFBRyxDQUFDO0VBQzNCO0FBQ0Y7QUFFQXRNLGVBQWUsQ0FBQ3VNLFFBQVEsQ0FBRSx1QkFBdUIsRUFBRXhLLHFCQUFzQixDQUFDO0FBQzFFLGVBQWVBLHFCQUFxQiJ9