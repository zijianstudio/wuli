// Copyright 2014-2021, University of Colorado Boulder

/**
 * Base type for view used in the 'Arithmetic' simulation.
 *
 * @author Andrey Zelenkov (MLearner)
 * @author John Blanco
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import arithmetic from '../../arithmetic.js';
import GameState from '../model/GameState.js';
import LevelSelectionNode from './LevelSelectionNode.js';
import WorkspaceNode from './WorkspaceNode.js';

// constants
const SCREEN_CHANGE_TIME = 0.75; // seconds

class ArithmeticView extends ScreenView {
  /**
   * @param {ArithmeticModel} model - Main model for screen.
   * @param {Node} multiplicationTableNode - Multiplication table node for given screen.
   * @param {Node} equationNode - Equation node for given screen.
   * @param {Object} [options] - Configuration and position options, see usage in code for details.
   */
  constructor(model, multiplicationTableNode, equationNode, options) {
    super({
      layoutBounds: new Bounds2(0, 0, 768, 504)
    });
    // defaults
    options = merge({
      titleString: '',
      showKeypad: true,
      levelSelectButtonColor: 'white',
      levelSelectIconSet: 'multiply'
    }, options);

    // create and add the node that allows the user to select the game level
    const levelSelectionNode = new LevelSelectionNode(model, options.titleString, level => {
      model.setLevel(level);
    }, this.layoutBounds, {
      centerX: this.layoutBounds.centerX,
      centerY: this.layoutBounds.centerY,
      buttonBaseColor: options.levelSelectButtonColor,
      iconSet: options.levelSelectIconSet
    });
    this.addChild(levelSelectionNode);

    // add the game components
    const workspaceNode = new WorkspaceNode(model, multiplicationTableNode, equationNode, this.layoutBounds, {
      showKeypad: options.showKeypad,
      scoreboardTitle: options.titleString
    });
    workspaceNode.left = this.layoutBounds.maxX;
    workspaceNode.visible = false;
    this.addChild(workspaceNode);

    // sounds player that is used to produce the feedback sounds for the game
    const gameAudioPlayer = new GameAudioPlayer();

    // set the origin of the answer animation in the multiplication table, which depends upon the newly set position of
    // the equation node.
    multiplicationTableNode.animationOrigin = equationNode.productInput.center;

    // create the animations that will slide the level selection screen and the workspaces in and out
    const levelSelectionScreenInAnimator = new Animation({
      duration: SCREEN_CHANGE_TIME,
      easing: Easing.CUBIC_IN_OUT,
      getValue: () => levelSelectionNode.x,
      setValue: newXPosition => {
        levelSelectionNode.x = newXPosition;
      },
      to: this.layoutBounds.minX
    });
    levelSelectionScreenInAnimator.beginEmitter.addListener(() => {
      levelSelectionNode.visible = true;
      levelSelectionNode.pickable = false; // prevent interaction during animation
    });

    levelSelectionScreenInAnimator.finishEmitter.addListener(() => {
      levelSelectionNode.pickable = true;
    });
    const levelSelectionScreenOutAnimator = new Animation({
      duration: SCREEN_CHANGE_TIME,
      easing: Easing.CUBIC_IN_OUT,
      getValue: () => levelSelectionNode.x,
      setValue: newXPosition => {
        levelSelectionNode.x = newXPosition;
      },
      to: this.layoutBounds.minX - levelSelectionNode.width
    });
    levelSelectionScreenOutAnimator.beginEmitter.addListener(() => {
      levelSelectionNode.pickable = false; // prevent interaction during animation
    });

    levelSelectionScreenOutAnimator.finishEmitter.addListener(() => {
      levelSelectionNode.visible = false;
    });
    const workspaceNodeInAnimator = new Animation({
      duration: SCREEN_CHANGE_TIME,
      easing: Easing.CUBIC_IN_OUT,
      getValue: () => workspaceNode.x,
      setValue: newXPosition => {
        workspaceNode.x = newXPosition;
      },
      to: this.layoutBounds.minX
    });
    workspaceNodeInAnimator.beginEmitter.addListener(() => {
      workspaceNode.visible = true;
      workspaceNode.pickable = false; // prevent interaction during animation
    });

    workspaceNodeInAnimator.finishEmitter.addListener(() => {
      workspaceNode.pickable = true;
    });
    const workspaceNodeOutAnimator = new Animation({
      duration: SCREEN_CHANGE_TIME,
      easing: Easing.CUBIC_IN_OUT,
      getValue: () => workspaceNode.x,
      setValue: newXPosition => {
        workspaceNode.x = newXPosition;
      },
      to: this.layoutBounds.maxX
    });
    workspaceNodeOutAnimator.beginEmitter.addListener(() => {
      workspaceNode.pickable = false; // prevent interaction during animation
    });

    workspaceNodeOutAnimator.finishEmitter.addListener(() => {
      workspaceNode.visible = false;
    });

    // monitor the game state and update the view and changes occur
    model.stateProperty.link((newState, oldState) => {
      // animate the transition between the level select screen and the selected level
      if (newState === GameState.SELECTING_LEVEL && oldState) {
        // Slide out the workspace node
        workspaceNodeInAnimator.stop();
        workspaceNodeOutAnimator.start();

        // Slide in the level selection screen
        levelSelectionScreenOutAnimator.stop();
        levelSelectionScreenInAnimator.start();
      } else if (newState !== GameState.SELECTING_LEVEL && oldState === GameState.SELECTING_LEVEL) {
        // Slide in the workspace node
        workspaceNodeOutAnimator.stop();
        workspaceNodeInAnimator.start();

        // Slide out the level selection screen
        levelSelectionScreenInAnimator.stop();
        levelSelectionScreenOutAnimator.start();
        // levelSelectionScreenAnimatorOld.stop().to( { x: self.layoutBounds.minX - levelSelectionNode.width }, ANIMATION_TIME ).start( phet.joist.elapsedTime );
      }

      // play the appropriate audio, if any, for this state transition
      if ((oldState === GameState.AWAITING_USER_INPUT || oldState === GameState.DISPLAYING_INCORRECT_ANSWER_FEEDBACK) && newState === GameState.DISPLAYING_CORRECT_ANSWER_FEEDBACK) {
        // play the correct answer sound
        gameAudioPlayer.correctAnswer();
      } else if (oldState === GameState.AWAITING_USER_INPUT && newState === GameState.DISPLAYING_INCORRECT_ANSWER_FEEDBACK) {
        // play the incorrect answer sound
        gameAudioPlayer.wrongAnswer();
      } else if (oldState === GameState.DISPLAYING_CORRECT_ANSWER_FEEDBACK && newState === GameState.SHOWING_LEVEL_COMPLETED_DIALOG) {
        const resultScore = model.activeLevelModel.currentScoreProperty.get();
        const perfectScore = model.activeLevelModel.perfectScore;
        if (resultScore === perfectScore) {
          gameAudioPlayer.gameOverPerfectScore();
        } else if (resultScore === 0) {
          gameAudioPlayer.gameOverZeroScore();
        } else {
          gameAudioPlayer.gameOverImperfectScore();
        }
      }
    });
  }
}
arithmetic.register('ArithmeticView', ArithmeticView);
export default ArithmeticView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiU2NyZWVuVmlldyIsIm1lcmdlIiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwiR2FtZUF1ZGlvUGxheWVyIiwiYXJpdGhtZXRpYyIsIkdhbWVTdGF0ZSIsIkxldmVsU2VsZWN0aW9uTm9kZSIsIldvcmtzcGFjZU5vZGUiLCJTQ1JFRU5fQ0hBTkdFX1RJTUUiLCJBcml0aG1ldGljVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJtdWx0aXBsaWNhdGlvblRhYmxlTm9kZSIsImVxdWF0aW9uTm9kZSIsIm9wdGlvbnMiLCJsYXlvdXRCb3VuZHMiLCJ0aXRsZVN0cmluZyIsInNob3dLZXlwYWQiLCJsZXZlbFNlbGVjdEJ1dHRvbkNvbG9yIiwibGV2ZWxTZWxlY3RJY29uU2V0IiwibGV2ZWxTZWxlY3Rpb25Ob2RlIiwibGV2ZWwiLCJzZXRMZXZlbCIsImNlbnRlclgiLCJjZW50ZXJZIiwiYnV0dG9uQmFzZUNvbG9yIiwiaWNvblNldCIsImFkZENoaWxkIiwid29ya3NwYWNlTm9kZSIsInNjb3JlYm9hcmRUaXRsZSIsImxlZnQiLCJtYXhYIiwidmlzaWJsZSIsImdhbWVBdWRpb1BsYXllciIsImFuaW1hdGlvbk9yaWdpbiIsInByb2R1Y3RJbnB1dCIsImNlbnRlciIsImxldmVsU2VsZWN0aW9uU2NyZWVuSW5BbmltYXRvciIsImR1cmF0aW9uIiwiZWFzaW5nIiwiQ1VCSUNfSU5fT1VUIiwiZ2V0VmFsdWUiLCJ4Iiwic2V0VmFsdWUiLCJuZXdYUG9zaXRpb24iLCJ0byIsIm1pblgiLCJiZWdpbkVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInBpY2thYmxlIiwiZmluaXNoRW1pdHRlciIsImxldmVsU2VsZWN0aW9uU2NyZWVuT3V0QW5pbWF0b3IiLCJ3aWR0aCIsIndvcmtzcGFjZU5vZGVJbkFuaW1hdG9yIiwid29ya3NwYWNlTm9kZU91dEFuaW1hdG9yIiwic3RhdGVQcm9wZXJ0eSIsImxpbmsiLCJuZXdTdGF0ZSIsIm9sZFN0YXRlIiwiU0VMRUNUSU5HX0xFVkVMIiwic3RvcCIsInN0YXJ0IiwiQVdBSVRJTkdfVVNFUl9JTlBVVCIsIkRJU1BMQVlJTkdfSU5DT1JSRUNUX0FOU1dFUl9GRUVEQkFDSyIsIkRJU1BMQVlJTkdfQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0siLCJjb3JyZWN0QW5zd2VyIiwid3JvbmdBbnN3ZXIiLCJTSE9XSU5HX0xFVkVMX0NPTVBMRVRFRF9ESUFMT0ciLCJyZXN1bHRTY29yZSIsImFjdGl2ZUxldmVsTW9kZWwiLCJjdXJyZW50U2NvcmVQcm9wZXJ0eSIsImdldCIsInBlcmZlY3RTY29yZSIsImdhbWVPdmVyUGVyZmVjdFNjb3JlIiwiZ2FtZU92ZXJaZXJvU2NvcmUiLCJnYW1lT3ZlckltcGVyZmVjdFNjb3JlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBcml0aG1ldGljVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNlIHR5cGUgZm9yIHZpZXcgdXNlZCBpbiB0aGUgJ0FyaXRobWV0aWMnIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNTGVhcm5lcilcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvbi5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IEdhbWVBdWRpb1BsYXllciBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9HYW1lQXVkaW9QbGF5ZXIuanMnO1xyXG5pbXBvcnQgYXJpdGhtZXRpYyBmcm9tICcuLi8uLi9hcml0aG1ldGljLmpzJztcclxuaW1wb3J0IEdhbWVTdGF0ZSBmcm9tICcuLi9tb2RlbC9HYW1lU3RhdGUuanMnO1xyXG5pbXBvcnQgTGV2ZWxTZWxlY3Rpb25Ob2RlIGZyb20gJy4vTGV2ZWxTZWxlY3Rpb25Ob2RlLmpzJztcclxuaW1wb3J0IFdvcmtzcGFjZU5vZGUgZnJvbSAnLi9Xb3Jrc3BhY2VOb2RlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBTQ1JFRU5fQ0hBTkdFX1RJTUUgPSAwLjc1OyAvLyBzZWNvbmRzXHJcblxyXG5jbGFzcyBBcml0aG1ldGljVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0FyaXRobWV0aWNNb2RlbH0gbW9kZWwgLSBNYWluIG1vZGVsIGZvciBzY3JlZW4uXHJcbiAgICogQHBhcmFtIHtOb2RlfSBtdWx0aXBsaWNhdGlvblRhYmxlTm9kZSAtIE11bHRpcGxpY2F0aW9uIHRhYmxlIG5vZGUgZm9yIGdpdmVuIHNjcmVlbi5cclxuICAgKiBAcGFyYW0ge05vZGV9IGVxdWF0aW9uTm9kZSAtIEVxdWF0aW9uIG5vZGUgZm9yIGdpdmVuIHNjcmVlbi5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gQ29uZmlndXJhdGlvbiBhbmQgcG9zaXRpb24gb3B0aW9ucywgc2VlIHVzYWdlIGluIGNvZGUgZm9yIGRldGFpbHMuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBtdWx0aXBsaWNhdGlvblRhYmxlTm9kZSwgZXF1YXRpb25Ob2RlLCBvcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCB7IGxheW91dEJvdW5kczogbmV3IEJvdW5kczIoIDAsIDAsIDc2OCwgNTA0ICkgfSApO1xyXG4gICAgLy8gZGVmYXVsdHNcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB0aXRsZVN0cmluZzogJycsXHJcbiAgICAgIHNob3dLZXlwYWQ6IHRydWUsXHJcbiAgICAgIGxldmVsU2VsZWN0QnV0dG9uQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgIGxldmVsU2VsZWN0SWNvblNldDogJ211bHRpcGx5J1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSBub2RlIHRoYXQgYWxsb3dzIHRoZSB1c2VyIHRvIHNlbGVjdCB0aGUgZ2FtZSBsZXZlbFxyXG4gICAgY29uc3QgbGV2ZWxTZWxlY3Rpb25Ob2RlID0gbmV3IExldmVsU2VsZWN0aW9uTm9kZShcclxuICAgICAgbW9kZWwsXHJcbiAgICAgIG9wdGlvbnMudGl0bGVTdHJpbmcsXHJcbiAgICAgIGxldmVsID0+IHsgbW9kZWwuc2V0TGV2ZWwoIGxldmVsICk7IH0sXHJcbiAgICAgIHRoaXMubGF5b3V0Qm91bmRzLFxyXG4gICAgICB7XHJcbiAgICAgICAgY2VudGVyWDogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWCxcclxuICAgICAgICBjZW50ZXJZOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJZLFxyXG4gICAgICAgIGJ1dHRvbkJhc2VDb2xvcjogb3B0aW9ucy5sZXZlbFNlbGVjdEJ1dHRvbkNvbG9yLFxyXG4gICAgICAgIGljb25TZXQ6IG9wdGlvbnMubGV2ZWxTZWxlY3RJY29uU2V0XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBsZXZlbFNlbGVjdGlvbk5vZGUgKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIGdhbWUgY29tcG9uZW50c1xyXG4gICAgY29uc3Qgd29ya3NwYWNlTm9kZSA9IG5ldyBXb3Jrc3BhY2VOb2RlKFxyXG4gICAgICBtb2RlbCxcclxuICAgICAgbXVsdGlwbGljYXRpb25UYWJsZU5vZGUsXHJcbiAgICAgIGVxdWF0aW9uTm9kZSxcclxuICAgICAgdGhpcy5sYXlvdXRCb3VuZHMsXHJcbiAgICAgIHsgc2hvd0tleXBhZDogb3B0aW9ucy5zaG93S2V5cGFkLCBzY29yZWJvYXJkVGl0bGU6IG9wdGlvbnMudGl0bGVTdHJpbmcgfVxyXG4gICAgKTtcclxuICAgIHdvcmtzcGFjZU5vZGUubGVmdCA9IHRoaXMubGF5b3V0Qm91bmRzLm1heFg7XHJcbiAgICB3b3Jrc3BhY2VOb2RlLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHdvcmtzcGFjZU5vZGUgKTtcclxuXHJcbiAgICAvLyBzb3VuZHMgcGxheWVyIHRoYXQgaXMgdXNlZCB0byBwcm9kdWNlIHRoZSBmZWVkYmFjayBzb3VuZHMgZm9yIHRoZSBnYW1lXHJcbiAgICBjb25zdCBnYW1lQXVkaW9QbGF5ZXIgPSBuZXcgR2FtZUF1ZGlvUGxheWVyKCk7XHJcblxyXG4gICAgLy8gc2V0IHRoZSBvcmlnaW4gb2YgdGhlIGFuc3dlciBhbmltYXRpb24gaW4gdGhlIG11bHRpcGxpY2F0aW9uIHRhYmxlLCB3aGljaCBkZXBlbmRzIHVwb24gdGhlIG5ld2x5IHNldCBwb3NpdGlvbiBvZlxyXG4gICAgLy8gdGhlIGVxdWF0aW9uIG5vZGUuXHJcbiAgICBtdWx0aXBsaWNhdGlvblRhYmxlTm9kZS5hbmltYXRpb25PcmlnaW4gPSBlcXVhdGlvbk5vZGUucHJvZHVjdElucHV0LmNlbnRlcjtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIGFuaW1hdGlvbnMgdGhhdCB3aWxsIHNsaWRlIHRoZSBsZXZlbCBzZWxlY3Rpb24gc2NyZWVuIGFuZCB0aGUgd29ya3NwYWNlcyBpbiBhbmQgb3V0XHJcbiAgICBjb25zdCBsZXZlbFNlbGVjdGlvblNjcmVlbkluQW5pbWF0b3IgPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgIGR1cmF0aW9uOiBTQ1JFRU5fQ0hBTkdFX1RJTUUsXHJcbiAgICAgIGVhc2luZzogRWFzaW5nLkNVQklDX0lOX09VVCxcclxuICAgICAgZ2V0VmFsdWU6ICgpID0+IGxldmVsU2VsZWN0aW9uTm9kZS54LFxyXG4gICAgICBzZXRWYWx1ZTogbmV3WFBvc2l0aW9uID0+IHtcclxuICAgICAgICBsZXZlbFNlbGVjdGlvbk5vZGUueCA9IG5ld1hQb3NpdGlvbjtcclxuICAgICAgfSxcclxuICAgICAgdG86IHRoaXMubGF5b3V0Qm91bmRzLm1pblhcclxuICAgIH0gKTtcclxuICAgIGxldmVsU2VsZWN0aW9uU2NyZWVuSW5BbmltYXRvci5iZWdpbkVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgbGV2ZWxTZWxlY3Rpb25Ob2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICBsZXZlbFNlbGVjdGlvbk5vZGUucGlja2FibGUgPSBmYWxzZTsgLy8gcHJldmVudCBpbnRlcmFjdGlvbiBkdXJpbmcgYW5pbWF0aW9uXHJcbiAgICB9ICk7XHJcbiAgICBsZXZlbFNlbGVjdGlvblNjcmVlbkluQW5pbWF0b3IuZmluaXNoRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBsZXZlbFNlbGVjdGlvbk5vZGUucGlja2FibGUgPSB0cnVlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGxldmVsU2VsZWN0aW9uU2NyZWVuT3V0QW5pbWF0b3IgPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgIGR1cmF0aW9uOiBTQ1JFRU5fQ0hBTkdFX1RJTUUsXHJcbiAgICAgIGVhc2luZzogRWFzaW5nLkNVQklDX0lOX09VVCxcclxuICAgICAgZ2V0VmFsdWU6ICgpID0+IGxldmVsU2VsZWN0aW9uTm9kZS54LFxyXG4gICAgICBzZXRWYWx1ZTogbmV3WFBvc2l0aW9uID0+IHtcclxuICAgICAgICBsZXZlbFNlbGVjdGlvbk5vZGUueCA9IG5ld1hQb3NpdGlvbjtcclxuICAgICAgfSxcclxuICAgICAgdG86IHRoaXMubGF5b3V0Qm91bmRzLm1pblggLSBsZXZlbFNlbGVjdGlvbk5vZGUud2lkdGhcclxuICAgIH0gKTtcclxuICAgIGxldmVsU2VsZWN0aW9uU2NyZWVuT3V0QW5pbWF0b3IuYmVnaW5FbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIGxldmVsU2VsZWN0aW9uTm9kZS5waWNrYWJsZSA9IGZhbHNlOyAvLyBwcmV2ZW50IGludGVyYWN0aW9uIGR1cmluZyBhbmltYXRpb25cclxuICAgIH0gKTtcclxuICAgIGxldmVsU2VsZWN0aW9uU2NyZWVuT3V0QW5pbWF0b3IuZmluaXNoRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBsZXZlbFNlbGVjdGlvbk5vZGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHdvcmtzcGFjZU5vZGVJbkFuaW1hdG9yID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICBkdXJhdGlvbjogU0NSRUVOX0NIQU5HRV9USU1FLFxyXG4gICAgICBlYXNpbmc6IEVhc2luZy5DVUJJQ19JTl9PVVQsXHJcbiAgICAgIGdldFZhbHVlOiAoKSA9PiB3b3Jrc3BhY2VOb2RlLngsXHJcbiAgICAgIHNldFZhbHVlOiBuZXdYUG9zaXRpb24gPT4ge1xyXG4gICAgICAgIHdvcmtzcGFjZU5vZGUueCA9IG5ld1hQb3NpdGlvbjtcclxuICAgICAgfSxcclxuICAgICAgdG86IHRoaXMubGF5b3V0Qm91bmRzLm1pblhcclxuICAgIH0gKTtcclxuICAgIHdvcmtzcGFjZU5vZGVJbkFuaW1hdG9yLmJlZ2luRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB3b3Jrc3BhY2VOb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB3b3Jrc3BhY2VOb2RlLnBpY2thYmxlID0gZmFsc2U7IC8vIHByZXZlbnQgaW50ZXJhY3Rpb24gZHVyaW5nIGFuaW1hdGlvblxyXG4gICAgfSApO1xyXG4gICAgd29ya3NwYWNlTm9kZUluQW5pbWF0b3IuZmluaXNoRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB3b3Jrc3BhY2VOb2RlLnBpY2thYmxlID0gdHJ1ZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB3b3Jrc3BhY2VOb2RlT3V0QW5pbWF0b3IgPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgIGR1cmF0aW9uOiBTQ1JFRU5fQ0hBTkdFX1RJTUUsXHJcbiAgICAgIGVhc2luZzogRWFzaW5nLkNVQklDX0lOX09VVCxcclxuICAgICAgZ2V0VmFsdWU6ICgpID0+IHdvcmtzcGFjZU5vZGUueCxcclxuICAgICAgc2V0VmFsdWU6IG5ld1hQb3NpdGlvbiA9PiB7XHJcbiAgICAgICAgd29ya3NwYWNlTm9kZS54ID0gbmV3WFBvc2l0aW9uO1xyXG4gICAgICB9LFxyXG4gICAgICB0bzogdGhpcy5sYXlvdXRCb3VuZHMubWF4WFxyXG4gICAgfSApO1xyXG4gICAgd29ya3NwYWNlTm9kZU91dEFuaW1hdG9yLmJlZ2luRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB3b3Jrc3BhY2VOb2RlLnBpY2thYmxlID0gZmFsc2U7IC8vIHByZXZlbnQgaW50ZXJhY3Rpb24gZHVyaW5nIGFuaW1hdGlvblxyXG4gICAgfSApO1xyXG4gICAgd29ya3NwYWNlTm9kZU91dEFuaW1hdG9yLmZpbmlzaEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgd29ya3NwYWNlTm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbW9uaXRvciB0aGUgZ2FtZSBzdGF0ZSBhbmQgdXBkYXRlIHRoZSB2aWV3IGFuZCBjaGFuZ2VzIG9jY3VyXHJcbiAgICBtb2RlbC5zdGF0ZVByb3BlcnR5LmxpbmsoICggbmV3U3RhdGUsIG9sZFN0YXRlICkgPT4ge1xyXG5cclxuICAgICAgLy8gYW5pbWF0ZSB0aGUgdHJhbnNpdGlvbiBiZXR3ZWVuIHRoZSBsZXZlbCBzZWxlY3Qgc2NyZWVuIGFuZCB0aGUgc2VsZWN0ZWQgbGV2ZWxcclxuICAgICAgaWYgKCBuZXdTdGF0ZSA9PT0gR2FtZVN0YXRlLlNFTEVDVElOR19MRVZFTCAmJiBvbGRTdGF0ZSApIHtcclxuXHJcbiAgICAgICAgLy8gU2xpZGUgb3V0IHRoZSB3b3Jrc3BhY2Ugbm9kZVxyXG4gICAgICAgIHdvcmtzcGFjZU5vZGVJbkFuaW1hdG9yLnN0b3AoKTtcclxuICAgICAgICB3b3Jrc3BhY2VOb2RlT3V0QW5pbWF0b3Iuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgLy8gU2xpZGUgaW4gdGhlIGxldmVsIHNlbGVjdGlvbiBzY3JlZW5cclxuICAgICAgICBsZXZlbFNlbGVjdGlvblNjcmVlbk91dEFuaW1hdG9yLnN0b3AoKTtcclxuICAgICAgICBsZXZlbFNlbGVjdGlvblNjcmVlbkluQW5pbWF0b3Iuc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggbmV3U3RhdGUgIT09IEdhbWVTdGF0ZS5TRUxFQ1RJTkdfTEVWRUwgJiYgb2xkU3RhdGUgPT09IEdhbWVTdGF0ZS5TRUxFQ1RJTkdfTEVWRUwgKSB7XHJcblxyXG4gICAgICAgIC8vIFNsaWRlIGluIHRoZSB3b3Jrc3BhY2Ugbm9kZVxyXG4gICAgICAgIHdvcmtzcGFjZU5vZGVPdXRBbmltYXRvci5zdG9wKCk7XHJcbiAgICAgICAgd29ya3NwYWNlTm9kZUluQW5pbWF0b3Iuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgLy8gU2xpZGUgb3V0IHRoZSBsZXZlbCBzZWxlY3Rpb24gc2NyZWVuXHJcbiAgICAgICAgbGV2ZWxTZWxlY3Rpb25TY3JlZW5JbkFuaW1hdG9yLnN0b3AoKTtcclxuICAgICAgICBsZXZlbFNlbGVjdGlvblNjcmVlbk91dEFuaW1hdG9yLnN0YXJ0KCk7XHJcbiAgICAgICAgLy8gbGV2ZWxTZWxlY3Rpb25TY3JlZW5BbmltYXRvck9sZC5zdG9wKCkudG8oIHsgeDogc2VsZi5sYXlvdXRCb3VuZHMubWluWCAtIGxldmVsU2VsZWN0aW9uTm9kZS53aWR0aCB9LCBBTklNQVRJT05fVElNRSApLnN0YXJ0KCBwaGV0LmpvaXN0LmVsYXBzZWRUaW1lICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHBsYXkgdGhlIGFwcHJvcHJpYXRlIGF1ZGlvLCBpZiBhbnksIGZvciB0aGlzIHN0YXRlIHRyYW5zaXRpb25cclxuICAgICAgaWYgKCAoIG9sZFN0YXRlID09PSBHYW1lU3RhdGUuQVdBSVRJTkdfVVNFUl9JTlBVVCB8fCBvbGRTdGF0ZSA9PT0gR2FtZVN0YXRlLkRJU1BMQVlJTkdfSU5DT1JSRUNUX0FOU1dFUl9GRUVEQkFDSyApXHJcbiAgICAgICAgICAgJiYgbmV3U3RhdGUgPT09IEdhbWVTdGF0ZS5ESVNQTEFZSU5HX0NPUlJFQ1RfQU5TV0VSX0ZFRURCQUNLICkge1xyXG4gICAgICAgIC8vIHBsYXkgdGhlIGNvcnJlY3QgYW5zd2VyIHNvdW5kXHJcbiAgICAgICAgZ2FtZUF1ZGlvUGxheWVyLmNvcnJlY3RBbnN3ZXIoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggb2xkU3RhdGUgPT09IEdhbWVTdGF0ZS5BV0FJVElOR19VU0VSX0lOUFVUICYmIG5ld1N0YXRlID09PSBHYW1lU3RhdGUuRElTUExBWUlOR19JTkNPUlJFQ1RfQU5TV0VSX0ZFRURCQUNLICkge1xyXG4gICAgICAgIC8vIHBsYXkgdGhlIGluY29ycmVjdCBhbnN3ZXIgc291bmRcclxuICAgICAgICBnYW1lQXVkaW9QbGF5ZXIud3JvbmdBbnN3ZXIoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggb2xkU3RhdGUgPT09IEdhbWVTdGF0ZS5ESVNQTEFZSU5HX0NPUlJFQ1RfQU5TV0VSX0ZFRURCQUNLICYmIG5ld1N0YXRlID09PSBHYW1lU3RhdGUuU0hPV0lOR19MRVZFTF9DT01QTEVURURfRElBTE9HICkge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdFNjb3JlID0gbW9kZWwuYWN0aXZlTGV2ZWxNb2RlbC5jdXJyZW50U2NvcmVQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICBjb25zdCBwZXJmZWN0U2NvcmUgPSBtb2RlbC5hY3RpdmVMZXZlbE1vZGVsLnBlcmZlY3RTY29yZTtcclxuXHJcbiAgICAgICAgaWYgKCByZXN1bHRTY29yZSA9PT0gcGVyZmVjdFNjb3JlICkge1xyXG4gICAgICAgICAgZ2FtZUF1ZGlvUGxheWVyLmdhbWVPdmVyUGVyZmVjdFNjb3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCByZXN1bHRTY29yZSA9PT0gMCApIHtcclxuICAgICAgICAgIGdhbWVBdWRpb1BsYXllci5nYW1lT3Zlclplcm9TY29yZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGdhbWVBdWRpb1BsYXllci5nYW1lT3ZlckltcGVyZmVjdFNjb3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5hcml0aG1ldGljLnJlZ2lzdGVyKCAnQXJpdGhtZXRpY1ZpZXcnLCBBcml0aG1ldGljVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBBcml0aG1ldGljVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFVBQVUsTUFBTSxvQ0FBb0M7QUFDM0QsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxTQUFTLE1BQU0sbUNBQW1DO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSxnQ0FBZ0M7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHlDQUF5QztBQUNyRSxPQUFPQyxVQUFVLE1BQU0scUJBQXFCO0FBQzVDLE9BQU9DLFNBQVMsTUFBTSx1QkFBdUI7QUFDN0MsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCO0FBQ3hELE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7O0FBRTlDO0FBQ0EsTUFBTUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLENBQUM7O0FBRWpDLE1BQU1DLGNBQWMsU0FBU1YsVUFBVSxDQUFDO0VBRXRDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFVyxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLHVC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