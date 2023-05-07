// Copyright 2014-2022, University of Colorado Boulder

/**
 * A composite node that contains all game components: times table, keypad, equation, smile face, etc.  Some of these
 * are created here, others are passed in (when they need to be of different types), and all are laid out here.
 *
 * @author Andrey Zelenkov (MLearner)
 * @author John Blanco
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import BackButton from '../../../../scenery-phet/js/buttons/BackButton.js';
import NumberKeypad from '../../../../scenery-phet/js/NumberKeypad.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import arithmetic from '../../arithmetic.js';
import ArithmeticStrings from '../../ArithmeticStrings.js';
import ArithmeticGlobals from '../ArithmeticGlobals.js';
import GameState from '../model/GameState.js';
import ArithmeticFaceWithPointsNode from './ArithmeticFaceWithPointsNode.js';
import LevelCompletedNodeWrapper from './LevelCompletedNodeWrapper.js';
import ScoreboardNode from './ScoreboardNode.js';

// constants
const BACK_BUTTON_BASE_COLOR = PhetColorScheme.BUTTON_YELLOW; // base color of back button
const BACK_BUTTON_MARGIN = new Dimension2(20, 10); // margin of background of back button
const BUTTON_BASE_COLOR = PhetColorScheme.BUTTON_YELLOW;
const BUTTON_FONT = new PhetFont({
  size: 20
});
const checkString = ArithmeticStrings.check;
const tryAgainString = ArithmeticStrings.tryAgain;
class WorkspaceNode extends Node {
  /**
   * @param {ArithmeticModel} model - main model for screen.
   * @param {Node} multiplicationTableNode - Multiplication table node for given screen.  This can be (and generally is)
   * different depending on the flavor of the game, i.e. multiplication, division, or factoring.  This is why it is
   * passed in rather than locally created.
   * @param {Node} equationNode - Equation node for given screen.  This can be (and generally is) different depending
   * on the flavor of the game, i.e. multiplication, division, or factoring.  This is why it is passed in rather than
   * locally created.
   * @param {Bounds2} layoutBounds - Bounds of main screen. Necessary for placing components.
   * @param {Object} [options]
   *
   */
  constructor(model, multiplicationTableNode, equationNode, layoutBounds, options) {
    super();
    options = merge({
      scoreboardTitle: '',
      showKeypad: true
    }, options);

    // add button for returning to the level select screen
    const backButton = new BackButton({
      baseColor: BACK_BUTTON_BASE_COLOR,
      xMargin: BACK_BUTTON_MARGIN.width,
      yMargin: BACK_BUTTON_MARGIN.height,
      scale: 0.75,
      // empirically determined
      left: layoutBounds.maxX * 0.02,
      top: layoutBounds.maxY * 0.02,
      listener: () => {
        model.returnToLevelSelectScreen();
      }
    });
    this.addChild(backButton);

    // add multiplication table
    multiplicationTableNode.mutate({
      top: layoutBounds.maxY * 0.02,
      centerX: layoutBounds.width * 0.43
    });
    this.addChild(multiplicationTableNode);

    // clear the multiplication table node on a refresh event.
    model.refreshEmitter.addListener(() => {
      multiplicationTableNode.refreshLevel(model.levelNumberProperty.get());
    });

    // add equation
    equationNode.bottom = layoutBounds.maxY * 0.87;
    equationNode.centerX = layoutBounds.width * 0.45;
    this.addChild(equationNode);

    // hide the equation node when the level has been completed
    model.stateProperty.link((newGameState, oldGameState) => {
      // Hide the equation node when the level has been completed and when returning to the level selection screen
      // after the level is complete.
      equationNode.visible = !(newGameState === GameState.LEVEL_COMPLETED || oldGameState === GameState.LEVEL_COMPLETED && newGameState === GameState.SELECTING_LEVEL);
    });

    // define the width of the control panel so that it fits between the table and the bounds with some margin
    const controlPanelWidth = layoutBounds.maxX - multiplicationTableNode.right - 60;

    // add control panel
    const controlPanelNode = new ScoreboardNode(model.levelNumberProperty, model.stateProperty, model.levelModels, ArithmeticGlobals.timerEnabledProperty, () => {
      model.refreshLevel();
    }, {
      title: options.scoreboardTitle,
      minWidth: controlPanelWidth,
      maxWidth: controlPanelWidth,
      centerX: (multiplicationTableNode.right + layoutBounds.maxX) / 2,
      top: backButton.top
    });
    controlPanelNode.top = multiplicationTableNode.top;
    this.addChild(controlPanelNode);

    // set up some variables needed for positioning the buttons
    const buttonYCenter = (equationNode.bottom + layoutBounds.maxY) / 2 - 5; // tweaked a bit empirically
    const maxButtonWidth = layoutBounds.maxX - multiplicationTableNode.bounds.maxX;

    // add keypad if necessary
    if (options.showKeypad) {
      // create and add the keypad
      const keypad = new NumberKeypad({
        valueStringProperty: model.inputProperty,
        validateKey: NumberKeypad.validateMaxDigits({
          maxDigits: 3
        }),
        centerX: controlPanelNode.centerX,
        bottom: layoutBounds.maxY * 0.85
      });
      this.addChild(keypad);

      // Update the keypad state based on the game state.
      model.stateProperty.link((newGameState, oldGameState) => {
        if (newGameState === GameState.DISPLAYING_INCORRECT_ANSWER_FEEDBACK) {
          // Arm the keypad for auto-clear when showing incorrect feedback.  This is part of the feature where the user
          // can simply start entering values again if they got the wrong answer initially.
          keypad.clearOnNextKeyPress = true;
        } else if (newGameState === GameState.AWAITING_USER_INPUT && oldGameState !== GameState.DISPLAYING_INCORRECT_ANSWER_FEEDBACK) {
          keypad.clear();
        }

        // Only allow the user to input digits when expecting them.  We use 'pickable' here instead of 'enabled' so that
        // we don't gray out the keypad, which might visually draw attention to it.
        keypad.pickable = newGameState === GameState.AWAITING_USER_INPUT || newGameState === GameState.DISPLAYING_INCORRECT_ANSWER_FEEDBACK;

        // The keypad should be invisible once the level is completed, and should stay invisible on transition to the
        // SELECTING_LEVEL state.
        keypad.visible = !(newGameState === GameState.LEVEL_COMPLETED || oldGameState === GameState.LEVEL_COMPLETED && newGameState === GameState.SELECTING_LEVEL);
      });

      // add the 'Check' button, which is only used in conjunction with the keypad
      const checkButton = new TextPushButton(checkString, {
        font: BUTTON_FONT,
        centerY: buttonYCenter,
        centerX: controlPanelNode.centerX,
        baseColor: BUTTON_BASE_COLOR,
        maxWidth: maxButtonWidth,
        listener: () => {
          model.fillEquation();
        }
      });
      this.addChild(checkButton);
      const updateCheckButtonState = () => {
        checkButton.visible = model.stateProperty.get() === GameState.AWAITING_USER_INPUT;
        checkButton.enabled = model.inputProperty.get().length > 0;
      };

      // control the visibility of the 'Check' button
      model.stateProperty.link(updateCheckButtonState);

      // Monitor the string entered from the keypad and, if the user starts entering something immediately after
      // receiving the feedback indicating an incorrect answer, allow them to retry the problem.
      model.inputProperty.link(input => {
        if (model.stateProperty.get() === GameState.DISPLAYING_INCORRECT_ANSWER_FEEDBACK) {
          model.retryProblem();
        }
        updateCheckButtonState();
      });
    }

    // add smile face
    this.addChild(new ArithmeticFaceWithPointsNode(model.faceModel, {
      bottom: layoutBounds.maxY * 0.92,
      left: layoutBounds.maxX * 0.04
    }));

    // add the 'try again' button
    const tryAgainButton = new TextPushButton(tryAgainString, {
      font: BUTTON_FONT,
      centerY: buttonYCenter,
      centerX: controlPanelNode.centerX,
      baseColor: BUTTON_BASE_COLOR,
      maxWidth: maxButtonWidth,
      listener: () => {
        model.inputProperty.reset();
        model.retryProblem();
      }
    });
    this.addChild(tryAgainButton);

    // control the visibility of the 'Try Again' button
    model.stateProperty.link(state => {
      tryAgainButton.visible = state === GameState.DISPLAYING_INCORRECT_ANSWER_FEEDBACK;
    });

    // add the dialog that indicates that the level has been completed
    this.addChild(new LevelCompletedNodeWrapper(model.levelModels, model.levelNumberProperty, model.stateProperty, ArithmeticGlobals.timerEnabledProperty, () => {
      model.stateProperty.set(GameState.LEVEL_COMPLETED);
      model.returnToLevelSelectScreen();
    }, layoutBounds));
  }
}
arithmetic.register('WorkspaceNode', WorkspaceNode);
export default WorkspaceNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwibWVyZ2UiLCJCYWNrQnV0dG9uIiwiTnVtYmVyS2V5cGFkIiwiUGhldENvbG9yU2NoZW1lIiwiUGhldEZvbnQiLCJOb2RlIiwiVGV4dFB1c2hCdXR0b24iLCJhcml0aG1ldGljIiwiQXJpdGhtZXRpY1N0cmluZ3MiLCJBcml0aG1ldGljR2xvYmFscyIsIkdhbWVTdGF0ZSIsIkFyaXRobWV0aWNGYWNlV2l0aFBvaW50c05vZGUiLCJMZXZlbENvbXBsZXRlZE5vZGVXcmFwcGVyIiwiU2NvcmVib2FyZE5vZGUiLCJCQUNLX0JVVFRPTl9CQVNFX0NPTE9SIiwiQlVUVE9OX1lFTExPVyIsIkJBQ0tfQlVUVE9OX01BUkdJTiIsIkJVVFRPTl9CQVNFX0NPTE9SIiwiQlVUVE9OX0ZPTlQiLCJzaXplIiwiY2hlY2tTdHJpbmciLCJjaGVjayIsInRyeUFnYWluU3RyaW5nIiwidHJ5QWdhaW4iLCJXb3Jrc3BhY2VOb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIm11bHRpcGxpY2F0aW9uVGFibGVOb2RlIiwiZXF1YXRpb25Ob2RlIiwibGF5b3V0Qm91bmRzIiwib3B0aW9ucyIsInNjb3JlYm9hcmRUaXRsZSIsInNob3dLZXlwYWQiLCJiYWNrQnV0dG9uIiwiYmFzZUNvbG9yIiwieE1hcmdpbiIsIndpZHRoIiwieU1hcmdpbiIsImhlaWdodCIsInNjYWxlIiwibGVmdCIsIm1heFgiLCJ0b3AiLCJtYXhZIiwibGlzdGVuZXIiLCJyZXR1cm5Ub0xldmVsU2VsZWN0U2NyZWVuIiwiYWRkQ2hpbGQiLCJtdXRhdGUiLCJjZW50ZXJYIiwicmVmcmVzaEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInJlZnJlc2hMZXZlbCIsImxldmVsTnVtYmVyUHJvcGVydHkiLCJnZXQiLCJib3R0b20iLCJzdGF0ZVByb3BlcnR5IiwibGluayIsIm5ld0dhbWVTdGF0ZSIsIm9sZEdhbWVTdGF0ZSIsInZpc2libGUiLCJMRVZFTF9DT01QTEVURUQiLCJTRUxFQ1RJTkdfTEVWRUwiLCJjb250cm9sUGFuZWxXaWR0aCIsInJpZ2h0IiwiY29udHJvbFBhbmVsTm9kZSIsImxldmVsTW9kZWxzIiwidGltZXJFbmFibGVkUHJvcGVydHkiLCJ0aXRsZSIsIm1pbldpZHRoIiwibWF4V2lkdGgiLCJidXR0b25ZQ2VudGVyIiwibWF4QnV0dG9uV2lkdGgiLCJib3VuZHMiLCJrZXlwYWQiLCJ2YWx1ZVN0cmluZ1Byb3BlcnR5IiwiaW5wdXRQcm9wZXJ0eSIsInZhbGlkYXRlS2V5IiwidmFsaWRhdGVNYXhEaWdpdHMiLCJtYXhEaWdpdHMiLCJESVNQTEFZSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0siLCJjbGVhck9uTmV4dEtleVByZXNzIiwiQVdBSVRJTkdfVVNFUl9JTlBVVCIsImNsZWFyIiwicGlja2FibGUiLCJjaGVja0J1dHRvbiIsImZvbnQiLCJjZW50ZXJZIiwiZmlsbEVxdWF0aW9uIiwidXBkYXRlQ2hlY2tCdXR0b25TdGF0ZSIsImVuYWJsZWQiLCJsZW5ndGgiLCJpbnB1dCIsInJldHJ5UHJvYmxlbSIsImZhY2VNb2RlbCIsInRyeUFnYWluQnV0dG9uIiwicmVzZXQiLCJzdGF0ZSIsInNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV29ya3NwYWNlTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGNvbXBvc2l0ZSBub2RlIHRoYXQgY29udGFpbnMgYWxsIGdhbWUgY29tcG9uZW50czogdGltZXMgdGFibGUsIGtleXBhZCwgZXF1YXRpb24sIHNtaWxlIGZhY2UsIGV0Yy4gIFNvbWUgb2YgdGhlc2VcclxuICogYXJlIGNyZWF0ZWQgaGVyZSwgb3RoZXJzIGFyZSBwYXNzZWQgaW4gKHdoZW4gdGhleSBuZWVkIHRvIGJlIG9mIGRpZmZlcmVudCB0eXBlcyksIGFuZCBhbGwgYXJlIGxhaWQgb3V0IGhlcmUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNTGVhcm5lcilcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBCYWNrQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL0JhY2tCdXR0b24uanMnO1xyXG5pbXBvcnQgTnVtYmVyS2V5cGFkIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJLZXlwYWQuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUZXh0UHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9UZXh0UHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBhcml0aG1ldGljIGZyb20gJy4uLy4uL2FyaXRobWV0aWMuanMnO1xyXG5pbXBvcnQgQXJpdGhtZXRpY1N0cmluZ3MgZnJvbSAnLi4vLi4vQXJpdGhtZXRpY1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgQXJpdGhtZXRpY0dsb2JhbHMgZnJvbSAnLi4vQXJpdGhtZXRpY0dsb2JhbHMuanMnO1xyXG5pbXBvcnQgR2FtZVN0YXRlIGZyb20gJy4uL21vZGVsL0dhbWVTdGF0ZS5qcyc7XHJcbmltcG9ydCBBcml0aG1ldGljRmFjZVdpdGhQb2ludHNOb2RlIGZyb20gJy4vQXJpdGhtZXRpY0ZhY2VXaXRoUG9pbnRzTm9kZS5qcyc7XHJcbmltcG9ydCBMZXZlbENvbXBsZXRlZE5vZGVXcmFwcGVyIGZyb20gJy4vTGV2ZWxDb21wbGV0ZWROb2RlV3JhcHBlci5qcyc7XHJcbmltcG9ydCBTY29yZWJvYXJkTm9kZSBmcm9tICcuL1Njb3JlYm9hcmROb2RlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBCQUNLX0JVVFRPTl9CQVNFX0NPTE9SID0gUGhldENvbG9yU2NoZW1lLkJVVFRPTl9ZRUxMT1c7IC8vIGJhc2UgY29sb3Igb2YgYmFjayBidXR0b25cclxuY29uc3QgQkFDS19CVVRUT05fTUFSR0lOID0gbmV3IERpbWVuc2lvbjIoIDIwLCAxMCApOyAvLyBtYXJnaW4gb2YgYmFja2dyb3VuZCBvZiBiYWNrIGJ1dHRvblxyXG5jb25zdCBCVVRUT05fQkFTRV9DT0xPUiA9IFBoZXRDb2xvclNjaGVtZS5CVVRUT05fWUVMTE9XO1xyXG5jb25zdCBCVVRUT05fRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyMCB9ICk7XHJcblxyXG5jb25zdCBjaGVja1N0cmluZyA9IEFyaXRobWV0aWNTdHJpbmdzLmNoZWNrO1xyXG5jb25zdCB0cnlBZ2FpblN0cmluZyA9IEFyaXRobWV0aWNTdHJpbmdzLnRyeUFnYWluO1xyXG5cclxuY2xhc3MgV29ya3NwYWNlTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0FyaXRobWV0aWNNb2RlbH0gbW9kZWwgLSBtYWluIG1vZGVsIGZvciBzY3JlZW4uXHJcbiAgICogQHBhcmFtIHtOb2RlfSBtdWx0aXBsaWNhdGlvblRhYmxlTm9kZSAtIE11bHRpcGxpY2F0aW9uIHRhYmxlIG5vZGUgZm9yIGdpdmVuIHNjcmVlbi4gIFRoaXMgY2FuIGJlIChhbmQgZ2VuZXJhbGx5IGlzKVxyXG4gICAqIGRpZmZlcmVudCBkZXBlbmRpbmcgb24gdGhlIGZsYXZvciBvZiB0aGUgZ2FtZSwgaS5lLiBtdWx0aXBsaWNhdGlvbiwgZGl2aXNpb24sIG9yIGZhY3RvcmluZy4gIFRoaXMgaXMgd2h5IGl0IGlzXHJcbiAgICogcGFzc2VkIGluIHJhdGhlciB0aGFuIGxvY2FsbHkgY3JlYXRlZC5cclxuICAgKiBAcGFyYW0ge05vZGV9IGVxdWF0aW9uTm9kZSAtIEVxdWF0aW9uIG5vZGUgZm9yIGdpdmVuIHNjcmVlbi4gIFRoaXMgY2FuIGJlIChhbmQgZ2VuZXJhbGx5IGlzKSBkaWZmZXJlbnQgZGVwZW5kaW5nXHJcbiAgICogb24gdGhlIGZsYXZvciBvZiB0aGUgZ2FtZSwgaS5lLiBtdWx0aXBsaWNhdGlvbiwgZGl2aXNpb24sIG9yIGZhY3RvcmluZy4gIFRoaXMgaXMgd2h5IGl0IGlzIHBhc3NlZCBpbiByYXRoZXIgdGhhblxyXG4gICAqIGxvY2FsbHkgY3JlYXRlZC5cclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGxheW91dEJvdW5kcyAtIEJvdW5kcyBvZiBtYWluIHNjcmVlbi4gTmVjZXNzYXJ5IGZvciBwbGFjaW5nIGNvbXBvbmVudHMuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBtdWx0aXBsaWNhdGlvblRhYmxlTm9kZSwgZXF1YXRpb25Ob2RlLCBsYXlvdXRCb3VuZHMsIG9wdGlvbnMgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBzY29yZWJvYXJkVGl0bGU6ICcnLFxyXG4gICAgICBzaG93S2V5cGFkOiB0cnVlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gYWRkIGJ1dHRvbiBmb3IgcmV0dXJuaW5nIHRvIHRoZSBsZXZlbCBzZWxlY3Qgc2NyZWVuXHJcbiAgICBjb25zdCBiYWNrQnV0dG9uID0gbmV3IEJhY2tCdXR0b24oIHtcclxuICAgICAgYmFzZUNvbG9yOiBCQUNLX0JVVFRPTl9CQVNFX0NPTE9SLFxyXG4gICAgICB4TWFyZ2luOiBCQUNLX0JVVFRPTl9NQVJHSU4ud2lkdGgsXHJcbiAgICAgIHlNYXJnaW46IEJBQ0tfQlVUVE9OX01BUkdJTi5oZWlnaHQsXHJcbiAgICAgIHNjYWxlOiAwLjc1LCAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICAgIGxlZnQ6IGxheW91dEJvdW5kcy5tYXhYICogMC4wMixcclxuICAgICAgdG9wOiBsYXlvdXRCb3VuZHMubWF4WSAqIDAuMDIsXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgbW9kZWwucmV0dXJuVG9MZXZlbFNlbGVjdFNjcmVlbigpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggYmFja0J1dHRvbiApO1xyXG5cclxuICAgIC8vIGFkZCBtdWx0aXBsaWNhdGlvbiB0YWJsZVxyXG4gICAgbXVsdGlwbGljYXRpb25UYWJsZU5vZGUubXV0YXRlKCB7IHRvcDogbGF5b3V0Qm91bmRzLm1heFkgKiAwLjAyLCBjZW50ZXJYOiBsYXlvdXRCb3VuZHMud2lkdGggKiAwLjQzIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG11bHRpcGxpY2F0aW9uVGFibGVOb2RlICk7XHJcblxyXG4gICAgLy8gY2xlYXIgdGhlIG11bHRpcGxpY2F0aW9uIHRhYmxlIG5vZGUgb24gYSByZWZyZXNoIGV2ZW50LlxyXG4gICAgbW9kZWwucmVmcmVzaEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgbXVsdGlwbGljYXRpb25UYWJsZU5vZGUucmVmcmVzaExldmVsKCBtb2RlbC5sZXZlbE51bWJlclByb3BlcnR5LmdldCgpICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIGVxdWF0aW9uXHJcbiAgICBlcXVhdGlvbk5vZGUuYm90dG9tID0gbGF5b3V0Qm91bmRzLm1heFkgKiAwLjg3O1xyXG4gICAgZXF1YXRpb25Ob2RlLmNlbnRlclggPSBsYXlvdXRCb3VuZHMud2lkdGggKiAwLjQ1O1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZXF1YXRpb25Ob2RlICk7XHJcblxyXG4gICAgLy8gaGlkZSB0aGUgZXF1YXRpb24gbm9kZSB3aGVuIHRoZSBsZXZlbCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgIG1vZGVsLnN0YXRlUHJvcGVydHkubGluayggKCBuZXdHYW1lU3RhdGUsIG9sZEdhbWVTdGF0ZSApID0+IHtcclxuXHJcbiAgICAgIC8vIEhpZGUgdGhlIGVxdWF0aW9uIG5vZGUgd2hlbiB0aGUgbGV2ZWwgaGFzIGJlZW4gY29tcGxldGVkIGFuZCB3aGVuIHJldHVybmluZyB0byB0aGUgbGV2ZWwgc2VsZWN0aW9uIHNjcmVlblxyXG4gICAgICAvLyBhZnRlciB0aGUgbGV2ZWwgaXMgY29tcGxldGUuXHJcbiAgICAgIGVxdWF0aW9uTm9kZS52aXNpYmxlID0gISggbmV3R2FtZVN0YXRlID09PSBHYW1lU3RhdGUuTEVWRUxfQ09NUExFVEVEIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBvbGRHYW1lU3RhdGUgPT09IEdhbWVTdGF0ZS5MRVZFTF9DT01QTEVURUQgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0dhbWVTdGF0ZSA9PT0gR2FtZVN0YXRlLlNFTEVDVElOR19MRVZFTCApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gZGVmaW5lIHRoZSB3aWR0aCBvZiB0aGUgY29udHJvbCBwYW5lbCBzbyB0aGF0IGl0IGZpdHMgYmV0d2VlbiB0aGUgdGFibGUgYW5kIHRoZSBib3VuZHMgd2l0aCBzb21lIG1hcmdpblxyXG4gICAgY29uc3QgY29udHJvbFBhbmVsV2lkdGggPSBsYXlvdXRCb3VuZHMubWF4WCAtIG11bHRpcGxpY2F0aW9uVGFibGVOb2RlLnJpZ2h0IC0gNjA7XHJcblxyXG4gICAgLy8gYWRkIGNvbnRyb2wgcGFuZWxcclxuICAgIGNvbnN0IGNvbnRyb2xQYW5lbE5vZGUgPSBuZXcgU2NvcmVib2FyZE5vZGUoXHJcbiAgICAgIG1vZGVsLmxldmVsTnVtYmVyUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLnN0YXRlUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmxldmVsTW9kZWxzLFxyXG4gICAgICBBcml0aG1ldGljR2xvYmFscy50aW1lckVuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgKCkgPT4ge1xyXG4gICAgICAgIG1vZGVsLnJlZnJlc2hMZXZlbCgpO1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGl0bGU6IG9wdGlvbnMuc2NvcmVib2FyZFRpdGxlLFxyXG4gICAgICAgIG1pbldpZHRoOiBjb250cm9sUGFuZWxXaWR0aCxcclxuICAgICAgICBtYXhXaWR0aDogY29udHJvbFBhbmVsV2lkdGgsXHJcbiAgICAgICAgY2VudGVyWDogKCBtdWx0aXBsaWNhdGlvblRhYmxlTm9kZS5yaWdodCArIGxheW91dEJvdW5kcy5tYXhYICkgLyAyLFxyXG4gICAgICAgIHRvcDogYmFja0J1dHRvbi50b3BcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIGNvbnRyb2xQYW5lbE5vZGUudG9wID0gbXVsdGlwbGljYXRpb25UYWJsZU5vZGUudG9wO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY29udHJvbFBhbmVsTm9kZSApO1xyXG5cclxuICAgIC8vIHNldCB1cCBzb21lIHZhcmlhYmxlcyBuZWVkZWQgZm9yIHBvc2l0aW9uaW5nIHRoZSBidXR0b25zXHJcbiAgICBjb25zdCBidXR0b25ZQ2VudGVyID0gKCBlcXVhdGlvbk5vZGUuYm90dG9tICsgbGF5b3V0Qm91bmRzLm1heFkgKSAvIDIgLSA1OyAvLyB0d2Vha2VkIGEgYml0IGVtcGlyaWNhbGx5XHJcbiAgICBjb25zdCBtYXhCdXR0b25XaWR0aCA9IGxheW91dEJvdW5kcy5tYXhYIC0gbXVsdGlwbGljYXRpb25UYWJsZU5vZGUuYm91bmRzLm1heFg7XHJcblxyXG4gICAgLy8gYWRkIGtleXBhZCBpZiBuZWNlc3NhcnlcclxuICAgIGlmICggb3B0aW9ucy5zaG93S2V5cGFkICkge1xyXG4gICAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUga2V5cGFkXHJcbiAgICAgIGNvbnN0IGtleXBhZCA9IG5ldyBOdW1iZXJLZXlwYWQoIHtcclxuICAgICAgICB2YWx1ZVN0cmluZ1Byb3BlcnR5OiBtb2RlbC5pbnB1dFByb3BlcnR5LFxyXG4gICAgICAgIHZhbGlkYXRlS2V5OiBOdW1iZXJLZXlwYWQudmFsaWRhdGVNYXhEaWdpdHMoIHsgbWF4RGlnaXRzOiAzIH0gKSxcclxuICAgICAgICBjZW50ZXJYOiBjb250cm9sUGFuZWxOb2RlLmNlbnRlclgsXHJcbiAgICAgICAgYm90dG9tOiBsYXlvdXRCb3VuZHMubWF4WSAqIDAuODVcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBrZXlwYWQgKTtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUga2V5cGFkIHN0YXRlIGJhc2VkIG9uIHRoZSBnYW1lIHN0YXRlLlxyXG4gICAgICBtb2RlbC5zdGF0ZVByb3BlcnR5LmxpbmsoICggbmV3R2FtZVN0YXRlLCBvbGRHYW1lU3RhdGUgKSA9PiB7XHJcblxyXG4gICAgICAgIGlmICggbmV3R2FtZVN0YXRlID09PSBHYW1lU3RhdGUuRElTUExBWUlOR19JTkNPUlJFQ1RfQU5TV0VSX0ZFRURCQUNLICkge1xyXG4gICAgICAgICAgLy8gQXJtIHRoZSBrZXlwYWQgZm9yIGF1dG8tY2xlYXIgd2hlbiBzaG93aW5nIGluY29ycmVjdCBmZWVkYmFjay4gIFRoaXMgaXMgcGFydCBvZiB0aGUgZmVhdHVyZSB3aGVyZSB0aGUgdXNlclxyXG4gICAgICAgICAgLy8gY2FuIHNpbXBseSBzdGFydCBlbnRlcmluZyB2YWx1ZXMgYWdhaW4gaWYgdGhleSBnb3QgdGhlIHdyb25nIGFuc3dlciBpbml0aWFsbHkuXHJcbiAgICAgICAgICBrZXlwYWQuY2xlYXJPbk5leHRLZXlQcmVzcyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBuZXdHYW1lU3RhdGUgPT09IEdhbWVTdGF0ZS5BV0FJVElOR19VU0VSX0lOUFVUICYmXHJcbiAgICAgICAgICAgICAgICAgIG9sZEdhbWVTdGF0ZSAhPT0gR2FtZVN0YXRlLkRJU1BMQVlJTkdfSU5DT1JSRUNUX0FOU1dFUl9GRUVEQkFDSyApIHtcclxuICAgICAgICAgIGtleXBhZC5jbGVhcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gT25seSBhbGxvdyB0aGUgdXNlciB0byBpbnB1dCBkaWdpdHMgd2hlbiBleHBlY3RpbmcgdGhlbS4gIFdlIHVzZSAncGlja2FibGUnIGhlcmUgaW5zdGVhZCBvZiAnZW5hYmxlZCcgc28gdGhhdFxyXG4gICAgICAgIC8vIHdlIGRvbid0IGdyYXkgb3V0IHRoZSBrZXlwYWQsIHdoaWNoIG1pZ2h0IHZpc3VhbGx5IGRyYXcgYXR0ZW50aW9uIHRvIGl0LlxyXG4gICAgICAgIGtleXBhZC5waWNrYWJsZSA9IG5ld0dhbWVTdGF0ZSA9PT0gR2FtZVN0YXRlLkFXQUlUSU5HX1VTRVJfSU5QVVQgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdHYW1lU3RhdGUgPT09IEdhbWVTdGF0ZS5ESVNQTEFZSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0s7XHJcblxyXG4gICAgICAgIC8vIFRoZSBrZXlwYWQgc2hvdWxkIGJlIGludmlzaWJsZSBvbmNlIHRoZSBsZXZlbCBpcyBjb21wbGV0ZWQsIGFuZCBzaG91bGQgc3RheSBpbnZpc2libGUgb24gdHJhbnNpdGlvbiB0byB0aGVcclxuICAgICAgICAvLyBTRUxFQ1RJTkdfTEVWRUwgc3RhdGUuXHJcbiAgICAgICAga2V5cGFkLnZpc2libGUgPSAhKCBuZXdHYW1lU3RhdGUgPT09IEdhbWVTdGF0ZS5MRVZFTF9DT01QTEVURUQgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICggb2xkR2FtZVN0YXRlID09PSBHYW1lU3RhdGUuTEVWRUxfQ09NUExFVEVEICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0dhbWVTdGF0ZSA9PT0gR2FtZVN0YXRlLlNFTEVDVElOR19MRVZFTCApICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGFkZCB0aGUgJ0NoZWNrJyBidXR0b24sIHdoaWNoIGlzIG9ubHkgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIHRoZSBrZXlwYWRcclxuICAgICAgY29uc3QgY2hlY2tCdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oIGNoZWNrU3RyaW5nLCB7XHJcbiAgICAgICAgZm9udDogQlVUVE9OX0ZPTlQsXHJcbiAgICAgICAgY2VudGVyWTogYnV0dG9uWUNlbnRlcixcclxuICAgICAgICBjZW50ZXJYOiBjb250cm9sUGFuZWxOb2RlLmNlbnRlclgsXHJcbiAgICAgICAgYmFzZUNvbG9yOiBCVVRUT05fQkFTRV9DT0xPUixcclxuICAgICAgICBtYXhXaWR0aDogbWF4QnV0dG9uV2lkdGgsXHJcbiAgICAgICAgbGlzdGVuZXI6ICgpID0+IHsgbW9kZWwuZmlsbEVxdWF0aW9uKCk7IH1cclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBjaGVja0J1dHRvbiApO1xyXG5cclxuICAgICAgY29uc3QgdXBkYXRlQ2hlY2tCdXR0b25TdGF0ZSA9ICgpID0+IHtcclxuICAgICAgICBjaGVja0J1dHRvbi52aXNpYmxlID0gKCBtb2RlbC5zdGF0ZVByb3BlcnR5LmdldCgpID09PSBHYW1lU3RhdGUuQVdBSVRJTkdfVVNFUl9JTlBVVCApO1xyXG4gICAgICAgIGNoZWNrQnV0dG9uLmVuYWJsZWQgPSBtb2RlbC5pbnB1dFByb3BlcnR5LmdldCgpLmxlbmd0aCA+IDA7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBjb250cm9sIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSAnQ2hlY2snIGJ1dHRvblxyXG4gICAgICBtb2RlbC5zdGF0ZVByb3BlcnR5LmxpbmsoIHVwZGF0ZUNoZWNrQnV0dG9uU3RhdGUgKTtcclxuXHJcbiAgICAgIC8vIE1vbml0b3IgdGhlIHN0cmluZyBlbnRlcmVkIGZyb20gdGhlIGtleXBhZCBhbmQsIGlmIHRoZSB1c2VyIHN0YXJ0cyBlbnRlcmluZyBzb21ldGhpbmcgaW1tZWRpYXRlbHkgYWZ0ZXJcclxuICAgICAgLy8gcmVjZWl2aW5nIHRoZSBmZWVkYmFjayBpbmRpY2F0aW5nIGFuIGluY29ycmVjdCBhbnN3ZXIsIGFsbG93IHRoZW0gdG8gcmV0cnkgdGhlIHByb2JsZW0uXHJcbiAgICAgIG1vZGVsLmlucHV0UHJvcGVydHkubGluayggaW5wdXQgPT4ge1xyXG4gICAgICAgIGlmICggbW9kZWwuc3RhdGVQcm9wZXJ0eS5nZXQoKSA9PT0gR2FtZVN0YXRlLkRJU1BMQVlJTkdfSU5DT1JSRUNUX0FOU1dFUl9GRUVEQkFDSyApIHtcclxuICAgICAgICAgIG1vZGVsLnJldHJ5UHJvYmxlbSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB1cGRhdGVDaGVja0J1dHRvblN0YXRlKCk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhZGQgc21pbGUgZmFjZVxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IEFyaXRobWV0aWNGYWNlV2l0aFBvaW50c05vZGUoIG1vZGVsLmZhY2VNb2RlbCwge1xyXG4gICAgICBib3R0b206IGxheW91dEJvdW5kcy5tYXhZICogMC45MixcclxuICAgICAgbGVmdDogbGF5b3V0Qm91bmRzLm1heFggKiAwLjA0XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlICd0cnkgYWdhaW4nIGJ1dHRvblxyXG4gICAgY29uc3QgdHJ5QWdhaW5CdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oIHRyeUFnYWluU3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IEJVVFRPTl9GT05ULFxyXG4gICAgICBjZW50ZXJZOiBidXR0b25ZQ2VudGVyLFxyXG4gICAgICBjZW50ZXJYOiBjb250cm9sUGFuZWxOb2RlLmNlbnRlclgsXHJcbiAgICAgIGJhc2VDb2xvcjogQlVUVE9OX0JBU0VfQ09MT1IsXHJcbiAgICAgIG1heFdpZHRoOiBtYXhCdXR0b25XaWR0aCxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBtb2RlbC5pbnB1dFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICAgICAgbW9kZWwucmV0cnlQcm9ibGVtKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRyeUFnYWluQnV0dG9uICk7XHJcblxyXG4gICAgLy8gY29udHJvbCB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgJ1RyeSBBZ2FpbicgYnV0dG9uXHJcbiAgICBtb2RlbC5zdGF0ZVByb3BlcnR5LmxpbmsoIHN0YXRlID0+IHtcclxuICAgICAgdHJ5QWdhaW5CdXR0b24udmlzaWJsZSA9ICggc3RhdGUgPT09IEdhbWVTdGF0ZS5ESVNQTEFZSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0sgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIGRpYWxvZyB0aGF0IGluZGljYXRlcyB0aGF0IHRoZSBsZXZlbCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBMZXZlbENvbXBsZXRlZE5vZGVXcmFwcGVyKFxyXG4gICAgICBtb2RlbC5sZXZlbE1vZGVscyxcclxuICAgICAgbW9kZWwubGV2ZWxOdW1iZXJQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuc3RhdGVQcm9wZXJ0eSxcclxuICAgICAgQXJpdGhtZXRpY0dsb2JhbHMudGltZXJFbmFibGVkUHJvcGVydHksXHJcbiAgICAgICgpID0+IHtcclxuICAgICAgICBtb2RlbC5zdGF0ZVByb3BlcnR5LnNldCggR2FtZVN0YXRlLkxFVkVMX0NPTVBMRVRFRCApO1xyXG4gICAgICAgIG1vZGVsLnJldHVyblRvTGV2ZWxTZWxlY3RTY3JlZW4oKTtcclxuICAgICAgfSxcclxuICAgICAgbGF5b3V0Qm91bmRzIClcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5hcml0aG1ldGljLnJlZ2lzdGVyKCAnV29ya3NwYWNlTm9kZScsIFdvcmtzcGFjZU5v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