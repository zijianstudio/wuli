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
const patternLevel0LevelNumberString = MakeATenStrings.pattern.level['0levelNumber'];
class MakeATenGameScreenView extends CountingCommonScreenView {
  /**
   * @param {MakeATenGameModel} model
   */
  constructor(model) {
    super(model);
    this.finishInitialization();

    // @private {Node} - The "left" half of the sliding layer, displayed first
    this.levelSelectionLayer = new Node();

    // @private {Node} - The "right" half of the sliding layer, will slide into view when the user selects a level
    this.challengeLayer = new Node();
    const showingLeftProperty = new DerivedProperty([model.gameStateProperty], gameState => gameState === GameState.CHOOSING_LEVEL);

    // @private {TransitionNode}
    this.transitionNode = new TransitionNode(this.visibleBoundsProperty, {
      content: this.levelSelectionLayer
    });
    showingLeftProperty.lazyLink(isLeft => {
      if (isLeft) {
        this.transitionNode.slideRightTo(this.levelSelectionLayer, {
          duration: 0.4,
          targetOptions: {
            easing: Easing.QUADRATIC_IN_OUT
          }
        });
      } else {
        this.transitionNode.slideLeftTo(this.challengeLayer, {
          duration: 0.4,
          targetOptions: {
            easing: Easing.QUADRATIC_IN_OUT
          }
        });
      }
    });
    this.addChild(this.transitionNode);

    // @private {StartGameLevelNode} - Shows buttons that allow selecting the level to play
    this.startGameLevelNode = new StartGameLevelNode(model);
    this.levelSelectionLayer.addChild(this.startGameLevelNode);

    // Move our resetAllButton onto our level-selection layer
    this.resetAllButton.detach();
    this.levelSelectionLayer.addChild(this.resetAllButton);

    // info dialog, constructed lazily because Dialog requires sim bounds during construction
    let dialog = null;

    // @private {InfoButton} - Shows '?' in the corner that pops up the info dialog when clicked.
    this.infoButton = new InfoButton({
      touchAreaXDilation: 7,
      touchAreaYDilation: 7,
      listener: () => {
        if (!dialog) {
          dialog = new InfoDialog(model.levels);
        }
        dialog.show();
      },
      scale: 0.7,
      top: this.layoutBounds.top + 20,
      right: this.layoutBounds.right - 20
    });
    this.levelSelectionLayer.addChild(this.infoButton);

    // The node that display "12 + 100 = "
    const additionTermsNode = new AdditionTermsNode(model.additionTerms, false);
    additionTermsNode.left = this.layoutBounds.left + 38;
    additionTermsNode.top = this.layoutBounds.top + 75;
    this.challengeLayer.addChild(additionTermsNode);

    // @private {NextArrowButton} - Moves to the next challenge when clicked
    this.nextChallengeButton = new NextArrowButton(nextString, {
      listener: () => {
        model.moveToNextChallenge();
      },
      top: this.layoutBounds.centerY,
      right: this.layoutBounds.right - 20
    });
    this.challengeLayer.addChild(this.nextChallengeButton);
    model.gameStateProperty.link(gameState => {
      this.nextChallengeButton.visible = gameState === GameState.CORRECT_ANSWER;
    });

    // Add the counting object layer from our supertype
    this.challengeLayer.addChild(this.countingObjectLayerNode);
    const levelNumberText = new Text('', {
      font: new PhetFont({
        size: 18,
        weight: 'bold'
      }),
      pickable: false,
      maxWidth: 120
    });
    const levelDescriptionText = new Text('', {
      font: new PhetFont(18),
      pickable: false
    });
    model.currentLevelProperty.link(level => {
      levelNumberText.string = StringUtils.format(patternLevel0LevelNumberString, `${level.number}`);
      levelDescriptionText.string = level.description;
    });
    const statusMessageNode = new HBox({
      children: [levelNumberText, levelDescriptionText],
      spacing: 30
    });

    // @private {InfiniteStatusBar} - Status bar at the top of the screen
    this.gameStatusBar = new InfiniteStatusBar(this.layoutBounds, this.visibleBoundsProperty, statusMessageNode, model.currentScoreProperty, {
      floatToTop: true,
      barFill: new DerivedProperty([model.currentLevelProperty], _.property('color')),
      backButtonListener: model.moveToChoosingLevel.bind(model)
    });
    this.challengeLayer.addChild(this.gameStatusBar);

    // Hook up the audio player to the sound settings.
    this.gameAudioPlayer = new GameAudioPlayer();

    // Trigger initial layout
    this.layoutControls();

    // Hook up the update function for handling changes to game state.
    model.gameStateProperty.link(this.onGameStateChange.bind(this));

    // @private {RewardNode|null} - see showReward()
    this.rewardNode = null;

    // @private {function|null} - see showReward()
    this.rewardNodeBoundsListener = null;

    // @private {Rectangle}
    this.rewardBarrier = Rectangle.bounds(this.visibleBoundsProperty.value, {
      fill: 'rgba(128,128,128,0.4)'
    });
    this.visibleBoundsProperty.linkAttribute(this.rewardBarrier, 'rectBounds');
    this.rewardBarrier.addInputListener(new ButtonListener({
      fire: event => {
        this.hideReward();
      }
    }));
    model.levels.forEach(level => {
      level.scoreProperty.link(score => {
        if (score === 10) {
          this.showReward();
        }
      });
    });
  }

  /**
   * @public
   */
  step(dt) {
    this.rewardNode && this.rewardNode.step(dt);
    this.transitionNode && this.transitionNode.step(dt);
  }

  /**
   * Shows the reward node.
   * @private
   */
  showReward() {
    this.gameAudioPlayer.gameOverPerfectScore();
    this.rewardNode = new MakeATenRewardNode();
    this.addChild(this.rewardBarrier);
    this.addChild(this.rewardNode);
    this.rewardNodeBoundsListener = this.visibleBoundsProperty.linkAttribute(this.rewardNode, 'canvasBounds');
    const rewardDialog = new RewardDialog(10, {
      keepGoingButtonListener: () => {
        this.hideReward();
        rewardDialog.dispose();
      },
      newLevelButtonListener: () => {
        this.hideReward();
        this.model.moveToChoosingLevel();
        rewardDialog.dispose();
      }
    });
    rewardDialog.show();
  }

  /**
   * Hides the reward node.
   * @private
   */
  hideReward() {
    this.removeChild(this.rewardNode);
    this.removeChild(this.rewardBarrier);
    this.visibleBoundsProperty.unlink(this.rewardNodeBoundsListener);

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
  onGameStateChange(gameState) {
    if (gameState === GameState.PRESENTING_INTERACTIVE_CHALLENGE) {
      this.model.setupChallenge(this.model.currentChallengeProperty.value);
    }
    if (gameState === GameState.CORRECT_ANSWER) {
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
makeATen.register('MakeATenGameScreenView', MakeATenGameScreenView);
export default MakeATenGameScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJDb3VudGluZ0NvbW1vblNjcmVlblZpZXciLCJTdHJpbmdVdGlscyIsIkluZm9CdXR0b24iLCJQaGV0Rm9udCIsIkJ1dHRvbkxpc3RlbmVyIiwiSEJveCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiRWFzaW5nIiwiVHJhbnNpdGlvbk5vZGUiLCJHYW1lQXVkaW9QbGF5ZXIiLCJJbmZpbml0ZVN0YXR1c0JhciIsIlJld2FyZERpYWxvZyIsIm1ha2VBVGVuIiwiTWFrZUFUZW5TdHJpbmdzIiwiQWRkaXRpb25UZXJtc05vZGUiLCJHYW1lU3RhdGUiLCJJbmZvRGlhbG9nIiwiTWFrZUFUZW5SZXdhcmROb2RlIiwiTmV4dEFycm93QnV0dG9uIiwiU3RhcnRHYW1lTGV2ZWxOb2RlIiwibmV4dFN0cmluZyIsIm5leHQiLCJwYXR0ZXJuTGV2ZWwwTGV2ZWxOdW1iZXJTdHJpbmciLCJwYXR0ZXJuIiwibGV2ZWwiLCJNYWtlQVRlbkdhbWVTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImZpbmlzaEluaXRpYWxpemF0aW9uIiwibGV2ZWxTZWxlY3Rpb25MYXllciIsImNoYWxsZW5nZUxheWVyIiwic2hvd2luZ0xlZnRQcm9wZXJ0eSIsImdhbWVTdGF0ZVByb3BlcnR5IiwiZ2FtZVN0YXRlIiwiQ0hPT1NJTkdfTEVWRUwiLCJ0cmFuc2l0aW9uTm9kZSIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsImNvbnRlbnQiLCJsYXp5TGluayIsImlzTGVmdCIsInNsaWRlUmlnaHRUbyIsImR1cmF0aW9uIiwidGFyZ2V0T3B0aW9ucyIsImVhc2luZyIsIlFVQURSQVRJQ19JTl9PVVQiLCJzbGlkZUxlZnRUbyIsImFkZENoaWxkIiwic3RhcnRHYW1lTGV2ZWxOb2RlIiwicmVzZXRBbGxCdXR0b24iLCJkZXRhY2giLCJkaWFsb2ciLCJpbmZvQnV0dG9uIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibGlzdGVuZXIiLCJsZXZlbHMiLCJzaG93Iiwic2NhbGUiLCJ0b3AiLCJsYXlvdXRCb3VuZHMiLCJyaWdodCIsImFkZGl0aW9uVGVybXNOb2RlIiwiYWRkaXRpb25UZXJtcyIsImxlZnQiLCJuZXh0Q2hhbGxlbmdlQnV0dG9uIiwibW92ZVRvTmV4dENoYWxsZW5nZSIsImNlbnRlclkiLCJsaW5rIiwidmlzaWJsZSIsIkNPUlJFQ1RfQU5TV0VSIiwiY291bnRpbmdPYmplY3RMYXllck5vZGUiLCJsZXZlbE51bWJlclRleHQiLCJmb250Iiwic2l6ZSIsIndlaWdodCIsInBpY2thYmxlIiwibWF4V2lkdGgiLCJsZXZlbERlc2NyaXB0aW9uVGV4dCIsImN1cnJlbnRMZXZlbFByb3BlcnR5Iiwic3RyaW5nIiwiZm9ybWF0IiwibnVtYmVyIiwiZGVzY3JpcHRpb24iLCJzdGF0dXNNZXNzYWdlTm9kZSIsImNoaWxkcmVuIiwic3BhY2luZyIsImdhbWVTdGF0dXNCYXIiLCJjdXJyZW50U2NvcmVQcm9wZXJ0eSIsImZsb2F0VG9Ub3AiLCJiYXJGaWxsIiwiXyIsInByb3BlcnR5IiwiYmFja0J1dHRvbkxpc3RlbmVyIiwibW92ZVRvQ2hvb3NpbmdMZXZlbCIsImJpbmQiLCJnYW1lQXVkaW9QbGF5ZXIiLCJsYXlvdXRDb250cm9scyIsIm9uR2FtZVN0YXRlQ2hhbmdlIiwicmV3YXJkTm9kZSIsInJld2FyZE5vZGVCb3VuZHNMaXN0ZW5lciIsInJld2FyZEJhcnJpZXIiLCJib3VuZHMiLCJ2YWx1ZSIsImZpbGwiLCJsaW5rQXR0cmlidXRlIiwiYWRkSW5wdXRMaXN0ZW5lciIsImZpcmUiLCJldmVudCIsImhpZGVSZXdhcmQiLCJmb3JFYWNoIiwic2NvcmVQcm9wZXJ0eSIsInNjb3JlIiwic2hvd1Jld2FyZCIsInN0ZXAiLCJkdCIsImdhbWVPdmVyUGVyZmVjdFNjb3JlIiwicmV3YXJkRGlhbG9nIiwia2VlcEdvaW5nQnV0dG9uTGlzdGVuZXIiLCJkaXNwb3NlIiwibmV3TGV2ZWxCdXR0b25MaXN0ZW5lciIsInJlbW92ZUNoaWxkIiwidW5saW5rIiwiUFJFU0VOVElOR19JTlRFUkFDVElWRV9DSEFMTEVOR0UiLCJzZXR1cENoYWxsZW5nZSIsImN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eSIsImluY3JlbWVudFNjb3JlIiwiY29ycmVjdEFuc3dlciIsImdldFRvcEJvdW5kc09mZnNldCIsImhlaWdodCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWFrZUFUZW5HYW1lU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBHYW1lIHNjcmVlbnZpZXcgZm9yIG1ha2UtYS10ZW4uIEluY2x1ZGVzIDEwIGxldmVscywgd2hlcmUgdGhlIGdvYWwgZm9yIGVhY2ggaXMgdG8gY29tYmluZSB0aGUgMiBudW1iZXJzIHRvZ2V0aGVyIGludG9cclxuICogb25lIG51bWJlciBieSBtYW5pcHVsYXRpbmcgd2l0aCB0aGUgY29uY2VwdCBvZiBtYWtpbmcgYSB0ZW4uIEVhY2ggbGV2ZWwgY2FuIGdlbmVyYXRlIGFuIGluZmluaXRlIG51bWJlciBvZlxyXG4gKiBjaGFsbGVuZ2VzLCBzbyB0aGUgc2NvcmUgZm9yIGVhY2ggbGV2ZWwgaXMgYW4gaW50ZWdlciAoaW5zdGVhZCBvZiBhIHByb3BvcnRpb24gbGlrZSBvdGhlciBzaW1zKS5cclxuICpcclxuICogQGF1dGhvciBTaGFyZnVkZWVuIEFzaHJhZlxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQ291bnRpbmdDb21tb25TY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uLy4uL2NvdW50aW5nLWNvbW1vbi9qcy9jb21tb24vdmlldy9Db3VudGluZ0NvbW1vblNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IEluZm9CdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvSW5mb0J1dHRvbi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBCdXR0b25MaXN0ZW5lciwgSEJveCwgTm9kZSwgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEVhc2luZyBmcm9tICcuLi8uLi8uLi8uLi8uLi90d2l4dC9qcy9FYXNpbmcuanMnO1xyXG5pbXBvcnQgVHJhbnNpdGlvbk5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHdpeHQvanMvVHJhbnNpdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgR2FtZUF1ZGlvUGxheWVyIGZyb20gJy4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0dhbWVBdWRpb1BsYXllci5qcyc7XHJcbmltcG9ydCBJbmZpbml0ZVN0YXR1c0JhciBmcm9tICcuLi8uLi8uLi8uLi8uLi92ZWdhcy9qcy9JbmZpbml0ZVN0YXR1c0Jhci5qcyc7XHJcbmltcG9ydCBSZXdhcmREaWFsb2cgZnJvbSAnLi4vLi4vLi4vLi4vLi4vdmVnYXMvanMvUmV3YXJkRGlhbG9nLmpzJztcclxuaW1wb3J0IG1ha2VBVGVuIGZyb20gJy4uLy4uLy4uL21ha2VBVGVuLmpzJztcclxuaW1wb3J0IE1ha2VBVGVuU3RyaW5ncyBmcm9tICcuLi8uLi8uLi9NYWtlQVRlblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQWRkaXRpb25UZXJtc05vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQWRkaXRpb25UZXJtc05vZGUuanMnO1xyXG5pbXBvcnQgR2FtZVN0YXRlIGZyb20gJy4uL21vZGVsL0dhbWVTdGF0ZS5qcyc7XHJcbmltcG9ydCBJbmZvRGlhbG9nIGZyb20gJy4vSW5mb0RpYWxvZy5qcyc7XHJcbmltcG9ydCBNYWtlQVRlblJld2FyZE5vZGUgZnJvbSAnLi9NYWtlQVRlblJld2FyZE5vZGUuanMnO1xyXG5pbXBvcnQgTmV4dEFycm93QnV0dG9uIGZyb20gJy4vTmV4dEFycm93QnV0dG9uLmpzJztcclxuaW1wb3J0IFN0YXJ0R2FtZUxldmVsTm9kZSBmcm9tICcuL1N0YXJ0R2FtZUxldmVsTm9kZS5qcyc7XHJcblxyXG5jb25zdCBuZXh0U3RyaW5nID0gTWFrZUFUZW5TdHJpbmdzLm5leHQ7XHJcbmNvbnN0IHBhdHRlcm5MZXZlbDBMZXZlbE51bWJlclN0cmluZyA9IE1ha2VBVGVuU3RyaW5ncy5wYXR0ZXJuLmxldmVsWyAnMGxldmVsTnVtYmVyJyBdO1xyXG5cclxuY2xhc3MgTWFrZUFUZW5HYW1lU2NyZWVuVmlldyBleHRlbmRzIENvdW50aW5nQ29tbW9uU2NyZWVuVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TWFrZUFUZW5HYW1lTW9kZWx9IG1vZGVsXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsICkge1xyXG4gICAgc3VwZXIoIG1vZGVsICk7XHJcblxyXG4gICAgdGhpcy5maW5pc2hJbml0aWFsaXphdGlvbigpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOb2RlfSAtIFRoZSBcImxlZnRcIiBoYWxmIG9mIHRoZSBzbGlkaW5nIGxheWVyLCBkaXNwbGF5ZWQgZmlyc3RcclxuICAgIHRoaXMubGV2ZWxTZWxlY3Rpb25MYXllciA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge05vZGV9IC0gVGhlIFwicmlnaHRcIiBoYWxmIG9mIHRoZSBzbGlkaW5nIGxheWVyLCB3aWxsIHNsaWRlIGludG8gdmlldyB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgYSBsZXZlbFxyXG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllciA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgY29uc3Qgc2hvd2luZ0xlZnRQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgbW9kZWwuZ2FtZVN0YXRlUHJvcGVydHkgXSwgZ2FtZVN0YXRlID0+IGdhbWVTdGF0ZSA9PT0gR2FtZVN0YXRlLkNIT09TSU5HX0xFVkVMICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1RyYW5zaXRpb25Ob2RlfVxyXG4gICAgdGhpcy50cmFuc2l0aW9uTm9kZSA9IG5ldyBUcmFuc2l0aW9uTm9kZSggdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksIHtcclxuICAgICAgY29udGVudDogdGhpcy5sZXZlbFNlbGVjdGlvbkxheWVyXHJcbiAgICB9ICk7XHJcbiAgICBzaG93aW5nTGVmdFByb3BlcnR5LmxhenlMaW5rKCBpc0xlZnQgPT4ge1xyXG4gICAgICBpZiAoIGlzTGVmdCApIHtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25Ob2RlLnNsaWRlUmlnaHRUbyggdGhpcy5sZXZlbFNlbGVjdGlvbkxheWVyLCB7XHJcbiAgICAgICAgICBkdXJhdGlvbjogMC40LFxyXG4gICAgICAgICAgdGFyZ2V0T3B0aW9uczoge1xyXG4gICAgICAgICAgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VUXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbk5vZGUuc2xpZGVMZWZ0VG8oIHRoaXMuY2hhbGxlbmdlTGF5ZXIsIHtcclxuICAgICAgICAgIGR1cmF0aW9uOiAwLjQsXHJcbiAgICAgICAgICB0YXJnZXRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGVhc2luZzogRWFzaW5nLlFVQURSQVRJQ19JTl9PVVRcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMudHJhbnNpdGlvbk5vZGUgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7U3RhcnRHYW1lTGV2ZWxOb2RlfSAtIFNob3dzIGJ1dHRvbnMgdGhhdCBhbGxvdyBzZWxlY3RpbmcgdGhlIGxldmVsIHRvIHBsYXlcclxuICAgIHRoaXMuc3RhcnRHYW1lTGV2ZWxOb2RlID0gbmV3IFN0YXJ0R2FtZUxldmVsTm9kZSggbW9kZWwgKTtcclxuICAgIHRoaXMubGV2ZWxTZWxlY3Rpb25MYXllci5hZGRDaGlsZCggdGhpcy5zdGFydEdhbWVMZXZlbE5vZGUgKTtcclxuXHJcbiAgICAvLyBNb3ZlIG91ciByZXNldEFsbEJ1dHRvbiBvbnRvIG91ciBsZXZlbC1zZWxlY3Rpb24gbGF5ZXJcclxuICAgIHRoaXMucmVzZXRBbGxCdXR0b24uZGV0YWNoKCk7XHJcbiAgICB0aGlzLmxldmVsU2VsZWN0aW9uTGF5ZXIuYWRkQ2hpbGQoIHRoaXMucmVzZXRBbGxCdXR0b24gKTtcclxuXHJcbiAgICAvLyBpbmZvIGRpYWxvZywgY29uc3RydWN0ZWQgbGF6aWx5IGJlY2F1c2UgRGlhbG9nIHJlcXVpcmVzIHNpbSBib3VuZHMgZHVyaW5nIGNvbnN0cnVjdGlvblxyXG4gICAgbGV0IGRpYWxvZyA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0luZm9CdXR0b259IC0gU2hvd3MgJz8nIGluIHRoZSBjb3JuZXIgdGhhdCBwb3BzIHVwIHRoZSBpbmZvIGRpYWxvZyB3aGVuIGNsaWNrZWQuXHJcbiAgICB0aGlzLmluZm9CdXR0b24gPSBuZXcgSW5mb0J1dHRvbigge1xyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDcsXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogNyxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBpZiAoICFkaWFsb2cgKSB7XHJcbiAgICAgICAgICBkaWFsb2cgPSBuZXcgSW5mb0RpYWxvZyggbW9kZWwubGV2ZWxzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRpYWxvZy5zaG93KCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHNjYWxlOiAwLjcsXHJcbiAgICAgIHRvcDogdGhpcy5sYXlvdXRCb3VuZHMudG9wICsgMjAsXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIDIwXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmxldmVsU2VsZWN0aW9uTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuaW5mb0J1dHRvbiApO1xyXG5cclxuICAgIC8vIFRoZSBub2RlIHRoYXQgZGlzcGxheSBcIjEyICsgMTAwID0gXCJcclxuICAgIGNvbnN0IGFkZGl0aW9uVGVybXNOb2RlID0gbmV3IEFkZGl0aW9uVGVybXNOb2RlKCBtb2RlbC5hZGRpdGlvblRlcm1zLCBmYWxzZSApO1xyXG4gICAgYWRkaXRpb25UZXJtc05vZGUubGVmdCA9IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKyAzODtcclxuICAgIGFkZGl0aW9uVGVybXNOb2RlLnRvcCA9IHRoaXMubGF5b3V0Qm91bmRzLnRvcCArIDc1O1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllci5hZGRDaGlsZCggYWRkaXRpb25UZXJtc05vZGUgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7TmV4dEFycm93QnV0dG9ufSAtIE1vdmVzIHRvIHRoZSBuZXh0IGNoYWxsZW5nZSB3aGVuIGNsaWNrZWRcclxuICAgIHRoaXMubmV4dENoYWxsZW5nZUJ1dHRvbiA9IG5ldyBOZXh0QXJyb3dCdXR0b24oIG5leHRTdHJpbmcsIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBtb2RlbC5tb3ZlVG9OZXh0Q2hhbGxlbmdlKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRvcDogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWSxcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gMjBcclxuICAgIH0gKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHRoaXMubmV4dENoYWxsZW5nZUJ1dHRvbiApO1xyXG4gICAgbW9kZWwuZ2FtZVN0YXRlUHJvcGVydHkubGluayggZ2FtZVN0YXRlID0+IHtcclxuICAgICAgdGhpcy5uZXh0Q2hhbGxlbmdlQnV0dG9uLnZpc2libGUgPSBnYW1lU3RhdGUgPT09IEdhbWVTdGF0ZS5DT1JSRUNUX0FOU1dFUjtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGNvdW50aW5nIG9iamVjdCBsYXllciBmcm9tIG91ciBzdXBlcnR5cGVcclxuICAgIHRoaXMuY2hhbGxlbmdlTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuY291bnRpbmdPYmplY3RMYXllck5vZGUgKTtcclxuXHJcbiAgICBjb25zdCBsZXZlbE51bWJlclRleHQgPSBuZXcgVGV4dCggJycsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE4LCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgbWF4V2lkdGg6IDEyMFxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgbGV2ZWxEZXNjcmlwdGlvblRleHQgPSBuZXcgVGV4dCggJycsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxOCApLFxyXG4gICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgIH0gKTtcclxuICAgIG1vZGVsLmN1cnJlbnRMZXZlbFByb3BlcnR5LmxpbmsoIGxldmVsID0+IHtcclxuICAgICAgbGV2ZWxOdW1iZXJUZXh0LnN0cmluZyA9IFN0cmluZ1V0aWxzLmZvcm1hdCggcGF0dGVybkxldmVsMExldmVsTnVtYmVyU3RyaW5nLCBgJHtsZXZlbC5udW1iZXJ9YCApO1xyXG4gICAgICBsZXZlbERlc2NyaXB0aW9uVGV4dC5zdHJpbmcgPSBsZXZlbC5kZXNjcmlwdGlvbjtcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHN0YXR1c01lc3NhZ2VOb2RlID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgbGV2ZWxOdW1iZXJUZXh0LCBsZXZlbERlc2NyaXB0aW9uVGV4dCBdLFxyXG4gICAgICBzcGFjaW5nOiAzMFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtJbmZpbml0ZVN0YXR1c0Jhcn0gLSBTdGF0dXMgYmFyIGF0IHRoZSB0b3Agb2YgdGhlIHNjcmVlblxyXG4gICAgdGhpcy5nYW1lU3RhdHVzQmFyID0gbmV3IEluZmluaXRlU3RhdHVzQmFyKCB0aGlzLmxheW91dEJvdW5kcywgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksIHN0YXR1c01lc3NhZ2VOb2RlLCBtb2RlbC5jdXJyZW50U2NvcmVQcm9wZXJ0eSwge1xyXG4gICAgICBmbG9hdFRvVG9wOiB0cnVlLFxyXG4gICAgICBiYXJGaWxsOiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIG1vZGVsLmN1cnJlbnRMZXZlbFByb3BlcnR5IF0sIF8ucHJvcGVydHkoICdjb2xvcicgKSApLFxyXG4gICAgICBiYWNrQnV0dG9uTGlzdGVuZXI6IG1vZGVsLm1vdmVUb0Nob29zaW5nTGV2ZWwuYmluZCggbW9kZWwgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VMYXllci5hZGRDaGlsZCggdGhpcy5nYW1lU3RhdHVzQmFyICk7XHJcblxyXG4gICAgLy8gSG9vayB1cCB0aGUgYXVkaW8gcGxheWVyIHRvIHRoZSBzb3VuZCBzZXR0aW5ncy5cclxuICAgIHRoaXMuZ2FtZUF1ZGlvUGxheWVyID0gbmV3IEdhbWVBdWRpb1BsYXllcigpO1xyXG5cclxuICAgIC8vIFRyaWdnZXIgaW5pdGlhbCBsYXlvdXRcclxuICAgIHRoaXMubGF5b3V0Q29udHJvbHMoKTtcclxuXHJcbiAgICAvLyBIb29rIHVwIHRoZSB1cGRhdGUgZnVuY3Rpb24gZm9yIGhhbmRsaW5nIGNoYW5nZXMgdG8gZ2FtZSBzdGF0ZS5cclxuICAgIG1vZGVsLmdhbWVTdGF0ZVByb3BlcnR5LmxpbmsoIHRoaXMub25HYW1lU3RhdGVDaGFuZ2UuYmluZCggdGhpcyApICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1Jld2FyZE5vZGV8bnVsbH0gLSBzZWUgc2hvd1Jld2FyZCgpXHJcbiAgICB0aGlzLnJld2FyZE5vZGUgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbnxudWxsfSAtIHNlZSBzaG93UmV3YXJkKClcclxuICAgIHRoaXMucmV3YXJkTm9kZUJvdW5kc0xpc3RlbmVyID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UmVjdGFuZ2xlfVxyXG4gICAgdGhpcy5yZXdhcmRCYXJyaWVyID0gUmVjdGFuZ2xlLmJvdW5kcyggdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkudmFsdWUsIHtcclxuICAgICAgZmlsbDogJ3JnYmEoMTI4LDEyOCwxMjgsMC40KSdcclxuICAgIH0gKTtcclxuICAgIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHRoaXMucmV3YXJkQmFycmllciwgJ3JlY3RCb3VuZHMnICk7XHJcbiAgICB0aGlzLnJld2FyZEJhcnJpZXIuYWRkSW5wdXRMaXN0ZW5lciggbmV3IEJ1dHRvbkxpc3RlbmVyKCB7XHJcbiAgICAgIGZpcmU6IGV2ZW50ID0+IHtcclxuICAgICAgICB0aGlzLmhpZGVSZXdhcmQoKTtcclxuICAgICAgfVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgbW9kZWwubGV2ZWxzLmZvckVhY2goIGxldmVsID0+IHtcclxuICAgICAgbGV2ZWwuc2NvcmVQcm9wZXJ0eS5saW5rKCBzY29yZSA9PiB7XHJcbiAgICAgICAgaWYgKCBzY29yZSA9PT0gMTAgKSB7XHJcbiAgICAgICAgICB0aGlzLnNob3dSZXdhcmQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMucmV3YXJkTm9kZSAmJiB0aGlzLnJld2FyZE5vZGUuc3RlcCggZHQgKTtcclxuICAgIHRoaXMudHJhbnNpdGlvbk5vZGUgJiYgdGhpcy50cmFuc2l0aW9uTm9kZS5zdGVwKCBkdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hvd3MgdGhlIHJld2FyZCBub2RlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc2hvd1Jld2FyZCgpIHtcclxuICAgIHRoaXMuZ2FtZUF1ZGlvUGxheWVyLmdhbWVPdmVyUGVyZmVjdFNjb3JlKCk7XHJcblxyXG4gICAgdGhpcy5yZXdhcmROb2RlID0gbmV3IE1ha2VBVGVuUmV3YXJkTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5yZXdhcmRCYXJyaWVyICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnJld2FyZE5vZGUgKTtcclxuICAgIHRoaXMucmV3YXJkTm9kZUJvdW5kc0xpc3RlbmVyID0gdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkubGlua0F0dHJpYnV0ZSggdGhpcy5yZXdhcmROb2RlLCAnY2FudmFzQm91bmRzJyApO1xyXG5cclxuICAgIGNvbnN0IHJld2FyZERpYWxvZyA9IG5ldyBSZXdhcmREaWFsb2coIDEwLCB7XHJcbiAgICAgIGtlZXBHb2luZ0J1dHRvbkxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5oaWRlUmV3YXJkKCk7XHJcbiAgICAgICAgcmV3YXJkRGlhbG9nLmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgIH0sXHJcbiAgICAgIG5ld0xldmVsQnV0dG9uTGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICB0aGlzLmhpZGVSZXdhcmQoKTtcclxuICAgICAgICB0aGlzLm1vZGVsLm1vdmVUb0Nob29zaW5nTGV2ZWwoKTtcclxuICAgICAgICByZXdhcmREaWFsb2cuZGlzcG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICByZXdhcmREaWFsb2cuc2hvdygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGlkZXMgdGhlIHJld2FyZCBub2RlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaGlkZVJld2FyZCgpIHtcclxuICAgIHRoaXMucmVtb3ZlQ2hpbGQoIHRoaXMucmV3YXJkTm9kZSApO1xyXG4gICAgdGhpcy5yZW1vdmVDaGlsZCggdGhpcy5yZXdhcmRCYXJyaWVyICk7XHJcbiAgICB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eS51bmxpbmsoIHRoaXMucmV3YXJkTm9kZUJvdW5kc0xpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gZnVsbHkgcmVsZWFzZSByZWZlcmVuY2VzXHJcbiAgICB0aGlzLnJld2FyZE5vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5yZXdhcmROb2RlQm91bmRzTGlzdGVuZXIgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiB0aGUgZ2FtZSBzdGF0ZSBjaGFuZ2VzLCB1cGRhdGUgdGhlIHZpZXcgd2l0aCB0aGUgYXBwcm9wcmlhdGUgYnV0dG9ucyBhbmQgcmVhZG91dHMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7R2FtZVN0YXRlfSBnYW1lU3RhdGVcclxuICAgKi9cclxuICBvbkdhbWVTdGF0ZUNoYW5nZSggZ2FtZVN0YXRlICkge1xyXG4gICAgaWYgKCBnYW1lU3RhdGUgPT09IEdhbWVTdGF0ZS5QUkVTRU5USU5HX0lOVEVSQUNUSVZFX0NIQUxMRU5HRSApIHtcclxuICAgICAgdGhpcy5tb2RlbC5zZXR1cENoYWxsZW5nZSggdGhpcy5tb2RlbC5jdXJyZW50Q2hhbGxlbmdlUHJvcGVydHkudmFsdWUgKTtcclxuICAgIH1cclxuICAgIGlmICggZ2FtZVN0YXRlID09PSBHYW1lU3RhdGUuQ09SUkVDVF9BTlNXRVIgKSB7XHJcbiAgICAgIHRoaXMubW9kZWwuaW5jcmVtZW50U2NvcmUoKTtcclxuICAgICAgdGhpcy5nYW1lQXVkaW9QbGF5ZXIuY29ycmVjdEFuc3dlcigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gQW1vdW50IGluIHZpZXcgY29vcmRpbmF0ZXMgdG8gbGVhdmUgYXQgdGhlIHRvcCBvZiB0aGUgc2NyZWVuLlxyXG4gICAqL1xyXG4gIGdldFRvcEJvdW5kc09mZnNldCgpIHtcclxuICAgIHJldHVybiB0aGlzLmdhbWVTdGF0dXNCYXIuaGVpZ2h0O1xyXG4gIH1cclxufVxyXG5cclxubWFrZUFUZW4ucmVnaXN0ZXIoICdNYWtlQVRlbkdhbWVTY3JlZW5WaWV3JywgTWFrZUFUZW5HYW1lU2NyZWVuVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBNYWtlQVRlbkdhbWVTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLDJDQUEyQztBQUN2RSxPQUFPQyx3QkFBd0IsTUFBTSwyRUFBMkU7QUFDaEgsT0FBT0MsV0FBVyxNQUFNLGtEQUFrRDtBQUMxRSxPQUFPQyxVQUFVLE1BQU0sc0RBQXNEO0FBQzdFLE9BQU9DLFFBQVEsTUFBTSw0Q0FBNEM7QUFDakUsU0FBU0MsY0FBYyxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsc0NBQXNDO0FBQ2xHLE9BQU9DLE1BQU0sTUFBTSxtQ0FBbUM7QUFDdEQsT0FBT0MsY0FBYyxNQUFNLDJDQUEyQztBQUN0RSxPQUFPQyxlQUFlLE1BQU0sNENBQTRDO0FBQ3hFLE9BQU9DLGlCQUFpQixNQUFNLDhDQUE4QztBQUM1RSxPQUFPQyxZQUFZLE1BQU0seUNBQXlDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSxzQkFBc0I7QUFDM0MsT0FBT0MsZUFBZSxNQUFNLDZCQUE2QjtBQUN6RCxPQUFPQyxpQkFBaUIsTUFBTSx3Q0FBd0M7QUFDdEUsT0FBT0MsU0FBUyxNQUFNLHVCQUF1QjtBQUM3QyxPQUFPQyxVQUFVLE1BQU0saUJBQWlCO0FBQ3hDLE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQUN4RCxPQUFPQyxlQUFlLE1B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