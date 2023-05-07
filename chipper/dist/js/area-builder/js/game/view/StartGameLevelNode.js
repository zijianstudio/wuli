// Copyright 2014-2022, University of Colorado Boulder

/**
 * A node that pretty much fills the screen and that allows the user to select the game level that they wish to play.
 *
 * TODO: This was copied from Balancing Act, used for fast proto, should be replaced with generalized version.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import TimerToggleButton from '../../../../scenery-phet/js/buttons/TimerToggleButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import LevelSelectionButton from '../../../../vegas/js/LevelSelectionButton.js';
import ScoreDisplayStars from '../../../../vegas/js/ScoreDisplayStars.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
const chooseYourLevelString = VegasStrings.chooseYourLevel;

// constants
const CONTROL_BUTTON_TOUCH_AREA_DILATION = 4;
class StartGameLevelNode extends Node {
  /**
   * @param {function} startLevelFunction - Function used to initiate a game
   * level, will be called with a zero-based index value.
   * @param {function} resetFunction - Function to reset game and scores.
   * @param {Property} timerEnabledProperty
   * @param {Array} iconNodes - Set of iconNodes to use on the buttons, sizes
   * should be the same, length of array must match number of levels.
   * @param {Array} scores - Current scores, used to decide which stars to
   * illuminate on the level start buttons, length must match number of levels.
   * @param {Object} [options] - See code below for options and default values.
   */
  constructor(startLevelFunction, resetFunction, timerEnabledProperty, iconNodes, scores, options) {
    super();
    options = merge({
      // defaults
      numLevels: 4,
      titleString: chooseYourLevelString,
      maxTitleWidth: 500,
      numStarsOnButtons: 5,
      perfectScore: 10,
      buttonBackgroundColor: '#A8BEFF',
      numButtonRows: 1,
      // For layout
      controlsInset: 12,
      size: AreaBuilderSharedConstants.LAYOUT_BOUNDS
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
      buttons[i].scale(0.80);
      this.addChild(buttons[i]);
    }

    // Sound and timer controls.
    const timerToggleButton = new TimerToggleButton(timerEnabledProperty, {
      touchAreaXDilation: CONTROL_BUTTON_TOUCH_AREA_DILATION,
      touchAreaYDilation: CONTROL_BUTTON_TOUCH_AREA_DILATION
    });
    this.addChild(timerToggleButton);

    // Reset button.
    const resetButton = new ResetAllButton({
      listener: resetFunction,
      radius: AreaBuilderSharedConstants.RESET_BUTTON_RADIUS
    });
    this.addChild(resetButton);

    // Layout
    const numColumns = options.numLevels / options.numButtonRows;
    const buttonSpacingX = buttons[0].width * 1.2; // Note: Assumes all buttons are the same size.
    const buttonSpacingY = buttons[0].height * 1.2; // Note: Assumes all buttons are the same size.
    const firstButtonOrigin = new Vector2(options.size.width / 2 - (numColumns - 1) * buttonSpacingX / 2, options.size.height * 0.5 - (options.numButtonRows - 1) * buttonSpacingY / 2);
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
areaBuilder.register('StartGameLevelNode', StartGameLevelNode);

// Inherit from Node.
export default StartGameLevelNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwibWVyZ2UiLCJSZXNldEFsbEJ1dHRvbiIsIlRpbWVyVG9nZ2xlQnV0dG9uIiwiUGhldEZvbnQiLCJOb2RlIiwiVGV4dCIsIkxldmVsU2VsZWN0aW9uQnV0dG9uIiwiU2NvcmVEaXNwbGF5U3RhcnMiLCJWZWdhc1N0cmluZ3MiLCJhcmVhQnVpbGRlciIsIkFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzIiwiY2hvb3NlWW91ckxldmVsU3RyaW5nIiwiY2hvb3NlWW91ckxldmVsIiwiQ09OVFJPTF9CVVRUT05fVE9VQ0hfQVJFQV9ESUxBVElPTiIsIlN0YXJ0R2FtZUxldmVsTm9kZSIsImNvbnN0cnVjdG9yIiwic3RhcnRMZXZlbEZ1bmN0aW9uIiwicmVzZXRGdW5jdGlvbiIsInRpbWVyRW5hYmxlZFByb3BlcnR5IiwiaWNvbk5vZGVzIiwic2NvcmVzIiwib3B0aW9ucyIsIm51bUxldmVscyIsInRpdGxlU3RyaW5nIiwibWF4VGl0bGVXaWR0aCIsIm51bVN0YXJzT25CdXR0b25zIiwicGVyZmVjdFNjb3JlIiwiYnV0dG9uQmFja2dyb3VuZENvbG9yIiwibnVtQnV0dG9uUm93cyIsImNvbnRyb2xzSW5zZXQiLCJzaXplIiwiTEFZT1VUX0JPVU5EUyIsImxlbmd0aCIsIkVycm9yIiwidGl0bGUiLCJmb250IiwibWF4V2lkdGgiLCJhZGRDaGlsZCIsImNyZWF0ZUxldmVsU3RhcnRGdW5jdGlvbiIsImxldmVsIiwiYnV0dG9ucyIsIkFycmF5IiwiaSIsImxpc3RlbmVyIiwiYmFzZUNvbG9yIiwiY3JlYXRlU2NvcmVEaXNwbGF5Iiwic2NvcmVQcm9wZXJ0eSIsIm51bWJlck9mU3RhcnMiLCJzb3VuZFBsYXllckluZGV4Iiwic2NhbGUiLCJ0aW1lclRvZ2dsZUJ1dHRvbiIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsInJlc2V0QnV0dG9uIiwicmFkaXVzIiwiUkVTRVRfQlVUVE9OX1JBRElVUyIsIm51bUNvbHVtbnMiLCJidXR0b25TcGFjaW5nWCIsIndpZHRoIiwiYnV0dG9uU3BhY2luZ1kiLCJoZWlnaHQiLCJmaXJzdEJ1dHRvbk9yaWdpbiIsInJvdyIsImNvbCIsImJ1dHRvbkluZGV4IiwiY2VudGVyWCIsIngiLCJjZW50ZXJZIiwieSIsInJpZ2h0IiwiYm90dG9tIiwidG9wIiwibGVmdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3RhcnRHYW1lTGV2ZWxOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbm9kZSB0aGF0IHByZXR0eSBtdWNoIGZpbGxzIHRoZSBzY3JlZW4gYW5kIHRoYXQgYWxsb3dzIHRoZSB1c2VyIHRvIHNlbGVjdCB0aGUgZ2FtZSBsZXZlbCB0aGF0IHRoZXkgd2lzaCB0byBwbGF5LlxyXG4gKlxyXG4gKiBUT0RPOiBUaGlzIHdhcyBjb3BpZWQgZnJvbSBCYWxhbmNpbmcgQWN0LCB1c2VkIGZvciBmYXN0IHByb3RvLCBzaG91bGQgYmUgcmVwbGFjZWQgd2l0aCBnZW5lcmFsaXplZCB2ZXJzaW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IFRpbWVyVG9nZ2xlQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1RpbWVyVG9nZ2xlQnV0dG9uLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTGV2ZWxTZWxlY3Rpb25CdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvTGV2ZWxTZWxlY3Rpb25CdXR0b24uanMnO1xyXG5pbXBvcnQgU2NvcmVEaXNwbGF5U3RhcnMgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvU2NvcmVEaXNwbGF5U3RhcnMuanMnO1xyXG5pbXBvcnQgVmVnYXNTdHJpbmdzIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1ZlZ2FzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBhcmVhQnVpbGRlciBmcm9tICcuLi8uLi9hcmVhQnVpbGRlci5qcyc7XHJcbmltcG9ydCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuanMnO1xyXG5cclxuY29uc3QgY2hvb3NlWW91ckxldmVsU3RyaW5nID0gVmVnYXNTdHJpbmdzLmNob29zZVlvdXJMZXZlbDtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBDT05UUk9MX0JVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OID0gNDtcclxuXHJcbmNsYXNzIFN0YXJ0R2FtZUxldmVsTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdGFydExldmVsRnVuY3Rpb24gLSBGdW5jdGlvbiB1c2VkIHRvIGluaXRpYXRlIGEgZ2FtZVxyXG4gICAqIGxldmVsLCB3aWxsIGJlIGNhbGxlZCB3aXRoIGEgemVyby1iYXNlZCBpbmRleCB2YWx1ZS5cclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSByZXNldEZ1bmN0aW9uIC0gRnVuY3Rpb24gdG8gcmVzZXQgZ2FtZSBhbmQgc2NvcmVzLlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHl9IHRpbWVyRW5hYmxlZFByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtBcnJheX0gaWNvbk5vZGVzIC0gU2V0IG9mIGljb25Ob2RlcyB0byB1c2Ugb24gdGhlIGJ1dHRvbnMsIHNpemVzXHJcbiAgICogc2hvdWxkIGJlIHRoZSBzYW1lLCBsZW5ndGggb2YgYXJyYXkgbXVzdCBtYXRjaCBudW1iZXIgb2YgbGV2ZWxzLlxyXG4gICAqIEBwYXJhbSB7QXJyYXl9IHNjb3JlcyAtIEN1cnJlbnQgc2NvcmVzLCB1c2VkIHRvIGRlY2lkZSB3aGljaCBzdGFycyB0b1xyXG4gICAqIGlsbHVtaW5hdGUgb24gdGhlIGxldmVsIHN0YXJ0IGJ1dHRvbnMsIGxlbmd0aCBtdXN0IG1hdGNoIG51bWJlciBvZiBsZXZlbHMuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIFNlZSBjb2RlIGJlbG93IGZvciBvcHRpb25zIGFuZCBkZWZhdWx0IHZhbHVlcy5cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc3RhcnRMZXZlbEZ1bmN0aW9uLCByZXNldEZ1bmN0aW9uLCB0aW1lckVuYWJsZWRQcm9wZXJ0eSwgaWNvbk5vZGVzLCBzY29yZXMsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIGRlZmF1bHRzXHJcbiAgICAgIG51bUxldmVsczogNCxcclxuICAgICAgdGl0bGVTdHJpbmc6IGNob29zZVlvdXJMZXZlbFN0cmluZyxcclxuICAgICAgbWF4VGl0bGVXaWR0aDogNTAwLFxyXG4gICAgICBudW1TdGFyc09uQnV0dG9uczogNSxcclxuICAgICAgcGVyZmVjdFNjb3JlOiAxMCxcclxuICAgICAgYnV0dG9uQmFja2dyb3VuZENvbG9yOiAnI0E4QkVGRicsXHJcbiAgICAgIG51bUJ1dHRvblJvd3M6IDEsIC8vIEZvciBsYXlvdXRcclxuICAgICAgY29udHJvbHNJbnNldDogMTIsXHJcbiAgICAgIHNpemU6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkxBWU9VVF9CT1VORFNcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBWZXJpZnkgcGFyYW1ldGVyc1xyXG4gICAgaWYgKCBpY29uTm9kZXMubGVuZ3RoICE9PSBvcHRpb25zLm51bUxldmVscyB8fCBzY29yZXMubGVuZ3RoICE9PSBvcHRpb25zLm51bUxldmVscyApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnTnVtYmVyIG9mIGdhbWUgbGV2ZWxzIGRvZXNuXFwndCBtYXRjaCBsZW5ndGggb2YgcHJvdmlkZWQgYXJyYXlzJyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRpdGxlXHJcbiAgICBjb25zdCB0aXRsZSA9IG5ldyBUZXh0KCBvcHRpb25zLnRpdGxlU3RyaW5nLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMzAgKSwgbWF4V2lkdGg6IG9wdGlvbnMubWF4VGl0bGVXaWR0aCB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aXRsZSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgYnV0dG9uc1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlTGV2ZWxTdGFydEZ1bmN0aW9uKCBsZXZlbCApIHtcclxuICAgICAgcmV0dXJuICgpID0+IHsgc3RhcnRMZXZlbEZ1bmN0aW9uKCBsZXZlbCApOyB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJ1dHRvbnMgPSBuZXcgQXJyYXkoIG9wdGlvbnMubnVtTGV2ZWxzICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBvcHRpb25zLm51bUxldmVsczsgaSsrICkge1xyXG4gICAgICBidXR0b25zWyBpIF0gPSBuZXcgTGV2ZWxTZWxlY3Rpb25CdXR0b24oXHJcbiAgICAgICAgaWNvbk5vZGVzWyBpIF0sXHJcbiAgICAgICAgc2NvcmVzWyBpIF0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGlzdGVuZXI6IGNyZWF0ZUxldmVsU3RhcnRGdW5jdGlvbiggaSApLFxyXG4gICAgICAgICAgYmFzZUNvbG9yOiBvcHRpb25zLmJ1dHRvbkJhY2tncm91bmRDb2xvcixcclxuICAgICAgICAgIGNyZWF0ZVNjb3JlRGlzcGxheTogc2NvcmVQcm9wZXJ0eSA9PiBuZXcgU2NvcmVEaXNwbGF5U3RhcnMoIHNjb3JlUHJvcGVydHksIHtcclxuICAgICAgICAgICAgbnVtYmVyT2ZTdGFyczogb3B0aW9ucy5udW1TdGFyc09uQnV0dG9ucyxcclxuICAgICAgICAgICAgcGVyZmVjdFNjb3JlOiBvcHRpb25zLnBlcmZlY3RTY29yZVxyXG4gICAgICAgICAgfSApLFxyXG4gICAgICAgICAgc291bmRQbGF5ZXJJbmRleDogaVxyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgICAgYnV0dG9uc1sgaSBdLnNjYWxlKCAwLjgwICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGJ1dHRvbnNbIGkgXSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNvdW5kIGFuZCB0aW1lciBjb250cm9scy5cclxuICAgIGNvbnN0IHRpbWVyVG9nZ2xlQnV0dG9uID0gbmV3IFRpbWVyVG9nZ2xlQnV0dG9uKCB0aW1lckVuYWJsZWRQcm9wZXJ0eSwge1xyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IENPTlRST0xfQlVUVE9OX1RPVUNIX0FSRUFfRElMQVRJT04sXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogQ09OVFJPTF9CVVRUT05fVE9VQ0hfQVJFQV9ESUxBVElPTlxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGltZXJUb2dnbGVCdXR0b24gKTtcclxuXHJcbiAgICAvLyBSZXNldCBidXR0b24uXHJcbiAgICBjb25zdCByZXNldEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogcmVzZXRGdW5jdGlvbixcclxuICAgICAgcmFkaXVzOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5SRVNFVF9CVVRUT05fUkFESVVTXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCByZXNldEJ1dHRvbiApO1xyXG5cclxuICAgIC8vIExheW91dFxyXG4gICAgY29uc3QgbnVtQ29sdW1ucyA9IG9wdGlvbnMubnVtTGV2ZWxzIC8gb3B0aW9ucy5udW1CdXR0b25Sb3dzO1xyXG4gICAgY29uc3QgYnV0dG9uU3BhY2luZ1ggPSBidXR0b25zWyAwIF0ud2lkdGggKiAxLjI7IC8vIE5vdGU6IEFzc3VtZXMgYWxsIGJ1dHRvbnMgYXJlIHRoZSBzYW1lIHNpemUuXHJcbiAgICBjb25zdCBidXR0b25TcGFjaW5nWSA9IGJ1dHRvbnNbIDAgXS5oZWlnaHQgKiAxLjI7ICAvLyBOb3RlOiBBc3N1bWVzIGFsbCBidXR0b25zIGFyZSB0aGUgc2FtZSBzaXplLlxyXG4gICAgY29uc3QgZmlyc3RCdXR0b25PcmlnaW4gPSBuZXcgVmVjdG9yMiggb3B0aW9ucy5zaXplLndpZHRoIC8gMiAtICggbnVtQ29sdW1ucyAtIDEgKSAqIGJ1dHRvblNwYWNpbmdYIC8gMixcclxuICAgICAgb3B0aW9ucy5zaXplLmhlaWdodCAqIDAuNSAtICggKCBvcHRpb25zLm51bUJ1dHRvblJvd3MgLSAxICkgKiBidXR0b25TcGFjaW5nWSApIC8gMiApO1xyXG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IG9wdGlvbnMubnVtQnV0dG9uUm93czsgcm93KysgKSB7XHJcbiAgICAgIGZvciAoIGxldCBjb2wgPSAwOyBjb2wgPCBudW1Db2x1bW5zOyBjb2wrKyApIHtcclxuICAgICAgICBjb25zdCBidXR0b25JbmRleCA9IHJvdyAqIG51bUNvbHVtbnMgKyBjb2w7XHJcbiAgICAgICAgYnV0dG9uc1sgYnV0dG9uSW5kZXggXS5jZW50ZXJYID0gZmlyc3RCdXR0b25PcmlnaW4ueCArIGNvbCAqIGJ1dHRvblNwYWNpbmdYO1xyXG4gICAgICAgIGJ1dHRvbnNbIGJ1dHRvbkluZGV4IF0uY2VudGVyWSA9IGZpcnN0QnV0dG9uT3JpZ2luLnkgKyByb3cgKiBidXR0b25TcGFjaW5nWTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVzZXRCdXR0b24ucmlnaHQgPSBvcHRpb25zLnNpemUud2lkdGggLSBvcHRpb25zLmNvbnRyb2xzSW5zZXQ7XHJcbiAgICByZXNldEJ1dHRvbi5ib3R0b20gPSBvcHRpb25zLnNpemUuaGVpZ2h0IC0gb3B0aW9ucy5jb250cm9sc0luc2V0O1xyXG4gICAgdGl0bGUuY2VudGVyWCA9IG9wdGlvbnMuc2l6ZS53aWR0aCAvIDI7XHJcbiAgICB0aXRsZS5jZW50ZXJZID0gYnV0dG9uc1sgMCBdLnRvcCAvIDI7XHJcbiAgICB0aW1lclRvZ2dsZUJ1dHRvbi5sZWZ0ID0gb3B0aW9ucy5jb250cm9sc0luc2V0O1xyXG4gICAgdGltZXJUb2dnbGVCdXR0b24uYm90dG9tID0gb3B0aW9ucy5zaXplLmhlaWdodCAtIG9wdGlvbnMuY29udHJvbHNJbnNldDtcclxuICB9XHJcbn1cclxuXHJcbmFyZWFCdWlsZGVyLnJlZ2lzdGVyKCAnU3RhcnRHYW1lTGV2ZWxOb2RlJywgU3RhcnRHYW1lTGV2ZWxOb2RlICk7XHJcblxyXG4vLyBJbmhlcml0IGZyb20gTm9kZS5cclxuZXhwb3J0IGRlZmF1bHQgU3RhcnRHYW1lTGV2ZWxOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLGNBQWMsTUFBTSx1REFBdUQ7QUFDbEYsT0FBT0MsaUJBQWlCLE1BQU0sMERBQTBEO0FBQ3hGLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLG9CQUFvQixNQUFNLDhDQUE4QztBQUMvRSxPQUFPQyxpQkFBaUIsTUFBTSwyQ0FBMkM7QUFDekUsT0FBT0MsWUFBWSxNQUFNLHNDQUFzQztBQUMvRCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9B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