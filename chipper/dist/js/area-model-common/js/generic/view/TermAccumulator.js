// Copyright 2017-2023, University of Colorado Boulder

/**
 * A key accumulator for handling general area-model terms.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import AbstractKeyAccumulator from '../../../../scenery-phet/js/keypad/AbstractKeyAccumulator.js';
import KeyID from '../../../../scenery-phet/js/keypad/KeyID.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import Term from '../../common/model/Term.js';

// constants
const NONZERO_DIGIT_STRINGS = _.range(1, 10).map(n => `${n}`);
const DIGIT_STRINGS = _.range(0, 10).map(n => `${n}`);
class TermAccumulator extends AbstractKeyAccumulator {
  /**
   * @param {Property.<number>} digitCountProperty
   */
  constructor(digitCountProperty) {
    // Validators to be passed to AbstractKeyAccumulator
    // Whether a set of proposed keys is allowed, see https://github.com/phetsims/area-model-common/issues/138
    super([proposedKeys => {
      let xCount = 0;
      let digitCount = 0;
      proposedKeys.forEach(key => {
        if (key === KeyID.X || key === KeyID.X_SQUARED) {
          xCount++;
        }
        if (_.includes(DIGIT_STRINGS, key)) {
          digitCount++;
        }
      });
      return xCount <= 1 && digitCount <= digitCountProperty.value;
    }]);

    // @public {Property.<string>} - For display
    this.richStringProperty = new DerivedProperty([this.accumulatedKeysProperty], accumulatedKeys => accumulatedKeys.map(key => {
      if (key === KeyID.PLUS_MINUS) {
        return MathSymbols.UNARY_MINUS;
      } else if (key === KeyID.X) {
        return AreaModelCommonConstants.X_VARIABLE_RICH_STRING;
      } else if (key === KeyID.X_SQUARED) {
        return `${AreaModelCommonConstants.X_VARIABLE_RICH_STRING}<sup>2</sup>`;
      } else {
        return key;
      }
    }).join(''));

    // To adhere to the Accumulator interface
    this.stringProperty = this.richStringProperty;

    // @public {Property.<Term|null>} - The term used if 'enter' is pressed
    this.termProperty = new DerivedProperty([this.accumulatedKeysProperty], accumulatedKeys => {
      const lastKey = accumulatedKeys[accumulatedKeys.length - 1];
      let coefficient = 1;
      let power = 0;
      if (lastKey === KeyID.X) {
        power = 1;
        accumulatedKeys = accumulatedKeys.slice(0, accumulatedKeys.length - 1);
      } else if (lastKey === KeyID.X_SQUARED) {
        power = 2;
        accumulatedKeys = accumulatedKeys.slice(0, accumulatedKeys.length - 1);
      }
      if (accumulatedKeys[0] === KeyID.PLUS_MINUS) {
        accumulatedKeys = accumulatedKeys.slice(1);

        // handle -x
        if (accumulatedKeys.length === 0) {
          coefficient = -1;
        } else {
          accumulatedKeys = ['-'].concat(accumulatedKeys);
        }
      }
      const digitString = accumulatedKeys.join('');
      if (digitString === '' || digitString === '-') {
        if (power === 0) {
          return null;
        }
      } else {
        coefficient = Number(digitString);
      }
      return new Term(coefficient, power);
    });
  }

  /**
   * Handles what happens when a key is pressed and create proposed set of keys to be passed to Validator
   * @public
   * @override
   *
   * @param {KeyID} keyIdentifier - identifier for the key pressed
   */
  handleKeyPressed(keyIdentifier) {
    const currentKeys = this.accumulatedKeysProperty.get();

    // Whether we have a negative sign in our current input
    let negative = _.includes(currentKeys, KeyID.PLUS_MINUS);

    // The power of x (X or X_SQUARED) in our input (otherwise undefined). This keypad only allows one "power" of X,
    // e.g. 0, 1 or 2 (corresponding to multiplying times 1, x, x^2). This is the corresponding key for that power.
    let power = _.find(currentKeys, key => key === KeyID.X || key === KeyID.X_SQUARED);

    // All of the digits in our current input. (just numerical parts, not powers of x or negative signs)
    let digits = currentKeys.filter(key => _.includes(DIGIT_STRINGS, key));

    // Helpful booleans for what our pressed key is.
    const isDigit = _.includes(NONZERO_DIGIT_STRINGS, keyIdentifier);
    const isZero = keyIdentifier === KeyID.ZERO;
    const isBackspace = keyIdentifier === KeyID.BACKSPACE;
    const isPlusMinus = keyIdentifier === KeyID.PLUS_MINUS;
    const isX = keyIdentifier === KeyID.X;
    const isXSquared = keyIdentifier === KeyID.X_SQUARED;
    if (isBackspace) {
      if (power) {
        power = null;
      } else if (digits.length) {
        digits.pop();
      } else {
        negative = false;
      }
    } else if (isX || isXSquared) {
      if (!power) {
        power = keyIdentifier;
      }
    } else if (isPlusMinus) {
      negative = !negative;
    } else if (isZero) {
      if (digits[0] !== KeyID.ZERO) {
        digits.push(keyIdentifier);
      }
    } else if (isDigit) {
      if (digits[0] === KeyID.ZERO) {
        digits = [keyIdentifier];
      } else {
        digits.push(keyIdentifier);
      }
    } else {
      throw new Error(`unknown digit: ${keyIdentifier}`);
    }

    // Validate and update the keys
    const proposedKeys = (negative ? [KeyID.PLUS_MINUS] : []).concat(digits).concat(power ? [power] : []);
    this.validateKeys(proposedKeys) && this.updateKeys(proposedKeys);
  }
}
areaModelCommon.register('TermAccumulator', TermAccumulator);
export default TermAccumulator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJBYnN0cmFjdEtleUFjY3VtdWxhdG9yIiwiS2V5SUQiLCJNYXRoU3ltYm9scyIsImFyZWFNb2RlbENvbW1vbiIsIkFyZWFNb2RlbENvbW1vbkNvbnN0YW50cyIsIlRlcm0iLCJOT05aRVJPX0RJR0lUX1NUUklOR1MiLCJfIiwicmFuZ2UiLCJtYXAiLCJuIiwiRElHSVRfU1RSSU5HUyIsIlRlcm1BY2N1bXVsYXRvciIsImNvbnN0cnVjdG9yIiwiZGlnaXRDb3VudFByb3BlcnR5IiwicHJvcG9zZWRLZXlzIiwieENvdW50IiwiZGlnaXRDb3VudCIsImZvckVhY2giLCJrZXkiLCJYIiwiWF9TUVVBUkVEIiwiaW5jbHVkZXMiLCJ2YWx1ZSIsInJpY2hTdHJpbmdQcm9wZXJ0eSIsImFjY3VtdWxhdGVkS2V5c1Byb3BlcnR5IiwiYWNjdW11bGF0ZWRLZXlzIiwiUExVU19NSU5VUyIsIlVOQVJZX01JTlVTIiwiWF9WQVJJQUJMRV9SSUNIX1NUUklORyIsImpvaW4iLCJzdHJpbmdQcm9wZXJ0eSIsInRlcm1Qcm9wZXJ0eSIsImxhc3RLZXkiLCJsZW5ndGgiLCJjb2VmZmljaWVudCIsInBvd2VyIiwic2xpY2UiLCJjb25jYXQiLCJkaWdpdFN0cmluZyIsIk51bWJlciIsImhhbmRsZUtleVByZXNzZWQiLCJrZXlJZGVudGlmaWVyIiwiY3VycmVudEtleXMiLCJnZXQiLCJuZWdhdGl2ZSIsImZpbmQiLCJkaWdpdHMiLCJmaWx0ZXIiLCJpc0RpZ2l0IiwiaXNaZXJvIiwiWkVSTyIsImlzQmFja3NwYWNlIiwiQkFDS1NQQUNFIiwiaXNQbHVzTWludXMiLCJpc1giLCJpc1hTcXVhcmVkIiwicG9wIiwicHVzaCIsIkVycm9yIiwidmFsaWRhdGVLZXlzIiwidXBkYXRlS2V5cyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVGVybUFjY3VtdWxhdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEga2V5IGFjY3VtdWxhdG9yIGZvciBoYW5kbGluZyBnZW5lcmFsIGFyZWEtbW9kZWwgdGVybXMuXHJcbiAqXHJcbiAqIE5PVEU6IFRoaXMgdHlwZSBpcyBkZXNpZ25lZCB0byBiZSBwZXJzaXN0ZW50LCBhbmQgd2lsbCBub3QgbmVlZCB0byByZWxlYXNlIHJlZmVyZW5jZXMgdG8gYXZvaWQgbWVtb3J5IGxlYWtzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHVcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEFic3RyYWN0S2V5QWNjdW11bGF0b3IgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleXBhZC9BYnN0cmFjdEtleUFjY3VtdWxhdG9yLmpzJztcclxuaW1wb3J0IEtleUlEIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlwYWQvS2V5SUQuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IGFyZWFNb2RlbENvbW1vbiBmcm9tICcuLi8uLi9hcmVhTW9kZWxDb21tb24uanMnO1xyXG5pbXBvcnQgQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9BcmVhTW9kZWxDb21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgVGVybSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvVGVybS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTk9OWkVST19ESUdJVF9TVFJJTkdTID0gXy5yYW5nZSggMSwgMTAgKS5tYXAoIG4gPT4gYCR7bn1gICk7XHJcbmNvbnN0IERJR0lUX1NUUklOR1MgPSBfLnJhbmdlKCAwLCAxMCApLm1hcCggbiA9PiBgJHtufWAgKTtcclxuXHJcbmNsYXNzIFRlcm1BY2N1bXVsYXRvciBleHRlbmRzIEFic3RyYWN0S2V5QWNjdW11bGF0b3Ige1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IGRpZ2l0Q291bnRQcm9wZXJ0eVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBkaWdpdENvdW50UHJvcGVydHkgKSB7XHJcblxyXG4gICAgLy8gVmFsaWRhdG9ycyB0byBiZSBwYXNzZWQgdG8gQWJzdHJhY3RLZXlBY2N1bXVsYXRvclxyXG4gICAgLy8gV2hldGhlciBhIHNldCBvZiBwcm9wb3NlZCBrZXlzIGlzIGFsbG93ZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXJlYS1tb2RlbC1jb21tb24vaXNzdWVzLzEzOFxyXG4gICAgc3VwZXIoIFsgcHJvcG9zZWRLZXlzID0+IHtcclxuICAgICAgbGV0IHhDb3VudCA9IDA7XHJcbiAgICAgIGxldCBkaWdpdENvdW50ID0gMDtcclxuXHJcbiAgICAgIHByb3Bvc2VkS2V5cy5mb3JFYWNoKCBrZXkgPT4ge1xyXG4gICAgICAgIGlmICgga2V5ID09PSBLZXlJRC5YIHx8IGtleSA9PT0gS2V5SUQuWF9TUVVBUkVEICkge1xyXG4gICAgICAgICAgeENvdW50Kys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIF8uaW5jbHVkZXMoIERJR0lUX1NUUklOR1MsIGtleSApICkge1xyXG4gICAgICAgICAgZGlnaXRDb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgcmV0dXJuIHhDb3VudCA8PSAxICYmIGRpZ2l0Q291bnQgPD0gZGlnaXRDb3VudFByb3BlcnR5LnZhbHVlO1xyXG4gICAgfSBdICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPHN0cmluZz59IC0gRm9yIGRpc3BsYXlcclxuICAgIHRoaXMucmljaFN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmFjY3VtdWxhdGVkS2V5c1Byb3BlcnR5IF0sIGFjY3VtdWxhdGVkS2V5cyA9PiBhY2N1bXVsYXRlZEtleXMubWFwKCBrZXkgPT4ge1xyXG4gICAgICBpZiAoIGtleSA9PT0gS2V5SUQuUExVU19NSU5VUyApIHtcclxuICAgICAgICByZXR1cm4gTWF0aFN5bWJvbHMuVU5BUllfTUlOVVM7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGtleSA9PT0gS2V5SUQuWCApIHtcclxuICAgICAgICByZXR1cm4gQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLlhfVkFSSUFCTEVfUklDSF9TVFJJTkc7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGtleSA9PT0gS2V5SUQuWF9TUVVBUkVEICkge1xyXG4gICAgICAgIHJldHVybiBgJHtBcmVhTW9kZWxDb21tb25Db25zdGFudHMuWF9WQVJJQUJMRV9SSUNIX1NUUklOR308c3VwPjI8L3N1cD5gO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBrZXk7XHJcbiAgICAgIH1cclxuICAgIH0gKS5qb2luKCAnJyApICk7XHJcblxyXG4gICAgLy8gVG8gYWRoZXJlIHRvIHRoZSBBY2N1bXVsYXRvciBpbnRlcmZhY2VcclxuICAgIHRoaXMuc3RyaW5nUHJvcGVydHkgPSB0aGlzLnJpY2hTdHJpbmdQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48VGVybXxudWxsPn0gLSBUaGUgdGVybSB1c2VkIGlmICdlbnRlcicgaXMgcHJlc3NlZFxyXG4gICAgdGhpcy50ZXJtUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMuYWNjdW11bGF0ZWRLZXlzUHJvcGVydHkgXSwgYWNjdW11bGF0ZWRLZXlzID0+IHtcclxuICAgICAgY29uc3QgbGFzdEtleSA9IGFjY3VtdWxhdGVkS2V5c1sgYWNjdW11bGF0ZWRLZXlzLmxlbmd0aCAtIDEgXTtcclxuXHJcbiAgICAgIGxldCBjb2VmZmljaWVudCA9IDE7XHJcbiAgICAgIGxldCBwb3dlciA9IDA7XHJcbiAgICAgIGlmICggbGFzdEtleSA9PT0gS2V5SUQuWCApIHtcclxuICAgICAgICBwb3dlciA9IDE7XHJcbiAgICAgICAgYWNjdW11bGF0ZWRLZXlzID0gYWNjdW11bGF0ZWRLZXlzLnNsaWNlKCAwLCBhY2N1bXVsYXRlZEtleXMubGVuZ3RoIC0gMSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBsYXN0S2V5ID09PSBLZXlJRC5YX1NRVUFSRUQgKSB7XHJcbiAgICAgICAgcG93ZXIgPSAyO1xyXG4gICAgICAgIGFjY3VtdWxhdGVkS2V5cyA9IGFjY3VtdWxhdGVkS2V5cy5zbGljZSggMCwgYWNjdW11bGF0ZWRLZXlzLmxlbmd0aCAtIDEgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGFjY3VtdWxhdGVkS2V5c1sgMCBdID09PSBLZXlJRC5QTFVTX01JTlVTICkge1xyXG4gICAgICAgIGFjY3VtdWxhdGVkS2V5cyA9IGFjY3VtdWxhdGVkS2V5cy5zbGljZSggMSApO1xyXG5cclxuICAgICAgICAvLyBoYW5kbGUgLXhcclxuICAgICAgICBpZiAoIGFjY3VtdWxhdGVkS2V5cy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgICBjb2VmZmljaWVudCA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGFjY3VtdWxhdGVkS2V5cyA9IFsgJy0nIF0uY29uY2F0KCBhY2N1bXVsYXRlZEtleXMgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGRpZ2l0U3RyaW5nID0gYWNjdW11bGF0ZWRLZXlzLmpvaW4oICcnICk7XHJcbiAgICAgIGlmICggZGlnaXRTdHJpbmcgPT09ICcnIHx8IGRpZ2l0U3RyaW5nID09PSAnLScgKSB7XHJcbiAgICAgICAgaWYgKCBwb3dlciA9PT0gMCApIHtcclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjb2VmZmljaWVudCA9IE51bWJlciggZGlnaXRTdHJpbmcgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIG5ldyBUZXJtKCBjb2VmZmljaWVudCwgcG93ZXIgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgd2hhdCBoYXBwZW5zIHdoZW4gYSBrZXkgaXMgcHJlc3NlZCBhbmQgY3JlYXRlIHByb3Bvc2VkIHNldCBvZiBrZXlzIHRvIGJlIHBhc3NlZCB0byBWYWxpZGF0b3JcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0tleUlEfSBrZXlJZGVudGlmaWVyIC0gaWRlbnRpZmllciBmb3IgdGhlIGtleSBwcmVzc2VkXHJcbiAgICovXHJcbiAgaGFuZGxlS2V5UHJlc3NlZCgga2V5SWRlbnRpZmllciApIHtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50S2V5cyA9IHRoaXMuYWNjdW11bGF0ZWRLZXlzUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgLy8gV2hldGhlciB3ZSBoYXZlIGEgbmVnYXRpdmUgc2lnbiBpbiBvdXIgY3VycmVudCBpbnB1dFxyXG4gICAgbGV0IG5lZ2F0aXZlID0gXy5pbmNsdWRlcyggY3VycmVudEtleXMsIEtleUlELlBMVVNfTUlOVVMgKTtcclxuXHJcbiAgICAvLyBUaGUgcG93ZXIgb2YgeCAoWCBvciBYX1NRVUFSRUQpIGluIG91ciBpbnB1dCAob3RoZXJ3aXNlIHVuZGVmaW5lZCkuIFRoaXMga2V5cGFkIG9ubHkgYWxsb3dzIG9uZSBcInBvd2VyXCIgb2YgWCxcclxuICAgIC8vIGUuZy4gMCwgMSBvciAyIChjb3JyZXNwb25kaW5nIHRvIG11bHRpcGx5aW5nIHRpbWVzIDEsIHgsIHheMikuIFRoaXMgaXMgdGhlIGNvcnJlc3BvbmRpbmcga2V5IGZvciB0aGF0IHBvd2VyLlxyXG4gICAgbGV0IHBvd2VyID0gXy5maW5kKCBjdXJyZW50S2V5cywga2V5ID0+IGtleSA9PT0gS2V5SUQuWCB8fCBrZXkgPT09IEtleUlELlhfU1FVQVJFRCApO1xyXG5cclxuICAgIC8vIEFsbCBvZiB0aGUgZGlnaXRzIGluIG91ciBjdXJyZW50IGlucHV0LiAoanVzdCBudW1lcmljYWwgcGFydHMsIG5vdCBwb3dlcnMgb2YgeCBvciBuZWdhdGl2ZSBzaWducylcclxuICAgIGxldCBkaWdpdHMgPSBjdXJyZW50S2V5cy5maWx0ZXIoIGtleSA9PiBfLmluY2x1ZGVzKCBESUdJVF9TVFJJTkdTLCBrZXkgKSApO1xyXG5cclxuICAgIC8vIEhlbHBmdWwgYm9vbGVhbnMgZm9yIHdoYXQgb3VyIHByZXNzZWQga2V5IGlzLlxyXG4gICAgY29uc3QgaXNEaWdpdCA9IF8uaW5jbHVkZXMoIE5PTlpFUk9fRElHSVRfU1RSSU5HUywga2V5SWRlbnRpZmllciApO1xyXG4gICAgY29uc3QgaXNaZXJvID0ga2V5SWRlbnRpZmllciA9PT0gS2V5SUQuWkVSTztcclxuICAgIGNvbnN0IGlzQmFja3NwYWNlID0ga2V5SWRlbnRpZmllciA9PT0gS2V5SUQuQkFDS1NQQUNFO1xyXG4gICAgY29uc3QgaXNQbHVzTWludXMgPSBrZXlJZGVudGlmaWVyID09PSBLZXlJRC5QTFVTX01JTlVTO1xyXG4gICAgY29uc3QgaXNYID0ga2V5SWRlbnRpZmllciA9PT0gS2V5SUQuWDtcclxuICAgIGNvbnN0IGlzWFNxdWFyZWQgPSBrZXlJZGVudGlmaWVyID09PSBLZXlJRC5YX1NRVUFSRUQ7XHJcblxyXG4gICAgaWYgKCBpc0JhY2tzcGFjZSApIHtcclxuICAgICAgaWYgKCBwb3dlciApIHtcclxuICAgICAgICBwb3dlciA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGRpZ2l0cy5sZW5ndGggKSB7XHJcbiAgICAgICAgZGlnaXRzLnBvcCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIG5lZ2F0aXZlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBpc1ggfHwgaXNYU3F1YXJlZCApIHtcclxuICAgICAgaWYgKCAhcG93ZXIgKSB7XHJcbiAgICAgICAgcG93ZXIgPSBrZXlJZGVudGlmaWVyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggaXNQbHVzTWludXMgKSB7XHJcbiAgICAgIG5lZ2F0aXZlID0gIW5lZ2F0aXZlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGlzWmVybyApIHtcclxuICAgICAgaWYgKCBkaWdpdHNbIDAgXSAhPT0gS2V5SUQuWkVSTyApIHtcclxuICAgICAgICBkaWdpdHMucHVzaCgga2V5SWRlbnRpZmllciApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggaXNEaWdpdCApIHtcclxuICAgICAgaWYgKCBkaWdpdHNbIDAgXSA9PT0gS2V5SUQuWkVSTyApIHtcclxuICAgICAgICBkaWdpdHMgPSBbIGtleUlkZW50aWZpZXIgXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBkaWdpdHMucHVzaCgga2V5SWRlbnRpZmllciApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5rbm93biBkaWdpdDogJHtrZXlJZGVudGlmaWVyfWAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBWYWxpZGF0ZSBhbmQgdXBkYXRlIHRoZSBrZXlzXHJcbiAgICBjb25zdCBwcm9wb3NlZEtleXMgPSAoIG5lZ2F0aXZlID8gWyBLZXlJRC5QTFVTX01JTlVTIF0gOiBbXSApLmNvbmNhdCggZGlnaXRzICkuY29uY2F0KCBwb3dlciA/IFsgcG93ZXIgXSA6IFtdICk7XHJcbiAgICB0aGlzLnZhbGlkYXRlS2V5cyggcHJvcG9zZWRLZXlzICkgJiYgdGhpcy51cGRhdGVLZXlzKCBwcm9wb3NlZEtleXMgKTtcclxuICB9XHJcbn1cclxuXHJcbmFyZWFNb2RlbENvbW1vbi5yZWdpc3RlciggJ1Rlcm1BY2N1bXVsYXRvcicsIFRlcm1BY2N1bXVsYXRvciApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGVybUFjY3VtdWxhdG9yOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxzQkFBc0IsTUFBTSw4REFBOEQ7QUFDakcsT0FBT0MsS0FBSyxNQUFNLDZDQUE2QztBQUMvRCxPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0Msd0JBQXdCLE1BQU0sMENBQTBDO0FBQy9FLE9BQU9DLElBQUksTUFBTSw0QkFBNEI7O0FBRTdDO0FBQ0EsTUFBTUMscUJBQXFCLEdBQUdDLENBQUMsQ0FBQ0MsS0FBSyxDQUFFLENBQUMsRUFBRSxFQUFHLENBQUMsQ0FBQ0MsR0FBRyxDQUFFQyxDQUFDLElBQUssR0FBRUEsQ0FBRSxFQUFFLENBQUM7QUFDakUsTUFBTUMsYUFBYSxHQUFHSixDQUFDLENBQUNDLEtBQUssQ0FBRSxDQUFDLEVBQUUsRUFBRyxDQUFDLENBQUNDLEdBQUcsQ0FBRUMsQ0FBQyxJQUFLLEdBQUVBLENBQUUsRUFBRSxDQUFDO0FBRXpELE1BQU1FLGVBQWUsU0FBU1osc0JBQXNCLENBQUM7RUFDbkQ7QUFDRjtBQUNBO0VBQ0VhLFdBQVdBLENBQUVDLGtCQUFrQixFQUFHO0lBRWhDO0lBQ0E7SUFDQSxLQUFLLENBQUUsQ0FBRUMsWUFBWSxJQUFJO01BQ3ZCLElBQUlDLE1BQU0sR0FBRyxDQUFDO01BQ2QsSUFBSUMsVUFBVSxHQUFHLENBQUM7TUFFbEJGLFlBQVksQ0FBQ0csT0FBTyxDQUFFQyxHQUFHLElBQUk7UUFDM0IsSUFBS0EsR0FBRyxLQUFLbEIsS0FBSyxDQUFDbUIsQ0FBQyxJQUFJRCxHQUFHLEtBQUtsQixLQUFLLENBQUNvQixTQUFTLEVBQUc7VUFDaERMLE1BQU0sRUFBRTtRQUNWO1FBRUEsSUFBS1QsQ0FBQyxDQUFDZSxRQUFRLENBQUVYLGFBQWEsRUFBRVEsR0FBSSxDQUFDLEVBQUc7VUFDdENGLFVBQVUsRUFBRTtRQUNkO01BQ0YsQ0FBRSxDQUFDO01BRUgsT0FBT0QsTUFBTSxJQUFJLENBQUMsSUFBSUMsVUFBVSxJQUFJSCxrQkFBa0IsQ0FBQ1MsS0FBSztJQUM5RCxDQUFDLENBQUcsQ0FBQzs7SUFFTDtJQUNBLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUcsSUFBSXpCLGVBQWUsQ0FBRSxDQUFFLElBQUksQ0FBQzBCLHVCQUF1QixDQUFFLEVBQUVDLGVBQWUsSUFBSUEsZUFBZSxDQUFDakIsR0FBRyxDQUFFVSxHQUFHLElBQUk7TUFDOUgsSUFBS0EsR0FBRyxLQUFLbEIsS0FBSyxDQUFDMEIsVUFBVSxFQUFHO1FBQzlCLE9BQU96QixXQUFXLENBQUMwQixXQUFXO01BQ2hDLENBQUMsTUFDSSxJQUFLVCxHQUFHLEtBQUtsQixLQUFLLENBQUNtQixDQUFDLEVBQUc7UUFDMUIsT0FBT2hCLHdCQUF3QixDQUFDeUIsc0JBQXNCO01BQ3hELENBQUMsTUFDSSxJQUFLVixHQUFHLEtBQUtsQixLQUFLLENBQUNvQixTQUFTLEVBQUc7UUFDbEMsT0FBUSxHQUFFakIsd0JBQXdCLENBQUN5QixzQkFBdUIsY0FBYTtNQUN6RSxDQUFDLE1BQ0k7UUFDSCxPQUFPVixHQUFHO01BQ1o7SUFDRixDQUFFLENBQUMsQ0FBQ1csSUFBSSxDQUFFLEVBQUcsQ0FBRSxDQUFDOztJQUVoQjtJQUNBLElBQUksQ0FBQ0MsY0FBYyxHQUFHLElBQUksQ0FBQ1Asa0JBQWtCOztJQUU3QztJQUNBLElBQUksQ0FBQ1EsWUFBWSxHQUFHLElBQUlqQyxlQUFlLENBQUUsQ0FBRSxJQUFJLENBQUMwQix1QkFBdUIsQ0FBRSxFQUFFQyxlQUFlLElBQUk7TUFDNUYsTUFBTU8sT0FBTyxHQUFHUCxlQUFlLENBQUVBLGVBQWUsQ0FBQ1EsTUFBTSxHQUFHLENBQUMsQ0FBRTtNQUU3RCxJQUFJQyxXQUFXLEdBQUcsQ0FBQztNQUNuQixJQUFJQyxLQUFLLEdBQUcsQ0FBQztNQUNiLElBQUtILE9BQU8sS0FBS2hDLEtBQUssQ0FBQ21CLENBQUMsRUFBRztRQUN6QmdCLEtBQUssR0FBRyxDQUFDO1FBQ1RWLGVBQWUsR0FBR0EsZUFBZSxDQUFDVyxLQUFLLENBQUUsQ0FBQyxFQUFFWCxlQUFlLENBQUNRLE1BQU0sR0FBRyxDQUFFLENBQUM7TUFDMUUsQ0FBQyxNQUNJLElBQUtELE9BQU8sS0FBS2hDLEtBQUssQ0FBQ29CLFNBQVMsRUFBRztRQUN0Q2UsS0FBSyxHQUFHLENBQUM7UUFDVFYsZUFBZSxHQUFHQSxlQUFlLENBQUNXLEtBQUssQ0FBRSxDQUFDLEVBQUVYLGVBQWUsQ0FBQ1EsTUFBTSxHQUFHLENBQUUsQ0FBQztNQUMxRTtNQUNBLElBQUtSLGVBQWUsQ0FBRSxDQUFDLENBQUUsS0FBS3pCLEtBQUssQ0FBQzBCLFVBQVUsRUFBRztRQUMvQ0QsZUFBZSxHQUFHQSxlQUFlLENBQUNXLEtBQUssQ0FBRSxDQUFFLENBQUM7O1FBRTVDO1FBQ0EsSUFBS1gsZUFBZSxDQUFDUSxNQUFNLEtBQUssQ0FBQyxFQUFHO1VBQ2xDQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsTUFDSTtVQUNIVCxlQUFlLEdBQUcsQ0FBRSxHQUFHLENBQUUsQ0FBQ1ksTUFBTSxDQUFFWixlQUFnQixDQUFDO1FBQ3JEO01BQ0Y7TUFFQSxNQUFNYSxXQUFXLEdBQUdiLGVBQWUsQ0FBQ0ksSUFBSSxDQUFFLEVBQUcsQ0FBQztNQUM5QyxJQUFLUyxXQUFXLEtBQUssRUFBRSxJQUFJQSxXQUFXLEtBQUssR0FBRyxFQUFHO1FBQy9DLElBQUtILEtBQUssS0FBSyxDQUFDLEVBQUc7VUFDakIsT0FBTyxJQUFJO1FBQ2I7TUFDRixDQUFDLE1BQ0k7UUFDSEQsV0FBVyxHQUFHSyxNQUFNLENBQUVELFdBQVksQ0FBQztNQUNyQztNQUVBLE9BQU8sSUFBSWxDLElBQUksQ0FBRThCLFdBQVcsRUFBRUMsS0FBTSxDQUFDO0lBQ3ZDLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VLLGdCQUFnQkEsQ0FBRUMsYUFBYSxFQUFHO0lBRWhDLE1BQU1DLFdBQVcsR0FBRyxJQUFJLENBQUNsQix1QkFBdUIsQ0FBQ21CLEdBQUcsQ0FBQyxDQUFDOztJQUV0RDtJQUNBLElBQUlDLFFBQVEsR0FBR3RDLENBQUMsQ0FBQ2UsUUFBUSxDQUFFcUIsV0FBVyxFQUFFMUMsS0FBSyxDQUFDMEIsVUFBVyxDQUFDOztJQUUxRDtJQUNBO0lBQ0EsSUFBSVMsS0FBSyxHQUFHN0IsQ0FBQyxDQUFDdUMsSUFBSSxDQUFFSCxXQUFXLEVBQUV4QixHQUFHLElBQUlBLEdBQUcsS0FBS2xCLEtBQUssQ0FBQ21CLENBQUMsSUFBSUQsR0FBRyxLQUFLbEIsS0FBSyxDQUFDb0IsU0FBVSxDQUFDOztJQUVwRjtJQUNBLElBQUkwQixNQUFNLEdBQUdKLFdBQVcsQ0FBQ0ssTUFBTSxDQUFFN0IsR0FBRyxJQUFJWixDQUFDLENBQUNlLFFBQVEsQ0FBRVgsYUFBYSxFQUFFUSxHQUFJLENBQUUsQ0FBQzs7SUFFMUU7SUFDQSxNQUFNOEIsT0FBTyxHQUFHMUMsQ0FBQyxDQUFDZSxRQUFRLENBQUVoQixxQkFBcUIsRUFBRW9DLGFBQWMsQ0FBQztJQUNsRSxNQUFNUSxNQUFNLEdBQUdSLGFBQWEsS0FBS3pDLEtBQUssQ0FBQ2tELElBQUk7SUFDM0MsTUFBTUMsV0FBVyxHQUFHVixhQUFhLEtBQUt6QyxLQUFLLENBQUNvRCxTQUFTO0lBQ3JELE1BQU1DLFdBQVcsR0FBR1osYUFBYSxLQUFLekMsS0FBSyxDQUFDMEIsVUFBVTtJQUN0RCxNQUFNNEIsR0FBRyxHQUFHYixhQUFhLEtBQUt6QyxLQUFLLENBQUNtQixDQUFDO0lBQ3JDLE1BQU1vQyxVQUFVLEdBQUdkLGFBQWEsS0FBS3pDLEtBQUssQ0FBQ29CLFNBQVM7SUFFcEQsSUFBSytCLFdBQVcsRUFBRztNQUNqQixJQUFLaEIsS0FBSyxFQUFHO1FBQ1hBLEtBQUssR0FBRyxJQUFJO01BQ2QsQ0FBQyxNQUNJLElBQUtXLE1BQU0sQ0FBQ2IsTUFBTSxFQUFHO1FBQ3hCYSxNQUFNLENBQUNVLEdBQUcsQ0FBQyxDQUFDO01BQ2QsQ0FBQyxNQUNJO1FBQ0haLFFBQVEsR0FBRyxLQUFLO01BQ2xCO0lBQ0YsQ0FBQyxNQUNJLElBQUtVLEdBQUcsSUFBSUMsVUFBVSxFQUFHO01BQzVCLElBQUssQ0FBQ3BCLEtBQUssRUFBRztRQUNaQSxLQUFLLEdBQUdNLGFBQWE7TUFDdkI7SUFDRixDQUFDLE1BQ0ksSUFBS1ksV0FBVyxFQUFHO01BQ3RCVCxRQUFRLEdBQUcsQ0FBQ0EsUUFBUTtJQUN0QixDQUFDLE1BQ0ksSUFBS0ssTUFBTSxFQUFHO01BQ2pCLElBQUtILE1BQU0sQ0FBRSxDQUFDLENBQUUsS0FBSzlDLEtBQUssQ0FBQ2tELElBQUksRUFBRztRQUNoQ0osTUFBTSxDQUFDVyxJQUFJLENBQUVoQixhQUFjLENBQUM7TUFDOUI7SUFDRixDQUFDLE1BQ0ksSUFBS08sT0FBTyxFQUFHO01BQ2xCLElBQUtGLE1BQU0sQ0FBRSxDQUFDLENBQUUsS0FBSzlDLEtBQUssQ0FBQ2tELElBQUksRUFBRztRQUNoQ0osTUFBTSxHQUFHLENBQUVMLGFBQWEsQ0FBRTtNQUM1QixDQUFDLE1BQ0k7UUFDSEssTUFBTSxDQUFDVyxJQUFJLENBQUVoQixhQUFjLENBQUM7TUFDOUI7SUFDRixDQUFDLE1BQ0k7TUFDSCxNQUFNLElBQUlpQixLQUFLLENBQUcsa0JBQWlCakIsYUFBYyxFQUFFLENBQUM7SUFDdEQ7O0lBRUE7SUFDQSxNQUFNM0IsWUFBWSxHQUFHLENBQUU4QixRQUFRLEdBQUcsQ0FBRTVDLEtBQUssQ0FBQzBCLFVBQVUsQ0FBRSxHQUFHLEVBQUUsRUFBR1csTUFBTSxDQUFFUyxNQUFPLENBQUMsQ0FBQ1QsTUFBTSxDQUFFRixLQUFLLEdBQUcsQ0FBRUEsS0FBSyxDQUFFLEdBQUcsRUFBRyxDQUFDO0lBQy9HLElBQUksQ0FBQ3dCLFlBQVksQ0FBRTdDLFlBQWEsQ0FBQyxJQUFJLElBQUksQ0FBQzhDLFVBQVUsQ0FBRTlDLFlBQWEsQ0FBQztFQUN0RTtBQUNGO0FBRUFaLGVBQWUsQ0FBQzJELFFBQVEsQ0FBRSxpQkFBaUIsRUFBRWxELGVBQWdCLENBQUM7QUFFOUQsZUFBZUEsZUFBZSJ9