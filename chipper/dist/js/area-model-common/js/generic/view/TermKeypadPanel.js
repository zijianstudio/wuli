// Copyright 2017-2023, University of Colorado Boulder

/**
 * Keypad to edit generic terms.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Key from '../../../../scenery-phet/js/keypad/Key.js';
import KeyID from '../../../../scenery-phet/js/keypad/KeyID.js';
import Keypad from '../../../../scenery-phet/js/keypad/Keypad.js';
import { Node, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Panel from '../../../../sun/js/Panel.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import Term from '../../common/model/Term.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
import TermAccumulator from './TermAccumulator.js';
const enterString = AreaModelCommonStrings.enter;

// layout constants
const positiveKeys = [[Keypad.KEY_7, Keypad.KEY_8, Keypad.KEY_9], [Keypad.KEY_4, Keypad.KEY_5, Keypad.KEY_6], [Keypad.KEY_1, Keypad.KEY_2, Keypad.KEY_3]];
const zeroAndBackspace = [Keypad.KEY_0, Keypad.KEY_BACKSPACE];
const noExponentLayout = positiveKeys.concat([[Keypad.PLUS_MINUS].concat(zeroAndBackspace)]);
const noNegativeLayout = positiveKeys.concat([[null].concat(zeroAndBackspace)]);
const exponentLayout = noExponentLayout.concat([[null, new Key(new RichText(`${AreaModelCommonConstants.X_VARIABLE_RICH_STRING}<sup>2</sup>`, {
  font: AreaModelCommonConstants.KEYPAD_FONT
}), KeyID.X_SQUARED), new Key(new RichText(AreaModelCommonConstants.X_VARIABLE_RICH_STRING, {
  font: AreaModelCommonConstants.KEYPAD_FONT
}), KeyID.X)]]);
class TermKeypadPanel extends Panel {
  /**
   * @param {Property.<number>} digitCountProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @param {boolean} allowNegative
   * @param {function} enterCallback - function( {Term|null} ) - The entered term, or null if there is no valid term entered.
   * @param {Object} [nodeOptions]
   */
  constructor(digitCountProperty, allowExponents, allowNegative, enterCallback, nodeOptions) {
    assert && assert(allowNegative || !allowExponents, 'We have no non-negative exponent keyboard layout');

    // Handles logic for key-presses and conversion to strings/Terms.
    const termAccumulator = new TermAccumulator(digitCountProperty);
    const keypad = new Keypad(allowExponents ? exponentLayout : allowNegative ? noExponentLayout : noNegativeLayout, {
      accumulator: termAccumulator
    });
    const readoutBackground = new Rectangle({
      fill: AreaModelCommonColors.keypadReadoutBackgroundProperty,
      stroke: AreaModelCommonColors.keypadReadoutBorderProperty,
      cornerRadius: AreaModelCommonConstants.PANEL_CORNER_RADIUS
    });
    const readoutTextOptions = {
      font: AreaModelCommonConstants.KEYPAD_READOUT_FONT
    };
    const readoutText = new RichText('', readoutTextOptions);
    function updateText(string) {
      // Trick to be able to position an empty string
      readoutText.visible = string.length > 0;
      if (readoutText.visible) {
        readoutText.string = string;
        readoutText.centerX = readoutBackground.centerX;
      }
    }

    // Update the text when the accumulator's string output changes
    termAccumulator.richStringProperty.link(updateText);

    // When the active partition changes, resize the background to fit to the largest size.
    digitCountProperty.link(digitCount => {
      // Temporarily use a different string
      readoutText.string = Term.getLargestGenericString(allowExponents, digitCount);

      // Update the background
      readoutBackground.setRectBounds(readoutText.bounds.dilatedXY(10, 1));

      // Reposition our text
      readoutText.center = readoutBackground.center;

      // Reset the text value back to what it should be.
      updateText(termAccumulator.richStringProperty.value);
    });
    super(new VBox({
      children: [new Node({
        // We position the text over the background manually
        children: [readoutBackground, readoutText]
      }), keypad, new RectangularPushButton({
        content: new Text(enterString, {
          font: AreaModelCommonConstants.KEYPAD_FONT,
          maxWidth: 100
        }),
        touchAreaXDilation: 5,
        touchAreaYDilation: 5,
        xMargin: 15,
        yMargin: 5,
        listener: () => {
          enterCallback(termAccumulator.termProperty.value);
        },
        baseColor: AreaModelCommonColors.keypadEnterBackgroundProperty
      })],
      spacing: 10
    }), {
      cornerRadius: AreaModelCommonConstants.PANEL_CORNER_RADIUS,
      xMargin: 15,
      yMargin: 15,
      fill: AreaModelCommonColors.keypadPanelBackgroundProperty,
      stroke: AreaModelCommonColors.keypadPanelBorderProperty
    });
    this.mutate(nodeOptions);

    // @private
    this.keypad = keypad;
  }

  /**
   * Clears the keypad's content.
   * @public
   */
  clear() {
    this.keypad.clear();
  }
}
areaModelCommon.register('TermKeypadPanel', TermKeypadPanel);
export default TermKeypadPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLZXkiLCJLZXlJRCIsIktleXBhZCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJSaWNoVGV4dCIsIlRleHQiLCJWQm94IiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiUGFuZWwiLCJhcmVhTW9kZWxDb21tb24iLCJBcmVhTW9kZWxDb21tb25TdHJpbmdzIiwiQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzIiwiVGVybSIsIkFyZWFNb2RlbENvbW1vbkNvbG9ycyIsIlRlcm1BY2N1bXVsYXRvciIsImVudGVyU3RyaW5nIiwiZW50ZXIiLCJwb3NpdGl2ZUtleXMiLCJLRVlfNyIsIktFWV84IiwiS0VZXzkiLCJLRVlfNCIsIktFWV81IiwiS0VZXzYiLCJLRVlfMSIsIktFWV8yIiwiS0VZXzMiLCJ6ZXJvQW5kQmFja3NwYWNlIiwiS0VZXzAiLCJLRVlfQkFDS1NQQUNFIiwibm9FeHBvbmVudExheW91dCIsImNvbmNhdCIsIlBMVVNfTUlOVVMiLCJub05lZ2F0aXZlTGF5b3V0IiwiZXhwb25lbnRMYXlvdXQiLCJYX1ZBUklBQkxFX1JJQ0hfU1RSSU5HIiwiZm9udCIsIktFWVBBRF9GT05UIiwiWF9TUVVBUkVEIiwiWCIsIlRlcm1LZXlwYWRQYW5lbCIsImNvbnN0cnVjdG9yIiwiZGlnaXRDb3VudFByb3BlcnR5IiwiYWxsb3dFeHBvbmVudHMiLCJhbGxvd05lZ2F0aXZlIiwiZW50ZXJDYWxsYmFjayIsIm5vZGVPcHRpb25zIiwiYXNzZXJ0IiwidGVybUFjY3VtdWxhdG9yIiwia2V5cGFkIiwiYWNjdW11bGF0b3IiLCJyZWFkb3V0QmFja2dyb3VuZCIsImZpbGwiLCJrZXlwYWRSZWFkb3V0QmFja2dyb3VuZFByb3BlcnR5Iiwic3Ryb2tlIiwia2V5cGFkUmVhZG91dEJvcmRlclByb3BlcnR5IiwiY29ybmVyUmFkaXVzIiwiUEFORUxfQ09STkVSX1JBRElVUyIsInJlYWRvdXRUZXh0T3B0aW9ucyIsIktFWVBBRF9SRUFET1VUX0ZPTlQiLCJyZWFkb3V0VGV4dCIsInVwZGF0ZVRleHQiLCJzdHJpbmciLCJ2aXNpYmxlIiwibGVuZ3RoIiwiY2VudGVyWCIsInJpY2hTdHJpbmdQcm9wZXJ0eSIsImxpbmsiLCJkaWdpdENvdW50IiwiZ2V0TGFyZ2VzdEdlbmVyaWNTdHJpbmciLCJzZXRSZWN0Qm91bmRzIiwiYm91bmRzIiwiZGlsYXRlZFhZIiwiY2VudGVyIiwidmFsdWUiLCJjaGlsZHJlbiIsImNvbnRlbnQiLCJtYXhXaWR0aCIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsInhNYXJnaW4iLCJ5TWFyZ2luIiwibGlzdGVuZXIiLCJ0ZXJtUHJvcGVydHkiLCJiYXNlQ29sb3IiLCJrZXlwYWRFbnRlckJhY2tncm91bmRQcm9wZXJ0eSIsInNwYWNpbmciLCJrZXlwYWRQYW5lbEJhY2tncm91bmRQcm9wZXJ0eSIsImtleXBhZFBhbmVsQm9yZGVyUHJvcGVydHkiLCJtdXRhdGUiLCJjbGVhciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVGVybUtleXBhZFBhbmVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEtleXBhZCB0byBlZGl0IGdlbmVyaWMgdGVybXMuXHJcbiAqXHJcbiAqIE5PVEU6IFRoaXMgdHlwZSBpcyBkZXNpZ25lZCB0byBiZSBwZXJzaXN0ZW50LCBhbmQgd2lsbCBub3QgbmVlZCB0byByZWxlYXNlIHJlZmVyZW5jZXMgdG8gYXZvaWQgbWVtb3J5IGxlYWtzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEtleSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5cGFkL0tleS5qcyc7XHJcbmltcG9ydCBLZXlJRCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5cGFkL0tleUlELmpzJztcclxuaW1wb3J0IEtleXBhZCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5cGFkL0tleXBhZC5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFJlY3RhbmdsZSwgUmljaFRleHQsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgYXJlYU1vZGVsQ29tbW9uIGZyb20gJy4uLy4uL2FyZWFNb2RlbENvbW1vbi5qcyc7XHJcbmltcG9ydCBBcmVhTW9kZWxDb21tb25TdHJpbmdzIGZyb20gJy4uLy4uL0FyZWFNb2RlbENvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9BcmVhTW9kZWxDb21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgVGVybSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvVGVybS5qcyc7XHJcbmltcG9ydCBBcmVhTW9kZWxDb21tb25Db2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQXJlYU1vZGVsQ29tbW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IFRlcm1BY2N1bXVsYXRvciBmcm9tICcuL1Rlcm1BY2N1bXVsYXRvci5qcyc7XHJcblxyXG5jb25zdCBlbnRlclN0cmluZyA9IEFyZWFNb2RlbENvbW1vblN0cmluZ3MuZW50ZXI7XHJcblxyXG4vLyBsYXlvdXQgY29uc3RhbnRzXHJcbmNvbnN0IHBvc2l0aXZlS2V5cyA9IFtcclxuICBbIEtleXBhZC5LRVlfNywgS2V5cGFkLktFWV84LCBLZXlwYWQuS0VZXzkgXSxcclxuICBbIEtleXBhZC5LRVlfNCwgS2V5cGFkLktFWV81LCBLZXlwYWQuS0VZXzYgXSxcclxuICBbIEtleXBhZC5LRVlfMSwgS2V5cGFkLktFWV8yLCBLZXlwYWQuS0VZXzMgXVxyXG5dO1xyXG5jb25zdCB6ZXJvQW5kQmFja3NwYWNlID0gW1xyXG4gIEtleXBhZC5LRVlfMCwgS2V5cGFkLktFWV9CQUNLU1BBQ0VcclxuXTtcclxuY29uc3Qgbm9FeHBvbmVudExheW91dCA9IHBvc2l0aXZlS2V5cy5jb25jYXQoIFtcclxuICBbIEtleXBhZC5QTFVTX01JTlVTIF0uY29uY2F0KCB6ZXJvQW5kQmFja3NwYWNlIClcclxuXSApO1xyXG5jb25zdCBub05lZ2F0aXZlTGF5b3V0ID0gcG9zaXRpdmVLZXlzLmNvbmNhdCggW1xyXG4gIFsgbnVsbCBdLmNvbmNhdCggemVyb0FuZEJhY2tzcGFjZSApXHJcbl0gKTtcclxuY29uc3QgZXhwb25lbnRMYXlvdXQgPSBub0V4cG9uZW50TGF5b3V0LmNvbmNhdCggW1xyXG4gIFtcclxuICAgIG51bGwsXHJcbiAgICBuZXcgS2V5KCBuZXcgUmljaFRleHQoIGAke0FyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5YX1ZBUklBQkxFX1JJQ0hfU1RSSU5HfTxzdXA+Mjwvc3VwPmAsIHsgZm9udDogQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLktFWVBBRF9GT05UIH0gKSwgS2V5SUQuWF9TUVVBUkVEICksXHJcbiAgICBuZXcgS2V5KCBuZXcgUmljaFRleHQoIEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5YX1ZBUklBQkxFX1JJQ0hfU1RSSU5HLCB7IGZvbnQ6IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5LRVlQQURfRk9OVCB9ICksIEtleUlELlggKVxyXG4gIF1cclxuXSApO1xyXG5cclxuY2xhc3MgVGVybUtleXBhZFBhbmVsIGV4dGVuZHMgUGFuZWwge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IGRpZ2l0Q291bnRQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWxsb3dFeHBvbmVudHMgLSBXaGV0aGVyIGV4cG9uZW50cyAocG93ZXJzIG9mIHgpIGFyZSBhbGxvd2VkXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBhbGxvd05lZ2F0aXZlXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gZW50ZXJDYWxsYmFjayAtIGZ1bmN0aW9uKCB7VGVybXxudWxsfSApIC0gVGhlIGVudGVyZWQgdGVybSwgb3IgbnVsbCBpZiB0aGVyZSBpcyBubyB2YWxpZCB0ZXJtIGVudGVyZWQuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtub2RlT3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZGlnaXRDb3VudFByb3BlcnR5LCBhbGxvd0V4cG9uZW50cywgYWxsb3dOZWdhdGl2ZSwgZW50ZXJDYWxsYmFjaywgbm9kZU9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhbGxvd05lZ2F0aXZlIHx8ICFhbGxvd0V4cG9uZW50cywgJ1dlIGhhdmUgbm8gbm9uLW5lZ2F0aXZlIGV4cG9uZW50IGtleWJvYXJkIGxheW91dCcgKTtcclxuXHJcbiAgICAvLyBIYW5kbGVzIGxvZ2ljIGZvciBrZXktcHJlc3NlcyBhbmQgY29udmVyc2lvbiB0byBzdHJpbmdzL1Rlcm1zLlxyXG4gICAgY29uc3QgdGVybUFjY3VtdWxhdG9yID0gbmV3IFRlcm1BY2N1bXVsYXRvciggZGlnaXRDb3VudFByb3BlcnR5ICk7XHJcblxyXG4gICAgY29uc3Qga2V5cGFkID0gbmV3IEtleXBhZCggYWxsb3dFeHBvbmVudHMgPyBleHBvbmVudExheW91dCA6ICggYWxsb3dOZWdhdGl2ZSA/IG5vRXhwb25lbnRMYXlvdXQgOiBub05lZ2F0aXZlTGF5b3V0ICksIHtcclxuICAgICAgYWNjdW11bGF0b3I6IHRlcm1BY2N1bXVsYXRvclxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHJlYWRvdXRCYWNrZ3JvdW5kID0gbmV3IFJlY3RhbmdsZSgge1xyXG4gICAgICBmaWxsOiBBcmVhTW9kZWxDb21tb25Db2xvcnMua2V5cGFkUmVhZG91dEJhY2tncm91bmRQcm9wZXJ0eSxcclxuICAgICAgc3Ryb2tlOiBBcmVhTW9kZWxDb21tb25Db2xvcnMua2V5cGFkUmVhZG91dEJvcmRlclByb3BlcnR5LFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5QQU5FTF9DT1JORVJfUkFESVVTXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcmVhZG91dFRleHRPcHRpb25zID0ge1xyXG4gICAgICBmb250OiBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuS0VZUEFEX1JFQURPVVRfRk9OVFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCByZWFkb3V0VGV4dCA9IG5ldyBSaWNoVGV4dCggJycsIHJlYWRvdXRUZXh0T3B0aW9ucyApO1xyXG5cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZVRleHQoIHN0cmluZyApIHtcclxuICAgICAgLy8gVHJpY2sgdG8gYmUgYWJsZSB0byBwb3NpdGlvbiBhbiBlbXB0eSBzdHJpbmdcclxuICAgICAgcmVhZG91dFRleHQudmlzaWJsZSA9IHN0cmluZy5sZW5ndGggPiAwO1xyXG4gICAgICBpZiAoIHJlYWRvdXRUZXh0LnZpc2libGUgKSB7XHJcbiAgICAgICAgcmVhZG91dFRleHQuc3RyaW5nID0gc3RyaW5nO1xyXG4gICAgICAgIHJlYWRvdXRUZXh0LmNlbnRlclggPSByZWFkb3V0QmFja2dyb3VuZC5jZW50ZXJYO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSB0ZXh0IHdoZW4gdGhlIGFjY3VtdWxhdG9yJ3Mgc3RyaW5nIG91dHB1dCBjaGFuZ2VzXHJcbiAgICB0ZXJtQWNjdW11bGF0b3IucmljaFN0cmluZ1Byb3BlcnR5LmxpbmsoIHVwZGF0ZVRleHQgKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBhY3RpdmUgcGFydGl0aW9uIGNoYW5nZXMsIHJlc2l6ZSB0aGUgYmFja2dyb3VuZCB0byBmaXQgdG8gdGhlIGxhcmdlc3Qgc2l6ZS5cclxuICAgIGRpZ2l0Q291bnRQcm9wZXJ0eS5saW5rKCBkaWdpdENvdW50ID0+IHtcclxuICAgICAgLy8gVGVtcG9yYXJpbHkgdXNlIGEgZGlmZmVyZW50IHN0cmluZ1xyXG4gICAgICByZWFkb3V0VGV4dC5zdHJpbmcgPSBUZXJtLmdldExhcmdlc3RHZW5lcmljU3RyaW5nKCBhbGxvd0V4cG9uZW50cywgZGlnaXRDb3VudCApO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIHRoZSBiYWNrZ3JvdW5kXHJcbiAgICAgIHJlYWRvdXRCYWNrZ3JvdW5kLnNldFJlY3RCb3VuZHMoIHJlYWRvdXRUZXh0LmJvdW5kcy5kaWxhdGVkWFkoIDEwLCAxICkgKTtcclxuXHJcbiAgICAgIC8vIFJlcG9zaXRpb24gb3VyIHRleHRcclxuICAgICAgcmVhZG91dFRleHQuY2VudGVyID0gcmVhZG91dEJhY2tncm91bmQuY2VudGVyO1xyXG5cclxuICAgICAgLy8gUmVzZXQgdGhlIHRleHQgdmFsdWUgYmFjayB0byB3aGF0IGl0IHNob3VsZCBiZS5cclxuICAgICAgdXBkYXRlVGV4dCggdGVybUFjY3VtdWxhdG9yLnJpY2hTdHJpbmdQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBuZXcgVkJveCgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBOb2RlKCB7XHJcbiAgICAgICAgICAvLyBXZSBwb3NpdGlvbiB0aGUgdGV4dCBvdmVyIHRoZSBiYWNrZ3JvdW5kIG1hbnVhbGx5XHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICByZWFkb3V0QmFja2dyb3VuZCxcclxuICAgICAgICAgICAgcmVhZG91dFRleHRcclxuICAgICAgICAgIF1cclxuICAgICAgICB9ICksXHJcbiAgICAgICAga2V5cGFkLFxyXG4gICAgICAgIG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgICAgICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCBlbnRlclN0cmluZywge1xyXG4gICAgICAgICAgICBmb250OiBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuS0VZUEFEX0ZPTlQsXHJcbiAgICAgICAgICAgIG1heFdpZHRoOiAxMDBcclxuICAgICAgICAgIH0gKSxcclxuICAgICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogNSxcclxuICAgICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogNSxcclxuICAgICAgICAgIHhNYXJnaW46IDE1LFxyXG4gICAgICAgICAgeU1hcmdpbjogNSxcclxuICAgICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgICAgIGVudGVyQ2FsbGJhY2soIHRlcm1BY2N1bXVsYXRvci50ZXJtUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBiYXNlQ29sb3I6IEFyZWFNb2RlbENvbW1vbkNvbG9ycy5rZXlwYWRFbnRlckJhY2tncm91bmRQcm9wZXJ0eVxyXG4gICAgICAgIH0gKVxyXG4gICAgICBdLFxyXG4gICAgICBzcGFjaW5nOiAxMFxyXG4gICAgfSApLCB7XHJcbiAgICAgIGNvcm5lclJhZGl1czogQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLlBBTkVMX0NPUk5FUl9SQURJVVMsXHJcbiAgICAgIHhNYXJnaW46IDE1LFxyXG4gICAgICB5TWFyZ2luOiAxNSxcclxuICAgICAgZmlsbDogQXJlYU1vZGVsQ29tbW9uQ29sb3JzLmtleXBhZFBhbmVsQmFja2dyb3VuZFByb3BlcnR5LFxyXG4gICAgICBzdHJva2U6IEFyZWFNb2RlbENvbW1vbkNvbG9ycy5rZXlwYWRQYW5lbEJvcmRlclByb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG5vZGVPcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMua2V5cGFkID0ga2V5cGFkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXJzIHRoZSBrZXlwYWQncyBjb250ZW50LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjbGVhcigpIHtcclxuICAgIHRoaXMua2V5cGFkLmNsZWFyKCk7XHJcbiAgfVxyXG59XHJcblxyXG5hcmVhTW9kZWxDb21tb24ucmVnaXN0ZXIoICdUZXJtS2V5cGFkUGFuZWwnLCBUZXJtS2V5cGFkUGFuZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgVGVybUtleXBhZFBhbmVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsR0FBRyxNQUFNLDJDQUEyQztBQUMzRCxPQUFPQyxLQUFLLE1BQU0sNkNBQTZDO0FBQy9ELE9BQU9DLE1BQU0sTUFBTSw4Q0FBOEM7QUFDakUsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFFBQVEsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3pGLE9BQU9DLHFCQUFxQixNQUFNLHFEQUFxRDtBQUN2RixPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0Msc0JBQXNCLE1BQU0saUNBQWlDO0FBQ3BFLE9BQU9DLHdCQUF3QixNQUFNLDBDQUEwQztBQUMvRSxPQUFPQyxJQUFJLE1BQU0sNEJBQTRCO0FBQzdDLE9BQU9DLHFCQUFxQixNQUFNLDRDQUE0QztBQUM5RSxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBRWxELE1BQU1DLFdBQVcsR0FBR0wsc0JBQXNCLENBQUNNLEtBQUs7O0FBRWhEO0FBQ0EsTUFBTUMsWUFBWSxHQUFHLENBQ25CLENBQUVoQixNQUFNLENBQUNpQixLQUFLLEVBQUVqQixNQUFNLENBQUNrQixLQUFLLEVBQUVsQixNQUFNLENBQUNtQixLQUFLLENBQUUsRUFDNUMsQ0FBRW5CLE1BQU0sQ0FBQ29CLEtBQUssRUFBRXBCLE1BQU0sQ0FBQ3FCLEtBQUssRUFBRXJCLE1BQU0sQ0FBQ3NCLEtBQUssQ0FBRSxFQUM1QyxDQUFFdEIsTUFBTSxDQUFDdUIsS0FBSyxFQUFFdkIsTUFBTSxDQUFDd0IsS0FBSyxFQUFFeEIsTUFBTSxDQUFDeUIsS0FBSyxDQUFFLENBQzdDO0FBQ0QsTUFBTUMsZ0JBQWdCLEdBQUcsQ0FDdkIxQixNQUFNLENBQUMyQixLQUFLLEVBQUUzQixNQUFNLENBQUM0QixhQUFhLENBQ25DO0FBQ0QsTUFBTUMsZ0JBQWdCLEdBQUdiLFlBQVksQ0FBQ2MsTUFBTSxDQUFFLENBQzVDLENBQUU5QixNQUFNLENBQUMrQixVQUFVLENBQUUsQ0FBQ0QsTUFBTSxDQUFFSixnQkFBaUIsQ0FBQyxDQUNoRCxDQUFDO0FBQ0gsTUFBTU0sZ0JBQWdCLEdBQUdoQixZQUFZLENBQUNjLE1BQU0sQ0FBRSxDQUM1QyxDQUFFLElBQUksQ0FBRSxDQUFDQSxNQUFNLENBQUVKLGdCQUFpQixDQUFDLENBQ25DLENBQUM7QUFDSCxNQUFNTyxjQUFjLEdBQUdKLGdCQUFnQixDQUFDQyxNQUFNLENBQUUsQ0FDOUMsQ0FDRSxJQUFJLEVBQ0osSUFBSWhDLEdBQUcsQ0FBRSxJQUFJSyxRQUFRLENBQUcsR0FBRU8sd0JBQXdCLENBQUN3QixzQkFBdUIsY0FBYSxFQUFFO0VBQUVDLElBQUksRUFBRXpCLHdCQUF3QixDQUFDMEI7QUFBWSxDQUFFLENBQUMsRUFBRXJDLEtBQUssQ0FBQ3NDLFNBQVUsQ0FBQyxFQUM1SixJQUFJdkMsR0FBRyxDQUFFLElBQUlLLFFBQVEsQ0FBRU8sd0JBQXdCLENBQUN3QixzQkFBc0IsRUFBRTtFQUFFQyxJQUFJLEVBQUV6Qix3QkFBd0IsQ0FBQzBCO0FBQVksQ0FBRSxDQUFDLEVBQUVyQyxLQUFLLENBQUN1QyxDQUFFLENBQUMsQ0FDcEksQ0FDRCxDQUFDO0FBRUgsTUFBTUMsZUFBZSxTQUFTaEMsS0FBSyxDQUFDO0VBQ2xDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VpQyxXQUFXQSxDQUFFQyxrQkFBa0IsRUFBRUMsY0FBYyxFQUFFQyxhQUFhLEVBQUVDLGFBQWEsRUFBRUMsV0FBVyxFQUFHO0lBQzNGQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUgsYUFBYSxJQUFJLENBQUNELGNBQWMsRUFBRSxrREFBbUQsQ0FBQzs7SUFFeEc7SUFDQSxNQUFNSyxlQUFlLEdBQUcsSUFBSWxDLGVBQWUsQ0FBRTRCLGtCQUFtQixDQUFDO0lBRWpFLE1BQU1PLE1BQU0sR0FBRyxJQUFJaEQsTUFBTSxDQUFFMEMsY0FBYyxHQUFHVCxjQUFjLEdBQUtVLGFBQWEsR0FBR2QsZ0JBQWdCLEdBQUdHLGdCQUFrQixFQUFFO01BQ3BIaUIsV0FBVyxFQUFFRjtJQUNmLENBQUUsQ0FBQztJQUVILE1BQU1HLGlCQUFpQixHQUFHLElBQUloRCxTQUFTLENBQUU7TUFDdkNpRCxJQUFJLEVBQUV2QyxxQkFBcUIsQ0FBQ3dDLCtCQUErQjtNQUMzREMsTUFBTSxFQUFFekMscUJBQXFCLENBQUMwQywyQkFBMkI7TUFDekRDLFlBQVksRUFBRTdDLHdCQUF3QixDQUFDOEM7SUFDekMsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsa0JBQWtCLEdBQUc7TUFDekJ0QixJQUFJLEVBQUV6Qix3QkFBd0IsQ0FBQ2dEO0lBQ2pDLENBQUM7SUFFRCxNQUFNQyxXQUFXLEdBQUcsSUFBSXhELFFBQVEsQ0FBRSxFQUFFLEVBQUVzRCxrQkFBbUIsQ0FBQztJQUUxRCxTQUFTRyxVQUFVQSxDQUFFQyxNQUFNLEVBQUc7TUFDNUI7TUFDQUYsV0FBVyxDQUFDRyxPQUFPLEdBQUdELE1BQU0sQ0FBQ0UsTUFBTSxHQUFHLENBQUM7TUFDdkMsSUFBS0osV0FBVyxDQUFDRyxPQUFPLEVBQUc7UUFDekJILFdBQVcsQ0FBQ0UsTUFBTSxHQUFHQSxNQUFNO1FBQzNCRixXQUFXLENBQUNLLE9BQU8sR0FBR2QsaUJBQWlCLENBQUNjLE9BQU87TUFDakQ7SUFDRjs7SUFFQTtJQUNBakIsZUFBZSxDQUFDa0Isa0JBQWtCLENBQUNDLElBQUksQ0FBRU4sVUFBVyxDQUFDOztJQUVyRDtJQUNBbkIsa0JBQWtCLENBQUN5QixJQUFJLENBQUVDLFVBQVUsSUFBSTtNQUNyQztNQUNBUixXQUFXLENBQUNFLE1BQU0sR0FBR2xELElBQUksQ0FBQ3lELHVCQUF1QixDQUFFMUIsY0FBYyxFQUFFeUIsVUFBVyxDQUFDOztNQUUvRTtNQUNBakIsaUJBQWlCLENBQUNtQixhQUFhLENBQUVWLFdBQVcsQ0FBQ1csTUFBTSxDQUFDQyxTQUFTLENBQUUsRUFBRSxFQUFFLENBQUUsQ0FBRSxDQUFDOztNQUV4RTtNQUNBWixXQUFXLENBQUNhLE1BQU0sR0FBR3RCLGlCQUFpQixDQUFDc0IsTUFBTTs7TUFFN0M7TUFDQVosVUFBVSxDQUFFYixlQUFlLENBQUNrQixrQkFBa0IsQ0FBQ1EsS0FBTSxDQUFDO0lBQ3hELENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRSxJQUFJcEUsSUFBSSxDQUFFO01BQ2ZxRSxRQUFRLEVBQUUsQ0FDUixJQUFJekUsSUFBSSxDQUFFO1FBQ1I7UUFDQXlFLFFBQVEsRUFBRSxDQUNSeEIsaUJBQWlCLEVBQ2pCUyxXQUFXO01BRWYsQ0FBRSxDQUFDLEVBQ0hYLE1BQU0sRUFDTixJQUFJMUMscUJBQXFCLENBQUU7UUFDekJxRSxPQUFPLEVBQUUsSUFBSXZFLElBQUksQ0FBRVUsV0FBVyxFQUFFO1VBQzlCcUIsSUFBSSxFQUFFekIsd0JBQXdCLENBQUMwQixXQUFXO1VBQzFDd0MsUUFBUSxFQUFFO1FBQ1osQ0FBRSxDQUFDO1FBQ0hDLGtCQUFrQixFQUFFLENBQUM7UUFDckJDLGtCQUFrQixFQUFFLENBQUM7UUFDckJDLE9BQU8sRUFBRSxFQUFFO1FBQ1hDLE9BQU8sRUFBRSxDQUFDO1FBQ1ZDLFFBQVEsRUFBRUEsQ0FBQSxLQUFNO1VBQ2RyQyxhQUFhLENBQUVHLGVBQWUsQ0FBQ21DLFlBQVksQ0FBQ1QsS0FBTSxDQUFDO1FBQ3JELENBQUM7UUFDRFUsU0FBUyxFQUFFdkUscUJBQXFCLENBQUN3RTtNQUNuQyxDQUFFLENBQUMsQ0FDSjtNQUNEQyxPQUFPLEVBQUU7SUFDWCxDQUFFLENBQUMsRUFBRTtNQUNIOUIsWUFBWSxFQUFFN0Msd0JBQXdCLENBQUM4QyxtQkFBbUI7TUFDMUR1QixPQUFPLEVBQUUsRUFBRTtNQUNYQyxPQUFPLEVBQUUsRUFBRTtNQUNYN0IsSUFBSSxFQUFFdkMscUJBQXFCLENBQUMwRSw2QkFBNkI7TUFDekRqQyxNQUFNLEVBQUV6QyxxQkFBcUIsQ0FBQzJFO0lBQ2hDLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0MsTUFBTSxDQUFFM0MsV0FBWSxDQUFDOztJQUUxQjtJQUNBLElBQUksQ0FBQ0csTUFBTSxHQUFHQSxNQUFNO0VBQ3RCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0V5QyxLQUFLQSxDQUFBLEVBQUc7SUFDTixJQUFJLENBQUN6QyxNQUFNLENBQUN5QyxLQUFLLENBQUMsQ0FBQztFQUNyQjtBQUNGO0FBRUFqRixlQUFlLENBQUNrRixRQUFRLENBQUUsaUJBQWlCLEVBQUVuRCxlQUFnQixDQUFDO0FBQzlELGVBQWVBLGVBQWUifQ==