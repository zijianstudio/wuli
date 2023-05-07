// Copyright 2014-2022, University of Colorado Boulder

/**
 * Screen that allows the user to select the game level that they wish to play.
 *
 * @author John Blanco
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import TimerToggleButton from '../../../../scenery-phet/js/buttons/TimerToggleButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import LevelSelectionButton from '../../../../vegas/js/LevelSelectionButton.js';
import ScoreDisplayStars from '../../../../vegas/js/ScoreDisplayStars.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import balancingAct from '../../balancingAct.js';
import BASharedConstants from '../../common/BASharedConstants.js';
const selectLevelString = VegasStrings.selectLevel;
class StartGameLevelNode extends Node {
  /**
   * @param {Function} startLevelFunction - Function used to initiate a game
   * level, will be called with a zero-based index value.
   * @param {Function} resetFunction - Function to reset game and scores.
   * @param {Property} timerEnabledProperty
   * @param {Array} iconNodes - Set of iconNodes to use on the buttons, sizes
   * should be the same, length of array must match number of levels.
   * @param {Array} scores - Current scores, used to decide which stars to
   * illuminate on the level start buttons, length must match number of levels.
   * @param {Object} modelViewTransform
   * @param {Object} [options] - See code below for options and default values.
   */
  constructor(startLevelFunction, resetFunction, timerEnabledProperty, iconNodes, scores, modelViewTransform, options) {
    super();
    options = merge({
      // Defaults
      numLevels: 4,
      titleString: selectLevelString,
      numStarsOnButtons: 5,
      perfectScore: 10,
      buttonBackgroundColor: 'rgb( 242, 255, 204 )',
      highlightedButtonBackgroundColor: 'rgb( 224, 255, 122 )',
      numButtonRows: 1,
      // For layout
      controlsInset: 10,
      size: new Dimension2(768, 504),
      maxTitleWidth: Number.POSITIVE_INFINITY
    }, options);

    // Verify parameters
    if (iconNodes.length !== options.numLevels || scores.length !== options.numLevels) {
      throw new Error('Number of game levels doesn\'t match length of provided arrays');
    }

    // Title
    const title = new Text(options.titleString, {
      font: new PhetFont(30),
      maxWidth: options.maxTitleWidth
    });
    this.addChild(title);

    // Add the buttons
    function createLevelStartFunction(level) {
      return () => {
        startLevelFunction(level);
      };
    }
    const buttons = new Array(options.numLevels);
    for (let i = 0; i < options.numLevels; i++) {
      buttons[i] = new LevelSelectionButton(iconNodes[i], scores[i], {
        listener: createLevelStartFunction(i),
        baseColor: options.buttonBackgroundColor,
        createScoreDisplay: scoreProperty => new ScoreDisplayStars(scoreProperty, {
          numberOfStars: options.numStarsOnButtons,
          perfectScore: options.perfectScore
        }),
        soundPlayerIndex: i
      });
      this.addChild(buttons[i]);
    }

    // timer control
    const timerToggleButton = new TimerToggleButton(timerEnabledProperty);
    this.addChild(timerToggleButton);

    // Reset button.
    const resetButton = new ResetAllButton({
      listener: resetFunction,
      radius: BASharedConstants.RESET_ALL_BUTTON_RADIUS
    });
    this.addChild(resetButton);

    // Layout
    const numColumns = options.numLevels / options.numButtonRows;
    const buttonSpacingX = buttons[0].width * 1.2; // Note: Assumes all buttons are the same size.
    const buttonSpacingY = buttons[0].height * 1.2; // Note: Assumes all buttons are the same size.
    const firstButtonOrigin = new Vector2(options.size.width / 2 - (numColumns - 1) * buttonSpacingX / 2, options.size.height * 0.45 - (options.numButtonRows - 1) * buttonSpacingY / 2);
    for (let row = 0; row < options.numButtonRows; row++) {
      for (let col = 0; col < numColumns; col++) {
        const buttonIndex = row * numColumns + col;
        buttons[buttonIndex].centerX = firstButtonOrigin.x + col * buttonSpacingX;
        buttons[buttonIndex].centerY = firstButtonOrigin.y + row * buttonSpacingY;
      }
    }
    resetButton.right = options.size.width - options.controlsInset;
    resetButton.bottom = options.size.height - options.controlsInset;
    title.centerX = options.size.width / 2;
    title.centerY = buttons[0].top / 2;
    timerToggleButton.left = options.controlsInset;
    timerToggleButton.bottom = options.size.height - options.controlsInset;
  }
}
balancingAct.register('StartGameLevelNode', StartGameLevelNode);

// Inherit from Node.
export default StartGameLevelNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVmVjdG9yMiIsIm1lcmdlIiwiUmVzZXRBbGxCdXR0b24iLCJUaW1lclRvZ2dsZUJ1dHRvbiIsIlBoZXRGb250IiwiTm9kZSIsIlRleHQiLCJMZXZlbFNlbGVjdGlvbkJ1dHRvbiIsIlNjb3JlRGlzcGxheVN0YXJzIiwiVmVnYXNTdHJpbmdzIiwiYmFsYW5jaW5nQWN0IiwiQkFTaGFyZWRDb25zdGFudHMiLCJzZWxlY3RMZXZlbFN0cmluZyIsInNlbGVjdExldmVsIiwiU3RhcnRHYW1lTGV2ZWxOb2RlIiwiY29uc3RydWN0b3IiLCJzdGFydExldmVsRnVuY3Rpb24iLCJyZXNldEZ1bmN0aW9uIiwidGltZXJFbmFibGVkUHJvcGVydHkiLCJpY29uTm9kZXMiLCJzY29yZXMiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJvcHRpb25zIiwibnVtTGV2ZWxzIiwidGl0bGVTdHJpbmciLCJudW1TdGFyc09uQnV0dG9ucyIsInBlcmZlY3RTY29yZSIsImJ1dHRvbkJhY2tncm91bmRDb2xvciIsImhpZ2hsaWdodGVkQnV0dG9uQmFja2dyb3VuZENvbG9yIiwibnVtQnV0dG9uUm93cyIsImNvbnRyb2xzSW5zZXQiLCJzaXplIiwibWF4VGl0bGVXaWR0aCIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwibGVuZ3RoIiwiRXJyb3IiLCJ0aXRsZSIsImZvbnQiLCJtYXhXaWR0aCIsImFkZENoaWxkIiwiY3JlYXRlTGV2ZWxTdGFydEZ1bmN0aW9uIiwibGV2ZWwiLCJidXR0b25zIiwiQXJyYXkiLCJpIiwibGlzdGVuZXIiLCJiYXNlQ29sb3IiLCJjcmVhdGVTY29yZURpc3BsYXkiLCJzY29yZVByb3BlcnR5IiwibnVtYmVyT2ZTdGFycyIsInNvdW5kUGxheWVySW5kZXgiLCJ0aW1lclRvZ2dsZUJ1dHRvbiIsInJlc2V0QnV0dG9uIiwicmFkaXVzIiwiUkVTRVRfQUxMX0JVVFRPTl9SQURJVVMiLCJudW1Db2x1bW5zIiwiYnV0dG9uU3BhY2luZ1giLCJ3aWR0aCIsImJ1dHRvblNwYWNpbmdZIiwiaGVpZ2h0IiwiZmlyc3RCdXR0b25PcmlnaW4iLCJyb3ciLCJjb2wiLCJidXR0b25JbmRleCIsImNlbnRlclgiLCJ4IiwiY2VudGVyWSIsInkiLCJyaWdodCIsImJvdHRvbSIsInRvcCIsImxlZnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN0YXJ0R2FtZUxldmVsTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY3JlZW4gdGhhdCBhbGxvd3MgdGhlIHVzZXIgdG8gc2VsZWN0IHRoZSBnYW1lIGxldmVsIHRoYXQgdGhleSB3aXNoIHRvIHBsYXkuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBUaW1lclRvZ2dsZUJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9UaW1lclRvZ2dsZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IExldmVsU2VsZWN0aW9uQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0xldmVsU2VsZWN0aW9uQnV0dG9uLmpzJztcclxuaW1wb3J0IFNjb3JlRGlzcGxheVN0YXJzIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1Njb3JlRGlzcGxheVN0YXJzLmpzJztcclxuaW1wb3J0IFZlZ2FzU3RyaW5ncyBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9WZWdhc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgYmFsYW5jaW5nQWN0IGZyb20gJy4uLy4uL2JhbGFuY2luZ0FjdC5qcyc7XHJcbmltcG9ydCBCQVNoYXJlZENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQkFTaGFyZWRDb25zdGFudHMuanMnO1xyXG5cclxuY29uc3Qgc2VsZWN0TGV2ZWxTdHJpbmcgPSBWZWdhc1N0cmluZ3Muc2VsZWN0TGV2ZWw7XHJcblxyXG5jbGFzcyBTdGFydEdhbWVMZXZlbE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gc3RhcnRMZXZlbEZ1bmN0aW9uIC0gRnVuY3Rpb24gdXNlZCB0byBpbml0aWF0ZSBhIGdhbWVcclxuICAgKiBsZXZlbCwgd2lsbCBiZSBjYWxsZWQgd2l0aCBhIHplcm8tYmFzZWQgaW5kZXggdmFsdWUuXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzZXRGdW5jdGlvbiAtIEZ1bmN0aW9uIHRvIHJlc2V0IGdhbWUgYW5kIHNjb3Jlcy5cclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5fSB0aW1lckVuYWJsZWRQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7QXJyYXl9IGljb25Ob2RlcyAtIFNldCBvZiBpY29uTm9kZXMgdG8gdXNlIG9uIHRoZSBidXR0b25zLCBzaXplc1xyXG4gICAqIHNob3VsZCBiZSB0aGUgc2FtZSwgbGVuZ3RoIG9mIGFycmF5IG11c3QgbWF0Y2ggbnVtYmVyIG9mIGxldmVscy5cclxuICAgKiBAcGFyYW0ge0FycmF5fSBzY29yZXMgLSBDdXJyZW50IHNjb3JlcywgdXNlZCB0byBkZWNpZGUgd2hpY2ggc3RhcnMgdG9cclxuICAgKiBpbGx1bWluYXRlIG9uIHRoZSBsZXZlbCBzdGFydCBidXR0b25zLCBsZW5ndGggbXVzdCBtYXRjaCBudW1iZXIgb2YgbGV2ZWxzLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gU2VlIGNvZGUgYmVsb3cgZm9yIG9wdGlvbnMgYW5kIGRlZmF1bHQgdmFsdWVzLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzdGFydExldmVsRnVuY3Rpb24sIHJlc2V0RnVuY3Rpb24sIHRpbWVyRW5hYmxlZFByb3BlcnR5LCBpY29uTm9kZXMsIHNjb3JlcywgbW9kZWxWaWV3VHJhbnNmb3JtLCBvcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIC8vIERlZmF1bHRzXHJcbiAgICAgIG51bUxldmVsczogNCxcclxuICAgICAgdGl0bGVTdHJpbmc6IHNlbGVjdExldmVsU3RyaW5nLFxyXG4gICAgICBudW1TdGFyc09uQnV0dG9uczogNSxcclxuICAgICAgcGVyZmVjdFNjb3JlOiAxMCxcclxuICAgICAgYnV0dG9uQmFja2dyb3VuZENvbG9yOiAncmdiKCAyNDIsIDI1NSwgMjA0ICknLFxyXG4gICAgICBoaWdobGlnaHRlZEJ1dHRvbkJhY2tncm91bmRDb2xvcjogJ3JnYiggMjI0LCAyNTUsIDEyMiApJyxcclxuICAgICAgbnVtQnV0dG9uUm93czogMSwgLy8gRm9yIGxheW91dFxyXG4gICAgICBjb250cm9sc0luc2V0OiAxMCxcclxuICAgICAgc2l6ZTogbmV3IERpbWVuc2lvbjIoIDc2OCwgNTA0ICksXHJcbiAgICAgIG1heFRpdGxlV2lkdGg6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFZlcmlmeSBwYXJhbWV0ZXJzXHJcbiAgICBpZiAoIGljb25Ob2Rlcy5sZW5ndGggIT09IG9wdGlvbnMubnVtTGV2ZWxzIHx8IHNjb3Jlcy5sZW5ndGggIT09IG9wdGlvbnMubnVtTGV2ZWxzICkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdOdW1iZXIgb2YgZ2FtZSBsZXZlbHMgZG9lc25cXCd0IG1hdGNoIGxlbmd0aCBvZiBwcm92aWRlZCBhcnJheXMnICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGl0bGVcclxuICAgIGNvbnN0IHRpdGxlID0gbmV3IFRleHQoIG9wdGlvbnMudGl0bGVTdHJpbmcsIHsgZm9udDogbmV3IFBoZXRGb250KCAzMCApLCBtYXhXaWR0aDogb3B0aW9ucy5tYXhUaXRsZVdpZHRoIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRpdGxlICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBidXR0b25zXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVMZXZlbFN0YXJ0RnVuY3Rpb24oIGxldmVsICkge1xyXG4gICAgICByZXR1cm4gKCkgPT4geyBzdGFydExldmVsRnVuY3Rpb24oIGxldmVsICk7IH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYnV0dG9ucyA9IG5ldyBBcnJheSggb3B0aW9ucy5udW1MZXZlbHMgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG9wdGlvbnMubnVtTGV2ZWxzOyBpKysgKSB7XHJcbiAgICAgIGJ1dHRvbnNbIGkgXSA9IG5ldyBMZXZlbFNlbGVjdGlvbkJ1dHRvbihcclxuICAgICAgICBpY29uTm9kZXNbIGkgXSxcclxuICAgICAgICBzY29yZXNbIGkgXSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBsaXN0ZW5lcjogY3JlYXRlTGV2ZWxTdGFydEZ1bmN0aW9uKCBpICksXHJcbiAgICAgICAgICBiYXNlQ29sb3I6IG9wdGlvbnMuYnV0dG9uQmFja2dyb3VuZENvbG9yLFxyXG4gICAgICAgICAgY3JlYXRlU2NvcmVEaXNwbGF5OiBzY29yZVByb3BlcnR5ID0+IG5ldyBTY29yZURpc3BsYXlTdGFycyggc2NvcmVQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgICBudW1iZXJPZlN0YXJzOiBvcHRpb25zLm51bVN0YXJzT25CdXR0b25zLFxyXG4gICAgICAgICAgICBwZXJmZWN0U2NvcmU6IG9wdGlvbnMucGVyZmVjdFNjb3JlXHJcbiAgICAgICAgICB9ICksXHJcbiAgICAgICAgICBzb3VuZFBsYXllckluZGV4OiBpXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBidXR0b25zWyBpIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0aW1lciBjb250cm9sXHJcbiAgICBjb25zdCB0aW1lclRvZ2dsZUJ1dHRvbiA9IG5ldyBUaW1lclRvZ2dsZUJ1dHRvbiggdGltZXJFbmFibGVkUHJvcGVydHkgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRpbWVyVG9nZ2xlQnV0dG9uICk7XHJcblxyXG4gICAgLy8gUmVzZXQgYnV0dG9uLlxyXG4gICAgY29uc3QgcmVzZXRCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6IHJlc2V0RnVuY3Rpb24sXHJcbiAgICAgIHJhZGl1czogQkFTaGFyZWRDb25zdGFudHMuUkVTRVRfQUxMX0JVVFRPTl9SQURJVVNcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QnV0dG9uICk7XHJcblxyXG4gICAgLy8gTGF5b3V0XHJcbiAgICBjb25zdCBudW1Db2x1bW5zID0gb3B0aW9ucy5udW1MZXZlbHMgLyBvcHRpb25zLm51bUJ1dHRvblJvd3M7XHJcbiAgICBjb25zdCBidXR0b25TcGFjaW5nWCA9IGJ1dHRvbnNbIDAgXS53aWR0aCAqIDEuMjsgLy8gTm90ZTogQXNzdW1lcyBhbGwgYnV0dG9ucyBhcmUgdGhlIHNhbWUgc2l6ZS5cclxuICAgIGNvbnN0IGJ1dHRvblNwYWNpbmdZID0gYnV0dG9uc1sgMCBdLmhlaWdodCAqIDEuMjsgIC8vIE5vdGU6IEFzc3VtZXMgYWxsIGJ1dHRvbnMgYXJlIHRoZSBzYW1lIHNpemUuXHJcbiAgICBjb25zdCBmaXJzdEJ1dHRvbk9yaWdpbiA9IG5ldyBWZWN0b3IyKCBvcHRpb25zLnNpemUud2lkdGggLyAyIC0gKCBudW1Db2x1bW5zIC0gMSApICogYnV0dG9uU3BhY2luZ1ggLyAyLFxyXG4gICAgICBvcHRpb25zLnNpemUuaGVpZ2h0ICogMC40NSAtICggKCBvcHRpb25zLm51bUJ1dHRvblJvd3MgLSAxICkgKiBidXR0b25TcGFjaW5nWSApIC8gMiApO1xyXG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IG9wdGlvbnMubnVtQnV0dG9uUm93czsgcm93KysgKSB7XHJcbiAgICAgIGZvciAoIGxldCBjb2wgPSAwOyBjb2wgPCBudW1Db2x1bW5zOyBjb2wrKyApIHtcclxuICAgICAgICBjb25zdCBidXR0b25JbmRleCA9IHJvdyAqIG51bUNvbHVtbnMgKyBjb2w7XHJcbiAgICAgICAgYnV0dG9uc1sgYnV0dG9uSW5kZXggXS5jZW50ZXJYID0gZmlyc3RCdXR0b25PcmlnaW4ueCArIGNvbCAqIGJ1dHRvblNwYWNpbmdYO1xyXG4gICAgICAgIGJ1dHRvbnNbIGJ1dHRvbkluZGV4IF0uY2VudGVyWSA9IGZpcnN0QnV0dG9uT3JpZ2luLnkgKyByb3cgKiBidXR0b25TcGFjaW5nWTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVzZXRCdXR0b24ucmlnaHQgPSBvcHRpb25zLnNpemUud2lkdGggLSBvcHRpb25zLmNvbnRyb2xzSW5zZXQ7XHJcbiAgICByZXNldEJ1dHRvbi5ib3R0b20gPSBvcHRpb25zLnNpemUuaGVpZ2h0IC0gb3B0aW9ucy5jb250cm9sc0luc2V0O1xyXG4gICAgdGl0bGUuY2VudGVyWCA9IG9wdGlvbnMuc2l6ZS53aWR0aCAvIDI7XHJcbiAgICB0aXRsZS5jZW50ZXJZID0gYnV0dG9uc1sgMCBdLnRvcCAvIDI7XHJcbiAgICB0aW1lclRvZ2dsZUJ1dHRvbi5sZWZ0ID0gb3B0aW9ucy5jb250cm9sc0luc2V0O1xyXG4gICAgdGltZXJUb2dnbGVCdXR0b24uYm90dG9tID0gb3B0aW9ucy5zaXplLmhlaWdodCAtIG9wdGlvbnMuY29udHJvbHNJbnNldDtcclxuICB9XHJcbn1cclxuXHJcbmJhbGFuY2luZ0FjdC5yZWdpc3RlciggJ1N0YXJ0R2FtZUxldmVsTm9kZScsIFN0YXJ0R2FtZUxldmVsTm9kZSApO1xyXG5cclxuLy8gSW5oZXJpdCBmcm9tIE5vZGUuXHJcbmV4cG9ydCBkZWZhdWx0IFN0YXJ0R2FtZUxldmVsTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsY0FBYyxNQUFNLHVEQUF1RDtBQUNsRixPQUFPQyxpQkFBaUIsTUFBTSwwREFBMEQ7QUFDeEYsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDOUQsT0FBT0Msb0JBQW9CLE1BQU0sOENBQThDO0FBQy9FLE9BQU9DLGlCQUFpQixNQUFNLDJDQUEyQztBQUN6RSxPQUFPQyxZQUFZLE1BQU0sc0NBQXNDO0FBQy9ELE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MsaUJBQWlCLE1BQU0sbUNBQW1DO0FBRWpFLE1BQU1DLGlCQUFpQixHQUFHSCxZQUFZLENBQUNJLFdBQVc7QUFFbEQsTUFBTUMsa0JBQWtCLFNBQVNULElBQUksQ0FBQztFQUVwQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVUsV0FBV0EsQ0FBRUMsa0JBQWtCLEVBQUVDLGFBQWEsRUFBRUMsb0JBQW9CLEVBQUVDLFNBQVMsRUFBRUMsTUFBTSxFQUFFQyxr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