// Copyright 2021-2023, University of Colorado Boulder

/**
 * NumberPlayGameLevelNode is the base class for a game level view which each type of game will extend.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Luisa Vargas
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, HBox, Node, Path, RichText, Text } from '../../../../scenery/js/imports.js';
import InfiniteStatusBar from '../../../../vegas/js/InfiniteStatusBar.js';
import numberPlay from '../../numberPlay.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import StarNode from '../../../../scenery-phet/js/StarNode.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import NumberPlayGameAnswerButtons from './NumberPlayGameAnswerButtons.js';
import NumberPlayConstants from '../../common/NumberPlayConstants.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';

// types

// constants
const FACE_DIAMETER = 150;
const PLUS_ONE_STRING = '+1'; // doesn't need to be translatable

class NumberPlayGameLevelNode extends Node {
  // visible when an incorrect answer button is pressed

  // whether the pointAwardedNode is visible

  static ANSWER_BUTTONS_BOTTOM_MARGIN_Y = 50;
  static GAME_AREA_NODE_BOTTOM_MARGIN_Y = 40; // distance above answer buttons

  constructor(level, levelProperty, layoutBounds, visibleBoundsProperty, providedOptions) {
    super();
    const options = optionize()({}, providedOptions);

    // text displayed in the statusBar
    const levelDescriptionText = new RichText(level.gameType.levelDescriptions[level.levelNumber], {
      font: new PhetFont(21),
      maxWidth: 650
    });

    // bar across the top of the screen
    const statusBar = new InfiniteStatusBar(layoutBounds, visibleBoundsProperty, levelDescriptionText, level.scoreProperty, combineOptions({
      floatToTop: true,
      spacing: 20,
      backButtonListener: () => {
        this.interruptSubtreeInput();
        levelProperty.value = null; // back to the level-selection UI
      }
    }, options.statusBarOptions));
    this.addChild(statusBar);
    this.level = level;
    this.frownyFaceNode = new FaceNode(FACE_DIAMETER, {
      visible: false
    });
    this.frownyFaceNode.top = 98; // empirically determined to top-align with the main game node
    this.frownyFaceNode.right = layoutBounds.maxX - 45; // empirically determined
    this.frownyFaceNode.frown();
    this.addChild(this.frownyFaceNode);
    this.frownyFaceAnimation = null;

    // create and add the smileyFaceNode which is visible when a challenge is solved, meaning a correct answer button was pressed
    const smileyFaceNode = new FaceNode(FACE_DIAMETER, {
      visibleProperty: level.isChallengeSolvedProperty
    });
    smileyFaceNode.top = this.frownyFaceNode.top;
    smileyFaceNode.centerX = this.frownyFaceNode.centerX;
    this.addChild(smileyFaceNode);
    this.pointAwardedNodeVisibleProperty = new BooleanProperty(false);

    // create and add the pointAwardedNode which is shown when a correct guess is made on the first answer button press
    const starNode = new StarNode({
      value: 1,
      scale: 1.5
    });
    const plusOneNode = new Text(PLUS_ONE_STRING, {
      font: new PhetFont(44),
      fill: Color.BLACK
    });
    const pointAwardedNode = new HBox({
      children: [plusOneNode, starNode],
      spacing: 10,
      visibleProperty: this.pointAwardedNodeVisibleProperty
    });
    pointAwardedNode.centerX = smileyFaceNode.centerX - 2; // empirically determined tweak to look centered
    pointAwardedNode.top = smileyFaceNode.bottom + 20; // empirically determined
    this.addChild(pointAwardedNode);

    // create and add the newChallengeButton which is visible when a challenge is solved, meaning a correct answer button was pressed
    const rightArrowShape = new ArrowShape(0, 0, 42, 0, {
      tailWidth: 12,
      headWidth: 25,
      headHeight: 23
    });
    const newChallengeButton = new RectangularPushButton({
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      xMargin: 27,
      yMargin: 10.9,
      touchAreaXDilation: NumberPlayConstants.TOUCH_AREA_DILATION,
      touchAreaYDilation: NumberPlayConstants.TOUCH_AREA_DILATION,
      content: new Path(rightArrowShape, {
        fill: Color.BLACK
      }),
      visibleProperty: level.isChallengeSolvedProperty,
      listener: () => this.newChallenge()
    });
    newChallengeButton.centerX = smileyFaceNode.centerX;
    newChallengeButton.bottom = layoutBounds.maxY - NumberPlayGameLevelNode.ANSWER_BUTTONS_BOTTOM_MARGIN_Y - NumberPlayGameAnswerButtons.BUTTON_DIMENSION.height - NumberPlayGameLevelNode.GAME_AREA_NODE_BOTTOM_MARGIN_Y;
    this.addChild(newChallengeButton);
  }
  reset() {
    this.pointAwardedNodeVisibleProperty.reset();
    this.answerButtons.reset();
  }

  /**
   * Sets up a new challenge in the model and in the view.
   */
  newChallenge() {
    this.level.newChallenge();
    this.pointAwardedNodeVisibleProperty.value = false;
    this.answerButtons.reset();
    if (phet.chipper.queryParameters.showAnswers) {
      this.answerButtons.showAnswer(this.level.challengeNumberProperty);
    }
  }

  /**
   * Shows or hides a frowny face - if shown, animates it to fade out when the user made an incorrect guess.
   */
  setFrownyFaceVisibility(showFrownyFace) {
    this.frownyFaceNode.visible = showFrownyFace;
    if (showFrownyFace) {
      if (this.frownyFaceAnimation) {
        this.frownyFaceAnimation.stop();
        this.frownyFaceAnimation = null;
      }

      // Animate opacity of the frowny face node, fade it out.
      this.frownyFaceNode.opacityProperty.value = 1;
      this.frownyFaceAnimation = new Animation({
        delay: 1,
        duration: 0.8,
        targets: [{
          property: this.frownyFaceNode.opacityProperty,
          easing: Easing.LINEAR,
          to: 0
        }]
      });
      this.frownyFaceAnimation.finishEmitter.addListener(() => {
        this.frownyFaceNode.visible = false;
        this.frownyFaceAnimation = null;
      });
      this.frownyFaceAnimation.start();
    }
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
numberPlay.register('NumberPlayGameLevelNode', NumberPlayGameLevelNode);
export default NumberPlayGameLevelNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Rm9udCIsIkNvbG9yIiwiSEJveCIsIk5vZGUiLCJQYXRoIiwiUmljaFRleHQiLCJUZXh0IiwiSW5maW5pdGVTdGF0dXNCYXIiLCJudW1iZXJQbGF5IiwiRmFjZU5vZGUiLCJCb29sZWFuUHJvcGVydHkiLCJTdGFyTm9kZSIsIkFycm93U2hhcGUiLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJBbmltYXRpb24iLCJFYXNpbmciLCJOdW1iZXJQbGF5R2FtZUFuc3dlckJ1dHRvbnMiLCJOdW1iZXJQbGF5Q29uc3RhbnRzIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJQaGV0Q29sb3JTY2hlbWUiLCJGQUNFX0RJQU1FVEVSIiwiUExVU19PTkVfU1RSSU5HIiwiTnVtYmVyUGxheUdhbWVMZXZlbE5vZGUiLCJBTlNXRVJfQlVUVE9OU19CT1RUT01fTUFSR0lOX1kiLCJHQU1FX0FSRUFfTk9ERV9CT1RUT01fTUFSR0lOX1kiLCJjb25zdHJ1Y3RvciIsImxldmVsIiwibGV2ZWxQcm9wZXJ0eSIsImxheW91dEJvdW5kcyIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJsZXZlbERlc2NyaXB0aW9uVGV4dCIsImdhbWVUeXBlIiwibGV2ZWxEZXNjcmlwdGlvbnMiLCJsZXZlbE51bWJlciIsImZvbnQiLCJtYXhXaWR0aCIsInN0YXR1c0JhciIsInNjb3JlUHJvcGVydHkiLCJmbG9hdFRvVG9wIiwic3BhY2luZyIsImJhY2tCdXR0b25MaXN0ZW5lciIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsInZhbHVlIiwic3RhdHVzQmFyT3B0aW9ucyIsImFkZENoaWxkIiwiZnJvd255RmFjZU5vZGUiLCJ2aXNpYmxlIiwidG9wIiwicmlnaHQiLCJtYXhYIiwiZnJvd24iLCJmcm93bnlGYWNlQW5pbWF0aW9uIiwic21pbGV5RmFjZU5vZGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJpc0NoYWxsZW5nZVNvbHZlZFByb3BlcnR5IiwiY2VudGVyWCIsInBvaW50QXdhcmRlZE5vZGVWaXNpYmxlUHJvcGVydHkiLCJzdGFyTm9kZSIsInNjYWxlIiwicGx1c09uZU5vZGUiLCJmaWxsIiwiQkxBQ0siLCJwb2ludEF3YXJkZWROb2RlIiwiY2hpbGRyZW4iLCJib3R0b20iLCJyaWdodEFycm93U2hhcGUiLCJ0YWlsV2lkdGgiLCJoZWFkV2lkdGgiLCJoZWFkSGVpZ2h0IiwibmV3Q2hhbGxlbmdlQnV0dG9uIiwiYmFzZUNvbG9yIiwiQlVUVE9OX1lFTExPVyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwidG91Y2hBcmVhWERpbGF0aW9uIiwiVE9VQ0hfQVJFQV9ESUxBVElPTiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImNvbnRlbnQiLCJsaXN0ZW5lciIsIm5ld0NoYWxsZW5nZSIsIm1heFkiLCJCVVRUT05fRElNRU5TSU9OIiwiaGVpZ2h0IiwicmVzZXQiLCJhbnN3ZXJCdXR0b25zIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJzaG93QW5zd2VycyIsInNob3dBbnN3ZXIiLCJjaGFsbGVuZ2VOdW1iZXJQcm9wZXJ0eSIsInNldEZyb3dueUZhY2VWaXNpYmlsaXR5Iiwic2hvd0Zyb3dueUZhY2UiLCJzdG9wIiwib3BhY2l0eVByb3BlcnR5IiwiZGVsYXkiLCJkdXJhdGlvbiIsInRhcmdldHMiLCJwcm9wZXJ0eSIsImVhc2luZyIsIkxJTkVBUiIsInRvIiwiZmluaXNoRW1pdHRlciIsImFkZExpc3RlbmVyIiwic3RhcnQiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOdW1iZXJQbGF5R2FtZUxldmVsTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBOdW1iZXJQbGF5R2FtZUxldmVsTm9kZSBpcyB0aGUgYmFzZSBjbGFzcyBmb3IgYSBnYW1lIGxldmVsIHZpZXcgd2hpY2ggZWFjaCB0eXBlIG9mIGdhbWUgd2lsbCBleHRlbmQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBMdWlzYSBWYXJnYXNcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBIQm94LCBOb2RlLCBQYXRoLCBSaWNoVGV4dCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBJbmZpbml0ZVN0YXR1c0JhciwgeyBJbmZpbml0ZVN0YXR1c0Jhck9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9JbmZpbml0ZVN0YXR1c0Jhci5qcyc7XHJcbmltcG9ydCBudW1iZXJQbGF5IGZyb20gJy4uLy4uL251bWJlclBsYXkuanMnO1xyXG5pbXBvcnQgRmFjZU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0ZhY2VOb2RlLmpzJztcclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTdGFyTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3Rhck5vZGUuanMnO1xyXG5pbXBvcnQgQXJyb3dTaGFwZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dTaGFwZS5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9BbmltYXRpb24uanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBOdW1iZXJQbGF5R2FtZUxldmVsIGZyb20gJy4uL21vZGVsL051bWJlclBsYXlHYW1lTGV2ZWwuanMnO1xyXG5pbXBvcnQgTnVtYmVyUGxheUdhbWVBbnN3ZXJCdXR0b25zIGZyb20gJy4vTnVtYmVyUGxheUdhbWVBbnN3ZXJCdXR0b25zLmpzJztcclxuaW1wb3J0IE51bWJlclBsYXlDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL051bWJlclBsYXlDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcblxyXG4vLyB0eXBlc1xyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHN0YXR1c0Jhck9wdGlvbnM/OiBQaWNrPEluZmluaXRlU3RhdHVzQmFyT3B0aW9ucywgJ2JhckZpbGwnPjtcclxufTtcclxudHlwZSBOdW1iZXJQbGF5R2FtZUxldmVsTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBGQUNFX0RJQU1FVEVSID0gMTUwO1xyXG5jb25zdCBQTFVTX09ORV9TVFJJTkcgPSAnKzEnOyAvLyBkb2Vzbid0IG5lZWQgdG8gYmUgdHJhbnNsYXRhYmxlXHJcblxyXG5hYnN0cmFjdCBjbGFzcyBOdW1iZXJQbGF5R2FtZUxldmVsTm9kZTxUIGV4dGVuZHMgTnVtYmVyUGxheUdhbWVMZXZlbD4gZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGxldmVsOiBUO1xyXG5cclxuICAvLyB2aXNpYmxlIHdoZW4gYW4gaW5jb3JyZWN0IGFuc3dlciBidXR0b24gaXMgcHJlc3NlZFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZnJvd255RmFjZU5vZGU6IEZhY2VOb2RlO1xyXG4gIHByaXZhdGUgZnJvd255RmFjZUFuaW1hdGlvbjogQW5pbWF0aW9uIHwgbnVsbDtcclxuXHJcbiAgLy8gd2hldGhlciB0aGUgcG9pbnRBd2FyZGVkTm9kZSBpcyB2aXNpYmxlXHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHBvaW50QXdhcmRlZE5vZGVWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBhbnN3ZXJCdXR0b25zOiBOdW1iZXJQbGF5R2FtZUFuc3dlckJ1dHRvbnM7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBBTlNXRVJfQlVUVE9OU19CT1RUT01fTUFSR0lOX1kgPSA1MDtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEdBTUVfQVJFQV9OT0RFX0JPVFRPTV9NQVJHSU5fWSA9IDQwOyAvLyBkaXN0YW5jZSBhYm92ZSBhbnN3ZXIgYnV0dG9uc1xyXG5cclxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoIGxldmVsOiBULFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWxQcm9wZXJ0eTogVFByb3BlcnR5PE51bWJlclBsYXlHYW1lTGV2ZWwgfCBudWxsPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dEJvdW5kczogQm91bmRzMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGVCb3VuZHNQcm9wZXJ0eTogUHJvcGVydHk8Qm91bmRzMj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBOdW1iZXJQbGF5R2FtZUxldmVsTm9kZU9wdGlvbnMgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TnVtYmVyUGxheUdhbWVMZXZlbE5vZGVPcHRpb25zLCBTdHJpY3RPbWl0PFNlbGZPcHRpb25zLCAnc3RhdHVzQmFyT3B0aW9ucyc+PigpKCB7fSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gdGV4dCBkaXNwbGF5ZWQgaW4gdGhlIHN0YXR1c0JhclxyXG4gICAgY29uc3QgbGV2ZWxEZXNjcmlwdGlvblRleHQgPSBuZXcgUmljaFRleHQoIGxldmVsLmdhbWVUeXBlLmxldmVsRGVzY3JpcHRpb25zWyBsZXZlbC5sZXZlbE51bWJlciBdLCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjEgKSxcclxuICAgICAgbWF4V2lkdGg6IDY1MFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGJhciBhY3Jvc3MgdGhlIHRvcCBvZiB0aGUgc2NyZWVuXHJcbiAgICBjb25zdCBzdGF0dXNCYXIgPSBuZXcgSW5maW5pdGVTdGF0dXNCYXIoIGxheW91dEJvdW5kcywgdmlzaWJsZUJvdW5kc1Byb3BlcnR5LCBsZXZlbERlc2NyaXB0aW9uVGV4dCwgbGV2ZWwuc2NvcmVQcm9wZXJ0eSxcclxuICAgICAgY29tYmluZU9wdGlvbnM8SW5maW5pdGVTdGF0dXNCYXJPcHRpb25zPigge1xyXG4gICAgICAgIGZsb2F0VG9Ub3A6IHRydWUsXHJcbiAgICAgICAgc3BhY2luZzogMjAsXHJcbiAgICAgICAgYmFja0J1dHRvbkxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgICAgICAgbGV2ZWxQcm9wZXJ0eS52YWx1ZSA9IG51bGw7IC8vIGJhY2sgdG8gdGhlIGxldmVsLXNlbGVjdGlvbiBVSVxyXG4gICAgICAgIH1cclxuICAgICAgfSwgb3B0aW9ucy5zdGF0dXNCYXJPcHRpb25zICkgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHN0YXR1c0JhciApO1xyXG5cclxuICAgIHRoaXMubGV2ZWwgPSBsZXZlbDtcclxuXHJcbiAgICB0aGlzLmZyb3dueUZhY2VOb2RlID0gbmV3IEZhY2VOb2RlKCBGQUNFX0RJQU1FVEVSLCB7XHJcbiAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmZyb3dueUZhY2VOb2RlLnRvcCA9IDk4OyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIHRvcC1hbGlnbiB3aXRoIHRoZSBtYWluIGdhbWUgbm9kZVxyXG4gICAgdGhpcy5mcm93bnlGYWNlTm9kZS5yaWdodCA9IGxheW91dEJvdW5kcy5tYXhYIC0gNDU7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgIHRoaXMuZnJvd255RmFjZU5vZGUuZnJvd24oKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZnJvd255RmFjZU5vZGUgKTtcclxuICAgIHRoaXMuZnJvd255RmFjZUFuaW1hdGlvbiA9IG51bGw7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgdGhlIHNtaWxleUZhY2VOb2RlIHdoaWNoIGlzIHZpc2libGUgd2hlbiBhIGNoYWxsZW5nZSBpcyBzb2x2ZWQsIG1lYW5pbmcgYSBjb3JyZWN0IGFuc3dlciBidXR0b24gd2FzIHByZXNzZWRcclxuICAgIGNvbnN0IHNtaWxleUZhY2VOb2RlID0gbmV3IEZhY2VOb2RlKCBGQUNFX0RJQU1FVEVSLCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbGV2ZWwuaXNDaGFsbGVuZ2VTb2x2ZWRQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gICAgc21pbGV5RmFjZU5vZGUudG9wID0gdGhpcy5mcm93bnlGYWNlTm9kZS50b3A7XHJcbiAgICBzbWlsZXlGYWNlTm9kZS5jZW50ZXJYID0gdGhpcy5mcm93bnlGYWNlTm9kZS5jZW50ZXJYO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc21pbGV5RmFjZU5vZGUgKTtcclxuXHJcbiAgICB0aGlzLnBvaW50QXdhcmRlZE5vZGVWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSBwb2ludEF3YXJkZWROb2RlIHdoaWNoIGlzIHNob3duIHdoZW4gYSBjb3JyZWN0IGd1ZXNzIGlzIG1hZGUgb24gdGhlIGZpcnN0IGFuc3dlciBidXR0b24gcHJlc3NcclxuICAgIGNvbnN0IHN0YXJOb2RlID0gbmV3IFN0YXJOb2RlKCB7IHZhbHVlOiAxLCBzY2FsZTogMS41IH0gKTtcclxuICAgIGNvbnN0IHBsdXNPbmVOb2RlID0gbmV3IFRleHQoIFBMVVNfT05FX1NUUklORywgeyBmb250OiBuZXcgUGhldEZvbnQoIDQ0ICksIGZpbGw6IENvbG9yLkJMQUNLIH0gKTtcclxuICAgIGNvbnN0IHBvaW50QXdhcmRlZE5vZGUgPSBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogWyBwbHVzT25lTm9kZSwgc3Rhck5vZGUgXSxcclxuICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdGhpcy5wb2ludEF3YXJkZWROb2RlVmlzaWJsZVByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICBwb2ludEF3YXJkZWROb2RlLmNlbnRlclggPSBzbWlsZXlGYWNlTm9kZS5jZW50ZXJYIC0gMjsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0d2VhayB0byBsb29rIGNlbnRlcmVkXHJcbiAgICBwb2ludEF3YXJkZWROb2RlLnRvcCA9IHNtaWxleUZhY2VOb2RlLmJvdHRvbSArIDIwOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICB0aGlzLmFkZENoaWxkKCBwb2ludEF3YXJkZWROb2RlICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgdGhlIG5ld0NoYWxsZW5nZUJ1dHRvbiB3aGljaCBpcyB2aXNpYmxlIHdoZW4gYSBjaGFsbGVuZ2UgaXMgc29sdmVkLCBtZWFuaW5nIGEgY29ycmVjdCBhbnN3ZXIgYnV0dG9uIHdhcyBwcmVzc2VkXHJcbiAgICBjb25zdCByaWdodEFycm93U2hhcGUgPSBuZXcgQXJyb3dTaGFwZSggMCwgMCwgNDIsIDAsIHtcclxuICAgICAgdGFpbFdpZHRoOiAxMixcclxuICAgICAgaGVhZFdpZHRoOiAyNSxcclxuICAgICAgaGVhZEhlaWdodDogMjNcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IG5ld0NoYWxsZW5nZUJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgICAgYmFzZUNvbG9yOiBQaGV0Q29sb3JTY2hlbWUuQlVUVE9OX1lFTExPVyxcclxuICAgICAgeE1hcmdpbjogMjcsXHJcbiAgICAgIHlNYXJnaW46IDEwLjksXHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogTnVtYmVyUGxheUNvbnN0YW50cy5UT1VDSF9BUkVBX0RJTEFUSU9OLFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IE51bWJlclBsYXlDb25zdGFudHMuVE9VQ0hfQVJFQV9ESUxBVElPTixcclxuICAgICAgY29udGVudDogbmV3IFBhdGgoIHJpZ2h0QXJyb3dTaGFwZSwgeyBmaWxsOiBDb2xvci5CTEFDSyB9ICksXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbGV2ZWwuaXNDaGFsbGVuZ2VTb2x2ZWRQcm9wZXJ0eSxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHRoaXMubmV3Q2hhbGxlbmdlKClcclxuICAgIH0gKTtcclxuICAgIG5ld0NoYWxsZW5nZUJ1dHRvbi5jZW50ZXJYID0gc21pbGV5RmFjZU5vZGUuY2VudGVyWDtcclxuICAgIG5ld0NoYWxsZW5nZUJ1dHRvbi5ib3R0b20gPSBsYXlvdXRCb3VuZHMubWF4WSAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTnVtYmVyUGxheUdhbWVMZXZlbE5vZGUuQU5TV0VSX0JVVFRPTlNfQk9UVE9NX01BUkdJTl9ZIC1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOdW1iZXJQbGF5R2FtZUFuc3dlckJ1dHRvbnMuQlVUVE9OX0RJTUVOU0lPTi5oZWlnaHQgLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE51bWJlclBsYXlHYW1lTGV2ZWxOb2RlLkdBTUVfQVJFQV9OT0RFX0JPVFRPTV9NQVJHSU5fWTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ld0NoYWxsZW5nZUJ1dHRvbiApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5wb2ludEF3YXJkZWROb2RlVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFuc3dlckJ1dHRvbnMucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdXAgYSBuZXcgY2hhbGxlbmdlIGluIHRoZSBtb2RlbCBhbmQgaW4gdGhlIHZpZXcuXHJcbiAgICovXHJcbiAgcHVibGljIG5ld0NoYWxsZW5nZSgpOiB2b2lkIHtcclxuICAgIHRoaXMubGV2ZWwubmV3Q2hhbGxlbmdlKCk7XHJcbiAgICB0aGlzLnBvaW50QXdhcmRlZE5vZGVWaXNpYmxlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgIHRoaXMuYW5zd2VyQnV0dG9ucy5yZXNldCgpO1xyXG4gICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnNob3dBbnN3ZXJzICkge1xyXG4gICAgICB0aGlzLmFuc3dlckJ1dHRvbnMuc2hvd0Fuc3dlciggdGhpcy5sZXZlbC5jaGFsbGVuZ2VOdW1iZXJQcm9wZXJ0eSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hvd3Mgb3IgaGlkZXMgYSBmcm93bnkgZmFjZSAtIGlmIHNob3duLCBhbmltYXRlcyBpdCB0byBmYWRlIG91dCB3aGVuIHRoZSB1c2VyIG1hZGUgYW4gaW5jb3JyZWN0IGd1ZXNzLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBzZXRGcm93bnlGYWNlVmlzaWJpbGl0eSggc2hvd0Zyb3dueUZhY2U6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICB0aGlzLmZyb3dueUZhY2VOb2RlLnZpc2libGUgPSBzaG93RnJvd255RmFjZTtcclxuXHJcbiAgICBpZiAoIHNob3dGcm93bnlGYWNlICkge1xyXG5cclxuICAgICAgaWYgKCB0aGlzLmZyb3dueUZhY2VBbmltYXRpb24gKSB7XHJcbiAgICAgICAgdGhpcy5mcm93bnlGYWNlQW5pbWF0aW9uLnN0b3AoKTtcclxuICAgICAgICB0aGlzLmZyb3dueUZhY2VBbmltYXRpb24gPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBbmltYXRlIG9wYWNpdHkgb2YgdGhlIGZyb3dueSBmYWNlIG5vZGUsIGZhZGUgaXQgb3V0LlxyXG4gICAgICB0aGlzLmZyb3dueUZhY2VOb2RlLm9wYWNpdHlQcm9wZXJ0eS52YWx1ZSA9IDE7XHJcbiAgICAgIHRoaXMuZnJvd255RmFjZUFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIHtcclxuICAgICAgICBkZWxheTogMSxcclxuICAgICAgICBkdXJhdGlvbjogMC44LFxyXG4gICAgICAgIHRhcmdldHM6IFsge1xyXG4gICAgICAgICAgcHJvcGVydHk6IHRoaXMuZnJvd255RmFjZU5vZGUub3BhY2l0eVByb3BlcnR5LFxyXG4gICAgICAgICAgZWFzaW5nOiBFYXNpbmcuTElORUFSLFxyXG4gICAgICAgICAgdG86IDBcclxuICAgICAgICB9IF1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgdGhpcy5mcm93bnlGYWNlQW5pbWF0aW9uLmZpbmlzaEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgICB0aGlzLmZyb3dueUZhY2VOb2RlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmZyb3dueUZhY2VBbmltYXRpb24gPSBudWxsO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB0aGlzLmZyb3dueUZhY2VBbmltYXRpb24uc3RhcnQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5udW1iZXJQbGF5LnJlZ2lzdGVyKCAnTnVtYmVyUGxheUdhbWVMZXZlbE5vZGUnLCBOdW1iZXJQbGF5R2FtZUxldmVsTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBOdW1iZXJQbGF5R2FtZUxldmVsTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFJQSxPQUFPQSxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsUUFBUSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzNGLE9BQU9DLGlCQUFpQixNQUFvQywyQ0FBMkM7QUFDdkcsT0FBT0MsVUFBVSxNQUFNLHFCQUFxQjtBQUM1QyxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxVQUFVLE1BQU0sMkNBQTJDO0FBQ2xFLE9BQU9DLHFCQUFxQixNQUFNLHFEQUFxRDtBQUN2RixPQUFPQyxTQUFTLE1BQU0sbUNBQW1DO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSxnQ0FBZ0M7QUFFbkQsT0FBT0MsMkJBQTJCLE1BQU0sa0NBQWtDO0FBQzFF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