// Copyright 2016-2022, University of Colorado Boulder

/**
 * A node that fills most of the screen and allows the user to select the game level that they wish to play.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import LevelSelectionButton from '../../../../vegas/js/LevelSelectionButton.js';
import ScoreDisplayStars from '../../../../vegas/js/ScoreDisplayStars.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import EESharedConstants from '../../common/EESharedConstants.js';
import expressionExchange from '../../expressionExchange.js';
import EEGameModel from '../model/EEGameModel.js';
const chooseYourLevelString = VegasStrings.chooseYourLevel;
class LevelSelectionNode extends Node {
  /**
   * @param {Function} startLevelFunction - Function used to initiate a game level, will be called with a zero-based
   * index value.
   * @param {Function} resetFunction - Function to reset game and scores.
   * @param {Array.<Node>} iconNodes - Set of iconNodes to use on the buttons, sizes should be the same, length of array
   * must match number of levels.
   * @param {Array.<Property.<number>>} scores - Current scores, used to decide which stars to illuminate on the level
   * start buttons, length must match number of levels.
   * @param {Object} [options] - See code below for options and default values.
   */
  constructor(startLevelFunction, resetFunction, iconNodes, scores, options) {
    super();
    options = merge({
      // defaults
      numLevels: EEGameModel.NUMBER_OF_LEVELS,
      titleString: chooseYourLevelString,
      maxTitleWidth: 500,
      numStarsOnButtons: EEGameModel.CHALLENGES_PER_LEVEL,
      perfectScore: EEGameModel.MAX_SCORE_PER_LEVEL,
      buttonBackgroundColor: '#EDA891',
      numButtonRows: 2,
      controlsInset: 10,
      layoutBoundsProperty: new Property(EESharedConstants.LAYOUT_BOUNDS),
      buttonScale: 0.8
    }, options);

    // Verify parameters
    assert && assert(iconNodes.length === options.numLevels && scores.length === options.numLevels, 'Number of game levels doesn\'t match length of provided arrays');

    // title
    const title = new Text(options.titleString, {
      font: new PhetFont(30),
      maxWidth: options.maxTitleWidth
    });
    this.addChild(title);

    // add the buttons
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
          perfectScore: options.perfectScore,
          scale: options.buttonScale
        }),
        soundPlayerIndex: i
      });
      this.addChild(buttons[i]);
    }

    // Reset button.
    const resetButton = new ResetAllButton({
      listener: resetFunction,
      radius: EESharedConstants.RESET_ALL_BUTTON_RADIUS
    });
    this.addChild(resetButton);

    // Layout
    const numColumns = options.numLevels / options.numButtonRows;
    const buttonSpacingX = buttons[0].width * 1.2; // Note: Assumes all buttons are the same size.
    const buttonSpacingY = buttons[0].height * 1.2; // Note: Assumes all buttons are the same size.
    const initialLayoutBounds = options.layoutBoundsProperty.get();
    const firstButtonOrigin = new Vector2(initialLayoutBounds.width / 2 - (numColumns - 1) * buttonSpacingX / 2, initialLayoutBounds.height * 0.5 - (options.numButtonRows - 1) * buttonSpacingY / 2);
    for (let row = 0; row < options.numButtonRows; row++) {
      for (let col = 0; col < numColumns; col++) {
        const buttonIndex = row * numColumns + col;
        buttons[buttonIndex].centerX = firstButtonOrigin.x + col * buttonSpacingX;
        buttons[buttonIndex].centerY = firstButtonOrigin.y + row * buttonSpacingY;
      }
    }
    title.centerX = initialLayoutBounds.width / 2;
    title.centerY = buttons[0].top / 2;
    resetButton.bottom = initialLayoutBounds.height - options.controlsInset;

    // have the reset button have a floating X position
    options.layoutBoundsProperty.link(layoutBounds => {
      resetButton.right = layoutBounds.maxX - options.controlsInset;
    });
  }
}
expressionExchange.register('LevelSelectionNode', LevelSelectionNode);
export default LevelSelectionNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJtZXJnZSIsIlJlc2V0QWxsQnV0dG9uIiwiUGhldEZvbnQiLCJOb2RlIiwiVGV4dCIsIkxldmVsU2VsZWN0aW9uQnV0dG9uIiwiU2NvcmVEaXNwbGF5U3RhcnMiLCJWZWdhc1N0cmluZ3MiLCJFRVNoYXJlZENvbnN0YW50cyIsImV4cHJlc3Npb25FeGNoYW5nZSIsIkVFR2FtZU1vZGVsIiwiY2hvb3NlWW91ckxldmVsU3RyaW5nIiwiY2hvb3NlWW91ckxldmVsIiwiTGV2ZWxTZWxlY3Rpb25Ob2RlIiwiY29uc3RydWN0b3IiLCJzdGFydExldmVsRnVuY3Rpb24iLCJyZXNldEZ1bmN0aW9uIiwiaWNvbk5vZGVzIiwic2NvcmVzIiwib3B0aW9ucyIsIm51bUxldmVscyIsIk5VTUJFUl9PRl9MRVZFTFMiLCJ0aXRsZVN0cmluZyIsIm1heFRpdGxlV2lkdGgiLCJudW1TdGFyc09uQnV0dG9ucyIsIkNIQUxMRU5HRVNfUEVSX0xFVkVMIiwicGVyZmVjdFNjb3JlIiwiTUFYX1NDT1JFX1BFUl9MRVZFTCIsImJ1dHRvbkJhY2tncm91bmRDb2xvciIsIm51bUJ1dHRvblJvd3MiLCJjb250cm9sc0luc2V0IiwibGF5b3V0Qm91bmRzUHJvcGVydHkiLCJMQVlPVVRfQk9VTkRTIiwiYnV0dG9uU2NhbGUiLCJhc3NlcnQiLCJsZW5ndGgiLCJ0aXRsZSIsImZvbnQiLCJtYXhXaWR0aCIsImFkZENoaWxkIiwiY3JlYXRlTGV2ZWxTdGFydEZ1bmN0aW9uIiwibGV2ZWwiLCJidXR0b25zIiwiQXJyYXkiLCJpIiwibGlzdGVuZXIiLCJiYXNlQ29sb3IiLCJjcmVhdGVTY29yZURpc3BsYXkiLCJzY29yZVByb3BlcnR5IiwibnVtYmVyT2ZTdGFycyIsInNjYWxlIiwic291bmRQbGF5ZXJJbmRleCIsInJlc2V0QnV0dG9uIiwicmFkaXVzIiwiUkVTRVRfQUxMX0JVVFRPTl9SQURJVVMiLCJudW1Db2x1bW5zIiwiYnV0dG9uU3BhY2luZ1giLCJ3aWR0aCIsImJ1dHRvblNwYWNpbmdZIiwiaGVpZ2h0IiwiaW5pdGlhbExheW91dEJvdW5kcyIsImdldCIsImZpcnN0QnV0dG9uT3JpZ2luIiwicm93IiwiY29sIiwiYnV0dG9uSW5kZXgiLCJjZW50ZXJYIiwieCIsImNlbnRlclkiLCJ5IiwidG9wIiwiYm90dG9tIiwibGluayIsImxheW91dEJvdW5kcyIsInJpZ2h0IiwibWF4WCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGV2ZWxTZWxlY3Rpb25Ob2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbm9kZSB0aGF0IGZpbGxzIG1vc3Qgb2YgdGhlIHNjcmVlbiBhbmQgYWxsb3dzIHRoZSB1c2VyIHRvIHNlbGVjdCB0aGUgZ2FtZSBsZXZlbCB0aGF0IHRoZXkgd2lzaCB0byBwbGF5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBMZXZlbFNlbGVjdGlvbkJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9MZXZlbFNlbGVjdGlvbkJ1dHRvbi5qcyc7XHJcbmltcG9ydCBTY29yZURpc3BsYXlTdGFycyBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9TY29yZURpc3BsYXlTdGFycy5qcyc7XHJcbmltcG9ydCBWZWdhc1N0cmluZ3MgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvVmVnYXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IEVFU2hhcmVkQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9FRVNoYXJlZENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBleHByZXNzaW9uRXhjaGFuZ2UgZnJvbSAnLi4vLi4vZXhwcmVzc2lvbkV4Y2hhbmdlLmpzJztcclxuaW1wb3J0IEVFR2FtZU1vZGVsIGZyb20gJy4uL21vZGVsL0VFR2FtZU1vZGVsLmpzJztcclxuXHJcbmNvbnN0IGNob29zZVlvdXJMZXZlbFN0cmluZyA9IFZlZ2FzU3RyaW5ncy5jaG9vc2VZb3VyTGV2ZWw7XHJcblxyXG5jbGFzcyBMZXZlbFNlbGVjdGlvbk5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gc3RhcnRMZXZlbEZ1bmN0aW9uIC0gRnVuY3Rpb24gdXNlZCB0byBpbml0aWF0ZSBhIGdhbWUgbGV2ZWwsIHdpbGwgYmUgY2FsbGVkIHdpdGggYSB6ZXJvLWJhc2VkXHJcbiAgICogaW5kZXggdmFsdWUuXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzZXRGdW5jdGlvbiAtIEZ1bmN0aW9uIHRvIHJlc2V0IGdhbWUgYW5kIHNjb3Jlcy5cclxuICAgKiBAcGFyYW0ge0FycmF5LjxOb2RlPn0gaWNvbk5vZGVzIC0gU2V0IG9mIGljb25Ob2RlcyB0byB1c2Ugb24gdGhlIGJ1dHRvbnMsIHNpemVzIHNob3VsZCBiZSB0aGUgc2FtZSwgbGVuZ3RoIG9mIGFycmF5XHJcbiAgICogbXVzdCBtYXRjaCBudW1iZXIgb2YgbGV2ZWxzLlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFByb3BlcnR5LjxudW1iZXI+Pn0gc2NvcmVzIC0gQ3VycmVudCBzY29yZXMsIHVzZWQgdG8gZGVjaWRlIHdoaWNoIHN0YXJzIHRvIGlsbHVtaW5hdGUgb24gdGhlIGxldmVsXHJcbiAgICogc3RhcnQgYnV0dG9ucywgbGVuZ3RoIG11c3QgbWF0Y2ggbnVtYmVyIG9mIGxldmVscy5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gU2VlIGNvZGUgYmVsb3cgZm9yIG9wdGlvbnMgYW5kIGRlZmF1bHQgdmFsdWVzLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzdGFydExldmVsRnVuY3Rpb24sIHJlc2V0RnVuY3Rpb24sIGljb25Ob2Rlcywgc2NvcmVzLCBvcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBkZWZhdWx0c1xyXG4gICAgICBudW1MZXZlbHM6IEVFR2FtZU1vZGVsLk5VTUJFUl9PRl9MRVZFTFMsXHJcbiAgICAgIHRpdGxlU3RyaW5nOiBjaG9vc2VZb3VyTGV2ZWxTdHJpbmcsXHJcbiAgICAgIG1heFRpdGxlV2lkdGg6IDUwMCxcclxuICAgICAgbnVtU3RhcnNPbkJ1dHRvbnM6IEVFR2FtZU1vZGVsLkNIQUxMRU5HRVNfUEVSX0xFVkVMLFxyXG4gICAgICBwZXJmZWN0U2NvcmU6IEVFR2FtZU1vZGVsLk1BWF9TQ09SRV9QRVJfTEVWRUwsXHJcbiAgICAgIGJ1dHRvbkJhY2tncm91bmRDb2xvcjogJyNFREE4OTEnLFxyXG4gICAgICBudW1CdXR0b25Sb3dzOiAyLFxyXG4gICAgICBjb250cm9sc0luc2V0OiAxMCxcclxuICAgICAgbGF5b3V0Qm91bmRzUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggRUVTaGFyZWRDb25zdGFudHMuTEFZT1VUX0JPVU5EUyApLFxyXG4gICAgICBidXR0b25TY2FsZTogMC44XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gVmVyaWZ5IHBhcmFtZXRlcnNcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICBpY29uTm9kZXMubGVuZ3RoID09PSBvcHRpb25zLm51bUxldmVscyAmJiBzY29yZXMubGVuZ3RoID09PSBvcHRpb25zLm51bUxldmVscyxcclxuICAgICAgJ051bWJlciBvZiBnYW1lIGxldmVscyBkb2VzblxcJ3QgbWF0Y2ggbGVuZ3RoIG9mIHByb3ZpZGVkIGFycmF5cydcclxuICAgICk7XHJcblxyXG4gICAgLy8gdGl0bGVcclxuICAgIGNvbnN0IHRpdGxlID0gbmV3IFRleHQoIG9wdGlvbnMudGl0bGVTdHJpbmcsIHsgZm9udDogbmV3IFBoZXRGb250KCAzMCApLCBtYXhXaWR0aDogb3B0aW9ucy5tYXhUaXRsZVdpZHRoIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRpdGxlICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBidXR0b25zXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVMZXZlbFN0YXJ0RnVuY3Rpb24oIGxldmVsICkge1xyXG4gICAgICByZXR1cm4gKCkgPT4geyBzdGFydExldmVsRnVuY3Rpb24oIGxldmVsICk7IH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYnV0dG9ucyA9IG5ldyBBcnJheSggb3B0aW9ucy5udW1MZXZlbHMgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG9wdGlvbnMubnVtTGV2ZWxzOyBpKysgKSB7XHJcbiAgICAgIGJ1dHRvbnNbIGkgXSA9IG5ldyBMZXZlbFNlbGVjdGlvbkJ1dHRvbihcclxuICAgICAgICBpY29uTm9kZXNbIGkgXSxcclxuICAgICAgICBzY29yZXNbIGkgXSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBsaXN0ZW5lcjogY3JlYXRlTGV2ZWxTdGFydEZ1bmN0aW9uKCBpICksXHJcbiAgICAgICAgICBiYXNlQ29sb3I6IG9wdGlvbnMuYnV0dG9uQmFja2dyb3VuZENvbG9yLFxyXG4gICAgICAgICAgY3JlYXRlU2NvcmVEaXNwbGF5OiBzY29yZVByb3BlcnR5ID0+IG5ldyBTY29yZURpc3BsYXlTdGFycyggc2NvcmVQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgICBudW1iZXJPZlN0YXJzOiBvcHRpb25zLm51bVN0YXJzT25CdXR0b25zLFxyXG4gICAgICAgICAgICBwZXJmZWN0U2NvcmU6IG9wdGlvbnMucGVyZmVjdFNjb3JlLFxyXG4gICAgICAgICAgICBzY2FsZTogb3B0aW9ucy5idXR0b25TY2FsZVxyXG4gICAgICAgICAgfSApLFxyXG4gICAgICAgICAgc291bmRQbGF5ZXJJbmRleDogaVxyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggYnV0dG9uc1sgaSBdICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVzZXQgYnV0dG9uLlxyXG4gICAgY29uc3QgcmVzZXRCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6IHJlc2V0RnVuY3Rpb24sXHJcbiAgICAgIHJhZGl1czogRUVTaGFyZWRDb25zdGFudHMuUkVTRVRfQUxMX0JVVFRPTl9SQURJVVNcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QnV0dG9uICk7XHJcblxyXG4gICAgLy8gTGF5b3V0XHJcbiAgICBjb25zdCBudW1Db2x1bW5zID0gb3B0aW9ucy5udW1MZXZlbHMgLyBvcHRpb25zLm51bUJ1dHRvblJvd3M7XHJcbiAgICBjb25zdCBidXR0b25TcGFjaW5nWCA9IGJ1dHRvbnNbIDAgXS53aWR0aCAqIDEuMjsgLy8gTm90ZTogQXNzdW1lcyBhbGwgYnV0dG9ucyBhcmUgdGhlIHNhbWUgc2l6ZS5cclxuICAgIGNvbnN0IGJ1dHRvblNwYWNpbmdZID0gYnV0dG9uc1sgMCBdLmhlaWdodCAqIDEuMjsgIC8vIE5vdGU6IEFzc3VtZXMgYWxsIGJ1dHRvbnMgYXJlIHRoZSBzYW1lIHNpemUuXHJcbiAgICBjb25zdCBpbml0aWFsTGF5b3V0Qm91bmRzID0gb3B0aW9ucy5sYXlvdXRCb3VuZHNQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IGZpcnN0QnV0dG9uT3JpZ2luID0gbmV3IFZlY3RvcjIoIGluaXRpYWxMYXlvdXRCb3VuZHMud2lkdGggLyAyIC0gKCBudW1Db2x1bW5zIC0gMSApICogYnV0dG9uU3BhY2luZ1ggLyAyLFxyXG4gICAgICBpbml0aWFsTGF5b3V0Qm91bmRzLmhlaWdodCAqIDAuNSAtICggKCBvcHRpb25zLm51bUJ1dHRvblJvd3MgLSAxICkgKiBidXR0b25TcGFjaW5nWSApIC8gMiApO1xyXG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IG9wdGlvbnMubnVtQnV0dG9uUm93czsgcm93KysgKSB7XHJcbiAgICAgIGZvciAoIGxldCBjb2wgPSAwOyBjb2wgPCBudW1Db2x1bW5zOyBjb2wrKyApIHtcclxuICAgICAgICBjb25zdCBidXR0b25JbmRleCA9IHJvdyAqIG51bUNvbHVtbnMgKyBjb2w7XHJcbiAgICAgICAgYnV0dG9uc1sgYnV0dG9uSW5kZXggXS5jZW50ZXJYID0gZmlyc3RCdXR0b25PcmlnaW4ueCArIGNvbCAqIGJ1dHRvblNwYWNpbmdYO1xyXG4gICAgICAgIGJ1dHRvbnNbIGJ1dHRvbkluZGV4IF0uY2VudGVyWSA9IGZpcnN0QnV0dG9uT3JpZ2luLnkgKyByb3cgKiBidXR0b25TcGFjaW5nWTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGl0bGUuY2VudGVyWCA9IGluaXRpYWxMYXlvdXRCb3VuZHMud2lkdGggLyAyO1xyXG4gICAgdGl0bGUuY2VudGVyWSA9IGJ1dHRvbnNbIDAgXS50b3AgLyAyO1xyXG5cclxuICAgIHJlc2V0QnV0dG9uLmJvdHRvbSA9IGluaXRpYWxMYXlvdXRCb3VuZHMuaGVpZ2h0IC0gb3B0aW9ucy5jb250cm9sc0luc2V0O1xyXG5cclxuICAgIC8vIGhhdmUgdGhlIHJlc2V0IGJ1dHRvbiBoYXZlIGEgZmxvYXRpbmcgWCBwb3NpdGlvblxyXG4gICAgb3B0aW9ucy5sYXlvdXRCb3VuZHNQcm9wZXJ0eS5saW5rKCBsYXlvdXRCb3VuZHMgPT4ge1xyXG4gICAgICByZXNldEJ1dHRvbi5yaWdodCA9IGxheW91dEJvdW5kcy5tYXhYIC0gb3B0aW9ucy5jb250cm9sc0luc2V0O1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZXhwcmVzc2lvbkV4Y2hhbmdlLnJlZ2lzdGVyKCAnTGV2ZWxTZWxlY3Rpb25Ob2RlJywgTGV2ZWxTZWxlY3Rpb25Ob2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBMZXZlbFNlbGVjdGlvbk5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLGNBQWMsTUFBTSx1REFBdUQ7QUFDbEYsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDOUQsT0FBT0Msb0JBQW9CLE1BQU0sOENBQThDO0FBQy9FLE9BQU9DLGlCQUFpQixNQUFNLDJDQUEyQztBQUN6RSxPQUFPQyxZQUFZLE1BQU0sc0NBQXNDO0FBQy9ELE9BQU9DLGlCQUFpQixNQUFNLG1DQUFtQztBQUNqRSxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsV0FBVyxNQUFNLHlCQUF5QjtBQUVqRCxNQUFNQyxxQkFBcUIsR0FBR0osWUFBWSxDQUFDSyxlQUFlO0FBRTFELE1BQU1DLGtCQUFrQixTQUFTVixJQUFJLENBQUM7RUFFcEM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVcsV0FBV0EsQ0FBRUMsa0JBQWtCLEVBQUVDLGFBQWEsRUFBRUMsU0FBUyxFQUFFQyxNQUFNLEVBQUVDLE9BQU8sRUFBRztJQUUzRSxLQUFLLENBQUMsQ0FBQztJQUVQQSxPQUFPLEdBQUduQixLQUFLLENB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