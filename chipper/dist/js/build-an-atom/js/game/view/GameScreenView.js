// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main view for the second tab of the Build an Atom simulation.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node } from '../../../../scenery/js/imports.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import FiniteStatusBar from '../../../../vegas/js/FiniteStatusBar.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import LevelCompletedNode from '../../../../vegas/js/LevelCompletedNode.js';
import buildAnAtom from '../../buildAnAtom.js';
import BAAQueryParameters from '../../common/BAAQueryParameters.js';
import BAAGameState from '../model/BAAGameState.js';
import GameModel from '../model/GameModel.js';
import BAARewardNode from './BAARewardNode.js';
import StartGameLevelNode from './StartGameLevelNode.js';
class GameScreenView extends ScreenView {
  /**
   * @param {GameModel} gameModel
   * @param {Tandem} tandem
   */
  constructor(gameModel, tandem) {
    super({
      layoutBounds: ShredConstants.LAYOUT_BOUNDS,
      tandem: tandem
    });
    // Add a root node where all of the game-related nodes will live.
    const rootNode = new Node();
    this.addChild(rootNode);
    const startGameLevelNode = new StartGameLevelNode(gameModel, this.layoutBounds, tandem.createTandem('startGameLevelNode'));
    const scoreboard = new FiniteStatusBar(this.layoutBounds, this.visibleBoundsProperty, gameModel.scoreProperty, {
      challengeIndexProperty: gameModel.challengeIndexProperty,
      numberOfChallengesProperty: new Property(GameModel.CHALLENGES_PER_LEVEL),
      elapsedTimeProperty: gameModel.elapsedTimeProperty,
      timerEnabledProperty: gameModel.timerEnabledProperty,
      barFill: 'rgb( 49, 117, 202 )',
      textFill: 'white',
      xMargin: 20,
      dynamicAlignment: false,
      levelVisible: false,
      challengeNumberVisible: false,
      startOverButtonOptions: {
        font: new PhetFont(20),
        textFill: 'black',
        baseColor: '#e5f3ff',
        xMargin: 6,
        yMargin: 5,
        listener: () => {
          gameModel.newGame();
        }
      },
      tandem: tandem.createTandem('scoreboard')
    });
    scoreboard.centerX = this.layoutBounds.centerX;
    scoreboard.top = 0;
    const gameAudioPlayer = new GameAudioPlayer(gameModel.soundEnabledProperty);
    this.rewardNode = null;
    this.levelCompletedNode = null; // @private

    // Monitor the game state and update the view accordingly.
    gameModel.stateProperty.link((state, previousState) => {
      previousState && previousState.disposeState && previousState.disposeState();
      if (state === BAAGameState.CHOOSING_LEVEL) {
        rootNode.removeAllChildren();
        rootNode.addChild(startGameLevelNode);
        if (this.rewardNode !== null) {
          this.rewardNode.dispose();
        }
        if (this.levelCompletedNode !== null) {
          this.levelCompletedNode.dispose();
        }
        this.rewardNode = null;
        this.levelCompletedNode = null;
      } else if (state === BAAGameState.LEVEL_COMPLETED) {
        rootNode.removeAllChildren();
        if (gameModel.scoreProperty.get() === GameModel.MAX_POINTS_PER_GAME_LEVEL || BAAQueryParameters.reward) {
          // Perfect score, add the reward node.
          this.rewardNode = new BAARewardNode(tandem.createTandem('rewardNode'));
          rootNode.addChild(this.rewardNode);

          // Play the appropriate audio feedback
          gameAudioPlayer.gameOverPerfectScore();
        } else if (gameModel.scoreProperty.get() > 0) {
          gameAudioPlayer.gameOverImperfectScore();
        }
        if (gameModel.provideFeedbackProperty.get()) {
          // Add the dialog node that indicates that the level has been completed.
          this.levelCompletedNode = new LevelCompletedNode(gameModel.levelProperty.get() + 1, gameModel.scoreProperty.get(), GameModel.MAX_POINTS_PER_GAME_LEVEL, GameModel.CHALLENGES_PER_LEVEL, gameModel.timerEnabledProperty.get(), gameModel.elapsedTimeProperty.get(), gameModel.bestTimes[gameModel.levelProperty.get()].value, gameModel.newBestTime, () => {
            gameModel.stateProperty.set(BAAGameState.CHOOSING_LEVEL);
          }, {
            centerX: this.layoutBounds.width / 2,
            centerY: this.layoutBounds.height / 2,
            levelVisible: false,
            maxWidth: this.layoutBounds.width,
            tandem: tandem.createTandem('levelCompletedNode')
          });
          rootNode.addChild(this.levelCompletedNode);
        }
      } else if (typeof state.createView === 'function') {
        // Since we're not in the start or game-over states, we must be
        // presenting a challenge.
        rootNode.removeAllChildren();
        const challengeView = state.createView(this.layoutBounds, tandem.createTandem(`${state.tandem.name}View`));
        state.disposeEmitter.addListener(function disposeListener() {
          challengeView.dispose();
          state.disposeEmitter.removeListener(disposeListener);
        });
        rootNode.addChild(challengeView);
        rootNode.addChild(scoreboard);
      }
    });
  }

  // @public - step function for the view, called by the framework
  step(elapsedTime) {
    if (this.rewardNode) {
      this.rewardNode.step(elapsedTime);
    }
  }
}
buildAnAtom.register('GameScreenView', GameScreenView);
export default GameScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlblZpZXciLCJQaGV0Rm9udCIsIk5vZGUiLCJTaHJlZENvbnN0YW50cyIsIkZpbml0ZVN0YXR1c0JhciIsIkdhbWVBdWRpb1BsYXllciIsIkxldmVsQ29tcGxldGVkTm9kZSIsImJ1aWxkQW5BdG9tIiwiQkFBUXVlcnlQYXJhbWV0ZXJzIiwiQkFBR2FtZVN0YXRlIiwiR2FtZU1vZGVsIiwiQkFBUmV3YXJkTm9kZSIsIlN0YXJ0R2FtZUxldmVsTm9kZSIsIkdhbWVTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJnYW1lTW9kZWwiLCJ0YW5kZW0iLCJsYXlvdXRCb3VuZHMiLCJMQVlPVVRfQk9VTkRTIiwicm9vdE5vZGUiLCJhZGRDaGlsZCIsInN0YXJ0R2FtZUxldmVsTm9kZSIsImNyZWF0ZVRhbmRlbSIsInNjb3JlYm9hcmQiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJzY29yZVByb3BlcnR5IiwiY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eSIsIm51bWJlck9mQ2hhbGxlbmdlc1Byb3BlcnR5IiwiQ0hBTExFTkdFU19QRVJfTEVWRUwiLCJlbGFwc2VkVGltZVByb3BlcnR5IiwidGltZXJFbmFibGVkUHJvcGVydHkiLCJiYXJGaWxsIiwidGV4dEZpbGwiLCJ4TWFyZ2luIiwiZHluYW1pY0FsaWdubWVudCIsImxldmVsVmlzaWJsZSIsImNoYWxsZW5nZU51bWJlclZpc2libGUiLCJzdGFydE92ZXJCdXR0b25PcHRpb25zIiwiZm9udCIsImJhc2VDb2xvciIsInlNYXJnaW4iLCJsaXN0ZW5lciIsIm5ld0dhbWUiLCJjZW50ZXJYIiwidG9wIiwiZ2FtZUF1ZGlvUGxheWVyIiwic291bmRFbmFibGVkUHJvcGVydHkiLCJyZXdhcmROb2RlIiwibGV2ZWxDb21wbGV0ZWROb2RlIiwic3RhdGVQcm9wZXJ0eSIsImxpbmsiLCJzdGF0ZSIsInByZXZpb3VzU3RhdGUiLCJkaXNwb3NlU3RhdGUiLCJDSE9PU0lOR19MRVZFTCIsInJlbW92ZUFsbENoaWxkcmVuIiwiZGlzcG9zZSIsIkxFVkVMX0NPTVBMRVRFRCIsImdldCIsIk1BWF9QT0lOVFNfUEVSX0dBTUVfTEVWRUwiLCJyZXdhcmQiLCJnYW1lT3ZlclBlcmZlY3RTY29yZSIsImdhbWVPdmVySW1wZXJmZWN0U2NvcmUiLCJwcm92aWRlRmVlZGJhY2tQcm9wZXJ0eSIsImxldmVsUHJvcGVydHkiLCJiZXN0VGltZXMiLCJ2YWx1ZSIsIm5ld0Jlc3RUaW1lIiwic2V0Iiwid2lkdGgiLCJjZW50ZXJZIiwiaGVpZ2h0IiwibWF4V2lkdGgiLCJjcmVhdGVWaWV3IiwiY2hhbGxlbmdlVmlldyIsIm5hbWUiLCJkaXNwb3NlRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZGlzcG9zZUxpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJzdGVwIiwiZWxhcHNlZFRpbWUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdhbWVTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gdmlldyBmb3IgdGhlIHNlY29uZCB0YWIgb2YgdGhlIEJ1aWxkIGFuIEF0b20gc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFNocmVkQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL3NocmVkL2pzL1NocmVkQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEZpbml0ZVN0YXR1c0JhciBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9GaW5pdGVTdGF0dXNCYXIuanMnO1xyXG5pbXBvcnQgR2FtZUF1ZGlvUGxheWVyIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0dhbWVBdWRpb1BsYXllci5qcyc7XHJcbmltcG9ydCBMZXZlbENvbXBsZXRlZE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvTGV2ZWxDb21wbGV0ZWROb2RlLmpzJztcclxuaW1wb3J0IGJ1aWxkQW5BdG9tIGZyb20gJy4uLy4uL2J1aWxkQW5BdG9tLmpzJztcclxuaW1wb3J0IEJBQVF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi8uLi9jb21tb24vQkFBUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IEJBQUdhbWVTdGF0ZSBmcm9tICcuLi9tb2RlbC9CQUFHYW1lU3RhdGUuanMnO1xyXG5pbXBvcnQgR2FtZU1vZGVsIGZyb20gJy4uL21vZGVsL0dhbWVNb2RlbC5qcyc7XHJcbmltcG9ydCBCQUFSZXdhcmROb2RlIGZyb20gJy4vQkFBUmV3YXJkTm9kZS5qcyc7XHJcbmltcG9ydCBTdGFydEdhbWVMZXZlbE5vZGUgZnJvbSAnLi9TdGFydEdhbWVMZXZlbE5vZGUuanMnO1xyXG5cclxuY2xhc3MgR2FtZVNjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtHYW1lTW9kZWx9IGdhbWVNb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZ2FtZU1vZGVsLCB0YW5kZW0gKSB7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgbGF5b3V0Qm91bmRzOiBTaHJlZENvbnN0YW50cy5MQVlPVVRfQk9VTkRTLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG4gICAgLy8gQWRkIGEgcm9vdCBub2RlIHdoZXJlIGFsbCBvZiB0aGUgZ2FtZS1yZWxhdGVkIG5vZGVzIHdpbGwgbGl2ZS5cclxuICAgIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJvb3ROb2RlICk7XHJcblxyXG4gICAgY29uc3Qgc3RhcnRHYW1lTGV2ZWxOb2RlID0gbmV3IFN0YXJ0R2FtZUxldmVsTm9kZShcclxuICAgICAgZ2FtZU1vZGVsLFxyXG4gICAgICB0aGlzLmxheW91dEJvdW5kcyxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0YXJ0R2FtZUxldmVsTm9kZScgKVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBzY29yZWJvYXJkID0gbmV3IEZpbml0ZVN0YXR1c0JhcihcclxuICAgICAgdGhpcy5sYXlvdXRCb3VuZHMsXHJcbiAgICAgIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICBnYW1lTW9kZWwuc2NvcmVQcm9wZXJ0eSxcclxuICAgICAge1xyXG4gICAgICAgIGNoYWxsZW5nZUluZGV4UHJvcGVydHk6IGdhbWVNb2RlbC5jaGFsbGVuZ2VJbmRleFByb3BlcnR5LFxyXG4gICAgICAgIG51bWJlck9mQ2hhbGxlbmdlc1Byb3BlcnR5OiBuZXcgUHJvcGVydHkoIEdhbWVNb2RlbC5DSEFMTEVOR0VTX1BFUl9MRVZFTCApLFxyXG4gICAgICAgIGVsYXBzZWRUaW1lUHJvcGVydHk6IGdhbWVNb2RlbC5lbGFwc2VkVGltZVByb3BlcnR5LFxyXG4gICAgICAgIHRpbWVyRW5hYmxlZFByb3BlcnR5OiBnYW1lTW9kZWwudGltZXJFbmFibGVkUHJvcGVydHksXHJcbiAgICAgICAgYmFyRmlsbDogJ3JnYiggNDksIDExNywgMjAyICknLFxyXG4gICAgICAgIHRleHRGaWxsOiAnd2hpdGUnLFxyXG4gICAgICAgIHhNYXJnaW46IDIwLFxyXG4gICAgICAgIGR5bmFtaWNBbGlnbm1lbnQ6IGZhbHNlLFxyXG4gICAgICAgIGxldmVsVmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgY2hhbGxlbmdlTnVtYmVyVmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgc3RhcnRPdmVyQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyMCApLFxyXG4gICAgICAgICAgdGV4dEZpbGw6ICdibGFjaycsXHJcbiAgICAgICAgICBiYXNlQ29sb3I6ICcjZTVmM2ZmJyxcclxuICAgICAgICAgIHhNYXJnaW46IDYsXHJcbiAgICAgICAgICB5TWFyZ2luOiA1LFxyXG4gICAgICAgICAgbGlzdGVuZXI6ICgpID0+IHsgZ2FtZU1vZGVsLm5ld0dhbWUoKTsgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2NvcmVib2FyZCcgKVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIHNjb3JlYm9hcmQuY2VudGVyWCA9IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclg7XHJcbiAgICBzY29yZWJvYXJkLnRvcCA9IDA7XHJcbiAgICBjb25zdCBnYW1lQXVkaW9QbGF5ZXIgPSBuZXcgR2FtZUF1ZGlvUGxheWVyKCBnYW1lTW9kZWwuc291bmRFbmFibGVkUHJvcGVydHkgKTtcclxuICAgIHRoaXMucmV3YXJkTm9kZSA9IG51bGw7XHJcbiAgICB0aGlzLmxldmVsQ29tcGxldGVkTm9kZSA9IG51bGw7IC8vIEBwcml2YXRlXHJcblxyXG4gICAgLy8gTW9uaXRvciB0aGUgZ2FtZSBzdGF0ZSBhbmQgdXBkYXRlIHRoZSB2aWV3IGFjY29yZGluZ2x5LlxyXG4gICAgZ2FtZU1vZGVsLnN0YXRlUHJvcGVydHkubGluayggKCBzdGF0ZSwgcHJldmlvdXNTdGF0ZSApID0+IHtcclxuXHJcbiAgICAgICggcHJldmlvdXNTdGF0ZSAmJiBwcmV2aW91c1N0YXRlLmRpc3Bvc2VTdGF0ZSApICYmIHByZXZpb3VzU3RhdGUuZGlzcG9zZVN0YXRlKCk7XHJcblxyXG4gICAgICBpZiAoIHN0YXRlID09PSBCQUFHYW1lU3RhdGUuQ0hPT1NJTkdfTEVWRUwgKSB7XHJcbiAgICAgICAgcm9vdE5vZGUucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICAgICAgICByb290Tm9kZS5hZGRDaGlsZCggc3RhcnRHYW1lTGV2ZWxOb2RlICk7XHJcbiAgICAgICAgaWYgKCB0aGlzLnJld2FyZE5vZGUgIT09IG51bGwgKSB7XHJcbiAgICAgICAgICB0aGlzLnJld2FyZE5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHRoaXMubGV2ZWxDb21wbGV0ZWROb2RlICE9PSBudWxsICkge1xyXG4gICAgICAgICAgdGhpcy5sZXZlbENvbXBsZXRlZE5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJld2FyZE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubGV2ZWxDb21wbGV0ZWROb2RlID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggc3RhdGUgPT09IEJBQUdhbWVTdGF0ZS5MRVZFTF9DT01QTEVURUQgKSB7XHJcbiAgICAgICAgcm9vdE5vZGUucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICAgICAgICBpZiAoIGdhbWVNb2RlbC5zY29yZVByb3BlcnR5LmdldCgpID09PSBHYW1lTW9kZWwuTUFYX1BPSU5UU19QRVJfR0FNRV9MRVZFTCB8fCBCQUFRdWVyeVBhcmFtZXRlcnMucmV3YXJkICkge1xyXG5cclxuICAgICAgICAgIC8vIFBlcmZlY3Qgc2NvcmUsIGFkZCB0aGUgcmV3YXJkIG5vZGUuXHJcbiAgICAgICAgICB0aGlzLnJld2FyZE5vZGUgPSBuZXcgQkFBUmV3YXJkTm9kZSggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jld2FyZE5vZGUnICkgKTtcclxuICAgICAgICAgIHJvb3ROb2RlLmFkZENoaWxkKCB0aGlzLnJld2FyZE5vZGUgKTtcclxuXHJcbiAgICAgICAgICAvLyBQbGF5IHRoZSBhcHByb3ByaWF0ZSBhdWRpbyBmZWVkYmFja1xyXG4gICAgICAgICAgZ2FtZUF1ZGlvUGxheWVyLmdhbWVPdmVyUGVyZmVjdFNjb3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBnYW1lTW9kZWwuc2NvcmVQcm9wZXJ0eS5nZXQoKSA+IDAgKSB7XHJcbiAgICAgICAgICBnYW1lQXVkaW9QbGF5ZXIuZ2FtZU92ZXJJbXBlcmZlY3RTY29yZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCBnYW1lTW9kZWwucHJvdmlkZUZlZWRiYWNrUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gQWRkIHRoZSBkaWFsb2cgbm9kZSB0aGF0IGluZGljYXRlcyB0aGF0IHRoZSBsZXZlbCBoYXMgYmVlbiBjb21wbGV0ZWQuXHJcbiAgICAgICAgICB0aGlzLmxldmVsQ29tcGxldGVkTm9kZSA9IG5ldyBMZXZlbENvbXBsZXRlZE5vZGUoXHJcbiAgICAgICAgICAgIGdhbWVNb2RlbC5sZXZlbFByb3BlcnR5LmdldCgpICsgMSxcclxuICAgICAgICAgICAgZ2FtZU1vZGVsLnNjb3JlUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgICAgIEdhbWVNb2RlbC5NQVhfUE9JTlRTX1BFUl9HQU1FX0xFVkVMLFxyXG4gICAgICAgICAgICBHYW1lTW9kZWwuQ0hBTExFTkdFU19QRVJfTEVWRUwsXHJcbiAgICAgICAgICAgIGdhbWVNb2RlbC50aW1lckVuYWJsZWRQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgICAgICAgZ2FtZU1vZGVsLmVsYXBzZWRUaW1lUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgICAgIGdhbWVNb2RlbC5iZXN0VGltZXNbIGdhbWVNb2RlbC5sZXZlbFByb3BlcnR5LmdldCgpIF0udmFsdWUsXHJcbiAgICAgICAgICAgIGdhbWVNb2RlbC5uZXdCZXN0VGltZSxcclxuICAgICAgICAgICAgKCkgPT4geyBnYW1lTW9kZWwuc3RhdGVQcm9wZXJ0eS5zZXQoIEJBQUdhbWVTdGF0ZS5DSE9PU0lOR19MRVZFTCApOyB9LCB7XHJcbiAgICAgICAgICAgICAgY2VudGVyWDogdGhpcy5sYXlvdXRCb3VuZHMud2lkdGggLyAyLFxyXG4gICAgICAgICAgICAgIGNlbnRlclk6IHRoaXMubGF5b3V0Qm91bmRzLmhlaWdodCAvIDIsXHJcbiAgICAgICAgICAgICAgbGV2ZWxWaXNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICBtYXhXaWR0aDogdGhpcy5sYXlvdXRCb3VuZHMud2lkdGgsXHJcbiAgICAgICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGV2ZWxDb21wbGV0ZWROb2RlJyApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICByb290Tm9kZS5hZGRDaGlsZCggdGhpcy5sZXZlbENvbXBsZXRlZE5vZGUgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHR5cGVvZiAoIHN0YXRlLmNyZWF0ZVZpZXcgKSA9PT0gJ2Z1bmN0aW9uJyApIHtcclxuICAgICAgICAvLyBTaW5jZSB3ZSdyZSBub3QgaW4gdGhlIHN0YXJ0IG9yIGdhbWUtb3ZlciBzdGF0ZXMsIHdlIG11c3QgYmVcclxuICAgICAgICAvLyBwcmVzZW50aW5nIGEgY2hhbGxlbmdlLlxyXG4gICAgICAgIHJvb3ROb2RlLnJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICAgICAgY29uc3QgY2hhbGxlbmdlVmlldyA9IHN0YXRlLmNyZWF0ZVZpZXcoIHRoaXMubGF5b3V0Qm91bmRzLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCBgJHtzdGF0ZS50YW5kZW0ubmFtZX1WaWV3YCApICk7XHJcbiAgICAgICAgc3RhdGUuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIGZ1bmN0aW9uIGRpc3Bvc2VMaXN0ZW5lcigpIHtcclxuICAgICAgICAgIGNoYWxsZW5nZVZpZXcuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgc3RhdGUuZGlzcG9zZUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIGRpc3Bvc2VMaXN0ZW5lciApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICByb290Tm9kZS5hZGRDaGlsZCggY2hhbGxlbmdlVmlldyApO1xyXG4gICAgICAgIHJvb3ROb2RlLmFkZENoaWxkKCBzY29yZWJvYXJkICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWMgLSBzdGVwIGZ1bmN0aW9uIGZvciB0aGUgdmlldywgY2FsbGVkIGJ5IHRoZSBmcmFtZXdvcmtcclxuICBzdGVwKCBlbGFwc2VkVGltZSApIHtcclxuICAgIGlmICggdGhpcy5yZXdhcmROb2RlICkge1xyXG4gICAgICB0aGlzLnJld2FyZE5vZGUuc3RlcCggZWxhcHNlZFRpbWUgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQW5BdG9tLnJlZ2lzdGVyKCAnR2FtZVNjcmVlblZpZXcnLCBHYW1lU2NyZWVuVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBHYW1lU2NyZWVuVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyxjQUFjLE1BQU0sd0NBQXdDO0FBQ25FLE9BQU9DLGVBQWUsTUFBTSx5Q0FBeUM7QUFDckUsT0FBT0MsZUFBZSxNQUFNLHlDQUF5QztBQUNyRSxPQUFPQyxrQkFBa0IsTUFBTSw0Q0FBNEM7QUFDM0UsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxrQkFBa0IsTUFBTSxvQ0FBb0M7QUFDbkUsT0FBT0MsWUFBWSxNQUFNLDBCQUEwQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0sdUJBQXVCO0FBQzdDLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FB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